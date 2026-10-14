/* Explore */
/* الأقسام الظاهرة: قسم لكل اهتمام اختاره الزائر، وباسمه نفسه في سؤال «وش تحب؟» */
const IGROUPS=[['sight','hist'],['exp','local'],['food','food'],['cafe','coffee']];   // [نوع المكان، الاهتمام]
const interestLabel=k=>T(IMAP[k]);
function groupsWanted(){ const a=S.interests||[]; return IGROUPS.filter(g=>!a.length||a.includes(g[1])).map(g=>[g[0],interestLabel(g[1]),[g[0]],g[1]]); }
/* استكشف يعرض كل الأنواع حتى التي لم يخترها الزائر */
function filterList(){ return [['all',T('الكل')],...IGROUPS.map(g=>[g[0],interestLabel(g[1])])]; }
const KEEP=['sight','exp','food','cafe'];
function filtered(){ return P.filter(p=>visAny(p)&&KEEP.includes(p.cat)&&(S.filter==='all'||p.cat===S.filter)); }
function explore(){
  const v=S.exView;
  return `<div style="display:flex;flex-direction:column;flex:1;min-height:0">
  <div class="topbar between"><h2 style="font-size:1.5rem">استكشف</h2><div class="seg"><button class="${v==='map'?'on':''}" data-act="exView" data-v="map">الخريطة</button><button class="${v==='list'?'on':''}" data-act="exView" data-v="list">القائمة</button></div></div>
  ${v==='map'?mapView():listView()}</div>`;
}
/* MAPD (الشوارع والأودية) تُحمَّل من data/map_quba.json عبر js/map-data.js */
const MV={W:380,H:460};
function mvDefault(){ return {k:.17,cx:130,cy:-120}; }
function mvFit(pts,minHalf){
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; pts.forEach(q=>{x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y);});
  const w=Math.max(x1-x0,2*(minHalf||500)),h=Math.max(y1-y0,2*(minHalf||500));
  const k=Math.min(MV.W/(w*1.35),MV.H/(h*1.5)); S.mv={k:Math.max(.025,Math.min(1.2,k)),cx:(x0+x1)/2,cy:(y0+y1)/2};
}
function niceLen(m){ const a=[50,100,200,500,1000,2000,5000]; let r=a[0]; a.forEach(v=>{ if(v<=m) r=v; }); return r; }
function mapView(){
  if(!S.mv) S.mv=mvDefault();
  const sel=S.mapSel?byId(S.mapSel):null;
  const mp=(d,cls,extra)=>d?`<path class="${cls}" ${extra||''} d="${d}"/>`:'';
  const base=`<g id="mbase">${mp(MAPD.water,'mw')}${mp(MAPD.minor,'mr mnr m1')}${mp(MAPD.tertiary,'mr m2')}${mp(MAPD.secondary,'mc m3c')}${mp(MAPD.secondary,'mr m3')}${mp(MAPD.primary,'mc m4c')}${mp(MAPD.primary,'mr m4')}${mp(MAPD.trunk+MAPD.motorway,'mc m5c')}${mp(MAPD.trunk+MAPD.motorway,'mr m5')}${mp(MAPD.mosque,'mm')}</g>`;
  return `<div class="mapwrap"><div class="mapfilters">${filterList().map(f=>`<button class="chip ${S.filter===f[0]?'on':''}" data-act="filter" data-v="${f[0]}">${f[1]}</button>`).join('')}</div>
  <svg class="map" id="mapsvg" role="img" aria-label="${T('خريطة المدينة المنورة')}"><rect width="100%" height="100%" fill="var(--sand)"/>${base}<g id="mpins"></g></svg>
  <div class="mapctl"><button class="btn sm" data-act="mapZoom" data-v="1" aria-label="${T('تكبير')}">＋</button><button class="btn sm" data-act="mapZoom" data-v="-1" aria-label="${T('تصغير')}">－</button><button class="btn sm" data-act="mapFit" aria-label="${T('عرض الكل')}">${ico('pin')}</button></div>
  <div class="mapcredit">© OpenStreetMap</div>
  ${sel?`<div class="card mapcard">${artBlock(sel)}<div class="grow"><b>${sel.n}</b>${stat(sel)}</div><div style="display:flex;flex-direction:column;gap:.3rem"><button class="btn primary sm" data-act="route" data-v="${sel.id}">خذني له</button><button class="btn sm" data-act="openPlace" data-v="${sel.id}">التفاصيل</button></div></div>`:`<div class="small muted mapnote">${T('اسحب الخريطة وكبّرها. النقطة الزرقاء فندقك.')}</div>`}
  </div>`;
}
function mapApply(){
  const svg=$('#mapsvg'); if(!svg) return;
  const {k,cx,cy}=S.mv,W=MV.W,H=MV.H,tx=W/2-cx*k,ty=H/2+cy*k;
  const q=(x,y)=>({x:tx+k*x,y:ty-k*y});
  $('#mbase').setAttribute('transform',`translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${k} ${-k})`);
  $('#mbase').dataset.far=k<.06?'1':'0';
  const list=filtered().filter(hasLoc),sel=S.mapSel?byId(S.mapSel):null,hp=q(HOTEL.x,HOTEL.y);
  let route=''; if(S.route&&sel&&hasLoc(sel)){ const b=q(sel.x,sel.y); route=`<path d="M${hp.x.toFixed(1)} ${hp.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}" fill="none" stroke="var(--gold)" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round"/>`; }
  const pins=list.map(p=>{const m=q(p.x,p.y);const col=`var(${CAT[p.cat].col})`;const on=sel&&sel.id===p.id;return `<g class="pin" tabindex="0" role="button" aria-label="${p.n}" data-act="mapPin" data-v="${p.id}" transform="translate(${m.x.toFixed(1)},${m.y.toFixed(1)})"><circle r="${on?14:9}" fill="${col}" stroke="var(--surface)" stroke-width="2.5"/><g transform="translate(${on?-7:-5},${on?-7:-5}) scale(${on?.58:.42})" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ICON[p.cat==='svc'?SUB[p.sub][1]:CAT[p.cat].ic]}</g></g>`}).join('');
  const L=niceLen(90/k),sx=14,sy=H-16;
  const bar=`<g class="mscale"><path d="M${sx} ${sy-5}V${sy}H${sx+L*k}V${sy-5}" fill="none" stroke="var(--ink)" stroke-width="1.6"/><text x="${sx+2}" y="${sy-8}" font-size="10" fill="var(--ink)">${L<1000?T('{0} م',AR(L)):T('{0} كم',AR(L/1000))}</text></g>`;
  $('#mpins').innerHTML=bar+route+pins+`<g transform="translate(${hp.x.toFixed(1)},${hp.y.toFixed(1)})"><circle r="16" fill="#2D7DE0" opacity=".2"/><circle r="7" fill="#2D7DE0" stroke="#fff" stroke-width="3"/></g>`;
}
function mapInit(){
  const svg=$('#mapsvg'); if(!svg) return;
  const r=svg.getBoundingClientRect(); const z=parseFloat(getComputedStyle(document.documentElement).zoom)||1;
  MV.W=Math.max(200,Math.round(svg.clientWidth)||380); MV.H=Math.max(200,Math.round(svg.clientHeight)||460);
  svg.setAttribute('viewBox',`0 0 ${MV.W} ${MV.H}`);
  if(S.mvFit){ mvFit(S.mvFit,350); S.mvFit=null; } else if(!S.mvInit){ mvFit(P.filter(hasLoc).concat([HOTEL]),300); }
  S.mvInit=true; mapApply(); localize($('#mapsvg'));
  let st=null,dragged=false;
  const sc=()=>svg.getBoundingClientRect().width/MV.W||1;
  svg.addEventListener('pointerdown',e=>{ st={x:e.clientX,y:e.clientY,cx:S.mv.cx,cy:S.mv.cy,id:e.pointerId}; dragged=false; });
  svg.addEventListener('pointermove',e=>{ if(!st) return; const dx=e.clientX-st.x,dy=e.clientY-st.y; if(!dragged&&Math.hypot(dx,dy)<6) return; if(!dragged){ dragged=true; try{svg.setPointerCapture(st.id);}catch(_){} }
    S.mv.cx=st.cx-dx/sc()/S.mv.k; S.mv.cy=st.cy+dy/sc()/S.mv.k; mapApply(); });
  const end=()=>{ st=null; };
  svg.addEventListener('pointerup',end); svg.addEventListener('pointercancel',end);
  svg.addEventListener('click',e=>{ if(dragged){ e.stopPropagation(); e.preventDefault(); dragged=false; } },true);
  svg.addEventListener('wheel',e=>{ e.preventDefault(); mapZoom(e.deltaY<0?1:-1); },{passive:false});
}
function mapZoom(d){ const m=S.mv; m.k=Math.max(.025,Math.min(1.2,m.k*(d>0?1.5:1/1.5))); mapApply(); }
function listView(){
  const cats=[['sight','dome','معالم وتاريخ'],['food','food','مطاعم'],['cafe','coffee','مقاهي'],['shop','bag','تسوق وهدايا'],['exp','star','تجارب محلية'],['svc','plus','خدمات الزائر']];
  const svcs=Object.entries(SUB);
  return `<div class="screen" style="animation:none"><div class="pad" style="padding-top:.2rem">
   <div class="chips" style="margin-bottom:.8rem">${filterList().map(f=>`<button class="chip ${S.filter===f[0]?'on':''}" data-act="filter" data-v="${f[0]}">${f[1]}</button>`).join('')}</div>
   <div class="sec-title"><h3>${S.filter==='all'?T('كل الأماكن'):interestLabel(IGROUPS.find(g=>g[0]===S.filter)[1])}</h3><span>${T('{0} نتيجة',AR(filtered().length))}</span></div>
   <div style="display:flex;flex-direction:column;gap:.7rem">${filtered().sort((a,b)=>D(a)-D(b)).map(p=>`<button class="card cultcard" data-act="openPlace" data-v="${p.id}">${artBlock(p)}<span class="grow"><b>${p.n}</b>${stat(p)}</span></button>`).join('')}</div></div></div>`;
}

