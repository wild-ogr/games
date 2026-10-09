/* Рыбалка с Петровичем — мини-игры: оболочка «Двор Петровича» (RB:MG0, буст 08.10.2026).
   Журнал: ~/Projects/hobby-analytics/release-i/rybak-boost/logs/MG0.md, план — rybak-boost/00-plan.md §5.
   Грузится ПОСЛЕ основного скрипта index.html (берёт S, save, STAT, SND, showRewarded, TRIP_C…), игры js/mg-<id>.js — после него.

   ОБЩИЙ ДОГОВОР (для потоков MGA–MGD):
   MG_REG({id, n:{ru,en}, icon, kind, run(host,o), open?, ready?, bot?, merge?, fix?})
     id    — один из MG_LIST ниже (таблица открытия и «Дело дня» — здесь, в оболочке);
     icon  — ключ значка MG_IC (или своя строка SVG 24×24 в стиле IG);
     kind  — 'daily' (каждый день, наградных заходов MG_RW[id].day), 'event' (по событию: игра сама говорит ready()), 'delo' (только как «Дело дня» + тренировка);
     open  — доп. условие открытия (необязательно; основное — таблица MG_LIST);
     ready — для 'event'/'daily': ()=>true, если сейчас можно сыграть с наградой (Уха после рыбалки, Верша полна…);
     run(host,o) — рисует ТОЛЬКО внутри host.el (оболочка даёт полноэкранный слой поверх игры).
       o: {calm, seed (зерно дня — одинаково у всех), day (ГГГГММДД), train (тренировка — без наград), R (монет за рыбалку на дальнем месте),
           lvl (номер дальнего открытого места 0..7), delo (заход «Дела дня»), bot ('bad'|'mid'|'good' — авто-игрок: сыграть самому и быстро), lang}
       host: el, w(), h(), canvas() → {c,g,W,H,dpr,fit()} (чёткий холст во весь слой), loop(fn(dt,t)), onResize(fn),
             done({score, tier:0..3, rec?, extra?}) — конец игры → окно итогов оболочки (награда по MG_RW, рекорд, Книга),
             quit() — выйти без итога, ad(kind) → Promise<bool> (ролик за награду; кнопку показывать только если host.adOk()),
             adOk(), snd(name) — звуки игры (SND), L(ru,en), say(text, who) — облачко реплики, art — рисунки (MG_ART: petr, cat, mit, fish…),
             toast(t), coins(n) — монетки летят в счётчик (только вид), rec — лучший счёт игры.
       extra (необязательно): {c: доля Р сверх таблицы, val: «стоимость» своей награды в долях Р (для дневного потолка), line: строка в итогах, give: ()=>void — выдать свою награду}.
     bot(level) — необязательно; mgBot(id) иначе запускает run с o.bot=level.
     fix(st)/merge(a,b) — починка/слияние своего S.mg[id] (по умолчанию: числа — максимум, остальное — из более свежего по полю t).
   Сохранение: S.mg = {v, d (день), p:{id:заходов с наградой сегодня}, dv (доля Р за сегодня), dd:{id,n,ad}, rec:{id:лучший}, cnt:{id:всего}, pt (очки Книги),
     lv (выдан уровень Книги), sk (облик двора), <id>:{…своё}}. Облако — максимум.
   Статистика: STAT.ev('mg',{id,s,t,ad,tr,dl,c,src}); src — откуда вход: yard (Двор), day (мини-игра дня в «Целях»), win (Перекур в итогах рыбалки) — upd0910.
   play(id,{src, back}) — back(): куда вернуться после игры вместо Двора.
   Стенд: ?mg=<id> (сразу игра), ?mg=dvor (двор), &train=1 &calm=1 &bot=good &day=20261012 &save=1 (иначе сохранение не пишется), &all=1 (всё открыто).
   Подключение игры — одна строка в index.html сразу после строки mg-core.js: <script src="js/mg-<id>.js"></script> */
(function(){
'use strict';
var W0=window;
/* ---------- 14 игр: id, место открытия (номер места в PLACES, которое должно быть открыто), сезон ---------- */
// at: -1 — со Двором (3-я рыбалка); 1 Речка, 2 Волга, 3 Селигер, 4 Ладога, 5 Байкал, 6 Амур (места — за монеты, решение владельца 08.10)
var MG_LIST=[
 {id:'baiki', no:1, at:-1, n:['Байки Петровича','Petrovich\'s tales']},
 {id:'nazh',  no:2, at:-1, n:['Наживка дня','Bait of the day']},
 {id:'uha',   no:3, at:2,  n:['Уха у костра','Campfire fish soup']},
 {id:'versha',no:4, at:1,  n:['Верша на раков','Crayfish trap']},
 {id:'chist', no:5, at:2,  n:['Чистка с Васькой','Cleaning with Vaska']},
 {id:'boroda',no:6, at:4,  n:['Распутай «бороду»','Untangle the line']},
 {id:'prik',  no:7, at:3,  n:['Прикормка по рецепту','Groundbait recipe']},
 {id:'rynok', no:8, at:4,  n:['Рыбный рынок','Fish market']},
 {id:'lunka', no:9, at:-1, n:['Лунка','Ice hole'], season:['12-01','02-28']},
 {id:'raki',  no:10,at:5,  n:['Ночные раки','Night crayfish'], fest:1},
 {id:'foto',  no:11,at:1,  n:['Фото с трофеем','Trophy photo']},
 {id:'griby', no:12,at:-1, n:['Грибы','Mushrooms'], season:['09-01','10-31']},
 {id:'domino',no:13,at:6,  n:['Домино во дворе','Yard dominoes']},
 {id:'spor',  no:14,at:3,  n:['Спор с Петровичем','Bet with Petrovich']}
];
var MG_BY={};MG_LIST.forEach(function(m){MG_BY[m.id]=m;});
var DVOR_AT=3; // Двор — после 3-й рыбалки
/* «Дело дня» по дню недели (0 — Вс): Пн Чистка · Вт Прикормка · Ср Ночные раки · Чт Распутай · Пт Домино · Сб/Вс Рынок */
var DELO=['rynok','chist','prik','raki','boroda','domino','rynok'];

/* ---------- НАГРАДЫ: все числа здесь, в долях Р (монет за рыбалку на самом дальнем открытом месте, TRIP_C) ----------
   c — монеты по ступеням 0..3; pt — очки Книги двора по ступеням; rec — доля Р за новый рекорд; day — заходов с наградой в день;
   delo — множитель награды «Дела дня» (второй заход за ролик — ×adK). Дневной потолок всех мини-игр — CAP (1 Р). */
var MG_RW={
 CAP:.5, adK:.5, /*MERGE 08.10: было 1 — подрезка по econ (Камчатка ≤2 дня раньше main)*/ recPt:2, rkVal:.06,
 _:      {c:[0,.1,.2,.3], pt:[1,2,3,4], rec:.05, day:1},
 baiki:  {c:[0,0,0,0], per:.1, full:.3, pt:[1,2,3,5], rec:0, day:1}, // 0,1·Р за верный ответ, 5/5 — ещё 0,3·Р (09-minigames)
 nazh:   {c:[0,0,0,0], pt:[1,2,3,4], day:1},          // награда — наживка (игра сама, extra.val)
 uha:    {c:[0,0,0,0], pt:[1,2,3,4], day:3},          // +10/20/30 % к улову (игра сама)
 versha: {c:[0,0,0,0], pt:[1,2,3,4], day:2},          // раки (игра сама)
 chist:  {c:[0,.15,.3,.45], pt:[1,2,3,4], day:1},
 prik:   {c:[0,.1,.2,.3], pt:[1,2,3,4], day:1},
 raki:   {c:[0,.15,.3,.45], pt:[1,2,3,4], day:1},
 boroda: {c:[0,.1,.2,.3], pt:[1,2,3,4], day:1},
 domino: {c:[0,.15,.3,.45], pt:[1,2,3,4], day:1},
 rynok:  {c:[0,.1,.2,.3], pt:[1,2,3,4], day:1},
 foto:   {c:[0,.05,.1,.15], pt:[1,2,3,4], day:3},
 spor:   {c:[0,0,0,0], pt:[1,2,3,4], day:1},
 griby:  {c:[0,.1,.2,.3], pt:[1,2,3,4], day:1},
 lunka:  {c:[0,.15,.3,.45], pt:[1,2,3,4], day:1}
};
/* Книга двора: уровень «Знатока двора» по очкам (порог уровня n — 10·n(n+1)/2), подарки на 3/6/10/15/20 */
var BOOK_GIFT={3:{dec:'goose',sk:'sun'},6:{dec:'bowl',sk:'lace'},10:{dec:'samovar',sk:'lights'},15:{dec:'glow',sk:'vine'},20:{dec:'gold',sk:'banya'}};
var SKINS={base:['Летний двор','Summer yard'],sun:['Подсолнухи у забора','Sunflowers'],lace:['Резные наличники','Carved windows'],lights:['Фонарики над столом','String lights'],vine:['Беседка с виноградом','Grape arbour'],banya:['Банька с дымком','Bathhouse']};
function lvlPts(n){return 10*n*(n+1)/2;}
function lvlOf(p){var n=0;while(n<30&&p>=lvlPts(n+1))n++;return n;}

/* ---------- утилиты ---------- */
function L2(a){return typeof LANG!=='undefined'&&LANG==='en'&&a[1]?a[1]:a[0];}
function isO(o){return o&&typeof o==='object'&&!Array.isArray(o);}
function today(){return dayKey(0);}
var Q=new URLSearchParams(location.search),STAND=Q.get('mg')||'',STAND0=STAND,FORCE_DAY=+Q.get('day')||0,ALL=Q.get('all')==='1'&&STAND;
function dKey(){return FORCE_DAY||today();}
function wday(k){var d=new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100);return d.getDay();}
function seedOf(k,id){var h=2166136261;var s=k+':'+id;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function R(){try{return TRIP_C[topPlace()]||30;}catch(e){return 30;}}
function mmdd(k){var m=Math.floor(k/100)%100,d=k%100;return (m<10?'0':'')+m+'-'+(d<10?'0':'')+d;}
function inSeason(s,k){var x=mmdd(k);return s[0]<=s[1]?(x>=s[0]&&x<=s[1]):(x>=s[0]||x<=s[1]);}
function festOn(){try{return typeof FEST!=='undefined'&&FEST&&FEST.on&&FEST.on();}catch(e){return false;}}

/* ---------- сохранение S.mg ---------- */
function mgFix(){var m=S.mg;if(!isO(m))m=S.mg={};m.v=1;
  ['p','rec','cnt'].forEach(function(f){if(!isO(m[f]))m[f]={};for(var k in m[f])if(!(typeof m[f][k]==='number'&&isFinite(m[f][k])&&m[f][k]>=0))delete m[f][k];});
  ['dv','pt','lv','d'].forEach(function(f){if(!(typeof m[f]==='number'&&isFinite(m[f])&&m[f]>=0))m[f]=0;});
  if(!isO(m.dd))m.dd={};if(typeof m.sk!=='string'||!SKINS[m.sk])m.sk='base';if(!isO(m.sku))m.sku={base:1};
  for(var id in REG){var g=REG[id];if(g.fix)try{g.fix(m[id]);}catch(e){}}
  return m;}
function mgDay(){var m=S.mg||mgFix(),k=dKey();if(m.d!==k){m.d=k;m.p={};m.dv=0;m.dd={};}return m;}
function mx(a,b){return Math.max(+a||0,+b||0);}
function mgMerge(a,b){if(!isO(b))return a;if(!isO(a))return b;var r={};for(var k in a)r[k]=a[k];
  ['rec','cnt','sku'].forEach(function(f){var x=isO(a[f])?a[f]:{},y=isO(b[f])?b[f]:{},o={};for(var k in x)o[k]=x[k];for(var k2 in y)o[k2]=mx(o[k2],y[k2]);r[f]=o;});
  r.pt=mx(a.pt,b.pt);r.lv=mx(a.lv,b.lv);
  // день: свежий день целиком, тот же — максимум заходов
  if((b.d||0)>(a.d||0)){r.d=b.d;r.p=isO(b.p)?b.p:{};r.dv=+b.dv||0;r.dd=isO(b.dd)?b.dd:{};}
  else if(b.d===a.d){var p={},ap=isO(a.p)?a.p:{},bp=isO(b.p)?b.p:{};for(var k3 in ap)p[k3]=ap[k3];for(var k4 in bp)p[k4]=mx(p[k4],bp[k4]);r.p=p;r.dv=mx(a.dv,b.dv);
    var da=isO(a.dd)?a.dd:{},db=isO(b.dd)?b.dd:{};r.dd={id:da.id||db.id,n:mx(da.n,db.n),ad:mx(da.ad,db.ad)};}
  if(typeof b.sk==='string'&&(b.t||0)>(a.t||0))r.sk=b.sk;r.t=mx(a.t,b.t);
  for(var id in REG){var g=REG[id],x2=a[id],y2=b[id];if(y2==null)continue;
    if(g.merge){try{r[id]=g.merge(x2,y2);}catch(e){}continue;}r[id]=mergeAny(x2,y2);}
  for(var k5 in b)if(!(k5 in r))r[k5]=b[k5]; // игры, которых нет в этой сборке, — не теряем
  return r;}
function mergeAny(a,b){if(!isO(a)||!isO(b))return typeof a==='number'&&typeof b==='number'?Math.max(a,b):(b!=null?b:a);
  var newer=(b.t||0)>(a.t||0),r={};for(var k in a)r[k]=a[k];
  for(var k2 in b){if(typeof b[k2]==='number'&&typeof a[k2]==='number')r[k2]=Math.max(a[k2],b[k2]);else if(!(k2 in a)||newer)r[k2]=b[k2];}return r;}
function mgSave(){var m=S.mg;if(m)m.t=nowMs();try{save();}catch(e){}}

/* ---------- реестр ---------- */
var REG={};
// другие имена тех же игр (MGA: bait, grib) — регистрируем под id таблицы, своё имя — в g.oid
var ALIAS={bait:'nazh',grib:'griby',nraki:'raki'};
function MG_REG(g){if(g&&g.en===false&&typeof LANG!=='undefined'&&LANG==='en')return;/* RB:EN игры только на русском (Байки) — в английской версии скрыты, решение владельца 08.10 */if(g&&ALIAS[g.id]){g.oid=g.id;g.id=ALIAS[g.id];}if(!g||!g.id||!MG_BY[g.id]){try{console.warn('MG_REG: неизвестная игра',g&&g.id);}catch(e){}return;}
  if(!g.kind)g.kind='daily';REG[g.id]=g;if(S.mg)try{if(g.fix)g.fix(S.mg[g.id]);}catch(e){}
  if(STAND&&(STAND===g.id||STAND===g.oid))standGo();}
function dvorOpen(){return ALL||(+S.sessions||0)>=DVOR_AT;}
function isOpen(id){var m=MG_BY[id];if(!m||!REG[id])return false;if(ALL)return true;if(!dvorOpen())return false;
  if(m.season&&!inSeason(m.season,dKey()))return false;
  var ok=m.at<0||!!(S.open&&S.open[m.at])||(m.fest&&festOn());
  if(ok&&REG[id].open)try{ok=!!REG[id].open();}catch(e){ok=false;}return ok;}
function openHint(id){var m=MG_BY[id];if(m.season)return L('Сезонная','Seasonal');if(m.at<0)return L('Откроется после 3-й рыбалки','Opens after 3 trips');
  try{return L('Откроется: ','Opens at: ')+L(PLACES[m.at].n,PLACES[m.at].en);}catch(e){return '';}}
function rw(id){return MG_RW[id]||MG_RW._;}
function playsToday(id){return (mgDay().p[id]||0);}
// игра дня закрыта — ближайшая открытая по расписанию недели; ни одной — «Дела дня» нет
function deloId(){var k=dKey(),w=wday(k);for(var i=0;i<7;i++){var id=DELO[(w+i)%7];if(isOpen(id))return id;}return '';}
// сколько наградных заходов осталось сегодня (без «Дела дня»)
function leftToday(id){var g=REG[id];if(!g||!isOpen(id))return 0;if(g.kind==='delo')return 0;
  if(g.ready){try{if(!g.ready())return 0;}catch(e){return 0;}}return Math.max(0,(rw(id).day||1)-playsToday(id));}
function deloState(){var m=mgDay(),id=deloId();if(!id)return null;if(m.dd.id&&m.dd.id!==id&&m.dd.n)id=m.dd.id;return {id:id,n:m.dd.n||0,ad:m.dd.ad||0};}
// «N дел» на плитке Двора
function todo(){if(!dvorOpen())return 0;var n=0,d=deloState();for(var id in REG)if(leftToday(id)>0&&!(d&&d.id===id))n++;if(d&&!d.n)n++;return n;}

/* ---------- слой игры (host) ---------- */
var CUR=null; // {g, host, o, el, raf, t0, onR, done}
function css(){if(document.getElementById('mgCss'))return;var s=document.createElement('style');s.id='mgCss';s.textContent=MG_CSS;document.head.appendChild(s);}
function mkEl(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function appEl(){return document.getElementById('app')||document.body;}
function play(id,opt){opt=opt||{};var g=REG[id];if(!g)return false;css();if(CUR)closeGame(true);
  var m=mgDay(),k=dKey(),delo=!!opt.delo,train=!!opt.train;
  if(!train&&!delo&&!opt.bot&&leftToday(id)<=0)train=true;
  var lay=mkEl('div','mg-lay');var el=mkEl('div','mg-el');lay.appendChild(el);
  var bar=mkEl('div','mg-bar','<button class="mg-x" type="button" aria-label="'+L('Выйти','Exit')+'">'+ic('close')+'</button>'+(train?'<span class="mg-tag">'+L('Тренировка','Practice')+'</span>':delo?'<span class="mg-tag gold">'+L('Дело дня','Task of the day')+'</span>':''));
  lay.appendChild(bar);appEl().appendChild(lay);pcMark();lay.classList.toggle('pc',pcOn());
  lay.addEventListener('mousedown',function(e){var b=e.target&&e.target.closest&&e.target.closest('button');if(b)e.preventDefault();}); // RB:MGPC кнопка не держит фокус — пробел/Enter не жмут её второй раз
  var C={g:g,id:id,lay:lay,el:el,raf:0,res:[],delo:delo,train:train,adRun:!!opt.adRun,bot:opt.bot||'',noBack:!!opt.noBack,back:opt.back||null,src:opt.src||'yard',over:false,cb:opt.cb,keys:[],keysUp:[],pause:false,t0:Date.now()};CUR=C;
  bar.querySelector('.mg-x').onclick=function(){if(C.bot)return;askQuit(C);};
  var host=mkHost(C);C.host=host;
  var o={calm:calmOn(),seed:seedOf(k,id),day:k,train:train,R:R(),lvl:topPlaceS(),delo:delo,bot:C.bot,lang:typeof LANG!=='undefined'?LANG:'ru',rec:(m.rec[id]||0)};C.o=o;
  try{STAT.screen&&STAT.screen('mg_'+id);if(!C.bot)STAT.ev('mg',{id:id,a:'go',dl:delo?1:0,tr:train?1:0,ad:C.adRun?1:0,src:C.src});}catch(e){} /*MERGE STAT: старт захода*/
  try{g.run(host,o);}catch(e){try{console.error(e);}catch(x){}closeGame(true);toast(L('Игра не запустилась','The game failed to start'));}
  return true;}
function topPlaceS(){try{return topPlace();}catch(e){return 0;}}
function calmOn(){try{return calm()||Q.get('calm')==='1';}catch(e){return Q.get('calm')==='1';}}
function mkHost(C){var rs=[];var H={el:C.el,
  w:function(){return C.el.clientWidth;},h:function(){return C.el.clientHeight;},
  onResize:function(f){rs.push(f);},
  canvas:function(){var c=document.createElement('canvas');c.className='mg-cv';C.el.appendChild(c);var g=c.getContext('2d'),r={c:c,g:g,W:0,H:0,dpr:1};
    r.fit=function(){var dpr=Math.min(2,window.devicePixelRatio||1);try{if(typeof LOW!=='undefined'&&LOW)dpr=Math.min(dpr,1.25);}catch(e){}
      var W=C.el.clientWidth||360,Hh=C.el.clientHeight||640;c.width=Math.round(W*dpr);c.height=Math.round(Hh*dpr);g.setTransform(dpr,0,0,dpr,0,0);r.W=W;r.H=Hh;r.dpr=dpr;};
    r.fit();rs.push(r.fit);return r;},
  loop:function(f){var last=0,t=0;function st(ts){if(C.over)return;var dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;if(isPaused(C))dt=0;t+=dt;try{f(dt,t);}catch(e){try{console.error(e);}catch(x){}}C.raf=requestAnimationFrame(st);}C.raf=requestAnimationFrame(st);},
  done:function(res){if(C.over)return;finishGame(C,res||{});},
  quit:function(){closeGame(true);},
  ad:function(kind){return new Promise(function(ok){if(C.train&&kind!=='free'){ok(false);return;}var pl='mg_'+C.id+(kind?'_'+kind:''); /*MERGE STAT: место ролика — игра и кнопка (x2, more, help, buyer, uha, versha2, hint)*/try{if(adHold(pl)){ok(false);return;}}catch(e){}
    try{STAT.place&&STAT.place(pl);}catch(e){}var got=false;C.adNow=Date.now();ok=(function(f){return function(v){C.adNow=0;C.adEnd=Date.now();f(v);};})(ok);
    try{showRewarded(function(){got=true;ok(true);},function(){if(!got)ok(false);},function(){got=true;ok(true);return L('засчитано','granted');});}catch(e){ok(false);}});},
  adOk:function(){if(C.train||C.bot)return false;try{var k=adOk();if(k)try{STAT.offer('mg_'+C.id);}catch(x){}return k;}catch(e){return false;}}, /*MERGE STAT: показ кнопки ролика в игре — offer mg_<игра> (раз в 20 с)*/
  snd:function(n,a){try{if(SND[n])SND[n](a);}catch(e){}},
  L:function(ru,en){return L(ru,en);},
  say:function(t,who){saySay(C,t,who);},
  toast:function(t){try{toast(t);}catch(e){}},
  coins:function(n,x,y){flyCoins(C,n,x,y);},
  get rec(){return (mgDay().rec[C.id]||0);},
  art:W0.MG_ART,
  /* RB:MGPC управление на ПК и пауза (договор как в Обороне):
     host.paused — пауза (окно «Выйти?»/«Пауза», свёрнуто, реклама): свой цикл rAF — dt=0, таймеры игры не двигать; host.loop делает это сам.
     host.pc — есть мышь (hover + точный указатель): показывать клавиши и «мышиные» тексты.
     host.keys(fn(key,e)) — нажатия, пока игра на экране (не в паузе и не в окнах оболочки); fn вернёт true — клавиша съедена.
       Не съеденные Enter/пробел жмут видимую кнопку игры с атрибутом data-enter. Esc — всегда оболочка («Выйти?»).
     host.keysUp(fn(key,e)) — отпускание (для «держи пробел»). host.kbd(html,сек) — плашка-подсказка клавиш снизу (только на ПК, первые секунды).
     MG.kc('1') — значок клавиши для кнопок DOM (виден только на ПК), MG.keycap(g,x,y,'1',px) — значок клавиши на холсте. */
  get paused(){return isPaused(C);},
  get pc(){return pcOn();},
  keys:function(f){C.keys.push(f);},
  keysUp:function(f){C.keysUp.push(f);},
  kbd:function(html,sec,pos){kbdHint(C,html,sec,pos);},
  // звуки природы: сцена игры по умолчанию — AMB_SC; игра с нарисованным временем суток зовёт host.amb('water','night') (сцены: yard water shore fire night forest market ice)
  amb:function(sc,td){C.amb={sc:sc||'',td:td||''};}};
  C.rs=rs;return H;}
function onWinResize(){if(!CUR)return;for(var i=0;i<(CUR.rs||[]).length;i++)try{CUR.rs[i]();}catch(e){}}
window.addEventListener('resize',function(){clearTimeout(onWinResize._t);onWinResize._t=setTimeout(onWinResize,60);});
function closeGame(silent){var C=CUR;if(!C)return;C.over=true;cancelAnimationFrame(C.raf);if(C.lay&&C.lay.parentNode)C.lay.parentNode.removeChild(C.lay);CUR=null;
  if(C.cb)try{C.cb(C.result||null);}catch(e){}if(!silent&&!C.bot){if(C.back){try{C.back();}catch(e){}}else if(!C.noBack)backToDvor();}} // upd0910: back — куда вернуться (цели дня), иначе Двор
// RB:MGPC окно «Выйти?» = пауза игры (host.paused); why='pause' — свернули/ушёл фокус: «Пауза» и «Продолжить»
function askQuit(C,why){if(C.over||C.lay.querySelector('.mg-ask'))return;var ps=why==='pause';C.pause=true;
  for(var hk in (C.held||{}))for(var ui=C.keysUp.length-1;ui>=0;ui--)try{C.keysUp[ui](hk,{type:'keyup',key:hk,synthetic:1,preventDefault:function(){}});}catch(x){} C.held={}; // зажатое — отпустить
  var d=mkEl('div','mg-ask','<div class="mg-pn"><div class="mg-h">'+(ps?L('Пауза','Paused'):L('Выйти из игры?','Leave the game?'))+'</div><p>'+(ps?L('Игра ждёт тебя.','The game is waiting for you.')+' ':'')+L(C.train?'Тренировка не засчитается.':'Если выйти — заход не потратится, можно сыграть заново.',C.train?'Practice won\'t count.':'If you leave, this run won\'t count.')+'</p><div class="mg-row"><button class="mg-btn" data-a="no">'+(ps?L('Продолжить','Continue'):L('Остаться','Stay'))+kc('Enter')+'</button><button class="mg-btn sec" data-a="yes">'+L('Выйти','Leave')+'</button></div></div>');
  C.lay.appendChild(d);d.onclick=function(e){var a=e.target.closest&&e.target.closest('[data-a]');if(!a)return;try{SND.tap();}catch(x){}d.parentNode.removeChild(d);C.pause=false;if(a.getAttribute('data-a')==='yes'){try{STAT.ev('mg',{id:C.id,q:1,src:C.src||'yard'});}catch(x){}closeGame(false);}};}
function saySay(C,t,who){var b=C.lay.querySelector('.mg-say');if(!b){b=mkEl('div','mg-say');C.lay.appendChild(b);}
  b.innerHTML=(who?'<b>'+who+'</b>':'')+'<span></span>';b.querySelector('span').textContent=t;b.classList.add('on');clearTimeout(b._t);b._t=setTimeout(function(){b.classList.remove('on');},3200);}
function flyCoins(C,n,x,y){if(calmOn())return;var e=C.lay,cw=e.clientWidth,ch=e.clientHeight;x=x==null?cw/2:x;y=y==null?ch/2:y;
  for(var i=0;i<Math.min(8,n||5);i++){var c=mkEl('div','mg-fc',coinSvg());c.style.left=x+'px';c.style.top=y+'px';e.appendChild(c);
    (function(c,i){setTimeout(function(){c.style.transform='translate('+(cw-60-x+(i%3)*6)+'px,'+(18-y)+'px) scale(.6)';c.style.opacity='.2';},30+i*70);setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c);},900+i*70);})(c,i);}
  setTimeout(function(){try{SND.coin();}catch(x){}},500);}
function coinSvg(){try{return LOOK.coin();}catch(e){return '<b>💰</b>';}}
function ic(k){try{if(MG_IC[k])return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+MG_IC[k]+'</svg>';return LOOK.I(k);}catch(e){return '';}}

/* ---------- итог: награда, потолок, рекорд, Книга ---------- */
// своя добыча игр: наживка extra.bait {id:n} (цена пачки/10), раки extra.rk n (MG_RW.rkVal·Р за рака) — в долях Р для дневного потолка
function baitVal(b){var v=0;if(!isO(b))return 0;for(var k in b){var n=+b[k]||0;try{var bb=BAIT[k];if(bb&&bb.pack)v+=n*bb.p/bb.pack;}catch(e){}}return v/R();}
function lootVal(x){return baitVal(x.bait)+(+x.rk||0)*MG_RW.rkVal;}
function calcReward(C,res,noCap){var id=C.id,r=rw(id),Rv=R(),t=Math.max(0,Math.min(3,res.tier|0)),sc=+res.score||0,x=res.extra||{};
  var c=(r.c?r.c[t]:0)||0;if(r.per)c+=r.per*sc;if(r.full&&res.full)c+=r.full;if(x.c)c+=x.c;
  var m=mgDay(),rec=sc>(m.rec[id]||0)&&sc>0;if(rec&&r.rec)c+=r.rec;
  var k=C.delo?(C.adRun?MG_RW.adK:1):1;c*=k;var val=c+(+x.val||0)*k+lootVal(x)*k;
  var room=noCap?1e9:Math.max(0,MG_RW.CAP-(m.dv||0)),capped=false;if(val>room){capped=true;var f=val>0?room/val:0;c*=f;val=room;}
  var coins=Math.round(c*Rv);var pt=(r.pt?r.pt[t]:t+1)+(rec?MG_RW.recPt:0);
  return {coins:coins,val:val,pt:pt,rec:rec,tier:t,score:sc,capped:capped,k:k,fx:capped&&f!==undefined?f:1,xv:Math.round(((+x.val||0)+lootVal(x))*k*Rv)};}
function finishGame(C,res){C.over=true;cancelAnimationFrame(C.raf);var id=C.id,m=mgDay(),sc=+res.score||0,t=Math.max(0,Math.min(3,res.tier|0));C.result={score:sc,tier:t};
  var out={score:sc,tier:t,coins:0,pt:0,rec:false,train:C.train};
  if(!C.bot)m.cnt[id]=(m.cnt[id]||0)+1;
  if(C.bot){out=Object.assign(out,calcReward(C,res,true));}
  else if(C.train){var rec=sc>(m.rec[id]||0)&&sc>0;if(rec&&!C.bot){m.rec[id]=sc;out.rec=true;}}
  else{var w=calcReward(C,res);out=Object.assign(out,w);
    if(w.rec)m.rec[id]=sc;m.dv=(m.dv||0)+w.val;m.pt=(m.pt||0)+w.pt;
    if(C.delo){m.dd.id=id;if(C.adRun)m.dd.ad=1;else m.dd.n=1;}else m.p[id]=(m.p[id]||0)+1;
    if(w.coins>0){try{setCoins(S.coins+ern('mg',w.coins));}catch(e){S.coins+=w.coins;}}
    var x=res.extra||{};if(x.give&&!w.capped)try{x.give();}catch(e){}else if(x.give&&w.capped&&x.giveCapped)try{x.giveCapped(w.fx);}catch(e){}
    out.loot=giveLoot(x,w.k*(w.capped?w.fx:1));
    out.lvUp=bookCheck();}
  try{STAT.ev('mg',{id:id,s:sc,t:t,ad:C.adRun?1:0,tr:C.train?1:0,dl:C.delo?1:0,c:out.coins||0,src:C.src||'yard'});}catch(e){}
  try{if(out.lvUp&&!C.bot)STAT.ev('mg',{a:'lvup',lv:out.lvUp.lv});}catch(e){} /*MERGE STAT: Книга двора — новый уровень*/
  if(!C.bot)mgSave();C.out=out;
  if(C.bot){var cb=C.cb;C.cb=null;closeGame(true);if(cb)cb(out);return;}
  showResult(C,res,out);}
function giveLoot(x,f){var got=[],n;if(isO(x.bait))for(var k in x.bait){n=Math.round((+x.bait[k]||0)*f);if(n>0){S.bait[k]=(S.bait[k]||0)+n;got.push([k,n]);}}
  if(+x.rk>0){n=Math.round(x.rk*f);if(n>0){S.mg.rk=(S.mg.rk||0)+n;got.push(['rk',n]);}}return got;}
function lootTxt(got){return got.map(function(g){var nm;if(g[0]==='rk')nm=L('Раки','Crayfish');else try{nm=L(BAIT[g[0]].n,BAIT[g[0]].en);}catch(e){nm=g[0];}return '<span class="mg-gl2">'+nm+' <b>+'+g[1]+'</b></span>';}).join('');}
function bookCheck(){var m=S.mg,l=lvlOf(m.pt||0),got=[];while((m.lv||0)<l){m.lv=(m.lv||0)+1;var gft=BOOK_GIFT[m.lv];if(gft){
    if(gft.dec&&typeof DEC!=='undefined'&&DEC[gft.dec]){if(!S.dec[gft.dec]){S.dec[gft.dec]=1;got.push(L(DEC[gft.dec].n,DEC[gft.dec].en));}else{var cc=Math.round(R()*.5);try{setCoins(S.coins+ern('mg',cc));}catch(e){}got.push('+'+cc+' 💰');}}
    if(gft.sk){m.sku[gft.sk]=1;got.push(L2(SKINS[gft.sk]));}}}
  return got.length?{lv:m.lv,got:got}:null;}
function stars(t){var h='';for(var i=1;i<=3;i++)h+='<i class="mg-st'+(i<=t?' on':'')+'" style="animation-delay:'+(0.25+i*.22)+'s">'+MG_STAR+'</i>';return h;}
function showResult(C,res,out){var x=res.extra||{},g=C.g,lay=C.lay;C.el.classList.add('dim');
  var title=res.title||[L('Не беда!','No worries!'),L('Неплохо!','Not bad!'),L('Хорошо!','Good job!'),L('Отлично!','Excellent!')][out.tier];
  var h='<div class="mg-res"><div class="mg-pn big"><div class="mg-stars">'+stars(out.tier)+'</div><div class="mg-h">'+title+'</div>'+
    '<div class="mg-sc">'+(res.scoreTxt||L('Счёт','Score')+': <b>'+out.score+'</b>')+(out.rec?' <span class="mg-rec">'+L('Рекорд!','Record!')+'</span>':'')+'</div>'+(x.line?'<div class="mg-ln">'+x.line+'</div>':'');
  if(C.train)h+='<div class="mg-ln mut">'+L('Тренировка — без наград, только ради рекорда.','Practice — no rewards, just for the record.')+'</div>';
  else{h+='<div class="mg-gain">'+gainHtml(out.loot,out)+'</div>';
    if(out.capped)h+='<div class="mg-ln mut">'+L('На сегодня Петрович своё отдал — дальше играем ради рекорда.','That\'s all rewards for today — keep playing for the record.')+'</div>';
    if(out.lvUp)h+='<div class="mg-lv">'+ic('star')+' '+L('Знаток двора','Yard expert')+': '+L('уровень','level')+' '+out.lvUp.lv+'<br><small>'+out.lvUp.got.join(' · ')+'</small></div>';}
  // одна просьба ролика на окно: «Удвоить добычу» (extra.x2, раз за игру) важнее «Ещё захода»
  var x2Btn=!C.train&&x.x2&&out.loot&&out.loot.length&&!out.capped&&C.host.adOk();
  var adBtn=!x2Btn&&C.delo&&!C.adRun&&!C.train&&C.host.adOk()&&!(mgDay().dd.ad);
  h+='<div class="mg-row">'+(x2Btn?'<button class="mg-btn sec mg-ad" data-a="x2">'+ic('ad')+' '+L('Удвоить добычу','Double the haul')+'</button>':'')+(adBtn?'<button class="mg-btn sec mg-ad" data-a="ad">'+ic('ad')+' '+L('Ещё заход','One more')+' <small>×½</small></button>':'')+
    '<button class="mg-btn" data-a="ok">'+L('Хорошо','OK')+kc('Enter')+'</button></div></div></div>';
  var d=mkEl('div','mg-resw',h);lay.appendChild(d);
  try{if(out.rec||out.tier===3)SND.record();else if(out.tier>0)SND.catch();}catch(e){}
  if(out.coins>0)setTimeout(function(){flyCoins(C,6,lay.clientWidth/2,lay.clientHeight*.45);},700);
  d.onclick=function(e){var a=e.target.closest&&e.target.closest('[data-a]');if(!a)return;var k=a.getAttribute('data-a');
    if(k==='ok'){closeGame(false);}
    else if(k==='x2'){var got=out.loot;a.disabled=true;C.host.ad('x2').then(function(ok){if(!ok){a.disabled=false;return;}a.style.visibility='hidden';
      giveLoot(lootObj(got),1);mgSave();try{STAT.ev('mg',{id:C.id,a:'x2'});}catch(e){}var gn=d.querySelector('.mg-gain');if(gn)gn.innerHTML=gainHtml(got.map(function(g){return [g[0],g[1]*2];}),out);try{SND.coin();}catch(e){}});}
    else if(k==='ad'){C.host.ad('more').then(function(ok){if(ok){var id=C.id;closeGame(true);play(id,{delo:true,adRun:true,src:C.src,back:C.back,noBack:C.noBack});}});}};}

/* ---------- Двор: временный список (сцена — ниже, mgDvor) ---------- */
function gainHtml(loot,out){return (loot&&loot.length?lootTxt(loot):'')+(out.coins>0?'<span class="mg-gc">'+coinSvg()+'<b>+'+out.coins+'</b></span>':'')+'<span class="mg-gp">'+ic('book')+'<b>+'+out.pt+'</b> '+L('в Книгу двора','to the Yard Book')+'</span>';}
function lootObj(got){var o={bait:{},rk:0};got.forEach(function(g){if(g[0]==='rk')o.rk+=g[1];else o.bait[g[0]]=(o.bait[g[0]]||0)+g[1];});return o;}
function backToDvor(){if(W0.MG_DVOR&&W0.MG_DVOR.open)W0.MG_DVOR.open();}

/* ---------- авто-игрок ---------- */
function mgBot(id,levels){levels=levels||['bad','mid','good'];var out=[];return new Promise(function(done){var i=0;
  function next(){if(i>=levels.length){done(out);return;}var lv=levels[i++];var g=REG[id];if(!g){done(out);return;}
    if(typeof g.bot==='function'){var k=dKey(),o={calm:false,seed:seedOf(k,g.oid||id),day:k,train:false,R:R(),lvl:topPlaceS(),delo:false,bot:lv,lang:'ru',rec:0},r0=null;
      try{r0=g.bot(lv,o);}catch(e){}var w=r0?calcReward({id:id},r0,true):{coins:0,pt:0,xv:0};out.push({level:lv,score:r0?r0.score:null,tier:r0?r0.tier:null,coins:w.coins,xv:w.xv,pt:w.pt});setTimeout(next,0);return;}
    play(id,{bot:lv,train:false,cb:function(r){out.push({level:lv,score:r?r.score:null,tier:r?r.tier:null,coins:r?r.coins:0,xv:r?r.xv:0,pt:r?r.pt:0});setTimeout(next,50);}});}
  next();});}

/* ---------- стенд ?mg=<id> ---------- */
var standDone=false;
function standGo(){if(standDone||!STAND)return;standDone=true;
  if(Q.get('save')!=='1'){try{save=function(){};}catch(e){}}
  setTimeout(function(){try{hideModal();}catch(e){}
    if(ALL&&(+S.sessions||0)<DVOR_AT){S.sessions=DVOR_AT;try{S.tips.intro=1;openMap();}catch(e){}} // стенд: новичка не ведём на первую рыбалку
    if(STAND==='dvor'){(function w(n){if(W0.MG_DVOR)backToDvor();else if(n<30)setTimeout(function(){w(n+1);},100);})(0);return;}
    var bot=Q.get('bot');if(bot){if(!REG[STAND]&&ALIAS[STAND])STAND=ALIAS[STAND];mgBot(STAND,bot==='all'?null:[bot]).then(function(r){W0.__mgBot=r;try{console.log('mgBot',JSON.stringify(r));}catch(e){}});return;}
    if(!REG[STAND]){for(var a in ALIAS)if(a===STAND)STAND=ALIAS[a];}
    play(STAND,{train:Q.get('train')==='1',delo:Q.get('delo')==='1'});},Q.get('wait')?+Q.get('wait'):900);}

/* ---------- RB:MGPC управление на ПК (решение владельца 08.10, как в Обороне/Богатыре) ---------- */
function pcOn(){try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
function pcMark(){try{document.documentElement.classList.toggle('mg-pc',pcOn());}catch(e){}}
try{var mqPc=matchMedia('(hover:hover) and (pointer:fine)');if(mqPc.addEventListener)mqPc.addEventListener('change',pcMark);else if(mqPc.addListener)mqPc.addListener(pcMark);}catch(e){}
pcMark();
// значок клавиши в кнопке DOM — виден только на ПК (html.mg-pc)
var KC_AR={'←':180,'→':0,'↑':270,'↓':90};
function kc(l){var a=KC_AR[l];if(a!=null)l='<svg viewBox="0 0 16 16" width="14" height="14" style="transform:rotate('+a+'deg)" aria-label="'+l+'"><path d="M2.5 8h10M8.5 3.5L13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return '<kbd class="mg-k">'+l+'</kbd>';}
// значок клавиши на холсте: светлая «стеклянная» клавиша с тёмной подписью
function keycap(g,x,y,l,px){px=px||24;l=String(l);var w=Math.max(px,px*.42*l.length+px*.62),r=px*.26,x0=x-w/2,y0=y-px/2;g.save();
  function rr(yy){g.beginPath();g.moveTo(x0+r,yy);g.arcTo(x0+w,yy,x0+w,yy+px,r);g.arcTo(x0+w,yy+px,x0,yy+px,r);g.arcTo(x0,yy+px,x0,yy,r);g.arcTo(x0,yy,x0+w,yy,r);g.closePath();}
  g.fillStyle='rgba(8,16,24,.5)';rr(y0+px*.12);g.fill();
  var gr=g.createLinearGradient(0,y0,0,y0+px);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#d9e4ec');g.fillStyle=gr;rr(y0);g.fill();
  g.strokeStyle='rgba(20,34,48,.55)';g.lineWidth=Math.max(1.2,px*.06);g.stroke();
  var a=KC_AR[l];if(a!=null){g.translate(x,y);g.rotate(a*Math.PI/180);g.strokeStyle='#1d2a36';g.lineWidth=Math.max(1.6,px*.1);g.lineCap='round';g.lineJoin='round';var s=px*.26;
    g.beginPath();g.moveTo(-s,0);g.lineTo(s,0);g.moveTo(s*.1,-s*.85);g.lineTo(s,0);g.lineTo(s*.1,s*.85);g.stroke();g.restore();return;}
  g.font='700 '+Math.round(px*(l.length>3?.46:.6))+'px '+(getComputedStyle(document.body).fontFamily||'system-ui,sans-serif');g.textAlign='center';g.textBaseline='middle';g.fillStyle='#1d2a36';g.fillText(l,x,y+px*.04);g.restore();}
function isPaused(C){if(!C)return false;try{if(typeof paused!=='undefined'&&paused)return true;}catch(e){}return !!(C.pause||document.hidden);}
// плашка-подсказка клавиш (первые секунды): host.kbd(html, сек, 'top'|'bottom')
function kbdHint(C,html,sec,pos){if(!pcOn()||C.bot||C.over)return;var b=C.lay.querySelector('.mg-kh');if(!b){b=mkEl('div','mg-kh');C.lay.appendChild(b);}
  b.classList.toggle('top',pos==='top');b.style.bottom=typeof pos==='number'?'calc(env(safe-area-inset-bottom,0px) + '+pos+'px)':'';b.innerHTML=html;b.classList.add('on');clearTimeout(b._t);b._t=setTimeout(function(){b.classList.remove('on');},(sec||7)*1000);}
function enterBtn(C){var l=C.el.querySelectorAll('[data-enter]');for(var i=0;i<l.length;i++){var b=l[i];if(b.disabled||!b.offsetParent)continue;var cs=getComputedStyle(b);if(cs.visibility==='hidden'||+cs.opacity===0||cs.pointerEvents==='none')continue;return b;}return null;}
function isEnt(k){return k==='Enter'||k===' '||k==='Spacebar';}
window.addEventListener('keydown',function(e){var C=CUR;if(!C||C.bot||e.ctrlKey||e.metaKey||e.altKey)return;var ad=document.getElementById('ad');if(ad&&ad.classList.contains('on'))return;
  var k=e.key,ent=isEnt(k),ask=C.lay.querySelector('.mg-ask');
  if(ask){if(!e.repeat&&(ent||k==='Escape')){e.preventDefault();var b=ask.querySelector('[data-a=no]');if(b)b.click();}else if(ent)e.preventDefault();return;}
  var rs=C.lay.querySelector('.mg-resw');
  if(rs||C.over){if(ent||k==='Escape'){e.preventDefault();if(!e.repeat){var b2=rs&&rs.querySelector('[data-a=ok]');if(b2)b2.click();}}return;}
  if(k==='Escape'){e.preventDefault();if(!e.repeat)askQuit(C);return;}
  if(isPaused(C))return;
  if(e.repeat&&!/^Arrow/.test(k)){if(ent||/^Arrow/.test(k))e.preventDefault();return;}
  (C.held=C.held||{})[k]=1;
  var eaten=false;for(var i=C.keys.length-1;i>=0&&!eaten;i--){try{eaten=!!C.keys[i](k,e);}catch(x){try{console.error(x);}catch(y){}}}
  if(!eaten&&ent){var b3=enterBtn(C);if(b3){b3.click();eaten=true;}}
  if(eaten||ent||/^Arrow/.test(k))e.preventDefault();});
window.addEventListener('keyup',function(e){var C=CUR;if(C&&C.held)delete C.held[e.key];if(!C||C.bot||C.over||!C.keysUp.length||C.lay.querySelector('.mg-ask'))return;
  for(var i=C.keysUp.length-1;i>=0;i--){try{if(C.keysUp[i](e.key,e)){e.preventDefault();break;}}catch(x){try{console.error(x);}catch(y){}}}});
// свернули вкладку / ушёл фокус (VK на ПК — щелчок мимо игры) — пауза с окном «Пауза»; не во время ролика и не сразу после него
function autoPause(){var C=CUR;if(!C||C.bot||C.over||C.adNow||Date.now()-(C.adEnd||0)<2000||Date.now()-C.t0<600)return;var ad=document.getElementById('ad');if(ad&&ad.classList.contains('on'))return;askQuit(C,'pause');}
document.addEventListener('visibilitychange',function(){if(document.hidden)autoPause();});
window.addEventListener('blur',function(){setTimeout(function(){if(!document.hasFocus())autoPause();},120);});
// занят ли экран мини-игрой или Двором (основная клавиатура игры тогда молчит)
function busy(){return !!(CUR||document.querySelector('.mg-dv'));}

/* ---------- RB:MGPC звуки природы в мини-играх и Дворе: записи audio/* через фон игры (ambWant → ambTick: выключатель S.amb, общий звук, плавные переходы),
   недостающее (треск костра, куры, гомон рынка) — синтезом tone/noise. Музыки нет (решение владельца). ---------- */
// сцена игры: yard — двор (днём птицы, вечером сверчки, ночью сверчки), water — у воды, fire — костёр у реки, night — ночь у воды, forest — опушка, market — рынок
var AMB_SC={baiki:'yard',nazh:'shore',uha:'fire',versha:'water',chist:'yard',boroda:'yard',prik:'water',rynok:'market',raki:'night',foto:'water',griby:'forest',domino:'yard',spor:'yard',lunka:'ice',dvor:'dvor'};
function ambTod(){if(CUR&&CUR.amb&&CUR.amb.td)return CUR.amb.td;try{if(CUR&&CUR.id==='foto'&&typeof G!=='undefined'&&G&&G.cond&&G.cond.tod)return G.cond.tod;}catch(e){}try{return W0.MG_ART.tod();}catch(e){return 'day';}}
function ambScene(sc,td){var o={},night=td==='night',eve=td==='evening';
  if(sc==='night'){o.water=.8;o.crickets=1;o.frogs=.7;return o;}
  if(sc==='ice'){o.wind=.8;return o;}
  if(sc==='water'||sc==='fire')o.water=sc==='water'?1:.6;else if(sc==='shore')o.water=.5;
  if(sc==='forest')o.wind=.45;
  if(sc==='market'){if(!night)o.birds=.3;return o;}
  if(night){o.crickets=1;if(sc==='water'||sc==='fire'||sc==='shore')o.frogs=.45;}
  else if(eve){o.crickets=.6;o.frogs=sc==='yard'||sc==='dvor'||sc==='forest'?.25:.8;}
  else o.birds=sc==='forest'?1:.85;
  return o;}
function ambNow(){if(CUR)return CUR.bot?'':(CUR.amb&&CUR.amb.sc||AMB_SC[CUR.id]||'yard');return document.querySelector('.mg-dv')?'dvor':'';}
function ambQuiet(){try{return S.amb===false||!sndOn()||!touched||document.hidden||(typeof paused!=='undefined'&&paused);}catch(e){return true;}}
(function(){if(typeof ambWant!=='function')return;var w0=ambWant;
  ambWant=function(){var sc=ambNow();if(!sc)return w0();if(ambQuiet())return {};return ambScene(sc,ambTod());};})();
var SY={hen:0,mk:0};
function henCluck(k){var n=3+Math.floor(Math.random()*3),f=640+Math.random()*160;for(var i=0;i<n;i++)tone('triangle',f*(1+Math.random()*.08),f*.72,.06,.035*k,i*.13);
  tone('triangle',f*1.35,f*.8,.22,.04*k,n*.13+.05);noise(.05,.012*k,1800,'bandpass',0,n*.13+.05);}
function synTick(){var sc=ambNow();if(!sc||ambQuiet())return;if(typeof tone!=='function'||typeof noise!=='function')return;
  var k=((typeof modalOn!=='undefined'&&modalOn)||(CUR&&(CUR.pause||CUR.over)))?.45:1,now=performance.now(),td=ambTod();
  if(sc==='fire'){ // треск костра: ровный гул, частые щелчки, редкий «стрельнувший» уголёк
    noise(.32,.014*k,520,'lowpass',0,Math.random()*.05);
    if(Math.random()<.6)noise(.012+Math.random()*.025,(.025+Math.random()*.05)*k,2600+Math.random()*3400,'highpass',0,Math.random()*.18);
    if(Math.random()<.035)noise(.07,.06*k,1200,'bandpass',400,.05);}
  else if(sc==='dvor'){if((td==='morning'||td==='day')&&now>SY.hen){if(SY.hen)henCluck(k);SY.hen=now+6000+Math.random()*10000;}}
  else if(sc==='market'&&!(td==='night')){ // гомон рынка: перекрытые «голосовые» полосы шума
    for(var i=0;i<2;i++)noise(.22+Math.random()*.3,(.008+Math.random()*.012)*k,320+Math.random()*900,'bandpass',0,Math.random()*.2);
    if(now>SY.mk){if(SY.mk)tone('sine',180+Math.random()*90,140,.18,.012*k,0);SY.mk=now+1500+Math.random()*3500;}}}
setInterval(synTick,220);

/* ---------- значки и стиль ---------- */
var MG_STAR='<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
var MG_IC={};
var MG_CSS='.mg-lay{position:absolute;left:0;top:0;width:100%;height:100%;z-index:30;background:#0e1a24;overflow:hidden;font-family:var(--font,system-ui,sans-serif);color:#fff;-webkit-user-select:none;user-select:none;touch-action:manipulation}'+
'.mg-el{position:absolute;left:0;top:0;width:100%;height:100%;transition:filter .4s}.mg-el.dim{filter:brightness(.55) saturate(.8)}.mg-el>*:not(canvas){transition:opacity .35s}.mg-el.dim>*:not(canvas){opacity:0;pointer-events:none}.mg-cv{position:absolute;left:0;top:0;width:100%;height:100%;display:block}'+
'.mg-bar{position:absolute;left:0;top:0;right:0;display:flex;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 0;pointer-events:none;z-index:5}'+
'.mg-x{pointer-events:auto;width:48px;height:48px;border-radius:16px;border:1px solid rgba(255,255,255,.25);background:rgba(16,26,36,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'+
'.mg-x .ic,.mg-x svg{width:24px;height:24px}.mg-tag{margin-left:10px;padding:6px 12px;border-radius:12px;background:rgba(16,26,36,.55);font-weight:600;font-size:15px;text-shadow:0 1px 2px rgba(0,0,0,.5)}.mg-tag.gold{background:linear-gradient(#ffcf7a,#ff9f4f);color:#3b1c00;text-shadow:none}'+
'.mg-pn{background:rgba(18,30,42,.86);-webkit-backdrop-filter:saturate(160%) blur(18px);backdrop-filter:saturate(160%) blur(18px);border:1px solid rgba(255,255,255,.2);border-radius:22px;box-shadow:0 14px 40px rgba(0,0,0,.4);padding:20px 18px;text-align:center;max-width:420px;width:calc(100% - 32px)}'+
'.mg-h{font-size:26px;font-weight:700;margin:4px 0 8px;text-shadow:0 2px 4px rgba(0,0,0,.4)}.mg-pn p{font-size:17px;line-height:1.4;margin:6px 0 14px;color:rgba(255,255,255,.86)}'+
'.mg-row{display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap}.mg-row>*{margin:0 5px}'+
'.mg-btn{min-height:56px;min-width:130px;padding:0 22px;border-radius:18px;border:0;font:700 19px var(--font,system-ui,sans-serif);color:#3b1c00;background:linear-gradient(180deg,#ffd98a,#ff9a52);box-shadow:0 6px 18px rgba(255,140,70,.35),inset 0 1px 0 rgba(255,255,255,.6);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}'+
'.mg-btn:active{transform:translateY(2px) scale(.98)}.mg-btn.sec{background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.3);box-shadow:none}.mg-btn .ic{width:22px;height:22px}.mg-btn small{opacity:.8;font-size:14px}'+
'.mg-ask,.mg-resw{position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(6,12,18,.35);z-index:20;animation:mgIn .3s ease-out}'+
'.mg-res{width:100%;display:flex;justify-content:center;max-height:100%;overflow-y:auto;padding:56px 0 16px;box-sizing:border-box}'+ /*RB:MGPC окно итогов во всю доступную ширину (до 420) и прокрутка на низких окнах*/
'.mg-res .mg-pn{animation:mgPop .45s cubic-bezier(.2,1.4,.4,1)}@keyframes mgIn{from{opacity:0}}@keyframes mgPop{from{transform:scale(.7);opacity:0}}'+
'.mg-stars{display:flex;justify-content:center;gap:6px;margin-top:-52px;margin-bottom:6px}.mg-st{display:block;width:62px;height:62px;animation:mgStar .5s cubic-bezier(.2,1.6,.4,1) both}.mg-st:nth-child(2){width:76px;height:76px;margin-top:-12px}'+
'.mg-st svg{width:100%;height:100%;fill:rgba(255,255,255,.18);stroke:rgba(255,255,255,.35);stroke-width:1}.mg-st.on svg{fill:#ffd24a;stroke:#b8790f;filter:drop-shadow(0 3px 6px rgba(255,180,40,.6))}@keyframes mgStar{from{transform:scale(0) rotate(-40deg);opacity:0}}'+
'.mg-sc{font-size:19px;color:rgba(255,255,255,.9)}.mg-sc b{font-size:24px;color:#ffd27a}.mg-rec{display:inline-block;margin-left:6px;padding:3px 10px;border-radius:10px;background:#ff8f4f;color:#fff;font-weight:700;font-size:15px;animation:mgPop .5s .9s both}'+
'.mg-ln{font-size:17px;margin-top:8px;line-height:1.35}.mg-ln.mut{color:rgba(255,255,255,.7);font-size:15px}.mg-gain{display:flex;justify-content:center;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:17px}.mg-gain>span{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:14px;background:rgba(255,255,255,.1)}'+
'.mg-gl2 b{font-size:20px}.mg-gain .coin,.mg-gain svg{width:26px;height:26px}.mg-gain b{font-size:22px;color:#ffd27a}.mg-lv{margin-top:12px;padding:10px;border-radius:14px;background:linear-gradient(90deg,rgba(255,207,122,.25),rgba(255,143,79,.25));font-weight:700;font-size:17px}.mg-lv small{font-weight:400;font-size:15px}.mg-lv .ic{width:20px;height:20px;vertical-align:-3px}'+
'.mg-say{position:absolute;left:50%;top:76px;transform:translate(-50%,-10px);max-width:86%;padding:10px 16px;border-radius:16px;background:rgba(16,26,36,.8);font-size:18px;line-height:1.35;opacity:0;transition:.3s;z-index:6;pointer-events:none}.mg-say.on{opacity:1;transform:translate(-50%,0)}.mg-say b{color:#ffd27a;margin-right:6px}'+
'.mg-fc{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;transition:transform .8s cubic-bezier(.5,-0.3,.7,1),opacity .8s;z-index:25;pointer-events:none}.mg-fc svg{width:100%;height:100%}'+
'body.calm .mg-res .mg-pn,body.calm .mg-st{animation:none}'+
/* RB:MGPC значки клавиш (только ПК) и плашка-подсказка */
'.mg-k{display:none}html.mg-pc .mg-k{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;padding:0 7px;margin:0 2px 0 8px;border-radius:7px;background:linear-gradient(#fff,#d9e4ec);color:#1d2a36;border:1px solid rgba(20,34,48,.45);box-shadow:0 2px 0 rgba(8,16,24,.45);font:700 14px/1 var(--font,system-ui,sans-serif);text-shadow:none;vertical-align:middle;white-space:nowrap}'+
'.mg-kh .mg-k,.mg-kh kbd{margin:0 3px}'+
'.mg-kh{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);transform:translate(-50%,10px);width:max-content;max-width:92%;box-sizing:border-box;padding:9px 16px;border-radius:16px;background:rgba(16,26,36,.78);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.22);font-size:17px;line-height:1.5;text-align:center;opacity:0;transition:.35s;z-index:7;pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.6)}'+
'.mg-kh.top{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 70px);transform:translate(-50%,-10px)}.mg-kh.on{opacity:1;transform:translate(-50%,0)}'+
'html.mg-pc .mg-lay button,html.mg-pc .mg-dv button{cursor:pointer}';

/* ---------- подключение к игре: S.mg, слияние облака ---------- */
mgFix();
(function(){var ms=mergeSave;mergeSave=function(d,ref){var loc=S.mg;ms(d,ref);try{S.mg=mgMerge(isO(loc)?loc:{},isO(d)&&d.mg);mgFix();}catch(e){}};
  var fs=fixSave;fixSave=function(){fs();try{mgFix();}catch(e){}};})();
if(STAND){(function w(n){if(REG[STAND]||REG[ALIAS[STAND]]||STAND==='dvor')standGo();else if(n<40)setTimeout(function(){w(n+1);},150);})(0);}

W0.MG_REG=MG_REG;W0.mgBot=mgBot;W0.MG_RW=MG_RW;W0.MG_LIST=MG_LIST;
// бонусы мини-игр (Уха +%, прикормка…) — только в обычной рыбалке: в турнире недели и «Рыбалке дня» не действуют
function buffOk(){try{return !(typeof G!=='undefined'&&G&&G.tourn);}catch(e){return true;}}
W0.MG={buffOk:buffOk,reg:REG,list:MG_LIST,by:MG_BY,play:play,close:closeGame,isOpen:isOpen,openHint:openHint,dvorOpen:dvorOpen,leftToday:leftToday,deloId:deloId,deloState:deloState,todo:todo,playsToday:playsToday,rw:rw,
  day:mgDay,fix:mgFix,merge:mgMerge,save:mgSave,R:R,seedOf:seedOf,dKey:dKey,wday:wday,lvlOf:lvlOf,lvlPts:lvlPts,BOOK_GIFT:BOOK_GIFT,SKINS:SKINS,DELO:DELO,ic:ic,IC:MG_IC,css:css,STAR:MG_STAR,get cur(){return CUR;},
  pc:pcOn,kc:kc,keycap:keycap,busy:busy,askQuit:askQuit,amb:AMB_SC,ambScene:ambScene};
})();
