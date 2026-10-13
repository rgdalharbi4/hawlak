"""تخزين الزوار والمفضلة وطلبات الحجز في SQLite (ملف واحد).

المسار: backend/data/hawlak.db (أو المتغير HAWLAK_DB). الملف خارج git.
لا نتحقق من رقم الجوال برمز (OTP) بعد، لذلك كل تسجيل ينشئ زائرًا جديدًا برمز (token) خاص به،
ولا نُرجع أبدًا بيانات زائر آخر برقمه فقط.
"""
import os
import re
import secrets
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path

DEFAULT_DB = Path(__file__).resolve().parents[1] / "data" / "hawlak.db"


def db_path() -> str:
    return os.environ.get("HAWLAK_DB") or str(DEFAULT_DB)


SCHEMA = """
CREATE TABLE IF NOT EXISTS visitors(
  id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT UNIQUE NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS favorites(
  visitor_id INTEGER NOT NULL, place_id TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(visitor_id, place_id));
CREATE TABLE IF NOT EXISTS bookings(
  id INTEGER PRIMARY KEY AUTOINCREMENT, visitor_id INTEGER NOT NULL, place_id TEXT NOT NULL, at_time TEXT NOT NULL,
  people INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL);
"""


@contextmanager
def conn():
    p = db_path()
    Path(p).parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(p)
    c.row_factory = sqlite3.Row
    c.executescript(SCHEMA)
    try:
        yield c
        c.commit()
    finally:
        c.close()


AR_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")


def clean_phone(raw: str) -> str | None:
    p = re.sub(r"[\s\-().]", "", raw.translate(AR_DIGITS))
    return p if PHONE_RE.match(p) else None


def create_visitor(name: str, phone: str) -> dict:
    token = secrets.token_urlsafe(24)
    with conn() as c:
        c.execute("INSERT INTO visitors(token,name,phone,created_at) VALUES(?,?,?,?)", (token, name, phone, int(time.time())))
    return {"token": token, "name": name}


def visitor_by_token(token: str | None):
    if not token:
        return None
    with conn() as c:
        return c.execute("SELECT id,name,phone FROM visitors WHERE token=?", (token,)).fetchone()


def get_favorites(visitor_id: int) -> list[str]:
    with conn() as c:
        return [r["place_id"] for r in c.execute("SELECT place_id FROM favorites WHERE visitor_id=? ORDER BY rowid", (visitor_id,))]


def set_favorite(visitor_id: int, place_id: str, on: bool) -> None:
    with conn() as c:
        if on:
            c.execute("INSERT OR IGNORE INTO favorites(visitor_id,place_id,created_at) VALUES(?,?,?)", (visitor_id, place_id, int(time.time())))
        else:
            c.execute("DELETE FROM favorites WHERE visitor_id=? AND place_id=?", (visitor_id, place_id))


def create_booking(visitor_id: int, place_id: str, at_time: str, people: int) -> int:
    with conn() as c:
        cur = c.execute("INSERT INTO bookings(visitor_id,place_id,at_time,people,created_at) VALUES(?,?,?,?,?)",
                        (visitor_id, place_id, at_time, people, int(time.time())))
        return cur.lastrowid


BOOKING_STATUSES = ("pending", "contacted", "confirmed", "rejected")


def list_bookings() -> list[dict]:
    """كل طلبات الحجز مع اسم الزائر وجواله (للوحة الفريق فقط)."""
    with conn() as c:
        rows = c.execute(
            "SELECT b.id,b.place_id,b.at_time,b.people,b.status,b.created_at,v.name,v.phone "
            "FROM bookings b JOIN visitors v ON v.id=b.visitor_id ORDER BY b.id DESC"
        ).fetchall()
    return [dict(r) for r in rows]


def set_booking_status(booking_id: int, status: str) -> bool:
    if status not in BOOKING_STATUSES:
        raise ValueError("حالة غير معروفة")
    with conn() as c:
        return c.execute("UPDATE bookings SET status=? WHERE id=?", (status, booking_id)).rowcount > 0


class RateLimiter:
    """حد بسيط للطلبات لكل عنوان في الدقيقة (في الذاكرة)."""

    def __init__(self):
        self.hits: dict[tuple[str, str], list[float]] = {}

    def allow(self, ip: str, bucket: str, limit: int, window: int = 60) -> bool:
        now = time.time()
        k = (ip, bucket)
        arr = [t for t in self.hits.get(k, []) if now - t < window]
        if len(arr) >= limit:
            self.hits[k] = arr
            return False
        arr.append(now)
        self.hits[k] = arr
        return True
