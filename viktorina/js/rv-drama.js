/* RVD — «драма лестницы» революции «Весь двор отвечает» (v6.0; поток П2, журнал hobby-analytics/release-i/vk-rev-0611/RV-П2.md, план PLAN-VK.md раздел 2.2 и 7).
   Грузится в блоке <!-- rv:П2 --> index.html ПОСЛЕ основного скрипта игры (вызывает её глобальные S, G, prz, renderQ, reveal, startLadder, mergeSave).
   Части (флаги П0, js/rv-core.js; выключить: ?off=rv.stake и т. п.):
   · rv.stake — ставки растут с уровнем: ×1 ур.1–4, ×2 ур.5–14, ×3 ур.15+ (STK). Вторая попытка дорожает так же: 50 → 100 → 150.
       Расчёт — tools/econ_rv.py (печатается из tools/econ.py): общий доход растёт слабее множителя (задания/гостинцы не растут),
       поэтому попытка в «лестницах дохода» не дешевле, чем в v5.9, — ролик второй попытки (почти все ролики игры) не обесценивается.
       Множитель лестницы берётся при её первом показе и держится до конца (G.rvm). Тема недели ×2 перемножается.
       Порядок открытия (PLAN 4.3): с 3-го дня «нового вида» (RV.day()>=3), вместе со «Спорим?».
   · rv.spor — «Спорим?» на месте «Забрать» (#lfTake): с 3-го уровня, раз за лестницу, на 8-й ступени. Нажал — подсказки этого вопроса гаснут;
       верно → ступени 8–10 ×2 (G.rvs=2), неверно — как обычно (вторая попытка остаётся), спор проигран (G.rvs=-1). Новых окон нет.
       Сюда же — 10-й вопрос-кульминация: двор темнеет, гирлянда, окна соседей (css/rv-drama.css, класс rv-fin на #scr-game),
       пауза перед подсветкой ответа (+1,4 с, «Окончательный ответ?»).
   · rv.miss — вчерашняя ошибка: раз в день в первой лестнице (с 4-го уровня, не на страховке) на ступени 2–4 — вопрос, где игрок ошибся
       раньше (не сегодня), из этой темы. S.rvMiss = [[id, день], …] ≤30; облако — объединение (обёртка mergeSave).
   · rv.vet — ветерану (с 15-го уровня) на ступенях 1–5 не брать вопросы, где верно отвечают ≥95 % (KNOW.p, только настоящие данные).
       Ступени 6–10 не трудим (решение 04.10).
   Поломки VK-UX: №6 (огонёк «×5» закрывал реплику Михалыча — перенесён в угол, css), №20 (призы не растут — rv.stake).
   Вызовы из index.html: prz() → RVD.k(i); COST.second → 50×RVD.sm(); pickQ → RVD.vet(q,ступень); #lfTake → RVD.take(). */
(function(){
  'use strict';
  var W=window;
  function on(p){try{return !!(W.RV&&RV.on(p));}catch(e){return false;}}
  function day3(){try{return RV.day()>=3;}catch(e){return false;}}
  function lvNo(){return ((S&&S.lvl)||0)+1;}
  var STK=[[1,1],[5,2],[15,3]]; // [с уровня, множитель]
  function multOf(l){var m=1;for(var i=0;i<STK.length;i++)if(l>=STK[i][0])m=STK[i][1];return m;}
  function stakeOn(){return on('stake')&&day3();}
  function lad(){return !!G&&G.mode==='lad';}
  function mult(){if(!stakeOn())return 1;if(lad()){if(!G.rvm)G.rvm=multOf(lvNo());return G.rvm;}return multOf(lvNo());}
  // множитель ступени i лестницы (ставка × «Спорим?» выигран на 8–10)
  function k(i){if(!lad())return 1;return mult()*(G.rvs===2&&i>=7?2:1);}
  // множитель цены второй попытки (вне лестницы — по текущему уровню; викторина дня/дуэль — ×1)
  function sm(){if(G&&G.mode!=='lad')return 1;return mult();}
  function today(){try{return RV.today();}catch(e){return Math.floor(Date.now()/864e5);}}
  function stat(m,a){try{STAT.ev('mod',{m:m,a:a});}catch(e){}}
  function mark(p,a){try{RV.mark(p,a);}catch(e){}}

  /* ---------- ветеран: фильтр в pickQ ---------- */
  function vet(q,j){if(j>=5||!on('vet')||lvNo()<15||!q||!W.KNOW)return false;
    try{if(typeof helpDue==='function'&&helpDue())return false;if(!KNOW.has(q.i))return false;return KNOW.p(q)>=.95;}catch(e){return false;}}

  /* ---------- «Спорим?» ---------- */
  var SPOR_STEP=7; // 8-я ступень
  function sporCan(){return lad()&&on('spor')&&day3()&&lvNo()>=3&&!G.over&&G.i===SPOR_STEP&&G.st==='ask'&&G.rvs==null
    &&!G.wrongs.size&&!G.gone.size&&!(G.qh&&G.qh.length)&&!(typeof insured==='function'&&insured());}
  function sporLive(){return lad()&&G.rvs===1&&G.i===SPOR_STEP&&G.st!=='done';}
  var TAKE0=null;
  function takeBtn(){var b=document.getElementById('lfTake');if(b&&TAKE0==null)TAKE0=b.innerHTML;return b;}
  // нажатие #lfTake: true — это был «Спорим?» (обработали), false — обычное «Забрать»
  function take(){if(!sporCan())return false;
    G.rvs=1;mark('spor','take');stat('rv.spor','take');
    G.say={who:'mihalych',m:'wow',t:pick1(SAY.spor)};try{SND.tap();}catch(e){}
    renderQ();return true;}

  /* ---------- реплики (свои; общий банк П1 — RVSAY.pick, если есть такой случай) ---------- */
  var SAY={
    offer:['Спорим, без подсказок не ответишь? Жми «Спорим?» — выиграешь, ставки вдвое.','А спорим, сам не ответишь? Без подсказок! Угадаешь — удвою ставки.'],
    spor:['По рукам! Без подсказок ответишь — ставки на последних ступенях вдвое. Ну-ка…','Спорим так спорим! Подсказки убрал — отвечай сам. Угадаешь — удвою!'],
    sporWin:['Ну ты даёшь… Проспорил я! Ставки вдвое — забирай, если дойдёшь.','Эх, чешу затылок: выиграл ты спор! Теперь на кону вдвое.'],
    sporLose:['Спор за мной! Но не горюй — лестница ещё не кончилась.','Проспорил ты, бывает. Ничего — держимся дальше!'],
    stake2:['Ставки выросли: на кону вдвое! Вторая попытка — тоже дороже.'],
    stake3:['Большая игра: на кону втрое! Вторая попытка — тоже дороже.'],
    fin:['Последний вопрос. Весь двор у окон — не подведи!','Десятая ступень! Соседи свет погасили — смотрят только на тебя.','Ну, последний. Двор затих… Думай спокойно.'],
    hold:['Окончательный ответ? Ну, сейчас посмотрим…','Так… Двор затаил дыхание…'],
    miss:['В прошлый раз этот вопрос тебе не дался — помнишь? Давай реванш!','Старый знакомый! Тут ты в прошлый раз споткнулся. Теперь-то знаешь?']
  };
  function pick1(a){try{if(W.RVSAY&&RVSAY.pick){var x=RVSAY.pick('p2-'+(a===SAY.fin?'fin':'x'));if(x&&a===SAY.fin)return x;}}catch(e){}return a[Math.floor(Math.random()*a.length)];}
  function say(t,m){G.say={who:'mihalych',m:m||'norm',t:t};}

  /* ---------- вчерашняя ошибка ---------- */
  var MISS_N=30;
  function missList(){return Array.isArray(S.rvMiss)?S.rvMiss:null;}
  function missAdd(id){if(!on('miss')||!id)return;var a=missList()||(S.rvMiss=[]),d=today();
    for(var i=0;i<a.length;i++)if(a[i][0]===id){a.splice(i,1);break;}
    a.push([id,d]);while(a.length>MISS_N)a.shift();}
  function missDel(id){var a=missList();if(!a)return;for(var i=0;i<a.length;i++)if(a[i][0]===id){a.splice(i,1);return;}}
  function missPlant(){if(!lad()||!on('miss')||lvNo()<4||G.first||G.help||G.i!==0||G.rvMi!=null)return;
    var a=missList();if(!a||!a.length||S.rvMd===today())return;var d=today(),best=null;
    for(var i=a.length-1;i>=0;i--){var x=a[i],q=QI[x[0]];if(!q||x[1]>=d||G.qs.indexOf(q.i)>=0)continue;
      try{if(typeof isBad==='function'&&isBad(q))continue;}catch(e){}
      if(G.topic!=='all'&&q.t!==G.topic)continue;
      if(!best||q.d<best.d)best=q;}
    if(!best)return;var j=1+Math.floor(Math.random()*3);G.qs[j]=best.i;G.rvMi=j;S.rvMd=d;mark('miss','plant');stat('rv.miss','plant');
    try{save();}catch(e){}}

  /* ---------- после каждой отрисовки вопроса ---------- */
  function after(){if(!G)return;var sc=document.getElementById('scr-game'),b=takeBtn();
    var L10=lad()&&G.i===9&&on('spor');if(sc){sc.classList.toggle('rv-fin',L10&&!G.over);}
    if(!lad()){if(b&&TAKE0!=null&&b.classList.contains('rvSpor')){b.classList.remove('rvSpor');b.innerHTML=TAKE0;}return;}
    var again=false;
    // объявление ставок: один раз на каждую новую ступень множителя
    if(G.i===0&&G.st==='ask'&&!G.rvA){G.rvA=1;var m=mult();if(m>1){mark('stake');if(m>(+S.rvSt||1)){S.rvSt=m;say(pick1(m>=3?SAY.stake3:SAY.stake2),'happy');again=true;try{save();}catch(e){}}}}
    // вчерашняя ошибка
    if(G.rvMi!=null&&G.i===G.rvMi&&G.st==='ask'&&!G.rvMs){G.rvMs=1;say(pick1(SAY.miss),'norm');again=true;}
    // 10-й вопрос — кульминация (реплику ставим только поверх стандартной «Последний вопрос!» — банк П1 главнее)
    if(L10&&G.st==='ask'&&!G.rvF){G.rvF=1;mark('spor','fin');try{if(G.say&&G.say.t===HOST.last[0]){say(pick1(SAY.fin),'norm');again=true;}}catch(e){}}
    // «Спорим?» — Михалыч сам предлагает (один раз за лестницу)
    if(sporCan()&&!G.rvO){G.rvO=1;say(pick1(SAY.offer),'happy');again=true;}
    if(again)R0();
    // «Спорим?» на месте «Забрать»
    if(b){var sp=sporCan(),live=sporLive();
      if(sp||live){if(!b.classList.contains('rvSpor')){b.classList.add('rvSpor');b.innerHTML='🤝<small>Спорим?</small>';try{if(W.LK&&LK.scan)LK.scan(b);}catch(e){}}
        b.disabled=!sp;b.classList.toggle('rvOn',live);if(sp)mark('spor','show');}
      else if(b.classList.contains('rvSpor')){b.classList.remove('rvSpor','rvOn');b.innerHTML=TAKE0;}}
    // спор идёт — подсказки этого вопроса погашены
    var lf=document.getElementById('lifes');if(lf)lf.classList.toggle('rvNoHelp',sporLive());
    if(sporLive())['lf50','lfNb','lfZi'].forEach(function(id){var x=document.getElementById(id);if(x)x.disabled=true;});}

  /* ---------- обёртки функций игры ---------- */
  var R0=null;
  function wrap(){
    if(typeof W.renderQ!=='function'||typeof W.reveal!=='function'||typeof W.startLadder!=='function')return false;
    R0=W.renderQ;W.renderQ=function(){var r=R0.apply(this,arguments);try{after();}catch(e){err(e);}return r;};
    var rv0=W.reveal;W.reveal=function(kk){
      try{ // 10-й вопрос: пауза перед подсветкой
        if(lad()&&G.i===9&&G.st==='wait'&&G.rvP!==9&&on('spor')){var t=Math.round(1400*(typeof speed==='function'?speed():1));
          if(t>0){G.rvP=9;say(pick1(SAY.hold),'norm');var sc=document.getElementById('scr-game');if(sc)sc.classList.add('rv-hold');R0();
            var g=G;setTimeout(function(){if(sc)sc.classList.remove('rv-hold');if(G===g)W.reveal(kk);},t);return;}}}catch(e){err(e);}
      var i0=G&&G.i,spor=sporLive(),r=rv0.apply(this,arguments);
      try{if(spor&&G&&G.i===i0){var ok=G.res[i0]===1;
          if(ok){G.rvs=2;stat('rv.spor','win');say(pick1(SAY.sporWin),'wow');R0();}
          else {G.rvs=-1;stat('rv.spor','lose');}}}catch(e){err(e);}
      return r;};
    var sl0=W.startLadder;W.startLadder=function(){var g0=G,r=sl0.apply(this,arguments);try{if(G&&G!==g0&&lad()){missPlant();}}catch(e){err(e);}return r;};
    // облако: S.rvMiss — объединение (по id, свежий день), ≤30
    var m0=W.mergeSave;if(typeof m0==='function'){W.mergeSave=function(d){var loc=missList()?missList().slice():null,r=m0.apply(this,arguments);
      try{if(d&&Array.isArray(d.rvMiss)||loc){var map={},all=(loc||[]).concat(d&&Array.isArray(d.rvMiss)?d.rvMiss:[]);
        all.forEach(function(x){if(Array.isArray(x)&&typeof x[0]==='string'&&typeof x[1]==='number'&&(!map[x[0]]||map[x[0]][1]<x[1]))map[x[0]]=[x[0],x[1]];});
        var a=Object.keys(map).map(function(id){return map[id];}).sort(function(p,q){return p[1]-q[1];});S.rvMiss=a.slice(-MISS_N);
        if(d&&typeof d.rvMd==='number')S.rvMd=Math.max(+S.rvMd||0,d.rvMd);if(d&&typeof d.rvSt==='number')S.rvSt=Math.max(+S.rvSt||0,d.rvSt);}}catch(e){err(e);}
      return r;};}
    return true;}
  function err(e){try{if(W.console)console.warn('RVD',e);}catch(x){}}
  var ok=wrap();
  // ответы лестницы: ошибка (в т. ч. спасённая второй попыткой) — в список; верно с первого раза — из списка
  try{if(Array.isArray(W.answerHook))answerHook.push({id:'rv-miss',fn:function(a){if(!a||a.mode!=='lad'||!on('miss'))return;
    if(!a.ok||a.tries>0)missAdd(a.id);else missDel(a.id);}});}catch(e){err(e);}

  W.RVD={k:k,sm:sm,mult:mult,multOf:multOf,vet:vet,take:take,STK:STK,ok:ok,_sporCan:sporCan};
})();
