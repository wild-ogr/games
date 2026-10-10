/* Место 6 «Электричка» (ART-1). Фон главы 400×300. Подключение: ZB.load('content/art/place-06.js').then(()=>el.innerHTML=ZB_ART[6].svg()) — см. README-1.md.
   Вагон электрички: окна с берёзами, деревянные лавки, полка с вёдрами и рассадой, табло «Следующая — Дачная», лоток «Буквы: 3 по цене 2!». */
(function(){var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[6]={id:'elektrichka',n:'Электричка',c:'#e8e3fa',svg:function(r){var u='a6_'+(++k);r=r||'xMidYMid slice';
var birch=function(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-50" width="6" height="54" fill="#f4f1ea"/><g fill="#333"><rect x="-3" y="-40" width="4" height="2"/><rect x="-3" y="-24" width="4" height="2"/></g><g fill="#7cbf63"><circle cx="0" cy="-58" r="18"/><circle cx="-12" cy="-46" r="12"/><circle cx="12" cy="-46" r="12"/></g></g>`;};
var win=function(x){return `<g transform="translate(${x} 46)"><rect width="104" height="80" rx="10" fill="#d9d2ef"/><rect x="6" y="6" width="92" height="68" rx="7" fill="url(#v${u})"/>
<g clip-path="url(#c${u})" transform="translate(6 6)"><path d="M0 48 q40 -10 92 -2 v22 h-92z" fill="#9fcf7a"/>${birch(16,56,.8)}${birch(46,52,.6)}${birch(80,58,.9)}<g fill="#fff" opacity=".9"><ellipse cx="60" cy="12" rx="16" ry="5"/></g></g>
<path d="M6 40 h92" stroke="#bfb6dd" stroke-width="3"/></g>`;};
var bench=function(x,f){return `<g transform="translate(${x} 0)"><rect x="0" y="150" width="120" height="62" rx="6" fill="#b07a48"/>${[0,1,2,3].map(i=>`<path d="M4 ${160+i*14} h112" stroke="#8a5a34" stroke-width="3"/>`).join('')}
<rect x="-4" y="206" width="128" height="14" rx="4" fill="#c9915a"/><path d="M4 220 h112 v24 h-112z" fill="#8a5a34"/><rect x="4" y="216" width="112" height="3" fill="#a5703f"/></g>`;};
return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block">
<defs><linearGradient id="v${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#eef8ff"/></linearGradient>
<linearGradient id="w${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece7fb"/><stop offset="1" stop-color="#ddd5f3"/></linearGradient>
<clipPath id="c${u}"><rect width="92" height="68" rx="7"/></clipPath></defs>
<rect width="400" height="300" fill="url(#w${u})"/><rect x="0" y="0" width="400" height="16" fill="#cfc6ea"/><g fill="#fff8d6"><rect x="40" y="4" width="70" height="7" rx="3"/><rect x="290" y="4" width="70" height="7" rx="3"/></g>
<path d="M0 36 h400" stroke="#9aa3ae" stroke-width="3"/><path d="M0 30 h400" stroke="#9aa3ae" stroke-width="2"/>
<g transform="translate(20 22)"><path d="M0 8 h22 l-3 -14 h-16z" fill="#2f6fd6"/><path d="M3 -6 q8 -8 16 0" stroke="#1d4fa3" stroke-width="2" fill="none"/></g>
<g transform="translate(60 18)"><rect x="0" y="0" width="30" height="12" rx="2" fill="#f0d79a"/><g fill="#4f9a3c">${[4,10,16,22,28].map(x=>`<path d="M${x} 0 q-3 -10 0 -12 q3 2 0 12z"/>`).join('')}</g></g>
<g transform="translate(330 20)"><path d="M0 10 h24 l-3 -14 h-18z" fill="#9aa3ae"/><path d="M3 -4 q9 -8 18 0" stroke="#5f6876" stroke-width="2" fill="none"/></g>
${win(16)}${win(280)}
<g transform="translate(140 42)"><rect width="120" height="40" rx="4" fill="#2b2f3a"/><text x="60" y="15" text-anchor="middle" font-size="8" fill="#9aa3ae">СЛЕДУЮЩАЯ</text><text x="60" y="31" text-anchor="middle" font-size="13" font-weight="700" fill="#ffb84d">ДАЧНАЯ</text></g>
<g transform="translate(150 92)"><rect width="100" height="22" rx="3" fill="#fff" stroke="#bfb6dd"/><text x="50" y="9" text-anchor="middle" font-size="6" fill="#3a2a22">Безбилетник — штраф 500 ₽.</text><text x="50" y="17" text-anchor="middle" font-size="6" fill="#e8475a">Рассада едет бесплатно.</text></g>
<rect x="0" y="130" width="400" height="20" fill="#cfc6ea"/>
<rect x="0" y="240" width="400" height="60" fill="#8f8aa6"/><path d="M0 240 h400" stroke="#76718c" stroke-width="3"/>${[0,1,2,3,4,5,6,7,8,9].map(i=>`<path d="M${i*44} 244 v56" stroke="#827d9a" stroke-width="2"/>`).join('')}
${bench(10)}${bench(270)}
<g transform="translate(70 208)"><path d="M-14 0 h28 l-3 -20 h-22z" fill="#e8475a"/><path d="M-10 -20 q10 -12 20 0" stroke="#b83b44" stroke-width="2" fill="none"/><g fill="#4f9a3c">${[-8,-2,4,10].map(x=>`<path d="M${x} -20 q-3 -12 1 -16 q3 6 -1 16z"/>`).join('')}</g></g>
<g transform="translate(320 198)"><circle r="10" fill="#f5b060"/><path d="M-8 -6 l-3 -10 l8 6z M8 -6 l3 -10 l-8 6z" fill="#f5b060"/><ellipse cx="0" cy="8" rx="14" ry="6" fill="#f5b060"/><path d="M-5 -1 q2 -2 4 0 M2 -1 q2 -2 4 0" stroke="#3a2a22" stroke-width="1.5" fill="none"/><path d="M12 8 q10 -2 8 -12" stroke="#f0a24c" stroke-width="4" fill="none" stroke-linecap="round"/></g>
<g transform="translate(200 210)"><rect x="-44" y="-22" width="88" height="34" rx="4" fill="#f0d79a" stroke="#b9860f" stroke-width="1.5"/><path d="M-44 -22 L-30 -70 M44 -22 L30 -70" stroke="#b9860f" stroke-width="2"/>
<g font-size="11" font-weight="700" text-anchor="middle">${[['Ж',-30,'#e8475a'],['У',-14,'#2f6fd6'],['К',2,'#f5b72d'],['Ш',18,'#2f9a5a'],['Ю',32,'#b48be0']].map(([l,x,c],i)=>`<g transform="translate(${x} ${-30+(i%2)*3})"><rect x="-7" y="-9" width="14" height="14" rx="3" fill="#fff" stroke="${c}" stroke-width="1.5"/><text y="2.5" fill="${c}">${l}</text></g>`).join('')}</g>
<text y="-7" text-anchor="middle" font-size="8" font-weight="700" fill="#3a2a22">БУКВЫ</text><text y="5" text-anchor="middle" font-size="7.5" font-weight="700" fill="#e8475a">3 по цене 2!</text></g>
</svg>`;}};})();
