"""اختبار دخان سريع للمسار الأساسي. شغّلي الخادم أولًا ثم:
    python3 tests/smoke_test.py
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

        # الدول: إندونيسيا وماليزيا تفتحان، والباقي "قريبًا"
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
        pg.evaluate("A.answer('hist');A.doneMulti()")
        pg.wait_for_timeout(450)
        assert pg.locator(".vopt").count() == 2, "الميزانية خياران فقط"
        pg.evaluate("A.answer('open')")
        pg.wait_for_timeout(3200)

        # الرئيسية: ثلاث خدمات فقط
        assert step(pg) == "main"
        assert pg.locator(".tile").count() == 3

        # الاستكشاف والخريطة
        pg.evaluate("S.exView='map';tab('explore')")
        pg.wait_for_timeout(500)
        assert pg.locator("#mpins .pin").count() > 0

        # تبديل لغة الواجهة إلى العربية ثم الرجوع
        pg.click("#langfab")
        assert pg.evaluate("S.lang") == "ar"
        pg.click("#langfab")
        assert pg.evaluate("S.lang") is None

        browser.close()
    assert not errors, errors
    print("OK: المسار الأساسي يعمل")


if __name__ == "__main__":
    sys.exit(main())
