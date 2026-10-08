'use strict';
/* ================= OB:MGD №13 «Набег на логово» (id nabeg, kind 'week') — защита башен наоборот =================
   Дружина бежит по дороге к Логову мимо застав нечисти (лучник-скелет, огненный, колдун). На развилках игрок выбирает тропу
   (опасная — с наградой: клетка с пленным ратником, мешок трофеев; тихая — пустая). Чары: «Шапка-невидимка» (нечисть не видит
   дружину, новые выстрелы не летят, летящие мажут) и «Щит» (золотой купол, всё отскакивает) — по 2 заряда. Цель — дойти хоть кем-то.
   Логика (update) отделена от рисования: бот (bot / ?mgbot=good|mid|bad) гоняет ту же логику без экрана.
   Итог: tier 3 — дошли ≥5, 2 — ≥3, 1 — хоть один, 0 — никто; score = 100·дошедшие + 10·сердца + 30·мешки. Сундук недели — оболочка. */
(function(){
const ID='nabeg',START=6,HP=3,SPD=2.15,RNG=3.3,LANE=1.45;
const TT={luk:{art:'skel',cd:2.1,fl:.9,col:'#e8e0c8',n:{ru:'Костяной лучник',en:'Bone Archer'}},
  ogon:{art:'ogon',cd:3.2,fl:1.2,col:'#ff7a1a',splash:.6,n:{ru:'Огненная вышка',en:'Fire Tower'}},
  kold:{art:'koldun',cd:2.8,fl:1.3,col:'#b46aff',n:{ru:'Колдун',en:'Warlock'}}};
const HEROES=['hp_dob','hp_ale','hp_ily','hp_vas','hp_mik','hp_iva','hp_vol','hp_mar','hp_sad'];
const THEME=[
  {g:['#4f8a3e','#3e7432'],road:['#6a4a2a','#9a7448','#b48a58'],deco:['d_pine','d_oak','d_bush','d_stump','d_shroom','d_pine'],wall:'d_pine',acc:'#ffd84a',det:['d_shroom','d_stone','d_stump'],lit:'#ffe66a'},
  {g:['#5e7a46','#4a663a'],road:['#5a4630','#84694a','#9a7c58'],deco:['d_reeds','d_dead','d_shroom','d_bush','d_reeds','d_stump'],wall:'d_dead',acc:'#c8a0ff',det:['d_shroom','d_reeds','d_stone'],lit:'#a0ff7a',dark:1},
  {g:['#7a7a3e','#62632f'],road:['#6e5434','#a07c50','#b8945e'],deco:['d_dry','d_bones','d_stone','d_grave','d_dry','d_dead'],wall:'d_dead',acc:'#c8a0ff',det:['d_bones','d_stone','d_dry'],lit:'#ffd84a'},
  {g:['#56664e','#46563f'],road:['#5e5242','#8e7e60','#a4936e'],deco:['d_dead','d_grave','d_bones','d_crystal','d_dead','d_stone'],wall:'d_dead',acc:'#c8a0ff',det:['d_bones','d_stone','d_shroom','d_crystal'],lit:'#7affb0',dark:1},
  {g:['#c8d8e4','#a8bccc'],road:['#7a8a98','#a8b8c4','#c4d0da'],deco:['d_snowpine','d_icerock','d_iceshard','d_snowpine','d_icerock','d_snowpine'],wall:'d_snowpine',acc:'#e8e0ff',det:['d_icerock','d_iceshard'],lit:'#a0e0ff'},
  {g:['#4a8484','#3a6e6e'],road:['#8a7a5a','#c0a878','#d4c094'],deco:['d_coral','d_shell','d_weed','d_stone','d_coral','d_weed'],wall:'d_coral',acc:'#ffd84a',det:['d_shell','d_stone','d_weed'],lit:'#80f0ff'},
  {g:['#76503a','#62402e'],road:['#4a3428','#7a5844','#906a52'],deco:['d_lava','d_firerock','d_bones','d_firerock','d_dead','d_firerock'],wall:'d_firerock',acc:'#ff8a3a',det:['d_bones','d_firerock','d_stone'],lit:'#ff7a2a',dark:1},
  {g:['#565070','#46405e'],road:['#5a5058','#837684','#9a8c9c'],deco:['d_dead','d_grave','d_crystal','d_bones','d_dead','d_crystal'],wall:'d_dead',acc:'#c8a0ff',det:['d_crystal','d_bones','d_shroom','d_stone'],lit:'#b07aff',dark:1}];

function weekCh(o){const ord=(typeof CH_ORDER!=='undefined'?CH_ORDER:[0,1,2,3,4,5,6,7]).filter(c=>c<8&&CH[c]);const n=Math.max(1,Math.min(ord.length,o&&o.lvl!=null?o.lvl:6));
  const pool=ord.slice(0,n);return pool[((o&&o.seed)>>>0)%pool.length];}

/* ---------- дорога по зерну ---------- */
function genCourse(seed,lvl){const R=mulberry((seed>>>0)^0x9e37),secs=[],towers=[],items=[];let u=5;
  const hard=clamp((lvl-5)*.04,0,.16),plan=['road','fork','road','fork','road','fork','road'];
  const TY=['luk','luk','ogon','kold'],ty=()=>TY[Math.floor(R()*TY.length)];
  for(let si=0;si<plan.length;si++){const k=plan[si];
    if(k==='road'){const len=14+R()*4,n=2+(R()<.45+hard?1:0)+(si>=6?1:0);secs.push({k,u0:u,len});
      for(let j=0;j<n;j++){const tu=u+3+(len-5)*(n>1?j/(n-1):.5)+(R()-.5)*1.2;towers.push({u:tu,v:(j%2?1:-1)*(R()<.5?2.2:2.5),t:ty(),lane:null});}
      if(R()<.6)items.push({u:u+len*(.3+R()*.4),v:0,k:R()<.5?'flask':'bag',lane:null});
      u+=len;}
    else{const len=20,risky=R()<.5?0:1;secs.push({k,u0:u,len,risky,fi:secs.filter(s=>s.k==='fork').length});
      for(const L of[0,1]){const sg=L?1:-1,nT=L===risky?4:2+(R()<.25+hard?1:0);
        for(let j=0;j<nT;j++){const tu=u+5+(len-10)*(nT>1?j/(nT-1):.5)+(R()-.5);towers.push({u:tu,v:sg*(LANE+1.35+R()*.25),t:ty(),lane:[secs.length-1,L]});}
        if(L===risky){items.push({u:u+len*.45,v:null,k:'cage',lane:[secs.length-1,L]});items.push({u:u+len*.72,v:null,k:'bag',lane:[secs.length-1,L]});}}
      if(R()<.45+hard)towers.push({u:u+len/2+(R()-.5)*3,v:0,t:ty(),lane:'mid'});
      u+=len;}}
  const L=u+3;return {secs,towers,items,L};}
function shA(hex,a,al){return shade(hex,a).replace('rgb(','rgba(').replace(')',','+al+')');}
function smooth(t){t=clamp(t,0,1);return t*t*(3-2*t);}
// центр дороги на отметке u при выборе троп ch[номер развилки]
function roadV(C,u,ch){for(let i=0;i<C.secs.length;i++){const s=C.secs[i];if(u<s.u0||u>=s.u0+s.len)continue;if(s.k==='road')return 0;
    const t=u-s.u0,r=3,sg=(ch[s.fi]?1:-1),k=t<r?smooth(t/r):t>s.len-r?smooth((s.len-t)/r):1;return sg*LANE*k;}return 0;}
function laneV(s,L,u){const t=u-s.u0,r=3,k=t<r?smooth(t/r):t>s.len-r?smooth((s.len-t)/r):1;return (L?1:-1)*LANE*k;}

/* ---------- состояние и логика (без рисования) ---------- */
function newState(o){const lvl=o.lvl==null?6:o.lvl,seed=o.seed>>>0,C=genCourse(seed,lvl);
  const R=mulberry(seed^0x51ed),hs=HEROES.slice();for(let i=hs.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[hs[i],hs[j]]=[hs[j],hs[i]];}
  const sq=[];for(let i=0;i<START;i++)sq.push(mkMan(hs[i],i));
  return {C,lvl,calm:!!o.calm,u:0,t:0,ch:[],sq,pool:hs.slice(START),cap:{n:2,t:0},shd:{n:2,t:0},pj:[],ev:[],loot:0,over:0,won:0,slow:0,
    tw:C.towers.map(t=>Object.assign({cd:1+R()*1.2,wind:0,lost:0,hp:1},t)),it:C.items.map(x=>Object.assign({got:0},x)),adUsed:0};}
function mkMan(key,i){return {key,hp:HP,alive:1,slot:i,fl:0,fall:0,hurt:0};}
function slotOff(i){const row=Math.floor(i/2),col=i%2;return [-row*.62,(col?1:-1)*(row%2?.36:.3)];}
function manPos(s,m){const [du,dv]=slotOff(m.slot),u=s.u+du;return [u,roadV(s.C,u,s.ch)+dv];}
function alive(s){return s.sq.filter(m=>m.alive);}
function forkAhead(s){for(const sc of s.C.secs)if(sc.k==='fork'&&sc.u0>s.u-.1&&sc.u0-s.u<9)return sc;return null;}
function reslot(s){let k=0;for(const m of s.sq)if(m.alive)m.slot=k++;}
function update(s,dt,AI){if(s.over)return;s.t+=dt;const calm=s.calm;
  if(s.cap.t>0)s.cap.t-=dt;if(s.shd.t>0)s.shd.t-=dt;
  const fk=forkAhead(s),wait=fk&&s.ch[fk.fi]==null&&fk.u0-s.u<2.2;
  // ждём выбора тропы: в спокойном режиме стоим, иначе медленно идём и на развилке сворачиваем по умолчанию в тихую
  let sp=SPD*(calm?.85:1);if(wait){sp*=calm?0:.35;if(!calm&&fk.u0-s.u<.15)choose(s,fk.fi,fk.risky?0:1);}
  if(AI)AI(s);
  s.u+=sp*dt;
  // подобрать: клетка, мешок, живая вода
  for(const it of s.it){if(it.got)continue;if(it.lane&&s.ch[s.C.secs[it.lane[0]].fi]!==it.lane[1])continue;if(Math.abs(it.u-s.u)<.5){it.got=1;
    if(it.k==='cage'){const k=s.pool.shift()||'hp_iva',m=mkMan(k,0);m.join=s.t;s.sq.push(m);reslot(s);s.ev.push({k:'join',m});}
    else if(it.k==='bag'){s.loot++;s.ev.push({k:'bag',u:it.u});}
    else if(it.k==='flask'){for(const m of s.sq)if(m.alive)m.hp=HP;s.ev.push({k:'heal'});}}}
  // заставы нечисти
  const inv=s.cap.t>0,al=alive(s);
  for(const t of s.tw){if(t.lane&&t.lane!=='mid'&&s.ch[s.C.secs[t.lane[0]].fi]!==t.lane[1]){continue;}
    const d=Math.hypot(t.u-s.u,t.v-roadV(s.C,s.u,s.ch)),T=TT[t.t];t.lost=inv&&d<RNG+1?Math.max(t.lost,.3):Math.max(0,t.lost-dt);
    if(t.wind>0){t.wind-=dt;if(t.wind<=0){if(inv||!al.length){t.cd=.8;continue;}const m=al[Math.floor(hash(Math.floor(s.t*97),t.u*13|0,7)*al.length)];
        s.pj.push({tw:t,t:t.t,m,u0:t.u,v0:t.v+.0,tu:0,tv:0,a:0,fl:T.fl*(calm?1.3:1)});s.ev.push({k:'shot',tw:t});}continue;}
    if(inv&&d<RNG+1){t.cd=Math.max(t.cd,T.cd*.6);continue;}   // под шапкой нечисть ищет дружину заново
    t.cd-=dt;if(t.cd<=0&&d<RNG&&!inv&&al.length){t.wind=.45;t.cd=T.cd*(calm?1.4:1)*(.9+hash(t.u*7|0,s.t*3|0,3)*.2);}}
  // снаряды
  for(let i=s.pj.length-1;i>=0;i--){const p=s.pj[i];p.a+=dt/p.fl;if(!p.lost&&(inv||!p.m.alive))p.lost=1;
    if(!p.lost){const [mu,mv]=manPos(s,p.m);p.tu=mu;p.tv=mv;}
    if(p.a>=1){s.pj.splice(i,1);
      if(p.lost){s.ev.push({k:'miss',u:p.tu,v:p.tv,t:p.t});continue;}
      if(s.shd.t>0){s.ev.push({k:'block',u:p.tu,v:p.tv,t:p.t});continue;}
      const hit=[p.m];if(TT[p.t].splash)for(const m of alive(s))if(m!==p.m){const [a,b]=manPos(s,m);if(Math.hypot(a-p.tu,b-p.tv)<TT[p.t].splash)hit.push(m);}
      s.ev.push({k:'boom',u:p.tu,v:p.tv,t:p.t});
      for(const m of hit){if(!m.alive)continue;m.hp--;m.hurt=.35;if(p.t==='kold')s.slow=.6;s.ev.push({k:'hit',m});if(m.hp<=0){m.alive=0;m.fall=s.t;s.ev.push({k:'down',m});}}
      if(hit.some(m=>!m.alive))reslot(s);}}
  if(s.slow>0){s.slow-=dt;s.u-=SPD*.35*dt;}
  if(!alive(s).length){s.over=1;s.won=0;s.ev.push({k:'lose'});}
  else if(s.u>=s.C.L){s.over=1;s.won=1;s.ev.push({k:'win'});}}
function choose(s,fi,L){if(s.ch[fi]!=null)return;s.ch[fi]=L;s.ev.push({k:'choose',fi,L});}
function cast(s,k){const c=s[k];if(c.n<=0||c.t>0||s.over)return false;c.n--;c.t=k==='cap'?(s.calm?4.5:3.5):(s.calm?5:4);s.ev.push({k:'cast',w:k});return true;}
function resultOf(s){const al=alive(s),n=s.won?al.length:0,hp=s.won?al.reduce((a,m)=>a+m.hp,0):0;return {score:n*100+hp*10+s.loot*30,tier:!n?0:n>=5?3:n>=3?2:1,alive:n,loot:s.loot};}
// ИИ бота: good — тихая тропа (или опасная, если там всего на 1 больше застав и есть пленный), щит на 2+ летящих, шапка перед кучей застав;
// mid — тропы как выпадет, чары поздно; bad — без чар
function botAI(q){let r=null;return s=>{if(!r)r=mulberry((s.C.L*1000|0)^(q.length*77));const fk=forkAhead(s);
  if(fk&&s.ch[fk.fi]==null&&fk.u0-s.u<6){if(q==='good'){const cnt=L=>s.tw.filter(t=>t.lane&&t.lane[0]===s.C.secs.indexOf(fk)&&t.lane[1]===L).length;const safe=fk.risky?0:1;choose(s,fk.fi,s.cap.n+s.shd.n>=2?fk.risky:safe);}else choose(s,fk.fi,r()<.5?0:1);}
  if(q==='bad')return;const fly=s.pj.filter(p=>!p.lost&&p.a<.85).length,near=s.tw.filter(t=>(!t.lane||t.lane==='mid'||s.ch[s.C.secs[t.lane[0]].fi]===t.lane[1])&&Math.abs(t.u-s.u)<RNG&&t.u>s.u-1).length;
  if(s.shd.t<=0&&s.cap.t<=0){if(q==='good'){if((near>=3||near>=2&&s.u>s.C.L*.55)&&s.cap.n)cast(s,'cap');else if(fly>=2)cast(s,'shd');}else if(fly>=2)cast(s,'shd');}};}
function botSim(o){o=o||{};const q=o.q||'mid',s=newState({lvl:o.lvl==null?6:o.lvl,seed:o.seed==null?12345:o.seed,calm:o.calm}),ai=botAI(q);let n=0;while(!s.over&&n<20000){update(s,1/30,ai);s.ev.length=0;n++;}return resultOf(s);}

/* ---------- игра на экране ---------- */
function run(host,o){o=Object.assign({},o||{});{const m=/[?&]mgbot=(good|mid|bad)/.exec(location.search);if(m&&!o.bot)o.bot=m[1];}
  const st=MGD.stage(host),g=st.g,c=weekCh(o),TH=THEME[c]||THEME[0],bossKey=(EN[CH[c].boss]&&EN[CH[c].boss].art)||CH[c].boss;
  const s=newState(o),ai=o.bot?botAI(o.bot):null;let phase='intro',endT=0,doneSent=false,U=50,wide=false,camU=0,shake=0,tex=null,gate=0,chest=0,ann=null;
  const deco=[],lights=[];{const R=mulberry((s.C.L*977|0)^c);for(let u=-8;u<s.C.L+14;u+=.55){for(const sd of[-1,1]){if(R()<.45)continue;const v=sd*(2.0+R()*3.2);
      const lanes=[roadV(s.C,u,[0]),roadV(s.C,u,[1,1,1,1]),roadV(s.C,u,[0,0,0,0])];let ok=true;for(const lv of lanes)if(Math.abs(v-lv)<1.1)ok=false;for(const t of s.C.towers)if(Math.hypot(t.u-u,t.v-v)<1.1)ok=false;
      if(ok)deco.push({u:u+R()*.4,v,k:TH.deco[Math.floor(R()*TH.deco.length)],sz:(Math.abs(v)>3.6?1.25:.8)+R()*.5,f:R()<.5});}}
    for(let u=-6;u<s.C.L+10;u+=.45)for(const sd of[-1,1]){if(R()<.5)continue;const lv=roadV(s.C,u,[0,0,0,0]),lv2=roadV(s.C,u,[1,1,1,1]),base=sd<0?Math.min(lv,lv2):Math.max(lv,lv2),v=base+sd*(.8+R()*.7);if(s.C.towers.some(t=>Math.hypot(t.u-u,t.v-v)<.9))continue;deco.push({u,v,k:TH.det[Math.floor(R()*TH.det.length)],sz:.35+R()*.25,f:R()<.5});}
    for(let u=-4;u<s.C.L+8;u+=TH.dark?2.2:4){lights.push({u:u+R()*1.5,v:(R()<.5?-1:1)*(1.2+R()*2.4),r:.8+R()*.8,p:R()*6});}
    for(let u=-8;u<s.C.L+14;u+=.8)for(const sd of[-1,1]){const v=sd*(3.7+R()*1.8);if(s.C.towers.some(t=>Math.hypot(t.u-u,t.v-v)<1.4))continue;deco.push({u:u+R()*.5,v,k:TH.wall,sz:1.6+R()*.6,f:R()<.5});}}
  /* --- перевод мира в экран: стоя — дорога снизу вверх, лёжа — слева направо --- */
  function layout(){wide=st.W>st.H*1.1;U=wide?Math.min(st.H/7.6,st.W/12):Math.min(st.W/7.2,st.H/11);tex=null;}
  st.onResize=layout;layout();
  const P=(u,v)=>wide?[st.W*.3+(u-camU)*U,st.H*.52+v*U]:[st.W/2+v*U,st.H*.7-(u-camU)*U];
  const visU=()=>wide?[camU-st.W*.3/U-2,camU+st.W*.7/U+3]:[camU-st.H*.3/U-2,camU+st.H*.7/U+3];

  /* --- управление --- */
  st.onDown=(x,y)=>{if(phase!=='play')return;const fk=forkAhead(s);if(fk&&s.ch[fk.fi]==null){const mid=fk.u0+fk.len*.5,[ax,ay]=P(mid,laneV(fk,0,mid)),[bx,by]=P(mid,laneV(fk,1,mid));
      if(Math.hypot(x-ax,y-ay)<Math.hypot(x-bx,y-by))pickLane(fk,0);else pickLane(fk,1);}};
  st.onKey=(k,d)=>{if(!d)return false;if(phase==='intro'&&(k==='Enter'||k===' ')){begin();return true;}if(phase!=='play')return false;
    if(k==='q'||k==='Q'||k==='1'){useSpell('cap');return true;}if(k==='w'||k==='W'||k==='2'){useSpell('shd');return true;}
    const fk=forkAhead(s);if(fk&&s.ch[fk.fi]==null){if(k===(wide?'ArrowUp':'ArrowLeft')){pickLane(fk,0);return true;}if(k===(wide?'ArrowDown':'ArrowRight')){pickLane(fk,1);return true;}}return false;};
  function pickLane(fk,L){if(s.ch[fk.fi]!=null)return;choose(s,fk.fi,L);}
  function useSpell(k){if(phase!=='play')return;if(cast(s,k)){}else MGD.sfx('click');}
  function askReinf(){if(s.adUsed||phase!=='play')return;st.paused=true;Promise.resolve(host.ad?host.ad('more'):false).then(ok=>{st.paused=false;if(ok&&!s.over){s.adUsed=1;
      for(let i=0;i<2;i++){const m=mkMan(s.pool.shift()||'hp_iva',0);m.join=s.t;s.sq.push(m);}reslot(s);MGD.sfx('up');ann={s:Lg('Подкрепление!','Reinforcements!'),t:st.t};}}).catch(()=>{st.paused=false;});}
  const adOk=()=>!o.bot&&!!host.ad&&(!host.adOk||host.adOk());
  function begin(){if(phase!=='intro')return;phase='play';MGD.sfx('wave');ann={s:Lg('В набег!','Charge!'),t:st.t};}

  /* --- события логики → звук и частицы --- */
  function events(){for(const e of s.ev){
    if(e.k==='shot'){const [x,y]=P(e.tw.u,e.tw.v);MGD.sfx(e.tw.t==='luk'?'arrow':e.tw.t==='ogon'?'cannon':'zap');}
    else if(e.k==='hit'){const [u,v]=manPos(s,e.m),[x,y]=P(u,v);e.m.fl=.18;MGD.num(st,x,y-U*.6,'-1','#ff6a5a',Math.max(18,U*.36));MGD.burst(st,x,y-U*.2,8,{col:'#ff5a3a',r:U*.07,v:U*2});if(!REDUCED)shake=Math.max(shake,.18);}
    else if(e.k==='down'){const [u,v]=manPos(s,e.m),[x,y]=P(u,v);MGD.puff(st,x,y,U*.6,6);MGD.sfx('lose');e.m.fx=x;e.m.fy=y;}
    else if(e.k==='boom'){const [x,y]=P(e.u,e.v);if(e.t==='ogon'){MGD.puff(st,x,y,U*.55,5,{col:'#ff8a3a'});MGD.burst(st,x,y,12,{col:'#ffb02a',r:U*.08,v:U*2.5});MGD.sfx('boom');}else MGD.burst(st,x,y,5,{col:TT[e.t].col,r:U*.06,v:U*1.5});}
    else if(e.k==='block'){const [x,y]=P(e.u,e.v);MGD.burst(st,x,y,10,{col:'#ffe066',r:U*.09,v:U*2.6});MGD.fxAdd(st,{k:'ring',x,y,vx:0,vy:0,r:U*.7,col:'#ffe680',dur:.4});MGD.sfx('coin');}
    else if(e.k==='miss'){const [x,y]=P(e.u+(hash(e.u*9|0,3,1)-.5)*1.5,e.v+(hash(e.v*9|0,5,1)-.5)*1.5);MGD.puff(st,x,y,U*.3,3);}
    else if(e.k==='join'){const [u,v]=manPos(s,e.m),[x,y]=P(u,v);MGD.burst(st,x,y-U*.3,16,{col:'#ffd84a',r:U*.1,v:U*3});MGD.num(st,x,y-U*.9,Lg('+1 ратник','+1 warrior'),'#ffe066',Math.max(18,U*.34));MGD.sfx('up');}
    else if(e.k==='bag'){const [x,y]=P(s.u,roadV(s.C,s.u,s.ch));MGD.burst(st,x,y-U*.4,14,{col:'#ffd84a',r:U*.09,v:U*2.6});MGD.num(st,x,y-U,'+30','#ffe066',Math.max(18,U*.36));MGD.sfx('coin');}
    else if(e.k==='heal'){for(const m of alive(s)){const [u,v]=manPos(s,m),[x,y]=P(u,v);MGD.burst(st,x,y-U*.3,5,{col:'#7aff8a',r:U*.07,v:U*1.4,up:U});}MGD.sfx('up');}
    else if(e.k==='cast'){MGD.sfx(e.w==='shd'?'build':'purr');const [x,y]=P(s.u-.6,roadV(s.C,s.u,s.ch));MGD.fxAdd(st,{k:'ring',x,y,vx:0,vy:0,r:U*2,col:e.w==='shd'?'#ffe066':'#a0d8ff',dur:.5,w:6});}
    else if(e.k==='choose'){MGD.sfx('click');}
    else if(e.k==='win'){phase='end';endT=st.t;ann={s:Lg('Логово взято!','Lair taken!'),t:st.t+.4};MGD.sfx('boss');setTimeout(()=>MGD.sfx('win'),600);}
    else if(e.k==='lose'){phase='lost';endT=st.t;ann={s:Lg('Дружина отступила…','The warband retreats…'),t:st.t};MGD.sfx('lose');}}
    s.ev.length=0;}

  /* --- фон --- */
  function groundTex(){const n=256,cv=mkCanvas(n,n),q=cv.getContext('2d');q.fillStyle=TH.g[0];q.fillRect(0,0,n,n);
    for(let i=0;i<70;i++){const x=hash(i,1,c)*n,y=hash(i,2,c)*n,r=8+hash(i,3,c)*30;q.fillStyle=hash(i,4,c)<.5?rgba(TH.g[1],.4):shA(TH.g[0],.16,.3);for(const dx of[-n,0,n])for(const dy of[-n,0,n]){q.beginPath();q.ellipse(x+dx,y+dy,r,r*.7,0,0,TAU);q.fill();}}
    q.strokeStyle=shA(TH.g[0],.3,.55);q.lineWidth=1.2;for(let i=0;i<160;i++){const x=hash(i,5,c)*n,y=hash(i,6,c)*n;q.beginPath();q.moveTo(x-3,y);q.lineTo(x-1,y-5);q.moveTo(x,y);q.lineTo(x+.5,y-6);q.moveTo(x+3,y);q.lineTo(x+2,y-4);q.stroke();}
    for(let i=0;i<14;i++){const x=hash(i,8,c)*n,y=hash(i,9,c)*n,r=1.4+hash(i,10,c)*1.2;q.fillStyle=i%3?rgba(TH.acc,.85):'rgba(255,255,255,.75)';for(let k=0;k<5;k++){q.beginPath();q.arc(x+Math.cos(k*1.26)*r*1.3,y+Math.sin(k*1.26)*r*1.3,r,0,TAU);q.fill();}}
    for(let i=0;i<12;i++){const x=hash(i,11,c)*n,y=hash(i,12,c)*n;q.fillStyle='rgba(0,0,0,.08)';q.beginPath();q.ellipse(x+.8,y+1.2,2+hash(i,13,c)*2,1.4+hash(i,14,c)*1.2,0,0,TAU);q.fill();q.fillStyle=shA(TH.g[0],.45,.7);q.beginPath();q.ellipse(x,y,2+hash(i,13,c)*2,1.4+hash(i,14,c)*1.2,0,0,TAU);q.fill();}
    if(TH.dark){q.strokeStyle='rgba(20,10,10,.35)';q.lineWidth=1.3;for(let i=0;i<10;i++){let x=hash(i,15,c)*n,y=hash(i,16,c)*n;q.beginPath();q.moveTo(x,y);for(let k=0;k<4;k++){x+=(hash(i,17+k,c)-.5)*30;y+=(hash(i,21+k,c)-.5)*30;q.lineTo(x,y);}q.stroke();}
      q.fillStyle=shA(TH.g[0],.35,.45);for(let i=0;i<40;i++){const x=hash(i,30,c)*n,y=hash(i,31,c)*n;q.beginPath();q.ellipse(x,y,4+hash(i,32,c)*6,2+hash(i,33,c)*3,hash(i,34,c)*3,0,TAU);q.fill();}}
    return cv;}
  function drawMist(){const cl=MGD.cloud();if(!cl)return;g.save();g.globalAlpha=.16;for(let i=0;i<7;i++){const r=U*(2.5+hash(i,1,5)*2),[x,y]=P(Math.floor(camU/14)*14+hash(i,2,5)*28-6+st.t*.15*(hash(i,3,5)-.3),(hash(i,4,5)-.5)*8);g.drawImage(cl,x-r,y-r*.6,r*2,r*1.2);}g.restore();}
  function drawGround(){if(!tex)tex=g.createPattern(groundTex(),'repeat');const [ox,oy]=P(0,0),k=U/48;g.save();g.translate(ox%(256*k),oy%(256*k));g.scale(k,k);g.fillStyle=tex;g.fillRect(-512,-512,st.W/k+1024,st.H/k+1024);g.restore();}
  function strokeLane(fn,w,col){const [u0,u1]=visU();g.strokeStyle=col;g.lineWidth=w;g.beginPath();let first=true;for(let u=Math.max(-6,u0);u<=Math.min(s.C.L+2,u1);u+=.35){const v=fn(u);if(v==null){first=true;continue;}const [x,y]=P(u,v);if(first){g.moveTo(x,y);first=false;}else g.lineTo(x,y);}g.stroke();}
  function lanesFns(){const f=[u=>{for(const sc of s.C.secs)if(sc.k==='fork'&&u>sc.u0+.05&&u<sc.u0+sc.len-.05)return null;return 0;}];
    for(const sc of s.C.secs)if(sc.k==='fork')for(const L of[0,1])f.push(u=>u>=sc.u0-.2&&u<=sc.u0+sc.len+.2?laneV(sc,L,clamp(u,sc.u0,sc.u0+sc.len)):null);return f;}
  let LF=null;
  function drawRoad(){if(!LF)LF=lanesFns();const W=U*1.18;for(const [w,col] of[[W*1.12,rgba('#000000',.28)],[W,TH.road[0]],[W*.84,TH.road[1]],[W*.34,TH.road[2]]])for(const f of LF)strokeLane(f,w,col);
    // колеи: две тёмные борозды со светлым бортиком
    for(const f of LF)for(const d of[-.25,.25]){const fo=u=>{const v=f(u);return v==null?null:v+d;};strokeLane(fo,W*.09,shA(TH.road[2],.35,.35));const fo2=u=>{const v=f(u);return v==null?null:v+d+.03;};strokeLane(fo2,W*.06,rgba(TH.road[0],.6));}
    // трава на кромке тропы
    {const [u0,u1]=visU();g.strokeStyle=shA(TH.g[0],TH.dark?.25:.15,.9);g.lineWidth=Math.max(1.2,U*.03);for(let u=Math.ceil(u0*3)/3;u<u1;u+=1/3)for(const f of LF){const v=f(u);if(v==null)continue;for(const sd of[-1,1]){if(hash(u*3|0,sd+5,c)<.35)continue;const [x,y]=P(u+hash(u*3|0,sd,c)*.3,v+sd*.6),k=U*.1;g.beginPath();g.moveTo(x-k*.6,y);g.lineTo(x-k*.3,y-k*1.4);g.moveTo(x,y);g.lineTo(x+k*.1,y-k*1.8);g.moveTo(x+k*.6,y);g.lineTo(x+k*.4,y-k*1.3);g.stroke();}}}
    // камешки и колеи
    const [u0,u1]=visU();for(let u=Math.ceil(u0*2)/2;u<u1;u+=.5){for(const f of LF){const v=f(u);if(v==null)continue;for(let k=0;k<2;k++){const h=hash(u*2|0,k+(v>0?3:v<0?7:0),c);if(h>.55)continue;const [x,y]=P(u+h,v+(hash(u*2|0,k+9,c)-.5)*.9);g.fillStyle=h<.25?rgba(TH.road[0],.8):rgba('#ffffff',.25);g.beginPath();g.ellipse(x,y,U*(.04+h*.06),U*(.03+h*.04),h*5,0,TAU);g.fill();}}}}
  /* --- заставы нечисти (рисованные вышки) --- */
  const TWC={};
  function towerImg(t){const k=t+'@'+Math.round(U*st.dpr);if(TWC[k])return TWC[k];const S0=U*1.7,cv=mkCanvas(S0*st.dpr,S0*1.6*st.dpr),q=cv.getContext('2d');q.scale(st.dpr,st.dpr);q.lineCap='round';q.lineJoin='round';
    const cx=S0/2,by=S0*1.5,w=S0*.36,h=S0*.75,wood=t==='ogon'?'#5a3226':t==='kold'?'#3e3450':'#5a4a36',roof=t==='ogon'?'#8a2a1a':t==='kold'?'#4a2a70':'#3a3a2a';
    // сваи
    q.strokeStyle=shade(wood,-.35);q.lineWidth=S0*.07;for(const d of[-1,1]){q.beginPath();q.moveTo(cx+d*w*.75,by);q.lineTo(cx+d*w*.55,by-h);q.stroke();}
    q.lineWidth=S0*.04;q.beginPath();q.moveTo(cx-w*.7,by-h*.3);q.lineTo(cx+w*.6,by-h*.7);q.moveTo(cx+w*.7,by-h*.3);q.lineTo(cx-w*.6,by-h*.7);q.stroke();
    // помост
    let gr=q.createLinearGradient(0,by-h-S0*.12,0,by-h+S0*.1);gr.addColorStop(0,shade(wood,.25));gr.addColorStop(1,shade(wood,-.2));q.fillStyle=gr;MGD.rr(q,cx-w,by-h-S0*.08,w*2,S0*.16,3);q.fill();q.strokeStyle=shade(wood,-.55);q.lineWidth=1.5;q.stroke();
    // зубцы-колья
    q.fillStyle=shade(wood,.1);for(let i=0;i<5;i++){const x=cx-w+w*2*(i+.5)/5;q.beginPath();q.moveTo(x-S0*.035,by-h-S0*.06);q.lineTo(x,by-h-S0*.2);q.lineTo(x+S0*.035,by-h-S0*.06);q.closePath();q.fill();q.stroke();}
    // флажок с черепом-знаком
    q.strokeStyle='#2a1a0a';q.lineWidth=2;q.beginPath();q.moveTo(cx+w*.95,by-h);q.lineTo(cx+w*.95,by-h-S0*.62);q.stroke();q.fillStyle=t==='ogon'?'#d83a1a':t==='kold'?'#8a3ad8':'#6a6a5a';
    q.beginPath();q.moveTo(cx+w*.95,by-h-S0*.62);q.quadraticCurveTo(cx+w*1.35,by-h-S0*.58,cx+w*1.6,by-h-S0*.5);q.lineTo(cx+w*.95,by-h-S0*.38);q.closePath();q.fill();
    // огонь в чаше у огненной, кристалл у колдуна
    if(t==='ogon'){q.fillStyle='#3a2a20';q.beginPath();q.ellipse(cx-w*.95,by-h-S0*.05,S0*.09,S0*.05,0,0,TAU);q.fill();}
    return TWC[k]={c:cv,w:S0,h:S0*1.6,ax:cx,ay:by,top:by-h-S0*.06};}
  function drawTower(t){const [x,y]=P(t.u,t.v),im=towerImg(t.t),T=TT[t.t],dim=t.lane&&t.lane!=='mid'&&s.ch[s.C.secs[t.lane[0]].fi]!=null&&s.ch[s.C.secs[t.lane[0]].fi]!==t.lane[1];
    g.save();if(dim)g.globalAlpha=.55;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y,U*.6,U*.2,0,0,TAU);g.fill();
    // круг досягаемости — едва заметный, ближе к дружине ярче
    const d=Math.hypot(t.u-s.u,t.v-roadV(s.C,s.u,s.ch));if(!dim&&d<RNG+1.6&&t.u>s.u-1&&phase==='play'){const a=clamp(1-(d-RNG)/1.6,0,1)*.16;g.strokeStyle='rgba(255,70,50,'+a+')';g.setLineDash([U*.18,U*.14]);g.lineWidth=2;g.beginPath();g.ellipse(x,y,RNG*U,RNG*U,0,0,TAU);g.stroke();g.setLineDash([]);}
    g.drawImage(im.c,x-im.ax,y-im.ay,im.w,im.h);
    const wind=t.wind>0?1-t.wind/.45:0,ey=y-im.ay+im.top-U*.32,bob=Math.sin(st.t*3+t.u)*U*.03;
    if(wind>0){g.globalAlpha=(dim?.5:1)*wind;g.drawImage(glowSpr(T.col),x-U*.6,ey-U*.6,U*1.2,U*1.2);g.globalAlpha=dim?.55:1;}
    MGD.put(g,st.dpr,T.art,x,ey+bob-wind*U*.05,U*(t.t==='kold'?.95:.85),x>st.W/2);
    if(t.lost>0){MGD.txt(g,'?',x+U*.3,ey-U*.55,U*.45,'#a0d8ff');}
    if(t.t==='ogon'){const f=Math.sin(st.t*13+t.u)*U*.03;g.fillStyle='#ff7a1a';g.beginPath();g.moveTo(x-im.w*.36*.95-U*.08,y-im.ay+im.top);g.quadraticCurveTo(x-im.w*.34,y-im.ay+im.top-U*.32-f,x-im.w*.36*.95+U*.08,y-im.ay+im.top);g.fill();}
    g.restore();}
  /* --- дружина --- */
  function drawMan(m){if(!m.alive){const a=st.t-m.fall;if(a>1.1||m.fx==null)return;const q=a/1.1;g.save();g.globalAlpha=1-q;g.translate(m.fx,m.fy-Math.sin(q*Math.PI)*U*.8);g.rotate(q*Math.PI*1.6);MGD.put(g,st.dpr,m.key,0,0,U*.85,false);g.restore();return;}
    const [u,v]=manPos(s,m),[x,y]=P(u,v),run=phase==='play'||phase==='end',ph=st.t*11+m.slot*1.7,bob=run?Math.abs(Math.sin(ph))*U*.09:0,jn=m.join!=null?clamp((s.t-m.join)/.5,0,1):1;
    g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+U*.28,U*.26,U*.09,0,0,TAU);g.fill();
    g.save();if(s.cap.t>0)g.globalAlpha=.38+.12*Math.sin(st.t*8+m.slot);g.translate(x,y-bob);g.rotate(run?Math.sin(ph)*.07:0);const sz=U*.92*(.4+.6*MGD.ease.back(jn));
    if(m.fl>0&&!REDUCED){MGD.putFlash(g,st.dpr,m.key,0,-U*.12,sz);}else MGD.put(g,st.dpr,m.key,0,-U*.12,sz,wide?false:m.slot%2===1);g.restore();
    // сердечки
    if(m.hp<HP){for(let k=0;k<HP;k++){MGD.ICO.heart(g,x-U*.2+k*U*.2,y-U*.7,U*.075,k<m.hp?'#e0303a':'#5a4a4a');}}}
  /* --- снаряды --- */
  function drawPj(p){const T=TT[p.t],[x0,y0]=P(p.u0,p.v0),tw=towerImg(p.t),sy0=y0-tw.ay+tw.top-U*.35,[x1,y1]=P(p.tu||p.u0,p.tv||p.v0),a=clamp(p.a,0,1);
    let x=lerp(x0,x1,a),y=lerp(sy0,y1-U*.2,a);if(p.t==='ogon')y-=Math.sin(a*Math.PI)*U*1.4;if(p.t==='kold'){x+=Math.sin(a*12)*U*.12;}
    if(p.t==='luk'){const b=Math.min(1,a+.05),xn=lerp(x0,x1,b),yn=lerp(sy0,y1-U*.2,b),an=Math.atan2(yn-y,xn-x);g.save();g.translate(x,y);g.rotate(an);g.strokeStyle='#5a3a1a';g.lineWidth=2.2;g.beginPath();g.moveTo(-U*.28,0);g.lineTo(U*.2,0);g.stroke();
      g.fillStyle='#cfd6de';g.beginPath();g.moveTo(U*.28,0);g.lineTo(U*.16,-U*.06);g.lineTo(U*.16,U*.06);g.fill();g.fillStyle='#e8e0c8';g.beginPath();g.moveTo(-U*.28,0);g.lineTo(-U*.36,-U*.07);g.lineTo(-U*.2,0);g.lineTo(-U*.36,U*.07);g.fill();g.restore();}
    else{const r=p.t==='ogon'?U*.2:U*.16;g.drawImage(glowSpr(T.col),x-r*2.4,y-r*2.4,r*4.8,r*4.8);g.fillStyle=p.t==='ogon'?'#ffd060':'#e8c8ff';g.beginPath();g.arc(x,y,r*.55,0,TAU);g.fill();
      if(Math.random()<.5)MGD.fxAdd(st,{k:'dot',x,y,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*20,r:r*.4,col:T.col,dur:.35});}}
  /* --- подбираемое --- */
  function drawItem(it){if(it.got)return;const sc=it.lane?s.C.secs[it.lane[0]]:null,v=it.v!=null?it.v:laneV(sc,it.lane[1],it.u),[x,y]=P(it.u,v),b=Math.sin(st.t*3+it.u)*U*.05,dim=sc&&s.ch[sc.fi]!=null&&s.ch[sc.fi]!==it.lane[1];
    g.save();if(dim)g.globalAlpha=.4;
    if(it.k==='cage'){g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+U*.3,U*.42,U*.12,0,0,TAU);g.fill();MGD.put(g,st.dpr,s.pool[0]||'hp_iva',x,y-U*.1,U*.8,false);
      g.strokeStyle='#4a3a2a';g.lineWidth=U*.06;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(x+k*U*.17,y-U*.55);g.lineTo(x+k*U*.17,y+U*.3);g.stroke();}g.lineWidth=U*.09;g.beginPath();g.moveTo(x-U*.42,y-U*.55);g.lineTo(x+U*.42,y-U*.55);g.moveTo(x-U*.42,y+U*.3);g.lineTo(x+U*.42,y+U*.3);g.stroke();
      if(!dim)MGD.txt(g,Lg('Пленник!','Captive!'),x,y-U*.85+b,Math.max(13,U*.26),'#ffe066');}
    else{g.globalAlpha*=.7;g.drawImage(glowSpr(it.k==='flask'?'#7aff8a':'#ffd84a'),x-U*.5,y-U*.6+b,U,U);g.globalAlpha=dim?.4:1;MGD.put(g,st.dpr,it.k==='flask'?'flaskG':'trf_bag',x,y-U*.12+b,U*.62,false);}
    g.restore();}
  /* --- Логово в конце дороги --- */
  function drawLairGate(){const [x,y]=P(s.C.L+2.3,0),S0=U*1.35,t=st.t,br=phase==='end'?clamp((st.t-endT-.3)/.6,0,1):0;g.save();g.translate(x,y);
    g.globalAlpha=.5;g.drawImage(glowSpr('#ff4a1a'),-S0*3,-S0*3.2,S0*6,S0*5);g.globalAlpha=1;
    // частокол
    for(let k=-6;k<=6;k++){if(Math.abs(k)<=1)continue;const px=k*S0*.33,h=S0*(1.25+hash(k,1,c)*.25);let gr=g.createLinearGradient(px-S0*.16,0,px+S0*.16,0);gr.addColorStop(0,'#5a3a1e');gr.addColorStop(1,'#3a2410');
      g.fillStyle=gr;g.beginPath();g.moveTo(px-S0*.16,S0*.3);g.lineTo(px-S0*.16,-h+S0*.15);g.lineTo(px,-h-S0*.05);g.lineTo(px+S0*.16,-h+S0*.15);g.lineTo(px+S0*.16,S0*.3);g.closePath();g.fill();g.strokeStyle='#1e1206';g.lineWidth=1.5;g.stroke();
      if(k%3===0&&ART.skull)MGD.put(g,st.dpr,'skull',px,-h-S0*.18,S0*.36,false);}
    // ворота
    const gw=S0*.95;g.fillStyle='#120806';MGD.rr(g,-gw,-S0*1.5,gw*2,S0*1.8,S0*.5);g.fill();
    if(br<1){for(const d of[-1,1]){g.save();g.translate(d*gw,0);g.rotate(d*br*1.2);g.globalAlpha=1-br*.6;let gr=g.createLinearGradient(0,-S0*1.5,0,S0*.3);gr.addColorStop(0,'#7a5030');gr.addColorStop(1,'#4a2c14');g.fillStyle=gr;
      g.fillRect(d<0?0:-gw,-S0*1.4,gw,S0*1.7);g.strokeStyle='#2a1808';g.lineWidth=2;for(let k=1;k<4;k++){const xx=(d<0?0:-gw)+gw*k/4;g.beginPath();g.moveTo(xx,-S0*1.4);g.lineTo(xx,S0*.3);g.stroke();}
      g.fillStyle='#8a8a90';g.fillRect(d<0?0:-gw,-S0*1.0,gw,S0*.12);g.fillRect(d<0?0:-gw,-S0*.2,gw,S0*.12);g.restore();}}
    // босс недели над воротами
    if(wide)MGD.put(g,st.dpr,bossKey,S0*2.9,-S0*.9+Math.sin(t*1.4)*S0*.06-(phase==='end'?br*S0*.4:0),S0*1.7,true);else MGD.put(g,st.dpr,bossKey,0,-S0*1.95+Math.sin(t*1.4)*S0*.06-(phase==='end'?br*S0*.4:0),S0*1.6,false);
    if(chest>0){const k=MGD.ease.back(clamp(chest,0,1));g.save();g.translate(0,-S0*.35);g.scale(k,k);g.globalAlpha=.9;g.drawImage(glowSpr('#ffd84a'),-S0*1.2,-S0*1.2,S0*2.4,S0*2.4);g.globalAlpha=1;MGD.put(g,st.dpr,'chest',0,0,S0*1.2,false);g.restore();}
    g.restore();}

  /* --- кадр --- */
  function frame(dt){const W=st.W,H=st.H;
    if(phase==='play'||phase==='end'){if(phase==='play')update(s,dt,ai);for(const m of s.sq){if(m.fl>0)m.fl-=dt;if(m.hurt>0)m.hurt-=dt;}events();
      if(phase==='end'){s.u+=SPD*.8*dt*(s.u<s.C.L+.5?1:0);chest=Math.max(0,(st.t-endT-.9)/.5);if(st.t-endT>.3&&!gate){gate=1;MGD.sfx('boom');const [x,y]=P(s.C.L+2.3,0);MGD.puff(st,x,y-U*.6,U*1.2,10);MGD.burst(st,x,y-U,30,{col:'#ffd84a',r:U*.12,v:U*4});shake=.4;}
        if(st.t-endT>2.6&&!doneSent)finish();}}
    if(phase==='lost'){events();if(st.t-endT>2.2&&!doneSent)finish();}
    camU+=(s.u-camU)*Math.min(1,dt*5);if(Math.abs(s.u-camU)>6)camU=s.u;
    if(shake>0)shake-=dt;const sx=shake>0&&!REDUCED?(Math.random()-.5)*10*shake:0,sy=shake>0&&!REDUCED?(Math.random()-.5)*10*shake:0;
    g.save();g.translate(sx,sy);g.fillStyle=TH.g[1];g.fillRect(-20,-20,W+40,H+40);drawGround();
    {const e=wide?g.createLinearGradient(0,0,0,H):g.createLinearGradient(0,0,W,0);e.addColorStop(0,'rgba(0,0,0,.35)');e.addColorStop(.22,'rgba(0,0,0,0)');e.addColorStop(.78,'rgba(0,0,0,0)');e.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=e;g.fillRect(-20,-20,W+40,H+40);}
    drawRoad();drawMist();
    {const [u0,u1]=visU();g.save();g.globalCompositeOperation='lighter';for(const l of lights){if(l.u<u0-2||l.u>u1+2)continue;const [x,y]=P(l.u,l.v),r=U*l.r*(1+.12*Math.sin(st.t*2+l.p));g.globalAlpha=TH.dark?.32:.18;g.drawImage(glowSpr(TH.lit),x-r,y-r,r*2,r*2);g.globalAlpha=TH.dark?.9:.6;g.fillStyle=TH.lit;MGD.fx4(g,x,y-Math.sin(st.t*1.5+l.p)*U*.15,U*.06);}
      if(TH.dark&&alive(s).length){const [x,y]=P(s.u-.5,roadV(s.C,s.u-.5,s.ch)),r=U*2.6;g.globalAlpha=.22+.03*Math.sin(st.t*7);g.drawImage(glowSpr('#ffb050'),x-r,y-r,r*2,r*2);}g.restore();}
    // всё «стоячее» — по глубине (ниже на экране — ближе)
    const [u0,u1]=visU(),L=[];
    for(const d of deco)if(d.u>u0-1&&d.u<u1+1){const [x,y]=P(d.u,d.v);L.push([y,()=>MGD.put(g,st.dpr,d.k,x,y-U*d.sz*.3,U*d.sz,d.f)]);}
    for(const t of s.tw)if(t.u>u0-2&&t.u<u1+2){const [,y]=P(t.u,t.v);L.push([y,()=>drawTower(t)]);}
    for(const it of s.it)if(it.u>u0-1&&it.u<u1+1){const sc=it.lane?s.C.secs[it.lane[0]]:null,v=it.v!=null?it.v:laneV(sc,it.lane[1],it.u),[,y]=P(it.u,v);L.push([y,()=>drawItem(it)]);}
    if(s.C.L+2.3<u1+4){const [,y]=P(s.C.L+2.3,0);L.push([wide?-1e9:y,drawLairGate]);}
    for(const m of s.sq){const [u,v]=m.alive?manPos(s,m):[s.u,0],[,y]=m.alive?P(u,v):[0,m.fy||0];L.push([y+.1,()=>drawMan(m)]);}
    L.sort((a,b)=>a[0]-b[0]);for(const [,f] of L)f();
    // купол щита и мерцание шапки
    if(s.shd.t>0&&alive(s).length){const [x,y]=P(s.u-.6,roadV(s.C,s.u-.6,s.ch)),r=U*(1.3+alive(s).length*.08),a=Math.min(1,s.shd.t*2);g.save();g.globalAlpha=a*.85;
      const gr=g.createRadialGradient(x,y-r*.3,r*.2,x,y,r);gr.addColorStop(0,'rgba(255,240,150,.05)');gr.addColorStop(.8,'rgba(255,220,90,.22)');gr.addColorStop(1,'rgba(255,230,120,.6)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,r,r*.9,0,0,TAU);g.fill();
      g.strokeStyle='rgba(255,236,140,.9)';g.lineWidth=2.5;g.stroke();g.globalAlpha=a*.5;g.strokeStyle='#fff6c0';g.lineWidth=1;for(let k=0;k<6;k++){const an=st.t*1.5+k*TAU/6;g.beginPath();g.ellipse(x,y,r*Math.abs(Math.cos(an)),r*.9,0,0,TAU);g.stroke();}g.restore();}
    if(s.cap.t>0&&Math.random()<.6){const m=pick(alive(s)||[]);if(m){const [u,v]=manPos(s,m),[x,y]=P(u,v);MGD.fxAdd(st,{k:'spark',x:x+(Math.random()-.5)*U*.5,y:y-U*.4,vx:0,vy:-30,g:0,r:U*.07,col:'#c8e8ff',dur:.6});}}
    for(const p of s.pj)drawPj(p);
    MGD.fxRun(st,g,dt);
    g.restore();
    // сумерки к Логову: красный отсвет растёт
    const pr=clamp(s.u/s.C.L,0,1),vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba('+Math.round(30+90*pr)+',12,8,'+(.22+.2*pr)+')');g.fillStyle=vg;g.fillRect(0,0,W,H);
    if(s.cap.t>0){g.fillStyle='rgba(120,180,255,'+(.10*Math.min(1,s.cap.t*2))+')';g.fillRect(0,0,W,H);}
    hud(dt);
    if(phase==='intro')intro();}
  function hud(){const W=st.W,H=st.H,al=alive(s).length;
    // полоса пути к Логову
    const bw=Math.min(W-150,420),bx=W/2-bw/2-(W<500?20:0),by=18;g.save();MGD.rr(g,bx-8,by-8,bw+16,36,14);g.fillStyle='rgba(30,18,8,.75)';g.fill();g.strokeStyle='#e6b53a';g.lineWidth=2;g.stroke();
    MGD.rr(g,bx+6,by+5,bw-34,10,5);g.fillStyle='#4a3a28';g.fill();const pr=clamp(s.u/s.C.L,0,1);MGD.rr(g,bx+6,by+5,Math.max(10,(bw-34)*pr),10,5);g.fillStyle='#e6b53a';g.fill();
    for(const sc of s.C.secs)if(sc.k==='fork'){const fx=bx+6+(bw-34)*sc.u0/s.C.L;g.fillStyle=s.ch[sc.fi]==null?'#fff':'#9a8a6a';g.beginPath();g.arc(fx,by+10,4,0,TAU);g.fill();}
    MGD.put(g,st.dpr,bossKey,bx+bw-12,by+8,30,false);MGD.put(g,st.dpr,alive(s)[0]?alive(s)[0].key:'hp_iva',bx+6+(bw-34)*pr,by+4,26,false);g.restore();
    // дружина
    const cx=14,cy=by+40;g.save();MGD.rr(g,cx,cy,128,44,14);g.fillStyle='rgba(30,18,8,.75)';g.fill();g.strokeStyle='#e6b53a';g.lineWidth=2;g.stroke();MGD.ICO.shield(g,cx+24,cy+22,14);
    MGD.txt(g,''+al,cx+46,cy+23,24,al>=5?'#9aff8a':al>=3?'#ffe066':'#ff8a7a',{al:'left'});MGD.txt(g,Lg('дружина','warband'),cx+66+(al>9?12:0),cy+24,12,'#f2d79a',{al:'left',sw:0,w:700});if(s.loot){MGD.put(g,st.dpr,'trf_bag',cx+152,cy+20,32,false);MGD.txt(g,'×'+s.loot,cx+168,cy+28,16,'#ffe066',{al:'left'});}g.restore();
    annDraw();if(phase!=='play')return;
    // чары
    const R0=Math.min(46,Math.max(38,W*.11)),y=H-R0-22;spellBtn(R0+18,y,R0,'cap',Lg('Шапка','Cap'),'Q');spellBtn(W-R0-18,y,R0,'shd',Lg('Щит','Shield'),'W');
    // выбор тропы
    const fk=forkAhead(s);if(fk&&s.ch[fk.fi]==null)forkUI(fk);
    if(!s.adUsed&&al<=3&&al>0&&adOk()){const w=Math.min(250,W-2*R0-70);MGD.btn(st,W/2-w/2,H-80,w,58,Lg('Подкрепление за рекламу','Reinforcements for an ad'),askReinf,{id:'ad',col:'#2f6aa8',px:14,lx:14,draw:(q,x,yy,ww,h)=>MGD.ICO.film(q,x+22,yy+h/2,11)});}
}
  function annDraw(){const W=st.W,H=st.H,a=ann?st.t-ann.t:9,D=phase==='play'?1.6:3;if(a<0||a>=D)return;const k=a<.25?MGD.ease.back(a/.25):1;g.save();g.globalAlpha=a>D-.4?(D-a)/.4:1;g.translate(W/2,H*.36);g.scale(k,k);MGD.txt(g,ann.s,0,0,Math.min(44,W*.1),'#ffe066',{sc:'#6a1a0a',sw:7,max:W-30});g.restore();}
  function spellBtn(x,y,r,k,label,key){const sp=s[k],act=sp.t>0,dis=sp.n<=0&&!act,g2=g;g2.save();
    g2.fillStyle='rgba(0,0,0,.35)';g2.beginPath();g2.arc(x,y+5,r,0,TAU);g2.fill();const gr=g2.createRadialGradient(x-r*.3,y-r*.4,r*.1,x,y,r);gr.addColorStop(0,dis?'#8a8478':k==='cap'?'#6a8ad8':'#e8b84a');gr.addColorStop(1,dis?'#5a5448':k==='cap'?'#2a3a7a':'#8a5a12');
    g2.fillStyle=gr;g2.beginPath();g2.arc(x,y,r,0,TAU);g2.fill();g2.lineWidth=3;g2.strokeStyle=dis?'#bdb5a0':'#f2c94c';g2.stroke();
    if(k==='cap')MGD.ICO.cap(g2,x,y-r*.08,r*.55);else MGD.ICO.shield(g2,x,y-r*.06,r*.52);
    if(act){const dur=k==='cap'?(s.calm?4.5:3.5):(s.calm?5:4);g2.strokeStyle='#fff';g2.lineWidth=5;g2.beginPath();g2.arc(x,y,r-4,-Math.PI/2,-Math.PI/2+TAU*sp.t/dur);g2.stroke();
      g2.globalAlpha=.5+.3*Math.sin(st.t*10);g2.drawImage(glowSpr(k==='cap'?'#a0d8ff':'#ffe066'),x-r*1.6,y-r*1.6,r*3.2,r*3.2);g2.globalAlpha=1;}
    for(let i=0;i<2;i++){const px=x-9+i*18,py=y+r*.72;g2.beginPath();g2.arc(px,py,6,0,TAU);g2.fillStyle=i<sp.n?'#fff3a0':'rgba(40,30,20,.7)';g2.fill();g2.lineWidth=1.5;g2.strokeStyle='#5a3a10';g2.stroke();}
    MGD.txt(g2,label,x,y-r-12,15,'#fff');if(mgPC())mgKeycap(g2,x+r*.85,y-r*.75,key,22);
    g2.restore();st.btns.push({x:x-r,y:y-r,w:r*2,h:r*2,pad:Math.max(0,(64-r*2)/2),fn:()=>useSpell(k),dis:false,id:'sp'+k});}
  function forkUI(fk){const W=st.W,H=st.H,cnt=L=>s.tw.filter(t=>t.lane&&t.lane!=='mid'&&t.lane[0]===s.C.secs.indexOf(fk)&&t.lane[1]===L).length+s.tw.filter(t=>t.lane==='mid'&&Math.abs(t.u-fk.u0-fk.len/2)<fk.len/2).length,
      loot=L=>s.it.filter(x=>x.lane&&x.lane[0]===s.C.secs.indexOf(fk)&&x.lane[1]===L);
    const bw=Math.min(180,(W-40)/2-8),bh=84,top=wide?96:104;
    MGD.txt(g,Lg('Развилка! Куда идём?','A fork! Which way?'),W/2,top+bh+(wide?110:26),Math.min(26,W*.06),'#ffe066',{sc:'#3a1a0a',sw:6});
    for(const L of[0,1]){const x=wide?W-bw-90:(L?W/2+8:W/2-8-bw),y=wide?(L?H*.58:H*.2):top,col=L===fk.risky?'#a8322e':'#3f7f3a';
      MGD.btn(st,x,y,bw,bh,'',()=>pickLane(fk,L),{id:'lane'+L,col,r:16,draw:(q,xx,yy,w,h)=>{
        MGD.ICO.arrow(q,xx+24,yy+26,15,wide?(L?Math.PI/2:-Math.PI/2):(L?0:Math.PI),'#fff3a0');if(mgPC())mgKeycap(q,xx+w-20,yy+22,wide?(L?'↓':'↑'):(L?'→':'←'),24);
        MGD.txt(q,L===fk.risky?Lg('Опасная','Risky'):Lg('Тихая','Quiet'),xx+w/2+12,yy+24,18,'#fff',{max:w-56});
        const n=cnt(L);MGD.put(q,st.dpr,'skull',xx+22,yy+h-26,26,false);MGD.txt(q,'×'+n,xx+38,yy+h-25,17,'#fff',{al:'left'});
        let ix=xx+w-24;for(const it of loot(L)){MGD.put(q,st.dpr,it.k==='cage'?'hp_iva':'trf_bag',ix,yy+h-27,30,false);ix-=32;}}});}}
  function intro(){const W=st.W,H=st.H,w=Math.min(W-28,440),lines=[Lg('Дружина идёт в набег на логово нечисти. Дойди до ворот хоть кем-то!','Your warband raids the monsters’ lair. Reach the gate with anyone left!'),
      Lg('На развилках выбирай тропу: на опасной — пленник и трофеи.','At forks pick a trail: the risky one has a captive and trophies.'),
      Lg('Шапка-невидимка — нечисть не видит дружину. Щит — стрелы и огонь отскакивают.','Invisibility cap — monsters can’t see you. Shield — arrows and fire bounce off.')].concat(mgPC()?[Lg('Клавиши: Q — шапка, W — щит, стрелки — тропа на развилке, Enter — начать.','Keys: Q — cap, W — shield, arrows — trail at a fork, Enter — start.')]:[]);
    g.fillStyle='rgba(10,8,4,.55)';g.fillRect(0,0,W,H);let Ls=[];for(const l of lines)Ls=Ls.concat(MGD.wrap(g,l,16,w-50));const h=124+Ls.length*22+86,y=(H-h)/2,x=(W-w)/2;
    MGD.parch(g,x,y,w,h);MGD.ribbon(g,W/2,y+6,Math.min(w-70,300),44,Lg('Набег на логово','Raid on the Lair'),22);
    for(let i=0;i<3;i++)MGD.put(g,st.dpr,s.sq[i].key,x+34+i*27,y+84,46,false);MGD.ICO.cap(g,W/2-6,y+88,19);MGD.ICO.shield(g,W/2+36,y+86,19);MGD.put(g,st.dpr,bossKey,x+w-56,y+80,64,true);
    let yy=y+132;for(const l of Ls){MGD.txt(g,l,W/2,yy,16,'#4a2a0a',{sw:0,w:700});yy+=22;}
    MGD.btn(st,W/2-100,y+h-74,200,56,Lg('В набег!','Charge!'),begin,{id:'go',col:'#a8322e',px:22});
    if(o.bot)begin();}
  function finish(){if(doneSent)return;doneSent=true;const r=resultOf(s);window.__mgdRes=r;st.kill();host.done({score:r.score,tier:r.tier,extra:{alive:r.alive,start:START,loot:r.loot,ch:c}});}
  st.frame=frame;if(host.onQuit)host.onQuit(()=>st.kill());
  const api={st,s,cast:k=>cast(s,k),choose:(fi,L)=>choose(s,fi,L),skip:u=>{s.u=u;camU=u;}};window.__mgdRun=api;return api;}

MG_REG({id:ID,num:13,n:{ru:'Набег на логово',en:'Raid on the Lair'},icon:'swords',kind:'week',run,bot:o=>botSim(typeof o==='number'?{lvl:o}:o),sim:botSim});
})();
