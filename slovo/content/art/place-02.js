/* Место 2 «Лавочка» (ART-1). Фон главы 400×300. Подключение: ZB.load('content/art/place-02.js').then(()=>el.innerHTML=ZB_ART[2].svg()) — см. README-1.md.
   Двор: лавочка у сирени, табличка «Занято с 1975 г.», кулёк семечек, вязание, бельё на верёвке, песочница. */
(function(){var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[2]={id:'lavochka',n:'Лавочка',c:'#e5f4d8',svg:function(r){var u='a2_'+(++k);r=r||'xMidYMid slice';
var lilac=function(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})"><g fill="#6fae52"><circle cx="0" cy="-30" r="30"/><circle cx="-26" cy="-14" r="22"/><circle cx="26" cy="-14" r="22"/></g>
<g fill="#b48be0">${[[-14,-44],[10,-50],[-30,-22],[22,-30],[0,-20],[34,-10],[-12,-6]].map(([a,b])=>`<ellipse cx="${a}" cy="${b}" rx="6" ry="9"/>`).join('')}</g><g fill="#d3b8f2">${[[-12,-47],[12,-53],[-28,-25],[24,-33],[2,-23]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="3"/>`).join('')}</g></g>`;};
var shirt=function(x,c){return `<path d="M${x} 62 l-8 4 l3 7 l4 -2 v14 h16 v-14 l4 2 l3 -7 l-8 -4 q-7 4 -14 0z" fill="${c}"/><path d="M${x+7} 60 v3" stroke="#8a6a4a" stroke-width="2"/>`;};
return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block">
<defs><linearGradient id="s${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#f1faff"/></linearGradient>
<linearGradient id="g${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d67f"/><stop offset="1" stop-color="#8cc463"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#s${u})"/>
<circle cx="350" cy="44" r="22" fill="#ffe27a"/><circle cx="350" cy="44" r="32" fill="#ffe27a" opacity=".3"/>
<g fill="#fff" opacity=".9"><ellipse cx="80" cy="30" rx="34" ry="10"/><ellipse cx="104" cy="24" rx="20" ry="9"/></g>
<rect x="0" y="96" width="140" height="110" fill="#e9d9c4"/><g fill="#9cc3e6" stroke="#fff" stroke-width="2.5">${[[14,110],[60,110],[106,110],[14,150],[60,150],[106,150]].map(([x,y])=>`<rect x="${x}" y="${y}" width="24" height="24"/>`).join('')}</g>
<rect x="288" y="110" width="112" height="96" fill="#efe3d0"/><g fill="#9cc3e6" stroke="#fff" stroke-width="2.5">${[[300,122],[344,122],[300,160],[344,160]].map(([x,y])=>`<rect x="${x}" y="${y}" width="24" height="24"/>`).join('')}</g><rect x="344" y="160" width="24" height="24" fill="#ffe08a" stroke="#fff" stroke-width="2.5"/>
<path d="M150 60 L280 70" stroke="#8a6a4a" stroke-width="1.5"/><rect x="146" y="56" width="5" height="150" fill="#9aa3ae"/><rect x="278" y="66" width="5" height="140" fill="#9aa3ae"/>
${shirt(168,'#f2a0a0')}<path d="M196 63 h22 v26 l-11 -6 l-11 6z" fill="#fff" stroke="#dde" /><g fill="#2f6fd6"><circle cx="202" cy="70" r="2"/><circle cx="212" cy="74" r="2"/><circle cx="204" cy="80" r="2"/></g>${shirt(236,'#8fc3f0')}
<path d="M258 68 h12 v18 h-12z" fill="#fff3c4"/><path d="M258 68 h12" stroke="#e8475a" stroke-width="2"/>
<rect x="0" y="200" width="400" height="100" fill="url(#g${u})"/><path d="M0 206 q100 -14 200 0 t200 0" stroke="#7cb85a" stroke-width="3" fill="none"/>
${lilac(40,222,1.2)}${lilac(352,224,1.1)}
<path d="M60 300 q40 -40 130 -46 q80 -2 120 6 q-20 20 -10 40z" fill="#ded2bd"/><g transform="translate(344 270) scale(.9)"><rect x="-30" y="-6" width="60" height="22" fill="#f0d79a"/><rect x="-34" y="-10" width="68" height="6" fill="#e8475a"/><rect x="-34" y="14" width="68" height="6" fill="#e8475a"/><path d="M-10 -2 l8 -10 l8 10z" fill="#f5b72d"/><rect x="10" y="0" width="7" height="8" fill="#2f6fd6"/></g>

<g transform="translate(196 252) scale(1.15)"><rect x="-70" y="-38" width="140" height="9" rx="3" fill="#2f7d3a"/><rect x="-70" y="-25" width="140" height="9" rx="3" fill="#2f7d3a"/><rect x="-74" y="-12" width="148" height="9" rx="3" fill="#3f9a4c"/>
<rect x="-64" y="-3" width="6" height="22" fill="#555"/><rect x="58" y="-3" width="6" height="22" fill="#555"/><rect x="-64" y="-40" width="6" height="30" fill="#555"/><rect x="58" y="-40" width="6" height="30" fill="#555"/>
<path d="M-50 -12 l-6 -14 h20 l-4 14z" fill="#fff3d6" stroke="#c9a46a"/><g fill="#3a2a22">${[[-48,-18],[-44,-21],[-42,-16],[-38,-19]].map(([a,b])=>`<ellipse cx="${a}" cy="${b}" rx="1.4" ry="2.4"/>`).join('')}</g>
<g fill="#3a2a22">${[[-30,-8],[-20,-5],[-10,-9],[2,-6],[-24,24],[-6,28],[14,22],[30,30]].map(([a,b])=>`<ellipse cx="${a}" cy="${b}" rx="1.3" ry="2.2" transform="rotate(30 ${a} ${b})"/>`).join('')}</g>
<g transform="translate(26 -18)"><circle r="9" fill="#e8475a"/><path d="M-8 -3 q8 4 16 0 M-8 3 q8 4 16 0" stroke="#c13545" stroke-width="1.5" fill="none"/><path d="M-4 -16 L4 8 M6 -14 L-2 8" stroke="#c9a46a" stroke-width="2"/><path d="M9 2 q20 10 26 28" stroke="#e8475a" stroke-width="1.5" fill="none"/></g>
</g>
<g transform="translate(196 196)"><rect x="-36" y="-15" width="72" height="17" rx="2" fill="#fff8d6" stroke="#c9a46a"/><text x="0" y="-3" text-anchor="middle" font-size="7.5" font-weight="700" fill="#3a2a22">ЗАНЯТО с 1975 г.</text><path d="M-20 2 v8 M20 2 v8" stroke="#8a6a4a" stroke-width="2"/></g>
<g fill="#8d8f99">${[[110,282],[140,290],[262,286]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="8" ry="5.5"/><circle cx="${x+7}" cy="${y-4}" r="3.6"/><path d="M${x+10} ${y-5} l3 1 l-3 1z" fill="#f5a623"/>`).join('')}</g>
</svg>`;}};})();
