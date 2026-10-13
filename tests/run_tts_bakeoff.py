"""مقارنة الأصوات: يولّد نفس الجمل بصوت المزود المضبوط في .env ويحفظها ملفات mp3 لتسمعيها.

الخطوات:
  1) ضعي في .env:  TTS_PROVIDER=azure (أو google أو elevenlabs) + TTS_API_KEY + (TTS_REGION أو TTS_VOICE حسب المزود)
  2) من backend:   python ../tests/run_tts_bakeoff.py
  3) افتحي المجلد: open cache/bakeoff     ← وسمعي الملفات
  4) غيّري TTS_PROVIDER إلى مزود آخر وأعيدي. الملفات تحمل اسم المزود فتقارنين.
  5) لمقارنة عدة أصوات من ElevenLabs دفعة واحدة وترتيبها بقربها من أودين:
       python ../tests/run_tts_bakeoff.py --voices ID1,ID2,ID3
اسمعيها مع إندونيسي (ويفضّل كبير في السن): هل النطق طبيعي؟ هل يفهم أسماء الأماكن؟ هل السرعة مناسبة؟
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app import config  # noqa: E402
from app.providers import tts  # noqa: E402

SENTENCES = [
    "Halo! Saya Odin, teman seperjalananmu di Madinah.",
    "Anda bisa mulai dengan mengunjungi Masjid Quba, masjid pertama dalam Islam.",
    "Sumur Aris hanya sekitar seratus sepuluh meter dari sana.",
    "Maaf, saya belum punya informasi itu. Silakan cek lewat tombol Google Maps.",
    "Segera hubungi sembilan satu satu jika ini darurat.",
    "Mau coba kopi atau makan siang dulu? Saya bisa bantu pilihkan.",
    "Maqsad Quba, Waha Milaf, dan Kebun Al-Mirbad ada di area Quba.",
]


def run_voices(name: str, voices: list[str], out: Path):
    """يولّد جملتين بكل صوت ويرتّب الأصوات بقرب طبقتها من صوت أودين ."""
    import os

    from app import voice_match

    rows = []
    for v in voices:
        os.environ["TTS_VOICE"] = v
        f0s = []
        for i, text in enumerate(SENTENCES[:2], 1):
            try:
                audio = tts.PROVIDERS[name](text, "id")
            except Exception as e:  # noqa: BLE001
                print(f"  {v}: خطأ: {str(e)[:200]}")
                break
            f = out / f"{name}_{v[:8]}_{i}.mp3"
            f.write_bytes(audio)
            f0 = voice_match.f0_of_audio_file(f)
            if f0:
                f0s.append(f0)
        if f0s:
            m = sum(f0s) / len(f0s)
            rows.append((abs(m - voice_match.ODIN_F0_HZ), m, v))
    rows.sort()
    print(f"\nمرتبة بقرب الطبقة من أودين ({voice_match.ODIN_F0_HZ:.0f} هرتز):")
    for d, m, v in rows:
        print(f"  {m:5.0f} هرتز (فرق {d:3.0f}) — {v}")
    print("\nالملفات في cache/bakeoff، اسمعي الأقرب أولًا. الطبقة وحدها لا تكفي: الحكم النهائي بأذنك.")


def main():
    name = config.providers()["tts"]
    if name == "fake" or name not in tts.PROVIDERS:
        print("ضعي TTS_PROVIDER (azure أو google أو elevenlabs) و TTS_API_KEY في .env أولًا.")
        return 1
    out = Path(__file__).resolve().parents[1] / "backend" / "cache" / "bakeoff"
    out.mkdir(parents=True, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[1] == "--voices":  # مقارنة عدة أصوات: --voices ID1,ID2,ID3
        run_voices(name, [v for v in sys.argv[2].split(",") if v], out)
        return 0
    print(f"المزود: {name} | الصوت: {config.get('TTS_VOICE') or '(الافتراضي)'} | المفتاح موجود: {config.key_status()['TTS_API_KEY']}")
    for i, text in enumerate(SENTENCES, 1):
        try:
            audio = tts.PROVIDERS[name](text, "id")
        except Exception as e:  # noqa: BLE001
            print(f"{i}) خطأ: {str(e)[:300]}")
            continue
        f = out / f"{name}_{i}.mp3"
        f.write_bytes(audio)
        print(f"{i}) تم: {f.name} ({len(audio) // 1024} KB) — {text}")
    print("\nافتحي المجلد وسمعي:  open cache/bakeoff")
    return 0


if __name__ == "__main__":
    sys.exit(main())
