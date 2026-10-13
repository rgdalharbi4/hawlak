/* Main shell */
function nav(){
  const T=[['home','home','الرئيسية'],['explore','compass','استكشف'],['ask','spark','اسأل مرشدك'],['profile','user','حسابي']];
  return `<nav class="nav" aria-label="التنقل الرئيسي"><span class="navbrand"><img class="brandlogo" src="assets/brand/logo.png" alt="">${BR()}</span>${T.map(t=>t[0]==='ask'?`<button class="mid ${S.tab==='ask'?'on':''}" data-act="tab" data-v="ask" aria-label="${t[2]}"><span class="fab">${ico('spark')}</span><span>${t[2]}</span></button>`:`<button class="${S.tab===t[0]?'on':''}" data-act="tab" data-v="${t[0]}">${ico(t[1])}<span>${t[2]}</span></button>`).join('')}<span class="navguide">${avatar(G().id,34)}<span>${G().name}</span></span></nav>`;
}
function main(){
  let body='';
  if(S.tab==='home') body=home(); else if(S.tab==='explore') body=explore(); else if(S.tab==='ask') body=ask(); else if(S.tab==='plan') body=planTab(); else body=profile();
  return body+nav();
}

/* ===== الرئيسية: الأماكن نفسها بتصميم فاخر، مقسّمة بحسب ما اختاره الزائر ===== */
const GROUP_META={sight:{ic:'dome'},exp:{ic:'star'},food:{ic:'food'},cafe:{ic:'coffee'}};
function featCard(p,i){
  const c=CAT[p.cat], ic=c.ic;
  const meta=p.dist==null?'':`<span class="pf-meta">${ico(eta(p.dist).mode==='walk'?'walk':'car')}${km(p.dist)} · ${etaTxt(p.dist)}</span>`;
  return `<article class="pfeat" style="--i:${i};--c:var(${c.col})">
   <button class="pf-main" data-act="openPlace" data-v="${p.id}">
    <span class="pf-art" aria-hidden="true">${ico(ic)}<span class="pf-mark">${ico(ic)}</span><span class="pf-tag">${T(c.n)}</span></span>
    <span class="pf-body"><b class="pf-name">${p.n}</b><span class="pf-desc">${p.d}</span>${meta}</span>
   </button>
   <div class="pf-foot"><button class="pf-go" data-act="openPlace" data-v="${p.id}">${T('التفاصيل')} <span aria-hidden="true">${IS_AR()?'‹':'›'}</span></button>${gmapsBtn(p,'pf-map sm')}</div>
  </article>`;
}
function showcase(){
  let n=0;
  const html=groupsWanted().map(g=>{
    const list=P.filter(p=>vis(p)&&g[2].includes(p.cat)); if(!list.length) return '';
    return `<section class="pf-sec"><div class="pf-head"><span class="pf-ic">${ico(GROUP_META[g[0]].ic)}</span><div class="grow"><h3>${g[1]}</h3></div><span class="pf-count">${AR(list.length)}</span></div><div class="pf-grid">${list.map(p=>featCard(p,n++)).join('')}</div></section>`;
  }).join('');
  return html||`<p class="muted" style="margin-top:1.2rem">${T('لا توجد أماكن تطابق اختياراتك')}</p>`;
}
function home(){
  const g=G(); const pre=false; const np=nextPrayer(S.now);
  const grp=grpTxt[S.group]||'العائلة'; const tm=(TIME[S.time]||['٣ ساعات'])[0];
  const Lg=LOC[g.id]; const gl=Lg.greet(Lg.grp[S.group]||'',Lg.tm[S.time]||'');
  const hello= S.group==='solo' ? `بما إنك لوحدك، رتبت لك خيارات قريبة تناسبك.` : `بما إن معك ${grp}، رتبت لكم كم خيار قريب يناسبكم.`;
  return `<div class="screen">
   <div class="hero">
    <div class="row between"><span class="herobrand"><img class="brandlogo" src="assets/brand/logo.png" alt=""><b>${BR()}</b></span>     <div class="row"><button class="iconbtn" data-act="voiceToggle" aria-label="الصوت" style="${S.voice?'':'opacity:.45'}">${ico('speaker')}</button><button class="iconbtn" data-act="a11ySheet" aria-label="إمكانية الوصول">${ico('access')}</button></div></div>
    <div class="row" style="margin-top:.7rem;align-items:flex-end;gap:.7rem">${figure(g.id,184,'speakable')}<div class="bubble grow">${pre?`<b>رحلتك قربت!</b><div class="small" style="margin-top:.2rem">${T('باقي {0} أيام على المدينة. خلّني أجهزك لها.',AR(3))}</div>`:`<span class="loc" dir="auto">${g.ok.replace('!','')}</span><b dir="auto" style="font-size:1.05rem;line-height:1.6;display:block">${gl}</b>${isAG(g.id)?'':`<div class="small ar-sub" style="margin-top:.3rem;color:#4F6264">${hello}</div>`}<button class="replay" style="margin-top:.4rem" data-act="sayHome">${ico('speaker')}${LOC[g.id].repeat}</button>`}</div></div>
    <div style="margin-top:.8rem"><span class="status">${ico('pin')}${pre?'وجهتك: المدينة المنورة':'أنت الآن في المدينة المنورة'}</span></div>
    <div style="height:1.1rem"></div>
   </div>
   <button class="askbar" data-act="tab" data-v="ask">${ico('search')}<span>اسألني أو ابحث عن مكان…</span><span style="margin-inline-start:auto">${ico('mic')}</span></button>
   <div class="pad wide" style="padding-top:.4rem">
   ${showcase()}
   </div></div>`;
}

