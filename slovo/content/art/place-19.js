/* Место 19 (ART-3) · глава 19 «Новый год» — «Оливье, холодец, куранты. Загадываем слово!»
   Фон главы 400×300. Подключение: ZB.load('content/art/place-19.js').then(()=>el.innerHTML=ZB_ART[19].svg()) — см. README-3.md.
   Комната вечером: окно со снегом, гирлянда, стол с оливье, холодцом, мандаринами и лимонадом,
   ёлка с шарами, подарки, телевизор с курантами без минуты двенадцать, из-под ёлки торчит хвост кота Ятя
   (шарик уже на полу). */
(function(){
var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[19]={id:'novyj-god',n:'Новый год',c:'#dff1e3',svg:function(PA){var u='a19_'+(++k);PA=PA||'xMidYMid slice';
  var tri=function(y,w,h,c){return '<path d="M'+(282-w)+' '+y+' q'+w+' 10 '+(w*2)+' 0 L282 '+(y-h)+'z" fill="'+c+'"/>';};
  var ball=function(x,y,c){return '<circle cx="'+x+'" cy="'+y+'" r="5.5" fill="'+c+'"/><circle cx="'+(x-1.8)+'" cy="'+(y-1.8)+'" r="1.6" fill="#fff" opacity=".7"/><rect x="'+(x-1.5)+'" y="'+(y-8)+'" width="3" height="3" fill="#d9a520"/>';};
  var lights='',cs=['#ff5a5a','#ffd23f','#5ad1ff','#7ee36a','#ff8ad8'];
  for(var i=0;i<14;i++){var x=8+i*29,y=20+Math.sin(i*1.1)*5+((i%2)?6:0);lights+='<circle cx="'+x+'" cy="'+y+'" r="4" fill="'+cs[i%5]+'"/><circle cx="'+x+'" cy="'+y+'" r="8" fill="'+cs[i%5]+'" opacity=".25"/>';}
  var snow='';for(var k=0;k<22;k++){snow+='<circle cx="'+(26+(k*37)%88)+'" cy="'+(66+(k*23)%84)+'" r="'+(1+(k%3)*.6)+'" fill="#fff"/>';}
  return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="'+PA+'" style="width:100%;height:100%;display:block">'
  +'<defs><pattern id="wp_'+u+'" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#f6e4c6"/><path d="M12 4 l3 4 l-3 4 l-3 -4z" fill="#ead2ac"/><circle cx="0" cy="18" r="2" fill="#ead2ac"/><circle cx="24" cy="18" r="2" fill="#ead2ac"/></pattern>'
  +'<linearGradient id="nt_'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16244d"/><stop offset="1" stop-color="#3a4f8c"/></linearGradient>'
  +'<radialGradient id="gl_'+u+'" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3b0" stop-opacity=".9"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient></defs>'
  +'<rect width="400" height="300" fill="url(#wp_'+u+')"/>'
  +'<path d="M0 22 q29 10 58 0 t58 0 t58 0 t58 0 t58 0 t58 0 t58 0" stroke="#3a5a3a" stroke-width="1.4" fill="none"/>'+lights
  // окно
  +'<rect x="18" y="52" width="100" height="112" fill="url(#nt_'+u+')"/><circle cx="96" cy="74" r="9" fill="#fff6c8"/>'
  +'<g fill="#2a3560"><rect x="20" y="124" width="26" height="40"/><rect x="50" y="112" width="24" height="52"/><rect x="78" y="128" width="20" height="36"/><rect x="100" y="118" width="18" height="46"/></g>'
  +'<g fill="#fff"><rect x="18" y="120" width="30" height="5" rx="2.5"/><rect x="48" y="108" width="28" height="5" rx="2.5"/><rect x="76" y="124" width="24" height="5" rx="2.5"/><rect x="98" y="114" width="22" height="5" rx="2.5"/></g>'
  +'<g fill="#ffd77a"><rect x="27" y="134" width="5" height="6"/><rect x="56" y="122" width="5" height="6"/><rect x="64" y="140" width="5" height="6"/><rect x="84" y="138" width="5" height="6"/><rect x="106" y="128" width="5" height="6"/></g>'
  +snow
  +'<rect x="14" y="48" width="108" height="120" fill="none" stroke="#fff" stroke-width="7"/><path d="M68 52 V164 M18 104 H118" stroke="#fff" stroke-width="5"/>'
  +'<rect x="8" y="164" width="120" height="8" rx="2" fill="#f2efe8"/>'
  +'<path d="M6 40 q14 60 4 130 h-8 v-130z" fill="#c8434c"/><path d="M130 40 q-14 60 -4 130 h8 v-130z" fill="#c8434c"/>'
  // телевизор на тумбочке
  +'<rect x="326" y="206" width="70" height="40" fill="#a0683e"/><rect x="332" y="212" width="58" height="10" rx="2" fill="#8a5734"/><circle cx="361" cy="217" r="2" fill="#e2b23a"/>'
  +'<rect x="328" y="148" width="66" height="58" rx="8" fill="#6a4a36"/><rect x="334" y="154" width="44" height="44" rx="6" fill="#2a3a5c"/>'
  +'<circle cx="381" cy="166" r="3.5" fill="#d9c7b2"/><circle cx="381" cy="178" r="3.5" fill="#d9c7b2"/>'
  +'<circle cx="356" cy="176" r="16" fill="#f4ecd8" stroke="#c9a24a" stroke-width="2"/><path d="M356 176 V163 M356 176 L354 162.5" stroke="#2a2a2a" stroke-width="2" stroke-linecap="round"/><circle cx="356" cy="176" r="1.8" fill="#2a2a2a"/>'
  +'<g fill="#2a2a2a">'+[0,3,6,9].map(function(h){var a=h*Math.PI/6;return '<circle cx="'+(356+Math.sin(a)*12.5)+'" cy="'+(176-Math.cos(a)*12.5)+'" r="1.3"/>';}).join('')+'</g>'
  +'<path d="M346 148 l-10 -18 M366 148 l10 -18" stroke="#555" stroke-width="2"/>'
  // ёлка
  +'<circle cx="282" cy="150" r="70" fill="url(#gl_'+u+')" opacity=".55"/>'
  +'<rect x="275" y="228" width="14" height="20" fill="#7a4f2e"/>'
  +tri(232,52,60,'#2f8f4e')+tri(196,42,54,'#38a05a')+tri(160,32,48,'#43b066')+tri(124,22,40,'#4fbe72')
  +'<path d="M250 210 q32 14 64 -6 M258 176 q24 12 50 -4 M266 142 q16 8 32 -4" stroke="#ffd23f" stroke-width="2" fill="none" stroke-dasharray="1 5" stroke-linecap="round"/>'
  +ball(258,214,'#e8475a')+ball(300,206,'#3b7fe0')+ball(274,180,'#f5b72d')+ball(296,168,'#e8475a')+ball(268,146,'#9b5de5')+ball(288,124,'#3b7fe0')+ball(310,226,'#f5b72d')
  +'<path d="M282 70 l4 9 l10 1 l-7 7 l2 10 l-9 -5 l-9 5 l2 -10 l-7 -7 l10 -1z" fill="#ffd23f" stroke="#e0a400" stroke-width="1"/>'
  // пол
  +'<rect x="0" y="246" width="400" height="54" fill="#c99b6a"/><g stroke="#b5875a" stroke-width="1.2">'+[260,276,292].map(function(y){return '<path d="M0 '+y+' H400"/>';}).join('')+'</g>'
  // подарки и хвост Ятя
  +'<rect x="244" y="232" width="26" height="22" fill="#e8475a"/><path d="M257 232 v22 M244 243 h26" stroke="#ffd23f" stroke-width="3"/><path d="M257 232 q-8 -8 -10 0 q2 4 10 0 q8 -8 10 0 q-2 4 -10 0" fill="#ffd23f"/>'
  +'<rect x="296" y="236" width="22" height="18" fill="#3b7fe0"/><path d="M307 236 v18 M296 245 h22" stroke="#fff" stroke-width="3"/>'
  +'<path d="M314 250 q20 6 28 -6 q5 -9 -2 -14" stroke="#f5b060" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M324 251 l1 6 M332 249 l3 5 M339 243 l5 3" stroke="#e08a36" stroke-width="3" stroke-linecap="round"/><circle cx="340" cy="230" r="3" fill="#f5b060"/>'
  +ball(352,272,'#9b5de5')
  // стол
  +'<rect x="132" y="232" width="8" height="52" fill="#7a4f2e"/><rect x="226" y="232" width="8" height="52" fill="#7a4f2e"/>'
  +'<path d="M120 212 h126 l6 30 h-138z" fill="#fff"/><path d="M114 242 h138" stroke="#d8333a" stroke-width="4"/><g fill="#d8333a" opacity=".5">'+[126,146,166,186,206,226,244].map(function(x){return '<path d="M'+x+' 242 l4 6 l4 -6z"/>';}).join('')+'</g>'
  // оливье
  +'<path d="M134 214 q0 -24 26 -24 q26 0 26 24z" fill="#f4d98a"/><ellipse cx="160" cy="214" rx="30" ry="6" fill="#e6f0f7" stroke="#5a8fcf" stroke-width="2"/>'
  +'<g fill="#7bb55a">'+[[148,202],[158,197],[168,203],[154,208],[172,209],[162,206]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.4"/>';}).join('')+'</g><g fill="#f08a4b">'+[[152,199],[166,198],[176,206]].map(function(p){return '<rect x="'+p[0]+'" y="'+p[1]+'" width="3.5" height="3.5"/>';}).join('')+'</g>'
  // холодец
  +'<ellipse cx="215" cy="216" rx="20" ry="5" fill="#e6f0f7" stroke="#5a8fcf" stroke-width="1.6"/><path d="M200 214 q0 -14 15 -14 q15 0 15 14z" fill="#e8d6a4" opacity=".9"/><circle cx="210" cy="207" r="2" fill="#f08a4b"/><path d="M216 205 l4 2" stroke="#7bb55a" stroke-width="2"/>'
  // мандарины и лимонад
  +'<g fill="#f59a2a">'+[[194,232],[204,234],[186,236]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="6"/>';}).join('')+'</g><path d="M194 226 l3 -3" stroke="#3f8a50" stroke-width="2"/>'
  +'<rect x="234" y="186" width="12" height="30" rx="3" fill="#f2c94c" opacity=".9"/><rect x="237" y="176" width="6" height="12" fill="#f2c94c"/><rect x="236" y="173" width="8" height="4" fill="#d8333a"/><rect x="234" y="196" width="12" height="9" fill="#fff"/><text x="240" y="203" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="5" fill="#d8333a">Буратино</text>'
  // табличка-желание
  +'<g transform="rotate(-4 175 120)"><rect x="140" y="98" width="72" height="40" fill="#fffdf4" stroke="#c9d6e6"/><path d="M140 108 h72 M140 118 h72 M140 128 h72" stroke="#dbe6f3" stroke-width=".8"/><text x="176" y="113" text-anchor="middle" font-family="Georgia,serif" font-size="8" font-style="italic" fill="#2f6fd6">Желание:</text><text x="176" y="127" text-anchor="middle" font-family="Georgia,serif" font-size="8" font-style="italic" fill="#2f6fd6">все слова!</text><circle cx="176" cy="99" r="2" fill="#d8333a"/></g>'
  +'</svg>';}};
})();
