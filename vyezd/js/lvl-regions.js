/* vy-lvl: справочник регионов VYREG (буст «Наш двор», 10.10.2026).
   Договор для CAR / YARD / UX (карта) / MG / FEST — только читать, не менять:
   VYREG[k] = {id, name, en, from, to, yards:[номера дворов 1-based], car, hz, mix, dist, boss}
     from/to  — номера дворов (с 1), включительно; индекс двора в коде игры = номер − 1 (G.idx)
     cars     — у старых регионов: машины гаража за дворы региона (по CAR_AT); car — первая из них
     car      — id машины региона в справочнике VYCARS (поток ART, js/art-cars.js); приходит за босса региона (двор to)
     hz       — главная помеха региона: bar шлагбаум с пультом · hatch люки/ремонт · trash мусоровоз · gran бабушки на переходе ·
                polar полярная ночь · big большое поле и фуры · amb скорая · police полиция · night ночной босс (старые)
     mix      — помехи, которые ещё встречаются в регионе (кроме hz)
     dist     — район карьеры 0..5 (VYDIST): по числу пройденных дворов к началу региона (пороги из 04-meta-economy 2.1; CAR может уточнить)
     boss     — номер двора-босса (последний двор региона; «стена» региона)
   VYREG_OLD — старые регионы 1–50 (как в REGIONS index.html: имена и зёрна не меняются). VYREG — 16 новых именных регионов 51–210.
   VYREG.at(idx) — регион по индексу двора (0-based, как G.idx) из обоих списков, null — дальше 210 («Бесконечные дворы»).
   VYREG.all — старые + новые подряд (21 регион). Названия дворов внутри региона — VYREG.yardName(idx). */
(function(){
  var D=[{id:'dvor',name:'Двор',en:'Yard',from:0},{id:'kvartal',name:'Квартал',en:'Block',from:20},{id:'mkr',name:'Микрорайон',en:'Estate',from:60},
         {id:'rayon',name:'Район',en:'District',from:120},{id:'gorod',name:'Город',en:'City',from:200},{id:'oblast',name:'Область',en:'Region',from:300}];
  function dist(from){var k=0;for(var i=0;i<D.length;i++)if(from-1>=D[i].from)k=i;return k;}
  function R(id,name,en,from,car,hz,mix,yn,yen){var r={id:id,name:name,en:en,from:from,to:from+9,yards:[],car:car,hz:hz,mix:mix||[],dist:dist(from),boss:from+9,yn:yn||null,yen:yen||null};
    for(var i=from;i<=from+9;i++)r.yards.push(i);return r;}
  var OLD=[
    R('volga','Центр и Поволжье','Central Russia & the Volga',1,'kopeyka','amb',[]),
    R('ural0','Урал и Сибирь','The Urals & Siberia',11,'volga','police',['amb','night']),
    R('dv','Дальний Восток','The Far East',21,'taxi','night',['amb','police']),
    R('world1','Вокруг света','Around the World',31,'gazel','night',['amb','police']),
    R('world2','Вокруг света','Around the World',41,'skoraya','night',['amb','police'])
  ];
  /* 16 новых регионов. Имена дворов — города/места региона (10 на регион). */
  var NEW=[
    R('zoloto','Золотое кольцо','The Golden Ring',51,'moskvich','bar',['amb'],
      ['Сергиев Посад','Переславль','Ростов Великий','Ярославль','Кострома','Иваново','Суздаль','Юрьев-Польский','Гусь-Хрустальный','Александров'],
      ['Sergiev Posad','Pereslavl','Rostov the Great','Yaroslavl','Kostroma','Ivanovo','Suzdal','Yuryev-Polsky','Gus-Khrustalny','Alexandrov']),
    R('piter','Питер: дворы-колодцы','St Petersburg courtyards',61,'raf','hatch',['bar'],
      ['Васильевский','Петроградка','Лиговский','Коломна','Пески','Охта','Купчино','Гражданка','Кронштадт','Невский'],
      ['Vasilyevsky','Petrogradka','Ligovsky','Kolomna','Peski','Okhta','Kupchino','Grazhdanka','Kronstadt','Nevsky']),
    R('chernozem','Черноземье','The Black Earth',71,'musorovoz','trash',['hatch'],
      ['Тула','Орёл','Курск','Белгород','Липецк','Воронеж','Тамбов','Рязань','Брянск','Старый Оскол'],
      ['Tula','Oryol','Kursk','Belgorod','Lipetsk','Voronezh','Tambov','Ryazan','Bryansk','Stary Oskol']),
    R('moskva','Москва: спальные районы','Moscow suburbs',81,'liaz','gran',['bar','trash'],
      ['Бирюлёво','Чертаново','Митино','Марьино','Выхино','Тёплый Стан','Свиблово','Медведково','Строгино','Измайлово'],
      ['Biryulyovo','Chertanovo','Mitino','Maryino','Vykhino','Tyoply Stan','Sviblovo','Medvedkovo','Strogino','Izmaylovo']),
    R('arktika','Арктика: полярная ночь','The Arctic: polar night',91,'trekol','polar',['hatch'],
      ['Мурманск','Североморск','Апатиты','Кировск','Воркута','Салехард','Нарьян-Мар','Норильск','Дудинка','Тикси'],
      ['Murmansk','Severomorsk','Apatity','Kirovsk','Vorkuta','Salekhard','Naryan-Mar','Norilsk','Dudinka','Tiksi']),
    R('karelia','Карелия и Север','Karelia & the North',101,'tabletka','hatch',['polar','trash'],
      ['Петрозаводск','Кондопога','Кижи','Сортавала','Медвежьегорск','Беломорск','Кемь','Вологда','Архангельск','Соловки'],
      ['Petrozavodsk','Kondopoga','Kizhi','Sortavala','Medvezhyegorsk','Belomorsk','Kem','Vologda','Arkhangelsk','Solovki']),
    R('yug','Курорты юга','Southern resorts',111,'pobeda','gran',['bar','hatch'],
      ['Анапа','Геленджик','Туапсе','Сочи','Адлер','Ейск','Таганрог','Кисловодск','Пятигорск','Ессентуки'],
      ['Anapa','Gelendzhik','Tuapse','Sochi','Adler','Yeysk','Taganrog','Kislovodsk','Pyatigorsk','Yessentuki']),
    R('baikal','Байкал','Lake Baikal',121,'gaz66','trash',['polar','gran'],
      ['Листвянка','Слюдянка','Байкальск','Ольхон','Хужир','Усть-Баргузин','Северобайкальск','Ангарск','Шелехов','Култук'],
      ['Listvyanka','Slyudyanka','Baikalsk','Olkhon','Khuzhir','Ust-Barguzin','Severobaikalsk','Angarsk','Shelekhov','Kultuk']),
    R('zavod','Урал заводской','The industrial Urals',131,'kamaz','big',['bar','trash'],
      ['Магнитогорск','Нижний Тагил','Златоуст','Миасс','Каменск','Первоуральск','Серов','Пермь','Ижевск','Уфа'],
      ['Magnitogorsk','Nizhny Tagil','Zlatoust','Miass','Kamensk','Pervouralsk','Serov','Perm','Izhevsk','Ufa']),
    R('dacha','Дачные посёлки','Dacha villages',141,'belarus','gran',['hatch','trash'],
      ['СНТ «Ромашка»','Малаховка','Кратово','Комарово','Репино','Валентиновка','Перхушково','Кокошкино','Солнечное','Снегири'],
      ['Romashka plots','Malakhovka','Kratovo','Komarovo','Repino','Valentinovka','Perkhushkovo','Kokoshkino','Solnechnoye','Snegiri']),
    R('volga2','Волга-матушка','Mother Volga',151,'samosval','bar',['gran','polar'],
      ['Углич','Мышкин','Плёс','Чебоксары','Ульяновск','Сызрань','Тольятти','Саратов','Волгоград','Астрахань'],
      ['Uglich','Myshkin','Plyos','Cheboksary','Ulyanovsk','Syzran','Tolyatti','Saratov','Volgograd','Astrakhan']),
    R('altai','Алтай и Саяны','Altai & Sayan',161,'oka','hatch',['bar','polar'],
      ['Бийск','Белокуриха','Горно-Алтайск','Чемал','Абакан','Минусинск','Кызыл','Шушенское','Саяногорск','Акташ'],
      ['Biysk','Belokurikha','Gorno-Altaysk','Chemal','Abakan','Minusinsk','Kyzyl','Shushenskoye','Sayanogorsk','Aktash']),
    R('europe','Вокруг света: Европа','Around the World: Europe',171,'trolley','gran',['bar','hatch'],
      ['Прага','Будапешт','Варшава','Вена','Белград','София','Хельсинки','Стокгольм','Мадрид','Амстердам'],
      ['Prague','Budapest','Warsaw','Vienna','Belgrade','Sofia','Helsinki','Stockholm','Madrid','Amsterdam']),
    R('asia','Вокруг света: Азия','Around the World: Asia',181,'kabluk','trash',['gran','polar'],
      ['Ханой','Шанхай','Гонконг','Сингапур','Куала-Лумпур','Манила','Джакарта','Мумбаи','Катманду','Улан-Батор'],
      ['Hanoi','Shanghai','Hong Kong','Singapore','Kuala Lumpur','Manila','Jakarta','Mumbai','Kathmandu','Ulaanbaatar']),
    R('trassib','Транссиб: дальний рейс','Trans-Siberian run',191,'kran','big',['polar','bar','trash'],
      ['Ярославский вокзал','Киров','Пермь-2','Тюмень-Сортировка','Барабинск','Тайга','Ачинск','Тайшет','Слюдянка-1','Хабаровск-1'],
      ['Yaroslavsky station','Kirov','Perm-2','Tyumen yard','Barabinsk','Taiga','Achinsk','Taishet','Slyudyanka-1','Khabarovsk-1']),
    R('future','Город будущего','City of the future',201,'chaika','polar',['bar','hatch','trash','gran'],
      ['Неоновый квартал','Монорельс','Технопарк','Купол','Висячие сады','Космопорт','Рободвор','Аэротакси','Башня','Будущее'],
      ['Neon block','Monorail','Tech park','The dome','Hanging gardens','Spaceport','Robo-yard','Air-taxi','The tower','The future'])
  ];
  /* машины гаража старых регионов (CAR_AT 3,6,9,15,21,27,36,45,54,72 — MODELS 0..9 index.html) */
  var GAR=[['kopeyka','devyatka','niva'],['volga'],['taxi','buhanka'],['gazel'],['skoraya']];
  for(var g=0;g<OLD.length;g++)OLD[g].cars=GAR[g];
  var ALL=OLD.concat(NEW);
  NEW.at=function(idx){var n=idx+1;for(var i=0;i<ALL.length;i++)if(n>=ALL[i].from&&n<=ALL[i].to)return ALL[i];return null;};
  NEW.yardName=function(idx,en){var r=NEW.at(idx);if(!r||!r.yn)return null;var k=idx+1-r.from;return en?r.yen[k]:r.yn[k];};
  NEW.all=ALL;NEW.old=OLD;NEW.dist=D;NEW.last=NEW[NEW.length-1].to; /* 210 — конец именного пути */
  /* фон строк карты для новых регионов (.reg5…reg21 — те же 5 красок по кругу), без своего css-файла */
  try{var css='',G5=['rgba(214,244,190,.75),rgba(170,224,140,.7)','rgba(200,238,228,.78),rgba(150,214,196,.7)','rgba(200,232,250,.8),rgba(150,206,240,.7)','rgba(255,238,196,.82),rgba(255,214,150,.72)','rgba(226,216,250,.8),rgba(190,176,240,.7)'];
    for(var q=5;q<=21;q++)css+='.reg'+q+'{background:linear-gradient('+G5[q%5]+')}';
    var st=document.createElement('style');st.id='lvlreg';st.textContent=css;document.head.appendChild(st);}catch(e){}
  window.VYREG=NEW;window.VYREG_OLD=OLD;window.VYDIST=D;
})();
