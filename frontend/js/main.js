/* هل الخادم موجود وفيه مزودون حقيقيون؟ إن لم يوجد نبقى على الردود الجاهزة */
fetch('/api/config/status').then(r=>r.ok?r.json():null).then(j=>{
  if(!j){ S.noServer=true; return; } const p=j.providers; S.srv={ask:p.llm!=='fake',stt:p.stt!=='fake',tts:p.tts!=='fake'}; console.info('الخدمات المفعّلة',S.srv);
}).catch(()=>{ S.noServer=true; });
loadUser();
render();
loadFavs().then(()=>{ if(S.user) render(true); });

/* صفحة على الجهاز نفسه بلا خادم (مثل Live Server في VS Code على المنفذ 5500): نحوّلها تلقائيًا للخادم الحقيقي على 8000 إن كان شغّالًا،
   وإلا تبقى على صوت المتصفح. */
if(['localhost','127.0.0.1'].includes(location.hostname)&&location.port!=='8000'){
  fetch('/api/health').then(r=>r.ok).catch(()=>false).then(ok=>{
    if(ok) return;
    fetch('http://127.0.0.1:8000/api/health',{mode:'no-cors'}).then(()=>location.replace('http://127.0.0.1:8000'+location.pathname+location.search)).catch(()=>{});
  });
}
