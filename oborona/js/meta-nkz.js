'use strict';
/* ================= ob2-NAKAZ — «Поток наказов» + «недели по кругу» (буст_в2.0, 12.10.2026; журнал hobby-analytics/release-i/oborona-boost2/logs/NAKAZ.md) =================
   План — release-i/oborona-boost2/03-events.md §3.2, 3.5. Грузится ПО ТРЕБОВАНИЮ (OB2.need из заглушки <!-- ob2:NAKAZ --> в index.html). Без ?. ?? .at().
   Флаги: 'nakaz' — доска наказов вместо «Заданий дня» (выключен → карточка заданий как в v3.1); 'weeks' — недели по кругу, Богатырские выходные, Сказы по календарю.
   Поле S.o2n (≤1,5 КБ): {v,n — наказов всего, s:[3 места {t,g,p,b,x,k,c,w,f}], d,dn,dg,sw — день/наказов/золота/замен за день, h — недавние шаблоны,
     c:{h,k,j,f} — связка (герой, шаг 0..4, связок всего, праздничная), hc:[связок у каждого героя], wk:[неделя,наказов недели,значок], wb:{вид:значков}, gul — неделя закрытого «Гуляния», gk — его шаг (место ① по выходным), fd — праздничные связки, tu — новичок, mg — перенос заданий}
   Места: ① короткий, ② средний (раз в неделю — тема недели), ③ связка героя (5 шагов; 5-й — финал). Сделал → «Забрать» → сразу новый. Таймеров нет.
   Награды: ед. U = нынешнее задание дня; ① 0,6U ② 1,2U ③ 1U, финал 2U, сундук связки 3U + трофеи + 5 мин ⏩ + оберег (10 героев × 4 = 40). Потолок золота в день 3,1U, сверх — Слава и трофей.
   Сундук дня (meta-ret dlyChestOpen, серия как была) — за любые 3 наказа за день. Замена — 1 в день бесплатно, дальше за ролик.
   Шина OB2: шлём 'nakaz' {id,h} и 'svz' {h,n} (VKT), 'nkz:done'; слушаем 'mg','rec','igr','deco' (IZBA/LAVKA), 'nkz' (key,n) — любой поток может добавить прогресс;
     праздник: OB2.emit('nkz:fest') → {id,n,en,who:{n,en,ic},t:[5 id шаблонов]} — следующая связка праздничная; закрыта → OB2.emit('nkz:festDone',id) (MOROZ).
   STAT: событие nkz {a:new|done|swap|claim|chain|cap|chest, t,s,n,c,ms,f}; золото — earn 'nkz'; неделя — wkev {a:badge|nk, k}. */
var NKZ=(function(){
var ONN=!OB2.off('nakaz'),ONW=!OB2.off('weeks');
function err(w,x){err.n=(err.n||0)+1;if(err.n<=5)console.warn('nkz '+w+': '+(x&&x.message||x));}
function ev(a,p){try{var o={a:a};for(var k in p)o[k]=p[k];STAT.ev('nkz',o);}catch(e){}}
function O(){return ONN&&S&&S.o2n&&S.o2n.v?S.o2n:null;}
function rng(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function dnum(){return +dayKey().replace(/-/g,'');}
function inG(){return typeof G!=='undefined'&&!!G;}

/* ---------- проверки «что игроку уже открыто» ---------- */
function cd(){return typeof chaptersDone==='function'?chaptersDone():0;}
function ch1(){return !!(S.stars&&S.stars['0-5']);}
function twOpen(t){var u=TW_UNLOCK[t];return !!u&&(u[0]===0&&u[1]===0||!!S.stars[u[0]+'-'+u[1]]);}
function spOpen(k){var u=SPELL_UNLOCK[k];return !!u&&!!S.stars[u[0]+'-'+u[1]];}
function izbaH(){try{return typeof mgIzbaOpen==='function'&&!!mgIzbaOpen();}catch(e){return false;}}
function mgOk(n){try{return typeof mgOpenN==='function'&&!!mgOpenN(n);}catch(e){return false;}}
function mgAny(){try{var z=typeof DZ==='function'?DZ():null;if(!z||!z.b)return false;for(var k in z.b)if(z.b[k]>0)return true;}catch(e){}return false;}
function hellOpen(){for(var k in S.dst||{})if(/^s\d+-5$/.test(k)&&S.dst[k])return true;return false;}
function trfOk(){try{return typeof TR==='function'&&!!TR()&&(typeof trfVis!=='function'||trfVis());}catch(e){return false;}}
function slOk(){return typeof SL==='function'&&!!SL();}
function tourOk(){try{return typeof tourCanJoin==='function'&&!!tourCanJoin();}catch(e){return false;}}
function dchFree(){try{if(!ch1()||typeof dchToday!=='function')return false;var d=dchToday();return !!d&&!d.tried&&!d.res;}catch(e){return false;}}
function dlyGot(){try{return typeof dlyMine==='function'&&!!dlyMine().got;}catch(e){return true;}}
// Книга: есть нечисть, которой до следующей звезды Книги осталось ≤40 % пути; звёзды: есть уровень не на 3★ или непройденная земля
function bookNear(){try{if((S.wins|0)<5)return false;for(var k in S.bk||{}){var E=EN[k];if(!E)continue;var t=E.boss||k==='egg'?[1,5,20]:[10,100,1000],n=S.bk[k]|0;for(var i=0;i<3;i++)if(n<t[i]){if(n>=t[i]*.6)return true;break;}}}catch(e){}return false;}
function nstCan(){for(var k in S.stars)if((S.stars[k]|0)<3)return true;return cd()<CH.length;}
// «Соседи»: наказ про место — только если цель близка (иначе он висел бы неделями)
function tourNear(){try{var t=tourNow();return !!t&&tourPlace(t.tb)<=5&&tourPlace(t.tb)>3;}catch(e){return false;}}
function ratbNear(){try{var t=tourNow();if(!t)return false;var me=tourPts(t.o),r=0;t.tb.forEach(function(x){if(x.i===0)r=x.pts;});return me<=r&&me>=r*.7;}catch(e){return false;}}
function wkbPct(){try{var b=wkMine().best|0;return b>=10000?100:Math.floor(b/100);}catch(e){return 100;}}
function wkbCan(){return ch1()&&wkbPct()<90;}
function flagOn(p){try{var f=OB2.flags();for(var i=0;i<f.length;i++)if(f[i].id.indexOf(p)===0&&!f[i].off&&f[i].s!=='?')return true;}catch(e){}return false;}
// метрики состояния (наказ «сделай N» = прирост метрики с момента выдачи)
var MET={
  ord:function(){return S.trf&&S.trf.on|0;},
  frg:function(){var f=S.forge||{},n=0;for(var k in f){var v=f[k];if(typeof v==='number')n+=v;else if(v&&typeof v==='object')n+=Object.keys(v).length;}return n;},
  vil:function(){var v=S.village||{},n=0;for(var k in v)if(typeof v[k]==='number')n+=v[k];return n;},
  sl:function(){return S.sl&&S.sl.x|0;},
  book:function(){var n=0;try{for(var k in S.bk||{})if(EN[k])n+=bookStars(k);}catch(e){}return n;},
  nst:function(){if(typeof slStars==='function')return slStars();var n=0;for(var k in S.stars)n+=+S.stars[k]||0;return n;}};
// состояния (выполнено, если сейчас так)
function tourNow(){var o=typeof tourTick==='function'?tourTick():null;if(!o)return null;return {o:o,tb:tourTable(o,nowMs())};}
var STQ={
  top3:function(){var t=tourNow();return !!t&&tourPlace(t.tb)<=3&&tourPts(t.o)>0;},
  ratb:function(){var t=tourNow();if(!t)return false;var me=tourPts(t.o),r=0;t.tb.forEach(function(x){if(x.i===0)r=x.pts;});return me>r;},
  wkb:function(s){return wkbPct()>=s.g;}};

/* ---------- 10 героев (лица — общие рисунки: изба, кот, соседи из meta-tour, Колдун-застава, воевода) ---------- */
var HER=[
 {n:'Тётушка Яга',en:'Auntie Yaga',ic:'ti_izba_3',st:'Новое зелье',se:'A New Potion',
  t:['k13','k12','m4','m28:14','m7'],
  l:[['Нечисть опрокинула мой котёл! Пусть Изба потопчет обидчиков.','Monsters knocked over my cauldron! Let the Hut stomp them.'],
     ['Для зелья нужны перья летучих. Сбей, воевода, только не все в суп.','The potion needs feathers of flyers. Knock some down — not all into the soup.'],
     ['В Логове растёт разрыв-трава. Сходи, а я воду вскипячу.','Gap-grass grows in the Lair. Go fetch it, I’ll boil the water.'],
     ['Котёл мешать — тоже наука. Поучись в избе, в «Котле».','Stirring a cauldron is a skill. Practise in the Hut, in “Cauldron”.'],
     ['Зелье готово! Отпразднуем — три звезды, и пир горой.','The potion is ready! Let’s celebrate — three stars and a feast.']]},
 {n:'Кот Баюн',en:'Bayun the Cat',ic:'kot',st:'Сказки на ночь',se:'Bedtime Stories',
  t:['k8','m28:10','k15','m11','m5'],
  l:[['Мур. Спою нечисти колыбельную — только позови.','Purr. I’ll sing the monsters a lullaby — just call me.'],
     ['Загадку загадаю, а ты отгадай. Не отгадаешь — съем. Шучу. Наверное.','I’ll ask a riddle, you answer. Wrong — I eat you. Joking. Probably.'],
     ['Ночь длинная. Посторожи заставу дня, а я вздремну.','The night is long. Guard the outpost of the day while I nap.'],
     ['Тсс! Не разбуди меня чарами. Побеждай тихо.','Shh! Don’t wake me with spells. Win quietly.'],
     ['Последняя сказка — про Испытание дня. Слушай и побеждай.','The last tale is about the Daily challenge. Listen and win.']]},
 {n:'Микула-кузнец',en:'Mikula the Smith',ic:'tour_nb4',st:'Молот',se:'The Hammer',
  t:['m9','k6','m18','m28:1','m3'],
  l:[['Кую новый молот! Загляни в кузницу — купи ступень.','Forging a new hammer! Visit the forge — buy an upgrade.'],
     ['Молот без дела ржавеет. Улучши заставы.','An idle hammer rusts. Upgrade your outposts.'],
     ['Проверим на броне: пусть Пушкари постучат.','Let’s test it on armour: let the Cannons knock.'],
     ['Руда под землёй. Сыграй в «Подкоп».','The ore is underground. Play “Undermine”.'],
     ['Молот готов! Обновим его на ⚔ Сложном.','The hammer is ready! Let’s christen it on ⚔ Hard.']]},
 {n:'Воевода Ратибор',en:'Commander Ratibor',ic:'tour_nb0',st:'Обгони меня',se:'Catch Me If You Can',
  t:['k14','k1','m6','m25','m33'],
  l:[['С понедельника — в дозор! Наберёшь Славы больше моего?','On patrol from Monday! Can you earn more Fame than me?'],
     ['Разминка: один бой. Без разминки и ложку не поднять.','Warm-up: one battle. Without it you can’t even lift a spoon.'],
     ['Босс недели меня в прошлый раз поцарапал. Отомсти.','The Boss of the Week scratched me last time. Avenge me.'],
     ['Соседи шепчутся: тройка лучших — не про тебя. Докажи.','The neighbours whisper you’re not top-3 material. Prove them wrong.'],
     ['Ну, обгони меня в таблице. Если сможешь.','Well, overtake me in the table. If you can.']]},
 {n:'Боярыня Марфа',en:'Boyarynya Marfa',ic:'tour_nb1',st:'Ярмарка',se:'The Fair',
  t:['m8','m23','m10','k14','m8'],
  l:[['Ярмарка на носу! Жители ждут заказов.','The fair is coming! The villagers are waiting for orders.'],
     ['Коробейник привёз диковинки. Купи хоть одну.','The peddler brought curiosities. Buy at least one.'],
     ['Деревню к ярмарке надо приукрасить. Построй что-нибудь.','The village must look its best. Build something.'],
     ['На ярмарке все судачат о Славе. Добудь её.','At the fair everyone gossips about Fame. Earn some.'],
     ['Последние заказы — и пряники за мой счёт!','The last orders — and gingerbread is on me!']]},
 {n:'Дед Пахом',en:'Grandpa Pakhom',ic:'tour_nb2',st:'Лесная засека',se:'The Forest Abatis',
  t:['k5','m24','m12','k2','m29'],
  l:[['Понемногу, но каждый день. Построй заставы.','A little, but every day. Build outposts.'],
     ['Дуб-великан — мой старый друг. Поставь его в бой.','The Giant Oak is my old friend. Bring him to battle.'],
     ['Стрельцы шумят и пугают зайцев. Обойдись без них.','Archers are noisy and scare the hares. Do without them.'],
     ['Засека — чтобы ни одна нечисть не прошла.','An abatis means not a single monster gets through.'],
     ['А теперь — в самое пекло. 🔥 Адский, не трусь.','Now — into the fire. 🔥 Hell mode, don’t be scared.']]},
 {n:'Атаманша Василиса',en:'Atamansha Vasilisa',ic:'tour_nb3',st:'Лихой набег',se:'A Daring Raid',
  t:['k16','m28:13','k11','k10','m4'],
  l:[['Лихо — значит быстро. Победи с ускорением ⏩.','Daring means fast. Win with speed-up ⏩.'],
     ['Потренируйся в «Набеге» — пригодится.','Practise in “Raid” — it will come in handy.'],
     ['Вожаки нечисти — моя добыча. Но так и быть, твоя.','Monster leaders are my prey. All right — yours this time.'],
     ['Не жди волну — зови её сама! То есть сам.','Don’t wait for the wave — call it! Early!'],
     ['А теперь прямо в Логово. Лихо!','And now straight into the Lair. Daring!']]},
 {n:'Колдун-отшельник',en:'The Hermit Sorcerer',ic:'ti_mag_3',st:'Книга нечисти',se:'The Book of Monsters',
  t:['m21','m32','m22','m15','m21'],
  l:[['В Книге нечисти пустые страницы. Заполни.','The Book of Monsters has blank pages. Fill them.'],
     ['Летучие воруют мои чернила. Проучи их.','Flyers steal my ink. Teach them a lesson.'],
     ['Звёзды — лучшие чернила. Добудь новые.','Stars are the best ink. Earn new ones.'],
     ['Для главы о нечисти нужна… нечисть. Много.','A chapter about monsters needs… monsters. Lots.'],
     ['Последняя страница! Ещё одна звезда в Книге.','The last page! One more star in the Book.']]},
 {n:'Звонарь Ерёма',en:'Yeryoma the Bell-ringer',ic:'tour_nb5',st:'Набат',se:'The Alarm Bell',
  t:['m28:9','k10','m19','m2','m14'],
  l:[['Бом! Сыграй в «Набат», разомнём руки.','Dong! Play “Alarm Bell” to warm up.'],
     ['Бом-бом! Зови волны раньше — я позвоню.','Dong-dong! Call waves early — I’ll ring.'],
     ['Осада! Держись, пока звонит колокол.','Siege! Hold on while the bell rings.'],
     ['Ещё осада — колокол только разогрелся.','Another siege — the bell is just warming up.'],
     ['Побей свой рекорд — я прозвоню на всю Русь!','Beat your record — I’ll ring it across the land!']]},
 {n:'Воевода Потап',en:'Commander Potap',ic:'voevoda',st:'Дозор по всей Руси',se:'Patrol Across the Land',
  t:['m1','m17','m16','m7','m22'],
  l:[['Дозор начинается с побед. Нужно несколько.','A patrol starts with victories. Several.'],
     ['Обойди земли — погляди, где что.','Go round the lands — see what’s where.'],
     ['Боссы глав снова шалят. Наведи порядок.','Chapter bosses are acting up again. Restore order.'],
     ['Три звезды — знак, что застава в порядке.','Three stars mean the outpost is in order.'],
     ['Новые звёзды — новые земли. Вперёд!','New stars — new lands. Forward!']]}];
var GUL={n:'Богатырские выходные',en:'Heroic weekend',ic:'tour_nb1',st:'Гуляние',se:'Festivities',
  l:[['Гуляем! Начнём с малого.','Let’s celebrate! Start small.'],['Хоровод не ждёт — ещё один наказ.','The round dance won’t wait — one more.'],['Пироги в печи, а ты — в дозоре.','Pies in the oven, and you on patrol.'],['Скоморохи уже пляшут!','The jesters are already dancing!'],['Последний — и на пир!','The last one — then the feast!']]};

/* ---------- 50 шаблонов (+4 недельных). [id, место 1|2, событие, режим e-сумма|x-лучший бой|m-метрика|s-состояние, база, потолок, нужно(), рус, англ] ---------- */
var TL=[
 ['k1',1,'win','e',1,1,null,'Выиграй любой бой','Win any battle'],
 ['k2',1,'nolk','e',1,1,null,'Пройди уровень — к воротам ни одной нечисти','Clear a level without a single monster reaching the gate'],
 ['k3',1,'st3','e',1,1,null,'Пройди уровень на три звезды','Clear a level with three stars'],
 ['k4',1,'kill','e',80,150,null,'Одолей {n} нечисти','Defeat {n} monsters'],
 ['k5',1,'bld','e',6,10,null,'Построй {n} застав','Build {n} outposts'],
 ['k6',1,'ups','e',5,10,null,'Улучши заставы {n} раз','Upgrade outposts {n} times'],
 ['k7',1,'thu','e',2,3,function(){return spOpen('thunder');},'Ударь «Громом Перуна» {n} раза','Cast Perun’s Thunder {n} times'],
 ['k8',1,'cat','e',1,2,function(){return spOpen('cat');},'Усыпи нечисть чарами «Кот Баюн» {n} раза','Put monsters to sleep with Bayun the Cat {n} times'],
 ['k9',1,'mg','e',1,2,izbaH,'Сыграй в Дозорной избе','Play a game in the Watch Hut'],
 ['k10',1,'early','e',2,3,null,'Позови волну раньше 🔔 {n} раза','Call a wave early 🔔 {n} times'],
 ['k11',1,'lead','e',1,2,function(){return cd()>=1;},'Одолей вожаков: {n}','Defeat leaders: {n}'],
 ['k12',1,'fly','e',5,12,function(){return cd()>=1;},'Одолей {n} летучих','Defeat {n} flying monsters'],
 ['k13',1,'izk','x',15,35,function(){return twOpen('izba');},'Изба тётушки Яги: {n} нечисти за один бой','Auntie Yaga’s Hut: {n} monsters in one battle'],
 ['k14',1,'sl','m',30,60,slOk,'Набери {n} Славы','Earn {n} Fame'],
 ['k15',1,'dlyw','e',4,6,ch1,'Отбей {n} волн на «Заставе дня»','Hold {n} waves at the Outpost of the Day'],
 ['k16',1,'spd','e',1,1,function(){return (S.boost|0)>=60;},'Выиграй бой с ускорением ⏩','Win a battle with speed-up ⏩'],
 ['k17',1,'spl','e',3,5,function(){return spOpen('thunder');},'Примени чары {n} раза','Cast spells {n} times'],
 ['m1',2,'win','e',3,4,null,'Выиграй {n} боя','Win {n} battles'],
 ['m2',2,'sgw','e',10,20,ch1,'Отбей {n} волн осады','Hold {n} siege waves'],
 ['m3',2,'winx','e',1,2,function(){return cd()>=1;},'Победи на ⚔ Сложном','Win on ⚔ Hard'],
 ['m4',2,'lair','e',1,1,function(){return cd()>=1;},'Пройди Логово','Clear a Lair'],
 ['m5',2,'dchw','e',1,1,dchFree,'Пройди «Испытание дня»','Beat the Daily challenge'],
 ['m6',2,'wkr','e',1,2,ch1,'Сразись с Боссом недели','Fight the Boss of the Week'],
 ['m7',2,'st3','e',2,3,null,'Пройди {n} уровня на три звезды','Clear {n} levels with three stars'],
 ['m8',2,'ord','m',2,2,trfOk,'Сдай {n} заказа жителям','Deliver {n} villager orders'],
 ['m9',2,'frg','m',1,2,function(){return typeof starsFree==='function'&&starsFree()>=1;},'Купи ступень в кузнице','Buy a forge upgrade'],
 ['m10',2,'vil','m',1,2,function(){return (S.wins|0)>=1;},'Построй или улучши дом в деревне','Build or upgrade a village house'],
 ['m11',2,'nosp','e',1,1,function(){return spOpen('thunder');},'Победи, не применяя чар','Win without casting spells'],
 ['m12',2,'noarch','e',1,1,function(){return twOpen('pushka')&&twOpen('izba');},'Победи без Стрельцов','Win without Archers'],
 ['m13',2,'mg','e',2,3,izbaH,'Сыграй {n} партии в Дозорной избе','Play {n} games in the Watch Hut'],
 ['m14',2,'mgr','e',1,1,mgAny,'Побей свой рекорд в мини-игре','Beat your record in a mini-game'],
 ['m15',2,'kill','e',300,500,null,'Одолей {n} нечисти','Defeat {n} monsters'],
 ['m16',2,'bossw','e',1,1,ch1,'Одолей босса главы','Defeat a chapter boss'],
 ['m17',2,'land','e',2,3,function(){return cd()>=2;},'Победи в {n} разных землях','Win in {n} different lands'],
 ['m18',2,'parm','e',5,12,function(){return twOpen('pushka')&&cd()>=1;},'Пушкари: одолей {n} нечисти в броне','Cannons: defeat {n} armoured monsters'],
 ['m19',2,'sg1','x',10,18,ch1,'Отбей {n} волн осады за один забег','Hold {n} siege waves in one run'],
 ['m20',2,'dlyok','e',1,1,function(){return ch1()&&!dlyGot();},'Отбей 8 волн на «Заставе дня»','Hold 8 waves at the Outpost of the Day'],
 ['m21',2,'book','m',1,1,bookNear,'Добудь новую звезду в Книге нечисти','Earn a new star in the Book of Monsters'],
 ['m22',2,'nst','m',1,2,nstCan,'Добудь новых звёзд: {n}','Earn new stars: {n}'],
 ['m23',2,'pd','e',1,2,trfOk,'Купи товар у коробейника','Buy goods from the peddler'],
 ['m24',2,'dub','e',1,1,function(){return twOpen('dub');},'Победи с Дубом-великаном','Win with the Giant Oak'],
 ['m25',2,'sl','m',100,200,slOk,'Набери {n} Славы','Earn {n} Fame'],
 ['m26',2,'top3','s',1,1,tourNear,'Войди в тройку «Соседних застав»','Get into the top 3 of Neighbouring Outposts'],
 ['m27',2,'wkb','s',30,100,wkbCan,'Сними Боссу недели {n}% здоровья','Knock {n}% of health off the Boss of the Week'],
 ['m28',2,'mgN','e',1,2,izbaH,'Сыграй в «{g}»','Play “{g}”'],
 ['m29',2,'winh','e',1,1,hellOpen,'Победи на 🔥 Адском','Win on 🔥 Hell'],
 ['m30',2,'lov','e',1,2,function(){return flagOn('lov-');},'Сыграй в ловкостную игру','Play a skill game'],
 ['m31',2,'igr','e',1,1,function(){return flagOn('udal');},'Сыграй в «Богатырских игрищах»','Play in the Heroic Games'],
 ['m32',2,'magfly','e',4,10,function(){return twOpen('mag')&&cd()>=1;},'Колдун: одолей {n} летучих','Sorcerer: defeat {n} flyers'],
 ['m33',2,'ratb','s',1,1,ratbNear,'Обгони Ратибора в «Соседних заставах»','Overtake Ratibor in Neighbouring Outposts'],
 // темы недель (место ②, раз в неделю до 5 наказов → значок)
 ['w1',2,'ord','m',2,3,trfOk,'Ярмарка: сдай {n} заказа жителям','Fair: deliver {n} villager orders'],
 ['w2',2,'lair','e',2,2,function(){return cd()>=1;},'Набег: пройди Логова: {n}','Raid: clear Lairs: {n}'],
 ['w3',2,'mgw','e',1,1,izbaH,'Дозор: побей свой рекорд в «{g}»','Watch: beat your record in “{g}”'],
 ['w4',2,'winx','e',1,2,function(){return cd()>=1;},'Богатырская: победи на ⚔ Сложном','Heroic: win on ⚔ Hard']];
var TP={};TL.forEach(function(a){TP[a[0]]={id:a[0],k:a[1],e:a[2],m:a[3],b:a[4],cap:a[5],need:a[6],ru:a[7],en:a[8]};});
var T_SH=TL.filter(function(a){return a[1]===1;}).map(function(a){return a[0];}),
    T_MD=TL.filter(function(a){return a[1]===2&&a[0][0]==='m';}).map(function(a){return a[0];});
// первые 10 наказов новичка — учат частям игры (места ① и ②)
var TUT=['k5','m10','m9','k6','k17','m28:1','k3','k8','m4','m3'];

/* ---------- недели по кругу (флаг weeks) ---------- */
var WK=[{id:'fair',n:'Ярмарочная неделя',en:'Fair week',b:'Ярмарочный пряник',be:'Fair gingerbread',t:'w1',
          d:['заказы жителей — Слава ×1,5','villager orders — Fame ×1.5']},
        {id:'raid',n:'Неделя набега нечисти',en:'Monster raid week',b:'Клык набега',be:'Raid fang',t:'w2',d:['Логова — трофеи ×1,5','Lairs — trophies ×1.5']},
        {id:'watch',n:'Дозорная неделя',en:'Watch week',b:'Дозорный рог',be:'Watch horn',t:'w3',d:['мини-игра недели — рекорд → значок','game of the week — beat your record']},
        {id:'bog',n:'Богатырская неделя',en:'Heroic week',b:'Богатырский щит',be:'Heroic shield',t:'w4',d:['⚔ Слава ×1,5, 🔥 ×1,8','⚔ Fame ×1.5, 🔥 ×1.8']}];
var WK0=2966;   // неделя 02.11.2026 (weekNo) — Ярмарочная
function wkFest(w){var r=OB2.emit('wk:fest',w);if(r===true)return true;if(r===false)return false;
  var mon=new Date((w*7-3)*864e5),m=mon.getUTCMonth(),d=mon.getUTCDate();
  if(w===2965)return true;   // Ночь нечисти 26.10–01.11.2026
  return (m===11&&d>=9)||(m===0&&d<=3);}   // Морозко: недели с понедельником 09.12–03.01 (у MOROZ — свой праздник)
function wkIdx(w){if(wkFest(w))return -1;var n=0,a=Math.min(w,WK0),b=Math.max(w,WK0);for(var x=a;x<b;x++)if(!wkFest(x))n++;return w>=WK0?n%4:(4-n%4)%4;}
function wkNow(){if(!ONW)return null;var i=wkIdx(weekNo());return i<0?null:WK[i];}
function wkend(){if(!ONW)return false;var r=OB2.emit('wk:wkend');if(r===true)return true;if(window.MZ&&MZ.kan&&MZ.kan())return true;/* ob2-MERGE: каникулы Морозко 25.12–10.01 — выходные (просьба MOROZ) */var d=new Date(nowMs()).getDay();return d===0||d===6;}
function wkGame(){var a=[1,3,5,6,8,9,10,11,12,13,14,2,7,4],w=weekNo(),ok=a.filter(mgOk);return ok.length?ok[w%ok.length]:0;}

/* ---------- награды ---------- */
function U(){return Math.round((30+15*Math.min(8,cd()))/5)*5;}
function capG(){return Math.round(3.1*U()/5)*5;}
function r5(x){return Math.max(5,Math.round(x/5)*5);}
function goldFor(s){return r5(U()*(s.k===1?0.6:s.k===2?1.2:s.c===4?2:1));}
function slFor(s){return s.k===1?10:s.k===2?20:s.c===4?40:15;}

/* ---------- поле S.o2n ---------- */
function slotOk(s){return s&&typeof s==='object'&&typeof s.t==='string'&&(TP[s.t.split(':')[0]]||s.t==='nkzX');}
function fix(o){if(!o.v)o.v=1;var n=function(v){return typeof v==='number'&&isFinite(v)?v:0;};
  o.n=Math.max(0,n(o.n)|0);if(!Array.isArray(o.s))o.s=[];o.s=o.s.slice(0,3).map(function(s){return slotOk(s)?s:null;});
  for(var i=0;i<3;i++){var s=o.s[i];if(!s)continue;s.g=Math.max(1,n(s.g)|0);s.p=Math.max(0,Math.min(s.g,n(s.p)));s.b=n(s.b);s.x=n(s.x)|0;s.k=i+1;}
  if(typeof o.d!=='string')o.d='';o.dn=n(o.dn)|0;o.dg=n(o.dg)|0;o.sw=n(o.sw)|0;if(typeof o.h!=='string')o.h='';
  if(!o.c||typeof o.c!=='object')o.c={h:0,k:0,j:0,f:''};o.c.h=Math.max(0,Math.min(9,n(o.c.h)|0));o.c.k=Math.max(0,Math.min(4,n(o.c.k)|0));o.c.j=n(o.c.j)|0;if(typeof o.c.f!=='string')o.c.f='';
  if(!Array.isArray(o.hc))o.hc=[];for(var j=0;j<10;j++)o.hc[j]=Math.max(0,n(o.hc[j])|0);o.hc.length=10;
  if(!Array.isArray(o.wk))o.wk=[0,0,0];o.wk=[n(o.wk[0])|0,n(o.wk[1])|0,n(o.wk[2])|0];
  if(!o.wb||typeof o.wb!=='object')o.wb={};for(var k in o.wb)o.wb[k]=n(o.wb[k])|0;
  o.gul=n(o.gul)|0;o.gk=Math.max(0,Math.min(4,n(o.gk)|0));if(typeof o.fd!=='string')o.fd='';o.tu=n(o.tu)|0;o.mg=n(o.mg)|0;}
// облако: сторона, у которой больше наказов, — целиком (доска, связка); обереги и значки — максимум; день — максимум в пределах дня
function merge(a,b){if(!b||typeof b!=='object')return;var bn=b.n|0,an=a.n|0,k;
  if(bn>an||!a.v){for(k in b)if(k!=='hc'&&k!=='wb')a[k]=JSON.parse(JSON.stringify(b[k]));}
  if(Array.isArray(b.hc)){if(!Array.isArray(a.hc))a.hc=[];for(var i=0;i<10;i++)a.hc[i]=Math.max(a.hc[i]|0,b.hc[i]|0);}
  if(b.wb&&typeof b.wb==='object'){a.wb=a.wb||{};for(k in b.wb)a.wb[k]=Math.max(a.wb[k]|0,b.wb[k]|0);}
  if(b.d&&b.d===a.d){a.dn=Math.max(a.dn|0,b.dn|0);a.dg=Math.max(a.dg|0,b.dg|0);a.sw=Math.max(a.sw|0,b.sw|0);}
  if(Array.isArray(b.wk)&&Array.isArray(a.wk)&&b.wk[0]===a.wk[0]){a.wk[1]=Math.max(a.wk[1]|0,b.wk[1]|0);a.wk[2]=Math.max(a.wk[2]|0,b.wk[2]|0);}
  a.gul=Math.max(a.gul|0,b.gul|0);a.mg=Math.max(a.mg|0,b.mg|0);
  if(b.fd)(b.fd.split(',')).forEach(function(x){if(x&&(','+a.fd+',').indexOf(','+x+',')<0)a.fd=(a.fd?a.fd+',':'')+x;});
  fix(a);}
function day(o){var d=dayKey();if(o.d!==d){o.d=d;o.dn=0;o.dg=0;o.sw=0;}return o;}

/* ---------- генератор ---------- */
function tpl(s){return TP[s.t.split(':')[0]];}
function avail(id){var T=TP[id.split(':')[0]];if(!T)return false;try{if(T.need&&!T.need())return false;}catch(e){return false;}
  if(T.e==='mgN'){var n=+id.split(':')[1]||0;return n?mgOk(n):false;}if(T.e==='mgw')return !!wkGame();return true;}
function keyOf(id){var T=TP[id.split(':')[0]];return T.e==='mgN'?'mg:'+id.split(':')[1]:T.e;}
function mk(id,k,N){var T=TP[id.split(':')[0]],g=Math.max(1,Math.min(T.cap,Math.round(T.b*(1+N/400)*(k===3?.5:1))));   // шаг связки — короче (связка ≈ игровой день)
  if(T.e==='wkb')g=Math.min(100,Math.max(T.b,wkbPct()+(k===3?10:15)));   // Босс недели: чуть дальше нынешнего лучшего
  var s={t:id,g:g,p:0,b:0,x:0,k:k};if(T.e==='mgN')s.x=+id.split(':')[1]||0;if(T.e==='mgw')s.x=wkGame();
  if(T.m==='m'){try{s.b=MET[T.e]();}catch(e){}}return s;}
function curFest(){try{var f=OB2.emit('nkz:fest');return f&&f.id&&Array.isArray(f.t)&&f.t.length>=5?f:null;}catch(e){return null;}}
function chainDef(o){var c=o.c;if(c.f==='gul')c.f='';if(c.f){var f=curFest();if(f&&f.id===c.f)return {who:{n:f.who&&f.who.n||f.n,en:f.who&&f.who.en||f.en,ic:f.who&&f.who.ic||'voevoda',st:f.n,se:f.en,l:f.l},t:f.t,fest:f};c.f='';}
  return {who:HER[c.h],t:HER[c.h].t};}
function gen(o,k){var N=o.n,R=rng(N*131+k*17+dnum()),others=o.s.filter(function(x,i){return x&&i!==k-1;}).map(function(x){return keyOf(x.t);}),
    recent=o.h?o.h.split(','):[];
  if(k===3){var cdf=chainDef(o),id=cdf.t?cdf.t[o.c.k]:null;
    if(!id){var pool=T_MD.filter(function(x){return avail(x)&&recent.indexOf(x)<0&&others.indexOf(keyOf(x))<0;});id=pool.length?pool[Math.floor(R()*pool.length)]:'k1';}
    if(!avail(id))id=['m1','k4','k1'].filter(avail)[0]||'k1';
    var s=mk(id,3,N);s.c=o.c.k;return s;}
  if(k===1&&gulOn(o)){var gp=T_SH.filter(function(x){return avail(x)&&recent.indexOf(x)<0&&others.indexOf(keyOf(x))<0;});var gs=mk(gp.length?gp[Math.floor(R()*gp.length)]:'k1',1,N);gs.gu=1;gs.c=o.gk;return gs;}
  if(o.tu&&o.n<12){for(var i=0;i<TUT.length;i++){var t=TUT[i];if(TP[t.split(':')[0]].k!==k||(','+o.h+',').indexOf(','+t+',')>=0||(o.tu|0)>>(i+1)&1)continue;if(avail(t)&&others.indexOf(keyOf(t))<0){o.tu|=1<<(i+1);return mk(t,k,0);}}}
  if(k===2){var W=wkNow();if(W&&o.wk[0]===weekNo()&&o.wk[1]<5&&avail(W.t)&&others.indexOf(keyOf(W.t))<0){var ws=mk(W.t,2,N);ws.w=1;return ws;}}
  var L=(k===1?T_SH:T_MD).slice();
  if(k===2&&izbaH()){var gs=[1,3,5,6,8,9,10,11,12,13,14,2,7,4].filter(mgOk);if(gs.length)L[L.indexOf('m28')]='m28:'+gs[Math.floor(R()*gs.length)];}
  var P=L.filter(function(x){return avail(x)&&recent.indexOf(x.split(':')[0])<0&&recent.indexOf(x)<0&&others.indexOf(keyOf(x))<0;});
  if(!P.length)P=L.filter(function(x){return avail(x)&&others.indexOf(keyOf(x))<0;});
  if(!P.length)P=[k===1?'k4':'m15'];
  return mk(P[Math.floor(R()*P.length)],k,N);}
function put(o,k){var s=gen(o,k);o.s[k-1]=s;var b=s.t.split(':')[0],r=o.h?o.h.split(','):[];r.push(b);if(r.length>6)r=r.slice(r.length-6);o.h=r.join(',');s.at=0;
  ev('new',{t:s.t,s:k,n:o.n,c:k===3?chainTag(o):''});return s;}
function gulOn(o){return wkend()&&o.gul!==weekNo();}
function chainTag(o){return o.c.f||('h'+o.c.h);}
function ensure(o){day(o);if(o.wk[0]!==weekNo())o.wk=[weekNo(),0,0];for(var k=1;k<=3;k++)if(!o.s[k-1])put(o,k);}

/* ---------- прогресс ---------- */
function popc(x){var n=0;while(x){n+=x&1;x>>>=1;}return n;}
var lastDone=[],quiet=0;
function bump(s,v,how){if(!s||s.p>=s.g)return;var p0=s.p;if(how==='x')s.p=Math.max(s.p,Math.min(s.g,v));else s.p=Math.min(s.g,s.p+v);if(s.p>=s.g&&p0<s.g)doneNow(s);}
function doneNow(s){var o=O();s.dt=Date.now();lastDone.push(s);ev('done',{t:s.t,s:s.k,n:o?o.n:0});OB2.emit('nkz:done',s.t);
  if(!inG()&&!quiet){try{rerender();toast(Lg('📜 Наказ выполнен — забери награду на карте','📜 Order done — collect the reward on the map'));setPills();}catch(e){}}}
function add(key,v){var o=O();if(!o||!v)return;ensure(o);for(var i=0;i<3;i++){var s=o.s[i];if(!s)continue;var T=tpl(s),kk=T.e==='mgN'?'mg:'+s.x:T.e==='mgw'?'mgw':T.e;
    if(kk!==key)continue;if(T.e==='land'){s.x|=1<<(v-1);bump(s,popc(s.x),'x');}else bump(s,v,T.m==='x'?'x':'e');}}
function refresh(q){var o=O();if(!o)return;var q0=quiet;if(q)quiet=1;ensure(o);for(var i=0;i<3;i++){var s=o.s[i];if(!s||s.p>=s.g)continue;var T=tpl(s);
  try{if(T.m==='m')bump(s,MET[T.e]()-s.b,'x');else if(T.m==='s'&&STQ[T.e](s))bump(s,s.g,'x');}catch(e){}}quiet=q0;}
function usedTw(G,t){var a=G.tw.concat(G.gone||[]);for(var i=0;i<a.length;i++)if(a[i]&&a[i].type===t)return true;return false;}
function onEnd(G,win){try{var o=O();if(!o||!G)return;ensure(o);
  var P=G.nkP||(G.nkP={k:0,b:0,u:0,s:0,sw:0,dl:0,won:0,wk:0,r:0}),camp=!G.endless&&!G.wk&&!G.dly&&!G.rule;
  add('kill',(G.kills|0)-P.k);P.k=G.kills|0;add('bld',(G.built|0)-P.b);P.b=G.built|0;add('ups',(G.ups|0)-P.u);P.u=G.ups|0;add('spl',(G.spells|0)-P.s);P.s=G.spells|0;
  if(G.dly){var w=Math.max(0,G.wave-1);add('dlyw',w-P.dl);P.dl=w;if(w>=8)add('dlyok',1);}
  else if(G.endless){var w2=Math.max(0,G.wave-1);add('sgw',w2-P.sw);P.sw=w2;add('sg1',w2);}
  if(G.wk&&!P.wk){P.wk=1;add('wkr',1);}
  if(G.rule&&win&&!P.r){P.r=1;add('dchw',1);}
  if(win&&camp&&!P.won){P.won=1;var st=typeof starsFor==='function'?starsFor():0;add('win',1);if(st===3)add('st3',1);if(!(G.leaks|0))add('nolk',1);if(!(G.spells|0))add('nosp',1);
    if(!usedTw(G,'arch'))add('noarch',1);if(usedTw(G,'dub'))add('dub',1);if(G.li===6)add('lair',1);if(G.li===5)add('bossw',1);
    if(G.dif==='s'||G.dif==='h')add('winx',1);if(G.dif==='h')add('winh',1);if((G.bs2||0)+(G.bs3||0)>0)add('spd',1);add('land',(G.ci|0)+1);}
  var iz=0;G.tw.concat(G.gone||[]).forEach(function(t){if(t&&t.type==='izba')iz+=t.kills|0;});add('izk',iz);
  refresh();G.nkWin=1;}catch(e){err('end',e);}}
function onKill(e,src){try{if(!O()||!e||!inG())return;var E=EN[e.type]||{};if(E.fly){add('fly',1);if(src&&src.type==='mag')add('magfly',1);}
  if(e.lead)add('lead',1);if(E.armor&&src&&src.type==='pushka')add('parm',1);}catch(x){err('kill',x);}}

/* ---------- забрать ---------- */
function claim(i,from){var o=O();if(!o)return null;ensure(o);var s=o.s[i];if(!s||s.p<s.g)return null;
  var g=goldFor(s),sl=slFor(s),room=Math.max(0,capG()-o.dg),gg=Math.min(g,room),r={g:gg,sl:0,tr:null,cap:gg<g,chain:null};
  if(gg>0){S.gold+=gg;ern('nkz',gg);o.dg+=gg;}
  if(r.cap){sl+=10;try{r.tr=typeof mgTrf==='function'?mgTrf(1):null;}catch(e){}ev('cap',{t:s.t,g:g-gg});}
  if(typeof SLAVA_ADD==='function')r.sl=SLAVA_ADD(sl,'nkz');
  o.n++;o.dn++;var ms=s.dt?Math.round((Date.now()-s.dt)/1000):0,h=s.k===3&&!o.c.f?o.c.h:-1;
  ev('claim',{t:s.t,s:s.k,n:o.n,c:s.k===3?chainTag(o):'',f:from||''});
  try{OB2.emit('nakaz',{id:s.t,h:h>=0?HER[h].n:''});}catch(e){}
  if(s.w&&o.wk[0]===weekNo()){o.wk[1]++;if(o.wk[1]>=5&&!o.wk[2]){o.wk[2]=1;var W=wkNow();if(W){o.wb[W.id]=(o.wb[W.id]|0)+1;r.badge=W;try{STAT.ev('wkev',{a:'badge',k:W.id});}catch(e){}}}else try{STAT.ev('wkev',{a:'nk',k:(wkNow()||{}).id||''});}catch(e){}}
  if(s.k===3){o.c.k++;if(o.c.k>=5){r.chain=chainDone(o);}}
  else if(s.gu&&gulOn(o)){o.gk++;if(o.gk>=5){o.gk=0;o.gul=weekNo();r.chain=gulDone(o);}}
  o.s[i]=null;put(o,i+1);
  try{save();}catch(e){}
  return r;}
function chainDone(o){var c=o.c,cdf=chainDef(o),res={who:cdf.who,am:-1,g:0,tr:null,f:c.f};
  var g=r5(U()*3),room=Math.max(0,capG()-o.dg),gg=Math.min(g,room);if(gg>0){S.gold+=gg;ern('nkz',gg);o.dg+=gg;}res.g=gg;
  try{res.tr=typeof mgTrf==='function'?mgTrf(3+Math.min(5,cd())):null;}catch(e){}
  if(gg<g&&typeof SLAVA_ADD==='function')SLAVA_ADD(30,'nkz');
  boostAdd(300);if(typeof SLAVA_ADD==='function')SLAVA_ADD(50,'nkz');
  if(c.f){o.fd=(o.fd?o.fd+',':'')+c.f;try{OB2.emit('nkz:festDone',c.f);if(cdf.fest&&cdf.fest.done)cdf.fest.done();}catch(e){}}
  else{if(o.hc[c.h]<4){res.am=c.h*4+o.hc[c.h];}o.hc[c.h]++;}
  c.j++;ev('chain',{c:chainTag(o),n:c.j,f:amN(o)});try{OB2.emit('svz',{h:res.who.n,n:amN(o)});}catch(e){}
  // следующая связка: праздник (MOROZ) → «Гуляние» по выходным раз в неделю → следующий герой по кругу
  if(!c.f)c.h=(c.h+1)%10;c.k=0;c.f='';var f=curFest();
  if(f&&(','+o.fd+',').indexOf(','+f.id+',')<0)c.f=f.id;

  return res;}
function gulDone(o){var g=r5(U()*2),room=Math.max(0,capG()-o.dg),gg=Math.min(g,room),res={who:GUL,am:-1,g:gg,tr:null,f:'gul'};if(gg>0){S.gold+=gg;ern('nkz',gg);o.dg+=gg;}
  try{res.tr=typeof mgTrf==='function'?mgTrf(2+Math.min(4,cd())):null;}catch(e){}boostAdd(300);if(typeof SLAVA_ADD==='function')SLAVA_ADD(40,'nkz');ev('chain',{c:'gul',n:o.c.j,f:amN(o)});return res;}
function amN(o){var n=0;for(var i=0;i<10;i++)n+=Math.min(4,o.hc[i]|0);return n;}
function chestReady(o){try{return o.dn>=3&&!(S.dlyS&&S.dlyS.d===dayKey());}catch(e){return false;}}
function chestOpen(){var o=O();if(!o||!chestReady(o))return;try{if(S.dq&&S.dq.day===dayKey())S.dq.bonus=1;}catch(e){}ev('chest',{n:o.dn});dlyChestOpen();}
function swap(i){var o=O();if(!o)return;ensure(o);var s=o.s[i];if(!s)return;
  var go=function(f){var oo=O();if(!oo)return;oo.sw++;var k=i+1;if(k===3){var id=['m1','k4','k1'].filter(function(x){return avail(x)&&x!==s.t;})[0]||'k1';var ns=mk(id,3,oo.n);ns.c=oo.c.k;ns.f=1;oo.s[2]=ns;}
    else{oo.h=(oo.h?oo.h+',':'')+s.t.split(':')[0];oo.s[i]=null;put(oo,k);}ev('swap',{t:s.t,s:k,n:oo.n,f:f});save();rerender();
    toast(f==='free'?Lg('Кот Баюн сжевал берёсту — вот новый наказ','Bayun the Cat chewed up the bark — here’s a new order'):Lg('Новый наказ на доске','A new order is on the board'));};
  if(o.sw<1){go('free');return;}
  if(typeof showRewarded!=='function'){toast(Lg('Замена — завтра','Swap again tomorrow'));return;}
  showModal('<h3>'+Lg('Заменить наказ?','Swap the order?')+'</h3><p class="sub">'+Lg('Бесплатная замена на сегодня уже была. Посмотри ролик — и Баюн сжуёт ещё одну берёсту.','Today’s free swap is used. Watch a video and Bayun will chew one more piece of bark.')+'</p>'+
    '<div class="btns"><button class="btn ad big" id="nkzSwAd">'+Lg('🎬 Заменить за ролик','🎬 Swap for a video')+'</button><button class="btn ghost" id="nkzSwNo">'+Lg('Не надо','No, thanks')+'</button></div>','nkzsw');
  on('nkzSwNo',hideModal);on('nkzSwAd',function(){hideModal();showRewarded(function(){go('ad');});});}

/* ---------- тексты ---------- */
function sTxt(s){var T=tpl(s),t=Lg(T.ru,T.en),g=T.e==='mgN'||T.e==='mgw'?(typeof mgNameN==='function'?mgNameN(s.x):''):'';return t.replace('{n}',fmtNum(s.g)).replace('{g}',g);}
function sWho(s,o){if(s.k===3){var cdf=chainDef(o);return cdf.who;}if(s.gu)return GUL;var h=whoOf(s);return HER[h];}
var WHO={win:9,nolk:5,st3:9,kill:9,bld:5,ups:2,thu:7,cat:1,mg:8,early:8,lead:6,fly:7,izk:0,sl:3,dlyw:1,spd:6,sgw:8,winx:2,lair:6,dchw:1,wkr:3,ord:4,frg:2,vil:4,nosp:1,noarch:5,mgr:8,bossw:9,land:9,parm:2,sg1:8,dlyok:1,book:7,nst:9,pd:4,dub:5,top3:3,wkb:3,mgN:0,winh:5,lov:6,igr:3,magfly:7,ratb:3,mgw:8};
function whoOf(s){var T=tpl(s);return WHO[T.e]!=null?WHO[T.e]:9;}
function sLine(s,o){if(s.gu)return Lg(GUL.l[s.c|0][0],GUL.l[s.c|0][1]);if(s.k!==3)return '';var cdf=chainDef(o),w=cdf.who;if(w.l&&w.l[s.c|0])return Lg(w.l[s.c|0][0],w.l[s.c|0][1]);return '';}

/* ---------- обереги: 40 рисунков кодом (10 героев × 4) + 4 значка недель ---------- */
var AM=[ // [рус, англ, форма, цвет1, цвет2]
 ['Клубок Яги','Yaga’s yarn ball','yarn','#8a3a8a','#e0a0e0'],['Поварёшка Яги','Yaga’s ladle','ladle','#6a4a2a','#d0a060'],['Мухомор-оберег','Toadstool charm','mush','#c0392b','#fff'],['Ступа-брелок','Little mortar','pot','#5a3a1a','#b08050'],
 ['Ус Баюна','Bayun’s whisker','whisk','#3a3a4a','#e8e8f0'],['Колыбельный бубенец','Lullaby bell','bell','#d0a020','#fff2a0'],['Сонная подушечка','Sleepy pillow','pillow','#4a6ab0','#c8d8ff'],['Кошачья лапка','Cat’s paw','paw','#2a2a34','#f0c0c8'],
 ['Подкова Микулы','Mikula’s horseshoe','shoe','#7a7a88','#d8dce8'],['Молот-оберег','Hammer charm','hammer','#5a5a66','#c08040'],['Наковаленка','Tiny anvil','anvil','#44444e','#9a9aa8'],['Кольцо-гвоздь','Nail ring','ring','#8a6a3a','#e0c080'],
 ['Шлем-пуговка','Helmet button','helm','#8a96a8','#e6b53a'],['Стяг Ратибора','Ratibor’s pennant','flag','#8a1a2a','#e6b53a'],['Дозорный рожок','Patrol horn','horn','#a07040','#f0d8a0'],['Медаль «Обогнал»','“Overtaken” medal','medal','#c09020','#fff0a0'],
 ['Кокошник-брошь','Kokoshnik brooch','kokosh','#c0392b','#e6b53a'],['Расписная ложка','Painted spoon','spoon','#c0392b','#ffd84a'],['Бусы Марфы','Marfa’s beads','beads','#c03060','#ffe0e8'],['Самоварчик','Little samovar','samovar','#c08030','#ffe0a0'],
 ['Дубовый жёлудь','Oak acorn','acorn','#8a5a2a','#c8a060'],['Берёзовый листок','Birch leaf','leaf','#4a9a3a','#c8f0a0'],['Лапоть-оберег','Bast shoe charm','lapot','#b09050','#f0dca0'],['Посох Пахома','Pakhom’s staff','staff','#6a4a2a','#a0e070'],
 ['Сабелька','Little sabre','saber','#a0a8b8','#e6b53a'],['Конский хвост','Horse tail','tail','#5a3a22','#c86a2a'],['Степная звезда','Steppe star','star','#2d6fd6','#ffd84a'],['Серьга атаманши','Atamansha’s earring','ring2','#e6b53a','#c0392b'],
 ['Глаз-оберег','Eye charm','eye','#2a5ab0','#fff'],['Свиток Колдуна','Sorcerer’s scroll','scroll','#c8a870','#6a3a8a'],['Совиное перо','Owl feather','feather','#8a7a6a','#e8e0d0'],['Лунный камень','Moonstone','moon','#3a4a8a','#d8e8ff'],
 ['Колокольчик Ерёмы','Yeryoma’s bell','bell','#b07820','#ffe08a'],['Набатный язычок','Bell tongue','tongue','#7a5a2a','#d0b080'],['Верёвочка звонаря','Bell-ringer’s rope','rope','#a08050','#e8d0a0'],['Медный звон','Copper chime','chime','#b06030','#ffc090'],
 ['Щит Потапа','Potap’s shield','shield','#8a1a2a','#e6b53a'],['Ключ от заставы','Outpost key','key','#a07820','#ffe08a'],['Звезда дозора','Patrol star','star','#c0392b','#ffd84a'],['Булава-брелок','Mace charm','mace','#5a5a66','#c0c0cc']];
var WB={fair:['cookie','#b0602a','#ffd8a0'],raid:['fang','#e8e0d0','#8a2a2a'],watch:['horn','#8a5a2a','#ffe08a'],bog:['shield','#2a5ab0','#ffd84a']};
function amDraw(g,f,c1,c2){var P=function(){g.beginPath();},F=function(c){g.fillStyle=c;g.fill();},St=function(c,w){g.strokeStyle=c;g.lineWidth=w||2;g.stroke();},
  C=function(x,y,r){g.arc(x,y,r,0,Math.PI*2);};g.lineJoin='round';g.lineCap='round';
  switch(f){
  case 'yarn':P();C(0,1,9);F(c1);for(var i=-1;i<=1;i++){P();g.arc(i*4,1,8,-1.2,1.2);St(c2,1.5);}P();g.moveTo(7,6);g.quadraticCurveTo(12,12,6,13);St(c1,1.5);break;
  case 'ladle':P();g.moveTo(-8,-11);g.lineTo(2,2);St(c1,3);P();C(4,5,6);F(c2);St(c1,1.5);break;
  case 'mush':P();g.rect(-3,0,6,10);F('#f4ecd8');P();g.arc(0,1,11,Math.PI,0);g.closePath();F(c1);P();C(-5,-4,1.8);C(3,-6,1.6);C(5,-1,1.4);F(c2);break;
  case 'pot':P();g.moveTo(-9,-6);g.lineTo(9,-6);g.lineTo(6,10);g.lineTo(-6,10);g.closePath();F(c1);St(c2,1.5);P();g.moveTo(5,-6);g.lineTo(10,-13);St('#8a6a3a',2.5);break;
  case 'whisk':for(var j=-1;j<=1;j++){P();g.moveTo(-11,j*4);g.quadraticCurveTo(0,j*4-3,11,j*5);St(c2,1.8);}P();C(0,0,3);F(c1);break;
  case 'bell':P();g.moveTo(-9,7);g.quadraticCurveTo(-8,-10,0,-10);g.quadraticCurveTo(8,-10,9,7);g.closePath();F(c1);St(c2,1.4);P();C(0,9,2.6);F(c2);P();g.moveTo(0,-10);g.lineTo(0,-13);St(c1,2);break;
  case 'pillow':P();g.moveTo(-11,-7);g.quadraticCurveTo(0,-4,11,-7);g.quadraticCurveTo(8,0,11,7);g.quadraticCurveTo(0,4,-11,7);g.quadraticCurveTo(-8,0,-11,-7);F(c1);P();C(0,0,2.5);F(c2);break;
  case 'paw':P();C(0,4,6);F(c1);[[-7,-3],[-2.5,-7],[2.5,-7],[7,-3]].forEach(function(p){P();C(p[0],p[1],2.6);F(c1);});P();C(0,4,3);F(c2);break;
  case 'shoe':P();g.arc(0,-1,9,Math.PI*.78,Math.PI*.22);St(c1,6);P();g.arc(0,-1,9,Math.PI*.78,Math.PI*.22);St(c2,1.4);for(var hs=0;hs<5;hs++){var ah=Math.PI*(.85+hs*.3);P();C(Math.cos(ah)*9,Math.sin(ah)*9-1,1.1);F('#333');}break;
  case 'hammer':P();g.moveTo(0,-4);g.lineTo(0,12);St('#8a5a2a',3);P();g.rect(-9,-11,18,8);F(c1);St(c2,1.4);break;
  case 'anvil':P();g.moveTo(-11,-6);g.lineTo(9,-6);g.lineTo(11,-2);g.lineTo(4,-1);g.lineTo(4,5);g.lineTo(8,10);g.lineTo(-8,10);g.lineTo(-4,5);g.lineTo(-4,-1);g.lineTo(-9,-2);g.closePath();F(c1);St(c2,1.2);break;
  case 'ring':case 'ring2':P();C(0,2,8);St(c1,4);P();C(0,-7,f==='ring2'?3.5:2.5);F(c2);break;
  case 'helm':P();g.arc(0,4,10,Math.PI,0);g.closePath();F(c1);P();g.moveTo(0,-6);g.lineTo(0,-12);St(c2,2.5);P();g.rect(-11,3,22,3);F(c2);break;
  case 'flag':P();g.moveTo(-8,12);g.lineTo(-8,-12);St('#6a4a2a',2.5);P();g.moveTo(-8,-11);g.lineTo(11,-6);g.lineTo(-8,0);g.closePath();F(c1);St(c2,1.2);break;
  case 'horn':P();g.moveTo(-11,6);g.quadraticCurveTo(-2,-12,11,-6);g.lineTo(10,-1);g.quadraticCurveTo(-1,-4,-7,8);g.closePath();F(c1);St(c2,1.4);break;
  case 'medal':P();g.moveTo(-5,-12);g.lineTo(0,-3);g.lineTo(5,-12);St('#c0392b',3);P();C(0,4,8);F(c1);St(c2,1.5);P();g.font='bold 9px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle=c2;g.fillText('1',0,5);break;
  case 'kokosh':P();g.moveTo(-11,8);g.quadraticCurveTo(-11,-12,0,-12);g.quadraticCurveTo(11,-12,11,8);g.closePath();F(c1);St(c2,1.6);P();C(0,-2,3);F(c2);break;
  case 'spoon':P();g.ellipse(0,-5,5,7,0,0,Math.PI*2);F(c1);St(c2,1.4);P();g.moveTo(0,2);g.lineTo(0,13);St(c1,3);P();C(0,-5,2);F(c2);break;
  case 'beads':for(var b=0;b<7;b++){var a=Math.PI*(.1+.8*b/6);P();C(Math.cos(a)*9,Math.sin(a)*6-1,2.8);F(b%2?c1:c2);St(c1,.8);}break;
  case 'samovar':P();g.ellipse(0,2,8,9,0,0,Math.PI*2);F(c1);St(c2,1.4);P();g.rect(-3,-12,6,5);F(c1);P();g.moveTo(8,2);g.lineTo(12,5);St(c1,2);P();g.rect(-6,10,12,3);F(c2);break;
  case 'acorn':P();g.ellipse(0,3,7,9,0,0,Math.PI*2);F(c2);P();g.arc(0,-2,8,Math.PI,0);g.closePath();F(c1);P();g.moveTo(0,-10);g.lineTo(1,-13);St(c1,2);break;
  case 'leaf':P();g.moveTo(0,-12);g.quadraticCurveTo(11,-2,0,12);g.quadraticCurveTo(-11,-2,0,-12);F(c1);P();g.moveTo(0,-10);g.lineTo(0,11);St(c2,1.2);break;
  case 'lapot':P();g.ellipse(0,2,11,6,0,0,Math.PI*2);F(c1);for(var q=-8;q<=8;q+=4){P();g.moveTo(q,-3);g.lineTo(q+2,7);St(c2,1);}break;
  case 'staff':P();g.moveTo(-6,12);g.lineTo(5,-8);St(c1,3);P();C(6,-9,3.5);F(c2);break;
  case 'saber':P();g.moveTo(-9,10);g.quadraticCurveTo(4,4,10,-11);St(c1,3);P();g.moveTo(-11,6);g.lineTo(-5,12);St(c2,2.5);break;
  case 'tail':P();g.moveTo(-2,-12);g.quadraticCurveTo(10,0,2,12);g.quadraticCurveTo(-8,2,-2,-12);F(c1);P();g.moveTo(-2,-11);g.quadraticCurveTo(4,0,2,10);St(c2,1.3);break;
  case 'star':P();for(var s=0;s<10;s++){var r=s%2?4.5:11,an=-Math.PI/2+s*Math.PI/5;g.lineTo(Math.cos(an)*r,Math.sin(an)*r+1);}g.closePath();F(c2);St(c1,1.5);break;
  case 'eye':P();g.moveTo(-11,0);g.quadraticCurveTo(0,-10,11,0);g.quadraticCurveTo(0,10,-11,0);F(c2);St(c1,1.5);P();C(0,0,4.5);F(c1);P();C(0,0,1.8);F('#111');break;
  case 'scroll':P();g.rect(-8,-9,16,18);F(c1);P();C(-8,-9,2.5);C(8,-9,2.5);F('#8a6a3a');for(var y=-4;y<=5;y+=3){P();g.moveTo(-5,y);g.lineTo(5,y);St(c2,1);}break;
  case 'feather':P();g.moveTo(-8,11);g.quadraticCurveTo(-6,-4,8,-11);g.quadraticCurveTo(6,4,-8,11);F(c2);St(c1,1.2);P();g.moveTo(-9,12);g.lineTo(6,-8);St(c1,1.2);break;
  case 'moon':P();C(0,0,10);F(c2);P();C(4,-3,8);F(c1);break;
  case 'tongue':P();g.moveTo(0,-12);g.lineTo(0,4);St(c1,2.5);P();C(0,7,4.5);F(c2);St(c1,1.2);break;
  case 'rope':P();g.moveTo(-3,-12);for(var z=-12;z<=6;z+=3)g.lineTo(z%2?-3:3,z);St(c1,3);P();C(0,9,3.5);F(c2);break;
  case 'chime':for(var m=-1;m<=1;m++){P();g.rect(m*6-2,-8+Math.abs(m)*3,4,14-Math.abs(m)*3);F(m?c1:c2);}P();g.moveTo(-10,-10);g.lineTo(10,-10);St('#6a4a2a',2);break;
  case 'shield':P();g.moveTo(0,-12);g.lineTo(10,-8);g.quadraticCurveTo(9,6,0,12);g.quadraticCurveTo(-9,6,-10,-8);g.closePath();F(c1);St(c2,1.8);P();g.moveTo(0,-8);g.lineTo(0,8);g.moveTo(-6,-1);g.lineTo(6,-1);St(c2,1.5);break;
  case 'key':P();C(-5,-5,5);St(c1,3);P();g.moveTo(-1,-1);g.lineTo(9,9);g.moveTo(6,6);g.lineTo(9,3);g.moveTo(8,8);g.lineTo(11,5);St(c1,2.5);P();C(-5,-5,1.8);F(c2);break;
  case 'mace':P();g.moveTo(-8,11);g.lineTo(2,-1);St('#8a5a2a',3);P();C(5,-5,6);F(c1);for(var u=0;u<6;u++){var au=u*Math.PI/3;P();C(5+Math.cos(au)*7,-5+Math.sin(au)*7,1.6);F(c2);}break;
  case 'cookie':P();C(0,0,10);F(c1);P();C(0,0,7);St(c2,1.4);P();C(-3,-2,1.4);C(3,-1,1.4);C(0,4,1.4);F(c2);break;
  case 'fang':P();g.moveTo(-7,-10);g.quadraticCurveTo(2,-9,6,-10);g.quadraticCurveTo(4,4,-2,12);g.quadraticCurveTo(-4,0,-7,-10);F(c1);St(c2,1.4);break;
  default:P();C(0,0,8);F(c1);}}
function amFn(f,c1,c2){return function(g){g.beginPath();g.arc(0,0,15.5,0,Math.PI*2);g.fillStyle='#fff3d6';g.fill();g.lineWidth=2.4;g.strokeStyle=c1;g.stroke();
  g.save();g.scale(.95,.95);amDraw(g,f,c1,c2);g.restore();};}
function amArt(key,f,c1,c2){if(typeof ART!=='undefined'&&ART[key])return;art(key,34,amFn(f,c1,c2));}
AM.forEach(function(a,i){amArt('nkz_a'+i,a[2],a[3],a[4]);});
for(var wbk in WB)amArt('nkz_w'+wbk,WB[wbk][0],WB[wbk][1],WB[wbk][2]);
art('nkz_lock',34,function(g){g.beginPath();g.arc(0,0,15.5,0,Math.PI*2);g.fillStyle='#6b4f30';g.fill();g.lineWidth=2;g.strokeStyle='#4a321c';g.stroke();g.fillStyle='#a08060';g.font='bold 16px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,1);});
function amList(o){var r=[];for(var h=0;h<10;h++)for(var j=0;j<Math.min(4,o.hc[h]|0);j++)r.push(h*4+j);return r;}
function amImg(i,px){return '<img src="'+ic('nkz_a'+i,64)+'" width="'+px+'" height="'+px+'" alt="">';}
// знамя «Летописец» за все 40
try{if(typeof xbnAdd==='function')xbnAdd({id:'nkz40',n:'Знамя Летописца',en:'Chronicler’s banner',c1:'#5a3a1e',c2:'#ffd84a',em:[3,.5]});}catch(e){}
function give40(o){try{if(amN(o)>=40&&S.bns&&!S.bns.nkz40){S.bns.nkz40=1;toast(Lg('Все 40 оберегов! Знамя Летописца и резные ворота — твои','All 40 charms! The Chronicler’s banner and carved gate are yours'));}}catch(e){}}

/* ---------- окна ---------- */
function openChain(r){var o=O(),w=r.who,am=r.am>=0?AM[r.am]:null;if(r.f==='gul'){w={n:'Богатырские выходные',en:'Heroic weekend',ic:w.ic,st:'Гуляние',se:'Festivities'};}
  showModal('<h3>'+Lg('Связка закрыта!','Chain complete!')+'</h3><div class="bigstars"><img src="'+ic(w.ic,96)+'" alt="" style="width:64px;height:64px;border-radius:50%;background:#fff6e2"></div>'+
    '<p class="sub">'+Lg(w.n+': «'+w.st+'» — спасибо, воевода!',w.en+': “'+w.se+'” — thank you, commander!')+'</p>'+
    '<div class="rew"><b>'+(r.g>0?'+'+fmtGold(r.g)+' · ':'')+Lg('⏩ +5 мин','⏩ +5 min')+(r.tr?' · '+(typeof trfImg==='function'?trfImg(r.tr.id,20):'')+' +'+r.tr.n:'')+'</b></div>'+
    (am?'<div class="card" style="text-align:center"><img src="'+ic('nkz_a'+r.am,96)+'" width="64" height="64" alt=""><br><b>'+Lg('Оберег на ворота: «'+am[0]+'»','Gate charm: “'+am[1]+'”')+'</b><br><span class="mutd">'+Lg('обереги ','charms ')+amN(o)+' / 40</span></div>':'')+
    '<div class="btns"><button class="btn gold big" id="nkzChOk">'+Lg('Славно!','Splendid!')+'</button></div>','nkzch');
  on('nkzChOk',function(){hideModal();rerender();});give40(o);}
function openAmulets(){var o=O();if(!o)return;var got=amList(o),h='<h3>'+Lg('Обереги ворот','Gate charms')+'</h3><p class="sub">'+Lg('Закрой связку из 5 наказов героя — получишь его оберег. Всего 40. Ворота с каждым оберегом нарядней — смотри в бою.','Complete a hero’s chain of 5 orders to get their charm. 40 in all. Each charm decorates your gate — look in battle.')+'</p>';
  h+='<div class="nkzam">';for(var hh=0;hh<10;hh++){h+='<div class="nkzar"><img class="w" src="'+ic(HER[hh].ic,64)+'" alt=""><span>';for(var j=0;j<4;j++){var i=hh*4+j,on1=got.indexOf(i)>=0;h+='<img src="'+ic(on1?'nkz_a'+i:'nkz_lock',64)+'" title="'+(on1?Lg(AM[i][0],AM[i][1]):'')+'" alt="">';}h+='</span></div>';}h+='</div>';
  var wbs='';WK.forEach(function(W){var n=o.wb[W.id]|0;wbs+='<span class="nkzwb"><img src="'+ic(n?'nkz_w'+W.id:'nkz_lock',64)+'" alt="">'+(n?Lg(W.b,W.be)+(n>1?' ×'+n:''):'—')+'</span>';});
  if(ONW)h+='<p class="sub" style="margin:8px 0 4px"><b>'+Lg('Значки недель','Weekly badges')+'</b> — '+Lg('5 наказов темы недели','5 orders of the week’s theme')+'</p><div class="nkzwbs">'+wbs+'</div>';
  h+='<div class="btns stick"><button class="btn big" id="nkzAmOk">'+Lg('Закрыть','Close')+'</button></div>';showModal(h,'nkzam');on('nkzAmOk',hideModal);}

/* ---------- доска на «Карте» ---------- */
var CSS='#nkzBoard.nkzb{background:#8a6a44;border:3px solid #5a3a1e;border-radius:14px;padding:5px 6px 3px;margin:6px 0;box-shadow:0 2px 0 #0003}'+
 '#nkzBoard .nkzh{display:flex;align-items:center;gap:6px;color:#fff3d6;font-weight:800;font-size:15px;margin:0 2px 5px}#nkzBoard .nkzh .nm{flex:1}'+
 '#nkzBoard .nkzc{border:2px solid #d9bf8f;background:#f7ecd2;border-radius:10px;padding:2px 8px;font:inherit;font-size:13px;font-weight:800;color:#5a3a1e;cursor:pointer;white-space:nowrap}#nkzBoard .nkzc.hot{background:#ffd84a;border-color:#fff3a0;animation:nkzP 1s infinite alternate}'+
 '#nkzBoard .nkzs{display:flex;align-items:center;gap:6px;background:linear-gradient(#f7ecd2,#ead6ab);border-radius:6px 10px 8px 12px;padding:4px 4px 4px 5px;margin-bottom:5px;position:relative;font-size:13px;line-height:1.22;color:#3a2410;box-shadow:0 2px 0 #0003;cursor:pointer;transition:transform .35s,opacity .35s}'+
 '#nkzBoard .nkzs::before{content:"";position:absolute;top:-3px;left:50%;width:7px;height:7px;border-radius:50%;background:#555;box-shadow:inset 0 0 0 2px #999}'+
 '#nkzBoard .nkzs img.w{width:34px;height:34px;flex:none;border-radius:50%;background:#fff6e2;border:2px solid #b08a58}#nkzBoard .nkzs .nkt{flex:1;min-width:0;display:block;text-align:left}#nkzBoard .nkzs .nkt b{font-size:12.5px;display:inline}'+
 '#nkzBoard .nkzs .nktg{display:inline;font-size:10.5px;font-weight:800;background:#c8452f;color:#fff;border-radius:6px;padding:0 4px;margin-left:3px;white-space:nowrap}#nkzBoard .nkzs .nktg.wk{background:#2d6fd6}'+
 '#nkzBoard .nkzs .nkq{display:block;font-size:12.5px}#nkzBoard .nkzs .nkln{display:block;font-size:11.5px;font-style:italic;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '#nkzBoard .nkzs .bar{margin-top:2px;height:6px}#nkzBoard .nkzs .nkrw{font-weight:800;color:#8a5a00;white-space:nowrap;font-size:12.5px;text-align:right}#nkzBoard .nkzs .nkrw small{display:block;font-size:10.5px;color:#6a4a2a;font-weight:700}'+
 '#nkzBoard .nkzs .sw{border:0;background:none;font-size:15px;padding:4px 3px;opacity:.55;cursor:pointer;flex:none}#nkzBoard .nkzs.done{outline:3px solid #ffd84a;background:linear-gradient(#fff6d0,#ffe9a0)}#nkzBoard .nkzs.done .nkrw{color:#2a7a1a}'+
 '#nkzBoard .nkzs.gone{transform:translateY(-26px) rotate(-6deg);opacity:0}@keyframes nkzP{to{box-shadow:0 0 10px #ffd84a}}'+
 '#nkzBoard .nkzf{display:flex;flex-wrap:wrap;gap:3px 6px;align-items:center;color:#fff3d6;font-size:12px;font-weight:700;margin:1px 2px 2px;cursor:pointer}#nkzBoard .nkzf img{width:20px;height:20px;vertical-align:middle}#nkzBoard .nkzf .sp{flex:1}'+
 '.nkzam{display:flex;flex-direction:column;gap:4px}.nkzar{display:flex;align-items:center;gap:6px}.nkzar img{width:34px;height:34px}.nkzar img.w{border-radius:50%;background:#fff6e2}'+
 '.nkzwbs{display:flex;flex-wrap:wrap;gap:6px}.nkzwb{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700}.nkzwb img{width:30px;height:30px}'+
 '@media (max-width:340px){#nkzBoard .nkzs .nkln{display:none}#nkzBoard .nkzs img.w{width:28px;height:28px}}';
function css(){if(document.getElementById('nkzCss'))return;var st=document.createElement('style');st.id='nkzCss';st.textContent=CSS;document.head.appendChild(st);}
function boardHTML(o){var dn=Math.min(3,o.dn),cr=chestReady(o),opened=S.dlyS&&S.dlyS.d===dayKey(),h='<div class="nkzh"><span class="nm">'+Lg('📜 Наказы','📜 Orders')+'</span>'+
   '<button class="nkzc'+(cr?' hot':'')+'" data-nk="chest">'+(opened?Lg('🎁 сундук дня ✓','🎁 daily chest ✓'):Lg('🎁 сундук дня ','🎁 daily chest ')+dn+'/3')+'</button></div>';
  for(var i=0;i<3;i++){var s=o.s[i];if(!s)continue;var w=sWho(s,o),dn1=s.p>=s.g,pc=Math.round(s.p/s.g*100),T=tpl(s),
      tag=s.k===3||s.gu?'<span class="nktg">'+((s.c|0)+1)+'/5 «'+Lg(w.st,w.se)+'»</span>':s.w?'<span class="nktg wk">'+Lg('неделя','week')+'</span>':'',ln=sLine(s,o);
    h+='<div class="nkzs'+(dn1?' done':'')+'" data-nk="'+i+'"><img class="w" src="'+ic(w.ic,64)+'" alt=""><div class="nkt"><b>'+Lg(w.n,w.en)+'</b>'+tag+
      (ln?'<span class="nkln">'+ln+'</span>':'')+'<span class="nkq">'+sTxt(s)+'</span>'+(dn1||s.g<=1?'':'<div class="bar"><i style="width:'+pc+'%"></i></div>')+'</div>'+
      '<span class="nkrw">'+(dn1?Lg('Забрать','Collect')+'<br>':'')+'+'+fmtNum(goldFor(s))+(s.g>1&&!dn1?'<small>'+fmtNum(Math.floor(s.p))+'/'+fmtNum(s.g)+'</small>':'')+'</span>'+
      (dn1?'':'<button class="sw" data-nks="'+i+'" title="'+Lg('Заменить','Swap')+'">↻</button>')+'</div>';}
  var got=amList(o),W=wkNow(),f='<div class="nkzf" data-nk="am">';
  for(var j=Math.max(0,got.length-6);j<got.length;j++)f+='<img src="'+ic('nkz_a'+got[j],64)+'" alt="">';
  f+='<span>'+Lg('обереги ','charms ')+got.length+'/40</span><span class="sp"></span>';
  if(W)f+='<span>'+Lg('🗓 '+W.n+' '+Math.min(5,o.wk[1])+'/5','🗓 '+W.en+' '+Math.min(5,o.wk[1])+'/5')+'</span>';
  if(wkend())f+='<span>'+Lg('🎉 Богатырские выходные','🎉 Heroic weekend')+'</span>';
  f+='</div>';
  var tw='';try{var t=typeof TR==='function'?TR():null;if(t&&typeof trfWkDone==='function'&&trfOk()){var wd=trfWkDone(t),rd=trfWkReady(t),got1=trfWk(t).got;
    if(!got1)tw='<div class="nkzf" data-nk="wkd"><span>'+Lg('🗓 Дела недели ','🗓 Weekly tasks ')+Math.min(5,wd)+'/5 → '+Lg('сундук недели','weekly chest')+(rd?' 🎁':'')+'</span></div>';}}catch(e){}
  return h+f+tw;}
function bindBoard(el){el.onclick=function(e){var t=e.target;if(!t||!t.closest)return;var sw=t.closest('[data-nks]');if(sw){e.stopPropagation();SND.click();swap(+sw.getAttribute('data-nks'));return;}
  var b=t.closest('[data-nk]');if(!b)return;var k=b.getAttribute('data-nk');SND.click();
  if(k==='chest'){var o=O();if(o&&chestReady(o))chestOpen();else if(S.dlyS&&S.dlyS.d===dayKey())toast(Lg('Сундук дня уже открыт — новый завтра','The daily chest is open — a new one tomorrow'));else toast(Lg('Сундук дня — за любые 3 наказа за день','Daily chest — for any 3 orders a day'));return;}
  if(k==='am'){openAmulets();return;}if(k==='wkd'){openTab('Village');return;}
  var i=+k,o2=O();if(!o2||!o2.s[i])return;if(o2.s[i].p<o2.s[i].g){hint(o2.s[i]);return;}
  b.classList.add('gone');setTimeout(function(){doClaim(i,'map');},260);};}
function hint(s){toast(sTxt(s)+(s.g>1?' — '+fmtNum(Math.floor(s.p))+' / '+fmtNum(s.g):''));}
function doClaim(i,from){var r=claim(i,from);if(!r){rerender();return null;}SND.coin();
  var msg='+'+fmtGold(r.g)+(r.sl?' · ⭐ +'+r.sl:'');if(r.cap)msg=Lg('Золото на сегодня кончилось — сундук не резиновый. Держи трофей и Славу.','That’s all the gold for today — the chest isn’t made of rubber. Have a trophy and Fame.');
  toast(msg);if(r.badge)setTimeout(function(){toast(Lg('Значок недели: «'+r.badge.b+'»!','Weekly badge: “'+r.badge.be+'”!'));},1800);
  rerender();if(r.chain){if(from==='win')pend=r.chain;else openChain(r.chain);}return r;}
var pend=null;
function rerender(){try{if(inG())return;var el=document.getElementById('nkzBoard');if(el){var o=O();if(o){refresh(1);el.innerHTML=boardHTML(o);}}if(typeof renderToday==='function'&&$('tdBox'))renderToday();setPills();}catch(e){err('re',e);}}
function mapSlot(el){var o=O();if(!o||!S.wins)return;refresh(1);if(pend){var pc=pend;pend=null;setTimeout(function(){if(!inG()&&!$('modal').classList.contains('on'))openChain(pc);else pend=pc;},400);}css();var d=document.createElement('div');d.id='nkzBoard';d.className='nkzb';d.innerHTML=boardHTML(o);bindBoard(d);
  var side=window.innerWidth>=880&&el.querySelector('.mapside'),td=el.querySelector('#tdBox');
  if(side)side.insertBefore(d,side.firstChild);else if(td&&td.parentNode)td.parentNode.insertBefore(d,td.nextSibling);else el.insertBefore(d,el.firstChild);
  var gl=el.querySelector('#glBox');if(!side&&gl&&d.nextSibling!==gl&&gl.parentNode===d.parentNode)d.parentNode.insertBefore(d,gl);}
function hot(){var o=O();if(!o||!S.wins)return false;refresh(1);for(var i=0;i<3;i++)if(o.s[i]&&o.s[i].p>=o.s[i].g)return true;return chestReady(o);}
function todaySlot(a){var o=O();if(!o)return;for(var i=0;i<a.length;i++)if(a[i].id==='dq'){a[i].t=Lg('📜 Наказы ','📜 Orders ')+Math.min(3,o.dn)+'/3';a[i].hot=hot();
  a[i].fn=function(){var b=document.getElementById('nkzBoard');if(b)b.scrollIntoView({block:'center',behavior:'smooth'});};}}
function winSlot(G,win){var o=O();if(!o||!S.wins)return null;refresh(1);var best=-1,bv=-1;
  for(var i=0;i<3;i++){var s=o.s[i];if(!s)continue;var v=s.p>=s.g?2:s.p/s.g;if(v>bv){bv=v;best=i;}}if(best<0)return null;var s2=o.s[best],w=sWho(s2,o);
  if(bv>=2)return {h:'<span>📜 '+Lg('Наказ выполнен: ','Order done: ')+sTxt(s2)+'</span> <button class="btn gold" id="nkzWin" style="padding:6px 14px;min-height:44px">'+Lg('Забрать +','Collect +')+fmtNum(goldFor(s2))+'</button>',
    bind:function(d){d.setAttribute('data-fit','6');var b=d.querySelector('#nkzWin');if(b)b.onclick=function(){SND.click();var r=doClaim(best,'win');d.innerHTML='📜 '+(r?'+'+fmtGold(r.g)+' · '+Lg('новый наказ: ','new order: ')+sTxt(O().s[best]):'');if(typeof fitModal==='function')fitModal();};}};
  if(bv<=0)return null;var left=s2.g-Math.floor(s2.p);
  return {bind:function(d){d.setAttribute('data-fit','6');},h:'📜 '+Lg('Ещё ','')+fmtNum(left)+Lg(' — и ',' more — and ')+Lg(w.n,w.en)+Lg(' будет доволен',' will be pleased')+(s2.k===3?' ('+((s2.c|0)+1)+'/5)':'')+': '+sTxt(s2)};}
// ворота в бою: обереги на воротах (DRAW, мировые координаты), 40 — «Резные» (золотая резьба)
var amCv={};
function amSpr(i){if(amCv[i])return amCv[i];try{var A=AM[i],c=document.createElement('canvas');c.width=c.height=36;var g=c.getContext('2d');g.translate(18,18);amFn(A[2],A[3],A[4])(g);amCv[i]=c;return c;}catch(e){return null;}}
function onDraw(c,G){try{var o=O();if(!o||!G||!G.map||!G.map.gate)return;var L=amList(o);if(!L.length)return;var gt=G.map.gate,n=Math.min(8,L.length),x0=gt.x-(n-1)*7;
  for(var i=0;i<n;i++){var sp=amSpr(L[L.length-1-i]);if(sp)c.drawImage(sp,x0+i*14-7,gt.y-34+(i%2)*4,14,14);}
  if(L.length>=40){c.save();c.strokeStyle='#ffd84a';c.lineWidth=2.5;c.globalAlpha=.85;c.beginPath();c.arc(gt.x,gt.y-6,26,Math.PI*1.05,Math.PI*1.95);c.stroke();c.restore();}}catch(e){}}
function vilSlot(el){var o=O();if(!o||!S.wins)return;var L=amList(o);if(!L.length)return;css();var d=document.createElement('div');d.className='card';d.style.cursor='pointer';
  d.innerHTML='<div class="row"><b style="flex:1">'+Lg('🛡 Обереги ворот ','🛡 Gate charms ')+L.length+' / 40</b></div><div class="nkzwbs">'+L.slice(-12).map(function(i){return amImg(i,28);}).join('')+'</div>';
  d.onclick=function(){SND.click();openAmulets();};el.appendChild(d);}

/* ---------- обёртки старого (только при включённом флаге) ---------- */
function wrap(name,mk2){var f=window[name];if(typeof f!=='function')return;window[name]=mk2(f);}
function hooks(){
  if(ONN){
    OB2.on('end',onEnd,'nakaz');
    if(typeof META_MODS!=='undefined')META_MODS.push({id:'nkz',KILL:function(e,src){if(!OB2.off('nakaz'))onKill(e,src);},DRAW:function(c,G){if(!OB2.off('nakaz'))onDraw(c,G);}});
    OB2.slot('map','nakaz',mapSlot,50);OB2.slot('today','nakaz',todaySlot,50);OB2.slot('win','nakaz',winSlot,60);OB2.slot('vil','nakaz',vilSlot,10);
    wrap('dqClaimable',function(f){return function(){return O()?hot():f.apply(this,arguments);};});
    wrap('dqNote',function(f){return function(){return O()?'':f.apply(this,arguments);};});
    wrap('slQuestChk',function(f){return function(){return O()?0:f.apply(this,arguments);};});
    wrap('castCat',function(f){return function(){var r=f.apply(this,arguments);add('cat',1);return r;};});
    wrap('castThunder',function(f){return function(){var r=f.apply(this,arguments);add('thu',1);return r;};});
    wrap('callWave',function(f){return function(){var e=inG()&&!G.over&&G.nextT>0&&G.wave>0;var r=f.apply(this,arguments);if(e)add('early',1);return r;};});
    wrap('trfPdBuy',function(f){return function(){var t=typeof TR==='function'&&TR(),n0=t&&t.pd?t.pd.b.join():'';var r=f.apply(this,arguments);if(t&&t.pd&&t.pd.b.join()!==n0)add('pd',1);return r;};});
    var lastMg=0;
    wrap('MG_FIN',function(f){return function(g,o,r,opt){var out=f.apply(this,arguments);try{if(!(o&&o.mode==='train')){lastMg=Date.now();var n=g&&g.num|0;add('mg',1);if(n)add('mg:'+n,1);
      if(out&&out.rec){add('mgr',1);if(n&&n===wkGame())add('mgw',1);}}}catch(e){}return out;};});
    OB2.on('mg',function(x){if(Date.now()-lastMg<3000)return;add('mg',1);if(x&&x.k==='lov')add('lov',1);},'nakaz');
    OB2.on('mg',function(x){if(x&&x.k==='lov'&&Date.now()-lastMg<3000)add('lov',1);},'nakaz');
    OB2.on('rec',function(){if(Date.now()-lastMg<3000)return;add('mgr',1);},'nakaz');
    OB2.on('igr',function(x){if(x&&x.a==='go')add('igr',1);},'nakaz');
    OB2.on('nkz',function(k,n){add(String(k),+n||1);},'nakaz');
    OB2.on('menu',function(){var o=O();if(o){quiet=1;refresh();quiet=0;}},'nakaz');}
  if(ONW){
    wrap('dchGold',function(f){return function(){var v=f.apply(this,arguments);return wkend()?v*2:v;};});
    wrap('SLAVA_ADD',function(f){return function(n,src){var W=wkNow();if(W&&W.id==='fair'&&src==='ord')n=Math.round(n*1.5);return f.call(this,n,src);};});
    wrap('slK',function(f){return function(G){var W=wkNow();if(W&&W.id==='bog'&&G&&!G.slK&&(G.dif==='s'||G.dif==='h'))return G.dif==='h'?1.8:1.5;return f.apply(this,arguments);};});
    OB2.on('run',function(G){var W=wkNow();if(W&&W.id==='raid'&&G&&G.li===6&&!G.endless&&!G.rule)G.trfMul=(+G.trfMul||1)*1.5;},'weeks');
    OB2.slot('today','weeks',function(a){if(ONN)return;var W=wkNow();if(W)a.push({id:'wkx',hot:0,t:'🗓 '+Lg(W.n,W.en),fn:function(){toast(Lg(W.n+': '+W.d[0],W.en+': '+W.d[1]));}});},5);}
}
// перенос «Заданий дня» (один раз): сделанные сегодня задания идут в счёт дня, готовые и не забранные — выдаём золотом
function migrate(o){if(o.mg)return;o.mg=1;o.tu=(S.wins|0)<3?1:0;try{var D=S.dq;if(D&&D.day===dayKey()&&Array.isArray(D.list)){day(o);var add2=0;
  D.list.forEach(function(q){var Q=QUESTS.find(function(x){return x.k===q.k;});if(!Q)return;if(q.got){o.dn++;o.dg+=questGold(Q);}else if(q.n>=q.goal){q.got=1;var g=questGold(Q);S.gold+=g;ern('quest',g);add2+=g;o.dn++;o.dg+=g;}});
  if(add2)setTimeout(function(){toast(Lg('Задания дня теперь — наказы. Выполненное засчитано: +','Daily quests are now orders. Done ones are counted: +')+fmtGold(add2));},1500);}}catch(e){err('mig',e);}}
function boot(){try{hooks();var o=O();if(o){fix(o);migrate(o);ensure(o);quiet=1;refresh();quiet=0;}
  if(!inG()&&typeof curTab!=='undefined'&&curTab==='Map'&&$('tabMap'))renderMap();else if(!inG())try{setPills();}catch(e){}}catch(e){err('boot',e);}}
return {boot:boot,merge:merge,fix:fix,add:add,claim:claim,refresh:refresh,o:O,wk:wkNow,wkend:wkend,wkIdx:wkIdx,TP:TP,TL:TL,HER:HER,AM:AM,gen:gen,ensure:ensure,capG:capG,U:U,amN:amN,chestReady:chestReady,
  _sim:{onEnd:onEnd,put:put,day:day,doClaim:doClaim,swap:swap}};
})();
