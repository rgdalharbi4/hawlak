function needLogin(fn){
  if(S.user){ fn(); return; } S.after=fn;
  sheet(`<h3>سجّل دخولك لتكمل</h3><p class="muted small" style="margin:.2rem 0 .8rem">نطلب التسجيل فقط عند الحفظ أو الحجز.</p>
   <div class="field"><label for="lgN">الاسم</label><input class="in" id="lgN" autocomplete="name"></div>
   <div class="field"><label for="lgP">رقم الجوال</label><input class="in" id="lgP" inputmode="tel" autocomplete="tel"></div>
   <button class="btn primary block" data-act="doLogin">متابعة</button><button class="btn ghost block" style="margin-top:.4rem" data-act="closeSheet">ليس الآن</button>
   <p class="muted small" style="margin-top:.6rem">عرض تجريبي، لا يُرسل أي رمز حقيقي.</p>`);
}

