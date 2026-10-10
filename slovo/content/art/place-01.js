/* Место 1 «Подъезд» (ART-1). Фон главы 400×300. Подключение: ZB.load('content/art/place-01.js').then(()=>el.innerHTML=ZB_ART[1].svg()) — см. README-1.md. Пятиэтажка, козырёк, домофон, доска объявлений, лебедь из шины. */
(function(){var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[1]={id:'podyezd',n:'Подъезд',c:'#dbe7fb',svg:function(r){var u='a1_'+(++k);r=r||'xMidYMid slice';
var win=function(x,y,lit,cur){return `<g transform="translate(${x} ${y})"><rect width="30" height="30" rx="2" fill="#fff"/><rect x="2.5" y="2.5" width="25" height="25" fill="${lit?'#ffe08a':'#9cc3e6'}"/><path d="M15 2.5 V27.5 M2.5 13 H27.5" stroke="#fff" stroke-width="2.5"/>${cur?`<path d="M2.5 2.5 q6 12 0 25z M27.5 2.5 q-6 12 0 25z" fill="${cur}"/>`:''}<rect x="-2" y="29" width="34" height="3.5" rx="1" fill="#d9cfc0"/></g>`;};
var cols=[30,76,122,248,294,340],rows=[18,62,106],W='';
rows.forEach(function(y,r){W+=`<g transform="translate(188 ${y+8})"><rect width="24" height="16" rx="2" fill="#fff"/><rect x="2" y="2" width="20" height="12" fill="#b7d3ec"/><path d="M12 2 V14" stroke="#fff" stroke-width="2"/></g>`;cols.forEach(function(x,c){var l=(r*5+c*3)%4===0,cu=['','#f2a0a0','','#b9d98a','#f5c86b',''][(r+c)%6];W+=win(x,y,l,cu);});});
return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block">
<defs><linearGradient id="s${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d3fb"/><stop offset="1" stop-color="#e6f3ff"/></linearGradient>
<linearGradient id="w${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe3d0"/><stop offset="1" stop-color="#e0cfb6"/></linearGradient>
<linearGradient id="d${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#6b4325"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#s${u})"/>
<g fill="#fff" opacity=".85"><ellipse cx="60" cy="14" rx="30" ry="9"/><ellipse cx="350" cy="10" rx="36" ry="9"/></g>
<rect x="10" y="4" width="380" height="236" fill="url(#w${u})"/>
<g stroke="#d3c2a8" stroke-width="1.5">${[50,94,138,182].map(y=>`<path d="M10 ${y} H390"/>`).join('')}${[100,200,300].map(x=>`<path d="M${x} 4 V240"/>`).join('')}</g>
${W}
<g transform="translate(76 22)"><rect x="9" y="8" width="12" height="16" rx="5" fill="#f5b060"/><circle cx="15" cy="9" r="6" fill="#f5b060"/><path d="M10 5 l1 -6 l4 4z M20 5 l-1 -6 l-4 4z" fill="#f5b060"/></g>
<path d="M248 120 h34" stroke="#888" stroke-width="1.2"/><g fill="#fff" stroke="#bbb" stroke-width=".6"><rect x="252" y="120" width="7" height="10"/><rect x="263" y="120" width="8" height="7"/><rect x="274" y="120" width="5" height="9"/></g>
<rect x="160" y="150" width="80" height="90" fill="#d6c4aa"/>
<rect x="172" y="168" width="56" height="72" rx="3" fill="url(#d${u})"/><path d="M200 170 V240" stroke="#5a3820" stroke-width="2"/>
<circle cx="194" cy="208" r="2.6" fill="#f5b72d"/><circle cx="206" cy="208" r="2.6" fill="#f5b72d"/>
<rect x="231" y="186" width="10" height="18" rx="2" fill="#cfd4dc" stroke="#8d939e"/><g fill="#5c6370">${[0,1,2].map(r=>[0,1].map(c=>`<circle cx="${234+c*4}" cy="${191+r*4}" r="1"/>`).join('')).join('')}</g>
<path d="M150 150 h100 l-8 -12 h-84z" fill="#7d8796"/><rect x="150" y="150" width="100" height="5" fill="#5f6876"/>
<circle cx="200" cy="160" r="5" fill="#ffe69a"/><circle cx="200" cy="160" r="9" fill="#ffe69a" opacity=".35"/>
<rect x="186" y="140" width="28" height="9" rx="2" fill="#2f6fd6"/><text x="200" y="147.5" text-anchor="middle" font-size="8" font-weight="700" fill="#fff">№ 3</text>
<g transform="translate(96 160) rotate(-2)"><rect width="52" height="58" rx="2" fill="#f7f2e6" stroke="#c8b796"/><rect x="4" y="4" width="44" height="10" fill="#e8475a"/><text x="26" y="12" text-anchor="middle" font-size="6.4" font-weight="700" fill="#fff" textLength="40" lengthAdjust="spacingAndGlyphs">ОБЪЯВЛЕНИЕ</text>
<text font-size="5.6" fill="#3a2a22"><tspan x="5" y="23">Кто взял мою</tspan><tspan x="5" y="30">кастрюлю — верните!</tspan><tspan x="5" y="37">Суп был вкусный,</tspan><tspan x="5" y="44">кастрюля — нужна.</tspan><tspan x="22" y="53" font-weight="700">Зина, кв.12</tspan></text>
<circle cx="26" cy="1" r="2.4" fill="#e8475a"/></g>
<g transform="translate(252 186) rotate(3)"><rect width="34" height="26" rx="1.5" fill="#fff8d6" stroke="#d8c98e"/><text font-size="5" fill="#3a2a22"><tspan x="3" y="9">Лифт будет</tspan><tspan x="3" y="16">в следующей</tspan><tspan x="3" y="23">пятилетке</tspan></text></g>
<rect x="0" y="240" width="400" height="60" fill="#a8d47e"/><path d="M0 240 h400 v9 h-400z" fill="#c9c3b8"/><path d="M168 240 h64 l10 60 h-84z" fill="#cfc8bc"/>
<g transform="translate(78 270)"><ellipse rx="26" ry="9" fill="#fff" stroke="#3a6fd0" stroke-width="3"/><ellipse rx="17" ry="4" fill="#6b4a32"/><g fill="#e8475a"><circle cx="-8" cy="-3" r="3"/><circle cx="2" cy="-4" r="3"/><circle cx="10" cy="-2" r="3"/></g>
<path d="M-24 -2 q-12 -2 -16 -16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-20 -6 q-10 -14 -2 -30 q8 -6 10 2" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-12 -34 l7 1 l-6 4z" fill="#f5a623"/><circle cx="-14" cy="-33" r="1" fill="#333"/>
<path d="M14 -6 q14 -14 16 -2 q-6 0 -8 6z" fill="#fff"/></g>
<g transform="translate(316 268)"><rect x="-38" y="-22" width="76" height="6" rx="2" fill="#2f7d3a"/><rect x="-38" y="-13" width="76" height="6" rx="2" fill="#2f7d3a"/><rect x="-40" y="-5" width="80" height="6" rx="2" fill="#3f9a4c"/><rect x="-34" y="1" width="4" height="14" fill="#555"/><rect x="30" y="1" width="4" height="14" fill="#555"/>
</g>
<g fill="#8d8f99"><ellipse cx="268" cy="290" rx="7" ry="5"/><circle cx="274" cy="286" r="3.4"/><path d="M277 285 l3 1 l-3 1z" fill="#f5a623"/><ellipse cx="352" cy="292" rx="7" ry="5"/><circle cx="358" cy="288" r="3.4"/><path d="M361 287 l3 1 l-3 1z" fill="#f5a623"/><ellipse cx="296" cy="294" rx="7" ry="5"/><circle cx="302" cy="290" r="3.4"/><path d="M305 289 l3 1 l-3 1z" fill="#f5a623"/></g><g transform="translate(372 238)"><rect x="-4" y="-80" width="8" height="82" fill="#f4f1ea"/><g fill="#333">${[-70,-52,-34,-16].map(v=>`<rect x="-4" y="${v}" width="5" height="2.4"/>`).join('')}</g><g fill="#7cbf63"><circle cx="0" cy="-92" r="24"/><circle cx="-18" cy="-74" r="16"/><circle cx="16" cy="-76" r="16"/></g></g>
</svg>`;}};})();
