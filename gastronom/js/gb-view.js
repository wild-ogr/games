'use strict';
/* ================= gb-view — новый вид «Мой гастроном» (поток VIEW, 11.10.2026) =================
   Договор — шапка js/gb-core.js, раздел «ДОГОВОР ВИДА». Этот файл: включение вида, главный экран (зал Вали + колонка: разряд,
   «План на сегодня», «Работать», гнёзда), нижние вкладки, рамки экранов «Подсобка»/«Книга» (хозяева MG0/META заменяют своим
   GB.screen с тем же именем; без хозяина вкладки нет — модерация: никаких заглушек «скоро»).
   Рядом: gb-hall.js — холст зала, gb-path.js — «Путь», gb-win.js — «Касса», gb-keys.js — клавиатура, css/gb-view.css.
   Выключить: GB_OFF={view:1} / ?gboff=view — файл ничего не делает, игра в старом виде v13.
   Поля сохранения: S.vw* (пока нет). Старые WebView: без ?. ?? .at :has inset. */
(function(){
  if(!window.GB||!GB.viewOn)return;
  GB.vwLoaded=true;
  var VW=window.GBVW={};
  function $(id){return document.getElementById(id);}
  function tap(){if(typeof SND!=='undefined'&&SND.tap)SND.tap();}
  function Lx(ru,en){return typeof L==='function'?L(ru,en):ru;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  VW.esc=esc;VW.L=Lx;VW.$=$;
  // две колонки: ПК / планшет в альбомной (окно VK 920×800 — главное)
  VW.pc=function(){return innerWidth>=700&&innerWidth>innerHeight*0.98;};
  VW.mini=function(){return !VW.pc()&&innerHeight<=680;};
  function S_(){return typeof S!=='undefined'?S:null;}

  /* ---------- вкладки ---------- */
  var STUB={stub:1};
  function addDef(slot){for(var i=0;i<GB.navSlots.length;i++)if(GB.navSlots[i].id===slot.id)return;GB.navSlots.push(slot);}
  function stubScr(name){if(!GB._scr[name])GB._scr[name]=STUB;}
  stubScr('back');stubScr('book');
  addDef({id:'shop',order:10,ic:'🏪',t:Lx('Магазин','Store'),go:function(){if(typeof openMap==='function')openMap();}});
  addDef({id:'path',order:20,ic:'🚂',t:Lx('Путь','Route'),go:function(){GB.go('path');},on:function(){return !!GB._scr.path;}});
  addDef({id:'back',order:30,ic:'☕',t:Lx('Подсобка','Back room'),go:function(){GB.go('back');},on:function(){return GB._scr.back!==STUB;}});
  addDef({id:'album',order:40,ic:'⭐',t:Lx('Дефицит','Rare'),go:function(){if(typeof openAlbum==='function')openAlbum();}});
  addDef({id:'book',order:50,ic:'📖',t:Lx('Книга','Book'),go:function(){GB.go('book');},on:function(){return GB._scr.book!==STUB;}});
  // экран → вкладка
  var NAVOF={'scr-map':'shop','gb-path':'path','gb-back':'back','scr-album':'album','gb-book':'book','scr-shop':'shop'};
  var curNav='shop';
  GB.navOn=function(id){curNav=id;var n=$('gbNav');if(!n)return;var b=n.querySelectorAll('.gbnav');for(var i=0;i<b.length;i++)b[i].classList.toggle('on',b[i].getAttribute('data-gb')===id);};
  function navList(){return GB.navSlots.filter(function(s){return s&&(!s.on||GB.safe('on:'+s.id,s.on)!==false);})
    .sort(function(a,b){return (a.order||0)-(b.order||0);}).slice(0,5);}
  function navRender(){var n=$('gbNav');if(!n)return;var L0=navList();n.style.display='';
    n.innerHTML=L0.map(function(s){var dot=GB.safe(s.id,function(){return s.dot&&s.dot();});
      return '<button type="button" class="gbnav'+(s.id===curNav?' on':'')+'" data-gb="'+s.id+'"><b>'+(s.ic||'')+'</b><span>'+esc(s.t||'')+'</span>'+(dot?'<i class="dot on"></i>':'')+'</button>';}).join('');
    L0.forEach(function(s){var b=n.querySelector('[data-gb="'+s.id+'"]');if(b&&s.go)b.onclick=function(){tap();GB.navOn(s.id);GB.safe(s.id,s.go);};});}
  VW.navRender=navRender;
  // экраны вкладок «Путь», «Подсобка», «Книга», «Дефицит», обстановка — со своей шапкой и вкладками внизу
  GB.on('screen',function(id){if(!GB.viewOn)return;var k=NAVOF[id];if(k)GB.navOn(k);
    var n=$('gbNav');if(!n){n=document.createElement('nav');n.id='gbNav';n.className='gbnavs';var sm=$('scr-map');if(sm)sm.appendChild(n);navRender();} 
    var el=$(id); // (выше: чужой экран стёр вкладки своим innerHTML — восстанавливаем)
    if(id==='scr-map'){var h=built==='pc'?$('vwR'):$('gbHome');if(h&&n.parentNode!==h)h.appendChild(n);}
    else if(k&&el&&n.parentNode!==el){el.appendChild(n);navRender();}});

  /* ---------- сведения для кнопки «Работать» ---------- */
  function curIdx(){var s=S_();return s?Math.max(0,(s.unlocked||1)-1):0;}
  VW.workHtml=function(){var i=curIdx(),f=GB.lvInfo(i),sub;
    if(f.glavk)sub=Lx('«Главк» — большая ревизия!','Head office inspection!');
    else if(f.boss)sub=f.city+' · '+Lx('Ревизия!','Inspection!');
    else sub=f.city+' · '+Lx('до Ревизии '+f.toRev,f.toRev+' to Inspection');
    return '<b>'+Lx('Работать','Work')+' · '+f.l+'</b><small>'+esc(sub)+'</small>';};
  VW.work=function(){tap();if(typeof startLevel==='function')startLevel(curIdx());};

  /* ---------- «План» по умолчанию (пока нет META): прежние входы — задание дня, задания, коллекция ---------- */
  function mirror(id,cls){var b=$(id);if(!b||b.style.display==='none')return '';
    return '<button type="button" class="vw-row '+(cls||'')+(b.classList.contains('locked')?' locked':'')+(b.classList.contains('glow')?' glow':'')+'" data-mir="'+id+'">'+b.innerHTML+'</button>';}
  GB.add(GB.homeSlots,{id:'vwPlan0',order:99,zone:'plan',on:function(){return !GB.homeSlots.some(function(s){return s.zone==='plan'&&s.id!=='vwPlan0';});},
    render:function(c){var h=mirror('btnDaily','d')+mirror('btnQuest','q');if(!h)return '';
      return '<div class="vw-card vw-plan0"><div class="vw-h">📋 '+Lx('На сегодня','Today')+'</div>'+h+'</div>';},
    mount:function(el){bindMirror(el);}});
  // обстановка зала (старый магазин за монеты) и «Игры» — колонка справа / под планом
  GB.add(GB.homeSlots,{id:'vwDecor',order:60,zone:'side',render:function(){var s=S_();if(!s||typeof nextDecor!=='function')return '';var d=nextDecor();
      var t=d?(s.coins>=d.p?Lx('Хватает на «'+d.n+'»!','Enough for: '+d.n+'!'):Lx('До «'+d.n+'» — '+(d.p-s.coins)+' 💰',d.n+': '+(d.p-s.coins)+' 💰 to go')):Lx('Зал обставлен полностью!','The hall is fully furnished!');
      var pc=d?Math.min(100,Math.round(s.coins/d.p*100)):100;
      return '<button type="button" class="vw-card vw-decor'+(d&&s.coins>=d.p?' glow':'')+'" data-mir="btnShop"><div class="vw-h">🛋 '+Lx('Обстановка','Decor')+'</div><div class="vw-s">'+esc(t)+'</div><div class="vw-bar"><i style="width:'+pc+'%"></i></div></button>';},
    mount:function(el){bindMirror(el);}});
  GB.add(GB.homeSlots,{id:'vwMore',order:90,zone:'bottom',render:function(){return mirror('btnMore','more');},mount:function(el){bindMirror(el);}});
  function bindMirror(el){var b=el.querySelectorAll('[data-mir]');for(var i=0;i<b.length;i++)(function(x){x.onclick=function(){var o=$(x.getAttribute('data-mir'));if(o)o.click();};})(b[i]);}

  /* ---------- главный экран ---------- */
  // разметка: телефон — всё одной колонкой (разряд, зал, план, «Работать»…); ПК — зал слева, колонка справа. Элементы те же — переезжают
  var built=null;
  function build(pc){var h=$('gbHome'),n=$('gbNav');if(!h)return;
    if(!$('vwHallBox')){if(n&&n.parentNode===h)h.parentNode.appendChild(n);h.className='vw-home';
      h.innerHTML='<div class="vw-z" id="vwZrank"></div>'+
        '<div class="vw-hallbox" id="vwHallBox"><canvas id="vwHallCv"></canvas><div class="vw-say" id="vwSay"></div></div>'+
        '<div class="vw-z" id="vwZhall"></div><div class="vw-z" id="vwZplan"></div>'+
        '<button type="button" class="btn green big vw-work" id="vwWork"></button>'+
        '<div class="vw-z" id="vwZside"></div><div class="vw-z" id="vwZbottom"></div>';
      $('vwWork').onclick=VW.work;}
    var ids=['vwZrank','vwHallBox','vwZhall','vwZplan','vwWork','vwZside','vwZbottom'];
    if(pc){var l=$('vwL'),r=$('vwR'),rs=$('vwRs');
      if(!l){l=document.createElement('div');l.className='vw-l';l.id='vwL';r=document.createElement('div');r.className='vw-r';r.id='vwR';
        rs=document.createElement('div');rs.className='vw-rs';rs.id='vwRs';r.appendChild(rs);}
      h.appendChild(l);h.appendChild(r);l.appendChild($('vwHallBox'));l.appendChild($('vwZhall'));
      ['vwZrank','vwZplan','vwWork','vwZside','vwZbottom'].forEach(function(id){rs.appendChild($(id));});if(n)r.appendChild(n);}
    else{ids.forEach(function(id){h.appendChild($(id));});var l2=$('vwL'),r2=$('vwR');if(l2)h.removeChild(l2);if(r2)h.removeChild(r2);if(n)h.appendChild(n);}
    built=pc?'pc':'ph';}
  function zone(id,z,ctx){var e=$(id);if(!e)return;e.innerHTML=GB.html(GB.homeSlots,z,ctx);GB.mount(e,GB.homeSlots.filter(function(s){return s.zone===z;}),ctx);e.style.display=e.innerHTML?'':'none';}
  var coreHome=GB.homeRender;
  GB.homeRender=function(){if(!GB.viewOn)return coreHome();var pc=VW.pc();if(built!==(pc?'pc':'ph'))build(pc);var ctx={pc:pc,mini:VW.mini(),w:pc?330:innerWidth};
    var t=$('gbHomeTop');if(t){t.innerHTML=GB.html(GB.homeSlots,'top',ctx);GB.mount(t,GB.homeSlots.filter(function(s){return s.zone==='top';}),ctx);}
    document.documentElement.classList.toggle('gbv-pc',pc);document.documentElement.classList.toggle('gbv-mini',ctx.mini);
    ['rank','hall','plan','side','bottom'].forEach(function(z){zone('vwZ'+z,z,ctx);});
    var w=$('vwWork');if(w)w.innerHTML=VW.workHtml();
    GB.navOn('shop');navRender();
    if(window.GBHALL)GB.safe('hall',function(){GBHALL.show();});};
  var rt=0;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){var sm=$('scr-map');if(GB.isReady&&sm&&sm.classList.contains('on'))GB.refresh();},120);});

  /* ---------- шапка уровня: город по республике (GBU), «Обслужено» смайликами ---------- */
  if(typeof updHud==='function'){var uh=updHud;window.updHud=function(){var r=uh.apply(this,arguments);GB.safe('vw:hud',function(){
    if(!GB.viewOn||typeof G==='undefined'||!G)return;var f=GB.lvInfo(G.idx),w=innerWidth||400,nar=w<=400,K0=G.lv&&G.lv.K||0,sv=G.served||0,an=G.angry||0;
    var n0=typeof NUMS==='function'?NUMS():'№';
    var lv=$('gLevel');if(lv&&!G.daily)lv.textContent=G.boss?(f.glavk?Lx('🔥 «Главк»','🔥 Head office'):Lx('🔥 Ревизия','🔥 Inspection'))+(w<=340?'':' · '+f.city): /* BK-GS: было «🔥 Ревизия ·» с висящей точкой, город — в строке смайликов (обрезалась на ≤400) */(w<=340?f.n+' · '+f.city:f.city+' · '+(nar?'':n0)+f.n); /* BK-GS: на ≤340 номер был спрятан — теперь «8 · Город», обрезается город */
    var c=$('gCity');if(!c)return;var sm='';
    if(K0&&K0<=10){for(var i=0;i<K0;i++)sm+='<i class="'+(i<sv?'y':i<sv+an?'n':'')+'">'+(i>=sv&&i<sv+an?'😟':'🙂')+'</i>';c.innerHTML='<span class="vw-sv">'+sm+'</span>';}
    else c.innerHTML='<span class="vw-sv"><i class="y">🙂</i> '+sv+Lx(' из ',' of ')+K0+(an?' · 😟 '+an:'')+'</span>';});return r;};}

  /* ---------- рамки «Подсобка» и «Книга» (наполняют MG0 и META своим GB.screen) ---------- */
  VW.frame=function(el,title,sub,body){var nv=$('gbNav');if(nv&&el.contains(nv))el.parentNode.appendChild(nv);el.innerHTML='<header class="gh"><button class="icon vw-back" aria-label="'+Lx('Назад','Back')+'">←</button><div class="gt"><div>'+title+'</div>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div></header><div class="vw-scroll">'+(body||'')+'</div>';
    var b=el.querySelector('.vw-back');if(b)b.onclick=function(){tap();GB.homeGo();};if(nv&&nv.parentNode!==el&&el.classList.contains('on'))el.appendChild(nv);return el.querySelector('.vw-scroll');};

  GB.on('ready',function(){
    // css не загрузился — старый вид (иначе зал без разметки)
    var ok=GB.safe('css',function(){return getComputedStyle(document.documentElement).getPropertyValue('--vw').trim()==='1';});
    if(!ok){GB.viewOn=false;document.documentElement.classList.remove('gbv');GB.homeRender=coreHome;return;}
    // новичок (меньше 3 побед): при запуске — сразу в уровень, зал откроется с 3–4-го (NEWBIE может решить иначе своим кодом)
    var s=S_();if(s&&!window.__demo&&(s.levelsDone||0)<3&&(s.unlocked||1)<=3&&(typeof G==='undefined'||!G)&&typeof startLevel==='function'){var sm=$('scr-map');if(sm&&sm.classList.contains('on'))GB.safe('vw:newbie',function(){startLevel(Math.max(0,s.unlocked-1));});}
  });
})();
