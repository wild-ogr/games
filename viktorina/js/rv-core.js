/* RV — каркас флагов «революции» Викторины «Весь двор отвечает» (v6.0; поток П0, журнал hobby-analytics/release-i/vk-rev-0611/RV-П0.md).
   План — release-i/vk-rev-0611/PLAN-VK.md (раздел 7). Грузится в блоке <!-- rv:П0 --> index.html ДО основного скрипта игры (после price.js).
   Части: q (вопрос «двор», П1) · spor, miss, vet, stake (драма лестницы, П2) · res (итог, П3) · day (листок дня, П4) · home, board (главный, П5)
          · vnuk («Проверь внука», П6) · dvor («Весь двор» подсказкой — волна 2, пока выключено) · mus (музыка по умолчанию включена, П0).
   Выключить: ?off=rv (вся революция → игра как v5.9) · ?off=rv.spor (одна часть; можно списком: ?off=rv.spor,rv.q) ·
              localStorage 'rv-off' = 'rv' / 'rv.spor,rv.q' (то же, держится между заходами) · правка DEF ниже + перезаливка.
   Включить выключенную по умолчанию часть на стенде: ?on=rv.dvor (только на маке/стенде; на площадке DEF главнее не бывает — см. on()).
   Вызовы: RV.on('spor') или RV.on('rv.spor') → true/false; RV.on() / RV.on('rv') — вся революция.
           RV.mark('spor'[, 'show'|...]) — STAT `mod {m:'rv.spor', a:'on'}` один раз за сеанс на пару (часть, a) — для разбора по частям (PLAN 9).
           RV.day() — какой это день «нового вида» у игрока: 1 в первый день, 2 на следующий… (порядок открытия по дням, PLAN 4.3).
                     Поле S.rvD0 (номер дня) появляется только при первом вызове — старые сохранения не трогаем.
           RV.today() — номер текущего дня (с учётом ?date= на маке, DATE_SHIFT).
   Новые поля сохранения — только свои S.rv<Что> и только при первом использовании; в облако они едут общим правилом mergeSave (из более нового). */
(function(){
  'use strict';
  // части и их значение по умолчанию (1 — включена). Быстрый откат части — 0 здесь и перезаливка.
  var DEF={q:1,spor:1,miss:1,vet:1,stake:1,res:1,day:1,home:1,board:1,vnuk:1,dvor:0,mus:1};
  var off={},on1={},marked={};
  function add(set,s){String(s||'').split(/[,;\s]+/).forEach(function(x){x=x.trim().toLowerCase();if(x)set[x.indexOf('rv')===0?x:'rv.'+x]=1;});}
  function qp(n){var m=new RegExp('[?&]'+n+'=([^&#]*)').exec(location.search||'');return m?decodeURIComponent(m[1]):'';}
  // ?off= уже бывает у других модулей (xpz): берём из списка только наше (rv, rv.*)
  (function(){var s=qp('off').split(','),i;for(i=0;i<s.length;i++)if(/^rv(\.|$)/i.test(s[i].trim()))add(off,s[i]);
    try{add(off,localStorage.getItem('rv-off')||'');}catch(e){}
    var loc=/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname||'')||location.protocol==='file:';
    if(loc){s=qp('on').split(',');for(i=0;i<s.length;i++)if(/^rv\./i.test(s[i].trim()))add(on1,s[i]);}})();
  function key(p){p=String(p==null?'rv':p).toLowerCase();if(p==='rv')return '';return p.indexOf('rv.')===0?p.slice(3):p;}
  function on(p){
    if(off.rv)return false;
    var k=key(p);if(!k)return true;
    if(off['rv.'+k])return false;
    if(on1['rv.'+k])return true;
    return DEF[k]===1;}
  function mark(p,a){var k=key(p)||'rv',s=k+'|'+(a||'on');if(marked[s])return;marked[s]=1;
    try{if(typeof STAT!=='undefined'&&STAT&&STAT.ev)STAT.ev('mod',{m:k==='rv'?'rv':'rv.'+k,a:a||'on'});}catch(e){}}
  function today(){var t=new Date(Date.now()+(+window.DATE_SHIFT||0));return Math.floor((t.getTime()-t.getTimezoneOffset()*60000)/864e5);}
  function day(){var d=today();try{if(typeof S==='undefined'||!S)return 1;if(typeof S.rvD0!=='number'||S.rvD0>d)S.rvD0=d;return d-S.rvD0+1;}catch(e){return 1;}}
  window.RV={on:on,mark:mark,day:day,today:today,DEF:DEF,_dbg:function(){return {off:Object.keys(off),on:Object.keys(on1)};}};
  if(off.rv)document.documentElement.classList.add('rv-off');else document.documentElement.classList.add('rv');
})();
