/* ================= «Из ларька в магнаты: бизнес» — портрет главбуха Людмилы Санны (SVG) =================
   window.advisorSvg(mood) → строка SVG 100×100 (прозрачный фон, вписывается в круг).
   mood: 'calm' (по умолчанию), 'happy' (улыбка), 'worry' (тревога: брови домиком), 'strict' (строго), 'wow' (удивление).
   Строгая добрая дама: пучок, очки в золотой оправе, тёмный жакет с белым воротником и брошью. Используется и в promo.html. */
(function(root){
'use strict';
function advisorSvg(mood){
  const m=mood||'calm';
  const skin='#f2c9a5',skinSh='#e2ae88',hair='#8a5a3b',hairD='#6b4228',hairL='#a8734f',jacket='#3d4f6b',jacketD='#2c3a51',gold='#c9a13a';
  // брови: [левая, правая] — пути
  const brow={
    calm:['M31 38 Q38 35 45 37','M55 37 Q62 35 69 38'],
    happy:['M31 37 Q38 33 45 36','M55 36 Q62 33 69 37'],
    worry:['M31 37 Q38 37 45 33','M55 33 Q62 37 69 37'],
    strict:['M31 35 Q38 36 45 39','M55 39 Q62 36 69 35'],
    wow:['M31 34 Q38 29 45 33','M55 33 Q62 29 69 34']}[m]||null;
  const b=brow||['M31 38 Q38 35 45 37','M55 37 Q62 35 69 38'];
  // глаза за очками
  const eyes=m==='happy'?'<path d="M34 46 Q38 42 42 46 M58 46 Q62 42 66 46" stroke="#3a2a20" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
    :m==='wow'?'<circle cx="38" cy="45.5" r="3.1" fill="#3a2a20"/><circle cx="62" cy="45.5" r="3.1" fill="#3a2a20"/><circle cx="39" cy="44.5" r="1" fill="#fff"/><circle cx="63" cy="44.5" r="1" fill="#fff"/>'
    :'<circle cx="38" cy="45.5" r="2.5" fill="#3a2a20"/><circle cx="62" cy="45.5" r="2.5" fill="#3a2a20"/><circle cx="38.8" cy="44.7" r=".8" fill="#fff"/><circle cx="62.8" cy="44.7" r=".8" fill="#fff"/>';
  const mouth={
    calm:'<path d="M43 64 Q50 67.5 57 64" stroke="#a8433f" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    happy:'<path d="M41 62 Q50 71 59 62 Q50 66 41 62Z" fill="#a8433f"/><path d="M44 63.3 Q50 65.5 56 63.3" stroke="#fff" stroke-width="1.4" fill="none"/>',
    worry:'<path d="M43 66 Q50 62.5 57 66" stroke="#a8433f" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    strict:'<path d="M43 65 L57 65" stroke="#a8433f" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    wow:'<ellipse cx="50" cy="65" rx="3.6" ry="4.4" fill="#8e3431"/>'}[m]||'';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
    // плечи: жакет, белый воротник, брошь
    +'<path d="M12 100 Q14 80 32 75 L50 82 L68 75 Q86 80 88 100Z" fill="'+jacket+'"/>'
    +'<path d="M32 75 L50 82 L44 92 Z M68 75 L50 82 L56 92 Z" fill="'+jacketD+'"/>'
    +'<path d="M38 73 L50 84 L62 73 L58 71 L50 78 L42 71Z" fill="#fff"/>'
    +'<circle cx="50" cy="86" r="3.2" fill="'+gold+'"/><circle cx="50" cy="86" r="1.5" fill="#b3261e"/>'
    // шея
    +'<path d="M43 64 L43 75 Q50 80 57 75 L57 64Z" fill="'+skinSh+'"/>'
    // пучок и волосы сзади
    +'<circle cx="50" cy="13" r="11" fill="'+hair+'"/><path d="M42 10 Q50 5 58 10" stroke="'+hairL+'" stroke-width="1.6" fill="none"/>'
    +'<path d="M24 46 Q22 20 50 19 Q78 20 76 46 Q74 30 50 29 Q26 30 24 46Z" fill="'+hairD+'"/>'
    // серьги-жемчуг
    +'<circle cx="25.5" cy="56" r="2.4" fill="#f4f1ea" stroke="#d8d2c4" stroke-width=".6"/><circle cx="74.5" cy="56" r="2.4" fill="#f4f1ea" stroke="#d8d2c4" stroke-width=".6"/>'
    // лицо и уши
    +'<ellipse cx="26" cy="49" rx="4" ry="6" fill="'+skinSh+'"/><ellipse cx="74" cy="49" rx="4" ry="6" fill="'+skinSh+'"/>'
    +'<ellipse cx="50" cy="47" rx="24" ry="27" fill="'+skin+'"/>'
    // причёска спереди: гладкий пробор
    +'<path d="M26 42 Q27 22 50 21 Q73 22 74 42 Q66 28 52 29 Q50 25 48 29 Q33 29 26 42Z" fill="'+hair+'"/>'
    +'<path d="M50 22 Q49 25 48.5 29" stroke="'+hairD+'" stroke-width="1" fill="none"/>'
    // румянец
    +'<ellipse cx="33" cy="56" rx="5" ry="3" fill="#e98a7a" opacity="'+(m==='happy'?'.45':'.25')+'"/><ellipse cx="67" cy="56" rx="5" ry="3" fill="#e98a7a" opacity="'+(m==='happy'?'.45':'.25')+'"/>'
    // брови
    +'<path d="'+b[0]+'" stroke="'+hairD+'" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="'+b[1]+'" stroke="'+hairD+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
    +eyes
    // очки в золотой оправе на цепочке
    +'<rect x="29" y="39" width="18" height="13" rx="5" fill="rgba(255,255,255,.18)" stroke="'+gold+'" stroke-width="2"/>'
    +'<rect x="53" y="39" width="18" height="13" rx="5" fill="rgba(255,255,255,.18)" stroke="'+gold+'" stroke-width="2"/>'
    +'<path d="M47 44 Q50 42 53 44" stroke="'+gold+'" stroke-width="1.8" fill="none"/>'
    +'<path d="M29 44 L25 43 M71 44 L75 43" stroke="'+gold+'" stroke-width="1.6"/>'
    +'<path d="M25 44 Q24 62 30 72" stroke="'+gold+'" stroke-width=".8" fill="none" stroke-dasharray="1.4 1.2"/>'
    // нос
    +'<path d="M50 49 Q48 55 50 57 Q52 57.5 53 56.5" stroke="'+skinSh+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
    +mouth
    +'</svg>';}
root.advisorSvg=advisorSvg;
})(typeof window!=='undefined'?window:this);
