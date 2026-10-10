/* Место 20 (ART-3) · глава 20 «Академия наук» — «Меня позвали в академики. Шучу. Но могли бы.»
   Фон главы 400×300. Подключение: ZB.load('content/art/place-20.js').then(()=>el.innerHTML=ZB_ART[20].svg()) — см. README-3.md.
   Здание Академии с колоннами и «золотыми мозгами» на крыше, красная дорожка по ступеням,
   доска «ЖИ-ШИ пиши с И», объявление «Приём в академики — по средам», стопка книг и голубь в академической шапочке. */
(function(){
var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[20]={id:'akademiya',n:'Академия наук',c:'#ece4f6',svg:function(PA){var u='a20_'+(++k);PA=PA||'xMidYMid slice';
  var wins='';
  [[52,138],[52,184],[96,138],[96,184],[284,138],[284,184],[328,138],[328,184]].forEach(function(p){wins+='<rect x="'+p[0]+'" y="'+p[1]+'" width="20" height="32" fill="#9fc3e0"/><path d="M'+(p[0]+10)+' '+p[1]+' v32 M'+p[0]+' '+(p[1]+12)+' h20" stroke="#efe6d6" stroke-width="2"/><rect x="'+(p[0]-3)+'" y="'+(p[1]+32)+'" width="26" height="3" fill="#d8cbb4"/>';});
  var cols='';for(var i=0;i<6;i++){var x=146+i*22;cols+='<rect x="'+x+'" y="128" width="12" height="104" fill="#fbf6ec"/><rect x="'+(x-2)+'" y="124" width="16" height="5" fill="#e6dcc8"/><rect x="'+(x-2)+'" y="230" width="16" height="5" fill="#e6dcc8"/><path d="M'+(x+4)+' 132 v96 M'+(x+8)+' 132 v96" stroke="#e8decb" stroke-width="1"/>';}
  var brain='';
  [[176,96,13],[192,86,14],[210,86,14],[226,96,13],[184,104,11],[218,104,11],[201,100,13]].forEach(function(b){brain+='<circle cx="'+b[0]+'" cy="'+b[1]+'" r="'+b[2]+'"/>';});
  return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="'+PA+'" style="width:100%;height:100%;display:block">'
  +'<defs><linearGradient id="sk_'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9d0f2"/><stop offset="1" stop-color="#fbf7ff"/></linearGradient>'
  +'<linearGradient id="au_'+u+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe28a"/><stop offset=".55" stop-color="#e6b02e"/><stop offset="1" stop-color="#b9860f"/></linearGradient></defs>'
  +'<rect width="400" height="300" fill="url(#sk_'+u+')"/>'
  +'<g fill="#fff" opacity=".85"><ellipse cx="60" cy="50" rx="34" ry="10"/><ellipse cx="80" cy="43" rx="18" ry="9"/><ellipse cx="340" cy="60" rx="30" ry="9"/><ellipse cx="356" cy="54" rx="16" ry="8"/></g>'
  // крылья здания
  +'<rect x="36" y="122" width="328" height="114" fill="#efe6d6"/><rect x="30" y="114" width="340" height="10" fill="#e1d5bf"/>'+wins
  // центр: портик
  +'<rect x="130" y="118" width="140" height="118" fill="#f5eee2"/>'
  +'<path d="M124 120 L200 76 L276 120z" fill="#f5eee2" stroke="#e1d5bf" stroke-width="3"/>'
  +'<rect x="124" y="114" width="152" height="12" fill="#e1d5bf"/>'
  +'<text x="200" y="123" text-anchor="middle" font-family="Georgia,serif" font-size="8" font-weight="700" letter-spacing="1" fill="#6a5a3a">АКАДЕМИЯ НАУК</text>'
  // «золотые мозги»
  +'<g fill="url(#au_'+u+')" stroke="#b9860f" stroke-width="1">'+brain+'</g>'
  +'<path d="M180 92 q6 -6 10 2 q6 -8 12 0 q6 -8 12 0 q4 -6 10 0 M186 104 q8 -6 14 0 q8 -6 14 0" stroke="#b9860f" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
  +'<path d="M166 74 l-6 -6 M236 74 l6 -6 M201 66 v-8" stroke="#f5b72d" stroke-width="2.5" stroke-linecap="round"/>'
  +cols
  +'<path d="M186 236 v-30 q14 -14 28 0 v30z" fill="#7a5a3a"/><circle cx="208" cy="222" r="1.6" fill="#f5b72d"/>'
  // ступени и дорожка
  +'<rect x="110" y="234" width="180" height="8" fill="#ddd2bf"/><rect x="100" y="242" width="200" height="8" fill="#d2c6b1"/><rect x="90" y="250" width="220" height="8" fill="#c8bba5"/>'
  +'<path d="M186 234 h28 l8 24 h-44z" fill="#c8343e"/><path d="M188 242 h24 M186 250 h28" stroke="#a62a33" stroke-width="1"/>'
  +'<rect x="0" y="256" width="400" height="44" fill="#b7d78f"/><path d="M178 258 h44 l22 42 h-88z" fill="#c8343e"/><rect x="0" y="256" width="400" height="4" fill="#9cc477"/>'
  // доска на мольберте
  +'<path d="M54 290 L70 190 M110 290 L94 190 M82 190 v100" stroke="#8a5a3c" stroke-width="4" stroke-linecap="round"/>'
  +'<rect x="40" y="196" width="84" height="54" rx="3" fill="#2f5a46" stroke="#8a5a3c" stroke-width="4"/>'
  +'<text x="82" y="217" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="700" fill="#f4f1ea">ЖИ-ШИ</text>'
  +'<text x="82" y="234" text-anchor="middle" font-family="Georgia,serif" font-size="8.5" font-style="italic" fill="#f4f1ea">пиши с буквой И</text>'
  +'<path d="M58 240 q24 4 48 -2" stroke="#f5b72d" stroke-width="1.6" fill="none"/>'
  +'<rect x="44" y="248" width="76" height="4" fill="#8a5a3c"/><rect x="96" y="245" width="10" height="3" fill="#fff"/>'
  // стопка книг
  +'<rect x="124" y="276" width="42" height="9" rx="1" fill="#3b6fc4"/><rect x="128" y="267" width="36" height="9" rx="1" fill="#d8433f"/><rect x="122" y="258" width="40" height="9" rx="1" fill="#4c9a5a"/><path d="M126 262 h30 M130 271 h28 M128 280 h32" stroke="#fff" stroke-width="1" opacity=".6"/>'
  // объявление
  +'<rect x="330" y="214" width="5" height="80" fill="#6a6f7b"/>'
  +'<g transform="rotate(3 332 222)"><rect x="296" y="196" width="76" height="48" fill="#fffdf4" stroke="#c9d6e6"/><path d="M296 206 h76 M296 216 h76 M296 226 h76 M296 236 h76" stroke="#dbe6f3" stroke-width=".8"/><text x="334" y="210" text-anchor="middle" font-family="Georgia,serif" font-size="7.5" font-weight="700" fill="#b83b44">ОБЪЯВЛЕНИЕ</text><text x="334" y="222" text-anchor="middle" font-family="Georgia,serif" font-size="7" font-style="italic" fill="#2f6fd6">Приём в академики</text><text x="334" y="233" text-anchor="middle" font-family="Georgia,serif" font-size="7" font-style="italic" fill="#2f6fd6">— по средам</text><circle cx="334" cy="198" r="2" fill="#d8333a"/></g>'
  // голубь-академик
  +'<g transform="translate(252 250)"><ellipse cx="0" cy="0" rx="10" ry="7" fill="#9aa0ad"/><path d="M-10 -1 l-7 -3 l1 7z" fill="#7d8391"/><circle cx="8" cy="-7" r="4.6" fill="#8b91a0"/><circle cx="9.5" cy="-8" r="1.1" fill="#222"/><path d="M12.4 -7 l3.5 1 l-3.5 1.4z" fill="#e9a23b"/><path d="M-1 7 v4 M2 7 v4" stroke="#e98a6b" stroke-width="1.3"/>'
  +'<path d="M2 -14 l7 -3 l7 3 l-7 3z" fill="#2a2a3a"/><rect x="5" y="-13" width="8" height="3" fill="#2a2a3a"/><path d="M16 -14 v6" stroke="#f5b72d" stroke-width="1.2"/><circle cx="16" cy="-7.5" r="1.3" fill="#f5b72d"/></g>'
  +'</svg>';}};
})();
