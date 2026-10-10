/* Место 10 «Санаторий» (ART-2). Фон главы 400×300, рисунок кодом, без внешних картинок.
   Подключение: ZB.load('content/art/place-10.js').then(()=>el.innerHTML=ZB_ART[10].svg()) — см. README-2.md */
(function(){var A=window.ZB_ART=window.ZB_ART||{};
A[10]={id:'sanatoriy',n:'Санаторий',c:'#d9f1fb',
svg:function(r){var u='a10_'+(++A._n||(A._n=1));r=r||'xMidYMid slice';
var palm=function(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-3 0 q-6 -40 4 -78 h6 q-8 38 -2 78z" fill="#a8774a"/>${[-60,-45,-30,-15].map(v=>`<path d="M-4 ${v} h9" stroke="#8a5d36" stroke-width="2"/>`).join('')}<g fill="#4fa15a">${[-150,-110,-70,-30,10].map(a=>`<path d="M2 -80 q30 -14 46 6 q-26 -8 -46 0z" transform="rotate(${a} 2 -80)"/>`).join('')}</g><rect x="-14" y="-4" width="28" height="22" rx="3" fill="#c8673b"/><rect x="-16" y="-6" width="32" height="6" rx="2" fill="#a9532c"/></g>`;};
return `<svg viewBox="0 0 400 300" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9dcf6"/><stop offset="1" stop-color="#eef9fe"/></linearGradient>
<linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb7e0"/><stop offset="1" stop-color="#9fd6ee"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#${u}s)"/>
<circle cx="335" cy="46" r="24" fill="#ffd54a"/><circle cx="335" cy="46" r="34" fill="#ffd54a" opacity=".25"/>
<g fill="#fff" opacity=".9"><ellipse cx="70" cy="44" rx="30" ry="10"/><ellipse cx="92" cy="38" rx="18" ry="10"/><ellipse cx="240" cy="26" rx="22" ry="7"/></g>
<rect x="0" y="150" width="400" height="60" fill="url(#${u}m)"/>
<g stroke="#fff" stroke-width="2" fill="none" opacity=".7"><path d="M20 168 q8 -5 16 0 M300 176 q8 -5 16 0 M350 162 q8 -5 16 0 M60 190 q8 -5 16 0"/></g>
<path d="M32 156 v-22 l12 20z" fill="#fff"/><path d="M30 138 l-9 15 h9z" fill="#ffe0a0"/><path d="M18 156 h30 l-5 6 h-20z" fill="#e2463b"/>
<!-- корпус санатория -->
<rect x="110" y="70" width="180" height="120" fill="#fbf7ee"/><path d="M100 72 l100 -38 l100 38z" fill="#f2d2a8"/><path d="M100 72 h200" stroke="#d9b282" stroke-width="5"/>
<circle cx="200" cy="56" r="10" fill="#fff" stroke="#d9b282" stroke-width="3"/><path d="M200 50 v6 h5" stroke="#6d4b3d" stroke-width="2" fill="none"/>
<rect x="132" y="80" width="136" height="18" rx="3" fill="#2f6fd6"/><text x="200" y="93.5" text-anchor="middle" font-size="11.5" font-weight="800" fill="#fff" font-family="Rubik,Arial,sans-serif" textLength="124" lengthAdjust="spacingAndGlyphs">САНАТОРИЙ «ВОЛНА»</text>
${[0,1,2,3,4].map(c=>`<rect x="${126+c*30}" y="106" width="18" height="22" rx="9" fill="#9fd0ea" stroke="#fff" stroke-width="2"/>`).join('')}
${[0,1,2,3,4,5].map(c=>`<rect x="${119+c*30}" y="134" width="12" height="56" fill="#fff" stroke="#e3d6c1" stroke-width="1.5"/><rect x="${116+c*30}" y="132" width="18" height="5" fill="#e3d6c1"/>`).join('')}
<rect x="188" y="150" width="24" height="40" rx="12" fill="#7fb6cf"/>
<rect x="110" y="188" width="180" height="6" fill="#e3d6c1"/>
<!-- набережная -->
<rect x="0" y="206" width="400" height="94" fill="#f0dfbf"/><rect x="0" y="204" width="400" height="6" fill="#d9c49d"/>
${[0,1,2,3,4,5,6,7,8,9].map(i=>`<rect x="${i*42}" y="198" width="4" height="10" fill="#c9b48c"/>`).join('')}<rect x="0" y="197" width="400" height="3" fill="#c9b48c"/>
${palm(92,226,1)}${palm(318,230,1.05)}
<!-- шезлонг -->
<g transform="translate(26 262)"><path d="M0 0 l60 -2 l16 -26" stroke="#8a5d36" stroke-width="3" fill="none"/>${[0,1,2,3].map(i=>`<path d="M${4+i*13} -2 h12 l-3 -12 h-12z" fill="${i%2?'#fff':'#e2463b'}"/>`).join('')}<path d="M56 -4 l14 -22 l6 3 l-14 22z" fill="#e2463b"/><path d="M8 0 l-4 14 M54 -1 l6 15" stroke="#8a5d36" stroke-width="3"/></g>
<!-- столик с кефиром -->
<g transform="translate(160 266)"><ellipse cx="0" cy="0" rx="26" ry="6" fill="#fff" stroke="#d9c49d" stroke-width="2"/><path d="M0 4 v22 M-10 26 h20" stroke="#8a8f99" stroke-width="3"/>
<path d="M-12 -24 h12 l-1 22 h-10z" fill="#fff" stroke="#9fb3c4" stroke-width="1.5"/><path d="M-11 -18 h10 l-.6 16 h-8.8z" fill="#f7f7f2"/><text x="-6" y="-8" text-anchor="middle" font-size="5" font-weight="700" fill="#2f6fd6" font-family="Arial">КЕФИР</text>
<path d="M6 -14 h12 l-1 12 h-10z" fill="#e8f4fb" stroke="#9fb3c4" stroke-width="1.5"/><path d="M7 -9 h10" stroke="#fff" stroke-width="3"/></g>
<!-- доска объявлений -->
<g transform="translate(232 228)"><rect x="-2" y="18" width="4" height="40" fill="#8a5d36"/><rect x="34" y="18" width="4" height="40" fill="#8a5d36"/><rect x="-6" y="-14" width="48" height="36" rx="3" fill="#fff" stroke="#8a5d36" stroke-width="3"/>
<text x="18" y="-3" text-anchor="middle" font-size="7" font-weight="800" fill="#e2463b" font-family="Arial">ТАНЦЫ 19:00</text><text x="18" y="7" text-anchor="middle" font-size="5.2" fill="#3a2a22" font-family="Arial">кавалеры —</text><text x="18" y="14" text-anchor="middle" font-size="5.2" fill="#3a2a22" font-family="Arial">по записи</text></g>
<!-- полотенце и шляпа -->
<g transform="translate(360 276)"><ellipse cx="0" cy="0" rx="22" ry="7" fill="#f5b72d"/><ellipse cx="0" cy="-4" rx="11" ry="7" fill="#f7c95a"/><path d="M-11 -2 q11 4 22 0" stroke="#e2463b" stroke-width="2.5" fill="none"/></g>
<g fill="#fff" stroke="#9fb3c4" stroke-width="1"><path d="M200 18 q5 -5 10 0 q5 -5 10 0" fill="none" stroke="#5b6b7a" stroke-width="2"/></g>
</svg>`;}};})();
