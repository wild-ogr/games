/* Место 25 (ART-3) · глава 25 «Соленья» — «Банки, укроп, рассол. Закатываю слова на зиму.»
   Фон главы 400×300. Подключение: ZB.load('content/art/place-25.js').then(()=>el.innerHTML=ZB_ART[25].svg()) — см. README-3.md.
   Кухня-кладовка: полки с банками (огурцы, помидоры, варенье «внуку», компот «до Нового года», «Кабачки?!»),
   окно в огород с подсолнухом, календарь «Август»; на столе эмалированная кастрюля в цветочек, укроп, чеснок,
   закаточная машинка и главная банка — «Слова на зиму» с буквами в рассоле. */
(function(){
var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[25]={id:'solenya',n:'Соленья',c:'#e6f2da',svg:function(PA){var u='a25_'+(++k);PA=PA||'xMidYMid slice';
  var jar=function(x,y,w,h,fill,stuff,lab,cap){
    var s='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="#e9f4f6" opacity=".9" stroke="#b8cdd2" stroke-width="1"/>'
      +'<rect x="'+(x+2)+'" y="'+(y+5)+'" width="'+(w-4)+'" height="'+(h-7)+'" rx="4" fill="'+fill+'" opacity=".8"/>'+stuff;
    s+=cap==='cloth'?'<path d="M'+(x-3)+' '+(y+4)+' q'+(w/2+3)+' -12 '+(w+6)+' 0 l-3 6 q'+(-w/2)+' 4 '+(-w)+' 0z" fill="#e8475a"/><g fill="#fff">'+[.25,.5,.75].map(function(f){return '<circle cx="'+(x+w*f)+'" cy="'+(y)+'" r="1.4"/>';}).join('')+'</g><path d="M'+(x-1)+' '+(y+7)+' h'+(w+2)+'" stroke="#fff" stroke-width="1.4"/>'
      :'<rect x="'+(x-1)+'" y="'+(y-4)+'" width="'+(w+2)+'" height="7" rx="2" fill="#d9b03a"/><rect x="'+(x-1)+'" y="'+(y-4)+'" width="'+(w+2)+'" height="2" fill="#f2d478"/>';
    if(lab)s+='<rect x="'+(x+3)+'" y="'+(y+h*.45)+'" width="'+(w-6)+'" height="11" fill="#fffdf4"/><text x="'+(x+w/2)+'" y="'+(y+h*.45+8)+'" text-anchor="middle" font-family="Georgia,serif" font-size="'+(lab.length>8?4.4:5.4)+'" font-style="italic" fill="#2f6fd6">'+lab+'</text>';
    return s;};
  var cuc=function(x,y,n){var s='';for(var i=0;i<n;i++)s+='<ellipse cx="'+(x+(i%2)*8)+'" cy="'+(y+i*7)+'" rx="3" ry="7" fill="#3f8a3a" transform="rotate('+(i%2?14:-14)+' '+(x+(i%2)*8)+' '+(y+i*7)+')"/>';return s+'<path d="M'+(x-2)+' '+(y-4)+' l6 10 l-3 6 M'+(x+6)+' '+(y-4)+' l-2 12" stroke="#6fbf4a" stroke-width="1.4"/>';};
  var tom=function(x,y){return '<circle cx="'+x+'" cy="'+y+'" r="6" fill="#e5413c"/><circle cx="'+(x+8)+'" cy="'+(y+9)+'" r="6" fill="#d8352f"/><circle cx="'+(x-1)+'" cy="'+(y+14)+'" r="5.5" fill="#e5413c"/>';};
  var tiles='';for(var r=0;r<5;r++)for(var c=0;c<20;c++)tiles+='<rect x="'+(c*20+(r%2?10:0))+'" y="'+(196+r*12)+'" width="19" height="11" fill="#ffffff" opacity=".55"/>';
  var letters='';[['С',175,224,-14],['Л',188,234,10],['О',201,222,0],['В',212,234,-8],['А',222,224,12]].forEach(function(l){letters+='<text x="'+l[1]+'" y="'+l[2]+'" font-family="Georgia,serif" font-size="12" font-weight="700" fill="#2f6fd6" transform="rotate('+l[3]+' '+l[1]+' '+l[2]+')">'+l[0]+'</text>';});
  return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="'+PA+'" style="width:100%;height:100%;display:block">'
  +'<defs><linearGradient id="br_'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f6d6"/><stop offset="1" stop-color="#c9e3a8"/></linearGradient></defs>'
  +'<rect width="400" height="300" fill="#e6f2da"/><rect x="0" y="196" width="400" height="60" fill="#d4e8c2"/>'+tiles
  // окно в огород
  +'<rect x="16" y="40" width="76" height="92" fill="#bfe6ff"/><rect x="16" y="104" width="76" height="28" fill="#8cc463"/>'
  +'<path d="M40 132 v-48" stroke="#4c8a3a" stroke-width="3"/><circle cx="40" cy="78" r="11" fill="#f5c23a"/><circle cx="40" cy="78" r="5" fill="#7a4f2e"/><path d="M40 108 q-10 -4 -12 -10 q8 0 12 6 M40 100 q10 -4 12 -10 q-8 0 -12 6" fill="#5ea54a"/>'
  +'<g stroke="#6fbf4a" stroke-width="1.6" fill="none">'+[60,68,76].map(function(x){return '<path d="M'+x+' 132 v-18 M'+(x-4)+' 116 l4 -4 l4 4"/>';}).join('')+'</g>'
  +'<rect x="12" y="36" width="84" height="100" fill="none" stroke="#fff" stroke-width="6"/><path d="M54 40 v92" stroke="#fff" stroke-width="4"/><rect x="6" y="134" width="96" height="7" rx="2" fill="#f2efe8"/>'
  +'<path d="M8 32 q8 40 0 70 l-6 0 v-70z M100 32 q-8 40 0 70 l6 0 v-70z" fill="#f5c76a"/>'
  // календарь
  +'<rect x="326" y="30" width="50" height="58" fill="#fff" stroke="#c9d6e6"/><rect x="326" y="30" width="50" height="14" fill="#e8475a"/><text x="351" y="40" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="8" font-weight="700" fill="#fff">АВГУСТ</text>'
  +'<g fill="#bbb">'+[0,1,2,3].map(function(r){return [0,1,2,3,4].map(function(c){return '<rect x="'+(330+c*9)+'" y="'+(50+r*9)+'" width="6" height="5"/>';}).join('');}).join('')+'</g><circle cx="350" cy="61" r="6" fill="none" stroke="#e8475a" stroke-width="1.4"/><circle cx="351" cy="30" r="2" fill="#555"/>'
  // полки
  +'<g fill="#a0683e"><rect x="106" y="80" width="188" height="7"/><rect x="106" y="140" width="188" height="7"/><rect x="104" y="20" width="4" height="174"/><rect x="292" y="20" width="4" height="174"/></g>'
  +jar(114,42,26,38,'#cfe9b0',cuc(124,52,3),'Огурцы')+jar(146,48,22,32,'#f6d0b8',tom(155,57),'')+jar(174,40,28,40,'#cfe9b0',cuc(184,50,4),'Огурцы 2026')
  +jar(208,46,22,34,'#7a2a5a','','Варенье','cloth')+jar(236,44,24,36,'#e88a3a','','Абрикос','cloth')+jar(264,50,22,30,'#cfe9b0',cuc(272,58,2),'')
  +jar(114,102,28,38,'#f6d0b8',tom(124,112),'Помидоры')+jar(148,108,22,32,'#c23a4a','','внуку','cloth')+jar(176,100,30,40,'#e8b3d0','<circle cx="186" cy="118" r="4" fill="#c23a6a"/><circle cx="196" cy="126" r="4" fill="#c23a6a"/><circle cx="188" cy="130" r="4" fill="#9b2a5a"/>','Компот до НГ')
  +jar(212,106,22,34,'#f3e6a8','','Хрен')+jar(240,98,44,42,'#e6eaa0','<g fill="#d9d06a">'+[[252,112],[268,114],[256,124],[272,126]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="6"/>';}).join('')+'</g>','Кабачки?!')
  // стол
  +'<rect x="70" y="236" width="260" height="10" rx="2" fill="#c99b6a"/><rect x="74" y="246" width="252" height="54" fill="#b5875a"/><path d="M200 248 v52" stroke="#a0683e" stroke-width="2"/><circle cx="190" cy="270" r="2.4" fill="#e2b23a"/><circle cx="210" cy="270" r="2.4" fill="#e2b23a"/>'
  // кастрюля
  +'<rect x="76" y="186" width="66" height="50" rx="6" fill="#fbfbf8" stroke="#d8dde4" stroke-width="1.5"/><rect x="72" y="182" width="74" height="7" rx="3" fill="#e8475a"/><path d="M70 196 h-6 M148 196 h6" stroke="#5a5f6b" stroke-width="4" stroke-linecap="round"/>'
  +'<g transform="translate(109 212)"><circle r="3" fill="#f5b72d"/>'+[0,72,144,216,288].map(function(a){return '<circle cx="0" cy="-6" r="3.6" fill="#e8475a" transform="rotate('+a+')"/>';}).join('')+'<ellipse cx="-12" cy="6" rx="5" ry="2.4" fill="#4c9a5a" transform="rotate(-20)"/><ellipse cx="12" cy="6" rx="5" ry="2.4" fill="#4c9a5a" transform="rotate(20)"/></g>'
  +'<path d="M96 182 q-2 -8 2 -14 M112 180 q3 -9 -1 -16 M126 182 q-2 -8 2 -14" stroke="#c9d6e6" stroke-width="2" fill="none" opacity=".8"/>'
  // укроп и чеснок
  +'<g stroke="#5ea54a" stroke-width="1.4" fill="none">'+[0,1,2,3,4].map(function(i){return '<path d="M'+(262+i*3)+' 236 q'+(8-i*4)+' -20 '+(14-i*7)+' -30"/>';}).join('')+'</g>'
  +'<g fill="#8fcf5a">'+[[276,206],[266,204],[258,210],[282,214],[270,212]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4" opacity=".7"/>';}).join('')+'</g>'
  +'<path d="M296 236 q-10 0 -8 -10 q2 -8 10 -10 q8 2 10 10 q2 10 -8 10z" fill="#f4ecdc" stroke="#d8cdb8"/><path d="M298 216 v-6" stroke="#c9b98a" stroke-width="2"/><path d="M298 218 v16" stroke="#e0d4bc" stroke-width="1"/>'
  +'<path d="M316 236 q-7 0 -6 -7 q2 -6 7 -7 q6 2 7 7 q1 7 -6 7z" fill="#f4ecdc" stroke="#d8cdb8"/>'
  // закаточная машинка
  +'<path d="M232 222 h20" stroke="#5a5f6b" stroke-width="4" stroke-linecap="round"/><circle cx="242" cy="230" r="7" fill="#8d95a3"/><path d="M242 222 v-12 h14" stroke="#5a5f6b" stroke-width="3" fill="none"/><rect x="254" y="206" width="10" height="7" rx="3" fill="#c8434c"/>'
  // главная банка «Слова на зиму»
  +'<ellipse cx="200" cy="200" rx="46" ry="46" fill="#fff6c8" opacity=".45"/>'
  +'<rect x="166" y="178" width="68" height="62" rx="9" fill="#e9f4f6" stroke="#9fbcc4" stroke-width="1.5"/><rect x="169" y="186" width="62" height="51" rx="7" fill="url(#br_'+u+')" opacity=".9"/>'
  +'<path d="M178 186 l4 10 l-4 8 M222 188 l-3 10" stroke="#5ea54a" stroke-width="1.6" fill="none"/>'+letters
  +'<rect x="164" y="172" width="72" height="9" rx="3" fill="#d9b03a"/><rect x="164" y="172" width="72" height="3" fill="#f2d478"/>'
  +'<rect x="170" y="189" width="60" height="14" fill="#fffdf4" stroke="#e8475a" stroke-width="1"/><text x="200" y="199" text-anchor="middle" font-family="Georgia,serif" font-size="7.4" font-style="italic" font-weight="700" fill="#b83b44">Слова на зиму</text>'
  +'<path d="M174 196 q2 8 0 30" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>'
  +'</svg>';}};
})();
