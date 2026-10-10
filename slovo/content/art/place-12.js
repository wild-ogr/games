/* Место 12 «Почта» (ART-2). Фон главы 400×300: окошки (почти все закрыты), посылка от внука. */
(function(){var A=window.ZB_ART=window.ZB_ART||{};
A[12]={id:'pochta',n:'Почта',c:'#fdecd2',
svg:function(r){var u='a12_'+(++A._n||(A._n=1));r=r||'xMidYMid slice';
var win=function(x,n,t,open){return `<g transform="translate(${x} 70)"><rect width="64" height="62" fill="#fff" stroke="#c9b48c" stroke-width="3"/><rect x="5" y="5" width="54" height="52" fill="${open?'#fff6dd':'#e8e3d6'}"/>
<path d="M5 30 h54" stroke="#c9b48c" stroke-width="2"/><rect x="22" y="-14" width="20" height="14" rx="3" fill="#2f6fd6"/><text x="32" y="-3" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="Arial">${n}</text>
${open?'':`<rect x="9" y="34" width="46" height="16" rx="2" fill="#fff" stroke="#e2463b" stroke-width="1.5" transform="rotate(-6 32 42)"/><text x="32" y="45.5" text-anchor="middle" font-size="7" font-weight="700" fill="#e2463b" font-family="Arial" transform="rotate(-6 32 42)">${t}</text>`}</g>`;};
var box=function(x,y,w,h,c){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c||'#d8a868'}" stroke="#a87a45" stroke-width="1.5"/><path d="M${x+w/2} ${y} v${h} M${x} ${y+h/2} h${w}" stroke="#7a5a3a" stroke-width="1.2" opacity=".6"/>`;};
return `<svg viewBox="0 0 400 300" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf3e2"/><stop offset="1" stop-color="#f7e4c4"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#${u}w)"/>
<rect x="0" y="0" width="400" height="44" fill="#2f6fd6"/><rect x="0" y="44" width="400" height="4" fill="#1d4fa3"/>
<g transform="translate(128 8)"><circle cx="14" cy="14" r="13" fill="#fff"/><path d="M5 17 q0 -9 9 -9 h4 l6 -4 v14 l-6 -4 h-4" fill="#f5b72d" stroke="#b9860f" stroke-width="1"/><circle cx="8" cy="18" r="3.5" fill="#f5b72d" stroke="#b9860f"/></g>
<text x="214" y="31" text-anchor="middle" font-size="21" font-weight="800" fill="#fff" font-family="Rubik,Arial,sans-serif" letter-spacing="3">ПОЧТА</text>
<!-- стойка с окошками -->
<rect x="0" y="62" width="400" height="104" fill="#e9d9bc"/>
${win(18,1,'ОБЕД',0)}${win(98,2,'ПЕРЕРЫВ',0)}${win(178,3,'',1)}${win(258,4,'ЗАКРЫТО',0)}${win(338,5,'УЧЁТ',0)}
<g transform="translate(210 102)"><rect x="-22" y="-14" width="44" height="12" rx="2" fill="#3f9a4c"/><text x="0" y="-5" text-anchor="middle" font-size="7" font-weight="800" fill="#fff" font-family="Arial">ОТКРЫТО</text><rect x="-16" y="12" width="14" height="10" fill="#8a5d36"/><circle cx="-9" cy="8" r="4" fill="#5a3f26"/><rect x="2" y="14" width="18" height="12" fill="#fff" stroke="#c9b48c" transform="rotate(-8 11 20)"/><circle cx="14" cy="20" r="3.4" fill="none" stroke="#2f6fd6" stroke-width="1.2" transform="rotate(-8 11 20)"/></g>
<rect x="0" y="160" width="400" height="16" fill="#a8774a"/><rect x="0" y="174" width="400" height="44" fill="#c89a62"/>
${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${10+i*50}" y="180" width="40" height="32" fill="none" stroke="#a87a45" stroke-width="2"/>`).join('')}
<!-- очередь: сумка-тележка, табличка -->
<g transform="translate(50 214)"><rect x="-14" y="-40" width="28" height="36" rx="5" fill="#3f9a4c"/>${[0,1,2].map(i=>`<path d="M-14 ${-32+i*10} h28" stroke="#2f7d3a" stroke-width="2"/>`).join('')}<path d="M10 -40 l6 -16 h-6" stroke="#555" stroke-width="3" fill="none"/><circle cx="-8" cy="0" r="5" fill="#444"/><circle cx="8" cy="0" r="5" fill="#444"/></g>
<rect x="0" y="218" width="400" height="82" fill="#d9c7a6"/>${[0,1,2,3,4,5,6,7,8,9].map(i=>`<path d="M${i*44} 218 l-14 82" stroke="#c9b48c" stroke-width="2"/>`).join('')}
<!-- главная посылка от внука -->
<g transform="translate(200 250)"><path d="M-58 -40 l20 -14 h96 l-20 14z" fill="#e6bf86"/><path d="M38 -40 l20 -14 v50 l-20 14z" fill="#b98a52"/><rect x="-58" y="-40" width="96" height="50" fill="#d8a868"/>
<path d="M-10 -54 l-20 14 v50 M-58 -16 h96 l20 -14" stroke="#7a5a3a" stroke-width="3" fill="none"/><path d="M-22 -50 q10 -14 22 -6 q-8 4 -22 6z M-22 -50 q-16 -12 -26 -2 q10 4 26 2z" fill="#e2463b"/>
<rect x="-50" y="-34" width="34" height="14" fill="#fff" transform="rotate(-4 -33 -27)"/><text x="-33" y="-24" text-anchor="middle" font-size="6.5" font-weight="700" fill="#2f6fd6" font-family="Arial" transform="rotate(-4 -33 -27)">ЗИНЕ</text>
<rect x="2" y="-12" width="32" height="18" fill="#fff"/><text x="18" y="-4" text-anchor="middle" font-size="5" fill="#3a2a22" font-family="Arial">от внука</text><text x="18" y="3" text-anchor="middle" font-size="4.5" fill="#e2463b" font-family="Arial">ХРУПКОЕ!</text>
<path d="M-56 -2 h20 M-56 4 h14" stroke="#7a5a3a" stroke-width="1" opacity=".6"/></g>
<!-- стопка посылок слева и справа -->
${box(80,252,40,28)}${box(88,230,28,22,'#e6bf86')}${box(300,246,46,34)}${box(316,226,22,20,'#e6bf86')}
<!-- синий ящик для писем -->
<g transform="translate(362 196)"><rect x="-18" y="-30" width="36" height="44" rx="6" fill="#2f6fd6"/><rect x="-12" y="-20" width="24" height="5" rx="2" fill="#1d4fa3"/><path d="M-9 -4 h18 v10 h-18z M-9 -4 l9 6 l9 -6" stroke="#fff" stroke-width="1.6" fill="none"/><rect x="-3" y="14" width="6" height="40" fill="#555"/></g>
<!-- конверты летят -->
${[[30,128,-12],[372,130,10]].map(([x,y,a])=>`<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-10" y="-7" width="20" height="14" fill="#fff" stroke="#c9b48c"/><path d="M-10 -7 l10 8 l10 -8" stroke="#c9b48c" fill="none"/><rect x="4" y="-5" width="5" height="5" fill="#e2463b"/></g>`).join('')}
</svg>`;}};})();
