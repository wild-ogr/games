/* b2-krai-data.js — ДАННЫЕ КРАЁВ «Империи» (Акт 2 «Магнат 2.0»). ФОРМАТ КРАЯ v1 (поток KRAI, 18.10.2026).
   Грузится по требованию (B2.need) движком js/b2-krai.js; в jsc (симуляторы) — синхронно. Без DOM, только данные (+ мелкие функции-условия не нужны).
   Разделы: KRAI — Якутия (yak), Норильск (nor); KRAI2 — Сахалин (sah), Алтай (alt), финал «Корпорация» (corp) — СВОЙ РАЗДЕЛ В КОНЦЕ ФАЙЛА.

   КАК УСТРОЕН КРАЙ. Край = настройка над движком «Недр» (econ.js + nedra.js), не новый движок. В мире края у движка те же 3 «гнезда» районов
   kuz / ural / kar (ключи внутри кода; игрок их не видит) — край переименовывает и перенастраивает их. Товары и объекты «Недр» остаются,
   край добавляет свои (goods/obj) и одно правило (rule). Профиль включается на время мира края и снимается для обычного мира (KRAI.use).

   ПОЛЯ КРАЯ (обязательные помечены *):
   * no      — номер края в «Империи» (2, 3, 4, 5; финал — 6). Порядок на карте страны и в выборе.
   * n, sub  — [рус, англ]: название и подзаголовок («Золото и зимник»).
   * xy      — [долгота, широта] значка края на карте страны.
     col     — цвет края (кнопки, рамка), ico — значок края: ключ товара (значки товаров — KRAI_DATA.ico ниже или ui.js GD).
   * need    — когда открыт: {st:N} — звёзд всего ≥ N; {all:['yak','nor']} — IPO во всех этих краях; можно оба поля.
     cap     — стартовый капитал холдинга, ₽ (нет — как раньше: 800 млн + 200 млн × репутация).
     ipo     — планка IPO края, ₽ (нет — как раньше по репутации: 2,6 → 3,2 → 4 → 5 → 6 млрд).
     home    — гнездо «родного» района (наследство репутации, участок без торгов), по умолчанию 'kuz'.
   * reg     — {kuz:{…}, ural:{…}, kar:{…}} — 3 района: n,en (район), ng (род. падеж: «из Алдана»), city,ce (город), ex (цена разведки ₽), xy [долг., шир.],
               k {товар: коэф. цены на месте — ВСЕ товары «Недр» + товары края}, p {товар: доля участков с ним; сумма ≤ 1, остальное — пусто}.
   * km      — {'kuz-ural':км, 'kar-ural':км, 'kar-kuz':км} — расстояния (тариф и дни в пути).
     goods   — новые товары: {ключ:{n,en,u,ue,p (₽ за ед.),V (рынок в месяц),s (дневной шум цены)}}. Ключ — латиница, ≤ 6 знаков, не занятый.
     dep     — месторождения новых товаров: {товар:{res:[мин,макс] запас, vc:[мин,макс] ₽/ед. добычи}}.
     obj     — новые объекты: как ECON.OBJ: {seg,n,en,dep?,out,in?:{товар:на ед.},capex,mo,cap,fix,vc?,life}. seg — один из ECON.SEGS (обычно 'mine').
     mine    — {товар месторождения: объект добычи} (ECON.MINE_OF).
     ord     — порядок выпуска новых объектов (добыча раньше заводов). Заводы «Недр» края не меняет.
     sg      — {товар: сегмент отчёта} (ECON.SEG_G) для новых товаров.
     bots    — стартовые активы соперников в крае: {id бота:[[объект, гнездо], …]} — для ВСЕХ ботов (bars, bear, owl, beav и rival.id).
     rival   — местный соперник (5-й бот, только в этом крае): {id,n,en,who,whoe,ch,col,f,ex,lev,max,like,reg} — как ECON.BOTS.
   * rule    — ОДНО правило края. Движок умеет 4 «кирпича» (можно сочетать):
               sale:{r:[гнёзда], open:[месяцы 0–11, когда можно], free:[товары, которым можно всегда]} — вывоз/продажа/покупка только в open;
               prod:[{m:[месяцы], x:множитель, dep:1 (только добыча) | t:[объекты]}] — выпуск по месяцам;
               px:[{m:[месяцы], g:[товары], x:множитель, r?:[гнёзда — только там]}] — цена по месяцам;
               ev:[{k, w (вес), p (шанс в месяц), mo (месяцев), prod?:{x,dep|t}, px?:{g,x}, cash?:₽ (− трата), n:[рус,англ] (новость)}] — события края.
               id — ключ правила, n:[рус,англ] — название, t:[рус,англ] — объяснение Людмилы (1–2 фразы), now(W) не нужно — статус пишет движок.
   * stars   — 3 звезды: [{k:'ipo'}, {k:'mo',n:мес.} (IPO не дольше), {k:'rival'} (стоимость больше местного соперника),
               {k:'sold',g,q} (продано товара за холдинг), {k:'built',t} (объект работает к IPO), {k:'noloan',r} (ни одного кредита дороже r)].
     cond    — какие «Условия холдинга» можно взять: ['money','north','green'] (движок: дорогие деньги, северный завоз, бережный надзор).
     mg      — ключ мини-игры края (поток MG2), story — ключ арки сериала (поток STORY).
     map     — вид карты края: c [[долг.,шир.]…] контур, rv [[[долг.,шир.]…]…] реки, rd [[гнездо,гнездо,'rail'|'zim'|'road'|'sea']] дороги,
               bg/land/ink — цвета фона, суши и подписей.
   * t       — тексты [рус, англ]: hi (Людмила при входе в край, 2–3 фразы), win (после IPO края), st2/st3 — подписи звёзд 2 и 3.
   Числа — как в «Недрах»: ₽ без НДС, месяц игры = 5 мин; окупаемость добычи ≈ 20–24 мес., заводов ≈ 25–32 мес. (KRAI-tools/sim-krai.sh).
*/
(function(root){'use strict';
const K=root.KRAI_DATA=root.KRAI_DATA||{};
K.v=1;
// значки новых товаров для карты и рынка (стиль ui.js GD: c — цвет, p — [['b'|'l'|'d', путь 40×40]])
K.ico=K.ico||{};
Object.assign(K.ico,{
  auore:{c:'#c9a227',p:[['b','M6 27C6 17 13 11 21 11C30 11 35 18 34 26C33 32 27 34 20 34C12 34 6 32 6 27Z'],['l','M14 21l3-3 3 3-3 3zM24 17l2.5-2.5 2.5 2.5-2.5 2.5zM22 27l3-3 3 3-3 3z']]},
  au:{c:'#d4a017',p:[['b','M6 30L11 18H29L34 30Z'],['l','M11 18H29L26 12H14Z'],['l','M8 30h24v3H8z']]},
  niore:{c:'#6f8f6a',p:[['b','M6 27C6 17 13 11 21 11C30 11 35 18 34 26C33 32 27 34 20 34C12 34 6 32 6 27Z'],['l','M14 20a3 3 0 1 0 .1 0ZM25 18a2.2 2.2 0 1 0 .1 0ZM22 27a2.6 2.6 0 1 0 .1 0Z']]},
  ni:{c:'#8fa3b5',p:[['b','M8 13h24v18H8z'],['l','M8 13h24v4H8z'],['b','M13 9h14v4H13z']]}});
// значки новых объектов (стиль ui.js OG: [тон, [['b'|'d'|'l', путь 48×48]]]; тон — 3 цвета)
K.oico=K.oico||{};
Object.assign(K.oico,{
  aupit:{c:['#d8b04a','#9c7a22','#f3dc93'],p:[['d','M2 40h44v4H2z'],['b','M4 40L10 30H38L44 40Z'],['l','M10 30L15 22H33L38 30Z'],['b','M15 22L19 16H29L33 22Z'],['d','M30 11h9v4h-9zM31 16a2 2 0 1 0 .1 0ZM38 16a2 2 0 1 0 .1 0Z']]},
  aumill:{c:['#d8b04a','#7d5f17','#f6e3a6'],p:[['b','M4 44V22h22v22z'],['d','M4 22l11-8 11 8z'],['l','M9 29h5v5H9zM17 29h5v5h-5z'],['b','M28 30h16v14H28z'],['l','M31 24h10l3 6H28z'],['d','M33 8h4v16h-4z']]},
  nipit:{c:['#7d9a78','#4f6a4b','#bfd2bb'],p:[['d','M2 40h44v4H2z'],['b','M4 40L10 30H38L44 40Z'],['l','M10 30L15 22H33L38 30Z'],['b','M15 22L19 16H29L33 22Z'],['d','M8 8h4v14H8zM6 8h8v3H6z']]},
  nismelt:{c:['#8fa3b5','#56677a','#f2a33a'],p:[['d','M30 6h5v20h-5zM38 10h4v16h-4z'],['b','M5 44V26l12-8h16v26z'],['d','M5 44h28v2H5z'],['l','M11 33h12v11H11z'],['b','M36 37h9v7h-9z'],['l','M36 37h9v2h-9z']]}});

/* =================== KRAI: край №2 — Якутия «Золото и зимник» =================== */
// Правило: в Алдан и Оймякон дорога — зимник (декабрь–апрель, полная цена); летом (июнь–сентябрь) только река — цена тяжёлого −15 %;
// в распутицу (май, октябрь, ноябрь) тяжёлое (руда, уголь, лес) не вывезти и не завезти — склад копится. Золото летит самолётом круглый год.
// Решения: склады к распутице; летом продать рекой дешевле или держать до зимника (+15 %, но цена просядет от горы руды); своя ЗИФ (руда → золото на месте).
K.yak={no:2,n:['Якутия','Yakutia'],sub:['Золото и зимник','Gold and the winter road'],xy:[129.7,62],col:'#2f6fb3',ico:'au',need:{st:0},
  cap:1.0e9,ipo:2.8e9,home:'kuz',
  reg:{
    kuz:{n:'Нерюнгри',ng:'Нерюнгри',en:'Neryungri',city:'Нерюнгри',ce:'Neryungri',ex:22e6,xy:[119.5,58.2],
      k:{coal:.84,ore:.86,lime:.9,wood:.86,lumber:.9,pig:.9,steel:.9,roll:.92,cuore:.88,cucon:.94,cu:.97,wire:.97,auore:.9,au:.98},p:{coal:.5,ore:.15,lime:.08,wood:.05}},
    ural:{n:'Алдан',ng:'Алдана',en:'Aldan',city:'Алдан',ce:'Aldan',ex:26e6,xy:[129,60.3],
      k:{coal:.8,ore:.82,lime:.86,wood:.85,lumber:.88,pig:.88,steel:.88,roll:.9,cuore:.86,cucon:.92,cu:.96,wire:.96,auore:.88,au:.98},p:{auore:.42,wood:.15,lime:.08,coal:.05}},
    kar:{n:'Оймякон',ng:'Оймякона',en:'Oymyakon',city:'Усть-Нера',ce:'Ust-Nera',ex:34e6,xy:[144,65.5],
      k:{coal:.74,ore:.76,lime:.8,wood:.78,lumber:.82,pig:.84,steel:.84,roll:.86,cuore:.8,cucon:.9,cu:.95,wire:.95,auore:.84,au:.97},p:{auore:.58,coal:.1}}},
  km:{'kuz-ural':300,'kar-ural':1300,'kar-kuz':1600},
  goods:{auore:{n:'Золотоносная руда',en:'Gold ore',u:'т',ue:'t',p:30000,V:300000,s:.006},
         au:{n:'Золото (сплав Доре)',en:'Gold (doré)',u:'кг',ue:'kg',p:10.5e6,V:4000,s:.009}},
  dep:{auore:{res:[150e3,420e3],vc:[17000,21000]}},
  obj:{aupit:{seg:'mine',n:'Золоторудный карьер',en:'Gold pit',dep:'auore',out:'auore',capex:600e6,mo:4,cap:4000,fix:7e6,life:120},
       aumill:{seg:'mine',n:'Золотоизвлекательная фабрика (ЗИФ)',en:'Gold recovery plant',out:'au',in:{auore:250},capex:1100e6,mo:5,cap:16,vc:300000,fix:6e6,life:200}},
  mine:{auore:'aupit'},ord:['aupit','aumill'],sg:{auore:'mine',au:'mine'},
  bots:{bars:[['orepit','kuz'],['limepit','kuz']],bear:[['coalpit','kuz'],['coalpit','kuz']],owl:[['coalpit','kuz'],['aupit','ural']],beav:[['logging','ural'],['sawmill','ural']],loc:[['aupit','kar'],['aupit','ural']]},
  rival:{id:'loc',n:'Таёжный прииск',en:'Taiga Diggings',who:'Семён Кычкин',whoe:'Semyon Kychkin',ch:'calc',col:'#1f6f8b',f:.62,ex:.45,lev:2,max:6,like:['auore'],reg:['ural','kar']},
  rule:{id:'zim',n:['Зимник','Winter road'],
    t:['В Алдан и Оймякон дорога — зимник (декабрь–апрель). Летом — только река: вывоз дороже, цена −15 %. В распутицу (май, октябрь, ноябрь) не вывезти ничего, склад копится. Золото летит самолётом круглый год.',
       'Aldan and Oymyakon have a winter road (December–April). In summer only the river: shipping is dearer, price −15%. In the mud season (May, October, November) nothing leaves, stock piles up. Gold flies out all year.'],
    sale:{r:['ural','kar'],open:[11,0,1,2,3,5,6,7,8],free:['au']},
    px:[{m:[5,6,7,8],r:['ural','kar'],g:['coal','ore','lime','wood','lumber','auore'],x:.85}]},
  stars:[{k:'ipo'},{k:'mo',n:36},{k:'sold',g:'au',q:400}],
  cond:['money','north','green'],mg:'zimnik',story:'yak',
  map:{bg:'#dfeaf5',land:'#f7fbff',ink:'#1d3a5c',
    c:[[106,61],[108.5,64],[106,68],[111,71],[113,73.6],[123,73.8],[130,71.6],[140,72.6],[150,71.6],[159,70.6],[161,69],[155,66],[147,64],[141,61],[138,59.3],[134,57.5],[127,56],[120,56.4],[116,57.5],[112,59],[108,59.8]],
    rv:[[[119.5,57.2],[121,59],[124,60.5],[129.7,62],[128.5,66],[127,70],[126.5,72.8]],[[143.2,64.6],[146,67],[149,70],[150.5,71.4]]],
    rd:[['kuz','ural','rail'],['ural','kar','zim'],['kuz','kar','zim']]},
  t:{hi:['Якутия! Здесь золото — и зимник. Из Алдана и Оймякона руду и уголь возят зимником (декабрь–апрель), летом — рекой и дешевле, а в распутицу никак: склад копится. Золото летит самолётом всегда — своя ЗИФ решает многое.',
         'Yakutia! There’s gold here — and the winter road. Ore and coal leave Aldan and Oymyakon by the winter road (December–April), in summer by river and cheaper, and in the mud season not at all: stock piles up. Gold always flies — your own recovery plant changes a lot.'],
     win:['Якутия покорена! Золото и зимник — наши.','Yakutia conquered! Gold and the winter road are ours.'],
     st2:['IPO не дольше 36 месяцев','IPO within 36 months'],st3:['Продать 400 кг золота','Sell 400 kg of gold']}};

/* =================== KRAI: край №3 — Норильск «Никель и полярная ночь» =================== */
// Правило: полярная ночь (ноябрь–февраль) — рудники дают на 30 % меньше, зато никель зимой дороже на 10 %. Решение: копить руду летом
// (выключить автопродажу руды, склады), чтобы плавильный завод работал зимой на полную, когда металл в цене. Цепочка руда → никель — цель края.
K.nor={no:3,n:['Норильск','Norilsk'],sub:['Никель и полярная ночь','Nickel and the polar night'],xy:[88.2,69.3],col:'#4b5a8a',ico:'ni',need:{st:1},
  cap:1.2e9,ipo:null,home:'kuz',
  reg:{
    kuz:{n:'Норильск',ng:'Норильска',en:'Norilsk',city:'Норильск',ce:'Norilsk',ex:26e6,xy:[90.5,69.6],
      k:{coal:.82,ore:.84,lime:.88,wood:.8,lumber:.84,pig:.88,steel:.88,roll:.9,cuore:.86,cucon:.92,cu:.96,wire:.96,niore:.9,ni:.95},p:{niore:.42,coal:.3,lime:.08}},
    ural:{n:'Дудинка',ng:'Дудинки',en:'Dudinka',city:'Дудинка',ce:'Dudinka',ex:20e6,xy:[84.2,70.6],
      k:{coal:.9,ore:.9,lime:.94,wood:.88,lumber:.92,pig:.95,steel:.95,roll:.96,cuore:.92,cucon:.96,cu:.99,wire:.99,niore:.95,ni:1},p:{coal:.3,lime:.2,wood:.1}},
    kar:{n:'Таймыр',ng:'Таймыра',en:'Taymyr',city:'Хатанга',ce:'Khatanga',ex:36e6,xy:[103,72.6],
      k:{coal:.74,ore:.76,lime:.8,wood:.74,lumber:.78,pig:.82,steel:.82,roll:.84,cuore:.8,cucon:.88,cu:.94,wire:.94,niore:.82,ni:.92},p:{niore:.55,coal:.2}}},
  km:{'kuz-ural':100,'kar-ural':1250,'kar-kuz':1150},
  goods:{niore:{n:'Медно-никелевая руда',en:'Copper-nickel ore',u:'т',ue:'t',p:9000,V:300000,s:.007},
         ni:{n:'Никель',en:'Nickel',u:'т',ue:'t',p:1.45e6,V:3000,s:.01}},
  dep:{niore:{res:[900e3,2400e3],vc:[4800,6200]}},
  obj:{nipit:{seg:'mine',n:'Никелевый рудник',en:'Nickel mine',dep:'niore',out:'niore',capex:650e6,mo:4,cap:15000,fix:9e6,life:150},
       nismelt:{seg:'copper',n:'Никелевый завод',en:'Nickel smelter',out:'ni',in:{niore:110},capex:1200e6,mo:6,cap:140,vc:80000,fix:12e6,life:240}},
  mine:{niore:'nipit'},ord:['nipit','nismelt'],sg:{niore:'mine',ni:'copper'},
  bots:{bars:[['limepit','ural'],['coalpit','ural']],bear:[['coalpit','kuz'],['coalpit','ural']],owl:[['nipit','kuz'],['coalpit','kar']],beav:[['coalpit','kuz'],['limepit','ural']],loc:[['nipit','kar'],['nipit','kuz'],['limepit','ural']]},
  rival:{id:'loc',n:'Таймыр-Металл',en:'Taymyr Metal',who:'Аркадий Пургин',whoe:'Arkady Purgin',ch:'bold',col:'#5a4a8a',f:.66,ex:.4,lev:1.8,max:7,like:['niore'],reg:['kuz','kar']},
  rule:{id:'night',n:['Полярная ночь','Polar night'],
    t:['С ноября по февраль — полярная ночь: рудники дают на 30 % меньше. Зато никель зимой дороже на 10 %. Копите руду летом — пусть завод зимой работает на полную.',
       'November to February is the polar night: mines yield 30% less. But nickel is 10% dearer in winter. Stockpile ore in summer so the smelter runs flat out in winter.'],
    prod:[{m:[10,11,0,1],x:.7,dep:1}],px:[{m:[10,11,0,1],g:['ni'],x:1.1}]},
  stars:[{k:'ipo'},{k:'mo',n:40},{k:'rival'}],
  cond:['money','north','green'],mg:'plavka',story:'nor',
  map:{bg:'#d6e4f2',land:'#e9edf5',ink:'#1d2540',
    c:[[80,69],[80.5,72],[84,73.6],[88,75],[95,76],[100,77],[104.5,77.7],[110,76.5],[113,74],[111,72.5],[106,71],[103,69.5],[97,68.5],[90,68],[84,68.3]],
    rv:[[[86,68.2],[86.2,69.4],[84,71],[82.5,72.4]],[[102.5,72],[104,73.4],[106,74]]],
    rd:[['kuz','ural','rail'],['ural','kar','sea'],['kuz','kar','zim']]},
  t:{hi:['Норильск. Никель, медь — и полярная ночь: с ноября по февраль рудники дают меньше. Зато зимой никель дороже. Руду лучше копить летом, а плавить зимой.',
         'Norilsk. Nickel, copper — and the polar night: from November to February the mines yield less. But nickel is dearer in winter. Stockpile ore in summer, smelt it in winter.'],
     win:['Норильск покорён! Никель и полярная ночь — наши.','Norilsk conquered! Nickel and the polar night are ours.'],
     st2:['IPO не дольше 40 месяцев','IPO within 40 months'],st3:['Обогнать «Таймыр-Металл»','Beat Taymyr Metal']}};

/* =================== KRAI2: Сахалин (sah), Алтай (alt), финал «Корпорация» (corp) — раздел потока KRAI2, ниже этой строки =================== */
/* Общее KRAI2. Новое в формате (движок понимает с b2-krai2): rule.ss — сезоны края для строки правила и плашки карты:
   [{m:[месяцы], ico, n:[рус,англ] (коротко, на карту), t:[рус,англ] (что происходит), dk:1 — тёмное небо}], rule.s0 — то же «в остальные месяцы»;
   rule.tip — советы Людмилы к сезону: [{m:[месяц, когда сказать], t:[рус,англ], o?:[объекты — только если есть]}].
   Флаг B2.off.krai2 (?off=krai2): края №4–№6 не показываются в выборе (no=0), уже начатый мир края играет как был. */
const OFF2=!!(root.B2&&root.B2.off&&root.B2.off('krai2'));
const BG=['coal','ore','lime','wood','lumber','pig','steel','roll','cuore','cucon','cu','wire'],RAW={coal:1,ore:1,lime:1,wood:1,cuore:1};
// коэффициенты цены района: сырьё — h, переделы — f, отдельные товары — o
const kk=(h,f,o)=>{const k={};for(const g of BG)k[g]=RAW[g]?h:f;return Object.assign(k,o||{});};
Object.assign(K.ico,{
  fish:{c:'#3f88b5',p:[['b','M5 20C10 12 22 11 29 20C22 29 10 28 5 20Z'],['b','M29 20L36 14V26Z'],['l','M11 18a1.8 1.8 0 1 0 .1 0Z']]},
  ikra:{c:'#e0603a',p:[['b','M10 14h20v18a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3Z'],['b','M9 9h22v5H9z'],['l','M15 22a2 2 0 1 0 .1 0ZM21 20a2 2 0 1 0 .1 0ZM24 26a2 2 0 1 0 .1 0ZM17 28a2 2 0 1 0 .1 0Z']]},
  gas:{c:'#e08a1e',p:[['b','M20 5C26 14 31 19 31 25A11 11 0 0 1 9 25C9 19 14 14 20 5Z'],['l','M20 17C23 22 25 24 25 27A5 5 0 0 1 15 27C15 24 17 22 20 17Z']]},
  honey:{c:'#d99a12',p:[['b','M11 14h18v19a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2Z'],['b','M10 9h20v5H10z'],['l','M15 20l5-3 5 3v6l-5 3-5-3z']]},
  tour:{c:'#3c8d4a',p:[['b','M3 33L14 14L21 25L27 17L37 33Z'],['l','M14 14L18 21H10Z'],['l','M27 17L30 22H24Z']]},
  batt:{c:'#2f9e5a',p:[['b','M7 12h24v18H7z'],['b','M31 17h3v8h-3z'],['l','M10 15h8v12h-8z'],['b','M24 15l-3 6h4l-3 6']]}});
Object.assign(K.oico,{
  fishb:{c:['#4a90b8','#2b5d7a','#cfe6f2'],p:[['d','M2 40h44v4H2z'],['b','M4 30h40l-6 10H10z'],['l','M14 20h14v10H14z'],['d','M30 10h3v20h-3z'],['l','M33 11l9 7h-9z']]},
  fishf:{c:['#5b8fa8','#355f73','#f0b08a'],p:[['b','M4 44V22h26v22z'],['d','M4 22l13-8 13 8z'],['l','M9 28h6v6H9zM19 28h6v6h-6z'],['b','M32 30h12v14H32z'],['d','M36 10h4v20h-4z']]},
  shelf:{c:['#7a8a99','#45525e','#f2a33a'],p:[['d','M2 42c6-3 10 3 16 0s10 3 16 0 10 3 12 0v4H2z'],['d','M10 24h4v18h-4zM34 24h4v18h-4z'],['b','M6 18h36v6H6z'],['l','M20 4h4v14h-4z'],['l','M27 9h8v9h-8z']]},
  apiary:{c:['#e0a526','#9a6d12','#f7dc8a'],p:[['d','M2 40h44v4H2z'],['b','M6 24h14v16H6z'],['d','M5 20h16v4H5z'],['b','M28 24h14v16H28z'],['d','M27 20h16v4H27z'],['l','M10 30h6v2h-6zM32 30h6v2h-6z']]},
  turbase:{c:['#8b5e3c','#5a3a22','#a8d69a'],p:[['l','M0 40L12 18L22 32L30 22L48 40Z'],['b','M14 44V32l10-8 10 8v12z'],['d','M12 32l12-10 12 10h-3l-9-7-9 7z'],['l','M21 36h6v8h-6z']]},
  battf:{c:['#5f6f86','#36414f','#7fe08a'],p:[['b','M4 44V20l10 6V20l10 6V20l10 6v18z'],['d','M36 8h5v36h-5z'],['l','M10 32h7v8h-7zM21 32h7v8h-7z'],['d','M2 44h44v2H2z']]}});

/* =================== KRAI2: край №4 — Сахалин «Рыба и шельф» =================== */
// Правило «Путина»: июль–сентябрь флот ловит ×2,4, но сырая рыба в путину дешевле на 15 %; декабрь–март лёд — флот ловит 30 %; ноябрь–декабрь икра дороже на 35 %
// (к Новому году). Плюс шторма (события края): флот и платформа на месяц почти встают. Решения: склад-«холодильник» к путине, рыбокомбинат (рыба → икра)
// работает весь год на летних запасах, икру — продать к Новому году; большая платформа на шельфе — дорогая, но рыба от неё не зависит (кроме шторма).
K.sah={no:OFF2?0:4,n:['Сахалин','Sakhalin'],sub:['Рыба и шельф','Fish and the offshore shelf'],xy:[142.7,50.2],col:'#1f7a8c',ico:'fish',need:{st:3},
  cap:1.4e9,ipo:3.4e9,home:'kuz',
  reg:{
    kuz:{n:'Южно-Сахалинск',ng:'Южно-Сахалинска',en:'Yuzhno-Sakhalinsk',city:'Южно-Сахалинск',ce:'Yuzhno-Sakhalinsk',ex:24e6,xy:[142.7,46.95],
      k:kk(.86,.92,{fish:.95,ikra:1,gas:.9}),p:{coal:.32,wood:.2,lime:.08,fish:.1}},
    ural:{n:'Курилы',ng:'Курил',en:'Kuril Islands',city:'Курильск',ce:'Kurilsk',ex:30e6,xy:[151.2,45.9],
      k:kk(.76,.86,{fish:.9,ikra:.97,gas:.82}),p:{fish:.62,lime:.05}},
    kar:{n:'Шельф',ng:'шельфа',en:'Offshore',city:'Ноглики',ce:'Nogliki',ex:40e6,xy:[143.1,51.8],
      k:kk(.8,.88,{fish:.88,ikra:.95,gas:.95}),p:{gas:.48,fish:.16,wood:.08}}},
  km:{'kuz-ural':450,'kar-ural':900,'kar-kuz':650},
  goods:{fish:{n:'Рыба (лосось, минтай)',en:'Fish (salmon, pollock)',u:'т',ue:'t',p:110000,V:40000,s:.012},
         ikra:{n:'Красная икра',en:'Red caviar',u:'т',ue:'t',p:5.5e6,V:600,s:.012},
         gas:{n:'Газовый конденсат',en:'Gas condensate',u:'т',ue:'t',p:28000,V:250000,s:.009}},
  dep:{fish:{res:[40e3,110e3],vc:[55000,65000]},gas:{res:[500e3,1400e3],vc:[13500,16500]}},
  obj:{fishb:{seg:'mine',n:'Рыболовецкий флот',en:'Fishing fleet',dep:'fish',out:'fish',capex:560e6,mo:3,cap:1000,fix:5e6,life:120},
       shelf:{seg:'mine',n:'Платформа на шельфе',en:'Offshore platform',dep:'gas',out:'gas',capex:1100e6,mo:6,cap:5000,fix:12e6,life:180},
       fishf:{seg:'mine',n:'Рыбокомбинат (икра)',en:'Fish plant (caviar)',out:'ikra',in:{fish:20},capex:1100e6,mo:5,cap:25,vc:1.5e6,fix:8e6,life:200}},
  mine:{fish:'fishb',gas:'shelf'},ord:['fishb','shelf','fishf'],sg:{fish:'mine',ikra:'mine',gas:'mine'},
  bots:{bars:[['limepit','kuz'],['coalpit','kuz']],bear:[['coalpit','kuz'],['fishb','ural']],owl:[['coalpit','kuz'],['fishb','kar']],beav:[['logging','kuz'],['sawmill','kuz']],loc:[['fishb','ural'],['fishb','kar']]},
  rival:{id:'loc',n:'Островной улов',en:'Island Catch',who:'Глеб Корюшкин',whoe:'Gleb Koryushkin',ch:'bold',col:'#2a6f97',f:.66,ex:.45,lev:2,max:6,like:['fish','gas'],reg:['ural','kar']},
  rule:{id:'putina',n:['Путина','Fishing season'],
    t:['Июль–сентябрь флот ловит в 2,4 раза больше, но сырая рыба в это время дешевле на 15 %. С декабря по март лёд — флот ловит треть. Икра к Новому году (ноябрь–декабрь) дороже на 35 %. И шторма: флот и платформа могут встать на месяц.',
       'July to September the fleet catches 2.4× more, but raw fish is 15% cheaper then. From December to March there’s ice — the fleet catches a third. Caviar before New Year (November–December) is 35% dearer. And storms: the fleet and the platform can stop for a month.'],
    prod:[{m:[6,7,8],x:2.4,t:['fishb']},{m:[11,0,1,2],x:.3,t:['fishb']},{m:[3,4,5,9,10],x:.8,t:['fishb']}],
    px:[{m:[6,7,8],g:['fish'],x:.85},{m:[10,11],g:['ikra'],x:1.35}],
    ev:[{k:'storm',w:3,p:.13,mo:1,prod:{x:.25,t:['fishb','shelf']},n:['Шторм: флот у причала, платформа стоит','Storm: the fleet is in port, the platform has stopped']},
        {k:'quota',w:1,mo:2,px:{g:['fish','ikra'],x:1.2},n:['Соседям урезали квоты: рыба и икра дороже на 20 %','Neighbours’ quotas were cut: fish and caviar 20% dearer']},
        {k:'ferry',w:1,mo:1,cash:-25e6,n:['Паром на ремонте: запчасти везли самолётом — 25 млн','The ferry is under repair: parts flown in — 25 mln']}],
    ss:[{m:[6,7,8],ico:'🐟',n:['Путина','Fishing season'],t:['флот ловит ×2,4, сырая рыба дешевле на 15 % — копите её для рыбокомбината','the fleet catches ×2.4, raw fish 15% cheaper — store it for the fish plant']},
        {m:[10],ico:'🎄',n:['Икра к Новому году','New Year caviar'],t:['икра дороже на 35 %; с декабря лёд','caviar 35% dearer; ice from December']},
        {m:[11],ico:'🎄',n:['Икра к Новому году','New Year caviar'],t:['икра дороже на 35 %, а флот во льдах ловит треть','caviar 35% dearer, while the fleet in the ice catches a third'],dk:1},
        {m:[0,1,2],ico:'❄',n:['Лёд','Ice'],t:['флот ловит треть — рыбокомбинат живёт летними запасами','the fleet catches a third — the fish plant lives on summer stock'],dk:1}],
    s0:{ico:'🌊',n:['Межсезонье','Off season'],t:['флот ловит 80 % от обычного; путина — с июля','the fleet catches 80% of normal; the season starts in July']},
    tip:[{m:[5],o:['fishb'],t:['С июля путина: флот наловит в 2,4 раза больше, а сырая рыба подешевеет. Проверьте склад — лишняя рыба пригодится зимой, когда флот во льдах. И подумайте о рыбокомбинате: икра к Новому году дороже на 35 %.',
        'The fishing season starts in July: the fleet will catch 2.4× more, and raw fish gets cheaper. Check your warehouse — spare fish will come in handy in winter when the fleet is iced in. And think about a fish plant: caviar before New Year is 35% dearer.']},
         {m:[9],o:['fishf'],t:['Ноябрь и декабрь — сезон икры: она на 35 % дороже. Если на складе есть икра — можно придержать её до ноября.','November and December are caviar season: 35% dearer. If you have caviar in stock, you can hold it until November.']}]},
  stars:[{k:'ipo'},{k:'rival'},{k:'sold',g:'ikra',q:800}],
  cond:['money','north','green'],mg:'ulov',story:'sah',
  map:{bg:'#d3e9f1',land:'#eef6f1',ink:'#16404d',
    c:[[141.9,46.6],[142.1,48],[141.9,49.5],[142.1,51],[142.3,52.6],[142.7,53.7],[142.6,54.3],[143.2,54.3],[143.4,53.2],[143.2,52],[143.3,50.8],[144.2,49.3],[144.7,48.8],[143.5,49.2],[142.9,48],[143.2,47.2],[142.8,46.7],[143.4,46.3],[142.5,45.9]],
    rv:[[[142.6,49.1],[142.8,50.2],[143.0,51.3]]],
    rd:[['kuz','kar','rail'],['kuz','ural','sea'],['kar','ural','sea']]},
  t:{hi:['Сахалин! Рыба и шельф. Главное здесь — путина: в июле–сентябре флот ловит в разы больше, а зимой стоит во льдах. Рыбокомбинат превращает летний улов в икру — к Новому году она дороже. И берегитесь штормов.',
         'Sakhalin! Fish and the offshore shelf. The main thing here is the fishing season: in July–September the fleet catches many times more, and in winter it’s stuck in the ice. A fish plant turns the summer catch into caviar — dearer before New Year. And beware of storms.'],
     win:['Сахалин покорён! Путина, икра и шельф — наши.','Sakhalin conquered! The fishing season, the caviar and the shelf are ours.'],
     st2:['Обогнать «Островной улов»','Beat Island Catch'],st3:['Продать 800 т красной икры','Sell 800 t of red caviar']}};

/* =================== KRAI2: край №5 — Алтай «Мёд, травы и турбазы» =================== */
// Правило «Турсезон»: июнь–август турбазы полны (×1,7), пасеки дают мёд (×2,4), но надзор бережёт горы — карьеры, рудники и лесозаготовки работают на 60 %.
// В новогодние каникулы турбазы ×1,15, в межсезонье ×0,55; пасеки зимой спят (×0,3). Первый холдинг, где главная выручка — не сырьё, а гости.
// Решения: турбаза (ест мёд — «медовый чай») вместо очередного карьера; мёд копить летом на весь год; кредиты подешевле — звезда.
const PITS=['coalpit','orepit','limepit','cupit','logging'];
K.alt={no:OFF2?0:5,n:['Алтай','Altai'],sub:['Мёд, травы и турбазы','Honey, herbs and tourist lodges'],xy:[86.2,51.2],col:'#4c8b2b',ico:'honey',need:{st:5},
  cap:1.6e9,ipo:3.6e9,home:'kuz',
  reg:{
    kuz:{n:'Бийск',ng:'Бийска',en:'Biysk',city:'Бийск',ce:'Biysk',ex:20e6,xy:[85.2,52.5],
      k:kk(.9,.95,{honey:.95,tour:.85}),p:{wood:.2,lime:.15,honey:.25,coal:.06}},
    ural:{n:'Телецкое озеро',ng:'Телецкого озера',en:'Lake Teletskoye',city:'Артыбаш',ce:'Artybash',ex:26e6,xy:[87.7,51.5],
      k:kk(.84,.9,{honey:1,tour:1}),p:{honey:.4,wood:.18}},
    kar:{n:'Кош-Агач',ng:'Кош-Агача',en:'Kosh-Agach',city:'Кош-Агач',ce:'Kosh-Agach',ex:32e6,xy:[88.1,50.0],
      k:kk(.8,.86,{honey:.9,tour:.92}),p:{cuore:.3,ore:.25,honey:.12}}},
  km:{'kuz-ural':260,'kar-ural':420,'kar-kuz':560},
  goods:{honey:{n:'Алтайский мёд',en:'Altai honey',u:'т',ue:'t',p:420000,V:3000,s:.008},
         tour:{n:'Гости турбаз',en:'Lodge guests',u:'чел.',ue:'guests',p:55000,V:40000,s:.006}},
  dep:{honey:{res:[4000,10000],vc:[230000,270000]}},
  obj:{apiary:{seg:'mine',n:'Пасека и травяной сбор',en:'Apiary and herb farm',dep:'honey',out:'honey',capex:230e6,mo:2,cap:80,fix:2e6,life:120},
       turbase:{seg:'serv',n:'Турбаза',en:'Tourist lodge',out:'tour',in:{honey:.012},capex:1350e6,mo:5,cap:2500,vc:26000,fix:9e6,life:240}},
  mine:{honey:'apiary'},ord:['apiary','turbase'],sg:{honey:'mine',tour:'serv'},
  bots:{bars:[['limepit','kuz'],['orepit','kar']],bear:[['coalpit','kuz'],['cupit','kar']],owl:[['apiary','ural'],['limepit','kuz']],beav:[['logging','ural'],['sawmill','kuz']],loc:[['apiary','ural'],['apiary','kuz'],['turbase','ural']]},
  rival:{id:'loc',n:'Алтай-Дар',en:'Altai Gift',who:'Айдар Ойношев',whoe:'Aidar Oinoshev',ch:'calc',col:'#7a9a2e',f:.66,ex:.45,lev:2.5,max:7,like:['honey'],reg:['ural','kuz']},
  rule:{id:'tur',n:['Турсезон','Tourist season'],
    t:['Июнь–август турбазы полны (×1,7), пчёлы несут мёд (×2,4), но надзор бережёт горы — карьеры, рудники и лесозаготовки работают на 60 %. Зимой пасеки спят, а турбазы оживают только в новогодние каникулы.',
       'June to August lodges are full (×1.7), bees bring honey (×2.4), but the eco-watch protects the mountains — pits, mines and logging run at 60%. In winter the apiaries sleep, and lodges come alive only for the New Year holidays.'],
    prod:[{m:[5,6,7],x:1.7,t:['turbase']},{m:[11,0],x:1.15,t:['turbase']},{m:[1,2,3,9,10],x:.55,t:['turbase']},
          {m:[5,6,7],x:2.4,t:['apiary']},{m:[4,8],x:.9,t:['apiary']},{m:[9,10,11,0,1,2,3],x:.3,t:['apiary']},
          {m:[5,6,7],x:.6,t:PITS}],
    ev:[{k:'insp',w:2,p:.08,mo:1,prod:{x:.5,t:PITS},n:['Проверка заповедника: карьеры и рудники на половину мощности','Nature reserve inspection: pits and mines at half capacity']},
        {k:'blog',w:1,mo:2,px:{g:['tour','honey'],x:1.15},n:['Блогер снял ролик про Белуху: гости и мёд дороже на 15 %','A blogger filmed Belukha: lodge stays and honey 15% dearer']}],
    ss:[{m:[5,6,7],ico:'☀',n:['Турсезон','Tourist season'],t:['турбазы полны ×1,7, пасеки ×2,4, а карьеры и рудники по надзору — 60 %','lodges full ×1.7, apiaries ×2.4, while pits and mines run at 60% under the eco-watch']},
        {m:[11,0],ico:'⛷',n:['Каникулы','Holidays'],t:['новогодние гости: турбазы ×1,15; пасеки спят','New Year guests: lodges ×1.15; apiaries asleep'],dk:1},
        {m:[1,2,3,9,10],ico:'🍂',n:['Межсезонье','Off season'],t:['турбазы полупусты (×0,55), пасеки спят — мёд из летних запасов','lodges half-empty (×0.55), apiaries asleep — honey from summer stock']}],
    s0:{ico:'🌼',n:['Край сезона','Shoulder season'],t:['турбазы и пасеки работают как обычно','lodges and apiaries work as usual']},
    tip:[{m:[4],t:['С июня турсезон: турбазы будут полны, а карьеры и рудники надзор урежет до 60 % на всё лето. Если думаете о новой стройке — турбаза летом окупается быстрее, чем карьер.',
        'The tourist season starts in June: lodges will be full, while the eco-watch cuts pits and mines to 60% all summer. If you’re planning a new build, a lodge pays back faster in summer than a pit.']},
         {m:[7],o:['turbase'],t:['Пасеки летом дают почти весь мёд года, а турбазы едят его круглый год. Не продавайте весь мёд — оставьте запас на зиму.',
        'Apiaries make almost all of the year’s honey in summer, while the lodges eat it all year round. Don’t sell all the honey — keep a stock for winter.']}]},
  stars:[{k:'ipo'},{k:'noloan',r:.19},{k:'sold',g:'tour',q:60000}],
  cond:['money','green'],mg:'paseka',story:'alt',
  map:{bg:'#e3eed8',land:'#f6f9ee',ink:'#2c4a1e',
    c:[[84.4,52.1],[85.1,52.8],[86.6,52.9],[87.4,52.5],[88.2,52.2],[89,51.7],[89.7,51.2],[89.6,50.5],[88.4,49.6],[87.3,49.1],[86.6,49.5],[85.4,49.6],[84.2,50.3],[83.5,50.9],[83.9,51.6]],
    rv:[[[86.6,49.8],[86.2,50.4],[86,51.3],[85.9,51.9],[85.3,52.5]],[[87.4,51.5],[86.5,52.3],[85.3,52.5]]],
    rd:[['kuz','ural','road'],['ural','kar','road']]},
  t:{hi:['Алтай! Мёд, травы и турбазы — первый край, где главные деньги не в недрах, а в гостях. Летом турбазы полны и пчёлы работают, но горы под надзором: карьеры летом работают на 60 %. Турбазе нужен мёд — «медовый чай» гости любят.',
         'Altai! Honey, herbs and tourist lodges — the first region where the big money isn’t underground but in guests. In summer the lodges are full and the bees busy, but the mountains are protected: pits run at 60% in summer. Lodges need honey — guests love the honey tea.'],
     win:['Алтай покорён! Мёд, горы и гости — наши.','Altai conquered! The honey, the mountains and the guests are ours.'],
     st2:['Без кредитов дороже 19 %','No loans above 19%'],st3:['Принять 60 тыс. гостей','Host 60k guests']}};

/* =================== KRAI2: финал №6 — «Корпорация» =================== */
// Правило «Большая биржа»: события рынка чаще и крупнее (госзаказ, санкции, медный бум, ФАС, сбой поставок); в октябре–декабре госзаказ — аккумуляторы +20 %.
// Карта — вся страна: штаб в Москве, медь и железо на Урале, никель в Заполярье — 1800–3300 км. Цель — своя цепочка руда → никель/медь → аккумуляторы.
// Решения: где плавить (везти руду через страну дорого — плавить на месте, а в Москву — металл); завод аккумуляторов (2,6 млрд) — когда и на какие деньги.
K.corp={no:OFF2?0:6,n:['Корпорация','The Corporation'],sub:['Вся страна — одна компания','The whole country, one company'],xy:[37.6,55.75],col:'#9a7419',ico:'batt',need:{all:['yak','nor','sah','alt']},
  cap:2.0e9,ipo:5.0e9,home:'ural',
  reg:{
    kuz:{n:'Москва',ng:'Москвы',en:'Moscow',city:'Москва',ce:'Moscow',ex:35e6,xy:[37.6,55.75],
      k:kk(1,1.04,{niore:.95,ni:1.02,batt:1.06}),p:{lime:.1,wood:.06}},
    ural:{n:'Урал',ng:'Урала',en:'Urals',city:'Екатеринбург',ce:'Yekaterinburg',ex:25e6,xy:[60.6,56.8],
      k:kk(1,1,{niore:.9,ni:.98,batt:.98}),p:{ore:.3,cuore:.26,coal:.1,lime:.1}},
    kar:{n:'Заполярье',ng:'Заполярья',en:'The Far North',city:'Норильск',ce:'Norilsk',ex:36e6,xy:[88.2,69.3],
      k:kk(.82,.9,{niore:.88,ni:.95,batt:.9}),p:{niore:.5,coal:.2}}},
  km:{'kuz-ural':1800,'kar-ural':2400,'kar-kuz':3300},
  goods:{niore:{n:'Медно-никелевая руда',en:'Copper-nickel ore',u:'т',ue:'t',p:9000,V:300000,s:.007},
         ni:{n:'Никель',en:'Nickel',u:'т',ue:'t',p:1.45e6,V:3000,s:.01},
         batt:{n:'Аккумуляторы для электробусов',en:'E-bus batteries',u:'т',ue:'t',p:2.4e6,V:2000,s:.011}},
  dep:{niore:{res:[900e3,2400e3],vc:[4800,6200]}},
  obj:{nipit:{seg:'mine',n:'Никелевый рудник',en:'Nickel mine',dep:'niore',out:'niore',capex:650e6,mo:4,cap:15000,fix:9e6,life:150},
       nismelt:{seg:'copper',n:'Никелевый завод',en:'Nickel smelter',out:'ni',in:{niore:110},capex:1200e6,mo:6,cap:140,vc:80000,fix:12e6,life:240},
       battf:{seg:'copper',n:'Завод аккумуляторов',en:'Battery plant',out:'batt',in:{ni:.25,cu:.15},capex:2600e6,mo:6,cap:80,vc:700000,fix:14e6,life:240}},
  mine:{niore:'nipit'},ord:['nipit','nismelt','battf'],sg:{niore:'mine',ni:'copper',batt:'copper'},
  bots:{bars:[['orepit','ural'],['limepit','ural']],bear:[['coalpit','kar'],['orepit','ural']],owl:[['cupit','ural'],['nipit','kar']],beav:[['logging','kuz'],['sawmill','kuz']],loc:[['nipit','kar'],['cupit','ural'],['limepit','ural']]},
  rival:{id:'loc',n:'Быстров Групп',en:'Bystrov Group',who:'Арсений Быстров',whoe:'Arseny Bystrov',ch:'bold',col:'#37474f',f:.7,ex:.45,lev:2.5,max:7,like:['niore','cuore','ore'],reg:['ural','kar']},
  rule:{id:'birzha',n:['Большая биржа','The big exchange'],
    t:['Каждый шаг корпорации видит биржа: раз в несколько месяцев — новость рынка. Госзаказ, санкции, медный бум, проверка — к чему-то надо быть готовым. А в октябре–декабре госзаказ на электробусы: аккумуляторы дороже на 20 %.',
       'The exchange watches every step of a corporation: every few months there’s market news. A state order, sanctions, a copper boom, an inspection — be ready for anything. And in October–December there’s the state e-bus order: batteries are 20% dearer.'],
    px:[{m:[9,10,11],g:['batt'],x:1.2}],
    ev:[{k:'gos',w:2,p:.16,mo:3,px:{g:['batt'],x:1.3},n:['Госзаказ на электробусы: аккумуляторы дороже на 30 %','State e-bus order: batteries 30% dearer']},
        {k:'sanc',w:1,mo:3,px:{g:['ni','niore'],x:.8},n:['Санкции на никель: никель дешевле на 20 %','Nickel sanctions: nickel 20% cheaper']},
        {k:'boom',w:2,mo:2,px:{g:['cuore','cucon','cu','wire'],x:1.2},n:['Медный бум на бирже: медь дороже на 20 %','Copper boom on the exchange: copper 20% dearer']},
        {k:'fas',w:1,mo:1,cash:-60e6,n:['Проверка ФАС: юристы и штраф — 60 млн','Antitrust inspection: lawyers and a fine — 60 mln']},
        {k:'chip',w:1,mo:1,prod:{x:.6,t:['battf']},n:['Сбой поставок электроники: завод аккумуляторов на 60 %','Electronics supply glitch: the battery plant at 60%']}],
    ss:[{m:[9,10,11],ico:'🏛',n:['Госзаказ','State order'],t:['аккумуляторы дороже на 20 % — до конца года','batteries 20% dearer until the year’s end']}],
    s0:{ico:'📈',n:['Биржа','Exchange'],t:['рынок ждёт новостей; госзаказ — с октября','the market awaits news; the state order starts in October']},
    tip:[{m:[8],o:['battf'],t:['С октября госзаказ: аккумуляторы на 20 % дороже до конца года. Если на складе есть аккумуляторы — придержите до октября.',
        'The state order starts in October: batteries 20% dearer until the year’s end. If you have batteries in stock, hold them until October.']}]},
  stars:[{k:'ipo'},{k:'built',t:'battf'},{k:'rival'}],
  cond:['money','north','green'],story:'corp',
  map:{bg:'#ece6d8',land:'#faf7ef',ink:'#3a3020',
    c:[[30,69.5],[41,67],[44,68],[54,68.5],[60,69.8],[68,72.5],[80,73.5],[90,75.5],[104,77.7],[113,73.8],[112,66],[110,58],[107,52],[98,50],[88,49.5],[82,50.5],[69,55],[61,54],[60,51],[52,51.5],[48,46.5],[47.5,41.5],[40,43.5],[37,45],[39.5,47.5],[40,50],[35,52],[32,52.5],[31.5,55.5],[28,56.5],[27.5,58],[28,59.5],[30,61],[29.5,63]],
    rv:[[[86,68.2],[86.2,69.4],[84,71],[82.5,72.4]],[[60.5,56.8],[66,58],[69,61],[68,66],[67,70]]],
    rd:[['kuz','ural','rail'],['ural','kar','sea']]},
  t:{hi:['Корпорация! Все ваши края — теперь одна компания, штаб — в Москве. Никель в Заполярье, медь на Урале, а в Москве можно поставить завод аккумуляторов для электробусов. Биржа следит за каждым шагом: раз в несколько месяцев — новость рынка.',
         'The Corporation! All your regions are now one company, headquartered in Moscow. Nickel in the Far North, copper in the Urals — and in Moscow you can build a battery plant for e-buses. The exchange watches every step: every few months there’s market news.'],
     win:['Корпорация на бирже! «Магнат» — навсегда. Дальше — свободная игра: переигрывайте края за звёздами и бейте свои рекорды.','The Corporation is listed! A tycoon for ever. From here it’s free play: replay regions for stars and beat your records.'],
     st2:['Свой завод аккумуляторов к IPO','Your own battery plant by the IPO'],st3:['Обогнать «Быстров Групп»','Beat Bystrov Group']}};

})(typeof window!=='undefined'?window:globalThis);
