/* Кабинет 2 «Столовая тёти Вали» (CAB-1). Три состояния 400×300: 1 — «Закрыто на учёт», 2 — ремонт, буфет заработал, 3 — «как новенькая», полный буфет.
   Подключение: ZB.load('content/cab/cab-2.js').then(()=>el.innerHTML=ZB_CAB[2].svg(lv)) — см. README-1.md.
   Герой: тётя Валя из «Гастронома» (облик 1:1 с drawPerson(g,'valya') — белый халат на пуговицах, рыжие кудри, белая наколка-кокошник, жёлтые серьги, красные губы). */
(function(){var A=window.ZB_CAB=window.ZB_CAB||{},k=0;
/* тётя Валя по пояс: перенос canvas-рисунка drawPerson('valya') в SVG, единица = h/100; (0,0) — низ плеч по центру */
function valya(x,y,s,mood,u){var SK='#f2c9a7',hy=-60,ey=-61;
var eyes=mood>0?'<path d="M-9.5 -59.5 a3 3 0 0 1 6 0 M3.5 -59.5 a3 3 0 0 1 6 0" stroke="#2b1d14" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
:'<ellipse cx="-6.5" cy="-61" rx="2.3" ry="2.6" fill="#2b1d14"/><ellipse cx="6.5" cy="-61" rx="2.3" ry="2.6" fill="#2b1d14"/><circle cx="-5.8" cy="-61.9" r=".8" fill="#fff"/><circle cx="7.2" cy="-61.9" r=".8" fill="#fff"/>';
var mouth=mood>0?'<path d="M-5.3 -50.6 a6 6 0 0 0 10.6 0" stroke="#c0392b" stroke-width="2" fill="none" stroke-linecap="round"/>'
:'<path d="M-4 -49 q4 2.5 8 0" stroke="#c0392b" stroke-width="2" fill="none" stroke-linecap="round"/>';
return `<g transform="translate(${x} ${y}) scale(${s})">
<defs><linearGradient id="vc${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cecece"/><stop offset=".33" stop-color="#fbfbfb"/><stop offset=".66" stop-color="#e7e7e7"/><stop offset="1" stop-color="#b5b5b5"/></linearGradient>
<linearGradient id="vf${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dab596"/><stop offset=".5" stop-color="${SK}"/><stop offset="1" stop-color="#d0ad8f"/></linearGradient></defs>
<path d="M-38 12 L-36 -20 Q-34 -36 -14 -38 L14 -38 Q34 -36 36 -20 L38 12z" fill="url(#vc${u})"/>
<path d="M0 -36 V12" stroke="#d9d9d9" stroke-width="1.5"/><circle cx="4" cy="-24" r="1.8" fill="#c9c9c9"/><circle cx="4" cy="-12" r="1.8" fill="#c9c9c9"/><circle cx="4" cy="0" r="1.8" fill="#c9c9c9"/>
<path d="M-12 -38 L0 -26 L12 -38z" fill="${SK}"/>
<rect x="-6" y="-48" width="12" height="12" fill="#d5b193"/>
<g fill="#b5523b">${[[-17,-10,8],[17,-10,8],[-19,2,7],[19,2,7],[-12,-18,8],[12,-18,8],[0,-21,9]].map(a=>`<circle cx="${a[0]}" cy="${hy+a[1]}" r="${a[2]}"/>`).join('')}</g>
<ellipse cx="0" cy="${hy}" rx="17" ry="19" fill="url(#vf${u})"/><ellipse cx="-17" cy="${hy+1}" rx="3" ry="4.5" fill="#dab596"/><ellipse cx="17" cy="${hy+1}" rx="3" ry="4.5" fill="#dab596"/>
<ellipse cx="0" cy="${hy-18}" rx="19" ry="8" fill="#fff"/><g fill="#fff">${[-3,-2,-1,0,1,2,3].map(i=>`<circle cx="${i*5.5}" cy="${hy-24}" r="3.4"/>`).join('')}</g><ellipse cx="0" cy="${hy-18}" rx="15" ry="5" fill="none" stroke="#e3e3e3"/>
<circle cx="-17" cy="${hy+6}" r="2" fill="#f1c40f"/><circle cx="17" cy="${hy+6}" r="2" fill="#f1c40f"/>
${eyes}<path d="M-9.5 -67.5 L-4 -68 M9.5 -67.5 L4 -68" stroke="rgba(60,40,30,.6)" stroke-width="1.4" stroke-linecap="round"/>
<ellipse cx="-10" cy="-54" rx="4" ry="2.6" fill="rgba(230,110,100,.35)"/><ellipse cx="10" cy="-54" rx="4" ry="2.6" fill="rgba(230,110,100,.35)"/>
<path d="M0 -59 q2.5 4 -.5 5" stroke="#a98d75" stroke-width="1.4" fill="none" stroke-linecap="round"/>${mouth}</g>`;}
/* пирожок-монета */
function pie(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s||1})"><path d="M-9 2 q0 -9 9 -9 q9 0 9 9z" fill="#e3a24e"/><path d="M-9 2 h18" stroke="#b9742c" stroke-width="1.6"/><path d="M-5 -3 l2 2 M0 -5 l0 3 M5 -3 l-2 2" stroke="#b9742c" stroke-width="1.2"/><ellipse cx="-3" cy="-4" rx="2.4" ry="1.2" fill="#f6cf8a"/></g>`;}
function glass(x,y,c){return `<g transform="translate(${x} ${y})"><path d="M0 0 h10 l-1 14 h-8z" fill="${c}" opacity=".85"/><path d="M0 0 h10 l-1 14 h-8z" fill="none" stroke="#fff" stroke-width=".8" opacity=".8"/><path d="M2 2 v10 M5 2 v10 M8 2 v10" stroke="#fff" stroke-width=".5" opacity=".5"/></g>`;}
/* стол со стульями; up — стулья перевёрнуты на столе */
function table(x,y,up,flw,dirty){var t=`<g transform="translate(${x} ${y})">`;
if(!up)t+=`<g fill="#c8643c"><rect x="-8" y="-4" width="8" height="30" rx="2"/><rect x="-10" y="12" width="14" height="4"/><rect x="-8" y="16" width="3" height="18"/><rect x="88" y="-4" width="8" height="30" rx="2"/><rect x="84" y="12" width="14" height="4"/><rect x="93" y="16" width="3" height="18"/></g>`;
t+=`<rect x="0" y="6" width="88" height="7" rx="2" fill="${dirty?'#b8b0a0':'#f0eee8'}"/><rect x="0" y="12" width="88" height="3" fill="${dirty?'#8e8678':'#c9c3b5'}"/><rect x="6" y="15" width="4" height="22" fill="#666"/><rect x="78" y="15" width="4" height="22" fill="#666"/>`;
if(up)t+=`<g fill="#a0573a"><g transform="translate(8 6) rotate(180 12 -10)"><rect x="0" y="-26" width="24" height="4"/><rect x="0" y="-22" width="3" height="20"/><rect x="21" y="-22" width="3" height="20"/><rect x="0" y="-44" width="4" height="18"/></g><g transform="translate(54 6) rotate(180 12 -10)"><rect x="0" y="-26" width="24" height="4"/><rect x="0" y="-22" width="3" height="20"/><rect x="21" y="-22" width="3" height="20"/><rect x="20" y="-44" width="4" height="18"/></g></g>`;
if(flw)t+=`<g transform="translate(44 6)"><path d="M-4 0 h8 l-1 -10 h-6z" fill="#cfe6f7"/><path d="M0 -10 l-5 -8 M0 -10 l0 -10 M0 -10 l5 -8" stroke="#4f9a4a" stroke-width="1.3"/><circle cx="-5" cy="-19" r="3" fill="#f5b72d"/><circle cx="0" cy="-22" r="3.2" fill="#fff"/><circle cx="5" cy="-19" r="3" fill="#e86a9a"/></g>${glass(16,-8,'#c0392b')}${glass(64,-8,'#e8a13a')}${pie(30,4,.8)}`;
return t+'</g>';}
A[2]={id:'stolovaya',n:'Столовая тёти Вали',c:'#fdf0dc',svg:function(lv,r){lv=lv||1;var u='c2_'+(++k);r=r||'xMidYMid slice';
var L1=lv===1,L3=lv===3;
var wall=L1?'#d9cfba':'#fbf3e0',tile=L1?'#b9c6c4':'#bfe0e8',tile2=L1?'#a7b3b1':'#a6d0dc',fl=L1?'#9a917e':'#c9b48e';
var s=`<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}">
<defs><linearGradient id="w${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L1?'#c9d3d6':'#bfe2fb'}"/><stop offset="1" stop-color="${L1?'#e2e6e4':'#f0f9ff'}"/></linearGradient>
<linearGradient id="v${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#d9eef7" stop-opacity=".35"/></linearGradient>
<linearGradient id="m${u}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8862a"/><stop offset=".45" stop-color="#ffe08a"/><stop offset="1" stop-color="#b8862a"/></linearGradient></defs>
<rect width="400" height="300" fill="${wall}"/>
<rect y="100" width="400" height="120" fill="${tile}"/>
<g stroke="${tile2}" stroke-width="1">${[112,124,136,148,160,172,184,196,208].map(y=>`<path d="M0 ${y} H400"/>`).join('')}${Array.from({length:34},(_,i)=>`<path d="M${i*12} 100 V220"/>`).join('')}</g>
<rect y="98" width="400" height="4" fill="${L1?'#8fa09e':'#6aa8ba'}"/>
<rect y="218" width="400" height="82" fill="${fl}"/>
<g fill="${L1?'#867d6c':'#b9a27a'}">${Array.from({length:40},(_,i)=>`<rect x="${(i%10)*40+((i/10|0)%2)*20}" y="${222+(i/10|0)*20}" width="18" height="18"/>`).join('')}</g>`;
if(L1)s+=`<path d="M120 110 l10 14 l-6 10 l8 14 M300 160 l-12 10 l6 12" stroke="#7d8a88" stroke-width="1.2" fill="none"/><path d="M40 0 q20 40 0 80" fill="none" stroke="#bfb4a0" stroke-width="10" opacity=".5"/>`;
/* окно с раздачей сверху: окно слева */
s+=`<g transform="translate(14 14)"><rect width="74" height="84" rx="2" fill="#fff"/><rect x="5" y="5" width="64" height="74" fill="url(#w${u})"/><path d="M37 5 V79 M5 34 H69" stroke="#fff" stroke-width="4"/>${L1?'<path d="M40 40 l16 22 M56 40 l-16 22" stroke="#9a9384" stroke-width="1.2"/>':'<path d="M8 74 q14 -20 30 -8 q14 -14 28 6z" fill="#9fd08a" opacity=".6"/>'}</g>`;
if(L3)s+=`<path d="M10 10 h82 v26 q-10 8 -20 0 q-10 8 -21 0 q-10 8 -21 0 q-10 8 -20 0z" fill="#f2f2f2"/><g fill="#e8475a">${[18,38,58,78].map(x=>`<circle cx="${x}" cy="20" r="3"/>`).join('')}</g><path d="M10 10 h82" stroke="#b07a4a" stroke-width="3"/>`;
/* меню и плакат */
var menu=L1?[]:L3?[['Щи','12'],['Котлета','15'],['Пюре','8'],['Компот','3'],['Пирожок','5']]:[['Щи','12'],['Компот','3'],['Пирожок','5']];
s+=`<g transform="translate(102 14)"><rect width="96" height="80" rx="3" fill="${L1?'#5a5f58':'#2e3a33'}"/><rect x="3" y="3" width="90" height="74" fill="none" stroke="${L1?'#777':'#a0703e'}" stroke-width="3"/>
<text x="48" y="18" font-size="11" font-weight="800" text-anchor="middle" fill="${L1?'#aaa':'#f5d48a'}">МЕНЮ</text>
${L1?'<text x="48" y="44" font-size="9" text-anchor="middle" fill="#bbb" font-style="italic">пусто…</text><path d="M20 58 q30 -6 56 4" stroke="#999" stroke-width="1" fill="none"/>'
:menu.map((m,i)=>`<text x="10" y="${32+i*10.5}" font-size="8.5" fill="#f3f6ef" font-style="italic">${m[0]}</text><text x="86" y="${32+i*10.5}" font-size="8.5" fill="#f3f6ef" text-anchor="end">${m[1]} к.</text>`).join('')}</g>`;
s+=L1?`<g transform="translate(214 18) rotate(-4)"><rect width="78" height="56" fill="#e6dcc6" stroke="#b9ad94"/><path d="M0 40 l20 16 h-20z" fill="#d9cfba"/><text x="39" y="22" font-size="8" text-anchor="middle" fill="#a08a7a">ХЛЕБА К ОБЕДУ</text><text x="39" y="34" font-size="8" text-anchor="middle" fill="#a08a7a">В МЕРУ БЕРИ</text></g>`
:`<g transform="translate(208 16)"><rect width="80" height="62" fill="#fff8e6" stroke="#e0c99a"/><text x="40" y="15" font-size="8.5" font-weight="800" text-anchor="middle" fill="#c0392b">ХЛЕБА К ОБЕДУ</text><text x="40" y="26" font-size="8.5" font-weight="800" text-anchor="middle" fill="#c0392b">В МЕРУ БЕРИ!</text>
<g transform="translate(40 46)"><ellipse rx="22" ry="9" fill="#d9964a"/><path d="M-14 -4 l4 6 M-4 -7 l4 6 M6 -7 l4 6" stroke="#a8682c" stroke-width="2"/></g></g>`;
/* вывеска «Буфет» */
s+=`<g transform="translate(306 16)"><rect width="80" height="26" rx="4" fill="${L1?'#b0a690':'#c0392b'}"/><text x="40" y="18" font-size="14" font-weight="800" text-anchor="middle" fill="${L1?'#ece4d0':'#fff6d8'}" letter-spacing="1">${L1?'БУ ЕТ':'БУФЕТ'}</text>${L3?'<g fill="#ffe08a">'+[8,24,40,56,72].map(x=>`<circle cx="${x}" cy="29" r="2"/>`).join('')+'</g>':''}</g>`;
if(L1)s+=`<path d="M318 42 l2 16 M376 42 l-2 16" stroke="#777" stroke-width="1"/><g transform="translate(310 58) rotate(3)"><rect width="76" height="26" fill="#fff" stroke="#c0392b" stroke-width="1.5"/><text x="38" y="11" font-size="7.5" text-anchor="middle" fill="#c0392b" font-weight="800">ЗАКРЫТО</text><text x="38" y="21" font-size="7.5" text-anchor="middle" fill="#c0392b" font-weight="800">НА УЧЁТ</text></g>`;
/* тётя Валя за раздачей */
if(!L1)s+=valya(318,150,1.05,L3?1:0,u);
/* раздача: прилавок со стеклом */
s+=`<rect x="96" y="${L1?150:148}" width="304" height="8" fill="${L1?'#9a9a94':'#c9ced1'}"/><rect x="100" y="158" width="300" height="56" fill="${L1?'#a88f6e':'#d48a4a'}"/>
<g stroke="${L1?'#8a7458':'#b56f36'}" stroke-width="2">${[150,200,250,300,350].map(x=>`<path d="M${x} 162 V210"/>`).join('')}</g>
<path d="M100 212 H400" stroke="${L1?'#776048':'#9a5a2a'}" stroke-width="4"/>
<path d="M104 118 h176 v32 h-176z" fill="url(#v${u})" stroke="#e6f4fa" stroke-width="1.5" opacity="${L1?.5:1}"/>${L1?'<path d="M180 118 l-12 16 l8 6 l-10 10" stroke="#fff" stroke-width="1.2" fill="none"/>':''}
<g transform="translate(110 140)">${L1?'<rect width="60" height="6" rx="2" fill="#b0b0aa"/><path d="M68 4 h40" stroke="#ccc" stroke-width="4" stroke-linecap="round"/>'
:`<rect width="${L3?90:60}" height="6" rx="2" fill="#e8e8e8"/>${(L3?[[8,0],[20,0],[32,0],[44,0],[56,0],[68,0],[80,0],[14,-7],[26,-7],[38,-7],[50,-7],[62,-7],[74,-7],[20,-14],[32,-14],[44,-14],[56,-14],[68,-14],[38,-21],[50,-21]]:[[8,0],[20,0],[32,0],[44,0],[26,-7]]).map(p=>pie(p[0],p[1]-1,.75)).join('')}
<g transform="translate(${L3?100:72} 0)">${(L3?[0,12,24,36,48,6,18,30,42]:[0,12]).map((x,i)=>glass(x,i>4?-26:-12,['#c0392b','#e8a13a','#d26a8a'][i%3])).join('')}</g>`}</g>`;
/* бак «Компот» / самовар */
s+=L1?`<g transform="translate(346 108)"><rect width="34" height="42" rx="3" fill="#9aa0a3"/><text x="17" y="22" font-size="6.5" text-anchor="middle" fill="#6a6f72">КОМ…</text><path d="M0 8 h34" stroke="#7d8386" stroke-width="2"/></g>`
:`<g transform="translate(376 148)"><ellipse cx="0" cy="0" rx="17" ry="4" fill="#8a5a1c"/><path d="M-14 0 q-4 -24 4 -36 h20 q8 12 4 36z" fill="url(#m${u})"/><path d="M-10 -36 h20 l-4 -6 h-12z" fill="#c9962e"/><circle cx="0" cy="-45" r="4" fill="#c9962e"/><path d="M-15 -26 q-8 2 -6 10 M15 -26 q8 2 6 10" stroke="#b8862a" stroke-width="2.4" fill="none"/><path d="M-6 -6 h-8 v4" stroke="#b8862a" stroke-width="2.4" fill="none"/>${L3?'<path d="M-4 -54 q-4 -6 0 -12 q4 -6 0 -12 M4 -54 q-4 -6 0 -12" stroke="#fff" stroke-width="1.8" fill="none" opacity=".7"/>':''}</g>`;
/* копилка буфета — табличка (функция кабинета: пирожки-монеты копятся) */
if(!L1)s+=`<g transform="translate(146 168)"><rect width="112" height="34" rx="6" fill="#fff8e6" stroke="#e0b25a" stroke-width="1.5"/><text x="56" y="14" font-size="8.5" text-anchor="middle" fill="#8a5a1c" font-weight="700">Пирожки копятся,</text><text x="56" y="26" font-size="8.5" text-anchor="middle" fill="#8a5a1c" font-weight="700">пока тебя нет!</text></g>`;
/* подносы стопкой */
s+=`<g transform="translate(108 ${L1?204:206})">${[0,4,8].map(y=>`<rect x="${L1?y/2:0}" y="${-y}" width="34" height="4" rx="1.5" fill="${L1?'#8c8478':'#7a9ab5'}"/>`).join('')}</g>`;
/* зал */
s+=L1?table(14,230,1,0,1)+table(250,250,1,0,1)+`<g transform="translate(150 280)"><ellipse cx="0" cy="0" rx="9" ry="5" fill="#8a8a8a"/><circle cx="8" cy="-3" r="4" fill="#8a8a8a"/><circle cx="9" cy="-7" r="2.4" fill="#b0a0a0"/><circle cx="10" cy="-3" r=".9" fill="#222"/><path d="M-9 0 q-10 -2 -14 6" stroke="#8a8a8a" stroke-width="1.4" fill="none"/></g>
<g transform="translate(232 100)"><ellipse cx="0" cy="0" rx="3" ry="2" fill="#333"/><ellipse cx="-2" cy="-2" rx="2.6" ry="1.4" fill="#cde" opacity=".8"/><ellipse cx="2" cy="-2" rx="2.6" ry="1.4" fill="#cde" opacity=".8"/><path d="M6 -4 q8 -6 4 4 q-4 8 6 6" stroke="#999" stroke-width=".6" fill="none" stroke-dasharray="2 2"/></g>
<path d="M400 0 L360 0 Q378 14 400 40z" fill="none" stroke="#aaa" stroke-width=".8"/><path d="M400 6 L372 0 M400 18 L382 2 M392 0 Q392 14 400 22" stroke="#aaa" stroke-width=".8" fill="none"/>`
:table(20,238,0,L3,0)+table(272,252,0,L3,0)+(L3?'':`<g transform="translate(160 262)"><rect width="22" height="30" fill="#d8d8d8"/><ellipse cx="11" cy="0" rx="11" ry="3" fill="#bfe0e8"/><path d="M0 8 h22" stroke="#bbb"/><path d="M26 30 l20 -60" stroke="#c8a06a" stroke-width="3"/><path d="M40 -32 h14 l-2 6 h-10z" fill="#e8e8e8"/></g>`);
return s+'</svg>';}};
})();
