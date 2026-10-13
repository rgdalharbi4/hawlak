/* Static Arabic text in rendered HTML is swapped for the visitor's language; Arabic place names, descriptions and the hotel address stay as they are. */
function localize(root){
  const L=UIL(); if(!root||L==='ar') return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); const nodes=[]; while(w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(n=>{ const par=n.parentElement; if(!par||par.closest(SKIPSEL)) return; const raw=n.nodeValue; if(!/[؀-ۿ٠-٩]/.test(raw)) return;
    const key=raw.replace(/\s+/g,' ').trim(); const r=DICT[key];
    if(r&&r[L]){ n.nodeValue=raw.replace(raw.trim(),r[L]); return; }
    if(/[٠-٩]/.test(raw)) n.nodeValue=digits(raw); });
  root.querySelectorAll('[aria-label],[placeholder],[title]').forEach(e=>{ if(e.closest(SKIPSEL)) return;
    ['aria-label','placeholder','title'].forEach(at=>{ const v=e.getAttribute(at); if(v){ const r=DICT[v]; if(r&&r[L]) e.setAttribute(at,r[L]); } }); });
}
const CN={id:'إندونيسيا',tr:'تركيا',fr:'فرنسا',uk:'بريطانيا',ar:'العالم العربي',eg:'مصر'};
const natName=gid=>IS_AR()?NAT[gid]:T(CN[gid]);
const BR=()=>IS_AR()?BRAND:'Hawlak';
const PNS={id:['Subuh','Zuhur','Ashar','Maghrib','Isya'],tr:['Sabah','Öğle','İkindi','Akşam','Yatsı'],fr:['Fajr','Dhuhr','Asr','Maghrib','Isha'],uk:['Fajr','Dhuhr','Asr','Maghrib','Isha']};
const prayName=i=>IS_AR()?PRAY[i][0]:PNS[UIL()][i];
const rate=r=>{ const v=r.toFixed(1); return IS_AR()?AR(v).replace('.','٫'):(UIL()==='uk'?v:v.replace('.',',')); };
const noteTxt=n=>!n?'':n.k==='mosque'?T('تصل المسجد قبل الأذان بـ{0}',durTxt(n.v)):n.k==='pre'?T('تصل قبل الأذان بـ{0}',durTxt(n.v)):T('الصلاة بدأت، انضم إلى الصف');
function hrs(t){ const L=UIL(); if(L==='ar') return t; if(/على مدار الساعة|٢٤ ساعة/.test(t)) return T('٢٤ ساعة');
  return digits(t.replace(/([٠-٩]{1,2})(:[٠-٩]{2})?\s*([صمظ])/g,(m,h,mi,sf)=>{ let H=+digits(h); const M=mi?digits(mi).slice(1):'00';
    if(sf==='ظ') H=12; else if(sf==='م'){ H=(H===12)?24:(H<12?H+12:H); } else if(H===12) H=0;
    if(L==='uk'){ const ap=(H>=12&&H<24)?'PM':'AM'; let h12=H%12; if(h12===0) h12=12; return M==='00'?`${h12} ${ap}`:`${h12}:${M} ${ap}`; }
    return `${String(H).padStart(2,'0')}:${M}`; })); }

const G=()=>GUIDES[S.guide]||GUIDES.id;
const BUD={eco:1,mid:2,open:3};
const TIME={'1h':['ساعة',60],'3h':['٣ ساعات',180],'half':['نصف يوم',300],'full':['يوم كامل',480]};
const GRP={solo:'لوحدك',family:'العائلة',kids:'أطفال',elder:'كبار السن',friends:'أصدقاء'};
const grpTxt={solo:'تتجول لوحدك',family:'العائلة',kids:'الأطفال',elder:'كبار السن',friends:'الأصدقاء'};

