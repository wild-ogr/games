/* RB:MERGE-STAT (08.10.2026) — недостающие события статистики. Только обёртки снаружи и чтение состояния: механика, клёв, экономика, вид — не меняются.
   Модуль STAT и общий блок PAY не трогаем. Грузится последним (после evstat.js и meta-*.js). Таблица всех событий — hobby-analytics/release-i/rybak-boost/logs/STAT-EVENTS.md.
   1) Покупки: buy {i, r:'show', v, p} — товар показан (раз за сеанс на товар+место); try/ok/cancel/fail получают p (место) и n (номер попытки товара за сеанс) —
      через window.statBuyX (её зовёт обёртка buy в index.html). Места: v_cheap|v_club|v_kits|v_coins|v_looks — полки витрины, shop — старая вкладка «Особое»,
      coins — окно «Монеты», ne — «Не хватает монет», set — настройки, shore — вкладка «Берег», look — окно оформления, modal — прочее окно.
      window.statSrc() — чем открыли витрину (id нажатой кнопки) → mod {m:'spec',a:'open',k}.
   2) «Не хватает монет»: mod {m:'ne',a:'show',c:сколько не хватает} и выбор mod {m:'ne',a:'ad'|'fish'|'buy'|'row'|'x'}.
   3) Первые минуты: tut s:6 — второй заброс первой рыбалки, s:7 — третий; итоги mod {m:'res',a:'again'|'more'|'map',k:рыбалок}; mod {m:'trip',a:'show'|'go'}
      («Хватает на путёвку»); mod {m:'calm',a:'no'}; mod {m:'home',a:'tourshow'} — приглашение в турнир показано (раз за сеанс).
   4) Бонусы рыбалки: bon {sk:'feel far pit luck' ступенями, pr: рыба прикормки, pk: множитель} — раз за рыбалку, только если что-то действовало (не турнир).
   5) Север: mod {m:'ch',a:'open',k:глава,p:место} — открыта глава (первая путёвка главы); mod {m:'place',a:'ask'|'no',k:место} — окно путёвки показано/«Позже»;
      mod {m:'boat',a:'need',k:место}; mod {m:'rb',a:'catch'|'foto',k:рыба} — Красная книга поймана / «сфотографировал и отпустил». */
(function(){
'use strict';
if(typeof STAT==='undefined')return;
var D=document;
function $i(id){return D.getElementById(id);}
function ev(n,p){try{STAT.ev(n,p);}catch(e){}}
function mod(m,a,o){var p={m:m,a:a},k;if(o)for(k in o)if(o.hasOwnProperty(k))p[k]=o[k];ev('mod',p);}
function payOn(){try{return !!(PAY&&PAY.on);}catch(e){return false;}}

/* ---------- 1. покупки: место показа, место попытки, номер попытки ---------- */
var mPl='',want='',cur={pl:'',t:0},shown={},tries={},last={},tap={s:'',t:0};
var SHELF=[['☕','v_cheap'],['🎫','v_club'],['🎒','v_kits'],['💰','v_coins'],['🎨','v_looks']];
function shelfOf(el){var s=el.closest('section.vt-sh'),h=s&&s.querySelector('h3'),t=h?h.textContent.replace(/^\s+/,''):'';
  for(var i=0;i<SHELF.length;i++)if(t.indexOf(SHELF[i][0])===0)return SHELF[i][1];return 'shop';}
function plOf(el){if(!el||!el.closest)return mPl||'?';
  if(el.id==='neBuy')return 'ne';
  if(el.hasAttribute('data-th'))return 'look';
  if(el.closest('#shList')){if(typeof shopTab!=='undefined'&&shopTab==='d')return 'shore';return el.hasAttribute('data-vpid')?shelfOf(el):'shop';}
  return mPl||'modal';}
function thPay(b){try{var t=window.THEME&&THEME.get&&THEME.get(String(b.getAttribute('data-th')).slice(4)),u=t&&t.unlock;return u&&u.t==='pay'?u.pay:'';}catch(e){return '';}}
function show(root){if(!payOn()||!root||!root.querySelectorAll)return;
  try{var a=root.querySelectorAll('[data-vpid],.pbuy[data-pid],[data-th^="buy:"]'),i,b,id,p,k;
    for(i=0;i<a.length;i++){b=a[i];id=b.getAttribute('data-vpid')||b.getAttribute('data-pid')||(b.hasAttribute('data-th')?thPay(b):'');
      if(!id||!PAY_ITEMS[id])continue;p=plOf(b);k=id+'|'+p;if(shown[k])continue;shown[k]=1;ev('buy',{i:id,r:'show',v:PAY_ITEMS[id].vk|0,p:p});}}catch(e){}}
// обёртка buy в index.html зовёт это перед каждым событием buy: try — забирает место последнего нажатия; итог — то же место и номер
var buyT=0;
window.statBuyX=function(o){if(!o||!o.i)return o;var id=o.i;buyT=Date.now();
  if(o.r==='try'){var p=cur.pl&&Date.now()-cur.t<6e5?cur.pl:'?';cur={pl:'',t:0};tries[id]=(tries[id]|0)+1;last[id]={p:p,n:tries[id]};}
  var x=last[id];if(x){o.p=x.p;o.n=x.n;}return o;};
// чем открыли витрину: id нажатой кнопки (или имя data-поля), если нажали не раньше 3 с назад
function tapName(t){var e=t&&t.closest&&t.closest('button,a,[data-nv],[id]');if(!e)return '';var s=e.id||'',k;
  if(!s&&e.dataset)for(k in e.dataset){s=k==='nv'?e.dataset.nv:k;break;}return String(s||e.tagName||'').slice(0,12);}
window.statSrc=function(){if(Date.now()-buyT<3000)return 're';if(!tap.s||Date.now()-tap.t>=3000)return '-';return /^(vtGo|mCancel|mClose)$/.test(tap.s)?'re':tap.s;}; // re — витрину перерисовали после окна покупки

/* ---------- 2. «Не хватает монет»: показ и выбор ---------- */
var neOn=false;
function neChoice(b){if(!neOn||!b)return;var a=b.id==='neAd'?'ad':b.id==='mCancel'?'fish':b.id==='neBuy'?'buy':b.matches&&b.matches('.pbuy')?'row':'';
  if(a){neOn=false;mod('ne',a);}}

/* ---------- нажатия: место покупки, источник, выбор, кнопки итогов ---------- */
D.addEventListener('click',function(e){try{var t=e.target;if(!t||!t.closest)return;var s=tapName(t);if(s){tap={s:s,t:Date.now()};}
  var b=t.closest('[data-vpid],.pbuy[data-pid],#neBuy,[data-th^="buy:"]');if(b)cur={pl:plOf(b),t:Date.now()};
  var mb=t.closest('#mcard button');if(mb)neChoice(mb);
  var r=t.closest('#rAgain,#rMap,.ui-moreb,#rGoal,#uiCalmNo');if(r){var n=Math.min(99,+S.sessions||0);
    if(r.id==='rAgain')mod('res','again',{k:n});else if(r.id==='rMap')mod('res','map',{k:n});else if(r.id==='uiCalmNo')mod('calm','no');
    else if(r.id==='rGoal'){if(r.hasAttribute('data-trip'))mod('trip','go',{k:n});}else mod('res','more',{k:n});}}catch(x){}},true);

/* ---------- обёртки окон ---------- */
if(typeof modal==='function'){var md=modal;modal=function(){if(neOn){neOn=false;mod('ne','x');}mPl=want||'modal';want='';var r=md.apply(this,arguments);
  setTimeout(function(){try{var mc=$i('mcard');if(mc&&mPl==='modal'){if(mc.querySelector('[data-th]'))mPl='look';else if(mc.querySelector('#stLoupe,#stShop'))mPl='set';else if(mc.querySelector('#mAdCoins')||mc.querySelector('.a3club'))mPl='coins';}show(mc);}catch(e){}},0);return r;};}
if(typeof hideModal==='function'){var hm=hideModal;hideModal=function(){if(neOn){neOn=false;mod('ne','x');}return hm.apply(this,arguments);};}
if(typeof openCoins==='function'){var oc=openCoins;openCoins=function(){want='coins';return oc.apply(this,arguments);};}
if(typeof openSettings==='function'){var os=openSettings;openSettings=function(){want='set';return os.apply(this,arguments);};
  try{var bs=$i('btnSet'),fs=$i('fSet');if(bs)bs.onclick=openSettings;if(fs)fs.onclick=openSettings;}catch(e){}}
if(typeof notEnough==='function'){var ne=notEnough;notEnough=function(p){var need=Math.max(0,Math.round((+p||0)-(+S.coins||0)));want='ne';neOn=false;var r=ne.apply(this,arguments);
  neOn=true;mod('ne','show',{c:need});return r;};}
if(typeof openShop==='function'){var osh=openShop;openShop=function(tab,hl){var r=osh.apply(this,arguments);
  try{if(shopTab==='p'||shopTab==='d')show($i('shList'));}catch(e){}return r;};}

/* ---------- 3. первые минуты ---------- */
function c23(){try{if(typeof G==='undefined'||!G||!G.uiFirst||typeof statTut!=='function')return;if(G.used>=2)statTut(6);if(G.used>=3)statTut(7);}catch(e){}}
setInterval(c23,1000);if(typeof updHud==='function'){var uh=updHud;updHud=function(){var r=uh.apply(this,arguments);c23();return r;};}
if(typeof goalHtml==='function'){var gh=goalHtml,trS=0;goalHtml=function(){var h=gh.apply(this,arguments);try{if(!trS&&typeof h==='string'&&h.indexOf('data-trip')>=0){trS=1;mod('trip','show',{k:Math.min(99,+S.sessions||0)});}}catch(e){}return h;};}
var tourS=0;
function tourChk(){try{if(!tourS&&$i('uhTour')){tourS=1;mod('home','tourshow');}}catch(e){}}
if(typeof openMap==='function'){var om=openMap;openMap=function(){var r=om.apply(this,arguments);setTimeout(tourChk,300);return r;};}

/* ---------- 4. бонусы рыбалки: навыки Науки, прикормка — раз за рыбалку ---------- */
function skStr(){var s='',k=['feel','far','pit','luck'],i,v;for(i=0;i<4;i++){v=S.sciSk&&S.sciSk[k[i]];s+=Math.max(0,Math.min(9,Math.floor(+v||0)));}return s;}
if(typeof finish==='function'){var fin=finish;finish=function(){var g=typeof G!=='undefined'?G:null,was=!!(g&&g.over);var r=fin.apply(this,arguments);
  try{if(g&&!was&&g.over&&!g.tourn&&!g.guest&&!g.demo&&!g.__bon){g.__bon=1;var sk=skStr(),o={};if(/[1-9]/.test(sk))o.sk=sk;
    if(g.prik&&g.prik.f){o.pr=g.prik.f;o.pk=g.prik.k;}if(o.sk||o.pr){o.n=(g.catch||[]).filter(function(c){return c.id&&!c.lost;}).length;ev('bon',o);}}}catch(e){}return r;};}

/* ---------- 5. Север: глава, окно путёвки, лодка, Красная книга ---------- */
function chOpen(ch){for(var j=0;j<PLACES.length;j++)if(PLACES[j].ch===ch&&S.open[j])return true;return false;}
if(typeof buyPlace==='function'){var bp=buyPlace;buyPlace=function(i){var P=PLACES[i],was=!!(S.open&&S.open[i]),boat=!!(P&&P.boat&&!(window.hasBoat&&hasBoat())&&!was),ch=P&&P.ch,chB=ch?chOpen(ch):true;
  var r=bp.apply(this,arguments);
  try{if(boat&&$i('nbBoat'))mod('boat','need',{k:i});
    var ok=$i('bpOk'),no=$i('mCancel');if(ok&&!was){mod('place','ask',{k:i});var f=ok.onclick;ok.onclick=function(){var x=f&&f.apply(this,arguments);try{if(S.open[i]&&ch&&!chB)mod('ch','open',{k:ch,p:i});}catch(e){}return x;};
      if(no){var fn=no.onclick;no.onclick=function(){try{mod('place','no',{k:i});}catch(e){}return fn&&fn.apply(this,arguments);};}}}catch(e){}return r;};}
function isRb(f){try{return !!f&&(f.rar==='rb'||f.rar==='redbook'||typeof rarOf==='function'&&(rarOf(f.id)==='rb'||rarOf(f.id)==='redbook'));}catch(e){return false;}}
if(typeof showCatch==='function'){var sc=showCatch;showCatch=function(){var r=sc.apply(this,arguments);try{var pk=G&&G.pk,f=pk&&pk.f;if(f&&!pk.junk&&isRb(f))mod('rb','catch',{k:f.id,w:Math.round((pk.w||0)*1000)});}catch(e){}return r;};}
if(typeof window.mgcFoto==='function'){var mf=window.mgcFoto;window.mgcFoto=function(p){try{if(p&&(p.rb||p.k==='rb'))mod('rb','foto',{k:p.id||''});}catch(e){}return mf.apply(this,arguments);};}
})();
