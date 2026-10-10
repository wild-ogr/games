/* Кабинет 1 «Класс русского» (CAB-1). Три состояния 400×300: 1 — разруха, 2 — ремонт, 3 — «как новенькая».
   Подключение: ZB.load('content/cab/cab-1.js').then(()=>el.innerHTML=ZB_CAB[1].svg(lv)) — см. README-1.md.
   Герой: завуч Валентина Петровна (облик — sosFace(0) из slovo/js/sosedki.js: серый пучок, узкие очки, тёмно-синий жакет). */
(function(){var A=window.ZB_CAB=window.ZB_CAB||{},k=0;
/* Валентина Петровна во весь рост: лицо 1:1 как sosFace(0), (0,0) — у ног по центру, рост ≈250 ед. */
function vp(x,y,s,happy,clip){return `<g transform="translate(${x} ${y}) scale(${s}) translate(-50 -250)">
<path d="M40 232 h8 v18 h-8z M54 232 h8 v18 h-8z" fill="#c9a58a"/><path d="M36 248 h14 v4 h-14z M52 248 h14 v4 h-14z" fill="#2b2b2b"/>
<path d="M26 170 l-4 64 h58 l-4 -64z" fill="#24335a"/>
<path d="M14 182 q0 -82 36 -100 q36 18 36 100z" fill="#2f3f6b"/><path d="M43 82 l7 12 l7 -12z" fill="#fff"/><path d="M50 94 v74" stroke="#24335a" stroke-width="2"/>
<circle cx="50" cy="110" r="2.2" fill="#d9c27a"/><circle cx="50" cy="130" r="2.2" fill="#d9c27a"/><circle cx="50" cy="150" r="2.2" fill="#d9c27a"/>
${clip?`<path d="M20 112 q-6 30 10 50" stroke="#2f3f6b" stroke-width="12" fill="none" stroke-linecap="round"/><g transform="rotate(-8 38 150)"><rect x="24" y="126" width="30" height="40" rx="2" fill="#a0703e"/><rect x="27" y="131" width="24" height="33" fill="#fff"/><rect x="33" y="123" width="12" height="6" rx="2" fill="#9aa0a8"/><path d="M30 138 h18 M30 144 h18 M30 150 h12" stroke="#7a8db8" stroke-width="1.6"/><path d="M30 156 l3 3 l6 -7" stroke="#d7263d" stroke-width="2" fill="none"/></g><ellipse cx="44" cy="158" rx="5" ry="4" fill="#f6c9a8"/>`
:`<path d="M20 112 q-6 34 6 62" stroke="#2f3f6b" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="26" cy="176" r="5" fill="#f6c9a8"/>`}
<path d="M80 112 q8 34 -2 62" stroke="#2f3f6b" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="78" cy="176" r="5" fill="#f6c9a8"/>
<rect x="44" y="74" width="12" height="10" fill="#eab28f"/>
<circle cx="50" cy="20" r="10" fill="#6c7280"/>
<ellipse cx="50" cy="56" rx="25" ry="27" fill="#f6c9a8"/><circle cx="25" cy="58" r="5" fill="#f6c9a8"/><circle cx="75" cy="58" r="5" fill="#f6c9a8"/>
<ellipse cx="37" cy="66" rx="5.5" ry="3.5" fill="#f58f8f" opacity=".5"/><ellipse cx="63" cy="66" rx="5.5" ry="3.5" fill="#f58f8f" opacity=".5"/>
<path d="M25 56 q-2 -28 25 -30 q27 2 25 30 q-4 -16 -14 -19 q-8 7 -26 4 q-8 4 -10 15z" fill="#6c7280"/>
${happy?'<path d="M37 57 q4 -4 8 0 M55 57 q4 -4 8 0" stroke="#3a2a22" stroke-width="2.4" fill="none" stroke-linecap="round"/>':'<circle cx="41" cy="56" r="2.8" fill="#3a2a22"/><circle cx="59" cy="56" r="2.8" fill="#3a2a22"/><circle cx="41.8" cy="55.2" r=".9" fill="#fff"/><circle cx="59.8" cy="55.2" r=".9" fill="#fff"/>'}
<path d="M33 52 h14 v7 h-14z M53 52 h14 v7 h-14z" fill="rgba(200,225,255,.25)" stroke="#2b2b2b" stroke-width="2"/><path d="M47 55 h6" stroke="#2b2b2b" stroke-width="2"/>
<path d="M36 47 l9 2 M64 47 l-9 2" stroke="#4b505c" stroke-width="2.6" stroke-linecap="round"/>
${happy?'<path d="M43 70 q7 7 14 0" stroke="#b83b44" stroke-width="2.6" fill="none" stroke-linecap="round"/>':'<path d="M44 72 q6 -1.5 12 0" stroke="#b83b44" stroke-width="2.6" fill="none" stroke-linecap="round"/>'}
</g>`;}
/* парта с лавкой; t — 'ok' | 'new' | 'bad' (перевёрнута) */
function desk(x,y,t,s){s=s||1;var top=t==='new'?'#4f8a5a':'#6f8f63',leg=t==='new'?'#3b3b3b':'#555';
if(t==='bad')return `<g transform="translate(${x} ${y}) scale(${s}) rotate(172 40 18)"><rect x="0" y="0" width="80" height="8" rx="2" fill="#7a8a6a"/><rect x="4" y="8" width="5" height="30" fill="#555"/><rect x="71" y="8" width="5" height="22" fill="#555"/><path d="M76 30 l8 6" stroke="#555" stroke-width="5"/></g>`;
return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="0" y="0" width="80" height="9" rx="2" fill="${top}"/><rect x="2" y="9" width="76" height="16" fill="${t==='new'?'#cfa66b':'#a88a5c'}"/><rect x="6" y="25" width="5" height="22" fill="${leg}"/><rect x="69" y="25" width="5" height="22" fill="${leg}"/><rect x="-4" y="30" width="88" height="6" rx="2" fill="${t==='new'?'#cfa66b':'#a88a5c'}"/>${t==='new'?'<path d="M14 4 h22" stroke="#fff" stroke-width="2" opacity=".35"/><g transform="translate(46 -6) rotate(-6)"><rect width="22" height="15" fill="#fff" stroke="#c7d3e6"/><path d="M0 4 h22 M0 8 h22 M0 12 h22 M5 0 v15 M11 0 v15 M17 0 v15" stroke="#c7d3e6" stroke-width=".6"/></g>':''}</g>`;}
A[1]={id:'russkij',n:'Класс русского',c:'#e8f0e2',svg:function(lv,r){lv=lv||1;var u='c1_'+(++k);r=r||'xMidYMid slice';
var L1=lv===1,L3=lv===3;
var up=L1?'#d6ccb6':'#f4efe2',pan=L1?'#8e9a84':'#6fae8a',pan2=L1?'#7d8873':'#5d9a77',fl=L1?'#9b8466':'#b98a55';
var s=`<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}">
<defs><linearGradient id="b${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L1?'#4c5a4e':'#2f5a43'}"/><stop offset="1" stop-color="${L1?'#3d473f':'#244a36'}"/></linearGradient>
<linearGradient id="g${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L1?'#c9d6dc':'#bfe2fb'}"/><stop offset="1" stop-color="${L1?'#e4e8e6':'#eef8ff'}"/></linearGradient>
<linearGradient id="f${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fl}"/><stop offset="1" stop-color="${L1?'#7d6a50':'#a2733f'}"/></linearGradient></defs>
<rect width="400" height="300" fill="${up}"/>
<rect y="140" width="400" height="90" fill="${pan}"/><path d="M0 140 H400" stroke="${pan2}" stroke-width="4"/>
<rect y="226" width="400" height="74" fill="url(#f${u})"/>
<g stroke="${L1?'#6e5c45':'#94673a'}" stroke-width="1.4">${[240,256,274,296].map(y=>`<path d="M0 ${y} H400"/>`).join('')}${[[40,226,240],[150,240,256],[260,226,240],[90,256,274],[320,256,274],[200,274,296],[30,274,296],[360,226,240]].map(a=>`<path d="M${a[0]} ${a[1]} V${a[2]}"/>`).join('')}</g>
<rect y="222" width="400" height="6" fill="${L1?'#6d5a44':'#7c5534'}"/>`;
/* окно слева */
s+=`<g transform="translate(16 36)"><rect width="70" height="104" rx="2" fill="#fff"/><rect x="5" y="5" width="60" height="94" fill="url(#g${u})"/><path d="M35 5 V99 M5 40 H65" stroke="#fff" stroke-width="4"/>
${L1?`<path d="M38 44 l10 14 l-6 4 l12 16 M48 58 l9 -6" stroke="#fff" stroke-width="1.3" fill="none"/><path d="M8 8 l24 30 M32 8 l-24 30" stroke="#d8c27a" stroke-width="5" opacity=".9"/><rect x="38" y="8" width="24" height="29" fill="#e9e3cf"/><path d="M41 13 h18 M41 17 h18 M41 21 h12 M41 26 h18 M41 30 h14" stroke="#9a9384" stroke-width="1.3"/>`
:`<path d="M10 90 q12 -18 28 -6 q14 -16 26 4z" fill="#9fd08a" opacity=".6"/>`}
<rect x="-5" y="102" width="80" height="7" rx="2" fill="#efe7d8"/></g>`;
if(L3)s+=`<path d="M8 30 q8 60 4 112 h14 q4 -60 -6 -112z M94 30 q-8 60 -4 112 h-14 q-4 -60 6 -112z" fill="#e5a0a0"/><path d="M6 28 H96" stroke="#b07a4a" stroke-width="4" stroke-linecap="round"/>
<g transform="translate(22 124)"><path d="M0 0 h16 l-3 14 h-10z" fill="#c8643c"/><circle cx="4" cy="-4" r="6" fill="#4f9a4a"/><circle cx="12" cy="-6" r="6" fill="#5aa04a"/><circle cx="6" cy="-10" r="4.5" fill="#e8475a"/><circle cx="12" cy="-12" r="4" fill="#ef6b7c"/></g>
<g transform="translate(58 124)"><path d="M0 0 h16 l-3 14 h-10z" fill="#c8643c"/><circle cx="8" cy="-6" r="8" fill="#4f9a4a"/><circle cx="4" cy="-10" r="4" fill="#e8475a"/><circle cx="11" cy="-12" r="4" fill="#e8475a"/></g>`;
if(L1)s+=`<g transform="translate(62 126)"><ellipse cx="10" cy="10" rx="10" ry="7" fill="#9aa0aa"/><circle cx="18" cy="2" r="5" fill="#8a909a"/><path d="M22 2 l5 1 l-5 2z" fill="#e8a13a"/><circle cx="19" cy="1" r="1.2" fill="#222"/><path d="M2 12 l-8 2 l8 2z" fill="#7a808a"/><path d="M14 6 q-4 6 2 8" stroke="#6ab2a6" stroke-width="2" fill="none"/></g>`;
/* портреты (ур.2–3) */
if(!L1){var por=function(x,kind){return `<g transform="translate(${x} 4)"><ellipse cx="17" cy="20" rx="17" ry="20" fill="#c9a24a"/><ellipse cx="17" cy="20" rx="13.5" ry="16.5" fill="#efe6cf"/>
${kind?'<path d="M7 34 q10 -12 20 0z" fill="#333"/><circle cx="17" cy="18" r="7" fill="#f2c9a7"/><path d="M9 18 q-1 -12 8 -11 q9 -1 8 11 q-2 -6 -8 -6 q-6 0 -8 6z" fill="#3a2a22"/><path d="M10 16 q-2 6 1 10 M24 16 q2 6 -1 10" stroke="#3a2a22" stroke-width="2.4" fill="none"/>'
:'<path d="M7 34 q10 -12 20 0z" fill="#4a4a5a"/><circle cx="17" cy="17" r="7" fill="#f2c9a7"/><path d="M10 15 q0 -8 7 -8 q7 0 7 8 q-3 -4 -7 -4 q-4 0 -7 4z" fill="#999"/><path d="M11 21 q6 10 12 0 q-6 3 -12 0z" fill="#bbb"/>'}</g>`;};
s+=por(L3?160:183,1)+(L3?por(206,0):'');}
/* доска */
s+=`<g transform="translate(110 ${L3?60:54}) ${L1?'rotate(2.5 90 45)':''}">
${L3?`<rect x="-14" y="-10" width="208" height="112" rx="4" fill="#c9a24a"/><rect x="-10" y="-6" width="200" height="104" rx="3" fill="#f1d27a"/>${[[-12,8],[-12,40],[-12,72],[182,8],[182,40],[182,72]].map(p=>`<rect x="${p[0]}" y="${p[1]}" width="10" height="18" rx="1.5" fill="#fff6dc" stroke="#b9860f" stroke-width="1"/><path d="M${p[0]+5} ${p[1]+5} l1.4 3 h3 l-2.4 2 l1 3 l-3 -2 l-3 2 l1 -3 l-2.4 -2 h3z" fill="#d7263d" transform="scale(1)"/>`).join('')}`:''}
<rect x="-4" y="-4" width="188" height="98" rx="2" fill="${L1?'#8a7458':'#a0703e'}"/>
<rect width="180" height="90" fill="url(#b${u})"/>
${L1?`<path d="M120 0 l-14 30 l10 8 l-20 52" stroke="#2a312b" stroke-width="2.4" fill="none"/>
<g fill="#e9efe6" font-size="15" font-weight="700" font-style="italic" opacity=".85"><text x="14" y="30">ШКОЛА ЗАКРЫТА</text></g>
<g fill="#e9efe6" font-size="10" font-style="italic" opacity=".7"><text x="16" y="56">Зина, не открывай!</text><text x="16" y="74">— Открою! Зина</text></g>
<path d="M150 74 q8 -6 14 2 q6 -6 12 0" stroke="#e9efe6" stroke-width="1.6" fill="none" opacity=".6"/><path d="M0 0 q40 20 90 6 q50 -8 90 16 V0z" fill="#8f9a84" opacity=".25"/>`
:`<g fill="#f3f6ef" font-style="italic"><text x="12" y="18" font-size="10" opacity=".85">Классная работа</text>
<text x="90" y="44" font-size="11" text-anchor="middle" opacity=".9">Слово дня:</text>
<text x="90" y="70" font-size="${L3?22:20}" font-weight="800" text-anchor="middle" letter-spacing="1">${L3?'ПЯТЁРКА':'РЕМОНТ'}</text></g>
<path d="M50 76 q40 6 80 0" stroke="#f3f6ef" stroke-width="1.6" fill="none" opacity=".7"/>${L3?'<g transform="translate(154 30)" fill="none" stroke="#ff8a8a" stroke-width="2.4"><path d="M2 0 h10 M2 0 l-2 10 q8 -4 10 4 q0 8 -10 6"/></g>':''}`}
<rect x="10" y="90" width="160" height="5" fill="${L1?'#7a6448':'#8a5a30'}"/>${L1?'':'<rect x="30" y="86" width="12" height="4" fill="#fff"/><rect x="128" y="85" width="20" height="5" rx="1" fill="#6b4a2a"/>'}</g>`;
/* азбука над доской / плакат */
if(L3)s+=`<g transform="translate(318 40)"><rect width="66" height="50" rx="2" fill="#fff" stroke="#d7cfbd"/><text x="33" y="16" font-size="9" text-anchor="middle" fill="#d7263d" font-weight="800">ЖИ–ШИ</text><text x="33" y="29" font-size="8" text-anchor="middle" fill="#333">пиши с буквой</text><text x="33" y="44" font-size="14" text-anchor="middle" fill="#2f6fd6" font-weight="800">И</text></g>`;
else if(!L1)s+=`<g transform="translate(316 40) rotate(-3)"><rect width="62" height="40" fill="#fff" stroke="#d7cfbd"/><text x="31" y="16" font-size="8" text-anchor="middle" fill="#333">Окрашено!</text><text x="31" y="30" font-size="7.5" text-anchor="middle" fill="#888">не прислоняться</text></g>`;
else s+=`<path d="M316 30 l20 30 l-8 6 l14 30" stroke="#a89a80" stroke-width="1.6" fill="none"/><path d="M300 150 h40 v24 h-40z" fill="#b1a487"/><g stroke="#9a7a5c" stroke-width="1.2"><path d="M300 158 h40 M300 166 h40 M310 150 v8 M330 158 v8 M318 166 v8"/></g>
<path d="M400 0 L360 0 Q378 14 400 40z" fill="none" stroke="#bbb" stroke-width=".8"/><path d="M400 6 L372 0 M400 18 L382 2 M392 0 Q392 14 400 22" stroke="#bbb" stroke-width=".8" fill="none"/>
<path d="M8 0 Q20 10 0 28" stroke="#bbb" stroke-width=".8" fill="none"/>`;
/* лампа */
s+=L1?`<path d="M350 0 V20" stroke="#555" stroke-width="1.2"/><ellipse cx="350" cy="24" rx="4" ry="5" fill="#ddd"/><path d="M366 0 v6 m0 6 v2" stroke="#7aa7c9" stroke-width="2.4" stroke-linecap="round"/><path d="M366 22 q-2 4 0 5 q2 -1 0 -5z" fill="#7aa7c9"/>`
:`<path d="M350 0 V14" stroke="#555" stroke-width="1.5"/><path d="M334 26 q16 -16 32 0z" fill="${L3?'#f1d27a':'#e8e8e8'}"/>${L3?'<ellipse cx="350" cy="28" rx="10" ry="3" fill="#fff6c8"/>':''}`;
/* стол учителя */
s+=`<g transform="translate(${L1?246:244} 168)"><rect width="110" height="10" rx="2" fill="${L1?'#8a6a48':'#a86f3c'}"/><rect x="4" y="10" width="40" height="48" fill="${L1?'#7a5c3e':'#93602f'}"/><rect x="66" y="10" width="40" height="${L1?32:48}" fill="${L1?'#7a5c3e':'#93602f'}"/>${L1?'<path d="M66 42 l40 -6" stroke="#5a4028" stroke-width="2"/>':'<rect x="10" y="18" width="28" height="12" rx="2" fill="#b67c46"/><circle cx="24" cy="24" r="2" fill="#f5d48a"/>'}
${L3?`<g transform="translate(14 -14)"><circle cx="0" cy="0" r="12" fill="#5aa0e0"/><path d="M-8 -6 q6 4 2 10 q6 2 6 6 M2 -11 q6 6 10 2" stroke="#7ac46a" stroke-width="4" fill="none"/><path d="M-14 6 l0 12 h28" stroke="#b9860f" stroke-width="2" fill="none"/></g>
<g transform="translate(86 -6)"><path d="M-6 6 h12 l-2 14 h-8z" fill="#c9e3f5" opacity=".9"/><path d="M0 6 l-6 -14 M0 6 l0 -18 M0 6 l6 -14" stroke="#4f9a4a" stroke-width="1.6"/><circle cx="-6" cy="-10" r="4" fill="#f5b72d"/><circle cx="0" cy="-15" r="4.5" fill="#d7263d"/><circle cx="6" cy="-10" r="4" fill="#e86a9a"/></g>`
:!L1?'<g transform="translate(70 -8)"><rect width="26" height="8" fill="#e04a3a"/><rect y="-5" width="26" height="5" fill="#2f6fd6"/></g>':'<rect x="20" y="-4" width="18" height="4" fill="#d9cdb3"/>'}</g>`;
/* ученические парты */
if(L1)s+=desk(20,226,'bad',1)+desk(130,232,'ok',1)+`<g transform="translate(150 230) rotate(12)"><rect width="20" height="6" fill="#a88a5c"/><rect x="2" y="6" width="4" height="18" fill="#555"/></g>
<g transform="translate(236 236)"><path d="M0 0 h30 l-4 36 h-22z" fill="#8f979e"/><ellipse cx="15" cy="0" rx="15" ry="4" fill="#6f777e"/><ellipse cx="15" cy="1" rx="12" ry="2.6" fill="#7aa7c9"/><path d="M2 2 q13 -14 26 0" stroke="#6f777e" stroke-width="1.6" fill="none"/></g>
<path d="M300 300 l24 -30 l20 6 l18 -20" stroke="#6d5a44" stroke-width="3" fill="none"/>
<g fill="#e9e3cf" transform="translate(70 284) rotate(-8)"><rect width="34" height="10"/><path d="M3 3 h28 M3 6 h20" stroke="#9a9384" stroke-width=".8"/></g>`;
else s+=desk(14,234,'new',1)+desk(120,240,'new',1);
/* стремянка, краска (ур.2) */
if(lv===2)s+=`<g transform="translate(330 140)"><path d="M0 100 L18 0 L36 100" stroke="#b9b9b9" stroke-width="5" fill="none"/>${[25,50,75].map(y=>`<path d="M${y*.18+2} ${y} H${36-y*.18-2}" stroke="#b9b9b9" stroke-width="4"/>`).join('')}</g>
<g transform="translate(300 252)"><path d="M0 0 h24 l-2 26 h-20z" fill="#d8d8d8"/><ellipse cx="12" cy="0" rx="12" ry="3.5" fill="#6fae8a"/><path d="M6 0 q-3 8 -1 14" stroke="#6fae8a" stroke-width="3" fill="none"/></g>
<g transform="translate(250 280) rotate(-10)"><rect width="34" height="10" rx="5" fill="#6fae8a"/><rect x="34" y="3" width="20" height="4" fill="#888"/></g>`;
/* Валентина Петровна: ур.2 — проверяет ремонт со списком, ур.3 — довольна */
if(lv===2)s+=vp(280,272,.5,0,1);
if(L3)s+=vp(372,276,.48,1,0)+`<g transform="translate(330 240)"><rect width="28" height="20" rx="3" fill="#fff" stroke="#b9860f"/><text x="14" y="15" font-size="13" text-anchor="middle" fill="#d7263d" font-weight="800">5</text></g>`;
return s+'</svg>';}};
})();
