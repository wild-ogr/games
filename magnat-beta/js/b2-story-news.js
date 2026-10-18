/* b2-story-news.js — STORY: «Вестник района» (газетная вырезка в окне «Закрытие месяца») и «Итоги года» (декабрь игры; и по настоящей дате 28.12–10.01).
   Грузится по требованию из b2-story.js. Заголовок — по событию месяца (глава, рекорд, открытие, торги, событие точки, Борис, убыток, край, сезон…),
   без повторов последних 12; под ним — реплика Людмилы Санны. В VK — «📤 Похвастаться» с текстом заголовка (SOC_BRAG.b2news). Шаблоны: {h}/{H} — герой,
   {b} — дело, {c} — город, {s} — сумма, {n} — число, {g} — товар, {a|б} — мужской|женский род. */
(function(root){'use strict';
const B2=root.B2;if(!B2||!B2.story)return;
const BS=B2.story,esc=BS.esc,E=root.ECON;
const T=(r,e)=>typeof L==='function'?L(r,e):r;
const en=()=>typeof LANG!=='undefined'&&LANG==='en';
const fem=()=>{try{return !!(root.HERO&&HERO.fem&&HERO.fem());}catch(e){return false;}};
const money=x=>root.FMT?FMT.money(x):Math.round(x)+' ₽';
const low=s=>s?s.charAt(0).toLowerCase()+s.slice(1):s,cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
function hero(){let n='';try{n=root.HERO&&HERO.name?HERO.name():'';}catch(e){}return n||(en()?'a local entrepreneur':fem()?'местная предпринимательница':'местный предприниматель');}
// шаблоны: [рус, англ]; категория → список
const N={
 stage_small:[['Подработка окончена: {h} {открыл|открыла} своё дело. Соседи по подъезду: «Мы всегда знали — {он|она} даже листовки клеил{|а} ровно»','Side jobs are over: {h} has opened a business. The neighbours: “We always knew — even the flyers were straight”'],
   ['На районе новое своё дело. Владел{ец|ица}: «Начинал{|а} с велосипеда, продолжаю с велосипедом, но теперь ещё и с ИП»','A new business on the block. The owner: “Started with a bicycle, still on a bicycle — but now a registered one”']],
 stage_mid:[['Зарегистрировано ООО! Соседи заметили: {h} теперь здоровается по-деловому — «Доброе утро, коллеги» — даже с дворником','A company is registered! Neighbours noticed {h} now greets everyone like a CEO — “Good morning, colleagues” — even the janitor'],
   ['Сеть растёт: точки {h} — по всему району. Конкуренты в растерянности, голуби в восторге: крошек стало больше','The chain is growing: {h}’s outlets are all over the district. Rivals are puzzled, pigeons delighted: more crumbs']],
 stage_quarry:[['Из ларька — в карьер. {H} {купил|купила} участок. На вопрос «зачем вам щебень?» ответ: «Щебень — это ларёк, который не портится»','From kiosk to quarry. {H} has bought a plot. Asked “why gravel?”: “Gravel is a kiosk that never goes off”']],
 stage_nedra:[['Большая лига: {h} {получил|получила} письмо из федерального агентства. Почта повесила копию конверта на стенд «Наши земляки»','The big league: {h} has received a letter from the federal agency. The post office pinned a copy of the envelope to its “Local Heroes” board']],
 arr_yak:[['На северных приисках — новичок из Кузбасса. Первое заявление: «Мы привезли тёплые носки и уважение к морозу»','A newcomer from Kuzbass at the northern gold fields. First statement: “We brought warm socks and respect for the frost”']],
 arr_nor:[['В Норильске начал работу новый холдинг. Директор по свету уже развесил гирлянды на проходной — «чтобы полярная ночь была нарядной»','A new holding opens in Norilsk. Its director of lighting has already hung fairy lights over the gate — “so the polar night looks festive”']],
 arr_sak:[['На Сахалин пришёл новый рыбный игрок. Чайки провели собрание и приняли его в свой профсоюз','A new fishing player arrives on Sakhalin. The seagulls held a meeting and admitted him to their union']],
 arr_alt:[['На Алтае новый хозяин пасек и турбаз. Пчёлы приняли сдержанно, туристы — восторженно','The Altai has a new owner of apiaries and lodges. The bees were reserved, the tourists ecstatic']],
 arr_h:[['Холдинг №{n} начал работу. Старожилы говорят: «Не остановится» — и, похоже, правы','Holding No. {n} is open for business. Old-timers say: “Won’t stop” — and they seem to be right']],
 rec:[['Рекорд! Дело {h} заработало за месяц {s}. Людмила Санна пересчитала трижды и пошла за тортом','A record! {h}’s business earned {s} this month. Lyudmila Sanna counted three times and went to get a cake'],
   ['Лучший месяц в истории компании: {s} прибыли. Владел{ец|ица} скромничает: «Это всё погода. И немного я»','The best month in company history: {s} profit. The owner is modest: “It was the weather. And a little bit me”'],
   ['{s} за месяц — новый рекорд. Конкуренты просят проверить, не печатает ли {h} деньги. Проверили — печатает только чеки','{s} in a month — a new record. Rivals asked to check whether {h} prints money. Checked: only receipts'],
   ['Прибыль {s}: так хорошо на районе не жили с тех пор, как открыли вторую хлебную','{s} profit: the district hasn’t had it this good since the second bakery opened'],
   ['Рекордный месяц — {s}. У главного входа появилась табличка «Здесь было рекордно»','A record month — {s}. A plaque by the main door now reads “A record happened here”']],
 open:[['Открылась новая точка — {b}. В первый день очередь: в основном соседи, которые «просто посмотреть»','A new outlet opens — {b}. A queue on day one: mostly neighbours “just having a look”'],
   ['Ещё одна точка — {b} — и снова с ленточкой. Владел{ец|ица} признаётся: ножницы для ленточек уже затупились','Another outlet — {b} — another ribbon. The owner admits the ribbon scissors are getting blunt'],
   ['Открытие: {b} начинает работу. Местный кот проверил помещение и одобрил','Grand opening: {b} is up and running. The local cat inspected the premises and approved'],
   ['{B} — плюс одна точка у {h}. Конкуренты переглянулись и пошли пересчитывать свои','{B} — one more outlet for {h}. Rivals exchanged glances and went to recount theirs']],
 openN:[['Сразу {n} новых точек за месяц! Жители спрашивают, не откроется ли что-нибудь у них в подъезде. Пока нет. Пока','{n} new outlets in one month! Residents are asking if something will open in their stairwell. Not yet. Not yet'],
   ['{n} открытий за месяц. Слесарь, вешающий вывески, купил себе новую стремянку','{n} openings in a month. The sign-hanging handyman bought himself a new ladder']],
 opi:[['Торги выиграны! {H} теперь {владелец|владелица} горы щебня. Буквально','Auction won! {H} now owns a mountain of gravel. Literally'],
   ['Новый карьер: экскаватор прибыл, каски выданы, Пётр Барсуков лично проверил, что они на головах','A new quarry: the excavator’s here, hard hats issued, Pyotr Barsukov personally checked they’re on heads']],
 won:[['Лицензия получена: месторождение — наше. Геологи поздравили друг друга молотками. Аккуратно','Licence granted: the deposit is ours. The geologists congratulated each other with hammers. Gently'],
   ['На торгах за участок победил{|а} {h}. Соперники ушли пешком — подвезти их было некому','{H} won the plot auction. The rivals walked home — nobody offered a lift']],
 built:[['Запущен новый объект. О ковш экскаватора разбили бутылку лимонада — шампанское решили оставить на IPO','A new facility is up. A bottle of lemonade was smashed on the excavator bucket — the champagne is being saved for the IPO'],
   ['Стройка сдана в срок. Прораб в шоке, город в шоке, Людмила Санна — нет: она всё посчитала заранее','Construction finished on time. The foreman is shocked, the town is shocked, Lyudmila Sanna isn’t: she did the maths in advance'],
   ['Объект сдан! Рабочие получили премию, начальство — повод наконец выспаться','Facility handed over! The crew got a bonus, the bosses got a reason to finally sleep']],
 good:[['Удача на точке — {b}. Владел{ец|ица}: «Удача любит тех, кто открывается в восемь утра»','Luck strikes at {b}. The owner: “Luck loves those who open at eight a.m.”'],
   ['{B} — звезда района: ролик с котом за прилавком набрал полмиллиона просмотров. Кот требует долю','{B} is the district’s star: a clip of the cat behind the counter got half a million views. The cat wants a cut']],
 bad:[['На точке «{b}» неприятность, но владел{ец|ица} не унывает: «Будет что рассказать на встрече выпускников»','Trouble at {b}, but the owner stays cheerful: “Something to tell at the class reunion”'],
   ['{B}: что-то сломалось, что-то починили. Мастер ушёл довольный, касса — чуть менее','{B}: something broke, something got fixed. The repairman left happy, the till slightly less so'],
   ['На {b} нагрянула проверка. Итог: замечаний нет, есть два заказа с собой','An inspection at {b}. The verdict: no remarks, two orders to go']],
 brk:[['Кофейный автомат «сломался» и выдал бесплатный капучино трём школьникам. Они называют это лучшим днём четверти','The coffee machine “broke” and gave three schoolkids free cappuccino. They call it the best day of term']],
 demol:[['Город попросил перенести ларёк. Ларёк переехал, покупатели — следом: «Мы за вами хоть на другую остановку»','The town asked for the kiosk to move. It moved, and the customers followed: “We’d follow you to another bus stop”']],
 bobr:[['Напротив точки {h} открылся ларёк Бориса Боброва. Жители выбирают, к кому идти, по погоде и настроению','Boris Bobrov opened a kiosk across from {h}’s. Locals pick a side by weather and mood'],
   ['Борис Бобров заявил, что его ларёк «ровно на сантиметр ближе к остановке». Замеры продолжаются','Boris Bobrov claims his kiosk is “exactly one centimetre closer to the bus stop”. Measurements continue']],
 rv_in:[['На рынок района вышла сеть {f}: {b}. Местные бабушки уже составили сравнительную таблицу цен','{F} has entered the district market: {b}. Local grannies have already drawn up a price comparison table']],
 rv_open:[['{F} открыли точку прямо напротив. Владел{ец|ица} точки {h}: «Конкуренция полезна. Особенно для покупателей и для меня»','{F} opened right across the street. {H}: “Competition is healthy. Especially for customers. And for me”'],
   ['Ещё одна вывеска {f} на районе. Голуби разрываются: крошки теперь в двух местах','Another {f} sign in the district. The pigeons are torn: crumbs in two places now']],
 rv_price:[['{F} снизили цены. Покупатели ходят туда-сюда и считают сдачу. Район в лёгкой ценовой лихорадке','{F} cut prices. Shoppers dash back and forth counting change. The district has a mild price fever']],
 rv_poach:[['{F} пытаются переманить управляющего у {h}. Управляющий взял паузу и пачку печенья — думает','{F} are trying to poach {h}’s manager. The manager took a break and a pack of biscuits — thinking it over']],
 rv_sell:[['{F} продают свои точки. Брокеры района впервые за год надели галстуки','{F} are selling their outlets. District brokers put on ties for the first time this year']],
 ovt:[['{H} {обогнал|обогнала} Бориса Боброва по капиталу. Бобров: «Это временно. Как и всё, кроме нашей дружбы»','{H} has overtaken Boris Bobrov in net worth. Bobrov: “It’s temporary. Like everything except our friendship”']],
 loss:[['Трудный месяц: дело в минусе. Владел{ец|ица}: «Это не убыток, это вложение в опыт». Людмила Санна молча подчеркнула цифру красным','A tough month: the business is in the red. The owner: “It’s not a loss, it’s an investment in experience.” Lyudmila Sanna silently underlined the figure in red'],
   ['Минус в отчёте. Аналитики района — две соседки на лавочке — уверены: «В следующем месяце отыграется»','A minus in the report. The district’s analysts — two neighbours on a bench — are sure: “Next month will make up for it”'],
   ['Месяц не задался. Зато, говорят, закалка характера — бесплатно','The month didn’t go well. But character-building, they say, is free']],
 od:[['Банк выдал {h} овердрафт. В банке отмечают: «Попросил{|а} вежливо, вернёт вовремя». Мы проследим','The bank gave {h} an overdraft. Bank staff say: “Asked politely, will repay on time.” We’ll keep an eye on it']],
 con:[['Подписан крупный контракт: {g}. Покупатель попросил «как в прошлый раз, только больше»','A big contract is signed: {g}. The buyer asked for “same as last time, only more”']],
 best:[['Лучшая точка месяца — {b} ({c}): выручка {s}. Персонал получил грамоту и право выбирать радиостанцию','Outlet of the month — {b} ({c}): revenue {s}. Staff got a certificate and the right to choose the radio station'],
   ['{B} признана лучшей на районе по версии таксистов. Владел{ец|ица}: «Коммерческая тайна и немного укропа»','{B} named best in the district by local taxi drivers. The owner: “Trade secret and a little dill”'],
   ['{B} — точка месяца ({s}). Секрет успеха, по словам продавца: «Улыбаюсь даже понедельникам»','{B} is outlet of the month ({s}). The secret, says the cashier: “I smile even at Mondays”']],
 k_yak:[['Мороз −48. Прииски работают, моржи отдыхают. Логист Виктор Козлов: «Зимник держит. Я тоже»','−48 outside. The gold fields work, the ice-swimmers rest. Logistics chief Viktor Kozlov: “The ice road holds. So do I”'],
   ['Старатели {h} нашли самородок в форме Кузбасса. Его поставят в кабинете — «на память о доме»','{h}’s prospectors found a nugget shaped like Kuzbass. It will sit in the office — “to remember home”']],
 k_nor:[['Полярная ночь в разгаре. Теплица «Пляж» дала первые огурцы — самые северные в компании','Polar night in full swing. The “Beach” greenhouse produced its first cucumbers — the company’s northernmost'],
   ['Рекордная плавка. Металлурги отметили её чаем и тремя минутами тишины — шумно было весь месяц','A record smelt. The metallurgists marked it with tea and three minutes of silence — it had been loud all month']],
 k_sak:[['Путина идёт! Рыбы столько, что сотрудники начали здороваться с ней по имени','The fish are running! So many that staff have started greeting them by name'],
   ['Шторм отменил паром, но не обед: повара сварили уху на всю смену','A storm cancelled the ferry, but not lunch: the cooks made fish soup for the whole shift']],
 k_alt:[['Пасека {h} собрала первый мёд. Пчёлы от комментариев отказались, но выглядели довольными','{h}’s apiary has its first honey. The bees declined to comment but looked pleased'],
   ['Турбаза приняла тысячного гостя. Им оказался бухгалтер, приехавший проверить меню','The lodge welcomed its thousandth guest. It was an accountant who came to check the menu']],
 m0:[['Новогодние каникулы: точки работают, а владел{ец|ица} обещает доесть оливье к пятнице','New Year holidays: the outlets are open, and the owner promises to finish the salad by Friday']],
 m2:[['8 Марта: все сотрудницы компании получили цветы. Сотрудники — список, где эти цветы купить в следующий раз','March 8th: every woman at the company got flowers. The men got a list of where to buy them next time']],
 m4:[['Майские: половина района на дачах, вторая половина — в очереди за шашлыком','May holidays: half the district is at the dacha, the other half queueing for barbecue']],
 m6:[['Лето! Мороженое тает, выручка растёт, кондиционеры работают на пределе','Summer! Ice cream melts, revenue rises, air conditioners run flat out']],
 m8:[['1 сентября: школьники снова у прилавков. Самый ходовой товар — «что-нибудь, чтобы не спать на первом уроке»','September 1st: schoolkids are back at the counters. Bestseller: “anything to stay awake in first period”']],
 m10:[['Ноябрь: темнеет рано, а точки светятся до девяти. Прохожие говорят, что заходят «на огонёк»','November: it gets dark early, but the outlets glow till nine. Passers-by say they “saw the light and popped in”']],
 m11:[['Декабрь: ёлки, мандарины, отчёты. Людмила Санна просит не путать мандарины с отчётами','December: trees, tangerines, reports. Lyudmila Sanna asks everyone not to mix up the tangerines and the reports']],
 g_g:[['Курьер {h} развёз за месяц больше заказов, чем местное почтовое отделение. Почтальоны просят поделиться маршрутом','Courier {h} delivered more orders this month than the local post office. The postmen want the route']],
 g_s:[['Своё дело {h} работает уже {n} мес. Соседи привыкли и теперь спрашивают: «А что дальше?»','{h}’s business has been running for {n} months. The neighbours are used to it and now ask: “What’s next?”']],
 g_m:[['В сети {h} — {n} точек. Говорят, с крыши девятиэтажки видно минимум три','{h}’s chain has {n} outlets. They say you can see at least three from the roof of a nine-storey block']],
 g_q:[['Карьер {h} работает. Жители окрестных сёл сверяют часы по взрывам — строго по графику','{h}’s quarry is working. Nearby villages set their clocks by the blasts — strictly on schedule']],
 g_n:[['Стоимость холдинга — {s}. Аналитики спорят, сколько это в шаурме. Сходятся на «очень много»','The holding is worth {s}. Analysts argue how much that is in shawarma. They settle on “a lot”'],
   ['Холдинг {h} растёт. На вопрос «в чём секрет?» главбух ответила: «Сначала считаем, потом радуемся»','{h}’s holding keeps growing. Asked for the secret, the chief accountant said: “First we count, then we celebrate”']]};
const LUD={rec:[['Я пересчитала трижды. Это правда. Не привыкайте.','I counted three times. It’s true. Don’t get used to it.'],['Рекорд — хорошо. Рекорд два месяца подряд — это уже план.','A record is nice. Two in a row is a plan.']],
  loss:[['В газете написали мягко. Я напишу точнее — в отчёте.','The paper was gentle. I’ll be more precise — in the report.'],['Бывает. В девяносто восьмом был минус в долларах — и ничего, живы.','It happens. In ’98 we were in the red in dollars — and we survived.']],
  open:[['Вырезку повешу над столом. Рядом с первой.','I’ll pin the clipping above my desk. Next to the first one.']],
  stage:[['Сохраните газету. Внукам покажете.','Keep this paper. Show it to your grandchildren.']],
  bad:[['Журналисты всё переврали. Но смешно.','The journalists got it all wrong. But it’s funny.']],
  gen:[['Хорошая заметка. Без цифр, правда. Цифры — у меня.','Nice piece. No figures, though. The figures are with me.'],['Покажу Соне — пусть знает, кому кредит давала.','I’ll show Sonya — so she knows who she lent to.'],['Газета врёт только в прогнозе погоды. Остальное — почти правда.','The paper only lies in the weather forecast. The rest is nearly true.']]};
const LC={rec:'rec',loss:'loss',od:'loss',open:'open',openN:'open',bad:'bad',brk:'bad',demol:'bad'};
/* что было в этом месяце */
function facts(W,rep){const m=rep.m,ns=(W.news||[]).filter(n=>n.m===m),o=[];const add=(k,p,x)=>o.push({k,p,x:x||{}});
  const st=ns.find(n=>n.k==='biz'&&n.a&&n.a.k==='stage');if(st)add('stage_'+st.a.st,100);
  const F=W.fr;if(W.hold>=2&&F&&typeof F.h0==='number'&&m-F.h0<=1){const k=BS.kraiId(W);add(k?'arr_'+k:'arr_h',95,{n:W.hold});}
  const hs=W.hist||[],h=hs.find(x=>x.m===m),np=h?h.np:0,pr=hs.filter(x=>x.m<m);
  if(np>0&&pr.length>=3&&np>Math.max.apply(null,pr.map(x=>x.np)))add('rec',80,{s:np});
  if(ns.some(n=>n.k==='biz'&&n.a&&n.a.k==='opi')||ns.some(n=>n.k==='won'))add(W.ned?'won':'opi',75);
  const op=ns.filter(n=>n.k==='biz'&&n.a&&n.a.k==='open');if(op.length>=2)add('openN',70,{n:op.length});else if(op.length)add('open',70,{bt:op[0].a.bt});
  if(ns.some(n=>n.k==='built'||n.k==='biz'&&n.a&&n.a.k==='built'))add('built',72);
  if(ns.some(n=>n.k==='bizev'&&n.a&&n.a.k==='bobrov'||n.k==='biz'&&n.a&&n.a.k==='bobr'))add('bobr',68);
  try{const lg=B2.rivals&&B2.rivals.log?B2.rivals.log(W).filter(x=>x.m===m&&x.k!=='a'):[];const x=lg[lg.length-1];if(x&&N['rv_'+x.k])add('rv_'+x.k,66,{bt:x.t,c:x.c,f:x.f});}catch(e){}
  if(F&&Array.isArray(F.fd)&&F.fd.some(f=>f.m===m&&f.w==='beav'&&f.k==='ovt'))add('ovt',67);
  const ev=ns.filter(n=>n.k==='bizev'&&n.a);for(const n of ev){const k=n.a.k;
    if(k==='viral'||k==='fleet'||k==='order')add('good',64,{bt:n.a.bt});else if(k==='brk'&&n.a.bt==='vend')add('brk',60);else if(k==='demol')add('demol',60);else if(k!=='bobrov')add('bad',58,{bt:n.a.bt});}
  if(ns.some(n=>n.k==='od'))add('od',56);if(np<0&&h)add('loss',55);
  const c=ns.find(n=>n.k==='contract');if(c)add('con',45,{g:c.a&&c.a.g});
  const b=(W.biz||[]).filter(x=>x.st==='w'&&x.lr>0&&E&&E.BIZ&&E.BIZ[x.t]&&E.BIZ[x.t].seg!=='logi').sort((x,y)=>y.lr-x.lr)[0];
  if(b&&(W.biz||[]).length>=3)add('best',40,{bt:b.t,s:b.lr,c:b.c});
  const kr=BS.kraiId(W);if(kr)add('k_'+kr,35);
  const mo=m%12,mk=mo>=5&&mo<=7?'m6':'m'+mo;if(N[mk])add(mk,30);
  const sg=!W.ned?['g_g','g_s','g_m','g_q'][Math.max(0,['gig','small','mid','quarry'].indexOf(W.st||'gig'))]:'g_n';
  add(sg,10,{n:sg==='g_m'?(W.biz||[]).length:sg==='g_s'?Math.max(1,m-((W.fr&&W.fr.m0)||0)):0,s:E&&E.equity?E.equity(W):0});
  return o.filter(x=>N[x.k]).sort((a,b)=>b.p-a.p);}
function cityN(c){const R=E&&E.REGS&&E.REGS[c];return R?T(R.city||R.n,R.ce||R.en):'';}
function bizN(t){const B=E&&E.BIZ&&E.BIZ[t];return B?'«'+T(B.n,B.en)+'»':T('точка','an outlet');}
function fill(s,x,W){const b=x.bt?bizN(x.bt):T('точка','an outlet');
  const fm=x.f&&B2.rivals&&B2.rivals.firm?B2.rivals.firm(x.f):null,fn=fm?T('«'+fm.n+'»','“'+fm.en+'”'):T('конкурентов','a rival chain');
  s=s.replace(/\{f\}/g,fn).replace(/\{F\}/g,cap(fn));
  return s.replace(/\{([^{}|]*)\|([^{}]*)\}/g,(z,a,c)=>fem()?c:a).replace(/\{h\}/g,hero()).replace(/\{H\}/g,cap(hero())).replace(/\{b\}/g,b).replace(/\{B\}/g,cap(b))
    .replace(/\{c\}/g,cityN(x.c||W.home||'kuz')).replace(/\{s\}/g,money(x.s||0)).replace(/\{n\}/g,String(x.n||0)).replace(/\{g\}/g,x.g&&root.NM?low(NM.good(x.g)):T('сырьё','raw materials'));}
function pick(W,rep){const o=B2.w(W,'story');if(!Array.isArray(o.nh))o.nh=[];
  if(o.lm===rep.m&&o.li){const [k,i]=o.li.split(':');if(N[k]&&N[k][+i])return {k,i:+i,x:o.lx||{}};}
  const fs=facts(W,rep);let f=fs[0];if(f&&f.p<90&&f.k===o.lc&&fs[1])f=fs[1];if(!f)return null;
  const L0=N[f.k],seed=(rep.m*7+((W.seed||3)%97))>>>0;let i=seed%L0.length;for(let j=0;j<L0.length&&o.nh.indexOf(f.k+':'+i)>=0;j++)i=(i+1)%L0.length;
  o.lm=rep.m;o.li=f.k+':'+i;o.lc=f.k;o.lx={bt:f.x.bt,s:Math.round(f.x.s||0),n:f.x.n,c:f.x.c,g:f.x.g,f:f.x.f};o.nh.push(o.li);if(o.nh.length>12)o.nh.shift();
  B2.ev('story','news',{k:f.k});return {k:f.k,i,x:o.lx};}
function brag(t){try{if(typeof SOC_BRAG!=='undefined'){SOC_BRAG.b2news=t;return typeof socBragHtml==='function'?socBragHtml('b2news'):'';}}catch(e){}return '';}
function css(){if(typeof document==='undefined'||document.getElementById('b2n-css'))return;const s=document.createElement('style');s.id='b2n-css';
  s.textContent='.b2n{margin:14px 2px 6px;padding:10px 12px 10px;background:#fbf7ec;color:#2a2622;border:1px dashed #b9ad94;border-radius:3px;transform:rotate(-.6deg);box-shadow:0 2px 6px rgba(0,0,0,.12);font-family:Georgia,"Times New Roman",serif}'
    +'.b2n-mh{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;border-bottom:2px solid #2a2622;padding-bottom:3px;margin-bottom:6px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;font-weight:700}'
    +'.b2n-mh i{font-style:normal;letter-spacing:0;text-transform:none;font-weight:400}.b2n-hl{font-size:18px;line-height:1.3;font-weight:700;margin:0}'
    +'.b2n-ld{margin:8px 0 0;font-size:15px;line-height:1.35;font-style:italic;color:#4a443c}.b2n-y{width:100%;border-collapse:collapse;margin:6px 0 0;font-size:16px}'
    +'.b2n-y td{padding:3px 0;border-bottom:1px dotted #b9ad94}.b2n-y td:first-child{white-space:nowrap;padding-right:10px}.b2n-y td+td{text-align:right;font-weight:700}.b2n-y .up{color:#0a7a3a}.b2n-y .dn{color:#c62828}'
    +'@media (prefers-reduced-motion:reduce){.b2n{transform:none}}body.calm .b2n{transform:none}';document.head.appendChild(s);}
function mh(W,m,tag){const d=root.FMT?FMT.date(m):'';return '<div class="b2n-mh"><span>'+esc(T('Вестник района','The District Herald'))+'</span><i>'+esc(tag||d)+'</i></div>';}
function html(W,rep){if(!W||!rep)return '';css();if(rep.m%12===11&&W.hist&&W.hist.length>=6)return yearHtml(W,2027+Math.floor(rep.m/12),rep.m);
  const p=pick(W,rep);if(!p)return '';const t=N[p.k][p.i],hl=fill(T(t[0],t[1]),p.x,W);
  const lk=LC[p.k]||(p.k.indexOf('stage')===0||p.k.indexOf('arr')===0?'stage':'gen'),lv=LUD[lk],lt=lv[rep.m%lv.length];
  return '<div class="b2n" role="note">'+mh(W,rep.m)+'<p class="b2n-hl">'+esc(hl)+'</p><p class="b2n-ld">— '+esc(T('Людмила Санна','Lyudmila Sanna'))+': '+esc(T(lt[0],lt[1]))+'</p></div>'
    +brag(T('Про меня написали в «Вестнике района»: «','The District Herald wrote about me: “')+hl+T('». Играю в «Из ларька в магнаты»','”. Playing From Kiosk to Tycoon'));}
/* «Итоги года»: последние 12 месяцев истории мира (m — последний месяц года) */
function yearHtml(W,year,m){css();const hs=(W.hist||[]).filter(x=>m==null||x.m<=m).slice(-12);if(!hs.length)return '';
  let rev=0,np=0,best=hs[0];for(const x of hs){rev+=x.rev||0;np+=x.np||0;if((x.np||0)>(best.np||0))best=x;}
  const e0=(W.hist||[]).find(x=>x.m===hs[0].m-1)||hs[0],e1=hs[hs.length-1],g=e0.eq>0?(e1.eq/e0.eq-1):0;
  let pl='';try{const P=root.STORY&&STORY.place?STORY.place(W):0;if(P)pl=P+' '+T('из','of')+' '+((STORY.standings(W)||[]).filter(x=>x.id!=='bear').length);}catch(e){}
  const hl=np>0?T(cap(hero())+' — человек года на районе',cap(hero())+' is the district’s person of the year'):T('Год испытаний: '+hero()+' не сдаётся','A year of trials: '+hero()+' keeps going');
  const row=(a,b,c)=>'<tr><td>'+esc(a)+'</td><td'+(c?' class="'+c+'"':'')+'>'+esc(b)+'</td></tr>';
  const pct=x=>(x>=0?'▲ +':'▼ −')+Math.round(Math.abs(x)*100)+(en()?'%':' %');
  let h='<div class="b2n" role="note">'+mh(W,m,T('Спецвыпуск · Итоги '+year,'Special · '+year+' in review'))+'<p class="b2n-hl">'+esc(hl)+'</p><table class="b2n-y">'
    +row(T('Выручка за год','Revenue for the year'),money(rev))+row(T('Прибыль за год','Profit for the year'),money(np),np>=0?'up':'dn')
    +row(T('Стоимость дела','Business value'),money(e1.eq||0)+(e0.eq>0?' '+pct(g):''),g>=0?'up':'dn')
    +row(T('Лучший месяц','Best month'),(root.FMT?FMT.date(best.m):'')+' · '+money(best.np||0))+(pl?row(T('Гонка 11 «Б»','The 11B race'),pl):'')+'</table>'
    +'<p class="b2n-ld">— '+esc(T('Людмила Санна','Lyudmila Sanna'))+': '+esc(np>=0?T('Год закрыт. Шампанское — после сверки.','The year is closed. Champagne after reconciliation.'):T('Год был трудный. Следующий будет умнее — я прослежу.','It was a hard year. The next one will be smarter — I’ll see to it.'))+'</p></div>';
  return h+brag(T(`Итоги ${year}: прибыль ${money(np)}, стоимость дела ${money(e1.eq||0)}. Играю в «Из ларька в магнаты»`,`${year} in review: profit ${money(np)}, business value ${money(e1.eq||0)}. Playing From Kiosk to Tycoon`));}
function yearWin(y){const W=root.GAME&&GAME.W;if(!W||typeof modal!=='function')return;try{save();}catch(e){}B2.ev('story','year',{y});
  modal('<h2>🗓 '+esc(T('Итоги '+y+' года','Your '+y+' in review'))+'</h2>'+yearHtml(W,y,null)+'<div class="row"><button class="btn w accent" onclick="hideModal()">'+esc(T('С Новым годом!','Happy New Year!'))+'</button></div>');}
BS.set('news',{html,yearHtml,yearWin,facts,N,LUD});
})(typeof window!=='undefined'?window:globalThis);
