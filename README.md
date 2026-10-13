# حولك (Hawlak)

تطبيق ويب يرافق زائر المدينة المنورة بمرشد رقمي من بلده، يتحدث بلغته ولهجته ويفهم صوته. موجّه لكبار السن الذين يصعب عليهم الكتابة. النسخة الحالية تركّز على **منطقة قباء** وبمرشد واحد: **أودين** للإندونيسيين والماليزيين.

> الحالة: نموذج أولي يعمل (MVP). الأماكن حقيقية (الأسماء والمواقع) لكن بلا تقييمات أو أسعار أو ساعات عمل. الوكيل الذكي والصوت لم يُربطا بخدمات حقيقية بعد. راجعي [docs/ROADMAP.md](docs/ROADMAP.md).

## هيكل المشروع

```
hawlak/
├── frontend/            الواجهة (HTML/CSS/JS بدون أدوات بناء)
│   ├── index.html
│   ├── css/             الأنماط: base, screens, characters, layout
│   ├── js/
│   │   ├── data/        الأماكن والمرشدون والبيانات الأساسية
│   │   ├── i18n/        الترجمات وأسطر المرشد الصوتية
│   │   ├── screens/     الشاشات (البداية، الرئيسية، الاستكشاف، المكان، الوكيل...)
│   │   ├── legacy/      ميزات محذوفة من النطاق ولا تُحمَّل (للرجوع إليها فقط)
│   │   └── ...          الحالة، الصوت، الإجراءات، الأحداث
│   └── assets/          صور وحركات الشخصيات
├── backend/             خادم FastAPI
│   ├── app/main.py      الواجهة البرمجية + تقديم الواجهة
│   └── data/places.json أماكن قباء
├── docs/                نطاق المشروع وخارطة الطريق ومصادر البيانات
└── tests/               اختبار دخان للمسار الأساسي
```

## التشغيل محليًا

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

ثم افتحي http://localhost:8000

الاختبار (والخادم يعمل):

```bash
pip install playwright && playwright install chromium
python3 tests/smoke_test.py
```

## المفاتيح

انسخي `.env.example` إلى `.env` وضعي مفاتيح الخدمات فيه. ملف `.env` مستثنى من git ولا يُرفع.

## ربط المستودع بـ GitHub

المستودع المحلي جاهز وفيه أول commit. أنشئي مستودعًا فارغًا باسم `hawlak` على GitHub (بدون README) ثم نفّذي:

```bash
git remote add origin https://github.com/<اسم-حسابك>/hawlak.git
git push -u origin main
```
