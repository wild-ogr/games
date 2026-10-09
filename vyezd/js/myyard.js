/* Выезд со двора — «МОЙ ДВОР» и ядро потока YARD (буст «Наш двор», 10.10.2026). Журнал: hobby-analytics/release-i/vyezd-boost/logs/YARD.md
   Источник: vyezd-boost/04-meta-economy.md §2.2–2.6, §3; 06-visual-ux.md (вариант А). Образец — Викторина js/yard.js.
   Файлы потока: js/myyard.js (ядро + дворы), js/album.js (Автоальбом 40 машин), js/garage-tolik.js (Толик «Карбюратор»: реставрация, барахолка),
   js/league.js (лига соседей), css/myyard.css. Подключение — строки после основного скрипта игры (не загрузились → игра как раньше).
   Код игры не меняем:
   - сохранение: свои поля S.my*, S.alb*, S.prt (детали 🔩), S.lga*; починка MY.fix(fn), слияние облака — обёртка над глобальной mergeSave;
   - старое: S.dec (6 украшений «Уют двора») — уровни двора №1, рисуются во дворах игры как раньше (buildGround); S.garage/S.paint/S.yard/S.sets не трогаем;
   - после двора: гнездо yardHook UX ({lv, ok, stars, moves, sec, hint, undo, mode, region, fails}); до гнезда — обёртка win();
   - район карьеры: CAR.dist() 0..5 (Двор, Квартал, Микрорайон, Район, Город, Область); до CAR — прикидка по пройденным дворам;
   - дата: MY.now() = nowMs() + сдвиг ?date=ГГГГ-ММ-ДД[ЧЧ:ММ] (только localhost / ?paytest).
   Наружу: window.MYYARD (= MY): open(tab), homeCard(), dot(), prg(), lvl(kind), park(), collect(), dist(); window.VYPRT — детали 🔩: add(n,src), get(), spend(n,k), left(src). */
(function(){
'use strict';
var MY=window.MY=window.MYYARD={v:1};
var L2=function(r,e){try{return LANG==='en'?e:r;}catch(x){return r;}};MY.L=L2;
var Q=function(id){return document.getElementById(id);};
var isO=function(x){return !!x&&typeof x==='object'&&!Array.isArray(x);};
MY.Q=Q;MY.isO=isO;
MY.esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
MY.num=function(x){return typeof x==='number'&&isFinite(x)&&x>0?x:0;};
MY.pl=function(n,a,b,c){var x=Math.abs(n)%100,y=x%10;return x>10&&x<20?c:y===1?a:y>=2&&y<=4?b:c;};
MY.err=function(w,e){try{if(window.console)console.warn('MYYARD',w,e);}catch(x){}};

/* ---------- дата (+ ?date= для проверки) ---------- */
var OFF=0;
MY.dev=/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname)||location.protocol==='file:'||/[?&]paytest=/.test(location.search);
(function(){var m=/[?&]date=(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):?(\d{2}))?/.exec(location.search);if(!m||!MY.dev)return;
  var t=new Date(+m[1],+m[2]-1,+m[3],m[4]?+m[4]:12,m[5]?+m[5]:0).getTime();OFF=t-Date.now();})();
MY.now=function(){var t=Date.now(),sh=false;try{if(typeof nowMs==='function'){t=nowMs();sh=!!window.DATE_SHIFT;}}catch(e){}return t+(sh?0:OFF);};
MY.dayNo=function(t){t=t||MY.now();var d=new Date(t);return Math.floor((t-d.getTimezoneOffset()*60000)/864e5);};
MY.week=function(){return Math.floor((MY.dayNo()+3)/7);};          // неделя с понедельника
MY.wday=function(){return ((MY.dayNo()+3)%7+7)%7;};                // 0 — пн … 6 — вс
MY.date=function(){return new Date(MY.now());};
MY.hm=function(ms){ms=Math.max(0,ms);var m=Math.ceil(ms/60000),h=Math.floor(m/60);m%=60;return h?h+L2(' ч',' h')+(m?' '+m+L2(' мин',' min'):''):m+L2(' мин',' min');};

/* ---------- сохранение: свои поля, починка, слияние облака ---------- */
var FIX=[],MRG=[],MINE=/^(my|alb|prt$|lga|sea)/; /* vy-merge: + sea (season.js сливает от loc.sea — без него местный сезон и талон затирались) */
MY.fix=function(f){FIX.push(f);try{f();}catch(e){MY.err('fix',e);}};
MY.merge=function(f){MRG.push(f);};
MY.runFix=function(){FIX.forEach(function(f){try{f();}catch(e){MY.err('fix',e);}});};
var BOOT_PRT=0;
(function(){var m0=window.mergeSave;if(typeof m0!=='function')return;
  window.mergeSave=function(d){var loc={};try{for(var k in S)if(MINE.test(k))loc[k]=JSON.parse(JSON.stringify(S[k]));}catch(e){}
    var r=m0.apply(this,arguments);
    if(isO(d)){for(var k2 in loc)S[k2]=loc[k2]; // свои поля сливаем сами, по своим правилам
      // детали — как монеты в main: облачное + то, что заработано/потрачено здесь с прошлой сверки
      if(typeof d.prt==='number'&&isFinite(d.prt)){var lp=MY.num(loc.prt);S.prt=Math.max(0,Math.round(d.prt+(lp-BOOT_PRT)));BOOT_PRT=S.prt;}
      MRG.forEach(function(f){try{f(loc,d);}catch(e){MY.err('merge',e);}});MY.runFix();try{MY.fire('merge');}catch(e){}}
    return r;};})();
MY.mMax=function(d,k){if(typeof d[k]==='number'&&isFinite(d[k]))S[k]=Math.max(MY.num(S[k]),d[k]);};
MY.mObjMax=function(d,k){if(!isO(d[k]))return;if(!isO(S[k]))S[k]={};for(var x in d[k])if(typeof d[k][x]==='number')S[k][x]=Math.max(MY.num(S[k][x]),d[k][x]);};
MY.fObjNum=function(k){if(!isO(S[k]))S[k]={};for(var x in S[k])if(typeof S[k][x]!=='number'||!isFinite(S[k][x])||S[k][x]<0)delete S[k][x];};
MY.fNum=function(k){if(typeof S[k]!=='number'||!isFinite(S[k])||S[k]<0)S[k]=0;};

/* ---------- монеты, статистика, звук ---------- */
MY.save=function(){try{save();}catch(e){}};
MY.coins=function(){return MY.num(S.coins);};
MY.give=function(n,src){if(!(n>0))return;S.coins=MY.coins()+Math.round(n);try{STAT.earn(src||'quest',Math.round(n));}catch(e){}MY.save();try{updCoins();}catch(e){}};
MY.spend=function(n,k){if(!(n>0)||MY.coins()<n)return false;S.coins=MY.coins()-n;try{STAT.ev('spend',{k:k||'my',c:n});}catch(e){}MY.save();try{updCoins();}catch(e){}try{SND.coin();}catch(e){}return true;};
MY.ev=function(n,p){try{STAT.ev(n,p||{});}catch(e){}};
MY.snd=function(k){try{(SND[k]||SND.tap||function(){})();}catch(e){}};
MY.ct=function(n){try{return coinsTxt(n);}catch(e){return n+' 💰';}};
MY.toast=function(t,ms){try{toast(t,ms||2600);}catch(e){}};
MY.calm=function(){try{return typeof calm==='function'&&calm();}catch(e){return false;}};
var EV={};MY.on=function(n,f){(EV[n]=EV[n]||[]).push(f);};MY.fire=function(n,a){(EV[n]||[]).forEach(function(f){try{f(a);}catch(e){MY.err(n,e);}});};

/* ---------- ДЕТАЛИ 🔩 (S.prt): только за игру, за голоса не продаются ---------- */
// потолки в день по источнику: lvl — ★★★ впервые, mg — мини-игры («Перекур у Толика», затея дня), всё вместе — DAY_ALL
// (лига, сундук дня CAR, заказы — без отдельного потолка, они и так раз в день/неделю)
var CAP={lvl:6,mg:6,dove:3},DAY_ALL=40;
MY.fix(function(){MY.fNum('prt');S.prt=Math.round(S.prt);if(!isO(S.myPd))S.myPd={};var d=S.myPd;if(typeof d.d!=='number')d.d=0;
  ['lvl','mg','all'].forEach(function(k){if(typeof d[k]!=='number'||!(d[k]>=0))d[k]=0;});MY.fNum('myPt');});
BOOT_PRT=MY.num(S.prt);
MY.merge(function(loc,d){MY.mMax(d,'myPt');if(isO(d.myPd)&&d.myPd.d===S.myPd.d)['lvl','mg','all'].forEach(function(k){S.myPd[k]=Math.max(S.myPd[k]||0,d.myPd[k]||0);});});
function pd(){var t=MY.dayNo();if(S.myPd.d!==t){S.myPd={d:t,lvl:0,mg:0,all:0};}return S.myPd;}
function capOf(src){var c=CAP[src];if(src==='mg')c+=MY.fn('play');return c;}
var VYPRT=window.VYPRT={
  get:function(){return MY.num(S.prt);},
  left:function(src){var p=pd(),c=capOf(src);var a=DAY_ALL-p.all;return c==null?Math.max(0,a):Math.max(0,Math.min(a,c-(p[src]||0)));},
  // n — сколько дать; src — откуда (lvl, mg, chest, td, ord, lg, dove, gift…); вернёт, сколько выдано на самом деле (потолок)
  add:function(n,src,quiet){n=Math.round(+n||0);if(!(n>0))return 0;var p=pd(),wk=src==='lg'||src==='gift'||src==='ret';
    if(!wk){var l=VYPRT.left(src);n=Math.min(n,l);if(!(n>0))return 0;if(CAP[src]!=null)p[src]=(p[src]||0)+n;p.all+=n;}
    S.prt=VYPRT.get()+n;S.myPt=MY.num(S.myPt)+n;MY.save();MY.ev('prt',{k:src||'?',n:n,b:S.prt});MY.fire('prt',{n:n,src:src});
    if(!quiet)MY.toast('+'+n+' 🔩 '+L2(MY.pl(n,'деталь','детали','деталей'),n===1?'part':'parts'),1800);return n;},
  spend:function(n,k){n=Math.round(+n||0);if(!(n>0))return true;if(VYPRT.get()<n)return false;S.prt=VYPRT.get()-n;MY.save();MY.ev('spend',{k:k||'prt',c:0,p:n});MY.fire('prt',{n:-n});return true;},
  txt:function(n){return n+' 🔩';}};
MY.prt=VYPRT;

/* ---------- РАЙОН КАРЬЕРЫ (CAR): 0 Двор, 1 Квартал, 2 Микрорайон, 3 Район, 4 Город, 5 Область ---------- */
MY.DIST=['Двор','Квартал','Микрорайон','Район','Город','Область'];
MY.DIST_AT=[0,20,60,120,200,300]; // прикидка до CAR: пройдено дворов (04 §2.1)
MY.DIST_EN=['Yard','Block','Estate','District','City','Region'];
MY.distName=function(d){try{return LANG==='en'?MY.DIST_EN[d]:MY.DIST[d];}catch(e){return MY.DIST[d];}};
MY.dist=function(){try{if(window.CAR&&typeof CAR.rank==='function'){var r=CAR.rank();if(r&&r.d>=0)return Math.min(5,r.d|0);}}catch(e){}
  var n=Math.max(0,(S.unlocked||1)-1),k=0;for(var i=0;i<6;i++)if(n>=MY.DIST_AT[i])k=i;return k;};

/* ---------- ПОСЛЕ ДВОРА: гнездо yardHook (UX), до него — обёртка win() ---------- */
var YH=[];MY.onYard=function(f){YH.push(f);};
MY.yard=function(r){if(!r)return;YH.forEach(function(f){try{f(r);}catch(e){MY.err('yh',e);}});};
MY.hook='';
function hookYard(){
  try{var H=window.yardHook;
    if(H&&typeof H.add==='function'){H.add(MY.yard);return MY.hook='ux';}
    if(Array.isArray(H)){H.push(MY.yard);return MY.hook='ux';} // гнездо UX (js/ui-core.js)
    if(window.UI&&typeof UI.on==='function'){UI.on('yard',MY.yard);return MY.hook='ux';}}catch(e){}
  var w0=window.win;if(typeof w0!=='function')return '';
  window.win=function(){var g=null,st0=0,lv=0,daily=false;try{g=G;if(g){daily=!!g.daily;lv=(g.idx|0)+1;st0=daily?0:(S.stars[g.idx]||0);}}catch(e){}
    var r=w0.apply(this,arguments);
    try{if(g){var st=Math.max(1,g.hearts|0);MY.yard({lv:lv,ok:1,end:'win',stars:st,first:!daily&&!st0,moves:g.moves|0,hint:g.helps|0,crashes:g.crashes|0,mode:daily?'daily':'',daily:daily});}}catch(e){MY.err('win',e);}
    return r;};
  return MY.hook='win';}
// ★★★ впервые — 2 детали (финал десятки — 3), потолок 6 в день. Свой учёт S.my3 (битовая строка по номерам дворов):
// при первом запуске отмечаем уже взятые ★★★, чтобы старым игрокам не досыпать задним числом
function b3get(lv){var h=S.my3||'',i=lv>>2;return i<h.length&&(parseInt(h[i],16)>>(lv&3)&1);}
function b3set(lv){var h=S.my3||'',i=lv>>2;while(h.length<=i)h+='0';var v=parseInt(h[i],16)|(1<<(lv&3));S.my3=h.slice(0,i)+v.toString(16)+h.slice(i+1);}
MY.fix(function(){if(typeof S.my3!=='string'||!/^[0-9a-f]*$/.test(S.my3)){S.my3='';try{for(var k in S.stars)if(S.stars[k]>=3)b3set(+k+1);}catch(e){}}});
MY.merge(function(loc,d){if(typeof d.my3!=='string'||!/^[0-9a-f]*$/.test(d.my3))return;var a=S.my3||'',b=d.my3,o='';for(var i=0;i<Math.max(a.length,b.length);i++)o+=((parseInt(a[i]||'0',16)|parseInt(b[i]||'0',16))).toString(16);S.my3=o;});
MY.onYard(function(r){if(!r||!r.ok||r.end&&r.end!=='win')return;var lv=r.lv|0,daily=!!r.daily||r.mode==='daily';
  if(!daily&&lv>0&&(r.stars|0)>=3&&!b3get(lv)){b3set(lv);VYPRT.add(lv%10===0?3:2,'lvl',true);MY.lastPrt=MY.now();}
  var t=MY.dayNo();if(S.myDl!==t){S.myDl=t;S.myDn=MY.num(S.myDn)+1;}MY.save();});
MY.fix(function(){MY.fNum('myDn');MY.fNum('myDl');});
MY.merge(function(loc,d){MY.mMax(d,'myDn');MY.mMax(d,'myDl');});

/* =====================================================================================
   ДВОРЫ: 6 дворов (по районам) × 6 объектов × 3 уровня. Объект = вид рисунка (k) + место (слот).
   Слот 1 — всегда стоянка (копит монеты, пока тебя нет). Дела объектов (по лучшему уровню вида во всех дворах):
   gar — гаражи Толика (реставрация: 1-й ур. открывает, 2-й — второе место, 3-й — быстрее на четверть), play — площадка (+1 к потолку деталей
   с мини-игр за уровень), dove — голубятня (почта: 1/2/3 🔩 в день), board — доска объявлений (+10 % к награде лиги за уровень).
   ===================================================================================== */
// виды объектов: n — имя, g — что даёт каждый уровень (подпись), fn — дело
var KIND={
  lav:{n:'Лавочки и клумба',ic:'🌷',g:['Новые лавочки — свежая краска','Цветы у подъезда — петунии бабы Шуры','Лебедь из покрышки — гордость двора'],en:"Benches & flowerbed",ge:["New benches — fresh paint", "Flowers by the door — Granny Shura’s petunias", "Tyre swan — the pride of the yard"]},
  park:{n:'Стоянка',ic:'🅿️',g:['Разметка на 3 места — 2 💰 в час','Бордюр и знак «P» — 3 💰 в час','Шлагбаум и будка сторожа — 4 💰 в час'],en:"Car park",ge:["Markings for 3 cars — 2 💰 an hour", "Kerb and a “P” sign — 3 💰 an hour", "Barrier and a guard hut — 4 💰 an hour"],fn:'park'},
  gar:{n:'Гаражи Толика',ic:'🔧',g:['Гараж-ракушка — Толик берёт машины в ремонт','Второй бокс и яма — две машины сразу','Подъёмник и лампы — ремонт быстрее на четверть'],en:"Tolik’s garages",ge:["A shell garage — Tolik takes cars in for repair", "Second bay and a pit — two cars at once", "Lift and lamps — repairs a quarter faster"],fn:'gar'},
  play:{n:'Детская площадка',ic:'🛝',g:['Качели — скрипят, но радуют','Песочница с грибком (+1 🔩 с затей в день)','Горка и карусель (ещё +1 🔩)'],en:"Playground",ge:["Swing — squeaky but fun", "Sandbox with a mushroom (+1 🔩 from mini-games a day)", "Slide and roundabout (another +1 🔩)"],fn:'play'},
  dove:{n:'Голубятня',ic:'🕊️',g:['Кормушка — синицы и почта: 1 🔩 в день','Голубятня — почта: 2 🔩 в день','Стая над двором — почта: 3 🔩 в день'],en:"Dovecote",ge:["Bird feeder — tits and post: 1 🔩 a day", "Dovecote — post: 2 🔩 a day", "A flock over the yard — post: 3 🔩 a day"],fn:'dove'},
  board:{n:'Доска объявлений',ic:'📋',g:['Доска объявлений — лига +10 %','Гирлянда и фонарь — лига +20 %','Доска почёта «Лучший двор» — лига +30 %'],en:"Notice board",ge:["Notice board — league +10%", "String lights and a lamp — league +20%", "Board of honour “Best yard” — league +30%"],fn:'board'},
  hockey:{n:'Хоккейная коробка',ic:'🏒',g:['Коробка из досок','Ворота и разметка','Прожектор — играют и вечером'],en:"Hockey box",ge:["A rink of planks", "Goals and markings", "Floodlight — they play in the evening too"]},
  dry:{n:'Сушилка и турник',ic:'🧺',g:['Столбы для белья','Бельё на верёвках','Турник и ковровыбивалка'],en:"Washing lines & bar",ge:["Poles for washing", "Laundry on the lines", "Pull-up bar and carpet beater"]},
  domino:{n:'Беседка с домино',ic:'🁫',g:['Стол для домино','Крыша беседки','Фонарик и вечерний турнир'],en:"Domino gazebo",ge:["A domino table", "Gazebo roof", "A lamp and an evening tournament"]},
  fount:{n:'Фонтан',ic:'⛲',g:['Чаша фонтана','Вода пошла!','Лебеди и лавочки вокруг'],en:"Fountain",ge:["Fountain bowl", "Water’s running!", "Swans and benches around"]},
  kiosk:{n:'Ларёк «Союзпечать»',ic:'📰',g:['Ларёк открыт','Козырёк и газеты','Вывеска с подсветкой'],en:"“Soyuzpechat” kiosk",ge:["The kiosk is open", "Awning and newspapers", "A lit-up sign"]},
  rocket:{n:'Горка-ракета',ic:'🚀',g:['Горка-ракета','Покраска в цвета «Союза»','Лесенка и звёзды на боку'],en:"Rocket slide",ge:["Rocket slide", "Painted in “Soyuz” colours", "Ladder and stars on the side"]},
  stop:{n:'Остановка',ic:'🚏',g:['Знак остановки и лавочка','Павильон с козырьком','Расписание и ПАЗик у остановки'],en:"Bus stop",ge:["Stop sign and a bench", "Shelter with a roof", "Timetable and a PAZik at the stop"]},
  trees:{n:'Аллея',ic:'🌳',g:['Саженцы','Тополя подросли','Фонари вдоль аллеи'],en:"Alley",ge:["Saplings", "The poplars have grown", "Lamps along the alley"]},
  well:{n:'Колонка',ic:'🚰',g:['Колонка с водой','Вёдра и лавочка','Навес и цветы'],en:"Water pump",ge:["Water pump", "Buckets and a bench", "Canopy and flowers"]},
  shed:{n:'Сарай и баня',ic:'🛖',g:['Сарай для дров','Банька','Дымок из трубы — баня натоплена'],en:"Shed & bathhouse",ge:["Woodshed", "A banya", "Smoke from the chimney — the banya is hot"]},
  garden:{n:'Огород',ic:'🥕',g:['Грядки','Теплица из рам','Пугало и урожай'],en:"Vegetable patch",ge:["Beds", "Greenhouse of old frames", "Scarecrow and harvest"]}};
MY.KIND=KIND;
function kn(K){return L2(K.n,K.en||K.n);}function kg(K,i){return L2(K.g[i],(K.ge||K.g)[i]);}function yn(Y){return L2(Y.n,Y.en||Y.n);}function ysub(Y){return L2(Y.sub,Y.sube||Y.sub);}
MY.kn=kn;MY.yn=yn;
// дворы: s — сезон рисунка, h — дом, o — виды по слотам 0..5 (слот 1 — стоянка), m — множители цены по слотам
var YARDS=[
  {en:"Our yard",sube:"Granny Shura’s five-storey block",n:'Наш двор',sub:'Пятиэтажка бабы Шуры',s:'sum',h:'brick',o:['lav','park','gar','play','dove','board']},
  {en:"Yard in the Block",sube:"Nine-storey block by the school",n:'Двор на Квартале',sub:'Девятиэтажка у школы',s:'aut',h:'panel',o:['hockey','park','dry','domino','trees','kiosk']},
  {en:"Yard in the Estate",sube:"New panel blocks",n:'Двор в Микрорайоне',sub:'Новые панельки',s:'eve',h:'panel2',o:['fount','park','rocket','lav','dry','trees']},
  {en:"Yard by the market",sube:"District: winter, ice rink",n:'Двор у рынка',sub:'Район: зима, каток',s:'win',h:'brick2',o:['hockey','park','stop','kiosk','trees','domino']},
  {en:"Yard in the centre",sube:"Stalin-era block with an arch",n:'Двор в центре',sub:'Сталинка с аркой',s:'spr',h:'stalin',o:['fount','park','lav','play','trees','board']},
  {en:"Dacha in the Region",sube:"Dacha co-op",n:'Дача в Области',sub:'Дачный кооператив',s:'dacha',h:'dacha',o:['well','park','shed','garden','dove','domino']}];
var SLOT_M=[.8,1.2,1,1,1,1],LV_M=[1,2,3.5];
MY.YARDS=YARDS;
MY.price=function(y,i,l){return Math.round(150*(1+.6*y)*SLOT_M[i]*LV_M[l]/10)*10;}; // l — 0,1,2 (уровень, который строим, минус 1)
MY.ytot=function(y){var s=0;for(var i=0;i<6;i++)for(var l=0;l<3;l++)s+=MY.price(y,i,l);return s;};
MY.TOTAL=(function(){var s=0;for(var y=0;y<6;y++)s+=MY.ytot(y);return s;})(); // ≈ 87 750

var DEC_MAP={0:['bench','flowers','swan'],3:['swing'],4:['feeder'],5:[null,'garland']}; // слот двора №1 → украшения по уровням
// уровни: S.myL — строка 36 цифр (двор·6 + слот)
MY.merge(function(loc,d){if(typeof d.myL==='string'&&/^[0-3]{36}$/.test(d.myL)){var a=S.myL.split(''),o='';for(var i=0;i<36;i++)o+=Math.max(+a[i]||0,+d.myL[i]||0);S.myL=o;}});
MY.lv=function(y,i){return +(S.myL||'')[y*6+i]||0;};
function setLv(y,i,l){var a=S.myL.split('');a[y*6+i]=String(l);S.myL=a.join('');}
MY.ylv=function(y){var a=[];for(var i=0;i<6;i++)a.push(MY.lv(y,i));return a;};
MY.ysum=function(y){return MY.ylv(y).reduce(function(s,x){return s+x;},0);};
MY.total=function(){var s=0;for(var y=0;y<6;y++)s+=MY.ysum(y);return s;};
MY.spent=function(){var s=0;for(var y=0;y<6;y++)for(var i=0;i<6;i++)for(var l=0;l<MY.lv(y,i);l++)s+=MY.price(y,i,l);return s;};
MY.open_=function(y){return MY.dist()>=y;}; // двор района открыт
// дело вида: лучший уровень вида во всех дворах (стоянка — сумма ставок)
MY.kindLv=function(k){var m=0;for(var y=0;y<6;y++)for(var i=0;i<6;i++)if(YARDS[y].o[i]===k)m=Math.max(m,MY.lv(y,i));return m;};
MY.lvl=MY.kindLv;
MY.fn=function(k){var l=MY.kindLv(k);return k==='play'?l:k==='dove'?l:k==='board'?l*.1:k==='gar'?l:0;};
MY.fix(function(){if(typeof S.myL!=='string'||!/^[0-3]{36}$/.test(S.myL))S.myL=(typeof S.myL==='string'&&/^[0-3]+$/.test(S.myL)?(S.myL+'0'.repeat(36)).slice(0,36):'0'.repeat(36));migrateDec();});

/* --- перенос «Уюта двора» (S.dec) в двор №1: уровень = старшее купленное в цепочке; купленное остаётся --- */
function migrateDec(){var dec=isO(S.dec)?S.dec:{};for(var i in DEC_MAP){var ch=DEC_MAP[i],l=0;ch.forEach(function(id,k){if(id&&dec[id])l=k+1;});
  if(l>MY.lv(0,+i))setLv(0,+i,l);}
  syncDec();}
// обратная связь: уровень двора №1 → украшения S.dec (их рисует сама игра во всех дворах)
function syncDec(){if(!isO(S.dec))S.dec={};for(var i in DEC_MAP){var l=MY.lv(0,+i);DEC_MAP[i].forEach(function(id,k){if(id&&k<l&&!S.dec[id])S.dec[id]=1;});}}
MY.DEC_MAP=DEC_MAP;

/* ---------- постройка ---------- */
MY.build=function(y,i){var l=MY.lv(y,i);if(l>=3)return false;var c=MY.price(y,i,l);
  if(!MY.open_(y)){MY.toast(L2('Этот двор откроется в районе «','This yard opens in the “')+MY.distName(y)+L2('»','” district'));return false;}
  if(y===0&&i===1)parkAccrue(); // ставка стоянки меняется — копилку пересчитать до постройки
  else parkAccrue();
  if(!MY.spend(c,'myd'))return false;setLv(y,i,l+1);if(y===0)syncDec();
  MY.save();MY.ev('yd',{y:y,o:YARDS[y].o[i],l:l+1,c:c,n:MY.total()});try{SND.win();}catch(e){}MY.fire('build',{y:y,i:i,l:l+1});
  if(MY.ysum(y)===18)yardDone(y);
  try{if(typeof buildGround==='function'&&y===0&&G)buildGround(1);}catch(e){}
  return true;};
function yardDone(y){if(!isO(S.myF))S.myF={};if(S.myF[y])return;S.myF[y]=1;VYPRT.add(20+10*y,'gift',true);
  MY.toast('🏆 «'+yn(YARDS[y])+'» '+L2('достроен! +','is complete! +')+(20+10*y)+L2(' 🔩 от Толика',' 🔩 from Tolik'),3600);MY.ev('yd',{y:y,done:1});}
MY.fix(function(){if(!isO(S.myF))S.myF={};});
MY.merge(function(loc,d){MY.mObjMax(d,'myF');});
// следующая постройка: самая дешёвая в открытых дворах
MY.next=function(){var best=null;for(var y=0;y<6;y++){if(!MY.open_(y))continue;for(var i=0;i<6;i++){var l=MY.lv(y,i);if(l>=3)continue;var c=MY.price(y,i,l);
  if(!best||c<best.c)best={y:y,i:i,l:l+1,c:c};}}return best;};

/* =====================================================================================
   СТОЯНКА: копит монеты, пока тебя нет. Ставка = сумма по дворам [2,3,4] 💰/ч за уровень стоянки, потолок 16 ч.
   ГОЛУБИНАЯ ПОЧТА: раз в день 1/2/3 🔩 (лучшая голубятня) — забирается вместе со стоянкой.
   S.myP = {t: время последнего пересчёта, a: накоплено монет (дробно)}; S.myM — день последней почты.
   ===================================================================================== */
var PARK_H=16,PARK_R=[0,2,3,4];
MY.parkRate=function(){var r=0;for(var y=0;y<6;y++)r+=PARK_R[MY.lv(y,1)];return r;};
MY.parkCap=function(){return MY.parkRate()*PARK_H;};
MY.fix(function(){if(!isO(S.myP))S.myP={};var p=S.myP;if(typeof p.t!=='number'||!isFinite(p.t)||p.t<0)p.t=0;if(typeof p.a!=='number'||!isFinite(p.a)||p.a<0)p.a=0;MY.fNum('myM');});
MY.merge(function(loc,d){if(isO(d.myP)&&typeof d.myP.t==='number'&&d.myP.t>S.myP.t){S.myP={t:d.myP.t,a:Math.max(0,+d.myP.a||0)};}MY.mMax(d,'myM');});
function parkAccrue(){var p=S.myP,now=MY.now(),r=MY.parkRate();if(!p.t||p.t>now+6e4){p.t=now;return;}
  var h=(now-p.t)/36e5;p.a=Math.min(MY.parkCap(),p.a+h*r);p.t=now;}
MY.park=function(){parkAccrue();return Math.floor(S.myP.a);};
MY.parkFull=function(){var r=MY.parkRate();return r>0&&MY.park()>=MY.parkCap();};
MY.mail=function(){var l=MY.kindLv('dove');return l&&S.myM!==MY.dayNo()?l:0;};
MY.collect=function(src){var n=MY.park(),m=MY.mail(),got={c:0,p:0};
  if(n>0){S.myP.a-=n;MY.give(n,'park');got.c=n;}
  if(m){S.myM=MY.dayNo();got.p=VYPRT.add(m,'dove',true);}
  if(got.c||got.p){MY.save();MY.ev('park',{c:got.c,p:got.p,s:src||''});try{SND.coin();}catch(e){}}
  return got;};
// «Пока тебя не было» — для ленты CAR: {c: монет на стоянке, p: деталей в почте, full}
MY.away=function(){return {c:MY.park(),p:MY.mail(),full:MY.parkFull()};};

/* =====================================================================================
   РИСУНОК ДВОРА — SVG 400×260, вид сверху-спереди (как макет 06 «А»): дом сверху, тротуар, двор.
   Каждый вид рисуется в своём поле 100×80 и вписывается в слот.
   ===================================================================================== */
var K='#1f3347';
function A(o){var s='';for(var k in o)if(o[k]!=null&&o[k]!=='')s+=' '+k+'="'+o[k]+'"';return s;}
function R(x,y,w,h,f,rx,ex){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"'+(rx?' rx="'+rx+'"':'')+' fill="'+f+'"'+(ex==null?' stroke="'+K+'" stroke-width="1.6"':ex)+'/>';}
function P(d,f,ex){return '<path d="'+d+'" fill="'+(f||'none')+'"'+(ex==null?' stroke="'+K+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"':ex)+'/>';}
function C(x,y,r,f,ex){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"'+(ex==null?' stroke="'+K+'" stroke-width="1.6"':ex)+'/>';}
function E(x,y,rx,ry,f,ex){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'"'+(ex==null?' stroke="'+K+'" stroke-width="1.6"':ex)+'/>';}
function T(x,y,s,sz,f,ex){return '<text x="'+x+'" y="'+y+'" font-family="Rubik,Arial,sans-serif" font-weight="800" font-size="'+sz+'" fill="'+(f||K)+'" text-anchor="middle"'+(ex||'')+'>'+s+'</text>';}
var NS=' stroke="none"',TH=function(w,c){return ' stroke="'+(c||K)+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"';};
MY.svg={R:R,P:P,C:C,E:E,T:T,K:K,NS:NS,TH:TH};
// сезоны: трава, трава2, асфальт, листва, листва2, снег
var SEA={
  sum:{g:'#8cc56a',g2:'#7ab65b',a:'#c3c3bd',l:'#5aa040',l2:'#6fb552',side:'#e2dccb'},
  aut:{g:'#a9b85e',g2:'#9aab52',a:'#bdbab2',l:'#e0a03a',l2:'#d9752b',side:'#e0d8c4',leaf:1},
  eve:{g:'#86b86a',g2:'#76a85c',a:'#b9b7b8',l:'#4f9440',l2:'#62a64e',side:'#dcd5c6'},
  win:{g:'#eef4f8',g2:'#dfe9f1',a:'#cfd6de',l:'#e9f1f7',l2:'#ffffff',side:'#e6ebf0',snow:1},
  spr:{g:'#9bd37a',g2:'#8bc56a',a:'#c6c4be',l:'#7cc45a',l2:'#f3b6c9',side:'#e6dfcf',bloom:1},
  dacha:{g:'#93c766',g2:'#84b95a',a:'#d6c39a',l:'#4f9a3c',l2:'#64ad4c',side:'#d9c9a2'}};
MY.SEA=SEA;
// дом: верх сцены (0..74)
function house(h,se,lit){var s='',win=function(x,y,w,hh,on){return R(x,y,w,hh,on?'#ffd96a':'#9fc6dd',2,TH(1.4))+P('M'+(x+w/2)+' '+y+'v'+hh+' M'+x+' '+(y+hh*.45)+'h'+w,0,TH(1))+R(x-2,y+hh,w+4,3,'#f3efe6',0,TH(1));};
  if(h==='dacha'){s+=R(0,0,400,74,'#bfe3f2',0,NS)+E(330,18,22,7,'#fff',NS)+E(350,13,14,6,'#fff',NS);
    s+=P('M0 50 q60 -18 120 -4 q70 -16 140 0 q70 -14 140 2 v26 h-400z','#8fbf6a',NS);
    // два домика и забор
    [[40,'#d98a4e','#8c4a2b'],[250,'#7fb0d8','#b5523b']].forEach(function(d){var x=d[0];s+=R(x,30,74,40,d[1],2)+P('M'+(x-6)+' 32 l43 -26 l43 26z',d[2])+win(x+10,40,16,16)+win(x+48,40,16,16)+R(x+30,46,14,24,'#8c5a3a',1,TH(1.4));});
    s+=P('M0 70 h400',0,TH(2,'#8a5a3a'));for(var x=4;x<400;x+=12)s+=R(x,58,8,14,'#c8925a',1,TH(1));
    return s;}
  var wall={brick:'#d98f6b',brick2:'#c98a74',panel:'#e8e1d2',panel2:'#dfe6ea',stalin:'#efd9a8'}[h]||'#d98f6b';
  s+=R(-4,-4,408,80,wall,0,TH(2));
  if(h==='brick'||h==='brick2')for(var yy=6;yy<70;yy+=8)s+=P('M0 '+yy+'h400',0,' stroke="#000" stroke-opacity=".06" stroke-width="1"');
  if(h==='panel'||h==='panel2')for(var xx=0;xx<400;xx+=50)s+=P('M'+xx+' 0v74',0,' stroke="#000" stroke-opacity=".08" stroke-width="1.2"')+P('M0 37h400',0,' stroke="#000" stroke-opacity=".08" stroke-width="1.2"');
  if(h==='stalin')s+=R(-4,30,408,6,'#e2c68c',0,TH(1.2))+R(-4,-4,408,8,'#d9b874',0,TH(1.2));
  var xs=[14,48,82,150,184,250,284,318,352],L=lit||[];
  xs.forEach(function(x,i){s+=win(x,8,22,20,L.indexOf(i)>=0)+win(x,42,22,20,L.indexOf(i+9)>=0);});
  // подъезды с козырьком
  [116,220].forEach(function(x){s+=R(x,34,26,40,'#7a5a46',1)+R(x+3,38,20,36,'#5b8fb8',1,TH(1.4))+P('M'+(x+13)+' 38v36',0,TH(1))+P('M'+(x-6)+' 34 h38 l-4 -7 h-30z','#b5523b')+C(x+13,24,3,'#ffd96a',TH(1.2));});
  if(se.snow)s+=P('M-4 2 h408 v4 q-200 4 -408 0z','#fff',NS)+[14,48,82,150,184,250,284,318,352].map(function(x){return R(x-2,28,26,3,'#fff',1,NS)+R(x-2,62,26,3,'#fff',1,NS);}).join('');
  if(h==='stalin')s+=P('M174 74 v-20 q26 -26 52 0 v20','#6a4e3a',TH(1.6));
  return s;}
function ground(se){var s='';
  s+=R(-4,74,408,12,se.side,0,TH(1.6));
  s+=R(-4,86,408,180,se.g,0,NS);
  for(var i=0;i<14;i++){var x=(i*67)%400,y=96+(i*41)%160;s+=se.snow?C(x,y,2,'#fff',NS):P('M'+x+' '+y+' l3 -5 l3 5',0,' stroke="'+se.g2+'" stroke-width="2" stroke-linecap="round"');}
  if(se.leaf)for(var j=0;j<16;j++){var lx=(j*53+20)%400,ly=92+(j*29)%166;s+=E(lx,ly,3,1.8,j%2?'#e0a03a':'#d9752b',NS);}
  if(se.bloom)for(var b=0;b<10;b++){var bx=(b*71+30)%400,by=100+(b*37)%150;s+=C(bx,by,2.2,'#fff',NS)+C(bx,by,1,'#f7c548',NS);}
  // проезд вдоль дома
  s+=R(-4,86,408,4,'#000',0,' fill-opacity=".05" stroke="none"');
  return s;}
function tree(x,y,r,se){return E(x+3,y+r*.9,r*.8,r*.25,'rgba(0,0,0,.15)',NS)+C(x,y,r,se.l,TH(1.6))+C(x+r*.35,y-r*.3,r*.55,se.l2,NS)+(se.snow?P('M'+(x-r*.7)+' '+(y-r*.3)+' q'+(r*.7)+' '+(-r*.8)+' '+(r*1.4)+' 0','#fff',NS):'');}

/* --- виды объектов: f(l, se, y) → svg в поле 100×80 (l=1..3) --- */
function bench(x,y,c){return R(x,y,34,6,c||'#3d8b4a',2)+R(x,y+8,34,4,c||'#3d8b4a',1.5)+P('M'+(x+4)+' '+(y+12)+'v6 M'+(x+30)+' '+(y+12)+'v6',0,TH(2.2));}
function swan(x,y){return E(x,y+8,16,6,'#2b2a30',TH(1.2))+E(x,y+6,11,4,'#7fbf55',NS)+P('M'+(x-9)+' '+(y+5)+' q4 -10 12 -6 q5 2 1 -11 q-1 -5 3 -5 q4 0 3 3',' #fff'.trim(),TH(1.4))+P('M'+(x+9)+' '+(y-14)+' l4 1',0,TH(2,'#ff8a3d'));}
function flowers(x,y,n){var s='',c=['#e5484d','#ffd23f','#ff8ad8','#fff','#ff7a1a'];s+=E(x+n*5,y+4,n*6+4,6,'#8a5a3a',TH(1.2));for(var i=0;i<n*2;i++){var fx=x+i*5+2,fy=y+(i%2?1:4);s+=C(fx,fy,2.6,c[i%5],TH(.8));}return s;}
var DRAW={
  lav:function(l,se){var s='';s+=bench(8,40)+bench(58,40);if(l>=2)s+=flowers(14,24,7);else s+=R(8,22,84,12,'rgba(0,0,0,.06)',4,' stroke="'+K+'" stroke-width="1" stroke-dasharray="3 3"');
    if(l>=3)s+=swan(50,64);return s;},
  park:function(l,se,y){var s='',lines=l>=2?'#fff':'#f4f0e4';s+=R(0,0,150,108,se.a,10,TH(1.8));
    for(var i=0;i<4;i++)s+=P('M'+(10+i*38)+' 6 v40',0,' stroke="'+lines+'" stroke-width="2.2" stroke-dasharray="'+(l>=2?'0':'6 4')+'"');
    s+=P('M10 58 h130',0,' stroke="'+lines+'" stroke-width="1.6" stroke-dasharray="6 5"');
    if(l>=2){s+=R(0,104,150,6,'#e8e1cf',2,TH(1.4))+R(132,62,12,12,'#2f6fd0',2,TH(1.2))+T(138,72,'P',10,'#fff')+P('M138 74v24',0,TH(2));}
    var cars=(MY.parkCars?MY.parkCars(l>=3?3:l>=2?2:1,y):[]);cars.forEach(function(c,k){s+='<g transform="translate('+(29+k*38)+' 26)">'+c+'</g>';});
    if(l>=3){s+=R(6,70,22,26,'#f3efe6',2)+R(9,74,16,10,'#9fc6dd',1,TH(1))+P('M6 70 l11 -8 l11 8',' #b5523b'.trim())+P('M28 84 h52',0,TH(3.4,'#e5484d'))+P('M28 84 h52',0,' stroke="#fff" stroke-width="3.4" stroke-dasharray="6 6"');}
    return s;},
  gar:function(l,se){var s='',n=l>=2?(l>=3?3:2):1,col=['#8fa3b5','#a7b59a','#b8a07a'];
    for(var i=0;i<n;i++){var x=4+i*32;s+=P('M'+x+' 66 v-34 q14 -12 28 0 v34z',col[i],TH(1.6))+P('M'+(x+4)+' 66 v-26 h20 v26',0,TH(1.2))+P('M'+(x+4)+' 48 h20 M'+(x+4)+' 56 h20',0,TH(.9));}
    s+=R(4,16,46,10,'#fffaf0',2,TH(1.2))+T(27,24,L2('ТОЛИК','TOLIK'),7.5,'#b5523b');
    if(l>=3)s+=C(86,20,4,'#ffd96a',TH(1.2))+P('M86 24 v40 M78 64 h16',0,TH(2));
    return s;},
  play:function(l,se){var s='';s+=P('M8 66 l8 -40 l8 40 M40 66 l8 -40 l8 40 M16 26 h32',0,TH(2.4,'#c0392b'))+P('M28 26v24 M36 26v24',0,TH(1))+R(25,50,14,4,'#ffd23f',1,TH(1.1));
    if(l>=2)s+=R(62,46,30,20,'#e0a85a',2)+R(65,49,24,14,'#f2d48a',0,NS)+P('M77 46v-22',0,TH(2.4))+P('M63 28 q14 -14 28 0z','#e5484d')+C(72,24,1.6,'#fff',NS)+C(82,23,1.6,'#fff',NS);
    if(l>=3)s+=P('M60 14 h14 l18 26 h-8z','#3f8fe0')+P('M60 14 v26 M66 14 v26',0,TH(1.6))+C(50,76,1,'#fff',NS);
    return s;},
  dove:function(l,se){var s='';s+=tree(26,30,22,se)+R(18,40,16,12,'#c98d5a',1,TH(1.2))+P('M15 41 l11 -8 l11 8z','#c4503a')+C(26,46,2.4,K,NS)+C(40,44,3,'#ffd23f',TH(1));
    if(l>=2){var x=72;s+=P('M'+(x-8)+' 76 l3 -40 M'+(x+8)+' 76 l-3 -40 M'+(x-7)+' 60 h14',0,TH(2))+R(x-14,20,28,18,'#3f8fe0',1)+P('M'+(x-18)+' 22 l18 -12 l18 12z','#ffcf40')+R(x-5,25,10,8,K,1,NS)+P('M'+x+' 10 v-8',0,TH(1.2))+P('M'+x+' 2 h9 l-2 3 l2 3 h-9z','#e5484d',TH(1));}
    if(l>=3)s+=dove(58,8)+dove(88,14)+dove(48,20)+dove(92,4);
    return s;},
  board:function(l,se){var s='';s+=P('M30 70 v-20 M70 70 v-20',0,TH(2.4))+R(22,18,56,34,'#c98d5a',2)+R(26,22,48,26,'#f7f1e1',1,TH(1));
    [[30,26,'#fff7a8'],[44,28,'#cfe8ff'],[58,25,'#ffd0d0'],[34,37,'#d8f5c8'],[52,38,'#fff']].forEach(function(n){s+=R(n[0],n[1],11,9,n[2],1,TH(.8));});
    if(l>=2)s+=P('M2 10 q24 12 48 2 q24 12 48 0',0,TH(1))+[8,18,28,40,52,62,74,86,94].map(function(x,i){return C(x,10+Math.sin(i)*3+3,2.4,['#e5484d','#ffd23f','#3f8fe0','#2fa84f'][i%4],TH(.8));}).join('')+P('M92 74 v-48 q0 -4 -5 -4',0,TH(2))+R(82,22,8,5,'#ffd96a',1,TH(1));
    if(l>=3)s+=R(4,56,18,16,'#e5484d',1,TH(1.2))+T(13,67,'★',10,'#ffd23f');
    return s;},
  hockey:function(l,se){var s='',ice=se.snow?'#dff1fb':'#c9c9c4';s+=R(4,8,92,62,ice,14,TH(2.2))+R(4,8,92,62,'none',14,' stroke="#fff" stroke-width="4" stroke-opacity=".6"');
    if(l>=2)s+=P('M50 8 v62',0,TH(1.4,'#e5484d'))+C(50,39,10,'none',TH(1.4,'#3f8fe0'))+R(4,32,8,14,'#fff',1,TH(1.2))+R(88,32,8,14,'#fff',1,TH(1.2));
    if(l>=3)s+=P('M98 72 v-58',0,TH(2))+R(90,8,14,8,'#ffd96a',2,TH(1.2))+P('M90 14 l-40 30',0,' stroke="#fff3a8" stroke-width="10" stroke-opacity=".35" stroke-linecap="round"');
    return s;},
  dry:function(l,se){var s='';s+=P('M10 70 v-48 M90 70 v-48 M4 22 h12 M84 22 h12',0,TH(2.4))+P('M10 28 h80 M10 38 h80',0,TH(1));
    if(l>=2){var c=['#fff','#e5484d','#7fc4f0','#ffd23f','#fff','#2fa84f'];for(var i=0;i<6;i++)s+=R(16+i*12,i%2?38:28,9,i%2?12:14,c[i],1,TH(.9));}
    if(l>=3)s+=P('M20 78 v-14 M44 78 v-14 M20 64 h24',0,TH(2))+P('M60 78 v-12 M84 78 v-12 M58 66 h28',0,TH(2))+R(64,66,16,9,'#c0392b',1,TH(1));
    return s;},
  domino:function(l,se){var s='';if(l>=2)s+=P('M8 30 l42 -22 l42 22z',l>=3?'#e5484d':'#c9765a')+P('M14 30 v40 M86 30 v40',0,TH(2.4));
    s+=R(30,46,40,8,'#e0a85a',2)+P('M36 54 v14 M64 54 v14',0,TH(2.4));for(var i=0;i<4;i++)s+=R(34+i*8,47,6,4,'#fff',1,TH(.8));
    s+=R(18,54,10,10,'#b9783a',2,TH(1.2))+R(72,54,10,10,'#b9783a',2,TH(1.2));
    if(l>=3)s+=C(50,34,3.4,'#ffd96a',TH(1.2))+E(50,40,18,8,'rgba(255,230,120,.3)',NS);
    return s;},
  fount:function(l,se){var s='';s+=E(50,52,40,16,'#d7d2c6',TH(2))+E(50,50,32,11,l>=2?'#7fc4f0':'#bdb8ab',TH(1.4))+R(46,30,8,20,'#d7d2c6',1,TH(1.4))+E(50,30,10,4,'#d7d2c6',TH(1.4));
    if(l>=2)s+=P('M50 26 q-8 -14 -16 6 M50 26 q8 -14 16 6 M50 26 v-12',0,TH(2,'#7fc4f0'));
    if(l>=3)s+=swan(30,44).replace(/#2b2a30/,'#7fc4f0')+bench(4,70)+bench(64,70);
    return s;},
  kiosk:function(l,se){var s='',x=50;s+=R(x-28,20,56,50,'#3f8fe0',2)+R(x-22,30,44,22,'#bfe0f2',2,TH(1.4))+R(x-28,64,56,6,'#2a5d99',1,TH(1.2));
    if(l>=2)s+=P('M'+(x-32)+' 24 h64 l-4 8 h-56z','#e5484d')+P('M'+(x-22)+' 24 l-2 8 M'+(x-8)+' 24 v8 M'+(x+8)+' 24 v8 M'+(x+22)+' 24 l2 8',0,' stroke="#fff" stroke-width="2.4"')+R(x-18,36,10,13,'#fffaf0',0,TH(.8))+R(x-6,36,10,13,'#ffe9a8',0,TH(.8))+R(x+6,36,10,13,'#fffaf0',0,TH(.8));
    s+=R(x-30,6,60,14,l>=3?'#ffcf40':'#fffaf0',3,TH(1.4))+T(x,16,l>=3?L2('СОЮЗПЕЧАТЬ','NEWSPAPERS'):L2('ПЕЧАТЬ','PRESS'),l>=3?7.4:8.5);
    return s;},
  rocket:function(l,se){var s='',body=l>=2?'#e5484d':'#b9c3cc';s+=P('M40 72 v-44 q10 -26 20 0 v44z',body)+P('M40 60 l-10 12 h10z M60 60 l10 12 h-10z','#3f8fe0')+C(50,38,5,'#bfe0f2',TH(1.2));
    if(l>=2)s+=T(50,56,L2('СССР','USSR'),6.5,'#fff');s+=P('M60 64 q22 2 30 10',0,TH(4,'#ffd23f'))+P('M60 64 q22 2 30 10',0,TH(1));
    if(l>=3)s+=P('M32 72 v-30 M28 66 h8 M28 58 h8 M28 50 h8',0,TH(1.4))+T(78,30,'★',12,'#ffd23f')+T(20,24,'★',9,'#ffd23f');
    return s;},
  stop:function(l,se){var s='';s+=P('M14 72 v-50',0,TH(2.4))+C(14,20,8,'#fff',TH(1.6))+T(14,24,L2('А','B'),10,'#2f6fd0')+bench(30,56);
    if(l>=2)s+=R(26,20,46,4,'#3f8fe0',1)+P('M28 24 v34 M70 24 v34',0,TH(2))+R(30,26,38,26,'rgba(190,225,245,.55)',1,TH(1));
    if(l>=3)s+=R(76,30,22,44,'#f9ca24',4,TH(1.6))+R(79,34,16,10,'#9fc6dd',1,TH(1))+R(79,60,16,10,'#9fc6dd',1,TH(1));
    return s;},
  trees:function(l,se){var s='',n=l>=2?3:3,r=l>=2?15:7;for(var i=0;i<n;i++)s+=tree(18+i*32,40,r,se);
    if(l<2)for(var j=0;j<3;j++)s+=P('M'+(18+j*32)+' 70 v-24',0,TH(1.6));
    if(l>=3)[34,66].forEach(function(x){s+=P('M'+x+' 76 v-40',0,TH(2))+R(x-5,32,10,5,'#ffd96a',1,TH(1))+E(x,46,12,8,'rgba(255,230,120,.25)',NS);});
    return s;},
  well:function(l,se){var s='';s+=R(40,24,14,44,'#3f6f8f',3)+P('M54 32 h18 v6',0,TH(3))+P('M40 28 l-12 -8',0,TH(2.4))+E(64,68,10,3,'#7fc4f0',TH(1));
    if(l>=2)s+=P('M6 70 l3 -12 h12 l3 12z','#9aa7b0')+P('M76 70 l3 -12 h12 l3 12z','#9aa7b0')+bench(10,72).replace(/#3d8b4a/g,'#b9783a');
    if(l>=3)s+=P('M30 18 l17 -12 l17 12z','#b5523b')+P('M33 18 v52 M61 18 v52',0,TH(1.6))+flowers(70,40,3);
    return s;},
  shed:function(l,se){var s='';s+=R(4,30,42,40,'#a0703e',1)+P('M0 32 l25 -16 l25 16z','#7a5a3a')+P('M10 70 v-30 M18 70 v-30 M26 70 v-30 M34 70 v-30 M42 70 v-30',0,TH(.8));
    if(l>=2)s+=R(54,26,42,44,'#c8925a',1)+P('M50 28 l25 -18 l25 18z','#8a4a2b')+R(66,44,16,26,'#7a4a2a',1,TH(1.2))+R(84,36,8,8,'#ffd96a',1,TH(1));
    if(l>=3)s+=R(88,4,6,14,'#7a7a7a',1,TH(1.2))+P('M91 2 q-6 -6 0 -10 q6 -6 0 -12',0,' stroke="#ddd" stroke-width="3" stroke-linecap="round" fill="none"');
    return s;},
  garden:function(l,se){var s='';for(var i=0;i<3;i++)s+=R(6,10+i*20,56,14,'#8a5a3a',3,TH(1.2))+[0,1,2,3,4].map(function(k){return P('M'+(12+k*11)+' '+(16+i*20)+' l2 -5 l2 5',0,TH(1.6,'#2fa84f'));}).join('');
    if(l>=2)s+=P('M68 70 v-36 l14 -10 l14 10 v36z','rgba(200,235,250,.6)')+P('M82 24 v46 M68 48 h28',0,TH(1));
    if(l>=3)s+=P('M30 74 v-20 M22 60 h16',0,TH(2,'#8a5a3a'))+C(30,52,4,'#f2c7a5',TH(1))+P('M25 50 l5 -6 l5 6z','#e0a85a',TH(1))+C(70,74,3,'#ff7a1a',TH(1))+C(78,76,3,'#e5484d',TH(1));
    return s;}};
function dove(x,y){return '<g transform="translate('+x+' '+y+')">'+E(0,0,5,3,'#f4f6fa',TH(1))+C(4,-2,2.2,'#f4f6fa',TH(1))+P('M-2 -1 l-3 -5 l5 3','#dfe6f0',TH(1))+'</g>';}
MY.DRAW=DRAW;
// пустое место под постройку: пунктир + табличка с ценой
function plot(w,h,price,lock){return R(3,3,w-6,h-6,lock?'rgba(0,0,0,.05)':'rgba(255,255,255,.3)',8,' stroke="'+K+'" stroke-width="1.6" stroke-dasharray="5 4" stroke-opacity=".7"')+
  (price?'<g class="mytag">'+R(w/2-28,h/2-10,56,20,'#fffaf0',10,TH(1.4))+T(w/2-5,h/2+4.5,price,10.5,K)+C(w/2+16,h/2,5.5,'#ffc233',TH(1.2,'#e89a00'))+'</g>':'');}
// слоты сцены: x, y, w, h (поле вида — 100×80, стоянка — 150×110)
var SLOTS=[[10,90,120,72],[240,92,150,110],[8,170,112,84],[126,170,106,84],[134,92,100,72],[240,208,150,48]];
MY.SLOTS=SLOTS;
function place(i,inner,nat){var b=SLOTS[i],nw=nat?nat[0]:100,nh=nat?nat[1]:80,k=Math.min(b[2]/nw,b[3]/nh),dx=b[0]+(b[2]-nw*k)/2,dy=b[1]+(b[3]-nh*k)/2;
  return '<g transform="translate('+dx.toFixed(1)+' '+dy.toFixed(1)+') scale('+k.toFixed(3)+')">'+inner+'</g>';}
// сцена двора y: o = {lv:[6], hot, prices, mini}
MY.scene=function(y,o){o=o||{};var Y=YARDS[y],se=SEA[Y.s],lv=o.lv||MY.ylv(y),s='',lit=[],tot=lv.reduce(function(a,b){return a+b;},0);
  for(var i=0;i<Math.min(18,tot);i++)lit.push((i*7)%18); // свет в окнах — сколько построено
  s+=house(Y.h,se,lit)+ground(se);
  if(Y.h!=='dacha')s+=tree(392,100,16,se)+tree(4,262,18,se);
  for(var k=0;k<6;k++){var kind=Y.o[k],l=lv[k],nat=kind==='park'?[150,110]:null,inner;
    if(l>0)inner=DRAW[kind](l,se,y);else inner=plot(nat?150:100,nat?110:80,o.prices?String(MY.price(y,k,0)):'',o.lock);
    s+='<g class="myobj'+(l?'':' empty')+'" data-s="'+k+'">'+place(k,inner,nat)+'</g>';}
  if(y===0&&MY.seaDeco)try{s+=MY.seaDeco();}catch(e){}
  if(o.hot)SLOTS.forEach(function(b,k){s+='<rect class="myhot" data-s="'+k+'" x="'+b[0]+'" y="'+b[1]+'" width="'+b[2]+'" height="'+b[3]+'" fill="rgba(0,0,0,0)" stroke="none"/>';});
  if(o.lock)s+=R(0,0,400,260,'rgba(40,30,20,.45)',0,NS)+T(200,122,'🔒',40,'#fff')+T(200,156,L2('Откроется в районе «','Opens in the “')+MY.distName(y)+L2('»','” district'),16,'#fff');
  return '<svg class="myscn" width="400" height="260" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+MY.esc(Y.n)+'">'+s+'</svg>';};
// значок объекта (для списка): вид k, уровень l, сезон двора y
MY.icon=function(y,i,l){var kind=YARDS[y].o[i],se=SEA[YARDS[y].s],nat=kind==='park'?'0 0 150 110':'0 0 100 80';
  var inner=l>0?DRAW[kind](l,se,y):DRAW[kind](1,se,y);
  return '<svg viewBox="'+nat+'" class="myico'+(l?'':' ghost')+'" aria-hidden="true">'+R(-10,-10,170,130,se.g,0,NS)+inner+'</svg>';};

/* =====================================================================================
   ЭКРАН «МОЙ ДВОР» (#scr-my): шапка, вкладки (Двор · Альбом · Гараж · Лига — регистрируют album/garage/league через MY.tab)
   ===================================================================================== */
var TABS=[{id:'yard',n:L2('Двор','Yard'),ic:'🏡',o:0,dot:function(){return MY.park()>=Math.max(20,MY.parkRate()*4)||!!MY.mail()||canBuild();}}],cur='yard',back=null,ysel=0;
function canBuild(){var nb=MY.next();return !!nb&&MY.coins()>=nb.c;}
MY.tab=function(t){TABS.push(t);TABS.sort(function(a,b){return (a.o||0)-(b.o||0);});};
function ensureScreen(){var sc=Q('scr-my');if(sc)return sc;sc=document.createElement('section');sc.id='scr-my';sc.className='screen myscr';
  sc.innerHTML='<header class="gh"><button class="icon" id="myBack" aria-label="'+L2('Назад','Back')+'">←</button><div class="gt"><div id="myTitle">'+L2('Мой двор','My yard')+'</div><div id="mySub" class="sub"></div></div>'+
    '<button class="pill sm myprt" id="myPrt" aria-label="'+L2('Детали','Parts')+'">🔩 0</button><button class="pill sm" id="myCoins">💰 0</button></header>'+
    '<div class="mybody"><div class="mytabs" id="myTabs" role="tablist"></div><div class="mypane" id="myPane"></div></div>';
  (Q('app')||document.body).appendChild(sc);
  Q('myBack').onclick=function(){MY.snd('tap');MY.close();};
  Q('myCoins').onclick=function(){try{openShop();}catch(e){}};
  Q('myPrt').onclick=function(){MY.snd('tap');prtInfo();};
  return sc;}
MY.close=function(){var b=back;back=null;if(typeof b==='function')b();else try{if(window.UI&&UI.go&&UI.has&&UI.has('home'))UI.go('home');else openMap();}catch(e){try{openMap();}catch(x){}}};
/* KEYS: клавиатура на ПК — общий движок UI.keys (vy-ux js/ui-keys.js): цифры 1–N — вкладки (data-keys-num), Q/E (Й/У) — соседняя вкладка, стрелки/Enter/Esc — движок; нет движка — ничего */
var keysOn=0;function keysHook(){if(keysOn||!window.UI||!UI.keys)return;keysOn=1;
  UI.keys.on('my',function(k){var lk=String(k).toLowerCase(),d=lk==='q'||lk==='й'||lk==='['?-1:lk==='e'||lk==='у'||lk===']'?1:0;if(!d)return false;
    var i=0;for(var j=0;j<TABS.length;j++)if(TABS[j].id===cur)i=j;var t=TABS[(i+d+TABS.length)%TABS.length];if(!t||t.id===cur)return true;
    MY.snd('tap');cur=t.id;try{STAT.screen(cur==='yard'?'myyard':cur);}catch(e){}MY.render();try{UI.keys.ring(document.querySelector('#myTabs .mytab.on'));}catch(e){}return true;});
  UI.keys.hint('my',function(){var n=TABS.length;return L2('1–'+n+' или Q/E — вкладки · стрелки — выбор · Enter — нажать · Esc — назад','1–'+n+' or Q/E — tabs · arrows — select · Enter — press · Esc — back');});}
try{if(document.readyState!=='loading')keysHook();else document.addEventListener('DOMContentLoaded',keysHook);}catch(e){}
MY.open=function(tab,bk){ensureScreen();keysHook();if(tab&&typeof tab==='string'){var m=/^yard(\d)$/.exec(tab);if(m){ysel=Math.min(5,+m[1]);tab='yard';}if(TABS.some(function(t){return t.id===tab;}))cur=tab;}
  if(bk)back=bk;try{hideModal();}catch(e){}
  try{if(window.UI&&UI.show)UI.show('scr-my');}catch(e){}if(!Q('scr-my').classList.contains('on'))try{show('scr-my');}catch(x){}
  try{if(G){YG.stop();}}catch(e){}
  try{STAT.screen(cur==='yard'?'myyard':cur);}catch(e){}MY.render();};
MY.isOpen=function(){var s=Q('scr-my');return !!s&&s.classList.contains('on');};
MY.render=function(){if(!Q('scr-my'))return;hdr();
  Q('myTabs').innerHTML=TABS.map(function(t){var dot=false;try{dot=t.dot&&t.dot();}catch(e){}return '<button class="mytab'+(t.id===cur?' on':'')+'" role="tab" data-t="'+t.id+'" aria-selected="'+(t.id===cur)+'" data-keys-num'+(t.id===cur?' data-keys-default':'')+'><span>'+t.ic+'</span>'+t.n+(dot?'<i class="mydot"></i>':'')+'</button>';}).join('');
  Q('myTabs').querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){if(cur===b.dataset.t)return;MY.snd('tap');cur=b.dataset.t;try{STAT.screen(cur==='yard'?'myyard':cur);}catch(e){}MY.render();};});
  var t=TABS.filter(function(x){return x.id===cur;})[0]||TABS[0],pane=Q('myPane');Q('myTitle').textContent=t.title||(t.id==='yard'?L2('Мой двор','My yard'):t.n);
  Q('mySub').textContent=t.sub?t.sub():'';pane.className='mypane mp-'+t.id;
  try{if(t.id==='yard')renderYard(pane);else t.render(pane);}catch(e){MY.err('render',e);pane.innerHTML='<p class="mynote">'+L2('Не получилось открыть. Попробуй ещё раз.','Could not open. Please try again.')+'</p>';}
  pane.scrollTop=0;};
MY.cur=function(){return cur;};
function hdr(){try{Q('myCoins').textContent='💰 '+MY.coins();Q('myPrt').textContent='🔩 '+VYPRT.get();}catch(e){}}
MY.hdr=hdr;
try{var uc0=window.updCoins;if(typeof uc0==='function')window.updCoins=function(){var r=uc0.apply(this,arguments);try{if(Q('myCoins'))hdr();}catch(e){}return r;};}catch(e){}
MY.on('prt',function(){hdr();});

function prtInfo(){var p=pd(),h='<h2>🔩 '+L2('Детали','Parts')+'</h2><p class="mybigprt">'+VYPRT.get()+' 🔩</p><p>'+L2('Детали нужны Толику «Карбюратору», чтобы реставрировать машины Автоальбома. <b>Купить их нельзя</b> — только заработать:','Tolik “Carburettor” needs parts to restore the album cars. <b>They can’t be bought</b> — only earned:')+'</p>'+
  '<ul class="mylist"><li>'+L2('★★★ во дворе впервые — 2 🔩 (финал десятки — 3), до '+CAP.lvl+' в день · сегодня '+p.lvl,'★★★ in a yard for the first time — 2 🔩 (3 for a boss yard), up to '+CAP.lvl+' a day · today '+p.lvl)+'</li><li>'+L2('затеи и «Перекур у Толика» — до '+capOf('mg')+' в день · сегодня '+p.mg,'mini-games and “Smoke break at Tolik’s” — up to '+capOf('mg')+' a day · today '+p.mg)+'</li>'+
  '<li>'+L2('голубиная почта во дворе — до 3 в день','pigeon post in your yard — up to 3 a day')+'</li><li>'+L2('сундук дня, заказы жильцов, лига соседей','the daily chest, resident orders, the neighbours’ league')+'</li></ul>';
  try{modal(h+'<div class="row"><button class="btn" id="mCancel">'+L2('Понятно','OK')+'</button></div>');Q('mCancel').onclick=function(){hideModal();};}catch(e){}}
MY.prtInfo=prtInfo;

function renderYard(el){var d=MY.dist();if(ysel>5)ysel=0;var y=ysel,Y=YARDS[y],open=MY.open_(y),lv=MY.ylv(y),sum=MY.ysum(y);
  var h='<div class="mycolL"><div class="myysel" role="tablist">'+YARDS.map(function(Yd,k){var op=MY.open_(k),n=MY.ysum(k);return '<button class="myyb'+(k===y?' on':'')+(op?'':' lock')+'" data-y="'+k+'" aria-label="'+MY.esc(yn(Yd))+'"><b>'+(op?k+1:'🔒')+'</b><small>'+(op?n+'/18':MY.distName(k))+'</small></button>';}).join('')+'</div>';
  h+='<div class="mystage" id="myStage">'+MY.scene(y,{hot:open,prices:open,lock:!open})+'<div class="myyname"><b>'+MY.esc(yn(Y))+'</b><small>'+MY.esc(ysub(Y))+L2(' · район «',' · “')+MY.distName(y)+L2('»','” district')+'</small></div></div>';
  // стоянка и почта
  var pk=MY.park(),rate=MY.parkRate(),ml=MY.mail();
  if(rate||ml){var full=MY.parkFull();h+='<div class="mypark'+(full?' full':'')+'"><span class="mypi">🅿️</span><span class="mypt"><b>'+(full?L2('Стоянка полная — забери!','The car park is full — collect!'):rate?L2('Стоянка копит монеты','The car park earns coins'):L2('Голубиная почта','Pigeon post'))+'</b><small>'+(rate?rate+L2(' 💰 в час, пока тебя нет · вмещает ',' 💰 an hour while you’re away · holds ')+MY.parkCap()+' 💰':L2('Построй стоянку — будет копить монеты','Build a car park — it will earn coins'))+(ml?L2(' · почта голубей: ',' · pigeon post: ')+ml+' 🔩':'')+'</small></span>'+
    '<button class="btn '+(pk>0||ml?'green':'')+' noenter" id="myCol"'+(pk>0||ml?'':' disabled')+'>'+(pk>0?L2('Забрать +','Collect +')+pk+' 💰':ml?L2('Забрать ','Collect ')+ml+' 🔩':L2('Пусто','Empty'))+'</button></div>';}
  else if(open&&y===0)h+='<div class="mypark"><span class="mypi">🅿️</span><span class="mypt"><b>'+L2('Построй стоянку','Build a car park')+'</b><small>'+L2('Она копит монеты, пока ты не играешь: 2–4 💰 в час','It earns coins while you’re not playing: 2–4 💰 an hour')+'</small></span></div>';
  h+='<div class="myprog"><div class="mybar"><i style="width:'+Math.round(sum/18*100)+'%"></i></div><span><b>'+sum+'</b>'+L2(' из 18 · всего дворов: ',' of 18 · all yards: ')+MY.total()+L2(' из 108',' of 108')+'</span></div>';
  if(!open)h+='<p class="goal mylockp">🔒 «'+MY.esc(yn(Y))+L2('» откроется, когда ты дойдёшь до района «','” opens when you reach the “')+MY.distName(y)+L2('» в карьере. Сейчас твой район — «','” district in your career. Your district now: “')+MY.distName(d)+L2('».','”.')+'</p>';
  h+='</div><div class="mycolR"><div class="mylistb">'+Y.o.map(function(kind,i){var Kd=KIND[kind],l=lv[i],nx=l<3?l+1:0,c=nx?MY.price(y,i,l):0,can=open&&nx&&MY.coins()>=c;
    var st='';for(var k=1;k<=3;k++)st+='<i class="'+(k<=l?'on':'')+'"></i>';
    return '<div class="myb'+(l>=3?' done':'')+'" data-s="'+i+'"><span class="mybi">'+MY.icon(y,i,l)+'</span><span class="mybt"><b>'+kn(Kd)+'</b><span class="myst">'+st+'</span><small>'+
      (l?kg(Kd,l-1):L2('Ещё не построено','Not built yet'))+'</small>'+(nx?'<small class="mynx">'+L2('Ур. ','Lvl ')+nx+': '+kg(Kd,nx-1)+'</small>':'')+'</span>'+
      (nx?(!open?'<span class="mylk">🔒</span>':'<button class="btn '+(can?'accent':'')+' mybuy noenter" data-buy="'+i+'"'+(can?'':' aria-disabled="true"')+'>'+c+' 💰</button>'):'<span class="myok">✓</span>')+'</div>';}).join('')+'</div>';
  h+='</div><p class="mynote">'+L2('Постройки не меняют дворы-головоломки — это твой двор: красота и польза (стоянка, почта, гаражи Толика). Лавочки, цветы, лебедь, качели, кормушка и гирлянда двора №1 видны во всех дворах игры.','Buildings don’t change the puzzle yards — this is your own yard: looks and perks (car park, post, Tolik’s garages). The benches, flowers, swan, swing, feeder and lights of yard 1 appear in every yard of the game.')+'</p>';
  el.innerHTML=h;
  el.querySelectorAll('[data-y]').forEach(function(b){b.onclick=function(){MY.snd('tap');ysel=+b.dataset.y;MY.render();};});
  el.querySelectorAll('[data-buy]').forEach(function(b){b.onclick=function(e){e.stopPropagation();buyAsk(y,+b.dataset.buy);};});
  el.querySelectorAll('.myb').forEach(function(r){r.onclick=function(){bInfo(y,+r.dataset.s);};});
  el.querySelectorAll('.myhot').forEach(function(r){r.addEventListener('click',function(){var i=+r.getAttribute('data-s');var row=el.querySelector('.myb[data-s="'+i+'"]');if(row){row.classList.add('hl');setTimeout(function(){row.classList.remove('hl');},1200);}bInfo(y,i);});});
  var cb=Q('myCol');if(cb)cb.onclick=function(){var g=MY.collect('my');if(g.c||g.p){MY.toast(colTxt(g),2400);try{if(g.c)coinFx(g.c,cb);}catch(e){}}MY.render();};}
function colTxt(g){return (g.c?'+'+g.c+L2(' 💰 со стоянки',' 💰 from the car park'):'')+(g.c&&g.p?' · ':'')+(g.p?'+'+g.p+L2(' 🔩 почтой',' 🔩 by post'):'');}
function bInfo(y,i){var Y=YARDS[y],kind=Y.o[i],Kd=KIND[kind],l=MY.lv(y,i),nx=l<3?l+1:0,c=nx?MY.price(y,i,l):0,open=MY.open_(y);
  var h='<h2>'+Kd.ic+' '+kn(Kd)+'</h2><div class="mybig">'+MY.icon(y,i,nx||3).replace(' ghost','')+'</div><div class="mylvls">'+Kd.g.map(function(g0,k){return '<div class="'+(k<l?'on':k===l?'nx':'')+'"><b>'+(k+1)+'</b><span>'+kg(Kd,k)+'</span><i>'+(k<l?'✓':MY.price(y,i,k)+' 💰')+'</i></div>';}).join('')+'</div>';
  if(kind==='gar')h+='<p class="mynote">'+L2('В гаражах Толик «Карбюратор» реставрирует ржавые машины из Автоальбома.','In the garages Tolik “Carburettor” restores the rusty album cars.')+'</p>';
  if(kind==='park')h+='<p class="mynote">'+L2('Стоянки всех дворов копят вместе. Пока тебя нет — до '+PARK_H+' часов.','The car parks of all yards earn together — up to '+PARK_H+' hours while you’re away.')+'</p>';
  var row='';
  if(nx){if(!open)row='<p class="goal">🔒 '+L2('Двор откроется в районе «','The yard opens in the “')+MY.distName(y)+L2('».','” district.')+'</p>';
    else if(MY.coins()>=c)row='<div class="row"><button class="btn accent" id="myDo">'+L2('Построить','Build')+' · '+c+' 💰</button></div>';
    else row='<p class="goal">'+L2('Не хватает ','You need ')+MY.ct(c-MY.coins())+L2('. Монеты — за дворы, сундуки, стоянку и лигу соседей.',' more. Coins come from yards, chests, your car park and the league.')+'</p>'+(window.TD&&typeof TD.stashNeed==='function'?'<div class="row"><button class="btn noenter" id="myStash">'+L2('Где взять монеты?','Where to get coins?')+'</button></div>':'');}
  try{modal(h+row+'<div class="row"><button class="btn" id="mCancel">'+L2('Закрыть','Close')+'</button></div>');}catch(e){return;}
  if(Q('myDo'))Q('myDo').onclick=function(){hideModal();doBuild(y,i);};
  if(Q('myStash'))Q('myStash').onclick=function(){hideModal();try{TD.stashNeed(c);}catch(e){}};
  Q('mCancel').onclick=function(){hideModal();};}
function buyAsk(y,i){var l=MY.lv(y,i),c=MY.price(y,i,l);if(l>=3)return;if(!MY.open_(y)||MY.coins()<c){bInfo(y,i);return;}doBuild(y,i);}
function doBuild(y,i){if(!MY.build(y,i))return;MY.render();var st=Q('myStage');if(st){st.classList.remove('bump');void st.offsetWidth;st.classList.add('bump');}
  var o=document.querySelector('#myStage .myobj[data-s="'+i+'"]');if(o){o.classList.add('pop');}
  var Kd=KIND[YARDS[y].o[i]],l=MY.lv(y,i);MY.toast(Kd.ic+' '+kn(Kd)+L2(': уровень ',': level ')+l+'!');
  try{if(!MY.calm()&&typeof confetti==='function'&&l===3)confetti();}catch(e){}}

/* ---------- главный экран: карточка «Мой двор» (гнездо homeSlots UX; до гнезда — кнопка на карте) ---------- */
var HL=[]; // строки карточки от модулей: {pri, f()→{ic,t,a(tab)} | null}
MY.homeLine=function(o){HL.push(o);HL.sort(function(a,b){return (a.pri||50)-(b.pri||50);});};
MY.dot=function(){return TABS.some(function(t){try{return t.dot&&t.dot();}catch(e){return false;}});};
MY.homeLine({pri:10,f:function(){var a=MY.away();if(a.c<=0&&!a.p)return null;return {ic:'🅿️',t:(a.full?L2('Стоянка полная: ','Car park full: '):L2('Стоянка: ','Car park: '))+'+'+a.c+' 💰'+(a.p?L2(' · почта ',' · post ')+a.p+' 🔩':''),a:'collect'};}});
MY.homeLine({pri:60,f:function(){var nb=MY.next();if(!nb)return null;var Kd=KIND[YARDS[nb.y].o[nb.i]];return {ic:Kd.ic,t:(MY.coins()>=nb.c?L2('Можно построить: ','Ready to build: '):L2('Следующее: ','Next: '))+kn(Kd).toLowerCase()+' — '+nb.c+' 💰',a:'yard'+nb.y};}});
MY.homeCard=function(){var lines=[];HL.forEach(function(o){try{var r=o.f();if(r)lines.push(r);}catch(e){}});lines=lines.slice(0,3);
  var y=0;for(var k=5;k>=0;k--)if(MY.open_(k)&&MY.ysum(k)>0){y=k;break;}
  var h='<div class="myhome" id="myHome"><button class="myhsc noenter" data-a="yard'+y+'" aria-label="'+L2('Мой двор','My yard')+'">'+MY.scene(y,{})+'<b class="myhlab">🏡 '+L2('Мой двор','My yard')+(MY.dot()?'<i class="mydot"></i>':'')+'</b></button>'+
    '<div class="myhl">'+lines.map(function(x){return '<button class="myhr noenter" data-a="'+x.a+'"><span>'+x.ic+'</span><em>'+MY.esc(x.t)+'</em><i>›</i></button>';}).join('')+'</div></div>';
  return {html:h,bind:function(el){(el||document).querySelectorAll('#myHome [data-a]').forEach(function(b){b.onclick=function(){MY.snd('tap');var a=b.dataset.a;
    if(a==='collect'){var g=MY.collect('home');if(g.c||g.p){MY.toast(colTxt(g),2400);try{if(g.c)coinFx(g.c,b);}catch(e){}}try{if(window.UI&&UI.refresh)UI.refresh();else MY.homeRefresh();}catch(e){}return;}
    MY.open(a);};});}};};
var HOMEMODE='';
// запасной вход до гнёзд UX: кнопка «🏡 Двор» в нижней панели карты + карточка в боковой панели ПК
MY.homeRefresh=function(){if(HOMEMODE!=='fb')return;var nav=document.querySelector('#scr-map .mnav');if(!nav)return;
  var b=Q('btnMy');if(!b){b=document.createElement('button');b.id='btnMy';b.className='btn sq noenter';b.setAttribute('aria-label',L2('Мой двор','My yard'));
    var ref=Q('btnStreak');if(ref&&ref.parentNode===nav)nav.insertBefore(b,ref);else nav.appendChild(b);b.onclick=function(){MY.snd('tap');MY.open('yard');};}
  b.innerHTML='🏡<small>'+L2('Двор','Yard')+'</small>'+(MY.dot()?'<span class="dot"></span>':'');
  var side=Q('mapSide');if(side){var w=Q('myHomeWrap');if(!w){w=document.createElement('div');w.id='myHomeWrap';side.appendChild(w);}var c=MY.homeCard();w.innerHTML=c.html;c.bind(w);}};
function homeHook(){var H=window.homeSlots,ux=Array.isArray(H)&&window.UI&&UI.screen;
  if(ux){try{
    // низ главного — «свой двор» (сцена + строки), окно пятиэтажки — Толик, когда в гараже есть дело
    H.push({id:'myyard',order:60,zone:'yard',render:function(){return MY.homeCard().html;},mount:function(el){MY.homeCard().bind(el);}});
    H.push({id:'w-tolik-gar',order:40,zone:'win',render:function(){try{if(!window.TOLIK||!window.ALB)return null;var r=TOLIK.ready(),rs=ALB.rusty().length;
      if(r)return {who:'tolik',t:L2('Машина готова!','A car is ready!'),s:L2('Забери у Толика','Collect it from Tolik'),badge:'🔧',go:function(){MY.open('garage');}};
      if(rs&&TOLIK.slots()&&TOLIK.free())return {who:'tolik',t:L2('Ржавых машин: ','Rusty cars: ')+rs,s:L2('Толик ждёт работу','Tolik is waiting for work'),badge:'!',go:function(){MY.open('garage');}};
      if(MY.parkFull())return {who:'tolik',t:L2('Стоянка полная','The car park is full'),s:'+'+MY.park()+' 💰',badge:'🅿️',go:function(){MY.open('yard');}};}catch(e){}return null;}});
    if(Array.isArray(window.navSlots))navSlots.push({id:'my',order:25,ic:'🏡',t:L2('Мой двор','My yard'),go:'my',dot:function(){try{return MY.dot();}catch(e){return false;}}});
    UI.screen('my',function(o){MY.open(o&&o.tab||(typeof o==='string'?o:''));});['album','garage','league'].forEach(function(t){UI.screen('my-'+t,function(){MY.open(t);});});
    try{UI.refresh&&UI.refresh();}catch(e){}}catch(e){MY.err('home',e);}}
  // главного экрана UX ещё нет (ui-home.js) — запасной вход: кнопка «🏡 Двор» на карте и карточка в боковой панели ПК
  if(ux&&window.UI&&UI.homeRender){HOMEMODE='ux';return;}
  HOMEMODE='fb';var om=window.openMap;if(typeof om==='function')window.openMap=function(){var r=om.apply(this,arguments);try{MY.homeRefresh();}catch(e){MY.err('hr',e);}return r;};
  MY.homeRefresh();}
// старый гараж: вкладка «Двор» теперь ведёт в «Мой двор» (украшения — уровни двора №1)
function hookGarage(){var og=window.openGarage;if(typeof og!=='function')return;
  window.openGarage=function(tab){if(tab==='yard'){MY.open('yard0',function(){try{og('cars');}catch(e){}});return;}var r=og.apply(this,arguments);
    try{var t=document.querySelector('#garGrid .gtabs [data-t="yard"]');if(t){t.innerHTML='🏡 '+L2('Мой двор','My yard')+' '+MY.ysum(0)+'/18'+(MY.dot()?'<span class="dot"></span>':'');}
      var g=Q('garGrid');if(g&&!Q('myAlbLink')&&window.ALB){var a=document.createElement('button');a.id='myAlbLink';a.className='btn myalblink noenter';a.innerHTML='📒 '+L2('Автоальбом: ','Car album: ')+ALB.count()+L2(' из ',' of ')+ALB.N+L2(' машин · гараж Толика ›',' cars · Tolik’s garage ›');a.onclick=function(){MY.snd('tap');MY.open('album',function(){try{og('cars');}catch(e){}});};
        var tabs=g.querySelector('.gtabs');if(tabs&&tabs.nextSibling)g.insertBefore(a,tabs.nextSibling);else g.appendChild(a);}}catch(e){MY.err('gar',e);}
    return r;};}
// имена для других потоков: CAR (today.js, orders.js, career.js) — window.YARD; MG0 — window.PRT
window.YARD=window.YARD||{};
YARD.addParts=function(n,why){return VYPRT.add(n,why||'td');};
YARD.giveCar=function(id,src){return window.ALB?ALB.give(id,src||'gift'):false;};
YARD.onDist=function(d){try{if(window.ALB)ALB.sync(false);}catch(e){}try{if(MY.open_(d))MY.toast('🏡 '+L2('Открыт новый двор: «','A new yard is open: “')+MY.YARDS[d].n+L2('»!','”!'),3200);}catch(e){}};
YARD.prg=function(){return MY.prg();};YARD.open=function(t){MY.open(t);};
/* vy-merge: машина, собранная в мастерской Толика (MG0), — в Автоальбом ржавой (если уже есть — ничего) */
try{if(window.VYMG&&!VYMG.onBuilt)VYMG.onBuilt=function(id){try{if(window.ALB&&ALB.byId(id)&&!ALB.has(id))ALB.give(id,'mg');}catch(e){}};}catch(e){}
window.PRT={add:function(n,src){return VYPRT.add(n,src||'mg');},n:function(){return VYPRT.get();}};
// детали, накопленные лентой «Сегодня» до прихода YARD
MY.on('start',function(){try{if(window.TD&&TD.takeParts){var n=TD.takeParts();if(n>0)VYPRT.add(n,'td',true);}}catch(e){}});
MY.prg=function(){var o={yd:MY.total(),pt:VYPRT.get()};try{if(window.ALB)o.al=ALB.count();}catch(e){}try{o.lg=S.lgaL|0;}catch(e){}return o;};

/* ---------- запуск: после album/garage/league (они регистрируются синхронно) ---------- */
MY.start=function(){if(MY.started)return;MY.started=true;hookYard();hookGarage();MY.fire('start');homeHook();parkAccrue();MY.save();
  if(/[?&]my=/.test(location.search)){var m=/[?&]my=([a-z0-9]+)/.exec(location.search);setTimeout(function(){MY.open(m&&m[1]);},60);}};
setTimeout(MY.start,0);
if(typeof window.__test==='object')try{window.__test.MY=MY;}catch(e){}
})();
