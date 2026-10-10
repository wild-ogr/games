'use strict';
/* ================= zb-eco — ZBECO: ВСЕ числа экономики буста «Школа бабы Зины» (10.10.2026, поток ECO, ветка zb-eco) =================
   Договор для всех потоков (logs/COMMON.md, logs/ECO.md). Хозяин — ECO. ИМЕНА полей не меняются; ЧИСЛА ECO может поправить по модели
   (tools/econ_zb.py) — поэтому чисел у себя не пишите, читайте отсюда В МОМЕНТ ВЫЗОВА (не при загрузке файла: строка zb-eco.js стоит под меткой
   <!-- zb:ECO --> — модули VIEW/LVL/MODE/SCHOOL/NEWBIE выполняются раньше). Запасной путь до слияния: `var E=window.ZBECO||{}` и своё умолчание.
   Модуль не загрузился → игра как в main (старые ECO/PRICE в game.js работают сами).

   ПОДСКАЗКИ: ZBECO.letter / ZBECO.word — 35 / 90, НЕ МЕНЯТЬ (живые цены — PRICE в game.js, флаги Яндекса 20–50 / 60–150; ZBECO.price(kind)).
   ВЫДАЧА МОНЕТ С ПОТОЛКОМ: ZBECO.give(src, n, why) → сколько реально дано (0 — упёрлись в потолок дня). src — ключ ZBECO.cap
     ('mg' мини-игры, 'mode' режимы (= mode.cap), 'cell' новые клетки, 'today' дела дня, 'bag' портфель, 'back' вернувшемуся, 'buf' столовая, 'cab' кабинеты,
     'cls' классы, 'season' сезон, 'card' открытки, 'shelf' полки словаря) — нет в cap → без потолка. Пишет S.ecD (по дню), STAT earn.
     ZBECO.left(src) — сколько ещё можно сегодня. Потолок, кроме cap, у мини-игр — ещё и заметки/💡 (mg.notesDay, mg.hbDay) — считает MG0.
   КАБИНЕТЫ: ZBECO.cab — 8 строк {id, n, cls (класс открытия), p:[ур.1, ур.2, ур.3]}; ZBECO.cabPrice(id, lv) — цена шага до уровня lv (1–3);
     ZBECO.cabTotal() — 28 500. Отдачи: bufet (столовая), yat (живой уголок), trud (ателье Толика), akt (лига), lib (полки), muzej (открытки).
   РЕКЛАМА ПО НУЖДЕ: ZBECO.topUp(price) → сколько монет даст ролик «добить до …» (0 — кнопку не показывать: нехватка > ad.topUpMax цены,
     или исчерпан ad.topUpDay); ZBECO.topUpTake(n) — зачесть (после досмотра; в late — тоже). Кнопки «за рекламу» — класс `zbad`
     (просьба TECH: `.zbad:not([disabled])` в AD_BTN_SEL) и всегда с late (CLAUDE.md, adt).
   «×2 ЗА РОЛИК» УБРАНЫ (решение владельца 10.10): ZBECO.x2 === false. Не рисуйте «×2/ещё за рекламу» в своих окнах.
   ПОКУПКИ: ZBECO.abonOn()/abonTo() — Абонемент действует; ZBECO.remontLeft()/remontTake() — неистраченные «Ремонты» (CAB); ZBECO.uzelokOn() —
     Узелок ещё продаётся; события ZB.emit('abon'), ZB.emit('remont'). Портфель дня — ZBECO.bagOf(t) → {c, hb}.
   ДЕНЬ: ZBECO.day() = todayKey() (часы сервера Яндекса / устройства).
   ПОЛЯ СОХРАНЕНИЯ ECO: S.ecD {d, <src>: n} — выдано за день; S.ecTop {d, n} — роликов «добить»; S.ecAb {to, n} — Абонемент до (мс), куплено раз;
     S.ecRm {g, u} — «Ремонт кабинета»: куплено/применено; S.ecSew {id, k, t, p} — заказ у Толика (пишет CAB); S.ecP {d} — бедняцкая буква.
*/
(function(){
  var DAY=864e5;
  var E=window.ZBECO={v:1,on:true,x2:false,
    // ---- подсказки (НЕ МЕНЯТЬ: главный живой ролик — за букву/слово) ----
    letter:35,word:90,
    // ---- уровень: 1–500 — как в main (ECO.lvl: 2…8), 501+ — 8; трудная глава +2; контрольная класса (босс) ×2; «Отличник» +2 (EX_BONUS) ----
    lvlNew:8,hardAdd:2,bossMul:2,
    // ---- кабинеты: 8 × 3, ур.2 = ×2,5, ур.3 = ×4 → 28 500 💰 (разбор 04, макет 04-mock/meta.html; id — content/cab/cab-N.js) ----
    cab:[
      {id:'russkij',   n:'Класс русского',            cls:1, p:[150,375,600]},
      {id:'stolovaya', n:'Столовая тёти Вали',        cls:2, p:[250,625,1000]},
      {id:'zhivoj',    n:'Живой уголок Яти',          cls:3, p:[300,750,1200]},
      {id:'biblioteka',n:'Библиотека',                cls:4, p:[400,1000,1600]},
      {id:'akt',       n:'Актовый зал',               cls:5, p:[500,1250,2000]},
      {id:'sport',     n:'Спортзал',                  cls:6, p:[600,1500,2400]},
      {id:'trud',      n:'Кабинет труда',             cls:8, p:[700,1750,2800]},
      {id:'muzej',     n:'Школьный музей',            cls:10,p:[900,2250,3600]}],
    // столовая тёти Вали: монет в час по уровню столовой [нет, ур.1, ур.2, ур.3], копит не больше capH часов («Буфет полный — забери!»)
    bufet:{perH:[0,2,3,4],capH:12},
    // живой уголок Яти: кот приносит 💡 в запас (hbAdd) раз в N дней по уровню [нет, ур.1, ур.2, ур.3]; 0 — не приносит;
    // ур.1 — только кот на диване (как в разборе 04); только если в запасе (S.hb) меньше max — не копится. Модель econ_zb.py: «раз в 2 дня» — казуал на 30–40 % реже смотрит ролик за букву
    yat:{every:[0,0,4,3],max:1},
    // кабинет труда — ателье Толика (CAB, экран кабинета): наряды/блюдца старого магазина можно «заказать у Толика» — ДЕШЕВЛЕ на disc
    // по уровню кабинета [нет, ур.1, ур.2, ур.3], но ждать hours часов (до цены p — h часов; ур.2–3 — ×fast). В «Обликах» — сразу и по полной цене.
    // Заказ — поле S.ecSew {id, k:'o'|'s', t: когда готово (мс), p: заплачено} (пишет CAB). Пропуска ожидания за ролик нет (skipAd:false).
    trud:{hours:[[100,1],[500,3],[1000,6],[99999,12]],fast:[1,1,.5,.5],disc:[0,.1,.2,.3],skipAd:false},
    // актовый зал: призы «Соседок» (50/30/20/10) × множитель по уровню зала; дивизионы — SOS/CAB
    akt:{prizeMul:[1,1,1.2,1.5]},
    // библиотека: собрал полку буквы — монеты и закладка (раз за полку)
    lib:{shelf:20},
    // музей: открытки (глава / золотая — ≥15 уровней главы без подсказок / класс / выпускной)
    muzej:{gold:15,chapCard:0,goldCard:20,clsCard:0},
    // ---- ШКОЛА (SCHOOL: zb-school/zb-today/zb-season/zb-back) — имена по просьбе SCHOOL 10.10 ----
    school:{
      pf:{c:40,sun:60,hb:1},      // портфель дня за красную «5»: монеты; в воскресенье — sun монет и hb 💡 в запас
      need:3,of:5,                // дел из «Сегодня у Зины» на «5»
      dictN:3,                    // диктант: найти N бонусных слов за день
      homeN:3,                    // домашка: пройти N уровней
      cls:[0,0,30,40,50,60,70,80,90,100,110,120,300], // монеты за переход в класс [номер класса]; [12] — выпускной
      star:150,                   // ступень «Академии ★N» (после выпускного)
      ret:[[2,100],[7,200],[14,300]], // подарок вернувшемуся «Опять прогуливал?»: не был ≥ N дней → монет (вместо гостинца, не два окна подряд)
      season:{steps:30,free:{c:300,hb:3},abon:{c:500}}}, // четверть: ступеней; бесплатная дорожка всего; Абонемент — красота + монеты
    // ---- мини-игры (MG0 и MGA–MGC): по звёздам 1/2/3 → st[1..3]; Вечерка — vech; потолок монет в день — cap.mg ----
    mg:{st:[0,4,7,10],vech:10,notesDay:2,notesIssue:10,issues:12,hbDay:1,adPerRun:1,peremenaDay:3,
      issuePrize:{c:30,hb:2}},  // приз за собранный выпуск стенгазеты (10 заметок): монеты (вне потолка cap.mg — раз в 5–10 дней) и 💡
    // ---- режимы (MODE, js/zb-mode.js; имена — по просьбе MODE 10.10): с какого пройденного уровня открыт режим; монеты за звезду
    // (один раз на уровень и режим): last — «все слова», scan / scanEx — сканворд / без подсказок, train — успел на электричку, replay — повтор/опоздал;
    // cap — монет режимов в день (= cap.mode); электричка: trainSec, уровень от trainBigW слов — trainBig секунд ----
    mode:{open:{last:30,scan:60,train:100},last:15,scan:8,scanEx:4,train:10,replay:1,cap:40,trainSec:180,trainBig:240,trainBigW:12},
    // ---- новые клетки поля (LVL, только главы 501+): монеты за открытую клетку; потолок — cap.cell ----
    // праздники (FEST, fest-zb.js читает в момент выдачи): lv — первая победа праздничного номера, web — паутинка своим словом, hw/ny — приз за весь праздник, bab — открытка Дня бабушек (≈630 💰 за год; вне потолков — раз в сезон)
    fest:{lv:15,web:1,hw:50,ny:100,bab:30}, /* zb-MERGE: просьба FEST к ECO */
    cells:{gold:5,secret:10,parcel:15,milk:3,word:20,def:3}, // word — тайное слово главы (сундучок, раз за главу): выдавать give('cellw') — вне потолка cell
    // ---- новичок и застрявший (NEWBIE): монет меньше цены буквы — бесплатная буква раз в every мин, не больше perDay в день ----
    poor:{every:6,below:35,perDay:3},
    // ---- потолки монет В ДЕНЬ по источнику (ZBECO.give); нет ключа — без потолка ----
    cap:{mg:20,mode:40,cell:30,shelf:60,card:60},
    // ---- реклама по нужде (≠ ×2): ----
    ad:{topUpMax:.3,topUpDay:2,       // «добить монеты до кабинета/облика»: нехватка ≤ 30 % цены, не больше 2 раз в день
      mgRun:1},                        // ролик в мини-игре — 1 за заход (MG0 host.adNeed)
    // ---- покупки (PAY_ITEMS в pay.js, витрина «Учительская» — zb-shop.js) ----
    pay:{uzelok:{id:'starter',vk:5,c:300,hb:5,days:3},  // «Узелок новичка» (бывш. «Гостинец от Зины» 8): первые days дней игры
      abon:{id:'abon',vk:15,days:30},                   // «Абонемент в библиотеку» на месяц (платная дорожка сезона — только красота) + season.abon.c
      remont:{id:'remont',vk:7}}                        // «Ремонт кабинета»: следующий уровень ВИДА одного кабинета (не силы)
  };
  // ---------- помощники ----------
  function S_(){return typeof S!=='undefined'?S:null;}
  E.day=function(){try{return todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}};
  E.now=function(){try{return nowMs();}catch(e){return Date.now();}};
  E.price=function(kind){try{if(typeof PRICE!=='undefined'&&PRICE[kind])return PRICE[kind];}catch(e){}return kind==='word'?E.word:E.letter;};
  E.cabOf=function(id){for(var i=0;i<E.cab.length;i++)if(E.cab[i].id===id)return E.cab[i];return null;};
  E.cabPrice=function(id,lv){var c=E.cabOf(id);return c&&lv>=1&&lv<=3?c.p[lv-1]:0;};
  // уровень кабинета у CAB (ZBCAB.lv(id) → 0–3); нет модуля CAB — 0
  E.cabLv=function(id){try{return window.ZBCAB&&ZBCAB.lv?(+ZBCAB.lv(id)||0):0;}catch(e){return 0;}};
  // заказ у Толика: цена со скидкой и часы пошива по уровню кабинета труда (lv — по умолчанию текущий)
  E.sewPrice=function(p,lv){if(lv==null)lv=E.cabLv('trud');var k=E.trud.disc[lv]||0;return k?Math.max(5,Math.round(p*(1-k)/5)*5):p;};
  E.sewHours=function(p,lv){if(lv==null)lv=E.cabLv('trud');var h=12;for(var i=0;i<E.trud.hours.length;i++)if(p<=E.trud.hours[i][0]){h=E.trud.hours[i][1];break;}return h*(E.trud.fast[lv]||1);};
  E.cabTotal=function(){var t=0;E.cab.forEach(function(c){t+=c.p[0]+c.p[1]+c.p[2];});return t;};
  // портфель дня {c, hb} — показывать заранее; t — дата (мс), по умолчанию сегодня; воскресенье — больше и 💡
  E.bagOf=function(t){var p=E.school.pf,sun=new Date(t||E.now()).getDay()===0;return {c:sun?p.sun:p.c,hb:sun?p.hb:0};};
  // счётчик дня
  function dayRec(){var s=S_();if(!s)return {};var d=E.day();if(!s.ecD||s.ecD.d!==d)s.ecD={d:d};return s.ecD;}
  E.left=function(src){var c=E.cap[src];if(!(c>0))return 1e9;return Math.max(0,c-(+dayRec()[src]||0));};
  E.give=function(src,n,why){n=Math.floor(+n||0);if(n<=0||!S_())return 0;var k=Math.min(n,E.left(src));if(k<=0)return 0;
    var r=dayRec();r[src]=(+r[src]||0)+k;
    var st=/^(lvl|ad|gift|chest|buy|quest)$/.test(why||'')?why:(src==='today'||src==='bag'||src==='back'?'quest':src==='buf'?'chest':why||src);
    if(typeof addCoins==='function')addCoins(k,st);else{S.coins=(+S.coins||0)+k;}
    return k;};
  // реклама «добить до цены»
  E.topUp=function(price){var s=S_();if(!s||!(price>0))return 0;var need=price-(+s.coins||0);if(need<=0)return 0;
    if(need>Math.ceil(price*E.ad.topUpMax))return 0;var d=E.day(),t=s.ecTop&&s.ecTop.d===d?+s.ecTop.n||0:0;return t<E.ad.topUpDay?need:0;};
  E.topUpTake=function(n){var s=S_();if(!s)return 0;var d=E.day();if(!s.ecTop||s.ecTop.d!==d)s.ecTop={d:d,n:0};s.ecTop.n++;
    if(n>0&&typeof addCoins==='function')addCoins(n,'ad');return n;};
  // Абонемент в библиотеку
  E.abonOn=function(){var s=S_();return !!(s&&s.ecAb&&+s.ecAb.to>E.now());};
  E.abonTo=function(){var s=S_();return s&&s.ecAb?+s.ecAb.to||0:0;};
  E.abonGive=function(){var s=S_();if(!s)return;var t=E.now(),a=s.ecAb||{to:0,n:0};a.to=Math.max(t,+a.to||0)+E.pay.abon.days*DAY;a.n=(+a.n||0)+1;s.ecAb=a;
    if(E.school.season.abon.c>0&&typeof payAdd==='function')payAdd(E.school.season.abon.c);ZB.emit('abon',a);};
  // Ремонт кабинета: куплено g, применено u; CAB тратит ZBECO.remontTake() → true
  E.remontLeft=function(){var s=S_();return s&&s.ecRm?Math.max(0,(+s.ecRm.g||0)-(+s.ecRm.u||0)):0;};
  E.remontGive=function(){var s=S_();if(!s)return;var r=s.ecRm||{g:0,u:0};r.g=(+r.g||0)+1;s.ecRm=r;ZB.emit('remont',r);};
  E.remontTake=function(){var s=S_();if(!E.remontLeft())return false;s.ecRm.u=(+s.ecRm.u||0)+1;if(typeof save==='function')save();return true;};
  // Узелок новичка — продаётся первые pay.uzelok.days дней игры (день первого запуска — S.soc.d0, иначе S.ecF)
  E.newbieDays=function(){var s=S_();if(!s)return 0;var d0=+(s.soc&&s.soc.d0)||+s.ecF||0;if(!d0)return 0;return Math.floor((E.now()-d0)/DAY);};
  E.uzelokOn=function(){var s=S_();if(!s)return false;if(s.buy&&s.buy.starter)return false;if(!(+(s.soc&&s.soc.d0)||+s.ecF))return true;return E.newbieDays()<E.pay.uzelok.days;};
  // ---------- «×2 за ролик» — убраны все пять (решение владельца 10.10; ~1 % нажатий на ~3 800 показов) ----------
  // Чужие файлы не правим: обёртки старых функций (function-объявления — свойства window). ZBECO.x2=true вернёт как было (до перезагрузки).
  // 1) победа: «Корзинка бабы Зины» (ролик раз в 5 побед — заменила ×2 после уровня) → не копится и не предлагается;
  // 2) гостинец ×2 (окно гостинца #lgAd и синяя #btnGift.adg в меню) → ECO.gift=0 (giftOn ложно), флаг Яндекса gift тоже гасится;
  // 3) банка: окно «Банка полна!» существовало только ради ролика → не открываем (монеты и фраза Зины — как без рекламы);
  // 4) сундук главы #mChX2 → окно главы рисуется как «ролика нет» (adLikely=false на время отрисовки);
  // 5) «×2 после уровня» (#mX2) в main уже заменён корзинкой (п. 1).
  function x2off(){return E.on&&E.x2===false;}
  function wrap(name,mk){var f=window[name];if(typeof f!=='function'||f.__zbEco)return;var w=mk(f);w.__zbEco=1;window[name]=w;}
  function x2Install(){
    try{if(x2off()&&typeof ECO!=='undefined')ECO.gift=0;}catch(e){}
    wrap('boxStep',function(f){return function(g,ok,skip){return x2off()?0:f.apply(this,arguments);};});
    wrap('jarFull',function(f){return function(){if(x2off())return;return f.apply(this,arguments);};});
    wrap('applyFlags',function(f){return function(){var r=f.apply(this,arguments);try{if(x2off()){ECO.gift=0;if(typeof updGift==='function')updGift();}}catch(e){}return r;};});
    wrap('openChapFinale',function(f){return function(g,r){if(!x2off()||(r&&r.chx2))return f.apply(this,arguments);
      var al=window.adLikely;window.adLikely=function(){return false;};
      try{return f.apply(this,arguments);}finally{window.adLikely=al;var b=document.getElementById('mChX2');if(b){b.remove();if(typeof fitChap==='function')ZB.safe('eco:fitChap',fitChap);}}};});
    try{if(typeof updGift==='function')updGift();}catch(e){}}
  x2Install();
  if(window.ZB)ZB.on('ready',function(){x2Install();}); // VIEW мог заменить функции окна позже — обернём новые
  // ---------- сохранение S.ec* ----------
  if(window.ZB)ZB.onSave({id:'eco',prefix:'ec',
    fix:function(S){if(!S.ecF)S.ecF=Date.now();
      if(S.ecRm&&typeof S.ecRm!=='object')S.ecRm=null;if(S.ecAb&&typeof S.ecAb!=='object')S.ecAb=null;},
    merge:function(S,d,newer){if(!d)return;
      // Абонемент — дальше «до»; ремонт — больше купленных/применённых; день выдачи — по дате, внутри дня max; первый запуск — раньше
      if(d.ecAb&&typeof d.ecAb==='object'){var a=S.ecAb||{to:0,n:0};S.ecAb={to:Math.max(+a.to||0,+d.ecAb.to||0),n:Math.max(+a.n||0,+d.ecAb.n||0)};}
      if(d.ecRm&&typeof d.ecRm==='object'){var r=S.ecRm||{g:0,u:0};S.ecRm={g:Math.max(+r.g||0,+d.ecRm.g||0),u:Math.max(+r.u||0,+d.ecRm.u||0)};}
      ['ecD','ecTop','ecP'].forEach(function(k){var x=d[k];if(!x||typeof x!=='object')return;var y=S[k];
        if(!y||+x.d>+y.d){S[k]=JSON.parse(JSON.stringify(x));return;}
        if(+x.d===+y.d)for(var f in x)if(f!=='d'&&typeof x[f]==='number')y[f]=Math.max(+y[f]||0,x[f]);});
      if(+d.ecF&&(!S.ecF||+d.ecF<+S.ecF))S.ecF=+d.ecF;
      // заказ у Толика: из более нового сохранения (null в новом = забрали заказ)
      if('ecSew' in d&&(newer||!S.ecSew))S.ecSew=d.ecSew&&typeof d.ecSew==='object'?JSON.parse(JSON.stringify(d.ecSew)):null;
    }});
})();
