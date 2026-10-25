'use strict';
/* zb3-KIOSK «Ларёк» — поздняя часть (BUILD 25.10, диета: вынесено из старта js/zb3-kiosk.js). Договор и поля S.z3s — шапка js/zb3-kiosk-x.js, журнал zina-boost3/Z3-KIOSK.md.
   Грузится: Z3.late с 5-го дня (Z3.OPEN.kiosk); раньше — сразу при запуске, если идёт подписка/Абонемент (Тихий час, 💡 в день) или S.lv ≥ 25 («Ять откроет слово»),
   при покупке подписки, при нажатии на ларёк. Здесь: 💡 подписчика в день, Тихий час, очки пропуска за уровни, «Ять» за ролик, бирка/строка двора, экран (js/zb3-kiosk-x.js). */
(function(){
  var Z=window.Z3,KI=window.Z3KIOSK;if(!Z||!KI||KI.go)return;
  var F=KI.F,K=KI.K,tk=KI.tk,sv=KI.sv,ev=KI.ev,has=KI.has,payOn=KI.payOn,PIG=KI.PIG,PS=KI.PS,P=KI.P,psSteps=KI.psSteps,psPaid=KI.psPaid,subOn=KI.sub,subTo=KI.subTo,THS=KI.THS;
  function thNew(){for(var i=0;i<THS.length;i++){var id='th_'+THS[i].id;try{if(has(id)&&!PAY.own(id))return THS[i];}catch(e){}}return null;}

  /* ---------- подписка: 💡 в день, без межэкранной ---------- */
  function daily(){if(!subOn())return;var z=K(),d=tk();if(!d||z.hd===d)return;z.hd=d;var hb=0;
    try{if(typeof hbAdd==='function'&&hbN()<HB_MAX){hbAdd(1,'sub');hb=1;}else addCoins(35,'gift');}catch(e){}sv();ev({a:'daily',hb:hb});
    txt().then(function(){try{toast(Z.txt('kiosk-daily')||(hb?'Почтальонка принесла «Вечёрку» — и 💡 подсказку к ней':'Почтальонка принесла «Вечёрку» и 35 монет: подсказок у тебя и так полно'),3200);}catch(e){}});}
  function wrapTiho(){var f=window.zbTiho;if(typeof f!=='function'||f.__z3s)return;var w=function(){return subOn()||f.apply(this,arguments);};w.__z3s=1;window.zbTiho=w;}
  if(F.sub)wrapTiho();

  /* ---------- сезонный пропуск: очки за уровни (когда ларёк открыт), готовые награды ---------- */
  function psReady(){if(!F.pass||!Z.open('kiosk'))return 0;var p=P(),s=psSteps();return Math.max(0,s-p.f)+(psPaid()?Math.max(0,s-p.g):0);}
  if(F.pass&&ZB.levelHook)ZB.levelHook.push(function(o){if(!o||!o.ok||!Z.open('kiosk'))return;var p=P(),s0=psSteps();p.p+=o.first&&!o.daily?PS.pts.first:PS.pts.lvl;
    if(psSteps()>s0)ev({a:'pass_step',s:psSteps(),b:psPaid()?1:0});sv();});

  /* ---------- «Ять откроет слово» за ролик (п.8): модуль js/zb3-kiosk-yat.js — лениво, с 26-го уровня; ролик только по кнопке ---------- */
  F.yat=Z.reg('z3s-yat',{t:'«Ять откроет слово» за ролик, когда застрял на трудном уровне',who:'KIOSK'});
  function yatX(){return ZB.load('js/zb3-kiosk-data.js').then(null,function(){}).then(function(){return ZB.load('js/zb3-kiosk-yat.js');});}
  function yatCore(){var C=window.Z3K;return !!(C&&C.onHard&&C.on&&C.on.hard);}
  function yatReg(){var C=window.Z3K;if(!F.yat||!yatCore()||C.onHard.__z3s)return;C.onHard.__z3s=1;
    C.onHard.push(function(box){try{if(!adsOk())return;}catch(e){return;}yatX().then(function(){if(window.Z3YAT)Z3YAT.onHard(box);},function(){});});}
  function yatSt(o){if(!F.yat||!o||window.Z3YAT||yatCore()||(+S.lv||0)<25||o.l<=25&&!o.daily)return;try{if(!adsOk())return;}catch(e){return;}
    yatX().then(null,function(){});}
  yatReg();
  if(F.yat&&ZB.startHook)ZB.startHook.push(yatSt);

  /* ---------- предмет двора и экран ---------- */
  function pigShow(){return F.pig&&has('kopilka');}
  function uzShow(){try{return has('starter')&&ZBECO.uzelokOn();}catch(e){return false;}}
  function dm(ms){var d=new Date(ms);return ('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2);}
  var X=null;function x(){if(!X)X=ZB.load('js/zb3-art-kiosk.js').then(null,function(){}).then(txt).then(function(){return ZB.load('js/zb3-kiosk-x.js');});return X;}
  function txt(){return ZB.load('js/zb3-kiosk-data.js').then(null,function(){});} // тексты ларька (TXT-FIX, tools/zb3_kiosk_data.py)
  var A={thNew:thNew,daily:daily,psReady:psReady,pigShow:pigShow,uzShow:uzShow,dm:dm,yatSt:yatSt,
    note:function(){var z=K();if(psReady())return 'награды сезона';if(subOn())return 'подписка до '+dm(subTo());if(uzShow())return 'узелок новичка';
      if(pigShow()&&z.pg>=PIG.min)return 'в копилке '+z.pg;if(payOn())return 'подписка и копилка';return window.ZB2FAIR?'ярмарка у ворот':'оформление';},
    badge:function(){var z=K();if(psReady()&&z.v!==tk())return '!';if(uzShow()&&z.u!==tk())return '!';if(pigShow()&&z.pg>=PIG.cap&&z.v!==tk())return '!';return '';},
    hot:function(){var z=K();return !!(uzShow()&&z.u!==tk());},
    go:function(from){x().then(function(){ZB.go('z3kiosk',{from:from||'yard'});},function(){try{toast('Ларёк не открылся — проверь интернет',2400);}catch(e){}});}};
  for(var k in A)KI[k]=A[k];

  Z.whenReady(function(){yatReg();if(F.sub)wrapTiho();KI.payList();});
  ZB.on('yard',function(){KI.payList();daily();});
  setTimeout(function(){KI.payList();daily();},3000);
})();
