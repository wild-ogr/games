'use strict';
/* OB:MGC (08.10) — мини-игра №6 «Ловля летучей нечисти» (id 'lovlya'). Набор — js/mg-ckit.js.
   Закат над житницей. Нетопыри, вороны, огоньки, призраки, Сирин и (редко) Жар-птица летают поперёк неба.
   Касание — воевода бросает сеть: она летит ~0,4 с и раскрывается кругом там, куда коснулся (ловишь с упреждением).
   Несколько в одну сеть — множитель. Голубей не лови (птица мирная, −очки). Сетей — запас (ролик «Ещё сети» +4). 45 с. */

art('mgc_dove',40,g=>{ell(g,6,-1,13,6,'#e8eef8',{rot:-.4,lw:1});ell(g,-4,4,14,9,'#ffffff',{lw:1.1});ell(g,-14,2,6,4,'#d8e0ee',{rot:.5,lw:.9});
  ell(g,9,-6,6.5,6,'#ffffff',{lw:1});poly(g,[15,-6,20,-4.5,15,-3.5],'#f0a040',{lw:.8});g.fillStyle='#222';g.beginPath();g.arc(11,-7,1.3,0,TAU);g.fill();
  ell(g,-1,-6,10,4.5,'#f4f6fc',{rot:-.9,lw:.9});});
art('mgc_net',40,g=>{g.strokeStyle='#7a5a2a';g.lineWidth=2.4;g.beginPath();g.arc(0,0,15,0,TAU);g.stroke();g.lineWidth=1.3;g.strokeStyle='#c9a36a';
  for(let i=0;i<8;i++){const a=i*TAU/8;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*15,Math.sin(a)*15);g.stroke();}for(const r of[5,10]){g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();}
  for(let i=0;i<8;i++){const a=i*TAU/8+.4;ell(g,Math.cos(a)*16,Math.sin(a)*16,2.2,2.2,'#8a8a96',{lw:.6});}});

const LV_T={bat:{sz:54,pts:10,sp:1},voron:{sz:54,pts:10,sp:1.1},ogon:{sz:46,pts:15,sp:.9,wav:1},prizr:{sz:58,pts:20,sp:.8,ghost:1},
  vihr_sirin:{sz:64,pts:25,sp:1},bird:{sz:66,pts:60,sp:1.55,rare:1},mgc_dove:{sz:46,pts:-15,sp:.95,dove:1}};
function lvPool(st){const L=st.lvl,p=['bat','bat','voron','bat','voron'];if(L>=2)p.push('ogon');if(L>=4)p.push('prizr','ogon');if(L>=6)p.push('vihr_sirin');if(st.skin==='hw')p.push('bat','prizr');return p;}

const MG_LOVLYA={id:'lovlya',adKind:'more',hudIcon:'trf_feather',barCol:['#ffcf4a','#ff7a3a'],
  dur:o=>45,
  title:()=>Lg('Ловля летучей нечисти','Catch the Flyers'),
  rules:()=>[['mgc_net',mgkPC()?Lg('Щёлкни мышкой по небу — воевода бросит туда сеть.','Click the sky — the commander throws a net there.'):Lg('Коснись неба — воевода бросит туда сеть.','Tap the sky — the commander throws a net there.')],
    ['bat',Lg('Сеть летит не сразу: целься чуть впереди нечисти.','The net is slow: aim a bit ahead of the flyer.')],
    ['vihr_sirin',Lg('Двое-трое в одной сети — очки умножаются!','Two or three in one net — points multiply!')],
    ['mgc_dove',Lg('Голубей не лови — птица мирная.','Don\'t catch doves — they are friends.')]],
  adLabel:()=>Lg('Ещё 4 сети — за рекламу','4 more nets — watch an ad'),adDone:()=>Lg('+4 сети!','+4 nets!'),
  endTitle:()=>Lg('Улов собран!','Nice catch!'),
  endLine:st=>st.got?Lg('Поймано: ','Caught: ')+st.got+(st.dbl?Lg(' · двойных сетей: ',' · multi-nets: ')+st.dbl:''):'',
  tiers:o=>{const c=o.calm?.85:1,L=Math.min(10,o.lvl|0);return [Math.round((280+12*L)*c),Math.round((520+8*L)*c),Math.round((850+30*L)*c)];},
  extra:st=>({got:st.got|0,dbl:st.dbl|0,dove:st.dove|0}),
  onAd(st){st.nets+=4;st.netAd=1;},
  init(st,keep){const W=st.W,H=st.H;st.sk=st.k*(W>H*1.2?Math.min(1.45,H/W*2.6):1);const k=st.sk;st.gy=H*(W>H?.74:.76);st.skyT=Math.max(80*k,H*.12);st.skyB=st.gy-H*.16;
    st.lx=Math.max(56*k,W*.13);st.ly=H-52*k;st.bx=st.lx+64*k;st.by=H-30*k;st.R=(st.calm?64:54)*k;
    if(!keep){st.fl=[];st.nt=[];st.got=0;st.dbl=0;st.dove=0;st.spawnT=.3;st.cd=0;st.nets=(st.calm?18:15)+(st.netAd?4:0);st.bump=0;st.aim=null;st.wave=0;}
    else{for(const f of st.fl){f.y0=st.skyT+f.fy*(st.skyB-st.skyT);}}
    st.bg=null;},
  onStart(st){st.fl=[];st.nt=[];st.got=0;st.dbl=0;st.dove=0;st.spawnT=.3;st.cd=0;st.nets=(st.calm?18:15)+(st.netAd?4:0);},
  down(st,x,y){lvThrow(st,x,y);},
  cursor:()=>'crosshair',
  step(st,dt){lvStep(st,dt);},
  idle(st,dt){lvAmb(st,dt);},
  bot(st,dt,sk){lvBot(st,dt,sk);},
  draw(st,g,UI){lvDraw(st,g,UI);}};
/* путь летуна — чистая функция времени (бот предсказывает по ней же) */
function lvPos(st,f,t){const a=t-f.t0;let te=a,ox=0,oy=0;if(f.lt!=null&&a>f.lt){const q=Math.min(a-f.lt,1.3);te=a-q;const ang=q/1.3*TAU;ox=Math.sin(ang)*f.lr*f.dir;oy=-(1-Math.cos(ang))*f.lr;}
  const x=f.x0+f.vx*te+ox,y=f.y0+Math.sin(te*f.fq+f.ph)*f.amp+oy+(f.wav?Math.sin(te*5.3)*8*st.k:0);return [x,y];}
function lvSpawn(st,key,y0,dx){const W=st.W,k=st.k,T=LV_T[key],dir=st.rnd()<.5?1:-1,tw=(st.calm?7:6.2)-Math.min(1.6,st.lvl*.12)-st.t*.015,v=W/Math.max(3.8,tw)/1*T.sp;
  const fy=y0!=null?y0:st.rnd();st.fl.push({key,T,dir,t0:st.t,x0:dir>0?-40*k-(dx||0):W+40*k+(dx||0),y0:st.skyT+fy*(st.skyB-st.skyT),fy,vx:v*dir,amp:(10+st.rnd()*22)*k,fq:1.4+st.rnd()*1.4,ph:st.rnd()*TAU,
    lt:st.rnd()<.35?1+st.rnd()*2:null,lr:(26+st.rnd()*14)*k,wav:T.wav,x:0,y:0,st:'fly',ct:0,flap:st.rnd()*TAU});}
function lvStep(st,dt){lvAmb(st,dt);const k=st.k;st.cd=Math.max(0,st.cd-dt);
  st.spawnT-=dt;if(st.spawnT<=0&&st.t<st.dur-1.5){const r=st.rnd(),pool=lvPool(st);
    if(r<.15)lvSpawn(st,'mgc_dove');else if(r<.15+(st.lvl>=3?.04:.02)&&!st.fl.some(f=>f.T.rare))lvSpawn(st,'bird');
    else if(r<.42){const key=pool[(st.rnd()*pool.length)|0],fy=st.rnd()*.8,n=2+(st.rnd()<.3+st.lvl*.03?1:0);for(let i=0;i<n;i++)lvSpawn(st,key,Math.min(1,fy+i*.07),i*34*k);
      if(st.rnd()<.25+st.lvl*.03)lvSpawn(st,'mgc_dove',Math.min(1,fy+.04),70*k);}
    else lvSpawn(st,pool[(st.rnd()*pool.length)|0]);
    st.spawnT=Math.max(.75,1.25-st.lvl*.05)*(st.calm?1.3:1)*(.7+st.rnd()*.6)*Math.max(.7,Math.min(1,1.25*st.H/st.W));}
  for(const f of st.fl){if(f.st==='fly'){const p=lvPos(st,f,st.t);f.x=p[0];f.y=p[1];if((f.dir>0&&f.x>st.W+80*k)||(f.dir<0&&f.x<-80*k))f.st='gone';}}
  // сети
  for(const n of st.nt){n.t+=dt;
    if(n.ph==='fly'&&n.t>=n.fly){n.ph='open';n.ot=0;}
    if(n.ph==='open'){n.ot+=dt;if(n.ot<=.2)lvCatch(st,n);if(n.ot>=.38){if(n.got.length){n.ph='bag';n.bt=0;lvScore(st,n);}else{n.ph='miss';n.mt=0;st.combo=0;if(st.live)mgkSnd('click');}}}
    if(n.ph==='bag'){n.bt+=dt;if(n.bt>=.75&&!n.land){n.land=1;st.bump=1;mgkSparks(st,st.bx,st.by-24*k,st.calm?4:10,'#ffe27a',140,{gr:200,a0:-Math.PI/2,spr:2});if(st.live)mgkSnd('coin');}}
    if(n.ph==='miss')n.mt+=dt;}
  st.nt=st.nt.filter(n=>!((n.ph==='bag'&&n.bt>1.05)||(n.ph==='miss'&&n.mt>.6)));
  st.fl=st.fl.filter(f=>f.st!=='gone');
  if(st.nets<=0&&!st.nt.length&&!st.over){st.overT=(st.overT||0)+dt;if(st.overT>.6)st.over=true;}}
function lvAmb(st,dt){st.bump=Math.max(0,st.bump-dt*3);for(const f of st.fl)f.flap+=dt*(f.T.dove?11:14);
  if(st.live){st.cl=st.cl||[];if(!st.cl.length)for(let i=0;i<5;i++)st.cl.push({x:st.fr()*st.W,y:st.H*(.06+st.fr()*.3),s:(.6+st.fr()*.7),v:4+st.fr()*8});for(const c of st.cl){c.x+=c.v*dt*st.k;if(c.x>st.W+120*st.k)c.x=-120*st.k;}}}
function lvThrow(st,x,y){const k=st.k;if(st.cd>0||st.nets<=0)return false;if(y>st.gy+10*k)y=st.gy;st.nets--;st.cd=st.calm?.4:.5;
  const d=Math.hypot(x-st.lx,y-st.ly),fly=(st.calm?.36:.42)*Math.min(1.15,.75+d/(700*k));st.nt.push({sx:st.lx,sy:st.ly-30*k,tx:x,ty:y,t:0,fly,ph:'fly',got:[],spin:st.fr()*TAU});
  st.aim={x,y,t:0};if(st.live){mgkNoise(.18,.06,900,1.2);}return true;}
function lvCatch(st,n){const R=st.R*Math.min(1,.4+n.ot/.12*.6);for(const f of st.fl){if(f.st!=='fly')continue;const sz=f.T.sz*st.sk;if(Math.hypot(f.x-n.tx,f.y-n.ty)<R+sz*.28){f.st='net';n.got.push(f);}}}
function lvScore(st,n){const k=st.k,good=n.got.filter(f=>!f.T.dove),dv=n.got.filter(f=>f.T.dove);
  if(dv.length){st.dove+=dv.length;st.score=Math.max(0,st.score-15*dv.length);st.combo=0;mgkNum(st,n.tx,n.ty-30*k,'−'+15*dv.length,'#ff9a8a');st.ev.push({t:st.t,s:Lg('Голубя не трогай!','Leave the doves!'),x:n.tx,y:n.ty});
    for(const f of dv){f.st='fly';f.t0=st.t;f.x0=f.x;f.y0=f.y;f.lt=null;f.vx=Math.abs(f.vx)*1.6*(f.x<st.W/2?-1:1);f.dir=f.vx>0?1:-1;mgkSparks(st,f.x,f.y,6,'#ffffff',110,{gr:60,s:2.4});}
    n.got=good;if(st.live)mgkSnd('leak');}
  if(!good.length){n.ph='miss';n.mt=0;return;}
  let sum=0;for(const f of good)sum+=f.T.pts;const mul=good.length,cb=1+Math.min(st.combo,10)*.1,add=Math.round(sum*mul*cb);st.combo++;st.best=Math.max(st.best,st.combo);st.got+=good.length;if(good.length>1)st.dbl++;
  st.score+=add;mgkNum(st,n.tx,n.ty-36*k,'+'+add+(mul>1?' ×'+mul:''),good.some(f=>f.T.rare)?'#ffcf3a':'#fff2a8',mul>1||good.some(f=>f.T.rare));
  mgkSparks(st,n.tx,n.ty,st.calm?5:12,mul>1?'#ffcf3a':'#fff2a8',170,{gr:160});if(mul>1)mgkPuff(st,n.tx,n.ty,40*k);
  if(st.live){mgkSnd(mul>1?'up':'kill');if(good.some(f=>f.T.rare))mgkSnd('star',2);}
  for(const f of good)f.st='bag';}
/* бот: предсказывает, где будет нечисть, когда сеть раскроется; хороший ищет скопления и обходит голубей */
function lvBot(st,dt,sk){const P={good:{re:.3,err:6,lead:1,dove:1,clu:1,min:.9,need:2,pace:2.4},avg:{re:.8,err:26,lead:.75,dove:.7,clu:.5,min:.6,need:1,pace:0},bad:{re:1.4,err:46,lead:.25,dove:.3,clu:0,min:.3,need:1,pace:0}}[sk]||{};
  st.bw=(st.bw||0)-dt;if(st.bw>0||st.cd>0||st.nets<=0)return;st.bw=P.re*(.7+st.rnd()*.6);
  const k=st.k,fly=(st.calm?.36:.42)*.95,cand=[];
  for(const f of st.fl){if(f.st!=='fly'||f.T.dove)continue;const p=lvPos(st,f,st.t+fly*P.lead+.05),q=lvPos(st,f,st.t+fly+.05);if(p[0]<10||p[0]>st.W-10||p[1]>st.gy)continue;cand.push({p,f,q});}
  if(!cand.length)return;let best=null,bv=-1e9;
  for(const c of cand){let v=c.f.T.pts,n=1;if(P.clu)for(const o of st.fl){if(o===c.f||o.st!=='fly')continue;const q=lvPos(st,o,st.t+fly+.05),d=Math.hypot(q[0]-c.p[0],q[1]-c.p[1]);if(d<st.R*.8){if(o.T.dove)v-=40*P.dove;else{v+=o.T.pts*P.clu;n++;}}}
    v*=n;c.n=n;if(v>bv){bv=v;best=c;}}
  if(best&&P.pace&&st.dur-st.t>st.nets*P.pace&&best.n<P.need&&best.f.T.pts<25)return;
  if(!best||(st.nets<6&&bv<20*P.min&&st.t<st.dur-6))return;
  lvThrow(st,best.p[0]+(st.rnd()-.5)*2*P.err*k,best.p[1]+(st.rnd()-.5)*2*P.err*k);}

/* ---- рисование ---- */
function lvPal(st){return st.skin==='hw'?{s:['#1e0f3a','#5a2a6a','#c8506a','#ff9a4a'],sun:'#ff7a2a',h1:'#4a2a5a',h2:'#2a3a2a',gr:['#3a5a2a','#24361a']}
  :st.skin==='ny'?{s:['#1a2a5a','#4a5a9a','#c890b0','#ffd0a0'],sun:'#ffc080',h1:'#8a9ac8',h2:'#c8d8ee',gr:['#eef4fc','#c8d6ea']}
  :{s:['#2a3a7a','#7a5a9a','#e88a7a','#ffd08a'],sun:'#ffe08a',h1:'#6a6aa0',h2:'#4a7a3a',gr:['#6aa040','#4a7a2a']};}
function lvBg(st,dpr){const W=st.W,H=st.H,k=st.sk,P=lvPal(st),c=mkCanvas(W*dpr,H*dpr),g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const r=mgkRnd((st.o.seed||1)^0x9e37),hz=st.gy-H*.05;
  let gr=g.createLinearGradient(0,0,0,hz);gr.addColorStop(0,P.s[0]);gr.addColorStop(.45,P.s[1]);gr.addColorStop(.8,P.s[2]);gr.addColorStop(1,P.s[3]);g.fillStyle=gr;g.fillRect(0,0,W,hz+4);
  for(let i=0;i<40;i++){const x=r()*W,y=r()*hz*.35;g.fillStyle='rgba(255,255,255,'+(.15+r()*.4)*(1-y/(hz*.35))+')';g.beginPath();g.arc(x,y,.6+r()*1.1,0,TAU);g.fill();}
  // солнце на закате
  const sx=W*(W>H?.68:.66),sy=hz-6*k,sr=46*k;g.save();g.globalAlpha=.8;g.drawImage(glowSpr(P.sun),sx-sr*4,sy-sr*4,sr*8,sr*8);g.restore();
  gr=g.createRadialGradient(sx,sy-sr*.3,sr*.1,sx,sy,sr);gr.addColorStop(0,'#fffbe8');gr.addColorStop(1,P.sun);g.fillStyle=gr;g.beginPath();g.arc(sx,sy,sr,0,TAU);g.fill();
  // дальние холмы
  for(const [y,amp,col,f] of[[hz-24*k,22*k,P.h1,.006],[hz-6*k,16*k,shade(P.h1,-.15),.011]]){g.fillStyle=col;g.beginPath();g.moveTo(0,H);for(let x=0;x<=W+10;x+=8)g.lineTo(x,y-Math.sin(x*f+y)*amp-Math.sin(x*f*2.7)*amp*.4);g.lineTo(W,H);g.closePath();g.fill();}
  // лес на холме
  g.fillStyle=shade(P.h2,-.35);for(let x=-10;x<W;x+=(10+r()*12)*k){const h=(18+r()*16)*k,y=hz+2*k;g.beginPath();g.moveTo(x,y);g.lineTo(x+7*k,y-h);g.lineTo(x+14*k,y);g.fill();}
  // земля
  gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,P.h2);gr.addColorStop(.3,P.gr[0]);gr.addColorStop(1,P.gr[1]);g.fillStyle=gr;g.beginPath();g.moveTo(0,hz+6*k);g.quadraticCurveTo(W*.5,hz-8*k,W,hz+6*k);g.lineTo(W,H);g.lineTo(0,H);g.fill();
  // тёплый свет заката по земле
  g.save();g.globalAlpha=.25;g.drawImage(glowSpr(P.sun),sx-W*.5,hz-40*k,W,140*k);g.restore();
  // дорожка
  g.fillStyle=st.skin==='ny'?'rgba(170,180,200,.5)':'rgba(214,180,120,.7)';g.beginPath();g.moveTo(W*.46,hz+10*k);g.quadraticCurveTo(W*.4,H*.9,W*.28,H+4);g.lineTo(W*.62,H+4);g.quadraticCurveTo(W*.56,H*.9,W*.54,hz+10*k);g.fill();
  // избы и житница
  const houses=W>H*1.2?[['b_herb',.06,.62],['b_range',.17,.55],['b_smith',.3,.72],['b_vil',.39,.6],['b_mint',.66,.72],['b_wall',.76,.55],['b_fair',.86,.66],['b_siege',.95,.55]]:[['b_herb',.08,.62],['b_smith',.3,.7],['b_mint',.74,.7],['b_fair',.93,.62]];
  for(const [key,fx,s] of houses){const x=W*fx,y=st.gy-6*k;artPut(g,key,x,y-34*k*s,70*k*s,dpr);}
  const bw=Math.min(170*k,W*.36);artPut(g,'b_barn',W*.5,st.gy-bw*.32,bw,dpr);
  if(st.skin==='ny'){g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(W*.5,st.gy-bw*.62,bw*.44,bw*.07,0,0,TAU);g.fill();}
  // снопы и забор
  for(const fx of(W>H*1.2?[.08,.2,.36,.62,.8,.92]:[.18,.84,.62,.38])){const x=W*fx,y=st.gy+(fx>.5?26:30)*k;lvSheaf(g,x,y,k*(st.skin==='ny'?.8:1),st.skin==='ny');}
  g.strokeStyle='#6e431f';g.lineWidth=3*k;for(const sgn of[0,1]){const x0=sgn?W*.62:0,x1=sgn?W:W*.38,y=st.gy+6*k;g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.moveTo(x0,y+10*k);g.lineTo(x1,y+10*k);g.stroke();
    for(let x=x0+8*k;x<x1;x+=22*k){g.fillStyle='#8a5628';g.fillRect(x-2.5*k,y-10*k,5*k,24*k);}}
  // трава
  for(let i=0;i<Math.round(W/5);i++){const x=r()*W,y=st.gy+16*k+r()*(H-st.gy);g.strokeStyle=st.skin==='ny'?'rgba(255,255,255,.5)':'rgba(40,90,20,'+(.3+r()*.3)+')';g.lineWidth=1.3*k;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+2*k,y-5*k,x+4*k,y-9*k);g.stroke();}
  return c;}
function lvCloud(st){if(st.cimg)return st.cimg;const b=fxCloud(),c=mkCanvas(b.width,b.height),g=c.getContext('2d');g.drawImage(b,0,0);g.globalCompositeOperation='source-atop';
  const P=st.skin==='hw'?['#c8a0d8','#6a3a7a']:st.skin==='ny'?['#ffffff','#b8c0e0']:['#fff0e8','#e88a9a'];const gr=g.createLinearGradient(0,0,0,c.height);gr.addColorStop(0,P[0]);gr.addColorStop(1,P[1]);g.globalAlpha=.75;g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);return st.cimg=c;}
function lvSheaf(g,x,y,k,snow){g.save();g.translate(x,y);g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,2*k,16*k,4*k,0,0,TAU);g.fill();
  for(let i=-5;i<=5;i++){g.strokeStyle=i%2?'#e8b850':'#c8902a';g.lineWidth=2.4*k;g.beginPath();g.moveTo(i*1.6*k,0);g.lineTo(i*3.6*k,-30*k);g.stroke();}
  g.fillStyle='#a86a20';g.fillRect(-9*k,-16*k,18*k,4*k);if(snow){g.fillStyle='#fff';g.beginPath();g.ellipse(0,-30*k,16*k,5*k,0,0,TAU);g.fill();}g.restore();}
function lvNetMesh(g,x,y,r,a,spin,k){g.save();g.translate(x,y);g.rotate(spin);g.globalAlpha*=a;g.lineCap='round';
  g.strokeStyle='rgba(60,36,10,.55)';g.lineWidth=3.2*k;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
  g.strokeStyle='#e8d3a0';g.lineWidth=1.5*k;for(let i=0;i<12;i++){const an=i*TAU/12;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(an)*r,Math.sin(an)*r);g.stroke();}
  for(const q of[.33,.66]){g.beginPath();for(let i=0;i<=12;i++){const an=i*TAU/12;g.lineTo(Math.cos(an)*r*q,Math.sin(an)*r*q);}g.stroke();}
  g.strokeStyle='#c9a36a';g.lineWidth=2.6*k;g.beginPath();for(let i=0;i<=12;i++){const an=i*TAU/12;g.lineTo(Math.cos(an)*r,Math.sin(an)*r);}g.stroke();
  g.fillStyle='#8a8a96';for(let i=0;i<12;i++){const an=i*TAU/12;g.beginPath();g.arc(Math.cos(an)*r,Math.sin(an)*r,2.6*k,0,TAU);g.fill();}g.restore();}
function lvFlyer(st,g,f,x,y,s,o){const sz=f.T.sz*st.sk*s,flap=Math.sin(f.flap),sy=1+flap*.09,a=f.T.ghost?.55+.35*Math.sin(st.t*2+f.ph):1;
  if(f.T.rare){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(glowSpr('#ffb030'),x-sz,y-sz,sz*2,sz*2);g.restore();}
  if(f.key==='ogon'){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(glowSpr('#8ad8ff'),x-sz*.8,y-sz*.8,sz*1.6,sz*1.6);g.restore();}
  mgkPut(g,f.key,x,y,sz,Object.assign({fx:f.key==='mgc_dove'?f.dir:-f.dir*(f.key==='voron'||f.key==='bird'?-1:1),sy,sx:1-flap*.04,a},o||{}));}
function lvDraw(st,g,UI){const W=st.W,H=st.H,k=st.sk,dpr=MGCK.dpr||1;if(!st.bg)st.bg=lvBg(st,dpr);g.drawImage(st.bg,0,0,W,H);
  // облака
  if(st.cl){const im=lvCloud(st);for(const c of st.cl){const w=110*k*c.s;g.globalAlpha=st.skin==='hw'?.45:.8;g.drawImage(im,c.x-w/2,c.y-w*.4,w,w*.75);}g.globalAlpha=1;}
  // летуны
  for(const f of st.fl){if(f.st!=='fly')continue;lvFlyer(st,g,f,f.x,f.y,1);
    if(f.T.rare&&!st.calm&&Math.random()<.4)mgkPart(st,{x:f.x-f.dir*20*k,y:f.y,vx:-f.dir*30,vy:20,dur:.6,s:2,col:'#ffcf3a',gr:40});}
  // прицел у касания
  if(st.aim){st.aim.t+=1/60;const q=Math.min(1,st.aim.t/.2);g.save();g.globalAlpha=Math.max(0,1-st.aim.t/.7);g.setLineDash([6*k,6*k]);g.strokeStyle='#fff';g.lineWidth=2.2*k;g.beginPath();g.arc(st.aim.x,st.aim.y,st.R*(1.3-q*.3),0,TAU);g.stroke();g.restore();if(st.aim.t>.7)st.aim=null;}
  // сети
  for(const n of st.nt){if(n.ph==='fly'){const q=Math.min(1,n.t/n.fly),x=n.sx+(n.tx-n.sx)*q,y=n.sy+(n.ty-n.sy)*q-Math.sin(q*Math.PI)*60*k;
      g.strokeStyle='rgba(232,211,160,.8)';g.lineWidth=1.4*k;g.beginPath();g.moveTo(n.sx,n.sy);g.quadraticCurveTo((n.sx+x)/2,(n.sy+y)/2-30*k,x,y);g.stroke();
      lvNetMesh(g,x,y,st.R*(.25+q*.2),1,n.spin+n.t*12,k);}
    else if(n.ph==='open'||n.ph==='miss'){const q=n.ph==='open'?mgkBack(Math.min(1,n.ot/.16)):1,a=n.ph==='miss'?Math.max(0,1-n.mt/.6):1,dy=n.ph==='miss'?n.mt*n.mt*160*k:0;lvNetMesh(g,n.tx,n.ty+dy,st.R*q,a,n.spin,k);}
    else if(n.ph==='bag'){const q=Math.min(1,n.bt/.75),e=q*q,x=n.tx+(st.bx-n.tx)*q,y=n.ty+(st.by-30*k-n.ty)*e-Math.sin(q*Math.PI)*50*k*(1-q),s=1-q*.55;
      if(n.bt<.75){const i0=n.got.length;n.got.forEach((f,i)=>lvFlyer(st,g,f,x+(i-(i0-1)/2)*16*k*s,y,s*.85,{rot:st.calm?0:Math.sin(n.bt*14+i)*.4}));lvNetMesh(g,x,y,st.R*.55*s,.95,n.spin+n.bt*6,k);}}}
  // воевода и корзина
  const bmp=st.bump>0?Math.sin(st.bump*Math.PI)*.12:0;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(st.lx,st.ly+28*k,30*k,7*k,0,0,TAU);g.fill();
  const thr=st.nt.length&&st.nt[st.nt.length-1].t<.25?1:0;mgkPut(g,'voevoda',st.lx,st.ly-6*k-thr*4*k,76*k,{rot:thr*-.12});
  lvBasket(g,st.bx,st.by,k,bmp,st.got);
  // запас сетей
  const ny=st.ly-58*k;g.save();mgkPillBox(g,st.lx-34*k,ny-15*k,68*k,30*k);mgkPut(g,'mgc_net',st.lx-16*k,ny,24*k);mgkText(g,String(st.nets),st.lx+12*k,ny+1,18*k,{c:st.nets<=3?'#ffb0a0':'#fff3c4'});g.restore();
  if(st.cd>0){g.save();g.strokeStyle='#ffe27a';g.lineWidth=3*k;g.lineCap='round';g.beginPath();g.arc(st.lx,ny,22*k,-Math.PI/2,-Math.PI/2+TAU*(1-st.cd/(st.calm?.4:.5)));g.stroke();g.restore();}
  st.ev=st.ev.filter(e=>st.t-e.t<1.3);for(const e of st.ev){const q=(st.t-e.t)/1.3;g.globalAlpha=q>.7?1-(q-.7)/.3:1;mgkText(g,e.s,Math.max(100*k,Math.min(W-100*k,e.x)),e.y-60*k-q*20*k,20*k,{c:'#ffd0c0'});}g.globalAlpha=1;
  if(UI.ph==='play'&&st.t<4.5){g.globalAlpha=st.t>3.5?4.5-st.t:1;mgkText(g,Lg('Целься чуть впереди!','Aim a little ahead!'),W/2,st.skyB+40*k,21*k,{c:'#fff3c4'});g.globalAlpha=1;}}
function lvBasket(g,x,y,k,b,n){g.save();g.translate(x,y);g.scale(1+b,1-b);g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,4*k,34*k,7*k,0,0,TAU);g.fill();
  const gr=g.createLinearGradient(0,-30*k,0,0);gr.addColorStop(0,'#d8a050');gr.addColorStop(1,'#8a5a20');g.fillStyle=gr;g.beginPath();g.moveTo(-32*k,-30*k);g.lineTo(32*k,-30*k);g.lineTo(24*k,2*k);g.lineTo(-24*k,2*k);g.closePath();g.fill();
  g.strokeStyle='#5a3410';g.lineWidth=1.6*k;g.stroke();g.strokeStyle='rgba(90,52,16,.6)';g.lineWidth=1.2*k;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(i*9*k,-30*k);g.lineTo(i*7*k,2*k);g.stroke();}
  for(const yy of[-20,-10]){g.beginPath();g.moveTo(-30*k+(yy+30)*.25*k,yy*k);g.lineTo(30*k-(yy+30)*.25*k,yy*k);g.stroke();}
  if(n>0){g.fillStyle='#3a2a4a';g.beginPath();g.ellipse(0,-30*k,30*k,6*k+Math.min(n,12)*.4*k,0,Math.PI,TAU);g.fill();}
  g.fillStyle='#c48a3a';g.beginPath();g.ellipse(0,-30*k,33*k,6*k,0,0,TAU);g.fill();g.strokeStyle='#5a3410';g.lineWidth=2*k;g.stroke();g.restore();}
mgcReg(MG_LOVLYA,{num:6,n:{ru:'Ловля летучей нечисти',en:'Catch the Flyers'},icon:'mgc_net',kind:'score'});
