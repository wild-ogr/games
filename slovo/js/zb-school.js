'use strict';
/* ================= zb-school — «Школа бабы Зины»: классы 1–11 → Выпускной → Академия ★N, пятёрки, контрольные, звания, открытки классов =================
   Поток SCHOOL (ветка zb-school, журнал hobby-analytics/release-i/zina-boost/logs/SCHOOL.md). Выключить всё: CFG.on=false (игра — как раньше).
   ДОГОВОР ZBS (для всех потоков):
   ZBS.cls()        → номер класса: 1–11 — класс, 12 — выпускник (аттестат), 13+ — Академия ★(n−12). Никогда не уменьшается.
   ZBS.info()       → {c, name (звание), short («5 класс» / «Выпускник» / «Академия ★2»), next:{c, l, f, lLeft, fLeft, ctl}|null, frac}
   ZBS.five()       → {all (пятёрок всего), today (0|1 — сегодня получена), week:[7 × 0|1 пн–вс]}
   ZBS.giveFive(why)→ поставить «5» за сегодня (зовёт zb-today.js за 3 дела из 5; второй раз за день — false)
   ZBS.atLevel(l)   → класс, к которому «относится» уровень l (1-based) по одним уровням — для подписи глав (LVL ZBCH.cls)
   ZBS.ctl(n)       → контрольная за класс n: {n, l (уровень 1-based), done, mark 5|4|0}; ZBS.ctlAt(l) → n|0 (этот уровень — контрольная?)
   ZBS.cards()      → открытки классов [{n, t, got, day}] (школьный музей CAB)
   СОБЫТИЯ: ZB.emit('five', {all, day}) — новая пятёрка; ZB.emit('class', n) — новый класс (12 — выпускной, 13+ — ступень Академии);
            ZB.emit('ctl', {n, mark}) — сдана контрольная.
   Переход в класс n+1: пройден уровень-контрольная CFG.need[n+1].l И пятёрок ≥ CFG.need[n+1].f. Тормоз для ядра — пятёрки (1 в день).
   Поля сохранения: S.sc {v, c (класс — максимум), f (пятёрок), fd (день последней), h [дни с пятёркой, 60 последних], cd {класс: день},
                    k {класс: оценка контрольной}, nw [новости для окна победы/главного]}. Слияние — максимум/объединение.
   Числа — CFG ниже (модель темпа: hobby-analytics/release-i/zina-boost/SCHOOL-tools/pace.py). Награды монетами — ZBECO (ECO), здесь — запасные. */
(function(){
var CFG={on:true,
  // need[n] — что нужно, чтобы стать n-классником: l — пройти уровень-контрольную l (1-based), f — пятёрок в дневнике
  // контрольные — последние уровни глав (кратны 20): класс k начинается с главы [1,2,3,4,5,6,7,9,11,12,13][k-1] (ZBCH.setCls у LVL), выпускной — конец 14-й главы
  need:[null,{l:0,f:0},{l:20,f:1},{l:40,f:3},{l:60,f:6},{l:80,f:10},{l:100,f:15},{l:120,f:20},{l:160,f:26},{l:200,f:33},{l:220,f:41},{l:240,f:49},{l:280,f:56}],
  star:8,          // после выпускного — ступень Академии каждые 8 пятёрок
  clsCoins:[0,0,30,40,50,60,70,80,90,100,110,120,300], // монеты за переход в класс (запасные; ZBECO.school.cls главнее)
  starCoins:150};
var NAMES=['','Первоклашка с бантами','Знаток букваря','Хорошист','Гроза диктантов','Староста класса','Звеньевой','Редактор стенгазеты',
  'Председатель совета дружины','Круглый отличник','Гордость школы','Без пяти минут медалист','Выпускник с золотой медалью'];
var ACAD=['Студент','Аспирант','Кандидат наук','Доктор наук','Академик'];
// открытки классов (в школьный музей): что на открытке
var CARD=['','Первое сентября: банты и гладиолусы','Букварь прочитан от корки до корки','Табель без троек','Диктант без единой ошибки',
  'Значок старосты','Сбор макулатуры: 40 кг','Стенгазета «Колючка»','Слёт отличников','Похвальная грамота','Фото у школьной доски',
  'Последний звонок','Выпускной бал: аттестат с отличием'];
// реплики Зины при переходе
var SAY=['','',
  'Второй класс! Помню, в твоём возрасте я уже Пушкина наизусть читала. Ну, первую строчку.',
  'Третий класс — это уже серьёзно. Портфель тяжелее, а двоек — меньше. Надеюсь.',
  'Четвёртый! Скоро в среднюю школу. Там учителя строгие, но я — строже всех.',
  'Пятый класс! Валентина Петровна сказала: «Толк будет». А она зря не хвалит, сорок лет завучем.',
  'Шестой! Кот Ять тобой гордится. Он, правда, молчит, но по усам видно.',
  'Седьмой класс. Самое время влюбиться в учительницу русского. Шучу. Учи слова.',
  'Восьмой! Толик говорит, в его время в восьмом уже на мопеде гоняли. А ты — слова! Это лучше.',
  'Девятый класс — экзамены на носу. Нос держи по ветру, а глаза — в кроссворде.',
  'Десятый! Старшеклассник! Первоклашки на тебя смотрят снизу вверх. Буквально.',
  'Одиннадцатый! Последний класс. Дальше — выпускной, вальс и аттестат. Готовь костюм!',
  'ВЫПУСКНОЙ! Аттестат с отличием! Тётя Валя плачет, дядя Коля фотографирует, кот спит на аттестате.'];
var C=window.ZBS_CFG=CFG;
if(window.ZB_OFF&&ZB_OFF.school)CFG.on=false; // общий выключатель школы: window.ZB_OFF={school:1} до загрузки
if(!CFG.on||typeof ZB==='undefined')return;
function E(){var z=window.ZBECO;return z&&(z.school||z.sc)||{};}
function give(src,n,why){n=Math.floor(+n||0);if(n<=0)return 0;try{if(window.ZBECO&&typeof ZBECO.give==='function')return ZBECO.give(src,n,why);}catch(e){}try{addCoins(n,why||'quest');}catch(e){}return n;}

function num(x){x=+x;return isFinite(x)&&x>0?x:0;}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function dk(){try{return todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function lvDone(){try{return num(S.lv);}catch(e){return 0;}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ---------- сохранение ---------- */
function fix(s){s=s||S;var c=isO(s.sc)?s.sc:(s.sc={});c.v=1;c.c=Math.max(1,Math.floor(num(c.c))||1);c.f=Math.floor(num(c.f));c.fd=num(c.fd);
  if(!Array.isArray(c.h))c.h=[];c.h=c.h.filter(function(x){return num(x)>0;}).slice(-60);
  if(!isO(c.cd))c.cd={};if(!isO(c.k))c.k={};if(!Array.isArray(c.nw))c.nw=[];c.nw=c.nw.slice(-6);}
function merge(s,d){fix(s);if(!d||!isO(d.sc))return;var a=s.sc,b=d.sc;
  a.c=Math.max(a.c,Math.floor(num(b.c)));a.f=Math.max(a.f,Math.floor(num(b.f)));a.fd=Math.max(a.fd,num(b.fd));
  if(Array.isArray(b.h))b.h.forEach(function(x){x=num(x);if(x&&a.h.indexOf(x)<0)a.h.push(x);});a.h.sort(function(x,y){return x-y;});a.h=a.h.slice(-60);
  // пятёрок не меньше, чем дней в истории (два устройства в разные дни)
  if(isO(b.cd))for(var k in b.cd){var v=num(b.cd[k]);if(v&&(!a.cd[k]||v<a.cd[k]))a.cd[k]=v;}
  if(isO(b.k))for(var j in b.k)a.k[j]=Math.max(num(a.k[j]),num(b.k[j]));}
ZB.onSave({id:'school',keys:['sc'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});
function st(){if(!isO(S.sc))fix();return S.sc;}

/* ---------- класс ---------- */
function need(n){return CFG.need[n]||null;}
// какой класс положен сейчас по уровням и пятёркам (без выпускного/Академии — до 12)
function calc(){var c=st(),n=1,L=lvDone();
  for(var i=2;i<CFG.need.length;i++){var x=need(i);if(L>=x.l&&c.f>=x.f)n=i;else break;}
  if(n>=12)n=12+Math.floor(Math.max(0,c.f-CFG.need[12].f)/CFG.star);
  return n;}
function cls(){var c=st();return Math.max(c.c,1);}
// уровень l «внутри» класса n: после контрольной за (n−1) класс и до следующей контрольной включительно
function atLevel(l){var n=1;for(var j=2;j<CFG.need.length;j++)if(l>need(j).l)n=j;return n;}
function short(n){if(n<=11)return n+' класс';if(n===12)return 'Выпускник';return 'Академия ★'+(n-12);}
function title(n){if(n<=12)return NAMES[n];var k=n-13;return k<ACAD.length-1?ACAD[k]:ACAD[ACAD.length-1]+(k>=ACAD.length?' ★'+(k-ACAD.length+2):'');}
function info(){var n=cls(),c=st(),L=lvDone(),nx=null,frac=1;
  if(n<12){var x=need(n+1),p=need(n);nx={c:n+1,l:x.l,f:x.f,lLeft:Math.max(0,x.l-L),fLeft:Math.max(0,x.f-c.f),ctl:ctl(n+1)};
    // доля пути: среднее по уровням и пятёркам
    var fl=x.l>p.l?Math.min(1,Math.max(0,(L-p.l)/(x.l-p.l))):1,ff=x.f>p.f?Math.min(1,Math.max(0,(c.f-p.f)/(x.f-p.f))):1;frac=(fl+ff)/2;}
  else{var base=CFG.need[12].f+(n-12)*CFG.star;nx={c:n+1,l:0,f:base+CFG.star,lLeft:0,fLeft:Math.max(0,base+CFG.star-c.f),ctl:null};frac=Math.min(1,Math.max(0,(c.f-base)/CFG.star));}
  return {c:n,name:title(n),short:short(n),next:nx,frac:frac};}

/* ---------- контрольные: уровень need[n].l — «Контрольная за (n−1) класс» ---------- */
// LVL может назначить свои уровни-боссы (ZBCH.boss по классам) — но только не раньше нашего порога (темп не ломаем)
function ctlLevel(n){var x=need(n);return x?x.l:0;}
function ctl(n){var c=st(),l=ctlLevel(n);return {n:n,l:l,done:lvDone()>=l,mark:num(c.k[n])};}
function ctlAt(l){for(var i=2;i<CFG.need.length;i++)if(need(i).l===l)return i;return 0;}
// открытки классов html-строкой (музей CAB вставляет к себе, без своих окон); рамка — золотая, если Абонемент дал «frame»
function cardsHtml(){var gold=false;try{gold=!!(window.ZBSEA&&ZBSEA.has('frame'));}catch(e){}
  return '<div class="sc-cards">'+cards().map(function(x){return '<div class="sc-card sm'+(x.got?'':' lock')+(gold&&x.got?' gold':'')+'"><small>'+(x.n<12?x.n+' класс':'Выпускной')+'</small><b>'+(x.got?esc(x.t):'???')+'</b>'+(x.got?'<span>«'+esc(title(x.n))+'»</span>':'<span>'+(x.n<12?'перейди в '+x.n+' класс':'сдай выпускной')+'</span>')+'</div>';}).join('')+'</div>';}
function cards(){var c=st(),n=cls(),out=[];for(var i=1;i<=12;i++)out.push({n:i,t:CARD[i],got:n>=i,day:num(c.cd[i])});return out;}

/* ---------- пятёрки ---------- */
function weekDays(k){var d=new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100,12),wd=(d.getDay()+6)%7,out=[];
  for(var i=0;i<7;i++){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-wd+i,12);out.push(x.getFullYear()*10000+(x.getMonth()+1)*100+x.getDate());}return out;}
function five(){var c=st(),t=dk();return {all:c.f,today:c.fd===t?1:0,week:weekDays(t).map(function(k){return c.h.indexOf(k)>=0?1:0;}),days:weekDays(t)};}
function giveFive(why){var c=st(),t=dk();if(c.fd===t)return false;c.fd=t;c.f++;if(c.h.indexOf(t)<0)c.h.push(t);c.h=c.h.slice(-60);
  try{STAT.ev('five',{n:c.f,c:cls(),w:String(why||'').slice(0,8)});}catch(e){}
  ZB.emit('five',{all:c.f,day:t});check('five');try{save();}catch(e){}return true;}

/* ---------- переход в класс ---------- */
var news=[]; // {k:'class'|'ctl'|'star', n, t} — для окна победы и главного (не сохраняются: показали — забыли)
function coinsFor(n){var e=E();if(n>12)return num(e.star)||CFG.starCoins;return (e.cls&&num(e.cls[n]))||CFG.clsCoins[n]||0;}
function check(why){var c=st(),was=c.c,now=calc();if(now<=was)return 0;
  for(var n=was+1;n<=now;n++){c.c=n;if(!c.cd[n])c.cd[n]=dk();var m=coinsFor(n);
    if(m)m=give('cls',m,'quest');
    news.push({k:n>12?'star':'class',n:n,coins:m});
    try{STAT.ev('cls',{c:n,f:c.f,l:lvDone()});}catch(e){}
    ZB.emit('class',n);}
  try{save();}catch(e){}return now-was;}
// итог уровня: контрольная сдана → оценка; новый класс (уровни могли открыть класс, если пятёрки уже есть)
ZB.levelHook.push(function(o){if(!o||!o.ok||o.daily||(o.mode&&o.mode!=='n'))return;var n=ctlAt(o.l);
  if(n){var c=st(),mk=o.hinted?4:5;if(mk>num(c.k[n])){var first=!c.k[n];c.k[n]=mk;news.push({k:'ctl',n:n,mark:mk,first:first});
      try{STAT.ev('ctl',{n:n,m:mk});}catch(e){}ZB.emit('ctl',{n:n,mark:mk});}}
  check('lvl');});
// старт контрольной: Зина предупреждает (одной строкой поверх уровня)
ZB.add(ZB.levelSlots,{id:'sc-ctl',order:5,zone:'top',render:function(o){if(!o||o.daily||(o.mode&&o.mode!=='n'))return '';var n=ctlAt(o.l);if(!n)return '';
  var k=num(st().k[n]);return '<div class="sc-ctlbar">📝 Контрольная за '+(n-1)+' класс'+(k?' · оценка <b class="sc-red">'+k+'</b>'+(k<5?' — исправим на 5 без подсказок?':''):' · сдашь — и в '+(n<12?n+' класс':'выпускной')+'!')+'</div>';}});

/* ---------- окно победы: новый класс, контрольная, ступень Академии (зона goal, раньше дневника) ---------- */
function coin(){try{return COIN_I;}catch(e){return '💰';}}
ZB.add(ZB.winSlots,{id:'sc-cls',order:5,zone:'goal',fit:4,render:function(){var nn=news.splice(0);if(!nn.length)return '';var h='';
  // NEWBIE: «одна новинка за победу» — не наша очередь, отложить до следующей победы
  if(window.ZBNB&&ZBNB.turn&&ZB.safe('nb-cls',function(){return ZBNB.turn(nn.some(function(x){return x.k==='ctl';})&&!nn.some(function(x){return x.k!=='ctl';})?'card':'cls');})===false){[].push.apply(news,nn);return '';}
  nn.forEach(function(x){
    if(x.k==='class')h+='<div class="sc-wcls"><span class="sc-wci">'+(x.n===12?'🎓':'🏫')+'</span><span><b>'+(x.n===12?'Выпускной! Аттестат твой!':'Теперь ты в '+x.n+' классе!')+'</b><small>«'+esc(title(x.n))+'»'+(x.coins?' · +'+x.coins+' '+coin():'')+' · открытка в музей</small></span></div>';
    else if(x.k==='star')h+='<div class="sc-wcls"><span class="sc-wci">⭐</span><span><b>Академия ★'+(x.n-12)+'!</b><small>«'+esc(title(x.n))+'»'+(x.coins?' · +'+x.coins+' '+coin():'')+'</small></span></div>';
    else if(x.k==='ctl')h+='<p class="goal sc-wctl">📝 Контрольная за '+(x.n-1)+' класс — <b class="sc-red">'+x.mark+'</b>'+(x.mark<5?' (с подсказками; без них будет «5»)':'')+
      (cls()<x.n&&info().next?' · '+esc(waitTxt()):'')+'</p>';});
  return h;}});
function waitTxt(){var x=info().next;if(!x)return '';return x.fLeft>0?'до '+(x.c<12?x.c+' класса':'выпускного')+' ещё '+x.fLeft+' '+pl(x.fLeft,'пятёрка','пятёрки','пятёрок')+' в дневник':'';}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}

/* ---------- линейка: праздник нового класса на главном (один раз на класс) ---------- */
function face(m){try{return zinaSVG(m||'happy');}catch(e){return '👵';}}
function ceremony(){var c=st();c.sh=num(c.sh);if(!c.sh){c.sh=c.c;return false;} // первый запуск: прошлое не празднуем
  if(c.c<=c.sh)return false;var n=c.c;c.sh=n;try{save();}catch(e){}
  var grad=n===12,acad=n>12;try{STAT.screen(grad?'grad':'cls');}catch(e){}
  modal('<div class="sc-cer'+(grad?' grad':'')+'"><h2>'+(grad?'🎓 Выпускной бал!':acad?'⭐ Академия ★'+(n-12):'🔔 Линейка: '+n+' класс!')+'</h2>'+
    '<div class="sc-cerz">'+face(grad?'wow':'happy')+'</div>'+
    '<p>'+esc(acad?'Учёный совет единогласно: «'+title(n)+'»! Кот Ять голосовал дважды — засчитали один.':SAY[n]||'')+'</p>'+
    '<div class="sc-card"><small>Открытка в школьный музей</small><b>'+esc(acad?'Диплом «'+title(n)+'»':CARD[n])+'</b><span>Звание: «'+esc(title(n))+'»</span></div>'+
    (grad?'<p class="sc-mut">Дальше — Академия: ступень за каждые '+CFG.star+' пятёрок, без конца.</p>':'')+
    '<div class="btns"><button type="button" class="btn green" id="scCerOk">'+(grad?'Ура!':'В класс!')+'</button><button type="button" class="btn ghost small" id="scCerT">Табель</button></div></div>');
  try{SND.win();}catch(e){}try{if(grad)confetti();}catch(e){}
  $('scCerOk').onclick=function(){hideModal();try{SND.tap();}catch(e){}};
  $('scCerT').onclick=function(){openClass();};return true;}

/* ---------- табель: лестница классов ---------- */
function openClass(){var n=cls(),c=st(),L=lvDone(),h='';try{STAT.screen('class');}catch(e){}
  for(var i=1;i<=12;i++){var x=need(i),k=num(c.k[i]),done=n>i,cur=n===i;
    h+='<div class="sc-st'+(done?' done':'')+(cur?' now':'')+(n<i?' lock':'')+'"><span class="sc-stn">'+(i<12?i:'🎓')+'</span><span class="sc-stb"><b>'+esc(i<12?i+' класс':'Выпускной')+' · «'+esc(title(i))+'»</b>'+
      '<small>'+(i===1?'начало пути':'вход: контрольная (уровень '+x.l+')'+(k?' — оценка '+k:L>=x.l?' — сдана':'')+' и '+x.f+' '+pl(x.f,'пятёрка','пятёрки','пятёрок'))+'</small></span>'+(done||cur&&i===12?'<em>✓</em>':cur?'<em class="sc-here">ты здесь</em>':'')+'</div>';}
  h+='<div class="sc-st'+(n>12?' now':' lock')+'"><span class="sc-stn">⭐</span><span class="sc-stb"><b>Академия ★N · «'+esc(n>12?title(n):ACAD[0])+'»</b><small>ступень за каждые '+CFG.star+' пятёрок после выпускного</small></span>'+(n>12?'<em>★'+(n-12)+'</em>':'')+'</div>';
  var inf=info();
  modal('<div class="sc-tab"><h2>📒 Табель</h2><p class="sc-mut"><b>'+esc(inf.short)+'</b> · «'+esc(inf.name)+'» · пятёрок в дневнике: <b>'+c.f+'</b></p>'+
    '<div class="sc-lad">'+h+'</div><p class="sc-mut">«5» в дневник — за 3 дела из 5 в день.</p>'+
    '<div class="btns"><button type="button" class="btn blue" id="scTabOk">Понятно</button></div></div>');
  $('scTabOk').onclick=function(){hideModal();try{SND.tap();}catch(e){}};
  var cur=document.querySelector('.sc-st.now');if(cur&&cur.scrollIntoView)try{cur.scrollIntoView({block:'center'});}catch(e){}}
// праздник — на главном, после окон «Зина открыла школу»/подарка (они ставятся раньше); не поверх окна, не в уровне
function atHome(fn){ZB.on('home',fn);ZB.on('ready',function(){var m=document.querySelector('.screen.on');if(m&&(m.id==='menu'||m.id==='zb-home'))fn();});}
var cerT=0;atHome(function(){clearTimeout(cerT);cerT=setTimeout(function(){try{if($('modal').classList.contains('on'))return;if(G&&!G.won)return;}catch(e){}ceremony();},900);});
ZB.on('ready',function(){var c=st();if(!num(c.sh))c.sh=c.c;check('ready');
  // главы ↔ классы у LVL (ZBCH): классы начинаются с этих глав, 12-й элемент — Академия
  if(window.ZBCH&&ZBCH.setCls)ZB.safe('setCls',function(){ZBCH.setCls(CHAP);});});
var CHAP=[1,2,3,4,5,6,7,9,11,12,13,15];
// стили школы — своим файлом (index.html — зона VIEW; так не трогаем его вёрстку)
(function(){try{if(document.querySelector('link[href*="zb-school.css"]'))return;var l=document.createElement('link');l.rel='stylesheet';l.href='css/zb-school.css';l.setAttribute('data-zb','1');document.head.appendChild(l);}catch(e){}})();

/* ---------- наружу ---------- */
window.ZBS={CFG:CFG,cls:cls,info:info,five:five,giveFive:giveFive,atLevel:atLevel,ctl:ctl,ctlAt:ctlAt,cards:cards,cardsHtml:cardsHtml,short:short,title:title,
  check:check,news:news,openClass:openClass,ceremony:ceremony,CHAP:CHAP,weekDays:weekDays,calc:calc,fix:function(){fix();},
  prg:function(){var c=st();return {cl:cls(),fv:c.f};}}; // для STAT prg (TECH)
})();
