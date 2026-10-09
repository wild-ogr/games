/* ui-night.js — «Ночная смена» (вариант В «Вечер на районе», поток UX).
   С 20:00 до 6:00 (часы — nowMs() игры: на Яндексе — время сервера) главный экран вечерний: дом в сумерках, в окнах горит свет,
   в ленте плитка «Ночная смена Михалыча», дворы идут ночной палитрой земли (TOD.night игры — без затемнения экрана, слабым телефонам не тяжелее).
   Задание дня и ?demo не трогаем. Награды смены (например, монеты ×2) — дело CAR: UI.night.on() → true, пока идёт смена;
   UI.on('night', on=>…) — смена началась/кончилась. ?night=1 / ?night=0 — включить/выключить для проверки. */
(function(){'use strict';
  if(!window.UI)return;
  var Q=(location.search.match(/[?&]night=([01])/)||[])[1];
  function hour(){try{return new Date(nowMs()).getHours();}catch(e){return new Date().getHours();}}
  function on(){if(Q)return Q==='1';if(/[?&]demo=/.test(location.search))return false;var h=hour();return h>=20||h<6;}
  var was=null;
  function check(){var n=on();if(n!==was){was=n;UI.emit('night',n);if(UI.cur==='home')UI.refresh();}return n;}
  UI.night={on:on};
  // плитка ленты (CAR может заменить своей с тем же id 'night')
  homeSlots.push({id:'night',order:5,render:function(){if(!on())return null;var h=hour(),left=h>=20?(24-h)+6:h<6?6-h:0;
    return UI.tile({ic:'🌙',t:VY.L('Ночная смена Михалыча','Mikhalych’s night shift'),s:VY.L('дворы ночью, свет в окнах'+(left?' · ещё '+left+' ч':''),'yards at night, lights on'+(left?' · '+left+' h left':'')),cls:'night',go:'game-next'});}});
  UI.screen('game-next',function(){var S=VY.S;UI.go('game',{idx:Math.max(0,(S.unlocked||1)-1)});});
  // ночная палитра двора: на время смены — todForce игры (тот же рычаг, что ?tod=night), задание дня — по своим часам
  // todForce читается в startLevel ДО события yard-start — ставим его заранее: при смене экрана и раз в минуту
  function setTod(){try{if(/[?&](demo|tod)=/.test(location.search))return;todForce=check()?'night':null;}catch(e){}}
  UI.on('screen',setTod);setTod();setInterval(setTod,60000);
  // задание дня — со своими часами: перед стартом дня снимаем рычаг
  var go0=UI.go;UI.go=function(n,o){if(n==='game'&&o&&o.daily){try{todForce=null;}catch(e){}}else if(n==='game')setTod();return go0.apply(UI,arguments);};
})();
