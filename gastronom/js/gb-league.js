/* ================= gb-league — «Соцсоревнование района» (поток LEAGUE, 10.10.2026, ветка gb-league) =================
   Журнал: hobby-analytics/release-i/gastronom-boost/logs/LEAGUE.md. Образец — Выезд js/league.js («Лига соседей»).
   Неделя пн–вс (местное время, nowMs(); на маке ?date=ГГГГ-ММ-ДД[Tчч] или ММ-ДД), 8 магазинов: ваш + 7 соседей-ботов.
   Счёт — ОБСЛУЖЕННЫЕ ПОКУПАТЕЛИ (GB.levelHook → served, по приросту: «Ещё попытка» не считается дважды); режим «Час пик» —
   по правилу MODE: его уровни сами не считаются, очки приходят событием GB.emit('rush', n).
   Боты — детерминированно от недели, дивизиона и номера (одинаково у всех игроков), без сервера; считаются ТОЛЬКО с момента
   участия (первый обслуженный покупатель недели), чтобы поздно пришедший не догонял целую неделю.
   Дивизионы: Район → Город → Область → Союз; 1–2 место — выше, 7–8 — ниже; не играли неделю — остаётесь (итога нет).
   Итог — при первой проверке после конца недели (ready/home/исход уровня/экран лиги). Победитель вешает в зал
   «Переходящее красное знамя» на следующую неделю; не удержали — знамя «переходит» к победителю-боту.
   Открывается с 10-го уровня (S.unlocked>=10). Флаг выключения — GB.flag('league').
   Сохранение (облако — свой merge: неделя — та, что позже; очки — максимум в ту же неделю):
     S.lgW неделя участия (0 — не участвует), S.lgJ момент входа (тысячные доли недели), S.lgP очки недели, S.lgD дивизион 0–3,
     S.lgF неделя, в которую висит знамя, S.lgN знамён всего, S.lgR итог для показа {w,d,p,z,c,s,o,h}, S.lgRw неделя последнего итога.
   Награды — числа из GBECO.lg (если есть), иначе свои ниже (DEF). Монеты — GBECO.give('lg',n) или ern('lg',n).
   STAT: lg {a: week|up|down|flag, d, p}. Для prg — GBLG.prg() → {lg, lgp}.
   Гнёзда: homeSlots zone 'hall' (знамя + «Соцсоревнование: 3-е место»), winSlots zone 'extra' («+12 к соцсоревнованию»).
   Экран: GB.screen('league'). API: GBLG.place(), GBLG.flag() (висит ли знамя), GBLG.on(), GBLG.add(n), GBLG.week(). */
(function(){
'use strict';
var GB=window.GB;if(!GB)return;
// в VK знак «№» нельзя (как NUMS() и META): «№1» → «номер один», «№7» → «номер 7»
function vkN(t){var vk=false;try{vk=PLAT==='vk';}catch(x){}if(!vk||typeof t!=='string'||t.indexOf('№')<0)return t;
  var up=/№\s?1(?![0-9])/.test(t)&&t===t.toUpperCase();return t.replace(/№\s?1(?![0-9])/g,up?'НОМЕР ОДИН':'номер один').replace(/№\s?/g,up?'НОМЕР ':'номер\u00a0');}
function Lx(r,e){try{return LANG==='en'?e:vkN(r);}catch(x){return vkN(r);}}
function plx(n,a,b,c,e1,e2){try{return pl(n,a,b,c,e1,e2);}catch(x){var m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function S_(){return typeof S!=='undefined'?S:null;}
function num(x){x=+x;return isFinite(x)&&x>0?x:0;}

/* ---------- тексты (отдельными данными — для вычитки владельцем; EN — рядом) ---------- */
var DIV=[{n:'Район',en:'District',c:'#c8401c'},{n:'Город',en:'City',c:'#2f6fd0'},{n:'Область',en:'Region',c:'#7a4ad0'},{n:'Союз',en:'Union',c:'#d4a017'}];
// соседи-магазины по дивизионам: n — имя, h — «чем славится», m — покупателей за полную неделю (среднее)
var BOTS=[
 [{n:'Булочная №7',en:'Bakery No. 7',h:'батоны по 13 копеек с утра',he:'loaves at 13 kopecks from dawn',m:260},
  {n:'Универсам «Юбилейный»',en:'“Jubilee” supermarket',h:'тележки и очередь в три кассы',he:'trolleys and three tills of queue',m:330},
  {n:'Продмаг у станции',en:'Station food shop',h:'электричка пришла — и полный зал',he:'a train arrives — the hall is full',m:290},
  {n:'Кулинария «Ромашка»',en:'“Daisy” deli',h:'котлеты и винегрет на развес',he:'cutlets and beet salad by weight',m:240},
  {n:'Овощной №3',en:'Greengrocer No. 3',h:'картошка с землёй, зато своя',he:'muddy potatoes, but local',m:210},
  {n:'Гастроном №2 на Садовой',en:'Grocery No. 2 on Garden St.',h:'метит в первые номера',he:'wants to be number one',m:310},
  {n:'Сельпо «Заря»',en:'“Dawn” village shop',h:'хлеб, гвозди и сапоги в одном зале',he:'bread, nails and boots in one hall',m:180}],
 [{n:'Универмаг «Центральный»',en:'“Central” department store',h:'эскалатор и буфет на втором',he:'an escalator and a snack bar upstairs',m:620},
  {n:'Гастроном «Столичный»',en:'“Capital” grocery',h:'колбаса двух сортов',he:'two kinds of sausage',m:700},
  {n:'Кулинария «Встреча»',en:'“Meeting” deli',h:'пирожки горячие до обеда',he:'hot pies until lunch',m:540},
  {n:'Булочная-кондитерская №1',en:'Bakery & cakes No. 1',h:'торт-суфле по записи',he:'soufflé cake by sign-up',m:580},
  {n:'Универсам «Северный»',en:'“North” supermarket',h:'самообслуживание — новинка!',he:'self-service — so modern!',m:660},
  {n:'Рыбный «Океан»',en:'“Ocean” fish shop',h:'живая рыба в аквариуме',he:'live fish in the tank',m:500},
  {n:'Молочный «Бурёнка»',en:'“Daisy Cow” dairy',h:'молоко в треугольных пакетах',he:'milk in triangle cartons',m:560}],
 [{n:'Универсам «Восход»',en:'“Sunrise” supermarket',h:'пять касс и все работают',he:'five tills and all of them open',m:1000},
  {n:'Гастроном «Октябрь»',en:'“October” grocery',h:'витрины моют дважды в день',he:'windows washed twice a day',m:1080},
  {n:'Райпо «Колос»',en:'“Wheat Ear” co-op',h:'возит товар на грузовике «ЗИЛ»',he:'brings goods in a ZIL truck',m:900},
  {n:'Кафетерий «Улыбка»',en:'“Smile” café-shop',h:'кофе с молоком из бака',he:'milky coffee from the urn',m:860},
  {n:'Продторг №3',en:'Food Trade No. 3',h:'накладные без единой ошибки',he:'invoices without a single error',m:1140},
  {n:'Сельмаг «Нива»',en:'“Field” village store',h:'за мукой едут из трёх деревень',he:'three villages come for flour',m:820},
  {n:'Универмаг «Радуга»',en:'“Rainbow” department store',h:'отдел игрушек и отдел колбас',he:'a toy floor and a sausage floor',m:960}],
 [{n:'Гастроном «Образцовый»',en:'“Exemplary” grocery',h:'тоже хочет зваться первым',he:'also wants to be number one',m:1700},
  {n:'Универсам «Олимпийский»',en:'“Olympic” supermarket',h:'очередь видно из космоса',he:'the queue can be seen from space',m:1820},
  {n:'Гастроном «Юбилейный» №1',en:'“Jubilee” grocery No. 1',h:'почётная грамота на каждой стене',he:'a certificate on every wall',m:1600},
  {n:'Торговый дом «Весна»',en:'“Spring” trading house',h:'весы проверяют каждое утро',he:'scales checked every morning',m:1540},
  {n:'Универсам «Спутник»',en:'“Sputnik” supermarket',h:'кассы с электронным табло',he:'tills with electronic displays',m:1900},
  {n:'Гастроном «Дружба»',en:'“Friendship” grocery',h:'продавцы улыбаются по плану',he:'staff smile according to plan',m:1660},
  {n:'Кулинария «Отличник»',en:'“Top Student” deli',h:'пельмени лепят при покупателе',he:'dumplings made in front of you',m:1480}]];
var ME={n:'Гастроном №1',en:'Grocery No. 1'};
var T={
  title:['Соцсоревнование района','District competition'],
  sub:['Неделя против 7 соседних магазинов. Очки — обслуженные покупатели.','A week against 7 neighbouring shops. Points are customers served.'],
  flag:['Переходящее красное знамя','Challenge Red Banner'],
  you:['вы','you'],
  hold:['Знамя висит в вашем зале!','The banner hangs in your hall!'],
  zUp:['Зона повышения — удержитесь до понедельника!','Promotion zone — hold on until Monday!'],
  zDown:['Зона вылета: ещё пара уровней — и выберетесь!','Relegation zone: a couple more levels and you’re out!'],
  zFirst:['Вы первые! Знамя — ваше, если удержитесь.','You’re first! The banner is yours if you hold on.'],
  zMid:['До первого места — ','To first place — '],
  zNone:['Соседи уже торгуют. Первый обслуженный покупатель — и вы в соревновании!','The neighbours are open. Serve your first customer to join!'],
  note:['Очки — обслуженные покупатели за неделю (пн–вс). Соседи считаются с того момента, как вы вступили. Итог — в понедельник: 1–2 место — дивизион выше, 7–8 — ниже. Победитель вешает в зал Переходящее красное знамя на всю следующую неделю.',
        'Points are customers served during the week (Mon–Sun). Neighbours are counted from the moment you joined. Results on Monday: places 1–2 move up a division, 7–8 move down. The winner hangs the Challenge Red Banner in the hall for the whole next week.'],
  prize:['Призы: ','Prizes: '],
  res:['Итоги соцсоревнования','Competition results'],
  resUp:['Повышение! Теперь дивизион «','Promoted! Now the “'],
  resDown:['Дивизион ниже: «','Down a division: “'],
  resStay:['Остаётесь в дивизионе «','You stay in the “'],
  resWin:['Знамя ваше! Валя уже вешает его в зале.','The banner is yours! Valya is hanging it in the hall.'],
  resKeep:['Знамя остаётся у вас ещё на неделю!','You keep the banner for another week!'],
  resLost:['Знамя переходит в ','The banner moves to '],
  next:['Дальше','Next'],
  open:['Соцсоревнование — с 10-го уровня','The competition opens at level 10'],
  plus:[' к соцсоревнованию',' to the competition'],
  back:['Назад','Back']
};
function t(k){var x=T[k];return x?Lx(x[0],x[1]):'';}
var DEF={pay:[[100,60,40],[150,90,60],[220,130,90],[320,190,120]],open:10,up:2,down:2};
function E(){var e=window.GBECO&&GBECO.lg;return e&&typeof e==='object'?e:{};}
function cfg(k){var v=E()[k];return v!==undefined?v:DEF[k];}
function payOf(d,p){var P=cfg('pay');P=P&&P[d]||DEF.pay[d]||[];return p>=1&&p<=3?(+P[p-1]||0):0;}

/* ---------- время: nowMs() + подмена ?date= на маке (или FESTGB.now — общая подмена FEST) ---------- */
var DOFF=null;
function dOff(base){var off=0;try{if(!/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname))return 0;
  var m=/[?&]date=([0-9]{4}-)?([0-9]{1,2})-([0-9]{1,2})(?:T([0-9]{1,2})(?::([0-9]{1,2}))?)?/.exec(location.search);if(!m)return 0;
  var b=new Date(base),mo=+m[2],y=m[1]?parseInt(m[1],10):(mo>=7?2026:2027);
  var d=new Date(y,mo-1,+m[3],m[4]!=null?+m[4]:b.getHours(),m[5]!=null?+m[5]:(m[4]!=null?0:b.getMinutes()),m[4]!=null?0:b.getSeconds());
  off=d.getTime()-base;}catch(e){off=0;}return off;}
function now(){try{if(window.FESTGB&&typeof FESTGB.now==='function'){var f=FESTGB.now();f=f instanceof Date?f.getTime():+f;if(f>1.6e12)return f;}}catch(e){}
  var b=typeof nowMs==='function'?nowMs():Date.now();if(DOFF===null)DOFF=dOff(b);return b+DOFF;}
function dayNo(ms){var d=new Date(ms);return Math.round(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);}
function weekOf(ms){return Math.floor((dayNo(ms)+3)/7);}             // 1970-01-01 — четверг; неделя с понедельника
function posOf(ms){var d=new Date(ms);return (dayNo(ms)+3)%7+(d.getHours()*60+d.getMinutes())/1440;} // 0…7 от понедельника 00:00

/* ---------- сохранение ---------- */
var KEYS=['lgW','lgJ','lgP','lgD','lgF','lgN','lgR','lgRw'];
function fix(s){['lgW','lgJ','lgP','lgD','lgF','lgN','lgRw'].forEach(function(k){s[k]=Math.floor(num(s[k]));});
  if(s.lgD>3)s.lgD=3;if(s.lgJ>6999)s.lgJ=6999;
  if(s.lgR!=null&&!(s.lgR&&typeof s.lgR==='object'&&!Array.isArray(s.lgR)))delete s.lgR;}
function merge(s,d){if(!d||typeof d!=='object')return;var a=num(s.lgW),b=num(d.lgW);
  if(b>a){s.lgW=b;s.lgJ=num(d.lgJ);s.lgP=num(d.lgP);s.lgD=num(d.lgD);}
  else if(a===b&&a){s.lgP=Math.max(num(s.lgP),num(d.lgP));s.lgJ=Math.min(num(s.lgJ),num(d.lgJ));s.lgD=Math.max(num(s.lgD),num(d.lgD));}
  else if(!a&&!b)s.lgD=Math.max(num(s.lgD),num(d.lgD));
  s.lgF=Math.max(num(s.lgF),num(d.lgF));s.lgN=Math.max(num(s.lgN),num(d.lgN));
  if(d.lgR&&typeof d.lgR==='object'&&!s.lgR&&num(d.lgR.w)>num(s.lgRw))s.lgR=d.lgR;
  s.lgRw=Math.max(num(s.lgRw),num(d.lgRw));}
GB.onSave({id:'league',keys:KEYS,fix:fix,merge:merge});
function sv(){try{save();}catch(e){}}

/* ---------- боты ---------- */
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5>>>0;var q=a;q=Math.imul(q^q>>>15,q|1);q^=q+Math.imul(q^q>>>7,q|61);return((q^q>>>14)>>>0)/4294967296;};}
var CACHE={};
// модель бота на неделю: всего покупателей и веса дней (0 — выходной), торгует 9:00–22:00
function bot(w,d,j){var key=w+':'+d+':'+j;if(CACHE[key])return CACHE[key];var b=BOTS[d][j],R=rng(w*7919+d*104729+j*1299709+77);
  var tot=b.m*(.72+R()*.56),nd=3+Math.floor(R()*5),days=[0,1,2,3,4,5,6];
  for(var i=6;i>0;i--){var x=Math.floor(R()*(i+1)),q=days[i];days[i]=days[x];days[x]=q;}
  var wt=[0,0,0,0,0,0,0],sum=0;for(var k=0;k<nd;k++){var v=.5+R();wt[days[k]]=v;sum+=v;}
  var o={tot:tot,wt:wt,sum:sum};CACHE[key]=o;return o;}
function cum(o,f){var c=0;for(var i=0;i<7;i++){if(f<=i)break;var part=Math.min(1,f-i);var h=Math.max(0,Math.min(1,(part*24-9)/13));c+=o.wt[i]*h;}return c/o.sum;}
function botScore(w,d,j,fJ,f){var o=bot(w,d,j);return Math.max(0,Math.round(o.tot*(cum(o,f)-cum(o,fJ))));}
function table(w,d,fJ,f,mine){var rows=[];for(var j=0;j<7;j++)rows.push({j:j,s:botScore(w,d,j,fJ,f)});rows.push({me:1,s:mine});
  rows.sort(function(a,b){return b.s-a.s||(a.me?-1:b.me?1:a.j-b.j);});return rows;}
function placeIn(rows){for(var i=0;i<rows.length;i++)if(rows[i].me)return i+1;return 8;}
function zone(p,d){return p<=cfg('up')&&d<3?'up':p>8-cfg('down')&&d>0?'down':'';}

/* ---------- состояние ---------- */
function isOn(){var s=S_();return !!s&&GB.flag('league')&&(+s.unlocked||0)>=cfg('open');}
function curW(){return weekOf(now());}
function joined(){var s=S_();return !!s&&s.lgW===curW();}
function fJ(){var s=S_();return Math.min(6.999,num(s.lgJ)/1000);}
function nowTable(){var s=S_();if(!joined())return table(curW(),s.lgD||0,posOf(now()),posOf(now()),0);return table(s.lgW,s.lgD||0,fJ(),posOf(now()),num(s.lgP));}
function evt(o){try{if(window.STAT&&STAT.ev)STAT.ev('lg',o);}catch(e){}}
function give(n){if(!(n>0))return;try{if(window.GBECO&&typeof GBECO.give==='function'){GBECO.give('lg',n);return;}}catch(e){}
  var s=S_();s.coins=(+s.coins||0)+(typeof ern==='function'?ern('lg',n):n);try{updCoins();}catch(e){}}
// итог прошедшей недели (если участвовали)
function settle(){var s=S_();if(!s||!s.lgW)return false;var w=s.lgW;if(curW()<=w)return false;
  var d=s.lgD||0,mine=num(s.lgP),had=s.lgF===w,fj=fJ();s.lgW=0;s.lgP=0;s.lgJ=0;
  if(!(mine>0)){sv();return false;}
  var rows=table(w,d,fj,7,mine);
  var p=placeIn(rows),z=zone(p,d),c=payOf(d,p),win=p===1,o=win?-1:rows[0].j;
  if(z==='up')s.lgD=d+1;else if(z==='down')s.lgD=d-1;
  if(win){s.lgF=w+1;s.lgN=(s.lgN||0)+1;}
  s.lgR={w:w,d:d,p:p,z:z,c:c,s:mine,o:o,h:had?1:0};s.lgRw=w;
  give(c);
  evt({a:'week',d:d,p:p,s:mine,c:c});if(z)evt({a:z,d:s.lgD,p:p});if(win)evt({a:'flag',d:d,p:1,n:s.lgN});
  if(p<=3)GB.safe('lg:qp',function(){if(window.GBQP&&GBQP.add)GBQP.add(+(E().qp||50),'lg');});
  GB.emit('league',s.lgR);sv();return true;}
function roll(){if(!S_())return;settle();}
// очки: n обслуженных покупателей
var last={k:'',n:0};
function add(n,key){n=Math.floor(num(n));if(!n||!isOn())return 0;var s=S_();roll();
  if(s.lgW!==curW()){s.lgW=curW();s.lgP=0;s.lgJ=Math.floor(posOf(now())*1000);}
  s.lgP=num(s.lgP)+n;last={k:key||'',n:n,t:Date.now()};sv();return n;}

/* ---------- хуки ---------- */
GB.levelHook.push(function(i){if(!i||i.mode==='rush')return;var g=typeof G!=='undefined'&&G?G:null;
  var prev=g?num(g.lgC):0,n=num(i.served)-prev;if(g)g.lgC=num(i.served);if(n>0)add(n,i.key);});
GB.on('rush',function(n){add(typeof n==='object'&&n?n.n:n,'rush');});
GB.on('ready',function(){roll();});
GB.on('home',function(){roll();setTimeout(function(){GB.safe('lg:res',popResult);},700);});

/* ---------- вид ---------- */
function ord(n){return Lx(n+'-е',n===1?'1st':n===2?'2nd':n===3?'3rd':n+'th');}
function dname(d){var x=DIV[d]||DIV[0];return Lx(x.n,x.en);}
function bname(d,j){var b=BOTS[d][j];return Lx(b.n,b.en);}
// знамя: красное полотнище с золотой бахромой и звездой (SVG)
function flagSvg(w,cls){w=w||64;return '<svg class="lgflag'+(cls?' '+cls:'')+'" width="'+w+'" height="'+Math.round(w*1.25)+'" viewBox="0 0 64 80" aria-hidden="true">'+
  '<rect x="6" y="2" width="3.5" height="76" rx="1.5" fill="#8a5a2a"/><circle cx="7.8" cy="3" r="3.2" fill="#e8b830"/>'+
  '<path d="M10 8 H58 V50 Q50 46 42 50 T26 50 T10 50 Z" fill="#c8102e"/><path d="M10 8 H58 V14 H10 Z" fill="#a50d26"/>'+
  '<path d="M10 50 Q18 54 26 50 T42 50 T58 50" fill="none" stroke="#e8b830" stroke-width="2.4" stroke-dasharray="1.5 2"/>'+
  '<path d="M20 22 l2.4 5 5.4 .6 -4 3.7 1.1 5.3 -4.9-2.7 -4.9 2.7 1.1-5.3 -4-3.7 5.4-.6z" fill="#ffd23f"/>'+
  '<path d="M31 24 h21 M31 30 h21 M31 36 h16" stroke="#ffd23f" stroke-width="2.2" stroke-linecap="round"/>'+
  '<path d="M42 50 v14 M46 50 v10" stroke="#e8b830" stroke-width="1.6"/><circle cx="42" cy="66" r="2.4" fill="#e8b830"/><circle cx="46" cy="62" r="2" fill="#e8b830"/></svg>';}
// значок магазина: козырёк с полосами цвета дивизиона
function shopSvg(c,me){return '<svg class="lgshop" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><rect x="4" y="13" width="26" height="18" rx="2" fill="'+(me?'#fff3d6':'#f4ead8')+'" stroke="#3b2a1a" stroke-width="1.6"/>'+
  '<path d="M2 13 L6 5 H28 L32 13 Z" fill="'+c+'" stroke="#3b2a1a" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 5 L8 13 M17 5 V13 M24 5 L26 13" stroke="#fff" stroke-width="2.2"/>'+
  '<rect x="13" y="20" width="8" height="11" fill="'+(me?'#c8401c':'#8a6a4a')+'"/><rect x="6.5" y="17" width="5" height="5" fill="#bfe0f0"/><rect x="22.5" y="17" width="5" height="5" fill="#bfe0f0"/></svg>';}
function badge(d,sz){var x=DIV[d]||DIV[0];sz=sz||44;return '<svg class="lgbadge" width="'+sz+'" height="'+sz+'" viewBox="0 0 64 64" aria-hidden="true">'+
  '<circle cx="32" cy="32" r="29" fill="'+x.c+'" stroke="#3b2a1a" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>'+
  '<path d="M32 13 l5 11 12 1.3 -9 8 2.6 11.7 -10.6-6 -10.6 6 2.6-11.7 -9-8 12-1.3z" fill="#ffd23f" stroke="#3b2a1a" stroke-width="1.5" stroke-linejoin="round"/>'+
  '<text x="32" y="58" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">'+(d+1)+'</text></svg>';}
function leftTxt(){var f=posOf(now()),dl=6-Math.floor(f),h=Math.max(1,Math.ceil((7-f)*24));
  return dl>0?Lx('до итогов '+dl+' '+plx(dl,'день','дня','дней'),dl+(dl>1?' days':' day')+' to the results'):Lx('итоги сегодня в полночь (через '+h+' ч)','results tonight at midnight (in '+h+' h)');}

function resultHtml(r){var h='<div class="lgres '+(r.z||'')+'">'+(r.p===1?flagSvg(56,'win'):badge(r.d,52))+'<div><b>'+esc(dname(r.d))+': '+ord(r.p)+Lx(' место из 8',' place of 8')+'</b><small>'+
  (r.z==='up'?t('resUp')+esc(dname(r.d+1))+Lx('».','” division.'):r.z==='down'?t('resDown')+esc(dname(r.d-1))+Lx('». Отыграемся!','”. We’ll bounce back!'):t('resStay')+esc(dname(r.d))+Lx('».','” division.'))+
  ' '+Lx('Покупателей за неделю: ','Customers this week: ')+r.s+'.'+(r.c?' '+Lx('Премия: +','Bonus: +')+r.c+' 💰.':'')+'</small>'+
  (r.p===1?'<small class="lgfl">🚩 '+(r.h?t('resKeep'):t('resWin'))+'</small>':r.h&&r.o>=0?'<small class="lgfl">'+t('resLost')+'«'+esc(bname(r.d,r.o))+'»'+Lx('. Вернём!','. We’ll win it back!')+'</small>':'')+'</div></div>';return h;}
function popResult(){var s=S_();if(!s||!s.lgR||!isOn())return;if(typeof modalOn!=='undefined'&&modalOn)return;
  var sm=document.getElementById('scr-map');if(GB.cur!=='league'&&sm&&!sm.classList.contains('on'))return;
  var r=s.lgR; // стираем только по «Дальше»: окно закрыли другим путём — покажем при следующем заходе на главный
  try{modal('<h2>🚩 '+t('res')+'</h2>'+resultHtml(r)+'<div class="row"><button class="btn green" id="lgOk">'+t('next')+'</button></div>');
    if(r.p===1||r.z==='up'){try{SND.win();}catch(e){}}
    var b=document.getElementById('lgOk');if(b)b.onclick=function(){if(s.lgR===r){delete s.lgR;sv();}hideModal();try{GB.refresh();}catch(e){}};}catch(e){}}

function render(el){roll();var s=S_(),d=s.lgD||0,rows=nowTable(),me=placeIn(rows),z=zone(me,d),played=joined()&&num(s.lgP)>0,h='';
  h+='<header class="gh"><button class="icon" id="lgBack" aria-label="'+t('back')+'">←</button><div class="gt"><div>'+t('title')+'</div><div class="sub">'+Lx('Дивизион «','“')+esc(dname(d))+Lx('» · ','” division · ')+leftTxt()+'</div></div></header>';
  h+='<div class="lgwrap">';
  if(s.lgR){h+=resultHtml(s.lgR);delete s.lgR;sv();}
  var held=s.lgF===curW();
  h+='<div class="lghead">'+(held?flagSvg(54):badge(d,54))+'<div><b>'+(held?t('hold'):t('title'))+'</b><small>'+t('sub')+'</small>'+
    '<small>'+Lx('Ваших покупателей: ','Your customers: ')+'<b>'+(joined()?num(s.lgP):0)+'</b>'+(played?' · '+ord(me)+Lx(' место',' place'):'')+'</small></div></div>';
  var zt=!played?t('zNone'):me===1?t('zFirst'):z==='up'?t('zUp'):z==='down'?t('zDown'):t('zMid')+(rows[0].s-num(s.lgP)+1)+' '+plx(rows[0].s-num(s.lgP)+1,'покупатель','покупателя','покупателей','customer','customers')+'.';
  h+='<p class="lgzt '+(played?z:'')+'">'+zt+'</p><div class="lgt">';
  rows.forEach(function(r,i){var p=i+1,zz=zone(p,d),b=r.me?null:BOTS[d][r.j];
    h+='<div class="lgr'+(r.me?' lgme':'')+(zz?' '+zz:'')+'"><b class="lgp">'+(p===1?'🚩':p)+'</b>'+shopSvg(r.me?'#c8401c':DIV[d].c,r.me)+
      '<span class="lgn"><b>'+(r.me?esc(Lx(ME.n,ME.en))+' <i>('+t('you')+')</i>':esc(Lx(b.n,b.en)))+'</b><small>'+(r.me?(played?Lx('ваш магазин','your shop'):Lx('ещё не торговали на этой неделе','no customers this week yet')):esc(Lx(b.h,b.he)))+'</small></span><i class="lgg">'+(r.s||'—')+'</i></div>';});
  h+='</div><p class="lgnote">'+t('note')+' '+t('prize')+[1,2,3].map(function(p){return ord(p)+' — '+payOf(d,p)+' 💰';}).join(', ')+(s.lgN?'. '+Lx('Знамён завоёвано: ','Banners won: ')+s.lgN:'')+'.</p></div>';
  el.innerHTML=h;var bk=el.querySelector('#lgBack');if(bk)bk.onclick=function(){try{SND.tap();}catch(e){}goHome();};}
function goHome(){if(GB.goHome)return GB.goHome();if(typeof openMap==='function')openMap();}
GB.screen('league',{render:render});

// зал: знамя и строка места (клик — экран соцсоревнования)
GB.add(GB.homeSlots,{id:'league',order:60,zone:'hall',on:function(){return isOn();},
  render:function(){roll();var s=S_(),held=s.lgF===curW(),pl0=joined()&&num(s.lgP)>0?placeIn(nowTable()):0;
    return '<div class="lghall" role="button" tabindex="0">'+(held?flagSvg(40,'hang'):'<span class="lgic">🚩</span>')+'<span><b>'+Lx('Соцсоревнование: ','Competition: ')+(pl0?ord(pl0)+Lx(' место',' place'):Lx('ждёт вас','waiting for you'))+'</b><small>'+(held?t('hold'):Lx('Дивизион «','“')+esc(dname(s.lgD||0))+Lx('» · ','” · ')+leftTxt())+'</small></span>'+(s.lgR?'<i class="dot on"></i>':'')+'</div>';},
  mount:function(el){var b=el.querySelector('.lghall');if(b)b.onclick=b.onkeydown=function(e){if(e&&e.type==='keydown'&&e.key!=='Enter')return;try{SND.tap();}catch(x){}GB.go('league');};}});
// «Касса»: «+12 к соцсоревнованию» (не кнопка)
GB.add(GB.winSlots,{id:'league',order:40,zone:'extra',fit:2,on:function(){return isOn();},
  render:function(ctx){var g=ctx&&ctx.g;if(!last.n||Date.now()-last.t>15000||!g||last.k!==((g.daily?'d':'l')+(g.idx+1)))return '';
    return '<div class="lgwin">🚩 +'+last.n+t('plus')+'</div>';}});

window.GBLG={now:now,week:curW,on:isOn,add:add,flag:function(){var s=S_();return !!s&&isOn()&&s.lgF===curW();},
  place:function(){return joined()?placeIn(nowTable()):0;},div:function(){var s=S_();return s?s.lgD||0:0;},
  prg:function(){var s=S_();return {lg:s?s.lgD||0:0,lgp:joined()?placeIn(nowTable()):0};},
  flagSvg:flagSvg,settle:settle,_bots:BOTS,_table:function(w,d,fj,f,m){return table(w,d,fj,f,m);}};
})();
