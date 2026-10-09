'use strict';
/* MG0 «Затеи двора» — оболочка мини-игр Дворовой викторины (js/vmg-core.js). План: hobby-analytics/release-i/viktorina-boost/05-minigames.md §3–4.
   Журнал: release-i/viktorina-boost/logs/MG0.md. Образец — mg-core Обороны, но всё своё: имена только vmg… / VMG_…, наружу — VMG_REG, VMG_OPEN, window.VMG.

   ===================== ДОГОВОР ДЛЯ ЗАТЕЙ (MGA / MGB / MGC) =====================
   Файл затеи — js/vmg-<id>.js, весь код в IIFE (первой строкой: if(typeof VMG_REG!=='function')return;) (у каждого помощника свой префикс вспомогательных имён и CSS: vma-/vmb-/vmc-), подключается
   строкой <script src="js/vmg-<id>.js"></script> в index.html ПОСЛЕ js/vmg-core.js. Наружу — только регистрация:
     VMG_REG({id:'bukva', run(host,o){…}, sim?(o,k)=>({score,tier})})
       id — из списка VMG_INFO ниже (номер, название, ведущий, правило, открытие задаёт оболочка; можно переопределить n/who/about в регистрации).
   run(host,o) рисует ТОЛЬКО внутри host.el (под шапкой оболочки; шапку с названием и кнопкой ✕ рисует оболочка). Без таймеров на время (решение владельца).
     host.el — div (flex-колонка, прокрутка по вертикали, если не влезло); host.w/h — его размеры; host.onResize(fn); host.onQuit(fn) — уберите таймеры/слушатели;
     host.top(text) — строка справа в шапке («3 из 7»); host.say(who,text,mood) — HTML реплики персонажа (who: mihalych|zina|valya|kolya|mityai|valerka);
     host.keys(fn(key,e)) — клавиши ПК, пока затея на экране (вернуть true — клавиша съедена; Escape — оболочка); host.kc(lbl) — HTML значка клавиши;
     host.pc — есть мышь/клавиатура (подписи «на компьютере: …»); host.snd — звуки (SND: tap/right/wrong/coin/win/hint/pick);
     host.ad(kind) → Promise<bool> (ролик за награду; кнопку показывать только при host.adOk(); место STAT — mg_<id>_<kind>);
     host.done({score, tier:0..3, label?:'4 из 7 — верно', extra?:{tk:1}}) — конец захода: окно итогов, награды, рекорд, Грамоты рисует ОБОЛОЧКА (своё окно итогов не нужно);
     host.quit() — выйти без итогов. host.paused — идёт ролик/окно «Выйти?».
   o = {id, num, mode, train, seed, rnd, day, calm, big, lvl, ctx, rw, take, word, year}
     mode: 'pause' (Переменка после лестницы) | 'day' (Затея дня — одна на всех) | 'warm' (Разминка перед темой) | 'board' (с Доски) | 'new' (сразу после открытия) | 'train' (тренировка);
     train — без наград; seed — зерно (в 'day' одинаково у всех в этот день); rnd() — генератор 0..1 от seed; day — dayKey() (ЧИСЛО ГГГГММДД);
     calm — спокойный режим (без лишнего движения); big — «очень крупный шрифт»; lvl — пройденные уровни (S.lvl); ctx — {topic} для Разминки;
     rw — [0,5,10,15] монеты по ступени (для строки «до +15 💰»);
     take(n, f) — n вопросов базы для затеи (СВОЙ круг S.vmg.sn — «уже видел» S.seen НЕ трогается; вопросы сегодняшней Викторины дня не берутся; в 'day' — одинаковые у всех):
       f = {t:'ussr'|['ussr',…] — темы, d:[1,2] — сложность, one:1 — ответ одним словом (o.word), len:[5,9] — длина слова, x:1 — есть пояснение, year:1 — есть год (o.year), test(q)}
       вопрос q = {i:'ussr-001', t, d, q:'текст', a:[верный, 3 неверных той же «породы»], x:'пояснение', s:'источник', e}
     word(q) → 'МАЯК' (буквы А–Я, Ё→Е, без кавычек) или '' если ответ не одно чистое слово; year(q) → год (число) из ответа, иначе из пояснения, или 0.
   Ступени (tier): 0 — мало, 1–3 — звёзды. Монеты: VMG_RW.c[tier] (5/10/15), потолок от всех затей VMG_RW.cap (60 💰/день) — считает оболочка.
   Жетон Михалыча (бесплатный повтор подсказки на лестнице): 3★ в Затее дня или extra.tk=1 в Разминке; не больше 1 в день, запас ≤ 3 — оболочка.
   Сохранение: затея своих полей в S не заводит. Нужен свой маленький склад — host.mem() → объект S.vmg.m[<id>] (≤ 1 КБ, только числа/строки; облако — из более нового).
   Вид: классы-набор оболочки (css/vmg.css): .vmg-card (листок), .vmg-q (крупный текст), .vmg-opts > .vmg-opt (.ok/.no/.sel) — варианты ≥ 56 px,
     .vmg-x (пояснение), .vmg-tiles > .vmg-tile (буквы), .vmg-dots > i (.ok/.no/.cur — прогресс), .vmg-hint (строка «на компьютере…»), .vmg-kc (клавиша), .btn/.btn.accent — кнопки игры.
     Шрифт — от body.big (var(--qf)/(--af)), цвета — переменные темы (--card, --ink, --go, --ok, --no). Эмодзи в тексте сами меняются на значки look.js.
   Стенд: ?vmg=<id> (&mode=day|pause|warm|board|train &seed=N &tp=<тема> &fresh=1 — чистое сохранение затей) — затея сразу на весь экран;
     ?vmg=list — список; ?vmg=board — Доска объявлений. В консоли: VMG.bot('<id>') — прогон sim по 200 зёрнам (средний счёт и доли ступеней).
   STAT: ev 'mg' {a:'open'|'show'|'go'|'end'|'quit'|'tk', id, m, sc, st} — пишет оболочка; earn('mg', монеты).

   Сохранение S.vmg (владелец — MG0): {o:{num:1} открыта, s:{num:1} окно «Новая затея» показано, b:{num:рекорд}, n:{num:заходов}, x:очки Грамот, g:{ур:1} грамота выдана,
     tk:жетоны, tu:жетонов потрачено всего, d:{k:день, c:монет сегодня, t:жетон сегодня, p:{num:1 сыграно с наградой}, w:разминок, z:Затея дня сыграна}, dp:дней игры, dl:последний день,
     ol:лестниц при последнем открытии, od:день последнего открытия, pz:лестниц при последней Переменке, sn:{тема:биты своего круга}, m:{id:{…}}, ts}
   ==========================================================================================================================================================*/
(function(){
const LG=(ru,en)=>typeof L==='function'?L(ru,en):ru;
/* ---------- 14 затей: номер → id, название, ведущий, правило в 1 строку, открытие ----------
   Открытие (05 §4.1): №1–7 — по доигранным лестницам (ladFin), №8–14 — по дням игры; по одной (не больше одной новой за лестницу / за день). */
const VMG_INFO={
  1:{id:'pravda',n:'Правда или байка',who:'kolya',ic:'🎭',a:'Дядя Коля рассказывает — правда это или байка?',lad:1},
  2:{id:'razminka',n:'Разминка',who:'mihalych',ic:'💪',a:'Три «Знаешь ли ты…» по теме и два вопроса — за оба верных жетон подсказки',lad:2},
  3:{id:'anagram',n:'Анаграммы',who:'mityai',ic:'🔤',a:'Митяй рассыпал буквы ответа — собери слово',lad:3},
  4:{id:'bukva',n:'Буква за буквой',who:'valya',ic:'🧺',a:'Угадай слово-ответ по буквам, пока не упали прищепки',lad:5},
  5:{id:'god',n:'Угадай год',who:'mihalych',ic:'📅',a:'Листок календаря: в каком году это было?',lad:7},
  6:{id:'hrono',n:'Хронология',who:'valerka',ic:'📰',a:'Расставь события от раннего к позднему',lad:10},
  7:{id:'pary',n:'Пары',who:'valya',ic:'🃏',a:'Открывай карточки — найди пары',lad:14,day:4},
  8:{id:'lishnee',n:'Что лишнее?',who:'zina',ic:'🧐',a:'Четыре слова — одно не из той компании',day:5},
  9:{id:'tri',n:'По трём подсказкам',who:'mihalych',ic:'🔍',a:'Угадай с первой подсказки — получишь больше очков',day:6},
  10:{id:'kross',n:'Кроссвордик дня',who:'valerka',ic:'✏️',a:'Мини-кроссворд из газеты «Двор» — один на всех',day:8},
  11:{id:'posl',n:'Пословицы',who:'valerka',ic:'📖',a:'Валерка начал пословицу — выбери, чем она кончается',day:10},   // 09.10: вместо «Города» (решение владельца)
  12:{id:'karta',n:'Карта Михалыча',who:'mihalych',ic:'📍',a:'Поставь флажок на карте — где это?',day:14},
  13:{id:'opros',n:'Опрос двора',who:'zina',ic:'📋',a:'Что чаще всего ответили соседи Михалыча?',day:21},
  14:{id:'slova',n:'Слово из букв',who:'mityai',ic:'🧩',a:'Составь слова из букв длинного слова',day:28}};
const VMG_IDS={};for(const n in VMG_INFO){VMG_INFO[n].num=+n;VMG_IDS[VMG_INFO[n].id]=+n;}
/* ---------- награды: одна таблица (поменять — тут) ----------
   c — монеты по ступени 0..3, cap — потолок монет от ВСЕХ затей в день; tkDay/tkMax — жетоны Михалыча; x — очки Грамот по ступени, xRec — за рекорд;
   per — свои монеты затеи (Кроссвордик 3★ = 20). */
const VMG_RW={c:[0,5,10,15],cap:60,tkDay:1,tkMax:3,x:[1,3,5,8],xRec:2,per:{10:[0,5,10,20]}};
/* Грамоты двора — дорожка уровня «Знатока двора» по очкам всех затей; на уровнях — только оформление (листы на Доске объявлений) */
const VMG_GR=[{l:3,n:'Грамота «Знаток двора»',ic:'📜'},{l:6,n:'Грамота «Душа компании»',ic:'🎖'},{l:10,n:'Грамота «Голова!»',ic:'🏵'},{l:15,n:'Грамота «Гордость подъезда»',ic:'🏆'},{l:20,n:'Грамота «Почётный житель двора»',ic:'👑'}];
const vmgNeed=l=>20+5*l;
function vmgLv(x){let l=1;x=x|0;while(x>=vmgNeed(l)&&l<99){x-=vmgNeed(l);l++;}return {l,cur:x,need:vmgNeed(l)};}

const REG={by:{},list:[],cur:null};
function VMG_REG(g){if(!g||!g.id||REG.by[g.id]||typeof g.run!=='function')return;const n=g.num||VMG_IDS[g.id];if(!n){console.warn('vmg: нет такого id',g.id);return;}
  const i=VMG_INFO[n];g.num=n;g.n=g.n||i.n;g.who=g.who||i.who;g.ic=g.ic||i.ic;g.a=g.a||i.a;REG.by[g.id]=g;REG.list.push(g);}

/* ---------- сохранение S.vmg ---------- */
const ob=v=>!!v&&typeof v==='object'&&!Array.isArray(v),nn=v=>Math.max(0,(+v|0)||0);
function vNew(){return {o:{},s:{},b:{},n:{},x:0,g:{},tk:0,tu:0,d:{k:0,c:0,t:0,p:{},w:0,z:0},dp:0,dl:0,ol:0,od:0,pz:0,sn:{},m:{},ts:0};}
function vFixO(z){const d=vNew();for(const k in d)if(!(k in z))z[k]=d[k];
  for(const k of['o','s','b','n','g','sn','m'])if(!ob(z[k]))z[k]={};
  for(const k of['b','n'])for(const i in z[k])z[k][i]=nn(z[k][i]);for(const k of['o','s','g'])for(const i in z[k])z[k][i]=z[k][i]?1:0;
  for(const t in z.sn)if(typeof z.sn[t]!=='string')delete z.sn[t];for(const i in z.m)if(!ob(z.m[i]))delete z.m[i];
  for(const k of['x','tu','dp','dl','ol','od','pz'])z[k]=nn(z[k]);z.tk=Math.min(VMG_RW.tkMax,nn(z.tk));z.ts=+z.ts||0;
  if(!ob(z.d))z.d=d.d;z.d.k=nn(z.d.k);z.d.c=Math.min(VMG_RW.cap,nn(z.d.c));z.d.t=z.d.t?1:0;z.d.z=z.d.z?1:0;z.d.w=nn(z.d.w);if(!ob(z.d.p))z.d.p={};for(const i in z.d.p)z.d.p[i]=z.d.p[i]?1:0;
  return z;}
function vmgFix(s){s=s||S;try{if(!ob(s.vmg))s.vmg=vNew();vFixO(s.vmg);}catch(e){console.warn('vmg fix',e);s.vmg=vNew();}}
/* облако: открытое/виденное/грамоты — объединение; рекорды, заходы, очки, дни — максимум; свой круг вопросов — объединение битов;
   день — свежий (один и тот же — максимум); жетоны и склады затей — из более нового сохранения затей (их тратят) */
function vmgMerge(a,b){if(!ob(b))return a;b=vFixO(JSON.parse(JSON.stringify(b)));if(!ob(a))return b;a=vFixO(a);const bn=b.ts>a.ts;
  for(const k of['o','s','g'])for(const i in b[k])if(b[k][i])a[k][i]=1;
  for(const k of['b','n'])for(const i in b[k])a[k][i]=Math.max(a[k][i]|0,b[k][i]|0);
  for(const k of['x','dp','dl','ol','od','pz','tu'])a[k]=Math.max(a[k],b[k]);
  for(const t in b.sn)a.sn[t]=typeof bOr==='function'?bOr(a.sn[t]||'',b.sn[t]):b.sn[t];
  if(b.d.k>a.d.k)a.d=b.d;else if(b.d.k===a.d.k){a.d.c=Math.max(a.d.c,b.d.c);a.d.t=Math.max(a.d.t,b.d.t);a.d.w=Math.max(a.d.w,b.d.w);a.d.z=Math.max(a.d.z,b.d.z);for(const i in b.d.p)if(b.d.p[i])a.d.p[i]=1;}
  if(bn){a.tk=b.tk;a.m=b.m;}else for(const i in b.m)if(!(i in a.m))a.m[i]=b.m[i];
  a.ts=Math.max(a.ts,b.ts);return a;}
// встраиваемся в общие fixSave/mergeSave обёртками (общий код не правим): после общей починки/слияния — своя
if(typeof fixSave==='function'){const f0=fixSave;fixSave=function(){const r=f0.apply(this,arguments);vmgFix(S);return r;};}
if(typeof mergeSave==='function'){const m0=mergeSave;mergeSave=function(d){const loc=ob(S.vmg)?JSON.parse(JSON.stringify(S.vmg)):null;const r=m0.apply(this,arguments);
  try{S.vmg=loc?vmgMerge(loc,ob(d)?d.vmg:null):ob(d)&&ob(d.vmg)?vFixO(JSON.parse(JSON.stringify(d.vmg))):vNew();}catch(e){console.warn('vmg merge',e);}return r;};}
vmgFix(S);
function Z(){const z=S.vmg||(vmgFix(S),S.vmg),k=dayKey(0);if(z.d.k!==k){z.d={k,c:0,t:0,p:{},w:0,z:0};if(z.dl!==k){z.dp++;z.dl=k;}}return z;}
function touch(){S.vmg.ts=nowMs();}

/* ---------- открытие затей по прогрессу ---------- */
const lads=()=>typeof ladFin==='function'?ladFin():(S.fin||0);
function vmgReady(n){const i=VMG_INFO[n];if(!i||!REG.by[i.id])return false;const z=Z();return (i.lad&&lads()>=i.lad)||(i.day&&z.dp>=i.day&&lads()>=1);}
const vmgOpen=n=>!!(S.vmg&&S.vmg.o[n]&&REG.by[VMG_INFO[n].id]);
/* открыть следующую (одну): вернёт номер или 0. По одной: «лестничная» — не больше одной за доигранную лестницу, «дневная» — не больше одной в день
   (старый игрок с сотней лестниц получает №1 сразу, дальше по одной после каждой лестницы — без стены из 7 окон) */
function vmgUnlock(){const z=Z(),L=lads(),first=!Object.keys(z.o).some(k=>z.o[k]);
  for(let n=1;n<=14;n++){if(z.o[n]||!vmgReady(n))continue;const i=VMG_INFO[n];
    if(!first&&!(i.lad&&lads()>=i.lad?z.ol<L:z.od!==z.d.k))return 0;
    z.o[n]=1;z.ol=L;z.od=z.d.k;touch();save();try{STAT.ev('mg',{a:'open',id:i.id,n});}catch(e){}return n;}
  return 0;}
/* ближайшие закрытые (для Доски: «откроется через …») */
function vmgLockTxt(n){const i=VMG_INFO[n],z=Z();if(!i)return '';if(i.lad&&lads()<i.lad){const k=i.lad-lads();return 'ещё '+k+' '+plural(k,'лестница','лестницы','лестниц');}
  if(i.day&&z.dp<i.day){const k=i.day-z.dp;return 'через '+k+' '+plural(k,'день','дня','дней')+' игры';}return 'скоро';}

/* ---------- вопросы для затей: свой круг S.vmg.sn ---------- */
let dayEx={k:0,s:null};
function dayIds(){const k=dayKey(0);if(dayEx.k!==k){dayEx={k,s:new Set()};try{for(const i of seededSet(k*7919+13).qs)dayEx.s.add(i);}catch(e){}}return dayEx.s;}
function vmgWord(q){const w=String(q&&q.a&&q.a[0]||'').replace(/[«»"„“”]/g,'').trim();return /^[А-ЯЁа-яё]{2,}$/.test(w)?w.toUpperCase().replace(/Ё/g,'Е'):'';}
function vmgYear(q){const f=s=>{const m=/(^|[^0-9])(1[0-9]{3}|20[0-2][0-9])(?![0-9])/.exec(String(s||''));return m?+m[2]:0;};return f(q&&q.a&&q.a[0])||f(q&&q.x);}
function vmgPool(f){f=f||{};const ts=f.t?[].concat(f.t):null,ex=dayIds(),ds=f.d?[].concat(f.d):null;
  return QS.filter(q=>(!ts||ts.indexOf(q.t)>=0)&&(!ds||ds.indexOf(q.d)>=0)&&!ex.has(q.i)&&!(typeof isBad==='function'&&isBad(q))&&(!f.x||q.x&&q.x.length>8)&&(!f.year||vmgYear(q))&&
    (!f.one||(()=>{const w=vmgWord(q);return w&&(!f.len||w.length>=f.len[0]&&w.length<=f.len[1]);})())&&(!f.test||f.test(q)));}
const snHas=q=>typeof bGet==='function'&&bGet(S.vmg.sn[q.t],q.n);
function vmgTake(n,f,o){const pool=vmgPool(f),R=o&&o.rnd||Math.random;if(!pool.length)return [];
  if(o&&o.mode==='day'){const a=shuffle(pool.slice().sort((x,y)=>x.i<y.i?-1:1),R);return a.slice(0,n);}   // одинаково у всех
  let fr=pool.filter(q=>!snHas(q));
  if(fr.length<n){const tt=new Set(pool.map(q=>q.t));for(const t of tt)S.vmg.sn[t]='';fr=pool;}                  // круг затей по этим темам — заново
  const out=shuffle(fr.slice(),R).slice(0,n);for(const q of out)S.vmg.sn[q.t]=bSet(S.vmg.sn[q.t],q.n);touch();return out;}

/* ---------- зерно и генератор ---------- */
function vmgSeed(id,day){let h=2166136261;const s=(day||dayKey(0))+'|vmg|'+id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
const vmgPC=()=>{try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}};
const kc=l=>'<kbd class="vmg-kc">'+esc(l)+'</kbd>';
function sayH(who,t,m){return '<div class="vmg-say"><div class="vmg-av">'+(typeof portrait==='function'?portrait(who||'mihalych',m||'norm'):'')+'</div><div class="vmg-sb">'+t+'</div></div>';}

/* ---------- клавиатура: один перехватчик (раньше общего) — пока затея на экране, клавиши идут только ей ---------- */
window.addEventListener('keydown',e=>{const c=REG.cur;if(!c)return;e.stopPropagation();if(e.ctrlKey||e.metaKey||e.altKey)return;
  const v=c.root.querySelector('.vmg-veil');
  if(e.key==='Escape'){e.preventDefault();if(v){const b=v.querySelector('[data-esc]');if(b)b.click();}else c.qb.click();return;}
  if(v){if((e.key==='Enter'||e.key===' ')&&!e.repeat){const b=v.querySelector('.btn.accent');if(b){e.preventDefault();b.click();}}return;}
  if(c.host.paused||e.repeat&&!/^Arrow/.test(e.key))return;for(const f of c.keys)try{if(f(e.key,e)){e.preventDefault();break;}}catch(x){console.error(x);}},true);

/* ---------- открыть затею. opt: {mode, ctx, seed, back(r) — после окна итогов/выхода, next:{t,f} — главная кнопка итогов} ---------- */
function VMG_OPEN(id,opt){opt=opt||{};const g=REG.by[id]||REG.by[(VMG_INFO[id]||{}).id];if(!g){toast('Затея не найдена');return null;}
  if(REG.cur)vmgClose();const z=Z(),mode=opt.mode||'train',train=mode==='train'||!!opt.train;
  const app=$('app')||document.body,root=document.createElement('div');root.id='vmgHost';root.className='vmg vmg-'+g.id;
  root.innerHTML='<div class="vmg-head"><span class="vmg-ic">'+g.ic+'</span><b class="vmg-nm">'+esc(g.n)+'</b><span class="vmg-top"></span><button class="vmg-xb" aria-label="Выйти">✕</button></div><div class="vmg-el"></div>';
  app.appendChild(root);const el=root.querySelector('.vmg-el'),qb=root.querySelector('.vmg-xb'),top=root.querySelector('.vmg-top');
  const rs=[],qs=[],keys=[];let fin=false,hold=false;
  const day=dayKey(0),seed=opt.seed!=null?opt.seed>>>0:mode==='day'?vmgSeed(g.id,day):(Math.random()*4294967296)>>>0;
  const o={id:g.id,num:g.num,mode,train,seed,rnd:rng(seed),day,calm:typeof calm==='function'&&calm(),big:!!S.big,lvl:S.lvl||0,ctx:opt.ctx||{},
    rw:train?[0,0,0,0]:(VMG_RW.per[g.num]||VMG_RW.c),take:null,word:vmgWord,year:vmgYear};
  o.take=(n,f)=>vmgTake(n,f,o);
  const host={el,id:g.id,root,get w(){return el.clientWidth;},get h(){return el.clientHeight;},get paused(){return hold||!!root.querySelector('.vmg-veil')||(typeof pauseWhy!=='undefined'&&pauseWhy&&pauseWhy.size>0);},
    set hold(v){hold=!!v;},snd:typeof SND!=='undefined'?SND:{},pc:vmgPC(),
    onResize(f){rs.push(f);},onQuit(f){qs.push(f);},keys(f){keys.push(f);},kc,top(t){top.textContent=t==null?'':String(t);},say:sayH,
    mem(){const m=S.vmg.m;return ob(m[g.id])?m[g.id]:(m[g.id]={});},
    adOk(){try{return typeof adBtnOk==='function'?adBtnOk():adOk();}catch(e){return false;}},
    ad(kind){return new Promise(res=>{try{if(typeof adHold==='function'&&adHold('mg'))return res(false);STAT.place('mg_'+g.id+'_'+(kind||'x'));let ok=false;
      showRewarded(()=>{ok=true;res(true);},()=>res(false),()=>{if(!ok&&REG.cur&&REG.cur.host===host){ok=true;res(true);return LG('подсказка твоя');}return typeof adLateCoins==='function'?adLateCoins():'';});}catch(e){res(false);}});},
    done(r){if(fin)return;fin=true;vmgFin(g,o,r||{},opt);},
    quit(){fin=true;vmgClose();if(opt.back)opt.back(null);}};
  qb.onclick=()=>{try{SND.tap();}catch(e){}if(fin){vmgClose();if(opt.back)opt.back(null);return;}quitAsk();};
  function quitAsk(){if(root.querySelector('.vmg-veil'))return;const v=document.createElement('div');v.className='vmg-veil';
    v.innerHTML='<div class="vmg-panel"><h2>Выйти из затеи?</h2><p>'+(train?'Рекорд этой попытки не запишется.':'Заход не засчитается — сыграть можно будет снова.')+'</p>'+
      '<div class="vmg-btns"><button class="btn accent">Продолжить</button><button class="btn" data-esc="1">Выйти</button></div></div>';
    root.appendChild(v);const bs=v.querySelectorAll('button');bs[0].onclick=()=>{SND.tap();v.remove();};
    bs[1].onclick=()=>{SND.tap();try{STAT.ev('mg',{a:'quit',id:g.id,m:mode});}catch(e){}host.quit();};}
  const onRs=()=>{for(const f of rs)try{f(host.w,host.h);}catch(e){console.error(e);}};window.addEventListener('resize',onRs);
  REG.cur={id:g.id,g,host,o,opt,root,qb,keys,qs,onRs,t0:Date.now()};
  if(typeof G!=='undefined'&&G&&typeof YG!=='undefined')try{YG.stop();}catch(e){}
  try{STAT.screen('mg_'+g.id);STAT.ev('mg',{a:'go',id:g.id,m:mode});}catch(e){}
  try{g.run(host,o);}catch(e){console.error(e);vmgClose();toast('Затея не запустилась');if(opt.back)opt.back(null);}
  return host;}
function vmgClose(){const c=REG.cur;if(!c)return;REG.cur=null;for(const f of c.qs)try{f();}catch(e){}window.removeEventListener('resize',c.onRs);c.root.remove();
  try{STAT.screen(typeof onScr==='function'&&onScr('scr-topics')?'topics':onScr('scr-game')?'game':'menu');}catch(e){}}

/* ---------- итог: награды, рекорд, Грамоты → окно итогов внутри host ---------- */
function vmgFin(g,o,r,opt){const c=REG.cur,z=Z(),n=g.num;r.score=Math.max(0,Math.round(+r.score||0));r.tier=Math.max(0,Math.min(3,r.tier|0));const ex=r.extra||{};
  const best=z.b[n]|0,rec=r.score>best&&best>0,lv0=vmgLv(z.x);if(r.score>best)z.b[n]=r.score;z.n[n]=(z.n[n]|0)+1;
  const out={coins:0,capped:false,tk:false,tkFull:false,xp:0,rec,gr:[],paid:false};
  const day=o.mode==='day',rewarded=!o.train&&(day?!z.d.z:!z.d.p[n]);   // Затея дня — своя награда, отдельно от обычного захода этой же затеи
  if(rewarded){if(day)z.d.z=1;else z.d.p[n]=1;out.paid=true;
    const want=(VMG_RW.per[n]||VMG_RW.c)[r.tier]||0,m=Math.max(0,Math.min(want,VMG_RW.cap-z.d.c));out.capped=m<want;
    if(m>0){z.d.c+=m;S.coins+=m;out.coins=m;try{STAT.earn('mg',m);}catch(e){}}
    if(o.mode==='warm')z.d.w++;
    if((day&&r.tier===3)||ex.tk){if(z.d.t)out.tkDay=true;else if(z.tk>=VMG_RW.tkMax)out.tkFull=true;else{z.tk++;z.d.t=1;out.tk=true;try{STAT.ev('mg',{a:'tk',id:g.id,k:z.tk});}catch(e){}}}
    out.xp=VMG_RW.x[r.tier]+(rec?VMG_RW.xRec:0);z.x+=out.xp;
    const lv1=vmgLv(z.x);for(const gr of VMG_GR)if(lv1.l>=gr.l&&!z.g[gr.l]){z.g[gr.l]=1;out.gr.push(gr);}}
  out.lv0=lv0;out.lv1=vmgLv(z.x);touch();save();if(typeof updCoins==='function')updCoins();
  try{STAT.ev('mg',{a:'end',id:g.id,m:o.mode,sc:r.score,st:r.tier,c:out.coins,rec:rec?1:0});}catch(e){}
  if(c)for(const f of c.qs.splice(0))try{f();}catch(e){}
  if(c)c.keys.length=0;
  vmgFinUI(g,o,r,out,opt);}
function vmgFinUI(g,o,r,out,opt){const c=REG.cur;if(!c)return;const root=c.root;
  const head=r.tier===3?'Отлично!':r.tier===2?'Хорошо!':r.tier===1?'Неплохо!':'Не беда!';
  let st='';for(let i=1;i<=3;i++)st+='<span class="vmg-st'+(i<=r.tier?' on':'')+'" style="animation-delay:'+(i*.18)+'s">⭐</span>';
  const rw=[];if(out.coins)rw.push('<div class="vmg-rw c">+'+out.coins+' 💰</div>');if(out.tk)rw.push('<div class="vmg-rw t">🎟 Жетон Михалыча</div>');
  if(out.rec)rw.push('<div class="vmg-rw r">🏆 Новый рекорд!</div>');for(const gr of out.gr)rw.push('<div class="vmg-rw g">'+gr.ic+' '+esc(gr.n)+'</div>');
  const notes=[];if(o.train)notes.push('Тренировка — без наград. Рекорд: '+Math.max(r.score,S.vmg.b[g.num]|0));
  else if(!out.paid)notes.push('Награду за эту затею сегодня уже получил — это заход на рекорд.');
  else if(out.capped)notes.push('Монеты затей на сегодня собраны ('+VMG_RW.cap+' 💰) — завтра ещё.');
  if(out.tk)notes.push('Жетон — бесплатный повтор подсказки «50 на 50» или «Спросить соседа» на лестнице. Жетонов: '+S.vmg.tk+' из '+VMG_RW.tkMax+'.');
  else if(out.tkDay)notes.push('Жетон Михалыча сегодня уже получен — завтра ещё один.');
  else if(out.tkFull)notes.push('Жетонов уже '+VMG_RW.tkMax+' — больше не помещается. Потрать на лестнице!');
  const lv=out.lv1,pr=Math.round(100*lv.cur/lv.need);
  const nx=opt.next||null,v=document.createElement('div');v.className='vmg-veil vmg-res';
  v.innerHTML='<div class="vmg-panel">'+sayH(g.who,esc(opt.line||(r.tier>=2?'Вот это голова!':r.tier===1?'Хорошо размялись!':'Ничего, в следующий раз получится!')),r.tier?'happy':'norm')+
    '<h2>'+head+'</h2><div class="vmg-stars">'+st+'</div>'+(r.label?'<p class="vmg-sc">'+esc(r.label)+'</p>':'')+
    (rw.length?'<div class="vmg-rws">'+rw.join('')+'</div>':'')+notes.map(t=>'<p class="vmg-note">'+esc(t)+'</p>').join('')+
    '<div class="vmg-xpb"><span>📜 Грамоты двора · ур. '+lv.l+'</span><span class="vmg-bar"><i style="width:'+pr+'%"></i></span></div>'+
    '<div class="vmg-btns">'+(nx?'<button class="btn accent" data-k="nx">'+esc(nx.t)+'</button>':'<button class="btn accent" data-k="ok">Готово</button>')+
    '<button class="btn" data-k="again" data-esc="'+(nx?'':'1')+'">↻ Ещё раз'+(o.train||!out.paid?'':' <small>без награды</small>')+'</button>'+(nx?'<button class="btn" data-k="ok" data-esc="1">Готово</button>':'')+'</div></div>';
  root.appendChild(v);root.querySelector('.vmg-top').textContent='';
  try{if(r.tier===3){SND.win();if(typeof confetti==='function')confetti();}else if(r.tier)SND.safe();if(out.coins)setTimeout(()=>SND.coin(),500);}catch(e){}
  const res={score:r.score,tier:r.tier,coins:out.coins,tk:out.tk};
  v.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{SND.tap();const k=b.dataset.k;vmgClose();
    if(k==='again')VMG_OPEN(g.id,{mode:'train',back:opt.back,ctx:opt.ctx});else if(k==='nx')nx.f(res);else if(opt.back)opt.back(res);});}

/* ---------- стенд ?vmg=<id> ---------- */
function stand(){const q=new URLSearchParams(location.search),id=q.get('vmg');if(!id)return;window.__vmgStand=1;
  if(q.get('fresh')==='1'){S.vmg=vNew();}vmgFix(S);
  const go=()=>{if(id==='list'){modal('<h2>Затеи двора</h2><p>'+REG.list.map(g=>'<a href="?vmg='+g.id+'">'+g.num+'. '+esc(g.n)+'</a>').join('<br>')+'</p><div class="row"><button class="btn" id="mCancel">Закрыть</button></div>');$('mCancel').onclick=hideModal;return;}
    if(id==='board'){if(window.VMG&&VMG.board)VMG.board();return;}
    if(!REG.by[id]&&!REG.by[(VMG_INFO[id]||{}).id]){toast('?vmg='+id+': нет такой затеи. Есть: '+REG.list.map(g=>g.id).join(', '));return;}
    const op={mode:q.get('mode')||'board',back:()=>{}};if(q.get('seed')!=null)op.seed=+q.get('seed');if(q.get('tp'))op.ctx={topic:q.get('tp')};
    hideModal();VMG_OPEN(id,op);};
  setTimeout(go,60);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stand);else setTimeout(stand,0);

/* ---------- бот: VMG.bot('pravda') — средний счёт и ступени для плохого/среднего/хорошего игрока (по 200 зёрен) ---------- */
function vmgBot(id,n){const g=REG.by[id];if(!g||!g.sim)return null;n=n||200;const out={};
  for(const [nm,k] of[['плохой',.35],['средний',.6],['хороший',.85]]){let s=0;const t=[0,0,0,0];
    for(let i=0;i<n;i++){const seed=vmgSeed(id,20261000+i);const r=g.sim({seed,rnd:rng(seed),mode:'board',lvl:5,take:(m,f)=>vmgTake(m,f,{rnd:rng(seed+1)}),word:vmgWord,year:vmgYear},k);s+=r.score;t[r.tier]++;}
    out[nm]={score:+(s/n).toFixed(1),tiers:t.map(x=>Math.round(x/n*100)+'%').join(' / ')};}
  return out;}

/* ---------- наружу ---------- */
window.VMG_REG=VMG_REG;window.VMG_OPEN=VMG_OPEN;
window.VMG={INFO:VMG_INFO,IDS:VMG_IDS,RW:VMG_RW,GR:VMG_GR,REG,open:VMG_OPEN,close:vmgClose,Z,touch,lv:vmgLv,need:vmgNeed,ready:vmgReady,isOpen:vmgOpen,unlock:vmgUnlock,lockTxt:vmgLockTxt,
  pool:vmgPool,take:vmgTake,word:vmgWord,year:vmgYear,seed:vmgSeed,pc:vmgPC,kc,say:sayH,fix:vmgFix,merge:vmgMerge,fresh:vNew,bot:vmgBot,lads,
  get cur(){return REG.cur;}};
})();
