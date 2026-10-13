function prayer(){
  const np=nextPrayer(S.now);
  return `<div class="screen"><div class="topbar"><button class="iconbtn" data-act="back" aria-label="رجوع">${ico('back')}</button><h3 class="grow">الصلاة والقبلة</h3></div><div class="pad" style="padding-top:0">
   <div class="card" style="padding:1rem;background:var(--gold-soft);border-color:transparent"><span class="small muted">الصلاة القادمة · أوقات تقريبية للعرض</span><div style="font-size:1.6rem;font-weight:700;margin:.2rem 0">${T('{0} بعد {1}',prayName(np.i),durTxt(np.in))}</div><div class="small">${crowdTxt(S.now)} <span class="muted">(${T('تقدير للعرض')})</span></div></div>
   <div class="card" style="padding:.3rem 1rem;margin-top:.8rem">${PRAY.map((p,i)=>`<div class="rev" style="justify-content:space-between;align-items:center"><b style="font-size:1.1rem">${prayName(i)}</b><span style="font-size:1.1rem">${fmtT(p[1])}</span>${np.i===i?`<span class="badge ok">${T('التالية')}</span>`:'<span></span>'}</div>`).join('')}</div>
   <div class="row" style="margin-top:.9rem;gap:.6rem"><button class="btn primary grow" style="min-height:58px;font-size:1.1rem" data-act="qibla">${ico('compass')}القبلة</button><button class="btn grow" style="min-height:58px;font-size:1.1rem" data-act="quick" data-v="plan">${ico('cal')}خطط يومي حول الصلاة</button></div></div></div>`;
}
function picks(){
  const g=G();
  const loved=P.filter(p=>p.cat!=='svc'&&vis(p)).map(p=>[socPct(p,g.id),p]).sort((a,b)=>b[0]-a[0]).slice(0,6).map(x=>x[1]);
  const near=P.filter(p=>['sight','food','cafe','shop'].includes(p.cat)&&vis(p)&&p.dist<2200).map(p=>[score(p)+(-p.dist/700),p]).sort((a,b)=>b[0]-a[0]).slice(0,6).map(x=>x[1]);
  const fp=ranked(['food'],8).find(p=>p.cult.includes(S.guide))||ranked(['food'],1)[0];
  const sp=ranked(['shop'],8).find(p=>p.cult.includes(S.guide))||ranked(['shop'],1)[0];
  const lp=ranked(['food','cafe','exp'],10).find(p=>p.cult.includes('local'))||ranked(['exp'],1)[0];
  const cult=[[g.prompts.food,fp],[g.prompts.shop,sp],[g.prompts.local,lp]].filter(c=>c[1]);
  return `<div class="screen"><div class="topbar"><button class="iconbtn" data-act="back" aria-label="رجوع">${ico('back')}</button><h3 class="grow">اقتراحات لك</h3></div><div class="pad wide" style="padding-top:0">
   <div class="sec-title" style="margin-top:.2rem"><h3>حولك الآن</h3><span>${T('{0} أماكن قريبة',AR(near.length))}</span></div>
   <div class="hscroll">${near.map(pcard).join('')}</div>
   <div class="sec-title"><h3>أعجب أبناء بلدك</h3><span>${T('{0} · بيانات تجريبية',natName(g.id))}</span></div>
   <div class="hscroll">${loved.map(pcard).join('')}</div>
   <div class="sec-title"><h3>اختيارات على جوّك</h3><span>من ثقافتك وإلى ثقافتنا</span></div>
   <div class="cults" style="display:flex;flex-direction:column;gap:.7rem">${cult.map(c=>`<button class="card cultcard" data-act="openPlace" data-v="${c[1].id}">${artBlock(c[1])}<span class="grow"><span class="prompt">${c[0]}</span><span class="muted small" style="display:block">${c[1].n} · ${km(c[1].dist)}</span></span>${ico('fwd')}</button>`).join('')}</div></div></div>`;
}
