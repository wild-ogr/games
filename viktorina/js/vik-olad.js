/* vik-olad.js — SHR-0611 (06.11): межэкранная вне лестниц (флаг olad). Журнал — hobby-analytics/release-i/shr-0611/SHR-1.md.
   Прежнее правило не трогаем: межэкранная между лестницами — between() по кнопке окна итога (с 5-й лестницы, долг S.adW, AD_GAP от любой рекламы).
   Второй путь: естественный переход вне игры — кнопка нижней панели (нажатие игрока) или закрытие окна, открытого в разделе вне игры и висевшего ≥ 8 с.
   Условия: экран-раздел (главный, «Темы», двор, награды, доска, затеи-меню), нет лестницы/табло/затеи/окна/рекламы/покупки; с 5-й лестницы (S.games ≥ 4), со 2-го захода (ses2),
   не первые 3 мин захода, пауза GAP мин от ЛЮБОЙ рекламы (общий lastAdT; ≥ AD_GAP), не «без рекламы» (no_ads); 4 с после кнопки «за рекламу»/покупки,
   итога лестницы (between) и выхода из игры. Окно итога (класс res — party()) поводом не бывает. Долг S.adW показ второго пути НЕ гасит (правило лестниц как было).
   Выключить: ?off=olad, localStorage 'vik-olad-off'=1, флаг Яндекса olad=0|off; пауза — флаг olad_gap (2–30 мин). STAT ev olad {a:'try',s:t|m,w}. Отладка — VOLAD.st(). */
(function(){'use strict';
  var W=window,GAP=4,HOLD=4000,MOPEN=8000,DELAY=600,ON=true,t0=Date.now(),tBtn=0,tOut=0,mOpen=0,mOut=false,pend=0;
  try{if(/[?&]off=[^&#]*\bolad\b/.test(location.search)||localStorage.getItem('vik-olad-off')==='1')ON=false;}catch(e){}
  if(/[?&](demo|bot|shot)\b/.test(location.search))ON=false;
  function now(){return Date.now();}
  function $(id){return document.getElementById(id);}
  function scrOn(id){var e=$(id);return !!(e&&e.classList.contains('on'));}
  // экраны вне игры (разделы); лестница scr-game, табло scr-board и затеи (VMG) — игра
  var OUT=['scr-menu','scr-topics','scr-yard','scr-awards','scr-doska','scr-zatei'];
  function outScr(){for(var i=0;i<OUT.length;i++)if(scrOn(OUT[i]))return OUT[i];return '';}
  function busy(){try{if(typeof G!=='undefined'&&G)return true;if(typeof modalOn!=='undefined'&&modalOn)return true;
    if(!outScr()||scrOn('scr-game')||scrOn('scr-board'))return true;
    if(W.VMG&&VMG.REG&&VMG.REG.cur||$('vmgHost'))return true;   // затея на экране (VMG.isOpen — это «открыта навсегда», не то)
    var q=$('bdQ');if(q&&q.classList.contains('on'))return true;
    if(scrOn('adLd')||$('adLd')&&$('adLd').classList.contains('on'))return true;var a=$('ad');if(a&&a.classList.contains('on'))return true;
    if(typeof adBusy!=='undefined'&&adBusy)return true;if(typeof PAY!=='undefined'&&PAY.busy)return true;}catch(e){return true;}return false;}
  function gapMs(){var g=GAP*60000;try{if(typeof AD_GAP==='number'&&AD_GAP>g)g=AD_GAP;}catch(e){}return g;}
  function ok(){var t=now();if(!ON||t-tBtn<HOLD||t-tOut<HOLD||t-t0<180000)return false;
    try{if(typeof PAY!=='undefined'&&PAY.own('no_ads'))return false;
      if(!S||(S.games||0)<4||!(typeof ses2==='function'&&ses2()))return false;
      if(t-lastAdT<gapMs())return false;
      return typeof adOk==='function'&&adOk()&&!(PLAT==='vk'&&!VK&&VK_REAL);}catch(e){return false;}}
  function show(src,what){var w=S.adW||0;
    try{STAT.ev('olad',{a:'try',s:src,w:String(what||'').slice(0,16)});}catch(e){}
    var go=function(){showInterstitial(function(){try{if((S.adW||0)!==w){S.adW=w;save();}}catch(e){}});};   // долг лестниц не трогаем
    if(typeof adLoad==='function')adLoad(go);else go();}
  function tryShow(src,what){if(pend||!ok())return;var sc=outScr();
    pend=setTimeout(function(){pend=0;if(busy()||!ok()||src==='m'&&outScr()!==sc)return;show(src,what);},DELAY);}
  W.VOLAD={ok:ok,busy:busy,t0:function(v){if(typeof v==="number")t0=v;return t0;},st:function(){return {on:ON,gap:GAP,tBtn:tBtn,tOut:tOut,pend:!!pend,ok:ok(),busy:busy()};},gap:function(n){if(n>=2&&n<=30)GAP=n;return GAP;}};
  // нажатия: «за рекламу»/покупка — пауза; кнопка нижней панели — повод (после перехода)
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('button,a,[data-pay],[data-nav]'):null;if(!b)return;
    if(b.classList.contains('ad')||b.hasAttribute('data-pay')||/^(ad|pay|buy)|Ad$|Pay|Buy|Coin/.test(b.id||'')){tBtn=now();return;}
    var nv=b.getAttribute('data-nav');if(nv&&e.isTrusted!==false){if(/^(shop|coins)$/.test(nv)){tBtn=now();return;}setTimeout(function(){tryShow('t',nv);},0);}},true);
  // окна: открыто вне игры и висело ≥ 8 с → закрытие — повод (кроме итога: класс res)
  var mo=W.modal;if(typeof mo==='function')W.modal=function(){var was=typeof modalOn!=='undefined'&&modalOn;var r=mo.apply(this,arguments);
    if(!was){mOpen=now();mOut=!(typeof G!=='undefined'&&G)&&!!outScr()&&!scrOn('scr-game')&&!scrOn('scr-board');}return r;};
  var hm=W.hideModal;if(typeof hm==='function')W.hideModal=function(){var o=typeof modalOn!=='undefined'&&modalOn,c=$('mcard'),res=!!(c&&c.classList.contains('res'));
    var r=hm.apply(this,arguments);if(o){if(res)tOut=now();else if(mOut&&now()-mOpen>=MOPEN)tryShow('m','modal');mOut=false;mOpen=0;}return r;};
  // итог лестницы/табло (between) и уход из игры — метка времени: там свой путь
  var bw=W.between;if(typeof bw==='function')W.between=function(){tOut=now();return bw.apply(this,arguments);};
  if(W.UI&&UI.on)UI.on('show',function(id){if(id==='scr-game'||id==='scr-board')tOut=now();});
  // флаги Яндекса: olad=0|off — выключить, olad_gap — минут (2–30)
  var af=W.applyFlags;if(typeof af==='function')W.applyFlags=function(f){var r=af.apply(this,arguments);try{if(f&&typeof f==='object'){if(f.olad==='0'||f.olad==='off')ON=false;var n=parseInt(f.olad_gap,10);if(n>=2&&n<=30)GAP=n;}}catch(e){}return r;};
})();
