'use strict';
/* ================= gb-core — каркас буста «Гастроном №1: Образцовый» (10.10.2026, ветка gb-core) =================
   Договор для всех потоков (hobby-analytics/release-i/gastronom-boost/logs/COMMON.md). Файл грузится ДО основного скрипта
   index.html (обычным <script>, без defer) и ни от чего в игре не зависит при загрузке. Хозяин договора — VIEW
   (правки — через журнал VIEW «Просьбы от других»; добавлять можно, ломать нельзя).

   ГНЁЗДА (массивы; модуль кладёт объект через GB.add(список, гнездо); тот же id — замена, а не второй):
   GB.homeSlots  {id, order, zone, render(ctx)→html, mount(el,ctx)}   главный экран (сейчас — карта #scr-map, VIEW сделает зал Вали).
                 zone: 'top' — полоса под шапкой (праздник, подарок вернувшемуся) → #gbHomeTop; 'rank' — разряд/вывеска;
                 'plan' — «План на сегодня»; 'hall' — над/под залом (ремонт отдела, стеклотара); 'side' — правая колонка ПК; 'bottom'.
   GB.navSlots   {id, order, ic, t, go(), dot()→bool, on()→bool}       нижние вкладки: shop «Магазин», path «Путь», back «Подсобка»,
                 album «Дефицит», book «Книга» (id закреплены; order 10…50). on() — показывать ли (нет → вкладки нет).
   GB.winSlots   {id, order, zone, fit, render(ctx)→html, mount(el,ctx)} окно победы «Касса». zone (в этом порядке):
                 'check' (чек: что продано, ИТОГО), 'seal' (печать «План выполнен», разряд, знамя), 'goal' (шаг ремонта отдела,
                 «до Ревизии N»), 'mg' (табличка «Перерыв» — ОДНО предложение, см. ctx.busy), 'tmr' («Завтра: …»), 'extra'.
                 fit — порядок скрытия, если окно не влезло (1 — первым). Главные кнопки окна — только VIEW;
                 в гнезде не больше одной кнопки `btn small`. ctx = {g (G), idx, l, st, daily, boss, first, card, busy}
   GB.loseSlots  то же для окна поражения (zone 'help' — тихая помощь/совет, 'extra'); ctx = {g, idx, l, daily, boss, rev}
   GB.levelSlots {id, order, zone:'top'|'side'|'board', render(ctx)→html, mount(el,ctx)} — поверх уровня (#gbLevel — слой над
                 залом и витриной, не сдвигает раскладку: .gbl-top — полоса сверху по центру, .gbl-side — у зала, .gbl-board — над витриной)
   GB.pathSlots  {id, order, zone:'top'|'node'|'bottom', render(ctx)→html} — экран «Путь» (рисует VIEW; режимы на станциях — MODE)
   GB.todayTasks {id, order, t, ic, done()→bool, go(), hint()→str}   дела «Плана на сегодня» — рисует META (5 дел → печать)
   ХУКИ:
   GB.startHook.push(fn(info))  начало уровня: {l (1-based), idx, daily, mode, boss, key}
   GB.levelHook.push(fn(info))  исход попытки: {l, idx, r:'win'|'lose'|'quit', daily, mode, boss, first (первая победа уровня),
                                st (звёзды, только win), s (сек), served, angry, K, moves, sk, mx, tb, rev (после «Ещё попытки»), key}
                                Ровно раз на исход: lose → (если «Ещё попытка») → снова win/lose/quit с rev:1.
   GB.on(ev, fn) / GB.emit(ev, data)  события: 'ready' (все модули загружены), 'screen' (id экрана), 'home' (показан главный),
                                'start', 'level', 'win' (окно победы нарисовано, ctx), 'lose', 'save', 'refresh'
   СОХРАНЕНИЕ (только свои поля, БЕЗ правок fixSave/mergeSave):
   GB.onSave({id, keys:['gmR'] | prefix:'gm' | ['gm','gt'], test:k=>bool, fix:S=>void, merge:(S,d,newer)=>void})
     fix — при загрузке, при регистрации и после слияния (умолчания, починка формы). merge — облако d слить в S (на месте).
     Общий цикл mergeSave такие поля НЕ трогает (даже если их нет в S) — сливает только ваш merge. Регистрация позже облака —
     merge вызовется сразу с последним облаком. Без merge поле берётся из облака, только если его нет на устройстве.
     Старые ключи (unlocked, stars, coins, decor, album, daily, streak, chest, qTal, quest, buy…) — только читать/переносить.
   ЭКРАНЫ: GB.screen(name, {render(el,opts)}) — новый экран (section.screen#gb-<name>), GB.go(name, opts) — показать.
   ПОДГРУЗКА: GB.load('js/gmg-vesy.js') → Promise (повтор 1 раз; не загрузилось — reject, игра живёт). Тяжёлое (мини-игры,
     рисунки отделов, праздничные наборы, уровни 1501+) — только так, по требованию. Обязательные модули — строкой
     <script src="js/…" defer data-gb></script> под своей меткой <!-- gb:ПОТОК --> в конце index.html.
   ПОМОЩНИКИ: GB.html(list, zone, ctx) → html гнёзд зоны (каждое в <div class="gbs" data-gb="id">), GB.mount(root, list, ctx),
     GB.refresh() — перерисовать гнёзда главного, GB.safe(id, fn) — вызвать без падения игры (ошибка → консоль + STAT gberr),
     GB.flag(name, def) — выключатель новинки: window.GB_OFF={name:1} или ?gboff=name1,name2 (на маке) → false.
   Старые WebView (Chrome 70–92 в статистике): без `?.`/`??`/`??=`, `.at`, `:has`, `structuredClone`, `inset:`.

   ================= ДОГОВОР ВИДА (VIEW, 11.10) — новый вид «Мой гастроном» (js/gb-view.js, gb-hall.js, gb-path.js, gb-win.js, gb-keys.js,
   css/gb-view.css). Выключатель: GB.viewOn (= GB.flag('view'); GB_OFF={view:1} или ?gboff=view) → старый вид v13 целиком.
   Вид включён → <html class="gbv">. Модуль вида не загрузился → класс снимается в GB.ready, игра в старом виде.
   ГЛАВНЫЙ = зал Вали (экран #scr-map остаётся «главным»: openMap() = домой). Разметка (рисует VIEW в #vwHome):
     ПК (ширина ≥ 700, альбомная): слева зал (холст ~560 px) + zone 'hall' под ним; справа колонка: zone 'rank' → zone 'plan' →
       кнопка «Работать» (#vwWork) → zone 'side' (ремонт, Подсобка, Торг, знамя…) → zone 'bottom'.
     Телефон: zone 'rank' → зал → zone 'hall' → zone 'plan' → «Работать» → zone 'side' → zone 'bottom'; низ — вкладки #gbNav.
     На низком телефоне (высота ≤ 680) гнездо plan получает ctx.mini=true — рисуйте одну строку («План 3/5»), по нажатию — полный.
     ctx главного: {pc (две колонки), mini, w (ширина колонки гнезда)}. zone 'top' (#gbHomeTop) — полоса над всем (праздник, подарок).
   ВКЛАДКИ (#gbNav, внизу; на ПК — под правой колонкой): shop «Магазин» (домой/обстановка), path «Путь», back «Подсобка»,
     album «Дефицит», book «Книга». Свои вкладки VIEW кладёт по умолчанию (back/book — рамки-заглушки GB.screen('back'|'book'),
     хозяева MG0/META заменяют их своим GB.screen с тем же именем и/или своим navSlots с тем же id). GB.navOn(id) — подсветить.
   ЗАЛ (холст главного, gb-hall.js): GB.hallLayers {id, order, layer:'wall'|'dep'|'counter'|'front', draw(g, R, t)} — нарисовать
     своё в зал. R — геометрия: {w,h, wallTop, ty (пол/плитка), cy (верх прилавка), base (линия ног), signY, signH,
     deps:[{id,x,y,w,h,lv}] (места отделов на стене), cat:{x,y,s} (место на прилавке), door:{x,y,w,h} (дверь «Подсобка»),
     valya:{x,y,s}, col (цвет республики), anim (true — перерисовка каждый кадр, false — статичный кадр)}.
     Отделы: VIEW берёт GBM.depList() → [{id, n, lv 0..3, p, need}] и рисует GBART.dep(id, lv, {g,x,y,w,h,t}); нет их — плашки.
     GB.hallRedraw() — перерисовать статичную часть (купили отдел/вещь). Клик по отделу/двери — GB.on('hall', {id}).
   GB.homeGo() — на главный (кнопки «← В магазин» экранов других потоков).
   УРОВЕНЬ: GB.lvInfo(idx) (idx с 0) → {l, city, rep (кратко «Украина»), repN, n (1..10 в городе), toRev (сколько до Ревизии, 0 — это
     она), boss, glavk, sp (Сверхплан), col, c2, next (город после Ревизии), nextRep (новая республика)} — из GBU (LVL), без него — CITIES.
   «КАССА» (окно победы, gb-win.js): win() в index.html всё считает как раньше и отдаёт окно GB.kassa(p); зоны winSlots — те же.
     Главная кнопка «Дальше · N» (#mNext) всегда внизу на одном месте, «В магазин» (#mMap) — ссылкой. ctx.busy — как раньше.
   «ПУТЬ» (gb-path.js): GB.go('path') — железная дорога по республикам; pathSlots zone 'top' | 'node' (ctx {l, idx, rep, city,
     n, cur}) — значок/кнопка на станции (MODE) | 'bottom'.
   ОБЩИЕ СТИЛИ (css/gb-view.css, для META/LEAGUE/FEST): .vw-poster (плакатный шрифт заголовков), .vw-stamp (печать «План
     выполнен»: <div class="vw-stamp">ПЛАН<br>ВЫПОЛНЕН</div>, .on — с ударом), .vw-banner (знамя), .vw-neon (вечерний неон Ревизии),
     .vw-card (карточка на главном), .vw-bar>i (полоска), .vw-chip.
*/
(function(){
  var GB=window.GB={v:1,homeSlots:[],navSlots:[],winSlots:[],loseSlots:[],levelSlots:[],pathSlots:[],todayTasks:[],
    startHook:[],levelHook:[],saves:[],miss:[],isReady:false,_ev:{},_scr:{},_d:null,_newer:false};
  function err(id,e){try{console.error('[gb] '+id,e);if(window.STAT&&STAT.ev)STAT.ev('gberr',{m:String(id).slice(0,40),e:String(e&&e.message||e).slice(0,80)});}catch(x){}}
  GB.safe=function(id,fn){try{return fn();}catch(e){err(id,e);}};
  GB.on=function(ev,fn){(GB._ev[ev]=GB._ev[ev]||[]).push(fn);};
  GB.emit=function(ev,data){var L=GB._ev[ev]||[];for(var i=0;i<L.length;i++)(function(f){GB.safe('on:'+ev,function(){f(data);});})(L[i]);};
  // выключатели новинок (отсечка 19.10: недоделанное выключаем флагом, а не вырезаем)
  var OFF={};try{var m=/[?&]gboff=([^&]*)/.exec(location.search);if(m&&/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname))decodeURIComponent(m[1]).split(',').forEach(function(x){OFF[x]=1;});}catch(e){}
  GB.flag=function(name,def){var o=window.GB_OFF||{};if(o[name]||OFF[name])return false;return def===undefined?true:!!def;};
  function sorted(list,zone){return list.filter(function(s){return s&&(!zone||(s.zone||'')===zone)&&(!s.on||GB.safe(s.id,s.on)!==false);})
    .sort(function(a,b){return (a.order||0)-(b.order||0);});}
  GB.add=function(list,slot){for(var i=0;i<list.length;i++)if(list[i].id===slot.id){list[i]=slot;return slot;}list.push(slot);return slot;};
  GB.html=function(list,zone,ctx){return sorted(list,zone).map(function(s){var h=GB.safe(s.id,function(){return s.render?s.render(ctx||{}):'';});
    return h?'<div class="gbs gbs-'+s.id+'" data-gb="'+s.id+'"'+(s.fit?' data-fit="'+s.fit+'"':'')+'>'+h+'</div>':'';}).join('');};
  GB.mount=function(root,list,ctx){if(!root)return;sorted(list).forEach(function(s){if(!s.mount)return;var el=root.querySelector('[data-gb="'+s.id+'"]');
    if(el)GB.safe(s.id,function(){s.mount(el,ctx||{});});});};
  function $(id){return document.getElementById(id);}
  function G_(){return typeof G!=='undefined'?G:null;}
  function S_(){return typeof S!=='undefined'?S:null;}

  /* ---- уровень: index.html зовёт GB._lvStart() в startLevel и GB._lvEnd(r) в win/lose/openMap/startLevel ---- */
  GB._lvStart=function(){var g=G_();if(!g)return;g.gbE=0;g.gbT0=Date.now();
    var info={l:g.idx+1,idx:g.idx,daily:!!g.daily,mode:g.mode||(g.daily?'daily':''),boss:!!g.boss,key:(g.daily?'d':'l')+(g.idx+1)};
    GB.startHook.forEach(function(f){GB.safe('startHook',function(){f(info);});});GB.emit('start',info);
    var e=$('gbLevel');if(e){var h='';['top','side','board'].forEach(function(z){var x=GB.html(GB.levelSlots,z,info);if(x)h+='<div class="gbl gbl-'+z+'">'+x+'</div>';});
      var x0=GB.html(GB.levelSlots.filter(function(s){return !s.zone;}),'',info);if(x0)h+='<div class="gbl gbl-top">'+x0+'</div>';e.innerHTML=h;GB.mount(e,GB.levelSlots,info);}};
  GB._lvEnd=function(r,x){var g=G_(),s=S_();if(!g||g.gbE)return;g.gbE=r;
    var info={l:g.idx+1,idx:g.idx,r:r,daily:!!g.daily,mode:g.mode||(g.daily?'daily':''),boss:!!g.boss,
      first:r==='win'&&!g.daily&&!(s&&s.stars&&s.stars[g.idx]>0),
      s:Math.round((Date.now()-(g.gbT0||Date.now()))/1000),served:g.served||0,angry:g.angry||0,K:g.lv&&g.lv.K||0,moves:g.moves||0,
      sk:g.nStuck||0,mx:g.nMix||0,tb:g.nTable||0,rev:g.gbRev?1:0,key:(g.daily?'d':'l')+(g.idx+1)};
    if(x)for(var k in x)info[k]=x[k];
    g.gbInfo=info;
    GB.levelHook.forEach(function(f){GB.safe('levelHook',function(){f(info);});});GB.emit('level',info);};
  // «Ещё попытка» после поражения — та же попытка продолжается: следующий исход придёт ещё раз с rev:1
  GB._lvRevive=function(){var g=G_();if(g){g.gbE=0;g.gbRev=1;}};

  /* ---- окна победы и поражения: index.html вставляет GB.winHtml(ctx) в окно и зовёт GB.winMount(ctx) после modal() ---- */
  var WZ=['check','seal','goal','mg','tmr','extra'];
  GB.winCtx=function(o){var g=G_()||{};o=o||{};o.g=g;o.idx=g.idx;o.l=(g.idx||0)+1;o.daily=!!g.daily;o.boss=!!g.boss;
    if(o.busy===undefined)o.busy=false;return o;};
  GB.winHtml=function(ctx){var h='';WZ.forEach(function(z){var x=GB.html(GB.winSlots,z,ctx);if(x)h+='<div class="gbw gbw-'+z+'">'+x+'</div>';});
    return h?'<div id="gbWin">'+h+'</div>':'';};
  GB.winMount=function(ctx){var e=$('gbWin');if(e)GB.mount(e,GB.winSlots,ctx);GB.emit('win',ctx);};
  GB.loseHtml=function(ctx){var h=GB.html(GB.loseSlots,'help',ctx)+GB.html(GB.loseSlots,'extra',ctx);return h?'<div id="gbLose">'+h+'</div>':'';};
  GB.loseMount=function(ctx){var e=$('gbLose');if(e)GB.mount(e,GB.loseSlots,ctx);GB.emit('lose',ctx);};

  /* ---- сохранение ---- */
  function keyTest(o){var keys=o.keys||[],pre=o.prefix?[].concat(o.prefix):[];
    return function(k){if(keys.indexOf(k)>=0)return true;for(var i=0;i<pre.length;i++)if(k.indexOf(pre[i])===0)return true;return !!(o.test&&o.test(k));};}
  GB.owns=function(k){for(var i=0;i<GB.saves.length;i++)if(GB.saves[i].own(k))return true;return false;};
  GB.onSave=function(o){o.own=keyTest(o);for(var i=0;i<GB.saves.length;i++)if(GB.saves[i].id===o.id){GB.saves.splice(i,1);break;}GB.saves.push(o);
    var s=S_();if(s){if(o.fix)GB.safe('fix:'+o.id,function(){o.fix(s);});
      if(GB._d){var d=GB._d;if(o.merge)GB.safe('merge:'+o.id,function(){o.merge(s,d,GB._newer);});
        else for(var k in d)if(o.own(k)&&!(k in s))s[k]=d[k];
        if(o.fix)GB.safe('fix:'+o.id,function(){o.fix(s);});}}
    return o;};
  // зовёт index.html: mergeSave (в конце, после общих правил) и fixSave
  GB._merge=function(d,newer){var s=S_();if(!s||!d)return;GB._d=d;GB._newer=!!newer;GB.saves.forEach(function(o){
    if(o.merge)GB.safe('merge:'+o.id,function(){o.merge(s,d,newer);});
    else for(var k in d)if(o.own(k)&&!(k in s))s[k]=d[k];});GB._fix();GB.emit('cloud',d);};
  GB._fix=function(){var s=S_();if(!s)return;GB.saves.forEach(function(o){if(o.fix)GB.safe('fix:'+o.id,function(){o.fix(s);});});};

  /* ---- экраны ---- */
  GB.screen=function(name,o){GB._scr[name]=o||{};return o;};
  GB.go=function(name,opts){var o=GB._scr[name];if(!o){err('go',name);return;}var id='gb-'+name,el=$(id);
    if(!el){el=document.createElement('section');el.className='screen gb-scr';el.id=id;var app=$('app')||document.body;app.appendChild(el);}
    if(o.render)GB.safe('screen:'+name,function(){o.render(el,opts||{});});
    if(typeof show==='function')show(id);GB.cur=name;};

  /* ---- ленивая подгрузка: data-lazy — не путать с обязательными модулями ---- */
  var loaded={};
  GB.load=function(src){if(loaded[src])return loaded[src];
    function one(u){return new Promise(function(ok,no){var s=document.createElement('script');s.src=u;s.async=true;s.setAttribute('data-lazy','1');
      s.onload=function(){ok();};s.onerror=function(){s.parentNode&&s.parentNode.removeChild(s);no(new Error('load '+u));};document.head.appendChild(s);});}
    var p=one(src).catch(function(){return new Promise(function(r){setTimeout(r,1200);}).then(function(){return one(src+(src.indexOf('?')<0?'?':'&')+'r=2');});});
    loaded[src]=p.catch(function(e){delete loaded[src];err('load',src);throw e;});return loaded[src];};
  // обязательный модуль не загрузился (обрыв сети, обрезанный архив) — игра живёт как раньше, список — в __gbmiss и STAT gbmiss
  window.__gbmiss=window.__gbmiss||[];
  addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='SCRIPT'&&t.hasAttribute&&t.hasAttribute('data-gb'))window.__gbmiss.push(t.src||'');},true);

  /* ---- главный: по умолчанию гнёзда рисуются в #gbHomeTop / #gbHome / #gbNav (карта). VIEW заменяет GB.homeRender своим ---- */
  GB.homeRender=function(){var t=$('gbHomeTop'),h=$('gbHome'),n=$('gbNav'),ctx={};
    if(t){t.innerHTML=GB.html(GB.homeSlots,'top',ctx);GB.mount(t,GB.homeSlots,ctx);}
    if(h){h.innerHTML=GB.html(GB.homeSlots.filter(function(s){return (s.zone||'')!=='top';}),'',ctx);GB.mount(h,GB.homeSlots,ctx);}
    if(n){var L=sorted(GB.navSlots);n.style.display=L.length?'':'none';
      n.innerHTML=L.map(function(s){var dot=GB.safe(s.id,function(){return s.dot&&s.dot();});
        return '<button type="button" class="gbnav" data-gb="'+s.id+'"><b>'+(s.ic||'')+'</b>'+(s.t||'')+(dot?'<i class="dot on"></i>':'')+'</button>';}).join('');
      L.forEach(function(s){var b=n.querySelector('[data-gb="'+s.id+'"]');if(b&&s.go)b.onclick=function(){if(typeof SND!=='undefined'&&SND.tap)SND.tap();GB.safe(s.id,s.go);};});}};
  GB.refresh=function(){GB.emit('refresh');GB.safe('home',function(){GB.homeRender();});};
  GB.home=function(){if(GB.isReady)GB.refresh();GB.emit('home');};

  /* ---- договор вида (VIEW): выключатель, слои зала, сведения об уровне. Наполняет gb-view.js; здесь — только то, что нужно до него ---- */
  GB.viewOn=GB.flag('view');GB.hallLayers=[];GB.vwLoaded=false;
  if(GB.viewOn)document.documentElement.classList.add('gbv');
  GB.hallRedraw=function(){};GB.navOn=function(){};
  GB.homeGo=function(){if(typeof openMap==='function')openMap();}; // «В магазин» — на главный (зал Вали; в старом виде — карта)
  // имена городов/республик в ?lang=en — транслитом, пока у GBU нет поля en (имена собственные: Kuybyshev, Sverdlovsk)
  var TR={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
  GB.tr=function(t){t=String(t||'');if(typeof LANG==='undefined'||LANG!=='en'||!/[А-Яа-яЁё]/.test(t))return t;
    return t.replace(/[А-Яа-яЁё]/g,function(c){var l=c.toLowerCase(),r=TR[l];if(r==null)return '';return c===l?r:r.charAt(0).toUpperCase()+r.slice(1);});};
  GB.lvInfo=function(idx){var o=lvInfo0(idx);o.city=GB.tr(o.city);o.rep=GB.tr(o.rep);o.next=GB.tr(o.next);o.nextRep=GB.tr(o.nextRep);return o;};
  function lvInfo0(idx){idx=Math.max(0,+idx||0);var l=idx+1,u=null,U=window.GBU;
    if(U&&U.of)u=GB.safe('GBU.of',function(){return U.of(idx);});
    if(u){var nx=GB.safe('GBU.of',function(){return U.of(Math.floor(idx/10)*10+10);})||{};
      return {l:l,city:u.name||'',rep:u.repName||u.repS||'',repN:u.rep,n:u.n,toRev:10-u.n,boss:!!u.isRev,glavk:!!u.isGlavk,sp:!!u.sp,col:u.color||'#b3261e',c2:u.c2||'',
        next:nx.name||'',nextRep:nx.rep!==u.rep?(nx.repName||nx.repS||''):''};}
    var C=typeof CITIES!=='undefined'?CITIES:[['','#b3261e']],c=C[Math.floor(idx/10)%C.length],nc=C[(Math.floor(idx/10)+1)%C.length];
    return {l:l,city:c[0],rep:'',n:idx%10+1,toRev:9-idx%10,boss:idx%10===9,glavk:false,sp:false,col:c[1],c2:'',next:nc[0],nextRep:''};}

  // все <script defer> выполнены → модули зарегистрировались; основной скрипт к этому моменту уже показал карту/уровень.
  // js/gb-ready.js (последним) зовёт GB.ready(); DOMContentLoaded — запасной путь
  GB.ready=function(){if(GB.isReady)return;GB.isReady=true;
    if(GB.viewOn&&!GB.vwLoaded){GB.viewOn=false;document.documentElement.classList.remove('gbv');} // модуль вида не загрузился — старый вид
    GB.miss=(window.__gbmiss||[]).slice();GB._fix();GB.emit('ready');
    var sm=$('scr-map');if(sm&&sm.classList.contains('on'))GB.refresh();
    if(GB.miss.length&&window.STAT&&STAT.ev)GB.safe('miss',function(){STAT.ev('gbmiss',{n:GB.miss.length,f:String(GB.miss[0]).split('/').pop().slice(0,40)});});};
  document.addEventListener('DOMContentLoaded',function(){GB.ready();});
})();
