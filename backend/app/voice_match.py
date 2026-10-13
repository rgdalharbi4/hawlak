"""قياس طبقة الصوت (F0) لمقارنة الأصوات المرشحة بصوت أودين.

الطبقة وحدها لا تكفي لتشابه الصوتين (النغمة والدفء يحتاجان أذنًا)، لكنها تستبعد الأصوات البعيدة.
تحتاج: numpy و ffmpeg (لفك ملفات mp3).
"""
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

ODIN_F0_HZ = 125.0  # وسيط طبقة صوت أودين المقاسة من الفيديوين


def _load_wav(path: str) -> tuple[np.ndarray, int]:
    with wave.open(path) as w:
        sr = w.getframerate()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype("float32") / 32768
    return a, sr


def median_f0(a: np.ndarray, sr: int, fmin: int = 70, fmax: int = 300) -> float | None:
    n, h = int(0.04 * sr), int(0.01 * sr)
    lo, hi = int(sr / fmax), int(sr / fmin)
    vals = []
    for i in range(0, len(a) - n, h):
        x = a[i:i + n] - a[i:i + n].mean()
        if np.sqrt((x ** 2).mean()) < 0.02:
            continue
        ac = np.correlate(x, x, "full")[n - 1:]
        ac = ac / (ac[0] + 1e-9)
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] > 0.5:
            vals.append(sr / k)
    return float(np.median(vals)) if vals else None


def f0_of_audio_file(path: str | Path) -> float | None:
    """يفك أي ملف صوت (mp3 مثلًا) عبر ffmpeg ثم يقيس طبقته. يرجع None إن تعذّر."""
    with tempfile.TemporaryDirectory() as d:
        wav = str(Path(d) / "x.wav")
        try:
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-ac", "1", "-ar", "16000", wav], check=True)
        except (FileNotFoundError, subprocess.CalledProcessError):
            return None
        a, sr = _load_wav(wav)
    return median_f0(a, sr)
