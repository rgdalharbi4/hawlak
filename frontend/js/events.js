/* ============ Events ============ */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  if(t.classList.contains('scrim')&&e.target!==t) return;
  const f=A[t.dataset.act]; if(f) f(t.dataset.v,t);
});
document.addEventListener('keydown',e=>{ if((e.key==='Enter'||e.key===' ')&&e.target.matches('.pin')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));} });
document.addEventListener('input',e=>{ const b=e.target.dataset&&e.target.dataset.bind; if(b){ S[b]=e.target.value; const m={hotelName:()=>{const n=$('#drvName'); if(n)n.textContent=S.hotelName||'—'; const h=$('#idH'); if(h)h.textContent=T('فندقي: {0}',S.hotelName);},hotelAddr:()=>{const n=$('#drvAddr'); if(n)n.textContent=S.hotelAddr;},idName:()=>{const n=$('#idN'); if(n)n.textContent=S.idName||T('اسم الضيف');},idPhone:()=>{const n=$('#idP'); if(n)n.textContent=S.idPhone?T('اتصل بمرافقي: {0}',S.idPhone):T('رقم المرافق');}}; if(m[b]) m[b](); return; }
  if(e.target.dataset.input==='q'){ S.q=e.target.value; render(true); } });
document.addEventListener('submit',e=>{ if(e.target.dataset.form==='chat'){ e.preventDefault(); const i=$('#chatq'); const v=i.value; i.value=''; sendQ(v); } });

