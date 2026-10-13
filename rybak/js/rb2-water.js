'use strict';
/* rb2-water — «Водоём месяца» (поток SEASON, буст 2.0, флаг water). Грузится в <head> сразу после places.js и places-art.js (до каркаса и игры):
   место с датой открытия дописывается в конец реестра PLACES (индекс = номер в сохранении — порядок списка НЕ МЕНЯТЬ, новые — только в конец),
   в «порядок открытия» PLACE_ORD не входит: свой раздел «Водоём месяца» на главном (обёртка uiChapters в js/rb2-season.js),
   путёвка — после Волги. До даты места в игре нет вовсе. Пейзаж — FAR_ART[look] (как у NORTH).
   Дата — по Москве; на маке ?a3d=N (сдвиг дней) и ?sezday=ГГГГ-ММ-ДД. Выключатель — ?off=water / ?off=all / window.R2_OFF (каркаса ещё нет — читаем сами).
   КАК ДОБАВИТЬ ВОДОЁМ: строка в WATERS (from — дата, p — запись места по образцу js/places.js; рыбы — уже существующие id или новые в FISH_DB) + пейзаж в ART. */
var RB2_WATER=(function(){
  var WATERS=[
    // 1.12.2026 — Озеро Ильмень (Новгородская область): мелкое широкое озеро, зимой — лёд; лещ, судак, щука, налим, снеток; Юрьев монастырь на берегу
    {from:'2026-12-01',p:{id:'ilmen',rec:2,n:'Озеро Ильмень',en:'Lake Ilmen',reg:'Новгородская область',regE:'Novgorod region',p:3000,pm:2.4,fish:['snetok','plotva','okun','lesh','shuka','sudak','nalim'],look:'ilmen',ic:'⛪',
      tn:[3800,7300,10800],set:240,pz:[{k:'weed',x:.42,d:6},{k:'snag',x:.82,d:10},{k:'edge',x:.46,d:15},{k:'pit',x:.72,d:21}],led:1,pfx:{sudak:.7},pbr:120,trip:230,wal:1200,chest:4200,bbox:60,sh:'Ильмень',
      kgT:4,big:2,mf:65,mbg:2,rqkg:2,pmw:[.62,.62,.6,.5,1,1,1,1,1,1,.9,.7],water:'#4f7f92',wat:1,after:'volga'}}
  ];
  function off(){try{var q=location.search,m=/[?&]off=([^&#]*)/.exec(q),a=(m?decodeURIComponent(m[1]):'')+','+(window.R2_OFF?String(window.R2_OFF):'');
    if(/[?&]on=[^&#]*water/.test(q))return false;return /(^|,)\s*(water|all|r2)\s*(,|$)/.test(a);}catch(e){return false;}}
  function local(){try{return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);}catch(e){return false;}}
  function day(){try{var q=location.search,m;if(local()){m=/[?&]sezday=(\d{4}-\d\d-\d\d)/.exec(q);if(m)return m[1];}
    var t=Date.now()+108e5;if(local()){m=/[?&]a3d=(-?\d+)/.exec(q);if(m)t+=(+m[1])*864e5;}return new Date(t).toISOString().slice(0,10);}catch(e){return '2000-01-01';}}
  // помощники рисунка — копия из js/places-art.js (там они внутри замыкания)
  function onion(g,x,yb,w,col){g.fillStyle=col;g.beginPath();g.moveTo(x-w*.5,yb);g.bezierCurveTo(x-w*.75,yb-w*.7,x-w*.08,yb-w*.95,x,yb-w*1.35);g.bezierCurveTo(x+w*.08,yb-w*.95,x+w*.75,yb-w*.7,x+w*.5,yb);g.closePath();g.fill();
  g.fillRect(x-w*.04,yb-w*1.7,w*.08,w*.4);g.fillRect(x-w*.18,yb-w*1.58,w*.36,w*.07);}
  function drum(g,x,yb,w,h,wall,dome){g.fillStyle=wall;g.fillRect(x-w/2,yb-h,w,h);onion(g,x,yb-h,w*1.05,dome);}
  function boat(g,x,y,s,col){g.fillStyle=col;g.beginPath();g.moveTo(x-s,y-s*.18);g.lineTo(x+s,y-s*.18);g.quadraticCurveTo(x+s*.7,y+s*.12,x+s*.4,y+s*.14);g.lineTo(x-s*.55,y+s*.14);g.quadraticCurveTo(x-s*.85,y+s*.1,x-s,y-s*.18);g.fill();}
  function reeds(g,x0,x1,yb,h,col,R){g.strokeStyle=col;g.lineWidth=Math.max(.6,h*.06);g.beginPath();for(let x=x0;x<x1;x+=h*.18*(.6+R())){const hh=h*(.55+R()*.6),b=(R()-.5)*h*.25;g.moveTo(x,yb);g.quadraticCurveTo(x+b*.3,yb-hh*.6,x+b,yb-hh);}g.stroke();}
  var ART={
    // ИЛЬМЕНЬ: плоский низкий берег, белые стены и синие главы монастыря, рыбацкие избы и лодки на берегу, камыш
    ilmen:function(g,W,H,hz,P,R,u,f,lit){try{
      treeLine(g,W,hz-u*1.2,u*1.2,u*1.8,f('#557a5c'),R);g.fillStyle=f('#6a8d5c');g.fillRect(0,hz-u*.9,W,u*1);
      // монастырь: стена с башенками, собор с пятью главами, колокольня
      var mx=W*.3,my=hz-u*.9;g.fillStyle=f('#f2eee6');g.fillRect(mx-u*9,my-u*2.2,u*18,u*2.2);
      for(var i=0;i<4;i++){var tx=mx-u*9+i*u*6;g.fillRect(tx-u*.7,my-u*3.2,u*1.4,u*3.2);g.fillStyle=f('#4a7a9a');g.beginPath();g.moveTo(tx-u*.85,my-u*3.2);g.lineTo(tx,my-u*4.4);g.lineTo(tx+u*.85,my-u*3.2);g.fill();g.fillStyle=f('#f2eee6');}
      g.fillRect(mx-u*3.2,my-u*7.2,u*6.4,u*5);
      [[-2.1,1.3],[2.1,1.3],[-2.1,-1],[2.1,-1]].forEach(function(d){drum(g,mx+d[0]*u,my-u*7.2,u*1.1,u*1.4,f('#f2eee6'),f('#3f73a8'));});drum(g,mx,my-u*7.2,u*1.7,u*2.4,f('#f2eee6'),f('#e0b030'));
      g.fillStyle=f('#f2eee6');g.fillRect(mx+u*5,my-u*8.4,u*2,u*6.2);drum(g,mx+u*6,my-u*8.4,u*1.3,u*1.6,f('#f2eee6'),f('#e0b030'));
      g.fillStyle=lit?'#ffd66b':f('#7a7a70');for(var w=0;w<3;w++)g.fillRect(mx-u*2.2+w*u*1.8,my-u*5.6,u*.5,u*1);
      // рыбацкая деревня справа: избы, сушила для сетей, лодки на берегу
      house(g,W*.72,hz-u*.8,u*2.8,u*1.8,f('#8a6a48'),f('#6a5a4a'),lit);house(g,W*.8,hz-u*.8,u*2.4,u*1.6,f('#94744e'),f('#7a4a3a'),lit);house(g,W*.88,hz-u*.8,u*2.6,u*1.7,f('#7e6040'),f('#5a4a3a'),lit);
      g.strokeStyle=f('#4a3a2a');g.lineWidth=Math.max(.8,u*.2);g.beginPath();for(var k=0;k<4;k++){var x=W*.6+k*u*2.2;g.moveTo(x,hz);g.lineTo(x,hz-u*3);}g.moveTo(W*.6,hz-u*2.8);g.lineTo(W*.6+u*6.6,hz-u*2.8);g.stroke();
      g.strokeStyle=rgba(f('#3a3226'),.55);g.lineWidth=Math.max(.5,u*.1);g.beginPath();for(var n=0;n<12;n++){var nx=W*.6+n*u*.55;g.moveTo(nx,hz-u*2.8);g.lineTo(nx+u*.2,hz-u*1.2);}g.stroke();
      boat(g,W*.52,hz-u*.3,u*1.4,f('#3a3a34'));boat(g,W*.95,hz-u*.25,u*1.1,f('#4a3e30'));
      reeds(g,-5,W*.1,hz,u*2.4,f('#7a8a4a'),R);reeds(g,W*.44,W*.5,hz,u*1.8,f('#7a8a4a'),R);}catch(e){}}
  };
  var on=[];
  function build(){if(off()||typeof PLACES==='undefined')return;var d=day();
    for(var i=0;i<WATERS.length;i++){var w=WATERS[i];if(w.from>d)break; // по порядку: следующий — только после предыдущего (индексы сохранения)
      var p=w.p;if(PLACES.some(function(x){return x.id===p.id;}))continue;p.evf=[];p.fish=p.fish.slice();p.from=w.from;PLACES.push(p);on.push(PLACES.length-1);}
    try{for(var k in ART)if(typeof FAR_ART!=='undefined'&&!FAR_ART[k])FAR_ART[k]=ART[k];}catch(e){}}
  build();
  return {all:WATERS,idx:function(){return on.slice();},day:day,off:off};
})();
