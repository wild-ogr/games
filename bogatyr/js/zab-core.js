'use strict';
/* ================= «🎪 Забавы» — ядро мини-игр (js/zab-core.js, BG0, 08.10.2026) =================
   План и договор: ~/Projects/hobby-analytics/release-i/minigames/bg-plan.md (описания игр — bogatyr.md там же). Журнал — release-i/bogatyr-zab/logs/BG0.md.
   Образец — js/mg-core.js «Тридевятой обороны» (ветка ob-final), имена переделаны под Богатыря (L вместо Lg, META_MODS, S.zab).

   ДОГОВОР ДЛЯ ИГР (каждая — свой файл js/zb<буква>-<id>.js, код в IIFE, наружу только ZAB_REG; подключать в index.html ПОСЛЕ zab-core.js):
     ZAB_REG({id, num:1..14, n:zabN('Имя','Name'), icon:'ключ ART'|'', open:()=>bool, kind:'daily'|'week'|'fest'|'after'|'kiln', en:true|false,
              run(host,o), sim?(o,k)=>{score,tier}, after?(r,out,o)=>[{img,t}] — доп. награды после начислений, noRec?:true — без «рекорда», noScore?:true — в итогах без звёзд и очков})
       (ZFIN) free?:true — без дневных потолков Славы/трофеев (клад), noRetry?:true — без «Ещё попытки» в итогах (клад); облик — extra.skin:'id' или ZAB_RW[n].skin[ступень] (zabSkinGive).
       ОДНА ПРОСЬБА РОЛИКА НА ЗАХОД: показали свою кнопку ролика — host.offer() (или host.ad()) → ядро в итогах «Ещё попытку» не предлагает; после досмотра host.adOk()=false.
       СИЛА: в одном походе — одна боевая сила забав (сильнейшая, zabBufAdd), вместе с узелком ≤ +20 %.
       open — дополнительное условие открытия (кроме общих правил ядра: после 3-го похода, ротация); en:false — игры нет в английской версии;
       sim(o,k) — быстрый бот без экрана: k — умение 0..1 (0,3 плохой / 0,6 средний / 0,9 хороший), вернуть {score,tier} (для zbBot(id)).
     run(host,o) рисует ТОЛЬКО внутри host.el (во весь экран), по окончании зовёт host.done({score, tier:0..3, extra}).
       host.el — div во весь экран; host.w/h — размеры; host.dpr — плотность (≤3); host.onResize(fn(w,h)); host.onQuit(fn) — уберите таймеры;
       host.ad(kind) → Promise<bool> (true — ролик досмотрен; место STAT zab_<id>), host.adOk() — можно ли показать кнопку ролика (одна просьба на окно!), host.offer() — «кнопку ролика показали» (STAT, звать при показе);
       host.quit() — выйти без итогов; host.paused — пауза (ролик/свёрнуто/окно «Выйти?»); host.snd — звуки (SND); host.btnQuit — кнопка ✕;
       host.store() — СВОЙ маленький объект игры в сейве (S.zab.g[id]; хранить только числа/строки/короткие массивы; клад: раскопанные клетки, лопаты…),
       host.touch() — «store изменился» (метка времени для облака + save()).
       o = {calm, lvl, seed, train, day, week, lang, rnd, mode, ctx, best}: calm — спокойный режим (медленнее, шире окна, без тряски);
       lvl — сколько глав пройдено; seed — зерно дня (одинаково у всех, НЕ совпадает с Обороной); train — тренировка без наград; rnd — mulberry(seed);
       mode — 'day'|'day2'(повтор за ролик)|'week'|'fest'|'after'|'kiln'|'train'; ctx — {slot: глава Логова, land:'les'…} и т. п.; best — рекорд.
     done(r): r.score — очки (целое ≥0), r.tier — ступень 0..3 (0 — «мимо», 3 — лучшая), r.extra — {buf:{might|hp|regen|spd|dish:доля}, tro:'tr_les',
       trN:число трофеев вместо таблицы, sl:Слава вместо таблицы, deco:'id украшения', pick:{…} (Три сундука), msg:'строка в итогах'}.
     Награды, «Ещё попытка за рекламу», окно итогов, сейв, STAT — делает ядро. Игре свои ключи S.* заводить НЕЛЬЗЯ (только host.store()).
   Наборы для рисования: ZABK (canvas/text/loop/частицы/спрайты art.js/кнопки), zabPC() — есть мышь, zabKeys(host,fn) — клавиши, zabKeycap(g,x,y,'␣',px).
   Стенд: ?zab=<id> (&train=1 &calm=1 &lvl=N &seed=N &mode=week) — игра сразу во весь экран; ?zab=menu — экран «Забавы». Бот: zbBot('<id>') в консоли.

   Сейв (оболочка): S.zab = {d:{k:день, p:{id:сыграно с наградой}, a:{id:1 — ролик взят}, sl:Слава за день, tr:трофеев за день},
     b:{id:рекорд}, n:{id:сыграно всего}, w:{w:неделя, c:{id:сыграно}, r:{id:побед ≥2 ступени}}, lr:[слоты Логова, ждут «Три сундука»], lc:{слот:1 — сундуки взяты},
     s:{id:1 — видел}, u:{украшение/облик:1 — выдано}, g:{id:{…store игры, ts}}, in:1 — экран открывался, ts}
   S.zabBuf — сила на ОДИН следующий поход главы: {might, hp, regen, spd, dish, src:{вид:id}, ts}; пустой {ts} — израсходована.
   Рамки силы: только поход главы (не сеча, не поход дня, не неделя, не первый поход), вместе с узелком подворья ≤ +20 %, под ботом (?bot) — нет
   (кроме window.__zabBot=1), в рейтингах (сеча/день/неделя) не действует. */
const ZAB={list:[],by:{},num:{},cur:null};
/* ---------- 14 игр: id, вид, имена (имя из ZAB_REG главнее), кто делает ---------- */
const ZAB_INFO={
  1:{id:'nakoval',k:'daily',n:()=>L('Кузнецова наковальня','The Smith’s Anvil'),a:()=>L('Бей молотом в такт — закалка оружия на бой','Strike in rhythm — temper your weapon for battle')},
  2:{id:'zagadki',k:'daily',n:()=>L('Загадки Кота Учёного','The Learned Cat’s Riddles'),a:()=>L('Три загадки у дуба — без спешки','Three riddles by the oak — no rush'),en:false},
  3:{id:'klad',k:'daily',free:1,noRetry:1,n:()=>L('Карта старого клада','The Old Treasure Map'),a:()=>L('Копай: тепло или холодно?','Dig: warmer or colder?')},
  4:{id:'gorodki',k:'week',n:()=>L('Городки','Gorodki'),a:()=>L('Брось биту — выбей фигуру','Throw the bat — knock out the figure')},
  5:{id:'luk',k:'week',n:()=>L('Лук по яблоку','Apple Archery'),a:()=>L('Тяни тетиву — сбей яблоко','Draw the bow — hit the apple')},
  6:{id:'kulak',k:'fest',n:()=>L('Кулачный бой','Maslenitsa Fistfight'),a:()=>L('Прикройся и ударь — Масленица!','Block and strike — it’s Maslenitsa!')},
  7:{id:'kanat',k:'week',n:()=>L('Перетягивание каната','Tug of War'),a:()=>L('Тяни в лад — перетяни Лешего','Pull in rhythm — outpull the Leshy')},
  8:{id:'skachki',k:'week',n:()=>L('Скачки на Сивке-Бурке','Sivka-Burka Race'),a:()=>L('Прыгай через плетни, собирай подковы','Jump the fences, collect horseshoes')},
  9:{id:'travy',k:'daily',n:()=>L('Сбор трав','Herb Gathering'),a:()=>L('Собери травы по рецепту знахарки','Gather herbs for the healer’s recipe')},
  10:{id:'gadanie',k:'fest',n:()=>L('Гадание у колодца','Wishing Well Fortune'),a:()=>L('Запомни знаки на воде — Святки!','Remember the signs in the water — Yuletide!')},
  11:{id:'sunduki',k:'after',n:()=>L('Три сундука старосты','The Elder’s Three Chests'),a:()=>L('Логово взято! Выбери один сундук','The Lair is taken! Pick one chest')},
  12:{id:'chastokol',k:'week',n:()=>L('Оборона частокола','Defend the Palisade'),a:()=>L('Бей упырей, что лезут на плетень','Bop the ghouls climbing the fence')},
  13:{id:'pech',k:'kiln',n:()=>L('Печь: вынь пирог вовремя','Oven: Take the Pie in Time'),a:()=>L('Вынь, пока румяный и золотой','Take it out while it’s golden')},
  14:{id:'igla',k:'week',n:()=>L('Утка, заяц, яйцо','Duck, Hare, Egg'),a:()=>L('Следи за сундуком — где Кощеева игла?','Follow the chest — where is Koschei’s needle?')}};
for(const n in ZAB_INFO)ZAB_INFO[n].num=+n;
const ZAB_DAILY=[1,2,3,9];                 // постоянные (Травы — когда готова у BGA; Печь — в печи подворья)
const ZAB_WEEK=[4,5,7,12,14,8];            // «Забава недели» по кругу (неделя с понедельника): Городки → Лук → Канат → Частокол → Утка-заяц-яйцо → Скачки
const ZAB_FEST={6:'masl',10:'svyat'};      // праздничные: Кулачный бой — Масленица, Гадание — Святки (25.12–19.01)
const ZAB_WEEK0=2963;                      // weekNo() недели 12.10.2026 (пн) — с неё круг начинается с Городков (ZFIN)
const ZAB_FEST6={6:3};                     // Кулачный бой ещё и «гостем ярмарки» раз в 6 недель — в 4-ю неделю круга (Частокол), вместе с Забавой недели, не вместо

/* ---------- награды: ОДНА таблица (поменять — тут). Якоря bogatyr.md: за день ≤ ¼–⅓ похода (≈10–20 Славы, 1–3 трофея), золота нет ----------
   sl — Слава по ступени 0..3, tr — трофеев по ступени (земля: extra.tro или самая дальняя пройденная), buf — сила на 1 поход главы по ступени
   (вид → доля), weekly — недельная цель (см. игру). Общие потолки за день: slDay Славы, trDay трофеев (кроме «Трёх сундуков» — это праздник Логова).
   bufCap — потолок каждой силы, bagCap — сила забав + узелок подворья вместе. ad — ролик «Ещё попытка» (1 раз в день на игру, если ступень < 3). */
const ZAB_RW={
  1:{sl:[8,8,12,15],tr:[0,0,0,0],buf:[{might:.03},{might:.03},{might:.05},{might:.08}]},     // Наковальня: сырой/добрый/булатный (BGA)
  2:{sl:[0,6,12,18],tr:[0,0,0,1],acorn:1},                                                    // Загадки: 6 за верную; 3/3 → Золотой жёлудь (BG0)
  3:{sl:[0,0,5,30],tr:[0,1,1,5]},                                                              // Клад: находка — 1 трофей, клад — 5 + 30 Славы (BGC; счёт ведёт игра)
  4:{sl:[0,5,10,15],tr:[0,0,1,2]}, 5:{sl:[0,5,8,12],tr:[0,1,2,3],tro:'tr_pole'},              // Городки, Лук (BGB)
  6:{sl:[0,5,10,15],tr:[0,0,0,0],buf:[null,null,{hp:.05},{hp:.07}],skin:[null,null,null,'kushak'],skinRep:2}, // Кулачный бой: блины +7 % здоровья (ZFIN: +10 % давали +7 п. на стене гл.4); 3★ впервые — облик «Кушак» всем богатырям, потом 2 трофея (BGD)
  7:{sl:[0,4,8,10],tr:[0,1,1,2]}, 8:{sl:[0,5,10,15],tr:[0,0,1,2]},                             // Канат (BGB), Скачки (BGD)
  9:{sl:[0,4,6,8],tr:[0,0,0,0],buf:[null,{regen:.03},{regen:.04},{regen:.05}]},               // Травы: взвар — восстановление (BGA; ZFIN: 10 % и 7 % давали +6 п. на стене гл.4, 5 % — +3 п.)
  10:{sl:[0,5,10,15],tr:[0,0,1,1],buf:[null,null,{tro:1},{tro:1}]},                            // Гадание: вожаки +1 трофей в походе (BGA)
  11:{sl:[0,0,0,0],tr:[0,0,0,0]},                                                              // Три сундука: награда — выбранный сундук (extra.pick)
  12:{sl:[0,4,8,12],tr:[0,1,1,2],tro:'tr_kosh'}, 14:{sl:[0,4,8,12],tr:[0,1,1,2],tro:'tr_kosh'}, // Частокол, Утка-заяц-яйцо (BGC)
  13:{sl:[0,2,4,6],tr:[0,0,0,0],buf:[null,null,null,{dish:.02}]},                             // Печь: золотой пирог +2 % к блюду узелка (BG0)
  slDay:40,trDay:4,bufCap:{might:.08,hp:.07,regen:.05,spd:.05,dish:.02,tro:1},bagCap:.20,ad:1};

/* ---------- регистрация и сведения ---------- */
function zabN(ru,en){return {ru,en};}   // имя для ZAB_REG: n:zabN('Городки','Gorodki') — так его видит проверка перевода (i18n-scan)
function ZAB_REG(g){if(!g||!g.id||ZAB.by[g.id])return;if(!g.num)for(const n in ZAB_INFO)if(ZAB_INFO[n].id===g.id)g.num=+n;
  const i=ZAB_INFO[g.num];if(i){if(!g.kind)g.kind=i.k;if(g.en==null)g.en=i.en!==false;if(g.free==null&&i.free)g.free=1;if(g.noRetry==null&&i.noRetry)g.noRetry=1;}
  ZAB.list.push(g);ZAB.by[g.id]=g;if(g.num&&!ZAB.num[g.num])ZAB.num[g.num]=g;}
function zabG(n){return ZAB.num[n]||null;}
function zabName(g){if(!g)return '';if(g.n)return L(g.n.ru,g.n.en||g.n.ru);const i=ZAB_INFO[g.num];return i?i.n():g.id;}
function zabNameN(n){const g=zabG(n);if(g&&g.n)return zabName(g);const i=ZAB_INFO[n];return i?i.n():'';}
function zabAbout(n){const i=ZAB_INFO[n];return i?i.a():'';}
function zabIc(n,px){const g=zabG(n),k=g&&g.icon&&ART[g.icon]?g.icon:ART['zb_i'+n]?'zb_i'+n:'chest';return ic(k,px||96);}
/* зерно дня: свой набор («zab|»), чтобы не совпадало с Обороной в тот же день */
function zabSeed(id,day){day=day||dayKey();let h=2166136261;const s='zab|'+day+'|'+id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function zabCalm(){return !!(S&&S.calm);}
function zabLvl(){try{let n=0;for(const k in S.done)n++;return n;}catch(e){return 0;}}
function zabErr(w,x){zabErr.n=(zabErr.n||0)+1;if(zabErr.n<=5)console.warn('zab '+w+': '+(x&&x.message||x));}
function zabEv(a,x){try{const p={a:a};if(x)for(const i in x)p[i]=x[i];STAT.ev('zab',p);}catch(e){}}

/* ---------- сейв ---------- */
function zabNew(){return {d:{k:'',p:{},a:{},sl:0,tr:0},b:{},n:{},w:{w:0,c:{},r:{}},lr:[],lc:{},s:{},u:{},g:{},in:0,ts:0};}
function zabFixO(z){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),nn=v=>Math.max(0,(+v|0)||0),d=zabNew();
  for(const k in d)if(!(k in z))z[k]=d[k];
  for(const k of['b','n','lc','s','u','g'])if(!ob(z[k]))z[k]={};for(const k of['b','n'])for(const i in z[k])z[k][i]=nn(z[k][i]);for(const k of['lc','s','u'])for(const i in z[k])z[k][i]=z[k][i]?1:0;
  for(const i in z.g)if(!ob(z.g[i]))delete z.g[i];
  if(!ob(z.d))z.d=d.d;if(typeof z.d.k!=='string')z.d.k='';for(const k of['p','a'])if(!ob(z.d[k]))z.d[k]={};for(const i in z.d.p)z.d.p[i]=nn(z.d.p[i]);for(const i in z.d.a)z.d.a[i]=z.d.a[i]?1:0;z.d.sl=nn(z.d.sl);z.d.tr=nn(z.d.tr);
  if(!ob(z.w))z.w=d.w;z.w.w=nn(z.w.w);for(const k of['c','r'])if(!ob(z.w[k]))z.w[k]={};for(const k of['c','r'])for(const i in z.w[k])z.w[k][i]=nn(z.w[k][i]);
  if(!Array.isArray(z.lr))z.lr=[];z.lr=z.lr.map(x=>+x|0).filter((x,i,a)=>x>=0&&a.indexOf(x)===i&&!z.lc[x]).slice(0,20);
  z.in=z.in?1:0;z.ts=+z.ts||0;return z;}
function zabBufFix(b){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);if(!ob(b))return null;const o={ts:+b.ts||0};
  for(const k in ZAB_RW.bufCap){const v=+b[k]||0;if(v>0)o[k]=Math.min(ZAB_RW.bufCap[k],v);}if(ob(b.src)){o.src={};for(const k in b.src)if(typeof b.src[k]==='string')o.src[k]=b.src[k].slice(0,16);}return o;}
function ZAB_FIX(s){try{s=s||S;const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);if(s.zab!=null&&!ob(s.zab))s.zab=null;if(!s.zab)s.zab=zabNew();zabFixO(s.zab);
  if(s.zabBuf!=null)s.zabBuf=zabBufFix(s.zabBuf);}catch(e){zabErr('fix',e);}}
/* облако: рекорды/сыграно — максимум, виденное/выданное/взятые сундуки — объединение, день и неделя — свежие (одинаковые — максимум),
   ждущие сундуки — объединение минус взятые, store игры — более новый (ts), сила на бой — более новая (израсходованная = пустая с ts) */
function ZAB_MERGE(x,o){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),b=ob(x)&&ob(x.zab)?zabFixO(JSON.parse(JSON.stringify(x.zab))):null;
  if(b){if(!ob(o.zab))o.zab=b;else{const a=zabFixO(o.zab);a.ts=Math.max(a.ts,b.ts);a.in=Math.max(a.in,b.in);
    for(const k of['b','n'])for(const i in b[k])a[k][i]=Math.max(a[k][i]|0,b[k][i]|0);for(const k of['lc','s','u'])for(const i in b[k])if(b[k][i])a[k][i]=1;
    if(b.d.k>a.d.k)a.d=b.d;else if(b.d.k===a.d.k){for(const k of['p'])for(const i in b.d[k])a.d[k][i]=Math.max(a.d[k][i]|0,b.d[k][i]|0);for(const i in b.d.a)if(b.d.a[i])a.d.a[i]=1;a.d.sl=Math.max(a.d.sl,b.d.sl);a.d.tr=Math.max(a.d.tr,b.d.tr);}
    if(b.w.w>a.w.w)a.w=b.w;else if(b.w.w===a.w.w)for(const k of['c','r'])for(const i in b.w[k])a.w[k][i]=Math.max(a.w[k][i]|0,b.w[k][i]|0);
    a.lr=a.lr.concat(b.lr).filter((v,i,r)=>r.indexOf(v)===i&&!a.lc[v]);
    for(const i in b.g)if(!a.g[i]||(+b.g[i].ts||0)>(+a.g[i].ts||0))a.g[i]=b.g[i];}}
  const xb=ob(x)&&ob(x.zabBuf)?x.zabBuf:null;if(xb&&(!ob(o.zabBuf)||(+xb.ts||0)>(+o.zabBuf.ts||0)))o.zabBuf=zabBufFix(JSON.parse(JSON.stringify(xb)));}catch(e){zabErr('merge',e);}}
function ZB(){if(!S.zab)ZAB_FIX(S);const z=S.zab,k=dayKey();if(z.d.k!==k)z.d={k,p:{},a:{},sl:0,tr:0};const w=typeof weekNo==='function'?weekNo():0;if(z.w.w!==w)z.w={w,c:{},r:{}};return z;}
function zabTouch(){if(S.zab)S.zab.ts=Date.now();}
ZAB_FIX(S);   // первая загрузка: META_HK('FIX') в fixSave ещё не знал модуля

/* ---------- когда что открыто ---------- */
function zabOpen(){return (S.runs|0)>=3;}                                  // как вся мета: после 3-го похода
function zabWeekN(w){w=w==null?(typeof weekNo==='function'?weekNo():0):w;w-=ZAB_WEEK0;return ZAB_WEEK[((w%ZAB_WEEK.length)+ZAB_WEEK.length)%ZAB_WEEK.length];}
/* православная Пасха (юлианская формула + 13 дней, годы 1900–2099) → Масленица: неделя перед Великим постом (Пасха −55 … −49) */
function zabEaster(y){const a=y%4,b=y%7,c=y%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7,m=Math.floor((d+e+114)/31),day=(d+e+114)%31+1;return new Date(y,m-1,day+13);}
function zabFestOn(k,t){const d=new Date(t||dayMs()),y=d.getFullYear(),day0=new Date(y,d.getMonth(),d.getDate()).getTime();
  if(k==='masl'){const e=zabEaster(y).getTime(),a=e-55*864e5,b=e-49*864e5;return day0>=a&&day0<=b;}
  if(k==='svyat'){const m=d.getMonth()+1,dd=d.getDate();return m===12&&dd>=25||m===1&&dd<=19;}
  return false;}
function zabFest6(n,w){const k=ZAB_FEST6[n];if(k==null)return false;w=w==null?(typeof weekNo==='function'?weekNo():0):w;w-=ZAB_WEEK0;return ((w%6)+6)%6===k;}
function zabFest6In(n){const k=ZAB_FEST6[n];if(k==null)return -1;const w=(typeof weekNo==='function'?weekNo():0)-ZAB_WEEK0;return (k-((w%6)+6)%6+6)%6;}   // через сколько недель (0 — эта)
function zabFestNow(n){return zabFestOn(ZAB_FEST[n])||zabFest6(n);}
/* игра доступна сейчас (с наградой): зарегистрирована, есть в языке, общие правила + своё open() */
function zabAvail(n){const g=zabG(n);if(!g||!zabOpen())return false;if(LANG==='en'&&g.en===false)return false;
  try{if(typeof g.open==='function'&&!g.open())return false;}catch(e){return false;}
  const k=g.kind;if(k==='week')return zabWeekN()===n;if(k==='fest')return zabFestNow(n);if(k==='after')return ZB().lr.length>0;return true;}
function zabPlayed(n){return (ZB().d.p[n]|0)>0;}

/* ---------- начисления (Слава — meta-slava, трофеи — TRO_ADD; всё «если модуль есть») ---------- */
function zabTroTop(){try{if(typeof troTopId==='function')return troTopId();}catch(e){}return 'tr_les';}
function zabSl(n,free){n=Math.round(+n||0);if(n<=0||typeof slAddXp!=='function'||typeof SL!=='function'||!SL())return 0;const z=ZB();const m=free?n:Math.max(0,Math.min(n,ZAB_RW.slDay-z.d.sl));if(m<=0)return 0;
  if(!free)z.d.sl+=m;slAddXp(m,'zab');if(typeof slTouch==='function')slTouch();return m;}
function zabTr(id,n,free){n=Math.round(+n||0);if(n<=0||typeof TRO_ADD!=='function')return null;const z=ZB();const m=free?n:Math.max(0,Math.min(n,ZAB_RW.trDay-z.d.tr));if(m<=0)return null;
  if(!free)z.d.tr+=m;id=id||zabTroTop();TRO_ADD(id,m);return {id,n:m};}
function zabTrName(id){try{return typeof troName==='function'?troName(id):id;}catch(e){return id;}}
/* сила на 1 следующий поход главы. ПРАВИЛО (ZFIN, 08.10): в одном походе действует ОДНА боевая сила забав — сильнейшая
   (сила = доля от потолка своего вида; «к блюду узелка» весит ×0,25). Новая заменяет старую, только если она сильнее.
   «Вожаки +1 трофей» (Гадание) — не боевая, лежит рядом. Вместе с узелком подворья — не больше bagCap (+20 %), см. zabRUN. */
const ZAB_CB=['might','hp','regen','spd','dish'];
function zabBufPow(b){let m=0;if(!b)return 0;for(const k of ZAB_CB){const cap=ZAB_RW.bufCap[k];if(cap&&b[k]>0)m=Math.max(m,Math.min(b[k],cap)/cap*(k==='dish'?.25:1));}return m;}
function zabBufTop(b){let m=0,t='';for(const k of ZAB_CB){const cap=ZAB_RW.bufCap[k];if(!cap||!(b&&b[k]>0))continue;const p=Math.min(b[k],cap)/cap*(k==='dish'?.25:1);if(p>m){m=p;t=k;}}return t;}
function zabBuf(){const b=S.zabBuf;if(!b)return null;for(const k in ZAB_RW.bufCap)if(b[k]>0)return b;return null;}
function zabBufAdd(o,src){if(!o)return null;const b=zabBuf()?S.zabBuf:{ts:0};b.src=b.src||{};const n={},got={};let ch=0;
  for(const k in o){const cap=ZAB_RW.bufCap[k];if(cap==null)continue;const v=Math.min(cap,+o[k]||0);if(v>0)n[k]=v;}
  if(n.tro){if(!(b.tro>0)){b.tro=n.tro;b.src.tro=src||'';got.tro=n.tro;ch=1;}delete n.tro;}
  const tk=zabBufTop(n);if(tk&&zabBufPow(n)>zabBufPow(b)){for(const k of ZAB_CB){delete b[k];delete b.src[k];}b[tk]=n[tk];b.src[tk]=src||'';got[tk]=n[tk];ch=1;}
  if(!ch)return null;b.ts=Date.now();S.zabBuf=b;return got;}
function zabBufTxt(b){b=b||zabBuf();if(!b)return '';const a=[],pc=v=>String(Math.round(v*100));
  if(b.might)a.push(L('+'+pc(b.might)+'% урона','+'+pc(b.might)+'% damage'));if(b.hp)a.push(L('+'+pc(b.hp)+'% здоровья','+'+pc(b.hp)+'% health'));
  if(b.regen)a.push(L('+'+pc(b.regen)+'% восстановления','+'+pc(b.regen)+'% regeneration'));if(b.spd)a.push(L('+'+pc(b.spd)+'% скорости','+'+pc(b.spd)+'% speed'));
  if(b.dish)a.push(L('+'+pc(b.dish)+'% к блюду узелка','+'+pc(b.dish)+'% to your bundle dish'));if(b.tro)a.push(L('вожаки: +1 трофей','elites: +1 trophy'));return a.join(' · ');}
function zabRunOk(G){return !!G&&!G.endless&&!G.daily&&!G.weekly&&!G.first;}
/* начало похода: сила переходит в G.zbBuf (обрезка вместе с узелком ≤ bagCap), S.zabBuf — израсходована */
function zabRUN(G){try{const b=zabBuf();if(!b||!zabRunOk(G))return;if(/[?&]bot/.test(location.search)&&!window.__zabBot)return;
  const D=G.bag&&typeof DISHES!=='undefined'&&DISHES[G.bag],bag=D?D.fx:{},bagSum=(bag.hp||0)+(bag.spd||0)+(bag.might||0)+(bag.xp||0);
  let room=Math.max(0,ZAB_RW.bagCap-bagSum);const o={};
  const tk=zabBufTop(D?b:Object.assign({},b,{dish:0}));   // одна боевая сила — сильнейшая (старый сейв мог хранить две)
  if(tk){const v=Math.min(b[tk],room);if(v>0){o[tk]=v;room-=v;}}
  if(b.tro)o.tro=1;
  S.zabBuf={ts:Date.now()};save();
  if(!Object.keys(o).length)return;G.zbBuf=o;if(o.hp||o.might||o.regen||o.spd||o.dish){const hp0=G.hero.hp,lock=G.hpLock===hp0;computeStats();if(lock)G.hpLock=G.hero.hp;}
  if(typeof banner==='function')banner('🎪 '+L('Сила забав','Fun & Games boost'),zabBufTxt(o),2);
  zabEv('buf',{m:Math.round((o.might||0)*100),h:Math.round((o.hp||0)*100),r:Math.round((o.regen||0)*100),s:Math.round((o.spd||0)*100),d:Math.round((o.dish||0)*100),t:o.tro?1:0});}catch(e){zabErr('run',e);}}
function zabST(st){const o=typeof G!=='undefined'&&G&&G.zbBuf;if(!o)return;if(o.might)st.might*=1+o.might;if(o.hp)st.maxHp*=1+o.hp;if(o.spd)st.spd*=1+o.spd;
  if(o.regen)st.regen=(st.regen||0)+o.regen*(st.maxHp||100)*.01;
  if(o.dish&&G.bag&&typeof DISHES!=='undefined'&&DISHES[G.bag]){const f=DISHES[G.bag].fx;if(f.hp)st.maxHp*=1+o.dish;if(f.spd)st.spd*=1+o.dish;if(f.might)st.might*=1+o.dish;if(f.xp)st.xp*=1+o.dish;}}
function zabKILL(e){try{const o=typeof G!=='undefined'&&G&&G.zbBuf;if(!o||!o.tro||!e||!e.elite||e.prop)return;if(typeof TRO_ADD!=='function'||typeof troOfSlot!=='function')return;
  const id=troOfSlot(G.chi);if(!id)return;if((G.zbTro|0)>=5)return;G.zbTro=(G.zbTro|0)+1;TRO_ADD(id,1);}catch(x){zabErr('kill',x);}}
/* победа в Логове (глава 3 земли) → «Три сундука старосты» ждут */
function zabLair(slot){const r=typeof CAMP_S!=='undefined'&&CAMP_S[slot];if(!r)return false;try{if(typeof lairSlot==='function')return lairSlot(r.th)===slot;}catch(e){}return r.n===3;}
function zabEND(G,win){try{if(!G||!win||G.endless||G.daily||G.weekly)return;const s=G.chi;if(s==null||!zabLair(s))return;const z=ZB();
  if(z.lc[s]||z.lr.indexOf(s)>=0)return;z.lr.push(s);zabTouch();zabEv('lair',{c:s});}catch(e){zabErr('end',e);}}

/* ---------- общий стиль оверлеев (вид двора v23: пергамент, лента, рама) ---------- */
function zabCss(){if($('zabCss'))return;const st=document.createElement('style');st.id='zabCss';st.textContent=
 '#zabHost{position:fixed;top:0;right:0;bottom:0;left:0;z-index:60;background:#20160c;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}'+
 '#zabHost .zabEl{position:absolute;top:0;right:0;bottom:0;left:0;overflow:hidden}'+
 '.zabX{position:absolute;z-index:6;top:calc(env(safe-area-inset-top,0px) + 8px);right:8px;width:52px;height:52px;border-radius:16px;border:3px solid #3a2410;background:linear-gradient(#fdf0cf,#e6c98a);color:#3a2410;font:900 24px/1 inherit;box-shadow:0 4px 0 rgba(40,24,10,.5);display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer}'+
 '.zabX:active{transform:translateY(2px);box-shadow:0 2px 0 rgba(40,24,10,.5)}'+
 '.zabVeil{position:absolute;top:0;right:0;bottom:0;left:0;z-index:7;background:rgba(14,10,6,.6);display:flex;align-items:center;justify-content:center;padding:14px;overflow-y:auto;-webkit-overflow-scrolling:touch}'+
 '.zabVeil>.panel{width:100%;max-width:440px;margin:auto;position:relative;animation:zabPop .32s cubic-bezier(.2,1.4,.4,1) both}'+
 '@keyframes zabPop{from{transform:scale(.7);opacity:0}to{transform:none;opacity:1}}'+
 '@keyframes zabStar{0%{transform:scale(0) rotate(-40deg);opacity:0}70%{transform:scale(1.25) rotate(8deg);opacity:1}100%{transform:none;opacity:1}}'+
 '@keyframes zabRise{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}'+
 '.zabRes .zabScore{font-weight:900;font-size:54px;line-height:1;text-align:center;margin:2px 0 0;text-shadow:0 3px 0 rgba(255,255,255,.6)}'+
 '.zabRes .zabSub{text-align:center;font-weight:700;margin:4px 0 6px;font-size:16px}'+
 '.zabStars{display:flex;justify-content:center;gap:6px;margin:4px 0 6px}.zabStars i{font-style:normal;font-size:46px;line-height:1;color:#f5b21a;text-shadow:0 2px 0 #8a5a10,0 0 10px rgba(255,210,80,.6);opacity:0}'+
 '.zabStars i.on{animation:zabStar .45s ease-out both}.zabStars i.off{opacity:.4;color:#b8a888;text-shadow:0 2px 0 #6a5a40}'+
 '.zabRec{display:block;width:max-content;margin:0 auto 6px;padding:4px 14px;border-radius:12px;background:linear-gradient(#ffe066,#f5b21a);color:#4a2c04;font-weight:900;border:2px solid #b0760a}'+
 '.zabRw{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:6px 0}'+
 '.zabRw>div{display:flex;align-items:center;gap:6px;padding:6px 12px 6px 6px;border-radius:14px;background:#fff0bf;border:2px solid #e0a92e;font-weight:900;font-size:17px;color:#7a4200;animation:zabRise .35s ease-out both}'+
 '.zabRw>div img{width:34px;height:34px}.zabRw>div.big{flex-basis:100%;justify-content:center}.zabRw>div.big img{width:54px;height:54px}'+
 '.zabRw>div.buf{background:#eaf7d8;border-color:#7fb84f;color:#2f6a1c}.zabRw>div.no{background:rgba(110,67,31,.08);border-color:rgba(110,67,31,.25);color:#6a4a2a;font-weight:700}'+
 'body.zabCalm .zabVeil>.panel,body.zabCalm .zabStars i.on,body.zabCalm .zabRw>div{animation:none!important;opacity:1}';
 document.head.appendChild(st);}

/* ---------- открыть игру во весь экран. opt: {train, mode, ctx, calm, lvl, seed, back(out), onQuit} ---------- */
function ZAB_OPEN(id,opt){opt=opt||{};const g=ZAB.by[id]||zabG(+id);if(!g){toast(L('Забава не найдена','Game not found'));return null;}
  if(ZAB.cur)ZAB_CLOSE();zabCss();document.body.classList.toggle('zabCalm',zabCalm());
  const root=document.createElement('div');root.id='zabHost';const el=document.createElement('div');el.className='zabEl';root.appendChild(el);
  const qb=document.createElement('button');qb.className='zabX';qb.setAttribute('aria-label',L('Выйти','Exit'));qb.textContent='✕';root.appendChild(qb);
  document.body.appendChild(root);
  const rs=[],qs=[];let fin=false,hold=false;
  const host={el,id:g.id,root,get w(){return root.clientWidth;},get h(){return root.clientHeight;},get dpr(){return Math.min(3,window.devicePixelRatio||1);},
    get paused(){return hold||document.hidden||(typeof adShowing!=='undefined'&&!!adShowing);},set hold(v){hold=!!v;},snd:typeof SND!=='undefined'?SND:{},
    onResize(fn){rs.push(fn);},onQuit(fn){qs.push(fn);},
    adOk(){if(ZAB.cur&&ZAB.cur.host===host&&ZAB.cur.ad)return false;try{return adOk();}catch(e){return false;}},   // одна просьба на заход: ролик уже досмотрен — больше не просим
    offer(){if(!fin&&ZAB.cur&&ZAB.cur.host===host)ZAB.cur.asked=1;try{STAT.offer('zab_'+g.id);}catch(e){}},   // игра показала свою кнопку ролика → ядро в итогах «Ещё попытку» не предлагает
    ad(kind){if(!fin&&ZAB.cur&&ZAB.cur.host===host)ZAB.cur.asked=1;return new Promise(res=>{let ok=false;try{STAT.place('zab_'+g.id);showRewarded(()=>{if(ZAB.cur)ZAB.cur.ad=1;ok=true;res(true);},()=>res(false),()=>{if(ok)return '';if(ZAB.cur)ZAB.cur.ad=1;return adLateGold();} /* upd0910: забава уже пошла без ролика — за досмотр золото, как везде */);}catch(e){res(false);}});},
    store(){const z=ZB();if(!z.g[g.id])z.g[g.id]={ts:0};return z.g[g.id];},
    touch(){const z=ZB();if(z.g[g.id])z.g[g.id].ts=Date.now();zabTouch();save();},
    done(r){if(fin)return;fin=true;ZAB_FIN(g,o,r||{},opt);},
    quit(){fin=true;ZAB_CLOSE();if(opt.onQuit)try{opt.onQuit();}catch(e){}},
    btnQuit:qb};
  const day=dayKey(),seed=opt.seed!=null?opt.seed>>>0:zabSeed(g.id,day),mode=opt.train?'train':opt.mode||'day';
  const o={calm:opt.calm!=null?!!opt.calm:zabCalm(),lvl:opt.lvl!=null?opt.lvl:zabLvl(),seed,train:mode==='train',day,week:typeof weekNo==='function'?weekNo():0,lang:LANG,
    rnd:mulberry(seed),mode,ctx:opt.ctx||{},best:ZB().b[g.id]|0};
  qb.onclick=()=>{try{SND.click();}catch(e){}if(fin){ZAB_CLOSE();return;}ZAB_QUIT_ASK(host);};
  const onRs=()=>{for(const f of rs)try{f(host.w,host.h);}catch(e){console.error(e);}};
  window.addEventListener('resize',onRs);
  ZAB.cur={id:g.id,g,host,o,opt,onRs,qs,t0:Date.now(),ad:mode==='day2'?1:0};
  if(!ZB().s[g.id]){ZB().s[g.id]=1;zabTouch();}
  try{STAT.screen('zab_'+g.id);ZAB.src=String(opt.src||(mode==='kiln'?'pech':window.ZAB_SRC||'menu'));zabEv('go',{id:g.id,m:mode,lv:o.lvl,src:ZAB.src});}catch(e){}
  try{if(typeof musicDuck==='function')musicDuck(true);}catch(e){}
  try{g.run(host,o);}catch(e){console.error(e);zabErr('run-'+g.id,e);ZAB_CLOSE();toast(L('Забава не запустилась','The game failed to start'));}
  return host;}
/* ✕ во время игры: «Выйти? Попытка не засчитается» */
function ZAB_QUIT_ASK(host){const c=ZAB.cur;if(!c||c.host!==host){host.quit();return;}if(host.root.querySelector('.zabVeil'))return;host.hold=true;
  const v=document.createElement('div');v.className='zabVeil';const rw=c.o.mode!=='train';
  v.innerHTML='<div class="panel"><h3>'+L('Выйти из забавы?','Leave the game?')+'</h3><p class="sub" style="text-align:center">'+(rw?L('Попытка не засчитается — сыграть можно будет снова.','This try won’t count — you can play again.'):L('Это была тренировка — наград и так нет.','It was practice — there are no rewards anyway.'))+'</p>'+
    '<div class="btns"><button class="btn big" data-k="go">'+L('Продолжить','Continue')+'</button><button class="btn ghost" data-k="out">'+L('Выйти','Leave')+'</button></div></div>';
  host.root.appendChild(v);v.querySelector('[data-k=go]').onclick=()=>{try{SND.click();}catch(e){}v.remove();host.hold=false;};
  v.querySelector('[data-k=out]').onclick=()=>{try{SND.click();}catch(e){}zabEv('quit',{id:c.id,src:ZAB.src});host.quit();};}
function ZAB_CLOSE(){const c=ZAB.cur;if(!c)return;ZAB.cur=null;for(const f of c.qs)try{f();}catch(e){}
  window.removeEventListener('resize',c.onRs);const r=$('zabHost');if(r)r.remove();try{if(typeof musicDuck==='function')musicDuck(false);}catch(e){}
  try{STAT.screen(typeof curTab!=='undefined'?String(curTab).toLowerCase():'menu');}catch(e){}}

/* ---------- итог: награды по ZAB_RW, рекорд, сила на бой → окно итогов (zabFinUI) ---------- */
function ZAB_FIN(g,o,r,opt){const c=ZAB.cur,n=g.num|0,rw=ZAB_RW[n]||{sl:[0,0,0,0],tr:[0,0,0,0]},z=ZB(),train=o.mode==='train';
  r.score=Math.max(0,Math.round(+r.score||0));r.tier=Math.max(0,Math.min(3,r.tier|0));const ex=r.extra&&typeof r.extra==='object'?r.extra:{};
  const best=z.b[g.id]|0,rec=!train&&!g.noRec&&r.tier>=1&&r.score>best&&r.score>0;if(rec)z.b[g.id]=r.score;
  const out={score:r.score,tier:r.tier,rec,best:Math.max(best,r.score),train,mode:o.mode,items:[],sl:0,buf:null,msg:ex.msg||''};
  if(!train){z.n[g.id]=(z.n[g.id]|0)+1;const fr=g.kind==='after'||!!g.free;   // free — без дневных потолков (клад: 5 трофеев + находки за раз)
    // повтор за ролик (day2) — лучший из двух: доплачиваем разницу ступеней
    const t0=o.mode==='day2'&&c&&c.prevTier!=null?c.prevTier:-1,tt=Math.max(r.tier,t0);
    const dSl=ex.sl!=null?+ex.sl:(rw.sl[tt]||0)-(t0>=0?rw.sl[t0]||0:0);out.sl=zabSl(dSl,fr);if(out.sl)out.items.push({img:ic('sl_fame',64),t:'+'+out.sl+' '+L('Славы','Fame')});
    const nTr=ex.trN!=null?+ex.trN:(rw.tr[tt]||0)-(t0>=0?rw.tr[t0]||0:0);const q=zabTr(ex.tro||rw.tro||(rw.acorn?'tr_luk':''),nTr,fr);
    if(q)out.items.push({img:ic(q.id,64),t:'+'+q.n+' '+zabTrName(q.id)});
    const eb=ex.buf&&typeof ex.buf==='object'?ex.buf:rw.buf&&rw.buf[tt];if(eb){const a=zabBufAdd(eb,g.id);if(a){out.buf=a;out.items.push({img:ic('sl_sila',64),t:zabBufTxt(a)+L(' — на следующий поход',' — next run'),cls:'buf'});}
      else if(zabBuf())out.items.push({t:L('Сила на поход уже есть — ','You already have a boost — ')+zabBufTxt()+L('. В походе действует одна сила забав, сильнейшая.','. Only one game boost works per run — the strongest.'),cls:'no'});}
    if(ex.deco){const d=zabDecoGive(ex.deco);if(d)out.items.push(d);}
    const sk=ex.skin||rw.skin&&rw.skin[tt];if(sk){const d=zabSkinGive(sk);if(d)out.items.push(d);else if(rw.skinRep){const q2=zabTr(ex.tro||rw.tro||'',rw.skinRep,fr);if(q2)out.items.push({img:ic(q2.id,64),t:'+'+q2.n+' '+zabTrName(q2.id)});}}
    if(o.mode!=='day2')z.d.p[g.id]=(z.d.p[g.id]|0)+1;
    z.w.c[g.id]=(z.w.c[g.id]|0)+1;if(r.tier>=2)z.w.r[g.id]=(z.w.r[g.id]|0)+1;
    if(g.kind==='week'&&typeof zabWeekTick==='function')zabWeekTick(g);
    if(typeof g.after==='function')try{const more=g.after(r,out,o);if(Array.isArray(more))out.items=out.items.concat(more);}catch(e){zabErr('after-'+g.id,e);}}
  zabTouch();save();
  zabEv('end',{id:g.id,score:r.score,tier:r.tier,ad:c&&c.ad?1:0,m:o.mode,rec:rec?1:0,src:ZAB.src}); /* upd0910: train убран (это m:'train'), вместо него src — откуда вошли: day «Дела на сегодня», win приглашение в итогах победы, menu плитка/экран, pech печь */
  if(typeof zabFinUI==='function')return zabFinUI(g,o,out,opt);
  ZAB_CLOSE();toast(zabName(g)+': '+r.score);}
/* окно итогов (поверх игры): ступень звёздами, очки, награды; «Ещё попытка за рекламу» — одна просьба, если ступень < 3, игра в окне ролик не брала, раз в день */
function zabFinUI(g,o,out,opt){const c=ZAB.cur;if(!c){toast(zabName(g)+': '+out.score);return;}const host=c.host,z=ZB(),n=g.num|0;
  const tierT=[L('Мимо','Miss'),L('Неплохо','Not bad'),L('Хорошо','Good'),L('Отлично!','Excellent!')][out.tier];
  const canAd=!out.train&&ZAB_RW.ad&&o.mode!=='day2'&&out.tier<3&&!c.ad&&!c.asked&&!g.noRetry&&!z.d.a[g.id]&&g.kind!=='after'&&g.kind!=='kiln'&&host.adOk();
  let h='<div class="panel zabRes"><h3>'+zabName(g)+'</h3>'+
    (g.noScore?'':'<div class="zabStars">'+[1,2,3].map(i=>'<i class="'+(out.tier>=i?'on':'off')+'" style="animation-delay:'+(i*.18)+'s">★</i>').join('')+'</div>'+
    '<div class="zabScore">'+fmtNum(out.score)+'</div><div class="zabSub">'+tierT+(out.train?' · '+L('тренировка','practice'):'')+'</div>')+
    (out.rec?'<span class="zabRec">'+L('Новый рекорд!','New record!')+'</span>':'')+(out.msg?'<p class="sub" style="text-align:center">'+out.msg+'</p>':'');
  if(out.train)h+='<div class="zabRw"><div class="no">'+L('Тренировка — без наград. Рекорд: ','Practice — no rewards. Best: ')+fmtNum(out.best)+'</div></div>';
  else if(out.items.length)h+='<div class="zabRw">'+out.items.map((x,i)=>'<div class="'+(x.big?'big ':'')+(x.cls||'')+'" style="animation-delay:'+(.5+i*.15)+'s">'+(x.img?'<img src="'+x.img+'" alt="">':'')+x.t+'</div>').join('')+'</div>';
  else h+='<div class="zabRw"><div class="no">'+L('В этот раз без награды — попробуй ещё!','No reward this time — try again!')+'</div></div>';
  h+='<div class="btns">'+(canAd?'<button class="btn ad" data-k="ad">'+L('🎬 Ещё попытка за рекламу','🎬 One more try for an ad')+'</button>':'')+
    '<button class="btn big" data-k="ok">'+L('Забрать','Collect')+'</button>'+(out.train||o.mode==='train'?'<button class="btn ghost" data-k="again">'+L('Ещё раз','Again')+'</button>':'')+'</div></div>';
  const v=document.createElement('div');v.className='zabVeil';v.innerHTML=h;host.root.appendChild(v);try{SND.chest();}catch(e){}if(canAd)host.offer();
  const back=()=>{ZAB_CLOSE();if(opt.back)try{opt.back(out);}catch(e){zabErr('back',e);}else if(typeof zabScreenRe==='function')zabScreenRe();};
  v.querySelector('[data-k=ok]').onclick=()=>{try{SND.click();}catch(e){}back();};
  const ag=v.querySelector('[data-k=again]');if(ag)ag.onclick=()=>{try{SND.click();}catch(e){}ZAB_CLOSE();ZAB_OPEN(g.id,Object.assign({},opt,{train:true}));};
  const ab=v.querySelector('[data-k=ad]');if(ab)ab.onclick=()=>{try{SND.click();}catch(e){}ab.disabled=true;
    host.ad('retry').then(ok=>{if(!ok){ab.disabled=false;return;}z.d.a[g.id]=1;zabTouch();save();const pt=out.tier;ZAB_CLOSE();
      const h2=ZAB_OPEN(g.id,Object.assign({},opt,{mode:'day2'}));if(h2&&ZAB.cur)ZAB.cur.prevTier=pt;});};
  const kh=e=>{if(!v.isConnected){window.removeEventListener('keydown',kh);return;}if(e.key==='Enter'||e.key===' '){e.preventDefault();window.removeEventListener('keydown',kh);back();}};
  setTimeout(()=>window.addEventListener('keydown',kh),400);}

/* ---------- украшения Терема от забав: ZAB_DECO(id,{n:[ru,en], art(g) — рисунок ~60×60 вокруг (0,0), at:[x 0..1, y 0..1, масштаб] во дворе Терема}) ----------
   Лежат в S.terem.d (как остальные), в списке Терема видны только выданные, рисуются поверх двора. Выдача — extra.deco:'id' или zabDecoGive(id). */
const ZAB_DECOS={};
/* облик от забавы (штатно, вместо крючка after): extra.skin:'id' или ZAB_RW[n].skin[ступень] — облик id из SKINS выдаётся ВСЕМ богатырям, у которых он есть; уже выдан — null */
function zabSkinGive(id){try{if(typeof SKINS==='undefined')return null;const ls=SKINS.filter(k=>k.id===id);if(!ls.length)return null;S.skins=S.skins||{};if(ls.every(k=>S.skins[k.hero+'@'+id]))return null;
  for(const k of ls)S.skins[k.hero+'@'+id]=1;const z=ZB();z.u['sk_'+id]=1;zabEv('skin',{k:id});const k0=ls.find(k=>k.hero===S.hero)||ls[0];
  return {img:ic('hp_'+k0.hero+'@'+id,96),t:L('Новый облик: ','New outfit: ')+(typeof qt==='function'?qt(k0.name):k0.name),big:1};}catch(e){zabErr('skin',e);return null;}}
function ZAB_DECO(id,d){if(!id||ZAB_DECOS[id])return;ZAB_DECOS[id]=d;if(typeof art==='function'&&d.art)art('tm_d_'+id,64,d.art);
  try{if(typeof TM_D!=='undefined'&&!TM_DB[id]){const e={id,get n(){return d.n;},tr:{},g:0};TM_D.splice(TM_D.length-1,0,e);TM_DB[id]=e;}}catch(e){zabErr('deco',e);}}
function zabDecoGive(id){const d=ZAB_DECOS[id],z=ZB();if(!d||z.u[id])return null;z.u[id]=1;
  try{if(typeof TM==='function'&&TM()){TM().d[id]=1;if(typeof tmTouch==='function')tmTouch();}}catch(e){}
  zabEv('deco',{k:id});return {img:ic('tm_d_'+id,96),t:L('Украшение Терема: ','Terem decoration: ')+L(d.n[0],d.n[1]),big:1};}
if(typeof tmDrawYard==='function'){const _tmY=tmDrawYard;tmDrawYard=function(c){_tmY.apply(this,arguments);try{const t=TM();if(!t||!c)return;const ids=Object.keys(ZAB_DECOS).filter(id=>t.d[id]&&!t.h[id]);if(!ids.length)return;
  const r=c.getBoundingClientRect(),W=r.width||300,H=r.height||180,d=Math.min(devicePixelRatio||1,2),g=c.getContext('2d');g.save();g.setTransform(d,0,0,d,0,0);const k=Math.min(W/300,H/180);
  for(const id of ids){const a=ZAB_DECOS[id].at||[.5,.8,1];if(typeof tmArt==='function')tmArt(g,'tm_d_'+id,W*a[0],H*a[1],k*a[2]*.9);}g.restore();}catch(e){zabErr('tmdraw',e);}};}

/* ---------- крючки меты ---------- */
const ZAB_MOD={id:'zab',FIX:ZAB_FIX,MERGE:ZAB_MERGE,RUN:zabRUN,ST:zabST,KILL:zabKILL,END:zabEND};
if(typeof META_MODS!=='undefined'){const i=META_MODS.findIndex(m=>m&&m.id==='dvor');if(i>=0)META_MODS.splice(i,0,ZAB_MOD);else META_MODS.push(ZAB_MOD);}

/* ---------- общий набор для игр (ZABK): холст во весь host с retina, текст с обводкой, частицы, плавности, спрайты art.js ---------- */
const ZABK={
  canvas(host){const c=document.createElement('canvas');c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none';host.el.appendChild(c);
    const fit=()=>{const d=Math.min(2.5,host.dpr),w=host.w,h=host.h;c.width=Math.round(w*d);c.height=Math.round(h*d);c.W=w;c.H=h;c.D=d;};fit();host.onResize(fit);return c;},
  font(px,w){return (w||900)+' '+Math.round(px)+'px '+(typeof CVL!=='undefined'&&CVL&&CVL.font?CVL.font:'Rubik,system-ui,sans-serif');},
  text(g,s,x,y,px,o){o=o||{};g.font=ZABK.font(px,o.w);if(o.mw){const w=g.measureText(s).width;if(w>o.mw){px=px*o.mw/w;g.font=ZABK.font(px,o.w);}}g.textAlign=o.al||'center';g.textBaseline=o.bl||'middle';g.lineJoin='round';
    if(o.ol!==false){g.lineWidth=o.lw||Math.max(3,px*.22);g.strokeStyle=o.olc||'rgba(46,28,14,.92)';g.strokeText(s,x,y);}g.fillStyle=o.col||'#fff6dc';g.fillText(s,x,y);},
  /* перенос строк по ширине: вернёт массив строк */
  wrap(g,s,px,mw,w){g.font=ZABK.font(px,w);const out=[];for(const para of String(s).split('\n')){let cur='';for(const wd of para.split(' ')){const t=cur?cur+' '+wd:wd;if(g.measureText(t).width>mw&&cur){out.push(cur);cur=wd;}else cur=t;}out.push(cur);}return out;},
  ease:{out:t=>1-Math.pow(1-t,3),back:t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);},inout:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},
  loop(host,fn){let raf=0,last=performance.now(),dead=false;const step=now=>{if(dead)return;const dt=Math.min(.05,(now-last)/1000);last=now;try{fn(host.paused?0:dt,now/1000);}catch(e){console.error(e);dead=true;return;}raf=requestAnimationFrame(step);};
    raf=requestAnimationFrame(step);const stop=()=>{dead=true;cancelAnimationFrame(raf);};host.onQuit(stop);return stop;},
  burst(P,x,y,o){o=o||{};const n=o.n||10;for(let i=0;i<n&&P.length<260;i++){const a=(o.a0!=null?o.a0:0)+Math.random()*(o.arc||Math.PI*2),v=(o.sp||160)*(.4+Math.random()*.8);
    P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,d:(o.d||.6)*(.7+Math.random()*.6),c:o.col||'#ffe27a',s:(o.s||4)*(.6+Math.random()*.8),g:o.g==null?380:o.g,k:o.k||'dot'});}},
  parts(g,P,dt){for(let i=P.length-1;i>=0;i--){const p=P[i];p.t+=dt;if(p.t>=p.d){P.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.vx*=.985;
    const a=1-p.t/p.d;g.globalAlpha=a;g.fillStyle=p.c;if(p.k==='star'){g.beginPath();for(let j=0;j<10;j++){const r=j%2?p.s*.45:p.s,an=-Math.PI/2+j*Math.PI/5+p.t*3;g.lineTo(p.x+Math.cos(an)*r,p.y+Math.sin(an)*r);}g.closePath();g.fill();}
    else{g.beginPath();g.arc(p.x,p.y,p.s*(.5+a*.5),0,Math.PI*2);g.fill();}}g.globalAlpha=1;},
  /* спрайт из art.js: квадрат px×px с центром (x,y); кэш по размеру */
  spr(key,px,d){const id=key+'@'+Math.round(px*d);ZABK.C=ZABK.C||{};let s=ZABK.C[id];if(s)return s;if(!ART[key])return null;s=ZABK.C[id]=drawArt(key,Math.max(8,Math.round(px*d)));return s;},
  put(g,key,x,y,px,d,o){const s=ZABK.spr(key,px,d||1);if(!s)return;o=o||{};g.save();g.translate(x,y);if(o.rot)g.rotate(o.rot);if(o.sx||o.sy)g.scale(o.sx||1,o.sy||1);if(o.a!=null)g.globalAlpha*=o.a;
    g.drawImage(s,-px/2,-px/2,px,px);g.restore();},
  /* рисунок art.js прямо векторно (без кэша): масштаб s — 1 = мировые единицы рисунка */
  draw(g,key,x,y,s){if(typeof metaArt==='function')metaArt(g,key,x,y,s);},
  /* большая кнопка на холсте (тап ≥ 64 px): {x,y,w,h,t,col} → рисует; hit(b,px,py) */
  btn(g,b,px){const r=Math.min(18,b.h/2);g.save();g.fillStyle='rgba(40,24,10,.45)';rrect(g,b.x,b.y+4,b.w,b.h,r);g.fill();const gr=g.createLinearGradient(0,b.y,0,b.y+b.h);
    gr.addColorStop(0,b.col?b.col[0]:'#ffd25a');gr.addColorStop(1,b.col?b.col[1]:'#e08a12');g.fillStyle=gr;rrect(g,b.x,b.y,b.w,b.h,r);g.fill();g.lineWidth=3;g.strokeStyle='#5a3008';g.stroke();g.restore();
    ZABK.text(g,b.t,b.x+b.w/2,b.y+b.h/2+1,px||Math.min(26,b.h*.42),{mw:b.w-16});},
  hit(b,x,y){return b&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h;},
  /* касание/мышь по холсту → fn(x,y,e) в css-пикселях; вернёт отписку */
  tap(c,host,fn){const h=e=>{if(host.paused||host.root.querySelector('.zabVeil'))return;const r=c.getBoundingClientRect();fn(e.clientX-r.left,e.clientY-r.top,e);};c.addEventListener('pointerdown',h);host.onQuit(()=>c.removeEventListener('pointerdown',h));}};
/* управление на ПК: zabPC() — есть мышь; zabKeys(host,fn(key,e)) — клавиши, пока игра на экране (не на паузе/окне; fn вернёт true — клавиша съедена); zabKeycap — значок клавиши */
function zabPC(){try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
function zabKeys(host,fn){const h=e=>{if(!ZAB.cur||ZAB.cur.host!==host||host.paused||e.repeat&&!/^Arrow/.test(e.key))return;if(host.root&&host.root.querySelector('.zabVeil'))return;
    try{if(fn(e.key,e))e.preventDefault();}catch(x){console.error(x);}};window.addEventListener('keydown',h);host.onQuit(()=>window.removeEventListener('keydown',h));}
function zabKeycap(g,x,y,lbl,px){px=px||24;const w=Math.max(px,px*.4*String(lbl).length+px*.6);g.save();g.fillStyle='rgba(30,18,8,.55)';rrect(g,x-w/2,y-px/2+3,w,px,px*.22);g.fill();
  const gr=g.createLinearGradient(0,y-px/2,0,y+px/2);gr.addColorStop(0,'#fffaf0');gr.addColorStop(1,'#e6d2a8');g.fillStyle=gr;rrect(g,x-w/2,y-px/2,w,px,px*.22);g.fill();g.strokeStyle='#5a3a1a';g.lineWidth=Math.max(1.5,px*.07);g.stroke();
  g.font=ZABK.font(px*.62,900);g.textAlign='center';g.textBaseline='middle';g.fillStyle='#3a2410';g.fillText(lbl,x,y+px*.03);g.restore();}
/* бот: zbBot('zagadki') → средний счёт и доли ступеней для плохого/среднего/хорошего игрока (по 200 зёрен) — сверка с ZAB_RW */
function zbBot(id,n){const g=ZAB.by[id]||zabG(+id);if(!g||!g.sim)return null;n=n||200;const out={};
  for(const [nm,k] of[['bad',.3],['mid',.6],['good',.9]]){let s=0;const t=[0,0,0,0];for(let i=0;i<n;i++){const sd=zabSeed(g.id,'2026-10-'+(i%28+1))+i;const r=g.sim({seed:sd,rnd:mulberry(sd),lvl:3,calm:false,day:'2026-10-'+(i%28+1)},k);s+=r.score;t[r.tier|0]++;}
    out[nm]={score:+(s/n).toFixed(1),tiers:t.map(x=>Math.round(x/n*100)+'%').join(' / ')};}
  return out;}

/* ---------- стенд ?zab=<id>: после загрузки меню игра сразу во весь экран; ?zab=menu — экран «Забавы» ---------- */
{const m=/[?&]zab=([a-z0-9_-]+)/i.exec(location.search);if(m){const id=m[1],t0=Date.now();
  const qv=k=>{const x=new RegExp('[?&]'+k+'=([^&]*)').exec(location.search);return x?x[1]:null;};
  const go=()=>{const ld=$('loading');if(typeof onReady!=='function'||ld&&ld.style.display!=='none'){if(Date.now()-t0<20000)setTimeout(go,100);return;}
    if(typeof hideModal==='function')hideModal();
    if(id==='menu'){if(typeof zabScreen==='function')zabScreen();return;}
    const op={train:qv('train')==='1',mode:qv('mode')||'day'};if(qv('calm')!=null)op.calm=qv('calm')==='1';if(qv('lvl')!=null)op.lvl=+qv('lvl');if(qv('seed')!=null)op.seed=+qv('seed')>>>0;
    if(!ZAB.by[id]&&!zabG(+id)){toast('?zab='+id+': '+L('нет такой забавы. Есть: ','no such game. Have: ')+ZAB.list.map(g=>g.id).join(', '));return;}
    ZAB_OPEN(id,op);};
  setTimeout(go,300);}}
