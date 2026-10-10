/* Место 21 (ART-3) · глава 21 «Хор в Доме культуры» — «Репетиция в шесть. Пою громче всех — руководитель так и сказал.»
   Фон главы 400×300. Подключение: ZB.load('content/art/place-21.js').then(()=>el.innerHTML=ZB_ART[21].svg()) — см. README-3.md.
   Сцена ДК: бархатный занавес, растяжка «Хор «Рябинушка»», прожектор, микрофон с запиской «Зина, потише!»,
   пианино, баян на стуле, пюпитры с нотами, летящие ноты, афиша «Репетиция в 18:00», первый ряд кресел. */
(function(){
var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[21]={id:'hor-dk',n:'Хор в Доме культуры',c:'#f6e6d4',svg:function(PA){var u='a21_'+(++k);PA=PA||'xMidYMid slice';
  var note=function(x,y,s,c,r){return '<g transform="translate('+x+' '+y+') rotate('+(r||0)+') scale('+s+')" fill="'+c+'"><ellipse cx="0" cy="0" rx="5" ry="3.6" transform="rotate(-20)"/><rect x="3.6" y="-18" width="1.8" height="18"/><path d="M5.4 -18 q8 4 6 12 q-1 -6 -6 -7z"/></g>';};
  var stand=function(x){return '<path d="M'+x+' 246 v-36 M'+(x-8)+' 248 l8 -6 l8 6" stroke="#3a3a44" stroke-width="2" fill="none"/><path d="M'+(x-14)+' 196 h28 l-3 16 h-22z" fill="#3a3a44"/><rect x="'+(x-11)+'" y="192" width="22" height="14" fill="#fff"/><path d="M'+(x-9)+' 196 h18 M'+(x-9)+' 199 h18 M'+(x-9)+' 202 h18" stroke="#888" stroke-width=".5"/><circle cx="'+(x-4)+'" cy="199" r="1.2" fill="#222"/><circle cx="'+(x+3)+'" cy="197" r="1.2" fill="#222"/>';};
  var fringe='';for(var x=0;x<400;x+=8)fringe+='<path d="M'+x+' 38 l4 8 l4 -8z"/>';
  var seats='';for(var i=0;i<9;i++){var sx=4+i*46;seats+='<path d="M'+sx+' 300 v-22 q0 -10 10 -10 h22 q10 0 10 10 v22z" fill="#a5303b"/><path d="M'+(sx+4)+' 276 q0 -4 6 -4 h22 q6 0 6 4" stroke="#c8434c" stroke-width="2" fill="none"/>';}
  var rowan='';[[108,58],[116,54],[124,58],[276,58],[284,54],[292,58],[112,63],[288,63]].forEach(function(p){rowan+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3.4" fill="#e8475a"/>';});
  return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="'+PA+'" style="width:100%;height:100%;display:block">'
  +'<defs><linearGradient id="bw_'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3f6e"/><stop offset="1" stop-color="#8a6a8e"/></linearGradient>'
  +'<linearGradient id="cu_'+u+'" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a5262f"/><stop offset=".5" stop-color="#d23a44"/><stop offset="1" stop-color="#a5262f"/></linearGradient>'
  +'<linearGradient id="sp_'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".75"/><stop offset="1" stop-color="#fff6c8" stop-opacity=".08"/></linearGradient></defs>'
  +'<rect width="400" height="300" fill="url(#bw_'+u+')"/>'
  // растяжка
  +'<rect x="96" y="48" width="208" height="26" rx="3" fill="#fff6e0" stroke="#e2b23a" stroke-width="2"/>'
  +'<text x="200" y="66" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="700" fill="#b83b44">Хор «Рябинушка»</text>'
  +'<path d="M100 60 q8 -6 18 -4 M300 60 q-8 -6 -18 -4" stroke="#3f8a50" stroke-width="2" fill="none"/>'+rowan
  // прожектор
  +'<path d="M182 76 L130 236 H270 L218 76z" fill="url(#sp_'+u+')"/>'
  // пол сцены
  +'<rect x="0" y="230" width="400" height="44" fill="#b07a4a"/><g stroke="#9a673c" stroke-width="1">'+[0,1,2,3,4,5,6,7,8,9].map(function(i){return '<path d="M'+(i*44)+' 230 l-14 44"/>';}).join('')+'</g><rect x="0" y="230" width="400" height="4" fill="#8a5a34"/>'
  +'<ellipse cx="200" cy="246" rx="70" ry="10" fill="#fff6c8" opacity=".35"/>'
  // пианино
  +'<rect x="40" y="168" width="78" height="66" rx="3" fill="#5a3726"/><rect x="40" y="168" width="78" height="8" fill="#6d4630"/>'
  +'<rect x="44" y="196" width="70" height="10" fill="#fff"/><g fill="#222">'+[0,1,2,4,5,7,8,9,11,12].map(function(k){return '<rect x="'+(46+k*5)+'" y="196" width="3" height="6"/>';}).join('')+'</g>'
  +'<rect x="44" y="176" width="70" height="18" fill="#6d4630"/><rect x="66" y="178" width="26" height="14" fill="#fff"/><path d="M68 182 h22 M68 186 h22" stroke="#aaa" stroke-width=".6"/>'
  +'<rect x="44" y="234" width="6" height="6" fill="#3a2418"/><rect x="108" y="234" width="6" height="6" fill="#3a2418"/>'
  +'<rect x="98" y="156" width="14" height="12" rx="2" fill="#f0e6c8"/><path d="M100 158 v-6 q5 -4 10 0 v6" stroke="#e2b23a" stroke-width="1.5" fill="none"/>'
  // пюпитры
  +stand(150)+stand(250)
  // микрофон
  +'<path d="M200 248 v-62" stroke="#3a3a44" stroke-width="3"/><path d="M186 250 l14 -6 l14 6" stroke="#3a3a44" stroke-width="3" fill="none"/>'
  +'<rect x="194" y="166" width="12" height="22" rx="6" fill="#4a4a56"/><circle cx="200" cy="168" r="7" fill="#8d8f99"/><path d="M195 166 h10 M195 170 h10" stroke="#6d6f79" stroke-width="1"/>'
  +'<g transform="rotate(-8 214 196)"><rect x="204" y="188" width="40" height="17" fill="#fff8a8"/><text x="224" y="196" text-anchor="middle" font-family="Georgia,serif" font-size="6" font-style="italic" fill="#b83b44">Зина,</text><text x="224" y="203" text-anchor="middle" font-family="Georgia,serif" font-size="6" font-style="italic" fill="#b83b44">потише!</text></g>'
  // баян на стуле
  +'<rect x="296" y="208" width="44" height="6" fill="#7a4f2e"/><path d="M300 214 v24 M336 214 v24" stroke="#7a4f2e" stroke-width="4"/><rect x="296" y="168" width="6" height="42" fill="#7a4f2e"/>'
  +'<rect x="304" y="178" width="12" height="30" rx="2" fill="#2a2a3a"/><g fill="#fff">'+[182,188,194,200].map(function(y){return '<circle cx="310" cy="'+y+'" r="1.6"/>';}).join('')+'</g>'
  +'<path d="M316 180 h4 v26 h-4 M320 180 h4 v26 h-4 M324 180 h4 v26 h-4" stroke="#e8475a" stroke-width="1.2" fill="#c8434c"/>'
  +'<rect x="328" y="178" width="10" height="30" rx="2" fill="#2a2a3a"/><g fill="#e2b23a">'+[184,192,200].map(function(y){return '<circle cx="333" cy="'+y+'" r="1.4"/>';}).join('')+'</g>'
  // ноты в воздухе
  +note(170,120,1,'#ffe08a',-10)+note(232,104,1.2,'#ffe08a',8)+note(206,140,.8,'#fff6e0',0)+note(260,138,.9,'#ffe08a',-6)+note(146,150,.8,'#fff6e0',6)
  // афиша
  +'<g transform="translate(-256 -14) rotate(-3 356 130)"><rect x="322" y="96" width="62" height="60" fill="#fffdf4"/><rect x="322" y="96" width="62" height="12" fill="#2f6fd6"/><text x="353" y="105" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="7" font-weight="700" fill="#fff">РЕПЕТИЦИЯ</text>'
  +'<text x="353" y="124" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#b83b44">18:00</text><text x="353" y="137" text-anchor="middle" font-family="Georgia,serif" font-size="6.5" font-style="italic" fill="#333">не опаздывать!</text><text x="353" y="148" text-anchor="middle" font-family="Georgia,serif" font-size="6" font-style="italic" fill="#666">руководитель</text><circle cx="353" cy="98" r="2" fill="#f5b72d"/></g>'
  // занавес
  +'<path d="M0 0 h56 q-10 120 8 236 q-30 6 -64 0z" fill="url(#cu_'+u+')"/><path d="M400 0 h-56 q10 120 -8 236 q30 6 64 0z" fill="url(#cu_'+u+')"/>'
  +'<path d="M14 0 q-6 120 6 234 M34 0 q-4 120 8 236 M386 0 q6 120 -6 234 M366 0 q4 120 -8 236" stroke="#8e1f28" stroke-width="2" fill="none" opacity=".6"/>'
  +'<path d="M50 150 q-12 6 -10 16 q10 -2 14 -12z M350 150 q12 6 10 16 q-10 -2 -14 -12z" fill="#e2b23a"/>'
  +'<path d="M0 0 h400 v34 q-50 12 -100 0 q-50 12 -100 0 q-50 12 -100 0 q-50 12 -100 0z" fill="url(#cu_'+u+')"/>'
  +'<g fill="#e2b23a">'+fringe+'</g><path d="M0 36 q50 12 100 0 q50 12 100 0 q50 12 100 0 q50 12 100 0" stroke="#e2b23a" stroke-width="3" fill="none"/>'
  // первый ряд кресел
  +seats
  +'</svg>';}};
})();
