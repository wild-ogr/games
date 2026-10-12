'use strict';
/* gb-MG0 «Перерыв 15 минут» — оболочка мини-игр «Гастронома №1: Образцовый» (js/gmg-core.js). Форк zmg-core «Школы бабы Зины»
   (та же семья, что vymg-core «Выезда»), 10.10.2026. План: hobby-analytics/release-i/gastronom-boost/05-minigames.md, 00-plan.md п.4.
   Журнал: gastronom-boost/logs/MG0.md. Наружу — только window.GMG_REG и window.GMG. Стили — css/gmg.css (грузит этот файл).

   ===================== ДОГОВОР ДЛЯ ИГР (MGA / MGB / MGC) =====================
   Файл игры — js/gmg-<id>.js (тексты — js/gmg-<id>-data.js), весь код в IIFE, первой строкой: if(typeof GMG_REG!=='function')return;
   В index.html строк игр НЕТ: оболочка грузит файл сама (GB.load) — при первом заходе или заранее, когда игра открыта.
   Свои имена и CSS-классы — с префиксом потока: gma- (MGA), gmb- (MGB), gmc- (MGC), gm0- (MG0). Глобальных имён не заводить.
   Регистрация: GMG_REG({id:'vesy', run(host,o){…}, deps?:['ckit','js/gmg-vesy-data.js'], sim?(o,k)=>({sc,st}), open?()=>bool, lines?, finWho?})
     id — из таблицы GMG.INFO ниже (номер n, название t, ведущий who, значок ic, правило a, длительность s — задаёт оболочка; можно переопределить полем).
     deps — что загрузить ДО run: 'ckit' (холст-помощники js/gmg-ckit.js → window.GMGK) и/или пути к своим файлам данных.
     open() — необязательно: false, если игра сейчас недоступна (нет данных, не сезон).
     sim(o,k) — бот баланса: k = умение 0..1 → {sc, st}. GMG.bot('<id>') — по 200 зёрнам.
     lines:{good,ok,bad} — свои реплики итога (строка или fn(r)); finWho — кто говорит итог (по умолчанию ведущий who).
   run(host,o) рисует ТОЛЬКО внутри host.el (шапку со значком, названием, host.top и ✕ рисует оболочка).
     Игра 30–60 с; одно нажатие до начала (host.intro); без таймера-гонки; ошибка не наказывает; кнопки ≥ 56 px, шрифт ≥ 17 px;
     на ПК — мышь и клавиши (1–4, стрелки, Пробел, Enter; Esc — оболочка: «Выйти?»; P/З — пауза).
     host.el — div во всю ширину под шапкой; host.w / host.h; host.dpr (≤2; на слабых — сами ограничивайте до 1,25).
     host.intro({text, html?, hint?, btn?, who?}) → Promise — карточка «одно нажатие до начала» (реплика ведущего + «Начать»; Enter/Пробел).
     host.cv() → {cv,x,w,h,dpr} холст во весь host.el; host.loop(fn(dt,t)) — кадры (на паузе не зовётся); host.ptr(elem,{down,move,up}) — касания/мышь.
     host.keys(fn(key,e)) — нажатие клавиши (true — съедена); host.keysUp(fn(key,e)) — отпускание (для «держи Пробел»).
     host.kc(lbl) — значок клавиши (только на ПК); host.pc — есть мышь; host.calm — спокойный режим (CALM/«уменьшить движение»).
     host.onResize(fn(w,h)); host.onQuit(fn) — убрать свои таймеры (loop/ptr/keys оболочка снимает сама).
     host.top(text) — строка справа в шапке («2 из 5»); host.say(who,text,mood) → HTML реплики; host.face(who,mood) → HTML-портрет.
       who: valya (родная), babka school police intel worker student revizor (покупатели — родной drawPerson), zina mityai mihalych kolya tolik
       galya semyon valerka plombir (гости — облик GBP от ART; пока его нет — запасные портреты). mood: norm|happy|sad|wow.
     host.art — рисунки игры: good(g,type,cx,by,size) = drawGood (товары 1–22, редкие 200+; новые GOODS 23–120 — когда будут),
       person(g,kind,cx,by,h,mood(-1|0|1),tk,talk) = drawPerson, cat(g,cx,by,s) — кот Пломбир, goods() → [{t,n}] обычные товары, name(t).
     host.T(ru,en) — строка по языку игры (английский делает поток EN; без перевода игра в ?lang=en не предлагается).
     host.snd — звуки игры (SND.pick drop coin till happy sigh grumble box stuck win…) — молчат при выключенном звуке.
     host.adNeed(kind) → Promise<bool> — ролик «по нужде»: ОДИН за заход (второй — сразу false); кнопку рисовать только при host.adOk(),
       класс `btn rw` и 📺 в тексте (гаснет с остальными «за рекламу», adfix/⏳); поздний досмотр засчитывается, пока игра на экране. Место STAT — mg_<id>_<kind>.
     host.fest — праздник или null: {id:'halloween'|'ny'|…, t} (даёт FEST через GMG.festFn) — «шкурка» игры.
     host.finish({sc, st:0..3, h?:ошибок, label?:'4 из 5'}) — конец захода: итог, награды, рекорд рисует ОБОЛОЧКА (host.done — то же).
     host.quit() — выйти без итога; host.paused — пауза; host.mem() → свой склад S.gmg.m.<id> (≤ 1 КБ, числа/строки).
     host.bot = fn(k) — необязательно: один ход бота (k 0..1) для стенда GMG.autoplay(k).
   o = {id, num, mode, train, seed, rnd, day, calm, lvl, ctx, rw, fest}
     mode — откуда пришёл: 'win' (Перерыв в «Кассе»), 'plan' (Затея дня — одна раскладка на всех), 'daily' (после задания дня — Завоз),
       'cab' (Подсобка — тренировка без наград), 'new' (окно «Новая затея!»), 'fest' (праздник); train — без наград;
     seed — зерно ('plan'/'daily' — одно на всех в этот день); rnd() — 0..1 от seed; day — день ГГГГММДД; lvl — пройдено уровней; rw — монеты по звёздам.
   НАГРАДЫ считает ОБОЛОЧКА (числа — GBECO.mg от ECO; монеты — GBECO.give('mg',n); запасные — GMG_RW): монеты 5/10/15 по звёздам, ≤ 30 💰 в день от всех игр;
     благодарность в «Книгу жалоб и предложений» (GBM.thanks('mg'), META) — Затея дня/Завоз ≥1★, Перерыв 2★+, ≤ 2 в день;
     «Столик» в запас — 3★ в Затее дня или Завозе, ≤ 1 в день, запас ≤ 2 (тратится в уровне вместо монет). Перерывов с наградой ≤ 3 в день.
     Награда за игру — раз в день (повтор — на рекорд). Тренировка — без наград. Карточки «Дефицита» — никогда. «×2 за ролик» — никогда.
   Сохранение: своих полей в S игра не заводит — только host.mem().
   Вид (css/gmg.css): .gmg-card (листок), .gmg-q (крупный текст), .gmg-opts > .gmg-opt (.ok/.no/.sel) — варианты ≥ 56 px, .gmg-hint,
     .gmg-dots > i (.ok/.no/.cur), .btn / .btn.green — кнопки игры.
   СТЕНД: ?gmg=<id>&mode=win|day|cab|fest|new&seed=N&fresh=1 (чистое S.gmg) — игра сразу на весь экран; ?gmg=list — список; ?gmg=back — Подсобка.
     В консоли: GMG.bot('<id>'), GMG.autoplay(k) — пройти открытую игру ботом (нужен host.bot).
   СОБЫТИЯ: GB.emit('mg',{id, st, m, train, paid}) — раз на конец каждого захода (LEAGUE); GB.emit('gmg',{a:'end',…}).
   STAT: ev 'mg' {a:'open'|'show'|'go'|'end'|'quit'|'skip'|'rw', id, m:win|plan|daily|cab|new|fest, l:уровень, sc, st, s:секунд, c:монет} — пишет оболочка;
     монеты — earn 'mg' (через GBECO.give или ern('mg')).
   S.gmg (владелец MG0, GB.onSave): {o:{n:1} открыта, s:{n:1} «Новая затея» показана, b:{n:рекорд}, n:{n:заходов},
     d:{k:день, c:монет, th:благодарностей, tb:столиков, pk:Перерывов с наградой, p:{n:1} награда за игру сегодня, z:Затея дня, zv:Завоз},
     dp:дней игры, dl:последний день, ol:уровень последнего открытия, od:день открытия, sn:номер захода последнего открытия, nw:ждёт окна «Новая затея»,
     pc:Перерывов показано, tb:Столиков в запасе, m:{id:{…}}, ts}
   ВЫКЛЮЧЕНИЕ: GB.flag('mg') — весь модуль (window.GB_OFF={mg:1} или ?gboff=mg на маке): игра как раньше; GB.flag('mg_<id>') — игра не открывается
     и не предлагается (недоделанные к 19.10 у MGA–MGC — сюда).
   ==========================================================================================================================================================*/
(function(){
if(typeof S==='undefined'||typeof GB==='undefined'||typeof GB.flag!=='function'||!GB.flag('mg'))return;
const escH=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const $i=id=>document.getElementById(id);
const isEN=()=>{try{return typeof LANG!=='undefined'&&LANG==='en';}catch(e){return false;}};
const T=(ru,en)=>isEN()&&en!=null?en:ru;
const plr=(n,a,b,c)=>{try{return typeof plural==='function'?plural(n,a,b,c):c;}catch(e){return c;}};
const now=()=>{try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}};
function today(){try{if(typeof dayKey==='function')return +dayKey(0);}catch(e){}const d=new Date(now());return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
// стили — свой файл (index.html не трогаем)
(function(){if(document.querySelector('link[data-gmg]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='css/gmg.css';l.setAttribute('data-gmg','1');document.head.appendChild(l);})();

/* ---------- 15 игр: номер → id, название, ведущий, значок, правило, длительность (с), открытие ----------
   lv — открывается после стольких пройденных уровней; dp — на такой день игры (и не раньше 5-го уровня). Не больше ОДНОЙ новой за заход (05 §4 п.6). */
const INFO={
  1:{id:'vesy',t:'Двести грамм докторской',who:'valya',ic:'⚖️',a:'Держите — тётя Валя режет. Отпустите, когда на весах сколько просят.',s:30,lv:5},
  2:{id:'sdacha',t:'Сдача',who:'valya',ic:'🧾',a:'Покупатель дал рубль — наберите сдачу монетами из лотка',s:40,lv:15},
  3:{id:'pochem',t:'Почём?',who:'mityai',ic:'🏷',a:'Дед Митяй помнит цены — а вы? Выберите верную',s:40,dp:2},
  4:{id:'steklo',t:'Приём стеклотары',who:'mihalych',ic:'🥛',a:'Михалыч сдаёт бутылки — принимайте только целые и наши',s:40,dp:3},
  5:{id:'avoska',t:'Авоська',who:'zina',ic:'🧺',a:'Уложите покупки бабы Зины: банки — на дно, яйца — сверху',s:45,dp:11},
  6:{id:'vybrosili',t:'Выбросили!',who:'babka',ic:'🍊',a:'Выбросили дефицит! Ловите то, что в списке, а «нагрузку» не берите',s:30,dp:4},
  7:{id:'krainiy',t:'Кто крайний?',who:'intel',ic:'👥',a:'Расставьте очередь по подсказкам — кто за кем стоял',s:50,lv:25},
  8:{id:'otlichiya',t:'Отличия на прилавке',who:'valerka',ic:'🔍',a:'Прилавок утром и вечером — найдите отличия',s:45,dp:5},
  9:{id:'nakladnaya',t:'Накладная',who:'revizor',ic:'📋',a:'Сверьте накладную с ящиком — где ошибка?',s:45,lv:11},
  10:{id:'zakaz',t:'Стол заказов',who:'galya',ic:'📝',a:'Галя диктует заказ — соберите его с полки по памяти',s:45,dp:7},
  11:{id:'kulek',t:'Что в кульке?',who:'semyon',ic:'🛍',a:'Угадайте товар по подсказкам — чем раньше, тем лучше',s:40,dp:9},
  12:{id:'zavoz',t:'Завоз',who:'tolik',ic:'🚚',a:'Толик привёз завоз — разложите ящики по местам',s:30,lv:7},
  13:{id:'piramida',t:'Пирамида из банок',who:'valya',ic:'🥫',a:'Постройте витрину из банок — отпускайте вовремя',s:45,dp:14},
  14:{id:'sklad',t:'Склад',who:'kolya',ic:'📦',a:'Дядя Коля: толкайте ящики на места в тесной подсобке',s:60,lv:30},
  15:{id:'kot',t:'Пломбир у колбасы',who:'plombir',ic:'🐈',a:'Кот Пломбир лезет к докторской — шугайте, покупателя не задевайте',s:30,dp:17}};
const IDS={};for(const n in INFO){INFO[n].num=+n;IDS[INFO[n].id]=+n;}
const infoOf=id=>INFO[IDS[id]]||INFO[id]||null;
/* Затея дня по дням недели (0 — Вс): Пн Завоз, Вт Сдача/Почём? (через неделю), Ср Стол заказов, Чт «Рыбный день: Выбросили!», Пт Отличия, Сб Пирамида, Вс Авоська.
   Закрыта/не загрузилась — ближайшая открытая. */
const WEEK=['avoska','zavoz','sdacha','zakaz','vybrosili','otlichiya','piramida'];
const NOPER=['zavoz'];   // в Перерыв не идёт (Завоз — после задания дня и Затеей дня)
/* ---------- награды (числа — GBECO.mg от ECO; здесь — запасные, если ECO не загрузился) ---------- */
const GMG_RW={c:[0,5,10,15],cap:30,th:2,thPer:2,pk:3,tb:1,tbMax:2};
/* GBECO.mg: {st:[0,5,10,15], cap, thanksDay, thanksPer (звёзд в Перерыве), breakDay, tableDay, tableMax}; GBECO.give('mg',n) → сколько выдано (потолок дня у ECO) */
function RW(){const E=window.GBECO,m=E&&E.mg;if(!m||typeof m!=='object')return GMG_RW;const r=Object.assign({},GMG_RW);
  if(Array.isArray(m.st)&&m.st.length===4)r.c=m.st.slice();if(m.cap>=0)r.cap=+m.cap;if(m.thanksDay>=0)r.th=+m.thanksDay;if(m.thanksPer>=0)r.thPer=+m.thanksPer;
  if(m.breakDay>=0)r.pk=+m.breakDay;if(m.tableDay>=0)r.tb=+m.tableDay;if(m.tableMax>=0)r.tbMax=+m.tableMax;return r;}
/* монеты: через GBECO.give('mg') (потолок дня и STAT earn — у ECO), без ECO — свой потолок и ern('mg') */
function giveCoins(want,z,rw){if(want<=0)return 0;const E=window.GBECO;
  if(E&&typeof E.give==='function'){let k=0;try{k=E.give('mg',want)|0;}catch(e){k=0;}z.d.c+=k;return k;}
  const c=Math.max(0,Math.min(want,rw.cap-z.d.c));if(c>0){z.d.c+=c;try{S.coins=(+S.coins||0)+c;if(typeof ern==='function')ern('mg',c);if(typeof save==='function')save();if(typeof updCoins==='function')updCoins();}catch(e){}}return c;}
/* благодарность в «Книгу» — META (GBM.thanks); нет META — благодарностей нет (строки в итоге тоже) */
function giveThanks(){try{if(window.GBM&&typeof GBM.thanks==='function'){const r=GBM.thanks('mg');return r===false?null:(r||true);}}catch(e){}return null;}

const REG={by:{},list:[],cur:null};
function GMG_REG(g){if(!g||!g.id||typeof g.run!=='function')return;const i=infoOf(g.id);if(!i){console.warn('gmg: нет такого id',g.id);return;}
  if(REG.by[g.id])return;g.num=i.num;g.t=g.t||(typeof g.n==='string'&&g.n)||i.t; /* POLISH: у MGC n — номер (15), не название */g.n=g.t;g.who=g.who||i.who;g.ic=g.ic||i.ic;g.a=g.a||i.a;g.s=g.s||i.s;
  REG.by[g.id]=g;delete bad[g.id];REG.list.push(g);REG.list.sort((a,b)=>a.num-b.num);try{if(GMG.onReg)GMG.onReg(g);}catch(e){}}

/* ---------- сохранение S.gmg ---------- */
const ob=v=>!!v&&typeof v==='object'&&!Array.isArray(v),nn=v=>Math.max(0,(+v|0)||0);
function dNew(k){return {k:k||0,c:0,th:0,tb:0,pk:0,p:{},z:0,zv:0};}
function zNew(){return {o:{},s:{},b:{},n:{},d:dNew(0),dp:0,dl:0,ol:0,od:0,sn:0,nw:'',pc:0,tb:0,m:{},ts:0};}
function zFixO(z){const d=zNew();for(const k in d)if(!(k in z))z[k]=d[k];
  for(const k of['o','s','b','n','m'])if(!ob(z[k]))z[k]={};
  for(const k of['b','n'])for(const i in z[k])z[k][i]=nn(z[k][i]);for(const k of['o','s'])for(const i in z[k])z[k][i]=z[k][i]?1:0;
  for(const i in z.m)if(!ob(z.m[i]))delete z.m[i];
  for(const k of['dp','dl','ol','od','sn','pc','tb'])z[k]=nn(z[k]);z.tb=Math.min(9,z.tb);z.ts=+z.ts||0;z.nw=typeof z.nw==='string'&&infoOf(z.nw)?z.nw:'';
  if(!ob(z.d))z.d=dNew(0);for(const k of['k','c','th','tb','pk'])z.d[k]=nn(z.d[k]);z.d.z=z.d.z?1:0;z.d.zv=z.d.zv?1:0;
  if(!ob(z.d.p))z.d.p={};for(const i in z.d.p)z.d.p[i]=z.d.p[i]?1:0;
  return z;}
function gmgFix(s){s=s||S;try{if(!ob(s.gmg))s.gmg=zNew();zFixO(s.gmg);}catch(e){console.warn('gmg fix',e);s.gmg=zNew();}}
/* облако: открытое/виденное — объединение; рекорды, заходы, дни — максимум; сегодняшний день — свежий (тот же — максимум);
   склады игр, запас столиков и «ожидает окна» — из более нового */
function gmgMerge(a,b){if(!ob(b))return a;b=zFixO(JSON.parse(JSON.stringify(b)));if(!ob(a))return b;a=zFixO(a);const bn=b.ts>a.ts;
  for(const k of['o','s'])for(const i in b[k])if(b[k][i])a[k][i]=1;
  for(const k of['b','n'])for(const i in b[k])a[k][i]=Math.max(a[k][i]|0,b[k][i]|0);
  for(const k of['dp','dl','ol','od','sn','pc'])a[k]=Math.max(a[k],b[k]);
  if(b.d.k>a.d.k)a.d=b.d;else if(b.d.k===a.d.k){for(const k of['c','th','tb','pk','z','zv'])a.d[k]=Math.max(a.d[k],b.d[k]);for(const i in b.d.p)if(b.d.p[i])a.d.p[i]=1;}
  if(bn){a.m=b.m;a.nw=b.nw;a.tb=b.tb;}else for(const i in b.m)if(!(i in a.m))a.m[i]=b.m[i];
  if(a.nw&&a.s[IDS[a.nw]])a.nw='';a.ts=Math.max(a.ts,b.ts);return a;}
GB.onSave({id:'gmg',keys:['gmg'],fix:s=>gmgFix(s),
  merge:(s,d)=>{try{s.gmg=ob(s.gmg)?gmgMerge(s.gmg,ob(d)?d.gmg:null):ob(d)&&ob(d.gmg)?zFixO(JSON.parse(JSON.stringify(d.gmg))):zNew();}catch(e){console.warn('gmg merge',e);}}});
gmgFix(S);
let sesN=0;   // номер захода (для «одна новинка за заход»)
function Z(){const z=S.gmg||(gmgFix(S),S.gmg),k=today();if(z.d.k!==k){z.d=dNew(k);if(z.dl!==k){z.dp++;z.dl=k;}}if(!sesN){z.sn=(z.sn|0)+1;sesN=z.sn;}return z;}
function touch(){S.gmg.ts=Date.now();}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
const lvl=()=>Math.max(0,(+S.unlocked||1)-1);
function stEv(p){try{STAT.ev('mg',p);}catch(e){}}
const demo=()=>{try{return /[?&]demo=/.test(location.search);}catch(e){return false;}};
/* фразы ведущих (TEXT: content/texts/hosts.json → js/gmg-hosts-data.js, лениво): GMG_HOSTS {games:{id:{intro,st3..st0,new}}, pereryv, zateya{1..7:[id,фраза]}} */
const HG=id=>{const h=window.GMG_HOSTS;return h&&h.games&&h.games[id]||null;};
function hp(a,rnd){if(!a)return '';if(typeof a==='string')return a;return a.length?a[Math.floor((rnd||Math.random)()*a.length)%a.length]:'';}

/* ---------- подгрузка игр (лениво) ---------- */
const FILE=id=>'js/gmg-'+id+'.js',DEP={ckit:'js/gmg-ckit.js'};
const bad={};   // не загрузилось в этом сеансе
const isOff=id=>!GB.flag('mg_'+id);
function loadGame(id){if(REG.by[id])return Promise.resolve(REG.by[id]);if(isOff(id))return Promise.reject(new Error('off'));
  return GB.load(FILE(id)).then(()=>{if(!REG.by[id])throw new Error('no reg '+id);return REG.by[id];}).catch(e=>{bad[id]=1;throw e;});}
function loadDeps(g){const L=(g.deps||[]).map(d=>DEP[d]||d);return Promise.all(L.map(u=>GB.load(u)));}
// заранее (в тишине): открытые игры и ближайшая (Весы — с 3-го уровня), чтобы Перерыв и Затея дня предлагали только то, что точно есть
function preload(){const z=Z(),want=[];for(const n in INFO){const i=INFO[n];if(isOff(i.id)||REG.by[i.id]||bad[i.id])continue;
    if(z.o[n]||(i.id==='vesy'&&lvl()>=3))want.push(i.id);}
  let p=Promise.resolve();want.forEach(id=>{p=p.then(()=>loadGame(id).catch(()=>{}));});return p;}

/* ---------- открытие игр по прогрессу: одна новинка за заход ---------- */
function gOk(g){try{return !g.open||g.open()!==false;}catch(e){return false;}}
function due(n,l){const i=INFO[n];if(!i||isOff(i.id))return false;const z=Z();if(l==null)l=lvl();return i.lv?l>=i.lv:(!!i.dp&&l>=5&&z.dp>=i.dp);}
const isOpen=id=>{const i=infoOf(id);return !!(i&&!isOff(i.id)&&S.gmg&&S.gmg.o[i.num]);};
const langOk=()=>!isEN()||!!GMG.enOk;   // английский — поток EN (GMG.enOk=true, когда тексты переведены)
const avail=id=>langOk()&&isOpen(id)&&!!REG.by[id]&&gOk(REG.by[id]);
/* открыть следующую (одну за заход): byLevel — после победы (l — пройдено уровней с этой победой; игры «по уровню»), иначе — на главном
   (игры «по дням» — не чаще раза в день; «по уровню» — если уровень давно пройден, для старых игроков). Вернёт id или '' */
let sesOpen=0;
function unlock(byLevel,lw){const z=Z(),l=Math.max(lvl(),lw|0);if(sesOpen)return '';
  for(let n=1;n<=15;n++){if(z.o[n]||!due(n,l))continue;const i=INFO[n];if(bad[i.id])continue;
    // файла игры ещё нет в памяти — сначала грузим (нет файла/выключена — пропускаем; новинку не тратим), потом пробуем снова
    if(!REG.by[i.id]){if(!unlock.wait){unlock.wait=1;const re=()=>{unlock.wait=0;const r=unlock(byLevel,lw);if(r&&Z().nw)newOffer();};loadGame(i.id).then(re,re);}return '';}
    if(i.lv){if(!byLevel&&!(l>i.lv))continue;z.o[n]=1;z.ol=l;}
    else{if(z.od===z.d.k)continue;z.o[n]=1;z.od=z.d.k;}
    sesOpen=1;
    if(!z.s[n]&&i.id!=='vesy')z.nw=i.id;   // Весы представляет сам Перерыв
    touch();sv();stEv({a:'open',id:i.id,l});GB.safe('gmg-open',()=>GB.refresh());return i.id;}
  return '';}
function lockTxt(id){const i=infoOf(id),z=Z(),l=lvl();if(!i)return '';if(isOff(i.id))return T('пока закрыта','closed for now');
  if(i.lv){const a=i.lv-l;return a>0?T('после '+i.lv+'-го уровня','after level '+i.lv):T('откроется после победы','opens after a win');}
  if(l<5)return T('с 5-го уровня','from level 5');const b=Math.max(0,i.dp-z.dp);return b>0?T('через '+b+' '+plr(b,'день','дня','дней')+' игры','in '+b+' day(s) of play'):T('в следующий заход','next visit');}
const openList=()=>REG.list.filter(g=>avail(g.id));

/* ---------- зерно, портреты, мелочи ---------- */
function seedOf(id,day){let h=2166136261;const s=(day||today())+'|gmg|'+id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
const R=seed=>{let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
const isPC=()=>{try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}};
const kc=l=>isPC()?'<kbd class="gmg-kc">'+escH(l)+'</kbd>':'';
const CALMx=()=>{try{if(typeof calm==='function')return !!calm();}catch(e){}try{return matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){return false;}};
/* Портреты: GMG.faces[who] (подмена) → GBP.bust/face (гости ART, по реестру) → родные рисунки игры (drawPerson: Валя, покупатели, Ревизор; drawCat — Пломбир)
   → запасные бюсты (копии облика из Викторины/Выезда — до GBP; новых героев не рисуем) */
const WHO={valya:['Тётя Валя','Aunt Valya'],babka:['Покупательница','Customer'],school:['Школьник','Schoolboy'],police:['Милиционер','Policeman'],intel:['Интеллигент','Gentleman'],
  worker:['Рабочий','Worker'],student:['Студент','Student'],revizor:['Ревизор','Inspector'],zina:['Баба Зина','Granny Zina'],mityai:['Дед Митяй','Grandpa Mityai'],
  mihalych:['Михалыч','Mikhalych'],kolya:['Дядя Коля','Uncle Kolya'],tolik:['Толик','Tolik'],galya:['Галя с третьего','Galya from the 3rd floor'],
  semyon:['Дед Семён','Grandpa Semyon'],valerka:['Валерка','Valerka'],plombir:['Кот Пломбир','Plombir the cat']};
const whoName=w=>{try{if(!isEN()&&window.GBP&&typeof GBP.name==='function'&&!(w in {babka:1,school:1,police:1,intel:1,worker:1,student:1})){const x=GBP.name(w);if(x)return x;}}catch(e){}const n=WHO[w]||WHO.valya;return T(n[0],n[1]);};
const NATIVE={valya:1,babka:1,school:1,police:1,intel:1,worker:1,student:1,revizor:1};
const BG={valya:'#f6dcb0',babka:'#f3e2d6',school:'#e5eef8',police:'#e3e9f2',intel:'#ece6f3',worker:'#e9eadf',student:'#e8f3ea',revizor:'#ececec',plombir:'#fbe9d0'};
const MOOD={norm:0,happy:1,wow:1,sad:-1};
const pcache={};
function nativeFace(who,m){const key=who+'|'+m;if(pcache[key])return pcache[key];let u='';
  try{const c=document.createElement('canvas'),w=112;c.width=w;c.height=w;const g=c.getContext('2d');g.fillStyle=BG[who]||'#f6dcb0';g.fillRect(0,0,w,w);
    if(who==='plombir'){if(typeof drawCat==='function')drawCat(g,w*.5,w*.86,w*.95);}
    else if(typeof drawPerson==='function')drawPerson(g,who,w/2,w*1.3,w*1.12,MOOD[m]||0,0,0);
    u=c.toDataURL('image/png');}catch(e){u='';}
  pcache[key]=u;return u;}
const BUST={
  valerka:{bg:'#e5eef8',body:'#2f9e44',brow:'#6b4420',skin:'#f6cfae',
    hair:'<path d="M52 96 q-6 -44 46 -50 q52 2 52 48 q-10 -22 -26 -20 q-10 -12 -24 -6 q-14 -10 -30 2 q-12 4 -18 26z" fill="#8a5a2b"/>',
    hat:'<path d="M50 76 q2 -44 50 -46 q48 2 50 46 q-50 -14 -100 0z" fill="#1c6fb8"/><path d="M100 64 q38 -6 68 10 q-4 9 -18 9 q-24 -9 -50 -7z" fill="#155a96"/>',
    bodyX:'<path d="M80 152 l20 22 l20 -22" fill="#fff"/>'},
  mityai:{bg:'#e2edf3',old:1,body:'#fff',brow:'#c2c6cd',hair:'<path d="M50 104 q-6 -24 8 -36 q-2 18 5 30z M150 104 q6 -24 -8 -36 q2 18 -5 30z" fill="#d9dde3"/>',
    bodyX:'<g stroke="#1f4f9a" stroke-width="8"><path d="M40 176 h120 M24 194 h152 M18 212 h164"/></g>',
    face:'<path d="M68 142 q32 18 64 0" stroke="#c4c4c4" stroke-width="2.4" fill="none" stroke-dasharray="2 5"/><circle cx="101" cy="118" r="8" fill="#e8826f" opacity=".55"/>'},
  mihalych:{bg:'#e6eadf',old:1,body:'#5d6b7c',brow:'#9a9a9a',
    bodyX:'<path d="M56 158 l24 -6 l20 30 l20 -30 l24 6 q30 8 38 34 v28 H18 v-28 q8 -26 38 -34z" fill="#ff8a1f"/><path d="M80 152 l20 30 l20 -30" fill="#39485a"/>',
    hat:'<path d="M46 80 q-2 -52 54 -54 q56 2 54 54 q-54 -16 -108 0z" fill="#6f5136"/><path d="M42 82 q58 -22 116 0 v14 q-58 -20 -116 0z" fill="#9b7650"/>',
    face:'<path d="M70 128 q14 -10 30 -3 q16 -7 30 3 q-6 14 -30 9 q-24 5 -30 -9z" fill="#c9cdd2"/>'},
  tolik:{bg:'#e3e9f2',body:'#2c5aa0',brow:'#5b3a29',
    hat:'<path d="M50 74 q4 -44 52 -46 q46 2 50 40 q-50 -8 -102 6z" fill="#6b6f76"/>',
    face:'<path d="M76 136 q12 -8 24 -2 q12 -6 24 2 q-6 10 -24 6 q-18 4 -24 -6z" fill="#5b3a29"/>'},
  kolya:{bg:'#eeeae0',old:1,body:'#6b5a3e',brow:'#8c8c8c',
    hat:'<path d="M46 80 q-2 -52 54 -54 q56 2 54 54 q-54 -16 -108 0z" fill="#3f4a3a"/>',
    face:'<path d="M74 134 q26 10 52 0" stroke="#9a9a9a" stroke-width="5" fill="none" stroke-linecap="round"/>'}};
function bustSvg(id,m){const o=BUST[id]||BUST.valerka,sk=o.skin||'#eebf99',sk2='#dba27c',brow=o.brow||'#8c8c8c';
  const eyes=m==='happy'?'<path d="M72 104 q9 -9 18 0 M110 104 q9 -9 18 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>'
    :m==='wow'?'<circle cx="81" cy="103" r="6.4" fill="#3a2a22"/><circle cx="119" cy="103" r="6.4" fill="#3a2a22"/>'
    :'<ellipse cx="81" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><ellipse cx="119" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/>';
  const brows='<path d="'+(m==='sad'?'M68 90 q10 -5 22 2 M132 90 q-10 -5 -22 2':m==='happy'||m==='wow'?'M67 86 q11 -9 23 -3 M133 86 q-11 -9 -23 -3':'M68 90 q11 -6 22 -2 M132 90 q-11 -6 -22 -2')+'" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>';
  const mouth=m==='happy'?'<path d="M82 132 q18 20 36 0 q-18 5 -36 0z" fill="#8f2f35"/>':m==='sad'?'<path d="M88 140 q12 -9 24 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
    :m==='wow'?'<ellipse cx="100" cy="137" rx="8" ry="9" fill="#8f2f35"/>':'<path d="M86 133 q14 11 28 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
  return '<svg viewBox="20 20 160 160" aria-hidden="true"><rect width="200" height="220" fill="'+(o.bg||'#eee')+'"/><path d="M10 220 q2 -52 46 -62 l24 -6 h40 l24 6 q44 10 46 62z" fill="'+o.body+'"/>'+(o.bodyX||'')+
    '<path d="M84 138 h32 v20 q-16 12 -32 0z" fill="'+sk2+'"/><ellipse cx="50" cy="110" rx="9" ry="12" fill="'+sk+'"/><ellipse cx="150" cy="110" rx="9" ry="12" fill="'+sk+'"/>'+
    '<path d="M52 92 q0 -48 48 -48 q48 0 48 48 q0 30 -14 46 q-14 16 -34 16 q-20 0 -34 -16 q-14 -16 -14 -46z" fill="'+sk+'"/>'+(o.hair||'')+
    '<ellipse cx="68" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/><ellipse cx="132" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/>'+
    (o.old?'<path d="M64 112 q5 3 10 2 M136 112 q-5 3 -10 2 M80 76 q20 -5 40 0" stroke="'+sk2+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>':'')+
    brows+eyes+'<path d="M100 104 q-9 18 -3 22 q5 3 11 -1 q3 -3 -1 -8" fill="'+sk2+'" opacity=".9"/>'+mouth+(o.face||'')+(o.hat||'')+'</svg>';}
/* у кого облика нет ни в GBP, ни в запасе (Зина, Галя, Семён) — до ART родная покупательница того же возраста (не новый герой) */
const STAND_IN={zina:'babka',galya:'student',semyon:'intel'};
const FACES={};
function face(who,m){m=m||'norm';const f=FACES[who];if(typeof f==='function')try{const r=f(m);if(r)return r;}catch(e){}
  try{if(window.GBP&&typeof GBP.bust==='function'&&(who==='plombir'||!NATIVE[who]||who==='valya'||who==='revizor')){const r=GBP.bust(who,m);if(r)return r;}}catch(e){}
  const nw=NATIVE[who]||who==='plombir'?who:STAND_IN[who];
  if(nw){const u=nativeFace(nw,m);if(u)return '<img src="'+u+'" alt="">';}
  return bustSvg(BUST[who]?who:'valerka',m);}
function sayH(who,t,m){return '<div class="gmg-say"><span class="gmg-av gmg-av-'+escH(who)+'">'+face(who,m)+'</span><p class="gmg-sb"><b class="gmg-who">'+escH(whoName(who))+'</b>'+t+'</p></div>';}
/* рисунки игры для мини-игр */
const ART={good(g,t,cx,by,s){try{if(typeof drawGood==='function')drawGood(g,t,cx,by,s);}catch(e){}},
  person(g,kind,cx,by,h,mood,tk,talk){try{if(typeof drawPerson==='function')drawPerson(g,kind,cx,by,h,mood|0,tk||0,talk||0);}catch(e){}},
  cat(g,cx,by,s){try{if(typeof drawCat==='function')drawCat(g,cx,by,s);}catch(e){}},
  goods(){const o=[];try{for(const k in GOODS){const t=+k;if(t>=1&&t<200&&typeof GOOD_DRAW!=='undefined'&&GOOD_DRAW[t])o.push({t,n:GOODS[t].n,a:GOODS[t].a});}}catch(e){}return o;},
  name(t){try{return GOODS[t]?GOODS[t].n:'';}catch(e){return '';}},
  kinds:['babka','school','police','intel','worker','student']};

/* ---------- клавиатура: один перехватчик (раньше игры) — пока мини-игра на экране, клавиши идут только ей ----------
   Esc — окно «Выйти?»; P/З — пауза; в окнах оболочки: Enter/Пробел — зелёная (или выбранная стрелками), 1–9 — по порядку, стрелки — выбор. */
const isP=k=>k==='p'||k==='P'||k==='з'||k==='З';
function veilBtns(v){return [].slice.call(v.querySelectorAll('.gmg-btns button')).filter(b=>!b.disabled&&b.offsetParent!==null);}
function veilKey(v,e){const k=e.key,bs=veilBtns(v);if(!bs.length)return false;
  if(k==='Enter'||k===' '){if(e.repeat)return true;const f=bs.filter(b=>b.classList.contains('gmg-kf'))[0]||v.querySelector('.btn.green');if(f){f.click();return true;}return false;}
  if(/^[1-9]$/.test(k)){if(e.repeat)return true;const b=bs[+k-1];if(b){b.click();return true;}return false;}
  if(/^Arrow/.test(k)){let i=-1;bs.forEach((b,j)=>{if(b.classList.contains('gmg-kf'))i=j;});if(i<0)bs.forEach((b,j)=>{if(i<0&&b.classList.contains('green'))i=j;});if(i<0)i=0;
    i=(i+(k==='ArrowUp'||k==='ArrowLeft'?bs.length-1:1))%bs.length;bs.forEach(b=>b.classList.remove('gmg-kf'));bs[i].classList.add('gmg-kf');try{bs[i].focus({preventScroll:true});}catch(x){}return true;}
  return false;}
function veilKc(v){if(!isPC())return;veilBtns(v).forEach((b,i)=>{if(b.querySelector('.gmg-kn'))return;const l=b.classList.contains('green')?'Enter':b.hasAttribute('data-esc')?'Esc':String(i+1);
  b.insertAdjacentHTML('beforeend',' <kbd class="gmg-kc gmg-kn">'+escH(l)+'</kbd>');});}
window.addEventListener('keydown',e=>{const c=REG.cur;if(!c){perKey(e);return;}try{if(typeof unlockAudio==='function')unlockAudio();}catch(x){}e.stopPropagation();if(e.ctrlKey||e.metaKey||e.altKey)return;
  const v=c.root.querySelector('.gmg-veil');
  if(e.key==='Escape'){e.preventDefault();if(e.repeat)return;if(v){const b=v.querySelector('[data-esc]');if(b)b.click();}else c.qb.click();return;}
  if(isP(e.key)&&!e.repeat){if(v&&v.classList.contains('gmg-pz')){e.preventDefault();v.querySelector('.btn.green').click();return;}
    if(!v&&c.pause&&c.pause()){e.preventDefault();return;}}
  if(v){if(veilKey(v,e))e.preventDefault();return;}
  const it=c.root.querySelector('.gmg-intro');if(it&&(/^[1-9]$/.test(e.key)||/^Arrow/.test(e.key)||e.key===' '&&e.repeat)){e.preventDefault();return;}
  if(c.host.paused||e.repeat&&!/^Arrow/.test(e.key))return;for(const f of c.keys)try{if(f(e.key,e)){e.preventDefault();break;}}catch(x){console.error(x);}},true);
window.addEventListener('keyup',e=>{const c=REG.cur;if(!c)return;e.stopPropagation();for(const f of c.keysUp)try{if(f(e.key,e)){e.preventDefault();break;}}catch(x){console.error(x);}},true);

/* ---------- открыть игру. opt: {mode, ctx, seed, train, fast, back(res|null) — после итога/выхода, next:{t, f(res)} — главная кнопка итога, line — реплика итога} ---------- */
function open(id,opt){opt=opt||{};const i=infoOf(id);if(!i){toastT(T('Игра не найдена','Game not found'));return Promise.resolve(null);}
  if(REG.cur)close();
  const g0=REG.by[i.id];if(g0)return Promise.resolve(start(g0,opt));
  const w=wait(i);
  return loadGame(i.id).then(g=>{w.remove();return start(g,opt);}).catch(e=>{w.remove();console.warn('gmg load',i.id,e);
    toastT(T('Не загрузилось — проверьте интернет и попробуйте ещё раз','Could not load — check your connection and try again'));if(opt.back)opt.back(null);return null;});}
function toastT(t){try{if(typeof toast==='function')toast(t,4000);}catch(e){}}
function wait(i){const d=document.createElement('div');d.id='gmgWait';d.className='gmg-wait';d.innerHTML='<div><b>'+i.ic+'</b>'+escH(i.t)+'<br><small>'+T('Загружаю…','Loading…')+'</small></div>';
  document.body.appendChild(d);return d;}
function start(g,opt){const z=Z();let mode=opt.mode||'cab';if(mode==='day')mode='plan';const train=mode==='cab'||!!opt.train;
  const root=document.createElement('div');root.id='gmgHost';root.className='gmg gmg-'+g.id+(opt.fest?' gmg-fest-'+opt.fest.id:'');
  root.innerHTML='<div class="gmg-head"><span class="gmg-ic">'+g.ic+'</span><b class="gmg-nm">'+escH(g.t)+'</b><span class="gmg-top"></span>'+(isPC()?'<span class="gmg-khd">'+kc('Esc')+' '+T('выход','exit')+' '+kc('P')+' '+T('пауза','pause')+'</span>':'')+'<button class="gmg-xb" aria-label="'+T('Выйти','Exit')+'">✕</button></div><div class="gmg-el"></div>';
  document.body.appendChild(root);const el=root.querySelector('.gmg-el'),qb=root.querySelector('.gmg-xb'),top=root.querySelector('.gmg-top');
  const rs=[],qs=[],keys=[],keysUp=[],loops=[],offs=[];let fin=false,hold=false,raf=0,last=0,adUsed=false;
  const day=today(),seed=opt.seed!=null?opt.seed>>>0:(mode==='plan'||mode==='daily')?seedOf(g.id,day):(Math.random()*4294967296)>>>0;
  const dpr=Math.min(2,window.devicePixelRatio||1),rw=RW(),fest=opt.fest||festNow();
  const o={id:g.id,num:g.num,mode,train,seed,rnd:R(seed),day:+day,calm:CALMx(),lvl:lvl(),ctx:opt.ctx||{},rw:train?[0,0,0,0]:rw.c.slice(),fest};
  const isPaused=()=>hold||!!root.querySelector('.gmg-veil')||(typeof pauseWhy!=='undefined'&&pauseWhy&&pauseWhy.size>0)||document.hidden;
  function tick(t){raf=0;if(fin||REG.cur!==cur)return;const dt=Math.min(.05,last?(t-last)/1000:0);last=t;
    if(!isPaused())for(const f of loops)try{f(dt,t/1000);}catch(e){console.error(e);}
    if(loops.length)raf=requestAnimationFrame(tick);}
  const host={el,id:g.id,root,dpr,o,get w(){return el.clientWidth;},get h(){return el.clientHeight;},get paused(){return isPaused();},
    set hold(v){hold=!!v;},snd:typeof SND!=='undefined'?SND:{},pc:isPC(),calm:o.calm,fest,bot:null,art:ART,T,
    onResize(f){rs.push(f);},onQuit(f){qs.push(f);},keys(f){keys.push(f);},keysUp(f){keysUp.push(f);},kc,top(t){top.textContent=t==null?'':String(t);},
    say:sayH,face,whoName,esc:escH,
    intro(t){t=t||{};return new Promise(res=>{const d=document.createElement('div');d.className='gmg-intro';
      const ht=!t.text&&HG(g.id)?escH(hp(HG(g.id).intro,o.rnd)):'';
      d.innerHTML='<div class="gmg-panel">'+sayH(t.who||g.who,t.text||ht||escH(g.a),'happy')+(t.html||'')+(t.hint?'<p class="gmg-hint">'+t.hint+'</p>':'')+
        '<div class="gmg-btns"><button class="btn green">'+escH(t.btn||T('Начать','Start'))+(isPC()?' <kbd class="gmg-kc gmg-kn">Enter</kbd>':'')+'</button></div></div>';
      el.appendChild(d);let done=false;const go=()=>{if(done)return;done=true;try{SND.pick();}catch(e){}d.remove();const j=keys.indexOf(kf);if(j>=0)keys.splice(j,1);res();};
      const kf=k=>{if(k==='Enter'||k===' '){go();return true;}return false;};keys.unshift(kf);d.querySelector('button').onclick=go;
      if(opt.fast)setTimeout(go,0);});},
    cv(){const c=document.createElement('canvas');c.className='gmg-cv';el.appendChild(c);const r={cv:c,x:c.getContext('2d'),w:0,h:0,dpr};
      const fit=()=>{r.w=Math.max(1,el.clientWidth);r.h=Math.max(1,el.clientHeight);c.width=Math.round(r.w*dpr);c.height=Math.round(r.h*dpr);c.style.width=r.w+'px';c.style.height=r.h+'px';r.x.setTransform(dpr,0,0,dpr,0,0);};
      fit();rs.unshift(fit);return r;},
    loop(f){loops.push(f);last=0;if(!raf)raf=requestAnimationFrame(tick);},
    ptr(e,h){const pos=ev=>{const b=e.getBoundingClientRect();return [ev.clientX-b.left,ev.clientY-b.top];};let act=null;
      const dn=ev=>{if(fin||isPaused())return;act=ev.pointerId;try{e.setPointerCapture(ev.pointerId);}catch(x){}ev.preventDefault();const p=pos(ev);if(h.down)h.down(p[0],p[1],ev);},
        mv=ev=>{if(fin||isPaused())return;const p=pos(ev);if(h.move)h.move(p[0],p[1],ev);},
        up=ev=>{if(act!==ev.pointerId)return;act=null;if(fin)return;const p=pos(ev);if(h.up)h.up(p[0],p[1],ev);};
      e.addEventListener('pointerdown',dn);e.addEventListener('pointermove',mv);e.addEventListener('pointerup',up);e.addEventListener('pointercancel',up);e.style.touchAction='none';
      offs.push(()=>{e.removeEventListener('pointerdown',dn);e.removeEventListener('pointermove',mv);e.removeEventListener('pointerup',up);e.removeEventListener('pointercancel',up);});},
    mem(){const m=S.gmg.m;return ob(m[g.id])?m[g.id]:(m[g.id]={});},
    adOk(){try{return !adUsed&&typeof adOk==='function'&&adOk();}catch(e){return false;}},
    adNeed(kind){if(adUsed)return Promise.resolve(false);adUsed=true;return new Promise(res=>{let ok=false;const off=()=>{hold=false;root.classList.remove('gmg-adon');};
      try{STAT.place('mg_'+g.id+'_'+(kind||'x'));hold=true;root.classList.add('gmg-adon');
        showRewarded(()=>{off();if(!ok){ok=true;res(true);}},()=>{off();if(!ok){ok=true;adUsed=false;res(false);}},
          ()=>{off();if(!ok&&REG.cur&&REG.cur.host===host){ok=true;res(true);return T('помощь в игре','help in the game');}return '';});}catch(e){off();adUsed=false;res(false);}});},
    finish(r){if(fin)return;fin=true;stop();r=r||{};fin2(g,o,{score:r.sc!=null?r.sc:r.score,tier:r.st!=null?r.st:r.tier,h:r.h|0,label:r.label},opt);},
    quit(){if(!fin){fin=true;stop();}close();if(opt.back)opt.back(null);}};
  host.done=host.finish;
  function stop(){loops.length=0;if(raf)cancelAnimationFrame(raf);raf=0;for(const f of offs.splice(0))try{f();}catch(e){}keys.length=0;keysUp.length=0;}
  qb.onclick=()=>{try{SND.pick();}catch(e){}if(fin){close();if(opt.back)opt.back(null);return;}quitAsk();};
  function quitAsk(){if(root.querySelector('.gmg-veil'))return;const v=document.createElement('div');v.className='gmg-veil';
    v.innerHTML='<div class="gmg-panel"><h2>'+T('Выйти из игры?','Leave the game?')+'</h2><p>'+(train?T('Это тренировка — ничего не потеряете.','It’s just practice — you lose nothing.'):T('Заход не засчитается — сыграть можно будет снова.','This round won’t count — you can play again.'))+'</p>'+
      '<div class="gmg-btns"><button class="btn green">'+T('Продолжить','Continue')+'</button><button class="btn sec" data-esc="1">'+T('Выйти','Leave')+'</button></div></div>';
    root.appendChild(v);veilKc(v);const bs=v.querySelectorAll('button');bs[0].onclick=()=>{try{SND.pick();}catch(e){}v.remove();last=0;};
    bs[1].onclick=()=>{try{SND.pick();}catch(e){}stEv({a:'quit',id:g.id,m:mode,l:lvl(),s:Math.round((Date.now()-cur.t0)/1000)});host.quit();};}
  function pauseAsk(){if(fin||root.querySelector('.gmg-veil'))return false;const v=document.createElement('div');v.className='gmg-veil gmg-pz';
    v.innerHTML='<div class="gmg-panel"><h2>⏸ '+T('Пауза','Paused')+'</h2><p>'+T('Игра ждёт — продолжайте, когда будете готовы.','The game is waiting — carry on when ready.')+'</p>'+
      '<div class="gmg-btns"><button class="btn green" data-esc="1">'+T('Продолжить','Continue')+'</button><button class="btn sec">'+T('Выйти','Leave')+'</button></div></div>';
    root.appendChild(v);veilKc(v);const bs=v.querySelectorAll('button');bs[0].onclick=()=>{try{SND.pick();}catch(e){}v.remove();last=0;};
    bs[1].onclick=()=>{try{SND.pick();}catch(e){}v.remove();quitAsk();};return true;}
  const onRs=()=>{for(const f of rs)try{f(host.w,host.h);}catch(e){console.error(e);}};window.addEventListener('resize',onRs);
  const cur={id:g.id,g,host,o,opt,root,qb,keys,keysUp,qs,onRs,stop,pause:pauseAsk,t0:Date.now()};REG.cur=cur;
  document.documentElement.classList.add('gmg-open');
  try{if(typeof YG!=='undefined'&&YG.stop)YG.stop();}catch(e){}
  try{STAT.screen('mg_'+g.id);}catch(e){}stEv({a:'go',id:g.id,m:mode,l:lvl()});
  loadDeps(g).then(()=>{if(REG.cur!==cur)return;try{g.run(host,o);}catch(e){console.error(e);close();toastT(T('Игра не запустилась','The game failed to start'));if(opt.back)opt.back(null);}},
    e=>{console.warn('gmg deps',g.id,e);if(REG.cur!==cur)return;close();toastT(T('Не загрузилось — проверьте интернет и попробуйте ещё раз','Could not load — check your connection and try again'));if(opt.back)opt.back(null);});
  return host;}
function close(){const c=REG.cur;if(!c)return;REG.cur=null;try{c.stop();}catch(e){}for(const f of c.qs.splice(0))try{f();}catch(e){}window.removeEventListener('resize',c.onRs);c.root.remove();
  document.documentElement.classList.remove('gmg-open');
  try{const on=id=>{const e=$i(id);return e&&e.classList.contains('on');};STAT.screen(on('scr-game')?'game':GB.cur&&on('gb-'+GB.cur)?(GB.cur==='back'?'podsobka':'gb-'+GB.cur):'map');}catch(e){}}

/* ---------- итог: награды (монеты с потолком, благодарность в Книгу, Столик), рекорд → окно итога внутри оболочки ---------- */
function fin2(g,o,r,opt){const z=Z(),n=g.num,rw=RW();r.score=Math.max(0,Math.round(+r.score||0));r.tier=Math.max(0,Math.min(3,r.tier|0));
  const best=z.b[n]|0,rec=r.score>best&&best>0;if(r.score>best)z.b[n]=r.score;z.n[n]=(z.n[n]|0)+1;
  const out={coins:0,capped:false,thanks:null,thCap:false,tb:0,tbFull:false,paid:false,rec};
  const m=o.mode,plan=m==='plan'||m==='fest',dly=m==='daily',win=m==='win';
  const rewarded=!o.train&&(plan?!z.d.z:dly?!z.d.zv:!z.d.p[n])&&!(win&&z.d.pk>=rw.pk);
  if(rewarded&&r.tier>=1){if(plan)z.d.z=1;else if(dly)z.d.zv=1;else z.d.p[n]=1;out.paid=true;if(win)z.d.pk++;
    const want=rw.c[r.tier]||0,c=giveCoins(want,z,rw);out.capped=c<want;out.coins=c;
    if(plan||dly||r.tier>=rw.thPer){if(z.d.th>=rw.th)out.thCap=true;else{const t=giveThanks();if(t){z.d.th++;out.thanks=t;}}}
    if(r.tier===3&&(plan||dly)){if(z.d.tb>=rw.tb)out.tbDay=true;else if(z.tb>=rw.tbMax)out.tbFull=true;else{z.d.tb++;z.tb++;out.tb=1;}}
    if(plan)GB.safe('gmg-plan',()=>{if(window.GBPL&&typeof GBPL.mark==='function')GBPL.mark('mg');});}
  touch();sv();try{if(typeof updCoins==='function')updCoins();}catch(e){}
  const s=Math.round((Date.now()-((REG.cur&&REG.cur.t0)||Date.now()))/1000);
  stEv({a:'end',id:g.id,m,l:lvl(),sc:r.score,st:r.tier,s,c:out.coins});
  if(out.paid)stEv({a:'rw',id:g.id,m,c:out.coins,th:out.thanks?1:0,tb:out.tb,cap:out.capped||out.thCap?1:0});
  const c=REG.cur;if(c)for(const f of c.qs.splice(0))try{f();}catch(e){}
  try{if(GMG.onEnd)GMG.onEnd(g,o,r,out);}catch(e){}
  GB.emit('gmg',{a:'end',id:g.id,mode:m,tier:r.tier,out});GB.emit('mg',{id:g.id,st:r.tier,m,train:o.train?1:0,paid:out.paid?1:0});   /* LEAGUE: очки «Квартального плана» */if(out.paid)GB.safe('gmg-today',()=>GB.refresh());
  finUI(g,o,r,out,opt);}
function finUI(g,o,r,out,opt){const c=REG.cur;if(!c)return;const root=c.root;
  const head=r.tier===3?T('Как в аптеке!','Spot on!'):r.tier===2?T('Хорошо!','Good!'):r.tier===1?T('Неплохо!','Not bad!'):T('Ничего, бывает!','Never mind!');
  let st='';for(let i=1;i<=3;i++)st+='<span class="gmg-st'+(i<=r.tier?' on':'')+'" style="animation-delay:'+(i*.18)+'s">★</span>';
  const rw=[];if(out.coins)rw.push('<div class="gmg-rw c">+'+out.coins+' 💰</div>');
  if(out.thanks)rw.push('<div class="gmg-rw p">📖 '+T('Благодарность в «Книгу жалоб и предложений»','A thank-you in the Complaints and Suggestions Book')+(out.thanks&&out.thanks.t?': «'+escH(out.thanks.t)+'»':'')+'</div>');
  if(out.tb)rw.push('<div class="gmg-rw t">➕ '+T('«Столик» в запас (теперь '+S.gmg.tb+')','A spare “Table” (now '+S.gmg.tb+')')+'</div>');
  if(out.rec)rw.push('<div class="gmg-rw r">🏆 '+T('Новый рекорд!','New record!')+'</div>');
  const notes=[],rwN=RW();
  if(o.train)notes.push(T('Тренировка — без наград. Рекорд: ','Practice — no rewards. Record: ')+Math.max(r.score,S.gmg.b[g.num]|0));
  else if(!r.tier)notes.push(T('Награда — с первой звезды. Попробуйте ещё!','Rewards start at one star. Try again!'));
  else if(!out.paid)notes.push(o.mode==='win'&&Z().d.pk>=rwN.pk?T('Перерывов с наградой сегодня уже '+rwN.pk+' — это заход на рекорд.','You’ve had '+rwN.pk+' rewarded breaks today — this one is for the record.'):T('Награду за эту игру сегодня уже получили — это заход на рекорд.','You’ve already been rewarded for this game today — this one is for the record.'));
  else{if(out.capped)notes.push(T('Монеты мини-игр на сегодня собраны ('+rwN.cap+') — завтра ещё.','Mini-game coins for today are collected ('+rwN.cap+') — more tomorrow.'));
    if(out.thCap)notes.push(T('Благодарностей на сегодня хватит ('+rwN.th+' в день) — завтра ещё.','Enough thank-yous for today ('+rwN.th+' a day) — more tomorrow.'));
    else if(!out.thanks&&o.mode==='win'&&window.GBM&&GBM.thanks)notes.push(T('Благодарность в Книгу — за две звезды.','A thank-you in the Book takes two stars.'));
    if(out.tbFull)notes.push(T('Столиков в запасе и так '+rwN.tbMax+' — сначала потратьте.','You already have '+rwN.tbMax+' spare tables — use one first.'));}
  const hl=HG(g.id)&&hp(HG(g.id)['st'+r.tier]);
  const lines=g.lines||{},ln=opt.line||(r.tier>=2?lines.good:r.tier===1?lines.ok:lines.bad)||hl||(r.tier>=2?T('Вот это глазомер! Сразу видно — наш человек за прилавком.','What an eye! A natural behind the counter.'):r.tier===1?T('Неплохо! После перерыва рука набьётся.','Not bad! Your hand will get better after the break.'):T('Ничего, на следующем перерыве получится!','Never mind, next break it’ll work out!'));
  const nx=opt.next||null,v=document.createElement('div');v.className='gmg-veil gmg-res';
  v.innerHTML='<div class="gmg-panel">'+sayH(g.finWho||g.who,escH(typeof ln==='function'?ln(r):ln),r.tier?'happy':'norm')+
    '<h2>'+head+'</h2><div class="gmg-stars">'+st+'</div>'+(r.label?'<p class="gmg-sc">'+escH(r.label)+'</p>':'')+
    (rw.length?'<div class="gmg-rws">'+rw.join('')+'</div>':'')+notes.map(t=>'<p class="gmg-note">'+escH(t)+'</p>').join('')+
    '<div class="gmg-btns">'+(nx?'<button class="btn green" data-k="nx">'+escH(nx.t)+'</button>':'<button class="btn green" data-k="ok">'+T('Готово','Done')+'</button>')+
    '<button class="btn sec" data-k="again"'+(nx?'':' data-esc="1"')+'>↻ '+T('Ещё раз','Again')+(o.train||!out.paid?'':' <small>'+T('без награды','no reward')+'</small>')+'</button>'+(nx?'<button class="btn sec" data-k="ok" data-esc="1">'+T('Готово','Done')+'</button>':'')+'</div></div>';
  root.appendChild(v);veilKc(v);root.querySelector('.gmg-top').textContent='';
  try{if(r.tier===3)SND.win();if(out.coins)setTimeout(()=>{try{SND.coin();}catch(e){}},500);}catch(e){}
  const res={score:r.score,tier:r.tier,coins:out.coins,thanks:out.thanks,tb:out.tb};
  v.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{try{SND.pick();}catch(e){}const k=b.dataset.k;close();
    if(k==='again')open(g.id,{mode:'cab',train:true,back:opt.back,next:opt.next,ctx:opt.ctx});else if(k==='nx')nx.f(res);else if(opt.back)opt.back(res);});}

/* ---------- праздник: FEST кладёт GMG.festFn = () => ({id, t}) | null ---------- */
function festNow(){try{return GMG.festFn?GMG.festFn()||null:null;}catch(e){return null;}}

/* ---------- Затея дня ---------- */
function wday(){return new Date(now()).getDay();}
function weekNo(){return Math.floor((now()/864e5+3)/7);}
function zateyaSay(id){try{const H=window.GMG_HOSTS,z=H&&H.zateya;if(!z)return '';const w=wday(),e=z[String(w||7)];return e&&e[0]===id?e[1]:hp(H.zateyaAny,()=>0);}catch(e){return '';}}
function want(w){return w===2&&weekNo()%2?'pochem':WEEK[w];}   // Вт — Сдача / Почём? через неделю
function dayId(){const w=wday(),a=want(w);
  if(avail(a))return a;for(let i=1;i<7;i++){const id=want((w+i)%7);if(avail(id))return id;}
  const l=openList();return l.length?l[0].id:'';}
const DAY_SAY={4:T('Четверг — рыбный день! Выбросили рыбу — ловите, кильку не берите.','Thursday is fish day!')};

/* ---------- Перерыв: выбор игры (первая — Весы; дальше — открытая, в которую давно не играли) ---------- */
function perId(){const z=Z();if(avail('vesy')&&!(z.n[IDS.vesy]|0))return 'vesy';
  const L=openList().filter(g=>NOPER.indexOf(g.id)<0);if(!L.length)return '';
  L.sort((a,b)=>(z.d.p[a.num]|0)-(z.d.p[b.num]|0)||(z.n[a.num]|0)-(z.n[b.num]|0)||a.num-b.num);return L[0].id;}
/* Перерыв в «Кассе»: 5-й уровень каждого города (5, 15, 25…), первая победа, не задание дня/режим, не «занятое» окно (Ревизия, карточка, серия, межэкранная) */
function perDue(c){if(!c||c.daily||!c.first||c.busy||demo())return false;if(c.g&&c.g.mode)return false;
  if(((c.idx|0)%10)!==4)return false;if(!perId())return false;
  try{if(window.GBNB&&typeof GBNB.turn==='function'&&!GBNB.turn('mg',c))return false;}catch(e){}return true;}
function winOffer(c){if(!perDue(c))return null;const id=perId(),i=infoOf(id),rwd=Z().d.pk<RW().pk;
  return {id,t:'☕ '+T('На перерыв','Take a break')+' · '+i.s+T(' с',' s'),small:!rwd,go:()=>runPer(c,id)};}
function runPer(c,id){const z=Z();z.pc++;touch();sv();
  // «Касса» остаётся под игрой: после Перерыва «Дальше ▶» жмёт её же кнопку (межэкранная, Ревизия, гостинец — по прежним правилам)
  open(id,{mode:'win',fast:(z.pc<=3&&id==='vesy'),next:{t:T('Дальше ▶','Next ▶'),f:()=>{const b=$i('mNext');if(b&&document.body.contains(b))b.click();}},back:()=>{GB.safe('gmg-rew',rewin);}});}
function rewin(){const e=document.querySelector('#gbWin .gbs-gmg-per');if(e&&GMG._per)e.innerHTML=perHtml(GMG._per,true);}
const PER_SAY={vesy:T('Граждане, у меня перерыв! Пятнадцать минут — и я снова ваша. А вы пока — к весам.','Folks, I’m on my break!'),
  sdacha:T('Тётя Валя: «Перерыв! А сдачу кто считать будет? Вы!»','Break!'),pochem:T('Дед Митяй: «Перерыв? Тогда угадай, почём был батон!»','Break!'),
  steklo:T('Михалыч: «Пока перерыв — прими бутылки, а?»','Break!'),vybrosili:T('«Выбросили! Пока Валя на перерыве — налетай!»','Break!'),
  krainiy:T('«Кто крайний? Перерыв кончится — разберёмся!»','Break!'),otlichiya:T('Валерка: «Найдите, что на прилавке поменялось!»','Break!'),
  nakladnaya:T('Ревизор: «Перерыв — самое время сверить накладную».','Break!'),zakaz:T('Галя: «Пока перерыв — соберёте мне заказ?»','Break!'),
  kulek:T('Дед Семён: «Угадаешь, что в кульке? С 1974-го гадаю».','Break!'),piramida:T('Тётя Валя: «Перерыв — построим витрину из банок!»','Break!'),
  sklad:T('Дядя Коля: «В подсобке завал — подсоби на перерыве!»','Break!'),kot:T('Пломбир опять у колбасы! Шугните его, пока Валя на перерыве.','Break!'),
  avoska:T('Баба Зина: «Уложи мне авоську, милок, пока перерыв».','Break!')};
function perHtml(c,after){const id=c.pid,i=infoOf(id),z=Z(),rwd=z.d.pk<RW().pk||!!c.paid;
  if(after)return '<div class="gmg-pw done"><b>✓ '+T('Перерыв окончен','The break is over')+'</b> <span>'+escH(i.t)+' · '+T('рекорд','record')+' '+(z.b[i.num]|0)+'</span></div>';
  if(!rwd)return '<div class="gmg-pw small"><span class="gmg-pi">☕</span><span>'+T('Перерыв: ','Break: ')+escH(i.t)+' '+T('(без награды)','(no reward)')+'</span><button class="btn small noent" data-gmg="go">'+T('Играть','Play')+'</button></div>';
  const H=window.GMG_HOSTS||{},ph=(i.who==='valya'&&hp(H.peremena))||PER_SAY[id]||hp(H.peremena)||T('Перерыв! Пятнадцать минут — и снова за прилавок.','Break time!'),
    sign=(window.GBT&&GBT.say&&GB.safe('gbt',()=>GBT.say('mg.pereryv')))||(window.GMG_HOSTS&&hp(GMG_HOSTS.pereryv))||T('Перерыв 15 минут','15-minute break');
  return '<div class="gmg-pw" data-gmg="go" role="button" tabindex="0"><span class="gmg-pav">'+face(i.who,'happy')+'</span><span class="gmg-pt"><b class="gmg-sign"><i class="gmg-sl">'+escH(sign)+'</i><i class="gmg-ss">'+T('Перерыв','Break')+'</i></b>'+
    '<span>'+escH(ph)+'</span></span><button class="btn small noent" data-gmg="go">'+i.ic+' '+T('На перерыв','Take a break')+' · '+i.s+T(' с',' s')+kc('P')+'</button></div>';}
/* ПК: P/З в «Кассе» — на Перерыв (клавиша — пока окно открыто и игра не идёт) */
function perKey(e){if(e.ctrlKey||e.metaKey||e.altKey||e.repeat||!isP(e.key))return;const b=document.querySelector('#gbWin .gbs-gmg-per [data-gmg="go"]');
  if(!b||!b.offsetParent)return;const m=$i('modal');if(m&&!m.classList.contains('on'))return;e.preventDefault();e.stopPropagation();b.click();}

/* ---------- гнёзда: «Касса» (Перерыв, Завоз), дела «Плана», вкладка «Подсобка», плитка ПК ---------- */
GB.add(GB.winSlots,{id:'gmg-per',order:10,zone:'mg',   // без fit: Перерыв — шаг пути, его не прячем (прячется второстепенное)
  render(c){const mc=$i('mcard');if(mc)mc.classList.remove('gmg-per-on');if(!perDue(c))return '';const id=perId();c.pid=id;GMG._per=c;return perHtml(c);},
  mount(el,c){if(!c.pid)return;if(!c.shown){c.shown=1;stEv({a:'show',id:c.pid,m:'win',l:lvl()});}const mc=$i('mcard');if(mc&&Z().d.pk<RW().pk)mc.classList.add('gmg-per-on');
    el.querySelectorAll('[data-gmg="go"]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();try{SND.pick();}catch(e){}c.paid=Z().d.pk<RW().pk;runPer(c,c.pid);});}});
// Завоз — после задания дня (Толик привёз завоз): раз в день, одна раскладка на всех
function zavozDue(c){return !!(c&&c.daily&&!demo()&&avail('zavoz')&&!Z().d.zv);}
GB.add(GB.winSlots,{id:'gmg-zavoz',order:11,zone:'mg',
  render(c){if(!zavozDue(c))return '';return '<div class="gmg-pw" data-gmg="go" role="button" tabindex="0"><span class="gmg-pav">'+face('tolik','happy')+'</span><span class="gmg-pt"><b>🚚 '+T('Толик привёз завоз!','Tolik has brought a delivery!')+'</b><span>'+((window.GMG_HOSTS&&hp(GMG_HOSTS.zavoz))||T('Разгрузите ящики — полминуты, и магазин с товаром.','Unload the crates — half a minute.'))+'</span></span><button class="btn small noent" data-gmg="go">🚚 '+T('Разгрузить','Unload')+' · 30'+T(' с',' s')+kc('P')+'</button></div>';},
  mount(el,c){if(!zavozDue(c))return;if(!c.zshown){c.zshown=1;stEv({a:'show',id:'zavoz',m:'daily',l:lvl()});}
    el.querySelectorAll('[data-gmg="go"]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();try{SND.pick();}catch(e){}
      open('zavoz',{mode:'daily',back:()=>{const e=document.querySelector('#gbWin .gbs-gmg-zavoz');if(e&&Z().d.zv)e.innerHTML='<div class="gmg-pw done"><b>✓ '+T('Завоз разгружен','Delivery unloaded')+'</b></div>';}});});}});
// «План на сегодня» (рисует META): дело id 'mg' — Затея дня. off() — дела сейчас нет (игра не открыта/не загрузилась)
GB.add(GB.todayTasks,{id:'mg',order:40,ic:'☕',get t(){const id=dayId(),i=infoOf(id);return i?T('Игра дня: ','Today’s game: ')+i.t:T('Игра дня','Today’s game');},
  on:()=>!!dayId(),off:()=>!dayId(),done:()=>!!Z().d.z,
  go:()=>{const id=dayId();if(!id){podsobka();return;}stEv({a:'show',id,m:'plan',l:lvl()});open(id,{mode:'plan',back:()=>GB.refresh()});},
  hint:()=>{const id=dayId(),i=infoOf(id);return i?(zateyaSay(id)||(wday()===4&&id==='vybrosili'?DAY_SAY[4]:whoName(i.who)+T(' ждёт',' is waiting')))+T(' · благодарность в Книгу',' · a thank-you in the Book'):'';}});
// вкладка «Подсобка» (id back закреплён VIEW): точка — есть награда (Затея дня не сыграна)
const dot=()=>!!dayId()&&!Z().d.z;
GB.add(GB.navSlots,{id:'back',order:30,ic:'🚪',t:T('Подсобка','Back room'),on:()=>langOk()&&(lvl()>=5||openList().length>0),go:()=>podsobka(),dot});
// плитка «Подсобки» в правой колонке ПК (zone side; дверь в зале — VIEW зовёт GMG.podsobka(), значок — GMG.dot())
GB.add(GB.homeSlots,{id:'gmg-back',order:60,zone:'side',
  render(){if(!langOk()||(lvl()<5&&!openList().length))return '';const id=dayId(),i=infoOf(id),d=dot();
    return '<button class="gmg-tile" type="button"><span class="gmg-ti">🚪</span><span class="gmg-tt"><b>'+T('Подсобка','Back room')+'</b><small>'+(i?(d?T('Игра дня: ','Today: ')+escH(i.t):T('Игра дня сыграна ✓','Today’s game done ✓')):T('Посторонним вход воспрещён','Staff only'))+'</small></span>'+(d?'<i class="dot on"></i>':'')+'</button>';},
  mount(el){const b=el.querySelector('.gmg-tile');if(b)b.onclick=()=>{try{SND.pick();}catch(e){}podsobka();};}});
// «Подсобка» — экран GB.screen('back') (js/gb-podsobka.js — лениво)
GB.screen('back',{title:T('Подсобка','Back room'),render(el,op){try{STAT.screen('podsobka');}catch(e){}if(window.GBPOD){GBPOD.render(el,op);return;}
  el.innerHTML='<div class="gmg-wait" style="position:absolute"><div><b>🚪</b>'+T('Подсобка','Back room')+'<br><small>'+T('Загружаю…','Loading…')+'</small></div></div>';
  GB.load('js/gb-podsobka.js').then(()=>{if(GB.cur==='back'&&window.GBPOD)GBPOD.render(el,op);}).catch(()=>{toastT(T('Подсобка не загрузилась — попробуйте ещё раз','The back room failed to load — try again'));home();});}});
function podsobka(opt){stEv({a:'show',id:'back',m:'cab',l:lvl()});GB.go('back',opt||{});}
function home(){try{if(typeof openMap==='function')openMap();}catch(e){}}

/* ---------- «Столик» в запас: тратится в уровне вместо монет (обёртка useBoost; у Ревизии тоже можно) ---------- */
if(typeof window.useBoost==='function'){const ub=window.useBoost;window.useBoost=function(k){
  try{if(k==='table'&&S.gmg&&S.gmg.tb>0&&typeof G!=='undefined'&&G&&!G.over&&!G.table&&typeof doTable==='function'){
    S.gmg.tb--;touch();sv();try{STAT.use('table');}catch(e){}G.nTable=(G.nTable||0)+1;doTable();try{toast(T('➕ Столик из запаса (осталось '+S.gmg.tb+')','➕ Spare table (left: '+S.gmg.tb+')'));}catch(e){}
    stEv({a:'rw',id:'table',m:'use',c:S.gmg.tb});return;}}catch(e){console.warn('gmg table',e);}
  return ub.apply(this,arguments);};}

/* ---------- «Новая затея!» — окно, когда открылась новая игра (на главном, если нет других окон) ---------- */
let nwT=0,nwN=0;
function quiet(){const m=$i('modal');if(REG.cur||(m&&m.classList.contains('on')))return false;const on=id=>{const e=$i(id);return !!(e&&e.classList.contains('on'));};
  if(on('scr-game')||on('ad'))return false;return on('scr-map')||!!(GB.cur&&on('gb-'+GB.cur));}
// ждём «тихую» минуту: на главном/своём экране, без окна (гостинец, подарок — сначала они), не в игре; до 20 попыток раз в 3 с
function newOffer(again){clearTimeout(nwT);if(!again)nwN=0;nwT=setTimeout(()=>{const z=Z(),id=z.nw;if(!id||demo()||!langOk())return;
  let busy=!quiet();try{if(!busy&&window.GBNB&&typeof GBNB.turn==='function'&&!GBNB.turn('mgnew'))busy=true;}catch(e){}
  if(busy){if(++nwN<20)newOffer(true);return;}
  loadGame(id).then(()=>{if(!avail(id)||!quiet())return;const i=infoOf(id);z.s[i.num]=1;z.nw='';touch();sv();
    stEv({a:'show',id,m:'new',l:lvl()});
    modal('<div class="gmg-new"><h2>'+T('Новая игра в Подсобке!','Something new!')+'</h2>'+sayH(i.who,escH((HG(id)&&HG(id).new)||NEW_SAY[id]||i.a),'happy')+'<p class="gmg-nt"><b>'+i.ic+' '+escH(i.t)+'</b><br>'+escH(i.a)+'</p>'+
      '<div class="row"><button class="btn green" id="gmgNewGo">▶ '+T('Сыграть','Play')+'</button><button class="btn" id="mCancel">'+T('Потом','Later')+'</button></div></div>');
    $i('gmgNewGo').onclick=()=>{hideModal();try{SND.pick();}catch(e){}open(id,{mode:'new',back:()=>GB.refresh()});};
    $i('mCancel').onclick=()=>{hideModal();try{SND.pick();}catch(e){}stEv({a:'skip',id,m:'new'});};}).catch(()=>{});},1400);}
const NEW_SAY={sdacha:T('Тётя Валя: «Касса у нас без калькулятора — сдачу считаем в уме!»','Aunt Valya: “No calculator at our till!”'),
  pochem:T('Дед Митяй: «А ну-ка, почём был батон? Я-то помню!»','Grandpa Mityai: “How much was a loaf? I remember!”'),
  steklo:T('Михалыч: «Бутылки сдаю! Только наши принимай — молочные да лимонадные».','Mikhalych: “Returning bottles!”'),
  avoska:T('Баба Зина: «Уложи авоську с умом: яйца сверху, банки на дно!»','Granny Zina: “Pack my string bag!”'),
  vybrosili:T('«Выбросили! Мандарины выбросили!» Ловите дефицит — нагрузку не берите.','“They’ve put out tangerines!”'),
  krainiy:T('«Кто крайний?» — «Я за мужчиной в шляпе!» Расставьте очередь.','“Who’s last in line?”'),
  otlichiya:T('Валерка: «Утром на прилавке одно, вечером — другое. Найдёте?»','Valerka: “Spot the difference!”'),
  nakladnaya:T('Ревизор: «Накладная — документ строгий. Сверим?»','The inspector: “Let’s check the invoice.”'),
  zakaz:T('Галя с третьего: «Заказ на праздник! Запоминайте — диктую».','Galya: “A holiday order!”'),
  kulek:T('Дед Семён: «Что в кульке? Угадаешь с первой подсказки?»','Grandpa Semyon: “What’s in the bag?”'),
  zavoz:T('Толик: «Завоз приехал! После задания дня — разгружаем».','Tolik: “Delivery’s here!”'),
  piramida:T('Тётя Валя: «Построим витрину из банок, как в лучших домах!»','Aunt Valya: “Let’s build a can pyramid!”'),
  sklad:T('Дядя Коля: «В подсобке не повернуться. Расставим ящики?»','Uncle Kolya: “Let’s sort the crates.”'),
  kot:T('Пломбир опять у докторской! Шугните его, только покупателя не задевайте.','Plombir is at the sausage again!')};

/* ---------- ход игры: открытие по уровням (после победы), по дням (на главном), подгрузка ---------- */
GB.levelHook.push(i=>{if(!i||i.r!=='win'||i.daily||i.mode)return;GB.safe('gmg-unlock',()=>unlock(true,i.first?i.l:0));if(lvl()>=3)preload();});
GB.on('home',()=>{GB.safe('gmg-home',()=>{unlock(false);newOffer();});});
GB.on('screen',id=>{if(id==='scr-map')GB.safe('gmg-home',()=>{if(Z().nw)newOffer();});});
const loadH=()=>window.GMG_HOSTS?Promise.resolve():GB.load('js/gmg-hosts-data.js').catch(()=>{});
GB.on('ready',()=>{Z();setTimeout(()=>{GB.safe('gmg-start',()=>{loadH();preload();if(unlock(false)||Z().nw)newOffer();});},2500);});

/* ---------- стенд ?gmg=<id> ---------- */
function stand(){const q=new URLSearchParams(location.search),id=q.get('gmg');if(!id)return;window.__gmgStand=1;
  if(q.get('fresh')==='1'){S.gmg=zNew();}gmgFix(S);
  const go=()=>{try{if(typeof hideModal==='function')hideModal();}catch(e){}
    if(id==='list'){const h='<h2>'+T('Мини-игры','Mini-games')+'</h2><p class="gmg-list">'+Object.keys(INFO).map(n=>{const i=INFO[n];return '<a href="?gmg='+i.id+'">'+n+'. '+i.ic+' '+escH(i.t)+'</a>';}).join('<br>')+'</p><div class="row"><button class="btn" id="mCancel">OK</button></div>';
      if(typeof modal==='function'){modal(h);const b=$i('mCancel');if(b)b.onclick=hideModal;}return;}
    if(id==='back'){podsobka();return;}
    if(GMG.stand[id]){GMG.stand[id](q);return;}
    if(!infoOf(id)){toastT('?gmg='+id+': нет такой игры');return;}
    const op={mode:q.get('mode')||'cab',back:()=>{}};if(q.get('seed')!=null)op.seed=+q.get('seed');
    if(op.mode==='fest')op.fest={id:q.get('fest')||'halloween',t:T('Праздник','Holiday')};
    open(id,op);};
  setTimeout(go,300);}
GB.on('ready',()=>GB.safe('gmg-stand',stand));

/* ---------- бот: GMG.bot('vesy') — sim по 200 зёрнам; GMG.autoplay(k) — пройти открытую игру ходами host.bot ---------- */
function bot(id,n){const g=REG.by[id];if(!g||!g.sim)return null;n=n||200;const out={};
  for(const [nm,k] of[['плохой',.35],['средний',.6],['хороший',.85]]){let s=0,er=0;const t=[0,0,0,0];
    for(let i=0;i<n;i++){const seed=seedOf(id,20261000+i);let r=null;try{r=g.sim({id,seed,rnd:R(seed),mode:'cab',lvl:60,calm:false},k);}catch(e){er++;continue;}
      if(!r){er++;continue;}const sc=r.sc!=null?r.sc:r.score,st=r.st!=null?r.st:r.tier;if(!(sc>=0)||!(st>=0&&st<=3)){er++;continue;}s+=sc;t[st]++;}
    out[nm]={sc:+(s/n).toFixed(1),st:t.map(x=>Math.round(x/n*100)+'%').join(' / '),err:er};}
  return out;}
function autoplay(k,ms){k=k==null?.85:k;return new Promise(res=>{let n=0;const step=()=>{const c=REG.cur;if(!c){res('closed');return;}
  const it=c.root.querySelector('.gmg-intro button');if(it){it.click();return setTimeout(step,ms||120);}
  if(c.root.querySelector('.gmg-res')){res('done');return;}
  if(++n>900){res('stuck');return;}try{if(c.host.bot)c.host.bot(k);}catch(e){console.error(e);}setTimeout(step,ms||120);};step();});}

/* ---------- наружу ---------- */
window.GMG_REG=GMG_REG;
const GMG=window.GMG={hosts:HG,hp,zateyaSay,INFO,IDS,RW,GMG_RW,WEEK,REG,faces:FACES,stand:{},festFn:null,enOk:false,_per:null,art:ART,
  open,close,load:loadGame,preload,Z,touch,fix:gmgFix,merge:gmgMerge,fresh:zNew,isOpen,avail,unlock,lockTxt,openList,dayId,perId,perDue,
  winOffer,podsobka,home,dot,seed:seedOf,rng:R,pc:isPC,kc,say:sayH,face,whoName,esc:escH,T,bot,autoplay,ev:stEv,info:infoOf,
  get cur(){return REG.cur;},get busy(){return !!REG.cur;}};
})();
