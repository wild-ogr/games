/* ================= UP-RB 24.10 — «Завтра на берегу» (ЗАВТРА ПОДАРОК) =================
   Журнал: hobby-analytics/release-i/fix-2410/UP-RB.md. Почему: 88–93 % не вернувшихся сыграли только 1-ю рыбалку, а обещание «завтра»
   в итогах 1-й рыбалки (rb2-first п.3 tmr) на телефоне ниже края окна — его не видно.
   Что: после итогов первой законченной рыбалки (кнопка «Карта» / «Ещё раз» / цель) — ОДНО окно: гостинец Митяя завтра, подарок дня и серия,
   новое задание дня, донка; сразу в нём «🔔 Напомнить завтра» (VKWebAppAllowNotifications через SOC.ntf, если SOC ещё не спрашивал) и «⭐ В избранное».
   Только VK/ОК (PLAT==='vk'; в ОК SOC сам прячет уведомления и избранное), один раз (S.tips.tmrw), только новичку (1–2-я рыбалка), не в турнире/гостях/лиге/демо.
   Показ окна считается показом №1 вопроса SOC про уведомления (S.soc.ntf.n=1) — дальше SOC спросит №2 на 3-й день, №3 на 7-й, как раньше.
   ?off=tmrw — выключить. Статистика: mod {m:'tmrw', a: show|ntf|ntfok|fav|favok|go}. Синтаксис — старый (как rb2-*). */
(function(){
'use strict';
if(typeof afterRes!=='function'||typeof R2!=='object')return;
var $=function(id){return document.getElementById(id);};
function st(a){try{STAT.ev('mod',{m:'tmrw',a:a});}catch(e){}}
R2.reg('tmrw',{s:'UP-RB',t:'окно «Завтра на берегу» после 1-й рыбалки: подарок, серия, задание, напомнить, избранное'});
function due(g){try{return !R2.off('tmrw')&&PLAT==='vk'&&(typeof ses2!=='function'||ses2())&&/* rules2510: только со 2-го захода (п. 2.6.3) */!window.__demo&&!!g&&!g.tourn&&!g.guest&&!g.cup&&(S.sessions||0)>=1&&((S.sessions||0)<=2||typeof tmrCatch==='function'&&tmrCatch()&&(S.sessions||0)<=30)&&/* rules2510: во 2-м–3-м заходе — после первой рыбалки захода, если окна ещё не было */(S.caught||0)>=1&&/* только новичку: давним игрокам окно не показываем */
  !(S.tips&&S.tips.tmrw);}catch(e){return false;}}
window.RB_TMRW_DUE=due; // BK-RB 24.10: rb2-first (tmr) не дублирует строку «завтра» в итогах, если следом это окно
function row(ic,t,sub,right){return '<div class="r2f-r"><span class="r2f-i">'+ic+'</span><span class="r2f-t">'+t+(sub?' <small>'+sub+'</small>':'')+'</span><b>'+(right||'')+'</b></div>';}
function ntfCan(){try{return !OK&&typeof SOC==='object'&&SOC.ok()&&SOC.can('ntf')&&SOC.ntfDue()&&!(S.soc&&S.soc.ntf&&+S.soc.ntf.n);}catch(e){return false;}}
function favCan(){try{return !OK&&typeof SOC==='object'&&SOC.ok()&&SOC.can('fav');}catch(e){return false;}}
function show(go){
  if(!S.tips)S.tips={};S.tips.tmrw=1;save();
  var rows='',b='maggot';try{b=a3BestBait(0);}catch(e){}
  try{if(!R2.off('tmr')&&(S.sessions||0)<=3)rows+=row('🧺',L('Гостинец Митяя','Mityai\'s treat'),BAIT[b].ic+' ×10','+'+coinsTxt(40));}catch(e){}
  rows+=row('🎁',L('Подарок дня','Daily gift'),L('7 дней подряд — Ведро Петровича','7 days in a row — Petrovich\'s bucket'),'');
  rows+=row('📋',L('Новое задание дня','New daily task'),'','');
  try{if(S.awayD)rows+=row('🔔',L('Донка на ночь — утром улов','Night line — catch in the morning'),'','');}catch(e){}
  var nb=ntfCan(),fb=favCan();
  if(nb){try{S.soc.ntf={n:1,t:nowMs()};save();STAT.ev('soc',{a:'ntf',r:'show',n:1,d:SOC.ntfDay(),w:'tmrw'});}catch(e){}}
  modal('<h2>🌅 '+L('Завтра на берегу','Tomorrow at the river')+'</h2>'
    +'<p class="quote"><b>'+L('Петрович','Petrovich')+'</b>'+L('Приходи завтра — подарок приготовлю. Не потеряй серию!','Come back tomorrow — a gift will be waiting. Don\'t break the streak!')+'</p>'
    +rows
    +((nb||fb)?'<div class="row2" style="margin-top:8px">'+(nb?'<button class="btn noenter" id="tmNtf">🔔 '+L('Напомнить завтра','Remind me')+'</button>':'')
      +(fb?'<button class="btn noenter" id="tmFav">⭐ '+L('В избранное','Favourite')+'</button>':'')+'</div>':'')
    +'<div class="row"><button class="btn green" id="mCancel">🎣 '+L('Дальше','Continue')+'</button></div>');
  st('show');
  if($('tmNtf'))$('tmNtf').onclick=function(){var x=$('tmNtf');x.disabled=true;st('ntf');
    Promise.resolve(SOC.ntf(1)).then(function(y){if(y){st('ntfok');x.textContent='✓ '+L('Напомню','Will remind');try{toast(L('Договорились! Попусту дёргать не стану.','Deal! I won\'t bother you often.'));}catch(e){}}else x.disabled=false;},function(){x.disabled=false;});};
  if($('tmFav'))$('tmFav').onclick=function(){var x=$('tmFav');x.disabled=true;st('fav');
    Promise.resolve(SOC.fav()).then(function(y){if(y){st('favok');x.textContent='✓ '+L('В избранном','In favourites');}else x.disabled=false;},function(){x.disabled=false;});};
  $('mCancel').onclick=function(){try{SND.tap();}catch(e){}st('go');go();};
  if(window.LOOK&&LOOK.walk)try{LOOK.walk($('mcard'));}catch(e){}}
var ar=afterRes;
afterRes=function(g,where){if(!due(g))return ar.apply(this,arguments);var self=this,args=arguments;
  try{hideModal();show(function(){ar.apply(self,args);});}catch(e){ar.apply(self,args);}};
/* ================= UP-RB 24.10 — ЛИГА САМА (как Оборона v4.4) =================
   Было: в живую лигу попадали только через «🏆 Турниры» → карточка «🌐 Живая лига» (лигу видели ~7 из 90 заходов в день).
   Стало (VK, не ОК — ядро hobby-cup ОК пока не знает; только когда cupOn()): с 3-й законченной рыбалки
   1) на главном — плашка «🌐 Живая лига» (гнездо home 'cupg', до знакомства — «новое!»);
   2) окно лиги открывается САМО один раз (S.tips.cupau): окном входа при запуске (R2.enter, после «Почты») или на карте после 3-й рыбалки
      (когда окон нет). Дальше — как обычно: знакомство (имя скрыто по умолчанию), «Рыбалка дня» — попытка, с первой сдачей игрок в группе лиги.
   ?off=cupauto — выключить. Статистика: mod {m:'cupauto', a: show|card}. */
R2.reg('cupauto',{s:'UP-RB',t:'живая лига сама: плашка на главном и одно окно с 3-й рыбалки'});
function cupOk(){try{return !R2.off('cupauto')&&typeof cupOn==='function'&&cupOn()&&PLAT==='vk'&&!OK&&!window.__demo&&(S.sessions||0)>=3;}catch(e){return false;}}
function cupNew(){try{return !(S.cup&&S.cup.ask);}catch(e){return true;}}
function cupAuto(){if(!cupOk()||!cupNew()||(S.tips&&S.tips.cupau))return false;if(!S.tips)S.tips={};S.tips.cupau=1;save();
  try{STAT.ev('mod',{m:'cupauto',a:'show'});}catch(e){}cupOpenL();return true;}
R2.enter('cupauto',60,cupAuto);
R2.slot('home','cupg',{pri:92,when:cupOk,
  html:function(){return '<button class="a3m noenter" id="upCupB">🌐 <b>'+(cupNew()?L('Живая лига — новое! Общая Рыбалка дня','Live league — new! Shared daily contest'):L('Живая лига: Рыбалка дня и турнир недели','Live league: daily and weekly contests'))+'</b> ›</button>';},
  bind:function(el){var b=el.querySelector('button');if(b)b.onclick=function(){try{SND.tap();}catch(e){}try{STAT.ev('mod',{m:'cupauto',a:'card'});}catch(e){}cupOpenL();};}});
var ar2=afterRes;
afterRes=function(g,where){var r=ar2.apply(this,arguments);
  try{if(where==='map'&&g&&!g.tourn&&!g.cup&&cupOk()&&cupNew()&&!(S.tips&&S.tips.cupau)){var n=0,tm=setInterval(function(){
      if(++n>40){clearInterval(tm);return;}
      if(G||modalOn||$('ad').classList.contains('on')||!$('scr-map').classList.contains('on'))return;clearInterval(tm);cupAuto();},500);}}catch(e){}
  return r;};
/* UP-RB 24.10: пробная неделя Клуба (rb2-eco-pay, грузится лениво) задумана подарком в «Утре у Петровича» на 2-й день, но «Утро» открывается
   раньше, чем догружается rb2-eco-pay, — строки нет, подарок висел в «Почте» с «Забрать». «Почта» после «Утра» больше сама не всплывает
   (rb2-first: S.mail.au), поэтому: «Утро» сегодня уже было, файл догрузился, подарок положен — выдать сам (тост «Неделя в Клубе — подарок!»), когда окон нет. */
(function(){var n=0,tm=setInterval(function(){if(++n>90){clearInterval(tm);return;}
  try{var ct=window.ECO_CLUB_TRIAL;if(!ct||!S.r2f||S.r2f.md!==dayNum())return;if(!ct.ok()){clearInterval(tm);return;}
    if(G||modalOn||$('ad').classList.contains('on'))return;clearInterval(tm);ct.take();try{STAT.ev('mod',{m:'tmrw',a:'club'});}catch(e){}try{updDots();}catch(e){}}catch(e){clearInterval(tm);}},1000);})();
window.__upCup={ok:cupOk,auto:cupAuto};
window.__upTmr={due:due,show:show};
})();
