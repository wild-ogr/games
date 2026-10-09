/* MGC · затея №12 «Карта Михалыча» (атлас на стене). Поток MGC буста 09.10 (журнал hobby-analytics/release-i/viktorina-boost/logs/MGC.md).
   Правила: Михалыч называет место — поставь флажок на карте; чем ближе, тем больше очков (до 100 за место), 5 мест, без таймера.
   КАРТА — своя схематичная отрисовка: контуры морей, озёр, рек и островов набраны вручную по общеизвестной географии (координаты — факты),
   без чужих картинок, тайлов и наборов данных. Только физическая карта: государственных границ нет (места загадываем только в России).
   Проекция — равнопромежуточная коническая (параллели 52° и 68°, средний меридиан 105° в. д.), как в школьном атласе.
   Договор оболочки — шапка js/vmg-core.js (05 §4.2): VMG_REG({id,num,n,icon,run(host,o),bot(o)}); награды/итоги — только оболочка.
   Всё своё — внутри этой функции, CSS — .vmc-k…, анимации vmcK…; сейв не трогаем.
   Клавиши: стрелки — двигать флажок (Shift — быстрее), Enter — поставить / дальше, Z или + — лупа. */
(function(){'use strict';
var ID='karta',NUM=12,ROUNDS=5,TIER=[150,260,370];
var D2R=Math.PI/180,P1=52*D2R,P2=68*D2R,N=(Math.cos(P1)-Math.cos(P2))/(P2-P1),G0=Math.cos(P1)/N+P1,L0=105,K=1000;
function prj(lon,lat){var r=(G0-lat*D2R)*K,t=N*(lon-L0)*D2R;return [r*Math.sin(t),r*Math.cos(t)];}
function inv(x,y){var r=Math.sqrt(x*x+y*y),t=Math.atan2(x,y);return [L0+t/(N*D2R),(G0-r/K)/D2R];}
function km(a,b){var f1=a[1]*D2R,f2=b[1]*D2R,df=f2-f1,dl=(b[0]-a[0])*D2R,h=Math.sin(df/2)*Math.sin(df/2)+Math.cos(f1)*Math.cos(f2)*Math.sin(dl/2)*Math.sin(dl/2);return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}
function pts(d){return d<=30?100:Math.max(0,Math.round(100-(d-30)/8));}   /* 100 — до 30 км, 0 — от 830 км */

/* ---------- контуры (долгота, широта; восточнее 180° — 180+). Вода рисуется поверх суши. ---------- */
var OCEAN=[[19.5,69.9],[21,70.2],[23,70.6],[25.7,71.1],[27.5,71],[29,70.8],[31,70.4],[30.2,69.8],[31.8,69.75],[33,69.4],[33.1,69],[33.5,69.3],[35.5,69.2],[37.5,68.8],[39.5,68.2],[40.8,67.7],[41.3,66.9],[41,66.3],[39.5,66.1],[38,66.1],[36,66.4],[34.5,66.6],[33,66.9],[32.3,67.1],[33.6,66.3],[34.6,65.4],[34.8,64.6],[36,64.2],[37.4,63.9],[38,64],[37.5,64.6],[36.6,64.9],[37.9,65],[39.7,64.6],[40.5,64.6],[40,65.2],[39.8,65.7],[40.8,66],[42.5,66.4],[44,66],[44.2,66.6],[43.6,67.8],[43.3,68.6],[44.4,68.4],[45.9,67.7],[46.7,67.8],[48.5,67.7],[50.5,68.2],[53,68.4],[54,68.8],[55.8,68.5],[57.2,68.6],[58.8,68.9],[60,69.6],[60.8,69.9],[63,69.6],[65,69.2],[66.8,69],[67.4,68.6],[68.6,69.4],[67.8,70.4],[67.4,71.2],[68.4,72.2],[69.6,72.9],[71,73.4],[72.6,72.8],[72.8,71.8],[72.6,71],[72.6,69.6],[72.3,68.2],[71.8,67.2],[72.6,66.6],[73.8,67.3],[74.6,68],[73.6,68.8],[73.9,69.8],[73.6,70.8],[74.5,71.4],[75.6,72],[77,72.3],[78.5,72.3],[80,72.5],[80.8,72.1],[82,71.2],[82.8,70.1],[84,70.8],[83.6,71.8],[82.5,72.9],[84.5,73.6],[86.6,74],[87,74.9],[90,75.6],[94,76.1],[98,76.3],[101,76.9],[104.3,77.7],[106,77.4],[108.5,76.8],[111.5,76.6],[113.5,76.2],[113,75.4],[112.5,74.4],[113.5,73.6],[116,73.6],[119,73],[121.5,72.9],[124,73.4],[126.5,73.5],[128.5,73.2],[129.2,72.3],[130.5,71.5],[132.2,71.4],[133.5,71.6],[136,71.5],[138.5,71.6],[139.8,72.3],[141.5,72.7],[144,72.6],[146.5,72.3],[150,71.6],[152,70.9],[154,70.9],[156.5,71.1],[159.5,70.8],[160.8,69.6],[162,69.6],[164.5,69.7],[167.5,69.7],[169,69.8],[170.5,70.1],[173,69.9],[176,69.8],[178.5,69.3],[180.5,68.8],[182.5,67.9],[184,67.4],[185.5,67],[188.5,66.6],[190.3,66.1],[189.5,65.6],[188.5,65.5],[187.6,64.6],[186.8,64.3],[185,64.5],[183.5,65],[181.5,65.3],[179.5,64.9],[177.6,64.7],[178.4,64.1],[179,63.3],[179.3,62.4],[177.5,62.5],[175,62],[173.5,61.6],[171,60.6],[170.2,59.9],[168,60.4],[166,59.9],[164.8,59.8],[163.4,59.5],[163.2,58.6],[162,57.8],[163,57.3],[162.6,56.2],[163.3,56],[162.1,54.8],[160.8,54.2],[159.8,53.2],[158.7,52.6],[157.6,51.5],[156.7,50.9],[156.4,51.7],[156,52.8],[155.7,54.5],[155.9,56],[156.8,57.4],[158.3,58],[159.8,59.2],[161.4,60.2],[162.7,61.2],[163.6,62.3],[162.9,62.6],[161.8,61.8],[160.4,61.7],[159,61.6],[157,61.6],[155.5,60.9],[154.5,59.6],[152.5,59],[150.8,59.4],[148.8,59.3],[146,59.3],[143.5,59.3],[141.5,58.6],[140.5,57.8],[139.5,57.2],[138.2,56.4],[137.2,55],[136.8,54.6],[137.6,53.9],[139.5,54.2],[140.6,53.6],[141.4,52.9],[141.3,52.2],[140.6,51.4],[140.4,50.4],[140.4,49],[139.3,47.9],[138.5,47.2],[137.6,46],[136.5,44.9],[135.2,43.8],[134,42.9],[133,42.75],[132.3,43.2],[131.9,43],[131.3,42.6],[130.7,42.3],[130.2,41.9],[129.7,41],[129.4,40.2],[128.5,39.5],[127.5,39],[128.6,38],[129.4,36.5],[129.5,33],[200,33],[200,86],[19.5,86]];
var SEAS=[
 /* Балтика: Финский, Рижский, Ботнический заливы */
 [[18,54.4],[19.6,54.45],[19.95,54.6],[19.9,54.9],[20.5,54.95],[21.2,55],[21.1,55.3],[21.1,55.75],[21,56.2],[21,56.6],[21.4,57],[21.7,57.5],[22.6,57.76],[23.2,57.3],[23.6,57],[24.1,57.05],[24.4,57.4],[24.4,58],[24.5,58.35],[23.6,58.6],[23.5,59],[24,59.3],[24.8,59.5],[26,59.6],[27,59.5],[28.05,59.45],[28.5,59.8],[29.2,59.9],[30.2,59.9],[29.6,60.1],[28.8,60.5],[28.5,60.6],[27.5,60.5],[26.5,60.4],[25.5,60.3],[24.5,60],[23.4,59.9],[22.9,59.85],[22.3,60.3],[21.4,60.7],[21.3,61.5],[21.5,62.3],[21.2,62.9],[22,63.4],[23.3,63.9],[24.5,64.7],[25.3,65],[25.2,65.6],[24.5,65.8],[23.5,65.8],[22.2,65.6],[21.5,65.2],[21.2,64.7],[20.6,64],[18,63]],
 /* Чёрное море */
 [[27.6,42.5],[28,43.2],[28.6,44.2],[29.6,45.3],[30.7,46.4],[31.8,46.6],[32.2,46.5],[33.6,46.1],[32.6,45.6],[32.5,45.4],[33.5,44.6],[34.4,44.5],[35.4,45],[36.5,45.2],[36.8,45.1],[37.3,44.7],[37.8,44.7],[39,44.1],[39.7,43.6],[40,43.4],[41.6,41.6],[41.5,41],[40,41],[38,40.9],[36,41.7],[35.1,42],[33,41.9],[31,41.2],[29.1,41.2],[28,41.6]],
 /* Азовское море */
 [[35.4,45.35],[34.8,46.2],[35.5,46.6],[36.8,46.7],[37.6,47.1],[38.9,47.25],[39.2,47],[38.3,46.7],[38.15,46],[37.5,45.6],[37.4,45.3],[36.6,45.4]],
 /* Каспий */
 [[47.4,45.4],[48,45.8],[49.5,46.6],[51.9,47.1],[53.1,46.8],[53.2,46.5],[53,45.3],[51.3,44.6],[51.2,43.65],[52.5,42],[52.9,41],[53,40],[53.8,37.5],[51,36.8],[49,37.6],[48.9,38.5],[49.5,40.3],[49.9,40.4],[48.6,41.8],[47.5,43],[47.4,44.2],[46.8,44.7]],
 /* Ладога, Онега, Чудское, Ильмень, Ханка */
 [[31,59.95],[32.3,60.1],[32.9,60.6],[32.6,61.2],[31.6,61.75],[30.7,61.65],[30,61.1],[29.9,60.6],[30.5,60.1]],
 [[35.5,60.9],[36.2,61],[36.5,61.5],[35.8,62.3],[35,62.9],[34.5,62.6],[34.3,61.8],[35,61.2]],
 [[27.4,58.9],[27.9,58.9],[28,58.3],[27.6,57.9],[27.4,58.2]],
 [[31,58.2],[31.5,58.15],[31.6,58.35],[31.1,58.4]],
 [[132,45],[132.6,44.7],[132.9,45.1],[132.4,45.4]]
];
var BAIKAL=[[103.8,51.6],[104.9,51.85],[106.3,52.55],[107.3,53.25],[108.3,54.1],[109.2,55],[109.5,55.75]];
var ISL=[
 [[53.3,70.7],[52.2,71.5],[51.6,72.2],[53,73],[54,73.9],[55.5,74.8],[57.5,75.5],[60.5,76.2],[64,76.6],[67,77],[69,76.95],[68.5,76.4],[65.5,75.8],[62,75.2],[59.5,74.4],[57.8,73.6],[56.5,72.6],[56,71.6],[57.6,70.7],[55.5,70.6]],
 [[58.5,70.1],[59.4,69.8],[60.5,70],[59.6,70.4]],[[48.3,69.1],[49.4,68.9],[49.6,69.4],[48.6,69.5]],
 [[46,80.3],[50,79.9],[55,80],[60,80.4],[63,81],[58,81.8],[50,81.4],[45,81]],
 [[18,78],[21,77.5],[22.5,77.3],[25,77.7],[23,78.5],[27,79.2],[26,80.3],[20,80.5],[18,80]],
 [[95,79],[97.5,78.2],[101,78.6],[103.5,79.2],[104.5,79.8],[102,80.6],[98,81.2],[94,80.5]],
 [[137,75],[139.5,74.6],[142,75],[143,75.6],[140,76.1],[137.5,75.8]],[[146.5,74.8],[149,74.7],[150.5,75.1],[148,75.4]],[[140.5,73.4],[143.5,73.3],[142.5,73.9],[141,73.8]],
 [[178.6,71],[180,71.55],[182.4,71.45],[182.6,71.05],[180.5,70.85]],
 [[142,54.3],[142.7,54.4],[143.3,53],[143.2,51.5],[143.5,50],[144.7,48.8],[143.2,49.3],[142.6,47.5],[143.4,46.1],[142.75,46.6],[141.9,46],[142,47.5],[142.1,49.5],[142.2,51.5],[141.6,52.5],[141.7,53.5]],
 [[140,41.5],[141.2,41.8],[141.7,42.6],[143.3,41.9],[144.5,43],[145.8,43.3],[145.3,44.3],[142,45.5],[141.6,45.3],[141.4,43.4],[140.4,43.3],[140,42.3]],
 [[139.8,40],[140,40.9],[140.4,41.25],[141.2,41.5],[141.5,40.7],[142,39.5],[141.5,38.3],[140.8,37.5],[140.6,36],[138.5,37],[139.4,38.2],[139.8,39]],
 [[145.9,43.4],[146.6,43.8],[148.9,45.4],[148.5,45.6],[146.2,44.2]],[[149.5,45.8],[150.6,46.2],[150.3,46.4]],[[151.8,46.8],[152.4,47.2],[152,47.3]],[[153,47.9],[153.6,48.4],[153.2,48.5]],
 [[154.3,48.9],[154.9,49.4],[154.5,49.6]],[[155.2,49.9],[156.3,50.4],[155.9,50.8],[155.3,50.4]],[[165.8,55.2],[166.6,54.7],[166.3,55.3]],
 [[21.8,58.3],[22.2,57.9],[23,58.2],[23.3,58.5],[22.5,58.6],[22,58.6]],[[22.2,58.9],[23,58.8],[23,59.05],[22.4,59.1]],[[19.6,60.1],[20.5,60],[20.6,60.4],[19.9,60.45]]
];
var RIV=[
 [[32.5,57.2],[34.5,57.1],[35.9,56.9],[37.5,56.7],[38.5,57.4],[39.9,57.6],[41,57.5],[42.5,57.3],[44,56.3],[46,56.1],[48,55.8],[49.1,55.8],[49.2,54.8],[48.6,54],[49.6,53.4],[50.1,53.2],[49.5,52.6],[48,52],[46,51.5],[45.5,50.6],[44.5,48.7],[46.2,47.6],[47.5,46.8],[48,46.3],[48.4,45.9]],
 [[56.2,58],[55.2,57.3],[53.5,56.2],[52.4,55.7],[50.6,55.3],[49.3,55.2]],
 [[44,56.3],[42,55.6],[40.3,55],[39.2,54.6],[37.7,55.1],[36.3,54.5],[36,53]],
 [[38.4,53.9],[39.2,51.7],[40.2,50.6],[41.5,49.8],[43,49],[42.6,48.2],[41.3,47.5],[39.7,47.2],[39.3,47.1]],
 [[46.6,61.3],[45,62.5],[43.2,63.4],[41.6,64.1],[40.5,64.55]],
 [[57.5,61.8],[56.5,63.8],[57.5,65.2],[56,66.4],[53,67.6],[53.5,68.4]],
 [[85,52],[83.8,53.3],[82.9,55],[84.5,57],[82,60.5],[76.6,61],[69,61],[66.5,62.8],[65.5,64.5],[66.6,66.5],[69,66.8],[71.8,67.2]],
 [[73.4,55],[71,56.8],[68.2,58.2],[69,61]],
 [[94.4,51.7],[92.8,53.5],[92.9,56],[92.3,58.3],[90.5,60],[89.5,62],[87.9,65.8],[86.4,67.5],[86.2,69.4],[83.4,70.2],[82.8,70.1]],
 [[104.3,52.3],[103.5,54],[101.6,56.1],[98,58],[93,58.1]],
 [[106,54],[105.7,56.8],[108,57.8],[110.5,59],[114.9,60.7],[120.4,60.4],[124,60.6],[129.7,62],[129.5,64.2],[127.4,66.7],[127,70.5],[127,72.3]],
 [[121.5,53.3],[124.5,53.5],[127.5,50.3],[130.5,48],[135,48.5],[136.8,49.7],[137,50.6],[138.6,52.5],[140.7,53.1]],
 [[148,62],[152.4,62.9],[153.3,65],[153.7,67.5],[156.5,68.7],[160.8,69.5]]
];
var RIDGE=[[[59.3,51.5],[59.5,55],[59.2,58],[59.5,61],[59.8,64.5],[62,66],[65,68],[66.5,68.7]],[[37.6,44.8],[40,43.7],[42.5,43.2],[45,42.6],[47,41.9],[49,41.2]],[[84,50],[88,49.8],[92,51.5],[97,52],[102,51.5]]];
var MOSCOW=[37.62,55.75];

/* ---------- места: [название, что это, долгота, широта, сложность 1–3, чем известно] ---------- */
var PL=[
 ['Санкт-Петербург','город',30.32,59.94,1,'Северная столица стоит в устье Невы, на Финском заливе.'],
 ['Новосибирск','город',82.92,55.03,1,'Третий по числу жителей город России, стоит на Оби.'],
 ['Екатеринбург','город',60.6,56.84,1,'Столица Урала — совсем рядом граница Европы и Азии.'],
 ['Казань','город',49.11,55.79,1,'Стоит на Волге; в Кремле рядом — мечеть Кул-Шариф и собор.'],
 ['Сочи','город',39.73,43.6,1,'Курорт на Чёрном море, здесь прошла Олимпиада-2014.'],
 ['Владивосток','город',131.9,43.12,1,'Город у Японского моря — здесь кончается Транссиб.'],
 ['Мурманск','город',33.08,68.97,1,'Самый большой город за Полярным кругом; порт зимой не замерзает.'],
 ['Нижний Новгород','город',44,56.33,1,'Стоит на слиянии Оки и Волги.'],
 ['Волгоград','город',44.52,48.71,1,'Мамаев курган и «Родина-мать зовёт!» над Волгой.'],
 ['Красноярск','город',92.87,56.01,1,'Стоит на Енисее, рядом заповедник «Столбы».'],
 ['Иркутск','город',104.3,52.29,1,'Стоит на Ангаре; до Байкала — около 70 км.'],
 ['Калининград','город',20.51,54.71,1,'Самый западный областной центр России, у Балтийского моря.'],
 ['Архангельск','город',40.54,64.54,1,'Порт на Северной Двине у Белого моря.'],
 ['Ростов-на-Дону','город',39.72,47.23,1,'«Ворота Кавказа» на Дону, недалеко от Азовского моря.'],
 ['Хабаровск','город',135.07,48.48,1,'Стоит на Амуре; его виды — на пятитысячной купюре.'],
 ['Якутск','город',129.73,62.03,1,'Самый большой город на вечной мерзлоте, стоит на Лене.'],
 ['Самара','город',50.1,53.2,1,'Стоит на Волге у Жигулёвских гор.'],
 ['Омск','город',73.37,54.99,1,'Стоит там, где Омь впадает в Иртыш.'],
 ['Астрахань','город',48.03,46.35,1,'В дельте Волги, недалеко от Каспийского моря; славится арбузами.'],
 ['Петропавловск-Камчатский','город',158.65,53.02,1,'Город на Камчатке, вокруг — вулканы.'],
 ['Пермь','город',56.25,58.01,2,'Стоит на Каме, у западного склона Урала.'],
 ['Уфа','город',55.97,54.74,2,'Столица Башкортостана, на реке Белой.'],
 ['Челябинск','город',61.4,55.16,2,'Город на восточном склоне Урала; в 2013 году над ним взорвался метеорит.'],
 ['Тюмень','город',65.53,57.15,2,'Один из первых русских городов Сибири (1586 год), на Туре.'],
 ['Томск','город',84.95,56.48,2,'Старейший университетский город Сибири, на Томи.'],
 ['Магадан','город',150.8,59.56,2,'Порт на Охотском море, «столица Колымы».'],
 ['Южно-Сахалинск','город',142.73,46.96,2,'Главный город острова Сахалин.'],
 ['Норильск','город',88.2,69.35,2,'Один из самых северных крупных городов мира, на Таймыре.'],
 ['Анадырь','город',177.5,64.73,2,'Самый восточный город России, столица Чукотки.'],
 ['Салехард','город',66.6,66.53,2,'Единственный город, стоящий прямо на Северном полярном круге.'],
 ['Воронеж','город',39.2,51.66,2,'Здесь Пётр I строил первый русский флот.'],
 ['Ярославль','город',39.89,57.63,2,'Один из главных городов Золотого кольца, на Волге.'],
 ['Смоленск','город',32.04,54.78,2,'Древний город на Днепре; крепостная стена ещё времён Годунова.'],
 ['Псков','город',28.33,57.82,2,'Древний город с кремлём (Кромом), недалеко от Чудского озера.'],
 ['Великий Новгород','город',31.27,58.52,2,'Один из древнейших городов Руси, у озера Ильмень.'],
 ['Петрозаводск','город',34.36,61.79,2,'Столица Карелии, на берегу Онежского озера.'],
 ['Вологда','город',39.89,59.22,2,'Город вологодского масла и кружева.'],
 ['Тула','город',37.62,54.19,2,'Город пряников, самоваров и оружейников.'],
 ['Суздаль','город',40.45,56.42,2,'Город-музей Золотого кольца, полный белокаменных храмов.'],
 ['Иваново','город',40.97,57,2,'«Город невест» и ситцевая столица России.'],
 ['Саратов','город',46.03,51.53,2,'Город на Волге; отсюда родом гармонь с колокольчиками.'],
 ['Оренбург','город',55.1,51.77,2,'Знаменит оренбургскими пуховыми платками.'],
 ['Махачкала','город',47.5,42.98,2,'Столица Дагестана на берегу Каспия.'],
 ['Краснодар','город',38.98,45.04,2,'Столица Кубани, на реке Кубань.'],
 ['Барнаул','город',83.78,53.35,2,'Столица Алтайского края, на Оби.'],
 ['Улан-Удэ','город',107.6,51.83,2,'Столица Бурятии; на площади — огромная голова Ленина.'],
 ['Чита','город',113.5,52.03,2,'Главный город Забайкалья; здесь жили ссыльные декабристы.'],
 ['Благовещенск','город',127.53,50.27,2,'Стоит на Амуре, напротив китайского города Хэйхэ.'],
 ['Кызыл','город',94.45,51.72,2,'Столица Тувы; здесь стоит обелиск «Центр Азии».'],
 ['Сургут','город',73.4,61.25,2,'Нефтяная столица Западной Сибири, на Оби.'],
 ['Калуга','город',36.26,54.51,2,'Здесь жил Циолковский; в городе — музей космонавтики.'],
 ['Ижевск','город',53.2,56.85,2,'Столица Удмуртии; здесь работал Михаил Калашников.'],
 ['Тверь','город',35.9,56.86,2,'Стоит на Волге между Москвой и Петербургом.'],
 ['Кемерово','город',86.09,55.35,2,'Столица Кузбасса — угольного края.'],
 ['Комсомольск-на-Амуре','город',137,50.55,2,'Город, построенный в 1932 году комсомольцами.'],
 ['Воркута','город',64,67.5,3,'Угольный город за Полярным кругом, в республике Коми.'],
 ['Нарьян-Мар','город',53,67.64,3,'Город у устья Печоры, столица Ненецкого округа.'],
 ['Верхоянск','город',133.39,67.55,3,'Один из «полюсов холода»: морозы здесь до −67°.'],
 ['Оймякон','село',143.15,63.46,3,'«Полюс холода»: здесь отмечали −67,7°.'],
 ['Певек','город',170.3,69.7,3,'Самый северный город России, на Чукотке.'],
 ['Тикси','посёлок',128.87,71.64,3,'Порт на море Лаптевых, рядом дельта Лены.'],
 ['Дудинка','город',86.18,69.4,3,'Порт на Енисее, через него вывозят металл Норильска.'],
 ['Тобольск','город',68.25,58.2,3,'Старая столица Сибири; единственный каменный кремль за Уралом.'],
 ['Абакан','город',91.44,53.72,3,'Столица Хакасии, на Енисее.'],
 ['Братск','город',101.6,56.15,3,'Город у огромной Братской ГЭС на Ангаре.'],
 ['Находка','город',132.87,42.82,3,'Морской порт к востоку от Владивостока.'],
 ['Сыктывкар','город',50.84,61.67,3,'Столица республики Коми.'],
 ['Элиста','город',44.27,46.31,3,'Столица Калмыкии — тут есть «Сити Чесс», шахматный городок.'],
 ['Гора Эльбрус','гора',42.44,43.35,1,'Высочайшая вершина России и Европы — 5642 м.'],
 ['Остров Ольхон','остров',107.4,53.15,1,'Самый большой остров Байкала.'],
 ['Мыс Дежнёва','мыс',190.35,66.07,1,'Самая восточная точка материка Евразия.'],
 ['Ключевская Сопка','вулкан',160.64,56.06,2,'Высочайший действующий вулкан Евразии, на Камчатке.'],
 ['Гора Белуха','гора',86.59,49.81,2,'Высшая точка Сибири, на Алтае.'],
 ['Гора Народная','гора',59.5,65.03,3,'Высшая точка Уральских гор — 1895 м.'],
 ['Валаам','остров',30.95,61.38,2,'Остров с монастырём на Ладожском озере.'],
 ['Кижи','остров',35.22,62.07,2,'Остров на Онежском озере, деревянная Преображенская церковь без единого гвоздя.'],
 ['Соловецкие острова','острова',35.7,65.05,2,'Острова в Белом море со старинным монастырём.'],
 ['Долина гейзеров','долина',160.13,54.43,2,'Одно из крупнейших полей гейзеров в мире, на Камчатке.'],
 ['Мыс Челюскин','мыс',104.3,77.72,2,'Самая северная точка материка Евразия, на Таймыре.'],
 ['Остров Врангеля','остров',180.5,71.25,2,'Заповедник белых медведей в Чукотском море.'],
 ['Полуостров Ямал','полуостров',69.5,70.5,1,'«Край земли» по-ненецки; здесь пасут оленей и добывают газ.'],
 ['Полуостров Таймыр','полуостров',100,74,1,'Самый северный полуостров Евразии.'],
 ['Исток Волги','место',32.47,57.25,2,'Волга начинается ручейком на Валдае, в Тверской области.'],
 ['Озеро Селигер','озеро',33,57.2,3,'Озеро с сотней островов на Валдае.'],
 ['Ясная Поляна','усадьба',37.53,54.07,2,'Усадьба Льва Толстого под Тулой.'],
 ['Болдино','село',45.32,55,3,'Здесь Пушкин провёл знаменитую «Болдинскую осень» 1830 года.'],
 ['Михайловское','усадьба',28.92,57.06,3,'Имение Пушкина в Псковской области.'],
 ['Бородинское поле','поле',35.82,55.52,2,'Место великой битвы с Наполеоном в 1812 году.'],
 ['Куликово поле','поле',38.66,53.67,3,'Здесь Дмитрий Донской разбил Мамая в 1380 году.'],
 ['Прохоровка','село',36.73,51.04,3,'Место великого танкового сражения 1943 года.'],
 ['Космодром Восточный','космодром',128.33,51.88,3,'Новый российский космодром в Амурской области.'],
 ['Кунгурская пещера','пещера',57,57.44,3,'Ледяная пещера в Пермском крае.'],
 ['Телецкое озеро','озеро',87.6,51.6,3,'«Малый Байкал» — глубокое горное озеро на Алтае.'],
 ['Плато Путорана','плато',94,69,3,'Горное плато за Полярным кругом — край водопадов.'],
 ['Куршская коса','коса',20.95,55.2,3,'Узкая песчаная коса между заливом и Балтийским морем, «танцующий лес».'],
 ['Плёс','город',41.51,57.46,3,'Городок на Волге, который так любил рисовать Левитан.']
];

/* ---------- геометрия: пути SVG ---------- */
function path(a,close){var s='';for(var i=0;i<a.length;i++){var p=prj(a[i][0],a[i][1]);s+=(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1);}return s+(close?'Z':'');}
function band(){var a=[],l;for(l=19.5;l<=191;l+=2)a.push([l,40.5]);for(l=40.5;l<=89;l+=3)a.push([191,l]);for(l=191;l>=19.5;l-=2)a.push([l,89.5]);for(l=89;l>=40.5;l-=3)a.push([19.5,l]);return path(a,true);}
function grat(){var s='',l,f,a;for(f=45;f<=80;f+=5){a=[];for(l=19.5;l<=191;l+=3)a.push([l,f]);s+=path(a);}for(l=20;l<=190;l+=10){a=[];for(f=40.5;f<=84;f+=2)a.push([l,f]);s+=path(a);}return s;}
function bkPath(){var L=[],R=[];for(var i=0;i<BAIKAL.length;i++){var c=BAIKAL[i],n=BAIKAL[Math.min(i+1,BAIKAL.length-1)],q=BAIKAL[Math.max(i-1,0)],dx=n[0]-q[0],dy=n[1]-q[1],m=Math.sqrt(dx*dx+dy*dy)||1,w=(i===0||i===BAIKAL.length-1)?.08:.32;
  L.push([c[0]-dy/m*w*1.6,c[1]+dx/m*w*.7]);R.unshift([c[0]+dy/m*w*1.6,c[1]-dx/m*w*.7]);}return path(L.concat(R),true);}
var VB=(function(){var b=[[19.5,54.2],[20.5,55.3],[191,66],[180.5,71.5],[104.3,78.6],[60,81.2],[30,70.5],[131.9,42.6],[47.8,41.6],[146,43.4],[166,54.5],[28,46]],x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  b.forEach(function(p){var q=prj(p[0],p[1]);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);});
  return [x0-14,y0-14,x1-x0+28,y1-y0+28];})();
var MAPSVG=null;
function mapSvg(){if(MAPSVG)return MAPSVG;var s='',i;
  s+='<defs><clipPath id="vmcKBand"><path d="'+band()+'"/></clipPath><pattern id="vmcKPap" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#e9dcc0"/><path d="M0 8L8 0" stroke="#dccba6" stroke-width="1"/></pattern></defs>';
  s+='<rect x="'+VB[0]+'" y="'+VB[1]+'" width="'+VB[2]+'" height="'+VB[3]+'" fill="url(#vmcKPap)"/>';
  s+='<g clip-path="url(#vmcKBand)"><path d="'+band()+'" fill="#f4e6bf"/>';
  s+='<path d="'+path(OCEAN,true)+'" fill="#8fcdea" stroke="#233247" stroke-width="1.3" stroke-linejoin="round"/>';
  for(i=0;i<SEAS.length;i++)s+='<path d="'+path(SEAS[i],true)+'" fill="#8fcdea" stroke="#233247" stroke-width="1.1" stroke-linejoin="round"/>';
  s+='<path d="'+bkPath()+'" fill="#8fcdea" stroke="#233247" stroke-width="1"/>';
  for(i=0;i<ISL.length;i++)s+='<path d="'+path(ISL[i],true)+'" fill="#f4e6bf" stroke="#233247" stroke-width="1.1" stroke-linejoin="round"/>';
  s+='<path d="'+grat()+'" fill="none" stroke="#233247" stroke-opacity=".13" stroke-width="1"/>';
  for(i=0;i<RIDGE.length;i++)s+='<path d="'+path(RIDGE[i])+'" fill="none" stroke="#b07a3c" stroke-opacity=".55" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 5"/>';
  for(i=0;i<RIV.length;i++)s+='<path d="'+path(RIV[i])+'" fill="none" stroke="#3f8fd0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
  s+='</g><path d="'+band()+'" fill="none" stroke="#233247" stroke-width="2"/>';
  var m=prj(MOSCOW[0],MOSCOW[1]);s+='<g class="vmc-k-msk" transform="translate('+m[0].toFixed(1)+' '+m[1].toFixed(1)+')"><circle r="4.2" fill="#c0392b" stroke="#fff" stroke-width="1.4"/><text x="0" y="-8" text-anchor="middle">Москва</text></g>';
  return MAPSVG=s;}

function vmcRnd(o){if(o&&typeof o.rnd==='function')return o.rnd;var a=(o&&+o.seed>>>0)||(Math.random()*4e9>>>0);
  return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function vmcShuf(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}return a;}
/* набор на заход: 2 лёгких, 2 средних, 1 трудное — по зерну дня (одинаково у всех), от лёгкого к трудному */
function vmcSet(o){var r=vmcRnd(o),by={1:[],2:[],3:[]};PL.forEach(function(p,i){by[p[4]].push(i);});
  var a=vmcShuf(by[1],r).slice(0,2).concat(vmcShuf(by[2],r).slice(0,2),vmcShuf(by[3],r).slice(0,1));return {r:r,list:a.map(function(i){return PL[i];})};}
function vmcTier(s){return s>=TIER[2]?3:s>=TIER[1]?2:s>=TIER[0]?1:0;}
function vmcPC(){try{if(typeof window.vmgPC==='function')return !!window.vmgPC();return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
function vmcSnd(host,k){try{var s=host&&host.snd||window.SND;if(s&&s[k])s[k]();}catch(e){}}
function vmcPortrait(m){try{return typeof portrait==='function'?portrait('mihalych',m||'norm'):'';}catch(e){return '';}}
function vmcEsc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function vmcStars(t){var s='';for(var i=0;i<3;i++)s+='<i class="vmc-k-sr'+(i<t?' on':'')+'">★</i>';return s;}
function vmcKm(d){d=Math.round(d);return d<10?'меньше 10 км':(d>=1000?Math.floor(d/1000)+' '+String(d%1000+1000).slice(1):d)+' км';}

var CSS='\
.vmc-k{position:relative;flex:1 0 auto;min-height:0;display:flex;flex-direction:column;font-family:KF,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink,#233247);-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}\
.vmc-k *{box-sizing:border-box}\
#vmgHost .vmg-el>.vmc-k{max-width:1000px}.vmc-k-in{width:100%;flex:1;min-height:0;display:flex;flex-direction:column}\
.vmc-k-top{display:flex;align-items:center;justify-content:center;gap:10px;min-height:30px;margin-bottom:6px}\
.vmc-k-tt{font-weight:800;font-size:19px;line-height:1.1;flex:1;min-width:0}\
.vmc-k-tt small{display:block;font-weight:600;font-size:13px;color:var(--muted,#5a6676)}\
.vmc-k-pts{font-weight:800;font-size:16px;background:var(--card,#fffaf0);border:2px solid #233247;border-radius:12px;padding:3px 9px;box-shadow:0 2px 0 #233247;white-space:nowrap}\
.vmc-k-dots{display:flex;gap:5px}.vmc-k-dots i{width:12px;height:12px;border-radius:50%;border:2px solid #233247;background:#fffdf6}.vmc-k-dots i.on{background:var(--go,#ff7a1a)}.vmc-k-dots i.dn{background:var(--grn,#2fa84f)}\
.vmc-k-ask{display:flex;align-items:center;gap:10px;background:var(--card,#fffaf0);border:2.5px solid #233247;border-radius:16px;box-shadow:0 4px 0 #233247;padding:8px 12px;margin-bottom:8px;min-height:64px}\
.vmc-k-ask .k{font-size:14px;font-weight:700;color:var(--muted,#5a6676);line-height:1.1}\
.vmc-k-ask .nm{font-size:23px;font-weight:900;line-height:1.1}\
.vmc-k-ask .tx{flex:1;min-width:0}\
.vmc-k-ask .sub{font-size:13px;font-weight:800;color:#fff;background:#3f8fd0;border-radius:8px;padding:2px 7px;display:inline-block;margin-top:3px}\
.vmc-k-ask .res{font-size:16px;font-weight:700;line-height:1.25}\
.vmc-k-ask .res b{font-size:19px}\
.vmc-k-frm{position:relative;flex:none;display:flex;align-items:center;justify-content:center;background:#9b6a3c;border:2.5px solid #233247;border-radius:14px;box-shadow:0 4px 0 #233247;padding:6px;overflow:hidden}\
.vmc-k-frm svg.mp{display:block;width:100%;background:#e9dcc0;border-radius:8px;touch-action:none;cursor:crosshair}\
.vmc-k-msk text{font:700 11px KF,sans-serif;fill:#7a2318;paint-order:stroke;stroke:#f4e6bf;stroke-width:3px}\
.vmc-k-zm{position:absolute;right:12px;top:12px;width:48px;height:48px;border-radius:50%;border:2.5px solid #233247;background:#fffdf6;box-shadow:0 3px 0 #233247;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}\
.vmc-k-zm.on{background:var(--sel,#ffe08a)}\
.vmc-k-zm .vmc-k-kc{position:absolute;bottom:-6px;right:-6px;background:#fffdf6}\
.vmc-k-hint{position:absolute;left:12px;bottom:12px;right:70px;font-size:14px;font-weight:700;color:#233247;background:rgba(255,253,246,.92);border:2px solid #233247;border-radius:10px;padding:4px 8px;pointer-events:none}\
.vmc-k-rule .vmg-say{margin:0 0 6px}.vmc-k-rule .vmg-av{width:48px;height:48px}.vmc-k-rule .vmg-sb{font-size:15.5px;padding:6px 10px}\
.vmc-k-row{display:flex;gap:8px;margin-top:8px}.vmc-k-sp{flex:1;min-height:0}\
.vmc-k-b{flex:1;min-height:52px;border:2.5px solid #233247;border-radius:14px;background:var(--btn,#fffdf6);box-shadow:0 4px 0 #233247;font:800 18px/1.1 KF,-apple-system,sans-serif;color:#233247;cursor:pointer;padding:4px 8px;display:flex;align-items:center;justify-content:center;gap:8px}\
.vmc-k-b:active{transform:translateY(3px);box-shadow:0 1px 0 #233247}\
.vmc-k-b.go{background:var(--go,#ff7a1a);color:#fff}\
.vmc-k-b[disabled]{background:#ebe6d8;color:#8d8a80;border-color:#c9c3b2;box-shadow:0 3px 0 #c9c3b2;pointer-events:none}\
.vmc-k-kc{display:none;font:700 12px/1 KF,sans-serif;border:1.5px solid currentColor;border-radius:5px;padding:2px 4px;opacity:.85}\
.vmc-k.pc .vmc-k-kc{display:inline-block}\
.vmc-k-wrap{flex:1;display:flex;padding:4px 0;min-height:0;width:100%}\
.vmc-k-card{margin:auto;max-width:460px;width:100%;background:var(--card,#fffaf0);border:2.5px solid #233247;border-radius:20px;box-shadow:0 5px 0 #233247;padding:16px;text-align:center;display:flex;flex-direction:column;gap:10px;max-height:100%;overflow-y:auto}\
.vmc-k-card h2{margin:0;font-size:24px;font-weight:900}\
.vmc-k-card p{margin:0;font-size:17px;line-height:1.35}\
.vmc-k-card .pt{width:110px;height:110px;margin:0 auto -4px}.vmc-k-card .pt svg{width:100%;height:100%}\
.vmc-k-card table{width:100%;border-collapse:collapse;font-size:16px}\
.vmc-k-card td{padding:5px 4px;border-bottom:1.5px dashed #e6dcc4;text-align:left}.vmc-k-card td.r{text-align:right;white-space:nowrap;font-weight:800}\
.vmc-k-sr{font-style:normal;font-size:40px;color:#cfc6ae;-webkit-text-stroke:1.5px #233247;display:inline-block}.vmc-k-sr.on{color:var(--gold,#ffcf40)}\
body.big .vmc-k-ask .nm{font-size:26px}body.big .vmc-k-ask .res{font-size:18px}body.big .vmc-k-card p{font-size:20px}\
@media (max-height:600px){.vmc-k-ask{min-height:52px;padding:5px 10px;margin-bottom:6px}.vmc-k-ask .nm{font-size:20px}.vmc-k-ask .res{font-size:15px}.vmc-k-row{margin-top:6px}.vmc-k-b{min-height:48px}}\
@media (min-width:700px){.vmc-k-ask .nm{font-size:26px}}\
@keyframes vmcKDrop{0%{transform:translateY(-30px);opacity:0}70%{transform:translateY(3px)}100%{transform:none;opacity:1}}\
@keyframes vmcKPing{0%{r:4;opacity:1}100%{r:26;opacity:0}}\
.vmc-k-fl{animation:vmcKDrop .25s}\
@media (prefers-reduced-motion:reduce){.vmc-k *{animation:none!important;transition:none!important}}';
function vmcCss(){if(document.getElementById('vmc-css-'+ID))return;var s=document.createElement('style');s.id='vmc-css-'+ID;s.textContent=CSS;document.head.appendChild(s);}

function run(host,o){
  o=o||{};vmcCss();
  var SET=vmcSet(o),R=0,score=0,res=[],dead=false,keyH=null,phase='intro',tm=[],flag=null,zoom=false,el={},drag=false;
  var root=document.createElement('div');root.className='vmc-k'+(PC?' pc':'');root.setAttribute('data-vmc',ID);host.el.appendChild(root);
  function off(){dead=true;tm.forEach(clearTimeout);if(keyH){window.removeEventListener('keydown',keyH,true);keyH=null;}}
  if(host.onQuit)host.onQuit(off);
  function busy(){return dead||host.paused||host.hold||!root.isConnected;}
  var PC=host.pc!=null?!!host.pc:vmcPC();root.className='vmc-k'+(PC?' pc':'');
  if(typeof host.keys==='function')host.keys(function(k,e){return !busy()&&onKey(k,e);});
  else window.addEventListener('keydown',keyH=function(e){if(busy()||e.ctrlKey||e.metaKey||e.altKey)return;if(onKey(e.key,e)){e.preventDefault();e.stopPropagation();}},true);
  function later(f,ms){tm.push(setTimeout(function(){if(!dead)f();},ms));}

  function head(){var d='';for(var i=0;i<ROUNDS;i++)d+='<i class="'+(i<R?'dn':i===R?'on':'')+'"></i>';
    if(host.top)host.top((R+1)+' из '+ROUNDS);
    return '<div class="vmc-k-top"><div class="vmc-k-dots">'+d+'</div><span class="vmc-k-pts">'+score+' очк.</span></div>';}
  function round(){phase='aim';flag=null;zoom=false;var p=SET.list[R];
    root.innerHTML='<div class="vmc-k-in">'+head()+
      (R===0&&typeof host.say==='function'?'<div class="vmc-k-rule">'+host.say('mihalych','Ставь флажок, где это место. Чем ближе — тем больше очков, до 100 за место. Москва отмечена для подсказки.','happy')+'</div>':'')+
      '<div class="vmc-k-ask"><div class="tx"><div class="k">Где это?</div><div class="nm">'+vmcEsc(p[0])+'</div><span class="sub">'+vmcEsc(p[1])+'</span></div></div>'+
      '<div class="vmc-k-frm"><svg class="mp" xmlns="http://www.w3.org/2000/svg" viewBox="'+VB.join(' ')+'" preserveAspectRatio="xMidYMid meet">'+mapSvg()+'<g class="vmc-k-lay"></g></svg>'+
      '<button class="vmc-k-zm" data-k="zm" aria-label="Лупа">🔍<span class="vmc-k-kc">Z</span></button><div class="vmc-k-hint">'+(PC?'Щёлкни по карте или двигай флажок стрелками':'Нажми на карту рядом с нужным местом — увеличу')+'</div></div>'+
      '<div class="vmc-k-sp"></div><div class="vmc-k-row"><button class="vmc-k-b go" data-k="ok" disabled>Поставить флажок <span class="vmc-k-kc">Enter</span></button></div></div>';
    el.svg=root.querySelector('svg.mp');el.lay=root.querySelector('.vmc-k-lay');el.ok=root.querySelector('[data-k=ok]');el.zm=root.querySelector('[data-k=zm]');el.hint=root.querySelector('.vmc-k-hint');el.ask=root.querySelector('.vmc-k-ask');
    el.ok.onclick=function(){place();};el.zm.onclick=function(){toggleZoom();};
    var sv=el.svg;
    sv.addEventListener('pointerdown',function(e){if(busy()||phase!=='aim')return;
      if(!zoom&&e.pointerType&&e.pointerType!=='mouse'){var q=toSvg(e);if(q){zoomAt(q);say('Теперь нажми точнее — там встанет флажок. 🔍 — вся карта');}e.preventDefault();return;}
      drag=true;try{sv.setPointerCapture(e.pointerId);}catch(x){}moveTo(e,true);e.preventDefault();});
    sv.addEventListener('pointermove',function(e){if(drag&&phase==='aim')moveTo(e,false);});
    var up=function(){drag=false;};sv.addEventListener('pointerup',up);sv.addEventListener('pointercancel',up);
    fit();if(host.onResize)host.onResize(function(){fit();draw();});
  }
  /* без лупы — вся карта во всю ширину рамки (высота по пропорции, не выше свободного места);
     с лупой — рамка на всё свободное место, вид ×ZM вокруг точки (на телефоне первое касание сначала увеличивает) */
  var ZM=2.6,zc=null;
  function fit(){var f=root.querySelector('.vmc-k-frm'),sp=root.querySelector('.vmc-k-sp');if(!f||!el.svg)return;el.svg.style.height='0px';
    var w=f.clientWidth-12,free=(sp?sp.clientHeight:0)-4,h;
    if(!zoom){h=Math.max(120,Math.min(w*VB[3]/VB[2],free));el.svg.style.height=Math.floor(h)+'px';el.svg.setAttribute('viewBox',VB.join(' '));draw();return;}
    h=Math.max(150,Math.min(free,w*1.5));el.svg.style.height=Math.floor(h)+'px';
    var vw=VB[2]/ZM,vh=vw*h/w;if(vh>VB[3]){vh=VB[3];vw=vh*w/h;}
    var c=zc||[VB[0]+VB[2]/2,VB[1]+VB[3]/2],x=Math.max(VB[0],Math.min(VB[0]+VB[2]-vw,c[0]-vw/2)),y=Math.max(VB[1],Math.min(VB[1]+VB[3]-vh,c[1]-vh/2));
    setVB([x,y,vw,vh]);}
  function zoomAt(q){zoom=true;zc=q;el.zm.classList.add('on');vmcSnd(host,'tap');fit();}
  function say(t){if(el.hint){el.hint.style.display='';el.hint.textContent=t;}}
  function toSvg(e){var sv=el.svg,pt=sv.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var m=sv.getScreenCTM();if(!m)return null;var q=pt.matrixTransform(m.inverse());return [q.x,q.y];}
  function moveTo(e,first){var q=toSvg(e);if(!q)return;var vb=curVB();q[0]=Math.max(vb[0],Math.min(vb[0]+vb[2],q[0]));q[1]=Math.max(vb[1],Math.min(vb[1]+vb[3],q[1]));
    var rl=root.querySelector('.vmc-k-rule');if(rl){rl.parentNode.removeChild(rl);fit();}
    var was=!!flag;flag=q;if(first)vmcSnd(host,'pick');draw(!was);el.ok.disabled=false;if(el.hint)el.hint.style.display='none';}
  function scale(){var r=el.svg.getBoundingClientRect(),vb=curVB();return r.width?Math.max(vb[2]/r.width,vb[3]/r.height):1;}
  function curVB(){var v=el.svg.getAttribute('viewBox').split(' ').map(Number);return v;}
  function flagSvg(p,s,cls){return '<g class="'+(cls||'')+'" transform="translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+') scale('+s.toFixed(3)+')"><ellipse cx="0" cy="0" rx="6" ry="2.5" fill="#233247" opacity=".35"/>'+
    '<path d="M0 0V-34" stroke="#233247" stroke-width="2.6" stroke-linecap="round"/><path d="M1 -34 L22 -27 L1 -19Z" fill="#ff7a1a" stroke="#233247" stroke-width="2" stroke-linejoin="round"/><circle r="2.6" fill="#233247"/></g>';}
  function starSvg(p,s){return '<g transform="translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+') scale('+s.toFixed(3)+')"><circle r="16" fill="#2fa84f" opacity=".25"><animate attributeName="r" from="6" to="22" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" from=".5" to="0" dur="1.2s" repeatCount="indefinite"/></circle>'+
    '<path d="M0 -11L3.2 -3.4L11 -3.4L4.8 1.6L7 9.5L0 4.8L-7 9.5L-4.8 1.6L-11 -3.4L-3.2 -3.4Z" fill="#ffcf40" stroke="#233247" stroke-width="2" stroke-linejoin="round"/></g>';}
  function draw(anim){if(!el.lay)return;var s=scale(),h='';
    if(phase==='shown'){var p=SET.list[R],t=prj(p[2],p[3]);
      if(flag)h+='<path d="M'+flag[0].toFixed(1)+' '+flag[1].toFixed(1)+'L'+t[0].toFixed(1)+' '+t[1].toFixed(1)+'" stroke="#c0392b" stroke-width="'+(2.4*s).toFixed(2)+'" stroke-dasharray="'+(6*s).toFixed(1)+' '+(5*s).toFixed(1)+'" fill="none"/>';
      if(flag)h+=flagSvg(flag,s);h+=starSvg(t,s);
      var vb=curVB(),an=t[0]<vb[0]+vb[2]*.18?'start':t[0]>vb[0]+vb[2]*.82?'end':'middle',tx=an==='start'?t[0]-8*s:an==='end'?t[0]+8*s:t[0],ty=t[1]>vb[1]+vb[3]*.85?t[1]-16*s:t[1]+20*s;
      h+='<text x="'+tx.toFixed(1)+'" y="'+ty.toFixed(1)+'" text-anchor="'+an+'" style="font:800 '+(13*s).toFixed(1)+'px KF,sans-serif;fill:#1d3350;paint-order:stroke;stroke:#fffaf0;stroke-width:'+(4*s).toFixed(1)+'px">'+vmcEsc(p[0])+'</text>';}
    else if(flag)h+=flagSvg(flag,s,anim?'vmc-k-fl':'');
    el.lay.innerHTML=h;
    var msk=el.svg.querySelector('.vmc-k-msk');if(msk){var m=prj(MOSCOW[0],MOSCOW[1]);msk.setAttribute('transform','translate('+m[0].toFixed(1)+' '+m[1].toFixed(1)+') scale('+s.toFixed(3)+')');}}
  function setVB(v){el.svg.setAttribute('viewBox',v.map(function(x){return x.toFixed(1);}).join(' '));draw();}
  function toggleZoom(){if(busy()||phase!=='aim')return;if(zoom){zoom=false;el.zm.classList.remove('on');vmcSnd(host,'tap');fit();return;}
    zoomAt(flag||[VB[0]+VB[2]*.45,VB[1]+VB[3]*.55]);}
  function nudge(dx,dy,fast){if(phase!=='aim')return;var vb=curVB(),st=(fast?5:1)*vb[2]/120;
    if(!flag){flag=[VB[0]+VB[2]*.45,VB[1]+VB[3]*.55];el.ok.disabled=false;if(el.hint)el.hint.style.display='none';draw(true);return;}
    flag=[Math.max(VB[0],Math.min(VB[0]+VB[2],flag[0]+dx*st)),Math.max(VB[1],Math.min(VB[1]+VB[3],flag[1]+dy*st))];
    if(zoom){var x=vb[0],y=vb[1];if(flag[0]<x+vb[2]*.1)x=flag[0]-vb[2]*.1;if(flag[0]>x+vb[2]*.9)x=flag[0]-vb[2]*.9;if(flag[1]<y+vb[3]*.1)y=flag[1]-vb[3]*.1;if(flag[1]>y+vb[3]*.9)y=flag[1]-vb[3]*.9;
      x=Math.max(VB[0],Math.min(VB[0]+VB[2]-vb[2],x));y=Math.max(VB[1],Math.min(VB[1]+VB[3]-vb[3],y));if(x!==vb[0]||y!==vb[1]){setVB([x,y,vb[2],vb[3]]);return;}}
    draw();}
  function place(){if(busy()||phase!=='aim'||!flag)return;var p=SET.list[R],g=inv(flag[0],flag[1]),d=km(g,[p[2],p[3]]),pt=pts(d);
    phase='shown';score+=pt;res.push({n:p[0],d:d,p:pt});zoom=false;el.zm.classList.remove('on');el.zm.style.display='none';fit();
    vmcSnd(host,pt>=80?'right':pt>=40?'pick':'wrong');if(pt>=90)later(function(){vmcSnd(host,'coin');},250);
    var msg=d<=30?'В яблочко!':pt>=80?'Совсем рядом!':pt>=50?'Неплохо!':pt>0?'Далековато…':'Мимо!';
    el.ask.innerHTML='<div class="tx"><div class="res"><b>'+msg+' +'+pt+'</b> · '+(d<=30?'точно на месте':'промах '+vmcKm(d))+'</div><div class="res" style="font-weight:600;font-size:15px;margin-top:2px">'+vmcEsc(p[5])+'</div></div>';
    root.querySelector('.vmc-k-pts').textContent=score+' очк.';
    el.ok.disabled=false;el.ok.innerHTML=(R+1<ROUNDS?'Дальше':'Итоги')+' <span class="vmc-k-kc">Enter</span>';el.ok.onclick=next;}
  function next(){if(busy()||phase!=='shown')return;vmcSnd(host,'tap');R++;if(R<ROUNDS)round();else fin();}
  function fin(){if(dead)return;phase='fin';vmcSnd(host,'tap');var t=vmcTier(score);off();
    host.done({score:score,tier:t,rec:score,label:score+' очков из '+(ROUNDS*100),extra:{km:res.map(function(r){return Math.round(r.d);})}});}
  function onKey(k,e){
    if(phase==='aim'){var f=e&&e.shiftKey;
      if(k==='ArrowLeft'){nudge(-1,0,f);return true;}if(k==='ArrowRight'){nudge(1,0,f);return true;}if(k==='ArrowUp'){nudge(0,-1,f);return true;}if(k==='ArrowDown'){nudge(0,1,f);return true;}
      if(k==='Enter'){if(flag)place();else vmcSnd(host,'no');return true;}
      if(k==='z'||k==='Z'||k==='я'||k==='Я'||k==='+'||k==='='){toggleZoom();return true;}return false;}
    if(phase==='shown'){if(k==='Enter'||k===' '){next();return true;}return false;}
    return false;}
  round();
}
/* sim(o,k) для VMG.bot: промах растёт со сложностью места и падает со «знанием» k */
function sim(o,k){k=k==null?.6:k;var S=vmcSet(o),r=S.r,sc=0;S.list.forEach(function(p){var d=[0,220,420,700][p[4]]*(1.5-k)*(.5+r());sc+=pts(d);});return {score:sc,tier:vmcTier(sc)};}

var G={id:ID,run:run,sim:sim};   /* название, ведущий, значок, правило — из VMG_INFO оболочки */
function reg(){if(typeof window.VMG_REG==='function'){window.VMG_REG(G);return true;}return false;}
if(!reg()){var t=0,f=function(){if(!reg()&&++t<40)setTimeout(f,250);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',f);else setTimeout(f,0);}
})();
