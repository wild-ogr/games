'use strict';
/* ================= gb-goods-data — местные товары «Командировки по Союзу» (поток GOODS, ветка gb-goods) =================
   ДОГОВОР (без DOM: грузится и в игре, и в сторожах tools/freeze.sh / check.sh через tools/freeze/files.txt):
   GBG       — массив [{id, n, a, en, dep, rep, rk, also, cold, big, loose, draft}] (GBG.list — он же)
     id    23–120 (биты 0–7 ячейки; старые 1–22 и GOOD_ORDER не трогаем; праздничные FEST — 121–150)
     n     название (ru), a — «мне …» (как GOODS[t].a у старых — для реплик askLine), en — пусто (заполнит поток EN)
     dep   отдел (id ART/META): bakaleya hleb steklo moloko gastro konditer ovoshi soki ryba zakaz
     rep   республика 0–14 (порядок GBU.REPS, ниже; GBG.REP — коды), rk — код; also — номера соседних республик, где товар тоже «местный»
     cold:1 молочка/мясное (помеха «Холодильник» OBST), big:1 — на 2 места («Капуста», два кочана), loose:1 — на развес («Весы»)
     draft:1 — рисунка ещё нет: генератор такой товар НЕ берёт (GBG.ofRep / GBG.ready это учитывают)
   GBG.get(id) → товар | null;   GBG.ofRep(r) → [id…] готовых местных товаров республики (rep или also), по возрастанию id
   GBG.ready(id) → bool;   GBG.ids() → все готовые id;   GBG.REP — коды республик по номеру
   Флаг: в игре LVL берёт новые товары только при GB.flag('goods') (выключен → только старые 22). Сам файл флаг не смотрит.
   Без алкоголя и табака, марки выдуманные/общие названия, без национальных шуток.
*/
var GBG=(function(){
  // порядок = GBU.REPS (поток LVL, a72add3): 0 РСФСР, 1 Украина, 2 Белоруссия, 3 Латвия, 4 Литва, 5 Эстония, 6 Молдавия,
  // 7 Грузия, 8 Армения, 9 Азербайджан, 10 Казахстан, 11 Узбекистан, 12 Киргизия, 13 Таджикистан, 14 Туркмения
  var REP=['ru','ua','by','lv','lt','ee','md','ge','am','az','kz','uz','kg','tj','tm'];
  var L=[
    // РСФСР
    {id:23,n:'Пастила',a:'пастилу',dep:'konditer',rk:'ru'},
    {id:24,n:'Печатный пряник',a:'печатный пряник',dep:'konditer',rk:'ru'},
    {id:25,n:'Квас',a:'квасу',dep:'soki',rk:'ru'},
    {id:26,n:'Вобла',a:'воблу',dep:'ryba',rk:'ru'},
    // Украина
    {id:27,n:'Буженина',a:'буженины',dep:'gastro',rk:'ua',cold:1},
    {id:28,n:'Вареники',a:'вареников',dep:'gastro',rk:'ua',cold:1},
    {id:29,n:'Ряженка',a:'ряженку',dep:'moloko',rk:'ua',cold:1},
    // Белоруссия
    {id:30,n:'Капуста',a:'капусты',dep:'ovoshi',rk:'by',big:1,loose:1},
    {id:31,n:'Берёзовый сок',a:'берёзового соку',dep:'soki',rk:'by'},
    {id:32,n:'Творог',a:'творогу',dep:'moloko',rk:'by',cold:1},
    // Латвия
    {id:33,n:'Копчёная салака',a:'салаки',dep:'ryba',rk:'lv'},
    {id:34,n:'Сыр с тмином',a:'сыру с тмином',dep:'gastro',rk:'lv',also:['lt'],cold:1},
    // Эстония
    {id:35,n:'Кама',a:'каму',dep:'bakaleya',rk:'ee'},
    {id:36,n:'Сырок глазированный',a:'сырок',dep:'moloko',rk:'ee',also:['lv'],cold:1},
    // Литва
    {id:37,n:'Шакотис',a:'шакотис',dep:'konditer',rk:'lt'},
    {id:38,n:'Сметана',a:'сметаны',dep:'moloko',rk:'lt',also:['ee'],cold:1},
    // Грузия
    {id:39,n:'Минеральная вода',a:'минералки',dep:'soki',rk:'ge'},
    {id:40,n:'Сулугуни',a:'сулугуни',dep:'gastro',rk:'ge',cold:1},
    {id:41,n:'Чурчхела',a:'чурчхелу',dep:'konditer',rk:'ge',also:['am']},
    {id:42,n:'Хачапури',a:'хачапури',dep:'hleb',rk:'ge'},
    // Армения
    {id:43,n:'Лаваш',a:'лаваш',dep:'hleb',rk:'am',also:['az']},
    {id:44,n:'Курага',a:'кураги',dep:'ovoshi',rk:'am',also:['tj'],loose:1},
    {id:45,n:'Бастурма',a:'бастурмы',dep:'gastro',rk:'am',cold:1},
    // Азербайджан
    {id:46,n:'Пахлава',a:'пахлавы',dep:'konditer',rk:'az'},
    {id:47,n:'Гранатовый сок',a:'гранатового соку',dep:'soki',rk:'az'},
    {id:48,n:'Фундук',a:'фундука',dep:'ovoshi',rk:'az',loose:1},
    // Узбекистан
    {id:49,n:'Набор для плова',a:'набор для плова',dep:'bakaleya',rk:'uz',also:['tj','tm']},
    {id:50,n:'Лепёшка',a:'лепёшку',dep:'hleb',rk:'uz',also:['tj','tm']},
    {id:51,n:'Изюм',a:'изюму',dep:'ovoshi',rk:'uz',also:['tj'],loose:1},
    // Казахстан
    {id:52,n:'Яблоки «Апорт»',a:'яблок',dep:'ovoshi',rk:'kz',loose:1},
    {id:53,n:'Баурсаки',a:'баурсаков',dep:'hleb',rk:'kz',also:['kg']},
    // Киргизия
    {id:54,n:'Мёд',a:'мёду',dep:'bakaleya',rk:'kg',also:['kz']},
    {id:55,n:'Курт',a:'курта',dep:'moloko',rk:'kg',also:['kz']},
    // Таджикистан
    {id:56,n:'Самса',a:'самсу',dep:'hleb',rk:'tj'},
    {id:57,n:'Нават',a:'навата',dep:'konditer',rk:'tj'},
    // Туркмения
    {id:58,n:'Дыня',a:'дыню',dep:'ovoshi',rk:'tm',loose:1},
    {id:59,n:'Халва',a:'халвы',dep:'konditer',rk:'tm'},
    // Молдавия
    {id:60,n:'Виноград',a:'винограду',dep:'ovoshi',rk:'md',loose:1},
    {id:61,n:'Брынза',a:'брынзы',dep:'gastro',rk:'md',cold:1},
    {id:62,n:'Яблочный сок',a:'яблочного соку',dep:'soki',rk:'md'}
  ];
  var DRAFT=[]; // рисунки догоняют: id из этого списка генератор не берёт (GOODS убирает по мере рисования)
  var BY={};
  for(var i=0;i<L.length;i++){var g=L[i];g.en='';g.rep=REP.indexOf(g.rk);g.also=(g.also||[]).map(function(k){return REP.indexOf(k);});
    if(DRAFT.indexOf(g.id)>=0)g.draft=1;BY[g.id]=g;}
  function ready(id){var g=BY[id];return !!g&&!g.draft;}
  // GBG — сам массив товаров (так его читает GBU.goods), помощники — свойствами массива
  L.v=1;L.REP=REP;L.list=L;
  L.get=function(id){return BY[id]||null;};
  L.ready=ready;
  L.ids=function(){var r=[];for(var i=0;i<L.length;i++)if(!L[i].draft)r.push(L[i].id);return r;};
  L.ofRep=function(r){var o=[];for(var i=0;i<L.length;i++){var g=L[i];if(g.draft)continue;if(g.rep===r||g.also.indexOf(r)>=0)o.push(g.id);}return o;};
  return L;
})();
if(typeof window!=='undefined')window.GBG=GBG;
