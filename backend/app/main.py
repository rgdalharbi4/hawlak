"""خادم «حولك»: يقدّم الواجهة وواجهة برمجية بسيطة للأماكن.

التشغيل (من مجلد backend):
    uvicorn app.main:app --reload
"""
import json
from pathlib import Path

import hmac
import logging

from fastapi import FastAPI, File, Form, Header, HTTPException, Query, Request, Response, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel, Field

from app import agent, config, store
from app.providers import stt, tts

ROOT = Path(__file__).resolve().parents[2]
PLACES_FILE = ROOT / "backend" / "data" / "places.json"

log = logging.getLogger("hawlak")
app = FastAPI(title="Hawlak API", version="0.2.0")


def load_places() -> list[dict]:
    return json.loads(PLACES_FILE.read_text(encoding="utf-8"))


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/config/status")
def config_status():
    """هل المفاتيح موجودة؟ وأي مزود مفعّل؟ (بدون عرض أي قيمة سرية)"""
    return {"keys_present": config.key_status(), "providers": config.providers()}


@app.middleware("http")
async def no_stale_cache(request, call_next):
    """ملفات الواجهة تُراجَع مع الخادم في كل تحميل (ETag)، فلا يبقى المتصفح على نسخة قديمة بعد أي تعديل."""
    response = await call_next(request)
    if not request.url.path.startswith("/api"):
        response.headers["Cache-Control"] = "no-cache"
    return response


class AskIn(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    history: list[dict] = []      # [{"role": "user"|"assistant", "content": "..."}]
    profile: dict = {}            # {"first","group","interests","budget"}


class TtsIn(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    language: str = "id"


@app.post("/api/ask")
def ask(body: AskIn):
    """سؤال للوكيل: يرجع {"id": إندونيسي, "ar": عربي, "place_ids": [...]}"""
    try:
        return agent.ask_agent(body.message, body.history, body.profile)
    except Exception as e:  # لا نكشف تفاصيل المزود للمتصفح
        log.exception("ask failed")
        raise HTTPException(502, "تعذّر الحصول على رد من الوكيل") from e


@app.post("/api/stt")
async def speech_to_text(audio: UploadFile = File(...), language: str = Form("id")):
    data = await audio.read()
    if not data or len(data) > 10_000_000:
        raise HTTPException(400, "ملف الصوت فارغ أو كبير جدًا")
    try:
        return {"text": stt.transcribe(data, audio.content_type or "audio/webm", language)}
    except Exception as e:
        log.exception("stt failed")
        raise HTTPException(502, "تعذّر تحويل الصوت إلى نص") from e


@app.post("/api/tts")
def text_to_speech(body: TtsIn):
    try:
        audio = tts.synthesize(body.text, body.language)
    except Exception as e:
        log.exception("tts failed")
        raise HTTPException(502, "تعذّر توليد الصوت") from e
    if not audio:
        raise HTTPException(501, "مزود الصوت غير مفعّل")
    return Response(audio, media_type="audio/mpeg")


limiter = store.RateLimiter()


def _limit(request: Request, bucket: str, n: int):
    ip = request.client.host if request.client else "?"
    if not limiter.allow(ip, bucket, n):
        raise HTTPException(429, "طلبات كثيرة، حاول بعد قليل")


def _visitor(token: str | None):
    v = store.visitor_by_token(token)
    if not v:
        raise HTTPException(401, "سجّل الدخول أولًا")
    return v


class VisitorIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    phone: str = Field(min_length=7, max_length=25)


class FavIn(BaseModel):
    place_id: str
    on: bool = True


class BookingIn(BaseModel):
    place_id: str
    time: str = Field(pattern=r"^([01][0-9]|2[0-3]):[0-5][0-9]$")
    people: int = Field(ge=1, le=20)


@app.post("/api/visitor")
def register_visitor(body: VisitorIn, request: Request):
    """تسجيل الزائر باسمه ورقم جواله (عند الحاجة فقط: حفظ مفضلة أو طلب حجز)."""
    _limit(request, "visitor", 10)
    phone = store.clean_phone(body.phone)
    name = " ".join(body.name.split())
    if not phone or len(name) < 2:
        raise HTTPException(422, "الاسم أو رقم الجوال غير صحيح")
    return store.create_visitor(name, phone)


@app.get("/api/favorites")
def list_favorites(x_token: str | None = Header(None)):
    return {"place_ids": store.get_favorites(_visitor(x_token)["id"])}


@app.post("/api/favorites")
def set_favorite(body: FavIn, request: Request, x_token: str | None = Header(None)):
    _limit(request, "fav", 60)
    v = _visitor(x_token)
    if body.place_id not in {p["id"] for p in load_places()}:
        raise HTTPException(422, "مكان غير معروف")
    store.set_favorite(v["id"], body.place_id, body.on)
    return {"place_ids": store.get_favorites(v["id"])}


@app.post("/api/bookings")
def create_booking(body: BookingIn, request: Request, x_token: str | None = Header(None)):
    """طلب حجز: يُسجَّل بحالة «قيد المراجعة»، وليس تأكيدًا من المكان."""
    _limit(request, "booking", 10)
    v = _visitor(x_token)
    if body.place_id not in {p["id"] for p in load_places()}:
        raise HTTPException(422, "مكان غير معروف")
    return {"id": store.create_booking(v["id"], body.place_id, body.time, body.people), "status": "pending"}


# ---------- لوحة الفريق (محمية بكلمة سر ADMIN_KEY في .env) ----------
def _admin(request: Request, key: str | None):
    _limit(request, "admin", 20)
    expected = config.get("ADMIN_KEY")
    if not expected:
        raise HTTPException(403, "لوحة الفريق غير مفعّلة: ضعوا ADMIN_KEY في ملف .env")
    if not key or not hmac.compare_digest(key.encode(), expected.encode()):
        raise HTTPException(401, "كلمة السر غير صحيحة")


class StatusIn(BaseModel):
    status: str


@app.get("/api/admin/bookings")
def admin_bookings(request: Request, x_admin_key: str | None = Header(None)):
    _admin(request, x_admin_key)
    names = {p["id"]: p["name"] for p in load_places()}
    return [{**b, "place": names.get(b["place_id"], b["place_id"])} for b in store.list_bookings()]


@app.put("/api/admin/bookings/{booking_id}")
def admin_set_status(booking_id: int, body: StatusIn, request: Request, x_admin_key: str | None = Header(None)):
    _admin(request, x_admin_key)
    if body.status not in store.BOOKING_STATUSES:
        raise HTTPException(422, "حالة غير معروفة")
    if not store.set_booking_status(booking_id, body.status):
        raise HTTPException(404, "الطلب غير موجود")
    return {"id": booking_id, "status": body.status}


@app.get("/api/places")
def places(cat: str | None = Query(None, description="sight | exp | food | cafe"),
           budget: str | None = Query(None, description="eco = الاقتصادية فقط، وغير ذلك = الكل")):
    items = agent.places_for({"budget": budget})
    return [p for p in items if cat is None or p["cat"] == cat]


def _asset_version() -> str:
    """رقم يتغير مع أي تعديل في ملفات الواجهة."""
    files = [p for p in (ROOT / "frontend").rglob("*") if p.is_file() and p.suffix in {".js", ".css", ".html", ".json"}]
    return str(int(max(p.stat().st_mtime for p in files)))


@app.get("/", response_class=HTMLResponse)
def index():
    """الصفحة الرئيسية: نضيف رقم الإصدار لروابط الملفات حتى لا يستخدم المتصفح نسخة قديمة منها."""
    html = (ROOT / "frontend" / "index.html").read_text(encoding="utf-8")
    v = _asset_version()
    html = html.replace('.js"', f'.js?v={v}"').replace('.css"', f'.css?v={v}"')
    return HTMLResponse(html, headers={"Cache-Control": "no-cache"})


# الواجهة (يجب أن يكون هذا آخر سطر حتى لا يحجب مسارات /api)
app.mount("/", StaticFiles(directory=ROOT / "frontend", html=True), name="frontend")
