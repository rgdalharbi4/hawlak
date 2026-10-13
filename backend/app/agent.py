"""عقل الوكيل «أودين»: يبني التعليمات من بيانات الأماكن وإجابات الزائر، ويحوّل رد النموذج إلى شكل ثابت.

الرد دائمًا: {"id": نص إندونيسي, "ar": ترجمته العربية, "place_ids": [أرقام أماكن من القائمة]}
"""
import json
import re
from functools import lru_cache
from pathlib import Path

from app.providers.llm import ask_llm

PLACES_FILE = Path(__file__).resolve().parents[1] / "data" / "places.json"
MAX_HISTORY = 6      # آخر كم رسالة نرسلها للنموذج
MAX_PLACES = 3       # أقصى عدد أماكن في الرد

CAT_EN = {"sight": "historic place to visit", "exp": "experience", "food": "restaurant", "cafe": "coffee place"}
GROUP_EN = {"solo": "alone", "family": "with family", "kids": "with children", "elder": "with elderly people", "friends": "with friends"}
BUDGET_EN = {"eco": "economical", "open": "open (no limit)"}
INTEREST_EN = {"hist": "historic places", "local": "local experiences", "food": "restaurants",
               "coffee": "coffee", "homefood": "food from their own country (Indonesian)"}


@lru_cache(maxsize=1)
def load_places() -> list[dict]:
    return json.loads(PLACES_FILE.read_text(encoding="utf-8"))


def places_for(profile: dict | None = None) -> list[dict]:
    """الأماكن المتاحة لهذا الزائر: الميزانية «اقتصادية» تعني الأماكن المعلَّمة eco فقط، و«مفتوحة» تعني الكل."""
    eco_only = (profile or {}).get("budget") == "eco"
    return [p for p in load_places() if p.get("eco") or not eco_only]


def valid_ids(profile: dict | None = None) -> set[str]:
    return {p["id"] for p in places_for(profile)}


def _profile_text(profile: dict) -> str:
    lines = []
    if profile.get("first") in ("yes", "no"):
        lines.append("- First visit to Madinah: " + ("yes" if profile["first"] == "yes" else "no"))
    if profile.get("group") in GROUP_EN:
        lines.append("- Traveling: " + GROUP_EN[profile["group"]])
    inter = [INTEREST_EN[i] for i in profile.get("interests", []) if i in INTEREST_EN]
    if inter:
        lines.append("- Interests: " + ", ".join(inter))
    if profile.get("budget") in BUDGET_EN:
        lines.append("- Budget: " + BUDGET_EN[profile["budget"]])
    return "\n".join(lines) or "- (the visitor did not answer the intro questions)"


HOURS_EN = {"على مدار الساعة": "open all day and night (24 hours)"}


def _facts(p: dict) -> list[str]:
    """حقائق المكان فقط (بدون الرقم التعريفي)، وهي المصدر الوحيد للأرقام المسموحة."""
    f = [CAT_EN.get(p["cat"], p["cat"]), f'name_id: {p.get("name_latin", p["name"])}', f'name_ar: {p["name"]}']
    if p.get("note_en"):
        f.append("note: " + p["note_en"])
    if p.get("hrs"):
        f.append("hours: " + HOURS_EN.get(p["hrs"], p["hrs"]))
    if p["id"] != "s1" and p.get("dist_to_quba_mosque_m") is not None:
        f.append(f'distance_to_Quba_Mosque: {p["dist_to_quba_mosque_m"]} m')
    return f


def _place_line(p: dict) -> str:
    """سطر واحد لكل مكان، فيه فقط الحقول الموجودة فعلًا في البيانات."""
    return " | ".join([p["id"], *_facts(p)])


def build_system_prompt(profile: dict | None = None) -> str:
    places = "\n".join(_place_line(p) for p in places_for(profile))
    return f"""You are "Odin", a warm, friendly digital companion for Indonesian visitors to Madinah, focused on the Quba area.
Many visitors are elderly and struggle with typing, so be simple, calm and respectful.

OUTPUT FORMAT (strict): reply with ONE JSON object only, no extra text:
{{"id": "<your reply in simple Indonesian>", "ar": "<the same reply translated to Arabic>", "place_ids": ["<0 to {MAX_PLACES} ids from the list below>"]}}

GROUNDING (most important)
- Answer ONLY from the data in this prompt. If something is not written here, you do not know it. Say so plainly: never guess, never fill gaps from general knowledge, never invent.
- NAMES: in "id" write the place's name_id exactly as given (Latin letters). In "ar" write its name_ar. Never put Arabic script inside the Indonesian text.
- A note that says UNVERIFIED must be reported as uncertain ("namanya menunjukkan...", "belum pasti"), never as a fact.
- Write distances with the word "meter" or "kilometer" (e.g. "110 meter"), never the abbreviations m or km.
- Only say how far or near a place is using the distance_to_Quba_Mosque values given; never claim nearness or relations between places otherwise.
- Every place you mention must be listed in "place_ids". Do not write any number (price, time, distance, rating) that is not written in the data below.
- If you cannot answer from the data, say "Maaf, saya belum punya informasi itu" and suggest the Google Maps button in the app.

RULES
- "id" is at most 3 short sentences, in simple everyday Indonesian. "ar" is a faithful Arabic translation of "id".
- Recommend ONLY places from the list below, using their ids in "place_ids". Never invent a place.
- We do NOT have prices, opening hours, ratings, or facilities (kids, wheelchair, etc.) for these places. If asked, say you do not have that information and suggest checking the Google Maps button in the app. Never guess.
- Use the visitor profile to choose, but do not claim a place is suitable for children, elderly or a budget unless the list says so.
- Prefer the visitor's chosen interests (see profile). Suggest places from other categories only if the visitor explicitly asks for them.
- If the visitor asks for a quality we have no data for (kids, elderly, wheelchair, cheap), DO NOT refuse. Still suggest up to 3 places of the type they asked for (e.g. restaurants), and state clearly that we do not know whether they fit that need.
- Do not give religious rulings. For such questions, politely suggest asking a qualified scholar or an official source.
- In an emergency, tell them to call 911 immediately.
- Never describe a place as cheap, expensive or economical: we have no price details. (The list below is already filtered to the visitor's chosen budget by our team.)
- Stay on topic: helping a visitor around Quba. Politely decline unrelated requests.
- If the visitor writes in another language, still reply in Indonesian (and Arabic in "ar").

VISITOR PROFILE
{_profile_text(profile or {})}

PLACES (id | type | name_id | name_ar | note | hours | distance)
{places}
"""


def parse_reply(raw: str, allowed: set[str] | None = None) -> dict:
    """يحوّل نص النموذج إلى الشكل الثابت. إن فشل الفهم نرجع النص كما هو كرد إندونيسي."""
    data = None
    text = (raw or "").strip()
    try:
        data = json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.S)
        if m:
            try:
                data = json.loads(m.group(0))
            except Exception:
                data = None
    if not isinstance(data, dict):
        return {"id": text[:600], "ar": "", "place_ids": []}
    ok = allowed if allowed is not None else valid_ids()
    ids = []
    for i in data.get("place_ids") or []:
        if isinstance(i, str) and i in ok and i not in ids:
            ids.append(i)
    return {"id": str(data.get("id", "")).strip(), "ar": str(data.get("ar", "")).strip(), "place_ids": ids[:MAX_PLACES]}


# ---------- حواجز منع الهلوسة (تعمل في الكود، لا تعتمد على التزام النموذج) ----------

# أجوبة ثابتة من الكود بدون النموذج: طوارئ، أحكام دينية، خارج الموضوع، ومعلومات لا نملكها
EMERGENCY = re.compile(r"darurat|gawat|sakit dada|nyeri dada|sesak napas|pingsan|kecelakaan|ambulans|emergency|ambulance|طوارئ|إسعاف|نجدة|ألم في الصدر|حادث", re.I)
RELIGION = re.compile(r"\bhukum|fatwa|حكم|فتوى|هل يجوز|يجوز", re.I)
OFFTOPIC = re.compile(r"politik|pemerintah|presiden|\braja\b|partai|politics|government|سياسة|حكومة", re.I)
# خدمات خارج نطاقنا (نحن: أماكن أثرية، تجارب، أكل وقهوة)
OUT_OF_SCOPE = re.compile(r"\btoko\b|belanja|oleh-oleh|souvenir|\bhotel\b|penginapan|taksi|\btaxi\b|\bbus\b|\batm\b|\bbank\b|apotek|rumah sakit|tukar uang|محل|تسوق|فندق|صراف|صيدلية|مستشفى|مواصلات", re.I)
# طلبات عن صفات لا نملك بياناتها: نضيف تنبيهًا ثابتًا للرد (من الكود)
DISCLAIMERS = [
    (re.compile(r"lansia|orang tua|kakek|nenek|manula|elderly|old people|كبار السن|كبير في السن", re.I),
     "kami belum punya data apakah tempat-tempat ini nyaman untuk lansia", "ليس لدينا بيانات عن مدى ملاءمة هذه الأماكن لكبار السن"),
    (re.compile(r"\banak\b|anak-anak|bayi|balita|\bkids?\b|children|child|أطفال|طفل", re.I),
     "kami belum punya data apakah tempat-tempat ini cocok untuk anak-anak", "ليس لدينا بيانات عن مدى ملاءمة هذه الأماكن للأطفال"),
    (re.compile(r"kursi roda|wheelchair|difabel|disabilitas|كرسي متحرك|كراسي متحركة", re.I),
     "kami belum punya data tentang akses kursi roda", "ليس لدينا بيانات عن إمكانية الوصول بالكراسي المتحركة"),
    (re.compile(r"murah|hemat|ekonomis|irit|terjangkau|budget|cheap|affordable|رخيص|اقتصادي|ميزانية", re.I),
     "kami belum punya data harga yang rinci untuk tempat-tempat ini", "ليس لدينا بيانات أسعار تفصيلية لهذه الأماكن"),
]
UNSUPPORTED = [
    ("harga", "السعر", re.compile(r"harga|berapa\s*biaya|tarif|biaya|price|cost|how much|سعر|بكم|ثمن|تكلف", re.I)),
    ("jam buka", "ساعات العمل", re.compile(r"jam\s*buka|jam\s*tutup|buka\s*jam|tutup\s*jam|kapan\s*buka|jam\s*berapa|opening hours|open now|ساعات|مفتوح|يفتح|يغلق|دوام", re.I)),
    ("rating atau ulasan", "التقييم والمراجعات", re.compile(r"rating|ulasan|review|bintang|terbaik|best rated|تقييم|مراجعات|أفضل", re.I)),
    ("nomor telepon", "رقم الهاتف", re.compile(r"telepon|telpon|nomor hp|kontak|phone|call them|رقم|جوال|هاتف|اتصال", re.I)),
]
ALIASES = {"s1": ["masjid quba", "quba mosque"]}
# كلمات تدل على ادعاء سعر أو تقييم في رد النموذج (لا نملك بيانات عنها)
CLAIM_WORDS = re.compile(r"riyal|\bsar\b|\bsr\b|murah|mahal|terjangkau|ekonomis|bintang|rating|ulasan|ريال|رخيص|غالي|اقتصادي|تقييم|نجوم", re.I)
HOURS_WORDS = re.compile(r"jam\s*buka|\bbuka\b|\btutup\b|pukul|24\s*jam|مفتوح|يفتح|يغلق|ساعات", re.I)
NUM = re.compile(r"[0-9٠-٩]+")


def _norm_digits(t: str) -> str:
    return t.translate(str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789"))


def mentioned_places(message: str) -> list[dict]:
    m = message.lower()
    out = []
    for p in load_places():
        names = [p["name"].lower(), p.get("name_latin", "").lower(), *ALIASES.get(p["id"], [])]
        if any(n and n in m for n in names):
            out.append(p)
    return out


def special_reply(message: str):
    """جواب ثابت إن كان السؤال طوارئ أو دينيًا أو خارج الموضوع أو عن معلومة لا نملكها. وإلا None."""
    if EMERGENCY.search(message):
        return {"id": "Segera hubungi 911 (nomor darurat). Jika memungkinkan, minta tolong orang di dekatmu dan tetap tenang.",
                "ar": "اتصل فورًا بالرقم 911 (الطوارئ). وإن أمكن اطلب المساعدة ممّن حولك وحافظ على هدوئك.", "place_ids": [], "source": "guard"}
    if RELIGION.search(message):
        return {"id": "Untuk pertanyaan hukum agama, silakan bertanya kepada ulama atau petugas resmi di masjid.",
                "ar": "لأسئلة الأحكام الشرعية، اسأل أحد العلماء أو الموظفين الرسميين في المسجد.", "place_ids": [], "source": "guard"}
    if OFFTOPIC.search(message):
        return {"id": "Maaf, saya hanya bisa membantu seputar wisata di area Quba.",
                "ar": "عذرًا، أقدر أساعد فقط في السياحة في منطقة قباء.", "place_ids": [], "source": "guard"}
    if OUT_OF_SCOPE.search(message):
        return {"id": "Maaf, saya hanya bisa membantu soal tempat bersejarah, pengalaman, serta makanan dan kopi di area Quba.",
                "ar": "عذرًا، أقدر أساعد فقط في الأماكن الأثرية والتجارب والأكل والقهوة في منطقة قباء.", "place_ids": [], "source": "guard"}
    for idn, ar, rx in UNSUPPORTED:
        if rx.search(message):
            # ساعات العمل: إن سأل عن مكان عندنا ساعاته، يجيب النموذج من البيانات
            if idn == "jam buka" and any(p.get("hrs") for p in mentioned_places(message)):
                continue
            return {"id": f"Maaf, saya belum punya informasi tentang {idn} untuk tempat-tempat ini. Silakan cek lewat tombol Google Maps di halaman tempat.",
                    "ar": f"عذرًا، ما عندي معلومات عن {ar} لهذه الأماكن. تقدر تتحقق منها من زر خرائط قوقل في صفحة المكان.", "place_ids": [], "source": "guard"}
    return None


def _allowed_numbers(message: str, ids: list[str]) -> set[str]:
    allowed = set(NUM.findall(_norm_digits(message)))
    for p in load_places():
        if p["id"] in ids:
            allowed |= set(NUM.findall(_norm_digits(" ".join(_facts(p)))))
    return allowed


def violations(reply: dict, message: str) -> list[str]:
    """يرجع قائمة مخالفات الرد لقواعد البيانات. فارغة = الرد سليم."""
    text = f'{reply["id"]} {reply["ar"]}'
    found = []
    if CLAIM_WORDS.search(text):
        found.append("claims about price/rating that are not in the data")
    nums = set(NUM.findall(_norm_digits(text))) - _allowed_numbers(message, reply["place_ids"])
    if nums:
        found.append("numbers not in the data: " + ", ".join(sorted(nums)))
    if HOURS_WORDS.search(text) and not any(p.get("hrs") for p in load_places() if p["id"] in reply["place_ids"]):
        found.append("opening-hours claims not in the data")
    return found


def _add_mentioned(reply: dict, allowed: set[str] | None = None) -> dict:
    """أي مكان ذُكر اسمه في النص يجب أن يظهر في place_ids."""
    text = f'{reply["id"]} {reply["ar"]}'
    for p in load_places():
        if allowed is not None and p["id"] not in allowed:
            continue
        if p["name"] in text and p["id"] not in reply["place_ids"]:
            reply["place_ids"].append(p["id"])
    reply["place_ids"] = reply["place_ids"][:MAX_PLACES]
    return reply


def _safe_fallback(ids: list[str]) -> dict:
    names = [p["name"] for p in load_places() if p["id"] in ids]
    if names:
        return {"id": "Mungkin kamu suka: " + ", ".join(names) + ". Untuk detail lainnya, cek lewat tombol Google Maps.",
                "ar": "ربما يناسبك: " + "، ".join(names) + ". لمعلومات أخرى تحقق من زر خرائط قوقل.", "place_ids": ids[:MAX_PLACES], "source": "fallback"}
    return {"id": "Maaf, saya belum punya informasi itu. Silakan cek lewat tombol Google Maps.",
            "ar": "عذرًا، ما عندي هذه المعلومة. تحقق من زر خرائط قوقل.", "place_ids": [], "source": "fallback"}


def add_disclaimers(reply: dict, message: str) -> dict:
    """إن طلب الزائر صفة لا نملك بياناتها (كبار سن، أطفال، كرسي متحرك، رخيص) نضيف تنبيهًا ثابتًا."""
    if not reply["place_ids"]:
        return reply
    id_notes, ar_notes = [], []
    for rx, idn, ar in DISCLAIMERS:
        if rx.search(message):
            id_notes.append(idn)
            ar_notes.append(ar)
    if id_notes and not re.search(r"belum punya|belum ada|tidak (?:memiliki|punya|ada|tahu)|tak (?:punya|tahu)|ما عندي|لا أملك|ليس لدي|لا أعرف|لا توجد معلومات", reply["id"] + reply["ar"], re.I):
        reply["id"] += " Catatan: " + "; ".join(id_notes) + ", mohon periksa langsung."
        reply["ar"] += " ملاحظة: " + "؛ ".join(ar_notes) + "، فيُرجى التحقق بنفسك."
    return reply


def ask_agent(message: str, history: list[dict] | None = None, profile: dict | None = None) -> dict:
    # ١) أسئلة عن معلومات لا نملكها: جواب ثابت بدون النموذج
    special = special_reply(message)
    if special:
        return special

    msgs = []
    for m in (history or [])[-MAX_HISTORY:]:
        role = "assistant" if m.get("role") == "assistant" else "user"
        content = str(m.get("content", "")).strip()
        if content:
            msgs.append({"role": role, "content": content})
    msgs.append({"role": "user", "content": message.strip()})
    while msgs and msgs[0]["role"] != "user":  # بعض المزودين يطلبون البدء برسالة المستخدم
        msgs.pop(0)

    system = build_system_prompt(profile)
    allowed = valid_ids(profile)
    raw = ask_llm(system, msgs)
    reply = _add_mentioned(parse_reply(raw, allowed), allowed)
    bad = violations(reply, message)
    if bad:
        # ٢) محاولة ثانية مع تنبيه النموذج إلى المخالفة
        fix = ("Your previous reply broke the grounding rules (" + "; ".join(bad) + "). "
               "Rewrite it using ONLY the data in the system prompt, with no such claims and no numbers that are not in the data. Reply with the same JSON format.")
        raw2 = ask_llm(system, msgs + [{"role": "assistant", "content": raw}, {"role": "user", "content": fix}])
        reply = _add_mentioned(parse_reply(raw2, allowed), allowed)
        if violations(reply, message):
            # ٣) لا نجازف: رد آمن مبني على البيانات فقط
            return add_disclaimers(_safe_fallback(reply["place_ids"]), message)
    reply["source"] = "llm"
    return add_disclaimers(reply, message)
