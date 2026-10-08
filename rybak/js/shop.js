/* RB:SHOP (блок C, 08.10) — витрина «Магазин ₽»: полки «Клуб · Наборы · Монеты · Красота», рисунки кодом, выгода «≈ N дней улова»,
   цена — настоящей кнопкой; перед окном VK — строка «1 голос ≈ 7 ₽» (окно-подтверждение); дешёвые (чай 4, кошелёк 5) — первыми;
   на iPhone дорогие не первыми; Клуб на 7 дней (club7), «Ночной набор» (night_kit, праздник hw26), «Большой улов» (big_catch);
   сравнение «Клуб или Без рекламы»; пробная посылка клуба на 5-й день; строка Петровича перед первой межэкранной;
   запасной payStubVK на маке (?vk=1&paytest=1); тост в магазине — внизу (не закрывает вкладки); стенд ?shop=1.
   Ядро PAY не трогаем: только PAY_ITEMS/PAY_TEST, обёртки PAY.buy/PAY.initVK снаружи. Почта — общий список MAILX (им пользуются away.js и fest-ryb.js).
   Поля сохранения: S.shopN {ia: строка перед межэкранной показана, tr: пробная посылка взята (день), big: золотой поплавок, pv: окно «перед VK» показано раз} — облако: максимум. */
(function(){
'use strict';
var D=document,$i=function(id){return D.getElementById(id);};
function ios(){var u=navigator.userAgent||'';return /iPhone|iPad|iPod/.test(u)||/vk_platform=mobile_iphone|vk_platform=mobile_ipad/.test(location.search)||/Macintosh/.test(u)&&navigator.maxTouchPoints>1;}
function sn(){if(!isObj(S.shopN))S.shopN={};return S.shopN;}
function T(ru,en){return LANG==='en'?en:ru;}
function votes(n){var a=n%10,b=n%100;return n+' '+(LANG==='en'?(n===1?'vote':'votes'):(a===1&&b!==11?'голос':a>=2&&a<=4&&(b<12||b>14)?'голоса':'голосов'));}

/* ---------- 1. товары ---------- */
PAY_ITEMS.club7={vk:7,ic:'🎫',name:'Клубная карта — 7 дней',en:'Club card — 7 days',desc:'Попробовать клуб: 7 дней с покупки. Сама не продлевается',de:'Try the club: 7 days from purchase. Does not renew',done:'🎫 Неделя в Клубе рыбаков — добро пожаловать!',
  give:function(){var t=a3Now();S.club.b['w'+t+'_'+Math.floor(Math.random()*1e4)]=t;var first=!S.club.flt;S.club.flt=1;if(first&&!S.xf&&!S.flt)S.xf='club';try{STAT.ev('mod',{m:'club',a:'buy7'});}catch(e){}}};
PAY_ITEMS.night_kit={perm:1,vk:11,ic:'🌙',fest:'hw26',name:'«Ночной набор»',en:'«Night kit»',desc:'Поплавок «Полумесяц», фонарь «Летучая мышь» и сова на берегу. Навсегда. На клёв не влияет',de:'A «Crescent» float, a hurricane lamp and an owl on the shore. Forever. Just for looks',done:'🌙 Ночной набор — на вкладке «Берег»',
  give:function(){if(!S.xf)S.xf='luna';try{STAT.ev('mod',{m:'kit',a:'night'});}catch(e){}}};
PAY_ITEMS.big_catch={vk:43,ic:'🎁',name:'«Большой улов»',en:'«Big catch»',desc:'Четыре сундука монет, Клуб на 30 дней, по 50 штук наживки и золотой поплавок «Царский». Самый выгодный на голос',de:'Four chests of coins, a 30-day club, bait and a golden float. Best value per vote',done:'🎁 «Большой улов» — всё уже у тебя!',
  give:function(){var t=topPlace(),c=bigCoins();a3ClubAdd();payAdd(c);for(var i=0;i<BAITS.length;i++){var b=BAITS[i];if(b.pack)S.bait[b.id]=(S.bait[b.id]||0)+BIG_BAIT;}
    sn().big=1;S.xo.tsar=1;S.xf='tsar';try{STAT.ev('mod',{m:'kit',a:'big',k:t});}catch(e){}}};
var BIG_BAIT=50;
// «Экспедиция на Север» (глава II NORTH): путёвка на Чудское + леска не слабее 4-й ступени + живец и мотыль + монеты + поплавок «Сияние». Один раз.
// Показ — когда Камчатка открыта, а Чудское ещё нет (стоит перед главой). Уже открыто (облако) — путёвка возвращается монетами.
function pIdx(id){return typeof placeIdx==='function'?placeIdx(id):-1;}
function northOk(){var k=pIdx('kamchatka'),c=pIdx('chud');return k>=0&&c>=0&&!!S.open[k]&&!S.open[c];}
PAY_ITEMS.north_kit={perm:1,vk:21,ic:'🧭',name:'«Экспедиция на Север»',en:'«Northern expedition»',desc:'Путёвка на Чудское озеро, леска 0,25, по 30 живцов и мотыля, 1500 💰 и поплавок «Сияние». Один раз',de:'A trip to Lake Peipus, 0.25 line, 30 live bait and bloodworm, 1500 coins and the «Aurora» float. Once',done:'🧭 Глава «Север» открыта — Петрович уже собирает рюкзак!',
  give:function(){var c=pIdx('chud');if(c>=0){if(S.open[c])payAdd(PLACES[c].p);else S.open[c]=1;}S.tk.line=Math.max(S.tk.line||0,3);S.bait.live=(S.bait.live||0)+30;S.bait.blood=(S.bait.blood||0)+30;payAdd(1500);S.xo.aurora=1;if(!S.xf||S.xf==='club')S.xf='aurora';try{STAT.ev('mod',{m:'kit',a:'north'});}catch(e){}}};
PAY_TEST.north_kit=149;
function bigCoins(){return CHEST[topPlace()]*4;}   // четыре сундука по дальнему месту (сундук — 14 гол.) + клуб 30 дней + наживка: на голос выгоднее любого набора на любом этапе (проверка — __shop.perVote())
PAY_TEST.club7=59;PAY_TEST.night_kit=79;PAY_TEST.big_catch=299;
// праздничный набор: виден в праздник и после него (не сгорает); до праздника — нет. Купленный — всегда
function payVis(id){var it=PAY_ITEMS[id];if(!it)return false;if(id==='north_kit')return PAY.own(id)?false:northOk();if(it.fest&&!(PAY.own(id)||typeof FEST!=='undefined'&&FEST.ever(it.fest)))return false;return true;}
// PAY.list уже собран (initVK раньше загрузки файла) — дописать новые
function listFix(){if(!PAY.v)return;['club7','night_kit','big_catch','north_kit'].forEach(function(id){if(!PAY.item(id))PAY.list.push({id:id});});}
listFix();
// LOOK: рисунки товаров
if(window.LOOK&&LOOK.ART){var A=LOOK.ART;
  A.club7='<svg viewBox="0 0 120 120"><defs><linearGradient id="c7" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a6a80"/><stop offset="1" stop-color="#123441"/></linearGradient><linearGradient id="c7g" x1="0" x2="1"><stop offset="0" stop-color="#f7dc8a"/><stop offset="1" stop-color="#c9952a"/></linearGradient></defs><ellipse cx="60" cy="104" rx="38" ry="6" fill="#000" opacity=".14"/><g transform="rotate(-8 60 60)"><rect x="16" y="32" width="88" height="56" rx="9" fill="url(#c7)"/><rect x="16" y="32" width="88" height="56" rx="9" fill="none" stroke="url(#c7g)" stroke-width="2"/><path d="M24 72c9-12 26-14 38-4l7-5v14l-7-5c-12 10-29 8-38-4z" fill="url(#c7g)" opacity=".9" transform="translate(2 -12) scale(.85)"/><text x="96" y="80" text-anchor="end" font-size="10" font-weight="700" fill="#f7dc8a" font-family="KF,sans-serif" letter-spacing="1">КЛУБ</text></g><circle cx="92" cy="30" r="17" fill="#ff8f4f" stroke="#fff" stroke-width="3"/><text x="92" y="36" text-anchor="middle" font-size="17" font-weight="800" fill="#fff" font-family="KF,sans-serif">7</text></svg>';
  A.night='<svg viewBox="0 0 120 120"><defs><radialGradient id="nk" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#2d3f6e"/><stop offset="1" stop-color="#0f1730"/></radialGradient><radialGradient id="nl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe08a" stop-opacity=".9"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient></defs><rect x="10" y="10" width="100" height="100" rx="22" fill="url(#nk)"/><path d="M38 22a16 16 0 1018 26 13 13 0 01-18-26z" fill="#f4e6b0"/><g fill="#fff" opacity=".8"><circle cx="78" cy="22" r="1.4"/><circle cx="92" cy="40" r="1.1"/><circle cx="66" cy="34" r="1"/><circle cx="24" cy="52" r="1"/></g><rect x="10" y="80" width="100" height="30" rx="0" fill="#16244a"/><path d="M10 82h100" stroke="#3b5a9a" stroke-width="2" opacity=".6"/><circle cx="82" cy="70" r="20" fill="url(#nl)"/><path d="M76 62h12l-2 18h-8z" fill="#c9952a"/><rect x="77" y="64" width="10" height="13" rx="2" fill="#ffd36b"/><path d="M78 60a4 4 0 018 0" stroke="#7a5a1a" stroke-width="2" fill="none"/><g transform="translate(34 66)"><ellipse cx="0" cy="8" rx="11" ry="14" fill="#8a6a4a"/><circle cx="0" cy="-6" r="10" fill="#9a7a56"/><path d="M-9-13l3 5M9-13l-3 5" stroke="#9a7a56" stroke-width="3"/><circle cx="-4" cy="-6" r="3.6" fill="#ffd36b"/><circle cx="4" cy="-6" r="3.6" fill="#ffd36b"/><circle cx="-4" cy="-6" r="1.5" fill="#1a1a1a"/><circle cx="4" cy="-6" r="1.5" fill="#1a1a1a"/><path d="M-2-1l2 3 2-3z" fill="#e8a020"/><path d="M-12 22h24" stroke="#5a3a1a" stroke-width="4" stroke-linecap="round"/></g></svg>';
  A.big='<svg viewBox="0 0 120 120"><defs><linearGradient id="bc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c0843f"/><stop offset="1" stop-color="#7a4a1f"/></linearGradient><linearGradient id="bg2" x1="0" x2="1"><stop offset="0" stop-color="#ffe9a3"/><stop offset="1" stop-color="#d9a21a"/></linearGradient></defs><ellipse cx="60" cy="106" rx="48" ry="6" fill="#000" opacity=".16"/><g transform="rotate(-18 44 40)"><path d="M18 46c8-14 30-18 46-6l9-7v20l-9-7c-16 12-38 8-46-0z" fill="#8fb3c4" stroke="#4d7385" stroke-width="1.5"/><circle cx="26" cy="44" r="2.2" fill="#223"/></g><g fill="url(#bg2)" stroke="#b07a0c" stroke-width="1">'+[[34,54],[46,50],[58,52],[70,48],[82,52],[52,58],[66,58],[40,60],[78,60]].map(function(a){return '<ellipse cx="'+a[0]+'" cy="'+a[1]+'" rx="7" ry="4"/>';}).join('')+'</g><path d="M86 18v14" stroke="#333" stroke-width="2"/><path d="M86 32c6 0 8 10 8 18s-4 18-8 24c-4-6-8-16-8-24s2-18 8-18z" fill="url(#bg2)" stroke="#a8710a" stroke-width="1.2"/><path d="M80 46h12" stroke="#c0392b" stroke-width="3"/><path d="M12 62h96v40a6 6 0 01-6 6H18a6 6 0 01-6-6z" fill="url(#bc)"/><path d="M12 62h96" stroke="#5a3514" stroke-width="3"/><path d="M26 62v46M94 62v46" stroke="#e0b040" stroke-width="5"/><rect x="50" y="68" width="20" height="20" rx="4" fill="#ffd36b" stroke="#9c6f12" stroke-width="1.5"/><circle cx="60" cy="77" r="2.6" fill="#5a3514"/></svg>';
  A.north='<svg viewBox="0 0 120 120"><defs><linearGradient id="ns" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f2240"/><stop offset="1" stop-color="#28507a"/></linearGradient><linearGradient id="na2" x1="0" x2="1"><stop offset="0" stop-color="#6be3b0" stop-opacity="0"/><stop offset=".5" stop-color="#6be3b0" stop-opacity=".85"/><stop offset="1" stop-color="#8fdcff" stop-opacity="0"/></linearGradient></defs><rect x="10" y="10" width="100" height="100" rx="22" fill="url(#ns)"/><path d="M14 44c20-18 46-4 66-16s26-6 28-4" stroke="url(#na2)" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M16 58c22-12 44 0 62-10s24-4 28-2" stroke="url(#na2)" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/><path d="M10 84l18-16 14 10 20-22 22 20 14-8 22 16v16a0 0 0 010 0H10z" fill="#dfeaf2"/><path d="M62 56l9 9-9-3-9 3z" fill="#fff"/><rect x="10" y="88" width="100" height="22" rx="0" fill="#16344f"/><path d="M10 96h100" stroke="#5a8fb0" stroke-width="2" opacity=".6"/><g transform="translate(84 30)"><circle r="13" fill="#f4ead2" stroke="#c9952a" stroke-width="3"/><path d="M0-9l3 9-3 9-3-9z" fill="#c0392b"/><path d="M0 0l3 0-3 9z" fill="#1d3a5a"/></g></svg>';
  if(LOOK.PAY_ART){LOOK.PAY_ART.north_kit='north';LOOK.PAY_ART.club7='club7';LOOK.PAY_ART.night_kit='night';LOOK.PAY_ART.big_catch='big';}}
function art(id){var k=window.LOOK&&LOOK.PAY_ART&&LOOK.PAY_ART[id];return k&&LOOK.art?LOOK.art(k):'<span class="vt-em">'+(PAY_ITEMS[id]&&PAY_ITEMS[id].ic||'')+'</span>';}

/* ---------- 2. вещи наборов (поплавки и украшения A3 — XIT, на клёв не влияют) ---------- */
XIT.luna={k:'f',src:'night',n:'Полумесяц',en:'Crescent',d:'Ночной набор: тёмно-синий с золотым месяцем',de:'Night kit: dark blue with a golden crescent'};
XIT.lamp2={k:'s',src:'night',ic:'🏮',n:'Фонарь «Летучая мышь»',en:'Hurricane lamp',d:'Ночной набор: тёплый свет у воды',de:'Night kit: warm light by the water'};
XIT.owl={k:'s',src:'night',ic:'🦉',n:'Сова на коряге',en:'Owl on a snag',d:'Ночной набор: моргает жёлтыми глазами',de:'Night kit: blinks its yellow eyes'};
XIT.tsar={k:'f',src:'big',n:'Царский',en:'Tsar float',d:'«Большой улов»: золото с алым поясом',de:'«Big catch»: gold with a scarlet band'};
XIT.aurora={k:'f',src:'north',n:'Сияние',en:'Aurora',d:'«Экспедиция на Север»: переливается, как северное сияние',de:'«Northern expedition»: shimmers like the aurora'};
XIT.svet={k:'f',src:'fest',n:'Светлячок',en:'Firefly',d:'Подарок Кощеевой недели — светится в темноте',de:'A spooky-week gift — glows in the dark'};
Object.assign(FLT,{aurora:['#123a5a','#1f6a7a','#6be3b0'],luna:['#1b2a55','#22346a','#f4d26a'],tsar:['#f7d36b','#e8b33a','#c0392b'],svet:['#eafbe0','#9be37a','#7dffa0']});
{var ao=a3Own;a3Own=function(id){var x=XIT[id];if(x&&x.src==='night')return PAY.own('night_kit');if(x&&x.src==='big')return !!(S.xo&&S.xo.tsar)||!!sn().big;if(x&&(x.src==='fest'||x.src==='north'))return !!(S.xo&&S.xo[id])||x.src==='north'&&PAY.own('north_kit');return ao(id);};}
{var fb=floatBody;floatBody=function(g,w,h,id,night){if(id==='svet')fb(g,w,h,'glow',night);else fb(g,w,h,id,night);
  if(id!=='luna'&&id!=='tsar'&&id!=='svet'&&id!=='aurora')return;var bw=w,bh=h*.32;g.save();g.beginPath();g.ellipse(0,0,bw,bh,0,Math.PI,0);g.clip();
  if(id==='luna'){g.fillStyle='#f4d26a';g.beginPath();g.arc(-bw*.1,-bh*.55,bh*.32,0,7);g.fill();g.fillStyle='#22346a';g.beginPath();g.arc(bw*.05,-bh*.62,bh*.28,0,7);g.fill();g.fillStyle='#fff';g.fillRect(bw*.45,-bh*.75,bw*.08,bw*.08);}
  else if(id==='tsar'){g.fillStyle='#c0392b';g.fillRect(-bw,-bh*.45,bw*2,bh*.2);g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(-bw*.4,-bh*.62,bw*.18,bh*.14,-.5,0,7);g.fill();}
  else if(id==='aurora'){g.fillStyle='rgba(107,227,176,.9)';g.fillRect(-bw,-bh*.6,bw*2,bh*.14);g.fillStyle='rgba(143,220,255,.85)';g.fillRect(-bw,-bh*.38,bw*2,bh*.1);}
  else{g.fillStyle='#4caf50';g.fillRect(-bw,-bh*.4,bw*2,bh*.16);}
  g.restore();};}
var DRAW2={
  lamp2:function(g,x,y,u,tn,t){var k=.92+.08*Math.sin(t*6);if(typeof LOW!=='undefined'&&LOW&&typeof glowSp==='function')glowSp(g,x,y-u*2.2,u*12*k,'255,205,110',.4);else{var gl=g.createRadialGradient(x,y-u*2.2,1,x,y-u*2.2,u*12*k);gl.addColorStop(0,'rgba(255,205,110,.4)');gl.addColorStop(1,'rgba(255,205,110,0)');g.fillStyle=gl;g.fillRect(x-u*13,y-u*15,u*26,u*26);}
    g.fillStyle=tn('#4a4a4a');g.fillRect(x-u*1.3,y-u*.4,u*2.6,u*.4);g.fillStyle=tn('#b03a2e');rr(g,x-u*1.2,y-u*3.6,u*2.4,u*.6,u*.2);g.fill();rr(g,x-u*1.1,y-u*.9,u*2.2,u*.6,u*.2);g.fill();
    g.fillStyle='rgba(255,226,140,.95)';rr(g,x-u*.8,y-u*3,u*1.6,u*2.1,u*.6);g.fill();g.strokeStyle=tn('#5a5a5a');g.lineWidth=Math.max(1,u*.18);g.beginPath();g.arc(x,y-u*3.7,u*.9,Math.PI,0);g.stroke();},
  owl:function(g,x,y,u,tn,t){g.fillStyle=tn('#5a3a1a');g.beginPath();g.moveTo(x-u*3.5,y);g.lineTo(x+u*3,y-u*1.2);g.lineTo(x+u*3.2,y-u*.4);g.lineTo(x-u*3.2,y+u*.5);g.fill();
    g.fillStyle=tn('#8a6a4a');g.beginPath();g.ellipse(x,y-u*2.6,u*1.5,u*2.1,0,0,7);g.fill();g.fillStyle=tn('#9a7a56');g.beginPath();g.arc(x,y-u*4.6,u*1.35,0,7);g.fill();
    g.beginPath();g.moveTo(x-u*1.2,y-u*5.2);g.lineTo(x-u*.9,y-u*6.2);g.lineTo(x-u*.5,y-u*5.6);g.fill();g.beginPath();g.moveTo(x+u*1.2,y-u*5.2);g.lineTo(x+u*.9,y-u*6.2);g.lineTo(x+u*.5,y-u*5.6);g.fill();
    var bl=(t%5)<.15;g.fillStyle=bl?tn('#7a5a3a'):'#ffd36b';g.beginPath();g.arc(x-u*.5,y-u*4.7,u*.42,0,7);g.arc(x+u*.5,y-u*4.7,u*.42,0,7);g.fill();if(!bl){g.fillStyle='#1a1a1a';g.beginPath();g.arc(x-u*.5,y-u*4.7,u*.18,0,7);g.arc(x+u*.5,y-u*4.7,u*.18,0,7);g.fill();}
    g.fillStyle='#e8a020';g.beginPath();g.moveTo(x-u*.18,y-u*4.35);g.lineTo(x+u*.18,y-u*4.35);g.lineTo(x,y-u*3.95);g.fill();}};
Object.assign(A3_DRAW,DRAW2);
{var sd=drawShoreDec;drawShoreDec=function(g,t){sd(g,t);var u=GEO.u,W=GEO.W,H=GEO.H,sh=GEO.shY,yb=sh+(H-sh)*.52,tn=G.P.tint,off=S.decOff||{};
  if(a3Own('lamp2')&&!off.lamp2)DRAW2.lamp2(g,W*(GEO.land?.115:.2),yb+u*3.2,u*1.15,tn,t);
  if(a3Own('owl')&&!off.owl)DRAW2.owl(g,W*(GEO.land?.86:.9),yb+u*1.6,u*1.05,tn,t);};}
// «Берег»: строки вещей наборов (купленные — «Надеть/Убрать»; не купленные — ссылка в магазин)
{var os0=openShop;openShop=function(tab,hl){os0(tab,hl);if(shopTab!=='d')return;var list=$i('shList');if(!list)return;
  var ids=['svet','aurora','luna','lamp2','owl','tsar'].filter(function(id){return a3Own(id)||(XIT[id].src==='night'&&PAY.on&&!inGame()&&payVis('night_kit'));});if(!ids.length)return;
  var row=function(id){var x=XIT[id],isF=x.k==='f',o=a3Own(id),sel=isF&&fltSel()===id;
    var act=!o?'<button class="btn" data-vgo="1">'+T('В магазин','Shop')+'</button>':isF?(sel?'<span class="have">✓</span>':'<button class="btn" data-ys="'+id+'">'+T('Надеть','Use')+'</button>'):'<button class="btn" data-yt="'+id+'">'+(S.decOff&&S.decOff[id]?T('Поставить','Show'):T('Убрать','Hide'))+'</button>';
    return '<div class="ti"><span class="ic"'+(isF?' data-yf="'+id+'"':'')+'>'+(isF?'':x.ic)+'</span><div class="tx"><b>'+esc(nm(x))+'</b></div>'+act+'<small class="ds">'+esc(L(x.d,x.de))+'</small></div>';};
  var d=D.createElement('div');d.innerHTML='<div class="sect">🌙 '+T('Особые вещи','Special items')+'</div>'+ids.map(row).join('');list.appendChild(d);
  d.querySelectorAll('[data-yf]').forEach(function(e){var c=a3Icon(e.dataset.yf);c.style.width='40px';c.style.height='44px';e.appendChild(c);});
  d.querySelectorAll('[data-ys]').forEach(function(b){b.onclick=function(){S.xf=b.dataset.ys;save();SND.tap();var y=list.scrollTop;openShop('d');list.scrollTop=y;};});
  d.querySelectorAll('[data-yt]').forEach(function(b){b.onclick=function(){var id=b.dataset.yt;if(!isObj(S.decOff))S.decOff={};if(S.decOff[id])delete S.decOff[id];else S.decOff[id]=1;save();SND.tap();var y=list.scrollTop;openShop('d');list.scrollTop=y;};});
  d.querySelectorAll('[data-vgo]').forEach(function(b){b.onclick=function(){SND.tap();openShop('p');};});};}

/* ---------- 3. выгода: «≈ N дней улова», «хватит на …» ---------- */
function dayC(){return Math.max(30,6*a3Trip());}
function daysTxt(c){var k=c/dayC();if(k<.75){var n=Math.max(1,Math.round(c/Math.max(20,a3Trip())));return '≈ '+n+' '+pl(n,'рыбалка','рыбалки','рыбалок','trip','trips');}
  var d=Math.round(k*2)/2,s=String(d).replace('.',',');return '≈ '+s+' '+(d%1?T('дня','days'):pl(d,'день','дня','дней','day','days'))+' '+T('улова','of fishing');}
// на что хватит сразу: самое дорогое из ближайших целей, что станет по карману
function covers(c){var o=[],np=PLACES.findIndex(function(p,i){return !S.open[i];});if(np>0&&S.open[np-1])o.push({p:PLACES[np].p,s:T('путёвку «'+nm(PLACES[np])+'»','a trip to '+nm(PLACES[np]))});
  for(var i=0;i<TK_KEYS.length;i++){var k=TK_KEYS[i],l=S.tk[k];if(l<4)o.push({p:TACKLE[k].p[l+1],s:L(TACKLE[k].lv[l+1][0],TACKLE[k].lv[l+1][1]).toLowerCase()});}
  o=o.filter(function(x){return x.p>S.coins&&x.p<=S.coins+c;}).sort(function(a,b){return b.p-a.p;});return o.length?o[0].s:'';}
function gain(id){var it=PAY_ITEMS[id],c=a3ParcelC();
  if(id==='coins_s'||id==='coins_l'){var w=covers(it.n);return daysTxt(it.n)+(w?' · '+T('сразу хватит на ','enough for ')+w:'');}
  if(id==='club30')return T('посылки ≈ ','parcels ≈ ')+coinsTxt(c*30)+T(' за месяц',' a month');
  if(id==='club7')return T('посылки ≈ ','parcels ≈ ')+coinsTxt(c*7)+T(' за неделю',' a week');
  if(id==='big_catch')return coinsTxt(bigCoins())+' · '+daysTxt(bigCoins()+c*30);
  if(id==='bait_box')return T('хватит на ','enough for ')+(it.cnt||40)*5+T(' забросов',' casts');
  if(id==='starter')return T('лучшая цена для начала','best value to start');
  if(id==='tea')return T('кружка останется на берегу','the mug stays on the shore');
  if(id==='no_ads')return T('навсегда','forever')+' + '+coinsTxt(it.bonus);
  if(id==='volga_kit')return T('Волга — сразу','the Volga — right now');
  if(id==='north_kit'){var c=pIdx('chud'),v=c>=0?PLACES[c].p+1500:0;return T('Чудское — сразу · ≈ ','Peipus right now · ≈ ')+coinsTxt(v)+T(' ценности',' value');}
  return it.perm?T('навсегда','forever'):'';}

/* ---------- 4. витрина ---------- */
function can(id){return !!(PAY.on&&!inGame()&&PAY.item(id)&&payVis(id));}
function own(id){return !!(PAY_ITEMS[id].perm&&PAY.own(id));}
function btn(id,cls){return own(id)?'<span class="vt-own">✓ '+T('Куплено','Owned')+'</span>':'<button class="vt-buy pbuy0 noenter'+(cls?' '+cls:'')+'" data-vpid="'+id+'">'+votes(PAY_ITEMS[id].vk)+'</button>';}
function card(id,o){o=o||{};var it=PAY_ITEMS[id];return '<div class="vt-c'+(o.wide?' vt-w':'')+(o.hot?' vt-hot':'')+'" data-vc="'+id+'">'+(o.hot?'<i class="vt-tag">'+o.hot+'</i>':'')+
  '<div class="vt-a">'+art(id)+'</div><div class="vt-t"><b>'+esc(L(it.name,it.en))+'</b><small>'+esc(L(it.desc,it.de))+'</small><em>'+gain(id)+'</em></div>'+btn(id)+'</div>';}
function clubShelf(){var c=a3Club(),on=can('club30'),on7=can('club7');if(!on&&!on7&&!c.n)return '';
  var pc=a3ParcelC(),noads=PAY.own('no_ads'),ip=ios();
  var rows=[[T('Без рекламы между рыбалками','No ads between trips'),1,1],[T('Посылка каждый день: ','Daily parcel: ')+coinsTxt(pc)+T(' + наживка',' + bait'),0,1],[T('6-й заброс в каждой рыбалке','6th cast every trip'),0,1],[T('Прогноз клёва на 7 дней','7-day forecast'),0,1],[T('Клубный поплавок навсегда','Club float forever'),0,1],[T('Срок','Term'),T('навсегда','forever'),T('30 / 7 дней','30 / 7 days')]];
  var tb='<table class="vt-cmp"><tr><th></th><th>'+T('Без рекламы','No ads')+'<small>'+votes(PAY_ITEMS.no_ads.vk)+'</small></th><th class="vt-k">'+T('Клуб','Club')+'<small>'+T('от ','from ')+votes(PAY_ITEMS.club7.vk)+'</small></th></tr>'+
    rows.map(function(r){var f=function(v){return v===1?'<b class="vt-y">✓</b>':v===0?'<b class="vt-n">—</b>':'<span>'+v+'</span>';};return '<tr><td>'+r[0]+'</td><td>'+f(r[1])+'</td><td class="vt-k">'+f(r[2])+'</td></tr>';}).join('')+'</table>';
  var b7=on7?'<button class="vt-buy vt-b2 noenter" data-vpid="club7"><span>'+T('Неделя — попробовать','A week — try it')+'</span><b>'+votes(7)+'</b></button>':'';
  var b30=on?'<button class="vt-buy vt-b2 vt-best noenter" data-vpid="club30"><span>'+T('30 дней · выгоднее на 30 %','30 days · 30 % cheaper')+'</span><b>'+votes(21)+'</b></button>':'';
  var st=c.on?'<p class="vt-ok">✓ '+T('Действует до '+a3Date(c.end)+' — ещё '+c.left+' '+pl(c.left,'день','дня','дней','',''),'Active until '+a3Date(c.end))+'. '+T('Новая покупка прибавит срок.','A new purchase adds time.')+'</p>':'';
  return '<section class="vt-sh"><h3>🎫 '+T('Клуб рыбаков','Anglers\' Club')+'</h3><div class="vt-club"><div class="vt-a">'+art('club30')+'</div><div class="vt-t"><b>'+T('Клубная карта','Club card')+'</b><small>'+T('Всё, что даёт «Без рекламы», и ещё посылки каждый день. За месяц посылки — ≈ ','Everything «No ads» gives, plus a parcel every day. In a month ≈ ')+coinsTxt(pc*30)+'.</small></div></div>'+st+tb+
    '<div class="vt-two">'+(ip?b7+b30:b30+b7)+'</div><p class="vt-fine">'+T('Сама не продлевается — ничего не спишется. Не даёт преимуществ в турнирах, рыбы крупнее и лучшего клёва.','Does not renew — nothing will be charged. No contest advantage, no bigger fish, no better bite.')+(noads?' '+T('«Без рекламы» у тебя уже есть — клуб добавит посылки и прогноз.','You already have «No ads» — the club adds parcels and the forecast.'):'')+'</p>'+
    (can('no_ads')&&!noads?'<div class="vt-g">'+card('no_ads',{wide:1})+'</div>':'')+'</section>';}
function shelf(icon,title,ids,opt){ids=ids.filter(can);if(!ids.length)return '';opt=opt||{};
  if(ios())ids.sort(function(a,b){return PAY_ITEMS[a].vk-PAY_ITEMS[b].vk;});
  return '<section class="vt-sh"><h3>'+icon+' '+title+'</h3><div class="vt-g">'+ids.map(function(id){return card(id,{hot:opt.hot&&opt.hot[id],wide:opt.wide&&opt.wide[id]});}).join('')+'</div></section>';}
function vitrina(){if(!fbSpecOn())return '<p class="about" style="margin:12px 2px">'+T('Покупки сейчас недоступны.','Purchases are not available right now.')+'</p>';
  var vk=!!PAY.v,newb=topPlace()<=2&&!PAY.own('starter'),fest=typeof FEST!=='undefined'&&FEST.on('hw26');
  var h='<div class="vt-head"><div class="vt-p">'+(window.LOOK&&LOOK.av?LOOK.av('petr'):'')+'</div><p>'+(vk?T('<b>Покупки — за голоса VK.</b> 1 голос ≈ 7 ₽. Не хватает голосов — VK предложит пополнить картой прямо в окне оплаты.','<b>Purchases use VK votes.</b> 1 vote ≈ 7 ₽.'):T('<b>Покупки — за рубли площадки.</b>','<b>Purchases.</b>'))+' '+T('Всё необязательно — игра проходится и без покупок.','All optional.')+'</p></div>';
  // недорого — первыми
  var cheap=['tea','coins_s'].filter(can);if(cheap.length)h+='<section class="vt-sh"><h3>☕ '+T('Недорого','Small treats')+'</h3><div class="vt-g">'+cheap.map(function(id){return card(id);}).join('')+'</div></section>';
  var kits=['north_kit','starter','volga_kit','bait_box','night_kit','big_catch'].filter(function(id){return id!=='volga_kit'||a3KitOk();});
  if(fest&&can('night_kit')&&!own('night_kit')){kits.splice(kits.indexOf('night_kit'),1);kits.unshift('night_kit');}
  var hot={};if(newb)hot.starter=T('Выгоднее всего','Best value');if(fest)hot.night_kit=T('Кощеева неделя','Spooky week');hot.big_catch=T('Щедрый','Generous');hot.north_kit=T('Глава II','Chapter II');
  var club=clubShelf(),kitsH=shelf('🎒',T('Наборы','Kits'),kits,{hot:hot,wide:{big_catch:1,north_kit:1}});
  if(ios()||newb)h+=kitsH+club;else h+=club+kitsH;   // на iPhone и новичку дорогой клуб — не первым
  h+=shelf('💰',T('Монеты','Coins'),['coins_l'],{wide:{coins_l:1}});
  h+=shelf('🎨',T('Красота','Looks'),['floats_rus','th_warm'].concat(fest?[]:['night_kit']).filter(function(id){return kits.indexOf(id)<0||!fest;}));
  h+='<p class="vt-fine vt-end">'+T('Купленное «навсегда» не пропадёт и на другом устройстве: ⚙ → «Восстановить покупки».','Permanent purchases are restored on other devices: ⚙ → «Restore purchases».')+'</p>';
  return '<div class="vt">'+h+'</div>';}
fbSpecHtml=vitrina;
// кнопки витрины: свой обработчик (окно «перед VK»), карточку можно нажать целиком
function bindV(root){if(!root)return;root.querySelectorAll('[data-vpid]').forEach(function(b){b.onclick=function(e){e.stopPropagation();try{(SND.tap||SND.click)();}catch(x){}PAY.buy(b.dataset.vpid);};});
  root.querySelectorAll('.vt-c[data-vc]').forEach(function(c){c.onclick=function(){var b=c.querySelector('[data-vpid]');if(b)b.click();};});}
{var os1=openShop;openShop=function(tab,hl){os1(tab,hl);if(shopTab==='p'){var l=$i('shList');bindV(l);if(l)l.classList.add('vt-list');}else{var l2=$i('shList');if(l2)l2.classList.remove('vt-list');}};}
// строки покупок в чужих окнах (Монеты, «не хватает») — тот же рисунок: lkPayArt уже есть; добавим выгоду под описанием
{var ph=payHtml;payHtml=function(ids,owned){var h=ph(ids,owned);return h.replace(/(<button class="set pbuy" data-pid="([a-z0-9_]+)">[\s\S]*?<small>)([^<]*)(<\/small>)/g,function(m,a,id,d,z){var g=PAY_ITEMS[id]?gain(id):'';return a+d+(g?'<br><em class="vt-gn">'+g+'</em>':'')+z;});};}
// a3PayIds (общий список в «Монетах»): праздничный набор — только когда виден
{var ap=a3PayIds;a3PayIds=function(){return ap().filter(function(id){return payVis(id)&&id!=='club7'&&id!=='north_kit';});};}

/* ---------- 5. окно «перед VK»: что купишь и как платить ---------- */
var preOk=null;
{var b0=PAY.buy;PAY.buy=function(id){var it=PAY_ITEMS[id];
  if(!PAY.v||!it||PAY.busy||!PAY.on||preOk===id){preOk=null;return b0.call(PAY,id);}
  var back=PAY.re;try{STAT.ev('mod',{m:'shop',a:'pre',k:id});}catch(e){}
  modal('<div class="vt-pre"><div class="vt-a">'+art(id)+'</div><h2>'+esc(L(it.name,it.en))+'</h2><p>'+esc(L(it.desc,it.de))+'</p>'+(gain(id)?'<p class="vt-gn">'+gain(id)+'</p>':'')+
    '<p class="quote vt-vk"><b>'+T('Как платить','How to pay')+'</b>'+T('Покупка за голоса VK: 1 голос ≈ 7 ₽, пополнить можно картой прямо в окне.','Paid with VK votes: 1 vote ≈ 7 ₽, you can top up by card right in the window.')+
    (ios()?' '+T('На iPhone пополнение в приложении бывает недоступно — тогда пополните голоса на сайте vk.com, они общие.','On iPhone top-up may be unavailable in the app — top up on vk.com, the votes are shared.'):'')+'</p>'+
    '<div class="row"><button class="btn green noenter" id="vtGo">'+T('Купить','Buy')+' · '+votes(it.vk)+'</button><button class="btn" id="mCancel">'+T('Назад','Back')+'</button></div></div>');
  $i('vtGo').onclick=function(){hideModal();preOk=id;sn().pv=(sn().pv|0)+1;save();PAY.buy(id);};
  $i('mCancel').onclick=function(){hideModal();try{STAT.ev('mod',{m:'shop',a:'pre0',k:id});}catch(e){}if(back&&!$i('scr-shop').classList.contains('on'))try{back();}catch(e){}};};}

/* ---------- 6. запасной payStubVK на маке: ?vk=1&paytest=1, а мост ответил без окна оплаты ---------- */
function stubVK(){if(PAY.v||PLAT!=='vk'||!PAY.test||VK_REAL||OK)return false;PAY.v=payStubVK();
  PAY.restore().catch(function(){}).then(function(){PAY.list=Object.keys(PAY_ITEMS).filter(function(id){return PAY_ITEMS[id].vk>0;}).map(function(id){return {id:id};});PAY.on=PAY.list.length>0;if(PAY.on)payAfter();});return true;}
{var iv=PAY.initVK;PAY.initVK=function(){return Promise.resolve(iv.apply(PAY,arguments)).then(function(){stubVK();listFix();});};}
if(PAY.test&&PLAT==='vk'&&!VK_REAL)setTimeout(function(){if(window.__sdkDone&&!PAY.v)stubVK();},26000);

/* ---------- 7. тост в магазине — внизу (не закрывает вкладки; плейтест 07) ---------- */
{var t0=toast;toast=function(t,ms,low){var sh=$i('scr-shop');return t0(t,ms,low||!!(sh&&sh.classList.contains('on')));};}

/* ---------- 8. строка Петровича перед первой межэкранной ---------- */
{var si=showInterstitial;showInterstitial=function(cb){var n=sn();if(n.ia||OK||!PAY.on||!(PAY.item('no_ads')||PAY.item('club7')))return si(cb);
  n.ia=1;save();try{STAT.ev('mod',{m:'shop',a:'ia'});}catch(e){}
  modal('<div class="vt-ia"><div class="vt-p">'+(window.LOOK&&LOOK.av?LOOK.av('petr'):'')+'</div><p class="quote"><b>'+T('Петрович','Petrovich')+'</b>'+T('Сейчас будет короткая реклама — она помогает игре жить. Не хочешь рекламы между рыбалками — есть «Без рекламы» навсегда или Клубная карта (от недели).','A short ad now — it keeps the game alive. Don\'t want ads between trips? There is «No ads» forever or the Club card.')+'</p></div>'+
    '<div class="row"><button class="btn green noenter" id="vtIaOk">'+T('Понятно','OK')+'</button><button class="btn noenter" id="vtIaShop">'+T('Убрать рекламу','Remove ads')+'</button></div>');
  $i('vtIaOk').onclick=function(){hideModal();si(cb);};
  $i('vtIaShop').onclick=function(){hideModal();try{STAT.ev('mod',{m:'shop',a:'ia_shop'});}catch(e){}G=null;openShop('p');};};}

/* ---------- 9. «Не хватает монет»: конкретная строка — что купить, чтобы хватило сразу ---------- */
{var ne=notEnough;notEnough=function(p){ne(p);if(!fbSpecOn())return;var need=p-S.coins,nb=$i('neBuy');if(!nb)return;var t=topPlace(),ch=pIdx('chud'),id=ch>=0&&p===PLACES[ch].p&&can('north_kit')?'north_kit':WALLET[t]>=need&&can('coins_s')?'coins_s':CHEST[t]>=need&&can('coins_l')?'coins_l':can('big_catch')&&bigCoins()>=need?'big_catch':'';
  nb.innerHTML=id?'⭐ '+T('Хватит сразу: ','Enough at once: ')+esc(L(PAY_ITEMS[id].name,PAY_ITEMS[id].en))+' · '+votes(PAY_ITEMS[id].vk):'⭐ '+T('Магазин: монеты и наборы','Shop: coins and kits');
  nb.onclick=function(){hideModal();if(id){PAY.re=function(){if($i('scr-shop').classList.contains('on'))openShop(shopTab);else if(!G)openMap();};PAY.buy(id);}else openShop('p');};
  try{STAT.ev('mod',{m:'shop',a:'ne',k:id||'-'});}catch(e){}};}

/* ---------- 10. Почта: общий список своих строк (MAILX) — пробная посылка клуба, донка, подарок вернувшемуся, праздник ---------- */
// {id, ok()→bool (есть что забрать), ic, t, sub, c()→монеты (для «Забрать всё»), take(), part (слово в «Сегодня для вас»), more (html под строкой, по желанию)}
var MAILX=window.MAILX=[];
function mx(){var a=[];for(var i=0;i<MAILX.length;i++){try{if(MAILX[i].ok())a.push(MAILX[i]);}catch(e){}}return a;}
{var fc=fbMailCan;fbMailCan=function(){return fc()||mx().length>0;};
 var fs=fbMailSum;fbMailSum=function(){var c=fs();mx().forEach(function(x){try{c+=x.c?x.c():0;}catch(e){}});return c;};
 var fp=fbMailParts;fbMailParts=function(){var a=fp();mx().forEach(function(x){if(x.part)a.unshift(x.part);});return a;};
 var mc=a3MailCnt;a3MailCnt=function(){return mc()+mx().length;};
 var ft=fbTakeAll;fbTakeAll=function(){var c0=S.coins;mx().forEach(function(x){try{x.take(true);}catch(e){}});var d=S.coins-c0;if(d>0){updCoins();}ft();};
 var om=openMail;openMail=function(){om();var a=mx(),card=$i('mcard');if(!card)return;var h='';
  a.forEach(function(x){h+='<div class="a3g rdy" data-mx="'+x.id+'"><span class="ai">'+x.ic+'</span><span>'+x.t+(x.sub?'<small>'+x.sub+'</small>':'')+'</span><button class="btn green noenter" data-mxt="'+x.id+'">'+(x.c&&x.c()?'+'+coinsTxt(x.c()):T('Забрать','Take'))+'</button></div>'+(x.more?x.more():'');});
  var ex=MAILX.filter(function(x){return x.always;}).map(function(x){try{return x.always();}catch(e){return '';}}).join('');
  if(!h&&!ex)return;var d=D.createElement('div');d.className='vt-mx';d.innerHTML=h+ex;
  var at=card.querySelector('.fbmain');var ref=at?at.nextSibling:card.querySelector('h2').nextSibling;card.insertBefore(d,ref);
  d.querySelectorAll('[data-mxt]').forEach(function(b){b.onclick=function(){var x=MAILX.find(function(z){return z.id===b.dataset.mxt;});if(x){try{x.take(false);}catch(e){}updCoins();SND.coin();}openMail();};});
  MAILX.forEach(function(x){if(x.bind)try{x.bind(d);}catch(e){}});};}
// пробная посылка клуба: 5-й день игры и дальше, один раз, клуб ни разу не брали, покупки есть (не ОК)
function trialOk(){var n=sn(),d=dayNum()-(S.d0||dayNum())+1;return !n.tr&&d>=5&&!(a3Club().n)&&(S.caught||0)>=1&&!OK&&PAY.on&&!!PAY.item('club30');}
MAILX.push({id:'trial',ic:'📦',part:T('пробная посылка клуба','a trial club parcel'),ok:trialOk,c:function(){return a3ParcelC();},
  t:T('Посылка от Клуба рыбаков — на пробу','A trial parcel from the Anglers\' Club'),sub:T('такая — каждый день у членов клуба','club members get one every day'),
  take:function(){if(!trialOk())return;var c=a3ParcelC(),b=a3BestBait(topPlace());sn().tr=dayNum();S.coins+=ern('gift',c);S.bait[b]=(S.bait[b]||0)+5;save();toast('📦 '+T('Пробная посылка: +','Trial parcel: +')+coinsTxt(c)+' · '+BAIT[b].ic+' +5',3000,true);try{STAT.ev('mod',{m:'club',a:'trial'});}catch(e){}},
  more:function(){return '<button class="a3m noenter vt-trl" id="vtTrial">🎫 '+T('Клуб — посылка каждый день, от 7 голосов','Club — a parcel every day, from 7 votes')+' ›</button>';},
  bind:function(d){var b=d.querySelector('#vtTrial');if(b)b.onclick=function(){hideModal();openShop('p');};}});
// после пробной посылки — один раз на следующий день напомнить строкой в почте (без давления), пока не купил
MAILX.push({id:'trial2',ok:function(){return false;},always:function(){var n=sn();if(!n.tr||a3Club().n||OK||!PAY.on||dayNum()-n.tr!==1)return '';return '<button class="a3m noenter vt-trl" id="vtTrial2">🎫 '+T('Понравилась посылка? В клубе — каждый день','Liked the parcel? Club members get one daily')+' ›</button>';},
  bind:function(d){var b=d.querySelector('#vtTrial2');if(b)b.onclick=function(){hideModal();openShop('p');};}});

/* ---------- 11. сохранение: починка и облако (максимум) ---------- */
function fixN(){if(!isObj(S.shopN))S.shopN={};var n=S.shopN;for(var k in n)if(typeof n[k]!=='number'||!isFinite(n[k]))delete n[k];}
{var fx=fixSave;fixSave=function(){fx.apply(this,arguments);fixN();};}
{var mg=mergeSave;mergeSave=function(d,ref){var a=isObj(S.shopN)?Object.assign({},S.shopN):{};mg.apply(this,arguments);var b=d&&isObj(d.shopN)?d.shopN:{},o={},k;
  for(k in a)o[k]=+a[k]||0;for(k in b)if(typeof b[k]==='number')o[k]=Math.max(o[k]||0,b[k]);S.shopN=o;};}
fixN();

/* ---------- 12. стенд ?shop=1 (только мак): сразу витрина ---------- */
if(/[?&]shop=1/.test(location.search)&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){setTimeout(function(){if(!PAY.on&&PLAT==='vk')stubVK();setTimeout(function(){hideModal();G=null;openShop('p');},400);},PLAT==='vk'?24000:1500);}
/* ---------- 12б. вкладка магазина: «Особое» → «За голоса» (VK) / «Покупки» — снаружи вкладка «Магазин» UX, внутри слово «Особое» непонятно ---------- */
{var st0=fbSpecTab;fbSpecTab=function(){st0();var b=$i('shTabs')&&$i('shTabs').querySelector('[data-k="p"]');if(b&&b.style.display!=='none')b.textContent=PAY.v?T('За голоса','For votes'):T('Покупки','Purchases');};}
/* ---------- 13. вход для нового главного экрана UX: вкладка «Магазин» и «+» у монет ---------- */
window.shopOpen=function(tab){hideModal();if(typeof G!=='undefined'&&G&&!G.over)return;G=null;openShop('p');
  if(tab==='coins'){var l=$i('shList'),h=l&&l.querySelector('[data-vc="coins_l"],[data-vc="coins_s"]');if(h)try{h.scrollIntoView({block:'center'});}catch(e){}}};
// ценность наборов, видимых на этом этапе, в монетах на голос (для проверки «Большой улов» — выгоднее всех): t — дальнее место (индекс)
function perVote(t){var c=Math.max(50,TRIP_C[t]),bb=BAITBOX[t],ch=pIdx('chud'),v={};
  v.big_catch=(CHEST[t]*4+c*30+BIG_BAIT*5*3)/43;v.coins_l=CHEST[t]/14;v.coins_s=WALLET[t]/5;v.club30=c*30/21;v.club7=c*7/7;v.bait_box=(bb*5*3+Math.round(WALLET[t]/2))/7;
  var ko=PLACE_ORD.indexOf(t);if(ko<=2)v.starter=(500+10*5*3+300)/8;if(t===1)v.volga_kit=(PLACES[2].p+300+20*3+600)/11;if(ch>=0&&t===pIdx('kamchatka'))v.north_kit=(PLACES[ch].p+1500+60*3+800)/21;v.tea=Math.max(30,c)/4;return v;}
window.__shop={perVote:perVote,vitrina:vitrina,gain:gain,covers:covers,daysTxt:daysTxt,trialOk:trialOk,stubVK:stubVK,MAILX:MAILX,ios:ios};
})();
