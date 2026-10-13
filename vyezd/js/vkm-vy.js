/* VKMVY — миссии VK, лента друзей и таблица для «Выезда» (заготовка TECH 10.10.2026, полный список — ветка vkm 10.10; образец — Зина js/vkm.js + js/extras.js vkmCheck).
   Отправкой, очередью, повторами и подписью занят общий модуль SOC v2.4 (SOC.level/score/mission → функция vk-pay ?op=vkev). Здесь — только условия.
   Условия — данными VKM_VY=[[код, счётчик, порог],…]: блок между метками VKM ниже пишет hobby-analytics/release-i/vk-missions/vyezd/tools/missions.py --game
   (список править ТОЛЬКО там); номера миссий из кабинета VK — отдельный файл js/vkm-vy-ids.js (VKM_VY_ID; 0 — миссия ещё не заведена: SOC её запомнит, но не пошлёт).
   Счётчики CNT — только то, что игра уже считает (новых полей сохранения нет); нет модуля буста — счётчик 0, миссия просто не срабатывает.
   SOC.level(lv) — «уровень» в таблицу/ленту, SOC.score(st) — «очки» (что из них слать — решает acts в hobby-pay/missions.json).
   Проверка — через 1,5 с после любого сохранения игры (обёртка save: двор, гостинец, стройка, реставрация, затея, лига…), после победы и при запуске (через 6 с).
   Старому игроку всё уже выполненное засчитывается при первой же проверке: SOC кладёт миссии в очередь S.soc.ev.m и шлёт тихо, порциями (до 2 за запрос, до 4 за сеанс).
   Только VK с мостом (не ОК, не Яндекс, не ?demo): в остальных местах ничего не запоминается и не шлётся.
   Список с текстами и картинками для кабинета — hobby-analytics/release-i/vk-missions/vyezd/ (list.md, list.json, img/). Старый синтаксис: грузится с defer. */
/*VKM*/var VKM_VY=[
  ["lv1","lv",1],["lv5","lv",5],["lv10","lv",10],["lv30","lv",30],["lv50","lv",50],["lv100","lv",100],["lv150","lv",150],["lv200","lv",200],["lv250","lv",250],["lv300","lv",300],["lv400","lv",400],["lv500","lv",500],["lv600","lv",600],["lv750","lv",750],["lv1000","lv",1000],
  ["rg60","lv",60],["rg70","lv",70],["rg90","lv",90],["rg120","lv",120],["rg170","lv",170],["rg190","lv",190],["rg210","lv",210],
  ["st100","st",100],["st250","st",250],["st500","st",500],["st750","st",750],["st1000","st",1000],["st1500","st",1500],["st2000","st",2000],
  ["s3_100","s3",100],["s3_200","s3",200],["s3_300","s3",300],["s3_500","s3",500],
  ["gr3","gr",3],["gr10","gr",10],
  ["rs1","rs",1],["al15","al",15],["al20","al",20],["al25","al",25],["al30","al",30],["al35","al",35],["al40","al",40],["lgd5","lgd",5],
  ["ws1","ws",1],["ws2","ws",2],["ws3","ws",3],
  ["mg1","mp",1],["mp25","mp",25],["mp100","mp",100],["mp250","mp",250],["m3_5","m3",5],["m3_10","m3",10],["m3_14","m3",14],
  ["pk1","pk",1],["pk6","pk",6],["pk12","pk",12],["pk18","pk",18],["pk24","pk",24],["pk30","pk",30],["pk36","pk",36],["pks108","pks",108],
  ["ds1","ds",1],["ds2","ds",2],["ds3","ds",3],["ds4","ds",4],["ds5","ds",5],
  ["rk10","rk",10],["rk15","rk",15],["rk18","rk",18],["rk20","rk",20],["rk23","rk",23],["rk25","rk",25],["rk28","rk",28],["rk30","rk",30],
  ["os1","os",1],["os3","os",3],["os5","os",5],["os10","os",10],
  ["pl10","pl",10],["pl20","pl",20],["pl30","pl",30],["pl50","pl",50],["pl75","pl",75],["pl100","pl",100],["pl150","pl",150],
  ["dl1","dl",1],["dl7","dl",7],["dl15","dl",15],["dl30","dl",30],["dl50","dl",50],["dl75","dl",75],["dl100","dl",100],["dl150","dl",150],["dl200","dl",200],
  ["gs7","gs",7],["gs14","gs",14],["gs30","gs",30],["gs50","gs",50],["gs75","gs",75],["gs100","gs",100],["gs150","gs",150],["gs200","gs",200],["gs300","gs",300],
  ["oc1","oc",1],["or20","or",20],["or50","or",50],["or100","or",100],["oc3","oc",3],["oc6","oc",6],
  ["yd1","yd",1],["yd18","yd",18],["yd30","yd",30],["yd40","yd",40],["yd50","yd",50],["yd60","yd",60],["yd80","yd",80],["yd108","yd",108],["yf1","yf",1],["yf3","yf",3],
  ["lt1","lt",1],["lt5","lt",5],["lt10","lt",10],["lt20","lt",20],["lg1","lg",1],["lg2","lg",2],["lg3","lg",3],
  ["ss25","ss",25],["ss50","ss",50],["ss100","ss",100],["ss200","ss",200],["sf1","sf",1],["sf3","sf",3],["sf6","sf",6],
  ["ru1","ru",1],["ru10","ru",10],["ru50","ru",50],["ru100","ru",100],["ru210","ru",210],["ic30","ic",30],["ic100","ic",100],["ic300","ic",300],["ic630","ic",630],
  ["fhw1","fhw",1],["fhwc","fhwc",1],["fny1","fny",1],["fnyc","fnyc",1]];/*VKM*/
if(typeof VKM_VY_ID==='undefined')var VKM_VY_ID={}; // js/vkm-vy-ids.js не загрузился — миссии копятся, но не шлются
(function(){
  'use strict';
  function s(){try{return typeof S!=='undefined'?S:null;}catch(e){return null;}}
  function O(x){return x&&typeof x==='object'?x:{};}
  function cntKeys(o,min){var n=0,k;o=O(o);for(k in o)if((+o[k]||0)>=(min||1))n++;return n;}
  function sum(o){var n=0,k;o=O(o);for(k in o)n+=+o[k]||0;return n;}
  function rank(){return window.CAR&&CAR.rank?O(CAR.rank()):{};}
  function fest(k){var e=window.FESTVY&&FESTVY.events&&FESTVY.events[k];return e||null;}
  function festN(k){var e=fest(k),y=O(O(s().fst).y),m=0,i;if(!e)return 0;for(i=0;i<e.ids.length;i++)m=Math.max(m,cntKeys(y[e.ids[i]]));return m;}
  function festCar(k){var e=fest(k);return e&&O(O(s().fst).car)[e.car]?1:0;}
  function park(){return O(O(s().vymg).park);}
  var CNT={
    lv:function(){return Math.max(0,(+s().unlocked||1)-1);},                       // пройдено дворов подряд
    st:function(){return sum(s().stars);},                                         // звёзд всего
    s3:function(){return cntKeys(s().stars,3);},                                   // дворов на ★★★
    gr:function(){var g=s().garage;return g&&g.length||0;},                        // машин в старом гараже
    al:function(){return window.ALB&&ALB.count?+ALB.count()||0:0;},                // готовых машин в Автоальбоме
    rs:function(){return cntKeys(s().alb,4);},                                     // отреставрировано у Толика
    lgd:function(){var n=0;if(window.ALB&&ALB.CARS&&ALB.st)ALB.CARS.forEach(function(c){if(c.r===2&&ALB.st(c.id)>0)n++;});return n;}, // машин-легенд получено
    ws:function(){return window.VYMG&&VYMG.built?VYMG.built().length:0;},          // собрано машин в мастерской
    mp:function(){return sum(O(s().vymg).n);},                                     // сыграно затей
    m3:function(){return cntKeys(O(O(O(s().vymg).m)._g).st,3);},                   // затей с тремя звёздами
    pk:function(){var p=O(park().s),n=0,k;for(k in p)if(+k<36&&(+p[k]||0)>0)n++;return n;}, // площадок Автодрома
    pks:function(){return window.VYPARK&&VYPARK.total?+VYPARK.total()||0:0;},      // звёзд Автодрома
    ds:function(){return +rank().d||0;},                                           // район карьеры 0…5
    rk:function(){var r=rank();return typeof r.i==='number'?r.i+1:0;},             // звание 1…30
    os:function(){return +rank().stars||0;},                                       // «Область ★N»
    pl:function(){return +O(s().car).l||0;},                                       // путевых листов
    dl:function(){return cntKeys(s().daily);},                                     // дворов дня
    gs:function(){try{return typeof giftN==='function'?+giftN()||0:0;}catch(e){return 0;}}, // гостинцев (дней захода)
    or:function(){return +O(s().ord).n||0;},                                       // заказов жильцов
    oc:function(){var g=O(s().ord).g;return g&&g.length||0;},                      // цепочек жильцов
    yd:function(){return window.MY&&MY.total?+MY.total()||0:0;},                   // улучшений «Моего двора»
    yf:function(){return cntKeys(s().myF);},                                       // дворов достроено
    lt:function(){return +s().lgaT||0;},                                           // троек лиги
    lg:function(){return +s().lgaL||0;},                                           // лига 0…3
    ss:function(){return sum(s().seaH)+(+O(s().sea).g||0);},                       // ступеней сезона всего
    sf:function(){return cntKeys(s().seaH,30)+((+O(s().sea).g||0)>=30?1:0);},      // сезонов целиком
    ru:function(){return cntKeys(s().lvR);},                                       // дворов в «Час пик»
    icn:function(){return cntKeys(s().lvI);},                                      // дворов в «Гололёд»
    ic:function(){return sum(s().lvI);},                                           // звёзд «Гололёда»
    fhw:function(){return festN('hw');},fhwc:function(){return festCar('hw');},    // «Чёрная Волга»: ночей / машина
    fny:function(){return festN('ny');},fnyc:function(){return festCar('ny');}     // «Ёлочный базар»: дворов / машина
  };
  function on(){try{return typeof SOC!=='undefined'&&SOC&&SOC.level&&typeof PLAT!=='undefined'&&PLAT==='vk'&&!(typeof OK!=='undefined'&&OK)&&!window.__demo&&!!s();}catch(e){return false;}}
  var busy=false,T=0;
  function val(k,memo){if(!(k in memo)){var v=0;try{v=+CNT[k]()||0;}catch(e){}memo[k]=v;}return memo[k];}
  function check(){T=0;if(busy)return;busy=true;try{
    if(!on())return;
    var memo={},i,m;
    SOC.level(val('lv',memo));SOC.score(val('st',memo));
    for(i=0;i<VKM_VY.length;i++){m=VKM_VY[i];if(!CNT[m[1]]||(SOC.missionKnown&&SOC.missionKnown(m[0])))continue;
      if(val(m[1],memo)>=m[2])SOC.mission(m[0]);}
  }catch(e){}finally{busy=false;}}
  function later(ms){if(T||busy)return;T=setTimeout(check,ms||1500);}
  function wrap(name,ms){var f=window[name];if(typeof f!=='function'||f.__vkm)return;var w=function(){var r=f.apply(this,arguments);later(ms);return r;};
    for(var k in f)if(f.hasOwnProperty(k))w[k]=f[k];w.__vkm=1;window[name]=w;}
  wrap('win',800);wrap('claimStreak',800);wrap('save',1500);
  setTimeout(check,6000);
  window.VKMVY={check:check,cnt:CNT};
})();
