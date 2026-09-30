/* ================= «Из ларька в магнаты: бизнес» — из грязи в князи: подработка, малый и средний бизнес, первый карьер (без DOM) =================
   Грузится сразу после econ.js (и в симуляторе, JavaScriptCore). Дополняет ECON: хуки bizDay/bizClose/bizTax/bizBal/bizLoanLimit/bizLoanRate/bizAdvise,
   действия (все — f(W,…), их можно звать через GAME.act) и справочники GIGS/BIZ. Спецификация — hobby-analytics/24-magnat-rags-to-riches.md.
   Главы W.st: gig «Карьера» (подработка) → small «Своё дело» (ИП, точки) → mid «Сеть» (ООО, сети, склад-опт, стройбаза, самосвалы)
   → quarry «Карьер» (торги ОПИ, песчаный/щебёночный карьер) → nedra (ECON.initNedra: взнос партнёра, ОСНО, обучение недр).
   Общий ресурс — «руки» (✋): основная работа, заказ, точка без управляющего. Никакого тапанья: заказ идёт временем.
   Учёт — те же статьи econ: выручка rev/sales, товар и сырьё cogs/supp (запас точки — актив, как склад), аренда и зарплаты fix,
   жизнь, взносы ИП, бухгалтер adm, доставка log, штрафы и списания oth, открытие точки capex (НЗС → ОС), лицензия ОПИ lic (НМА),
   продажа точки asale (+/− к балансовой — в oth), взнос партнёра eqin. Сегменты — W.mon.sg[seg] = {rev, e}. Баланс сходится всегда. */
(function(root){
'use strict';
const E=root.ECON,_=E._,{pay,recv,pl,news,R,RR,rnd0,clamp}=_;
const DAYS=30;
const L2=(ru,en)=>({ru,en});

/* ---------------- справочники ---------------- */
// жизнь в месяц (комната, еда, проезд) — «постоянные расходы» человека; в «Сети» — «жизнь председателя»
const LIFE={gig:38000,small:45000,mid:150000,quarry:150000,nedra:150000};
const JOB_PAY=52000,JOB_BACK=45000,IP_FEE=4750,ACC_OOO=90000,NPD=.04,OPD_WAGE=150000,AUDIT=30000;
// оператор вендинга (спецификация 3.2, 3.4): до VEND_SELF автоматов хозяин обслуживает сам (без руки), дальше нужны операторы — 40 тыс./мес на 10 автоматов,
// в учёте — 4 тыс./мес на каждый автомат (статья fix, сегмент «Розница»); оператор чинит сам — поломка без простоя
const VEND_SELF=5,VEND_OP=40000;
// места для автоматов в городе не бесконечны: лучшие заняты первыми, каждый следующий автомат стоит в месте похуже (−VEND_SAT к спросу за номер)
const VEND_SAT=.012;
function vendSpot(W,b){const a=W.biz.filter(x=>x.t==='vend'&&x.c===b.c);let i=a.indexOf(b);if(i<0)i=a.length;return 1-VEND_SAT*Math.min(i,29);}
function vendOps(W,extra){const n=W.biz.filter(b=>b.t==='vend').length+(extra||0);return n>VEND_SELF?Math.ceil(n/10):0;}
const CITY={kuz:{rent:1,dem:1},ural:{rent:1.25,dem:1.2},kar:{rent:.9,dem:.9,tour:1.15}};
// заказы: days — сколько идут, en — силы при взятии, pay — «на руки» по уровням (1…5)
const GIGS={
  flyer:{ico:'📄',n:'Промоутер: листовки у метро',en:'Promoter: flyers at the metro',who:['Агентство «Листок»','Leaflet Agency'],days:1,e:15,pay:[1200,1300,1400,1500,1600]},
  courier:{ico:'🚲',n:'Курьер, смена',en:'Courier shift',who:['Служба доставки «Быстро»','Quick Delivery'],days:1,e:25,pay:[3100,3250,3400,3550,3700]},
  article:{ico:'✍',n:'Статья на заказ',en:'Article to order',who:['Биржа текстов «Слово»','Word Text Exchange'],days:3,e:10,pay:[400,1200,2400,3600,5000]},
  taxi:{ico:'🚕',n:'Такси, смена 10 ч',en:'Taxi, 10-hour shift',who:['Таксопарк «Шашечки»','Checkers Cab Fleet'],days:1,e:30,pay:[2700,2800,2900,3000,3100]},
  loader:{ico:'📦',n:'Грузчик, переезд',en:'Mover, house move',who:['Семья Петровых','The Petrov family'],days:1,e:40,pay:[4800,5000,5200,5400,5600]},
  handy:{ico:'🔧',n:'Мастер на час',en:'Handyman for an hour',who:['Сервис «Руки на месте»','Handy Hands Service'],days:1,e:20,pay:[4500,4700,4900,5100,5300]},
  tutor:{ico:'📚',n:'Репетитор, 4 занятия',en:'Tutor, 4 lessons',who:['Родители ученика','A pupil’s parents'],days:4,e:35,pay:[8000,8400,8800,9200,9600]},
  resale:{ico:'🏷',n:'Перепродажа на сайте объявлений',en:'Resale on a classifieds site',who:['Витёк подсказал','Tip from Vityok'],days:5,e:5,pay:[0,0,0,0,0]},
  /* 28.09 «накинуть работ» (владелец): у каждого — характер, мини-решение ch (первый вариант — обычный, второй — смелый: {p: ×оплата, e: +силы, d: +дни, r: ×риск}),
     сезон mo (месяцы 0…11; hi — месяцы, когда заказов больше и платят +20 %), требования req {eq: снаряжение, rt: ⭐, n: заказов всего, lv:[вид, уровень]},
     риск risk [вероятность, вид (pen — штраф amt ₽, cut — оплата ×amt, out — больничный amt дней), amt, почему], c — прямые затраты (аренда костюма).
     Ставки — регион РФ 2026 «на руки»: ночная смена склада 12 ч 4–5 тыс., выгул 350–450 ₽ за прогулку, помощь пожилым ~2 тыс./день, официант на банкете 3,5–4,5 тыс. + чаевые,
     фотосъёмка 2–3 ч 6–8 тыс., ремонт телефонов ~1,5 тыс. за работу, дачник 350 ₽/ч, Дед Мороз 2,5–3 тыс. за выезд (агентство берёт долю), онлайн-урок 1,5 тыс., сборка мебели 8–10 % цены. */
  night:{ico:'🌙',n:'Склад маркетплейса: ночная смена',en:'Marketplace warehouse: night shift',who:['Склад «Всё рядом»','“All Nearby” warehouse'],days:1,e:40,pay:[4200,4350,4500,4650,4800],hi:[10,11],
    risk:[.05,'pen',1500,'mix'],ch:[['n','Обычная норма','Standard quota',{}],['x','Двойная норма: оплата ×1,5','Double quota: pay ×1.5',{p:1.5,e:15,r:2}]]},
  dog:{ico:'🐕',n:'Выгул собак, 2 дня',en:'Dog walking, 2 days',who:['Соседи по подъезду','Neighbours in your block'],days:2,e:12,pay:[1600,1700,1800,1900,2000],req:{rt:4.6},
    risk:[.05,'cut',.5,'leash'],ch:[['1','Одна собака','One dog',{}],['3','Сразу три собаки: ×2,2','Three dogs at once: ×2.2',{p:2.2,e:12,r:3}]]},
  nurse:{ico:'👵',n:'Помощь пожилой соседке, 5 дней',en:'Helping an elderly neighbour, 5 days',who:['Дочь соседки','The neighbour’s daughter'],days:5,e:45,pay:[8500,8800,9100,9400,9700],req:{rt:4.7,n:15},
    risk:[.05,'cut',.8,'short'],ch:[['d','Днём: магазин, аптека, уборка','Daytime: shopping, pharmacy, cleaning',{}],['n','С ночёвкой: оплата ×1,5','Staying overnight: pay ×1.5',{p:1.5,e:20}]]},
  wed:{ico:'🍽',n:'Официант на свадьбе',en:'Wedding waiter',who:['Банкетный зал «Лебедь»','“Swan” banquet hall'],days:1,e:35,pay:[4000,4150,4300,4450,4600],mo:[5,6,7,8],
    risk:[.05,'pen',1000,'dish'],ch:[['s','Смена до 23:00','Shift till 11 pm',{}],['l','До последнего гостя: +чаевые','Till the last guest: + tips',{p:1.45,e:15}]]},
  photo:{ico:'📷',n:'Фотосъёмка: праздник или семья',en:'Photo shoot: a party or a family',who:['Семья Орловых','The Orlov family'],days:2,e:30,pay:[6000,6300,6600,6900,7200],req:{eq:'camera'},
    risk:[.04,'cut',.5,'card'],ch:[['q','Быстро: 50 кадров без ретуши','Quick: 50 shots, no retouching',{}],['r','С ретушью: ×1,6, на день дольше','Retouched: ×1.6, one more day',{p:1.6,d:1,e:10}]]},
  phone:{ico:'📱',n:'Ремонт телефонов, день',en:'Phone repairs, one day',who:['Мастерская «Контакт»','“Contact” workshop'],days:1,e:20,pay:[3500,3700,3900,4100,4300],req:{eq:'tool',lv:['handy',3]},
    risk:[.05,'pen',2000,'ret'],ch:[['o','Запчасти получше','Better spare parts',{}],['c','Дешёвые копии: ×1,4, но возвраты','Cheap copies: ×1.4, but returns',{p:1.4,r:3}]]},
  dacha:{ico:'🌱',n:'Дачные работы, 2 дня',en:'Country garden work, 2 days',who:['Дачник Семёныч','Semyonych the gardener'],days:2,e:45,pay:[5400,5600,5800,6000,6200],mo:[3,4,5,6,7,8,9],minE:50,
    risk:[.04,'out',2,'back'],ch:[['g','Покос и грядки','Mowing and garden beds',{}],['f','И забор поправить: ×1,6','Fix the fence too: ×1.6',{p:1.6,d:1,e:15}]]},
  santa:{ico:'🎅',n:'Дед Мороз на праздник',en:'Father Frost for a party',who:['Агентство «Чудо»','“Miracle” agency'],days:1,e:30,pay:[6500,6800,7100,7400,7700],mo:[11],c:1500,
    risk:[.08,'cut',.7,'late2'],ch:[['3','Три выезда','Three visits',{}],['6','Шесть выездов: ×1,8','Six visits: ×1.8',{p:1.8,e:20,r:2}]]},
  online:{ico:'💻',n:'Репетитор онлайн, 4 занятия',en:'Online tutor, 4 lessons',who:['Школа «Умник онлайн»','“Smart Online” school'],days:4,e:30,pay:[6000,6300,6600,6900,7200],req:{eq:'laptop',rt:4.6},
    risk:[.1,'cut',.75,'cancel'],ch:[['1','Один ученик','One pupil',{}],['g','Мини-группа из трёх: ×1,8','A mini-group of three: ×1.8',{p:1.8,e:15,r:1.5}]]},
  furn:{ico:'🔨',n:'Сборка мебели',en:'Furniture assembly',who:['Мебельный салон «Уют»','“Cosy” furniture store'],days:1,e:25,pay:[3800,3950,4100,4250,4400],req:{eq:'tool'},
    risk:[.05,'pen',2500,'damage'],ch:[['c','Комод и полки','A chest of drawers and shelves',{}],['w','Шкаф-купе: ×1,7','A sliding wardrobe: ×1.7',{p:1.7,e:15,r:2}]]}
};
const GL2=Object.keys(GIGS);
// имущество для работы (ОС): life — месяцев
const EQ={laptop:{ico:'💻',n:'Ноутбук (б/у)',en:'Laptop (used)',c:25000,life:36},bike:{ico:'🚲',n:'Велосипед',en:'Bicycle',c:18000,life:36},
  tool:{ico:'🧰',n:'Инструмент',en:'Tool kit',c:15000,life:36},camera:{ico:'📷',n:'Фотоаппарат с объективом (б/у)',en:'Camera with a lens (used)',c:60000,life:48},
  car:{ico:'🚗',n:'Машина (б/у)',en:'Car (used)',c:650000,life:60}};
/* уровни опыта по видам заказов (28.09, владелец: «уровень с 5 поднять»): 1…10. Порог — заказов этого вида: 5, 10, 15, 20 (как было), дальше 30, 42, 56, 72, 90.
   Оплата после 5-го растёт плавно: +3 % за уровень. Плюсы высоких уровней: 6 — постоянный клиент платит 89 % (было 85), 7 — премиум-заказы (+25 %) и без ⭐ 4,85 (реже — каждый 4-й),
   8 — риск срыва вдвое ниже, 9 — постоянный клиент платит 93 %, 10 — «мастер своего дела» (+4 % сверху). Рейтинг ⭐ по-прежнему до 5. */
const LV_N=[0,5,10,15,20,30,42,56,72,90],LV_MAX=10;
function payAt(t,l){const p=GIGS[t].pay;return l<=5?p[l-1]:Math.round(p[4]*(1+.03*(l-5))/50)*50;}
function autoK(l){return l>=9?.93:l>=6?.89:.85;}
// покупки за 💎 (28.09, владелец): 4-я и 5-я рука, запас сил до 160 — хранятся в S.pk (hand, enx: облако — «больший», переживают IPO и «начать заново»), в мире — копия W.pk
const HAND_CR=[60,150],EN_CR=[40,80,140],EN_STEP=20;
function hx(W){const p=W&&W.pk;const n=p&&typeof p.hand==='number'?p.hand:0;return Math.max(0,Math.min(HAND_CR.length,Math.floor(n)));}
function ex(W){const p=W&&W.pk;const n=p&&typeof p.enx==='number'?p.enx:0;return Math.max(0,Math.min(EN_CR.length,Math.floor(n)));}
function enMax(W){return 100+EN_STEP*ex(W);}
// бизнесы: cap — вложения, days — дней до открытия, life — срок службы (мес.), hand — сколько рук занимает без управляющего,
// rent/staff — аренда и персонал в месяц, mw — зарплата управляющего, R — выручка/мес. при «средних» условиях, v — переменные (доля выручки),
// sd — запас товара (дней себестоимости), st — глава, с которой открывается, need — условие открытия, max — точек на город
const BIZ={
  // кофейный автомат б/у — 100 тыс. (было 150 тыс.): первое дело на 10–13-й минуте первой игры (день главы 1 — 20 с), рынок б/у автоматов 80–120 тыс.; выручка 32 тыс./мес. (было 34) — окупаемость ≈ 10 мес.
  vend:{seg:'retail',ico:'☕',n:'Кофейный автомат',en:'Coffee vending machine',cap:100e3,days:3,life:48,hand:0,rent:0,staff:0,mw:0,R:32e3,v:.30,sd:7,st:'small',max:30,
    knob:{k:'place',o:[['office','Офис','Office',{d:.6,f:5e3}],['clinic','Поликлиника','Clinic',{d:1,f:12e3}],['station','Вокзал','Station',{d:1.6,f:25e3,rk:.08,rc:25e3}]],def:'clinic'}},
  kiosk:{seg:'retail',ico:'🏪',n:'Ларёк у остановки',en:'Bus-stop kiosk',cap:450e3,days:10,life:60,hand:1,rent:25e3,staff:20e3,mw:35e3,sd:10,st:'small',max:10,need:{have:'vend'},
    // ассортимент (28.09: 7 наборов, без табака и алкоголя): R — выручка при «родной» наценке m0, e — чувствительность спроса к наценке, sp — порча, sd — запас (дней), sea — сезон
    knob:{k:'set',list:1,o:[['snack','Напитки и снеки','Drinks & snacks',{R:330e3,m0:.35,e:3.5}],['food','Продукты у дома','Groceries',{R:420e3,m0:.25,e:4,sp:.03}],['ice','Мороженое и лимонады','Ice cream & lemonade',{R:280e3,m0:.4,e:3,ice:1,sea:'ice'}],
      ['bake','Выпечка и чай','Pastries & tea',{R:300e3,m0:.45,e:3,sp:.08,sd:2}],['flw','Цветы и открытки','Flowers & cards',{R:220e3,m0:.6,e:2.5,sp:.12,sd:3,sea:'hol'}],
      ['home','Хозтовары и мелочи','Household bits & bobs',{R:240e3,m0:.5,e:2,sd:30}],['dacha','Семена и всё для дачи','Seeds & garden goods',{R:260e3,m0:.45,e:2.5,sd:20,sea:'dacha'}]],def:'snack'},
    sl:{k:'mk',min:15,max:50,def:35}},
  shaw:{seg:'retail',ico:'🥙',n:'Шаурма',en:'Shawarma stand',cap:900e3,days:14,life:60,hand:1,rent:60e3,staff:90e3,mw:65e3,R:650e3,v:.6,sd:2,st:'small',max:8,need:{have:'kiosk',or:1e6},
    knob:{k:'meat',o:[['d1','Мяса на 1 день','Meat for 1 day',{d:.85,sp:.005,sd:1}],['d2','На 2 дня','For 2 days',{d:1,sp:.02,sd:2}],['d3','На 3 дня','For 3 days',{d:1.04,sp:.06,sd:3}]],def:'d2'},
    k2:{k:'san',o:[['norm','Санитария: обычная','Hygiene: standard',{f:0,fine:.25}],['strict','Санитария: строгая','Hygiene: strict',{f:8e3,fine:.03}]],def:'norm'}},
  flow:{seg:'retail',ico:'💐',n:'Цветочный павильон',en:'Flower stall',cap:600e3,days:10,life:60,hand:1,rent:40e3,staff:76e3,mw:65e3,R:330e3,v:.45,sd:3,st:'small',max:6,need:{have:'kiosk'},
    knob:{k:'buy',o:[['low','К празднику: мало','Holiday stock: low',{hb:.55}],['norm','Норма','Normal',{hb:1}],['high','Много','High',{hb:1.4}]],def:'norm'}},
  pvz:{seg:'serv',ico:'📦',n:'Пункт выдачи заказов',en:'Parcel pick-up point',cap:1e6,days:10,life:60,hand:1,rent:45e3,staff:60e3,mw:65e3,R:3.5e6,v:0,sd:0,st:'small',max:12,need:{cap:5e5},
    knob:{k:'mkt',o:[['m1','«Маркет-1»: 5 %','“Market-1”: 5%',{rate:.05,d:1.15,fine:.12}],['m2','«Маркет-2»: 4,5 %','“Market-2”: 4.5%',{rate:.045,d:1,fine:.06}],['m3','«Маркет-3»: 4 %','“Market-3”: 4%',{rate:.04,d:.9,fine:.02}]],def:'m2'},
    k2:{k:'cam',o:[['no','Без камер','No cameras',{f:0,fm:1}],['yes','Камеры и второй сотрудник','Cameras & 2nd clerk',{f:40e3,fm:1/6}]],def:'no'}},
  coffee:{seg:'retail',ico:'🥤',n:'Кофе с собой',en:'Coffee to go',cap:700e3,days:14,life:60,hand:1,rent:0,staff:0,mw:65e3,R:330e3,v:.45,sd:7,st:'small',max:8,need:{cap:1e6},
    knob:{k:'place',o:[['mall','Островок в ТЦ','Mall kiosk',{d:1,f:50e3}],['metro','У метро','By the metro',{d:1.35,f:120e3}],['bc','Бизнес-центр','Business centre',{d:1.1,f:70e3}]],def:'mall'},
    k2:{k:'bar',o:[['jr','Бариста-стажёры','Trainee baristas',{f:70e3,d:1}],['pro','Опытные бариста','Experienced baristas',{f:120e3,d:1.25}]],def:'jr'}},
  wash:{seg:'serv',ico:'🚿',n:'Мойка самообслуживания',en:'Self-service car wash',cap:5e6,days:30,life:96,hand:.5,rent:60e3,staff:45e3,mw:45e3,R:420e3,v:.25,sd:0,st:'small',max:5,need:{cap:3e6},
    sl:{k:'pr',min:25,max:45,def:35}},
  tire:{seg:'serv',ico:'🛞',n:'Шиномонтаж',en:'Tyre service',cap:1.2e6,days:14,life:72,hand:1,rent:50e3,staff:0,mw:65e3,R:343e3,v:.6,sd:0,st:'small',max:4,need:{cap:1.5e6},
    knob:{k:'stock',o:[['s0','Шины к сезону: не берём','Season tyres: none',{S:0}],['s1','На 0,5 млн','For 0.5 m',{S:5e5}],['s2','На 1,5 млн','For 1.5 m',{S:1.5e6}]],def:'s0'}},
  sto:{seg:'serv',ico:'🛠',n:'Автосервис на 3 поста',en:'Car service, 3 bays',cap:4.5e6,days:30,life:96,hand:1,rent:150e3,staff:0,mw:80e3,R:1.15e6,v:.433,sd:5,st:'small',max:3,need:{cap:4e6},
    knob:{k:'pct',o:[['p40','Мастерам 40 %','Mechanics 40%',{p:.4,d:.85,drt:-.05}],['p45','45 %','45%',{p:.45,d:1,drt:0}],['p50','50 %','50%',{p:.5,d:1.06,drt:.05}]],def:'p45'}},
  gazel:{seg:'logi',ico:'🚚',n:'Газель: грузоперевозки',en:'Light van: haulage',cap:3.2e6,days:7,life:84,hand:1,rent:5e3,staff:0,mw:70e3,R:380e3,v:.45,sd:0,st:'small',max:20,need:{cap:2e6},
    knob:{k:'src',o:[['agg','Заказы с агрегатора','Orders from an app',{ld:.75,cm:.15,f:0}],['own','Свои клиенты','Own clients',{cm:0,f:15e3}]],def:'agg'}},
  /* 28.09 «больше бизнесов» (владелец): 8 малых дел, у каждого своя главная ручка; окупаемость 17–23 мес. при лучшей ручке (дольше первых дел: иначе малый бизнес
     растёт без предела и «Сеть»/недра наступают на 1–2 реальных дня раньше — tools/sim-rags.js). gen — общая формула: выручка = R × спрос × d × p (цена) × сезон,
     переменные = выручка × v (vp — на единицу товара: при низкой цене доля выше), + f к постоянным, rs — чувствительность к ⭐, rk/rc — риск. Регион РФ 2026. */
  barber:{seg:'serv',ico:'💈',n:'Барбершоп на 3 кресла',en:'Barbershop, 3 chairs',cap:2.5e6,days:21,life:72,hand:1,rent:45e3,staff:0,mw:60e3,R:330e3,v:.47,sd:0,st:'small',max:3,need:{cap:1.5e6},gen:1,
    knob:{k:'lvl',o:[['eco','Эконом: стрижка 700 ₽','Budget: 700 ₽ a cut',{d:1.3,p:.7}],['mid','Средний: 1 100 ₽','Mid-range: 1,100 ₽',{d:1,p:1}],['top','Премиум: 1 700 ₽ и кофе гостям','Premium: 1,700 ₽ and coffee for guests',{d:.66,p:1.55,f:15e3,rs:.25}]],def:'mid'}},
  bakery:{seg:'retail',ico:'🥐',n:'Пекарня у дома',en:'Neighbourhood bakery',cap:3.2e6,days:30,life:84,hand:1,rent:60e3,staff:110e3,mw:65e3,R:520e3,v:.38,sd:2,st:'small',max:3,need:{have:'coffee',or:2.5e6},gen:1,
    knob:{k:'bake',o:[['lo','Печём мало — к обеду пусто','Bake little — empty by lunch',{d:.82,sp:.01}],['mid','Норма','Normal',{d:1,sp:.05}],['hi','С запасом — полные полки','Extra — full shelves',{d:1.07,sp:.16}]],def:'mid'}},
  canteen:{seg:'retail',ico:'🍲',n:'Столовая у завода',en:'Factory canteen',cap:4e6,days:30,life:84,hand:1,rent:80e3,staff:260e3,mw:70e3,R:900e3,v:.45,vp:1,sd:3,st:'small',max:2,need:{have:'shaw',or:3e6},gen:1,
    knob:{k:'menu',o:[['c','Комплексный обед 250 ₽','Set lunch 250 ₽',{d:1.25,p:.72}],['m','Обед 350 ₽','Lunch 350 ₽',{d:1,p:1}],['p','Обед 450 ₽ с десертом','Lunch 450 ₽ with dessert',{d:.6,p:1.28}]],def:'m'},
    k2:{k:'deal',o:[['no','Без договора с заводом','No deal with the factory',{}],['yes','Договор с заводом: скидка 12 %, гостей больше','Factory deal: 12% off, more diners',{d:1.45,p:.88}]],def:'no'}},
  hard:{seg:'retail',ico:'🧹',n:'Хозяйственный магазин',en:'Hardware & household shop',cap:1.8e6,days:21,life:84,hand:1,rent:55e3,staff:45e3,mw:60e3,R:520e3,v:.66,sd:40,st:'small',max:3,need:{have:'kiosk',or:1.5e6},gen:1,
    knob:{k:'range',list:1,o:[['base','Ходовое: бытовая химия, лампочки','Basics: cleaning products, light bulbs',{d:.85,sd:25,v:.68}],['wide','Всё для дома','Everything for the home',{d:1,sd:40}],['dacha','Для дома и дачи: весной больше','Home & garden: more in spring',{d:.95,sd:55,v:.64,sea:'dacha'}]],def:'wide'}},
  pharm:{seg:'retail',ico:'💊',n:'Аптечный пункт',en:'Pharmacy counter',cap:3.2e6,days:45,life:84,hand:1,rent:50e3,staff:110e3,mw:70e3,R:1.2e6,v:.76,sd:30,st:'small',max:3,need:{cap:2e6},gen:1,
    knob:{k:'kind',o:[['rx','Лекарства по рецептам','Prescription medicines',{d:1}],['care','Витамины и уход: наценка выше','Vitamins & care: higher mark-up',{d:.6,v:.62}],['old','Скидка пенсионерам 5 %','5% pensioner discount',{d:1.25,v:.79}]],def:'rx'}},
  club:{seg:'serv',ico:'🎮',n:'Компьютерный клуб на 15 мест',en:'Computer club, 15 seats',cap:5e6,days:30,life:48,hand:1,rent:70e3,staff:90e3,mw:60e3,R:420e3,v:.12,sd:0,st:'small',max:2,need:{cap:3e6},gen:1,sea:'club',
    knob:{k:'hours',o:[['day','До 23:00','Until 11 pm',{d:.8}],['night','Ночной пакет 500 ₽','Night package 500 ₽',{d:1,f:15e3}],['24','Круглосуточно','Round the clock',{d:1.2,f:60e3}]],def:'night'}},
  clean:{seg:'serv',ico:'👔',n:'Химчистка',en:'Dry cleaner’s',cap:3.8e6,days:30,life:84,hand:1,rent:60e3,staff:150e3,mw:65e3,R:420e3,v:.22,sd:0,st:'small',max:2,need:{cap:2.5e6},gen:1,sea:'clean',
    knob:{k:'mode',o:[['own','Свой цех','Own workshop',{d:1}],['out','Только приёмка, чистит чужой цех','Drop-off only, another shop cleans',{d:1,v:.55,f:-100e3}],['home','Свой цех и доставка на дом','Own workshop + home delivery',{d:1.25,v:.24,f:45e3}]],def:'own'}},
  truckf:{seg:'retail',ico:'🌭',n:'Фудтрак: хот-доги и кофе',en:'Food truck: hot dogs & coffee',cap:2e6,days:10,life:60,hand:1,rent:15e3,staff:45e3,mw:55e3,R:260e3,v:.4,sd:2,st:'small',max:4,need:{have:'kiosk',or:1e6},gen:1,
    knob:{k:'spot',o:[['park','У парка: летом людно','By the park: busy in summer',{d:1.1,sea:'park'}],['site','У стройки: круглый год','By a building site: all year',{d:.85}],['fair','Праздники и ярмарки','Festivals & fairs',{d:1.35,f:40e3,sea:'park',rk:.1,rc:30e3}]],def:'park'}},
  // «Сеть» (ООО)
  whs:{seg:'trade',ico:'🏬',n:'Склад и опт',en:'Warehouse & wholesale',cap:3.5e6,days:30,life:84,hand:0,rent:250e3,staff:150e3,mw:0,R:12e6,v:.93,sd:15,st:'mid',max:2,
    knob:{k:'def',o:[['d0','Без отсрочки','No credit',{d:1,bad:0,dd:0}],['d14','Отсрочка 14 дней','14-day credit',{d:1.4,bad:.01,dd:14}],['d30','Отсрочка 30 дней','30-day credit',{d:1.8,bad:.03,dd:30}]],def:'d14'},
    // чем торгуем оптом (28.09): v — доля закупки в выручке, sd — запас (дней), sea — сезон; меняется когда угодно
    gd:{k:'cat',o:[['food','Продукты','Groceries',{d:1}],['drink','Напитки: летом больше','Drinks: more in summer',{d:.95,v:.925,sea:'summer'}],
      ['home','Хозтовары и бытовая химия','Household goods & cleaning',{d:.6,v:.9,sd:30}],['build','Стройматериалы: весна–осень','Building supplies: spring–autumn',{d:1.1,v:.93,sea:'build'}]],def:'food'}},
  base:{seg:'trade',ico:'🏗',n:'Стройбаза: щебень и песок',en:'Builders’ yard: gravel & sand',cap:8e6,days:30,life:96,hand:0,rent:0,staff:600e3,mw:0,R:0,v:0,sd:0,st:'mid',max:2,
    knob:{k:'win',o:[['no','Зимой не закупаем','No winter stock-up',{w:0}],['yes','Закупить щебень на весну','Stock gravel for spring',{w:1}]],def:'no'}},
  truck:{seg:'logi',ico:'🚛',n:'Самосвал',en:'Dump truck',cap:9e6,days:7,life:96,hand:0,rent:0,staff:80e3,mw:0,R:275e3,v:.35,sd:0,st:'mid',max:30},
  // «Карьер» (лицензия ОПИ)
  sandpit:{seg:'quarry',ico:'⛏',n:'Песчаный карьер',en:'Sand pit',cap:60e6,days:90,life:120,hand:0,rent:0,staff:1.5e6,mw:0,st:'quarry',max:4,out:'sand',q:20000,vc:220,p:450,dep:1},
  // щебень: 25 тыс. т/мес (≈300 тыс. т/год — малый гранитный карьер с ДСК), 280 млн, EBITDA ~14,7 млн/мес, окупаемость ~19 мес.
  // (было 20 тыс. т за 220 млн: с одним песчаным и одним щебёночным карьером малый бизнес давал треть EBITDA при входе в недра)
  gravpit:{seg:'quarry',ico:'⛰',n:'Гранитный карьер и ДСК',en:'Granite quarry & crusher',cap:280e6,days:150,life:120,hand:0,rent:0,staff:4e6,mw:0,st:'quarry',max:4,out:'grav',q:25000,vc:650,p:1400,dep:1}
};
const BL=Object.keys(BIZ),SMALL=BL.filter(t=>BIZ[t].st==='small'),MID=['whs','base','truck'],PITS=['sandpit','gravpit'];
const STAGES=['gig','small','mid','quarry','nedra'];
const stI=W=>STAGES.indexOf(W.st||'nedra');
// нерудные: закупка стройбазы у чужого карьера, продажа с доставкой (₽/т), доля в объёме
const AGG={grav:{buy:1300,sell:2450,sh:.6},sand:{buy:450,sell:1100,sh:.4}},BASE_Q=5000,HIRE_T=700,OWN_T=300,TRUCK_T=1500;
const RIVALS=[{id:'beav',n:'Бобров и Ко',en:'Beaver & Co'},{id:'sib',n:'СибНеруд',en:'SibNerud'},{id:'kam',n:'Камень-Урал',en:'Stone-Ural'}];
// пороги глав (калибровка 28.09 по tools/sim-rags.js): «Сеть» — 10 млн; «Карьер» — 115 млн (было 80, потом 100; 28.09 ночь: +8 малых дел и 10 видов подработки ускорили путь); «Недра» — 400 млн, партнёр доливает до 800, не больше 400
// (спецификация 1.3.3: «если 300 + доливка — слишком легко: порог 400, доливка не больше 400»; с рабочими кредитами недра наступали на 144-м мес.)
const OOO_EQ=12e6,QUARRY_EQ=140e6,NEDRA_EQ=400e6,NEDRA_CAP=800e6,PARTNER_MAX=400e6;
// 💎 за главы (один раз на игрока; game.js добавляет их к своим достижениям)
const BIZ_ACH={z_gig1:1,z_rt48:2,z_ip:3,z_biz1:3,z_quit:3,z_mgr1:3,z_ooo:5,z_chain:5,z_truck:2,z_opi:5,z_quarry:8,z_nedra:10};

/* ---------------- помощники ---------------- */
function sgAdd(W,seg,rev,e){const s=W.mon.sg||(W.mon.sg={});const x=s[seg]||(s[seg]={rev:0,e:0});x.rev+=rev;x.e+=e;}
function inc(W,a,seg,tax){a=rnd0(a);if(!a)return 0;recv(W,a,'sales');pl(W,'rev',a);sgAdd(W,seg,a,a);if(tax)W.me.tb+=a;return a;}   // выручка
function cost(W,a,plk,cfk,seg){a=rnd0(a);if(!a)return 0;pay(W,a,cfk);pl(W,plk,plk==='oth'?-a:a);if(seg)sgAdd(W,seg,0,-a);return a;}   // затрата деньгами
function plc(W,k,a,seg){a=rnd0(a);if(!a)return 0;pl(W,k,a);if(seg)sgAdd(W,seg,0,-a);return a;}                                   // затрата без денег (себестоимость из запаса)
function ach(W,k){if(!W.ach[k]){W.ach[k]=1;return true;}return false;}
function me(W){return W.me;}
function lvl(W,t){const n=((W.me&&W.me.n)||{})[t]||0;let l=1;while(l<LV_MAX&&n>=LV_N[l])l++;return l;}
function lvlNext(W,t){const l=lvl(W,t);return l>=LV_MAX?0:LV_N[l];}   // сколько заказов нужно для следующего уровня (всего), 0 — максимум
function eqHas(W,k){return !!(W.me&&W.me.eq&&W.me.eq[k]);}
function month(W){return W.m%12;}
function chWord(ch){return ch<=0?0:ch<20?1:ch<50?2:ch<75?3:4;}   // нет истории / плохая / средняя / хорошая / отличная
function bizBook(b){return b.st==='b'?b.paid:(b.g-b.dp)+(b.stk||0);}
function working(W,t){return W.biz.filter(b=>b.t===t&&b.st==='w');}
function nOf(W,t,c){return W.biz.filter(b=>b.t===t&&(!c||b.c===c)).length;}
function chainN(W,t){return W.biz.filter(b=>b.t===t).length;}
// скидка сети на закупку: 3–5 точек −2,5 %, 6–9 −4 %, 10+ −5 %; свой склад-опт — ещё −3,5 % рознице (было −5/−8/−10 и −7: вместе с ⭐ 5 шаурма давала 2,5× реальной прибыли)
function chainDisc(W,t){const n=chainN(W,t);let d=n>=10?.05:n>=6?.04:n>=3?.025:0;if(BIZ[t].seg==='retail'&&W.biz.some(b=>b.t==='whs'&&b.st==='w'))d+=.035;return d;}

/* ---------------- мир ---------------- */
function newMe(){return {en:100,rt:4.5,xp:{},n:{},job:1,jq:-1,jb:0,hands:3,gigs:[],board:[],auto:{},eq:{},rest:0,out:0,tb:0,sal:0,stk:0,ng:0,life:0,pr:{},x2M:-1};}
function bizInit(W,o){W.me=newMe();W.st='gig';W.ned=false;W.taxm='npd';W.opd={};W.opi=[];W.ip=0;W.ooo=0;W.reg=null;W.cities=[W.home||'kuz'];W.chL={};W.odLast=-99;W.bobr=0;
  for(let i=0;i<3;i++)boardAdd(W);
  // первый заказ — учебные листовки
  W.me.board.unshift(mkGig(W,'flyer',true));W.me.board.length=Math.min(W.me.board.length,4);}
function bizMigrate(W,fx){luxMig(W);if(!W.opd||typeof W.opd!=='object')W.opd={};if(!Array.isArray(W.opi))W.opi=[];if(!Array.isArray(W.cities))W.cities=[W.home||'kuz'];
  if(!W.chL||typeof W.chL!=='object')W.chL={};if(typeof W.odLast!=='number')W.odLast=-99;if(typeof W.ip!=='number')W.ip=W.ned?1:0;if(typeof W.ooo!=='number')W.ooo=W.ned?1:0;
  if(typeof W.bobr!=='number')W.bobr=0;if(typeof W.expM!=='number')W.expM=-1;
  if(W.me){const d=newMe();for(const k in d)if(W.me[k]===undefined||W.me[k]===null&&k!=='jq'){W.me[k]=d[k];}if(!Array.isArray(W.me.gigs))W.me.gigs=[];if(!Array.isArray(W.me.board))W.me.board=[];}
  for(const b of W.biz){if(!BIZ[b.t])continue;if(!b.k)b.k={};{const d=defKnob(b.t);for(const x in d)if(b.k[x]===undefined)b.k[x]=d[x];}   /* новые ручки (28.09: товар опта) — по умолчанию */
    if(typeof b.rt!=='number')b.rt=3.5;if(typeof b.stk!=='number')b.stk=0;if(!b.m)b.m={r:0,e:0};if(!Array.isArray(b.pm))b.pm=[];if(!b.ev)b.ev={};}}

/* ---------------- руки ---------------- */
function hands(W){const M=W.me;if(!M)return {tot:3,used:0,free:3,job:0,gigs:0,biz:0};
  const tot=(M.hands||3)+(W.ooo?1:0)+hx(W);let bz=0;
  for(const b of W.biz){const B=BIZ[b.t];if(!B||b.mgr||!B.hand)continue;if(W.opd[b.t])continue;bz+=B.hand;}
  for(const t in W.opd)if(W.opd[t])bz+=1;
  const gigs=M.gigs.length,used=M.job+gigs+bz;return {tot,used,free:Math.max(0,tot-Math.ceil(used-1e-9)),job:M.job,gigs,biz:bz};}

/* ---------------- доска заказов ---------------- */
function gigOk(W,t){const M=W.me;if(t==='tutor')return M.rt>=4.7&&M.ng>=10;if(t==='handy')return eqHas(W,'tool');const q=GIGS[t]&&GIGS[t].req;if(!q)return true;
  if(q.eq&&!eqHas(W,q.eq))return false;if(q.rt&&M.rt<q.rt)return false;if(q.n&&M.ng<q.n)return false;if(q.lv&&lvl(W,q.lv[0])<q.lv[1])return false;return true;}
// сезон заказа: есть ли такие заказы в этом месяце
function gigSeason(W,t){const mo=GIGS[t]&&GIGS[t].mo;return !mo||mo.indexOf(month(W))>=0;}
function gigHi(W,t){const h=GIGS[t]&&GIGS[t].hi;return !!h&&h.indexOf(month(W))>=0;}
// вариант заказа (мини-решение): {pay, G, C, e, days, rm}; o — id варианта (нет/первый — обычный)
function gigOpt(g,o){const G=GIGS[g.t],c=G&&G.ch,x=c&&o?c.find(q=>q[0]===o):null,v=x&&x!==c[0]?x[3]:null;
  if(!v)return {o:c?c[0][0]:'',pay:g.pay,G:g.G,C:g.C,e:g.e,days:g.days,rm:1};
  const pay=rnd0(g.pay*(v.p||1)/50)*50,C=g.C||0;return {o:x[0],pay,G:rnd0((pay+C)/(1-NPD)),C,e:g.e+(v.e||0),days:g.days+(v.d||0),rm:v.r||1};}
function gigVar(W,t){if(t==='courier')return eqHas(W,'car')?'car':eqHas(W,'bike')?'bike':'foot';if(t==='taxi')return eqHas(W,'car')?'own':'rent';return '';}
// оплата «на руки»: net; валовая выручка G и прямые затраты C (для такси — комиссия, бензин, аренда машины)
function gigMoney(W,t,v,prem,inv){const g=GIGS[t],l=lvl(W,t);let net=payAt(t,l);
  if(t==='courier')net=v==='car'?5000:v==='bike'?3700:3100,net*=1+.03*(l-1);
  if(t==='taxi'){const G=9000*(1+.03*(l-1)),C=G*.26+1100+(v==='own'?0:2500);return {G:rnd0(G),C:rnd0(C),net:rnd0(G-C-G*NPD)};}
  if(t==='resale')return {G:0,C:0,net:0,inv};
  if(t==='handy'&&W.me.rt>=4.7)net*=1.25;
  if(gigHi(W,t))net*=1.2;if(l>=10)net*=1.04;
  if(prem)net*=1.25;net=rnd0(net/50)*50;const c=g.c||0,G=rnd0((net+c)/(1-NPD));return {G,C:c,net};}
function mkGig(W,t,easy){const M=W.me,v=gigVar(W,t),prem=!easy&&(M.rt>=4.85||lvl(W,t)>=7&&t!=='resale')&&R(W)<(M.rt>=4.85?.5:.25);let days=GIGS[t].days,e=GIGS[t].e;
  if(t==='article'&&eqHas(W,'laptop'))days=2;if(t==='courier')e=v==='car'?15:v==='bike'?20:25;
  const g={id:'g'+(W.nid++),t,v,days,e,exp:W.t+(easy?5:3+Math.floor(R(W)*2)),prem:prem?1:0};   // висит 3–4 дня (30–40 с): 45+ успевает прочитать
  // риск «не продастся» у каждой сделки свой (4–26 %, в среднем 15 %) — от номера сделки, без лишнего броска кубика (траектории миров не сдвигаются)
  if(t==='resale'){const inv=rnd0(RR(W,5e3,Math.min(50e3,Math.max(5e3,W.cash*.5)))/1000)*1000;g.inv=inv;g.ret=Math.round(RR(W,.25,.6)*100)/100;g.days=3+Math.floor(R(W)*8);g.rk=(4+((W.nid*7919)%23))/100;}
  const m=gigMoney(W,t,v,prem,g.inv);g.pay=m.net;g.G=m.G;g.C=m.C;return g;}
// частота видов на доске. Новые виды (28.09): вне сезона — нет; не хватает только снаряжения — изредка (видно, что купить), других условий — нет
const GW={night:1.5,dog:1.2,nurse:1.2,wed:2,photo:1.2,phone:1.2,dacha:2,santa:3,online:1.2,furn:1.5};
function boardAdd(W){const M=W.me;const w={flyer:M.ng<10?2:.3,courier:3,article:2,taxi:2,loader:2,handy:2,tutor:gigOk(W,'tutor')?2.5:0,resale:1.5};
  for(const t in GW){if(!gigSeason(W,t)){w[t]=0;continue;}let x=GW[t];if(gigHi(W,t))x*=2;
    if(!gigOk(W,t)){const q=GIGS[t].req||{},only=q.eq&&!eqHas(W,q.eq)&&!(q.rt&&M.rt<q.rt)&&!(q.n&&M.ng<q.n)&&!(q.lv&&lvl(W,q.lv[0])<q.lv[1]);x=only&&M.ng>=5?x*.3:0;}w[t]=x;}
  if(M.rt>=4.7){w.flyer=0;w.tutor*=1.4;w.handy*=1.3;}
  let s=0;for(const k in w)s+=w[k];let x=R(W)*s,t='courier';for(const k in w){x-=w[k];if(x<0){t=k;break;}}
  M.board.push(mkGig(W,t));}
// доска: не больше 5; новые — в конец и только на свободное место (лишний новый отбрасывается, старые не выталкиваются из-под пальца); случайные броски — те же
function boardDay(W){const M=W.me;M.board=M.board.filter(g=>g.exp>W.t);const add=R(W)<.5?1:2;for(let i=0;i<add;i++){boardAdd(W);if(M.board.length>5)M.board.pop();}}
function gigCanTake(W,g,o){const M=W.me;if(!M||!g)return 'no';if(W.me.out>0)return 'out';if(M.rest>0)return 'rest';if(hands(W).free<1)return 'hand';
  const e=o?gigOpt(g,o).e:g.e;if(!GIGS[g.t])return 'no';
  if(M.en<=0||M.en<e)return 'en';if((g.t==='loader'||GIGS[g.t].minE)&&M.en<(GIGS[g.t].minE||50))return 'en';if(!gigOk(W,g.t))return 'req';if(g.t==='resale'&&W.cash<g.inv)return 'cash';return 'ok';}
// o — вариант заказа (мини-решение), по умолчанию — обычный
function gigTake(W,id,o){const M=W.me;if(!M)return 'no';const g=M.board.find(x=>x.id===id);const ok=gigCanTake(W,g,o);if(ok!=='ok')return ok;
  if(o&&GIGS[g.t].ch){const x=gigOpt(g,o);if(x.o!==GIGS[g.t].ch[0][0]){g.o=x.o;g.pay=x.pay;g.G=x.G;g.C=x.C;g.e=x.e;g.days=x.days;g.rm=x.rm;}}
  M.board=M.board.filter(x=>x!==g);M.en=Math.max(0,M.en-g.e);g.left=g.days;g.tired=M.en<30?1:0;
  if(g.t==='resale'){pay(W,g.inv,'supp');M.stk+=g.inv;}   // деньги ушли в товар (запас), не в расход
  M.gigs.push(g);if(ach(W,'z_gig1'))news(W,'biz',{k:'gig1'});return 'ok';}
// первые 5 заказов без неудач (risk=0): травма «3 дня без заказов» в первые минуты убивала темп
function gigDone(W,g,off,out){const M=W.me,t=g.t,l=lvl(W,t),risk=(M.ng<5?0:1)*(g.tired?2:1)*(l>=8?.5:1)*(g.rm||1);let ok=true,why='';
  if(t==='resale'){M.stk-=g.inv;plc(W,'cogs',g.inv,'gig');const sold=R(W)>(typeof g.rk==='number'?g.rk:.15)*risk;const rev=rnd0(g.inv*(sold?1+g.ret:.8));inc(W,rev,'gig',true);if(!sold){ok=false;why='unsold';}
    out.push({k:'gig',id:g.id,t,ok,why,net:rev-g.inv});M.n[t]=(M.n[t]||0)+1;M.ng++;return;}
  let G=g.G,C=g.C,pen=0;const x=R(W),e1=!W.biz.length&&M.ng<30;   // первые 30 заказов главы 1 (≈ 10 мин): травма/ДТП — 1 день без заказов, силы не обнуляются (аудит M3 п.13)
  if(t==='courier'&&x<.1*risk){pen=300;why='late';}
  else if(t==='article'&&x<.05*risk){G=0;ok=false;why='refused';}
  else if(t==='taxi'&&x<.02*risk){pen=10000;M.out=e1?1:3;why=e1?'crash1':'crash';ok=false;}
  else if(t==='loader'&&x<.05*risk){M.out=e1?1:3;if(!e1)M.en=0;why=e1?'injury1':'injury';ok=false;}
  else if(t==='handy'&&x<.05*risk){pen=3000;why='damage';ok=false;}
  else if(t==='tutor'&&x<.1*risk){G=rnd0(G*.75);why='cancel';}
  else if(GIGS[t].risk&&x<GIGS[t].risk[0]*risk){const r=GIGS[t].risk;why=r[3];
    if(r[1]==='pen'){pen=r[2];ok=false;}else if(r[1]==='cut'){G=rnd0(G*r[2]);}else if(r[1]==='out'){M.out=e1?1:r[2];if(e1)why+='1';ok=false;}}
  else if(g.tired&&x>.93){G=0;ok=false;why='fail';}
  if(g.auto)G=rnd0(G*autoK(l));
  if(off&&g.auto)G=rnd0(G*.9);
  inc(W,G,'gig',true);if(C)cost(W,C,'cogs','supp','gig');if(pen)cost(W,pen,'oth','oth','gig');
  if(ok&&!why){M.rt=Math.min(5,M.rt+.03);}else if(!ok||why)M.rt=Math.max(1,M.rt-(ok?.1:.25));
  M.n[t]=(M.n[t]||0)+1;M.ng++;if(M.rt>=4.8)ach(W,'z_rt48');
  const l2=lvl(W,t);out.push({k:'gig',id:g.id,t,ok,why,net:rnd0(G*(1-NPD))-C-pen,acc:G-C-pen,lv:l2>l?l2:0});}   // acc — сколько пришло на счёт сейчас (налог 4 % спишется в конце месяца)
// «постоянный клиент»: после 5 заказов вида и ⭐ 4,7 — игра берёт такие заказы сама (85 % оплаты; с 6-го уровня 90 %, с 9-го 95 %).
// Один клиент = одна рука: следующий заказ — когда прежний закончен. Сезонные — только в сезон, с требованиями — пока они выполнены
function autoOk(W,t){const M=W.me;return t!=='resale'&&t!=='flyer'&&(M.n[t]||0)>=5&&M.rt>=4.7&&gigOk(W,t);}
function autoPay(W,t){return autoK(lvl(W,t));}
function gigAuto(W,t,on){if(!W.me||!GIGS[t])return 'no';if(on&&!autoOk(W,t))return 'req';W.me.auto[t]=!!on;return 'ok';}
function gigRest(W){const M=W.me;if(!M||M.rest>0)return 'no';M.rest=1;return 'ok';}
function eqBuy(W,k){const M=W.me,q=EQ[k];if(!M||!q||M.eq[k])return 'no';if(W.cash<q.c)return 'cash';pay(W,q.c,'capex');M.eq[k]={g:q.c,dp:0};return 'ok';}
function jobQuit(W){const M=W.me;if(!M||!M.job)return 'no';M.job=0;M.jq=W.m;if(ach(W,'z_quit'))news(W,'biz',{k:'quit'});return 'ok';}
function jobBackOk(W){const M=W.me;return !!M&&!M.job&&M.jq>=0&&W.m-M.jq>=6&&stI(W)<=1;}
function jobBack(W){if(!jobBackOk(W))return 'no';if(hands(W).free<1)return 'hand';W.me.job=1;W.me.jb=1;return 'ok';}

/* ---------------- ИП, ООО, налоги ---------------- */
function regIP(W){if(W.ip||W.reg)return 'no';W.reg={k:'ip',t:W.t+3};return 'ok';}
function oooReq(W){const eq=E.equity(W),pts=W.biz.filter(b=>SMALL.indexOf(b.t)>=0).length;
  return {eq:eq>=OOO_EQ,pts:pts>=4,mgr:W.biz.some(b=>b.mgr||W.opd[b.t]),ch:W.ch>=50,ip:!!W.ip,eqv:eq,ptsn:pts};}
function regOOO(W){if(!W.ip||W.ooo||W.reg)return 'no';const q=oooReq(W);if(!(q.eq&&q.pts&&q.mgr&&q.ch))return 'req';W.reg={k:'ooo',t:W.t+5};return 'ok';}
function taxOk(W){return !!W.ip&&W.ned===false&&(month(W)===0||W.taxFree>=W.m)&&W.taxm!=='osno';}
function taxCmp(W){const c=(W.me&&W.me.tc)||[];let a=0,b=0;for(const x of c){a+=x[0];b+=x[1];}return {usn6:a,usn15:b,n:c.length};}
function taxSet(W,m){if(m!=='usn6'&&m!=='usn15')return 'no';if(!taxOk(W))return 'month';W.taxm=m;W.taxFree=0;return 'ok';}
// налог месяца: НПД 4 % с доходов от заказов; УСН 6 % с доходов (минус взносы ИП); УСН 15 % с (доходы − расходы), не меньше 1 % доходов.
// Зарплата кладовщика — не доход бизнеса (НДФЛ удержал работодатель), расходы на жизнь не уменьшают базу.
function bizTax(W,M,ebt){const tb=W.me?W.me.tb:0;let tax=0;
  const t6=tb*.06,u6=Math.max(0,t6-Math.min(W.me.ipf||0,W.ooo?t6*.5:t6)),u15=Math.max(.15*Math.max(0,ebt-(W.me.sal||0)+(W.me.life||0)),.01*tb);
  // для урока «УСН 6 % или 15 %» и выбора в январе — оба налога за 12 месяцев
  if(W.ip){const c=W.me.tc||(W.me.tc=[]);c.push([rnd0(u6),rnd0(u15)]);if(c.length>12)c.shift();}
  if(W.taxm==='npd')tax=tb*NPD;else if(W.taxm==='usn6')tax=u6;else if(W.taxm==='usn15')tax=u15;
  tax=rnd0(tax);if(tax>0){pay(W,tax,'tax');pl(W,'tax',tax);}
  if(W.me){W.me.tb=0;W.me.sal=0;W.me.life=0;W.me.ipf=0;}return tax;}

/* ---------------- спрос и экономика точки (прогноз Людмилы — та же функция без шума) ---------------- */
function opt(B,kk,id){const K=B[kk];if(!K)return {};const o=K.o.find(x=>x[0]===id)||K.o.find(x=>x[0]===K.def);return o[3];}
// сезоны по месяцам (среднее за год ≈ 1): ice — мороженое, hol — праздники с цветами, dacha — дачный, summer — напитки, build — стройка, club — клуб (зимой людно), clean — химчистка, park — фудтрак у парка
const SEA={ice:[.3,.3,.6,1,1.4,2,2,2,1.2,.7,.4,.3],hol:[.85,1.5,2.5,.85,.85,.85,.85,.85,1.3,.85,.85,1.3],dacha:[.6,.6,1,1.5,1.6,1.4,1.2,1.1,1,.8,.6,.6],
  summer:[.7,.7,.8,.95,1.2,1.4,1.45,1.35,1,.85,.75,.85],build:[.5,.5,.8,1.2,1.4,1.4,1.4,1.4,1.2,1,.7,.5],club:[1.2,1.15,1.05,1,.9,.75,.75,.8,.95,1.05,1.15,1.25],
  clean:[.9,.85,1.1,1.35,1.2,.85,.75,.8,1,1.2,1.1,.9],park:[.4,.45,.6,.9,1.3,1.6,1.7,1.6,1.2,.8,.5,.45]};
function season(t,m,k){k=k||{};const B=BIZ[t];
  if(B&&B.gen){const o=opt(B,'knob',k[B.knob.k]);const x=o.sea||B.sea;return x?SEA[x][m]:1;}
  if(t==='kiosk'){const o=opt(B,'knob',k.set);return o.sea?SEA[o.sea][m]:1;}
  if(t==='whs'){const o=opt(B,'gd',k.cat);return o.sea?SEA[o.sea][m]:1;}
  if(t==='flow')return [.85,1.5,2.5,.85,.85,.85,.85,.85,1.3,.85,.85,1.3][m];
  if(t==='wash')return [.35,.35,1.4,1.4,1.2,1.2,1.2,1.2,1.2,1.1,1.1,.35][m];
  if(t==='tire')return [.5,.5,.5,2.5,2.5,.5,.5,.5,.5,2.5,2.5,.5][m];
  if(t==='shaw')return (m<2||m===11)?.8:1;
  if(t==='gazel'||t==='truck')return (m<2||m===11)?.85:1;
  if(t==='base')return m>=3&&m<=9?1.4:(m<2||m===11)?.4:1;
  return 1;}
function hol(t,m){return t==='flow'&&(m===1||m===2||m===8||m===11);}
// месячная экономика точки: {rev, vc (себестоимость проданного), sp (порча — входит в vc), f (постоянные), risk (ожидаемые штрафы/поломки), prof}
function econ(W,b,k,m,noEv){const B=BIZ[b.t],t=b.t;k=k||b.k||{};m=m==null?month(W):m;const C=CITY[b.c]||CITY.kuz;
  let dem=C.dem*(1+.1*((b.rt||3.5)-3))*season(t,m,k);if(C.tour&&m>=5&&m<=7&&B.seg==='retail')dem*=C.tour;
  if(!noEv&&b.ev){for(const x in b.ev){const e=b.ev[x];if(e&&e[0]>W.m&&e[1])dem*=e[1];}}
  if(!noEv&&b.ad>W.t)dem*=1+PROMO_K;   // «📺 Реклама точки»: +20 % покупателей, пока идёт
  const disc=chainDisc(W,t);let rev=0,vc=0,sp=0,f=(B.rent*C.rent)+B.staff+(b.mgr&&!W.opd[t]?B.mw:0),risk=0;
  const o=opt(B,'knob',k[B.knob?B.knob.k:'']),o2=opt(B,'k2',k[B.k2?B.k2.k:'']);if(o2.f)f+=o2.f;
  if(t==='vend'){dem*=vendSpot(W,b);rev=B.R*o.d*dem;vc=rev*B.v*(1-disc);f+=o.f*C.rent;if(vendOps(W,W.biz.indexOf(b)<0?1:0))f+=VEND_OP/10;if(o.rk)risk=o.rk*o.rc;risk+=.4*3e3;}
  else if(t==='kiosk'){const mk=(k.mk!=null?k.mk:B.sl.def)/100;rev=o.R*dem*Math.pow((1+o.m0)/(1+mk),o.e);vc=rev/(1+mk)*(1-disc);sp=vc*(o.sp||0);vc+=sp;}
  else if(t==='shaw'){rev=B.R*dem*o.d;vc=rev*B.v*(1-disc);sp=vc*o.sp;vc+=sp;risk=.2*(o2.fine||.25)*45e3;}
  else if(t==='flow'){const h=season(t,m,k),base=B.R*dem/h,cv=B.v*(1-disc);
    // праздник — ставка: закупили под hb, продали min(спрос, закупка), остальное — в порчу
    if(hol(t,m)){const hb=o.hb===1?h:o.hb<1?Math.min(h,1.3):h*o.hb,hr=noEv||!b.h?h:b.h;rev=base*Math.min(hr,hb);vc=base*cv*hb*1.1;sp=vc-rev*cv;}
    else{rev=base*h;vc=rev*cv*1.15;sp=vc-rev*cv;}}
  else if(t==='pvz'){rev=B.R*dem*o.d*o.rate;risk=o.fine*(o2.fm||1)*35e3;}
  else if(t==='coffee'){const d2=o2.d>1&&(b.wm||0)<3?1:o2.d;rev=B.R*dem*o.d*d2;vc=rev*B.v*(1-disc);f+=o.f*C.rent;
    if(!noEv&&b.ev&&b.ev.bean&&b.ev.bean[0]>W.m)vc*=1.2;}
  else if(t==='wash'){const p=k.pr!=null?k.pr:B.sl.def,D=dem,capV=1.3,vol=Math.min(D*Math.pow(35/p,1.8),capV);rev=B.R*vol*p/35;vc=B.R*B.v*vol;}
  else if(t==='tire'){rev=B.R*dem;vc=rev*B.v;}
  else if(t==='sto'){rev=B.R*dem*o.d;vc=rev*(.6*o.p+.333+.1);}
  else if(t==='gazel'){const ld=k.src==='own'?(b.ld||.4):o.ld;rev=B.R*dem*ld;vc=rev*(B.v+(o.cm||0));f+=o.f;}
  else if(t==='whs'){const g=opt(B,'gd',k.cat);rev=B.R*dem*o.d*(g.d||1);vc=rev*(g.v||B.v);risk=rev*o.bad;}
  else if(B.gen){const g=o;let d=dem*(g.d||1)*(o2.d||1);if(g.rs)d*=1+g.rs*((b.rt||3.5)-3.5);const p=(g.p||1)*(o2.p||1);
    rev=B.R*d*p;vc=rev*(g.v!=null?g.v:B.v)*(B.vp?1/p:1)*(1-disc);sp=vc*(g.sp||0);vc+=sp;f+=(g.f||0);if(g.rk)risk=g.rk*g.rc;}
  else if(t==='base'){const q=BASE_Q*dem;let c=0,s=0;const hike=W.bobr?1.15:1;
    for(const g in AGG){const a=AGG[g],qg=q*a.sh;s+=qg*a.sell;const own=ownPit(W,g);c+=qg*(own?BIZ[own.t].vc:a.buy*(g==='grav'?hike:1));}
    const tr=working(W,'truck').length*TRUCK_T,own=Math.min(q,tr);rev=s;vc=c;const lg=own*OWN_T+(q-own)*HIRE_T;return {rev,vc,sp:0,f,risk:0,log:lg,prof:rev-vc-f-lg,q};}
  else if(t==='truck'){const busy=truckBusy(W,b);rev=busy?0:B.R*dem;vc=rev*B.v;}
  else if(PITS.indexOf(t)>=0){const q=B.q,p=B.p*(E.REGS[b.c]?1:1);rev=q*p;vc=q*B.vc;}
  const prof=rev-vc-f-risk;return {rev,vc,sp,f,risk,log:0,prof};}
function ownPit(W,g){return W.biz.find(b=>b.st==='w'&&BIZ[b.t].out===g);}
function truckBusy(W,b){const bs=working(W,'base').length;if(!bs)return false;const trs=working(W,'truck');return trs.indexOf(b)<Math.ceil(BASE_Q*1.4*bs/TRUCK_T);}
// прогноз для экрана точки и каталога: при заданной ручке, средний месяц (или ближайший)
function bizForecast(W,b,k){if(typeof b==='string'){const B=BIZ[b];b={t:b,c:W.home||'kuz',rt:3.5,k:defKnob(b),mgr:0,wm:3,ev:{}};}
  const B=BIZ[b.t];let a={rev:0,vc:0,f:0,risk:0,log:0,prof:0};for(let m=0;m<12;m++){const x=econ(W,b,k||b.k,m,true);for(const q in a)a[q]+=(x[q]||0)/12;}
  const now=econ(W,b,k||b.k,null,true);a.dep=B.cap/B.life;a.now=now;a.pay=a.prof>0?B.cap/a.prof:0;return a;}
function defKnob(t){const B=BIZ[t],k={};if(B.knob)k[B.knob.k]=B.knob.def;if(B.k2)k[B.k2.k]=B.k2.def;if(B.sl)k[B.sl.k]=B.sl.def;if(B.gd)k[B.gd.k]=B.gd.def;return k;}

/* ---------------- открытие, ручки, управляющий, продажа ---------------- */
function bizNeed(W,t){const B=BIZ[t],n=B.need||{};if(stI(W)<(B.st==='small'?0:STAGES.indexOf(B.st)))return 'stage';
  if(n.have&&!W.biz.some(b=>b.t===n.have)&&!(n.or&&E.equity(W)>=n.or))return 'have';if(n.cap&&E.equity(W)<n.cap&&W.cash<n.cap)return 'cap';
  if(PITS.indexOf(t)>=0)return 'lic';return 'ok';}
function bizCan(W,t,c){const B=BIZ[t];if(!B||PITS.indexOf(t)>=0)return 'no';const nd=bizNeed(W,t);if(nd!=='ok')return nd;if(!W.ip)return 'ip';
  c=c||W.home||'kuz';if(W.cities.indexOf(c)<0)return 'city';if(nOf(W,t,c)>=B.max)return 'max';
  if(W.cash<B.cap)return 'cash';return 'ok';}
function bizOpen(W,t,o){o=o||{};const c=o.c||W.home||'kuz',ok=bizCan(W,t,c);if(ok!=='ok')return ok;const B=BIZ[t];
  let mgr=o.mgr?1:0;if(B.hand&&!mgr&&!W.opd[t]&&hands(W).free<B.hand)mgr=1;   // руки заняты — точка открывается с управляющим
  pay(W,B.cap,'capex');const n=chainN(W,t);
  const b={id:'z'+(W.nid++),t,c,st:'b',left:B.days,cost:B.cap,paid:B.cap,g:0,dp:0,k:Object.assign(defKnob(t),o.k||{}),rt:3.5+(n>=10?.7:n>=6?.5:n>=3?.3:0)-(c!==(W.home||'kuz')?.3:0),
    mgr,hon:1+Math.floor(R(W)*5),stk:0,m:{r:0,e:0},pm:[],ev:{},wm:0,th:0,ld:.4};
  W.biz.push(b);news(W,'biz',{k:'open',bt:t});if(W.st==='gig'){W.st='small';news(W,'biz',{k:'stage',st:'small'});}
  if(ach(W,'z_biz1'))0;if(mgr)ach(W,'z_mgr1');if(t==='truck')ach(W,'z_truck');if(chainN(W,t)>=3)ach(W,'z_chain');
  return 'ok';}
function bizKnob(W,id,k,v){const b=W.biz.find(x=>x.id===id);if(!b)return 'no';const B=BIZ[b.t];
  if(B.knob&&B.knob.k===k){if(!B.knob.o.some(x=>x[0]===v))return 'no';if(b.t==='coffee'&&b.k.place!==v&&b.st==='w'){if(W.cash<50e3)return 'cash';cost(W,50e3,'oth','oth',B.seg);}b.k[k]=v;return 'ok';}
  if(B.k2&&B.k2.k===k){if((b.wm||0)<3)return 'wait';if(!B.k2.o.some(x=>x[0]===v))return 'no';b.k[k]=v;return 'ok';}
  if(B.sl&&B.sl.k===k){b.k[k]=clamp(Math.round(+v),B.sl.min,B.sl.max);return 'ok';}
  if(B.gd&&B.gd.k===k){if(!B.gd.o.some(x=>x[0]===v))return 'no';b.k[k]=v;return 'ok';}return 'no';}
function bizMgr(W,id,on){const b=W.biz.find(x=>x.id===id);if(!b||!BIZ[b.t].mw)return 'no';
  if(!on&&BIZ[b.t].hand&&!W.opd[b.t]&&hands(W).free<BIZ[b.t].hand)return 'hand';b.mgr=on?1:0;if(on){b.hon=1+Math.floor(R(W)*5);b.th=0;ach(W,'z_mgr1');}return 'ok';}
// ревизия Людмилы: показывает недостачу управляющего за время работы; бесплатно (за 💎) — free
function bizAudit(W,id,free){const b=W.biz.find(x=>x.id===id);if(!b||!b.mgr)return null;if(!free){if(W.cash<AUDIT)return 'cash';cost(W,AUDIT,'adm','adm',BIZ[b.t].seg);}
  const r={th:rnd0(b.th||0),hon:b.hon,ok:(b.th||0)<1000};b.aud=W.m;return r;}
function bizFire(W,id){const b=W.biz.find(x=>x.id===id);if(!b||!b.mgr)return 'no';b.hon=1+Math.floor(R(W)*5);b.th=0;return 'ok';}   // сменить управляющего
function bizSellPrice(W,b){if(typeof b==='string')b=W.biz.find(x=>x.id===b);if(!b)return 0;const bk=bizBook(b);if(b.st==='b')return rnd0(bk*.9);
  const h=b.pm.slice(-6),avg=h.length?h.reduce((a,x)=>a+x,0)/h.length:0;return rnd0(bk*(.6+.075*(b.rt-1))+Math.max(0,avg)*8*(b.rt/5));}
function bizSell(W,id){const b=W.biz.find(x=>x.id===id);if(!b)return 'no';if(PITS.indexOf(b.t)>=0&&W.st==='quarry'&&W.biz.filter(x=>PITS.indexOf(x.t)>=0).length<=1)return 'no';
  let pr=bizSellPrice(W,b),bk=bizBook(b);
  if(b.pid){const p=W.opi.find(x=>x.id===b.pid);if(p&&p.lic){const lb=p.lic.g-p.lic.am;pr+=lb;bk+=lb;p.lic=null;p.own=null;p.st='bot';}}
  recv(W,pr,'asale');pl(W,'oth',pr-bk);
  W.biz=W.biz.filter(x=>x!==b);news(W,'biz',{k:'sold',bt:b.t,pr});return 'ok';}
// операционный директор сети (3+ точки одного типа): одна рука на всю сеть, управляющие точек не нужны
function opdHire(W,t,on){if(!BIZ[t]||on&&!BIZ[t].hand)return 'no';   // точкам без рук (автоматы) опердиректор не нужен
  if(on&&chainN(W,t)<3)return 'req';if(on&&!W.ooo)return 'ooo';if(on&&!W.opd[t]&&hands(W).free<1&&!W.biz.some(b=>b.t===t&&!b.mgr&&BIZ[t].hand))return 'hand';
  W.opd[t]=on?1:0;if(on)for(const b of W.biz)if(b.t===t)b.mgr=0;return 'ok';}
// второй город (глава «Сеть»): открытие 1 млн (прочие расходы — представительство, поиск помещений)
function cityOpen(W,c){if(!W.ooo||!CITY[c]||W.cities.indexOf(c)>=0)return 'no';if(W.cash<1e6)return 'cash';cost(W,1e6,'adm','adm',null);W.cities.push(c);return 'ok';}
// факторинг: дебиторка сразу, комиссия 3 %
function factor(W){let s=0;for(const x of W.rec)s+=x.a;if(s<=0)return 'no';const fee=rnd0(s*.03);recv(W,s,'sales');cost(W,fee,'oth','oth','trade');W.rec=[];return 'ok';}

/* ---------------- кредиты малого бизнеса ---------------- */
function ipMonths(W){return W.ip?W.m-(typeof W.ipM==="number"?W.ipM:W.m):0;}   // ipM может быть 0 (ИП в январе первого года)
function chMul(W){return [.5,.5,.8,1.1,1.5][chWord(W.ch)];}
function chRate(W){return [.03,.03,.015,0,-.015][chWord(W.ch)];}
function e3(W){const h=W.reps.slice(-3);if(!h.length)return 0;let s=0;for(const x of h)s+=E.ebitdaOf(x.pl);return s/h.length;}
// кредиты «Своего дела» — не больше собственного капитала (долг/капитал ≤ 1, как у банка для малого бизнеса)
const DE_MAX=1;
function bizLoanLimit(W){const i=stI(W);if(i<1||ipMonths(W)<3)return 0;const e12=Math.max(0,e3(W))*12,eq=Math.max(0,E.equity(W));
  let pj=0;for(const b of W.biz)if(b.st==='b'&&b.cost>b.paid)pj+=b.cost-b.paid;
  const fl=[0,5e5,5e6,30e6][Math.min(3,i)]*(i>=2&&!W.ooo?.2:1),mul=[0,.5,2,3.5][Math.min(3,i)],cap=i===2?30e6:Infinity;
  return Math.max(0,Math.min(Math.min(cap,Math.max(fl,mul*e12)*chMul(W))+.7*pj,DE_MAX*eq));}
function bizLoanRate(W){const i=stI(W);return clamp(W.key+(i<=1?.08:i===2&&W.ooo?.0275:.03)+chRate(W),.05,.4);}
function microLoan(W){if(W.loans.some(l=>l.mfo))return 'no';const a=30000;W.loans.push({id:'l'+(W.nid++),a,a0:a,r:2.92,n:1,n0:1,k:'ann',mfo:1});recv(W,a,'loan');news(W,'loan',{a,r:2.92,n:1});return 'ok';}
function cardLimit(W){return W.me&&W.me.rt>=4.6?rnd0((50e3+100e3*Math.min(1,W.ch/80))/1e4)*1e4:0;}
function cardTake(W,a){const lim=cardLimit(W);if(!lim||W.loans.some(l=>l.card))return 'no';a=Math.min(lim,Math.max(1e4,rnd0((a||lim)/1e3)*1e3));
  W.loans.push({id:'l'+(W.nid++),a,a0:a,r:0,n:12,n0:12,k:'eq',gr:3,card:1,free:3});recv(W,a,'loan');news(W,'loan',{a,r:0,n:12});return 'ok';}

/* ---------------- торги ОПИ и карьер ---------------- */
function pitVal(W,g){const t=g==='sand'?'sandpit':'gravpit',B=BIZ[t],e=(B.q*(B.p-B.vc)-B.staff)*.75,i=(W.key+.06)/12,af=(1-Math.pow(1+i,-120))/i;return Math.max(3e6,e*af-B.cap);}
const OPI_NM=[['Сосновый лог','Pine Hollow'],['Речной','River'],['Каменная гряда','Stone Ridge'],['Берёзовый','Birch'],['Лисий яр','Fox Ravine'],['Гранитный','Granite'],['Песчаный','Sandy'],['Кедровый','Cedar'],['Озёрный','Lake'],['Северный','North'],['Ключевой','Spring'],['Белый камень','White Stone']];
// оценка V — NPV карьера после налога минус стройка; лицензии ОПИ на торгах региона стоят намного меньше оценки (старт ~2 %), разумный предел — четверть оценки
const OPI_ADV=.25;
function opiAdd(W,g,day){const V=pitVal(W,g)*RR(W,.8,1.2),st=Math.max(5e5,rnd0(V*.02/1e5)*1e5),i=W.opi.length;
  W.opi.push({id:'q'+(W.nid++),g,nm:OPI_NM[i%OPI_NM.length],V:rnd0(V),km:rnd0(RR(W,5,40)),st:'list',start:st,step:Math.max(1e5,rnd0(st*.1/1e5)*1e5),day,pr:0,lead:null,bots:[],own:null,lic:null});}
function opiGen(W){if(W.opi.length)return;for(let i=0;i<4;i++)opiAdd(W,i%2?'grav':'sand',W.t+30+60*i);}
// соперники: Бобров идёт всегда, остальные — не всегда; после двух проигрышей игрока соперники осторожнее (у них тоже кончаются деньги)
function opiOpen(W,p){p.st='auc';p.pr=p.start;p.lead=null;p.end=W.t+10;p.bots=[];const lost=W.opi.filter(q=>q.st==='bot').length,hi=lost>=2?.18:.22;
  for(const r of RIVALS){if(R(W)<(lost>=2?.5:.3)&&r.id!=='beav')continue;p.bots.push({id:r.id,mx:rnd0(p.V*RR(W,.05,r.id==='beav'?hi+.06:hi))});}}
function opiBid(W,id){const p=W.opi.find(x=>x.id===id);if(!p||p.st!=='auc')return 'no';const np=p.lead?p.pr+p.step:p.pr;if(W.cash<np)return 'cash';
  p.pr=np;p.lead='you';const al=p.bots.filter(b=>b.mx>=p.pr+p.step).sort((a,b)=>b.mx-a.mx);if(al.length){p.pr+=p.step;p.lead=al[0].id;return 'bot';}return opiWin(W,p,'you');}
function opiPass(W,id){const p=W.opi.find(x=>x.id===id);if(!p||p.st!=='auc')return 'no';if(p.lead==='you')return opiWin(W,p,'you');
  const al=p.bots.filter(b=>b.mx>=p.pr).sort((a,b)=>b.mx-a.mx);if(!al.length){p.st='list';p.day=W.t+90+Math.floor(R(W)*90);return 'none';}return opiWin(W,p,al[0].id);}
function opiWin(W,p,who){if(who==='you'){if(W.cash<p.pr)return 'cash';pay(W,p.pr+7500,'lic');
    p.lic={g:p.pr+7500,am:0};p.own='you';p.st='lic';ach(W,'z_opi');news(W,'biz',{k:'opi',pg:p.g,pr:p.pr});return 'won';}
  p.own=who;p.st='bot';news(W,'biz',{k:'opilost',pg:p.g,pr:p.pr,who});
  // проиграл — следующий участок через 3–6 месяцев (регион дополняет перечень, если свободных не осталось)
  for(const q of W.opi)if(q.st==='list'&&q.day<W.t+60)q.day=W.t+60+Math.floor(R(W)*60);
  if(!W.opi.some(q=>q.st==='list'&&q.g===p.g)&&W.opi.length<12)opiAdd(W,p.g,W.t+60+Math.floor(R(W)*60));return 'lost';}
function pitBuild(W,pid){const p=W.opi.find(x=>x.id===pid);if(!p||p.own!=='you'||p.st!=='lic'||W.biz.some(b=>b.pid===pid))return 'no';const t=p.g==='sand'?'sandpit':'gravpit',B=BIZ[t];
  if(W.cash<B.cap*.2)return 'cash';const b={id:'z'+(W.nid++),t,c:W.home||'kuz',pid,st:'b',left:B.days,tot:B.days,cost:B.cap,paid:0,g:0,dp:0,k:{},rt:4,mgr:0,hon:5,stk:0,m:{r:0,e:0},pm:[],ev:{},wm:0};
  W.biz.push(b);news(W,'biz',{k:'open',bt:t});return 'ok';}
function nedraReq(W){const eq=E.equity(W),pit=W.biz.some(b=>PITS.indexOf(b.t)>=0&&b.st==='w'&&(b.wm||0)>=6);
  return {eq:eq>=NEDRA_EQ,pit,od:W.m-W.odLast>6,eqv:eq,st:W.st==='quarry'};}
function nedraOk(W){const q=nedraReq(W);return q.eq&&q.pit&&q.od&&q.st;}
// переход в «Недра»: партнёр (фонд «Сибирский капитал») доливает капитал до 800 млн (не больше 500 млн) — ДДС «взнос в капитал»;
// налог — ОСНО 25 %; создаётся мир недр (участки, боты, металлы); обучение недр — для первого холдинга
function bizGoNedra(W){if(!nedraOk(W))return {err:'req'};const Eq=E.equity(W),a=Math.min(PARTNER_MAX,Math.max(0,NEDRA_CAP-Eq));
  W.taxm='osno';W.lossCF=0;W.tut=W.hold===1;E.initNedra(W,{cap:a});W.partner={a,sh:Math.round(Eq/(Eq+a)*100)/100,m:W.m};W.st='nedra';W.me&&(W.me.gigs=[],W.me.board=[]);
  ach(W,'z_nedra');news(W,'biz',{k:'stage',st:'nedra'});return {partner:a,sh:W.partner.sh};}

/* ---------------- день ---------------- */
function bizDay(W,off,out){const M=W.me;if(!M){if(!W.biz.length&&!W.rec.length)return;}
  if(M&&!W.ned){
    // регистрация ИП/ООО
    if(W.reg&&W.t>=W.reg.t){if(W.reg.k==='ip'){W.ip=1;W.ipM=W.m;W.taxm='usn6';W.taxFree=W.m+1;ach(W,'z_ip');news(W,'biz',{k:'ip'});}
      else{W.ooo=1;W.st='mid';ach(W,'z_ooo');news(W,'biz',{k:'stage',st:'mid'});}W.reg=null;out.push({k:'reg'});}
    // силы: +25 в день, основная работа −5; выходной +25 сверху
    M.en=clamp(M.en+30-(M.job?5:0)+(M.rest>0?50:0),0,enMax(W));   // 28.09 (темп главы 1 в реальных минутах): сон +30 (было +20), выходной — 1 день и +50 ⚡ (было 2 дня по +25)
    if(M.rest>0)M.rest--;if(M.out>0)M.out--;   // 28.09: эта строка была приклеена к комментарию — выходной и больничный не кончались
    // зарплата кладовщика: аванс 15-го, остальное — в конце месяца
    if(M.job&&W.d===15){const a=inc(W,(M.jb?JOB_BACK:JOB_PAY)/2,'gig',false);M.sal+=a;}
    // заказы идут временем
    for(const g of M.gigs.slice()){if(--g.left<=0){M.gigs=M.gigs.filter(x=>x!==g);gigDone(W,g,off,out);}}
    boardDay(W);
    // «постоянный клиент»
    // один постоянный клиент каждого вида = одна рука: новый заказ — только когда прежний такой же (от клиента) закончен
    // (баг 28.09: репетитор идёт 4 дня, а клиент брал новый каждый день — занимал все свободные руки)
    for(const t in M.auto){if(!M.auto[t]||!autoOk(W,t)||!gigSeason(W,t))continue;if(M.gigs.some(g=>g.auto&&g.t===t))continue;if(hands(W).free<1||M.en<=40||M.rest>0||M.out>0)break;
      const g=mkGig(W,t);g.auto=1;M.board.push(g);if(gigTake(W,g.id)!=='ok')M.board=M.board.filter(x=>x!==g);}
    if(W.st==='mid'&&E.equity(W)>=QUARRY_EQ&&(W.biz.some(b=>b.t==='base')||W.biz.filter(b=>b.t==='truck').length>=2)&&W.ch>=50){W.st='quarry';opiGen(W);news(W,'biz',{k:'stage',st:'quarry'});out.push({k:'stage',st:'quarry'});}
    // торги ОПИ: пришёл срок — торги; прошло 10 дней — решают без игрока
    for(const p of W.opi){if(p.st==='list'&&W.st==='quarry'&&W.t>=p.day&&!W.opi.some(q=>q.st==='auc'))opiOpen(W,p);
      else if(p.st==='auc'&&W.t>=p.end){if(p.lead==='you'&&W.cash>=p.pr)opiWin(W,p,'you');else opiPass(W,p.id);out.push({k:'opi',id:p.id,own:p.own});}}}
  // точки
  const dm=month(W);
  for(const b of W.biz){const B=BIZ[b.t];if(!B)continue;
    if(b.st==='b'){
      if(b.tot){const need=Math.max(0,Math.min(b.cost-b.paid,rnd0((b.cost-b.paid)/Math.max(1,b.left))));if(need>W.cash-bizDuty(W)){b.halt=1;continue;}b.halt=0;b.paid+=pay(W,need,'capex');}
      if(--b.left<=0){b.st='w';b.g=b.paid;b.paid=0;news(W,'biz',{k:'built',bt:b.t});out.push({k:'bizopen',id:b.id});if(PITS.indexOf(b.t)>=0)ach(W,'z_quarry');
        if(B.sd&&b.t!=='flow'){const x=econ(W,b);restock(W,b,x.vc/DAYS*stockDays(b));}}
      continue;}
    if(b.down>0){b.down--;continue;}
    const x=econ(W,b);let own=1;if(B.hand&&!b.mgr&&!W.opd[b.t])own=off?.9:1.05;const nz=RR(W,.9,1.1);
    let rev=x.rev/DAYS*own*nz,vc=x.vc/DAYS*own*nz;
    if(b.t==='base'){baseDay(W,b,x,own*nz,off);continue;}
    if(PITS.indexOf(b.t)>=0){pitDay(W,b);continue;}
    if(b.t==='flow'&&hol(b.t,dm)){rev=x.rev/DAYS*nz;vc=x.vc/DAYS;}
    // товар: продаём из запаса по себестоимости, потом докупаем до нормы (не хватает денег — продаём меньше)
    if(B.sd){if(vc>b.stk){const k=b.stk/vc;rev*=k;vc=b.stk;}vc=rnd0(vc);b.stk-=vc;plc(W,'cogs',vc,B.seg);}
    else if(vc)cost(W,vc,'cogs','supp',B.seg);
    // недостача у нечестного управляющего (скрыта в себестоимости, видна на ревизии)
    if(b.mgr&&b.hon<=2&&!W.opd[b.t]){const th=rev*(b.hon===1?.08:.03);rev-=th;b.th=(b.th||0)+th;}
    if(b.t==='whs'){const o=opt(B,'knob',b.k.def);const a=rnd0(rev);if(o.dd){pl(W,'rev',a);sgAdd(W,B.seg,a,a);W.me&&(W.me.tb+=a);const lr=W.rec[W.rec.length-1];if(lr&&lr.due>=W.t+o.dd-3&&lr.bad===o.bad)lr.a+=a;else W.rec.push({a,due:W.t+o.dd,bad:o.bad});}else inc(W,a,B.seg,true);b.m.r+=a;}
    else{const a=inc(W,rev,B.seg,true);b.m.r+=a;}
    b.m.e+=rnd0(rev)-rnd0(vc);
    if(B.sd)restock(W,b,x.vc/DAYS*stockDays(b));}
  // дебиторка: срок пришёл — деньги (часть — безнадёжные долги)
  if(W.rec.length){const due=W.rec.filter(x=>x.due<=W.t);if(due.length){for(const x of due){const bad=rnd0(x.a*(x.bad||0)*RR(W,0,2));recv(W,x.a-bad,'sales');if(bad){pl(W,'oth',-bad);}}W.rec=W.rec.filter(x=>x.due>W.t);}
    }
}
// сколько денег нужно на обязательства ближайшего закрытия месяца: постоянные точек, жизнь, опердиректора, платежи по кредитам (стройка карьера их не трогает)
function bizDuty(W){let f=(LIFE[W.st]||38e3)+(W.ooo?ACC_OOO:0);for(const b of W.biz)if(b.st==='w'){const B=BIZ[b.t];f+=(b.t==='whs'||b.t==='base'||PITS.indexOf(b.t)>=0)?B.staff+(B.rent||0):econ(W,b,null,null,true).f;}
  for(const t in W.opd)if(W.opd[t])f+=OPD_WAGE;for(const l of W.loans)f+=l.a*l.r/12+E.loanPay(l);return f*1.2+1e6;}
function stockDays(b){const B=BIZ[b.t];if(b.t==='shaw'){const o=opt(B,'knob',b.k.meat);return o.sd;}
  if(b.t==='whs'){const o=opt(B,'gd',b.k.cat);return o.sd||B.sd;}if(B.knob&&(b.t==='kiosk'||B.gen)){const o=opt(B,'knob',b.k[B.knob.k]);return o.sd||B.sd;}return B.sd;}
function restock(W,b,target){const need=rnd0(target-b.stk);if(need<=0)return;const a=Math.min(need,Math.max(0,W.cash-1000));if(a<=0)return;pay(W,a,'supp');b.stk+=a;}
function baseDay(W,b,x,k,off){const B=BIZ.base,q=x.q/DAYS*k;let rev=x.rev/DAYS*k,vc=x.vc/DAYS*k;const lg=x.log/DAYS*k;
  // своё сырьё — со склада карьера (по себестоимости), остальное — покупка у чужих карьеров
  inc(W,rev,'trade',true);cost(W,vc,'cogs','supp','trade');cost(W,lg,'log','log','trade');b.m.r+=rnd0(rev);b.m.e+=rnd0(rev)-rnd0(vc)-rnd0(lg);}
function pitDay(W,b){const B=BIZ[b.t],q=B.q/DAYS,g=B.out;const p=W.opi.find(x=>x.id===b.pid);
  // добыча по себестоимости → сразу продажа: своей стройбазе уходит по себестоимости (учтено в её закупке), остальное — на рынок у карьера
  let need=working(W,'base').length*BASE_Q*season('base',month(W))*AGG[g].sh/DAYS;
  // спрос своей стройбазы делят свои карьеры этого сырья по очереди (второй карьер не «поставляет» те же тонны ещё раз)
  for(const o of W.biz){if(o===b)break;if(o.st==='w'&&BIZ[o.t].out===g&&!(o.down>0))need-=BIZ[o.t].q/DAYS;}
  const toBase=Math.max(0,Math.min(q,need)),mkt=q-toBase;
  // поставка своей базе — без продажи внутри группы: затраты на эти тонны несёт база (по себестоимости добычи)
  const c=cost(W,mkt*B.vc,'cogs','prod','quarry');const pr=B.p*(1-.1*mkt*DAYS/(g==='sand'?60000:50000));const rev=inc(W,mkt*pr,'quarry',true);
  // сегменты: своя поставка базе — по рыночной цене у карьера (маржа добычи — карьеру, не опту); выручка между сегментами не задваивается
  const tr=rnd0(toBase*(B.p-B.vc));if(tr){sgAdd(W,'quarry',0,tr);sgAdd(W,'trade',0,-tr);}
  b.m.r+=rev;b.m.e+=rev-c+tr;}

/* ---------------- закрытие месяца ---------------- */
function bizClose(W,M,off){const Me=W.me;
  if(Me&&!W.ned){
    if(Me.job){const a=inc(W,(Me.jb?JOB_BACK:JOB_PAY)/2,'gig',false);Me.sal+=a;}
    const life=LIFE[W.st]||38000;Me.life+=cost(W,life,'adm','adm',null);
    if(W.ip&&!W.ooo){Me.ipf=(Me.ipf||0)+cost(W,IP_FEE,'adm','adm',null);}
    if(W.ooo)cost(W,ACC_OOO,'adm','adm',null);
    // амортизация имущества для работы
    let d=0;for(const k in Me.eq){const q=Me.eq[k],a=Math.min(q.g-q.dp,rnd0(q.g/EQ[k].life));q.dp+=a;d+=a;}if(d)pl(W,'dep',d);
    // кредитка: беспроцентный период 3 месяца, потом 36 %
    for(const l of W.loans)if(l.card){if(l.free>0){l.free--;if(!l.free)l.r=.36;}}
    // кредитная история
    const ids={};for(const l of W.loans)if(l.k!=='od')ids[l.id]=l.n;
    if(W.odM>0){W.ch=Math.max(0,W.ch-25);W.odLast=W.m-1;}else if(Object.keys(ids).length)W.ch=Math.min(100,W.ch+3);else if(W.ip&&W.ch<60)W.ch=Math.min(60,W.ch+1.5);
    for(const id in W.chL)if(!(id in ids)&&W.chL[id]>1)W.ch=Math.min(100,W.ch+10);W.chL=ids;
    // мягкое банкротство: денег нет третий месяц подряд — банк продаёт точки за 60 % и сводит долги в один кредит
    if(W.odM>=3&&!off)bizSan(W);}
  // точки: постоянные, амортизация, события, история прибыли
  for(const b of W.biz){const B=BIZ[b.t];if(!B||b.st!=='w')continue;const x=econ(W,b);let f=x.f;if(b.t==='whs'||b.t==='base'||PITS.indexOf(b.t)>=0)f=B.staff+(B.rent||0);
    if(b.t==='vend'&&b.k.place==='station'&&R(W)<.08)f+=25e3;
    const fx=cost(W,f,'fix','fix',B.seg);const dp=Math.min(b.g-b.dp,rnd0(b.g/B.life));b.dp+=dp;pl(W,'dep',dp);
    const p=b.m.e-fx;b.lr=rnd0(b.m.r);b.pm.push(rnd0(p));if(b.pm.length>6)b.pm.shift();b.th=rnd0(b.th||0);b.m={r:0,e:0};b.wm=(b.wm||0)+1;
    bizEvent(W,b,off);
    // ⭐ точки: медленно растёт от прибыли, у СТО — от процента мастерам
    const o=opt(B,'knob',b.k[B.knob?B.knob.k:'']);b.rt=Math.round(clamp(b.rt+(p>0?.04:-.05)+(o.drt||0)+(b.mgr&&b.hon<=2?-.03:0),1,5)*100)/100;
    if(b.t==='gazel'&&b.k.src==='own'&&b.rt>=4)b.ld=Math.min(.85,(b.ld||.4)+.075);
    if(b.t==='flow'){const m1=(W.m+1)%12;b.h=hol('flow',m1)?season('flow',m1,b.k)*RR(W,.7,1.4):0;}}
  // лицензии ОПИ — амортизация 120 мес. (НМА)
  for(const p of W.opi||[])if(p.own==='you'&&p.lic){const a=Math.min(p.lic.g-p.lic.am,rnd0(p.lic.g/120));p.lic.am+=a;pl(W,'dep',a);}
  // шиномонтаж: закупка шин к сезону (март, сентябрь) и распродажа остатков после сезона (июнь, декабрь)
  for(const b of W.biz)if(b.t==='tire'&&b.st==='w')tireMonth(W,b);
  // стройбаза: событие «поставщик поднял цену» (карьер Боброва) — мост к своему карьеру
  if(!W.bobr&&W.biz.some(b=>b.t==='base'&&b.st==='w'&&b.wm>=3)&&R(W)<.35){W.bobr=1;news(W,'biz',{k:'bobr'});if(W.st==='mid'||W.st==='quarry')opiGen(W);}
  // операционные директора
  for(const t in W.opd)if(W.opd[t]&&chainN(W,t))cost(W,OPD_WAGE,'fix','fix',BIZ[t].seg);}
function tireMonth(W,b){const m=(W.m)%12,o=opt(BIZ.tire,'knob',b.k.stock);
  if((m===2||m===8)&&o.S>0&&W.cash>o.S){pay(W,o.S,'supp');b.stk+=o.S;b.td=rnd0(RR(W,.6,1.3)*1e6*(CITY[b.c]||CITY.kuz).dem);}
  else if((m===3||m===4||m===9||m===10)&&b.stk>0){const q=Math.min(b.stk,rnd0((b.td||0)/2));if(q>0){b.stk-=q;plc(W,'cogs',q,'serv');inc(W,q*1.25,'serv',true);}}
  else if((m===5||m===11)&&b.stk>0){const q=b.stk;b.stk=0;plc(W,'cogs',q,'serv');inc(W,q*.8,'serv',true);}}
const EVS={vend:[['brk',.25,0,3e3]],kiosk:[['bobrov',.04,6,0,.75],['demol',.025,0,0]],shaw:[['insp',.2,0,0]],flow:[['truck',.05,1,0,.8]],
  pvz:[['fine',0,0,0],['cut',.03,3,0,.7],['rival',.03,6,0,.6]],coffee:[['bean',.05,3,0],['viral',.04,0,0]],wash:[['pump',.05,0,50e3]],tire:[],sto:[['warr',.08,0,30e3],['left',.04,3,0,.85],['fleet',.04,6,0,1.3]],
  gazel:[['brk',.08,0,40e3]],whs:[],base:[],truck:[['brk',.06,0,120e3]],sandpit:[],gravpit:[],
  barber:[['master',.05,2,0,.8]],bakery:[['oven',.06,0,60e3]],canteen:[['order',.05,2,0,1.3]],hard:[],pharm:[['check',.05,0,40e3]],club:[['pcbrk',.06,0,50e3]],clean:[['ruin',.08,0,15e3]],truckf:[['rain',.06,1,0,.7]]};
function bizEvent(W,b,off){const B=BIZ[b.t],evs=EVS[b.t]||[];
  for(const [k,p,mo,c,mul] of evs){let pr=p;
    if(b.t==='pvz'&&k==='fine'){const o=opt(B,'knob',b.k.mkt),o2=opt(B,'k2',b.k.cam);pr=o.fine*(o2.fm||1);}
    if(R(W)>=pr)continue;let cst=c;
    if(k==='insp'){const o2=opt(B,'k2',b.k.san);if(R(W)<(o2.fine||.25)){cst=rnd0(RR(W,30e3,60e3));b.down=7;}else continue;}
    if(k==='fine')cst=rnd0(RR(W,20e3,50e3));
    if(k==='viral'){b.rt=Math.min(5,b.rt+.3);}
    if(k==='demol'){// снос НТО: переезд за 150 тыс. (если есть деньги) или компенсация 30 %
      if(W.cash>=150e3)cst=150e3;else{const bk=bizBook(b),pr2=rnd0((b.g-b.dp)*.3);recv(W,pr2,'asale');pl(W,'oth',pr2-bk);W.biz=W.biz.filter(x=>x!==b);news(W,'biz',{k:'demol',bt:b.t});return;}}
    if(k==='brk'&&b.t!=='truck'&&!(b.t==='vend'&&vendOps(W)))b.down=b.t==='gazel'?5:3;
    if(k==='oven'||k==='pcbrk')b.down=2;
    if(cst)cost(W,cst,'oth','oth',B.seg);
    if(mo)b.ev[k]=[W.m+mo,mul||1];if(k==='bean')b.ev.bean=[W.m+3,1];
    news(W,'bizev',{k,bt:b.t,id:b.id,c:cst});}
  for(const k in b.ev)if(b.ev[k][0]<=W.m)delete b.ev[k];}
function bizSan(W){const sold=[];const ord=W.biz.slice().sort((a,b)=>((a.pm.slice(-1)[0]||0)-(b.pm.slice(-1)[0]||0)));
  for(const b of ord){if(W.cash>=0)break;if(PITS.indexOf(b.t)>=0)continue;const bk=bizBook(b),pr=rnd0(bk*.6);recv(W,pr,'asale');pl(W,'oth',pr-bk);W.biz=W.biz.filter(x=>x!==b);sold.push(b.t);}
  let d=0;for(const l of W.loans)d+=l.a;const add=W.cash<0?rnd0(-W.cash+10e3):0;if(add)recv(W,add,'loan');
  W.loans=d+add>0?[{id:'l'+(W.nid++),a:d+add,a0:d+add,r:W.key+.04,n:36,n0:36,k:'ann',san:1}]:[];W.san++;W.odM=0;W.ch=Math.max(0,W.ch-30);
  if(W.me&&!W.me.job&&stI(W)<=1)W.me.jq=Math.min(W.me.jq,W.m-6);   // уволенному предлагают вернуться на склад
  news(W,'san',{sold,debt:d+add});return sold;}

/* ---------------- баланс ---------------- */
function bizBal(W){let inv=0,cip=0,fa=0,lic=0,rec=0;
  for(const b of W.biz){if(b.st==='b')cip+=b.paid;else fa+=b.g-b.dp;inv+=b.stk||0;}
  if(W.me){inv+=W.me.stk||0;for(const k in W.me.eq){const q=W.me.eq[k];fa+=q.g-q.dp;}}
  for(const p of W.opi||[])if(p.own==='you'&&p.lic)lic+=p.lic.g-p.lic.am;
  for(const x of W.rec)rec+=x.a;return {inv,cip,fa,lic,rec};}

/* ---------------- цель, глава, советы ---------------- */
// ближайшая цель лестницей (для карточки «Цель»): {k, cur, need, pct}
// запас на жизнь после покупки первой точки: 1,5 × обязательные расходы месяца (жизнь, взносы ИП, постоянные точек) — «хватает» только с ним (отчёт 26: совет вёл в овердрафт)
// запас на полтора месяца обязательных трат; пока есть работа, зарплата покрывает жизнь (запас не меньше 10 тыс.)
function bizRes(W){let f=(LIFE[W.st]||38e3)+(W.ooo?ACC_OOO:IP_FEE)-(W.me&&W.me.job?(W.me.jb?JOB_BACK:JOB_PAY):0);for(const b of W.biz)if(b.st==='w'&&!(b.t==='whs'||b.t==='base'||PITS.indexOf(b.t)>=0))f+=econ(W,b,null,null,true).f;return Math.max(10e3,Math.ceil(f*1.5/5000)*5000);}
function goal(W){const eq=E.equity(W),c=W.cash;
  if(W.ned)return null;
  if(!W.biz.length){if(!W.ip&&!eqHas(W,'bike')&&c<18e3)return {k:'bike',cur:c,need:18e3};return {k:'vend',cur:c,need:BIZ.vend.cap+bizRes(W)};}
  if(W.biz.length<2)return {k:'kiosk',cur:c,need:BIZ.kiosk.cap+bizRes(W)};
  if(!W.ooo&&!W.biz.some(b=>b.mgr))return {k:'mgr',cur:W.biz.length,need:3};   // после ООО (или с опердиректорами) цель «первый управляющий» не нужна
  if(!W.ooo)return {k:'ooo',cur:eq,need:OOO_EQ};
  if(!W.biz.some(b=>b.t==='base'))return {k:'base',cur:c,need:BIZ.base.cap};
  if(W.st==='mid')return {k:'quarry',cur:eq,need:QUARRY_EQ};
  if(!W.opi.some(p=>p.own==='you'))return {k:'opi',cur:eq,need:QUARRY_EQ};
  return {k:'nedra',cur:eq,need:NEDRA_EQ};}
function bizAdvise(W){const o=[];const M=W.me;if(!M)return o;const h=hands(W);
  if(W.odM>0)o.push({k:'z_od',pri:95});
  if(M.en<30&&M.gigs.length===0&&M.rest===0&&stI(W)<=1)o.push({k:'z_tired',pri:70,a:{en:M.en}});
  if(h.free>0&&M.board.length&&stI(W)<=1&&M.en>=30){const dd=g=>g.pay/Math.max(1,g.days||1);   // как «Лучший» на доске (biz-ui bestGig): ₽ за день, не дешевле 1000 ₽/день
    const best=M.board.filter(g=>g.t!=='resale'&&gigCanTake(W,g)==='ok'&&dd(g)>=1000).sort((a,b)=>dd(b)-dd(a)||b.pay/b.e-a.pay/a.e)[0];if(best)o.push({k:'z_gig',pri:60,a:{id:best.id,pay:best.pay}});}
  if(!W.ip&&!W.reg&&W.cash>=BIZ.vend.cap*.7)o.push({k:'z_ip',pri:65});
  if(W.ip&&!W.biz.length&&W.cash>=BIZ.vend.cap+bizRes(W))o.push({k:'z_vend',pri:66});
  {const sn={};for(const b of W.biz)if(b.st==='w'&&!sn[b.t]&&b.pm.length>=2&&b.pm.slice(-2).every(x=>x<0)){sn[b.t]=1;o.push({k:'z_loss',pri:55,a:{id:b.id,bt:b.t}});}}   // одна фраза на вид точки
  // управляющий «съедает» прибыль точки: с ним прогноз в минусе, а без него — в плюсе (и рука есть)
  for(const b of W.biz)if(b.st==='w'&&b.mgr&&!W.opd[b.t]){const x=mgrProf(W,b);if(x&&x.mgr<0&&x.self>0){o.push({k:'z_mgrloss',pri:52,a:{id:b.id,bt:b.t,mgr:rnd0(x.mgr),self:rnd0(x.self)}});break;}}
  if(W.ooo===0&&W.ip){const q=oooReq(W);if(q.eq&&q.pts&&q.mgr&&q.ch&&!W.reg)o.push({k:'z_ooo',pri:62});}
  for(const p of W.opi)if(p.st==='auc')o.push({k:'z_opi',pri:80,a:{id:p.id}});
  if(nedraOk(W))o.push({k:'z_nedra',pri:90});
  if(W.rec.length&&W.cash<0)o.push({k:'z_factor',pri:75});
  o.push({k:'ok',pri:1});o.sort((a,b)=>b.pri-a.pri);return o;}

/* ---------------- вехи глав (этап 4): 4–6 промежуточных целей на главу, видимый прогресс, награда 💎 (последняя — ещё украшение).
   Достигнутая веха запоминается в W.ach['ms_'+k] (мир), награда — один раз на игрока (S.crE, js/game.js). f — как показывать: n (шт.), m (₽), r (рейтинг) */
function lastNet(W){const r=W.reps[W.reps.length-1];return r?E.netOf(r.pl):0;}
function ptsN(W){return W.biz.filter(b=>SMALL.indexOf(b.t)>=0).length;}
const MILES={
  gig:[['g_gig1','Первый заказ','First job',W=>W.me?W.me.ng:0,1,'n',1],['g_gig10','10 заказов','10 jobs',W=>W.me?W.me.ng:0,10,'n',2],
    ['g_rt','Рейтинг 4,7 ★','Rating 4.7 ★',W=>W.me?W.me.rt:0,4.7,'r',2],['g_eq','Накопить 30 тыс. ₽','Save up 30k ₽',W=>E.equity(W),30e3,'m',2],['g_ip','Открыть ИП','Register as a sole trader',W=>W.ip?1:0,1,'n',3]],
  small:[['s_pts3','3 точки','3 outlets',ptsN,3,'n',2],['s_prof','Прибыль месяца 100 тыс. ₽','Monthly profit 100k ₽',lastNet,100e3,'m',2],['s_pts10','10 точек','10 outlets',ptsN,10,'n',3],
    ['s_eq2','Капитал 2 млн ₽','Equity 2M ₽',W=>E.equity(W),2e6,'m',3],['s_mgr','Первый управляющий','First manager',W=>W.biz.some(b=>b.mgr)||Object.keys(W.opd).some(t=>W.opd[t])?1:0,1,'n',3],
    ['s_eq5','Капитал 5 млн ₽','Equity 5M ₽',W=>E.equity(W),5e6,'m',5,'em_shop']],
  mid:[['m_opd','Операционный директор','Operations director',W=>Object.keys(W.opd).filter(t=>W.opd[t]).length,1,'n',2],['m_prof','Прибыль месяца 2 млн ₽','Monthly profit 2M ₽',lastNet,2e6,'m',3],
    ['m_eq25','Капитал 25 млн ₽','Equity 25M ₽',W=>E.equity(W),25e6,'m',3],['m_city','Второй город','Second city',W=>W.cities.length,2,'n',3],['m_pts30','30 точек','30 outlets',ptsN,30,'n',3],
    ['m_eq50','Капитал 50 млн ₽','Equity 50M ₽',W=>E.equity(W),50e6,'m',5,'sg_blue']],
  quarry:[['q_opi','Лицензия на карьер','Quarry licence',W=>W.opi.some(p=>p.own==='you')?1:0,1,'n',3],['q_pit','Карьер работает','Quarry running',W=>W.biz.some(b=>PITS.indexOf(b.t)>=0&&b.st==='w')?1:0,1,'n',3],
    ['q_eq150','Капитал 150 млн ₽','Equity 150M ₽',W=>E.equity(W),150e6,'m',3],['q_prof','Прибыль месяца 5 млн ₽','Monthly profit 5M ₽',lastNet,5e6,'m',4],
    ['q_eq250','Капитал 250 млн ₽','Equity 250M ₽',W=>E.equity(W),250e6,'m',4],['q_pit2','Песок и щебень — оба карьера','Both quarries: sand and gravel',W=>(W.biz.some(b=>b.t==='sandpit'&&b.st==='w')?1:0)+(W.biz.some(b=>b.t==='gravpit'&&b.st==='w')?1:0),2,'n',6,'fr_granite']],
  // «Недра» (M8 §3.3): видимая лестница первого года недр вместо «плато»
  nedra:[['n_con','Первый контракт','First contract',W=>W.cons.length||W.ach.ms_n_con?1:0,1,'n',3],['n_reg2','Объект во втором регионе','A site in a second region',W=>new Set(W.obj.map(o=>o.r)).size,2,'n',3],
    ['n_prof','Прибыль месяца 50 млн ₽','Monthly profit 50M ₽',lastNet,50e6,'m',3],['n_eq1','Капитал 1 млрд ₽','Equity 1bn ₽',W=>E.equity(W),1e9,'m',3],
    ['n_eq15','Капитал 1,5 млрд ₽','Equity 1.5bn ₽',W=>E.equity(W),1.5e9,'m',4],['n_ipo','Готов к IPO','Ready for the IPO',W=>E.ipoReady(W)?1:0,1,'n',5,'em_bell']]};
// вехи главы st (по умолчанию — текущей): [{k,ru,en,cur,need,f,cr,cos,done}]; done — достигнута сейчас или раньше в этом мире
function bizMiles(W,st){st=st||W.st;const a=MILES[st];if(!a||W.ned&&st!=='nedra')return [];
  return a.map(x=>{let cur=0;try{cur=x[3](W)||0;}catch(e){}const done=!!W.ach['ms_'+x[0]]||cur>=x[4];return {k:x[0],ru:x[1],en:x[2],cur,need:x[4],f:x[5],cr:x[6],cos:x[7]||'',done};});}

/* ---------------- ускорения за 💎 (цены и списание 💎 — в интерфейсе: GAME.spend, потом GAME.act) ----------------
   CR_BIZ: срочный заказ 3 (раз в игровой месяц, оплата ×1,5), ускорить открытие точки 4 (−5 дней, раз на точку), второе дыхание 2 (+50 сил, раз в игровую неделю) */
const CR_BIZ={urgent:3,open:4,pit:10,breath:2};
function urgentGigOk(W){return !!W.me&&!W.ned&&W.me.urgM!==W.m;}
function urgentGig(W){if(!urgentGigOk(W))return null;const M=W.me,ts=GL2.filter(t=>t!=='resale'&&t!=='flyer'&&gigOk(W,t)&&gigSeason(W,t));const t=ts[Math.floor(R(W)*ts.length)]||'courier';
  const g=mkGig(W,t);g.pay=rnd0(g.pay*1.5/50)*50;g.G=rnd0(g.G*1.5);g.urg=1;g.exp=W.t+3;M.board.unshift(g);if(M.board.length>5)M.board.pop();M.urgM=W.m;return g;}
function bizSpeedOk(W,id){const b=W.biz.find(x=>x.id===id);return !!b&&b.st==='b'&&!b.sp&&b.left>1;}
function bizSpeed(W,id){if(!bizSpeedOk(W,id))return 'no';const b=W.biz.find(x=>x.id===id);b.sp=1;const cut=Math.min(PITS.indexOf(b.t)>=0?15:5,b.left-1);b.left-=cut;if(b.tot)b.tot=Math.max(b.left,b.tot);return 'ok';}
function breathOk(W){return !!W.me&&!W.ned&&!(W.me.brT>W.t-7);}
function breath(W){if(!breathOk(W))return 'no';W.me.en=Math.min(enMax(W),W.me.en+50);W.me.brT=W.t;return 'ok';}
/* ---------------- награды за рекламу (спецификация 5.7; кнопки «📺 … за рекламу» — только при adOk(), награда — в колбэке досмотра) ----------------
   Здесь — только модель и лимиты в игровом времени (раз в месяц, раз на точку/заказ/объект). Лимиты в реальный день — GAME.adLeft (S.adD).
   Всё умеренно: рейтинг недели рекламой не покупается (критерий net_ad в tools/sim-rags.js: ≤ +15 % капитала, недра не раньше чем на 6 мес.). */
const PROMO_K=.2,PROMO_D=15,AD_SPD=5;
// «📺 ×2 за этот заказ»: заказчик доплачивает столько же, сколько заказ даёт на руки — сразу (раз в игровой месяц; не перепродажа, не «постоянный клиент»)
function gigX2Ok(W,id){const M=W.me;if(!M||W.ned||M.x2M===W.m)return false;const g=M.gigs.find(x=>x.id===id);return !!g&&!g.x2&&!g.auto&&g.t!=='resale'&&g.pay>0;}
function gigX2(W,id){if(!gigX2Ok(W,id))return 0;const M=W.me,g=M.gigs.find(x=>x.id===id);g.x2=1;M.x2M=W.m;
  const G=rnd0(g.pay/(1-NPD));inc(W,G,'gig',true);return g.pay;}   // выручка заказа (доход НПД), «на руки» после налога ≈ g.pay
// «📺 Людмила проверит сделку»: точный риск «не продастся» у перепродажи (у каждой сделки свой, 4–26 %; без проверки видно только «около 15 %»)
function dealChkOk(W,id){const M=W.me;if(!M||W.ned)return false;const g=M.board.find(x=>x.id===id);return !!g&&g.t==='resale'&&!g.chk;}
function dealChk(W,id){if(!dealChkOk(W,id))return null;const g=W.me.board.find(x=>x.id===id);g.chk=1;return typeof g.rk==='number'?g.rk:.15;}
// «📺 Реклама точки»: +20 % покупателей на 15 дней, раз в игровой месяц на точку (малый бизнес; не склад, не стройбаза, не карьер)
function bizPromoOk(W,id){const b=W.biz.find(x=>x.id===id);return !!b&&SMALL.indexOf(b.t)>=0&&b.st==='w'&&!(b.down>0)&&b.adM!==W.m&&!(b.ad>W.t);}
function bizPromo(W,id){if(!bizPromoOk(W,id))return 'no';const b=W.biz.find(x=>x.id===id);b.ad=W.t+PROMO_D;b.adM=W.m;return 'ok';}
// «📺 Ускорить открытие»: точка — то же, что за 💎 (−5 дней, раз на точку: либо 💎, либо реклама); карьер — отдельно от 💎, −5 дней, раз на карьер
function bizAdSpeedOk(W,id){const b=W.biz.find(x=>x.id===id);if(!b||b.st!=='b'||b.left<=1)return false;return PITS.indexOf(b.t)>=0?!b.spA:!b.sp;}
function bizAdSpeed(W,id){if(!bizAdSpeedOk(W,id))return 'no';const b=W.biz.find(x=>x.id===id);if(PITS.indexOf(b.t)<0)return bizSpeed(W,id);
  b.spA=1;b.left-=Math.min(AD_SPD,b.left-1);if(b.tot)b.tot=Math.max(b.left,b.tot);return 'ok';}
// недра: «📺 Ускорить стройку/модернизацию на 5 дней» — раз на стройку (отдельно от 💎 −15 дней)
function objAdSpeedOk(W,oid){const o=W.obj.find(x=>x.id===oid);if(!o)return false;const j=o.st==='b'?o:o.up;return !!j&&!j.spA&&j.left>1;}
function objAdSpeed(W,oid){if(!objAdSpeedOk(W,oid))return 'no';const o=W.obj.find(x=>x.id===oid),j=o.st==='b'?o:o.up;j.spA=1;j.left-=Math.min(AD_SPD,j.left-1);return 'ok';}
// недра: «📺 Экспресс» — все грузы в пути приходят вдвое быстрее, раз в игровой месяц (вагоны возвращаются как раньше)
function expressOk(W){return W.expM!==W.m&&W.tr.some(x=>x.arr-W.t>=2);}
function express(W){if(!expressOk(W))return 'no';for(const x of W.tr){const d=x.arr-W.t;if(d>=2)x.arr=W.t+Math.ceil(d/2);}W.expM=W.m;return 'ok';}
// недра: «📺 Отсрочка по контракту» — +10 дней без штрафа, раз на контракт, когда до срока ≤ 15 дней и поставлено меньше нужного
function conExtOk(W,id){const c=W.cons.find(x=>x.id===id);return !!c&&!c.ext&&c.done<c.q-1&&c.end-W.t<=15&&c.end>W.t;}
function conExt(W,id){if(!conExtOk(W,id))return 'no';const c=W.cons.find(x=>x.id===id);c.end+=10;c.ext=1;return 'ok';}
/* ---------------- управляющий и кредитная история — подсказки игроку ---------------- */
// прогноз прибыли точки (до налога и износа) с управляющим и без; dep — износ в месяц
function mgrProf(W,b){if(typeof b==='string')b=W.biz.find(x=>x.id===b);if(!b)return null;const B=BIZ[b.t];if(!B||!B.mw)return null;
  const o=Object.assign({},b,{mgr:0}),m=Object.assign({},b,{mgr:1});return {self:bizForecast(W,o,b.k).prof,mgr:bizForecast(W,m,b.k).prof,dep:B.cap/B.life,mw:B.mw};}
// кредитная история для ООО: сейчас, нужно 50, сколько прибавляется в месяц сейчас и через сколько месяцев будет
const CH_OOO=50;
function chInfo(W){const ch=W.ch||0,loan=W.loans.some(l=>l.k!=='od'),per=W.odM>0?-25:loan?3:(W.ip&&ch<60?1.5:0);
  return {ch,need:CH_OOO,ok:ch>=CH_OOO,per,eta:ch>=CH_OOO?0:per>0?Math.ceil((CH_OOO-ch)/per):-1,loan,card:cardLimit(W)>0&&!W.loans.some(l=>l.card)};}
/* ---------------- «Школа Людмилы Санны»: 8 уроков на числах игрока ----------------
   lessons(W) → [{n, due (событие случилось), done (0 — нет, 1 — пройден, 2 — ответ верный), d:{числа для текста}}]; тексты и вопросы — в интерфейсе */
function lessons(W){const L=W.les||(W.les={}),o=[],r0=W.reps[0],last=W.reps[W.reps.length-1];
  const add=(n,due,d)=>o.push({n,due:!!due,done:L[n]||0,d:d||{}});
  add(1,r0,r0?{earn:r0.pl.rev,spend:r0.pl.rev-E.netOf(r0.pl),save:E.netOf(r0.pl)}:{});
  const v=W.biz.find(b=>b.t==='vend'&&b.wm>=1);add(2,v,v?{rev:v.lr||0,cost:(v.lr||0)-(v.pm[v.pm.length-1]||0),prof:v.pm[v.pm.length-1]||0}:{});
  const st=W.biz.find(b=>BIZ[b.t].sd&&b.t!=='vend'&&b.st==='w'&&b.stk>0);add(3,st&&last,st&&last?{np:E.netOf(last.pl),dc:last.c1-last.c0,stk:st.stk}:{});
  const two=W.biz.length>=2;const bl=E.bal(W);add(4,two,{fa:bl.fa,debt:bl.debt,eq:bl.E,a:bl.A});
  const k=W.biz.find(b=>b.wm>=3&&b.g>0);add(5,k,k?{g:k.g,dep:rnd0(k.g/BIZ[k.t].life),t:k.t}:{});
  const ln=W.loans.find(l=>l.k!=='od'&&!l.mfo);add(6,ln,ln?{a:ln.a,int:rnd0(ln.a*ln.r/12),body:rnd0(E.loanPay(ln)),r:ln.r}:{});
  const tc=taxCmp(W);add(7,W.ip&&tc.n>=12&&month(W)===0,tc);
  const wh=W.biz.find(b=>b.t==='whs'&&b.wm>=1);let rc=0;for(const x of W.rec)rc+=x.a;add(8,wh,{rec:rc,cash:W.cash});
  return o;}
/* ---------------- вещи-цели героя (M8 §2 + идея владельца 30.09 «своё можно менять») ----------------
   Личные вещи за игровые ₽ по главам. Покупка — изъятие собственника: деньги ушли из дела на себя. ДДС — финансовая статья drw «Личные покупки собственника»,
   капитал = уставный + нераспределённая + текущая прибыль − W.drw (прибыль месяца, вехи «прибыль месяца» и поручение «месяц с прибылью» не портятся). Продать нельзя.
   Бонусов к ₽ нет. ГСЧ мира не трогаем (net в симуляторе вещей не покупает — его история не меняется до рубля).
   Слоты s: home жильё, car транспорт, phone телефон, watch часы, look образ, rest отдых, pet питомец — у каждого бесплатная стартовая вещь (p 0) и 3–5 покупных по главам;
   W.use[s] — чем герой пользуется сейчас: купленное остаётся, можно переехать или пересесть обратно. Без слота: par — развитие вещи (мангал к даче), wall — картины на стену кабинета, deed — добрые дела.
   ch — глава (1 «Карьера» … 5 «Недра», 6 — после IPO), st — ★ статуса (звание), set — набор. need: [вид, значение]: eq капитал ≥, ach W.ach[k], pts точек ≥, city городов ≥,
   has вещь куплена, stg глава ≥ (ECON.STAGES), opi лицензия на карьер, pit карьер работает, nobj объект недр работает, nyear прибыль за 12 мес. в недрах, hold холдинг ≥.
   Правило Людмилы: после покупки на счёте должна остаться подушка — постоянные расходы за 3 месяца (для мелочи ≤ 2 × «жизни» — за месяц). */
const LUX=[
  {id:'h0',s:'home',ch:1,ico:'🛏',ru:'Комната в общежитии',en:'A dorm room',p:0},
  {id:'c0',s:'car',ch:1,ico:'🚌',ru:'Проездной на автобус',en:'A bus pass',p:0},
  {id:'ph0',s:'phone',ch:1,ico:'📱',ru:'Смартфон с трещиной',en:'A cracked smartphone',p:0},
  {id:'w0',s:'watch',ch:1,ico:'⌚',ru:'Часы «Электроника» от отца',en:'Dad’s old digital watch',p:0},
  {id:'lk0',s:'look',ch:1,ico:'🧥',ru:'Куртка с рынка',en:'A market jacket',p:0},
  {id:'r0',s:'rest',ch:1,ico:'🎣',ru:'Отцовская удочка и пруд за гаражами',en:'Dad’s fishing rod and the pond behind the garages',p:0},
  {id:'pt0',s:'pet',ch:1,ico:'🐈',ru:'Кот Васька (приходящий)',en:'Vaska the cat (drops in)',p:0},
  // глава 2 «Своё дело»: капитал 0,1 → 12 млн
  {id:'phone2',s:'phone',ch:2,ico:'📱',ru:'Смартфон без трещин',en:'A smartphone without cracks',p:25e3,need:['ach','z_biz1'],st:1},
  {id:'pt1',s:'pet',ch:2,ico:'🦜',ru:'Попугай Кеша — говорит «Прибыль!»',en:'Kesha the parrot — says “Profit!”',p:8e3,need:['pts',2],st:1},
  {id:'watch1',s:'watch',ch:2,ico:'⌚',ru:'Часы «как у директора» (с рынка)',en:'“Director-style” watch (from the market)',p:12e3,need:['pts',3],st:1},
  {id:'suit1',s:'look',ch:2,ico:'👔',ru:'Первый костюм — для банка',en:'First suit — for the bank',p:45e3,need:['eq',1e6],st:2,set:'solid'},
  {id:'h1',s:'home',ch:2,ico:'🚪',ru:'Своя комната в коммуналке',en:'Your own room in a shared flat',p:300e3,need:['eq',2.5e6],st:2},
  {id:'car1',s:'car',ch:2,ico:'🚗',ru:'«Семёрка» — один хозяин, дед',en:'An old “Seven” — one owner, a grandpa',p:380e3,need:['eq',4e6],st:3,set:'auto'},
  {id:'dacha',s:'rest',ch:2,ico:'🏡',ru:'Дача, 6 соток',en:'A dacha, 6 sotkas',p:650e3,need:['eq',7e6],st:4,set:'dacha'},
  {id:'grill',par:'dacha',ch:2,ico:'🔥',ru:'Мангал и беседка',en:'A grill and a gazebo',p:40e3,need:['has','dacha'],st:1,set:'dacha'},
  // глава 3 «Сеть»: 12 → 140 млн
  {id:'brief',s:'look',ch:3,ico:'💼',ru:'Кожаный портфель и ручка с гравировкой',en:'A leather briefcase and an engraved pen',p:250e3,need:['stg','mid'],st:1,set:'solid'},
  {id:'ph3',s:'phone',ch:3,ico:'📲',ru:'Флагман-«лопата» с тремя камерами',en:'A shovel-sized flagship with three cameras',p:150e3,need:['stg','mid'],st:1},
  {id:'car2',s:'car',ch:3,ico:'🚙',ru:'«Японец» — кроссовер из салона',en:'A Japanese crossover, brand new',p:2.5e6,need:['eq',20e6],st:4,set:'auto'},
  {id:'h2',s:'home',ch:3,ico:'🏙',ru:'Двушка в новостройке',en:'A two-room flat in a new block',p:2e6,need:['eq',25e6],st:3},
  {id:'watch2',s:'watch',ch:3,ico:'⌚',ru:'Швейцарские часы',en:'A Swiss watch',p:800e3,need:['eq',30e6],st:3,set:'solid'},
  {id:'banya',par:'dacha',ch:3,ico:'♨',ru:'Баня на даче',en:'A banya at the dacha',p:1e6,need:['city',2],st:2,set:'dacha'},
  {id:'boat',s:'rest',ch:3,ico:'🚤',ru:'Лодка с мотором для рыбалки',en:'A motorboat for fishing',p:600e3,need:['eq',50e6],st:2,set:'hobby'},
  {id:'paint1',wall:1,ch:3,ico:'🖼',ru:'Картина местного художника — в кабинет',en:'A local artist’s painting — for the office',p:600e3,need:['pts',30],st:2,set:'patron'},
  {id:'car2b',s:'car',ch:3,ico:'🚘',ru:'«Шестисотый» — чёрный седан с водителем',en:'A black “six-hundred” sedan with a driver',p:4.5e6,need:['eq',100e6],st:5,set:'auto'},
  // глава 4 «Карьер»: 140 → 400 млн
  {id:'dog',s:'pet',ch:4,ico:'🐕',ru:'Алабай Барон — охрана карьера',en:'Baron the Central Asian shepherd — quarry guard',p:150e3,need:['opi',1],st:2,set:'hobby'},
  {id:'ph4',s:'phone',ch:4,ico:'📡',ru:'Спутниковый телефон — на карьере не ловит обычный',en:'A satellite phone — regular ones get no signal at the quarry',p:400e3,need:['pit',1],st:1},
  {id:'suv',s:'car',ch:4,ico:'🚙',ru:'«Гелик» — внедорожник как у губернатора',en:'A boxy SUV like the governor’s',p:7.5e6,need:['pit',1],st:5,set:'auto'},
  {id:'lk3',s:'look',ch:4,ico:'🧣',ru:'Кашемировое пальто и шарф',en:'A cashmere coat and scarf',p:600e3,need:['eq',180e6],st:2,set:'solid'},
  {id:'watch3',s:'watch',ch:4,ico:'⌚',ru:'Часы с турбийоном',en:'A tourbillon watch',p:3e6,need:['eq',200e6],st:3},
  {id:'house',s:'home',ch:4,ico:'🏠',ru:'Дом за городом с камином',en:'A country house with a fireplace',p:12e6,need:['eq',250e6],st:6},
  {id:'teplica',par:'house',ch:4,ico:'🌻',ru:'Теплица с помидорами',en:'A tomato greenhouse',p:300e3,need:['has','house'],st:1,set:'dacha'},
  // глава 5 «Недра»: 800 млн → IPO
  {id:'gift_l',deed:1,ch:5,ico:'🎁',ru:'Часы в подарок Людмиле Санне',en:'A watch as a gift for Lyudmila Sanna',p:2e6,need:['nobj',1],st:2},
  {id:'paint2',wall:1,ch:5,ico:'🖼',ru:'«Утро в сосновом бору» — очень хорошая копия',en:'“Morning in a Pine Forest” — a very good copy',p:3e6,need:['eq',1e9],st:2,set:'patron'},
  {id:'h4',s:'home',ch:5,ico:'🌆',ru:'Пентхаус с видом на реку',en:'A penthouse with a river view',p:45e6,need:['eq',1.2e9],st:5},
  {id:'gym11',deed:1,ch:5,ico:'🏫',ru:'Новый спортзал для школы № 11',en:'A new gym for School No. 11',p:40e6,need:['nyear',1],st:6,set:'patron'},
  {id:'yacht',s:'rest',ch:5,ico:'🛥',ru:'Яхта на Обском море',en:'A yacht on the Ob Sea',p:80e6,need:['eq',1.5e9],st:8,set:'hobby'},
  // после IPO — вещи остаются с героем и во втором холдинге
  {id:'heli',s:'car',ch:6,ico:'🚁',ru:'Вертолёт — облетать разрезы',en:'A helicopter — to fly over the pits',p:150e6,need:['hold',2],st:8},
  {id:'hockey',deed:1,ch:6,ico:'🏒',ru:'Хоккейная команда родного города (вторая лига)',en:'The home-town hockey team (second league)',p:250e6,need:['hold',3],st:10}];
const LUXS=['home','car','phone','watch','look','rest','pet'],LUX0={home:'h0',car:'c0',phone:'ph0',watch:'w0',look:'lk0',rest:'r0',pet:'pt0'};
// наборы (M8 §3.5): ★5 и немного 💎 (выдаёт game.js один раз на игрока); «Солидный» — замена одного поручения Планёрки в день, «Автопарк» — номер «777» бесплатно
const LUX_SET={dacha:['dacha','grill','banya','teplica'],solid:['suit1','watch2','brief','car2b'],auto:['car1','car2','car2b','suv'],hobby:['boat','dog','yacht'],patron:['paint1','paint2','gym11']};
const luxOf=id=>LUX.find(x=>x.id===id)||null;
function luxMig(W){if(!W.lx||typeof W.lx!=='object'||Array.isArray(W.lx))W.lx={};if(!W.use||typeof W.use!=='object'||Array.isArray(W.use))W.use={};
  if(typeof W.drw!=='number'||!isFinite(W.drw))W.drw=0;for(const s of LUXS){const x=luxOf(W.use[s]);if(!x||x.s!==s||(x.p&&!(x.id in W.lx)))W.use[s]=LUX0[s];}}
// условие открытия: {ok, cur, need, k} — cur/need для полосы и срока (капитал — ₽)
function luxNeed(W,x){const n=x.need;if(!n)return {ok:true,k:'',cur:1,need:1};const [k,v]=n;let cur=0;
  if(W.ned&&(k==='ach'||k==='pts'||k==='city'))return {ok:true,k,cur:1,need:1,v};   // в «Недрах» ступеньки малого бизнеса уже позади (и у тех, кто начал сразу с недр)
  switch(k){case 'eq':cur=E.equity(W);break;case 'ach':cur=W.ach&&W.ach[v]?1:0;return {ok:!!cur,k,cur,need:1,v};
    case 'pts':cur=W.biz?W.biz.filter(b=>SMALL.indexOf(b.t)>=0).length:0;break;case 'city':cur=W.cities?W.cities.length:1;break;
    case 'has':return {ok:!!(W.lx&&v in W.lx),k,cur:W.lx&&v in W.lx?1:0,need:1,v};
    case 'stg':return {ok:stI(W)>=STAGES.indexOf(v),k,cur:stI(W),need:STAGES.indexOf(v),v};
    case 'opi':cur=(W.opi||[]).some(p=>p.own==='you')||W.ned?1:0;break;
    case 'pit':cur=(W.biz||[]).some(b=>PITS.indexOf(b.t)>=0&&b.st==='w')||W.ned?1:0;break;
    case 'nobj':cur=W.ned&&W.obj.some(o=>o.st==='w')?1:0;break;
    case 'nyear':{const m0=W.partner?W.partner.m:-1,h=W.ned?W.hist.filter(x=>x.m>m0).slice(-12):[];cur=h.length>=12&&h.reduce((a,x)=>a+x.np,0)>0?1:0;break;}
    case 'hold':cur=W.hold||1;break;}
  return {ok:cur>=v,k,cur,need:v};}
// глава мира для вещей: 1…5 по ECON.STAGES, второй и следующий холдинги — 6
function luxCh(W){return (W.hold||1)>=2?6:stI(W)+1;}
// подушка по правилу Людмилы: постоянные расходы за месяц (прошлый отчёт: аренда и зарплаты, офис/жизнь, проценты, тело кредитов; не меньше «жизни» главы) × 3 (мелочь — × 1)
function luxCush(W,p){const r=W.reps[W.reps.length-1],life=LIFE[W.st]||38e3;let m=r?r.pl.fix+r.pl.adm+r.pl.int:0;for(const l of W.loans)m+=E.loanPay(l);m=Math.max(life,m);
  return Math.round(m*(p!=null&&p<=2*life?1:3));}
// состояние вещи: own — куплена (или стартовая), sale — можно купить (или не пускает правило/деньги: why 'cash'|'lud'), dream — ещё не открылась, later — будущая глава
function luxState(W,id){const x=luxOf(id);if(!x)return {st:'no'};if(!x.p||(W.lx&&id in W.lx))return {st:'own',x};const nd=luxNeed(W,x),ch=luxCh(W);
  if(x.ch>ch)return {st:'later',x,nd};if(!nd.ok)return {st:'dream',x,nd};const cu=luxCush(W,x.p);
  return {st:'sale',x,nd,cush:cu,why:W.cash<x.p?'cash':W.cash-x.p<cu?'lud':''};}
function luxBuy(W,id){const s=luxState(W,id);if(s.st!=='sale')return 'no';if(s.why)return s.why;const x=s.x;luxMig(W);
  pay(W,x.p,'drw');W.drw+=x.p;W.lx[id]=W.m;if(x.s)W.use[x.s]=id;news(W,'lux',{id,p:x.p});return 'ok';}
// пересесть / переехать: только на своё (купленное или стартовое)
function luxUse(W,id){const x=luxOf(id);luxMig(W);if(!x||!x.s)return 'no';if(x.p&&!(id in W.lx))return 'no';W.use[x.s]=id;return 'ok';}
function luxCur(W,s){luxMig(W);return luxOf(W.use[s])||luxOf(LUX0[s]);}
function lessonDone(W,n,ok){if(!W.les)W.les={};const was=W.les[n]||0;W.les[n]=ok?2:Math.max(1,was);return was?0:ok?2:0;}   // вернёт, сколько 💎 дать (2 — за верный ответ с первого раза)
Object.assign(E,{OPI_ADV,bizDuty,bizRes,CR_BIZ,urgentGigOk,urgentGig,bizSpeedOk,bizSpeed,breathOk,breath,PROMO_K,PROMO_D,AD_SPD,gigX2Ok,gigX2,dealChkOk,dealChk,bizPromoOk,bizPromo,bizAdSpeedOk,bizAdSpeed,objAdSpeedOk,objAdSpeed,expressOk,express,conExtOk,conExt,mgrProf,chInfo,CH_OOO,lessons,lessonDone,GIGS,GL2,EQ,BIZ,BL,SMALL,MID,PITS,STAGES,LIFE,CITY,AGG,RIVALS,BIZ_ACH,NEDRA_EQ,NEDRA_CAP,PARTNER_MAX,JOB_PAY,AUDIT,OPD_WAGE,VEND_SELF,VEND_OP,VEND_SAT,vendOps,vendSpot,OOO_EQ,QUARRY_EQ,DE_MAX,
  bizInit,bizMigrate,bizDay,bizClose,bizTax,bizBal,bizLoanLimit,bizLoanRate,bizAdvise,
  hands,lvl,lvlNext,LV_N,LV_MAX,payAt,autoK,autoPay,gigSeason,gigHi,gigOpt,HAND_CR,EN_CR,EN_STEP,hx,ex,enMax,gigOk,gigCanTake,gigTake,gigRest,gigAuto,autoOk,eqBuy,jobQuit,jobBack,jobBackOk,regIP,regOOO,oooReq,taxSet,taxOk,taxCmp,
  bizEcon:econ,bizForecast,defKnob,bizNeed,bizCan,bizOpen,bizKnob,bizMgr,bizAudit,bizFire,bizSell,bizSellPrice,bizBook,opdHire,cityOpen,factor,chainN,chainDisc,
  MILES,bizMiles,LUX,LUXS,LUX0,LUX_SET,luxOf,luxMig,luxNeed,luxCh,luxCush,luxState,luxBuy,luxUse,luxCur,
  SEA,microLoan,cardLimit,cardTake,chWord,ipMonths,opiBid,opiPass,pitBuild,pitVal,nedraReq,nedraOk,bizGoNedra,goal,stI:stI,season});
})(typeof window!=='undefined'?window:this);
