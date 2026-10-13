/* ============ Screens ============ */
const TABS=['home','explore','ask','plan','profile'];
function screen(){
  switch(S.step){
   case 'cover':return cover();
   case 'splash':return splash();
   case 'onb':return onb();
   case 'country':return country();
   case 'guide':return guideReveal();
   case 'quiz':return quiz();
   case 'place':return place();
   default: return main();
  }
}
const LAT=Object.fromEntries(QP.map(q=>[q[0],q[6].latin]));
function setNames(){ P.forEach(p=>{ p.n=IS_AR()?p.nAr:(DICT[p.nAr]?T(p.nAr):(LAT[p.id]||p.nAr)); }); }
function render(keepScroll){
  const sc=$('.screen'); const top=sc?sc.scrollTop:0;
  const ae=document.activeElement; const keep=ae&&(ae.id==='chatq'||ae.id==='q')?{id:ae.id,v:ae.value,p:ae.selectionStart}:null;
  setNames();
  const html=screen();
  $('#app').innerHTML=html;
  const st=$('.stage'); const UL=UIL(); st.dir=(UL==='ar')?'rtl':'ltr'; st.lang=UL; st.classList.toggle('nosub',!S.subs); localize($('#app'));
  const n=$('.screen'); if(n&&keepScroll){ n.scrollTop=top; n.style.animation='none'; }
  if(keep){const i=document.getElementById(keep.id); if(i){ if(keep.id==='chatq') i.value=keep.v; i.focus(); try{i.setSelectionRange(keep.p,keep.p);}catch(e){} }}
  if($('#mapsvg')) mapInit();
  let bar=$('#langbar'); if(!bar){ bar=document.createElement('div'); bar.id='langbar'; bar.innerHTML='<button id="langfab" data-act="toggleLang"></button>'; $('#app').before(bar); }
  const lf=$('#langfab'); bar.hidden=!S.guide; const NL={id:'Bahasa Indonesia',tr:'Türkçe',fr:'Français',uk:'English',eg:'العربية',ar:'العربية'};
  lf.innerHTML=ico('globe')+(S.lang==='ar'?NL[S.guide||'id']:'العربية'); lf.setAttribute('aria-label',S.lang==='ar'?'Ganti bahasa ke '+NL[S.guide||'id']:'تحويل اللغة إلى العربية');
  document.documentElement.classList.toggle('big',S.a11y.big);
  document.documentElement.dataset.hc=S.a11y.hc?'1':'0';
}
function go(step,extra){ if(typeof reelStop==='function') reelStop(); Object.assign(S,extra||{}); S.step=step; closeSheet(); render(); const n=$('.screen'); if(n) n.scrollTop=0; }
function tab(t){ S.step='main'; S.tab=t; S.mapSel=null; let first=false; if(t==='ask'&&!S.chat.length){ startChat(); first=true; } render(); if(first) sayG(LOC[S.guide].help); }

function splash(){
  return `<div class="screen splash"><div class="pat"></div><button class="iconbtn" data-act="restart" aria-label="رجوع" style="position:absolute;top:.9rem;inset-inline-start:.9rem;z-index:2">${ico('back')}</button>
   <div class="logo">${logoSvg()}</div>
   <h1>${BR()}</h1>
   <div class="motto">المدينة بطريقتك</div>
   <p class="sub">مرشد من ثقافتك يرافقك في رحلتك.</p>
   ${S.guide?avatar(S.guide,92):''}
   <button class="btn" data-act="start">ابدأ رحلتك</button></div>`;
}
function logoSvg(){return `<img src="assets/brand/logo.png" alt="حولك">`}

function onb(){
  const S3=[
   {t:'اكتشف ما يناسبك',d:'أماكن أثرية وتجارب وأكل وقهوة تُقترح حسب اهتماماتك.'},
   {t:'مرشد يفهمك',d:'يتحدث بلغتك ولهجتك، ويساعدك في كل خطوة من رحلتك.'}
  ][S.onb];
  return `<div class="screen onb"><div class="topbar between" style="justify-content:space-between"><button class="iconbtn" data-act="prevOnb" aria-label="رجوع">${ico('back')}</button><button class="btn ghost sm" data-act="skipOnb">تخطي</button></div>
   <div class="otext"><h2>${S3.t}</h2><p>${S3.d}</p></div>
   <div class="txt"><div class="dots">${[0,1].map(i=>`<i class="${i===S.onb?'on':''}"></i>`).join('')}</div>
   <button class="btn primary block" data-act="nextOnb">${S.onb<1?'التالي':'ابدأ الآن'}</button></div></div>`;
}
/* الغلاف: أول صفحة. صورة الهوية وزر ابدأ */
function cover(){
  return `<div class="screen cover" data-ar><img src="assets/brand/cover.jpg" alt="حولك">
   <button class="btn start" data-act="enter"><span class="start-ar">ابدأ</span><span class="start-sub"><i>Start</i><b></b><i>Mulai</i><b></b><i>Başla</i></span></button></div>`;
}
function country(){
  const q=S.q.trim().toLowerCase(); const list=COUNTRIES.filter(c=>!q||c[0].includes(q)||NATIVE[c[0]].toLowerCase().includes(q));
  return `<div class="screen" data-ar><div class="pad" style="padding-top:1.6rem"><button class="iconbtn" data-act="go" data-v="cover" aria-label="رجوع" style="position:absolute;top:.9rem;inset-inline-start:.9rem">${ico('back')}</button>
   <div style="text-align:center;margin-bottom:1rem"><div class="logo" style="margin:0 auto .6rem;width:76px;height:76px;border-radius:22px">${logoSvg()}</div><h1 style="font-size:2.3rem;color:var(--green)">${BRAND} · Hawlak</h1></div>
   <h2 style="font-size:1.6rem;text-align:center">من وين جايينا؟</h2>
   <p style="text-align:center;margin:.2rem 0 1rem;font-size:1.15rem" dir="auto">Where are you from? · Nerelisin? · Dari mana asalmu?</p>
   <div style="display:flex;flex-direction:column;gap:.55rem;margin-top:1.2rem">${list.map(c=>`<button class="country" data-act="pickCountry" data-v="${c[0]}"><span class="flag">${c[1]}</span><span class="grow"><b dir="auto" style="font-size:1.15rem">${NATIVE[c[0]]}</b><small class="muted" style="display:block">${c[0]}</small></span>${c[2]?avatar(c[2],40):'<span class="badge">قريبًا · Soon</span>'}</button>`).join('')||'<p class="muted">لا توجد نتيجة · No results</p>'}</div></div></div>`;
}
function guideReveal(){
  const g=G();
  return `<div class="screen"><div class="topbar"><button class="iconbtn" data-act="prevGuide" aria-label="رجوع">${ico('back')}</button><span class="badge">مرشدك الرقمي</span></div>
   <div class="gh">${figure(g.id,300,'speakable')}
   <div><h2>${g.name}</h2><p class="muted">${T('مرشدك في المدينة · {0}',T(g.country))}</p></div>
   <p class="quote">«<span>${g.quote}</span>»</p>
   <div class="lang-line"><span class="small muted">${T('يتكلم بلغتك: {0}',T(g.lang))}</span><b dir="auto" style="margin-top:.2rem;font-size:1.2rem">${g.hello}</b>${isAG(g.id)?'':`<span class="small muted ar-sub">${g.helloAr}</span>`}
   <button class="btn sm" style="margin-top:.6rem" data-act="speak" data-t="${g.hello.replace(/"/g,'&quot;')}" data-l="${g.speak}">${ico('speaker')}اسمع الترحيب</button></div>
   <button class="btn primary block" data-act="beginQuiz">يلا نبدأ</button></div></div>`;
}

const QS=[
 {k:'first',q:'أول مرة تزور المدينة؟',o:[['yes','نعم'],['no','لا']]},
 {k:'group',q:'مين معك في الرحلة؟',o:[['solo','لوحدي'],['family','العائلة'],['kids','أطفال'],['elder','كبار سن'],['friends','أصدقاء']]},
 {k:'dest',q:'وين وجهتك حاليًا؟',o:[['quba','قباء']]},
 {k:'interests',q:'وش تحب أكثر؟ تقدر تختار أكثر من خيار.',multi:true,o:INTERESTS},
 {k:'budget',q:'كم ميزانيتك اليوم؟',o:[['eco','اقتصادية'],['open','مفتوحة']]}
];
