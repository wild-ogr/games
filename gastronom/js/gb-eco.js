'use strict';
/* ================= gb-eco — GBECO: ВСЕ числа экономики буста «Гастроном №1: Образцовый» (10.10.2026, поток ECO, ветка gb-eco) =================
   Договор для всех потоков (logs/COMMON.md, logs/ECO.md). Хозяин — ECO. ИМЕНА полей не меняются; ЧИСЛА ECO может поправить по модели
   (tools/econ_gb.py) — поэтому своих чисел не пишите, читайте отсюда В МОМЕНТ ВЫЗОВА: `var E=window.GBECO||{}` (+ своё умолчание до слияния).
   Модуль не загрузился / выключен (GB.flag('eco')=false → GBECO.on=false) → игра как в main (старые PRICE/DAILY_REWARD в index.html).

   МОНЕТЫ С ПОТОЛКОМ ДНЯ: GBECO.give(src, n) → сколько реально дано (0 — упёрлись в потолок). src — ключ GBECO.cap
     ('mg' мини-игры ≤30/день, 'md' режимы ≤60/день) — нет в cap → без потолка.
     Пишет S.ecD {d, <src>: n}, монеты — через ern(src, n) (STAT earn; новые источники у TECH: mg, md, plan, seal, glass, dep, lg, qp, ret, rank).
     GBECO.left(src) — сколько ещё можно сегодня.
   УРОВЕНЬ: GBECO.lvlReward(st, g) — монеты за победу (index.html win() зовёт её; g — G: boss, glavk, mode, served).
   БУСТЕРЫ: GBECO.price(k) — живая цена (PRICE игры: undo/hint/mix/table/life); ЗАПАС бустеров (Авоська новичка, авоська дня, мини-игры, отделы):
     GBECO.boostAdd(k, n), GBECO.boostLeft(k), GBECO.boostTake(k) → true/false; игра сама тратит запас раньше монет (обёртка spend).
   ОТДЕЛЫ: GBECO.dep — массив 10 строк {id, n, rank (разряд GBM, с которого открыт), p:[ур.1, ур.2, ур.3]}; id — как у ART/META:
     bakaleya hleb steklo moloko gastro konditer ovoshi soki ryba zakaz. Для META у массива ещё поля: GBECO.dep.<id> = [p1,p2,p3], dep.branchK (филиал ×1,5),
     отдачи dep.hlebK [.3,.4,.5] (утренний завоз), dep.gastroB / dep.zakazB (монет за дефицит дня / заказ), dep.soki (газировка в день).
     GBECO.depPrice(id, lv, filial) — цена шага до уровня lv (1–3), filial — номер филиала (0 — свой; N → ×1,5^N). GBECO.depTotal() — 32 250.
     Стеклотара — GBECO.glass {h:[2,3,4] монет в час по уровню, cap:12 часов}.
   РАЗРЯДЫ: GBECO.rank {need[r]=[уровней, печатей], coins[r] — грамота монетами, starEvery — печатей на «Знамя ★N», star — монет за звезду знамени}.
   ПЛАН ДНЯ: GBECO.plan {need:3, of:5, norm:5, bag:40, bagSun:60, order:[4,6]}; GBECO.bagOf(dayKey) → {c, b:'hint'|'mix'|'table'|'undo', bn, t (подпись)} —
     авоська дня (видна заранее); GBECO.bagGive(dayKey, c) — выдать её (монеты + бустер в запас). Книга: GBECO.book.mgDay — благодарностей от мини-игр в день.
   МИНИ-ИГРЫ: GBECO.mg {st, cap, thanksDay, thanksPer, breakDay, tableDay, tableMax}, GBECO.give('mg', n) — потолок 30 в день.
   ЛИГА / СЕЗОН / РЕЖИМЫ: GBECO.lg, GBECO.qp, GBECO.md (форма — как DEF в gb-league.js / gb-season.js / gb-mode.js), монеты — give('lg'|'qp'|'md', n).
   ВЕРНУВШЕМУСЯ: GBECO.back [[дней, монет]…].
   РЕКЛАМА ПО НУЖДЕ (×2 НЕТ: GBECO.x2 === false): GBECO.topUp(price) → сколько монет добьёт ролик (0 — кнопку не показывать: нехватка > 30 % цены
     или исчерпан лимит дня); GBECO.topUpOpen(price, name, after) — готовое окно «Не хватает — добить за рекламу» (кнопка .rw, 📺, late);
     GBECO.topUpTake(n) — зачесть вручную. Новые кнопки рекламы — класс `rw`, 📺 в тексте, showRewarded(cb, onFail, late).
   ПОКУПКИ (PAY_ITEMS в index.html; витрина «Торг» — js/gb-torg.js): GBECO.pay.starter/prem/remont; GBECO.starterOn() — Авоська ещё продаётся;
     GBECO.premOn()/premTo() — «Премия за квартал» действует (LEAGUE рисует платную дорожку); GBECO.remontLeft()/remontTake() — жетоны «Ремонта отдела»
     (META/ART: применить к отделу); события GB.emit('prem'), GB.emit('remont'), GB.emit('starter').
   ДЕНЬ: GBECO.day() = dayKey(0) игры (часы сервера Яндекса / устройства), число ГГГГММДД.
   ПОЛЯ СОХРАНЕНИЯ ECO (S.ec*): ecD {d, src:n} выдано за день · ecTop {d, n} роликов «добить» · ecB {hint, mix, table, undo} запас бустеров ·
     ecPr {to, n} Премия до (мс)/куплено раз · ecRm {g, u} Ремонт: куплено/применено · ecSt 1 — Авоська новичка выдана · ecF — первый запуск (мс).
*/
(function(){
  var DAY=864e5;
  var E=window.GBECO={v:1,on:true,x2:false,
    start:60,                                   // монет у новичка (S.coins в index.html — как в main)
    // ---- уровень (как в main: 2·звёзды + ½ обслуженных; Ревизия ×2) ----
    lvl:{star:2,servedDiv:2,bossMul:2,glavkMul:3,vet:5,daily:30},
    streak:[5,5,10,10,15,20,40],                // серия дней задания дня (как в main, STREAK)
    chest:[[30,30],[25,20],[20,10]],            // грамота города: звёзд → монет (как в main, CHEST)
    // ---- отделы: 10 × 3, ур.2 = ×2,5, ур.3 = ×4 → 32 250 💰 (разбор 04 §2 А); rank — разряд открытия, как в GBM (1 = «3-го разряда») ----
    dep:[
      {id:'bakaleya',n:'Бакалея',          rank:1,p:[150,375,600]},
      {id:'hleb',    n:'Хлебный',          rank:2,p:[200,500,800]},
      {id:'steklo',  n:'Приём стеклотары', rank:2,p:[250,625,1000]},
      {id:'moloko',  n:'Молочный',         rank:3,p:[300,750,1200]},
      {id:'gastro',  n:'Гастрономия',      rank:4,p:[400,1000,1600]},
      {id:'konditer',n:'Кондитерский',     rank:5,p:[450,1125,1800]},
      {id:'ovoshi',  n:'Овощной',          rank:6,p:[500,1250,2000]},
      {id:'soki',    n:'Соки-воды',        rank:7,p:[600,1500,2400]},
      {id:'ryba',    n:'Рыбный',           rank:8,p:[650,1625,2600]},
      {id:'zakaz',   n:'Стол заказов',     rank:9,p:[800,2000,3200]}],
    filial:1.5,                                 // филиал (после «Гастронома №1 города»): цены отделов × filial^N
    // ---- стеклотара (META gb-dep.js): монет в час по уровню отдела [ур.1, ур.2, ур.3], копит не больше cap часов ----
    glass:{h:[2,3,4],cap:12},
    // ---- разряды (META gb-meta.js): need[r] = [уровней пройдено, печатей] для разряда r; coins[r] — грамота монетами; «Знамя ★N» — каждые starEvery печатей ----
    rank:{need:[[0,0],[15,2],[40,6],[70,11],[105,17],[145,24],[190,32],[230,41],[280,51],[320,57]],
      coins:[0,50,75,100,125,150,175,200,250,300],starEvery:8,star:150},
    // ---- «План на сегодня» (META gb-plan.js): 3 из 5 → печать + авоська дня ----
    plan:{need:3,of:5,norm:5,bag:40,bagSun:60,order:[4,6],              // авоська дня: монет (вс — bagSun); заказ соседа: троек от–до
      bagB:['table','hint','mix','hint','undo','mix','table'],bagBn:1,bagBnSun:2}, // бустер авоськи по дню недели (0 = вс) — в запас S.ecB
    // ---- мини-игры (MG0 gmg-core.js): монеты по звёздам 1/2/3, cap — потолок дня (= cap.mg); благодарностей в день; звёзд для благодарности в Перерыве;
    //      Перерывов с наградой в день; «Столик» за 3★ в Затее дня/Завозе в день и запас не больше; ролик «по нужде» за заход ----
    mg:{st:[0,5,10,15],cap:30,thanksDay:2,thanksPer:2,breakDay:3,tableDay:1,tableMax:2,adPerRun:1},
    // ---- Книга жалоб: благодарностей от мини-игр в день; 10 благодарностей = страница → вещь в зал (монет нет) ----
    book:{mgDay:2,page:10,c:0},
    // ---- «Соцсоревнование района» (LEAGUE gb-league.js): pay[дивизион][место 1–3] монет за неделю (Район, Город, Область, Союз); с уровня open ----
    lg:{pay:[[100,60,40],[150,90,60],[220,130,90],[320,190,120]],open:10,up:2,down:2},
    // ---- «Квартальный план» (LEAGUE gb-season.js): 30 ступеней по per очков; очки за уровень/★★★/Ревизию/задание дня/дело плана/печать/мини-игру/неделю лиги;
    //      free(k)/paid(k) — монеты ступени k на бесплатной / премиальной дорожке («Премия за квартал» — красота + монеты) ----
    qp:{steps:30,per:100,cap:300,lvl:10,star3:5,boss:10,daily:10,plan:10,seal:30,mg:15,lg:50,open:6,
      free:function(k){return k===30?80:k%5===0?30:10;},paid:function(k){return k===30?65:15;}},
    // ---- режимы (MODE gb-mode.js): open — с какого уровня; pr/fish — монеты за 1/2/3★; rush/mar/week — см. MODE; потолок дня cap.md ----
    md:{open:{priemka:12,rush:20,marathon:40,week:25,fish:10,sp:1500},pr:[[3,5,8],[4,7,11],[5,9,14]],rush:{per:1,all:10,runs:3},
      mar:{step:8,all:80},week:{step:10,all:50},fish:[8,12,20]},
    // ---- подарок вернувшемуся (META gb-back.js): не был ≥ N дней → монет ----
    back:[[3,100],[7,200],[14,300]],
    // ---- праздники (FEST fest-gb.js): монеты за праздничный уровень/звезду/карточку/подарок входа; без дневного потолка ----
    fest:{lvl:15,st:5,card:50,main:100,bab:60,gift:30,giftBig:50,ol:10},
    // ---- новичок (NEWBIE gb-newbie.js): подарок на 3-м уровне — фикус; уже есть — вещь не дороже decorMax; всё есть — gift 💰 ----
    nb:{gift:60,decorMax:100},
    // ---- потолки монет В ДЕНЬ по источнику (GBECO.give); нет ключа — без потолка ----
    cap:{mg:30,md:60},
    // ---- реклама по нужде (≠ ×2) ----
    ad:{from:6,topUpMax:.3,topUpDay:2,mgRun:1},
    boostMax:9,                                 // запас одного бустера (ecB) не больше
    // ---- покупки (PAY_ITEMS в index.html, витрина «Торг» — gb-torg.js) ----
    pay:{starter:{id:'starter',vk:5,c:300,hint:3,table:1,days:3},   // «Авоська новичка»: первые days дней игры, + бусы Вали (decor beads) и табличка «Ударник торговли»
      prem:{id:'prem',vk:15,days:30,c:0,track:500},                  // «Премия за квартал» на 30 дней; монеты (track ≈ qp.paid за 30 ступеней) — по ступеням дорожки LEAGUE, сразу c
      remont:{id:'remont',vk:7}},                                    // «Ремонт отдела»: жетон вида «как в Елисеевском» (только вид)
    // ---- темп для подписи «≈ N дней игры» в «Торге» (модель tools/econ_gb.py: казуал ≈ 230 💰 в день игры) ----
    dayIncome:230
  };
  // поля для META (читает GBECO.dep.<id> и т. п. — см. шапку)
  E.dep.forEach(function(d){E.dep[d.id]=d.p;});
  E.dep.branchK=E.filial;E.dep.hlebK=[.3,.4,.5];E.dep.gastroB=[20,35,50];E.dep.zakazB=[10,20,30];E.dep.soki=[10,15,20];
  // ---------- помощники ----------
  function S_(){return typeof S!=='undefined'?S:null;}
  function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
  function sv(){try{if(typeof save==='function')save();}catch(e){}}
  E.day=function(){try{return dayKey(0);}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}};
  E.now=function(){try{return nowMs();}catch(e){return Date.now();}};
  E.price=function(k){try{if(typeof PRICE!=='undefined'&&PRICE[k])return PRICE[k];}catch(e){}return {undo:10,hint:30,mix:40,table:60,life:60}[k]||0;};
  E.depOf=function(id){for(var i=0;i<E.dep.length;i++)if(E.dep[i].id===id)return E.dep[i];return null;};
  E.depPrice=function(id,lv,fil){var d=E.depOf(id);if(!d||!(lv>=1&&lv<=3))return 0;var p=d.p[lv-1];if(fil>0)p=Math.round(p*Math.pow(E.filial,fil)/10)*10;return p;};
  E.depTotal=function(fil){var t=0;E.dep.forEach(function(d){for(var l=1;l<=3;l++)t+=E.depPrice(d.id,l,fil);});return t;};
  E.daysOf=function(c){return Math.max(1,Math.round(c/E.dayIncome));};
  // монеты за уровень (index.html win(): reward)
  E.lvlReward=function(st,g){var L=E.lvl,r=L.star*st+Math.ceil(((g&&g.served)||0)/L.servedDiv);
    if(g&&g.glavk)r*=L.glavkMul;else if(g&&g.boss)r*=L.bossMul;return r;};
  // авоська дня — видна заранее: t — ключ дня ГГГГММДД (по умолчанию сегодня)
  var BNM={hint:['💡 подсказка','💡 hint'],mix:['🔀 «Смешать»','🔀 Shuffle'],table:['➕ Столик','➕ Table'],undo:['↶ отмена хода','↶ undo']};
  E.bagOf=function(t){var k=+t||E.day(),d=new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100,12).getDay(),P=E.plan,sun=d===0,b=P.bagB[d],bn=sun?P.bagBnSun:P.bagBn,
      lg=typeof LANG!=='undefined'&&LANG==='en'?1:0;
    return {c:sun?P.bagSun:P.bag,b:b,bn:bn,t:(bn>1?bn+' × ':'')+BNM[b][lg]};};
  // выдать авоську дня: монеты (без потолка) + бустер в запас; c — монет (META может прибавить торт кондитерского)
  E.bagGive=function(t,c){var o=E.bagOf(t),n=E.add(c>0?c:o.c,'seal');E.boostAdd(o.b,o.bn);return n;};
  // ---------- выдача монет с потолком дня ----------
  function dayRec(){var s=S_();if(!s)return {};var d=E.day();if(!isO(s.ecD)||s.ecD.d!==d)s.ecD={d:d};return s.ecD;}
  E.left=function(src){var c=E.cap[src];if(!(c>0))return 1e9;return Math.max(0,c-(+dayRec()[src]||0));};
  E.add=function(n,src){var s=S_();n=Math.floor(+n||0);if(!s||n<=0)return 0;
    try{if(typeof ern==='function')ern(src||'oth',n);}catch(e){}
    if(typeof setCoins==='function')setCoins((+s.coins||0)+n);else{s.coins=(+s.coins||0)+n;sv();}
    try{if(typeof SND!=='undefined'&&SND.coin)SND.coin();}catch(e){}return n;};
  E.give=function(src,n){n=Math.floor(+n||0);if(n<=0||!S_())return 0;var k=Math.min(n,E.left(src));if(k<=0)return 0;
    var r=dayRec();r[src]=(+r[src]||0)+k;return E.add(k,src);};
  // ---------- запас бустеров ----------
  var BK={undo:1,hint:1,mix:1,table:1};
  E.boostLeft=function(k){var s=S_();return s&&isO(s.ecB)?Math.max(0,+s.ecB[k]||0):0;};
  E.boostAdd=function(k,n){var s=S_();if(!s||!BK[k])return 0;if(!isO(s.ecB))s.ecB={};var was=+s.ecB[k]||0,v=Math.min(E.boostMax,was+(n||1));s.ecB[k]=v;sv();
    try{if(typeof updCoins==='function')updCoins();}catch(e){}return v-was;};
  E.boostTake=function(k){var s=S_();if(!E.boostLeft(k))return false;s.ecB[k]--;sv();return true;};
  // ---------- реклама «добить монеты до цены» ----------
  E.topUp=function(price){var s=S_();if(!E.on||!s||!(price>0))return 0;var need=price-(+s.coins||0);if(need<=0)return 0;
    if(need>Math.ceil(price*E.ad.topUpMax))return 0;try{if(typeof adOk==='function'&&!adOk())return 0;}catch(e){return 0;}
    var d=E.day(),t=isO(s.ecTop)&&s.ecTop.d===d?+s.ecTop.n||0:0;return t<E.ad.topUpDay?need:0;};
  E.topUpTake=function(n){var s=S_();if(!s)return 0;var d=E.day();if(!isO(s.ecTop)||s.ecTop.d!==d)s.ecTop={d:d,n:0};s.ecTop.n++;
    var k=E.add(n,'ad');try{STAT.ev('eco',{a:'top',n:n});}catch(e){}return k;};
  // готовое окно: «Не хватает N 💰 на «name»» + «📺 Добить N 💰 за рекламу»; after(true) — монеты добиты (вызывающий сам покупает)
  E.topUpOpen=function(price,name,after){var n=E.topUp(price);if(!n||typeof modal!=='function')return false;
    var t=typeof L==='function'?L:function(r){return r;};
    modal('<h2>'+t('Чуть-чуть не хватает','Just a little short')+'</h2><p>'+t('«'+name+'»: нужно '+price+' 💰, не хватает '+n+' 💰.','“'+name+'”: costs '+price+' 💰, you are '+n+' 💰 short.')+'</p>'+
      '<div class="row"><button class="btn accent rw" id="ecTop">'+t('📺 Добить '+n+' 💰 за рекламу','📺 Top up '+n+' 💰 for an ad')+'</button><button class="btn" id="ecTopNo">'+t('Отмена','Cancel')+'</button></div>');
    try{STAT.offer('top');}catch(e){}
    var paid=0,give=function(late){if(paid)return '';paid=1;E.topUpTake(n);if(!late&&after)GB.safe('eco:top',function(){after(true);});
      return typeof adLateMsg==='function'?adLateMsg(n):'';};
    document.getElementById('ecTopNo').onclick=function(){hideModal();};
    document.getElementById('ecTop').onclick=function(){hideModal();try{STAT.place('top');}catch(e){}showRewarded(function(){give();},null,function(){return give(1);});};
    return true;};
  // ---------- покупки ----------
  E.newbieDays=function(){var s=S_();if(!s)return 0;var d0=+(isO(s.soc)&&s.soc.d0)||+s.ecF||0;if(!d0)return 0;return Math.floor((E.now()-d0)/DAY);};
  E.starterOn=function(){var s=S_();if(!s||!E.on)return false;if(isO(s.buy)&&s.buy.starter)return false;return E.newbieDays()<E.pay.starter.days;};
  E.starterGive=function(){var s=S_();if(!s||s.ecSt)return;s.ecSt=1;var p=E.pay.starter;
    if(!isO(s.decor))s.decor={};if(!s.decor.beads)s.decor.beads=1;else if(typeof payAdd==='function')payAdd(100); // бусы уже есть — их цена монетами
    E.boostAdd('hint',p.hint);E.boostAdd('table',p.table);if(window.GB)GB.emit('starter',{});};
  E.premOn=function(){var s=S_();return !!(s&&isO(s.ecPr)&&+s.ecPr.to>E.now());};
  E.premTo=function(){var s=S_();return s&&isO(s.ecPr)?+s.ecPr.to||0:0;};
  E.premGive=function(){var s=S_();if(!s)return;var t=E.now(),a=isO(s.ecPr)?s.ecPr:{to:0,n:0};a.to=Math.max(t,+a.to||0)+E.pay.prem.days*DAY;a.n=(+a.n||0)+1;s.ecPr=a;
    if(E.pay.prem.c>0&&typeof payAdd==='function')payAdd(E.pay.prem.c);if(window.GB)GB.emit('prem',a);};
  E.remontLeft=function(){var s=S_();return s&&isO(s.ecRm)?Math.max(0,(+s.ecRm.g||0)-(+s.ecRm.u||0)):0;};
  E.remontGive=function(){var s=S_();if(!s)return;var r=isO(s.ecRm)?s.ecRm:{g:0,u:0};r.g=(+r.g||0)+1;s.ecRm=r;if(window.GB)GB.emit('remont',r);};
  E.remontTake=function(){var s=S_();if(!E.remontLeft())return false;s.ecRm.u=(+s.ecRm.u||0)+1;sv();return true;};
  // товары в PAY_ITEMS: give — выдача (PAY.give зовёт it.give()). Цены голосов — E.pay (= hobby-pay catalog.json ветки gb-pay)
  function payInstall(){if(typeof PAY_ITEMS==='undefined')return;var P=E.pay;
    PAY_ITEMS.starter={perm:1,bonus:P.starter.c,vk:P.starter.vk,ic:'🛍',name:'Авоська новичка',
      desc:P.starter.c+' 💰, бусы для тёти Вали, '+P.starter.hint+' подсказки, Столик и табличка «Ударник торговли»',give:E.starterGive,done:'Авоська ваша — спасибо!',
      en:{name:'Newcomer\'s string bag',desc:P.starter.c+' 💰, beads for Aunt Valya, '+P.starter.hint+' hints, a Table and a “Shock Worker of Trade” sign',done:'The bag is yours — thank you!'}};
    PAY_ITEMS.prem={vk:P.prem.vk,ic:'🏅',name:'Премия за квартал',desc:'На '+P.prem.days+' дней: золотая дорожка «Квартального плана» — вывеска, наряд тёти Вали, золотые рамки и до '+P.prem.track+' 💰 по ступеням',
      give:E.premGive,done:'Премия выписана — спасибо!',
      en:{name:'Quarterly bonus',desc:P.prem.days+' days of the golden Quarterly Plan track — sign, Aunt Valya\'s outfit, gold frames and up to '+P.prem.track+' 💰 along the way',done:'Bonus issued — thank you!'}};
    PAY_ITEMS.remont={vk:P.remont.vk,ic:'🏛',name:'Ремонт отдела',desc:'Мрамор, зеркала и лепнина «как в Елисеевском» — для одного отдела. Только красота',
      give:E.remontGive,done:'Бригада уже выехала — спасибо!',
      en:{name:'Department makeover',desc:'Marble, mirrors and moulding, grand-store style — for one department. Looks only',done:'The crew is on its way — thank you!'}};
    // VK: каталог мог собраться раньше нас (PAY.initVK берёт ключи PAY_ITEMS) — допишем новые товары
    try{if(typeof PAY!=='undefined'&&PAY.v&&Array.isArray(PAY.list))['starter','prem','remont'].forEach(function(id){if(!PAY.item(id))PAY.list.push({id:id});});}catch(e){}}
  // ---------- «×2 за ролик» — убран (решение владельца 10.10: 410 показов → 8 досмотров); X2_ON=false в index.html ----------
  function x2Off(){try{if(E.on&&E.x2===false&&typeof X2_ON!=='undefined')X2_ON=false;}catch(e){}}
  // ---------- обёртки старых функций (function-объявления — свойства window) ----------
  function wrap(name,mk){var f=window[name];if(typeof f!=='function'||f.__gbEco)return;var w=mk(f);w.__gbEco=1;window[name]=w;}
  function install(){
    x2Off();
    // запас бустеров тратится раньше монет
    wrap('spend',function(f){return function(kind,then){if(E.on&&BK[kind]&&E.boostTake(kind)){try{STAT.ev('spend',{k:kind,c:0,f:'stock'});}catch(e){}
        try{toast((typeof L==='function'?L('Из запаса: ','From stock: '):'Из запаса: ')+(typeof BNAME!=='undefined'?BNAME[kind]:kind)+' · '+E.boostLeft(kind));}catch(e){}then();try{updCoins();}catch(e){}return;}
      return f.apply(this,arguments);};});
    // на кнопках бустеров — «🎁 N» вместо цены, пока есть запас
    wrap('updCoins',function(f){return function(){var r=f.apply(this,arguments);if(!E.on)return r;
      [['pUndo','undo'],['pHint','hint'],['pMix','mix'],['pTable','table']].forEach(function(x){var el=document.getElementById(x[0]),n=E.boostLeft(x[1]);
        if(el&&n&&!(x[1]==='undo'&&typeof G!=='undefined'&&G&&G.freeUndo))el.textContent='🎁 '+n;});return r;};});
    // межэкранная: на 6-м уровне в окне победы и так «открылось задание дня» + магазин — первая межэкранная переезжает на 7-й (решение ECO, NEWBIE)
    wrap('adDue',function(f){return function(){if(E.on&&typeof G!=='undefined'&&G&&!G.daily&&G.idx===E.ad.from-1)return false;return f.apply(this,arguments);};});
  }
  // ---------- сохранение S.ec* ----------
  function fix(s){if(!s.ecF)s.ecF=Date.now();['ecD','ecTop','ecB','ecPr','ecRm'].forEach(function(k){if(k in s&&!isO(s[k]))delete s[k];});
    if(isO(s.ecB))for(var k in s.ecB)if(!BK[k]||!(+s.ecB[k]>0))delete s.ecB[k];}
  function merge(s,d,newer){if(!isO(d))return;
    if(isO(d.ecPr)){var a=isO(s.ecPr)?s.ecPr:{to:0,n:0};s.ecPr={to:Math.max(+a.to||0,+d.ecPr.to||0),n:Math.max(+a.n||0,+d.ecPr.n||0)};}
    if(isO(d.ecRm)){var r=isO(s.ecRm)?s.ecRm:{g:0,u:0};s.ecRm={g:Math.max(+r.g||0,+d.ecRm.g||0),u:Math.max(+r.u||0,+d.ecRm.u||0)};}
    ['ecD','ecTop'].forEach(function(k){var x=d[k];if(!isO(x))return;var y=s[k];
      if(!isO(y)||+x.d>+y.d){s[k]=JSON.parse(JSON.stringify(x));return;}
      if(+x.d===+y.d)for(var f in x)if(f!=='d'&&typeof x[f]==='number')y[f]=Math.max(+y[f]||0,x[f]);});
    // запас бустеров: из более нового сохранения (тратится и пополняется — максимум дал бы лишнее)
    if(isO(d.ecB)&&(newer||!isO(s.ecB)))s.ecB=JSON.parse(JSON.stringify(d.ecB));
    if(d.ecSt)s.ecSt=1;
    if(+d.ecF&&(!s.ecF||+d.ecF<+s.ecF))s.ecF=+d.ecF;}
  // ---------- запуск ----------
  E.on=!window.GB||GB.flag('eco');
  if(E.on){payInstall();install();}
  if(window.GB){GB.onSave({id:'eco',prefix:'ec',fix:fix,merge:merge});
    GB.on('ready',function(){if(E.on)install();});} // VIEW мог заменить функции позже — обернём новые
})();
