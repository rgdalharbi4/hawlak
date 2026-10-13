"""يولّد backend/data/places.json من قائمة الأماكن في frontend/js/data/places.js (المصدر الوحيد).

عدّلي الأماكن في places.js ثم شغّلي:   python3 scripts/sync_places.py
(يحتاج node). المسافة إلى مسجد قباء تُحسب من الإحداثيات إن وُجدت.
"""
import json
import math
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
src = (ROOT / "frontend/js/data/places.js").read_text(encoding="utf-8")
qp = re.search(r"const QP=(\[.*?\n\]);", src, flags=re.S).group(1)
js = f"const QP={qp};console.log(JSON.stringify(QP.map(([id,cat,name,lat,lon,tags,o])=>({{id,cat,name,lat,lon,tags,eco:!!o.eco,d:o.d||'',hrs:o.hrs||'',name_latin:o.latin||'',note_en:o.en||'',cid:o.cid||''}}))))"
places = json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)


def hav(a, b):
    r = 6371000
    la1, lo1, la2, lo2 = map(math.radians, (a["lat"], a["lon"], b["lat"], b["lon"]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


mosque = next(p for p in places if p["id"] == "s1")
for p in places:
    if p["lat"] is not None and p["lon"] is not None:
        p["dist_to_quba_mosque_m"] = int(round(hav(p, mosque) / 10.0) * 10)
    else:
        p.pop("lat"), p.pop("lon")  # بلا موقع بعد
out = ROOT / "backend/data/places.json"
out.write_text(json.dumps(places, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(places)} أماكن، منها اقتصادية: {sum(p['eco'] for p in places)}، وبلا موقع: {sum('lat' not in p for p in places)}")
