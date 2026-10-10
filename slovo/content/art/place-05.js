/* Место 5 «Дача» (ART-1). Фон главы 400×300. Подключение: ZB.load('content/art/place-05.js').then(()=>el.innerHTML=ZB_ART[5].svg()) — см. README-1.md.
   Домик с верандой, подсолнухи, грядки, тачка с гигантским кабачком, табличка «Кабачки даром. Умоляю!», лейка, пугало в платочке. */
(function(){var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[5]={id:'dacha',n:'Дача',c:'#fff3c4',svg:function(r){var u='a5_'+(++k);r=r||'xMidYMid slice';
var sun=function(x,y,s){var p='';for(var i=0;i<12;i++)p+=`<ellipse cx="0" cy="-13" rx="4.5" ry="9" fill="#f5b72d" transform="rotate(${i*30})"/>`;return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 V90" stroke="#4f9a3c" stroke-width="4"/><ellipse cx="-10" cy="40" rx="11" ry="5" fill="#5ea54a" transform="rotate(-30 -10 40)"/><ellipse cx="10" cy="60" rx="11" ry="5" fill="#5ea54a" transform="rotate(30 10 60)"/>${p}<circle r="9" fill="#7a4f2e"/><g fill="#5a3820">${[[-3,-3],[3,-2],[0,3],[-4,3],[4,4]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="1.3"/>`).join('')}</g></g>`;};
var bed=function(y,c){var s='';for(var i=0;i<9;i++)s+=`<g transform="translate(${200+i*22} ${y})"><path d="M0 0 q-6 -10 -2 -14 M0 0 q6 -10 2 -14 M0 0 v-12" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`;return `<path d="M188 ${y+2} h200 l6 10 h-212z" fill="#8a5a34"/>${s}`;};
return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="${r}" style="width:100%;height:100%;display:block">
<defs><linearGradient id="s${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#fffaf0"/></linearGradient>
<linearGradient id="g${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6dc84"/><stop offset="1" stop-color="#93c766"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#s${u})"/>
<circle cx="330" cy="40" r="24" fill="#ffd34d"/><circle cx="330" cy="40" r="36" fill="#ffd34d" opacity=".25"/>
<path d="M0 150 q80 -30 160 -6 t240 -10 v30 h-400z" fill="#a9cf86"/><g fill="#6fae52"><circle cx="20" cy="140" r="18"/><circle cx="48" cy="134" r="22"/><circle cx="380" cy="132" r="20"/></g>
<rect x="0" y="150" width="400" height="150" fill="url(#g${u})"/>
<g stroke="#c9a46a" stroke-width="5">${[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i=>`<path d="M${6+i*29} 168 v-26"/>`).join('')}</g><path d="M0 150 h400 M0 162 h400" stroke="#b08a50" stroke-width="3"/>
<g transform="translate(40 66)"><rect x="0" y="40" width="110" height="94" fill="#c98a4f"/>${[0,1,2,3,4,5,6].map(i=>`<path d="M0 ${52+i*13} h110" stroke="#a96f3a" stroke-width="2"/>`).join('')}
<path d="M-10 44 L55 0 L120 44z" fill="#e8475a"/><path d="M-10 44 L55 0 L120 44" stroke="#b83b44" stroke-width="4" fill="none"/>
<rect x="18" y="60" width="30" height="28" fill="#fff"/><rect x="21" y="63" width="24" height="22" fill="#9cc3e6"/><path d="M33 63 v22 M21 74 h24" stroke="#fff" stroke-width="2.5"/><path d="M21 63 q6 10 0 22z M45 63 q-6 10 0 22z" fill="#f2a0a0"/>
<rect x="66" y="74" width="28" height="60" fill="#7a4f2e"/><circle cx="88" cy="106" r="2.5" fill="#f5b72d"/><rect x="45" y="18" width="20" height="18" fill="#fff"/><circle cx="55" cy="27" r="6" fill="#9cc3e6"/>
<rect x="76" y="0" width="10" height="20" fill="#9c6a3a"/><path d="M81 -4 q6 -8 0 -14 q-6 -6 2 -14" stroke="#ccc" stroke-width="3" fill="none" opacity=".7"/></g>
${sun(170,110,1)}${sun(16,124,.9)}${sun(196,124,.8)}
${bed(196,'#4f9a3c')}${bed(226,'#6aa83c')}
<g transform="translate(228 230)"><g fill="#3f8a3a"><ellipse cx="-10" cy="-6" rx="12" ry="8"/><ellipse cx="12" cy="-6" rx="12" ry="8"/></g><circle cx="-2" cy="-10" r="5" fill="#f5b72d"/></g>
<g transform="translate(330 214)"><path d="M0 -60 V40" stroke="#8a5a34" stroke-width="5"/><path d="M-34 -36 H34" stroke="#8a5a34" stroke-width="4"/>
<path d="M-18 -30 h36 l8 46 h-52z" fill="#2f6fd6"/><g fill="#fff">${[[-10,-20],[6,-14],[-4,-2],[10,4],[-14,8]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="2.2"/>`).join('')}</g>
<path d="M-34 -36 h-4 l2 8z M34 -36 h4 l-2 8z" fill="#c9a46a"/><circle cx="0" cy="-50" r="14" fill="#f0d79a"/><path d="M-6 -50 h3 M3 -50 h3" stroke="#3a2a22" stroke-width="2"/><path d="M-5 -44 q5 4 10 0" stroke="#b83b44" stroke-width="2" fill="none"/>
<path d="M-16 -54 q16 -22 32 0 q-16 -6 -32 0z" fill="#e8475a"/><path d="M14 -55 l9 5 l-7 4z" fill="#e8475a"/><g fill="#fff">${[[-8,-60],[0,-65],[8,-60]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="1.8"/>`).join('')}</g></g>
<g transform="translate(110 262)"><path d="M-40 -14 h70 l-8 24 h-54z" fill="#2f9a5a"/><path d="M30 -10 l26 -12" stroke="#5f6876" stroke-width="4" stroke-linecap="round"/><circle cx="-18" cy="16" r="9" fill="#3a3f48"/><circle cx="-18" cy="16" r="3" fill="#9aa3ae"/>
<ellipse cx="-4" cy="-20" rx="44" ry="14" fill="#9ac25a" transform="rotate(-6 -4 -20)"/><path d="M-44 -18 q40 -14 80 -6" stroke="#c9e08a" stroke-width="3" fill="none"/><path d="M38 -28 l8 -4" stroke="#5a7a3a" stroke-width="4"/></g>
<g transform="translate(36 236)"><rect x="-32" y="-18" width="64" height="28" fill="#fff8d6" stroke="#c9a46a" stroke-width="1.5" transform="rotate(-4)"/><text y="-6" text-anchor="middle" font-size="7" font-weight="700" fill="#3a2a22" transform="rotate(-4)">КАБАЧКИ</text><text y="4" text-anchor="middle" font-size="6.5" fill="#e8475a" transform="rotate(-4)">даром. Умоляю!</text><path d="M0 10 v26" stroke="#8a5a34" stroke-width="4"/></g>
<g transform="translate(268 274)"><path d="M-14 -14 h22 l-2 22 h-18z" fill="#2fa5b8"/><path d="M8 -10 l16 -12 l2 3" stroke="#2fa5b8" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-14 -10 q-10 -4 -4 -12 q8 -6 18 -4" stroke="#26919f" stroke-width="3" fill="none"/></g>
</svg>`;}};})();
