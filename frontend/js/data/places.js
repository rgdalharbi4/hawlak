/* Mock places. x/y are meters east/north of the Prophet's Mosque; distance is computed from the visitor's hotel. */
const HOTEL = {x:350,y:-300};
const P = [];
const add=(id,cat,n,x,y,r,price,tags,o={})=>P.push(Object.assign({id,cat,n,nAr:n,x,y,r,price,tags,cult:[],fam:true,acc:true,t:30,hrs:'٩ ص – ١٢ ص',svc:[],d:''},o));






/* مكان بلا موقع بعد: x و y فارغتان، فلا خريطة ولا مسافة له */
const hasLoc=p=>p.x!=null&&p.y!=null;
const R=(a,b)=>(hasLoc(a)&&hasLoc(b))?Math.hypot(a.x-b.x,a.y-b.y):99999;
const D=p=>p.dist==null?99999:p.dist;
/* إحداثيات حقيقية للمعالم المؤكدة (OpenStreetMap)، والمركز = المسجد النبوي */
const LAT0=24.4672,LON0=39.6111,KX=111320*Math.cos(LAT0*Math.PI/180),KY=111320;
/* أماكن قباء المعتمدة من الفريق. eco=1 تعني «اقتصادي» (تظهر لمن اختار الميزانية الاقتصادية)، وغير ذلك يظهر لمن اختار «مفتوحة» فقط.
   المواقع (lat/lon) ورابط خرائط قوقل (cid) من روابط الفريق. لا تقييمات ولا أسعار ولا ساعات مختلقة. */
const QP=[
 ['s1','sight','مسجد قباء',24.4393911,39.6173007,['hist'],{cid:'7550015683493755470',eco:1,t:45,hrs:'على مدار الساعة',latin:'Masjid Quba',d:'أول مسجد بُني في الإسلام، ويقع في قلب منطقة قباء.',en:'The first mosque built in Islam, in the heart of the Quba area.'}],
 ['s2','sight','بئر الخاتم',24.4389192,39.6166348,['hist'],{cid:'10093878104872697150',eco:1,t:15,latin:'Sumur Khatam (Bir Aris)',d:'موقع تاريخي في منطقة قباء.',en:'A historic site in the Quba area.'}],
 ['e1','exp','تجربة بستان المستظل وبئر عذق',24.4385602,39.615801,['local'],{cid:'7783095712998790854',eco:1,t:90,latin:"Pengalaman Kebun Al-Mustazill dan Sumur 'Adzq",d:'تجربة في منطقة قباء.',en:'An experience in the Quba area.'}],
 ['e2','exp','ورد المدينة',24.4735947,39.6111645,['local'],{cid:'4031152627242293328',eco:0,t:60,latin:'Wardul Madinah',d:'تجربة في المدينة المنورة.',en:'An experience in Madinah.'}],
 ['c1','cafe','أشجار كافيه',24.4388051,39.6160623,['coffee'],{cid:'18085889367733106961',eco:1,latin:'Ashjar Cafe',d:'مقهى في منطقة قباء.',en:'A coffee place in the Quba area.'}],
 ['c2','cafe','كوفيماتكس',24.4372935,39.6164538,['coffee'],{cid:'17733243291217134951',eco:0,latin:'Coffeematix',d:'مقهى في منطقة قباء.',en:'A coffee place in the Quba area.'}],
 ['c3','cafe','عجوتك',24.4389262,39.6155562,['coffee'],{cid:'9663407688430174627',eco:0,latin:'Ajwatak',d:'مقهى في منطقة قباء.',en:'A coffee place in the Quba area.'}],
 ['f1','food','سقى',24.438693,39.6158245,[],{cid:'14488963176241528182',eco:0,latin:'SOQA',d:'مطعم في منطقة قباء.',en:'A restaurant in the Quba area.'}],
 ['f2','food','عطرة',24.4589441,39.6089792,[],{cid:'16241477494620730908',eco:0,latin:'Etruh',d:'مطعم في المدينة المنورة.',en:'A restaurant in Madinah.'}],
 ['f3','food','أولد قولد',24.4371255,39.6161878,[],{cid:'8188931649866699541',eco:1,latin:'Old Gold Burger',d:'مطعم في منطقة قباء.',en:'A restaurant in the Quba area.'}]
];
QP.forEach(([id,cat,n,la,lo,tags,o])=>{ const has=la!=null&&lo!=null; add(id,cat,n,has?Math.round((lo-LON0)*KX):null,has?Math.round((la-LAT0)*KY):null,4.5,0,tags,Object.assign({lat:la,lon:lo,hrs:'',np:1,t:cat==='food'?45:30},o,{eco:!!o.eco})); });
Object.assign(HOTEL,{x:Math.round((39.6128-LON0)*KX),y:Math.round((24.4430-LAT0)*KY)});
P.forEach(p=>{p.dist=hasLoc(p)?Math.round(R(p,HOTEL)/10)*10:null;});
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

