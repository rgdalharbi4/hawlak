/* ============ Localized voice lines (guide speaks the visitor's language) ============ */
const KEYS=['first','group','interests','budget','time'];
const LOC={
 id:{
  q:['Apakah ini pertama kalinya kamu ke Madinah?','Siapa yang ikut denganmu?','Kamu suka apa? Boleh pilih lebih dari satu.','Berapa anggaranmu hari ini?','Berapa lama waktumu?'],
  o:{first:{yes:'Ya',no:'Tidak'},group:{solo:'Sendiri',family:'Keluarga',kids:'Anak-anak',elder:'Orang tua',friends:'Teman'},
   interests:{hist:'Tempat bersejarah',food:'Restoran',coffee:'Kopi',shop:'Belanja',local:'Pengalaman lokal',museum:'Museum',family:'Tempat keluarga',gifts:'Oleh-oleh',homefood:'Makanan dari negaraku'},
   budget:{eco:'Hemat',mid:'Menengah',open:'Bebas'},time:{'1h':'1 jam','3h':'3 jam',half:'Setengah hari',full:'Seharian'}},
  done:'Baik, aku paham. Aku atur Madinah sesuai caramu.',help:'Kamu mau apa hari ini? Aku yang mengaturnya.',next:'Lanjut',
  listen:'Aku mendengarkan…',nohear:'Aku belum dengar. Tekan tombol di layar ya.',tap:'Tekan dan bicara',repeat:'Ulangi',typeInstead:'Ketik saja',
  grp:{solo:'sendirian',family:'bersama keluarga',kids:'bersama anak-anak',elder:'bersama orang tua',friends:'bersama teman'},
  tm:{'1h':'1 jam','3h':'3 jam',half:'setengah hari',full:'seharian'},
  greet:(g,t)=>`Halo! Karena kamu ${g}, aku siapkan beberapa pilihan dekat untukmu.`,
  plan:'Rencana harimu sudah siap. Ketuk tempat mana saja untuk melihat detailnya.',
  pl:(m,walk,fam)=>`${m} menit ${walk?'berjalan kaki':'naik mobil'} dari hotelmu.${fam?' Cocok untuk keluarga.':''} Ketuk tombol hijau untuk petunjuk jalan.`,
  r:{plan3:'Ini rute singkat: kunjungan, kopi, lalu makan siang.',kids:'Aku pilih restoran yang ramah anak dan dekat dengan hotelmu.',gifts:'Dengan anggaran 200 riyal, toko-toko ini cocok. Kurma dan parfum ringan selalu jadi oleh-oleh yang bagus.',homefood:'Ini tempat yang dekat dengan seleramu dan masakan negaramu.',madani:'Cobalah masakan Madinah. Tempat-tempat ini menyajikan mutabbaq, hunaini, dan ful madani.',coffee:'Ini tempat terbaik untuk kopi dan istirahat di dekatmu.',health:'Ini layanan kesehatan terdekat. Dalam keadaan darurat, hubungi 997.',sights:'Tempat terbaik untuk dikunjungi sesuai waktu dan minatmu:',def:'Aku bisa bantu soal makanan, kopi, belanja, tempat wisata, dan layanan. Coba salah satu tombol di bawah.'},
  sugg:['Aku mau jalan-jalan, enaknya ke mana?','Cari restoran dekat yang cocok untuk anak','Cari oleh-oleh, anggaran 200 riyal','Aku mau makanan dari negaraku','Aku mau coba makanan Madinah']},
 tr:{
  q:['Medine\'ye ilk kez mi geliyorsun?','Yanında kim var?','En çok neyi seversin? Birden fazla seçebilirsin.','Bugünkü bütçen nedir?','Ne kadar vaktin var?'],
  o:{first:{yes:'Evet',no:'Hayır'},group:{solo:'Tek başıma',family:'Aile',kids:'Çocuklar',elder:'Yaşlılar',friends:'Arkadaşlar'},
   interests:{hist:'Tarihi yerler',food:'Restoranlar',coffee:'Kahve',shop:'Alışveriş',local:'Yerel deneyimler',museum:'Müzeler',family:'Aile mekânları',gifts:'Hediyelik',homefood:'Memleketimin yemekleri'},
   budget:{eco:'Ekonomik',mid:'Orta',open:'Sınırsız'},time:{'1h':'1 saat','3h':'3 saat',half:'Yarım gün',full:'Tam gün'}},
  done:'Tamam, seni anladım. Medine\'yi senin tarzına göre düzenliyorum.',help:'Bugün ne yapmak istersin? Ben ayarlarım.',next:'Devam',
  listen:'Dinliyorum…',nohear:'Duyamadım. Lütfen ekrandaki bir düğmeye dokun.',tap:'Basıp konuş',repeat:'Tekrarla',typeInstead:'Yazarak sor',
  grp:{solo:'tek başına',family:'ailenle',kids:'çocuklarınla',elder:'yaşlılarla',friends:'arkadaşlarınla'},
  tm:{'1h':'1 saat','3h':'3 saat',half:'yarım gün',full:'tam gün'},
  greet:(g,t)=>`Merhaba! ${g} geldiğin için sana yakın birkaç seçenek hazırladım.`,
  plan:'Günlük planın hazır. Ayrıntı için herhangi bir yere dokun.',
  pl:(m,walk,fam)=>`Otelinden ${walk?'yürüyerek':'arabayla'} ${m} dakika.${fam?' Aileye uygun.':''} Yol tarifi için yeşil düğmeye dokun.`,
  r:{plan3:'Kısa bir rota: ziyaret, kahve, sonra öğle yemeği.',kids:'Çocuklara uygun ve otelinize yakın restoranları seçtim.',gifts:'200 riyal bütçeyle bu dükkânlar uygun. Hurma ve hafif parfümler her zaman güzel hediyedir.',homefood:'Damak tadına ve memleketinin yemeklerine yakın yerler bunlar.',madani:'Medine mutfağını dene. Bu yerlerde mutabbak, hunayni ve Medine fülü var.',coffee:'Yakınında kahve ve dinlenmek için en iyi yerler bunlar.',health:'En yakın sağlık hizmetleri bunlar. Acil durumda 997\'yi ara.',sights:'Vaktine ve ilgi alanına göre ziyaret edebileceğin en iyi yerler:',def:'Yemek, kahve, alışveriş, gezilecek yerler ve hizmetlerde yardımcı olabilirim. Aşağıdaki düğmelerden birini dene.'},
  sugg:['Gezmek istiyorum, nereye gideyim?','Çocuklara uygun yakın bir restoran bul','Hediye bul, bütçem 200 riyal','Memleketimin yemeklerini istiyorum','Medine yemeği denemek istiyorum']},
 fr:{
  q:['C\'est la première fois que tu viens à Médine ?','Qui t\'accompagne ?','Qu\'est-ce que tu aimes le plus ? Tu peux en choisir plusieurs.','Quel est ton budget aujourd\'hui ?','Combien de temps as-tu ?'],
  o:{first:{yes:'Oui',no:'Non'},group:{solo:'Seul(e)',family:'En famille',kids:'Avec des enfants',elder:'Avec des seniors',friends:'Entre amis'},
   interests:{hist:'Lieux historiques',food:'Restaurants',coffee:'Café',shop:'Shopping',local:'Expériences locales',museum:'Musées',family:'Lieux familiaux',gifts:'Cadeaux',homefood:'Cuisine de mon pays'},
   budget:{eco:'Économique',mid:'Moyen',open:'Sans limite'},time:{'1h':'1 heure','3h':'3 heures',half:'Une demi-journée',full:'Une journée'}},
  done:'D\'accord, j\'ai compris. Je prépare Médine à ta façon.',help:'Qu\'as-tu envie de faire ? Je m\'en occupe.',next:'Continuer',
  listen:'J\'écoute…',nohear:'Je n\'ai pas bien entendu. Appuie sur un bouton à l\'écran.',tap:'Appuie et parle',repeat:'Répéter',typeInstead:'Écrire plutôt',
  grp:{solo:'tu es seul(e)',family:'tu es en famille',kids:'tu es avec des enfants',elder:'tu es avec des seniors',friends:'tu es entre amis'},
  tm:{'1h':'1 heure','3h':'3 heures',half:'une demi-journée',full:'une journée'},
  greet:(g,t)=>`Bonjour ! Comme ${g}, j'ai préparé quelques options proches pour toi.`,
  plan:'Ton programme du jour est prêt. Touche un lieu pour voir les détails.',
  pl:(m,walk,fam)=>`${m} minutes ${walk?'à pied':'en voiture'} depuis ton hôtel.${fam?' Convient aux familles.':''} Touche le bouton vert pour l'itinéraire.`,
  r:{plan3:'Voici un petit parcours : une visite, un café, puis le déjeuner.',kids:'J\'ai choisi des restaurants adaptés aux enfants, proches de ton hôtel.',gifts:'Avec 200 riyals, ces boutiques conviennent bien. Les dattes et les parfums légers font toujours de beaux cadeaux.',homefood:'Voici des endroits proches de tes goûts et de la cuisine de ton pays.',madani:'Goûte la cuisine de Médine. Ces adresses proposent du mutabbaq, du hunayni et du foul madani.',coffee:'Voici les meilleurs endroits pour un café et une pause près de toi.',health:'Voici les services de santé les plus proches. En cas d\'urgence, appelle le 997.',sights:'Les meilleurs lieux à visiter selon ton temps et tes envies :',def:'Je peux t\'aider pour manger, boire un café, faire du shopping, visiter et trouver des services. Essaie un des boutons ci-dessous.'},
  sugg:['Je veux me promener, où aller ?','Trouve un restaurant proche pour les enfants','Cherche des cadeaux, budget 200 riyals','Je veux la cuisine de mon pays','Je veux goûter la cuisine de Médine']},
 uk:{
  q:['Is this your first time visiting Madinah?','Who is travelling with you?','What do you like most? You can pick more than one.','What\'s your budget today?','How much time do you have?'],
  o:{first:{yes:'Yes',no:'No'},group:{solo:'On my own',family:'Family',kids:'Children',elder:'Elderly',friends:'Friends'},
   interests:{hist:'Historic places',food:'Restaurants',coffee:'Coffee',shop:'Shopping',local:'Local experiences',museum:'Museums',family:'Family spots',gifts:'Gifts',homefood:'Food from home'},
   budget:{eco:'Budget',mid:'Medium',open:'Open'},time:{'1h':'1 hour','3h':'3 hours',half:'Half a day',full:'Full day'}},
  done:'Lovely, I\'ve got a feel for you. Let me arrange Madinah your way.',help:'What would you like to do? I\'ll arrange it.',next:'Continue',
  listen:'I\'m listening…',nohear:'I didn\'t catch that. Please tap a button on screen.',tap:'Tap and speak',repeat:'Repeat',typeInstead:'Type instead',
  grp:{solo:'you\'re on your own',family:'you\'re with family',kids:'you\'re with children',elder:'you\'re with elderly relatives',friends:'you\'re with friends'},
  tm:{'1h':'1 hour','3h':'3 hours',half:'half a day',full:'a full day'},
  greet:(g,t)=>`Hello! Since ${g}, I've lined up a few options nearby.`,
  plan:'Your plan for the day is ready. Tap any place to see the details.',
  pl:(m,walk,fam)=>`${m} minutes ${walk?'on foot':'by car'} from your hotel.${fam?' Suitable for families.':''} Tap the green button for directions.`,
  r:{plan3:'A short route: a visit, a coffee, then lunch.',kids:'I\'ve picked child-friendly restaurants close to your hotel.',gifts:'On a 200 riyal budget, these shops suit you. Dates and light perfumes always make lovely gifts.',homefood:'Here are places close to your taste and the food of your home country.',madani:'Try Madinah cooking. These places serve mutabbaq, hunaini and Madani foul.',coffee:'Here are the best spots for coffee and a rest near you.',health:'Here are the nearest health services. In an emergency, call 997.',sights:'The best places to visit for your time and interests:',def:'I can help with food, coffee, shopping, sights and services. Try one of the buttons below.'},
  sugg:['I want to explore, where should I go?','Find a nearby restaurant for children','Find gifts, budget 200 riyals','I want food from my country','I want to try Madinah food']},
 ar:null
};
/* The Arabic guide speaks the same Arabic used on screen */
(function(){
  const o={}; QS.forEach(q=>{o[q.k]=Object.fromEntries(q.o);});
  LOC.ar={q:QS.map(q=>q.q),o,done:'تمام، عرفت جوّك. خليني أرتب لك المدينة بطريقتك.',help:'وش ودك تسوي؟ أنا أرتبها لك.',next:'تم',listen:'أسمعك…',nohear:'ما سمعتك زين. اضغط على زر كبير بالشاشة.',tap:'اضغط وتكلم',repeat:'أعد',typeInstead:'اكتب بدل ذلك',
   grp:{solo:'لوحدك',family:'مع العائلة',kids:'مع الأطفال',elder:'مع كبار السن',friends:'مع الأصدقاء'},tm:{'1h':'ساعة','3h':'٣ ساعات',half:'نصف يوم',full:'يوم كامل'},
   greet:(g,t)=>`بما إنك ${g}، رتبت لك كم خيار قريب يناسبك.`,
   plan:'خطتك اليوم جاهزة. اضغط على أي مكان لتشوف التفاصيل.',
   pl:(m,walk,fam)=>`${m} دقائق ${walk?'مشيًا':'بالسيارة'} من فندقك.${fam?' يناسب العائلات.':''} اضغط الزر الأخضر عشان أوريك الطريق.`,
   r:{plan3:'هذا مسار قصير: زيارة، ثم قهوة، ثم غداء.',kids:'اخترت لك مطاعم تناسب الأطفال وقريبة من فندقك.',gifts:'ضمن ميزانية ٢٠٠ ريال أنصحك بهذي المتاجر. التمور والعطور الخفيفة هدايا مضمونة.',homefood:'لقيت لك أماكن قريبة من ذوقك ومن أكل بلدك.',madani:'جرّب الأكل المدني. هذي أنسب الأماكن، وكلها تقدم مطبق وحنيني وفول مدني.',coffee:'هذي أنسب الأماكن للقهوة والاستراحة قريبًا منك.',health:'هذي أقرب الخدمات الصحية لك. وفي الطوارئ اتصل بـ ٩٩٧.',sights:'أنسب الأماكن للزيارة حسب وقتك واهتمامك:',def:'أقدر أساعدك في الأكل والقهوة والتسوق والأماكن والخدمات. جرّب أحد الأزرار تحت.'},
   sugg:['أبغى أتمشى، وين أروح؟','أبغى مطعم قريب يناسب الأطفال','أبغى هدايا بميزانية ٢٠٠ ريال','أبغى أكل من بلدي','أبغى أجرب أكل مديني']};
})();
/* Arabic subtitles shown under the guide's own language */
const AR_R={plan3:LOC.ar.r.plan3,kids:LOC.ar.r.kids,gifts:LOC.ar.r.gifts,homefood:LOC.ar.r.homefood,madani:LOC.ar.r.madani,coffee:LOC.ar.r.coffee,health:LOC.ar.r.health,sights:LOC.ar.r.sights,def:LOC.ar.r.def};
const AR_Q=LOC.ar.q, AR_SUGG=LOC.ar.sugg, AR_HELP=LOC.ar.help, AR_DONE=LOC.ar.done;
const INTENTS=[
 ['homefood',/منسف|بلدي|مشتاق|ناسي|كباب|اشتقت|اشتاق|مخبز|فطور|negara|memleket|mon pays|my country|home country|food from home/i],
 ['madani',/مدين|حجاز|محلي|شعبي|تجرب|makanan madinah|masakan madinah|medine yemeği|medine mutfağı|cuisine de m[ée]dine|madinah food|madinah cooking/i],
 ['kids',/اطفال|أطفال|عائل|عيال|anak|çocuk|enfant|child|kids/i],
 ['gifts',/هدايا|هدية|هديه|ميزانيت|٢٠٠|200|تسوق|اشتري|أشتري|oleh|hadiah|hediye|cadeau|gift|belanja|shopping/i],
 ['coffee',/قهوة|شاي|كافيه|مقهى|kopi|kahve|café|cafe|coffee|\btea\b/i],
 ['health',/صيدلي|دواء|مستشفى|طوارئ|صحي|apotek|rumah sakit|eczane|hastane|pharmacie|hôpital|pharmacy|hospital|doctor|dokter|doktor/i],
 ['plan3',/ساعات|ساعة|وقت|اسوي|أسوي|فاضي|موعد|3 jam|3 saat|3 heures|3 hours|waktu|vakit|temps/i],
 ['sights',/مكان|زيار|تاريخ|معلم|اروح|أروح|tempat|gezil|visiter|sight|lieu|historic/i]
];
const PRAY=[['الفجر',298],['الظهر',726],['العصر',912],['المغرب',1078],['العشاء',1168]];
const PN=[{id:'Subuh',tr:'sabah namazı',fr:'la prière du Fajr',uk:'Fajr',ar:'الفجر'},{id:'Zuhur',tr:'öğle namazı',fr:'la prière du Dhuhr',uk:'Dhuhr',ar:'الظهر'},{id:'Ashar',tr:'ikindi namazı',fr:"la prière de l'Asr",uk:'Asr',ar:'العصر'},{id:'Maghrib',tr:'akşam namazı',fr:'la prière du Maghrib',uk:'Maghrib',ar:'المغرب'},{id:'Isya',tr:'yatsı namazı',fr:"la prière de l'Isha",uk:'Isha',ar:'العشاء'}];
Object.assign(LOC.id,{pray:(n,m)=>`Waktu ${n} tinggal ${m} menit lagi. Aku atur kopi dekat masjid supaya kamu tiba sebelum azan.`,lost:'Tenang, aku bersamamu. Tunjukkan layar ini ke sopir taksi, atau ikuti aku ke titik kumpul terdekat.',qibla:'Kiblat ada di arah selatan, sedikit ke barat.',soc:p=>`${p} persen pengunjung Indonesia suka tempat ini.`});
Object.assign(LOC.tr,{pray:(n,m)=>`${n[0].toUpperCase()+n.slice(1)} vaktine ${m} dakika var. Ezandan önce varasın diye camiye yakın bir kahve ayarladım.`,lost:'Merak etme, yanındayım. Bu ekranı taksi şoförüne göster ya da beni en yakın buluşma noktasına kadar takip et.',qibla:'Kıble güney yönünde, biraz batıya doğru.',soc:p=>`Türk ziyaretçilerin yüzde ${p}'i burayı beğendi.`});
Object.assign(LOC.fr,{pray:(n,m)=>`Il reste ${m} minutes avant ${n}. J'ai prévu un café près de la mosquée pour que tu arrives avant l'appel à la prière.`,lost:"Ne t'inquiète pas, je suis avec toi. Montre cet écran au chauffeur de taxi, ou suis-moi jusqu'au point de rendez-vous le plus proche.",qibla:'La qibla est vers le sud, légèrement vers l\'ouest.',soc:p=>`${p} % des visiteurs français ont aimé ce lieu.`});
Object.assign(LOC.uk,{pray:(n,m)=>`${n} is in ${m} minutes. I've lined up a coffee near the mosque so you arrive before the adhan.`,lost:"Don't worry, I'm with you. Show this screen to a taxi driver, or follow me to the nearest meeting point.",qibla:'The qibla is towards the south, slightly west.',soc:p=>`${p}% of British visitors liked this place.`});
Object.assign(LOC.ar,{pray:(n,m)=>`${n} بعد ${m} دقيقة. رتبت لك قهوة قريبة من المسجد وتوصل قبل الأذان.`,lost:'لا تخاف، أنا معك. أعطِ هالشاشة لسواق التاكسي، أو تعال معي لأقرب نقطة تجمع.',qibla:'القبلة جهة الجنوب مائلة قليلًا للغرب.',soc:p=>`${p}٪ من الزوار العرب أعجبهم هذا المكان.`});
PN.forEach(o=>{o.eg=o.ar;});
LOC.eg=Object.assign({},LOC.ar,{
 q:['أول مرة تزور المدينة؟','مين معاك في الرحلة؟','بتحب إيه أكتر؟ تقدر تختار أكتر من حاجة.','ميزانيتك النهاردة كام؟','معاك وقت قد إيه؟'],
 done:'تمام، فهمتك. هرتّب لك المدينة على مزاجك.',help:'عايز تعمل إيه؟ أنا أظبطها لك.',next:'تمام',
 listen:'بسمعك…',nohear:'ما سمعتكش كويس. دوس على زرار كبير في الشاشة.',tap:'دوس وتكلم',repeat:'أعد',typeInstead:'اكتب بدل كده',
 grp:{solo:'لوحدك',family:'مع العيلة',kids:'مع الأطفال',elder:'مع كبار السن',friends:'مع الصحاب'},tm:{'1h':'ساعة','3h':'٣ ساعات',half:'نص يوم',full:'يوم كامل'},
 greet:(g,t)=>`بما إنك ${g}، رتبت لك كام اختيار قريب يناسبك.`,
 plan:'خطتك النهاردة جاهزة. دوس على أي مكان تشوف تفاصيله.',
 pl:(m,walk,fam)=>`${m} دقايق ${walk?'مشي':'بالسيارة'} من فندقك.${fam?' مناسب للعيلة.':''} دوس على الزرار الأخضر عشان أوريك الطريق.`,
 r:{plan3:'ده مسار قصير: زيارة، وبعدها قهوة، وبعدها غدا.',kids:'اخترت لك مطاعم مناسبة للأطفال وقريبة من فندقك.',gifts:'بميزانية ٢٠٠ ريال أنصحك بالمحلات دي. التمر والعطور الخفيفة هدايا مضمونة.',homefood:'لقيت لك أماكن قريبة من ذوقك ومن أكل بلدك.',madani:'جرّب الأكل المدني. دي أنسب الأماكن، وكلها بتقدم مطبق وحنيني وفول مدني.',coffee:'دي أنسب الأماكن للقهوة والراحة قريب منك.',health:'دي أقرب الخدمات الصحية ليك. وفي الطوارئ اتصل بـ٩٩٧.',sights:'أنسب الأماكن للزيارة على حسب وقتك واهتمامك:',def:'أقدر أساعدك في الأكل والقهوة والتسوق والأماكن والخدمات. جرّب واحد من الأزرار تحت.'},
 sugg:['عايز أتمشى، أروح فين؟','عايز مطعم قريب مناسب للأطفال','عايز هدايا بميزانية ٢٠٠ ريال','عايز أكل من بلدي','عايز أجرب أكل مدني'],
 pray:(n,m)=>`${n} بعد ${m} دقيقة. رتبت لك قهوة قريبة من المسجد وهتوصل قبل الأذان.`,
 lost:'متقلقش، أنا معاك. وري الشاشة دي لسواق التاكسي، أو تعالى معايا لأقرب نقطة تجمع.',
 qibla:'القبلة ناحية الجنوب، وماليّة شوية للغرب.',
 soc:p=>`${p}٪ من الزوار المصريين عجبهم المكان ده.`
});
function nextPrayer(t){ for(let i=0;i<5;i++) if(PRAY[i][1]>t) return {i,name:PRAY[i][0],at:PRAY[i][1],in:PRAY[i][1]-t}; return {i:0,name:PRAY[0][0],at:PRAY[0][1]+1440,in:PRAY[0][1]+1440-t}; }
function durTxt(m){ m=Math.round(m); const ar=IS_AR(); const mn=n=>ar?`${AR(n)} دقيقة`:T('{0} دقيقة',n); if(m<60) return mn(m); const h=Math.floor(m/60),r=m%60; const hs=ar?(h===1?'ساعة':h===2?'ساعتين':`${AR(h)} ساعات`):T('{0} ساعة',h); return r?T('{0} و{1}',hs,mn(r)):hs; }
const AR_LOST=LOC.ar.lost;
const intentOf=q=>{const t=q.replace(/[ً-ْ]/g,''); const f=INTENTS.find(i=>i[1].test(t)); return f?f[0]:'def';};

