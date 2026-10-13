"""تحويل الكلام إلى نص (STT). نفس فكرة llm.py.

المزودون: fake و groq (نموذج Whisper). المفتاح من STT_API_KEY، والنموذج من STT_MODEL.
"""
import httpx

from app import config

HTTP_TRANSPORT: httpx.BaseTransport | None = None
TIMEOUT = 60.0


def _fake(audio: bytes, mime: str, language: str) -> str:
    return "[وهمي] نص من الصوت"


def _groq(audio: bytes, mime: str, language: str) -> str:
    key = config.get("STT_API_KEY")
    if not key:
        raise RuntimeError("STT_API_KEY غير موجود في ملف .env")
    ext = "webm" if "webm" in mime else "m4a" if ("mp4" in mime or "m4a" in mime) else "wav" if "wav" in mime else "ogg"
    with httpx.Client(timeout=TIMEOUT, transport=HTTP_TRANSPORT) as c:
        r = c.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {key}"},
            files={"file": (f"speech.{ext}", audio, mime)},
            data={
                "model": config.get("STT_MODEL", "whisper-large-v3-turbo"),
                "language": language,
                "response_format": "json",
                "temperature": "0",
            },
        )
    if r.status_code >= 400:
        raise RuntimeError(f"groq-stt HTTP {r.status_code}: {r.text[:300]}")
    return r.json().get("text", "").strip()


PROVIDERS = {"fake": _fake, "groq": _groq}


def transcribe(audio: bytes, mime: str = "audio/webm", language: str = "id") -> str:
    name = config.providers()["stt"]
    if name not in PROVIDERS:
        raise ValueError(f"مزود فهم الكلام غير معروف: {name}")
    return PROVIDERS[name](audio, mime, language)
