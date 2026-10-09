/* MGC · затея №13 «Опрос двора» (как «Сто к одному»). Поток MGC буста 09.10 (журнал hobby-analytics/release-i/viktorina-boost/logs/MGC.md).
   Правила: вопрос двору и 10 вариантов — выбери 5, которые, по мнению соседей Михалыча, назвали бы чаще всего; потом открываются места 1–5.
   3 опроса за заход, без таймера. Очки — «голоса» выбранных вариантов (из 100); ★ — по доле от лучшего возможного.
   ЧЕСТНО: это НЕ настоящий опрос. Списки и числа придуманы авторами игры («так думают соседи Михалыча») и так и подписаны на экране.
   Настоящий опрос игроков — позже, с сервером (05-minigames.md §3 №13), тогда числа заменятся на живые.
   Договор оболочки — шапка js/vmg-core.js (05 §4.2): VMG_REG({id,num,n,icon,run(host,o),bot(o)}); награды/итоги — только оболочка.
   Всё своё — внутри этой функции, CSS — .vmc-o…, анимации vmcO…; сейв не трогаем. Клавиши: 1–9, 0 — выбрать/снять, Enter — открыть ответы / дальше. */
(function(){'use strict';
var ID='opros',NUM=13,ROUNDS=3,PICK=5,TIER=[.4,.62,.82];
/* [вопрос, 5 лучших [ответ,голоса] по убыванию, 5 прочих [ответ,голоса]]; голоса — «из 100 соседей», придуманы */
var Q=[
 ['Что берут на дачу в первую очередь?',[['Рассаду',24],['Еду',19],['Резиновые сапоги',15],['Средство от комаров',12],['Тёплую кофту',9]],[['Шашлык',6],['Радио',4],['Книжку',3],['Панаму',3],['Игральные карты',2]]],
 ['Что первым делом делают, вернувшись домой?',[['Переодеваются',26],['Моют руки',20],['Ставят чайник',16],['Включают телевизор',11],['Ложатся на диван',8]],[['Звонят маме',5],['Кормят кота',4],['Проверяют почту',3],['Идут в душ',3],['Смотрят в окно',2]]],
 ['Что обязательно есть на новогоднем столе?',[['Оливье',31],['Мандарины',21],['Шампанское',13],['Селёдка под шубой',12],['Холодец',8]],[['Икра',5],['Торт',4],['Шпроты',3],['Курица',2],['Пельмени',1]]],
 ['Где чаще всего теряются ключи?',[['В сумке',25],['В карманах куртки',21],['Дома на тумбочке',15],['На работе',10],['В машине',8]],[['В почтовом ящике',5],['У соседей',4],['В песочнице',3],['В подъезде',3],['В магазине',2]]],
 ['Что во дворе дети любят больше всего?',[['Качели',27],['Горку',22],['Песочницу',14],['Турник',10],['Карусель',8]],[['Лужи',5],['Голубей',4],['Мяч',3],['Кошек',3],['Классики',2]]],
 ['Зачем ходят в гости к бабушке?',[['За пирожками',30],['Просто повидаться',22],['Помочь по хозяйству',14],['За вареньем',9],['Узнать новости',7]],[['Вернуть банки',5],['Посмотреть альбом',4],['Поиграть в лото',3],['Отдохнуть',2],['К котятам',1]]],
 ['Что у Михалыча в карманах?',[['Ключи',23],['Семечки',19],['Носовой платок',14],['Мелочь',12],['Отвёртка',9]],[['Спички',6],['Изолента',5],['Конфета',4],['Газета',3],['Свисток',2]]],
 ['Что брали с собой в пионерлагерь?',[['Зубную щётку',24],['Сгущёнку',18],['Фонарик',13],['Тёплый свитер',11],['Панамку',9]],[['Мыло',6],['Конверты для писем',5],['Книжку',4],['Карты',3],['Кеды',2]]],
 ['Чем занимаются на лавочке у подъезда?',[['Обсуждают соседей',32],['Отдыхают',18],['Лузгают семечки',14],['Ждут кого-нибудь',10],['Читают газету',7]],[['Кормят голубей',6],['Играют в домино',4],['Вяжут',3],['Поют песни',2],['Дремлют',1]]],
 ['Что чаще всего ломается дома?',[['Кран',24],['Лампочка',20],['Розетка',13],['Дверная ручка',11],['Пульт от телевизора',9]],[['Стул',6],['Холодильник',5],['Утюг',3],['Зонт',3],['Замок',2]]],
 ['Чем угощают гостей?',[['Чаем',28],['Пирогами',21],['Конфетами',15],['Вареньем',10],['Салатом',8]],[['Печеньем',6],['Супом',4],['Компотом',3],['Бутербродами',2],['Арбузом',1]]],
 ['Что делают в выходной утром?',[['Спят подольше',34],['Завтракают не спеша',17],['Убираются',13],['Идут на рынок',9],['Смотрят телевизор',8]],[['Делают зарядку',6],['Звонят родным',4],['Гуляют с собакой',4],['Едут на дачу',3],['Читают',2]]],
 ['Как чаще всего зовут дворового кота?',[['Барсик',28],['Мурзик',22],['Васька',17],['Рыжик',9],['Пушок',7]],[['Тимоша',5],['Кузя',4],['Маркиз',3],['Боня',2],['Снежок',2]]],
 ['Что берут в поход?',[['Палатку',25],['Спички',20],['Котелок',14],['Тушёнку',12],['Гитару',9]],[['Компас',6],['Фонарик',5],['Топорик',4],['Спальник',3],['Карту',2]]],
 ['Что покупали в газетном киоске?',[['Газеты',33],['Журналы',19],['Марки',12],['Открытки',11],['Кроссворды',9]],[['Конверты',5],['Значки',4],['Календарики',3],['Ручки',2],['Лотерейные билеты',2]]],
 ['Без чего не обходится ремонт?',[['Обои',26],['Краска',21],['Споры',14],['Стремянка',11],['Клей',9]],[['Газеты на полу',6],['Шпатель',5],['Рулетка',4],['Перфоратор',2],['Мастер',2]]],
 ['Что делают, когда во всём доме погас свет?',[['Зажигают свечи',31],['Ищут фонарик',22],['Звонят в аварийную',13],['Ложатся спать',11],['Глядят, есть ли свет у соседей',7]],[['Играют в карты',5],['Рассказывают истории',4],['Пьют чай',3],['Ворчат',2],['Читают при свечах',1]]],
 ['Какой праздник во дворе самый любимый?',[['Новый год',35],['День Победы',20],['Масленица',14],['День города',9],['Первое сентября',7]],[['8 Марта',6],['День двора',4],['Иван Купала',3],['День соседей',3],['День защиты детей',2]]],
 ['Что кладут в окрошку?',[['Огурцы',23],['Колбасу',19],['Яйца',16],['Редиску',12],['Картошку',10]],[['Укроп',7],['Зелёный лук',5],['Говядину',3],['Горчицу',2],['Хрен',1]]],
 ['Что учитель говорит чаще всего?',[['«Тише!»',27],['«Откройте тетради»',20],['«К доске пойдёт…»',15],['«Звонок — для учителя»',12],['«Дежурный, вытри доску»',8]],[['«Кто не сделал домашнее?»',6],['«Записываем»',4],['«Дневник на стол»',3],['«Не спим!»',2],['«Молодец»',1]]],
 ['Что мешает спать по ночам?',[['Храп',24],['Комары',20],['Шум машин',15],['Мысли о делах',11],['Соседская собака',8]],[['Жара',6],['Кот',5],['Телефон',3],['Сквозняк',2],['Капающий кран',1]]],
 ['С чем пьют чай?',[['С сахаром',26],['С лимоном',21],['С вареньем',15],['С конфетами',11],['С баранками',8]],[['С мёдом',6],['С молоком',5],['С пряником',3],['С мятой',2],['С сухарями',1]]],
 ['Чем занять ребёнка в дождливый день?',[['Настольными играми',24],['Мультфильмами',22],['Рисованием',15],['Пластилином',11],['Книжками',8]],[['Шалашом из одеял',6],['Пазлами',5],['Лото',3],['Печеньем — вместе испечь',2],['Прятками',2]]],
 ['Что берут с собой в поезд?',[['Варёные яйца',26],['Курицу',21],['Чай в пакетиках',13],['Кроссворды',11],['Тапочки',9]],[['Огурцы',6],['Печенье',5],['Книжку',4],['Подушку',2],['Шахматы',1]]],
 ['Чем любят заниматься пенсионеры во дворе?',[['Сидеть на лавочке',30],['Кормить голубей',18],['Ухаживать за клумбой',14],['Играть в домино',11],['Гулять с внуками',9]],[['Читать газету',6],['Делать зарядку',4],['Ворчать на молодёжь',3],['Вязать',2],['Играть в шахматы',2]]],
 ['Что лежит в домашней аптечке?',[['Пластырь',25],['Зелёнка',22],['Йод',16],['Бинт',12],['Градусник',10]],[['Активированный уголь',5],['Валерьянка',4],['Вата',3],['Таблетки от головы',2],['Перекись',1]]],
 ['Что делают на Масленицу?',[['Пекут блины',38],['Сжигают чучело',19],['Катаются с горки',11],['Ходят в гости',9],['Водят хороводы',6]],[['Перетягивают канат',5],['Лезут на столб',4],['Катаются на санях',3],['Поют частушки',3],['Едят мёд',2]]],
 ['Что лучше всего будит соню?',[['Будильник',29],['Мама',22],['Кот',14],['Запах блинов',10],['Холодная вода',7]],[['Собака',6],['Солнце в окно',5],['Шум за окном',3],['Звонок телефона',2],['Сосед с дрелью',2]]],
 ['Что сажают на огороде в первую очередь?',[['Картошку',33],['Огурцы',18],['Помидоры',15],['Морковь',10],['Лук',8]],[['Редиску',6],['Укроп',4],['Кабачки',3],['Капусту',2],['Свёклу',1]]],
 ['Что ищут на антресолях?',[['Ёлочные игрушки',27],['Старые фотографии',18],['Зимние вещи',15],['Чемодан',12],['Инструменты',8]],[['Банки',6],['Лыжи',5],['Пылесос',3],['Детские вещи',3],['Кота',1]]],
 ['Что дарят учителю?',[['Цветы',36],['Конфеты',22],['Открытку',12],['Чай',9],['Кружку',7]],[['Книгу',5],['Рисунок',4],['Ежедневник',3],['Торт',2],['Ручку',1]]],
 ['Чем пахнет детство?',[['Бабушкиными пирогами',28],['Мандаринами',19],['Скошенной травой',13],['Ёлкой',12],['Летним дождём',9]],[['Костром',6],['Сиренью',5],['Молоком',3],['Пластилином',3],['Мылом',1]]]
];
var WHO=['mihalych','zina','valya','kolya','mityai','valerka'];
function vmcRnd(o){if(o&&typeof o.rnd==='function')return o.rnd;var a=(o&&+o.seed>>>0)||(Math.random()*4e9>>>0);
  return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function vmcShuf(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}return a;}
/* набор на заход: 3 разных опроса по зерну (одинаково у всех в этот день), варианты перемешаны */
function vmcSet(o){var r=vmcRnd(o),ids=vmcShuf(Q.map(function(_,i){return i;}),r).slice(0,ROUNDS);
  return {r:r,list:ids.map(function(i){var q=Q[i],opts=q[1].map(function(a,k){return {t:a[0],v:a[1],pl:k+1};}).concat(q[2].map(function(a){return {t:a[0],v:a[1],pl:0};}));
    var best=q[1].reduce(function(s,a){return s+a[1];},0);return {i:i,q:q[0],opts:vmcShuf(opts,r),best:best};})};}
function vmcTier(f){return f>=TIER[2]?3:f>=TIER[1]?2:f>=TIER[0]?1:0;}
function vmcPC(){try{if(typeof window.vmgPC==='function')return !!window.vmgPC();return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
function vmcSnd(host,k){try{var s=host&&host.snd||window.SND;if(s&&s[k])s[k]();}catch(e){}}
function vmcPortrait(id,m){try{return typeof portrait==='function'?portrait(id||'mihalych',m||'norm'):'';}catch(e){return '';}}
function vmcEsc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function vmcStars(t){var s='';for(var i=0;i<3;i++)s+='<i class="vmc-o-sr'+(i<t?' on':'')+'">★</i>';return s;}
function vmcKey(i){return i===9?'0':String(i+1);}

var CSS='\
.vmc-o{position:relative;flex:1 0 auto;min-height:0;display:flex;flex-direction:column;font-family:KF,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink,#233247);-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}\
.vmc-o *{box-sizing:border-box}\
.vmc-o-in{width:100%;flex:1;min-height:0;display:flex;flex-direction:column}\
.vmc-o-top{display:flex;align-items:center;justify-content:center;gap:10px;min-height:30px;margin-bottom:6px}\
.vmc-o-tt{font-weight:800;font-size:19px;line-height:1.1;flex:1;min-width:0}\
.vmc-o-tt small{display:block;font-weight:600;font-size:13px;color:var(--muted,#5a6676)}\
.vmc-o-pts{font-weight:800;font-size:16px;background:var(--card,#fffaf0);border:2px solid #233247;border-radius:12px;padding:3px 9px;box-shadow:0 2px 0 #233247;white-space:nowrap}\
.vmc-o-dots{display:flex;gap:5px}.vmc-o-dots i{width:12px;height:12px;border-radius:50%;border:2px solid #233247;background:#fffdf6}.vmc-o-dots i.on{background:var(--go,#ff7a1a)}.vmc-o-dots i.dn{background:var(--grn,#2fa84f)}\
.vmc-o-q{position:relative;background:#233a6b;color:#fff;border:2.5px solid #233247;border-radius:16px;box-shadow:0 4px 0 #233247;padding:10px 12px 10px 66px;min-height:66px;display:flex;align-items:center;font-weight:800;font-size:19px;line-height:1.25;margin-bottom:6px}\
.vmc-o-q .pt{position:absolute;left:4px;bottom:0;width:58px;height:62px;overflow:hidden}\
.vmc-o-q .pt svg{width:100%;height:100%;display:block}\
.vmc-o-note{font-size:13px;line-height:1.25;color:var(--muted,#5a6676);text-align:center;margin:0 0 6px;font-weight:600}\
.vmc-o-grid{flex:1;display:flex;flex-wrap:wrap;align-content:flex-start;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px}\
.vmc-o-op{width:calc(50% - 6px);margin:3px;min-height:50px;display:flex;align-items:center;gap:6px;text-align:left;border:2.5px solid #233247;border-radius:12px;background:#fff;box-shadow:0 3px 0 #233247;font:700 16px/1.15 KF,-apple-system,sans-serif;color:#1b2433;padding:4px 8px 4px 5px;cursor:pointer;transition:transform .06s}\
.vmc-o-op:active{transform:translateY(2px);box-shadow:0 1px 0 #233247}\
.vmc-o-op .n{flex:none;width:26px;height:26px;border-radius:8px;background:var(--let,#ffe9a8);border:2px solid #233247;font-size:14px;font-weight:800;display:flex;align-items:center;justify-content:center}\
.vmc-o-op .t{flex:1;min-width:0;overflow-wrap:break-word;-webkit-hyphens:auto;hyphens:auto}\
.vmc-o-op .v{flex:none;font-weight:900;font-size:17px}\
.vmc-o-op.sel{background:var(--sel,#ffe08a);transform:translateY(1px);box-shadow:0 2px 0 #233247}\
.vmc-o-op.sel .n{background:var(--go,#ff7a1a);color:#fff}\
.vmc-o-op.dim{opacity:.55}\
.vmc-o-op.hit{background:#dff5d8;border-color:#1d7a36}.vmc-o-op.hit .n{background:var(--grn,#2fa84f);color:#fff}\
.vmc-o-op.mis{background:#f3eee0;color:#7a7466}.vmc-o-op.mis .n{background:#e4dccb}\
.vmc-o-op.top{background:#fff;border-style:dashed}\
.vmc-o-bd{background:#233a6b;border:2.5px solid #233247;border-radius:16px;box-shadow:0 4px 0 #233247;padding:6px;margin-bottom:6px}\
.vmc-o-rw{display:flex;align-items:center;gap:8px;min-height:40px;margin:4px 0;border-radius:10px;background:#3b5a9a;color:#fff;font-weight:800;font-size:17px;padding:4px 10px;perspective:400px}\
.vmc-o-rw .p{flex:none;width:26px;height:26px;border-radius:50%;background:var(--gold,#ffcf40);color:#3b2a00;display:flex;align-items:center;justify-content:center;font-size:15px}\
.vmc-o-rw .t{flex:1;min-width:0}.vmc-o-rw .v{flex:none;font-size:19px}\
.vmc-o-rw.hid .t,.vmc-o-rw.hid .v{opacity:0}\
.vmc-o-rw.op{animation:vmcOFlip .4s}\
.vmc-o-rw.got{background:#2fa84f}.vmc-o-rw.mis{background:#55607a}\
.vmc-o-hon{font-size:12.5px;line-height:1.25;color:var(--muted,#5a6676);text-align:center;margin:4px 0 0;font-weight:600}.vmc-o-rule .vmg-say{margin:0 0 6px}.vmc-o-rule .vmg-av{width:48px;height:48px}.vmc-o-rule .vmg-sb{font-size:15.5px;padding:6px 10px}\
.vmc-o-sum{text-align:center;font-weight:800;font-size:17px;margin:2px 0 6px}\
.vmc-o-ex{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-bottom:6px}\
.vmc-o-ex span{background:#f3eee0;border:2px solid #c9c3b2;border-radius:9px;padding:2px 8px;font-size:15px;font-weight:700;color:#5d584b}\
.vmc-o-b{width:100%;min-height:52px;border:2.5px solid #233247;border-radius:14px;background:var(--btn,#fffdf6);box-shadow:0 4px 0 #233247;font:800 18px/1.1 KF,-apple-system,sans-serif;color:#233247;cursor:pointer;padding:4px 8px;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px}\
.vmc-o-b:active{transform:translateY(3px);box-shadow:0 1px 0 #233247}\
.vmc-o-b.go{background:var(--go,#ff7a1a);color:#fff}\
.vmc-o-b[disabled]{background:#ebe6d8;color:#8d8a80;border-color:#c9c3b2;box-shadow:0 3px 0 #c9c3b2;pointer-events:none}\
.vmc-o-kc{display:none;font:700 12px/1 KF,sans-serif;border:1.5px solid currentColor;border-radius:5px;padding:2px 4px;opacity:.8}\
.vmc-o.pc .vmc-o-kc{display:inline-block}\
.vmc-o-wrap{flex:1;display:flex;padding:4px 0;min-height:0;width:100%}\
.vmc-o-card{margin:auto;max-width:440px;width:100%;background:var(--card,#fffaf0);border:2.5px solid #233247;border-radius:20px;box-shadow:0 5px 0 #233247;padding:16px;text-align:center;display:flex;flex-direction:column;gap:10px;max-height:100%;overflow-y:auto}\
.vmc-o-card h2{margin:0;font-size:24px;font-weight:900}\
.vmc-o-card p{margin:0;font-size:17px;line-height:1.35}\
.vmc-o-card .pt{width:110px;height:110px;margin:0 auto -4px}.vmc-o-card .pt svg{width:100%;height:100%}\
.vmc-o-card .ho{font-size:14px;color:var(--muted,#5a6676);background:var(--pan2,#fff0c9);border-radius:10px;padding:6px 8px}\
.vmc-o-sr{font-style:normal;font-size:40px;color:#cfc6ae;-webkit-text-stroke:1.5px #233247;display:inline-block}.vmc-o-sr.on{color:var(--gold,#ffcf40)}\
body.big .vmc-o-op{font-size:18px}body.big .vmc-o-q{font-size:21px}body.big .vmc-o-card p{font-size:20px}\
@media (max-width:340px){.vmc-o-op{font-size:14px!important;padding-right:4px;gap:4px}.vmc-o-op .n{width:22px!important;height:22px!important;font-size:13px}}\
@media (max-width:360px){.vmc-o-op{font-size:15px;padding-right:5px}.vmc-o-op .n{width:24px;height:24px}.vmc-o-q{font-size:17px}}\
@media (max-height:600px){.vmc-o-op{min-height:44px;font-size:15px}.vmc-o-hon{font-size:12px;margin-top:2px}.vmc-o-note{margin-bottom:3px}}\
@media (max-height:700px){.vmc-o-q{min-height:54px;font-size:17px;padding-top:6px;padding-bottom:6px}.vmc-o-q .pt{width:48px;height:52px}.vmc-o-q{padding-left:56px}.vmc-o-op{min-height:46px}.vmc-o-b{min-height:48px}.vmc-o-top{min-height:26px;margin-bottom:4px}.vmc-o-rw{min-height:34px;margin:3px 0}.vmc-o-note{margin-bottom:4px}}\
@media (min-width:700px){.vmc-o-op{min-height:56px;font-size:18px}}\
@keyframes vmcOFlip{0%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}\
@media (prefers-reduced-motion:reduce){.vmc-o *{animation:none!important;transition:none!important}}';
function vmcCss(){if(document.getElementById('vmc-css-'+ID))return;var s=document.createElement('style');s.id='vmc-css-'+ID;s.textContent=CSS;document.head.appendChild(s);}

function run(host,o){
  o=o||{};vmcCss();
  var SET=vmcSet(o),R=0,sel=[],score=0,best=0,dead=false,keyH=null,phase='intro',tm=[];
  var root=document.createElement('div');root.className='vmc-o'+(vmcPC()?' pc':'');root.setAttribute('data-vmc',ID);host.el.appendChild(root);
  function off(){dead=true;tm.forEach(clearTimeout);if(keyH){window.removeEventListener('keydown',keyH,true);keyH=null;}}
  if(host.onQuit)host.onQuit(off);
  function busy(){return dead||host.paused||host.hold||!root.isConnected;}
  var PC=host.pc!=null?!!host.pc:vmcPC();root.className='vmc-o'+(PC?' pc':'');
  var NOTE='Выбери 5 самых частых ответов соседей'+(PC?' (цифры 1–9, 0)':'');
  if(typeof host.keys==='function')host.keys(function(k){return !busy()&&onKey(k);});
  else window.addEventListener('keydown',keyH=function(e){if(busy()||e.ctrlKey||e.metaKey||e.altKey)return;if(onKey(e.key)){e.preventDefault();e.stopPropagation();}},true);
  function later(f,ms){tm.push(setTimeout(function(){if(!dead)f();},ms));}

  function head(){var d='';for(var i=0;i<ROUNDS;i++)d+='<i class="'+(i<R?'dn':i===R?'on':'')+'"></i>';
    if(host.top)host.top((R+1)+' из '+ROUNDS);
    return '<div class="vmc-o-top"><div class="vmc-o-dots">'+d+'</div><span class="vmc-o-pts">'+score+' очк.</span></div>';}
  function round(){phase='pick';sel=[];var r=SET.list[R],who=WHO[(r.i+R)%WHO.length];
    root.innerHTML='<div class="vmc-o-in">'+head()+'<div class="vmc-o-q"><div class="pt">'+vmcPortrait(who,'norm')+'</div><span>'+vmcEsc(r.q)+'</span></div>'+
      '<p class="vmc-o-note">'+NOTE+'</p><div class="vmc-o-grid"></div>'+
      '<p class="vmc-o-hon">Опрос шуточный: ответы придумали соседи Михалыча, это не статистика.</p>'+
      '<button class="vmc-o-b go" data-k="ok" disabled>Выбрано 0 из 5</button></div>';
    var g=root.querySelector('.vmc-o-grid');
    r.opts.forEach(function(op,i){var b=document.createElement('button');b.className='vmc-o-op';b.setAttribute('data-i',i);
      b.innerHTML='<span class="n">'+vmcKey(i)+'</span><span class="t">'+vmcEsc(op.t)+'</span>';b.onclick=function(){tog(i);};g.appendChild(b);});
    root.querySelector('[data-k=ok]').onclick=function(){reveal();};}
  function tog(i){if(busy()||phase!=='pick')return;var k=sel.indexOf(i);
    if(k>=0){sel.splice(k,1);vmcSnd(host,'tap');}else{if(sel.length>=PICK){vmcSnd(host,'no');note('Уже выбрано 5 — сними один, чтобы выбрать другой');return;}sel.push(i);vmcSnd(host,'pick');}
    var bs=root.querySelectorAll('.vmc-o-op');for(var j=0;j<bs.length;j++){bs[j].classList.toggle('sel',sel.indexOf(j)>=0);bs[j].classList.toggle('dim',sel.length>=PICK&&sel.indexOf(j)<0);}
    var b=root.querySelector('[data-k=ok]');b.disabled=sel.length<PICK;
    b.innerHTML=sel.length<PICK?'Выбрано '+sel.length+' из 5':'Открыть ответы <span class="vmc-o-kc">Enter</span>';
    note(sel.length<PICK?NOTE:'Готово? Жми «Открыть ответы» — или поменяй выбор');}
  function note(t){var n=root.querySelector('.vmc-o-note');if(n)n.textContent=t;}
  /* табло: места 1–5 открываются по одному снизу вверх, выбранные игроком — зелёные */
  function reveal(){if(busy()||phase!=='pick'||sel.length<PICK)return;phase='rev';vmcSnd(host,'tap');
    var r=SET.list[R],picked=sel.map(function(i){return r.opts[i];}),got=0;picked.forEach(function(p){got+=p.v;});
    var top=r.opts.filter(function(p){return p.pl;}).sort(function(a,b){return a.pl-b.pl;});
    var extra=picked.filter(function(p){return !p.pl;});
    root.innerHTML='<div class="vmc-o-in">'+head()+'<div class="vmc-o-q" style="padding-left:12px;min-height:0"><span>'+vmcEsc(r.q)+'</span></div>'+
      '<div class="vmc-o-bd">'+top.map(function(p){return '<div class="vmc-o-rw hid" data-pl="'+p.pl+'"><span class="p">'+p.pl+'</span><span class="t">'+vmcEsc(p.t)+'</span><span class="v">'+p.v+'</span></div>';}).join('')+'</div>'+
      '<div class="vmc-o-sum" style="visibility:hidden">'+'</div><div class="vmc-o-ex"></div>'+
      '<p class="vmc-o-note">Числа придуманы — так думают соседи Михалыча</p>'+
      '<div style="flex:1"></div><button class="vmc-o-b go" data-k="nx" style="visibility:hidden">'+(R+1<ROUNDS?'Следующий опрос':'Итоги')+' <span class="vmc-o-kc">Enter</span></button></div>';
    var rows=root.querySelectorAll('.vmc-o-rw'),k=rows.length-1,fast=!!o.calm;
    function step(){if(k<0){done();return;}var rw=rows[k],p=top[k],hit=picked.indexOf(p)>=0;rw.classList.remove('hid');rw.classList.add('op',hit?'got':'mis');
      vmcSnd(host,hit?'right':'tap');k--;later(step,fast?150:420);}
    function done(){score+=got;best+=r.best;
      var s=root.querySelector('.vmc-o-sum');s.style.visibility='';s.innerHTML='Твои ответы набрали <b>'+got+'</b> из '+r.best+' возможных';
      if(extra.length)root.querySelector('.vmc-o-ex').innerHTML=extra.map(function(p){return '<span>'+vmcEsc(p.t)+' — '+p.v+'</span>';}).join('');
      root.querySelector('.vmc-o-pts').textContent=score+' очк.';
      var b=root.querySelector('[data-k=nx]');b.style.visibility='';b.onclick=next;phase='rdone';
      vmcSnd(host,got>=r.best*.8?'coin':'pick');}
    later(step,250);}
  function next(){if(busy()||phase!=='rdone')return;vmcSnd(host,'tap');R++;if(R<ROUNDS)round();else fin();}
  function fin(){if(dead)return;phase='fin';vmcSnd(host,'tap');var f=best?score/best:0,t=vmcTier(f);off();
    host.done({score:score,tier:t,rec:score,label:score+' очков из '+best+' возможных',extra:{best:best}});}
  function onKey(k){
    if(phase==='pick'){if(/^[0-9]$/.test(k)){var i=k==='0'?9:+k-1;if(i<SET.list[R].opts.length)tog(i);return true;}if(k==='Enter'){if(sel.length>=PICK)reveal();else{vmcSnd(host,'no');}return true;}return false;}
    if(phase==='rdone'){if(k==='Enter'||k===' '){next();return true;}return false;}
    return false;}
  round();
}
/* sim(o,k) для VMG.bot: игрок «чуткости» k угадывает места 1–5 (первые — чаще), остальное добирает прочими */
function sim(o,k){k=k==null?.6:k;var S=vmcSet(o),r=S.r,sc=0,b=0;S.list.forEach(function(q){var top=q.opts.filter(function(p){return p.pl;}),oth=q.opts.filter(function(p){return !p.pl;}),n=0;
  top.forEach(function(p){if(r()<Math.min(.97,k*[1.35,1.15,.95,.8,.65][p.pl-1])){sc+=p.v;n++;}});for(var i=0;n<PICK;n++,i++)sc+=oth[i].v;b+=q.best;});
  return {score:sc,tier:vmcTier(b?sc/b:0)};}

var G={id:ID,run:run,sim:sim};   /* название, ведущий, значок, правило — из VMG_INFO оболочки */
function reg(){if(typeof window.VMG_REG==='function'){window.VMG_REG(G);return true;}return false;}
if(!reg()){var t=0,f=function(){if(!reg()&&++t<40)setTimeout(f,250);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',f);else setTimeout(f,0);}
})();
