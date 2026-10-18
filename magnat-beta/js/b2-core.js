/* ===== b2-core.js — каркас «Магнат 2.0» (поток CORE, 18.10.2026). Грузится ДО shell.js (сразу после savepack.js); работает и без DOM (jsc-симуляторы).

  ДОГОВОРЫ ДЛЯ СТРОИТЕЛЕЙ (читать целиком; то же — в ~/Projects/hobby-analytics/release-b/M50-boost/logs/CORE.md)

  0. ФАЙЛЫ. Свой код — только js/b2-<поток>*.js. Стартовый файл потока js/b2-<id>.js УЖЕ ЕСТЬ (заглушка) и уже подключён в index.html,
     pack.sh и sim*.sh — index.html/pack.sh/sim*.sh НЕ ПРАВИТЬ. Стартовый файл — маленький (≤ 8 КБ: флаг, крючки, гнёзда, регистрация);
     всё тяжёлое (мини-игры, данные, окна) — в js/b2-<id>-*.js и грузится по требованию через B2.need. Все js/b2-*.js попадают в архивы
     (кроме js/b2-beta*.js — только бета). Файлы обязаны грузиться в jsc без DOM: на верхнем уровне не трогать document/window.* кроме B2.
     id потоков (ключи ниже): st first home rival quarry nedra krai krai2 story mgcore mg1 mg2 event fest cup eco polish team juice vkt.

  1. ФЛАГИ. B2.off('<id>') → true, если новинка выключена. Каждый поток в начале своего файла:
        B2.off.eco = 0;          // 1 — выключено по умолчанию (не успело к отсечке)
        if (B2.off('eco')) return;  // внутри своей (function(){ … })()
     Приоритет: ?on=id1,id2 (включить) > ?off=id1,id2 | ?off=all > window.B2_OFF=['id'] > B2.off.<id>. Выключено = ни гнёзд, ни окон, ни миграции
     не зовутся (каркас сам пропускает зарегистрированное от выключенного потока). Данные W.b2.<id> при этом не стираются.

  2. ЗАГРУЗЧИК. B2.need('b2-eco-shop.js') → Promise (один раз на файл; повтор через 1,5 с с ?r=2; неудача — reject + STAT b2need).
     В jsc грузит синхронно (load). Путь — относительно js/. Только свои файлы b2-*.

  3. ШИНА. B2.on(ev, fn) / B2.emit(ev, ...a). События каркаса:
        'enter'  ()        — один раз за запуск, после офлайна (окно «Пока вас не было» уже решено). Тут регистрируют кандидатов окна.
        'win'    (id)      — каркас показал окно из очереди входа.
        'today'  (el)      — перерисован экран «Сегодня» (гл.1–4 biz-ui rToday, гл.5 ui.js rMap).
        'back'   (ms)      — игрок вернулся во вкладку после ≥ 60 с.
        'fx'     (key)     — бета: загружена фикстура из тест-меню (перед перезагрузкой).
     Игровые события — как раньше GAME.on: day, change, close, found, built, upgraded, auc, offline, ipo, cr, mile, rank, nedra, ruin, rollback, reset…

  4. ГНЁЗДА в чужих экранах. B2.slot(гнездо, '<id>', fn(ctx)→html, prio=50). Хозяин экрана зовёт B2.html(гнездо, ctx) → готовый html
     (каждая карточка в <div class="b2-s" data-b2s="<id>">). Порядок — prio по убыванию. Гнёзда сейчас:
        'today'   — «Сегодня» (над «▼ Ещё…»), ctx {W}
        'close'   — окно «Закрытие месяца» (над кнопками), ctx {W, rep}
        'cab'     — Кабинет (под «Новое»), ctx {W, tab}
        'phone'   — телефон, главный экран (под приложениями), ctx {W}
        'settings'— ⚙ Настройки (строки button.set), ctx {}
        'morning' — строки «окна утром» (хозяин окна — FIRST, зовёт B2.html('morning')); EVENT/MG/CUP кладут сюда строки.
        b2-merge (18.10), гнёзда потоков: 'top' — верх «Сегодня» гл.1–4 (Улица HOME, biz-ui), 'goal' — под целью (HOME; внутри зовёт 'home' — строки
        потоков под целью), 'pit' — вкладка «Карьер» (QUARRY, biz-ui rPit), 'riv' — «Соперники в городе» (RIVAL, fin.js), 'reg' — экран региона
        (KRAI, ui.js), 'ipo' — окно IPO, выбор края (KRAI, ui.js), 'street' — запасное гнездо FEST (рисует Улица через B2.street.add, хозяина нет).
     Новое гнездо — 1 строка «/* b2-<поток> * /» B2.html('<имя>',ctx) в экране-хозяине + запись в этот список (через CORE/MERGE).
     НАЖАТИЯ: в своей разметке data-b2="<id>:<действие>[:<арг>]", обработчик — B2.click('<id>', (act, arg, el, ev) => {…}).
     Одно делегированное нажатие на документ; кнопкам ставить class="noenter" там, где Enter не должен жать.

  5. ОЧЕРЕДЬ ОКОН ПРИ ВХОДЕ — не больше ОДНОГО окна за вход (урок 4 брифа).
        B2.win({id:'first-morning', o:'first', prio:80, ok(ctx){return …}, show(ctx){ modal(…) }, after:false})
     Регистрировать заранее (на загрузке файла) или в B2.on('enter'). Каркас ждёт, пока свободно (нет окна modalOn, GAME.hold пуст — пролог,
     сломанное сохранение…, вкладка видна, нет B2.busy), берёт кандидатов с ok(ctx)=true и показывает ОДНО с наибольшим prio.
     ctx = {hadWin: игра уже показала своё окно на этом входе (обычно «Пока вас не было»), off: сводка офлайна или null, n: номер входа}.
     Если hadWin — показываются только кандидаты с after:true (по умолчанию окно ждёт следующего входа). Приоритеты: FIRST «утро» 80,
     события/праздники 60, лига 40, остальное ≤ 30. B2.busy(()=>bool) — добавить своё «сейчас нельзя» (например, обучение).
     Ждём до 90 с, потом не показываем ничего. STAT: b2win {id, n: сколько кандидатов}.

  6. СОХРАНЕНИЕ — МИР. W.b2 = {} заводит ECON.migrate (FMT_V 7). Свои данные — только W.b2.<id> (объект):
        const o = B2.w(W, 'eco');                 // гарантирует W.b2.eco = {}
        B2.mig('eco', (W, o, fx) => { if (o.n == null) o.n = 0; });   // шаг migrate: зовётся при КАЖДОМ migrate, должен быть идемпотентным
     FMT_V не трогать. Нельзя ключи $n $k $s $m $i $d $pk. Только числа, короткие строки, маленькие массивы. ≤ 2 000 знаков упакованного на поток
     (B2.size(W) → {id: знаков}; проверка — tools/b2check.py). Новый мир после IPO — новый W (W.b2 пуст): что должно пережить IPO — держите в S.b2<буква>.

  7. СОХРАНЕНИЕ — УСТРОЙСТВО. Один объект S.b2<буква> на поток (буквы закреплены в B2.SK ниже, других новых ключей в S не заводить):
        const s = B2.s('o');   // S.b2o = {} гарантирован
     Облако: по умолчанию глубокое слияние «числа — больше, объекты — по ключам, прочее — своё, если нет — чужое».
     Своя функция — B2.sMerge('o', (mine, theirs, newer) => объект). Чинится в fixSave (не объект → {}).

  8. МИССИИ VK — B2.vkm('<id>', [{id:'eco_1', p:10, …}]) — список для потока VKT; квоты B2.MQ (мини-игры 20, события 15, остальные 5).
  9. СТАТИСТИКА — B2.ev('<id>', 'имя', {…}) → STAT.ev('b2<id>_имя') (имя события ≤ 16 знаков, длинное обрежется). stat-hooks.js не трогать.
 10. БЕТА — B2.beta (только /magnat-beta/ или ?beta=1 на маке/LAN). Тест-меню «🧪 Начать с главы…» в ⚙ — js/b2-beta.js + фикстуры js/b2-beta-fx.js
     (обновить: python3 tools/b2-beta-fx.py). В архивы VK/Яндекса b2-beta* не попадают.
===== */
(function(root){
'use strict';
const HAS_DOM=typeof document!=='undefined'&&typeof window!=='undefined';
const qs=HAS_DOM&&location&&location.search||'';
const qlist=k=>{const m=new RegExp('[?&]'+k+'=([^&#]*)').exec(qs);return m?decodeURIComponent(m[1]).split(',').map(s=>s.trim()).filter(Boolean):[];};
const Q_OFF=qlist('off'),Q_ON=qlist('on');
const IDS=['st','first','home','rival','quarry','nedra','krai','krai2','story','mgcore','mg1','mg2','event','fest','cup','eco','polish','team','juice','vkt'];
const SK={z:'st',f:'first',h:'home',r:'rival',q:'quarry',n:'nedra',k:'krai',K:'krai2',s:'story',m:'mgcore',x:'mg1',y:'mg2',e:'event',v:'fest',c:'cup',o:'eco',p:'polish',t:'team',j:'juice',w:'vkt'};
const BAD_KEYS=['$n','$k','$s','$m','$i','$d','$pk'];
const isObj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const safe=(f,...a)=>{try{return f(...a);}catch(e){try{console.error('B2',e);}catch(x){}return undefined;}};

/* 1. флаги */
function off(id){if(!id)return false;id=String(id);
  if(Q_ON.indexOf(id)>=0)return false;
  if(Q_OFF.indexOf(id)>=0||Q_OFF.indexOf('all')>=0)return true;
  const wo=HAS_DOM&&window.B2_OFF;if(Array.isArray(wo)&&(wo.indexOf(id)>=0||wo.indexOf('all')>=0))return true;
  return !!off[id];}

/* 2. загрузчик */
const loads={};
function need(f){f=String(f);if(!/^b2-[\w.-]+\.js$/.test(f))return Promise.reject(new Error('B2.need: только js/b2-*.js'));
  if(loads[f])return loads[f];
  if(!HAS_DOM){loads[f]=new Promise((ok,no)=>{try{root.load('js/'+f);ok();}catch(e){no(e);}});return loads[f];}
  const one=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>ok();s.onerror=()=>{s.remove();no(new Error('load '+src));};document.head.appendChild(s);});
  loads[f]=one('js/'+f).catch(()=>new Promise(r=>setTimeout(r,1500)).then(()=>one('js/'+f+'?r=2'))).catch(e=>{delete loads[f];ev0('b2need',{f:f.slice(0,40)});throw e;});
  return loads[f];}

/* 3. шина */
const subs={};
function on(n,fn){(subs[n]=subs[n]||[]).push(fn);}
function emit(n,...a){for(const fn of (subs[n]||[]).slice())safe(fn,...a);}

/* 4. гнёзда и нажатия */
const slots={},clicks={};
function slot(name,id,fn,prio){if(typeof id==='function'){prio=fn;fn=id;id='?';}(slots[name]=slots[name]||[]).push({id,fn,p:prio==null?50:+prio});slots[name].sort((a,b)=>b.p-a.p);}
function html(name,ctx){const l=slots[name];if(!l||!l.length)return '';let h='';
  for(const s of l){if(off(s.id))continue;const r=safe(s.fn,ctx||{});if(r)h+='<div class="b2-s" data-b2s="'+s.id+'">'+r+'</div>';}return h;}
function click(id,fn){clicks[id]=fn;}
if(HAS_DOM)document.addEventListener('click',e=>{const el=e.target&&e.target.closest&&e.target.closest('[data-b2]');if(!el)return;
  const p=String(el.getAttribute('data-b2')).split(':'),id=p[0],fn=clicks[id];if(!fn||off(id))return;safe(fn,p[1]||'',p.slice(2).join(':'),el,e);});

/* 5. очередь окон при входе */
const wins=[],busyF=[];let entN=0,entered=false;
function win(o){if(o&&o.id&&typeof o.show==='function'){const i=wins.findIndex(x=>x.id===o.id);if(i>=0)wins.splice(i,1);wins.push(o);}}
function busy(fn){busyF.push(fn);}
function free(){if(!root.GAME||!GAME.W)return false;
  if(typeof modalOn!=='undefined'&&modalOn)return false;if(GAME.hold&&GAME.hold.size)return false;
  if(HAS_DOM&&document.hidden)return false;if(HAS_DOM&&root.__offPend&&Date.now()-root.__offPend<30000)return false;   /* b2-merge: окно «Пока вас не было» ещё в очереди — ждём его */
  for(const f of busyF)if(safe(f))return false;return true;}
function enter(sum){if(HAS_DOM&&!B2.ready){on('ready',()=>enter(sum));return;}   // вход раньше загрузки файлов потоков — ждём их
  if(entered)return;entered=true;entN++;const ctx={hadWin:false,off:sum||null,n:entN};emit('enter',ctx);
  if(!HAS_DOM)return;const t0=Date.now();
  const tick=()=>{if(typeof modalOn!=='undefined'&&modalOn)ctx.hadWin=true;
    if(Date.now()-t0>90000)return;if(!free())return setTimeout(tick,500);
    const c=wins.filter(w=>!off(w.o)&&(!ctx.hadWin||w.after)&&safe(()=>w.ok?!!w.ok(ctx):true)).sort((a,b)=>(b.prio||0)-(a.prio||0));
    if(!c.length)return;const w=c[0];B2.lastWin=w.id;ev0('b2win',{id:String(w.id).slice(0,24),n:c.length});safe(w.show,ctx);emit('win',w.id);};
  setTimeout(tick,700);}
if(HAS_DOM){let hidAt=0;document.addEventListener('visibilitychange',()=>{if(document.hidden)hidAt=Date.now();else if(hidAt){const ms=Date.now()-hidAt;hidAt=0;if(ms>=60000)emit('back',ms);}});}

/* 6. мир */
const migs=[];
function w(W,id){if(!W)return {};if(!isObj(W.b2))W.b2={};if(!isObj(W.b2[id]))W.b2[id]={};return W.b2[id];}
function mig(id,fn){migs.push({id,fn});const W=root.GAME&&GAME.W;if(W&&!off(id))try{fn(W,w(W,id),[]);}catch(e){try{console.error('B2.mig',id,e);}catch(x){}}}   // мир уже загружен (GAME.start идёт раньше файлов потоков) — шаг сразу
function runMig(W,fx){if(!isObj(W.b2))W.b2={};for(const k of BAD_KEYS)if(k in W.b2)delete W.b2[k];
  for(const m of migs){if(off(m.id))continue;try{m.fn(W,w(W,m.id),fx||[]);}catch(e){(fx||[]).push('b2:'+m.id+':'+e.message);try{console.error('B2.mig',m.id,e);}catch(x){}}}}
function size(W){const r={};if(W&&isObj(W.b2))for(const k in W.b2){let o=W.b2[k];try{if(root.PACK&&PACK.packSafe)o=PACK.packSafe({b:o}).b;}catch(e){}r[k]=JSON.stringify(o).length;}return r;}

/* 7. устройство */
const sMerges={};
function S_(){return typeof S!=='undefined'?S:null;}
function s(letter){const st=S_();if(!st||!SK[letter])return {};const k='b2'+letter;if(!isObj(st[k]))st[k]={};return st[k];}
function sMerge(letter,fn){sMerges[letter]=fn;}
function deep(a,b){if(!isObj(a))return isObj(b)?JSON.parse(JSON.stringify(b)):a;if(!isObj(b))return a;
  for(const k in b){const x=a[k],y=b[k];
    if(typeof y==='number'&&isFinite(y)){if(typeof x!=='number'||y>x)a[k]=y;}
    else if(isObj(y)){a[k]=isObj(x)?deep(x,y):(x==null?deep({},y):x);}
    else if(x==null)a[k]=y;}
  return a;}
function fixS(st){if(!st)return;for(const k in st)if(/^b2.$/.test(k)&&!isObj(st[k]))st[k]={};}
function mergeS(st,d,newer){if(!st||!isObj(d))return;for(const k in d){if(!/^b2.$/.test(k)||!isObj(d[k]))continue;const L=k.slice(2);
  const f=sMerges[L];const r=f?safe(f,isObj(st[k])?st[k]:{},d[k],!!newer):deep(isObj(st[k])?st[k]:{},d[k]);if(isObj(r))st[k]=r;}}

/* 8–9. миссии и статистика */
const MQ={mgcore:20,mg1:20,mg2:20,event:15,fest:15,krai:15,rival:8},vkmL={};   // b2-merge: krai 15, rival 8 (план §5)
function vkm(id,list){if(Array.isArray(list))vkmL[id]=list;}
function ev0(n,p){try{if(root.STAT&&STAT.ev)STAT.ev(n,p);}catch(e){}}
function ev(id,n,p){ev0(('b2'+id+'_'+n).slice(0,16),p);}

/* 11. STAT v1.6: плавность (frame — по кадрам браузера, пока время идёт), долгая смена дня и переход экрана (slow ≥ 300 мс), прогресс (pl, prg раз за загрузку) */
const CH=['gig','small','mid','quarry','nedra'];let plN=0,dayN=0,dayA=0,dayB=0;
function dayMs(ms){dayN++;if(HAS_DOM){const n=performance.now();if(n-dayB>50)dayA=n-ms;dayB=n;}if(ms>=300&&dayN>2)safe(()=>STAT.slow('day',ms,{ch:chOf()}));}   // первые 2 дня после загрузки — прогрев (тень денег), не в счёт
function chOf(){const W=root.GAME&&GAME.W;return W?Math.max(1,CH.indexOf(W.st)+1):0;}
function statInit(){if(!HAS_DOM||!root.STAT)return;
  let fOn=false;const fl=()=>{if(!fOn)return;safe(()=>STAT.frame());requestAnimationFrame(fl);};
  setInterval(()=>{const r=!!(root.GAME&&GAME.running&&GAME.running());if(r&&!fOn){fOn=true;requestAnimationFrame(fl);}else if(!r)fOn=false;
    const c=chOf();if(c&&c!==plN){plN=c;safe(()=>STAT.pl(c));}},500);
  // прочие долгие задачи (нажатие, переход экрана) — longtask ≥ 300 мс вне смены дня; sc = 't:<экран>' (последний STAT.screen)
  let scr='';if(STAT.screen&&!STAT.screen.b2){const s0=STAT.screen;STAT.screen=function(n){scr=String(n||'');return s0.apply(this,arguments);};STAT.screen.b2=1;}
  try{new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.duration<300)continue;const a=e.startTime,b=a+e.duration;if(b>dayA-5&&a<dayB+5)continue;
    safe(()=>STAT.slow('t:'+(scr||'start'),e.duration,{ch:chOf()}));}}).observe({type:'longtask',buffered:false});}catch(e){}
  on('enter',()=>{const W=root.GAME&&GAME.W;if(!W)return;let sz=0;try{sz=Math.round((localStorage.getItem('magnat-v1')||'').length/1000);}catch(e){}
    safe(()=>STAT.ev('prg',{ch:chOf(),h:W.hold|0,mo:Math.floor((W.t||0)/30),bz:(W.biz||[]).length,ob:(W.obj||[]).length,cr:(typeof S!=='undefined'?S.cr|0:0),fm:(typeof S!=='undefined'&&S.fame?S.fame.length:0),sz}));});}
/* готовность: все стартовые файлы загружены (DOMContentLoaded) — перерисовать экран с гнёздами; новый мир (IPO, «заново») — шаги миграции */
if(HAS_DOM)document.addEventListener('DOMContentLoaded',()=>{statInit();B2.ready=true;emit('ready');
  if(root.GAME&&GAME.on){const rm=()=>{if(GAME.W)runMig(GAME.W,[]);};GAME.on('ipo',rm);GAME.on('reset',rm);}
  if(Object.keys(slots).length&&root.UI&&UI.refresh)safe(()=>UI.refresh());
  if(B2.beta)need('b2-beta.js').catch(()=>{});});
const B2={v:1,dayMs,IDS,SK,MQ,off,need,on,emit,slot,html,click,win,busy,enter,w,mig,runMig,size,s,sMerge,fixS,mergeS,vkm,vkmL,ev,isObj,
  get beta(){try{return typeof BETA!=='undefined'&&!!BETA;}catch(e){return false;}},_wins:wins,_slots:slots};
root.B2=B2;
})(typeof window!=='undefined'?window:globalThis);
