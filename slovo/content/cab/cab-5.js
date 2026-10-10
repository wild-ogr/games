/* Кабинет 5 «Актовый зал» (CAB-2). Хор Нины Аркадьевны, сцена лиги «Соседки». 400×300.
   ZB_CAB[5].svg(lvl,r): lvl 1 — разруха, 2 — ремонт, 3 — «как новенький». r — preserveAspectRatio (по умолчанию xMidYMid slice). См. README-2.md. */
(function(){var C=window.ZB_CAB=window.ZB_CAB||{},k=0;
// бюст героя в системе 200×200 (как headSvg Покера / zinaSVG): o — приметы, m — настроение
function bust(o,m,u){var sk=o.skin||'#f5c9a8',sk2=o.skin2||'#e9ae88';
 var eyes=m==='happy'?'<path d="M75 96 q8 -8 16 0 M109 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.6" fill="none" stroke-linecap="round"/>'
  :'<ellipse cx="83" cy="96" rx="4.4" ry="5" fill="#3a2a22"/><ellipse cx="117" cy="96" rx="4.4" ry="5" fill="#3a2a22"/><circle cx="84.4" cy="94.4" r="1.4" fill="#fff"/><circle cx="118.4" cy="94.4" r="1.4" fill="#fff"/>';
 var mouth=m==='sing'?'<ellipse cx="100" cy="125" rx="9" ry="10" fill="'+(o.lip||'#b83b44')+'"/><ellipse cx="100" cy="129" rx="5" ry="4" fill="#e0707a"/>'
  :m==='happy'?'<path d="M84 119 q16 19 32 0 q-16 6 -32 0z" fill="'+(o.lip||'#b83b44')+'"/><path d="M89 123 q11 6 22 0" fill="#fff" opacity=".9"/>'
  :'<path d="M86 121 q14 13 28 0" stroke="'+(o.lip||'#b83b44')+'" stroke-width="4.2" fill="none" stroke-linecap="round"/>';
 return `<defs><radialGradient id="f${u}" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe2cc"/><stop offset="1" stop-color="${sk}"/></radialGradient></defs>
 ${o.back||''}<path d="M28 200 q4 -46 44 -54 h56 q40 8 44 54z" fill="${o.body}"/>${o.bodyX||''}
 <rect x="88" y="128" width="24" height="22" rx="8" fill="${sk2}"/><circle cx="53" cy="104" r="8" fill="${sk}"/><circle cx="147" cy="104" r="8" fill="${sk}"/>
 <ellipse cx="100" cy="98" rx="47" ry="50" fill="url(#f${u})"/>${o.hair||''}
 <ellipse cx="70" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".45"/><ellipse cx="130" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".45"/>
 <path d="M72 82 q10 -6 20 -1 M108 81 q10 -5 20 1" stroke="${o.brow||'#6d5a4a'}" stroke-width="4" fill="none" stroke-linecap="round"/>${eyes}${o.glasses||''}
 <path d="M100 100 q-5 12 -1 15 q4 2 7 -1" stroke="${sk2}" stroke-width="3" fill="none" stroke-linecap="round"/>${mouth}${o.face||''}`;}
// Нина Аркадьевна (родная соседка из «Соседок»): высокий платиновый начёс, красная помада, сиреневое платье, брошь-нотка
var NINA={body:'#7b3fa0',lip:'#d0213a',brow:'#b7a57a',
 bodyX:'<path d="M84 146 l16 18 l16 -18" fill="#9b5fc0"/><g transform="translate(130 172)"><circle r="9" fill="#f5b72d" stroke="#b9860f" stroke-width="1.5"/><path d="M4 0 v-20 l12 4" stroke="#b9860f" stroke-width="3.5" fill="none"/></g>',
 hair:'<circle cx="100" cy="30" r="30" fill="#efe4c4"/><path d="M48 112 q-12 -66 52 -72 q64 6 52 72 q-4 -32 -20 -40 q-20 12 -64 0 q-16 8 -20 40z" fill="#efe4c4"/><path d="M70 22 q30 -18 60 0 M66 52 q34 -14 68 0" stroke="#d8c9a0" stroke-width="3" fill="none"/>',
 face:'<path d="M70 98 l-6 -3 M130 98 l6 -3" stroke="#3a2a22" stroke-width="2.4"/><circle cx="52" cy="116" r="4.5" fill="#f5b72d"/><circle cx="148" cy="116" r="4.5" fill="#f5b72d"/>'};

C[5]={id:'akt',c:'#f6e1b5',n:'Актовый зал',cls:5,who:'Нина Аркадьевна',d:'Сцена лиги «Соседки», итоги недели — концертом',
svg:function(L,r){L=Math.max(1,Math.min(3,L|0||1));r=r||'xMidYMid slice';var u='c5_'+(++k);
var W=L===1?['#b9b49a','#a49f86']:L===2?['#f3e6c8','#e6d4ae']:['#f6e1b5','#ecc98d'];
var cur=L===1?['#8a6d5e','#6e5446']:L===2?['#a8323e','#7e2230']:['#c8102e','#8c0c20'];
var s=`<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}">
<defs><linearGradient id="w${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${W[0]}"/><stop offset="1" stop-color="${W[1]}"/></linearGradient>
<linearGradient id="c${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${cur[0]}"/><stop offset=".5" stop-color="${cur[1]}"/><stop offset="1" stop-color="${cur[0]}"/></linearGradient>
<linearGradient id="fl${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L===1?'#8d7a63':'#b9824e'}"/><stop offset="1" stop-color="${L===1?'#6f5f4c':'#93602f'}"/></linearGradient>
<linearGradient id="sp${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".75"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#w${u})"/>`;
// стенные панели
s+=L===3?`<rect y="150" width="400" height="60" fill="#c9965a"/><path d="M0 150 H400" stroke="#f5b72d" stroke-width="3"/>`:`<rect y="160" width="400" height="50" fill="${L===1?'#7f8a6a':'#9cb38a'}"/><path d="M0 160 H400" stroke="${L===1?'#6b7558':'#7d9670'}" stroke-width="3"/>`;
// пол зала
s+=`<rect y="210" width="400" height="90" fill="url(#fl${u})"/><g stroke="${L===1?'#5d4f3f':'#7f5228'}" stroke-width="1.4" opacity=".7">${[222,236,252,270,290].map(y=>`<path d="M0 ${y} H400"/>`).join('')}</g>`;
// портал сцены
s+=`<rect x="44" y="14" width="312" height="196" rx="6" fill="${L===1?'#6f6550':L===2?'#e9d9b6':'#f5d78a'}"/>
<rect x="60" y="34" width="280" height="150" fill="${L===1?'#3d3a35':L===2?'#5a4a62':'#3e2a5c'}"/>`;
// задник сцены
if(L===3)s+=`<g fill="#f5b72d" opacity=".9">${[90,130,170,210,250,290,315].map((x,i)=>`<circle cx="${x}" cy="${50+(i%3)*14}" r="2.4"/>`).join('')}</g>
<g transform="translate(130 62)"><rect width="140" height="54" rx="6" fill="#fff8e6" stroke="#f5b72d" stroke-width="3"/>
<text x="70" y="17" text-anchor="middle" font-size="12" font-weight="700" fill="#8c0c20">ЛИГА «СОСЕДКИ»</text>
<text x="70" y="33" text-anchor="middle" font-size="8.6" fill="#3e2a5c">Подъезд → Двор → Улица</text><text x="70" y="45" text-anchor="middle" font-size="8.6" fill="#3e2a5c">→ Район → Город</text>
<g transform="translate(124 33) scale(.7)"><path d="M-9 0 h18 q0 14 -9 16 q-9 -2 -9 -16z" fill="#f5b72d" stroke="#b9860f" stroke-width="1.5"/><rect x="-3" y="15" width="6" height="6" fill="#b9860f"/><rect x="-8" y="21" width="16" height="4" rx="1" fill="#b9860f"/></g></g>`;
else if(L===2)s+=`<g transform="translate(140 64)"><rect width="120" height="34" rx="4" fill="#fff8e6"/><text x="60" y="15" text-anchor="middle" font-size="11" font-weight="700" fill="#7e2230">ХОР «РЯБИНУШКА»</text><text x="60" y="28" text-anchor="middle" font-size="8.5" fill="#5a4a62">репетиция по средам</text></g>`;
else s+=`<g transform="translate(150 76) rotate(-6)"><rect width="104" height="30" fill="#e8e2cc"/><text x="52" y="13" text-anchor="middle" font-size="9" font-weight="700" fill="#5d4f3f">ХОР ВРЕМЕННО</text><text x="52" y="25" text-anchor="middle" font-size="9" font-weight="700" fill="#5d4f3f">НЕ ПОЁТ</text></g>
<path d="M200 34 v18" stroke="#2a2723" stroke-width="1.2"/>`;
// прожекторы (ур.3)
if(L===3)s+=`<path d="M110 30 L70 184 H170z" fill="url(#sp${u})"/><path d="M290 30 L230 184 H330z" fill="url(#sp${u})"/>`;
// сцена
s+=`<rect x="40" y="184" width="320" height="10" fill="${L===1?'#7a6a52':'#b9824e'}"/><rect x="40" y="194" width="320" height="20" fill="${L===1?'#5f5240':'#8a5a2a'}"/>`;
if(L===3)s+=`<path d="M40 194 H360" stroke="#f5b72d" stroke-width="2.5"/>`;
if(L===1)s+=`<path d="M232 184 l10 6 l14 -2 l8 6 h-38z" fill="#2a2420"/><path d="M236 186 l-6 -12 M250 188 l4 -14" stroke="#7a6a52" stroke-width="4"/>`;
// пианино
s+=`<g transform="translate(${L===3?224:206} 128)"><rect width="66" height="56" rx="3" fill="${L===1?'#4a3a30':'#3a2418'}"/><rect x="0" y="22" width="66" height="8" fill="${L===1?'#d8d0bc':'#fffdf5'}"/>
<g fill="#222">${[6,14,26,34,42,54].map(x=>`<rect x="${x}" y="22" width="4" height="5"/>`).join('')}</g><rect x="6" y="4" width="54" height="14" rx="2" fill="${L===1?'#5a4a40':'#4b3020'}"/>
${L===1?'<path d="M-4 -2 q36 -8 74 2 l-4 30 q-30 -8 -64 2z" fill="#d8d4c8" opacity=".95"/><path d="M8 0 q10 14 6 26 M40 -2 q8 16 2 28" stroke="#bdb8aa" stroke-width="2" fill="none"/>':''}
${L===3?'<g transform="translate(8 -16)"><path d="M0 16 V4 M8 16 V0 M16 16 V4" stroke="#f5b72d" stroke-width="2.5"/><g fill="#ffd36b"><ellipse cx="0" cy="1" rx="2" ry="4"/><ellipse cx="8" cy="-3" rx="2" ry="4"/><ellipse cx="16" cy="1" rx="2" ry="4"/></g><rect x="-4" y="14" width="24" height="3" rx="1" fill="#b9860f"/></g><g transform="translate(46 -18)"><rect width="16" height="18" fill="#fff"/><path d="M3 5 h10 M3 9 h10 M3 13 h10" stroke="#888" stroke-width=".8"/></g>':''}</g>`;
// хоровые ступени и хор-силуэты (ур.2–3)
if(L>=2)s+=`<g transform="translate(130 150)"><rect width="140" height="12" fill="${L===3?'#5c3d7a':'#6b5a70'}"/><rect x="10" y="12" width="120" height="22" fill="${L===3?'#4a2f66':'#5a4a62'}"/></g>`;
if(L===3)s+=`<g>${[150,176,202,228,254].map((x,i)=>`<g transform="translate(${x} ${i%2?128:124})"><path d="M-10 30 q2 -14 10 -16 q8 2 10 16z" fill="${['#f5b72d','#3f8fe0','#e5484d','#2fa84f','#ff8a1f'][i]}"/><circle cy="6" r="8" fill="#f6c9a8"/><path d="M-8 4 q8 -12 16 0 q-8 -4 -16 0z" fill="${['#6b4a33','#d9dde3','#2d2016','#9c4a2e','#efe4c4'][i]}"/><ellipse cy="10" rx="2.4" ry="2.8" fill="#b83b44"/></g>`).join('')}</g>
<g fill="#3a2a22" font-size="14">${[[128,140,'♪'],[272,128,'♫'],[136,164,'♪']].map(a=>`<text x="${a[0]}" y="${a[1]}">${a[2]}</text>`).join('')}</g>`;
// занавес
if(L===1)s+=`<path d="M60 34 H120 q-6 40 6 84 q-8 30 -2 66 H60z" fill="url(#c${u})"/><path d="M340 34 H290 q8 30 -4 60 l14 24 l-10 20 l18 46 H340z" fill="url(#c${u})"/>
<path d="M60 34 H340 V46 q-20 8 -40 0 l-10 18 l-8 -16 q-60 10 -110 -2 l-12 10 l-6 -10 q-30 6 -54 0z" fill="${cur[1]}"/><g stroke="#4f3c32" stroke-width="2" opacity=".7"><path d="M76 40 v140 M96 40 v140 M312 50 v130 M326 46 v134"/></g>`;
else s+=`<path d="M60 34 H${L===3?118:112} q-10 70 ${L===3?-4:0} 150 H60z" fill="url(#c${u})"/><path d="M340 34 H${L===3?282:288} q10 70 ${L===3?4:0} 150 H340z" fill="url(#c${u})"/>
<g stroke="${cur[1]}" stroke-width="2.4" opacity=".8"><path d="M74 36 v148 M90 36 v148 M104 36 v148 M326 36 v148 M310 36 v148 M296 36 v148"/></g>
<path d="M56 30 H344 V52 ${Array.from({length:12},(_,i)=>`q-12 10 -24 0`).join(' ')} z" fill="${cur[0]}" transform="translate(0 0)"/>
${L===3?`<path d="M56 52 ${Array.from({length:12},()=> 'q12 10 24 0').join(' ')}" stroke="#f5b72d" stroke-width="3" fill="none"/><g fill="#f5b72d"><circle cx="118" cy="110" r="5"/><circle cx="282" cy="110" r="5"/></g><path d="M100 106 q10 6 18 4 M300 106 q-10 6 -18 4" stroke="#f5b72d" stroke-width="3" fill="none"/>`:''}`;
// Нина Аркадьевна дирижирует (ур.3) / сидит за пианино (ур.2)
if(L===3)s+=`<g transform="translate(122 120) scale(.36)">${bust(NINA,'sing',u+'n')}</g><path d="M196 150 l18 -24" stroke="#3a2a22" stroke-width="2.5" stroke-linecap="round"/><path d="M184 166 q8 -10 14 -16" stroke="#7b3fa0" stroke-width="7" stroke-linecap="round"/>`;
if(L===2)s+=`<g transform="translate(176 132) scale(.26)">${bust(NINA,'happy',u+'n')}</g>`;
// ведро под капелью и пятно на потолке (ур.1)
if(L===1)s+=`<ellipse cx="170" cy="8" rx="40" ry="10" fill="#8b8466" opacity=".6"/><g fill="#9cc3e6"><path d="M170 20 q-3 6 0 8 q3 -2 0 -8z"/><path d="M168 60 q-3 6 0 8 q3 -2 0 -8z"/></g>
<g transform="translate(156 162)"><path d="M0 0 h26 l-4 22 h-18z" fill="#8d98a6"/><ellipse cx="13" cy="0" rx="13" ry="3.5" fill="#6d7886"/><path d="M4 0 q9 -14 18 0" stroke="#6d7886" stroke-width="1.5" fill="none"/></g>
<g stroke="#5a5444" stroke-width="1.6" fill="none" opacity=".6"><path d="M372 20 l10 18 l-6 14 l12 22"/><path d="M14 60 l14 10 l-4 16"/></g>
<g stroke="#fff" stroke-width=".9" opacity=".7" fill="none"><path d="M356 14 l30 30 M356 30 l14 14 M372 14 l14 14 M356 14 q14 14 0 30 M356 14 q14 14 30 0"/></g>`;
// ряды кресел зала (передний план)
var row=function(y,n,sx,col,broken){var g='';for(var i=0;i<n;i++){var x=sx+i*38;if(broken&&broken.indexOf(i)>=0){g+=`<g transform="translate(${x} ${y+12}) rotate(${i%2?14:-10})"><rect width="30" height="14" rx="3" fill="${col[1]}"/></g>`;continue;}
 g+=`<g transform="translate(${x} ${y})"><rect width="32" height="30" rx="6" fill="${col[0]}"/><rect x="3" y="3" width="26" height="18" rx="5" fill="${col[1]}"/>${L===3?'<circle cx="16" cy="25" r="2" fill="#f5b72d"/>':''}</g>`;}return g;};
var cc=L===1?['#5f5a4d','#7c7563']:L===2?['#6d3a2a','#9a4a3a']:['#7a0f20','#c8102e'];
s+=L===1?row(246,10,6,cc,[2,3,7])+`<g transform="translate(300 222)"><rect width="46" height="10" rx="2" fill="#5f5a4d" transform="rotate(-12)"/><rect x="10" y="-12" width="46" height="10" rx="2" fill="#7c7563" transform="rotate(8)"/></g>`
 :row(240,10,6,cc)+row(268,10,-12,cc);
// табличка над порталом
s+=`<g transform="translate(200 ${L===1?6:4})"><rect x="-58" y="0" width="116" height="${L===1?0:0}" fill="none"/></g>`;
if(L===3)s+=`<g>${Array.from({length:15},(_,i)=>{var x=10+i*27,y=8+Math.sin(i*1.1)*3;return `<path d="M${x} ${y} l13 0 l-6.5 12z" fill="${['#e5484d','#f5b72d','#3f8fe0','#2fa84f'][i%4]}"/>`;}).join('')}<path d="M0 8 Q200 16 400 8" stroke="#8c0c20" stroke-width="1.5" fill="none"/></g>`;
s+='</svg>';return s;}};
})();
