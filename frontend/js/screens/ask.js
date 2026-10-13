/* Ask (concierge): voice first */
const SKEYS=['plan3','kids','gifts','homefood','madani'];
function startChat(){ const L=LOC[S.guide]; S.chat=[{from:'g',local:L.help,text:AR_HELP,cards:[]}]; }
function ask(){
  const g=G(),L=LOC[g.id],ar=isAG(g.id);
  const lastU=[...S.chat].reverse().find(m=>m.from==='u'); const lastG=[...S.chat].reverse().find(m=>m.from==='g');
  const gm=S.typing?null:lastG;
  const cards=(gm&&gm.cards||[]).map(id=>{const p=byId(id);return `<button class="card cultcard" style="padding:.6rem;margin-top:.5rem" data-act="openPlace" data-v="${id}">${artBlock(p)}<span class="grow"><b>${p.n}</b>${stat(p)}</span></button>`}).join('');
  return `<div style="display:flex;flex-direction:column;flex:1;min-height:0">
  <div class="topbar" style="background:var(--surface);border-bottom:1px solid var(--line)"><div class="grow"><b>${g.name}</b><div class="small muted">${T('مرشدك · يتكلم {0}',T(g.lang))}</div></div><button class="iconbtn" data-act="voiceToggle" aria-label="الصوت" style="${S.voice?'':'opacity:.45'}">${ico('speaker')}</button></div>
  <div class="screen chatscroll" style="animation:none">
   <div class="vstage" style="padding-top:.8rem">${figure(g.id,210,'speakable')}<div class="vbub">
    ${lastU?`<div class="bubble me" style="align-self:flex-start;max-width:100%"><span dir="auto">${lastU.text}</span></div>`:''}
    <div class="bubble">${S.typing?'<span class="typing"><i></i><i></i><i></i></span>':`<span class="big" dir="auto">${gm.local}</span>${ar?'':`<span class="ar-sub">${gm.text}</span>`}`}</div>
    ${gm?`<button class="replay" data-act="replayLast">${ico('speaker')}${L.repeat}</button>`:''}</div></div>
   <div style="padding:0 1.1rem">${cards}</div>
   <div class="microw" style="position:static;background:none;padding-top:1rem"><button class="micbtn" data-act="mic" aria-label="تحدث">${ico('mic')}</button><span class="michint">${L.tap}</span></div>
   <div style="display:flex;flex-direction:column;gap:.55rem;padding:0 1.1rem 1.2rem">
    ${L.sugg.map((t,i)=>i===2?'':`<button class="vsugg" data-act="suggest" data-v="${i}"><b dir="auto">${t}</b>${ar?'':`<small>${AR_SUGG[i]}</small>`}</button>`).join('')}
    <button class="btn ghost sm" data-act="typeToggle" style="align-self:center">${L.typeInstead}</button>
    ${S.typeOpen?`<form class="row" data-form="chat"><label class="search grow" style="padding:.1rem .8rem"><input id="chatq" placeholder="…" aria-label="سؤالك" autocomplete="off"></label><button class="iconbtn" style="background:var(--green);color:var(--on-green);border:0" aria-label="إرسال">${ico('send')}</button></form>`:''}
   </div></div></div>`;
}
function sendQ(q,key){
  if(!q.trim()||S.typing) return;
  S.chat.push({from:'u',text:q}); S.typing=true; render(true);
  setTimeout(()=>{ const m=reply(key||intentOf(q),q); S.chat.push(m); S.typing=false; render(true); fx('nod'); say(m.local,G().speak); },700);
}
function reply(k,q=''){
  const g=G(),L=LOC[g.id]; let list=[];
  const top=(cat,n)=>P.filter(p=>cat.includes(p.cat)&&vis(p)).sort((a,b)=>score(b)-score(a)).slice(0,n);
  if(k==='homefood'){ const want=/منسف/.test(q)?'ar':S.guide;
    list=P.filter(p=>p.cat==='food'&&p.cult.includes(want)&&vis(p)).concat(P.filter(p=>p.cat!=='svc'&&p.cat!=='food'&&p.cult.includes(want)&&vis(p))).slice(0,3); }
  else if(k==='madani') list=ranked(['food'],8).filter(p=>p.cult.includes('local')).slice(0,3);
  else if(k==='kids') list=P.filter(p=>p.cat==='food'&&p.fam&&vis(p)).sort((a,b)=>score(b)-score(a)).slice(0,3);
  else if(k==='gifts') list=P.filter(p=>p.cat==='shop'&&p.price<=2&&vis(p)).sort((a,b)=>score(b)-score(a)).slice(0,3);
  else if(k==='coffee') list=ranked(['cafe'],3);
  else if(k==='health') list=[];
  else if(k==='plan3') list=buildPlan('3h',true).slice(0,3).map(s=>s.p);
  else if(k==='sights') list=ranked(['sight'],3);
  const key=L.r[k]?k:'def';
  return {from:'g',local:L.r[key],text:AR_R[key],cards:list.map(p=>p.id)};
}

