"""يعرض الأصوات المتاحة في حسابك على ElevenLabs (أسماؤها وأرقامها) لتختاري منها بدل الاستنساخ.

الاستخدام (من مجلد backend وبيئتك مفعّلة، ومفتاح ElevenLabs في TTS_API_KEY):
    python scripts/list_voices_elevenlabs.py            # كل الأصوات
    python scripts/list_voices_elevenlabs.py --male     # الرجالية فقط

افتحي رابط «اسمعيه» في المتصفح لتسمعي عينة الصوت (غالبًا بالإنجليزية).\nضعي الرقم الذي يعجبك في .env:  TTS_VOICE=<الرقم>   ثم جرّبي:  python ../tests/run_tts_bakeoff.py
"""
import argparse
import sys
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import config  # noqa: E402


def list_voices(transport: httpx.BaseTransport | None = None) -> list[dict]:
    key = config.get("TTS_API_KEY")
    if not key:
        raise SystemExit("TTS_API_KEY غير موجود في .env")
    with httpx.Client(timeout=30, transport=transport) as c:
        r = c.get("https://api.elevenlabs.io/v1/voices", headers={"xi-api-key": key})
    if r.status_code >= 400:
        raise SystemExit(f"elevenlabs HTTP {r.status_code}: {r.text[:300]}")
    return r.json().get("voices", [])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--male", action="store_true")
    a = ap.parse_args()
    voices = list_voices()
    if a.male:
        voices = [v for v in voices if (v.get("labels") or {}).get("gender") == "male"]
    for v in voices:
        lab = v.get("labels") or {}
        print(f'{v["voice_id"]} | {v.get("name")} | {v.get("category", "")} | {lab.get("gender", "?")} | {lab.get("accent", "")} | {lab.get("descriptive", lab.get("description", ""))}')
        if v.get("preview_url"):
            print(f'    اسمعيه: {v["preview_url"]}')
    print(f"\n{len(voices)} صوتًا. ضعي الرقم الذي تختارينه في .env:  TTS_VOICE=<الرقم>")


if __name__ == "__main__":
    main()
