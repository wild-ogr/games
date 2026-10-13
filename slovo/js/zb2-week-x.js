'use strict';
/* ================= zb2-week-x — «Неделя у Зины» (поток WEEK, з2 буст_в2.0, 12.10.2026) =================
   Грузится лениво: js/zb2-week.js (загрузчик, флаг 'week') → ZB.load после ready. css/zb2-week.css — тоже лениво (ссылкой отсюда).
   ЧТО ЕСТЬ (каждое — свой флаг ZB2.reg, ?off=<id>; ?off=week — всё):
     wkev  — событие недели по кругу (пн–вс): «Буква недели» (L), «Тематическая неделя» (T), «Конкурс стенгазет» (G), «Олимпиада» (O) с финалом
             выходных на готовой мини-игре (ZMG.open(id,{mode:'week'})). 3 ступени. Праздничные недели (Страшилки, Новый год) — без события.
     subb  — «Субботник» сб–вс (кроме праздничных недель и недели Дня матери): слова = мусор, цель 50 → сундук выходного.
     wplan — «План на неделю»: 5 больших целей (уровни, бонусные, пятёрки, мини-игры, дни с уроком) → «Четвертная пятёрка».
     tabel — «Табель за месяц»: пятёрки дневника (ZB 'five') по дням месяца → «Хорошо» (8) / «Похвальный лист» (16).
     klas  — «Кляссер дяди Коли»: 4 серии по 6 марок (Коты — субботники, Овощи — план, Школьные события, Праздники — редкие);
             6 марок серии → наряд/блюдце (OUTFITS/SKINS, gift:'klas', без новых рисунков). Дубли — очки сезона.
     mama  — День матери 27–29.11: «Открытка маме» — 4 тёплых слова → марка «Мамина», 💡; строка в календаре и плашка на Доме.
     wkzap — записки ZAP: «буква недели» и праздничные (шаблоны в ZB2ZAP_DATA.T с need/xf/wt — 3 строки с меткой zb2-WEEK в zb2-zap-ui.js).
   ЧИСЛА: ZBECO.week (если ECO дал) или запасные W0 ниже. Монеты — ZBECO.give('cal', n, 'quest') и недельный потолок W.cap (30); сверх — очки сезона
     (1 за 5 💰, ZBSEA.addPts). 💡 — hbAdd(n,'week').
   ПОЛЕ S.z2k (ZB2.field, ≤ ~300 знаков): w неделя (номер), e прогресс события, es ступени (биты), f финал олимпиады (лучшая ступень 0–3), s субботник,
     ss субботник выдан, p:[уровни, бонусные, пятёрки, мини-игры, дни(биты пн–вс)], pg цели плана (биты, 32 — сундук), cw монет за неделю,
     mo месяц ГГГГММ, md дни с пятёркой (биты 1–31), mg табель (1 хорошо, 2 отлично), k:[биты 4 серий], r наряды выданы (биты), x дублей,
     hk праздник (ид), hp прогресс праздника, n неделя «видел новое», lw/lt/ls итог прошлой недели (тип, ступени, субботник).
   НАРУЖУ: window.ZB2WK = {on, cur(), sched(key), open(tab), st(), stampAdd(ser,i)} ; экран ZB.go('week',{tab:'week'|'tabel'|'klas'}).
   STAT: STATZB.z2('week',{a:'step'|'subb'|'plan'|'tabel'|'stamp'|'prize'|'final'|'mama', …}).
   Старые WebView: без ?. ?? .at :has. */
(function(){
if(typeof ZB==='undefined'||!window.ZB2||ZB2.off('week')||window.ZB2WK)return;
var Z2=ZB2;
function R(id,t){return Z2.reg(id,{t:t,who:'WEEK'})&&!Z2.off('week');}
var EV=R('wkev','События недели по кругу'),SUB=R('subb','Субботник по выходным'),PLAN=R('wplan','План на неделю'),TAB=R('tabel','Табель за месяц'),
  KL=R('klas','Кляссер дяди Коли'),MAMA=R('mama','День матери 27–29.11'),WZ=R('wkzap','Записки: буква недели и праздники');
var ANY=EV||SUB||PLAN||TAB||KL||MAMA;
var W0={cap:30,step:[{hb:1,sp:3},{c:15,sp:3},{sp:5,st:1}],subb:{goal:50,c:15,hb:1,sp:5},plan:{c:20,hb:2,sp:2,lv:25,lvNew:15,bon:12,five:3,mg:3,days:4},
  tab:{good:8,best:16,hbG:1,spG:5,hbB:2,spB:10},mama:{goal:4,hb:1,sp:5},dup:5,final:{hb:1,sp:5},spPer:5,from:5};
function Wc(){var e=window.ZBECO;return e&&e.week&&e.week.step?e.week:W0;}
/* ---------- даты ---------- */
function tk(){try{return todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function dn(k){k=+k||0;return k?Math.round(Date.UTC(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100)/864e5):0;}
function key(n){var d=new Date(n*864e5);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function wk(n){return Math.floor((n+3)/7);}
function dow(n){return (n+3)%7;}            // 0 — пн … 5 — сб, 6 — вс
function mon(n){return key(n-dow(n));}
function lv(){try{return +S.lv||0;}catch(e){return 0;}}
function pl(n,a,b,c){n=Math.abs(n)%100;var x=n%10;return n>10&&n<20?c:x===1?a:x>=2&&x<=4?b:c;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function coinI(){try{return COIN_I;}catch(e){return '💰';}}
function sv(){try{save();}catch(e){}}
function snd(){try{SND.tap();}catch(e){}}
function st(a,o){o=o||{};o.a=a;o.lv=lv();try{if(window.STATZB&&STATZB.z2)STATZB.z2('week',o);else if(window.STAT&&STAT.ev)STAT.ev('week',o);}catch(e){}}
function toastW(t){try{if(typeof toast==='function')toast(t,4200);}catch(e){}}
function norm(w){return String(w||'').toLowerCase().replace(/ё/g,'е');}
/* ---------- расписание: понедельник → событие (02-events §3); вне таблицы — по кругу ---------- */
// буквы — с частотой в уровнях ≥ 0,27 слова на уровень (Ж 0,2 и Щ 0,05 — у многих игроков 0 слов на 15 уровней вперёд; Z2-WEEK-tools/freq.py)
var LET={'ш':[3,6,10],'з':[4,9,14],'ч':[3,7,12],'б':[6,14,24],'м':[5,12,20],'г':[5,11,18]},LETS=['ш','з','ч','б','м','г'];
var TH={ogorod:{t:'Огород',ic:'🥕',st:[4,8,12],y:'Огород. Наконец-то. Я буду охранять морковь.',
    w:'грядка морковь лук чеснок капуста кабачок тыква огурец томат помидор редис редька репа свекла горох боб бобы укроп петрушка лопата грабли тяпка лейка полив сорняк корень ботва навоз парник теплица картофель картошка клубника малина смородина крыжовник яблоко груша слива вишня сад сарай забор ведро шланг семя семена росток лист куст дача тля жук крот улитка сорт урожай погреб пугало кол межа рассада гряда огород щавель салат мята хрен перец баклажан арбуз дыня зерно горшок клумба цветок роза мак астра пион ромашка тачка'},
  kuhnya:{t:'Кухня',ic:'🍳',st:[4,9,14],y:'Кухня — моё царство. Ять, лапы со стола!',
    w:'кухня плита печь кастрюля сковорода котел чайник чашка кружка блюдце тарелка ложка вилка нож половник терка сито миска банка крупа соль сахар мука масло тесто пирог блин каша суп борщ щи котлета пюре компот чай кофе сок молоко сыр хлеб батон булка торт кекс пряник рецепт фартук прихватка стол стул шкаф полка таз кран мойка духовка противень плов салат винегрет икра рыба мясо фарш оладья ватрушка кисель квас мед варенье джем сметана творог яйцо омлет лапша рис гречка манка перец лук укроп сода дрожжи поднос сервиз самовар'},
  zverye:{t:'Зверьё',ic:'🦔',st:[5,10,16],y:'Зверьё. Ять говорит, что он главный зверь, а остальные — так, родственники.',
    w:'кот кошка пес собака мышь крыса лиса волк заяц еж медведь лось олень белка барсук бобр крот хорек рысь тигр лев слон жираф зебра кенгуру коала панда енот выдра норка соболь куница коза козел баран овца корова бык конь лошадь осел свинья кабан кролик хомяк утка гусь курица петух индюк ворона сорока воробей голубь сова орел цапля аист рыба сом щука окунь карась краб рак жаба лягушка змея уж ящерица черепаха пчела оса муха комар жук паук бабочка лань тюлень морж кит дельфин акула пума ягуар верблюд як бизон зубр сурок суслик'},
  banya:{t:'Баня',ic:'🧖',st:[3,6,10],y:'Баня! С лёгким паром. Веник не трогать — он для дела.',
    w:'баня веник пар парилка печь камень шайка таз ковш ведро вода мыло мочалка полотенце халат простыня тапки квас чай полок лавка скамья дрова топор жар пот кадка бочка жбан дуб береза пихта мята липа мед соль пена душ кран кафель сауна прорубь снег купель шапка войлок'}},
  THS=['ogorod','kuhnya','zverye','banya'];
var SCHED={20261019:['L','ш'],20261026:['-','hw'],20261102:['T','ogorod'],20261109:['G'],20261116:['O'],20261123:['L','з'],20261130:['T','kuhnya'],
  20261207:['G'],20261214:['-','ny'],20261221:['-','ny'],20261228:['-','ny'],20270104:['O'],20270111:['T','zverye'],20270118:['L','ч'],20270125:['G'],20270201:['T','banya']};
var NOSUB={20261026:1,20261123:1,20261214:1,20261221:1,20261228:1};   // Страшилки, День матери, Утренник/Каникулы
function sched(mk){var x=SCHED[mk];if(x)return {k:x[0],p:x[1]||''};var w=wk(dn(mk)),t=['L','T','G','O'][((w%4)+4)%4],c=Math.floor(w/4);
  return {k:t,p:t==='L'?LETS[c%LETS.length]:t==='T'?THS[c%THS.length]:''};}
var STAR=['lishnee','slova','diktant','zagadki','baraban','filword','opechatki','pary'];   // «звезда недели» стенгазеты
var FIN=['minutka','slova','lishnee','diktant','zagadki','makulatura','muha','zagadala'];   // финал олимпиады — готовые словесные игры
function pickGame(L,w){try{if(!window.ZMG)return '';var ok=L.filter(function(id){return ZMG.isOpen&&ZMG.isOpen(id)&&!(ZMG.isOff&&ZMG.isOff(id))&&ZMG.info(id);});
  return ok.length?ok[((w%ok.length)+ok.length)%ok.length]:'';}catch(e){return '';}}
/* ---------- праздники (даты — местные, ГГГГММДД) ---------- */
var HOL=[{id:'hw',a:20261026,b:20261102,goal:3,u:'win',ser:3,i:0},{id:'d4',a:20261104,b:20261104,goal:1,u:'win',ser:3,i:1},
  {id:'mama',a:20261127,b:20261129,goal:4,u:'mama',ser:3,i:2},{id:'elka',a:20261215,b:20261230,goal:10,u:'win',ser:3,i:3},
  {id:'ny',a:20261231,b:20270103,goal:1,u:'win',ser:3,i:4},{id:'oliv',a:20270113,b:20270114,goal:1,u:'win',ser:3,i:5}];
var MAMAW='мама пирог ласка шарф сказка чай суп торт борщ блин каша сон песня цветок роза мак букет кофта плед уют тепло дом сад улыбка забота мед варенье пряник подарок открытка ладонь сердце любовь обед ужин котлета компот ласка нежность пирожок оладья';
function hol(T){T=T||tk();for(var i=0;i<HOL.length;i++)if(T>=HOL[i].a&&T<=HOL[i].b)return HOL[i];return null;}
/* ---------- кляссер ---------- */
var SER=[
  {id:'c',t:'Коты нашего двора',src:'Субботник',st:[['🐈','Ять-дворник'],['🐱','Мурка-чистюля'],['🐾','Уголёк'],['😺','Рыжик с метлой'],['😸','Пушок'],['😼','Васька-завхоз']],
    pr:{k:'s',id:'k_cat',n:'Кошачье блюдце',d:'Рыжее, в лапках. Ять считает, что оно его. Спорить бесполезно.',lc:'#6b3a12',lb:'rgba(255,236,200,.75)',on:'#e08a2c',onc:'#fff',line:'#e08a2c',sh:'#c9a27a'}},
  {id:'v',t:'Овощи-отличники',src:'План на неделю',st:[['🥕','Морковь-отличница'],['🥒','Огурец-хорошист'],['🎃','Тыква-староста'],['🌶','Перец-физрук'],['🧅','Лук-плакса'],['🥔','Картошка-медалистка']],
    pr:{k:'o',id:'k_ogor',n:'Огородница-отличница',d:'Кофта цвета «укроп», фартук и косынка. Кабачки при виде её выпрямляются.',c1:'#5e9e3a',c2:'#3f7426',f:'#2b5419',beads:'amber',scarf:{c:'#f5b72d',dot:'#e2463b'},apron:{c:'#fffdf8',dot:'#5e9e3a'}}},
  {id:'e',t:'Школьные события',src:'События недели',st:[['🔤','Буква недели'],['🧺','Тематическая неделя'],['📰','Стенгазета'],['🏅','Олимпиада'],['🥇','Финал олимпиады'],['📜','Похвальный лист']],
    pr:{k:'o',id:'k_otl',n:'Почётная грамота',d:'Тёмно-синий костюм, жемчуг и брошь «Отличник народного просвещения». Сама себе выдала.',c1:'#2f5d9a',c2:'#1f4173',f:'#132a4d',beads:'pearl',lapel:'#1a3360',brooch:1}},
  {id:'h',t:'Праздники',src:'Только в праздники',rare:1,st:[['🎃','Страшилка','26.10–02.11'],['🌳','Выходной во дворе','04.11'],['💐','Мамина','27–29.11'],['🎄','Ёлочная','15–30.12'],['🎆','Новогодняя','31.12–03.01'],['🥗','Оливье','13–14.01']],
    pr:{k:'s',id:'k_fest',n:'Праздничный сервиз',d:'Красное с золотом. Достаётся раз в год — а у тебя теперь каждый день праздник.',lc:'#7a1020',lb:'rgba(255,240,200,.6)',on:'#c62828',onc:'#ffe08a',line:'#d4a232',sh:'#8a5a1c'}}];
var EVSLOT={L:0,T:1,G:2,O:3};
/* ---------- поле S.z2k ---------- */
var DEF={w:0,e:0,es:0,f:0,s:0,ss:0,p:[0,0,0,0,0],pg:0,cw:0,mo:0,md:0,mg:0,k:[0,0,0,0],r:0,x:0,hk:'',hp:0,hd:0,n:0,lw:'',lt:0,ls:0};
function num(v){v=+v;return isFinite(v)&&v>0?Math.floor(v):0;}
function orN(a,b){a=num(a);b=num(b);var r=0,p=1;while(a>0||b>0){if(a%2||b%2)r+=p;a=Math.floor(a/2);b=Math.floor(b/2);p*=2;}return r;}
function has(m,i){return Math.floor(num(m)/Math.pow(2,i))%2===1;}
function bit(m,i){return has(m,i)?num(m):num(m)+Math.pow(2,i);}
function cnt(m){m=num(m);var c=0;while(m>0){c+=m%2;m=Math.floor(m/2);}return c;}
function fixK(o){['w','e','es','f','s','ss','pg','cw','mo','md','mg','r','x','hp','hd','n','lt','ls'].forEach(function(k){o[k]=num(o[k]);});o.f=Math.min(3,o.f);
  if(!Array.isArray(o.p)||o.p.length!==5)o.p=[0,0,0,0,0];o.p=o.p.map(num);if(!Array.isArray(o.k)||o.k.length!==4)o.k=[0,0,0,0];o.k=o.k.map(function(x){return num(x)%64;});
  if(typeof o.hk!=='string')o.hk='';if(typeof o.lw!=='string')o.lw='';}
Z2.field('z2k',{def:DEF,fix:function(o){fixK(o);},
  merge:function(a,b){fixK(b);fixK(a);
    if(b.w>a.w){['w','e','es','f','s','ss','pg','cw','lw','lt','ls'].forEach(function(k){a[k]=b[k];});a.p=b.p.slice();}
    else if(b.w===a.w){['e','f','s','cw'].forEach(function(k){a[k]=Math.max(a[k],b[k]);});a.es=orN(a.es,b.es);a.ss=Math.max(a.ss,b.ss);a.pg=orN(a.pg,b.pg);
      a.p=a.p.map(function(x,i){return i===4?orN(x,b.p[4]):Math.max(x,b.p[i]);});}
    if(b.mo>a.mo){a.mo=b.mo;a.md=b.md;a.mg=b.mg;}else if(b.mo===a.mo){a.md=orN(a.md,b.md);a.mg=orN(a.mg,b.mg);}
    if(b.hk&&b.hk===a.hk){a.hp=Math.max(a.hp,b.hp);a.hd=Math.max(a.hd,b.hd);}else if(b.hk&&b.hd>a.hd){a.hk=b.hk;a.hp=b.hp;a.hd=b.hd;}
    a.k=a.k.map(function(x,i){return orN(x,b.k[i]);});a.r=orN(a.r,b.r);a.x=Math.max(a.x,b.x);a.n=Math.max(a.n,b.n);}});
function K(){if(typeof S==='undefined')return null;if(!S.z2k||typeof S.z2k!=='object')S.z2k=JSON.parse(JSON.stringify(DEF));return S.z2k;}
/* ---------- текущая неделя ---------- */
function cur(T){T=T||tk();var n=dn(T),mk=mon(n),s=sched(mk),d=dow(n),h=hol(T);
  return {T:T,n:n,w:wk(n),mk:mk,d:d,ev:EV&&s.k!=='-'?s:null,hol:s.k==='-'?s.p:'',sub:SUB&&d>=5&&!NOSUB[mk],h:h,w5:d>=5};}
// новая неделя: запомнить итог прошлой, обнулить недельное
function roll(){var o=K();if(!o)return null;var c=cur();
  if(o.w!==c.w){if(o.w){o.lw=sched(mon(o.w*7-3)).k;o.lt=cnt(o.es);o.ls=o.ss;}o.w=c.w;o.e=0;o.es=0;o.f=0;o.s=0;o.ss=0;o.p=[0,0,0,0,0];o.pg=0;o.cw=0;sv();}
  var m=Math.floor(c.T/100);if(o.mo!==m){o.mo=m;o.md=0;o.mg=0;}
  if(c.h&&o.hk!==c.h.id){o.hk=c.h.id;o.hp=0;o.hd=0;}
  return o;}
/* ---------- награды ---------- */
function sp(n,why){n=Math.round(n);if(n>0)try{if(window.ZBSEA&&ZBSEA.addPts)ZBSEA.addPts(n,why||'week');}catch(e){}return n;}
function hb(n){if(!(n>0))return 0;try{if(typeof hbAdd==='function'){hbAdd(n,'week');return n;}}catch(e){}try{S.hb=(+S.hb||0)+n;}catch(e){}return n;}
function coins(n){var o=K(),W=Wc();n=Math.floor(+n||0);if(n<=0||!o)return {c:0,sp:0};var left=Math.max(0,(W.cap||0)-o.cw),k=Math.min(n,left),got=0;
  if(k>0){try{if(window.ZBECO&&ZBECO.give)got=ZBECO.give('cal',k,'quest');else if(typeof addCoins==='function'){addCoins(k,'quest');got=k;}}catch(e){}}
  o.cw+=got;var over=n-got,extra=over>0?sp(Math.max(1,Math.round(over/(W.spPer||5))),'wkcoin'):0;try{if(typeof updCoins==='function')updCoins();}catch(e){}return {c:got,sp:extra};}
// выдать набор {c, hb, sp, st:[серия, марка]} → строка «что получил»
function give(r,why){var a=[];if(!r)return '';if(r.c){var g=coins(r.c);if(g.c)a.push('+'+g.c+' '+coinI());if(g.sp)a.push('⭐ +'+g.sp+' в четверть');}
  if(r.hb&&hb(r.hb))a.push('💡 +'+r.hb);if(r.sp&&sp(r.sp,why))a.push('⭐ +'+r.sp);
  if(r.st){var s=stamp(r.st[0],r.st[1]);if(s)a.push(s);}
  sv();return a.join(' · ');}
// марка: серия ser (0–3), номер i (−1 — следующая по порядку); вернёт строку или ''
function stamp(ser,i){if(!KL)return '';var o=K(),S0=SER[ser];if(!o||!S0)return '';if(i<0){i=-1;for(var j=0;j<6;j++)if(!has(o.k[ser],j)){i=j;break;}}
  if(i<0||has(o.k[ser],i)){o.x++;var d=sp(Wc().dup||5,'dup');st('stamp',{s:S0.id,i:i,dup:1});return '🏷 дубль марки → ⭐ +'+d;}
  o.k[ser]=bit(o.k[ser],i);st('stamp',{s:S0.id,i:i});var t='🏷 марка «'+S0.st[i][1]+'»';
  if(cnt(o.k[ser])>=6&&!has(o.r,ser)){o.r=bit(o.r,ser);prize(ser);t+=' · серия собрана: '+S0.pr.n+'!';st('prize',{s:S0.id});}
  return t;}
function prize(ser){var p=SER[ser].pr;try{S.own=S.own||{};S.own[p.k+':'+p.id]=1;}catch(e){}addItems();}
/* ---------- наряды и блюдца кляссера в «Обликах» (видны всегда при кляссере, за монеты не продаются) ---------- */
function addItems(){SER.forEach(function(x){var p=x.pr,L=p.k==='o'?(typeof OUTFITS!=='undefined'?OUTFITS:null):(typeof SKINS!=='undefined'?SKINS:null),
    own=!!((S.own||{})[p.k+':'+p.id]);if(!L||(!KL&&!own)||L.some(function(y){return y.id===p.id;}))return;var it={};for(var k in p)if(k!=='k')it[k]=p[k];it.gift='klas';it.ser=x.t;L.push(it);});}
function shopTxt(it){var o=K(),i=-1;SER.forEach(function(x,j){if(x.pr.id===it.id)i=j;});if(i<0||!o)return '';
  return '<div class="ok" style="color:var(--ink2)">🏷 Кляссер дяди Коли<br>(серия «'+esc(SER[i].t)+'»: '+cnt(o.k[i])+' из 6)</div>';}
// строка в «Обликах» (extras.js зовёт ZB2CAL.shop(it) для подарков): своё — для gift:'klas', остальное — как было; переживает замену ZB2CAL.shop
function hookShop(){var C=window.ZB2CAL;if(!C||C.__zk)return;var inner=C.shop;
  var w=function(it){if(it&&it.gift==='klas')return shopTxt(it);return typeof inner==='function'?inner.apply(this,arguments):'';};
  try{Object.defineProperty(C,'shop',{configurable:true,enumerable:true,get:function(){return w;},set:function(f){inner=f;}});C.__zk=1;}catch(e){}}
/* ---------- шаги события ---------- */
function steps(ev){if(!ev)return [0,0,0];if(ev.k==='L')return LET[ev.p]||[4,8,12];if(ev.k==='T')return (TH[ev.p]||{}).st||[4,8,12];if(ev.k==='G')return [3,6,10];return [5,12,20];}
function evName(ev){if(!ev)return '';if(ev.k==='L')return 'Буква недели: «'+ev.p.toUpperCase()+'»';if(ev.k==='T')return 'Тематическая неделя: '+(TH[ev.p]||{}).t;if(ev.k==='G')return 'Конкурс стенгазет';return 'Олимпиада';}
function evIc(ev){if(!ev)return '📅';return ev.k==='L'?'🔤':ev.k==='T'?(TH[ev.p]||{}).ic||'🧺':ev.k==='G'?'📰':'🏅';}
function evUnit(ev,n){if(!ev)return '';if(ev.k==='L')return pl(n,'слово','слова','слов')+' с «'+ev.p.toUpperCase()+'»';if(ev.k==='T')return pl(n,'слово','слова','слов')+' темы';
  if(ev.k==='G')return pl(n,'заметка','заметки','заметок');return pl(n,'балл','балла','баллов');}
function evRule(ev){if(!ev)return '';if(ev.k==='L')return 'Каждое найденное слово с буквой «'+ev.p.toUpperCase()+'» (и бонусное тоже) — в копилку недели.';
  if(ev.k==='T')return 'Слова на тему «'+(TH[ev.p]||{}).t+'» в уровнях — в копилку. '+(TH[ev.p]||{}).y;
  if(ev.k==='G')return 'Сыграй мини-игру — заметка в стенгазету. Игра-звезда недели ('+starName()+') — две заметки. Толик уже рисует заголовок. С ошибкой.';
  return 'Уровень без подсказок — олимпиадный балл. На выходных — финал в мини-игре. Списывать нельзя. Даже у кота.';}
function starId(){var c=cur();return pickGame(STAR,c.w)||'';}
function starName(){var id=starId();try{return id?ZMG.info(id).t:'любая';}catch(e){return 'любая';}}
function finId(){var c=cur();return pickGame(FIN,c.w);}
function evAdd(n,src){var c=cur();if(!c.ev||n<=0||lv()<(Wc().from||5))return;var o=roll(),S3=steps(c.ev),W=Wc(),msg=[];o.e+=n;
  for(var i=0;i<3;i++)if(o.e>=S3[i]&&!has(o.es,i)){o.es=bit(o.es,i);var r=W.step[i]||{},rr={c:r.c,hb:r.hb,sp:r.sp};if(r.st)rr.st=[2,EVSLOT[c.ev.k]];
    var g=give(rr,'wkev');msg.push(evName(c.ev)+' — ступень '+(i+1)+(g?': '+g:''));st('step',{k:c.ev.k,p:c.ev.p,i:i+1,e:o.e});}
  sv();if(msg.length)toastW(msg.join('\n'));}
/* ---------- субботник ---------- */
function subAdd(n){var c=cur();if(!c.sub||n<=0||lv()<(Wc().from||5))return;var o=roll(),G=Wc().subb;if(o.ss)return;o.s+=n;
  if(o.s>=G.goal){o.ss=1;var g=give({c:G.c,hb:G.hb,sp:G.sp,st:[0,-1]},'subb');st('subb',{s:o.s});toastW('🧹 Субботник сделан! Под диваном нашлись слова 1987 года. '+g);}sv();}
/* ---------- план на неделю ---------- */
function planGoals(){var P=Wc().plan;return [{ic:'🎯',t:'Пройди уровни',g:lv()<30?P.lvNew:P.lv},{ic:'⭐',t:'Найди бонусные слова',g:P.bon},{ic:'5️⃣',t:'Получи пятёрки в дневник',g:P.five},
  {ic:'🎲',t:'Сыграй в мини-игры',g:P.mg},{ic:'📆',t:'Поиграй в разные дни',g:P.days}];}
function planVal(o,i){return i===4?cnt(o.p[4]):o.p[i];}
function planAdd(i,n){if(!PLAN||lv()<(Wc().from||5))return;var o=roll(),G=planGoals(),P=Wc().plan;if(i===4)o.p[4]=bit(o.p[4],n);else o.p[i]+=n;
  if(!has(o.pg,i)&&planVal(o,i)>=G[i].g){o.pg=bit(o.pg,i);sp(P.sp,'plan');st('plan',{i:i});}
  if(cnt(o.pg%32)>=5&&!has(o.pg,5)){o.pg=bit(o.pg,5);var g=give({c:P.c,hb:P.hb,st:[1,-1]},'plan');st('plan',{i:5});toastW('📗 План на неделю выполнен — четвертная пятёрка! '+g);}
  sv();}
/* ---------- табель ---------- */
function tabFive(){if(!TAB)return;var o=roll(),T=tk(),d=T%100,W=Wc().tab;o.md=bit(o.md,d-1);var n=cnt(o.md);
  if(n>=W.good&&!has(o.mg,0)){o.mg=bit(o.mg,0);var g=give({hb:W.hbG,sp:W.spG},'tabel');st('tabel',{g:1,n:n});toastW('📒 Табель: «хорошо» за месяц! '+g);}
  if(n>=W.best&&!has(o.mg,1)){o.mg=bit(o.mg,1);var g2=give({hb:W.hbB,sp:W.spB,st:[2,5]},'tabel');st('tabel',{g:2,n:n});toastW('📜 Похвальный лист за месяц! '+g2);}sv();}
/* ---------- праздники ---------- */
function holAdd(u,n){var c=cur(),h=c.h;if(!h||h.u!==u||n<=0)return;if(h.id==='mama'&&!MAMA)return;if(h.id!=='mama'&&!KL)return;var o=roll();if(o.hd)return;o.hp+=n;
  if(o.hp>=h.goal){o.hd=1;var r={st:[3,h.i]};if(h.id==='mama'){var M=Wc().mama;r.hb=M.hb;r.sp=M.sp;}var g=give(r,'hol');st(h.id==='mama'?'mama':'stamp',{h:h.id});
    toastW((h.id==='mama'?'💐 Открытка маме готова! ':'🎁 Праздничная марка! ')+g);}sv();}
/* ---------- олимпиада: финал выходных ---------- */
function finalEnd(id,tier){var c=cur();if(!c.ev||c.ev.k!=='O'||!c.w5||id!==finId())return;var o=roll();if(tier<=o.f)return;var was=o.f;o.f=tier;
  if(tier>=2&&was<2){var F=Wc().final,g=give({hb:F.hb,sp:F.sp,st:[2,4]},'final');toastW('🥇 Финал олимпиады: '+(tier>=3?'золото!':'серебро!')+' '+g);}
  st('final',{id:id,t:tier});sv();}
/* ---------- ловля событий игры ---------- */
var LETW={};function wordIn(w){var c=cur(),o=K();if(!o||!w)return;w=norm(w);
  if(c.ev&&c.ev.k==='L'&&w.indexOf(c.ev.p)>=0)evAdd(1);
  else if(c.ev&&c.ev.k==='T'&&thSet(c.ev.p)[w])evAdd(1);
  if(c.h&&c.h.u==='mama'&&mamaSet()[w])holAdd('mama',1);}
var THC={};function thSet(id){if(THC[id])return THC[id];var m={};((TH[id]||{}).w||'').split(' ').forEach(function(x){if(x)m[x]=1;});return (THC[id]=m);}
var MMC=null;function mamaSet(){if(MMC)return MMC;MMC={};MAMAW.split(' ').forEach(function(x){if(x)MMC[x]=1;});return MMC;}
function onWord(w,bonus){if(!ANY)return;ZB.safe('wk-word',function(){roll();wordIn(w);subAdd(bonus?2:1);if(bonus)planAdd(1,1);});}
function wrap(name,fn){var f=window[name];if(typeof f!=='function'||f.__zk)return;var w=fn(f);w.__zk=1;for(var k in f)if(!(k in w))try{w[k]=f[k];}catch(e){}window[name]=w;}
function hookGame(){
  wrap('foundWord',function(f){return function(wd,byHint){var r=f.apply(this,arguments);if(!byHint&&wd&&wd.w)onWord(wd.w,false);return r;};});
  wrap('submit',function(f){return function(w){var g=typeof G!=='undefined'?G:null,b0=g&&g.bonus?g.bonus.size:0;var r=f.apply(this,arguments);
    if(g&&g===G&&g.bonus&&g.bonus.size>b0)onWord(w,true);return r;};});}
ZB.levelHook.push(function(i){if(!i||!i.ok||i.end!=='win'||!ANY)return;ZB.safe('wk-lvl',function(){var c=cur();roll();planAdd(0,1);planAdd(4,c.d);
  if(c.ev&&c.ev.k==='O'&&!i.hinted)evAdd(1);holAdd('win',1);});});
ZB.on('five',function(){ZB.safe('wk-five',function(){roll();planAdd(2,1);tabFive();});});
ZB.on('calday',function(){ZB.safe('wk-day',function(){planAdd(4,cur().d);});});
ZB.on('zmg',function(d){if(!d||d.a!=='end'||d.mode==='cab'||d.mode==='node')return;ZB.safe('wk-mg',function(){roll();planAdd(3,1);var c=cur();
  if(c.ev&&c.ev.k==='G'&&(d.tier|0)>=1)evAdd(d.id===starId()?2:1);if(d.mode==='week')finalEnd(d.id,d.tier|0);});});
/* ---------- ZAP: записки буквы недели и праздников (шаблоны с need — ZAP сам берёт, когда window[need] истинно) ---------- */
function zapFlags(){var c=cur();window.ZB2WK_LET=WZ&&c.ev&&c.ev.k==='L'?c.ev.p:'';var h=c.hol==='hw'||(c.h&&c.h.id==='hw')?'hw':c.h&&c.h.id==='mama'&&MAMA?'mama':c.hol==='ny'||(c.h&&(c.h.id==='elka'||c.h.id==='ny'))?'ny':'';
  window.ZB2WK_HW=WZ&&h==='hw'?1:0;window.ZB2WK_MAMA=WZ&&h==='mama'?1:0;window.ZB2WK_NY=WZ&&h==='ny'?1:0;}
function zapData(){var D=window.ZB2ZAP_DATA;if(!WZ||!D||!D.T||D.T.wk_let)return !!(D&&D.T&&D.T.wk_let);var W=['слово','слова','слов'],LV=['уровень','уровня','уровней'];
  function T(id,o){o.gr='k';o.from=o.from||0;D.T[id]=o;}
  T('wk_let',{k:'w_has',wt:2.5,b:[1,2],mx:[2,4],who:'zina',u:W,need:'ZB2WK_LET',xf:function(){return window.ZB2WK_LET||'';},t:'Буква недели! Найди {n} {u} с буквой {X}',t1:'Буква недели! Найди слово с буквой {X}',
    j:['На этой неделе буква {X}. Про соседа с пятого этажа на {X} — молчу.','Собираю слова с {X} для стенгазеты. Толик обещал не рисовать.','Дядя Коля за слова с {X} обещал марку. Он слово держит.']});
  T('hw_t',{k:'w_has',wt:2,b:[1,2],mx:[3,5],who:'yat',u:W,need:'ZB2WK_HW',xf:function(){return 'т';},t:'Ять ловит тыквы: найди {n} {u} с буквой {X}',
    j:['Тыквы разбежались по лагерю. Я их выслеживаю. По буквам.','Страшилки страшилками, а тыквенная каша по расписанию.']});
  T('hw_l',{k:'l_win',wt:1.5,b:[0,2],mx:[0,3],who:'valerka',u:LV,need:'ZB2WK_HW',t:'Пройди {n} {u} до отбоя — в лагере страшилки',t1:'Пройди уровень до отбоя — в лагере страшилки',
    j:['Вожатая сказала: кто пройдёт, тому не страшно. Проверим?']});
  T('mm_m',{k:'w_has',wt:3,b:[1,2],mx:[3,5],who:'zina',u:W,need:'ZB2WK_MAMA',xf:function(){return 'м';},t:'Мамин день! Найди {n} {u} с буквой {X} для открытки',
    j:['Мама — главное слово на «М». Остальные — для рамочки.','Внук открытку подписывает, а слов не хватает. Помоги!']});
  T('mm_l',{k:'l_win',wt:2,b:[0,2],mx:[0,3],who:'galya',u:LV,need:'ZB2WK_MAMA',t:'Пройди {n} {u} — мама будет гордиться',t1:'Пройди уровень — мама будет гордиться',
    j:['Моя мама в 90 лет кроссворды решает быстрее меня. Догоняю!']});
  T('ny_l',{k:'w_has',wt:2,b:[1,2],mx:[3,5],who:'tolik',u:W,need:'ZB2WK_NY',xf:function(){return 'л';},t:'На ёлку гирлянду: найди {n} {u} с буквой {X}',
    j:['Гирлянда из слов не перегорает. Проверено.','Ёлку нарядили, а Ять уже примеряется к шарикам.']});
  T('ny_w',{k:'l_win',wt:1.5,b:[0,2],mx:[0,3],who:'valya',u:LV,need:'ZB2WK_NY',t:'Пройди {n} {u}, пока оливье не съели',t1:'Пройди уровень, пока оливье не съели',
    j:['Оливье — тазик. Время пошло.']});
  return true;}
/* ---------- вид ---------- */
var cssP=null;function css(){if(cssP||document.getElementById('zk-css'))return;cssP=1;var l=document.createElement('link');l.id='zk-css';l.rel='stylesheet';l.href='css/zb2-week.css';document.head.appendChild(l);}
function bar(a,b){var p=Math.max(0,Math.min(100,Math.round(a*100/Math.max(1,b))));return '<span class="zk-bar"><i style="width:'+p+'%"></i></span>';}
function evLine(c,o){var S3=steps(c.ev),i=Math.min(2,cnt(o.es)),g=S3[i];return cnt(o.es)>=3?'все 3 ступени ✓':Math.min(o.e,g)+' / '+g+' '+evUnit(c.ev,g);}
function isNew(){var o=K(),c=cur();return !!(o&&EV&&c.ev&&o.n!==c.w);}
// карточка на Доме (zone 'after'): событие + субботник + план — одной строкой каждое
function card(){if(!ANY||lv()<(Wc().from||5))return '';var o=roll(),c=cur(),a=[];if(!o)return '';css();
  if(c.ev)a.push('<p><b>'+evIc(c.ev)+' '+esc(evName(c.ev))+'</b><small>'+evLine(c,o)+'</small></p>');
  else if(c.hol)a.push('<p><b>'+(c.hol==='hw'?'🎃 Неделя страшилок':'🎄 Новогодние недели')+'</b><small>'+(KL?'праздничные марки в кляссере':'праздник во дворе')+'</small></p>');
  if(c.sub)a.push('<p><b>🧹 Субботник</b><small>'+(o.ss?'сделан ✓':Math.min(o.s,Wc().subb.goal)+' / '+Wc().subb.goal+' «мусора»')+'</small></p>');
  if(PLAN)a.push('<p><b>📗 План на неделю</b><small>'+cnt(o.pg%32)+' из 5'+(has(o.pg,5)?' ✓':'')+'</small></p>');
  if(!a.length)return '';
  return '<button type="button" class="zk-card'+(isNew()?' zk-new':'')+'"'+(isNew()?' data-zk-tag="новое"':'')+'><span class="zk-ch">📅 Неделя у Зины</span>'+a.join('')+'</button>';}
function mamaTop(){var c=cur();if(!MAMA||!c.h||c.h.id!=='mama'||lv()<(Wc().from||5))return '';var o=roll();css();
  if(HFIT())return '<button type="button" class="zn-chip zk-mchip" data-zn-tag="💐"><i>💐</i><b>Маме</b><small>'+(o.hd?'готово ✓':Math.min(o.hp,c.h.goal)+' / '+c.h.goal)+' слов</small></button>';   /* zb2-MERGE: Дом ужат — плашкой в chips, верх не растёт */
  return '<button type="button" class="zk-top">💐 День матери: открытка маме — '+(o.hd?'готова ✓':'найди тёплые слова ('+Math.min(o.hp,c.h.goal)+' / '+c.h.goal+')')+'</button>';}
function HFIT(){try{return !!(window.ZB2&&ZB2._reg.homefit&&!ZB2.off('homefit'));}catch(e){return false;}}   /* zb2-MERGE */
/* ---------- экран «Неделя у Зины» ---------- */
var TAB0='week';
function scr(el,op){css();var o=roll(),c=cur(),tab=(op&&op.tab)||TAB0;TAB0=tab;if(o&&c.ev&&o.n!==c.w){o.n=c.w;sv();}
  var tabs=[['week','📅 Неделя'],TAB?['tabel','📒 Табель']:null,KL?['klas','🏷 Кляссер']:null].filter(Boolean);
  var h='<div class="zk-scr"><div class="zk-hd"><button class="btn ghost small" data-zk="back">‹ Дом</button><h2>Неделя у Зины</h2></div>'+
    '<div class="zk-tabs">'+tabs.map(function(t){return '<button class="zk-tab'+(t[0]===tab?' on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div><div class="scroll zk-body">';
  h+=tab==='tabel'?tabHtml(o,c):tab==='klas'?klasHtml(o):weekHtml(o,c);
  el.innerHTML=h+'</div></div>';
  var b=el.querySelector('[data-zk="back"]');if(b)b.onclick=function(){snd();ZB.go('home');};
  [].forEach.call(el.querySelectorAll('.zk-tab'),function(x){x.onclick=function(){snd();scr(el,{tab:x.getAttribute('data-tab')});};});
  var f=el.querySelector('[data-zk="final"]');if(f)f.onclick=function(){snd();var id=finId();if(id&&window.ZMG)ZMG.open(id,{mode:'week',back:function(){ZB.go('week');}});};
  var p=el.querySelector('[data-zk="play"]');if(p)p.onclick=function(){snd();try{startLevel(Math.min(S.lv,LEVELS.length-1));}catch(e){}};}
function weekHtml(o,c){var h='',W=Wc();
  if(c.ev){var S3=steps(c.ev),R=W.step;h+='<div class="zk-box"><h3>'+evIc(c.ev)+' '+esc(evName(c.ev))+'</h3><p class="zk-rule">'+esc(evRule(c.ev))+'</p>'+bar(o.e,S3[2])+
    '<ol class="zk-steps">'+S3.map(function(g,i){var r=R[i]||{},t=[];if(r.hb)t.push('💡 +'+r.hb);if(r.c)t.push('+'+r.c+' '+coinI());if(r.st&&KL)t.push('🏷 марка');if(r.sp)t.push('⭐ +'+r.sp);
      return '<li class="'+(has(o.es,i)?'ok':'')+'"><b>'+g+'</b> '+evUnit(c.ev,g)+'<span>'+t.join(' · ')+'</span></li>';}).join('')+'</ol>';
    if(c.ev.k==='O'){var id=finId(),nm='';try{nm=id?ZMG.info(id).t:'';}catch(e){}
      h+=id?'<p class="zk-fin">🥇 Финал выходных — «'+esc(nm)+'»: серебро или золото → марка «Финал олимпиады» и 💡.'+(o.f?' Твой лучший: '+['—','бронза','серебро','золото'][o.f]+'.':'')+'</p>'+
        (c.w5?'<button class="btn green" data-zk="final">▶ Финал олимпиады</button>':'<p class="zk-note">Финал откроется в субботу.</p>'):'';}
    h+='</div>';}
  else if(c.hol)h+='<div class="zk-box"><h3>'+(c.hol==='hw'?'🎃 Неделя страшилок':'🎄 Новогодние недели')+'</h3><p class="zk-rule">В праздник событие недели отдыхает — у Зины праздничные уровни'+(KL?', а у дяди Коли — редкие марки':'')+'.</p></div>';
  if(c.h&&(KL||c.h.id==='mama')){var hh=c.h,SS=SER[3].st[hh.i];h+='<div class="zk-box zk-hol"><h3>'+SS[0]+' '+(hh.id==='mama'?'День матери: открытка маме':'Праздничная марка «'+SS[1]+'»')+'</h3><p class="zk-rule">'+
    (hh.u==='mama'?'Найди тёплые слова: мама, пирог, чай, шарф, сказка… — в уровнях или бонусные.':'Пройди '+hh.goal+' '+pl(hh.goal,'уровень','уровня','уровней')+' в праздник.')+'</p>'+bar(o.hp,hh.goal)+'<p class="zk-note">'+(o.hd?'Готово ✓':Math.min(o.hp,hh.goal)+' / '+hh.goal)+'</p></div>';}
  if(SUB){var G=W.subb;h+='<div class="zk-box"><h3>🧹 Субботник</h3><p class="zk-rule">По субботам и воскресеньям — генеральная уборка у бабы Зины: каждое слово — горсть мусора, бонусное — две. Под диваном слова с 1987 года!</p>'+
    (c.sub?bar(o.s,G.goal)+'<p class="zk-note">'+(o.ss?'Сделано ✓ сундук выходного получен':Math.min(o.s,G.goal)+' / '+G.goal+' — сундук: +'+G.c+' '+coinI()+', 💡'+(KL?', марка «Коты нашего двора»':''))+'</p>':
      '<p class="zk-note">'+(NOSUB[c.mk]?'На этой неделе субботника нет — праздник.':'Ждём в субботу.')+'</p>')+'</div>';}
  if(PLAN){var P=W.plan,GG=planGoals();h+='<div class="zk-box"><h3>📗 План на неделю</h3><p class="zk-rule">Пять больших дел до воскресенья. Всё сделал — «четвертная пятёрка»: +'+P.c+' '+coinI()+', 💡 +'+P.hb+(KL?', марка «Овощи-отличники»':'')+'.</p><ul class="zk-plan">'+
    GG.map(function(g,i){var v=Math.min(planVal(o,i),g.g);return '<li class="'+(has(o.pg,i)?'ok':'')+'"><i>'+g.ic+'</i><span>'+g.t+'</span><b>'+v+' / '+g.g+'</b></li>';}).join('')+'</ul>'+
    (has(o.pg,5)?'<p class="zk-note">Четвертная пятёрка получена ✓</p>':'')+'</div>';}
  if(o.lw&&c.d===0)h+='<p class="zk-note">Прошлая неделя: ступеней события — '+o.lt+(o.ls?', субботник ✓':'')+'.</p>';
  h+='<button class="btn green zk-go" data-zk="play">▶ Играть</button>';return h;}
function tabHtml(o,c){var W=Wc().tab,T=c.T,y=Math.floor(T/10000),m=Math.floor(T/100)%100,days=new Date(y,m,0).getDate(),n=cnt(o.md),
    MN=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'][m-1],first=dow(dn(y*10000+m*100+1)),h='';
  h+='<div class="zk-box"><h3>📒 Табель за '+MN+'</h3><p class="zk-rule">Каждая пятёрка в дневнике (3 дела дня из 5) — отметка в табеле. '+W.good+' пятёрок — «хорошо», '+W.best+' — Похвальный лист'+(KL?' и марка':'')+'.</p><div class="zk-cal">';
  ['пн','вт','ср','чт','пт','сб','вс'].forEach(function(d){h+='<i class="zk-dn">'+d+'</i>';});for(var i=0;i<first;i++)h+='<i></i>';
  for(var d=1;d<=days;d++)h+='<i class="'+(has(o.md,d-1)?'five':'')+(d===T%100?' today':'')+'">'+(has(o.md,d-1)?'5':d)+'</i>';
  h+='</div>'+bar(n,W.best)+'<ul class="zk-plan"><li class="'+(has(o.mg,0)?'ok':'')+'"><i>👍</i><span>«Хорошо» — 💡 +'+W.hbG+'</span><b>'+Math.min(n,W.good)+' / '+W.good+'</b></li>'+
    '<li class="'+(has(o.mg,1)?'ok':'')+'"><i>📜</i><span>Похвальный лист — 💡 +'+W.hbB+'</span><b>'+Math.min(n,W.best)+' / '+W.best+'</b></li></ul></div>';return h;}
function klasHtml(o){var h='<p class="zk-rule zk-kl">Дядя Коля, хранитель школьного музея, собирает марки. За события недели, субботники, план и праздники — марка в кляссер. Шесть марок серии — подарок.</p>';
  SER.forEach(function(x,i){var n=cnt(o.k[i]),got=has(o.r,i);h+='<div class="zk-box"><h3>'+esc(x.t)+' <small>'+n+' / 6</small></h3><p class="zk-src">'+esc(x.src)+' · 6 марок → '+(x.pr.k==='o'?'наряд':'блюдце')+' «'+esc(x.pr.n)+'»'+(got?' ✓':'')+'</p><div class="zk-kls">';
    x.st.forEach(function(s,j){var on=has(o.k[i],j),miss=x.rare&&!on&&passed(j);
      h+='<div class="zk-st'+(on?' on':'')+(miss?' miss':'')+'"><b>'+(on?s[0]:miss?'·':'?')+'</b><span>'+(on||x.rare?esc(s[1]):'')+'</span>'+(x.rare&&!on?'<small>'+(miss?'выдавали '+s[2]:s[2])+'</small>':'')+'</div>';});
    h+='</div></div>';});
  if(o.x)h+='<p class="zk-note">Дубли марок дядя Коля обменял на ⭐ очки четверти: '+o.x+'.</p>';return h;}
function passed(j){var H=HOL[j];return H&&tk()>H.b;}
/* ---------- регистрация ---------- */
function init(){if(!ANY)return;roll();addItems();hookShop();ZB.safe('wk-hook',hookGame);zapFlags();zapData();
  ZB.screen('week',{title:'Неделя у Зины',render:function(el,op){ZB.safe('wk-scr',function(){scr(el,op);});}});
  ZB.add(ZB.homeSlots,{id:'zk-week',order:25,zone:'after',render:card,mount:function(el){var b=el.querySelector('.zk-card');if(b)b.onclick=function(){snd();ZB.go('week');};}});
  ZB.add(ZB.homeSlots,{id:'zk-mama',order:HFIT()?25:8,zone:HFIT()?'chips':'top',render:mamaTop,mount:function(el){var b=el.querySelector('.zk-top,.zk-mchip');if(b)b.onclick=function(){snd();ZB.go('week');};}});
  // строка в окне календаря и «Завтра у Зины»
  if(window.ZB2CAL&&ZB2CAL.add)ZB2CAL.add({id:'zk-cal',order:40,html:calLine});
  try{if(window.ZBNB){ZBNB.tmrItems=ZBNB.tmrItems||[];if(!ZBNB.tmrItems.some(function(x){return x.id==='zk-tmr';}))ZBNB.tmrItems.push({id:'zk-tmr',order:30,t:tmrLine});}}catch(e){}
  // ZAP: данные шаблонов приходят лениво — подождать
  if(WZ&&!zapData()){var k=0,iv=setInterval(function(){if(zapData()||++k>40)clearInterval(iv);},500);}
  ZB.on('home',function(){ZB.safe('wk-home',function(){roll();zapFlags();});});
  try{ZB.refresh();}catch(e){}}
function calLine(){if(lv()<(Wc().from||5))return '';var c=cur(),o=roll(),a=[];
  if(c.h&&c.h.id==='mama'&&MAMA)a.push('💐 День матери: открытка маме — найди тёплые слова'+(o.hd?' ✓':''));
  if(c.ev&&c.d===0&&o.n!==c.w)a.push(evIc(c.ev)+' Новое на неделе: '+esc(evName(c.ev)));
  else if(c.sub&&!o.ss)a.push('🧹 Сегодня субботник: '+Math.min(o.s,Wc().subb.goal)+' / '+Wc().subb.goal);
  if(!a.length)return '';return '<p class="zk-cl" onclick="hideModal&&hideModal();ZB.go(\'week\')">'+a.join('<br>')+'</p>';}
function tmrLine(){if(lv()<(Wc().from||5))return '';var t=cur(dayKeyAdd(1));
  if(t.h&&t.h.id==='mama'&&t.T===t.h.a&&MAMA)return '💐 завтра День матери — открытка маме';
  if(t.d===0&&t.ev)return evIc(t.ev)+' завтра новое: '+esc(evName(t.ev));
  if(t.d===5&&t.sub)return '🧹 завтра субботник';return '';}
function dayKeyAdd(k){return key(dn(tk())+k);}
window.ZB2WK={on:ANY,cur:cur,sched:sched,roll:roll,K:K,open:function(tab){ZB.go('week',{tab:tab});},st:stamp,SER:SER,evAdd:evAdd,subAdd:subAdd,planAdd:planAdd,
  tabFive:tabFive,holAdd:holAdd,finalEnd:finalEnd,onWord:onWord,steps:steps,card:card,calLine:calLine,tmrLine:tmrLine,zapFlags:zapFlags};
ZB.safe('wk-init',init);
})();
