/* Место 3 «Рынок» (ART-1). Фон главы 400×300. Подключение: ZB.load('content/art/place-03.js').then(()=>el.innerHTML=ZB_ART[3].svg()) — см. README-1.md.
   Два прилавка под полосатыми навесами, весы с гирькой, ценники с торгом, гора арбузов, ящик «свежих букв». */
(function(){var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[3]={id:'rynok',n:'Рынок',c:'#ffe7cf',svg:function(r){var u='a3_'+(++k);r=r||'xMidYMid slice';
var awn=function(x,w,c1,c2){var n=Math.round(w/20),s='';for(var i=0;i<n;i++)s+=`<path d="M${x+i*w/n} 70 h${w/n} v22 q-${w/n/2} 10 -${w/n} 0z" fill="${i%2?c2:c1}"/>`;return `<rect x="${x}" y="62" width="${w}" height="10" fill="${c1}"/>${s}`;};
var tag=function(x,y,a,b,rot){return `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-30" y="-12" width="60" height="24" rx="2" fill="#fff" stroke="#c9a46a"/><text y="-2" text-anchor="middle" font-size="7" font-weight="700" fill="#3a2a22">${a}</text><text y="8" text-anchor="middle" font-size="6" fill="#e8475a">${b}</text></g>`;};
var carrot=function(x,y,a){return `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-4 0 q4 26 4 26 q0 0 4 -26z" fill="#f58a2a"/><path d="M0 0 l-5 -9 M0 0 l0 -10 M0 0 l5 -9" stroke="#4f9a3c" stroke-width="2.4" stroke-linecap="round"/></g>`;};
var veg='';[[50,146,-78],[56,140,-86],[62,134,-80],[90,146,-96],[96,140,-90],[102,134,-100],[70,128,-88]].forEach(function(v){veg+=carrot(v[0],v[1],v[2]);});
var app='';[[226,150],[240,152],[254,150],[268,152],[233,142],[247,143],[261,142],[247,134]].forEach(function(p,i){app+=`<circle cx="${p[0]}" cy="${p[1]}" r="8" fill="${i%3?'#e8475a':'#f5b72d'}"/><path d="M${p[0]} ${p[1]-8} l2 -4" stroke="#6b4a32" stroke-width="1.5"/>`;});
var cuc='';[[300,148,-10],[316,150,8],[332,148,-4],[308,140,12],[324,141,-14]].forEach(function(p){cuc+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="11" ry="4.5" fill="#4f9a3c" transform="rotate(${p[2]} ${p[0]} ${p[1]})"/>`;});
var wm='';[[150,262],[180,264],[210,262],[165,246],[195,247],[180,231]].forEach(function(p){wm+=`<g transform="translate(${p[0]} ${p[1]})"><ellipse rx="17" ry="14" fill="#3c8a3a"/><path d="M-14 -4 q14 -8 28 0 M-15 4 q15 -6 30 0" stroke="#7cc46a" stroke-width="2.5" fill="none"/></g>`;});
return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block">
<defs><linearGradient id="s${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a8"/><stop offset="1" stop-color="#fff4e3"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#s${u})"/>
<circle cx="70" cy="34" r="20" fill="#fff0a8"/>
<rect x="150" y="12" width="100" height="22" rx="4" fill="#2f6fd6"/><text x="200" y="28" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">РЫНОК</text>
<path d="M156 34 v28 M244 34 v28" stroke="#5f6876" stroke-width="3"/>
<rect x="0" y="192" width="400" height="108" fill="#d9cbb3"/><path d="M0 192 h400" stroke="#c4b496" stroke-width="3"/>
<rect x="24" y="72" width="4" height="120" fill="#7a5a3a"/><rect x="186" y="72" width="4" height="120" fill="#7a5a3a"/>
${awn(18,176,'#e8475a','#fff')}
<rect x="214" y="72" width="4" height="120" fill="#7a5a3a"/><rect x="376" y="72" width="4" height="120" fill="#7a5a3a"/>
${awn(208,176,'#2f9a5a','#fff')}
<rect x="30" y="156" width="156" height="36" fill="#b07a48"/><rect x="26" y="152" width="164" height="8" rx="2" fill="#c9915a"/>
<rect x="220" y="156" width="156" height="36" fill="#b07a48"/><rect x="216" y="152" width="164" height="8" rx="2" fill="#c9915a"/>
${veg}${app}${cuc}
<g transform="translate(150 150)"><rect x="-18" y="-4" width="36" height="6" rx="2" fill="#e6e9ef"/><rect x="-8" y="2" width="16" height="10" fill="#cfd4dc"/><path d="M-22 -4 q22 -8 44 0" stroke="#9aa3ae" stroke-width="3" fill="none"/><rect x="-12" y="-16" width="24" height="12" rx="2" fill="#fff" stroke="#9aa3ae"/><path d="M0 -6 l5 -7" stroke="#e8475a" stroke-width="1.5"/>
<path d="M22 -2 h10 l-2 -10 h-6z" fill="#5f6876"/><text x="27" y="-3" text-anchor="middle" font-size="5" fill="#fff">1кг</text></g>
${tag(68,108,'Морковь 40 ₽','торг уместен',-4)}${tag(136,110,'Свёкла 30 ₽','без торга — обида',3)}
${tag(250,108,'Яблоки 60 ₽','свои, не магазин',-3)}${tag(326,110,'Огурцы 80 ₽','хрустят громко',4)}
${wm}
<g transform="translate(290 256)"><rect x="-34" y="-20" width="68" height="34" fill="#c9915a"/><path d="M-34 -8 h68 M-34 4 h68" stroke="#a5703f" stroke-width="2"/>
<g font-size="12" font-weight="700" text-anchor="middle">${[['А',-22,'#e8475a'],['Б',-8,'#2f6fd6'],['В',6,'#f5b72d'],['Г',20,'#2f9a5a']].map(([l,x,c])=>`<g transform="translate(${x} -24) rotate(${x/3})"><rect x="-7" y="-9" width="14" height="14" rx="3" fill="#fff" stroke="${c}" stroke-width="1.5"/><text y="2.5" fill="${c}">${l}</text></g>`).join('')}</g>
<rect x="-30" y="-2" width="60" height="13" fill="#fff8d6"/><text y="8" text-anchor="middle" font-size="7.5" font-weight="700" fill="#3a2a22">Свежие буквы!</text></g>
<g transform="translate(80 256)"><path d="M-24 -10 h48 l-6 30 h-36z" fill="#e8c27a" stroke="#b9860f"/><path d="M-20 -10 q20 -26 40 0" stroke="#b9860f" stroke-width="3" fill="none"/><circle cx="-8" cy="-14" r="7" fill="#e8475a"/><circle cx="6" cy="-14" r="7" fill="#f5b72d"/><path d="M-22 0 h44 M-20 10 h40" stroke="#b9860f" stroke-width="1.5"/></g>
</svg>`;}};})();
