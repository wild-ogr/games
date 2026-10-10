/* Кабинет 6 «Спортзал» (CAB-2). Вход в «Перемены» (мини-игры). 400×300.
   ZB_CAB[6].svg(lvl,r): lvl 1 — разруха, 2 — ремонт, 3 — «как новенький». См. README-2.md. */
(function(){var C=window.ZB_CAB=window.ZB_CAB||{},k=0;
// кот Ять (как catSVG в slovo/js/text.js, система 120×120)
var YAT=`<ellipse cx="60" cy="112" rx="40" ry="6" fill="rgba(0,0,0,.12)"/><path d="M95 104 q24 -6 14 -30 q-4 -8 -10 -4 q6 10 0 22 q-6 8 -12 8z" fill="#f0a24c"/>
<path d="M28 110 q-6 -40 16 -56 h32 q22 16 16 56z" fill="#f5b060"/><path d="M42 70 q18 8 36 0 M40 84 q20 8 40 0 M40 98 q20 6 40 0" stroke="#e08a36" stroke-width="4" fill="none" opacity=".7"/>
<ellipse cx="60" cy="96" rx="14" ry="14" fill="#fff3e3"/><circle cx="60" cy="46" r="28" fill="#f5b060"/>
<path d="M36 34 l-4 -26 l20 14z M84 34 l4 -26 l-20 14z" fill="#f5b060"/><path d="M38 30 l-2 -15 l11 8z M82 30 l2 -15 l-11 8z" fill="#f7c9a8"/>
<path d="M48 24 l4 8 M60 20 v10 M72 24 l-4 8" stroke="#e08a36" stroke-width="3.5" stroke-linecap="round"/>
<path d="M44 46 q6 -5 12 0 M64 46 q6 -5 12 0" stroke="#3a2a22" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="60" cy="56" rx="12" ry="8" fill="#fff3e3"/><path d="M57 53 h6 l-3 4z" fill="#e0707a"/><path d="M60 57 q-3 5 -7 3 M60 57 q3 5 7 3" stroke="#3a2a22" stroke-width="1.8" fill="none"/>
<path d="M40 56 l-16 -3 M40 60 l-15 3 M80 56 l16 -3 M80 60 l15 3" stroke="#fff" stroke-width="1.6" opacity=".9"/>
<path d="M46 74 l14 6 l14 -6 l-4 10 l-10 -4 l-10 4z" fill="#1d4fa3"/><circle cx="60" cy="80" r="3.5" fill="#f5b72d"/>`;
var ball=function(x,y,R,flat){return flat?`<ellipse cx="${x}" cy="${y+R*.5}" rx="${R*1.2}" ry="${R*.5}" fill="#c96a2a"/><path d="M${x-R} ${y+R*.5} q${R} -${R*.4} ${R*2} 0" stroke="#5a2d10" stroke-width="1.4" fill="none"/>`
 :`<circle cx="${x}" cy="${y}" r="${R}" fill="#e8772e"/><path d="M${x-R} ${y} H${x+R} M${x} ${y-R} V${y+R} M${x-R*.7} ${y-R*.7} q${R*.6} ${R*.7} 0 ${R*1.4} M${x+R*.7} ${y-R*.7} q-${R*.6} ${R*.7} 0 ${R*1.4}" stroke="#5a2d10" stroke-width="1.3" fill="none"/>`;};
C[6]={id:'sport',c:'#e3f1ff',n:'Спортзал',cls:6,who:'кот Ять',d:'Вход в «Перемены» — мини-игры',
svg:function(L,r){L=Math.max(1,Math.min(3,L|0||1));r=r||'xMidYMid slice';var u='c6_'+(++k);
var W=L===1?['#a9b39a','#97a088']:L===2?['#e4eef6','#d2e1ec']:['#e3f1ff','#cfe6fb'];
var s=`<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}">
<defs><linearGradient id="w${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${W[0]}"/><stop offset="1" stop-color="${W[1]}"/></linearGradient>
<linearGradient id="fl${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L===1?'#9c8466':'#e2b071'}"/><stop offset="1" stop-color="${L===1?'#7d6850':'#c98f4c'}"/></linearGradient>
<linearGradient id="g${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#eaf6ff"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#w${u})"/>`;
// панель стены
s+=`<rect y="150" width="400" height="66" fill="${L===1?'#6f8a6a':L===2?'#5d9bd1':'#3f8fe0'}"/><path d="M0 150 H400" stroke="${L===1?'#5b7356':'#2f6fb0'}" stroke-width="3"/>`;
if(L===1)s+=`<g fill="${W[0]}">${[[30,156,22,10],[120,170,30,14],[250,152,18,12],[340,176,26,9]].map(a=>`<path d="M${a[0]} ${a[1]} q${a[2]/2} -${a[3]} ${a[2]} 0 q-${a[2]/3} ${a[3]} -${a[2]} 0z"/>`).join('')}</g>`;
// высокие окна с решёткой
[30,150,270].forEach(function(x,i){s+=`<g transform="translate(${x} 18)"><rect width="100" height="70" rx="3" fill="#fff"/><rect x="4" y="4" width="92" height="62" fill="url(#g${u})"/>
<path d="M50 4 V66 M4 35 H96" stroke="#fff" stroke-width="4"/><g stroke="${L===1?'#6d7366':'#9aa7b5'}" stroke-width="1.6">${[16,32,68,84].map(v=>`<path d="M${v} 4 V66"/>`).join('')}${[18,50].map(v=>`<path d="M4 ${v} H96"/>`).join('')}</g>
${L===1&&i===0?'<rect x="4" y="4" width="46" height="31" fill="#b08a5a"/><path d="M8 10 h38 M8 20 h38 M8 30 h38" stroke="#8a6a40" stroke-width="1.2"/>':''}
${L===1&&i===2?'<path d="M54 8 l20 14 l-6 8 l18 10 M74 22 l14 -10" stroke="#fff" stroke-width="1.8" fill="none"/><path d="M60 40 l30 20 M90 40 l-30 20" stroke="#d9c87a" stroke-width="6" opacity=".9"/>':''}
${L===3?'<path d="M6 6 l24 0 l-24 24z" fill="#fff" opacity=".35"/>':''}</g>`;});
// флажки (ур.3)
if(L===3)s+=`<path d="M0 8 Q200 22 400 8" stroke="#1d4fa3" stroke-width="1.5" fill="none"/><g>${Array.from({length:15},(_,i)=>{var x=8+i*27,y=9+Math.sin(i/14*Math.PI)*6;return `<path d="M${x} ${y} l13 0 l-6.5 12z" fill="${['#e5484d','#f5b72d','#3f8fe0','#2fa84f'][i%4]}"/>`;}).join('')}</g>`;
// пол
s+=`<rect y="216" width="400" height="84" fill="url(#fl${u})"/><g stroke="${L===1?'#6a5741':'#b07a3c'}" stroke-width="1.2" opacity=".6">${[228,242,258,276,296].map(y=>`<path d="M0 ${y} H400"/>`).join('')}</g>`;
if(L>=2)s+=`<path d="M0 262 H400" stroke="#fff" stroke-width="3"/><path d="M130 300 q70 -60 140 0" stroke="${L===3?'#e5484d':'#fff'}" stroke-width="3" fill="none"/><circle cx="200" cy="292" r="10" fill="none" stroke="#fff" stroke-width="3"/>`;
if(L===1)s+=`<ellipse cx="250" cy="270" rx="44" ry="8" fill="#8fb0c4" opacity=".75"/><path d="M60 246 h40 l-6 10 h-30z" fill="#4a3b2c"/><path d="M68 248 l-4 -10 M90 248 l6 -12" stroke="#9c8466" stroke-width="5"/>`;
// шведская стенка
var bars='<g transform="translate(6 70)"><rect width="8" height="150" fill="#b98a4e"/><rect x="62" width="8" height="150" fill="#b98a4e"/>';
for(var i=0;i<11;i++){var y=10+i*13;if(L===1&&(i===3||i===4||i===8))bars+=`<path d="M8 ${y} l18 ${i%2?8:-6}" stroke="#d4a66a" stroke-width="4"/>`;else bars+=`<rect x="8" y="${y-2}" width="54" height="4" rx="2" fill="#d4a66a"/>`;}
s+=bars+'</g>';
// баскетбольный щит
s+=`<g transform="translate(160 54)"><rect x="34" y="-10" width="12" height="12" fill="#8d98a6"/><rect width="80" height="56" rx="3" fill="#fff" stroke="${L===1?'#8d98a6':'#e5484d'}" stroke-width="3"/><rect x="26" y="22" width="28" height="22" fill="none" stroke="${L===1?'#8d98a6':'#e5484d'}" stroke-width="2.5"/>`;
if(L===1)s+=`<path d="M8 6 l20 14 M50 4 l18 22 l-10 10" stroke="#b9bfc8" stroke-width="1.5" fill="none"/><g transform="rotate(30 40 50)"><ellipse cx="40" cy="58" rx="16" ry="4" fill="none" stroke="#b5532a" stroke-width="3"/></g><path d="M34 64 l-2 14 M44 66 l2 10" stroke="#e8e8e8" stroke-width="1.3"/>`;
else s+=`<ellipse cx="40" cy="50" rx="16" ry="4" fill="none" stroke="#e8772e" stroke-width="3"/><path d="M25 51 l5 22 h20 l5 -22 M30 52 l8 20 M50 52 l-8 20 M40 54 v19" stroke="#fff" stroke-width="1.4" fill="none"/>`;
s+='</g>';
// канат
s+=L===1?`<path d="M86 0 V60 q-2 8 4 14" stroke="#c9a46a" stroke-width="5" fill="none"/><path d="M88 74 l-4 4 M90 74 l4 5" stroke="#c9a46a" stroke-width="2"/><path d="M300 236 q20 -6 40 2 q-10 8 -40 -2z" fill="#c9a46a"/>`
 :`<path d="M86 0 V196" stroke="#c9a46a" stroke-width="5"/><path d="M86 10 V196" stroke="#a9844a" stroke-width="1.5" stroke-dasharray="4 4"/><ellipse cx="86" cy="200" rx="5" ry="6" fill="#a9844a"/>`;
// козёл
s+=`<g transform="translate(96 168)"><rect x="0" y="0" width="64" height="20" rx="8" fill="${L===1?'#6b5040':'#8a3b2a'}"/>${L===1?'<path d="M40 2 q6 -8 14 -2 q-4 6 -14 2z" fill="#e8dcc0"/><path d="M44 0 q2 -4 6 -2" stroke="#d4c6a6" stroke-width="1.4" fill="none"/>':''}
<path d="M8 20 l-6 46 M56 20 l6 46" stroke="#8d98a6" stroke-width="5"/>${L===1?'<path d="M14 20 l10 28" stroke="#8d98a6" stroke-width="5"/>':'<path d="M14 20 l-2 46 M50 20 l2 46" stroke="#8d98a6" stroke-width="5"/>'}</g>`;
// маты
s+=L===1?`<g transform="translate(320 228) rotate(-8)"><rect width="70" height="16" rx="4" fill="#5a6a7a"/><path d="M20 0 v16 M44 0 v16" stroke="#46525e" stroke-width="2"/><path d="M60 2 q8 -6 12 2" fill="#e8dcc0"/></g>`
 :`<g transform="translate(316 232)"><rect width="80" height="18" rx="4" fill="${L===3?'#2f6fd6':'#4a7bb5'}"/><path d="M26 0 v18 M54 0 v18" stroke="#1d4fa3" stroke-width="2"/></g><g transform="translate(320 216)"><rect width="74" height="16" rx="4" fill="${L===3?'#e5484d':'#3d6aa0'}"/><path d="M24 0 v16 M50 0 v16" stroke="rgba(0,0,0,.2)" stroke-width="2"/></g>`;
// мячи
s+=L===1?ball(230,258,13,1)+ball(150,262,10,1)
 :`<g transform="translate(240 222)"><path d="M0 0 h50 l-6 34 h-38z" fill="#8d98a6"/><path d="M4 8 h42 M6 18 h38 M8 28 h34 M14 0 l2 34 M25 0 v34 M36 0 l-2 34" stroke="#6d7886" stroke-width="1.4"/></g>${ball(252,218,9)}${ball(272,216,9)}${ball(262,206,8)}`;
// табличка
if(L===1)s+=`<g transform="translate(272 108) rotate(5)"><rect width="100" height="30" fill="#efe9d6"/><text x="50" y="13" text-anchor="middle" font-size="9" font-weight="700" fill="#5d4f3f">ФИЗРА</text><text x="50" y="25" text-anchor="middle" font-size="9" font-weight="700" fill="#5d4f3f">ОТМЕНЯЕТСЯ</text></g><path d="M322 108 l-4 -12" stroke="#5d4f3f" stroke-width="1.2"/>`;
if(L===2)s+=`<g transform="translate(320 104)"><circle r="16" fill="#fff" stroke="#1d4fa3" stroke-width="3"/><path d="M0 0 V-10 M0 0 l7 4" stroke="#3a2a22" stroke-width="2.5" stroke-linecap="round"/></g><g transform="translate(250 130)"><rect width="38" height="16" rx="2" fill="#fff"/><text x="19" y="12" text-anchor="middle" font-size="9" font-weight="700" fill="#1d4fa3">ГТО</text></g>`;
if(L===3)s+=`<g transform="translate(170 150)"><rect width="140" height="44" rx="8" fill="#fff8e6" stroke="#f5b72d" stroke-width="3"/>
<text x="70" y="20" text-anchor="middle" font-size="16" font-weight="700" fill="#e5484d">ПЕРЕМЕНА!</text>
<text x="70" y="35" text-anchor="middle" font-size="8.4" fill="#1d4fa3">15 игр · новые каждые 1–3 дня</text></g>
<g transform="translate(316 100)"><rect width="76" height="44" rx="4" fill="#2a2d33"/><text x="38" y="14" text-anchor="middle" font-size="8" fill="#ffcf40">СЧЁТ</text><text x="38" y="35" text-anchor="middle" font-size="18" font-weight="700" fill="#ff6b4a">5 : 5</text></g>
<g transform="translate(112 112) scale(.5)">${YAT}</g>${ball(204,206,9)}<path d="M178 200 q8 -4 14 -2 M178 208 h14" stroke="#e8772e" stroke-width="2" opacity=".6" fill="none"/>`;
if(L===2)s+=`<g transform="translate(108 200)"><rect width="38" height="16" rx="3" fill="#fff" stroke="#8d98a6" stroke-width="2"/><path d="M8 0 q11 -12 22 0" stroke="#8d98a6" stroke-width="2" fill="none"/></g>`;
s+='</svg>';return s;}};
})();
