/* VKM — миссии VK «Рыбалки с Петровичем» (ветка vkm, 10.10.2026; образец — Зина: slovo js/vkm.js + js/extras.js vkmCheck, Выезд js/vkm-vy.js).
   Журнал: ~/Projects/hobby-analytics/release-i/vk-missions/rybak.md, список с текстами и картинками — …/vk-missions/rybak/list.md.
   Отправкой, очередью, повторами и подписью занят общий модуль SOC v2.4 (SOC.mission('код') → функция vk-pay ?op=vkev; настройки evUrl/evId — в SOC.init, index.html).
   Здесь — только условия. Условия — данными VKM_RY=[[код, счётчик, порог],…] в js/meta-vkm-data.js (пишет tools/missions.py из hobby-analytics — список править только там);
   номера миссий из кабинета VK — VKM_RY_ID (data/vk-missions-ids.json; без номера SOC миссию запомнит, но не пошлёт).
   Счётчики VKM_CNT — только то, что игра уже считает: НОВЫХ ПОЛЕЙ СОХРАНЕНИЯ НЕТ (состояние миссий живёт в S.soc.ev, его сливает SOC.merge).
   Счётчик с двоеточием — с параметром: pl:<id места>, leg:<id легенды>, legch:<глава>, alb:<id рыбы>.
   Уровень и очки (SOC.level/score) НЕ шлём: таблица результатов в кабинете — «по очкам», она занята лигой друзей (LB.show → VKWebAppShowLeaderBoardBox, граммы недели).
   Проверка — через 6 с после запуска и после любого сохранения (не чаще раза в 4 с, не во время рыбалки). Старому игроку уже выполненное засчитывается при первом заходе
   тихо: SOC шлёт по 2 миссии за запрос и не больше 4 за сеанс. Только VK (не ОК, не Яндекс, не ?demo): в остальных местах ничего не запоминается и не шлётся.
   Имя файла meta-*.js — чтобы tools/pack.sh взял его в архивы по маске js/meta-*.js. Старые WebView: без ?. и ??. */
(function(){
'use strict';
if(typeof S==='undefined'||typeof SOC==='undefined'||typeof VKM_RY==='undefined')return;
function O(x){return x&&typeof x==='object'?x:{};}
function N(x){x=+x;return isFinite(x)?x:0;}
function cnt(o){var n=0,k;o=O(o);for(k in o)if(o[k])n++;return n;}
function sum(o){var n=0,k;o=O(o);for(k in o)n+=N(o[k]);return n;}
function pidx(id){for(var i=0;i<PLACES.length;i++)if(PLACES[i].id===id)return i;return -1;}
function albN(id){var a=O(S.alb)[id];return a&&N(a.n)>0?1:0;}
var VKM_CNT={
  ss:function(){return N(S.sessions);},                                   // законченных рыбалок
  cn:function(){return N(S.caught);},                                     // поймано рыб всего
  sp:function(){return spCount();},                                       // видов в альбоме
  tr:function(){var n=0,a=O(S.alb),k;for(k in a)if(FISH[k]&&a[k]&&a[k].tr)n++;return n;},            // видов с трофеем
  big:function(){return N(S.bigW);},                                      // самая тяжёлая рыба, граммы
  rb:function(){var n=0,a=O(S.alb),k;for(k in a)if(FISH[k]&&rarOf(k)==='rb'&&a[k]&&N(a[k].n)>0)n++;return n;}, // краснокнижных видов (сфотографировал и отпустил)
  tk:function(){var t=O(S.tk);return N(t.rod)+N(t.line)+N(t.reel);},      // сумма ступеней снасти 0…12
  st:function(){var n=0,a=O(S.alb),k;for(k in a)if(a[k])n+=mastOf(N(a[k].n));return n;},              // звёзд мастерства
  m3:function(){var n=0,a=O(S.alb),k;for(k in a)if(FISH[k]&&a[k]&&mastOf(N(a[k].n))>=3)n++;return n;}, // видов с тремя звёздами
  sets:function(){return cnt(S.sets);},                                   // забрано наград за наборы альбома
  mnt:function(){return cnt(S.mnt);},                                     // чучел на трофейной стене
  gild:function(){return cnt(S.gild);},                                   // золотых рамок
  dec:function(){return decCount();},                                     // украшений берега и поплавков
  gf:function(){return giftN();},                                         // взято подарков дня (дней захода)
  dl:function(){var n=0,d=O(S.daily),k;for(k in d)if(d[k]&&/^\d{8}$/.test(k))n++;return n;},          // дней с выполненным заданием дня
  cup:function(){return cnt(S.cups);},                                    // кубков турнира недели
  lgl:function(){var l=N(S.lgL),h=O(S.lgH),k;for(k in h)l=Math.max(l,N(h[k])%10);return Math.min(2,l);}, // высшая достигнутая лига двора (0 бронза, 1 серебро, 2 золото)
  lgg:function(){return N(S.lgG);},                                       // побед в золотой лиге
  rk:function(){return META.sci.rank(META.sci.points()).i;},              // номер звания Науки Петровича
  med:function(){return cnt(S.mapM);},                                    // медалей Карты России
  cst:function(){return META.cat.stage();},                               // стадия кота Васьки 0…4
  ctn:function(){return N(S.catN);},                                      // угощений Ваське
  cos:function(){var n=0,k,it=META.cat.ITEMS,i,o=O(S.catK);for(i=0;i<it.length;i++)if(it[i].k==='cos'&&o[it[i].id])n++;return n;}, // нарядов Васьки
  mg:function(){return sum(O(S.mg).cnt);},                                // сыграно мини-игр (без тренировок бота)
  mgk:function(){return cnt(O(S.mg).cnt);},                               // разных мини-игр
  bk:function(){return MG.lvlOf(N(O(S.mg).pt));},                         // ступень Книги двора
  xf:function(){return lvOf(N(O(S.xp).f));},                              // навык поплавочной ловли 1…10
  xd:function(){return lvOf(N(O(S.xp).d));},                              // навык донной ловли 1…10
  pbs:function(){return sum(S.pbs);},                                     // звёзд Книг мест
  fs:function(){var n=0,f=O(S.fest),k;for(k in f)if(cnt(O(f[k]).g)||cnt(O(f[k]).u))n++;return n;}, // праздников, в которых участвовал: ловил рыбу / забрал подарок (FEST use/give); «застал оформление» (s) не считается
  pl:function(id){var i=pidx(id);return i>=0&&O(S.open)[i]?1:0;},         // водоём открыт
  leg:function(id){return O(S.legs)[id]?1:0;},                            // легенда / Царь-рыба поймана
  legch:function(ch){var n=0,i,P;for(i=0;i<PLACES.length;i++){P=PLACES[i];if(String(P.ch)!==String(ch)||!P.leg)continue;if(!O(S.legs)[P.leg])return 0;n++;}return n?1:0;}, // все легенды главы
  alb:function(id){return albN(id);}                                      // рыба есть в альбоме
};
function val(key,memo){if(key in memo)return memo[key];var i=key.indexOf(':'),f=VKM_CNT[i<0?key:key.slice(0,i)],v=0;
  try{v=f?N(i<0?f():f(key.slice(i+1))):0;}catch(e){v=0;}return memo[key]=v;}
function on(){try{return PLAT==='vk'&&!OK&&!window.__demo&&!(typeof saveHold!=='undefined'&&saveHold);}catch(e){return false;}}
function fishing(){try{return !!(typeof G!=='undefined'&&G&&!G.over);}catch(e){return false;}}
// проверка: всё выполненное и ещё не записанное — модулю SOC (шлёт он сам, молча). Возвращает, сколько миссий записано сейчас
function check(){var n=0;try{if(!on())return 0;var memo={},i,m;
    for(i=0;i<VKM_RY.length;i++){m=VKM_RY[i];if(SOC.missionKnown(m[0]))continue;if(val(m[1],memo)>=m[2]&&SOC.mission(m[0]))n++;}
  }catch(e){}return n;}
var T=0,last=0;
function plan(ms){if(T||!on())return;T=setTimeout(function(){T=0;if(fishing()){plan(4000);return;}last=Date.now();check();},Math.max(ms||0,last+4000-Date.now()));}
// после любого сохранения (покупка, награда, конец рыбалки, подарок…) — тихая проверка с задержкой
if(typeof save==='function'){var sv=save;save=function(){var r=sv.apply(this,arguments);try{plan(1500);}catch(e){}return r;};}
setTimeout(function(){plan(0);},6000);
window.VKM={check:check,cnt:VKM_CNT,val:function(k){return val(k,{});},list:VKM_RY,on:on};
})();
