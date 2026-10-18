/* b2-vkm.js — VKT (поток «vkt», «Магнат 2.0», 18.10.2026): миссии VK и вход в письмо «Написать Людмиле Санне». Договоры — шапка js/b2-core.js.
   МИССИИ. Отправка, очередь, повторы и подпись — общий модуль SOC v2.5 (SOC.mission('код') → функция vk-pay ?op=vkev; evUrl/evId — в SOC.init, shell.js).
   Здесь — только «что выполнено». Список (коды, тексты, баллы, картинки) — hobby-analytics/release-b/M50-boost/VKT-tools/missions.py (единственный источник),
   он пишет js/b2-vkm-data.js: VKM_MG=[[код, счётчик, порог],…] — миссии самой игры, VKM_MK={код:1} — коды потоков (B2.vkm), VKM_MG_ID={код: номер в кабинете VK}.
   Потоки регистрируют свои миссии B2.vkm('<поток>',[{id,ok:()=>bool}]) (договор — logs/VKT.md); код, которого нет в VKM_MK, не отправляется.
   Новых полей сохранения нет: что уже засчитано — S.soc.ev.m (SOC.merge). Только VK (не ОК, не Яндекс, не ?demo); данные грузятся только там (B2.need).
   Проверка — через 6 с после входа, после закрытия месяца, звания, вехи, вещи, IPO, стены и по B2.emit('vkm') (не чаще раза в 4 с).
   Старому игроку уже выполненное засчитывается сразу, а SOC шлёт по 2 за запрос и не больше 4 за сеанс (как у Зины и Рыбалки). Старые WebView: без ?. и ??. */
(function(){'use strict';
B2.off.vkt=0;          // 1 — выключено по умолчанию
if(B2.off('vkt'))return;
var R=typeof window!=='undefined'?window:globalThis;
function O(x){return x&&typeof x==='object'?x:{};}
function N(x){x=+x;return isFinite(x)?x:0;}
function W(){return R.GAME&&GAME.W||null;}
function wk(p){var n=0,w=O(typeof S!=='undefined'&&S&&S.wall),k;for(k in w)if(p(k,w[k]))n++;return n;}
var CNT={
  e:function(k){return O(S.crE)[k]?1:0;},                                     // достижение / веха / глава (S.crE — навсегда на игрока)
  rk:function(){return (S.rk|0)+1;},                                           // номер звания 1…15 (S.rk не падает)
  ipo:function(){return Array.isArray(S.fame)?S.fame.length:0;},              // проведено IPO (прошлые холдинги)
  wg:function(){return wk(function(k){return k.indexOf('ph_')&&k.indexOf('cup_');});}, // грамот на Стене почёта
  wp:function(){return wk(function(k){return !k.indexOf('ph_');});},          // фото на Стене
  wgold:function(){return wk(function(k){return !k.indexOf('ph_')&&!!(GAME.phGold&&GAME.phGold(k));});}, // фото в золотой рамке
  wk:function(){return wk(function(k){return !k.indexOf('cup_w_');});},       // кубков «Итоги недели»
  wkg:function(){return wk(function(k,v){return !k.indexOf('cup_w_')&&O(v).w===3;});}, // золотых кубков недели
  meet:function(){return wk(function(k){return !k.indexOf('ph_meet_');});},   // встреч выпускников
  c11:function(){return wk(function(k){return !k.indexOf('cup_11b_');});},    // «Кубок 11 „Б“» — капитал больше, чем у Бориса
  lx:function(id){return O(S.lxE)[id]?1:0;},                                   // вещь куплена хоть раз
  lxn:function(){var n=0,o=O(S.lxE),k,x;for(k in o){x=ECON.luxOf&&ECON.luxOf(k);if(o[k]&&x&&x.p>0)n++;}return n;}, // разных купленных вещей
  col:function(){var n=0,o=O(S.col),k;for(k in o)if(o[k])n++;return n;},      // собранных наборов вещей
  fr:function(id){var w=W(),x=w&&O(w.fr)[id];return x&&N(x.rel)>=70?1:0;}     // друг 11 «Б» — «не разлей вода» (lvOf 4: rel ≥ 70)
};
function val(c,memo){if(c in memo)return memo[c];var i=c.indexOf(':'),f=CNT[i<0?c:c.slice(0,i)],v=0;
  try{v=f?N(i<0?f():f(c.slice(i+1))):0;}catch(e){v=0;}return memo[c]=v;}
function on(){try{return typeof PLAT!=='undefined'&&PLAT==='vk'&&typeof SOC!=='undefined'&&typeof SOC.mission==='function'&&!SOC.isOk&&!R.__demo&&typeof S!=='undefined'&&!!S;}catch(e){return false;}}
// номер миссии из кабинета VK (SOC.init evId); 0 — ещё не заведена: SOC её запомнит, но не пошлёт
B2.vkmId=function(c){return typeof VKM_MG_ID==='object'&&N(VKM_MG_ID[c])||0;};
// проверка: всё выполненное и ещё не записанное — модулю SOC (шлёт он сам, молча). Возвращает, сколько записано сейчас
function check(){var n=0;if(!on()||typeof VKM_MG==='undefined')return 0;
  try{var memo={},i,m,id,l,x,mk=O(R.VKM_MK);
    for(i=0;i<VKM_MG.length;i++){m=VKM_MG[i];if(SOC.missionKnown(m[0]))continue;if(val(m[1],memo)>=m[2]&&SOC.mission(m[0]))n++;}
    for(id in B2.vkmL){if(B2.off(id))continue;l=B2.vkmL[id];if(!Array.isArray(l))continue;
      for(i=0;i<l.length;i++){x=l[i];if(!x||!x.id||!mk[x.id]||typeof x.ok!=='function'||SOC.missionKnown(x.id))continue;
        var ok=false;try{ok=!!x.ok();}catch(e){}if(ok&&SOC.mission(x.id))n++;}}
  }catch(e){try{console.error('B2 vkm',e);}catch(x){}}
  return n;}
var T=0,last=0,busy=false;
function plan(ms){if(T||busy||!on())return;T=setTimeout(function(){T=0;last=Date.now();busy=true;
    Promise.all([B2.need('b2-vkm-data.js'),B2.need('b2-vkm-x.js').catch(function(){})]).then(function(){busy=false;check();},function(){busy=false;});},Math.max(ms||0,last+4000-Date.now()));}
B2.on('enter',function(){plan(6000);});
B2.on('vkm',function(){plan(500);});
if(R.GAME&&GAME.on){var ev=['close','rank','mile','lux','ipo','wall','cr'],j;for(j=0;j<ev.length;j++)GAME.on(ev[j],function(){plan(1500);});}
R.VKM={check:check,val:function(c){return val(c,{});},cnt:CNT,on:on,plan:plan};

/* ПИСЬМО «✉️ Написать Людмиле Санне» (Б19): строка в ⚙ (гнездо settings); окно — js/b2-vkm-mail.js по требованию. Везде (VK, Яндекс, ОК), текст — только в STAT. */
B2.slot('settings','vkt',function(){return '<button class="set noenter" data-b2="vkt:mail"><span>✉️ '+L('Написать Людмиле Санне','Write to Lyudmila Sanna')+'<br><small>'+
  L('что нравится, что мешает, идеи — читаем всё','what you like, what bothers you, ideas — we read it all')+'</small></span><i class="go">›</i></button>';},20);
B2.click('vkt',function(act){if(act!=='mail')return;try{SND.tap();}catch(e){}
  B2.need('b2-vkm-mail.js').then(function(){if(R.VKMAIL)VKMAIL.open('set',function(){try{openSettings();}catch(e){hideModal();}});},
    function(){try{toast(L('Нет связи — попробуйте чуть позже','No connection — please try again later'));}catch(e){}});});
})();
