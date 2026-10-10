/* Кабинет 7 «Кабинет труда» (CAB-2). Толик «Карбюратор» (из Покера), мастерская обликов: блюдца и наряды «шьют» здесь. 400×300.
   ZB_CAB[7].svg(lvl,r): lvl 1 — разруха, 2 — ремонт, 3 — «как новенький». См. README-2.md. */
(function(){var C=window.ZB_CAB=window.ZB_CAB||{},k=0;
function bust(o,m,u){var sk=o.skin||'#f5c9a8',sk2=o.skin2||'#e9ae88';
 var eyes=m==='happy'?'<path d="M75 96 q8 -8 16 0 M109 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.6" fill="none" stroke-linecap="round"/>'
  :'<ellipse cx="83" cy="96" rx="4.4" ry="5" fill="#3a2a22"/><ellipse cx="117" cy="96" rx="4.4" ry="5" fill="#3a2a22"/><circle cx="84.4" cy="94.4" r="1.4" fill="#fff"/><circle cx="118.4" cy="94.4" r="1.4" fill="#fff"/>';
 var mouth=m==='happy'?'<path d="M84 121 q16 19 32 0 q-16 6 -32 0z" fill="#b83b44"/><path d="M89 125 q11 6 22 0" fill="#fff" opacity=".9"/>'
  :'<path d="M86 123 q14 11 28 0" stroke="#b83b44" stroke-width="4.2" fill="none" stroke-linecap="round"/>';
 return `<defs><radialGradient id="f${u}" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe2cc"/><stop offset="1" stop-color="${sk}"/></radialGradient></defs>
 <path d="M28 200 q4 -46 44 -54 h56 q40 8 44 54z" fill="${o.body}"/>${o.bodyX||''}
 <rect x="88" y="128" width="24" height="22" rx="8" fill="${sk2}"/><circle cx="53" cy="104" r="8" fill="${sk}"/><circle cx="147" cy="104" r="8" fill="${sk}"/>
 <ellipse cx="100" cy="98" rx="47" ry="50" fill="url(#f${u})"/>${o.hair||''}
 <ellipse cx="70" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".45"/><ellipse cx="130" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".45"/>
 <path d="M72 82 q10 -6 20 -1 M108 81 q10 -5 20 1" stroke="${o.brow||'#6d5a4a'}" stroke-width="4" fill="none" stroke-linecap="round"/>${eyes}
 <path d="M100 100 q-5 12 -1 15 q4 2 7 -1" stroke="${sk2}" stroke-width="3" fill="none" stroke-linecap="round"/>${mouth}${o.face||''}${o.hat||''}`;}
// Толик «Карбюратор» — как LOOK.tolik в holdem/index.html: синий комбинезон с лямками и жёлтыми пуговицами, серая кепка, усы
var TOLIK={body:'#2c5aa0',brow:'#5b3a29',
 bodyX:'<path d="M72 150 v50 M128 150 v50" stroke="#1d3f73" stroke-width="8"/><circle cx="72" cy="172" r="4" fill="#f5b72d"/><circle cx="128" cy="172" r="4" fill="#f5b72d"/><path d="M118 180 l10 -24" stroke="#c9a46a" stroke-width="5" stroke-linecap="round"/><path d="M128 156 l2 -5" stroke="#3a2a22" stroke-width="3"/>',
 hat:'<path d="M50 74 q4 -44 52 -46 q46 2 50 40 q-50 -8 -102 6z" fill="#6b6f76"/><path d="M50 74 q50 -14 102 -6 q18 4 22 12 q-62 -10 -124 -6z" fill="#565a61"/><circle cx="102" cy="30" r="4" fill="#565a61"/>',
 face:'<path d="M76 116 q12 -8 24 -2 q12 -6 24 2 q-6 10 -24 6 q-18 4 -24 -6z" fill="#5b3a29"/><path d="M60 104 l8 2" stroke="#555" stroke-width="3" opacity=".5"/>'};
// блюдце (как блюдца Обликов)
var saucer=function(x,y,c1,c2,i){return `<g transform="translate(${x} ${y})"><ellipse rx="15" ry="15" fill="#fff" stroke="#d6d0c4" stroke-width="1.2"/><circle r="11" fill="none" stroke="${c1}" stroke-width="2.5"/>
${i%3===0?`<g fill="${c2}">${[0,60,120,180,240,300].map(a=>`<circle cx="0" cy="-6" r="2.4" transform="rotate(${a})"/>`).join('')}</g><circle r="2.6" fill="${c1}"/>`
 :i%3===1?`<path d="M-7 0 q7 -9 14 0 q-7 9 -14 0z" fill="${c2}"/><circle r="2" fill="${c1}"/>`
 :`<path d="M-8 -3 h16 M-8 3 h16" stroke="${c2}" stroke-width="2.4"/>`}</g>`;};
C[7]={id:'trud',c:'#fff1d6',n:'Кабинет труда',cls:8,who:'Толик «Карбюратор»',d:'Мастерская обликов: «шьют» наряды и блюдца',
svg:function(L,r){L=Math.max(1,Math.min(3,L|0||1));r=r||'xMidYMid slice';var u='c7_'+(++k);
var W=L===1?['#b8b098','#a39b84']:L===2?['#e9efe0','#d9e3cc']:['#fff1d6','#f6e0b8'];
var s=`<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}">
<defs><linearGradient id="w${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${W[0]}"/><stop offset="1" stop-color="${W[1]}"/></linearGradient>
<linearGradient id="fl${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L===1?'#7d7464':'#9a8a72'}"/><stop offset="1" stop-color="${L===1?'#625a4d':'#7d6e58'}"/></linearGradient>
<linearGradient id="b${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L===1?'#8d7456':'#c99a5e'}"/><stop offset="1" stop-color="${L===1?'#6f5a42':'#a8783e'}"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#w${u})"/>`;
// нижняя панель стены и пол
s+=`<rect y="168" width="400" height="44" fill="${L===1?'#7a8466':L===2?'#8fae7e':'#d79b5a'}"/><path d="M0 168 H400" stroke="${L===1?'#646c53':L===2?'#6f8f60':'#b9783a'}" stroke-width="3"/>
<rect y="212" width="400" height="88" fill="url(#fl${u})"/><g stroke="rgba(0,0,0,.18)" stroke-width="1.4">${[226,244,266,292].map(y=>`<path d="M0 ${y} H400"/>`).join('')}</g>`;
if(L===1)s+=`<g fill="#e3cf9a" opacity=".85">${[[60,250],[78,262],[96,254],[300,276],[320,270],[150,288]].map(a=>`<ellipse cx="${a[0]}" cy="${a[1]}" rx="9" ry="2.5"/>`).join('')}</g>
<path d="M44 280 q6 -4 10 0 q4 -6 10 -2 q6 -4 12 2" stroke="#e3cf9a" stroke-width="3" fill="none"/>`;
// окно
s+=`<g transform="translate(16 22)"><rect width="84" height="96" rx="3" fill="#fff"/><rect x="4" y="4" width="76" height="88" fill="${L===1?'#c4d2d8':'#bfe3ff'}"/><path d="M42 4 V92 M4 40 H80" stroke="#fff" stroke-width="4"/>
${L===1?'<rect x="4" y="40" width="38" height="52" fill="#b08a5a"/><path d="M8 52 h30 M8 66 h30 M8 80 h30" stroke="#8a6a40" stroke-width="1.2"/><path d="M50 10 l20 18 l-8 6" stroke="#fff" stroke-width="1.6" fill="none"/>'
 :`<g transform="translate(18 74)"><path d="M0 18 h22 l-3 -12 h-16z" fill="#c96a2a"/><path d="M11 6 q-6 -14 -14 -12 q6 2 10 10 M11 6 q4 -16 14 -14 q-8 4 -10 12" fill="#5aa65a"/>${L===3?'<circle cx="11" cy="-6" r="5" fill="#e5484d"/><circle cx="11" cy="-6" r="2" fill="#f5b72d"/>':''}</g>`}
<rect x="-4" y="94" width="92" height="6" rx="2" fill="#e8e0cc"/>${L===3?'<path d="M-6 -4 q20 40 6 100 h-6z M90 -4 q-20 40 -6 100 h6z" fill="#e5484d"/><g fill="#fff">'+[10,30,50,70].map(y=>`<circle cx="-2" cy="${y}" r="1.8"/><circle cx="86" cy="${y}" r="1.8"/>`).join('')+'</g>':''}</g>`;
// перфорированная доска с инструментом
s+=`<g transform="translate(118 18)"><rect width="164" height="96" rx="4" fill="${L===1?'#9a8a6a':'#d8b98a'}"/><g fill="rgba(0,0,0,.18)">${Array.from({length:60},(_,i)=>`<circle cx="${10+(i%15)*10.3}" cy="${10+Math.floor(i/15)*25}" r="1.4"/>`).join('')}</g>`;
var tools=[['<path d="M0 0 h8 v34 h-8z" fill="#6b4a33"/><rect x="-8" y="-8" width="24" height="10" rx="2" fill="#8d98a6"/>',18,24],
 ['<path d="M0 0 v28" stroke="#6b4a33" stroke-width="6"/><path d="M-2 28 h4 l-2 14z" fill="#8d98a6"/>',50,18],
 ['<path d="M-8 0 l16 0 l-2 40 h-12z" fill="#8d98a6"/><path d="M-8 0 v-12 h16 v12" fill="#c96a2a"/><path d="M-4 8 l8 4 M-4 16 l8 4 M-4 24 l8 4" stroke="#6d7886"/>',80,26],
 ['<circle r="8" fill="none" stroke="#8d98a6" stroke-width="4"/><circle cx="18" r="8" fill="none" stroke="#8d98a6" stroke-width="4"/><path d="M4 6 l14 30 M14 6 l-14 30" stroke="#8d98a6" stroke-width="4"/>',106,20],
 ['<path d="M0 0 h36 v8 h-36z" fill="#2fa84f"/><rect x="14" y="2" width="8" height="4" rx="2" fill="#ffe08a"/>',120,64],
 ['<path d="M0 0 v24" stroke="#e5484d" stroke-width="7"/><path d="M0 24 v16" stroke="#8d98a6" stroke-width="3"/>',148,24]];
tools.forEach(function(t,i){if(L===1){s+=`<g transform="translate(${t[1]} ${t[2]})" opacity=".45"><g fill="none" stroke="#3a2a22" stroke-width="1.5" stroke-dasharray="3 2">${t[0].replace(/fill="[^"]*"/g,'').replace(/stroke="[^"]*"/g,'')}</g></g>`;if(i===0)s+=`<g transform="translate(${t[1]+6} ${t[2]+14}) rotate(70)">${t[0]}</g>`;}
 else s+=`<g transform="translate(${t[1]} ${t[2]})">${t[0]}</g>`;});
s+='</g>';
// полка с блюдцами (ур.2 — 3 шт., ур.3 — полная) / пустая сломанная (ур.1)
s+=L===1?`<g transform="translate(296 60)"><path d="M0 0 h96 l-4 6 h-88z" fill="#8a6a40" transform="rotate(12 48 3)"/><path d="M8 8 l18 30 h8" stroke="#8a6a40" stroke-width="3" fill="none"/><path d="M60 40 l8 6 l-12 4z M72 44 l10 -2 l-2 8z" fill="#f2f0ea"/></g>`
 :`<g transform="translate(296 24)"><rect width="96" height="8" y="40" fill="#8a5a34"/><rect width="96" height="8" y="84" fill="#8a5a34"/>
${[[16,26,'#3f8fe0','#e5484d'],[48,26,'#e5484d','#2fa84f'],[80,26,'#2fa84f','#f5b72d'],[16,70,'#f5b72d','#3f8fe0'],[48,70,'#7b3fa0','#f5b72d'],[80,70,'#1d4fa3','#e5484d']].slice(0,L===3?6:3).map((a,i)=>saucer(a[0],a[1],a[2],a[3],i)).join('')}
</g>`;
// манекен с нарядом (ур.2 — с выкройкой, ур.3 — в платке и бусах)
if(L>=2)s+=`<g transform="translate(342 140)"><path d="M18 100 v-26 M8 100 h20" stroke="#6b4a33" stroke-width="4"/><path d="M0 8 q18 -12 36 0 l-4 34 q8 14 4 32 h-28 q-4 -18 4 -32z" fill="${L===3?'#2f6fd6':'#e8e0cc'}"/>
<circle cx="18" cy="2" r="6" fill="#c9a46a"/>${L===3?'<path d="M-2 10 q20 30 40 0 l-4 20 q-16 14 -32 0z" fill="#e5484d"/><g fill="#fff">'+[[6,16],[18,24],[30,16]].map(a=>`<circle cx="${a[0]}" cy="${a[1]}" r="3"/>`).join('')+'</g><g fill="#f5b72d">'+[4,10,18,26,32].map((x,i)=>`<circle cx="${x}" cy="${10+Math.sin(i/4*Math.PI)*5}" r="2.2"/>`).join('')+'</g>'
 :'<path d="M6 14 q12 10 24 0 M10 30 h16" stroke="#8d98a6" stroke-width="1.4" stroke-dasharray="3 2" fill="none"/><path d="M28 20 l14 -6" stroke="#c9a46a" stroke-width="3"/>'}</g>`;
// швейная машинка «Чайка» на тумбе слева
s+=`<g transform="translate(14 150)"><rect y="30" width="88" height="62" fill="${L===1?'#6f6252':'#8a5a34'}"/><rect x="6" y="38" width="76" height="20" rx="2" fill="${L===1?'#5d5244':'#a8783e'}"/><circle cx="44" cy="48" r="3" fill="#f5b72d"/>`;
s+=L===1?`<path d="M6 30 q40 -40 78 0z" fill="#8d8b80"/><path d="M20 22 q8 6 2 8 M60 14 q6 10 -2 16" stroke="#6d6b62" stroke-width="2" fill="none"/>`
 :`<path d="M12 30 v-22 h52 q10 0 10 10 v12 h-8 v-10 h-40 v10z" fill="${L===3?'#1f1f1f':'#2a2d33'}"/><circle cx="68" cy="14" r="7" fill="#8d98a6"/><path d="M20 30 v6" stroke="#8d98a6" stroke-width="2"/>
<text x="38" y="20" text-anchor="middle" font-size="7" font-style="italic" fill="#f5b72d">Чайка</text>${L===3?'<path d="M76 30 q14 -4 12 -18" stroke="#e5484d" stroke-width="2" fill="none"/><circle cx="88" cy="10" r="5" fill="#e5484d"/>':''}`;
s+='</g>';
// Толик за верстаком
if(L>=2)s+=`<g transform="translate(150 112) scale(.5)">${bust(TOLIK,L===3?'happy':'norm',u+'t')}</g>`;
// верстак с тисками
s+=`<g transform="translate(118 196)"><rect width="164" height="16" rx="2" fill="url(#b${u})"/><path d="M6 16 v78 M158 16 v78 M6 70 h152" stroke="${L===1?'#5d4a36':'#7a5428'}" stroke-width="8"/>
<g transform="translate(126 -18)"><rect width="26" height="18" fill="#6d7886"/><rect x="-4" y="-6" width="34" height="8" fill="#8d98a6"/><path d="M13 18 v-30 M4 -12 h18" stroke="#565a61" stroke-width="3"/></g>`;
if(L===1)s+=`<path d="M50 0 l20 -8 l4 6 l-18 8z" fill="#8a6a40"/><path d="M30 16 l-16 30" stroke="#5d4a36" stroke-width="6"/><g stroke="#fff" stroke-width=".8" opacity=".7" fill="none"><path d="M136 -18 l20 -20 M140 -18 q10 -6 16 -20"/></g>`;
if(L>=2)s+=`<g transform="translate(20 -10)"><rect width="50" height="10" rx="2" fill="#e8c88a"/><path d="M8 0 v10 M18 0 v10 M28 0 v10 M38 0 v10" stroke="#c9a46a"/></g><g transform="translate(80 -6)">${saucer(0,0,'#3f8fe0','#e5484d',L===3?0:2).replace('<g transform="translate(0 0)">','<g transform="scale(1 .45)">')}</g>`;
s+='</g>';
// табличка / лозунг
if(L===1)s+=`<g transform="translate(150 128) rotate(-4)"><rect width="100" height="30" fill="#efe9d6"/><text x="50" y="13" text-anchor="middle" font-size="9" font-weight="700" fill="#5d4f3f">ТРУД —</text><text x="50" y="25" text-anchor="middle" font-size="9" font-weight="700" fill="#5d4f3f">ПОСЛЕ РЕМОНТА</text></g>
<g transform="translate(250 230) rotate(18)"><rect width="34" height="5" fill="#8a6a40"/><path d="M4 5 l-4 26 M30 5 l6 24" stroke="#8a6a40" stroke-width="4"/></g><g transform="translate(292 262) rotate(-30)"><rect width="30" height="5" fill="#8a6a40"/></g>`;
s+=L===3?`<g transform="translate(100 2)"><rect width="200" height="15" rx="3" fill="#2c5aa0"/><text x="100" y="11" text-anchor="middle" font-size="8.4" font-weight="700" fill="#fff">АТЕЛЬЕ «У ТОЛИКА»: НАРЯДЫ И БЛЮДЦА</text></g>`
 :L===2?`<g transform="translate(130 2)"><rect width="140" height="14" rx="2" fill="#fff8e6" stroke="#8fae7e"/><text x="70" y="10.5" text-anchor="middle" font-size="8.5" fill="#4d6b3c">Семь раз отмерь — один раз отрежь</text></g>`:'';
s+='</svg>';return s;}};
})();
