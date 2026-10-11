/* ================= «Из ларька в магнаты: бизнес» — портреты друзей из 11 «Б» и знакомых (стиль Г: плоско, без контуров и румянца) =================
   window.friendSvg(id, mood, o) → строка SVG 64×64 (круг). Тот же рисунок, что у Людмилы Санны (UI.face): лицо, плечи, приметы.
   id: owl — Соня Совина (каре, тонкие очки, как у мамы), beav — Борис Бобров (короткая стрижка, спортивная куртка; o.suit — пиджак без галстука),
       bars — Пётр Барсуков (борода; o.hat — каска), vit — Витя Козлов (кепка, широкая улыбка), bear — Михаил Топтыгин (седой, тёмный костюм),
       elv — Эльвира Маратовна (банк), mih — Михалыч (мастер), lud — Людмила Санна (берём UI.face).
   mood: calm | happy | worry | strict | wow — брови и рот. Экспорт: window.friendSvg и UI.friend (когда ui.js загружен). */
(function(root){
'use strict';
let N=0;
const COL={owl:'#5b4b8a',beav:'#2e7d5b',bars:'#8e6b3a',vit:'#e07b39',bear:'#b03a2e',elv:'#1f5f99',mih:'#5a6675',lud:'#667085'};
const BG={owl:'#ecebf5',beav:'#e5f1ea',bars:'#f2ece3',vit:'#fcefe5',bear:'#f3e7e5',elv:'#e8eef8',mih:'#eceff2'};
const INK='#2b3445';
function brows(m,y,c){y=y||23;c=c||'#6b5a4e';const w=' stroke="'+c+'" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
  if(m==='worry')return '<path d="M23.6 '+(y+.6)+'l5.2-1.6M40.4 '+(y+.6)+'l-5.2-1.6"'+w;
  if(m==='strict')return '<path d="M23.6 '+(y-.2)+'l5.4 .9M40.4 '+(y-.2)+'l-5.4 .9"'+w;
  if(m==='wow')return '<path d="M23.6 '+(y-.8)+'q2.7-2.2 5.4-.4M35 '+(y-1.2)+'q2.7-1.8 5.4 .4"'+w;
  if(m==='happy')return '<path d="M23.6 '+y+'q2.7-1.7 5.4-.3M35 '+(y-.3)+'q2.7-1.4 5.4 .3"'+w;
  return '<path d="M23.8 '+(y+.2)+'q2.6-1 5.2-.2M35 '+y+'q2.6-.8 5.2 .2"'+w;}
function eyes(m){if(m==='happy')return '<path d="M25.9 29q1.2-1.3 2.4 0M35.7 29q1.2-1.3 2.4 0" stroke="'+INK+'" stroke-width="1.1" fill="none" stroke-linecap="round"/>';
  const r=m==='wow'?1.25:.95;return '<circle cx="27.1" cy="28.8" r="'+r+'" fill="'+INK+'"/><circle cx="36.9" cy="28.8" r="'+r+'" fill="'+INK+'"/>';}
function mouth(m,wide){const c='#a55a52';
  if(m==='wow')return '<ellipse cx="32" cy="35.6" rx="1.8" ry="2.2" fill="'+c+'"/>';
  if(wide&&(m==='happy'||m==='calm'))return m==='happy'?'<path d="M27.4 34.2q4.6 4.6 9.2 0z" fill="'+c+'"/><path d="M28.6 34.6h6.8" stroke="#fff" stroke-width=".9"/>':'<path d="M27.8 34.4q4.2 3 8.4 0" stroke="'+c+'" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
  const d=m==='happy'?'M28.4 34.8q3.6 2.8 7.2 0':m==='worry'?'M29 36q3-1.4 6 0':m==='strict'?'M29 35.4h6':'M29 35q3 1.3 6 0';
  return '<path d="'+d+'" stroke="'+c+'" stroke-width="1.3" fill="none" stroke-linecap="round"/>';}
// каркас: фон, плечи (одежда), шея, лицо; hairB — волосы за лицом, top — всё поверх лица (волосы, очки, шапки)
function frame(bg,body,neck,skin,hairB,top,m,o){const id='frc'+(++N);o=o||{};
  return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="'+id+'"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#'+id+')"><rect width="64" height="64" fill="'+bg+'"/>'
    +(hairB||'')+body+'<rect x="28.5" y="37" width="7" height="10" rx="3" fill="'+neck+'"/>'
    +'<ellipse cx="32" cy="28" rx="'+(o.rx||11)+'" ry="12.5" fill="'+skin+'"/>'
    +(o.under||'')+brows(m,o.by,o.bc)+eyes(m)+(o.noMouth?'':mouth(m,o.wide))+(top||'')+'</g></svg>';}
const SK='#ebc3a3',NK='#dcae8e';
const P={
  // Соня: каре до подбородка с чёлкой, тонкие очки, фиолетовая блузка с белым воротником
  owl(m){const h='#3a2e2c';
    return frame(BG.owl,'<path d="M8 66c1-14 11-20 24-20s23 6 24 20z" fill="'+COL.owl+'"/><path d="M26.5 46.5l5.5 5 5.5-5-2-1.4-3.5 3-3.5-3z" fill="#fff"/>',NK,SK,
      '<path d="M19.5 38.5V27c0-9 5.6-14 12.5-14s12.5 5 12.5 14v11.5h-4.6V27h-15.8v11.5z" fill="'+h+'"/>',
      '<path d="M20.6 27.5c.4-8.4 5.2-12.6 11.4-12.6 6.3 0 11 4.2 11.4 12.4-3-3.4-6.4-5.5-10.8-5.6-4.6-.1-8.8 2.2-12 5.8z" fill="'+h+'"/>'
      +'<rect x="23.7" y="26.3" width="7" height="4.8" rx="2.3" fill="none" stroke="'+COL.owl+'" stroke-width=".8"/><rect x="33.3" y="26.3" width="7" height="4.8" rx="2.3" fill="none" stroke="'+COL.owl+'" stroke-width=".8"/><path d="M30.7 28.2h2.6" stroke="'+COL.owl+'" stroke-width=".8"/>',m,{by:23.4,bc:h});},
  // Борис: короткая стрижка; спортивная куртка с молнией (o.suit — тёмный пиджак без галстука, белая рубашка)
  beav(m,o){const h='#5a3e28';o=o||{};
    const body=o.suit?'<path d="M8 66c1-14 11-20 24-20s23 6 24 20z" fill="#353c4a"/><path d="M27 46l5 8 5-8z" fill="#fff"/><path d="M25.5 45.5l6.5 9-3.6 1.6-5-8.6zM38.5 45.5l-6.5 9 3.6 1.6 5-8.6z" fill="#262c38"/>'
      :'<path d="M8 66c1-14 11-20 24-20s23 6 24 20z" fill="'+COL.beav+'"/><path d="M26 46.2q6 3.6 12 0l-1.2-2.4q-4.8 2.4-9.6 0z" fill="#236449"/><path d="M32 49v17" stroke="#e9f3ee" stroke-width="1.2"/><path d="M13 58l6-5M51 58l-6-5" stroke="#e9f3ee" stroke-width="1.6" stroke-linecap="round"/>';
    return frame(BG.beav,body,NK,SK,'',
      '<path d="M20.8 26.5c-.6-8.6 4.6-12.2 11.2-12.2s11.8 3.6 11.2 12.2c-1.6-3.6-3.2-5.2-5-5.8-1.8 1-4.2 1.4-6.4 1.2-2.4-.2-4.8-.8-6.6-1.6-1.8 1-3.2 3-4.4 6.2z" fill="'+h+'"/>',m,{by:22.8,bc:h});},
  // Пётр: борода и усы; o.hat — рабочая каска
  bars(m,o){const h='#6e5236';o=o||{};
    const beard='<path d="M21.2 29.5c.2 7.6 4.6 11.4 10.8 11.4s10.6-3.8 10.8-11.4c-1.4 3.2-2.6 4.6-4.4 5.2-1.6-1.6-4-2.2-6.4-2.2s-4.8.6-6.4 2.2c-1.8-.6-3-2-4.4-5.2z" fill="'+h+'"/>'
      +'<path d="M28.2 34.2q3.8-1.8 7.6 0" stroke="'+h+'" stroke-width="2" fill="none" stroke-linecap="round"/>';
    const hair=o.hat?'<path d="M18.6 23.4c0-7.8 5.8-12.6 13.4-12.6s13.4 4.8 13.4 12.6z" fill="#f0b43c"/><path d="M16 23.2h32v2.6H16z" fill="#d99b26"/><path d="M30.6 11.2h2.8v11.6h-2.8z" fill="#d99b26"/>'
      :'<path d="M21 26c-.4-8 4.8-12 11-12s11.4 4 11 12c-2-4-5.2-6-11-6s-9 2-11 6z" fill="'+h+'"/>';
    return frame(BG.bars,'<path d="M8 66c1-14 11-20 24-20s23 6 24 20z" fill="'+COL.bars+'"/><path d="M26 46.4q6 2.6 12 0l-1-2q-5 1.8-10 0z" fill="#75572e"/>',NK,'#e8bd9a','',
      beard+hair,m,{by:23.2,bc:h,noMouth:false,under:''});},
  // Витя: кепка козырьком вперёд, широкая улыбка, оранжевая толстовка
  vit(m){const c='#c8622a';
    return frame(BG.vit,'<path d="M8 66c1-14 11-20 24-20s23 6 24 20z" fill="'+COL.vit+'"/><path d="M26.5 46.5q5.5 4 11 0" stroke="#fff" stroke-width="1.4" fill="none"/><path d="M29.5 49v6M34.5 49v6" stroke="#fff" stroke-width="1" stroke-linecap="round"/>',NK,SK,'',
      '<path d="M20.4 24.6c0-7.6 5-11.6 11.6-11.6s11.6 4 11.6 11.6z" fill="'+c+'"/><path d="M20 23.6h28.6q.4 2.4-2 2.6H20z" fill="#a84f20"/><circle cx="32" cy="13.4" r="1.4" fill="#a84f20"/>'
      +'<path d="M20.6 25.8c-.2 1.6 0 3 .6 4.2M43.4 25.8c.2 1.6 0 3-.6 4.2" stroke="#5a3e28" stroke-width="1.6" stroke-linecap="round"/>',m,{by:23.8,bc:'#5a3e28',wide:true});},
  // Топтыгин: седой, зачёсан назад, тёмный костюм, белая рубашка, красный галстук
  bear(m){const h='#b9bfc8';
    return frame(BG.bear,'<path d="M7 66c1-15 11-21 25-21s24 6 25 21z" fill="#222834"/><path d="M26.6 45.4l5.4 9 5.4-9z" fill="#fff"/><path d="M31 47.6h2l1 9.6-2 2-2-2z" fill="'+COL.bear+'"/><path d="M25 45l6 11-3.6 1.4-5.2-9.4zM39 45l-6 11 3.6 1.4 5.2-9.4z" fill="#171c26"/>',NK,SK,'',
      '<path d="M20.6 27c-1-9.4 4.2-13.4 11.4-13.4S44.4 17.6 43.4 27c-1-3.6-2.4-6-4.6-7.2-2 .6-4.4.9-6.8.9s-4.8-.3-6.8-.9c-2.2 1.2-3.6 3.6-4.6 7.2z" fill="'+h+'"/><path d="M26 17.6q6-2.4 12 0" stroke="#d6dae0" stroke-width="1" fill="none"/>',m,{by:22.6,bc:'#8e949e',rx:11.6});},
  // Эльвира Маратовна: тёмные волосы в низкий пучок, серьги, синий жакет
  elv(m){const h='#26211f';
    return frame(BG.elv,'<path d="M8 66c1-14 11-20 24-20s23 6 24 20z" fill="#1f4e8c"/><path d="M27 46l5 6 5-6-1.6-1-3.4 3.6-3.4-3.6z" fill="#fff"/>',NK,SK,'<circle cx="32" cy="41" r="0" fill="none"/>',
      '<path d="M20.8 27c-.8-8.6 4.4-13 11.2-13s12 4.4 11.2 13c-2.6-4.8-6.6-7-11.2-7s-8.6 2.2-11.2 7z" fill="'+h+'"/><path d="M31.6 14.2q-6 4-10.4 9.6" stroke="#3a3330" stroke-width="1" fill="none"/>'
      +'<circle cx="20.9" cy="33" r="1.3" fill="#e7c36a"/><circle cx="43.1" cy="33" r="1.3" fill="#e7c36a"/>',m,{by:23.2,bc:h});},
  // Михалыч: залысины, седые усы, синий рабочий комбинезон
  mih(m){const h='#a9adb3';
    return frame(BG.mih,'<path d="M8 66c1-14 11-20 24-20s23 6 24 20z" fill="#3d5a80"/><path d="M25 50h14v16H25z" fill="#34506f"/><path d="M26.5 46.2q5.5 2.6 11 0" stroke="#a9b8cc" stroke-width="1.2" fill="none"/>',NK,'#e6b996','',
      '<path d="M20.8 29c-1-6 .4-9.4 2.6-11 .4 3 1.2 4.4 2.4 5M43.2 29c1-6-.4-9.4-2.6-11-.4 3-1.2 4.4-2.4 5" fill="'+h+'"/><path d="M27 33.6q5-2.6 10 0-1 1.6-5 1.2-4 .4-5-1.2z" fill="'+h+'"/>',m,{by:22.8,bc:'#8a8f96'});}
};
function friendSvg(id,mood,o){const m=mood||'calm';
  if(id==='lud'||id==='you'){try{if(root.UI&&root.UI.face)return root.UI.face(m);}catch(e){}if(root.advisorSvg)return root.advisorSvg(m);}
  const f=P[id];if(!f)return '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#e9edf5"/></svg>';return f(m,o||{});}
root.friendSvg=friendSvg;root.FRIEND_COL=COL;
function attach(){if(root.UI&&!root.UI.friend)root.UI.friend=friendSvg;}
attach();if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',attach);setTimeout(attach,0);
})(typeof window!=='undefined'?window:this);
