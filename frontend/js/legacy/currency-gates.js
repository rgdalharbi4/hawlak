/* Demo exchange rates only. A real build would read a rates feed. */
const RATE={id:['Rp',4300],tr:['₺',10.8],eg:['EGP',12.9],ar:['$',0.27]};
function currency(){
  const g=G(); let [sym,rate]=RATE[g.id]||RATE.ar; if(g.id==='eg'&&IS_AR()) sym='جنيه'; const sar=S.sar||100; const v=sar*rate;
  const num=AR(new Intl.NumberFormat('en-US',{maximumFractionDigits:rate>100?0:2}).format(v));
  const atms=P.filter(p=>p.sub==='atm').sort((a,b)=>a.dist-b.dist);
  return `<div class="screen"><div class="topbar"><button class="iconbtn" data-act="back" aria-label="رجوع">${ico('back')}</button><h3 class="grow">تحويل العملات</h3></div><div class="pad" style="padding-top:0">
   <div class="card" style="padding:1rem"><b>المبلغ بالريال السعودي</b>
    <div class="chips" style="margin:.6rem 0">${[50,100,200,500,1000].map(n=>`<button class="chip ${sar===n?'on':''}" data-act="setSar" data-v="${n}">${AR(n)}</button>`).join('')}</div>
    <div style="font-size:1.9rem;font-weight:700;color:var(--green);line-height:1.4">${T('{0} ريال ≈ {1}',AR(sar),num+' '+sym)}</div>
    <p class="muted small" style="margin-top:.4rem">أسعار تجريبية للعرض وليست أسعارًا حقيقية.</p></div>
   <div class="sec-title"><h3>أقرب صرّاف ومكاتب صرافة</h3></div>
   <div style="display:flex;flex-direction:column;gap:.7rem">${atms.map(p=>`<button class="card cultcard" data-act="openPlace" data-v="${p.id}">${artBlock(p)}<span class="grow"><b>${p.n}</b>${stat(p)}</span></button>`).join('')}</div></div></div>`;
}
function gates(){
  const gs=P.filter(p=>p.sub==='gate'); const wc=byId('v4'), ws=byId('v8'); const c=crowd(S.now);
  return `<div class="screen"><div class="topbar"><button class="iconbtn" data-act="back" aria-label="رجوع">${ico('back')}</button><h3 class="grow">دليل البوابات</h3></div><div class="pad" style="padding-top:0">
   <p class="muted" style="margin-bottom:.4rem">اختر بوابتك لتعرف أقرب خدمات وأفضل وقت للدخول.</p>
   <p class="small" style="margin-bottom:.8rem">${crowdTxt(S.now)}</p>
   <div style="display:flex;flex-direction:column;gap:.7rem">${gs.map(g=>`<div class="card" style="padding:1rem"><div class="row between"><b>${g.n}</b><span class="badge ${c.high?'':'ok'}">${c.high?T('مزدحم'):T('هادئ')}</span></div>
    <div class="small muted" style="margin-top:.3rem">${T('أقرب دورات مياه: {0}',km(Math.round(R(g,wc)/10)*10))}</div>
    <div class="small muted">${T('أقرب خدمة كراسي متحركة: {0}',km(Math.round(R(g,ws)/10)*10))}</div>
    <button class="btn sm primary" style="margin-top:.6rem" data-act="route" data-v="${g.id}">${ico('send')}خذني له</button></div>`).join('')}</div>
   <p class="muted small" style="margin-top:.9rem">مواقع البوابات تقريبية للعرض وتُراجع قبل الإطلاق.</p></div></div>`;
}
