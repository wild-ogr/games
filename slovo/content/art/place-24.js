/* Место 24 (ART-3) · глава 24 «Внук и смартфон» — «Внук учит меня смартфону, я его — словам. Кто кого?»
   Фон главы 400×300. Подключение: ZB.load('content/art/place-24.js').then(()=>el.innerHTML=ZB_ART[24].svg()) — см. README-3.md.
   Гостиная: ковёр на стене, диван с подушками, на столике большой смартфон с наклейкой
   «зелёная — звонить, красная — не трогать!», тетрадка «Инструкция для бабушки», чашка;
   роутер на вязаной салфетке, торшер, листок «Пароль: на холодильнике», провод зарядки кольцами. */
(function(){
var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[24]={id:'vnuk-smartfon',n:'Внук и смартфон',c:'#e4eefb',svg:function(PA){var u='a24_'+(++k);PA=PA||'xMidYMid slice';
  var rug='';
  for(var r=0;r<3;r++)for(var c=0;c<5;c++){var x=136+c*32,y=56+r*30;rug+='<path d="M'+x+' '+(y-11)+' l11 11 l-11 11 l-11 -11z" fill="'+((r+c)%2?'#f2c14b':'#2f5a9c')+'"/><circle cx="'+x+'" cy="'+y+'" r="3.5" fill="#fff6e0"/>';}
  var fr='';for(var x=112;x<=288;x+=8)fr+='<path d="M'+x+' 150 v6"/>';
  var icons='';var ic=['#e8475a','#3cc46a','#2f6fd6','#f5b72d','#9b5de5','#f08a4b','#2fb6c8','#e85aa8','#7bb55a'];
  for(var i=0;i<9;i++)icons+='<rect x="'+(184+(i%3)*11)+'" y="'+(196+Math.floor(i/3)*11)+'" width="8" height="8" rx="2.4" fill="'+ic[i]+'"/>';
  var doily='';for(var k=0;k<14;k++){var a=k/14*Math.PI*2;doily+='<circle cx="'+(66+Math.cos(a)*24)+'" cy="'+(112+Math.sin(a)*5)+'" r="3.4"/>';}
  return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="'+PA+'" style="width:100%;height:100%;display:block">'
  +'<defs><pattern id="wp_'+u+'" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#e4eefb"/><path d="M10 0 v20" stroke="#d6e3f5" stroke-width="5"/></pattern>'
  +'<radialGradient id="lg_'+u+'" cx=".5" cy=".3" r=".6"><stop offset="0" stop-color="#fff3b0" stop-opacity=".7"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient></defs>'
  +'<rect width="400" height="300" fill="url(#wp_'+u+')"/>'
  // ковёр на стене
  +'<rect x="108" y="22" width="184" height="128" rx="4" fill="#b8323c"/><rect x="116" y="30" width="168" height="112" fill="#d2444c" stroke="#f2c14b" stroke-width="3"/>'+rug
  +'<path d="M116 38 h168 M116 134 h168" stroke="#2f5a9c" stroke-width="2" stroke-dasharray="4 4"/><g stroke="#f2c14b" stroke-width="1.6">'+fr+'</g>'
  // полка с роутером на салфетке
  +'<rect x="30" y="118" width="74" height="6" fill="#a0683e"/><path d="M36 124 l6 10 M98 124 l-6 10" stroke="#8a5734" stroke-width="3"/>'
  +'<ellipse cx="66" cy="114" rx="26" ry="6" fill="#fff"/><g fill="#fff">'+doily+'</g>'
  +'<rect x="46" y="98" width="40" height="14" rx="3" fill="#f4f7fa" stroke="#b8c6d4"/><path d="M52 98 l-6 -22 M80 98 l6 -22" stroke="#5a5f6b" stroke-width="3" stroke-linecap="round"/>'
  +'<g fill="#3cc46a"><circle cx="56" cy="105" r="1.8"/><circle cx="62" cy="105" r="1.8"/><circle cx="68" cy="105" r="1.8"/></g><circle cx="74" cy="105" r="1.8" fill="#f5b72d"/>'
  +'<path d="M66 70 q8 -6 16 0 M70 64 q4 -3 8 0 M62 76 q12 -10 24 0" stroke="#2f6fd6" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>'
  // листок с паролем
  +'<g transform="translate(-26 4) rotate(5 64 160)"><rect x="34" y="144" width="62" height="32" fill="#fff8a8"/><text x="65" y="157" text-anchor="middle" font-family="Georgia,serif" font-size="7.5" font-weight="700" fill="#b83b44">ПАРОЛЬ:</text><text x="65" y="169" text-anchor="middle" font-family="Georgia,serif" font-size="6.5" font-style="italic" fill="#2f6fd6">на холодильнике</text></g>'
  // торшер
  +'<circle cx="352" cy="70" r="60" fill="url(#lg_'+u+')"/><path d="M352 96 V250" stroke="#6a4a36" stroke-width="4"/><path d="M334 250 h36" stroke="#6a4a36" stroke-width="5" stroke-linecap="round"/>'
  +'<path d="M330 96 l8 -40 h28 l8 40z" fill="#f5c76a"/><g fill="#e8a84a">'+[332,340,348,356,364,372].map(function(x){return '<circle cx="'+x+'" cy="98" r="2.2"/>';}).join('')+'</g>'
  // диван
  +'<rect x="84" y="140" width="232" height="58" rx="18" fill="#5f8f6a"/><rect x="70" y="170" width="34" height="64" rx="12" fill="#4f7d5a"/><rect x="296" y="170" width="34" height="64" rx="12" fill="#4f7d5a"/>'
  +'<rect x="96" y="190" width="208" height="40" rx="8" fill="#6d9d77"/><path d="M200 190 v38" stroke="#5f8f6a" stroke-width="2"/>'
  +'<rect x="104" y="160" width="40" height="32" rx="8" fill="#f2c14b" transform="rotate(-10 124 176)"/><path d="M110 166 l26 18 M136 160 l-20 26" stroke="#e8a84a" stroke-width="2" transform="rotate(-10 124 176)"/>'
  +'<rect x="258" y="160" width="38" height="32" rx="8" fill="#e8475a" transform="rotate(8 277 176)"/><circle cx="277" cy="176" r="6" fill="#fff" opacity=".6" transform="rotate(8 277 176)"/>'
  +'<path d="M80 234 v12 M320 234 v12" stroke="#3a2a22" stroke-width="5"/>'
  // пол
  +'<rect x="0" y="244" width="400" height="56" fill="#c99b6a"/><g stroke="#b5875a" stroke-width="1.2">'+[258,274,290].map(function(y){return '<path d="M0 '+y+' H400"/>';}).join('')+'</g>'
  // журнальный столик
  +'<ellipse cx="200" cy="266" rx="92" ry="12" fill="rgba(0,0,0,.08)"/><rect x="120" y="240" width="160" height="10" rx="3" fill="#a0683e"/><path d="M130 250 v24 M270 250 v24" stroke="#7a4f2e" stroke-width="5"/>'
  // смартфон на подставке
  +'<path d="M186 240 l6 -10 h16 l6 10z" fill="#5a5f6b"/>'
  +'<rect x="176" y="176" width="48" height="64" rx="7" fill="#23272f"/><rect x="180" y="184" width="40" height="50" rx="3" fill="#cfe4f2"/>'+icons
  +'<circle cx="200" cy="180" r="1.3" fill="#555"/>'
  
  +'<g transform="rotate(-6 226 214)"><rect x="210" y="200" width="46" height="26" fill="#fff8a8"/><circle cx="216" cy="208" r="3" fill="#3cc46a"/><text x="221" y="210" font-family="Georgia,serif" font-size="5.5" font-style="italic" fill="#333">звонить</text><circle cx="216" cy="219" r="3" fill="#e8475a"/><text x="221" y="221" font-family="Georgia,serif" font-size="5.5" font-style="italic" fill="#b83b44">не трогать!</text></g>'
  // тетрадка-инструкция
  +'<g transform="rotate(-8 150 238)"><rect x="128" y="226" width="44" height="16" fill="#fffdf4" stroke="#c9d6e6"/><rect x="128" y="226" width="4" height="16" fill="#e8475a"/><text x="152" y="233" text-anchor="middle" font-family="Georgia,serif" font-size="4.6" font-style="italic" fill="#2f6fd6">Инструкция</text><text x="152" y="239" text-anchor="middle" font-family="Georgia,serif" font-size="4.6" font-style="italic" fill="#2f6fd6">для бабушки</text></g>'
  // чашка
  +'<rect x="244" y="226" width="16" height="14" rx="3" fill="#fff" stroke="#2f6fd6" stroke-width="1.4"/><path d="M260 230 q6 0 6 4 q0 4 -6 4" stroke="#2f6fd6" stroke-width="1.6" fill="none"/><circle cx="252" cy="233" r="2.4" fill="#2f6fd6"/>'
  // провод зарядки к розетке
  +'<path d="M200 244 q0 20 20 22 q14 2 14 12 q0 8 -10 6 q-8 -2 -2 -8 q10 -8 30 -4 q40 8 70 -4 q40 -8 46 -40" stroke="#fff" stroke-width="2.6" fill="none"/>'
  +'<rect x="362" y="214" width="12" height="16" rx="2" fill="#fff" stroke="#b8c6d4"/><circle cx="366" cy="222" r="1.2" fill="#555"/><circle cx="370" cy="222" r="1.2" fill="#555"/>'
  +'</svg>';}};
})();
