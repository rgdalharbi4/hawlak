/* Place */
function place(){
  const p=byId(S.pid); const saved=S.saved.has(p.id); const cat=p.cat==='svc'?SUB[p.sub][0]:CAT[p.cat].n;
  return `<div class="screen"><div class="phero">${artBlock(p)}<div class="topbar between" style="justify-content:space-between"><button class="iconbtn" data-act="back" aria-label="رجوع">${ico('back')}</button><button class="iconbtn" data-act="save" data-v="${p.id}" aria-label="حفظ" style="${saved?'color:#C0392B':''}">${ico('heart',saved?'fill':'')}</button></div></div>
  <div class="pad"><div class="row between" style="align-items:flex-start"><div class="grow"><span class="tag">${cat}</span><h2 style="font-size:1.7rem;margin-top:.3rem">${p.n}</h2>${IS_AR()?'':`<div class="small muted" data-ar>${p.nAr}</div>`}</div></div>
  <p style="margin:.6rem 0">${p.d}</p><button class="btn sm" data-act="sayPlace" data-v="${p.id}">${ico('speaker')}اسمعني</button>
  <div class="facts"><div class="fact"><small>الموقع والمسافة</small>${km(p.dist)} · ${etaTxt(p.dist)}</div>${p.hrs?`<div class="fact"><small>ساعات العمل</small>${hrs(p.hrs)}</div>`:''}${p.np?'':`<div class="fact"><small>متوسط السعر</small>${PRICE[p.price]}</div>`}<div class="fact"><small>مدة الزيارة</small>${p.cat==='svc'?T('حسب الحاجة'):T('نحو {0} دقيقة',AR(p.t))}</div></div>
  ${socCard(p)}<div class="why"><h4>ليش رشحته لك؟</h4><p>${why(p)}</p></div>
  <div class="actions" style="margin-top:1rem"><button class="btn primary" data-act="route" data-v="${p.id}" data-sheet="1">${ico('send')}خذني له</button><button class="btn" data-act="save" data-v="${p.id}">${ico('heart',saved?'fill':'')}${saved?'محفوظ':'احفظ'}</button><button class="btn" data-act="share" data-v="${p.id}">${ico('share')}شارك</button><button class="btn" data-act="book" data-v="${p.id}">${ico('cal')}احجز</button>${gmapsBtn(p)}</div>
  <p class="muted small" style="margin-top:1rem">بيانات تجريبية لأغراض العرض. الحجز والاتجاهات هنا محاكاة.</p></div></div>`;
}
const gmapsUrl=p=>'https://www.google.com/maps/dir/?api=1&travelmode='+(eta(p.dist).mode==='walk'?'walking':'driving')+'&destination='+p.lat+','+p.lon;
const gmapsBtn=(p,cls)=>`<a class="btn ${cls||''}" href="${gmapsUrl(p)}" target="_blank" rel="noopener noreferrer">${ico('pin')}${T('افتح في خرائط قوقل')}</a>`;
function routeSheet(p){
  const e=eta(p.dist);
  const dir=T(p.y>HOTEL.y?'الشمال':'الجنوب');
  const steps=e.mode==='walk'?[T('اخرج من فندقك واتجه نحو {0}',dir),T('امشِ نحو {0} م على الرصيف المظلل',AR(Math.max(100,Math.round(p.dist*.6/10)*10))),T('{0} سيكون أمامك',p.n)]:[T('اطلب سيارة أو استخدم الحافلة من أقرب محطة'),T('الطريق نحو {0} نحو {1}',dir,km(p.dist)),T('النزول أمام {0}',p.n)];
  sheet(`<h3 style="margin-bottom:.2rem">${T('الطريق إلى {0}',p.n)}</h3><p class="muted small">${km(p.dist)} · ${etaTxt(p.dist)}</p>
   <svg viewBox="0 0 300 90" style="width:100%;margin:.8rem 0" aria-hidden="true"><path d="M30 60C90 20 150 90 210 40S260 40 270 30" fill="none" stroke="var(--gold)" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round"/><circle cx="30" cy="60" r="8" fill="#2D7DE0" stroke="#fff" stroke-width="3"/><circle cx="270" cy="30" r="10" fill="var(--green)" stroke="#fff" stroke-width="3"/></svg>
   ${steps.map((s,i)=>`<div class="trait"><span class="badge">${AR(i+1)}</span><span>${s}</span></div>`).join('')}
   <div class="row" style="margin-top:1rem"><button class="btn primary grow" data-act="showOnMap" data-v="${p.id}">اعرض على الخريطة</button><button class="btn" data-act="closeSheet">إغلاق</button></div><div class="row" style="margin-top:.6rem">${gmapsBtn(p,'grow')}</div>`);
}
function bookSheet(p){
  S.bk={t:'٧:٠٠ م',n:2};
  sheet(`<h3 style="margin-bottom:.2rem">${T('حجز في {0}',p.n)}</h3><p class="muted small" style="margin-bottom:.8rem">عرض تجريبي، لن يتم أي حجز فعلي.</p>
   <b>الوقت</b><div class="chips" style="margin:.4rem 0 .9rem" id="bkt">${['٥:٠٠ م','٧:٠٠ م','٩:٠٠ م'].map(t=>`<button class="chip ${t==='٧:٠٠ م'?'on':''}" data-act="bkTime" data-v="${t}">${t}</button>`).join('')}</div>
   <b>عدد الأشخاص</b><div class="chips" style="margin:.4rem 0 1rem">${[1,2,3,4,6].map(n=>`<button class="chip ${n===2?'on':''}" data-act="bkN" data-v="${n}">${AR(n)}</button>`).join('')}</div>
   <button class="btn primary block" data-act="confirmBook" data-v="${p.id}">تأكيد الحجز</button>`);
}

