/* RB:UX-win — окна игры в едином виде «Стекло и свет» (буст 08.10.2026, поток UX, ветка rb-ux-win).
   Окна: выбор времени pickTime, турнир openWeek (+ «Рыбалка дня» Яндекса), звания openRank, настройки openSettings,
   почта openMail (FB1), цели openDaily (A3), прогноз openFore (A3), заказы openOrders, книга места openBook, «Не хватает монет» notEnough.
   Как: переписанные окна (pickTime, openWeek, openRank, openFore, openOrders, openBook) — те же id кнопок и те же обработчики, что в последних версиях;
   обёрнутые (openSettings, openMail, openDaily, notEnough) — старая цепочка (A3, FB1, темы) отрабатывает целиком, потом перестраивается вёрстка.
   Общее окно modal(): класс #mcard.uw (+ uw-<окно>) — на ПК (≥900 px) окно до 720 px, длинные списки в 2 колонки.
   Свои рисунки — инлайн SVG (медали, кубок, сцены времени суток, лица писем), эмодзи в тексте меняет js/look.js.
   Правила и пояснения — под «Как это работает ›» (.uw-how). Механику, экономику, рекламу, звук не трогает. Новых полей сохранения нет. */
(function(){
'use strict';
if(typeof modal!=='function'||typeof pickTime!=='function')return;
var $=function(id){return document.getElementById(id);};
var UID=0;function uid(){return 'uw'+(++UID);}
function biteLv(m){return m>1.2?3:m>.95?2:1;}
function dots(n){var h='<span class="uw-dots" aria-label="'+L('клёв ','bite ')+n+'/3">';for(var k=1;k<=3;k++)h+='<i class="'+(k<=n?'on':'')+'"></i>';return h+'</span>';}
function biteWord(n){return n>=3?L('клёв сильный','strong bite'):n>=2?L('клёв хороший','good bite'):L('клёв слабый','weak bite');}
function plN(n,a,b,c,e1,e2){return typeof pl==='function'?pl(n,a,b,c,e1,e2):a;}

/* ---------- общее окно: класс окна, «Как это работает ›» ---------- */
var _modal=modal;
function clean(){var mc=$('mcard');if(!mc)return;mc.className=mc.className.split(/\s+/).filter(function(c){return c&&c!=='uw'&&c.indexOf('uw-')!==0;}).join(' ');}
modal=function(){clean();return _modal.apply(this,arguments);};
var _hide=hideModal;hideModal=function(){var r=_hide.apply(this,arguments);clean();return r;};
function mark(name){var mc=$('mcard');if(!mc)return mc;mc.classList.add('uw');mc.classList.add('uw-'+name);return mc;}
function how(title,html,open){return '<div class="uw-how'+(open?' open':'')+'"><button type="button" class="uw-howb noenter">'+title+' <i>›</i></button><div class="uw-howt">'+html+'</div></div>';}
(function(){var mc=$('mcard');if(!mc)return;mc.addEventListener('click',function(e){var t=e.target;for(;t&&t!==mc;t=t.parentNode){if(t.classList&&t.classList.contains('uw-howb')){var p=t.parentNode;p.classList.toggle('open');try{SND.tap();}catch(_){}return;}}});})();
function walk(el){if(window.LOOK&&LOOK.walk)try{LOOK.walk(el);}catch(e){}}

/* ---------- рисунки ---------- */
// медаль: 0 бронза, 1 серебро, 2 золото, -1 — серая (ещё нет)
var MD=[['#f0b47a','#c47a3c','#8a4f1f'],['#f4f7f9','#c2ccd3','#808d97'],['#ffe590','#f2b705','#a87410'],['#8a949b','#5d676e','#3e464c']];
function medal(t,sz,num){var c=MD[t<0||t>2?3:t];sz=sz||40;
  return '<svg class="uw-md" viewBox="0 0 48 60" width="'+sz+'" height="'+Math.round(sz*1.25)+'" aria-hidden="true"><path d="M13 1h9l7 21h-9z" fill="'+(t<0?'#56616a':'#2f7de1')+'"/><path d="M35 1h-9l-7 21h9z" fill="'+(t<0?'#6b757d':'#e0533a')+'"/>'
    +'<circle cx="24" cy="39" r="17" fill="'+c[2]+'"/><circle cx="24" cy="38" r="16" fill="'+c[1]+'"/><circle cx="24" cy="38" r="12" fill="'+c[0]+'"/><circle cx="24" cy="38" r="12" fill="none" stroke="'+c[2]+'" stroke-opacity=".45" stroke-width="1.5"/>'
    +(num!=null?'<text x="24" y="43.5" text-anchor="middle" font-size="15" font-weight="700" font-family="sans-serif" fill="'+c[2]+'">'+num+'</text>':'<path d="M24 30.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" fill="'+c[2]+'" fill-opacity=".75"/>')
    +'<ellipse cx="18.5" cy="31" rx="5" ry="2.6" fill="#fff" opacity=".35" transform="rotate(-30 18.5 31)"/></svg>';}
function cup(sz){var g=uid();sz=sz||72;
  return '<svg class="uw-cup" viewBox="0 0 80 80" width="'+sz+'" height="'+sz+'" aria-hidden="true"><defs><linearGradient id="'+g+'" x1="0" x2="1"><stop offset="0" stop-color="#ffe9a3"/><stop offset=".5" stop-color="#f4bf3a"/><stop offset="1" stop-color="#c98a12"/></linearGradient></defs>'
    +'<ellipse cx="40" cy="74" rx="24" ry="4" fill="#000" opacity=".2"/><path d="M18 14c-12 0-12 20 4 22M62 14c12 0 12 20-4 22" stroke="#d99a1c" stroke-width="5" fill="none" stroke-linecap="round"/>'
    +'<path d="M18 8h44v12c0 16-10 26-22 26S18 36 18 20z" fill="url(#'+g+')"/><path d="M36 45h8v11h-8z" fill="#d99a1c"/><path d="M26 56h28l3 10H23z" fill="url(#'+g+')"/><rect x="22" y="64" width="36" height="6" rx="2" fill="#8a5a12"/>'
    +'<path d="M40 16l3 6 6.5.9-4.7 4.6 1.1 6.5-5.9-3.1-5.9 3.1 1.1-6.5-4.7-4.6 6.5-.9z" fill="#fff6d6" opacity=".9"/><path d="M24 12c0 10 2 17 7 22" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';}
// сцена времени суток для плитки
var SKY={morning:['#f7b6a0','#fde3b0','#f5a35c'],day:['#6fb4e6','#bfe3f7','#fff3b0'],evening:['#5b4a8c','#f08a5d','#ffbf5c'],night:['#0f1d3a','#29406b','#f4f1d0']};
function scene(t){var s=SKY[t]||SKY.day,g=uid(),w=uid(),sun='';
  if(t==='morning')sun='<circle cx="84" cy="34" r="11" fill="'+s[2]+'"/>';
  else if(t==='day')sun='<circle cx="88" cy="16" r="9" fill="'+s[2]+'"/><circle cx="88" cy="16" r="14" fill="'+s[2]+'" opacity=".25"/>';
  else if(t==='evening')sun='<circle cx="30" cy="33" r="12" fill="'+s[2]+'"/>';
  else sun='<path d="M90 10a9 9 0 1 0 6 16 11 11 0 0 1-6-16z" fill="'+s[2]+'"/><circle cx="20" cy="12" r="1.2" fill="#fff"/><circle cx="44" cy="8" r="1" fill="#fff"/><circle cx="62" cy="18" r="1.3" fill="#fff"/><circle cx="34" cy="24" r=".9" fill="#fff"/><circle cx="108" cy="30" r="1" fill="#fff"/>';
  var hill=t==='night'?'#0b1428':t==='evening'?'#3b2f55':t==='morning'?'#8a7a80':'#5f8f6a';
  var wat=t==='night'?['#14284a','#0a1630']:t==='evening'?['#7a5a7a','#3b3555']:t==='morning'?['#f0b9a0','#9aa8b8']:['#7cc2e6','#3f86b0'];
  return '<svg viewBox="0 0 120 56" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+s[0]+'"/><stop offset="1" stop-color="'+s[1]+'"/></linearGradient><linearGradient id="'+w+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+wat[0]+'"/><stop offset="1" stop-color="'+wat[1]+'"/></linearGradient></defs>'
    +'<rect width="120" height="56" fill="url(#'+g+')"/>'+sun+'<path d="M0 40c14-6 26-7 38-3s24 2 36-3 30-4 46 1v9H0z" fill="'+hill+'"/><rect y="42" width="120" height="14" fill="url(#'+w+')"/>'
    +'<path d="M10 47h18M48 50h26M86 47h20" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" stroke-linecap="round"/></svg>';}
// лица писем и заказчиков: кроме Петровича и Митяя (js/look.js) — свои
var FACE={wife:{bg:'#e7a6ae',sk:'#efc19e',sh:'#b8475a',hr:'#6b3f26',hs:'long'},
  vnuk:{bg:'#8ec5e8',sk:'#f2c7a0',sh:'#3f7fc2',hr:'#d9a441',hs:'short'},
  nyura:{bg:'#c9b6e4',sk:'#e6b48f',sh:'#7a4f9a',hr:'#d0423b',hs:'kerch',gl:1},
  sem:{bg:'#8fae7a',sk:'#d9a77c',sh:'#3b5a46',hr:'#2e4a3a',hs:'cap',mu:'#6b4a33'},
  zina:{bg:'#f2c46a',sk:'#edbb92',sh:'#2f8f83',hr:'#b0402e',hs:'curl'},
  post:{bg:'#9fc6d9',sk:'#ecbc95',sh:'#2a4f8f',hr:'#3a2a20',hs:'capw',cap:'#2a4f8f'},
  zinab:{bg:'#e9b8c9',sk:'#e6b48f',sh:'#4f7a9a',hr:'#6a8fc0',hs:'kerch',gl:1},
  luba:{bg:'#f0b48a',sk:'#f0c4a0',sh:'#c0583a',hr:'#8a4a22',hs:'long'},
  kum:{bg:'#a7b8c4',sk:'#d4a07a',sh:'#5a4a3a',hr:'#3a3a3a',hs:'short',mu:'#3a3030'},
  valya:{bg:'#9ec9b8',sk:'#efc19e',sh:'#1f4f6f',hr:'#c98a3a',hs:'capw',cap:'#1f4f6f'}};
function face(k){if((k==='petr'||k==='mit')&&window.LOOK&&LOOK.av)return LOOK.av(k);var o=FACE[k];if(!o)return '';
  var h='<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="'+o.bg+'"/>';
  if(o.hs==='long')h+='<path d="M17 34c-3-15 5-23 15-23s18 8 15 23c-1 7-3 10-6 11V27H23v18c-3-1-5-4-6-11z" fill="'+o.hr+'"/>';
  h+='<path d="M10 64c2-14 10-20 22-20s20 6 22 20z" fill="'+o.sh+'"/><circle cx="32" cy="30" r="13" fill="'+o.sk+'"/>';
  if(o.hs==='short'||o.hs==='long')h+='<path d="M19 28c-1-10 5-15 13-15s14 5 13 15c-3-5-8-7-13-7s-10 2-13 7z" fill="'+o.hr+'"/>';
  else if(o.hs==='curl')h+='<circle cx="22" cy="22" r="5" fill="'+o.hr+'"/><circle cx="29" cy="17" r="5.5" fill="'+o.hr+'"/><circle cx="37" cy="17" r="5.5" fill="'+o.hr+'"/><circle cx="43" cy="23" r="5" fill="'+o.hr+'"/>';
  else if(o.hs==='kerch')h+='<path d="M16 32c0-13 7-20 16-20s16 7 16 20c-3-7-9-10-16-10s-13 3-16 10z" fill="'+o.hr+'"/><circle cx="25" cy="17" r="1.3" fill="#fff" opacity=".7"/><circle cx="33" cy="15" r="1.3" fill="#fff" opacity=".7"/><circle cx="40" cy="18" r="1.3" fill="#fff" opacity=".7"/>';
  else if(o.hs==='cap')h+='<path d="M18 25c1-11 27-11 28 0z" fill="'+o.hr+'"/><path d="M15 25h34v3.5H15z" fill="#1d2a22"/><circle cx="32" cy="19" r="2.2" fill="#f2c94c"/>';
  else if(o.hs==='capw')h+='<path d="M20 26c-2-9 5-13 12-13s14 4 12 13" fill="'+o.hr+'"/><path d="M18 22c2-8 26-8 28 0l2 3H16z" fill="'+o.cap+'"/>';
  h+='<circle cx="27" cy="31" r="1.7" fill="#2a211b"/><circle cx="37" cy="31" r="1.7" fill="#2a211b"/><circle cx="23.5" cy="35" r="2.3" fill="#e5806f" opacity=".35"/><circle cx="40.5" cy="35" r="2.3" fill="#e5806f" opacity=".35"/>';
  if(o.mu)h+='<path d="M26 36c2-1.8 4-1.8 6-.2 2-1.6 4-1.6 6 .2-2 2.2-4 2.2-6 1-2 1.2-4 1.2-6-1z" fill="'+o.mu+'"/>';
  else h+='<path d="M27.5 36.5c3 2.4 6 2.4 9 0" stroke="#8a3b2a" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  if(o.gl)h+='<circle cx="27" cy="31" r="4" fill="none" stroke="#5a4a3a" stroke-width="1.2"/><circle cx="37" cy="31" r="4" fill="none" stroke="#5a4a3a" stroke-width="1.2"/><path d="M31 31h2" stroke="#5a4a3a" stroke-width="1.2"/>';
  return h+'</svg>';}
var ICO={vib:'<rect class="d" x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2M3.5 9v6M20.5 9v6"/>',
  bird:'<path class="d" d="M4 14c0-4.5 3.5-8 8-8 2.4 0 4 1.3 5 3l3.5 1-3 1.6c0 4.2-3.2 7.4-7.5 7.4H5.5z"/><circle cx="15" cy="9.5" r=".9"/><path d="M8 14c2 .5 4 0 5.5-1.5"/>'};
var ORD_FACE=['zinab','mit','','luba','kum','','valya'];
// значок звания: звезда в круге, цвет растёт со званием
var RK_C=['#9aa3a8','#7fb3d5','#6be3b0','#e0a46a','#c7d3db','#ffd27a','#ff9a6b'];
function rankBadge(i,sz,off){var c=off?'#56616a':RK_C[Math.min(i,RK_C.length-1)];sz=sz||56;
  return '<svg class="uw-rk" viewBox="0 0 64 64" width="'+sz+'" height="'+sz+'" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="'+c+'" opacity="'+(off?.35:.25)+'"/><circle cx="32" cy="32" r="23" fill="'+c+'"'+(off?' opacity=".5"':'')+'/><circle cx="32" cy="32" r="23" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>'
    +'<path d="M32 17l4.4 9 9.9 1.4-7.2 7 1.7 9.8L32 39.6l-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4z" fill="#fff" fill-opacity="'+(off?.45:.92)+'"/>'+(i>0?'<text x="32" y="58" text-anchor="middle" font-size="11" font-weight="700" font-family="sans-serif" fill="#fff" fill-opacity=".8"></text>':'')+'</svg>';}
// копилка для «Не хватает монет»
function jar(sz){sz=sz||72;var g=uid();
  return '<svg viewBox="0 0 80 80" width="'+sz+'" height="'+sz+'" aria-hidden="true"><defs><radialGradient id="'+g+'" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffe9a3"/><stop offset=".55" stop-color="#f4bf3a"/><stop offset="1" stop-color="#c98a12"/></radialGradient></defs>'
    +'<ellipse cx="40" cy="74" rx="26" ry="4" fill="#000" opacity=".2"/><rect x="18" y="14" width="44" height="58" rx="14" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.55)" stroke-width="2"/><rect x="24" y="8" width="32" height="9" rx="3" fill="#a87a4a"/>'
    +'<circle cx="32" cy="60" r="8" fill="url(#'+g+')"/><circle cx="48" cy="61" r="8" fill="url(#'+g+')"/><circle cx="40" cy="50" r="8" fill="url(#'+g+')"/><path d="M24 22v36" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/></svg>';}

/* =====================================================================
   1) Выбор времени суток: 2×2 плитки (ПК — 4 в ряд), крупный клёв точками, «сейчас»
   ===================================================================== */
pickTime=function(i){var P=PLACES[i],now=todOf(hourNow()),lg=LEG[P.leg];
  var tiles=TODS.map(function(t){var c=condFor(i,t),bl=biteLv(a2BiteM(i,t,c.wx)),lt=!S.legs[P.leg]&&(S.visit[i]||0)>=3&&lg.tod.indexOf(t)>=0,isNow=t===now;
    return '<button class="btn uw-tod'+(isNow?' green':' noenter')+(isNow?' now':'')+' b'+bl+'" data-t="'+t+'"><span class="uw-sc">'+scene(t)+(isNow?'<em class="uw-now">'+L('сейчас','now')+'</em>':'')+(lt?'<em class="uw-leg">✨ '+L('легенда','legend')+'</em>':'')+'</span>'
      +'<span class="uw-tb"><b class="uw-tn">'+L(TOD_N[t][0],TOD_N[t][1])+' <span class="uw-wx">'+WX_IC[c.wx]+'</span></b>'+dots(bl)+'<small class="uw-bw">'+biteWord(bl)+'</small>'+a2TodWho(i,t,c.wx)+'</span></button>';}).join('');
  var lh='';try{lh=legHint(i);}catch(e){}
  modal('<div class="uw-hd"><h2>'+esc(nm(P))+'</h2><p class="uw-sub">'+L('Когда едем?','When do we go?')+'</p></div>'
    +(weakFor(i)?'<p class="uw-warn">⚠️ '+L('Снасть слабовата для здешней крупной рыбы — загляни в «Снасти».','Big fish here may snap your tackle — visit the tackle shop.')+'</p>':'')
    +'<div class="uw-tods">'+tiles+'</div>'
    +'<div class="uw-pex">'+a2PickExtra(i)+'</div>'+(lh?'<p class="uw-note">'+lh+'</p>':'')
    +how(L('Как это работает','How it works'),'<p>'+L('Точки — это клёв: ●●● — берёт часто, ● — ждать дольше. На зорьке (утром и вечером) клюёт лучше. Под точками — кто сейчас берёт охотнее всего.','Dots show the bite: ●●● — often, ● — a longer wait. Dawn and dusk are best.')+'</p>')
    +'<div class="row"><button class="btn" id="mCancel">'+L('Назад','Back')+'</button></div>');
  mark('pick');
  $('mcard').querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){startFish(i,{tod:b.dataset.t});};});$('mCancel').onclick=hideModal;a2PickBind(i);};

/* =====================================================================
   2) Турнир недели — как событие: кубок, таймер, «твой лучший», лестница медалей, «Участвовать»; правила — под «Как считается ›»
   ===================================================================== */
function leftChip(){var n=weekLeft();return n<=1?L('последний день','last day'):L('ещё '+n+' '+plN(n,'день','дня','дней','',''),n+' days left');}
openWeek=function(){STAT.screen('week');var pi=weekPlace(),P=PLACES[pi],b=LB.best(),t=TOURN_TK,tr=b?tourTier(pi,b):-1,dy=dayOn(),n=TOURN_NORM[pi]||TOURN_NORM[0];
  var dh='';
  if(dy){var s=dayState(),dp=dayPlace(),can=s.n<1,canAd=!can&&!s.ad&&adOk();if(canAd)STAT.offer('day');
    dh='<div class="tcard uw-day"><div class="uw-dayh"><span class="uw-ic">📅</span><span><b>'+L('Рыбалка дня','Fishing of the day')+'</b><small>'+esc(nm(PLACES[dp]))+' · '+L(TOD_N[dayTod()][0],TOD_N[dayTod()][1]).toLowerCase()+'</small></span><span class="uw-dbest"><small>'+L('сегодня','today')+'</small><b>'+(s.best?kgTxt(s.best/1000):'—')+'</b></span></div>'
      +'<p class="uw-small">'+L('Сегодня у всех одно место, снасть и червь. Попыток','Same place, tackle and worms for all today. Tries')+': '+(can?L('1 бесплатная','1 free'):canAd?L('ещё 1 за рекламу','1 more for an ad'):L('на сегодня всё','none left today'))+'</p>'
      +'<div class="row">'+(can?'<button class="btn green" id="dyGo">🎣 '+L('Ловить','Go fishing')+'</button>':canAd?'<button class="btn accent noenter" id="dyAd">📺 '+L('Ещё попытка за рекламу','One more try for an ad')+'</button>':'')+(LB.ok()?'<button class="btn blue noenter" id="dyLb">🏆 '+L('Таблица дня','Today\'s board')+'</button>':'')+'</div></div>';}
  // лучший результат и сколько до следующей медали
  var nx=tr<2?n[tr+1]:0,bar='';
  if(b&&tr<2){var lo=tr>=0?n[tr]:0;bar='<span class="uw-bar"><i style="width:'+Math.max(4,Math.min(100,Math.round((b-lo)/(nx-lo)*100)))+'%"></i></span><small>'+L('до','to')+' '+L(MEDAL_N[tr+1][0],MEDAL_N[tr+1][1])+' — '+(LANG==='en'?'':'ещё ')+kgTxt((nx-b)/1000)+'</small>';}
  var best='<div class="uw-best"><small>'+L('Твой лучший улов','Your best')+'</small><div class="uw-bv">'+(tr>=0?medal(tr,34):'')+'<b>'+(b?kgTxt(b/1000):'—')+'</b></div>'
    +(b?(tr>=0?'<small class="uw-got">'+L(MEDAL_N[tr][0],MEDAL_N[tr][1])+(tr<2?'':' — '+L('высшая ступень!','top tier!'))+'</small>':'<small>'+L('пока без медали','no medal yet')+'</small>'):'<small>'+L('Пять забросов — и ты в турнире','Five casts and you\'re in')+'</small>')+bar+'</div>';
  var lad='<div class="uw-lad">'+[0,1,2].map(function(k){return '<div class="uw-st s'+k+(tr>=k?' got':'')+(tr+1===k?' next':'')+'">'+medal(k,40)+'<b>'+kgTxt(n[k]/1000)+'</b><small>+'+coinsTxt(CUP_C[k+1])+'</small>'+(tr>=k?'<i class="uw-ok">✓</i>':'')+'</div>';}).join('')+'</div>';
  var rules='<p>'+L('Пять забросов, в зачёт — общий вес улова. Считается лучшая попытка недели — пробовать можно сколько угодно.','Five casts, total weight counts. Your best attempt of the week counts.')+'</p>'
    +'<p>'+L('Снасть казённая, у всех одинаковая: ','Everyone gets the same tackle: ')+esc(L(TACKLE.rod.lv[t.rod][0],TACKLE.rod.lv[t.rod][1]).toLowerCase())+', '+esc(L(TACKLE.line.lv[t.line][0],TACKLE.line.lv[t.line][1]).toLowerCase())+', '+esc(L(TACKLE.reel.lv[t.reel][0],TACKLE.reel.lv[t.reel][1]))+'; '+L('наживка — червь.','bait — worms.')+'</p>'
    +'<p>'+L('Награда в понедельник: кубок в альбом и монеты по медали; за участие','Reward on Monday: a cup for the album and coins by medal; for taking part')+' — '+coinsTxt(CUP_C[0])+'.</p>';
  modal('<div class="uw-ev"><div class="uw-evh">'+cup(76)+'<div><h2>'+(dy?L('Турниры','Contests'):L('Турнир недели','Weekly contest'))+'</h2>'+(dy?'<p class="uw-sub">'+L('Турнир недели','Weekly contest')+'</p>':'')+'<span class="uw-timer">🕑 '+leftChip()+'</span></div></div>'
    +'<p class="uw-plc">📍 <b>'+esc(nm(P))+'</b> · '+esc(L(P.reg,P.regE))+'</p>'+best+lad
    +'<div class="row"><button class="btn green uw-main" id="wGo">🎣 '+L('Участвовать','Take part')+'</button>'+(LB.ok()?'<button class="btn blue noenter" id="wLb">🏆 '+L('Таблица','Leaderboard')+'</button>':'')+'</div>'
    +how(L('Как считается','How it works'),rules)+'</div>'+dh+'<div class="row"><button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div>');
  mark('week');
  $('wGo').onclick=function(){startFish(pi,{tourn:true});};if($('wLb'))$('wLb').onclick=function(){LB.show(openWeek);};$('mCancel').onclick=hideModal;
  if($('dyGo'))$('dyGo').onclick=function(){dayStart(false);};if($('dyLb'))$('dyLb').onclick=function(){LB.show(openWeek,'day');};
  if($('dyAd'))$('dyAd').onclick=function(){if(adHold('day'))return;hideModal();STAT.place('day');showRewarded(function(){dayStart(true);},function(){openWeek();},
    /* поздний зачёт (adt) — как в index.html: попытка ещё не взята — вернуть кнопкой «Ловить», иначе монеты по цене ролика */
    function(){var s=dayState();if(s.ad||s.n<1)return adLateCoins();s.ad=1;s.n=0;save();if(modalOn&&$('dyAd'))openWeek();return L('ещё одна попытка в «Рыбалке дня»: Турниры → «Ловить»','one more try in Fishing of the day: Contests → Go fishing');});};};

/* =====================================================================
   3) Звания: медаль звания, полоса до следующего, лесенка званий значками, достижения — сеткой значков
   ===================================================================== */
openRank=function(){STAT.screen('rank');var n=S.caught||0,r=rankOf(n),i=RANKS.indexOf(r),nx=RANKS[i+1],got=ACH.filter(function(a){return S.ach[a.id];}).length;
  var p=nx?Math.round((n-r[0])/(nx[0]-r[0])*100):100;
  var lad='<div class="uw-rks">'+RANKS.map(function(x,k){return '<span class="uw-rki'+(k<=i?' on':'')+(k===i?' cur':'')+'" title="'+esc(L(x[1],x[2]))+'">'+rankBadge(k,34,k>i)+'</span>';}).join('')+'</div>';
  var ach='<div class="uw-ach">'+ACH.filter(function(a){return S.ach[a.id];}).concat(ACH.filter(function(a){return !S.ach[a.id];})).map(function(a){var ok=!!S.ach[a.id];return '<div class="uw-a'+(ok?' ok':'')+'"><span class="uw-ab">'+a.ic+(ok?'<i class="uw-ok">✓</i>':'<i class="uw-lk">🔒</i>')+'</span><b>'+esc(L(a.n,a.e))+'</b><small>'+(LANG==='en'?'':esc(a.d)+'<br>')+'+'+coinsTxt(a.r)+'</small></div>';}).join('')+'</div>';
  modal('<div class="uw-rh">'+rankBadge(i,84)+'<div><small>'+L('Твоё звание','Your rank')+'</small><h2>'+L(r[1],r[2])+'</h2></div></div>'
    +'<div class="uw-nums"><div><b>'+n+'</b><small>'+L('поймано рыб','fish caught')+'</small></div><div><b>'+kgTxt((S.bigW||0)/1000)+'</b><small>'+L('самая крупная','biggest')+'</small></div><div><b>'+(S.sessions||0)+'</b><small>'+L('рыбалок','trips')+'</small></div></div>'
    +(nx?'<div class="uw-next"><span>'+L('До звания','Next rank')+' «'+esc(L(nx[1],nx[2]))+'»</span><b>'+(LANG==='en'?'':'ещё ')+(nx[0]-n)+' '+plN(nx[0]-n,'рыба','рыбы','рыб','fish','fish')+'</b><span class="uw-bar g"><i style="width:'+Math.max(3,p)+'%"></i></span></div>':'<div class="uw-next"><b>'+L('Высшее звание!','Top rank!')+'</b></div>')
    +lad+'<div class="uw-skill">'+a2SkillHtml()+'</div>'
    +'<div class="uw-gh">🏅 '+L('Достижения','Achievements')+' · '+got+' '+L('из','of')+' '+ACH.length+'</div>'+ach
    +'<div class="row"><button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div>');
  mark('rank');$('mCancel').onclick=hideModal;};

/* =====================================================================
   4) Настройки: группы «Игра» (Спокойный режим, лупа, звук…), «Оформление», «Покупки и прочее»; крупные переключатели
   ===================================================================== */
var _os=openSettings;
openSettings=function(){_os.apply(this,arguments);try{setTidy();}catch(e){try{console.error(e);}catch(_){}}};
function setTidy(){var mc=$('mcard'),row=null;if(!mc||!$('stSnd'))return;mark('set');
  var rows=mc.querySelectorAll('.row');row=rows[rows.length-1];if(!row)return;
  // переключатели «вкл/выкл» → крупный ползунок (слово остаётся для экранного диктора)
  mc.querySelectorAll('.set>i').forEach(function(x){var t=(x.textContent||'').trim();if(t===L('вкл','on')||t===L('выкл','off')){x.classList.add('uw-sw');x.setAttribute('aria-label',t);}});
  var calmB=$('stCalm');if(calmB)calmB.classList.add('uw-key');
  // 📳 и 🐦 не входят в значки look.js — свои линии
  [['stVib','📳','vib'],['stAmb','🐦','bird']].forEach(function(x){var b=$(x[0]),sp=b&&b.querySelector('span');if(!sp||!sp.firstChild||sp.firstChild.nodeType!==3)return;var t=sp.firstChild.nodeValue;if(t.indexOf(x[1])!==0)return;
    var ic=document.createElement('lk-i');ic.className='i-'+x[2];ic.innerHTML='<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+ICO[x[2]]+'</svg><lk-t>'+x[1]+'</lk-t>';sp.firstChild.nodeValue=t.slice(x[1].length);sp.insertBefore(ic,sp.firstChild);});
  var cols=document.createElement('div');cols.className='uw-cols';
  function grp(title,list){var els=list.map(function(x){return typeof x==='string'?$(x):x;}).filter(Boolean);if(!els.length)return null;
    var sec=document.createElement('div');sec.className='uw-grp';sec.innerHTML=els.length>1?'<div class="uw-gh">'+title+'</div>':'';els.forEach(function(e){sec.appendChild(e);});return sec;}
  var pay=mc.querySelector('.pay');if(pay){var h3=pay.querySelector('h3');if(h3)h3.style.display='none';}
  var g1=grp('🎣 '+L('Игра','Game'),['stCalm','stLoupe','stSnd','stVib','stAmb']),g2=grp('🎨 '+L('Оформление','Looks'),['stTheme']),
      g3=grp('🛒 '+L('Покупки и прочее','Purchases and more'),[pay,'stShop','stClub','stSoc','stStat']);
  var c1=document.createElement('div'),c2=document.createElement('div');c1.className='uw-col';c2.className='uw-col';
  if(g1)c1.appendChild(g1);if(g2)c2.appendChild(g2);if(g3)c2.appendChild(g3);cols.appendChild(c1);if(c2.firstChild)cols.appendChild(c2);
  row.parentNode.insertBefore(cols,row);row.classList.add('uw-setrow');
  // кнопки, которые держали старую ссылку на окно
  try{$('btnSet').onclick=openSettings;$('fSet').onclick=openSettings;}catch(e){}
  walk(cols);}

/* =====================================================================
   5) Почта (FB1): главная «Забрать всё», письма — карточками с лицами
   ===================================================================== */
var _om=openMail;
openMail=function(){_om.apply(this,arguments);try{mailTidy();}catch(e){try{console.error(e);}catch(_){}}};
function mailTidy(){var mc=$('mcard');if(!mc||!$('mCancel'))return;mark('mail');
  var h2=mc.querySelector('h2');if(h2&&!mc.querySelector('.uw-mh')){var hd=document.createElement('div');hd.className='uw-mh';hd.innerHTML='<span class="uw-env">'+envelope()+'</span>';h2.parentNode.insertBefore(hd,h2);hd.appendChild(h2);var fh=mc.querySelector('.fbhead');if(fh)hd.appendChild(fh);}
  mc.querySelectorAll('[data-l]').forEach(function(b){var x=LETTERS[b.dataset.l];if(!x)return;var ai=b.querySelector('.ai');var f=face(x.fr);if(ai&&f){ai.innerHTML=f;ai.classList.add('uw-face');}});
  mc.querySelectorAll('.a3g.rdy:not([data-l])').forEach(function(el){el.classList.add('uw-rw');});
  // письма — сеткой (на ПК в 2 колонки)
  var sect=null;mc.querySelectorAll('.sect').forEach(function(s){sect=s;});
  if(sect){var box=document.createElement('div');box.className='uw-letters';var n=sect.nextSibling;while(n&&n.classList&&n.classList.contains('a3g')){var nn=n.nextSibling;box.appendChild(n);n=nn;}sect.parentNode.insertBefore(box,sect.nextSibling);}
  var all=$('mlAll');if(all)all.classList.add('uw-main');var rd=$('mlRead');if(rd)rd.classList.add('uw-main');}
function envelope(){return '<svg viewBox="0 0 80 64" width="72" height="58" aria-hidden="true"><ellipse cx="40" cy="60" rx="28" ry="3.5" fill="#000" opacity=".18"/><rect x="8" y="12" width="64" height="44" rx="7" fill="#f6efe0"/><path d="M8 18l32 22 32-22" fill="none" stroke="#c9b48a" stroke-width="3" stroke-linejoin="round"/><path d="M8 52l24-18M72 52L48 34" stroke="#e2d4b4" stroke-width="2"/><circle cx="62" cy="14" r="9" fill="#e0533a"/><path d="M62 9.5v5.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="62" cy="18.5" r="1.4" fill="#fff"/></svg>';}

/* =====================================================================
   6) Цели (A3): вкладки День/Неделя/Месяц — крупный прогресс; гнездо #dSlots не трогаем
   ===================================================================== */
var _od=openDaily;
openDaily=function(tab){_od.apply(this,arguments);try{dailyTidy();}catch(e){try{console.error(e);}catch(_){}}};
function bigProg(val,of,label,sub){var segs='';for(var k=0;k<of;k++)segs+='<i class="'+(k<val?'on':'')+'"></i>';
  return '<div class="uw-prog"><div class="uw-pv"><b>'+val+'</b><span>'+L('из','of')+' '+of+'</span></div><div class="uw-pt"><span>'+label+'</span><span class="uw-segs n'+of+'">'+segs+'</span>'+(sub?'<small>'+sub+'</small>':'')+'</div></div>';}
function dailyTidy(){var mc=$('mcard');if(!mc||!mc.querySelector('.a3tabs'))return;mark('daily');var tab=typeof a3Tab!=='undefined'?a3Tab:'d',tabs=mc.querySelector('.a3tabs');
  var intro=tabs.nextElementSibling,head=document.createElement('div');
  if(tab==='d'){var n=a3DoneN();head.innerHTML=bigProg(n,3,n>=3?L('Все цели дня выполнены!','All daily goals done!'):L('Цели на сегодня','Today\'s goals'),L('За все три — ведро дня','All three — the day bucket')+': '+coinsTxt(a3BucketC()));
    if(intro&&intro.tagName==='P'&&!intro.className){intro.parentNode.removeChild(intro);}
    var fo=mc.querySelector('p.goal.tmr');if(fo){fo.classList.add('uw-fore');var dfb=$('dFore');if(dfb){dfb.style.display='none';fo.onclick=function(){dfb.click();};}}}
  else if(tab==='w'){var wn=weekDone();head.innerHTML=bigProg(Math.min(7,wn),7,L('Дней с заданием за неделю','Days with a task this week'),L('Подарки — за 3, 5 и 7 дней','Gifts for 3, 5 and 7 days'));
    var g=mc.querySelector('p.goal');if(g&&g.nextElementSibling&&g.nextElementSibling.classList.contains('wkp')){g.parentNode.removeChild(g);}
    var ab=mc.querySelector('p.about');if(ab){var hw=document.createElement('div');hw.innerHTML=how(L('Как это работает','How it works'),'<p>'+ab.innerHTML+'</p>');ab.parentNode.replaceChild(hw.firstChild,ab);}}
  else{var m=a3Mp(),dn=Object.keys(m.g).length;head.innerHTML=bigProg(Math.min(10,dn),10,L('План рыбака на месяц','Angler\'s monthly plan'),'');
    var g2=mc.querySelector('p.goal');var ab2=g2&&g2.nextElementSibling&&g2.nextElementSibling.tagName==='P'?g2.nextElementSibling:null;
    if(g2){var pv=head.querySelector('.uw-pt>span');if(pv)pv.innerHTML=g2.innerHTML.replace(/:\s*<b>[^<]*<\/b>/,'');g2.parentNode.removeChild(g2);}
    if(ab2){var it=$('dIt');ab2.classList.add('uw-mprize');if(it)ab2.appendChild(it);}}
  tabs.parentNode.insertBefore(head.firstChild,tabs.nextSibling);
  var gs=mc.querySelectorAll('.a3g');gs.forEach(function(x){x.classList.add('uw-goal');});
  var df=$('dFore');if(df)df.classList.add('uw-sec');
  walk(mc);}

/* =====================================================================
   7) Прогноз Петровича (A3): «Сегодня лучше» крупно + дни карточками
   ===================================================================== */
openFore=function(back){STAT.screen('fore');var on=clubOn(),n=on?7:1,d0=dayNum(),o0=a3Fore(d0),rows='';
  for(var i=1;i<=n;i++){var o=a3Fore(d0+i),dt=new Date(nowMs()+i*864e5);if(!o)continue;var bl=biteLv(o.m);
    rows+='<div class="uw-fd"><span class="uw-fdd">'+(i===1?L('Завтра','Tomorrow'):L(WD[dt.getDay()][0],WD[dt.getDay()][1])+' '+dt.getDate())+'</span><span class="uw-fdt"><b>'+esc(nm(PLACES[o.pi]))+'</b><small>'+L(TOD_AT[o.t],TOD_N[o.t][1].toLowerCase())+' '+WX_IC[o.wx]+(o.f?' · '+esc(nm(FISH[o.f]).toLowerCase()):'')+'</small></span>'+dots(bl)+'</div>';}
  var top='';
  if(o0){var b0=biteLv(o0.m);top='<div class="uw-ft"><span class="uw-ftp">'+face('petr')+'</span><div><small>'+L('Сегодня лучше всего','Best today')+'</small><b>'+esc(nm(PLACES[o0.pi]))+', '+L(TOD_AT[o0.t],TOD_N[o0.t][1].toLowerCase())+'</b>'
    +'<span class="uw-ftl">'+dots(b0)+' '+biteWord(b0)+' · '+WX_IC[o0.wx]+' '+L(WX_N[o0.wx][0],WX_N[o0.wx][1]).toLowerCase()+'</span>'+(o0.f?'<small>'+L('будет брать','biting')+': '+esc(nm(FISH[o0.f]).toLowerCase())+'</small>':'')+'</div></div>';}
  modal('<div class="uw-hd"><h2>🔮 '+L('Прогноз Петровича','Petrovich\'s forecast')+'</h2></div>'+top
    +(o0&&S.open[o0.pi]?'<div class="row"><button class="btn green uw-main" id="fbGo">🎣 '+L('Поехать','Go')+': '+esc(nm(PLACES[o0.pi]))+', '+L(TOD_AT[o0.t],TOD_N[o0.t][1].toLowerCase())+'</button></div>':'')
    +(rows?'<div class="uw-gh">'+(on?L('На неделю','This week'):L('Дальше','Next'))+'</div><div class="uw-fds">'+rows+'</div>':'')
    +(on||OK?'':'<p class="uw-small">🎫 '+L('Прогноз на 7 дней — в Клубной карте.','The 7-day forecast comes with the Club card.')+'</p>')
    +how(L('Как это работает','How it works'),'<p>'+L('Петрович смотрит погоду, давление и время суток по твоим открытым местам и советует, где и когда лучше клюёт. Точки — сила клёва.','Petrovich checks the weather at your places: where and when the bite is best.')+'</p>')
    +'<div class="row"><button class="btn" id="mCancel">'+L('Назад','Back')+'</button></div>');
  mark('fore');
  if($('fbGo'))$('fbGo').onclick=function(){hideModal();startFish(o0.pi,{tod:o0.t});};$('mCancel').onclick=back||hideModal;};

/* =====================================================================
   8) Заказы соседей: карточки с лицом, рыбой, местом и наградой; совет Петровича — строкой
   ===================================================================== */
openOrders=function(){STAT.screen('orders');var od=a2Orders(),fishC=[];
  var card=function(o,k){var f=FISH[o.f],wh=ORD_W[o.who],b=a2Best(f),bait=Object.keys(f.b).sort(function(x,y){return f.b[y]-f.b[x];})[0],ok=o.g>=o.n,kn=S.pb[o.pi+'.'+o.f]||0,fc=ORD_FACE[o.who]?face(ORD_FACE[o.who]):'';
    fishC.push([k,o.f]);
    var tip=ok?'':L('на '+BAIT[bait].acc,nm(BAIT[bait]).toLowerCase())+(kn&2?', '+L(ZONES[b.z[0]].n,ZONES[b.z[0]].en).toLowerCase():'')+(kn&4?', '+L(DEP_N[b.d[0]][0],DEP_N[b.d[0]][1]).toLowerCase():'')+(kn&8?', '+L(TOD_AT[b.t[0]],TOD_N[b.t[0]][1].toLowerCase()):'');
    return '<div class="uw-ord'+(ok?' ok':'')+'"><div class="uw-oh"><span class="uw-face'+(fc?'':' em')+'">'+(fc||wh[0])+'</span><span><b>'+esc(L(wh[1],wh[2]))+'</b><small>'+esc(L(wh[3],wh[4]))+'</small></span>'+(ok?'<em class="uw-done">✓ '+L('выполнен','done')+'</em>':'<em class="uw-rwd">+'+coinsTxt(o.c)+'</em>')+'</div>'
      +'<div class="uw-ob"><span class="uw-fi" data-of="'+k+'"></span><span><b>'+(o.n>1?o.n+' × ':'')+esc(nm(f))+'</b><small>📍 '+esc(nm(PLACES[o.pi]))+(o.n>1&&!ok?' · '+o.g+'/'+o.n:'')+'</small></span></div>'
      +(tip?'<p class="uw-tip"><b>'+L('Петрович','Petrovich')+':</b> «'+esc(tip)+'»</p>':'')+'</div>';};
  modal('<div class="uw-hd"><h2>📋 '+L('Заказы соседей','Neighbours\' orders')+'</h2><p class="uw-sub">'+L('Поймай — и сверху цены заплатят. Новые — завтра.','Catch it — and get a bonus on top. New orders tomorrow.')+'</p></div>'
    +(od.l.length?'<div class="uw-ords">'+od.l.map(card).join('')+'</div>':'<p>'+L('Сегодня заказов нет','No orders today')+'</p>')
    +'<div class="row"><button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div>');
  mark('orders');
  fishC.forEach(function(x){var el=$('mcard').querySelector('[data-of="'+x[0]+'"]');if(el)try{el.appendChild(fishImg(x[1],120,false));}catch(e){}});
  $('mCancel').onclick=function(){hideModal();if(!G)openMap();};};

/* =====================================================================
   9) Книга места: крупные звёзды, рыбы сеткой (непойманная — силуэт), намёки значками
   ===================================================================== */
openBook=function(pi,back){STAT.screen('book');var P=PLACES[pi],st=pbStars(S.pb,pi),list=[];
  var hint=function(on,ic,txt,ic0){return '<span class="uw-h'+(on?'':' no')+'">'+(on?ic+' '+txt:ic0+' ?')+'</span>';};
  var cells=P.fish.map(function(id,k){var f=FISH[id],kk=S.pb[pi+'.'+id]||0,b=a2Best(f),got=kk&1,r=typeof rarOf==='function'?rarOf(id):'common',rc=typeof RAR!=='undefined'&&RAR[r]?RAR[r].c:'';list.push([k,id,!got]);
    var rn=typeof RAR!=='undefined'&&RAR[r]?L(RAR[r].n,RAR[r].en):'';
    return '<div class="uw-bf'+(got?'':' no')+'"'+(rc?' style="--rc:'+rc+'"':'')+'><span class="uw-fi" data-bf="'+k+'"></span><b>'+(got?esc(nm(f)):L('Не поймана','Not caught yet'))+'</b>'+(rn?'<small class="uw-rr">'+esc(rn)+'</small>':'')
      +'<span class="uw-hs">'+hint(kk&2,ZONES[b.z[0]].ic,L(ZONES[b.z[0]].n,ZONES[b.z[0]].en),'📍')+hint(kk&4,DEP_N[b.d[0]][2],L(DEP_N[b.d[0]][0],DEP_N[b.d[0]][1]),'↕')+hint(kk&8,'🕑',L(TOD_AT[b.t[0]],TOD_N[b.t[0]][1].toLowerCase()),'🕑')+hint(kk&16,'📅',a2MonRange(b.m),'📅')+'</span></div>';}).join('');
  var stars='<div class="uw-stars" aria-label="'+st+'/5">';for(var s=0;s<5;s++)stars+='<i class="'+(s<st?'on':'')+'">★</i>';stars+='</div>';
  modal('<div class="uw-hd"><h2>📖 '+esc(nm(P))+'</h2><p class="uw-sub">'+L('Книга места','Place book')+'</p></div>'+stars
    +'<p class="uw-small">'+(st<5?L('За каждую новую звезду','Each new star')+' +'+coinsTxt(PB_R[pi]):L('Ты знаешь это место как свои пять пальцев!','You know this place inside out!'))+'</p>'
    +'<div class="uw-bgrid">'+cells+'</div>'
    +how(L('Как заполнить','How to fill it'),'<p>'+L('Лови здесь в разных точках, на разной глубине, в разное время суток и в разные месяцы — у каждой рыбы откроются намёки: где, как глубоко, когда и в какие месяцы берёт. Пойманная рыба открывается целиком.','Catch fish in different spots, depths, times and seasons to fill the book.')+'</p>')
    +'<div class="row"><button class="btn" id="mCancel">'+L('Назад','Back')+'</button></div>');
  mark('book');
  list.forEach(function(x){var el=$('mcard').querySelector('[data-bf="'+x[0]+'"]');if(el)try{el.appendChild(fishImg(x[1],120,x[2]));}catch(e){}});
  $('mCancel').onclick=function(){if(back)back();else hideModal();};};

/* =====================================================================
   10) «Не хватает монет»: копилка, «нужно ещё» крупно, полоса; кнопки (реклама, покупка) — прежние, с теми же id
   ===================================================================== */
var _ne=notEnough;
notEnough=function(p){_ne.apply(this,arguments);try{neTidy(p);}catch(e){try{console.error(e);}catch(_){}}};
function neTidy(p){var mc=$('mcard');if(!mc||!$('mCancel'))return;mark('ne');var need=Math.max(0,p-S.coins),h2=mc.querySelector('h2'),p1=h2&&h2.nextElementSibling;
  var hd=document.createElement('div');hd.className='uw-neh';
  hd.innerHTML='<span class="uw-jar">'+jar(76)+'</span><div><h2>'+L('Не хватает монет','Not enough coins')+'</h2><div class="uw-need"><small>'+L('нужно ещё','you need')+'</small><b>'+coinsTxt(need)+'</b></div></div>';
  if(h2){h2.parentNode.insertBefore(hd,h2);h2.parentNode.removeChild(h2);}
  if(p1&&p1.tagName==='P'){p1.innerHTML='<span class="uw-bar"><i style="width:'+Math.max(3,Math.min(100,Math.round(S.coins/p*100)))+'%"></i></span><span class="uw-small">'+L('Есть','You have')+' '+coinsTxt(S.coins)+' '+L('из','of')+' '+coinsTxt(p)+'. '+L('Улов продаётся — порыбачь ещё немного!','Your catch sells — fish a little more!')+'</span>';p1.className='uw-nep';}
  var go=$('mCancel');if(go)go.classList.add('uw-main');
  walk(hd);walk(p1);}

/* кнопки, державшие старые ссылки */
try{$('btnSet').onclick=openSettings;$('fSet').onclick=openSettings;$('btnWeek').onclick=openWeek;$('btnDaily').onclick=function(){openDaily();};}catch(e){}
window.uiWin={medal:medal,cup:cup,face:face,scene:scene,how:how};
})();
