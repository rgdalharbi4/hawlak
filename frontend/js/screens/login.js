/* التسجيل عند الحاجة فقط (حفظ مفضلة أو طلب حجز): الاسم ورقم الجوال، ويُحفظان عند الخادم */
const USER_KEY='hawlak_user';
function loadUser(){ try{ const u=JSON.parse(localStorage.getItem(USER_KEY)||'null'); if(u&&u.token) S.user=u; }catch(e){} }
function storeUser(u){ S.user=u; try{ localStorage.setItem(USER_KEY,JSON.stringify(u)); }catch(e){} }
async function api(path,opt={}){
  const r=await fetch(path,{method:opt.method||'GET',headers:{'Content-Type':'application/json',...(S.user&&S.user.token?{'X-Token':S.user.token}:{})},body:opt.body?JSON.stringify(opt.body):undefined});
  if(!r.ok){ const e=new Error('api '+r.status); e.status=r.status; throw e; }
  return r.json();
}
function needLogin(fn){
  /* بلا خادم (نسخة العرض المنشورة) لا نجمع اسمًا ولا جوالًا: المفضلة تُحفظ على الجهاز فقط */
  if(S.user||S.noServer){ fn(); return; } S.after=fn;
  sheet(`<h3>سجّل لتكمل</h3><p class="muted small" style="margin:.2rem 0 .8rem">نطلب التسجيل فقط عند الحفظ أو الحجز.</p>
   <div class="field"><label for="lgN">الاسم</label><input class="in" id="lgN" autocomplete="name"></div>
   <div class="field"><label for="lgP">رقم الجوال</label><input class="in" id="lgP" inputmode="tel" autocomplete="tel" dir="ltr"></div>
   <p class="muted small" id="lgE" style="color:var(--c-svc);min-height:1.3em"></p>
   <button class="btn primary block" data-act="doLogin">متابعة</button><button class="btn ghost block" style="margin-top:.4rem" data-act="closeSheet">ليس الآن</button>
   <p class="muted small" style="margin-top:.6rem">نستخدم اسمك ورقمك لحفظ مفضلتك وإرسال طلبات الحجز فقط.</p>`);
}

async function doLogin(){
  const name=(($('#lgN')||{}).value||'').trim(), phone=(($('#lgP')||{}).value||'').trim(); const err=$('#lgE');
  if(name.length<2||phone.replace(/\D/g,'').length<7){ if(err) err.textContent=T('اكتب اسمك ورقم جوالك بشكل صحيح'); return; }
  try{ const u=await api('/api/visitor',{method:'POST',body:{name,phone}}); closeSheet(); storeUser({name:u.name,token:u.token}); toast(T('أهلاً {0}',u.name)); }
  catch(e){ if(err) err.textContent=e.status===429?T('محاولات كثيرة، حاول بعد قليل'):e.status===422?T('اكتب اسمك ورقم جوالك بشكل صحيح'):T('تعذّر التسجيل الآن، حاول لاحقًا'); return; }
  const f=S.after; S.after=null; if(f) f(); else render(true);
}
async function syncFav(id,on){ if(!(S.user&&S.user.token)) return; try{ await api('/api/favorites',{method:'POST',body:{place_id:id,on}}); }catch(e){ console.warn('تعذّر حفظ المفضلة على الخادم',e); } }
async function loadFavs(){ if(!(S.user&&S.user.token)) return; try{ const r=await api('/api/favorites'); S.saved=new Set(r.place_ids); }catch(e){ if(e.status===401){ S.user=null; try{localStorage.removeItem(USER_KEY);}catch(_){} } } }
async function confirmBook(id){
  const t=(($('#bkT')||{}).value)||'19:00'; closeSheet();
  needLogin(async()=>{
    try{ await api('/api/bookings',{method:'POST',body:{place_id:id,time:t,people:S.bk.n}}); sheet(`<h3>${T('تم إرسال طلب الحجز')}</h3><p class="muted" style="margin:.4rem 0 1rem">${T('{0} · {1} · {2} أشخاص',byId(id).n,t,AR(S.bk.n))}</p><p class="muted small">${T('طلبك قيد المراجعة، وهو ليس تأكيدًا من المكان.')}</p><button class="btn primary block" style="margin-top:1rem" data-act="closeSheet">${T('تم')}</button>`); }
    catch(e){ toast(e.status===401?T('سجّل من جديد'):T('تعذّر إرسال الطلب الآن')); if(e.status===401){ S.user=null; try{localStorage.removeItem(USER_KEY);}catch(_){} } }
  });
}
