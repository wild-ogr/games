/* Место 9 «Юбилей» (ART-1). Фон главы 400×300. Подключение: ZB.load('content/art/place-09.js').then(()=>el.innerHTML=ZB_ART[9].svg()) — см. README-1.md.
   Комната с ковром на стене, флажки «С ЮБИЛЕЕМ!», шарики, стол: торт «75», оливье в хрустале, холодец, селёдка под шубой, подарки. */
(function(){var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[9]={id:'yubiley',n:'Юбилей',c:'#fde2ef',svg:function(r){var u='a9_'+(++k);r=r||'xMidYMid slice';
var fl='',L='С ЮБИЛЕЕМ!'.split(''),cs=['#e8475a','#f5b72d','#2f6fd6','#2f9a5a','#b48be0'];
L.forEach(function(ch,i){var x=92+i*24,y=36+Math.sin(i/(L.length-1)*Math.PI)*12;fl+=`<g transform="translate(${x} ${y})"><path d="M-10 0 h20 l-10 22z" fill="${cs[i%5]}"/><text y="10" text-anchor="middle" font-size="9" font-weight="700" fill="#fff">${ch===' '?'':ch}</text></g>`;});
var ball=function(x,y,c){return `<g transform="translate(${x} ${y})"><ellipse rx="15" ry="18" fill="${c}"/><ellipse cx="-5" cy="-7" rx="4" ry="6" fill="#fff" opacity=".45"/><path d="M0 18 l-3 5 h6z" fill="${c}"/><path d="M0 23 q-6 16 2 30 q6 14 -2 30" stroke="#9aa3ae" stroke-width="1.2" fill="none"/></g>`;};
var orn='';for(var i=0;i<5;i++)for(var j=0;j<3;j++)orn+=`<g transform="translate(${110+i*45} ${92+j*34})"><path d="M0 -12 l12 12 l-12 12 l-12 -12z" fill="${(i+j)%2?'#f5b72d':'#2f6fd6'}"/><path d="M0 -6 l6 6 l-6 6 l-6 -6z" fill="#fff4e0"/></g>`;
return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block">
<defs><pattern id="wp${u}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#fbe3ee"/><circle cx="6" cy="6" r="2.4" fill="#f4c2d6"/><circle cx="18" cy="18" r="2.4" fill="#f4c2d6"/></pattern>
<linearGradient id="t${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f1ecf4"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#wp${u})"/>
<g transform="translate(0 0)"><rect x="80" y="64" width="240" height="122" rx="4" fill="#b8323f"/><rect x="88" y="72" width="224" height="106" fill="#c9404c" stroke="#f5b72d" stroke-width="3"/>${orn}
<path d="M80 64 v122 M320 64 v122" stroke="#f5d78a" stroke-width="4" stroke-dasharray="2 4"/></g>
<path d="M70 30 q130 30 260 0" stroke="#8a5a34" stroke-width="1.5" fill="none"/>${fl}
${ball(40,70,'#e8475a')}${ball(64,90,'#f5b72d')}${ball(350,66,'#2f6fd6')}${ball(374,92,'#2f9a5a')}
<rect x="0" y="236" width="400" height="64" fill="#b07a48"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${i*56} 236 v64" stroke="#9a6638" stroke-width="2"/>`).join('')}
<path d="M20 186 h360 l16 70 h-392z" fill="url(#t${u})"/><path d="M4 256 h392" stroke="#e5dce9" stroke-width="4"/>
<g fill="#f2a0b8">${[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(i=>`<circle cx="${10+i*20}" cy="258" r="5"/>`).join('')}</g>
<g transform="translate(200 186)"><ellipse cx="0" cy="2" rx="46" ry="8" fill="#e6e9ef"/><rect x="-36" y="-34" width="72" height="34" rx="4" fill="#fff0d6"/><rect x="-36" y="-22" width="72" height="8" fill="#f2a0b8"/><path d="M-36 -34 q9 8 18 0 q9 8 18 0 q9 8 18 0 q9 8 18 0" fill="#fff" stroke="#f2a0b8" stroke-width="2"/>
<rect x="-26" y="-60" width="52" height="26" rx="4" fill="#fff0d6"/><path d="M-26 -60 q6.5 6 13 0 q6.5 6 13 0 q6.5 6 13 0 q6.5 6 13 0" fill="#fff" stroke="#e8475a" stroke-width="2"/><text y="-40" text-anchor="middle" font-size="13" font-weight="700" fill="#e8475a">75</text>
${[-16,-6,4,14].map(x=>`<rect x="${x-1.5}" y="-76" width="3" height="16" fill="${x%4?'#2f6fd6':'#f5b72d'}"/><path d="M${x} -78 q-3 -5 0 -9 q3 4 0 9z" fill="#ffb84d"/>`).join('')}
<g fill="#e8475a">${[-28,-10,8,26].map(x=>`<circle cx="${x}" cy="-8" r="3"/>`).join('')}</g></g>
<g transform="translate(96 190)"><path d="M-30 -18 h60 l-8 18 h-44z" fill="#d9eef7" stroke="#9cc3e6" stroke-width="2"/><path d="M-26 -14 l6 10 l6 -10 l6 10 l6 -10 l6 10 l6 -10 l6 10 l6 -10" stroke="#fff" stroke-width="1.5" fill="none"/><ellipse cx="0" cy="-18" rx="30" ry="6" fill="#f3e6b0"/>
<g fill="#5ea54a"><circle cx="-12" cy="-20" r="2"/><circle cx="6" cy="-21" r="2"/></g><g fill="#f58a2a"><rect x="-4" y="-22" width="4" height="3"/><rect x="14" y="-20" width="4" height="3"/></g><path d="M0 0 v6 M-10 6 h20" stroke="#9cc3e6" stroke-width="3"/><text y="22" text-anchor="middle" font-size="6" fill="#8a5a34">оливье</text></g>
<g transform="translate(306 196)"><ellipse rx="34" ry="9" fill="#fff" stroke="#c9d3e3" stroke-width="2"/><path d="M-26 -2 q26 -16 52 0 v4 q-26 8 -52 0z" fill="#b8325a"/><path d="M-26 -6 q26 -14 52 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/><text y="20" text-anchor="middle" font-size="6" fill="#8a5a34">шуба</text></g>
<g transform="translate(48 206)"><rect x="-22" y="-12" width="44" height="18" rx="3" fill="#f3dfc0" stroke="#d6bf96"/><rect x="-18" y="-10" width="36" height="12" rx="2" fill="#efd3a6" opacity=".8"/><circle cx="-6" cy="-4" r="2" fill="#f58a2a"/><circle cx="6" cy="-6" r="1.5" fill="#5ea54a"/><text y="18" text-anchor="middle" font-size="6" fill="#8a5a34">холодец</text></g>
<g transform="translate(360 222)"><rect x="-20" y="-20" width="40" height="28" fill="#2f6fd6"/><rect x="-3" y="-20" width="6" height="28" fill="#f5b72d"/><path d="M0 -20 q-14 -14 -16 -2 q8 4 16 2 q14 -14 16 -2 q-8 4 -16 2" fill="#f5b72d"/></g>
<g transform="translate(150 224)"><rect x="-6" y="-26" width="12" height="28" rx="3" fill="#cfe6f5" opacity=".9" stroke="#9cc3e6"/><rect x="-6" y="-14" width="12" height="16" fill="#f58a8a" opacity=".8"/><rect x="18" y="-26" width="12" height="28" rx="3" fill="#cfe6f5" opacity=".9" stroke="#9cc3e6"/><rect x="18" y="-12" width="12" height="14" fill="#ffd34d" opacity=".8"/></g>
</svg>`;}};})();
