"""تحويل النص إلى كلام (TTS). نفس فكرة llm.py.

المزودون: fake و elevenlabs و azure و google. نختار بـ TTS_PROVIDER في .env.
الإعدادات في .env:
    TTS_API_KEY=...        مفتاح المزود
    TTS_VOICE=...          اسم أو رقم الصوت (اختياري لـ azure و google، مطلوب لـ elevenlabs)
    TTS_REGION=...         منطقة Azure فقط، مثل westeurope
    TTS_MODEL=...          اختياري (elevenlabs)
    TTS_RATE=0.9           سرعة الكلام (أبطأ قليلًا لكبار السن)

الناتج دائمًا ملف mp3 (bytes). ونحفظ كل جملة مرة واحدة في backend/cache/tts حتى لا ندفع ولا ننتظر مرتين.
"""
import base64
import hashlib
import re
import time
from pathlib import Path
from xml.sax.saxutils import escape

import httpx

from app import config

HTTP_TRANSPORT: httpx.BaseTransport | None = None
TIMEOUT = 40.0
CACHE_DIR = Path(__file__).resolve().parents[2] / "cache" / "tts"
AZURE_DEFAULT_VOICE = "id-ID-ArdiNeural"  # صوت رجالي إندونيسي، يناسب أودين


def _rate() -> float:
    try:
        return max(0.6, min(1.2, float(config.get("TTS_RATE", "0.9"))))
    except ValueError:
        return 0.9


def _need_key() -> str:
    key = config.get("TTS_API_KEY")
    if not key:
        raise RuntimeError("TTS_API_KEY غير موجود في ملف .env")
    return key


def _post(name: str, url: str, **kw) -> httpx.Response:
    """يرسل الطلب ويعيد المحاولة عند الازدحام، ويرمي خطأ واضحًا (بدون المفتاح)."""
    for attempt in range(3):
        with httpx.Client(timeout=TIMEOUT, transport=HTTP_TRANSPORT) as c:
            r = c.post(url, **kw)
        if r.status_code in (429, 500, 502, 503, 504) and attempt < 2:
            time.sleep(2 * (attempt + 1))
            continue
        break
    if r.status_code >= 400:
        raise RuntimeError(f"{name} HTTP {r.status_code}: {r.text[:300]}")
    return r


def _fake(text: str, language: str) -> bytes:
    return b""  # لا صوت في النسخة الوهمية


def _elevenlabs(text: str, language: str) -> bytes:
    voice = config.get("TTS_VOICE")
    if not voice:
        raise RuntimeError("TTS_VOICE (رقم الصوت voice_id) مطلوب مع elevenlabs")
    body = {
        "text": text,
        "model_id": config.get("TTS_MODEL", "eleven_multilingual_v2"),
        "language_code": language,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "speed": _rate()},
    }
    r = _post("elevenlabs", f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
              headers={"xi-api-key": _need_key()}, json=body)
    return r.content


def _azure(text: str, language: str) -> bytes:
    region = config.get("TTS_REGION")
    if not region:
        raise RuntimeError("TTS_REGION مطلوب مع azure (مثل westeurope)")
    voice = config.get("TTS_VOICE", AZURE_DEFAULT_VOICE)
    pct = int(round((_rate() - 1) * 100))
    ssml = (f"<speak version='1.0' xml:lang='{language}-ID'><voice name='{escape(voice)}'>"
            f"<prosody rate='{pct:+d}%'>{escape(text)}</prosody></voice></speak>")
    r = _post("azure", f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1",
              headers={"Ocp-Apim-Subscription-Key": _need_key(), "Content-Type": "application/ssml+xml",
                       "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "hawlak"},
              content=ssml.encode("utf-8"))
    return r.content


def _google(text: str, language: str) -> bytes:
    voice = {"languageCode": f"{language}-ID"}
    if config.get("TTS_VOICE"):
        voice["name"] = config.get("TTS_VOICE")
    else:
        voice["ssmlGender"] = "MALE"
    body = {"input": {"text": text}, "voice": voice, "audioConfig": {"audioEncoding": "MP3", "speakingRate": _rate()}}
    r = _post("google", "https://texttospeech.googleapis.com/v1/text:synthesize",
              headers={"X-Goog-Api-Key": _need_key()}, json=body)
    return base64.b64decode(r.json()["audioContent"])


PROVIDERS = {"fake": _fake, "elevenlabs": _elevenlabs, "azure": _azure, "google": _google}


def _cache_path(name: str, text: str, language: str) -> Path:
    key = "|".join([name, language, config.get("TTS_VOICE"), config.get("TTS_MODEL"), str(_rate()), text])
    return CACHE_DIR / f"{hashlib.sha256(key.encode('utf-8')).hexdigest()[:32]}.mp3"


DIGITS_ID = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"]


def speech_text(text: str) -> str:
    """يجهّز النص للنطق: وحدات كاملة (m ← meter) وأرقام الطوارئ تُنطق رقمًا رقمًا."""
    t = text.replace("\u202f", " ").replace("\u00a0", " ")
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s?km\b", r"\1 kilometer", t, flags=re.I)
    t = re.sub(r"(\d+(?:[.,]\d+)?)\s?m\b", r"\1 meter", t, flags=re.I)
    t = re.sub(r"\b911\b", " ".join(DIGITS_ID[int(d)] for d in "911"), t)
    return re.sub(r"\s+", " ", t).strip()


def synthesize(text: str, language: str = "id") -> bytes:
    name = config.providers()["tts"]
    if language == "id":
        text = speech_text(text)
    if name not in PROVIDERS:
        raise ValueError(f"مزود الصوت غير معروف: {name}")
    if name == "fake":
        return b""
    path = _cache_path(name, text, language)
    if path.exists():
        return path.read_bytes()
    audio = PROVIDERS[name](text, language)
    if audio:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        path.write_bytes(audio)
    return audio
