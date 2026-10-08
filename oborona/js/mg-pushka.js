'use strict';
/* OB:MGB (08.10) мини-игра №3 «Царь-пушка» (id 'pushka').
   Вид сбоку: на кремлёвской стене бронзовая Царь-пушка, за рекой — табор нечисти (шатры, котёл Яги, обоз с бочками, знамя Кощея).
   Тянешь назад и отпускаешь — ядро летит по дуге, ветер (флажок на стене и облака) сносит. 5 ядер.
   Цели — по зерну дня (o.seed, у всех одинаковые), сила ветра — по прогрессу (o.lvl), спокойно (o.calm) — ветер слабее, подсказка дуги длиннее, взрыв шире.
   Логика (полёт, попадания, счёт) — чистые функции pk*, ими же играет бот (mgbBot / reg.bot). */

const PK={G:760,VMIN:260,VMAX:860,R:22,BR:7,DT:1/120,WALL_TOP:-118,PX:58,PY:-140,BARREL:74,WATER:16,BALLS:5,
  TIERS:[12,24],PTS:{tent:3,kotel:5,cart:2,barrel:2,flag:10,nech:1}};

/* ---------- раскладка мира (зависит от формы экрана: стоя — табор ближе) ---------- */
function pkLay(port){return port?{r0:156,r1:222,c0:250,c1:646,far:668,ts:1.45,by:84,port:1}:{r0:190,r1:420,c0:466,c1:900,far:980,ts:1,by:12};}   // стоя: всё ближе и крупнее, задний ряд — на пригорке
function pkGround(L,x){if(x<L.r0)return 0;if(x<L.r1)return 40;if(x<L.r1+26)return 40-(x-L.r1)/26*40;return -Math.sin((x-L.r1)*.012)*4;}

/* ---------- цели по зерну дня (в долях табора — одинаковые и стоя, и лёжа) ---------- */
function pkMake(seed){const r=mgbRng(seed*7+3),T=[];
  // задний ряд: 2 шатра и знамя; передний: обоз, котёл, шатёр + нечисть между ними
  const back=[{k:'tent',w:.2},{k:'tent',w:.2}],front=[{k:'cart',w:.3},{k:'kotel',w:.13},{k:'tent',w:.2}];
  for(let i=front.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[front[i],front[j]]=[front[j],front[i]];}
  let u=.02+r()*.05;for(const f of front){f.u=u+f.w/2;u+=f.w+.04+r()*.07;}
  const fl=.86+r()*.08;let ub=.06+r()*.08;for(const b of back){b.u=Math.min(ub+b.w/2,fl-.16);ub+=b.w+.06+r()*.12;}
  back.push({k:'flag',w:.05,u:fl});
  const TC=[['#c0392b','#f3e2bb'],['#6a3aa0','#e6b53a'],['#2a6a8a','#f0d8a0'],['#8a2a4a','#ffd27a']];let ti=Math.floor(r()*4);
  for(const b of back){const o={k:b.k,u:b.u,d:0,id:T.length};if(b.k==='tent'){o.col=TC[ti++%4];}T.push(o);}
  for(const f of front){const o={k:f.k,u:f.u,d:1,id:T.length};if(f.k==='tent')o.col=TC[ti++%4];T.push(o);
    if(f.k==='cart'){T.push({k:'barrel',u:f.u-.1,d:1,id:T.length,n:0});T.push({k:'barrel',u:f.u+.1,d:1,id:T.length,n:1});}}
  // нечисть: 4 штуки в просветах переднего ряда
  const pool=['upyr','kik','skel','wolf','chert','koldun'],fr=front.map(f=>[f.u-f.w/2,f.u+f.w/2]).sort((a,b)=>a[0]-b[0]);
  const gaps=[];let last=0;for(const [a,b] of fr){if(a-last>.05)gaps.push([last,a]);last=b;}if(1-last>.05)gaps.push([last,.84]);
  for(let i=0;i<4;i++){const gp=gaps[i%gaps.length]||[.4,.5],uu=gp[0]+(gp[1]-gp[0])*(.25+r()*.5);T.push({k:'nech',key:pool[Math.floor(r()*pool.length)],u:uu,d:1,id:T.length,ph:r()*6});}
  // ветер на каждое ядро (−1…1), не два раза подряд одинаковый знак слабого
  const wind=[];for(let i=0;i<9;i++){let w=r()*2-1;if(Math.abs(w)<.25)w=w<0?-.3:.3;wind.push(+w.toFixed(2));}
  return {T,wind};}
// размеры целей в мировых единицах; д=0 — задний ряд (мельче и чуть выше)
function pkBox(L,o){const x=L.c0+(L.c1-L.c0)*o.u,s=(o.d?1:.84)*(L.ts||1),gy=pkGround(L,x)-(o.d?0:L.by||12);let w,h;
  switch(o.k){case 'tent':w=84;h=80;break;case 'kotel':w=50;h=44;break;case 'cart':w=70;h=54;break;case 'barrel':w=26;h=30;break;case 'flag':w=10;h=170;break;default:w=30;h=36;}
  w*=s;h*=s;return {x,y:gy,s,x0:x-w/2,x1:x+w/2,y0:gy-h,y1:pkGround(L,x)+2,w,h};}   // низ — до земли (у заднего ряда тоже)
function pkWindK(o){const lv=Math.max(0,Math.min(10,(o&&o.lvl)|0));return (34+lv*5)*((o&&o.calm)?.5:1);}

/* ---------- полёт: один шаг (фиксированный dt — бот и игра считают одинаково) ---------- */
function pkLaunch(L,ang,pow){const v=PK.VMIN+(PK.VMAX-PK.VMIN)*pow,c=Math.cos(ang),s=Math.sin(ang);
  return {x:PK.PX+c*PK.BARREL,y:PK.PY-s*PK.BARREL,vx:c*v,vy:-s*v};}
// → null (летит) или {k:'ground'|'water'|'hit'|'far', x,y, id}
function pkStep(L,st,b,ax){const dt=PK.DT;b.vx+=ax*dt;b.vy+=PK.G*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x>L.far+260||b.x<-300||b.y>400)return {k:'far',x:b.x,y:b.y};
  if(b.vy>0||b.y>-200)for(const o of st.T){if(o.dead||o.k==='nech')continue;const B=o.B;
    if(o.k==='flag'){if(b.x>B.x-3-PK.BR&&b.x<B.x+40*B.s&&b.y>B.y0&&b.y<B.y0+42*B.s)return {k:'hit',x:b.x,y:b.y,id:o.id};continue;}
    if(b.x>B.x0-PK.BR&&b.x<B.x1+PK.BR&&b.y>B.y0+(o.k==='tent'?B.h*.25*Math.abs(b.x-B.x)/(B.w/2):0)-PK.BR&&b.y<B.y1)return {k:'hit',x:b.x,y:b.y,id:o.id};}
  if(b.x>L.r0&&b.x<L.r1+8&&b.y>=PK.WATER)return {k:'water',x:b.x,y:PK.WATER};
  const gy=pkGround(L,b.x);if(b.y>=gy&&!(b.x>L.r0&&b.x<L.r1+8))return {k:'ground',x:b.x,y:gy};
  return null;}
function pkFly(L,st,ang,pow,w,wk){const b=pkLaunch(L,ang,pow);for(let i=0;i<2400;i++){const r=pkStep(L,st,b,w*wk);if(r)return r;}return {k:'far',x:b.x,y:b.y};}
// попадание: что разрушено (без анимации), цепь бочек — по очереди; → {hits:[{id,pts,delay}], pts}
function pkBoom(L,st,imp,R){const out=[];if(imp.k==='water'||imp.k==='far')return {hits:out,pts:0};
  const d2=(B,x,y)=>{const dx=Math.max(B.x0-x,0,x-B.x1),dy=Math.max(B.y0-y,0,y-B.y1);return Math.hypot(dx,dy);};
  const q=[];for(const o of st.T){if(o.dead)continue;const B=o.B;let hit=false;
    if(o.k==='flag'){const dx=Math.abs(imp.x-B.x),dy=Math.max(B.y0-imp.y,0,imp.y-B.y1);hit=imp.id===o.id||Math.hypot(dx,dy)<R*.5;}
    else if(o.k==='nech'){const nx=o.nx==null?B.x:o.nx;hit=Math.hypot(imp.x-nx,imp.y-(B.y-16))<R;}
    else hit=imp.id===o.id||d2(B,imp.x,imp.y)<R;
    if(hit)q.push([o,0]);}
  const seen={};for(let i=0;i<q.length;i++){const [o,dl]=q[i];if(seen[o.id])continue;seen[o.id]=1;out.push({id:o.id,pts:PK.PTS[o.k]||1,delay:dl});
    if(o.k==='barrel'||o.k==='cart')for(const p of st.T){if(p.dead||seen[p.id]||(p.k!=='barrel'&&p.k!=='cart'))continue;if(Math.abs(p.B.x-o.B.x)<90)q.push([p,dl+.28]);}}
  let pts=0;for(const h of out)pts+=h.pts;return {hits:out,pts};}
function pkTier(s){return s>=PK.TIERS[1]?3:s>=PK.TIERS[0]?2:s>0?1:0;}

/* ---------- бот: прицел перебором, ошибка по умению ---------- */
function pkAim(L,st,o,w,wk,dx){let best=null;const TX=o.B.x+(dx||0);
  for(let a=12;a<=72;a+=2){const ang=a*Math.PI/180;let lo=0,hi=1;for(let i=0;i<16;i++){const m=(lo+hi)/2,r=pkFly(L,st,ang,m,w,wk);if(r.x<TX)lo=m;else hi=m;}
    const p=(lo+hi)/2,r=pkFly(L,st,ang,p,w,wk);const e=Math.abs(r.x-TX)+(r.k==='water'?200:0)+(r.k==='hit'&&r.id!==o.id&&st.T[r.id].k!=='flag'?40:0);
    if(!best||e<best.e)best={ang,p,e};}
  return best;}
function pkBotRun(seed,skill,o){o=o||{};const port=!!o.port,L=pkLay(port),M=pkMake(seed),st={T:M.T},wk=pkWindK(o),rnd=mulberry((seed|0)+911*(skill+1));
  for(const t of st.T)t.B=pkBox(L,t);
  const SG=[[7,.1,.5,.25],[3,.04,.15,.6],[1.2,.015,0,.85]][skill]||[3,.04,.15,.6];let corr=0;   // 4-е — насколько поправляется после промаха   // плохой / средний / хороший: σ угла°, σ силы, доля «забыл про ветер»
  const gs=()=>{let s=0;for(let i=0;i<6;i++)s+=rnd();return s-3;};let score=0,hitsN=0;
  for(let n=0;n<PK.BALLS;n++){const w=M.wind[n],alive=st.T.filter(t=>!t.dead&&t.k!=='nech');if(!alive.length)break;
    alive.sort((a,b)=>(PK.PTS[b.k]-PK.PTS[a.k])*(skill===2?1:.3)+(rnd()-.5)*4);const tg=alive[0],wq=Math.sign(w)*(Math.abs(w)<.45?.3:Math.abs(w)<.75?.6:.9),ww=rnd()<SG[2]?0:wq;   // человек видит ветер только «слабый/средний/сильный»
    const aim=pkAim(L,st,tg,ww,wk,-corr);const ang=aim.ang+gs()*SG[0]*Math.PI/180,pow=Math.max(0,Math.min(1,aim.p+gs()*SG[1]));
    const imp=pkFly(L,st,ang,pow,w,wk);if(imp.k!=='far')corr+=(imp.x-(tg.B.x-corr))*SG[3]-corr*SG[3]*0;const r=pkBoom(L,st,imp,PK.R*(o.calm?1.2:1));for(const h of r.hits)st.T[h.id].dead=1;score+=r.pts;if(r.hits.length)hitsN++;}
  return score;}

/* =================================== игра =================================== */
function pkRun(host,o){o=o||{};const seed=(o.seed|0)||20261008,calm=mgbCalm(o),M=pkMake(seed),T=M.T,R=PK.R*(o.calm?1.2:1),wk=pkWindK(o);
  const S2={score:0,ball:0,balls:PK.BALLS,hitsN:0,acc:{kotel:0,flag:0},state:'aim',fly:null,res:0,tut:1,adUsed:0,oboz:0,
    cam:{x:0,y:0,z:1},camT:{x:0,y:0,z:1},hold:0,P:[],N:[],msg:null,E:null,offer:null,recoil:0,smoke:[],drag:null,cats:[],flies:[],t:0};
  let L=null,port=false,V={s:1,ox:0,oy:0},HUD={};
  const st={T};window.__mgb={S:S2,T,fire:(a,p)=>fire(a,p),M};
  const stg=mgbStage(host,{resize,down,move,up,step,draw,paused:()=>host.paused});MGB.dpr=stg.dpr;host.onQuit&&host.onQuit(()=>stg.kill());
  function resize(W,H,d){MGB.dpr=d;const p=H>W*1.15;if(!L||p!==port){port=p;L=pkLay(port);for(const t of T)t.B=pkBox(L,t);for(const t of T)if(t.k==='nech'&&t.nx==null)t.nx=t.B.x;}
    const top=port?118:84,bot=port?96:90,aw=W-8,ah=H-top-bot,vx0=port?-8:-60,vx1=L.far+(port?6:10),vy0=-330,vy1=60;
    const s=Math.min(aw/(vx1-vx0),ah/(vy1-vy0));V={s,W,H,cx:(vx0+vx1)/2,cy:(vy0+vy1)/2};V.sy=port?top+ah*.62+V.cy*s:top+ah-(vy1-V.cy)*s;   // стоя горизонт выше: снизу — разрез реки и земли
    if(!S2.fly){S2.cam={x:V.cx,y:V.cy,z:1};S2.camT={x:V.cx,y:V.cy,z:1};}
    HUD={top,bot};}
  // мир → экран
  function cs(){const z=S2.cam.z,s=V.s*z;return {s,ox:V.W/2-S2.cam.x*s+stg.shx,oy:V.sy-S2.cam.y*s+stg.shy};}
  function w2s(x,y){const c=cs();return [c.ox+x*c.s,c.oy+y*c.s];}

  /* ---------- управление: тянуть назад и отпустить ---------- */
  function aimFrom(dx,dy){const Lm=Math.min(V.W,V.H)*.34,len=Math.hypot(dx,dy);let ang=Math.atan2(dy,-dx);   // тянем влево-вниз → летит вправо-вверх
    if(!(ang>0))ang=dx<0?.09:1.4;ang=Math.max(.09,Math.min(1.4,ang));return {ang,pow:Math.max(0,Math.min(1,len/Lm)),len};}
  function down(p){if(S2.E){S2.E.t=Math.max(S2.E.t,2.2);return;}
    if(S2.offer){for(const b of S2.offer.bs)if(mgbHit(b,p))b.pressed=1;return;}
    if(S2.state!=='aim')return;S2.drag={x0:p.x,y0:p.y,x:p.x,y:p.y,a:null};mgbSnd('click');}
  /* OB:FINAL ПК: стрелки ↑↓ — угол, ←→ — сила, пробел/Enter — выстрел (мышь тоже работает) */
  const pc=mgPC();S2.kb={ang:.75,pow:.6};
  function kbAim(){const Lm=Math.min(V.W,V.H)*.34,[x0,y0]=w2s(PK.PX,PK.PY),k=S2.kb,len=k.pow*Lm;S2.drag={x0,y0,x:x0-Math.cos(k.ang)*len,y:y0+Math.sin(k.ang)*len,a:{ang:k.ang,pow:k.pow,len},kb:1};}
  mgKeys(host,k=>{if(S2.E){if(k==='Enter'||k===' '){S2.E.t=Math.max(S2.E.t,2.2);return true;}return false;}if(S2.offer){if(k==='Enter'||k===' '||k==='Escape'){showEnd();return true;}return /^Arrow/.test(k);}if(S2.state!=='aim')return /^Arrow| /.test(k);
    const K=S2.kb;if(k==='ArrowUp'){K.ang=Math.min(1.4,K.ang+.03);kbAim();return true;}if(k==='ArrowDown'){K.ang=Math.max(.09,K.ang-.03);kbAim();return true;}
    if(k==='ArrowRight'){K.pow=Math.min(1,K.pow+.025);kbAim();return true;}if(k==='ArrowLeft'){K.pow=Math.max(.1,K.pow-.025);kbAim();return true;}
    if(k===' '||k==='Enter'){if(!S2.drag||!S2.drag.kb){kbAim();return true;}const a=S2.drag.a;S2.drag=null;fire(a.ang,a.pow);return true;}return false;});
  function move(p){if(S2.drag){S2.drag.x=p.x;S2.drag.y=p.y;S2.drag.a=aimFrom(p.x-S2.drag.x0,p.y-S2.drag.y0);}}
  function up(p){if(S2.E)return;
    if(S2.offer){for(const b of S2.offer.bs){if(b.pressed&&mgbHit(b,p))b.fn();b.pressed=0;}return;}
    const d=S2.drag;S2.drag=null;if(!d||S2.state!=='aim')return;const a=aimFrom(p.x-d.x0,p.y-d.y0);
    if(a.pow<.1){S2.msg={s:Lg('Тяни дальше — сильнее выстрел','Pull further for a stronger shot'),t:0};return;}
    fire(a.ang,a.pow);}
  function fire(ang,pow){S2.aim={ang,pow};const b=pkLaunch(L,ang,pow);S2.fly={b,tr:[],t:0,acc:0};S2.state='fly';S2.tut=0;S2.recoil=1;
    mgbSnd('cannon');mgbSnd('boom');if(!calm)stg.shake=Math.max(stg.shake,.35);
    const mx=b.x,my=b.y,c=Math.cos(ang),s=Math.sin(ang);
    mgbPart(S2.P,{k:'spark',x:mx,y:my,s:26,dur:.2,col:'#fff1b0'});
    for(let i=0;i<9;i++){const sp=40+Math.random()*90,a=-ang+(Math.random()-.5)*.9;mgbPart(S2.P,{k:'smoke',x:mx+c*6,y:my-s*6,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-10,s:14+Math.random()*14,dur:1.2+Math.random()*.8,t:-i*.02,a:.9,fr:1.6});}
    for(let i=0;i<8;i++){const a=-ang+(Math.random()-.5)*.6,sp=160+Math.random()*160;mgbPart(S2.P,{k:'spark',x:mx,y:my,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,s:4+Math.random()*3,dur:.3,col:'#ffb03a',fr:3});}
    setTimeout(()=>{if(S2.state==='fly')mgbSnd('whistle');},120);}

  /* ---------- попадание ---------- */
  function impact(r){const f=S2.fly;S2.fly=null;S2.state='boom';S2.hold=calm?1.1:1.35;{const z=port?1.55:1.3;S2.camT={x:Math.max(V.cx-60,Math.min(r.x,L.far-80)),y:40-(40-V.cy)/z,z};}
    if(r.k==='water'){mgbSnd('splash');for(let i=0;i<16;i++){const a=-Math.PI/2+(Math.random()-.5)*1.4,v=120+Math.random()*180;mgbPart(S2.P,{k:'drop',x:r.x,y:PK.WATER,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:700,s:2.5+Math.random()*2,dur:.8,col:'#cfe8ff'});}
      mgbPart(S2.P,{k:'ring',x:r.x,y:PK.WATER+2,s:40,dur:.7,col:'#e8f6ff',w:3,fl:.3});mgbPart(S2.P,{k:'ring',x:r.x,y:PK.WATER+2,s:24,dur:.9,t:-.15,col:'#e8f6ff',w:2,fl:.3});
      S2.sink={x:r.x,t:0};say(Lg('Плюх! Недолёт','Splash! Too short'),'#bfe4ff');S2.res=0;return;}
    if(r.k==='far'){say(Lg('Перелёт!','Too far!'),'#ffd2a0');S2.hold=.7;S2.camT={x:V.cx,y:V.cy,z:1};S2.res=0;return;}
    mgbSnd('boom');mgbSnd('thunder');if(!calm)stg.shake=Math.max(stg.shake,.75);
    mgbBoom(S2.P,r.x,r.y,R*.55,{chips:10,cols:['#6a4a2a','#3a3030','#8a6a3a']});
    // воронка на земле
    if(r.k==='ground')S2.craters=(S2.craters||[]).concat([{x:r.x,y:pkGround(L,r.x),r:R*.42}]);
    const B=pkBoom(L,st,r,R);let shotPts=0;
    for(const h of B.hits){const t=T[h.id];t.dead=1;t.dt=-h.delay;shotPts+=h.pts;
      setTimeout(()=>{kill(t,h.pts,r);},h.delay*1000);}
    if(B.hits.length){S2.hitsN++;}else say(r.x<(L.c0+L.c1)/2&&r.x<L.c0?Lg('Недолёт!','Too short!'):Lg('Мимо!','Missed!'),'#ffd2a0');
    S2.res=shotPts;}
  function kill(t,pts,r){S2.score+=pts;const B=t.B;let x=B.x,y=B.y-B.h*.5;
    if(t.k==='nech'){x=t.nx;y=B.y-18;const dir=x>=r.x?1:-1;S2.flies.push({key:t.key,x,y:B.y-16,vx:dir*(140+Math.random()*80),vy:-320-Math.random()*120,rot:0,vr:dir*9,t:0,sz:36*B.s});mgbSnd('kill');}
    if(t.k==='tent'){t.burn=1;mgbBoom(S2.P,x,B.y-B.h*.4,R*.4,{chips:8,cols:[t.col[0],t.col[1],'#6a4a2a']});}
    if(t.k==='kotel'){S2.acc.kotel=1;t.tip=0;for(let i=0;i<22;i++){const a=-Math.PI/2+(Math.random()-.5)*2.2,v=90+Math.random()*200;mgbPart(S2.P,{k:'drop',x,y:B.y0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:650,s:2.5+Math.random()*2.5,dur:.9,col:i%3?'#7aff6a':'#c0ff9a'});}
      for(let i=0;i<2;i++)S2.cats.push({x:x+(i?14:-14),y:B.y,vx:(i?1:-1)*(150+i*40),t:0,hop:Math.random()*6});mgbSnd('purr');mgbSnd('frog');}
    if(t.k==='cart'||t.k==='barrel'){S2.oboz=1;mgbBoom(S2.P,x,y,R*.65,{chips:12,cols:['#8a5a2e','#a87444','#5a3a1a']});mgbSnd('boom');if(!calm)stg.shake=Math.max(stg.shake,.6);}
    if(t.k==='flag'){S2.acc.flag=1;t.fall=0;mgbSnd('up');}
    t.dt=0;mgbPop(S2.N,x,B.y0-14,'+'+pts,t.k==='flag'?'#ffd24a':'#ffe9a0',pts>=5);if(pts>=3)mgbSnd('coin');}
  function say(s,col){S2.msg={s,t:0,col};}

  /* ---------- шаг ---------- */
  function step(dt){S2.t+=dt;const P=S2.P;
    for(const t of T)if(t.dt!=null)t.dt+=dt;
    if(S2.state==='fly'&&S2.fly){const f=S2.fly;f.acc+=dt;const w=M.wind[S2.ball]||0;
      while(f.acc>=PK.DT){f.acc-=PK.DT;const r=pkStep(L,st,f.b,w*wk);f.t+=PK.DT;if(f.tr.length===0||Math.hypot(f.b.x-f.tr[f.tr.length-1][0],f.b.y-f.tr[f.tr.length-1][1])>9)f.tr.push([f.b.x,f.b.y]);if(f.tr.length>40)f.tr.shift();if(r){impact(r);break;}}
      if(S2.fly){const b=S2.fly.b;const k=Math.min(1,Math.max(0,(b.x-PK.PX)/(L.c0-PK.PX)));const z=1+(port?.5:.25)*k*k;S2.camT={x:V.cx+(Math.max(V.cx,Math.min(b.x,L.far-120))-V.cx)*.7*k,y:40-(40-V.cy)/z,z};
        if(Math.random()<.5)mgbPart(P,{k:'smoke',x:b.x,y:b.y,s:5+Math.random()*3,dur:.5,a:.55});}}
    else if(S2.state==='boom'){S2.hold-=dt;if(S2.hold<=0){S2.state='aim';S2.ball++;S2.camT={x:V.cx,y:V.cy,z:1};
      if(S2.ball>=S2.balls){S2.state='end';setTimeout(endOrOffer,450);}}}
    const c=S2.cam,ct=S2.camT,k=1-Math.exp(-dt*(S2.state==='fly'?5:2.6));c.x+=(ct.x-c.x)*k;c.y+=(ct.y-c.y)*k;c.z+=(ct.z-c.z)*k;
    S2.recoil=Math.max(0,S2.recoil-dt*2.2);
    for(let i=S2.cats.length-1;i>=0;i--){const q=S2.cats[i];q.t+=dt;q.x+=q.vx*dt;if(q.t>2.4)S2.cats.splice(i,1);}
    for(let i=S2.flies.length-1;i>=0;i--){const q=S2.flies[i];q.t+=dt;q.vy+=700*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.rot+=q.vr*dt;if(q.t>1.6)S2.flies.splice(i,1);}
    for(const t of T){if(t.k==='nech'&&!t.dead){t.nx=t.B.x+Math.sin(S2.t*.5+t.ph)*14;}if(t.fall!=null)t.fall=Math.min(1,t.fall+dt*1.4);if(t.tip!=null)t.tip=Math.min(1,t.tip+dt*3);}
    if(S2.sink){S2.sink.t+=dt;if(S2.sink.t>1.5)S2.sink=null;}
    if(S2.msg){S2.msg.t+=dt;if(S2.msg.t>1.8)S2.msg=null;}}

  function endOrOffer(){if(!S2.E&&!S2.offer){const gap=S2.score<PK.TIERS[0]?PK.TIERS[0]-S2.score:S2.score<PK.TIERS[1]?PK.TIERS[1]-S2.score:99;
    if(!o.train&&!S2.adUsed&&host.ad&&host.adOk&&host.adOk()&&gap<=5&&T.some(t=>!t.dead&&t.k!=='nech')){S2.offer={t:0,gap,bs:[]};return;}showEnd();}}
  function showEnd(){S2.offer=null;const tier=pkTier(S2.score);
    S2.E={t:0,calm,title:tier>=3?Lg('Метко, пушкарь!','Bullseye, gunner!'):tier>=2?Lg('Добрый выстрел!','Good shooting!'):Lg('Табор потрёпан','Camp shaken'),score:S2.score,tier};
    mgbSnd(tier>=2?'win':'lose');}
  function finish(){if(S2.done)return;S2.done=1;const tier=pkTier(S2.score),accN=S2.acc.kotel+S2.acc.flag+(S2.hitsN>=4?1:0);
    stg.kill();host.done&&host.done({score:S2.score,tier,rec:false,extra:{acc:accN,oboz:S2.oboz,hits:S2.hitsN,ad:S2.adUsed}});}

  /* =================================== рисование =================================== */
  const C={};   // кэш путей
  function draw(g,W,H){const c=cs();
    drawSky(g,W,H,c);
    g.save();g.setTransform(stg.dpr*c.s,0,0,stg.dpr*c.s,stg.dpr*c.ox,stg.dpr*c.oy);
    drawWorld(g,c);
    g.restore();
    drawHUD(g,W,H,c);
    if(S2.offer)drawOffer(g,W,H);
    if(S2.E&&mgbFinale(g,W,H,S2.E,1/60))finish();}

  function drawSky(g,W,H,c){const yH=c.oy+0*c.s;   // линия горизонта = земля
    const gr=g.createLinearGradient(0,Math.min(0,yH-H),0,yH);gr.addColorStop(0,'#1c2350');gr.addColorStop(.45,'#4a4a8e');gr.addColorStop(.78,'#d7768a');gr.addColorStop(.92,'#f6a768');gr.addColorStop(1,'#ffd49a');
    g.fillStyle=gr;g.fillRect(0,0,W,H);
    // звёзды в вышине (стоя — небо большое)
    if(yH>H*.5){g.fillStyle='rgba(255,255,230,.7)';const r=mulberry(77);for(let i=0;i<40;i++){const x=r()*W,y=r()*(yH-H*.35);if(y<0)continue;const tw=.5+.5*Math.sin(S2.t*2+i);g.globalAlpha=.25+.5*tw*(1-y/(yH));g.fillRect(x,y,1.6,1.6);}g.globalAlpha=1;}
    // солнце за холмами
    const [sx,sy]=[c.ox+(L.far-150)*c.s,c.oy-95*c.s];const sr=Math.max(26,60*c.s);
    g.globalCompositeOperation='lighter';g.globalAlpha=.55;g.drawImage(glowSpr('#ffb070'),sx-sr*5,sy-sr*5,sr*10,sr*10);g.globalAlpha=1;g.globalCompositeOperation='source-over';
    const sg=g.createRadialGradient(sx,sy,0,sx,sy,sr);sg.addColorStop(0,'#fff6d0');sg.addColorStop(.7,'#ffd27a');sg.addColorStop(1,'#ffb050');g.fillStyle=sg;g.beginPath();g.arc(sx,sy,sr,0,TAU);g.fill();
    // лучи
    if(!document.body.classList.contains('lite')){g.save();g.globalCompositeOperation='lighter';g.translate(sx,sy);g.rotate(S2.t*.02);const rg=g.createRadialGradient(0,0,sr,0,0,sr*9);rg.addColorStop(0,'rgba(255,210,150,.10)');rg.addColorStop(1,'rgba(255,210,150,0)');for(let i=0;i<9;i++){g.rotate(TAU/9);g.beginPath();g.moveTo(0,0);g.lineTo(sr*9,-sr*.7);g.lineTo(sr*9,sr*.7);g.closePath();g.fillStyle=rg;g.fill();}g.restore();}
    // облака плывут по ветру
    const w=S2.state==='aim'||S2.state==='fly'?(M.wind[S2.ball]||0):(M.wind[Math.max(0,S2.ball-1)]||0);S2.cdx=(S2.cdx||0)+w*0.6*(1/60)*(calm?.5:1)*40;
    const cl=fxCloud(),r=mulberry(seed+5);for(let i=0;i<7;i++){const wx=((r()*1600+S2.cdx*(.6+i*.08))%1600+1600)%1600-400,wy=-200-r()*420,s=(60+r()*90)*c.s*(.8+i*.05);
      const x=c.ox+wx*c.s*.92,y=c.oy+wy*c.s;g.globalAlpha=.55+r()*.25;g.drawImage(cl,x-s,y-s*.55,s*2,s*1.1);g.globalAlpha=1;}
    g.fillStyle='rgba(255,170,150,.18)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
    if(port){for(let i=0;i<3;i++){const x=((S2.t*(14+i*5)+i*170)%(W+120))-60,y=(HUD.hb||110)+50+i*38+Math.sin(S2.t*2+i)*6;mgbArt(g,'voron',x,y,26-i*3,{alpha:.75,sy:.8+.2*Math.abs(Math.sin(S2.t*8+i))});}}}

  function hillPath(y0,amp,f,ph,x0,x1){const p=new Path2D();p.moveTo(x0,400);for(let x=x0;x<=x1;x+=20)p.lineTo(x,y0-amp*(.6*Math.sin(x*f+ph)+.4*Math.sin(x*f*2.3+ph*1.7)));p.lineTo(x1,400);p.closePath();return p;}
  function drawWorld(g,c){const t=S2.t,lite=document.body.classList.contains('lite');
    if(!C.L||C.L!==L){C.L=L;C.h1=hillPath(-70,40,.006,1,-900,2200);C.h2=hillPath(-34,26,.011,4,-900,2200);
      // лес за табором: ели силуэтом
      const p=new Path2D(),rr=mulberry(seed+9);p.moveTo(L.r1-40,10);let x=L.r1-40;while(x<L.far+900){const h=36+rr()*44,w=16+rr()*10;p.lineTo(x,-6);p.lineTo(x+w*.5,-6-h);p.lineTo(x+w,-6);x+=w*.65;}p.lineTo(x,10);p.closePath();C.fr=p;
      const gr=g.createLinearGradient(0,-120,0,0);gr.addColorStop(0,'#7d6aa8');gr.addColorStop(1,'#b48aa8');C.g1=gr;
      const g2=g.createLinearGradient(0,-80,0,0);g2.addColorStop(0,'#4f5a8a');g2.addColorStop(1,'#6a6a90');C.g2=g2;
      const gb=g.createLinearGradient(0,-10,0,700);gb.addColorStop(0,'#7caa48');gb.addColorStop(.025,'#5a8a34');gb.addColorStop(.08,'#4a6a2a');gb.addColorStop(.085,'#7a5430');gb.addColorStop(.4,'#4a3018');gb.addColorStop(1,'#20140a');C.gb=gb;
      const gw=g.createLinearGradient(0,PK.WATER,0,280);gw.addColorStop(0,'#5a8ac0');gw.addColorStop(.25,'#2a5a90');gw.addColorStop(1,'#0c1e3a');C.gw=gw;}
    g.fillStyle=C.g1;g.fill(C.h1);g.fillStyle=C.g2;g.fill(C.h2);
    // дымка над холмами
    g.fillStyle='rgba(255,190,170,.18)';g.fillRect(-900,-120,3200,130);
    g.fillStyle='#2c3a4e';g.fill(C.fr);g.fillStyle='rgba(255,180,140,.12)';g.fill(C.fr);
    // дальний берег: луг + разрез земли
    g.beginPath();g.moveTo(L.r1-4,PK.WATER+30);for(let x=L.r1;x<=L.far+1200;x+=12)g.lineTo(x,pkGround(L,x));g.lineTo(L.far+1200,3000);g.lineTo(L.r1-4,3000);g.closePath();g.fillStyle=C.gb;g.fill();
    g.strokeStyle='rgba(255,230,150,.55)';g.lineWidth=2;g.beginPath();for(let x=L.r1+20;x<=L.far+1200;x+=12)x===L.r1+20?g.moveTo(x,pkGround(L,x)):g.lineTo(x,pkGround(L,x));g.stroke();
    // камешки и корни в разрезе
    {const rr=mulberry(seed+3);for(let i=0;i<44;i++){const x=L.r1+30+rr()*(L.far+600-L.r1),y=60+rr()*560,r=3+rr()*8;g.fillStyle=i%3?'rgba(40,24,10,.45)':'rgba(150,130,110,.4)';g.beginPath();g.ellipse(x,y,r*1.4,r,0,0,TAU);g.fill();}}
    // река (с разрезом глубины)
    g.fillStyle=C.gw;g.fillRect(L.r0,PK.WATER,L.r1-L.r0+6,300);
    // дно реки
    g.fillStyle=C.gb;g.beginPath();g.moveTo(L.r0,200);g.quadraticCurveTo((L.r0+L.r1)/2,290,L.r1+6,190);g.lineTo(L.r1+6,3000);g.lineTo(L.r0,3000);g.closePath();g.fill();
    // лучи в воде
    g.save();g.beginPath();g.rect(L.r0,PK.WATER,L.r1-L.r0+6,300);g.clip();g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const x=L.r0+(i+.5)*(L.r1-L.r0)/5+Math.sin(t*.6+i)*10;g.beginPath();g.moveTo(x-8,PK.WATER);g.lineTo(x+8,PK.WATER);g.lineTo(x+40,300);g.lineTo(x+10,300);g.closePath();g.fillStyle='rgba(140,200,255,.06)';g.fill();}g.globalCompositeOperation='source-over';
      // рыбки и пузырьки
      for(let i=0;i<3;i++){const fx=L.r0+((t*(18+i*7)+i*90)%(L.r1-L.r0+60))-30,fy=80+i*55+Math.sin(t+i)*6;mgbArt(g,'ryba',fx,fy,30,{flip:i%2===1,alpha:.75});}
      g.fillStyle='rgba(220,240,255,.5)';for(let i=0;i<8;i++){const bx=L.r0+((i*53)%(L.r1-L.r0)),by=300-((t*30+i*40)%280);g.beginPath();g.arc(bx+Math.sin(t*2+i)*3,by,1.6+i%3*.6,0,TAU);g.fill();}
      g.restore();
    // гладь реки: блики заката
    g.fillStyle='rgba(255,200,140,.55)';for(let i=0;i<14;i++){const x=L.r0+8+((i*37+t*14)%(L.r1-L.r0-20)),w=10+(i%4)*7;g.globalAlpha=.3+.3*Math.sin(t*2+i);g.fillRect(x,PK.WATER+2+(i%3)*3,w,1.6);}g.globalAlpha=1;
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(L.r0,PK.WATER-1,L.r1-L.r0+6,2);
    // камыши у берегов
    mgbArt(g,'d_reeds',L.r1+6,PK.WATER-8,46);mgbArt(g,'d_reeds',L.r1-26,PK.WATER-4,38,{flip:1});mgbArt(g,'d_reeds',L.r0+18,PK.WATER-6,40);
    // воронки
    for(const q of S2.craters||[]){g.fillStyle='rgba(40,24,12,.75)';g.beginPath();g.ellipse(q.x,q.y+2,q.r,q.r*.22,0,0,TAU);g.fill();}
    // стоя: пригорок под задним рядом табора
    if(L.port){if(!C.hill||C.hl!==L){C.hl=L;const p=new Path2D();p.moveTo(L.r1+4,4);p.bezierCurveTo(L.c0-10,-(L.by*.2),L.c0+10,-(L.by+14),L.c0+70,-(L.by+6));p.quadraticCurveTo(L.c0+(L.c1-L.c0)*.5,-(L.by+18),L.far+60,-(L.by+2));p.lineTo(L.far+1600,-(L.by+2));p.lineTo(L.far+1600,6);p.closePath();C.hill=p;
        const hg=g.createLinearGradient(0,-L.by-10,0,8);hg.addColorStop(0,'#86b44e');hg.addColorStop(1,'#5a8a34');C.hg=hg;}
      g.fillStyle=C.hg;g.fill(C.hill);g.strokeStyle='rgba(255,230,150,.55)';g.lineWidth=2;g.stroke(C.hill);}
    // разрез земли: корни, кости, кладовой сундук, русалка на дне
    {const rr=mulberry(seed+21);g.strokeStyle='rgba(30,16,6,.5)';g.lineWidth=2.5;for(let i=0;i<6;i++){const x=L.c0+rr()*(L.far-L.c0);g.beginPath();g.moveTo(x,6);g.quadraticCurveTo(x+10,40+rr()*30,x-6+rr()*24,80+rr()*60);g.stroke();}
      g.strokeStyle='rgba(255,220,170,.08)';g.lineWidth=6;for(let k=1;k<8;k++){g.beginPath();g.moveTo(L.r0,k*90);for(let x=L.r1;x<L.far+800;x+=40)g.lineTo(x,k*90+Math.sin(x*.02+k)*8);g.stroke();}
      if(L.port){mgbArt(g,'chest',L.c0+(L.c1-L.c0)*.62,150,46,{rot:-.12});mgbArt(g,'d_bones',L.c0+(L.c1-L.c0)*.2,110,40);mgbArt(g,'d_stone',L.c0+(L.c1-L.c0)*.85,90,36);
        mgbArt(g,'rusalka',(L.r0+L.r1)/2,214+Math.sin(t*1.2)*3,48);}}
    // дальние деревья (крупные ели) за табором
    {const rr=mulberry(seed+11);for(let i=0;i<7;i++){const x=L.c0-20+rr()*(L.far+80-L.c0),s=70+rr()*40;mgbArt(g,'d_pine',x,pkGround(L,x)-s*.42-14,s,{alpha:.9});}}
    // табор: задний ряд, потом передний
    for(const d of[0,1]){for(const o of T)if(o.d===d&&o.k!=='nech'&&o.k!=='flag')drawTarget(g,o);if(d===0){for(const o of T)if(o.k==='flag')drawFlag(g,o);}if(d===1)drawCampfire(g);}
    for(const o of T)if(o.k==='nech'&&!o.dead){const B=o.B,bob=calm?0:Math.abs(Math.sin(t*3+o.ph))*3;ell(g,o.nx,B.y+1,13,3.5,'rgba(0,0,0,.3)',{ol:false,flat:true});mgbArt(g,o.key,o.nx,B.y-17*B.s-bob,36*B.s,{flip:Math.cos(t*.5+o.ph)<0});}
    for(const q of S2.flies){g.save();g.globalAlpha=Math.max(0,1-q.t/1.6);mgbArt(g,q.key,q.x,q.y,q.sz,{rot:q.rot});g.restore();}
    for(const q of S2.cats){const hop=Math.abs(Math.sin(q.t*12+q.hop))*8;mgbArt(g,'kot',q.x,q.y-10-hop,26,{flip:q.vx<0});}
    // ядро, тонущее в реке
    if(S2.sink){const k=S2.sink.t;g.globalAlpha=Math.max(0,1-k/1.5);mgbBall(g,S2.sink.x,PK.WATER+10+k*70,PK.BR*.9);g.globalAlpha=1;}
    // наша сторона: стена кремля и пушка
    drawWall(g);
    drawCannon(g);
    // след и ядро
    if(S2.fly){const f=S2.fly;g.lineCap='round';for(let i=1;i<f.tr.length;i++){const a=i/f.tr.length;g.strokeStyle='rgba(255,240,210,'+(a*.5)+')';g.lineWidth=PK.BR*a*1.2;g.beginPath();g.moveTo(f.tr[i-1][0],f.tr[i-1][1]);g.lineTo(f.tr[i][0],f.tr[i][1]);g.stroke();}
      g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(glowSpr('#ffb050'),f.b.x-18,f.b.y-18,36,36);g.globalAlpha=1;g.globalCompositeOperation='source-over';mgbBall(g,f.b.x,f.b.y,PK.BR);}
    // прицел: пунктир начала дуги (без ветра)
    if(S2.state==='aim'&&S2.drag&&S2.drag.a&&S2.drag.a.pow>=.1){const a=S2.drag.a,b=pkLaunch(L,a.ang,a.pow),tl=(calm?.62:.4)*(2*b.vy/-PK.G<0?1.6:1.6);
      const dur=Math.max(.5,(-b.vy+Math.sqrt(b.vy*b.vy+2*PK.G*Math.max(1,-b.y+10)))/PK.G)*(calm?.62:.42);
      for(let i=1;i<=14;i++){const tt=dur*i/14,x=b.x+b.vx*tt,y=b.y+b.vy*tt+PK.G*tt*tt/2;const r=4.2*(1-i/20);g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle='rgba(255,236,170,'+(1-i/16)+')';g.fill();g.lineWidth=1.2;g.strokeStyle='rgba(90,40,0,.5)';g.stroke();}}
    mgbParts(g,S2.P,1/60);
    // числа «+3» — в мировых координатах, но размер постоянный на экране
    g.save();const k=1/c.s;for(const n of S2.N)n.y0=n.y0;mgbPops(g,S2.N,1/60,18*k);g.restore();}

  function drawTarget(g,o){const B=o.B,s=B.s,t=S2.t;g.save();g.translate(B.x,B.y);g.scale(s,s);
    if(o.k==='tent')drawTent(g,o);
    else if(o.k==='kotel')drawKotel(g,o);
    else if(o.k==='cart')drawCart(g,o);
    else if(o.k==='barrel')drawBarrelT(g,o);
    g.restore();}
  function shadow(g,w){ell(g,0,1,w,w*.16,'rgba(20,10,20,.32)',{ol:false,flat:true});}
  function drawTent(g,o){const [c1,c2]=o.col,dead=o.dead&&o.dt>=0,q=dead?Math.min(1,o.dt*2.2):0;shadow(g,46);
    if(dead){g.scale(1+q*.25,1-q*.72);}
    // шатёр: конус с полосами и каймой
    g.save();g.beginPath();g.moveTo(-42,0);g.quadraticCurveTo(-30,-40,0,-78);g.quadraticCurveTo(30,-40,42,0);g.closePath();g.clip();
    const gr=g.createLinearGradient(-42,0,42,0);gr.addColorStop(0,shade(c1,.25));gr.addColorStop(.6,c1);gr.addColorStop(1,shade(c1,-.45));g.fillStyle=gr;g.fillRect(-44,-80,88,82);
    for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(0,-80);g.lineTo(i*13-5,2);g.lineTo(i*13+3,2);g.closePath();g.fillStyle=rgba(c2.length===7?c2:'#ffffff',.55);g.fill();}
    g.fillStyle=shade(c1,-.35);g.fillRect(-44,-14,88,7);g.fillStyle=c2;for(let x=-40;x<44;x+=10){g.beginPath();g.moveTo(x,-14);g.lineTo(x+5,-7);g.lineTo(x+10,-14);g.fill();}
    g.restore();g.beginPath();g.moveTo(-42,0);g.quadraticCurveTo(-30,-40,0,-78);g.quadraticCurveTo(30,-40,42,0);g.closePath();g.lineWidth=2;g.strokeStyle=shade(c1,-.62);g.stroke();
    // вход
    shp(g,'#1a0e10',{ol:false,flat:true},[-9,-30,9,0],()=>{g.moveTo(-10,0);g.quadraticCurveTo(-6,-22,0,-30);g.quadraticCurveTo(6,-22,10,0);g.closePath();});
    if(!dead){g.fillStyle='rgba(255,170,60,.45)';g.beginPath();g.ellipse(0,-6,5,4,0,0,TAU);g.fill();}
    // флажок на маковке
    if(!dead){ln(g,[0,-78,0,-96],'#4a2a12',2);const wv=Math.sin(S2.t*6+o.u*20)*2;shp(g,c2,{},[0,-96,16,-86],()=>{g.moveTo(0,-96);g.quadraticCurveTo(8,-98+wv,16,-92+wv);g.quadraticCurveTo(8,-88,0,-87);g.closePath();});}
    if(dead)flames(g,o,[[-20,-10],[8,-14],[24,-6]]);}
  function flames(g,o,pts){const t=S2.t,k=Math.min(1,o.dt*.5);for(const [x,y] of pts){const h=16+Math.sin(t*12+x)*4;g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(glowSpr('#ff8a2a'),x-22,y-30,44,44);g.globalAlpha=1;g.globalCompositeOperation='source-over';
      g.fillStyle='#ff6a1a';g.beginPath();g.moveTo(x-7,y);g.quadraticCurveTo(x-6,y-h*.6,x,y-h);g.quadraticCurveTo(x+6,y-h*.6,x+7,y);g.closePath();g.fill();g.fillStyle='#ffd25a';g.beginPath();g.moveTo(x-3.5,y);g.quadraticCurveTo(x-3,y-h*.4,x,y-h*.6);g.quadraticCurveTo(x+3,y-h*.4,x+3.5,y);g.closePath();g.fill();}
    if(Math.random()<.12)mgbPart(S2.P,{k:'smoke',x:o.B.x+pts[0][0]*o.B.s,y:o.B.y-26,vy:-30,vx:8,s:12,dur:1.6,dark:true,a:.6});}
  function drawKotel(g,o){const t=S2.t,dead=o.dead&&o.dt>=0;shadow(g,30);
    // треножник
    ln(g,[-22,0,0,-44,22,0],'#3a2410',3);ln(g,[0,-44,0,-30],'#2a1a10',1.6);
    if(!dead){// огонь под котлом
      g.globalCompositeOperation='lighter';g.globalAlpha=.7;g.drawImage(glowSpr('#ff8a2a'),-26,-30,52,44);g.globalAlpha=1;g.globalCompositeOperation='source-over';
      for(let i=-1;i<=1;i++){const h=10+Math.sin(t*14+i*2)*3;g.fillStyle=i?'#ff7a1e':'#ffd25a';g.beginPath();g.moveTo(i*7-5,0);g.quadraticCurveTo(i*7,-h*1.3,i*7+5,0);g.fill();}}
    g.save();if(dead){const q=o.tip||0;g.translate(10*q,-4*q);g.rotate(q*1.2);}
    // котёл
    ell(g,0,-18,20,15,'#2e2a34',{hl:.35});ell(g,0,-30,19,5,'#3a3640');
    if(!dead){ell(g,0,-30,16,3.6,'#5aff4a',{ol:false,hl:.6});for(let i=0;i<3;i++){const ph=(t*1.4+i*.33)%1;g.fillStyle='rgba(190,255,160,'+(1-ph)+')';g.beginPath();g.arc(-8+i*8,-32-ph*10,2+ph*2,0,TAU);g.fill();}
      if(Math.random()<.08)mgbPart(S2.P,{k:'smoke',x:o.B.x,y:o.B.y-34,vy:-22,s:9,dur:1.4,a:.4});}
    g.restore();
    if(!dead){mgbArt(g,'kot',26,-10,26,{flip:true});mgbArt(g,'kot',-27,-10,24);}}
  function drawCart(g,o){const dead=o.dead&&o.dt>=0;shadow(g,38);if(dead){// обломки
      for(const [x,r] of[[-24,-.4],[20,.6]]){g.save();g.translate(x,-6);g.rotate(r);rrect(g,-14,-3,28,6,2);g.fillStyle='#5a3a1a';g.fill();g.restore();}
      ell(g,-30,-6,9,9,'#4a2a12',{ol:true});flames(g,o,[[-4,-8],[16,-4]]);return;}
    // телега: колёса, кузов, бочки, мешки
    rrect(g,-34,-30,68,16,3);g.fillStyle=grad(g,0,-22,34,'#8a5a2e',.25,-.35);g.fill();outline(g,'#8a5a2e',1.4);
    for(let x=-30;x<34;x+=8){ln(g,[x,-30,x,-14],'rgba(60,30,10,.45)',1);}
    ln(g,[34,-20,52,-12],'#5a3a1a',3);
    for(const [x,y] of[[-18,-42],[2,-44],[20,-41]]){ell(g,x,y,10,12,'#a0662e',{hl:.3});ln(g,[x-10,y-5,x+10,y-5],'#3a2a1a',1.6);ln(g,[x-10,y+5,x+10,y+5],'#3a2a1a',1.6);}
    for(const x of[-22,22]){ell(g,x,-10,10,10,'#5a3a1a',{hl:.2});ell(g,x,-10,3,3,'#3a2410');for(let a=0;a<6;a++){ln(g,[x,-10,x+Math.cos(a)*8,-10+Math.sin(a)*8],'#3a2410',1.2);}}}
  function drawBarrelT(g,o){if(o.dead&&o.dt>=0){flames(g,o,[[0,-6]]);return;}shadow(g,14);
    rrect(g,-12,-30,24,30,8);g.fillStyle=grad(g,0,-15,16,'#8a4a1e',.3,-.4);g.fill();outline(g,'#8a4a1e',1.2);
    for(const y of[-24,-6])ln(g,[-12,y,12,y],'#3a2a1a',2);
    // пороховая метка
    g.fillStyle='#1a1010';g.beginPath();g.arc(0,-15,4.5,0,TAU);g.fill();g.fillStyle='#ffd25a';g.font='bold 7px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('✶',0,-15);}
  function drawFlag(g,o){const B=o.B,s=B.s,t=S2.t;g.save();g.translate(B.x,B.y);g.scale(s,s);const f=o.fall==null?0:o.fall,e=f*f;g.rotate(e*1.45);
    ln(g,[0,0,0,-170],'#2a1a10',5);ln(g,[0,0,0,-170],'#5a3a22',2.5);ell(g,0,-172,4,4,'#e6b53a',{hl:.6});
    // полотнище Кощея: чёрно-багровое, с черепом
    const wv=t*4;g.beginPath();g.moveTo(2,-166);for(let i=0;i<=10;i++){const x=2+i*4.2,y=-166+Math.sin(wv+i*.6)*2.5*i/10;g.lineTo(x,y);}for(let i=10;i>=0;i--){const x=2+i*4.2,y=-128+Math.sin(wv+i*.6)*2.5*i/10+(i===10?-6:0);g.lineTo(x,y);}g.closePath();
    const gr=g.createLinearGradient(0,-166,0,-128);gr.addColorStop(0,'#2a1020');gr.addColorStop(1,'#6a1426');g.fillStyle=gr;g.fill();g.lineWidth=1.5;g.strokeStyle='#e6b53a';g.stroke();
    mgbArt(g,'skull',22,-147+Math.sin(wv+3)*1.2,22);
    g.restore();
    if(!o.dead){// мишень-подсказка: тонкое золотое кольцо пульсирует (знамя — 10 очков)
      const p=.5+.5*Math.sin(t*3);g.strokeStyle='rgba(255,215,90,'+(.25+.35*p)+')';g.lineWidth=2;g.beginPath();g.arc(B.x+18*s,B.y-147*s,26*s+p*4,0,TAU);g.stroke();}}
  function drawCampfire(g){const L2=L,x=L2.c0+(L2.c1-L2.c0)*.5,y=pkGround(L,x)-4,t=S2.t;}

  function drawWall(g){const top=PK.WALL_TOP,x1=150;
    // башня слева (шатровая, зелёная кровля, золотой флажок)
    const tx=-90;g.fillStyle='#7a2a20';g.fillRect(-2600,top+30,2600,3000);g.fillStyle='#9a3a2c';g.fillRect(tx-46,top-70,92,3000);
    const gt=g.createLinearGradient(tx-46,0,tx+46,0);gt.addColorStop(0,'rgba(255,200,160,.25)');gt.addColorStop(.6,'rgba(0,0,0,0)');gt.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=gt;g.fillRect(tx-46,top-70,92,520);
    shp(g,'#2f7a4a',{hl:.3},[tx-54,top-170,tx+54,top-64],()=>{g.moveTo(tx-54,top-64);g.lineTo(tx,top-170);g.lineTo(tx+54,top-64);g.closePath();});
    for(let i=1;i<5;i++){const y=top-64-i*21,w=54*(1-i*21/106);ln(g,[tx-w,y,tx+w,y],'rgba(230,200,90,.5)',1.2);}
    ln(g,[tx,top-170,tx,top-196],'#8a6a20',2.5);ell(g,tx,top-198,4,4,'#ffd24a',{hl:.7});
    const fw=Math.sin(S2.t*5)*2;shp(g,'#e8433a',{},[tx,top-196,tx+22,top-182],()=>{g.moveTo(tx,top-196);g.quadraticCurveTo(tx+11,top-200+fw,tx+22,top-190+fw);g.quadraticCurveTo(tx+11,top-184,tx,top-184);g.closePath();});
    for(const [wx,wy] of[[tx-18,top-40],[tx+12,top-40],[tx-3,top+10]]){rrect(g,wx-5,wy-9,10,18,5);g.fillStyle='#1a0e10';g.fill();g.fillStyle='rgba(255,190,90,.6)';g.fillRect(wx-3,wy-2,6,8);}
    // стена: красный кирпич с белыми прожилками
    g.fillStyle='#b44a36';g.fillRect(tx+40,top,x1-tx-40,3000);
    if(!C.br){const p=new Path2D();for(let y=top+8,r=0;y<top+900;y+=11,r++){p.moveTo(tx+40,y);p.lineTo(x1,y);for(let x=tx+40+(r%2)*11;x<x1;x+=22){p.moveTo(x,y);p.lineTo(x,y+11);}}C.br=p;}
    g.strokeStyle='rgba(255,220,200,.22)';g.lineWidth=1;g.stroke(C.br);
    const gw=g.createLinearGradient(0,top,0,top+300);gw.addColorStop(0,'rgba(255,170,110,.18)');gw.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=gw;g.fillRect(tx+40,top,x1-tx-40,300);g.fillStyle='rgba(0,0,0,.45)';g.fillRect(tx+40,top+300,x1-tx-40,2700);
    g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x1-6,top,6,3000);
    // зубцы «ласточкин хвост» (передний край)
    for(let x=tx+48;x<x1-4;x+=26){shp(g,'#c4523c',{hl:.2,dk:-.3},[x,top-26,x+18,top],()=>{g.moveTo(x,top);g.lineTo(x,top-20);g.lineTo(x+5,top-26);g.lineTo(x+9,top-19);g.lineTo(x+13,top-26);g.lineTo(x+18,top-20);g.lineTo(x+18,top);g.closePath();});}
    // берег у стены и кусты
    g.fillStyle='#4a6a2a';g.beginPath();g.moveTo(x1,0);g.lineTo(L.r0+4,0);g.quadraticCurveTo(L.r0+8,PK.WATER+10,L.r0,PK.WATER+40);g.lineTo(x1,PK.WATER+40);g.closePath();g.fill();
    g.fillStyle='#5a3a20';g.fillRect(x1,PK.WATER+40,L.r0-x1,3000);
    // ближний берег под стеной: земля и фундамент
    const gn=g.createLinearGradient(0,30,0,400);gn.addColorStop(0,'#5a3a20');gn.addColorStop(1,'#24160c');g.fillStyle=gn;g.fillRect(-2600,40,L.r0+2600,3000);
    g.fillStyle='#6a6470';for(let x=tx-46,i=0;x<x1;x+=24,i++){rrect(g,x,26+(i%2)*3,22,14,4);g.fill();}
    g.fillStyle='#4a6a2a';g.fillRect(x1,-2,L.r0-x1+2,8);
    mgbArt(g,'d_bush',x1+18,-8,30);}
  function drawCannon(g){const a=S2.drag&&S2.drag.a?S2.drag.a.ang:(S2.aim?S2.aim.ang:.6),rc=S2.recoil*S2.recoil*12,px=PK.PX,py=PK.PY;
    // пирамида ядер
    for(const [x,y] of[[-6,0],[8,0],[22,0],[1,-12],[15,-12],[8,-24]]){mgbBall(g,px-58+x,PK.WALL_TOP-8+y,6.5);}
    // ствол (поворачивается) — бронза с поясами и узором
    g.save();g.translate(px,py);g.rotate(-a);g.translate(-rc,0);
    const L0=-30,L1=PK.BARREL;
    g.beginPath();g.moveTo(L0,-16);g.lineTo(L1-6,-11);g.lineTo(L1-6,11);g.lineTo(L0,16);g.quadraticCurveTo(L0-14,0,L0,-16);g.closePath();
    const gb=g.createLinearGradient(0,-16,0,16);gb.addColorStop(0,'#f6d68a');gb.addColorStop(.35,'#c99a44');gb.addColorStop(.75,'#8a5a1e');gb.addColorStop(1,'#5a3410');g.fillStyle=gb;g.fill();g.lineWidth=2;g.strokeStyle='#4a2a08';g.stroke();
    for(const x of[-14,6,30,52]){const hh=16-(x-L0)/(L1-L0)*5+2;rrect(g,x-3,-hh,6,hh*2,2);g.fillStyle=gb;g.fill();g.lineWidth=1.2;g.strokeStyle='#4a2a08';g.stroke();}
    // узор-вьюнок
    g.strokeStyle='rgba(90,50,10,.55)';g.lineWidth=1.2;g.beginPath();for(let x=-10;x<50;x+=8){g.moveTo(x,0);g.quadraticCurveTo(x+4,-6,x+8,0);g.quadraticCurveTo(x+12,6,x+16,0);}g.stroke();
    // дуло
    rrect(g,L1-8,-14,12,28,4);g.fillStyle=gb;g.fill();g.lineWidth=1.6;g.strokeStyle='#4a2a08';g.stroke();ell(g,L1+4,0,3,9,'#1a0e06',{ol:false,flat:true});
    g.beginPath();g.ellipse(-4,-9,26,3,0,0,TAU);g.fillStyle='rgba(255,250,220,.45)';g.fill();
    g.restore();
    // лафет: деревянный, с большими колёсами
    shp(g,'#7a4a22',{hl:.25},[px-40,py-6,px+26,py+22],()=>{g.moveTo(px-40,py+20);g.lineTo(px-30,py-4);g.lineTo(px+18,py-6);g.lineTo(px+26,py+18);g.closePath();});
    ell(g,px-4,py+2,7,7,'#c99a44',{hl:.6});
    for(const [wx,r] of[[px-22,17],[px+14,17]]){const wy=PK.WALL_TOP-r+1;g.beginPath();g.arc(wx,wy,r,0,TAU);g.fillStyle='#5a3418';g.fill();g.lineWidth=3;g.strokeStyle='#2a1608';g.stroke();
      g.beginPath();g.arc(wx,wy,r-3,0,TAU);g.lineWidth=2;g.strokeStyle='#c99a44';g.stroke();for(let i=0;i<8;i++){const aa=i*Math.PI/4+.2;ln(g,[wx,wy,wx+Math.cos(aa)*(r-3),wy+Math.sin(aa)*(r-3)],'#8a5a2a',2.2);}ell(g,wx,wy,4,4,'#e6b53a',{hl:.6});}
    // флажок ветра на стене
    const w=M.wind[Math.min(S2.ball,M.wind.length-1)]||0,fx=125,fy=PK.WALL_TOP-26;ln(g,[fx,fy,fx,fy-46],'#3a2410',2.5);ell(g,fx,fy-48,2.6,2.6,'#e6b53a');
    const d=w>=0?1:-1,len=14+Math.abs(w)*20,fl=Math.sin(S2.t*(6+Math.abs(w)*8))*2.5;
    shp(g,'#e8d24a',{},[fx-len,fy-46,fx+len,fy-30],()=>{g.moveTo(fx,fy-46);g.quadraticCurveTo(fx+d*len*.5,fy-48+fl,fx+d*len,fy-40+fl*1.4);g.quadraticCurveTo(fx+d*len*.5,fy-34-fl,fx,fy-32);g.closePath();});
    // подсказка: пальцем тянуть назад от пушки
    if(S2.tut&&S2.state==='aim'&&!S2.drag){const k=(S2.t%2.2)/2.2,e=k<.15?0:k>.75?1:(k-.15)/.6,[hx,hy]=[px+40-e*90,py+20+e*55];mgbHandW(g,hx,hy,k);}}
  function mgbHandW(g,x,y,k){const c=cs();g.save();g.translate(x,y);g.scale(1/c.s,1/c.s);mgbHand(g,0,0,44,k<.15);g.restore();
    if(k>.15&&k<.8){g.setLineDash([6,6]);ln(g,[PK.PX+40,PK.PY+20,x,y],'rgba(255,255,255,.7)',2.5);g.setLineDash([]);}}

  /* ---------- HUD ---------- */
  function drawHUD(g,W,H,c){const top=8,port2=port,A=W-10-68,bh=48,bh2=42;   // справа 68 px — кнопка ✕ оболочки
    let R1,R2,R3,R4;   // ядра, счёт, ветер, меткость
    if(W>=980){const a=Math.min(220,A*.24),b=Math.min(250,A*.27),w3=Math.min(210,A*.22);R1=[10,top,a,bh];R2=[10+a+8,top,b,bh];R3=[R2[0]+b+8,top,w3,bh];R4=[R3[0]+w3+8,top,Math.min(300,10+A-(R3[0]+w3+8)),bh];}
    else{const a=Math.floor((A-8)*.5);R1=[10,top,a,bh];R2=[18+a,top,A-a-8,bh];const b2=Math.floor((W-28)*.42);R3=[10,top+bh+8,b2,bh2];R4=[18+b2,top+bh+8,W-28-b2,bh2];}
    HUD.hb=R3[1]+R3[3];
    // ядра
    mgbPlate(g,...R1);const left=S2.balls-S2.ball-(S2.state==='fly'||S2.state==='boom'?1:0),cy1=R1[1]+bh/2;
    let fs=16;const lb=Lg('Ядра','Shots');mgbTxt(g,lb,R1[0]+12,cy1,fs,'#ffe9b0',{al:'left'});
    const lx=R1[0]+12+mgbTW(g,lb,fs)+10,sp=Math.min(26,(R1[0]+R1[2]-10-lx)/Math.max(5,S2.balls)),br=Math.min(9,sp*.42);
    for(let i=0;i<S2.balls;i++){const x=lx+i*sp+br,y=cy1;if(i<left)mgbBall(g,x,y,br);else{g.beginPath();g.arc(x,y,br-1,0,TAU);g.strokeStyle='rgba(255,230,180,.35)';g.lineWidth=2;g.setLineDash([3,3]);g.stroke();g.setLineDash([]);}}
    // счёт и полоса до ступеней 10 / 20
    {const [sx,sy,sw]=R2,cy=sy+bh/2;mgbPlate(g,sx,sy,sw,bh);mgbStar(g,sx+22,cy,13,true);mgbTxt(g,String(S2.score),sx+40,cy-1,26,'#ffd24a',{al:'left'});
      const px0=sx+40+mgbTW(g,'00',26)+12,pw=sx+sw-14-px0;if(pw>40){const y=cy-4,f=Math.min(1,S2.score/(PK.TIERS[1]*1.2));rrect(g,px0,y-6,pw,12,6);g.fillStyle='rgba(0,0,0,.4)';g.fill();
        if(f>0){rrect(g,px0,y-6,Math.max(12,pw*f),12,6);const gg=g.createLinearGradient(0,y-6,0,y+6);gg.addColorStop(0,'#ffe27a');gg.addColorStop(1,'#d88a1a');g.fillStyle=gg;g.fill();}
        for(const v of PK.TIERS){const x=px0+pw*v/(PK.TIERS[1]*1.2);g.fillStyle=S2.score>=v?'#fff':'rgba(255,255,255,.45)';g.fillRect(x-1,y-8,2,16);mgbTxt(g,String(v),x,y+15,11,S2.score>=v?'#ffe9a0':'#d8c8a0',{lw:3});}}}
    // ветер
    {const w=M.wind[Math.min(S2.ball,M.wind.length-1)]||0,[wx,wy,ww,wh]=R3,mid=wy+wh/2;mgbPlate(g,wx,wy,ww,wh,{c1:'#2a3a5a',c2:'#141e34',rim:'#9ac8f0'});
      const lb2=Lg('Ветер','Wind'),n=Math.abs(w)<.45?1:Math.abs(w)<.75?2:3,str=n===1?Lg('слабый','light'):n===2?Lg('средний','medium'):Lg('сильный','strong');
      let f2=15;const need=()=>mgbTW(g,lb2,f2)+n*12+mgbTW(g,str,f2)+50;while(f2>10&&need()>ww)f2-=.5;
      mgbTxt(g,lb2,wx+12,mid,f2,'#cfe8ff',{al:'left'});const ax=wx+12+mgbTW(g,lb2,f2)+12;
      for(let i=0;i<n;i++)windArrow(g,ax+i*12+(w<0?6:0),mid,w<0?-1:1);mgbTxt(g,str,ax+n*12+10,mid,f2,'#fff',{al:'left'});}
    // меткость: три звезды со значками (котёл, знамя, 4 попадания)
    {const [ax2,ay,aw,ah]=R4,mid=ay+ah/2;mgbPlate(g,ax2,ay,aw,ah);const acc=[S2.acc.kotel,S2.acc.flag,S2.hitsN>=4?1:0];
      const cw=(aw-8)/3;for(let i=0;i<3;i++){const cx=ax2+4+cw*i+cw/2;mgbStar(g,cx-14,mid,10,!!acc[i],!!acc[i]);accIcon(g,i,cx+12,mid,acc[i]);}}
    // подсказка снизу
    const hy=H-(port2?HUD.bot-20:HUD.bot-14),hh=port2?HUD.bot-34:HUD.bot-24;
    if(S2.state==='aim'||S2.state==='fly'||S2.state==='boom'){const tip=S2.tut?(pc?Lg('Тяни мышкой назад от пушки и отпусти — или стрелки: ↑↓ угол, ←→ сила, пробел — пли! Знамя — 10, котёл — 5, шатёр — 3.','Drag back from the cannon and release — or arrows: ↑↓ angle, ←→ power, Space — fire! Banner 10, cauldron 5, tent 3.'):Lg('Тяни назад от пушки и отпусти. Знамя Кощея — 10, котёл — 5, шатёр — 3.','Pull back from the cannon and release. Koschei\'s banner 10, cauldron 5, tent 3.'))
        :S2.drag&&S2.drag.a?Lg('Сила','Power')+' '+Math.round(S2.drag.a.pow*100)+'%  ·  '+Lg('угол','angle')+' '+Math.round(S2.drag.a.ang*180/Math.PI)+'°':Lg('Ветер сносит ядро — смотри на флажок и облака.','Wind drifts the ball — watch the flag and clouds.');
      const w2=Math.min(W-20,560),x2=(W-w2)/2,fs0=port2?16:17,nl=Math.min(3,mgbWrap(g,tip,fs0,w2-30).length),hh2=Math.min(hh,nl*fs0*1.3+22),hy2=H-hh2-12;mgbPlate(g,x2,hy2,w2,hh2,{c1:'#3a2a4a',c2:'#1e1428',rim:'#b89ae0'});
      const lines=mgbWrap(g,tip,port2?16:17,w2-30);const fs=lines.length>2?14:port2?16:17;const ls=mgbWrap(g,tip,fs,w2-30);ls.slice(0,3).forEach((s,i)=>mgbTxt(g,s,W/2,hy2+hh2/2+(i-(Math.min(3,ls.length)-1)/2)*fs*1.25,fs,'#fff3d8',{w:700}));}
    if(S2.drag&&S2.drag.a){const d=S2.drag;g.setLineDash([8,7]);ln(g,[d.x0,d.y0,d.x,d.y],'rgba(255,240,200,.75)',3);g.setLineDash([]);
      g.beginPath();g.arc(d.x0,d.y0,10,0,TAU);g.fillStyle='rgba(255,240,200,.35)';g.fill();
      const p=d.a.pow,r=24;g.beginPath();g.arc(d.x,d.y,r,-Math.PI/2,-Math.PI/2+TAU*p);g.lineWidth=6;g.strokeStyle=p>.85?'#ff7a4a':'#ffd24a';g.stroke();g.beginPath();g.arc(d.x,d.y,r,0,TAU);g.lineWidth=1.5;g.strokeStyle='rgba(255,255,255,.5)';g.stroke();}
    if(S2.fly){const [bx,by]=w2s(S2.fly.b.x,S2.fly.b.y);if(by<(HUD.hb||60)+10){const x=Math.max(20,Math.min(W-20,bx)),y=(HUD.hb||60)+26;g.beginPath();g.moveTo(x,y-14);g.lineTo(x-10,y+2);g.lineTo(x+10,y+2);g.closePath();g.fillStyle='#ffd24a';g.fill();g.lineWidth=2;g.strokeStyle='#4a2006';g.stroke();mgbBall(g,x,y+14,7);}}
    if(S2.msg){const m=S2.msg,q=m.t/1.8,p=m.t<.15?1+(1-m.t/.15)*.5:1;g.globalAlpha=q>.75?(1-q)/.25:1;mgbTxt(g,m.s,W/2,(HUD.hb||60)+44-q*10,30*p,m.col||'#fff');g.globalAlpha=1;}}
  function accIcon(g,i,x,y,on){g.save();g.translate(x,y);g.globalAlpha=on?1:.75;
    if(i===0){ln(g,[-9,7,0,-9,9,7],'#3a2410',1.6);ell(g,0,2,9,7,'#2e2a34',{hl:.35,lw:1});ell(g,0,-3,8,2,'#5aff4a',{ol:false,flat:true});}
    else if(i===1){ln(g,[-6,10,-6,-11],'#c8a060',2);shp(g,'#7a1426',{lw:1},[-6,-11,9,-1],()=>{g.moveTo(-6,-11);g.lineTo(9,-9);g.lineTo(6,-5);g.lineTo(9,-1);g.lineTo(-6,-2);g.closePath();});}
    else{mgbBall(g,-4,0,7);mgbTxt(g,'×4',8,1,12,'#fff',{lw:3});}
    g.restore();}
  function windArrow(g,x,y,d){g.save();g.translate(x,y);g.scale(d,1);g.beginPath();g.moveTo(-6,-5);g.lineTo(2,0);g.lineTo(-6,5);g.lineWidth=3;g.strokeStyle='#bfe4ff';g.lineCap='round';g.lineJoin='round';g.stroke();g.restore();}
  function drawOffer(g,W,H){const O=S2.offer;O.t+=1/60;const e=Math.min(1,O.t/.3);g.fillStyle='rgba(10,6,20,'+.5*e+')';g.fillRect(0,0,W,H);
    const w=Math.min(W-32,400),h=250,x=(W-w)/2,y=(H-h)/2;g.globalAlpha=e;mgbScroll(g,x,y,w,h);
    mgbTxt(g,Lg('Ещё чуть-чуть!','So close!'),W/2,y+40,26,'#ffd24a',{ol:'#5a2a06'});
    for(const [i,s] of mgbWrap(g,Lg('До следующей награды не хватает '+O.gap+' '+plw(O.gap,'очка','очков','очков','point','points')+'.','Only '+O.gap+' '+plw(O.gap,'очко','очка','очков','point','points')+' to the next reward.'),17,w-50).entries())mgbTxt(g,s,W/2,y+78+i*22,17,'#5a3010',{sh:false,lw:.1,ol:'#f3e2bb',w:700});
    O.bs=[{x:x+20,y:y+h-150+28,w:w-40,h:64,fn:()=>{O.busy=1;Promise.resolve(host.ad('balls')).then(ok=>{if(ok){S2.adUsed=1;S2.balls+=2;S2.offer=null;S2.state='aim';say(Lg('Ещё 2 ядра!','2 more shots!'),'#ffd24a');}else showEnd();}).catch(()=>showEnd());}},
      {x:x+20,y:y+h-74,w:w-40,h:56,fn:()=>showEnd()}];
    if(!O.busy){mgbBtn(g,O.bs[0],Lg('Ещё 2 ядра за рекламу','2 more shots for an ad'),{col:'#3a8a4a',icon:(g,x,y,s)=>{mgbBall(g,x,y,s*.5);}});mgbBtn(g,O.bs[1],Lg('Хватит, подсчитать','Done, count it up'),{col:'#8a6a4a',px:18});}
    g.globalAlpha=1;}
  return {stop:()=>stg.kill()};}

/* бот для проверки ступеней наград: skill 0 плохой, 1 средний, 2 хороший → счёт */
function pkBot(skill,o){o=o||{};return pkBotRun((o.seed|0)||20261008,skill,o);}

if(typeof MG_REG==='function')MG_REG({id:'pushka',num:3,n:{ru:'Царь-пушка',en:'Tsar Cannon'},icon:'pushka',kind:'score',run:pkRun,tiers:PK.TIERS,
  bot:o=>{o=o||{};const sc=pkBot(o.skill==null?1:o.skill,o);return {score:sc,tier:pkTier(sc)};}});
