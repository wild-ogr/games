/* b2-fest.js — FEST — праздники по настоящей дате (по Москве) в «Магнате 2.0». Стартовый файл потока «fest» (договоры — в начале js/b2-core.js).
   Тяжёлое грузится по требованию (только в браузере, после старта): js/b2-fest-mod.js — общий модуль FEST (таблица праздников, оформление,
   STAT fest), js/b2-fest-hol.js — содержимое праздников Магната (праздничная точка «сколько закупить?», Распродажа у Бориса, Корпоратив,
   Итоги года, цепочка из 5 праздничных заданий).
   Устройство: S.b2v = {fest:{…} — данные модуля FEST (застали/награды), p — праздничная точка, w — показанные окна, t — задания, x — выборы, r — итоги точек}.
   Облако — глубокое слияние каркаса (числа — больше, объекты — по ключам) = то же, что FEST.merge; объект S.b2v.fest сохраняет ссылку модуля.
   ДЛЯ ДРУГИХ ПОТОКОВ (договор FEST, подробно — logs/FEST.md):
     B2.fest.now()        → [id идущих праздников Магната с содержимым] (пусто — праздника нет)
     B2.fest.tasks()      → [{id:'ny27.2', h:'ny27', i:2, who:'vit', ru, en, ok, got}] — праздничная цепочка (EVENT кладёт в Поток)
     B2.fest.claim(id)    → выдать награду задания (💎 по договору чисел 'fest.task'; 5-е — ещё 'fest.done' и значок навсегда)
     B2.fest.open(id?)    — окно праздника; B2.fest.stall() → {h, ico, ru, en, n, cash} для палатки на Улице (HOME) или null
     B2.fest.flow = true  — EVENT показывает задания в Потоке (тогда карточка «Сегодня» их не дублирует)
     Шина: B2.emit('fest', {a:'task'|'stall'|'start', h}) — что-то поменялось (перерисовать Поток/Улицу).
   Гнёзда: 'today' (карточка праздника), 'street' (палатка на Улице — если HOME заведёт это гнездо), окно входа prio 60. */
(function(){'use strict';
B2.off.fest=0;          // 1 — выключено по умолчанию
if(B2.off('fest'))return;
const HAS=typeof document!=='undefined'&&typeof window!=='undefined';
const F=B2.fest={ready:false,flow:false,
  now:()=>F.H?F.H.now():[],tasks:()=>F.H?F.H.tasks():[],claim:id=>F.H?F.H.claim(id):0,open:id=>F.H?F.H.open(id):false,stall:()=>F.H?F.H.stall():null};
function sv(){return B2.s('v');}
// загрузка: модуль FEST (≈32 КБ) → init → содержимое праздников, только если идёт праздник Магната или есть незакрытая точка/итоги
function boot(){if(F.ready||F.busy)return;F.busy=1;
  B2.need('b2-fest-mod.js').then(()=>{if(typeof FEST==='undefined')throw new Error('FEST');const s=sv();
    FEST.init(s,{g:'magnat',plat:typeof PLAT!=='undefined'?PLAT:'vk',lang:typeof LANG!=='undefined'?LANG:'ru',
      save:()=>{try{save();}catch(e){}},now:()=>{try{return nowMs();}catch(e){return Date.now();}},cls:'btn noenter',
      modal:h=>{modal(h);return document.getElementById('mcard');},close:()=>hideModal(),
      low:()=>!!(document.body&&(document.body.classList.contains('calm')||document.body.classList.contains('lite'))),
      change:()=>{if(F.H)F.H.day();else if(want())hol();}});
    F.mod=1;if(want())return hol();F.busy=0;})
  .catch(e=>{F.busy=0;try{console.warn('b2-fest',e);}catch(x){}});}
function want(){const s=sv();if(s.p&&!s.p.z)return true;try{return FEST.list().some(r=>/^(bf|mam|ny|kan|sng|stu|lub|bog|mar|mas|trg)\d\d$/.test(r.id));}catch(e){return false;}}
function hol(){return B2.need('b2-fest-hol.js').then(()=>{F.busy=0;if(F.H){F.ready=true;F.H.boot();}}).catch(()=>{F.busy=0;});}
if(HAS){
  // грузим сразу после старта (до очереди окон входа: она ждёт ≥ 0,7 с после 'enter'); на медленной сети окно праздника придёт на следующем входе
  setTimeout(boot,300);B2.on('enter',boot);B2.on('back',()=>{if(F.H)F.H.day();});
  B2.win({id:'fest',o:'fest',prio:60,ok:c=>!!(F.H&&F.H.winOk(c)),show:c=>F.H.win(c)});
  B2.slot('today','fest',c=>F.H?F.H.today(c):'',55);
  B2.slot('street','fest',c=>F.H?F.H.street(c):'',60);
  B2.click('fest',(a,arg,el,e)=>{if(F.H)F.H.click(a,arg,el,e);});
}
})();
