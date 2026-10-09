'use strict';
/* vy-mg0 «Перекур у Толика» — оболочка мини-игр «Выезда со двора» (js/vymg-core.js). План: hobby-analytics/release-i/vyezd-boost/05-minigames.md, 00-plan.md п.4.
   Журнал: release-i/vyezd-boost/logs/MG0.md. Образец — vmg-core Викторины (правила) + mg-core Обороны (холст). Наружу — только VYMG_REG, VYMG_OPEN, window.VYMG.

   ===================== ДОГОВОР ДЛЯ ИГР (MGA / MGB / MGC) =====================
   Файл игры — js/vymg-<id>.js, весь код в IIFE, первой строкой: if(typeof VYMG_REG!=='function')return;
   Свои вспомогательные имена и CSS-классы — с префиксом потока: vya- (MGA), vyb- (MGB), vyc- (MGC), vy0- (MG0). Глобальных имён не заводить.
   Подключение — строкой <script src="js/vymg-<id>.js" defer></script> в index.html ПОСЛЕ js/vymg-core.js.
   Регистрация:  VYMG_REG({id:'zavedi', run(host,o){…}, sim?(o,k)=>({score,tier}), open?()=>bool})
     id — из таблицы VYMG_INFO ниже (номер, название, ведущий, значок, правило, открытие задаёт оболочка; n/who/ic/a можно переопределить).
     open() — необязательно: false, если игра сейчас недоступна по сезону (Снегоуборка до зимы).
     sim(o,k) — бот для проверки баланса: k = умение 0..1 (0,35 плохой / 0,6 средний / 0,85 хороший) → {score,tier}. VYMG.bot('<id>') — 200 зёрен.
   run(host,o) рисует ТОЛЬКО внутри host.el (под шапкой оболочки: значок, название, строка host.top, кнопка ✕ — их рисует оболочка).
     Игра 30–60 с; одно нажатие до начала; жёсткого таймера нет (мягкое «пока Шура не позвала» можно); ошибка не наказывает; кнопки ≥ 56 px; ПК — клавиши/мышь.
     host.el — div (position:relative, во всю ширину, высота — до низа экрана); host.w / host.h — его размеры в CSS px; host.dpr — плотность (≤2, на слабых ≤1,25).
     host.cv() → {cv, x, w, h, dpr} — холст во весь host.el (x — 2d-контекст, уже в CSS px; при смене размера холст переделывается сам, w/h обновляются — рисуйте от них).
     host.loop(fn(dt,t)) — цикл кадров: dt в секундах (≤ 0,05), на паузе (ролик, свёрнуто, окно «Выйти?») НЕ зовётся; сам останавливается при выходе/итоге.
     host.ptr(elem, {down(x,y,e), move(x,y,e), up(x,y,e)}) — касания/мышь (pointer-события), x/y — CSS px от левого верхнего угла elem; на паузе молчит.
     host.onResize(fn(w,h)); host.onQuit(fn) — уберите свои таймеры/слушатели (loop/ptr/keys оболочка снимает сама).
     host.intro({text, html?, hint?, btn?, who?}) → Promise — карточка «одно нажатие до начала» (реплика ведущего + кнопка; Пробел/Enter тоже); после неё — игра.
     VYMG.art — общие рисунки на холсте: car(x,{cx,by,w,col,kind:'sedan'|'old'|'van'|'bus',lights,frost,rot,lean}) — машина боком мордой вправо; sky(x,W,H,top,bot);
       house(x,X,Yниз,w,h,{fl,lit,seed,col}) — пятиэтажка; ground(x,W,H,y,col); rr(x,X,Y,W,H,r) — путь скруглённого прямоугольника; shade(цвет,±доля).
     host.top(text) — строка справа в шапке («2 из 3»); host.say(who,text,mood) → HTML реплики (who: tolik|shura|mihalych|valerka|mityai; mood: norm|happy|sad|wow);
     host.face(who,mood) → SVG-портрет (для своих рисунков в DOM); host.keys(fn(key,e)) — клавиши ПК, пока игра на экране (true — клавиша съедена; Escape — оболочка);
     host.kc(lbl) → HTML значка клавиши; host.pc — есть мышь (подписи «на компьютере: Пробел»); host.calm — спокойный режим (медленнее, без тряски);
     host.snd — звуки игры (SND: tap coin win crash horn go step whoosh flutter meow honk2 tow siren) — сами молчат, если звук выключен;
     host.ad(kind) → Promise<bool> — ролик за награду (кнопку показывать только при host.adOk(); место STAT — mg_<id>_<kind>);
     host.done({score, tier:0..3, label?:'2 из 3 завелись', extra?:{}}) — конец захода: окно итога, награды, рекорд рисует ОБОЛОЧКА (своё окно не нужно);
     host.quit() — выйти без итога; host.paused — пауза (идёт ролик, вкладка свёрнута, окно «Выйти?»); host.mem() → свой маленький склад S.vymg.m[<id>] (≤ 1 КБ, числа/строки).
   o = {id, num, mode, src, train, seed, rnd, day, calm, lvl, ctx, rw, car}
     mode/src — откуда пришёл игрок: 'win' (Перекур в окне победы), 'day' (Затея дня — одна раскладка на всех), 'cab' (кабинет/мастерская — тренировка без наград),
       'auto' (само: Фото при новой машине), 'map' (карта: Дорожные работы), 'new' (окно «Новая затея»);
     train — без наград; seed — зерно (в 'day' одинаковое у всех в этот день); rnd() — генератор 0..1 от seed; day — dayKey() (ЧИСЛО ГГГГММДД);
     lvl — пройдено дворов; ctx — что передал вход (Фото: {car:индекс MODELS, name}); rw — монеты по ступени [0,5,10,15] (0 в тренировке);
     car — {n:'«Москвич»', part:'фара', k:7, need:20} — какая деталь мастерской будет следующей (для строки «за деталь №7»).
   Ступени (tier): 0 — мало, 1–3 — звёзды. Награды считает ОБОЛОЧКА (таблица VYMG_RW): монеты 5/10/15 (потолок 40 💰 в день от всех игр)
     + деталь 🔩 для мастерской Толика (Затея дня — с 1★, остальное — с 2★; не больше 2 деталей в день). Тренировка (кабинет) — без наград.
   Жетон «Толик подтолкнёт» (бесплатный эвакуатор в следующем дворе): 3★ в Затее дня или в Багажнике; ≤1 в день, запас ≤2 — выдаёт оболочка.
   Сохранение: своих полей в S игра не заводит — только host.mem().
   Вид: классы-набор оболочки (css/vymg.css): .vymg-card (листок), .vymg-q (крупный текст), .vymg-opts > .vymg-opt (.ok/.no/.sel) — варианты ≥ 56 px,
     .vymg-hint (строка «на компьютере…»), .vymg-big (большая круглая кнопка «Держи»), .vymg-dots > i (.ok/.no/.cur), .btn / .btn.green — кнопки игры.
   Стенд: ?vymg=<id> (&mode=day|win|cab|auto|map &seed=N &fresh=1 — чистое сохранение мини-игр) — игра сразу на весь экран;
     ?vymg=list — список. В консоли: VYMG.bot('<id>') — прогон sim по 200 зёрнам.
   STAT: ev 'mg' {a:'open'|'show'|'go'|'end'|'quit'|'skip'|'rw', id, m:src, l:двор, sc, st, s:секунд, c:монет, pt:деталь, cap:1} — пишет оболочка; earn('mg', монеты).

   Сохранение S.vymg (владелец — MG0): {o:{num:1} открыта, s:{num:1} «Новая затея» показана, b:{num:рекорд}, n:{num:заходов},
     d:{k:день, c:монет сегодня, pt:деталей сегодня, pk:Перекуров с наградой, p:{num:1 сыграно с наградой}, z:Затея дня сыграна},
     dp:дней игры, dl:последний день, ol:дворов при последнем открытии, od:день последнего открытия, pw:побед с прошлого Перекура, pc:Перекуров показано,
     w:{t:деталей всего, f:{car:1 фото сделано}}, tk:жетоны «Толик подтолкнёт» (≤2), tu:потрачено всего, d.t:жетон сегодня выдан, m:{id:{…}}, ts}
   ==========================================================================================================================================================*/
(function(){
if(typeof S==='undefined'||typeof dayKey!=='function')return;
const LG=(ru,en)=>typeof L==='function'?L(ru,en):ru;
const escH=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
/* ---------- 15 игр: номер → id, название, ведущий, значок, правило, открытие ----------
   yd — открывается после стольких пройденных дворов, dp — или после стольких дней игры (что раньше; с 4-го двора). По одной за победу / за день. */
const VYMG_INFO={
  1:{id:'zavedi',ae:'Hold the key — let go when the needle is in the green',en:'Start the Moskvich',n:'Заведи «Москвич»',who:'tolik',ic:'🔑',a:'Держи ключ — отпусти, когда стрелка в зелёном',yd:4},
  2:{id:'moyka',ae:'Scrub the mud off the car and shoo the pigeon',en:'Car Wash by the Porch',n:'Мойка у подъезда',who:'shura',ic:'🧽',a:'Сотри грязь с машины и шугни голубя',yd:8,dp:2},
  3:{id:'bagazh',ae:'Pack seedlings, buckets and a rug into the trunk',en:'Pack the Trunk',n:'Багажник на дачу',who:'shura',ic:'🧳',a:'Уложи рассаду, вёдра и ковёр в багажник',yd:15,dp:4},
  4:{id:'doroga',ae:'Turn the road pieces — from the yard to the town',en:'Road Works',n:'Дорожные работы',who:'mihalych',ic:'🚧',a:'Поверни куски дороги — от двора до города',yd:12,dp:3},
  5:{id:'foto',ae:'“Snap!” — before a pigeon gets in the way',en:'Photo with the New Car',n:'Фото у новой машины',who:'valerka',ic:'📷',a:'«Снимаю!» — пока голубь не загородил',yd:6},
  6:{id:'regul',ae:'Let the cars through in turn, ambulance first',en:'Traffic Warden',n:'Регулировщик',who:'valerka',ic:'🚦',a:'Пропускай машины по очереди, скорую — первой',yd:20,dp:5},
  7:{id:'nomera',ae:'Catch the “lucky” number plates',en:'Number Plates',n:'Номера',who:'valerka',ic:'🔢',a:'Лови «счастливые» номера проезжающих машин',yd:25,dp:6},
  8:{id:'otlich',ae:'The yard in the morning and evening — find five differences',en:'Spot the Difference',n:'Найди отличия',who:'shura',ic:'🔍',a:'Двор утром и вечером — найди пять отличий',yd:30,dp:7},
  9:{id:'bayki',ae:'Tolik tells a story — true or tall tale?',en:'Garage Tales',n:'Байки гаража',who:'tolik',ic:'🗣',a:'Толик рассказывает — правда это или байка?',yd:35,dp:8},
  10:{id:'domino',ae:'A game in the yard — who calls “Fish!” first',en:'Dominoes with Grandpa Mityai',n:'Домино с дедом Митяем',who:'mityai',ic:'🎲',a:'Партия во дворе — кто первый «Рыба!»',yd:40,dp:9},
  11:{id:'polomka',ae:'“It’s knocking!” — find what broke under the bonnet',en:'Find the Fault',n:'Найди поломку',who:'tolik',ic:'🔧',a:'«Стучит!» — найди, что сломалось под капотом',yd:45,dp:10},
  12:{id:'zapravka',ae:'Pour exactly forty litres — not a drop more',en:'Fill It Up',n:'Заправка «до краёв»',who:'tolik',ic:'⛽',a:'Залей ровно сорок литров — ни капли мимо',yd:50,dp:11},
  13:{id:'ugaday',ae:'Guess the car by its silhouette',en:'Guess the Car',n:'Угадай машину',who:'mihalych',ic:'🚗',a:'По силуэту — что за машина?',yd:55,dp:12},
  14:{id:'parkovka',ae:'“Left! More! Stop!” — park it in the gap',en:'Reverse Parking',n:'Парковка задним ходом',who:'mityai',ic:'🅿',a:'«Левее! Ещё! Стоп!» — поставь машину в карман',yd:60,dp:13},
  15:{id:'sneg',ae:'Clear a track so the cars can drive out',en:'Snow Clearing',n:'Снегоуборка',who:'mihalych',ic:'❄',a:'Расчисти колею, чтобы машины выехали',yd:65,dp:14}};
const VYMG_IDS={};for(const n in VYMG_INFO){VYMG_INFO[n].num=+n;VYMG_IDS[VYMG_INFO[n].id]=+n;}
/* Затея дня по дням недели (0 — Вс): закрытая — ближайшая открытая по этому списку */
const VYMG_WEEK=['domino','moyka','otlich','regul','nomera','bayki','bagazh'];
/* ---------- награды: одна таблица (поменять — тут) ----------
   c — монеты по ступени 0..3; cap — потолок монет от ВСЕХ игр в день; pt — деталей в день; ptDay/ptTier — с какой ступени деталь (Затея дня / прочие);
   pk — Перекуров с наградой в день (дальше карточка в окне победы не появляется); every — Перекур раз в столько побед (по очереди 3 и 4) */
const VYMG_RW={c:[0,5,10,15],cap:40,pt:2,ptDay:1,ptTier:2,pk:3,every:[3,4],first:4,tkDay:1,tkMax:2,tkIds:['bagazh']};
/* жетон «Толик подтолкнёт» = бесплатный эвакуатор в следующем дворе (не в задании дня): за 3★ в Затее дня или в Багажнике (tkIds); ≤ tkDay в день, запас ≤ tkMax */
/* ---------- мастерская Толика: машины по очереди, детали — по порядку, следующая видна заранее ---------- */
const VYMG_CARS=[
  {id:'moskvich',en:'Moskvich',n:'«Москвич»',g:'«Москвича»',my:'он твой',need:20,col:'#4f8fc0',parts:['колесо','колесо','колесо','колесо','фара','фара','бампер','бампер','капот','дверь','дверь','стекло','руль','сиденье','аккумулятор','свеча','карбюратор','глушитель','багажник','значок']},
  {id:'pobeda',en:'Pobeda',n:'«Победа»',g:'«Победы»',my:'она твоя',need:30,col:'#5d6f5a',parts:['колесо','колесо','колесо','колесо','запаска','фара','фара','подфарник','подфарник','бампер','бампер','крыло','крыло','крыло','крыло','капот','дверь','дверь','дверь','дверь','стекло','заднее стекло','руль','сиденье','сиденье','аккумулятор','карбюратор','радиатор','глушитель','олень на капот']},
  {id:'chaika',en:'Chaika',n:'«Чайка»',g:'«Чайки»',my:'она твоя',need:40,col:'#1d1d22',parts:null}];
VYMG_CARS[2].parts=VYMG_CARS[1].parts.concat(['молдинг','молдинг','колпак','колпак','колпак','колпак','хром на решётку','антенна','приёмник','флажок']);
function carAt(t){let a=0;for(let i=0;i<VYMG_CARS.length;i++){const c=VYMG_CARS[i];if(t<a+c.need)return {i,c,k:t-a,need:c.need,done:false};a+=c.need;}
  const c=VYMG_CARS[VYMG_CARS.length-1];return {i:VYMG_CARS.length,c:null,k:0,need:0,done:true};}
const PART_EN={'колесо':'wheel','фара':'headlight','бампер':'bumper','капот':'bonnet','дверь':'door','стекло':'windscreen','руль':'steering wheel','сиденье':'seat','аккумулятор':'battery','свеча':'spark plug','карбюратор':'carburettor','глушитель':'exhaust','багажник':'boot lid','значок':'badge','запаска':'spare wheel','подфарник':'side light','крыло':'wing','заднее стекло':'rear window','радиатор':'radiator','олень на капот':'bonnet deer','молдинг':'trim','колпак':'hubcap','хром на решётку':'chrome grille','антенна':'aerial','приёмник':'radio','флажок':'pennant'};
const isEn=()=>typeof LANG!=='undefined'&&LANG==='en';
/* имя машины мастерской на языке игры: английское — из справочника ART (VYCARS.nm), иначе своё en; gen — родительный падеж («Москвича») */
function carN(c,gen){if(!c)return '';if(isEn()){try{if(window.VYCARS&&VYCARS.get&&VYCARS.get(c.id))return VYCARS.nm(c.id);}catch(e){}return c.en||c.n;}return gen?c.g:c.n;}
const partN=p=>typeof LANG!=='undefined'&&LANG==='en'&&PART_EN[p]?PART_EN[p]:p;
function carInfo(){const z=Z(),a=carAt(z.w.t);if(a.done)return {n:'',part:'',k:0,need:0,done:true};return {n:carN(a.c),id:a.c.id,part:partN(a.c.parts[a.k]||'деталь'),k:a.k+1,need:a.need,have:a.k,i:a.i};}
const built=()=>{const z=Z();let a=0,out=[];for(const c of VYMG_CARS){a+=c.need;if(z.w.t>=a)out.push(c.id);}return out;};

const REG={by:{},list:[],cur:null};
function VYMG_REG(g){if(!g||!g.id||REG.by[g.id]||typeof g.run!=='function')return;const n=g.num||VYMG_IDS[g.id];if(!n){console.warn('vymg: нет такого id',g.id);return;}
  const i=VYMG_INFO[n];g.num=n;const n0=g.n,a0=g.a,en=()=>typeof LANG!=='undefined'&&LANG==='en';   // название и правило — по ТЕКУЩЕМУ языку (Яндекс узнаёт язык после загрузки игр)
  Object.defineProperty(g,'n',{get:()=>en()?(g.en||i.en||n0||i.n):(n0||i.n),set:v=>{},configurable:true});Object.defineProperty(g,'a',{get:()=>en()?(g.ae||i.ae||a0||i.a):(a0||i.a),set:v=>{},configurable:true});
  g.who=g.who||i.who;g.ic=g.ic||i.ic;REG.by[g.id]=g;REG.list.push(g);REG.list.sort((a,b)=>a.num-b.num);
  try{if(window.VYMG&&VYMG.onReg)VYMG.onReg(g);}catch(e){}}

/* ---------- сохранение S.vymg ---------- */
const ob=v=>!!v&&typeof v==='object'&&!Array.isArray(v),nn=v=>Math.max(0,(+v|0)||0);
function vNew(){return {o:{},s:{},b:{},n:{},tk:0,tu:0,d:{k:0,c:0,pt:0,pk:0,p:{},z:0,t:0},dp:0,dl:0,ol:0,od:0,pw:0,pc:0,w:{t:0,f:{}},m:{},ts:0};}
function vFixO(z){const d=vNew();for(const k in d)if(!(k in z))z[k]=d[k];
  for(const k of['o','s','b','n','m'])if(!ob(z[k]))z[k]={};
  for(const k of['b','n'])for(const i in z[k])z[k][i]=nn(z[k][i]);for(const k of['o','s'])for(const i in z[k])z[k][i]=z[k][i]?1:0;
  for(const i in z.m)if(!ob(z.m[i]))delete z.m[i];
  for(const k of['dp','dl','ol','od','pw','pc','tu'])z[k]=nn(z[k]);z.tk=Math.min(VYMG_RW.tkMax,nn(z.tk));z.ts=+z.ts||0;
  if(!ob(z.d))z.d=d.d;z.d.k=nn(z.d.k);z.d.c=Math.min(VYMG_RW.cap,nn(z.d.c));z.d.pt=Math.min(VYMG_RW.pt,nn(z.d.pt));z.d.pk=nn(z.d.pk);z.d.z=z.d.z?1:0;z.d.t=z.d.t?1:0;
  if(!ob(z.d.p))z.d.p={};for(const i in z.d.p)z.d.p[i]=z.d.p[i]?1:0;
  if(!ob(z.w))z.w={t:0,f:{}};z.w.t=nn(z.w.t);if(!ob(z.w.f))z.w.f={};for(const i in z.w.f)z.w.f[i]=z.w.f[i]?1:0;
  return z;}
function vymgFix(s){s=s||S;try{if(!ob(s.vymg))s.vymg=vNew();vFixO(s.vymg);}catch(e){console.warn('vymg fix',e);s.vymg=vNew();}}
/* облако: открытое/виденное — объединение; рекорды, заходы, дни, детали — максимум; день — свежий (тот же — максимум); склады игр — из более нового */
function vymgMerge(a,b){if(!ob(b))return a;b=vFixO(JSON.parse(JSON.stringify(b)));if(!ob(a))return b;a=vFixO(a);const bn=b.ts>a.ts;
  for(const k of['o','s'])for(const i in b[k])if(b[k][i])a[k][i]=1;
  for(const k of['b','n'])for(const i in b[k])a[k][i]=Math.max(a[k][i]|0,b[k][i]|0);
  for(const k of['dp','dl','ol','od','pc','tu'])a[k]=Math.max(a[k],b[k]);if(bn){a.pw=b.pw;a.tk=b.tk;}
  a.w.t=Math.max(a.w.t,b.w.t);for(const i in b.w.f)if(b.w.f[i])a.w.f[i]=1;
  if(b.d.k>a.d.k)a.d=b.d;else if(b.d.k===a.d.k){for(const k of['c','pt','pk','z','t'])a.d[k]=Math.max(a.d[k],b.d[k]);for(const i in b.d.p)if(b.d.p[i])a.d.p[i]=1;}
  if(bn)a.m=b.m;else for(const i in b.m)if(!(i in a.m))a.m[i]=b.m[i];
  a.ts=Math.max(a.ts,b.ts);return a;}
// свои поля сохранения — через гнездо UX (UI.onSave с keys, ui-core 47be346): общий mergeSave S.vymg не трогает, сливает наш merge.
// Нет гнезда (ui-core не загрузился) — прежние обёртки fixSave/mergeSave (снимок своего поля до общего слияния).
if(window.UI&&typeof UI.onSave==='function'&&typeof UI.owns==='function')UI.onSave({id:'vymg',keys:['vymg'],fix:s=>vymgFix(s),
  merge:(s,d)=>{try{s.vymg=ob(s.vymg)?vymgMerge(s.vymg,ob(d)?d.vymg:null):ob(d)&&ob(d.vymg)?vFixO(JSON.parse(JSON.stringify(d.vymg))):vNew();}catch(e){console.warn('vymg merge',e);}}});
else{if(typeof fixSave==='function'){const f0=fixSave;fixSave=function(){const r=f0.apply(this,arguments);vymgFix(S);return r;};}
  if(typeof mergeSave==='function'){const m0=mergeSave;mergeSave=function(d){const loc=ob(S.vymg)?JSON.parse(JSON.stringify(S.vymg)):null;const r=m0.apply(this,arguments);
    try{S.vymg=loc?vymgMerge(loc,ob(d)?d.vymg:null):ob(d)&&ob(d.vymg)?vFixO(JSON.parse(JSON.stringify(d.vymg))):vNew();}catch(e){console.warn('vymg merge',e);}return r;};}}
vymgFix(S);
function Z(){const z=S.vymg||(vymgFix(S),S.vymg),k=dayKey(0);if(z.d.k!==k){z.d={k,c:0,pt:0,pk:0,p:{},z:0,t:0};if(z.dl!==k){z.dp++;z.dl=k;}}return z;}
function touch(){S.vymg.ts=typeof nowMs==='function'?nowMs():Date.now();}
const yards=()=>Math.max(0,(S.unlocked||1)-1);
function stEv(p){try{STAT.ev('mg',p);}catch(e){}}

/* ---------- открытие игр по прогрессу ---------- */
function gOk(g){try{return !g.open||g.open()!==false;}catch(e){return false;}}
function vymgReady(n){const i=VYMG_INFO[n];if(!i)return false;const g=REG.by[i.id];if(!g||!gOk(g))return false;const z=Z(),y=yards();
  return y>=i.yd||(!!i.dp&&y>=VYMG_RW.first&&z.dp>=i.dp);}
const vymgOpen=n=>{const i=VYMG_INFO[n];return !!(i&&S.vymg&&S.vymg.o[n]&&REG.by[i.id]&&gOk(REG.by[i.id]));};
/* открыть следующую (одну): вернёт номер или 0. По одной: не больше одной за победу (по дворам) и одной в день (по дням) */
function vymgUnlock(){const z=Z(),y=yards();
  for(let n=1;n<=15;n++){if(z.o[n]||!vymgReady(n))continue;const i=VYMG_INFO[n],byY=y>=i.yd;
    if(byY?z.ol>=y:z.od===z.d.k)return 0;
    z.o[n]=1;if(byY)z.ol=y;else z.od=z.d.k;touch();save();stEv({a:'open',id:i.id,l:y});return n;}
  return 0;}
function vymgLockTxt(n){const i=VYMG_INFO[n],z=Z(),y=yards();if(!i)return '';const g=REG.by[i.id];
  if(!g)return '';if(!gOk(g))return LG('не в этот сезон','not this season');
  const a=i.yd-y,b=i.dp?Math.max(0,i.dp-z.dp):99;
  if(a>0&&(b>=a||b>=99))return LG('ещё '+a+' '+plural(a,'двор','двора','дворов'),a+' more yards');
  if(b>0&&b<99)return LG('через '+b+' '+plural(b,'день','дня','дней')+' игры','in '+b+' days');
  return LG('после следующей победы','after your next win');}
const openList=()=>REG.list.filter(g=>vymgOpen(g.num));

/* ---------- зерно, портреты, мелочи ---------- */
function vymgSeed(id,day){let h=2166136261;const s=(day||dayKey(0))+'|vymg|'+id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
const R=typeof rng==='function'?rng:(seed=>{let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};});
const vymgPC=()=>{try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}};
const kc=l=>'<kbd class="vymg-kc">'+escH(l)+'</kbd>';
/* Портреты общих героев (решение владельца 09.10): Толик «Карбюратор» — копия holdem LOOK.tolik/headSvg; Михалыч, Валерка, Митяй — viktorina/js/look.js NEW;
   баба Шура — родная shuraSvg. Есть общий рисовальщик ART (window.VYPPL.svg(who,mood), js/art-people.js) — берём его; VYMG.faces[who]=fn(mood) — подмена для своей игры. */
let pvN=0;
function hEyes(m){return m==='happy'?'<path d="M75 96 q8 -8 16 0 M109 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<circle cx="83" cy="95" r="5.4" fill="#3a2a22"/><circle cx="117" cy="95" r="5.4" fill="#3a2a22"/><circle cx="84.5" cy="93.5" r="1.6" fill="#fff"/><circle cx="118.5" cy="93.5" r="1.6" fill="#fff"/>'
  :'<ellipse cx="83" cy="96" rx="4" ry="4.6" fill="#3a2a22"/><ellipse cx="117" cy="96" rx="4" ry="4.6" fill="#3a2a22"/><circle cx="84.3" cy="94.4" r="1.3" fill="#fff"/><circle cx="118.3" cy="94.4" r="1.3" fill="#fff"/>';}
function hBrows(m,c){return m==='sad'?'<path d="M72 80 q10 -2 18 5 M128 80 q-10 -2 -18 5" stroke="'+c+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<path d="M72 77 q10 -7 20 -1 M108 76 q10 -6 20 1" stroke="'+c+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :'<path d="M72 83 q10 -5 20 0 M108 83 q10 -5 20 0" stroke="'+c+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>';}
function hMouth(m,c){return m==='wow'?'<ellipse cx="100" cy="127" rx="7" ry="8" fill="'+c+'"/>'
  :m==='sad'?'<path d="M88 130 q12 -9 24 0" stroke="'+c+'" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='happy'?'<path d="M84 119 q16 19 32 0 q-16 6 -32 0z" fill="'+c+'"/><path d="M89 123 q11 6 22 0" fill="#fff" opacity=".9"/>'
  :'<path d="M86 121 q14 13 28 0" stroke="'+c+'" stroke-width="4.2" fill="none" stroke-linecap="round"/>';}
const TOLIK={bg:'#e3e9f2',body:'#2c5aa0',bodyX:'<path d="M72 150 v50 M128 150 v50" stroke="#1d3f73" stroke-width="8"/><circle cx="72" cy="172" r="4" fill="#f5b72d"/><circle cx="128" cy="172" r="4" fill="#f5b72d"/>',
  hat:'<path d="M50 74 q4 -44 52 -46 q46 2 50 40 q-50 -8 -102 6z" fill="#6b6f76"/><path d="M50 74 q50 -14 102 -6 q18 4 22 12 q-62 -10 -124 -6z" fill="#565a61"/><circle cx="102" cy="30" r="4" fill="#565a61"/>',
  face:'<path d="M76 116 q12 -8 24 -2 q12 -6 24 2 q-6 10 -24 6 q-18 4 -24 -6z" fill="#5b3a29"/><path d="M60 104 l8 2" stroke="#555" stroke-width="3" opacity=".5"/>',brow:'#5b3a29'};
function headSvg(o,m){const u='vy0p'+(++pvN),sk=o.skin||'#f5c9a8',sk2=o.skin2||'#e9ae88';
  return '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="'+u+'" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="'+(o.skinL||'#ffe2cc')+'"/><stop offset="1" stop-color="'+sk+'"/></radialGradient></defs>'+
  '<rect width="200" height="200" fill="'+(o.bg||'#f1ede2')+'"/>'+(o.back||'')+'<path d="M28 200 q4 -46 44 -54 h56 q40 8 44 54z" fill="'+o.body+'"/>'+(o.bodyX||'')+
  '<rect x="88" y="128" width="24" height="22" rx="8" fill="'+sk2+'"/><circle cx="53" cy="104" r="8" fill="'+sk+'"/><circle cx="147" cy="104" r="8" fill="'+sk+'"/>'+
  '<ellipse cx="100" cy="98" rx="47" ry="50" fill="url(#'+u+')"/>'+(o.hair||'')+
  '<ellipse cx="70" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".4"/><ellipse cx="130" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".4"/>'+
  hBrows(m,o.brow||'#6d5a4a')+hEyes(m)+(o.glasses||'')+'<path d="M100 100 q-5 12 -1 15 q4 2 7 -1" stroke="'+sk2+'" stroke-width="3" fill="none" stroke-linecap="round"/>'+
  hMouth(m,o.lip||'#b83b44')+(o.face||'')+(o.hat||'')+'</svg>';}
const BUST={
  mihalych:{old:1,body:'#5d6b7c',brow:'#9a9a9a',
    bodyX:'<path d="M56 158 l24 -6 l20 30 l20 -30 l24 6 q30 8 38 34 v28 H18 v-28 q8 -26 38 -34z" fill="#ff8a1f"/><path d="M20 196 h160" stroke="#f4f6f4" stroke-width="12"/><path d="M80 152 l20 30 l20 -30" fill="#39485a"/>',
    hat:'<path d="M46 80 q-2 -52 54 -54 q56 2 54 54 q-54 -16 -108 0z" fill="#6f5136"/><path d="M42 82 q58 -22 116 0 v14 q-58 -20 -116 0z" fill="#9b7650"/><path d="M42 84 q-12 30 0 52 q10 -4 13 -18 q-5 -16 -3 -32z M158 84 q12 30 0 52 q-10 -4 -13 -18 q5 -16 3 -32z" fill="#9b7650"/>',
    under:'<path d="M70 128 q14 -10 30 -3 q16 -7 30 3 q-6 14 -30 9 q-24 5 -30 -9z" fill="#c9cdd2"/>'},
  mityai:{old:1,body:'#fff',brow:'#c2c6cd',hair:'<path d="M50 104 q-6 -24 8 -36 q-2 18 5 30z M150 104 q6 -24 -8 -36 q2 18 -5 30z" fill="#d9dde3"/>',
    bodyX:'<g stroke="#1f4f9a" stroke-width="8"><path d="M40 176 h120 M24 194 h152 M18 212 h164"/></g>',
    face:'<path d="M68 142 q32 18 64 0" stroke="#c4c4c4" stroke-width="2.4" fill="none" stroke-dasharray="2 5"/><circle cx="101" cy="118" r="8" fill="#e8826f" opacity=".55"/>'},
  valerka:{body:'#2f9e44',brow:'#6b4420',skin:'#f6cfae',
    hair:'<path d="M52 96 q-6 -44 46 -50 q52 2 52 48 q-10 -22 -26 -20 q-10 -12 -24 -6 q-14 -10 -30 2 q-12 4 -18 26z" fill="#8a5a2b"/>',
    hat:'<path d="M50 76 q2 -44 50 -46 q48 2 50 46 q-50 -14 -100 0z" fill="#1c6fb8"/><path d="M100 64 q38 -6 68 10 q-4 9 -18 9 q-24 -9 -50 -7z" fill="#155a96"/>',
    bodyX:'<path d="M80 152 l20 22 l20 -22" fill="#fff"/>',
    face:'<g fill="#d9905b" opacity=".7"><circle cx="68" cy="116" r="2"/><circle cx="76" cy="121" r="2"/><circle cx="62" cy="122" r="2"/><circle cx="132" cy="116" r="2"/><circle cx="124" cy="121" r="2"/><circle cx="138" cy="122" r="2"/></g>'}};
const BG={mihalych:'#e6eef0',mityai:'#e8f0f8',valerka:'#e7f3e4'};
function bustSvg(id,m){const o=BUST[id]||BUST.mihalych,sk=o.skin||'#eebf99',sk2=o.skin2||'#dba27c',brow=o.brow||'#8c8c8c';
  const eyes=m==='happy'?'<path d="M72 104 q9 -9 18 0 M110 104 q9 -9 18 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>'
    :m==='wow'?'<circle cx="81" cy="103" r="6.4" fill="#3a2a22"/><circle cx="119" cy="103" r="6.4" fill="#3a2a22"/><circle cx="83" cy="101" r="1.8" fill="#fff"/><circle cx="121" cy="101" r="1.8" fill="#fff"/>'
    :'<ellipse cx="81" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><ellipse cx="119" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><circle cx="82.5" cy="101.5" r="1.4" fill="#fff"/><circle cx="120.5" cy="101.5" r="1.4" fill="#fff"/>';
  const brows='<path d="'+(m==='sad'?'M68 90 q10 -5 22 2 M132 90 q-10 -5 -22 2':m==='happy'||m==='wow'?'M67 86 q11 -9 23 -3 M133 86 q-11 -9 -23 -3':'M68 90 q11 -6 22 -2 M132 90 q-11 -6 -22 -2')+'" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>';
  const mouth=m==='happy'?'<path d="M82 132 q18 20 36 0 q-18 5 -36 0z" fill="#8f2f35"/><path d="M87 134.5 q13 5 26 0 l-2 3 q-11 4 -22 0z" fill="#fff"/>'
    :m==='sad'?'<path d="M88 140 q12 -9 24 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
    :m==='wow'?'<ellipse cx="100" cy="137" rx="8" ry="9" fill="#8f2f35"/>':'<path d="M86 133 q14 11 28 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
  return '<svg viewBox="0 0 200 220" aria-hidden="true"><rect width="200" height="220" fill="'+(BG[id]||'#eee')+'"/>'+(o.back||'')+'<path d="M10 220 q2 -52 46 -62 l24 -6 h40 l24 6 q44 10 46 62z" fill="'+o.body+'"/>'+(o.bodyX||'')+
    '<path d="M84 138 h32 v20 q-16 12 -32 0z" fill="'+sk2+'"/><ellipse cx="50" cy="110" rx="9" ry="12" fill="'+sk+'"/><ellipse cx="150" cy="110" rx="9" ry="12" fill="'+sk+'"/>'+
    '<path d="M52 92 q0 -48 48 -48 q48 0 48 48 q0 30 -14 46 q-14 16 -34 16 q-20 0 -34 -16 q-14 -16 -14 -46z" fill="'+sk+'"/>'+(o.hair||'')+
    '<ellipse cx="68" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/><ellipse cx="132" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/>'+
    (o.old?'<path d="M64 112 q5 3 10 2 M136 112 q-5 3 -10 2 M80 76 q20 -5 40 0" stroke="'+sk2+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>':'')+
    brows+eyes+'<path d="M100 104 q-9 18 -3 22 q5 3 11 -1 q3 -3 -1 -8" fill="'+sk2+'" opacity=".9"/>'+(o.under||'')+mouth+(o.face||'')+(o.hat||'')+'</svg>';}
const FACES={};
function face(who,m){m=m||'norm';const f=FACES[who];if(typeof f==='function')try{return f(m);}catch(e){}
  try{if(window.VYPPL&&typeof VYPPL.svg==='function'){const r=VYPPL.svg(who,m);if(r)return r;}}catch(e){}   // общий рисовальщик ART (js/art-people.js), если есть
  if(who==='shura')return typeof shuraSvg==='function'?shuraSvg(m==='sad'?'sad':'norm'):'';
  if(who==='tolik')return headSvg(TOLIK,m);return bustSvg(BUST[who]?who:'mihalych',m);}
const WHO={tolik:['Толик','Tolik'],shura:['Баба Шура','Granny Shura'],mihalych:['Михалыч','Mikhalych'],valerka:['Валерка','Valerka'],mityai:['Дед Митяй','Grandpa Mityai']};
const whoName=w=>LG((WHO[w]||WHO.tolik)[0],(WHO[w]||WHO.tolik)[1]);
function sayH(who,t,m){return '<div class="vymg-say"><span class="vymg-av vymg-av-'+escH(who)+'">'+face(who,m)+'</span><p class="vymg-sb"><b class="vymg-who">'+escH(whoName(who))+'</b>'+t+'</p></div>';}

/* ---------- клавиатура: один перехватчик (раньше общего) — пока игра на экране, клавиши идут только ей ----------
   Esc — окно «Выйти?» (в окне — его кнопка data-esc); P/З — пауза (ещё раз P или Esc — продолжить);
   в окнах оболочки (вступление, итог, «Выйти?», пауза): Enter/Пробел — выбранная стрелками кнопка, иначе зелёная; 1–9 — кнопки по порядку; стрелки — выбор кнопки. */
const isP=k=>k==='p'||k==='P'||k==='з'||k==='З';
function veilBtns(v){return [...v.querySelectorAll('.vymg-btns button')].filter(b=>!b.disabled&&b.offsetParent!==null);}
function veilKey(v,e){const k=e.key,bs=veilBtns(v);if(!bs.length)return false;
  if((k==='Enter'||k===' ')){if(e.repeat)return true;const f=bs.find(b=>b.classList.contains('vymg-kf'))||v.querySelector('.btn.green');if(f){f.click();return true;}return false;}
  if(/^[1-9]$/.test(k)){if(e.repeat)return true;const b=bs[+k-1];if(b){b.click();return true;}return false;}
  if(/^Arrow/.test(k)){let i=bs.findIndex(b=>b.classList.contains('vymg-kf'));if(i<0)i=Math.max(0,bs.findIndex(b=>b.classList.contains('green')));   // от выбранной (или зелёной) — на соседнюю
    i=(i+(k==='ArrowUp'||k==='ArrowLeft'?bs.length-1:1))%bs.length;bs.forEach(b=>b.classList.remove('vymg-kf'));bs[i].classList.add('vymg-kf');try{bs[i].focus({preventScroll:true});}catch(x){}return true;}
  return false;}
/* подсказка клавиш на кнопках окна (только ПК): зелёная — Enter, кнопка выхода — Esc, остальные — цифра по порядку */
function veilKc(v){if(!vymgPC())return;veilBtns(v).forEach((b,i)=>{if(b.querySelector('.vymg-kn'))return;const l=b.classList.contains('green')?'Enter':b.hasAttribute('data-esc')?'Esc':String(i+1);
  b.insertAdjacentHTML('beforeend',' <kbd class="vymg-kc vymg-kn">'+escH(l)+'</kbd>');});}
window.addEventListener('keydown',e=>{const c=REG.cur;if(!c)return;try{if(typeof unlockAudio==='function')unlockAudio();}catch(x){}e.stopPropagation();if(e.ctrlKey||e.metaKey||e.altKey)return;
  const v=c.root.querySelector('.vymg-veil');
  if(e.key==='Escape'){e.preventDefault();if(e.repeat)return;if(v){const b=v.querySelector('[data-esc]');if(b)b.click();}else c.qb.click();return;}
  if(isP(e.key)&&!e.repeat){if(v&&v.classList.contains('vymg-pz')){e.preventDefault();v.querySelector('.btn.green').click();return;}
    if(!v&&c.pause&&c.pause()){e.preventDefault();return;}}
  if(v){if(veilKey(v,e))e.preventDefault();return;}
  const it=c.root.querySelector('.vymg-intro');if(it&&(/^[1-9]$/.test(e.key)||/^Arrow/.test(e.key))){e.preventDefault();return;}   // вступление: только Enter/Пробел (ниже, через keys)
  if(c.host.paused||e.repeat&&!/^Arrow/.test(e.key))return;for(const f of c.keys)try{if(f(e.key,e)){e.preventDefault();break;}}catch(x){console.error(x);}},true);
window.addEventListener('keyup',e=>{const c=REG.cur;if(!c)return;e.stopPropagation();for(const f of c.keysUp)try{if(f(e.key,e)){e.preventDefault();break;}}catch(x){console.error(x);}},true);

/* ---------- открыть игру. opt: {mode/src, ctx, seed, train, back(res|null) — после итога/выхода, next:{t,f(res)} — главная кнопка итога, line — реплика итога} ---------- */
function VYMG_OPEN(id,opt){opt=opt||{};const g=REG.by[id]||REG.by[(VYMG_INFO[id]||{}).id];if(!g){if(typeof toast==='function')toast(LG('Игра не найдена','Game not found'));return null;}
  if(REG.cur)vymgClose();const z=Z(),mode=opt.mode||opt.src||'cab',train=mode==='cab'||!!opt.train;
  const app=document.getElementById('app')||document.body,root=document.createElement('div');root.id='vymgHost';root.className='vymg vymg-'+g.id;
  root.innerHTML='<div class="vymg-head"><span class="vymg-ic">'+g.ic+'</span><b class="vymg-nm">'+escH(g.n)+'</b><span class="vymg-top"></span>'+(vymgPC()?'<span class="vymg-khd">'+kc('Esc')+' '+LG('выход','exit')+' '+kc('P')+' '+LG('пауза','pause')+'</span>':'')+'<button class="vymg-xb" aria-label="'+LG('Выйти','Exit')+'">✕</button></div><div class="vymg-el"></div>';
  app.appendChild(root);const el=root.querySelector('.vymg-el'),qb=root.querySelector('.vymg-xb'),top=root.querySelector('.vymg-top');
  const rs=[],qs=[],keys=[],keysUp=[],loops=[],offs=[];let fin=false,hold=false,raf=0,last=0;
  const day=dayKey(0),seed=opt.seed!=null?opt.seed>>>0:mode==='day'?vymgSeed(g.id,day):(Math.random()*4294967296)>>>0;
  const lowDpr=typeof LOW!=='undefined'&&LOW?1.25:2,dpr=Math.min(lowDpr,window.devicePixelRatio||1);
  const o={id:g.id,num:g.num,mode,src:mode,train,seed,rnd:R(seed),day,calm:typeof calm==='function'&&!!calm(),lvl:yards(),ctx:opt.ctx||{},
    rw:train?[0,0,0,0]:VYMG_RW.c.slice(),car:carInfo()};
  const isPaused=()=>hold||!!root.querySelector('.vymg-veil')||(typeof pauseWhy!=='undefined'&&pauseWhy&&pauseWhy.size>0)||document.hidden;
  function tick(t){raf=0;if(fin||REG.cur!==cur)return;const dt=Math.min(.05,last?(t-last)/1000:0);last=t;
    if(!isPaused())for(const f of loops)try{f(dt,t/1000);}catch(e){console.error(e);}
    if(loops.length)raf=requestAnimationFrame(tick);}
  const host={el,id:g.id,root,dpr,get w(){return el.clientWidth;},get h(){return el.clientHeight;},get paused(){return isPaused();},
    set hold(v){hold=!!v;},snd:typeof SND!=='undefined'?SND:{},pc:vymgPC(),calm:o.calm,
    onResize(f){rs.push(f);},onQuit(f){qs.push(f);},keys(f){keys.push(f);},keysUp(f){keysUp.push(f);},kc,top(t){top.textContent=t==null?'':String(t);},
    say:sayH,face,
    intro(t){t=t||{};return new Promise(res=>{const d=document.createElement('div');d.className='vymg-intro';
      d.innerHTML='<div class="vymg-panel">'+sayH(t.who||g.who,t.text||escH(g.a),'happy')+(t.html||'')+(t.hint?'<p class="vymg-hint">'+t.hint+'</p>':'')+
        '<div class="vymg-btns"><button class="btn green">'+escH(t.btn||LG('Начать','Start'))+(vymgPC()?' <kbd class="vymg-kc vymg-kn">Enter</kbd>':'')+'</button></div></div>';
      el.appendChild(d);let done=false;const go=()=>{if(done)return;done=true;try{SND.tap();}catch(e){}d.remove();keys.splice(keys.indexOf(kf),1);res();};
      const kf=k=>{if(k==='Enter'||k===' '){go();return true;}return false;};keys.unshift(kf);d.querySelector('button').onclick=go;});},
    cv(){const c=document.createElement('canvas');c.className='vymg-cv';el.appendChild(c);const r={cv:c,x:c.getContext('2d'),w:0,h:0,dpr};
      const fit=()=>{r.w=Math.max(1,el.clientWidth);r.h=Math.max(1,el.clientHeight);c.width=Math.round(r.w*dpr);c.height=Math.round(r.h*dpr);c.style.width=r.w+'px';c.style.height=r.h+'px';r.x.setTransform(dpr,0,0,dpr,0,0);};
      fit();rs.unshift(fit);return r;},
    loop(f){loops.push(f);last=0;if(!raf)raf=requestAnimationFrame(tick);},
    ptr(e,h){const pos=ev=>{const b=e.getBoundingClientRect();return [ev.clientX-b.left,ev.clientY-b.top];};let act=null;
      const dn=ev=>{if(fin||isPaused())return;act=ev.pointerId;try{e.setPointerCapture(ev.pointerId);}catch(x){}ev.preventDefault();const p=pos(ev);if(h.down)h.down(p[0],p[1],ev);},
        mv=ev=>{if(fin||isPaused())return;const p=pos(ev);if(h.move)h.move(p[0],p[1],ev);},
        up=ev=>{if(act!==ev.pointerId)return;act=null;if(fin)return;const p=pos(ev);if(h.up)h.up(p[0],p[1],ev);};
      e.addEventListener('pointerdown',dn);e.addEventListener('pointermove',mv);e.addEventListener('pointerup',up);e.addEventListener('pointercancel',up);e.style.touchAction='none';
      offs.push(()=>{e.removeEventListener('pointerdown',dn);e.removeEventListener('pointermove',mv);e.removeEventListener('pointerup',up);e.removeEventListener('pointercancel',up);});},
    mem(){const m=S.vymg.m;return ob(m[g.id])?m[g.id]:(m[g.id]={});},
    adOk(){try{return typeof adOk==='function'&&adOk();}catch(e){return false;}},
    ad(kind){return new Promise(res=>{try{STAT.place('mg_'+g.id+'_'+(kind||'x'));let ok=false;hold=true;
      showRewarded(()=>{hold=false;if(!ok){ok=true;res(true);}},()=>{hold=false;if(!ok){ok=true;res(false);}},
        ()=>{hold=false;if(!ok&&REG.cur&&REG.cur.host===host){ok=true;res(true);return LG('Готово!','Done!');}return typeof adLateMsg==='function'?'':'';});}catch(e){hold=false;res(false);}});},
    done(r){if(fin)return;fin=true;stop();vymgFin(g,o,r||{},opt);},
    quit(){if(!fin){fin=true;stop();}vymgClose();if(opt.back)opt.back(null);}};
  function stop(){loops.length=0;if(raf)cancelAnimationFrame(raf);raf=0;for(const f of offs.splice(0))try{f();}catch(e){}keys.length=0;keysUp.length=0;}
  qb.onclick=()=>{try{SND.tap();}catch(e){}if(fin){vymgClose();if(opt.back)opt.back(null);return;}quitAsk();};
  function quitAsk(){if(root.querySelector('.vymg-veil'))return;const v=document.createElement('div');v.className='vymg-veil';
    v.innerHTML='<div class="vymg-panel"><h2>'+LG('Выйти из игры?','Leave the game?')+'</h2><p>'+(train?LG('Это тренировка — ничего не потеряешь.','It’s practice — nothing is lost.'):LG('Заход не засчитается — сыграть можно будет снова.','This run won’t count — you can play again.'))+'</p>'+
      '<div class="vymg-btns"><button class="btn green">'+LG('Продолжить','Continue')+'</button><button class="btn" data-esc="1">'+LG('Выйти','Leave')+'</button></div></div>';
    root.appendChild(v);veilKc(v);const bs=v.querySelectorAll('button');bs[0].onclick=()=>{try{SND.tap();}catch(e){}v.remove();last=0;};
    bs[1].onclick=()=>{try{SND.tap();}catch(e){}stEv({a:'quit',id:g.id,m:mode,s:Math.round((Date.now()-cur.t0)/1000)});host.quit();};}
  /* пауза (P/З): то же окно, что «Выйти?», но Esc и P — продолжить. Пока окно на экране, host.paused — true (игровой цикл стоит) */
  function pauseAsk(){if(fin||root.querySelector('.vymg-veil'))return false;const v=document.createElement('div');v.className='vymg-veil vymg-pz';
    v.innerHTML='<div class="vymg-panel"><h2>⏸ '+LG('Пауза','Paused')+'</h2><p>'+LG('Игра ждёт — продолжай, когда будешь готов.','The game is waiting — continue when ready.')+'</p>'+
      '<div class="vymg-btns"><button class="btn green" data-esc="1">'+LG('Продолжить','Continue')+'</button><button class="btn sec">'+LG('Выйти','Leave')+'</button></div></div>';
    root.appendChild(v);veilKc(v);const bs=v.querySelectorAll('button');bs[0].onclick=()=>{try{SND.tap();}catch(e){}v.remove();last=0;};
    bs[1].onclick=()=>{try{SND.tap();}catch(e){}v.remove();quitAsk();};return true;}
  const onRs=()=>{for(const f of rs)try{f(host.w,host.h);}catch(e){console.error(e);}};window.addEventListener('resize',onRs);
  const cur={id:g.id,g,host,o,opt,root,qb,keys,keysUp,qs,onRs,stop,pause:pauseAsk,t0:Date.now()};REG.cur=cur;
  document.documentElement.classList.add('vymg-open');
  try{if(typeof YG!=='undefined')YG.stop();}catch(e){}
  try{STAT.screen('mg_'+g.id);}catch(e){}stEv({a:'go',id:g.id,m:mode,l:yards(),tr:train?1:0});
  try{g.run(host,o);}catch(e){console.error(e);vymgClose();if(typeof toast==='function')toast(LG('Игра не запустилась','The game failed to start'));if(opt.back)opt.back(null);}
  return host;}
function vymgClose(){const c=REG.cur;if(!c)return;REG.cur=null;try{c.stop();}catch(e){}for(const f of c.qs)try{f();}catch(e){}window.removeEventListener('resize',c.onRs);c.root.remove();
  document.documentElement.classList.remove('vymg-open');
  try{const on=id=>{const e=document.getElementById(id);return e&&e.classList.contains('on');};STAT.screen(on('scr-game')?'game':'map');}catch(e){}}

/* ---------- итог: награды (монеты с потолком, деталь мастерской), рекорд → окно итога внутри оболочки ---------- */
function vymgFin(g,o,r,opt){const z=Z(),n=g.num;r.score=Math.max(0,Math.round(+r.score||0));r.tier=Math.max(0,Math.min(3,r.tier|0));
  const best=z.b[n]|0,rec=r.score>best&&best>0;if(r.score>best)z.b[n]=r.score;z.n[n]=(z.n[n]|0)+1;
  const out={coins:0,capped:false,part:null,ptCap:false,paid:false,rec,built:null};
  const day=o.mode==='day',rewarded=!o.train&&(day?!z.d.z:!z.d.p[n]);   // Затея дня — своя награда, отдельно от обычного захода этой же игры
  if(rewarded&&r.tier>=1){if(day)z.d.z=1;else z.d.p[n]=1;out.paid=true;if(o.mode==='win')z.d.pk++;
    const want=VYMG_RW.c[r.tier]||0,m=Math.max(0,Math.min(want,VYMG_RW.cap-z.d.c));out.capped=m<want;
    if(m>0){z.d.c+=m;S.coins=(+S.coins||0)+m;out.coins=m;try{STAT.earn('mg',m);}catch(e){}}
    if(r.tier>=(day?VYMG_RW.ptDay:VYMG_RW.ptTier)){if(z.d.pt>=VYMG_RW.pt)out.ptCap=true;else out.part=givePart(1,g.id);}
    if(r.tier===3&&(day||VYMG_RW.tkIds.indexOf(g.id)>=0)){if(z.d.t>=VYMG_RW.tkDay)out.tkDay=true;else if(z.tk>=VYMG_RW.tkMax)out.tkFull=true;else{z.tk++;z.d.t=1;out.tk=true;stEv({a:'tk',id:g.id,k:z.tk});}}}
  touch();save();if(typeof updCoins==='function')updCoins();
  stEv({a:'end',id:g.id,m:o.mode,sc:r.score,st:r.tier,s:Math.round((Date.now()-((REG.cur&&REG.cur.t0)||Date.now()))/1000),c:out.coins,pt:out.part?out.part.t:0,rec:rec?1:0});
  if(out.paid)stEv({a:'rw',id:g.id,c:out.coins,pt:out.part?out.part.t:0,cap:out.capped||out.ptCap?1:0});
  const c=REG.cur;if(c)for(const f of c.qs.splice(0))try{f();}catch(e){}
  try{if(window.VYMG&&VYMG.onEnd)VYMG.onEnd(g,o,r,out);}catch(e){}
  vymgFinUI(g,o,r,out,opt);}
/* выдать детали мастерской: n штук (обычно 1), src — откуда. Вернёт {t:номер детали всего, car, part, k, need, built:id|null} */
function givePart(n,src){const z=Z();let res=null;
  for(let i=0;i<n;i++){const a=carAt(z.w.t);z.d.pt++;
    if(a.done){try{if(window.PRT&&typeof PRT.add==='function')PRT.add(1,'mg');}catch(e){}res={t:z.w.t,car:'',part:LG('деталь в запас','a spare part'),k:0,need:0,built:null,spare:1};continue;}
    z.w.t++;const b=carAt(z.w.t);res={t:z.w.t,car:carN(a.c),cg:carN(a.c,1),id:a.c.id,part:partN(a.c.parts[a.k]||'деталь'),k:a.k+1,need:a.need,built:b.i>a.i?a.c.id:null};
    if(res.built){stEv({a:'built',id:res.built});try{if(window.VYMG&&VYMG.onBuilt)VYMG.onBuilt(res.built);}catch(e){}}}
  touch();save();return res;}
function vymgFinUI(g,o,r,out,opt){const c=REG.cur;if(!c)return;const root=c.root;
  const head=r.tier===3?LG('Отлично!','Excellent!'):r.tier===2?LG('Хорошо!','Good!'):r.tier===1?LG('Неплохо!','Not bad!'):LG('Не беда!','Never mind!');
  let st='';for(let i=1;i<=3;i++)st+='<span class="vymg-st'+(i<=r.tier?' on':'')+'" style="animation-delay:'+(i*.18)+'s">⭐</span>';
  const rw=[];if(out.coins)rw.push('<div class="vymg-rw c">+'+out.coins+' 💰</div>');
  if(out.part)rw.push('<div class="vymg-rw p">🔩 '+(out.part.spare?escH(out.part.part):LG('Деталь №'+out.part.k+' для '+escH(out.part.cg)+': ','Part #'+out.part.k+' for '+escH(out.part.car)+': ')+'<b>'+escH(out.part.part)+'</b>')+'</div>');
  if(out.tk)rw.push('<div class="vymg-rw t">🚚 '+LG('Жетон «Толик подтолкнёт»','Token “Tolik’s push”')+'</div>');
  if(out.rec)rw.push('<div class="vymg-rw r">🏆 '+LG('Новый рекорд!','New record!')+'</div>');
  const notes=[];
  if(o.train)notes.push(LG('Тренировка — без наград. Рекорд: ','Practice — no rewards. Best: ')+Math.max(r.score,S.vymg.b[g.num]|0));
  else if(!r.tier)notes.push(LG('Награда — с первой звезды. Попробуй ещё!','Rewards start from one star. Try again!'));
  else if(!out.paid)notes.push(LG('Награду за эту игру сегодня уже получил — это заход на рекорд.','You already got today’s reward for this game — this one is for the record.'));
  else{if(out.ptCap)notes.push(LG('Детали на сегодня собраны ('+VYMG_RW.pt+' в день) — завтра ещё.','Parts for today are collected ('+VYMG_RW.pt+' a day) — more tomorrow.'));
    else if(!out.part&&r.tier<(o.mode==='day'?VYMG_RW.ptDay:VYMG_RW.ptTier))notes.push(LG('Деталь Толик даёт за две звезды.','Tolik gives a part for two stars.'));
    if(out.tk)notes.push(LG('Жетон — бесплатный эвакуатор в следующем дворе (не в задании дня). Жетонов: '+S.vymg.tk+' из '+VYMG_RW.tkMax+'.','The token gives a free tow truck in your next yard (not in the daily). Tokens: '+S.vymg.tk+' of '+VYMG_RW.tkMax+'.'));
    else if(out.tkFull)notes.push(LG('Жетонов уже '+VYMG_RW.tkMax+' — сначала потрать во дворе.','You already hold '+VYMG_RW.tkMax+' tokens — use one first.'));
    if(out.capped)notes.push(LG('Монеты игр на сегодня собраны ('+VYMG_RW.cap+' 💰) — завтра ещё.','Game coins for today are collected ('+VYMG_RW.cap+' 💰) — more tomorrow.'));}
  const ci=carInfo(),bar=ci.done?'':'<div class="vymg-xpb"><span>🔧 '+LG('Мастерская Толика: ','Tolik’s workshop: ')+escH(ci.n)+' '+ci.have+'/'+ci.need+'</span><span class="vymg-bar"><i style="width:'+Math.round(100*ci.have/ci.need)+'%"></i></span></div>';
  const blt=out.part&&out.part.built?VYMG_CARS.find(x=>x.id===out.part.built):null;
  const line=opt.line||(blt?LG('Собрали '+blt.n+'! Теперь '+blt.my+' — выезжай во двор.','We built the '+carN(blt)+'! It’s yours now.'):r.tier>=2?LG('Вот это руки!','Golden hands!'):r.tier===1?LG('Неплохо для начала!','Not bad for a start!'):LG('Ничего, в следующий раз получится!','No worries, next time it’ll work!'));
  const nx=opt.next||null,v=document.createElement('div');v.className='vymg-veil vymg-res';
  v.innerHTML='<div class="vymg-panel">'+sayH(g.who,escH(line),r.tier?'happy':'norm')+
    '<h2>'+head+'</h2><div class="vymg-stars">'+st+'</div>'+(r.label?'<p class="vymg-sc">'+escH(r.label)+'</p>':'')+
    (rw.length?'<div class="vymg-rws">'+rw.join('')+'</div>':'')+notes.map(t=>'<p class="vymg-note">'+escH(t)+'</p>').join('')+bar+
    '<div class="vymg-btns">'+(nx?'<button class="btn green" data-k="nx">'+escH(nx.t)+'</button>':'<button class="btn green" data-k="ok">'+LG('Готово','Done')+'</button>')+
    '<button class="btn sec" data-k="again"'+(nx?'':' data-esc="1"')+'>↻ '+LG('Ещё раз','Again')+(o.train||!out.paid?'':' <small>'+LG('без награды','no reward')+'</small>')+'</button>'+(nx?'<button class="btn sec" data-k="ok" data-esc="1">'+LG('Готово','Done')+'</button>':'')+'</div></div>';
  root.appendChild(v);veilKc(v);root.querySelector('.vymg-top').textContent='';
  try{if(r.tier===3)SND.win();if(out.coins||out.part)setTimeout(()=>{try{SND.coin();}catch(e){}},500);}catch(e){}
  if(out.coins&&typeof coinFx==='function')try{coinFx(out.coins,v.querySelector('.vymg-rw.c'));}catch(e){}
  const res={score:r.score,tier:r.tier,coins:out.coins,part:out.part,tk:!!out.tk};
  v.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{try{SND.tap();}catch(e){}const k=b.dataset.k;vymgClose();
    if(k==='again')VYMG_OPEN(g.id,{mode:'cab',train:true,back:opt.back,next:opt.next,ctx:opt.ctx});else if(k==='nx')nx.f(res);else if(opt.back)opt.back(res);});}

/* ---------- Затея дня ---------- */
function dayId(){const w=new Date(typeof nowMs==='function'?nowMs():Date.now()).getDay(),want=VYMG_WEEK[w];
  if(vymgOpen(VYMG_IDS[want]))return want;for(let i=1;i<7;i++){const id=VYMG_WEEK[(w+i)%7];if(vymgOpen(VYMG_IDS[id]))return id;}const l=openList();return l.length?l[0].id:'';}

/* ---------- стенд ?vymg=<id> ---------- */
function stand(){const q=new URLSearchParams(location.search),id=q.get('vymg');if(!id)return;window.__vymgStand=1;
  if(q.get('fresh')==='1'){S.vymg=vNew();}vymgFix(S);
  const go=()=>{if(id==='list'){const h='<h2>'+LG('Мини-игры','Mini-games')+'</h2><p class="vymg-list">'+Object.keys(VYMG_INFO).map(n=>{const i=VYMG_INFO[n];return REG.by[i.id]?'<a href="?vymg='+i.id+'">'+n+'. '+escH(i.n)+'</a>':'<span>'+n+'. '+escH(i.n)+' — нет файла</span>';}).join('<br>')+'</p><div class="row"><button class="btn" id="mCancel">OK</button></div>';
      if(typeof modal==='function'){modal(h);const b=document.getElementById('mCancel');if(b)b.onclick=hideModal;}return;}
    if(window.VYMG&&VYMG.stand&&VYMG.stand[id]){VYMG.stand[id](q);return;}
    if(!REG.by[id]&&!REG.by[(VYMG_INFO[id]||{}).id]){if(typeof toast==='function')toast('?vymg='+id+': нет такой игры. Есть: '+REG.list.map(g=>g.id).join(', '),6000);return;}
    const op={mode:q.get('mode')||'cab',back:()=>{}};if(q.get('seed')!=null)op.seed=+q.get('seed');
    if(q.get('car')!=null&&typeof MODELS!=='undefined'){const k=+q.get('car');op.ctx={car:k,name:(MODELS[k]||{}).name};}
    if(typeof hideModal==='function')try{hideModal();}catch(e){}VYMG_OPEN(id,op);};
  setTimeout(go,120);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',stand);else setTimeout(stand,0);

/* ---------- бот: VYMG.bot('zavedi') — средний счёт и ступени для плохого/среднего/хорошего игрока (по 200 зёрен) ---------- */
function vymgBot(id,n){const g=REG.by[id];if(!g||!g.sim)return null;n=n||200;const out={};
  for(const [nm,k] of[['плохой',.35],['средний',.6],['хороший',.85]]){let s=0;const t=[0,0,0,0];
    for(let i=0;i<n;i++){const seed=vymgSeed(id,20261000+i);const r=g.sim({id,seed,rnd:R(seed),mode:'cab',lvl:20,calm:false},k);s+=r.score;t[r.tier]++;}
    out[nm]={score:+(s/n).toFixed(1),tiers:t.map(x=>Math.round(x/n*100)+'%').join(' / ')};}
  return out;}

/* ---------- общие рисунки для игр на холсте (VYMG.art): машина сбоку, небо, пятиэтажка, земля ---------- */
function rr(x,X,Y,W,H,r){r=Math.min(r,W/2,H/2);x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath();}
function shade(c,p){const v=parseInt(String(c).slice(1),16);if(!(v>=0))return c;const f=k=>Math.max(0,Math.min(255,Math.round(p<0?k*(1+p):k+(255-k)*p)));
  return '#'+((1<<24)|(f(v>>16)<<16)|(f(v>>8&255)<<8)|f(v&255)).toString(16).slice(1);}
/* car(x,{cx,by:низ колёс,w:длина,col,kind:'sedan'|'old'|'van'|'bus',lights,frost:0..1,rot:поворот колёс,lean:крен}) — машина боком, морда вправо */
function artCar(x,o){const w=o.w,cx=o.cx,by=o.by,col=o.col||'#4f8fc0',k=o.kind||'sedan',r=w*(k==='bus'?.07:.095),ink='#2b3340';
  const bodyBot=by-r*.55,bh=w*(k==='van'?.34:k==='bus'?.3:.17),bodyTop=bodyBot-bh,L=cx-w/2,Rr=cx+w/2;
  x.save();if(o.lean){x.translate(cx,by);x.rotate(o.lean);x.translate(-cx,-by);}
  x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.ellipse(cx,by+1,w*.52,r*.35,0,0,7);x.fill();
  x.lineWidth=Math.max(1.5,w*.012);x.strokeStyle=ink;x.lineJoin='round';
  // кабина / салон
  if(k==='sedan'||k==='old'){const ct=bodyTop-w*(k==='old'?.16:.14),c0=L+w*(k==='old'?.2:.22),c1=Rr-w*(k==='old'?.3:.27);
    x.fillStyle=col;x.beginPath();x.moveTo(c0-w*.07,bodyTop+1);
    if(k==='old'){x.quadraticCurveTo(c0-w*.02,ct,c0+w*.12,ct);x.lineTo(c1-w*.06,ct);x.quadraticCurveTo(c1+w*.03,ct,c1+w*.09,bodyTop+1);}
    else{x.lineTo(c0+w*.03,ct);x.lineTo(c1-w*.02,ct);x.lineTo(c1+w*.08,bodyTop+1);}
    x.closePath();x.fill();x.stroke();
    const gl=o.frost?'#dfe9f3':'#a9d4f2';x.fillStyle=gl;const wy0=ct+w*.025,wy1=bodyTop-w*.01;
    x.beginPath();x.moveTo(c0-w*.035,wy1);x.lineTo(c0+w*.045,wy0);x.lineTo(cx-w*.03,wy0);x.lineTo(cx-w*.03,wy1);x.closePath();x.fill();
    x.beginPath();x.moveTo(cx+w*.0,wy1);x.lineTo(cx,wy0);x.lineTo(c1-w*.03,wy0);x.lineTo(c1+w*.05,wy1);x.closePath();x.fill();
    if(o.frost){x.fillStyle='rgba(255,255,255,'+(.55*o.frost)+')';x.fillRect(c0-w*.03,wy0,c1-c0+w*.08,wy1-wy0);}}
  // кузов
  const grd=x.createLinearGradient(0,bodyTop,0,bodyBot);grd.addColorStop(0,shade(col,.18));grd.addColorStop(1,shade(col,-.12));x.fillStyle=grd;
  rr(x,L,bodyTop,w,bh,k==='old'?bh*.6:k==='bus'?w*.04:bh*.35);x.fill();x.stroke();
  if(k==='van'||k==='bus'){const n=k==='bus'?6:3,wy=bodyTop+bh*.14,wh=bh*.36,ww=(w*.82)/n;x.fillStyle=o.frost?'#dfe9f3':'#a9d4f2';
    for(let i=0;i<n;i++){rr(x,L+w*.05+i*ww+ww*.08,wy,ww*.84,wh,3);x.fill();}
    x.fillStyle=shade(col,-.25);x.fillRect(L+w*.02,bodyTop+bh*.62,w*.96,bh*.05);}
  else{x.strokeStyle='rgba(255,255,255,.55)';x.beginPath();x.moveTo(L+w*.06,bodyTop+bh*.42);x.lineTo(Rr-w*.06,bodyTop+bh*.42);x.stroke();x.strokeStyle=ink;
    x.beginPath();x.moveTo(cx-w*.03,bodyTop+bh*.1);x.lineTo(cx-w*.03,bodyBot-bh*.12);x.stroke();}
  // бампер, фары
  x.fillStyle='#cfd6de';rr(x,Rr-w*.03,bodyBot-bh*.32,w*.05,bh*.22,2);x.fill();x.stroke();rr(x,L-w*.02,bodyBot-bh*.32,w*.05,bh*.22,2);x.fill();x.stroke();
  x.fillStyle=o.lights?'#fff6b0':'#f4f1e3';x.beginPath();x.arc(Rr-w*.035,bodyTop+bh*.38,Math.max(2,bh*.15),0,7);x.fill();x.stroke();
  if(o.lights){const lg=x.createRadialGradient(Rr,bodyTop+bh*.38,2,Rr+w*.15,bodyTop+bh*.38,w*.25);lg.addColorStop(0,'rgba(255,240,160,.55)');lg.addColorStop(1,'rgba(255,240,160,0)');x.fillStyle=lg;x.beginPath();x.arc(Rr+w*.08,bodyTop+bh*.38,w*.25,0,7);x.fill();}
  x.fillStyle='#e5484d';rr(x,L+w*.005,bodyTop+bh*.25,w*.03,bh*.22,2);x.fill();
  // колёса
  for(const wx of k==='bus'?[L+w*.16,Rr-w*.18]:[L+w*.21,Rr-w*.21]){x.fillStyle='#262a30';x.beginPath();x.arc(wx,by-r,r,0,7);x.fill();
    x.fillStyle='#b9c1cc';x.beginPath();x.arc(wx,by-r,r*.48,0,7);x.fill();x.strokeStyle='#6d7682';x.lineWidth=Math.max(1,r*.12);
    const a=o.rot||0;x.beginPath();for(let i=0;i<3;i++){const q=a+i*2.094;x.moveTo(wx,by-r);x.lineTo(wx+Math.cos(q)*r*.45,by-r+Math.sin(q)*r*.45);}x.stroke();x.strokeStyle=ink;}
  x.restore();return {L,R:Rr,top:bodyTop-(k==='sedan'||k==='old'?w*.15:0),bodyTop,bodyBot,r};}
function artSky(x,W,H,top,bot){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,top||'#9fd6f2');g.addColorStop(1,bot||'#eaf6fb');x.fillStyle=g;x.fillRect(0,0,W,H);}
/* house(x,X,Y:низ,w,h,{fl:этажей,lit:доля светящихся окон,seed,col}) — пятиэтажка */
function artHouse(x,X,Y,w,h,o){o=o||{};const fl=o.fl||5,col=o.col||'#e9dcc0',rn=R(o.seed||7),cols=Math.max(3,Math.round(w/34));x.fillStyle=col;x.fillRect(X,Y-h,w,h);
  x.fillStyle=shade(col,-.25);x.fillRect(X-3,Y-h-6,w+6,7);const fh=(h-10)/fl,cw=w/cols;
  for(let f=0;f<fl;f++)for(let c=0;c<cols;c++){const lit=rn()<(o.lit||0);x.fillStyle=lit?'#ffd86b':'#9fc6dd';x.fillRect(X+c*cw+cw*.25,Y-h+8+f*fh+fh*.2,cw*.5,fh*.55);}}
function artGround(x,W,H,y,col){x.fillStyle=col||'#9bd27e';x.fillRect(0,y,W,H-y);x.fillStyle='rgba(0,0,0,.06)';x.fillRect(0,y,W,3);}

/* ---------- наружу ---------- */
window.VYMG_REG=VYMG_REG;window.VYMG_OPEN=VYMG_OPEN;
window.VYMG={INFO:VYMG_INFO,IDS:VYMG_IDS,RW:VYMG_RW,CARS:VYMG_CARS,WEEK:VYMG_WEEK,REG,faces:FACES,stand:{},art:{car:artCar,sky:artSky,house:artHouse,ground:artGround,rr,shade},
  open:VYMG_OPEN,close:vymgClose,Z,touch,ready:vymgReady,isOpen:vymgOpen,unlock:vymgUnlock,lockTxt:vymgLockTxt,openList,dayId,
  carInfo,carAt,built,givePart,carN,partN,seed:vymgSeed,rng:R,pc:vymgPC,kc,say:sayH,face,whoName,esc:escH,fix:vymgFix,merge:vymgMerge,fresh:vNew,bot:vymgBot,yards,ev:stEv,
  get cur(){return REG.cur;},get busy(){return !!REG.cur;}};
})();
