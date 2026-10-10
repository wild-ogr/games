/* Место 18 (ART-3) · глава 18 «Москва» — «Приехала к сыну. Метро — как лабиринт из букв.»
   Фон главы 400×300. Подключение: ZB.load('content/art/place-18.js').then(()=>el.innerHTML=ZB_ART[18].svg()) — см. README-3.md.
   Спасская башня с часами, Кремлёвская стена, Покровский собор, высотка вдали,
   знак метро, чемодан Зины на колёсиках с биркой и авоська с вареньем «сыну», голуби. */
(function(){
var A=window.ZB_ART=window.ZB_ART||{},k=0;
A[18]={id:'moskva',n:'Москва',c:'#f7e1d7',svg:function(PA){var u='a18_'+(++k);PA=PA||'xMidYMid slice';
  var on=function(x,y,r,c,s){return '<rect x="'+(x-r*.7)+'" y="'+y+'" width="'+(r*1.4)+'" height="'+(r*1.6)+'" fill="#f3e3c9"/>'
    +'<path d="M'+(x-r)+' '+y+' C'+(x-r)+' '+(y-r*1.1)+' '+x+' '+(y-r*1.2)+' '+x+' '+(y-r*2)+' C'+x+' '+(y-r*1.2)+' '+(x+r)+' '+(y-r*1.1)+' '+(x+r)+' '+y+'Z" fill="'+c+'"/>'
    +'<path d="M'+(x-r*.6)+' '+(y-r*.2)+' q'+(r*.5)+' '+(-r*.6)+' '+(r*.4)+' '+(-r*1.4)+' M'+(x+r*.1)+' '+y+' q'+(r*.5)+' '+(-r*.7)+' '+(r*.3)+' '+(-r*1.5)+'" stroke="'+s+'" stroke-width="'+(r*.28)+'" fill="none" stroke-linecap="round"/>'
    +'<path d="M'+x+' '+(y-r*2)+' v-7 M'+(x-3)+' '+(y-r*2-4)+' h6" stroke="#d9a520" stroke-width="1.6"/>';};
  var merl='';for(var x=-4;x<404;x+=14)merl+='<path d="M'+x+' 170 v-12 l4 5 l4 -5 v12z"/>';
  var star='<path d="M200 7 L201.9 13.4 L207.6 13.5 L203 17 L204.7 22.5 L200 19.2 L195.3 22.5 L197 17 L192.4 13.5 L198.1 13.4Z" fill="#e0313a" stroke="#a61e26" stroke-width=".8"/>';
  var pig=function(x,y,f){return '<g transform="translate('+x+' '+y+') scale('+f+' 1)"><ellipse cx="0" cy="0" rx="9" ry="6" fill="#9aa0ad"/><path d="M-9 -1 l-6 -3 l1 6z" fill="#7d8391"/><circle cx="7" cy="-6" r="4.2" fill="#8b91a0"/><path d="M5 -3 q2 2 4 0" stroke="#7fb59a" stroke-width="1.6" fill="none"/><circle cx="8.3" cy="-6.8" r="1" fill="#222"/><path d="M11 -6 l3 1 l-3 1z" fill="#e9a23b"/><path d="M-1 6 v4 M2 6 v4" stroke="#e98a6b" stroke-width="1.3"/></g>';};
  return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" font-family="ZRubik,Arial,sans-serif" preserveAspectRatio="'+PA+'" style="width:100%;height:100%;display:block">'
  +'<defs><linearGradient id="sk_'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfdcff"/><stop offset="1" stop-color="#fdeee2"/></linearGradient>'
  +'<pattern id="cb_'+u+'" width="22" height="11" patternUnits="userSpaceOnUse"><rect width="22" height="11" fill="#cdbca8"/><rect x="1" y="1" width="9" height="4" rx="2" fill="#bfae99"/><rect x="12" y="1" width="9" height="4" rx="2" fill="#c5b49f"/><rect x="-4" y="6" width="9" height="4" rx="2" fill="#c5b49f"/><rect x="7" y="6" width="9" height="4" rx="2" fill="#bba995"/><rect x="18" y="6" width="9" height="4" rx="2" fill="#bfae99"/></pattern></defs>'
  +'<rect width="400" height="300" fill="url(#sk_'+u+')"/>'
  +'<circle cx="256" cy="58" r="17" fill="#ffe08a"/><circle cx="256" cy="58" r="24" fill="#ffe08a" opacity=".3"/>'
  +'<g fill="#fff" opacity=".9"><ellipse cx="70" cy="40" rx="30" ry="10"/><ellipse cx="90" cy="34" rx="18" ry="10"/><ellipse cx="370" cy="26" rx="26" ry="8"/><ellipse cx="384" cy="21" rx="14" ry="8"/></g>'
  // высотка вдали
  +'<g fill="#d8cfe4"><rect x="300" y="96" width="60" height="80"/><rect x="312" y="70" width="36" height="30"/><rect x="321" y="48" width="18" height="24"/><path d="M326 48 L330 20 L334 48z"/><rect x="286" y="122" width="88" height="54"/></g>'
  +'<g fill="#c7bcd8">'+[0,1,2,3].map(function(r){return [0,1,2,3,4].map(function(c){return '<rect x="'+(306+c*11)+'" y="'+(104+r*16)+'" width="5" height="8"/>';}).join('');}).join('')+'</g>'
  // стена с зубцами
  +'<g fill="#b8473d">'+merl+'</g><rect x="0" y="168" width="400" height="50" fill="#b8473d"/>'
  +'<g stroke="#a33c33" stroke-width="1" opacity=".7">'+[178,190,202].map(function(y){return '<path d="M0 '+y+' H400"/>';}).join('')+'</g>'
  // Спасская башня
  +'<rect x="174" y="112" width="52" height="106" fill="#c4453b"/><rect x="174" y="112" width="52" height="6" fill="#e8dcc8"/>'
  +'<path d="M188 218 v-30 q12 -16 24 0 v30z" fill="#6e2a24"/>'
  +'<rect x="180" y="78" width="40" height="34" fill="#cf5146"/>'
  +'<circle cx="200" cy="95" r="13" fill="#1f3a6b" stroke="#e2b23a" stroke-width="2.5"/><path d="M200 95 V86 M200 95 L207 98" stroke="#e2b23a" stroke-width="2" stroke-linecap="round"/>'
  +'<g fill="#e2b23a">'+[0,90,180,270].map(function(a){return '<circle cx="'+(200+Math.sin(a*Math.PI/180)*9.5)+'" cy="'+(95-Math.cos(a*Math.PI/180)*9.5)+'" r="1.2"/>';}).join('')+'</g>'
  +'<rect x="186" y="60" width="28" height="18" fill="#e8dcc8"/><g fill="#c4453b"><path d="M190 78 v-10 q4 -5 8 0 v10z"/><path d="M202 78 v-10 q4 -5 8 0 v10z"/></g>'
  +'<path d="M184 62 L200 24 L216 62z" fill="#2e6b4f"/><path d="M192 44 h16 M188 53 h24" stroke="#e8dcc8" stroke-width="1.6"/>'
  +star
  // Покровский собор
  +'<rect x="28" y="140" width="116" height="78" fill="#c9574a"/>'
  +'<g fill="#f3e3c9">'+[38,62,86,110,128].map(function(x){return '<path d="M'+x+' 218 v-22 q6 -9 12 0 v22z"/>';}).join('')+'</g>'
  +'<rect x="74" y="70" width="22" height="74" fill="#f3e3c9"/><path d="M70 74 L85 30 L100 74z" fill="#d36b3d"/><path d="M78 56 h14 M74 66 h22" stroke="#f3e3c9" stroke-width="1.6"/><path d="M85 30 v-9 M81 25 h8" stroke="#d9a520" stroke-width="1.8"/>'
  +on(46,124,13,'#4c9a5a','#f2d14b')+on(66,104,14,'#d8433f','#fff3dc')+on(108,104,14,'#3b6fc4','#ffffff')+on(128,126,12,'#f0a12f','#3f8a50')
  +'<rect x="40" y="128" width="12" height="14" fill="#e8b0a0"/><rect x="60" y="108" width="12" height="34" fill="#e8b0a0"/><rect x="102" y="108" width="12" height="34" fill="#e8b0a0"/><rect x="122" y="130" width="12" height="12" fill="#e8b0a0"/>'
  // площадь брусчаткой
  +'<rect x="0" y="216" width="400" height="84" fill="url(#cb_'+u+')"/><rect x="0" y="214" width="400" height="5" fill="#a89782"/>'
  // метро
  +'<rect x="349" y="196" width="5" height="72" fill="#5a5f6b"/><circle cx="351.5" cy="190" r="17" fill="#fff" stroke="#d8333a" stroke-width="3"/><text x="351.5" y="198" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="22" font-weight="700" fill="#d8333a">М</text>'
  // чемодан Зины
  +'<ellipse cx="160" cy="283" rx="30" ry="4" fill="rgba(0,0,0,.15)"/>'
  +'<path d="M150 226 v-12 h20 v12" stroke="#5b5f6b" stroke-width="3" fill="none"/>'
  +'<rect x="136" y="226" width="48" height="54" rx="6" fill="#8a5a3c"/><rect x="136" y="240" width="48" height="5" fill="#6d4630"/><rect x="136" y="262" width="48" height="5" fill="#6d4630"/>'
  +'<rect x="142" y="248" width="14" height="10" rx="2" fill="#7fc3e8" transform="rotate(-8 149 253)"/><rect x="161" y="249" width="16" height="9" rx="2" fill="#f2d14b" transform="rotate(6 169 253)"/><path d="M145 254 q4 -3 8 0" stroke="#fff" stroke-width="1.4" fill="none"/><circle cx="169" cy="253" r="2.5" fill="#d8433f"/>'
  +'<circle cx="143" cy="282" r="4" fill="#333"/><circle cx="177" cy="282" r="4" fill="#333"/>'
  +'<path d="M184 232 l8 6" stroke="#b9860f" stroke-width="1.2"/><rect x="189" y="236" width="20" height="11" rx="2" fill="#fff8e6" stroke="#b9860f" stroke-width="1" transform="rotate(14 199 241)"/><text x="199" y="244" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="6.5" font-weight="700" fill="#2f6fd6" transform="rotate(14 199 241)">ЗИНА</text>'
  // авоська с банками
  +'<path d="M222 236 q12 -18 24 0" stroke="#3a7d44" stroke-width="2" fill="none"/>'
  +'<rect x="222" y="246" width="12" height="30" rx="3" fill="#c23a4a" opacity=".85"/><rect x="221" y="243" width="14" height="5" rx="1" fill="#e9c24a"/>'
  +'<rect x="235" y="250" width="12" height="26" rx="3" fill="#7bb55a" opacity=".85"/><rect x="234" y="247" width="14" height="5" rx="1" fill="#e9c24a"/>'
  +'<path d="M218 240 q16 12 32 0 l-2 38 q-14 6 -28 0z" fill="none" stroke="#3a7d44" stroke-width="1.4" stroke-dasharray="3 3"/>'
  +'<rect x="224" y="258" width="20" height="8" rx="1" fill="#fff" opacity=".9"/><text x="234" y="264" text-anchor="middle" font-family="ZRubik,Arial,sans-serif" font-size="5.5" fill="#b83b44">сыну</text>'
  +pig(278,268,1)+pig(304,276,-1)+'<path d="M290 280 q4 -3 8 0" stroke="#d9a35a" stroke-width="3" stroke-linecap="round"/>'
  +'</svg>';}};
})();
