"""اختبار دخان سريع للمسار الأساسي. شغّلي الخادم أولًا ثم:
    python3 tests/run_smoke.py
(يحتاج: pip install playwright && playwright install chromium)
"""
import os
import sys

from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:8000/")


def step(pg):
    return pg.evaluate("S.step")


def main():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        pg = browser.new_page(viewport={"width": 1100, "height": 900})
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(BASE)
        pg.wait_for_selector(".screen")

        # الغلاف أول صفحة، ثم الدول: إندونيسيا وماليزيا تفتحان، والباقي "قريبًا"
        assert step(pg) == "cover"
        pg.click("[data-act=enter]")
        assert step(pg) == "country"
        pg.evaluate("A.pickCountry('تركيا')")
        assert step(pg) == "country", "الدول القادمة لا يجب أن تفتح"
        pg.evaluate("A.pickCountry('ماليزيا')")
        assert step(pg) == "splash" and pg.evaluate("S.guide") == "id"

        # المقدمة ثم التعريف ثم الأسئلة (الميزانية آخر سؤال بخيارين)
        pg.evaluate("A.start();A.nextOnb();A.nextOnb()")
        assert step(pg) == "guide"
        pg.evaluate("A.beginQuiz()")
        for v in ("yes", "family"):
            pg.evaluate(f"A.answer('{v}')")
            pg.wait_for_timeout(450)
        assert pg.locator(".vopt").count() == 1, "سؤال الوجهة: جواب واحد (قباء)"
        pg.evaluate("A.answer('quba')")
        pg.wait_for_timeout(450)
        assert pg.locator(".vopt").count() == 4, "الاهتمامات: أربعة خيارات (بدون أطعمة من بلدي)"
        pg.evaluate("A.answer('hist');A.answer('local');A.doneMulti()")
        pg.wait_for_timeout(450)
        assert pg.locator(".vopt").count() == 2, "الميزانية خياران فقط"
        pg.evaluate("A.answer('eco')")
        pg.wait_for_timeout(3200)

        # الرئيسية: الأماكن نفسها (بطاقات)، فقط من الأقسام المختارة (أثري + تجارب) وبالميزانية الاقتصادية = ٣
        assert step(pg) == "main"
        assert pg.locator(".pfeat").count() == 3
        assert pg.locator(".pf-sec").count() == 2
        # أسماء الأقسام = أسماء الخيارات نفسها التي اختارها في سؤال «وش تحب؟»
        titles = pg.evaluate("[...document.querySelectorAll('.pf-head h3')].map(h=>h.innerText)")
        labels = pg.evaluate("['hist','local'].map(k=>LOC[S.guide].o.interests[k])")
        assert titles == labels, (titles, labels)

        # استكشف: كل الأماكن بكل الأنواع حتى لو لم يخترها الزائر وحتى بالميزانية الاقتصادية
        pg.evaluate("S.exView='list';tab('explore')")
        pg.wait_for_timeout(400)
        want = lambda: pg.evaluate("P.filter(p=>visAny(p)&&['sight','exp','food','cafe'].includes(p.cat)).length")
        assert pg.locator(".cultcard").count() == want() > 3, "استكشف يجب أن يتجاوز الأقسام المختارة"
        assert pg.locator(".cultcard").count() == 10, "استكشف يعرض الأماكن العشرة كلها"
        assert pg.locator(".chips .chip").count() == 5, "الكل + ٤ أنواع"
        pg.evaluate("S.budget='open';render()")
        assert pg.locator(".cultcard").count() == 10
        pg.evaluate("S.budget='eco';render()")

        # الخريطة: تظهر الأماكن التي لها موقع فقط (كل الأنواع)
        pg.evaluate("S.exView='map';tab('explore')")
        pg.wait_for_timeout(500)
        assert pg.locator("#mpins .pin").count() == pg.evaluate("filtered().filter(hasLoc).length") > 3

        # تبديل لغة الواجهة إلى العربية ثم الرجوع
        pg.click("#langfab")
        assert pg.evaluate("S.lang") == "ar"
        pg.click("#langfab")
        assert pg.evaluate("S.lang") is None

        # صوت الخادم إن فشل: لا يتكلم بالصوت القديم، بل ينبّه
        pg.route("**/api/tts", lambda r: r.fulfill(status=502, json={"detail": "x"}))
        pg.evaluate("(()=>{ S.srv={ask:false,stt:false,tts:true}; window.__spoke=0; const _s=speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak=u=>{ window.__spoke++; _s(u); }; })()")
        pg.evaluate("say('Halo','id-ID',null,true)")
        pg.wait_for_timeout(800)
        assert pg.evaluate("window.__spoke") == 0, "رجع للصوت القديم بدل التنبيه"
        browser.close()
    assert not errors, errors
    print("OK: المسار الأساسي يعمل")


if __name__ == "__main__":
    sys.exit(main())
