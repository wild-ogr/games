(function(root){
'use strict';
var DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function ri(R,n){return Math.floor(R()*n);}
function field(w,h,cars,occ0){var occ=new Int16Array(w*h),i,k;for(i=0;i<w*h;i++)occ[i]=-1;if(occ0)for(i=0;i<w*h;i++)if(occ0[i]<=-2)occ[i]=-2;
var F={w:w,h:h,occ:occ,cars:cars,n:cars.length,alive:new Uint8Array(cars.length)};
for(i=0;i<cars.length;i++){F.alive[i]=1;for(k=0;k<cars[i].c.length;k++){var p=cars[i].c[k];occ[p[1]*w+p[0]]=i;}}return F;}
function fcopy(F){return{w:F.w,h:F.h,occ:F.occ.slice(),cars:F.cars,n:F.n,alive:F.alive.slice()};}
function free(F,i){var v=F.cars[i],D=DIRS[v.d],x=v.c[0][0]+D[0],y=v.c[0][1]+D[1];while(x>=0&&y>=0&&x<F.w&&y<F.h){var o=F.occ[y*F.w+x];if(o!==-1&&o!==i)return false;x+=D[0];y+=D[1];}return true;}
function rm(F,i){var c=F.cars[i].c;for(var k=0;k<c.length;k++)F.occ[c[k][1]*F.w+c[k][0]]=-1;F.alive[i]=0;}
function frees(F){var f=[];for(var i=0;i<F.n;i++)if(F.alive[i]&&free(F,i))f.push(i);return f;}
function left(F){var s=0;for(var i=0;i<F.n;i++)s+=F.alive[i];return s;}
var RAIN={from:15,need:8,taps:10,after:3};
function rainSlot(idx){return idx>=RAIN.from&&idx%10!==9&&((idx*2654435761)>>>0)%5===2;}
function rainNeed(F){var n=Math.min(RAIN.need,left(F));var T=fcopy(F),k=0;while(k<n){var f=frees(T);if(!f.length)break;rm(T,f[0]);k++;}return{need:n,taps:n+(RAIN.taps-RAIN.need),ok:k>=n};}
var WAKE={from:14,awake:3};
function wakeSlot(idx){return idx>=WAKE.from&&idx%10!==9&&((idx*2246822519)>>>0)%7===3;}
function wakeOrder(F,R){var T=fcopy(F),out=[];for(;;){var f=frees(T);if(!f.length)break;var i=f[ri(R,f.length)];rm(T,i);out.push(i);}return left(T)?null:out;}
function wakeNext(W){for(var k=0;k<W.ord.length;k++){var i=W.ord[k];if(!W.aw[i]&&W.al[i]){W.aw[i]=1;return i;}}return-1;}
function wakeInit(F,ord,n){var W={ord:ord,aw:new Uint8Array(F.n),al:new Uint8Array(F.n)};for(var i=0;i<F.n;i++)W.al[i]=F.alive[i];
for(var k=0,c=0;k<ord.length&&c<(n||WAKE.awake);k++){W.aw[ord[k]]=1;c++;}return W;}
function wakePlay(F0,ord,R){var F=fcopy(F0),W=wakeInit(F,ord);for(;;){if(!left(F))return true;var f=frees(F).filter(function(i){return W.aw[i];});if(!f.length)return false;
var i=f[ri(R,f.length)];rm(F,i);W.al[i]=0;wakeNext(W);}}
var CHALK=[
{id:'rocket',ru:'Ракета',en:'A rocket',p:[[[.5,.08],[.62,.3],[.62,.7],[.38,.7],[.38,.3],[.5,.08]],[[.38,.55],[.26,.8],[.38,.72]],[[.62,.55],[.74,.8],[.62,.72]],[[.44,.72],[.5,.92],[.56,.72]]],c:[[.5,.36,.06]]},
{id:'cat',ru:'Кот Барсик',en:'Whiskers the cat',p:[[[.3,.35],[.33,.15],[.42,.28],[.58,.28],[.67,.15],[.7,.35]],[[.3,.35],[.3,.55],[.5,.66],[.7,.55],[.7,.35]],[[.22,.42],[.4,.46]],[[.22,.52],[.4,.5]],[[.78,.42],[.6,.46]],[[.78,.52],[.6,.5]],[[.46,.52],[.5,.56],[.54,.52]],[[.5,.66],[.5,.9],[.8,.92]]],c:[[.42,.4,.03],[.58,.4,.03]]},
{id:'sun',ru:'Солнышко',en:'The sun',p:[[[.5,.12],[.5,.24]],[[.5,.76],[.5,.88]],[[.12,.5],[.24,.5]],[[.76,.5],[.88,.5]],[[.23,.23],[.31,.31]],[[.69,.69],[.77,.77]],[[.77,.23],[.69,.31]],[[.31,.69],[.23,.77]],[[.4,.56],[.5,.62],[.6,.56]]],c:[[.5,.5,.22],[.43,.45,.025],[.57,.45,.025]]},
{id:'house',ru:'Наш дом',en:'Our block',p:[[[.2,.45],[.5,.15],[.8,.45]],[[.25,.42],[.25,.88],[.75,.88],[.75,.42]],[[.44,.88],[.44,.68],[.56,.68],[.56,.88]],[[.32,.5],[.42,.5],[.42,.6],[.32,.6],[.32,.5]],[[.58,.5],[.68,.5],[.68,.6],[.58,.6],[.58,.5]],[[.66,.3],[.66,.18],[.72,.18],[.72,.36]]],c:[]},
{id:'klass',ru:'Классики',en:'Hopscotch',p:[[[.4,.9],[.6,.9],[.6,.75],[.4,.75],[.4,.9]],[[.4,.75],[.4,.6],[.6,.6],[.6,.75]],[[.3,.6],[.3,.45],[.7,.45],[.7,.6],[.3,.6]],[[.5,.6],[.5,.45]],[[.4,.45],[.4,.3],[.6,.3],[.6,.45]]],c:[[.5,.2,.08]]},
{id:'shura',ru:'Портрет бабы Шуры',en:'Granny Shura’s portrait',p:[[[.3,.4],[.5,.15],[.7,.4]],[[.3,.4],[.25,.55],[.35,.5]],[[.7,.4],[.75,.55],[.65,.5]],[[.42,.62],[.5,.66],[.58,.62]],[[.35,.78],[.25,.92]],[[.65,.78],[.75,.92]]],c:[[.5,.5,.2],[.43,.46,.025],[.57,.46,.025],[.5,.2,.05]]},
{id:'car',ru:'Копейка деда',en:'Grandad’s Lada',p:[[[.15,.62],[.15,.5],[.3,.48],[.38,.32],[.64,.32],[.72,.48],[.86,.5],[.86,.62],[.15,.62]],[[.4,.36],[.4,.48]],[[.6,.36],[.6,.48]]],c:[[.3,.64,.07],[.7,.64,.07]]},
{id:'flower',ru:'Ромашка',en:'A daisy',p:[[[.5,.6],[.5,.92]],[[.5,.8],[.36,.7]],[[.5,.84],[.64,.74]]],c:[[.5,.4,.07],[.5,.22,.08],[.5,.58,.06],[.33,.4,.08],[.67,.4,.08],[.38,.27,.07],[.62,.27,.07],[.38,.53,.07],[.62,.53,.07]]},
{id:'heart',ru:'«Вова + Света»',en:'“Vova + Sveta”',p:[[[.5,.82],[.22,.5],[.22,.32],[.36,.22],[.5,.32],[.64,.22],[.78,.32],[.78,.5],[.5,.82]],[[.42,.48],[.58,.48]],[[.5,.4],[.5,.56]]],c:[]},
{id:'fish',ru:'Рыба деда',en:'Grandad’s fish',p:[[[.18,.5],[.35,.32],[.6,.3],[.75,.5],[.6,.7],[.35,.68],[.18,.5]],[[.75,.5],[.9,.36],[.9,.64],[.75,.5]],[[.45,.36],[.5,.5],[.45,.64]]],c:[[.28,.46,.025]]}];
function chalkSlot(idx){return idx>=7&&((idx*3266489917)>>>0)%4===1;}
function chalkPick(idx,have){var free=[];for(var i=0;i<CHALK.length;i++)if(!have||have.indexOf(CHALK[i].id)<0)free.push(i);if(!free.length)return idx%CHALK.length;return free[(idx*5)%free.length];}
var DED={T:20,lanes:3,sp:.32,gap:1.6};
function dedPlan(seed){var R=rng(seed),o=[],t=1.2,last=-1;while(t<DED.T-1.5){var l=ri(R,3);if(l===last&&R()<.6)l=(l+1)%3;o.push({t:t,l:l,c:ri(R,6)});last=l;
if(R()<.25&&t>4){var l2=(l+1+ri(R,2))%3;o.push({t:t,l:l2,c:ri(R,6)});}t+=DED.gap+R()*.8;}return o;}
function dedOk(o){var by={};o.forEach(function(e){var k=e.t.toFixed(2);(by[k]=by[k]||{})[e.l]=1;});for(var k in by)if(Object.keys(by[k]).length>=3)return false;return true;}
function dedSlot(idx){return idx>=19&&idx%10===9;}
var FINDS2=[
['Ключ от гаража №12','The key to garage No. 12','Михалыч третий день ищет. Отдам — с него банка огурцов.','Mikhalych has been looking for three days. He owes me a jar of pickles.'],
['Пуговица от пальто','A coat button','Большая, драповая. Чья-то бабушка без пуговицы ходит.','A big wool one. Someone’s granny is walking around without it.'],
['Билет на электричку','A suburban train ticket','До Петушков. Ну, это судьба такая.','To the end of the line. Well, that’s fate.'],
['Значок «ГТО»','A “Ready for Labour” badge','Золотой! Кто-то в молодости бегал быстрее этих машин.','Gold! Someone used to run faster than these cars.'],
['Совок из песочницы','A sandpit spade','Красный. Петенька обыскался, весь двор плакал.','A red one. Little Petya cried the whole yard down.'],
['Мелочь — 37 копеек','Small change — 37 kopecks','На батон хватит. Если батон из прошлого века.','Enough for a loaf. A loaf from last century.'],
['Очки в роговой оправе','Horn-rimmed glasses','Вот почему Валерка вчера в столб въехал.','So that’s why Valerka hit the post yesterday.'],
['Кассета «Ласковый май»','A cassette tape of 80s pop','Плёнку отмотаю карандашом — и на лавочку, к магнитофону.','I’ll rewind it with a pencil — and off to the bench boombox.'],
['Варежка на резинке','A mitten on a string','Одна. Вторая, видать, на другом ребёнке.','Just one. The other’s probably still on the child.'],
['Пробка от «Буратино»','A lemonade bottle cap','Сладкое детство под колесом нашлось.','A sweet childhood found under a wheel.'],
['Квитанция за свет','An electricity bill','Неоплаченная. Ох, кому-то будет разговор.','Unpaid. Oh, somebody’s in for a talking-to.'],
['Шахматный конь','A chess knight','Белый. Дед с Михалычем партию без него доигрывали.','A white one. Grandad and Mikhalych finished the game without it.'],
['Губная гармошка','A harmonica','Сыграть, что ли? Нет, соседи спят.','Shall I play it? No, the neighbours are asleep.'],
['Рецепт пирожков','A pie recipe','Почерк Зинин! А мне говорила — секрет.','Zina’s handwriting! And she told me it was a secret.'],
['Блесна','A fishing lure','Дедова. Он из-за неё на рыбалку не поехал.','Grandad’s. He skipped fishing because of it.'],
['Фантик «Красная шапочка»','A candy wrapper','Кто-то под машиной конфеты ел. Хитрец.','Someone ate sweets under a car. Sly one.'],
['Резинка для волос','A hair tie','С бантиком. Дочка Светы обыскалась.','With a bow. Sveta’s daughter has been searching everywhere.'],
['Свисток','A whistle','Не мой, мой при мне. Физрук, что ли, обронил?','Not mine, mine’s right here. The PE teacher’s?'],
['Открытка к 8 Марта','A Women’s Day card','«Любимой соседке». Без подписи. Ой.','“To my favourite neighbour.” Unsigned. Oh my.'],
['Солдатик','A toy soldier','Оловянный, с винтовкой. Стоял на посту под «Волгой».','A tin one with a rifle. On guard under the Volga.'],
['Колпачок от ручки','A pen cap','Погрызенный. Кто-то отчёт писал, нервничал.','Chewed. Someone was writing a report, nervously.'],
['Значок «Олимпиада-80»','An Olympics-80 pin','С мишкой! Это ж реликвия, в рамку надо.','With the bear! That’s a relic, it needs a frame.'],
['Брелок-фонарик','A keyring torch','Светит! Вот тебе и подсветка под машиной.','It works! That’s under-car lighting for you.'],
['Мячик для пинг-понга','A ping-pong ball','Укатился в прошлом июне. Терпеливо ждал.','Rolled away last June. Waited patiently.'],
['Ложка','A spoon','Алюминиевая. Кто-то ел прямо на капоте.','Aluminium. Someone ate right off the bonnet.'],
['Ключ на 13','A 13 mm spanner','Без ключа на 13 мужики со двора не уезжают.','No man leaves this yard without a 13 mm spanner.'],
['Талон на бензин','A petrol coupon','Старый. Сейчас за него разве что улыбнутся.','An old one. Today it only buys you a smile.'],
['Бигуди','A hair curler','Розовое. Утро у кого-то было торопливое.','A pink one. Someone had a hurried morning.'],
['Монетка 1961 года','A 1961 coin','Ровесница Гагарина в космосе. Беречь!','The same age as Gagarin’s flight. Keep it safe!'],
['Пульт от телевизора','A TV remote','Вот почему у Толика весь вечер футбол шёл.','So that’s why Tolik had football on all evening.'],
['Записка «Купи хлеба»','A note: “Buy bread”','Не купил, раз записка тут. Ох, будет ему.','He didn’t, since the note is here. He’s in for it.'],
['Карамелька «Барбарис»','A barberry candy','В фантике, целая. Сама съем, заслужила.','Still wrapped. I’ll eat it myself — I’ve earned it.'],
['Компас','A compass','Север — там, где гараж Михалыча. Всегда знала.','North is where Mikhalych’s garage is. Always knew it.'],
['Наклейка с Чебурашкой','A Cheburashka sticker','Прилеплю на лавочку. Пусть сидит с нами.','I’ll stick it on the bench. He can sit with us.'],
['Ниточка с иголкой','A needle and thread','Хорошо, что я нашла, а не колесо.','Good thing I found it and not a tyre.'],
['Камешек с дыркой','A stone with a hole','Куриный бог! На счастье. Повешу на гвоздик.','A hag stone! For luck. I’ll hang it on a nail.'],
['Бумажный кораблик','A paper boat','Плыл по луже, приплыл под «Москвич».','Sailed the puddle, docked under the Moskvich.'],
['Чек из гастронома','A grocery receipt','Кефир, батон, шпроты. Холостяк, по чеку видно.','Kefir, bread, sprats. A bachelor, judging by the receipt.'],
['Расчёска','A comb','Гребешок карманный. Причешу Барсика.','A pocket comb. I’ll groom Whiskers.'],
['Значок «Отличник ГАИ»','A “Model Driver” badge','Ирония — под машиной, которая встала поперёк.','The irony — under the car parked sideways.'],
['Пачка семечек','A bag of sunflower seeds','Нераспечатанная! Вечером — на лавочку.','Unopened! The bench, this evening.'],
['Ключ от почтового ящика','A mailbox key','Маленький. Квартира 34, по бирке. Отнесу.','A tiny one. Flat 34, says the tag. I’ll take it up.'],
['Фишка от лото','A bingo counter','«Барабанные палочки» — одиннадцать! Без неё не играли.','“Legs eleven”! The game stalled without it.'],
['Зажигалка-пистолет','A toy-gun lighter','Отдам участковому. Пусть разбирается.','I’ll give it to the beat officer. His problem.'],
['Лента от выпускного','A graduation sash','«Выпускник-1987». Растрогалась.','“Class of 1987.” I’m all emotional.'],
['Кусок мела','A piece of chalk','Так вот кто тут рисует! Положу обратно — пусть рисуют.','So that’s who draws here! I’ll put it back.'],
['Пипетка','A dropper','Капли от насморка, видать, кто-то закапывал на бегу.','Someone was doing nose drops on the run.'],
['Билет в кино','A cinema ticket','«Москва слезам не верит», 7-й ряд. Классика.','A classic film, row 7. Good choice.'],
['Брошка-стрекоза','A dragonfly brooch','Красивая! Зина такую на праздник носит.','Lovely! Zina wears one like it on holidays.'],
['Колокольчик от велосипеда','A bicycle bell','Дзынь! Вот кто по утрам не звонил.','Ding! So that’s why nobody rang in the mornings.'],
['Кнопка от куртки','A jacket snap','Металлическая. Всё под машинами теряется, всё.','Metal. Everything gets lost under cars, everything.'],
['Значок «Турист СССР»','A “Soviet Tourist” badge','Кто-то в походы ходил, а теперь пешком до гаража.','Someone used to go hiking; now it’s just to the garage.'],
['Пакетик чая','A teabag','Целый. Чайку попью за находку.','A whole one. I’ll have a cuppa for the find.'],
['Магнитик «Сочи»','A Sochi fridge magnet','С холодильника на колесо, с колеса — ко мне.','From fridge to tyre, from tyre to me.'],
['Деревянная катушка','A wooden spool','Ниток нет, но в хозяйстве сгодится.','No thread, but it’ll come in handy.'],
['Пистон для пугача','A cap-gun cap','Хлопнул бы — да машины жалко пугать.','I’d pop it, but it would scare the cars.'],
['Значок «Ударник»','A “Shock Worker” badge','Под машиной ударник, а над ней — лентяй.','A shock worker under the car, a slacker above it.'],
['Резиновый утёнок','A rubber duck','Пищит! Значит, внуки к кому-то приезжали.','It squeaks! Somebody’s grandkids were visiting.'],
['Квитанция из химчистки','A dry-cleaning ticket','Костюм так и не забрали. Третий месяц висит.','The suit was never collected. Three months now.'],
['Ручка-шестицветка','A six-colour pen','Мечта школьника! Синий кончился.','Every schoolkid’s dream! The blue’s run out.'],
['Шайба','A hockey puck','Зимой гоняли, весной под машину закатилась.','Played in winter, rolled under a car by spring.'],
['Подкова-брелок','A horseshoe keyring','На счастье. Хозяину, видать, его не хватило.','For luck. Seems the owner ran short of it.'],
['Рулетка','A tape measure','Три метра. Место измеряли — не хватило.','Three metres. They measured the spot — not enough.'],
['Обёртка от пломбира','An ice-cream wrapper','48 копеек. Цена — как воспоминание.','48 kopecks. The price is a memory itself.'],
['Крышечка от кефира','A kefir bottle top','Зелёная фольга. Кефир с утра — правильно.','Green foil. Kefir in the morning — sensible.'],
['Значок «Космос»','A space badge','С ракетой. Может, хозяин в космонавты метил.','With a rocket. Maybe the owner dreamed of space.'],
['Тетрадный листок','A notebook page','«Дважды два — четыре». Под колесом — не поспоришь.','“Two times two is four.” No arguing with a tyre.'],
['Жёлудь','An acorn','Откуда? Дубов во дворе нет. Белка подкинула.','Where from? No oaks here. A squirrel left it.'],
['Кулон-сердечко','A heart pendant','Открывается! Внутри фото. Отдам лично в руки.','It opens! A photo inside. I’ll hand it over personally.'],
['Свечка с торта','A birthday candle','Цифра 5. У кого-то праздник был, поздравим.','A number 5. Someone had a birthday — congrats.'],
['Пружинка','A little spring','От чего — непонятно. Но без неё что-то не работает.','From what, who knows. But something won’t work now.'],
['Шнурок','A shoelace','Один. Кто-то домой в одном ботинке прыгал.','Just one. Someone hopped home in one shoe.'],
['Сушка','A bread ring','Твёрдая, как асфальт. Голубям раскрошу.','Hard as asphalt. I’ll crumble it for the pigeons.'],
['Фотоплёнка','A roll of film','Непроявленная! Тайна двора. Отнесу в фотоателье.','Undeveloped! A yard mystery. To the photo shop.'],
['Значок «Донор»','A “Blood Donor” badge','Хороший человек обронил. Вернём с почётом.','A good person dropped it. We’ll return it with honours.'],
['Ключик от заводной машинки','A wind-up toy key','Машинка, видать, во дворе где-то стоит. Заведём!','The toy car must be parked somewhere. Let’s wind it!'],
['Пуговица-звёздочка','A star-shaped button','С детской курточки. Мамы, проверьте рукава!','From a kid’s jacket. Mums, check your sleeves!'],
['Фантик «Мишка косолапый»','A teddy-bear candy wrapper','Опять конфеты под машиной. Кто-то тут живёт?','Sweets under the car again. Does someone live here?'],
['Письмо без марки','A letter without a stamp','«Дорогая Галя…» Не читаю! Отнесу на почту.','“Dear Galya…” I’m not reading it! To the post office.'],
['Медаль «За победу в шашках»','A draughts tournament medal','Дворовый чемпионат 1979-го. Чемпион ещё жив!','The 1979 yard championship. The champion’s still around!']];
function findsAdd(arr){if(!arr||!arr.length||arr.__v3dt)return 0;var n=0;FINDS2.forEach(function(f){arr.push(f);n++;});try{Object.defineProperty(arr,'__v3dt',{value:1});}catch(e){arr.__v3dt=1;}return n;}
function lifeOf(t,joke){var n=String(t||'').length;return joke?Math.min(30,8+.2*n):Math.min(20,5+.12*n);}
var DENSE={from:220,w:10,h:14,wR:9,hR:12,wB:11,hB:15,fill:.95,fR:.78,fBoss:.03,avgL:3.1,maxLen:6,dMin:13,qStep:30,qMax:4,fr:.06,frB:.05};
var V3DT={rng:rng,field:field,fcopy:fcopy,free:free,rm:rm,frees:frees,left:left,DIRS:DIRS,
RAIN:RAIN,rainSlot:rainSlot,rainNeed:rainNeed,WAKE:WAKE,wakeSlot:wakeSlot,wakeOrder:wakeOrder,wakeNext:wakeNext,wakeInit:wakeInit,wakePlay:wakePlay,
CHALK:CHALK,chalkSlot:chalkSlot,chalkPick:chalkPick,DED:DED,dedPlan:dedPlan,dedOk:dedOk,dedSlot:dedSlot,FINDS2:FINDS2,findsAdd:findsAdd,lifeOf:lifeOf,DENSE:DENSE};
if(typeof module!=='undefined'&&module.exports)module.exports=V3DT;
root.V3DT=V3DT;
})(typeof window!=='undefined'?window:this);
if(typeof window!=='undefined')(function(){
var WN=window,V=WN.V3DT;if(!WN.V3K)return;
function curG(){try{return G;}catch(e){return null;}}
function Sv(){try{return S;}catch(e){return null;}}
function Lg(ru,en){try{return L(ru,en);}catch(e){return ru;}}
function now(){return(WN.performance?performance.now():Date.now())/1000;}
function calm(){try{return!!(S.calm||WN.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}}
function low(){try{return!!LOW;}catch(e){return false;}}
function warn(w,e){try{console.warn('v3-deep-tails',w,e&&e.message);}catch(x){}}
function ev(o){try{if(WN.V3&&V3.ev)V3.ev('dt',o);}catch(e){}}
function sv(){try{save();}catch(e){}}
function esc(s){try{return UI.esc(s);}catch(e){return String(s);}}
var PARTS={rain:'Дождь пошёл (8 машин за 10 касаний)',uncle:'Место «на дядю» в кармане/стоянке',marsh:'Тройка = маршрутка',chalk:'Мелки на асфальте',
finds:'Находки до 120',ded:'Дед за рулём',wake:'Двор просыпается',dense:'Ветеранские дворы плотнее (дворы 221+)'};
function is(k){try{if(WN.V3&&V3.reg){return V3.is('deep')&&V3.is('deep.'+k);}}catch(e){}
try{var m=/[?&]off=([^&#]*)/.exec(location.search||'');if(m){var a=decodeURIComponent(m[1]).split(',');if(a.indexOf('v3')>=0||a.indexOf('v3.deep')>=0||a.indexOf('v3.deep.'+k)>=0)return false;}}catch(e){}
return k!=='dense';}
try{if(WN.V3&&V3.reg)for(var pk in PARTS)V3.reg('deep.'+pk,{s:'DEEP',t:PARTS[pk]});}catch(e){}
function D3(){var s=Sv();if(!s)return null;if(!s.v3d3||typeof s.v3d3!=='object')s.v3d3={rn:0,rf:0,mr:0,ch:[],dd:[],wk:0};return s.v3d3;}
function fix3(v){if(!v||typeof v!=='object')v={};['rn','rf','mr','wk'].forEach(function(k){v[k]=Math.max(0,+v[k]||0);});
v.ch=Array.isArray(v.ch)?v.ch.filter(function(x){return typeof x==='string';}).slice(0,30):[];v.dd=Array.isArray(v.dd)?v.dd.filter(function(x){return x===+x;}).slice(0,40):[];return v;}
function uni(a,b){var o=(a||[]).slice();(b||[]).forEach(function(x){if(o.indexOf(x)<0)o.push(x);});return o;}
try{if(WN.V3&&V3.field)V3.field('v3d3',{s:'DEEP',def:{rn:0,rf:0,mr:0,ch:[],dd:[],wk:0},fix:fix3,
merge:function(a,b){a=fix3(a);b=fix3(b);return{rn:Math.max(a.rn,b.rn),rf:Math.max(a.rf,b.rf),mr:Math.max(a.mr,b.mr),wk:Math.max(a.wk,b.wk),ch:uni(a.ch,b.ch),dd:uni(a.dd,b.dd)};}});}catch(e){warn('field',e);}
function sayL(t,joke,where){var g=curG();if(!g||!t)return;try{say(t,where||'bench');var b=g.bubbles&&g.bubbles[0];if(b&&b.text===t)b.life=V.lifeOf(t,joke);}catch(e){}}
function tst(t,ms){try{toast(t,ms||3200);}catch(e){}}
var DENSE=V.DENSE;
function denseP(p,i){var D=DENSE,k=i%10,boss=k===9,rest=k<2,pre=k===8,q=Math.min(D.qMax,Math.floor((i-D.from)/D.qStep));
p.w=rest?D.wR:boss?D.wB:D.w;p.h=rest?D.hR:boss?D.hB:D.h;p.maxLen=D.maxLen;p.bias=1;
var fill=rest?D.fR:Math.min(.97,D.fill+(boss?D.fBoss:0)+(pre?.02:0));
p.n=Math.max(8,Math.round(p.w*p.h*fill/D.avgL));
if(!rest){p.minDepth=Math.max(p.minDepth,D.dMin+q+(boss?2:0)+(pre?1:0));p.freeMax=Math.min(p.freeMax,boss?D.frB:D.fr);}
p.v3dense=1;return p;}
try{var lp0=WN.levelParams;if(typeof lp0==='function'){WN.levelParams=function(i){var p=lp0.apply(this,arguments);
try{if(p&&+i>=DENSE.from&&is('dense'))p=denseP(p,+i);}catch(e){warn('dense',e);}return p;};}}catch(e){warn('dense0',e);}
try{if(is('finds')&&WN.__v3h&&Array.isArray(__v3h.find))V.findsAdd(__v3h.find);}catch(e){warn('finds',e);}
var K={};['begin','intro','pre','post','towOk','onTow','revive','loseLine','stars','noWave','hintPick','botPick','botStep','res','draw'].forEach(function(n){K[n]=V3K[n];});
function W8(g){return!!(g&&g.v3k&&g.v3k.t&&g.v3t&&g.v3t.wake);}
function place(g){var k=g&&g.v3k;return k&&!k.t&&!k.h&&!k.d&&(k.kind==='pocket'||k.kind==='shop')?k:null;}
function exitN(g){var n=0;g.vs.forEach(function(v){if(v.state==='exit'||v.state==='gone'||v.state==='tow')n++;});return n;}
V3K.begin=function(g,lv,idx,seed,daily,o){if(K.begin)K.begin.apply(this,arguments);try{tBegin(g,idx,seed,daily,o);}catch(e){warn('begin',e);if(g.v3k&&g.v3k.t)g.v3k=null;g.v3t={};}};
function tBegin(g,idx,seed,daily,o){g.v3t={};if(daily||o||WN.__demo)return;
if(g.v3k)return;
var H=g.v3h,busy=!!(H&&(H.goal||H.M&&H.M.role&&H.M.role.some(function(r){return r;})));
if(is('chalk')&&V.chalkSlot(idx)){var d=D3();g.v3t.chalk={pic:V.chalkPick(idx,d&&d.ch)};}
if(is('wake')&&V.wakeSlot(idx)&&!g.amb&&!(g.police>=0)&&!g.hz&&!busy){wakeOn(g,idx,seed);if(g.v3t.wake)return;}
if(is('rain')&&V.rainSlot(idx)&&!g.amb&&!(H&&H.goal))g.v3t.rain={st:0};}
function wakeOn(g,idx,seed){var F=V3K.fieldOfG(g),ord=V.wakeOrder(F,V.rng((seed|0)*53+idx*29+3));if(!ord)return false;
var W=V.wakeInit(F,ord);W.walk=[];W.dc={};g.v3t.wake=W;g.v3k={kind:'wake',t:1};
g.vs.forEach(function(v){if(!W.aw[v.id])sleep(v,W);});try{carsKey='';}catch(e){}
ev({a:'wake',i:idx+1,n:g.vs.length});return true;}
WN.V3DT.wake=function(g){g=g||curG();if(!g||g.v3k||!is('wake'))return false;g.v3t=g.v3t||{};return wakeOn(g,g.idx||0,(g.idx||0)+1);};
function sleep(v,W){W.dc[v.id]={dc:v.dc,dl:v.dl,rf:v.rf,ed:v.ed};try{tint(v,shade(v.dc||v.color,-.42));}catch(e){}}
function wakeCar(g,W,i){var v=g.vs[i],o=W.dc[i];if(v&&o){v.dc=o.dc;v.dl=o.dl;v.rf=o.rf;v.ed=o.ed;}try{carsKey='';}catch(e){}
W.walk.push({i:i,t0:now()});}
function wakeGone(g,id){var W=g.v3t&&g.v3t.wake;if(!W||!W.al[id])return;W.al[id]=0;if(!W.aw[id]){W.aw[id]=1;var o=W.dc[id];var v=g.vs[id];if(v&&o){v.dc=o.dc;v.dl=o.dl;v.rf=o.rf;v.ed=o.ed;}}
var n=V.wakeNext(W);if(n>=0)wakeCar(g,W,n);}
function awakeFree(g){var W=g.v3t.wake,w=g.p.w,h=g.p.h;return g.vs.filter(function(u){return u.state==='idle'&&W.aw[u.id]&&canExit(u,g.occ,w,h,u.id).free;});}
function wakePick(g,cand){var W=g.v3t.wake,best=null,bk=1e9;(cand||[]).forEach(function(v){if(!W.aw[v.id])return;var k=W.ord.indexOf(v.id);if(k<bk){bk=k;best=v;}});return best;}
var WK_INTRO=[['🌅 Двор просыпается: машины спят, пока водитель не выйдет из подъезда. Уехала одна — выходит следующий!','🌅 The yard wakes up: cars sleep until their driver comes out. One leaves — the next driver comes down!'],
['Утро, а они спят! Ничего, по одному спустятся — я их знаю.','Morning, and they’re all asleep! They’ll come down one by one — I know them.']];
function wakeIntro(g){var s=Sv(),first=s&&s.tipSeen&&!s.tipSeen.v3wake;if(first){s.tipSeen.v3wake=1;sv();tst(Lg(WK_INTRO[0][0],WK_INTRO[0][1]),4500);}
setTimeout(function(){if(curG()===g&&!g.over)sayL(Lg(WK_INTRO[1][0],WK_INTRO[1][1]),true);},900);}
var SLEEPY=[['Водитель ещё не вышел — спит, поди.','The driver isn’t out yet — still asleep, I bet.'],['Без водителя не поедет! Жди, сейчас спустится.','No driver, no drive! Wait, he’s coming down.'],['Эта спит. Буди тех, у кого водитель уже тут.','This one’s asleep. Go for the ones whose driver is here.']];
V3K.intro=function(){var g=curG();if(W8(g))return wakeIntro(g);return K.intro&&K.intro.apply(this,arguments);};
V3K.pre=function(v){var g=curG();if(W8(g)){var W=g.v3t.wake;if(!W.aw[v.id]){var t=SLEEPY[(W.sl=(W.sl||0)+1)%SLEEPY.length];sayL(Lg(t[0],t[1]),false);try{SND.tap();}catch(e){}v.flash=.6;return true;}return false;}
var P=place(g);if(P&&!P.unc&&is('uncle')&&K.towOk&&!K.towOk.call(this,v))uncle(g,P);
var tr=P&&P.tripT,r=K.pre.apply(this,arguments);if(P&&P.kind==='shop'&&P.tripT!==tr)marsh(g,P);return r;};
V3K.post=function(v){var g=curG();if(W8(g)){wakeGone(g,v.id);return;}var r=K.post.apply(this,arguments);afterDead(g);return r;};
V3K.towOk=function(v){var g=curG();if(W8(g))return true;return K.towOk.apply(this,arguments);};
V3K.onTow=function(v){var g=curG();if(W8(g)){wakeGone(g,v.id);return;}var P=place(g),tr=P&&P.tripT,r=K.onTow.apply(this,arguments);if(P&&P.kind==='shop'&&P.tripT!==tr)marsh(g,P);afterDead(g);return r;};
V3K.revive=function(g){if(W8(g))return;return K.revive.apply(this,arguments);};
V3K.loseLine=function(){return K.loseLine.apply(this,arguments);};
V3K.stars=function(g){if(W8(g))return 3;var s=K.stars.apply(this,arguments),P=place(g);return P&&P.unc?Math.min(2,s):s;};
V3K.noWave=function(){var g=curG();if(W8(g))return false;return K.noWave.apply(this,arguments);};
V3K.hintPick=function(cand){var g=curG();if(W8(g))return wakePick(g,cand);return K.hintPick.apply(this,arguments);};
V3K.botPick=function(){var g=curG();if(W8(g)){if(g.over)return null;return wakePick(g,awakeFree(g));}return K.botPick.apply(this,arguments);};
V3K.botStep=function(g){g=g||curG();if(W8(g))return false;return K.botStep?K.botStep.apply(this,arguments):false;};
V3K.res=function(g){if(W8(g))return 0;return K.res.apply(this,arguments);};
V3K.draw=function(c,Wd,Hd,t){var g=curG();if(W8(g))return;var r=K.draw.apply(this,arguments);try{marshDraw(c,Wd,Hd,g);}catch(e){warn('mdraw',e);}return r;};
var UNC=[['Ставь сюда, на дядино место! Раз в день можно — я договорилась.','Put it here, in my nephew’s spot! Once a day is fine — I’ve arranged it.'],
['Это место я племяннику держала. Ладно уж, бери — только один раз!','I was keeping that spot for my nephew. Fine, take it — just this once!']];
function uncle(g,P){P.unc=1;if(P.kind==='pocket')P.L.K++;else P.L.cap++;var t=UNC[(g.idx||0)%UNC.length];
tst(P.kind==='pocket'?Lg('🧓 Место «на дядю»: +1 в кармане (раз за двор, не выше ★★)','🧓 The “nephew’s spot”: +1 pocket space (once per yard, max ★★)'):Lg('🧓 Место «на дядю»: +1 на стоянке (раз за двор, не выше ★★)','🧓 The “nephew’s spot”: +1 parking space (once per yard, max ★★)'),3500);
setTimeout(function(){if(curG()===g)sayL(Lg(t[0],t[1]),true);},400);ev({a:'uncle',k:P.kind,i:(g.idx||0)+1});}
function afterDead(g){var P=place(g);if(!P||!g||g.v3dead!==1||P.unc||!is('uncle'))return;g.v3dead=0;g.over=false;uncle(g,P);}
function marsh(g,P){if(!is('marsh'))return;P.mar=(P.mar||0)+1;P.marT=now();P.marN=1+((g.idx||0)*7+P.mar*13)%97;try{SND.coin();}catch(e){}
if(P.mar===5){var s=Sv(),d=D3();if(d){d.mr++;}
if(s&&!s.freeHint){s.freeHint=1;tst(Lg('🚌 Пятая маршрутка! Премия от Шуры — бесплатная подсказка','🚌 Fifth minibus! Shura’s bonus — a free hint'),3500);try{updCoins();}catch(e){}}
else tst(Lg('🚌 Пятая маршрутка! Шура аплодирует','🚌 Fifth minibus! Shura applauds'),3000);
sv();setTimeout(function(){if(curG()===g)sayL(Lg('Пять маршруток! Ты как диспетчер автобазы!','Five minibuses! You’re like a depot dispatcher!'),true);},500);ev({a:'marsh5',i:(g.idx||0)+1});}}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function marshDraw(c,Wd,Hd,g){var P=place(g);if(!P||P.kind!=='shop'||!P.mar||!is('marsh'))return;var hh=K.res(g)||0,y0=Hd-hh,t=now()-(P.marT||0);
c.save();c.font='800 12px Rubik,-apple-system,sans-serif';c.textAlign='right';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.45)';var lb='🚌 ×'+P.mar+(P.mar<5?'/5':'');c.strokeText(lb,Wd-10,y0+13);c.fillStyle='#fff';c.fillText(lb,Wd-10,y0+13);
if(t<.6){var q=calm()?.5:t/.6,bw=64,bh=26,x=-bw+(Wd+bw)*q,y=y0+hh*.55-bh/2;c.globalAlpha=calm()?1-t/.6:1;rr(c,x,y,bw,bh,6);c.fillStyle='#f6c90e';c.fill();c.strokeStyle='#7a5c00';c.lineWidth=2;c.stroke();
c.fillStyle='#bfe3ff';for(var k=0;k<3;k++){rr(c,x+6+k*15,y+4,11,9,2);c.fill();}c.fillStyle='#2d3436';c.textAlign='center';c.font='900 10px Rubik,-apple-system,sans-serif';c.fillText('№'+P.marN,x+bw-12,y+bh-7);
c.beginPath();c.arc(x+14,y+bh,4,0,7);c.arc(x+bw-14,y+bh,4,0,7);c.fill();}
c.restore();}
var RAIN_T={go:['☔ Дождь пошёл! За {t} касаний должны уехать {n} машин — жильцы бегут к машинам!','☔ It’s raining! {n} cars must leave within {t} taps — everyone’s running to their cars!'],
ok:[['Успели! Все сухие — молодец!','Made it! Everyone’s dry — well done!'],['Вот это скорость! Ни одна шляпа не намокла.','What speed! Not a single hat got wet.']],
no:[['Промокли все из-за тебя! Ладно, высохнут…','Everyone’s soaked because of you! Oh well, they’ll dry…'],['Ну вот, Зина с причёской — как мокрая курица. Ой, не говори ей!','Look at Zina’s hairdo — like a wet hen. Oh, don’t tell her I said that!']]};
var U0=WN.update;
if(typeof U0==='function')WN.update=function(dt){var r=U0.apply(this,arguments);try{tick();}catch(e){warn('tick',e);}return r;};
function tick(){var g=curG();if(!g||!g.v3t)return;var R=g.v3t.rain;
if(R&&!g.over){
if(R.st===0&&g.moves>=V.RAIN.after&&!(typeof modalOn!=='undefined'&&modalOn)){var F=V3K.fieldOfG(g),q=V.rainNeed(F);
if(!q.ok||q.need<4){R.st=-2;return;}R.st=1;R.need=q.need;R.taps=q.taps;R.m0=g.moves;R.e0=exitN(g);R.t0=now();
tst(Lg(RAIN_T.go[0],RAIN_T.go[1]).replace('{t}',R.taps).replace('{n}',R.need),4000);try{SND.horn();}catch(e){}ev({a:'rain',i:g.idx+1,n:R.need});}
else if(R.st===1){var ex=exitN(g)-R.e0;R.ex=ex;
if(ex>=R.need)rainEnd(g,R,true);else if(g.moves-R.m0>=R.taps&&!g.vs.some(function(v){return v.state==='exit';}))rainEnd(g,R,false);}}}
function rainEnd(g,R,ok){R.st=ok?2:-1;R.t1=now();var d=D3();if(d){if(ok)d.rn++;else d.rf++;sv();}var a=ok?RAIN_T.ok:RAIN_T.no,t=a[(g.idx||0)%a.length];
setTimeout(function(){if(curG()===g)sayL(Lg(t[0],t[1]),!ok,'win');},300);ev({a:'rainEnd',ok:ok?1:0,i:g.idx+1});}
function chalkDraw(c,g){var C=g.v3t&&g.v3t.chalk;if(!C)return;var P=V.CHALK[C.pic];if(!P)return;var w=g.p.w,h=g.p.h,s=Math.min(w,h)*cs*.92,x0=ox+(w*cs-s)/2,y0=oy+(h*cs-s)/2;
c.save();c.strokeStyle='rgba(255,255,255,.62)';c.lineWidth=Math.max(2,cs*.09);c.lineCap='round';c.lineJoin='round';
P.p.forEach(function(L){c.beginPath();L.forEach(function(p,k){var x=x0+p[0]*s,y=y0+p[1]*s;if(k)c.lineTo(x,y);else c.moveTo(x,y);});c.stroke();});
(P.c||[]).forEach(function(q){c.beginPath();c.arc(x0+q[0]*s,y0+q[1]*s,q[2]*s,0,7);c.stroke();});c.restore();}
function overDraw(c,g,t){var X=g.v3t;if(!X)return;var W=X.wake;
if(W){c.save();c.textAlign='center';c.textBaseline='middle';c.font='800 '+Math.round(cs*.36)+'px Rubik,-apple-system,sans-serif';
g.vs.forEach(function(v){if(v.state!=='idle'||W.aw[v.id])return;var m=v.cells[Math.floor(v.cells.length/2)],p=toPx(m),b=calm()?0:Math.sin(t*2+v.id)*cs*.06;c.fillStyle='rgba(255,255,255,.9)';c.fillText('💤',p[0],p[1]-cs*.2+b);});
var A=(g.anc&&g.anc.bench&&g.anc.bench[0])||[ox+g.p.w*cs/2,oy-cs*.5],tn=now();
W.walk=W.walk.filter(function(k){var q=(tn-k.t0)/.8;if(q>=1)return false;var v=g.vs[k.i];if(!v)return false;var p=toPx(v.cells[0]),x=A[0]+(p[0]-A[0])*q,y=A[1]+(p[1]-A[1])*q,r=cs*.16;
c.globalAlpha=1-q*.3;c.fillStyle='#2d3436';c.beginPath();c.arc(x,y-r*1.6,r*.7,0,7);c.fill();c.fillStyle='#e17055';rr(c,x-r*.7,y-r,r*1.4,r*1.8,r*.4);c.fill();c.globalAlpha=1;return true;});
c.restore();}
var R=X.rain;if(R&&(R.st===1||(R.st===2||R.st===-1)&&now()-R.t1<2)){var w=g.p.w*cs,h=g.p.h*cs,n=low()||calm()?18:60,fall=calm()?0:t;
c.save();c.strokeStyle='rgba(170,200,255,'+(R.st===1?.55:.3)+')';c.lineWidth=Math.max(1,cs*.03);c.beginPath();
for(var i=0;i<n;i++){var sx=((i*97.3)%1)*0+((i*0.6180339)%1)*w,sy=(((i*0.381966)%1)*h+fall*h*.9)%h;c.moveTo(ox+sx,oy+sy);c.lineTo(ox+sx-cs*.08,oy+sy+cs*.3);}c.stroke();
if(R.st===1){var lb='☔ '+Math.min(R.ex||0,R.need)+'/'+R.need+' · '+Lg('касаний ','taps ')+Math.max(0,R.taps-(g.moves-R.m0)),fs=Math.max(12,Math.round(cs*.32));c.font='800 '+fs+'px Rubik,-apple-system,sans-serif';
var tw=c.measureText(lb).width+16,x=ox+w/2-tw/2,y=oy+4;rr(c,x,y,tw,fs+10,(fs+10)/2);c.fillStyle='rgba(30,60,110,.82)';c.fill();c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(lb,ox+w/2,y+(fs+10)/2);}
c.restore();}}
if(WN.LVLH&&typeof LVLH.draw==='function'){var LD0=LVLH.draw;LVLH.draw=function(c,layer,t){var r=LD0.apply(this,arguments),g=curG();if(!g)return r;
try{if(layer==='under')chalkDraw(c,g);else if(layer==='over')overDraw(c,g,t);}catch(e){warn('draw',e);}return r;};}
WN.winSlots=WN.winSlots||[];
winSlots.push({id:'v3dt-res',order:26,zone:'goal',fit:6,render:function(){var g=curG();if(!g)return null;var out=[],X=g.v3t||{},d=D3();
if(X.chalk&&is('chalk')){var P=V.CHALK[X.chalk.pic];if(P&&d){if(!X.chalk.got){X.chalk.got=1;if(d.ch.indexOf(P.id)<0){d.ch.push(P.id);X.chalk.nw=1;sv();ev({a:'chalk',k:P.id});}}
out.push('🖍 '+Lg('Мелом на асфальте: ','Chalked on the asphalt: ')+'<b>'+esc(Lg(P.ru,P.en))+'</b>'+(X.chalk.nw?' ✨':'')+' <button class="btn sec sm noenter" id="v3dtAlb">'+Lg('Альбом ','Album ')+d.ch.length+'/'+V.CHALK.length+'</button>');}}
if(X.rain&&X.rain.st===2)out.push('☔ '+Lg('Успели до дождя — все сухие','Beat the rain — everyone’s dry'));
if(X.rain&&X.rain.st===-1)out.push('☔ '+Lg('Промокли… но двор свободен','Soaked… but the yard is clear'));
if(X.wake){if(!X.wkN&&d){X.wkN=1;d.wk++;sv();}out.push('🌅 '+Lg('Двор проснулся и разъехался','The yard woke up and drove off'));}
var P2=place(g);if(P2&&P2.mar)out.push('🚌 '+Lg('Маршруток за двор: ','Minibuses this yard: ')+P2.mar);
if(dedDue(g))out.push('<div id="v3dtDed">🚗 '+Lg('Дед просится за руль своей копейки!','Grandad wants to drive his old Lada!')+' <button class="btn accent sm noenter" id="v3dtDedGo">'+Lg('Прокатить деда','Take Grandad for a drive')+'</button></div>');
return out.length?'<div class="v3dtW" style="font-size:14px;line-height:1.35;margin:6px 0">'+out.join('<br>')+'</div>':null;},
mount:function(el){var b=el&&el.querySelector('#v3dtAlb');if(b)b.onclick=function(e){e.stopPropagation();album();};
var dg=el&&el.querySelector('#v3dtDedGo');if(dg)dg.onclick=function(e){e.stopPropagation();dedRun(el.querySelector('#v3dtDed'));};}});
function album(){var d=D3()||{ch:[]},rows=V.CHALK.map(function(P){var h=d.ch.indexOf(P.id)>=0;return'<div style="display:inline-block;width:46%;margin:4px 1%;padding:6px;border-radius:10px;background:rgba(60,70,80,'+(h?.85:.25)+');color:#fff;vertical-align:top">'+
(h?'<canvas data-ch="'+P.id+'" width="120" height="120" style="width:100%;max-width:120px"></canvas><br><b>'+esc(Lg(P.ru,P.en))+'</b>':'❔<br>'+Lg('ещё не нарисовали','not drawn yet'))+'</div>';}).join('');
try{modal('<h2>🖍 '+Lg('Альбом мелков','Chalk album')+' '+d.ch.length+'/'+V.CHALK.length+'</h2>'+shura(Lg('Дети рисуют, а я собираю. Вот это — моё любимое!','The kids draw, I collect. This one’s my favourite!'),'happy')+'<div style="max-height:52vh;overflow:auto">'+rows+'</div><div class="row"><button class="btn" id="mCancel">'+Lg('Закрыть','Close')+'</button></div>');}catch(e){return;}
[].forEach.call(document.querySelectorAll('canvas[data-ch]'),function(cv){var P=null;V.CHALK.forEach(function(x){if(x.id===cv.getAttribute('data-ch'))P=x;});if(!P)return;var c=cv.getContext('2d'),s=110;c.fillStyle='#5b6470';c.fillRect(0,0,120,120);
c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=3;c.lineCap='round';c.lineJoin='round';P.p.forEach(function(L){c.beginPath();L.forEach(function(p,k){if(k)c.lineTo(5+p[0]*s,5+p[1]*s);else c.moveTo(5+p[0]*s,5+p[1]*s);});c.stroke();});
(P.c||[]).forEach(function(q){c.beginPath();c.arc(5+q[0]*s,5+q[1]*s,q[2]*s,0,7);c.stroke();});});
var b=document.getElementById('mCancel');if(b)b.onclick=function(){try{hideModal();}catch(e){}};}
WN.V3DT.album=album;
function dedDue(g){if(!is('ded')||!g||g.daily||g.mode&&g.mode!=='n'||!V.dedSlot(g.idx))return false;var d=D3(),r=Math.floor(g.idx/10);return!!d&&d.dd.indexOf(r)<0;}
function dedRun(box){var g=curG();if(!box||!g)return;var r=Math.floor(g.idx/10),plan=V.dedPlan(g.idx*101+7),Wc=260,Hc=200,lane=1,lx=1,bumps=0,t0=now(),done=0,last=0,hitT=-9;
box.innerHTML='<canvas id="v3dtDc" width="'+Wc+'" height="'+Hc+'" style="width:'+Wc+'px;max-width:100%;border-radius:12px;display:block;margin:6px auto"></canvas>'+
'<div class="row" style="justify-content:center"><button class="btn sec noenter" id="v3dtL" style="min-width:72px;font-size:22px">◀</button><button class="btn sec noenter" id="v3dtR" style="min-width:72px;font-size:22px">▶</button></div>';
var cv=document.getElementById('v3dtDc'),c=cv&&cv.getContext('2d');if(!c)return;
function mv(k){if(done)return;lane=Math.max(0,Math.min(2,lane+k));}
document.getElementById('v3dtL').onclick=function(e){e.stopPropagation();mv(-1);};document.getElementById('v3dtR').onclick=function(e){e.stopPropagation();mv(1);};
function key(e){if(!document.getElementById('v3dtDc')){removeEventListener('keydown',key,true);return;}if(e.key==='ArrowLeft'){mv(-1);e.preventDefault();e.stopPropagation();}else if(e.key==='ArrowRight'){mv(1);e.preventDefault();e.stopPropagation();}}
addEventListener('keydown',key,true);
var COL=['#e74c3c','#2e86de','#f1c40f','#27ae60','#8e44ad','#e67e22'],lw=Wc/3;
sayL(Lg('Ну, держись! Тише едешь — дальше будешь.','Hold on tight! Slow and steady wins the race.'),true);
function car(x,y,col,me){rr(c,x-lw*.28,y-20,lw*.56,40,8);c.fillStyle=col;c.fill();c.fillStyle='rgba(200,230,255,.9)';rr(c,x-lw*.2,me?y-14:y+2,lw*.4,10,3);c.fill();}
function frame(){if(!document.getElementById('v3dtDc'))return;var t=now()-t0,dt=Math.min(.05,t-last);last=t;lx+=(lane-lx)*Math.min(1,dt*8);
c.fillStyle='#596275';c.fillRect(0,0,Wc,Hc);c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=3;c.setLineDash([14,14]);c.lineDashOffset=-(t*60)%28;
for(var k=1;k<3;k++){c.beginPath();c.moveTo(k*lw,0);c.lineTo(k*lw,Hc);c.stroke();}c.setLineDash([]);
var me=Hc-34,mx=lw*(lx+.5);
plan.forEach(function(e){var y=(t-e.t)*V.DED.sp*Hc*1.4-30;if(y<-40||y>Hc+40)return;car(lw*(e.l+.5),y,COL[e.c],0);
if(e.l===lane&&Math.abs(y-me)<36&&!e.hit&&!done){e.hit=1;bumps++;hitT=t;try{SND.horn();}catch(x){}}});
car(mx,me,'#d35400',1);if(t-hitT<.6){c.fillStyle='rgba(255,255,255,'+(.6-(t-hitT))+')';c.font='900 18px Rubik,sans-serif';c.textAlign='center';c.fillText('Би-бип!',mx,me-30);}
c.fillStyle='#fff';c.font='800 13px Rubik,-apple-system,sans-serif';c.textAlign='left';c.fillText('⏱ '+Math.max(0,Math.ceil(V.DED.T-t))+'  ·  '+Lg('бибикнули: ','honks: ')+bumps,8,16);
if(t>=V.DED.T&&!done){done=1;var d=D3();if(d&&d.dd.indexOf(r)<0){d.dd.push(r);sv();}ev({a:'ded',i:g.idx+1,b:bumps});
var msg=bumps?Lg('Доехали! Пару раз бибикнули — ну, это по-нашему.','We made it! A couple of honks — that’s our style.'):Lg('Как в молодости! Ни одного бибика — дед сияет.','Just like the old days! Not a single honk — Grandad is beaming.');
box.insertAdjacentHTML('beforeend','<p style="margin:6px 0"><b>🚗 '+esc(msg)+'</b></p>');removeEventListener('keydown',key,true);return;}
requestAnimationFrame(frame);}
requestAnimationFrame(frame);}
})();