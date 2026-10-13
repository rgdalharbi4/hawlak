/* ============ Voice engine ============ */
let VOICES=[]; try{ VOICES=speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged=()=>{VOICES=speechSynthesis.getVoices();}; }catch(e){}
function pickVoice(lang){ const b=lang.split('-')[0]; return VOICES.find(v=>v.lang.replace('_','-')===lang)||VOICES.find(v=>v.lang.toLowerCase().startsWith(b)); }
function fx(name){ if(name==='wave') sprWave(); document.querySelectorAll('.fig').forEach(e=>{ e.classList.remove('fx-wave','fx-nod'); void e.offsetWidth; e.classList.add('fx-'+name); setTimeout(()=>e.classList.remove('fx-'+name),1900); }); }
function setSpeaking(on){ document.querySelectorAll('.speakable').forEach(e=>e.classList.toggle('speaking',on)); }
function say(text,lang,cb,force){
  if((!S.voice&&!force)||!text){ cb&&cb(); return; }
  /* الإندونيسية: صوت الخادم إن كان مفعّلًا (ويُخزَّن لديه)، وإلا صوت المتصفح */
  if(S.srv&&S.srv.tts&&String(lang||G().speak).startsWith('id')) return sayServer(text,lang,cb);
  /* على صفحة الخادم لا يُفترض أن نصل هنا: ننبّه فورًا لأن هذا يعني أن الصفحة لم تعرف أن صوت الخادم مفعّل */
  if(['localhost','127.0.0.1'].includes(location.hostname)&&!S.warnedBrowser){ S.warnedBrowser=1; toast('صوت المتصفح (بدون خادم)'); console.warn('say() استخدم صوت المتصفح. S.srv=',S.srv,'lang=',lang); }
  sayBrowser(text,lang,cb);
}
function sayBrowser(text,lang,cb){
  try{
    if(!('speechSynthesis' in window)){ cb&&cb(); return; }
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text); u.lang=lang||G().speak; const v=pickVoice(u.lang); if(v) u.voice=v; u.rate=.88;
    u.onstart=()=>setSpeaking(true); u.onend=()=>{setSpeaking(false); cb&&cb();}; u.onerror=()=>{setSpeaking(false); cb&&cb();};
    speechSynthesis.speak(u);
  }catch(e){ cb&&cb(); }
}
/* تشغيل صوت الخادم عبر WebAudio: نفتح الصوت عند أول ضغطة (Safari يمنع غير ذلك) ثم يعمل في أي وقت */
let ACTX=null, ASRC=null;
function unlockAudio(){ try{ ACTX=ACTX||new (window.AudioContext||window.webkitAudioContext)(); if(ACTX.state!=='running') ACTX.resume(); }catch(e){} }
['pointerdown','touchstart','keydown','click'].forEach(ev=>document.addEventListener(ev,unlockAudio,{passive:true}));
function stopAudio(){ try{ if(ASRC){ ASRC.onended=null; ASRC.stop(); ASRC=null; } }catch(e){} try{ if(AUDIO) AUDIO.pause(); }catch(e){} }
async function playServerAudio(blob,cb){
  if(ACTX&&ACTX.state==='running'){
    const buf=await ACTX.decodeAudioData(await blob.arrayBuffer());
    stopAudio(); ASRC=ACTX.createBufferSource(); ASRC.buffer=buf; ASRC.connect(ACTX.destination);
    ASRC.onended=()=>{ setSpeaking(false); cb&&cb(); }; setSpeaking(true); ASRC.start(); return;
  }
  stopAudio(); AUDIO=new Audio(URL.createObjectURL(blob));
  AUDIO.onplay=()=>setSpeaking(true); AUDIO.onended=()=>{ setSpeaking(false); cb&&cb(); }; AUDIO.onerror=()=>{ setSpeaking(false); cb&&cb(); };
  await AUDIO.play();
}
async function sayServer(text,lang,cb){
  try{
    const r=await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,language:String(lang||G().speak).split('-')[0]})});
    if(!r.ok) throw new Error('tts '+r.status);
    try{ speechSynthesis.cancel(); }catch(e){}
    await playServerAudio(await r.blob(),cb);
  }catch(e){ console.warn('تعذّر تشغيل صوت الخادم:',e); setSpeaking(false); toast('تعذّر تشغيل الصوت'); cb&&cb(); }  /* لا نرجع لصوت المتصفح: صوت المرشد واحد دائمًا */
}
const sayG=t=>say(t,G().speak);
let REC=null, REC_SRV=null, AUDIO=null;
/* فهم الكلام عبر الخادم: الضغطة الأولى تبدأ التسجيل، والثانية توقفه (أو يتوقف بعد ٨ ثوانٍ) */
async function listenServer(onText){
  const L=LOC[G().id];
  if(REC_SRV){ try{ REC_SRV.stop(); }catch(e){} return; }
  try{
    speechSynthesis.cancel(); stopAudio();
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const chunks=[]; const mr=new MediaRecorder(stream); REC_SRV=mr;
    S.listening=true; setMic(true);
    mr.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
    mr.onstop=async()=>{
      stream.getTracks().forEach(t=>t.stop()); REC_SRV=null; S.listening=false; setMic(false);
      try{
        const fd=new FormData(); fd.append('audio',new Blob(chunks,{type:mr.mimeType||'audio/webm'}),'speech.webm'); fd.append('language',G().speak.split('-')[0]);
        const r=await fetch('/api/stt',{method:'POST',body:fd}); if(!r.ok) throw new Error('stt '+r.status);
        const j=await r.json();
        if(j.text&&j.text.trim()) onText([j.text.trim()]); else { toast('لم أسمعك جيدًا، حاول مرة أخرى'); sayG(L.nohear); }
      }catch(e){ console.warn(e); toast('تعذّر فهم الصوت، استخدم الأزرار الكبيرة'); sayG(L.nohear); }
    };
    mr.start(); setTimeout(()=>{ if(mr.state==='recording') mr.stop(); },8000);
  }catch(e){ S.listening=false; setMic(false); toast('المايكروفون غير مسموح هنا. استخدم الأزرار الكبيرة'); }
}
const speakReply=text=>say(text,G().speak);
function listen(onText){
  if(S.srv&&S.srv.stt) return listenServer(onText);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const L=LOC[G().id];
  if(!SR){ toast('المايكروفون غير متاح في هذا المتصفح، استخدم الأزرار الكبيرة'); sayG(L.nohear); return; }
  try{
    speechSynthesis.cancel(); if(REC){try{REC.abort();}catch(e){}}
    REC=new SR(); REC.lang=G().speak; REC.interimResults=false; REC.maxAlternatives=3;
    S.listening=true; setMic(true);
    let got=false;
    REC.onresult=e=>{ got=true; const alts=[...e.results[0]].map(a=>a.transcript); onText(alts); };
    REC.onerror=e=>{ S.listening=false; setMic(false); if(e.error==='not-allowed'||e.error==='service-not-allowed') toast('المايكروفون غير مسموح هنا. استخدم الأزرار الكبيرة'); sayG(L.nohear); };
    REC.onend=()=>{ S.listening=false; setMic(false); if(!got&&!S.micErr){} };
    REC.start();
  }catch(e){ S.listening=false; setMic(false); toast('تعذّر تشغيل المايكروفون'); sayG(L.nohear); }
}
function setMic(on){ document.querySelectorAll('.micbtn').forEach(b=>b.classList.toggle('listening',on)); const h=$('.michint'); if(h) h.textContent=on?LOC[G().id].listen:LOC[G().id].tap; }
const norm=s=>s.toLowerCase().replace(/[ً-ْ]/g,'').replace(/[.,!?؟،]/g,' ').trim();
const SYN={yes:['ya','evet','oui','yes','نعم','اه','أيوه','ايوه','first'],no:['tidak','bukan','hayır','hayir','non','no','لا','كلا']};
function matchOption(alts,q){
  const L=LOC[G().id]; const map=L.o[q.k];
  for(const a of alts){ const t=norm(a);
    for(const [v,lab] of Object.entries(map)){
      const l=norm(lab); const ar=norm((q.o.find(o=>o[0]===v)||[])[1]||'');
      if(t.includes(l)||t.includes(ar)||(l.length>2&&l.split(' ').some(w=>w.length>3&&t.includes(w)))) return v;
      if(SYN[v]&&SYN[v].some(w=>t.split(' ').includes(w))) return v;
    }}
  return null;
}

function quiz(){
  const g=G(),L=LOC[g.id],ar=isAG(g.id),q=QS[S.qi];
  const bubble=S.done
    ? `<div class="bubble"><span class="big" dir="auto">${L.done}</span>${ar?'':`<span class="ar-sub">${AR_DONE}</span>`}<span class="typing"><i></i><i></i><i></i></span></div>`
    : `<div class="bubble"><span class="big" dir="auto">${L.q[S.qi]}</span>${ar?'':`<span class="ar-sub">${AR_Q[S.qi]}</span>`}</div><button class="replay" data-act="repeatQ">${ico('speaker')}${L.repeat}</button>`;
  let opts='';
  if(!S.done){ const sel=S.ans[q.k]||[];
    opts=`<div class="vopts" data-n="${q.o.length}">${q.o.map((o,i)=>{const on=q.multi&&sel.includes(o[0]);const wide=q.o.length%2===1&&i===q.o.length-1;return `<button class="vopt ${on?'on':''} ${wide?'wide':''}" data-act="answer" data-v="${o[0]}"><b dir="auto">${L.o[q.k][o[0]]}</b>${ar?'':`<small>${o[1]}</small>`}</button>`}).join('')}</div>
    <div class="microw">${q.multi?`<button class="btn primary" style="min-height:54px;font-size:1.1rem;width:calc(100% - 2.2rem);${sel.length?'':'opacity:.5'}" data-act="doneMulti" ${sel.length?'':'disabled'}>${L.next}</button>`:''}<button class="micbtn" data-act="mic" aria-label="تحدث">${ico('mic')}</button><span class="michint">${L.tap}</span></div>`; }
  return `<div class="screen"><div class="topbar"><button class="iconbtn" data-act="${S.qi?'qback':'go'}" data-v="guide" aria-label="رجوع">${ico('back')}</button><div class="grow"><b>${g.name}</b></div></div>
   <div class="vdots">${QS.map((_,i)=>`<i class="${i<=S.qi?'on':''}"></i>`).join('')}</div>
   <div class="vstage" style="margin-top:.8rem">${figure(g.id,200,'speakable')}<div class="vbub">${bubble}</div></div>${opts}</div>`;
}
function answer(v){
  const q=QS[S.qi];
  if(q.multi){ const a=S.ans[q.k]||[]; S.ans[q.k]=a.includes(v)?a.filter(x=>x!==v):[...a,v]; render(true); fx('nod'); return; }
  S.ans[q.k]=v; fx('nod'); setTimeout(nextQ,350);
}
function homeGreetSay(){ const L=LOC[S.guide]; fx('wave'); sayG(L.greet(L.grp[S.group]||'',L.tm[S.time]||'')); }
function nextQ(){
  const L=LOC[S.guide];
  if(S.qi<QS.length-1){ S.qi++; render(); const s=$('.screen'); if(s) s.scrollTop=0; sayG(L.q[S.qi]); }
  else { S.done=true; S.thinking=true; render(); sayG(L.done);
    setTimeout(()=>{ S.first=S.ans.first; S.group=S.ans.group; S.dest=S.ans.dest; S.interests=S.ans.interests||[]; S.budget=S.ans.budget; S.time='3h'; S.thinking=false; S.done=false; S.plan=null; S.chat=[]; S.tab='home'; go('main'); setTimeout(homeGreetSay,300); },2600);}
}

