'use strict';
/* ================= g3-home — главный экран «6 блоков» (Гастроном 3.0, волна 1, поток П4; план 4.4 / 4.5 / 4.3) =================
   Флаг: G3.on('home') (?off=g3.home — главный как в v14.9). Нужен новый вид (GB.viewOn). На <html> класс g3h — стили css/g3-home.css.
   БЛОКИ (телефон сверху вниз; ПК — слева зал + реплика + «Работать», справа «Утро» + событие + вкладки):
     1. Шапка: ⚙ · разряд (#g3Rank, тап — Путь) · монеты (#mCoins, как было). Логотип на телефоне спрятан (вывеска — в зале).
     2. Зал с Валей; реплика — ПОД залом (#g3Say, текст берём из #vwSay — его по-прежнему пишет gb-hall). Тап по отделу — «Отделы».
     3. «Работать · N» (#vwWork, id прежний) — сразу под залом.
     4. Карточка «Утро у Вали» — зона homeSlots 'utro' (#g3Utro). ДОГОВОР С П3: П3 кладёт GB.add(GB.homeSlots,{id:'g3-utro',
        zone:'utro', render(ctx)→html, mount(el,ctx)}) — ctx как у главного {pc, mini, w}. Пока чужого гнезда 'utro' нет — наше
        запасное 'g3-utro0': «План на сегодня» (mt-plan, коротко) + «Задание дня» (зеркало #btnDaily). Есть гнездо П3 — запасного нет.
     5. Событие — #gbHomeTop (праздник FEST, zone 'top') переезжает сюда; пусто — блока нет.
     6. Вкладки из 4: Магазин (на главном — «Отделы»/обстановка; с других экранов — домой) · Путь · Подсобка · Дефицит. «Книга» → ⚙.
   ПЕРЕЕЗД (план 4.5): разряд → шапка + Путь; Квартальный план (season) и Соцсоревнование (league) → Путь; Затеи (md) → Подсобка (и Путь,
     как было); Обстановка (vwDecor), стеклотара/газировка/ремонт (mt-dep) → экран «Отделы» (вкладка Магазин); Торг → «Монеты» (как было);
     «Ещё игры» (vwMore) → ⚙ → «Друзья и игры» (как было); Книга → ⚙ «Книга отзывов»; Подсобка-плитка (gmg-back) → вкладка.
     Гнёзда других потоков в зонах rank/plan/hall/side/bottom НЕ прячем (рисуются ниже события) — ничего не теряется.
   ОТКРЫТИЕ ПО ДНЯМ (новичок S.g3.nw=1; план 4.3): Подсобка — с 4-го дня захода, Путь и Дефицит — с 5-го; старым — всё сразу.
   STAT: mod g3.home {a:'on'} раз за сеанс; {a:'rank'|'shop'|'dep'} — нажатия новых входов. */
(function(){
  if(!window.G3||!window.GB||!GB.viewOn)return;
  var ON=G3.on('home');if(!ON)return;
  document.documentElement.classList.add('g3h');
  function $(id){return document.getElementById(id);}
  function Lx(ru,en){return typeof L==='function'?L(ru,en):ru;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function tap(){try{SND.tap();}catch(e){}}
  function slot(list,id){for(var i=0;i<list.length;i++)if(list[i]&&list[i].id===id)return list[i];return null;}
  function hasDep(){return !!(GB._scr.dep&&window.GBM&&GBM.on);}
  function openDep(id){if(!hasDep()){if(typeof openShop==='function')openShop();return;}GB.go('dep',{id:id});try{STAT.screen('dep');}catch(e){}}
  /* открытие по дням: [день новичка] — старым всегда */
  var DAY={back:4,path:5,album:5};
  function dayOk(k){var d=DAY[k];if(!d||!G3.isNew()||window.__demo)return true;var n=G3.day();
    try{var u=/[?&]g3day=(\d+)/.exec(location.search);if(u)n=+u[1];}catch(e){}return n>=d;}
  G3.homeDayOk=dayOk;

  /* ---------- гнёзда: прячем переехавшее (on → false), добавляем «Утро» (запасное) ---------- */
  var HIDE=['mt-rank','league','season','md','gmg-back','vwDecor','vwMore','torg','vwPlan0','mt-plan','mt-dep'];
  function hideSlots(){HIDE.forEach(function(id){var s=slot(GB.homeSlots,id);if(!s||s.g3h)return;var o=s.on;s.g3h=1;s.g3on=o;s.on=function(){return false;};});}
  function mirrorDaily(){var b=$('btnDaily');if(!b||b.style.display==='none')return '';
    return '<button type="button" class="vw-row g3-daily'+(b.classList.contains('locked')?' locked':'')+(b.classList.contains('glow')?' glow':'')+'" data-g3m="btnDaily">'+(G3.vt?G3.vt(b.innerHTML):b.innerHTML)+'</button>';}
  /* П3 (g3w1-p3): карточка «Утро у Вали» — самостоятельный блок G3U.card {render(ctx), mount(el,ctx)}; показывать, если G3U.cardOn().
     Её собственное гнездо 'g3-utro' (zone plan) снимаем: G3U.slot=false (до и после GB 'ready' — порядок файлов любой). */
  function utroP3(){var u=window.G3U;if(!u||!u.card||!u.card.render)return false;u.slot=false;try{return typeof u.cardOn!=='function'||!!u.cardOn();}catch(e){return false;}}
  if(window.G3U)G3U.slot=false;
  GB.add(GB.homeSlots,{id:'g3-utro0',order:99,zone:'utro',
    on:function(){return !GB.homeSlots.some(function(s){return s&&s.zone==='utro'&&s.id!=='g3-utro0'&&(!s.on||GB.safe(s.id,s.on)!==false);});},
    render:function(ctx){if(utroP3())return GB.safe('g3u:card',function(){return G3U.card.render(ctx);})||'';
      var p=slot(GB.homeSlots,'mt-plan'),h=p&&p.render?GB.safe('g3:plan',function(){return p.render(ctx);})||'':'';
      var d=mirrorDaily();if(!h&&!d)return '';
      return '<div class="vw-card g3-utro0">'+h+d+'</div>';},
    mount:function(el,ctx){if(utroP3()){GB.safe('g3u:mount',function(){G3U.card.mount(el,ctx);});return;}var p=slot(GB.homeSlots,'mt-plan');if(p&&p.mount)GB.safe('g3:planm',function(){p.mount(el,ctx);});
      var b=el.querySelectorAll('[data-g3m]');for(var i=0;i<b.length;i++)b[i].onclick=function(){var o=$(this.getAttribute('data-g3m'));if(o)o.click();};}});

  /* ---------- вкладки: 4, Книга → ⚙, открытие по дням ---------- */
  function navFix(){GB.navSlots.forEach(function(s){if(!s||s.g3h)return;s.g3h=1;var o=s.on;
    if(s.id==='book'){s.g3on=o;s.on=function(){return false;};return;}
    if(s.id==='shop'){var go=s.go;s.go=function(){var sm=$('scr-map');if(sm&&sm.classList.contains('on')){G3.mark('home','shop');openDep();}else if(go)go();};
      s.dot=function(){var d=slot(GB.homeSlots,'mt-dep');if(!d||!d.render)return false;return /mt-pill hot/.test(GB.safe('g3:shopdot',function(){return d.render({});})||'');};return;}
    if(DAY[s.id])s.on=function(){return dayOk(s.id)&&(!o||o()!==false);};});}
  /* ---------- шапка: разряд ---------- */
  function rankTxt(){if(window.GBM&&GBM.on&&GBM.info){var i=GB.safe('g3:rank',function(){return GBM.info();});if(i&&i.short)return i.short;}
    var st=$('totStars');return '⭐ '+(st?st.textContent:'');}
  function header(){var hr=document.querySelector('#scr-map .hdr-r');if(!hr)return;var b=$('g3Rank');
    if(!b){b=document.createElement('button');b.type='button';b.id='g3Rank';b.className='pill g3-rank';var c=$('mCoins');hr.insertBefore(b,c||null);
      b.onclick=function(){tap();G3.mark('home','rank');if(GB._scr.path&&dayOk('path'))GB.go('path');else if(GB._scr.path)GB.go('path');};}
    b.innerHTML='🏷 <span>'+esc(rankTxt())+'</span>';}

  /* ---------- реплика под залом ---------- */
  var sayObs=null;
  function say(){var src=$('vwSay'),dst=$('g3Say');if(!src||!dst)return;dst.textContent=src.textContent;dst.style.display=src.textContent?'':'none';}

  /* ---------- раскладка ---------- */
  function el(id,cls){var e=$(id);if(!e){e=document.createElement('div');e.id=id;e.className=cls;}return e;}
  function layout(){var h=$('gbHome');if(!h||!$('vwHallBox'))return;var pc=document.documentElement.classList.contains('gbv-pc');
    var sy=el('g3Say','g3-say'),ut=el('g3Utro','vw-z g3-utro'),ev=el('g3Ev','g3-ev'),top=$('gbHomeTop');
    if(top&&top.parentNode!==ev)ev.appendChild(top);
    var ctx={pc:pc,mini:!pc&&innerHeight<=680,w:pc?340:innerWidth};
    ut.innerHTML=GB.html(GB.homeSlots,'utro',ctx);GB.mount(ut,GB.homeSlots.filter(function(s){return s.zone==='utro';}),ctx);ut.style.display=ut.innerHTML?'':'none';
    ev.style.display=top&&top.innerHTML.replace(/<!--.*?-->/g,'').trim()?'':'none';
    var rest=['vwZrank','vwZhall','vwZplan','vwZside','vwZbottom'].map($).filter(Boolean),nav=$('gbNav');
    if(pc){var l=$('vwL'),rs=$('vwRs');if(!l||!rs)return;
      [$('vwHallBox'),sy,$('vwWork')].forEach(function(x){l.appendChild(x);});
      [ut,ev].concat(rest).forEach(function(x){rs.appendChild(x);});}
    else{[$('vwHallBox'),sy,$('vwWork'),ut,ev].concat(rest).forEach(function(x){h.appendChild(x);});if(nav&&nav.parentNode===h)h.appendChild(nav);}
    if(!sayObs&&$('vwSay')&&window.MutationObserver){sayObs=new MutationObserver(say);sayObs.observe($('vwSay'),{childList:true,characterData:true,subtree:true});}
    say();header();
    // меньше двух вкладок (новичок 1–3-го дня: только «Магазин») — панели нет
    if(nav){var n=nav.querySelectorAll('.gbnav').length;nav.classList.toggle('g3-nonav',n<2);document.documentElement.classList.toggle('g3-nonav',n<2);}}

  var hr0=GB.homeRender;
  GB.homeRender=function(){var r=hr0.apply(this,arguments);GB.safe('g3:home',layout);G3.mark('home');return r;};

  /* ---------- зал: тап по отделу → «Отделы» ---------- */
  GB.on('hall',function(o){if(!o||o.id==='valya')return;tap();G3.mark('home','dep');openDep(o.id);});

  /* ---------- «Отделы»: сверху — стеклотара/газировка/ремонт (mt-dep) и «Обстановка» (vwDecor) ---------- */
  function shopTop(scr){if(!scr||scr.querySelector('.g3-shopx'))return;var host=scr.querySelector('.mt-scr')||scr;
    var box=document.createElement('div');box.className='g3-shopx';var h='';
    ['mt-dep','vwDecor'].forEach(function(id){var s=slot(GB.homeSlots,id);if(!s||!s.render)return;var x=GB.safe('g3:shop:'+id,function(){return s.render({});});
      if(x)h+='<div class="gbs" data-gb="'+id+'">'+x+'</div>';});
    if(!h)return;box.innerHTML=h;var hd=host.querySelector('.mt-dh');if(hd&&hd.nextSibling)host.insertBefore(box,hd.nextSibling);else host.insertBefore(box,host.firstChild);
    // кнопка «Открыть/Отделы» внутри mt-dep здесь лишняя — мы уже в отделах
    var dp=box.querySelectorAll('[data-a="dep"]');for(var i=0;i<dp.length;i++)dp[i].parentNode.removeChild(dp[i]);
    ['mt-dep','vwDecor'].forEach(function(id){var s=slot(GB.homeSlots,id),e=box.querySelector('[data-gb="'+id+'"]');if(s&&s.mount&&e)GB.safe('g3:shopm:'+id,function(){s.mount(e,{});});});}
  /* ---------- «Путь»: разряд, Квартальный план, Соседи по району ---------- */
  function proxy(id,nid,zone,order){GB.add(GB.pathSlots,{id:nid,order:order,zone:zone,
    render:function(c){var s=slot(GB.homeSlots,id);if(!s||!s.render||(s.g3on&&GB.safe(id,s.g3on)===false))return '';return s.render(c||{});},
    mount:function(e,c){var s=slot(GB.homeSlots,id);if(s&&s.mount)s.mount(e,c||{});}});}
  proxy('mt-rank','g3p-rank','top',1);proxy('season','g3p-season','bottom',10);proxy('league','g3p-league','bottom',20);
  /* ---------- «Подсобка»: Затеи ---------- */
  function backTop(scr){if(!scr||scr.querySelector('.g3-zat'))return;var w=scr.querySelector('.gm0-wrap');if(!w)return;var s=slot(GB.homeSlots,'md');
    if(!s||!s.render||(s.g3on&&GB.safe('md',s.g3on)===false))return;var x=GB.safe('g3:zat',function(){return s.render({});});if(!x)return;
    var d=document.createElement('div');d.className='g3-zat';d.setAttribute('data-gb','md');d.innerHTML=x;w.insertBefore(d,w.children[1]||null);
    GB.safe('g3:zatm',function(){s.mount(d,{});});}
  // экраны перерисовываются своим кодом (и без события screen) — смотрим за ними
  var watched={};
  function watch(id,fn){var e=$(id);if(!e||watched[id]||!window.MutationObserver)return;watched[id]=1;var busy=0;
    new MutationObserver(function(){if(busy)return;busy=1;GB.safe('g3:w:'+id,function(){fn(e);});busy=0;}).observe(e,{childList:true,subtree:true});}
  GB.on('screen',function(id){setTimeout(function(){
    if(id==='gb-dep'){watch('gb-dep',shopTop);shopTop($('gb-dep'));}
    else if(id==='gb-path'){var e=$('gb-path');watch('gb-path',function(x){GB.mount(x,GB.pathSlots,{});});if(e)GB.mount(e,GB.pathSlots,{});}
    else if(id==='gb-back'){watch('gb-back',backTop);backTop($('gb-back'));}},0);});

  /* ---------- ⚙: «Книга отзывов» ---------- */
  if(typeof openSettings==='function'){var os=openSettings;window.openSettings=function(){var r=os.apply(this,arguments);GB.safe('g3:set',function(){
    var bk=slot(GB.navSlots,'book');if(!bk||!bk.go||(bk.g3on&&bk.g3on()===false)||(typeof G!=='undefined'&&G&&!G.over))return;
    var row=document.querySelector('#mcard .row');if(!row||$('g3Book'))return;var b=document.createElement('button');b.className='set';b.id='g3Book';
    b.innerHTML='<span>📖 '+esc(Lx('Книга отзывов','Guest book'))+'<br><small>'+esc(Lx('письма покупателей, написать тёте Вале','letters, write to Aunt Valya'))+'</small></span><i>'+(bk.dot&&GB.safe('bk',bk.dot)?'●':'›')+'</i>';
    row.parentNode.insertBefore(b,row);b.onclick=function(){tap();if(typeof hideModal==='function')hideModal();GB.safe('book',bk.go);};});return r;};}

  GB.on('ready',function(){if(window.G3U)G3U.slot=false;hideSlots();navFix();GB.safe('g3:nav',function(){if(GBVW&&GBVW.navRender)GBVW.navRender();});
    var sm=$('scr-map');if(sm&&sm.classList.contains('on'))GB.refresh();});
})();
