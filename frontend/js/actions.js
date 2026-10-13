/* ============ Actions ============ */
function plan(){ if(!S.time)S.time='3h'; S.plan=buildPlan(S.time); }
const A={
 start(){ go('onb',{onb:0}); },
 restart(){ S.guide=null; S.country=null; S.q=''; go('country'); },
 nextOnb(){ if(S.onb<1){S.onb++;render();} else A.pickCity('madinah'); },
 skipOnb(){ A.pickCity('madinah'); },
 prevGuide(){ go('onb',{onb:1}); },
 prevOnb(){ if(S.onb>0){S.onb--;render();} else go('splash'); },
 go(v){ go(v); },
 back(){ const t=(S.prev&&S.prev!=='main')?S.prev:'main'; go(t); S.prev=({currency:'main',gates:'main',lost:'main',partner:'main',social:'main',prayer:'main',picks:'main'})[t]||'main'; },
 pickCity(v){ S.city='madinah'; go('guide'); sayG(G().hello); fx('wave'); },
 pickCountry(v){ const c=COUNTRIES.find(x=>x[0]===v); S.q='';
  if(!c[2]){ toast(c[3]); return; }
  S.country=v; S.guide=c[2]; if(c[3]) toast(c[3]); go('splash'); },
 currency(){ S.prev='main'; go('currency'); },
 gates(){ S.prev='main'; go('gates'); },
 prayer(){ S.prev='main'; go('prayer'); },
 picks(){ S.prev='main'; go('picks'); },
 setSar(v){ S.sar=+v; render(true); },
 doLogin(){ const n=(($('#lgN')||{}).value||'').trim()||T('ضيف {0}',BR()); S.user={name:n}; closeSheet(); toast(T('أهلاً {0}، تم تسجيل دخولك (عرض تجريبي)',n)); const f=S.after; S.after=null; if(f) f(); else render(true); },
 beginQuiz(){ S.qi=0;S.ans={};S.done=false; go('quiz'); sayG(LOC[S.guide].q[0]); },
 qback(){ S.qi=Math.max(0,S.qi-1); render(); sayG(LOC[S.guide].q[S.qi]); },
 answer(v){ answer(v); },
 doneMulti(){ nextQ(); },
 tab(v){ tab(v); },
 phase(v){ S.phase=v; render(true); },
 quick(v){
  if(v==='plan'){ S.plan=null; tab('plan'); return; }
  if(v==='sos'){ sheet(`<h3 style="color:var(--c-svc)">طوارئ</h3><div class="notif"><span class="b" style="background:var(--c-svc)">${ico('sos')}</span><div><b>الطوارئ الموحد ٩١١</b><div class="muted small">لجميع الحالات العاجلة</div></div></div><div class="notif"><span class="b" style="background:var(--c-svc)">${ico('plus')}</span><div><b>الإسعاف ٩٩٧</b><div class="muted small">الهلال الأحمر السعودي</div></div></div><div class="notif" style="border:0"><span class="b">${ico('pin')}</span><div><b>${T('أقرب صيدلية: {0}',byId('v1').n)}</b><div class="muted small">${km(byId('v1').dist)} · ${etaTxt(byId('v1').dist)}</div></div></div><p class="muted small">أرقام الاتصال عرض معلوماتي في هذا النموذج.</p>`); return; }
  const map={eat:'food',sights:'sight',exp:'exp'};
  S.filter=map[v]; S.exView=(v==='near')?'map':'list'; tab('explore'); },
 openPlace(v){ S.prev=S.step==='main'?'main':S.step; S.pid=v; closeSheet(); go('place'); sayPlace(v); },
 save(v){ if(S.saved.has(v)){ S.saved.delete(v); toast('أُزيل من المحفوظات'); render(true); return; } needLogin(()=>{ S.saved.add(v); toast('تم الحفظ في رحلتك'); render(true); }); },
 share(v){ const p=byId(v); const txt=`${p.n} على ${BRAND}`; try{navigator.clipboard.writeText(txt).then(()=>toast('تم نسخ الرابط للمشاركة'),()=>toast(T('انسخ الاسم يدويًا: {0}',p.n)));}catch(e){toast(T('انسخ الاسم يدويًا: {0}',p.n));} },
 book(v){ bookSheet(byId(v)); },
 bkTime(v,el){ el.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('on')); el.classList.add('on'); S.bk.t=v; },
 bkN(v,el){ el.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('on')); el.classList.add('on'); S.bk.n=v; },
 confirmBook(v){ closeSheet(); needLogin(()=>toast(T('تم تأكيد الحجز في {0} (عرض تجريبي)',byId(v).n))); },
 route(v){ const p=byId(v); S.mapSel=v; S.route=true; routeSheet(p); },
 showOnMap(v){ S.mvFit=[byId(v),HOTEL]; S.mapSel=v; S.route=true; S.filter='all'; S.exView='map'; S.step='main'; S.tab='explore'; closeSheet(); render(); },
 mapZoom(v){ mapZoom(+v); },
 mapFit(){ const l=filtered(); mvFit(l.concat([HOTEL]),300); mapApply(); },
 mapPin(v){ S.mapSel=v; S.route=false; render(true); },
 filter(v){ S.filter=v; S.mapSel=null; render(true); },
 exView(v){ S.exView=v; render(); },
 svcPick(v){ const list=P.filter(p=>p.sub===v); S.pid=list[0].id; A.openPlace(S.pid); },
 setP(v,el){ S[el.dataset.k]=v; render(true); },
 togInt(v){ S.interests=S.interests.includes(v)?S.interests.filter(x=>x!==v):[...S.interests,v]; render(true); },
 genPlan(){ plan(); render(); const L=LOC[S.guide],np=nextPrayer(S.now),has=S.plan.some(x=>x.prayer); sayG(has?L.pray(PN[np.i][S.guide],np.in):L.plan); },
 setNow(v){ S.now=+v; S.plan=null; render(true); },
 qibla(){ qiblaSheet(); },
 toggleLang(){ S.lang=(S.lang==='ar')?null:'ar'; render(true); },
 setLang(v){ S.lang=(v==='auto')?null:v; closeSheet(); render(true); },
 subsToggle(){ S.subs=!S.subs; closeSheet(); a11ySheet(); render(true); },
 qiblaLive(){ qiblaLive(); },
 lost(){ S.prev='main'; go('lost'); fx('nod'); sayG(LOC[S.guide].lost); },
 sayLost(){ say(LOC[S.guide].lost,G().speak,null,true); },
 driverFull(){ driverFull(); },
 closeDriver(){ const d=$('#layer .driverfull'); if(d) d.remove(); },
 shareToggle(){ S.share=!S.share; toast(S.share?'تم تفعيل مشاركة موقعك مع أهلك (عرض تجريبي)':'تم إيقاف المشاركة'); render(true); },
 editPlan(){ S.plan=null; render(); },
 savePlan(){ needLogin(()=>{ S.savedPlans++; toast('تم حفظ الخطة في رحلتي'); render(true); }); },
 a11ySheet(){ a11ySheet(); },
 a11y(v){ S.a11y[v]=!S.a11y[v]; closeSheet(); a11ySheet(); render(true); },
 notifs(){ notifsSheet(); },
 speak(v,el){ say(el.dataset.t,el.dataset.l,null,true); },
 preInfo(v){ sheet(`<h3 style="margin-bottom:.5rem">${v}</h3>${PRE_INFO[v].map(t=>`<div class="trait">${ico('check')}<span>${t}</span></div>`).join('')}`); },
 changeGuide(){ sheet(`<h3 style="margin-bottom:.6rem">اختر مرشدك</h3><div style="display:flex;flex-direction:column;gap:.5rem">${Object.values(GUIDES).map(g=>`<button class="country" data-act="setGuide" data-v="${g.id}">${avatar(g.id,46)}<span class="grow"><b>${g.name}</b><small class="muted" style="display:block">${g.country} · ${g.lang}</small></span>${g.id===S.guide?ico('check'):''}</button>`).join('')}</div>`); },
 setGuide(v){ S.guide=v; S.lang=null; const c=COUNTRIES.find(x=>x[2]===v); if(c) S.country=c[0]; S.chat=[]; S.plan=null; S.mapSel=null; if(S.tab==='ask') startChat(); closeSheet(); render(true); toast('تم تغيير المرشد'); fx('wave'); sayG(G().hello); },
 menu(v){
  if(v==='currency'){ S.prev='main'; go('currency'); }
  else if(v==='gates'){ S.prev='main'; go('gates'); }
  else if(v==='partner'){ S.prev='main'; go('partner'); }
  else if(v==='social'){ S.prev='main'; go('social'); }
  else if(v==='a11y') a11ySheet();
  else if(v==='notifs') notifsSheet();
  else if(v==='fav'){ const l=[...S.saved].map(byId); sheet(`<h3 style="margin-bottom:.5rem">المفضلة</h3>${l.length?l.map(p=>`<button class="card cultcard" style="margin-bottom:.5rem" data-act="openPlace" data-v="${p.id}">${artBlock(p)}<span class="grow"><b>${p.n}</b>${stat(p)}</span></button>`).join(''):'<p class="muted">لم تحفظ شيئًا بعد. اضغط على القلب في أي مكان.</p>'}`); }
  else if(v==='trip'){ sheet(`<h3 style="margin-bottom:.4rem">رحلتي</h3><p>${T('المدينة المنورة · {0}',T((TIME[S.time]||['٣ ساعات'])[0]))}</p><p class="muted small">${T('{0} أماكن محفوظة، {1} خطة محفوظة.',AR(S.saved.size),AR(S.savedPlans))}</p>`); }
  else if(v==='lang'){ langSheet(); }
  else if(v==='cur'){ sheet(`<h3 style="margin-bottom:.4rem">العملة</h3><div class="chips">${['ريال سعودي','دولار','يورو','ليرة تركية','روبية'].map((l,i)=>`<button class="chip ${i===0?'on':''}" data-act="toast" data-v="تحويل العملات قادم في النسخة الكاملة">${l}</button>`).join('')}</div>`); }
  else if(v==='about'){ sheet(`<h3>${T('عن {0}',BR())}</h3><p style="margin:.5rem 0">شخصية من ثقافتك، تكلمك بلهجتك، تعرّفك على المدينة قبل وصولك، وتدلك على ما حولك عند وصولك.</p><p class="muted small">نموذج أولي لأغراض الهاكاثون. المحتوى الديني يُراجع من مصادر معتمدة قبل نشره.</p>`); }
 },
 sendPartner(){ $('#pForm').innerHTML=`<div class="card" style="padding:1.2rem;text-align:center"><div class="badge ok" style="font-size:1rem">${ico('check')}تم استلام طلبك</div><p class="muted" style="margin-top:.6rem">سنتواصل معك قريبًا. هذا عرض تجريبي ولم يُرسل أي شيء.</p></div>`; },
 pcat(v,el){ el.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('on')); el.classList.add('on'); },
 socialGuide(v){ reelStop(); S.guide=v; S.lang=null; S.chat=[]; render(true); },
 socialCta(){ S.country=S.country||G().country; go('guide'); },
 toast(v){ toast(v); },
 demoSheet(){ demoSheet(); },
 demo(v){ runDemo(v); },
 closeSheet(){ closeSheet(); },
 send(v){ sendQ(v); },
 suggest(v){ const L=LOC[S.guide]; sendQ(L.sugg[+v],SKEYS[+v]); },
 repeatQ(){ sayG(S.done?LOC[S.guide].done:LOC[S.guide].q[S.qi]); },
 replayLast(){ const m=[...S.chat].reverse().find(x=>x.from==='g'); if(m) say(m.local,G().speak,null,true); },
 sayHome(){ const L=LOC[S.guide]; say(L.greet(L.grp[S.group]||'',L.tm[S.time]||''),G().speak,null,true); },
 sayPlace(v){ sayPlace(v,true); },
 playReel(){ reelPlay(); },
 reelPlay(){ reelPlay(); },
 reelKind(v){ reelStop(); S.reelKind=v; render(true); },
 typeToggle(){ S.typeOpen=!S.typeOpen; render(true); },
 voiceToggle(){ S.voice=!S.voice; if(!S.voice){try{speechSynthesis.cancel();}catch(e){}} toast(S.voice?'الصوت مفعّل':'تم إيقاف صوت المرشد'); const open=$('#layer .scrim'); if(open){closeSheet(); a11ySheet();} render(true); },
 mic(){
  const L=LOC[S.guide];
  if(S.step==='quiz'&&!S.done){ const q=QS[S.qi];
   listen(alts=>{ if(q.multi){ const found=Object.keys(L.o[q.k]).filter(v=>alts.some(a=>{const t=norm(a);const l=norm(L.o[q.k][v]);const ar=norm((q.o.find(o=>o[0]===v)||[])[1]||'');return t.includes(l)||t.includes(ar);})); if(found.length){ S.ans[q.k]=found; nextQ(); return; } }
    else { const v=matchOption(alts,q); if(v){ answer(v); return; } }
    toast('لم أفهم، اضغط على أحد الأزرار'); sayG(L.nohear); }); }
  else listen(alts=>sendQ(alts[0])); }
};

