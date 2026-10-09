'use strict';
/* OB:MG0 мини-игры «Дозорной избы» — ядро (js/mg-core.js). План и договор: hobby-analytics/release-i/minigames/ob-plan.md.
   Каждая игра — свой файл js/mg-<id>.js (подключать в index.html ПОСЛЕ mg-core.js / mg-izba.js):
     MG_REG({id, num:1..14, n:{ru,en}, icon, kind:'score'|'buff'|'prep'|'week'|'fest', run(host,o), bot?(o)=>{score,tier}})
   run(host,o) рисует ТОЛЬКО внутри host.el (во весь экран), по окончании зовёт host.done({score, tier:0..3, rec, extra}).
     host.el — div во весь экран (position:absolute, во весь экран), host.w/h — размеры, host.dpr — плотность,
     host.onResize(fn) — позовётся при смене окна, host.onQuit(fn) — игрока выводят (уберите таймеры),
     host.ad(kind) → Promise<bool> (true — ролик досмотрен), host.adOk() — можно ли показывать кнопку ролика,
     host.quit() — выйти без итогов, host.paused — пауза (ролик/свёрнуто/окно «Выйти?»), host.snd — звуки (SND).
     o = {calm, lvl, seed, train, day, lang, rnd, mode, ctx}: calm — спокойный режим (медленнее/шире окна), lvl — chaptersDone(),
     seed — зерно дня (одинаково у всех), train — тренировка без наград, rnd — генератор mulberry(seed), ctx — {lair:глава} и т. п.
   Награды, окно итогов, «Ещё заход», Дозорная книга — оболочка (здесь и в js/mg-izba.js), игре их делать не нужно.
   Стенд: ?mg=<id> (&train=1 &calm=1 &lvl=N &seed=N) — игра сразу во весь экран, меню под ней.

   Сейв: S.dzr (Дозорная изба) — {x: очки Дозорного, b:{num:рекорд}, n:{num:сыграно}, d:{k:день, p:{num:1 — заход с наградой}, a:«ещё заход» взят, sl:Слава сегодня, c:Частокол сегодня},
     l:{уровень:1 — награда дорожки выдана}, lr:{глава:1 — Логово разведано}, w:{w:неделя, t:ступень Набега}, nb:набегов всего, s:{num:1 — видел новую игру}, chp:{c,l,k} — поражение (повод для Частокола), ts}
   S.mgBuf — сила на следующий бой кампании {h:+жизни, c:+доля монет, f:1 «Туман», ts}. Оба — через FIX/MERGE (META_MODS). */
const MG={list:[],by:{},num:{},cur:null};
/* ---------- 14 игр: имена, вид, когда открываются ---------- */
const MG_INFO={
  1:{id:'podkop',k:'score',n:['Подкоп!','Dig Out!'],a:['Бей бугорки, пока упыри не вылезли из-под частокола','Whack the mounds before ghouls dig under the palisade']},
  2:{id:'chast',k:'buff',n:['Починка частокола','Mend the Palisade'],a:['Залатай дыры — +2 ❤ ворот в следующем бою','Patch the holes — +2 ❤ for the gate next battle']},
  3:{id:'pushka',k:'score',n:['Царь-пушка','Tsar Cannon'],a:['Тяни и отпускай — ядро летит в табор нечисти','Pull and release — the cannonball flies into the monster camp']},
  4:{id:'dozor',k:'score',n:['Ночной дозор','Night Watch'],a:['Свети факелом — нечисть пугается и бежит','Shine the torch — monsters get scared and flee']},
  5:{id:'igla',k:'score',n:['Кощеева игла','Koschei’s Needle'],a:['Следи за сундуком с зайцем — где смерть Кощея?','Follow the chest with the hare — where is Koschei’s death?']},
  6:{id:'lovlya',k:'score',n:['Ловля летучей нечисти','Catch the Flyers'],a:['Лови нетопырей сетью с упреждением','Net the bats — aim ahead of them']},
  7:{id:'razv',k:'prep',n:['Разведка тропы','Scout the Trail'],a:['Проведи разведчика к Логову — узнаешь его волны','Lead the scout to the Lair — learn its waves']},
  8:{id:'opol',k:'buff',n:['Набор ополчения','Muster the Militia'],a:['Разведи людей по заставам, волков — прочь','Sort folk to their outposts, wolves away']},
  9:{id:'nabat',k:'score',n:['Колокольный набат','Alarm Bell'],a:['Бей в колокол в лад','Ring the bell in rhythm']},
  10:{id:'zagadki',k:'score',n:['Загадки воеводы','Commander’s Riddles'],a:['Пять вопросов о нечисти — знаешь повадки?','Five questions about monsters — know their ways?']},
  11:{id:'vorota',k:'score',n:['Ремонт ворот','Mend the Gate'],a:['Поверни резные доски — пусть засов пройдёт','Turn the carved boards so the bolt slides through']},
  12:{id:'snaryad',k:'score',n:['Доставка снарядов','Ammo Run'],a:['Поворачивай желоба — ядра к пушкам','Turn the chutes — cannonballs to the cannons']},
  13:{id:'nabeg',k:'week',n:['Набег на логово','Raid the Lair'],a:['Веди дружину мимо башен нечисти','Lead your band past the monster towers']},
  14:{id:'kotel',k:'buff',n:['Котёл тётушки Яги','Auntie Yaga’s Cauldron'],a:['Повтори рецепт — зелье «Туман» на бой','Repeat the recipe — a “Fog” potion for battle']}};
for(const n in MG_INFO)MG_INFO[n].num=+n;
/* открытие по прогрессу (таблица плана): k-й босс — босс k-й земли по CH_ORDER */
function mgBoss(k){const o=typeof CH_ORDER!=='undefined'?CH_ORDER:[0,1,2,3,4,5,6,7],c=o[k-1];return c!=null&&!!(S.stars&&S.stars[c+'-5']);}
function mgFestNow(){try{return typeof FEST!=='undefined'&&FEST.list().some(f=>f.kind==='ev');}catch(e){return false;}}
const MG_UNL={1:[0],10:[0],2:[1],7:[1],3:[2],8:[3],14:[3],5:[4],12:[5],6:[6],13:[6],11:[7],9:[8],4:[9]};
function mgIzbaOpen(){return !!(S.stars&&S.stars['0-2']);}
function mgOpenN(n){const k=MG_UNL[n];if(!k)return false;if(!k[0])return mgIzbaOpen();if(n===4&&mgFestNow()&&mgBoss(1))return true;return mgBoss(k[0]);}
function mgLockTxt(n){const k=MG_UNL[n][0];if(!k)return Lg('после уровня 1-3','after level 1-3');const o=typeof CH_ORDER!=='undefined'?CH_ORDER:[],c=o[k-1],ch=c!=null&&CH[c];
  return Lg('после босса '+k+'-й земли'+(ch?' «'+ch.name+'»':''),'after the boss of land '+k+(ch?' “'+ch.name+'”':''));}
function MG_REG(g){if(!g||!g.id||MG.by[g.id])return;if(!g.num)for(const n in MG_INFO)if(MG_INFO[n].id===g.id)g.num=+n;
  MG.list.push(g);MG.by[g.id]=g;if(g.num&&!MG.num[g.num])MG.num[g.num]=g;}
function mgG(n){return MG.num[n]||null;}
function mgAvail(n){const g=mgG(n);if(!g)return false;try{if(typeof g.open==='function'&&!g.open())return false;}catch(e){}return mgOpenN(n);}
function mgName(g){if(!g)return '';if(g.n)return LANG==='en'?g.n.en||g.n.ru:g.n.ru;const i=MG_INFO[g.num];return i?Lg(i.n[0],i.n[1]):g.id;}
function mgNameN(n){const g=mgG(n);if(g&&g.n)return mgName(g);const i=MG_INFO[n];return i?Lg(i.n[0],i.n[1]):'';}
function mgAbout(n){const i=MG_INFO[n];return i?Lg(i.a[0],i.a[1]):'';}
function mgIc(n,px){const g=mgG(n),k=g&&g.icon&&ART[g.icon]?g.icon:'mg_i'+n;return ic(k,px||96);}
function mgSeed(id,day){day=day||dayKey();let h=2166136261;const s=day+'|'+id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function mgCalm(){return typeof fxCalm==='function'?fxCalm():REDUCED;}
function mgLvl(){try{return chaptersDone();}catch(e){return 0;}}

/* ---------- награды: одна таблица (поменять — тут) ----------
   tr — трофеи текущей земли по ступени 0..3, sl — Слава по ступени; rec — Слава за рекорд; xp — очки Дозорного по ступени; ad — доля награды «Ещё заход»;
   slCap — потолок Славы от мини-игр в день; buf — сила на бой (Частокол +2 ❤, ролик «Позвать плотников» +3 ❤; Ополчение — доля монет; Котёл — «Туман»). */
const MG_RW={
  1:{tr:[0,1,2,3],sl:[0,0,10,20]}, 3:{tr:[0,1,2,3],sl:[0,0,10,25]}, 4:{tr:[0,1,1,2],sl:[0,0,10,15]}, 5:{tr:[0,1,1,2],sl:[0,0,5,10]},
  6:{tr:[0,1,1,2],sl:[0,0,10,15]}, 9:{tr:[0,1,1,2],sl:[0,0,10,15]}, 10:{tr:[0,1,1,2],sl:[0,5,10,20]}, 11:{tr:[0,1,1,1],sl:[0,0,5,10]},
  12:{tr:[0,1,2,2],sl:[0,0,5,10]}, 2:{tr:[1,1,1,1],sl:[0,0,0,0]}, 8:{tr:[0,0,0,0],sl:[0,0,0,0],alt:2}, 14:{tr:[0,0,0,0],sl:[0,0,0,0]},
  7:{tr:[2,2,2,2],sl:[0,0,5,10]}, 13:{tr:[3,4,5,6],sl:[10,15,20,25]},
  rec:5, xp:[5,10,15,20], xpRec:5, ad:.5, slCap:40, chMax:3, lives:2, livesAd:3, coinsMax:.02, fogK:.15, fogT:8, bufCap:.10};
/* расписание «Дела дня» (воскресенье — 0): Пн Подкоп · Вт Царь-пушка · Ср Ловля · Чт Ремонт ворот (чётные недели) / Доставка (нечётные) · Пт Игла · Сб Ночной дозор · Вс Набат */
const MG_WEEK=[9,1,3,6,0,5,4];
function mgWeekN(wd,wk){return wd===4?(wk%2?12:11):MG_WEEK[wd];}
function mgDayNum(day){day=day||dayKey();const p=day.split('-').map(Number),d0=new Date(p[0],p[1]-1,p[2]),wk=weekNo(d0.getTime());
  for(let i=0;i<7;i++){const d=new Date(p[0],p[1]-1,p[2]+i),n=mgWeekN(d.getDay(),weekNo(d.getTime()));if(mgAvail(n))return n;}   // игра дня закрыта — ближайшая открытая по расписанию
  for(const n of[1,10,5,3])if(mgAvail(n)&&MG_INFO[n].k==='score')return n;return 0;}
const MG_DAILY=[10,14,8];   // каждый день отдельно (раз в день с наградой)

/* ---------- сейв ---------- */
function dzrNew(){return {x:0,b:{},n:{},d:{k:'',p:{},a:0,sl:0,c:0},l:{},lr:{},w:{w:0,t:-1},nb:0,s:{},u:{},chp:null,ts:0};}
function dzrFixO(z){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),nn=v=>Math.max(0,(+v|0)||0);const d=dzrNew();
  for(const k in d)if(!(k in z))z[k]=d[k];
  for(const k of['b','n','l','lr','s','u'])if(!ob(z[k]))z[k]={};for(const k of['b','n'])for(const i in z[k])z[k][i]=nn(z[k][i]);for(const k of['l','lr','s','u'])for(const i in z[k])z[k][i]=z[k][i]?1:0;
  z.x=nn(z.x);z.nb=nn(z.nb);z.ts=+z.ts||0;
  if(!ob(z.d))z.d=d.d;if(typeof z.d.k!=='string')z.d.k='';if(!ob(z.d.p))z.d.p={};for(const i in z.d.p)z.d.p[i]=nn(z.d.p[i]);z.d.a=z.d.a?1:0;z.d.sl=nn(z.d.sl);z.d.c=nn(z.d.c);
  if(!ob(z.w))z.w={w:0,t:-1};z.w.w=nn(z.w.w);z.w.t=z.w.t==null||isNaN(+z.w.t)?-1:Math.max(-1,Math.min(3,+z.w.t|0));
  if(z.chp!=null&&!(ob(z.chp)&&z.chp.c!=null))z.chp=null;return z;}
function DZR_FIX(s){try{s=s||S;if(s.dzr!=null&&!(s.dzr&&typeof s.dzr==='object'&&!Array.isArray(s.dzr)))s.dzr=null;if(!s.dzr)s.dzr=dzrNew();dzrFixO(s.dzr);
  const b=s.mgBuf;if(b!=null&&!(b&&typeof b==='object'&&!Array.isArray(b)))s.mgBuf=null;if(s.mgBuf){const q=s.mgBuf;q.h=Math.max(0,Math.min(MG_RW.livesAd,+q.h|0));q.c=Math.max(0,Math.min(MG_RW.coinsMax,+q.c||0));q.f=Math.max(0,Math.min(MG_RW.fogT,+q.f|0));q.ts=+q.ts||0;}}catch(e){console.warn('dzr fix',e);}}
/* облако: очки и рекорды — максимум, книга/логова/виденное — объединение; день — свежий (одинаковый — максимум); сила на бой — более новая */
function DZR_MERGE(x,o){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),b=ob(x)&&ob(x.dzr)?dzrFixO(JSON.parse(JSON.stringify(x.dzr))):null;
  if(b){if(!ob(o.dzr)){o.dzr=b;}else{const a=dzrFixO(o.dzr);a.x=Math.max(a.x,b.x);a.nb=Math.max(a.nb,b.nb);a.ts=Math.max(a.ts,b.ts);
    for(const k of['b','n'])for(const i in b[k])a[k][i]=Math.max(a[k][i]|0,b[k][i]|0);for(const k of['l','lr','s','u'])for(const i in b[k])if(b[k][i])a[k][i]=1;
    if(b.d.k>a.d.k)a.d=b.d;else if(b.d.k===a.d.k){for(const i in b.d.p)a.d.p[i]=Math.max(a.d.p[i]|0,b.d.p[i]|0);a.d.a=Math.max(a.d.a,b.d.a);a.d.sl=Math.max(a.d.sl,b.d.sl);a.d.c=Math.max(a.d.c,b.d.c);}
    if(b.w.w>a.w.w||(b.w.w===a.w.w&&b.w.t>a.w.t))a.w=b.w;if(!a.chp&&b.chp)a.chp=b.chp;}}
  const xb=ob(x)&&ob(x.mgBuf)?x.mgBuf:null;if(xb&&(!ob(o.mgBuf)||(+xb.ts||0)>(+o.mgBuf.ts||0)))o.mgBuf=JSON.parse(JSON.stringify(xb));}catch(e){console.warn('dzr merge',e);}}
function DZ(){if(!S.dzr)DZR_FIX(S);const z=S.dzr,k=dayKey();if(z.d.k!==k)z.d={k,p:{},a:0,sl:0,c:0};return z;}
function dzTouch(){S.dzr.ts=Date.now();}
DZR_FIX(S);   // первая загрузка: META_HK('FIX') ещё не знал модуля

/* ---------- уровень Дозорного и дорожка наград ---------- */
function dzNeed(l){return 40+10*l;}
function dzLv(x){let l=1;x=x|0;while(x>=dzNeed(l)&&l<99){x-=dzNeed(l);l++;}return {l,cur:x,need:dzNeed(l)};}
const DZ_TRACK=[{l:3,bn:'dz1'},{l:6,sk:'dozor'},{l:10,bn:'dz2'},{l:15,sk:'storozh'},{l:20,bn:'dz3'}];
const DZ_RAID=[{n:1,bn:'dzn1'},{n:3,bn:'dzn2'},{n:6,bn:'dzn3'}];
const DZ_BN={dz1:{n:'Знамя Дозора',en:'Watch Banner',c1:'#2f6a3a',c2:'#ffd84a',em:[6,.5]},dz2:{n:'Колокольное знамя',en:'Bell Banner',c1:'#2a5aa8',c2:'#e8f0ff',em:[0,1]},
  dz3:{n:'Знамя воеводы дозора',en:'Watch Captain’s Banner',c1:'#8a1e1e',c2:'#ffd84a',em:[8,.45]},dzn1:{n:'Набеговое знамя',en:'Raid Banner',c1:'#2a2a3a',c2:'#e8433a',em:[4,.3]},
  dzn2:{n:'Знамя лихого набега',en:'Daring Raid Banner',c1:'#5a2a6a',c2:'#ffd84a',em:[5,.4]},dzn3:{n:'Знамя ночного набега',en:'Night Raid Banner',c1:'#141a3a',c2:'#9adcff',em:[7,.5]}};
if(typeof xbnAdd==='function')for(const id in DZ_BN)xbnAdd(Object.assign({id},DZ_BN[id]));
function dzBnName(id){const b=DZ_BN[id];return b?Lg(b.n,b.en):id;}
function dzBnURL(id,px){const b=typeof XBN!=='undefined'&&XBN.find(x=>x.id===id);if(b&&typeof xbnURL==='function')return xbnURL(b,px||96);return ic('mg_book',px);}
const DZ_SK={dozor:{n:['Дозорный','Watchman'],a:['вымпелы и фонари дозора','watch pennants and lanterns'],l:6},storozh:{n:['Сторожевой','Sentinel'],a:['воронёная сталь и щиток','blued steel and a crest'],l:15}};
for(const id in DZ_SK){const k=DZ_SK[id];if(typeof SKINS!=='undefined'&&!SKINS.some(s=>s.id===id))SKINS.push({id,cost:0,get:'dzr'+k.l,get n(){return Lg(k.n[0],k.n[1]);},get about(){return Lg(k.a[0],k.a[1]);}});}
{const h0=typeof skinHow==='function'?skinHow:null;if(h0)skinHow=function(k){const m=/^dzr(\d+)$/.exec(k&&k.get||'');if(m)return Lg('награда Дозорной книги: Дозорный, ур. '+m[1],'Watch Book reward: Watchman lvl '+m[1]);return h0(k);};}
function dzSkName(id){const k=DZ_SK[id];return k?Lg(k.n[0],k.n[1]):id;}
function dzSkAll(id){return typeof TW_ORDER!=='undefined'&&TW_ORDER.every(t=>S.skins&&S.skins[t+'.'+id]);}
function dzSkGive(id){if(!S.skins)S.skins={};for(const t of TW_ORDER)S.skins[t+'.'+id]=1;}
function dzLvRw(l){const t=DZ_TRACK.find(x=>x.l===l);if(t)return t;return {tr:2+Math.floor(l/4)};}
/* выдать награды за достигнутые уровни (повторно не выдаёт): вернёт список {img,t} для окна */
function dzClaim(){const z=DZ(),L=dzLv(z.x).l,out=[];for(let l=2;l<=L;l++){if(z.l[l])continue;z.l[l]=1;const r=dzLvRw(l);
    if(r.bn){if(typeof xbnGive==='function')xbnGive(r.bn);out.push({img:dzBnURL(r.bn,96),t:Lg('Новое знамя: ','New banner: ')+dzBnName(r.bn),big:1});}
    else if(r.sk){dzSkGive(r.sk);out.push({img:ic('ti_arch_3~'+r.sk,96),t:Lg('Облик застав «'+dzSkName(r.sk)+'»','“'+dzSkName(r.sk)+'” outpost look'),big:1});}
    else{const q=mgTrf(r.tr);if(q)out.push({img:ic(trfIc(q.id),64),t:'+'+q.n+' '+trfName(q.id)});}
    try{STAT.ev('mg',{a:'lvl',l});}catch(e){}}
  return out;}

/* ---------- начисления ---------- */
function mgTrf(n){n=Math.round(+n||0);if(n<=0||typeof TRF_ADD!=='function'||typeof trfTopId!=='function'||!S.trf)return null;const id=trfTopId();TRF_ADD(id,n);return {id,n};}
function mgSl(n){const z=DZ();n=Math.round(+n||0);const m=Math.max(0,Math.min(n,MG_RW.slCap-z.d.sl));if(m<=0||typeof SLAVA_ADD!=='function'||!S.sl)return 0;z.d.sl+=m;SLAVA_ADD(m,'mg');return m;}

/* ---------- сила на следующий бой кампании (S.mgBuf) ----------
   Действует на Обычном и ⚔/🔥 кампании; НЕ в осаде, Боссе недели, испытании дня, Заставе дня. Потолок: доля монет ополчения + «подмога» за поражения ≤ 45 % старта,
   а вся сила (жизни ½ веса, монеты, «Туман» 3 %) — не больше MG_RW.bufCap (10 %): лишнее срезается с монет. */
function mgBuf(){return S.mgBuf&&(S.mgBuf.h||S.mgBuf.c||S.mgBuf.f)?S.mgBuf:null;}
function mgBufAdd(o){const b=S.mgBuf||(S.mgBuf={h:0,c:0,f:0,ts:0});if(o.h)b.h=Math.min(MG_RW.livesAd,Math.max(b.h|0,o.h|0));if(o.c)b.c=Math.min(MG_RW.coinsMax,Math.max(+b.c||0,+o.c||0));if(o.f)b.f=Math.max(b.f|0,Math.min(MG_RW.fogT,o.f|0));b.ts=Date.now();}
function mgBufTxt(b){b=b||mgBuf();if(!b)return '';const a=[];if(b.h)a.push('+'+b.h+' ❤');if(b.c){const pc=Math.round(b.c*1000)/10;a.push(Lg('+'+String(pc).replace('.',',')+' % монет','+'+pc+'% coins'));}if(b.f)a.push(Lg('чара «Туман»','“Fog” spell'));return a.join(' · ');}
function mgCampaign(G){return G&&!G.endless&&!G.wk&&!G.rule&&!G.dly&&!G.week;}
function mgRUN(G){try{const b=mgBuf();if(!b||!mgCampaign(G)||/[?&]bot/.test(location.search)&&!window.__mgBufBot)return;
  const lf=b.h|0,lifeK=lf/Math.max(10,G.maxLives)*.5,fogK=b.f?.03:0,base=Math.max(1,G.coins-(G.mgPity||0));
  let ck=Math.max(0,Math.min(b.c||0,MG_RW.bufCap-lifeK-fogK));
  const pity=(typeof pityCoins==='function'&&G.dif!=='s'&&G.dif!=='h')?pityCoins(G.ci,G.li)||0:0;ck=Math.max(0,Math.min(ck,.45-pity/base));
  if(lf){G.lives+=lf;G.maxLives+=lf;}const add=Math.round(base*ck);if(add>0)G.coins+=add;
  if(b.f)G.mgFog={t:0,used:0,d:b.f>1?b.f:MG_RW.fogT};G.mgBufT=mgBufTxt({h:lf,c:add>0?ck:0,f:b.f});S.mgBuf=null;save();
  setTimeout(()=>{if(G&&G.mgBufT&&typeof voice==='function')voice(Lg('Дозор не зря старался: ','The watch did well: ')+G.mgBufT+'!',VOEV(),'voevoda',4);mgFogBtn();},900);
  try{STAT.ev('mg',{a:'buf',h:lf,c:add,f:b.f?1:0});}catch(e){}}catch(e){console.warn('mg run',e);}}
/* «Туман» — третья кнопка у чар; 8 с вся нечисть медленнее на 15 % */
function mgFogBtn(){let b=$('spFog');const g=typeof G!=='undefined'&&G,on=g&&g.mgFog&&!g.mgFog.used;
  if(!on){if(b)b.style.display='none';return;}
  if(!b){const sp=document.querySelector('#hudB .spells');if(!sp)return;b=document.createElement('button');b.className='spell';b.id='spFog';b.setAttribute('aria-label',Lg('Туман','Fog'));
    b.innerHTML='<img src="'+ic('mg_i14',112)+'" alt=""><i></i><u>'+Lg('Туман','Fog')+'</u>';sp.appendChild(b);
    b.onclick=()=>{const G1=typeof G!=='undefined'&&G;if(!G1||!G1.mgFog||G1.mgFog.used||G1.over)return;G1.mgFog.used=1;G1.mgFog.t=G1.mgFog.d||MG_RW.fogT;try{SND.splash();SND.purr();}catch(e){}
      b.style.display='none';if(typeof voice==='function')voice(Lg('Зелье Яги! Туман стелется — нечисть бредёт на ощупь.','Yaga’s potion! Fog rolls in — the monsters grope their way.'),VOEV(),'voevoda',3);try{STAT.ev('mg',{a:'fog'});}catch(e){}};}
  b.style.display='';}
function mgFRAME(dt,G){const f=G&&G.mgFog;if(!f||f.t<=0)return;f.t-=dt;for(const e of G.en)if(!e.dead)e.slow=Math.max(e.slow||0,MG_RW.fogK);}
function mgDRAW(c,G){const f=G&&G.mgFog;if(!f||f.t<=0)return;const a=Math.min(1,f.t/1.2,((f.d||MG_RW.fogT)-f.t)/.8+.2)*.5,W=typeof WW!=='undefined'?WW:400,H=typeof WH!=='undefined'?WH:700;
  c.save();for(let i=0;i<7;i++){const y=(i+.5)/7*H,x=((G.t*18*(i%2?1:-1)+i*137)%(W+300))-150,sp=typeof glowSpr==='function'?glowSpr('#e8f0ff'):null;c.globalAlpha=a*(.6+.4*Math.sin(G.t+i));
    if(sp)c.drawImage(sp,x-160,y-70,320,140);}c.restore();}
if(typeof META_MODS!=='undefined')META_MODS.push({id:'dzr',FIX:DZR_FIX,MERGE:DZR_MERGE,RUN:mgRUN,FRAME:mgFRAME,DRAW:mgDRAW});

/* ---------- общий стиль оверлеев ---------- */
function mgCss(){if($('mgCss'))return;const st=document.createElement('style');st.id='mgCss';st.textContent=
 '#mgHost{position:fixed;top:0;right:0;bottom:0;left:0;z-index:28;background:#141a2e;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}'+
 '#mgHost .mgEl{position:absolute;top:0;right:0;bottom:0;left:0;overflow:hidden}'+
 '.mgX{position:absolute;z-index:6;top:calc(var(--st,0px) + 8px);right:8px;width:52px;height:52px;border-radius:16px;border:3px solid #3a2410;background:linear-gradient(#fdf0cf,#e6c98a);color:#3a2410;font:900 24px/1 var(--f);box-shadow:0 4px 0 rgba(40,24,10,.5);display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer}'+
 '.mgX:active{transform:translateY(2px);box-shadow:0 2px 0 rgba(40,24,10,.5)}'+
 '.mgVeil{position:absolute;top:0;right:0;bottom:0;left:0;z-index:7;background:rgba(14,10,6,.55);display:flex;align-items:center;justify-content:center;padding:14px;overflow-y:auto;-webkit-overflow-scrolling:touch}'+
 '.mgVeil>.panel{width:100%;max-width:440px;margin:auto;position:relative;animation:mgPop .32s cubic-bezier(.2,1.4,.4,1) both}'+
 '@keyframes mgPop{from{transform:scale(.7);opacity:0}to{transform:none;opacity:1}}'+
 '@keyframes mgStar{0%{transform:scale(0) rotate(-40deg);opacity:0}70%{transform:scale(1.25) rotate(8deg);opacity:1}100%{transform:none;opacity:1}}'+
 '@keyframes mgRise{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}'+
 '@keyframes mgGlow{0%,100%{filter:drop-shadow(0 0 0 rgba(255,210,80,0))}50%{filter:drop-shadow(0 0 10px rgba(255,210,80,.9))}}'+
 '.mgRes .mgScore{font:900 54px/1 var(--f);color:var(--ink,#3b2412);text-align:center;margin:2px 0 0;text-shadow:0 3px 0 rgba(255,255,255,.6)}'+
 '.mgRes .mgSub{text-align:center;font-weight:700;color:var(--ink2,#6a4a2a);margin:2px 0 6px}'+
 '.mgRes .mgStars{display:flex;justify-content:center;gap:6px;margin:4px 0 6px}.mgRes .mgStars img{width:56px;height:56px;opacity:0}'+
 '.mgRes .mgStars img.on{animation:mgStar .45s ease-out both}.mgRes .mgStars img.off{opacity:.55;filter:grayscale(1) brightness(.9)}'+
 '.mgRes .mgRec{display:block;width:max-content;margin:0 auto 6px;padding:4px 14px;border-radius:12px;background:linear-gradient(#ffe066,#f5b21a);color:#4a2c04;font-weight:900;border:2px solid #b0760a;animation:mgGlow 1.6s ease-in-out infinite}'+
 '.mgRw{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:6px 0}'+
 '.mgRw>div{display:flex;align-items:center;gap:6px;padding:6px 12px 6px 6px;border-radius:14px;background:var(--goldBg,#fff0bf);border:2px solid var(--goldB,#e0a92e);font-weight:900;font-size:18px;color:var(--cGold,#a85c00);animation:mgRise .35s ease-out both}'+
 '.mgRw>div img{width:34px;height:34px}.mgRw>div.big{flex-basis:100%;justify-content:center}.mgRw>div.big img{width:54px;height:54px}'+
 '.mgRw>div.buf{background:var(--okBg,#eaf7d8);border-color:var(--okB,#7fb84f);color:var(--cOk,#2f7a1c)}'+
 '.mgXp{display:flex;align-items:center;gap:8px;margin:6px 2px 2px;font-weight:800;color:var(--ink2)}.mgXp img{width:30px;height:30px}.mgXp .bar{flex:1;height:12px;border-radius:7px;background:rgba(110,67,31,.18);overflow:hidden}'+
 '.mgXp .bar i{display:block;height:100%;border-radius:7px;background:linear-gradient(90deg,#7cc94e,#4a9a2c);transition:width .9s ease-out}'+
 'body.mgCalm .mgVeil>.panel,body.mgCalm .mgRes .mgStars img.on,body.mgCalm .mgRw>div,body.mgCalm .mgRes .mgRec{animation:none!important;opacity:1}';
 document.head.appendChild(st);}

/* ---------- открыть игру во весь экран. opt: {train, mode:'day'|'day2'|'daily'|'sit'|'week'|'fest'|'train', ctx, calm, lvl, seed, back(r), onQuit} ---------- */
function MG_OPEN(id,opt){opt=opt||{};const g=MG.by[id]||mgG(+id);if(!g){toast(Lg('Игра не найдена','Game not found'));return null;}
  if(MG.cur)MG_CLOSE();mgCss();document.body.classList.toggle('mgCalm',mgCalm());
  const root=document.createElement('div');root.id='mgHost';const el=document.createElement('div');el.className='mgEl';root.appendChild(el);
  const qb=document.createElement('button');qb.className='mgX';qb.setAttribute('aria-label',Lg('Выйти','Exit'));qb.textContent='✕';root.appendChild(qb);
  document.body.appendChild(root);
  const rs=[],qs=[];let fin=false,hold=false;
  const host={el,id:g.id,root,get w(){return root.clientWidth;},get h(){return root.clientHeight;},get dpr(){return Math.min(3,window.devicePixelRatio||1);},
    get paused(){return hold||(typeof paused!=='undefined'&&!!paused);},set hold(v){hold=!!v;},snd:typeof SND!=='undefined'?SND:{},
    onResize(fn){rs.push(fn);},onQuit(fn){qs.push(fn);},
    adOk(){try{return adOk();}catch(e){return false;}},
    ad(kind){return new Promise(res=>{try{STAT.place('mg_'+g.id+'_'+(kind||'x'));showRewarded(()=>{if(MG.cur)MG.cur.ad=1;res(true);},()=>res(false),()=>'');}catch(e){res(false);}});},
    done(r){if(fin)return;fin=true;MG_FIN(g,o,r||{},opt);},
    quit(){fin=true;MG_CLOSE();if(opt.onQuit)opt.onQuit();},
    btnQuit:qb};
  const day=dayKey(),seed=opt.seed!=null?opt.seed>>>0:mgSeed(g.id,day),mode=opt.train?'train':opt.mode||'train';
  const o={calm:opt.calm!=null?!!opt.calm:mgCalm(),lvl:opt.lvl!=null?opt.lvl:mgLvl(),seed,train:mode==='train',day,lang:LANG,rnd:mulberry(seed),mode,ctx:opt.ctx||{}};
  qb.onclick=()=>{try{SND.click();}catch(e){}if(fin){MG_CLOSE();return;}MG_QUIT_ASK(host);};
  const onRs=()=>{for(const f of rs)try{f(host.w,host.h);}catch(e){console.error(e);}};
  window.addEventListener('resize',onRs);
  const src=String(opt.src||opt.from||'');   // 09.10 STAT: откуда пришли — izba (изба), day (строка «Дело дня» в заданиях), win (окно победы «Передышка»), lose (Частокол после поражения), lair (Разведка)
  MG.cur={id:g.id,g,host,o,opt,onRs,qs,t0:Date.now(),ad:mode==='day2'?1:0,src};hmk('mg:'+g.id);
  try{STAT.screen('mg_'+g.id);STAT.ev('mg',{a:'go',id:g.id,m:mode,lv:o.lvl,src});}catch(e){}   // OB:FINAL STAT: старт мини-игры (вид захода day/day2/sit/week/fest/train)
  try{g.run(host,o);}catch(e){console.error(e);if(typeof META_ERR!=='undefined')try{META_ERR('mg-'+g.id,e);}catch(x){}MG_CLOSE();toast(Lg('Игра не запустилась','The game failed to start'));}
  return host;}
/* ✕ во время игры: «Выйти? Заход не засчитается» */
function MG_QUIT_ASK(host){const c=MG.cur;if(!c||c.host!==host){host.quit();return;}if(host.root.querySelector('.mgVeil'))return;host.hold=true;
  const v=document.createElement('div');v.className='mgVeil';const rw=c.o.mode!=='train';
  v.innerHTML='<div class="panel"><h3>'+Lg('Выйти из игры?','Leave the game?')+'</h3><p class="sub" style="text-align:center">'+(rw?Lg('Заход не засчитается — сыграть можно будет снова.','This run won’t count — you can play again.'):Lg('Рекорд этой попытки не запишется.','This attempt’s score won’t be saved.'))+'</p>'+
    '<div class="btns"><button class="btn big" data-k="go">'+Lg('Продолжить','Continue')+'</button><button class="btn ghost" data-k="out">'+Lg('Выйти','Leave')+'</button></div></div>';
  host.root.appendChild(v);v.querySelector('[data-k=go]').onclick=()=>{SND.click();v.remove();host.hold=false;};
  v.querySelector('[data-k=out]').onclick=()=>{SND.click();try{STAT.ev('mg',{a:'quit',id:c.id,src:c.src||''});}catch(e){}host.quit();};}
function MG_CLOSE(){const c=MG.cur;if(!c)return;MG.cur=null;for(const f of c.qs)try{f();}catch(e){}
  window.removeEventListener('resize',c.onRs);const r=$('mgHost');if(r)r.remove();try{STAT.screen(typeof curTab!=='undefined'?String(curTab).toLowerCase():'menu');}catch(e){}}

/* ---------- итог игры: награды по MG_RW, рекорд, книга, сила на бой → окно итогов (js/mg-izba.js: MG_FIN_UI) ---------- */
function MG_FIN(g,o,r,opt){const c=MG.cur,n=g.num|0,rw=MG_RW[n]||{tr:[0,0,0,0],sl:[0,0,0,0]},z=DZ(),train=o.mode==='train';
  r.score=Math.max(0,Math.round(+r.score||0));r.tier=Math.max(0,Math.min(3,r.tier|0));const ex=r.extra||{};
  const best=z.b[n]|0,rec=r.score>best&&r.score>0;if(rec)z.b[n]=r.score;z.n[n]=(z.n[n]|0)+1;
  const out={score:r.score,tier:r.tier,rec,best:Math.max(best,r.score),train,mode:o.mode,trf:null,sl:0,xp:0,items:[],buf:null,lv0:dzLv(z.x),lv1:null,first:!best};
  if(!train){const k=o.mode==='day2'?MG_RW.ad:1;let tr=Math.round((rw.tr[r.tier]||0)*k);if(k<1&&(rw.tr[r.tier]||0)>0)tr=Math.max(1,tr);
    if(n===8&&ex.trf)tr=rw.alt||2;
    if(n===13)tr=rw.tr[r.tier]||0;
    out.trf=mgTrf(tr);out.sl=mgSl(Math.round((rw.sl[r.tier]||0)*k)+(rec?MG_RW.rec:0));
    out.xp=Math.round(MG_RW.xp[r.tier]*(k<1?.5:1))+(rec?MG_RW.xpRec:0);z.x+=out.xp;
    // сила на следующий бой кампании
    // OB:FINAL договор MGA: extra.buf={k,lives|coinK|fog:{dur}} (старые поля lives/coins/fog тоже понимаем)
    const eb=ex.buf&&typeof ex.buf==='object'?ex.buf:{};
    if(n===2){const h=Math.min(ex.ad==='plot'?MG_RW.livesAd:MG_RW.lives,Math.max(0,+(ex.lives!=null?ex.lives:eb.lives)|0));if(h){mgBufAdd({h});out.buf={h};}}
    if(n===8&&!ex.trf){const cc=Math.min(MG_RW.coinsMax,+(ex.coins!=null?ex.coins:eb.coinK)||0);if(cc>0){mgBufAdd({c:cc});out.buf={c:cc};}}
    if(n===14){const fd=ex.fog&&typeof ex.fog!=='object'?MG_RW.fogT:eb.fog&&+eb.fog.dur||0;if(fd>0){const f=Math.max(1,Math.min(MG_RW.fogT,Math.round(fd)));mgBufAdd({f});out.buf={f};}}
    if(n===7){const lc=ex.lair!=null?ex.lair:o.ctx&&o.ctx.lair;if(lc!=null)z.lr[lc]=1;}
    if(n===13){z.w={w:weekNo(),t:r.tier};z.nb++;const it=DZ_RAID.find(x=>x.n===z.nb);if(it&&typeof xbnGive==='function'){xbnGive(it.bn);out.items.push({img:dzBnURL(it.bn,96),t:Lg('Знамя набега: ','Raid banner: ')+dzBnName(it.bn),big:1});}}
    if(n===4&&mgFestNow()&&r.score>0){try{if(typeof FEST_HW!=='undefined'&&FEST.on(FEST_HW)){S.festK=S.festK||{};S.festK[FEST_HW]=(S.festK[FEST_HW]|0)+r.score;out.fest=r.score;}}catch(e){}}
    if(n===2)z.d.c++;
    z.d.p[n]=(z.d.p[n]|0)+1;if(o.mode==='day2')z.d.a=1;
    if(n===2)z.chp=null;
    out.items=out.items.concat(dzClaim());}
  out.lv1=dzLv(z.x);dzTouch();save();
  try{STAT.ev('mg',{id:g.id,score:r.score,tier:r.tier,ad:c&&c.ad?1:0,train:train?1:0,m:o.mode,rec:rec?1:0,src:c&&c.src||''});}catch(e){}
  if(typeof MG_FIN_UI==='function')return MG_FIN_UI(g,o,out,opt);
  MG_CLOSE();toast(mgName(g)+': '+r.score);}

/* ---------- стенд ?mg=<id>: после запуска меню игра сразу во весь экран ---------- */
{const m=/[?&]mg=([a-z0-9_-]+)/i.exec(location.search);if(m){const _or=onReady,id=m[1];
  onReady=function(){if(!S.tut)S.tut=1;_or.apply(this,arguments);
    const qv=k=>{const x=new RegExp('[?&]'+k+'=([^&]*)').exec(location.search);return x?x[1]:null;};
    const go=()=>{if($('loading')&&$('loading').style.display!=='none'){setTimeout(go,100);return;}
      const op={train:qv('train')==='1',mode:qv('mode')||'day'};if(qv('calm')!=null)op.calm=qv('calm')==='1';if(qv('lvl')!=null)op.lvl=+qv('lvl');if(qv('seed')!=null)op.seed=+qv('seed')>>>0;
      if(id==='izba'){if(typeof MG_IZBA==='function')MG_IZBA();return;}
      if(!MG.by[id]&&!mgG(+id)){toast('?mg='+id+': '+Lg('нет такой игры. Есть: ','no such game. Have: ')+MG.list.map(g=>g.id).join(', '));return;}
      MG_OPEN(id,op);};
    setTimeout(go,50);};}}

/* ---------- общий набор для игр (MGK): холст во весь host с retina, текст с обводкой, частицы, плавности ---------- */
const MGK={
  canvas(host){const c=document.createElement('canvas');c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none';host.el.appendChild(c);
    const fit=()=>{const d=Math.min(2.5,host.dpr),w=host.w,h=host.h;c.width=Math.round(w*d);c.height=Math.round(h*d);c.W=w;c.H=h;c.D=d;};fit();host.onResize(fit);return c;},
  font(px,w){return (w||900)+' '+Math.round(px)+'px '+(typeof CVL!=='undefined'&&CVL&&CVL.font?CVL.font:'system-ui,sans-serif');},
  text(g,s,x,y,px,o){o=o||{};g.font=MGK.font(px,o.w);if(o.mw){const w=g.measureText(s).width;if(w>o.mw){px=px*o.mw/w;g.font=MGK.font(px,o.w);}}g.textAlign=o.al||'center';g.textBaseline=o.bl||'middle';g.lineJoin='round';
    if(o.ol!==false){g.lineWidth=o.lw||Math.max(3,px*.22);g.strokeStyle=o.olc||'rgba(46,28,14,.92)';g.strokeText(s,x,y);}g.fillStyle=o.col||'#fff6dc';g.fillText(s,x,y);},
  ease:{out:t=>1-Math.pow(1-t,3),back:t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);},inout:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2},
  loop(host,fn){let raf=0,last=performance.now(),dead=false;const step=now=>{if(dead)return;const dt=Math.min(.05,(now-last)/1000);last=now;try{fn(host.paused?0:dt,now/1000);}catch(e){console.error(e);dead=true;return;}raf=requestAnimationFrame(step);};
    raf=requestAnimationFrame(step);const stop=()=>{dead=true;cancelAnimationFrame(raf);};host.onQuit(stop);return stop;},
  // частицы: P=[] ; MGK.burst(P,x,y,{n,col,sp,g}) ; MGK.parts(g,P,dt)
  burst(P,x,y,o){o=o||{};const n=o.n||10;for(let i=0;i<n&&P.length<260;i++){const a=(o.a0!=null?o.a0:0)+Math.random()*(o.arc||Math.PI*2),v=(o.sp||160)*(.4+Math.random()*.8);
    P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,d:(o.d||.6)*(.7+Math.random()*.6),c:o.col||'#ffe27a',s:(o.s||4)*(.6+Math.random()*.8),g:o.g==null?380:o.g,k:o.k||'dot'});}},
  parts(g,P,dt){for(let i=P.length-1;i>=0;i--){const p=P[i];p.t+=dt;if(p.t>=p.d){P.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.vx*=.985;
    const a=1-p.t/p.d;g.globalAlpha=a;g.fillStyle=p.c;if(p.k==='dirt'){g.beginPath();g.ellipse(p.x,p.y,p.s,p.s*.7,p.t*6,0,Math.PI*2);g.fill();}
    else if(p.k==='star'){g.beginPath();for(let j=0;j<10;j++){const r=j%2?p.s*.45:p.s,an=-Math.PI/2+j*Math.PI/5+p.t*3;g.lineTo(p.x+Math.cos(an)*r,p.y+Math.sin(an)*r);}g.closePath();g.fill();}
    else{g.beginPath();g.arc(p.x,p.y,p.s*(.5+a*.5),0,Math.PI*2);g.fill();}}g.globalAlpha=1;},
  // спрайт из art.js целиком (FIX1): кэш по размеру
  spr(key,px,d){const id=key+'@'+Math.round(px*d);MGK.C=MGK.C||{};let s=MGK.C[id];if(s)return s;const a=artGet(key);if(!a)return null;const b=artBox(key),f=px/a.size;
    s=MGK.C[id]={c:drawArtK(key,f*d,b),x:b.x0*f,y:b.y0*f,w:b.w*f,h:b.h*f};return s;},
  put(g,key,x,y,px,d,o){const s=MGK.spr(key,px,d);if(!s)return;o=o||{};g.save();g.translate(x,y);if(o.rot)g.rotate(o.rot);if(o.sx||o.sy)g.scale(o.sx||1,o.sy||1);if(o.a!=null)g.globalAlpha*=o.a;
    g.drawImage(s.c,s.x,s.y,s.w,s.h);g.restore();}};
/* OB:FINAL управление на ПК (решение владельца): mgPC() — есть мышь (hover+pointer:fine); mgKeys(host,fn(key,e)) — клавиши, пока игра на экране
   (не во время паузы/окна «Выйти?»; fn вернёт true — клавиша съедена); mgKeycap(g,x,y,lbl,px) — значок клавиши на холсте. */
function mgPC(){try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
function mgKeys(host,fn){const h=e=>{if(!MG.cur||MG.cur.host!==host||host.paused||e.repeat&&!/^Arrow/.test(e.key))return;if(host.root&&host.root.querySelector('.mgVeil'))return;
    try{if(fn(e.key,e))e.preventDefault();}catch(x){console.error(x);}};window.addEventListener('keydown',h);host.onQuit(()=>window.removeEventListener('keydown',h));}
function mgKeycap(g,x,y,lbl,px){px=px||24;const w=Math.max(px,px*.4*String(lbl).length+px*.6);g.save();g.fillStyle='rgba(30,18,8,.55)';rrect(g,x-w/2,y-px/2+3,w,px,px*.22);g.fill();
  const gr=g.createLinearGradient(0,y-px/2,0,y+px/2);gr.addColorStop(0,'#fffaf0');gr.addColorStop(1,'#e6d2a8');g.fillStyle=gr;rrect(g,x-w/2,y-px/2,w,px,px*.22);g.fill();g.strokeStyle='#5a3a1a';g.lineWidth=Math.max(1.5,px*.07);g.stroke();
  g.font='900 '+Math.round(px*.62)+'px '+(typeof CVL!=='undefined'&&CVL&&CVL.font?CVL.font:'system-ui,sans-serif');g.textAlign='center';g.textBaseline='middle';g.fillStyle='#3a2410';g.fillText(lbl,x,y+px*.03);g.restore();}
/* бот-прогон: mgBot('podkop') → средний счёт и ступени для плохого/среднего/хорошего игрока (по 200 зёрен) — сверка с таблицей наград */
function mgBot(id,n){const g=MG.by[id]||mgG(+id);if(!g||!g.sim)return null;n=n||200;const out={};
  for(const [nm,k] of[['плохой',.3],['средний',.6],['хороший',.9]]){let s=0;const t=[0,0,0,0];for(let i=0;i<n;i++){const r=g.sim({seed:mgSeed(g.id,'2026-10-'+(i%28+1))+i,lvl:3,calm:false},k);s+=r.score;t[r.tier]++;}
    out[nm]={score:+(s/n).toFixed(1),tiers:t.map(x=>Math.round(x/n*100)+'%').join(' / ')};}
  return out;}
