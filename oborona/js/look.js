/* Тридевятая оборона — ВИД ИНТЕРФЕЙСА и ТЕМЫ ОФОРМЛЕНИЯ (look1, 04.10). Журнал: hobby-analytics/release-g/oborona-look1.md
   Перенесено из «Богатыря» (bogatyr-look, js/look.js, коммит b51d478): реестр тем, значки, цвета холста, запасной вид — чтобы две игры сопровождались одинаково.
   Основной вид — «Живая сказка» (css/look.css, у всех). Заставы, нечисть, поле, значки и стиль боя темой НЕ меняются — только меню, окна, шрифт и плашки боя.
   НОВАЯ ТЕМА (например, платные «Палех», «Резной терем»):
     1) строка в THEMES ниже: {id,ru,en,unlock:{t:'free'} | {t:'pay',pay:'<id товара PAY_ITEMS>'}};
     2) в css/look.css блок переменных html.lk.th-<id>{--parch:…;--wood:…;--cv-font:…} (список переменных — в начале css/look.css, образец — в его конце);
     3) если продаётся — товар в PAY_ITEMS (js/pay.js) и в каталоги площадок. Больше ничего: переключатель в ⚙ появляется сам, когда доступных тем больше одной.
   Выбранная тема — S.th ('' = основная; freshSave/fixSave/mergeProgress в core.js). На маке: ?theme=<id> — примерка без записи. API: LOOK.list/cur/owned/set/apply.
   Здесь же: свои значки вместо эмодзи в меню и окнах ВНЕ боя (эмодзи остаётся скрытым текстом <lk-t> — textContent и проверки прежние; в бою и в окнах посреди боя
   значки не трогаем), цвета и шрифт холста боя из переменных --cv-* (LOOK.cv), запасной вид для слабых телефонов (body.lite). Код — ES5, без .finally/?./??. */
(function(){
'use strict';
var THEMES=[
 {id:'skazka',ru:'Живая сказка',en:'Living tale',unlock:{t:'free'}} // i18n:ru — название темы на двух языках (ru/en)
 // {id:'palekh',ru:'Палех',en:'Palekh',unlock:{t:'pay',pay:'th_palekh'}},
 // {id:'terem',ru:'Резной терем',en:'Carved terem',unlock:{t:'free'}}
];
var H=document.documentElement,cur='skazka';
function get(id){for(var i=0;i<THEMES.length;i++)if(THEMES[i].id===id)return THEMES[i];return null;}
function owned(id){var t=get(id);if(!t)return false;var u=t.unlock||{};if(u.t==='pay'){try{return typeof PAY!=='undefined'&&!!PAY.own(u.pay);}catch(e){return false;}}return true;}
/* ---------- холст боя: шрифт и цвета плашек — из переменных темы ---------- */
var CV={font:'"BgF",system-ui,-apple-system,sans-serif',track:'rgba(58,36,18,.58)',edge:'rgba(255,246,220,.75)',stroke:'rgba(46,28,14,.85)',pill:'rgba(253,240,207,.94)',pillE:'#3b2412',pillT:'#3b2412',pillG:'#a85c00',
  bub:'#ffffff',bubE:'#3b2412',bubT:'#3b2412',ban1:'#a86c36',ban2:'#8a5628',banE:'#ffe9b8',num:'rgba(46,22,10,.95)',card:'#fdf0cf',cardE:'#9a6332',cardE2:'#6e431f',cardT:'#3b2412',cardH:'#c0321a',cardTip:'#2259ad',sel:'#ffc93a',selE:'#3b2412',side:0};
function readCV(){var cs;try{cs=getComputedStyle(H);}catch(e){return;}for(var k in CV){if(k==='v')continue;var v=cs.getPropertyValue('--cv-'+k);if(v&&(v=v.replace(/^\s+|\s+$/g,''))){CV[k]=typeof CV[k]==='number'?(parseFloat(v)||0):v;}}CV.v=(CV.v||0)+1;}
function redraw(){try{if(typeof G!=='undefined'&&G)G.redraw=1;}catch(e){}}
function apply(id){var t=get(id)||THEMES[0];cur=t.id;var c=(' '+H.className+' ').replace(/ th-[\w-]+ /g,' ').replace(/^\s+|\s+$/g,'');if(!/\blk\b/.test(c))c+=' lk';if(t!==THEMES[0])c+=' th-'+t.id;H.className=c;readCV();redraw();}
function set(id){if(!owned(id))return false;apply(id);try{S.th=id===THEMES[0].id?'':id;save();}catch(e){}return true;}
function fromSave(){var id='';try{id=S.th||'';}catch(e){}try{var m=/[?&]theme=([\w-]+)/.exec(location.search);if(m&&typeof LOCAL!=='undefined'&&LOCAL&&get(m[1])){apply(m[1]);return;}}catch(e){}apply(id&&owned(id)?id:THEMES[0].id);}

/* ---------- значки (24×24, линия currentColor). Общие с «Богатырём» — те же рисунки; свои для «Обороны»: ff, crown, home, medal, pal, heart, wing ---------- */
var IC={
 coin:'<circle cx="12" cy="12" r="9" fill="#ffc93a" stroke="#a8650c" stroke-width="1.6"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="#a8650c" stroke-width="1.4"/>',
 swords:'<path d="M4 4l11 11M20 4L9 15M13 17l4 4M11 17l-4 4M14.5 13.5l3 3M9.5 13.5l-3 3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
 star:'<path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z" fill="currentColor" stroke="#a8650c" stroke-width="1.2" stroke-linejoin="round"/>',
 gear:'<path d="M12 8.2a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zM10.5 2h3l.5 2.6 2 .9 2.3-1.4 2.1 2.1-1.4 2.3.9 2 2.6.5v3l-2.6.5-.9 2 1.4 2.3-2.1 2.1-2.3-1.4-2 .9-.5 2.6h-3l-.5-2.6-2-.9-2.3 1.4-2.1-2.1 1.4-2.3-.9-2L1.5 13.5v-3l2.6-.5.9-2-1.4-2.3 2.1-2.1L8 5l2-.9z" fill="currentColor" fill-rule="evenodd"/>',
 lock:'<path d="M6 10.5h12v10H6zM8.5 10.5V8a3.5 3.5 0 017 0v2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="15.5" r="1.7" fill="currentColor"/>',
 film:'<rect x="2.5" y="5" width="19" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M10 9l5.5 3-5.5 3z" fill="currentColor"/>',
 shield:'<path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 6.5v11M7.5 11h9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 cup:'<path d="M7 4h10v5a5 5 0 01-10 0zM7 6H4c0 3 1.5 4.5 3.5 4.5M17 6h3c0 3-1.5 4.5-3.5 4.5M12 14v4M8 20h8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>',
 redo:'<path d="M19 12a7 7 0 11-2.5-5.4M19 3.5v4h-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
 cal:'<rect x="3.5" y="5.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 gift:'<path d="M4 11h16v9.5H4zM3 7.5h18V11H3zM12 7.5v13M12 7.5C10.5 4 6.5 3.5 7 6c.3 1.5 3 1.5 5 1.5zM12 7.5C13.5 4 17.5 3.5 17 6c-.3 1.5-3 1.5-5 1.5z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>',
 fire:'<path d="M12 2.5c1 4-3.5 5.5-3.5 10 0 .9.3 1.7.8 2.3C8 13.5 8 12 8.5 11 5.5 13 5 15.5 5.5 17.5 6.3 20 9 21.5 12 21.5s6-2 6.5-5c.6-4-2.5-6-3-9-1 1-1.5 2-1.5 3.5C13 9 14 5.5 12 2.5z" fill="currentColor"/>',
 users:'<circle cx="9" cy="8.5" r="3.3" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M15.5 5.5a3.2 3.2 0 010 6.2M17.5 14.3c2.4.7 4 2.8 4 5.700" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
 book:'<path d="M12 6c-2-1.5-5-2-8.5-1.5v14C7 18 10 18.5 12 20c2-1.5 5-2 8.5-1.5v-14C17 4 14 4.5 12 6zM12 6v14" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>',
 dice:'<rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"/>',
 skull:'<path d="M12 3c-4.7 0-8 3.2-8 7.5 0 2.5 1.2 4.3 3 5.5V19h10v-3c1.8-1.2 3-3 3-5.5C20 6.2 16.7 3 12 3zM10 19v-2M14 19v-2" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/><circle cx="9" cy="11" r="1.8" fill="currentColor"/><circle cx="15" cy="11" r="1.8" fill="currentColor"/>',
 arm:'<path d="M4 20c0-5 1-9 3-12l3-1 1.5 3-2 1c0 2 1 3.5 2.5 3.5 1-2.5 3-3.5 5-3.5 2.5 0 3.5 2 3.5 4.5S19 20 16 20z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>',
 note:'<path d="M9 18V5.5l10-2V16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="6.5" cy="18" rx="2.8" ry="2.3" fill="currentColor"/><ellipse cx="16.5" cy="16" rx="2.8" ry="2.3" fill="currentColor"/>',
 bell:'<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15zM10 20.5a2 2 0 004 0" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/>',
 goal:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.1"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2.1"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
 phone:'<rect x="6.5" y="2.5" width="11" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M12 7v7M9 11.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
 horn:'<path d="M4 10v4h3l8 4.5V5.5L7 10zM18 9.5a3.5 3.5 0 010 5M7 14l1 5.5h2.5L10 15.5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/>',
 bars:'<path d="M5 20V11M12 20V4M19 20v-6" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
 share:'<path d="M12 15V3.5M7.5 8L12 3.5 16.5 8M5 13v7h14v-7" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',
 ok:'<path d="M4.5 12.500l5 5 10-11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
 ban:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M6 6l12 12" stroke="currentColor" stroke-width="2.4"/>',
 /* свои для «Обороны» */
 ff:'<path d="M3.500 5.500l8 6.500-8 6.500zM12.500 5.500l8 6.500-8 6.500z" fill="currentColor" stroke="currentColor" stroke-width="1.400" stroke-linejoin="round"/>',
 crown:'<path d="M3.500 18.500h17M4 16l-1-9 5 4 4-6.500L16 11l5-4-1 9z" fill="#ffc93a" stroke="#a8650c" stroke-width="1.700" stroke-linejoin="round" stroke-linecap="round"/>',
 home:'<path d="M3.500 11.500L12 4l8.500 7.500M5.500 10v10h13V10M10 20v-5.500h4V20" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linejoin="round" stroke-linecap="round"/>',
 medal:'<circle cx="12" cy="14.500" r="6" fill="none" stroke="currentColor" stroke-width="2.200"/><path d="M8.500 9.500L6 3h4l2 4.500L14 3h4l-2.500 6.500M12 12.200l.8 1.600 1.700.2-1.200 1.200.3 1.700-1.600-.8-1.600.8.3-1.700-1.200-1.200 1.700-.2z" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linejoin="round"/>',
 pal:'<path d="M12 3.500a8.500 8.500 0 100 17c1.400 0 2-1 2-2 0-1.500-1-1.700-1-3 0-1 .8-1.500 2-1.500h2a3.500 3.500 0 003.500-3.500c0-4-3.800-7-8.500-7z" fill="none" stroke="currentColor" stroke-width="2.100" stroke-linejoin="round"/><circle cx="7.500" cy="12" r="1.400" fill="currentColor"/><circle cx="9.500" cy="8" r="1.400" fill="currentColor"/><circle cx="14" cy="7.500" r="1.400" fill="currentColor"/>',
 heart:'<path d="M12 20.500C5 15.500 3 12 3 8.800 3 6 5 4 7.500 4c1.800 0 3.400 1 4.500 2.700C13.100 5 14.700 4 16.500 4 19 4 21 6 21 8.800c0 3.200-2 6.700-9 11.700z" fill="#e8433a" stroke="#8a1c14" stroke-width="1.500" stroke-linejoin="round"/>',
 wing:'<path d="M3 15c3-7 9-10.500 18-10.500-1 3-2.500 4.500-5 5.500 1.500 0 2.500.3 3.500 1-1.500 2-3.500 3-6 3 1 .5 1.500 1 2 2-4 1.500-8.500.5-12.500-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
};
function I(k){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+IC[k]+'</svg>';}
var MAP={'🎬':'film','🏆':'cup','⚔':'swords','🎁':'gift','🔒':'lock','🔥':'fire','👥':'users','📖':'book','⚙':'gear','🎲':'dice','☠':'skull','💪':'arm','📅':'cal','🎻':'note','🔔':'bell','↻':'redo','🛡':'shield','💰':'coin',
 '🎯':'goal','⭐':'star','★':'star','📲':'phone','📣':'horn','📊':'bars','📤':'share','✓':'ok','✅':'ok','🚫':'ban','⏩':'ff','👑':'crown','🏠':'home','🏅':'medal','🎨':'pal','❤':'heart','✈':'wing'};
var keys=Object.keys(MAP).sort(function(a,b){return b.length-a.length;});
var RE=new RegExp('('+keys.map(function(x){return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|')+')\uFE0F?','g');
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,'LK-I':1,'LK-T':1,OPTION:1,TITLE:1,CANVAS:1};
/* в бою значки не меняем: ни панель/кольцо/справка поверх поля, ни окна посреди боя (пауза, «время ускорения»). Итоги боя (G.over) — уже вне боя */
function inBattle(){try{return document.body.classList.contains('run')&&typeof G!=='undefined'&&!!G&&!G.over;}catch(e){return false;}}
function skipEl(n){for(var p=n.parentNode;p&&p.nodeType===1;p=p.parentNode){if(SKIP[p.nodeName]||p.namespaceURI==='http://www.w3.org/2000/svg')return true;var id=p.id;if(id==='hud'||id==='hudB'||id==='ring'||id==='info'||id==='voice'||id==='ad'||id==='adWait'||id==='loading')return true;}return false;}
function swapText(t){if(!t.parentNode)return;var s=t.nodeValue;if(!s)return;RE.lastIndex=0;if(!RE.test(s))return;RE.lastIndex=0;if(skipEl(t)||inBattle())return;
  var par=t.parentNode,fr=document.createDocumentFragment(),last=0,mm;
  while((mm=RE.exec(s))){var k=MAP[mm[1]];if(!k)continue;var pre=s.slice(last,mm.index),el=document.createElement('lk-i');el.className='i-'+k;el.innerHTML=I(k)+'<lk-t>'+mm[0]+'</lk-t>';last=mm.index+mm[0].length;
    if(pre)fr.appendChild(document.createTextNode(pre));fr.appendChild(el);}
  if(!last)return;if(last<s.length)fr.appendChild(document.createTextNode(s.slice(last)));
  // в кнопке (flex) значок и текст держим одним куском — иначе строка рвётся на «(+10», значок и «)»
  if(par.nodeName==='BUTTON'){var w=document.createElement('span');w.className='lk-w';w.appendChild(fr);par.replaceChild(w,t);}else par.replaceChild(fr,t);}
function walk(root){if(!root)return;if(root.nodeType===3){swapText(root);return;}if(root.nodeType!==1||SKIP[root.nodeName])return;
  var w=document.createTreeWalker(root,4,null,false),A=[],x;while((x=w.nextNode()))A.push(x);for(var i=0;i<A.length;i++)swapText(A[i]);}
var busy=false;
function onMut(list){if(busy)return;busy=true;try{for(var i=0;i<list.length;i++){var r=list[i];if(r.type==='characterData')swapText(r.target);else for(var j=0;j<r.addedNodes.length;j++)walk(r.addedNodes[j]);}}catch(e){}busy=false;}

/* ---------- слабые телефоны и старые WebView → body.lite: без теней и градиентов в меню и окнах.
   Включается: ?lite=1; старый движок (нет inset — Chrome < 87, Safari < 14.1); мало памяти или ядер. ?lite=0 — выключить ---------- */
function isLite(){try{var q=location.search;if(/[?&]lite=1/.test(q))return true;if(/[?&]lite=0/.test(q))return false;
  if(window.CSS&&CSS.supports&&!CSS.supports('inset','0'))return true;if(!window.CSS||!CSS.supports)return true;
  if(navigator.deviceMemory&&navigator.deviceMemory<=1)return true;if(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)return true;}catch(e){}return false;}
function liteSet(){var b=document.body;if(!b)return;var on=isLite();if(on!==/\blite\b/.test(b.className))b.className=on?(b.className+' lite'):b.className.replace(/\s*\blite\b/g,'');}

function start(){fromSave();liteSet();walk(document.body);try{new MutationObserver(onMut).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}
  // шрифт для холста: попросить заранее и перерисовать кадр, когда придёт (на холсте подмены шрифта «на лету» нет)
  try{if(document.fonts&&document.fonts.load){var re=function(){CV.v=(CV.v||0)+1;redraw();try{if(typeof LOOK.onFont==='function')LOOK.onFont();}catch(e){}};document.fonts.load('800 16px "BgF"','\u0423\u0440 1 Lv').then(re,function(){});document.fonts.load('500 16px "BgF"','\u0423\u0440 1 Lv').then(re,function(){});}}catch(e){}}
window.LOOK={THEMES:THEMES,list:function(){return THEMES.slice();},cur:function(){return cur;},owned:owned,set:set,apply:apply,sync:fromSave,cv:CV,I:I,walk:walk,lite:liteSet,on:true};
if(!/\blk\b/.test(H.className))H.className+=(H.className?' ':'')+'lk';
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
