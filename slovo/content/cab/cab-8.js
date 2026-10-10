/* Кабинет 8 «Школьный музей» (CAB-2). Дядя Коля-филателист (из Викторины): альбом открыток глав, стенд выпускников. 400×300.
   ZB_CAB[8].svg(lvl,r): lvl 1 — разруха, 2 — ремонт, 3 — «как новенький». См. README-2.md. */
(function(){var C=window.ZB_CAB=window.ZB_CAB||{},k=0;
function bust(o,m,u){var sk=o.skin||'#f5c9a8',sk2=o.skin2||'#e9ae88';
 var eyes=m==='happy'?'<path d="M75 102 q8 -8 16 0 M109 102 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.6" fill="none" stroke-linecap="round"/>'
  :'<ellipse cx="81" cy="103" rx="4.4" ry="5" fill="#3a2a22"/><ellipse cx="119" cy="103" rx="4.4" ry="5" fill="#3a2a22"/><circle cx="82.4" cy="101.4" r="1.4" fill="#fff"/><circle cx="120.4" cy="101.4" r="1.4" fill="#fff"/>';
 var mouth=m==='happy'?'<path d="M86 132 q14 14 28 0 q-14 5 -28 0z" fill="#b83b44"/>':'<path d="M88 134 q12 8 24 0" stroke="#b83b44" stroke-width="4" fill="none" stroke-linecap="round"/>';
 return `<defs><radialGradient id="f${u}" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe2cc"/><stop offset="1" stop-color="${sk}"/></radialGradient></defs>
 <path d="M28 200 q4 -46 44 -54 h56 q40 8 44 54z" fill="${o.body}"/>${o.bodyX||''}
 <rect x="88" y="128" width="24" height="22" rx="8" fill="${sk2}"/><circle cx="53" cy="104" r="8" fill="${sk}"/><circle cx="147" cy="104" r="8" fill="${sk}"/>
 <ellipse cx="100" cy="98" rx="47" ry="50" fill="url(#f${u})"/>
 <ellipse cx="70" cy="118" rx="10" ry="6.5" fill="#f58f8f" opacity=".45"/><ellipse cx="130" cy="118" rx="10" ry="6.5" fill="#f58f8f" opacity=".45"/>
 <path d="M70 86 q10 -6 20 -1 M110 85 q10 -5 20 1" stroke="${o.brow||'#6d5a4a'}" stroke-width="4" fill="none" stroke-linecap="round"/>${eyes}${o.glasses||''}
 <path d="M100 106 q-5 10 -1 13 q4 2 7 -1" stroke="${sk2}" stroke-width="3" fill="none" stroke-linecap="round"/>${o.under||''}${mouth}${o.hat||''}${o.front||''}`;}
// дядя Коля — как NEW.kolya в viktorina/js/look.js: очки в чёрной оправе, вязаная жилетка с карандашом, голубая рубашка, кепка, усы, кляссер с марками
var KOLYA={body:'#7fa8d6',brow:'#5b3a29',
 bodyX:'<path d="M80 152 l20 20 l20 -20" fill="#e3e9f0"/><path d="M40 166 q22 -12 44 -10 l16 28 l16 -28 q22 -2 44 10 l8 54 H32z" fill="#8a6a45"/><g fill="#6f5434"><circle cx="100" cy="196" r="3.4"/></g><path d="M52 176 q20 -6 36 -2 M112 174 q16 -4 36 2" stroke="#a7865d" stroke-width="2.4" fill="none"/><rect x="132" y="170" width="20" height="14" rx="2" fill="#6f5434"/><path d="M138 172 v-16" stroke="#ffcf40" stroke-width="4" stroke-linecap="round"/><path d="M138 156 v-3" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>',
 hat:'<path d="M48 78 q2 -50 54 -52 q50 2 52 44 q-52 -10 -106 8z" fill="#6b5b4a"/><path d="M48 78 q52 -18 106 -8 q18 4 24 14 q-64 -12 -130 -6z" fill="#51443a"/>',
 glasses:'<g fill="rgba(210,230,255,.3)" stroke="#222" stroke-width="3.6"><rect x="65" y="92" width="32" height="22" rx="6"/><rect x="103" y="92" width="32" height="22" rx="6"/></g><path d="M97 101 h6 M65 99 l-15 -4 M135 99 l15 -4" stroke="#222" stroke-width="3.6" fill="none"/>',
 under:'<path d="M72 128 q14 -9 28 -2 q14 -7 28 2 q-7 12 -28 7 q-21 5 -28 -7z" fill="#5b3a29"/>',
 front:'<g transform="rotate(-9 50 200)"><rect x="16" y="168" width="70" height="58" rx="5" fill="#2e6b4a"/><rect x="22" y="174" width="58" height="46" rx="2" fill="#1f4f36"/><g stroke="#fff" stroke-width="1.6" stroke-dasharray="2 1.6"><rect x="26" y="178" width="14" height="17" fill="#e5484d"/><rect x="44" y="178" width="14" height="17" fill="#3f8fe0"/><rect x="62" y="178" width="14" height="17" fill="#ffcf40"/><rect x="26" y="200" width="14" height="17" fill="#2fa84f"/><rect x="44" y="200" width="14" height="17" fill="#ff8a1f"/></g></g>'};
// открытка: маленькая картинка места; gold — золотая рамка
var card=function(x,y,i,gold,dim){var p=[
 '<rect x="5" y="9" width="12" height="11" fill="#e8d6b8"/><path d="M3 10 l8 -6 l8 6z" fill="#c0392b"/><circle cx="23" cy="6" r="3" fill="#f5b72d"/>',
 '<path d="M2 20 q6 -10 12 -4 q6 -10 14 4z" fill="#5aa65a"/><circle cx="8" cy="6" r="3" fill="#f5b72d"/>',
 '<path d="M2 16 h24 l-4 5 h-16z" fill="#fff"/><path d="M14 16 v-12 l7 10z" fill="#e5484d"/><path d="M0 22 q7 -3 14 0 q7 3 14 0" stroke="#3f8fe0" stroke-width="2" fill="none"/>',
 '<path d="M14 2 l3 6 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1z" fill="#f5b72d"/>',
 '<rect x="4" y="6" width="20" height="14" rx="2" fill="#3f8fe0"/><path d="M4 12 h20" stroke="#fff" stroke-width="2"/><circle cx="9" cy="21" r="2" fill="#333"/><circle cx="19" cy="21" r="2" fill="#333"/>',
 '<path d="M14 3 v18 M5 12 h18 M8 6 l12 12 M20 6 l-12 12" stroke="#bfe3ff" stroke-width="2"/><circle cx="14" cy="12" r="3" fill="#fff"/>'][i%6];
 var bg=['#fff2d6','#e6f5e0','#e3f1ff','#2a2d5c','#fde6e6','#cfe6fb'][i%6];
 return `<g transform="translate(${x} ${y}) rotate(${(i%3-1)*3})" ${dim?'opacity=".55"':''}><rect x="-2" y="-2" width="32" height="28" rx="2" fill="${gold?'#f5b72d':'#fff'}" stroke="${gold?'#b9860f':'#d6d0c4'}" stroke-width="1.2"/><rect width="28" height="24" fill="${bg}"/>${p}</g>`;};
C[8]={id:'muzej',c:'#f4e6c4',n:'Школьный музей',cls:10,who:'дядя Коля',d:'Альбом открыток глав, стенд выпускников',
svg:function(L,r){L=Math.max(1,Math.min(3,L|0||1));r=r||'xMidYMid slice';var u='c8_'+(++k);
var W=L===1?['#b2ab95','#9e9781']:L===2?['#efe6d2','#e2d5ba']:['#f4e6c4','#e9d3a2'];
var s=`<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}">
<defs><linearGradient id="w${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${W[0]}"/><stop offset="1" stop-color="${W[1]}"/></linearGradient>
<linearGradient id="fl${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L===1?'#7e705c':'#a0623a'}"/><stop offset="1" stop-color="${L===1?'#64594a':'#7e4a2a'}"/></linearGradient>
<linearGradient id="gl${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#dff1ff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#w${u})"/>`;
// обои-полосы (ур.3) / пятна (ур.1)
if(L===3)s+=`<g stroke="#e3c98f" stroke-width="6" opacity=".55">${Array.from({length:14},(_,i)=>`<path d="M${14+i*29} 0 V170"/>`).join('')}</g>`;
if(L===1)s+=`<ellipse cx="330" cy="30" rx="50" ry="16" fill="#8f876f" opacity=".5"/><g stroke="#6f6855" stroke-width="1.5" fill="none" opacity=".6"><path d="M20 20 l12 16 l-4 14 M380 120 l-10 14 l8 12"/></g>`;
s+=`<rect y="170" width="400" height="44" fill="${L===1?'#7d7464':L===2?'#9b6b45':'#7a3b2a'}"/><path d="M0 170 H400" stroke="${L===3?'#f5b72d':'rgba(0,0,0,.25)'}" stroke-width="3"/>
<rect y="214" width="400" height="86" fill="url(#fl${u})"/>`;
// паркет ёлочкой (ур.2–3) / доски (ур.1)
s+=L===1?`<g stroke="rgba(0,0,0,.2)" stroke-width="1.4">${[228,248,272].map(y=>`<path d="M0 ${y} H400"/>`).join('')}</g>`
 :`<g stroke="rgba(0,0,0,.18)" stroke-width="1.3" fill="none">${Array.from({length:20},(_,i)=>`<path d="M${i*22-10} 300 l22 -22 l-22 -22 l22 -22 l-22 -22"/>`).join('')}</g>`;
if(L===3)s+=`<path d="M60 300 L110 236 H290 L340 300z" fill="#b8202f" opacity=".9"/><path d="M68 300 L114 240 H286 L332 300" stroke="#f5b72d" stroke-width="2" fill="none"/>`;
// заголовок
s+=L===1?`<g transform="translate(120 10) rotate(-3)"><rect width="160" height="30" fill="#efe9d6"/><text x="80" y="13" text-anchor="middle" font-size="9" font-weight="700" fill="#5d4f3f">МУЗЕЙ ЗАКРЫТ НА УЧЁТ</text><text x="80" y="25" text-anchor="middle" font-size="8.5" fill="#5d4f3f">с 1987 года</text></g>`
 :`<g transform="translate(110 8)"><rect width="180" height="22" rx="4" fill="${L===3?'#b8202f':'#6b4a33'}"/><text x="90" y="15.5" text-anchor="middle" font-size="11" font-weight="700" fill="${L===3?'#ffd36b':'#fff8e6'}">ШКОЛЬНЫЙ МУЗЕЙ</text></g>`;
// стена открыток (альбом глав) слева
var cards='';
if(L===1){cards=`<g transform="translate(14 42)"><rect width="120" height="100" fill="#8f876f" opacity=".35"/><g stroke="#6f6855" stroke-width="1.2" stroke-dasharray="3 2" fill="none">${[0,1,2,3,4,5,6,7,8].map(i=>`<rect x="${6+(i%3)*38}" y="${6+Math.floor(i/3)*31}" width="30" height="25"/>`).join('')}</g>${card(44,38,1,0,1)}<path d="M50 70 l20 -6" stroke="#6f6855" stroke-width="1"/></g>`;}
else{var n=L===2?5:9;cards=`<g transform="translate(14 42)"><rect width="120" height="124" rx="3" fill="${L===3?'#fff8e6':'#f7f1e2'}" stroke="${L===3?'#f5b72d':'#c9b48a'}" stroke-width="2.5"/>`;
 for(var i=0;i<9;i++){var x=8+(i%3)*38,y=8+Math.floor(i/3)*31;cards+=i<n?card(x,y,i,L===3&&(i===0||i===4||i===8)):`<rect x="${x}" y="${y}" width="28" height="24" fill="none" stroke="#c9b48a" stroke-dasharray="3 2"/>`;}
 cards+=`<text x="60" y="114" text-anchor="middle" font-size="9" font-weight="700" fill="#6b4a33">ОТКРЫТКИ ГЛАВ</text></g>`;}
s+=cards;
// стенд выпускников справа
if(L===1)s+=`<g transform="translate(272 46) rotate(4)"><rect width="114" height="92" fill="#8f876f" opacity=".5"/><rect x="10" y="10" width="40" height="30" fill="none" stroke="#6f6855" stroke-dasharray="3 2"/><path d="M60 50 l40 30" stroke="#6f6855" stroke-width="1.5"/></g>
<g transform="translate(300 160)"><rect width="56" height="40" fill="#a68b5e"/><path d="M0 12 h56 M28 0 v12" stroke="#7d6844" stroke-width="2"/><text x="28" y="30" text-anchor="middle" font-size="8" fill="#5d4f3f">АРХИВ</text></g>
<g transform="translate(320 128)"><rect width="46" height="32" fill="#b59a6a"/><path d="M0 10 h46" stroke="#7d6844" stroke-width="2"/></g>`;
else{var ph=L===2?6:12;s+=`<g transform="translate(266 42)"><rect width="122" height="102" rx="3" fill="${L===3?'#1d4fa3':'#3d6aa0'}"/><text x="61" y="14" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">НАШИ ВЫПУСКНИКИ</text>`;
 for(var j=0;j<12;j++){var px=8+(j%4)*28,py=20+Math.floor(j/4)*26;if(j<ph){var hc=['#6b4a33','#2d2016','#e3c27a','#9c4a2e','#efe4c4','#4a2e22'][j%6];s+=`<g transform="translate(${px} ${py})"><rect width="22" height="22" fill="#fff"/><rect x="2" y="2" width="18" height="18" fill="#dfe9f3"/><path d="M4 20 q7 -8 14 0" fill="${['#2f6fd6','#e5484d','#2fa84f','#7b3fa0'][j%4]}"/><circle cx="11" cy="10" r="5" fill="#f6c9a8"/><path d="M6 9 q5 -8 10 0 q-5 -3 -10 0z" fill="${hc}"/></g>`;}
  else s+=`<rect x="${px}" y="${py}" width="22" height="22" fill="none" stroke="#9fc0e6" stroke-dasharray="3 2"/>`;}
 s+=L===3?`<path d="M0 0 l18 0 l-18 18z M122 0 l-18 0 l18 18z" fill="#f5b72d"/></g>`:'</g>';}
// глобус на тумбе
s+=`<g transform="translate(${L===1?236:44} ${L===1?138:174})"><path d="M14 60 h22 l-4 -10 h-14z" fill="#6b4a33"/><path d="M25 50 v-6" stroke="#6b4a33" stroke-width="3"/>
<circle cx="25" cy="26" r="18" fill="${L===1?'#7d96a6':'#5aa0d8'}"/><path d="M14 16 q6 -2 8 4 q-4 8 2 12 q-8 2 -12 -6z M30 12 q8 2 10 10 q-6 0 -8 6 q-4 -6 -2 -16z" fill="${L===1?'#8a9a6a':'#5aa65a'}"/><path d="M5 28 a22 22 0 0 0 40 -6" stroke="#b9860f" stroke-width="2.5" fill="none"/>
${L===1?'<path d="M10 30 l10 4 l-4 8" stroke="#3a3a3a" stroke-width="1.2" fill="none"/>':''}</g>`;
// дядя Коля с кляссером (за витриной)
if(L>=2)s+=`<g transform="translate(150 110) scale(.5)">${bust(KOLYA,L===3?'happy':'norm',u+'k')}</g>`;
// витрина
s+=`<g transform="translate(118 196)"><rect y="18" width="164" height="70" fill="${L===1?'#6f5f4c':'#7a4a2a'}"/><rect x="6" y="26" width="152" height="54" rx="2" fill="${L===1?'#5d5040':'#8f5a34'}"/>
<rect width="164" height="20" fill="${L===1?'#c4c8c0':'#dff1ff'}" opacity="${L===1?.55:.7}"/>`;
if(L===1)s+=`<path d="M20 0 l24 20 M30 0 l8 10 l10 -4 M120 0 l-14 20" stroke="#fff" stroke-width="1.2" fill="none"/><path d="M60 14 h20 v6 h-20z" fill="#8a7a5a"/>`;
else s+=`<g transform="translate(16 4)"><path d="M0 14 l18 -12 l6 4 l-18 12z" fill="#f5b72d"/><circle cx="21" cy="3" r="4" fill="#c0392b"/></g>
<g transform="translate(58 4)"><rect width="20" height="14" fill="#e5484d"/><text x="10" y="10" text-anchor="middle" font-size="6.5" font-weight="700" fill="#fff">Букварь</text></g>
<g transform="translate(92 6)"><path d="M0 0 h16 l-4 12 h-8z" fill="#e5484d"/><path d="M8 12 v2" stroke="#b9860f" stroke-width="2"/></g>
${L===3?'<g transform="translate(122 2)"><circle cx="8" cy="8" r="7" fill="#f5b72d" stroke="#b9860f"/><path d="M8 3 l1.6 3.4 l3.6 .4 l-2.8 2.4 l.8 3.6 l-3.2 -1.8 l-3.2 1.8 l.8 -3.6 l-2.8 -2.4 l3.6 -.4z" fill="#fff"/></g>':''}`;
s+=`<rect width="164" height="20" fill="url(#gl${u})"/>`+(L>=2?`<g transform="translate(46 -12)"><path d="M0 2 l34 -4 v18 l-34 4z M34 -2 l34 4 v18 l-34 -4z" fill="#2e6b4a"/><path d="M3 4 l29 -3 v13 l-29 3z M37 1 l29 3 v13 l-29 -3z" fill="#1f4f36"/><g stroke="#fff" stroke-width=".8">${[[6,5,'#e5484d'],[15,4,'#3f8fe0'],[24,3,'#ffcf40'],[40,3,'#2fa84f'],[49,4,'#ff8a1f'],[58,5,'#e5484d']].map(a=>`<rect x="${a[0]}" y="${a[1]}" width="7" height="9" fill="${a[2]}"/>`).join('')}</g></g>`:'')+`<rect width="164" height="20" fill="none" stroke="${L===3?'#f5b72d':'#8d98a6'}" stroke-width="2"/></g>`;
// ур.1 — пыль, паутина, коробки
if(L===1)s+=`<g transform="translate(20 226)"><rect width="60" height="40" fill="#a68b5e"/><path d="M0 10 h60 M30 0 v10" stroke="#7d6844" stroke-width="2"/><text x="30" y="30" text-anchor="middle" font-size="8" fill="#5d4f3f">ХЛАМ</text></g>
<g transform="translate(80 252) rotate(-14)"><rect width="34" height="26" fill="#efe9d6"/><path d="M4 6 h26 M4 12 h26 M4 18 h18" stroke="#b9ae92" stroke-width="1.5"/></g>
<g stroke="#fff" stroke-width=".9" opacity=".7" fill="none"><path d="M0 0 l34 34 M0 18 l16 16 M18 0 l16 16 M0 0 q18 16 0 34 M0 0 q16 18 34 0"/></g>`;
// ур.3 — лампы-бра, лента
if(L===3)s+=`<g>${[150,250].map(x=>`<g transform="translate(${x} 40)"><path d="M0 0 v10" stroke="#b9860f" stroke-width="2"/><path d="M-9 10 h18 l-4 12 h-10z" fill="#f5b72d"/><ellipse cx="0" cy="34" rx="20" ry="10" fill="#fff6c8" opacity=".5"/></g>`).join('')}</g>
<g transform="translate(330 214)"><path d="M0 30 l10 -28 l10 28" stroke="#b9860f" stroke-width="2.5" fill="none"/><rect x="-12" y="-28" width="44" height="30" rx="2" fill="#fff" stroke="#b9860f" stroke-width="2"/><text x="10" y="-15" text-anchor="middle" font-size="7" font-weight="700" fill="#b8202f">Экскурсия</text><text x="10" y="-5" text-anchor="middle" font-size="7" fill="#6b4a33">в 12:00</text></g>`;
s+='</svg>';return s;}};
})();
