'use strict';
/* ================= zb-core — каркас буста «Школа бабы Зины» (10.10.2026, ветка zb-core) =================
   Договор для всех потоков (logs/COMMON.md). Файл грузится ДО core.js и ни от чего в игре не зависит при загрузке.
   Хозяин — VIEW (после каркаса правки договора — только через журнал VIEW «Просьбы от других»; добавлять можно, ломать нельзя).

   ГНЁЗДА (массивы; модуль кладёт объект, ядро/VIEW рисует; тот же id — замена, а не второй):
   ZB.homeSlots  {id, order, zone, render(ctx)→html, mount(el,ctx)}            главный экран (#zbHome). zone: 'top' — полосой под шапкой
                 (праздник, подарок), 'today' — строка «Сегодня у Зины», 'school' — школа/кабинеты, 'side' — правая колонка ПК, 'bottom'
   ZB.navSlots   {id, order, ic, t, go(), dot()→bool}                         нижняя панель (Дом · Путь · Школа · Словарь · Перемена)
   ZB.winSlots   {id, order, zone, fit, render(ctx)→html, mount(el,ctx)}      окно победы; zone: 'ladder' (лесенка наград), 'goal', 'mg'
                 (приглашение на Перемену), 'tmr' («Завтра…»), 'extra'. fit — порядок скрытия, если окно не влезло (1 — первым).
                 Главные кнопки окна — только VIEW; в гнезде не больше одной кнопки `btn ghost small`.
                 ctx = {g, r, first, daily, idx, light, again}
   ZB.chapSlots  то же для праздника конца главы (openChapFinale)
   ZB.levelSlots {id, order, zone:'top'|'side'|'board', render(ctx)→html, mount(el,ctx)} — поверх уровня (#zbLevel)
   ZB.todayTasks {id, order, t, ic, done()→bool, go(), hint()→str}            дела «Сегодня у Зины» — рисует SCHOOL
   ХУКИ:
   ZB.startHook.push(fn(info))   начало уровня: {l (1-based), idx, daily, mode, key}
   ZB.levelHook.push(fn(info))   ровно раз на попытку: {l, idx, ok, end:'win'|'quit', daily, first, mode, s (сек), words (найдено),
                                 of (всего слов), bonus, hinted, miss, reward, key}
   ZB.on(ev, fn) / ZB.emit(ev, data)  события: 'ready' (все модули загружены), 'screen' (имя), 'home', 'level', 'start', 'save', 'cloud'
   СОХРАНЕНИЕ (только свои поля, без правок fixSave/mergeSave):
   ZB.onSave({id, keys:['scl','scd'] | prefix:'sc' | ['sc','td'], test:k=>bool, fix:S=>void, merge:(S,d,newer)=>void})
     fix — при загрузке и после слияния (привести к виду, проставить умолчания). merge — облако d слить в S (S меняется на месте).
     Общий цикл mergeSave такие поля НЕ трогает (даже если их нет в S) — сливает только ваш merge. Регистрация позже облака —
     merge вызовется сразу с последним облаком. Без merge поле берётся из облака, только если его нет на устройстве.
   ЭКРАНЫ: ZB.screen(name, {render(el,opts), title}) — новый экран (section.screen#zb-<name>), ZB.go(name, opts) — показать.
   ПОДГРУЗКА: ZB.load('js/zmg-diktant.js') → Promise (повтор 1 раз; не загрузилось — reject, игра живёт; предохранитель загрузки
     index.html такие файлы НЕ перезагружает). Обязательные модули — строкой <script defer data-zb> в своём блоке index.html.
   ПОМОЩНИКИ: ZB.html(list, zone, ctx) → html гнёзд зоны (каждое в <div class="zbs" data-zb="id">), ZB.mount(root, list, ctx),
     ZB.refresh() — перерисовать гнёзда текущего экрана, ZB.safe(id, fn) — вызвать без падения игры (ошибка → консоль + STAT).
   Старые WebView (Chrome 92 — 3 % сеансов): без `?.`/`??`, `.at`, `:has`, `structuredClone`, `??=`.

   ===== ДОГОВОР ВИДА (VIEW, 10.10; дополнение — старое не менялось) =====
   ZB.viewOn          true — новый вид «Школа бабы Зины» (хаб «Дом», панель, «Путь», лесенка победы, фон места в уровне).
                      false (`?view=0`, или js/zb-view.js не загрузился) — старый вид целиком; гнёзда главного рисуются каркасом как раньше.
                      Включён ли вид на деле — `ZB.vw` (ставит zb-view.js) и класс `html.zbv`.
   ЭКРАНЫ ВИДА:  ZB.go('home') — «Дом» (это #menu, = openMenu()); ZB.go('path') — «Путь» (дорога глав); ZB.go('school') — «Школа»;
                 ZB.go('mg') — «Перемена». 'school' и 'mg' — рамки: VIEW даёт заглушку, хозяин (CAB / MG0) регистрирует свой
                 ZB.screen('school'|'mg', …) — тот же name заменяет заглушку. В своём экране «Школа» CAB вставляет ZB.vwMore() —
                 html со старыми входами (Облики, Рейтинг/Успехи, Главы, Соседки, Игры, Об игре): ничего старого не теряем.
   НИЖНЯЯ ПАНЕЛЬ (ZB.navSlots, свои VIEW): home «Дом» 10, path «Путь» 20, school «Школа» 30, dict «Словарь» 40, mg «Перемена» 50.
                 Свою кнопку с тем же id кладёт хозяин (замена). Новое поле on()→bool — показывать ли (нет — кнопки нет;
                 «Перемена» у VIEW показывается, только если есть экран 'mg' или гнёзда ZB.mgSlots). Больше 5 кнопок не рисуем.
   ГНЁЗДА ВИДА (как остальные: {id, order, zone, render(ctx)→html, mount(el,ctx)}):
   ZB.pathSlots   «Путь»: zone 'top' — над дорогой (праздник, режимы), 'node' — у кружка главы (ctx {c (с 0), n (с 1), done, cur, lock,
                  from, to (уровни с 0), ch: ZB.chap(c)}; вход в режимы MODE на пройденных — сюда, одна маленькая кнопка), 'bottom'.
   ZB.schoolSlots заглушка «Школы»: zone 'top' | 'main' | 'bottom' (пока CAB не дал свой экран). ctx {}
   ZB.mgSlots     заглушка «Перемены»: zone 'top' | 'main'. ctx {}
   ZB.homeSlots   на «Доме» VIEW рисует: 'top' — полосой над сценой, 'today' — под «Играть» (заголовок «Сегодня у Зины» — свой у SCHOOL;
                  пусто — VIEW показывает свои плитки: задание дня, гостинец, соседки), 'school' — ниже, 'side' — правая колонка ПК
                  (на телефоне — под 'school'), 'bottom' — в самом низу.
   ОКНО ПОБЕДЫ (лесенка: штамп «5+» → открытка словаря № → монеты в счётчик → шаг полоски главы → Зина и Ять → «Дальше» → «Завтра…»):
                  зоны winSlots: 'ladder' — ступенька после монет, 'goal' — у полоски главы (сувенир, класс), 'mg' — приглашение на
                  Перемену, 'tmr' — строка «Завтра…» (есть гнёзда tmr — своя строка VIEW не рисуется), 'extra' — перед кнопками.
                  ОДНО ПРЕДЛОЖЕНИЕ В ОКНЕ (правило — шапка js/zb-win.js): глава > «Напомнить»/вопрос > Перемена (zone 'mg') > корзинка > цель облика.
                  ctx.busy=true — место предложения занято (zone 'mg' тогда вообще не рисуется).
   МЕСТО ГЛАВЫ:   ZB.chap(c) → {c, n (с 1), name, e, color, s, from, to, place (номер рисунка 1…25 или 0), cls, hard} — глава c (с 0):
                  главы 26+ — из ZBCH (LVL), 1–25 — CHAPTERS; ZB.chapCount(); ZB.chapAt(idx) → номер главы уровня idx (с 0).
                  ZB.place(c) → Promise(html) — рисунок места (content/art/place-NN.js, грузится лениво; нет — '' ); ZB.placeInto(el, c, ratio) —
                  фон в элемент: сразу цвет главы, потом рисунок. Рисунки — window.ZB_ART[NN] = {id, n, c, svg(ratio)}.
   РЕПЛИКИ:       ZB.say(key, ctx, запас[]) → ZBT.say(key, ctx) (TEXT), нет ZBT/пусто — случайная из запаса.
*/
(function(){
  var ZB=window.ZB={v:1,homeSlots:[],navSlots:[],winSlots:[],chapSlots:[],levelSlots:[],todayTasks:[],startHook:[],levelHook:[],
    pathSlots:[],schoolSlots:[],mgSlots:[], /* VIEW: гнёзда «Пути», заглушек «Школы» и «Перемены» */
    saves:[],miss:[],isReady:false,_ev:{},_scr:{},_d:null,_newer:false};
  // VIEW: флаг нового вида (?view=0 — старый вид целиком)
  ZB.viewOn=!/[?&]view=0(&|$)/.test(location.search);
  function err(id,e){try{console.error('[zb] '+id,e);if(window.STAT&&STAT.ev)STAT.ev('zberr',{m:String(id).slice(0,40),e:String(e&&e.message||e).slice(0,80)});}catch(x){}}
  ZB.safe=function(id,fn){try{return fn();}catch(e){err(id,e);}};
  ZB.on=function(ev,fn){(ZB._ev[ev]=ZB._ev[ev]||[]).push(fn);};
  ZB.emit=function(ev,data){var L=ZB._ev[ev]||[];for(var i=0;i<L.length;i++)(function(f){ZB.safe('on:'+ev,function(){f(data);});})(L[i]);};
  function sorted(list,zone){return list.filter(function(s){return s&&(!zone||(s.zone||'')===zone);})
    .sort(function(a,b){return (a.order||0)-(b.order||0);});}
  // один id — одна запись (последняя побеждает): повторная регистрация модуля не дублирует гнездо
  ZB.add=function(list,slot){for(var i=0;i<list.length;i++)if(list[i].id===slot.id){list[i]=slot;return slot;}list.push(slot);return slot;};
  ZB.html=function(list,zone,ctx){return sorted(list,zone).map(function(s){var h=ZB.safe(s.id,function(){return s.render?s.render(ctx||{}):'';});
    return h?'<div class="zbs zbs-'+s.id+'" data-zb="'+s.id+'"'+(s.fit?' data-fit="'+s.fit+'"':'')+'>'+h+'</div>':'';}).join('');};
  ZB.mount=function(root,list,ctx){if(!root)return;sorted(list).forEach(function(s){if(!s.mount)return;var el=root.querySelector('[data-zb="'+s.id+'"]');
    if(el)ZB.safe(s.id,function(){s.mount(el,ctx||{});});});};
  // хуки уровня
  ZB.start=function(info){ZB._st=info;ZB.startHook.forEach(function(f){ZB.safe('startHook',function(){f(info);});});ZB.emit('start',info);};
  ZB.level=function(info){ZB.levelHook.forEach(function(f){ZB.safe('levelHook',function(){f(info);});});ZB.emit('level',info);};
  // сохранение
  function keyTest(o){var keys=o.keys||[],pre=o.prefix?[].concat(o.prefix):[];
    return function(k){if(keys.indexOf(k)>=0)return true;for(var i=0;i<pre.length;i++)if(k.indexOf(pre[i])===0)return true;return !!(o.test&&o.test(k));};}
  ZB.owns=function(k){for(var i=0;i<ZB.saves.length;i++)if(ZB.saves[i].own(k))return true;return false;};
  ZB.onSave=function(o){o.own=keyTest(o);for(var i=0;i<ZB.saves.length;i++)if(ZB.saves[i].id===o.id){ZB.saves.splice(i,1);break;}ZB.saves.push(o);
    if(typeof S!=='undefined'){if(o.fix)ZB.safe('fix:'+o.id,function(){o.fix(S);});
      // облако уже слито до регистрации: своё поле, которого нет на устройстве, общий цикл не взял — сливаем сейчас
      if(ZB._d){var d=ZB._d;if(o.merge)ZB.safe('merge:'+o.id,function(){o.merge(S,d,ZB._newer);});
        else for(var k in d)if(o.own(k)&&!(k in S))S[k]=d[k];
        if(o.fix)ZB.safe('fix:'+o.id,function(){o.fix(S);});}}
    return o;};
  // вызывает core.js mergeSave (после общих правил) и migrate()
  ZB._merge=function(d,newer){ZB._d=d;ZB._newer=!!newer;ZB.saves.forEach(function(o){
    if(o.merge)ZB.safe('merge:'+o.id,function(){o.merge(S,d,newer);});
    else for(var k in d)if(o.own(k)&&!(k in S))S[k]=d[k];});};
  ZB._fix=function(){if(typeof S==='undefined')return;ZB.saves.forEach(function(o){if(o.fix)ZB.safe('fix:'+o.id,function(){o.fix(S);});});};
  // экраны
  ZB.screen=function(name,o){ZB._scr[name]=o||{};return o;};
  ZB.go=function(name,opts){var o=ZB._scr[name];if(!o){err('go',name);return;}var id='zb-'+name,el=document.getElementById(id);
    if(!el){el=document.createElement('section');el.className='screen zb-scr';el.id=id;var app=document.getElementById('app')||document.body;app.appendChild(el);}
    if(o.render)ZB.safe('screen:'+name,function(){o.render(el,opts||{});});
    if(typeof show==='function')show(id);ZB.cur=name;};
  // ленивая подгрузка (мини-игры, рисунки мест): data-lazy — предохранитель index.html её не перезагружает
  var loaded={};
  ZB.load=function(src){if(loaded[src])return loaded[src];
    function one(u){return new Promise(function(ok,no){var s=document.createElement('script');s.src=u;s.async=true;s.setAttribute('data-lazy','1');
      s.onload=function(){ok();};s.onerror=function(){s.remove();no(new Error('load '+u));};document.head.appendChild(s);});}
    var p=one(src).catch(function(){return new Promise(function(r){setTimeout(r,1200);}).then(function(){return one(src+(src.indexOf('?')<0?'?':'&')+'r=2');});});
    loaded[src]=p.catch(function(e){delete loaded[src];err('load',src);throw e;});return loaded[src];};
  // ---- VIEW: главы и места (данные; рисует zb-view.js) ----
  // рисунки мест ART: номер 1…25 → id (ZBCH.place может дать номер или id)
  ZB.PLACES=['podyezd','lavochka','rynok','poliklinika','dacha','elektrichka','banya','sberkassa','yubiley','sanatoriy','vypusk','pochta','zhek',
    'rybalka','griby','svadba','kruiz','moskva','novyj-god','akademiya','hor-dk','mfc','poezd-yug','vnuk-smartfon','solenya'];
  function zbch(){var Z=window.ZBCH;if(!Z)return null;var L=Z.list||Z.ch||Z.all||(typeof Z.length==='number'?Z:null);return L&&L.length?L:null;}
  function chLen(){return typeof CH_LEN!=='undefined'?CH_LEN:20;}
  ZB.chapCount=function(){var Z=window.ZBCH;if(Z&&Z.count)return Math.max(1,ZB.safe('ZBCH.count',function(){return Z.count();})||1);
    var n=typeof LEVELS!=='undefined'?Math.ceil(LEVELS.length/chLen()):25;return Math.max(1,n);};
  ZB.chapAt=function(idx){var L=zbch();if(L)for(var i=0;i<L.length;i++){var z=L[i];if(z&&z.from>=1&&z.to>=z.from&&idx+1>=z.from&&idx+1<=z.to)return i;}
    return Math.floor(Math.max(0,idx)/chLen());};
  function plNum(p){if(typeof p==='number')return p>=1&&p<=99?Math.floor(p):0;if(typeof p==='string'){if(/^\d+$/.test(p))return +p;var i=ZB.PLACES.indexOf(p);return i>=0?i+1:0;}return 0;}
  ZB.chap=function(c){c=Math.max(0,c|0);var L=zbch(),z=L&&L[c]||null,CH=typeof CHAPTERS!=='undefined'?CHAPTERS:[],base=c<CH.length?CH[c]:null;
    var pl=z&&z.pn?plNum(z.pn):z&&z.place!=null?plNum(z.place):(c<25?c+1:0),pb=!base&&pl&&CH[pl-1]?CH[pl-1]:null,len=chLen();
    var from=z&&z.from>=1?z.from-1:c*len,to=z&&z.to>=1?z.to-1:from+len-1;
    var o={c:c,n:c+1,name:(z&&(z.name||(typeof z.n==='string'?z.n:'')))||(base&&base.n)||(pb&&pb.n)||('Глава '+(c+1)),
      e:(z&&z.e)||(base&&base.e)||(pb&&pb.e)||'📍',color:(z&&(z.c||z.color))||(base&&base.c)||(pb&&pb.c)||'#e8eef7',
      s:(z&&(z.s||z.say))||(base&&base.s)||'',from:from,to:to,place:pl,v:z&&z.v||'',cls:z&&z.cls||0,hard:!!(z&&z.hard),boss:z&&z.boss||0,z:z};
    return o;};
  ZB.placeFile=function(n){return 'content/art/place-'+(n<10?'0':'')+n+'.js';};
  ZB.place=function(c,ratio){var n=ZB.chap(c).place;if(!n)return Promise.resolve('');
    var art=function(){var A=window.ZB_ART&&window.ZB_ART[n];return A&&A.svg?ZB.safe('art'+n,function(){return A.svg(ratio);})||'':'';};
    if(window.ZB_ART&&window.ZB_ART[n])return Promise.resolve(art());
    return ZB.load(ZB.placeFile(n)).then(art,function(){return '';});};
  // фон места в элемент: сразу цвет главы, потом рисунок (если элемент всё ещё ждёт эту главу)
  ZB.placeInto=function(el,c,ratio){if(!el)return Promise.resolve(false);var ch=ZB.chap(c),key=c+':'+(ratio||'');el.style.backgroundColor=ch.color;
    // вариант места (ZBCH.v: eve — вечер, win — зима, rain — дождь) — накладка стилем (css/zb-view.css .zbpv-…)
    ['eve','win','rain'].forEach(function(v){el.classList.toggle('zbpv-'+v,ch.v===v);});
    if(el.getAttribute('data-pl')===key&&el.firstChild)return Promise.resolve(true);el.setAttribute('data-pl',key);el.innerHTML='';
    return ZB.place(c,ratio).then(function(h){if(el.getAttribute('data-pl')!==key)return false;el.innerHTML=h;return !!h;});};
  ZB.say=function(key,ctx,list){var t='';if(window.ZBT&&ZBT.say)t=ZB.safe('ZBT.say',function(){return ZBT.say(key,ctx||{});})||'';
    if(!t&&list&&list.length)t=list[Math.floor(Math.random()*list.length)];return t;};
  // перерисовать гнёзда главного (модули загрузились позже первого openMenu)
  ZB.refresh=function(){ZB.emit('refresh');ZB.safe('home',function(){ZB.homeRender();});};
  // вид главного по умолчанию (каркас): 'top' → #zbHomeTop, остальные зоны → #zbHome, панель → #zbNav. VIEW заменяет ZB.homeRender своим.
  function $(id){return document.getElementById(id);}
  ZB.homeRender=function(){var t=$('zbHomeTop'),h=$('zbHome'),n=$('zbNav'),ctx={};
    if(t){t.innerHTML=ZB.html(ZB.homeSlots,'top',ctx);ZB.mount(t,ZB.homeSlots,ctx);}
    if(h){h.innerHTML=ZB.html(ZB.homeSlots.filter(function(s){return (s.zone||'')!=='top';}),'',ctx);ZB.mount(h,ZB.homeSlots,ctx);}
    if(n){var L=sorted(ZB.navSlots);n.style.display=L.length?'':'none';
      n.innerHTML=L.map(function(s){var dot=ZB.safe(s.id,function(){return s.dot&&s.dot();});
        return '<button type="button" class="zbnav" data-zb="'+s.id+'"><b>'+(s.ic||'')+'</b>'+(s.t||'')+(dot?'<i class="dot on"></i>':'')+'</button>';}).join('');
      L.forEach(function(s){var b=n.querySelector('[data-zb="'+s.id+'"]');if(b&&s.go)b.onclick=function(){if(typeof SND!=='undefined')SND.tap();ZB.safe(s.id,s.go);};});}};
  // гнёзда поверх уровня — при каждом начале уровня
  // VIEW: zone 'side' в новом виде — в боковую колонку #zbLvSide (ПК), остальные — в #zbLevel
  ZB.levelRender=function(info){var e=$('zbLevel');if(!e)return;var sd=ZB.vw?$('zbLvSide'):null,
    L=sd?ZB.levelSlots.filter(function(s){return (s.zone||'')!=='side';}):ZB.levelSlots;
    e.innerHTML=ZB.html(L,'',info);ZB.mount(e,L,info);
    if(sd){var R=ZB.levelSlots.filter(function(s){return (s.zone||'')==='side';});sd.innerHTML=ZB.html(R,'',info);ZB.mount(sd,R,info);}};
  ZB.on('start',function(info){ZB.levelRender(info);});
  // все <script defer> выполнены → модули зарегистрировались; onReady (ui.js) к этому моменту уже показал меню/уровень
  // js/zb-ready.js (после всех модулей, до словаря) зовёт ZB.ready(); DOMContentLoaded — запасной путь
  ZB.ready=function(){if(ZB.isReady)return;ZB.isReady=true;ZB.miss=(window.__zbmiss||[]).slice();
    if(!ZB.vw)document.documentElement.classList.remove('zbv'); /* VIEW: zb-view.js не загрузился — старый вид */
    ZB._fix();ZB.emit('ready');ZB.refresh();
    // уровень начат до загрузки модулей (новичок, ?lv=) — гнёзда уровня дорисовать
    var gm=$('game');if(ZB._st&&gm&&gm.classList.contains('on'))ZB.safe('levelRender',function(){ZB.levelRender(ZB._st);});
    if(ZB.miss.length&&window.STAT&&STAT.ev)ZB.safe('miss',function(){STAT.ev('zbmiss',{n:ZB.miss.length,f:String(ZB.miss[0]).split('/').pop().slice(0,40)});});};
  document.addEventListener('DOMContentLoaded',function(){ZB.ready();});
})();
