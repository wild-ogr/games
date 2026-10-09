'use strict';
/* vy-mgc · мини-игра №14 «Парковка задним ходом» (ведущий — дед Митяй: «Левее! Ещё! Стоп!»). Договор — шапка js/vymg-core.js; набор — js/vymg-mgckit.js (VYC).
   vy-park: теперь ОБЁРТКА над движком js/vymg-parkeng.js (VYPE) — физика, руль/педали, клавиши KEYS, подсказки Митяя, рисование живут там.
   Обычный заход (Перекур, Гаражи, мастерская): три задания как раньше — 1) задом между машинами у подъезда, 2) «карман» вдоль бордюра, 3) задом в гараж-«ракушку»;
     машина — одна из пяти легковых (габарит прежний 4,2 × 1,76 м, база 2,45 м). Очки за задание: 3 − касания (до −2) − «криво» (−1) − «передом» (−1), не меньше 1;
     «Митяй переставит» (через 40 с или после 3 касаний) — 0. Всего до 9; ступени 3/5/8.
   Заход с ctx.park (Автодром, финал региона, Парковка дня, праздники — js/vymg-avtodrom.js) — одна площадка на звёзды, ведёт VYPARK.run.
   ПК: ←/→ (A/D, Ф/В) — руль, ↑/W — вперёд, ↓/S — назад, Пробел — руль прямо, H/Р — Митяй переставит, Enter — дальше.
   Тест: window.__vyc_parkovka (st.api.auto()/help()/ff(n), st.res — очки по заданиям, st.rs — подробно). Движок не загрузился — игры нет (оболочка её не покажет). */
(function(){if(typeof VYMG_REG!=='function'||!window.VYC||!window.VYPE)return;
var K=window.VYC,ID='parkovka',N=3,CUT=[3,5,8],T=function(a,b){return K.L(a,b);};
var DIM0=[4.2,1.76,2.45,.85],TASKS=[['bay','yard',.25],['par','yard',0],['gar','gar',.3]];
function run(host,o){if(o&&o.ctx&&o.ctx.park&&window.VYPARK&&VYPARK.run)return VYPARK.run(host,o);
  var R=o.rnd||Math.random,calm=K.calm(o),myCar=K.pick(['moskvich','kopeyka','niva','devyatka','zapor'],R),seed=(o.seed>>>0)||Math.floor(R()*4294967296);
  var lots=TASKS.map(function(t,k){return {kind:t[0],th:t[1],tight:t[2],car:myCar,dim:DIM0,seed:(seed+k*7919)>>>0,calm:calm};});
  return VYPE.play(host,o,{lots:lots,mode:'classic',who:'mityai',
    done:function(rs){var pts=rs.map(function(r){return r.pts|0;}),sc=pts.reduce(function(a,b){return a+b;},0),clean=pts.filter(function(x){return x===3;}).length;
      return {score:sc,tier:K.tier(sc,CUT),label:T('Поставил ','Parked ')+pts.filter(function(x){return x>0;}).length+T(' из ',' of ')+N+T(' · без единого касания: ',' · without a scratch: ')+clean,extra:{max:N*3}};}});}
/* бот: k — умение; касаний ~ (1−k)·2,4; «криво» с вероятностью 0,45(1−k); сдаётся (0) с вероятностью 0,3(1−k)² */
function sim(o,k){var R=o.rnd||Math.random,s=0;k=k==null?.6:k;for(var i=0;i<N;i++){if(R()<.3*(1-k)*(1-k)*(1+i*.3))continue;var tc=0,l=(1-k)*2.4*(1+i*.25),e=Math.exp(-l),q=R(),pp=e;while(q>pp&&tc<5){tc++;e*=l/tc;pp+=e;}
  s+=Math.max(1,3-Math.min(2,tc)-(R()<.45*(1-k)?1:0));}return {score:s,tier:K.tier(s,CUT)};}
VYMG_REG({id:ID,n:K.L('Парковка задним ходом','Reverse Parking'),a:K.L('«Левее! Ещё! Стоп!» — поставь машину в карман','“Left! More! Stop!” — park the car in the gap'),run:run,sim:sim});
})();
