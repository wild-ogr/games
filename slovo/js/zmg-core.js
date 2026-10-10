'use strict';
/* zb-MG0 «Перемена» — оболочка мини-игр «Школы бабы Зины» (js/zmg-core.js). Форк vymg-core «Выезда» (10.10.2026).
   План: hobby-analytics/release-i/zina-boost/05-minigames.md, 00-plan.md п.4. Журнал: zina-boost/logs/MG0.md. Наружу — только ZMG_REG, window.ZMG.

   ===================== ДОГОВОР ДЛЯ ИГР (MGA / MGB / MGC) =====================
   Файл игры — js/zmg-<id>.js (данные — js/zmg-<id>-data.js), весь код в IIFE, первой строкой: if(typeof ZMG_REG!=='function')return;
   В index.html строк игр НЕТ: оболочка грузит файл сама (ZB.load) — при первом заходе в игру или заранее, когда игра открыта.
   Свои имена и CSS-классы — с префиксом потока: zma- (MGA), zmb- (MGB), zmc- (MGC), zm0- (MG0). Глобальных имён не заводить.
   Регистрация:  ZMG_REG({id:'diktant', run(host,o){…}, deps?:['krug','js/zmg-diktant-data.js'], sim?(o,k)=>({sc,st}), open?()=>bool, bot?})
     id — из таблицы ZMG.INFO ниже (номер n, название t, ведущий who, значок ic, правило a, длительность s — задаёт оболочка; можно переопределить).
     deps — что загрузить ДО run: 'krug' (круг букв js/zmg-krug.js) и/или пути к своим файлам данных. Не загрузилось — игра не стартует, тост.
     open() — необязательно: false, если игра сейчас недоступна (нет данных, не сезон).
     sim(o,k) — бот баланса: k = умение 0..1 → {sc, st}. ZMG.bot('<id>') — по 200 зёрнам.
     finWho — кто говорит реплику итога (по умолчанию ведущий who); lines:{good,ok,bad} — свои реплики итога (строка или fn(r)).
   run(host,o) рисует ТОЛЬКО внутри host.el (шапку со значком, названием, host.top и ✕ рисует оболочка).
     Игра 30–60 с (Вечерка и Лото — до 2 мин); одно нажатие до начала (host.intro); без таймера-гонки; ошибка не наказывает;
     кнопки ≥ 48–56 px, шрифт ≥ 17 px; на ПК — клавиатура (буквы, Enter, Backspace, 1–4).
     host.el — div во всю ширину под шапкой; host.w / host.h — размеры; host.dpr — плотность (≤2).
     host.intro({text, html?, hint?, btn?, who?}) → Promise — карточка «одно нажатие до начала» (реплика ведущего + «Начать»; Enter/Пробел).
     host.krug(el, {letters, onWord(w)→'ok'|'bad'|'dup'|true|false, size?, shuffle?}) → круг букв Зины (свайп + нажатия + клавиатура ПК), нужен deps:['krug'].
     host.words({min,max,n,def,rnd,not}) → слова (существительные) только из пройденных уровней, без ZINA_DENY/ZINA_RUDE, перемешаны o.rnd.
       def:true — только с толкованием. host.def(w) — толкование (gloss) или шутка Зины (defs); host.joke(w) — шутка или ''.
     host.cv() → {cv,x,w,h,dpr} холст во весь host.el; host.loop(fn(dt,t)) — кадры (на паузе не зовётся); host.ptr(elem,{down,move,up}) — касания/мышь.
     host.keys(fn(key,e)) — клавиши ПК (true — съедена; Esc — оболочка); host.kc(lbl) — значок клавиши; host.pc — есть мышь; host.calm — спокойный режим.
     host.onResize(fn(w,h)); host.onQuit(fn) — убрать свои таймеры (loop/ptr/keys оболочка снимает сама).
     host.top(text) — строка справа в шапке («3 из 10»); host.say(who,text,mood) → HTML реплики; host.face(who,mood) → SVG-портрет.
       who: zina yat valerka valya mityai galya semyon lyusya tamara nina vp tolik kolya (ZBP — справочник CAB; пока его нет — свои портреты);
       mood: norm|happy|sad|wow.
     host.snd — звуки игры (SND.tap coin bad win old open letter word bonus meow) — сами молчат при выключенном звуке.
     host.adNeed(kind) → Promise<bool> — ролик «по нужде»: ОДИН за заход (второй — сразу false), кнопку показывать только при host.adOk(),
       классами `zbad zmg-ad` (гаснет вместе с остальными «за рекламу» — просьба TECH: .zbad в AD_BTN_SEL); поздний досмотр (adt) засчитывается, пока игра на экране. Место STAT — mg_<id>_<kind>.
     host.fest — тема праздника или null: {id:'halloween'|'ny'|'autumn'|…, t:'Страшилки'} (даёт FEST через ZMG.festFn) — «шкурка» игры.
     host.finish({sc, st:0..3, h?:подсказок/ошибок, label?:'8 из 10'}) — конец захода: итог, награды, рекорд рисует ОБОЛОЧКА. (host.done — то же.)
     host.quit() — выйти без итога; host.paused — пауза; host.mem() → свой склад S.zmg.m[<id>] (≤ 1 КБ, числа/строки).
     host.bot = fn(k) — необязательно: один ход бота (k 0..1) для стенда ZMG.autoplay(k).
   o = {id, num, mode, train, seed, rnd, day, calm, lvl, ctx, rw, note, fest}
     mode — откуда пришёл: 'win' (Перемена в окне победы), 'day' (Затея дня — одна раскладка на всех), 'paper' (Вечерка после задания дня),
       'cab' (Красный уголок — тренировка без наград), 'new' (окно «Новая затея!»), 'fest' (праздник); train — без наград;
     seed — зерно ('day'/'paper' — одно на всех в этот день); rnd() — 0..1 от seed; day — todayKey() (число ГГГГММДД); lvl — пройдено уровней;
     rw — монеты по ступени [0,4,7,10] (0 в тренировке); note — {iss, k, t} следующая заметка стенгазеты (для строки «за заметку №7»).
   Награды считает ОБОЛОЧКА (числа — ZBECO.mg/cap.mg, монеты — ZBECO.give('mg'); запасные — ZMG_RW): монеты 4/7/10 (Вечерка — 10), ≤ 20 💰 в день от всех игр (earn 'mg');
     заметка стенгазеты: Затея дня ≥1★, Вечерка ≥1★, Перемена 2★+ — не больше 2 в день; 💡 в запас (hbAdd) за 3★ без подсказок в Затее дня или Вечерке — ≤1 в день.
     Перемен с наградой ≤ 3 в день. Награда за игру — раз в день (повтор — на рекорд). Тренировка — без наград.
   Сохранение: своих полей в S игра не заводит — только host.mem().
   Вид (css/zmg.css): .zmg-card (листок), .zmg-q (крупный текст), .zmg-opts > .zmg-opt (.ok/.no/.sel) — варианты ≥ 56 px, .zmg-hint (строка «на компьютере…»),
     .zmg-dots > i (.ok/.no/.cur), .btn / .btn.green — кнопки игры, .zmg-red — красная ручка учительницы.
   Стенд: ?zmg=<id>&mode=win|day|cab|paper|fest|new&seed=N&fresh=1 (чистое S.zmg) — игра сразу на весь экран; ?zmg=list — список; ?zmg=ugolok — Красный уголок.
     В консоли: ZMG.bot('<id>'), ZMG.autoplay(k) — пройти открытую игру ботом (нужен host.bot).
   STAT: ev 'mg' {a:'open'|'show'|'go'|'end'|'quit'|'skip'|'rw', id, m:вход, l:уровень, sc, st, s:секунд, h, c:монет, nt:заметка, hb, cap:1, tr} — пишет оболочка;
     ev 'note' {iss, n}; монеты — addCoins(n,'mg').
   Сохранение S.zmg (владелец — MG0, через ZB.onSave): {o:{id:1} открыта, s:{id:1} «Новая затея» показана, b:{id:рекорд}, n:{id:заходов},
     d:{k:день, c:монет сегодня, nt:заметок сегодня, hb:💡 сегодня, pk:Перемен с наградой, p:{id:1} награда за игру сегодня, z:Затея дня, v:Вечерка},
     dp:дней игры, dl:последний день, ol:уровень последнего открытия, od:день открытия по дням, nw:ожидает окна «Новая затея», pc:Перемен показано,
     np:заметок всего, iss:{номер:1} выпуск собран (приз выдан), m:{id:{…}}, ts}
   ВЫКЛЮЧЕНИЕ: ZMG_ON=false — весь модуль молчит (игра как раньше); ZMG_OFF=['lovit',…] — эти игры не открываются и не предлагаются.
   ==========================================================================================================================================================*/
(function(){
const ZMG_ON=true;                 // весь модуль мини-игр (false — игра как без буста)
const ZMG_OFF=[];                  // выключенные игры (не готовы к отсечке 19.10): id
if(!ZMG_ON||typeof S==='undefined'||typeof todayKey!=='function'||typeof ZB==='undefined')return;
const escH=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const $i=id=>document.getElementById(id);
const pl=(n,a,b,c)=>typeof plural==='function'?plural(n,a,b,c):c;
// стили — свой файл (index.html не трогаем)
(function(){if(document.querySelector('link[data-zmg]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='css/zmg.css';l.setAttribute('data-zmg','1');document.head.appendChild(l);})();

/* ---------- 15 игр: номер → id, название, ведущий, значок, правило, длительность (с), открытие ----------
   lv — открывается после стольких пройденных уровней; dp — на такой день игры (и не раньше 5-го уровня). Не больше одной новой за победу / за день. */
const INFO={
  1:{id:'diktant',t:'Диктант Валерки',who:'valerka',ic:'✍️',a:'Валерка написал диктант. Выбери верную букву — проверим красной ручкой!',s:30,lv:5},
  2:{id:'splet',t:'Сплетня Гали',who:'galya',ic:'🗣',a:'Галя торопится и путает буквы — собери слово из сплетни',s:45,lv:15},
  3:{id:'slova',t:'Слово из слова',who:'zina',ic:'🧩',a:'Набери из букв длинного слова как можно больше слов',s:60,dp:2},
  4:{id:'vecherka',t:'«Вечерка»',who:'lyusya',ic:'📰',a:'Люся принесла газету — разгадай кроссворд дня',s:90,lv:10},
  5:{id:'baraban',t:'Барабан у бабы Зины',who:'zina',ic:'🎡',a:'Крути барабан и называй буквы — угадай слово',s:60,dp:7},
  6:{id:'lishnee',t:'Что лишнее?',who:'zina',ic:'🤔',a:'Четыре слова — одно не из той компании',s:40,dp:3},
  7:{id:'pogovorka',t:'Собери поговорку',who:'nina',ic:'📜',a:'Нина Аркадьевна начала поговорку — закончи её',s:45,lv:35},
  8:{id:'zagadki',t:'Загадки деда Семёна',who:'semyon',ic:'❓',a:'Угадай слово по подсказкам — чем раньше, тем больше очков',s:45,dp:4},
  9:{id:'opechatki',t:'Кот Ять наследил',who:'yat',ic:'🐾',a:'Ять прошёлся по объявлению — найди опечатки',s:45,dp:9},
  10:{id:'telegramma',t:'Телеграмма от внука',who:'lyusya',ic:'✉️',a:'Вставь выпавшие слова в телеграмму',s:45,dp:11},
  11:{id:'recept',t:'Рецепт тёти Вали',who:'valya',ic:'🥧',a:'Тётя Валя диктует рецепт — собери продукты из букв',s:60,dp:17},
  12:{id:'loto',t:'Лото во дворе',who:'mityai',ic:'🎱',a:'Митяй кричит бочонки загадками — закрой ряд',s:90,dp:21},
  13:{id:'filword',t:'Филворд на лавочке',who:'tamara',ic:'🔤',a:'Найди спрятанные слова в поле букв',s:60,dp:14},
  14:{id:'pary',t:'Пары: слово и толкование',who:'vp',ic:'🃏',a:'Найди пары: слово и его толкование',s:45,lv:25},
  15:{id:'lovit',t:'Ять ловит буквы',who:'yat',ic:'🐈',a:'Лови буквы слова по порядку — лапой!',s:30,dp:5}};
const IDS={};for(const n in INFO){INFO[n].num=+n;IDS[INFO[n].id]=+n;}
const infoOf=id=>INFO[IDS[id]]||INFO[id]||null;
/* Затея дня по дням недели (0 — Вс): Пн Что лишнее, Вт Загадки, Ср Слово из слова, Чт Ять ловит, Пт Барабан, Сб Филворд, Вс Лото; закрыта — ближайшая открытая */
const WEEK=['loto','lishnee','zagadki','slova','lovit','baraban','filword'];
const NOPER=['vecherka','loto'];   // в Перемену не идут (Вечерка — после задания дня; Лото — длинное, только Затея дня/уголок)
/* ---------- награды (числа — ZBECO.mg от ECO; здесь — запасные, если ECO не загрузился) ---------- */
const ZMG_RW={c:[0,4,7,10],paper:10,cap:20,nt:2,hb:1,pk:3,ntPer:2,issue:{hb:2,c:30}};
/* ZBECO (ECO 0075ca0): mg{st,vech,notesDay,notesIssue,issues,hbDay,adPerRun,peremenaDay}, cap.mg, give('mg',n) — читаем в момент вызова */
function RW(){const E=window.ZBECO,m=E&&E.mg;if(!m||typeof m!=='object')return ZMG_RW;const r=Object.assign({},ZMG_RW);
  if(Array.isArray(m.st))r.c=m.st.slice();if(m.vech>=0)r.paper=m.vech;if(m.notesDay>=0)r.nt=m.notesDay;if(m.hbDay>=0)r.hb=m.hbDay;if(m.peremenaDay>=0)r.pk=m.peremenaDay;
  if(E.cap&&E.cap.mg>=0)r.cap=E.cap.mg;if(m.issuePrize&&typeof m.issuePrize==='object')r.issue=m.issuePrize;return r;}
/* монеты: через ZBECO.give('mg') (потолок дня и STAT earn — у ECO), без ECO — свой потолок */
function giveCoins(want,z,rw,id){if(want<=0)return 0;const E=window.ZBECO;
  if(E&&typeof E.give==='function'){const k=E.give('mg',want,'mg')|0;z.d.c+=k;return k;}
  const c=Math.max(0,Math.min(want,rw.cap-z.d.c));if(c>0){z.d.c+=c;try{if(typeof addCoins==='function')addCoins(c,'mg');else S.coins=(+S.coins||0)+c;}catch(e){}}return c;}
/* стенгазета: 12 выпусков × 10 заметок (тексты — js/zmg-ugolok-data.js; здесь — только названия выпусков) */
const ISSUES=['Здравствуй, школа!','Золотая осень','Страшилки пионерлагеря','Первый снег','Новогодний утренник','Зимние каникулы',
  'Мальчики, к доске!','Мамин праздник','Весенняя капель','Все на субботник!','Последний звонок','Выпускной'];
const PER_ISS=10;
const noteAt=t=>{const i=Math.floor(t/PER_ISS);return i>=ISSUES.length?{iss:ISSUES.length,k:0,t:'',done:true}:{iss:i+1,k:t%PER_ISS+1,t:ISSUES[i],done:false};};

const REG={by:{},list:[],cur:null};
function ZMG_REG(g){if(!g||!g.id||typeof g.run!=='function')return;const i=infoOf(g.id);if(!i){console.warn('zmg: нет такого id',g.id);return;}
  if(REG.by[g.id])return;g.num=i.num;g.t=g.t||g.n||i.t;g.n=g.t;g.who=g.who||i.who;g.ic=g.ic||i.ic;g.a=g.a||i.a;g.s=g.s||i.s;
  REG.by[g.id]=g;REG.list.push(g);REG.list.sort((a,b)=>a.num-b.num);try{if(ZMG.onReg)ZMG.onReg(g);}catch(e){}}

/* ---------- сохранение S.zmg ---------- */
const ob=v=>!!v&&typeof v==='object'&&!Array.isArray(v),nn=v=>Math.max(0,(+v|0)||0);
function zNew(){return {o:{},s:{},b:{},n:{},d:{k:0,c:0,nt:0,hb:0,pk:0,p:{},z:0,v:0},dp:0,dl:0,ol:0,od:0,nw:'',pc:0,np:0,iss:{},m:{},ts:0};}
function zFixO(z){const d=zNew();for(const k in d)if(!(k in z))z[k]=d[k];
  for(const k of['o','s','b','n','m','iss'])if(!ob(z[k]))z[k]={};
  for(const k of['b','n'])for(const i in z[k])z[k][i]=nn(z[k][i]);for(const k of['o','s','iss'])for(const i in z[k])z[k][i]=z[k][i]?1:0;
  for(const i in z.m)if(!ob(z.m[i]))delete z.m[i];
  for(const k of['dp','dl','ol','od','pc','np'])z[k]=nn(z[k]);z.np=Math.min(ISSUES.length*PER_ISS,z.np);z.ts=+z.ts||0;z.nw=typeof z.nw==='string'&&infoOf(z.nw)?z.nw:'';
  if(!ob(z.d))z.d=d.d;for(const k of['k','c','nt','hb','pk'])z.d[k]=nn(z.d[k]);z.d.z=z.d.z?1:0;z.d.v=z.d.v?1:0;
  if(!ob(z.d.p))z.d.p={};for(const i in z.d.p)z.d.p[i]=z.d.p[i]?1:0;
  return z;}
function zmgFix(s){s=s||S;try{if(!ob(s.zmg))s.zmg=zNew();zFixO(s.zmg);}catch(e){console.warn('zmg fix',e);s.zmg=zNew();}}
/* облако: открытое/виденное/выпуски — объединение; рекорды, заходы, дни, заметки — максимум (без дублей: заметки — счётчик по порядку);
   сегодняшний день — свежий (тот же — максимум); склады игр и «ожидает окна» — из более нового */
function zmgMerge(a,b){if(!ob(b))return a;b=zFixO(JSON.parse(JSON.stringify(b)));if(!ob(a))return b;a=zFixO(a);const bn=b.ts>a.ts;
  for(const k of['o','s','iss'])for(const i in b[k])if(b[k][i])a[k][i]=1;
  for(const k of['b','n'])for(const i in b[k])a[k][i]=Math.max(a[k][i]|0,b[k][i]|0);
  for(const k of['dp','dl','ol','od','pc','np'])a[k]=Math.max(a[k],b[k]);
  if(b.d.k>a.d.k)a.d=b.d;else if(b.d.k===a.d.k){for(const k of['c','nt','hb','pk','z','v'])a.d[k]=Math.max(a.d[k],b.d[k]);for(const i in b.d.p)if(b.d.p[i])a.d.p[i]=1;}
  if(bn){a.m=b.m;a.nw=b.nw;}else for(const i in b.m)if(!(i in a.m))a.m[i]=b.m[i];
  if(a.nw&&a.s[a.nw])a.nw='';a.ts=Math.max(a.ts,b.ts);return a;}
ZB.onSave({id:'zmg',keys:['zmg'],fix:s=>zmgFix(s),
  merge:(s,d)=>{try{s.zmg=ob(s.zmg)?zmgMerge(s.zmg,ob(d)?d.zmg:null):ob(d)&&ob(d.zmg)?zFixO(JSON.parse(JSON.stringify(d.zmg))):zNew();}catch(e){console.warn('zmg merge',e);}}});
zmgFix(S);
function today(){return todayKey();}
/* фразы ведущих (TEXT: content/texts/hosts.json → js/zmg-hosts-data.js, лениво): ZMG_HOSTS {games:{id:{intro,st3..st0,new}}, peremena, zateya{1..7:[id,фраза]}, paper} */
const HG=id=>{const h=window.ZMG_HOSTS;return h&&h.games&&h.games[id]||null;};
function hp(a,rnd){if(!a)return '';if(typeof a==='string')return a;return a.length?a[Math.floor((rnd||Math.random)()*a.length)%a.length]:'';}
function hsub(t,c){return String(t||'').replace(/\{(\w+)\|([^|}]*)\|([^|}]*)\|([^|}]*)\}/g,(m,k,a,b,d)=>{const n=+(c&&c[k])||0;return n+' '+pl(n,a,b,d);}).replace(/\{(\w+)\}/g,(m,k)=>c&&c[k]!=null?c[k]:'');}
function Z(){const z=S.zmg||(zmgFix(S),S.zmg),k=today();if(z.d.k!==k){z.d={k,c:0,nt:0,hb:0,pk:0,p:{},z:0,v:0};if(z.dl!==k){z.dp++;z.dl=k;}}return z;}
function touch(){S.zmg.ts=typeof nowMs==='function'?nowMs():Date.now();}
const lvl=()=>Math.max(0,+S.lv||0);
function stEv(p){try{STAT.ev('mg',p);}catch(e){}}
const SHOTM=()=>typeof SHOT!=='undefined'&&SHOT;

/* ---------- подгрузка игр (лениво) ---------- */
const FILE=id=>'js/zmg-'+id+'.js',DEP={krug:'js/zmg-krug.js'};
const bad={};   // не загрузилось в этом сеансе
function loadGame(id){if(REG.by[id])return Promise.resolve(REG.by[id]);if(ZMG_OFF.indexOf(id)>=0)return Promise.reject(new Error('off'));
  return ZB.load(FILE(id)).then(()=>{if(!REG.by[id])throw new Error('no reg '+id);return REG.by[id];}).catch(e=>{bad[id]=1;throw e;});}
function loadDeps(g){const L=(g.deps||[]).map(d=>DEP[d]||d);return Promise.all(L.map(u=>ZB.load(u)));}
// заранее (в тишине): открытые игры и ближайшая (Диктант с 3-го уровня), чтобы Перемена и Затея дня предлагали только то, что точно есть
function preload(){const z=Z(),want=[];for(const n in INFO){const i=INFO[n];if(ZMG_OFF.indexOf(i.id)>=0||REG.by[i.id]||bad[i.id])continue;
    if(z.o[n]||(i.id==='diktant'&&lvl()>=3))want.push(i.id);}
  let p=Promise.resolve();want.forEach(id=>{p=p.then(()=>loadGame(id).catch(()=>{}));});return p;}

/* ---------- открытие игр по прогрессу ---------- */
function gOk(g){try{return !g.open||g.open()!==false;}catch(e){return false;}}
const isOff=id=>ZMG_OFF.indexOf(id)>=0;
function due(n){const i=INFO[n];if(!i||isOff(i.id))return false;const z=Z(),l=lvl();return i.lv?l>=i.lv:(!!i.dp&&l>=5&&z.dp>=i.dp);}
const isOpen=id=>{const i=infoOf(id);return !!(i&&!isOff(i.id)&&S.zmg&&S.zmg.o[i.num]);};
const avail=id=>isOpen(id)&&!!REG.by[id]&&gOk(REG.by[id]);
let sesDay=0;   // в этом сеансе уже открыли игру по дням
/* открыть следующую (одну): по уровням — одна за победу, по дням — одна за сеанс и день. Вернёт id или '' */
function unlock(byLevel){const z=Z(),l=lvl();
  for(let n=1;n<=15;n++){if(z.o[n]||!due(n))continue;const i=INFO[n];
    if(i.lv){if(!byLevel||z.ol>=l)continue;z.o[n]=1;z.ol=l;}
    else{if(sesDay||z.od===z.d.k)continue;z.o[n]=1;z.od=z.d.k;sesDay=1;}
    if(!z.s[n]&&!(i.id==='diktant'))z.nw=i.id;   // Диктант представляет сама Перемена
    touch();save();stEv({a:'open',id:i.id,l});loadGame(i.id).catch(()=>{});return i.id;}
  return '';}
function lockTxt(id){const i=infoOf(id),z=Z(),l=lvl();if(!i)return '';if(isOff(i.id))return 'скоро не будет — выключена';
  if(i.lv){const a=i.lv-l;return a>0?'после '+i.lv+'-го уровня':'после следующей победы';}
  if(l<5)return 'с 5-го уровня';const b=Math.max(0,i.dp-z.dp);return b>0?'через '+b+' '+pl(b,'день','дня','дней')+' игры':'завтра или после победы';}
const openList=()=>REG.list.filter(g=>avail(g.id));

/* ---------- зерно, портреты, мелочи ---------- */
function seedOf(id,day){let h=2166136261;const s=(day||today())+'|zmg|'+id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
const R=seed=>{let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
const isPC=()=>{try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}};
const kc=l=>'<kbd class="zmg-kc">'+escH(l)+'</kbd>';
/* Портреты: ZMG.faces[who] (подмена) → ZBP.face/bust (справочник героев CAB) → родные: zinaSVG, catSVG, sosFace(i) → запасные бюсты (облик Викторины) */
const SOSI={vp:0,galya:1,semyon:2,tamara:3,lyusya:4,nina:5};
const WHO={zina:'Баба Зина',yat:'Кот Ять',valerka:'Валерка',valya:'Тётя Валя',mityai:'Дед Митяй',galya:'Галя с третьего',semyon:'Дед Семён',
  lyusya:'Люся-почтальонка',tamara:'Тамара из 15-й',nina:'Нина Аркадьевна',vp:'Валентина Петровна',tolik:'Толик',kolya:'Дядя Коля'};
const whoName=w=>{if(WHO[w])return WHO[w];try{if(window.ZBP&&ZBP.info&&ZBP.info[w]&&ZBP.info[w].name)return ZBP.info[w].name;}catch(e){}return WHO.zina;};
const BUST={
  valerka:{bg:'#e7f3e4',body:'#2f9e44',brow:'#6b4420',skin:'#f6cfae',
    hair:'<path d="M52 96 q-6 -44 46 -50 q52 2 52 48 q-10 -22 -26 -20 q-10 -12 -24 -6 q-14 -10 -30 2 q-12 4 -18 26z" fill="#8a5a2b"/>',
    hat:'<path d="M50 76 q2 -44 50 -46 q48 2 50 46 q-50 -14 -100 0z" fill="#1c6fb8"/><path d="M100 64 q38 -6 68 10 q-4 9 -18 9 q-24 -9 -50 -7z" fill="#155a96"/>',
    bodyX:'<path d="M80 152 l20 22 l20 -22" fill="#fff"/>',
    face:'<g fill="#d9905b" opacity=".7"><circle cx="68" cy="116" r="2"/><circle cx="76" cy="121" r="2"/><circle cx="62" cy="122" r="2"/><circle cx="132" cy="116" r="2"/><circle cx="124" cy="121" r="2"/><circle cx="138" cy="122" r="2"/></g>'},
  mityai:{bg:'#e8f0f8',old:1,body:'#fff',brow:'#c2c6cd',hair:'<path d="M50 104 q-6 -24 8 -36 q-2 18 5 30z M150 104 q6 -24 -8 -36 q2 18 -5 30z" fill="#d9dde3"/>',
    bodyX:'<g stroke="#1f4f9a" stroke-width="8"><path d="M40 176 h120 M24 194 h152 M18 212 h164"/></g>',
    face:'<path d="M68 142 q32 18 64 0" stroke="#c4c4c4" stroke-width="2.4" fill="none" stroke-dasharray="2 5"/><circle cx="101" cy="118" r="8" fill="#e8826f" opacity=".55"/>'},
  valya:{bg:'#f6ece4',body:'#fff',brow:'#7a4a2a',
    hair:'<path d="M50 100 q-8 -50 50 -54 q58 4 50 54 q-8 -26 -50 -30 q-42 4 -50 30z" fill="#9a4a24"/>',
    hat:'<path d="M48 70 q52 -40 104 0 q-6 8 -52 6 q-46 2 -52 -6z" fill="#fff"/><path d="M48 70 q52 -12 104 0" stroke="#e2d6c8" stroke-width="3" fill="none"/>',
    bodyX:'<path d="M60 160 h80 v60 h-80z" fill="#f4d7d9"/><path d="M60 160 q40 14 80 0" stroke="#e7a8ae" stroke-width="4" fill="none"/>'},
  tolik:{bg:'#e3e9f2',body:'#2c5aa0',brow:'#5b3a29',
    hat:'<path d="M50 74 q4 -44 52 -46 q46 2 50 40 q-50 -8 -102 6z" fill="#6b6f76"/>',
    face:'<path d="M76 136 q12 -8 24 -2 q12 -6 24 2 q-6 10 -24 6 q-18 4 -24 -6z" fill="#5b3a29"/>'},
  kolya:{bg:'#eeeae0',old:1,body:'#6b5a3e',brow:'#8c8c8c',
    hat:'<path d="M46 80 q-2 -52 54 -54 q56 2 54 54 q-54 -16 -108 0z" fill="#3f4a3a"/>',
    face:'<path d="M74 134 q26 10 52 0" stroke="#9a9a9a" stroke-width="5" fill="none" stroke-linecap="round"/>'}};
let pvN=0;
function bustSvg(id,m){const o=BUST[id]||BUST.valerka,sk=o.skin||'#eebf99',sk2=o.skin2||'#dba27c',brow=o.brow||'#8c8c8c';
  const eyes=m==='happy'?'<path d="M72 104 q9 -9 18 0 M110 104 q9 -9 18 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>'
    :m==='wow'?'<circle cx="81" cy="103" r="6.4" fill="#3a2a22"/><circle cx="119" cy="103" r="6.4" fill="#3a2a22"/><circle cx="83" cy="101" r="1.8" fill="#fff"/><circle cx="121" cy="101" r="1.8" fill="#fff"/>'
    :'<ellipse cx="81" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><ellipse cx="119" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><circle cx="82.5" cy="101.5" r="1.4" fill="#fff"/><circle cx="120.5" cy="101.5" r="1.4" fill="#fff"/>';
  const brows='<path d="'+(m==='sad'?'M68 90 q10 -5 22 2 M132 90 q-10 -5 -22 2':m==='happy'||m==='wow'?'M67 86 q11 -9 23 -3 M133 86 q-11 -9 -23 -3':'M68 90 q11 -6 22 -2 M132 90 q-11 -6 -22 -2')+'" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>';
  const mouth=m==='happy'?'<path d="M82 132 q18 20 36 0 q-18 5 -36 0z" fill="#8f2f35"/><path d="M87 134.5 q13 5 26 0 l-2 3 q-11 4 -22 0z" fill="#fff"/>'
    :m==='sad'?'<path d="M88 140 q12 -9 24 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
    :m==='wow'?'<ellipse cx="100" cy="137" rx="8" ry="9" fill="#8f2f35"/>':'<path d="M86 133 q14 11 28 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
  return '<svg viewBox="0 0 200 220" aria-hidden="true"><rect width="200" height="220" fill="'+(o.bg||'#eee')+'"/><path d="M10 220 q2 -52 46 -62 l24 -6 h40 l24 6 q44 10 46 62z" fill="'+o.body+'"/>'+(o.bodyX||'')+
    '<path d="M84 138 h32 v20 q-16 12 -32 0z" fill="'+sk2+'"/><ellipse cx="50" cy="110" rx="9" ry="12" fill="'+sk+'"/><ellipse cx="150" cy="110" rx="9" ry="12" fill="'+sk+'"/>'+
    '<path d="M52 92 q0 -48 48 -48 q48 0 48 48 q0 30 -14 46 q-14 16 -34 16 q-20 0 -34 -16 q-14 -16 -14 -46z" fill="'+sk+'"/>'+(o.hair||'')+
    '<ellipse cx="68" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/><ellipse cx="132" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/>'+
    (o.old?'<path d="M64 112 q5 3 10 2 M136 112 q-5 3 -10 2 M80 76 q20 -5 40 0" stroke="'+sk2+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>':'')+
    brows+eyes+'<path d="M100 104 q-9 18 -3 22 q5 3 11 -1 q3 -3 -1 -8" fill="'+sk2+'" opacity=".9"/>'+mouth+(o.face||'')+(o.hat||'')+'</svg>';}
const FACES={};
function face(who,m){m=m||'norm';const f=FACES[who];if(typeof f==='function')try{return f(m);}catch(e){}
  try{if(window.ZBP&&typeof ZBP.bust==='function'&&(!ZBP.ids||ZBP.ids.indexOf(who)>=0)){const r=ZBP.bust(who,m,'zmg-bust');if(r)return r;}}catch(e){}
  try{if(who==='zina'&&typeof zinaSVG==='function')return zinaSVG(m==='wow'?'happy':m);
    if(who==='yat'&&typeof catSVG==='function')return catSVG();
    if(who in SOSI&&typeof sosFace==='function')return sosFace(SOSI[who]);}catch(e){}
  return bustSvg(BUST[who]?who:'valerka',m);}
function sayH(who,t,m){return '<div class="zmg-say"><span class="zmg-av zmg-av-'+escH(who)+'">'+face(who,m)+'</span><p class="zmg-sb"><b class="zmg-who">'+escH(whoName(who))+'</b>'+t+'</p></div>';}

/* ---------- слова для игр: только пройденные уровни (знакомые), существительные кроссворда, без отказных/грубых ---------- */
let WC=null;
function wordPool(){const upto=Math.max(20,Math.min(lvl(),typeof LEVELS!=='undefined'?LEVELS.length:0));if(WC&&WC.n===upto)return WC.w;
  const deny=new Set(typeof ZINA_DENY==='string'&&ZINA_DENY?ZINA_DENY.split(' '):[]),seen=new Set(),out=[];
  try{for(let i=0;i<upto&&i<LEVELS.length;i++)for(const w of LEVELS[i].w||[]){const x=w[0];if(!x||seen.has(x)||deny.has(x))continue;seen.add(x);out.push(x);}}catch(e){}
  try{if(typeof h32==='function'&&typeof ZINA_RUDE==='string'&&ZINA_RUDE){const r=new Set(ZINA_RUDE.split(' '));for(let i=out.length-1;i>=0;i--)if(r.has(h32(out[i])))out.splice(i,1);}}catch(e){}
  WC={n:upto,w:out};return out;}
function defOf(w){try{if(typeof GLOSS!=='undefined'&&GLOSS[w])return GLOSS[w];if(typeof DEFS!=='undefined'&&DEFS[w])return DEFS[w];}catch(e){}return '';}
function jokeOf(w){try{if(typeof DEFS!=='undefined'&&DEFS[w])return DEFS[w];}catch(e){}return '';}
function words(f,rnd){f=f||{};rnd=f.rnd||rnd||Math.random;let L=wordPool().filter(w=>(!f.min||w.length>=f.min)&&(!f.max||w.length<=f.max)&&(!f.def||defOf(w))&&!(f.not&&f.not.indexOf(w)>=0));
  L=L.slice();for(let i=L.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=L[i];L[i]=L[j];L[j]=t;}return f.n?L.slice(0,f.n):L;}

/* ---------- клавиатура: один перехватчик (раньше общего) — пока игра на экране, клавиши идут только ей ----------
   Esc — окно «Выйти?»; P/З — пауза; в окнах оболочки: Enter/Пробел — зелёная (или выбранная стрелками), 1–9 — по порядку, стрелки — выбор. */
const isP=k=>k==='p'||k==='P'||k==='з'||k==='З';
function veilBtns(v){return [].slice.call(v.querySelectorAll('.zmg-btns button')).filter(b=>!b.disabled&&b.offsetParent!==null);}
function veilKey(v,e){const k=e.key,bs=veilBtns(v);if(!bs.length)return false;
  if(k==='Enter'||k===' '){if(e.repeat)return true;const f=bs.filter(b=>b.classList.contains('zmg-kf'))[0]||v.querySelector('.btn.green');if(f){f.click();return true;}return false;}
  if(/^[1-9]$/.test(k)){if(e.repeat)return true;const b=bs[+k-1];if(b){b.click();return true;}return false;}
  if(/^Arrow/.test(k)){let i=-1;bs.forEach((b,j)=>{if(b.classList.contains('zmg-kf'))i=j;});if(i<0)bs.forEach((b,j)=>{if(i<0&&b.classList.contains('green'))i=j;});if(i<0)i=0;
    i=(i+(k==='ArrowUp'||k==='ArrowLeft'?bs.length-1:1))%bs.length;bs.forEach(b=>b.classList.remove('zmg-kf'));bs[i].classList.add('zmg-kf');try{bs[i].focus({preventScroll:true});}catch(x){}return true;}
  return false;}
function veilKc(v){if(!isPC())return;veilBtns(v).forEach((b,i)=>{if(b.querySelector('.zmg-kn'))return;const l=b.classList.contains('green')?'Enter':b.hasAttribute('data-esc')?'Esc':String(i+1);
  b.insertAdjacentHTML('beforeend',' <kbd class="zmg-kc zmg-kn">'+escH(l)+'</kbd>');});}
window.addEventListener('keydown',e=>{const c=REG.cur;if(!c)return;try{if(typeof unlockAudio==='function')unlockAudio();}catch(x){}e.stopPropagation();if(e.ctrlKey||e.metaKey||e.altKey)return;
  const v=c.root.querySelector('.zmg-veil');
  if(e.key==='Escape'){e.preventDefault();if(e.repeat)return;if(v){const b=v.querySelector('[data-esc]');if(b)b.click();}else c.qb.click();return;}
  const typing=c.keys.length&&c.root.querySelector('.zmg-krug');   // круг букв: «з» — буква, а не пауза
  if(isP(e.key)&&!e.repeat&&!typing){if(v&&v.classList.contains('zmg-pz')){e.preventDefault();v.querySelector('.btn.green').click();return;}
    if(!v&&c.pause&&c.pause()){e.preventDefault();return;}}
  if(v){if(veilKey(v,e))e.preventDefault();return;}
  const it=c.root.querySelector('.zmg-intro');if(it&&(/^[1-9]$/.test(e.key)||/^Arrow/.test(e.key))){e.preventDefault();return;}
  if(c.host.paused||e.repeat&&!/^Arrow/.test(e.key))return;for(const f of c.keys)try{if(f(e.key,e)){e.preventDefault();break;}}catch(x){console.error(x);}},true);
window.addEventListener('keyup',e=>{if(REG.cur)e.stopPropagation();},true);

/* ---------- открыть игру. opt: {mode, ctx, seed, train, back(res|null) — после итога/выхода, next:{t, f(res)} — главная кнопка итога, line — реплика итога} ---------- */
function open(id,opt){opt=opt||{};const i=infoOf(id);if(!i){toastT('Игра не найдена');return Promise.resolve(null);}
  if(REG.cur)close();
  const g0=REG.by[i.id];if(g0)return Promise.resolve(start(g0,opt));
  const w=wait(i);
  return loadGame(i.id).then(g=>{w.remove();return start(g,opt);}).catch(e=>{w.remove();console.warn('zmg load',i.id,e);
    toastT('Игра не загрузилась — проверь интернет и попробуй ещё раз');if(opt.back)opt.back(null);return null;});}
function toastT(t){try{if(typeof toast==='function')toast(t,4000);}catch(e){}}
function wait(i){const d=document.createElement('div');d.id='zmgWait';d.className='zmg-wait';d.innerHTML='<div><b>'+i.ic+'</b>'+escH(i.t)+'<br><small>Загружаю…</small></div>';
  document.body.appendChild(d);return d;}
function start(g,opt){const z=Z(),mode=opt.mode||'cab',train=mode==='cab'||!!opt.train;
  const app=document.body,root=document.createElement('div');root.id='zmgHost';root.className='zmg zmg-'+g.id+(opt.fest?' zmg-fest-'+opt.fest.id:'');
  root.innerHTML='<div class="zmg-head"><span class="zmg-ic">'+g.ic+'</span><b class="zmg-nm">'+escH(g.t)+'</b><span class="zmg-top"></span>'+(isPC()?'<span class="zmg-khd">'+kc('Esc')+' выход '+kc('P')+' пауза</span>':'')+'<button class="zmg-xb" aria-label="Выйти">✕</button></div><div class="zmg-el"></div>';
  app.appendChild(root);const el=root.querySelector('.zmg-el'),qb=root.querySelector('.zmg-xb'),top=root.querySelector('.zmg-top');
  const rs=[],qs=[],keys=[],loops=[],offs=[];let fin=false,hold=false,raf=0,last=0,adUsed=false;
  const day=today(),seed=opt.seed!=null?opt.seed>>>0:(mode==='day'||mode==='paper')?seedOf(g.id,day):(Math.random()*4294967296)>>>0;
  const dpr=Math.min(2,window.devicePixelRatio||1),rw=RW(),fest=opt.fest||festNow();
  const o={id:g.id,num:g.num,mode,train,seed,rnd:R(seed),day:+day,calm:typeof CALM==='function'&&!!CALM(),lvl:lvl(),ctx:opt.ctx||{},
    rw:train?[0,0,0,0]:(g.id==='vecherka'?[0,rw.paper,rw.paper,rw.paper]:rw.c.slice()),note:noteAt(z.np),fest};
  const isPaused=()=>hold||!!root.querySelector('.zmg-veil')||(typeof PR!=='undefined'&&PR&&PR.size>0)||document.hidden;
  function tick(t){raf=0;if(fin||REG.cur!==cur)return;const dt=Math.min(.05,last?(t-last)/1000:0);last=t;
    if(!isPaused())for(const f of loops)try{f(dt,t/1000);}catch(e){console.error(e);}
    if(loops.length)raf=requestAnimationFrame(tick);}
  const zoom=()=>{try{return typeof uiZoom==='function'?uiZoom()||1:1;}catch(e){return 1;}};
  const host={el,id:g.id,root,dpr,o,get w(){return el.clientWidth;},get h(){return el.clientHeight;},get paused(){return isPaused();},
    set hold(v){hold=!!v;},snd:typeof SND!=='undefined'?SND:{},pc:isPC(),calm:o.calm,fest,bot:null,
    onResize(f){rs.push(f);},onQuit(f){qs.push(f);},keys(f){keys.push(f);},kc,top(t){top.textContent=t==null?'':String(t);},
    say:sayH,face,whoName,esc:escH,words:f=>words(f,o.rnd),def:defOf,joke:jokeOf,
    krug(e,op){if(!window.ZMGK){console.warn('zmg: круг букв не загружен — deps:["krug"]');return null;}const k=ZMGK.make(e,op||{},host);if(k&&k.destroy)qs.push(k.destroy);return k;},
    intro(t){t=t||{};return new Promise(res=>{const d=document.createElement('div');d.className='zmg-intro';
      const ht=!t.text&&HG(g.id)?escH(hp(HG(g.id).intro,o.rnd)):'';
      d.innerHTML='<div class="zmg-panel">'+sayH(t.who||g.who,t.text||ht||escH(g.a),'happy')+(t.html||'')+(t.hint?'<p class="zmg-hint">'+t.hint+'</p>':'')+
        '<div class="zmg-btns"><button class="btn green">'+escH(t.btn||'Начать')+(isPC()?' <kbd class="zmg-kc zmg-kn">Enter</kbd>':'')+'</button></div></div>';
      el.appendChild(d);let done=false;const go=()=>{if(done)return;done=true;try{SND.tap();}catch(e){}d.remove();const j=keys.indexOf(kf);if(j>=0)keys.splice(j,1);res();};
      const kf=k=>{if(k==='Enter'||k===' '){go();return true;}return false;};keys.unshift(kf);d.querySelector('button').onclick=go;
      if(opt.fast)setTimeout(go,0);});},
    cv(){const c=document.createElement('canvas');c.className='zmg-cv';el.appendChild(c);const r={cv:c,x:c.getContext('2d'),w:0,h:0,dpr};
      const fit=()=>{r.w=Math.max(1,el.clientWidth);r.h=Math.max(1,el.clientHeight);c.width=Math.round(r.w*dpr);c.height=Math.round(r.h*dpr);c.style.width=r.w+'px';c.style.height=r.h+'px';r.x.setTransform(dpr,0,0,dpr,0,0);};
      fit();rs.unshift(fit);return r;},
    loop(f){loops.push(f);last=0;if(!raf)raf=requestAnimationFrame(tick);},
    ptr(e,h){const pos=ev=>{const b=e.getBoundingClientRect(),zk=zoom();return [(ev.clientX-b.left)/zk,(ev.clientY-b.top)/zk];};let act=null;
      const dn=ev=>{if(fin||isPaused())return;act=ev.pointerId;try{e.setPointerCapture(ev.pointerId);}catch(x){}ev.preventDefault();const p=pos(ev);if(h.down)h.down(p[0],p[1],ev);},
        mv=ev=>{if(fin||isPaused())return;const p=pos(ev);if(h.move)h.move(p[0],p[1],ev);},
        up=ev=>{if(act!==ev.pointerId)return;act=null;if(fin)return;const p=pos(ev);if(h.up)h.up(p[0],p[1],ev);};
      e.addEventListener('pointerdown',dn);e.addEventListener('pointermove',mv);e.addEventListener('pointerup',up);e.addEventListener('pointercancel',up);e.style.touchAction='none';
      offs.push(()=>{e.removeEventListener('pointerdown',dn);e.removeEventListener('pointermove',mv);e.removeEventListener('pointerup',up);e.removeEventListener('pointercancel',up);});},
    mem(){const m=S.zmg.m;return ob(m[g.id])?m[g.id]:(m[g.id]={});},
    adOk(){try{return !adUsed&&typeof adsOk==='function'&&adsOk();}catch(e){return false;}},
    adNeed(kind){if(adUsed)return Promise.resolve(false);adUsed=true;return new Promise(res=>{let ok=false;try{STAT.place('mg_'+g.id+'_'+(kind||'x'));hold=true;
      showRewarded(()=>{hold=false;if(!ok){ok=true;res(true);}},()=>{hold=false;if(!ok){ok=true;adUsed=false;res(false);}},
        ()=>{hold=false;if(!ok&&REG.cur&&REG.cur.host===host){ok=true;res(true);return 'подсказка в игре';}return '';});}catch(e){hold=false;adUsed=false;res(false);}});},
    finish(r){if(fin)return;fin=true;stop();r=r||{};fin2(g,o,{score:r.sc!=null?r.sc:r.score,tier:r.st!=null?r.st:r.tier,h:r.h|0,label:r.label},opt);},
    quit(){if(!fin){fin=true;stop();}close();if(opt.back)opt.back(null);}};
  host.done=host.finish;
  function stop(){loops.length=0;if(raf)cancelAnimationFrame(raf);raf=0;for(const f of offs.splice(0))try{f();}catch(e){}keys.length=0;}
  qb.onclick=()=>{try{SND.tap();}catch(e){}if(fin){close();if(opt.back)opt.back(null);return;}quitAsk();};
  function quitAsk(){if(root.querySelector('.zmg-veil'))return;const v=document.createElement('div');v.className='zmg-veil';
    v.innerHTML='<div class="zmg-panel"><h2>Выйти из игры?</h2><p>'+(train?'Это тренировка — ничего не потеряешь.':'Заход не засчитается — сыграть можно будет снова.')+'</p>'+
      '<div class="zmg-btns"><button class="btn green">Продолжить</button><button class="btn" data-esc="1">Выйти</button></div></div>';
    root.appendChild(v);veilKc(v);const bs=v.querySelectorAll('button');bs[0].onclick=()=>{try{SND.tap();}catch(e){}v.remove();last=0;};
    bs[1].onclick=()=>{try{SND.tap();}catch(e){}stEv({a:'quit',id:g.id,m:mode,s:Math.round((Date.now()-cur.t0)/1000)});host.quit();};}
  function pauseAsk(){if(fin||root.querySelector('.zmg-veil'))return false;const v=document.createElement('div');v.className='zmg-veil zmg-pz';
    v.innerHTML='<div class="zmg-panel"><h2>⏸ Пауза</h2><p>Игра ждёт — продолжай, когда будешь готов.</p>'+
      '<div class="zmg-btns"><button class="btn green" data-esc="1">Продолжить</button><button class="btn sec">Выйти</button></div></div>';
    root.appendChild(v);veilKc(v);const bs=v.querySelectorAll('button');bs[0].onclick=()=>{try{SND.tap();}catch(e){}v.remove();last=0;};
    bs[1].onclick=()=>{try{SND.tap();}catch(e){}v.remove();quitAsk();};return true;}
  const onRs=()=>{for(const f of rs)try{f(host.w,host.h);}catch(e){console.error(e);}};window.addEventListener('resize',onRs);
  const cur={id:g.id,g,host,o,opt,root,qb,keys,qs,onRs,stop,pause:pauseAsk,t0:Date.now()};REG.cur=cur;
  document.documentElement.classList.add('zmg-open');
  try{if(typeof YG!=='undefined')YG.stop();}catch(e){}
  try{STAT.screen('mg_'+g.id);}catch(e){}stEv({a:'go',id:g.id,m:mode,l:lvl(),tr:train?1:0});
  loadDeps(g).then(()=>{if(REG.cur!==cur)return;try{g.run(host,o);}catch(e){console.error(e);close();toastT('Игра не запустилась');if(opt.back)opt.back(null);}},
    e=>{console.warn('zmg deps',g.id,e);if(REG.cur!==cur)return;close();toastT('Игра не загрузилась — проверь интернет и попробуй ещё раз');if(opt.back)opt.back(null);});
  return host;}
function close(){const c=REG.cur;if(!c)return;REG.cur=null;try{c.stop();}catch(e){}for(const f of c.qs.splice(0))try{f();}catch(e){}window.removeEventListener('resize',c.onRs);c.root.remove();
  document.documentElement.classList.remove('zmg-open');
  try{const on=id=>{const e=$i(id);return e&&e.classList.contains('on');};STAT.screen(on('game')?'game':on('menu')?'menu':ZB.cur?'zb-'+ZB.cur:'menu');}catch(e){}}

/* ---------- итог: награды (монеты с потолком, заметка стенгазеты, 💡), рекорд → окно итога внутри оболочки ---------- */
function fin2(g,o,r,opt){const z=Z(),n=g.num,rw=RW();r.score=Math.max(0,Math.round(+r.score||0));r.tier=Math.max(0,Math.min(3,r.tier|0));
  const best=z.b[n]|0,rec=r.score>best&&best>0;if(r.score>best)z.b[n]=r.score;z.n[n]=(z.n[n]|0)+1;
  const out={coins:0,capped:false,note:null,ntCap:false,hb:0,paid:false,rec,issue:null};
  const m=o.mode,day=m==='day'||m==='fest',paper=m==='paper',win=m==='win';
  const rewarded=!o.train&&(day?!z.d.z:paper?!z.d.v:!z.d.p[n])&&!(win&&z.d.pk>=rw.pk);
  if(rewarded&&r.tier>=1){if(day)z.d.z=1;else if(paper)z.d.v=1;else z.d.p[n]=1;out.paid=true;if(win)z.d.pk++;
    const want=paper?rw.paper:(rw.c[r.tier]||0),c=giveCoins(want,z,rw,g.id);out.capped=c<want;out.coins=c;
    const noteOk=day||paper||(r.tier>=rw.ntPer);
    if(noteOk){if(z.d.nt>=rw.nt)out.ntCap=true;else out.note=giveNote(g.id);}
    if(r.tier===3&&(day||paper)&&!r.h){if(z.d.hb>=rw.hb)out.hbDay=true;else if(typeof hbAdd==='function'&&typeof hbN==='function'&&typeof HB_MAX!=='undefined'&&hbN()>=HB_MAX)out.hbFull=true;
      else if(typeof hbAdd==='function'){z.d.hb++;hbAdd(1,'mg');out.hb=1;}}}
  touch();save();try{if(typeof updCoins==='function')updCoins();}catch(e){}
  const s=Math.round((Date.now()-((REG.cur&&REG.cur.t0)||Date.now()))/1000);
  stEv({a:'end',id:g.id,m,sc:r.score,st:r.tier,s,h:r.h|0,c:out.coins,nt:out.note?out.note.n:0,rec:rec?1:0});
  if(out.paid)stEv({a:'rw',id:g.id,m,c:out.coins,nt:out.note?out.note.n:0,hb:out.hb,cap:out.capped||out.ntCap?1:0});
  const c=REG.cur;if(c)for(const f of c.qs.splice(0))try{f();}catch(e){}
  try{if(ZMG.onEnd)ZMG.onEnd(g,o,r,out);}catch(e){}
  ZB.emit('zmg',{a:'end',id:g.id,mode:m,tier:r.tier,out});if(out.paid)ZB.safe('zmg-today',()=>{if(window.ZBTD&&ZBTD.check)ZBTD.check();else ZB.emit('today');});
  finUI(g,o,r,out,opt);}
/* заметка стенгазеты: по порядку (видна заранее), 10 — выпуск собран → приз */
function giveNote(src){const z=Z(),rw=RW();if(z.np>=ISSUES.length*PER_ISS)return null;const a=noteAt(z.np);z.np++;z.d.nt++;
  const res={n:z.np,iss:a.iss,k:a.k,t:a.t,full:a.k===PER_ISS};try{STAT.ev('note',{iss:a.iss,n:a.k,s:src});}catch(e){}
  if(res.full&&!z.iss[a.iss]){z.iss[a.iss]=1;const p=rw.issue||{};res.prize=p;
    if(p.c&&typeof addCoins==='function')addCoins(p.c,'mg');if(p.hb&&typeof hbAdd==='function')hbAdd(p.hb,'paper');}
  touch();save();return res;}
function finUI(g,o,r,out,opt){const c=REG.cur;if(!c)return;const root=c.root;
  const head=r.tier===3?'Садись, пять!':r.tier===2?'Четыре — хорошо!':r.tier===1?'Три — уже неплохо!':'Не беда!';
  let st='';for(let i=1;i<=3;i++)st+='<span class="zmg-st'+(i<=r.tier?' on':'')+'" style="animation-delay:'+(i*.18)+'s">⭐</span>';
  const rw=[];if(out.coins)rw.push('<div class="zmg-rw c">+'+out.coins+' <span class="coin"></span></div>');
  if(out.note)rw.push('<div class="zmg-rw p">📰 Заметка №'+out.note.k+' в стенгазету «'+escH(out.note.t)+'»</div>');
  if(out.note&&!out.note.full){const pp=window.ZMG_HOSTS&&ZMG_HOSTS.paper;const t=(window.ZBT&&ZBT.say&&ZB.safe('zbt',()=>ZBT.say('mg.paper',{n:PER_ISS-out.note.k})))||(pp?hsub(hp(pp.slice(0,3)),{n:PER_ISS-out.note.k}):'');if(t)rw.push('<div class="zmg-rw s">'+escH(t)+'</div>');}
  if(out.note&&out.note.full)rw.push('<div class="zmg-rw t">🎉 Выпуск собран!'+(out.note.prize&&out.note.prize.hb?' 💡 +'+out.note.prize.hb:'')+(out.note.prize&&out.note.prize.c?' · +'+out.note.prize.c+' <span class="coin"></span>':'')+'</div>');
  if(out.hb)rw.push('<div class="zmg-rw t">💡 Подсказка в запас</div>');
  if(out.rec)rw.push('<div class="zmg-rw r">🏆 Новый рекорд!</div>');
  const notes=[],rwN=RW();
  if(o.train)notes.push('Тренировка — без наград. Рекорд: '+Math.max(r.score,S.zmg.b[g.num]|0));
  else if(!r.tier)notes.push('Награда — с первой звезды. Попробуй ещё!');
  else if(!out.paid)notes.push(o.mode==='win'&&Z().d.pk>=rwN.pk?'Перемен с наградой сегодня уже '+rwN.pk+' — это заход на рекорд.':'Награду за эту игру сегодня уже получил — это заход на рекорд.');
  else{if(out.ntCap)notes.push('Заметок на сегодня хватит ('+rwN.nt+' в день) — завтра ещё.');
    else if(!out.note&&o.mode==='win')notes.push('Заметку в стенгазету дают за две звезды.');
    if(out.capped)notes.push('Монеты Перемен на сегодня собраны ('+rwN.cap+') — завтра ещё.');}
  const np=Z().np,a=noteAt(np),bar=a.done?'':'<div class="zmg-xpb"><span>📰 Стенгазета «'+escH(a.t)+'»: '+(a.k-1)+'/'+PER_ISS+'</span><span class="zmg-bar"><i style="width:'+Math.round(100*(a.k-1)/PER_ISS)+'%"></i></span></div>';
  const hl=HG(g.id)&&hp(HG(g.id)['st'+r.tier]);
  const lines=g.lines||{},line=opt.line||hl||(r.tier>=2?(lines.good||'Вот это грамотей! Красной ручкой — пятёрка.'):r.tier===1?(lines.ok||'Неплохо! Ещё чуть-чуть — и пятёрка.'):(lines.bad||'Ничего, на следующей перемене получится!'));
  const nx=opt.next||null,v=document.createElement('div');v.className='zmg-veil zmg-res';
  v.innerHTML='<div class="zmg-panel">'+sayH(g.finWho||g.who,escH(typeof line==='function'?line(r):line),r.tier?'happy':'norm')+
    '<h2>'+head+'</h2><div class="zmg-stars">'+st+'</div>'+(r.label?'<p class="zmg-sc">'+escH(r.label)+'</p>':'')+
    (rw.length?'<div class="zmg-rws">'+rw.join('')+'</div>':'')+notes.map(t=>'<p class="zmg-note">'+escH(t)+'</p>').join('')+bar+
    '<div class="zmg-btns">'+(nx?'<button class="btn green" data-k="nx">'+escH(nx.t)+'</button>':'<button class="btn green" data-k="ok">Готово</button>')+
    '<button class="btn sec" data-k="again"'+(nx?'':' data-esc="1"')+'>↻ Ещё раз'+(o.train||!out.paid?'':' <small>без награды</small>')+'</button>'+(nx?'<button class="btn sec" data-k="ok" data-esc="1">Готово</button>':'')+'</div></div>';
  root.appendChild(v);veilKc(v);root.querySelector('.zmg-top').textContent='';
  try{if(r.tier===3)SND.win();if(out.coins||out.note)setTimeout(()=>{try{SND.coin();}catch(e){}},500);}catch(e){}
  const res={score:r.score,tier:r.tier,coins:out.coins,note:out.note,hb:out.hb};
  v.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{try{SND.tap();}catch(e){}const k=b.dataset.k;close();
    if(k==='again')open(g.id,{mode:'cab',train:true,back:opt.back,next:opt.next,ctx:opt.ctx});else if(k==='nx')nx.f(res);else if(opt.back)opt.back(res);});}

/* ---------- праздник: FEST кладёт ZMG.festFn = () => ({id, t}) | null ---------- */
function festNow(){try{return ZMG.festFn?ZMG.festFn()||null:null;}catch(e){return null;}}

/* ---------- Затея дня ---------- */
function zateyaSay(id){try{const z=window.ZMG_HOSTS&&ZMG_HOSTS.zateya;if(!z)return '';const w=new Date(typeof nowMs==='function'?nowMs():Date.now()).getDay(),e=z[String(w||7)];return e&&e[0]===id?e[1]:'';}catch(e){return '';}}
function dayId(){const w=new Date(typeof nowMs==='function'?nowMs():Date.now()).getDay(),want=WEEK[w];
  if(avail(want))return want;for(let i=1;i<7;i++){const id=WEEK[(w+i)%7];if(avail(id))return id;}
  const l=openList().filter(g=>g.id!=='vecherka');return l.length?l[0].id:'';}

/* ---------- Перемена: выбор игры (первая — Диктант; дальше — открытая, в которую давно не играли) ---------- */
function perId(){const z=Z();if(avail('diktant')&&!(z.n[IDS.diktant]|0))return 'diktant';
  const L=openList().filter(g=>NOPER.indexOf(g.id)<0);if(!L.length)return '';
  const tg=REG.by.telegramma;if(tg&&typeof tg.due==='function'&&L.some(g=>g.id==='telegramma')){try{if(tg.due())return 'telegramma';}catch(e){}} /* zb-MERGE (просьба MGB): ждёт новая телеграмма — Перемена с неё */
  L.sort((a,b)=>(z.d.p[a.num]|0)-(z.d.p[b.num]|0)||(z.n[a.num]|0)-(z.n[b.num]|0)||a.num-b.num);return L[0].id;}
/* должна ли быть Перемена в этом окне победы: 5-й уровень каждой десятки (5, 15, 25…), не задание дня, первая победа, не конец главы/игры */
function perDue(c){if(!c||c.daily||!c.first||c.again)return false;const r=c.r||{};
  if(r.chap||(c.idx%10)!==4)return false;if(!perId())return false;
  // дирижёр новичка (NEWBIE 7f78eb2): 5-й уровень зарезервирован за 'mg'; занято — откладываем до следующей Перемены
  try{if(window.ZBNB&&typeof ZBNB.turn==='function'&&!ZBNB.turn('mg',c))return false;}catch(e){}return true;}
function winOffer(c){if(!perDue(c))return null;const id=perId(),i=infoOf(id),rwd=Z().d.pk<RW().pk;
  return {id,t:'🔔 На перемену · '+i.s+' с',small:!rwd,go:()=>runPer(c,id)};};
function runPer(c,id){const z=Z();z.pc++;touch();save();
  // окно победы остаётся под игрой: после Перемены «Дальше ▶» жмёт его же кнопку (реклама, глава, гостинец — по прежним правилам)
  open(id,{mode:'win',fast:(z.pc<=3&&id==='diktant'),next:{t:'Дальше ▶',f:()=>{const b=$i('mNext');if(b)b.click();}},back:()=>{ZB.safe('zmg-rew',rewin);}});}
function rewin(){const e=document.querySelector('#mcard .zbs-zmg-per');if(e&&ZMG._per)e.innerHTML=perHtml(ZMG._per,true);}
function perHtml(c,after){const id=c.pid,i=infoOf(id),z=Z(),rwd=z.d.pk<RW().pk||!!c.paid;
  if(after||z.d.p[i.num]&&c.paid)return '<div class="zmg-pw done"><b>✓ Перемена прошла</b> <span>'+escH(i.t)+' · рекорд '+(z.b[i.num]|0)+'</span></div>';
  if(!rwd)return '<div class="zmg-pw small"><span class="zmg-pi">🔔</span><span>Перемена: '+escH(i.t)+' (без награды)</span><button class="btn ghost small" data-zmg="go">Играть</button></div>';
  const hg=HG(id),ph=(hg&&hp(hg.intro))||PER_SAY[id]||'Перемена! Пять минут — и снова за парту.',
    bell=(window.ZBT&&ZBT.say&&ZB.safe('zbt',()=>ZBT.say('mg.peremena')))||(window.ZMG_HOSTS&&hp(ZMG_HOSTS.peremena))||'Перемена!';
  return '<div class="zmg-pw" data-zmg="go" role="button" tabindex="0"><span class="zmg-pav">'+face(i.who,'happy')+'</span><span class="zmg-pt"><b>🔔 '+escH(bell)+'</b>'+
    '<span>'+escH(ph)+'</span></span><button class="btn ghost small" data-zmg="go">'+i.ic+' На перемену · '+i.s+' с</button></div>';}
const PER_SAY={diktant:'Валерка написал диктант. Проверишь? Тридцать секунд — и пятёрка!',splet:'Галя с третьего: «Ой, что расскажу! Только буквы перепутались…»',
  slova:'Баба Зина у доски: «Из одного слова — восемь. Спорим?»',lishnee:'Зина: «Одно слово тут лишнее, как Валерка на родительском собрании».',
  pogovorka:'Нина Аркадьевна: «Поговорка без конца — как песня без припева!»',zagadki:'Дед Семён: «Отгадаешь с первой подсказки? С 1974-го никто не смог».',
  opechatki:'Кот Ять прошёлся по объявлению. Найди, где наследил!',telegramma:'Люся: «Телеграмма от внука! Только слова выпали…»',
  recept:'Тётя Валя: «Записывай рецепт, пока не убежало!»',filword:'Тамара с дачи: «Слова на лавочке спрятала — найдёшь?»',
  pary:'Валентина Петровна: «Слово и толкование — найди пару. Не списывать!»',lovit:'Кот Ять: «Мяу! Ловлю буквы — смотри, как я умею!»',baraban:'Зина: «Крути барабан — буквы сами не угадаются!»'};

/* ---------- гнёзда: окно победы (Перемена, Вечерка), дела дня, нижняя панель, плитка уголка ---------- */
ZB.add(ZB.winSlots,{id:'zmg-per',order:10,zone:'mg',   // без fit: Перемена — шаг пути, её не прячем (прячется второстепенное)

  render(c){if(!perDue(c))return '';const id=perId();c.pid=id;ZMG._per=c;return perHtml(c);},
  mount(el,c){if(!c.pid)return;const i=infoOf(c.pid);if(!c.shown){c.shown=1;stEv({a:'show',id:c.pid,m:'win',l:lvl()});}
    el.querySelectorAll('[data-zmg="go"]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();try{SND.tap();}catch(e){}c.paid=Z().d.pk<RW().pk;runPer(c,c.pid);});
    void i;}});
// Вечерка — после задания дня (вторая страница газеты)
function paperDue(c){return !!(c&&c.daily&&c.first&&!c.again&&avail('vecherka')&&!Z().d.v);}
ZB.add(ZB.winSlots,{id:'zmg-paper',order:11,zone:'mg',fit:3,
  render(c){if(!paperDue(c))return '';return '<div class="zmg-pw" data-zmg="go" role="button" tabindex="0"><span class="zmg-pav">'+face('lyusya','happy')+'</span><span class="zmg-pt"><b>📰 Люся принесла «Вечерку»</b><span>Кроссворд дня — один на весь подъезд.</span></span><button class="btn ghost small" data-zmg="go">📰 Читать</button></div>';},
  mount(el,c){if(!paperDue(c))return;if(!c.pshown){c.pshown=1;stEv({a:'show',id:'vecherka',m:'paper',l:lvl()});}
    el.querySelectorAll('[data-zmg="go"]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();try{SND.tap();}catch(e){}
      open('vecherka',{mode:'paper',back:()=>{const e=document.querySelector('#mcard .zbs-zmg-paper');if(e&&Z().d.v)e.innerHTML='<div class="zmg-pw done"><b>✓ «Вечерка» разгадана</b></div>';}});});}});
// дела дня «Сегодня у Зины» (рисует SCHOOL, договор 6ed6b75): дело id 'mg' «Перемена» = Затея дня; Вечерка — своим делом (SCHOOL решает, показывать ли). off() — дела сейчас нет (игра не открыта/не загрузилась)
ZB.add(ZB.todayTasks,{id:'mg',order:40,sub:'Перемена',ic:'🔔',get t(){const id=dayId(),i=infoOf(id);return i?'Затея дня: '+i.t:'Затея дня';},
  off:()=>!dayId(),done:()=>!!Z().d.z,
  go:()=>{const id=dayId();if(!id){ugolok();return;}stEv({a:'show',id,m:'day',l:lvl()});open(id,{mode:'day',back:()=>ZB.refresh()});},
  hint:()=>{const id=dayId(),i=infoOf(id);return i?(zateyaSay(id)||whoName(i.who)+' ждёт')+' · заметка в стенгазету':'';}});
ZB.add(ZB.todayTasks,{id:'zmg-paper',order:41,ic:'📰',t:'«Вечерка» от Люси',off:()=>!avail('vecherka'),done:()=>!!Z().d.v,
  go:()=>{stEv({a:'show',id:'vecherka',m:'paper',l:lvl()});open('vecherka',{mode:'paper',back:()=>ZB.refresh()});},hint:()=>'кроссворд дня · 10 монет и заметка'});
// нижняя панель: «Перемена» → Красный уголок (точка — есть награда: Затея дня не сыграна)
ZB.add(ZB.navSlots,{id:'mg',order:50,ic:'🔔',t:'Перемена',on:()=>true,go:()=>ugolok(),dot:()=>!!dayId()&&!Z().d.z});
// плитка Красного уголка на главном (зона school; CAB/VIEW могут заменить тем же id)
ZB.add(ZB.homeSlots,{id:'zmg-ugolok',order:60,zone:'school',
  render(){if(lvl()<5&&!openList().length)return '';const a=noteAt(Z().np),dot=!!dayId()&&!Z().d.z;
    return '<button class="zmg-tile" type="button"><span class="zmg-ti">📰</span><span class="zmg-tt"><b>Красный уголок</b><small>'+(a.done?'Все выпуски стенгазеты собраны!':'Стенгазета «'+escH(a.t)+'»: '+(a.k-1)+' из '+PER_ISS)+'</small></span>'+(dot?'<i class="dot on"></i>':'')+'</button>';},
  mount(el){const b=el.querySelector('.zmg-tile');if(b)b.onclick=()=>{try{SND.tap();}catch(e){}ugolok();};}});
// Красный уголок — экран ZB.screen('mg') (вкладка «Перемена» VIEW; js/zmg-ugolok.js и тексты стенгазеты — лениво)
const loadU=()=>Promise.all([ZB.load('js/zmg-ugolok-data.js').catch(()=>{}),ZB.load('js/zmg-ugolok.js')]);
ZB.screen('mg',{title:'Перемена',render(el,op){if(window.ZMGU){ZMGU.render(el,op);return;}
  el.innerHTML='<div class="zmg-wait" style="position:absolute"><div><b>📰</b>Красный уголок<br><small>Загружаю…</small></div></div>';
  loadU().then(()=>{if(ZB.cur==='mg'&&window.ZMGU)ZMGU.render(el,op);}).catch(()=>{toastT('Красный уголок не загрузился — попробуй ещё раз');if(typeof openMenu==='function')openMenu();});}});
function ugolok(opt){ZB.go('mg',opt||{});}
// стенгазета для кабинета CAB: ZMG.paperHtml() — html текущего выпуска ('' пока тексты не загружены; ZMG.paperLoad() → Promise)
const paperLoad=()=>loadU().then(()=>window.ZMGU?ZMGU.paperHtml():'');
const paperHtml=()=>window.ZMGU&&window.ZMG_NOTES?ZMGU.paperHtml():'';

/* ---------- «Новая затея!» — окно, когда открылась новая игра (на главном, если нет других окон) ---------- */
let nwT=0,nwN=0;
// ждём «тихую» минуту: на Доме/своём экране, без окна (гостинец, подарок — сначала они), не в игре; до 20 попыток раз в 3 с
function newOffer(again){clearTimeout(nwT);if(!again)nwN=0;nwT=setTimeout(()=>{const z=Z(),id=z.nw;if(!id||SHOTM())return;
  const m=$i('modal'),mn=$i('menu');let busy=REG.cur||(m&&m.classList.contains('on'))||!((mn&&mn.classList.contains('on'))||(ZB.cur&&$i('zb-'+ZB.cur)&&$i('zb-'+ZB.cur).classList.contains('on')));
  try{if(!busy&&window.ZBNB&&typeof ZBNB.turn==='function'&&!ZBNB.turn('mgnew'))busy=true;}catch(e){}
  if(busy){if(++nwN<20&&!($i('game')&&$i('game').classList.contains('on')))newOffer(true);return;}
  loadGame(id).then(g=>{if(!avail(id))return;if((m&&m.classList.contains('on'))||REG.cur)return;const i=infoOf(id);z.s[i.num]=1;z.nw='';touch();save();
    stEv({a:'show',id,m:'new',l:lvl()});
    modal('<div class="zmg-new"><h2>Новая затея!</h2>'+sayH(i.who,escH((HG(id)&&HG(id).new)||NEW_SAY[id]||i.a),'happy')+'<p class="zmg-nt"><b>'+i.ic+' '+escH(i.t)+'</b><br>'+escH(i.a)+'</p>'+
      '<div class="btns"><button class="btn green" id="zmgNewGo">▶ Сыграть</button><button class="btn ghost small" id="zmgNewNo">Потом</button></div></div>');
    $i('zmgNewGo').onclick=()=>{hideModal();try{SND.tap();}catch(e){}open(id,{mode:'new',back:()=>ZB.refresh()});};
    $i('zmgNewNo').onclick=()=>{hideModal();try{SND.tap();}catch(e){}stEv({a:'skip',id,m:'new'});};}).catch(()=>{});},1400);}
const NEW_SAY={vecherka:'Люся-почтальонка: «Свежая «Вечерка»! Кроссворд — каждый день, после задания дня».',splet:'Галя с третьего: «Ой, а что я знаю! Только буквы перепутала — поможешь?»',
  slova:'Зина взяла мел: «Из одного длинного слова — целая тетрадь коротких!»',lishnee:'Зина: «Найди лишнее слово — как лишнюю ложку сахара в чае».',
  zagadki:'Дед Семён: «Разгадываю с 1974-го. Теперь твоя очередь!»',lovit:'Кот Ять: «Ветер сорвал буквы с верёвки — ловлю!»',baraban:'Зина: «Крутите барабан! Ведущая — я, призы — пирожки».',
  opechatki:'Ять прошёлся по объявлению ЖЭКа — найди, где наследил!',telegramma:'Люся: «Телеграмма от внука! История с продолжением».',filword:'Тамара: «На лавочке спрятала слова — найдёшь?»',
  recept:'Тётя Валя: «Рецепт под диктовку! Продукты собирай из букв».',loto:'Дед Митяй: «Бочонки — загадками! Кто закроет ряд — тот молодец».',
  pary:'Валентина Петровна: «Слово — толкование. Найди пары, не списывай».',pogovorka:'Нина Аркадьевна: «Начну поговорку — а ты закончи!»'};

/* ---------- ход игры: открытие по уровням (после победы), по дням (на главном), подгрузка ---------- */
ZB.levelHook.push(i=>{if(!i||i.end!=='win'||i.daily)return;ZB.safe('zmg-unlock',()=>unlock(true));if(lvl()>=3)preload();});
ZB.on('home',()=>{ZB.safe('zmg-home',()=>{unlock(false);newOffer();});});
const loadH=()=>window.ZMG_HOSTS?Promise.resolve():ZB.load('js/zmg-hosts-data.js').catch(()=>{});
ZB.on('ready',()=>{Z();setTimeout(()=>{ZB.safe('zmg-start',()=>{loadH();preload();if(unlock(false)||Z().nw)newOffer();});},2500);});

/* ---------- стенд ?zmg=<id> ---------- */
function stand(){const q=new URLSearchParams(location.search),id=q.get('zmg');if(!id)return;window.__zmgStand=1;
  if(q.get('fresh')==='1'){S.zmg=zNew();}zmgFix(S);
  const go=()=>{try{if(typeof hideModal==='function')hideModal();}catch(e){}
    if(id==='list'){const h='<h2>Мини-игры</h2><p class="zmg-list">'+Object.keys(INFO).map(n=>{const i=INFO[n];return '<a href="?zmg='+i.id+'">'+n+'. '+escH(i.t)+'</a>';}).join('<br>')+'</p><div class="btns"><button class="btn" id="mCancel">OK</button></div>';
      if(typeof modal==='function'){modal(h);const b=$i('mCancel');if(b)b.onclick=hideModal;}return;}
    if(id==='ugolok'){ugolok();return;}
    if(ZMG.stand[id]){ZMG.stand[id](q);return;}
    if(!infoOf(id)){toastT('?zmg='+id+': нет такой игры');return;}
    const op={mode:q.get('mode')||'cab',back:()=>{}};if(q.get('seed')!=null)op.seed=+q.get('seed');
    if(op.mode==='fest')op.fest={id:q.get('fest')||'halloween',t:'Праздник'};
    open(id,op);};
  setTimeout(go,300);}
ZB.on('ready',()=>ZB.safe('zmg-stand',stand));

/* ---------- бот: ZMG.bot('diktant') — sim по 200 зёрнам; ZMG.autoplay(k) — пройти открытую игру ходами host.bot ---------- */
function bot(id,n){const g=REG.by[id];if(!g||!g.sim)return null;n=n||200;const out={};
  for(const [nm,k] of[['плохой',.35],['средний',.6],['хороший',.85]]){let s=0;const t=[0,0,0,0];
    for(let i=0;i<n;i++){const seed=seedOf(id,20261000+i);const r=g.sim({id,seed,rnd:R(seed),mode:'cab',lvl:60,calm:false},k);s+=r.sc!=null?r.sc:r.score;t[r.st!=null?r.st:r.tier]++;}
    out[nm]={sc:+(s/n).toFixed(1),st:t.map(x=>Math.round(x/n*100)+'%').join(' / ')};}
  return out;}
function autoplay(k,ms){k=k==null?.85:k;return new Promise(res=>{let n=0;const step=()=>{const c=REG.cur;if(!c){res('closed');return;}
  const it=c.root.querySelector('.zmg-intro button');if(it){it.click();return setTimeout(step,ms||120);}
  if(c.root.querySelector('.zmg-res')){res('done');return;}
  if(++n>600){res('stuck');return;}try{if(c.host.bot)c.host.bot(k);}catch(e){console.error(e);}setTimeout(step,ms||120);};step();});}

/* ---------- наружу ---------- */
window.ZMG_REG=ZMG_REG;
const ZMG=window.ZMG={hosts:HG,hp,hsub,zateyaSay,INFO,IDS,RW,ZMG_RW,WEEK,ISSUES,PER_ISS,REG,OFF:ZMG_OFF,faces:FACES,stand:{},festFn:null,_per:null,
  open,close,load:loadGame,preload,Z,touch,fix:zmgFix,merge:zmgMerge,fresh:zNew,isOpen,avail,unlock,lockTxt,openList,dayId,perId,perDue,
  winOffer,noteAt,giveNote,ugolok,paperHtml,paperLoad,seed:seedOf,rng:R,pc:isPC,kc,say:sayH,face,whoName,esc:escH,
  words:(f)=>words(f),def:defOf,joke:jokeOf,bot,autoplay,ev:stEv,info:infoOf,
  get cur(){return REG.cur;},get busy(){return !!REG.cur;}};
})();
