/* VKMVY — миссии VK, лента друзей и таблица для «Выезда» (поток TECH буста, 10.10.2026; образец — Зина js/vkm.js + js/extras.js vkmCheck).
   Отправкой, очередью, повторами и подписью занят общий модуль SOC v2.4 (SOC.level/score/mission → функция vk-pay ?op=vkev). Здесь — только условия.
   Условия — данными VKM_VY=[[код, счётчик, порог],…]; номера миссий из кабинета VK — VKM_VY_ID (0 — миссия ещё не заведена: SOC её запомнит, но не пошлёт).
   Счётчики — только то, что игра уже считает (новых полей сохранения нет):
     lv — пройдено дворов подряд (S.unlocked−1) · st — звёзд всего · gr — машин в гараже · dl — дней с выполненным заданием дня · gs — гостинцев бабы Шуры (дней захода)
   SOC.level(lv) — «уровень» в таблицу/ленту, SOC.score(st) — «очки» (что из них слать — решает acts в hobby-pay/missions.json по типу таблицы в кабинете).
   Проверка — после победы, гостинца и при запуске (через 6 с). Только VK с мостом (не ОК, не Яндекс): в остальных местах SOC молчит сам.
   Список миссий с текстами для кабинета — hobby-analytics/release-i/vyezd-boost/TECH-tools/missions-vyezd.md. Старый синтаксис: грузится с defer. */
var VKM_VY=[["lv1","lv",1],["lv5","lv",5],["lv10","lv",10],["lv20","lv",20],["lv30","lv",30],["lv50","lv",50],["lv75","lv",75],["lv100","lv",100],["lv150","lv",150],["lv200","lv",200],["lv300","lv",300],
  ["st30","st",30],["st100","st",100],["st250","st",250],["st500","st",500],
  ["gr3","gr",3],["gr6","gr",6],["gr10","gr",10],
  ["dl1","dl",1],["dl7","dl",7],["dl30","dl",30],
  ["gs7","gs",7],["gs30","gs",30]];
var VKM_VY_ID={}; // код → номер миссии из кабинета VK (заполнить, когда VK одобрит; так же — в hobby-pay/missions.json)
(function(){
  'use strict';
  function s(){try{return typeof S!=='undefined'?S:null;}catch(e){return null;}}
  var CNT={
    lv:function(){var x=s();return Math.max(0,(+x.unlocked||1)-1);},
    st:function(){var x=s(),n=0,k;for(k in x.stars||{})n+=+x.stars[k]||0;return n;},
    gr:function(){var x=s();return x.garage&&x.garage.length||0;},
    dl:function(){var x=s();return Object.keys(x.daily||{}).filter(function(k){return (+x.daily[k]||0)>0;}).length;},
    gs:function(){try{return typeof giftN==='function'?+giftN()||0:0;}catch(e){return 0;}}
  };
  function on(){try{return typeof SOC!=='undefined'&&SOC&&SOC.level&&typeof PLAT!=='undefined'&&PLAT==='vk'&&!(typeof OK!=='undefined'&&OK)&&!window.__demo&&!!s();}catch(e){return false;}}
  function check(){try{
    if(!on())return;
    SOC.level(CNT.lv());SOC.score(CNT.st());
    var memo={},i,m,f;
    for(i=0;i<VKM_VY.length;i++){m=VKM_VY[i];if(SOC.missionKnown&&SOC.missionKnown(m[0]))continue;f=CNT[m[1]];if(!f)continue;
      if(!(m[1] in memo))memo[m[1]]=f();
      if(memo[m[1]]>=m[2])SOC.mission(m[0]);}
  }catch(e){}}
  function wrap(name){var f=window[name];if(typeof f!=='function'||f.__vkm)return;var w=function(){var r=f.apply(this,arguments);setTimeout(check,800);return r;};
    for(var k in f)if(f.hasOwnProperty(k))w[k]=f[k];w.__vkm=1;window[name]=w;}
  wrap('win');wrap('claimStreak');
  setTimeout(check,6000);
  window.VKMVY={check:check,cnt:CNT};
})();
