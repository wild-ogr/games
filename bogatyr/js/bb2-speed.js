/* ===== bb2-speed.js — заглушка потока SPEED (супер-буст в2, 14.10.2026). Остальное догружается в меню: js/bb2-speed-run.js (набор 'speed').
   Флаги: 'ql3' — «попроще» ступенями 0/1/2, решается заново в каждом походе по замеру прошлого, число и крепость нечисти НЕ меняются;
          'bat' — «Беречь батарею» (30 к/с); 'numSum' — «умные цифры» (одна растущая цифра над врагом); 'cam' — на ПК камера дальше (×0,8);
          'icw' — значки окон заранее в свободное время меню; 'musl' — место под музыку земель; 'spd' — замер скорости в каждом походе (STAT spd).
   Хранение: только это устройство, localStorage 'bogatyr-q2' (как 'bogatyr-q' у «Эффектов»: у телефона и ПК разное железо) — в S и облако не идёт. */
(function(){
  if(typeof BB2!=='object'||!BB2||typeof QL!=='object')return;
  var q={},P;try{q=JSON.parse(localStorage.getItem('bogatyr-q2')||'{}')||{};}catch(e){}
  P=window.SPDQ={q:q,pc:false};
  try{P.pc=matchMedia('(hover:hover) and (pointer:fine)').matches&&!('ontouchstart' in window);}catch(e){}
  if(BB2.on('ql3')){if(q.st==null&&QL.auto)q.st=1;QL.nf=1;QL.auto=0; /* бой не меняем (qLowF), «навсегда» больше нет */
    qLow=function(){return QL.mode===2||(QL.mode===0&&(q.st|0)>0);};
    qFrame=function(t){if(P.f)P.f(t);};}
  BB2.hook('zoom',function(){if(P.pc&&BB2.on('cam'))return .8;});
  BB2.lazy('speed',['js/bb2-speed-run.js'],function(){return !!P.ok;});
  BB2.late('speed');
})();
