/* Mock places. x/y are meters east/north of the Prophet's Mosque; distance is computed from the visitor's hotel. */
const HOTEL = {x:350,y:-300};
const P = [];
const add=(id,cat,n,x,y,r,price,tags,o={})=>P.push(Object.assign({id,cat,n,nAr:n,x,y,r,price,tags,cult:[],fam:true,acc:true,t:30,hrs:'٩ ص – ١٢ ص',svc:[],d:''},o));






const R=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
/* إحداثيات حقيقية للمعالم المؤكدة (OpenStreetMap)، والمركز = المسجد النبوي */
const LAT0=24.4672,LON0=39.6111,KX=111320*Math.cos(LAT0*Math.PI/180),KY=111320;
/* أماكن حقيقية في منطقة قباء: الأسماء والمواقع من OpenStreetMap. الوصف مختصر، ولا تقييمات ولا أسعار ولا ساعات عمل. */
const QP=[
 ['s1','sight','مسجد قباء',24.4396,39.6173,['hist','family'],{t:45,hrs:'على مدار الساعة',np:0,d:'أول مسجد بُني في الإسلام، ويقع في قلب منطقة قباء.'}],
 ['s2','sight','بئر أريس',24.4389,39.6165,['hist'],{t:15,np:0,d:'موقع تاريخي قريب من مسجد قباء.'}],
 ['e1','exp','مقصد قباء',24.4372,39.6164,['local','family'],{t:90,d:'وجهة بجوار مسجد قباء تحتضن فعاليات ويزورها كثيرون.'}],
 ['e2','exp','واحة ميلاف',24.4356,39.6187,['local','family'],{t:60,d:'وجهة سياحية في منطقة قباء.'}],
 ['e3','exp','مزرعة المربد',24.4424,39.6284,['local'],{t:60,d:'مزرعة ومكان للطعام في منطقة قباء، حسب بيانات الخريطة.'}],
 ['f1','food','مطعم تركيا',24.4454,39.6061,[],{d:'مطعم في منطقة قباء.'}],
 ['f2','food','اسطنبول شيش كباب',24.4400,39.6146,[],{d:'مطعم قريب من مسجد قباء.'}],
 ['f3','food','الطبق الجاوي',24.4494,39.6158,[],{cult:['id'],d:'مطعم في منطقة قباء، واسمه يشير إلى المطبخ الجاوي.'}],
 ['f4','food','مطعم الباب العالي',24.4490,39.6216,[],{d:'مطعم في منطقة قباء.'}],
 ['f5','food','مطعم الشلال الدمشقي',24.4498,39.6211,[],{d:'مطعم في منطقة قباء.'}],
 ['f6','food','مذاقك الشهي',24.4493,39.6211,[],{d:'مطعم في منطقة قباء.'}],
 ['f7','food','مطعم هناء الراقي',24.4457,39.6064,[],{d:'مطعم في منطقة قباء.'}],
 ['f8','food','مطبق حي البحر',24.4495,39.6187,[],{d:'مطعم في منطقة قباء.'}],
 ['f9','food','كودو',24.4463,39.6200,[],{d:'مطعم وجبات سريعة في منطقة قباء.'}],
 ['f10','food','مطعم طيبة للمأكولات الشامية',24.4528,39.6229,[],{d:'مطعم في منطقة قباء.'}],
 ['c1','cafe','أريس كافيه',24.4497,39.6215,['coffee'],{d:'مقهى في منطقة قباء.'}],
 ['c2','cafe','قهوة موكا',24.4501,39.6224,['coffee'],{d:'مقهى في منطقة قباء.'}],
 ['c3','cafe','غلا القهوة',24.4495,39.6161,['coffee'],{d:'مقهى في منطقة قباء.'}],
 ['c4','cafe','الأسود',24.4474,39.6169,['coffee'],{d:'مقهى في منطقة قباء.'}],
 ['c5','cafe','المذاق المغربي',24.4412,39.6201,['coffee'],{d:'مقهى قريب من مسجد قباء.'}]
];
QP.forEach(([id,cat,n,la,lo,tags,o])=>{ add(id,cat,n,Math.round((lo-LON0)*KX),Math.round((la-LAT0)*KY),4.5,0,tags,Object.assign({lat:la,lon:lo,hrs:'',np:1,t:cat==='food'?45:30},o)); });
Object.assign(HOTEL,{x:Math.round((39.6128-LON0)*KX),y:Math.round((24.4430-LAT0)*KY)});
P.forEach(p=>{p.dist=Math.round(R(p,HOTEL)/10)*10;});
const byId=id=>P.find(p=>p.id===id);
const PRICE=['مجاني','٢٠ – ٤٠ ريال','٤٠ – ٩٠ ريال','أكثر من ٩٠ ريال'];
const PRICE_TXT=['مجاني','اقتصادي','متوسط','مرتفع'];
const AR=n=>{ const t=String(n); return UIL()==='ar'?t.replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]):t; };
const km=m=>{ if(m<1000) return T('{0} م',AR(m)); let v=(m/1000).toFixed(1); v=IS_AR()?AR(v).replace('.','٫'):(UIL()==='uk'?v:v.replace('.',',')); return T('{0} كم',v); };
const eta=m=>m<1500?{mode:'walk',min:Math.max(2,Math.round(m/75))}:{mode:'car',min:Math.max(4,Math.round(m/450)+2)};
const minTxt=n=>{ if(!IS_AR()) return T('{0} دقيقة',n); return n===1?'دقيقة واحدة':n===2?'دقيقتان':n<=10?`${AR(n)} دقائق`:`${AR(n)} دقيقة`; };
const etaTxt=m=>{const e=eta(m);return T(e.mode==='walk'?'{0} مشيًا':'{0} بالسيارة',minTxt(e.min))};
const fmtT=m=>{ m=((m%1440)+1440)%1440; let h=Math.floor(m/60); const mm=m%60; const L=UIL();
  if(L==='ar'){ const sf=h>=12?'م':'ص'; h=h%12||12; return `${AR(h)}:${AR(String(mm).padStart(2,'0'))} ${sf}`; }
  if(L==='uk'){ const sf=h>=12?'PM':'AM'; h=h%12||12; return `${h}:${String(mm).padStart(2,'0')} ${sf}`; }
  return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`; };

