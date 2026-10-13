/* Plan */
function buildPlan(timeKey,quick){
  const key=timeKey||S.time||'3h', win=(TIME[key]||TIME['3h'])[1];
  const start=S.now, end=start+win; let t=start, prev=HOTEL; const used=new Set(), done=new Set(), out=[];
  const mosque=byId('s1');
  const due=()=>PRAY.filter(p=>p[1]>=start&&p[1]<=end+10&&!done.has(p[0]))[0];
  if(due()) used.add('s1');
  const order=['sight','cafe','exp','food','shop','sight']; let oi=0, guard=0, cafeBefore=false;
  const toMosque=p=>eta(Math.round(R(p,mosque)/10)*10).min;
  const prayStop=np=>{ const tr=Math.round(R(prev,mosque)/10)*10, e=eta(tr); const arrive=t+e.min; const dur=Math.max(25,np[1]+25-arrive);
    out.push({p:mosque,start:arrive,dur,travel:tr,e,prayer:np[0],adhan:np[1],note:arrive<np[1]?{k:'pre',v:np[1]-arrive}:{k:'late',v:0}});
    done.add(np[0]); t=arrive+dur; prev=mosque; };
  while(t<end&&guard++<10){
    const np=due();
    if(np&&np[1]-t<=25){ prayStop(np); continue; }
    let cat=order[oi%order.length]; const near=np&&np[1]-t<=95;
    if(near&&!cafeBefore) cat='cafe';
    const cats=cat==='exp'?['exp','sight']:[cat];
    const cands=P.filter(p=>cats.includes(p.cat)&&!used.has(p.id)&&vis(p)).map(p=>[score(p,prev)-(near?R(p,mosque)/500:0)-(!out.length&&S.group==='elder'&&p.dist>2500?5:0),p]).sort((a,b)=>b[0]-a[0]);
    let placed=false;
    for(const [,p] of cands.slice(0,6)){
      const tr=Math.round(R(prev,p)/10)*10, e=eta(tr), s0=t+e.min;
      let dur=cat==='food'?Math.min(p.t,60):Math.min(p.t,90);
      if(np){ const latest=np[1]-15-toMosque(p); if(s0+dur>latest){ dur=latest-s0; if(dur<20) continue; } }
      let note=null; if(np){ note={k:'mosque',v:np[1]-(s0+dur+toMosque(p))}; }
      out.push({p,start:s0,dur,travel:tr,e,note}); used.add(p.id); t=s0+dur; prev=p; placed=true; if(cat==='cafe'&&near) cafeBefore=true; oi++; break; }
    if(!placed){ if(np) prayStop(np); else break; }
  }
  return out;
}
function planTab(){
  const p=S.plan;
  return `<div class="screen"><div class="pad"><h2 style="font-size:1.8rem;margin-top:.4rem">خطتي</h2>
   ${p?planResult():planForm()}</div></div>`;
}
function planForm(){
  const g=G(); const np=nextPrayer(S.now);
  return `<div class="row" style="margin:.3rem 0 .8rem">${avatar(g.id,44)}<div class="bubble"><span class="loc">${g.ok}</span>${T('أرتب لك اليوم حول الصلاة. {0} بعد {1}.',prayName(np.i),durTxt(np.in))}</div></div>
  <b>الوقت الآن (للعرض)</b><div class="chips" style="margin:.4rem 0 1rem">${[['٩:٠٠ ص',540],['١١:٣٠ ص',690],['٤:٥٥ م',1015],['٧:٠٠ م',1140]].map(([l,v])=>`<button class="chip ${S.now===v?'on':''}" data-act="setNow" data-v="${v}">${l}</button>`).join('')}</div>
  <b>كم عندك وقت؟</b><div class="chips" style="margin:.4rem 0 1rem">${Object.entries(TIME).map(([k,v])=>`<button class="chip ${S.time===k?'on':''}" data-act="setP" data-k="time" data-v="${k}">${v[0]}</button>`).join('')}</div>
  <b>وش ميزانيتك؟</b><div class="chips" style="margin:.4rem 0 1rem">${[['eco','اقتصادية'],['mid','متوسطة'],['open','مفتوحة']].map(([k,l])=>`<button class="chip ${S.budget===k?'on':''}" data-act="setP" data-k="budget" data-v="${k}">${l}</button>`).join('')}</div>
  <b>مين معك؟</b><div class="chips" style="margin:.4rem 0 1rem">${Object.entries(GRP).map(([k,l])=>`<button class="chip ${S.group===k?'on':''}" data-act="setP" data-k="group" data-v="${k}">${l}</button>`).join('')}</div>
  <b>وش اهتماماتك؟</b><div class="chips" style="margin:.4rem 0 1.2rem">${INTERESTS.map(([k,l])=>`<button class="chip ${S.interests.includes(k)?'on':''}" data-act="togInt" data-v="${k}">${l}</button>`).join('')}</div>
  <button class="btn primary block" data-act="genPlan">${ico('spark')}رتّب لي يومي</button>`;
}
function planResult(){
  const g=G(); const pl=S.plan; const np=nextPrayer(S.now); const has=pl.some(s=>s.prayer);
  return `<div class="row" style="margin:.3rem 0 .6rem">${avatar(g.id,44)}<div class="bubble"><span class="loc">${g.ok}</span><b>خطتك اليوم</b><div class="small muted">${T('{0} · من {1} · {2}',T((TIME[S.time]||['٣ ساعات'])[0]),fmtT(S.now),T(GRP[S.group]||'العائلة'))}</div></div></div>
  <div class="card" style="padding:.8rem 1rem;background:var(--gold-soft);border-color:transparent;margin-bottom:.4rem"><div class="row between"><div><b>${T('{0} بعد {1}',prayName(np.i),durTxt(np.in))}</b><div class="small muted">${has?'بنيت لك اليوم حول الصلاة، وستصل قبل الأذان.':'أوقات تقريبية للعرض.'}</div></div><button class="btn sm" data-act="qibla">${ico('compass')}القبلة</button></div></div>
  <div class="tl">${pl.map((s,i)=>`<div class="travel">${ico(s.e.mode==='walk'?'walk':'car')}${T(i===0?'{0} · {1} من فندقك':'{0} · {1}',km(s.travel),etaTxt(s.travel))}</div>
   <div class="card stop ${s.prayer?'pray':''}"><div class="row between"><span class="time">${fmtT(s.start)}</span><span class="badge">${T('{0} دقيقة',AR(s.dur))}</span></div>
   ${s.prayer?`<div class="badge ok" style="margin-top:.3rem">${ico('dome')}${T('صلاة {0} · الأذان {1}',prayName(PRAY.findIndex(x=>x[0]===s.prayer)),fmtT(s.adhan))}</div>`:''}
   <button class="grow" style="text-align:start;width:100%;display:block;margin-top:.2rem" data-act="openPlace" data-v="${s.p.id}"><b>${s.p.n}</b><span class="small muted" style="display:block">${T('{0} · {1} منك',T(CAT[s.p.cat].n),km(s.p.dist))}</span></button>
   ${s.note?`<div class="note-inline" style="margin-top:.4rem">${noteTxt(s.note)}</div>`:''}
   <div class="row" style="margin-top:.6rem"><button class="btn sm primary" data-act="route" data-v="${s.p.id}">${ico('send')}الاتجاهات</button><button class="btn sm" data-act="openPlace" data-v="${s.p.id}">التفاصيل</button>${s.prayer?`<button class="btn sm" data-act="qibla">${ico('compass')}القبلة</button>`:''}</div></div>`).join('')}</div>
  <div class="row" style="margin-top:.4rem"><button class="btn grow" data-act="editPlan">عدّل الأسئلة</button><button class="btn primary grow" data-act="savePlan">احفظ الخطة</button></div>`;
}

