/* ============ Avatars ============ */
/* أودين صورة ثابتة (بدون حركة إطارات). الشخصيات الأخرى لها حركة sprite عند تفعيلها. */
const STILL={id:'assets/characters/odin_full.png'};
const BGC={eg:'#CFDDEB',tr:'#BFE0DC',fr:'#C9D6EC',uk:'#D5DEBC',ar:'#CFE0D6'};
const FIG={
 tr:{skin:'#E6B691',hair:'#3A2418',top:'#2E7D7A',inner:'#F4EBDD',pants:'#3B3F55',shoe:'#EDE6D6',kind:'long'},
 fr:{skin:'#F1CDB0',hair:'#7A4A2B',top:'#223A5E',inner:'#FFFFFF',pants:'#CDB89A',shoe:'#8A5A33',kind:'bob'},
 uk:{skin:'#F0C9AE',hair:'#B07A45',top:'#5B6B3A',inner:'#EFE8D6',pants:'#2F3B52',shoe:'#6B4A2B',kind:'short'},
 eg:{skin:'#C58E62',hair:'#1A1410',top:'#3E6FA8',inner:'#F2F2F2',pants:'#2F3238',shoe:'#5A4632',kind:'short'},
 ar:{skin:'#D9A47E',hair:'#F3EBDD',top:'#1F5B44',inner:'#F3EBDD',pants:'',shoe:'#3A2A1E',kind:'robe'}
};
/* Full-body flat illustration. mode "head" crops the same drawing to the face, so the avatar and the full figure are one character. */
function figSvg(id,mode){
  const f=FIG[id],full=mode==='full',robe=f.kind==='robe';
  let s=`<svg viewBox="${full?'0 0 200 400':'48 14 104 104'}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${GUIDES[id].name}">`;
  if(!full) s+=`<rect x="40" y="0" width="120" height="130" fill="${BGC[id]}"/>`; else s+=`<ellipse cx="100" cy="385" rx="56" ry="8" fill="rgba(0,0,0,.16)"/>`;
  if(f.kind==='long') s+=`<g class="f-head"><path d="M71 64C66 24 134 24 129 64L137 130 63 130Z" fill="${f.hair}"/></g>`;
  if(f.kind==='bob') s+=`<g class="f-head"><path d="M71 64C66 26 134 26 129 64L131 96Q100 106 69 96Z" fill="${f.hair}"/></g>`;
  if(robe) s+=`<g class="f-head"><path d="M62 66C58 24 142 24 138 66L150 138 50 138Z" fill="${f.hair}" stroke="#B8903A" stroke-width="2.5"/></g>`;
  if(robe){
    s+=`<path d="M56 112Q100 96 144 112L162 372H38Z" fill="${f.top}"/><path d="M38 372H162" stroke="#B8903A" stroke-width="5"/><path d="M100 124V372" stroke="rgba(0,0,0,.16)" stroke-width="2"/>`;
    s+=`<g class="f-armL"><path d="M56 112L38 214 54 220 70 130Z" fill="${f.top}"/><circle cx="46" cy="224" r="8" fill="${f.skin}"/></g><g class="f-armR"><path d="M144 112L162 214 146 220 130 130Z" fill="${f.top}"/><circle cx="154" cy="224" r="8" fill="${f.skin}"/></g>`;
    s+=`<path d="M50 332H150" stroke="#B8903A" stroke-width="2" stroke-dasharray="4 6" opacity=".6"/>`;
    s+=`<path d="M64 100Q100 126 136 100L142 140Q100 154 58 140Z" fill="${f.hair}" stroke="#B8903A" stroke-width="2"/>`;
    s+=`<path d="M70 372Q100 380 130 372" stroke="${f.shoe}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  } else {
    s+=`<path d="M68 200H100V360H72Z" fill="${f.pants}"/><path d="M100 200H132L128 360H100Z" fill="${f.pants}"/>`;
    s+=`<path d="M100 214V362" stroke="rgba(0,0,0,.28)" stroke-width="2"/><path d="M62 360H98V374Q62 380 58 372Z" fill="${f.shoe}" stroke="#555" stroke-width="1.5"/><path d="M102 360H138L142 372Q104 380 102 374Z" fill="${f.shoe}" stroke="#555" stroke-width="1.5"/>`;
    s+=`<path d="M56 112Q100 96 144 112L152 212H48Z" fill="${f.top}"/><path d="M86 104L100 134 114 104V212H86Z" fill="${f.inner}"/>`;
    if(id==='uk') s+=`<path d="M70 108V204M130 108V204" stroke="#3B3B2B" stroke-width="6" opacity=".7"/>`;
    if(id==='fr') s+=`<path d="M52 196H148" stroke="#8A5A33" stroke-width="5"/>`;
    s+=`<g class="f-armL"><path d="M56 112L36 206 52 212 68 128Z" fill="${f.top}"/><circle cx="44" cy="216" r="8" fill="${f.skin}"/></g><g class="f-armR"><path d="M144 112L164 206 148 212 132 128Z" fill="${f.top}"/><circle cx="156" cy="216" r="8" fill="${f.skin}"/></g>`;
  }
  s+=`<rect x="91" y="86" width="18" height="24" rx="7" fill="${f.skin}"/><g class="f-head"><ellipse cx="100" cy="62" rx="23" ry="28" fill="${f.skin}"/>`;
  if(f.kind==='long'||f.kind==='bob') s+=`<path d="M77 56C80 32 120 32 123 56C112 46 90 46 77 56Z" fill="${f.hair}"/>`;
  if(f.kind==='short') s+=`<path d="M77 54C80 30 120 30 123 54C112 44 90 44 77 54Z" fill="${f.hair}"/>`;
  if(robe) s+=`<path d="M75 56C76 30 124 30 125 56C114 44 86 44 75 56Z" fill="${f.hair}" stroke="#B8903A" stroke-width="2"/>`;
  s+=`<g class="f-eyes"><circle cx="91" cy="61" r="2.3" fill="#1B2A22"/><circle cx="109" cy="61" r="2.3" fill="#1B2A22"/></g>`;
  s+=`<path d="M85 54Q91 51 96 54M104 54Q109 51 115 54" stroke="${robe?'#6B4A2B':f.hair}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  s+=`<path d="M100 63Q98 69 101 70" stroke="rgba(0,0,0,.25)" stroke-width="1.5" fill="none"/><circle cx="84" cy="70" r="4" fill="#E58C7A" opacity=".25"/><circle cx="116" cy="70" r="4" fill="#E58C7A" opacity=".25"/>`;
  if(id==='eg') s+=`<path d="M92 70Q100 66 108 70Q100 73.5 92 70Z" fill="${f.hair}"/>`;
  s+=`<path class="smile" d="M92 74Q100 81 108 74" stroke="#8A3B2B" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse class="mouth" cx="100" cy="76" rx="5.5" ry="4" fill="#7A2B2B"/>`;
  return s+'</g></svg>';
}
const SPR={"tr": {"w": 192, "h": 368, "cols": 8, "rows": 6, "n": 48, "fps": 16, "idle": 47}, "eg": {"w": 164, "h": 368, "cols": 8, "rows": 6, "n": 48, "fps": 12, "idle": 18}};
const HEAD={id:'assets/characters/odin_head.jpg',tr:'assets/characters/umut_head.jpg',eg:'assets/characters/nile_head.jpg'};
const sprPos=(id,f)=>{ const c=SPR[id]; const col=f%c.cols,row=Math.floor(f/c.cols); return `${c.cols>1?(col*100/(c.cols-1)).toFixed(3):0}% ${c.rows>1?(row*100/(c.rows-1)).toFixed(3):0}%`; };
function sprSet(el,f){ el.style.backgroundPosition=sprPos(el.dataset.sp,f); }
function sprWave(){ document.querySelectorAll('.fig.spr').forEach(el=>{ const c=SPR[el.dataset.sp]; if(!c) return; if(el._t) clearInterval(el._t); let f=0; sprSet(el,0); el._t=setInterval(()=>{ f++; if(f>=c.n){ clearInterval(el._t); el._t=null; sprSet(el,c.idle); return; } sprSet(el,f); },1000/c.fps); }); }
function figure(id,h,cls=''){
  if(STILL[id]) return `<span class="fig still ${cls}" role="img" aria-label="${GUIDES[id].name}" style="height:${h}px"><img src="${STILL[id]}" alt=""></span>`;
  const c=SPR[id]; if(!c) return `<span class="fig ${cls}" style="height:${h}px">${figSvg(id,'full')}</span>`;
  const w=Math.round(h*c.w/c.h);
  return `<span class="fig spr spr-${id} ${cls}" data-sp="${id}" role="img" aria-label="${GUIDES[id].name}" style="height:${h}px;width:${w}px;background-size:${c.cols*100}% ${c.rows*100}%;background-position:${sprPos(id,c.idle)}"></span>`;
}
function avatar(id,size=48,cls=''){
  const g=GUIDES[id];
  if(HEAD[id]) return `<span class="av ${cls}" style="width:${size}px;height:${size}px"><img src="${HEAD[id]}" alt="${g.name}"></span>`;
  return `<span class="av ${cls}" style="width:${size}px;height:${size}px">${figSvg(id,'head')}</span>`;
}

