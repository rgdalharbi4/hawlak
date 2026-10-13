"""الإعدادات: تقرأ المفاتيح من ملف .env في جذر المشروع.

مهم: لا نطبع قيم المفاتيح أبدًا. نعرض فقط هل هي موجودة أم لا.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")  # لا يفشل إن لم يوجد الملف


def get(name: str, default: str = "") -> str:
    """يرجع قيمة متغير من .env (أو الافتراضي)."""
    return os.environ.get(name, default).strip()


def key_status() -> dict[str, bool]:
    """هل كل مفتاح موجود؟ (True/False فقط، بدون القيم)."""
    return {name: bool(get(name)) for name in ("LLM_API_KEY", "STT_API_KEY", "TTS_API_KEY")}


def providers() -> dict[str, str]:
    """أي مزود نستخدم لكل جزء. الافتراضي fake (وهمي) حتى نتأكد من الأنبوب."""
    return {
        "llm": get("LLM_PROVIDER", "fake"),
        "stt": get("STT_PROVIDER", "fake"),
        "tts": get("TTS_PROVIDER", "fake"),
    }
