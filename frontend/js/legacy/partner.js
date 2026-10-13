/* Partner */
function partner(){
  return `<div class="screen" data-ar><div class="topbar"><button class="iconbtn" data-act="back" aria-label="رجوع">${ico('back')}</button></div><div class="pad" style="padding-top:0">
  <h2 style="font-size:1.9rem">انضم إلى شبكة شركائنا</h2><p class="muted" style="margin:.3rem 0 1rem">أضف نشاطك ليصل إلى زوار المدينة بلغتهم. نموذج تجريبي.</p>
  <div id="pForm">
   <b>نوع النشاط</b><div class="chips" style="margin:.4rem 0 1rem">${['مطعم','مقهى','متجر','تجربة سياحية','نقل','فندق','مزود خدمة'].map((c,i)=>`<button class="chip ${i===0?'on':''}" data-act="pcat">${c}</button>`).join('')}</div>
   ${[['اسم النشاط','text'],['الموقع','text'],['وصف النشاط','text'],['ساعات العمل','text'],['اللغات المتوفرة','text'],['متوسط الأسعار','text'],['وسيلة التواصل','text']].map((f,i)=>`<div class="field"><label for="pf${i}">${f[0]}</label><input id="pf${i}" type="${f[1]}"></div>`).join('')}
   <div class="field"><label for="pf9">صور النشاط</label><button class="btn" id="pf9" type="button" data-act="toast" data-v="رفع الصور غير مفعّل في النموذج التجريبي">${ico('plus')}أضف صورًا</button></div>
   <button class="btn primary block" data-act="sendPartner">إرسال الطلب</button></div>
  <div class="sec-title"><h3>كيف تحقق المنصة إيراداتها</h3></div>
  <div class="card" style="padding:.3rem 1rem">${[['شركات الحج والعمرة (رعاة)','رعاية الشخصية أو حملة، وترويج لباقاتهم. تتواصل المنصة معهم مباشرة.'],['المتاجر والمطاعم','قوائم مميزة في الاقتراحات القريبة، وعمولة على الحجوزات.'],['الفعاليات والتجارب','تذاكر وحجوزات بعمولة.']].map(r=>`<div class="rev"><span class="badge ok">${ico('check')}</span><div><b>${r[0]}</b><div class="muted small">${r[1]}</div></div></div>`).join('')}</div>
  <p class="muted small" style="margin-top:.7rem">قاعدة ثابتة: لا نُغرق الزائر بالإعلانات، والترشيح الأول دائمًا لما يناسبه.</p></div></div>`;
}

