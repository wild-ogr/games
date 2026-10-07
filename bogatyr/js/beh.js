/* Повадки нечисти BEH и особенности вожаков AFX — зона A20 BEH (07.10). Формат и справочник — release-h/bogatyr-chapters/ENGINE-API.md, раздел «BEH».
   Хуки game.js (M4): BEH[имя]={on(e,G) при появлении, step(e,dt,G) → true = «сам подвинул», hit(e,d,G) → урон, die(e,G), warn(e,ctx) — рисунок поверх земли};
   AFX[имя]={t:{ru,en}, c (цвет рамки), on, step, hit, die}; BEH_FRAME(dt,G) — такт зон; BEH_ZONES(ctx,G) — рисует G.warn.
   Параметры повадки — EN[вид].bp:{…} (поверх умолчаний ниже). Опасности: G.warn=[{x,y,r,t,k,x2,y2,life}] — круг (или «капсула» x,y→x2,y2 полушириной r),
   t — сек. до удара (≤0 — зона действует сейчас, ещё life сек.), k — вид; бот обходит все, кроме k='wind'. Потолок: зон ≤ 20, копий/призванных ≤ 20.
   Без тем (старые главы 0–7) ничего не делает: BEH_FRAME выходит сразу, G.warn не создаётся, Math.random не трогается. */
const BEH={},AFX={};
const BZ={MAX:20,kid:0,dc:0,mk:null};
/* ---------- общие помощники ---------- */
function bzP(e,D){const s=EN[e.type]&&EN[e.type].bp,o={};for(const k in D)o[k]=s&&s[k]!=null?s[k]:D[k];return o;} /* параметры: bp вида поверх умолчаний */
function bzD(e){const H=G.hero,dx=H.x-e.x,dy=H.y-e.y;return [dx,dy,Math.hypot(dx,dy)||1];}
function bzSp(e){return e.spd*(e.slow>0?.55:1);}
/* «сам подвинул»: шаг + отдача (как в движке) + перенос далёкого вперёд (keep — не переносить) */
function bzMv(e,mx,my,sp,dt,keep){e.x+=(mx*sp+e.kx)*dt;e.y+=(my*sp+e.ky)*dt;const f=Math.pow(.004,dt);e.kx*=f;e.ky*=f;if(mx)e.face=mx<0?-1:1;
  if(!keep&&!e.elite){const H=G.hero,R=VIEW.R*1.7;if((e.x-H.x)**2+(e.y-H.y)**2>R*R){const p=spawnPos();e.x=p[0];e.y=p[1];e.oR=0;}}return true;}
function bzStay(e,dt){return bzMv(e,0,0,0,dt,1);}
function bzChase(e,dt,k){const [dx,dy,d]=bzD(e);return bzMv(e,dx/d,dy/d,bzSp(e)*(k||1),dt);}
/* держаться поодаль, как стрелки: ближе near — отходит, до far — обходит сбоку, дальше — подходит */
function bzKeep(e,dt,near,far){const [dx,dy,d]=bzD(e);let mx=dx/d,my=dy/d;if(d<near){mx=-mx*.6;my=-my*.6;}else if(d<far){const t=mx;mx=-my*.5;my=t*.5;}
  bzMv(e,mx,my,bzSp(e),dt);e.face=dx<0?-1:1;return true;}
function bzAng(e){const H=G.hero;return Math.atan2(H.y-e.y,H.x-e.x);}
function bzTurn(e,dt,w){let a=bzAng(e)-e.sa;a=Math.atan2(Math.sin(a),Math.cos(a));const m=w*dt;e.sa+=a>m?m:a<-m?-m:a;}
function bzFront(e,arc){let a=bzAng(e)-e.sa;a=Math.atan2(Math.sin(a),Math.cos(a));return Math.abs(a)<arc;}
/* сколько ещё можно копий/призванных (потолок 20 на поле) */
function bzRoom(){let n=0;for(const e of G.en)if(e.bx&&!e.dead)n++;return Math.max(0,BZ.MAX-n);}
function bzKid(type,x,y){BZ.kid=1;let k;try{k=mkEnemy(type,x,y);}finally{BZ.kid=0;}k.bx=1;return k;}
/* вид для призыва: bp.id, иначе вид из волн главы (не зазывала, не босс, уже вышел), иначе первый вид главы */
function bzMin(e,id){if(id&&EN[id]&&!EN[id].boss)return id;const t=DT();
  for(const w of G.w||[])if(w.id!==e.type&&EN[w.id]&&!EN[w.id].boss&&EN[w.id].beh!=='summon'&&t>=w.t)return w.id;
  const c=G.ch.en&&G.ch.en[0];return c&&EN[c]?c:e.type;}
function bzPuff(e){burst(e.x,e.y,'#cfc6e8',qLow()?4:8,90);}
/* зоны: добавить (полон — вытесняет самую старую лужу, иначе отказ → null) */
function bzZ(z){const W=G.warn||(G.warn=[]);if(W.reduce((n,q)=>q.bk?n:n+1,0)>=BZ.MAX){ /* опасности BK (bk:1) не в счёт */const i=W.findIndex(q=>q.k==='pud');if(i<0)return null;W[i].dead=1;W.splice(i,1);}
  z.t0=z.t>0?z.t:0;z.life=z.life||0;W.push(z);return z;}
function bzSeg(px,py,z){const vx=z.x2-z.x,vy=z.y2-z.y,l=vx*vx+vy*vy||1,u=Math.max(0,Math.min(1,((px-z.x)*vx+(py-z.y)*vy)/l));return Math.hypot(px-z.x-vx*u,py-z.y-vy*u);}
function bzIn(z,x,y,pad){return (z.x2!=null?bzSeg(x,y,z):Math.hypot(x-z.x,y-z.y))<z.r+(pad||0);}
function heroIn(z,pad){const H=G.hero;return bzIn(z,H.x,H.y,pad==null?8:pad);}
/* такт: раз в кадр (движок зовёт из update, в паузе — нет) */
function BEH_FRAME(dt,G){const A=G.bAu,W=G.warn;
  if(A&&A.length){for(const o of A)if(o.dead||G.t>o.au){o.spd=o.spd0;o.spd0=0;o.au=0;}else if(o.hp<o.max)o.hp=Math.min(o.max,o.hp+o.max*o.auR*dt);compact(A,o=>o.au>0&&!o.dead);}
  if(!W||!W.length)return;
  for(const z of W){if(z.dead||z.bk)continue; /* bk:1 — опасности BK: тикает и удаляет bk.js */if(z.own&&z.own.dead&&z.cancel){z.dead=1;continue;}
    if(z.t>0){z.t-=dt;if(z.t<=0&&z.fn)z.fn(z,G);}else{z.life-=dt;if(z.on)z.on(z,dt,G);}
    if(z.t<=0&&z.life<=0)z.dead=1;}
  compact(W,z=>!z.dead);}
/* удары зон */
function bzBoom(z){const e=z.own;if(e&&e.dead)return;const H=G.hero;
  if(!CALM())G.fx.push({k:'boom',x:z.x,y:z.y,t:0,dur:.4,r:z.r*1.2});burst(z.x,z.y,z.c||'#ff8a2a',14,200);SND.boom();
  if(heroIn(z))hurtHero(z.dmg,z.src);
  if(z.ek)forNear(z.x,z.y,z.r,o=>{if(o===e||o.boss||o.prop||o.dc||Math.hypot(o.x-z.x,o.y-z.y)>z.r)return;hitEnemy(o,o.max*(o.elite?.08:z.ek));});
  if(z.pud>0)bzZ({k:'pud',x:z.x,y:z.y,r:z.r,t:0,life:z.pud,slow:z.slow,src:z.src,c:z.pc||'#9a8a70',on:bzPud}); /* облачко/лужа после взрыва (bp.dur, bp.slow) */
  if(e&&!e.dead){e.dead=true;}}
function bzHitZ(z){burst(z.x,z.y,z.pc||'#c8a060',qLow()?5:10,140);if(heroIn(z))hurtHero(z.dmg,z.src);
  if(z.pud>0)bzZ({k:'pud',x:z.x,y:z.y,r:z.r*.9,t:0,life:z.pud,slow:z.slow,burn:z.burn,src:z.src,c:z.pc,on:bzPud});}
function bzPud(z){const H=G.hero;if(!heroIn(z,0))return;if(z.slow)H.slowT=Math.max(H.slowT||0,.25);if(z.burn)hurtHero(z.burn,z.src);}
function bzWind(z,dt){if(!heroIn(z,0))return;const H=G.hero,f=G.st.spd*z.f*dt;H.x+=z.dx*f;H.y+=z.dy*f;}
/* ---------- рисунок зон (мир. координаты; движок после сам зовёт worldT) ---------- */
function bzPath(c,z,r){c.beginPath();if(z.x2!=null){c.lineWidth=r*2;c.lineCap='round';c.moveTo(z.x,z.y);c.lineTo(z.x2,z.y2);}else c.arc(z.x,z.y,r,0,TAU);}
function BEH_ZONES(c,G){const calm=CALM(),lo=qLow(),T=G.t,X=VIEW.cx,Y=VIEW.cy,ww=VIEW.ww+260,wh=VIEW.wh+260;
  for(const z of G.warn){if(z.dead||z.bk)continue; /* bk:1 рисует BK_DRAW */if(z.x2==null&&(Math.abs(z.x-X)>ww||Math.abs(z.y-Y)>wh))continue;
    const cap=z.x2!=null,p=z.t>0&&z.t0>0?1-z.t/z.t0:1;
    if(z.k==='pud'){const a=Math.min(1,z.life*1.5,(z.t0||0)+1);c.globalAlpha=.38*a;c.fillStyle=z.c||'#6ab04c';bzPath(c,z,z.r);cap?c.stroke():c.fill();
      c.globalAlpha=.6*a;c.strokeStyle=z.c||'#6ab04c';c.lineWidth=2;c.beginPath();c.arc(z.x,z.y,z.r,0,TAU);c.stroke();c.globalAlpha=1;continue;}
    if(z.k==='wind'){const on=z.t<=0;c.globalAlpha=on?.16:.08+.1*p;c.strokeStyle='#cfeaff';bzPath(c,z,z.r);c.stroke();c.globalAlpha=on?.55:.3;c.lineWidth=2;c.lineCap='round';
      const n=lo?3:6,vx=z.x2-z.x,vy=z.y2-z.y,px=-z.dy,py=z.dx,sp=on?2.2:.7;
      for(let i=0;i<n;i++){const u=((T*sp+i*.37)%1),o=(i/(n-1)-.5)*z.r*1.4,x=z.x+vx*u+px*o,y=z.y+vy*u+py*o;c.beginPath();c.moveTo(x,y);c.lineTo(x+z.dx*28,y+z.dy*28);c.stroke();}
      c.globalAlpha=1;continue;}
    /* опасность: заливка крепнет к удару, внутреннее кольцо/полоса показывает, сколько осталось; без «мигания» в спокойном режиме */
    const col=z.c||'#ff3c28',a=z.t>0?.2+.22*p+(calm?0:.07*Math.sin(T*16)):.38;
    if(cap){c.globalAlpha=.45;c.strokeStyle='#5a0a00';bzPath(c,z,z.r+2);c.stroke();}
    c.globalAlpha=a;c.fillStyle=col;c.strokeStyle=col;if(cap){bzPath(c,z,z.r);c.stroke();}else{bzPath(c,z,z.r);c.fill();}
    c.globalAlpha=.75;c.lineWidth=2.5;
    if(cap){if(z.t>0){c.globalAlpha=.32;c.lineWidth=z.r*2*Math.max(.15,p);c.beginPath();c.moveTo(z.x,z.y);c.lineTo(z.x+(z.x2-z.x)*p,z.y+(z.y2-z.y)*p);c.stroke();}}
    else{c.beginPath();c.arc(z.x,z.y,z.r,0,TAU);c.stroke();if(z.t>0){c.lineWidth=3;c.beginPath();c.arc(z.x,z.y,Math.max(2,z.r*p),0,TAU);c.stroke();}}
    if(z.k==='lob'&&z.t>0){const h=Math.sin(p*Math.PI)*90,x=z.sx+(z.x-z.sx)*p,y=z.sy+(z.y-z.sy)*p-h;c.globalAlpha=1;c.fillStyle='#3a2a1a';c.beginPath();c.arc(x,y,6,0,TAU);c.fill();
      c.fillStyle=z.c||'#c8a060';c.beginPath();c.arc(x-1.5,y-1.5,4,0,TAU);c.fill();}
    c.globalAlpha=1;}
  c.lineCap='butt';}
/* дуга щита перед врагом */
function bzShieldDraw(e,c,col,a){c.strokeStyle=col;c.lineWidth=5;c.lineCap='round';c.globalAlpha=.85;c.beginPath();c.arc(e.x,e.y-e.r*.2,e.r+7,a-.85,a+.85);c.stroke();
  c.strokeStyle='rgba(20,24,30,.6)';c.lineWidth=1.5;c.beginPath();c.arc(e.x,e.y-e.r*.2,e.r+10,a-.85,a+.85);c.stroke();c.globalAlpha=1;c.lineCap='butt';}
function bzRing(c,x,y,r,col,p,w){c.strokeStyle=col;c.lineWidth=w||3;c.beginPath();c.arc(x,y,r,-Math.PI/2,-Math.PI/2+TAU*p);c.stroke();}
/* рамка вожака по особенностям: цветные кольца у ног (несколько особенностей — несколько колец) */
function afxDraw(e,c){if(!e.afx)return;const calm=CALM();let i=0;for(const k of e.afx){const x=AFX[k];if(!x||!x.c)continue;
    const rx=e.r*(1.3+i*.25),ry=e.r*(.5+i*.1),y=e.y+e.r*.8;c.globalAlpha=.5;c.strokeStyle='#14100c';c.lineWidth=6;c.beginPath();c.ellipse(e.x,y,rx,ry,0,0,TAU);c.stroke();
    c.globalAlpha=calm?.95:.8+.15*Math.sin(G.t*3+i);c.strokeStyle=x.c;c.lineWidth=4;c.stroke();i++;}
  if(e.afx.indexOf('aura')>=0)bzAuDraw(c);
  if(e.afx.indexOf('frost')>=0){c.globalAlpha=.12;c.fillStyle='#bfeaff';c.beginPath();c.arc(e.x,e.y,e.r+70,0,TAU);c.fill();}
  if(e.afx.indexOf('shield')>=0&&e.sa!=null)bzShieldDraw(e,c,'#9fb6d6',e.sa);c.globalAlpha=1;}

/* ---------- повадки ---------- */
/* старые имена — для тем, что пишут beh:'walk'/'fly'/'ranged' явно */
BEH.walk={};BEH.fly={on(e){e.fly=1;}};BEH.ranged={on(e){e.ranged=1;}};
BEH._afx={}; /* вожак без повадки: только рамка особенностей */
/* dash — рывок: целится (красная полоса ≥0,8 с), рывок по прямой. bp: cd, warn, spd (×скорость), len */
BEH.dash={on(e){e.bp=bzP(e,{cd:3.5,warn:.9,spd:4.2,len:260});if(e.bp.spd>20)e.bp.spd/=e.spd||1; /* spd>20 — px/с, а не множитель */e.bc=rand(1,e.bp.cd);e.bs=0;},
  step(e,dt){const P=e.bp;e.bc-=dt;
    if(e.bs===1){if(!e.bz||e.bz.dead){e.bs=0;e.bc=1;return false;}if(e.bz.t<=0){e.bs=2;e.bt=P.len/(e.spd*P.spd);}return bzStay(e,dt);}
    if(e.bs===2){e.bt-=dt;bzMv(e,e.bdx,e.bdy,e.spd*P.spd,dt,1);if(e.bt<=0){e.bs=0;e.bc=P.cd*rand(.85,1.15);}return true;}
    const [dx,dy,d]=bzD(e);
    if(e.bc<=0&&d<P.len*.85&&d>40){e.bdx=dx/d;e.bdy=dy/d;const sp=e.spd*P.spd;
      const z=bzZ({k:'dash',x:e.x,y:e.y,x2:e.x+e.bdx*P.len,y2:e.y+e.bdy*P.len,r:e.r+8,t:Math.max(.8,P.warn),life:P.len/sp+.05,own:e,cancel:1});
      if(z){e.bs=1;e.bz=z;e.face=e.bdx<0?-1:1;return bzStay(e,dt);}e.bc=1;}
    return false;}};
/* burrow — подкоп: уходит под землю, кружок под героем ≥0,8 с, выныривает с ударом. bp: cd, warn, r, dmg (×урон), rng, dig (сек. под землёй до кружка) */
function bzUp(z){const e=z.own;if(!e||e.dead)return;e.x=z.x;e.y=z.y;e.dmg=e.dmg0;e.bs=0;e.bc=e.bp.cd*rand(.85,1.2);e.bz=null;e.kx=e.ky=0;
  burst(z.x,z.y,'#8a6a42',qLow()?5:10,150);if(z.r&&heroIn(z))hurtHero(e.dmg*e.bp.dmg,e.type);}
BEH.burrow={on(e){e.bp=bzP(e,{cd:5,warn:1,r:48,dmg:1.5,rng:320,dig:.5});e.bc=rand(2,e.bp.cd);e.bs=0;},
  step(e,dt){const P=e.bp,H=G.hero;
    if(e.bs===1){e.bt-=dt;if(e.bt<=0&&!e.bz){const z=bzZ({k:'burrow',x:H.x,y:H.y,r:P.r,t:Math.max(.8,P.warn),own:e,c:'#ff6a28',fn:bzUp});
        if(z)e.bz=z;else bzUp({own:e,x:e.ux,y:e.uy,r:0});}return true;}
    e.bc-=dt;const [,,d]=bzD(e);
    if(e.bc<=0&&d<P.rng&&onScreen(e,0)){burst(e.x,e.y,'#8a6a42',qLow()?4:8,90);e.ux=e.x;e.uy=e.y;e.x+=1e5;e.dmg0=e.dmg;e.dmg=0;e.bs=1;e.bt=P.dig;e.bz=null;return true;}
    return false;}};
/* lob — навесной бросок в точку, где стоит герой (тень-круг ≥0,8 с), брызги; bp.pud>0 — лужа на столько секунд (slow — замедляет, burn — жжёт ×урон). bp: cd, warn, r, dmg, rng, pud, slow, burn, c */
BEH.lob={on(e){const P=e.bp=bzP(e,{cd:3.2,warn:1,r:42,dmg:1,rng:340,pud:0,slow:1,burn:0,c:'#c8a060'});if(P.r>120){P.rng=P.r;P.r=42;}if(P.dmg>3)P.dmg/=e.dmg||1; /* r>120 — это дальность; dmg>3 — урон числом */e.bc=rand(1.5,e.bp.cd);},
  step(e,dt){const P=e.bp,H=G.hero;e.bc-=dt;const [,,d]=bzD(e);
    if(e.bc<=0&&d<P.rng&&onScreen(e,0)){e.bc=P.cd*rand(.9,1.15);
      bzZ({k:'lob',x:H.x,y:H.y,r:P.r,t:Math.max(.8,P.warn),sx:e.x,sy:e.y-e.r,fn:bzHitZ,dmg:e.dmg*P.dmg,src:e.type,pud:P.pud,slow:P.slow,burn:P.burn?e.dmg*P.burn:0,pc:P.c});}
    return bzKeep(e,dt,170,250);}};
/* shield — щит спереди: в лоб урон ×k, сбоку/сзади и оглушённому — полный; щит медленно поворачивается к герою. bp: k, turn (рад/с), arc (полуширина «лба», рад) */
BEH.shield={on(e){e.bp=bzP(e,{k:.25,turn:1.4,arc:1.1});e.sa=bzAng(e);},
  step(e,dt){bzTurn(e,dt,e.bp.turn);return false;},
  hit(e,d){return e.stun>0||!bzFront(e,e.bp.arc)?d:d*e.bp.k;},
  warn(e,c){bzShieldDraw(e,c,'#c8d4e0',e.sa);}};
/* split — при смерти дробится на n мелких (мельче, слабее, быстрее). bp: n, sc, hp (доля здоровья), gen (сколько раз дробится), xp */
BEH.split={on(e){e.bp=bzP(e,{n:2,sc:.62,hp:.4,gen:1,xp:.5});},
  die(e){const P=e.bp;if((e.gen|0)>=P.gen||e.boss||e.mini)return;const n=Math.min(P.n,bzRoom()),x=e.x,y=e.y,t=e.type,g=(e.gen|0)+1,sc=(e.elite?1:e.sc)*P.sc,xp=e.xp*P.xp;
    for(let i=0;i<n;i++){const a=i/n*TAU+rand(-.4,.4);later(0,()=>{if(bzRoom()<=0)return;const k=bzKid(t,x,y);k.gen=g;k.sc=sc;k.r=EN[t].r*sc;k.hp*=P.hp;k.max=k.hp;k.xp=xp;k.spd*=1.15;k.kx=Math.cos(a)*220;k.ky=Math.sin(a)*220;});}}};
/* bomb — взрывник: у героя «шипит» (круг ≥0,8 с) и взрывается кругом, бьёт и богатыря, и нечисть. Убит раньше — не взорвётся. bp: r, warn, dmg (×урон), trig (дистанция), ek (доля здоровья соседей) */
BEH.bomb={on(e){e.bp=bzP(e,{r:85,warn:1,dmg:2.5,trig:70,ek:.6,slow:0,dur:0,c:'#ff3c28'});e.bs=0;},
  step(e,dt){const P=e.bp;if(e.bs===1)return bzStay(e,dt);const [,,d]=bzD(e);
    if(d<P.trig+e.r){const z=bzZ({k:'bomb',x:e.x,y:e.y,r:P.r,t:Math.max(.8,P.warn),own:e,cancel:1,fn:bzBoom,dmg:e.dmg*P.dmg,src:e.type,ek:P.ek,pud:P.dur,slow:P.slow?1:0,pc:P.slow?'#b9a6e8':null});if(z){e.bs=1;e.bz=z;return bzStay(e,dt);}}
    return false;},
  warn(e,c){if(e.bs!==1||!e.bz)return;const p=e.bz.t0?1-e.bz.t/e.bz.t0:1,y=e.y-e.r*1.3;c.fillStyle=CALM()?'#ffb040':(Math.sin(G.t*25)>0?'#fff2a0':'#ff7a20');
    c.beginPath();c.arc(e.x,y,3+p*3,0,TAU);c.fill();}};
/* aura — знаменосец: нечисть рядом быстрее (×spd) и подлечивается (reg доли здоровья в сек.); видна золотая аура. bp: r, spd, reg */
function bzBuff(o,P){if(!o.spd0){o.spd0=o.spd;o.spd*=P.spd;(G.bAu||(G.bAu=[])).push(o);}o.au=G.t+.35;o.auR=P.reg;}
BEH.aura={on(e){e.bp=bzP(e,{r:140,spd:1.3,reg:.04});e.bt=rand(0,.2);},
  step(e,dt){const P=e.bp;e.bt-=dt;if(e.bt<=0){e.bt=.2;forNear(e.x,e.y,P.r,o=>{if(o!==e&&!o.boss&&!o.prop&&!o.dc&&(o.x-e.x)**2+(o.y-e.y)**2<P.r*P.r)bzBuff(o,P);});}return false;},
  warn(e,c){const P=e.bp;c.strokeStyle='rgba(255,210,90,.5)';c.lineWidth=2.5;c.setLineDash([8,8]);c.lineDashOffset=CALM()?0:-G.t*24;c.beginPath();c.arc(e.x,e.y,P.r,0,TAU);c.stroke();c.setLineDash([]);
    c.fillStyle='rgba(255,210,90,.10)';c.fill();
    bzAuDraw(c);}};
/* золотые «галочки» над нечистью под аурой (раз в кадр) */
function bzAuDraw(c){if(BZ.af===G.t||!G.bAu)return;BZ.af=G.t;let n=qLow()?20:50;c.fillStyle='#ffd25a';for(const o of G.bAu){if(n--<=0)break;if(!onScreen(o,0))continue;const y=o.y-o.r*1.35;c.beginPath();c.moveTo(o.x-4,y+2);c.lineTo(o.x,y-3);c.lineTo(o.x+4,y+2);c.fill();}}
/* heal — ворожея: копит 0,8 с (зелёный круг) и лечит соседей вспышкой; держится позади. bp: cd, r, amt (доля здоровья), ch (сек. накопления) */
BEH.heal={on(e){e.bp=bzP(e,{cd:4.5,r:130,amt:.3,ch:.8});e.bc=rand(1,e.bp.cd);e.bt=0;},
  step(e,dt){const P=e.bp;e.bc-=dt;
    if(e.bt>0){e.bt-=dt;if(e.bt<=0){forNear(e.x,e.y,P.r,o=>{if(o.boss||o.prop||o.dc||(o.x-e.x)**2+(o.y-e.y)**2>P.r*P.r)return;o.hp=Math.min(o.max,o.hp+o.max*P.amt*(o===e?.5:1));});
        G.fx.push({k:'wave',x:e.x,y:e.y,t:0,dur:.5,r1:P.r,col:'#6aff8a'});if(!qLow())spark(e.x,e.y-e.r,'#9affb0',6);}}
    else if(e.bc<=0&&onScreen(e,0)){let need=0;forNear(e.x,e.y,P.r,o=>{if(!o.boss&&!o.dc&&o.hp<o.max*.9)need=1;});if(need){e.bt=P.ch;e.bc=P.cd;}else e.bc=.7;}
    return bzKeep(e,dt,150,230);},
  warn(e,c){if(e.bt>0){const p=1-e.bt/e.bp.ch;c.strokeStyle='rgba(106,255,138,.7)';c.lineWidth=3;c.beginPath();c.arc(e.x,e.y,e.r+4+p*(e.bp.r-e.r-4),0,TAU);c.stroke();}}};
/* summon — зазывала: раз в cd копит 1 с (знаки на земле) и вызывает n мелких; держится поодаль; призванные сами не зазывают. bp: cd, n, id (вид призыва), ch, r */
BEH.summon={on(e){e.bp=bzP(e,{cd:7,n:3,id:null,ch:1,r:60});e.bc=rand(2,4);e.bt=0;},
  step(e,dt){const P=e.bp;if(e.bx)return false;e.bc-=dt;
    if(e.bt>0){e.bt-=dt;if(e.bt<=0&&e.bsp){const t=bzMin(e,P.id),pts=e.bsp.map(q=>[e.x+q[0],e.y+q[1]]);e.bsp=null;
        later(0,()=>{for(const q of pts){if(bzRoom()<=0)break;const k=bzKid(t,q[0],q[1]);k.xp*=.5;burst(q[0],q[1],'#b07aff',qLow()?3:6,80);}});}}
    else if(e.bc<=0&&onScreen(e,-20)){e.bc=P.cd;const n=Math.min(P.n,bzRoom());if(n>0){e.bsp=[];for(let i=0;i<n;i++){const a=i/n*TAU+rand(0,1);e.bsp.push([Math.cos(a)*P.r,Math.sin(a)*P.r]);}e.bt=P.ch;}}
    return bzKeep(e,dt,200,280);},
  warn(e,c){if(!(e.bt>0&&e.bsp))return;const p=1-e.bt/e.bp.ch;c.strokeStyle='rgba(176,122,255,.8)';c.fillStyle='rgba(176,122,255,.18)';c.lineWidth=2;
    for(const q of e.bsp){const x=e.x+q[0],y=e.y+q[1];c.beginPath();c.arc(x,y,10+p*6,0,TAU);c.fill();c.stroke();}}};
/* latch — присоска: цепляется к богатырю и тянет здоровье, пока он не «стряхнёт» её бегом (off сек. движения); не больше max на герое. bp: dps (×урон за 0,6 с), off, max */
BEH.latch={on(e){e.bp=bzP(e,{dps:.5,off:1.1,max:3,cd:2.5});e.bs=0;e.bc=0;},
  step(e,dt){const H=G.hero,P=e.bp;
    if(e.bs===1){e.lm=H.moving?e.lm+dt:Math.max(0,e.lm-dt*.5);e.x=H.x+e.lx;e.y=H.y+e.ly;e.face=e.lx>0?-1:1;e.kx=e.ky=0;
      e.lt-=dt;if(e.lt<=0){e.lt=.6;hurtHero(Math.max(1,e.dmg0*P.dps),e.type);e.hp=Math.min(e.max,e.hp+e.dmg0*.5);}
      if(e.lm>=P.off){e.bs=0;e.dmg=e.dmg0;e.stun=.9;const a=Math.atan2(e.ly,e.lx);e.kx=Math.cos(a)*420;e.ky=Math.sin(a)*420;e.bc=P.cd;bzPuff(e);}
      return true;}
    e.bc-=dt;const [dx,dy,d]=bzD(e);
    if(e.bc<=0&&d<e.r+16){let n=0;for(const o of G.en)if(o.bs===1&&o.beh==='latch'&&!o.dead)n++;
      if(n<P.max){e.bs=1;e.lm=0;e.lt=.3;e.dmg0=e.dmg;e.dmg=0;e.lx=-dx/d*e.r*.8;e.ly=-dy/d*e.r*.8;return true;}}
    return false;},
  warn(e,c){if(e.bs!==1)return;const H=G.hero;c.strokeStyle='rgba(200,40,60,.6)';c.lineWidth=3;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(H.x,H.y-8);c.stroke();
    bzRing(c,e.x,e.y-e.r*1.4,7,'rgba(255,255,255,.85)',Math.min(1,e.lm/e.bp.off),3);}};
/* pull — аркан: целится линией ≥0,8 с, кто остался на линии — тянет к себе (и чуть ранит). bp: cd, warn, rng, f (сила рывка), dmg, w (полуширина) */
function bzPull(z){const e=z.own;if(!e||e.dead)return;e.bs=0;e.rope=.25;if(!heroIn(z,6))return;const H=G.hero,dx=e.x-H.x,dy=e.y-H.y,d=Math.hypot(dx,dy)||1;
  H.kx+=dx/d*e.bp.f;H.ky+=dy/d*e.bp.f;hurtHero(e.dmg*e.bp.dmg,e.type);}
BEH.pull={on(e){e.bp=bzP(e,{cd:5,warn:1,rng:300,f:560,dmg:.5,w:20});e.bc=rand(2,e.bp.cd);e.bs=0;},
  step(e,dt){const P=e.bp;if(e.rope>0)e.rope-=dt;if(e.bs===1)return bzStay(e,dt);e.bc-=dt;const [dx,dy,d]=bzD(e);
    if(e.bc<=0&&d<P.rng&&d>80){const l=d+50;const z=bzZ({k:'pull',x:e.x,y:e.y,x2:e.x+dx/d*l,y2:e.y+dy/d*l,r:P.w,t:Math.max(.8,P.warn),own:e,cancel:1,fn:bzPull,c:'#ff7a3a'});
      e.bc=z?P.cd*rand(.9,1.2):1;if(z){e.bs=1;return bzStay(e,dt);}}
    return bzKeep(e,dt,170,250);},
  warn(e,c){if(e.rope>0){const H=G.hero;c.strokeStyle='#c8a060';c.lineWidth=3;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(H.x,H.y);c.stroke();}}};
/* trail — след: оставляет лужи (замедляют; burn — жгут ×урон); лужи — общий потолок зон. bp: cd (сек. между лужами), r, life, slow, burn, c */
BEH.trail={on(e){e.bp=bzP(e,{cd:.7,r:24,life:3.5,slow:1,burn:0,c:'#6ab04c'});e.bc=rand(0,e.bp.cd);},
  step(e,dt){const P=e.bp;e.bc-=dt;if(e.bc<=0){e.bc=P.cd;if(onScreen(e,60))bzZ({k:'pud',x:e.x,y:e.y+e.r*.5,r:P.r,t:0,life:P.life,slow:P.slow,burn:P.burn?e.dmg*P.burn:0,src:e.type,c:P.c,on:bzPud});}return false;}};
/* orbit — хоровод: подходит до R и кружит вокруг богатыря, сжимая кольцо (shrink px/с); дошёл до min — идёт прямо. bp: R, min, shrink, w (×скорость кружения) */
BEH.orbit={on(e){e.bp=bzP(e,{R:190,min:60,shrink:12,w:1});e.od=Math.random()<.5?-1:1;e.oR=0;},
  step(e,dt){const H=G.hero,P=e.bp;const [dx,dy,d]=bzD(e);
    if(e.oR<0)return false;
    if(!e.oR||d>e.oR+220){e.oR=0;if(d>P.R+15)return false;e.oR=d;e.oa=Math.atan2(-dy,-dx);}
    e.oR-=P.shrink*dt;if(e.oR<=P.min){e.oR=-1;return false;}
    e.oa+=e.od*bzSp(e)*P.w/e.oR*dt;const tx=H.x+Math.cos(e.oa)*e.oR,ty=H.y+Math.sin(e.oa)*e.oR,mx=tx-e.x,my=ty-e.y,m=Math.hypot(mx,my)||1;
    bzMv(e,mx/m,my/m,Math.min(m/dt,bzSp(e)*1.8),dt);e.face=dx<0?-1:1;return true;}};
/* thief — воришка: хватает самоцветы (не тронутые магнитом) и убегает; поймал — отдаёт ×mul; убежал — пропал с добычей. Касанием не бьёт. bp: n, flee, mul, rng */
function bzGem(e,R){let b=null,bd=R*R;for(const g of G.gems){if(g.mag)continue;const d=(g.x-e.x)**2+(g.y-e.y)**2;if(d<bd){bd=d;b=g;}}return b;}
BEH.thief={on(e){e.bp=bzP(e,{n:4,flee:1.35,mul:2,rng:420});e.dmg=0;e.loot=0;e.ln=0;e.bs=0;e.bt=0;},
  step(e,dt){const P=e.bp;
    if(e.bs===1){const [dx,dy,d]=bzD(e);bzMv(e,-dx/d,-dy/d,bzSp(e)*P.flee,dt,1);if(d>VIEW.R*1.6){e.dead=true;}return true;}
    e.bt-=dt;if(e.bt<=0||!e.g||e.g.mag){e.bt=.4;e.g=bzGem(e,P.rng);}
    if(e.g){const g=e.g,mx=g.x-e.x,my=g.y-e.y,m=Math.hypot(mx,my)||1;
      if(m<10+e.r*.6){const i=G.gems.indexOf(g);if(i>=0){G.gems.splice(i,1);e.loot+=g.v;e.ln++;}e.g=null;if(e.ln>=P.n)e.bs=1;return true;}
      return bzMv(e,mx/m,my/m,bzSp(e)*1.2,dt);}
    if(e.loot>0){e.bs=1;return true;}
    return bzKeep(e,dt,140,220);},
  die(e){if(e.loot>0){dropGem(e.x,e.y,e.loot*e.bp.mul);spark(e.x,e.y,'#ffe07a',8);}},
  warn(e,c){if(e.loot>0){c.fillStyle='#ffd84a';c.strokeStyle='#6a4a10';c.lineWidth=1.5;c.beginPath();c.arc(e.x+e.r*.6,e.y-e.r*.9,4+Math.min(4,e.ln),0,TAU);c.fill();c.stroke();}}};
/* revive — подъёмыш: падает и через t сек. встаёт с hp доли здоровья, если не добить лежащего (лежачий — low здоровья, не бьёт). Один раз. bp: t, hp, low */
BEH.revive={on(e){e.bp=bzP(e,{t:3,hp:.5,low:.3});},
  die(e){if(e.rv||e.boss||e.mini||e.elite||e.dc)return;if(bzRoom()<=0)return;const x=e.x,y=e.y,t=e.type,mx=e.max,dm=e.dmg,xp=e.xp,sc=e.sc,r=e.r;
    later(0,()=>{if(bzRoom()<=0)return;const k=bzKid(t,x,y);const P=k.bp;k.rv=1;k.bs=1;k.bt=P.t;k.sc=sc;k.r=r;k.hp=k.max=mx*P.low;k.dmg0=dm;k.dmg=0;k.xp=0;k.mxUp=mx*P.hp;k.xpUp=xp*.5;});},
  step(e,dt){if(e.bs===1){e.bt-=dt;if(e.bt<=0){e.bs=0;e.max=e.mxUp;e.hp=e.mxUp;e.dmg=e.dmg0;e.xp=e.xpUp;burst(e.x,e.y,'#bba0d0',qLow()?4:8,120);}return bzStay(e,dt);}return false;},
  warn(e,c){if(e.bs!==1)return;c.fillStyle='rgba(30,20,40,.35)';c.beginPath();c.ellipse(e.x,e.y+e.r*.7,e.r*1.4,e.r*.5,0,0,TAU);c.fill();
    bzRing(c,e.x,e.y-e.r*1.5,8,'rgba(230,220,255,.9)',e.bt/e.bp.t,3);c.fillStyle='rgba(230,220,255,.9)';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText('z',e.x+e.r*.8,e.y-e.r*1.1-((G.t*.7)%1)*8);}};
/* decoy — морок: раз в cd пускает n копий-обманок (исчезают от удара, не бьют, без награды) и меняется местом с одной; копии живут life сек. bp: n, cd, life */
BEH.decoy={on(e){e.bp=bzP(e,{n:2,cd:9,life:9});e.bc=rand(1,2.5);if(BZ.dc){e.dc=1;e.hp=1e6;e.dmg=0;e.xp=0;e.dl=e.bp.life;}},
  step(e,dt){if(e.dc){e.dl-=dt;if(e.dl<=0){bzPuff(e);e.dead=true;}return false;}
    e.bc-=dt;if(e.bc<=0&&onScreen(e,0)){e.bc=e.bp.cd;const n=Math.min(e.bp.n,bzRoom());if(n>0){const x=e.x,y=e.y,t=e.type;
      later(0,()=>{if(e.dead)return;const ks=[];for(let i=0;i<n;i++){if(bzRoom()<=0)break;const a=rand(0,TAU);BZ.dc=1;let k;try{k=bzKid(t,x+Math.cos(a)*36,y+Math.sin(a)*36);}finally{BZ.dc=0;}k.sc=e.sc;k.r=e.r;k.max=k.hp;ks.push(k);bzPuff(k);}
        bzPuff(e);const s=ks[Math.floor(Math.random()*ks.length)];if(s){const sx=s.x,sy=s.y;s.x=e.x;s.y=e.y;e.x=sx;e.y=sy;}});}}
    return false;},
  hit(e,d){if(!e.dc)return d;bzPuff(e);e.dead=true;e.num={t:0,b:G.t,cr:0,v:0};return 0;}}; /* «num» — пустышка: цифра «0» не рисуется */
/* wind — вихрь: целится полосой ≥0,8 с, потом dur сек. дует по ней — богатыря сносит (f — доля его скорости; против ветра идти можно). bp: cd, warn, dur, f, rng, w */
BEH.wind={on(e){e.bp=bzP(e,{cd:5.5,warn:1,dur:1.8,f:.6,rng:340,w:70});e.bc=rand(2,e.bp.cd);e.bs=0;},
  step(e,dt){const P=e.bp;if(e.bs===1){if(!e.bz||e.bz.dead)e.bs=0;else return bzStay(e,dt);}e.bc-=dt;const [dx,dy,d]=bzD(e);
    if(e.bc<=0&&d<P.rng){e.bc=P.cd*rand(.9,1.2);const l=P.rng+80,ux=dx/d,uy=dy/d;
      const z=bzZ({k:'wind',x:e.x,y:e.y,x2:e.x+ux*l,y2:e.y+uy*l,r:P.w,t:Math.max(.8,P.warn),life:P.dur,own:e,cancel:1,dx:ux,dy:uy,f:P.f,on:bzWind});if(z){e.bs=1;e.bz=z;return bzStay(e,dt);}}
    return bzKeep(e,dt,200,270);}};
/* march — строй: шеренга (n) встаёт с полосой ≥0,8 с и идёт прямо через поле (через место героя), к герою не сворачивает; щит спереди ×k; ушла далеко — пропадает. bp: n, gap (×r), k, warn, len */
function bzMarch(e){if(e.dead)return;const P=e.bp,[dx,dy,d]=bzD(e),ux=dx/d,uy=dy/d,px=-uy,py=ux,n=1+Math.min(P.n-1,bzRoom()),g=e.r*P.gap,w=Math.max(.8,P.warn);
  const set=k=>{k.mdx=ux;k.mdy=uy;k.mw=w;k.mgo=0;k.face=ux<0?-1:1;};set(e);
  for(let i=1;i<n;i++){const o=(i%2?1:-1)*Math.ceil(i/2)*g;const k=bzKid(e.type,e.x+px*o,e.y+py*o);set(k);}
  const l=Math.min(P.len,d*2+300),hw=(Math.ceil((n-1)/2)*g)+e.r+6;
  bzZ({k:'march',x:e.x+ux*e.r,y:e.y+uy*e.r,x2:e.x+ux*l,y2:e.y+uy*l,r:hw,t:w,c:'#ffaa30'});}
BEH.march={on(e){e.bp=bzP(e,{n:5,gap:2.4,k:.25,warn:1.2,len:1500});if(!BZ.kid){const x=e;later(0,()=>bzMarch(x));}},
  step(e,dt){if(e.mdx==null)return bzStay(e,dt);if(e.mw>0){e.mw-=dt;return bzStay(e,dt);}const s=bzSp(e);bzMv(e,e.mdx,e.mdy,s,dt,1);e.mgo+=s*dt;
    if(e.mgo>e.bp.len&&!onScreen(e,120))e.dead=true;return true;},
  hit(e,d){if(e.stun>0||e.mdx==null)return d;const H=G.hero;return (H.x-e.x)*e.mdx+(H.y-e.y)*e.mdy>0?d*e.bp.k:d;},
  warn(e,c){if(e.mdx!=null)bzShieldDraw(e,c,'#e0c070',Math.atan2(e.mdy,e.mdx));}};

/* ---------- особенности вожаков AFX (поверх любого вида; c — цвет рамки у ног) ---------- */
function afxBase(e){if(!e.beh)e.beh='_afx';}
AFX.fast={t:{ru:'Вожак-скороход!',en:'Swift Elite!'},c:'#5fd8ff',on(e){afxBase(e);e.spd*=1.45;}}; // i18n:ru — перевод в t.en
AFX.tough={t:{ru:'Вожак-крепыш!',en:'Tough Elite!'},c:'#c9a46a',on(e){afxBase(e);e.hp*=1.7;e.sc*=1.12;e.r*=1.12;}}; // i18n:ru — перевод в t.en
AFX.shield={t:{ru:'Вожак-щитоносец!',en:'Shield Elite!'},c:'#9fb6d6',on(e){afxBase(e);e.sa=bzAng(e);},step(e,dt){bzTurn(e,dt,1.2);}, // i18n:ru — перевод в t.en
  hit(e,d){return e.stun>0||!bzFront(e,1.1)?d:d*.3;}};
AFX.bomb={t:{ru:'Вожак-взрывник!',en:'Bomber Elite!'},c:'#ff7a3a',on(e){afxBase(e);}, // i18n:ru — перевод в t.en
  die(e){bzZ({k:'bomb',x:e.x,y:e.y,r:110,t:1,fn:bzBoom,dmg:e.dmg*1.6,src:e.type,c:'#ff5a1a'});}};
AFX.summon={t:{ru:'Вожак-зазывала!',en:'Summoner Elite!'},c:'#b07aff',on(e){afxBase(e);e.afS=4;}, // i18n:ru — перевод в t.en
  step(e,dt){e.afS-=dt;if(e.afS>0||!onScreen(e,0))return;e.afS=7;const n=Math.min(3,bzRoom()),t=bzMin(e),x=e.x,y=e.y;
    later(0,()=>{for(let i=0;i<n;i++){if(bzRoom()<=0)break;const a=i/n*TAU+rand(0,1),k=bzKid(t,x+Math.cos(a)*60,y+Math.sin(a)*60);k.xp*=.5;burst(k.x,k.y,'#b07aff',qLow()?3:6,80);}});}};
AFX.heal={t:{ru:'Вожак-ворожей!',en:'Healer Elite!'},c:'#6aff8a',on(e){afxBase(e);e.afH=3;}, // i18n:ru — перевод в t.en
  step(e,dt){e.hp=Math.min(e.max,e.hp+e.max*.012*dt);e.afH-=dt;if(e.afH>0)return;e.afH=5;
    forNear(e.x,e.y,150,o=>{if(o!==e&&!o.boss&&!o.prop&&!o.dc)o.hp=Math.min(o.max,o.hp+o.max*.2);});if(onScreen(e,0))G.fx.push({k:'wave',x:e.x,y:e.y,t:0,dur:.5,r1:150,col:'#6aff8a'});}};
AFX.frost={t:{ru:'Вожак-морозник!',en:'Frost Elite!'},c:'#bfeaff',on(e){afxBase(e);}, // i18n:ru — перевод в t.en
  step(e){const H=G.hero,r=e.r+70;if((H.x-e.x)**2+(H.y-e.y)**2<r*r)H.slowT=Math.max(H.slowT||0,.3);}};
AFX.vamp={t:{ru:'Вожак-кровопийца!',en:'Vampire Elite!'},c:'#e0304a',on(e){afxBase(e);e.vT=0;}, // i18n:ru — перевод в t.en
  step(e,dt){e.vT-=dt;const H=G.hero,r=e.r+13;if(e.vT<=0&&H.hurtT>.15&&(H.x-e.x)**2+(H.y-e.y)**2<r*r){e.vT=.6;e.hp=Math.min(e.max,e.hp+e.max*.08);spark(e.x,e.y-e.r,'#ff4a6a',5);}}};
AFX.aura={t:{ru:'Вожак стаи!',en:'Pack Leader!'},c:'#ffd25a',on(e){afxBase(e);e.afA=0;}, /* стая рядом (160) быстрее ×1,3 */ // i18n:ru — перевод в t.en
  step(e,dt){e.afA-=dt;if(e.afA>0)return;e.afA=.25;const P={spd:1.3,reg:0};forNear(e.x,e.y,160,o=>{if(o!==e&&!o.boss&&!o.prop&&!o.dc&&(o.x-e.x)**2+(o.y-e.y)**2<25600)bzBuff(o,P);});}};
/* рамка вожака рисуется из warn любой повадки (и у вожака без повадки — через BEH._afx) */
for(const k in BEH){const b=BEH[k],w=b.warn;b.warn=w?function(e,c){w(e,c);if(e.afx)afxDraw(e,c);}:function(e,c){if(e.afx)afxDraw(e,c);};}
