"""خادم «حولك»: يقدّم الواجهة وواجهة برمجية بسيطة للأماكن.

التشغيل (من مجلد backend):
    uvicorn app.main:app --reload
"""
import json
from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parents[2]
PLACES_FILE = ROOT / "backend" / "data" / "places.json"

app = FastAPI(title="Hawlak API", version="0.1.0")


def load_places() -> list[dict]:
    return json.loads(PLACES_FILE.read_text(encoding="utf-8"))


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/places")
def places(cat: str | None = Query(None, description="sight | exp | food | cafe")):
    items = load_places()
    return [p for p in items if cat is None or p["cat"] == cat]


# الواجهة (يجب أن يكون هذا آخر سطر حتى لا يحجب مسارات /api)
app.mount("/", StaticFiles(directory=ROOT / "frontend", html=True), name="frontend")
