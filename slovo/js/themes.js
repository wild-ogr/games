/* Баба Зина — ТЕМЫ ОФОРМЛЕНИЯ (themes1, 04.10; схема та же, что в Рыбалке js/themes.js и Кирпичиках js/look.js). Журнал: hobby-analytics/release-g/slovo-themes.md
   Основной вид — «Тетрадь в клетку» (стили в index.html, бесплатно, у всех, НЕ меняется). Тема = запись в THEMES + блок переменных html.th-<id>{…} в css/themes.css.
   НОВАЯ ТЕМА: (1) строка в THEMES ниже (+ рисунок фона в SCENE, если нужен); (2) в css/themes.css блок html.th-<id>{--bgc:…;--pn:…;--acc:…} (список переменных — в начале файла);
   (3) если продаётся — строка в PAY_ITEMS и PAY_TEST (js/pay.js, id = th_<id>), потом в hobby-pay/catalog.json и консоль Яндекса. Больше ничего.
   Способы открыть (unlock.t): free; pay {pay:id товара}; ads {n: досмотренных роликов за награду за всё время, S.adTot}.
   Хранение: S.th — выбранная (из более нового сохранения), S.thU — открытые навсегда {id:1} (облако — объединение), S.adTot — досмотренных роликов (облако — максимум).
   Купленные темы — S.buy.th_<id> (модуль PAY: облако и «Восстановить покупки» возвращают их на другом устройстве).
   Внутри тем эмодзи заменяются своими значками (ICONS/CHART) — эмодзи остаётся скрытым текстом, тексты игры не меняются. В основном виде эмодзи как были.
   API: THEME.list/owned/cur/set/get/progress/buy/open/apply/check/bought/trial. ?theme=<id> на маке и в домашней сети — тема без покупки и без записи. ?nb=1 — «Веранда» без размытия. */
(function(){
'use strict';
var THEMES=[
 {id:'classic',ru:'Тетрадь в клетку',cls:'',unlock:{t:'free'},ds:'Основной вид игры: тетрадь в клетку с красным полем'},
 {id:'kitchen',ru:'Кухня бабы Зины',cls:'th-kitchen',unlock:{t:'pay',pay:'th_kitchen'},ds:'Обои, окно с геранью и стол со скатертью. Кроссворд — тетрадный листок на столе'},
 {id:'veranda',ru:'Веранда. Летний вечер',cls:'th-veranda',dark:1,unlock:{t:'pay',pay:'th_veranda'},ds:'Закат над садом, гирлянда лампочек, тёмное стекло и тёплый свет'},
 {id:'gzhel',ru:'Гжель и лён',cls:'th-gzhel',unlock:{t:'ads',n:15},ds:'Светлый лён и синяя роспись. Самый спокойный и крупный вид'}
];
window.THEMES=THEMES;
var DOC=document.documentElement,TRY_MAX=2;
var LAN=/^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(location.hostname)&&!/[?&]vk_app_id=/.test(location.search);
var FORCE=(function(){var m=/[?&]theme=([a-z0-9_]+)/.exec(location.search);return LAN&&m?m[1]:'';})();
var TRIAL=null,trDone=false,trN=0;
function get(id){for(var i=0;i<THEMES.length;i++)if(THEMES[i].id===id)return THEMES[i];return null;}
function thU(){if(!S.thU||typeof S.thU!=='object'||Array.isArray(S.thU))S.thU={};return S.thU;}
function prog(T){var u=T.unlock;if(u.t!=='ads')return null;var h=Math.min(u.n,S.adTot||0);return {have:h,need:u.n,txt:h+' из '+u.n+' роликов'};}
function earned(T){var u=T.unlock;
  if(u.t==='free')return true;if(thU()[T.id])return true;
  if(u.t==='pay')return !!(typeof PAY!=='undefined'&&PAY.own&&PAY.own(u.pay));
  if(u.t==='ads')return (S.adTot||0)>=u.n;
  return false;}
function owned(id){var T=get(id);if(!T)return false;if(FORCE===id)return true;return earned(T);}
function how(T){var u=T.unlock;
  if(u.t==='free')return 'бесплатно';
  if(u.t==='pay')return 'покупка, навсегда';
  if(u.t==='ads')return 'за '+u.n+' роликов';
  return '';}
function cur(){if(TRIAL&&get(TRIAL))return TRIAL;var id=FORCE||S.th||'classic';return owned(id)?id:'classic';}

/* ---------- свои значки (только в темах): сетка 24×24, линия 2; .t — подложка цветом темы ---------- */
var ICONS={
back:'<path d="M15 5l-7 7 7 7"/>',
play:'<path class="t" d="M8 5l11 7-11 7z"/>',
check:'<path d="M5 12.500l4.500 4.500L19 7.500"/>',
gear:'<circle class="t" cx="12" cy="12" r="6.600"/><circle cx="12" cy="12" r="2.600"/><path d="M12 2.800v2.600M12 18.600v2.600M2.800 12h2.600M18.600 12h2.600M5.500 5.500l1.800 1.800M16.700 16.700l1.800 1.800M5.500 18.500l1.800-1.800M16.700 7.300l1.800-1.800"/>',
sound:'<path class="t" d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z"/><path d="M15.500 9a4.200 4.200 0 010 6M18 6.500a8 8 0 010 11"/>',
mute:'<path class="t" d="M4 9.500h3.500L12 5.500v13l-4.500-4H4z"/><path d="M16 9.500l5 5M21 9.500l-5 5"/>',
music:'<path d="M9 17.500V6l10-2v11.500"/><circle class="t" cx="6.500" cy="17.500" r="2.500"/><circle class="t" cx="16.500" cy="15.500" r="2.500"/>',
info:'<circle class="t" cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.200v.600"/>',
map:'<path class="t" d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
cal:'<rect class="t" x="3.500" y="5" width="17" height="15.500" rx="3"/><path d="M3.500 10h17M8 3v4M16 3v4M9 15l2 2 4-4"/>',
book:'<path class="t" d="M3.500 5.500c3-1.300 6-1.300 8.500.500 2.500-1.800 5.500-1.800 8.500-.500v13c-3-1.300-6-1.300-8.500.500-2.500-1.800-5.500-1.800-8.500-.500z"/><path d="M12 6v13"/>',
dress:'<path d="M12 8.500V7.200a2.200 2.200 0 10-2.200-2.200"/><path class="t" d="M12 8.500l9 6.500c.800.600.400 2-.700 2H3.700c-1.100 0-1.500-1.400-.700-2z"/>',
cup:'<path class="t" d="M7 4h10v5a5 5 0 01-10 0z"/><path d="M7 6H4v1.500A3.500 3.500 0 007.500 11M17 6h3v1.500a3.500 3.500 0 01-3.500 3.500M12 14v4M8 20h8"/>',
gift:'<rect class="t" x="4" y="10" width="16" height="10" rx="2"/><path d="M3 7h18v3H3zM12 7v13M12 7c-1-3-5-4-5-1.500S10 7 12 7zM12 7c1-3 5-4 5-1.500S14 7 12 7z"/>',
cap:'<path class="t" d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.500V16c2 2 10 2 12 0v-4.500M22 9v5"/>',
jar:'<path class="t" d="M6 9.500h12v8.500a3 3 0 01-3 3H9a3 3 0 01-3-3z"/><path d="M7.500 4h9v3h-9zM6 9.500c0-1.200 1.500-2.500 1.500-2.500h9s1.500 1.300 1.500 2.500M9.500 14h5"/>',
shuffle:'<path d="M3 7h3.500c5 0 6 10 11 10H21M3 17h3.500c1.600 0 2.800-1 3.800-2.300M21 7h-3.500c-1.600 0-2.800 1-3.800 2.300M18.500 4.500L21 7l-2.500 2.500M18.500 14.500L21 17l-2.500 2.500"/>',
word:'<rect class="t" x="2.500" y="8" width="19" height="8" rx="2"/><path d="M9 8v8M15 8v8M5 12h1.500M11.200 12h1.600M17.500 12H19"/>',
bulb:'<path class="t" d="M12 3a6.500 6.500 0 00-4 11.600V17h8v-2.400A6.500 6.500 0 0012 3z"/><path d="M9.500 20.500h5M10 17h4"/>',
tv:'<rect class="t" x="3" y="6" width="18" height="12.500" rx="2.500"/><path d="M10 9.500V15l5-2.750zM8 3l4 3 4-3M8 21h8"/>',
medal:'<circle class="t" cx="12" cy="14.500" r="5.500"/><path d="M8 3l2.500 6M16 3l-2.500 6M12 12.500v4"/>',
card:'<rect class="t" x="3" y="5.500" width="18" height="13" rx="2"/><path d="M3.500 8l8.500 6 8.500-6"/>',
lock:'<rect class="t" x="5" y="10.500" width="14" height="10" rx="2.500"/><path d="M8 10.500V8a4 4 0 018 0v2.500M12 14.500v2"/>',
fire:'<path class="t" d="M12 3c1 3.500 5 5.500 5 10a5 5 0 01-10 0c0-2 1-3 2-4 .500 1.500 1 2 2 2 0-3 0-5 1-8z"/>',
star:'<path class="t" d="M12 3.500l2.600 5.300 5.900.900-4.200 4.100 1 5.800L12 16.800l-5.300 2.800 1-5.800L3.500 9.700l5.900-.900z"/>',
vib:'<rect class="t" x="8" y="3.500" width="8" height="17" rx="2"/><path d="M4 9v6M20 9v6M1.500 10.500v3M22.500 10.500v3"/>',
zoom:'<circle class="t" cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500L21 21"/>',
cart:'<path d="M3 4h2.500l2.200 10.500h10l2-7.500H7"/><circle class="t" cx="9.500" cy="18.500" r="1.800"/><circle class="t" cx="16.500" cy="18.500" r="1.800"/>',
noads:'<circle class="t" cx="12" cy="12" r="9"/><path d="M5.700 5.700l12.600 12.600"/>',
palette:'<path class="t" d="M12 3a9 9 0 100 18c1.700 0 2.200-1.300 1.500-2.400-.800-1.300.100-2.600 1.500-2.600H17a4 4 0 004-4c0-5-4-9-9-9z"/><circle cx="7.500" cy="11.500" r="1"/><circle cx="10.500" cy="7.500" r="1"/><circle cx="15" cy="8" r="1"/>',
plate:'<circle class="t" cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>',
tea:'<path class="t" d="M4 9h12v5a5 5 0 01-5 5H9a5 5 0 01-5-5z"/><path d="M16 10.500h1.500a2.500 2.500 0 010 5H16M8 3v3M12 3v3"/>',
bars:'<path d="M3.500 20.500h17"/><rect class="t" x="5" y="11" width="3.600" height="9.500"/><rect class="t" x="10.200" y="6" width="3.600" height="14.500"/><rect class="t" x="15.400" y="13.500" width="3.600" height="7"/>',
people:'<circle class="t" cx="9" cy="8.500" r="3.500"/><path class="t" d="M2.500 19.500c.500-3.500 3-5.500 6.500-5.500s6 2 6.500 5.500z"/><path d="M16 5.200a3.500 3.500 0 010 6.600M18 14.500c2 .800 3.200 2.500 3.500 5"/>',
dice:'<rect class="t" x="4" y="4" width="16" height="16" rx="3.500"/><path d="M9 9v.100M15 15v.100M15 9v.100M9 15v.100M12 12v.100"/>',
bolt:'<path class="t" d="M13 2.500L5 13.500h5.500l-1 8 8.500-11.500h-5.500z"/>'
};
/* эмодзи игры → значок */
var EMO={'🔊':'sound','🔇':'mute','🎵':'music','ℹ':'info','▶':'play','←':'back','🗺':'map','📅':'cal','📖':'book','📒':'book','👗':'dress','🏆':'cup','🎁':'gift','🎓':'cap',
 '⚙':'gear','🍯':'jar','🔀':'shuffle','📜':'word','💡':'bulb','🎬':'tv','📺':'tv','🏅':'medal','📤':'card','🔒':'lock','🔥':'fire','⭐':'star','🎉':'star','📳':'vib','🔍':'zoom',
 '✅':'check','🛒':'cart','🚫':'noads','🎨':'palette','🍽':'plate','☕':'tea','📊':'bars','👥':'people','🎲':'dice','⚡':'bolt'};
/* рисунки глав (48×48) — вместо эмодзи глав; порядок = CHAPTERS в js/text.js */
var CHART={
'🏢':'<rect x="11" y="7" width="26" height="35" rx="2" fill="#aebfdc"/><g fill="#fff3c2"><rect x="15" y="11" width="6" height="6" rx="1"/><rect x="27" y="11" width="6" height="6" rx="1"/><rect x="15" y="20" width="6" height="6" rx="1"/><rect x="27" y="20" width="6" height="6" rx="1"/></g><rect x="20" y="31" width="8" height="11" rx="1" fill="#7b4f35"/><path d="M17 31h14l-2-3H19z" fill="#5d79a8"/><rect x="7" y="42" width="34" height="2.500" rx="1" fill="#8d9ab0"/>',
'🌳':'<rect x="29" y="18" width="4" height="22" rx="1" fill="#8a5a3c"/><circle cx="31" cy="15" r="11" fill="#6fae5a"/><circle cx="24" cy="19" r="6" fill="#84c06d"/><rect x="5" y="31" width="26" height="3.500" rx="1.500" fill="#b9773f"/><rect x="5" y="25" width="26" height="3.500" rx="1.500" fill="#cf8c4f"/><path d="M8 25v17M28 25v17" stroke="#7b4f35" stroke-width="2.500" stroke-linecap="round"/><rect x="3" y="42" width="42" height="2.500" rx="1" fill="#7fa56b"/>',
'🥕':'<path d="M5 13h38v6a3.200 3.200 0 01-6.330 0 3.200 3.200 0 01-6.330 0 3.200 3.200 0 01-6.340 0 3.200 3.200 0 01-6.330 0 3.200 3.200 0 01-6.330 0A3.200 3.200 0 015 19z" fill="#d9553a"/><path d="M11.330 13h6.330v6a3.200 3.200 0 01-6.330 0zM24 13h6.330v6A3.200 3.200 0 0124 19z M36.670 13H43v6a3.200 3.200 0 01-6.330 0z" fill="#fff6e6"/><path d="M8 20v22M40 20v22" stroke="#8a5a3c" stroke-width="2.500"/><rect x="6" y="31" width="36" height="11" rx="2" fill="#c98a4b"/><circle cx="14" cy="29" r="3.500" fill="#e8492f"/><circle cx="21" cy="29" r="3.500" fill="#f2a12a"/><path d="M28 31l3-8 3 8z" fill="#f08a2c"/><circle cx="37" cy="29.500" r="3" fill="#7fb85a"/>',
'🏥':'<rect x="8" y="14" width="32" height="28" rx="2" fill="#f4f7fb"/><rect x="8" y="14" width="32" height="5" fill="#9fd0d9"/><path d="M21.500 22h5v4.500H31v5h-4.500V36h-5v-4.500H17v-5h4.500z" fill="#e2493b"/><rect x="5" y="42" width="38" height="2.500" rx="1" fill="#9fb3bd"/><path d="M6 14l18-8 18 8z" fill="#6fb3c2"/>',
'🌻':'<path d="M4 24l14-12 14 12z" fill="#c8502b"/><rect x="7" y="24" width="22" height="18" fill="#f3d9a4"/><rect x="14" y="29" width="8" height="8" rx="1" fill="#9fd3ea"/><path d="M18 29v8M14 33h8" stroke="#fff" stroke-width="1.200"/><path d="M38 42V22" stroke="#4f8f3a" stroke-width="2.500" stroke-linecap="round"/><path d="M38 34c-4-1-5-4-5-4M38 30c3-.500 4.500-3 4.500-3" stroke="#4f8f3a" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="38" cy="18" r="7" fill="#f7c02e"/><circle cx="38" cy="18" r="3.300" fill="#7b4f35"/><rect x="3" y="42" width="42" height="2.500" rx="1" fill="#7fa56b"/>',
'🚆':'<rect x="9" y="8" width="30" height="30" rx="7" fill="#4f9d69"/><rect x="13" y="13" width="22" height="11" rx="3" fill="#dff3fb"/><path d="M24 13v11" stroke="#4f9d69" stroke-width="2"/><rect x="9" y="27" width="30" height="4" fill="#e8492f"/><circle cx="16" cy="34" r="2.200" fill="#fff3c2"/><circle cx="32" cy="34" r="2.200" fill="#fff3c2"/><path d="M14 38l-4 6M34 38l4 6M6 44h36" stroke="#6b5a4e" stroke-width="2.500" stroke-linecap="round"/>',
'🧖':'<path d="M4 22l20-13 20 13z" fill="#8a5a3c"/><g fill="#d79a5b"><rect x="8" y="22" width="32" height="5" rx="2.500"/><rect x="8" y="27.500" width="32" height="5" rx="2.500"/><rect x="8" y="33" width="32" height="5" rx="2.500"/><rect x="8" y="38.500" width="32" height="5" rx="2.500"/></g><rect x="20" y="29" width="8" height="14.500" rx="1" fill="#7b4f35"/><path d="M33 9c-2-2 2-3 0-5M38 12c-2-2 2-3 0-5" stroke="#b9c4cf" stroke-width="2" fill="none" stroke-linecap="round"/>',
'💰':'<rect x="6" y="14" width="36" height="28" rx="3" fill="#7fb38a"/><rect x="10" y="18" width="28" height="20" rx="2" fill="#e9f5ea"/><circle cx="24" cy="28" r="7" fill="#f5c542"/><path d="M22 32v-8h3a2.300 2.300 0 010 4.600h-4.200M20.800 30.500H25" stroke="#8a5a00" stroke-width="1.600" fill="none" stroke-linecap="round"/><path d="M6 14l18-8 18 8z" fill="#4f8f5f"/><rect x="4" y="42" width="40" height="2.500" rx="1" fill="#8d9ab0"/>',
'🎂':'<rect x="7" y="38" width="34" height="4" rx="2" fill="#c9a2b6"/><rect x="10" y="24" width="28" height="14" rx="3" fill="#f6c9d8"/><path d="M10 28c3 3 5 3 7 0s4-3 7 0 4 3 7 0 4-3 7 0v-2a3 3 0 00-3-3H13a3 3 0 00-3 3z" fill="#fff"/><g stroke="#e2749a" stroke-width="2.200" stroke-linecap="round"><path d="M17 22v-6M24 22v-7M31 22v-6"/></g><g fill="#f7b32e"><path d="M17 15c-1.500-2 0-3 0-5 1.500 2 1.500 3 0 5zM24 14c-1.500-2 0-3 0-5 1.500 2 1.500 3 0 5zM31 15c-1.500-2 0-3 0-5 1.500 2 1.500 3 0 5z"/></g><circle cx="16" cy="33" r="1.600" fill="#e2493b"/><circle cx="24" cy="33" r="1.600" fill="#e2493b"/><circle cx="32" cy="33" r="1.600" fill="#e2493b"/>',
'🌊':'<circle cx="35" cy="13" r="6" fill="#f7c02e"/><path d="M10 30a13 13 0 0126 0z" fill="#e8674a"/><path d="M16.500 30a6.500 13 0 0113 0z" fill="#fff6e6"/><path d="M23 30v10" stroke="#8a5a3c" stroke-width="2.200" stroke-linecap="round"/><path d="M3 38c3.500-3 7-3 10.500 0s7 3 10.500 0 7-3 10.500 0 7 3 10.500 0v7H3z" fill="#69b7dd"/><path d="M3 42c3.500-2.500 7-2.500 10.500 0s7 2.500 10.500 0 7-2.500 10.500 0 7 2.500 10.500 0" stroke="#fff" stroke-width="1.600" fill="none" stroke-linecap="round" opacity=".8"/>',
'📚':'<rect x="8" y="33" width="30" height="8" rx="1.500" fill="#4f7ac0"/><rect x="11" y="35.500" width="20" height="3" rx="1" fill="#e9f0fb"/><rect x="11" y="25" width="28" height="8" rx="1.500" fill="#d9553a"/><rect x="14" y="27.500" width="18" height="3" rx="1" fill="#fdeee9"/><rect x="7" y="17" width="29" height="8" rx="1.500" fill="#5aa46a"/><rect x="10" y="19.500" width="19" height="3" rx="1" fill="#eaf6ec"/><path d="M27 6l10 4-10 4-10-4z" fill="#3b4763"/><path d="M21 12v3.500c3 2 9 2 12 0V12M37 10v6" stroke="#3b4763" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="4" y="41" width="40" height="2.500" rx="1" fill="#8d9ab0"/>',
'✉':'<rect x="5" y="12" width="38" height="26" rx="3" fill="#fff6e3" stroke="#d9a24b" stroke-width="2"/><path d="M6 14l18 13 18-13" stroke="#d9a24b" stroke-width="2.200" fill="none" stroke-linejoin="round"/><rect x="31" y="16" width="8" height="9" rx="1" fill="#6fa4dd"/><path d="M9 33h10M9 29h7" stroke="#c9b48a" stroke-width="1.800" stroke-linecap="round"/><circle cx="14" cy="40" r="2.500" fill="#d9553a"/>',
'🔧':'<path d="M33 6a9 9 0 00-8.500 12L8 34.500a4 4 0 005.500 5.500L30 23.500A9 9 0 0042 12l-5.500 5.500-5-1-1-5L36 6.300A9 9 0 0033 6z" fill="#9aa7bd"/><circle cx="11" cy="37" r="1.800" fill="#fff"/><path d="M6 44h36" stroke="#8d9ab0" stroke-width="2.500" stroke-linecap="round"/><path d="M34 30l6 6-3 3-6-6z" fill="#e0913a"/>',
'🎣':'<path d="M8 42L38 6" stroke="#8a5a3c" stroke-width="2.600" stroke-linecap="round"/><path d="M38 6c2 8 0 18-4 22" stroke="#7d8aa3" stroke-width="1.400" fill="none"/><circle cx="34" cy="29" r="3.200" fill="#e2493b"/><path d="M30.800 29h6.400" stroke="#fff" stroke-width="1.400"/><path d="M4 36c3.500-3 7-3 10.500 0s7 3 10.500 0 7-3 10.500 0 7 3 9.500 0v9H4z" fill="#69b7dd"/><path d="M14 41c4-4 9-4 12 0-3 4-8 4-12 0zM26 41l4-3v6z" fill="#f5a53a"/><circle cx="17.500" cy="40.300" r=".9" fill="#3b2a20"/>',
'🍄':'<path d="M6 24C6 13 14 6 24 6s18 7 18 18c0 2-36 2-36 0z" fill="#d9553a"/><circle cx="15" cy="16" r="3" fill="#fff"/><circle cx="26" cy="12" r="2.600" fill="#fff"/><circle cx="34" cy="19" r="3" fill="#fff"/><circle cx="23" cy="20" r="2" fill="#fff"/><path d="M19 25h10c0 5 2 11 3 15a2 2 0 01-2 2.500H18A2 2 0 0116 40c1-4 3-10 3-15z" fill="#f6e9d3"/><path d="M4 43c2-3 4-3 6 0M36 43c2-4 5-4 7 0" stroke="#5e9f4a" stroke-width="2.400" fill="none" stroke-linecap="round"/>',
'💐':'<path d="M24 26l-7 17h14z" fill="#f3d9a4"/><path d="M19 37l10 0" stroke="#d9553a" stroke-width="2.400" stroke-linecap="round"/><g stroke="#5e9f4a" stroke-width="2" stroke-linecap="round"><path d="M24 30l-8-12M24 30V14M24 30l8-12"/></g><g fill="#f08aa6"><circle cx="15" cy="15" r="5.500"/><circle cx="33" cy="15" r="5.500"/></g><circle cx="24" cy="11" r="6" fill="#f7c02e"/><g fill="#fff"><circle cx="15" cy="15" r="2"/><circle cx="33" cy="15" r="2"/></g><circle cx="24" cy="11" r="2.300" fill="#c8502b"/>',
'🚢':'<path d="M6 28h36l-5 11H11z" fill="#e2493b"/><rect x="13" y="19" width="22" height="9" rx="1.500" fill="#fff"/><g fill="#69b7dd"><circle cx="18" cy="23.500" r="1.800"/><circle cx="24" cy="23.500" r="1.800"/><circle cx="30" cy="23.500" r="1.800"/></g><rect x="19" y="10" width="5" height="9" fill="#3b4763"/><rect x="26" y="12" width="5" height="7" fill="#3b4763"/><path d="M21 7c-2-2 2-3 0-5" stroke="#b9c4cf" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M3 39c3.500-3 7-3 10.500 0s7 3 10.500 0 7-3 10.500 0 7 3 10.500 0v6H3z" fill="#69b7dd"/>',
'🏛':'<path d="M24 3l2 5 5 .500-4 3.300 1.300 5L24 14l-4.300 2.800L21 11.800l-4-3.300 5-.500z" fill="#e2493b"/><path d="M18 22l6-8 6 8z" fill="#4f9d69"/><rect x="17" y="22" width="14" height="20" fill="#c8502b"/><rect x="21.500" y="26" width="5" height="6" rx="2.500" fill="#fff3c2"/><path d="M17 22h14M15 42V30h3v-3h3v3M33 42V30h-3v-3h-3v3" stroke="#a03e20" stroke-width="1.600" fill="none"/><rect x="8" y="34" width="9" height="8" fill="#d9774d"/><rect x="31" y="34" width="9" height="8" fill="#d9774d"/><rect x="5" y="42" width="38" height="2.500" rx="1" fill="#8d9ab0"/>',
'🎄':'<path d="M24 5l8 11h-4l8 10h-5l8 10H9l8-10h-5l8-10h-4z" fill="#3f9a5c"/><rect x="21" y="36" width="6" height="7" fill="#8a5a3c"/><path d="M24 2l1.300 2.800 3 .400-2.200 2.100.600 3L24 8.800l-2.700 1.500.600-3-2.200-2.100 3-.400z" fill="#f7c02e"/><g><circle cx="20" cy="18" r="2" fill="#e2493b"/><circle cx="28" cy="24" r="2" fill="#f7c02e"/><circle cx="18" cy="30" r="2" fill="#6fa4dd"/><circle cx="30" cy="32" r="2" fill="#e2493b"/><circle cx="24" cy="28" r="1.600" fill="#fff"/></g>',
'🎓':'<path d="M3 19l21-10 21 10-21 10z" fill="#3b4763"/><path d="M12 24v9c5 5 19 5 24 0v-9l-12 6z" fill="#4f5d80"/><path d="M41 20v12" stroke="#f7c02e" stroke-width="2.200" stroke-linecap="round"/><circle cx="41" cy="34" r="2.600" fill="#f7c02e"/><rect x="8" y="41" width="32" height="2.500" rx="1" fill="#8d9ab0"/>'
};
var RX=(function(){var k=Object.keys(EMO).concat(Object.keys(CHART)),u={},a=[];k.forEach(function(e){if(!u[e]){u[e]=1;a.push(e);}});
  a.sort(function(x,y){return y.length-x.length;});return new RegExp('('+a.join('|')+')\\uFE0F?\\uFE0E?','g');})();
var CH_CTX='.em,#lvTitle,#gSub,#mGoalW,#mGoal,.thp';
function mk(e,par){var k0=e.replace(/[︎️]/g,''),ch=CHART[k0]&&(!EMO[k0]||(par&&par.closest&&par.closest(CH_CTX))),el=document.createElement('i');
  el.className='ti'+(ch?' tch':' ti-'+EMO[k0]);el.setAttribute('data-e',e);
  el.innerHTML=(ch?'<svg viewBox="0 0 48 48" aria-hidden="true">'+CHART[k0]+'</svg>':'<svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS[EMO[k0]]+'</svg>')+'<span class="ti-e">'+e+'</span>';return el;}
function swapNode(tn){var t=tn.nodeValue;if(!t||t.length>4000)return;RX.lastIndex=0;if(!RX.test(t))return;
  var p=tn.parentNode;if(!p||p.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(p.tagName)||(p.closest&&p.closest('.ti,.catfly,.soc')))return;
  var f=document.createDocumentFragment(),last=0,m;RX.lastIndex=0;
  while((m=RX.exec(t))){if(m.index>last)f.appendChild(document.createTextNode(t.slice(last,m.index)));f.appendChild(mk(m[0],p));last=m.index+m[0].length;}
  if(last<t.length)f.appendChild(document.createTextNode(t.slice(last)));p.replaceChild(f,tn);}
function walk(root){if(!root)return;if(root.nodeType===3){swapNode(root);return;}if(root.nodeType!==1)return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false),a=[],n;while((n=w.nextNode()))a.push(n);for(var i=0;i<a.length;i++)swapNode(a[i]);}
function unwalk(){var q=document.querySelectorAll('.ti');for(var i=0;i<q.length;i++){var el=q[i],p=el.parentNode;if(!p)continue;p.replaceChild(document.createTextNode(el.getAttribute('data-e')||''),el);p.normalize();}}
var ON=false,MO=null;
function watch(on){ON=on;
  if(on){if(!MO&&window.MutationObserver){MO=new MutationObserver(function(ms){if(!ON)return;for(var i=0;i<ms.length;i++){var m=ms[i];
        if(m.type==='characterData')swapNode(m.target);else for(var j=0;j<m.addedNodes.length;j++)walk(m.addedNodes[j]);}});
      MO.observe(document.body,{childList:true,subtree:true,characterData:true});}
    walk(document.body);}
  else unwalk();}

/* ---------- фон-место (рисунок кодом, без файлов) ---------- */
function gzOrn(p){var fl=function(x,y,r,rot){var s='';for(var i=0;i<6;i++)s+='<ellipse cx="0" cy="'+(-r*.62)+'" rx="'+(r*.3)+'" ry="'+(r*.55)+'" transform="rotate('+(i*60)+')" fill="url(#'+p+'a)"/>';
    return '<g transform="translate('+x+' '+y+') rotate('+(rot||0)+')">'+s+'<circle r="'+(r*.2)+'" fill="#1f4fbf"/><circle r="'+(r*.08)+'" fill="#fff"/></g>';},
  lf=function(x,y,l,rot){return '<path transform="translate('+x+' '+y+') rotate('+rot+')" d="M0 0c'+(l*.35)+' '+(-l*.32)+' '+(l*.75)+' '+(-l*.3)+' '+l+' 0-'+(l*.3)+' '+(l*.24)+'-'+(l*.7)+' '+(l*.22)+'-'+l+' 0z" fill="url(#'+p+'b)"/>';};
  return '<svg viewBox="0 0 210 210" aria-hidden="true"><defs><radialGradient id="'+p+'a" cx=".5" cy="1" r="1"><stop offset="0" stop-color="#dfe8fb"/><stop offset=".55" stop-color="#5f86e2"/><stop offset="1" stop-color="#1f4fbf"/></radialGradient><linearGradient id="'+p+'b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f4fbf"/><stop offset="1" stop-color="#a9c0f3"/></linearGradient></defs>'+
  '<path d="M20 60c40 10 70 40 84 70s34 46 70 52" fill="none" stroke="#1f4fbf" stroke-width="2.500" stroke-linecap="round"/><path d="M104 130c-14 6-30 4-40-6M130 164c2-14 12-24 26-28" fill="none" stroke="#1f4fbf" stroke-width="2" stroke-linecap="round"/>'+
  lf(58,82,34,-150)+lf(70,90,30,60)+lf(118,150,34,-120)+lf(150,172,30,20)+lf(96,116,26,-30)+fl(120,86,40,10)+fl(62,138,22,30)+fl(168,146,20,0)+
  '<g fill="#1f4fbf"><circle cx="36" cy="104" r="3"/><circle cx="28" cy="118" r="2.200"/><circle cx="150" cy="38" r="3"/><circle cx="164" cy="48" r="2.200"/><circle cx="92" cy="176" r="2.600"/></g></svg>';}
var SCENE={
kitchenWin:function(){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 240"><defs><linearGradient id="thsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3f7"/><stop offset="1" stop-color="#eef8fb"/></linearGradient></defs>'+
  '<rect x="26" y="6" width="248" height="204" rx="6" fill="#fffdf6" stroke="#d8c39a" stroke-width="2"/><rect x="38" y="18" width="224" height="180" fill="url(#thsky)"/>'+
  '<circle cx="86" cy="186" r="42" fill="#9fcf8a"/><circle cx="150" cy="198" r="50" fill="#86c173"/><circle cx="226" cy="184" r="46" fill="#a9d694"/><circle cx="214" cy="58" r="17" fill="#ffe9a8"/>'+
  '<path d="M150 18v180M38 96h224" stroke="#fffdf6" stroke-width="9"/><rect x="38" y="18" width="224" height="180" fill="none" stroke="#e8d9b8" stroke-width="2"/>'+
  '<path d="M30 10h124c0 66-62 92-98 170l-26 6z" fill="#fff" stroke="#ead9b6" stroke-width="1.500"/><path d="M270 10H146c0 66 62 92 98 170l26 6z" fill="#fff" stroke="#ead9b6" stroke-width="1.500"/>'+
  '<g fill="#e8866c"><circle cx="60" cy="60" r="3"/><circle cx="88" cy="40" r="3"/><circle cx="70" cy="110" r="3"/><circle cx="110" cy="64" r="3"/><circle cx="46" cy="130" r="3"/><circle cx="240" cy="60" r="3"/><circle cx="212" cy="40" r="3"/><circle cx="230" cy="110" r="3"/><circle cx="190" cy="64" r="3"/><circle cx="254" cy="130" r="3"/></g>'+
  '<rect x="18" y="4" width="264" height="12" rx="6" fill="#b9773f"/><rect x="14" y="206" width="272" height="14" rx="4" fill="#fffdf6" stroke="#d8c39a" stroke-width="2"/>'+
  '<path d="M222 206l4-24h30l4 24z" fill="#c8623a"/><rect x="222" y="178" width="38" height="7" rx="3" fill="#d9774d"/><g fill="#5e9f4a"><circle cx="232" cy="170" r="10"/><circle cx="250" cy="168" r="11"/><circle cx="241" cy="158" r="10"/></g><g fill="#e2493b"><circle cx="232" cy="154" r="5.500"/><circle cx="249" cy="150" r="6"/><circle cx="242" cy="143" r="5"/></g></svg>';},
kitchen:function(){return '<div class="sc-table"></div><div class="sc-val"></div>';},
veranda:function(){var f='';for(var i=0;i<30;i++)f+='<path d="M'+(i*28+4)+' 232v-46l8-9 8 9v46z" fill="#241a3d"/>';
  return '<svg class="sc-garden" viewBox="0 0 800 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'+
  '<path d="M0 150c80-40 150-30 220-6s150 10 230-22 210-30 350 18v120H0z" fill="#6b4a7d" opacity=".55"/>'+
  '<g fill="#3d2f5f"><circle cx="70" cy="140" r="62"/><circle cx="150" cy="170" r="48"/><circle cx="690" cy="130" r="70"/><circle cx="610" cy="168" r="50"/><circle cx="760" cy="176" r="46"/><rect x="60" y="150" width="14" height="110"/><rect x="684" y="150" width="14" height="110"/></g>'+
  '<g><path d="M330 150l70-46 70 46z" fill="#2c2148"/><rect x="342" y="150" width="116" height="80" fill="#34274f"/><rect x="372" y="170" width="26" height="30" rx="2" fill="#ffd98a"/><path d="M385 170v30M372 185h26" stroke="#34274f" stroke-width="2.500"/><rect x="430" y="96" width="12" height="26" fill="#2c2148"/></g>'+
  '<path d="M0 196h800" stroke="#241a3d" stroke-width="6"/>'+f+'<rect x="0" y="228" width="800" height="32" fill="#1c1532"/>'+
  '<g fill="#ffe9a8"><circle cx="230" cy="120" r="2.200"/><circle cx="560" cy="150" r="2"/><circle cx="270" cy="170" r="1.800"/><circle cx="520" cy="110" r="2.200"/><circle cx="180" cy="200" r="1.800"/></g></svg>'+
  '<div class="sc-moon"></div><div class="sc-garl"></div><div class="sc-beam"></div>';},
gzhel:function(){return '<div class="sc-orn tr">'+gzOrn('thg')+'</div><div class="sc-orn bl">'+gzOrn('thh')+'</div><div class="sc-stitch"></div>';}
};
/* «Веранда» без размытия: старый WebView без backdrop-filter, слабый телефон, «меньше прозрачности» в системе или ?nb=1 */
function noBlur(){try{if(/[?&]nb=1/.test(location.search))return true;
    var ok=window.CSS&&CSS.supports&&(CSS.supports('backdrop-filter','blur(2px)')||CSS.supports('-webkit-backdrop-filter','blur(2px)'));if(!ok)return true;
    if(navigator.deviceMemory&&navigator.deviceMemory<=2)return true;if(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2)return true;
    if(window.matchMedia&&matchMedia('(prefers-reduced-transparency:reduce)').matches)return true;}catch(e){}return false;}
function scr(){var on=document.querySelector('.screen.on');DOC.setAttribute('data-scr',on?on.id:'menu');}
var applied=null;
function apply(){var b=document.body;if(!b)return;var id=cur(),T=get(id)||THEMES[0];scr();
  if(applied===id)return;applied=id;
  var c=DOC.className.split(/\s+/).filter(function(x){return x&&!/^th-/.test(x);});
  if(T.cls){c.push('th-x',T.cls,T.dark?'th-dark':'th-light');if(noBlur())c.push('th-nb');}
  DOC.className=c.join(' ');
  var bg=document.getElementById('thbg');
  if(T.cls){if(!bg){bg=document.createElement('div');bg.id='thbg';bg.setAttribute('aria-hidden','true');b.insertBefore(bg,b.firstChild);}bg.innerHTML=SCENE[T.id]?SCENE[T.id]():'';}
  else if(bg)bg.parentNode.removeChild(bg);
  // «Кухня»: окно с геранью — за спиной Зины в меню (картинка-переменная, чтобы стояло там же, где Зина, на любом экране)
  try{if(T.id==='kitchen')DOC.style.setProperty('--kwin','url("data:image/svg+xml,'+encodeURIComponent(SCENE.kitchenWin())+'")');else DOC.style.removeProperty('--kwin');}catch(e){}
  watch(!!T.cls);
  try{if(typeof G!=='undefined'&&G&&document.getElementById('game').classList.contains('on'))layoutWheel();}catch(e){}
  try{if(document.getElementById('modal').classList.contains('on')&&document.querySelector('#mcard .win'))fitWin();}catch(e){}}
function set(id){if(!owned(id))return false;TRIAL=null;if(!FORCE){S.th=id;try{save();}catch(e){}}else FORCE=id;apply();nowUpd();try{STAT.ev('mod',{m:'theme',a:'set',k:id});}catch(e){}return true;}
// выдать заработанное роликами — навсегда; сообщение один раз
function check(silent){var got=[];for(var i=0;i<THEMES.length;i++){var T=THEMES[i];if(T.unlock.t!=='ads'||thU()[T.id])continue;if(earned(T)){thU()[T.id]=1;got.push(T);}}
  if(got.length){try{save();if(typeof cloudSoon==='function')cloudSoon();}catch(e){}try{STAT.ev('mod',{m:'theme',a:'got',k:got[0].id});}catch(e){}
    if(!silent)try{toast('🎨 Открыто оформление «'+got[0].ru+'». Включить — ⚙️ → Оформление',4200);}catch(e){}}
  return got;}
function bought(payId){for(var i=0;i<THEMES.length;i++){var T=THEMES[i];if(T.unlock.t==='pay'&&T.unlock.pay===payId){thU()[T.id]=1;set(T.id);return true;}}return false;}
function list(){return THEMES.map(function(T){return {id:T.id,ru:T.ru,name:T.ru,dark:!!T.dark,unlock:T.unlock,owned:owned(T.id),cur:cur()===T.id,progress:prog(T),how:how(T)};});}
function inLevel(){try{return document.getElementById('game').classList.contains('on');}catch(e){return false;}}
function canBuy(T){var u=T.unlock;return u.t==='pay'&&typeof PAY!=='undefined'&&PAY.on&&!!PAY.item(u.pay)&&!inLevel();}
function adOk(){try{return typeof adsOk==='function'&&adsOk()&&!SHOT;}catch(e){return false;}}
/* примерка платной темы на один уровень за ролик (как «примерка на партию» в Кирпичиках): не сохраняется, до TRY_MAX раз за запуск */
function trial(id){TRIAL=id&&get(id)?id:null;trDone=false;apply();}
function tryTheme(id){var T=get(id);if(!T||owned(id)||trN>=TRY_MAX||!adOk())return;try{STAT.offer('thtry');STAT.place('thtry');}catch(e){}
  showRewarded(function(){trN++;trial(id);try{STAT.ev('mod',{m:'theme',a:'try',k:id});}catch(e){}
    var lv=inLevel()&&typeof G!=='undefined'&&G&&!G.won;hideModal();toast((lv?'Этот уровень':'Следующий уровень')+' — в оформлении «'+T.ru+'»',3600);},function(){open();});}
function trialEnd(){if(!TRIAL)return;var T=get(TRIAL);TRIAL=null;trDone=false;apply();try{toast('Примерка закончилась. Оформление «'+T.ru+'» — в ⚙️ → Оформление',4200);}catch(e){}}
function buy(id){var T=get(id);if(!T||owned(id))return;var u=T.unlock;
  if(u.t==='pay'){if(canBuy(T))PAY.buy(u.pay);else toast('Покупки сейчас недоступны');return;}
  if(u.t==='ads'){if(!adOk()){toast('Ролик сейчас недоступен — загляни позже');return;}
    try{STAT.offer('theme');STAT.place('theme');}catch(e){}showRewarded(function(){check();open();},function(){open();});}}
function prevHtml(T){return '<span class="thp thp-'+T.id+'"><i class="thp-h"></i><i class="thp-c"><b>З</b><b>И</b><b>Н</b><b>А</b></i><i class="thp-b"></i></span>';}
var back=null;
function open(bk){if(typeof bk==='function')back=bk;check(true);try{STAT.screen('theme');}catch(e){}var c=cur(),h='',ads=adOk();
  for(var i=0;i<THEMES.length;i++){var T=THEMES[i],own=owned(T.id),u=T.unlock,pr=prog(T),btn='',on=T.id===c&&!(TRIAL===T.id);
    if(on)btn='<span class="th-on">✓ Включено</span>';
    else if(own)btn='<button class="btn green" data-th="set:'+T.id+'">Включить</button>';
    else if(u.t==='pay'){btn=canBuy(T)?'<button class="btn green noenter" data-th="buy:'+T.id+'">Купить · '+PAY.price(PAY.item(u.pay))+'</button>':'<span class="th-lk">'+(inLevel()?'Купить можно из меню':'Покупки сейчас недоступны')+'</span>';
      if(ads&&trN<TRY_MAX&&TRIAL!==T.id)btn+='<button class="btn gold thad noenter" data-th="try:'+T.id+'">📺 Примерить на уровень за рекламу</button>';
      if(TRIAL===T.id)btn+='<span class="th-lk">сейчас примеряется</span>';}
    else if(u.t==='ads')btn=ads?'<button class="btn gold thad noenter" data-th="buy:'+T.id+'">📺 Ролик · '+pr.have+' из '+pr.need+'</button>':'<span class="th-lk">Ролики сейчас недоступны</span>';
    h+='<div class="thc'+(on?' on':'')+(own?'':' lock')+'">'+prevHtml(T)+'<div class="thc-b"><b>'+T.ru+(own?'':' <span class="thc-l">🔒</span>')+'</b><small>'+T.ds+'</small>'+
      '<small class="th-how">'+(own?(u.t==='free'?'бесплатно, у всех':'открыто навсегда'):how(T)+(pr?': '+pr.txt:''))+'</small>'+
      (pr&&!own?'<span class="thbar"><i style="width:'+Math.round(pr.have/pr.need*100)+'%"></i></span>':'')+'</div><div class="thc-f">'+btn+'</div></div>';}
  modal('<h2>🎨 Оформление</h2><p class="thi">Меняется только вид: фон, окна и кнопки. Уровни, слова и монеты — те же.</p><div class="thg">'+h+'</div><div class="btns"><button class="btn ghost" id="thBack">'+(back?'← Назад':'Закрыть')+'</button></div>');
  var mc=document.getElementById('mcard');if(typeof PAY!=='undefined'&&PAY.on)PAY.re=function(){open();};
  var q=mc.querySelectorAll('[data-th]');for(var j=0;j<q.length;j++)(function(b){b.onclick=function(){try{SND.tap();}catch(e){}var a=b.getAttribute('data-th').split(':');
      if(a[0]==='set'){set(a[1]);open();}else if(a[0]==='try')tryTheme(a[1]);else buy(a[1]);};})(q[j]);
  document.getElementById('thBack').onclick=function(){try{SND.tap();}catch(e){}if(back){var f=back;back=null;f();}else hideModal();};
  try{if(typeof adDim==='function')adDim();}catch(e){}}
window.THEME={list:list,owned:owned,cur:cur,set:set,get:get,progress:function(id){var T=get(id);return T?prog(T):null;},buy:buy,open:open,apply:apply,check:check,bought:bought,trial:trial,icons:walk};

/* ---------- сохранение: вызываются из migrate() и mergeSave() в js/core.js ---------- */
window.thFix=function(){thU();if(typeof S.adTot!=='number'||!(S.adTot>=0))S.adTot=0;if(S.th!=null&&(typeof S.th!=='string'||!get(S.th)))delete S.th;};
// облако: открытые — объединение, ролики — максимум, выбранная — из более нового сохранения
window.thMerge=function(d,newer){if(!d||typeof d!=='object')return;var u=thU();if(d.thU&&typeof d.thU==='object'&&!Array.isArray(d.thU))for(var k in d.thU)if(d.thU[k])u[k]=1;
  S.adTot=Math.max(+S.adTot||0,+d.adTot||0);if(newer&&typeof d.th==='string'&&get(d.th))S.th=d.th;window.thFix();setTimeout(apply,0);};

/* ---------- связь с игрой (обёртки, как в Рыбалке) ---------- */
function rowBtn(id){var T=get(cur()),b=document.createElement('button');b.className='setrow';b.id=id;b.innerHTML='<span>🎨 Оформление<br><small class="th-now">сейчас: '+T.ru+'</small></span><b>›</b>';return b;}
// ⚙ → строка «🎨 Оформление»
{var os=openSettings;openSettings=function(){os.apply(this,arguments);var mc=document.getElementById('mcard'),bt=mc&&mc.querySelector('.btns');if(!bt||document.getElementById('sTheme'))return;
  var b=rowBtn('sTheme'),rows=document.getElementById('setRows');bt.parentNode.insertBefore(b,rows&&rows.nextSibling?rows.nextSibling:bt);b.onclick=function(){try{SND.tap();}catch(e){}open(openSettings);};};
 var gs=document.getElementById('gSet');if(gs)gs.onclick=openSettings;}
// «Об игре» (кнопка в меню) → та же строка: в меню своей ⚙ нет
{var oc=openCredits;openCredits=function(){oc.apply(this,arguments);var mc=document.getElementById('mcard'),bt=mc&&mc.querySelector('.btns');if(!bt||document.getElementById('cTheme'))return;
  var b=rowBtn('cTheme');bt.parentNode.insertBefore(b,bt);b.onclick=function(){try{SND.tap();}catch(e){}open(openCredits);};};}
// «Облики» → строка «🎨 Оформление» под вкладками (там игрок ищет наряды); окно открывается поверх «Обликов», «Назад» — обратно в них
function nowUpd(){try{var q=document.querySelectorAll('.th-now'),T=get(cur());for(var i=0;i<q.length;i++)q[i].textContent='сейчас: '+T.ru;}catch(e){}}
{var osh=openShop;openShop=function(){osh.apply(this,arguments);var sl=document.getElementById('shopList'),tb=sl&&sl.querySelector('.tabs');if(!tb||document.getElementById('shTheme'))return;
  var b=rowBtn('shTheme');b.className='setrow shth';tb.parentNode.insertBefore(b,tb.nextSibling);b.onclick=function(){try{SND.tap();}catch(e){}open(function(){hideModal();nowUpd();});};};}
// ролики за награду — счётчик досмотренных за всё время (тема за ролики): считается только в колбэке награды
{var sr=showRewarded;showRewarded=function(cb,onFail){return sr(function(){S.adTot=(+S.adTot||0)+1;try{save();}catch(e){}try{cb&&cb.apply(this,arguments);}finally{try{check();}catch(e){}}},onFail);};}
// покупка темы — включить сразу
{var pa=payAfter;payAfter=function(id){if(id)try{bought(id);}catch(e){}pa.apply(this,arguments);};}
// окно — значки сразу (до fitWin), экран — для фона-места
{var m0=modal;modal=function(h){m0.apply(this,arguments);if(ON)walk(document.getElementById('mcard'));};}
{var sh=show;show=function(id){sh.apply(this,arguments);scr();};}
// окно победы в темах крупнее — если после fitWin всё ещё не влезло, убираем ещё второстепенное (только в темах; основной вид — как был)
{var fw=fitWin;fitWin=function(){fw.apply(this,arguments);if(!ON)return;var m=document.getElementById('mcard'),w=m&&m.firstElementChild;if(!w)return;
  var cs=getComputedStyle(m),pad=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0),X=['.win>p[style*="14.5px"]','.week .wt','.stamp small','.soc-o>span','.win>p:not(.rankup)','.week'];
  for(var i=0;i<X.length;i++){if(w.offsetHeight+pad<=m.clientHeight+1)break;var q=w.querySelectorAll(X[i]);for(var j=0;j<q.length;j++)q[j].style.display='none';}};}
// примерка: пройденный уровень — последний в примеряемом виде
{var fl=finishLevel;finishLevel=function(){if(TRIAL)trDone=true;return fl.apply(this,arguments);};}
{var sl=startLevel;startLevel=function(){if(TRIAL&&trDone)trialEnd();return sl.apply(this,arguments);};}
{var om=openMenu;openMenu=function(){if(TRIAL&&trDone)trialEnd();var r=om.apply(this,arguments);scr();return r;};}
window.thFix();check(true);
if(S.th&&!owned(S.th)&&!FORCE){/* выбранной темы больше нет (другое устройство без покупки) — основной вид, выбор не стираем: покупка может прийти из облака */}
apply();
// покупки приходят позже (PAY.init после облака) — применить ещё раз
setTimeout(apply,1500);setTimeout(apply,6000);
})();
