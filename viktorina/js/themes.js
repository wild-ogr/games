/* Дворовая викторина — ТЕМЫ ОФОРМЛЕНИЯ (look1, 04.10; по схеме тем Рыбалки/Магната). Журнал: hobby-analytics/release-g/viktorina-look1.md
   Основной вид — А «Дворовое шоу» (css/look.css, бесплатно, у всех). Тема = запись в THEMES + класс html.th-<id> в css/themes.css.
   «Классика» — прежний вид игры (html без класса lk): эмодзи, портреты в кружках, системный шрифт.
   НОВАЯ ТЕМА: (1) строка в THEMES; (2) блок html.lk.th-<id>{…} в css/themes.css (+ сцена SCN и контур TH в js/look.js); (3) если продаётся —
   строка в PAY_ITEMS (index.html, рядом с th_tele), в hobby-pay/catalog.json (VK) и в консоли Яндекса («Инап-покупки»).
   Способы открыть (unlock.t): free; pay {pay:id товара}; ads {n: роликов за награду за всё время, S.adTot}.
   Хранение: S.th — выбранная, S.thU — открытые навсегда {id:1} (облако — объединение), S.adTot — роликов за награду (облако — максимум).
   API: THEME.list/owned/cur/set/get/progress/buy/open/apply/check/bought. ?theme=<id> на localhost/LAN — тема без покупки и без записи.
   Новая кнопка рекламы здесь — #thAd (есть в AD_BTN_SEL), первой строкой adHold('theme'), третий параметр late.
   STAT v1.2: окно — scr look; ролик в счёт темы — thad {th, n}; тема сеанса — cfg {th}; покупка — обычный buy (обёртка PAY.buy в index.html). */
(function(){
'use strict';
var THEMES=[
 {id:'dvor',ru:'Дворовое шоу',en:'Yard show',prev:{bg:'#9fd8f2',hd:'#fffdf6',card:'#fffaf0',ink:'#233247',ans:'#ffffff',acc:'#ff7a1a',line:'#233247'},unlock:{t:'free'},
  ds:['Летний двор, флажки, Михалыч в полный рост, крупные таблички с тёмным контуром. Основной вид игры','Summer yard, bunting, big outlined signs. The main look']},
 {id:'tele',ru:'Телестудия',en:'TV studio',dark:1,prev:{bg:'#1a2666',hd:'#22307a',card:'#fff6dc',ink:'#1b1f3a',ans:'#2c3f9e',acc:'#f2a900',line:'#f4c542'},unlock:{t:'pay',pay:'th_tele'},
  ds:['Вечерняя телеигра: синяя студия, прожекторы, табло в лампочках, золото','An evening TV quiz: blue studio, spotlights, a light-bulb board, gold']},
 {id:'doska',ru:'Школьная доска',en:'School board',prev:{bg:'#2c5847',hd:'#2c5847',card:'#2c5847',ink:'#f8f5ea',ans:'#fdfbf3',acc:'#ffcf40',line:'#f8f5ea'},unlock:{t:'car',d:3,n:15},   // решение владельца 09.10: за карьеру (район «Квартал») или 15 роликов — что раньше
 
  ds:['Вопрос мелом на доске, ответы — листки из тетради, красная ручка учителя','The question in chalk, answers on notebook paper, the teacher’s red pen']},
 {id:'classic',ru:'Классика',en:'Classic',prev:{bg:'#b9e2c8',hd:'#ffffff',card:'#fffdf7',ink:'#2d3436',ans:'#ffffff',acc:'#e8590c',line:'#cfc8b8'},unlock:{t:'free'},
  ds:['Прежний вид игры: светлые плашки, портреты в кружках, знакомые значки','The previous look: light tiles, round portraits, familiar icons']}
];
window.THEMES=THEMES;
var Lx=function(r,e){return typeof L==='function'?L(r,e):r;};
var LOCAL=/^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(location.hostname);
var FORCE=(function(){var m=/[?&]theme=([a-z0-9_]+)/.exec(location.search);return LOCAL&&m&&get(m[1])?m[1]:'';})();
function get(id){for(var i=0;i<THEMES.length;i++)if(THEMES[i].id===id)return THEMES[i];return null;}
function thU(){if(!S.thU||typeof S.thU!=='object'||Array.isArray(S.thU))S.thU={};return S.thU;}
function carD(){try{return window.CAR&&CAR.rank?(+CAR.rank().d||0):0;}catch(e){return 0;}}
function carN(d){try{return CAR.DIST[d].n;}catch(e){return 'Квартал';}}
function prog(T){var u=T.unlock;if(u.t==='car')return {have:Math.min(carD(),u.d),need:u.d,txt:Lx('район «'+carN(u.d)+'» в карьере','career district «'+carN(u.d)+'»')};if(u.t==='ads'){var h=Math.min(u.n,S.adTot||0);return {have:h,need:u.n,txt:Lx(h+' из '+u.n+' роликов',h+' of '+u.n+' videos')};}return null;}
function earned(T){var u=T.unlock;
  if(u.t==='free')return true;if(thU()[T.id])return true;
  if(u.t==='pay')return !!(typeof PAY!=='undefined'&&PAY.own&&PAY.own(u.pay));
  if(u.t==='ads')return (S.adTot||0)>=u.n;
  if(u.t==='car')return carD()>=u.d||(S.adTot||0)>=u.n;
  return false;}
function owned(id){var T=get(id);if(!T)return false;if(FORCE===id)return true;return earned(T);}
function how(T){var u=T.unlock;
  if(u.t==='free')return Lx('бесплатно','free');
  if(u.t==='pay'){var it=typeof PAY_ITEMS!=='undefined'&&PAY_ITEMS[u.pay];return PLAT==='vk'?(it?it.vk+' '+Lx('голосов','votes'):''):Lx('покупка','purchase');}
  if(u.t==='ads')return Lx('за '+u.n+' роликов','for '+u.n+' videos');
  if(u.t==='car')return Lx('за район «'+carN(u.d)+'» в карьере','for the «'+carN(u.d)+'» career district');
  return '';}
function cur(){var id=FORCE||S.th||'dvor';return owned(id)?id:'dvor';}
function apply(){var id=cur();if(window.LK)LK.setCls(id);rerender();}
// перерисовать то, что уже на экране (персонажи, вопрос) — без смены экрана и без событий статистики
function rerender(){try{
  if(onScr('scr-menu')&&$('hostAv'))$('hostAv').innerHTML=portrait('mihalych','happy');
  if(G&&onScr('scr-game'))renderQ();
  var q=document.querySelectorAll('#mcard svg[data-pv]');for(var i=0;i<q.length;i++){var p=q[i].getAttribute('data-pv').split('/');q[i].outerHTML=portrait(p[0],p[1]);}
 }catch(e){}}
function set(id){if(!owned(id))return false;if(!FORCE){S.th=id;try{save();}catch(e){}}apply();try{STAT.ev('mod',{m:'theme',a:'set',k:id});}catch(e){}return true;}
// выдать заработанное (ролики) — навсегда; тост один раз
function check(silent){var got=[];for(var i=0;i<THEMES.length;i++){var T=THEMES[i];if((T.unlock.t!=='ads'&&T.unlock.t!=='car')||thU()[T.id])continue;if(earned(T)){thU()[T.id]=1;got.push(T);}}
  if(got.length){try{save();}catch(e){}if(!silent)try{toast('🎨 '+Lx('Открыто оформление','New look unlocked')+': «'+Lx(got[0].ru,got[0].en)+'». ⚙ → '+Lx('Оформление','Looks'),4200);}catch(e){}}
  return got;}
function bought(payId){for(var i=0;i<THEMES.length;i++){var T=THEMES[i];if(T.unlock.t==='pay'&&T.unlock.pay===payId){thU()[T.id]=1;set(T.id);return true;}}return false;}
function list(){return THEMES.map(function(T){return {id:T.id,ru:T.ru,en:T.en,name:Lx(T.ru,T.en),dark:!!T.dark,prev:T.prev,unlock:T.unlock,owned:owned(T.id),cur:cur()===T.id,progress:prog(T),how:how(T)};});}
function canBuy(T){var u=T.unlock;return u.t==='pay'&&typeof PAY!=='undefined'&&PAY.on&&!!PAY.item(u.pay)&&!(typeof inGame==='function'&&inGame());}
var back=null;
function buy(id){var T=get(id);if(!T||owned(id))return;var u=T.unlock;
  if(u.t==='pay'){if(canBuy(T)){try{STAT.offer('theme');}catch(e){}PAY.re=function(){open();};PAY.buy(u.pay);}else toast(Lx('Покупки сейчас недоступны','Purchases are not available right now'),2400);return;}
  if(u.t==='ads'){if(typeof adHold==='function'&&adHold('theme'))return;
    if(!(typeof adOk==='function'&&adOk())){toast(Lx('Ролик сейчас недоступен — загляни позже','No video right now — try later'),2600);return;}
    try{STAT.place('theme');}catch(e){}hideModal();
    // награда — +1 к счётчику роликов (обёртка ниже); late — поздний «досмотрел» (adt): тоже в счёт, окно не трогаем
    var th=function(){try{STAT.ev('thad',{th:T.id,n:Math.min(u.n,S.adTot||0)});}catch(e){}};
    showRewarded(function(){th();check();open();},function(w){open();},function(){th();return Lx('ролик в счёт оформления засчитан','the video counts towards the look');});}}
function swatch(T){var p=T.prev;return '<span class="thp" style="background:'+p.bg+'"><i class="thp-h" style="background:'+p.hd+';border:1.5px solid '+p.line+'"></i><i class="thp-c" style="background:'+p.card+';border:1.5px solid '+p.line+'"><b style="background:'+p.ink+'"></b><b style="background:'+p.ink+';width:60%"></b></i><i class="thp-b" style="background:'+p.ans+';border:1.5px solid '+p.line+'"></i><i class="thp-b" style="background:'+p.acc+';bottom:36px;left:8px;right:40px;height:10px;border-radius:5px"></i></span>';}
function open(bk){if(typeof bk==='function')back=bk;check(true);try{STAT.screen('look');}catch(e){}var c=cur(),h='';
  for(var i=0;i<THEMES.length;i++){var T=THEMES[i],own=owned(T.id),u=T.unlock,pr=prog(T),btn='';
    if(u.t==='pay'&&!own&&typeof OK!=='undefined'&&OK)continue; // Одноклассники: покупок нет — платную тему не показываем
    if(T.id===c)btn='<span class="th-on">✓ '+Lx('Включено','On')+'</span>';
    else if(own)btn='<button class="btn green noenter" data-th="set:'+T.id+'">'+Lx('Включить','Use')+'</button>';
    else if(u.t==='pay')btn=canBuy(T)?'<button class="btn accent noenter" data-th="buy:'+T.id+'">'+Lx('Купить','Buy')+' · '+PAY.price(PAY.item(u.pay))+'</button>':'<span class="th-lk">🔒 '+Lx('покупка сейчас недоступна','not available now')+'</span>';
    else if(u.t==='ads')btn=(typeof adOk==='function'&&adOk()&&typeof AD_EXTRA!=='undefined'&&AD_EXTRA)?'<button class="btn accent noenter" id="thAd" data-th="buy:'+T.id+'">📺 '+Lx('Ролик','Video')+' · '+pr.have+' '+Lx('из','of')+' '+pr.need+'</button>':'<span class="th-lk">🔒 '+pr.txt+'</span>';
    h+='<div class="thc'+(T.id===c?' on':'')+(own?'':' lock')+'">'+swatch(T)+'<div class="thc-b"><b>'+Lx(T.ru,T.en)+(own?'':' 🔒')+'</b><small>'+Lx(T.ds[0],T.ds[1])+'</small>'+
      (pr&&!own?'<span class="gbar"><i style="width:'+Math.round(pr.have/pr.need*100)+'%"></i></span>':'')+'<div class="thc-f">'+btn+'</div></div></div>';}
  modal('<h2>🎨 '+Lx('Оформление','Looks')+'</h2><p>'+Lx('Меняется только вид: вопросы, монеты и успехи — те же.','Only the look changes: questions, coins and progress stay the same.')+'</p><div class="thg">'+h+'</div><div class="row"><button class="btn" id="mCancel">'+Lx('Назад','Back')+'</button></div>');
  var mc=document.getElementById('mcard');if(typeof PAY!=='undefined'&&PAY.on)PAY.re=function(){open();};
  if(document.getElementById('thAd'))try{STAT.offer('theme');}catch(e){}
  mc.querySelectorAll('[data-th]').forEach(function(b){b.onclick=function(){try{SND.tap();}catch(e){}var a=b.getAttribute('data-th').split(':');if(a[0]==='set'){set(a[1]);open();}else buy(a[1]);};});
  document.getElementById('mCancel').onclick=function(){if(back){var f=back;back=null;f();}else{hideModal();if(G&&!G.over&&onScr('scr-game'))YG.start();}};}
window.THEME={list:list,owned:owned,cur:cur,set:set,get:get,progress:function(id){var T=get(id);return T?prog(T):null;},buy:buy,open:open,apply:apply,check:check,bought:bought};

/* ---- связь с игрой (обёртки) ---- */
function themeRow(id,after){var T=get(cur()),b=document.createElement('button');b.className='set noenter';b.id=id;
  b.innerHTML='<span>🎨 '+Lx('Оформление','Looks')+'<br><small>'+Lx('сейчас','now')+': '+Lx(T.ru,T.en)+'</small></span><i class="go">›</i>';b.onclick=function(){try{SND.tap();}catch(e){}open(after);};return b;}
// ⚙: строка «🎨 Оформление · сейчас: …» перед кнопками
{var os=openSettings;openSettings=function(){os.apply(this,arguments);var mc=document.getElementById('mcard'),row=mc&&mc.querySelector('.row');if(!row)return;row.parentNode.insertBefore(themeRow('stTheme',openSettings),row);};
 document.getElementById('btnSet').onclick=openSettings;document.getElementById('gSet').onclick=openSettings;}
// «Монеты»: та же строка под покупками
{var oc=openCoins;openCoins=function(bk){oc.apply(this,arguments);var mc=document.getElementById('mcard'),row=mc&&mc.querySelector('.row');if(!row)return;row.parentNode.insertBefore(themeRow('mTheme',function(){openCoins(bk);}),row);};
 document.getElementById('mCoins').onclick=function(){openCoins();};document.getElementById('tCoins').onclick=function(){openCoins();};
 document.getElementById('gCoins').onclick=function(){if(G&&!G.over&&G.mode==='lad')openCoins(renderQ);else openCoins();};}
// ролики за награду — счётчик за всё время (тема за ролики); поздний «досмотрел» тоже считается
{var sr=showRewarded,cnt=function(f){return function(){S.adTot=(S.adTot||0)+1;try{return f&&f.apply(this,arguments);}finally{try{save();check();}catch(e){}}};};
 showRewarded=function(cb,onFail,late){return sr(cnt(cb),onFail,cnt(late));};}
// покупка темы
{var pa=payAfter;payAfter=function(id){if(id)bought(id);pa.apply(this,arguments);};}
// облако: открытые — объединение, ролики — максимум
{var ms=mergeSave;mergeSave=function(d,ref){var u0=Object.assign({},thU()),a0=S.adTot||0;ms.apply(this,arguments);var u=thU();for(var k in u0)u[k]=1;if(d&&d.thU&&typeof d.thU==='object'&&!Array.isArray(d.thU))for(var k2 in d.thU)u[k2]=1;
  S.adTot=Math.max(a0,+(d&&d.adTot)||0);apply();};}
{var fx=fixSave;fixSave=function(){fx.apply(this,arguments);thU();if(typeof S.adTot!=='number'||!(S.adTot>=0)||!isFinite(S.adTot))S.adTot=0;if(S.th!=null&&!get(S.th))delete S.th;};fixSave();}
var r=document.getElementById('rays');if(r&&window.LK&&!r.innerHTML)r.innerHTML=LK.rays();
apply();check(true);
// карьера (CAR грузится позже): после очков карьеры проверить «за район» — тост об открытии один раз
setTimeout(function(){try{if(window.CAR)['add','onAnswer','seal'].forEach(function(k){var f=CAR[k];if(typeof f!=='function'||f._th)return;CAR[k]=function(){var r=f.apply(this,arguments);try{check();}catch(e){}return r;};CAR[k]._th=1;});check(true);}catch(e){}},0);
try{STAT.cfg({th:cur()});}catch(e){} // STAT v1.2: тема сеанса → событие cfg
})();
