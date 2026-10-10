/* Место 13 «ЖЭК» (ART-2). Фон главы 400×300: дверь «Приём сантехника», капающая труба, календарь прошлого года. */
(function(){var A=window.ZB_ART=window.ZB_ART||{};
A[13]={id:'zhek',n:'ЖЭК',c:'#e6e9ef',
svg:function(r){var u='a13_'+(++A._n||(A._n=1));r=r||'xMidYMid slice';
var chair=function(x,y){return `<g transform="translate(${x} ${y})"><rect x="-14" y="-40" width="28" height="22" rx="3" fill="#8a8f99"/><rect x="-16" y="-18" width="32" height="7" rx="2" fill="#6b7280"/><path d="M-12 -11 v20 M12 -11 v20" stroke="#4b5260" stroke-width="3"/></g>`;};
return `<svg viewBox="0 0 400 300" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f6"/><stop offset="1" stop-color="#dfe4ec"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#${u}w)"/>
<rect x="0" y="130" width="400" height="90" fill="#8fb3a4"/><rect x="0" y="128" width="400" height="4" fill="#6f9585"/>
<!-- труба через стену -->
<rect x="0" y="40" width="400" height="12" fill="#9aa3ad"/><rect x="0" y="40" width="400" height="3" fill="#c3cad3"/>
${[60,170,300].map(x=>`<rect x="${x}" y="36" width="10" height="20" rx="2" fill="#7c8590"/>`).join('')}
<g transform="translate(236 52)"><rect x="-8" y="0" width="16" height="6" fill="#7c8590"/><rect x="-3" y="-2" width="6" height="2" fill="#7c8590"/><path d="M-12 0 h-6 M12 0 h6" stroke="#e2463b" stroke-width="3"/><rect x="-14" y="-2" width="28" height="4" fill="none" stroke="#e2463b" stroke-width="1.5" stroke-dasharray="3 2"/></g>
${[[236,66,5],[236,86,4],[236,112,3.4]].map(([x,y,s])=>`<path d="M${x} ${y-s*1.6} q${s} ${s*1.6} 0 ${s*2.4} q${-s} ${-s*.8} 0 ${-s*2.4}z" fill="#5fb7e0"/>`).join('')}
<!-- дверь -->
<rect x="146" y="62" width="76" height="158" fill="#b9c2cc"/><rect x="152" y="68" width="64" height="152" fill="#7a5a3a"/><rect x="158" y="76" width="52" height="64" fill="#8a6a48"/><rect x="158" y="148" width="52" height="64" fill="#8a6a48"/><circle cx="204" cy="146" r="4" fill="#f5b72d"/>
<rect x="160" y="88" width="48" height="34" fill="#fff"/><text x="184" y="100" text-anchor="middle" font-size="7" font-weight="800" fill="#1d4fa3" font-family="Arial">САНТЕХНИК</text>
<text x="184" y="110" text-anchor="middle" font-size="5.6" fill="#3a2a22" font-family="Arial">приём 9:00–9:05</text><text x="184" y="118" text-anchor="middle" font-size="5" fill="#e2463b" font-family="Arial">(будет позже)</text>
<!-- табличка ЖЭК -->
<rect x="150" y="2" width="68" height="30" rx="4" fill="#1d4fa3" stroke="#fff" stroke-width="2"/><text x="184" y="23" text-anchor="middle" font-size="17" font-weight="800" fill="#fff" font-family="Rubik,Arial,sans-serif">ЖЭК</text>
<!-- календарь прошлого года -->
<g transform="translate(262 68)"><rect x="0" y="0" width="40" height="50" fill="#fff" stroke="#b9c2cc" stroke-width="1.5"/><rect x="0" y="0" width="40" height="13" fill="#e2463b"/><text x="20" y="10" text-anchor="middle" font-size="8.5" font-weight="800" fill="#fff" font-family="Arial">2025</text>
${[0,1,2,3,4].map(rr=>[0,1,2,3,4,5].map(c=>`<rect x="${4+c*5.6}" y="${17+rr*6}" width="3.6" height="3.6" fill="${rr===2&&c===3?'#e2463b':'#c3cad3'}"/>`).join('')).join('')}<circle cx="21.5" cy="30" r="5" fill="none" stroke="#e2463b" stroke-width="1.3"/><circle cx="20" cy="-2" r="2" fill="#6b7280"/></g>
<!-- доска объявлений -->
<g transform="translate(36 64)"><rect width="88" height="58" fill="#c89a62" stroke="#8a5d36" stroke-width="3"/>
<rect x="6" y="6" width="34" height="24" fill="#fff" transform="rotate(-3 23 18)"/><text x="23" y="16" text-anchor="middle" font-size="5" font-weight="700" fill="#e2463b" font-family="Arial" transform="rotate(-3 23 18)">ВОДЫ НЕ</text><text x="23" y="23" text-anchor="middle" font-size="5" font-weight="700" fill="#e2463b" font-family="Arial" transform="rotate(-3 23 18)">БУДЕТ</text>
<rect x="46" y="8" width="36" height="20" fill="#fff6c4" transform="rotate(4 64 18)"/><path d="M50 14 h28 M50 19 h24 M50 24 h18" stroke="#8a8f99" stroke-width="1.2" transform="rotate(4 64 18)"/>
<rect x="14" y="34" width="56" height="18" fill="#dff1e3"/><text x="42" y="46" text-anchor="middle" font-size="5.5" fill="#2f7d3a" font-family="Arial">собрание жильцов</text>
${[[22,6],[64,8],[42,34]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2" fill="#e2463b"/>`).join('')}</g>
<!-- цветок на окне справа -->
<g transform="translate(330 60)"><rect width="56" height="64" fill="#fff"/><rect x="4" y="4" width="48" height="56" fill="#cfe6f5"/><path d="M28 4 v56 M4 32 h48" stroke="#fff" stroke-width="3"/><rect x="-4" y="64" width="64" height="5" fill="#c3cad3"/><path d="M14 64 l3 -14 h14 l3 14z" fill="#c8673b"/><path d="M24 50 q-12 -14 -6 -26 M24 50 q10 -16 4 -30 M24 50 q2 -10 14 -16" stroke="#3f9a4c" stroke-width="3" fill="none"/><ellipse cx="18" cy="24" rx="5" ry="3" fill="#4fa15a"/><ellipse cx="38" cy="34" rx="5" ry="3" fill="#4fa15a"/></g>
<!-- пол -->
<rect x="0" y="218" width="400" height="82" fill="#bfa98a"/>${[0,1,2,3,4,5,6,7,8,9,10].map(i=>`<rect x="${i*40-((i%2)*20)}" y="218" width="40" height="20" fill="none" stroke="#a8917a" stroke-width="1.5"/><rect x="${i*40}" y="238" width="40" height="20" fill="none" stroke="#a8917a" stroke-width="1.5"/>`).join('')}
<!-- ведро под каплей -->
<g transform="translate(236 252)"><path d="M-18 -24 h36 l-5 30 h-26z" fill="#9aa3ad"/><ellipse cx="0" cy="-24" rx="18" ry="5" fill="#5fb7e0" stroke="#7c8590" stroke-width="2"/><path d="M-18 -24 q18 -26 36 0" stroke="#6b7280" stroke-width="2" fill="none"/><path d="M-12 -12 h24" stroke="#7c8590" stroke-width="2"/></g>
<!-- очередь из стульев -->
${chair(46,262)}${chair(86,262)}${chair(126,262)}
<g transform="translate(82 218) rotate(-6)"><rect x="-12" y="0" width="24" height="16" fill="#f4f1ea" stroke="#b9c2cc"/><path d="M-9 4 h18 M-9 8 h18 M-9 12 h12" stroke="#8a8f99" stroke-width="1"/><text x="0" y="-2" text-anchor="middle" font-size="5" font-weight="700" fill="#3a2a22" font-family="Arial">ЗАЯВЛЕНИЕ</text></g>
<!-- разводной ключ и вантуз -->
<g transform="translate(330 262)"><path d="M-30 6 l46 -20" stroke="#8a8f99" stroke-width="7" stroke-linecap="round"/><path d="M14 -24 q12 -2 14 8 l-6 2 q-2 -6 -8 -4 l2 6 l-6 2z" fill="#8a8f99"/>
<path d="M44 -6 h20 q2 -14 -10 -14 q-12 0 -10 14z" fill="#e2463b"/><rect x="52" y="-60" width="4" height="42" fill="#a8774a"/></g>
<!-- кот-сантехник шутка: следы лап -->
${[[280,290],[294,282],[308,290],[322,282]].map(([x,y])=>`<g fill="#a8917a" opacity=".7"><ellipse cx="${x}" cy="${y}" rx="3.2" ry="2.6"/><circle cx="${x-3}" cy="${y-4}" r="1.2"/><circle cx="${x}" cy="${y-5}" r="1.2"/><circle cx="${x+3}" cy="${y-4}" r="1.2"/></g>`).join('')}
</svg>`;}};})();
