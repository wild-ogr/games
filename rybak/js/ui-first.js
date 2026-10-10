/* RB:UX — «Первые минуты» (блок A буста 08.10.2026) и касания на рыбалке. Механику вываживания НЕ трогает.
   - первая рыбалка — 3 заброса (только самая первая), полоска «Заброс 2 из 3», после 1-й рыбы — цель «ещё 2 заброса — и дед подарит на леску»;
   - «Спокойный режим» одной кнопкой: на 2-й минуте игры или после первой проспанной поклёвки (один раз, S.uiCalmAsk);
   - «Почта» — только после первой законченной рыбалки, и сама не открывается сразу после рыбалки (метка с числом на кнопке);
   - итоги первых 3 рыбалок: улов + большая «Ещё раз», остальное — за «Подробнее»;
   - «Хватает на путёвку — поехали?» (в итогах вместо «в магазин»);
   - реплики деда Митяя висят до касания, «?» в шапке рыбалки повторяет последнюю; на время вываживания облачко прячется;
   - касания: удержание держится, пока на экране есть хоть один палец (второй палец/ладонь не сбрасывают), касание поверх облачка тоже
     держит леску, iOS-отмена касания — подсказка «коснись снова»; в VK — выключен свайп «назад» (VKWebAppSetSwipeSettings);
   - на ПК подсказки про мышь, а не про палец.
   Поля сохранения: S.uiCalmAsk, S.uiTour (неделя, когда звали в турнир). */
(function(){
'use strict';
if(typeof startFish!=='function')return;
var $=function(id){return document.getElementById(id);};
var FIRST_MAX=3,SIMPLE_RES=3;
var MOUSE=false;try{MOUSE=!('ontouchstart' in window)&&!(navigator.maxTouchPoints>0)&&matchMedia('(pointer:fine)').matches;}catch(e){}
window.uiMouse=MOUSE;
var t0=0; // начало игры в этом сеансе (для «2-й минуты»)

/* ---------- первая рыбалка: 3 заброса ---------- */
var sf=startFish;
startFish=function(pi,opt){var r=sf.apply(this,arguments);
  try{if(G&&!G.over&&!G.tourn&&!(S.sessions>0)&&!G.guest&&!(opt&&opt.guest)){G.max=Math.min(G.max,FIRST_MAX);G.uiFirst=1;updHud();}
    if(!t0)t0=Date.now();uiBar();hideOffer();}catch(e){}
  return r;};

/* ---------- полоска «Заброс N из M» + цель ---------- */
function uiBar(){var scr=$('scr-fish');if(!scr||!G)return;var el=$('uiCast');
  var on=!G.tourn&&(S.sessions||0)<SIMPLE_RES&&!G.over;
  scr.classList.toggle('ui-hasbar',!!on);
  uiFight();
  if(!on){if(el)el.style.display='none';return;}
  if(!el){el=document.createElement('div');el.id='uiCast';el.className='ui-cast';scr.appendChild(el);}
  var tot=G.max+(G.extra||0),n=Math.min(tot,Math.max(1,G.used+(G.phase==='aim'?1:0))),fish=G.catch.filter(function(c){return c.id&&!c.lost;}).length;
  var goal='';if(G.uiFirst&&fish>0&&!(S.tips&&S.tips.bonus)&&G.used<tot){var left=tot-G.used;goal=L('Ещё '+left+' '+pl(left,'заброс','заброса','забросов','','')+' — и дед Митяй подарит на леску 🎁',left+' more '+(left>1?'casts':'cast')+' — and Grandpa Mityai gives you coins for a line 🎁');}
  el.style.display='';
  el.innerHTML='<b>'+L('Заброс','Cast')+' '+n+' '+L('из','of')+' '+tot+'</b><span class="ui-cbar">'+Array.apply(null,{length:tot}).map(function(_,i){return '<i class="'+(i<G.used?'on':'')+'"></i>';}).join('')+'</span>'+(goal?'<small>'+goal+'</small>':'');
  if(window.LOOK&&LOOK.walk)try{LOOK.walk(el);}catch(e){}}
var uh=updHud;updHud=function(){uh.apply(this,arguments);try{uiBar();}catch(e){}};
// fix1010b: на время вываживания полоска «Заброс N из M» прячется — иначе ложится прямо на шкалу натяжения лески (рисуется на холсте у верха)
function uiFight(){try{var s=$('scr-fish');if(s)s.classList.toggle('ui-fight',!!(G&&G.phase==='fight'));}catch(e){}}
var dh=doHook;doHook=function(){var r=dh.apply(this,arguments);uiFight();return r;};
// игра могла начать первую рыбалку ещё до загрузки этого файла (bootScreen) — поправить уже идущую
try{if(G&&!G.over&&!G.tourn&&!(S.sessions>0)&&G.used<FIRST_MAX){G.max=Math.min(G.max,FIRST_MAX);G.uiFirst=1;t0=Date.now();updHud();}}catch(e){}

/* ---------- «Спокойный режим» одной кнопкой ---------- */
function hideOffer(){var o=$('uiOffer');if(o)o.remove();}
function offerCalm(why){if(S.uiCalmAsk||calm()||!G||G.tourn||modalOn)return;S.uiCalmAsk=why==='miss'?2:1;save();
  try{STAT.ev('mod',{m:'calm',a:'offer',k:why});}catch(e){}
  var o=document.createElement('div');o.id='uiOffer';o.className='ui-offer';
  o.innerHTML='<p><b>🌿 '+L('Спокойный режим','Calm mode')+'</b>'+(why==='miss'?L('Не успел подсечь? В спокойном режиме подсекать можно дольше, а рыба тянет мягче.','Too slow to strike? Calm mode gives you more time to strike, and fish pull gentler.'):L('Подсекать можно дольше, рыба тянет мягче, без тряски. Включить?','More time to strike, gentler fish, no shaking. Turn it on?'))+'</p>'
    +'<div class="ui-orow"><button class="btn green noenter" id="uiCalmOn">🌿 '+L('Включить','Turn on')+'</button><button class="btn noenter" id="uiCalmNo">'+L('Не надо','No thanks')+'</button></div><small>'+L('Можно поменять в ⚙ Настройках','You can change it in ⚙ Settings')+'</small>';
  $('scr-fish').appendChild(o);if(window.LOOK&&LOOK.walk)try{LOOK.walk(o);}catch(e){}
  $('uiCalmOn').onclick=function(e){e.stopPropagation();SND.tap();S.calm=true;save();applyCalm();try{STAT.ev('mod',{m:'calm',a:'on'});}catch(_){}
    if(G&&G.ft&&!G.ft.small&&G.pk&&G.pk.f){var n=fightNew(G.pk.f,G.pk.w,G.ft.D0,curTk(),calm(),G.R,G.ft.easy);G.ft.calm=n.calm;G.ft.cap=n.cap;G.ft.bmax=n.bmax;G.ft.gear=n.gear;}
    hideOffer();toast('🌿 '+L('Спокойный режим включён','Calm mode is on'),2200);};
  $('uiCalmNo').onclick=function(e){e.stopPropagation();SND.tap();hideOffer();};}
// раз в полсекунды: «2-я минута» (в спокойной фазе) и первая проспанная поклёвка
var lastMiss=0;
setInterval(function(){try{if(!G||G.over||!$('scr-fish').classList.contains('on'))return;
  var ph=G.phase,quiet=ph==='aim'||ph==='wait'||ph==='miss';
  uiFight();
  if(G.phase==='fight'||G.phase==='reel'){var sy=$('say');if(sy&&sy.classList.contains('on')&&sayWho==='mit')sy.classList.remove('on');} // облачко не закрывает рыбу
  if(!S.uiCalmAsk&&!calm()&&!G.tourn){var miss=G.catch.filter(function(c){return c.miss;}).length;
    if(miss>lastMiss&&ph==='miss'){lastMiss=miss;setTimeout(function(){if(G&&!G.over&&(G.phase==='aim'||G.phase==='wait'||G.phase==='miss'))offerCalm('miss');},1700);}
    else if(quiet&&t0&&Date.now()-t0>=60000&&(S.sessions||0)<3&&!$('uiOffer'))offerCalm('time');}
  }catch(e){}},500);

/* ---------- реплики Митяя висят до касания; «?» — повторить ---------- */
var lastTip=null,sv=say;
say=function(who,txt,ms){var r=sv.apply(this,arguments);
  try{if(who==='mit'&&txt&&LANG!=='en'){lastTip=[who,txt];if((S.sessions||0)<SIMPLE_RES||txt.length>60){clearTimeout(sayT);var e=$('say');e.classList.add('ui-hold');}}else{var e2=$('say');if(e2)e2.classList.remove('ui-hold');}}catch(e){}
  return r;};
(function(){var gh=document.querySelector('#scr-fish .gh'),c=$('fCoins');if(!gh||!c)return;var b=document.createElement('button');b.className='icon noenter ui-help';b.id='uiHelp';b.setAttribute('aria-label',L('Подсказка','Hint'));b.textContent='❓';
  gh.insertBefore(b,c);b.onclick=function(e){e.stopPropagation();SND.tap();if(!G)return;
    var t=lastTip?lastTip[1]:G.phase==='fight'?L('Держи палец — подматывай. Краснеет — отпусти!','Hold to reel in. Red — let go!'):G.phase==='aim'?L('Коснись воды — закинем удочку. Куда коснёшься, туда и полетит поплавок.','Tap the water to cast. The float lands where you tap.'):L('Ждём поклёвку. Поплавок нырнул — сразу касайся воды: подсекай!','Wait for a bite. The float dips — tap the water to strike!');
    say.until=0;say('mit',t,8000);clearTimeout(sayT);$('say').classList.add('ui-hold');};})();

/* ---------- касания: удержание по всем пальцам на экране рыбалки ---------- */
var downs={},nDown=0,cancels=0;
function scrOn(){var s=$('scr-fish');return s&&s.classList.contains('on');}
try{window.removeEventListener('pointerup',pUp);window.removeEventListener('pointercancel',pUp);}catch(e){}
document.addEventListener('pointerdown',function(e){if(!scrOn())return;var t=e.target;if(t&&t.closest&&t.closest('button,.btn,#modal,#catch,#ad,a'))return;
  if(t&&t.closest&&t.closest('#uiOffer,.gh,#uiCast'))return;
  if(!downs[e.pointerId]){downs[e.pointerId]=1;nDown++;}
  // палец на облачке Митяя (и прочих надписях поверх воды) — это касание воды: подсечка/удержание лески
  if(t!==cv&&G&&!modalOn){var sy=$('say');if(sy&&sy.classList.contains('ui-hold')){sy.classList.remove('ui-hold');say.until=0;}pDown(e);}},true);
function up(e){if(downs[e.pointerId]){delete downs[e.pointerId];nDown=Math.max(0,nDown-1);}
  if(e.type==='pointercancel'&&G&&(G.phase==='fight'||G.phase==='reel')){cancels++;G.uiTc=(G.uiTc||0)+1;hint(MOUSE?L('Нажми снова и держи','Press again and hold'):L('Коснись снова и держи','Touch again and hold'),true);}
  if(nDown<=0||e.type==='pointercancel'){nDown=0;downs={};pUp();}}
window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
// iOS: долгое касание холста не должно уходить в системные жесты (лупа, выделение, прокрутка страницы)
try{cv.addEventListener('touchstart',function(e){if(G&&!modalOn)e.preventDefault();},{passive:false});cv.addEventListener('touchmove',function(e){e.preventDefault();},{passive:false});}catch(e){}
try{var se=$('say');if(se)se.addEventListener('touchmove',function(e){e.preventDefault();},{passive:false});}catch(e){}
// VK: свайп «назад» не закрывает игру посреди вываживания
function swipeOff(){try{if(PLAT==='vk'&&window.vkBridge&&vkBridge.send)vkBridge.send('VKWebAppSetSwipeSettings',{history:false}).catch(function(){});}catch(e){}}
setTimeout(swipeOff,2500);
// статистика: отмены касаний во время вываживания (раз за рыбалку, если были)
var fin=finish;finish=function(){var g=G;var r=fin.apply(this,arguments);try{if(g&&g.uiTc)STAT.ev('mod',{m:'touch',a:'cancel',k:g.uiTc});}catch(e){}try{uiBar();uiResults(g);}catch(e){}window.__uiFished=1;return r;};

/* ---------- итоги первых рыбалок: улов + большая «Ещё раз» ---------- */
function uiResults(g){var card=$('mcard');if(!g||!$('rWin')||!card)return;
  var trip=card.querySelector('[data-trip]');
  if(g.tourn||(S.sessions||0)>SIMPLE_RES)return;
  var kids=[].slice.call(card.children),cw=card.querySelector('.coins-won'),row=null,i0=kids.indexOf(cw),hid=0;if(i0<0)return;
  for(var i=i0+1;i<kids.length;i++){var k=kids[i];if(k.classList.contains('row')){row=k;break;}
    if(k.classList.contains('quote')||k.id==='mSocBox'||k.querySelector&&k.querySelector('#mSocBox')||k.hasAttribute('data-trip'))continue;
    if(k.offsetHeight===0&&!k.textContent.trim())continue;k.classList.add('ui-more');hid++;}
  card.classList.add('ui-simple');
  var ra=$('rAgain'),rm=$('rMap');if(ra){ra.classList.add('green','ui-big');ra.innerHTML='🎣 '+L('Ещё раз','Again');}
  if(rm)rm.classList.add('ui-small');
  if(hid&&row){var b=document.createElement('button');b.className='ui-moreb noenter';b.textContent=L('Подробнее ▾','More ▾');card.insertBefore(b,row);
    b.onclick=function(){SND.tap();card.classList.remove('ui-simple');b.remove();};}
  if(window.LOOK&&LOOK.walk)try{LOOK.walk(card);}catch(e){}}

/* ---------- «Хватает на путёвку — поехали?» ---------- */
var gh0=goalHtml;goalHtml=function(cmp){try{var o=goalNext();if(cmp&&o&&o.go==='p'&&S.coins>=o.p)
    return '<button class="goalb ok noenter ui-trip" id="rGoal" data-trip="1">🎫 '+L('Хватает на путёвку: <b>'+esc(nm(PLACES[o.i]))+'</b> — поехали?','You can afford a trip to <b>'+esc(nm(PLACES[o.i]))+'</b> — let\'s go?')+'</button>';}catch(e){}
  return gh0.apply(this,arguments);};

/* ---------- «Почта» — только после первой рыбалки; сама не открывается сразу после рыбалки ---------- */
var ms=maybeStreak;maybeStreak=function(){try{if(!(S.sessions>0)){updDots();return;}if(window.__uiFished&&!G&&!modalOn){a3MailDeliver();updDots();if(window.uiHomeBuild&&$('scr-map').classList.contains('on'))uiHomeBuild();return;}}catch(e){}
  return ms.apply(this,arguments);};

/* ---------- ПК: подсказки про мышь ---------- */
function mouseTxt(t){if(!MOUSE||typeof t!=='string')return t;
  return t.replace(/Держи палец/g,'Держи кнопку мыши').replace(/держи палец/g,'держи кнопку мыши').replace(/отпусти палец/g,'отпусти кнопку').replace(/Отпусти палец/g,'Отпусти кнопку')
    .replace(/отпускай палец/g,'отпускай кнопку').replace(/Коснись воды/g,'Нажми на воду').replace(/коснись воды/g,'нажми на воду').replace(/Коснись/g,'Нажми').replace(/коснись/g,'нажми').replace(/касайся/g,'жми');}
var hn=hint;hint=function(t,big){return hn.call(this,mouseTxt(t),big);};
var sv2=say;say=function(who,txt,ms){return sv2.call(this,who,mouseTxt(txt),ms);};
window.uiMouseTxt=mouseTxt;
})();
