/* Main shell */
function nav(){
  const T=[['home','home','الرئيسية'],['explore','compass','استكشف'],['ask','spark','اسأل مرشدك'],['profile','user','حسابي']];
  return `<nav class="nav" aria-label="التنقل الرئيسي"><span class="navbrand">${BR()}</span>${T.map(t=>t[0]==='ask'?`<button class="mid ${S.tab==='ask'?'on':''}" data-act="tab" data-v="ask" aria-label="${t[2]}"><span class="fab">${ico('spark')}</span><span>${t[2]}</span></button>`:`<button class="${S.tab===t[0]?'on':''}" data-act="tab" data-v="${t[0]}">${ico(t[1])}<span>${t[2]}</span></button>`).join('')}<span class="navguide">${avatar(G().id,34)}<span>${G().name}</span></span></nav>`;
}
function main(){
  let body='';
  if(S.tab==='home') body=home(); else if(S.tab==='explore') body=explore(); else if(S.tab==='ask') body=ask(); else if(S.tab==='plan') body=planTab(); else body=profile();
  return body+nav();
}

function pcard(p){
  return `<button class="card pcard" data-act="openPlace" data-v="${p.id}">${artBlock(p)}<div class="meta"><span class="tag" style="align-self:flex-start">${p.cat==='svc'?SUB[p.sub][0]:CAT[p.cat].n}</span><h4>${p.n}</h4>${stat(p)}${p.cat!=='svc'?`<span class="soc">${T('{0}٪ من {1} أعجبهم',AR(socPct(p,S.guide)),natName(S.guide))}</span>`:''}</div></button>`;
}
function home(){
  const g=G(); const pre=false; const np=nextPrayer(S.now);
  const loved=P.filter(p=>p.cat!=='svc'&&vis(p)).map(p=>[socPct(p,g.id),p]).sort((a,b)=>b[0]-a[0]).slice(0,6).map(x=>x[1]);
  const grp=grpTxt[S.group]||'العائلة'; const tm=(TIME[S.time]||['٣ ساعات'])[0];
  const Lg=LOC[g.id]; const gl=Lg.greet(Lg.grp[S.group]||'',Lg.tm[S.time]||'');
  const hello= S.group==='solo' ? `بما إنك لوحدك، رتبت لك خيارات قريبة تناسبك.` : `بما إن معك ${grp}، رتبت لكم كم خيار قريب يناسبكم.`;
  const near=P.filter(p=>['sight','food','cafe','shop'].includes(p.cat)&&vis(p)&&p.dist<2200).map(p=>[score(p)+ (-p.dist/700),p]).sort((a,b)=>b[0]-a[0]).slice(0,6).map(x=>x[1]);
  const fp=ranked(['food'],8).find(p=>p.cult.includes(S.guide))||ranked(['food'],1)[0];
  const sp=ranked(['shop'],8).find(p=>p.cult.includes(S.guide))||ranked(['shop'],1)[0];
  const lp=ranked(['food','cafe','exp'],10).find(p=>p.cult.includes('local'))||ranked(['exp'],1)[0];
  const cult=[[g.prompts.food,fp,'food'],[g.prompts.shop,sp,'shop'],[g.prompts.local,lp,'exp']].filter(c=>c[1]);
  const TILES=[
   {act:'quick',v:'sights',ic:'dome',col:'#0E5A63',l:T('أماكن أزورها'),sub:T('مساجد ومتاحف ومعالم أثرية')},
   {act:'quick',v:'exp',ic:'star',col:'#3A6EA5',l:T('تجارب'),sub:T('جلسات ومشي وورش')},
   {act:'quick',v:'eat',ic:'food',col:'#B5473A',l:T('أكل وقهوة'),sub:T('مطاعم ومقاهي')}
  ];
  return `<div class="screen">
   <div class="hero">
    <div class="row between"><span></span>     <div class="row"><button class="iconbtn" data-act="voiceToggle" aria-label="الصوت" style="${S.voice?'':'opacity:.45'}">${ico('speaker')}</button><button class="iconbtn" data-act="a11ySheet" aria-label="إمكانية الوصول">${ico('access')}</button></div></div>
    <div class="row" style="margin-top:.7rem;align-items:flex-end;gap:.7rem">${figure(g.id,184,'speakable')}<div class="bubble grow">${pre?`<b>رحلتك قربت!</b><div class="small" style="margin-top:.2rem">${T('باقي {0} أيام على المدينة. خلّني أجهزك لها.',AR(3))}</div>`:`<span class="loc" dir="auto">${g.ok.replace('!','')}</span><b dir="auto" style="font-size:1.05rem;line-height:1.6;display:block">${gl}</b>${isAG(g.id)?'':`<div class="small ar-sub" style="margin-top:.3rem;color:#4F6264">${hello}</div>`}<button class="replay" style="margin-top:.4rem" data-act="sayHome">${ico('speaker')}${LOC[g.id].repeat}</button>`}</div></div>
    <div style="margin-top:.8rem"><span class="status">${ico('pin')}${pre?'وجهتك: المدينة المنورة':'أنت الآن في المدينة المنورة'}</span></div>
    <div style="height:1.1rem"></div>
   </div>
   <button class="askbar" data-act="tab" data-v="ask">${ico('search')}<span>اسألني أو ابحث عن مكان…</span><span style="margin-inline-start:auto">${ico('mic')}</span></button>
   <div class="pad wide" style="padding-top:.4rem">
   ${pre?preBlock():`
   <div class="tiles">${TILES.map(t=>`<button class="tile" data-act="${t.act}" ${t.v?`data-v="${t.v}"`:''}><span class="b" style="background:${t.col}">${ico(t.ic)}</span><b>${t.l}</b><small>${t.sub}</small></button>`).join('')}</div>`}
   </div></div>`;
}
const PRE_INFO={
 'جهّز رحلتك':['مستندات السفر والحجوزات جاهزة وبنسخة على جوالك.','حمّل تطبيقات الخدمات الرسمية قبل السفر.','فعّل الإنترنت أو شريحة محلية عند الوصول.','رتّب الأمتعة بحيث تكون خفيفة وسهلة الحمل.'],
 'تعرّف على الأحياء':['المنطقة المركزية: الأقرب للمسجد النبوي والأكثر ازدحامًا.','جهة قباء: هادئة وفيها مزارع ومسجد قباء.','جهة أحد: مواقع تاريخية، وتحتاج مواصلات.'],
 'أماكن قريبة من فندقك':['ندلّك على المطاعم والصيدليات وأقرب مصلى من فندقك فور تحديده.','أضف اسم فندقك في الحساب لتظهر لك المسافات بدقة.'],
 'وش تحتاج معك؟':['حذاء مريح للمشي الطويل.','زجاجة ماء وقبعة أو مظلة.','شاحن متنقل وأدوية شخصية.','ملابس محتشمة ومريحة.'],
 'أشياء لازم تعرفها':['أوقات الصلاة تغيّر الزحام، فخطّط زيارتك حولها.','الأدب العام مطلوب في المسجد: هدوء ولباس محتشم.','اسأل مرشدك عن أي معلومة دينية، ونرجعها لمصادر معتمدة.'],
 'احفظ أماكن لزيارتها':['اضغط على القلب في أي مكان ليُحفظ في رحلتك.','نرتب لك المحفوظات في خطة يوم عند وصولك.']
};
function preBlock(){
  const tiles=[['جهّز رحلتك','bag'],['تعرّف على الأحياء','map'],['أماكن قريبة من فندقك','pin'],['وش تحتاج معك؟','check'],['أشياء لازم تعرفها','info'],['احفظ أماكن لزيارتها','heart']];
  return `<div class="card" style="padding:1rem;margin-top:.4rem;background:var(--gold-soft);border-color:transparent"><h3>${T('باقي {0} أيام على المدينة',AR(3))}</h3><p class="muted small">جهّز كل شيء قبل أن تصل.</p></div>
  <div class="svc-grid" style="margin-top:.8rem">${tiles.map(t=>`<button class="card svc" data-act="preInfo" data-v="${t[0]}"><span class="b">${ico(t[1])}</span><span>${t[0]}</span></button>`).join('')}</div>
  <div class="sec-title"><h3>أماكن تستحق الحفظ</h3></div><div class="hscroll">${ranked(['sight','exp'],5).map(pcard).join('')}</div>`;
}

