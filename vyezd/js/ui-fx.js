/* ui-fx.js — «сочность» двора (поток UX): машина выезжает НА УЛИЦУ — у края двора клуб пыли, и у каждой модели свой гудок.
   Модель — VYCARS.pick(v) (ART, js/art-cars.js) → тип кузова; нет ART — по длине машины. Скорая/милиция молчат (у них сирена игры).
   Ничего не меняет в правилах и в index.html: смотрит на G.vs раз в кадр, пока открыт двор. Спокойный режим — без пыли и гудков.
   Звук — через tone() игры (глушится вместе со звуком игры, S.sound / пауза рекламы). */
(function(){'use strict';
  if(!window.UI)return;
  // гудки: [форма, частота, длина, повтор через, громкость]
  var HORN={sedan:['square',440,.09,.12,.035],zap:['square',640,.06,.09,.03],bug:['square',600,.07,.1,.03],oka:['square',560,.07,.1,.03],hatch:['square',500,.08,.11,.032],
    suv:['square',360,.11,.14,.035],kabluk:['square',470,.08,.11,.032],van:['sawtooth',300,.14,0,.03],gazel:['sawtooth',330,.13,0,.03],
    truck:['sawtooth',210,.16,.2,.035],bus:['sawtooth',170,.32,0,.035]};
  function hornOf(v){var t=null;try{if(window.VYCARS&&VYCARS.pick){var id=VYCARS.pick(v),c=id&&VYCARS.get(id);if(c)t=c.t;}}catch(e){}
    if(!t||!HORN[t])t=v.L>=4?'bus':v.L===3?'van':'sedan';return HORN[t];}
  var lastHorn=0;
  function horn(v){if(v.kind==='amb'||v.kind==='pol')return;var now=performance.now();if(now-lastHorn<380)return;lastHorn=now;
    var h=hornOf(v);try{tone(h[0],h[1],h[1]*.98,h[2],h[4]);if(h[3])setTimeout(function(){tone(h[0],h[1],h[1]*.98,h[2],h[4]);},h[3]*1000);}catch(e){}}
  function puff(v){try{var p=toPx(trackPt(v.track,v.s+v.L-1)),D=DIRS[v.dir];
    for(var i=0;i<9;i++){var a=Math.random()*6.28,sp=15+Math.random()*35;
      G.parts.push({x:p[0]-D[0]*cs*.4,y:p[1]-D[1]*cs*.4+cs*.1,vx:Math.cos(a)*sp-D[0]*12,vy:Math.sin(a)*sp*.6-12,r:cs*(.12+Math.random()*.12),life:.7,max:.7,c:'rgba(196,178,150,'});}}catch(e){}}
  var raf=0;
  function tick(){raf=0;var g=null;try{g=G;}catch(e){}if(!g||UI.cur!=='game')return;
    var calmOn=false;try{calmOn=calm();}catch(e){}
    for(var i=0;i<g.vs.length;i++){var v=g.vs[i];if(v.state!=='exit'||v._ux||v.exitS==null)continue;
      // голова машины пересекает край двора: s ≈ exitS − L − 0,9 (см. startExit)
      if(v.s>=v.exitS-v.L-.9){v._ux=1;if(!calmOn){puff(v);horn(v);}}}
    raf=requestAnimationFrame(tick);}
  function start(){if(!raf)raf=requestAnimationFrame(tick);}
  UI.on('yard-start',start);UI.on('screen',function(n){if(n==='game')start();});
  try{if(G)start();}catch(e){}
  UI.fx={horn:horn,hornOf:hornOf};
})();
