/* ================= M27: темы оформления (реестр, кто что открыл, выбор в ⚙ «Оформление») =================
   Грузится после js/shell.js (нужны S, save, PAY, L, modal, toast). Вид A «Мягкий объём» — основа (css/look-a.css), тема — только цвета/шрифт/форма
   поверх него: класс body.<cls> (+ body.th-x у любой не основной, + body.th-dark у тёмной); CSS — css/themes.css (office — theme.css, 90-е — meta-ui.js).
   Хранение в S: S.th — выбранная тема (id), S.thU — открытые «навсегда» {id:1} (💎, достижения, ролики, сезон; облако — объединение, как fame),
   S.adTot — роликов за награду за всё время (растёт в shell.js showRewarded; облако — максимум).
   Способы открыть (unlock.t): free — сразу; pay — покупка PAY_ITEMS[unlock.pay] (PAY.own), купить — window.SHOP.buy(id) или PAY.buy(id);
     ach — достижение (unlock.ach: 'rk:<номер звания GAME.RK>' | 'col:<набор S.col>' | 'ipo' (было IPO, S.fame) | ключ S.crE (вехи 'ms_…', главы 'z_…'));
     ads — unlock.n роликов за награду всего (S.adTot); cr — unlock.cr 💎 (GAME.spend); season — в сезон (unlock.from…to, 'ММ-ДД'), открывается навсегда, если зайти в сезон.
   API (держать стабильным — им пользуется магазин, ветка shop):
     THEME.list() → [{id, ru, en, name, dark, prev:{bg,hd,card,ink,acc,acc2}, unlock, owned, cur, progress:{have,need,txt}, how}]
     THEME.owned(id), THEME.cur() → id, THEME.set(id) → true|false, THEME.progress(id) → {have,need,txt}, THEME.get(id) → запись реестра,
     THEME.buy(id) — открыть тему её способом (покупка / 💎 / ролик), THEME.open(back) — окно «Оформление», THEME.apply(), THEME.check() — выдать заработанные.
   Проверка на маке: ?theme=<id> (только localhost/LAN) — показать тему без покупки и без записи. Старые WebView: без inset/gap/?. */
(function(){
'use strict';
var THEMES=[
 {id:'soft',ru:'Мягкий объём',en:'Soft depth',cls:'',prev:{bg:'#eef1f7',hd:'#ffffff',card:'#ffffff',ink:'#101828',acc:'#3355ff',acc2:'#0f8a47'},unlock:{t:'free'}},
 {id:'poster',ru:'Тёплый плакат',en:'Warm poster',cls:'th-poster',prev:{bg:'#f4ecdf',hd:'#f4ecdf',card:'#fffaf2',ink:'#2a211b',acc:'#b5431d',acc2:'#f2c14e',line:'#2a211b'},unlock:{t:'pay',pay:'th_poster',rub:79,vk:11}},
 {id:'office',ru:'Кабинет председателя',en:'Chairman’s office',cls:'th-office',dark:1,prev:{bg:'#0c1117',hd:'#0f151d',card:'#141b24',ink:'#e9eff6',acc:'#f5b23d',acc2:'#35d49a'},unlock:{t:'pay',pay:'office',rub:79,vk:11}},
 {id:'k90',ru:'Ларёк 90-х',en:'90s kiosk',cls:'th-90s',prev:{bg:'#f8efe4',hd:'#241528',card:'#fffdf9',ink:'#2a1a22',acc:'#b0174f',acc2:'#8dffc0'},unlock:{t:'pay',pay:'set90',rub:79,vk:11}},
 {id:'birzha',ru:'Биржа',en:'Exchange',cls:'th-birzha',prev:{bg:'#eef2f0',hd:'#0b2a3d',card:'#ffffff',ink:'#0d1b24',acc:'#1d6f42',acc2:'#c9a227'},unlock:{t:'pay',pay:'ipo_pack',rub:149,vk:21}},   // M36: из «Колокола биржи»
 {id:'night',ru:'Ночной город',en:'City at night',cls:'th-night',dark:1,prev:{bg:'#0b1020',hd:'#10172c',card:'#151c33',ink:'#eaf0ff',acc:'#3dd6ff',acc2:'#ff4fa3'},unlock:{t:'ads',n:15}},
 {id:'dacha',ru:'Дача',en:'Dacha',cls:'th-dacha',prev:{bg:'#eef3e3',hd:'#fffdf6',card:'#fffdf6',ink:'#1f2b19',acc:'#3f7d2a',acc2:'#ffd34d'},unlock:{t:'ach',ach:'col:dacha'}},
 {id:'gold',ru:'Золото магната',en:'Tycoon’s gold',cls:'th-gold',prev:{bg:'#f5f0e3',hd:'#0f3d2e',card:'#fffdf8',ink:'#1d1a12',acc:'#c39a2e',acc2:'#0f6e4b'},unlock:{t:'ach',ach:'rk:12'}},
 {id:'winter',ru:'Новогодний',en:'New Year',cls:'th-winter',prev:{bg:'#eaf2fb',hd:'#ffffff',card:'#ffffff',ink:'#10223a',acc:'#c62f3a',acc2:'#1f7a4a'},unlock:{t:'season',from:'12-01',to:'01-31'}},
 {id:'evening',ru:'Вечерний',en:'Evening',cls:'th-evening',dark:1,prev:{bg:'#17130f',hd:'#1d1813',card:'#231d17',ink:'#f3e9dc',acc:'#ff9f5a',acc2:'#9bd47a'},unlock:{t:'cr',cr:60}},
 {id:'sea',ru:'Морской бриз',en:'Sea breeze',cls:'th-sea',prev:{bg:'#e7f4f5',hd:'#ffffff',card:'#ffffff',ink:'#0c2a33',acc:'#0f7c8c',acc2:'#ff7a59'},unlock:{t:'cr',cr:40}}
];
var BY={};THEMES.forEach(function(t){BY[t.id]=t;});
function T(ru,en){return typeof L==='function'?L(ru,en):ru;}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function thU(){if(!isO(S.thU))S.thU={};return S.thU;}
function hasPAY(){return typeof PAY!=='undefined'&&!!PAY;}   // PAY и SHOP — const в общем коде (не на window)
function payOwn(id){try{return hasPAY()&&!!PAY.own(id);}catch(e){return false;}}
var DEV=null;try{var m=/[?&]theme=([a-z0-9]+)/.exec(location.search);if(m&&BY[m[1]]&&/^(localhost|127\.0\.0\.1|\[::1\])$|^(192\.168\.|10\.)|\.local$/.test(location.hostname))DEV=m[1];}catch(e){}
function vk(){return typeof PLAT!=='undefined'&&PLAT==='vk';}
function golosa(n){var a=n%10,b=n%100;return n+' '+(a===1&&b!==11?'голос':a>=2&&a<=4&&(b<12||b>14)?'голоса':'голосов');}
/* ---------- открыто ли и сколько осталось ---------- */
function today(){var d=new Date(typeof nowMs==='function'?nowMs():Date.now());return ('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function inSeason(u){var t=today();return u.from<=u.to?(t>=u.from&&t<=u.to):(t>=u.from||t<=u.to);}
function rkNum(){return (S.rk|0)+1;}
function achHave(a){ // {have, need} по ключу достижения
  if(/^rk:/.test(a)){var i=+a.slice(3),R=window.GAME&&GAME.RK,need=R&&R[i]?R[i].s:0,n=0;try{n=GAME.stars().n;}catch(e){}
    return (S.rk|0)>=i?{have:1,need:1}:need?{have:Math.min(n,need),need:need,st:1}:{have:0,need:1};}
  if(/^col:/.test(a)){var k=a.slice(4);if(S.col&&S.col[k])return {have:1,need:1};
    var set=window.ECON&&ECON.LUX_SET&&ECON.LUX_SET[k];if(set){var h=0;for(var j=0;j<set.length;j++)if(S.lxE&&S.lxE[set[j]])h++;return {have:h,need:set.length,it:1};}return {have:0,need:1};}
  if(a==='ipo')return {have:Array.isArray(S.fame)&&S.fame.length?1:0,need:1};
  return {have:S.crE&&S.crE[a]?1:0,need:1};}
function earned(t){var u=t.unlock;switch(u.t){
  case 'free':return true;
  case 'pay':return payOwn(u.pay);
  case 'ads':return (S.adTot|0)>=u.n;
  case 'ach':var a=u.ach;if(/^rk:/.test(a))return (S.rk|0)>=+a.slice(3);if(/^col:/.test(a))return !!(S.col&&S.col[a.slice(4)]);
    if(a==='ipo')return Array.isArray(S.fame)&&S.fame.length>0;return !!(S.crE&&S.crE[a]);
  case 'season':return inSeason(u);
  default:return false;}}
function owned(id){var t=BY[id];if(!t)return false;if(t.unlock.t==='free')return true;if(t.unlock.t==='pay')return payOwn(t.unlock.pay);
  return !!thU()[id]||earned(t);}
function rkName(i){var R=window.GAME&&GAME.RK;return R&&R[i]?T(R[i].ru,R[i].en):'';}
// цена — только из каталога площадки (Яндекс 1.13.2: цена и валюта из SDK; VK — голоса) через PAY.price; нет каталога — без цифр
function payPriceTxt(u){try{var it=typeof PAY!=='undefined'&&PAY.item&&PAY.item(u.pay);if(it)return T('Покупка: ','Purchase: ')+PAY.price(it);}catch(e){}return T('Покупка в магазине','Available in the shop');}
function progress(id){var t=BY[id];if(!t)return {have:0,need:1,txt:''};var u=t.unlock,o=owned(id);
  if(u.t==='free')return {have:1,need:1,txt:T('Бесплатно','Free')};
  if(u.t==='pay')return {have:o?1:0,need:1,txt:o?T('Куплено','Purchased'):payPriceTxt(u)};
  if(u.t==='ads'){var n=Math.min(S.adTot|0,u.n);return {have:o?u.n:n,need:u.n,txt:o?T('Открыто','Unlocked'):T(n+' из '+u.n+' роликов',n+' of '+u.n+' videos')};}
  if(u.t==='cr')return {have:o?1:0,need:1,txt:o?T('Открыто','Unlocked'):T('Открыть за '+u.cr+' 💎','Unlock for '+u.cr+' 💎')};
  if(u.t==='season'){var s=inSeason(u);return {have:o?1:0,need:1,txt:o?(s||thU()[id]?T('Открыто','Unlocked'):''):T('Откроется в декабре','Opens in December')};}
  if(u.t==='ach'){var h=achHave(u.ach);if(o)return {have:h.need,need:h.need,txt:T('Открыто','Unlocked')};
    if(/^rk:/.test(u.ach))return {have:h.have,need:h.need,txt:T('Звание «'+rkName(+u.ach.slice(3))+'»: ★ '+h.have+' из '+h.need,'Rank “'+rkName(+u.ach.slice(3))+'”: ★ '+h.have+' of '+h.need)};
    if(/^col:dacha$/.test(u.ach))return {have:h.have,need:h.need,txt:T('Набор «Дачник»: '+h.have+' из '+h.need+' вещей','“Dacha lover” set: '+h.have+' of '+h.need+' items')};
    if(u.ach==='ipo')return {have:h.have,need:1,txt:T('Выйти на биржу (IPO)','Go public (IPO)')};
    return {have:h.have,need:h.need,txt:T('За достижение','For an achievement')};}
  return {have:0,need:1,txt:''};}
function how(id){var t=BY[id],u=t&&t.unlock;if(!u)return '';
  switch(u.t){case 'free':return T('Бесплатно, для всех','Free for everyone');
    case 'pay':return T('Навсегда, покупкой в магазине','Forever, bought in the shop');
    case 'ads':return T('За '+u.n+' роликов за награду — любые, за всё время','For '+u.n+' reward videos — any, all time');
    case 'cr':return T('Навсегда за '+u.cr+' 💎','Forever for '+u.cr+' 💎');
    case 'season':return T('В декабре и январе — для всех; зашли в сезон — останется навсегда','In December and January for everyone; visit in season and it stays forever');
    case 'ach':return /^rk:/.test(u.ach)?T('За звание «'+rkName(+u.ach.slice(3))+'»','For the “'+rkName(+u.ach.slice(3))+'” rank'):/^col:dacha$/.test(u.ach)?T('Соберите в Кабинете набор вещей «Дачник»','Collect the “Dacha lover” set of things in the Office'):T('За достижение','For an achievement');}
  return '';}
function cur(){if(DEV)return DEV;var id=S.th;
  if(id==null){ // до M27: «Лихие 90-е» главнее «Кабинета» (shell.js applyOffice)
    if(payOwn('set90')&&S.th90!==false)id='k90';else if(payOwn('office')&&S.office!==false)id='office';else id='soft';}
  return BY[id]&&owned(id)?id:'soft';}
function list(){var c=cur();return THEMES.map(function(t){return {id:t.id,ru:t.ru,en:t.en,name:T(t.ru,t.en),dark:!!t.dark,prev:t.prev,unlock:t.unlock,
  owned:owned(t.id),cur:t.id===c,progress:progress(t.id),how:how(t.id)};});}
/* ---------- применить ---------- */
var ALLC=['th-x','th-dark'];THEMES.forEach(function(t){if(t.cls)ALLC.push(t.cls);});
function apply(){var b=document.body;if(!b)return;var t=BY[cur()]||BY.soft,i;
  for(i=0;i<ALLC.length;i++)b.classList.remove(ALLC[i]);
  if(t.cls){b.classList.add(t.cls);b.classList.add('th-x');}if(t.dark)b.classList.add('th-dark');
  try{var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute('content',t.prev.hd);}catch(e){}}
function set(id){if(!BY[id]||!owned(id))return false;S.th=id;if(DEV&&DEV!==id)DEV=null;
  if(id==='office'){S.office=true;S.th90=false;}else if(id==='k90')S.th90=true;else{S.office=false;S.th90=false;} // для старых версий игры на другом устройстве
  try{save();}catch(e){}apply();try{STAT.ev('mod',{m:'theme',a:id});}catch(e){}return true;}
// выдать заработанные (достижение, ролики, сезон) навсегда и сказать один раз
function check(quiet){var got=[];for(var i=0;i<THEMES.length;i++){var t=THEMES[i],u=t.unlock;if(u.t==='free'||u.t==='pay'||u.t==='cr'||thU()[t.id])continue;
    if(earned(t)){thU()[t.id]=1;got.push(t);}}
  if(got.length){try{save();}catch(e){}if(!quiet&&typeof toast==='function')toast('🎨 '+T('Новое оформление: «'+T(got[0].ru,got[0].en)+'» — ⚙ «Оформление»','New theme: “'+T(got[0].ru,got[0].en)+'” — ⚙ “Themes”'),3200);}
  return got.length;}
// покупка прошла (shell.js payAfter(id)): купленную тему сразу включаем
function bought(pid){for(var i=0;i<THEMES.length;i++){var t=THEMES[i];if(t.unlock.t==='pay'&&t.unlock.pay===pid&&payOwn(pid)){set(t.id);return true;}}return false;}
function payReady(pid){try{return !!(hasPAY()&&PAY.on&&PAY.item(pid)&&typeof PAY_ITEMS!=='undefined'&&PAY_ITEMS[pid]);}catch(e){return false;}}
function buy(id,re){var t=BY[id];if(!t||owned(id))return;var u=t.unlock;re=re||function(){};
  if(u.t==='pay'){var r;try{r=typeof SHOP!=='undefined'&&SHOP&&SHOP.buy?SHOP.buy(u.pay):hasPAY()?PAY.buy(u.pay):null;}catch(e){}
    Promise.resolve(r).then(function(){if(owned(id)&&cur()!==id)set(id);re();},function(){re();});return;}
  if(u.t==='cr'){if(!window.GAME||!GAME.spend(u.cr,'th_'+id)){try{SND.no();}catch(e){}toast(T('Не хватает 💎: нужно '+u.cr,'Not enough 💎: you need '+u.cr));return;}
    thU()[id]=1;try{SND.coin();}catch(e){}set(id);toast('🎨 '+T('Оформление «'+t.ru+'» — ваше навсегда','The “'+t.en+'” theme is yours forever'));re();return;}
  // STAT v1.2: ролик в счёт темы — thad {th, n: сколько набрано}
  if(u.t==='ads'){if(typeof adOk!=='function'||!adOk())return;try{STAT.place('theme');}catch(e){}
    showRewarded(function(){try{STAT.ev('thad',{th:id,n:Math.min(S.adTot|0,u.n)});}catch(e){}if(!check(true)){toast('📺 '+T('Засчитано: '+Math.min(S.adTot|0,u.n)+' из '+u.n,'Counted: '+Math.min(S.adTot|0,u.n)+' of '+u.n));}
      else{set(id);toast('🎨 '+T('Открыто «'+t.ru+'»!','“'+t.en+'” unlocked!'));}re();});}}
/* ---------- окно «Оформление» ---------- */
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pv(t){var p=t.prev;return '<div class="thpv" style="background:'+p.bg+'"><i style="background:'+p.hd+(p.line?';border-bottom:2px solid '+p.line:'')+'"></i><em style="color:'+p.acc+'">₽</em>'+
  '<b style="background:'+p.card+';color:'+p.ink+(p.line?';border:2px solid '+p.line+';box-shadow:2px 2px 0 '+p.line:'')+'"></b><s style="background:'+p.acc+'"></s><u style="background:'+p.acc2+'"></u></div>';}
var back=null;
function open(bk){if(bk!==undefined)back=bk;check(true);var L0=list(),h='';
  for(var i=0;i<L0.length;i++){var x=L0[i],t=BY[x.id],u=t.unlock,act='';
    if(x.cur)act='<span class="thok">✓ '+T('Сейчас','In use')+'</span>';
    else if(x.owned)act='<button class="btn accent noenter" data-th="set:'+x.id+'">'+T('Включить','Apply')+'</button>';
    else if(u.t==='pay')act=payReady(u.pay)?'<button class="btn accent noenter" data-th="buy:'+x.id+'">'+T('Купить','Buy')+' · '+PAY.price(PAY.item(u.pay))+'</button>':'';
    else if(u.t==='cr')act='<button class="btn cr noenter" data-th="buy:'+x.id+'"'+((S.cr|0)<u.cr?' disabled':'')+'>'+T('Открыть','Unlock')+' · '+u.cr+' 💎</button>';
    else if(u.t==='ads'&&typeof adOk==='function'&&adOk())act='<button class="btn noenter" data-th="buy:'+x.id+'">📺 '+T('Ролик за рекламу +1','Reward video +1')+'</button>';
    var pr=x.progress,bar=!x.owned&&pr.need>1?'<div class="thbar"><i style="width:'+Math.round(100*pr.have/pr.need)+'%"></i></div>':'';
    h+='<div class="thc'+(x.cur?' cur':'')+(x.owned?'':' lock')+'">'+pv(t)+(x.owned?'':'<span class="thlk">🔒</span>')+'<div class="thn">'+esc(x.name)+'</div>'+
      '<div class="thh">'+esc(x.owned?(u.t==='free'?T('Основной вид','Default look'):T('Ваше — навсегда','Yours forever')):x.how)+(x.owned||!pr.txt||u.t==='cr'?'':'<br><b>'+esc(pr.txt)+'</b>')+'</div>'+bar+act+'</div>';}
  modal('<h2>🎨 '+T('Оформление','Themes')+'</h2><p class="mut" style="margin:-4px 0 10px">'+T('Меняются только цвета и вид — игра та же. Открытое остаётся навсегда.','Only colours and looks change — the game stays the same. Unlocked themes stay forever.')+'</p>'+
    '<div class="thg">'+h+'</div><div class="row"><button class="btn" id="thBack" data-esc>'+(back?T('← Назад','← Back'):T('Готово','Done'))+'</button></div>');
  try{modalRe=open;}catch(e){}
  var mc=document.getElementById('mcard');mc.querySelectorAll('[data-th]').forEach(function(b){b.onclick=function(){var a=b.getAttribute('data-th').split(':');
    try{SND.tap();}catch(e){}if(a[0]==='set'){set(a[1]);open();}else buy(a[1],function(){if(typeof modalOn!=='undefined'&&modalOn)open();});};});
  document.getElementById('thBack').onclick=function(){if(back)back();else hideModal();};
  try{STAT.screen('look');}catch(e){}}   // STAT v1.2: окно «Оформление» — scr look (было 'themes')
window.THEME={THEMES:THEMES,list:list,owned:owned,cur:cur,set:set,progress:progress,get:function(id){return BY[id]||null;},buy:buy,open:open,apply:apply,check:check,bought:bought};
apply();
window.addEventListener('load',function(){apply();check(true);if(window.GAME&&GAME.on){GAME.on('change',function(){if(check())apply();});GAME.on('close',function(){if(check())apply();});}});
})();
