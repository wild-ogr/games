'use strict';
/* ================= zb-cab — экран «Школа №7» и 8 кабинетов × 3 уровня (поток CAB, ветка zb-cab, 10.10.2026) =================
   Журнал: hobby-analytics/release-i/zina-boost/logs/CAB.md. Числа — ТОЛЬКО ZBECO (zb-eco.js, хозяин ECO), читаются в момент вызова;
   рисунки кабинетов — content/cab/cab-N.js (CAB-1/CAB-2), фасад — content/cab/school.js; грузятся лениво (ZB.load) при входе в школу.
   Герои — ZBP (js/zb-people.js). Класс игрока — ZBS.cls() (SCHOOL); до слияния — прикидка по пройденным уровням.
   ВЫКЛЮЧЕНИЕ: window.ZBCAB_ON=false (до загрузки) — модуль ничего не делает, игра как раньше. Отдельный кабинет — OFF ниже
     (табличка «На ремонте · Кабинет откроется в N классе», без «скоро»).
   СОХРАНЕНИЕ (ZB.onSave, свои поля S.cb*):
     S.cbL {id: 0..3}  — уровень кабинета (сила, за монеты);  S.cbV {id: 0..3} — уровень ВИДА от «Ремонта кабинета» (голоса), вид = max(cbL, cbV);
     S.cbB  — мс: с какого момента копит столовая;  S.cbY — номер дня, когда Ять в последний раз принёс букву;
     S.cbS  — строка букв полок словаря, за которые уже дали монеты;  S.cbG {глава: 1} — золотые открытки, за которые дали монеты;
     S.cbN {id: 1} — заходил в кабинет (знакомство героя).  Слияние облака: уровни — max по id; cbB, cbY — max (забранное не дублируется);
     cbS, cbG, cbN — объединение. Монеты — общим правилом (облако + заработанное с синхронизации).
     Ателье Толика пишет S.ecSew {id, k:'o'|'s', t: когда готово, p: заплачено} по схеме ECO (поле и слияние — ECO).
   НАРУЖУ: window.ZBCAB = {
     ids, on, cls(), lv(id), vis(id), open(id) (класс дорос и кабинет не выключен), price(id) (цена следующего уровня, 0 — максимум),
     can(id) (хватает монет), up(id) (купить уровень → true), grant(cl) (SCHOOL zb-migrate: ур.1 даром кабинетам до класса cl → [{id,n}]),
     canRemont() (ECO витрина: есть открытый кабинет с видом < 3),
     remont(id) (применить купленный «Ремонт кабинета» → true), steps() (уровней всего, 0..24), dot() (есть что забрать/улучшить — для панели),
     bufet() {n, full, perH}, bufetTake(), yatReady(), yatTake(), go(id?) (экран школы / кабинет), render(el) (школа в чужую рамку),
     homeHtml() (строка для главного) }
   СОБЫТИЯ: ZB.emit('cab', {id, lv, vis, by:'coins'|'grant'|'remont'}); статистика STAT.ev('cab', {a:'up'|'remont'|'buf'|'yat'|'sew'|'shelf'|'card', …}).
*/
(function(){
if(window.ZBCAB_ON===false||!window.ZB)return;
var OFF={}; // отсечка 19.10: id недоделанных кабинетов → true (табличка «На ремонте»)
var ROOM={ // порядок = номер рисунка content/cab/cab-N.js; кто встречает в кабинете
  russkij:{n:1,who:'vp',ic:'📖'},stolovaya:{n:2,who:'valya',ic:'🥧'},zhivoj:{n:3,who:'yat',ic:'🐈'},biblioteka:{n:4,who:'zina',ic:'📚'},
  akt:{n:5,who:'nina',ic:'🎭'},sport:{n:6,who:'valerka',ic:'🏀'},trud:{n:7,who:'tolik',ic:'🧵'},muzej:{n:8,who:'kolya',ic:'🖼'}};
// запасные числа — только если ZBECO не загрузился (имена и значения — как в zb-eco.js 0075ca0)
var FB={cab:[{id:'russkij',n:'Класс русского',cls:1,p:[150,375,600]},{id:'stolovaya',n:'Столовая тёти Вали',cls:2,p:[250,625,1000]},
  {id:'zhivoj',n:'Живой уголок Яти',cls:3,p:[300,750,1200]},{id:'biblioteka',n:'Библиотека',cls:4,p:[400,1000,1600]},
  {id:'akt',n:'Актовый зал',cls:5,p:[500,1250,2000]},{id:'sport',n:'Спортзал',cls:6,p:[600,1500,2400]},
  {id:'trud',n:'Кабинет труда',cls:8,p:[700,1750,2800]},{id:'muzej',n:'Школьный музей',cls:10,p:[900,2250,3600]}],
  bufet:{perH:[0,2,3,4],capH:12},yat:{every:[0,3,2,2]},trud:{hours:[[100,1],[500,3],[1000,6],[99999,12]],fast:[1,1,.5,.5],disc:[0,0,0,.15],skipAd:true},
  akt:{prizeMul:[1,1,1.2,1.5]},lib:{shelf:20},muzej:{gold:15,goldCard:20}};
function E(){return window.ZBECO||{};}
function N(k){var e=E();return e[k]||FB[k];}
function CABS(){var e=E();return e.cab&&e.cab.length?e.cab:FB.cab;}
function row(id){var L=CABS();for(var i=0;i<L.length;i++)if(L[i].id===id)return L[i];return null;}
var IDS=FB.cab.map(function(c){return c.id;});
var HOUR=36e5,DAY=864e5;
function $(id){return document.getElementById(id);}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function now(){try{return nowMs();}catch(e){return Date.now();}}
function dayNo(t){t=t||now();var d=new Date(t);return Math.floor((t-d.getTimezoneOffset()*6e4)/DAY);}
function isO(o){return !!o&&typeof o==='object'&&!Array.isArray(o);}
function sv(){try{save();}catch(e){}}
function tap(){try{SND.tap();}catch(e){}}
function stat(o){try{STAT.ev('cab',o);}catch(e){}}
function coins(){return +S.coins||0;}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
var COIN='<span class="coin zbc-coin"></span>';

/* ---------- класс игрока ---------- */
function cls(){try{if(window.ZBS&&typeof ZBS.cls==='function'){var c=+ZBS.cls();if(c>0)return c;}}catch(e){}
  var lv=+S.lv||0;return Math.min(12,1+Math.floor(lv/40));} // прикидка до SCHOOL: 40 уровней на класс (12 — выпускник)

/* ---------- состояние ---------- */
function lv(id){return Math.max(0,Math.min(3,+((S.cbL||{})[id])||0));}
function vis(id){return Math.max(lv(id),Math.min(3,+((S.cbV||{})[id])||0));}
function opened(id){var r=row(id);return !!r&&!OFF[id]&&(lv(id)>0||cls()>=r.cls);} // открытый раз — не закрывается (облако, пересчёт класса)
function price(id){var l=lv(id);if(l>=3)return 0;var r=row(id);return r?+r.p[l]||0:0;}
function can(id){var p=price(id);return opened(id)&&p>0&&coins()>=p;}
function steps(){var n=0;IDS.forEach(function(id){n+=vis(id);});return n;}
function built(){var n=0;IDS.forEach(function(id){if(lv(id)>0)n++;});return n;}
function pic(id){return Math.max(1,vis(id));} // рисунок: 1 разруха (и закрыт), 2 ремонт, 3 как новенький
function facLv(){var s=steps();return s>=16?3:s>=6?2:1;}

/* ---------- столовая тёти Вали: копит, пока тебя нет ---------- */
function bufet(){var l=lv('stolovaya'),b=N('bufet'),ph=(b.perH||[])[l]||0,cap=+b.capH||12;
  if(!l||!ph)return {n:0,full:false,perH:0,cap:cap};
  var t0=+S.cbB||now(),h=Math.max(0,(now()-t0)/HOUR),full=h>=cap;return {n:Math.floor(Math.min(h,cap)*ph),full:full,perH:ph,cap:cap,h:h};}
function bufetTake(){var b=bufet();if(b.n<=0)return 0;
  if(b.full)S.cbB=now();else S.cbB=(+S.cbB||now())+b.n/b.perH*HOUR; // дробный остаток копится дальше
  var k=0;try{k=E().give?E().give('buf',b.n,'chest'):(addCoins(b.n,'chest'),b.n);}catch(e){}
  stat({a:'buf',c:k,full:b.full?1:0});sv();try{ZB.emit('cabbuf',k);}catch(e){}return k;}

/* ---------- живой уголок: Ять приносит букву-подсказку в запас ---------- */
function yatEvery(){var l=lv('zhivoj');return l?(+((N('yat').every||[])[l])||0):0;}
function yatLeft(){var e=yatEvery();if(!e)return -1;return Math.max(0,(+S.cbY||0)+e-dayNo());} // дней до буквы; -1 — уголка нет
function hbFull(){try{var m=+(N('yat').max)||HB_MAX;return hbN()>=Math.min(HB_MAX,m);}catch(e){return false;}} /* zb-MERGE: Ять несёт букву, только если запас 💡 < ZBECO.yat.max (модель ECO 9b194aa) */
function yatReady(){return yatLeft()===0&&!hbFull();}
function yatTake(){if(!yatReady())return false;S.cbY=dayNo();try{hbAdd(1,'yat');}catch(e){S.hb=(+S.hb||0)+1;}stat({a:'yat'});sv();return true;}

/* ---------- покупка уровня ---------- */
function setLv(id,l,by){S.cbL=isO(S.cbL)?S.cbL:{};var was=lv(id);S.cbL[id]=l;
  if(id==='stolovaya'&&!was)S.cbB=now();
  if(id==='zhivoj'&&!was)S.cbY=dayNo()-(+((N('yat').every||[])[l])||2); // первая буква — сразу, «на новоселье»
  try{ZB.emit('cab',{id:id,lv:l,vis:vis(id),by:by});}catch(e){}}
function up(id){var p=price(id);if(!opened(id)||!p||coins()<p)return false;
  if(id==='stolovaya'&&lv(id))bufetTake(); // накопленное — по старой ставке
  try{addCoins(-p);}catch(e){S.coins=coins()-p;}
  setLv(id,lv(id)+1,'coins');stat({a:'up',id:id,lv:lv(id),c:p});try{STAT.ev('spend',{k:'cab:'+id+':'+lv(id),c:p});}catch(e){}
  try{if(typeof vkmCheck==='function')vkmCheck();}catch(e){}sv();return true;}
// SCHOOL (zb-migrate, «Зина открыла школу»): старому игроку — ур.1 даром у всех кабинетов, доступных до класса cl (по ZBECO.cab[].cls,
// выключенные OFF — нет). Возвращает список выданного [{id, n}] (пусто — нечего). Звать один раз, после того как класс выставлен.
function grant(cl){cl=Math.floor(+cl||0)||cls();var out=[];
  CABS().forEach(function(r){if(!OFF[r.id]&&r.cls<=cl&&!lv(r.id)){setLv(r.id,1,'grant');out.push({id:r.id,n:r.n});}});
  if(out.length){stat({a:'grant',n:out.length,cl:cl});sv();}return out;}
function canRemont(){for(var i=0;i<IDS.length;i++)if(opened(IDS[i])&&vis(IDS[i])<3)return true;return false;}
// «Ремонт кабинета» (голоса, ECO): следующий уровень ВИДА
function remontLeft(){try{return E().remontLeft?+E().remontLeft()||0:0;}catch(e){return 0;}}
function remont(id){if(!opened(id)||vis(id)>=3)return false;if(!(E().remontTake&&E().remontTake()))return false;
  S.cbV=isO(S.cbV)?S.cbV:{};S.cbV[id]=vis(id)+1;stat({a:'remont',id:id,vis:S.cbV[id]});try{ZB.emit('cab',{id:id,lv:lv(id),vis:vis(id),by:'remont'});}catch(e){}sv();return true;}

/* ---------- полки словаря (библиотека) ---------- */
var ABC='АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ';
function shelves(){var o={};try{Object.keys(DEFS).forEach(function(w){var c=w.charAt(0).toUpperCase().replace('Ё','Е');if(ABC.indexOf(c)<0)return;
  var x=o[c]||(o[c]={n:0,got:0});x.n++;if(S.dict&&S.dict[w])x.got++;});}catch(e){}return o;}
function shelvesFull(){var o=shelves(),s='';Object.keys(o).forEach(function(c){if(o[c].n&&o[c].got>=o[c].n)s+=c;});return s;}
function shelfPay(){if(!lv('biblioteka'))return 0;var full=shelvesFull(),got=S.cbS||'',sum=0,per=+N('lib').shelf||0;
  for(var i=0;i<full.length;i++){var c=full.charAt(i);if(got.indexOf(c)>=0)continue;got+=c;
    var k=0;try{k=E().give?E().give('shelf',per,'quest'):(addCoins(per,'quest'),per);}catch(e){}sum+=k;stat({a:'shelf',l:c,c:k});}
  if(got!==(S.cbS||'')){S.cbS=got;sv();}return sum;}

/* ---------- открытки глав (музей) ---------- */
function chapN(){try{return Math.ceil(LEVELS.length/CH_LEN);}catch(e){return 25;}}
function chapInfo(c){try{if(window.ZBCH&&ZBCH.list&&ZBCH.list[c])return {n:ZBCH.list[c].name||ZBCH.list[c].n,e:(CHAPTERS[c%CHAPTERS.length]||{}).e||'🖼',c:(CHAPTERS[c%CHAPTERS.length]||{}).c};}catch(e){}
  var x=(typeof CHAPTERS!=='undefined'&&CHAPTERS[c%CHAPTERS.length])||{};return {n:x.n||('Глава '+(c+1)),e:x.e||'🖼',c:x.c||'#eee'};}
function chapDone(c){return (+S.lv||0)>=(c+1)*CH_LEN;}
function chapGold(c){try{return chEx(c)>=(+N('muzej').gold||15);}catch(e){return false;}}
function cardPay(){if(!lv('muzej'))return 0;var per=+N('muzej').goldCard||0,sum=0;S.cbG=isO(S.cbG)?S.cbG:{};var ch=false;
  for(var c=0;c<chapN();c++)if(chapDone(c)&&chapGold(c)&&!S.cbG[c]){S.cbG[c]=1;ch=true;var k=0;
    if(per>0)try{k=E().give?E().give('card',per,'quest'):(addCoins(per,'quest'),per);}catch(e){}sum+=k;stat({a:'card',ch:c,c:k});}
  if(ch)sv();return sum;}

/* ---------- ателье Толика (кабинет труда): шьёт наряды и блюдца старого магазина ---------- */
function sewList(){var L=[];try{OUTFITS.forEach(function(it){if(it.p>0&&!it.pay&&!it.gift&&!owned('o',it))L.push({k:'o',it:it});});
  SKINS.forEach(function(it){if(it.p>0&&!it.pay&&!it.gift&&!owned('s',it))L.push({k:'s',it:it});});}catch(e){}
  return L.sort(function(a,b){return a.it.p-b.it.p;});}
function sewCost(p){try{if(E().sewPrice)return +E().sewPrice(p,lv('trud'))||p;}catch(e){}var d=+((N('trud').disc||[])[lv('trud')])||0;return Math.round(p*(1-d));}
function sewHours(p){try{if(E().sewHours)return +E().sewHours(p,lv('trud'))||1;}catch(e){}var H=N('trud').hours||[],h=12;for(var i=0;i<H.length;i++)if(p<=H[i][0]){h=H[i][1];break;}
  return h*(+((N('trud').fast||[])[lv('trud')])||1);}
function sewCur(){var o=S.ecSew;return isO(o)&&o.id?o:null;}
function sewStart(k,id){if(sewCur()||!lv('trud'))return false;var it=null;try{it=(k==='o'?outfitOf:skinOf)(id);}catch(e){}if(!it||!(it.p>0))return false;
  var c=sewCost(it.p);if(coins()<c)return false;try{addCoins(-c);}catch(e){S.coins=coins()-c;}
  S.ecSew={id:id,k:k,t:now()+sewHours(it.p)*HOUR,p:c};stat({a:'sew',id:id,c:c});try{STAT.ev('spend',{k:'sew:'+k+':'+id,c:c});}catch(e){}sv();return true;}
function sewTake(){var o=sewCur();if(!o||now()<+o.t)return false;S.own=S.own||{};S.own[o.k+':'+o.id]=1;if(o.k==='o')S.outfit=o.id;else S.skin=o.id;
  S.ecSew=null;stat({a:'sewgot',id:o.id});try{if(typeof vkmCheck==='function')vkmCheck();}catch(e){}sv();return true;}
function sewName(o){try{return (o.k==='o'?outfitOf:skinOf)(o.id).n;}catch(e){return '';}}

/* ---------- что ждёт игрока (точка на «Школе») ---------- */
function dot(){if(!S||!(+S.lv>=1))return false;
  if(bufet().full)return true;if(yatReady())return true;var s=sewCur();if(s&&now()>=+s.t)return true;
  for(var i=0;i<IDS.length;i++)if(can(IDS[i])&&!lv(IDS[i]))return true; // новый кабинет по карману
  return false;}

/* ---------- рисунки: ленивая подгрузка ---------- */
function art(n){var src='content/cab/'+(n==='school'?'school':'cab-'+n)+'.js';
  if(window.ZB_CAB&&ZB_CAB[n])return Promise.resolve(ZB_CAB[n]);return ZB.load(src).then(function(){return (window.ZB_CAB||{})[n];});}
function drawArt(el,n,l,extra){if(!el)return;art(n).then(function(A){if(!A||!el.isConnected)return;
  el.innerHTML=ZB.safe('cabart',function(){return A.svg.apply(A,[l,'xMidYMid slice'].concat(extra||[]));})||'';el.classList.add('on');},function(){});}

/* ---------- стили — файл css/zb-cab.css (лениво, без правки index.html) ---------- */
var cssOn=false;function css(){if(cssOn)return;cssOn=true;try{var l=document.createElement('link');l.rel='stylesheet';l.href='css/zb-cab.css';document.head.appendChild(l);}catch(e){}}

/* ---------- фразы ---------- */
var SAY={
  school:['Школу №7 хотели закрыть. Не дождутся! Начнём с класса русского — без него никуда.','Крыша течёт, завуч ворчит — значит, школа жива.',
    'Каждый кабинет — это деньги. А деньги — это твои слова. Так что играй, а я посчитаю.'],
  russkij:['Журнал заполнен, мел наточен. Дети будут?','Слово дня на доске — пиши без ошибок, я проверю.','В моём классе «жи-ши» пишут через И. Даже коты.'],
  stolovaya:['Пирожки копятся, пока тебя нет! Заходи — пока Валерка не нашёл.','Компот без косточек, котлета без хлеба. Почти.','Добавки нет. Но для тебя — поищу.'],
  zhivoj:['Мур. (Ять принёс букву и делает вид, что так и было.)','Мяу! (Под диваном ещё три буквы. Ну, две.)','Мрр. (Аквариум — не еда. Ять это знает. Почти.)'],
  biblioteka:['Каждая полка — буква. Собери слова на букву — полка твоя.','Тише! В библиотеке разговаривают только словари.','Толковый словарь у меня свой. Толковее не бывает.'],
  akt:['Хор «Рябинушка» к выступлению готов! Почти весь.','Соседки соревнуются неделю. В конце — концерт и призы.','Петь все умеют. Красиво — только по субботам.'],
  sport:['Перемена! Пятнадцать игр — и все без мяча. Почти.','Физрук ушёл на пенсию, теперь тут командую я!','Звонок для учителя, а мини-игры — для тебя.'],
  trud:['Шью, точу, крашу. Без резких движений, по-соседски.','Семь раз отмерь — один раз пришей.','Заказ сделан — жди. Толик быстро только мотор разбирает.'],
  muzej:['Каждая открытка — экскурсия. Золотая — без подсказок!','Марки, открытки, вымпелы. Ничего не выбрасываем с 1987 года.','Экскурсия в 12:00. Опоздавших не ждём, но пускаем.']};
function say(k){var L=SAY[k]||SAY.school;try{return pick(L);}catch(e){return L[0];}}
// что даёт уровень (строки для «Следующий уровень»)
function perk(id,l){var b=N('bufet'),y=N('yat'),t=N('trud'),a=N('akt');
  switch(id){
    case 'russkij':return l===1?'Доска со словом дня и «Красный уголок»':l===2?'Свежая краска, новые парты':'Золотая рамка табличек';
    case 'stolovaya':return 'Копит '+((b.perH||[])[l]||0)+' '+COIN+' в час, пока тебя нет (до '+(b.capH||12)+' ч)';
    case 'zhivoj':var e=(y.every||[])[l]||0;return e?'Ять приносит 💡 букву-подсказку раз в '+e+' '+pl(e,'день','дня','дней'):'';
    case 'biblioteka':return l===1?'Полки словаря по буквам: собрал полку — +'+(N('lib').shelf||0)+' '+COIN:l===2?'Новые стеллажи и лампа':'Ковёр, картотека и кот на полке';
    case 'akt':return l===1?'Соседки соревнуются по дивизионам: Подъезд → Двор → Улица → Район → Город':'Призы недели ×'+String((a.prizeMul||[])[l]||1).replace('.',',');
    case 'sport':return l===1?'Вход на «Перемену» — мини-игры':l===2?'Новые маты и кольцо':'Флажки и табло — праздник каждый день';
    case 'trud':var dc=Math.round(((t.disc||[])[l]||0)*100),fs=((t.fast||[])[l]||1)<((t.fast||[])[l-1]||1);return (l===1?'Толик шьёт наряды и блюдца':fs?'Шьёт вдвое быстрее':'Ателье расширилось')+(dc?' · у Толика дешевле на '+dc+' %':'');
    case 'muzej':return l===1?'Альбом открыток глав: золотая — +'+(N('muzej').goldCard||0)+' '+COIN:l===2?'Стенд выпускников':'Красная дорожка и экскурсии';}
  return '';}

/* ================= ЭКРАН «ШКОЛА №7» ================= */
function hdr(title,sub,back){return '<div class="hdr'+(back?'':' zbhdr')+'">'+(back?'<button class="ibtn" data-zbback="'+back+'" aria-label="Назад">←</button>':'')+'<div class="t"><b>'+title+'</b><small>'+sub+'</small></div>'+
  '<div class="coins"><span class="coin"></span><span class="cc">'+coins()+'</span></div></div>';}
function stars(id){var l=lv(id),v=vis(id),s='';for(var i=1;i<=3;i++)s+='<i class="'+(i<=l?'on':i<=v?'vw':'')+'">★</i>';return '<span class="zbc-st" aria-label="Уровень '+l+' из 3">'+s+'</span>';}
function cardHtml(id){var r=row(id)||{},o=opened(id),l=lv(id),p=price(id),st='',cl='';
  if(OFF[id]){cl=' lock';st='🔒 На ремонте · откроется в '+Math.max(cls()+1,r.cls)+' классе';}
  else if(!o){cl=' lock';st='🔒 Кабинет откроется в '+r.cls+' классе';}
  else if(id==='stolovaya'&&bufet().n>0){cl=bufet().full?' ready':'';st='🥧 Забрать '+bufet().n+' '+COIN;}
  else if(id==='zhivoj'&&yatReady()){cl=' ready';st='🐈 Ять принёс букву!';}
  else if(id==='trud'&&sewCur()&&now()>=+sewCur().t){cl=' ready';st='🧵 Готово! Забрать';}
  else if(!p)st='✓ Как новенький';
  else{cl=coins()>=p?' can':'';st=(l?'Улучшить':'Открыть')+': '+p+' '+COIN;}
  return '<button type="button" class="zbc-card'+cl+'" data-cab="'+id+'"><span class="zbc-th" data-n="'+ROOM[id].n+'" data-l="'+pic(id)+'"><b class="zbc-ic">'+ROOM[id].ic+'</b></span>'+
    (cl===' can'||cl===' ready'?'<i class="zbc-dot" aria-hidden="true"></i>':'')+
    '<span class="zbc-nm">'+esc(r.n||id)+'</span>'+stars(id)+'<span class="zbc-ss">'+st+'</span></button>';}
function schoolHtml(){var s=steps();
  return '<div class="zbc-fac"><div class="zbc-art" id="zbcFac"></div><div class="zbc-plate">ШКОЛА №7</div></div>'+
    '<div class="zbc-sayw">'+(window.ZBP?ZBP.say('vp',s?say('school'):'Школу №7 хотели закрыть. Не дождутся! Начнём с класса русского — без него никуда.',s?'happy':'norm'):'')+'</div>'+
    '<div class="zbc-prog"><b>Отремонтировано: '+s+' из 24</b><span class="zbc-bar"><i style="width:'+Math.round(s/24*100)+'%"></i></span></div>'+
    '<div class="zbc-grid">'+IDS.map(cardHtml).join('')+'</div>';}
function bindSchool(el){drawArt($('zbcFac'),'school',facLv(),[built()]);
  el.querySelectorAll('.zbc-th').forEach(function(t){var n=+t.dataset.n,l=+t.dataset.l;art(n).then(function(A){if(!A||!t.isConnected)return;
    var h=ZB.safe('cabth',function(){return A.svg(l,'xMidYMid slice');});if(h){t.insertAdjacentHTML('afterbegin',h);t.classList.add('on');}},function(){});});
  el.querySelectorAll('[data-cab]').forEach(function(b){b.onclick=function(){tap();go(b.dataset.cab);};});
  backBind(el);}
function backBind(el){el.querySelectorAll('[data-zbback]').forEach(function(b){b.onclick=function(){tap();var t=b.dataset.zbback;
  if(t==='school')go();else if(t==='home'&&ZB._scr.home)ZB.go('home');else{try{openMenu();}catch(e){}}};});}
function clsTxt(){var c=cls();return c>12?'Академия':c===12?'Выпускник':c+'-й класс';}
function renderSchool(el){css();el.classList.add('zbc-scr');shelfPay();cardPay();var c={},vw=!!ZB.vw;
  el.innerHTML=hdr('Школа №7',clsTxt()+' · открыто '+built()+' из 8',vw?'':'menu')+
    '<div class="scroll zbc-scroll">'+ZB.html(ZB.schoolSlots,'top',c)+schoolHtml()+ZB.html(ZB.schoolSlots,'main',c)+
    (vw&&typeof ZB.vwMore==='function'?'<div class="zbc-more">'+(ZB.safe('vwMore',ZB.vwMore)||'')+'</div>':'')+ZB.html(ZB.schoolSlots,'bottom',c)+'</div>';
  bindSchool(el);ZB.mount(el,ZB.schoolSlots,c);if(typeof ZB.vwBind==='function')ZB.safe('vwBind',function(){ZB.vwBind(el);});try{updCoins();}catch(e){}}

/* ================= КАБИНЕТ ================= */
var cur=null;
function roomFun(id){var l=lv(id),h='';
  if(id==='stolovaya'){var b=bufet();
    h=l?'<div class="zbc-box"><p>'+(b.full?'<b>Буфет полный — забери!</b> Тётя Валя больше не печёт.':'Накопилось <b>'+b.n+'</b> '+COIN+' · копит '+b.perH+' '+COIN+'/час, до '+b.cap+' ч')+'</p>'+
      '<button class="btn '+(b.n>0?'green':'ghost')+'" id="zbcBuf"'+(b.n>0?'':' disabled')+'>🥧 Забрать '+b.n+' '+COIN+'</button></div>':'';}
  else if(id==='zhivoj'){var d=yatLeft();
    h=l?'<div class="zbc-box"><p>'+(yatReady()?'Ять принёс <b>букву-подсказку</b>! Положу в запас 💡.':d<0?'Ять пока только спит на диване. Отремонтируй уголок — начнёт носить буквы-подсказки 💡.':hbFull()?'Запас подсказок полон — Ять бережёт букву до лучших времён.':'Следующая буква — через '+d+' '+pl(d,'день','дня','дней')+'. Ять ищет под диваном.')+'</p>'+
      (yatReady()?'<button class="btn green" id="zbcYat">💡 Взять букву</button>':'')+'</div>':'';}
  else if(id==='russkij'){var w=wordOfDay();
    h=(w?'<div class="zbc-box zbc-board"><small>Слово дня</small><b>'+esc(w.w)+'</b><p>'+w.d+'</p></div>':'')+(l?ugolokBtn():'');}
  else if(id==='biblioteka'){var o=shelves(),full=shelvesFull(),n=Object.keys(o).length;
    h='<div class="zbc-box"><p>Полки собраны: <b>'+full.length+' из '+n+'</b>. '+(l?'За каждую полную — +'+(N('lib').shelf||0)+' '+COIN+'.':'Откроешь библиотеку — за полные полки монеты.')+'</p><div class="zbc-shelves">'+
      ABC.split('').filter(function(c){return o[c];}).map(function(c){var x=o[c],f=x.got>=x.n;return '<span class="'+(f?'full':'')+'" title="'+x.got+' из '+x.n+'"><b>'+c+'</b><i style="height:'+Math.round(x.got/x.n*100)+'%"></i></span>';}).join('')+
      '</div><button class="btn blue" id="zbcDict">📚 Толковый словарь</button></div>';}
  else if(id==='akt'){var dv=0;try{dv=sosDiv();}catch(e){}
    h='<div class="zbc-box"><p>'+(l?'Дивизион: <b>'+(typeof SOS_DIV!=='undefined'?SOS_DIV[dv]:'Подъезд')+'</b>. Первые два места недели — выше, последние два — ниже.':'Отремонтируешь зал — соседки начнут соревноваться по дивизионам.')+'</p>'+
      '<button class="btn blue" id="zbcSos">🏠 Соседки по подъезду</button></div>';}
  else if(id==='sport')h=l?'<div class="zbc-box"><p>Мини-игры на перемене: монеты и заметки в стенгазету.</p><button class="btn blue" id="zbcMg">🔔 На перемену!</button></div>':'';
  else if(id==='trud')h=l?sewHtml():'';
  else if(id==='muzej')h=museumHtml();
  return h;}
function ugolokBtn(){return '<div class="zbc-box"><p>«Красный уголок»: стенгазета и все открытые мини-игры — потренироваться.</p><button class="btn blue" id="zbcUg">🚩 Красный уголок</button></div>';}
function wordOfDay(){try{var A=Object.keys(DEFS).sort(),G=A.filter(function(w){return S.dict&&S.dict[w];}),K=G.length>=5?G:A; // открытые слова — сюрприз словаря не портим
  if(!K.length)return null;var w=K[(dayNo()*7919)%K.length];return {w:(typeof yo==='function'?yo(w):w).toUpperCase(),d:DEFS[w]};}catch(e){return null;}}
function sewHtml(){var o=sewCur(),h='<div class="zbc-box">';
  if(o){var left=+o.t-now();h+=left<=0?'<p>Готово: <b>«'+esc(sewName(o))+'»</b>! Толик гладит последний шов.</p><button class="btn green" id="zbcSewGet">🧵 Забрать</button>'
    :'<p>Шьётся <b>«'+esc(sewName(o))+'»</b> — ещё '+hm(left)+'.</p>';return h+'</div>';}
  var L=sewList().slice(0,8);if(!L.length)return h+'<p>Всё уже сшито! Толик пьёт чай и ждёт новых выкроек.</p></div>';
  h+='<p>Закажи обновку — Толик сошьёт, пока ты играешь. Один заказ за раз.</p><div class="zbc-sew">'+L.map(function(x){var c=sewCost(x.it.p);
    return '<button class="zbc-sw'+(coins()>=c?'':' no')+'" data-k="'+x.k+'" data-id="'+x.it.id+'"><span class="pv">'+(x.k==='o'?(typeof zinaSVG==='function'?zinaSVG('norm',x.it.id):''):'<span class="mini zbc-pl" data-skin="'+x.it.id+'"><span class="plate"></span></span>')+'</span>'+
      '<b>'+esc(x.it.n)+'</b><small>'+c+' '+COIN+' · '+hm(sewHours(x.it.p)*HOUR)+'</small></button>';}).join('')+'</div>';
  return h+'<p class="zbc-note">Купить сразу можно и в «Обликах».</p></div>';}
function hm(ms){ms=Math.max(0,ms);var m=Math.ceil(ms/6e4),h=Math.floor(m/60);m%=60;return h?h+' ч'+(m?' '+m+' мин':''):m+' мин';}
function museumHtml(){var n=chapN(),h='<div class="zbc-box"><p>'+(lv('muzej')?'Открытки пройденных глав. Золотая — '+(N('muzej').gold||15)+' уровней главы без подсказок.':'Музей откроется — сюда лягут открытки всех пройденных глав.')+'</p><div class="zbc-cards">';
  for(var c=0;c<n;c++){var x=chapInfo(c),d=chapDone(c),g=d&&chapGold(c);
    h+='<span class="zbc-pc'+(d?'':' no')+(g?' gold':'')+'" style="background:'+(d?x.c:'#eceae4')+'" title="'+esc(x.n)+'"><b>'+(d?x.e:'?')+'</b><small>'+(d?esc(x.n):(c+1))+'</small></span>';}
  h+='</div>';var K=null;try{if(window.ZBS&&typeof ZBS.cards==='function')K=ZBS.cards();}catch(e){}
  if(K&&K.length)h+='<p style="margin-top:8px">Открытки классов:</p><div class="zbc-cards">'+K.map(function(k){return '<span class="zbc-pc cls'+(k.got?'':' no')+'" title="'+esc(k.t||'')+'"><b>'+(k.got?(k.n>11?'🎓':k.n):'?')+'</b><small>'+(k.n>11?'Выпускной':k.n+'-й класс')+'</small></span>';}).join('')+'</div>';
  return h+'</div>';}
function upHtml(id){var l=lv(id),p=price(id),r=row(id)||{},h='<div class="zbc-box zbc-up">';
  if(!opened(id))return h+'<p>🔒 '+(OFF[id]?'На ремонте. ':'')+'Кабинет откроется в '+(OFF[id]?Math.max(cls()+1,r.cls):r.cls)+' классе.</p></div>';
  if(p){h+='<p><b>'+(l?'Уровень '+(l+1):'Открыть кабинет')+':</b> '+perk(id,l+1)+'</p>';
    if(coins()>=p)h+='<button class="btn green" id="zbcUp">'+(l?'🔨 Отремонтировать':'🔑 Открыть')+' за '+p+' '+COIN+'</button>';
    else{h+='<button class="btn ghost" id="zbcUp" disabled>Нужно '+p+' '+COIN+' · не хватает '+(p-coins())+'</button>';var t=topUp(p);
      if(t)h+='<button class="btn blue zbad" id="zbcTop">🎬 Добрать '+t+' '+COIN+' за рекламу</button>';}}
  else h+='<p><b>Кабинет как новенький!</b> Все три уровня.</p>';
  if(vis(id)<3&&remontLeft()>0)h+='<button class="btn gold" id="zbcRem">🪟 Применить «Ремонт кабинета» — красота сразу</button>';
  else if(vis(id)<3&&payRemont())h+='<div class="zbc-pay"><small>Шторы, цветы, паркет — только для красоты:</small>'+ZB.safe('pay',function(){return PAY.html(['remont']);})+'</div>';
  return h+'</div>';}
function topUp(p){try{return typeof adsOk==='function'&&adsOk()&&E().topUp?+E().topUp(p)||0:0;}catch(e){return 0;}}
function payRemont(){try{return typeof PAY!=='undefined'&&PAY.on&&!!PAY.item('remont')&&!(typeof OK!=='undefined'&&OK);}catch(e){return false;}}
function renderRoom(el,id){css();el.classList.add('zbc-scr');cur=id;var r=row(id)||{},l=lv(id),who=ROOM[id].who;
  if(id==='biblioteka')shelfPay();if(id==='muzej')cardPay();
  var first=!(S.cbN||{})[id];if(first&&opened(id)){S.cbN=isO(S.cbN)?S.cbN:{};S.cbN[id]=1;sv();}
  el.innerHTML=hdr(esc(r.n||id),opened(id)?'Уровень '+l+' из 3':'Кабинет закрыт','school')+
    '<div class="scroll zbc-scroll"><div class="zbc-room"><div class="zbc-art big" id="zbcArt"></div>'+
    (id==='stolovaya'&&bufet().n>0?'<span class="zbc-badge">🥧 '+bufet().n+'</span>':'')+'</div>'+
    '<div class="zbc-sayw">'+(window.ZBP?ZBP.say(who,!opened(id)?'Тут пока разруха. Подрасти до '+r.cls+' класса — откроем.':l?say(id):'Кабинет закрыт на ремонт. Откроем — и заживём!',l?'happy':'norm'):'')+'</div>'+
    '<div class="zbc-fun">'+roomFun(id)+'</div>'+upHtml(id)+'</div>';
  drawArt($('zbcArt'),ROOM[id].n,pic(id),id==='biblioteka'?[shelvesFull()]:[]);
  bindRoom(el,id);try{updCoins();}catch(e){}}
function again(){if(cur&&ZB.cur==='cab')ZB.go('cab',{id:cur});}
function bindRoom(el,id){backBind(el);var b;
  if((b=$('zbcUp')))b.onclick=function(){if(!up(id))return;try{SND.coin();}catch(e){}cheer(id);again();};
  if((b=$('zbcRem')))b.onclick=function(){if(remont(id)){try{SND.coin();}catch(e){}toast('Шторы, цветы, паркет — красота!');again();}};
  if((b=$('zbcBuf')))b.onclick=function(){var k=bufetTake();if(k){try{SND.coin();coinBurst(b,k);}catch(e){}}again();};
  if((b=$('zbcYat')))b.onclick=function(){if(yatTake()){try{SND.coin();}catch(e){}toast('💡 +1 подсказка в запас — Ять старался!');}again();};
  if((b=$('zbcDict')))b.onclick=function(){tap();try{openDict();}catch(e){}};
  if((b=$('zbcSos')))b.onclick=function(){tap();try{openSosedki('school',function(){go('akt');});}catch(e){}};
  if((b=$('zbcMg')))b.onclick=function(){tap();mgGo('peremena');};
  if((b=$('zbcUg')))b.onclick=function(){tap();mgGo('ugolok');};
  if((b=$('zbcSewGet')))b.onclick=function(){if(sewTake()){try{SND.coin();}catch(e){}toast('Обновка готова — уже на Зине!');}again();};
  el.querySelectorAll('.zbc-sw').forEach(function(x){x.onclick=function(){if(x.classList.contains('no')){try{SND.bad();}catch(e){}toast('Монет пока не хватает');return;}
    if(sewStart(x.dataset.k,x.dataset.id)){try{SND.coin();}catch(e){}again();}};});
  el.querySelectorAll('.zbc-pl[data-skin]').forEach(function(p){try{applySkin(p,p.dataset.skin);}catch(e){}});
  if((b=$('zbcTop')))topBind(b,id);
  try{if(typeof PAY!=='undefined'&&PAY.on)PAY.bind(el);}catch(e){}}
// «добрать монеты до кабинета» — ролик по нужде (ECO.topUp, класс zbad — в AD_BTN_SEL у TECH), с late
function topBind(b,id){var p=price(id);b.onclick=function(){if(b.disabled)return;var n=topUp(p);if(!n)return;b.disabled=true;try{STAT.place('cabtop');}catch(e){}var paid=false;
  function give(){if(paid)return '';paid=true;try{E().topUpTake(n);}catch(e){}return '+'+n+' монет на кабинет';}
  try{showRewarded(function(){give();try{SND.coin();}catch(e){}again();},function(){b.disabled=false;},function(){return give();});}catch(e){b.disabled=false;}};}
function cheer(id){var l=lv(id),who=ROOM[id].who,t=l===1?'Кабинет открыт! '+perk(id,1).replace(/<[^>]+>/g,''):'Уровень '+l+'! '+perk(id,l).replace(/<[^>]+>/g,'');
  try{toast(t,3500);}catch(e){}}
// мини-игры (MG0): «Перемена» и «Красный уголок» — что даст MG0; иначе — вкладка панели
function mgGo(what){try{ // MG0 (f9a3829): Красный уголок — ZMG.ugolok(); «Перемена» — вкладка панели 'mg' (у MG0 она ведёт в уголок / затею дня)
    if(what==='ugolok'&&window.ZMG&&typeof ZMG.ugolok==='function')return ZMG.ugolok();
    for(var i=0;i<ZB.navSlots.length;i++)if(ZB.navSlots[i].id==='mg'&&ZB.navSlots[i].go)return ZB.navSlots[i].go();
    if(window.ZMG&&typeof ZMG.ugolok==='function')return ZMG.ugolok();}catch(e){}
  toast('Перемена начнётся после звонка!');}

/* ---------- экраны и вход ---------- */
function go(id){if(id)ZB.go('cab',{id:id});else ZB.go('school');}
ZB.screen('cab',{title:'Кабинет',render:function(el,o){renderRoom(el,o&&o.id||cur||'russkij');}});
ZB.screen('school',{title:'Школа',render:renderSchool}); // тот же name заменяет заглушку VIEW (договор вида)
ZB.add(ZB.navSlots,{id:'school',order:30,ic:'🏫',t:'Школа',go:function(){go();},dot:function(){return dot();}});
// главный экран, зона school: строка «Школа №7» (VIEW рисует зону; кнопка — вход в школу)
function homeHtml(){if(!(+S.lv>=1))return '';var b=bufet(),t=b.full?'🥧 Буфет полный — забери '+b.n+'!':yatReady()?'🐈 Ять принёс букву':b.n>0?'🥧 В буфете '+b.n:'Отремонтировано '+steps()+' из 24';
  return '<button type="button" class="zbc-home'+(dot()?' on':'')+'" id="zbcHome"><b>🏫 Школа №7</b><small>'+t+'</small></button>';}
ZB.add(ZB.homeSlots,{id:'cab',order:50,zone:'school',render:function(){css();return homeHtml();},mount:function(el){var b=el.querySelector('#zbcHome');if(b)b.onclick=function(){tap();go();};}});
// облако: вернулись новые уровни — перерисовать открытый экран школы
ZB.on('cloud',function(){if(ZB.cur==='school'||ZB.cur==='cab')ZB.safe('cabcloud',function(){ZB.go(ZB.cur,ZB.cur==='cab'?{id:cur}:{});});});
// «Ремонт кабинета» куплен в витрине, пока открыт кабинет — сразу применяем к нему
ZB.on('remont',function(){if(ZB.cur==='cab'&&cur&&vis(cur)<3&&remont(cur)){toast('Ремонт сделан — красота!');again();}});

/* ---------- сохранение ---------- */
function maxMap(a,b){var o=isO(a)?JSON.parse(JSON.stringify(a)):{};if(isO(b))for(var k in b)o[k]=Math.max(+o[k]||0,Math.min(3,+b[k]||0));return o;}
function unionMap(a,b){var o=isO(a)?JSON.parse(JSON.stringify(a)):{};if(isO(b))for(var k in b)if(b[k])o[k]=1;return o;}
ZB.onSave({id:'cab',prefix:'cb',
  fix:function(S){if(!isO(S.cbL))S.cbL={};if(!isO(S.cbV))S.cbV={};if(!isO(S.cbG))S.cbG={};if(!isO(S.cbN))S.cbN={};if(typeof S.cbS!=='string')S.cbS='';
    ['cbL','cbV'].forEach(function(k){for(var id in S[k]){var v=Math.floor(+S[k][id]||0);if(IDS.indexOf(id)<0||v<=0)delete S[k][id];else S[k][id]=Math.min(3,v);}});
    S.cbB=+S.cbB||0;S.cbY=+S.cbY||0;if(S.cbB>now()+HOUR)S.cbB=now(); // часы ушли назад — не копим «из будущего»
    if(lv('stolovaya')&&!S.cbB)S.cbB=now();},
  merge:function(S,d){if(!d)return;S.cbL=maxMap(S.cbL,d.cbL);S.cbV=maxMap(S.cbV,d.cbV);S.cbG=unionMap(S.cbG,d.cbG);S.cbN=unionMap(S.cbN,d.cbN);
    S.cbB=Math.max(+S.cbB||0,+d.cbB||0);S.cbY=Math.max(+S.cbY||0,+d.cbY||0);
    var s=String(S.cbS||''),t=String(d.cbS||'');for(var i=0;i<t.length;i++)if(s.indexOf(t.charAt(i))<0)s+=t.charAt(i);S.cbS=s;}});

window.ZBCAB={ids:IDS,on:true,OFF:OFF,cls:cls,lv:lv,vis:vis,open:opened,price:price,can:can,up:up,grant:grant,remont:remont,canRemont:canRemont,steps:steps,dot:dot,
  bufet:bufet,bufetTake:bufetTake,yatReady:yatReady,yatTake:yatTake,yatLeft:yatLeft,go:go,render:renderSchool,homeHtml:homeHtml,
  shelves:shelves,shelvesFull:shelvesFull,sewList:sewList,sewStart:sewStart,sewTake:sewTake,sewCur:sewCur,aktMul:function(){return +((N('akt').prizeMul||[])[lv('akt')])||1;},
  _dayNo:dayNo};
/* zb-MERGE (просьба NEWBIE): пункт «Завтра у бабы Зины» — сколько наварит столовая за сутки (пусто, если столовая не открыта) */
function tmrBuf(){var l=lv('stolovaya'),b=N('bufet'),ph=(b.perH||[])[l]||0;return l&&ph?'🍲 тётя Валя наварит +'+Math.round(ph*(+b.capH||12))+' 💰':'';}
function addTmr(){var nb=window.ZBNB;if(nb&&nb.tmrItems&&!nb.tmrItems.some(function(x){return x.id==='buf';}))nb.tmrItems.push({id:'buf',order:25,t:tmrBuf});}
addTmr();ZB.on('ready',addTmr);
})();
