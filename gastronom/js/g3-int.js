'use strict';
/* ================= g3-int — межэкранная ВНЕ уровня (Гастроном 3.0, поток П4; правило SHR-0611 / план 4.6, решение 8) =================
   Общий модуль js/shr-rekl.js (один текст во всех играх серии, копия из Кирпичиков shr0611) грузится СЛЕДОМ и берёт переходник
   window.SHR_A отсюда. Когда: смена раздела вне уровня (главный ↔ Путь/Подсобка/Дефицит/Отделы/Обстановка…) или закрытие окна вне
   уровня, раздел/окно было открыто ≥ 8 с; ≥ 3 мин с ЛЮБОЙ рекламы (lastAdT) и не в первые 3 мин после запуска (adReady → INT_BOOT);
   не новичку (меньше 10 уровней или 1-й заход), не «без рекламы», не в уровне и не в мини-игре, не на кнопке «за рекламу»/покупки.
   Показ — тем же путём, что по «Дальше»: тост «Реклама через секунду…» → showInterstitial (lastAdT, S.adW=0 — общий счёт).
   Флаг: ?off=g3 / ?off=g3.int (G3) или ?off=shr. STAT: ev shr {a:'try',k,s}; сам показ — ad int … c w:'scr' (общий модуль). */
(function(){
  if(!window.G3||!G3.on('int')){window.SHR_CFG={on:0};return;}
  function $(i){return document.getElementById(i);}
  function on(id){var e=$(id);return !!(e&&e.classList.contains('on'));}
  function inGame(){return on('scr-game')||!!(window.GMG&&GMG.REG&&GMG.REG.cur);}
  function busy(){try{return !!(modalOn||adBusy||paused||(typeof PAY!=='undefined'&&PAY.busy)||document.hidden||on('ad')||(typeof adWaitOn==='function'&&adWaitOn()));}catch(e){return true;}}
  window.SHR_A={inGame:inGame,busy:busy,
    ok:function(){try{if(typeof PAY!=='undefined'&&PAY.own('no_ads'))return 'noads';if((S.levelsDone||0)<10||(S.unlocked||1)<=AD_FROM)return 'new';
      if(typeof ses2==='function'&&!ses2())return 'ses1';if(G3.isNew()&&G3.day()<2)return 'new';return '';}catch(e){return 'err';}},
    ready:function(){try{return adReady()&&intOk();}catch(e){return false;}},
    last:function(){try{return lastAdT;}catch(e){return Date.now();}},
    show:function(){var s0=window.SHR&&SHR.cur?SHR.cur():'';
      try{toast(typeof L==='function'?L('Реклама через секунду…','Ad in a second…'):'Реклама через секунду…',1200);}catch(e){}
      setTimeout(function(){if(inGame()||busy()||(window.SHR&&SHR.cur&&SHR.cur()!==s0)){if(window.SHR)SHR.cancel();return;}
        G3.mark('int','show');try{showInterstitial(function(){});}catch(e){if(window.SHR)SHR.cancel();}},1000);},
    modals:['#modal'],
    skip:['coins','settings','social','torg','mtm','cert','ladder','game'],
    btn:(typeof AD_BTN_SEL!=='undefined'?AD_BTN_SEL+',':'')+'.buy,[data-pid],[data-buy],[data-rm]'};
})();
