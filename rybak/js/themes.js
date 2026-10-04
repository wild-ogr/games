/* Рыбалка с Петровичем — ТЕМЫ ОФОРМЛЕНИЯ (rlook, 03.10, по схеме тем «Магната» M27). Журнал: hobby-analytics/release-f/rybak-redesign.md
   Основной вид — «Стекло и свет» (css/look.css, бесплатно, у всех). Тема = запись в THEMES + класс body.<cls> с CSS-переменными в css/themes.css.
   НОВАЯ ТЕМА: (1) строка в THEMES ниже; (2) в css/themes.css блок body.th-<id>{--pn:…;--tx:…;--acc1:…;--cv-…} (переменные — список в начале css/look.css);
   (3) если продаётся — строка в PAY_ITEMS (index.html, рядом с th_warm) и в hobby-pay/catalog.json / консоли Яндекса. Больше ничего.
   Способы открыть (unlock.t): free; pay {pay:id товара}; ads {n: роликов за награду за всё время, S.adTot}; ach {k:'caught:N'|'alb:N'|'place:I'|'legs:N'};
   cr/coins {n: монет}; season {from:'ММ-ДД', to:'ММ-ДД'} — в сезон открыта всем, кто зашёл в сезон, остаётся навсегда (keep:0 — только в сезон).
   Хранение: S.th — выбранная (из более нового сохранения), S.thU — открытые навсегда {id:1} (облако — объединение), S.adTot — роликов за награду (облако — максимум).
   API: THEME.list/owned/cur/set/get/progress/buy/open/apply/check/bought. ?theme=<id> на localhost/LAN — тема без покупки и без записи. */
(function(){
'use strict';
var THEMES=[
 {id:'glass',ru:'Стекло и свет',en:'Glass & light',cls:'',dark:1,prev:{bg:'#3d6175',hd:'rgba(16,26,36,.6)',card:'rgba(16,26,36,.55)',ink:'#fff',acc:'#ffcf7a',acc2:'#ff8f4f'},unlock:{t:'free'}},
 {id:'warm',ru:'Тёплая иллюстрация',en:'Warm illustration',cls:'th-warm',prev:{bg:'#f6e7cf',hd:'#fffaf1',card:'#fffaf1',ink:'#2d2620',acc:'#ff9365',acc2:'#f0623a'},unlock:{t:'pay',pay:'th_warm'},
  ds:['Кремовые карточки, тёмный текст, цветные значки, латунная лупа. Самая контрастная и быстрая на слабых телефонах','Cream cards, dark text, colour icons, a brass loupe. Highest contrast, fastest on weak phones']},
 {id:'nature',ru:'Природный минимализм',en:'Nature minimal',cls:'th-nature',prev:{bg:'#f3f1ea',hd:'#ffffff',card:'#ffffff',ink:'#17261f',acc:'#1e6a53',acc2:'#1e6a53'},unlock:{t:'ads',n:15},
  ds:['Светлый песок и хвоя, крупные цифры, шкала «мягко · туго · порвёт». Спокойно и читаемо','Sand and pine, big numbers, a «slack · tight · snaps» gauge. Calm and clear']},
 {id:'winter',ru:'Зимняя рыбалка',en:'Winter fishing',cls:'th-winter',dark:1,prev:{bg:'#6f8fa8',hd:'rgba(20,40,64,.6)',card:'rgba(22,44,70,.6)',ink:'#fff',acc:'#bfe6ff',acc2:'#7cc4f5'},unlock:{t:'season',from:'12-01',to:'02-28'},
  ds:['Иней и лёд: голубое стекло, снежная кнопка. Открыта всем, кто заходит зимой — и остаётся навсегда','Frost and ice: blue glass, a snowy button. Free for everyone who plays in winter — kept forever']}
];
window.THEMES=THEMES;
var Lx=function(r,e){return typeof L==='function'?L(r,e):r;};
var LOCAL=/^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(location.hostname);
var FORCE=(function(){var m=/[?&]theme=([a-z0-9_]+)/.exec(location.search);return LOCAL&&m?m[1]:'';})();
function get(id){for(var i=0;i<THEMES.length;i++)if(THEMES[i].id===id)return THEMES[i];return null;}
function md(){var d=new Date(typeof nowMs==='function'?nowMs():Date.now());return ('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function inSeason(u){var t=md();return u.from<=u.to?t>=u.from&&t<=u.to:t>=u.from||t<=u.to;}
function thU(){if(!S.thU||typeof S.thU!=='object'||Array.isArray(S.thU))S.thU={};return S.thU;}
function prog(T){var u=T.unlock,t=u.t;
  if(t==='ads'){var h=Math.min(u.n,S.adTot||0);return {have:h,need:u.n,txt:Lx(h+' из '+u.n+' роликов',h+' of '+u.n+' videos')};}
  if(t==='ach'){var p=u.k.split(':'),n=+p[1],v=p[0]==='caught'?(S.caught||0):p[0]==='alb'?Object.keys(S.alb||{}).length:p[0]==='legs'?Object.keys(S.legs||{}).length:p[0]==='place'?(S.open&&S.open[n]?n:0):0;
    return {have:Math.min(v,n),need:n,txt:p[0]==='caught'?Lx('поймано '+Math.min(v,n)+' из '+n,Math.min(v,n)+' of '+n+' caught'):p[0]==='alb'?Lx('видов '+Math.min(v,n)+' из '+n,Math.min(v,n)+' of '+n+' species'):''};}
  if(t==='cr'||t==='coins')return {have:Math.min(S.coins||0,u.n),need:u.n,txt:Lx('у тебя '+(S.coins||0),'you have '+(S.coins||0))};
  return null;}
function earned(T){var u=T.unlock,t=u.t;
  if(t==='free')return true;if(thU()[T.id])return true;
  if(t==='pay')return !!(typeof PAY!=='undefined'&&PAY.own&&PAY.own(u.pay));
  if(t==='ads')return (S.adTot||0)>=u.n;
  if(t==='ach'){var p=prog(T);return p&&p.have>=p.need;}
  if(t==='season')return inSeason(u);
  return false;}
function owned(id){var T=get(id);if(!T)return false;if(FORCE===id)return true;return earned(T);}
function how(T){var u=T.unlock,t=u.t;
  if(t==='free')return Lx('бесплатно','free');
  if(t==='pay'){var it=typeof PAY_ITEMS!=='undefined'&&PAY_ITEMS[u.pay];return PLAT==='vk'?(it?it.vk+' '+Lx('голосов','votes'):''):Lx('покупка','purchase');}
  if(t==='ads')return Lx('за '+u.n+' роликов','for '+u.n+' videos');
  if(t==='ach')return Lx('за достижение','achievement');
  if(t==='cr'||t==='coins')return u.n+' 💰';
  if(t==='season'){var d=u.from.split('-'),M=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],ME=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return Lx('в сезон: с '+(+d[1])+' '+M[+d[0]-1],'in season: from '+ME[+d[0]-1]+' '+(+d[1]));}
  return '';}
function cur(){var id=FORCE||S.th||'glass';return owned(id)?id:'glass';}
function apply(){var b=document.body;if(!b)return;var id=cur(),T=get(id)||THEMES[0];
  for(var i=0;i<THEMES.length;i++)if(THEMES[i].cls)b.classList.remove(THEMES[i].cls);
  b.classList.remove('th-x','th-dark','th-light');
  if(T.cls)b.classList.add(T.cls,'th-x');b.classList.add(T.dark?'th-dark':'th-light');
  if(window.LOOK)LOOK.refresh();}
function set(id){if(!owned(id))return false;if(!FORCE){S.th=id;try{save();}catch(e){}}apply();try{STAT.ev('mod',{m:'theme',a:'set',k:id});}catch(e){}return true;}
// выдать заработанное (сезон, ролики, достижение) — навсегда; тост один раз
function check(silent){var got=[];for(var i=0;i<THEMES.length;i++){var T=THEMES[i];if(T.unlock.t==='free'||T.unlock.t==='pay'||thU()[T.id])continue;
    if(T.unlock.t==='season'&&T.unlock.keep===0)continue;if(earned(T)){thU()[T.id]=1;got.push(T);}}
  if(got.length){try{save();}catch(e){}if(!silent)try{toast('🎨 '+Lx('Открыто оформление','New look unlocked')+': «'+Lx(got[0].ru,got[0].en)+'». ⚙ → '+Lx('Оформление','Looks'),4200,true);}catch(e){}}
  return got;}
function bought(payId){for(var i=0;i<THEMES.length;i++){var T=THEMES[i];if(T.unlock.t==='pay'&&T.unlock.pay===payId){thU()[T.id]=1;set(T.id);return true;}}return false;}
function list(){return THEMES.map(function(T){return {id:T.id,ru:T.ru,en:T.en,name:Lx(T.ru,T.en),dark:!!T.dark,prev:T.prev,unlock:T.unlock,owned:owned(T.id),cur:cur()===T.id,progress:prog(T),how:how(T)};});}
function canBuy(T){var u=T.unlock;return u.t==='pay'&&typeof PAY!=='undefined'&&PAY.on&&PAY.item&&PAY.item(u.pay)&&!(typeof inGame==='function'&&inGame());}
function buy(id,after){var T=get(id);if(!T||owned(id))return;var u=T.unlock;
  if(u.t==='pay'){if(canBuy(T))PAY.buy(u.pay);else toast(Lx('Покупки сейчас недоступны','Purchases are not available right now'));return;}
  if(u.t==='ads'){if(!(typeof adOk==='function'&&adOk())){toast(Lx('Ролик сейчас недоступен — загляни позже','No video right now — try later'));return;}
    try{STAT.offer('theme');STAT.place('theme');}catch(e){}hideModal();var thad=function(){try{STAT.ev('thad',{th:id,n:Math.min(u.n,S.adTot||0)});}catch(e){}};showRewarded(function(){thad();check();(after||open)();},function(){(after||open)();},function(){thad();return Lx('ролик в счёт оформления засчитан','the video counts towards the look');});return;} /* поздний зачёт (adt): счётчик роликов растёт в обёртке ниже */
  if(u.t==='cr'||u.t==='coins'){if(S.coins<u.n){notEnough(u.n);return;}S.coins-=u.n;thU()[T.id]=1;try{STAT.ev('spend',{k:'theme:'+id,c:u.n});}catch(e){}updCoins();set(id);(after||open)();}}
function swatch(T){var p=T.prev;return '<span class="thp" style="background:'+p.bg+'"><i class="thp-h" style="background:'+p.hd+'"></i><i class="thp-c" style="background:'+p.card+'"><b style="background:'+p.ink+'"></b><b style="background:'+p.ink+';width:40%"></b></i><i class="thp-b" style="background:linear-gradient(135deg,'+p.acc+','+p.acc2+')"></i></span>';}
var back=null;
function open(bk){if(typeof bk==='function')back=bk;check(true);try{STAT.screen('look');}catch(e){}var c=cur(),h='';
  for(var i=0;i<THEMES.length;i++){var T=THEMES[i],own=owned(T.id),u=T.unlock,pr=prog(T),btn='';
    if(T.id===c)btn='<span class="th-on">✓ '+Lx('Включено','On')+'</span>';
    else if(own)btn='<button class="btn green" data-th="set:'+T.id+'">'+Lx('Включить','Use')+'</button>';
    else if(u.t==='pay')btn=canBuy(T)?'<button class="btn green noenter" data-th="buy:'+T.id+'">'+Lx('Купить','Buy')+' · '+PAY.price(PAY.item(u.pay))+'</button>':'<span class="th-lk">'+Lx('покупки недоступны','not available')+'</span>';
    else if(u.t==='ads')btn=(typeof adOk==='function'&&adOk())?'<button class="btn accent noenter" data-th="buy:'+T.id+'">📺 '+Lx('Ролик','Video')+' · '+pr.have+' '+Lx('из','of')+' '+pr.need+'</button>':'<span class="th-lk">'+pr.txt+'</span>';
    else if(u.t==='cr'||u.t==='coins')btn='<button class="btn noenter" data-th="buy:'+T.id+'">'+u.n+' 💰</button>';
    else btn='<span class="th-lk">🔒 '+how(T)+'</span>';
    h+='<div class="thc'+(T.id===c?' on':'')+(own?'':' lock')+'">'+swatch(T)+'<div class="thc-b"><b>'+Lx(T.ru,T.en)+(own?'':' 🔒')+'</b><small>'+(T.ds?Lx(T.ds[0],T.ds[1]):Lx('Основной вид игры: матовое стекло поверх живой сцены','The main look: frosted glass over the live scene'))+'</small>'+
      (pr&&!own&&pr.need?'<span class="gbar"><i style="width:'+Math.round(pr.have/pr.need*100)+'%"></i></span>':'')+'<div class="thc-f"><small class="th-how">'+how(T)+'</small>'+btn+'</div></div></div>';}
  modal('<h2>🎨 '+Lx('Оформление','Looks')+'</h2><p>'+Lx('Меняется только вид окон и кнопок. Сцена, рыба и клёв — те же у всех.','Only windows and buttons change. The scene, fish and bite stay the same.')+'</p><div class="thg">'+h+'</div><div class="row"><button class="btn" id="mCancel">'+Lx('Назад','Back')+'</button></div>');
  var mc=document.getElementById('mcard');if(typeof PAY!=='undefined'&&PAY.on)PAY.re=function(){open();};
  mc.querySelectorAll('[data-th]').forEach(function(b){b.onclick=function(){try{SND.tap();}catch(e){}var a=b.getAttribute('data-th').split(':');if(a[0]==='set'){set(a[1]);open();}else buy(a[1]);};});
  document.getElementById('mCancel').onclick=function(){if(back){var f=back;back=null;f();}else hideModal();};}
window.THEME={list:list,owned:owned,cur:cur,set:set,get:get,progress:function(id){var T=get(id);return T?prog(T):null;},buy:buy,open:open,apply:apply,check:check,bought:bought};

/* ---- связь с игрой (обёртки, как у A3/FB1) ---- */
// ⚙: строка «🎨 Оформление · сейчас: …»
{var os=openSettings;openSettings=function(){os.apply(this,arguments);var mc=document.getElementById('mcard'),row=mc&&mc.querySelector('.row');if(!row)return;var T=get(cur());
  var b=document.createElement('button');b.className='set';b.id='stTheme';b.innerHTML='<span>🎨 '+Lx('Оформление','Looks')+'<br><small>'+Lx('сейчас','now')+': '+Lx(T.ru,T.en)+'</small></span><i class="go">›</i>';
  row.parentNode.insertBefore(b,row);b.onclick=function(){try{SND.tap();}catch(e){}open(openSettings);};};
 var bs=document.getElementById('btnSet'),fs=document.getElementById('fSet');if(bs)bs.onclick=openSettings;if(fs)fs.onclick=openSettings;}
// ролики за награду — счётчик за всё время (тема за ролики)
{var sr=showRewarded,cnt=function(f){return function(){S.adTot=(S.adTot||0)+1;try{return f&&f.apply(this,arguments);}finally{try{check();}catch(e){}}};};
 showRewarded=function(cb,onFail,late){return sr(cnt(cb),onFail,cnt(late));};} /* late — поздний «досмотрел» (adt): тоже в счёт роликов */
// покупка темы
{var pa=payAfter;payAfter=function(id){bought(id);pa.apply(this,arguments);};}
// облако: открытые — объединение, ролики — максимум
{var ms=mergeSave;mergeSave=function(d,ref){var u0=Object.assign({},thU()),a0=S.adTot||0;ms(d,ref);var u=thU();for(var k in u0)u[k]=1;if(d&&d.thU&&typeof d.thU==='object')for(var k2 in d.thU)u[k2]=1;
  S.adTot=Math.max(a0,+(d&&d.adTot)||0);apply();};}
{var fx=fixSave;fixSave=function(){fx();thU();if(typeof S.adTot!=='number'||!(S.adTot>=0))S.adTot=0;if(S.th!=null&&!get(S.th))delete S.th;};fixSave();}
// фон меню — пейзаж самого дальнего места, время суток — сейчас
{var om=openMap;openMap=function(){om.apply(this,arguments);try{LOOK.bg(topPlace(),window.__todForce||todOf(hourNow()),'sun');}catch(e){}};}
// «Особое»: тема — отдельной строкой и ссылкой на все оформления
if(typeof fbSpecHtml==='function'){var fh=fbSpecHtml;fbSpecHtml=function(){var h=fh.apply(this,arguments);if(!fbSpecOn())return h;
  return h+(PAY.item('th_warm')?payHtml(['th_warm']).replace(/<h3>[^<]*<\/h3>/,'<h3>'+Lx('Оформление','Looks')+'</h3>'):'')+'<button class="a3m noenter" id="lkThL" onclick="THEME.open()">🎨 <b>'+Lx('Все оформления','All looks')+'</b> · '+Lx('бесплатные, за ролики и сезонные','free, for videos and seasonal')+' ›</button>';};}
// a3PayIds не показывает тему в «Монетах» — и не надо: она в «Особом» и в ⚙
apply();check(true);
try{STAT.cfg({th:cur(),snd:S.sound===false?0:1,calm:S.calm===true?1:0});}catch(e){} // STAT v1.2: настройки сеанса → событие cfg
try{if(document.getElementById('scr-map').classList.contains('on'))LOOK.bg(topPlace(),window.__todForce||todOf(hourNow()),'sun');}catch(e){}
})();
