/* Кабинет 3 «Живой уголок Яти» (CAB-1). Три состояния 400×300: 1 — пустые клетки и сухой кактус, 2 — ремонт, рыбки и лежанка, 3 — «как новенький», Ять с Барсиком и буквой.
   Подключение: ZB.load('content/cab/cab-3.js').then(()=>el.innerHTML=ZB_CAB[3].svg(lv)) — см. README-1.md.
   Герои: кот Ять (облик 1:1 с catSVG() из slovo/js/text.js — рыжий, синий ошейник, золотой жетон), Барсик с пятого (серый полосатый, зелёные глаза — sosFace(6) из slovo/js/sosedki.js). */
(function(){var A=window.ZB_CAB=window.ZB_CAB||{},k=0;
/* Ять: геометрия catSVG (120×120, (0,0) — левый верх); mood: 'sad' | 'happy'; let — буква во рту (плашка) */
function yat(x,y,s,mood,let){var eyes=mood==='sad'
?'<path d="M44 44 q6 4 12 2 M64 46 q6 2 12 -2" stroke="#3a2a22" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M42 38 l12 4 M78 38 l-12 4" stroke="#c97a2c" stroke-width="2.4" stroke-linecap="round"/>'
:'<path d="M44 46 q6 -5 12 0 M64 46 q6 -5 12 0" stroke="#3a2a22" stroke-width="3" fill="none" stroke-linecap="round"/>';
return `<g transform="translate(${x} ${y}) scale(${s})">
<ellipse cx="60" cy="112" rx="40" ry="6" fill="rgba(0,0,0,.12)"/>
<path d="M95 104 q24 -6 14 -30 q-4 -8 -10 -4 q6 10 0 22 q-6 8 -12 8z" fill="#f0a24c"/>
<path d="M28 110 q-6 -40 16 -56 h32 q22 16 16 56z" fill="#f5b060"/>
<path d="M42 70 q18 8 36 0 M40 84 q20 8 40 0 M40 98 q20 6 40 0" stroke="#e08a36" stroke-width="4" fill="none" opacity=".7"/>
<ellipse cx="60" cy="96" rx="14" ry="14" fill="#fff3e3"/>
<circle cx="60" cy="46" r="28" fill="#f5b060"/>
<path d="M36 34 l-4 -26 l20 14z M84 34 l4 -26 l-20 14z" fill="#f5b060"/><path d="M38 30 l-2 -15 l11 8z M82 30 l2 -15 l-11 8z" fill="#f7c9a8"/>
<path d="M48 24 l4 8 M60 20 v10 M72 24 l-4 8" stroke="#e08a36" stroke-width="3.5" stroke-linecap="round"/>
${eyes}
<ellipse cx="60" cy="56" rx="12" ry="8" fill="#fff3e3"/><path d="M57 53 h6 l-3 4z" fill="#e0707a"/>
${mood==='sad'?'<path d="M54 62 q6 -4 12 0" stroke="#3a2a22" stroke-width="1.8" fill="none"/>':'<path d="M60 57 q-3 5 -7 3 M60 57 q3 5 7 3" stroke="#3a2a22" stroke-width="1.8" fill="none"/>'}
<path d="M40 56 l-16 -3 M40 60 l-15 3 M80 56 l16 -3 M80 60 l15 3" stroke="#fff" stroke-width="1.6" opacity=".9"/>
<path d="M46 74 l14 6 l14 -6 l-4 10 l-10 -4 l-10 4z" fill="#1d4fa3"/><circle cx="60" cy="80" r="3.5" fill="#f5b72d"/>
${let?`<g transform="translate(60 66) rotate(-8)"><rect x="-11" y="-2" width="22" height="22" rx="4" fill="#fff6dc" stroke="#d9a520" stroke-width="2"/><text x="0" y="15" font-size="16" font-weight="800" text-anchor="middle" fill="#1d4fa3">${let}</text></g>`:''}
</g>`;}
/* Барсик целиком: голова 1:1 с sosFace(6) (100×100), туловище добавлено в тех же цветах; (0,0) — левый верх */
function barsik(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})">
<ellipse cx="50" cy="146" rx="34" ry="5" fill="rgba(0,0,0,.12)"/>
<path d="M80 140 q26 -4 18 -30 q-3 -7 -8 -3 q5 12 -2 22 q-4 5 -10 5z" fill="#8f98a2"/>
<path d="M18 144 q-4 -50 32 -64 q36 14 32 64z" fill="#9aa3ad"/>
<path d="M28 104 q22 8 44 0 M24 120 q26 9 52 0 M24 134 q26 8 52 0" stroke="#6f7984" stroke-width="4" fill="none" opacity=".7"/>
<ellipse cx="50" cy="128" rx="13" ry="14" fill="#eef1f4"/>
<path d="M24 40 l-2 -24 l18 12z M76 40 l2 -24 l-18 12z" fill="#9aa3ad"/><path d="M27 34 l-1 -12 l9 7z M73 34 l1 -12 l-9 7z" fill="#f2c4cf"/>
<ellipse cx="50" cy="54" rx="28" ry="25" fill="#a9b2bc"/>
<path d="M42 32 l3 8 M50 30 v10 M58 32 l-3 8" stroke="#6f7984" stroke-width="3" stroke-linecap="round"/>
<path d="M24 52 l8 2 M76 52 l-8 2" stroke="#6f7984" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="50" cy="64" rx="11" ry="8" fill="#eef1f4"/>
<ellipse cx="40" cy="52" rx="3.6" ry="4.6" fill="#3d5a2a"/><ellipse cx="60" cy="52" rx="3.6" ry="4.6" fill="#3d5a2a"/><circle cx="41" cy="50.5" r="1.2" fill="#fff"/><circle cx="61" cy="50.5" r="1.2" fill="#fff"/>
<path d="M47 60 h6 l-3 3.5z" fill="#e0707a"/><path d="M50 63.5 q-3 4 -6 2 M50 63.5 q3 4 6 2" stroke="#3a2a22" stroke-width="1.5" fill="none"/>
<path d="M30 62 l-14 -2 M30 66 l-13 3 M70 62 l14 -2 M70 66 l13 3" stroke="#fff" stroke-width="1.3"/></g>`;}
function fish(x,y,c,f){return `<g transform="translate(${x} ${y}) scale(${f?-1:1} 1)"><ellipse rx="8" ry="5" fill="${c}"/><path d="M7 0 l7 -5 v10z" fill="${c}"/><circle cx="-4" cy="-1" r="1.2" fill="#222"/></g>`;}
function pot(x,y,kind,dry){var p=`<g transform="translate(${x} ${y})"><path d="M-10 0 h20 l-3 16 h-14z" fill="#c8643c"/><rect x="-11" y="-2" width="22" height="4" rx="1" fill="#b55530"/>`;
if(kind==='cactus')p+=dry?'<path d="M-3 -2 q-2 -16 3 -20 q5 4 3 20z" fill="#a89a5c"/><path d="M0 -22 l-4 -4" stroke="#8a7a4a" stroke-width="1.5"/>':'<rect x="-4" y="-24" width="8" height="24" rx="4" fill="#4f9a4a"/><path d="M-4 -12 h-5 v-8" stroke="#4f9a4a" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="0" cy="-25" r="3.4" fill="#e86a9a"/>';
else p+=`<path d="M0 -2 V-40" stroke="#6b4a2a" stroke-width="2.4"/>${[[-10,-12,-30],[10,-18,30],[-9,-26,-25],[9,-32,25],[0,-42,0]].map(a=>`<ellipse cx="${a[0]}" cy="${a[1]}" rx="9" ry="5" fill="#3f8f45" transform="rotate(${a[2]} ${a[0]} ${a[1]})"/>`).join('')}`;
return p+'</g>';}
A[3]={id:'zhivoj',n:'Живой уголок Яти',c:'#e6f4dc',svg:function(lv,r){lv=lv||1;var u='c3_'+(++k);r=r||'xMidYMid slice';
var L1=lv===1,L3=lv===3;
var wall=L1?'#cfd0b4':'#e9f3d6',pan=L1?'#9a9a78':'#9ccf86',fl=L1?'#9b8466':'#c99a62';
var s=`<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}">
<defs><linearGradient id="w${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L1?'#c9d3d6':'#bfe2fb'}"/><stop offset="1" stop-color="${L1?'#e2e6e4':'#f0f9ff'}"/></linearGradient>
<linearGradient id="q${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ee"/><stop offset="1" stop-color="#3b9cc4"/></linearGradient></defs>
<rect width="400" height="300" fill="${wall}"/>
${L3?`<g fill="#d7ebc4">${Array.from({length:24},(_,i)=>`<path d="M${(i%8)*52+14} ${(i/8|0)*46+14} q4 -6 8 0 q-4 6 -8 0z"/>`).join('')}</g>`:''}
<rect y="160" width="400" height="66" fill="${pan}"/><path d="M0 160 H400" stroke="${L1?'#86866a':'#7fb86a'}" stroke-width="4"/>
<rect y="224" width="400" height="76" fill="${fl}"/>
<g stroke="${L1?'#6e5c45':'#a87a48'}" stroke-width="1.4">${[242,262,284].map(y=>`<path d="M0 ${y} H400"/>`).join('')}${[[60,224,242],[180,242,262],[300,224,242],[110,262,284],[240,262,284],[30,284,300],[340,284,300]].map(a=>`<path d="M${a[0]} ${a[1]} V${a[2]}"/>`).join('')}</g>`;
if(L1)s+=`<path d="M200 20 l14 20 l-8 12 l10 18 M330 170 l-14 14 l8 14" stroke="#9a9a80" stroke-width="1.4" fill="none"/><path d="M8 0 Q20 10 0 28 M400 0 L360 0 Q378 14 400 40" stroke="#aaa" stroke-width=".8" fill="none"/>`;
/* окно в центре */
s+=`<g transform="translate(150 30)"><rect width="100" height="96" rx="2" fill="#fff"/><rect x="5" y="5" width="90" height="86" fill="url(#w${u})"/><path d="M50 5 V91 M5 46 H95" stroke="#fff" stroke-width="4"/>
${L1?'<path d="M10 10 l30 34 M40 10 l-30 34" stroke="#d8c27a" stroke-width="5"/>':`<circle cx="76" cy="22" r="9" fill="#ffe08a"/><path d="M8 86 q20 -24 42 -10 q20 -18 42 6z" fill="#9fd08a" opacity=".6"/>`}
<rect x="-6" y="94" width="112" height="8" rx="2" fill="#efe7d8"/></g>`;
if(!L1)s+=pot(172,124,'cactus',0)+pot(228,124,'cactus',0)+(L3?pot(200,124,'ficus',0):'');
else s+=pot(186,124,'cactus',1);
/* вывеска */
s+=`<g transform="translate(${L1?'22 12) rotate(-6':'20 12'})"><rect width="116" height="26" rx="4" fill="${L1?'#b8b49a':'#4f9a4a'}"/><text x="58" y="17" font-size="11.5" font-weight="800" text-anchor="middle" fill="${L1?'#eeead8':'#fff'}">ЖИВОЙ УГОЛОК</text></g>`;
/* стеллаж-полка слева с аквариумом */
s+=`<g transform="translate(14 112)"><rect width="120" height="6" fill="${L1?'#8a7458':'#a86f3c'}"/><rect x="6" y="6" width="6" height="${L1?100:110}" fill="${L1?'#7a6448':'#93602f'}"/><rect x="108" y="6" width="6" height="110" fill="${L1?'#7a6448':'#93602f'}"/><rect y="70" width="120" height="6" fill="${L1?'#8a7458':'#a86f3c'}"/>
${L1?'<path d="M6 106 l-4 8" stroke="#7a6448" stroke-width="6"/>':''}</g>`;
/* аквариум на полке */
s+=`<g transform="translate(22 60)"><rect width="104" height="52" rx="3" fill="${L1?'rgba(220,230,232,.6)':`url(#q${u})`}" stroke="#d8eef6" stroke-width="3"/>
${L1?'<path d="M60 0 l-8 18 l10 10 l-6 24" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M6 46 q20 -6 40 0 q30 4 54 -2 v6 h-94z" fill="#c9bc9a"/><path d="M80 42 l4 -10 l4 10" stroke="#9a8a6a" stroke-width="1.5" fill="none"/>'
:`<path d="M2 8 h100" stroke="#fff" stroke-width="1.5" opacity=".7"/><path d="M4 50 q30 -8 48 -2 q30 6 48 0 v2 h-96z" fill="#e8d7a8"/>
<path d="M18 50 q-6 -14 2 -26 M24 50 q6 -16 -2 -30" stroke="#3f8f45" stroke-width="3" fill="none"/>${L3?'<path d="M86 50 q-6 -14 2 -26 M92 50 q6 -18 -2 -34" stroke="#4f9a4a" stroke-width="3" fill="none"/><g transform="translate(62 44)"><path d="M-8 6 q0 -12 8 -12 q8 0 8 12z" fill="#b9a27a"/><rect x="-3" y="0" width="6" height="6" fill="#5a4028"/></g>':''}
${fish(50,24,'#f58a2c',0)}${fish(76,34,'#f5b72d',1)}${L3?fish(36,36,'#e8475a',1)+'<g fill="none" stroke="#fff" stroke-width="1" opacity=".8"><circle cx="40" cy="14" r="2"/><circle cx="43" cy="7" r="1.5"/><circle cx="70" cy="18" r="2"/></g>':''}`}
<rect x="-2" y="-4" width="108" height="5" rx="2" fill="${L1?'#888':'#3b6b8a'}"/></g>`;
/* нижняя полка: черепаха/коробка */
s+=L1?`<g transform="translate(28 160)"><path d="M0 26 l6 -26 h44 l6 26z" fill="#c9a874"/><path d="M6 0 l-6 -8 h44 l6 8 M50 0 l10 -6" stroke="#a88a5c" stroke-width="2" fill="none"/><text x="28" y="18" font-size="7" text-anchor="middle" fill="#7a5c3e">ХРУПКОЕ</text></g><g fill="#d9c27a">${[[90,184],[96,180],[100,186],[106,182]].map(p=>`<path d="M${p[0]} ${p[1]} l8 -3" stroke="#d9c27a" stroke-width="1.6"/>`).join('')}</g>`
:`<g transform="translate(24 150)"><rect width="66" height="32" rx="2" fill="rgba(200,230,240,.5)" stroke="#d8eef6" stroke-width="2"/><path d="M2 30 h62" stroke="#c9a874" stroke-width="5"/>
<g transform="translate(34 22)"><ellipse rx="13" ry="8" fill="#6b8f3a"/><path d="M-8 -3 l5 4 l6 -4 l5 4" stroke="#4f6b2a" stroke-width="1.6" fill="none"/><circle cx="15" cy="2" r="4" fill="#9cb85a"/><circle cx="16" cy="1" r=".9" fill="#222"/><path d="M-10 6 v3 M8 6 v3" stroke="#9cb85a" stroke-width="3"/></g></g>
`;
/* клетка с птичкой (висит справа от окна) */
s+=`<path d="M290 0 V30" stroke="#888" stroke-width="1.4"/><g transform="translate(290 30)"><path d="M-24 60 V18 q24 -26 48 0 V60z" fill="${L3?'rgba(255,248,220,.6)':'none'}" stroke="${L1?'#9a9a8a':'#d4a017'}" stroke-width="2"/>
<g stroke="${L1?'#9a9a8a':'#d4a017'}" stroke-width="1.1">${[-16,-8,0,8,16].map(x=>`<path d="M${x} ${x?6+Math.abs(x)*.4:2} V60"/>`).join('')}</g><rect x="-26" y="58" width="52" height="5" rx="2" fill="${L1?'#9a9a8a':'#d4a017'}"/>
${L1?'<path d="M24 60 l18 -14" stroke="#9a9a8a" stroke-width="2"/><g fill="#d9c27a"><path d="M-6 56 l5 -3 l3 4z"/></g>'
:`<path d="M-18 40 H18" stroke="#a86f3c" stroke-width="2"/><g transform="translate(0 32)"><ellipse rx="8" ry="6" fill="#f5d33a"/><circle cx="6" cy="-5" r="4.5" fill="#f5d33a"/><path d="M10 -5 l4 1 l-4 2z" fill="#e8892a"/><circle cx="7" cy="-6" r="1" fill="#222"/><path d="M-6 2 l-8 3 l8 1z" fill="#e2bb1a"/></g>${L3?'<path d="M14 6 q6 -4 10 0 M18 2 q2 -4 6 -2" stroke="#d4a017" stroke-width="1.2" fill="none"/><text x="26" y="0" font-size="9" fill="#d4a017">♪</text>':''}`}</g>`;
/* график кормления / плакат */
s+=L1?`<g transform="translate(330 34) rotate(5)"><rect width="56" height="46" fill="#e6dcc6" stroke="#b9ad94"/><text x="28" y="14" font-size="6.5" text-anchor="middle" fill="#a08a7a">График</text><text x="28" y="23" font-size="6.5" text-anchor="middle" fill="#a08a7a">кормления</text><path d="M8 32 h40 M8 38 h30" stroke="#c9bca0"/></g>`
:`<g transform="translate(330 30)"><rect width="58" height="66" fill="#fff" stroke="#cbd8bf"/><text x="29" y="12" font-size="7" text-anchor="middle" fill="#3f6b2a" font-weight="800">ДЕЖУРНЫЙ</text>
<text x="29" y="26" font-size="9" text-anchor="middle" fill="#e08a36" font-weight="800">кот Ять</text><path d="M8 34 h42 M8 42 h42 M8 50 h42" stroke="#c7d3e6" stroke-width=".8"/>
<g fill="#f0a24c" transform="translate(29 50)"><ellipse rx="5" ry="4"/><circle cx="-5" cy="-6" r="2"/><circle cx="0" cy="-8" r="2"/><circle cx="5" cy="-6" r="2"/></g>
${L3?'<text x="10" y="40" font-size="7" fill="#d7263d">✓</text><text x="10" y="48" font-size="7" fill="#d7263d">✓</text>':''}</g>`;
/* кошачья лежанка / домик справа внизу */
if(L1)s+=`<g transform="translate(250 196)"><path d="M0 64 l6 -48 h96 l6 48z" fill="#c9a874"/><path d="M6 16 l-14 -14 M102 16 l14 -12 M6 16 l20 -16 M102 16 l-22 -14" stroke="#a88a5c" stroke-width="3" fill="#c9a874"/><text x="54" y="48" font-size="8" text-anchor="middle" fill="#7a5c3e">НЕ КАНТОВАТЬ</text></g>`+yat(268,152,.62,'sad',0);
else if(lv===2)s+=`<g transform="translate(240 252)"><ellipse cx="60" cy="10" rx="62" ry="16" fill="#c0392b"/><ellipse cx="60" cy="6" rx="50" ry="10" fill="#f2c9a7"/></g>`+yat(266,160,.82,'happy','Я');
else s+=`<g transform="translate(296 132)"><rect x="40" y="0" width="10" height="132" fill="#d9c09a"/><g stroke="#b99a6a" stroke-width="1">${Array.from({length:12},(_,i)=>`<path d="M40 ${i*11+4} h10"/>`).join('')}</g>
<rect x="-6" y="40" width="102" height="10" rx="4" fill="#c0392b"/><rect x="0" y="122" width="96" height="12" rx="4" fill="#c0392b"/>
<g transform="translate(30 -4)"><path d="M0 22 L16 0 L32 22z" fill="#e8475a"/><rect x="3" y="22" width="26" height="22" fill="#f2c9a7"/><path d="M10 44 v-10 a6 6 0 0 1 12 0 v10z" fill="#5a3a2a"/><rect x="5" y="25" width="22" height="7" rx="1" fill="#fff6dc"/><text x="16" y="31" font-size="6" text-anchor="middle" fill="#1d4fa3" font-weight="800">Ять</text></g></g>`
+barsik(212,190,.66)+yat(286,190,.66,'happy','Ѣ')
+`<g transform="translate(196 270)"><ellipse rx="12" ry="5" fill="#2f6fd6"/><ellipse rx="9" ry="3" fill="#cfe6f7"/></g><g transform="translate(150 280)"><circle r="7" fill="#e8475a"/><path d="M-6 -2 q6 4 12 0 M-4 4 q4 -6 8 -2" stroke="#fff" stroke-width="1" fill="none"/></g>`;
return s+'</svg>';}};
})();
