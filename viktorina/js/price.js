/* Цена вопроса 100–500 («Табло Михалыча», плашка вопроса на лестнице, очки карьеры). Хозяин — поток BOARD.
   Договор (COMMON.md): priceOf(q, ctx) → 100|200|300|400|500.
     q   — вопрос из QDB/QS ({i, t, d, e?, v?});
     ctx — необязательно: {mode:'ladder'|'board'|'day'|'duel'|…, step, lvl}. Сейчас на цену не влияет (задел).
   Как считаем (03-content.md §2.5, «честная цена в три шага»):
     1) если есть цена по статистике ответов (таблица id → цена, PRICE.byId; позже — data/price.txt → build) — берём её;
     2) иначе — временная цена «тема × сложность»: ожидаемая доля верных p(тема, d) по статистике 28.09–09.10
        (PRICE.TOPIC), поправка на лёгкость e (у лёгких) и оценку панели D v (1–5, если появится): ±0,05 за ступень;
        новые темы без статистики — среднее по всем (0,86 / 0,78 / 0,68);
     3) p → цена по порогам: ≥0,90 → 100; ≥0,83 → 200; ≥0,75 → 300; ≥0,63 → 400; меньше — 500.
   Номера id и «уже видел» (S.seen) цена не трогает. Файл без зависимостей: можно грузить где угодно до игры. */
(function(){
  'use strict';
  // доля верных «тема × сложность» (d1, d2, d3) — 03-content.md §2.5
  var TOPIC={
    ussr:[.95,.89,.78], kitchen:[.91,.80,.75], dacha:[.92,.85,.68], nature:[.89,.82,.63], lang:[.87,.82,.71],
    kino:[.86,.83,.64], lit:[.86,.85,.73], sport:[.86,.77,.62], tech:[.86,.73,.74], sci:[.87,.70,.57],
    space:[.83,.78,.62], art:[.83,.67,.69], world:[.82,.72,.69], history:[.78,.73,.65], geo:[.75,.61,.43]
  };
  var AVG=[.86,.78,.68];                 // новые темы (нет статистики)
  var STEPS=[[.90,100],[.83,200],[.75,300],[.63,400]]; // ниже .63 — 500
  var P0={100:.93,200:.87,300:.80,400:.70,500:.58};   // ожидаемая доля верных для цены (для сглаживания, шаг 3)
  var byId={};                            // id → цена по статистике (шаг 3), заполняется PRICE.load()
  var VD={1:1,2:1,3:2,4:3,5:3};           // оценка D (v 1–5) → «какой это d»

  function base(t,d){var r=TOPIC[t]||AVG;return r[Math.min(3,Math.max(1,d|0||2))-1];}
  // ожидаемая доля верных ответов на вопрос
  function pOf(q){
    if(!q)return AVG[1];
    var d=Math.min(3,Math.max(1,q.d|0||2)),p=base(q.t,d);
    if(d===1&&q.e){p+=q.e>=5?.02:q.e<=3?-.04:0;}       // лёгкость у лёгких (data/easy.txt)
    if(q.v>=1&&q.v<=5){p-=.05*(VD[q.v]-d);if(q.v===1)p+=.02;if(q.v===5)p-=.03;} // оценка панели D
    return Math.max(.2,Math.min(.99,p));
  }
  function byP(p){for(var i=0;i<STEPS.length;i++)if(p>=STEPS[i][0])return STEPS[i][1];return 500;}
  function priceOf(q,ctx){
    if(!q)return 300;
    var s=byId[q.i];if(s)return s;
    return byP(pOf(q));
  }
  // таблица id → цена (числа 100–500 или 1–5); пустые/битые значения пропускаем
  function load(tbl){
    if(!tbl||typeof tbl!=='object')return 0;var n=0;
    for(var k in tbl){var v=+tbl[k];if(v>=1&&v<=5)v*=100;if(v===100||v===200||v===300||v===400||v===500){byId[k]=v;n++;}}
    return n;
  }
  // сглаженная доля по ответам (для будущего пересчёта на сервере/в скрипте; в игре не обязательно)
  function smooth(ok,n,q){var p0=P0[priceOf(q)]||.8;return (ok+8*p0)/(n+8);}
  var PRICE={TOPIC:TOPIC,AVG:AVG,STEPS:STEPS,P0:P0,byId:byId,pOf:pOf,byP:byP,priceOf:priceOf,load:load,smooth:smooth,
    LIST:[100,200,300,400,500]};
  if(window.PRICE_ID)load(window.PRICE_ID); // если собранная таблица подгружена раньше (js/price-id.js)
  window.PRICE=PRICE;window.priceOf=priceOf;
})();
