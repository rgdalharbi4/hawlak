/* Lost / family safety */
function lost(){
  const g=G(),L=LOC[g.id],ar=isAG(g.id);
  const meet=P.filter(p=>p.sub==='meet').sort((a,b)=>a.dist-b.dist)[0];
  return `<div class="screen"><div class="topbar"><button class="iconbtn" data-act="back" aria-label="رجوع">${ico('back')}</button><h3 class="grow">تهت؟ لا تقلق</h3></div>
  <div class="vstage">${figure(g.id,190,'speakable')}<div class="vbub"><div class="bubble"><span class="big" dir="auto">${L.lost}</span>${ar?'':`<span class="ar-sub">${AR_LOST}</span>`}</div><button class="replay" data-act="sayLost">${ico('speaker')}${L.repeat}</button></div></div>
  <div class="pad">
   <div class="card driver"><b>١. أعطِ هذه الشاشة لسائق التاكسي</b><span class="big" id="drvName">${S.hotelName}</span><span id="drvAddr" class="muted">${S.hotelAddr}</span>
    <div class="row" style="margin-top:.7rem"><button class="btn primary grow" data-act="driverFull" style="min-height:52px;font-size:1.05rem">${ico('car')}اعرضها للسائق بخط كبير</button></div>
    <div class="field" style="margin:.8rem 0 0"><label for="hn">اسم الفندق</label><input class="in" id="hn" data-bind="hotelName" value="${S.hotelName}"></div>
    <div class="field" style="margin:.5rem 0 0"><label for="ha">العنوان بالعربي</label><input class="in" id="ha" data-bind="hotelAddr" value="${S.hotelAddr}"></div></div>
   <div class="card" style="padding:1rem;margin-top:.9rem"><b>٢. أقرب نقطة تجمع</b><div class="row" style="margin-top:.5rem">${artBlock(meet,'')}<div class="grow"><b>${meet.n}</b>${stat(meet)}</div></div>
    <button class="btn primary block" style="margin-top:.7rem;min-height:52px" data-act="route" data-v="${meet.id}">${ico('send')}خذني لها</button></div>
   <div class="card" style="padding:1rem;margin-top:.9rem"><b>٣. حماية العائلة</b>
    <button class="toggle" style="width:100%" data-act="shareToggle" role="switch" aria-checked="${S.share}"><span>أرسل موقعي لأهلي (عرض تجريبي)</span><span class="sw ${S.share?'on':''}"></span></button>
    <p class="muted small" style="margin:.6rem 0">بطاقة تعريف لطفل أو كبير سن: يريها لأي موظف أو رجل أمن.</p>
    <div class="idcard"><span class="small muted">أنا ضيف في المدينة المنورة</span><span class="big" id="idN">${S.idName||T('اسم الضيف')}</span><span id="idP">${S.idPhone?T('اتصل بمرافقي: {0}',S.idPhone):T('رقم المرافق')}</span><div class="small muted" style="margin-top:.3rem" id="idH">${T('فندقي: {0}',S.hotelName)}</div></div>
    <div class="row" style="margin-top:.6rem"><input class="in grow" aria-label="اسم الضيف" placeholder="اسم الضيف" data-bind="idName" value="${S.idName}"><input class="in grow" aria-label="رقم المرافق" placeholder="رقم المرافق" inputmode="tel" data-bind="idPhone" value="${S.idPhone}"></div></div>
   <div class="row" style="margin-top:.9rem;gap:.6rem"><button class="btn grow" style="min-height:52px;color:var(--c-svc);font-weight:700" data-act="quick" data-v="sos">${ico('sos')}طوارئ ٩١١ · ٩٩٧</button></div>
  </div></div>`;
}
function driverFull(){
  $('#layer').insertAdjacentHTML('afterbegin',`<button class="driverfull" data-ar data-act="closeDriver" aria-label="إغلاق"><p>من فضلك، خذني إلى</p><b>${S.hotelName}</b><p>${S.hotelAddr}</p><small>اضغط في أي مكان للإغلاق</small></button>`);
}
function qiblaSheet(){
  const L=LOC[S.guide];
  const ticks=Array.from({length:36},(_,i)=>{const lg=i%9===0;return `<line x1="130" y1="${lg?12:18}" x2="130" y2="26" transform="rotate(${i*10} 130 130)" stroke="var(--muted)" stroke-width="${lg?2.6:1.2}"/>`}).join('');
  sheet(`<h3>القبلة من المدينة المنورة</h3><p class="muted small">الاتجاه ١٨٦° من الشمال: جنوبًا مائلًا قليلًا نحو الغرب.</p>
   <svg viewBox="0 0 260 260" style="display:block;margin:.8rem auto;width:min(300px,100%)" role="img" aria-label="بوصلة القبلة"><g id="qrot"><circle cx="130" cy="130" r="112" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/>${ticks}
    <text x="130" y="52" text-anchor="middle" font-size="13" fill="var(--ink)">شمال</text><text x="158" y="214" text-anchor="middle" font-size="12" fill="var(--ink)">جنوب</text><text x="212" y="135" text-anchor="middle" font-size="13" fill="var(--ink)">شرق</text><text x="48" y="135" text-anchor="middle" font-size="13" fill="var(--ink)">غرب</text>
    <g transform="rotate(186 130 130)"><path d="M130 130V50" stroke="var(--gold)" stroke-width="6" stroke-linecap="round"/><polygon points="130,36 118,60 142,60" fill="var(--gold)"/><rect x="119" y="10" width="22" height="22" rx="3" fill="#10262B"/><rect x="119" y="17" width="22" height="4" fill="#B94A24"/></g></g><circle cx="130" cy="130" r="7" fill="var(--green)"/></svg>
   <p class="small muted" style="text-align:center">المربع الأسود يرمز إلى الكعبة.</p>
   <div class="row" style="margin-top:.8rem"><button class="btn primary grow" data-act="qiblaLive">استخدم بوصلة الجوال</button><button class="btn" data-act="closeSheet">إغلاق</button></div>`);
  sayG(L.qibla);
}
async function qiblaLive(){
  try{
    if(typeof DeviceOrientationEvent==='undefined'){ toast('البوصلة غير متاحة في هذا الجهاز'); return; }
    if(DeviceOrientationEvent.requestPermission){ const r=await DeviceOrientationEvent.requestPermission(); if(r!=='granted'){ toast('لم يُسمح باستخدام البوصلة'); return; } }
    const h=e=>{ const hd=e.webkitCompassHeading!=null?e.webkitCompassHeading:(e.alpha!=null?(360-e.alpha):null); const r=$('#qrot'); if(hd!=null&&r) r.setAttribute('transform',`rotate(${-hd} 130 130)`); };
    window.addEventListener('deviceorientationabsolute',h,true); window.addEventListener('deviceorientation',h,true);
    toast('أدر جوالك حتى يظهر المربع الأسود أعلى الشاشة');
  }catch(e){ toast('تعذّر تشغيل البوصلة هنا'); }
}


function crowd(t){ for(const [n,at] of PRAY){ if(t>=at-40&&t<=at+50) return {high:true,until:at+50}; } const nx=nextPrayer(t); return {high:false,pi:nx.i}; }
const crowdTxt=t=>{ const c=crowd(t); return c.high?T('الزحام مرتفع حول المسجد الآن. الأفضل بعد {0}',fmtT(c.until)):T('الزحام هادئ الآن. وقت مناسب للزيارة قبل ازدحام {0}',prayName(c.pi)); };
