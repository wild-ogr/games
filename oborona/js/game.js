'use strict';
/* ================= Бой: карта, нечисть, заставы, снаряды, отрисовка ================= */
let G=null,cv,ctx,lastT=0,bgCv=null;
const VIEW={W:0,H:0,dpr:1,s:1,ox:0,oy:0,B:1,top:56,bot:84};
const C=9,R=15,CELL=40,WW=C*CELL,WH=R*CELL,ESC=.8,STEP=2;

/* ---------- экран ---------- */
function layout(){
  // холст — не больше 2 пикселей на точку (dpr 3 даёт в 2,25 раза больше работы, а на телефоне разницы не видно)
  VIEW.dpr=window.__forceDpr||Math.min(window.devicePixelRatio||1,2);VIEW.W=cv.clientWidth||window.innerWidth;VIEW.H=cv.clientHeight||window.innerHeight;
  cv.width=Math.round(VIEW.W*VIEW.dpr);cv.height=Math.round(VIEW.H*VIEW.dpr);
  const st=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stp'))||0;
  VIEW.top=52+st;VIEW.bot=78;
  // широкий экран: HUD стоит по бокам поля — поле во всю высоту
  VIEW.wide=VIEW.W>VIEW.H*1.25&&VIEW.W-WW*(VIEW.H-16)/WH>=560;document.body.classList.toggle('wide',VIEW.wide);
  if(VIEW.wide){VIEW.top=8;VIEW.bot=8;
    // ПК: панели боя — у самого поля (не в дальних углах экрана): ширина HUD = поле + по 300 px с боков
    const fw=WW*Math.min(VIEW.W/WW,(VIEW.H-16)/WH,2.6);VIEW.hw=Math.min(VIEW.W,Math.round(fw+2*Math.min(300,(VIEW.W-fw)/2)));document.documentElement.style.setProperty('--hw',VIEW.hw+'px');}
  if(window.__hudTop!=null)VIEW.top=window.__hudTop;if(window.__hudBot!=null)VIEW.bot=window.__hudBot;const aw=VIEW.W,ah=VIEW.H-VIEW.top-VIEW.bot;
  VIEW.s=Math.min(aw/WW,ah/WH,2.6);VIEW.ox=(VIEW.W-WW*VIEW.s)/2;VIEW.oy=VIEW.top+(ah-WH*VIEW.s)/2;VIEW.B=VIEW.s*VIEW.dpr;
  const k=Math.min(VIEW.B,window.__forceDpr?4:2.5);if(Math.abs(k-SPR_K)/k>.05)buildSprites(k);
  if(G){G.coinTg=null;renderBg();warmBattle();G.redraw=1;}
}
function toWorld(cx,cy){return {x:(cx-VIEW.ox)/VIEW.s,y:(cy-VIEW.oy)/VIEW.s};}
function toScreen(x,y){return {x:VIEW.ox+x*VIEW.s,y:VIEW.oy+y*VIEW.s};}

/* ================= карта уровня ================= */
function genMap(seed,opt){
  const rng=mulberry(seed);let cells=null;
  for(let tries=0;tries<400&&!cells;tries++){
    const cs=[];let c=1+Math.floor(rng()*(C-2)),r=0;cs.push([c,r]);
    let v=2+Math.floor(rng()*2);for(let i=1;i<v;i++){r++;cs.push([c,r]);}
    while(r<R-1){const opts=[];for(let tc=0;tc<C;tc++)if(Math.abs(tc-c)>=2)opts.push(tc);
      const tc=opts[Math.floor(rng()*opts.length)],s=Math.sign(tc-c);while(c!==tc){c+=s;cs.push([c,r]);}
      v=2+Math.floor(rng()*2);for(let i=0;i<v&&r<R-1;i++){r++;cs.push([c,r]);}}
    const xs=cs.map(p=>p[0]);
    if(cs.length<opt.minLen||cs.length>opt.maxLen||c<2||c>6||Math.max(...xs)-Math.min(...xs)<5)continue;
    cells=cs;}
  const key=(c,r)=>c+','+r,onPath=new Set(cells.map(p=>key(p[0],p[1])));
  const end=cells[cells.length-1];
  // река (Смородина) поперёк дороги — там, где дорога идёт прямо вниз
  let river=-1;
  if(opt.river){const rows=[];for(let r=3;r<R-3;r++){const n=cells.filter(p=>p[1]===r).length;if(n===1)rows.push(r);}if(rows.length)river=rows[Math.floor(rng()*rows.length)];}
  // второй вход сбоку: продолжаем горизонтальный отрезок до края
  let side=null;
  if(opt.side){for(let i=1;i<cells.length-1&&!side;i++){const [c,r]=cells[i],[pc,pr]=cells[i-1],[nc,nr]=cells[i+1];
      if(pr===r-1&&nr===r&&r>2&&r<R-4){const dir=nc-c,ext=[];let x=c-dir,ok=true;
        while(x>=0&&x<C){if(onPath.has(key(x,r))||onPath.has(key(x,r-1))||onPath.has(key(x,r+1))||r===river){ok=false;break;}ext.push([x,r]);x-=dir;}
        if(ok&&ext.length>=1&&ext.length<=4){side={cells:ext.reverse(),at:i,dir};}}}}
  const allPath=new Set(onPath);if(side)for(const p of side.cells)allPath.add(key(p[0],p[1]));
  // места под заставы: рядом с дорогой, где она видна с разных сторон
  const cand=[];
  for(let r=1;r<R-1;r++)for(let c=1;c<C-1;c++){if(allPath.has(key(c,r))||r===river)continue;if(r>=R-2&&Math.abs(c-end[0])<=(r===R-1?2:1))continue;
    let near=9,score=0;for(const k of allPath){const [pc,pr]=k.split(',').map(Number);const d=Math.max(Math.abs(pc-c),Math.abs(pr-r));near=Math.min(near,d);
      const e=Math.hypot(pc-c,pr-r);if(e<=2.6)score+=1-e/4;}
    if(near===1)cand.push({c,r,score:score+rng()*.8});else if(near===2)cand.push({c,r,score:score*.5+rng()*.4-3});}
  cand.sort((a,b)=>b.score-a.score);const spots=[];
  for(const q of cand){if(spots.length>=opt.spots)break;if(spots.some(s=>Math.max(Math.abs(s.c-q.c),Math.abs(s.r-q.r))<2))continue;spots.push(q);}
  spots.sort((a,b)=>a.r-b.r||a.c-b.c);
  const ctr=(c,r)=>[c*CELL+CELL/2,r*CELL+CELL/2];
  const p1=[[cells[0][0]*CELL+CELL/2,-70]].concat(cells.map(p=>ctr(p[0],p[1])),[[end[0]*CELL+CELL/2,WH+6]]);
  const paths=[mkPath(p1)];
  if(side){const sx=side.dir>0?-70:WW+70,r=side.cells[0][1];
    const p2=[[sx,r*CELL+CELL/2]].concat(side.cells.map(p=>ctr(p[0],p[1])),cells.slice(side.at).map(p=>ctr(p[0],p[1])),[[end[0]*CELL+CELL/2,WH+6]]);paths.push(mkPath(p2));}
  return {cells,spots:spots.map(s=>({x:s.c*CELL+CELL/2,y:s.r*CELL+CELL/2,c:s.c,r:s.r})),paths,river,gate:{x:end[0]*CELL+CELL/2,y:WH-18},seed};
}
// ломаная по центрам клеток → скруглённые углы → точки через STEP единиц
function mkPath(P){const pts=[P[0]],rad=CELL/2;
  for(let i=1;i<P.length-1;i++){const a=P[i-1],b=P[i],c=P[i+1];const d1x=Math.sign(b[0]-a[0]),d1y=Math.sign(b[1]-a[1]),d2x=Math.sign(c[0]-b[0]),d2y=Math.sign(c[1]-b[1]);
    if(d1x===d2x&&d1y===d2y){pts.push(b);continue;}
    const A=[b[0]-d1x*rad,b[1]-d1y*rad],B=[b[0]+d2x*rad,b[1]+d2y*rad];
    for(let t=0;t<=1.0001;t+=1/8){const u=1-t;pts.push([u*u*A[0]+2*u*t*b[0]+t*t*B[0],u*u*A[1]+2*u*t*b[1]+t*t*B[1]]);}}
  pts.push(P[P.length-1]);
  const xs=[],ys=[];let acc=0,need=0;xs.push(pts[0][0]);ys.push(pts[0][1]);
  for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i],l=Math.hypot(x1-x0,y1-y0);if(!l)continue;
    while(need+STEP<=acc+l){need+=STEP;const t=(need-acc)/l;xs.push(x0+(x1-x0)*t);ys.push(y0+(y1-y0)*t);}acc+=l;}
  return {xs,ys,len:(xs.length-1)*STEP};}
function pathPos(pi,d){const p=G.map.paths[pi],n=p.xs.length-1;let f=d/STEP;if(f<0)f=0;if(f>=n)f=n-.001;const i=f|0,t=f-i;
  const x=p.xs[i]+(p.xs[i+1]-p.xs[i])*t,y=p.ys[i]+(p.ys[i+1]-p.ys[i])*t;return {x,y,dx:p.xs[i+1]-p.xs[i],dy:p.ys[i+1]-p.ys[i]};}

function levelMap(ci,li){const ch=CH[ci];const boss=li===5;
  return genMap(1000+ci*97+li*31,{minLen:li<2?30:29,maxLen:40,spots:[9,9,10,10,11,12][li],river:ch.river&&(li===2||li===5),side:ci>=2&&(li===1||li===3||li===4)&&!boss});}
function endlessMap(){return genMap(777,{minLen:32,maxLen:40,spots:13,river:true,side:true});}
// карта Босса недели: своя на каждую неделю (одинаковая у всех игроков)
function weekMap(w){const ch=CH[weekCh(w)];return genMap(5000+w*13,{minLen:30,maxLen:40,spots:12,river:!!ch.river,side:w%2===1});}

/* ================= волны ================= */
function cnt(t,budget){const d=EN[t];return clamp(Math.round(budget/d.hp*(d.fly?.6:1)),1,d.hp>=300?6:34);}
function spacing(t){const d=EN[t];return clamp(36/d.spd,.5,2)*(d.hp>=300?2.2:d.hp>=100?1.6:1);}
// бюджет волны — сколько «здоровья» (в единицах 1-й главы) выходит на дорогу
function budget(li,w){return 150*(1+.36*w)*(1+.08*li)*(li===4?.92:1);}
const isArmored=t=>{const d=EN[t];return d.armor>=.35||d.pres>=.4;};
function mkWaves(ci,li){const R0=mulberry(ci*131+li*17+5),ch=CH[ci],en=ch.en,nw=LEVEL_WAVES[li]+(ci>=4?1:0),boss=li===5;
  const unl=li===0?2:li===1?3:4,pool=en.slice(0,unl),prev=ci>0?CH[ci-1].en:[];const waves=[];
  const fix=LEVEL_FIX[ci+'-'+li]||1,hpm=w=>HP_MUL[ci]*(1+.06*li)*(1+.04*w)*fix;
  // первый уровень главы учит, а не ломает: если вся новая нечисть в броне, первые две волны — из прошлой главы, без брони
  const soft=li===0&&pool.every(isArmored)?prev.find(t=>!isArmored(t)&&!EN[t].fly&&EN[t].hp<300):null;
  for(let w=0;w<nw;w++){const g=[];const last=w===nw-1,B=budget(li,w)*(last?1.25:1);
    let main=w===0?pool[0]:(li>=1&&li<=3&&w===2)?pool[unl-1]:pick2(R0,pool);if(soft&&w<2)main=soft;
    const two=w>=2&&(R0()<.75||last);const n=cnt(main,B*(two?.62:1));g.push({t:main,n,iv:spacing(main),delay:0});
    if(two){let t2=pick2(R0,pool.filter(x=>x!==main));if(li>=3&&prev.length&&R0()<.3)t2=pick2(R0,prev);
      g.push({t:t2,n:cnt(t2,B*.42),iv:spacing(t2),delay:Math.min(12,n*spacing(main)*.4+2)});}
    if(boss&&last){g.push({t:ch.boss,n:1,iv:1,delay:10,hpm:HP_MUL[ci]*(1+.06*li)});}
    if(last&&LEAD.at[ci+'-'+li])g.push({t:LEAD.at[ci+'-'+li],n:1,iv:1,delay:9,lead:1});
    const nm=last?pick2(R0,WAVE_NAMES.mix):pick2(R0,WAVE_NAMES[main]||WAVE_NAMES.mix);
    waves.push({g,hpm:hpm(w),name:nm,path:w});}
  return waves;}
function pick2(r,a){return a[Math.floor(r()*a.length)];}
function endlessWave(w){const ci=Math.floor(w/5)%CH.length,en=CH[ci].en;
  const hpm=.9*Math.pow(1.1,w),g=[],B=150*(1+.2*Math.min(w,30));const main=w<3?en[0]:pick(en);const two=w>=2;
  g.push({t:main,n:cnt(main,B*(two?.62:1)),iv:spacing(main)*.9,delay:0});
  if(two){const t2=pick(en.filter(x=>x!==main));g.push({t:t2,n:cnt(t2,B*.42),iv:spacing(t2),delay:4});}
  if(w%10===9){g.push({t:CH[Math.floor(w/10)%CH.length].boss,n:1,iv:1,delay:6,hpm:hpm*.8});}
  return {g,hpm,name:w%10===9?Lg('Босс!','Boss!'):pick(WAVE_NAMES[main]||WAVE_NAMES.mix),path:w};}
// волны Босса недели: нечисть главы босса, сила как в осаде, составы по зерну недели (у всех одинаковые); в последней — босс
function weekWave(w){const ch=CH[G.ci],en=ch.en,R0=mulberry(G.wk.w*71+w*13+1),hpm=.9*Math.pow(1.1,w),B=150*(1+.2*w),g=[],last=w===WEEK_WAVES-1;
  const main=w<2?en[0]:pick2(R0,en),two=w>=2;
  g.push({t:main,n:cnt(main,B*(two?.62:1)),iv:spacing(main)*.9,delay:0});
  if(two){const t2=pick2(R0,en.filter(x=>x!==main));g.push({t:t2,n:cnt(t2,B*.42),iv:spacing(t2),delay:4});}
  if(last)g.push({t:ch.boss,n:1,iv:1,delay:8,hpm:WEEK_BOSS_HP});
  return {g,hpm,name:last?Lg('Босс недели!','Boss of the Week!'):pick2(R0,WAVE_NAMES[main]||WAVE_NAMES.mix),path:w};}
function nextWave(w){return G.wk?weekWave(w):endlessWave(w);}

/* ================= начало боя ================= */
function forgeN(k){const v=(S.forge||{})[k];return typeof v==='number'?v:0;}
// ступени кузницы заставы: объект {dmg1:1,...}; старый формат (число) переводим
function fT(type){let v=(S.forge||{})[type];if(typeof v==='number'){const o={};FORGE_ORDER[type].slice(0,v).forEach(([k])=>o[k]=1);S.forge[type]=v=o;}if(!v||typeof v!=='object'){S.forge=S.forge||{};S.forge[type]=v={};}return v;}
function fHas(type,k){const v=S.forge&&S.forge[type];if(typeof v==='number')return !!fT(type)[k];return !!(v&&v[k]);}
/* o: {ci,li} — уровень кампании; {endless:true} — осада; {week:N} — Босс недели; rule — правило испытания дня; diff — сложность (иначе из настроек) */
function newBattle(o){
  if(typeof cloudApply==='function')cloudApply(true);
  const wk=o.week!=null,endless=!!o.endless||wk,ci=wk?weekCh(o.week):o.ci,rule=o.rule||null;
  const map=wk?weekMap(o.week):endless?endlessMap():levelMap(ci,o.li);
  const lives=rule==='lives'?5:20+(S.village.wall||0)+3*forgeN('lives');
  const diff=endless?1:o.diff!=null?o.diff:diffNow();
  let coins=(wk?WEEK_COINS:endless?420:START_COINS[ci]+(rule?0:pityCoins(ci,o.li)))+25*(S.village.fair||0)+40*forgeN('coins');
  if(rule==='blitz')coins=Math.round(coins*1.33);if(rule==='nospell')coins=Math.round(coins*1.25);if(rule==='poor')coins=Math.round(coins*.8);
  const nk=!endless&&!rule&&diff<2?novK(ci,o.li):1;   // мягкий старт и «боевой дух» (data.js)
  G={endless,wk:wk?{w:o.week}:null,rule,diff,hpK:DIFF[diff].hp*nk,nov:Math.round((1-nk)*100),adv:null,advN:0,advCd:10,spendT:0,ci:wk?ci:endless?2:ci,li:endless?0:o.li,map,theme:wk?CH[ci]:endless?CH[2]:CH[ci],
    lives,maxLives:lives,coins,gone:[],kt:{},
    waves:endless?null:mkWaves(ci,o.li),wave:0,spawning:[],nextT:-1,started:false,
    en:[],tw:new Array(map.spots.length).fill(null),proj:[],fx:[],pools:[],pt:[],nums:[],bub:[],
    t:0,speed:1,paused:false,over:false,win:false,kills:0,leaks:0,earned:0,
    sp:{thunder:{cd:0},cat:{cd:0}},aim:null,sel:-1,preview:null,banner:null,shake:0,boss:null,contUsed:false,sayT:4,rev:0,tut:o.li===0&&ci===0&&!endless&&!rule?1:0,
    kolo:null,koloDone:0,koloAt:rand(35,95)};
  if(!endless)for(const k in G.sp){const u=SPELL_UNLOCK[k];if(ci<u[0]||(ci===u[0]&&o.li<u[1])||rule==='nospell')G.sp[k].locked=1;}
  renderBg();warmBattle();
  try{STAT.lvl(statLv(),statMode());if(G.tut===1&&!S.wins)STAT.ev('tut',{s:1});}catch(e){} // STAT: старт боя (уровень «1-3», осада, Босс недели)
  return G;}
// STAT: «уровень» боя — строка «глава-уровень» с 1 (1-1…8-6), осада — 'siege', Босс недели — 'week'; режим — сложность / испытание дня
function statLv(){return G.wk?'week':G.endless?'siege':(G.ci+1)+'-'+(G.li+1);}
function statMode(){return G.wk||G.endless?'':G.rule?'dch:'+G.rule:['easy','','hard'][G.diff]||'';}
// спрайты этого боя рисуем заранее (заставы, снаряды, нечисть уровня и подмога боссов), остальное — при первом показе
function warmBattle(){const keys=['spot','gate','skull','coin','arrow','ball','ballG','pie','flaskG','flaskP','flaskK','frog','egg'];for(const k in ART)if(/^(t_|bar_)[^~]*$/.test(k)){keys.push(k);const sk=k[0]==='t'?skinOf(k.split('_')[1]):skinOf('pushka')==='gold'?'gold':'';if(sk)keys.push(k+'~'+sk);}
  const ens=new Set(['kot','skel','snowb','rak','chert']);if(G.waves){for(const w of G.waves)for(const g of w.g)ens.add(g.t);}else for(const c of CH){for(const t of c.en)ens.add(t);ens.add(c.boss);}
  for(const t of ens)if(EN[t])keys.push(EN[t].art||t);sprWarm(keys);}
function towerBanned(t){return !!(G&&G.rule==='noarch'&&t==='arch');}
function towerUnlocked(t){if(towerBanned(t))return false;if(!G||G.endless)return true;const u=TW_UNLOCK[t];return G.ci>u[0]||(G.ci===u[0]&&G.li>=u[1]);}
function branchUnlocked(){if(!G||G.endless)return true;return G.ci>BRANCH_UNLOCK[0]||(G.ci===BRANCH_UNLOCK[0]&&G.li>=BRANCH_UNLOCK[1]);}

/* ================= заставы ================= */
function costMul(type){return (fHas(type,'cheap')?.9:1)*(1-.04*(S.village.smith||0));}
function buildCost(type){return Math.round(TW[type].cost[0]*costMul(type));}
function upCost(t,br){const d=TW[t.type];return Math.round((t.lvl<3?d.cost[t.lvl]:d.br[br-1].cost)*costMul(t.type));}
// итоговые свойства заставы с учётом кузницы и деревни
function tstat(type,lvl,br){const d=TW[type],b=lvl===4?d.br[br-1]:null,i=lvl-1,F=k=>fHas(type,k),sp=F('sp');
  const dm=(1+(F('dmg1')?.1:0)+(F('dmg2')?.15:0))*(1+.04*(S.village.range||0)),rm=F('rng')?1.1:1;
  const o={kind:d.kind,air:d.air,rng:(b?b.rng:d.rng[i])*rm,cd:b?b.cd:d.cd[i]};
  if(type==='arch'){o.dmg=(b?b.dmg:d.dmg[i])*dm;o.crit=(b&&b.crit||0)+(sp?.15:0);o.multi=b&&b.multi||1;}
  if(type==='pushka'){o.dmg=(b?b.dmg:d.dmg[i])*dm;o.splash=(b?b.splash:d.splash[i])*(sp?1.25:1);o.stun=b&&b.stun||0;o.fire=b&&b.fire?b.fire*dm:0;}
  if(type==='izba'){o.dps=(b?b.dps:d.dps[i])*dm;o.pool=b?b.pool:d.pool[i];o.slow=b?b.slow:d.slow[i];o.dur=d.dur+(sp?1.5:0);o.shred=b&&b.shred||0;o.stop=b&&b.stop||0;}
  if(type==='mag'){o.dmg=(b?b.dmg:d.dmg[i])*dm;o.chain=(b?b.chain:d.chain[i])+(sp?1:0);o.frog=b&&b.frog||0;}
  if(type==='dub'){o.dmg=(b?b.dmg:d.dmg[i])*dm;o.stun=(b?b.stun:d.stun[i])+(sp?.3:0);o.sleep=b&&b.sleep||0;o.greed=b&&b.greed||0;}
  return o;}
// облик (только внешний вид, куплен в деревне) — суффикс «~облик» у рисунка
function towerKey(t){const k='t_'+t.type+'_'+(t.lvl<4?t.lvl:t.lvl+(t.br===1?'a':'b')),sk=typeof skinOf==='function'?skinOf(t.type):'';return sk?k+'~'+sk:k;}
function tryBuild(i,type){const c=buildCost(type);if(!G||G.tw[i]||G.coins<c||!towerUnlocked(type))return false;
  const s=G.map.spots[i];G.coins-=c;G.tw[i]={i,type,lvl:1,br:0,x:s.x,y:s.y,cd:.3,inv:c,ang:-Math.PI/2,stunT:0,frostT:0,bounce:0,kills:0,dmgd:0,aim:(G.aimDef&&G.aimDef[type])||'first'};
  G.spendT=G.t;G.tw[i].st=tstat(type,1,0);G.tw[i].bounce=.35;SND.build();dust(s.x,s.y+6);G.built=(G.built||0)+1;if(G.tut===1){G.tut=2;G.advCd=1.5;if(!S.wins)STAT.ev('tut',{s:2});}return true;}
function tryUpgrade(i,br){const t=G&&G.tw[i];if(!t||t.lvl>=4)return false;if(t.lvl===3&&(!br||!branchUnlocked()))return false;
  const c=upCost(t,br);if(G.coins<c)return false;G.coins-=c;G.spendT=G.t;t.inv+=c;t.lvl++;if(t.lvl===4)t.br=br;t.st=tstat(t.type,t.lvl,t.br);t.bounce=.35;SND.up();dust(t.x,t.y+6);G.ups=(G.ups||0)+1;
  sparkle(t.x,t.y-20,'#ffd84a',14);return true;}
function sellTower(i){const t=G&&G.tw[i];if(!t)return false;const v=Math.round(t.inv*.7);G.coins+=v;G.tw[i]=null;G.gone.push(t);SND.sell();dust(t.x,t.y+6);addNum(t.x,t.y-20,'+'+v,'#ffd84a');return true;}
function refreshTowerStats(){if(G)for(const t of G.tw)if(t)t.st=tstat(t.type,t.lvl,t.br);}

/* ================= волны: запуск ================= */
function waveCount(){return G.wk?WEEK_WAVES:G.endless?Infinity:G.waves.length;}
// состав следующей волны (для подсказки «кто идёт»): в осаде волна случайная — считаем заранее и выпускаем её же
function peekWave(){if(!G||G.wave>=waveCount())return null;if(!G.endless)return G.waves[G.wave];
  if(!G.peek||G.peek.w!==G.wave)G.peek={w:G.wave,v:nextWave(G.wave)};return G.peek.v;}
// кто в волне: вид, летает ли, в броне ли, вожак/босс — для кнопки «Волна раньше» и окна по касанию черепа
function waveWho(w){const out=[];if(!w)return out;for(const g of w.g){if(out.some(o=>o.t===g.t&&!o.lead===!g.lead))continue;const d=EN[g.t];
  out.push({t:g.t,n:g.n,fly:!!d.fly,arm:isArmored(g.t),boss:!!d.boss,lead:!!g.lead});}return out;}
function callWave(){if(!G||G.over)return;if(G.wave>=waveCount())return;
  let bonus=0;if(G.nextT>0){bonus=Math.round(G.nextT*(1+G.ci*.15)*(G.endless?1.5:1));G.coins+=bonus;if(bonus>0)toast(Lg('Смелость в цене: +','Courage pays: +')+coinsTxt(bonus));}
  const w=G.endless?peekWave():G.waves[G.wave];G.wave++;G.started=true;G.nextT=-1;
  if(G.dchPrize&&G.wave===1&&S.dch&&!S.dch.tried){S.dch.tried=1;save();} // испытание дня: попытка — с первой волны (выход до неё награду не сжигает)
  for(const g of w.g)G.spawning.push({t:g.t,n:g.n,iv:g.iv,next:g.delay,hpm:g.hpm||w.hpm,lead:g.lead,pi:G.map.paths.length>1?(g.t===w.g[0].t?0:1)%G.map.paths.length:0,alt:G.map.paths.length>1});
  // баннер волны — небольшой, под HUD, 1,8 с (раньше крупно посреди поля на 3 с закрывал заставы — аудит 14)
  G.banner={title:(G.endless&&!G.wk?Lg('Волна ','Wave ')+G.wave:Lg('Волна '+G.wave+' из '+waveCount(),'Wave '+G.wave+' of '+waveCount())),sub:w.name,t:0,wave:1};SND.wave();if(G.tut===2){G.tut=3;if(!S.wins)STAT.ev('tut',{s:3});};
  if(G.wave===1){YG.start();G.advCd=10;}}
function spawnTick(dt){
  for(const s of G.spawning){if(s.n<=0)continue;s.next-=dt;while(s.next<=0&&s.n>0){s.n--;s.next+=s.iv;
      const pi=s.alt?(s.n%2):s.pi;spawnEnemy(s.t,pi,0,s.hpm,s.lead?{lead:1}:null);}}
  prune(G.spawning,s=>s.n>0);
  if(!G.spawning.length&&G.started&&G.nextT<0){const more=G.wave<waveCount();if(more)G.nextT=G.nextTot=G.rule==='blitz'?6:G.endless?(G.wave<=2?18:14):wavePause(G.ci,G.li,G.wave);}
  if(G.nextT>0){G.nextT-=dt;if(G.nextT<=0){G.nextT=0;callWave();}}
}

/* ================= нечисть ================= */
function spawnEnemy(type,pi,d,hpm,o){const b=EN[type],lead=!!(o&&o.lead),sz=(b.boss?b.sz:(b.sz||1)*ESC)*(lead?LEAD.sz:1),key=b.art||type;
  const hp=b.hp*hpm*(G.hpK||1)*(lead?LEAD.hp:1);
  const e={type,key,pi,d:d||0,off:b.boss?0:rand(-7,7),hp,max:hp,spd:b.spd*(G.endless?Math.min(1.35,1+G.wave*.006):1)*(G.rule==='fast'?1.2:1),x:0,y:-50,sz,r:ART[key].size*sz*.3,
    armor:b.armor||0,pres:b.pres||0,mres:b.mres||0,fly:!!b.fly,boss:!!b.boss,slow:0,slowT:0,slowV:0,stunT:0,sleepT:0,poison:0,poisonT:0,burn:0,burnT:0,shred:0,shredT:0,
    flash:0,face:1,t:rand(0,5),abT:b.boss?5:rand(2,5),ab2:b.boss?8:0,greedT:0,dead:false,hopT:0,hop:null,lives:(b.lives||1)*(lead?LEAD.lives:1),gold:b.gold*(lead?LEAD.gold:1)};
  if(o)Object.assign(e,o);
  if(lead){e.off=0;G.boss=e;e.spawnT=1;G.fx.push({k:'wave',x:0,y:0,r:70,t:0,dur:.8,col:'#9aff6a'});G.fx.push({k:'poof',x:0,y:0,t:0,dur:.5});SND.boss();say(e,pick(LEAD.say),3);G.banner={title:Lg('Вожак: ','Leader: ')+LEAD.n[type],sub:LEAD.about,tip:BOSS_TIP.lead,key:key,t:0,boss:1};G.shake=6;}
  if(!S.seen[type])S.seen[type]=1;   // и боссы — для Книги нечисти (в окне перед боем «новая нечисть» боссов не показывает)
  if(e.boss){G.boss=e;e.spawnT=1;G.fx.push({k:'wave',x:e.x,y:e.y,r:90,t:0,dur:.9,col:'#ff5a3a'});G.fx.push({k:'poof',x:e.x,y:e.y,t:0,dur:.6});SND.boss();say(e,pick(BOSS_SAY[type]),3);G.banner={title:b.n,sub:b.about,tip:BOSS_TIP[type],key:key,t:0,boss:1};G.shake=10;}
  else if(Math.random()<.05&&G.bub.length<2)say(e,pick(SAY_SPAWN),2.2);
  const p=pathPos(pi,e.d);e.x=p.x;e.y=p.y;if(e.boss||lead){G.fx[G.fx.length-2].x=G.fx[G.fx.length-1].x=clamp(p.x,20,WW-20);G.fx[G.fx.length-2].y=G.fx[G.fx.length-1].y=clamp(p.y,30,WH);}G.en.push(e);return e;}
function dmgEnemy(e,dmg,kind,src){if(e.dead||e.invul)return 0;
  let m=1;if(kind==='phys'){m*=1-Math.max(0,e.armor-(e.shredT>0?e.shred:0));m*=1-e.pres;}else if(kind==='magic')m*=1-e.mres;
  const v=dmg*m;if(src&&src.dmgd!=null)src.dmgd+=Math.min(v,Math.max(0,e.hp));e.hp-=v;e.flash=.07;if(e.hp<=0)killEnemy(e,src);return v;}
function killEnemy(e,src){
  if(e.type==='kosh'&&!e.eggDone){e.hp=1;if(!e.invul){e.invul=true;kosheyEgg(e);}return;}
  e.dead=true;G.kills++;G.kt[e.type]=(G.kt[e.type]||0)+1;SND.kill();burst(e.x,e.y-6,e.boss?'#ffd84a':'#ffffff',e.boss?40:6,e.boss?200:90);
  let gold=Math.round(e.gold*(G.endless?2*(1+G.wave*.03):GOLD_MUL[G.ci]));if(e.greedT>0)gold=Math.round(gold*1.5);if(G.rule==='fast')gold=Math.round(gold*1.2);
  if(gold>0){G.coins+=gold;G.earned+=gold;addNum(e.x,e.y-e.r-8,'+'+gold,'#ffd84a');SND.coin();coinFly(e.x,e.y-e.r,e.boss?6:gold>=15?2:1);}
  if(src&&src.kills!=null)src.kills++;
  // снежки из снеговика: e.max уже со сложностью (G.hpK), spawnEnemy умножит ещё раз — делим (аудит 14)
  if(EN[e.type].ab==='split'){for(const s of[-8,8])spawnEnemy('snowb',e.pi,Math.max(0,e.d+s),e.max/EN.snow.hp/(G.hpK||1));}
  if(e.lead){G.shake=10;G.banner={title:Lg('Вожак повержен!','Leader defeated!'),sub:LEAD.n[e.type]+Lg(' бежит в лес',' runs back to the woods'),t:0};for(let i=0;i<14;i++)later(i*.05,()=>sparkle(e.x+rand(-20,20),e.y+rand(-24,12),pick(['#ffd84a','#9aff6a','#fff']),3));if(G.boss===e)G.boss=null;}
  if(e.type==='egg'){const k=G.en.find(x=>x.type==='kosh'&&!x.dead);if(k){k.eggDone=true;k.invul=false;say(k,Lg('Моя игла-а-а!','My needle-e-e!'),2);killEnemy(k,null);}G.egg=null;}
  if(e.boss){G.shake=18;SND.win();S.bossKill=S.bossKill||{};S.bossKill[e.type]=1;G.bossKills=(G.bossKills||0)+1;G.banner={title:Lg('Победа над боссом!','Boss defeated!'),sub:EN[e.type].n+' '+defeatedWord(e.type),t:0};
    for(let i=0;i<24;i++)later(i*.05,()=>sparkle(e.x+rand(-30,30),e.y+rand(-30,20),pick(['#ffd84a','#ff8a3a','#fff']),3));if(G.boss===e)G.boss=null;
    if(G.wk&&e.type===CH[G.ci].boss){G.wkKill=true;G.wkT=G.t;later(1.2,victory);}}
}
function eggD(k){const P=G.map.paths[k.pi];const ok=d=>{const p=pathPos(k.pi,d);return p.x>=58&&p.x<=WW-58&&p.y>=80&&p.y<=WH-70;};
  for(let d=k.d+60;d<Math.min(P.len-60,k.d+320);d+=8)if(ok(d))return d;for(let d=k.d;d>0;d-=8)if(ok(d))return d;return Math.min(P.len-60,k.d+70);}
function kosheyEgg(k){const d=eggD(k);const egg=spawnEnemy('egg',k.pi,d,HP_MUL[G.ci]*(G.endless?Math.pow(1.1,G.wave/2):1));egg.off=0;egg.spd=0;G.egg=egg;
  say(k,Lg('Ха! Я бессмертный!','Ha! I’m deathless!'),2.5);G.banner={title:Lg('Разбей яйцо!','Break the egg!'),sub:Lg('Жми на яйцо пальцем — и заставы помогут','Tap the egg — your outposts will help'),t:0};SND.boss();}
function leak(e){e.dead=true;G.lives-=e.lives;G.leaks+=e.lives;if(e.fly)G.leakFly=(G.leakFly||0)+e.lives;SND.leak();G.shake=Math.max(G.shake,6);if(e.lead&&G.boss===e)G.boss=null;
  addNum(e.x,e.y-30,'−'+e.lives,'#ff5a4a');if(Math.random()<.35)sayAt(e.x,e.y-20,pick(SAY_LEAK));
  if(e.boss){G.leakedBoss={type:e.type,hp:e.hp,max:e.max,pi:e.pi,d:e.d};if(G.boss===e)G.boss=null;
    if(G.wk&&e.type===CH[G.ci].boss){G.wkPct=1-e.hp/e.max;if(G.lives>0){defeat();return;}}}if(e.type==='kosh'&&G.egg){G.egg.dead=true;G.egg=null;}
  if(G.lives<=0){G.lives=0;defeat();}}
function updEnemies(dt){
  for(const e of G.en){if(e.dead)continue;e.t+=dt;e.flash=Math.max(0,e.flash-dt);if(e.spawnT>0)e.spawnT-=dt;
    if(e.stunT>0)e.stunT-=dt;if(e.sleepT>0)e.sleepT-=dt;if(e.shredT>0)e.shredT-=dt;if(e.greedT>0)e.greedT-=dt;
    if(e.poisonT>0){e.poisonT-=dt;dmgEnemy(e,e.poison*dt,'magic',e.poisonSrc);if(e.dead)continue;}
    if(e.burnT>0){e.burnT-=dt;dmgEnemy(e,e.burn*dt,'fire',e.burnSrc);if(e.dead)continue;}
    const b=EN[e.type];
    if(b.regen&&e.hp<e.max)e.hp=Math.min(e.max,e.hp+e.max*b.regen*dt*(e.poisonT>0?.4:1));
    let sp=e.spd*(1-e.slow);if(b.ab==='rage'&&e.hp<e.max*.5){sp*=1.8;if(!e.raged){e.raged=1;say(e,Lg('Р-Р-Р-Р!','GRRRR!'),1.6);}}
    if(e.stunT>0||e.sleepT>0||e.hop)sp=0;if(e.invul&&e.type==='kosh')sp*=.45;
    // особые умения
    if(b.ab==='hop'){e.abT-=dt;if(e.abT<=0&&!e.hop&&e.stunT<=0&&e.sleepT<=0){e.abT=rand(4,6);e.hop={t:0,d0:e.d,d1:Math.min(G.map.paths[e.pi].len-20,e.d+42)};}}
    if(e.hop){e.hop.t+=dt/.45;e.d=lerp(e.hop.d0,e.hop.d1,Math.min(1,e.hop.t));if(e.hop.t>=1)e.hop=null;}
    if(b.ab==='heal'){e.abT-=dt;if(e.abT<=0){e.abT=4;let n=0;for(const o of G.en)if(!o.dead&&o!==e&&o.hp<o.max&&(o.x-e.x)**2+(o.y-e.y)**2<52*52){if(o.boss)continue;o.hp=Math.min(o.max,o.hp+o.max*.07);n++;plus(o.x,o.y-10);}
      if(n)G.fx.push({k:'ring',x:e.x,y:e.y,r:60,t:0,dur:.5,col:'#6aff8a'});}}
    if(e.boss)bossAI(e,dt);
    e.d+=sp*dt;
    const P=G.map.paths[e.pi];if(e.d>=P.len){leak(e);continue;}
    const p=pathPos(e.pi,e.d),l=Math.hypot(p.dx,p.dy)||1;e.x=p.x-p.dy/l*e.off;e.y=p.y+p.dx/l*e.off;if(Math.abs(p.dx)>.3)e.face=p.dx>0?1:-1;
    e.slow=0;}
  prune(G.en,e=>!e.dead);
}
/* ---------- боссы ---------- */
function towersNear(x,y,r){return G.tw.filter(t=>t&&(t.x-x)**2+(t.y-y)**2<r*r);}
// сила подмоги боссов: в кампании — как у главы, в Боссе недели — как волны недели (иначе подмога сильнее самих волн)
function minionHp(){return G.wk?2:HP_MUL[G.ci];}
function bossAI(e,dt){e.abT-=dt;e.ab2-=dt;const T=e.type;if(e.stunT>0||e.sleepT>0)return;
  if(T==='solo'&&e.abT<=0){e.abT=7;SND.whistle();say(e,Lg('Фью-ю-ю-ю!','Wheee-oo!'),1.6);G.fx.push({k:'wave',x:e.x,y:e.y,r:135,t:0,dur:.8,col:'#bfe6ff'});
    for(const t of towersNear(e.x,e.y,135)){t.stunT=2.5;}}
  if(T==='yaga'){if(e.abT<=0){e.abT=6;const d1=Math.min(G.map.paths[e.pi].len-90,e.d+70);if(d1>e.d){e.hop={t:0,d0:e.d,d1};say(e,Lg('Ух, полетели!','Whee, off we go!'),1.4);}}
    if(e.ab2<=0){e.ab2=9;for(let i=0;i<3;i++)spawnEnemy('kot',e.pi,Math.max(0,e.d-10-i*12),minionHp()*(G.endless?Math.pow(1.1,G.wave/3):1.2));}}
  if(T==='gory'){if(e.abT<=0){e.abT=5.5;const ts=towersNear(e.x,e.y,150);if(ts.length){const t=pick(ts);t.stunT=3;t.burnFx=3;SND.boom();
      G.fx.push({k:'fireball',x:e.x,y:e.y-20,x1:t.x,y1:t.y-10,t:0,dur:.45});say(e,pick(Lg(['Кха!','Пых!','Огоньку?'],['Hack!','Puff!','Need a light?'])),1.2);}}
    const ph=e.hp<e.max*.33?2:e.hp<e.max*.66?1:0;if(ph>(e.ph||0)){e.ph=ph;e.spd*=1.2;say(e,Lg('Минус голова! Но мы не сдаёмся!','One head down! But we won’t give up!'),2);G.shake=10;}}
  if(T==='kosh'&&e.ab2<=0){e.ab2=9;for(let i=0;i<2;i++)spawnEnemy('skel',e.pi,Math.max(0,e.d-14-i*14),minionHp());}
  if(T==='karach'){if(e.abT<=0){e.abT=7;G.fx.push({k:'wave',x:e.x,y:e.y,r:130,t:0,dur:.8,col:'#dff4ff'});say(e,Lg('Заморожу!','I’ll freeze you!'),1.4);SND.whistle();
      for(const t of towersNear(e.x,e.y,130))t.frostT=4;}
    if(e.ab2<=0){e.ab2=10;for(let i=0;i<2;i++)spawnEnemy('snowb',e.pi,Math.max(0,e.d-12-i*10),minionHp());}}
  if(T==='morcar'){if(e.abT<=0){e.abT=8;G.fx.push({k:'wave',x:e.x,y:e.y,r:150,t:0,dur:.9,col:'#6ad8ff'});say(e,Lg('Прилив!','High tide!'),1.4);SND.splash();
      for(const o of G.en)if(!o.dead&&(o.x-e.x)**2+(o.y-e.y)**2<150*150){o.hp=Math.min(o.max,o.hp+o.max*(o.boss?.04:.15));plus(o.x,o.y-10);}}
    if(e.ab2<=0){e.ab2=11;for(let i=0;i<2;i++)spawnEnemy('rak',e.pi,Math.max(0,e.d-14-i*16),minionHp());}}
  if(T==='tugar'){if(e.abT<=0&&!e.invul){e.abT=10;e.invul=true;e.shieldT=2.5;say(e,Lg('Щит!','Shield!'),1.2);}
    if(e.shieldT>0){e.shieldT-=dt;if(e.shieldT<=0)e.invul=false;}
    if(e.ab2<=0){e.ab2=10;for(let i=0;i<3;i++)spawnEnemy('chert',e.pi,Math.max(0,e.d-10-i*12),minionHp());}}
  if(T==='liho'){if(e.abT<=0){e.abT=6;const ts=towersNear(e.x,e.y,175).sort((a,b)=>b.inv-a.inv);if(ts.length){const t=ts[0];t.stunT=4;t.sleepFx=4;
      G.fx.push({k:'beam',x:e.x,y:e.y-30,x1:t.x,y1:t.y-20,t:0,dur:.5});say(e,Lg('Спи, заставушка…','Sleep, little outpost…'),1.5);}}
    if(e.ab2<=0){e.ab2=12;const d1=Math.min(G.map.paths[e.pi].len-100,e.d+60);if(d1>e.d){poof(e.x,e.y);e.d=d1;}}}
}

/* ================= заставы: стрельба ================= */
function inRange(t,e,r){return (e.x-t.x)**2+(e.y-t.y)**2<=r*r;}
function targetFirst(t,r,air,skip){let best=null,bd=-1;for(const e of G.en){if(e.dead||(e.fly&&!air)||(skip&&skip.has(e)))continue;
  const pr=(e.type==='egg'?1e6:0)+e.d/(G.map.paths[e.pi].len)*1e4;if(pr>bd&&inRange(t,e,r)){bd=pr;best=e;}}return best;}
// выбор цели заставы (t.aim): «первый» — прежний targetFirst; яйцо Кощея — всегда первым
function targetFor(t,r,air,skip){const m=t.aim;if(!m||m==='first')return targetFirst(t,r,air,skip);let best=null,bd=-Infinity;const cr=m==='crowd'?(t.st.splash||t.st.pool||40):0;
  for(const e of G.en){if(e.dead||(e.fly&&!air)||(skip&&skip.has(e))||!inRange(t,e,r))continue;const pr=e.d/G.map.paths[e.pi].len;let v;
    if(e.type==='egg')v=1e12;
    else if(m==='strong')v=e.hp*10+pr;
    else if(m==='near')v=-((e.x-t.x)**2+(e.y-t.y)**2)+pr;
    else if(m==='fly')v=(e.fly?1e5:0)+pr*1e4;
    else{let n=0;for(const o of G.en)if(!o.dead&&!o.fly&&(o.x-e.x)**2+(o.y-e.y)**2<cr*cr)n++;v=n*1e5+pr*1e4;}
    if(v>bd){bd=v;best=e;}}
  return best;}
function predict(e,tt){if(e.spd<=0)return {x:e.x,y:e.y};const sp=e.spd*(1-e.slow)*(e.stunT>0||e.sleepT>0?0:1);const p=pathPos(e.pi,Math.min(G.map.paths[e.pi].len,e.d+sp*tt));return {x:p.x,y:p.y};}
function updTowers(dt){
  for(const t of G.tw){if(!t)continue;if(t.bounce>0)t.bounce-=dt;if(t.frostT>0)t.frostT-=dt;if(t.burnFx>0)t.burnFx-=dt;if(t.sleepFx>0)t.sleepFx-=dt;
    if(t.stunT>0){t.stunT-=dt;continue;}
    const st=t.st;t.cd-=dt*(t.frostT>0?.5:1);
    if(t.type==='dub'&&st.sleep){for(const e of G.en)if(!e.dead&&!e.fly&&inRange(t,e,st.rng)){e.slow=Math.max(e.slow,st.sleep);e.greedT=.3;}}
    if(t.cd>0)continue;
    if(t.type==='arch'){const skip=new Set();let n=0;for(let k=0;k<st.multi;k++){const e=targetFor(t,st.rng,1,skip);if(!e)break;skip.add(e);n++;
        const crit=Math.random()<st.crit;G.proj.push({k:'arrow',x:t.x+(k-1)*5,y:t.y-30,tg:e,tx:e.x,ty:e.y,sp:460,dmg:st.dmg*(crit?2:1),crit,src:t});}
      if(n){t.cd=st.cd;SND.arrow();}}
    else if(t.type==='pushka'){const e=targetFor(t,st.rng,0);if(e){t.cd=st.cd;const T=.65,p=predict(e,T);t.ang=Math.atan2(p.y-(t.y-14),p.x-t.x);
        const bx=t.x+Math.cos(t.ang)*20,by=t.y-14+Math.sin(t.ang)*20;G.proj.push({k:'ball',x0:bx,y0:by,x1:p.x,y1:p.y,t:0,T,dmg:st.dmg,splash:st.splash,stun:st.stun,fire:st.fire,src:t,big:t.lvl===4&&t.br===1,pie:t.lvl===4&&t.br===2});
        SND.cannon();t.recoil=.18;smoke(bx,by);G.fx.push({k:'flash',x:bx,y:by,t:0,dur:.14});}}
    else if(t.type==='izba'){const e=targetFor(t,st.rng,0);if(e){t.cd=st.cd;const T=.7,p=predict(e,T);
        G.proj.push({k:'flask',x0:t.x+14,y0:t.y-4,x1:p.x,y1:p.y,t:0,T,st,src:t,key:t.lvl===4?(t.br===1?'flaskP':'flaskK'):'flaskG'});}}
    else if(t.type==='mag'){const e=targetFor(t,st.rng,1);if(e){t.cd=st.cd;zap(t,e,st);}}
    else if(t.type==='dub'){let any=false;for(const e of G.en)if(!e.dead&&!e.fly&&inRange(t,e,st.rng)){any=true;break;}
      if(any){t.cd=st.cd;SND.roots();G.fx.push({k:'ring',x:t.x,y:t.y+4,r:st.rng,t:0,dur:.45,col:'#8a5a2e'});t.bounce=.3;
        for(const e of G.en)if(!e.dead&&!e.fly&&inRange(t,e,st.rng)){G.fx.push({k:'root',x:e.x,y:e.y,t:0,dur:.55});dmgEnemy(e,st.dmg,'phys',t);
          if(!e.dead){e.stunT=Math.max(e.stunT,st.stun*(e.boss?.3:1));if(st.greed)e.greedT=1;}}}}
  }
}
function zap(t,e,st){const pts=[[t.x,t.y-(t.lvl>=3?56:48)]];const hit=new Set();let cur=e,dmg=st.dmg;SND.zap();
  for(let k=0;k<=st.chain&&cur;k++){hit.add(cur);pts.push([cur.x,cur.y-8]);
    if(st.frog&&!cur.boss&&cur.type!=='egg'&&Math.random()<st.frog){frogify(cur,t);}else dmgEnemy(cur,dmg,'magic',t);
    dmg*=.8;let nx=null,bd=75*75;for(const o of G.en){if(o.dead||hit.has(o))continue;const d=(o.x-cur.x)**2+(o.y-cur.y)**2;if(d<bd){bd=d;nx=o;}}cur=nx;}
  G.fx.push({k:'bolt',pts:pts.map(p=>[p[0],p[1]]),t:0,dur:.18,col:t.lvl===4&&t.br===2?'#9aff7a':'#bfe6ff',seed:Math.random()*1000});}
function frogify(e,src){const x=e.x,y=e.y;killEnemy(e,src);SND.frog();G.fx.push({k:'frog',x,y,t:0,dur:1.2,vx:rand(-30,30)});if(Math.random()<.4)sayAt(x,y-16,Lg('Ква!','Ribbit!'));}
function updProj(dt){
  for(const p of G.proj){
    if(p.k==='arrow'){if(p.tg&&!p.tg.dead){p.tx=p.tg.x;p.ty=p.tg.y-(p.tg.fly?18:6);}const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy),mv=p.sp*dt;p.a=Math.atan2(dy,dx);
      if(d<=mv){p.done=1;if(p.tg&&!p.tg.dead){hitSpark(p.tx,p.ty);dmgEnemy(p.tg,p.dmg,'phys',p.src);if(p.crit)addNum(p.tx,p.ty-14,Lg('В глаз!','Bullseye!'),'#ffef8a');}}else{p.x+=dx/d*mv;p.y+=dy/d*mv;}}
    else{p.t+=dt;if(p.t>=p.T){p.done=1;land(p);}}}
  prune(G.proj,p=>!p.done);}
function land(p){
  if(p.k==='ball'){SND.boom();G.fx.push({k:'boom',x:p.x1,y:p.y1,r:p.splash,t:0,dur:.35,pie:p.pie});G.shake=Math.max(G.shake,p.big?5:2);
    for(const e of G.en)if(!e.dead&&!e.fly&&(e.x-p.x1)**2+(e.y-p.y1)**2<(p.splash+e.r)**2){dmgEnemy(e,p.dmg,'phys',p.src);if(p.stun&&!e.dead)e.stunT=Math.max(e.stunT,p.stun*(e.boss?.3:1));}
    if(p.fire)G.pools.push({x:p.x1,y:p.y1,r:p.splash*.8,t:0,dur:3,dps:p.fire,fire:1,src:p.src});}
  if(p.k==='flask'){SND.splash();const s=p.st;G.pools.push({x:p.x1,y:p.y1,r:s.pool,t:0,dur:s.dur,dps:s.dps,slow:s.slow,shred:s.shred,stop:s.stop,src:p.src,
      col:s.stop?'#ff9ac8':s.shred?'#b86bff':'#7aff6a'});}}
function updPools(dt){
  for(const q of G.pools){q.t+=dt;for(const e of G.en){if(e.dead||e.fly||(e.x-q.x)**2+(e.y-q.y)**2>(q.r+e.r*.5)**2)continue;
      if(q.fire){if(!(e.burnT>0&&e.burn>q.dps))e.burnSrc=q.src;e.burn=Math.max(e.burnT>0?e.burn:0,q.dps);e.burnT=.4;}
      else{if(!(e.poisonT>0&&e.poison>q.dps))e.poisonSrc=q.src;e.poison=Math.max(e.poisonT>0?e.poison:0,q.dps);e.poisonT=.5;e.slow=Math.max(e.slow,q.slow*(e.boss?.5:1));e.greedT=Math.max(e.greedT,0);
        if(q.shred){e.shred=q.shred;e.shredT=.5;}if(q.stop&&!e.boss&&!e.stopped&&Math.random()<q.stop){e.stopped=1;e.stunT=1.5;sayAt(e.x,e.y-18,Lg('Увяз!','Stuck!'));}}
}}
  prune(G.pools,q=>q.t<q.dur);}

/* ================= чары ================= */
function spellCd(k){let cd=SPELLS[k].cd;if(k==='thunder'&&forgeN('thunder')>=3)cd-=10;if(k==='cat'&&forgeN('cat')>=3)cd-=15;return cd*(1-.08*(S.village.herb||0));}
function castThunder(x,y){const f=forgeN('thunder'),dmg=SPELLS.thunder.dmg*Math.pow(1.35,f)*(G.endless?Math.pow(1.08,G.wave):HP_MUL[G.ci]*.8+.2),r=SPELLS.thunder.r*(f>=2?1.2:1);
  G.sp.thunder.cd=spellCd('thunder');SND.thunder();G.shake=12;G.spells=(G.spells||0)+1;G.fx.push({k:'thunder',x,y,r,t:0,dur:.6});
  for(const e of G.en)if(!e.dead&&(e.x-x)**2+(e.y-y)**2<(r+e.r)**2){dmgEnemy(e,dmg,'true');if(!e.dead)e.stunT=Math.max(e.stunT,.5);}}
function castCat(){const dur=SPELLS.cat.dur+.6*Math.min(2,forgeN('cat'));G.sp.cat.cd=spellCd('cat');SND.purr();G.spells=(G.spells||0)+1;
  for(const e of G.en)if(!e.dead)e.sleepT=Math.max(e.sleepT,e.boss?dur*.35:dur);G.fx.push({k:'cat',t:0,dur:dur});}
function spellReady(k){return G&&!G.sp[k].locked&&G.sp[k].cd<=0;}

/* ================= эффекты ================= */
function prune(a,f){let j=0;for(let i=0;i<a.length;i++)if(f(a[i]))a[j++]=a[i];a.length=j;return a;}
function later(t,fn){(G.later||(G.later=[])).push({t,fn});}
function addNum(x,y,v,col){if(G.nums.length>40)G.nums.shift();G.nums.push({x,y,v,t:0,col});}
function burst(x,y,col,n,sp){for(let i=0;i<n;i++){if(G.pt.length>400)return;const a=rand(0,TAU),v=rand(.3,1)*(sp||100);G.pt.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,t:0,dur:rand(.3,.6),col,s:rand(1.5,3.2)});}}
function sparkle(x,y,col,n){for(let i=0;i<n;i++){if(G.pt.length>400)return;G.pt.push({x:x+rand(-10,10),y:y+rand(-6,6),vx:rand(-40,40),vy:rand(-80,-20),t:0,dur:rand(.4,.8),col,s:rand(1.5,3),add:1});}}
function dust(x,y){for(let i=0;i<12&&G.pt.length<=400;i++){const a=rand(0,TAU);G.pt.push({x:x+Math.cos(a)*14,y:y+Math.sin(a)*6,vx:Math.cos(a)*50,vy:Math.sin(a)*20-10,t:0,dur:rand(.4,.7),col:'#d8c8a8',s:rand(2.5,4.5)});}}
function smoke(x,y){for(let i=0;i<5&&G.pt.length<=400;i++)G.pt.push({x,y,vx:rand(-20,20),vy:rand(-30,-10),t:0,dur:rand(.4,.7),col:'#e8e4dc',s:rand(2.5,4.5)});}
// сочность (boost 02.10): искры попадания стрелы и монета, летящая в кошель (цель — значок монет на HUD, считает ui.js)
function hitSpark(x,y){for(let i=0;i<2&&G.pt.length<300;i++)G.pt.push({x,y,vx:rand(-50,50),vy:rand(-60,-10),t:0,dur:rand(.18,.3),col:'#fff6d0',s:rand(1,1.8)});}
function coinFly(x,y,n){let k=0;for(const f of G.fx)if(f.k==='coin')k++;for(let i=0;i<n&&k<14;i++,k++)G.fx.push({k:'coin',x:x+rand(-6,6),y:y+rand(-4,4),t:-i*.06,dur:.6,ax:rand(-24,24)});}
function plus(x,y){G.nums.push({x,y,v:'+',t:0,col:'#6aff8a'});}
function poof(x,y){G.fx.push({k:'poof',x,y,t:0,dur:.5});}
// реплики держатся не меньше 2,5 с + 50 мс на знак (успеть прочитать)
function bubDur(s,d){return Math.max(d||0,2.5+.05*s.length);}
// одинаковая реплика рядом ещё видна — второй пузырь не добавляем («Увяз! Увяз!» друг на друге)
function bubDup(x,y,s){return G.bub.some(b=>b.s===s&&b.t<b.dur*.8&&Math.abs(b.e.x-x)<70&&Math.abs(b.e.y-y)<50);}
function say(e,s,dur){if(bubDup(e.x,e.y,s)&&!G.bub.some(b=>b.e===e))return;G.bub=G.bub.filter(b=>b.e!==e);if(G.bub.length>3)G.bub.shift();G.bub.push({e,s,t:0,dur:bubDur(s,dur)});}
function sayAt(x,y,s){if(bubDup(x,y,s))return;if(G.bub.length>3)G.bub.shift();G.bub.push({e:{x,y,r:0,fixed:1},s,t:0,dur:bubDur(s)});}

/* ================= главный шаг ================= */
function update(dt){if(!G||G.over)return;G.t+=dt;
  if(G.later){for(const l of G.later){l.t-=dt;if(l.t<=0){l.fn();l.done=1;}}prune(G.later,l=>!l.done);}
  for(const k in G.sp)if(G.sp[k].cd>0)G.sp[k].cd-=dt;
  spawnTick(dt);updPools(dt);updTowers(dt);updEnemies(dt);updProj(dt);
  if(G.over)return;
  for(const f of G.fx){f.t+=dt;if(f.k==='frog'){f.x+=f.vx*dt;}else if(f.k==='coin'&&f.t>=f.dur&&!f.hit){f.hit=1;if(typeof coinBump==='function')coinBump();}}prune(G.fx,f=>f.t<f.dur);
  for(const p of G.pt){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=120*dt;p.vx*=.96;}prune(G.pt,p=>p.t<p.dur);
  for(const n of G.nums)n.t+=dt;prune(G.nums,n=>n.t<1);
  for(const b of G.bub)b.t+=dt;prune(G.bub,b=>b.t<b.dur&&(!b.e.dead||b.e.fixed));
  if(G.banner){G.banner.t+=dt;if(G.banner.t>(G.banner.wave?1.8:G.banner.key?4.2:3))G.banner=null;}
  koloTick(dt);advTick(dt);
  G.shake=Math.max(0,G.shake-dt*30);if(!S.shake)G.shake=0;
  if(!G.over&&G.started&&!G.endless&&G.wave>=G.waves.length&&!G.spawning.length&&!G.en.length)victory();
}
/* ---------- советчик новичка (boost 02.10): монеты лежат без дела — подсветить, куда их потратить.
   Диагностика: новичок ставит 2–3 заставы «как сказали» и смотрит, монеты копятся, уровень проигран. Только кампания, глава 1 или первые 8 побед.
   Тут только выбор совета (G.adv); реплику воеводы показывает hudTick в ui.js, кольцо и стрелку — render. ---------- */
function advOn(){return !SHOT&&!G.endless&&!G.rule&&(G.ci===0||S.wins<8)&&G.tut!==1;}
function spotCov(i){const c=G._cv||(G._cv=[]);if(c[i]==null){const s=G.map.spots[i];let n=0;for(const P of G.map.paths)for(let k=0;k<P.xs.length;k+=4)if((P.xs[k]-s.x)**2+(P.ys[k]-s.y)**2<105*105)n++;c[i]=n;}return c[i];}
function advPick(){const tws=G.tw.filter(Boolean),empty=[];G.map.spots.forEach((s,i)=>{if(!G.tw[i])empty.push(i);});
  let cheap=1e9;for(const t of TW_ORDER)if(towerUnlocked(t))cheap=Math.min(cheap,buildCost(t));
  const canB=empty.length&&G.coins>=cheap,ups=tws.filter(t=>t.lvl<3&&G.coins>=upCost(t)),bestE=()=>empty.sort((a,b)=>spotCov(b)-spotCov(a))[0];
  if(canB&&tws.length<Math.min(G.map.spots.length,3+G.wave))return {k:'build',i:bestE()};
  if(ups.length){ups.sort((a,b)=>a.lvl-b.lvl||spotCov(b.i)-spotCov(a.i));return {k:'up',i:ups[0].i};}
  return canB?{k:'build',i:bestE()}:null;}
// страховка самого первого боя (заход 2): пока нет ни одной победы, на 1-1 при каждом новом прорыве дружина сама тратит лежащие монеты —
// ставит стрельцов на лучшее место или улучшает заставу. Новичок, который поставил одну заставу и смотрит, первый бой не проигрывает.
// То же на 1-1…1-3 после поражения на этом уровне (повторная попытка).
function novAutoOn(){if(G.ci||G.li>2)return false;return G.li===0&&!S.wins||!!(S.lose&&S.lose[G.ci+'-'+G.li]);}   // первый бой; на 1-1…1-3 — ещё и после поражения на этом уровне
function novAuto(){if(!novAutoOn()||G.leaks<=(G.autoLk||0)||G.t-G.spendT<1.5)return;const p=advPick();G.autoLk=G.leaks;if(!p)return;
  if(p.k==='build'?tryBuild(p.i,'arch'):tryUpgrade(p.i)){G.auto=(G.auto||0)+1;G.adv=null;G.autoSay=1;}}
function advTick(dt){if(!advOn())return;novAuto();const a=G.adv;
  if(a){a.t+=dt;const t=G.tw[a.i];if(a.t>9||(a.k==='build'?!!t:!t||t.lvl!==a.lv))G.adv=null;return;}
  G.advCd-=dt;if(G.advCd>0||G.advN>=14||typeof ringI!=='undefined'&&ringI>=0)return;
  const hot=G.leaks>(G.advLk||0),pre=G.tut===2&&!G.started;   // обучение: после первой заставы стрелка на следующее место — сразу (реплика воеводы уже говорит «поставь ещё»)
  if(G.t-G.spendT<(pre?1.5:hot?3:7))return;
  const p=advPick();if(!p)return;G.advN++;G.advLk=G.leaks;G.advCd=pre?1.5:G.advN<=2?5:12;
  G.adv={k:p.k,i:p.i,t:0,lv:p.k==='up'?G.tw[p.i].lvl:0,n:G.advN,hot};}
/* ---------- Колобок: живой объект на карте (аудит 14). Раз за бой катится поперёк поля; поймал пальцем — монеты ---------- */
function koloTick(dt){const k=G.kolo;
  if(k){k.t+=dt;if(k.got){k.gt+=dt;if(k.gt>.7)G.kolo=null;return;}k.x+=k.v*dt;k.rot+=k.v*dt/11;if(k.x<-50||k.x>WW+50)G.kolo=null;return;}
  if(G.koloDone||!G.started||G.t<G.koloAt||G.rule)return;G.koloDone=1;
  const dir=Math.random()<.5?1:-1;G.kolo={x:dir>0?-30:WW+30,y:rand(130,WH-150),v:dir*52,t:0,rot:0,got:false,gt:0};
  sayAt(clamp(G.kolo.x,50,WW-50),G.kolo.y-26,Lg('Я от бабушки ушёл!','I ran away from Grandma!'));}
function koloGold(){return G.endless?20+Math.min(40,G.wave):12+8*G.ci;}
function koloTap(){const k=G.kolo;if(!k||k.got)return;k.got=true;const v=koloGold();G.coins+=v;G.kolos=(G.kolos||0)+1;
  SND.coin();sparkle(k.x,k.y-8,'#ffd84a',12);addNum(k.x,k.y-26,'+'+v,'#ffd84a');sayAt(k.x,k.y-30,pick(Lg(['А от тебя не ушёл!','Ой, поймали!','Держи монетки!'],['But not from you!','Oops, caught!','Here, have some coins!'])));G.redraw=1;}
function drawKolo(){const k=G.kolo;if(!k)return;const c=ctx,hop=Math.abs(Math.sin(k.t*7))*5,a=k.got?Math.max(0,1-k.gt/.7):1,sc=k.got?1+k.gt*.8:1,x=k.x,y=k.y-hop,r=13*sc;
  worldT();c.globalAlpha=a;c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(x,k.y+9,10,3.5,0,0,TAU);c.fill();
  const q=c.createRadialGradient(x-4,y-5,2,x,y,r);q.addColorStop(0,'#ffe9a0');q.addColorStop(1,'#e0962a');c.fillStyle=q;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
  c.strokeStyle='#9a5a14';c.lineWidth=1.2;c.stroke();
  // корочка крутится — видно, что катится
  c.strokeStyle='rgba(150,80,20,.45)';c.lineWidth=1;for(let i=0;i<3;i++){const an=k.rot+i*2.1;c.beginPath();c.arc(x+Math.cos(an)*r*.55,y+Math.sin(an)*r*.55,1.6,0,TAU);c.stroke();}
  const f=k.v>0?1:-1;c.fillStyle='#2a1608';c.beginPath();c.arc(x+f*2-2.5,y-2,1.5,0,TAU);c.arc(x+f*2+2.5,y-2,1.5,0,TAU);c.fill();
  c.strokeStyle='#2a1608';c.lineWidth=1.2;c.beginPath();c.arc(x+f*2,y+1.5,3.2,.15*Math.PI,.85*Math.PI);c.stroke();
  c.fillStyle='rgba(255,110,90,.45)';c.beginPath();c.arc(x+f*2-5,y+1.5,1.8,0,TAU);c.arc(x+f*2+5,y+1.5,1.8,0,TAU);c.fill();c.globalAlpha=1;}
function victory(){if(G.over)return;G.over=true;G.win=true;YG.stop();later(0,()=>{});SND.win();const g=G;g.endT=setTimeout(()=>{if(G===g){onBattleEnd(true);cloudApply();}},900);}
function defeat(){if(G.over)return;G.over=true;G.win=false;YG.stop();SND.lose();const g=G;g.endT=setTimeout(()=>{if(G===g){onBattleEnd(false);cloudApply();}},700);}   // облако, пришедшее в бою, сводим уже на экране итогов
function continueBattle(){STAT.lvl(statLv(),'cont');G.over=false;G.lives=10;G.maxLives=Math.max(G.maxLives,G.lives);G.contUsed=true;
  for(const e of G.en){const P=G.map.paths[e.pi];if(e.d>P.len-140&&!e.boss){e.dead=true;burst(e.x,e.y,'#ffffff',8,90);}else if(e.boss)e.d=Math.max(0,e.d-160);}
  G.en=G.en.filter(e=>!e.dead);
  if(G.leakedBoss){const b=G.leakedBoss;G.leakedBoss=null;const e=spawnEnemy(b.type,b.pi,Math.max(0,b.d-420),1);e.max=b.max;e.hp=Math.max(b.hp,b.max*.25);}
  castCat();G.sp.cat.cd=0;YG.start();}

/* ================= отрисовка ================= */
function renderBg(){if(!G)return;const k=VIEW.B;bgCv=bgCv||document.createElement('canvas');bgCv.width=cv.width;bgCv.height=cv.height;
  const g=bgCv.getContext('2d'),th=G.theme,gr=th.ground,R0=mulberry(G.map.seed+5);g.setTransform(k,0,0,k,VIEW.ox*VIEW.dpr,VIEW.oy*VIEW.dpr);g.lineJoin='round';g.lineCap='round';
  const x0=-VIEW.ox/VIEW.s-10,y0=-VIEW.oy/VIEW.s-10,x1=(VIEW.W-VIEW.ox)/VIEW.s+10,y1=(VIEW.H-VIEW.oy)/VIEW.s+10;
  g.fillStyle=gr.base;g.fillRect(x0,y0,x1-x0,y1-y0);
  for(let i=0;i<70;i++){const x=lerp(x0,x1,R0()),y=lerp(y0,y1,R0()),r=40+R0()*90,col=R0()<.5?gr.hi:gr.lo;const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,rgba(col,.7));q.addColorStop(1,rgba(col,0));g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);}
  g.strokeStyle=rgba(gr.grass,.5);g.lineWidth=1.1;const area=(x1-x0)*(y1-y0);
  for(let i=0;i<area/500;i++){const x=lerp(x0,x1,R0()),y=lerp(y0,y1,R0()),s=3+R0()*4;g.beginPath();g.moveTo(x-2,y);g.quadraticCurveTo(x-3,y-s*.6,x-4,y-s);g.moveTo(x,y);g.lineTo(x,y-s*1.2);g.moveTo(x+2,y);g.quadraticCurveTo(x+3,y-s*.6,x+4,y-s);g.stroke();}
  for(let i=0;i<area/2600;i++){const x=lerp(x0,x1,R0()),y=lerp(y0,y1,R0()),col=gr.flow[Math.floor(R0()*gr.flow.length)];for(let j=0;j<5;j++){const a=j/5*TAU;g.beginPath();g.arc(x+Math.cos(a)*2,y+Math.sin(a)*2,1.4,0,TAU);g.fillStyle=col;g.fill();}}
  const M=G.map;
  // река
  if(M.river>=0){const ry=M.river*CELL;const q=g.createLinearGradient(0,ry,0,ry+CELL);q.addColorStop(0,'#2a6a9a');q.addColorStop(.5,'#3a8ac0');q.addColorStop(1,'#2a6a9a');
    g.fillStyle=rgba('#5a4a2a',.5);g.fillRect(x0,ry-3,x1-x0,CELL+6);g.fillStyle=q;g.fillRect(x0,ry+1,x1-x0,CELL-2);
    g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1.2;for(let x=x0;x<x1;x+=26){const yy=ry+8+((x/26|0)%3)*9;g.beginPath();g.moveTo(x,yy);g.quadraticCurveTo(x+6,yy-3,x+12,yy);g.stroke();}}
  // дорога
  const road=th.road;
  for(const [w,col] of[[36,rgba('#000000',.12)],[33,road.edge],[27,road.fill]]){for(const P of M.paths){g.beginPath();g.moveTo(P.xs[0],P.ys[0]+(w===36?3:0));for(let i=1;i<P.xs.length;i++)g.lineTo(P.xs[i],P.ys[i]+(w===36?3:0));g.lineWidth=w;g.strokeStyle=col;g.stroke();}}
  for(const P of M.paths){g.beginPath();g.moveTo(P.xs[0],P.ys[0]);for(let i=1;i<P.xs.length;i++)g.lineTo(P.xs[i],P.ys[i]);g.lineWidth=13;g.strokeStyle=rgba(road.hi,.7);g.stroke();}
  for(const P of M.paths){for(let i=4;i<P.xs.length-1;i+=(road.deco==='planks'?4:7)){const x=P.xs[i],y=P.ys[i],dx=P.xs[i+1]-x,dy=P.ys[i+1]-y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
      if(road.deco==='planks'){g.beginPath();g.moveTo(x+nx*13,y+ny*13);g.lineTo(x-nx*13,y-ny*13);g.lineWidth=1.1;g.strokeStyle=rgba('#3a2412',.5);g.stroke();}
      else{const o=(R0()-.5)*22,sx=x+nx*o,sy=y+ny*o;
        if(road.deco==='stones'){if(R0()<.55){g.beginPath();g.ellipse(sx,sy,1.8+R0()*1.6,1.3+R0(),R0()*3,0,TAU);g.fillStyle=rgba(road.edge,.45);g.fill();}}
        else if(road.deco==='cobble'){g.beginPath();g.ellipse(sx,sy,3.2,2.2,Math.atan2(dy,dx),0,TAU);g.fillStyle=rgba('#000000',.18);g.fill();g.strokeStyle=rgba(road.hi,.6);g.lineWidth=.6;g.stroke();}
        else if(road.deco==='shells'){if(R0()<.4){g.beginPath();g.arc(sx,sy,1.8,Math.PI,0);g.fillStyle='#f4d0b8';g.fill();}}
        else if(road.deco==='embers'){if(R0()<.5){const q=g.createRadialGradient(sx,sy,0,sx,sy,3.5);q.addColorStop(0,'rgba(255,200,80,.9)');q.addColorStop(1,'rgba(255,90,20,0)');g.fillStyle=q;g.fillRect(sx-4,sy-4,8,8);}}}}}
  // мост через реку
  if(M.river>=0){const ry=M.river*CELL;for(const P of M.paths){for(let i=0;i<P.xs.length;i+=3){if(P.ys[i]>ry-2&&P.ys[i]<ry+CELL+2){const x=P.xs[i];
        g.beginPath();g.moveTo(x-19,P.ys[i]);g.lineTo(x+19,P.ys[i]);g.lineWidth=5.4;g.strokeStyle='#8a5a30';g.stroke();g.lineWidth=.8;g.strokeStyle=rgba('#2a1608',.5);g.stroke();}}
      const cx=P.xs[P.ys.findIndex(y=>y>ry)]||0;for(const s of[-1,1]){g.beginPath();g.moveTo(cx+s*20,ry-4);g.lineTo(cx+s*20,ry+CELL+4);g.lineWidth=3;g.strokeStyle='#6a4222';g.stroke();}break;}}
  // декор
  const dec=[],keys=th.decor,spots=M.spots,gate=M.gate;
  const roadPts=[];for(const P of M.paths)for(let i=0;i<P.xs.length;i+=5)roadPts.push([P.xs[i],P.ys[i]]);
  for(let y=y0-30;y<y1+40;y+=24)for(let x=x0-30;x<x1+30;x+=24){const jx=x+(R0()-.5)*20,jy=y+(R0()-.5)*20;const key=keys[Math.floor(R0()*keys.length)],a=ART[key];if(!a)continue;
    const sc=key==='d_pond'||key==='d_lava'?.45:.6,rad=a.size*sc*.32;let nr=1e9;for(const p of roadPts){const d=(p[0]-jx)**2+(p[1]-jy)**2;if(d<nr)nr=d;}nr=Math.sqrt(nr);
    if(nr<24+rad)continue;if(spots.some(s=>(s.x-jx)**2+(s.y-jy)**2<(30+rad)**2))continue;if((gate.x-jx)**2+(gate.y-jy)**2<85*85)continue;
    if(M.river>=0&&jy>M.river*CELL-14-rad&&jy<M.river*CELL+CELL+14)continue;
    const inWorld=jx>0&&jx<WW&&jy>0&&jy<WH;const prob=inWorld?(nr<60?.18:.42):.62;if(R0()>prob)continue;
    dec.push({key,x:jx,y:jy,sc:sc*(.85+R0()*.3),fl:R0()<.5?-1:1});}
  // ориентиры: 2 крупных объекта главы — на самых просторных местах поля, подальше от дороги, мест под заставы, ворот и друг от друга
  {const ci=Math.max(0,CH.indexOf(th)),set=LMARK[ci]||[],R1=mulberry(M.seed*3+11),lms=[];
    for(let n=0;n<2&&set.length;n++){let best=null,bs=-1;
      for(let y=50;y<WH-70;y+=18)for(let x=34;x<WW-30;x+=18){let nr=1e9;for(const q of roadPts){const d=(q[0]-x)**2+(q[1]-y)**2;if(d<nr)nr=d;}nr=Math.sqrt(nr);if(nr<54)continue;
        if(spots.some(sp=>(sp.x-x)**2+(sp.y-y)**2<50*50))continue;if((gate.x-x)**2+(gate.y-y)**2<100*100)continue;if(M.river>=0&&y>M.river*CELL-40&&y<M.river*CELL+CELL+34)continue;
        if(lms.some(o=>(o.x-x)**2+(o.y-y)**2<130*130))continue;const sc0=Math.min(nr,95)+R1()*14;if(sc0>bs){bs=sc0;best={x,y};}}
      if(!best)break;const key=set[Math.floor(R1()*set.length)],a=ART[key];if(!a)break;const sz=key==='d_pond'||key==='d_lava'?92:66;lms.push({x:best.x,y:best.y,key,sz,fl:R1()<.5?-1:1});}
    G.lms=lms;
    // мелкий декор не лезет на ориентир, а рядом — «кучка» из 3 мелочей главы
    for(let i=dec.length-1;i>=0;i--)if(lms.some(o=>(o.x-dec[i].x)**2+(o.y-dec[i].y)**2<(o.sz*.55)**2))dec.splice(i,1);
    for(const o of lms){for(let j=0;j<3;j++){const an=R1()*TAU,rd=o.sz*.62+R1()*10,key=keys[Math.floor(R1()*keys.length)];if(key==='d_pond'||key==='d_lava'||!ART[key])continue;const x=o.x+Math.cos(an)*rd,y=o.y+Math.sin(an)*rd*.7;
        let ok=true;for(const q of roadPts)if((q[0]-x)**2+(q[1]-y)**2<34*34){ok=false;break;}if(ok&&!spots.some(sp=>(sp.x-x)**2+(sp.y-y)**2<40*40))dec.push({key,x,y,sc:.5,fl:1});}
      dec.push({lm:o,x:o.x,y:o.y+o.sz*.28});}}
  dec.sort((a,b)=>a.y-b.y);
  for(const d of dec){if(d.lm){const o=d.lm,flat=o.key==='d_pond'||o.key==='d_lava',px=Math.ceil(o.sz*k),im=drawArt(o.key,px);if(!flat){g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(o.x+4,o.y+o.sz*.36,o.sz*.42,o.sz*.14,0,0,TAU);g.fill();}
      g.save();g.translate(o.x,o.y);g.scale(o.fl,1);g.drawImage(im,-o.sz/2,-o.sz/2,o.sz,o.sz);g.restore();continue;}const s=spr(d.key);if(!s)continue;g.save();g.translate(d.x,d.y);g.scale(d.fl*d.sc,d.sc);g.drawImage(s.c,-s.s/2,-s.s/2,s.s,s.s);g.restore();}
  // лёгкое затемнение за краями поля (на широких экранах)
  if(!CVL){const F=50;const side=(gx0,gy0,gx1,gy1,rx,ry,rw,rh)=>{const q=g.createLinearGradient(gx0,gy0,gx1,gy1);q.addColorStop(0,'rgba(10,6,20,0)');q.addColorStop(1,'rgba(10,6,20,.32)');g.fillStyle=q;g.fillRect(rx,ry,rw,rh);};
    if(x0<-5){side(0,0,-F,0,x0,y0,-x0,y1-y0);}if(x1>WW+5){side(WW,0,WW+F,0,WW,y0,x1-WW,y1-y0);}
    // за боковыми панелями (широкий монитор) лес уходит в тень — взгляд остаётся на поле
    if(VIEW.wide&&VIEW.hw<VIEW.W-40){const e=(VIEW.hw/2)/VIEW.s,cx=WW/2;for(const d of[-1,1]){const xa=cx+d*e,xb=cx+d*(e+120),q=g.createLinearGradient(xa,0,xb,0);q.addColorStop(0,'rgba(8,6,18,0)');q.addColorStop(1,'rgba(8,6,18,.6)');g.fillStyle=q;
      g.fillRect(Math.min(xa,xb),y0,120,y1-y0);g.fillStyle='rgba(8,6,18,.6)';if(d<0)g.fillRect(x0,y0,xb-x0,y1-y0);else g.fillRect(xb,y0,x1-xb,y1-y0);}}}
  // ворота города
  {const s=spr('gate');g.drawImage(s.c,gate.x-s.s*.4,gate.y-s.s*.4-8,s.s*.8,s.s*.8);const bn=!SHOT&&bnNow();if(bn)drawBanner(g,gate.x+1,gate.y-36,46,bn,1);}   // поднятое знамя дружины — над воротами
  // затемнение у входов
  for(const P of M.paths){const x=P.xs[0],y=P.ys[0];const q=g.createRadialGradient(x,y,0,x,y,70);q.addColorStop(0,'rgba(20,10,30,.55)');q.addColorStop(1,'rgba(20,10,30,0)');g.fillStyle=q;g.fillRect(x-70,y-70,140,140);}
  if(th.dark){g.setTransform(1,0,0,1,0,0);const q=g.createRadialGradient(bgCv.width/2,bgCv.height/2,bgCv.height*.2,bgCv.width/2,bgCv.height/2,bgCv.height*.75);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=q;g.fillRect(0,0,bgCv.width,bgCv.height);}
}
const DRAWL=[];
// размер шрифта в мире, чтобы на экране было не меньше px (мир масштабируется VIEW.s)
/* look1: вид «Живая сказка» — в бою только шрифт, размеры надписей и светлые плашки (цвета — из LOOK.cv, css-переменные --cv-*). Без LOOK — всё как было */
const CVL=window.LOOK&&LOOK.on?LOOK.cv:null;
function cvF(w,px){return w+' '+px+'px '+(CVL?CVL.font:'system-ui,sans-serif');}
function wfs(px){return Math.round(Math.max(px*.85,px/VIEW.s)*10)/10;}
function worldT(){ctx.setTransform(VIEW.B,0,0,VIEW.B,VIEW.ox*VIEW.dpr+G.shx,VIEW.oy*VIEW.dpr+G.shy);}
function drawSpr(key,x,y,sx,sy,flash,rot,alpha){const s=SPR[key]||spr(key);if(!s)return;const B=VIEW.B,tx=VIEW.ox*VIEW.dpr+G.shx+x*B,ty=VIEW.oy*VIEW.dpr+G.shy+y*B;
  if(rot){const c=Math.cos(rot),n=Math.sin(rot);ctx.setTransform(B*sx*c,B*sx*n,-B*sy*n,B*sy*c,tx,ty);}else ctx.setTransform(B*sx,0,0,B*sy,tx,ty);
  if(alpha!=null)ctx.globalAlpha=alpha;ctx.drawImage(flash?sprFlash(s):s.c,-s.s/2,-s.s/2,s.s,s.s);if(alpha!=null)ctx.globalAlpha=1;}
// свечение — готовый спрайт на цвет (glowSpr в art.js), без градиента на каждый вызов
function glowDot(c,x,y,r,col,a){if(!(r>.05))return;const ga=c.globalAlpha;c.globalAlpha=ga*(a==null?.9:a);c.drawImage(glowSpr(col),x-r,y-r,r*2,r*2);c.globalAlpha=ga;}
function rr(c,x,y,w,h,r){if(w<=0)return c.beginPath();r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function render(){if(!G||!bgCv)return;const c=ctx;
  G.shx=G.shake>0?rand(-1,1)*G.shake*VIEW.dpr*.5:0;G.shy=G.shake>0?rand(-1,1)*G.shake*VIEW.dpr*.5:0;
  c.setTransform(1,0,0,1,0,0);c.drawImage(bgCv,G.shx,G.shy);worldT();
  // лужи и огонь
  for(const q of G.pools){const a=Math.min(1,q.t*5,(q.dur-q.t)*2);c.globalAlpha=a;
    if(q.fire){glowDot(c,q.x,q.y,q.r*1.1,'#ff7a2a',.55);for(let i=0;i<5;i++){const an=i*1.3+G.t*2,rr2=q.r*.55;glowDot(c,q.x+Math.cos(an)*rr2,q.y+Math.sin(an)*rr2*.5,8+Math.sin(G.t*9+i)*3,'#ffd84a',.8);}}
    else{c.fillStyle=rgba(q.col,.33);c.beginPath();c.ellipse(q.x,q.y,q.r,q.r*.62,0,0,TAU);c.fill();c.strokeStyle=rgba(q.col,.7);c.lineWidth=1.5;c.stroke();
      for(let i=0;i<4;i++){const ph=(G.t*1.3+i*.37+q.x*.01)%1,an=i*1.7+q.x;c.beginPath();c.arc(q.x+Math.cos(an)*q.r*.5,q.y+Math.sin(an)*q.r*.3-ph*4,1.5+ph*2.5,0,TAU);c.strokeStyle=rgba('#ffffff',.6*(1-ph));c.lineWidth=1;c.stroke();}}
    c.globalAlpha=1;}
  // места под заставы
  const S0=G.map.spots;
  for(let i=0;i<S0.length;i++){if(G.tw[i])continue;const s=S0[i],sel=G.sel===i;drawSpr('spot',s.x,s.y+2,sel?1.12:1,sel?1.12:1);
    if(G.tut===1&&i===tutSpot()){worldT();const p=.5+.5*Math.sin(G.t*6);c.strokeStyle=rgba('#ffd84a',.5+p*.5);c.lineWidth=2.5;c.beginPath();c.arc(s.x,s.y+2,22+p*5,0,TAU);c.stroke();}}
  worldT();
  // look1: золотое кольцо под выбранной заставой или местом
  if(CVL&&G.sel>=0&&S0[G.sel]){const s=S0[G.sel],tw=G.tw[G.sel],y=s.y+(tw?7:2),rx=tw?27:24,ry=tw?13:15;c.fillStyle='rgba(255,201,58,.4)';c.beginPath();c.ellipse(s.x,y,rx,ry,0,0,TAU);c.fill();c.strokeStyle=CVL.selE;c.lineWidth=5.5;c.stroke();c.strokeStyle=CVL.sel;c.lineWidth=3.2;c.stroke();}
  // радиус выбранной
  if(G.preview){const p=G.preview;c.fillStyle=CVL?'rgba(255,255,255,.13)':'rgba(255,255,255,.1)';c.beginPath();c.arc(p.x,p.y,p.r,0,TAU);c.fill();
    if(CVL){c.strokeStyle='rgba(59,36,18,.45)';c.lineWidth=4.2;c.stroke();c.strokeStyle='rgba(255,255,255,.96)';c.lineWidth=2.6;c.setLineDash([9,6]);}else{c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1.5;c.setLineDash([6,5]);}c.stroke();c.setLineDash([]);}
  // тени летучих
  for(const e of G.en)if(e.fly){c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(e.x,e.y+6,e.r*.9,e.r*.35,0,0,TAU);c.fill();}
  // заставы и наземная нечисть по глубине
  const list=DRAWL;list.length=0;for(const t of G.tw)if(t)list.push(t);for(const e of G.en)if(!e.fly)list.push(e);list.sort((a,b)=>a.y-b.y);
  for(const o of list){if(o.inv!=null)drawTower(o);else drawEnemy(o);}
  for(const e of G.en)if(e.fly)drawEnemy(e);
  drawKolo();
  // советчик: золотое кольцо и стрелка-указатель на месте/заставе, куда стоит потратить монеты
  if(G.adv){const a=G.adv,s=G.map.spots[a.i],p=REDUCED?.5:.5+.5*Math.sin(G.t*6),up=a.k==='up',y0=up?s.y-18:s.y+2,ay=y0-(up?50:32)-p*6;worldT();
    c.strokeStyle=rgba('#ffd84a',.55+p*.45);c.lineWidth=3;c.beginPath();c.arc(s.x,y0,(up?28:22)+p*5,0,TAU);c.stroke();
    c.fillStyle='#ffd84a';c.strokeStyle='#5a2a06';c.lineWidth=1.5;c.beginPath();c.moveTo(s.x-9,ay-11);c.lineTo(s.x+9,ay-11);c.lineTo(s.x,ay+3);c.closePath();c.fill();c.stroke();}
  worldT();
  // снаряды
  for(const p of G.proj){
    if(p.k==='arrow'){worldT();const ca=Math.cos(p.a||0),sa=Math.sin(p.a||0);c.strokeStyle='rgba(255,250,220,.55)';c.lineWidth=1.6;c.beginPath();c.moveTo(p.x-ca*16,p.y-sa*16);c.lineTo(p.x-ca*4,p.y-sa*4);c.stroke();drawSpr('arrow',p.x,p.y,.55,.55,false,p.a);worldT();}
    else{const q=p.t/p.T,x=lerp(p.x0,p.x1,q),y=lerp(p.y0,p.y1,q)-Math.sin(q*Math.PI)*(p.k==='ball'?46:40);
      c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(lerp(p.x0,p.x1,q),lerp(p.y0,p.y1,q)+2,4,2,0,0,TAU);c.fill();
      if(p.k==='ball')drawSpr(p.pie?'pie':p.big?'ballG':'ball',x,y,p.pie?.55:1,p.pie?.55:1,false,p.pie?q*6:0);else drawSpr(p.key,x,y,.8,.8,false,q*8);}}
  worldT();
  // эффекты
  for(const f of G.fx){const q=f.t/f.dur;
    if(f.k==='boom'){c.globalCompositeOperation='lighter';glowDot(c,f.x,f.y,f.r*(.6+q*.6),f.pie?'#ffb03a':'#ff8a3a',.8*(1-q));glowDot(c,f.x,f.y,f.r*.5*(1-q),'#fff0a0',.9);c.globalCompositeOperation='source-over';
      c.strokeStyle=rgba('#ffffff',.5*(1-q));c.lineWidth=2;c.beginPath();c.ellipse(f.x,f.y,f.r*q,f.r*q*.6,0,0,TAU);c.stroke();}
    else if(f.k==='ring'||f.k==='wave'){c.strokeStyle=rgba(f.col,(1-q)*.8);c.lineWidth=f.k==='wave'?4:2.5;c.beginPath();c.ellipse(f.x,f.y,f.r*(.3+q*.7),f.r*(.3+q*.7)*(f.k==='ring'?.62:1),0,0,TAU);c.stroke();
      if(f.k==='wave'){c.lineWidth=2;c.beginPath();c.arc(f.x,f.y,f.r*q*.6,0,TAU);c.stroke();}}
    else if(f.k==='root'){const h=Math.sin(Math.min(1,q*1.6)*Math.PI)*14;for(const dx of[-6,0,6]){c.fillStyle='#7a5030';c.beginPath();c.moveTo(f.x+dx-3,f.y+4);c.quadraticCurveTo(f.x+dx-1,f.y+4-h,f.x+dx+(dx/3),f.y+4-h*1.2);c.quadraticCurveTo(f.x+dx+1,f.y+4-h*.5,f.x+dx+3,f.y+4);c.fill();
        c.strokeStyle='#4a2c14';c.lineWidth=.8;c.stroke();}}
    else if(f.k==='bolt'){c.globalCompositeOperation='lighter';const R1=mulberry(f.seed|0);c.lineCap='round';
      for(const [w,col] of[[6,rgba(f.col,.35*(1-q))],[2.2,rgba('#ffffff',1-q)]]){c.beginPath();for(let i=0;i<f.pts.length-1;i++){const [ax,ay]=f.pts[i],[bx,by]=f.pts[i+1];if(i===0)c.moveTo(ax,ay);
          for(let s=1;s<=5;s++){const t=s/5,jit=s<5?(R1()-.5)*14:0;c.lineTo(lerp(ax,bx,t)+jit,lerp(ay,by,t)+jit*.5);}}c.lineWidth=w;c.strokeStyle=col;c.stroke();}
      for(const p of f.pts.slice(1))glowDot(c,p[0],p[1],12*(1-q),f.col,.8);c.globalCompositeOperation='source-over';}
    else if(f.k==='thunder'){c.globalCompositeOperation='lighter';glowDot(c,f.x,f.y,f.r*1.2,'#8ad8ff',.9*(1-q));const R1=mulberry(7);
      if(q<.4){c.beginPath();let x=f.x+rand(-10,10),y=f.y-400;c.moveTo(x,y);while(y<f.y){y+=30;x=f.x+(R1()-.5)*40*(1-(f.y-y)/400)+(y>=f.y?0:0);c.lineTo(y>=f.y?f.x:x,Math.min(y,f.y));}
        c.lineWidth=5;c.strokeStyle='rgba(220,240,255,.95)';c.stroke();c.lineWidth=12;c.strokeStyle='rgba(120,200,255,.35)';c.stroke();}
      c.globalCompositeOperation='source-over';c.strokeStyle=rgba('#ffffff',1-q);c.lineWidth=3;c.beginPath();c.ellipse(f.x,f.y,f.r*q,f.r*q*.6,0,0,TAU);c.stroke();}
    else if(f.k==='fireball'){const x=lerp(f.x,f.x1,q),y=lerp(f.y,f.y1,q)-Math.sin(q*Math.PI)*30;c.globalCompositeOperation='lighter';glowDot(c,x,y,16,'#ff7a2a');glowDot(c,x,y,7,'#fff0a0');c.globalCompositeOperation='source-over';}
    else if(f.k==='beam'){c.globalCompositeOperation='lighter';c.strokeStyle=rgba('#ff4a6a',.8*(1-q));c.lineWidth=6*(1-q)+2;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.x1,f.y1);c.stroke();glowDot(c,f.x1,f.y1,20,'#ff4a6a',.6*(1-q));c.globalCompositeOperation='source-over';}
    else if(f.k==='flash'){c.globalCompositeOperation='lighter';glowDot(c,f.x,f.y,18*(1-q)+7,'#ffd070',.95*(1-q));glowDot(c,f.x,f.y,8*(1-q)+3,'#ffffff',.9*(1-q));c.globalCompositeOperation='source-over';}
    else if(f.k==='coin'){if(f.t<0)continue;const tg=G.coinTg||(G.coinTg=typeof coinTarget==='function'?coinTarget():{x:20,y:-20}),e=q*q,x=lerp(f.x,tg.x,e)+Math.sin(q*Math.PI)*f.ax,y=lerp(f.y,tg.y,e)-Math.sin(q*Math.PI)*26;drawSpr('coin',x,y,.8,.8);worldT();}
    else if(f.k==='poof'){for(let i=0;i<7;i++){const a=i/7*TAU;glowDot(c,f.x+Math.cos(a)*26*q,f.y+Math.sin(a)*26*q,16*(1-q),'#b86bff');}}
    else if(f.k==='frog'){const hop=Math.abs(Math.sin(q*Math.PI*3))*10;drawSpr('frog',f.x,f.y-hop,f.vx<0?-.8:.8,.8,false,0,Math.min(1,(1-q)*3));worldT();}
    else if(f.k==='cat'){c.setTransform(1,0,0,1,0,0);const a=Math.min(1,q*6,(1-q)*3)*.18;c.fillStyle='rgba(60,40,140,'+a+')';c.fillRect(0,0,cv.width,cv.height);worldT();}}
  // частицы
  let anyAdd=false;for(const p of G.pt){if(p.add){anyAdd=true;continue;}c.globalAlpha=1-p.t/p.dur;c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.s,0,TAU);c.fill();}c.globalAlpha=1;
  if(anyAdd){c.globalCompositeOperation='lighter';for(const p of G.pt)if(p.add)glowDot(c,p.x,p.y,p.s*2.2,p.col,1-p.t/p.dur);c.globalCompositeOperation='source-over';}
  // числа
  c.textAlign='center';c.textBaseline='middle';const fN=wfs(CVL?16:13),fL=wfs(CVL?14.5:12);c.lineWidth=CVL?3.6:3;c.lineJoin='round';c.strokeStyle=CVL?CVL.num:'rgba(20,10,10,.7)';
  for(const n of G.nums){const a=n.t<.7?1:1-(n.t-.7)/.3;c.globalAlpha=a;c.font=cvF(CVL?800:900,typeof n.v==='string'&&n.v.length>4?fL:fN);
    c.strokeText(n.v,n.x,n.y-n.t*18);c.fillStyle=n.col;c.fillText(n.v,n.x,n.y-n.t*18);}c.globalAlpha=1;
  for(const b of G.bub)drawBubble(b);
  // прицел молнии
  if(G.aim&&G.aimPt){const p=G.aimPt,r=SPELLS.thunder.r*(forgeN('thunder')>=2?1.2:1);c.strokeStyle='rgba(160,220,255,.9)';c.fillStyle='rgba(140,200,255,.15)';c.lineWidth=2;c.setLineDash([5,4]);c.beginPath();c.arc(p.x,p.y,r,0,TAU);c.fill();c.stroke();c.setLineDash([]);}
  drawOverlay();
}
function tutSpot(){const s=G.map.spots;let best=0,bd=-1;for(let i=0;i<s.length;i++){if(s[i].r<3||s[i].r>8)continue;const v=-Math.abs(s[i].x-180);if(v>bd){bd=v;best=i;}}return best;}
function drawTower(t){const B=t.bounce>0?1+Math.sin(t.bounce/.35*Math.PI)*.08:1;
  worldT();ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(t.x+3,t.y+9,21,8,0,0,TAU);ctx.fill();
  drawSpr(towerKey(t),t.x,t.y-10,B,1/B*1.0+ (B-1)*0,false);
  if(t.type==='pushka'){const piv=[0,-17,-20,-23,-25][t.lvl]-(t.lvl===4?0:0);const rc=t.recoil>0?t.recoil*20:0;if(t.recoil>0)t.recoil-=1/60;
    const ca=Math.cos(t.ang),sa=Math.sin(t.ang)*.62,da=Math.atan2(sa,ca),lf=Math.hypot(ca,sa),bk=t.lvl===1?1.3:t.lvl===2?1.15:1;drawSpr('bar_'+(t.lvl<4?t.lvl:'4'+(t.br===1?'a':'b'))+(skinOf('pushka')==='gold'?'~gold':''),t.x-ca*rc,t.y+piv-sa*rc,lf*bk,(ca<0?-1:1)*bk,false,da);}
  worldT();const c=ctx;
  // золотая стрелка ▲ — хватает монет на улучшение; звёздочка — на ветку мастеров (аудит 14: не тыкать в каждую заставу)
  if(t.lvl<4&&!(t.stunT>0)){const up=t.lvl<3?G.coins>=upCost(t):branchUnlocked()&&G.coins>=Math.min(upCost(t,1),upCost(t,2));
    if(up){const x=t.x+17,y=t.y-44+(REDUCED?0:Math.sin(G.t*5+t.i)*1.6),r=6.5;c.fillStyle='rgba(40,20,5,.8)';c.beginPath();c.arc(x,y,r+1.3,0,TAU);c.fill();
      c.fillStyle='#ffd84a';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.fillStyle='#5a2a06';c.beginPath();
      if(t.lvl<3){c.moveTo(x,y-4);c.lineTo(x+3.8,y+.6);c.lineTo(x+1.4,y+.6);c.lineTo(x+1.4,y+3.8);c.lineTo(x-1.4,y+3.8);c.lineTo(x-1.4,y+.6);c.lineTo(x-3.8,y+.6);}
      else{for(let i=0;i<10;i++){const an=-Math.PI/2+i*Math.PI/5,rr2=i%2?1.9:4.4;c.lineTo(x+Math.cos(an)*rr2,y+Math.sin(an)*rr2);}}
      c.closePath();c.fill();}}
  if(t.stunT>0){const y=t.y-58;c.font=cvF(CVL?800:900,wfs(CVL?17:14));c.textAlign='center';c.fillStyle='#fff';c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=3;
    const s=t.sleepFx>0?'z z z':t.burnFx>0?'🔥':'♪ ♫';c.strokeText(s,t.x,y+Math.sin(G.t*4)*2);c.fillText(s,t.x,y+Math.sin(G.t*4)*2);}
  if(t.frostT>0){c.fillStyle='rgba(190,230,255,.35)';c.beginPath();c.ellipse(t.x,t.y-12,24,30,0,0,TAU);c.fill();}
  if(t.type==='izba'){const ph=(G.t*.6+t.i*.3)%1;c.fillStyle=rgba('#dddddd',.5*(1-ph));c.beginPath();c.arc(t.x+[0,6,7,8,8][t.lvl]+ph*4,t.y-[0,42,46,50,50][t.lvl]-ph*16,2+ph*4,0,TAU);c.fill();}
}
function drawEnemy(e){const b=EN[e.type];let y=e.y,a=1;const P=G.map.paths[e.pi];if(e.d>P.len-30)a=Math.max(0,(P.len-e.d)/30);
  const bob=e.fly?Math.sin(e.t*6)*3-16:(e.hop?-Math.sin(Math.min(1,e.hop.t)*Math.PI)*18:0);
  const walk=e.fly||e.stunT>0||e.sleepT>0?0:Math.abs(Math.sin(e.t*9*(e.spd/40)))*1.6;
  const sq=e.sleepT>0?.9:1;
  if(!e.fly&&e.type!=='egg'){ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(e.x,e.y+e.r*.9,e.r*.95,e.r*.38,0,0,TAU);ctx.fill();}
  if(e.type==='egg'){const sc=1.5+Math.sin(G.t*8)*.07;glowDot(ctx,e.x,e.y,42,'#ffd84a',.55);drawSpr('egg',e.x,e.y-8,sc,sc,e.flash>0);}
  else{let k=1;if(e.boss||e.lead){if(e.spawnT>0)k=1-e.spawnT*.7;ctx.setTransform(1,0,0,1,0,0);worldT();glowDot(ctx,e.x,e.y-e.r*.6,e.r*2.4,e.lead?'#9aff6a':'#ff6a3a',.18+Math.sin(G.t*4)*.05);}
    drawSpr(e.key,e.x,y+bob-walk-e.r*.3,e.face*e.sz*k,e.sz*sq*k,e.flash>0,0,a);}
  worldT();const c=ctx;
  if(e.invul&&e.type==='tugar'){c.globalCompositeOperation='lighter';glowDot(c,e.x,e.y-20,e.r*2.2,'#ff7a2a',.5+Math.sin(G.t*12)*.1);c.globalCompositeOperation='source-over';}
  if(e.invul&&e.type==='kosh'){c.globalAlpha=.6+Math.sin(G.t*10)*.3;c.strokeStyle='#5cff9a';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y-20,e.r*1.4,0,TAU);c.stroke();c.globalAlpha=1;}
  // яд — зелёные пузырьки (кружки), замедление — голубые ромбики-льдинки: отличаются и формой, не только цветом
  if(e.slow>0.01||e.poisonT>0){const pz=e.poisonT>0;c.fillStyle=pz?'rgba(120,255,100,.9)':'rgba(160,220,255,.95)';for(let i=0;i<2;i++){const ph=(G.t*1.5+i*.5+e.t)%1,px=e.x+(i?5:-5),py=e.y-e.r*1.8-ph*10+bob;c.globalAlpha=1-ph;c.beginPath();
    if(pz)c.arc(px,py,1.8,0,TAU);else{c.moveTo(px,py-2.6);c.lineTo(px+1.8,py);c.lineTo(px,py+2.6);c.lineTo(px-1.8,py);c.closePath();}c.fill();}c.globalAlpha=1;}
  if(e.sleepT>0||(e.stunT>0&&!e.hop)){c.font=cvF(CVL?800:900,wfs(CVL?15:12));c.textAlign='center';c.fillStyle=e.sleepT>0?'#dcd0ff':'#ffe66a';c.fillText(e.sleepT>0?'z':'✦',e.x+6+Math.sin(G.t*3)*3,e.y-e.r*2.4+bob-Math.sin(G.t*2)*3);}
  // корона вожака — нарисованная (эмодзи на холсте есть не везде)
  if(e.lead){const x=e.x,y=e.y-e.r*2.3-walk+bob,w=9;c.fillStyle='#ffd84a';c.strokeStyle='#6a3a06';c.lineWidth=1.2;c.beginPath();
    c.moveTo(x-w,y+4);c.lineTo(x-w,y-3);c.lineTo(x-w/2,y+1);c.lineTo(x,y-6);c.lineTo(x+w/2,y+1);c.lineTo(x+w,y-3);c.lineTo(x+w,y+4);c.closePath();c.fill();c.stroke();
    c.fillStyle='#e8433a';c.beginPath();c.arc(x,y+1.5,1.6,0,TAU);c.fill();}
  if(e.hp<e.max&&!e.boss&&!e.lead){const w=Math.max(16,e.r*2),yy=e.y-e.r*2.3+bob-(e.type==='egg'?14:0);const col=e.hp/e.max>.5?'#6ae04a':e.hp/e.max>.25?'#ffc93a':'#ff5a3a';
    if(CVL){c.fillStyle=CVL.stroke;rr(c,e.x-w/2-1.5,yy-4.5,w+3,9,4);c.fill();c.fillStyle=col;rr(c,e.x-w/2,yy-3,w*Math.max(0,e.hp/e.max),6,3);c.fill();}   // look1: полоска 6 px с тёмной каймой (было 3 в подложке 5)
    else{c.fillStyle='rgba(20,10,10,.65)';rr(c,e.x-w/2-1,yy-1,w+2,5,2.5);c.fill();c.fillStyle=col;rr(c,e.x-w/2,yy,w*Math.max(0,e.hp/e.max),3,1.5);c.fill();}}
}
function drawBubble(b){const c=ctx,e=b.e,x=e.x,y=e.y-(e.r||10)*2.6-(e.fly?18:0)-(e.boss?e.r*.8:0);const q=b.t/b.dur,a=q<.1?q/.1:q>.85?(1-q)/.15:1;
  const fs=wfs(CVL?16:13.5);c.globalAlpha=a;c.font=cvF(CVL?700:800,fs);if(b.fs!==fs){b.fs=fs;b.w=c.measureText(b.s).width+fs;}const w=b.w,h=fs*1.7;const bx=clamp(x-w/2,-VIEW.ox/VIEW.s+4,(VIEW.W-VIEW.ox)/VIEW.s-w-4),by=Math.max(y-h,(VIEW.top+(G.boss&&!G.boss.dead?(CVL?46:40):4)-VIEW.oy)/VIEW.s);
  c.fillStyle=CVL?CVL.bub:'rgba(255,255,255,.95)';c.beginPath();c.moveTo(x-4,by+h-1);c.lineTo(x,by+h+5);c.lineTo(x+4,by+h-1);c.fill();rr(c,bx,by,w,h,h/2);c.fill();if(CVL){c.strokeStyle=CVL.bubE;c.lineWidth=1.3;c.stroke();}
  c.fillStyle=CVL?CVL.bubT:'#2a1a14';c.textAlign='center';c.textBaseline='middle';c.fillText(b.s,bx+w/2,by+h/2+.5);c.globalAlpha=1;}
// поверх карты: полоса босса, баннер волны, индикатор следующей волны
function drawOverlay(){const c=ctx,d=VIEW.dpr;c.setTransform(d,0,0,d,0,0);const W=VIEW.W;
  if(G.boss&&!G.boss.dead){const e=G.boss,w=Math.min(300,W-60),x=(W-w)/2,y=VIEW.top+10,by=CVL?y+15:y+11;
    if(CVL){c.fillStyle=CVL.pill;rr(c,x-6,y-7,w+12,36,12);c.fill();c.strokeStyle=CVL.pillE;c.lineWidth=2;c.stroke();}else{c.fillStyle='rgba(10,8,20,.75)';rr(c,x-4,y-6,w+8,30,10);c.fill();}
    c.fillStyle=CVL?'#5a2a1a':'#3a1a1a';rr(c,x,by,w,8,4);c.fill();c.fillStyle=e.invul?(CVL?'#2fae5c':'#5cff9a'):'#ff4a3a';rr(c,x,by,w*Math.max(.01,e.hp/e.max),8,4);c.fill();
    c.font=cvF(800,CVL?16:13);c.textAlign='center';c.textBaseline='middle';c.fillStyle=CVL?CVL.pillT:'#fff';c.fillText(e.lead?Lg('Вожак: ','Leader: ')+LEAD.n[e.type]:EN[e.type].n+(e.invul?(e.type==='kosh'?Lg(' — бессмертен!',' — deathless!'):Lg(' — 🛡 неуязвим',' — 🛡 invulnerable')):''),W/2,y+(CVL?4:2),CVL?w:W-24);}
  if(G.banner&&G.banner.wave){const b=G.banner,q=b.t,a=q<.2?q/.2:q>1.4?Math.max(0,(1.8-q)/.4):1,txt=b.title+(b.sub?' · '+b.sub:''),y=VIEW.top+(G.boss&&!G.boss.dead?(CVL?54:48):12)+12;
    c.globalAlpha=a;c.font=cvF(800,CVL?16:14);c.textAlign='center';c.textBaseline='middle';const w=Math.min(W-24,c.measureText(txt).width+28);
    if(CVL){c.fillStyle=CVL.ban1;rr(c,(W-w)/2,y-16,w,32,14);c.fill();c.strokeStyle=CVL.ban2;c.lineWidth=2;c.stroke();c.fillStyle=CVL.banE;}else{c.fillStyle='rgba(20,10,30,.72)';rr(c,(W-w)/2,y-14,w,28,14);c.fill();c.fillStyle='#ffe7a0';}c.fillText(txt,W/2,y+.5,w-20);c.globalAlpha=1;}
  else if(G.banner&&G.banner.key){
    // карточка-представление босса/вожака: портрет, имя, что умеет и что делать игроку (4,2 с; края поля темнеют)
    const b=G.banner,q=b.t,a=q<.25?q/.25:q>3.6?Math.max(0,(4.2-q)/.6):1,w=Math.min(350,W-20),x=(W-w)/2;c.globalAlpha=a;c.textAlign='left';c.textBaseline='top';
    if(CVL){// look1: светлая карточка (пергамент в деревянной раме), текст 16 px, поле вокруг не темнеет
      const pw=62,tw=w-pw-28,lh=20;c.font=cvF(600,16);const l1=wrapText(c,b.sub,tw);c.font=cvF(800,16);const l2=wrapText(c,'👉 '+b.tip,tw),h=Math.max(pw+20,38+(l1.length+l2.length)*lh+14),y=Math.max(VIEW.top+50,VIEW.oy+WH*VIEW.s*.3-h/2);
      c.fillStyle=CVL.cardE2;rr(c,x-3,y-3,w+6,h+6,18);c.fill();c.fillStyle=CVL.cardE;rr(c,x-.5,y-.5,w+1,h+1,16);c.fill();c.fillStyle=CVL.card;rr(c,x+3,y+3,w-6,h-6,13);c.fill();
      c.fillStyle='rgba(255,201,58,.38)';c.beginPath();c.arc(x+13+pw/2,y+h/2,pw/2,0,TAU);c.fill();const sp=spr(b.key);if(sp){const z=REDUCED?1:1+Math.sin(q*5)*.03;c.drawImage(sp.c,x+13+pw/2-pw*z/2,y+h/2-pw*z/2,pw*z,pw*z);}
      let ty=y+11;const tx=x+pw+20;c.font=cvF(800,19);c.fillStyle=CVL.cardH;c.fillText(b.title,tx,ty,tw);ty+=27;
      c.font=cvF(600,16);c.fillStyle=CVL.cardT;for(const l of l1){c.fillText(l,tx,ty);ty+=lh;}ty+=3;c.font=cvF(800,16);c.fillStyle=CVL.cardTip;for(const l of l2){c.fillText(l,tx,ty);ty+=lh;}c.globalAlpha=1;}
    else{const pw=74,tw=w-pw-26;
    c.font='700 13px system-ui,sans-serif';const l1=wrapText(c,b.sub,tw);c.font='800 13px system-ui,sans-serif';const l2=wrapText(c,'👉 '+b.tip,tw),h=Math.max(pw+20,40+(l1.length+l2.length)*17+14),y=Math.max(VIEW.top+46,VIEW.oy+WH*VIEW.s*.3-h/2);
    const v=c.createRadialGradient(W/2,VIEW.H/2,VIEW.H*.25,W/2,VIEW.H/2,VIEW.H*.8);v.addColorStop(0,'rgba(10,4,16,0)');v.addColorStop(1,'rgba(10,4,16,.55)');c.fillStyle=v;c.fillRect(0,0,W,VIEW.H);
    c.fillStyle='#4a1f12';rr(c,x-3,y-3,w+6,h+6,17);c.fill();c.fillStyle='#d9a441';rr(c,x-1,y-1,w+2,h+2,15);c.fill();const gb=c.createLinearGradient(0,y,0,y+h);gb.addColorStop(0,'#3a1420');gb.addColorStop(1,'#1c1230');c.fillStyle=gb;rr(c,x+1,y+1,w-2,h-2,13);c.fill();
    c.fillStyle='rgba(255,120,80,.22)';c.beginPath();c.arc(x+12+pw/2,y+h/2,pw/2,0,TAU);c.fill();const sp=spr(b.key);if(sp){const z=REDUCED?1:1+Math.sin(q*5)*.03;c.drawImage(sp.c,x+12+pw/2-pw*z/2,y+h/2-pw*z/2,pw*z,pw*z);}
    let ty=y+11;const tx=x+pw+20;c.font='900 18px Georgia,"Times New Roman",serif';c.fillStyle='#ffd9a0';c.fillText(b.title,tx,ty,tw);ty+=26;
    c.font='700 13px system-ui,sans-serif';c.fillStyle='#f1ecdc';for(const l of l1){c.fillText(l,tx,ty);ty+=17;}ty+=3;c.font='800 13px system-ui,sans-serif';c.fillStyle='#ffd84a';for(const l of l2){c.fillText(l,tx,ty);ty+=17;}c.globalAlpha=1;}}
  else if(G.banner){const b=G.banner,q=b.t,a=q<.3?q/.3:q>2.4?Math.max(0,(3-q)/.6):1,y=VIEW.oy+WH*VIEW.s*.36;c.globalAlpha=a;c.textAlign='center';c.textBaseline='middle';
    c.font=cvF(CVL?800:900,b.boss?26:24);c.lineJoin='round';c.lineWidth=5;c.strokeStyle='rgba(20,10,30,.75)';c.strokeText(b.title,W/2,y);c.fillStyle=b.boss?'#ff8a5a':'#ffe7a0';c.fillText(b.title,W/2,y);
    if(b.sub){c.font=cvF(800,CVL?16:14);const lines=wrapText(c,b.sub,Math.min(320,W-40));lines.forEach((l,i)=>{c.lineWidth=4;c.strokeText(l,W/2,y+26+i*18);c.fillStyle='#fff';c.fillText(l,W/2,y+26+i*18);});}c.globalAlpha=1;}
  // индикатор у входа: через сколько следующая волна
  if(G.nextT>0||!G.started){for(const P of G.map.paths){const p=toScreen(clamp(P.xs[Math.min(P.xs.length-1,40)],10,WW-10),clamp(P.ys[Math.min(P.xs.length-1,40)],16,WH));
      const pulse=1+Math.sin(G.t*5)*.06,r=17*pulse;c.fillStyle='rgba(30,10,20,.75)';c.beginPath();c.arc(p.x,p.y,r+3,0,TAU);c.fill();
      if(G.nextT>0){const tot=G.nextTot||14;c.strokeStyle='#ffd84a';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,r+1,-Math.PI/2,-Math.PI/2+TAU*(1-G.nextT/tot));c.stroke();}
      const s=spr('skull');c.drawImage(s.c,p.x-r*.9,p.y-r*.9,r*1.8,r*1.8);}}
}
function wrapText(c,s,w){const words=s.split(' '),out=[];let l='';for(const x of words){const t=l?l+' '+x:x;if(c.measureText(t).width>w&&l){out.push(l);l=x;}else l=t;}if(l)out.push(l);return out;}

/* ================= ускорение ×2/×3 тратит запас «времени ускорения» (S.boost, секунды) ================= */
const BOOST_CAP=7200;
function boostAdd(sec){S.boost=Math.min(BOOST_CAP,Math.max(0,(S.boost||0)+sec));}
let boostSaveT=0;
// сколько запаса ушло в этом бою на ×2 и на ×3 (×2 возвращается: победа — целиком, поражение/выход — наполовину)
function boostDrain(sec){const d=Math.min(S.boost||0,sec);if(G){if(G.speed>=3)G.bs3=(G.bs3||0)+d;else G.bs2=(G.bs2||0)+d;}S.boost=Math.max(0,(S.boost||0)-sec);boostSaveT+=sec;if(boostSaveT>10){boostSaveT=0;save();}
  if(S.boost<=0&&G.speed>=2){const x2=G.speed>=3&&typeof payX2==='function'&&payX2();if(!x2&&G.speed<2.5&&typeof payX2==='function'&&payX2())return;
    G.speed=x2?2:1.5;save();toast(Lg('Запас ускорения кончился — скорость ','Speed-up reserve is empty — speed ')+(x2?'×2':dnum('×1,5')));if(typeof boostOut==='function')boostOut();}}
function boostRefund(frac){if(!G)return 0;const amt=Math.max(0,(G.bs2||0)*frac-(G.bsRef||0));G.bsRef=(G.bsRef||0)+amt;boostAdd(amt);return amt;}
function fmtBoost(s){s=Math.max(0,Math.round(s));const h=Lg(' ч ','h '),m=Lg(' мин',' min'),c=Lg(' с',' s');return s>=3600?Math.floor(s/3600)+h+String(Math.floor(s%3600/60)).padStart(2,'0')+m:s>=600?Math.floor(s/60)+m:s>=60?Math.floor(s/60)+m+(s%60?' '+s%60+c:''):s+c;}

/* ================= цикл ================= */
/* шаги расчёта: не больше 4 за кадр (на ×3 шаг длиннее) — слабый телефон не уходит в «спираль» тормозов.
   Кадр рисуем, только пока бой идёт: под паузой, окном и после окончания эффектов — один раз и стоп */
function loop(t){requestAnimationFrame(loop);const dt=Math.min(1/20,(t-lastT)/1000||0);lastT=t;if(!G)return;
  const live=!paused&&!G.paused&&!G.over;
  // открыто кольцо выбора: ×2/×3 не идут (запас не тратится — значит, и ускорения нет); «Вечное ×2» — ×2
  if(live){const x2f=typeof payX2==='function'&&payX2(),sp=ringI>=0&&G.speed>=2?(x2f?2:1):G.speed,rem=dt*sp,n=Math.min(4,Math.max(1,Math.ceil(rem*60-1e-6)));if(rem>1e-4)for(let i=0;i<n;i++)update(rem/n);
    if(G.speed>=2&&ringI<0&&!(G.speed<3&&typeof payX2==='function'&&payX2()))boostDrain(dt*(G.speed>=3?2:1));} // «Вечное ×2» (покупка) — ×2 без запаса
  else if(G.over&&(G.fx.length||G.pt.length)){for(const f of G.fx)f.t+=dt;prune(G.fx,f=>f.t<f.dur);for(const p of G.pt){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}prune(G.pt,p=>p.t<p.dur);G.redraw=1;}
  try{if(live||G.redraw||G.aim){G.redraw=0;render();}hudTick();}catch(e){if(!loop.err){loop.err=1;console.error(e);}}}
