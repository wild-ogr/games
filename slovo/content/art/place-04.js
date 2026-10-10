/* Место 4 «Поликлиника» (ART-1). Фон главы 400×300. Подключение: ZB.load('content/art/place-04.js').then(()=>el.innerHTML=ZB_ART[4].svg()) — см. README-1.md.
   Коридор: кабинеты «Терапевт» и «Окулист», таблица для глаз «З И Н А», ряд стульев с сумками, окошко регистратуры «Талонов нет», фикус, часы 6:00. */
(function(){var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[4]={id:'poliklinika',n:'Поликлиника',c:'#e1f3f6',svg:function(r){var u='a4_'+(++k);r=r||'xMidYMid slice';
var door=function(x,t,n){return `<g transform="translate(${x} 70)"><rect width="62" height="130" fill="#f4f6f8" stroke="#b9c4cc" stroke-width="2"/><rect x="6" y="8" width="50" height="40" fill="#dfe8ee"/><rect x="6" y="56" width="50" height="66" fill="#dfe8ee"/><circle cx="52" cy="70" r="3" fill="#9aa3ae"/>
<rect x="4" y="-22" width="54" height="17" rx="2" fill="#2f6fd6"/><text x="31" y="-10" text-anchor="middle" font-size="8" font-weight="700" fill="#fff">${t}</text><text x="31" y="32" text-anchor="middle" font-size="12" font-weight="700" fill="#7a8794">${n}</text></g>`;};
var chair=function(x){return `<g transform="translate(${x} 228)"><rect x="-14" y="-28" width="28" height="22" rx="3" fill="#2fa5b8"/><rect x="-15" y="-6" width="30" height="7" rx="2" fill="#26919f"/><path d="M-11 1 v20 M11 1 v20" stroke="#5f6876" stroke-width="3"/></g>`;};
return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block">
<defs><linearGradient id="w${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7f5f8"/><stop offset="1" stop-color="#cfe9ee"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#w${u})"/>
<rect x="0" y="150" width="400" height="60" fill="#9fd3dc"/><path d="M0 150 h400" stroke="#7fbcc8" stroke-width="3"/>
<rect x="0" y="0" width="400" height="10" fill="#c3dde3"/><g fill="#fff" opacity=".9"><rect x="60" y="10" width="80" height="5"/><rect x="260" y="10" width="80" height="5"/></g>
${door(30,'ТЕРАПЕВТ','№ 12')}${door(300,'ОКУЛИСТ','№ 14')}
<g transform="translate(120 34)"><rect width="56" height="72" fill="#fff" stroke="#b9c4cc"/>
<g text-anchor="middle" font-weight="700" fill="#3a2a22"><text x="28" y="20" font-size="16">З</text><text x="28" y="36" font-size="11">И Н</text><text x="28" y="49" font-size="8">А М Ш</text><text x="28" y="59" font-size="6">Б Ы К Л</text><text x="28" y="67" font-size="4">С Л О В О</text></g></g>
<g transform="translate(216 16)"><circle cx="20" cy="20" r="19" fill="#fff" stroke="#5f6876" stroke-width="3"/><path d="M20 20 V7 M20 20 V32" stroke="#3a2a22" stroke-width="2.5" stroke-linecap="round"/><circle cx="20" cy="20" r="2" fill="#e8475a"/>
${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<circle cx="${20+15*Math.sin(i*Math.PI/6)}" cy="${20-15*Math.cos(i*Math.PI/6)}" r="1.2" fill="#3a2a22"/>`).join('')}</g>
<g transform="translate(196 80)"><rect width="80" height="58" rx="3" fill="#fff" stroke="#b9c4cc" stroke-width="2"/><rect x="6" y="6" width="68" height="34" fill="#cfe6f5"/><path d="M28 40 q12 -10 24 0z" fill="#fff" stroke="#b9c4cc"/>
<rect x="8" y="-14" width="64" height="13" rx="2" fill="#e8475a"/><text x="40" y="-4.5" text-anchor="middle" font-size="7.5" font-weight="700" fill="#fff">РЕГИСТРАТУРА</text>
<g transform="rotate(-6 40 22)"><rect x="18" y="14" width="44" height="16" fill="#fff8d6" stroke="#d8c98e"/><text x="40" y="25" text-anchor="middle" font-size="7" font-weight="700" fill="#e8475a">Талонов нет</text></g>
<text x="40" y="52" text-anchor="middle" font-size="5.5" fill="#7a8794">Приходите завтра в 6:00</text></g>
<g transform="translate(110 118)"><rect width="58" height="28" rx="2" fill="#fff" stroke="#b9c4cc"/><text x="29" y="11" text-anchor="middle" font-size="6.5" font-weight="700" fill="#2f9a5a">МОЙТЕ РУКИ!</text><text x="29" y="21" text-anchor="middle" font-size="5" fill="#3a2a22">и уши. Зина проверит</text></g>
<rect x="0" y="210" width="400" height="90" fill="#e3d6c0"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${i*56} 210 l-20 90" stroke="#d0c1a6" stroke-width="2"/>`).join('')}<path d="M0 240 h400 M0 272 h400" stroke="#d0c1a6" stroke-width="2"/>
${[130,164,198,232,266].map(chair).join('')}
<g transform="translate(164 222)"><path d="M-10 0 h20 l-3 -16 h-14z" fill="#8a5a34"/><path d="M-6 -16 q6 -10 12 0" stroke="#6b4325" stroke-width="2" fill="none"/></g>
<g transform="translate(232 222)"><rect x="-10" y="-14" width="20" height="14" rx="3" fill="#b48be0"/><path d="M-6 -14 q6 -8 12 0" stroke="#8a64b8" stroke-width="2" fill="none"/></g>
<g transform="translate(266 222)"><path d="M-10 0 v-18 l20 0 v18z" fill="#fff3d6" stroke="#c9a46a"/><text y="-6" text-anchor="middle" font-size="5" fill="#3a2a22">я за</text><text y="0" text-anchor="middle" font-size="5" fill="#3a2a22">вами!</text></g>
<g transform="translate(366 250)"><path d="M-16 0 h32 l-4 26 h-24z" fill="#c9714a"/><path d="M0 0 v-40" stroke="#5a7a3a" stroke-width="3"/>
<g fill="#3f8a3a">${[[-14,-30,-30],[14,-34,30],[-12,-50,-40],[12,-54,40],[0,-62,0],[-16,-14,-20],[16,-16,20]].map(([x,y,a])=>`<ellipse cx="${x}" cy="${y}" rx="12" ry="6" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g></g>
<g transform="translate(96 288)"><rect x="-34" y="-12" width="68" height="15" rx="2" fill="#fff" stroke="#b9c4cc"/><text y="-1.5" text-anchor="middle" font-size="7" font-weight="700" fill="#3a2a22">Кто последний?</text></g>
</svg>`;}};})();
