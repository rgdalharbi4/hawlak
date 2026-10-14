/* ============ Helpers ============ */
function artBlock(p,cls=''){
  const c=CAT[p.cat]; const col=`var(${c.col})`;
  const ic = p.cat==='svc'?SUB[p.sub][1]:(p.tags&&p.tags.includes('museum')?'museum':c.ic);
  return `<div class="art ${cls}" style="background:linear-gradient(140deg,${col},color-mix(in srgb,${col} 55%,#000))">${ico(ic)}</div>`;
}
/* الميزانية الاقتصادية: الأماكن المعلَّمة eco فقط. المفتوحة: الكل. */
/* وش تحب؟ تحدد الأقسام الظاهرة: أثري ← أماكن أزورها، تجارب ← تجارب، مطاعم ← أكل، قهوة ← مقاهٍ */
const INTEREST_CATS={hist:['sight'],local:['exp'],food:['food'],coffee:['cafe']};
function wantCats(){ const a=S.interests||[]; if(!a.length) return null; return a.flatMap(k=>INTEREST_CATS[k]||[]); }
function visAny(p){ return !(S.a11y.wheel && !p.acc); }   // بلا تصفية الاهتمامات ولا الميزانية (تبويب استكشف يعرض كل شيء)
function vis(p){ const w=wantCats(); return visAny(p) && !(S.budget==='eco' && !p.eco) && !(w && !w.includes(p.cat)); }
function score(p,prev){
  let s=0;const a=S.interests;
  if(p.cat!=='svc'){
    a.forEach(k=>{ if(p.tags.includes(k)) s+=3; });
    if(a.includes('hist')&&p.cat==='sight') s+=1;
    if(a.includes('food')&&p.cat==='food') s+=2;
    if(a.includes('coffee')&&p.cat==='cafe') s+=2;
    if(a.includes('shop')&&p.cat==='shop') s+=2;
    if(a.includes('gifts')&&p.tags.includes('gifts')) s+=1;
    if(a.includes('museum')&&p.tags.includes('museum')) s+=2;
    if(a.includes('family')&&p.fam&&p.tags.includes('family')) s+=2;
    if(a.includes('local')&&p.cult.includes('local')) s+=2;
  }
  const b=BUD[S.budget]||2; if(p.price>b) s-=4; else if(p.price===b) s+=.5;
  if((S.group==='family'||S.group==='kids')){ s+= p.fam?1.5:-4; if(S.group==='kids'&&p.t>90) s-=2;}
  if(S.group==='elder'){ s+= p.acc?2:-6; if(D(p)>2500) s-=3; }
  if(S.group==='solo'&&p.tags.includes('local')) s+=1;
  s-= D(p)/1200;
  if(prev) s-= R(p,prev)/900;
  return s;
}
function ranked(cats,n,prev){
  return P.filter(p=>cats.includes(p.cat)&&vis(p)).map(p=>[score(p,prev),p]).sort((a,b)=>b[0]-a[0]).slice(0,n).map(x=>x[1]);
}
function why(p){
  const r=[]; const a=S.interests;
  if(p.dist==null){} else if(p.dist<=1000) r.push(T('قريب منك ({0})',etaTxt(p.dist))); else if(p.dist<=2500) r.push(T('على مسافة معقولة ({0})',km(p.dist)));
  const b=BUD[S.budget]||2; if(p.price<=b&&p.price>0) r.push(T('يناسب ميزانيتك')); else if(p.price===0&&!p.np) r.push(T('زيارته مجانية'));
  const hit=p.tags.filter(t=>a.includes(t)).map(t=>IMAP[t]); if(hit.length) r.push(T('يطابق اهتمامك ({0})',T(hit[0])));
  if(p.cult.includes(S.guide)) r.push(isAG(S.guide)?T('فيه ما يشبه أكل بلدك وذوقك'):T('فيه ما يقرّبك من ذوقك وثقافة {0}',T(G().country)));
  if(!r.length) r.push(T('من أشهر ما يزوره ضيوف المدينة'));
  const sel=r.slice(0,4); const j=IS_AR()?sel.join('، و'):(sel.length>1?sel.slice(0,-1).join(', ')+' '+T('و')+' '+sel[sel.length-1]:sel[0]);
  return T('رشحته لك لأنه {0}.',j);
}
let toastT;
function toast(m){ m=T(m); const l=$('#layer'); let t=$('.toast',l); if(t)t.remove(); l.insertAdjacentHTML('beforeend',`<div class="toast" role="status">${m}</div>`); clearTimeout(toastT); toastT=setTimeout(()=>{const x=$('.toast',l); if(x)x.remove();},2400);}
function sheet(html){ $('#layer').insertAdjacentHTML('afterbegin',`<div class="scrim" data-act="closeSheet"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div></div>`); localize($('#layer .scrim'));}
function closeSheet(){ const s=$('#layer .scrim'); if(s) s.remove(); }
function stat(p){ if(p.dist==null) return '<div class="stat"></div>'; return `<div class="stat"><span>${ico(eta(p.dist).mode==='walk'?'walk':'car')}${km(p.dist)}</span><span>${ico('clock')}${minTxt(eta(p.dist).min)}</span>${p.price?`<span>${PRICE_TXT[p.price]}</span>`:''}</div>`; }

const NAT={id:'الإندونيسيين',tr:'الأتراك',fr:'الفرنسيين',uk:'البريطانيين',ar:'العرب',eg:'المصريين'};
const isAG=id=>id==='ar'||id==='eg';
