/* SHR-0611 (06.11): межэкранная вне походов — флаг olad (выключить: ?bb2=-olad, BB2_OFF или пульт BB2.off('olad')).
   Повод — естественный переход в меню: вкладка нижнего меню (нажатие игрока) или закрытие окна, которое было открыто вне похода ≥ 8 с.
   Общий таймер — тот же ADV.last (любая реклама; показ сам ставит adMark), пауза OLAD_GAP мин (≥ ADV.gap). Никогда: в походе и на его входе/выходе
   (там свой путь interReady после итогов), в забаве, при открытом окне, на кнопке «за рекламу»/покупки, новичку (до победы в главе 1, до 3-го похода,
   в первый заход), в первые 3 мин захода (ADV.early), купившим «без рекламы»/«Дружинную грамоту», стендам ?bot|promo|shot. STAT olad {a:'try',s:t|m,w}.
   Журнал — hobby-analytics/release-i/shr-0611/SHR-1.md */
(function(){
  if(typeof BB2==='undefined'||/[?&](bot|promo|shot)\b/.test(location.search))return;
  var GAP=6,HOLD=4000,MOPEN=8000,DELAY=600,tBtn=0,tRun=0,tZab=0,mOpen=0,mKind='',mOut=false,pend=0;
  var SKIP=/^(result|win|lose|death|pause|level|chest|gift|login|today|tmrw|evutro|nv|prival|nechPause|nechRes|shop|grm|zab|b3sor)$/;
  function now(){return Date.now();}
  // пауза: пульт olad.gap (минут, 2–30; пульт приезжает позже старта — читаем каждый раз), иначе GAP
  function gap(){try{var g=BB2.pult?+BB2.pult('olad.gap',0):0;if(g>=2&&g<=30)return g;}catch(e){}return GAP;}
  function on(){try{return BB2.on('olad');}catch(e){return false;}}
  function busy(){try{if(typeof G!=='undefined'&&G)return true;if(BB2.going)return true;if(document.body.classList.contains('run'))return true;
    if(typeof ZAB!=='undefined'&&ZAB.cur)return true;if(document.getElementById('adLoad'))return true;
    var a=document.getElementById('ad');if(a&&a.classList.contains('on'))return true;
    var m=document.getElementById('modal');if(m&&m.classList.contains('on'))return true;
    if(typeof adBusy!=='undefined'&&adBusy||typeof adShowing!=='undefined'&&adShowing)return true;
    if(typeof PAY!=='undefined'&&PAY.busy)return true;}catch(e){return true;}return false;}
  // можно ли сейчас (как interPeek, но без длины похода и счёта походов захода — interReady не зовём, он считает походы)
  function ok(){var t=now();if(!on()||t-tBtn<HOLD||t-tRun<HOLD||t-tZab<HOLD)return false;
    try{if(typeof PAY!=='undefined'&&PAY.own('no_ads'))return false;if(BB2.grm&&BB2.grm.on())return false;
      if(!ADV.on||!S||!S.done||!S.done[0]||(S.runs|0)<Math.max(3,ADV.from)||!((S.soc&&+S.soc.ses||0)>=2))return false;
      if(ADV.last>t)adMark();
      if(t-ADV.t0<ADV.early||t-ADV.last<Math.max(gap(),ADV.gap)*60000)return false;
      return PLAT==='vk'?!!VK||(!VK_REAL&&LOCAL):!!ysdk||LOCAL;}catch(e){return false;}}
  function tryShow(src,what){if(pend||!ok())return;var tab=typeof curTab!=='undefined'?curTab:'';
    pend=setTimeout(function(){pend=0;if(busy()||(typeof curTab!=='undefined'&&curTab!==tab)||!ok())return;
      try{BB2.stat('olad',{a:'try',s:src,w:String(what||'').slice(0,16)});}catch(e){}
      showInterstitial(function(){try{if(typeof lateRe==='function')lateRe();}catch(e){}});},DELAY);}
  window.OLAD={gap:function(n){if(n>=2&&n<=30)GAP=n;return GAP;},ok:ok,st:function(){return {tBtn:tBtn,tRun:tRun,tZab:tZab,pend:!!pend,gap:gap(),ok:ok(),busy:busy()};}};
  // нажатия: «за рекламу»/покупка — пауза; вкладка нижнего меню (сменилась) — повод
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('button,a,[data-pay]'):null;if(!b)return;
    if(b.classList.contains('ad')||b.hasAttribute('data-pay')||/pay|buy|Pay|Buy|shop|Shop/.test(b.id||'')){tBtn=now();return;}
    var nv=b.closest('nav');if(nv&&b.dataset&&b.dataset.tab&&e.isTrusted!==false){var t0=typeof curTab!=='undefined'?curTab:'',t=b.dataset.tab;
      setTimeout(function(){if(t!==t0)tryShow('t',t);},0);}},true);
  // окна: открыто вне похода и висело ≥ 8 с → закрытие — повод
  BB2.hook('modal',function(kind){kind=kind||'';if(!mOpen||kind!==mKind){mOpen=now();mOut=!(typeof G!=='undefined'&&G);}mKind=kind||'';},90);
  var hM=window.hideModal;
  if(typeof hM==='function')window.hideModal=function(){var w=document.getElementById('modal'),o=w&&w.classList.contains('on'),r=hM.apply(this,arguments);
    if(o){if(mOut&&now()-mOpen>=MOPEN&&!SKIP.test(mKind)&&on())tryShow('m',mKind||'-');mOut=false;mOpen=0;mKind='';}return r;};
  // поход и забавы: метки времени (уход с итогов — свой путь interReady)
  BB2.hook('run',function(){tRun=now();},90);BB2.hook('end',function(){tRun=now();},90);BB2.hook('menu',function(){tRun=now();},90);
  if(typeof window.ZAB_CLOSE==='function'){var zc=window.ZAB_CLOSE;window.ZAB_CLOSE=function(){tZab=now();return zc.apply(this,arguments);};}
  else BB2.hook('late',function(){if(typeof window.ZAB_CLOSE==='function'&&!window.ZAB_CLOSE.olad){var zc=window.ZAB_CLOSE;window.ZAB_CLOSE=function(){tZab=now();return zc.apply(this,arguments);};window.ZAB_CLOSE.olad=1;}},90);
})();
