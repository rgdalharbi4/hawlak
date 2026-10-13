"""اختبارات الوكيل بدون شبكة ولا مفاتيح (نستبدل الاتصال بالخدمات بردود جاهزة).

شغّليها من مجلد backend:
    python -m pytest ../tests -q
"""
import json
import sys
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app import agent, config, store  # noqa: E402
from app.main import app  # noqa: E402
from app.providers import llm, stt, tts  # noqa: E402

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_env(monkeypatch, tmp_path):
    monkeypatch.setenv("HAWLAK_DB", str(tmp_path / "t.db"))
    from app import main as _m
    _m.limiter.hits.clear()
    for k in ("LLM_PROVIDER", "STT_PROVIDER", "TTS_PROVIDER", "LLM_MODEL", "STT_MODEL", "LLM_API_KEY", "STT_API_KEY", "TTS_API_KEY", "TTS_VOICE", "TTS_REGION", "TTS_MODEL", "TTS_RATE"):
        monkeypatch.delenv(k, raising=False)


def test_system_prompt_has_places_and_profile():
    p = agent.build_system_prompt({"first": "yes", "group": "kids", "interests": ["local"], "budget": "eco"})
    assert "s1 |" in p and "مسجد قباء" in p
    assert "First visit to Madinah: yes" in p and "with children" in p and "economical" in p
    assert "Never invent a place" in p


def test_parse_reply_filters_unknown_places():
    raw = json.dumps({"id": "Halo", "ar": "مرحبا", "place_ids": ["s1", "zzz", "s1", "s2", "e1", "f1"]})
    r = agent.parse_reply(raw)
    assert r["place_ids"] == ["s1", "s2", "e1"]  # بلا مكرر وبلا مجهول وبحد أقصى ٣


def test_parse_reply_survives_bad_output():
    assert agent.parse_reply('نص قبل {"id":"A","ar":"ب","place_ids":[]} نص بعد')["id"] == "A"
    r = agent.parse_reply("not json at all")
    assert r["id"] == "not json at all" and r["place_ids"] == []


def test_ask_endpoint_with_fake_provider():
    r = client.post("/api/ask", json={"message": "Halo", "profile": {"group": "family"}})
    assert r.status_code == 200
    j = r.json()
    assert set(j) == {"id", "ar", "place_ids", "source"} and "Halo" in j["id"]


def test_ask_rejects_empty_message():
    assert client.post("/api/ask", json={"message": ""}).status_code == 422


def test_config_status_never_returns_values(monkeypatch):
    monkeypatch.setenv("LLM_API_KEY", "SECRET-VALUE-123")
    r = client.get("/api/config/status")
    assert "SECRET-VALUE-123" not in r.text
    assert r.json()["keys_present"]["LLM_API_KEY"] is True


def _mock(handler):
    return httpx.MockTransport(handler)


def test_groq_request_shape(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "groq")
    monkeypatch.setenv("LLM_API_KEY", "k")
    seen = {}

    def handler(req: httpx.Request):
        seen["url"] = str(req.url)
        seen["auth"] = req.headers["authorization"]
        seen["body"] = json.loads(req.content)
        return httpx.Response(200, json={"choices": [{"message": {"content": '{"id":"ok","ar":"تم","place_ids":["s1"]}'}}]})

    monkeypatch.setattr(llm, "HTTP_TRANSPORT", _mock(handler))
    r = agent.ask_agent("mau ke mana?", [{"role": "assistant", "content": "Halo"}], {})
    assert r == {"id": "ok", "ar": "تم", "place_ids": ["s1"], "source": "llm"}
    assert seen["url"].endswith("/openai/v1/chat/completions") and seen["auth"] == "Bearer k"
    msgs = seen["body"]["messages"]
    assert msgs[0]["role"] == "system" and msgs[-1] == {"role": "user", "content": "mau ke mana?"}
    assert seen["body"]["response_format"] == {"type": "json_object"}


def test_gemini_and_anthropic_shapes(monkeypatch):
    monkeypatch.setenv("LLM_API_KEY", "k")
    out = '{"id":"a","ar":"ب","place_ids":[]}'

    monkeypatch.setenv("LLM_PROVIDER", "gemini")
    monkeypatch.setattr(llm, "HTTP_TRANSPORT", _mock(lambda req: httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": out}]}}]})))
    assert agent.ask_agent("hi")["id"] == "a"

    monkeypatch.setenv("LLM_PROVIDER", "anthropic")
    monkeypatch.setattr(llm, "HTTP_TRANSPORT", _mock(lambda req: httpx.Response(200, json={"content": [{"text": out}]})))
    assert agent.ask_agent("hi")["id"] == "a"


def test_missing_key_gives_clean_error(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "groq")
    r = client.post("/api/ask", json={"message": "hi"})
    assert r.status_code == 502 and r.json()["detail"] == "تعذّر الحصول على رد من الوكيل"


def test_stt_groq_uses_indonesian(monkeypatch):
    monkeypatch.setenv("STT_PROVIDER", "groq")
    monkeypatch.setenv("STT_API_KEY", "k")
    seen = {}

    def handler(req: httpx.Request):
        seen["body"] = req.content
        return httpx.Response(200, json={"text": " Selamat pagi "})

    monkeypatch.setattr(stt, "HTTP_TRANSPORT", _mock(handler))
    r = client.post("/api/stt", files={"audio": ("a.webm", b"abc", "audio/webm")}, data={"language": "id"})
    assert r.status_code == 200 and r.json() == {"text": "Selamat pagi"}
    assert b'name="language"' in seen["body"] and b"whisper-large-v3-turbo" in seen["body"]


def test_tts_not_enabled_returns_501():
    assert client.post("/api/tts", json={"text": "Halo"}).status_code == 501


# ---------- منع الهلوسة ----------
def _fake_llm(replies):
    """يرجع ردودًا جاهزة بالترتيب، ويسجّل عدد الاستدعاءات."""
    calls = []

    def f(system, messages):
        calls.append(messages)
        return replies[min(len(calls) - 1, len(replies) - 1)]
    f.calls = calls
    return f


def _j(id_, ar="", ids=()):
    return json.dumps({"id": id_, "ar": ar, "place_ids": list(ids)}, ensure_ascii=False)


@pytest.mark.parametrize("q", ["Berapa harga makan di sana?", "jam buka restoran Old Gold?", "restoran terbaik apa?", "كم سعر الأكل؟", "ما ساعات العمل؟", "nomor telepon restoran?"])
def test_unsupported_questions_never_reach_the_model(monkeypatch, q):
    def boom(*a, **k):
        raise AssertionError("النموذج لا يجب أن يُستدعى لسؤال عن معلومة لا نملكها")
    monkeypatch.setattr(agent, "ask_llm", boom)
    r = agent.ask_agent(q)
    assert r["source"] == "guard" and r["place_ids"] == [] and "belum punya informasi" in r["id"]


def test_invented_price_is_rejected_then_fixed(monkeypatch):
    f = _fake_llm([_j("Coba Old Gold, murah, hanya 15 riyal", "جرب أولد قولد", ["f3"]), _j("Coba Old Gold di dekat Quba.", "جرب أولد قولد قرب قباء", ["f3"])])
    monkeypatch.setattr(agent, "ask_llm", f)
    r = agent.ask_agent("mau makan siang")
    assert len(f.calls) == 2 and r["source"] == "llm" and "riyal" not in r["id"].lower()
    assert "price/rating" in f.calls[1][-1]["content"]  # التنبيه أُرسل للنموذج


def test_persistent_hallucination_falls_back_to_data_only(monkeypatch):
    bad = _j("Old Gold murah, 15 riyal, bintang 5", "رخيص", ["f3"])
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([bad, bad]))
    r = agent.ask_agent("mau makan")
    assert r["source"] == "fallback" and r["place_ids"] == ["f3"] and "15" not in r["id"] and "أولد قولد" in r["ar"]


def test_invented_numbers_are_caught(monkeypatch):
    f = _fake_llm([_j("Jaraknya 800 meter dari hotelmu.", "المسافة", ["s1"]), _j("Masjid Quba cocok untukmu.", "مسجد قباء مناسب", ["s1"])])
    monkeypatch.setattr(agent, "ask_llm", f)
    assert agent.ask_agent("ke mana?")["id"] == "Masjid Quba cocok untukmu."


def test_number_from_the_visitor_is_allowed(monkeypatch):
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([_j("Untuk 3 orang, coba Old Gold.", "لثلاثة أشخاص", ["f3"])]))
    r = agent.ask_agent("kami 3 orang, mau makan")
    assert r["source"] == "llm"


def test_place_named_in_text_is_added_to_place_ids(monkeypatch):
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([_j("Kunjungi مسجد قباء dulu.", "زر مسجد قباء أولًا", [])]))
    assert agent.ask_agent("tempat bersejarah?")["place_ids"] == ["s1"]


def test_invented_place_ids_are_dropped(monkeypatch):
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([_j("Coba ini.", "جرب", ["fake99", "s2"])]))
    assert agent.ask_agent("apa saja?")["place_ids"] == ["s2"]


def test_prompt_forbids_guessing():
    p = agent.build_system_prompt({})
    assert "GROUNDING" in p and "never guess" in p and "do not write any number" in p.lower()


def test_hours_of_a_place_we_have_hours_for_goes_to_the_model(monkeypatch):
    f = _fake_llm([_j("Masjid Quba buka 24 jam.", "مسجد قباء مفتوح ٢٤ ساعة", ["s1"])])
    monkeypatch.setattr(agent, "ask_llm", f)
    r = agent.ask_agent("Jam berapa Masjid Quba buka?")
    assert len(f.calls) == 1 and r["source"] == "llm"


@pytest.mark.parametrize("q,needle", [
    ("Saya sakit dada, tolong!", "911"),
    ("Apa hukum shalat jamak bagi musafir?", "ulama"),
    ("Ceritakan tentang politik Arab Saudi.", "wisata"),
])
def test_emergency_religion_offtopic_are_fixed_answers(monkeypatch, q, needle):
    monkeypatch.setattr(agent, "ask_llm", lambda *a, **k: (_ for _ in ()).throw(AssertionError("no model")))
    r = agent.ask_agent(q)
    assert r["source"] == "guard" and needle in r["id"]


def test_polite_tolong_is_not_an_emergency(monkeypatch):
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([_j("Coba Old Gold.", "جرب أولد قولد", ["f3"])]))
    assert agent.ask_agent("Tolong carikan restoran dekat Quba")["source"] == "llm"


def test_prompt_uses_latin_names_notes_and_distances():
    p = agent.build_system_prompt({})
    assert "name_id: Masjid Quba" in p and "name_ar: مسجد قباء" in p
    assert "distance_to_Quba_Mosque: 90 m" in p
    assert "open all day and night (24 hours)" in p


def test_place_id_digits_are_not_allowed_numbers():
    # "3" يظهر في رقم المكان f3 فقط، لا يجب أن يصير رقمًا مسموحًا
    assert "3" not in agent._allowed_numbers("hi", ["f3"])


def test_rate_limit_is_retried(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "groq")
    monkeypatch.setenv("LLM_API_KEY", "k")
    monkeypatch.setattr(llm.time, "sleep", lambda s: None)
    n = {"c": 0}

    def handler(req):
        n["c"] += 1
        if n["c"] < 3:
            return httpx.Response(429, headers={"retry-after": "1"}, json={"error": "rate"})
        return httpx.Response(200, json={"choices": [{"message": {"content": _j("Halo", "مرحبا", [])}}]})

    monkeypatch.setattr(llm, "HTTP_TRANSPORT", _mock(handler))
    assert agent.ask_agent("Halo")["id"] == "Halo" and n["c"] == 3


def test_http_error_message_is_readable_and_has_no_key(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "groq")
    monkeypatch.setenv("LLM_API_KEY", "SECRET-XYZ")
    monkeypatch.setattr(llm, "HTTP_TRANSPORT", _mock(lambda req: httpx.Response(400, json={"error": "bad request"})))
    with pytest.raises(RuntimeError) as e:
        agent.ask_agent("Halo")
    assert "groq HTTP 400" in str(e.value) and "SECRET-XYZ" not in str(e.value)


def test_out_of_scope_services_get_a_fixed_answer(monkeypatch):
    monkeypatch.setattr(agent, "ask_llm", lambda *a, **k: (_ for _ in ()).throw(AssertionError("no model")))
    r = agent.ask_agent("Di mana toko oleh-oleh?")
    assert r["source"] == "guard" and "tempat bersejarah" in r["id"]


def test_disclaimer_is_added_for_unknown_attributes(monkeypatch):
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([_j("Coba Masjid Quba.", "جرب مسجد قباء", ["s1"])]))
    r = agent.ask_agent("Tempat apa yang cocok untuk orang tua lansia?")
    assert "belum punya data" in r["id"] and "لكبار السن" in r["ar"]


def test_no_disclaimer_when_model_already_says_it_lacks_data(monkeypatch):
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([_j("Maaf, saya belum punya informasi itu.", "عذرًا، لا أملك هذه المعلومات", ["e1"])]))
    r = agent.ask_agent("Apakah cocok untuk kursi roda?")
    assert "Catatan" not in r["id"]


def test_no_disclaimer_without_a_trigger(monkeypatch):
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([_j("Coba Masjid Quba.", "جرب مسجد قباء", ["s1"])]))
    assert "Catatan" not in agent.ask_agent("Mau ke mana?")["id"]


# ---------- الصوت (TTS) ----------
@pytest.fixture
def tts_env(monkeypatch, tmp_path):
    monkeypatch.setattr(tts, "CACHE_DIR", tmp_path / "tts")
    monkeypatch.setenv("TTS_API_KEY", "k")
    return monkeypatch


def test_tts_elevenlabs_shape(tts_env):
    tts_env.setenv("TTS_PROVIDER", "elevenlabs")
    tts_env.setenv("TTS_VOICE", "VOICE123")
    seen = {}

    def handler(req):
        seen["url"] = str(req.url)
        seen["key"] = req.headers["xi-api-key"]
        seen["body"] = json.loads(req.content)
        return httpx.Response(200, content=b"MP3DATA")

    tts_env.setattr(tts, "HTTP_TRANSPORT", _mock(handler))
    assert tts.synthesize("Halo") == b"MP3DATA"
    assert "/text-to-speech/VOICE123" in seen["url"] and seen["key"] == "k"
    assert seen["body"]["language_code"] == "id" and seen["body"]["voice_settings"]["speed"] == 0.9


def test_tts_elevenlabs_needs_voice(tts_env):
    tts_env.setenv("TTS_PROVIDER", "elevenlabs")
    with pytest.raises(RuntimeError, match="TTS_VOICE"):
        tts.synthesize("Halo")


def test_tts_azure_ssml_is_escaped_and_slower(tts_env):
    tts_env.setenv("TTS_PROVIDER", "azure")
    tts_env.setenv("TTS_REGION", "westeurope")
    seen = {}

    def handler(req):
        seen["url"] = str(req.url)
        seen["ssml"] = req.content.decode()
        seen["key"] = req.headers["ocp-apim-subscription-key"]
        return httpx.Response(200, content=b"AZ")

    tts_env.setattr(tts, "HTTP_TRANSPORT", _mock(handler))
    assert tts.synthesize("Tom & <Jerry>") == b"AZ"
    assert seen["url"].startswith("https://westeurope.tts.speech.microsoft.com") and seen["key"] == "k"
    assert "id-ID-ArdiNeural" in seen["ssml"] and "Tom &amp; &lt;Jerry&gt;" in seen["ssml"] and "rate='-10%'" in seen["ssml"]


def test_tts_google_decodes_base64(tts_env):
    import base64
    tts_env.setenv("TTS_PROVIDER", "google")
    seen = {}

    def handler(req):
        seen["body"] = json.loads(req.content)
        return httpx.Response(200, json={"audioContent": base64.b64encode(b"GOOG").decode()})

    tts_env.setattr(tts, "HTTP_TRANSPORT", _mock(handler))
    assert tts.synthesize("Halo") == b"GOOG"
    assert seen["body"]["voice"] == {"languageCode": "id-ID", "ssmlGender": "MALE"}
    assert seen["body"]["audioConfig"]["speakingRate"] == 0.9


def test_tts_second_call_comes_from_cache(tts_env):
    tts_env.setenv("TTS_PROVIDER", "google")
    import base64
    n = {"c": 0}

    def handler(req):
        n["c"] += 1
        return httpx.Response(200, json={"audioContent": base64.b64encode(b"X").decode()})

    tts_env.setattr(tts, "HTTP_TRANSPORT", _mock(handler))
    tts.synthesize("Halo"); tts.synthesize("Halo"); tts.synthesize("Halo lagi")
    assert n["c"] == 2


def test_tts_endpoint_returns_mp3(tts_env):
    tts_env.setenv("TTS_PROVIDER", "google")
    tts_env.setattr(tts, "PROVIDERS", {**tts.PROVIDERS, "google": lambda text, lang: b"ID3-audio"})
    r = client.post("/api/tts", json={"text": "Halo"})
    assert r.status_code == 200 and r.headers["content-type"] == "audio/mpeg" and r.content == b"ID3-audio"


def test_tts_error_is_clean(tts_env):
    tts_env.setenv("TTS_PROVIDER", "google")
    tts_env.setattr(tts, "HTTP_TRANSPORT", _mock(lambda req: httpx.Response(403, json={"error": "denied"})))
    assert client.post("/api/tts", json={"text": "Halo"}).status_code == 502


def test_clone_script_request_shape(tmp_path, monkeypatch):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend" / "scripts"))
    import clone_voice_elevenlabs as cv
    monkeypatch.setenv("TTS_API_KEY", "k")
    sample = tmp_path / "s.mp3"
    sample.write_bytes(b"AUDIO")
    seen = {}

    def handler(req):
        seen["url"] = str(req.url)
        seen["key"] = req.headers["xi-api-key"]
        seen["body"] = req.content
        return httpx.Response(200, json={"voice_id": "VID42"})

    assert cv.clone(sample, "Odin", transport=httpx.MockTransport(handler)) == "VID42"
    assert seen["url"].endswith("/v1/voices/add") and seen["key"] == "k"
    assert b'name="remove_background_noise"' in seen["body"] and b"true" in seen["body"] and b"AUDIO" in seen["body"]


def test_list_voices_script(monkeypatch):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend" / "scripts"))
    import list_voices_elevenlabs as lv
    monkeypatch.setenv("TTS_API_KEY", "k")
    t = httpx.MockTransport(lambda req: httpx.Response(200, json={"voices": [{"voice_id": "V1", "name": "Adam", "preview_url": "https://x/p.mp3", "labels": {"gender": "male"}}]}) if req.headers["xi-api-key"] == "k" else httpx.Response(401))
    assert lv.list_voices(t)[0]["voice_id"] == "V1"


def test_voice_match_pitch_estimate():
    import numpy as np
    from app import voice_match
    sr = 16000
    x = 0.3 * np.sin(2 * np.pi * 120 * np.arange(sr) / sr).astype("float32")
    assert abs(voice_match.median_f0(x, sr) - 120) < 4


def test_speech_text_expands_units_and_emergency_number():
    assert tts.speech_text("Sumur Aris 110\u202fm dari sana") == "Sumur Aris 110 meter dari sana"
    assert tts.speech_text("Sejauh 1,2 km") == "Sejauh 1,2 kilometer"
    assert tts.speech_text("Hubungi 911 segera") == "Hubungi sembilan satu satu segera"
    assert tts.speech_text("Masjid Quba") == "Masjid Quba"


def test_prompt_says_to_suggest_even_when_attribute_unknown():
    assert "DO NOT refuse" in agent.build_system_prompt({})


def test_groq_json_mode_failure_retries_without_json_mode(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "groq")
    monkeypatch.setenv("LLM_API_KEY", "k")
    bodies = []

    def handler(req):
        b = json.loads(req.content)
        bodies.append(b)
        if "response_format" in b:
            return httpx.Response(400, json={"error": {"code": "json_validate_failed", "message": "Failed to validate JSON"}})
        return httpx.Response(200, json={"choices": [{"message": {"content": 'نص {"id":"A","ar":"ب","place_ids":["s1"]} نص'}}]})

    monkeypatch.setattr(llm, "HTTP_TRANSPORT", _mock(handler))
    r = agent.ask_agent("mau ke mana?")
    assert len(bodies) == 2 and "response_format" not in bodies[1] and r["id"] == "A" and r["place_ids"] == ["s1"]


def test_no_double_disclaimer_when_model_says_it_has_no_info(monkeypatch):
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([_j("Saya tidak memiliki informasi apakah cocok untuk anak.", "ليس لدي معلومات", ["f3"])]))
    assert "Catatan" not in agent.ask_agent("restoran untuk anak")["id"]


# ---------- فلترة الميزانية ----------
def test_economical_budget_hides_non_economical_places_from_the_prompt():
    eco = agent.build_system_prompt({"budget": "eco"})
    opened = agent.build_system_prompt({"budget": "open"})
    assert "ورد المدينة" not in eco and "أشجار كافيه" in eco and "أولد قولد" in eco
    assert "ورد المدينة" in opened and "سقى" in opened


def test_non_economical_place_ids_are_dropped_for_economical_visitors(monkeypatch):
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([_j("Coba ini.", "جرب", ["e2", "s1"])]))
    assert agent.ask_agent("apa saja?", [], {"budget": "eco"})["place_ids"] == ["s1"]
    monkeypatch.setattr(agent, "ask_llm", _fake_llm([_j("Coba ini.", "جرب", ["e2", "s1"])]))
    assert agent.ask_agent("apa saja?", [], {"budget": "open"})["place_ids"] == ["e2", "s1"]


def test_places_endpoint_filters_by_budget():
    assert len(client.get("/api/places").json()) == 10
    eco = client.get("/api/places?budget=eco").json()
    assert len(eco) == 5 and all(p["eco"] for p in eco)
    assert len(client.get("/api/places?budget=open").json()) == 10


def test_prompt_prefers_chosen_interests():
    p = agent.build_system_prompt({"interests": ["local"], "budget": "open"})
    assert "Prefer the visitor's chosen interests" in p and "Interests: local experiences" in p


def test_frontend_files_are_revalidated_so_browsers_never_serve_stale_js():
    for path in ("/", "/js/screens/home.js", "/css/layout.css"):
        r = client.get(path)
        assert r.status_code == 200 and r.headers["cache-control"] == "no-cache", path
    assert "cache-control" not in client.get("/api/health").headers


def test_index_scripts_carry_a_version_so_stale_files_are_never_reused():
    r = client.get("/")
    assert r.status_code == 200 and r.headers["cache-control"] == "no-cache"
    assert 'src="js/main.js?v=' in r.text and 'href="css/base.css?v=' in r.text


def test_static_only_pages_redirect_to_the_real_server():
    """صفحة بلا خادم على الجهاز (مثل Live Server) تتحول للخادم الحقيقي على 8000."""
    main_js = (Path(__file__).resolve().parents[1] / "frontend" / "js" / "main.js").read_text(encoding="utf-8")
    assert "127.0.0.1:8000/api/health" in main_js and "location.replace" in main_js


# ---------- الزوار والمفضلة والحجز ----------
def _register(name="سارة", phone="+62 812-3456-789"):
    r = client.post("/api/visitor", json={"name": name, "phone": phone})
    assert r.status_code == 200, r.text
    return r.json()["token"]


def test_register_cleans_phone_and_returns_a_private_token():
    token = _register(phone="٠٥٠٠١٢٣٤٥٦٧")
    from app import store
    v = store.visitor_by_token(token)
    assert v["name"] == "سارة" and v["phone"] == "0500123456" + "7"


@pytest.mark.parametrize("body", [{"name": "س", "phone": "+628123456789"}, {"name": "سارة", "phone": "abc"}, {"name": "سارة", "phone": "123"}])
def test_register_rejects_bad_input(body):
    assert client.post("/api/visitor", json=body).status_code in (422,)


def test_favorites_need_a_valid_token_and_a_known_place():
    assert client.get("/api/favorites").status_code == 401
    assert client.post("/api/favorites", json={"place_id": "s1"}, headers={"X-Token": "bad"}).status_code == 401
    h = {"X-Token": _register()}
    assert client.post("/api/favorites", json={"place_id": "nope"}, headers=h).status_code == 422
    assert client.post("/api/favorites", json={"place_id": "s1"}, headers=h).json()["place_ids"] == ["s1"]
    client.post("/api/favorites", json={"place_id": "c1"}, headers=h)
    assert client.get("/api/favorites", headers=h).json()["place_ids"] == ["s1", "c1"]
    assert client.post("/api/favorites", json={"place_id": "s1", "on": False}, headers=h).json()["place_ids"] == ["c1"]


def test_registering_with_the_same_phone_never_exposes_another_visitors_favorites():
    h1 = {"X-Token": _register(phone="+628111111111")}
    client.post("/api/favorites", json={"place_id": "s1"}, headers=h1)
    h2 = {"X-Token": _register(phone="+628111111111")}  # نفس الرقم بدون تحقق برمز
    assert h1["X-Token"] != h2["X-Token"]
    assert client.get("/api/favorites", headers=h2).json()["place_ids"] == []


def test_booking_request_is_stored_as_pending_and_validated():
    h = {"X-Token": _register()}
    ok = client.post("/api/bookings", json={"place_id": "f3", "time": "19:30", "people": 4}, headers=h)
    assert ok.status_code == 200 and ok.json()["status"] == "pending"
    for bad in ({"place_id": "f3", "time": "25:00", "people": 2}, {"place_id": "f3", "time": "19:30", "people": 0}, {"place_id": "zz", "time": "19:30", "people": 2}):
        assert client.post("/api/bookings", json=bad, headers=h).status_code == 422
    assert client.post("/api/bookings", json={"place_id": "f3", "time": "19:30", "people": 2}).status_code == 401


def test_registration_is_rate_limited():
    codes = [client.post("/api/visitor", json={"name": "سارة", "phone": "+628123456789"}).status_code for _ in range(12)]
    assert codes[:10] == [200] * 10 and codes[10:] == [429, 429]


def test_admin_dashboard_requires_key_and_manages_booking_status(monkeypatch):
    h = {"X-Token": _register()}
    bid = client.post("/api/bookings", json={"place_id": "f3", "time": "19:30", "people": 4}, headers=h).json()["id"]
    monkeypatch.setattr(config, "get", lambda k, d="": "" if k == "ADMIN_KEY" else d)
    assert client.get("/api/admin/bookings", headers={"X-Admin-Key": "x"}).status_code == 403
    monkeypatch.setattr(config, "get", lambda k, d="": "secret-key" if k == "ADMIN_KEY" else d)
    assert client.get("/api/admin/bookings").status_code == 401
    assert client.get("/api/admin/bookings", headers={"X-Admin-Key": "wrong"}).status_code == 401
    ak = {"X-Admin-Key": "secret-key"}
    rows = client.get("/api/admin/bookings", headers=ak).json()
    assert any(r["id"] == bid and r["place"] == "أولد قولد" and r["status"] == "pending" for r in rows)
    assert client.put(f"/api/admin/bookings/{bid}", json={"status": "bogus"}, headers=ak).status_code == 422
    assert client.put(f"/api/admin/bookings/{bid}", json={"status": store.BOOKING_STATUSES[1]}, headers=ak).status_code == 200
    assert client.put("/api/admin/bookings/99999", json={"status": store.BOOKING_STATUSES[1]}, headers=ak).status_code == 404
