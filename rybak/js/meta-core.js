/* Рыбалка с Петровичем — МЕТА (поток META, буст 08.10.2026): общее для лиг, «Науки Петровича», Карты России, примет и кота Васьки.
   Журнал: ~/Projects/hobby-analytics/release-i/rybak-boost/logs/META.md
   Грузится ПОСЛЕ основного скрипта index.html (берёт S, save, PLACES, FISH, LEG, slotAdd/mapSlots/resultSlots/dailySlots…), модули js/meta-*.js — после него.
   Поля сохранения META (чинит metaFix, сливает metaMerge — обёртки fixSave/mergeSave):
     лиги:   S.lgL (0 бронза, 1 серебро, 2 золото), S.lgW (последняя подсчитанная неделя), S.lgH {неделя: место·10+лига}, S.lgG (золотых кубков лиги)
     Наука:  S.sciSk {навык: ступень}, S.sciR (последнее показанное звание)
     карта:  S.mapM {регион: 1 — медаль забрана}
     кот:    S.catT {день: угощений}, S.catN (угощений всего), S.catK {вещь: 1}, S.catC (надето: костюм), S.catD (день последней находки), S.catF {находка: сколько}
   Рыбы и места — ТОЛЬКО из реестра NORTH (PLACES/FISH/LEG, поля id, reg, fish, leg; rarOf). Здесь — тонкая прослойка metaPlaces(), чтобы модули не лезли в форму реестра. */
(function(){
'use strict';
var W0=window;
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function num(x){return typeof x==='number'&&isFinite(x)?x:0;}

/* ---------- реестр (NORTH) ---------- */
// места: {i, id, n, en, reg, regE, fish:[id обычных рыб], leg:id легенды, tsar:id Царь-рыбы}
function metaPlaces(){var r=[];for(var i=0;i<PLACES.length;i++){var p=PLACES[i];
  r.push({i:i,id:p.id||('p'+i),n:p.n,en:p.en||p.n,reg:p.reg||'',regE:p.regE||p.reg||'',fish:(p.fish||[]).slice(),leg:p.leg||'',tsar:p.tsar||''});}return r;}
function metaFish(id){return (typeof FISH!=='undefined'&&FISH[id])||(typeof LEG!=='undefined'&&LEG[id])||null;}
function metaRar(id){try{if(typeof rarOf==='function')return rarOf(id);}catch(e){}var f=metaFish(id);return f&&f.rar||(f&&f.leg?'legend':'common');}
function metaRarC(k){try{if(typeof RAR!=='undefined'&&RAR[k])return RAR[k].c;}catch(e){}return ({common:'#9aa3a8',uncommon:'#3fa34d',rare:'#2f7de1',trophy:'#9a4fd0',legend:'#e0a81e',redbook:'#d23a32',tsar:'#f2b705'})[k]||'#9aa3a8';}

/* ---------- сохранение ---------- */
var FIX=[],MERGE=[];
function metaFix(){for(var i=0;i<FIX.length;i++)try{FIX[i]();}catch(e){}}
function metaMerge(loc,d){for(var i=0;i<MERGE.length;i++)try{MERGE[i](loc,d);}catch(e){}}
// снимок своих полей до общего слияния (общий mergeSave мог забрать поле целиком из облака)
function snap(){var o={};for(var k in S)if(/^(lg|sci|map|cat)[A-Z]/.test(k))o[k]=JSON.parse(JSON.stringify(S[k]));return o;}
(function(){var ms=mergeSave;mergeSave=function(d,ref){var loc=snap();ms(d,ref);try{metaMerge(loc,isO(d)?d:{});}catch(e){}};
  var fs=fixSave;fixSave=function(){fs();metaFix();};})();
// общие помощники слияния: числа — максимум, объекты чисел — максимум по ключам
function mMax(loc,d,k){S[k]=Math.max(num(loc[k]),num(d[k]),num(S[k]));}
function mObj(loc,d,k){var r={},a=isO(loc[k])?loc[k]:{},b=isO(d[k])?d[k]:{};
  for(var x in a)if(typeof a[x]==='number')r[x]=a[x];for(var y in b)if(typeof b[y]==='number')r[y]=Math.max(r[y]||0,b[y]);S[k]=r;}
function fObj(k){if(!isO(S[k]))S[k]={};for(var x in S[k])if(typeof S[k][x]!=='number'||!isFinite(S[k][x]))delete S[k][x];}
function fNum(k){if(typeof S[k]!=='number'||!isFinite(S[k])||S[k]<0)S[k]=0;}

/* ---------- значки META (стиль IG look.js: 24×24, линия + заливка деталей .d) ---------- */
var MI_G={
 league:'<path class="d" d="M6 4h12v4.5a6 6 0 01-12 0z"/><path d="M6 6H3.5a3 3 0 003 4M18 6h2.5a3 3 0 01-3 4M12 14.5v3M8 21h8M9.5 17.5h5V21h-5z"/><path d="M12 6.2l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z"/>',
 sci:'<path class="d" d="M12 3.5l8.5 4.2L12 12 3.5 7.7z"/><path d="M6.5 9.5v4.8c0 1.6 2.5 3.2 5.5 3.2s5.5-1.6 5.5-3.2V9.5M20.5 7.7v6"/><circle cx="20.5" cy="15.2" r="1.2"/>',
 feel:'<path class="d" d="M12 3v3"/><path class="d" d="M12 6c2.3 0 3.1 2.8 3.1 5.2S13.6 16 12 18c-1.6-2-3.1-4.4-3.1-6.8S9.7 6 12 6z"/><path d="M4 9.5c-1.3 1.6-1.3 4.4 0 6M20 9.5c1.3 1.6 1.3 4.4 0 6M6.5 11c-.6.8-.6 2.2 0 3M17.5 11c.6.8.6 2.2 0 3"/>',
 far:'<path d="M3.5 20.5L14 6"/><path class="d" d="M14 6c2-2.5 5.5-2.8 7-1.5"/><path d="M21 4.5c.5 4-1 9-5 13" stroke-dasharray="1.5 2"/><circle class="d" cx="16" cy="18" r="1.8"/>',
 pit:'<path d="M2.5 7c2 1.3 3.8 1.3 5.6 0s3.8-1.3 5.6 0 3.8 1.3 5.6 0 1.6-.6 2.2-.8"/><path class="d" d="M3 11.5c3 0 4 7 9 7s6-7 9-7v9H3z"/><path d="M10.5 14.5c.9-.7 2.1-.7 3 0"/>',
 luck:'<path class="d" d="M12 12c-2.5-4.5-7.5-3.2-6.6.2.6 2.4 4 2.3 6.6-.2zM12 12c4.5-2.5 3.2-7.5-.2-6.6-2.4.6-2.3 4 .2 6.6zM12 12c2.5 4.5 7.5 3.2 6.6-.2-.6-2.4-4-2.3-6.6.2zM12 12c-4.5 2.5-3.2 7.5.2 6.6 2.4-.6 2.3-4-.2-6.6z"/><path d="M12 12c1.5 3 3 6 6.5 8.5"/>',
 russia:'<path class="d" d="M2.5 13l2-3.5 3 .5 2-2.5 3 1 2.5-2 3 .5 2.5-1.5 1.5 2.5-1 3 1 2.5-2.5 1.5-2.5-1-2 2-3-1-2.5 1.5-3-1.5-2.5 1z"/><circle cx="7.5" cy="12" r="1"/><circle cx="15" cy="11" r="1"/>',
 omen:'<path class="d" d="M5 18.5c3.5-1 5-4 5-8.5 3 2.5 3.5 6 3 8.5 2-1.2 3-3.5 3-6 2 2.2 3 4.5 2.5 6.5"/><path d="M3 21h18M8 6.5l1-2.5M13.5 5.5l.5-2.5M18 8l1.5-2"/>',
 cat:'<path class="d" d="M5 20c-1.2-5 .5-9.5 3.5-11.5L8 3.5l3.5 3.2c1.1-.3 2.3-.3 3.4 0L18 3.5l-.3 5C20.5 10.6 21.2 15 19.5 20z"/><circle cx="10" cy="12.5" r=".9"/><circle cx="15" cy="12.5" r=".9"/><path d="M12.5 15v1.3M10.5 17.2c1.2.8 2.8.8 4 0"/>',
 paw:'<ellipse class="d" cx="12" cy="15.5" rx="4.3" ry="3.6"/><circle class="d" cx="6.3" cy="10.2" r="1.9"/><circle class="d" cx="10" cy="6.8" r="1.9"/><circle class="d" cx="14.5" cy="6.8" r="1.9"/><circle class="d" cx="18" cy="10.2" r="1.9"/>',
 up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
 down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
 friends:'<circle class="d" cx="8.5" cy="8.5" r="3.3"/><circle class="d" cx="16.5" cy="9.5" r="2.7"/><path d="M2.5 19.5a6 6 0 0112 0M14.5 14.2a5 5 0 017 5.3"/>'
};
function MI(k,cls){return '<svg class="ic mi '+(cls||'')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(MI_G[k]||'')+'</svg>';}
try{if(W0.LOOK&&LOOK.IG)for(var k0 in MI_G)if(!LOOK.IG['m_'+k0])LOOK.IG['m_'+k0]=MI_G[k0];}catch(e){}

/* ---------- окна: обычный modal() игры (Enter, ✕, «Закрыть» — как везде) + класс .mtw (шире на ПК, сцена сверху) ---------- */
(function(){var m0=modal;modal=function(h){var mc=document.getElementById('mcard');if(mc)mc.classList.remove('mtw','mtwide');return m0(h);};})();
function metaWin(html,wide){modal(html);var mc=document.getElementById('mcard');mc.classList.add('mtw');if(wide)mc.classList.add('mtwide');try{SND.tap();}catch(e){}return mc;}
function head(icon,title,sub){return '<div class="mth">'+MI(icon,'mtti')+'<div><h2>'+title+'</h2>'+(sub?'<small>'+sub+'</small>':'')+'</div></div>';}
// холст под размер элемента (чёткий на ретине)
function canv(el,h){var c=document.createElement('canvas'),dpr=Math.min(2,W0.devicePixelRatio||1);try{if(typeof LOW!=='undefined'&&LOW)dpr=1;}catch(e){}
  var w=Math.max(200,el.clientWidth||360);c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.style.width='100%';c.style.height=h+'px';el.appendChild(c);
  var g=c.getContext('2d');g.scale(dpr,dpr);return {c:c,g:g,W:w,H:h};}
// пейзаж места игры (paintBg) как фон сцены: тот же рисунок, что у плиток мест
function sceneBg(g,W,H,pi,tod){try{var c=placeThumb(pi,{tod:tod||'evening',wx:'sun'});g.drawImage(c,0,0,c.width,c.height*.62,0,0,W,H);return true;}catch(e){
  var gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#f4b67a');gr.addColorStop(.55,'#7fa8c0');gr.addColorStop(1,'#2f5d74');g.fillStyle=gr;g.fillRect(0,0,W,H);return false;}}
function tripC(){try{return TRIP_C[topPlace()]||30;}catch(e){return 30;}}
function r5(n){return Math.max(5,Math.round(n/5)*5);}
function dn(){try{return dayNum();}catch(e){return Math.floor(Date.now()/864e5);}}
function stat(m,a,o){try{STAT.ev('mod',Object.assign({m:m,a:a},o||{}));}catch(e){}}
// перерисовать главный экран, если он сейчас на виду (модули META грузятся после первого openMap)
function mapRefresh(){try{if(G||!document.getElementById('scr-map').classList.contains('on'))return;if(!modalOn){openMap();return;}var el=document.getElementById('mapSlotsB');if(el&&typeof slotsFill==='function')slotsFill(el,mapSlots,{},SLOT_MAX.map);}catch(e){}}

/* ---------- ряд плиток META на главном экране (одно гнездо mapSlots вместо трёх плашек — главный экран не перегружаем) ---------- */
var TILES=[];
function tile(o){TILES=TILES.filter(function(x){return x.id!==o.id;});TILES.push(o);TILES.sort(function(a,b){return (b.pri||0)-(a.pri||0);});}
function tilesOn(){return TILES.filter(function(o){try{return !o.when||o.when();}catch(e){return false;}});}
slotAdd(mapSlots,{id:'meta-row',pri:34,when:function(){return tilesOn().length>0;},
  html:function(){return '<div class="mtrow">'+tilesOn().map(function(o){var hot=false;try{hot=o.hot&&o.hot();}catch(e){}
    return '<button class="mttile'+(hot?' hot':'')+'" data-t="'+o.id+'"><span class="mttic">'+o.ic()+'</span><b>'+o.t()+'</b><small>'+o.sub()+'</small>'+(hot?'<i class="mtdot"></i>':'')+'</button>';}).join('')+'</div>';},
  bind:function(el){el.querySelectorAll('[data-t]').forEach(function(b){var o=TILES.filter(function(x){return x.id===b.dataset.t;})[0];if(o)b.onclick=function(){try{SND.tap();}catch(e){}o.go();};if(o&&o.draw)try{o.draw(b.querySelector('.mttic'));}catch(e){}});}});
W0.META={places:metaPlaces,fish:metaFish,rar:metaRar,rarC:metaRarC,fix:function(f){FIX.push(f);try{f();}catch(e){}},merge:function(f){MERGE.push(f);},
  mMax:mMax,mObj:mObj,fObj:fObj,fNum:fNum,isO:isO,num:num,MI:MI,MI_G:MI_G,win:metaWin,head:head,canv:canv,sceneBg:sceneBg,
  tripC:tripC,tile:tile,r5:r5,dn:dn,stat:stat,mapRefresh:mapRefresh};
})();
