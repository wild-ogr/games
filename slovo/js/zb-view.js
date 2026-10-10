'use strict';
/* ================= zb-view — новый вид «Школа бабы Зины» (поток VIEW, 10.10.2026) =================
   Договор — шапка js/zb-core.js, раздел «ДОГОВОР ВИДА». Этот файл: включение вида (html.zbv), нижняя панель (Дом · Путь · Школа ·
   Словарь · Перемена), рамки экранов «Школа» и «Перемена» (заглушки — хозяева CAB и MG0 заменяют своим ZB.screen),
   фон места главы в уровне, живой кот Ять в уровне, «бульк» бонусных слов в банку.
   Остальное: zb-home.js — «Дом», zb-path.js — «Путь», zb-win.js — окно победы, zb-keys.js — клавиатура, css/zb-view.css — стили.
   Выключить: ZB.viewOn=false (`?view=0`) — этот файл ничего не делает, игра в старом виде. Не загрузился — zb-core.js снимает html.zbv.
   Поля сохранения: S.vw* (пока не нужны). Старые WebView: без ?. ?? .at :has. */
(function(){
  if(typeof ZB==='undefined'||!ZB.viewOn)return;
  ZB.vw=true;var DE=document.documentElement;DE.classList.add('zbv');
  function $(id){return document.getElementById(id);}
  function tap(){if(typeof SND!=='undefined')SND.tap();}
  function has(name){return typeof window[name]==='function';}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  ZB.esc=esc;

  /* ---------- нижняя панель ---------- */
  var MGSTUB={stub:1},SCHSTUB={stub:1};
  function addDef(slot){for(var i=0;i<ZB.navSlots.length;i++)if(ZB.navSlots[i].id===slot.id)return;ZB.navSlots.push(slot);}
  addDef({id:'home',order:10,ic:'🏠',t:'Дом',go:function(){openMenu();}});
  addDef({id:'path',order:20,ic:'🗺️',t:'Путь',go:function(){ZB.go('path');}});
  addDef({id:'school',order:30,ic:'🏫',t:'Школа',go:function(){ZB.go('school');},dot:function(){return !!(window.ZBCAB&&ZBCAB.dot&&ZBCAB.dot());}});
  addDef({id:'dict',order:40,ic:'📖',t:'Словарь',go:function(){try{dictTab='mine';}catch(e){}openDict();}});
  addDef({id:'mg',order:50,ic:'🔔',t:'Перемена',go:function(){ZB.go('mg');},on:function(){return ZB._scr.mg!==MGSTUB||ZB.mgSlots.length>0;}});
  // экран → кнопка панели
  var NAVOF={menu:'home','zb-home':'home','zb-path':'path',chapters:'path',levels:'path','zb-school':'school',shopS:'school',rateS:'school',dictS:'dict','zb-mg':'mg'};
  ZB.navOf=NAVOF;
  var curScr='menu';
  function navList(){return ZB.navSlots.filter(function(s){if(!s)return false;if(!s.on)return true;return !!ZB.safe('on:'+s.id,function(){return s.on();});})
    .sort(function(a,b){return (a.order||0)-(b.order||0);}).slice(0,5);}
  function navRender(){var n=$('zbNav');if(!n)return;var app=$('app');if(n.parentNode!==app&&app)app.appendChild(n);
    var L=navList(),act=NAVOF[curScr]||'';
    n.innerHTML=L.map(function(s){var dot=ZB.safe(s.id,function(){return s.dot&&s.dot();});
      return '<button type="button" class="zbnav'+(s.id===act?' on':'')+'" data-zb="'+esc(s.id)+'"><b>'+(s.ic||'')+'</b><span>'+esc(s.t||'')+'</span>'+(dot?'<i class="dot on"></i>':'')+'</button>';}).join('');
    L.forEach(function(s){var b=n.querySelector('[data-zb="'+s.id+'"]');if(b&&s.go)b.onclick=function(){tap();ZB.safe(s.id,s.go);};});
    navShow();}
  function navShow(){var n=$('zbNav');if(!n)return;var on=!!NAVOF[curScr]&&!(typeof S!=='undefined'&&S.lv<3&&curScr==='menu'&&false);
    n.style.display=on?'':'none';DE.classList.toggle('zbnav-on',on);}
  ZB.navRender=navRender;
  ZB.on('screen',function(id){curScr=id;navRender();});
  // модули грузятся после onReady (меню или уровень уже показаны): узнать экран по DOM, догнать уровень
  ZB.on('ready',function(){var on=document.querySelector('.screen.on');if(on)curScr=on.id;navRender();
    if(curScr==='game'&&typeof G!=='undefined'&&G)ZB.safe('vw:late',function(){lvBg({idx:G.idx,daily:G.daily});catEl();});});

  /* ---------- рамки экранов «Школа» и «Перемена» (заглушки) ---------- */
  function hdr(t,sub){return '<div class="hdr zbhdr"><div class="t"><b>'+t+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div><div class="coins"><span class="coin"></span><span class="cc">'+(typeof S!=='undefined'?S.coins:0)+'</span></div></div>';}
  ZB.vwHdr=hdr;
  // старые входы — ничего не теряем: облики, рейтинг/успехи, соседки, задание дня, игры, настройки, об игре
  ZB.vwMore=function(){var ok=typeof OK!=='undefined'&&OK,L=[];
    L.push(['shop','👗','Облики','наряды и блюдца']);
    L.push(['rate',ok?'🏅':'🏆',ok?'Успехи':'Рейтинг',ok?'звание и слова':'грамотеи среди друзей']);
    L.push(['daily','📅','Задание дня','новый кроссворд каждый день']);
    if(has('sosTick')&&typeof S!=='undefined'&&ZB.safe('sos',function(){return sosTick();}))L.push(['sos','🏠','Соседки','соревнование недели']);
    L.push(['chap','🗺️','Все главы','список уровней']);
    if(typeof SOC!=='undefined'&&SOC.can&&SOC.can('more'))L.push(['more','🎲','Ещё игры','игры во дворе']);
    L.push(['set','⚙️','Настройки','звук, музыка, крупные буквы']);
    L.push(['cred','ℹ️','Об игре','благодарности']);
    return '<div class="zbmore">'+L.map(function(x){return '<button type="button" class="zbtile" data-more="'+x[0]+'"><span class="zi">'+x[1]+'</span><span class="zb"><b>'+x[2]+'</b><small>'+x[3]+'</small></span></button>';}).join('')+'</div>';};
  var MORE={shop:function(){openShop();},rate:function(){openRating();},daily:function(){openDaily();},sos:function(){openSosedki('menu');},
    chap:function(){if(has('zbOldChapters'))zbOldChapters();else openChapters();},more:function(){SOC.showMore();},set:function(){openSettings();},cred:function(){openCredits();}};
  ZB.vwBind=function(root){if(!root)return;[].forEach.call(root.querySelectorAll('[data-more]'),function(b){b.onclick=function(){var k=b.getAttribute('data-more');if(k!=='daily'&&k!=='set')tap();ZB.safe('more:'+k,MORE[k]);};});};
  ZB.screen('school',SCHSTUB);
  SCHSTUB.render=function(el){var c={};
    // CAB (просьба 10.10): есть ZBCAB — его «Школа №7» (шапка, фасад, 8 кабинетов), ниже — гнёзда и старые входы
    if(window.ZBCAB&&ZBCAB.render&&ZBCAB.on!==false){ZBCAB.render(el);var sc=el.querySelector('.scroll')||el;
      sc.insertAdjacentHTML('beforeend',ZB.html(ZB.schoolSlots,'main',c)+'<div class="zbh-ttl zbmore-t">Ещё в игре</div>'+ZB.vwMore()+ZB.html(ZB.schoolSlots,'bottom',c));
      ZB.mount(el,ZB.schoolSlots,c);ZB.vwBind(el);return;}
    el.innerHTML=hdr('🏫 Школа бабы Зины','всё, что есть в игре')+'<div class="scroll zbscr">'+ZB.html(ZB.schoolSlots,'top',c)+ZB.html(ZB.schoolSlots,'main',c)+ZB.vwMore()+ZB.html(ZB.schoolSlots,'bottom',c)+'</div>';
    ZB.mount(el,ZB.schoolSlots,c);ZB.vwBind(el);};
  ZB.screen('mg',MGSTUB);
  MGSTUB.render=function(el){var c={};el.innerHTML=hdr('🔔 Перемена','игры на пять минут')+'<div class="scroll zbscr">'+ZB.html(ZB.mgSlots,'top',c)+ZB.html(ZB.mgSlots,'main',c)+'</div>';ZB.mount(el,ZB.mgSlots,c);};
  // «Главы» (старый список) → «Путь»; старый список остаётся как zbOldChapters (из «Школы» → «Все главы»)
  if(has('openChapters')){window.zbOldChapters=window.openChapters;window.openChapters=function(){if(ZB._scr.path)ZB.go('path');else zbOldChapters();};}

  /* ---------- новичок: до 3-го уровня — сразу уровень, а не «Дом» (хаб — с 3–4-го; NEWBIE согласует) ---------- */
  ZB.hubFrom=3;

  /* ---------- уровень: фон места главы, кот Ять, «бульк» в банку ---------- */
  function lvBg(info){var g=$('game');if(!g)return;var b=$('zbLvBg');
    if(!b){b=document.createElement('div');b.id='zbLvBg';b.className='zblvbg';b.innerHTML='<div class="art"></div><div class="veil"></div>';g.insertBefore(b,g.firstChild);}
    var a=b.firstChild;if(info&&info.daily){a.removeAttribute('data-pl');a.innerHTML='';a.style.backgroundColor='#fdecd2';b.className='zblvbg day';return;}
    b.className='zblvbg';ZB.placeInto(a,ZB.chapAt(info?info.idx:0),'xMidYMid slice');}
  function catEl(){var w=$('wheelWrap');if(!w)return null;var c=$('zbCat');
    if(!c&&has('catSVG')){c=document.createElement('button');c.type='button';c.id='zbCat';c.className='zbcat';c.setAttribute('aria-label','Кот Ять');
      c.innerHTML=catSVG().replace('<path d="M95 104','<path class="tail" d="M95 104').replace('<svg','<svg preserveAspectRatio="xMidYMax meet"');
      c.onclick=function(){if(typeof SND!=='undefined'&&SND.meow)SND.meow();catJump();if(typeof G!=='undefined'&&G&&!G.won&&has('zina'))zina(ZB.say('cat',{},CAT_SAY),'happy',2.5);};
      w.appendChild(c);}
    return c;}
  var CAT_SAY=['Мяу. Ять говорит: «Я бы это слово давно нашёл, но лапки».','Ять проверяет тетрадь. Ошибок не нашёл — потому что спит.','Не трогай кота, он думает. Над колбасой.',
    'Ять мурлычет — значит, слово рядом.','Мур! Это он «молодец» сказал. По-кошачьи.','Кот Ять за тебя болеет. Лёжа.'];
  function catJump(big){var c=$('zbCat');if(!c)return;c.classList.remove('jump','hop');void c.offsetWidth;c.classList.add(big?'jump':'hop');}
  ZB.catJump=catJump;
  function jarBlub(){var j=$('hJar');if(!j)return;j.classList.remove('zbblub');void j.offsetWidth;j.classList.add('zbblub');
    if(typeof CALM==='function'&&CALM())return;var r=j.getBoundingClientRect(),e=document.createElement('div');e.className='zbbub';e.textContent='+1';
    e.style.left=Math.round(r.left+r.width/2-14)+'px';e.style.top=Math.round(r.top-6)+'px';document.body.appendChild(e);setTimeout(function(){e.remove();},1100);}
  ZB.jarBlub=jarBlub;
  ZB.on('start',function(info){ZB.safe('vw:lvbg',function(){lvBg(info);});ZB.safe('vw:cat',function(){var c=catEl();if(c)c.classList.remove('jump','hop');});});
  // слово найдено / бонусное — обёртка submit (как newbie.js / sosedki.js): считаем до и после
  if(has('submit')){var sub0=window.submit;window.submit=function(w){var g=typeof G!=='undefined'?G:null,f0=g?g.words.filter(function(x){return x.found;}).length:0,b0=g?g.bonus.size:0;
    var r=sub0.apply(this,arguments);
    if(g&&G===g)ZB.safe('vw:word',function(){var f1=g.words.filter(function(x){return x.found;}).length;
      if(f1>f0)catJump(String(w||'').length>=6);else if(g.bonus.size>b0){jarBlub();catJump(false);}});
    return r;};}
})();
