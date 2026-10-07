'use strict';
/* ================= МЕТА wpn: «Оружие земель» (plan п.16) и «Былинные слияния» (п.17) — модуль META_MODS (ENGINE-API §15) =================
   Журнал — release-h/bogatyr-chapters/logs/M-wpn.md. Включение: META_ON 'wpn' или на своей машине ?meta=all / ?meta=wpn; выкл. — файл молчит.
   • Оружие земли (по одному на тему, 11): открывается победой в «Логове» (глава 3) темы. В поход попадает в выбор карточек:
     в главах СВОЕЙ темы — всегда, в остальных — только если отмечено «Брать в поход» (не больше WPN_SEL штук; чтобы не раздуть выбор).
     В «Походе дня» и «Испытании недели» оружия земель нет (честный рейтинг). Сила — «боковой выбор»: урон в секунду ≈ 60–90 % старых
     оружий того же уровня, эволюция — тот же путь (5-й ур. + оберег need). Оружейная (S.armory) работает и для них — сток золота.
   • Былинное слияние: 2 эволюции + оберег в полную силу (любой оберег на макс. уровне) → «былинное оружие» (1 за поход),
     только на Сложной/Адской и в Сече, не раньше 4:00. Оно — 7-е оружие: раз в ~3 с удар-волна и внеочередной залп обоих слитых.
   • Данными: WEAPONS[id] (data.js) дополняются отсюда; стрельбу и рисование своих снарядов делают WPN_UPD(dt,G) / WPN_DRAW(c,G).
     Крючки в game.js (просьба к главному, журнал): update → WPN_UPD после updWeapons, render → WPN_DRAW после снарядов.
     Пока крючков нет — временная прокладка wpnShim(): оборачивает глобальные updWeapons/render (только при включённом модуле).
   • Сейв: S.wpn = {sel:[id…], seen:{id:1}, bk:{пара:1}, n:{take,evo,byl}}. Облако: seen/bk — объединение, n — максимум, sel — из своего. */
const WPN_ON=typeof metaOn==='function'&&metaOn('wpn');
const WPN_ALL=WPN_ON&&typeof LOCAL!=='undefined'&&LOCAL&&/[?&]wpn=all/.test(location.search); // проверка на маке: всё открыто
const WPN_SEL=2,WPN_BYL_T=240;
function wpnErr(w,x){wpnErr.n=(wpnErr.n||0)+1;if(wpnErr.n<=5)console.warn('meta wpn '+w+': '+(x&&x.message||x));}
function wpnEv(a,k,x){try{const p={a};if(k)p.k=k;if(x)for(const i in x)p[i]=x[i];STAT.ev('wpn',p);}catch(e){}}

/* ---------- данные: 11 оружий земель ----------
   arch — как бьёт (см. WPN_ARCH); массивы — по уровням 1–5 и эволюция (индекс 5), как у WEAPONS. need — оберег эволюции. */
const WPN_DEF={
  w_les:{th:'les',arch:'root',col:'#6aa83a',ru:['Посох Лешего','Корни-шипы вырастают под нечистью и держат её'],en:['Leshy’s Staff','Thorny roots burst up under monsters and hold them'],
    dmg:[11,13,16,18,25,39],cd:[2.2,2.1,1.95,1.8,1.6,1.3],n:[1,2,2,3,3,5],r:[36,38,42,44,50,64],
    up:[['+1 корень','+1 root'],['+урон, шире','+damage, wider'],['+1 корень, чаще','+1 root, faster'],['+урон, шире','+damage, wider']],
    evo:{need:'apple',ru:['Дубрава Лешего','5 корней: держат крепче и оглушают'],en:['Leshy’s Oak Grove','5 roots that hold tighter and stun']}},
  w_bol:{th:'bol',arch:'wisp',col:'#6fe3ff',ru:['Болотные огоньки','Огоньки кружат далеко вокруг и холодят нечисть'],en:['Marsh Wisps','Wisps circle far around you and chill monsters'],
    dmg:[20,22,27,30,38,50],n:[2,2,3,3,4,6],r:[92,98,104,110,120,140],
    up:[['+урон, шире круг','+damage, wider ring'],['+1 огонёк','+1 wisp'],['+урон, шире круг','+damage, wider ring'],['+1 огонёк, +урон','+1 wisp, +damage']],
    evo:{need:'ball',ru:['Хоровод огоньков','6 огоньков, сильно замедляют'],en:['Wisp Round Dance','6 wisps that slow monsters a lot']}},
  w_pole:{th:'pole',arch:'sickle',col:'#ffd36a',ru:['Серп-полумесяц','Летит по кругу вокруг богатыря и возвращается'],en:['Crescent Sickle','Flies in a circle around you and comes back'],
    dmg:[11,12,14,16,18,24],cd:[1.8,1.7,1.6,1.5,1.35,1.1],n:[1,1,2,2,3,4],r:[90,100,105,115,125,150],
    up:[['+урон, шире','+damage, wider'],['+1 серп','+1 sickle'],['+урон, чаще','+damage, faster'],['+1 серп, шире','+1 sickle, wider']],
    evo:{need:'boots',ru:['Серп-жнец','4 серпа широким кругом'],en:['Reaper Sickle','4 sickles in a wide ring']}},
  w_kosh:{th:'kosh',arch:'needle',col:'#cfd8ff',ru:['Кощеева игла','Бьёт самого сильного врага, по вожакам и боссам — больнее'],en:['Koschei’s Needle','Hits the strongest monster, extra damage to elites and bosses'],
    dmg:[34,38,45,52,66,76],cd:[2,1.9,1.8,1.7,1.5,1.2],n:[1,1,1,2,2,3],pierce:[1,2,2,2,3,99],
    up:[['Пробивает двоих','Pierces two'],['+урон, чаще','+damage, faster'],['+1 игла','+1 needle'],['+урон, пробивает троих','+damage, pierces three']],
    evo:{need:'ring',ru:['Игла в яйце','3 иглы насквозь, по вожакам и боссам ещё больнее'],en:['Needle in the Egg','3 needles straight through, even harder on elites and bosses']}},
  w_med:{th:'med',arch:'sling',col:'#4fd18a',ru:['Самоцветная праща','Самоцвет отскакивает от врага к врагу'],en:['Gem Sling','A gem bounces from monster to monster'],
    dmg:[15,17,21,25,30,28],cd:[1.3,1.25,1.15,1.05,.95,.8],n:[1,1,1,2,2,3],b:[2,3,3,4,5,7],
    up:[['+1 отскок','+1 bounce'],['+урон, чаще','+damage, faster'],['+1 самоцвет, +1 отскок','+1 gem, +1 bounce'],['+урон, +1 отскок','+damage, +1 bounce']],
    evo:{need:'quiver',ru:['Малахитовая праща','3 самоцвета, по 7 отскоков'],en:['Malachite Sling','3 gems with 7 bounces each']}},
  w_gory:{th:'gory',arch:'lance',col:'#b9a27a',ru:['Кремнёвое копьё','Копьё летит далеко и пробивает нечисть'],en:['Flint Spear','A spear flies far and pierces monsters'],
    dmg:[25,28,33,38,45,65],cd:[1.6,1.5,1.45,1.35,1.2,1],n:[1,1,2,2,3,4],pierce:[2,3,3,4,5,99],
    up:[['Пробивает троих','Pierces three'],['+1 копьё','+1 spear'],['+урон, пробивает четверых','+damage, pierces four'],['+1 копьё, +урон','+1 spear, +damage']],
    evo:{need:'mail',ru:['Копьё Святогора','4 копья насквозь, отбрасывают'],en:['Svyatogor’s Spear','4 spears straight through, knocking back']}},
  w_more:{th:'more',arch:'wave',col:'#5ab8ff',ru:['Морская раковина','Волна впереди богатыря отбрасывает нечисть'],en:['Sea Shell','A wave in front of you pushes monsters back'],
    dmg:[13,15,18,20,25,38],cd:[2.4,2.3,2.2,2,1.8,1.5],n:[1,1,1,2,2,3],r:[150,165,180,190,210,260],
    up:[['+урон, дальше','+damage, farther'],['+урон, дальше','+damage, farther'],['+1 волна назад','+1 wave behind'],['+урон, чаще','+damage, faster']],
    evo:{need:'livew',ru:['Девятый вал','Волна во все стороны, лечит богатыря'],en:['The Ninth Wave','A wave in every direction that heals you']}},
  w_luk:{th:'luk',arch:'chain',col:'#ffd84a',ru:['Цепь кота учёного','Златая цепь хлещет врага и перескакивает на соседей'],en:['Learned Cat’s Chain','A golden chain lashes a monster and jumps to its neighbors'],
    dmg:[40,44,52,60,72,104],cd:[1.5,1.4,1.3,1.25,1.15,.95],n:[2,2,3,4,5,7],r:[150,160,170,180,190,220],
    up:[['+урон, дальше','+damage, longer'],['+1 звено','+1 link'],['+1 звено, чаще','+1 link, faster'],['+1 звено, +урон','+1 link, +damage']],
    evo:{need:'comb',ru:['Златая цепь','7 звеньев, каждое оглушает'],en:['The Golden Chain','7 links, each one stuns']}},
  w_ogon:{th:'ogon',arch:'trail',col:'#ff8a2a',ru:['Огниво','За богатырём остаётся горящий след'],en:['Flint and Steel','You leave a burning trail behind you'],
    dmg:[7,8,9,10,13,18],r:[22,24,26,28,32,40],dur:[2,2.2,2.5,2.8,3,4],
    up:[['+урон, шире след','+damage, wider trail'],['Горит дольше, +урон','Burns longer, +damage'],['+урон, шире','+damage, wider'],['Горит дольше, +урон','Burns longer, +damage']],
    evo:{need:'amulet',ru:['Жар-колея','Широкий жаркий след горит 4 с'],en:['Ember Road','A wide blazing trail that burns 4 s']}},
  w_vihr:{th:'vihr',arch:'whirl',col:'#bfe9e0',ru:['Веер Вихря','Маленькие вихри затягивают нечисть и кружат её'],en:['Whirlwind Fan','Little whirlwinds suck monsters in and spin them'],
    dmg:[4,5,5,5,6,8],cd:[3,2.9,2.8,2.6,2.4,2],n:[1,1,2,2,3,4],r:[40,44,48,52,58,72],dur:[3,3,3.5,3.5,4,5],
    up:[['+урон, шире','+damage, wider'],['+1 вихрь','+1 whirlwind'],['Дольше, +урон','Longer, +damage'],['+1 вихрь, шире','+1 whirlwind, wider']],
    evo:{need:'cloth',ru:['Буря-Вихорь','4 больших вихря тянут сильнее'],en:['Storm Whirlwind','4 big whirlwinds that pull harder']}},
  w_lih:{th:'lih',arch:'beam',col:'#ffe08a',ru:['Лучина','Луч света кружит вокруг богатыря и жжёт нечисть'],en:['Rushlight','A beam of light sweeps around you and burns monsters'],
    dmg:[5,6,7,8,10,18],n:[1,1,2,2,3,4],r:[110,120,130,140,150,180],
    up:[['+урон, длиннее','+damage, longer'],['+1 луч','+1 beam'],['+урон, длиннее','+damage, longer'],['+1 луч, +урон','+1 beam, +damage']],
    evo:{need:'ring',ru:['Солнце красное','4 длинных луча, кружат быстрее'],en:['Red Sun','4 long beams that sweep faster']}}
};
const WPN_IDS=Object.keys(WPN_DEF);
/* имена «былинных» половинок: слияние = «<А> и <Б>» (коллекция пар — S.wpn.bk) */
const WPN_BN={sword:['Самосек','Blade'],bow:['Гром','Thunder'],mace:['Пуд','Might'],fire:['Жар','Blaze'],gusli:['Звон','Chime'],perun:['Молния','Lightning'],
  kolo:['Колобок','Kolobok'],axe:['Вихрь-секира','Whirl-axe'],water:['Живая вода','Living Water'],w_les:['Дубрава','Oak Grove'],w_bol:['Огонёк','Wisp'],
  w_pole:['Жнец','Reaper'],w_kosh:['Игла','Needle'],w_med:['Самоцвет','Gem'],w_gory:['Скала','Rock'],w_more:['Вал','Billow'],w_luk:['Цепь','Chain'],
  w_ogon:['Огниво','Ember'],w_vihr:['Буря','Storm'],w_lih:['Солнце','Sun']};
function wpnBN(id){const b=WPN_BN[id];return b?L(b[0],b[1]):'?';}
function wpnPair(a,b){return [a,b].sort().join('+');}
function wpnPairName(k){const p=k.split('+');return wpnBN(p[0])+L(' и ',' & ')+wpnBN(p[1]);}
function wpnPairsAll(){return Object.keys(WPN_BN).length*(Object.keys(WPN_BN).length-1)/2;}

/* запись WEAPONS[id] — тексты геттерами (язык переключается без перезагрузки) */
function wpnRec(id){const D=WPN_DEF[id],o={icon:'w_'+id.slice(2)};
  Object.defineProperty(o,'name',{get(){return L(D.ru[0],D.en[0]);},enumerable:true});
  Object.defineProperty(o,'about',{get(){return L(D.ru[1],D.en[1]);},enumerable:true});
  Object.defineProperty(o,'up',{get(){return [''].concat(D.up.map(u=>L(u[0],u[1])));},enumerable:true});
  for(const k of['dmg','cd','n','r','dur','pierce','b'])if(D[k])o[k]=D[k];
  o.evo={need:D.evo.need,get name(){return L(D.evo.ru[0],D.evo.en[0]);},get about(){return L(D.evo.ru[1],D.evo.en[1]);}};
  return o;}
const WPN_W={};
/* былинное оружие этого похода — запись не перечисляемая (не попадёт ни в карточки, ни в Оружейную) */
function wpnBylRec(k){const z=[1,1,1,1,1,1];return {icon:'w_byl',dmg:z,
  get name(){return L('Былинное: ','Epic: ')+wpnPairName(k);},get about(){return L('Удар-волна и залп обоих слитых оружий','A shockwave plus a volley from both fused weapons');},
  up:['','','','',''],evo:{need:'cloth',get name(){return wpnPairName(k);},get about(){return L('Былинное слияние','Epic fusion');}}};}

/* ---------- сейв ---------- */
function wpnNew(){return {sel:[],seen:{},bk:{},n:{take:0,evo:0,byl:0}};}
function wpnFixO(o){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);if(!ob(o))o=wpnNew();
  o.sel=Array.isArray(o.sel)?o.sel.filter((id,i,a)=>WPN_DEF[id]&&a.indexOf(id)===i).slice(0,WPN_SEL):[];
  for(const k of['seen','bk','n'])if(!ob(o[k]))o[k]={};
  for(const k in o.seen)if(!WPN_DEF[k])delete o.seen[k];for(const k in o.bk)o.bk[k]=1;
  for(const k of['take','evo','byl'])o.n[k]=Math.max(0,+o.n[k]||0)|0;return o;}
function wpnFix(S0){try{if(!WPN_ON||!S0)return;S0.wpn=wpnFixO(S0.wpn);}catch(e){wpnErr('fix',e);}}
function wpnMerge(d,o){try{if(!WPN_ON)return;const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);if(!ob(d)||!ob(d.wpn))return;
  const a=wpnFixO(o.wpn),b=wpnFixO(JSON.parse(JSON.stringify(d.wpn)));
  for(const k in b.seen)a.seen[k]=1;for(const k in b.bk)a.bk[k]=1;for(const k in b.n)a.n[k]=Math.max(a.n[k]|0,b.n[k]|0);
  if(!a.sel.length&&b.sel.length)a.sel=b.sel.slice();o.wpn=a;}catch(e){wpnErr('merge',e);}}
function W(){return WPN_ON&&S&&S.wpn||null;}

/* ---------- открытие: победа в «Логове» темы (CAMP n:3) ---------- */
function wpnLair(id){const th=WPN_DEF[id].th;return CAMP.find(r=>r.th===th&&r.n===3);}
function wpnOpen(id){if(WPN_ALL)return true;const r=wpnLair(id);return !!(r&&S.done&&S.done[r.slot]);}
function wpnUnl(){return WPN_IDS.filter(wpnOpen);}
function wpnNewOnes(){const w=W();return w?wpnUnl().filter(id=>!w.seen[id]):[];}
function wpnShown(){return WPN_ON&&!!W()&&(S.runs|0)>=3;} // новичку (первые 3 похода) — ничего
/* какие оружия видны движку: показ = перечисляемое свойство WEAPONS (карточки, Оружейная); скрытые остаются доступны по имени (не ломают начатый поход) */
function wpnSet(ids){for(const id of WPN_IDS){if(!WPN_W[id])WPN_W[id]=wpnRec(id);const on=ids.indexOf(id)>=0;
  const d=Object.getOwnPropertyDescriptor(WEAPONS,id);if(d&&d.enumerable===on)continue;
  Object.defineProperty(WEAPONS,id,{value:WPN_W[id],enumerable:on,configurable:true,writable:true});}}
function wpnSyncMenu(){if(!WPN_ON)return;try{wpnSet(wpnUnl());}catch(e){wpnErr('sync',e);}}
function wpnSyncRun(G){const w=W();if(!w)return [];if(G.daily||G.weekly||G.first){wpnSet([]);return [];}
  const r=CAMP_S[G.chi],th=r&&r.th,ids=wpnUnl().filter(id=>WPN_DEF[id].th===th||w.sel.indexOf(id)>=0);wpnSet(ids);return ids;}

/* ---------- бой ---------- */
const WPN_ARCH={};
function wHit(e,d,kx,ky){if(!e.dead)hitEnemy(e,d,kx||0,ky||0);}
function wCd(e,key,t){e.hk=e.hk||{};if((e.hk[key]||0)>G.t)return false;e.hk[key]=G.t+t;return true;}
function wNear(x,y,R,fn){forNear(x,y,R+30,e=>{if(e.dead)return;const dx=e.x-x,dy=e.y-y;if(dx*dx+dy*dy<(R+e.r)**2)fn(e,dx,dy);});}
function wPool(pad){return G.en.filter(e=>!e.dead&&!e.prop&&onScreen(e,pad||0));}
function wP(p){(G.wpnP||(G.wpnP=[])).push(p);return p;}
function wF(f){(G.wpnF||(G.wpnF=[])).push(f);return f;}
function wTrail(x,y,col,n){if(qLow()&&Math.random()<.5)return;for(let i=0;i<(n||1);i++)G.pt.push({x:x+rand(-3,3),y:y+rand(-3,3),vx:rand(-15,15),vy:rand(-15,15),t:0,dur:rand(.15,.3),col,s:rand(1.6,2.8),add:1});}
WPN_ARCH.root=(w,ev,D)=>{if(w.t>0)return;const st=G.st,H=G.hero;w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount,pool=wPool(-10),R=wv(w,'r')*wa(w),d=wd(w);
  for(let i=0;i<n;i++){let x,y;if(pool.length){const e=pool.splice(Math.floor(Math.random()*pool.length),1)[0];x=e.x;y=e.y;}else{const a=rand(0,TAU),q=rand(60,160);x=H.x+Math.cos(a)*q;y=H.y+Math.sin(a)*q;}
    wF({k:'root',x,y,r:R,d,t:-i*.08,dur:.7,ev,col:D.col});}};
WPN_ARCH.wisp=(w,ev,D)=>{const st=G.st,H=G.hero;w.a=(w.a||0)+G.dtW*(ev?2.3:1.7);const n=wv(w,'n')+st.amount,R=wv(w,'r')*wa(w),d=wd(w),br=(ev?13:10)*wa(w);w.pts=[];
  for(let i=0;i<n;i++){const a=w.a+i/n*TAU,rr=R*(.86+.14*Math.sin(G.t*3+i*1.7)),x=H.x+Math.cos(a)*rr,y=H.y+Math.sin(a)*rr;w.pts.push([x,y]);
    wNear(x,y,br,e=>{if(!wCd(e,'wb',.5))return;e.slow=Math.max(e.slow||0,ev?1.4:.6);wHit(e,d,0,0);});}};
WPN_ARCH.sickle=(w,ev,D)=>{if(w.t>0)return;const st=G.st;w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount,a0=aimAngle(),R=wv(w,'r')*wa(w);
  for(let i=0;i<n;i++)wP({k:'sick',a0:a0+i/n*TAU,t:0,dur:1.25,R,d:wd(w),hk:new Map(),ev,x:G.hero.x,y:G.hero.y,rot:0});SND.swing();};
WPN_ARCH.needle=(w,ev,D)=>{if(w.t>0)return;const st=G.st,H=G.hero;w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount,pool=wPool(10).sort((a,b)=>(b.boss?1e9:0)+(b.elite||b.mini?1e6:0)+b.hp-((a.boss?1e9:0)+(a.elite||a.mini?1e6:0)+a.hp));
  for(let i=0;i<n;i++){const tg=pool[i%Math.max(1,pool.length)];const a=tg?Math.atan2(tg.y-H.y,tg.x-H.x)+(i>=pool.length?rand(-.2,.2):0):Math.atan2(H.fy,H.fx)+rand(-.3,.3);
    wP({k:'ndl',x:H.x,y:H.y-6,vx:Math.cos(a)*640,vy:Math.sin(a)*640,a,life:1.1,d:wd(w),pierce:wv(w,'pierce'),hit:new Set(),ev});}SND.shoot();};
WPN_ARCH.sling=(w,ev,D)=>{if(w.t>0)return;const st=G.st,H=G.hero;w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount,skip=new Set();
  for(let i=0;i<n;i++){const tg=nearest(H.x,H.y,VIEW.R,skip);if(tg)skip.add(tg);const a=tg?Math.atan2(tg.y-H.y,tg.x-H.x):rand(0,TAU);
    wP({k:'gem',x:H.x,y:H.y-8,vx:Math.cos(a)*430,vy:Math.sin(a)*430,tg,b:wv(w,'b'),life:3,d:wd(w),hit:new Set(),ev,rot:0});}SND.shoot();};
WPN_ARCH.lance=(w,ev,D)=>{if(w.t>0)return;const st=G.st,H=G.hero;w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount,a0=aimAngle();
  for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.22;wP({k:'lnc',x:H.x,y:H.y-6,vx:Math.cos(a)*500,vy:Math.sin(a)*500,a,life:1.3,d:wd(w),pierce:wv(w,'pierce'),hit:new Set(),ev});}SND.swing();};
WPN_ARCH.wave=(w,ev,D)=>{if(w.t>0)return;const st=G.st,H=G.hero;w.t=wv(w,'cd')*st.cd;const n=ev?1:wv(w,'n')+st.amount,a0=aimAngle(),R=wv(w,'r')*wa(w);
  for(let i=0;i<n;i++)wF({k:'wav',x:H.x,y:H.y,a:a0+(i%2?Math.PI:0)+(i>1?(i-1)*.5:0),span:ev?Math.PI:.85,R,d:wd(w),t:0,dur:.55,hit:new Set(),ev,heal:0});SND.swing();};
WPN_ARCH.chain=(w,ev,D)=>{if(w.t>0)return;const st=G.st,H=G.hero,R=wv(w,'r')*wa(w);let tg=nearest(H.x,H.y,R);if(!tg){w.t=.2;return;}
  w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount,d=wd(w),skip=new Set(),pts=[H.x,H.y-8];
  for(let j=0;j<n&&tg;j++){skip.add(tg);pts.push(tg.x,tg.y);if(ev&&!tg.boss)tg.stun=Math.max(tg.stun||0,.35);wHit(tg,d*(j?.85:1),0,0);tg=nearest(tg.x,tg.y,115,skip);}
  wF({k:'chn',pts,t:0,dur:.28});SND.zap();};
WPN_ARCH.trail=(w,ev,D)=>{const H=G.hero,mv=w.lx!=null&&((H.x-w.lx)**2+(H.y-w.ly)**2)>4;w.lx=H.x;w.ly=H.y;w.drop=(w.drop||0)-G.dtW;if(w.drop>0)return;
  w.drop=mv?.22:.6;const R=wv(w,'r')*wa(w);let c=0;for(const p of G.wpnP||[])if(p.k==='emb')c++;if(c>=30)return;
  wP({k:'emb',x:H.x,y:H.y+6,r:R,d:wd(w),life:wv(w,'dur'),dur:wv(w,'dur'),ev,tk:0});};
WPN_ARCH.whirl=(w,ev,D)=>{if(w.t>0)return;const st=G.st,H=G.hero;w.t=wv(w,'cd')*st.cd;const n=wv(w,'n')+st.amount;
  for(let i=0;i<n;i++){const a=rand(0,TAU);wP({k:'whl',x:H.x,y:H.y,vx:Math.cos(a)*80,vy:Math.sin(a)*80,r:wv(w,'r')*wa(w),d:wd(w),life:wv(w,'dur'),tk:0,ev,rot:0});}};
WPN_ARCH.beam=(w,ev,D)=>{const st=G.st,H=G.hero;w.a=(w.a||0)+G.dtW*(ev?2.6:2);const n=wv(w,'n')+st.amount,R=wv(w,'r')*wa(w),d=wd(w);w.beams=[];
  for(let i=0;i<n;i++){const a=w.a+i/n*TAU,ux=Math.cos(a),uy=Math.sin(a);w.beams.push(a);
    forNear(H.x+ux*R/2,H.y+uy*R/2,R/2+30,e=>{if(e.dead)return;const dx=e.x-H.x,dy=e.y-H.y,t=dx*ux+dy*uy;if(t<0||t>R+e.r)return;const q=Math.abs(dx*uy-dy*ux);if(q>e.r+8)return;
      if(!wCd(e,'wl',.45))return;wHit(e,d,ux*40,uy*40);});}};
/* былинное оружие: раз в ~3,2 с удар-волна вокруг + внеочередной залп обоих слитых */
WPN_ARCH.byl=(w,ev,D)=>{if(w.t>0)return;const st=G.st,H=G.hero,b=G.wpnBy;if(!b)return;w.t=3.2*st.cd;
  const A=G.weapons.find(q=>q.id===b.a),B=G.weapons.find(q=>q.id===b.b),d=.7*((A?wd(A):40)+(B?wd(B):40))/2,R=190*st.area;
  G.fx.push({k:'wave',own:1,x:H.x,y:H.y,t:0,dur:.6,r1:R,col:'#ffd84a'});G.shake=Math.max(G.shake,3);SND.boom();
  wNear(H.x,H.y,R,(e,dx,dy)=>{const q=Math.hypot(dx,dy)||1;wHit(e,d,dx/q*260,dy/q*260);});
  for(const q of[A,B])if(q)q.t=Math.min(q.t,0);};

/* снаряды и следы (свои — движок о них не знает) */
function wpnStepP(dt){const H=G.hero,P=G.wpnP;if(!P||!P.length)return;
  for(const p of P){if(p.life!=null){p.life-=dt;if(p.life<=0){p.dead=true;continue;}}
    switch(p.k){
    case 'sick':{p.t+=dt;const q=p.t/p.dur;if(q>=1){p.dead=true;break;}const a=p.a0+q*TAU*1.15,rr=p.R*Math.sin(q*Math.PI)+14;p.x=H.x+Math.cos(a)*rr;p.y=H.y+Math.sin(a)*rr;p.rot+=dt*14;
      const sc=p.ev?1.35:1;wNear(p.x,p.y,13*sc,(e,dx,dy)=>{if((p.hk.get(e)||0)>G.t)return;p.hk.set(e,G.t+.35);wHit(e,p.d,dx*3,dy*3);});break;}
    case 'ndl':case 'lnc':{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k==='ndl')wTrail(p.x,p.y,'#cfd8ff');
      wNear(p.x,p.y,p.k==='lnc'?7:4,e=>{if(p.dead||p.hit.has(e))return;p.hit.add(e);let d=p.d;if(p.k==='ndl'&&(e.boss||e.elite||e.mini))d*=p.ev?1.6:1.3;
        wHit(e,d,p.vx*(p.k==='lnc'?(p.ev?.6:.35):.15),p.vy*(p.k==='lnc'?(p.ev?.6:.35):.15));if(--p.pierce<=0)p.dead=true;});break;}
    case 'gem':{if(!p.tg||p.tg.dead){p.tg=nearest(p.x,p.y,220,p.hit);}if(p.tg){const dx=p.tg.x-p.x,dy=p.tg.y-p.y,q=Math.hypot(dx,dy)||1;p.vx=dx/q*430;p.vy=dy/q*430;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=dt*10;wTrail(p.x,p.y,p.ev?'#4fd18a':'#ff6a9a');
      if(p.tg&&(p.tg.x-p.x)**2+(p.tg.y-p.y)**2<(p.tg.r+6)**2){const e=p.tg;p.hit.add(e);wHit(e,p.d,p.vx*.2,p.vy*.2);spark(p.x,p.y,'#ffffff',3);
        if(--p.b<0){p.dead=true;break;}p.tg=nearest(e.x,e.y,170,p.hit);if(!p.tg)p.dead=true;}break;}
    case 'emb':{p.tk-=dt;if(p.tk<=0){p.tk=.25;wNear(p.x,p.y,p.r,e=>{if(wCd(e,'wo',.5))wHit(e,p.d,0,0);});}if(Math.random()<(qLow()?.08:.25))wTrail(p.x+rand(-p.r*.6,p.r*.6),p.y+rand(-p.r*.4,p.r*.4),'#ff8a2a');break;}
    case 'whl':{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt*.3;p.vy*=1-dt*.3;p.rot+=dt*9;const pull=p.ev?110:70;
      wNear(p.x,p.y,p.r*1.7,(e,dx,dy)=>{if(e.boss)return;const q=Math.hypot(dx,dy)||1;if(q>8){e.x-=dx/q*pull*dt;e.y-=dy/q*pull*dt;}});
      p.tk-=dt;if(p.tk<=0){p.tk=.4;wNear(p.x,p.y,p.r,e=>wHit(e,p.d,0,0));}break;}
    }}
  compact(P,p=>!p.dead);}
function wpnStepF(dt){const H=G.hero,F=G.wpnF;if(!F||!F.length)return;
  for(const f of F){f.t+=dt;
    if(f.k==='root'&&!f.hit&&f.t>=.22){f.hit=1;burst(f.x,f.y,f.col,6,80);wNear(f.x,f.y,f.r,e=>{e.slow=Math.max(e.slow||0,f.ev?2:1.2);if(f.ev&&!e.boss)e.stun=Math.max(e.stun||0,.45);wHit(e,f.d,0,-30);});}
    if(f.k==='wav'){const r=f.R*Math.min(1,f.t/f.dur);wNear(f.x,f.y,r,(e,dx,dy)=>{if(f.hit.has(e))return;const q=Math.hypot(dx,dy)||1;if(q<r-34)return;
        let da=Math.atan2(dy,dx)-f.a;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>f.span)return;f.hit.add(e);wHit(e,f.d,dx/q*300,dy/q*300);
        if(f.ev&&f.heal<3&&H.hp<G.st.maxHp){f.heal+=.5;H.hp=Math.min(G.st.maxHp,H.hp+.5);}});}}
  compact(F,f=>f.t<f.dur);}
/* такт: оружия земель + былинное + свои снаряды; проверка слияния */
function WPN_UPD(dt,G0){if(!WPN_ON||!G||G.over)return;try{G.dtW=dt;
  for(const w of G.weapons){const D=w.id==='byl'?null:WPN_DEF[w.id];if(!D&&w.id!=='byl')continue;const f=WPN_ARCH[D?D.arch:'byl'];if(f)f(w,w.lvl>=6,D||{});}
  wpnStepP(dt);wpnStepF(dt);wpnRunWatch();}catch(e){wpnErr('upd',e);}}

/* ---------- рисование своих снарядов (мировые координаты) ---------- */
function WPN_DRAW(c,G0){if(!WPN_ON||!G)return;try{const H=G.hero,P=G.wpnP||[],F=G.wpnF||[],lo=qLow();worldT();const ADD=G.ch.bright?'source-over':'lighter';
  for(const w of G.weapons){
    if(w.id==='w_lih'&&w.beams){const R=wv(w,'r')*wa(w),ev=w.lvl>=6;c.globalCompositeOperation=ADD;c.lineCap='round';
      for(const a of w.beams){const x2=H.x+Math.cos(a)*R,y2=H.y+Math.sin(a)*R;c.strokeStyle=ev?'rgba(255,150,60,.35)':'rgba(255,220,120,.3)';c.lineWidth=ev?16:12;c.beginPath();c.moveTo(H.x,H.y-4);c.lineTo(x2,y2);c.stroke();
        c.strokeStyle='rgba(255,250,220,.85)';c.lineWidth=3;c.stroke();glowDot(x2,y2,10,ev?'#ff9a3a':'#ffe08a');}c.globalCompositeOperation='source-over';}
    if(w.id==='w_bol'&&w.pts){c.globalCompositeOperation=ADD;const ev=w.lvl>=6;for(const [x,y] of w.pts){glowDot(x,y,ev?20:15,'#6fe3ff');glowDot(x,y,5,'#ffffff');}c.globalCompositeOperation='source-over';}}
  for(const f of F){const q=Math.max(0,f.t)/f.dur;
    if(f.k==='root'&&f.t>=0){const h=Math.min(1,f.t/.22)*(1-Math.max(0,(q-.6)/.4)),R=f.r;c.fillStyle=f.ev?'#4f8a2a':'#6a5a2a';c.strokeStyle='#2e3a14';c.lineWidth=1.5;
      const k=f.ev?7:5;for(let i=0;i<k;i++){const a=i/k*TAU+f.x*.01,x=f.x+Math.cos(a)*R*.55,y=f.y+Math.sin(a)*R*.35,s=(8+R*.25)*h;
        c.beginPath();c.moveTo(x-4,y);c.lineTo(x+1,y-s);c.lineTo(x+4,y);c.closePath();c.fill();c.stroke();}
      c.fillStyle=rgba('#3e5a22',.35*(1-q));c.beginPath();c.ellipse(f.x,f.y,R,R*.55,0,0,TAU);c.fill();}
    else if(f.k==='wav'){const r=f.R*Math.min(1,f.t/f.dur),al=1-q;c.lineCap='round';c.strokeStyle='rgba(90,184,255,'+.7*al+')';c.lineWidth=12*al+3;c.beginPath();c.arc(f.x,f.y,r,f.a-f.span,f.a+f.span);c.stroke();
      c.strokeStyle='rgba(235,250,255,'+.9*al+')';c.lineWidth=3;c.beginPath();c.arc(f.x,f.y,r+4,f.a-f.span,f.a+f.span);c.stroke();}
    else if(f.k==='chn'){const al=1-q;c.lineJoin='round';c.strokeStyle='rgba(255,200,60,'+.45*al+')';c.lineWidth=8;c.beginPath();c.moveTo(f.pts[0],f.pts[1]);for(let i=2;i<f.pts.length;i+=2)c.lineTo(f.pts[i],f.pts[i+1]);c.stroke();
      c.strokeStyle='rgba(255,240,170,'+al+')';c.lineWidth=2.5;c.setLineDash([5,4]);c.stroke();c.setLineDash([]);}}
  for(const p of P){if(!onScreen(p,40))continue;
    if(p.k==='sick')drawSpr('w_pole',p.x,p.y,p.ev?.95:.7,p.ev?.95:.7,false,p.rot);
    else if(p.k==='gem')drawSpr('w_gem',p.x,p.y,p.ev?.6:.45,p.ev?.6:.45,false,p.rot);
    else if(p.k==='ndl'){worldT();c.lineCap='round';c.strokeStyle='#eef2ff';c.lineWidth=2.4;c.beginPath();c.moveTo(p.x-Math.cos(p.a)*12,p.y-Math.sin(p.a)*12);c.lineTo(p.x+Math.cos(p.a)*8,p.y+Math.sin(p.a)*8);c.stroke();}
    else if(p.k==='lnc')drawSpr('w_spear',p.x,p.y,p.ev?1.1:.85,p.ev?1.1:.85,false,p.a+Math.PI/4);
    else if(p.k==='whl'){worldT();const r=p.r;c.lineWidth=p.ev?3:2.2;for(let i=0;i<3;i++){c.strokeStyle='rgba(220,245,240,'+(.55-i*.12)*Math.min(1,p.life*2)+')';c.beginPath();c.arc(p.x,p.y-i*6,r*(.45+i*.22),p.rot+i,p.rot+i+4.2);c.stroke();}}}
  worldT();c.globalCompositeOperation=ADD;
  for(const p of P)if(p.k==='emb'&&onScreen(p,30)){const al=Math.min(1,p.life/p.dur*2);c.globalAlpha=al*(G.ch.bright?.6:.85);glowDot(p.x,p.y,p.r*1.15,'#ff6a1a');if(!lo){c.globalAlpha=al*.7;glowDot(p.x,p.y,p.r*.45,'#ffe07a');}}
  c.globalAlpha=1;c.globalCompositeOperation='source-over';}catch(e){wpnErr('draw',e);}}

/* ---------- слияние: следим в походе ---------- */
function wpnBylOk(){if(G.wpnBy||G.daily||G.weekly)return false;if(!(G.dif==='s'||G.dif==='h'||G.endless))return false;if(G.t<WPN_BYL_T)return false;
  const ev=G.weapons.filter(w=>w.lvl>=6&&w.id!=='byl');if(ev.length<2)return false;
  return Object.keys(G.pas).some(k=>PASSIVES[k]&&G.pas[k]>=PASSIVES[k].max);}
function wpnRunWatch(){const w=W();if(!w)return;
  for(const q of G.weapons){if(!WPN_DEF[q.id])continue;const s=G.wpnSeen||(G.wpnSeen={});
    if(!s[q.id]){s[q.id]=1;w.n.take++;wpnEv('take',q.id,{c:G.chi});}
    if(q.lvl>=6&&!s[q.id+'*']){s[q.id+'*']=1;w.n.evo++;wpnEv('evo',q.id);}}
  if(!wpnBylOk())return;
  const ev=G.weapons.filter(q=>q.lvl>=6&&q.id!=='byl').slice(0,2),k=wpnPair(ev[0].id,ev[1].id),nw=!w.bk[k];
  G.wpnBy={a:ev[0].id,b:ev[1].id,k};Object.defineProperty(WEAPONS,'byl',{value:wpnBylRec(k),enumerable:false,configurable:true,writable:true});
  G.weapons.push({id:'byl',lvl:6,t:1,a:0});w.bk[k]=1;w.n.byl++;
  banner(L('Былинное слияние!','Epic fusion!'),wpnPairName(k)+(nw?L(' — новое в книге!',' — new in the book!'):''),4);heroSay(L('Вот это сила былинная!','Now that is epic strength!'));
  SND.chest();G.shake=7;vib(80,1);hitStop(.14);G.fx.push({k:'pulse',own:1,t:0,dur:.9,r1:VIEW.R,evo:1});G.fx.push({k:'wave',own:1,x:G.hero.x,y:G.hero.y,t:0,dur:.7,r1:300,col:'#ffd84a'});
  wpnEv('byl',k,{nw:nw?1:0,d:G.dif||'e',t:Math.round(G.t)});}

/* ---------- временная прокладка (пока в game.js нет крючков WPN_UPD/WPN_DRAW) ---------- */
function wpnShim(){if(wpnShim.ok||!WPN_ON)return;wpnShim.ok=1;
  try{if(typeof update==='function'&&!/WPN_UPD/.test(String(update))&&typeof updWeapons==='function'){const o=updWeapons;updWeapons=function(dt){o(dt);WPN_UPD(dt,G);};wpnShim.u=1;}
    if(typeof render==='function'&&!/WPN_DRAW/.test(String(render))){const o=render;render=function(){o();if(G&&(G.wpnP&&G.wpnP.length||G.wpnF&&G.wpnF.length||G.weapons.some(w=>w.id==='w_lih'||w.id==='w_bol'))){ctx.save();WPN_DRAW(ctx,G);ctx.restore();}};wpnShim.r=1;}}
  catch(e){wpnErr('shim',e);}}

/* ---------- рисунки (значки, они же спрайты снарядов) ---------- */
if(WPN_ON){
  art('w_les',40,g=>{ln(g,[-10,17,8,-12],'#6a4a24',4.4);ln(g,[-10,17,8,-12],'#9a7040',1.4);for(const [x,y,a] of[[8,-12,-.6],[3,-6,.9],[-2,2,-.9]]){g.save();g.translate(x,y);g.rotate(a);ell(g,0,-5,3.4,6,'#5aa83a');g.restore();}
    glow(g,9,-14,9,'#9aff6a');ell(g,9,-14,3,3,'#d8ff9a',{ol:false});});
  art('w_bol',40,g=>{glow(g,0,0,19,'#6fe3ff');for(const [x,y,r] of[[-7,4,5],[7,-3,6],[0,-10,4]]){ell(g,x,y,r,r,'#9af0ff',{ol:false});ell(g,x,y,r*.45,r*.45,'#ffffff',{ol:false});}});
  art('w_pole',40,g=>{g.beginPath();g.arc(0,0,15,-2.5,1.2);g.arc(4,-3,11,1.2,-2.5,true);g.closePath();g.fillStyle=grad(g,0,0,15,'#e8e4d0');g.fill();outline(g,'#c8c4b0',1.2);
    ln(g,[-11,10,-17,17],'#8a5a2e',4);});
  art('w_kosh',40,g=>{g.rotate(-.78);ln(g,[0,-18,0,16],'#cfd8ff',2.6);ln(g,[0,-18,0,16],'#ffffff',.8);ell(g,0,13,2.2,3.4,'#8a92b8',{ol:false});
    ell(g,-6,14,7,9,'#f4ecd8');glow(g,0,-18,7,'#cfd8ff');});
  art('w_gem',40,g=>{poly(g,[0,-14,12,-4,8,12,-8,12,-12,-4],'#4fd18a');poly(g,[0,-14,5,-4,0,8,-5,-4],'#a8ffd0',{ol:false});});
  art('w_med',40,g=>{ln(g,[-14,-12,0,10,14,-12],'#8a5a2e',2.6);ell(g,0,10,6,4,'#6a4422');g.save();g.translate(0,-1);g.scale(.5,.5);ART.w_gem.fn(g);g.restore();});
  art('w_spear',40,g=>{ln(g,[-16,16,10,-10],'#8a6236',3.2);poly(g,[10,-10,8,-16,17,-17,16,-8],'#9a8a70');});
  art('w_gory',40,g=>{ART.w_spear.fn(g);ln(g,[-5,5,0,0],'#c94a3a',2);});
  art('w_more',40,g=>{g.beginPath();g.moveTo(0,14);g.lineTo(-15,-6);g.quadraticCurveTo(0,-20,15,-6);g.closePath();g.fillStyle=grad(g,0,-2,16,'#f6c8b0');g.fill();outline(g,'#f6c8b0',1.2);
    for(const a of[-.9,-.45,0,.45,.9])ln(g,[0,13,Math.sin(a)*14,-12+Math.abs(a)*6],'#d89a80',1.2);});
  art('w_luk',40,g=>{for(let i=0;i<5;i++){const x=-14+i*7,y=Math.sin(i*1.1)*5;g.beginPath();g.ellipse(x,y,5,3.2,i%2?.9:-.3,0,TAU);g.lineWidth=2.6;g.strokeStyle='#e6b53a';g.stroke();g.lineWidth=.8;g.strokeStyle='#fff3b0';g.stroke();}
    glow(g,14,0,6,'#ffd84a');});
  art('w_ogon',40,g=>{rrect(g,-12,-4,24,10,3);g.fillStyle='#5a5a66';g.fill();outline(g,'#5a5a66',1);ell(g,6,-10,5,4,'#c9a06a');glow(g,-4,-10,10,'#ff8a2a');for(const [x,y] of[[-8,-14],[-2,-16],[-5,-9]])ell(g,x,y,1.4,1.4,'#fff0a0',{ol:false});});
  art('w_vihr',40,g=>{g.beginPath();g.moveTo(0,14);for(let i=0;i<5;i++){const a=-Math.PI*.9+i*.45;g.lineTo(Math.cos(a)*17,Math.sin(a)*17-2);}g.closePath();g.fillStyle=grad(g,0,0,17,'#bfe9e0');g.fill();outline(g,'#bfe9e0',1.2);
    for(let i=0;i<5;i++){const a=-Math.PI*.9+i*.45;ln(g,[0,14,Math.cos(a)*15,Math.sin(a)*15-2],'#7aa8a0',1);}});
  art('w_lih',40,g=>{glow(g,6,-8,16,'#ffe08a');ln(g,[-12,14,6,-8],'#b98a50',3);ln(g,[4,-6,8,-11],'#ff9a3a',3);ell(g,7,-10,2,2,'#ffffff',{ol:false});});
  art('w_byl',40,g=>{glow(g,0,0,20,'#ffd84a','#fff8d0');g.save();g.rotate(-.5);ART.i_sword.fn(g);g.restore();g.save();g.rotate(.6);g.scale(.8,.8);ART.i_perun&&ART.i_perun.fn(g);g.restore();});
  for(const id of WPN_IDS.concat(['byl'])){const k=id==='byl'?'w_byl':'w_'+id.replace(/^w_/,'');
    art('e_'+id,48,g=>{glow(g,0,0,24,'#ffd84a','#fff8d0');g.strokeStyle='#ffd84a';g.lineWidth=1.6;for(let i=0;i<10;i++){const a=i/10*TAU;g.beginPath();g.moveTo(Math.cos(a)*16,Math.sin(a)*16);g.lineTo(Math.cos(a)*22,Math.sin(a)*22);g.stroke();}
      g.save();g.scale(1.05,1.05);ART[k].fn(g);g.restore();});}
}

/* ---------- окно «Оружие земель» ---------- */
function wpnThName(id){const D=WPN_DEF[id],t=TH[D.th];return t&&t.name||D.th;}
function wpnLairName(id){const r=wpnLair(id),c=r&&CH[r.slot];return c&&c.name||'';}
function wpnHTML(){const w=W(),u=wpnUnl();let h='<h3>'+L('⚔ Оружие земель','⚔ Weapons of the Lands')+'</h3><p class="sub">'+
    L('Победи «Логово» земли — получишь её оружие. В главах своей земли оно всегда в выборе, в остальных — если отметишь «Брать в поход» (до '+WPN_SEL+').','Win a land’s Lair to get its weapon. It is always offered in its own land; elsewhere — only if you mark “Take along” (up to '+WPN_SEL+').')+'</p>';
  h+='<p class="sub">'+L('Открыто: ','Unlocked: ')+u.length+' / '+WPN_IDS.length+'</p>';
  for(const id of WPN_IDS){const D=WPN_DEF[id],R=WPN_W[id]||(WPN_W[id]=wpnRec(id)),op=u.indexOf(id)>=0,sel=w.sel.indexOf(id)>=0,am=(S.armory||{})[id]|0,nw=op&&!w.seen[id];
    h+='<div class="card wpn-c'+(op?'':' wpn-lock')+(nw?' next':'')+'"><div class="row"><img class="ic" src="'+ic(R.icon,96)+'"><div class="t"><b>'+(op?R.name:L('Оружие земли «','Weapon of “')+wpnThName(id)+L('»','”'))+(nw?' <i class="wpn-new">'+L('новое','new')+'</i>':'')+'</b><span>'+
      (op?R.about:L('Откроется победой в Логове','Unlocks by winning the Lair')+(wpnLairName(id)?' «'+wpnLairName(id)+'»':''))+'</span>'+
      (op?'<span class="wpn-evo">'+L('Эволюция в походе: 5-й ур. + ','Evolution in a run: lv 5 + ')+'<img src="'+ic(PASSIVES[D.evo.need].icon,48)+'" width="16" height="16"> '+PASSIVES[D.evo.need].name+' → <b>'+R.evo.name+'</b> · '+L('Оружейная: ур. ','Armory: lv ')+am+'/'+ARMORY_MAX+'</span>':'')+'</div></div>'+
      (op?'<div class="wpn-act"><button class="btn'+(sel?' gold':'')+'" data-ws="'+id+'">'+(sel?L('✓ Беру в поход','✓ Taking along'):L('Брать в поход','Take along'))+'</button></div>':'')+'</div>';}
  const bk=Object.keys(w.bk);
  h+='<h3>'+L('✨ Былинные слияния','✨ Epic Fusions')+'</h3><p class="sub">'+L('На Сложной, Адской и в Сече, после 4:00: две эволюции + любой оберег на полную силу сольются в былинное оружие (одно за поход). Собери пары!','On Hard, Hell and in Endless, after 4:00: two evolutions + any charm at full power fuse into an epic weapon (one per run). Collect the pairs!')+'</p>'+
    '<div class="card"><div class="row"><img class="ic" src="'+ic('e_byl',96)+'"><div class="t"><b>'+L('Книга слияний: ','Fusion book: ')+bk.length+' / '+wpnPairsAll()+'</b><span>'+(bk.length?bk.slice(-6).map(wpnPairName).join(' · '):L('Пока ни одного — попробуй на Сложной','None yet — try it on Hard'))+'</span></div></div></div>';
  h+='<button class="btn big" id="wpnBack">'+L('Закрыть','Close')+'</button>';return h;}
function wpnOpenWin(){const w=W();if(!w)return;wpnSyncMenu();STAT.screen&&STAT.screen('wpn');const top=$('modal').classList.contains('on')&&$('mBody').getAttribute('data-w')==='wpn'?$('mBody').scrollTop:0;
  showModal(wpnHTML(),'wpn');if(top)$('mBody').scrollTop=top;let ch=0;for(const id of wpnUnl())if(!w.seen[id]){w.seen[id]=1;ch=1;}if(ch)save();
  on('wpnBack',()=>{hideModal();if(typeof curTab!=='undefined'&&curTab==='Village'&&!G)try{renderVillage();}catch(e){}});
  for(const b of $('mBody').querySelectorAll('[data-ws]'))b.onclick=()=>{SND.click();const id=b.dataset.ws,i=w.sel.indexOf(id);
    if(i>=0)w.sel.splice(i,1);else{if(w.sel.length>=WPN_SEL)w.sel.shift();w.sel.push(id);}save();wpnEv('sel',id,{on:i>=0?0:1});wpnOpenWin();};}
function wpnStatus(){const u=wpnUnl().length,nw=wpnNewOnes().length;return nw?L('Новое оружие! Загляни','New weapon! Take a look'):L('Открыто ','Unlocked ')+u+' / '+WPN_IDS.length+(u?'':L(' — победи Логово земли',' — win a land’s Lair'));}

/* ---------- модуль ---------- */
if(WPN_ON){wpnFix(S);wpnSyncMenu();
  META_MODS.push({id:'wpn',
    FIX(S0){wpnFix(S0);},
    MERGE(d,o){wpnMerge(d,o);},
    RUN(G0){try{if(!G0||!W())return;wpnShim();G0.wpnP=[];G0.wpnF=[];G0.wpnBy=null;G0.wpnSeen={};delete WEAPONS.byl;const ids=wpnSyncRun(G0);
      if(ids.length)wpnEv('run',ids.join(','),{c:G0.chi});}catch(e){wpnErr('run',e);}},
    END(G0,win){try{const w=W();if(!w||!G0)return;wpnSyncMenu();const r=CAMP_S[G0.chi];
      if(win&&r&&r.n===3&&!G0.endless&&!G0.daily){const id=WPN_IDS.find(i=>WPN_DEF[i].th===r.th);if(id&&!w.seen[id]&&!G0.wpnGot){G0.wpnGot=1;wpnEv('unlock',id);
        G0.metaHtml=(G0.metaHtml||'')+'<div class="wpn-res"><img src="'+ic('w_'+id.slice(2),64)+'" width="28" height="28"> '+L('Новое оружие: ','New weapon: ')+'<b>'+WPN_W[id].name+'</b></div>';}}
      if(G0.wpnBy)G0.metaHtml=(G0.metaHtml||'')+'<div class="wpn-res"><img src="'+ic('e_byl',64)+'" width="28" height="28"> '+L('Былинное: ','Epic: ')+'<b>'+wpnPairName(G0.wpnBy.k)+'</b></div>';}catch(e){wpnErr('end',e);}},
    VIL(el){try{if(!wpnShown()||!el)return;wpnSyncMenu();const nw=wpnNewOnes().length;
      const d=document.createElement('div');d.className='card'+(nw?' next':'');d.id='wpnCard';
      d.innerHTML='<div class="row"><img class="ic" src="'+ic('w_med',96)+'"><div class="t"><b>'+L('⚔ Оружие земель','⚔ Weapons of the Lands')+'</b><span>'+wpnStatus()+'</span></div><button class="btn gold" id="wpnGo">'+L('Открыть','Open')+'</button></div>';
      const yc=el.querySelector('#yardCard'),cv=el.querySelector('#village'),at=yc||cv;if(at&&at.nextSibling)el.insertBefore(d,at.nextSibling);else el.appendChild(d);
      on('wpnGo',wpnOpenWin);}catch(e){wpnErr('vil',e);}},
    TODAY(TL){try{if(!wpnShown())return;wpnSyncMenu();if(!wpnNewOnes().length)return;
      TL.push({k:'wpn',ic:'w_'+wpnNewOnes()[0].slice(2),t:L('Новое оружие','New weapon'),s:wpnStatus(),ready:true,b:L('Открыть','Open'),fn:()=>{hideModal();wpnOpenWin();}});}catch(e){wpnErr('today',e);}},
    CHIPS(a){try{if(wpnShown()&&wpnNewOnes().length)a.push('<i class="hot">⚔</i>');}catch(e){wpnErr('chips',e);}}});}

/* для проверки на своей машине: WPN.give('w_med',6) — дать оружие в поход; WPN.byl() — условия слияния сейчас */
const WPN={on:WPN_ON,open:wpnOpenWin,ids:WPN_IDS,unl:wpnUnl,
  give(id,l){if(!LOCAL||!G)return;const q=G.weapons.find(x=>x.id===id);if(q)q.lvl=l||1;else G.weapons.push({id,lvl:l||1,t:.2,a:0});},
  pas(id,l){if(!LOCAL||!G)return;G.pas[id]=l;computeStats();}};
