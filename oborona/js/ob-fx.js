'use strict';
/* FIX-OB 06.11 (v5.5): «Ярь» — флаг yar, поле S.o2y; межэкранная вне боя — флаг olad. Описание — CLAUDE.md «FIX-OB», журнал hobby-analytics/release-i/fix-0611/FIX-OB.md */
(function(){
  if(typeof OB2==='undefined')return;
  var ON=OB2.reg('yar',{s:'FIX-OB',t:'Ярь — 🔥-уровни ступенями после 3★'});
  if(!ON)return;
  OB2.field('y',{id:'yar',def:function(){return {r:{}};},fix:function(v){if(!v.r||typeof v.r!=='object'||Array.isArray(v.r))v.r={};for(var k in v.r)if(!/^\d+-\d$/.test(k)||!(v.r[k]>=0))delete v.r[k];}});
  var arm=null;   // {c,l} — следующий бой этого уровня в Яри
  function Y(){return S.o2y||(S.o2y={r:{}});}
  function rec(c,l){return +(Y().r||{})[c+'-'+l]||0;}
  function yarK(k){return 1+.15*k;}
  function open(c,l){return typeof difStars==='function'&&difStars(c,l,'h')>=3;}
  function total(){var n=0,r=Y().r||{};for(var k in r)n+=+r[k]||0;return n;}
  window.YAR={rec:rec,k:yarK,open:open,total:total,arm:function(c,l){arm=c==null?null:{c:c,l:l};},armed:function(){return arm;}};

  // бой: поверх 🔥 — здоровье нечисти по ступени (до STAT.lvl)
  var dA=window.difApply;
  if(typeof dA==='function')window.difApply=function(o){var r=dA.apply(this,arguments);
    try{if(arm&&G&&!G.endless&&!G.wk&&!G.rule&&!G.dly&&G.dif==='h'&&arm.c===G.ci&&arm.l===G.li&&open(G.ci,G.li)){G.yar=rec(G.ci,G.li)+1;G.hpK*=yarK(G.yar);}
      else arm=null;}catch(e){}
    return r;};
  var sM=window.statMode;
  if(typeof sM==='function')window.statMode=function(){if(G&&G.yar)return 'yar:'+G.yar;return sM.apply(this,arguments);};
  var tM=window.toMenu;
  if(typeof tM==='function')window.toMenu=function(){arm=null;return tM.apply(this,arguments);};

  // вступление уровня: кнопка «🔥 Ярь · ступень N»
  var oI=window.openIntro;
  if(typeof oI==='function')window.openIntro=function(c,l){arm=null;var r=oI.apply(this,arguments);
    try{if(typeof difOf==='function'&&difOf(c)==='h'&&open(c,l)){var bt=document.querySelector('#mBody .btns.stick'),bk=document.getElementById('backBtn');
      if(bt&&bk&&!document.getElementById('yarBtn')){var k=rec(c,l)+1,b=document.createElement('button');b.className='btn';b.id='yarBtn';
        b.innerHTML=Lg('🔥 Ярь · ступень ','🔥 Fury · step ')+k;bt.insertBefore(b,bk);
        var n=document.createElement('p');n.className='note';n.setAttribute('data-fit','2');n.style.margin='4px 2px 0';
        n.textContent=Lg('Ярь: тот же бой, нечисть крепче с каждой ступенью. Рекорд уровня — '+rec(c,l)+'.','Fury: the same battle, monsters get tougher with every step. Level record — '+rec(c,l)+'.');
        bt.parentNode.insertBefore(n,bt);
        b.onclick=function(){try{SND.click();}catch(e){}arm={c:c,l:l};try{STAT.ev('yar',{a:'go',l:(c+1)+'-'+(l+1),k:k});}catch(e){}startLevel(c,l);};
        if(typeof fitModal==='function')fitModal();}}}catch(e){}
    return r;};

  // конец боя: рекорд (END может прийти дважды после «ещё попытки» — максимум, надбавка только за новый рекорд)
  var last=null;
  OB2.on('end',function(g,win){last=null;if(!g||!g.yar)return;var c=g.ci,l=g.li,k=g.yar,p=rec(c,l);
    if(!win){last={c:c,l:l,k:k,win:0,p:p};return;}
    var bon=0;if(k>p){Y().r[c+'-'+l]=k;bon=Math.round(winGold(c,l,3,false)*DIF.h.gold*.1*Math.min(10,k));S.gold+=bon;try{ern('lvl',bon);}catch(e){}
      try{STAT.ev('yar',{a:'up',l:(c+1)+'-'+(l+1),k:k});}catch(e){}try{save();}catch(e){}}
    last={c:c,l:l,k:k,win:1,p:p,bon:bon};},'yar');

  // строка в окне итогов (одна на окно — у Яри приоритет выше наказов)
  OB2.slot('win','yar',function(g,win){
    if(g&&g.yar&&last&&last.c===g.ci&&last.l===g.li){var L=last;
      if(!L.win)return {h:'🔥 '+Lg('Ярь, ступень '+L.k+' не взята. «Начать заново» — снова ступень '+L.k+'.','Fury step '+L.k+' not taken. “Restart” — step '+L.k+' again.')};
      return {h:'<span>🔥 '+Lg('Ярь: ступень '+L.k+' взята!','Fury: step '+L.k+' taken!')+(L.bon?' '+Lg('Рекорд: +','Record: +')+fmtGold(L.bon):'')+'</span> <button class="btn gold" id="yarNext" style="padding:6px 14px;min-height:44px">'+Lg('Ступень ','Step ')+(L.k+1)+' ▸</button>',
        bind:function(d){d.setAttribute('data-fit','6');var b=d.querySelector('#yarNext');if(b)b.onclick=function(){try{SND.click();}catch(e){}var c=L.c,l=L.l;arm={c:c,l:l};
          try{STAT.ev('yar',{a:'go',l:(c+1)+'-'+(l+1),k:L.k+1,f:'win'});}catch(e){}
          (typeof afterAd==='function'?afterAd:function(o,f){f();})(true,function(){startLevel(c,l);});};}};}
    // первый раз: 🔥 на 3★ — сказать, что открылась Ярь
    if(win&&g&&g.dif==='h'&&!g.yar&&!g.endless&&!g.wk&&!g.rule&&!g.dly&&open(g.ci,g.li)&&!Y().u){Y().u=1;try{save();}catch(e){}
      return {h:'🔥 '+Lg('Открыта Ярь! Уровни, взятые на 🔥 с тремя ★, можно проходить дальше — ступенями, всё труднее. Кнопка — во вступлении уровня.','Fury unlocked! Levels taken on 🔥 with three ★ go on — step by step, ever harder. The button is in the level intro.')};}
    return null;},70);
})();
(function(){
  if(typeof OB2==='undefined'||!OB2.reg('olad',{s:'FIX-OB',t:'межэкранная на переходах вне боя (общий таймер interReady)'}))return;
  if(/[?&](bot|shot)\b/.test(location.search))return;
  var HOLD=4000,MOPEN=8000,DELAY=600,tBtn=0,tBattle=0,tMg=0,mOpen=0,mKind='',mOut=false,pend=0;
  function now(){return Date.now();}
  function busy(){try{if(typeof G!=='undefined'&&G)return true;if(document.getElementById('adLoad')||document.getElementById('olLoad'))return true;
    var m=document.getElementById('modal');if(m&&m.classList.contains('on'))return true;
    if(typeof MG!=='undefined'&&MG.cur)return true;if(typeof PAY!=='undefined'&&PAY.busy)return true;
    var c=document.getElementById('spCur');if(c&&c.style.display!=='none'&&c.className!=='out')return true;}catch(e){return true;}return false;}
  function okUser(){var t=now();if(t-tBtn<HOLD||t-tBattle<HOLD||t-tMg<HOLD)return false;
    if(!((+(S.soc&&S.soc.ses)||0)>=2))return false;if((S.wins||0)<20)return false;
    return typeof interReady==='function'&&interReady();}
  window.OLAD={st:function(){return {tBtn:tBtn,tBattle:tBattle,tMg:tMg,pend:!!pend,now:now()};}};
  function tryShow(src,what){if(pend||!okUser())return;var tab=typeof curTab!=='undefined'?curTab:'';
    pend=setTimeout(function(){pend=0;if(busy()||(typeof curTab!=='undefined'&&curTab!==tab)||!okUser())return;
      try{STAT.ev('olad',{a:'try',s:src,w:String(what||'').slice(0,16)});}catch(e){}
      var d=null;try{d=document.createElement('div');d.id='olLoad';d.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:9998;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.6);color:#fff;font:600 20px/1.2 sans-serif;text-align:center';
        d.innerHTML=Lg('Загрузка…','Loading…')+'<small style="font-size:14px;font-weight:400;opacity:.8;margin-top:8px">'+Lg('реклама через секунду','ad in a second')+'</small>';document.body.appendChild(d);}catch(e){}
      setTimeout(function(){try{if(d)d.remove();}catch(e){}if(busy()||!interReady())return;showInterstitial(function(){});},1000);},DELAY);}
  // нажатия: кнопка «за рекламу»/покупки — пауза; вкладка нижнего меню — повод
  document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('button,a,[data-pay]'):null;if(!b)return;
    if(b.classList.contains('ad')||b.hasAttribute('data-pay')||/pay|buy|Pay|Buy/.test(b.id||'')){tBtn=now();return;}
    var nv=b.closest('nav');if(nv&&b.dataset&&b.dataset.tab&&e.isTrusted!==false){var t=b.dataset.tab;setTimeout(function(){tryShow('t',t);},0);}},true);
  // окна: открыто вне боя и висело ≥8 с → закрытие — повод
  var sM=window.showModal,hM=window.hideModal;
  if(typeof sM==='function')window.showModal=function(h,kind){var on=document.getElementById('modal');if(!(on&&on.classList.contains('on'))){mOpen=now();mOut=!(typeof G!=='undefined'&&G);}mKind=kind||'';return sM.apply(this,arguments);};
  if(typeof hM==='function')window.hideModal=function(){var was=document.getElementById('modal'),o=was&&was.classList.contains('on'),r=hM.apply(this,arguments);
    if(o&&mOut&&now()-mOpen>=MOPEN&&!/^(intro|win|lose|pause|res)$/.test(mKind))tryShow('m',mKind);mOut=false;return r;};
  // бой и мини-игры: метки времени (уход с итогов — свой путь afterAd)
  OB2.on('run',function(){tBattle=now();},'olad');OB2.on('end',function(){tBattle=now();},'olad');
  var tM=window.toMenu;if(typeof tM==='function')window.toMenu=function(){tBattle=now();return tM.apply(this,arguments);};
  var mc=window.MG_CLOSE;if(typeof mc==='function')window.MG_CLOSE=function(){tMg=now();return mc.apply(this,arguments);};
})();
