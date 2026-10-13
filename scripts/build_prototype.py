"""يجمع الواجهة (frontend) في ملف HTML واحد لنشره كنسخة عرض (Artifact) بلا خادم.

    python3 scripts/build_prototype.py        ← يكتب dist/prototype.html

نسخة العرض لا فيها وكيل ولا صوت حقيقي (لا خادم)، بل الردود الجاهزة. المصدر الوحيد هو مجلد frontend،
فأي تعديل فيه ينتقل لنسخة العرض بإعادة تشغيل هذا السكربت.
"""
import base64
import mimetypes
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FE = ROOT / "frontend"


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


index = (FE / "index.html").read_text(encoding="utf-8")
css = "\n".join((FE / m).read_text(encoding="utf-8") for m in re.findall(r'<link rel="stylesheet" href="(css/[^"]+)"', index))
js = "\n".join((FE / m).read_text(encoding="utf-8") for m in re.findall(r'<script src="([^"]+)"', index))

# صور الشخصيات: نضمّن المستخدم منها فقط (أودين). حركة الشخصيات القادمة لا تُضمَّن لتبقى النسخة خفيفة.
for name in ("odin_full.png", "odin_head.jpg", "umut_head.jpg", "nile_head.jpg"):
    js = js.replace(f"assets/characters/{name}", data_uri(FE / "assets/characters" / name))
for _b in ("cover.jpg", "logo.png"):
    js = js.replace(f"assets/brand/{_b}", data_uri(FE / "assets/brand" / _b))
css = re.sub(r"url\(\.\./assets/characters/[a-z_]+\.webp\)", "none", css)

body = re.search(r"<body>(.*?)\n\s*<script", index, re.S).group(1)
fonts = "\n".join(re.findall(r'<link[^>]+(?:preconnect|fonts\.googleapis)[^>]*>', index))
out = f"<title>حولك</title>\n{fonts}\n<style>\n{css}\n</style>\n{body}\n<script>\n{js}\n</script>\n"
dist = ROOT / "dist"
dist.mkdir(exist_ok=True)
(dist / "prototype.html").write_text(out, encoding="utf-8")
print(f"dist/prototype.html — {len(out) / 1e6:.1f} MB")
