'use strict';
/* ================= ob2-speed — поток SPEED буста «буст_в2.0» (12.10.2026; журнал hobby-analytics/release-i/oborona-boost2/logs/SPEED.md) =================
   Грузится в конце index.html (метка ob2:SPEED), после всех файлов игры. Без ?. ?? .at() — старые WebView.
   Флаги (OB2.off): curtain — шторка «Застава готовится…» перед боем; lazy — мини-игры, загадки и en.js по требованию;
                    adretry — межэкранная после «рекламы нет» повторяется через 90 с (core.js); lite — «Режим попроще» (по умолчанию ВЫКЛ., SP_LITE ниже).
   Починка подвисаний П1–П5 (art.js, game.js, ui.js) — без флага. */
var SP=(function(){
  function off(id){try{if(window.OB2&&OB2.off)return OB2.off(id);}catch(e){}return false;}
  try{if(window.OB2&&OB2.reg){OB2.reg('curtain',{s:'SPEED',t:'шторка «Застава готовится…» перед боем'});OB2.reg('lazy',{s:'SPEED',t:'мини-игры, загадки и en.js — по требованию'});
    OB2.reg('adretry',{s:'SPEED',t:'межэкранная: после «рекламы нет» повтор через 90 с'});OB2.reg('lite',{s:'SPEED',t:'режим попроще (графика Авто/Красиво/Быстро)'});}}catch(e){}
  var TEST=/[?&](bot|shot)\b/.test(location.search);

  /* ---------- шторка «Застава готовится…» ----------
     Старт боя по нажатию (startLevel/startEndless/startWeekly/startDaily/dlyStart/festStart из обработчика касания) — сначала показываем шторку
     (кадр успевает нарисоваться), потом готовим бой; шторка держится не меньше 0,2 с и тает. Вызовы из кода (бот, стенды, таймеры, после рекламы)
     идут как раньше — синхронно. Вложенные вызовы внутри уже идущего старта — тоже синхронно. */
  var CUR_MIN=200,cur=null,busy=0;
  var LINES=[['Воевода Потап пересчитывает стрельцов…','Commander Potap is counting his archers…'],['Пушкари ищут, куда закатилось ядро…','The gunners are looking for a runaway cannonball…'],
    ['Кот Баюн точит когти и делает вид, что спит…','Bayun the Cat sharpens his claws and pretends to nap…'],['Тётушка Яга помешивает котёл. Лучше не спрашивать, что там…','Auntie Yaga stirs her cauldron. Better not ask what’s inside…'],
    ['Стрельцы натягивают тетивы и спорят, чья очередь дежурить…','Archers string their bows and argue whose watch it is…'],['Дружина затягивает пояса потуже…','The host tightens their belts…'],
    ['Нечисть строится в очередь. Не толкаться!','Monsters are lining up. No pushing!'],['Частокол подпирают, ворота смазывают…','Propping up the palisade, oiling the gate…']];
  var lineN=Math.floor(Math.random()*LINES.length);
  function css(){if(document.getElementById('spCss'))return;var s=document.createElement('style');s.id='spCss';
    s.textContent='#spCur{position:fixed;top:0;right:0;bottom:0;left:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(10,12,26,.96);opacity:1;transition:opacity .16s ease-out;pointer-events:all}'+
      '#spCur.out{opacity:0;pointer-events:none}#spCur .b{max-width:300px;width:82%;text-align:center;color:#f4f1ea}'+
      '#spCur h3{margin:0 0 8px;font:700 21px var(--ft,Georgia,serif);color:#ffe9b0;letter-spacing:.2px}'+
      '#spCur p{margin:0 0 14px;font-size:14px;line-height:1.35;color:#c9cde0;min-height:38px}'+
      '#spCur .bar{height:10px;border-radius:6px;background:rgba(255,255,255,.1);overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.5)}'+
      '#spCur .bar i{display:block;height:100%;width:8%;border-radius:6px;background:var(--orn,#c9480f) left center/auto 10px repeat-x;animation:spBar .9s ease-out forwards}'+
      '@keyframes spBar{from{width:8%}to{width:96%}}';
    document.head.appendChild(s);}
  function show(){css();if(!cur){cur=document.createElement('div');cur.id='spCur';cur.setAttribute('role','status');document.body.appendChild(cur);}
    var L=LINES[lineN++%LINES.length];
    cur.innerHTML='<div class="b"><h3>'+Lg('Застава готовится…','The outpost is getting ready…')+'</h3><p>'+Lg(L[0],L[1])+'</p><div class="bar"><i></i></div></div>';
    cur.className='';cur.style.display='flex';return performance.now();}
  function hide(t0){var w=Math.max(0,CUR_MIN-(performance.now()-t0));
    setTimeout(function(){requestAnimationFrame(function(){if(!cur)return;cur.className='out';setTimeout(function(){if(cur&&cur.className==='out')cur.style.display='none';},200);});},w);}
  // fn — сам старт боя; через шторку, если флаг включён и это нажатие игрока
  function go(fn,force){
    if(busy||TEST||off('curtain')||(!force&&!userEv())){return fn();}
    busy=1;var t0=show();try{if(typeof hmk==='function')hmk('t:cur');}catch(e){}
    requestAnimationFrame(function(){requestAnimationFrame(function(){try{busy=2;fn();}catch(e){console.warn(e);}finally{busy=0;hide(t0);}});});}
  function userEv(){var e=window.event;return !!(e&&e.isTrusted!==false&&/^(click|pointerup|pointerdown|touchend|mouseup|keydown|keyup)$/.test(e.type));}
  function wrap(name){var f=window[name];if(typeof f!=='function'||f.__sp)return;var w=function(){var a=arguments,self=this;if(busy===2)return f.apply(self,a);var r;go(function(){r=f.apply(self,a);});return r;};w.__sp=1;window[name]=w;}
  ['startLevel','startEndless','startWeekly','startDaily','dlyStart','festStart'].forEach(wrap);

  /* ---------- мини-игры по требованию (флаг lazy) ----------
     index.html не грузит 18 файлов игр (SP_MG), если SP_LAZY. Вместо игр — заглушки в реестре MG (id, номер, название, значок, условие открытия),
     чтобы Изба, «Дело дня», «Передышка», красные точки и STAT видели игры как раньше. Первое открытие Избы или игры — под индикатором
     «Дозорные зажигают лучины…» грузим все файлы по порядку (kit перед игрой), настоящая регистрация заменяет заглушку, дальше — как было.
     Пока файлы не загружены: значок игры — как у настоящей (MG_ICO), если его рисунок есть на старте, иначе эмблема mg_i<n>; строка «Разведано» в окне Логова — после первой загрузки. */
  var mgSt=0,mgP=null,mgN=0;   // 0 — не грузили, 1 — грузим, 2 — готово
  var MG_OPENF={2:function(){return !!S.stars['0-5'];},8:function(){return chaptersDone()>=3;},14:function(){return chaptersDone()>=3;}};
  var MG_ICO={2:'b_wall',3:'pushka',4:'mgc_torch',6:'mgc_net',7:'hp_iva',8:'mga_strel',9:'mgc_bell',11:'gate',12:'ball',13:'swords',14:'flask'};   // значки настоящих игр (берём, если рисунок есть на старте)
  function mgStubs(){if(!window.SP_LAZY||typeof MG_REG!=='function'||typeof MG_INFO==='undefined')return;
    var reg=MG_REG;window.MG_REG=function(g){try{var o=g&&g.id&&MG.by[g.id];if(o&&o.__stub){delete MG.by[g.id];var i=MG.list.indexOf(o);if(i>=0)MG.list.splice(i,1);if(MG.num[o.num]===o)delete MG.num[o.num];}}catch(e){}return reg(g);};
    for(var n in MG_INFO){var I=MG_INFO[n];if(!I||MG.by[I.id])continue;
      (function(n,I){var f=MG_OPENF[n],ic=MG_ICO[n];reg({id:I.id,num:+n,n:{ru:I.n[0],en:I.n[1]},icon:ic&&typeof ART!=='undefined'&&ART[ic]?ic:'mg_i'+n,kind:I.k,__stub:1,open:f?function(){try{return f();}catch(e){return false;}}:undefined,run:function(){}});})(+n,I);}}
  function mgLoad(){if(mgSt===2)return Promise.resolve();if(mgP)return mgP;mgSt=1;var L=(window.SP_MG||[]).slice(),t0=performance.now();
    mgP=new Promise(function(ok,no){(function next(){if(!L.length){mgSt=2;try{STAT.ev('lazy',{a:'mg',ms:Math.round(performance.now()-t0)});}catch(e){}ok();return;}
      var f=L.shift();(window.OB2&&OB2.need?OB2.need(f,30000):loadScript(f,30000)).then(function(){mgN++;bar();setTimeout(next,0);},function(e){mgP=null;mgSt=0;no(e);});})();});
    return mgP;}
  var ind=null;
  function bar(){if(!ind)return;var i=ind.querySelector('.bar i');if(i){i.style.animation='none';i.style.width=Math.round(8+88*mgN/Math.max(1,(window.SP_MG||[]).length))+'%';}}
  function indShow(){css();if(!cur){cur=document.createElement('div');cur.id='spCur';document.body.appendChild(cur);}ind=cur;
    cur.innerHTML='<div class="b"><h3>'+Lg('Дозорная изба','The Watch Lodge')+'</h3><p>'+Lg('Дозорные зажигают лучины и сдувают пыль с игр…','The watchmen light the torches and dust off the games…')+'</p><div class="bar"><i></i></div></div>';
    cur.className='';cur.style.display='flex';bar();return performance.now();}
  // fn — открыть Избу/игру; сначала дождаться файлов игр (с индикатором), при сбое — тост, ничего не открываем
  function mgNeed(fn){if(!window.SP_LAZY||mgSt===2)return fn();var t0=indShow();
    mgLoad().then(function(){ind=null;hide(t0);fn();},function(){ind=null;hide(t0);toast(Lg('Не получилось загрузить мини-игры — проверь интернет и попробуй ещё раз','Couldn’t load the mini-games — check your connection and try again'));});}
  function mgWrap(){if(!window.SP_LAZY)return;['MG_IZBA','MG_OPEN'].forEach(function(nm){var f=window[nm];if(typeof f!=='function'||f.__sp)return;
      var w=function(){var a=arguments,self=this;if(mgSt===2)return f.apply(self,a);mgNeed(function(){window[nm].apply(self,a);});return null;};w.__sp=1;window[nm]=w;});}
  try{mgStubs();mgWrap();}catch(e){console.warn('ob2-speed lazy',e);}

  /* ---------- «Режим попроще» (флаг lite; ЗАЛОЖЕН, по умолчанию ВЫКЛ.: LITE_ON=false — включим по цифрам slow/hang после выпуска; на стенде — ?on=lite) ----------
     S.o2s.g — выбор игрока в ⚙ «Графика»: 0 Авто · 1 Красиво · 2 Быстро (настройка устройства: из облака не берём — merge пустой).
     Авто включает режим, если: памяти ≤3 ГБ, ядер ≤4, Chrome <120, или за последние 3 дня было подвисание (hang или slow ≥600 мс; метка localStorage oborona-lite-h).
     Что делает: body.lite (меню без теней и градиентов — уже было в look.css), фон боя в плотности 1 и ровные пятна вместо 70 градиентов, частиц ≤120 (game.js, window.SP_LQ). */
  var LITE_ON=false,LH='oborona-lite-h';
  var liteOk=(LITE_ON||/[?&]on=lite\b/.test(location.search))&&!off('lite');
  function liteAuto(){var n=navigator,why='';try{
      if(n.deviceMemory&&n.deviceMemory<=3)why='mem';else if(n.hardwareConcurrency&&n.hardwareConcurrency<=4)why='cpu';
      else{var m=/Chrome\/(\d+)/.exec(n.userAgent||'');if(m&&+m[1]<120)why='old';}
      if(!why){var h=+localStorage.getItem(LH)||0;if(h&&Date.now()-h<3*864e5)why='hang';}}catch(e){}return why;}
  function liteG(){try{return S.o2s&&S.o2s.g|0;}catch(e){return 0;}}
  function liteNow(){if(!liteOk)return false;var g=liteG();return g===2||(g===0&&!!liteAuto());}
  var ours=false;   // body.lite поставили мы (а не look.js для старого движка — тот не снимаем)
  function liteApply(){if(!liteOk)return;var on=liteNow(),b=document.body;window.SP_LQ=on;if(b){var base=/\blite\b/.test(b.className)&&!ours,w=base||on;b.classList.toggle('lite',w);ours=w&&!base;}
    try{if(typeof G!=='undefined'&&G&&!G.over)G.lk='';}catch(e){}}
  function liteMark(){try{localStorage.setItem(LH,String(Date.now()));}catch(e){}}
  if(liteOk){try{
    OB2.field('s',{id:'lite',def:function(){return {g:0};},fix:function(o){o.g=o.g===1||o.g===2?o.g:0;},merge:function(){}});
    var ev0=STAT.ev,sl0=STAT.slow;STAT.ev=function(n){if(n==='hang')liteMark();return ev0.apply(this,arguments);};
    if(sl0)STAT.slow=function(sc,ms){if(ms>=600)liteMark();return sl0.apply(this,arguments);};
    if(window.LOOK&&LOOK.lite){var ls0=LOOK.lite;LOOK.lite=function(){ours=false;ls0.apply(this,arguments);liteApply();};}
    document.addEventListener('DOMContentLoaded',function(){setTimeout(liteApply,0);});OB2.on('menu',liteApply,'lite');liteApply();
    var os0=window.openSettings;if(typeof os0==='function')window.openSettings=function(){var r=os0.apply(this,arguments);try{liteRow();}catch(e){console.warn(e);}return r;};
    STAT.ev('lite',{g:liteG(),on:liteNow()?1:0,why:liteAuto()||'-'});
  }catch(e){console.warn('ob2-speed lite',e);}}
  // строка «Графика: Авто / Красиво / Быстро» в ⚙ — после «Тряски экрана»
  function liteRow(){var sh=document.getElementById('sShk'),row=sh&&sh.parentNode;if(!row||document.getElementById('spGfx'))return;
    var g=liteG(),a=liteAuto(),L=[[0,Lg('Авто','Auto')],[1,Lg('Красиво','Pretty')],[2,Lg('Быстро','Fast')]];
    var d=document.createElement('div');d.id='spGfx';
    d.innerHTML='<div class="tg" style="border:0;padding-bottom:0">'+Lg('Графика','Graphics')+'</div><div class="seg">'+L.map(function(x){return '<button data-gfx="'+x[0]+'" class="'+(g===x[0]?'on':'')+'">'+x[1]+'</button>';}).join('')+'</div>'+
      '<p class="sub" style="margin:2px 0 8px;font-size:14px">'+(g===0?(a?Lg('Сейчас — попроще: так бой идёт ровнее на этом телефоне','Now: simpler — battles run smoother on this phone'):Lg('Сейчас — красиво','Now: pretty')):g===2?Lg('Попроще: меньше теней и искр, бой ровнее','Simpler: fewer shadows and sparks, smoother battles'):Lg('Всё красиво, даже если телефон устал','Full beauty, even if the phone is tired'))+'</p>';
    row.parentNode.insertBefore(d,row.nextSibling);
    var bs=d.querySelectorAll('[data-gfx]');for(var i=0;i<bs.length;i++)bs[i].onclick=function(){try{SND.click();}catch(e){}S.o2s=S.o2s||{g:0};S.o2s.g=+this.getAttribute('data-gfx');save();liteApply();
      try{STAT.ev('lite',{g:S.o2s.g,on:liteNow()?1:0,why:'set'});}catch(e){}openSettings();};
    try{if(typeof fitModal==='function')fitModal();}catch(e){}}

  return {off:off,go:go,curShow:show,curHide:hide,mgLoad:mgLoad,mgNeed:mgNeed,mgReady:function(){return mgSt===2||!window.SP_LAZY;},lite:liteNow,liteAuto:liteAuto,liteApply:liteApply};
})();
