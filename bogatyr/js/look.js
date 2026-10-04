/* Богатырь против нечисти — ВИД ИНТЕРФЕЙСА и ТЕМЫ ОФОРМЛЕНИЯ (look1, 04.10). Журнал: hobby-analytics/release-g/bogatyr-look1.md
   Основной вид — «Живая сказка» (css/look.css, у всех). Герои, нечисть, значки и стиль боя темой НЕ меняются — только меню, окна, шрифт и подложки боя.
   НОВАЯ ТЕМА (например, платные «Лубок», «Палех»):
     1) строка в THEMES ниже: {id,ru,en,unlock:{t:'free'} | {t:'pay',pay:'<id товара PAY_ITEMS>'}};
     2) в css/look.css блок переменных html.lk.th-<id>{--parch:…;--wood:…;--cv-font:…} (список переменных — в начале css/look.css, образец — в его конце);
     3) если продаётся — товар в PAY_ITEMS (js/pay.js) и в каталоги площадок. Больше ничего.
   Выбранная тема — S.th ('' = основная; fixSave/mergeProgress в core.js). На маке: ?theme=<id> — примерка без записи. API: LOOK.list/cur/owned/set/apply.
   Здесь же: свои значки вместо эмодзи в меню и окнах ВНЕ боя (эмодзи остаётся скрытым текстом <lk-t> — textContent и проверки прежние; в бою и в окнах посреди боя
   значки не трогаем), цвета и шрифт холста боя из переменных --cv-* (LOOK.cv), запасной вид для слабых телефонов (body.lite). */
(function(){
'use strict';
var THEMES=[
 {id:'skazka',ru:'Живая сказка',en:'Living tale',unlock:{t:'free'}} // i18n:ru — название темы на двух языках (ru/en)
 // {id:'lubok',ru:'Лубок',en:'Lubok',unlock:{t:'pay',pay:'th_lubok'}},
 // {id:'palekh',ru:'Палех',en:'Palekh',unlock:{t:'pay',pay:'th_palekh'}}
];
var H=document.documentElement,cur='skazka';
function get(id){for(var i=0;i<THEMES.length;i++)if(THEMES[i].id===id)return THEMES[i];return null;}
function owned(id){var t=get(id);if(!t)return false;var u=t.unlock||{};if(u.t==='pay'){try{return typeof PAY!=='undefined'&&!!PAY.own(u.pay);}catch(e){return false;}}return true;}
/* ---------- холст боя: шрифт и цвета подложек — из переменных темы ---------- */
var CV={font:'"BgF",system-ui,-apple-system,sans-serif',track:'rgba(58,36,18,.58)',edge:'rgba(255,246,220,.75)',stroke:'rgba(46,28,14,.85)',pill:'rgba(253,240,207,.9)',pillE:'#3b2412',pillT:'#3b2412',pillG:'#a85c00',
  bub:'#ffffff',bubE:'#3b2412',bubT:'#3b2412',ban1:'#b0763c',ban2:'#8a5628',banE:'#ffe9b8',num:'rgba(46,22,10,.95)',vig:.26,dark:.16,sea1:'#58b4e6',sea2:'#3f97d2'};
function readCV(){var cs;try{cs=getComputedStyle(H);}catch(e){return;}for(var k in CV){var v=cs.getPropertyValue('--cv-'+k);if(v&&(v=v.replace(/^\s+|\s+$/g,''))){CV[k]=typeof CV[k]==='number'?(parseFloat(v)||0):v;}}CV.v=(CV.v||0)+1;}
function apply(id){var t=get(id)||THEMES[0];cur=t.id;var c=(' '+H.className+' ').replace(/ th-[\w-]+ /g,' ').replace(/^\s+|\s+$/g,'');if(!/\blk\b/.test(c))c+=' lk';if(t!==THEMES[0])c+=' th-'+t.id;H.className=c;readCV();
  try{if(typeof rDirty!=='undefined')rDirty=true;}catch(e){}}
function set(id){if(!owned(id))return false;apply(id);try{S.th=id===THEMES[0].id?'':id;save();}catch(e){}return true;}
function fromSave(){var id='';try{id=S.th||'';}catch(e){}try{var m=/[?&]theme=([\w-]+)/.exec(location.search);if(m&&typeof LOCAL!=='undefined'&&LOCAL&&get(m[1])){apply(m[1]);return;}}catch(e){}apply(id&&owned(id)?id:THEMES[0].id);}

/* ---------- значки (24×24, линия currentColor); 18 — из макета В, остальные — в том же духе ---------- */
var IC={
 coin:'<circle cx="12" cy="12" r="9" fill="#ffc93a" stroke="#a8650c" stroke-width="1.6"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="#a8650c" stroke-width="1.4"/>',
 swords:'<path d="M4 4l11 11M20 4L9 15M13 17l4 4M11 17l-4 4M14.5 13.5l3 3M9.5 13.5l-3 3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
 star:'<path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z" fill="currentColor" stroke="#a8650c" stroke-width="1.2" stroke-linejoin="round"/>',
 gear:'<path d="M12 8.2a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zM10.5 2h3l.5 2.6 2 .9 2.3-1.4 2.1 2.1-1.4 2.3.9 2 2.6.5v3l-2.6.5-.9 2 1.4 2.3-2.1 2.1-2.3-1.4-2 .9-.5 2.6h-3l-.5-2.6-2-.9-2.3 1.4-2.1-2.1 1.4-2.3-.9-2L1.5 13.5v-3l2.6-.5.9-2-1.4-2.3 2.1-2.1L8 5l2-.9z" fill="currentColor" fill-rule="evenodd"/>',
 lock:'<path d="M6 10.5h12v10H6zM8.5 10.5V8a3.5 3.5 0 017 0v2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="15.5" r="1.7" fill="currentColor"/>',
 film:'<rect x="2.5" y="5" width="19" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M10 9l5.5 3-5.5 3z" fill="currentColor"/>',
 shield:'<path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 6.5v11M7.5 11h9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 scroll:'<path d="M6 4h12a2 2 0 012 2v1H8v11a2 2 0 01-4 0V6a2 2 0 012-2zM8 7v11a2 2 0 002 2h8a2 2 0 002-2v-1H11M11 10.5h6M11 13.5h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>',
 clock:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 cup:'<path d="M7 4h10v5a5 5 0 01-10 0zM7 6H4c0 3 1.5 4.5 3.5 4.5M17 6h3c0 3-1.5 4.5-3.5 4.5M12 14v4M8 20h8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>',
 next:'<path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
 redo:'<path d="M19 12a7 7 0 11-2.5-5.4M19 3.5v4h-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
 cal:'<rect x="3.5" y="5.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 gift:'<path d="M4 11h16v9.5H4zM3 7.5h18V11H3zM12 7.5v13M12 7.5C10.5 4 6.5 3.5 7 6c.3 1.5 3 1.5 5 1.5zM12 7.5C13.5 4 17.5 3.5 17 6c-.3 1.5-3 1.5-5 1.5z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>',
 spark:'<path d="M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8zM18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z" fill="currentColor"/>',
 fire:'<path d="M12 2.5c1 4-3.5 5.5-3.5 10 0 .9.3 1.7.8 2.3C8 13.5 8 12 8.5 11 5.5 13 5 15.5 5.5 17.5 6.300 20 9 21.500 12 21.500s6-2 6.500-5c.6-4-2.500-6-3-9-1 1-1.500 2-1.500 3.500C13 9 14 5.500 12 2.500z" fill="currentColor"/>',
 pin:'<path d="M9 3h6l-1 6 3.500 3.500v1.500H6.500v-1.500L10 9zM12 14v7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>',
 ban:'<circle cx="12" cy="12" r="8.500" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M6 6l12 12" stroke="currentColor" stroke-width="2.4"/>',
 users:'<circle cx="9" cy="8.500" r="3.300" fill="none" stroke="currentColor" stroke-width="2.100"/><path d="M2.500 20c0-3.600 2.900-6 6.500-6s6.500 2.400 6.500 6M15.500 5.500a3.200 3.200 0 010 6.200M17.500 14.300c2.400.7 4 2.800 4 5.700" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linecap="round"/>',
 book:'<path d="M12 6c-2-1.500-5-2-8.500-1.500v14C7 18 10 18.500 12 20c2-1.500 5-2 8.500-1.500v-14C17 4 14 4.500 12 6zM12 6v14" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linejoin="round"/>',
 bulb:'<path d="M9 17.500h6M10 21h4M12 3a6 6 0 00-3.500 10.900c.6.500 1 1.200 1 2v.6h5v-.6c0-.8.4-1.500 1-2A6 6 0 0012 3z" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linecap="round" stroke-linejoin="round"/>',
 moon:'<path d="M20 14.500A8.500 8.500 0 019.500 4 8.500 8.500 0 1020 14.500z" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linejoin="round"/>',
 vib:'<rect x="8" y="3.500" width="8" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="2.100"/><path d="M4.500 9v6M19.500 9v6M2 10.500v3M22 10.500v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
 dice:'<rect x="3.500" y="3.500" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="2.200"/><circle cx="8.500" cy="8.500" r="1.500" fill="currentColor"/><circle cx="15.500" cy="15.500" r="1.500" fill="currentColor"/><circle cx="12" cy="12" r="1.500" fill="currentColor"/><circle cx="15.500" cy="8.500" r="1.500" fill="currentColor"/><circle cx="8.500" cy="15.500" r="1.500" fill="currentColor"/>',
 thumb:'<path d="M3.500 11h3.500v9.500H3.500zM7 11l4-7.500c1.500 0 2.500 1 2.500 2.500V9.500h5a2 2 0 012 2.400l-1.300 6.600a2.500 2.500 0 01-2.400 2H7" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linejoin="round"/>',
 skull:'<path d="M12 3c-4.700 0-8 3.200-8 7.500 0 2.500 1.200 4.300 3 5.500V19h10v-3c1.800-1.200 3-3 3-5.500C20 6.200 16.700 3 12 3zM10 19v-2M14 19v-2" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linejoin="round" stroke-linecap="round"/><circle cx="9" cy="11" r="1.800" fill="currentColor"/><circle cx="15" cy="11" r="1.800" fill="currentColor"/>',
 arm:'<path d="M4 20c0-5 1-9 3-12l3-1 1.500 3-2 1c0 2 1 3.500 2.500 3.500 1-2.500 3-3.500 5-3.500 2.500 0 3.500 2 3.500 4.500S19 20 16 20z" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linejoin="round"/>',
 note:'<path d="M9 18V5.500l10-2V16" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="6.500" cy="18" rx="2.800" ry="2.300" fill="currentColor"/><ellipse cx="16.500" cy="16" rx="2.800" ry="2.300" fill="currentColor"/>',
 bell:'<path d="M6 16.500V11a6 6 0 0112 0v5.500l1.500 2h-15zM10 20.500a2 2 0 004 0" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linejoin="round" stroke-linecap="round"/>',
 snd:'<path d="M3.500 9.500h3.500l5-4v13l-5-4H3.500z" fill="currentColor"/><path d="M15.500 9a4 4 0 010 6M18 6.500a7.500 7.500 0 010 11" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linecap="round"/>',
 snd1:'<path d="M3.500 9.500h3.500l5-4v13l-5-4H3.500z" fill="currentColor"/><path d="M15.500 9a4 4 0 010 6" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linecap="round"/>',
 mute:'<path d="M3.500 9.500h3.500l5-4v13l-5-4H3.500z" fill="currentColor"/><path d="M15.500 9.500l5 5M20.500 9.500l-5 5" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"/>',
 goal:'<circle cx="12" cy="12" r="8.500" fill="none" stroke="currentColor" stroke-width="2.100"/><circle cx="12" cy="12" r="4.500" fill="none" stroke="currentColor" stroke-width="2.100"/><circle cx="12" cy="12" r="1.500" fill="currentColor"/>',
 globe:'<circle cx="12" cy="12" r="8.500" fill="none" stroke="currentColor" stroke-width="2.100"/><path d="M3.500 12h17M12 3.500c3 3 3 14 0 17M12 3.500c-3 3-3 14 0 17" fill="none" stroke="currentColor" stroke-width="1.900"/>',
 phone:'<rect x="6.500" y="2.500" width="11" height="19" rx="2.500" fill="none" stroke="currentColor" stroke-width="2.100"/><path d="M12 7v7M9 11.500l3 3 3-3" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linecap="round" stroke-linejoin="round"/>',
 horn:'<path d="M4 10v4h3l8 4.500V5.500L7 10zM18 9.500a3.500 3.500 0 010 5M7 14l1 5.500h2.500L10 15.500" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linejoin="round" stroke-linecap="round"/>',
 bars:'<path d="M5 20V11M12 20V4M19 20v-6" stroke="currentColor" stroke-width="3.200" stroke-linecap="round"/>',
 share:'<path d="M12 15V3.500M7.500 8L12 3.500 16.500 8M5 13v7h14v-7" fill="none" stroke="currentColor" stroke-width="2.300" stroke-linecap="round" stroke-linejoin="round"/>',
 gem:'<path d="M7 4h10l4 5.500L12 20.500 3 9.500zM3 9.500h18M9.500 9.500L12 20.500l2.500-11M7 4l2.500 5.500M17 4l-2.500 5.500" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linejoin="round"/>',
 ok:'<path d="M4.500 12.500l5 5 10-11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
 party:'<path d="M12 2.500l2.900 6.100 6.600.9-4.800 4.600 1.200 6.600L12 17.500 6.100 20.700l1.200-6.600L2.500 9.500l6.600-.9z" fill="#ffd84a" stroke="#fff" stroke-width="1.300" stroke-linejoin="round"/>'
};
function I(k){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+IC[k]+'</svg>';}
var MAP={'🎬':'film','🏆':'cup','⚔':'swords','🎁':'gift','✨':'spark','🔒':'lock','🔥':'fire','📌':'pin','🚫':'ban','👥':'users','📖':'book','💡':'bulb','⚙':'gear','🌙':'moon','📳':'vib','🎲':'dice','👍':'thumb',
 '☠':'skull','💪':'arm','🎉':'party','📅':'cal','🎵':'note','🎻':'note','🔔':'bell','🔊':'snd','🔈':'snd1','🔇':'mute','↻':'redo','🛡':'shield','💰':'coin','📋':'scroll','⏳':'clock','🎯':'goal','➜':'next','🌐':'globe',
 '⭐':'star','📲':'phone','📣':'horn','📊':'bars','📤':'share','💎':'gem','✓':'ok'};
var keys=Object.keys(MAP).sort(function(a,b){return b.length-a.length;});
var RE=new RegExp('('+keys.map(function(x){return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|')+')\uFE0F?','g');
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,'LK-I':1,'LK-T':1,OPTION:1,TITLE:1,CANVAS:1};
/* в бою значки не меняем: ни подсказки/пауза поверх поля, ни окна посреди похода (уровень, сундук, Жар-птица, привал, «Богатырь пал») */
function inBattle(){try{return document.body.classList.contains('run')&&typeof G!=='undefined'&&!!G&&!G.over;}catch(e){return false;}}
function skipEl(n){for(var p=n.parentNode;p&&p.nodeType===1;p=p.parentNode){if(SKIP[p.nodeName]||p.namespaceURI==='http://www.w3.org/2000/svg')return true;var id=p.id;if(id==='tip'||id==='tipX'||id==='pauseBtn'||id==='ad'||id==='adWait'||id==='loading')return true;}return false;}
function swapText(t){if(!t.parentNode)return;var s=t.nodeValue;if(!s)return;RE.lastIndex=0;if(!RE.test(s))return;RE.lastIndex=0;if(skipEl(t)||inBattle())return;
  var par=t.parentNode,fr=document.createDocumentFragment(),last=0,mm;
  while((mm=RE.exec(s))){var k=MAP[mm[1]];if(!k)continue;var pre=s.slice(last,mm.index),el=document.createElement('lk-i');el.className='i-'+k;el.innerHTML=I(k)+'<lk-t>'+mm[0]+'</lk-t>';last=mm.index+mm[0].length;
    if(pre)fr.appendChild(document.createTextNode(pre));fr.appendChild(el);}
  if(!last)return;if(last<s.length)fr.appendChild(document.createTextNode(s.slice(last)));par.replaceChild(fr,t);}
function walk(root){if(!root)return;if(root.nodeType===3){swapText(root);return;}if(root.nodeType!==1||SKIP[root.nodeName])return;
  var w=document.createTreeWalker(root,4,null,false),A=[],x;while((x=w.nextNode()))A.push(x);for(var i=0;i<A.length;i++)swapText(A[i]);}
var busy=false;
function onMut(list){if(busy)return;busy=true;try{for(var i=0;i<list.length;i++){var r=list[i];if(r.type==='characterData')swapText(r.target);else for(var j=0;j<r.addedNodes.length;j++)walk(r.addedNodes[j]);}}catch(e){}finally{busy=false;}}

/* ---------- слабые телефоны: эффекты «мало» (вручную или авто) или ?lite=1 → body.lite: без теней и градиентов в меню и окнах ---------- */
function liteTick(){var on=false;try{on=/[?&]lite=1/.test(location.search)||(typeof qLow==='function'&&qLow());}catch(e){}var b=document.body;if(b&&b.classList.contains('lite')!==on)b.classList.toggle('lite',on);}

function start(){fromSave();walk(document.body);try{new MutationObserver(onMut).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}
  liteTick();setInterval(liteTick,2000);
  // шрифт для холста: попросить заранее и перерисовать кадр, когда придёт (на холсте подмены шрифта «на лету» нет)
  try{if(document.fonts&&document.fonts.load){var re=function(){try{rDirty=true;if(typeof LOOK.onFont==='function')LOOK.onFont();}catch(e){}};document.fonts.load('800 16px "BgF"','\u0423\u0440 1 Lv').then(re,function(){});document.fonts.load('500 16px "BgF"','\u0423\u0440 1 Lv').then(re,function(){});}}catch(e){}}
window.LOOK={THEMES:THEMES,list:function(){return THEMES.slice();},cur:function(){return cur;},owned:owned,set:set,apply:apply,sync:fromSave,cv:CV,I:I,walk:walk,lite:liteTick};
if(!/\blk\b/.test(H.className))H.className+=(H.className?' ':'')+'lk';
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
