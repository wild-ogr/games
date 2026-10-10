/* Место 22 (ART-3) · глава 22 «МФЦ» — «Талончик сто сорок второй. Пока ждём — разгадаем.»
   Фон главы 400×300. Подключение: ZB.load('content/art/place-22.js').then(()=>el.innerHTML=ZB_ART[22].svg()) — см. README-3.md.
   Зал МФЦ: табло очереди «А139 → окно 3», окна с номерами (на одном «Перерыв 15 мин»), терминал с талоном,
   ряд синих стульев — на стуле сумка Зины, талон «А142» и газета с кроссвордом, кулер, фикус, часы. */
(function(){
var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[22]={id:'mfc',n:'МФЦ',c:'#e3ecf3',svg:function(PA){var u='a22_'+(++k);PA=PA||'xMidYMid slice';
  var win=function(x,n,brk,man){var h='<rect x="'+x+'" y="112" width="64" height="84" fill="#f4f7fa" stroke="#b8c6d4" stroke-width="2"/>'
    +'<rect x="'+(x+4)+'" y="120" width="56" height="50" fill="#cfe4f2"/><path d="M'+(x+10)+' 160 l16 -32 M'+(x+22)+' 164 l14 -28" stroke="#fff" stroke-width="3" opacity=".7"/>'
    +'<rect x="'+(x-2)+'" y="170" width="68" height="8" fill="#d4dde6"/><rect x="'+(x+22)+'" y="94" width="20" height="16" rx="3" fill="#2f6fd6"/><text x="'+(x+32)+'" y="106" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="11" font-weight="700" fill="#fff">'+n+'</text>';
    if(man)h+='<circle cx="'+(x+32)+'" cy="140" r="8" fill="#f2bf9b"/><path d="M'+(x+22)+' 170 q0 -20 10 -20 q10 0 10 20z" fill="#5a7fb0"/><path d="M'+(x+24)+' 137 q8 -10 16 0" fill="#6d4b3d"/><circle cx="'+(x+56)+'" cy="104" r="4" fill="#3cc46a"/>';
    if(brk)h+='<g transform="rotate(-6 '+(x+32)+' 145)"><rect x="'+(x+8)+'" y="134" width="48" height="22" fill="#fff8a8" stroke="#e2b23a"/><text x="'+(x+32)+'" y="144" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="7" font-weight="700" fill="#b83b44">ПЕРЕРЫВ</text><text x="'+(x+32)+'" y="152" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="6" fill="#333">15 минут</text></g><circle cx="'+(x+56)+'" cy="104" r="4" fill="#e8475a"/>';
    return h;};
  var chair=function(x){return '<rect x="'+x+'" y="236" width="34" height="8" rx="3" fill="#2f6fd6"/><path d="M'+(x+2)+' 236 v-26 q0 -4 4 -4 h22 q4 0 4 4 v26" fill="#3b7fe0"/><path d="M'+(x+6)+' 244 v24 M'+(x+28)+' 244 v24" stroke="#5a5f6b" stroke-width="3"/>';};
  var tiles='';for(var r=0;r<4;r++)for(var c=0;c<14;c++)if((r+c)%2)tiles+='<rect x="'+(c*30)+'" y="'+(226+r*19)+'" width="30" height="19"/>';
  var grid='';for(var i=0;i<5;i++)for(var j=0;j<4;j++)grid+='<rect x="'+(181+i*5)+'" y="'+(218+j*5)+'" width="5" height="5" fill="'+((i*3+j)%4?'#fff':'#333')+'" stroke="#666" stroke-width=".4"/>';
  return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="'+PA+'" style="width:100%;height:100%;display:block">'
  +'<rect width="400" height="300" fill="#e3ecf3"/><rect x="0" y="0" width="400" height="20" fill="#d3dfea"/><rect x="0" y="196" width="400" height="30" fill="#d0dbe6"/>'
  +'<g fill="#ffffff" opacity=".7"><rect x="40" y="8" width="60" height="5" rx="2"/><rect x="170" y="8" width="60" height="5" rx="2"/><rect x="300" y="8" width="60" height="5" rx="2"/></g>'
  // табло очереди
  +'<rect x="118" y="28" width="164" height="56" rx="5" fill="#23272f" stroke="#8d95a3" stroke-width="3"/>'
  +'<text x="132" y="50" font-family="Courier New,monospace" font-size="15" font-weight="700" fill="#5cff8a">А139</text><text x="200" y="50" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="13" fill="#ffd23f">→</text><text x="268" y="50" text-anchor="end" font-family="Courier New,monospace" font-size="15" font-weight="700" fill="#5cff8a">ОКНО 3</text>'
  +'<text x="132" y="72" font-family="Courier New,monospace" font-size="15" font-weight="700" fill="#ff6b6b">Б017</text><text x="200" y="72" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="13" fill="#ffd23f">→</text><text x="268" y="72" text-anchor="end" font-family="Courier New,monospace" font-size="15" font-weight="700" fill="#ff6b6b">ОКНО 5</text>'
  +'<path d="M150 28 v-10 M250 28 v-10" stroke="#8d95a3" stroke-width="2"/>'
  // часы
  +'<circle cx="352" cy="54" r="18" fill="#fff" stroke="#5a5f6b" stroke-width="3"/><path d="M352 54 V42 M352 54 L360 58" stroke="#333" stroke-width="2.2" stroke-linecap="round"/>'
  
  +'<rect x="22" y="36" width="70" height="34" rx="3" fill="#fff" stroke="#b8c6d4"/><text x="57" y="50" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="7" font-weight="700" fill="#2f6fd6">ВОЗЬМИТЕ</text><text x="57" y="61" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="7" font-weight="700" fill="#2f6fd6">ТАЛОН ↓</text>'
  // окна
  +win(84,1,false,false)+win(168,2,true,false)+win(252,3,false,true)
  // пол
  +'<rect x="0" y="226" width="400" height="74" fill="#c9d1da"/><g fill="#b8c1cc">'+tiles+'</g>'
  // терминал
  +'<rect x="22" y="132" width="44" height="118" rx="5" fill="#f4f7fa" stroke="#b8c6d4" stroke-width="2"/><rect x="28" y="140" width="32" height="26" rx="2" fill="#2f6fd6"/><path d="M33 148 h22 M33 154 h16 M33 160 h20" stroke="#fff" stroke-width="2"/>'
  +'<rect x="34" y="176" width="20" height="4" rx="1" fill="#333"/><path d="M36 178 h16 v16 l-3 -2 l-3 2 l-2 -2 l-3 2 l-2 -2 l-3 2z" fill="#fff" stroke="#ccc" stroke-width=".6"/><text x="44" y="189" text-anchor="middle" font-family="Courier New,monospace" font-size="5.5" font-weight="700" fill="#333">А143</text>'
  // стулья
  +chair(108)+chair(148)+chair(188)+chair(228)+chair(268)
  // сумка Зины
  +'<path d="M114 216 q10 -18 20 0" stroke="#8a5a3c" stroke-width="2.5" fill="none"/><rect x="110" y="214" width="28" height="22" rx="4" fill="#c8434c"/><g fill="#fff" opacity=".8"><circle cx="117" cy="222" r="1.6"/><circle cx="124" cy="226" r="1.6"/><circle cx="131" cy="222" r="1.6"/><circle cx="117" cy="230" r="1.6"/><circle cx="131" cy="230" r="1.6"/></g>'
  // талон
  +'<g transform="rotate(-10 162 230)"><rect x="152" y="220" width="22" height="16" fill="#fff" stroke="#bbb" stroke-width=".8"/><text x="163" y="226" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="4.5" fill="#666">талон</text><text x="163" y="233" text-anchor="middle" font-family="Courier New,monospace" font-size="7" font-weight="700" fill="#b83b44">А142</text></g>'
  // газета с кроссвордом
  +'<g transform="rotate(4 200 226)"><rect x="176" y="212" width="46" height="26" fill="#f1ead9" stroke="#c9bfa8" stroke-width=".8"/><path d="M210 216 h9 M210 220 h9 M210 224 h9 M210 228 h9 M210 232 h7" stroke="#8a8170" stroke-width="1"/>'+grid+'<text x="190" y="215.5" text-anchor="middle" font-family="Georgia,serif" font-size="3.5" font-weight="700" fill="#333">КРОССВОРД</text></g>'
  +'<path d="M226 230 l14 -10" stroke="#2f6fd6" stroke-width="2.4" stroke-linecap="round"/><path d="M226 230 l-2 2" stroke="#333" stroke-width="1.5"/>'
  // кулер
  +'<rect x="326" y="160" width="28" height="84" rx="3" fill="#f4f7fa" stroke="#b8c6d4" stroke-width="2"/><path d="M330 130 h20 l2 6 v20 q-12 6 -24 0 v-20z" fill="#9fd4f2" opacity=".85"/><rect x="336" y="156" width="8" height="6" fill="#9fd4f2"/>'
  +'<rect x="332" y="178" width="5" height="7" fill="#3b7fe0"/><rect x="343" y="178" width="5" height="7" fill="#e8475a"/><rect x="330" y="200" width="20" height="2" fill="#b8c6d4"/>'
  // фикус
  +'<path d="M366 226 h26 l-4 22 h-18z" fill="#c97f5a"/><path d="M379 226 v-50" stroke="#5a7a3a" stroke-width="3"/>'
  +'<g fill="#4c9a5a">'+[[368,212,-30],[390,204,30],[366,190,-40],[392,184,35],[374,172,-20],[386,166,20],[379,160,0]].map(function(l){return '<ellipse cx="'+l[0]+'" cy="'+l[1]+'" rx="9" ry="5" transform="rotate('+l[2]+' '+l[0]+' '+l[1]+')"/>';}).join('')+'</g>'
  +'</svg>';}};
})();
