/* ============ Data ============ */
const BRAND = 'حولك';
const ICON = {
  home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  pin:'<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  food:'<path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10"/>',
  coffee:'<path d="M5 8h11v6a5 5 0 01-5 5h-1a5 5 0 01-5-5zM16 9h2a2 2 0 010 4h-2M8 3v2M12 3v2"/>',
  bag:'<path d="M6 8h12l1 12H5zM9 8V6a3 3 0 016 0v2"/>',
  gift:'<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M4 13h16M12 9v11M12 9S9 9 9 6.5 12 5 12 9zM12 9s3 0 3-2.5S12 5 12 9z"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  plus:'<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/>',
  sos:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
  send:'<path d="M4 12l16-8-6 16-3-7z"/>',
  back:'<path d="M9 6l6 6-6 6"/>',
  fwd:'<path d="M15 6l-6 6 6 6"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
  share:'<path d="M4 12v7h16v-7M12 3v12M8 7l4-4 4 4"/>',
  bell:'<path d="M6 17v-6a6 6 0 0112 0v6l2 2H4zM10 21h4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  walk:'<circle cx="13" cy="4.5" r="1.8"/><path d="M11 21l2-6-3-3 1-5 3 2 3 1M9 12l-3 1"/>',
  car:'<path d="M5 16v-4l2-5h10l2 5v4zM7 16v2M17 16v2M5 12h14"/>',
  access:'<circle cx="12" cy="4" r="2"/><path d="M5 8h14M12 8v6l-3 6M12 14l3 6"/>',
  search:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>',
  check:'<path d="M5 12l5 5 9-10"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
  museum:'<path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
  dome:'<path d="M4 20v-6a8 8 0 0116 0v6M12 4V2M2 20h20"/>',
  speaker:'<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
  textsz:'<path d="M3 19l5-14 5 14M5 14h6M15 19l3-8 3 8M16 17h4"/>',
  wc:'<circle cx="8" cy="5" r="2"/><circle cx="16" cy="5" r="2"/><path d="M8 8v6M5 9v6h6V9M16 8v12M13 20h6"/>',
  park:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 16V8h3a2.5 2.5 0 010 5h-3"/>',
  bus:'<rect x="5" y="4" width="14" height="14" rx="3"/><path d="M5 12h14M8 18v2M16 18v2"/>',
  atm:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  baby:'<circle cx="12" cy="9" r="5"/><path d="M9 20c1-2 5-2 6 0M10.5 9h.01M13.5 9h.01"/>',
  map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
  play:'<path d="M8 5l11 7-11 7z"/>',
  gate:'<path d="M5 21V10a7 7 0 0114 0v11M9 21v-7a3 3 0 016 0v7M3 21h18"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
};
const ico=(n,cls='')=>`<svg class="ico ${cls}${n==='back'||n==='fwd'?' dirflip':''}" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]||''}</svg>`;

const CAT = {
  sight:{n:'أماكن أثرية',col:'--c-sight',ic:'dome'}, food:{n:'مطاعم',col:'--c-food',ic:'food'},
  cafe:{n:'قهوة',col:'--c-cafe',ic:'coffee'}, shop:{n:'تسوق',col:'--c-shop',ic:'bag'},
  exp:{n:'تجارب',col:'--c-exp',ic:'star'}, svc:{n:'خدمات',col:'--c-svc',ic:'plus'}
};
const SUB = {pharm:['صيدلية','plus'],health:['مركز صحي','plus'],atm:['صراف','atm'],wc:['دورات مياه','wc'],park:['مواقف','park'],transit:['نقل','bus'],kids:['الأطفال','baby'],access:['إمكانية الوصول','access'],meet:['نقطة تجمع','pin'],gate:['بوابات','dome']};
const INTERESTS = [
  ['hist','أماكن أثرية'],['local','تجارب'],['food','مطاعم'],['coffee','قهوة']
];
const IMAP = Object.fromEntries(INTERESTS);

