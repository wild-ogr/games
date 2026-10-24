/* ===== TMR v1 (24.10, волна улучшений UP-OV; одинаковый файл в Обороне и Викторине — правки в обоих) =====
   «Завтра — подарок»: ОДНО окно за всё время, в конце первого захода (игра решает когда — O.ready()), только VK и ОК (та же VK-сборка, живой мост — SOC.ok()).
   В окне: что ждёт завтра (подарок за вход, задание дня, серия — тексты даёт игра O.body()), и сразу кнопки площадки:
   «🔔 Напомнить завтра» — VKWebAppAllowNotifications через SOC.ntf(1), только если модуль SOC ещё ни разу не спрашивал (st.ntf.n=0) и можно (в ОК нельзя — SOC.can('ntf') молчит);
     показ засчитывается как показ №1 расписания SOC (S.soc.ntf={n:1,t}) — следующий вопрос модуль задаст сам не раньше 3-го дня;
   «⭐ В избранное» — SOC.fav(), только VK (в ОК избранного нет — SOC.can('fav')), и НЕ в первую сессию (правило VK 2.6.3, как в SOC.offer).
   Наград за кнопки нет (правило VK 2.6.2). Яндекс, мак без моста, ?demo — окна нет.
   Игра: TMR.init({ready, done, mark, body, title, modal(html)→контейнер, close, toast, cls — класс кнопок, main — доп. класс «Дальше», row — класс ряда кнопок, now, ok — тост после «разрешил»}) после SOC.init; переход «дальше» — TMR.go(f): окно положено — покажет и вызовет f по «Дальше», иначе сразу f().
   Статистика: mod {m:'tmr', a: show|ntf|fav|go}; soc {a:'ntf', r:'show', n:1, d} — как у SOC.offer (ответ ok/no пишет сам SOC.ntf). */
var TMR=(function(){
  var O=null,on=false;
  function st(){return typeof S!=='undefined'&&S&&S.soc&&typeof S.soc==='object'?S.soc:{};}
  function plat(){try{return typeof PLAT!=='undefined'&&PLAT==='vk'&&typeof SOC!=='undefined'&&SOC.ok();}catch(e){return false;}}
  function demo(){try{return !!window.__demo||/[?&]demo=/.test(location.search);}catch(e){return false;}}
  function call(f,d){try{return f?f():d;}catch(e){return d;}}
  function ev(a){try{STAT.ev('mod',{m:'tmr',a:a});}catch(e){}}
  function ntfOk(){try{var s=st();return SOC.can('ntf')&&SOC.ntfDue()&&!(s.ntf&&+s.ntf.n);}catch(e){return false;}}
  function favOk(){try{var s=st(),x=s.fav||{};return SOC.can('fav')&&!x.d&&(+x.n||0)<3&&(!x.t||Date.now()-x.t>30*864e5)&&(+s.ses||0)>=2;}catch(e){return false;}} // правило SOC.offer: не чаще раза в 30 дней, ≤3 раз
  function init(o){O=o||{};}
  function due(){return !!O&&!on&&plat()&&!demo()&&!call(O.done,true)&&!!call(O.ready,false);}
  function go(f){f=f||function(){};if(!due()){f();return false;}show(f);return true;}
  function show(f){on=true;call(O.mark);ev('show');
    var n=ntfOk(),fv=favOk(),c=O.cls||'btn',b=call(O.body,'')||'';
    var h='<div class="tmr-w"><h3>'+(O.title||'📅 Завтра — подарок!')+'</h3>'+b+
      (n||fv?'<div class="'+(O.row||'btns')+' tmr-b">'+(n?'<button class="'+c+'" id="tmrN">🔔 Напомнить завтра</button>':'')+(fv?'<button class="'+c+'" id="tmrF">⭐ В избранное</button>':'')+'</div>':'')+
      '<div class="'+(O.row||'btns')+' tmr-g"><button class="'+c+' '+(O.main||'')+'" id="tmrGo">Дальше ▸</button></div></div>';
    var box=call(function(){return O.modal(h);},null)||document;
    function q(id){return box.querySelector?box.querySelector('#'+id):document.getElementById(id);}
    if(n){try{var s=st();s.ntf={n:1,t:call(O.now,0)||Date.now()};if(typeof save==='function')save();STAT.ev('soc',{a:'ntf',r:'show',n:1,d:SOC.ntfDay()});}catch(e){}
      var bn=q('tmrN');if(bn)bn.onclick=function(){bn.disabled=true;ev('ntf');Promise.resolve(SOC.ntf(1)).then(function(y){if(y&&O.ok&&O.toast)O.toast(O.ok);if(y&&bn.parentNode)bn.parentNode.removeChild(bn);else bn.disabled=false;}).catch(function(){bn.disabled=false;});};}
    if(fv){var bf=q('tmrF');if(bf)bf.onclick=function(){bf.disabled=true;ev('fav');Promise.resolve(SOC.fav()).then(function(y){if(y&&bf.parentNode)bf.parentNode.removeChild(bf);else bf.disabled=false;}).catch(function(){bf.disabled=false;});};}
    var bg=q('tmrGo');if(bg)bg.onclick=function(){ev('go');on=false;call(O.close);f();};}
  return {v:1,init:init,due:due,go:go};
})();
