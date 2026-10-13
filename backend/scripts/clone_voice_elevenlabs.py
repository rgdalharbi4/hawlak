"""يرفع عينة صوت أودين إلى ElevenLabs وينشئ منها صوتًا مستنسخًا، ثم يطبع رقم الصوت (voice_id).

الاستخدام (من مجلد backend وبيئتك مفعّلة، ومفتاح ElevenLabs في TTS_API_KEY داخل .env):
    python scripts/clone_voice_elevenlabs.py مسار/العينة.mp3 --name Odin

بعدها ضعي الرقم في .env:
    TTS_PROVIDER=elevenlabs
    TTS_VOICE=<الرقم الذي طُبع>

شروط: لا ترفعي إلا صوتًا يحق لكم استخدامه تجاريًا (راجعي ترخيص مصدر الصوت).
"""
import argparse
import sys
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import config  # noqa: E402

URL = "https://api.elevenlabs.io/v1/voices/add"


def clone(sample: Path, name: str, clean: bool = True, transport: httpx.BaseTransport | None = None) -> str:
    key = config.get("TTS_API_KEY")
    if not key:
        raise SystemExit("TTS_API_KEY غير موجود في .env")
    if not sample.exists():
        raise SystemExit(f"الملف غير موجود: {sample}")
    with httpx.Client(timeout=120, transport=transport) as c:
        r = c.post(
            URL,
            headers={"xi-api-key": key},
            data={"name": name, "description": "Odin, Indonesian guide for Hawlak", "remove_background_noise": str(clean).lower()},
            files=[("files", (sample.name, sample.read_bytes(), "audio/mpeg"))],
        )
    if r.status_code >= 400:
        raise SystemExit(f"elevenlabs HTTP {r.status_code}: {r.text[:300]}")
    return r.json()["voice_id"]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sample", type=Path, help="ملف العينة (mp3 أو wav)")
    ap.add_argument("--name", default="Odin")
    ap.add_argument("--no-clean", action="store_true", help="لا تزيلي الضوضاء الخلفية")
    a = ap.parse_args()
    vid = clone(a.sample, a.name, clean=not a.no_clean)
    print(f"تم إنشاء الصوت. الرقم: {vid}\nضعيه في .env:  TTS_VOICE={vid}  و  TTS_PROVIDER=elevenlabs")


if __name__ == "__main__":
    main()
