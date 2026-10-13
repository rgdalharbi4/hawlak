/* Profile */
function profile(){
  const g=G(); const sv=[...S.saved].map(byId);
  const items=[['heart','المفضلة','fav'],['access','إمكانية الوصول','a11y'],['info','عن المنصة','about']];
  return `<div class="screen"><div class="pad"><div class="row" style="margin:.5rem 0 1rem">${avatar(g.id,72)}<div class="grow"><h2 style="font-size:1.5rem">${S.user?S.user.name:T('ضيف {0}',BR())}</h2><p class="muted small">${T('{0} · {1}',T((COUNTRIES.find(c=>c[0]===S.country)||[S.country||'—'])[0]),T(g.lang))}</p></div></div>
  <div class="card" style="padding:1rem"><div class="row between"><div><span class="small muted">مرشدك الحالي</span><div><b>${g.name}</b> · <span>${g.country}</span></div></div></div></div>
  <div class="sec-title"><h3>اهتماماتي</h3></div><div class="chips">${S.interests.length?S.interests.map(k=>`<span class="badge">${IMAP[k]}</span>`).join(''):'<span class="muted small">لم تحدد بعد</span>'}</div>
  <div class="sec-title"><h3>رحلتي الحالية</h3></div><div class="card" style="padding:1rem"><div class="row between"><b>المدينة المنورة</b><span class="badge ok">${T('{0} أماكن محفوظة',AR(S.saved.size))}</span></div><p class="muted small">${T(GRP[S.group]||'العائلة')}</p>${S.savedPlans?`<p class="small" style="margin-top:.3rem">${T('{0} خطة محفوظة',AR(S.savedPlans))}</p>`:''}</div>
  <div style="margin-top:1rem">${items.map(i=>`<button class="menu-item" data-act="menu" data-v="${i[2]}" ${i[2]==='social'||i[2]==='partner'?'data-ar':''}><span class="b">${ico(i[0])}</span><span class="grow">${i[1]}</span>${ico('fwd')}</button>`).join('')}</div></div></div>`;
}
function a11ySheet(){
  const A=S.a11y;
  sheet(`<h3 style="margin-bottom:.4rem">إمكانية الوصول</h3>
   ${[['big','تكبير النص','textsz'],['hc','تباين عالٍ','access'],['wheel','أماكن مهيأة للكراسي المتحركة فقط','access']].map(([k,l])=>`<button class="toggle" style="width:100%" data-act="a11y" data-v="${k}" role="switch" aria-checked="${A[k]}"><span>${l}</span><span class="sw ${A[k]?'on':''}"></span></button>`).join('')}
   <button class="toggle" style="width:100%" data-act="voiceToggle" role="switch" aria-checked="${S.voice}"><span>صوت المرشد (يتكلم تلقائيًا)</span><span class="sw ${S.voice?'on':''}"></span></button>
   <button class="toggle" style="width:100%" data-act="subsToggle" role="switch" aria-checked="${S.subs}"><span>عرض الترجمة العربية</span><span class="sw ${S.subs?'on':''}"></span></button>
   <button class="toggle" style="width:100%" data-act="speak" data-t="${G().hello.replace(/"/g,'&quot;')}" data-l="${G().speak}"><span>اسمع ترحيب المرشد</span>${ico('speaker')}</button>
   <p class="muted small" style="margin-top:.8rem">نراعي كبار السن وذوي الإعاقة: أزرار كبيرة، وصوت، وفلترة للأماكن المناسبة.</p>`);
}
function notifsSheet(){
  const g=G();
  sheet(`<h3>الإشعارات</h3>${[['clock','صباح الخير، عندك ساعتين فاضية قبل خطتك القادمة. لقيت لك مكان قريب.','قبل ٥ دقائق'],['pin','المطعم اللي حفظته يبعد عنك الآن ٧ دقائق.','قبل ساعة'],['dome','أنت قريب من موقع تاريخي، ودك أحكي لك قصته؟','أمس']].map(n=>`<div class="notif"><span class="b">${ico(n[0])}</span><div><div>${n[1]}</div><small class="muted">${T('{0} · {1}',T(g.name),T(n[2]))}</small></div></div>`).join('')}`);
}
function langSheet(){
  const cur=S.lang||'auto'; const opts=[['auto',T('حسب مرشدي')],['ar','العربية'],['id','Bahasa Indonesia'],['tr','Türkçe']];
  sheet(`<h3 style="margin-bottom:.4rem">اللغة</h3><p class="muted small" style="margin-bottom:.6rem">اختر لغة الواجهة. المرشد يبقى يتحدث لغته.</p><div class="chips">${opts.map(o=>`<button class="chip ${cur===o[0]?'on':''}" data-act="setLang" data-v="${o[0]}">${o[1]}</button>`).join('')}</div>`);
}
const DEMOS={
 eg:{country:'مصر',guide:'eg',group:'family',dest:'quba',interests:['food','hist'],budget:'mid',time:'3h',first:'yes'},
 id:{country:'إندونيسيا',guide:'id',group:'solo',dest:'quba',interests:['hist','coffee'],budget:'eco',time:'3h',first:'yes'},
 tr:{country:'تركيا',guide:'tr',group:'elder',dest:'quba',interests:['hist','coffee'],budget:'mid',time:'half',first:'no'}
};
function sayPlace(v,force){ const p=byId(v),L=LOC[S.guide]; if(p.dist==null){ say(T(p.d),G().speak,null,force); return; } const e=eta(p.dist); const soc=''; say(L.pl(AR(e.min),e.mode==='walk',p.fam)+soc,G().speak,null,force); }
function runDemo(k){ const d=DEMOS[k]; Object.assign(S,{country:d.country,guide:d.guide,group:d.group,interests:[...d.interests],budget:d.budget,time:d.time,first:d.first,plan:null,chat:[],phase:'in',tab:'home',saved:new Set(),savedPlans:0}); go('main'); setTimeout(homeGreetSay,300); }

