/* STATANS — статистика ответов «Дворовой викторины» (поток STAT буста 09.10.2026; журнал hobby-analytics/release-i/viktorina-boost/logs/STAT.md).
   Событие `ans` — ОДНО на каждый вопрос, когда ответ решён (верно / окончательно неверно). Без личных данных: только номер вопроса и ход игры.
     q  — id вопроса (ussr-123; тема — до дефиса)
     ok — 1 верно с первой попытки · 2 верно после ошибки (страховка Михалыча, вторая попытка) · 0 неверно
     m  — режим: lad (лестница) · day (викторина дня) · duel · board… (табло) · vmg-<id> (затеи с вопросами из базы)
     st — ступень / № вопроса в заходе (1…)
     pr — цена вопроса 100–500 (priceOf от BOARD, js/price.js)
     s  — секунд на ответ: от показа вопроса до ПЕРВОГО нажатия, без времени в свёрнутом виде и под рекламой (0…600, округлённо)
     d  — сложность вопроса 1–3
     h  — подсказки, взятые НА ЭТОМ вопросе: f — 50/50, n — сосед, z — баба Зина (нет поля — без подсказок)
   Порядок полей = приоритет (модуль STAT пропускает всё после 8-го).
   Вход:
     STATANS.ans({id, ok, mode, step, price, sec, d, hint, tries}) — подписчик answerHook (info из UI.answered); можно звать и напрямую:
        ok — true/false (итог), tries — неверных нажатий ДО итога (верно и tries>0 → ok:2); price/d — если не даны, берутся из вопроса.
     STATANS.prg() — разовое событие прохождения `prg` (≤ 8 полей): ds, rk, cp (CAR.prg()), md, cr, w (своё), yd, mk (YARD.prg()).
   Источник ответов — гнездо UX `answerHook` (js/ui-core.js): игра зовёт его РОВНО раз на решённый вопрос (лестница, день, дуэль), табло и
   затеи — через UI.answered(info). STATANS подписывается сам при загрузке (до 09.10 был временный перехват renderQ/answer — убран).
   Старый синтаксис (var/function): файл грузится после основного скрипта игры. */
(function(){
  'use strict';
  var last={k:'',t:0},prgSent=0,hooked=false;
  function st(){return typeof STAT!=='undefined'&&STAT&&STAT.ev?STAT:null;}
  function qOf(id){try{return typeof QI!=='undefined'&&QI[id]||null;}catch(e){return null;}}
  function num(v){return typeof v==='number'&&isFinite(v);}
  function hintStr(h){
    if(!h)return '';
    if(typeof h==='string')return h.replace(/[^fnz]/g,'').split('').filter(function(c,i,a){return a.indexOf(c)===i;}).sort().join('');
    if(h instanceof Array)return hintStr(h.join(''));
    if(typeof h==='object'){var s='';if(h.ff||h.f)s+='f';if(h.nb||h.n)s+='n';if(h.zi||h.z)s+='z';return s;}
    return h===true?'?':'';}
  function price(q,o){
    if(num(o.price)&&o.price>0)return Math.round(o.price);
    try{if(q&&typeof priceOf==='function')return priceOf(q,{mode:o.mode,step:o.step});}catch(e){}
    return 0;}
  // одно событие на вопрос: повтор того же id в том же режиме за 5 с (обёртка + гнездо) не шлём
  function ans(o){
    var S_=st();if(!S_||!o||!o.id)return false;
    var id=String(o.id).slice(0,24),m=String(o.mode||'?').slice(0,12),k=id+'|'+m,t=Date.now();
    if(last.k===k&&t-last.t<5000)return false;
    last={k:k,t:t};
    var q=qOf(id),okv=o.ok===2?2:o.ok?((+o.tries||0)>0?2:1):0,p={q:id,ok:okv,m:m},v;
    if(num(o.step))p.st=Math.round(o.step);
    v=price(q,o);if(v)p.pr=v;
    if(num(o.sec)&&o.sec>=0)p.s=Math.min(600,Math.round(o.sec));
    v=num(o.d)?o.d:q&&q.d;if(v)p.d=v;
    v=hintStr(o.hint);if(v)p.h=v;
    S_.ev('ans',p);
    return true;}

  // ---- прохождение: раз за загрузку игры, после STAT.progress ----
  function medals(){var n=0,k,c,tc;try{tc=S.tc||{};for(k in tc){c=+tc[k]||0;n+=c>=TCM[2]?3:c>=TCM[1]?2:c>=TCM[0]?1:0;}}catch(e){}return n;}
  function part(fn){try{var o=fn&&fn();return o&&typeof o==='object'?o:{};}catch(e){return {};}}
  function prg(){
    var S_=st();if(!S_||prgSent)return;prgSent=1;
    var c=part(window.CAR&&CAR.prg),y=part(window.YARD&&YARD.prg),p={},a=[['ds',c.ds],['rk',c.rk],['cp',c.cp],['md',medals()],
      ['cr',typeof S!=='undefined'?+S.correct||0:0],['w',typeof S!=='undefined'?+S.wins||0:0],['yd',y.yd],['mk',y.mk]],i;
    for(i=0;i<a.length;i++)if(num(a[i][1]))p[a[i][0]]=Math.round(a[i][1]);
    S_.ev('prg',p);}

  // гнездо UX: answerHook — массив подписчиков или функция регистрации; подписались → обёртку выключаем
  function hook(){
    var h=window.answerHook;
    if(hooked||!h||typeof h.push!=='function')return hooked;
    h.push(ans);hooked=true;return true;}

  window.STATANS={ans:ans,prg:prg,hook:hook,_dbg:function(){return {hooked:hooked,prg:prgSent};}};
  if(!hook())window.addEventListener('load',hook);
  try{if(typeof statPr!=='undefined'&&statPr)prg();}catch(e){}   // statProg уже был (игра звала до загрузки файла) — prg сразу
})();
