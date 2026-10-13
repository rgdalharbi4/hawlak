"""الوكيل الذكي (النموذج اللغوي).

الفكرة: دالة واحدة `ask_llm` يستدعيها بقية الكود، ولا يهمها أي مزود وراءها.
المزودون: fake (وهمي) و groq و gemini و anthropic. نختار بـ LLM_PROVIDER في .env.
المفتاح من LLM_API_KEY، والنموذج من LLM_MODEL (وإلا نستخدم الافتراضي أدناه).

لإضافة مزود جديد: اكتبي دالة بنفس الشكل وسجّليها في PROVIDERS.
"""
import json
import time

import httpx

from app import config

# للاختبارات: نستبدل الشبكة الحقيقية بشبكة وهمية
HTTP_TRANSPORT: httpx.BaseTransport | None = None
TIMEOUT = 30.0

DEFAULT_MODELS = {
    "groq": "openai/gpt-oss-120b",
    "gemini": "gemini-flash-latest",
    "anthropic": "claude-sonnet-5-5",
}


def _client() -> httpx.Client:
    return httpx.Client(timeout=TIMEOUT, transport=HTTP_TRANSPORT)


def _post(name: str, url: str, **kw) -> dict:
    """يرسل الطلب ويعيد المحاولة عند الازدحام (429) أو أخطاء الخادم، ثم يرجع JSON أو يرمي خطأ واضحًا."""
    for attempt in range(3):
        with _client() as c:
            r = c.post(url, **kw)
        if r.status_code in (429, 500, 502, 503, 504) and attempt < 2:
            try:
                wait = float(r.headers.get("retry-after", 2 * (attempt + 1)))
            except ValueError:
                wait = 2.0
            time.sleep(min(wait, 10))
            continue
        break
    if r.status_code >= 400:
        raise RuntimeError(f"{name} HTTP {r.status_code}: {r.text[:300]}")
    return r.json()


def _need_key() -> str:
    key = config.get("LLM_API_KEY")
    if not key:
        raise RuntimeError("LLM_API_KEY غير موجود في ملف .env")
    return key


def _model(provider: str) -> str:
    return config.get("LLM_MODEL") or DEFAULT_MODELS[provider]


def _fake(system_prompt: str, messages: list[dict]) -> str:
    """رد وهمي بنفس شكل الرد الحقيقي (JSON) لاختبار الأنبوب بدون خدمة خارجية."""
    last = messages[-1]["content"] if messages else ""
    return json.dumps(
        {"id": f"[uji] Pertanyaanmu: {last}", "ar": f"[وهمي] سؤالك: {last}", "place_ids": []},
        ensure_ascii=False,
    )


def _groq(system_prompt: str, messages: list[dict]) -> str:
    body = {
        "model": _model("groq"),
        "messages": [{"role": "system", "content": system_prompt}, *messages],
        "temperature": 0.1,
        "max_tokens": 700,
        "response_format": {"type": "json_object"},
    }
    headers = {"Authorization": f"Bearer {_need_key()}"}
    url = "https://api.groq.com/openai/v1/chat/completions"
    try:
        data = _post("groq", url, headers=headers, json=body)
    except RuntimeError as e:
        # وضع JSON عند Groq يفشل أحيانًا: نعيد بدونه ونعتمد على parse_reply لاستخراج الـJSON
        if "json_validate_failed" not in str(e):
            raise
        body.pop("response_format", None)
        data = _post("groq", url, headers=headers, json=body)
    return data["choices"][0]["message"]["content"]


def _gemini(system_prompt: str, messages: list[dict]) -> str:
    body = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [
            {"role": "user" if m["role"] == "user" else "model", "parts": [{"text": m["content"]}]}
            for m in messages
        ],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json", "maxOutputTokens": 700},
    }
    data = _post("gemini", f"https://generativelanguage.googleapis.com/v1beta/models/{_model('gemini')}:generateContent",
                 headers={"x-goog-api-key": _need_key()}, json=body)
    return data["candidates"][0]["content"]["parts"][0]["text"]


def _anthropic(system_prompt: str, messages: list[dict]) -> str:
    body = {"model": _model("anthropic"), "max_tokens": 700, "temperature": 0.1, "system": system_prompt, "messages": messages}
    data = _post("anthropic", "https://api.anthropic.com/v1/messages",
                 headers={"x-api-key": _need_key(), "anthropic-version": "2023-06-01"}, json=body)
    return data["content"][0]["text"]


PROVIDERS = {"fake": _fake, "groq": _groq, "gemini": _gemini, "anthropic": _anthropic}


def ask_llm(system_prompt: str, messages: list[dict]) -> str:
    """messages: قائمة مثل [{"role": "user", "content": "..."}]. ترجع نص رد النموذج."""
    name = config.providers()["llm"]
    if name not in PROVIDERS:
        raise ValueError(f"مزود الوكيل غير معروف: {name}")
    return PROVIDERS[name](system_prompt, messages)
