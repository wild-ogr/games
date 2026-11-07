/* «Оборона 3.0» в1 — js/o3-tropa.js. Хозяин: поток П3 (O3-COMMON.md, журнал hobby-analytics/release-i/boost3-oborona/O3-П3.md). Каркас O3 — js/o3-hero.js § П0.
   «Тропа Кощея» (флаг tropa): поход по землям CH_ORDER на ОДНОЙ карте (genMap по зерну похода), каждые 3 волны — следующая земля (нечисть и вид земли),
   жизни не лечатся, заставы остаются. После каждой 3-й волны — передышка: 3 узелка на дороге, касание одного — гостинец до конца похода.
   Меченая нечисть (огненный, щитоносец, богатый, вредный) — только тут. Рекорд «дальше всех» — S.o2t.b (волн отбито). «Ещё попытка» за ролик — раз за поход.
   «Тропа недели» — зерно = номер недели (карта и волны у всех одни), земли — CH_DLY() (11 прежних, у всех одинаково); Слава за неё идёт в недельную Славу → лига «Соседние заставы».
   Устройство: бой — обычная осада newBattle({endless:true}) + G.o3t; обёртки endlessMap/endlessWave/difApply/statLv/startEndless/spellCd/openPause (без правок game.js),
   итог — TRP.end из onBattleEnd (одна строка «o3:П3» в ui.js). G.week=1 — чтобы кубок (ob-cup runMode) не принял поход за осаду: рекорды и таблица endless не трогаются.
   Случайность боя (rand/Math.random, G.bub) НЕ трогаем: волны — mulberry(зерно похода), метки и узелки — O3.rnd/O3.pick. Загружается по требованию (вход — o3-ui.js § П3-вход). */
var TRP=(function(){'use strict';   // o3:FIX строгий режим — только Тропе (ниже в файле ленивая часть 3.0, она писалась без него)
  var PER=3,ID='tropa',pend=null;
  // гостинцы: k — id, n — подпись на узелке, c — цвет узелка, m — потолок (сколько раз можно взять)
  var GIFTS=[
    {k:'hp',n:Lg('+3 ❤','+3 ❤'),d:Lg('+3 жизни','+3 lives'),c:'#d8443a',m:99},
    {k:'fire',n:Lg('Огонь','Fire'),d:Lg('пушки поджигают','cannons set fire'),c:'#ef7a1e',m:2},
    {k:'rng',n:Lg('Дальнобой','Reach'),d:Lg('стрельцы бьют на 15 % дальше','archers shoot 15% farther'),c:'#3f8f3a',m:2},
    {k:'coin',n:Lg('Монеты','Coins'),d:Lg('монет за нечисть +25 %','+25% coins per kill'),c:'#d7a21c',m:2},
    {k:'spell',n:Lg('Чары','Spells'),d:Lg('чары готовы быстрее','spells recharge faster'),c:'#6a5ad8',m:2},
    {k:'hero',n:Lg('Богатырь','Hero'),d:Lg('богатырь сильнее на 30 %','hero 30% stronger'),c:'#2f7fc8',m:2}];
  var MARKS={fire:{c:'#ff7a1e',s:'🔥',n:Lg('Огненный','Fiery')},shield:{c:'#5aa8ff',s:'🛡',n:Lg('Щитоносец','Shield-bearer')},
    rich:{c:'#ffd23a',s:'★',n:Lg('Богатый','Rich')},fast:{c:'#ff4a6a',s:'»',n:Lg('Вредный','Spiteful')}};
  function T(){var t=S.o2t;if(!t||typeof t!=='object')t=S.o2t={b:0,n:0};return t;}
  function lands(wk){return wk?CH_DLY():CH_ORDER.filter(function(c){return !!CH[c];});}
  function landCi(o,w){return o.L[Math.floor(w/PER)%o.L.length];}
  // «земля·волна» по числу отбитых волн: где стоял, когда нечисть прорвалась
  function zw(waves){return {z:Math.floor(waves/PER)+1,w:waves%PER+1};}
  function zwTxt(waves){var p=zw(waves);return Lg('земля '+p.z+' · волна '+p.w,'land '+p.z+' · wave '+p.w);}
  function H(){return typeof O3H==='object'&&O3H&&O3H.hero;}

  /* ---------- старт похода ---------- */
  function start(wk){if(!O3.on(ID)||!(typeof O3TR==='object'&&O3TR.open()))return;
    hideModal();if(G&&!G.win&&!G.over){boostRefund(.5);save();}
    pend=mkPend(wk);try{newBattle({endless:true,ci:2});}finally{pend=null;}
    if(!G||!G.o3t)return;enterBattle();
    var t=T(),b=G.o3t.b0;
    voice((wk?Lg('Тропа недели — одна на всю Русь! ','Trail of the week — the same for all of Rus! '):Lg('Тропа Кощея! ','Koschei’s Trail! '))+
      Lg('Каждые 3 волны — новая земля, жизни не лечатся. После земли бери гостинец с дороги.','Every 3 waves — a new land, lives don’t heal. After each land grab a gift from the road.')+
      (b?Lg(' Дальше всех: ',' Farthest: ')+zwTxt(b)+'.':''),VOEV(),'voevoda',8);
    O3.ev('tropa',{k:'go',z:0,w:0,g:wk?'wk':'',n:t.n|0});}
  /* «Застава царя» (M50): прежняя осада (карта, волны, рекорд S.endBest, таблица endless, итог — как были) + узелки каждые 10 волн и меченые. Вход — startEndless (o3-ui.js) */
  function tsar(){hideModal();if(G&&!G.win&&!G.over){boostRefund(.5);save();}
    pend={ts:1};try{newBattle({endless:true,ci:2});}finally{pend=null;}if(!G)return;enterBattle();
    voice(Lg('Застава царя! Осада как прежде, а каждые 10 волн — узелки с гостинцами. Рекорд осады — тот же.','The Tsar’s Outpost! The siege as before, but every 10 waves — bundles with gifts. The siege record stays the same.'),VOEV(),'voevoda',7);
    O3.ev('tropa',{k:'go',z:0,w:0,g:'ts'});}

  function mkPend(wk,sd){var wn=wk?weekNo():0,seed=sd||(wk?(wn*7919)%90000+3000:(Math.floor(Date.now()/1000)%90000)+3000),R=mulberry(seed*13+5);
    return {wk:wn,seed:seed,river:R()<.5,side:R()<.5,L:lands(wk)};}
  // стенд: поход ботом (?bot): TRP.bot(wk,{max:секунд,cont,seed}) — узелок берёт сам (первый)
  function bot(wk,opt){opt=opt||{};pend=wk==='ts'?{ts:1}:mkPend(wk,opt.seed);window.__trBot=1;try{var r=window.bot(0,0,{endless:true,max:opt.max||4000,cont:opt.cont});
      r.gifts=G&&G.o3t?JSON.stringify(G.o3t.gf):'';r.zw=G?zwTxt(Math.max(0,G.wave-1)):'';r.marks=G&&G.o3t?G.o3t.mkN|0:0;return r;}finally{pend=null;window.__trBot=0;}}
  /* ---------- обёртки движка (без правок game.js) ---------- */
  var eMap=endlessMap;endlessMap=function(){if(pend&&!pend.ts)return genMap(pend.seed,{minLen:32,maxLen:40,spots:13,river:pend.river,side:pend.side});return eMap.apply(this,arguments);};
  var dA=difApply;difApply=function(o){var r=dA.apply(this,arguments);
    if(pend&&G&&pend.ts)G.o3t={ts:1,gw:0,bd:null,gT:0,gf:{},gn:0,lw:0,mk:{}};
    else if(pend&&G){var t=T();G.o3t={wk:pend.wk,seed:pend.seed,L:pend.L,b0:pend.wk?(t.w===pend.wk?t.wb|0:0):t.b|0,gw:0,bd:null,gT:0,gf:{},gn:0,lw:0,mk:{}};
      G.week=1;G.theme=CH[pend.L[0]]||G.theme;}return r;};
  var sLv=statLv;statLv=function(){if(G&&G.o3t&&!G.o3t.ts)return G.o3t.wk?'tropaw':'tropa';return sLv.apply(this,arguments);};
  var eW=endlessWave;endlessWave=function(w){if(G&&G.o3t&&!G.o3t.ts)return wave(w);return eW.apply(this,arguments);};
  var sE=startEndless;startEndless=function(){if(G&&G.o3t)return G.o3t.ts?tsar():start(!!G.o3t.wk);return sE.apply(this,arguments);};   // «Начать заново» в паузе
  var sCd=spellCd;spellCd=function(k){var v=sCd.apply(this,arguments),n=G&&G.o3t&&O3.on(ID)?G.o3t.gf.spell|0:0;return n?v*Math.pow(.85,n):v;};
  var oP=openPause;openPause=function(){var r=oP.apply(this,arguments);try{if(G&&G.o3t&&O3.on(ID)){var m=$('mBody'),tg=m&&m.querySelector('.tg');
    if(tg)tg.insertAdjacentHTML('beforebegin','<p class="sub" style="margin:0 0 6px;color:#ffe7a0">'+pauseTxt()+'</p>');}}catch(x){O3.err('tropa/pause',x);}return r;};
  function pauseTxt(){var o=G.o3t;if(o.ts)return Lg('Застава царя','The Tsar’s Outpost')+(giftTxt(o)?'<br>'+Lg('Гостинцы: ','Gifts: ')+giftTxt(o):'');var ci=landCi(o,Math.max(0,G.wave-1)),a=[];
    return (o.wk?Lg('Тропа недели','Trail of the week'):Lg('Тропа Кощея','Koschei’s Trail'))+' · '+Lg('земля ','land ')+(Math.floor(Math.max(0,G.wave-1)/PER)+1)+': '+CH[ci].name+
      (giftTxt(o)?'<br>'+Lg('Гостинцы: ','Gifts: ')+giftTxt(o):'');}
  function giftTxt(o){var a=[];for(var i=0;i<GIFTS.length;i++){var n=o.gf[GIFTS[i].k]|0;if(n)a.push(GIFTS[i].d+(n>1?' ×'+n:''));}return a.join(', ');}
  // Слава за поход: волны + 2 за каждую сверх своего рекорда (как осада); src 'tropa' — недельная Слава → «Соседние заставы». Рекорд осады недели (w.sb) не трогаем.
  (function(){var m=null;for(var i=0;i<META_MODS.length;i++)if(META_MODS[i].id==='slava')m=META_MODS[i];if(!m||typeof m.END!=='function')return;var e0=m.END;
    m.END=function(g,win){if(!(g&&g.o3t)||g.o3t.ts)return e0.apply(this,arguments);
      try{var P=g.slP||(g.slP={v:0}),wv=Math.max(0,g.wave-1),v=wv+2*Math.max(0,wv-g.o3t.b0),add=v-P.v;if(add>0&&typeof SLAVA_ADD==='function'){P.v=v;SLAVA_ADD(add,g.o3t.wk?'tropaw':'tropa');}
        if(typeof slQuestChk==='function')slQuestChk();}catch(x){O3.err('tropa/slava',x);}};})();

  /* ---------- волны похода: нечисть земли, сила как в осаде; составы — по зерну похода (Тропа недели — у всех одинаковые) ---------- */
  function wave(w){var o=G.o3t,ci=landCi(o,w),en=CH[ci].en,R0=mulberry(o.seed*31+w*7+1),k=w%PER;
    var hpm=.9*Math.pow(1.1,w),B=150*(1+.2*Math.min(w,30)),g=[];
    var main=k===0?en[0]:en[Math.floor(R0()*en.length)],two=w>=2&&k!==0;
    g.push({t:main,n:cnt(main,B*(two?.62:1)),iv:spacing(main)*.9,delay:0});
    if(two){var rest=en.filter(function(x){return x!==main;});if(rest.length){var t2=rest[Math.floor(R0()*rest.length)];g.push({t:t2,n:cnt(t2,B*.42),iv:spacing(t2),delay:4});}}
    // босс — в последней волне каждой третьей земли (волны 9, 18, 27… — как в осаде раз в 10); у новых земель — босс из прежних 8 (как в осаде и «Заставе дня»)
    var boss=w%(PER*3)===PER*3-1;if(boss)g.push({t:ci<CH_OLD?CH[ci].boss:CH[Math.floor(w/(PER*3))%CH_OLD].boss,n:1,iv:1,delay:6,hpm:hpm*.8});
    return {g:g,hpm:hpm,name:boss?Lg('Босс земли!','Land boss!'):pick2(R0,WAVE_NAMES[main]||WAVE_NAMES.mix),path:w};}

  /* ---------- кадр: новая земля, узелки, меченые ---------- */
  O3.hook('frame',ID,function(dt,g){var o=g&&g.o3t;if(!o||g.over)return;
    // новая земля: вид и плашка
    var per=o.ts?10:PER;
    if(g.wave!==o.lw){o.lw=g.wave;if(!o.ts&&g.wave>1&&(g.wave-1)%PER===0){var ci=landCi(o,g.wave-1),z=Math.floor((g.wave-1)/PER)+1;g.theme=CH[ci];try{renderBg();}catch(x){}
        g.banner={title:Lg('Земля ','Land ')+z+': '+CH[ci].name,sub:CH[ci].sub||'',t:0};}
      if(o.bd){o.bd=null;}}   // узелки не взяты до волны — ушли
    // передышка после каждой 3-й волны: 3 узелка
    if(g.wave>0&&g.wave%per===0&&o.gw!==g.wave&&!g.spawning.length&&g.nextT>0){o.gw=g.wave;mkBundles(o);}
    if(o.bd&&window.__trBot)take(o,o.bd[0]);
    if(o.bd){o.gT+=dt;if(o.gT<20&&g.nextT>0&&g.nextT<4)g.nextT=4;}   // подождать выбора (до 20 с), дальше волна идёт сама
    // меченые
    for(var i=0;i<g.en.length;i++){var e=g.en[i];if(e.dead)continue;
      if(!e.o3c){e.o3c=1;markMaybe(o,g,e);}
      if(e.o3m==='fire'){e.o3f=(e.o3f||2)-dt;if(e.o3f<=0){e.o3f=5;var ts=towersNear(e.x,e.y,110);if(ts.length){var tw=O3.pick(ts);tw.stunT=Math.max(tw.stunT||0,2);tw.burnFx=2;}}}
      else if(e.o3m==='shield'){for(var j=0;j<g.en.length;j++){var x=g.en[j];if(x===e||x.dead||(x.x-e.x)*(x.x-e.x)+(x.y-e.y)*(x.y-e.y)>70*70)continue;
          if(x.o3a==null)x.o3a=x.armor;x.armor=Math.min(.6,x.o3a+.3);x.o3s=.3;}}
      else if(e.o3m==='fast'&&!e.o3q&&e.hp<e.max/2){e.o3q=1;e.spd*=1.45;try{sparkle(e.x,e.y-10,'#ff4a6a',6);}catch(x){}}
      if(e.o3s>0){e.o3s-=dt;if(e.o3s<=0&&e.o3a!=null){e.armor=e.o3a;e.o3a=null;}}}});
  function markMaybe(o,g,e){var per=o.ts?5:PER;if(e.boss||e.lead||g.wave<=per||e.type==='egg')return;var z=Math.floor((g.wave-1)/per),n=o.mk[g.wave]|0;
    if(n>=Math.min(4,1+Math.floor(z/3)))return;var r=rn(o);if(r()>.05+.01*Math.min(z,10))return;
    o.mk[g.wave]=n+1;o.mkN=(o.mkN|0)+1;e.o3m=['fire','shield','rich','fast'][Math.floor(r()*4)];}
  // своя ГСЧ меток и узелков: в «Тропе недели» — от зерна недели (у всех одинаково), иначе O3.rnd
  function rn(o){if(!o.wk)return O3.rnd;if(!o.R)o.R=mulberry(o.seed*17+3);return o.R;}
  function mkBundles(o){var av=GIFTS.filter(function(x){return (o.gf[x.k]|0)<x.m&&(x.k!=='hero'||H());}),pk=[];
    var r=rn(o);while(pk.length<3&&av.length){var i=Math.floor(r()*av.length);pk.push(av.splice(i,1)[0]);}
    var P=G.map.paths[0],L=P.len||((P.xs.length-1)*STEP),fr=[.42,.58,.74],b=[];
    for(var j=0;j<pk.length;j++){var p=pathPos(0,L*fr[j]);b.push({x:p.x,y:p.y,g:pk[j]});}
    o.bd=b;o.gT=0;try{O3.say(b[1]?b[1].x:b[0].x,(b[1]?b[1].y:b[0].y)-30,Lg('Узелки на дороге — бери один!','Bundles on the road — take one!'),4);}catch(x){}}
  // касание узелка — гостинец (true — касание съедено, место под заставу не открывается)
  O3.hook('tap',ID,function(p){var o=G&&G.o3t;if(!o||!o.bd)return false;var r=Math.max(30,28/VIEW.s);
    for(var i=0;i<o.bd.length;i++){var b=o.bd[i];if((b.x-p.x)*(b.x-p.x)+(b.y-12-p.y)*(b.y-12-p.y)<r*r){take(o,b);return true;}}return false;});
  function take(o,b){var k=b.g.k;o.gf[k]=(o.gf[k]|0)+1;o.gn++;o.bd=null;
    if(k==='hp'){G.lives+=3;G.maxLives+=3;}
    if(k==='fire'||k==='rng')refreshTowerStats();
    if(k==='hero'){G.o3hk=Math.pow(1.3,o.gf.hero);if(window.O3H)O3H.buf=G.o3hk;}   // договор с П1: сила богатыря × (G.o3hk||1)
    try{SND.coin();sparkle(b.x,b.y-14,'#ffd84a',16);addNum(b.x,b.y-30,b.g.d,'#ffe7a0');}catch(x){}
    O3.ev('tropa',{k:'gift',z:o.ts?-1:Math.floor(G.wave/PER),w:G.wave,g:k});}
  // свойства застав от гостинцев: пушки поджигают, стрельцы дальше
  O3.hook('st',ID,function(st,type){var o=G&&G.o3t;if(!o||!st)return;
    if(type==='pushka'&&o.gf.fire)st.fire=Math.max(st.fire||0,(st.dmg||0)*.25*o.gf.fire);
    if(type==='arch'&&o.gf.rng&&st.rng)st.rng*=1+.15*o.gf.rng;});
  // монеты: гостинец +25 %, богатый меченый — ×3 (та же формула, что killEnemy в осаде)
  O3.hook('kill',ID,function(e){var o=G&&G.o3t;if(!o||!e||!e.gold)return;var base=e.gold*2*(1+G.wave*.03),k=.25*(o.gf.coin|0)+(e.o3m==='rich'?2:0),v=Math.round(base*k);
    if(v>0){G.coins+=v;G.earned+=v;if(e.o3m==='rich')try{addNum(e.x,e.y-(e.r||12)-22,'+'+v,'#ffd23a');sparkle(e.x,e.y,'#ffd23a',10);}catch(x){}}});

  /* ---------- рисунок: узелки и метки (мировые координаты) ---------- */
  O3.hook('draw',ID,function(c,g){var o=g&&g.o3t;if(!o)return;var t=g.t||0;
    for(var i=0;i<g.en.length;i++){var e=g.en[i];if(e.dead||!e.o3m)continue;var M=MARKS[e.o3m],rr2=(e.r||12)+5;
      c.save();c.globalAlpha=.75+.25*Math.sin(t*6+i);c.strokeStyle=M.c;c.lineWidth=3;c.beginPath();c.ellipse(e.x,e.y+2,rr2,rr2*.45,0,0,TAU);c.stroke();
      c.globalAlpha=1;c.font=cvF(900,14);c.textAlign='center';c.textBaseline='middle';c.fillStyle=M.c;c.strokeStyle='#1a1208';c.lineWidth=3;
      var y=e.y-(e.r||12)*2.1-6;c.strokeText(M.s,e.x,y);c.fillText(M.s,e.x,y);c.restore();}
    if(!o.bd)return;var R=Math.max(22,26/VIEW.s),fs=Math.max(14,16/VIEW.s);
    for(var j=0;j<o.bd.length;j++){var b=o.bd[j],bob=Math.sin(t*3+j*2)*2.5,x=b.x,y=b.y-12+bob;
      c.save();glowDot(c,x,y,R*1.7,'#ffe7a0',.45+.2*Math.sin(t*4+j));
      // узелок: мешочек, перевязь, ушки
      c.fillStyle=b.g.c;c.strokeStyle='#3b2410';c.lineWidth=2.5;c.beginPath();c.ellipse(x,y+R*.15,R*.85,R*.72,0,0,TAU);c.fill();c.stroke();
      c.beginPath();c.moveTo(x-R*.35,y-R*.45);c.lineTo(x-R*.75,y-R*1.05);c.lineTo(x-R*.05,y-R*.62);c.closePath();c.fill();c.stroke();
      c.beginPath();c.moveTo(x+R*.35,y-R*.45);c.lineTo(x+R*.75,y-R*1.05);c.lineTo(x+R*.05,y-R*.62);c.closePath();c.fill();c.stroke();
      c.fillStyle='#f3e2b0';c.beginPath();c.ellipse(x,y-R*.5,R*.32,R*.16,0,0,TAU);c.fill();c.stroke();
      c.fillStyle='rgba(255,255,255,.35)';for(var q=0;q<3;q++){c.beginPath();c.arc(x-R*.35+q*R*.35,y+R*.2+(q%2)*R*.18,R*.09,0,TAU);c.fill();}
      c.font=cvF(900,fs);c.textAlign='center';c.textBaseline='top';c.lineWidth=4;c.strokeStyle='#1a1208';c.fillStyle='#fff3c8';
      c.strokeText(b.g.n,x,y+R*.95);c.fillText(b.g.n,x,y+R*.95);c.restore();}});

  /* ---------- итог похода (зовётся из onBattleEnd, ui.js «o3:П3»; после «ещё попытки» — второй раз, считаем приростом) ---------- */
  function end(dq0){var g=G,o=g.o3t,P=g.paid,waves=Math.max(0,g.wave-1),t=T(),rec=waves>o.b0&&waves>0;
    if(P.n===1)t.n=(t.n|0)+1;t.b=Math.max(t.b|0,waves);if(o.wk){if(t.w!==o.wk){t.w=o.wk;t.wb=0;}t.wb=Math.max(t.wb|0,waves);}
    var total=Math.round(siegeGold(waves)*(g.sgK||1)),reward=total-(P.gold||0);P.gold=total;   // золото — как осада (и тот же дневной счёт забегов sgK)
    S.gold+=reward;ern('lvl',reward);boostRefund(1);var sbst=Math.min(120,5*waves)-Math.min(120,5*(P.waves||0));boostAdd(sbst);P.waves=waves;g.win=true;save();
    var p=zw(waves);O3.ev('tropa',{k:'end',z:p.z,w:p.w,g:o.gn,wv:waves,r:rec?1:0,n:o.wk?1:0,c:P.n>1?1:0});
    var cont=!g.contUsed&&!g.quit&&g.wave>=2&&adOk(),best=o.wk?t.wb:t.b,ttl=o.wk?Lg('Тропа недели','Trail of the week'):Lg('Тропа Кощея','Koschei’s Trail');
    showModal('<h3>'+ttl+'</h3><p class="sub">'+(rec?Lg('🏆 Дальше всех! Летописец записал.','🏆 Your farthest! The chronicler wrote it down.'):Lg('Нечисть прорвалась. Тропа ждёт — завтра пройдём дальше.','The monsters broke through. The trail awaits — next time we go farther.'))+'</p>'+
      '<div class="stats"><div><b>'+zw(waves).z+'·'+zw(waves).w+'</b>'+Lg('земля·волна','land·wave')+'</div><div><b>'+zw(best).z+'·'+zw(best).w+'</b>'+Lg('дальше всех','farthest')+'</div><div><b>'+o.gn+'</b>'+Lg('гостинцев','gifts')+'</div></div>'+
      '<div class="card treasury" style="text-align:center"><b>+'+fmtGold(total)+'</b>'+(P.n>1?'<br><span style="font-size:16px">'+Lg('за весь поход','for the whole trek')+'</span>':'')+(sbst>=1?'<br><span style="font-size:16px">'+Lg('⏩ Ускорение: +','⏩ Speed-up: +')+fmtBoost(sbst)+'</span>':'')+'</div>'+
      dqNote(dq0)+'<div class="btns stick">'+(cont?'<button class="btn ad big" id="trCont">'+Lg('🎬 Ещё попытка за рекламу (+10 ❤, поход продолжится)','🎬 One more try for an ad (+10 ❤, the trek goes on)')+'</button>':'')+
      '<button class="btn'+(cont?'':' big')+'" id="trAgain">'+Lg('Новый поход','New trek')+'</button><button class="btn ghost" id="trMap">'+Lg('В меню','Menu')+'</button></div>');
    var go=function(){hideModal();G.win=false;continueBattle();voice(Lg('Второе дыхание! Кот Баюн усыпил нечисть — поход продолжается!','Second wind! Bayun the Cat put the monsters to sleep — the trek goes on!'),VOEV(),'voevoda',5);},cb_=$('trCont');
    adOn('trCont','tropa',function(){showRewarded(go,null,function(){   // поздний зачёт: тот же поход и его итог ещё открыт → продолжаем; иначе золото по цене ролика
      if(G!==g||!G.over||G.contUsed||!cb_||!document.body.contains(cb_)||!$('modal').classList.contains('on'))return adLateCoins();go();return Lg('поход продолжается!','the trek goes on!');});});
    // o3:FIX итог ≤4 блока: заголовок · полоска · награда · кнопки — всё прочее (задание дня, «Наказ», строка Славы от META WIN) — внутрь блока награды, текст 16 px
    var fold=function(){var m=$('mBody'),tr=m&&m.querySelector('.treasury');if(!tr||m.getAttribute('data-o3tr')!=='1')return;var sub0=m.querySelector('p.sub');
      [].slice.call(m.children).forEach(function(e){if(e===tr||e===sub0||e.tagName==='H3'||/(^|\s)(stats|btns)(\s|$)/.test(e.className))return;e.removeAttribute('data-fit');e.style.display='';e.style.fontSize='16px';e.style.margin='6px 0 0';tr.appendChild(e);});
      if(typeof fitModal==='function')fitModal();};
    try{$('mBody').setAttribute('data-o3tr','1');}catch(x){}setTimeout(fold,0);setTimeout(function(){fold();try{$('mBody').removeAttribute('data-o3tr');}catch(x){}},80);
    var wk=!!o.wk;on('trAgain',function(){afterAd(true,function(){start(wk);});});on('trMap',function(){afterAd(true,function(){toMenu('Map');});});}
  return {start:start,end:end,bot:bot,tsar:tsar,GIFTS:GIFTS,zw:zw,zwTxt:zwTxt};
})();

/* ================= § FIX ленивая часть «Обороны 3.0» (o3:FIX п.6: вес старта; новых файлов нет — архив 100) =================
   Грузится сразу после старта из o3-ui.js (O3LZ), не только при входе в Тропу. Здесь — то, что не нужно в первом бою:
   1) банк реплик вне боя П4 (победа/поражение/перед боем/вне боя/уведомления) и сценки → O3T.bank / O3T.sc;
   2) П5: итог боя ≤4 блока, Карта ≤12 мест (+ «Дружина» в Кузнице), Рапорт воеводы — тот же код, что был в o3-ui.js (перенесён без изменений, кроме o3:FIX). */
(function(){if(typeof O3T==='undefined'||!O3T.bank)return;var b=O3T.bank,sc=O3T.sc||{},k;
  var B2={
    w_clean:{t:['Ни одного прорыва. Нечисть подала жалобу: «Нас не пустили». Жалобу я тоже не пустил.','Not a single breach. The monsters filed a complaint: “They didn’t let us in.” I didn’t let the complaint in either.']},
    w_last:{t:['На последней жизни! У меня борода поседела. Агафья обрадуется: давно просила солидности.','On the last life! My beard went grey. Agafya will be pleased: she’s long wanted me to look distinguished.']},
    w_try3:{t:['С третьего раза. Я так женился. Моя Агафья до сих пор говорит, что ей просто надоело отказывать.','Third time lucky. That’s how I got married. My Agafya still says she just got tired of saying no.']},
    w_fast:{t:['Так быстро, что нечисть не успела испугаться. Придётся пугать в следующий раз.','So fast the monsters didn’t even get scared. We’ll have to scare them next time.']},
    w_arch:{t:['Одни стрельцы — и победа. Пушкари обиделись и пошли обедать без очереди.','Archers alone — and a victory. The cannoneers took offence and jumped the lunch queue.']},
    w_nospell:{t:['Без Грома Перуна. Перун прислал гонца: не заболел ли кто.','Without Perun’s Thunder. Perun sent a messenger to ask if anyone’s ill.']},
    w_solo:{t:['Соловей сдался. Обещал свистеть только по праздникам. Спросил, по каким, — говорит, по своим.','The Nightingale gave up. Promised to whistle only on holidays. I asked which ones — he said his own.']},
    w_yaga:{t:['Костяная нога улетела. Тётушка Яга довольна: «Пусть знает, кто в семье на заставе служит».','Bony Leg flew off. Auntie Yaga is pleased: “Let her know who in this family serves at the outpost.”']},
    w_gory:{t:['Горыныч отступил. Три головы — три объяснения почему. Ни одно не сходится.','Gorynych retreated. Three heads — three explanations why. None of them match.']},
    w_kosh:{t:['Кощей разбит. Требует переигровку: он бессмертный, ему положено.','Koschei is beaten. He demands a rematch: he’s deathless, he’s entitled to one.']},
    w_karach:{t:['Карачун ушёл. Оставил у ворот сугроб — на память. Чистить, видимо, тоже нам.','Karachun is gone. He left a snowdrift at the gate as a keepsake. Guess we’re shovelling it too.']},
    w_morcar:{t:['Морской царь уплыл. Раки остались: пятились не в ту сторону.','The Sea King swam away. The crayfish stayed: they backed off the wrong way.']},
    w_tugar:{t:['Тугарин погас. Щит дымится, самолюбие тоже.','Tugarin is out. His shield is smoking, and so is his pride.']},
    w_liho:{t:['Царство спасено. По уставу положен отпуск. Последний раз я его брал при старом царе — отвык.','The kingdom is saved. Regulations say I get leave. Last time I took it was under the old tsar — I’ve forgotten how.']},
    w_hard:{t:['На Сложном! Нечисть была злее на пятую часть. А ты — на всю.','On Hard! The monsters were a fifth angrier. And you — a whole lot more.']},
    w_hell:{t:['Адский пройден. Черти просились к нам в стрельцы. Сказал — подумаю. Рога в шлем не влезут.','Hell is done. The imps asked to join our archers. I said I’d think about it. Horns won’t fit in a helmet.']},
    w_yar:{t:['Ярая сила — а держались мы. Ратибор спрашивал, как. Сказал: военная тайна. Сам не знаю.','A raging foe — and we held. Ratibor asked how. I said it’s a military secret. I don’t know myself.']},
    w_tour:{w:'pot',t:['Первые среди соседей! Ратибор третий день ходит вокруг нашего частокола и меряет его шагами.','First among the neighbours! Ratibor has been pacing around our palisade for three days, measuring it in steps.'],g:'1-е место за неделю'},
    w_kolo:{t:['Колобка поймал? От бабушки ушёл, от дедушки ушёл, а от нашей казны ещё никто не уходил.','Caught the Kolobok? He left grandma, he left grandpa, but nobody has ever left our treasury.']},
    w_100:{t:['Одна застава — сто нечисти. Остальные стоят рядом и делают вид, что помогали.','One outpost — a hundred monsters. The rest stand beside it pretending they helped.']},
    l_muh:{t:['Прорвались мухоморы — самые медленные в царстве. Пишу в рапорт: «Шли долго. Мы смотрели».','The toadstools got through — the slowest folk in the kingdom. Writing in my report: “They walked for ages. We watched.”']},
    l_wolf:{t:['Волки проскочили. Сказали — к бабушке. Бабушку я предупредил, она сковородку достала.','The wolves slipped past. Said they were off to grandma’s. I warned grandma — she’s got her frying pan out.']},
    l_fly:{t:['Прорвались вороны. Пушкари уверяют: в небо стрелять — не их работа. Ставь стрельцов.','The crows got through. The cannoneers insist shooting at the sky isn’t their job. Build archers.']},
    l_kik:{t:['Кикиморы перескочили полдороги. Хихикали. Я бы тоже хихикал, но мне по должности нельзя.','The kikimoras hopped over half the road. Giggling. I’d giggle too, but my rank doesn’t allow it.']},
    l_upyr:{t:['Упыри заживали быстрее, чем мы их били. Бей кучно — по одному им только щекотно.','The ghouls healed faster than we could hit them. Hit them together — one at a time just tickles them.']},
    l_gory:{t:['Горыныч пожёг заставы. Плотники обещают отстроить к утру. Плотники всегда так обещают.','Gorynych burned our outposts. The carpenters promise to rebuild by morning. Carpenters always promise that.']},
    l_shot:{t:['До победы — один выстрел. Стрелец, который промахнулся, просится в пушкари: там промахи не так видно.','One shot short of victory. The archer who missed wants to join the cannoneers: misses are less obvious there.']},
    l_first:{t:['Первое поражение — не позор. Я в первый день службы потерял ворота. Целиком. До сих пор ищем.','A first defeat is no disgrace. On my first day of service I lost the gate. The whole thing. We’re still looking.']},
    l_try3:{t:['Третий раз тут. Нечисть уже здоровается. Пора и нам — Громом Перуна, прямо при входе.','Third time here. The monsters already say hello. Time we said hello back — with Perun’s Thunder, right at the entrance.']},
    l_quit:{t:['Ушёл с поля. По уставу это называется «манёвр». Устав, правда, я сам и писал.','Left the field. Regulations call it “a manoeuvre”. Then again, I wrote the regulations myself.']},
    l_siege:{t:['Держались долго. Летописец исписал два свитка и просит новое перо. И выходной.','We held out a long time. The chronicler filled two scrolls and wants a new quill. And a day off.']},
    l_yar:{t:['Ярая сила — она на то и ярая. Ратибор тоже тут лёг, я узнавал. Только не говори ему, что я узнавал.','A raging foe rages — that’s the point. Ratibor fell here too, I checked. Just don’t tell him I checked.']},
    l_liho:{t:['Лихо глянуло — и самая дорогая застава уснула. Дешёвые не спят: им за сон не доплачивают.','Likho glanced — and the priciest outpost fell asleep. The cheap ones stay awake: nobody pays them extra for napping.']},
    l_hell:{t:['Адский — он и есть адский. Черти хлопали. Не нам.','Hell is hell. The imps applauded. Not us.']},
    i_s0:{t:['Тот же лес, но злее. Леший узнал, что ты его прошёл, и обиделся всем лесом.','The same forest, but angrier. The Leshy heard you’d got through and the whole forest took offence.']},
    i_s1:{t:['Болото на Сложном. Комары с бородой отрастили ещё и усы.','The swamp on Hard. The bearded mosquitoes have grown moustaches too.']},
    i_s2:{t:['Каменная баба опять смотрит. В прошлый раз ты строил хорошо — теперь она ждёт, что опозоришься.','The stone idol is watching again. Last time you built well — now she’s waiting for you to slip up.']},
    i_s3:{t:['Кощей пересчитал злато после прошлого раза. Недостача. Подозревает нас. Правильно подозревает.','Koschei counted his gold after last time. Some is missing. He suspects us. He’s right to.']},
    i_s4:{t:['Студёные горы, второй заход. Стрельцы взяли варежки. Теперь стучат зубами в варежках.','The Frosty Mountains, round two. The archers brought mittens. Now their teeth chatter in mittens.']},
    i_s5:{t:['Морское царство на Сложном. Как мы дышим под водой, я так и не понял. Но теперь — чаще.','The Sea Kingdom on Hard. I still don’t get how we breathe underwater. But now we do it faster.']},
    i_h0:{t:['Адский лес. Мухоморы те же, только в доспехах. Где взяли — не говорят.','Hell forest. The same toadstools, only in armour. They won’t say where they got it.']},
    i_h6:{t:['Огненная земля на Адском. Тётушка Яга варит зелье без огня: тут и так всё кипит.','The Fire Land on Hell. Auntie Yaga brews her potions with no fire: everything boils here anyway.']},
    i_hkosh:{t:['Адский Кощей. Яйцо спрятал так хорошо, что сам полдня искал. Нашёл, к сожалению.','Hell Koschei. He hid his egg so well he spent half a day looking for it. Found it, sadly.']},
    i_yar1:{t:['Ярая сила. Нечисть злая по-настоящему: кто-то ей рассказал, сколько у нас звёзд.','A raging foe. The monsters are truly angry: someone told them how many stars we have.']},
    i_yar2:{t:['Ярь — это когда нечисть не обижается, а сразу дерётся. Как моя Агафья, если я в сапогах в избу.','Fury is when monsters don’t sulk, they just fight. Like my Agafya when I walk into the hut in boots.']},
    i_dly:{t:['Застава дня — одна на всю Русь. Значит, и позор, если что, на всю Русь. Не подведи.','The Outpost of the Day is the same for the whole land. So any disgrace is for the whole land too. Don’t let us down.']},
    o_yag1:{w:'yag',t:['Я на пенсии. Пенсия у меня — дрова и уважение. Дров хватает.','I’m retired. My pension is firewood and respect. There’s enough firewood.'],g:'изба, наказ'},
    o_yag2:{w:'yag',t:['Сестрица с котами летает, я с котами сижу. Вся разница между нами — и сорок лет обиды.','My sister flies around with cats, I sit with cats. That’s the only difference between us — that and forty years of grudges.'],g:'Книга нечисти, сестра'},
    o_bay:{w:'bay',t:['Ты пропустил день — я за тебя поспал. Двойную норму. Не благодари, я устал.','You missed a day — I slept for you. A double shift. Don’t thank me, I’m tired.'],g:'Летопись, день прощён'},
    o_rat:{w:'rat',t:['Ратибор прислал гонца: «Я выше в таблице». Гонец шёпотом добавил, что сам он болеет за нас.','Ratibor sent a messenger: “I’m higher in the table.” The messenger whispered that he’s rooting for us himself.'],g:'Соседние заставы, обогнал'},
    o_scroll:{t:['Свиток второй. Читай внимательно: писал я его три дня. Два из них искал перо.','Scroll two. Read carefully: it took me three days to write. Two of them I spent looking for a quill.'],g:'Неделя новичка, свиток 2'},
    o_afk:{t:['Казна полна. Я заглядываю туда каждое утро. Просто посмотреть. Как на море.','The treasury is full. I peek in every morning. Just to look. Like at the sea.'],g:'казна'},
    o_reset:{t:['Кузню сбросили — звёзды вернулись. Вот бы в жизни так: передумал — и всё назад.','The forge was reset — the stars are back. If only life worked like that: change your mind and get it all back.'],g:'кузница сброшена'},
    o_wall:{t:['Частокол готов: плюс жизнь в каждом бою. Плотники просили назвать его в их честь. Назвал «Забор».','The palisade is up: one more life in every battle. The carpenters asked me to name it after them. I named it “Fence”.'],g:'Частокол'},
    n_1:{t:['Стрельцы спрашивают, где главный. Я говорю — я главный. Не верят.','The archers ask where the boss is. I say I’m the boss. They don’t believe me.'],g:'1-й день'},
    n_afk:{t:['Казна набралась. Без тебя не трачу — я честный. Но смотрю на неё уже подозрительно.','The treasury has filled up. I won’t spend it without you — I’m honest. But I’m eyeing it suspiciously.'],g:'казна'},
    n_nkz:{t:['Новые наказы на заставе. Старые нечисть съела. Шучу. Не все.','New orders at the outpost. The monsters ate the old ones. Kidding. Not all of them.'],g:'наказы'},
    n_tour:{t:['Ратибор поднялся в таблице на одно место. Уже повесил об этом объявление.','Ratibor went up one place in the table. He’s already put up a notice about it.'],g:'турнир'},
    n_yag:{w:'yag',t:['Сварила зелье. К вечеру остынет. Или взорвётся. Заходи посмотреть.','I brewed a potion. It’ll cool by evening. Or explode. Come and see.'],g:'изба'},
    n_bay:{w:'bay',t:['Три дня тебя ждал. Шучу, спал. Но во сне — ждал.','I waited three days for you. Kidding, I slept. But in my dreams I waited.'],g:'3 дня тишины'},
    n_3d:{t:['Нечисть прислала разведчика. Он посмотрел на пустые ворота и пошёл за остальными.','The monsters sent a scout. He looked at the empty gate and went to fetch the rest.'],g:'3 дня тишины'},
    n_forge:{t:['Кузнец выковал новое. Говорит — лучше старого. Он всегда так говорит, но сейчас похоже на правду.','The smith forged something new. Says it’s better than the old. He always says that, but this time it looks true.'],g:'кузница'},
    n_7d:{t:['Агафья спрашивает, почему воевода опять один на заставе. Сказал — ты на совещании. Не подведи.','Agafya asks why the commander is alone at the outpost again. I said you’re in a meeting. Don’t let me down.'],g:'неделя без игры'},
    n_dly:{t:['Застава дня сегодня у реки. Нечисть уже там. Мы — ещё нет. Неловко.','Today’s Outpost of the Day is by the river. The monsters are already there. We’re not yet. Awkward.'],g:'Застава дня'},
  };
  var SC2={
    smotr:[['pot','Нечисть! Стро-ойся!','Monsters! Fall in!'],['Мухомор|Toadstool','Мы по росту или по ядовитости?','By height or by toxicity?'],['pot','По росту.','By height.'],['Идолище|Idol','Опять я крайний.','Last in line again.'],['pot','Сколько служу — впервые меня слушается враг. Даже за своих обидно.','All my years of service — the first time the enemy obeys me. Makes me feel sorry for my own men.']],
    sestry:[['Баба-яга Костяная нога|Baba Yaga Bony Leg','Сестрица! На заставе служишь? Против своих?','Sister! Serving at the outpost? Against your own?'],['yag','Свои — это кто пенсию платит.','My own are whoever pays my pension.'],['Баба-яга Костяная нога|Baba Yaga Bony Leg','А мама что скажет?','And what will mother say?'],['yag','Мама сказала: «Хоть одна дочка при деле».','Mother said: “At least one daughter has a proper job.”']],
    pirozhki:[['pot','Агафья прислала пирожков. С запиской: «Раздай всем, сам не ешь».','Agafya sent pies. With a note: “Share them, don’t eat any yourself.”'],['Стрелец|Archer','А почему вы едите?','Then why are you eating?'],['pot','Проверяю на яд. Служба.','Checking for poison. Duty.'],['Стрелец|Archer','И как?','And?'],['pot','Восьмой — пока чисто.','Number eight — clean so far.']],
    chastokol:[['rat','У меня частокол с резьбой. Петушки, ёлочки.','My palisade is carved. Roosters, little fir trees.'],['pot','А нечисть?','And the monsters?'],['rat','Стоит и любуется. Не лезет.','They stand and admire it. Don’t climb in.'],['pot','У нас без резьбы. Нечисть тоже не лезет.','Ours has no carving. The monsters don’t climb in either.'],['rat','Любуется?','Admiring it?'],['pot','Лежит.','Lying down.']],
    opis:[['Кощей Бессмертный|Koschei the Deathless','Воевода, после прошлого раза у меня в сундуке недостача.','Commander, since last time my chest is short.'],['pot','Опись есть?','Got an inventory?'],['Кощей Бессмертный|Koschei the Deathless','Тысячу лет не делал. Всё на память.','Haven’t made one in a thousand years. All from memory.'],['pot','Тогда по бумагам у тебя ничего и не было. Свободен.','Then on paper you never had anything. Dismissed.']],
    golos:[['Левая голова|Left head','Идём на заставу!','Let’s go to the outpost!'],['Правая голова|Right head','Идём!','Let’s go!'],['Средняя голова|Middle head','Там Гром Перуна.','Perun’s Thunder is there.'],['Левая голова|Left head','Ну и что? Двое за — идём.','So what? Two in favour — we go.'],['Средняя голова|Middle head','Конечно. Он же всегда бьёт в середину.','Of course. It always strikes the middle.']],
    perevod:[['Костяной витязь|Bone Knight','Воевода, возьмите на службу. Тысяча лет стажа.','Commander, take me into service. A thousand years’ experience.'],['pot','А у Кощея что не так?','What’s wrong with Koschei?'],['Костяной витязь|Bone Knight','Отпуска нет, жалованья нет. А у вас пирожки пахнут.','No leave, no pay. And your pies smell nice.'],['pot','Пахнут. Но тебе-то их класть некуда.','They do. But you’ve nowhere to put them.']],
    bayun:[['pot','Баюн, ты на часах. Не спать!','Bayun, you’re on watch. No sleeping!'],['bay','Я не сплю. Я усыпляю. Начинаю с себя — для проверки.','I’m not sleeping. I’m putting to sleep. Starting with myself — as a test.'],['pot','И как?','And?'],['bay','Работает. Утром доложу.','It works. I’ll report in the morning.']],
    obed:[['Стрелец|Archer','Пушкари опять первые к обеду.','The cannoneers are first to lunch again.'],['Пушкарь|Cannoneer','Мы громче. Нас слышно — значит, работаем.','We’re louder. If you hear us, we’re working.'],['Стрелец|Archer','А мы попадаем!','And we hit things!'],['Пушкарь|Cannoneer','Попадать — дело тихое. Кто заметит?','Hitting is quiet work. Who’d notice?'],['pot','Обед — по выстрелам. Пушкарям — по ложке в минуту. Приятного аппетита, стрельцы.','Lunch by shots fired. Cannoneers get a spoon a minute. Enjoy your meal, archers.']],
    budilnik:[['yag','Воевода, Лихо проснулось.','Commander, Likho is awake.'],['pot','Кто будил?','Who woke it?'],['yag','Ратибор. Хотел победить его первым.','Ratibor. He wanted to beat it first.'],['pot','И как?','And?'],['yag','Первым — получилось. Победить — нет.','First — yes. Beat it — no.']]
  };
  var E3={
    muh:[['Мы не ядовитые. Мы обидчивые. Это хуже.','We’re not poisonous. We’re touchy. That’s worse.'],['Шагом марш! …Ну, каким можем.','Quick march! …Well, as quick as we can.']],
    wolf:[['Пропустите, я к бабушке с пирожками. Пирожки, правда, тоже я.','Let me through, I’m taking pies to grandma. Well, the pies are me too.'],['Я не серый. Я пыльный. Дорога длинная.','I’m not grey. I’m dusty. It’s a long road.']],
    bat:[['Мы ночная смена. Претензии — к дневной.','We’re the night shift. Complaints go to the day shift.']],
    lesh:[['Тут мой лес был! Теперь застава. Хоть бы табличку повесили.','This was my forest! Now it’s an outpost. Could’ve at least put up a sign.']],
    piy:[['Я на минутку. Пиявки всегда на минутку.','Just for a minute. Leeches are always just for a minute.']],
    kik:[['Я короткой дорогой! Короткая — это где вас нет.','I’m taking a shortcut! Short means where you aren’t.']],
    vod:[['Кто купался в моём пруду? Признавайтесь, я пришёл ругаться.','Who swam in my pond? Own up, I’ve come to tell you off.']],
    voron:[['Предсказываю: меня собьют. Кар…','I predict: I’ll be shot down. Caw…']],
    skel:[['Иду налегке. Ни кошелька, ни мяса.','Travelling light. No wallet, no flesh.']],
    upyr:[['Я не бледный. У нас в подземелье просто окон нет.','I’m not pale. There are just no windows in our dungeon.']],
    idol:[['Иду… иду… Куда иду? А, в город. Иду…','Walking… walking… Where to? Ah, the city. Walking…']],
    prizr:[['У-у-у! …Не страшно? Ладно, у меня ещё «бу» есть.','Ooo-ooo! …Not scary? Fine, I’ve still got “boo”.']],
    koldun:[['Сейчас подлечу! …Это пень. Ну, пень, ты тоже держись.','I’ll heal you! …That’s a stump. Well, stump, hang in there too.']],
    rycar:[['Тысяча лет службы. Отпуск обещали после этого похода. Как и после прошлых.','A thousand years of service. They promised leave after this campaign. Like after the last ones.']],
    kot:[['Перешёл вам дорогу. Теперь у вас неприятности. Правила не я придумал.','I crossed your path. Now you’re in trouble. I didn’t make the rules.']],
    snow:[['Разобьёте — нас станет двое. Подумайте хорошенько.','Smash me and there’ll be two of us. Think it over.']],
    shatun:[['Разбудили? Теперь до весны с вами. Со всеми.','Woke me up? Now I’m with you till spring. All of you.']],
    rak:[['Отступаем! В вашу сторону.','Retreat! Towards you.']],
    rusalka:[['Пою для своих. Вам слушать бесплатно, но недолго.','I sing for my own. You can listen for free, but not for long.']],
    chert:[['Спички не мои! Мне их… дали. Подержать.','The matches aren’t mine! Someone… gave them to me. To hold.']],
    ognev:[['Мне холодно не бывает. Мне бывает скучно — вот и пришёл.','I never get cold. I get bored — so here I am.']]
  };
  var E3X={
    leak:[['Я в городе! Так, а дальше что? Нам не говорили.','I’m in the city! Right, now what? Nobody told us.']],
    hit:[['Ай! Я жаловаться буду! Кому — потом решу.','Ow! I’ll complain! Who to — I’ll decide later.']],
    crow:[['Ну вот, сбылось.','There you go, it came true.']],
    lesh_lead:[['Я тут хозяин! Пятьсот лет лес стерегу. Где вы были, когда грибники мусорили?','I’m the master here! Five hundred years guarding this forest. Where were you when the mushroom pickers littered?']]
  };
  var BS={
    solo:{go:['Я Соловей. Пою плохо, зато громко. Кто против — не слышно.','I’m the Nightingale. I sing badly, but loudly. If anyone objects — I can’t hear them.'],ab:['Фью-ю! Это была колыбельная. Других не знаю.','Wheee-oo! That was a lullaby. I don’t know any others.']},
    yaga:{go:['Сестра у вас на службе? Ну всё. На Новый год я к ней опять не приду.','My sister works for you? That’s it. I’m skipping her New Year party again.'],ab:['Ступа с ветерком! Тормоза — в следующей ступе.','Mortar with a breeze! Brakes come in the next model.']},
    gory:{go:['Нас трое, решаем голосованием. Двое — за обед. Средняя воздержалась.','There are three of us, we vote. Two for lunch. The middle one abstained.'],ab:['Минус голова! Зато спорить стало легче.','One head down! Arguing just got easier.']},
    kosh:{go:['Яйцо? Нет у меня никакого яйца. И справа не ищите.','An egg? I don’t have any egg. And don’t look on the right.'],ab:['Моя игла! Я её тысячу лет берёг! Для этого, получается.','My needle! I kept it safe for a thousand years! For this, apparently.']},
    karach:{go:['Холодно? Я ещё не начал. Это я дверь открыл.','Cold? I haven’t started yet. I just opened the door.'],ab:['Заморожу! Заставы — стоять. Вы и так стоите? Тогда стоять холоднее.','I’ll freeze you! Outposts — stand still. You already are? Then stand still colder.']},
    morcar:{ab:['Прилив! Нечисть, лечимся. Кто не болел — всё равно лечимся, раз пришли.','High tide! Monsters, heal up. Not sick? Heal anyway, since you came.']},
    tugar:{ab:['Огненный щит! Сам придумал. Сам и обжёгся — но это между нами.','Fire shield! My own invention. Burnt myself on it too — but that’s between us.']},
    liho:{go:['Кто Лихо будил? Лихо до обеда — лихо вдвойне.','Who woke Likho? Likho before lunch is double trouble.'],ab:['Спи, заставушка. Я бы тоже поспало — но работа.','Sleep, little outpost. I’d nap too — but work.']}
  };
  for(k in B2)if(!b[k])b[k]=B2[k];for(k in SC2)if(!sc[k])sc[k]=SC2[k];
  function put(d,s0){if(!d)return;for(var q in s0)if(!d[q])d[q]=s0[q];}put(O3T.en3,E3);put(O3T.en3x,E3X);put(O3T.boss,BS);})();

/* --- Итог боя ≤4 блока (флаг home): 1) заголовок+звёзды+Потап с поводом (O3T.win/lose от П4; нет — старый текст), 2) награда ≤3 числа
   (золото · ⏩; «Удвоить» — маленькой кнопкой внутри; Слава/соседи/перья — сюда же мелко, только с 3-го дня), 3) ≤1 строка-новость
   (по старшинству: вопрос VK «Напоминать» · гнездо OB2 'win' · «⚔ Сложный открыт» · задание дня · «Частокол»), 4) кнопки («Дальше» крупно).
   Ничего не вырезается из движка: лишнее прячется классом o3x (обработчики целы). Только кампания (не осада/Босс недели/Застава дня/испытание). --- */
(function(){
  if(!O3.on('home'))return;
  function day3(){try{return O3.newsOld()||O3.newsDay()>=3;}catch(e){return true;}}
  function hide(e){if(!e)return;e.classList.add('o3x');e.removeAttribute('data-fit');}
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':'&gt;';});}
  function sayH(face,who,txt){return '<div class="say o3say"><img src="'+ic(face||'voevoda')+'" alt=""><div><b class="who">'+esc(who||Lg('Воевода Потап','Commander Potap'))+'</b>'+txt+'</div></div>';}
  function news(m){var c=[m.querySelector('.soc-o'),m.querySelector('.ob2win'),m.querySelector('.difup'),m.querySelector('p.sub[data-fit="1"]'),m.querySelector('.o3wall')];
    var keep=null;for(var i=0;i<c.length;i++){if(c[i]&&!keep&&c[i].offsetHeight!==0)keep=c[i];else if(c[i]&&c[i]!==keep)hide(c[i]);}
    return keep;}
  function tidy(G0,win){var m=$('mBody');if(!m||!G0||G0.endless||G0.wk||G0.dly||G0.rule)return;var k=m.getAttribute('data-w');if(k!==(win?'win':'lose'))return;
    if(m.querySelector('.o3res'))return;m.classList.add('o3res');
    // o3:QA fitModal на низком экране (360×640) уже спрятал строки data-fit (в т. ч. выбор богатыря) — вернуть до отбора новости, иначе news() их выкинет навсегда
    [].forEach.call(m.querySelectorAll('[data-fit]'),function(e){e.style.display='';});
    var ch=[].slice.call(m.children),btns=m.querySelector('.btns.stick')||m.querySelector('.btns');
    if(win){
      var sub=m.querySelector('p.sub[data-fit="4"]'),w=null;try{if(typeof O3T!=='undefined'&&O3T.win)w=O3T.win(G0);}catch(e){O3.err('o3T.win',e);}
      if(sub){var h=sayH(w&&w.face,w&&w.who,w&&w.txt?esc(w.txt):sub.innerHTML);sub.insertAdjacentHTML('afterend',h);hide(sub);}
      var tr=m.querySelector('.treasury');
      // «Частокол» после первой победы — тоже кандидат в новость
      ch.forEach(function(e){if(e.classList&&e.classList.contains('goal')&&!e.classList.contains('ob2win')&&!e.classList.contains('metaln')&&!e.classList.contains('dzpv')&&/Частокол|Palisade/.test(e.textContent)&&!/Дальше|Next/.test(e.textContent))e.classList.add('o3wall');});
      ch.forEach(function(e){if(!e.classList)return;
        if(e.classList.contains('goal')&&!e.classList.contains('ob2win')&&!e.classList.contains('o3wall')&&!e.classList.contains('difup'))hide(e);   // «Дальше: …» (дубль кнопки), «Завтра…», Слава-строка, Передышка
        else if(e.classList.contains('stats')||e.classList.contains('besttw')||e.classList.contains('dzpv'))hide(e);});
      [].forEach.call(m.querySelectorAll('.dzpv,.izcall,.bestTw,.tmrw'),hide);
      // лучшая застава/«Завтра»: без своих классов — по разметке (div после stats)
      ch.forEach(function(e){if(e.tagName==='DIV'&&!e.className&&e!==btns)hide(e);});
      if(tr){var x2=$('rX2');if(x2){x2.classList.add('o3x2');var mm=/\+\s?([\d\s\u00a0]+)/.exec(x2.textContent);if(mm)x2.textContent=Lg('🎬 ×2 за рекламу: +','🎬 ×2 for an ad: +')+mm[1].trim();tr.appendChild(x2);}
        var ml=m.querySelector('.metaln');if(ml){if(day3()){var s=document.createElement('div');s.className='note o3meta';s.innerHTML=ml.innerHTML;tr.appendChild(s);}hide(ml);if(ml.parentNode===tr)ml.remove();}}
    }else{
      var sy=m.querySelector('.say'),l=null;try{if(typeof O3T!=='undefined'&&O3T.lose)l=O3T.lose(G0);}catch(e){O3.err('o3T.lose',e);}
      var s0=m.querySelector('p.sub[data-fit="3"]');hide(s0);
      if(sy&&l&&l.txt){var d=sy.querySelector('div');if(d)d.innerHTML='<b class="who">'+esc(l.who||Lg('Воевода Потап','Commander Potap'))+'</b>'+esc(l.txt)+(l.miss?'<br><small>'+esc(l.miss)+'</small>':'');var im=sy.querySelector('img');if(im&&l.face)im.src=ic(l.face);}
      var pg=m.querySelector('.prog');if(sy&&pg&&pg.parentNode===sy.parentNode)pg.parentNode.insertBefore(sy,pg);   // Потап — сразу под заголовком (блок 1)
      ch.forEach(function(e){if(!e.classList||e===pg||e===sy||e===btns)return;
        if(e.classList.contains('metaln')){if(pg&&day3()){var q=document.createElement('div');q.className='note o3meta';q.innerHTML=e.innerHTML;pg.appendChild(q);}hide(e);}
        else if(e.classList.contains('goal')&&!e.classList.contains('ob2win')){if(pg){var t=document.createElement('div');t.className='note';t.innerHTML=e.innerHTML;pg.appendChild(t);}hide(e);}   // подмога/«нечисть слабее» — внутрь полосы
        else if(e.classList.contains('stats')){if(pg){var st=e.querySelectorAll('b'),gb=st[st.length-1];if(gb){var n=document.createElement('div');n.className='note';n.textContent=gb.textContent+' '+Lg('золотых','gold');pg.appendChild(n);}}hide(e);}
        else if(e.tagName==='P'&&e.classList.contains('sub')&&e!==s0)hide(e);   // «вернули ⏩» — мелочь
        else if(e.tagName==='DIV'&&!e.className)hide(e);});
    }
    news(m);
    if(typeof fitModal==='function')fitModal();
    // o3:FIX низкий экран (360×640): выбор богатыря не должен уходить под липкое «Дальше» — переносим его выше награды (сразу под Потапа)
    if(win&&m.scrollHeight>m.clientHeight+1){var hb=m.querySelector('[data-o3h]'),row=hb;while(row&&row.parentNode!==m)row=row.parentNode;
      var sy2=m.querySelector('.o3say')||m.querySelector('.say'),tr2=m.querySelector('.treasury');
      if(row&&row.offsetHeight){if(sy2&&sy2.parentNode===m)m.insertBefore(row,sy2.nextSibling);else if(tr2&&tr2.parentNode===m)m.insertBefore(row,tr2);m.scrollTop=0;}}
    // низкий экран: не влезло — сначала уходит мелкая строка Славы/соседей
    if(m.scrollHeight>m.clientHeight+1){[].forEach.call(m.querySelectorAll('.o3meta'),hide);}}
  O3R.tidy=tidy;
  // после всех вставок в окно (META WIN, «Передышка» обёрткой onBattleEnd, письмо воеводе) — следующим тиком
  META_MODS.push({id:'o3res',WIN:function(G0,win){setTimeout(function(){try{tidy(G0,win);}catch(e){O3.err('res',e);}},0);}});
  var css='.o3x{display:none!important}.o3res .o3say{margin:6px 0 8px}.o3res .treasury .o3x2{display:block;margin:8px auto 0;min-height:48px;font-size:16px;padding:6px 14px;width:auto;max-width:100%;white-space:normal}'+
    '.o3res .treasury .o3meta{display:block;font-size:16px;margin-top:6px}.o3res .prog .note{display:block;font-size:16px;margin-top:4px}.o3res .ob2win .btn{min-height:48px}';
  try{var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);}catch(e){}
})();

/* --- Карта ≤6 блоков (флаг home): шапка · глава (Потап со строкой + «В бой · уровень» + режимы) · ОДНА полоса «Сегодня» (≤4 кнопки:
   наказы/задания, Застава дня, Тропа или Дело дня, «ещё ›») · карта земель · уровни земли · нижнее меню.
   Всё остальное (все фишки «Сегодня», Слава/Соседи, доска Наказов с сундуком, Сказ, «Копим на…», задания, Неделя новичка …) —
   не вырезается: переезжает в раскрывашку «ещё ›» под полосой (не окно). Обработчики целы — узлы переносятся, не пересоздаются. --- */
(function(){
  if(!O3.on('home'))return;
  // запасные реплики Потапа (если банка П4 нет) — тексты HUMOR (lines-src.txt «Вне боя», «Уведомления VK»)
  var FB={o_afk:['Казна полна. Я заглядываю туда каждое утро. Просто посмотреть. Как на море.','The treasury is full. I peek in every morning. Just to look. Like at the sea.'],
    n_nkz:['Новые наказы на заставе. Старые нечисть съела. Шучу. Не все.','New orders at the outpost. The monsters ate the old ones. Kidding. Not all of them.'],
    n_dly:['Застава дня сегодня у реки. Нечисть уже там. Мы — ещё нет. Неловко.','Today’s Outpost of the Day is by the river. The monsters are already there. We’re not yet. Awkward.'],
    n_forge:['Кузнец выковал новое. Говорит — лучше старого. Он всегда так говорит, но сейчас похоже на правду.','The smith forged something new. Says it’s better than the old. He always says that, but this time it looks true.'],
    n_1:['Стрельцы спрашивают, где главный. Я говорю — я главный. Не верят.','The archers ask where the boss is. I say I’m the boss. They don’t believe me.'],
    n_3d:['Нечисть прислала разведчика. Он посмотрел на пустые ворота и пошёл за остальными.','The monsters sent a scout. He looked at the empty gate and went to fetch the rest.'],
    n_7d:['Агафья спрашивает, почему воевода опять один на заставе. Сказал — ты на совещании. Не подведи.','Agafya asks why the commander is alone at the outpost again. I said you’re at a meeting. Don’t let me down.'],
    o_wall:['Частокол готов: плюс жизнь в каждом бою. Плотники просили назвать его в их честь. Назвал «Забор».','The palisade is up: one more life in every battle. The carpenters asked me to name it after them. I named it “Fence”.'],
    o_rat:['Ратибор прислал гонца: «Я выше в таблице». Гонец шёпотом добавил, что сам он болеет за нас.','Ratibor sent a messenger: “I’m higher in the table.” The messenger whispered that he’s rooting for us himself.'],
    m_coin:['Монеты лежат без дела. Нечисть взяток не берёт — я спрашивал.','Coins are lying idle. Monsters don’t take bribes — I asked.']};
  function line(id){try{if(typeof O3T!=='undefined'&&O3T.line){var r=O3T.line(id);if(r&&r.txt)return r;}}catch(e){}var f=FB[id]||FB.n_1;return {txt:Lg(f[0],f[1]),face:'voevoda'};}
  O3R.line=line;
  function dnum(){var d=new Date(nowMs());return Math.floor((d.getTime()-d.getTimezoneOffset()*6e4)/864e5);}
  function mapLine(){var id;
    try{if(afkGold()>=afkReadyAt())id='o_afk';else if(dqClaimable()||document.querySelector('#tdBox [data-td=dq].hot'))id='n_nkz';else if(canForge())id='n_forge';
      else if(document.querySelector('#tdBox [data-td=dly].hot'))id='n_dly';}catch(e){}
    if(!id){var L=['n_1','n_3d','m_coin','n_7d','o_rat'];id=L[dnum()%L.length];}
    return line(id);}
  var open=false;
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':'&gt;';});}
  // глава: «В бой · уровень N» и строка Потапа
  function head(){var h=$('chHead'),card=h&&h.querySelector('.chh')||($('chCard')&&$('chCard').querySelector('.card'));if(!card||card.querySelector('.o3pot'))return;
    try{var c=mapSel,dm=difOf(c),nl=difNextLv(c,dm),sp=card.querySelector('.row .t span');if(sp&&CH[c]&&CH[c].levels[nl])sp.textContent=Lg('Уровень ','Level ')+(nl===5?'☠':nl===6?'🔥':(nl+1))+' · '+CH[c].levels[nl];
      var pb=$('playNext');if(pb)pb.innerHTML=swordImg()+Lg('В бой','To battle')+(dm!=='n'?' '+difIcon(dm):'');}catch(e){}
    if(!S.wins)return;var w=mapLine();var d=document.createElement('div');d.className='o3pot';
    d.innerHTML='<img src="'+ic(w.face||'voevoda',64)+'" alt=""><span>'+esc(w.txt)+'</span>';var row=card.querySelector('.row');if(row)row.parentNode.insertBefore(d,row);else card.insertBefore(d,card.firstChild);}
  // полоса «Сегодня»: ≤4 кнопки — клики уходят в настоящие фишки (их обработчики и логика модулей)
  function strip(){var tab=$('tabMap'),td=$('tdBox');if(!tab||!td)return;var st=$('o3td');
    var cs=[].slice.call(td.querySelectorAll('[data-td]'));if(!S.wins||!cs.length){if(st)st.remove();return;}
    if(!st){st=document.createElement('div');st.id='o3td';td.parentNode.insertBefore(st,td);}
    var by={};cs.forEach(function(b){by[b.getAttribute('data-td')]=b;});
    var pick=[],ids=['dly',by.tropa?'tropa':by.dzr?'dzr':by.dch?'dch':'wk'];/* o3:FIX «Наказы» — в «ещё ›» (красная точка на «ещё», ≤12 мест на Карте) */ids.forEach(function(k){if(by[k]&&pick.length<3)pick.push(by[k]);});
    var rest=cs.filter(function(b){return pick.indexOf(b)<0;}),hot=rest.some(function(b){return b.classList.contains('hot');})||!!document.querySelector('#tabMap .letbar.hot');
    var h='';pick.forEach(function(b,i){h+='<button class="chip o3c'+(b.classList.contains('hot')?' hot':'')+'" data-o3="'+i+'">'+esc(b.textContent.split(':')[0])+'</button>';});
    h+='<button class="chip o3c o3m'+(hot&&!open?' hot':'')+'" data-o3="m">'+(open?Lg('скрыть ▴','hide ▴'):Lg('ещё ›','more ›'))+'</button>';
    st.innerHTML=h;st.style.gridTemplateColumns='repeat('+(pick.length+1)+',minmax(0,1fr))';   // o3:FIX кнопок 2–3
    [].forEach.call(st.querySelectorAll('[data-o3]'),function(e){e.onclick=function(){var k=e.getAttribute('data-o3');
      if(k==='m'){SND.click();toggle(!open);return;}var b=pick[+k];if(!b)return;
      if(b.getAttribute('data-td')==='dq'){SND.click();toggle(true);var q=$('nkzBoard')||$('dqBox');if(q)setTimeout(function(){q.scrollIntoView({block:'start',behavior:'smooth'});},30);return;}
      b.click();};});}
  // раскрывашка «ещё»: всё прочее с Карты
  function more(){var tab=$('tabMap');if(!tab)return null;var mo=$('o3more');if(!mo){mo=document.createElement('div');mo.id='o3more';var st=$('o3td');if(st&&st.nextSibling)tab.insertBefore(mo,st.nextSibling);else tab.appendChild(mo);}
    var keep={chHead:1,o3td:1,o3more:1};
    [].slice.call(tab.children).forEach(function(e){if(e===mo||keep[e.id]||e.classList.contains('mapcols'))return;mo.appendChild(e);});
    var sd=tab.querySelector('.mapside');if(sd)[].slice.call(sd.children).forEach(function(e){if(e.id!=='chCard')mo.appendChild(e);});   // ПК: колонка справа — только уровни
    mo.style.display=open?'':'none';return mo;}
  function toggle(v){open=!!v;var mo=$('o3more');if(mo)mo.style.display=open?'':'none';strip();if(open)try{STAT.ev('o3',{a:'more'});}catch(e){}}
  /* o3:FIX Карта ≤12 мест: (1) запертые режимы (🔒 Сложный/Адский/Тропа) — не кнопками, а одной строкой «🔒 … откроется …»; остался один режим — переключателя нет;
     (2) ☠ босс и 🔥 Логово — одна плитка: Логово заперто — плитки нет (откроется после босса), открыто — плитка «☠ · 🔥 ›» раскрывает обе. Ничего не вырезано. */
  var lairOpen={};
  function locks(){[$('chHead'),$('chCard')].forEach(function(el){if(!el)return;var dr=el.querySelector('.difrow');if(!dr||dr.querySelector('.o3lk'))return;var sg=dr.querySelector('.seg');if(!sg)return;
      var lk=[].slice.call(sg.querySelectorAll('button.lock'));if(!lk.length)return;var t='';
      lk.forEach(function(b){var k=b.getAttribute('data-dk');if(!t)t=k?difLockTxt(k):(typeof O3TR!=='undefined'&&O3TR.lockTxt?O3TR.lockTxt():'');b.classList.add('o3x');});
      var v=[].filter.call(sg.querySelectorAll('button'),function(b){return !b.classList.contains('o3x');});if(v.length<=1)sg.classList.add('o3x');
      if(t){var p=document.createElement('p');p.className='note o3lk';p.textContent=t;sg.parentNode.insertBefore(p,sg.nextSibling);}});}
  function lair(){var L=document.querySelector('#chCard .lvls');if(!L||L.querySelector('.o3lair'))return;var b5=L.querySelector('[data-l="5"]'),b6=L.querySelector('[data-l="6"]');if(!b5||!b6)return;
    if(b6.classList.contains('lock')){b6.classList.add('o3x');return;}
    var c=mapSel;if(lairOpen[c])return;var m=document.createElement('button');m.className='lvl th boss o3lair';m.style.backgroundImage=b6.style.backgroundImage;
    var nm='';try{nm=CH[c].levels[5];}catch(e){}m.innerHTML='<span class="n">☠ · 🔥</span><span>'+esc((nm||Lg('Босс','Boss'))+' ›')+'</span>';b5.classList.add('o3x');b6.classList.add('o3x');L.insertBefore(m,b5);
    m.onclick=function(){try{SND.click();}catch(e){}lairOpen[c]=1;b5.classList.remove('o3x');b6.classList.remove('o3x');m.remove();};}
  function tidy(){try{if(typeof G!=='undefined'&&G)return;strip();more();head();locks();lair();}catch(e){O3.err('map',e);}}
  O3R.mapTidy=tidy;
  // Кузница: сверху одна строка «Дружина N/8» (долгая цель PLAN §1; Илья не входит) — только когда богатырь включён и есть O3H (П1)
  function druzh(){try{if(!O3.on('hero')||typeof O3H==='undefined'||!O3H.list)return;var el=$('tabForge');if(!el||el.querySelector('.o3dr'))return;
    var L=O3H.list()||[];if(!L.length)return;var a=L.map(function(id){var x=O3H.stats?O3H.stats(id).xp|0:0;return esc(O3H.name(id))+(x?' — '+x+' '+Lg(plural(x,'бой','боя','боёв'),x===1?'battle':'battles'):'');});
    var d=document.createElement('div');d.className='card o3dr';d.innerHTML='<b>'+Lg('🛡 Дружина ','🛡 Druzhina ')+L.length+'/8</b><span>'+a.join(' · ')+'</span>';el.insertBefore(d,el.firstChild);}catch(e){O3.err('druzh',e);}}
  (function(){var f=window.renderForge;if(typeof f==='function'&&!f.o3){var w=function(){var r=f.apply(this,arguments);druzh();return r;};w.o3=1;window.renderForge=w;}})();
  function wrap(name){var f=window[name];if(typeof f!=='function'||f.o3)return;var w=function(){var r=f.apply(this,arguments);tidy();return r;};w.o3=1;window[name]=w;}
  wrap('renderMap');wrap('renderChCard');
  // renderToday оборачивают и другие (Летопись — при подгрузке): ловим перерисовку полосы наблюдателем, а не обёрткой
  try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var t=ms[i].target;if(t&&(t.id==='tdBox'||t.closest&&t.closest('#tdBox'))){strip();return;}}})
    .observe(document.getElementById('tabMap')||document.body,{childList:true,subtree:true});}catch(e){}
  var css='.o3lk{font-size:16px;margin:6px 2px 0;line-height:1.25}#o3td{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:0 0 10px}'+
    '#o3td .chip{min-width:0;white-space:normal;font-size:16px;line-height:1.12;padding:4px 4px;min-height:52px;text-align:center;margin:0}#o3td .o3m{font-weight:800}'+
    '.o3dr{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px;padding:8px 12px;margin-bottom:10px;font-size:16px}.o3dr b{font-size:17px}'+
    'html.o3h #chHead .row .t span{font-size:16px}#o3more{margin:0 0 10px}#tdBox .chips{margin-bottom:8px}'+
    '.o3pot{display:flex;align-items:center;gap:8px;margin:0 0 8px;text-align:left}.o3pot img{width:44px;height:44px;flex:none}'+
    '.o3pot span{flex:1;min-width:0;font-size:16px;line-height:1.25;font-weight:600;background:var(--paper,#fff6e0);color:var(--ink,#2b2117);border:2px solid var(--paperB,#c9a46a);border-radius:12px 12px 12px 4px;padding:5px 9px}';
  try{var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);}catch(e){}
})();

/* --- Рапорт воеводы (флаг raport; B12, B16): то же ОДНО окно входа, что Летопись (ob2-letx.js LET.offer), но сверху — Потап и 3 строки:
   вчера у тебя (бои/победы · богатырь · кто прорывался) · перекличка соседей (строка Соседей Летописи, жмётся как раньше) · сегодня (Тропа/дело/Застава дня).
   НИЧЕГО не теряется: календарь 30 дней, «за вход», Баюн, «вернуть серию», казна с ×2, итоги Соседей, Неделя новичка, «что нового» — те же узлы
   с теми же обработчиками; строки с кнопками (казна ×2, вернуть серию, итоги недели) — на виду, остальное — под строкой «Награда ›».
   Главная кнопка — «⚔ В бой» (сначала забирает всё, как «Забрать всё», потом — окно перед боем следующего уровня). Старому игроку — со 2-го дня 3.0 (O3.newsOk('raport')). */
(function(){
  if(!O3.on('raport'))return;
  // дневная сводка для строки «вчера»: S.o2r.t {d,b — боёв,w — побед,l:{вид:прорвалось}}, S.o2r.y — прошлый игровой день
  function rr(){var v=S.o2r;if(!v||typeof v!=='object')v=S.o2r={o:0,n:1,d:dayKey()};return v;}
  function roll(){var v=rr(),d=dayKey();if(!v.t||typeof v.t!=='object'||v.t.d!==d){if(v.t&&v.t.d&&v.t.b)v.y=v.t;v.t={d:d,b:0,w:0};}return v.t;}
  O3.hook('end','raport',function(G0,win){try{if(!G0||G0.o3rp)return;G0.o3rp=1;var t=roll();t.b=(t.b|0)+1;if(win)t.w=(t.w|0)+1;
    var lk=typeof O3T!=='undefined'&&O3T._lk?O3T._lk():null;if(lk){t.l=t.l||{};for(var k in lk){t.l[k]=(t.l[k]|0)+lk[k];}
      var ks=Object.keys(t.l);if(ks.length>6){ks.sort(function(a,b){return t.l[b]-t.l[a];});for(var i=6;i<ks.length;i++)delete t.l[ks[i]];}}}catch(e){O3.err('rp-end',e);}});
  function esc(x){return String(x).replace(/[&<>]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':'&gt;';});}
  function enN(t){if(t==='fly')return Lg('летучие','flyers');var e=typeof EN!=='undefined'&&EN[t];return e&&e.n?e.n:'';}
  function yLine(){roll();var y=rr().y,a=[];
    if(y&&y.b){a.push(Lg(y.b+' '+plural(y.b,'бой','боя','боёв')+', побед '+(y.w|0),y.b+(y.b===1?' battle':' battles')+', '+(y.w|0)+(y.w===1?' win':' wins')));
      var top=null,n=0;for(var k in (y.l||{}))if(y.l[k]>n){n=y.l[k];top=k;}var nm=top&&enN(top);if(nm)a.push(Lg('прорывались больше всех: ','broke through most: ')+nm);}
    try{if(O3.on('hero')&&typeof O3H!=='undefined'&&O3H.cur){var h=O3H.cur(),x=O3H.stats(h).xp|0;if(x)a.push(O3H.name(h)+' — '+x+' '+Lg(plural(x,'бой','боя','боёв'),x===1?'battle':'battles'));}}catch(e){}
    if(!a.length)return '';return '<b>'+Lg('Вчера: ','Yesterday: ')+'</b>'+esc(a.join(' · '));}
  function tLine(){var a=[];try{if(typeof O3TR!=='undefined'&&O3TR.open()&&O3.newsOk('tropa'))a.push(Lg('Тропа Кощея','Koschei’s Trail'));}catch(e){}
    try{var L=document.querySelectorAll('#tdBox [data-td].hot');for(var i=0;i<L.length&&a.length<2;i++){var k=L[i].getAttribute('data-td');if(/^(dly|dzr|dch|wk|tropa)$/.test(k))a.push(L[i].textContent.replace(/^[^\wА-яЁё]+/,'').trim());}}catch(e){}
    if(!a.length)a.push(Lg('новый уровень ждёт','a new level awaits'));return '<b>'+Lg('Сегодня: ','Today: ')+'</b>'+esc(a.join(' · '));}
  function voice(m){var id='n_1';if(m.querySelector('#letKz'))id='o_afk';else if(/Баюн|Bayun/.test(m.textContent))id='o_bay';else if(m.querySelector('[data-lt=tour]'))id='o_rat';
    else{var L=['n_1','n_3d','n_7d','m_coin'];id=L[(rr().n|0)%L.length];}return O3R.line?O3R.line(id):{txt:'',face:'voevoda'};}
  function shape(){var m=$('mBody');if(!m||m.getAttribute('data-w')!=='let'||m.querySelector('.o3rp'))return;m.classList.add('o3rpw');
    var h3=m.querySelector('h3');if(h3)h3.textContent=Lg('Рапорт воеводы','Commander’s Report');
    var sub=m.querySelector('p.sub'),days=m.querySelector('.letdays'),rows=m.querySelector('.letrows'),go=$('letGo');
    var v=voice(m),y=yLine(),tour=m.querySelector('[data-lt=tour]');
    var box=document.createElement('div');box.className='o3rp';
    box.innerHTML='<div class="say"><img src="'+ic(v.face||'voevoda')+'" alt=""><div><b class="who">'+esc(v.who||Lg('Воевода Потап','Commander Potap'))+'</b>'+esc(v.txt||'')+'</div></div><div class="o3rl"></div>';
    var L=box.querySelector('.o3rl');if(y)L.insertAdjacentHTML('beforeend','<div class="o3r1">'+y+'</div>');if(tour){tour.classList.add('o3r1');L.appendChild(tour);}L.insertAdjacentHTML('beforeend','<div class="o3r1">'+tLine()+'</div>');
    if(h3&&h3.nextSibling)m.insertBefore(box,h3.nextSibling);else m.insertBefore(box,m.firstChild);
    // награда: календарь и тихие строки — под «Награда ›»; строки с кнопками (казна ×2, вернуть серию) и итоги недели — на виду
    var aw=document.createElement('div');aw.className='o3aw';aw.style.display='none';var gold=0;
    if(sub)aw.appendChild(sub);if(days)aw.appendChild(days);
    if(rows)[].slice.call(rows.children).forEach(function(r){if(r.querySelector('.btn')||/неделя кончилась|week is over/.test(r.textContent))return;var b=r.querySelector(':scope>b');if(b&&/^\+/.test(b.textContent)&&!r.id)gold+=0;aw.appendChild(r);});
    var cnt=aw.children.length;
    var idx=sub?(/(\d+)/.exec(sub.textContent)||[])[1]:'';
    var tg=document.createElement('button');tg.className='letr lk o3awt';tg.innerHTML='<span>'+Lg('🎁 Награда'+(idx?' · день '+idx+' из '+LOGIN_N:''),'🎁 Rewards'+(idx?' · day '+idx+' of '+LOGIN_N:''))+'</span><i>›</i>';
    tg.onclick=function(){SND.click();var o=aw.style.display==='none';aw.style.display=o?'':'none';tg.querySelector('i').textContent=o?'▾':'›';if(typeof fitModal==='function')fitModal();};
    var at=rows||go&&go.parentNode;if(rows){rows.insertBefore(aw,rows.firstChild);rows.insertBefore(tg,aw);}else if(at)m.insertBefore(tg,at);
    if(!cnt){tg.remove();}
    if(go){var tot=/\+\s?([\d\s ]+)/.exec(go.textContent);go.innerHTML=swordImg()+Lg('В бой','To battle')+(tot?' · +'+tot[1].trim():'');go.classList.add('o3go');if(go.parentNode&&go.parentNode.classList)go.parentNode.classList.add('stick');
      go.addEventListener('click',function(){setTimeout(function(){try{if((typeof G==='undefined'||!G)&&!$('modal').classList.contains('on')){openTab('Map');var p=$('playNext');if(p)p.click();}}catch(e){}},60);});}
    try{STAT.ev('o3',{a:'raport',d:+idx||0,y:y?1:0,t:tour?1:0});}catch(e){}
    if(typeof fitModal==='function')fitModal();}
  O3R.raport=shape;
  function wrap(){if(typeof LET==='undefined'||!LET.offer||LET.offer.o3)return;var f=LET.offer;var w=function(){var r=f.apply(this,arguments);
      try{if(r&&O3.newsOk('raport'))shape();}catch(e){O3.err('raport',e);}return r;};w.o3=1;LET.offer=w;}
  try{if(typeof LET!=='undefined'&&LET.load)LET.load().then(wrap,function(){});}catch(e){}
  var css='.o3rp .say{margin:4px 0 8px}.o3rl{display:flex;flex-direction:column;gap:6px;margin:0 0 8px}.o3r1{font-size:16px;line-height:1.3;text-align:left;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.35);border:1.5px solid rgba(160,120,60,.45)}'+
    '.o3rpw .letr{font-size:16px}.o3rpw .letr small{font-size:14px}.o3rpw .letr .btn{min-height:48px;font-size:16px}.o3awt{width:100%;min-height:48px;font:inherit;color:inherit;cursor:pointer}.o3aw{display:flex;flex-direction:column;gap:6px}';
  try{var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);}catch(e){}
})();

/* --- § П2 удаль, Потап из ворот, серия (O3U) — перенесено из js/o3-hero.js (o3:FIX п.6: вес старта); до загрузки ленивой части (первые секунды 1-го боя новичка) их нет --- */
/* П2 (07.11): три вещи под флагом udal (?off=udal — как v5.7). Всё — без rand()/Math.random и без G.bub (своя ГСЧ O3.rnd, реплики O3.say).
   1) Потап из ворот (M4): раз за бой, когда нечисть в 1,5 клетки (60 px пути) от ворот, Потап выходит сам: «Ну, держитесь!» —
      6 с бьёт и отталкивает нечисть у ворот (удар раз в 0,6 с: простая −5 % здоровья и −14 px назад; босс/вожак −1 %, без толчка) — подмога, не спасение.
   2) Серия без прорыва (M36): волн подряд без прорыва 3/6/9 → золото победы ×1,1/×1,25 (9 — «Богатырская серия»). Ступень, раз взятая, держится до конца боя.
      Золото ×K — только победа в кампании (winGold зовётся из onBattleEnd после крючка 'end'); другим режимам — O3U.serMul() (П3 может взять).
   3) Удаль (M2): за убийства богатырём (src.hero===1) 3 ступени (O3U.TH), на каждой — две плашки над героем, касание — выбор; 8 с не выбрал — первая.
      Сгорает в конце боя. Не в Боссе недели. Без героя (O3H.hero===null) удали нет.
   STAT: o3 {a:'potap',w} при выходе; o3 {a:'ser',n,k} при ступени серии (3/6/9); o3 {a:'udal',s,k,tap} при выборе; o3 {a:'udal',k:'end',s,uk,ser} раз за бой. */
var O3U=(function(){
  var U=null;                       // состояние боя
  var nrm=O3H.nrm;   // o3:FIX п.6 калибровка осталась в старте (o3-hero.js § П2-калибровка)
  var POT={dur:6,hit:.6,near:60,reach:100,push:14,dmg:.05,bossDmg:.01,lvN:.5};   // o3:FIX lvN — на Обычном кампании выходит, только когда жизней ≤ 50 % (трудная минута; раньше спасал 1-й прорыв → лишние ★)
  var TH=[2,5,9];                  // убийств богатырём до ступеней удали (калибровка П2)
  var SK={   // умения удали: n — надпись на плашке, f — действие (h — герой, G — бой)
    sila:{n:['Сила ×1,2','Strength ×1.2'],f:function(h){O3H.buf=(+O3H.buf||1)*1.2;}},
    udar:{n:['Удар оземь','Ground slam'],f:function(h,G){slam(h,G);}},
    yar:{n:['Ярость 8 с','Fury 8 s'],f:function(h){h.rage=Math.max(h.rage||0,8);}},
    umel:{n:['Умение чаще','Skill faster'],f:function(h){U.cdK+=.5;h.cd=Math.min(h.cd||0,1);}},
    zlat:{n:['Золотая рука','Golden hand'],f:function(){U.gold+=3;}},
    dyh:{n:['Второе дыхание','Second wind'],f:function(h){try{O3H.heal(9999);}catch(x){}h.down=0;}}};
  var POOL=['sila','udar','yar','umel','zlat','dyh'];
  function H(){return typeof O3H!=='undefined'&&O3H.hero||null;}
  function onMode(G){return G&&!G.wk;}
  // o3:FIX удаль и серия — только после босса 1-й земли (у новичка в 1-1…1-6 их нет: первая минута не перегружена); Потап из ворот — всегда
  function ch1(){try{return !!(S.stars&&S.stars[lvKey(CH_ORDER[0],5)]);}catch(e){return true;}}
  function gate(G){return G.map.gate;}
  // «Удар оземь»: все рядом с героем (100 px) — 3 удара героя и оглушение 1,5 с (босс 0,5 с)
  function slam(h,G){var R=100;G.fx.push({k:'wave',x:h.x,y:h.y,r:R,t:0,dur:.7,col:'#ffd84a'});G.shake=Math.max(G.shake||0,5);
    for(var i=0;i<G.en.length;i++){var e=G.en[i];if(e.dead||(e.x-h.x)*(e.x-h.x)+(e.y-h.y)*(e.y-h.y)>(R+e.r)*(R+e.r))continue;
      dmgEnemy(e,(h.pow||10)*3,'phys',h);if(!e.dead)e.stunT=Math.max(e.stunT,e.boss?.5:1.5);}}
  // ---------- серия ----------
  function wvN(n){var a=n%10,b=n%100;return n+' '+(a===1&&b!==11?'волна':a>=2&&a<=4&&(b<12||b>14)?'волны':'волн');}
  function serMul(){return !U?1:U.serB>=6?1.25:U.serB>=3?1.1:1;}
  function serStep(G){U.ser++;if(U.ser>U.serB){U.serB=U.ser;var n=U.ser;
    if(n===3||n===6||n===9){var g=gate(G),t=n===9?Lg('Богатырская серия! 9 волн','Heroic streak! 9 waves'):
        Lg('Серия: '+wvN(n)+' — золото ×'+(n>=6?'1,25':'1,1'),'Streak: '+n+' waves — gold ×'+(n>=6?'1.25':'1.1'));
      U.serT=4;U.serS=t;O3.say(g.x,g.y-50,t,3.5);O3.ev('ser',{n:n,k:Math.round(serMul()*10)});}}}
  // ---------- Потап ----------
  function potStart(G,e){var P=G.map.paths[e.pi];U.pot={t:0,hit:0,pi:e.pi,d:Math.max(0,P.len-40),on:1};
    var g=gate(G);O3.say(g.x,g.y-40,O3.pick(Lg(['Ну, держитесь!','Ну, держитесь! Воевода идёт!'],['Hold on now!','Hold on! The commander is coming!'])),2.5);
    O3.ev('potap',{w:G.wave});}
  function potTick(dt,G){var p=U.pot;p.t+=dt;p.hit-=dt;if(p.t>POT.dur){p.on=0;p.done=1;return;}
    if(p.hit>0)return;p.hit=POT.hit;var any=0;
    for(var i=0;i<G.en.length;i++){var e=G.en[i];if(e.dead||e.invul)continue;var P=G.map.paths[e.pi];if(P.len-e.d>POT.reach)continue;any=1;
      if(e.boss||e.lead){dmgEnemy(e,e.max*POT.bossDmg,'true',U.SRC);}
      else{e.d=Math.max(0,e.d-POT.push);dmgEnemy(e,e.max*POT.dmg,'true',U.SRC);if(!e.dead)addNum(e.x,e.y-e.r-6,'⟵','#ffe7a0');}}
    if(any){var pp=pathPos(p.pi,p.d);G.fx.push({k:'ring',x:pp.x,y:pp.y,r:70,t:0,dur:.45,col:'#ffd84a'});}}
  function potPos(G){var p=U.pot,g=gate(G),pp=pathPos(p.pi,p.d),q=Math.min(1,p.t/.4,(POT.dur-p.t)/.5+0);q=Math.max(0,q);
    return {x:g.x+(pp.x-g.x)*q,y:g.y-8+(pp.y-g.y+8)*q};}
  // ---------- удаль ----------
  function udOffer(G){var a=POOL.filter(function(k){return U.took.indexOf(k)<0;}),i=Math.floor(O3.rnd()*a.length),k1=a[i];a.splice(i,1);
    var k2=a[Math.floor(O3.rnd()*a.length)];U.ch={a:[k1,k2],t:0};try{SND.coin();}catch(x){}}
  function udPick(G,j,tap){var k=U.ch.a[j],h=H();U.ch=null;U.st++;U.took.push(k);if(h){try{SK[k].f(h,G);}catch(x){O3.err('udal/'+k,x);}
      O3.say(h.x,h.y-20,Lg(SK[k].n[0],SK[k].n[1]),2);G.fx.push({k:'ring',x:h.x,y:h.y,r:46,t:0,dur:.6,col:'#ffd84a'});}
    O3.ev('udal',{s:U.st,k:k,tap:tap?1:0});}
  function plates(c){var h=H();if(!h||!U.ch)return null;var w=Math.min(118,(WW-16)/2-4),hh=46,x0=Math.max(6,Math.min(WW-2*w-14,h.x-w-4)),y=Math.max(40,h.y-118);
    return [{x:x0,y:y,w:w,h:hh},{x:x0+w+8,y:y,w:w,h:hh}];}
  O3.hook('run','udal',function(G){U=onMode(G)?{g:G,lk:G.leaks,wv:0,dirty:0,ser:0,serB:0,serT:0,serS:'',pot:null,potUsed:0,uk:0,st:0,took:[],ch:null,
      cdK:0,gold:0,pay:0,SRC:{potap:1},ok1:ch1()}:null;});
  O3.hook('frame','udal',function(dt,G){if(!U||U.g!==G||G.over)return;
    // серия: прорыв → сброс; новая волна → прошлая засчитана, если без прорыва
    if(G.leaks>U.lk){U.lk=G.leaks;U.dirty=1;if(U.ser>=3){var g=gate(G);O3.say(g.x,g.y-50,Lg('Серия прервалась…','The streak is broken…'),2);}U.ser=0;}
    if(G.wave!==U.wv){if(U.wv>0){if(!U.dirty&&U.ok1)serStep(G);}U.dirty=0;U.wv=G.wave;}
    if(U.serT>0)U.serT-=dt;
    // Потап: раз за бой
    if(U.pot&&U.pot.on)potTick(dt,G);
    else if(!U.potUsed&&G.started&&(!POT.lvN||!nrm(G)||G.lives<=G.maxLives*POT.lvN)){for(var i=0;i<G.en.length;i++){var e=G.en[i];if(e.dead||e.invul||e.type==='egg')continue;
      if(G.map.paths[e.pi].len-e.d<POT.near){U.potUsed=1;potStart(G,e);potTick(0,G);break;}}}
    // удаль
    var h=H();if(!h)return;
    if(U.cdK>0&&h.cd>0&&!(h.down>0))h.cd=Math.max(0,h.cd-dt*U.cdK);
    if(U.ch){U.ch.t+=dt;if(U.ch.t>8)udPick(G,0,false);}});
  O3.hook('kill','udal',function(e,src){if(!U||!G||U.g!==G)return;var h=H();if(!h||!src||!src.hero)return;U.uk++;
    if(U.gold){G.coins+=U.gold;G.earned+=U.gold;addNum(e.x,e.y-e.r-20,'+'+U.gold,'#ffd84a');}
    if(U.ok1&&!U.ch&&U.st<3&&U.uk>=TH[U.st]&&!G.over)udOffer(G);});
  O3.hook('tap','udal',function(p){if(!U||!U.ch||!G||U.g!==G)return false;var P=plates();if(!P)return false;
    for(var j=0;j<2;j++){var r=P[j];if(p.x>=r.x-4&&p.x<=r.x+r.w+4&&p.y>=r.y-4&&p.y<=r.y+r.h+4){udPick(G,j,true);SND.click();return true;}}return false;});
  O3.hook('end','udal',function(G,win){if(!U||U.g!==G)return;
    if(win&&!U.dirty&&!U.endDone&&U.ok1){U.endDone=1;serStep(G);}   // последняя волна без прорыва — тоже в серию
    if(win&&!G.endless&&!G.wk&&!G.dly&&!G.rule)U.pay=1;      // золото ×K берёт winGold (зовётся сразу после 'end')
    if(!U.stDone){U.stDone=1;O3.ev('udal',{k:'end',s:U.st,uk:U.uk,ser:U.serB,pt:U.potUsed});}
    U.ch=null;});
  O3.hook('draw','udal',function(c,G){if(!U||U.g!==G)return;
    if(U.pot&&U.pot.on){var q=potPos(G),s=spr('voevoda');c.save();c.fillStyle='rgba(255,216,74,.35)';c.beginPath();c.ellipse(q.x,q.y+14,22,9,0,0,Math.PI*2);c.fill();
      if(s)sprPut(c,s,q.x,q.y-6+Math.sin(U.pot.t*14)*1.5,62);c.restore();}
    if(U.serB>=3&&!G.over){var g=gate(G);c.save();c.font=cvF(900,wfs(13));c.textAlign='center';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.6)';c.fillStyle=U.serB>=9?'#ffd84a':'#ffe7a0';
      var t=(U.serB>=9?'★ ':'')+'×'+(U.serB>=6?'1,25':'1,1');/* o3:FIX было 1,5/1,2 — не как serMul */if(LANG==='en')t=t.replace(',','.');c.strokeText(t,g.x,g.y-58);c.fillText(t,g.x,g.y-58);c.restore();}
    var P=plates(c);if(!P)return;var left=Math.max(0,8-U.ch.t);c.save();c.textAlign='center';c.textBaseline='middle';
    c.font=cvF(900,wfs(14));c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.65)';c.fillStyle='#ffe7a0';var cx=(P[0].x+P[1].x+P[1].w)/2,ttl=Lg('Удаль '+(U.st+1)+'/3 — выбери:','Valor '+(U.st+1)+'/3 — pick:');c.strokeText(ttl,cx,P[0].y-11);c.fillText(ttl,cx,P[0].y-11);
    for(var j=0;j<2;j++){var r=P[j],k=U.ch.a[j];c.fillStyle=j?'rgba(255,250,236,.95)':'rgba(255,236,170,.97)';c.strokeStyle='#8a5a2b';c.lineWidth=2;rr(c,r.x,r.y,r.w,r.h,10);c.fill();c.stroke();
      c.fillStyle='#2b2117';c.font=cvF(800,wfs(16));c.fillText(Lg(SK[k].n[0],SK[k].n[1]),r.x+r.w/2,r.y+r.h/2,r.w-8);}
    c.fillStyle='rgba(138,90,43,.8)';c.fillRect(P[0].x,P[0].y+P[0].h+3,(P[1].x+P[1].w-P[0].x)*left/8,3);c.restore();});
  // золото победы ×серия: один раз за бой, только из onBattleEnd кампании
  if(typeof winGold==='function'){var wg0=winGold;winGold=function(c,l,st,first){var v=wg0(c,l,st,first);
    if(U&&U.pay&&typeof G!=='undefined'&&G===U.g&&O3.on('udal')){U.pay=0;var k=serMul();if(k>1)v=Math.round(v*k);}return v;};}
  // строка в окне победы (одна на окно; богатырь П1 — главнее)
  OB2.slot('win','udal',function(G,win){if(!U||U.g!==G||!win||U.serB<3)return null;
    return {h:U.serB>=9?Lg('🔥 <b>Богатырская серия!</b> '+wvN(U.serB)+' без прорыва — золото ×1,25','🔥 <b>Heroic streak!</b> '+U.serB+' waves clean — gold ×1.25'):
      Lg('🔥 Серия: '+wvN(U.serB)+' без прорыва — золото ×'+(U.serB>=6?'1,25':'1,1'),'🔥 Streak: '+U.serB+' waves clean — gold ×'+(U.serB>=6?'1.25':'1.1'))};},1);
  return {TH:TH,POT:POT,SK:SK,MUL:O3H.MUL,serMul:serMul,state:function(){return U;}};
})();
