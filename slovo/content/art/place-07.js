/* Место 7 «Баня» (ART-1). Фон главы 400×300. Подключение: ZB.load('content/art/place-07.js').then(()=>el.innerHTML=ZB_ART[7].svg()) — см. README-1.md.
   Парная: бревенчатые стены, полок, печка-каменка с паром, шайка с ковшом, берёзовый веник, войлочная шапка «ЗИНА» на крючке, градусник, песочные часы. */
(function(){var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[7]={id:'banya',n:'Баня',c:'#fbe0dc',svg:function(r){var u='a7_'+(++k);r=r||'xMidYMid slice';
var logs='';for(var i=0;i<9;i++)logs+=`<rect x="0" y="${i*24}" width="400" height="22" rx="11" fill="${i%2?'#e3b27a':'#dca46a'}"/><path d="M0 ${i*24+16} h400" stroke="#c98e52" stroke-width="1.5" opacity=".6"/>`;
var steam=function(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".55"><circle r="16"/><circle cx="18" cy="-6" r="13"/><circle cx="-16" cy="-4" r="11"/><circle cx="4" cy="-18" r="12"/></g>`;};
var leaf=function(x,y,a){return `<ellipse cx="${x}" cy="${y}" rx="10" ry="5" fill="#5ea54a" stroke="#4f9a3c" transform="rotate(${a} ${x} ${y})"/>`;};
var ven='';[[-10,30,-30],[8,34,30],[-14,46,-50],[12,50,50],[-6,58,-20],[6,62,20],[0,44,90],[-18,38,-70],[18,42,70],[0,70,0],[-8,24,-60],[8,24,60],[0,54,0],[-12,64,-30],[12,66,30]].forEach(function(p){ven+=leaf(p[0],p[1],p[2]);});
return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block">
<defs><radialGradient id="h${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb070"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient></defs>
<rect width="400" height="300" fill="#dca46a"/>${logs}
<g transform="translate(150 30)"><rect width="100" height="26" rx="4" fill="#8a5a34"/><text x="50" y="18" text-anchor="middle" font-size="11" font-weight="700" fill="#ffe7c2">С лёгким паром!</text><path d="M20 0 l6 -8 M80 0 l-6 -8" stroke="#6b4325" stroke-width="2"/></g>
<g transform="translate(40 30)"><rect width="20" height="64" rx="10" fill="#fff" stroke="#a5703f" stroke-width="2"/><rect x="7" y="16" width="6" height="40" rx="3" fill="#f3e6d6"/><rect x="7" y="24" width="6" height="32" rx="3" fill="#e8475a"/><circle cx="10" cy="56" r="6" fill="#e8475a"/>
<text x="30" y="24" font-size="9" font-weight="700" fill="#6b4325">90°</text><text x="30" y="36" font-size="6" fill="#6b4325">(нормально)</text></g>
<g transform="translate(110 70)"><path d="M0 0 v10" stroke="#6b4325" stroke-width="3"/><path d="M-24 34 q24 -36 48 0 q-8 6 -24 6 q-16 0 -24 -6z" fill="#efe1c8"/><path d="M-26 34 q26 10 52 0 l4 6 q-30 12 -60 0z" fill="#e3cfa8"/><text x="0" y="30" text-anchor="middle" font-size="9" font-weight="700" fill="#e8475a">ЗИНА</text><path d="M-14 16 q14 -6 28 0" stroke="#d6c09a" stroke-width="2" fill="none"/></g>
<g transform="translate(262 60)"><path d="M0 0 v14" stroke="#6b4325" stroke-width="3"/><path d="M-4 14 h8 v20 h-8z" fill="#8a5a34"/><path d="M-4 30 h8" stroke="#e8475a" stroke-width="3"/>${ven}</g>
<g transform="translate(300 40)"><path d="M-10 0 h20 l-8 14 l8 14 h-20 l8 -14z" fill="#d9f1fb" stroke="#8a5a34" stroke-width="2"/><path d="M-5 4 h10 l-5 9z M-4 26 h8 l-4 -6z" fill="#f5b72d"/></g>
<rect x="0" y="150" width="270" height="18" rx="4" fill="#c98a4f"/><rect x="0" y="146" width="270" height="6" rx="3" fill="#e2b07a"/><path d="M20 168 v60 M240 168 v60" stroke="#a96f3a" stroke-width="8"/>
<rect x="0" y="200" width="250" height="16" rx="4" fill="#c98a4f"/><rect x="0" y="196" width="250" height="6" rx="3" fill="#e2b07a"/>
<g transform="translate(90 146)"><rect x="-22" y="-8" width="44" height="8" rx="3" fill="#fff"/><rect x="-20" y="-15" width="40" height="7" rx="3" fill="#f2a0a0"/><path d="M-20 -11 h40 M-22 -4 h44" stroke="#e8475a" stroke-width="1.5"/></g>
<g transform="translate(330 220)"><rect x="-44" y="-70" width="88" height="96" rx="6" fill="#5f6876"/><rect x="-36" y="-34" width="72" height="34" rx="4" fill="#3a3f48"/><rect x="-28" y="-28" width="56" height="22" rx="3" fill="#ff8a3d"/><circle cx="0" cy="-17" r="18" fill="url(#h${u})"/>
<g fill="#9aa3ae">${[[-30,-76],[-16,-80],[0,-78],[16,-81],[30,-76],[-22,-88],[-6,-90],[10,-90],[24,-87],[-12,-99],[6,-100]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="10" ry="7"/>`).join('')}</g><path d="M-44 4 h88" stroke="#4a515c" stroke-width="3"/></g>
${steam(310,112,1)}${steam(350,96,.8)}${steam(200,110,.9)}${steam(170,80,.6)}
<rect x="0" y="236" width="400" height="64" fill="#b77d48"/>${[0,1,2,3,4,5,6,7,8].map(i=>`<path d="M${i*50} 236 v64" stroke="#9a6638" stroke-width="2"/>`).join('')}
<g transform="translate(200 254)"><path d="M-26 -26 h52 l-6 34 h-40z" fill="#c98a4f"/><path d="M-24 -16 h48 M-22 -2 h44" stroke="#6b4325" stroke-width="3"/><ellipse cx="0" cy="-26" rx="26" ry="5" fill="#9cd6f0"/><path d="M-30 -24 v-8 M30 -24 v-8" stroke="#a96f3a" stroke-width="5" stroke-linecap="round"/>
<g transform="translate(16 -32) rotate(-30)"><ellipse rx="9" ry="6" fill="#a96f3a"/><path d="M8 -2 l28 -6" stroke="#a96f3a" stroke-width="4" stroke-linecap="round"/></g></g>
<g transform="translate(70 270)" fill="#e8475a"><ellipse cx="-10" cy="0" rx="8" ry="14" transform="rotate(-10 -10 0)"/><ellipse cx="10" cy="2" rx="8" ry="14" transform="rotate(8 10 2)"/><path d="M-17 -6 q7 -6 14 0 M3 -4 q7 -6 14 0" stroke="#fff" stroke-width="3" fill="none"/></g>
</svg>`;}};})();
