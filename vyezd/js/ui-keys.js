/* ui-keys.js — клавиатура на ПК для всей основной игры «Выезда со двора» (поток KEYS, 10.10.2026; правило владельца для всех его игр).
   Грузится с defer ПОСЛЕ основного скрипта. Нет файла — игра работает как раньше (старый обработчик index.html: Esc/Enter в окнах, H/R/Esc во дворе).
   Что даёт ВСЕМ экранам и окнам сразу (свои гнёзда ничего делать не обязаны):
     ←↑→↓ (и WASD / цфыв)  — рамка выбора переходит к ближайшей кнопке в эту сторону (кнопки, [data-go], [data-nav], плитки, окна дома…);
     Enter / пробел        — нажать выбранное; без рамки — главное действие (окно: первая .btn; главный: «Выехать»; карта: текущий двор);
     1–9                   — в окне: кнопки по порядку (на ПК видны цифры-бейджи); на экране: разделы нижней панели (.unav [data-nav]);
     Esc                   — окно: «закрыть» (сначала старый список id в index.html, потом кнопка ✕/Закрыть/Назад/Позже, иначе VY.hide());
                             экран: кнопка «←» в шапке или UI.go('home').
     Мелкая строка-подсказка клавиш — только на ПК (matchMedia '(hover:hover) and (pointer:fine)').
   ДОГОВОР для модулей других потоков (всё необязательно):
     UI.keys.on('album', (key, e) => true|false)  — свои клавиши экрана (зовётся раньше общего; true — обработано). key — e.key.
                                                    Экран 'modal' — для любого окна, '*' — для любого экрана.
     UI.keys.hint('album', 'текст' | () => 'текст') — своя строка-подсказка экрана.
     data-keys-default  — на элементе: с него начинается рамка (иначе .node.cur / #hGo / главная кнопка окна / первый).
     data-keys-layer    — на своём всплывающем слое (шторка, лист): пока он виден, клавиши и цифры работают внутри него.
     data-keys-skip     — на элементе/блоке: рамка его пропускает.
     data-keys-back     — на кнопке «назад» своего экрана (если это не первая кнопка «←» в шапке).
     data-keys-hint="…" — на любом элементе своего окна/экрана: эта строка-подсказка вместо общей (пока элемент виден).
     data-keys-num      — на кнопках экрана, которые должны получить цифры 1–9 вместо разделов нижней панели (вкладки «Моего двора» и т. п.).
     UI.keys.ring(el) / UI.keys.clear() — поставить/убрать рамку из своего кода.
   Мини-игры (#vymgHost) — не трогаем: у оболочки vymg свой перехватчик. Поля ввода — не трогаем. */
(function(){'use strict';
  if(!window.UI||UI.keys)return;
  var W=window,D=document,on={},hints={},cur=null,sig='',raf=0,escAt=null;
  function $(i){return D.getElementById(i);}
  function L(a,b){try{return VY.L(a,b);}catch(e){return a;}}
  function pc(){try{return UI.pc();}catch(e){return false;}}
  var SEL='button,[data-go],[data-nav],[data-res],[data-key],[tabindex]:not([tabindex="-1"]),a[href],.hsT,.node';
  var MAIN='.btn:not([disabled]):not(.x2):not(.buy):not(.noenter)';
  function shown(el){if(!el||!el.isConnected||el.disabled||el.getAttribute('aria-disabled')==='true')return false;
    if(el.closest('[data-keys-skip]'))return false;var r=el.getBoundingClientRect();if(r.width<4||r.height<4)return false;
    var c=getComputedStyle(el);return c.visibility!=='hidden'&&+c.opacity>0.05;}
  function modalOpen(){var m=$('modal');return !!(m&&m.classList.contains('on'));}
  function busy(){var a=$('ad');return !!((a&&a.classList.contains('on'))||$('vymgHost'));}
  function layer(){if(modalOpen())return $('mcard');var ls=D.querySelectorAll('[data-keys-layer]');for(var i=ls.length-1;i>=0;i--)if(shown(ls[i]))return ls[i];
    return D.querySelector('.screen.on');}
  function items(root){if(!root)return [];var a=[].slice.call(root.querySelectorAll(SEL)).filter(shown);
    return a.filter(function(el){for(var i=0;i<a.length;i++)if(a[i]!==el&&a[i].contains(el))return false;return true;});}
  function sigOf(el){if(!el)return '';if(el.id)return '#'+el.id;var k=['data-nav','data-go','data-slot','data-res','data-key'];
    for(var i=0;i<k.length;i++){var v=el.getAttribute(k[i]);if(v!=null)return '['+k[i]+'="'+String(v).replace(/"/g,'\\"')+'"]';}return '';}
  function def(root,it){var q=root.querySelector('[data-keys-default]');if(q&&shown(q))return q;
    var c=['.node.cur','#hGo'];for(var i=0;i<c.length;i++){q=root.querySelector(c[i]);if(q&&shown(q))return q;}
    if(root.id==='mcard'||root.hasAttribute('data-keys-layer')){q=root.querySelector(MAIN);if(q&&shown(q))return q;}
    return it[0]||null;}

  /* ---------- рамка выбора и цифры-бейджи (слой поверх, ничего в чужой вёрстке не меняем) ---------- */
  var css=D.createElement('style');css.textContent=
    '#ukRing{position:fixed;z-index:2147482000;pointer-events:none;border:3px solid #ffb020;border-radius:14px;box-shadow:0 0 0 2px rgba(255,255,255,.9),0 0 14px 2px rgba(255,176,32,.7);display:none;transition:left .08s,top .08s,width .08s,height .08s}'+
    'body.calm #ukRing{transition:none}'+
    '#ukNum{position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147482001;pointer-events:none}'+
    '#ukNum b{position:absolute;min-width:16px;height:16px;padding:0 3px;border-radius:5px;background:#233247;color:#fff;font:800 11px/16px system-ui,sans-serif;text-align:center;box-shadow:0 1px 0 rgba(0,0,0,.35);opacity:.9}'+
    '#ukHint{position:fixed;z-index:2147482002;pointer-events:none;display:none;padding:4px 9px;border-radius:9px;background:rgba(35,50,71,.78);color:#fff;font:600 11px/1.35 system-ui,sans-serif;letter-spacing:.1px;max-width:min(92vw,560px);text-align:center}'+
    '#ukHint kbd{font:800 10px/1 system-ui,sans-serif;background:rgba(255,255,255,.2);border-radius:4px;padding:1px 4px}';
  D.head.appendChild(css);
  var ringEl=null,numEl=null,hintEl=null;
  function els(){if(ringEl)return;ringEl=D.createElement('div');ringEl.id='ukRing';numEl=D.createElement('div');numEl.id='ukNum';hintEl=D.createElement('div');hintEl.id='ukHint';
    D.body.appendChild(ringEl);D.body.appendChild(numEl);D.body.appendChild(hintEl);}
  function set(el){els();cur=el;sig=sigOf(el);if(!el){ringEl.style.display='none';return;}
    try{el.scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){}loop();}
  function clear(){cur=null;sig='';if(ringEl)ringEl.style.display='none';}
  function place(){if(!ringEl)return;
    if(cur&&!cur.isConnected&&sig){var L0=layer(),q=null;try{q=L0&&L0.querySelector(sig);}catch(e){}cur=q&&shown(q)?q:null;}
    var L1=layer();if(!cur||!shown(cur)||!L1||!L1.contains(cur)){cur=null;ringEl.style.display='none';return;}
    var r=cur.getBoundingClientRect(),br=parseFloat(getComputedStyle(cur).borderTopLeftRadius)||8;
    ringEl.style.cssText='display:block;left:'+(r.left-5)+'px;top:'+(r.top-5)+'px;width:'+(r.width+10)+'px;height:'+(r.height+10)+'px;border-radius:'+Math.min(40,br+5)+'px';}
  // что пронумеровано: окно/слой — его кнопки; экран — разделы нижней панели
  function numbered(){var L1=layer();if(!L1)return [];if(L1.id==='mcard'||L1.hasAttribute('data-keys-layer'))return items(L1).slice(0,9);
    var own=[].slice.call(L1.querySelectorAll('[data-keys-num]')).filter(shown);if(own.length)return own.slice(0,9); // свои цифры экрана (вкладки и т. п.)
    return [].slice.call(L1.querySelectorAll('.unav [data-nav]')).filter(shown).slice(0,9);}
  var numK='';
  function badges(){if(!numEl)return;if(!pc()||busy()||(UI.cur==='game'&&!modalOpen())){if(numEl.firstChild)numEl.innerHTML='';numK='';return;}
    var a=numbered(),h='',k='';for(var i=0;i<a.length;i++){var r=a[i].getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)continue;
      var x=Math.round(r.left-4),y=Math.round(r.top-5);k+=x+','+y+';';h+='<b style="left:'+Math.max(0,x)+'px;top:'+Math.max(0,y)+'px">'+(i+1)+'</b>';}
    if(k!==numK){numK=k;numEl.innerHTML=h;}}
  function hintTxt(){var n=numbered().length,nn=n>1?'1–'+n:n?'1':'';
    var L0=layer(),dh=L0&&(L0.hasAttribute('data-keys-hint')?L0:L0.querySelector('[data-keys-hint]'));if(dh&&(dh===L0||dh.getClientRects().length))return dh.getAttribute('data-keys-hint'); // своя подсказка в вёрстке окна/экрана
    if(modalOpen()){var f=hints.modal;if(f)return typeof f==='function'?f():f;
      return L('Enter — главное','Enter — main')+(nn?' · '+nn+L(' — кнопки',' — buttons'):'')+' · '+L('стрелки — выбор · Esc — закрыть','arrows — select · Esc — close');}
    var c=UI.cur,h=hints[c];if(h)return typeof h==='function'?h():h;
    if(c==='game'){var gs=$('gSide');if(gs&&gs.offsetWidth>0)return '';return L('стрелки — машина · Пробел — ехать · H — подсказка · R — заново · P — пауза · Esc — домой','arrows — car · Space — drive · H — hint · R — restart · P — pause · Esc — home');}
    var np=nn?' · '+nn+L(' — разделы',' — sections'):'';
    if(c==='home')return L('Enter — выехать · стрелки — выбор','Enter — drive · arrows — select')+np;
    if(c==='map')return L('стрелки — двор · Enter — играть','arrows — yard · Enter — play')+np+L(' · Esc — домой',' · Esc — home');
    return L('стрелки — выбор · Enter — открыть','arrows — select · Enter — open')+np+L(' · Esc — назад',' · Esc — back');}
  var hintK='';
  function hint(){if(!hintEl)return;if(!pc()||busy()){hintEl.style.display='none';hintK='';return;}
    var t='';try{t=hintTxt()||'';}catch(e){}if(!t){hintEl.style.display='none';hintK='';return;}
    var app=$('app'),ar=app?app.getBoundingClientRect():{left:0,right:innerWidth},pos;
    if(ar.left>=200)pos='left:8px;bottom:8px;max-width:'+Math.round(ar.left-16)+'px;text-align:left';
    else{var nav=!modalOpen()&&D.querySelector('.screen.on .unav'),nr=nav&&nav.offsetWidth?nav.getBoundingClientRect():null;
      pos='left:50%;transform:translateX(-50%);bottom:'+(nr?Math.round(innerHeight-nr.top+4):4)+'px';}
    var k=t+'|'+pos;if(k===hintK)return;hintK=k;hintEl.style.cssText='display:block;'+pos;hintEl.textContent=t;}
  // одна петля кадров, пока на ПК что-то показано (окна выезжают с анимацией, списки прокручиваются)
  function tick(){raf=0;place();badges();hint();if(pc()||cur)raf=requestAnimationFrame(tick);}
  function loop(){els();if(!raf)raf=requestAnimationFrame(tick);}

  /* ---------- переходы ---------- */
  function ov(a0,a1,b0,b1){return Math.min(a1,b1)-Math.max(a0,b0);}
  function move(dx,dy){var L1=layer();if(!L1)return false;var it=items(L1);if(!it.length)return false;
    if(!cur||!shown(cur)||!L1.contains(cur)){set(def(L1,it));return true;}
    // карта: ↑↓ — соседний открытый двор по порядку
    if(dy&&!modalOpen()&&cur.classList.contains('node')){var ns=it.filter(function(e){return e.classList.contains('node');}),i=ns.indexOf(cur),n=ns[i+dy];if(n){set(n);return true;}}
    var a=cur.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2,best=null,bs=1e9;
    for(var j=0;j<it.length;j++){var el=it[j];if(el===cur||el.contains(cur)||cur.contains(el))continue;
      var b=el.getBoundingClientRect(),bx=b.left+b.width/2,by=b.top+b.height/2,p=dx?(bx-ax)*dx:(by-ay)*dy;if(p<=2)continue;
      var gap=Math.max(0,dx?(dx>0?b.left-a.right:a.left-b.right):(dy>0?b.top-a.bottom:a.top-b.bottom)),
          o=dx?ov(a.top,a.bottom,b.top,b.bottom):ov(a.left,a.right,b.left,b.right),s=dx?Math.abs(by-ay):Math.abs(bx-ax),
          sc=gap+p*0.15+(o>0?s*0.15:s*1.6+40);
      if(sc<bs){bs=sc;best=el;}}
    if(best)set(best);return !!best;}
  function press(el){if(!el)return;try{if(typeof el.click==='function')el.click();else el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:W}));}catch(e){}}
  function backBtn(){var s=D.querySelector('.screen.on');if(!s)return null;var q=s.querySelector('[data-keys-back]');if(q&&shown(q))return q;
    var bs=s.querySelectorAll('header button,header [data-go]');for(var i=0;i<bs.length;i++){var b=bs[i],t=(b.textContent||'').trim(),al=b.getAttribute('aria-label')||'';
      if(shown(b)&&(/^[←‹<]/.test(t)||/Назад|На карту|Домой|Back|To the map/i.test(al)))return b;}return null;}
  function closeBtn(){var m=$('mcard');if(!m)return null;var bs=items(m);
    for(var i=0;i<bs.length;i++){var b=bs[i],t=(b.textContent||'').replace(/\s+/g,' ').trim(),al=b.getAttribute('aria-label')||'';
      if(/^[✕×✖]$/.test(t)||/^(Закрыть|Назад|Отмена|Позже|Не сейчас|Готово|Понятно|Close|Back|Cancel|Later|Not now|Done|Got it)\b/i.test(t)||/Закрыть|Close/i.test(al))return b;}return null;}
  var DIR={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1],'ф':[-1,0],'в':[1,0],'ц':[0,-1],'ы':[0,1]};
  function typing(){var a=D.activeElement;return !!(a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||a.isContentEditable));}
  function done(e){e.preventDefault();e.stopPropagation();}

  /* ---------- перехват (раньше обработчиков index.html и модулей) ---------- */
  W.addEventListener('keydown',function(e){escAt=null;
    if(e.ctrlKey||e.metaKey||e.altKey||busy()||typing())return;
    var k=e.key,lk=k&&k.length===1?k.toLowerCase():k,mo=modalOpen(),scr=UI.cur,f;
    loop();
    // свои клавиши экрана/окна (модули других потоков)
    f=mo?on.modal:on[scr];if(f){for(var i=0;i<f.length;i++){var r=false;try{r=f[i](k,e);}catch(x){try{console.warn('UI.keys',x);}catch(_){}}if(r){done(e);return;}}}
    if(!mo&&on['*'])for(var j=0;j<on['*'].length;j++){var r2=false;try{r2=on['*'][j](k,e);}catch(x){}if(r2){done(e);return;}}
    if(k==='Escape'){escAt={mo:mo,scr:scr,html:mo?($('mcard')||{}).innerHTML:''};return;} // сначала — старые обработчики; запасной вариант — ниже
    if(scr==='game'&&!mo&&!D.querySelector('[data-keys-layer]'))return; // двор: свои клавиши в index.html (выбор машины, пробел, H, R, P)
    if(e.repeat&&!DIR[lk])return;
    var d=DIR[lk];
    if(d){if(!mo&&!DIR[k]&&scr==='game')return;if(move(d[0],d[1]))done(e);return;}
    if(k==='Enter'||k===' '){
      if(cur&&shown(cur)&&layer()&&layer().contains(cur)){done(e);press(cur);return;}
      if(mo)return; // главная кнопка окна — старый обработчик index.html
      if(scr==='home'){var g=$('hGo');if(g&&shown(g)){done(e);press(g);}return;}
      if(scr==='map'){var nd=D.querySelector('#scr-map .node.cur');if(nd&&shown(nd)){done(e);press(nd);}return;}
      var L1=layer();if(L1){var it=items(L1);if(it.length){done(e);set(def(L1,it));}}return;}
    if(/^[1-9]$/.test(k)){var a=numbered(),b=a[+k-1];if(b){done(e);clear();press(b);}return;}
  },true);
  // Esc — запасной: если старые обработчики окно/экран не закрыли
  D.addEventListener('keydown',function(e){var x=escAt;escAt=null;if(!x||e.key!=='Escape'||e.defaultPrevented||busy())return;
    if(x.mo){if(!modalOpen()||($('mcard')||{}).innerHTML!==x.html)return;var b=closeBtn();e.preventDefault();clear();if(b)press(b);else try{VY.hide();}catch(_){}return;}
    if(modalOpen()||UI.cur!==x.scr||x.scr==='home'||x.scr==='game')return;
    var bb=backBtn();e.preventDefault();clear();if(bb)press(bb);else UI.go('home');});
  // мышь/палец — рамку прячем
  W.addEventListener('pointerdown',function(){if(cur)clear();},true);
  UI.on('screen',function(){clear();});
  try{new MutationObserver(function(){if(cur&&!shown(cur))clear();numK='';hintK='';}).observe($('modal'),{attributes:true,attributeFilter:['class']});}catch(e){}
  W.addEventListener('resize',function(){numK='';hintK='';loop();});
  if(pc())loop();

  UI.keys={
    on:function(name,fn){(on[name]=on[name]||[]).push(fn);},
    hint:function(name,t){hints[name]=t;hintK='';},
    ring:function(el){set(el||null);},clear:clear,
    get cur(){return cur;},move:move,items:function(){return items(layer());},pc:pc};
})();
