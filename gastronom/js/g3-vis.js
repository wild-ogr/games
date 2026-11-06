'use strict';
/* ================= g3-vis — быстрые правки вида (VIS 25.10, план 4.7; Гастроном 3.0, поток П4). Флаг G3.on('vis') (?off=g3.vis) =================
   1. Праздничные листья/снег (слой FEST #festFx, position:fixed поверх всего) — только в рамке зала на главном («за окном»),
      не поверх окон, текста и кнопок; на других экранах и при открытом окне — спрятаны. Модуль FEST не трогаем — двигаем его слой.
   Остальное из VIS — в своих местах с меткой «G3-П4»: закрытая дверь вместо лесов (gb-art-dep.js closedDoor, gb-hall.js),
   реплика Вали на главном под залом (g3-home.js), кнопки ≥48 px / текст ≥16 px на главном и в «Кассе» (css/g3-home.css),
   товар крупнее и задний ряд тусклыми верхушками, облачко Вали в уровне не на витрине (index.html, метки G3-П4). */
(function(){
  if(!window.G3||!G3.on('vis'))return;
  document.documentElement.classList.add('g3v');
  function $(id){return document.getElementById(id);}
  function fit(){var f=$('festFx');if(!f)return;var sm=$('scr-map'),hb=$('vwHallBox'),mo=$('modal');
    var ok=sm&&sm.classList.contains('on')&&hb&&!(mo&&mo.classList.contains('on'));
    if(!ok){f.style.visibility='hidden';return;}
    var r=hb.getBoundingClientRect(),hd=document.querySelector('#scr-map .mh'),top=Math.max(r.top,hd?hd.getBoundingClientRect().bottom:0);
    if(r.bottom-top<20){f.style.visibility='hidden';return;}
    f.style.visibility='';f.style.left=Math.round(r.left)+'px';f.style.top=Math.round(top)+'px';f.style.width=Math.round(r.width)+'px';f.style.height=Math.round(r.bottom-top)+'px';
    f.style.right='auto';f.style.bottom='auto';f.style.borderRadius='16px';f.style.zIndex='3';}
  var t=0;function soon(){clearTimeout(t);t=setTimeout(fit,30);}
  if(window.GB){GB.on('screen',soon);GB.on('home',soon);GB.on('refresh',soon);GB.on('ready',soon);}
  addEventListener('resize',soon);document.addEventListener('scroll',soon,true);
  if(window.MutationObserver){var mo=$('modal');if(mo)new MutationObserver(soon).observe(mo,{attributes:true,attributeFilter:['class']});
    new MutationObserver(function(m){for(var i=0;i<m.length;i++)for(var j=0;j<m[i].addedNodes.length;j++)if(m[i].addedNodes[j].id==='festFx'){soon();return;}}).observe(document.body,{childList:true});}
  soon();
})();
