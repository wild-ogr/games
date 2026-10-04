'use strict';
/* ================= Игровой забег ================= */
let G=null,cv,ctx,lastT=0;
// вид (look1): шрифт холста и цвета подложек боя — из темы (js/look.js → LOOK.cv, переменные --cv-* в css/look.css). Рисунки и значки боя темой не меняются
const CVL=(typeof LOOK!=='undefined'&&LOOK.cv)||{font:'system-ui,-apple-system,sans-serif',track:'rgba(10,14,30,.6)',edge:'rgba(255,255,255,0)',stroke:'rgba(10,14,30,.7)',pill:'',pillE:'',pillT:'#fff',pillG:'#ffd84a',bub:'rgba(255,255,255,.95)',bubE:'',bubT:'#2a2238',ban1:'rgba(34,40,78,.9)',ban2:'rgba(16,20,44,.9)',banE:'#e6b85a',num:'rgba(40,20,20,.9)',vig:.45,dark:0,v:0};
const VIEW={B:1,cx:0,cy:0,W:0,H:0,dpr:1,zoom:1,ww:200,wh:200,R:300};
let groundTiles={},SPR_OK=0,rDirty=true,vigCache=null;
const CALM=()=>!!S.calm; // «спокойный режим»: без тряски и красных вспышек (включается сам при prefers-reduced-motion)

// случайность похода: в походе дня — общее зерно дня (G.rng), иначе обычная
function rnd(){return G&&G.rng?G.rng():Math.random();}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function layout(){
  VIEW.dpr=Math.min(window.devicePixelRatio||1,window.__dprMax||(qLow()?1.5:2)); // потолок 2 (эффекты «мало» — 1,5): на 3× экранах разницы не видно, а памяти и работы вдвое меньше
  VIEW.W=cv.clientWidth||window.innerWidth;VIEW.H=cv.clientHeight||window.innerHeight;
  cv.width=Math.round(VIEW.W*VIEW.dpr);cv.height=Math.round(VIEW.H*VIEW.dpr);
  VIEW.zoom=clamp(Math.min(VIEW.W,VIEW.H)/370,.7,2.4);VIEW.B=VIEW.zoom*VIEW.dpr;
  VIEW.ww=VIEW.W/VIEW.zoom/2;VIEW.wh=VIEW.H/VIEW.zoom/2;VIEW.R=Math.hypot(VIEW.ww,VIEW.wh)+30;
  const k=Math.min(VIEW.B,2.5);if(Math.abs(k-SPR_K)/k>.05||!SPR_OK){SPR_OK=1;buildSprites(k);groundTiles={};}vigCache=null;rDirty=true;
}

/* ---------- ввод: плавающий джойстик + клавиатура ---------- */
const IN={on:false,id:-1,ox:0,oy:0,px:0,py:0,keys:{}};
function initInput(){
  cv.addEventListener('pointerdown',e=>{if(!G||G.over||G.paused)return;ac();IN.on=true;IN.id=e.pointerId;IN.ox=IN.px=e.clientX;IN.oy=IN.py=e.clientY;try{cv.setPointerCapture(e.pointerId);}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!IN.on||e.pointerId!==IN.id)return;IN.px=e.clientX;IN.py=e.clientY;
    const dx=IN.px-IN.ox,dy=IN.py-IN.oy,d=Math.hypot(dx,dy),M=56;if(d>M){IN.ox=IN.px-dx/d*M;IN.oy=IN.py-dy/d*M;}});
  const up=e=>{if(e.pointerId===IN.id)IN.on=false;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  window.addEventListener('keydown',e=>{IN.keys[e.code]=true;if(e.code==='Escape'&&G&&!G.over)togglePause();});
  window.addEventListener('keyup',e=>{IN.keys[e.code]=false;});
  window.addEventListener('blur',()=>{IN.keys={};IN.on=false;});
}
function inputVec(){const k=IN.keys;let x=(k.KeyD||k.ArrowRight?1:0)-(k.KeyA||k.ArrowLeft?1:0),y=(k.KeyS||k.ArrowDown?1:0)-(k.KeyW||k.ArrowUp?1:0);
  if(IN.on){const dx=IN.px-IN.ox,dy=IN.py-IN.oy,d=Math.hypot(dx,dy);if(d>6){const m=Math.min(1,d/40);x=dx/d*m;y=dy/d*m;}}
  const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}return {x,y};}

/* ---------- сетка для быстрого поиска соседей ---------- */
const GC=48,grid=new Map();
function gkey(cx,cy){return (cx+5000)*10000+(cy+5000);}
function gridBuild(){if(grid.size>3000)grid.clear();else for(const a of grid.values())a.length=0; // массивы клеток переиспользуем — меньше мусора
  for(const e of G.en){if(e.dead)continue;const k=gkey(Math.floor(e.x/GC),Math.floor(e.y/GC));let a=grid.get(k);if(!a){a=[];grid.set(k,a);}a.push(e);}}
function forNear(x,y,r,cb){const x0=Math.floor((x-r)/GC),x1=Math.floor((x+r)/GC),y0=Math.floor((y-r)/GC),y1=Math.floor((y+r)/GC);
  for(let cx=x0;cx<=x1;cx++)for(let cy=y0;cy<=y1;cy++){const a=grid.get(gkey(cx,cy));if(a)for(let i=0;i<a.length;i++)if(!a[i].dead)cb(a[i]);}}
// ближайший враг: ищем по сетке, расширяя круг (не перебирая всю толпу)
function nearest(x,y,maxR,skip){let best=null,bd;for(const r of[120,260,maxR]){if(r>maxR&&r!==maxR)continue;bd=Math.min(r,maxR)**2;best=null;
  forNear(x,y,Math.min(r,maxR),e=>{if(skip&&skip.has(e))return;const d=(e.x-x)**2+(e.y-y)**2;if(d<bd){bd=d;best=e;}});if(best||r>=maxR)return best;}return best;}
function onScreen(e,pad){return Math.abs(e.x-VIEW.cx)<VIEW.ww+(pad||0)&&Math.abs(e.y-VIEW.cy)<VIEW.wh+(pad||0);}

/* ---------- старт забега ---------- */
function xpNeed(l){return Math.round(5+(l-1)*6+Math.pow(l-1,1.8)*.3);}
// в самом первом походе первая Жар-птица не прилетает (реклама не раньше ~3 минут), остаётся вторая — на 3:20
// v17 (аудит 14): на 4:00 вместо общей «Стаи» — своё событие главы (CH_EV), на 2:05 — «Камень на распутье» (не в первом походе, в сече — только в 1-м круге)
function mkEvents(t0){return [...(G&&G.first?[]:[{t:70,k:'bird'}]),{t:90,k:'elite'},...(G&&(G.first||G.endless&&G.cyc)?[]:[{t:125,k:'stone'}]),{t:150,k:'ring'},{t:180,k:'elite'},{t:200,k:'bird'},{t:240,k:'chev'},{t:255,k:'elite'},{t:RUN_BOSS_T,k:'boss'}].map(e=>({t:e.t+t0,k:e.k}));}
function LT(){return G.t-G.t0;} // время внутри главы (в бесконечном режиме — внутри круга)
function newRun(chi,heroId,endless,wk,dr){
  if(dr){endless=false;wk=false;chi=dr.chi;heroId=dr.hero;}
  const hero=HERO_BY[heroId]||HEROES[0];if(wk)endless=true;if(endless)chi=0;const WM=dr?dr.rule.mod:wk?weekly().mod:{};
  G={chi,ch:CH[chi],heroId:hero.id,t:0,t0:0,endless:!!endless,cyc:0,em:1,paused:false,over:false,win:false,winT:0,
    hero:{x:0,y:0,fx:1,fy:0,flip:1,hp:100,lvl:1,xp:0,need:xpNeed(1),inv:0,hurtT:0,step:0,kx:0,ky:0,moving:false,sayT:0},
    cam:{x:0,y:0},shake:0,en:[],proj:[],eproj:[],gems:[],picks:[],fx:[],pt:[],nums:[],puddles:[],later:[],bub:[],
    weapons:[{id:WM.only||hero.weapon,lvl:1,t:.3,a:0}],pas:{},kills:0,gold:0,goldMul:1,spawnAcc:0,pid:1,lvlQ:0,boss:null,bossDone:false,
    ev:mkEvents(0),
    rerolls:(S.village.altar||0),revives:(S.village.hut?1:0),adRevive:true,quipT:6,gift:null,banner:null,cards:S.village.tavern?4:3};
  G.first=!S.runs&&!endless&&!dr;G.ev=mkEvents(0);
  // «оберег новичка» (boost): самый первый поход — нечисть бьёт на 25% слабее и один раз выручает каравай; главы 1–2, пока не пройдены (первые 8 походов) — на 15% слабее
  G.nov=G.first&&chi===0?2:!endless&&!dr&&!wk&&chi<=1&&!S.done[chi]&&S.runs<8?1:0;G.novHeal=G.nov===2?1:0;
  // глава 2 мягче (решение владельца 02.10): только в самой главе «Гиблое болото» (не сеча, не поход дня, не неделя) — числа CH2_SOFT в data.js
  G.soft=!endless&&!dr&&!wk&&chi===1?CH2_SOFT:null;
  // «боевой дух»: после поражения в главе следующая попытка В ЭТОЙ ЖЕ главе чуть легче — нечисть бьёт на 10% слабее за каждое поражение подряд (не больше 30%); победа сбрасывает. Только главы (не сеча, не поход дня, не неделя)
  G.pity=!endless&&!dr&&!wk&&S.pity&&S.pity.c===chi?clamp(S.pity.n|0,0,PITY_MAX):0;G.emD=Math.max(.6,(G.nov===2?.75:G.nov===1?.85:1)*(1-PITY_STEP*G.pity));G.daily=dr||null;G.rng=dr?mulberry(dr.seed):null;
  G.hkey=skinKey(hero.id);G.curse=endless||dr?0:Math.min(S.curse||0,S.curseMax||0);G.hits=0;
  G.weekly=!!wk;G.wk=WM;G.kt={};G.meet={};if(WM.oneLife){G.revives=0;G.adRevive=false;}
  G.st=null;computeStats();G.hero.hp=G.st.maxHp;G.darT=darCd()*.5;G.q={chests:0,evos:0,dars:0};G.wolfT=0;G.swordT=0;G.dashT=0;
  G.hpLock=G.hero.hp;
  // v13: изгнать/закрепить (окно уровня), находки на поле, замирание кадра, серия убийств, сон-трава
  G.haz=[];G.fogT=0;G.stone=null;G.stoneMod=null;G.richT=0;G.loot=0;G.ban={};G.banN=2;G.pin=null;G.propT=G.first?50:28;G.prop=null;G.hs=0;G.kb=null;G.combo=null;G.sleepT=0;
  if(G.daily)banner(L('Поход дня','Daily Run'),G.daily.rule.name);else if(G.weekly)banner(L('Испытание недели','Weekly Trial'),weekly().name);else if(G.endless)banner(L('Бесконечная сеча','Endless Battle'),L('Круг 1: ','Round 1: ')+G.ch.name);else banner(G.ch.name,G.pity?L('💪 Боевой дух: ты сильнее на '+Math.round(PITY_MIGHT*G.pity*100)+'%, нечисть слабее на '+Math.round(PITY_STEP*G.pity*100)+'%','💪 Fighting spirit: you hit '+Math.round(PITY_MIGHT*G.pity*100)+'% harder, monsters '+Math.round(PITY_STEP*G.pity*100)+'% weaker'):G.ch.sub);
  G.tut=null;if((S.tut===-1||!S.tut&&!S.runs)&&!G.endless)tutStart();
  later(3.4,()=>heroSay(pick(PH.start)));
  // спрайты главы — заранее, чтобы не дёргалось при первом появлении
  for(const k of G.ch.en.concat([G.ch.boss,'h_'+G.hkey+'_0','h_'+G.hkey+'_1','hp_'+G.hkey,'gem1','gem2','gem3','coin','chest','pie','bird']))spr(k);
}
/* ---------- обучение первого похода (тексты — TUT и TUT_EV в data.js, плашка — tipShow в ui.js) ---------- */
function tutStart(){G.tut={i:0,t:0,d:0,ev:{},q:null,qt:0};tipShow(TUT[0].t);STAT.ev('tut',{s:0,k:TUT[0].id||''});}
function tutTick(dt){const T=G.tut;if(!T)return;T.t+=dt;
  if(T.q){T.qt-=dt;if(T.qt<=0){T.q=null;if(TUT[T.i])tipShow(TUT[T.i].t);else tipHide();}}
  const st=TUT[T.i];if(st&&st.ev==='wait'&&T.t>=st.sec)tutNext();
  if(st&&st.ev==='moved'&&G.hero.moving){T.d+=G.st.spd*dt;if(T.d>260)tutNext();}
  if(!T.xOff&&(!st||G.t>75)){T.xOff=1;$('tipX').classList.remove('on');}
  if(!st&&!T.q&&G.t>160)G.tut=null;}
function tutNext(){const T=G.tut;T.i++;T.t=0;STAT.ev('tut',{s:T.i,k:TUT[T.i]?TUT[T.i].id||'':'end'});if(T.i>=TUT.length){S.tut=1;save();tutEvent('end');}else if(!T.q)tipShow(TUT[T.i].t);}
function tutEvent(e){const T=G&&G.tut;if(!T)return;const st=TUT[T.i];if(st&&st.ev===e)tutNext();
  if(TUT_EV[e]&&!T.ev[e]){T.ev[e]=1;T.q=e;T.qt=e==='end'?6:7;tipShow(TUT_EV[e],true);}}
function tutSkip(){if(G&&G.tut)STAT.ev('tut',{s:G.tut.i,k:'skip'});S.tut=1;save();if(G)G.tut=null;tipHide();}
function heroDef(id){return HERO_BY[id]||HEROES[0];}
function heroMod(id){const m=heroDef(id).mod,r=(S.rank||{})[id]||0,o={};for(const k in m)o[k]=m[k]>0?m[k]*(1+.25*r):m[k];return o;}
// чистый расчёт: богатырь + кузница + деревня + обереги (pas) + правило недели (wm) + камень (sm); fo — «кузница, как если бы» (для показа «было → стало»)
function calcStats(heroId,pas,wm,sm,fo){const hm=heroMod(heroId),f=fo||S.forge,p=pas||{},v=S.village;
  const st={maxHp:100*(1+(hm.hp||0)+.1*(f.hp||0)+.15*(p.apple||0)),spd:118*(1+(hm.spd||0)+.04*(f.spd||0)+.08*(p.boots||0)),
    armor:(hm.armor||0)+(f.armor||0)+(p.mail||0),regen:.3*(p.livew||0)+.3*(v.well||0),might:(1+(hm.might||0)+.06*(f.might||0)+.1*(p.ring||0)),
    area:1+(hm.area||0)+.1*(p.comb||0),cd:(1-(hm.cd||0))*(1-.04*(f.cd||0))*(1-.07*(p.amulet||0)),magnet:72*(1+.2*(f.magnet||0)+.25*(p.ball||0)),
    xp:1+.1*(p.cloth||0)+.1*(v.tower||0)+.06*(f.xp||0)+(hm.xp||0),luck:1+.15*(f.luck||0)+(hm.luck||0),gold:1+.1*(f.gold||0)+.15*(v.barn||0)+(hm.gold||0),amount:p.quiver||0};
  wm=wm||{};if(wm.hp)st.maxHp*=wm.hp;if(wm.might)st.might*=wm.might;if(wm.armor)st.armor+=wm.armor;if(wm.cd)st.cd*=wm.cd;if(wm.amount)st.amount+=wm.amount;if(wm.noHeal)st.regen=0;
  if(sm){if(sm.spd)st.spd*=sm.spd;if(sm.might)st.might*=sm.might;} // «Камень на распутье»
  return st;}
function computeStats(){const st=calcStats(G.heroId,G.pas,G.wk,G.stoneMod);if(G.pity)st.might*=1+PITY_MIGHT*G.pity; // «боевой дух»: и бьём чуть сильнее
  const old=G.st;G.st=st;if(old&&st.maxHp>old.maxHp)G.hero.hp+=st.maxHp-old.maxHp;G.hero.hp=Math.min(G.hero.hp,st.maxHp);}
/* «Сила богатыря» — одно число для меню: растёт от любой боевой покупки (кузница, оружейная, деревня, звание). 100 — Добрыня без прокачки.
   fo/ar/vo — «как если бы» (кузница/оружейная/деревня) для показа прироста до покупки */
function powerScore(heroId,fo,ar,vo){const h=heroDef(heroId||S.hero),v0=S.village;let st;if(vo){S.village=vo;}try{st=calcStats(h.id,null,null,null,fo);}finally{S.village=v0;}
  const v=vo||v0,a=(ar||S.armory||{})[h.weapon]||0,rk=(S.rank||{})[h.id]||0;
  const p=100*(st.maxHp/100)*st.might/st.cd*(1+.07*st.armor)*(1+.1*a+(a>=3?.03:0)+(a>=5?.03:0))*(1+.5*(st.spd/118-1))*(1+.25*(st.xp-1))*(1+.04*(st.magnet/72-1))*(1+.1*(st.luck-1))
    *(1+.25*st.regen)*(1+.12*(v.hut||0))*(1+.04*(v.tavern||0))*(1+.015*(v.altar||0))*(1+.03*rk);
  return Math.round(p/1.1);} // 1,1 — «+10% урона» Добрыни: у него без прокачки ровно 100

/* ---------- существа ---------- */
function mkEnemy(type,x,y,o){const d=EN[type],ch=G.ch,lt=LT(),tm=1+lt/60*.34;
  const e={type,x,y,r:d.r,hp:(d.boss||type==='egg'?d.hp:d.hp*(1+(ch.hp-1)*clamp(lt/120,.3,1))*tm)*G.em,spd:d.spd*(d.boss?1:rand(.9,1.1)),dmg:d.dmg*ch.dmg*(G.emD||1),xp:d.xp||0,
    fly:d.fly,ranged:d.ranged,kx:0,ky:0,flash:0,hk:{},dead:false,ph:Math.random()*TAU,face:1,slow:0,shootT:rand(1.5,3),sc:1};
  if(G.soft){e.dmg*=d.boss?G.soft.bossDmg:G.soft.dmg;if(!d.boss&&type!=='egg'&&!d.prop)e.hp*=G.soft.hp;if(e.ranged)e.shootT*=G.soft.cd;}
  if(o&&o.elite){e.elite=1;e.sc=1.55;e.r*=1.55;e.hp*=14;e.dmg*=1.4;e.spd*=.85;}
  if(d.boss){e.boss=1;e.at=3;e.at2=8;e.at3=10;e.state='';e.st=0;e.phase=0;}
  if(G.curse){const cm=curseMul(G.curse);e.hp*=cm.hp;e.dmg*=cm.dmg;}
  const wm=G.wk;if(d.prop){e.prop=1;e.spd=0;}else{if(wm.espd)e.spd*=d.boss?1+(wm.espd-1)/2:wm.espd;if(!d.boss&&type!=='egg'){if(wm.ehp)e.hp*=wm.ehp;if(wm.esz){e.sc*=wm.esz;e.r*=wm.esz;}if(wm.exp)e.xp*=wm.exp;if(qLow())e.hp*=1.25;}G.meet[type]=1;} // эффекты «мало»: нечисти ×0,8, но она крепче
  e.max=e.hp;G.en.push(e);return e;}
function spawnPos(far){const H=G.hero;let a=rand(0,TAU);if(H.moving&&Math.random()<.5)a=Math.atan2(H.fy,H.fx)+rand(-1,1);
  const d=(far||VIEW.R)+rand(0,40);return [H.x+Math.cos(a)*d,H.y+Math.sin(a)*d];}
function pickType(){const t=LT(),en=G.ch.en,unl=[0,35,95,165];let tot=0;const w=en.map((id,i)=>{if(t<unl[i])return 0;let v=i===3?.3:1;if(i>0&&t-unl[i]<60)v*=1.6;if(G.soft&&EN[id].ranged)v*=G.soft.w;if(i===0&&t>150)v*=.6;tot+=v;return v;});
  let r=Math.random()*tot;for(let i=0;i<en.length;i++){r-=w[i];if(r<=0)return en[i];}return en[0];}
function spawnTick(dt){const t=LT();let rate=(1.15+t/60*1.2)*(G.wk.spawn||1);const cap=(48+t/60*56)*(G.wk.cap||1)*(qLow()?.8:1);
  if(G.boss&&!G.boss.dead)rate*=.35;if(G.richT>0)rate*=1.6;if(G.win)return;if(G.sleepT>0)rate=0; // сон-трава: пока нечисть спит, новая не лезет
  G.spawnAcc+=rate*dt;while(G.spawnAcc>=1){G.spawnAcc-=1;if(G.en.length>=cap)break;const p=spawnPos();mkEnemy(pickType(),p[0],p[1]);}
  while(G.ev.length&&G.t>=G.ev[0].t){const ev=G.ev.shift(),H=G.hero;
    if(ev.k==='elite'){const p=spawnPos();const e=mkEnemy(G.ch.en[Math.min(3,Math.floor(t/80))],p[0],p[1],{elite:1});say(e,L('Я тут главный!','I\'m the boss here!'));tutEvent('elite');}
    if(ev.k==='ring'){const n=30,R=VIEW.R-20;for(let i=0;i<n;i++){const a=i/n*TAU;mkEnemy(G.ch.en[0],H.x+Math.cos(a)*R,H.y+Math.sin(a)*R);}banner(L('Окружили!','Surrounded!'),L('Прорывайся!','Break through!'),2);tutEvent('ring');}
    if(ev.k==='swarm'){const a=rand(0,TAU),bx=H.x+Math.cos(a)*VIEW.R,by=H.y+Math.sin(a)*VIEW.R;for(let i=0;i<24;i++){const e=mkEnemy(G.ch.en[1],bx+rand(-60,60),by+rand(-60,60));e.spd*=1.25;}banner(L('Стая!','Swarm!'),L('Со всех ног!','Run for it!'));}
    if(ev.k==='bird'){spawnGift();tutEvent('bird');}
    if(ev.k==='chev')chapterEvent();
    if(ev.k==='stone')spawnStone();
    if(ev.k==='boss')spawnBoss();}}
function spawnBoss(){const type=G.ch.boss,H=G.hero,a=rand(0,TAU);const e=mkEnemy(type,H.x+Math.cos(a)*VIEW.R*.7,H.y+Math.sin(a)*VIEW.R*.7);
  // выход босса — событие (boost): 1,4 с он стоит и грозит, края экрана темнеют, плашка с именем и прозвищем; реплика — в облачке
  G.boss=e;e.intro=1.4;G.bossIn=1.4;banner(EN[type].n,BOSS_TITLE[type]?BOSS_TITLE[type]():'«'+PH.boss[type].intro+'»',5);say(e,PH.boss[type].intro,3.2);SND.boss();G.shake=12;vib(60,1);musicPlay('boss');
  G.fx.push({k:'wave',x:e.x,y:e.y,t:0,dur:.9,r1:240,col:'#ff5a3a'});burst(e.x,e.y,EN[type].col,24,220);}
// прозвища боссов для плашки выхода
const BOSS_TITLE={solo:()=>L('Свистун дремучего леса','Whistler of the Deep Forest'),yaga:()=>L('Хозяйка гиблого болота','Mistress of the Mire'),gory:()=>L('Трёхглавый хозяин Дикого поля','Three-headed lord of the Wild Field'),
  kosh:()=>L('Царь над златом и тьмой','King of gold and gloom'),karach:()=>L('Повелитель стужи','Lord of the Frost'),morcar:()=>L('Владыка морских глубин','Ruler of the deep sea'),
  tugar:()=>L('Огненный змей','The Fire Serpent'),liho:()=>L('Беда о одном глазе','One-eyed Woe')};
/* ---------- свои события глав (v17, аудит 14): по силе — как прежняя «Стая» (20–25 нечисти), у каждой главы своё ---------- */
const CH_EV=['wolves','fog','barrows','shadows','avalanche','tide','firerain','night'];
function chapterEvent(){const H=G.hero,en=G.ch.en,k=CH_EV[G.chi]||'wolves',R=VIEW.R;
  if(k==='wolves'){const a=rand(0,TAU),ux=Math.cos(a),uy=Math.sin(a),bx=H.x+ux*R,by=H.y+uy*R; // клином: вершина ближе, крылья сзади
    for(let i=0;i<22;i++){const row=Math.ceil(i/2),side=i%2?1:-1,back=row*34,off=row*30*side;const e=mkEnemy(en[2],bx+ux*back-uy*off,by+uy*back+ux*off);e.spd*=1.3;}
    banner(L('Волчья стая!','Wolf pack!'),L('Идут клином — уходи вбок!','They charge in a wedge — step aside!'));}
  if(k==='fog'||k==='night'){G.fogT=14;G.fogK=k;for(let i=0;i<20;i++){const a=rand(0,TAU),d=R*rand(.55,.8);mkEnemy(k==='fog'?en[1]:en[0],H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);}
    k==='fog'?banner(L('Болотный туман','Swamp fog'),L('Кикиморы прячутся в тумане','Kikimoras hide in the fog')):banner(L('Лихо глаз закрыло','Likho shut its eye'),L('Тьма — нечисть лезет из мрака','Darkness — monsters crawl out of the gloom'));}
  if(k==='barrows'){const a0=rand(0,TAU);for(let j=0;j<5;j++){const a=a0+j/5*TAU,x=H.x+Math.cos(a)*R*.5,y=H.y+Math.sin(a)*R*.5;
      G.fx.push({k:'pulse',x,y,t:0,dur:.9,r1:70});later(.9,()=>{if(!G||G.over)return;burst(x,y,'#b59f59',14,140);for(let i=0;i<5;i++)mkEnemy(en[1],x+rand(-30,30),y+rand(-30,30));});}
    banner(L('Засада из курганов!','Barrow ambush!'),L('Мертвецы встают из земли','The dead rise from the ground'));}
  if(k==='shadows'){for(let i=0;i<20;i++){const a=i/20*TAU,e=mkEnemy(en[0],H.x+Math.cos(a)*R*.9,H.y+Math.sin(a)*R*.9);e.shade=1;}banner(L('Кощеевы тени','Koschei\'s shadows'),L('Видны только вблизи!','Visible only up close!'));}
  if(k==='avalanche'){const s=Math.random()<.5?-1:1;for(let i=0;i<24;i++){const e=mkEnemy(en[0],H.x+(i-11.5)*30,H.y+s*(VIEW.wh+40)+rand(-12,12));e.spd*=1.5;}banner(L('Лавина!','Avalanche!'),L('Ледяные волки катятся с гор','Ice wolves roll down the mountains'));}
  if(k==='tide'){for(const s of[-1,1])for(let i=0;i<12;i++)mkEnemy(en[0],H.x+s*(VIEW.ww+30),H.y+(i-5.5)*36);banner(L('Прилив!','High tide!'),L('Рыбы-зубастики с двух сторон','Toothy fish from both sides'));}
  if(k==='firerain'){for(let i=0;i<14;i++)later(i*.45,()=>{if(!G||G.over||G.win)return;const Hh=G.hero,aim=i%3===0;
      G.haz.push({x:Hh.x+(aim?rand(-30,30):rand(-230,230)),y:Hh.y+(aim?rand(-30,30):rand(-200,200)),t:0,warn:1.3,r:54});});
    for(let i=0;i<8;i++){const p=spawnPos();mkEnemy(en[0],p[0],p[1]);}banner(L('Огненный дождь!','Rain of fire!'),L('Уходи из красных кругов','Get out of the red circles'));}
}
// огненный дождь: круг-предупреждение 1,3 с, потом удар (богатырю — как от огневика, нечисти — тоже достаётся)
function hazTick(dt){if(G.fogT>0)G.fogT-=dt;const H=G.hero;
  for(const q of G.haz){q.t+=dt;if(!q.hit&&q.t>=q.warn){q.hit=1;burst(q.x,q.y,'#ff8a2a',16,180);G.fx.push({k:'boom',x:q.x,y:q.y,t:0,dur:.45,r:q.r*1.3});SND.boom();
      if((H.x-q.x)**2+(H.y-q.y)**2<(q.r+8)**2)hurtHero(9*G.ch.dmg*(G.emD||1),'ognev');
      forNear(q.x,q.y,q.r+20,e=>{if(!e.boss&&(e.x-q.x)**2+(e.y-q.y)**2<(q.r+e.r)**2)hitEnemy(e,40*G.st.might,0,0);});}}
  compact(G.haz,q=>q.t<q.warn+.3);
  const s=G.stone;if(s&&!s.done){s.t+=dt;
    for(const p of s.p){if((H.x-p.x)**2+(H.y-p.y)**2<38*38){stoneChoose(p.k);break;}}
    if(!s.done&&(s.t>28||s.t>6&&(H.x-s.x)**2+(H.y-s.y)**2>(VIEW.R*1.6)**2)){s.done=1;G.stone=null;}}
  if(G.richT>0)G.richT-=dt;}
/* ---------- «Камень на распутье» (v17, аудит 14/отчёт 11): выбор ногами, без окна и паузы.
   Коня потеряешь — скорость −15% до конца похода, но сразу 2 уровня; себя потеряешь — здоровье до трети, но урон +25%;
   богатство найдёшь — сундук умений, но 45 с нечисти сбегается больше. Золото не даёт (экономика та же) ---------- */
const STONE=[{k:'horse',ic:'🐎',get t(){return L('Коня потеряешь','Lose your horse');},get s(){return L('+2 уровня, но медленнее','+2 levels, but slower');}},{k:'self',ic:'💀',get t(){return L('Себя потеряешь','Lose yourself');},get s(){return L('урон +25%, но ранен','+25% damage, but wounded');}},{k:'rich',ic:'🎁',get t(){return L('Богатство найдёшь','Find riches');},get s(){return L('сундук, но нечисти больше','a chest, but more monsters');}}];
function spawnStone(){const H=G.hero,a=H.moving?Math.atan2(H.fy,H.fx)+rand(-.5,.5):rand(0,TAU),d=Math.min(VIEW.ww,VIEW.wh)*.55,x=H.x+Math.cos(a)*d,y=H.y+Math.sin(a)*d;
  G.stone={x,y,t:0,p:STONE.map((q,i)=>({k:q.k,x:x+(i-1)*120,y:y+(i===1?130:50)}))};banner(L('Камень на распутье','Crossroads Stone'),L('Выбери дорогу — просто зайди в круг','Pick a road — just step into a circle'));
  later(.8,()=>{if(G&&G.stone)heroSay(L('Налево пойдёшь… направо пойдёшь… Хм!','Go left… go right… Hmm!'));});}
function stoneChoose(k){const s=G.stone,H=G.hero;if(!s||s.done)return;s.done=1;G.stone=null;G.stoneK=k;SND.chest();vib(40);burst(s.x,s.y,'#c8c0b0',14,160);
  G.stoneMod=G.stoneMod||{};
  if(k==='horse'){G.stoneMod.spd=.85;computeStats();for(let i=0;i<2;i++){H.lvl++;H.need=xpNeed(H.lvl);G.lvlQ++;}banner(L('Коня потерял…','Horse lost…'),L('…зато силы прибыло: +2 уровня','…but you feel stronger: +2 levels'),2);}
  if(k==='self'){G.stoneMod.might=1.25;computeStats();H.hp=Math.min(H.hp,Math.max(1,G.st.maxHp*.34));G.hpLock=H.hp;banner(L('Себя не жалеешь!','No mercy for yourself!'),L('Урон +25% до конца похода','+25% damage for the rest of the run'),2);}
  if(k==='rich'){drop('chest',s.x,s.y);G.picks[G.picks.length-1].mag=true;G.richT=45;banner(L('Богатство нашёл!','Riches found!'),L('Нечисть сбегается на звон — держись!','Monsters come running at the jingle — hold on!'),2);}}
function spawnGift(){const H=G.hero,s=Math.random()<.5?1:-1;G.gift={x:H.x-s*(VIEW.ww+30),y:H.y+rand(-VIEW.wh*.4,VIEW.wh*.2),vx:s*44,t:0,ph:0};}

/* ---------- урон ---------- */
// цифры урона: не больше 30 (эффекты «мало» — 12); крит вытесняет самую старую цифру; lbl — надпись «КРИТ!»
function addNum(x,y,v,col,cr){const cap=qLow()?10:16;if(G.nums.length>=cap){if(!cr)return null;G.nums.shift();}const n={x,y,v:typeof v==='number'?Math.round(v):v,t:0,col,cr:cr?1:0,b:G.t};G.nums.push(n);return n;}
/* удар «с отдачей» (v13): крит 5% × удача — урон ×2, крупная жёлтая цифра с «!» (надпись «КРИТ!» — не чаще раза в 0,7 с);
   крит по вожаку/боссу — вибрация, по боссу — ещё замирание кадра 45 мс (не чаще раза в 1,2 с, иначе похоже на тормоза) */
function hitEnemy(e,d,kx,ky){if(e.dead)return;if(e.prop){propHit(e);return;}if(e.invul){e.flash=.06;return;}
  const cr=Math.random()<.05*G.st.luck;if(cr)d*=2;
  e.hp-=d;e.flash=e.boss?.06:.1;const m=e.boss||e.elite?.08:1;e.kx+=(kx||0)*m;e.ky+=(ky||0)*m;
  // цифры по одному врагу за 0,25 с складываются в одну (раньше — три ряда «33 33 33» поверх героя); крит — своя цифра; слово «КРИТ!» — только по вожаку и боссу
  {const m0=e.num;if(!cr&&m0&&m0.t<.25&&G.t-m0.b<.6&&!m0.cr&&typeof m0.v==='number'){m0.v+=Math.round(d);if(m0.v>=40)m0.col='#ffd84a';m0.t=Math.min(m0.t,.12);}else{const n=addNum(e.x+rand(-6,6),e.y-e.r*1.2,d,cr?'#ffe14a':d>=40?'#ffd84a':null,cr);if(!cr)e.num=n;}}
  if(cr){SND.crit();if((e.boss||e.elite)&&G.t-(G.critL||-9)>.7){G.critL=G.t;addNum(e.x,e.y-e.r*1.2-16,L('КРИТ!','CRIT!'),'#ffe14a',1);}
    if(e.boss||e.elite){vib(20);if(e.boss&&G.t-(G.hsT||-9)>1.2)hitStop(.045);}}else SND.hit();
  if(e.hp<=0){if(e.type==='kosh'&&e.phase===0){kosheyEgg(e);return;}killEnemy(e);}}
// замирание кадра: игра стоит s секунд (кадр не перерисовывается — на слабом телефоне это даже отдых). В спокойном режиме — нет
function hitStop(s){if(CALM())return;G.hs=Math.max(G.hs||0,s);G.hsT=G.t;}
// серия: сколько одолено за последние 10 с (10 корзин по секунде) — «Раззудись плечо! ×50/×100/×200»
function comboKill(){const s=Math.floor(G.t);let K=G.kb;if(!K)K=G.kb={b:[0,0,0,0,0,0,0,0,0,0],s,sum:0,lv:0};
  if(s!==K.s){for(let i=K.s+1;i<=s&&i<=K.s+10;i++){K.sum-=K.b[i%10];K.b[i%10]=0;}K.s=s;if(K.sum<25)K.lv=0;}
  K.b[s%10]++;K.sum++;const T=[50,100,200];if(K.lv<3&&K.sum>=T[K.lv]){K.lv++;G.combo={n:T[K.lv-1],t:0};SND.combo();if(K.lv>1)vib(25);}}
function killEnemy(e){e.dead=true;G.kills++;G.kt[e.type]=(G.kt[e.type]||0)+1;SND.kill();burst(e.x,e.y,EN[e.type].col,e.boss?40:e.elite?20:7,e.boss?260:120);comboKill();
  if(e.elite){hitStop(.06);vib(35,1);}
  if(e.type==='egg'){const k=G.boss;hitStop(.08);vib(50,1);if(k&&!k.dead){k.invul=false;k.phase=2;k.hp=k.max*.35;say(k,L('Ай! Моя иголочка!','Ouch! My little needle!'),2.5);G.shake=8;}return;}
  if(e.boss){bossDie(e);return;}
  dropGem(e.x,e.y,e.xp*(e.elite?12:1)*(1+G.chi*.25));
  const lk=G.st.luck;if(Math.random()<.05*lk*(e.elite?30:1))drop('coin',e.x+rand(-8,8),e.y+rand(-8,8),randi(1,3));
  if(Math.random()<.005*lk&&!G.wk.noHeal)drop('pie',e.x,e.y);
  if(Math.random()<.0025*lk)drop('yarn',e.x,e.y);
  if(e.elite)drop('chest',e.x,e.y);}
function bossDie(e){G.shake=16;SND.win();S.bossKill[e.type]=1;musicPlay(G.endless?'run':null);hitStop(.14);vib(90,1);
  // гибель босса — событие (boost): взрыв, две волны, сноп искр, короткое замедление (в спокойном режиме — без замедления), золото само летит к богатырю
  G.fx.push({k:'boom',x:e.x,y:e.y,t:0,dur:.7,r:170});G.fx.push({k:'wave',x:e.x,y:e.y,t:0,dur:.8,r1:300,col:'#ffe07a'});G.fx.push({k:'wave',x:e.x,y:e.y,t:-.18,dur:.9,r1:380,col:'#ffffff'});
  spark(e.x,e.y,'#fff3b0',30);burst(e.x,e.y,'#ffd84a',26,320);if(!CALM())G.slowT=.9;
  later(.8,()=>{if(G)for(const p of G.picks)if(p.k==='coin')p.mag=true;});
  if(G.endless){banner(defeated(e.type),L('Дальше — сильнее!','It only gets harder!'),5);G.bossesKilled=(G.bossesKilled||0)+1;later(3.5,nextCycle);}
  else{G.win=true;G.winT=3.7;banner(PH.win[0],defeated(e.type),5);}
  for(let i=0;i<16;i++)drop('coin',e.x+rand(-60,60),e.y+rand(-60,60),Math.round(8*G.ch.gold));
  // с босса — золотой сундук (3 или 5 наград); в сече сам летит к богатырю. В главе поход через 3 с кончается — умения уже не нужны:
  // вместо рулетки «Добыча богатыря» — то же золото, что лежало в сундуке (экономика та же), строкой в итогах (аудит 14)
  if(G.endless){drop('chest',e.x,e.y,2);G.picks[G.picks.length-1].mag=true;}
  else{G.loot=Math.round(randi(15,30)*G.ch.gold*ECO.coin*3);G.q.chests++;later(1,()=>{if(G&&!G.over)heroSay(L('Вот это добыча!','Now that\'s loot!'));});}
  G.boss=null;for(const o of G.en)if(!o.dead&&o!==e){o.dead=true;burst(o.x,o.y,EN[o.type].col,5,100);dropGem(o.x,o.y,o.xp);}
  G.eproj.length=0;for(const g of G.gems)g.mag=true;}
// «Соловей повержен», «Баба-Яга повержена», «Лихо повержено» — род из EN[].g
function defeated(t){const d=EN[t];return LANG==='en'?d.n+' defeated!':d.n+' '+(d.g==='f'?'повержена':d.g==='n'?'повержено':'повержен')+'!';} // i18n:ru — русская ветка (род босса)
function runStats(win){const t=S.stats,mx=(k,v)=>{t[k]=Math.max(t[k]||0,v);};mx('maxLvl',G.hero.lvl);mx('maxChests',G.q.chests);mx('maxGold',G.reward);
  if(win&&!G.endless&&!G.daily){if(G.weapons.length===1)t.one=1;if(!Object.keys(G.pas).length)t.nopas=1;if(G.hits<=5&&G.chi>=3)t.tough=1;mx('maxCurse',G.curse);
    G.curseUp=false;if(G.chi===CH.length-1){if(!S.curseMax){S.curseMax=1;G.curseUp=1;}else if(G.curse===S.curseMax&&S.curseMax<5){S.curseMax++;G.curseUp=S.curseMax;}}}
  G.achNew=achCheck();}
/* бесконечная сеча: после 8 глав каждый новый круг ×1,5 к здоровью (урон ×1,25) — от уровня последней главы, без обрыва ×9 */
function nextCycle(){if(!G||G.over)return;G.cyc++;const LAP=Math.floor(G.cyc/CH.length),F=CH[CH.length-1];G.chi=G.cyc%CH.length;G.ch=CH[G.chi]; // не L: L() — функция перевода
  G.em=LAP?Math.pow(1.5,LAP)*F.hp/G.ch.hp:1;G.emD=LAP?Math.pow(1.25,LAP)*F.dmg/G.ch.dmg:1;
  G.t0=G.t;G.ev=mkEvents(G.t);G.egg=null;banner(L('Круг ','Round ')+(G.cyc+1)+': '+G.ch.name,G.ch.sub);SND.boss();}
function hurtHero(d,src){const H=G.hero;if(H.inv>0||G.over||G.win)return;if(src)G.lastBy=src;G.hits++;d=Math.max(1,d-G.st.armor);H.hp-=d;H.inv=.5;H.hurtT=.22;SND.hurt();G.shake=Math.max(G.shake,4);
  addNum(H.x,H.y-30,d,'#ff5a5a');if(H.hp<H.max*.3&&H.sayT<=0){heroSay(pick(PH.low));}
  if(G.novHeal&&H.hp>0&&H.hp<G.st.maxHp*.35){G.novHeal=0;drop('loaf',H.x+rand(-30,30),H.y-46);const lf=G.picks[G.picks.length-1];lf.find=1;lf.t=.3;} // первый поход: каравай сам прилетит (+50% здоровья)
  if(H.hp<=0){H.hp=0;heroDown();}}
function heroDown(){const H=G.hero;G.falls=(G.falls||0)+1;if(G.revives>0){G.revives--;revive(L('Знахаркин отвар!','Wise woman\'s brew!'));return;}G.paused=true;IN.on=false;YG.stop();openDeath();}
function revive(msg){const H=G.hero;H.hp=G.st.maxHp*.6;G.hpLock=H.hp;H.inv=2.5;G.paused=false;G.fx.push({k:'wave',x:H.x,y:H.y,t:0,dur:.6,r1:260,col:'#ffe07a',own:1});
  for(const e of G.en){if(e.dead||e.boss)continue;const dx=e.x-H.x,dy=e.y-H.y,d=Math.hypot(dx,dy)||1;if(d<260){e.kx+=dx/d*600;e.ky+=dy/d*600;hitEnemy(e,60);}}
  heroSay(msg||L('Врёшь, не возьмёшь!','Not today, monsters!'));SND.level();YG.start();}

/* ---------- добыча ---------- */
function dropGem(x,y,v){if(v<=0)return;if(G.gems.length>320){const g=G.gems[Math.floor(Math.random()*G.gems.length)];g.v+=v;return;}
  G.gems.push({x:x+rand(-4,4),y:y+rand(-4,4),v,mag:false,sp:0});}
function drop(k,x,y,v){G.picks.push({k,x,y,v:v||1,mag:false,sp:0,t:0});}
/* ---------- находки на поле (v13): раз в ~40 с рядом с богатырём — пенёк или колода; 3 удара — и выпадает находка (FINDS в data.js) ---------- */
function spawnProp(){const H=G.hero,a=H.moving?Math.atan2(H.fy,H.fx)+rand(-.7,.7):rand(0,TAU),d=Math.min(VIEW.ww,VIEW.wh)*.62;
  const e=mkEnemy(Math.random()<.5?'pen':'kol',H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);e.hits=3;e.t0=G.t;G.prop=e;
  if(!G.propSaid){G.propSaid=1;later(.6,()=>heroSay(e.type==='pen'?L('Пенёк светится… Разбить!','A glowing stump… Smash it!'):L('Колода! Может, там клад?','A log! Treasure inside?')));}}
function propHit(e){if((e.hk.pr||0)>G.t)return;e.hk.pr=G.t+.12;e.flash=.12;SND.crack();if(--e.hits>0)return;
  e.dead=true;G.prop=null;burst(e.x,e.y,EN[e.type].col,12,150);spark(e.x,e.y,'#fff3b0',8);
  const H=G.hero;let tot=0;const FW=FINDS.map(f=>{let w=f.w;if(f.k==='loaf'&&(G.wk.noHeal||H.hp>G.st.maxHp*.85))w=0;else if(f.k==='loaf'&&H.hp<G.st.maxHp*.4)w*=2.5;tot+=w;return w;});
  let r=Math.random()*tot,i=0;for(;i<FW.length-1;i++){r-=FW[i];if(r<=0)break;}drop(FINDS[i].k,e.x,e.y);G.picks[G.picks.length-1].find=1;}
// разрыв-трава: вся мелкая нечисть на экране — прочь (вожаку — треть здоровья, босса и яйцо не трогает)
function razryv(){G.fx.push({k:'wave',own:1,t:0,dur:.6,r1:VIEW.R,col:'#9aff6a'});G.shake=Math.max(G.shake,8);hitStop(.08);vib(60,1);SND.boom();
  for(const e of G.en){if(e.dead||e.boss||e.prop||e.type==='egg'||!onScreen(e,10))continue;if(e.elite){hitEnemy(e,e.max*.34);continue;}killEnemy(e);}
  G.eproj.length=0;}
// сон-трава: нечисть спит 5 с (босс — 1,5 с), снаряды пропадают, новая не лезет
function sleepAll(){G.sleepT=5;for(const e of G.en){if(e.dead||e.prop)continue;e.stun=Math.max(e.stun||0,e.boss?1.5:5);}G.eproj.length=0;G.fx.push({k:'pulse',own:1,t:0,dur:.9,r1:VIEW.R,evo:1});SND.heal();vib(40);}
function addXp(v){const H=G.hero;H.xp+=v*G.st.xp;while(H.xp>=H.need){H.xp-=H.need;H.lvl++;H.need=xpNeed(H.lvl);G.lvlQ++;}}
function heroSay(s){const H=G.hero;H.sayT=6;compact(G.bub,b=>b.e!==H);G.bub.push({e:H,s,t:0,dur:2.5+s.length*.05});}
function say(e,s,dur){const H=G.hero;compact(G.bub,b=>b.e!==e&&(b.e===H||b.e.boss||e.boss));G.bub.push({e,s,t:0,dur:Math.max(dur||0,2.5+s.length*.05)});}
/* баннеры (boost): один за раз, остальные ждут в очереди (не больше 3) по важности pri: 5 — босс, 4 — эволюция, 3 — событие/начало (по умолчанию), 2 — «Окружили!» и подсказки, 1 — находки.
   Важный (≥4) сразу сменяет менее важный; пока очередь не пуста, баннер висит 1,5 с вместо 3,2 с */
function banner(title,sub,pri){if(!G)return;const b={title,sub,t:0,pri:pri||3};
  if(!G.banner){G.banner=b;return;}if(!G.bq)G.bq=[];
  if(b.pri>=4&&b.pri>G.banner.pri){if(G.banner.t<1&&G.banner.pri>=3)G.bq.unshift(Object.assign(G.banner,{t:0}));G.banner=b;return;}
  let i=0;while(i<G.bq.length&&G.bq[i].pri>=b.pri)i++;G.bq.splice(i,0,b);if(G.bq.length>3)G.bq.length=3;}
function bannerDur(){return G.bq&&G.bq.length?1.5:3.2;}

/* ---------- частицы и эффекты ---------- */
// эффекты «мало»: частиц вдвое меньше и не больше 200 на экране
function burst(x,y,col,n,sp){const lo=qLow(),cap=lo?200:500;if(lo)n=Math.ceil(n/2);for(let i=0;i<n;i++){if(G.pt.length>cap)return;const a=rand(0,TAU),v=rand(.3,1)*(sp||120);
  G.pt.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,t:0,dur:rand(.35,.7),col,s:rand(2,4.5)});}}
function spark(x,y,col,n){const lo=qLow(),cap=lo?200:500;if(lo)n=Math.ceil(n/2);for(let i=0;i<n;i++){if(G.pt.length>cap)return;G.pt.push({x,y,vx:rand(-40,40),vy:rand(-60,-10),t:0,dur:rand(.2,.45),col,s:rand(1.5,3),add:1});}}

/* ---------- оружие ---------- */
function wv(w,key){return WEAPONS[w.id][key][w.lvl-1];}
// урон и площадь с учётом силы богатыря и вечной прокачки в оружейной
function wd(w){return wv(w,'dmg')*G.st.might*(1+.1*((S.armory||{})[w.id]||0));}
function wa(w){const am=(S.armory||{})[w.id]||0;return G.st.area*(1+(am>=3?.1:0)+(am>=5?.1:0));}
function slash(a,r,dmg,full){const H=G.hero,span=full?Math.PI:1.25;G.fx.push({k:'slash',own:1,a,r,t:0,dur:.2,full});SND.swing();
  forNear(H.x,H.y,r+24,e=>{const dx=e.x-H.x,dy=e.y-H.y,d=Math.hypot(dx,dy);if(d>r+e.r)return;let da=Math.atan2(dy,dx)-a;da=Math.atan2(Math.sin(da),Math.cos(da));
    if(Math.abs(da)<=span||d<e.r+16)hitEnemy(e,dmg,dx/(d||1)*160,dy/(d||1)*160);});}
function bolt(x,y,x0,y0,dmg,R){const pts=[],steps=9;for(let s=0;s<=steps;s++)pts.push(lerp(x0,x,s/steps)+(s&&s<steps?rand(-16,16):0),lerp(y0,y,s/steps)+(s&&s<steps&&x0===x?0:0));
  G.fx.push({k:'bolt',x,y,pts,t:0,dur:.3});forNear(x,y,R+20,e=>{if((e.x-x)**2+(e.y-y)**2<(R+e.r)**2)hitEnemy(e,dmg,0,0);});spark(x,y,'#bfeaff',6);}
function updWeapons(dt){const H=G.hero,st=G.st;
  for(const w of G.weapons){const evo=w.lvl>=6;w.t-=dt;
    switch(w.id){
    case 'sword':if(w.t<=0){w.t=wv(w,'cd')*st.cd;const a=aimAngle(),r=wv(w,'r')*wa(w),d=wd(w);
      const n=1+st.amount;for(let i=0;i<n;i++)later(i*.14,()=>{if(evo){slash(a,r,d,true);return;}slash(a,r,d);if(wv(w,'back'))later(.1,()=>slash(a+Math.PI,r,d));});}break;
    case 'bow':if(w.t<=0){w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount,skip=new Set();
      for(let i=0;i<n;i++){const tg=nearest(H.x,H.y,VIEW.R,skip);if(tg)skip.add(tg);
        later(i*.05,()=>{let a;if(tg&&!tg.dead)a=Math.atan2(tg.y-H.y,tg.x-H.x);else a=Math.atan2(H.fy,H.fx)+rand(-.3,.3);
          G.proj.push({k:'arrow',id:G.pid++,x:H.x,y:H.y-6,vx:Math.cos(a)*(evo?640:520),vy:Math.sin(a)*(evo?640:520),a,life:1.1,dmg:wd(w),pierce:wv(w,'pierce'),hit:new Set(),evo});SND.shoot();});}}break;
    case 'mace':{w.a+=dt*(evo?4.2:3.6);const n=wv(w,'n')+st.amount,R=wv(w,'r')*wa(w),d=wd(w),br=(evo?17:11)*wa(w);w.balls=[];
      for(let i=0;i<n;i++){const a=w.a+i/n*TAU,bx=H.x+Math.cos(a)*R,by=H.y+Math.sin(a)*R;w.balls.push([bx,by]);
        forNear(bx,by,40,e=>{const dx=e.x-bx,dy=e.y-by;if(dx*dx+dy*dy>(e.r+br)**2)return;if((e.hk.m||0)>G.t)return;e.hk.m=G.t+.42;
          hitEnemy(e,d,Math.cos(a)*(evo?320:140),Math.sin(a)*(evo?320:140));spark(bx,by,'#ffffff',2);});}}break;
    case 'fire':if(w.t<=0){w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount;const pool=G.en.filter(e=>!e.dead&&onScreen(e,20));
      for(let i=0;i<n;i++){const tg=pool.length?pool[Math.floor(Math.random()*pool.length)]:null,a=rand(0,TAU);
        G.proj.push({k:'fire',id:G.pid++,x:H.x,y:H.y-10,vx:Math.cos(a)*160,vy:Math.sin(a)*160,tg,life:3,dmg:wd(w),r:wv(w,'r')*wa(w),evo});}SND.shoot();}break;
    case 'gusli':if(w.t<=0){w.t=.6;const R=wv(w,'r')*wa(w),d=wd(w);let hits=0;G.fx.push({k:'pulse',own:1,t:0,dur:.55,r1:R,evo});
      forNear(H.x,H.y,R+20,e=>{const dx=e.x-H.x,dy=e.y-H.y;if(dx*dx+dy*dy>(R+e.r)**2)return;e.slow=.7;hitEnemy(e,d,0,0);hits++;});
      if(evo&&hits&&H.hp<st.maxHp){const h=Math.min(4,hits*.4);H.hp=Math.min(st.maxHp,H.hp+h);}}break;
    case 'perun':if(w.t<=0){w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount;const pool=G.en.filter(e=>!e.dead&&onScreen(e,-10));
      for(let i=0;i<n;i++){let x,y;if(pool.length){const e=pool.splice(Math.floor(Math.random()*pool.length),1)[0];x=e.x;y=e.y;}else{x=H.x+rand(-VIEW.ww,VIEW.ww)*.7;y=H.y+rand(-VIEW.wh,VIEW.wh)*.7;}
        later(i*.08,()=>{const R=36*wa(w),d=wd(w);bolt(x,y,x+rand(-40,40),y-VIEW.wh-60,d,R);SND.zap();G.shake=Math.max(G.shake,2.5);
          if(evo){const nb=[];forNear(x,y,160,e=>{if((e.x-x)**2+(e.y-y)**2<160*160)nb.push(e);});const near=nb.sort((a,b)=>((a.x-x)**2+(a.y-y)**2)-((b.x-x)**2+(b.y-y)**2)).slice(1,4);
            for(const e of near)later(.06,()=>bolt(e.x,e.y,x,y,d*.6,R*.6));}});}}break;
    case 'kolo':if(w.t<=0){w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount;for(let i=0;i<n;i++){const a=rand(0,TAU);
        G.proj.push({k:'kolo',id:G.pid++,x:H.x,y:H.y,vx:Math.cos(a)*210,vy:Math.sin(a)*210,life:wv(w,'dur'),dmg:wd(w),rot:0,sc:evo?1.8:1,hk:new Map()});}}break;
    case 'axe':if(w.t<=0){w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount,a0=aimAngle();
      for(let i=0;i<n;i++){const a=evo?a0+i/n*TAU:a0+(i-(n-1)/2)*.45;G.proj.push({k:'axe',id:G.pid++,x:H.x,y:H.y,dx:Math.cos(a),dy:Math.sin(a),v:430,ret:false,life:4,dmg:wd(w),rot:0,sc:evo?1.4:1,hk:new Map()});}SND.swing();}break;
    case 'water':if(w.t<=0){w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount;const pool=G.en.filter(e=>!e.dead&&(e.x-H.x)**2+(e.y-H.y)**2<260*260);
      for(let i=0;i<n;i++){let tx,ty;if(pool.length){const e=pick(pool);tx=e.x;ty=e.y;}else{const a=rand(0,TAU);tx=H.x+Math.cos(a)*120;ty=H.y+Math.sin(a)*120;}
        if(evo&&i===0){tx=H.x+rand(-30,30);ty=H.y+rand(-30,30);}
        G.proj.push({k:'flask',id:G.pid++,x0:H.x,y0:H.y,x:H.x,y:H.y,tx,ty,t:0,dur:.55,dmg:wd(w),r:wv(w,'r')*wa(w),rot:0,life:9,evo});}}break;
    }}}
/* ---------- дары богатырей ---------- */
function darRank(){return (S.rank||{})[G.heroId]||0;}
function darCd(){return heroDef(G.heroId).dar.cd*(1-.07*darRank());}
function darPow(){return (1+.3*darRank())*G.st.might;}
function updDar(dt){const H=G.hero;G.wolfT-=dt;G.swordT-=dt;G.dashT-=dt;G.darT-=dt;
  if(G.wolfT>0)forNear(H.x,H.y,40,e=>{if((e.x-H.x)**2+(e.y-H.y)**2>(e.r+18)**2||(e.hk.wv||0)>G.t)return;e.hk.wv=G.t+.3;hitEnemy(e,35*darPow(),(e.x-H.x)*4,(e.y-H.y)*4);});
  if(G.swordT>0){G.swords=[];for(let i=0;i<6;i++){const a=G.t*4+i/6*TAU,x=H.x+Math.cos(a)*95,y=H.y+Math.sin(a)*95;G.swords.push([x,y,a]);
    forNear(x,y,34,e=>{if((e.x-x)**2+(e.y-y)**2>(e.r+14)**2||(e.hk.ms||0)>G.t)return;e.hk.ms=G.t+.3;hitEnemy(e,25*darPow(),Math.cos(a)*120,Math.sin(a)*120);});}}
  if(G.darT>0||G.win)return;G.darT=darCd();G.q.dars++;const d=heroDef(G.heroId).dar,P=darPow(),A=G.st.area;heroSay(d.name+'!');SND.level();
  switch(G.heroId){
  case 'dob':{const R=190*A;G.fx.push({k:'wave',own:1,t:0,dur:.5,r1:R,col:'#ffd84a'});G.shake=6;
    forNear(H.x,H.y,R+20,e=>{const dx=e.x-H.x,dy=e.y-H.y,dd=Math.hypot(dx,dy)||1;if(dd<R+e.r)hitEnemy(e,60*P,dx/dd*520,dy/dd*520);});break;}
  case 'ale':{H.inv=2;G.dashT=3;for(let i=0;i<16;i++){const a=i/16*TAU;G.proj.push({k:'arrow',id:G.pid++,x:H.x,y:H.y-6,vx:Math.cos(a)*560,vy:Math.sin(a)*560,a,life:1,dmg:20*P,pierce:3,hit:new Set(),evo:1});}SND.shoot();break;}
  case 'ily':{const R=230*A;G.fx.push({k:'wave',own:1,t:0,dur:.6,r1:R,col:'#c8a070'});G.shake=12;SND.boom();
    forNear(H.x,H.y,R+20,e=>{if((e.x-H.x)**2+(e.y-H.y)**2<(R+e.r)**2){e.stun=e.boss?1.2:2.5;hitEnemy(e,40*P,0,0);}});break;}
  case 'vas':{for(const g of G.gems)g.mag=true;H.hp=Math.min(G.st.maxHp,H.hp+G.st.maxHp*.15*(1+.3*darRank()));G.fx.push({k:'pulse',own:1,t:0,dur:.8,r1:160});SND.heal();break;}
  case 'sad':{G.fx.push({k:'pulse',own:1,t:0,dur:1,r1:VIEW.R,evo:1});for(const e of G.en)if(!e.dead&&onScreen(e,20)){e.slow=5;hitEnemy(e,20*P,0,0);}break;}
  case 'mik':{const a=aimAngle(),LEN=380*A,W=46*A,ux=Math.cos(a),uy=Math.sin(a);G.fx.push({k:'plow',x:H.x,y:H.y,a,L:LEN,W,t:0,dur:.7});G.shake=8;SND.boom();
    for(const e of G.en){if(e.dead)continue;const px=e.x-H.x,py=e.y-H.y,al=px*ux+py*uy,pe=Math.abs(px*uy-py*ux);if(al>-10&&al<LEN&&pe<W+e.r)hitEnemy(e,90*P,ux*300,uy*300);}
    for(let i=0;i<24;i++){const q=rand(0,LEN);G.pt.push({x:H.x+ux*q,y:H.y+uy*q,vx:rand(-60,60),vy:rand(-80,-10),t:0,dur:rand(.4,.8),col:'#8a5a2e',s:rand(3,6)});}break;}
  case 'vol':{G.wolfT=5;burst(H.x,H.y,'#8a93a3',14,160);break;}
  case 'mar':{G.swordT=6;break;}
  case 'iva':{const r=Math.random();if(r<.34){drop('chest',H.x+rand(-60,60),H.y+rand(-60,60));heroSay(L('Авось сундук!','Lucky chest!'));}
    else if(r<.67){for(let i=0;i<20;i++)drop('coin',H.x+rand(-120,120),H.y+rand(-120,120),Math.max(1,Math.round(3*G.ch.gold)));heroSay(L('Золотишко!','Gold, gold, gold!'));}
    else{H.hp=G.st.maxHp;heroSay(L('Как новенький!','Good as new!'));SND.heal();}break;}
  }}
// куда бить: в ближайшего врага рядом, иначе — куда смотрит богатырь
function aimAngle(){const H=G.hero,e=nearest(H.x,H.y,170);return e?Math.atan2(e.y-H.y,e.x-H.x):Math.atan2(H.fy,H.fx);}
function later(t,fn){G.later.push({t,fn});}
// удалить лишнее из массива на месте (без нового массива каждый кадр — меньше пауз сборщика мусора)
function compact(a,keep){let j=0;for(let i=0;i<a.length;i++){const x=a[i];if(keep(x))a[j++]=x;}a.length=j;return a;}
function explode(x,y,r,dmg){G.fx.push({k:'boom',x,y,r,t:0,dur:.35});SND.boom();forNear(x,y,r+20,e=>{if((e.x-x)**2+(e.y-y)**2<(r+e.r)**2)hitEnemy(e,dmg,(e.x-x)*2,(e.y-y)*2);});}
function updProj(dt){const H=G.hero;
  for(const p of G.proj){p.life-=dt;if(p.life<=0){p.dead=true;continue;}
    switch(p.k){
    case 'arrow':p.x+=p.vx*dt;p.y+=p.vy*dt;forNear(p.x,p.y,24,e=>{if(p.dead||p.hit.has(e))return;if((e.x-p.x)**2+(e.y-p.y)**2<(e.r+5)**2){p.hit.add(e);hitEnemy(e,p.dmg,p.vx*.25,p.vy*.25);if(--p.pierce<=0)p.dead=true;}});break;
    case 'fire':{if(!p.tg||p.tg.dead)p.tg=nearest(p.x,p.y,400);let ax=0,ay=0;if(p.tg){const dx=p.tg.x-p.x,dy=p.tg.y-p.y,d=Math.hypot(dx,dy)||1;ax=dx/d*1400;ay=dy/d*1400;}
      p.vx+=ax*dt;p.vy+=ay*dt;const v=Math.hypot(p.vx,p.vy),M=330;if(v>M){p.vx*=M/v;p.vy*=M/v;}p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(Math.random()<(qLow()?.25:.7))G.pt.push({x:p.x,y:p.y,vx:rand(-20,20),vy:rand(-20,20),t:0,dur:.3,col:'#ff9a2a',s:rand(2,3.5),add:1});
      forNear(p.x,p.y,30,e=>{if(p.dead)return;if((e.x-p.x)**2+(e.y-p.y)**2<(e.r+6)**2){p.dead=true;explode(p.x,p.y,p.r,p.dmg);}});break;}
    case 'kolo':{p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=Math.hypot(p.vx,p.vy)*dt/12*(p.vx<0?-1:1);
      if(p.x<VIEW.cx-VIEW.ww+14&&p.vx<0||p.x>VIEW.cx+VIEW.ww-14&&p.vx>0)p.vx*=-1;if(p.y<VIEW.cy-VIEW.wh+60&&p.vy<0||p.y>VIEW.cy+VIEW.wh-14&&p.vy>0)p.vy*=-1;
      forNear(p.x,p.y,40,e=>{if((e.x-p.x)**2+(e.y-p.y)**2>(e.r+12*p.sc)**2)return;if((p.hk.get(e)||0)>G.t)return;p.hk.set(e,G.t+.45);hitEnemy(e,p.dmg,p.vx*.4,p.vy*.4);});break;}
    case 'axe':{if(!p.ret){p.x+=p.dx*p.v*dt;p.y+=p.dy*p.v*dt;p.v-=640*dt;if(p.v<=0){p.ret=true;p.v=0;}}
      else{p.v=Math.min(560,p.v+900*dt);const dx=H.x-p.x,dy=H.y-p.y,d=Math.hypot(dx,dy)||1;p.x+=dx/d*p.v*dt;p.y+=dy/d*p.v*dt;if(d<18)p.dead=true;}
      p.rot+=dt*16;forNear(p.x,p.y,36,e=>{if((e.x-p.x)**2+(e.y-p.y)**2>(e.r+13*p.sc)**2)return;if((p.hk.get(e)||0)>G.t)return;p.hk.set(e,G.t+.5);hitEnemy(e,p.dmg,p.dx*90,p.dy*90);});break;}
    case 'flask':{p.t+=dt;const q=Math.min(1,p.t/p.dur);p.x=lerp(p.x0,p.tx,q);p.y=lerp(p.y0,p.ty,q)-Math.sin(q*Math.PI)*60;p.rot+=dt*12;
      if(q>=1){p.dead=true;G.puddles.push({x:p.tx,y:p.ty,r:p.r,t:0,dur:p.evo?4:3,tick:0,dmg:p.dmg,evo:p.evo});burst(p.tx,p.ty,'#8a3adf',8,90);}break;}
    }}
  compact(G.proj,p=>!p.dead);
  for(const q of G.puddles){q.t+=dt;q.tick-=dt;if(q.tick<=0){q.tick=.5;forNear(q.x,q.y,q.r+20,e=>{if((e.x-q.x)**2+(e.y-q.y)**2<(q.r+e.r)**2){e.slow=.5;hitEnemy(e,q.dmg,0,0);}});}}
  for(const q of G.puddles)if(q.evo&&(H.x-q.x)**2+(H.y-q.y)**2<q.r*q.r)H.hp=Math.min(G.st.maxHp,H.hp+2.5*dt);
  compact(G.puddles,q=>q.t<q.dur);
  for(const p of G.eproj){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)p.dead=true;
    else if((p.x-H.x)**2+(p.y-H.y)**2<(p.r+10)**2){p.dead=true;hurtHero(p.dmg,p.src);if(p.ice)H.slowT=1.5;}}
  compact(G.eproj,p=>!p.dead);}
function eShoot(e,a,sp,col,r,dmg,ice){if(!S.tipR&&G&&!G.tipR&&!e.boss){G.tipR=1;S.tipR=1;save();tipShow(L(EN[e.type].n+' стреляет издалека! Уходи от снарядов в сторону.',EN[e.type].n+' shoots from afar! Step aside from the shots.'),true);later(7,()=>{if(G&&!(G.tut&&(G.tut.q||TUT[G.tut.i])))tipHide();});}G.eproj.push({src:e.type,x:e.x,y:e.y-e.r*.3,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:r||6,col,dmg:dmg||e.dmg,life:4,ice});}

/* ---------- боссы ---------- */
function bossAI(e,dt){const H=G.hero,dx=H.x-e.x,dy=H.y-e.y,d=Math.hypot(dx,dy)||1;let sp=e.spd,mx=dx/d,my=dy/d;
  e.at-=dt;e.at2-=dt;e.at3-=dt;if(Math.random()<dt/7)say(e,pick(PH.boss[e.type].lines));
  switch(e.type){
  case 'solo':
    if(e.state==='whistle'){sp=0;e.st-=dt;if(e.st<=0){e.state='';e.at=6;SND.whistle();G.shake=8;G.fx.push({k:'wave',x:e.x,y:e.y,t:0,dur:.8,r1:320,col:'#bfe8ff',dmg:e.dmg*1.3});}}
    else if(e.at<=0){e.state='whistle';e.st=1.1;say(e,L('Фью-ю-ю-ить!','Fwee-ee-eet!'),1.2);}
    if(e.at2<=0){e.at2=12;for(let i=0;i<6;i++){const a=i/6*TAU;mkEnemy('wolf',H.x+Math.cos(a)*VIEW.R*.8,H.y+Math.sin(a)*VIEW.R*.8);}say(e,L('Волки, ко мне!','Wolves, to me!'));}
    break;
  case 'yaga':
    if(e.state==='aim'){sp=0;e.st-=dt;if(e.st<=0){e.state='dash';e.st=.75;}}
    else if(e.state==='dash'){sp=540;mx=e.dx;my=e.dy;e.st-=dt;if(Math.random()<.6)G.pt.push({x:e.x,y:e.y+20,vx:rand(-30,30),vy:rand(-30,30),t:0,dur:.6,col:'#c8b89a',s:rand(4,8)});if(e.st<=0){e.state='';e.at=rand(3.5,5);}}
    else if(e.at<=0){e.state='aim';e.st=.9;e.dx=mx;e.dy=my;e.tx=H.x;e.ty=H.y;}
    if(e.at2<=0){e.at2=9;for(let i=0;i<5;i++){const a=rand(0,TAU);mkEnemy('kot',e.x+Math.cos(a)*50,e.y+Math.sin(a)*50);}say(e,L('Кис-кис, котики, фас!','Kitties, sic \'em!'));}
    break;
  case 'tugar':
    if(e.at3<=0){e.at3=11;for(let i=0;i<6;i++){const a=i/6*TAU;mkEnemy('chert',H.x+Math.cos(a)*VIEW.R*.8,H.y+Math.sin(a)*VIEW.R*.8);}say(e,L('Черти, за мной!','Imps, follow me!'));}
    // дальше — как у Горыныча: огнешары и дыхание
  case 'gory':
    if(e.state==='breath'){sp=12;e.st-=dt;const ta=Math.atan2(dy,dx);let da=ta-e.ba;da=Math.atan2(Math.sin(da),Math.cos(da));e.ba+=clamp(da,-dt*.7,dt*.7);
      if(e.st<1.6){if(Math.random()<.9)for(let i=0;i<2;i++){const a=e.ba+rand(-.32,.32),v=rand(180,300);G.pt.push({x:e.x+Math.cos(e.ba)*40,y:e.y-20+Math.sin(e.ba)*40,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,dur:.7,col:pick(['#ff7a1a','#ffc83a','#ff4a1a']),s:rand(5,9),add:1});}
        let ha=Math.atan2(H.y-e.y,H.x-e.x)-e.ba;ha=Math.atan2(Math.sin(ha),Math.cos(ha));if(d<260&&Math.abs(ha)<.38)hurtHero(e.dmg*.6,e.type);}
      if(e.st<=0){e.state='';e.at2=9;}}
    else if(e.at2<=0){e.state='breath';e.st=2.4;e.ba=Math.atan2(dy,dx);say(e,L('…а три — жарко!','…three are toasty!'),1.5);}
    if(e.at<=0&&e.state!=='breath'){e.at=3;const a=Math.atan2(dy,dx);for(const s of[-.28,0,.28])eShoot(e,a+s,175,'#ff8a2a',10,e.dmg*.8);}
    break;
  case 'kosh':
    if(e.at<=0){e.at=4;for(let i=0;i<12;i++)eShoot(e,i/12*TAU+e.ph,140,'#5cff9a',7,e.dmg*.6);}
    if(e.at2<=0){e.at2=7;G.fx.push({k:'poof',x:e.x,y:e.y,t:0,dur:.5});const a=rand(0,TAU);e.x=H.x+Math.cos(a)*170;e.y=H.y+Math.sin(a)*170;G.fx.push({k:'poof',x:e.x,y:e.y,t:0,dur:.5});}
    break;
  case 'karach': // ледяные осколки кольцом + зоны мороза под героем
    if(e.at<=0){e.at=4;for(let i=0;i<10;i++)eShoot(e,i/10*TAU+G.t,150,'#bfe6ff',8,e.dmg*.5,true);}
    if(e.at2<=0){e.at2=8;for(let i=0;i<3;i++){const x=H.x+(i?rand(-90,90):0),y=H.y+(i?rand(-90,90):0);G.fx.push({k:'zone',x,y,r:58,t:0,dur:1.7,arm:1.05,dmg:e.dmg,col:'#8ad0ff'});}say(e,L('Сосулькой станешь!','You\'ll be an icicle!'),1.4);}
    break;
  case 'morcar': // трезубцы веером, волна, раки
    if(e.at<=0){e.at=3.4;const a=Math.atan2(dy,dx);for(const s2 of[-.2,0,.2])eShoot(e,a+s2,240,'#3ac8a0',8,e.dmg*.7);}
    if(e.at2<=0){e.at2=9;SND.boom();G.shake=6;G.fx.push({k:'wave',x:e.x,y:e.y,t:0,dur:1,r1:380,col:'#3ac8e0',dmg:e.dmg*1.1});
      for(let i=0;i<5;i++){const a=rand(0,TAU);mkEnemy('rak',e.x+Math.cos(a)*60,e.y+Math.sin(a)*60);}say(e,L('Волна идёт!','Here comes a wave!'),1.4);}
    break;
  case 'liho': // луч глаза, который медленно ведёт за героем
    if(e.state==='aim'){sp=0;e.st-=dt;if(e.st<=0){e.state='beam';e.st=2.6;SND.zap();}}
    else if(e.state==='beam'){sp=8;e.st-=dt;const ta=Math.atan2(dy,dx);let da=ta-e.ba;da=Math.atan2(Math.sin(da),Math.cos(da));e.ba+=clamp(da,-dt*.75,dt*.75);
      const ex=e.x,ey=e.y-28,ux=Math.cos(e.ba),uy=Math.sin(e.ba),px=H.x-ex,py=H.y-ey,along=px*ux+py*uy,perp=Math.abs(px*uy-py*ux);
      if(along>0&&along<480&&perp<22)hurtHero(e.dmg*.55,e.type);if(Math.random()<.5)spark(ex+ux*rand(20,480),ey+uy*rand(20,480),'#ff6a8a',1);
      if(e.st<=0){e.state='';e.at2=7;}}
    else if(e.at2<=0){e.state='aim';e.st=1.1;e.ba=Math.atan2(dy,dx);say(e,L('Вижу тебя!','I see you!'),1.2);}
    if(e.at<=0&&e.state!=='beam'){e.at=5;for(let i=0;i<14;i++)eShoot(e,i/14*TAU,130,'#c86bff',7,e.dmg*.55);}
    if(e.at3<=0){e.at3=11;for(let i=0;i<4;i++){const a=rand(0,TAU);mkEnemy(pick(['koldun','chert','shatun']),H.x+Math.cos(a)*VIEW.R*.8,H.y+Math.sin(a)*VIEW.R*.8);}}
    break;}
  e.x+=(mx*sp+e.kx)*dt;e.y+=(my*sp+e.ky)*dt;e.kx*=Math.pow(.01,dt);e.ky*=Math.pow(.01,dt);e.face=dx<0?-1:1;}
function kosheyEgg(e){e.hp=1;e.invul=true;e.phase=1;const H=G.hero,a=rand(0,TAU);const egg=mkEnemy('egg',H.x+Math.cos(a)*300,H.y+Math.sin(a)*300);G.egg=egg;
  say(e,PH.boss.kosh.egg,4);banner(L('Кощей бессмертен!','Koschei is deathless!'),L('Найди яйцо и разбей его','Find the egg and smash it'),5);G.shake=8;}

/* ---------- обновление ---------- */
function update(dt){
  if(G.slowT>0){G.slowT-=dt;dt*=.4;}if(G.bossIn>0)G.bossIn-=dt;
  const H=G.hero,st=G.st;G.t+=dt;
  for(const l of G.later)l.t-=dt;const due=G.later.filter(l=>l.t<=0);compact(G.later,l=>l.t>0);for(const l of due)l.fn();
  // герой
  const v=inputVec(),vl=Math.hypot(v.x,v.y);H.moving=vl>.05;
  if(H.moving){H.fx=v.x/vl;H.fy=v.y/vl;H.step+=dt*vl*9;if(H.fx<-.15)H.flip=-1;else if(H.fx>.15)H.flip=1;}
  const hs=st.spd*(H.slowT>0?.6:1)*(G.wolfT>0||G.dashT>0?1.6:1);H.slowT=(H.slowT||0)-dt;H.x+=(v.x*hs+H.kx)*dt;H.y+=(v.y*hs+H.ky)*dt;H.kx*=Math.pow(.02,dt);H.ky*=Math.pow(.02,dt);
  H.inv-=dt;H.hurtT-=dt;H.sayT-=dt;if(st.regen&&H.hp>0)H.hp=Math.min(st.maxHp,H.hp+st.regen*dt);H.max=st.maxHp;
  G.cam.x+=(H.x-G.cam.x)*Math.min(1,dt*9);G.cam.y+=(H.y-G.cam.y)*Math.min(1,dt*9);
  VIEW.cx=G.cam.x;VIEW.cy=G.cam.y;
  if(!G.win)spawnTick(dt);
  hazTick(dt);
  if(G.sleepT>0)G.sleepT-=dt;
  if(!G.win){G.propT-=dt;if(G.propT<=0){G.propT=rand(36,46);if(!G.prop||G.prop.dead)spawnProp();}}
  if(G.prop&&!G.prop.dead&&G.t-G.prop.t0>35&&!onScreen(G.prop,40)){G.prop.dead=true;G.prop=null;} // не разбил и ушёл — пенёк пропадает
  gridBuild();
  // враги
  for(const e of G.en){if(e.dead)continue;e.flash-=dt;e.slow-=dt;
    if(e.boss){if(e.intro>0)e.intro-=dt;else if(e.stun>0){e.stun-=dt;}else bossAI(e,dt);}
    else if(e.type==='egg'){e.y+=Math.sin(G.t*3)*dt*6;}
    else if(e.prop){continue;}
    else if(e.stun>0){e.stun-=dt;e.x+=e.kx*dt;e.y+=e.ky*dt;e.kx*=Math.pow(.004,dt);e.ky*=Math.pow(.004,dt);continue;}
    else{const dx=H.x-e.x,dy=H.y-e.y,d=Math.hypot(dx,dy)||1;let sp=e.spd*(e.slow>0?.55:1),mx=dx/d,my=dy/d;
      if(e.ranged){if(d<160){mx=-mx*.6;my=-my*.6;}else if(d<240){const t=mx;mx=-my*.5;my=t*.5;}
        e.shootT-=dt;if(e.shootT<=0&&d<340){const sf=G.soft;e.shootT=rand(2.4,3.4)*(sf?sf.cd:1);eShoot(e,Math.atan2(dy,dx),150*(sf?sf.shotSpd:1),EN[e.type].col,6,sf?e.dmg*sf.shot:0);}}
      if(e.fly)my+=Math.sin(G.t*4+e.ph)*.35;
      e.x+=(mx*sp+e.kx)*dt;e.y+=(my*sp+e.ky)*dt;e.kx*=Math.pow(.004,dt);e.ky*=Math.pow(.004,dt);e.face=dx<0?-1:1;
      if(d>VIEW.R*1.7&&!e.elite){const p=spawnPos();e.x=p[0];e.y=p[1];}}
    const dx=e.x-H.x,dy=e.y-H.y,dd=Math.hypot(dx,dy)||1,rr=e.r+11;
    if(dd<rr&&e.dmg>0){hurtHero(e.dmg,e.type);if(!e.boss){e.x=H.x+dx/dd*rr;e.y=H.y+dy/dd*rr;}}}
  // расталкивание
  for(const e of G.en){if(e.dead||e.fly||e.boss||e.prop)continue;forNear(e.x,e.y,e.r+20,o=>{if(o===e||o.fly)return;const dx=e.x-o.x,dy=e.y-o.y,m=e.r+o.r;const d2=dx*dx+dy*dy;
    if(d2<m*m&&d2>.01){const d=Math.sqrt(d2),p=(m-d)*.35;e.x+=dx/d*p;e.y+=dy/d*p;}});}
  // случайные реплики нечисти
  G.quipT-=dt;if(G.quipT<=0&&!(G.first&&G.t<160)){G.quipT=rand(11,17);const vis=G.en.filter(e=>!e.dead&&!e.boss&&onScreen(e,-30)&&PH.en[e.type]);if(vis.length){const e=pick(vis);say(e,pick(PH.en[e.type]));}}
  updWeapons(dt);updDar(dt);updProj(dt);
  compact(G.en,e=>!e.dead);
  // добыча
  const M=st.magnet;
  for(const g of G.gems){const dx=H.x-g.x,dy=H.y-g.y,d=Math.hypot(dx,dy)||1;if(!g.mag&&d<M)g.mag=true;
    if(g.mag){g.sp=Math.min(900,g.sp+900*dt);g.x+=dx/d*g.sp*dt;g.y+=dy/d*g.sp*dt;if(d<16){g.dead=true;addXp(g.v);SND.gem();}}}
  compact(G.gems,g=>!g.dead);
  // брошенные далеко самоцветы собираются в один большой впереди героя (опыт не пропадает)
  G.poolT=(G.poolT||0)-dt;if(G.poolT<=0){G.poolT=4;const far=VIEW.R*1.25;let v=0;for(const g of G.gems)if(!g.mag&&(g.x-H.x)**2+(g.y-H.y)**2>far*far){v+=g.v;g.dead=true;}
    for(const p of G.picks)if(p.k==='coin'&&!p.mag&&(p.x-H.x)**2+(p.y-H.y)**2>far*far){p.dead=true;G.gold+=p.v*ECO.coin;}compact(G.picks,p=>!p.dead);
    if(v>0){compact(G.gems,g=>!g.dead);const a=H.moving?Math.atan2(H.fy,H.fx)+rand(-.6,.6):rand(0,TAU),d=Math.min(VIEW.ww,VIEW.wh)*.7;G.gems.push({x:H.x+Math.cos(a)*d,y:H.y+Math.sin(a)*d,v,mag:false,sp:0});}}
  for(const p of G.picks){p.t+=dt;const dx=H.x-p.x,dy=H.y-p.y,d=Math.hypot(dx,dy)||1;const pr=p.k==='chest'?34:p.k==='coin'?M:40;if(!p.mag&&(d<pr||p.find&&p.t>.6))p.mag=true; // находка через 0,6 с сама летит к богатырю
    if(p.mag){p.sp=Math.min(800,p.sp+800*dt);p.x+=dx/d*p.sp*dt;p.y+=dy/d*p.sp*dt;if(d<18){p.dead=true;pickup(p);}}}
  compact(G.picks,p=>!p.dead);
  // Жар-птица
  if(G.gift){const b=G.gift;b.t+=dt;b.x+=b.vx*dt;b.y+=Math.sin(b.t*2)*14*dt;if(Math.random()<.5)G.pt.push({x:b.x,y:b.y,vx:rand(-10,10),vy:rand(0,30),t:0,dur:.6,col:pick(['#ffcf3a','#ff7a1a']),s:rand(2,4),add:1});
    if((b.x-H.x)**2+(b.y-H.y)**2<34*34){G.gift=null;G.paused=true;IN.on=false;SND.chest();openGift();}
    else if(b.t>30)G.gift=null;}
  // эффекты
  for(const f of G.fx){f.t+=dt;if(f.k==='zone'&&!f.done&&f.t>=f.arm){f.done=true;SND.zap();spark(f.x,f.y,'#dff4ff',14);if((H.x-f.x)**2+(H.y-f.y)**2<f.r*f.r){hurtHero(f.dmg,G.boss&&G.boss.type);H.slowT=2;}}
    if(f.k==='wave'&&f.dmg&&!f.hit){const r=f.t/f.dur*f.r1,d=Math.hypot(H.x-f.x,H.y-f.y);if(Math.abs(d-r)<20){f.hit=true;hurtHero(f.dmg,G.boss&&G.boss.type);const k=(H.x-f.x)/(d||1),m=(H.y-f.y)/(d||1);H.kx+=k*500;H.ky+=m*500;}}}
  compact(G.fx,f=>f.t<f.dur);
  for(const p of G.pt){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.1,dt);p.vy*=Math.pow(.1,dt);}compact(G.pt,p=>p.t<p.dur);
  for(const n of G.nums)n.t+=dt;compact(G.nums,n=>n.t<.8);
  for(const b of G.bub)b.t+=dt;compact(G.bub,b=>b.t<b.dur&&(!b.e.dead||b.e===H));
  if(G.banner){G.banner.t+=dt;if(G.banner.t>bannerDur())G.banner=null;}if(!G.banner&&G.bq&&G.bq.length)G.banner=G.bq.shift();
  if(G.combo){G.combo.t+=dt;if(G.combo.t>1.6)G.combo=null;}
  G.shake=Math.max(0,G.shake-dt*30);
  if(G.wk.noHeal){if(H.hp>G.hpLock)H.hp=G.hpLock;else G.hpLock=H.hp;} // «Голодная неделя»: здоровье только убывает
  tutTick(dt);
  if(G.win){G.winT-=dt;if(G.winT<=0&&!G.over)endRun(true);}
  else if(G.lvlQ>0&&!G.paused&&H.hp>0){G.paused=true;IN.on=false;tutEvent('lvl');openLevelUp();}
}
function pickup(p){const H=G.hero;
  if(p.k==='coin'){G.gold+=p.v*ECO.coin;SND.coin();}
  if(p.k==='pie'){H.hp=Math.min(G.st.maxHp,H.hp+30);SND.heal();heroSay(pick(PH.pie));addNum(H.x,H.y-30,30,'#6aff8a');}
  if(p.k==='yarn'){for(const g of G.gems)g.mag=true;SND.heal();}
  if(p.find){const f=FINDS.find(q=>q.k===p.k);if(f)banner(f.n,f.s,1);G.q.finds=(G.q.finds||0)+1;
    if(p.k==='f_rtr')razryv();
    if(p.k==='f_str')sleepAll();
    if(p.k==='loaf'){const h=G.st.maxHp*.5;H.hp=Math.min(G.st.maxHp,H.hp+h);G.hpLock=Math.max(G.hpLock||0,H.hp);SND.heal();addNum(H.x,H.y-30,h,'#6aff8a');heroSay(L('Каравай — всему голова!','A loaf a day keeps monsters away!'));}
    if(p.k==='pot'){const v=Math.max(1,Math.round(3*G.ch.gold));for(let i=0;i<12;i++){drop('coin',p.x+rand(-50,50),p.y+rand(-50,50),v);G.picks[G.picks.length-1].mag=true;}SND.chest();vib(30);}}
  if(p.k==='chest'){tutEvent('chest');G.q.chests++;G.paused=true;IN.on=false;SND.chest();heroSay(pick(PH.chest));openChest(p.v>=2);}}
function endRun(win){if(G.over)return;G.over=true;G.bossLeft=G.boss&&!G.boss.dead?clamp(G.boss.hp/G.boss.max,0,1):null;G.paused=true;IN.on=false;YG.stop();musicPlay(null);tipHide();
  G.bestNew=[];for(const t in G.meet){if(!S.meet[t]&&EN[t]){S.meet[t]=1;G.bestNew.push(t);}}for(const t in G.kt)S.bk[t]=(S.bk[t]||0)+G.kt[t];
  // награда: монеты из похода + за нечисть (1 за 40) + за время (3×глава за минуту) + за босса; множители — глава (ECO.chk), жадность, проклятие, испытание
  const mul=(G.curse?curseMul(G.curse).gold:1)*(G.wk.gold||1)*(ECO.chk[G.chi]||.65),parts=[['coins',G.gold*G.goldMul*G.st.gold],['kills',G.kills*ECO.kill*G.st.gold],['time',G.t/60*ECO.time*(G.chi+1)*G.st.gold],['boss',win?100*G.ch.gold:0],['loot',(G.loot||0)*G.goldMul*G.st.gold]];
  if(G.endless)parts[3][1]=150*(G.bossesKilled||0)*G.ch.gold;
  G.rw={};G.reward=0;for(const [k,v] of parts){G.rw[k]=Math.round(v*mul);G.reward+=G.rw[k];}
  if(G.daily){const sc=G.kills+(win?500:0),m=drMine();S.dr={day:m.day,best:Math.max(m.best,sc),got:m.got,runs:m.runs+1};G.drScore=sc;G.newRec=sc>m.best;
    if(!m.got&&G.t>=60){S.dr.got=1;G.drGold=drReward();S.gold+=G.drGold;}LB.set('daily',dayIdx()*DAY_SCORE+S.dr.best);}
  else if(G.weekly){const sec=Math.floor(G.t),w=weekNo();if(!S.wk||S.wk.w!==w)S.wk={w,best:0,got:0,runs:0};S.wk.runs++;
    G.newRec=sec>S.wk.best;S.wk.best=Math.max(S.wk.best,sec);if(!S.wk.got&&sec>=60){S.wk.got=1;G.wkReward=weeklyReward();S.gold+=G.wkReward;S.stats.weeks=(S.stats.weeks||0)+1;}
    LB.set('weekly',w*WEEK_SCORE+S.wk.best);}
  else if(G.endless){G.newRec=Math.floor(G.t)>(S.endBest||0);S.endBest=Math.max(S.endBest||0,Math.floor(G.t));}
  else{G.prevBest=S.best[G.chi]||0;if(win){if(S.pity&&S.pity.c===G.chi)S.pity=null;
      // звёзды главы: что взято в этом походе и что из этого новое
      const got={w:1,d:!G.falls?1:0,t:G.t<=STAR_T?1:0};G.starGot=got;G.starNew=0;for(const k of STAR_K)if(got[k]&&!S.stars[G.chi+k]){S.stars[G.chi+k]=1;G.starNew++;}}else if(G.t>=30)S.pity={c:G.chi,n:Math.min(PITY_MAX,(S.pity&&S.pity.c===G.chi?S.pity.n|0:0)+1)};if(win)S.done[G.chi]=1;S.best[G.chi]=Math.max(S.best[G.chi]||0,Math.floor(G.t));}if(G.t>=30)S.runs++; // поход, брошенный в первые 30 с, не считается (задания, достижения)
  S.kills+=G.kills;G.bossN=G.endless?(G.bossesKilled||0):(win?1:0);S.bosses=(S.bosses||0)+G.bossN;G.questDone=questsFromRun(win);runStats(win);
  if(G.endless&&!G.weekly)LB.set('endless',S.endBest);LB.set('kills',S.kills);
  if(!win&&!G.endless&&!G.daily&&!S.nb&&!S.village.forge&&G.t>=30){S.nb=1;G.nbGold=NOV_GIFT;S.gold+=NOV_GIFT;} // подъёмные от старосты: один раз, новичку после первого поражения
  S.gold+=G.reward; // золото похода — сразу в кошелёк и в сохранение (openResult → save), ×2/×3 за рекламу доплачивает разницу
  // статистика: итог похода (выход с привала — quit); t — игровые секунды, k — нечисть, lv — уровень богатыря, hr — богатырь
  STAT.end(G.quit?'quit':win?'win':'lose',{t:Math.floor(G.t),k:G.kills,lv:G.hero.lvl,hr:G.heroId});
  win?SND.win():SND.lose();openResult(win);}

/* ================= отрисовка ================= */
const ENTS=[];
const TALL_DECO={d_pine:1,d_oak:1,d_dead:1,d_snowpine:1}; // высокие — рисуются по глубине вместе с героем
// плитка земли: плотность ≤1,5 (она всё равно мягкая), в памяти — только текущая глава; оттенок главы «запечён» в плитку
function groundTile(chi){if(groundTiles[chi])return groundTiles[chi];groundTiles={};const k=Math.min(SPR_K,1.5),T=512,c=mkCanvas(T*k,T*k),g=c.getContext('2d');g.setTransform(k,0,0,k,0,0);
  const gr=CH[chi].ground,R=mulberry(chi*7+3);g.fillStyle=gr.base;g.fillRect(0,0,T,T);
  const wrap=(x,y,r,fn)=>{for(const dx of[-T,0,T])for(const dy of[-T,0,T]){const X=x+dx,Y=y+dy;if(X+r<0||X-r>T||Y+r<0||Y-r>T)continue;fn(X,Y);}};
  for(let i=0;i<30;i++){const x=R()*T,y=R()*T,r=40+R()*90,col=R()<.5?gr.hi:gr.lo;wrap(x,y,r,(X,Y)=>{const q=g.createRadialGradient(X,Y,0,X,Y,r);q.addColorStop(0,rgba(col,.7));q.addColorStop(1,rgba(col,0));g.fillStyle=q;g.fillRect(X-r,Y-r,r*2,r*2);});}
  g.lineCap='round';for(let i=0;i<260;i++){const x=R()*T,y=R()*T,s=3+R()*4;wrap(x,y,8,(X,Y)=>{g.strokeStyle=rgba(gr.grass,.55);g.lineWidth=1.2;g.beginPath();
    g.moveTo(X-2,Y);g.quadraticCurveTo(X-3,Y-s*.6,X-4,Y-s);g.moveTo(X,Y);g.lineTo(X,Y-s*1.2);g.moveTo(X+2,Y);g.quadraticCurveTo(X+3,Y-s*.6,X+4,Y-s);g.stroke();});}
  for(let i=0;i<46;i++){const x=R()*T,y=R()*T,col=gr.flow[Math.floor(R()*gr.flow.length)];wrap(x,y,6,(X,Y)=>{for(let j=0;j<5;j++){const a=j/5*TAU;g.beginPath();g.arc(X+Math.cos(a)*2,Y+Math.sin(a)*2,1.5,0,TAU);g.fillStyle=col;g.fill();}
    g.beginPath();g.arc(X,Y,1.2,0,TAU);g.fillStyle='#ffd84a';g.fill();});}
  if(CH[chi].tint){g.fillStyle=CH[chi].tint;g.fillRect(0,0,T,T);}if(CH[chi].dark&&CVL.dark>0){g.fillStyle='rgba(236,226,255,'+CVL.dark+')';g.fillRect(0,0,T,T);} // вид: тёмные главы чуть светлее (читаемость)
  return groundTiles[chi]=c;}
function worldT(){const B=VIEW.B;ctx.setTransform(B,0,0,B,cv.width/2-VIEW.cx*B,cv.height/2-VIEW.cy*B);}
function drawSpr(key,x,y,sx,sy,flash,rot,alpha){const s=SPR[key]||spr(key);if(!s)return;const B=VIEW.B,tx=(x-VIEW.cx)*B+cv.width/2,ty=(y-VIEW.cy)*B+cv.height/2;
  if(rot){const c=Math.cos(rot),n=Math.sin(rot);ctx.setTransform(B*sx*c,B*sx*n,-B*sy*n,B*sy*c,tx,ty);}else ctx.setTransform(B*sx,0,0,B*sy,tx,ty);
  if(alpha!=null)ctx.globalAlpha=alpha;ctx.drawImage(flash?sprF(s):s.c,-s.s/2,-s.s/2,s.s,s.s);if(alpha!=null)ctx.globalAlpha=1;}
function render(){if(!G)return;const c=ctx,H=G.hero,B=VIEW.B,calm=CALM(),shk=calm?0:G.shake;
  const sx=shk?rand(-shk,shk):0,sy=shk?rand(-shk,shk):0;VIEW.cx=G.cam.x+sx*.5;VIEW.cy=G.cam.y+sy*.5;
  c.setTransform(1,0,0,1,0,0); // сплошной заливки нет: плитки земли и так закрывают весь экран
  // земля
  const tile=groundTile(G.chi),T=512,x0=Math.floor((VIEW.cx-VIEW.ww)/T),x1=Math.floor((VIEW.cx+VIEW.ww)/T),y0=Math.floor((VIEW.cy-VIEW.wh)/T),y1=Math.floor((VIEW.cy+VIEW.wh)/T);
  worldT();for(let i=x0;i<=x1;i++)for(let j=y0;j<=y1;j++)c.drawImage(tile,i*T,j*T,T+.5,T+.5);
  // декор
  const CS=230,dx0=Math.floor((VIEW.cx-VIEW.ww-60)/CS),dx1=Math.floor((VIEW.cx+VIEW.ww+60)/CS),dy0=Math.floor((VIEW.cy-VIEW.wh-60)/CS),dy1=Math.floor((VIEW.cy+VIEW.wh+60)/CS);
  const dec=G.ch.decor,talls=[];for(let i=dx0;i<=dx1;i++)for(let j=dy0;j<=dy1;j++){if(Math.abs(i)+Math.abs(j)<1)continue;for(let q=0;q<2;q++){if(hash(i,j,q*17+G.chi)>(q?.3:.72))continue;
    const key=dec[Math.floor(hash(i,j,q*5+99)*dec.length)],x=(i+.15+hash(i,j,q+3)*.7)*CS,y=(j+.15+hash(i,j,q+7)*.7)*CS,fl=hash(i,j,q+11)<.5?1:-1;
    if(TALL_DECO[key])talls.push({deco:key,x,y:y+ART[key].size*.3-22,y0:y,fl});else drawSpr(key,x,y,fl,1);}}
  worldT();
  // лужи мёртвой воды
  for(const q of G.puddles){const a=Math.min(1,(q.dur-q.t)*2,q.t*6);const gr=c.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r);gr.addColorStop(0,'rgba(170,90,255,'+.55*a+')');gr.addColorStop(.7,'rgba(110,40,200,'+.45*a+')');gr.addColorStop(1,'rgba(90,20,160,0)');
    c.fillStyle=gr;c.beginPath();c.ellipse(q.x,q.y,q.r,q.r*.75,0,0,TAU);c.fill();c.fillStyle='rgba(220,190,255,'+.6*a+')';for(let i=0;i<4;i++){const bx=q.x+Math.cos(i*1.7+q.t*2)*q.r*.5,by=q.y+Math.sin(i*2.3+q.t*1.5)*q.r*.35;c.beginPath();c.arc(bx,by,1.5+((q.t*3+i)%1)*2,0,TAU);c.fill();}}
  // огненный дождь: круг-предупреждение
  for(const q of G.haz){if(q.hit)continue;const k=q.t/q.warn;c.fillStyle='rgba(255,60,30,'+(.12+.18*k)+')';c.beginPath();c.ellipse(q.x,q.y,q.r,q.r*.75,0,0,TAU);c.fill();
    c.strokeStyle='rgba(255,120,60,'+(.5+.4*Math.sin(G.t*20))+')';c.lineWidth=3;c.beginPath();c.ellipse(q.x,q.y,q.r*k,q.r*.75*k,0,0,TAU);c.stroke();}
  // камень на распутье: сам камень и три круга-дороги
  if(G.stone){const s=G.stone;for(let i=0;i<3;i++){const p=s.p[i],pul=1+Math.sin(G.t*4+i)*.06;c.fillStyle=['rgba(255,200,90,.22)','rgba(255,90,90,.22)','rgba(120,230,120,.22)'][i];
      c.strokeStyle=['#ffc85a','#ff6a6a','#7ae67a'][i];c.lineWidth=3;c.beginPath();c.ellipse(p.x,p.y,34*pul,26*pul,0,0,TAU);c.fill();c.stroke();}
    c.fillStyle='#8f8a80';c.strokeStyle='#4a463f';c.lineWidth=3;c.beginPath();c.moveTo(s.x-30,s.y+18);c.lineTo(s.x-26,s.y-30);c.quadraticCurveTo(s.x,s.y-50,s.x+26,s.y-30);c.lineTo(s.x+30,s.y+18);c.closePath();c.fill();c.stroke();
    c.strokeStyle='rgba(40,36,30,.6)';c.lineWidth=2;for(let j=0;j<3;j++){c.beginPath();c.moveTo(s.x-16,s.y-20+j*11);c.lineTo(s.x+16,s.y-20+j*11);c.stroke();}}
  // гусли — аура
  const gs=G.weapons.find(w=>w.id==='gusli');if(gs){const R=wv(gs,'r')*G.st.area;c.strokeStyle='rgba(255,216,74,.22)';c.lineWidth=2;c.setLineDash([6,8]);c.lineDashOffset=-G.t*20;c.beginPath();c.arc(H.x,H.y,R,0,TAU);c.stroke();c.setLineDash([]);}
  // добыча
  for(const g of G.gems){if(!onScreen(g,20))continue;drawSpr(g.v>=10?'gem3':g.v>=3?'gem2':'gem1',g.x,g.y+Math.sin(G.t*4+g.x)*1.5,1,1);}
  for(const p of G.picks){if(!onScreen(p,30))continue;const k=p.k==='yarn'?'yarn':p.k;const bob=Math.sin(G.t*4+p.x)*2;drawSpr(k,p.x,p.y+bob,p.k==='coin'?Math.cos(G.t*5+p.x):1,1);}
  worldT();
  // тени
  c.fillStyle='rgba(20,30,20,.22)';c.beginPath();
  for(const e of G.en){if(!onScreen(e,60))continue;const r=e.r*(e.fly?.7:1);c.moveTo(e.x+r,e.y+e.r*.9+(e.fly?8:0));c.ellipse(e.x,e.y+e.r*.9+(e.fly?8:0),r,r*.38,0,0,TAU);}
  c.moveTo(H.x+14,H.y+22);c.ellipse(H.x,H.y+22,14,5,0,0,TAU);c.fill();
  // сущности, сортировка по y
  const ents=ENTS;ents.length=0;for(const e of G.en)if(onScreen(e,70))ents.push(e);for(const t of talls)ents.push(t);ents.push(H);ents.sort((a,b)=>a.y-b.y);
  for(const e of ents){
    if(e.deco){const sz=ART[e.deco].size,behind=H.y<e.y&&H.y>e.y0-sz*.75&&Math.abs(H.x-e.x)<sz*.4;drawSpr(e.deco,e.x,e.y0,e.fl,1,false,0,behind?.45:null);continue;}
    if(e===H){const fr=H.moving?Math.floor(H.step)%2:0,bob=H.moving?Math.abs(Math.sin(H.step*Math.PI))*2:Math.sin(G.t*3)*.6;
      const ha=H.inv>0&&H.hurtT<=0?.55:null; // неуязвимость — полупрозрачный, без мигания
      if(H.slowT>0){worldT();glowDot(H.x,H.y,26,'#9ad8ff');}
      if(G.ch.bright){worldT();const q=c.createRadialGradient(H.x,H.y+2,4,H.x,H.y+2,34);q.addColorStop(0,'rgba(20,30,70,.38)');q.addColorStop(1,'rgba(20,30,70,0)');c.fillStyle=q;c.beginPath();c.arc(H.x,H.y+2,34,0,TAU);c.fill();}
      if(G.wolfT>0){drawSpr('wolf',H.x,H.y-bob,H.flip*1.45,1.45,H.hurtT>0,0,ha);continue;}
      drawSpr('h_'+G.hkey+'_'+fr,H.x,H.y-bob,H.flip,1+(H.moving?0:Math.sin(G.t*3)*.015),H.hurtT>0,0,ha);continue;}
    const bob=Math.sin(G.t*9+e.ph),fl=e.fly?Math.sin(G.t*5+e.ph)*4:0;
    // тёмные главы (Кощей, Тридевятое): светлая подсветка под нечистью — фиолетовые колдуны не сливаются с фиолетовой землёй (boost)
    if(G.ch.dark&&!e.boss&&!e.prop){worldT();c.globalAlpha=e.shade?.12:.36;glowDot(e.x,e.y+fl-2,e.r*2.3*(e.sc||1),'#d6ccff');c.globalAlpha=1;}
    if(e.elite||e.boss){c.globalCompositeOperation='lighter';worldT();const R=e.r*1.7;c.drawImage(glowSpr(e.boss?'aura_b':'aura_e'),e.x-R,e.y-R,R*2,R*2);c.globalCompositeOperation='source-over';}
    if(e.type==='yaga'&&e.state==='aim'){worldT();c.strokeStyle='rgba(255,60,60,'+(.35+Math.sin(G.t*30)*.2)+')';c.lineWidth=e.r*1.2;c.lineCap='round';c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x+e.dx*420,e.y+e.dy*420);c.stroke();}
    if(e.type==='liho'&&(e.state==='aim'||e.state==='beam')){worldT();const ex=e.x,ey=e.y-28,x2=ex+Math.cos(e.ba)*480,y2=ey+Math.sin(e.ba)*480;c.lineCap='round';
      if(e.state==='aim'){c.strokeStyle='rgba(255,60,90,'+(.35+Math.sin(G.t*30)*.2)+')';c.lineWidth=3;c.beginPath();c.moveTo(ex,ey);c.lineTo(x2,y2);c.stroke();}
      else{c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,60,110,.45)';c.lineWidth=40;c.beginPath();c.moveTo(ex,ey);c.lineTo(x2,y2);c.stroke();c.strokeStyle='rgba(255,200,220,.9)';c.lineWidth=12;c.stroke();c.globalCompositeOperation='source-over';}}
    if((e.type==='gory'||e.type==='tugar')&&e.state==='breath'){worldT();const tel=e.st>1.6;c.fillStyle=tel?'rgba(255,60,40,'+(.18+Math.sin(G.t*25)*.08)+')':'rgba(255,140,40,.12)';c.beginPath();c.moveTo(e.x,e.y-20);c.arc(e.x,e.y-20,260,e.ba-.38,e.ba+.38);c.closePath();c.fill();}
    if(e.type==='solo'&&e.state==='whistle'){worldT();const q=1-e.st/1.1;c.strokeStyle='rgba(190,230,255,'+(.3+q*.5)+')';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.arc(e.x,e.y,e.r+10+((q*3+i)%1)*40,0,TAU);c.stroke();}}
    const sq=e.fly?1:1+bob*.05;
    drawSpr(e.type,e.x,e.y+fl-(e.fly?6:0),e.face*e.sc*(e.fly?1:1/sq*1),e.sc*sq*(e.fly?(1+Math.sin(G.t*14+e.ph)*.12):1),e.flash>0,0,e.invul?.55+Math.sin(G.t*10)*.2:e.shade?clamp(1.4-Math.hypot(e.x-H.x,e.y-H.y)/150,.13,1):null);}
  // булавы
  worldT();for(const w of G.weapons)if(w.id==='mace'&&w.balls){const R=wv(w,'r')*G.st.area;c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1.5;c.beginPath();c.arc(H.x,H.y,R,0,TAU);c.stroke();
    {const k=wa(w)*(w.lvl>=6?1.55:1);for(const b of w.balls)drawSpr('mace',b[0],b[1],k,k,false,G.t*8);}}
  if(G.swordT>0&&G.swords)for(const [x,y,a] of G.swords)drawSpr('i_sword',x,y,1.1,1.1,false,a+Math.PI*.75);
  {let ns=qLow()?20:60;worldT(); // звёздочки оглушения — не больше 60 (сон-трава усыпляет сотни)
  for(const e of G.en)if(e.stun>0&&onScreen(e,0)&&ns-->0){for(let i=0;i<3;i++){const a=G.t*5+i*2.1;ctx.fillStyle=G.sleepT>0&&!e.boss?'#bfd8ff':'#ffe14a';ctx.beginPath();ctx.arc(e.x+Math.cos(a)*e.r*.8,e.y-e.r*1.3+Math.sin(a)*3,2.2,0,TAU);ctx.fill();}}}
  // снаряды
  for(const p of G.proj){if(!onScreen(p,40))continue;
    if(p.k==='arrow')drawSpr('arrow',p.x,p.y,1,1,false,p.a);
    else if(p.k==='kolo')drawSpr('kolo',p.x,p.y,p.sc,p.sc,false,p.rot);
    else if(p.k==='axe')drawSpr('axe',p.x,p.y,p.sc,p.sc,false,p.rot);
    else if(p.k==='flask')drawSpr('flask',p.x,p.y,1,1,false,p.rot);}
  // снаряды нечисти: тёмная обводка и белое ядро всегда — в гл. 8 фиолетовое не сливается с фиолетовой землёй
  if(G.eproj.length){c.lineWidth=2;c.strokeStyle='rgba(15,8,25,.75)';for(const p of G.eproj){c.beginPath();c.arc(p.x,p.y,p.r*1.3,0,6.2832);c.stroke();}}
  worldT();const ADD=G.ch.bright?'source-over':'lighter';c.globalCompositeOperation=ADD;if(G.ch.bright)c.globalAlpha=.8;
  for(const p of G.proj)if(p.k==='fire'){glowDot(p.x,p.y,16,'#ff8a1a');glowDot(p.x,p.y,6,'#fff0a0');}
  {const lo=qLow();for(const p of G.eproj){glowDot(p.x,p.y,p.r*2.2,p.col);glowDot(p.x,p.y,p.r*(lo?.6:.8),'#ffffff');}}
  for(const p of G.pt)if(p.add){const a=1-p.t/p.dur;c.globalAlpha=a*(G.ch.bright?.7:1);glowDot(p.x,p.y,p.s*2,p.col);}c.globalAlpha=G.ch.bright?.8:1;
  // эффекты
  for(const f of G.fx){const q=f.t/f.dur,fx=f.own?H.x:f.x,fy=f.own?H.y:f.y;
    if(f.k==='slash'){const sp2=f.full?Math.PI:1.25,a0=f.a-sp2,a1=f.a+sp2,cur=lerp(a0,a1,Math.min(1,q*1.6)),al=1-q;
      const gr=c.createRadialGradient(fx,fy,f.r*.35,fx,fy,f.r);gr.addColorStop(0,'rgba(160,210,255,0)');gr.addColorStop(.75,'rgba(190,230,255,'+.66*al+')');gr.addColorStop(1,'rgba(255,255,255,'+.95*al+')');
      c.fillStyle=gr;c.beginPath();c.arc(fx,fy,f.r,a0,cur);c.arc(fx,fy,f.r*.45,cur,a0,true);c.closePath();c.fill();
      c.strokeStyle='rgba(255,255,255,'+.9*al+')';c.lineWidth=2.5;c.beginPath();c.arc(fx,fy,f.r,a0,cur);c.stroke();} // вид: край удара — плотная светлая дуга
    else if(f.k==='boom'){const r=f.r*(.4+q*.8),ga=c.globalAlpha;c.globalAlpha=ga*(1-q)*(calm?.5:1);c.drawImage(glowSpr('boom'),fx-r,fy-r,r*2,r*2);c.globalAlpha=ga;}
    else if(f.k==='bolt'){const al=(1-q)*(calm?.5:1);c.lineJoin='round';c.strokeStyle='rgba(120,200,255,'+.5*al+')';c.lineWidth=9;c.beginPath();c.moveTo(f.pts[0],f.pts[1]);for(let i=2;i<f.pts.length;i+=2)c.lineTo(f.pts[i],f.pts[i+1]);c.stroke();
      c.strokeStyle='rgba(255,255,255,'+al+')';c.lineWidth=2.5;c.stroke();glowDot(fx,fy,40*(1-q*.5),'#8ad8ff');}
    else if(f.k==='pulse'){c.strokeStyle='rgba(255,216,74,'+.6*(1-q)+')';c.lineWidth=4*(1-q)+1;c.beginPath();c.arc(fx,fy,f.r1*q,0,TAU);c.stroke();}
    else if(f.k==='wave'){if(q<=0)continue;c.strokeStyle=rgba(f.col,.8*(1-q));c.lineWidth=14*(1-q)+2;c.beginPath();c.arc(fx,fy,f.r1*q,0,TAU);c.stroke();}
    else if(f.k==='plow'){c.save();c.translate(fx,fy);c.rotate(f.a);const al=1-q;const gr=c.createLinearGradient(0,0,f.L,0);gr.addColorStop(0,'rgba(255,220,120,'+.7*al+')');gr.addColorStop(1,'rgba(160,100,40,0)');c.fillStyle=gr;c.fillRect(0,-f.W*(1-q*.5),f.L*Math.min(1,q*3),f.W*2*(1-q*.5));c.restore();}
    else if(f.k==='zone'){if(!f.done){const p2=f.t/f.arm;c.fillStyle=rgba(f.col,.12+p2*.18);c.beginPath();c.arc(fx,fy,f.r,0,TAU);c.fill();c.strokeStyle=rgba(f.col,.8);c.lineWidth=2;c.beginPath();c.arc(fx,fy,f.r*p2,0,TAU);c.stroke();}
      else{const p3=(f.t-f.arm)/(f.dur-f.arm);glowDot(fx,fy,f.r*1.2*(1-p3*.5),'#dff4ff');}}
    else if(f.k==='poof'){for(let i=0;i<7;i++){const a=i/7*TAU;glowDot(fx+Math.cos(a)*30*q,fy+Math.sin(a)*30*q,18*(1-q),'#8a6aff');}}}
  c.globalCompositeOperation='source-over';c.globalAlpha=1;
  for(const p of G.pt)if(!p.add){c.globalAlpha=1-p.t/p.dur;c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.s*(1-p.t/p.dur*.5),0,TAU);c.fill();}c.globalAlpha=1;
  // Жар-птица
  if(G.gift){const b=G.gift;drawSpr('bird',b.x,b.y,b.vx<0?-1:1,1+Math.sin(G.t*12)*.12);worldT();}
  // полоса здоровья героя
  worldT();const hw=34,hy=H.y+30;c.fillStyle='rgba(0,0,0,.45)';rr(c,H.x-hw/2-1,hy-1,hw+2,6,3);c.fill();
  c.fillStyle=H.hp/G.st.maxHp<.3?'#ff4a4a':'#4ade6a';rr(c,H.x-hw/2,hy,hw*clamp(H.hp/G.st.maxHp,0,1),4,2);c.fill();
  // здоровье элиты/яйца
  for(const e of G.en)if((e.elite||e.type==='egg')&&onScreen(e,20)){const w=e.r*2;c.fillStyle='rgba(0,0,0,.45)';rr(c,e.x-w/2,e.y-e.r*1.9,w,5,2.5);c.fill();c.fillStyle='#ffc83a';rr(c,e.x-w/2,e.y-e.r*1.9,w*clamp(e.hp/e.max,0,1),5,2.5);c.fill();}
  // цифры урона
  // цифры урона: шрифт задаём один раз, «выпрыгивание» — масштабом, обводка — тёмной тенью со сдвигом
  c.textAlign='center';c.textBaseline='middle';c.font='900 13px '+CVL.font;c.lineWidth=2.8;c.lineJoin='round';c.strokeStyle=CVL.num;
  // крит — в 1,5 раза крупнее и с «!» (в спокойном режиме — без «выпрыгивания»)
  for(const n of G.nums){const q=n.t/.8,s=(calm?1:q<.15?.6+q/.15*.5:1.1-q*.2)*(n.cr?1.5:1),k=B*s,tx=n.cr&&typeof n.v==='number'?n.v+'!':n.v;c.globalAlpha=q>.6?(1-q)/.4:1;
    c.setTransform(k,0,0,k,(n.x-VIEW.cx)*B+cv.width/2,(n.y-q*22-VIEW.cy)*B+cv.height/2);c.strokeText(tx,0,0);c.fillStyle=n.col||'#fff';c.fillText(tx,0,0);}c.globalAlpha=1;worldT();
  // реплики
  for(const b of G.bub)drawBubble(b);
  // оттенок главы, виньетка
  // виньетка (готовая картинка, растянутая на экран); удар — красные края, а не заливка всего экрана; в спокойном режиме — без вспышек
  c.setTransform(1,0,0,1,0,0);const V=vignette();c.drawImage(V.dark,0,0,cv.width,cv.height);
  const low=H.hp>0&&H.hp<G.st.maxHp*.3,hurt=!calm&&H.hurtT>0?Math.min(.6,H.hurtT*2.5):0,ra=Math.max(hurt,low?(calm?.32:.32+Math.sin(G.t*6)*.12):0);
  if(ra>0){c.globalAlpha=ra;c.drawImage(V.red,0,0,cv.width,cv.height);c.globalAlpha=1;}
  if(G.bossIn>0){c.globalAlpha=clamp(Math.min(G.bossIn/.4,(1.4-G.bossIn)/.2),0,1);c.drawImage(V.dark,0,0,cv.width,cv.height);c.drawImage(V.dark,0,0,cv.width,cv.height);c.globalAlpha=1;}
  drawHUD();}
// свечение: градиент рисуется один раз на цвет (64×64), дальше — только drawImage (раньше — новый градиент на каждую частицу)
const GLOW={};
function glowSpr(col){let c=GLOW[col];if(c)return c;c=mkCanvas(64,64);const g=c.getContext('2d');let gr;
  if(col==='boom'){gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,240,180,1)');gr.addColorStop(.4,'rgba(255,140,40,.8)');gr.addColorStop(1,'rgba(255,60,20,0)');}
  else if(col==='aura_b'||col==='aura_e'){gr=g.createRadialGradient(32,32,32*.4/1.7,32,32,32);gr.addColorStop(0,col==='aura_b'?'rgba(255,90,60,.25)':'rgba(255,210,60,.35)');gr.addColorStop(1,'rgba(255,200,60,0)');}
  else{gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,rgba(col,.9));gr.addColorStop(1,rgba(col,0));}
  g.fillStyle=gr;g.fillRect(0,0,64,64);return GLOW[col]=c;}
function glowDot(x,y,r,col){ctx.drawImage(glowSpr(col),x-r,y-r,r*2,r*2);}
// виньетка и красные края — небольшие готовые картинки, пересоздаются только при смене размера экрана
function vignette(){const w=cv.width,h=cv.height;if(vigCache&&vigCache.w===w&&vigCache.h===h&&vigCache.v===CVL.v)return vigCache;
  const k=256/Math.max(w,h),W=Math.max(8,Math.round(w*k)),Hh=Math.max(8,Math.round(h*k)),mk=(a0,col)=>{const c=mkCanvas(W,Hh),g=c.getContext('2d'),r=g.createRadialGradient(W/2,Hh/2,Math.min(W,Hh)*a0,W/2,Hh/2,Math.hypot(W,Hh)*.55);
    r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(1,col);g.fillStyle=r;g.fillRect(0,0,W,Hh);return c;};
  return vigCache={w,h,v:CVL.v,dark:mk(.35,'rgba(10,10,30,'+CVL.vig+')'),red:mk(.3,'rgba(220,20,20,1)')};}
function rr(c,x,y,w,h,r){if(w<=0)return c.beginPath();r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
// реплика: 14 px (не меньше 13 экранных), длинная — в две строки (раньше сжималась по ширине); строки считаются один раз
function wrapText(c,t,maxW){const w=t.split(' '),lines=[];let cur='';for(const x of w){const n=cur?cur+' '+x:x;if(cur&&c.measureText(n).width>maxW){lines.push(cur);cur=x;}else cur=n;}if(cur)lines.push(cur);return lines;}
function drawBubble(b){const c=ctx,e=b.e,x=e.x,y=e.y-(e.r||16)*(e.sc||1)-(e===G.hero?40:18);const q=b.t/b.dur,a=q<.1?q/.1:q>.85?(1-q)/.15:1;
  const fs=Math.round(Math.max(14,13.5/VIEW.zoom));worldT();c.globalAlpha=a;c.font='700 '+fs+'px '+CVL.font;
  if(!b.lines||b.fs!==fs){b.fs=fs;b.lines=wrapText(c,b.s,fs*12);b.w=Math.max.apply(null,b.lines.map(l=>c.measureText(l).width))+18;}
  const lh=fs*1.2,h=b.lines.length*lh+8,w=b.w,pad=6/VIEW.zoom,topY=VIEW.cy-VIEW.wh+((window.__safeTop||0)+(G.boss&&!G.boss.dead?136:92))/VIEW.zoom;
  // boost: облачко не вылезает за края экрана и не лезет на верхнюю панель (хвостик — у говорящего, если он на экране)
  const vis=e===G.hero||onScreen(e,0),bx=vis?clamp(x,VIEW.cx-VIEW.ww+w/2+pad,Math.max(VIEW.cx-VIEW.ww+w/2+pad,VIEW.cx+VIEW.ww-w/2-pad)):x;let by=vis?Math.max(y,topY+h):y;
  // вид: реплика не ложится на баннер — пока баннер на экране и облачко его задевает, оно встаёт ПОД говорящим (без хвостика)
  if(vis&&G.banner&&G.banR){const s1=(by-VIEW.cy)*VIEW.zoom+VIEW.H/2,s0=s1-h*VIEW.zoom;if(s1>G.banR[0]-4&&s0<G.banR[1]+4)by=e.y+(e===G.hero?40:(e.r||16)*(e.sc||1)+10)+h;}
  const tx=clamp(x,bx-w/2+10,bx+w/2-10); // говорящий за краем экрана — облачко не подтягиваем (иначе кажется, что это сказал богатырь)
  c.fillStyle=CVL.bub;rr(c,bx-w/2,by-h,w,h,10);c.fill();if(CVL.bubE){c.lineWidth=1.6/VIEW.zoom;c.strokeStyle=CVL.bubE;c.stroke();}if(by===y&&Math.abs(tx-x)<1){c.beginPath();c.moveTo(tx-5,by-1);c.lineTo(tx+5,by-1);c.lineTo(tx,by+6);c.fill();}
  c.fillStyle=CVL.bubT;c.textAlign='center';c.textBaseline='middle';b.lines.forEach((l,i)=>c.fillText(l,bx,by-h+4+lh*(i+.5)));c.globalAlpha=1;}
function drawHUD(){const c=ctx,d=VIEW.dpr,W=VIEW.W,H=G.hero;c.setTransform(d,0,0,d,0,0);const top=(window.__safeTop||0)+8;
  // полоса опыта
  const bx=12,bw=W-24,bh=16;c.fillStyle=CVL.track;rr(c,bx,top,bw,bh,6);c.fill();c.lineWidth=1.5;c.strokeStyle=CVL.edge;c.stroke();
  const gr=c.createLinearGradient(bx,0,bx+bw,0);gr.addColorStop(0,'#3ad0ff');gr.addColorStop(1,'#7a6aff');c.fillStyle=gr;rr(c,bx+2,top+2,(bw-4)*clamp(H.xp/H.need,0,1),bh-4,4);c.fill();
  c.font='900 13px '+CVL.font;c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.lineJoin='round';c.strokeStyle=CVL.stroke;c.strokeText(L('Ур. ','Lv ')+H.lvl,bx+bw/2,top+bh/2+.5);c.fillStyle='#fff';c.fillText(L('Ур. ','Lv ')+H.lvl,bx+bw/2,top+bh/2+.5);
  // таймер
  c.font='900 22px '+CVL.font;c.lineWidth=4.5;c.strokeStyle=CVL.stroke;const tt=G.boss&&!G.boss.dead?L('БОСС','BOSS'):fmtTime(G.t);
  c.strokeText(tt,W/2,top+36);c.fillStyle=LT()>=RUN_BOSS_T-10&&!G.win&&LT()<RUN_BOSS_T?'#ff6a5a':'#fff';c.fillText(tt,W/2,top+36);
  // до босса: полоска под таймером с мордой босса на конце — ясная цель похода (boost)
  if(!(G.boss&&!G.boss.dead)&&!G.win&&LT()<RUN_BOSS_T){const bw2=Math.min(110,W*.28),x=W/2-bw2/2,y=top+50,q=clamp(LT()/RUN_BOSS_T,0,1),bs=spr(G.ch.boss);
    c.fillStyle=CVL.track;rr(c,x,y,bw2,7,3.5);c.fill();c.fillStyle=q>.9?'#ff6a5a':'#ffc94a';rr(c,x+1,y+1,(bw2-2)*q,5,2.5);c.fill();
    if(bs)c.drawImage(bs.c,x+bw2-4,y-9,24,24);}
  // убийства и золото
  c.font='800 14px '+CVL.font;c.textAlign='left';c.lineWidth=4;const cs=spr('coin'),kt='⚔ '+G.kills,gt=fmtNum(Math.floor(G.gold));
  if(CVL.pill){ // вид: счётчики на светлых плашках (значки прежние)
    c.lineWidth=1.5;c.fillStyle=CVL.pill;rr(c,10,top+23,c.measureText(kt).width+16,20,10);c.fill();c.strokeStyle=CVL.pillE;c.stroke();c.fillStyle=CVL.pill;rr(c,10,top+45,c.measureText(gt).width+36,20,10);c.fill();c.stroke();
    c.fillStyle=CVL.pillT;c.fillText(kt,18,top+33.5);if(cs)c.drawImage(cs.c,14,top+47,16,16);c.fillStyle=CVL.pillG;c.fillText(gt,34,top+55.5);c.lineWidth=4;c.strokeStyle=CVL.stroke;}
  else{c.strokeText(kt,14,top+34);c.fillStyle='#fff';c.fillText(kt,14,top+34);if(cs){c.drawImage(cs.c,14,top+46,16,16);}c.strokeText(gt,34,top+55);c.fillStyle='#ffd84a';c.fillText(gt,34,top+55);}
  // здоровье богатыря
  // (полоса 18 px, число 13 px с тёмной обводкой — читается на любом цвете полосы)
  {const q=clamp(H.hp/G.st.maxHp,0,1),y=top+68,w=Math.min(150,W*.36);c.fillStyle=CVL.track;rr(c,12,y,w,18,9);c.fill();c.lineWidth=1.5;c.strokeStyle=CVL.edge;c.stroke();c.fillStyle=q<.3?'#ff4a4a':q<.6?'#ffc83a':'#3fcf5e';rr(c,14,y+2,(w-4)*q,14,7);c.fill();
    c.font='900 13px '+CVL.font;c.textAlign='center';c.lineWidth=3.5;c.strokeStyle=CVL.stroke;const ht='❤ '+Math.ceil(H.hp)+' / '+Math.round(G.st.maxHp);c.strokeText(ht,12+w/2,y+9.5);c.fillStyle='#fff';c.fillText(ht,12+w/2,y+9.5);c.font='800 14px '+CVL.font;c.textAlign='left';}
  // босс
  if(G.boss&&!G.boss.dead){const e=G.boss,w=Math.min(420,W*.7),x=(W-w)/2,y=top+92;c.fillStyle=CVL.track;rr(c,x,y,w,14,7);c.fill();c.lineWidth=1.5;c.strokeStyle=CVL.edge;c.stroke();
    const g2=c.createLinearGradient(x,0,x+w,0);g2.addColorStop(0,'#ff3a5a');g2.addColorStop(1,'#ff8a3a');c.fillStyle=e.invul?'#8a8aa0':g2;rr(c,x+2,y+2,(w-4)*clamp(e.hp/e.max,0,1),10,5);c.fill();
    c.font='800 14px '+CVL.font;c.textAlign='center';c.lineWidth=4;c.strokeStyle=CVL.stroke;c.fillStyle='#fff';c.strokeText(EN[e.type].n,W/2,y+28);c.fillText(EN[e.type].n,W/2,y+28);}
  // серия: «Раззудись плечо! ×50» под таймером (1,6 с)
  if(G.combo){const b=G.combo;{const a=b.t<.15?b.t/.15:b.t>1.2?(1.6-b.t)/.4:1,sc=CALM()?1:1+Math.max(0,.25-b.t)*1.6,y=top+(G.boss&&!G.boss.dead?142:104);
    c.save();c.globalAlpha=a;c.translate(W/2,y);c.scale(sc,sc);c.textAlign='center';c.textBaseline='middle';c.font='900 17px '+CVL.font;c.lineWidth=5;c.strokeStyle='rgba(60,20,10,.8)';
    const t=L('Раззудись плечо! ×','Mighty swing! ×')+b.n;c.strokeText(t,0,0);c.fillStyle='#ffd84a';c.fillText(t,0,0);c.restore();}}
  // стрелки к важному за краем экрана
  const marks=[];if(G.egg&&!G.egg.dead)marks.push([G.egg,'#ffd84a']);if(G.gift)marks.push([G.gift,'#ff9a2a']);if(G.stone)marks.push([G.stone,'#e8e0d0']);for(const p of G.picks)if(p.k==='chest')marks.push([p,'#ffd84a']);if(G.prop&&!G.prop.dead)marks.push([G.prop,'#9aff6a']);if(G.boss&&!G.boss.dead)marks.push([G.boss,'#ff4a4a']);
  for(const [o,col] of marks){const sx=(o.x-VIEW.cx)*VIEW.zoom+W/2,sy=(o.y-VIEW.cy)*VIEW.zoom+VIEW.H/2;if(sx>0&&sx<W&&sy>0&&sy<VIEW.H)continue;
    const big=o===G.boss,a=Math.atan2(sy-VIEW.H/2,sx-W/2),m=big?40:28,ex=clamp(sx,m,W-m),ey=clamp(sy,m+top+(G.boss&&!G.boss.dead?130:92),VIEW.H-m);c.save();c.translate(ex,ey);c.rotate(a);if(big)c.scale(1.7+Math.sin(G.t*8)*.15,1.7+Math.sin(G.t*8)*.15);c.fillStyle=col;c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=2;
    c.beginPath();c.moveTo(14,0);c.lineTo(-6,-9);c.lineTo(-2,0);c.lineTo(-6,9);c.closePath();c.stroke();c.fill();c.restore();
    if(big){const tx=ex-Math.cos(a)*34,ty=ey-Math.sin(a)*30;c.font='900 12px '+CVL.font;c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='rgba(10,10,30,.8)';c.strokeText(L('БОСС','BOSS'),tx,ty);c.fillStyle='#ff8a7a';c.fillText(L('БОСС','BOSS'),tx,ty);}}
  // туман/тьма (события глав): видно только вокруг богатыря
  if(G.fogT>0){const a=Math.min(1,G.fogT/1.5,(14-G.fogT)/1.5),hx=(H.x-VIEW.cx)*VIEW.zoom+W/2,hy=(H.y-VIEW.cy)*VIEW.zoom+VIEW.H/2,m=Math.min(W,VIEW.H),col=G.fogK==='night'?'12,8,28':'196,222,206';
    const gr=c.createRadialGradient(hx,hy,m*.2,hx,hy,m*.62);gr.addColorStop(0,'rgba('+col+',0)');gr.addColorStop(1,'rgba('+col+','+(.86*a)+')');c.fillStyle=gr;c.fillRect(0,0,W,VIEW.H);}
  // подписи дорог у камня
  if(G.stone){c.textAlign='center';c.textBaseline='middle';for(let i=0;i<3;i++){const p=G.stone.p[i],q=STONE[i],sx=(p.x-VIEW.cx)*VIEW.zoom+W/2,sy=(p.y-VIEW.cy)*VIEW.zoom+VIEW.H/2;
      c.font='20px system-ui,sans-serif';c.fillStyle='#fff';c.fillText(q.ic,sx,sy);c.font='900 12px '+CVL.font;c.lineWidth=4;c.strokeStyle='rgba(10,10,30,.8)';
      const lx=clamp(sx,74,W-74);c.strokeText(q.t,lx,sy+30);c.fillStyle='#fff3c8';c.fillText(q.t,lx,sy+30);c.font='700 11px '+CVL.font;c.strokeText(q.s,lx,sy+44);c.fillStyle='#e8e4f4';c.fillText(q.s,lx,sy+44);}c.textBaseline='alphabetic';}
  // баннер: плашка-лента (boost, единый сказочный стиль): босс — красная, эволюция — золотая, остальное — тёмно-синяя; заголовок — с засечками
  if(G.banner){const b=G.banner,q=b.t,D=bannerDur(),a=q<.25?q/.25:q>D-.4?Math.max(0,(D-q)/.4):1,y=VIEW.H*.3,SF=CVL.font;c.globalAlpha=a;c.textAlign='center';c.textBaseline='middle';
    // по ширине экрана: шрифт меньше, пока надпись не влезет (заголовок не мельче 18 px, подпись — 11 px)
    let f1=28;for(;f1>18;f1-=2){c.font='900 '+f1+'px '+CVL.font;if(c.measureText(b.title).width<=W-60)break;}c.font='900 '+f1+'px '+CVL.font;const w1=c.measureText(b.title).width;
    let f2=15,w2=0;if(b.sub){for(;f2>11;f2--){c.font='700 '+f2+'px '+SF;if(c.measureText(b.sub).width<=W-44)break;}c.font='700 '+f2+'px '+SF;w2=c.measureText(b.sub).width;}
    const pw=Math.min(W-8,Math.max(w1,w2)+56),ph=b.sub?f1+f2+22:f1+16,px=W/2-pw/2,py=y-f1/2-8,n=9,k=b.pri>=5?0:b.pri===4?1:2;G.banR=[py,py+ph];
    const path=o=>{c.beginPath();c.moveTo(px+o,py+o);c.lineTo(px+pw-o,py+o);c.lineTo(px+pw-n-o,py+ph/2);c.lineTo(px+pw-o,py+ph-o);c.lineTo(px+o,py+ph-o);c.lineTo(px+n+o,py+ph/2);c.closePath();};
    const g3=c.createLinearGradient(0,py,0,py+ph);g3.addColorStop(0,['rgba(178,38,30,.94)','rgba(190,128,20,.95)',CVL.ban1][k]);g3.addColorStop(1,['rgba(110,18,15,.94)','rgba(122,74,6,.95)',CVL.ban2][k]);
    path(0);c.fillStyle=g3;c.fill();c.lineWidth=2;c.strokeStyle='#e6b85a';c.stroke();path(4);c.lineWidth=1;c.strokeStyle='rgba(255,233,176,.35)';c.stroke();
    c.fillStyle='#ffe9b0';for(const sx of[px+n+11,px+pw-n-11]){c.beginPath();c.moveTo(sx,py+ph/2-5);c.lineTo(sx+5,py+ph/2);c.lineTo(sx,py+ph/2+5);c.lineTo(sx-5,py+ph/2);c.closePath();c.fill();}
    c.font='900 '+f1+'px '+CVL.font;c.lineWidth=4;c.strokeStyle='rgba(40,10,6,.7)';c.strokeText(b.title,W/2,py+8+f1/2);c.fillStyle='#fff3c8';c.fillText(b.title,W/2,py+8+f1/2);
    if(b.sub){c.font='700 '+f2+'px '+SF;c.lineWidth=3;c.strokeText(b.sub,W/2,py+12+f1+f2/2);c.fillStyle='#fff';c.fillText(b.sub,W/2,py+12+f1+f2/2);}c.globalAlpha=1;}
  // дар богатыря: портрет и кольцо перезарядки
  {const cx=36,cy=VIEW.H-44-(window.__safeBot||0),R=24,q=1-clamp(G.darT/darCd(),0,1),sp=spr('hp_'+G.hkey);
    c.fillStyle=CVL.track;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();if(sp)c.drawImage(sp.c,cx-R*.85,cy-R*.85,R*1.7,R*1.7);
    c.lineWidth=4;c.strokeStyle='rgba(255,255,255,.15)';c.beginPath();c.arc(cx,cy,R,0,TAU);c.stroke();
    c.strokeStyle=q>=1?'#ffd84a':'#8ad0ff';c.beginPath();c.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+TAU*q);c.stroke();
    if(G.wolfT>0||G.swordT>0||G.dashT>0){c.strokeStyle='#ff9a3a';c.lineWidth=2;c.beginPath();c.arc(cx,cy,R+5,0,TAU);c.stroke();}
    c.font='800 13px '+CVL.font;c.textAlign='left';c.lineWidth=3.5;c.strokeStyle=CVL.stroke;const nm=heroDef(G.heroId).dar.name;c.strokeText(nm,cx+R+6,cy+4);c.fillStyle='#fff';c.fillText(nm,cx+R+6,cy+4);}
  // джойстик
  if(IN.on){c.fillStyle='rgba(255,255,255,.10)';c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;c.beginPath();c.arc(IN.ox,IN.oy,48,0,TAU);c.fill();c.stroke();
    c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(IN.px,IN.py,20,0,TAU);c.fill();}
  else if(G.tut&&TUT[G.tut.i]&&TUT[G.tut.i].id==='move'){const cx=W/2,cy=VIEW.H*.56,a=G.t*2.2,px=cx+Math.cos(a)*34,py=cy+Math.sin(a)*22;
    c.fillStyle='rgba(255,255,255,.10)';c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=2;c.beginPath();c.arc(cx,cy,48,0,TAU);c.fill();c.stroke();
    c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(px,py,20,0,TAU);c.fill();c.font='30px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('👆',px+6,py+22);}
  else if(G.t<6&&!G.tut){c.globalAlpha=Math.min(1,(6-G.t));c.font='700 15px '+CVL.font;c.textAlign='center';c.fillStyle='#fff';c.strokeStyle='rgba(10,10,30,.6)';c.lineWidth=4;
    for(const [s,dy] of[[L('Веди пальцем по экрану — богатырь пойдёт.','Drag your finger — the hero walks.'),-80],[L('Бьёт он сам!','He attacks on his own!'),-58]]){c.strokeText(s,W/2,VIEW.H+dy);c.fillText(s,W/2,VIEW.H+dy);}c.globalAlpha=1;}}

// на паузе, под окном выбора и на итогах кадр не перерисовываем (rDirty — один кадр после смены размера)
// замирание кадра (G.hs): не считаем и не рисуем; счётчик кадров для «авто»-качества — только в самом бою, после 3-й секунды
function loop(t){const dt=Math.min(1/30,(t-lastT)/1000||0);lastT=t;const act=G&&!paused&&!G.paused&&!G.over;let fr=false;
  // исключение в кадре не должно останавливать игру навсегда: следующий кадр запрашиваем в любом случае
  try{if(act){if(G.hs>0)G.hs-=dt;else{update(dt);fr=true;}}if(G&&(fr||rDirty)){render();rDirty=false;}if(fr&&G.t>3)qFrame(t);}
  catch(e){if((loop.err=(loop.err||0)+1)<=3)console.error(e);}
  requestAnimationFrame(loop);}
