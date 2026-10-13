/* Social */

/* In-page promo video: scenes + the character's voice, played start to finish */
const REELS={
 id:{L:['Mau ke Madinah? Tonton ini dulu!','Tidak bisa bahasa Arab, takut tersesat, bingung mau makan apa. Pernah merasa begitu?','Aku Odin. Di Hawlak, aku pemandu yang bicara dengan bahasamu.','Tanya aku lewat suara, aku jawab dalam bahasa Indonesia. Aku juga atur harimu sesuai waktu salat.','Kalau tersesat, cukup satu tombol: alamat hotelmu tampil dalam bahasa Arab untuk sopir taksi, dan aku antar ke titik kumpul.','Madinah, dengan caramu. Coba Hawlak, tautannya ada di profilku!'],
  c0:['Mau ke','Madinah?'],pains:['Tak bisa bahasa Arab','Takut tersesat','Bingung makan apa?'],tag:'Pemandu yang bicara bahasamu',c3:['Tanya lewat suara,','jawab bahasa Indonesia'],feat:['Tanya dengan suara','Hari diatur sesuai salat','Tombol "Tersesat"'],c4:['Tersesat?','Satu tombol saja'],lost:'Tersesat',c5:'Madinah, caramu',cta:'Link di profil'},
 tr:{L:["Medine'ye mi gidiyorsun? Önce bunu izle!",'Dil bilmiyorsun, yolu bulamıyorsun, ne yiyeceğini bilmiyorsun. Tanıdık geldi mi?',"Ben Umut Teyze. Hawlak'ta, senin dilinde konuşan rehberinim.",'Sorularını sesle sor, Türkçe cevap vereyim. Hatta gününü namaz vaktine göre planlarım.','Kaybolursan tek düğme yeter: otel adresini şoföre Arapça gösterir, seni buluşma noktasına götürürüm.',"Medine, senin tarzında. Hawlak'ı dene, bağlantı profilimde!"],
  c0:["Medine'ye mi",'gidiyorsun?'],pains:['Dil bilmiyorsun','Yolu bulamıyorsun','Ne yiyeceğini bilmiyorsun'],tag:'Türkçe konuşan rehberin',c3:['Sesle sor,','Türkçe cevap al'],feat:['Sesle sor','Gününü namaza göre planla','"Kayboldum" düğmesi'],c4:['Kayboldun mu?','Tek düğme yeter'],lost:'Kayboldum',c5:'Medine, senin tarzında',cta:'Link profilde'},
 eg:{L:['رايح المدينة؟ شوف الفيديو ده الأول!','مش بتعرف الطريق، وخايف تتوه، ومش عارف تاكل إيه. حصلت معاك؟','أنا نايل. في حولك أنا صاحبك اللي بيتكلم لهجتك.','اسألني بصوتك وأنا أرد عليك. وكمان برتّب يومك على مواعيد الصلاة.','لو تهت، زرار واحد بس: عنوان فندقك يظهر لسواق التاكسي، وأنا أوصلك لأقرب نقطة تجمع.','المدينة على مزاجك. جرّب حولك، والرابط في صفحتي!'],
  c0:['رايح','المدينة؟'],pains:['مش عارف الطريق','خايف تتوه','مش عارف تاكل إيه'],tag:'صاحبك اللي بيتكلم لهجتك',c3:['اسأل بصوتك،','ورد عليك بلهجتك'],feat:['اسأل بالصوت','يومك على مواعيد الصلاة','زرار «تهت»'],c4:['تهت؟','زرار واحد بس'],lost:'تهت',c5:'المدينة على مزاجك',cta:'الرابط في صفحتي'}
};
function reelScene(k,R,g){
  const fig=h=>figure(g.id,h,'speakable'); const nm=g.id==='eg'?BRAND:'Hawlak';
  const cap=(a,b)=>`<div class="rc pop" dir="auto">${a}<br><em>${b}</em></div>`;
  const brand=(sub,extra='')=>`<div class="rbrand pop"><div class="rlogo">${logoSvg()}</div><div class="rname">${nm}</div><div class="rtag" dir="auto">${sub}</div>${extra}</div>`;
  const left='<div class="rf" style="justify-content:flex-start;padding-inline-start:8px">';
  if(k===0) return `<div class="rs">${cap(R.c0[0],R.c0[1])}<div class="rf">${fig(290)}</div></div>`;
  if(k===1) return `<div class="rs"><div class="rpains">${R.pains.map((p,i)=>`<div class="rpain" style="animation-delay:${i*.9}s" dir="auto">${ico(['globe','pin','food'][i])}${p}</div>`).join('')}</div>${left}${fig(180)}</div></div>`;
  if(k===2) return `<div class="rs">${brand(R.tag)}<div class="rf">${fig(240)}</div></div>`;
  if(k===3) return `<div class="rs">${cap(R.c3[0],R.c3[1])}<div class="rchips">${R.feat.map((f,i)=>`<div class="rpain" style="animation-delay:${i*.8}s" dir="auto">${ico(['mic','cal','sos'][i])}${f}</div>`).join('')}</div>${left}${fig(170)}</div></div>`;
  if(k===4) return `<div class="rs">${cap(R.c4[0],R.c4[1])}<div class="rlost pop">${ico('sos')}${R.lost}</div><div class="rhotel pop" dir="rtl">${S.hotelName}<small>${S.hotelAddr}</small></div>${left}${fig(150)}</div></div>`;
  return `<div class="rs">${brand(R.c5,`<div class="rpill">${R.cta}</div>`)}<div class="rf">${fig(200)}</div></div>`;
}

/* Place spotlight video: the character presents one place and invites the visitor to book in the app */
const PV={
 id:{L:['Mau ke {name}? Ini yang perlu kamu tahu!','Kunjungannya sekitar {t} menit, jam buka {h}, dan cocok untuk keluarga.','{p} persen pengunjung Indonesia menyukai tempat ini.','Dari hotelmu hanya {m}. Hawlak menunjukkan rutenya langkah demi langkah.','Mau berkunjung? Buka Hawlak, lihat rutenya, lalu pesan tiketmu. Tautannya ada di profilku!'],
  c0:['Mau ke','tempat ini?'],c1:['Info','singkat'],c2:['Disukai','sesama warga'],c3:['Dari','hotelmu'],cta:['Pesan','tiketmu'],book:'Pesan di Hawlak'},
 tr:{L:["Medine'de şu yeri görmek ister misin: {name}? Bilmen gerekenler burada!",'Ziyaret yaklaşık {t} dakika sürüyor, çalışma saatleri {h} ve aileler için uygun.',"Türk ziyaretçilerin yüzde {p}'i burayı beğendi.",'Otelinden sadece {m}. Hawlak sana rotayı adım adım gösterir.',"Ziyaret etmek ister misin? Hawlak'ı aç, rotayı gör ve biletini ayırt. Bağlantı profilimde!"],
  c0:["Medine'de bu yeri",'gördün mü?'],c1:['Kısaca','bilgiler'],c2:['Hemşehrilerin','beğendi'],c3:['Otelinden','ulaşım'],cta:['Biletini','ayırt'],book:"Hawlak'ta rezervasyon yap"},
 eg:{L:['عايز تزور {name} في المدينة؟ دي أهم حاجة تعرفها!','الزيارة بتاخد حوالي {t} دقيقة، ومفتوح {h}، ومناسب للعيلة.','{p}٪ من الزوار المصريين عجبهم المكان ده.','من فندقك {m} بس. وحولك بيوريك الطريق خطوة خطوة.','لو حابب تزوره، افتح حولك وشوف الطريق واحجز تذكرتك. الرابط في صفحتي!'],
  c0:['عايز تزور','المكان ده؟'],c1:['معلومات','سريعة'],c2:['المصريين','عجبهم'],c3:['من فندقك','للمكان'],cta:['احجز','تذكرتك'],book:'احجز من حولك'}
};
const fillPV=(t,p)=>t.replace('{name}',p.n).replace('{t}',p.t).replace('{h}',hrs(p.hrs)).replace('{p}',socPct(p,S.guide)).replace('{m}',etaTxt(p.dist));
function placeScene(i,g,p,V){
  const fig=h=>figure(g.id,h,'speakable'); const nm=g.id==='eg'?BRAND:'Hawlak';
  const cap=(a)=>`<div class="rc pop" dir="auto">${a[0]}<br><em>${a[1]}</em></div>`;
  const left='<div class="rf" style="justify-content:flex-start;padding-inline-start:8px">';
  const card=(ic,t,d)=>`<div class="rpain" style="animation-delay:${d}s" dir="auto">${ico(ic)}${t}</div>`;
  const pct=socPct(p,S.guide);
  if(i===0) return `<div class="rs">${cap(V.c0)}<div class="rplace pop">${artBlock(p)}<b dir="auto">${p.n}</b></div><div class="rf">${fig(190)}</div></div>`;
  if(i===1) return `<div class="rs">${cap(V.c1)}<div class="rchips" style="top:84px">${card('clock',T('نحو {0} دقيقة',AR(p.t)),0)}${card('clock',hrs(p.hrs),.8)}${card('check',p.fam?T('يناسب العائلات'):PRICE[p.price]?T(PRICE[p.price]):'',1.6)}</div>${left}${fig(170)}</div></div>`;
  if(i===2) return `<div class="rs">${cap(V.c2)}<div class="rbig pop">${AR(pct)}٪</div><div class="rchips" style="top:178px">${card('heart',T('{0}٪ من الزوار {1} أعجبهم هذا المكان',AR(pct),natName(g.id)),.4)}</div>${left}${fig(170)}</div></div>`;
  if(i===3) return `<div class="rs">${cap(V.c3)}<div class="rchips" style="top:98px">${card('send',T('{0} · {1} من فندقك',km(p.dist),etaTxt(p.dist)),0)}${card('pin',p.n,.8)}</div>${left}${fig(170)}</div></div>`;
  return `<div class="rs">${cap(V.cta)}<div class="rbrand" style="top:96px"><div class="rlogo">${logoSvg()}</div><div class="rname">${nm}</div><div class="rpill">${V.book}</div></div><div class="rf">${fig(200)}</div></div>`;
}
function reelSpec(g){
  const k=S.reelKind||'promo';
  if(k==='promo'){ const R=REELS[g.id]; return {L:R.L,scene:i=>reelScene(i,R,g)}; }
  const p=byId(k), V=PV[g.id]; return {L:V.L.map(t=>fillPV(t,p)),scene:i=>placeScene(i,g,p,V)};
}
let REELT=null;
function reelStop(){ if(REELT) REELT.stop=true; REELT=null; try{ speechSynthesis.cancel(); }catch(e){} try{ setSpeaking(false); }catch(e){} }
function reelPlay(){
  const g=G(), R=reelSpec(g), box=$('#rstage'); if(!box||!R) return;
  reelStop(); const run={stop:false}; REELT=run;
  const bars=[...document.querySelectorAll('.rbars i')]; bars.forEach((b,ix)=>{ b.className=''; b.style.removeProperty('--d'); b.style.display=ix<R.L.length?'':'none'; });
  const pl=$('#rplay'); if(pl) pl.style.display='none';
  let k=0;
  const step=()=>{
    if(run.stop) return;
    if(k>=R.L.length){ if(pl){ pl.style.display='grid'; pl.setAttribute('aria-label','إعادة'); } return; }
    const i=k++; box.innerHTML=R.scene(i); if(i===0||i===R.L.length-1) sprWave();
    const text=R.L[i]; const est=Math.max(2600,text.length*75);
    if(bars[i]){ bars[i].style.setProperty('--d',est+'ms'); void bars[i].offsetWidth; bars[i].className='on'; }
    const t0=Date.now(); let called=false;
    const done=()=>{ if(called||run.stop) return; called=true; if(bars[i]) bars[i].className='done'; setTimeout(step,450); };
    say(text,g.speak,()=>{ const el=Date.now()-t0; if(el<700) setTimeout(done,Math.max(0,est-el)); else done(); },true);
  };
  step();
}
function teamClips(gid){
  const ALL={id:[['','','مقطع ترويجي (٣٠ ثانية): أودين يتذوق آيس كريم الورد في ساحة المسجد النبوي ليلًا.']],tr:[['','','مقطع ترويجي (٩ ثوانٍ): الخالة أوموت وسط ساحة بجانب مسجد.'],['','','مقطع إرشادي (٢١ ثانية): تشرح الطريق وتشير بيدها وتدعو الزوار لمرافقتها.']]};
  const clips=ALL[gid]||[]; if(!clips.length) return '';
  return `<div class="sec-title"><h3>${gid==='id'?'مقاطع أودين من الفريق':'مقاطع الخالة أوموت من الفريق'}</h3></div><div class="clips">${clips.map(([po,src,cap])=>`<figure><video controls playsinline preload="none" poster="${po}" src="${src}" onerror="this.insertAdjacentHTML('afterend','<p class=&quot;muted small&quot;>تعذّر تشغيل الفيديو في هذه المعاينة.</p>')"></video><figcaption class="muted small">${cap}</figcaption></figure>`).join('')}</div>`;
}
function social(){
  const g=G();
  const sky=`<svg class="reelbg" viewBox="0 0 230 409" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4F8CB8"/><stop offset=".75" stop-color="#F4A57F"/></linearGradient></defs><rect width="230" height="409" fill="url(#sk)"/><g fill="#F1E8D2" opacity=".95"><rect x="20" y="150" width="9" height="130"/><rect x="200" y="140" width="9" height="140"/><rect x="60" y="250" width="110" height="60"/></g><path d="M78 250a37 37 0 0174 0z" fill="#1F7A52"/><rect x="113" y="200" width="4" height="14" fill="#B94A24"/><rect x="0" y="300" width="230" height="109" fill="#D9C79F"/></svg><div class="reelfig">${figure(g.id,290,'')}</div>`;
  return `<div class="screen" data-ar><div class="topbar"><button class="iconbtn" data-act="back" aria-label="رجوع">${ico('back')}</button><h3 class="grow">الشخصيات على السوشيال</h3></div><div class="pad" style="padding-top:0">
  <p class="muted" style="margin-bottom:1rem">هي نفس الشخصية الكاملة في الفيديوهات التي ننشرها وفي التطبيق: الشكل والصوت واللهجة. الفيديو يجلب الزائر، والتطبيق يرافقه.</p>
  <div class="chips" style="justify-content:center;margin-bottom:1rem">${Object.values(GUIDES).map(x=>`<button class="chip ${x.id===S.guide?'on':''}" data-act="socialGuide" data-v="${x.id}">${x.name}</button>`).join('')}</div>
  <div class="chips" style="justify-content:center;margin-bottom:.7rem">${[['promo','ترويج التطبيق'],['s7','زيارة: متحف دار المدينة'],['e3','زيارة: مزرعة التمور']].map(([k,l])=>`<button class="chip ${(S.reelKind||'promo')===k?'on':''}" data-act="reelKind" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="reel speakable" id="reel"><div id="rstage">${(S.reelKind&&S.reelKind!=='promo')?placeScene(0,g,byId(S.reelKind),PV[g.id]):`${g.id==='id'?`<img class="reelbg" src="${ODIN_REEL}" alt="${g.name}">`:sky}<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.7))"></div>
   <div class="cap" dir="auto">${g.reel}</div>${isAG(g.id)?'':`<div class="cap" style="background:rgba(255,255,255,.18);font-size:.76rem">${g.reelAr}</div>`}<div class="cta">كمّل رحلتك معي</div>`}</div><div class="rbars">${'<i></i>'.repeat((S.reelKind&&S.reelKind!=='promo')?5:6)}</div><button class="rplay" id="rplay" data-act="reelPlay" aria-label="تشغيل">${ico('play','fill')}</button></div>
  <div style="display:flex;justify-content:center;margin-top:.8rem"><button class="btn gold" data-act="reelPlay" style="min-height:52px;font-size:1.05rem">${ico('video')}شغّل الفيديو كاملًا بصوت الشخصية</button></div>
  ${teamClips(g.id)}
  <div class="card" style="padding:1rem;margin-top:1rem"><div class="flow"><b>فيديو بلغته</b>${ico('fwd')}<b>رابط ${BRAND}</b>${ico('fwd')}<b>يختار مرشده</b>${ico('fwd')}<b>يبدأ رحلته</b></div></div>
  <button class="btn primary block" style="margin-top:1rem" data-act="socialCta">كمّل رحلتك معي</button></div></div>`;
}

