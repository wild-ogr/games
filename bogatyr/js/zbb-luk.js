'use strict';
/* BGB (08.10) «Забава» №5 «Стрельба из лука по яблоку» (id 'luk').
   Вид из-за плеча: луг за околицей, стога, флажок на шесте. На пне — яблоко; дальше и дальше (20…50 шагов),
   пятая стрела — яблоко на шапке Ивана-дурака (жмурится, коленки трясутся). 5 стрел.
   Управление: зажми (палец/мышь) — тетива натягивается; веди — прицел ходит за пальцем; отпусти — выстрел.
   Ветер — по флажку у цели (и стрелке над ним): прицелься с поправкой. Не дотянул тетиву — стрела ляжет ниже.
   Логика (куда легла стрела, очки) — чистые функции lk*, ими же играет бот (sim). Механика ветра — из «Царь-пушки» Обороны (пер. lk*). */
(function(){
const LK={AR:.12,ARROWS:5,TIERS:[14,28,42],R0:30,DRAW_T:.75,
  // мишени: d — шагов, iv — на шапке Ивана; pts — за яблоко (в яблочко/край), пень/шапка — утешение
  T:[{d:20},{d:30},{d:40},{d:50},{d:35,iv:1}],MORE:[{d:30},{d:45},{d:40,iv:1}],
  P:{bull:10,edge:6,stump:2,ivBull:15,ivEdge:9,cap:3}};
/* ветер на каждую стрелу (−1…1, не слабее 0,25 по модулю), по зерну дня */
function lkWind(seed){const r=zbbK.rng(seed*31+5),w=[];for(let i=0;i<9;i++){let v=r()*2-1;if(Math.abs(v)<.25)v=v<0?-.3:.3;w.push(+v.toFixed(2));}return w;}
function lkWindK(o){const lv=Math.max(0,Math.min(12,(o&&o.lvl)|0));return (1+lv*.04)*((o&&o.calm)?.6:1);}
// снос ветром и провис — в «радиусах яблока» (rx вправо, ry вниз)
function lkDrift(t,w,wk){return w*wk*(1.1+t.d/22);}
function lkDrop(draw){const q=Math.max(0,1-draw);return Math.pow(q,1.4)*9;}
/* куда легла стрела: aim — точка прицела (в радиусах от центра яблока), draw 0…1, sway — дрожь → {x,y,k:'bull'|'edge'|'stump'|'cap'|'miss',pts} */
function lkHit(t,aim,draw,w,wk,sway){const x=aim.x+lkDrift(t,w,wk)+sway.x,y=aim.y+lkDrop(draw)+sway.y,d=Math.hypot(x,y);let k='miss',pts=0;
  if(d<=.5){k='bull';pts=t.iv?LK.P.ivBull:LK.P.bull;}else if(d<=1.15){k='edge';pts=t.iv?LK.P.ivEdge:LK.P.edge;}
  else if(t.iv){if(y>.95&&y<3.7&&Math.abs(x)<2.1){k='cap';pts=LK.P.cap;}else if(y>=3.7&&y<17&&Math.abs(x)<3.8)k='ivan';}
  else if(y>.95&&y<5&&Math.abs(x)<2.7-(y<1.6?1.2:0)){k='stump';pts=LK.P.stump;}
  return {x,y,k,pts};}
function lkTier(s){return s>=LK.TIERS[2]?3:s>=LK.TIERS[1]?2:s>=LK.TIERS[0]?1:0;}
function lkSway(rnd,calm,hold){const a=(calm?.25:.45)+(calm?0:Math.max(0,hold-2.5)*.5);const g=()=>{let s=0;for(let i=0;i<4;i++)s+=rnd();return (s-2)/1.15;};return {x:g()*a,y:g()*a};}

/* ---------- бот: видит ветер «слабый/средний/сильный», ошибка прицела по умению ---------- */
function lkSim(o,k){o=o||{};k=k==null?.6:+k;const seed=(o.seed|0)||20261008,W=lkWind(seed),wk=lkWindK(o),me=zbbK.rng(seed+733*(1+Math.round(k*100))),rnd=zbbK.rng(seed*17+3);
  const g=()=>{let s=0;for(let i=0;i<4;i++)s+=me();return (s-2)/1.15;};let score=0;const T=LK.T.concat(o.more?LK.MORE:[]);
  T.forEach((t,i)=>{const w=W[i],wq=Math.sign(w)*(Math.abs(w)<.45?.35:Math.abs(w)<.75?.6:.9),seen=me()<(1-k)*.5?0:wq;
    const aim={x:-lkDrift(t,seen,wk)+g()*(1.6*(1-k)+.25),y:g()*(1.2*(1-k)+.2)},draw=me()<(1-k)*.35?.7+me()*.25:1,hold=1+me()*2+(1-k)*2;
    score+=lkHit(t,aim,draw,w,wk,lkSway(rnd,o.calm,hold)).pts;});
  return {score,tier:lkTier(score)};}

/* =================================== игра =================================== */
function lkRun(host,o){o=o||{};const K=zbbK,seed=(o.seed|0)||20261008,calm=K.calm(o),rnd=K.rng(seed*17+3),W0=lkWind(seed),wk=lkWindK(o),pc=K.pc();
  const G={score:0,n:0,tg:LK.T.slice(),state:'intro',t:0,aim:{x:0,y:-.2},hold:null,fly:null,P:[],N:[],msg:null,stuck:[],intro:{t:0},cam:{k:0,f:1},adUsed:0,hint:1,
    ivan:{fear:0,jump:0,capOff:0},apple:{st:'on',t:0},kb:{},shotsLog:[]};
  let V=null;window.__zbbG={G,shoot:(ax,ay,dr)=>shoot(ax,ay,dr,{x:0,y:0}),lkHit};
  const stg=K.stage(host,{resize,down,move,up,step,draw,hover,paused:()=>host.paused});
  const END=K.ender(host,o,{tier:lkTier,adKind:'more',adTitle:L('Ещё колчан?','Another quiver?'),adYes:L('Ещё 3 стрелы за рекламу','3 more arrows for an ad'),
    adSub:s=>{const n=s<LK.TIERS[0]?LK.TIERS[0]:s<LK.TIERS[1]?LK.TIERS[1]:LK.TIERS[2];return L('До '+n+' очков осталось '+(n-s)+'. Посмотри ролик — и пусти ещё 3 стрелы.',(n-s)+' more points to reach '+n+'. Watch a video and shoot 3 more arrows.');},
    adWant:s=>s<LK.TIERS[2]&&(s<LK.TIERS[0]?LK.TIERS[0]:s<LK.TIERS[1]?LK.TIERS[1]:LK.TIERS[2])-s<=8,
    onAd:()=>{G.adUsed=1;G.tg=G.tg.concat(LK.MORE);G.state='aim';newTarget();say(L('Ещё колчан!','Another quiver!'),'#ffe27a');},
    title:t=>t>=3?L('Стрелок на загляденье!','A marvel of an archer!'):t>=2?L('Метко!','Well aimed!'):t>=1?L('Неплохо!','Not bad!'):L('Яблоко целёхонько','The apple is safe'),
    unit:()=>L('очков','points'),
    finish:(s,t)=>{if(G.done)return;G.done=1;stg.kill();host.done&&host.done({score:s,tier:t,rec:false,extra:{ad:G.adUsed,bulls:G.shotsLog.filter(q=>q==='bull').length}});}});
  function cur(){return G.tg[Math.min(G.n,G.tg.length-1)];}
  function wind(){return W0[G.n%W0.length]*1;}

  /* ---------- камера: «подзорная» — яблоко всегда одной высоты на экране, даль видна по лугу и стогам ---------- */
  function resize(W,H){const port=H>W*1.1;V={W,H,port,hy:H*(port?.42:.44),ty:H*(port?.56:.6),tx:W/2,ar0:Math.max(14,Math.min(W*(port?.05:.03),H*.032))};V.ar=V.ar0;}
  // мир: x — метры вбок, z — шаги вдаль (1 шаг ≈ 0,7 м), y — метры вверх; цель в (0, d)
  function P(x,z,y){const t=cur(),c=V,zz=Math.max(.6,z),f=c.ar/LK.AR*(t.d+2)/(zz+2)*G.cam.f;   // f — px на метр на этой глубине (яблоко r=5 см → ar px)
    const gy=c.hy+(c.ty-c.hy)*(t.d+2)/(zz+2);return {x:c.tx+x*f,y:gy-(y||0)*f,k:f};}
  function A2S(ax,ay){const t=cur(),r=V.ar;const s=P(0,t.d,appleY());return {x:s.x+ax*r,y:s.y+ay*r};}   // точка в «радиусах яблока» → экран
  function appleY(){return cur().iv?2.04:.6;}

  /* ---------- управление ---------- */
  function down(p){if(END.down(p))return;
    if(G.state==='intro'){const b=G.intro.b;if(b&&K.hit(b,p))b.pressed=1;return;}
    if(G.state!=='aim')return;G.hold={t:0,px:p.x,py:p.y,m:p.m};G.hint=0;K.snd('reel');}
  function move(p){if(!G.hold)return;const sens=(p.m?1:1.1)/V.ar;G.aim.x+=(p.x-G.hold.px)*sens;G.aim.y+=(p.y-G.hold.py)*sens;G.hold.px=p.x;G.hold.py=p.y;clampAim();}
  function hover(p){}
  function up(p){if(END.up(p))return;
    if(G.state==='intro'){const b=G.intro.b;if(b&&b.pressed&&K.hit(b,p))start();if(b)b.pressed=0;return;}
    release();}
  function release(){const h=G.hold;G.hold=null;if(!h||G.state!=='aim')return;const dr=Math.min(1,h.t/LK.DRAW_T);
    if(dr<.18){say(L('Держи дольше — натяни тетиву','Hold longer to draw the string'),'#fff3c8');return;}
    shoot(G.aim.x,G.aim.y,dr,lkSway(rnd,calm,h.t));}
  function clampAim(){G.aim.x=Math.max(-9,Math.min(9,G.aim.x));G.aim.y=Math.max(-8,Math.min(9,G.aim.y));}
  K.keys(host,(k,e,dn)=>{if(dn&&END.on())return END.key(k);
    if(G.state==='intro'){if(dn&&(k==='Enter'||k===' ')){start();return true;}return false;}
    if(/^Arrow/.test(k)){G.kb[k]=dn;return true;}
    if(k===' '||k==='Enter'){if(dn&&G.state==='aim'&&!G.hold){G.hold={t:0,px:0,py:0,kb:1};G.hint=0;K.snd('reel');}else if(!dn&&G.hold&&G.hold.kb)release();return true;}return false;});
  function start(){if(G.state!=='intro')return;G.state='aim';K.snd('click');newTarget();}
  function newTarget(){G.apple={st:'on',t:0};G.ivan={fear:0,jump:0,capOff:0};G.stuck=[];G.cam.k=0;G.aim={x:0,y:-.2};}

  function shoot(ax,ay,dr,sw){if(G.state!=='aim')return;const t=cur(),w=wind(),r=lkHit(t,{x:ax,y:ay},dr,w,wk,sw);G.lastR=Object.assign({dr,w},r);
    G.fly={t:0,T:.32+t.d*.009,r,dr,from:nockPt(),w};G.state='fly';K.snd('shoot');K.snd('whistle');G.shotsLog.push(r.k);}
  function say(s,col){G.msg={s,t:0,col:col||'#fff3c8'};}

  /* ---------- шаг ---------- */
  function step(dt){G.t+=dt;
    if(G.hold){G.hold.t+=dt;if(G.hold.kb){const sp=(G.kb.ArrowLeft?-1:0)+(G.kb.ArrowRight?1:0),sv=(G.kb.ArrowUp?-1:0)+(G.kb.ArrowDown?1:0);G.aim.x+=sp*dt*3.2;G.aim.y+=sv*dt*3.2;clampAim();}
      if(G.hold.t>=LK.DRAW_T&&!G.hold.full){G.hold.full=1;K.snd('tick');}}
    else if(G.state==='aim'){const sp=(G.kb.ArrowLeft?-1:0)+(G.kb.ArrowRight?1:0),sv=(G.kb.ArrowUp?-1:0)+(G.kb.ArrowDown?1:0);if(sp||sv){G.aim.x+=sp*dt*3.2;G.aim.y+=sv*dt*3.2;clampAim();}}
    const f=G.fly;if(f){f.t+=dt;if(f.t>=f.T&&!f.hit){f.hit=1;impact(f.r);}if(f.t>=f.T+(f.r.k==='bull'||f.r.k==='edge'?1.5:1.1)){G.fly=null;next();}}
    if(cur().iv){G.ivan.fear=Math.min(1,G.ivan.fear+dt*(G.hold?1.5:-.6));G.ivan.fear=Math.max(0,G.ivan.fear);}
    if(G.ivan.jump>0)G.ivan.jump=Math.max(0,G.ivan.jump-dt*2.2);
    G.apple.t+=dt;
    if(G.msg){G.msg.t+=dt;if(G.msg.t>1.9)G.msg=null;}
    G.cam.k=Math.min(1,G.cam.k+dt*1.6);}
  function impact(r){const t=cur(),p=A2S(r.x,r.y),pts=r.pts;G.score+=pts;
    if(r.k==='bull'||r.k==='edge'){G.apple={st:r.k==='bull'?'split':'off',t:0,x:p.x,y:p.y,dir:r.x>0?-1:1};K.snd(r.k==='bull'?'crit':'hit');K.snd('coin');
      const j=calm?6:14;for(let i=0;i<j;i++){const a=-Math.PI/2+(Math.random()-.5)*2.6,v=V.ar*(3+Math.random()*5);K.part(G.P,{k:'drop',x:p.x,y:p.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:V.ar*30,s:V.ar*.12+1,dur:.8,col:i%3?'#fff3d0':'#e8d070'});}
      K.sparks(G.P,p.x,p.y,V.ar*.8,['#fff3a0','#ffd24a'],calm?6:12);K.pop(G.N,p.x,p.y-V.ar*1.6,'+'+pts,'#ffe27a',r.k==='bull');
      say(r.k==='bull'?(t.iv?L('В яблочко! Иван цел!','Bullseye! Ivan is unharmed!'):L('В яблочко!','Bullseye!')):L('Сбил яблоко!','Knocked the apple off!'),r.k==='bull'?'#ffe27a':'#c8ff9a');
      if(t.iv)G.ivan.jump=1;}
    else if(r.k==='stump'){G.stuck.push({x:r.x,y:r.y,t:0});K.snd('hit');K.dust(G.P,p.x,p.y,V.ar*.5,'#8a5a2e',5);K.pop(G.N,p.x,p.y-V.ar,'+'+pts,'#ffe9a0');say(L('В пень! Почти…','Into the stump! Almost…'),'#ffd2a0');}
    else if(r.k==='cap'){G.ivan.capOff=1;G.ivan.jump=1;G.apple={st:'drop',t:0};K.snd('hit');K.pop(G.N,p.x,p.y-V.ar,'+'+pts,'#ffe9a0');say(L('Шапку сбил! Иван в обиде','Knocked his hat off! Ivan is offended'),'#ffd2a0');}
    else if(r.k==='ivan'){G.ivan.jump=1;K.snd('whistle');say(L('Ой! Над самым ухом!','Whoa! Right past his ear!'),'#ffd2a0');G.stuck.push({x:r.x,y:r.y,t:0,hay:1});}
    else{G.stuck.push({x:r.x,y:r.y,t:0,hay:1});K.snd('swing');say(Math.abs(r.x)>Math.abs(r.y)?(r.x>0?L('Правее ушла','Went right'):L('Левее ушла','Went left')):r.y>0?L('Низко!','Too low!'):L('Высоко!','Too high!'),'#ffd2a0');
      const q=A2S(Math.max(-12,Math.min(12,r.x)),Math.max(-9,Math.min(9,r.y)));K.part(G.P,{k:'smoke',x:q.x,y:q.y,vy:-10,s:V.ar*.8,dur:.6,a:.6});}}
  function next(){G.n++;if(G.n>=G.tg.length){G.state='end';setTimeout(()=>END.end(G.score),450);return;}G.state='aim';newTarget();
    const t=cur();if(t.iv)say(L('Иван-дурак вызвался! Не задень…','Ivan the Fool volunteered! Don’t hit him…'),'#fff3c8');else say(L(t.d+' шагов',t.d+' paces'),'#fff3c8');}
  function bowTip(){return {x:V.W*(V.port?.6:.58),y:V.H*(V.port?.8:.8)};}

  /* =================================== рисование =================================== */
  const C={};
  function draw(g,W,H,dt){if(!V)return;const t=cur();G.cam.f=1;V.ar=V.ar0*(t.iv?.72:1);
    drawSky(g,W,H);drawLand(g,W,H);drawTarget(g);drawStuck(g);drawFlight(g);K.parts(g,G.P,dt);K.pops(g,G.N,dt,20);
    drawBow(g,W,H);drawCross(g);drawHUD(g,W,H);
    if(G.state==='intro')K.intro(g,W,H,Object.assign(G.intro,{title:L('Лук по яблоку','Apple Archery'),lines:[L('Сбей яблоко с пня — 5 стрел, всё дальше. Пятая — яблоко на шапке Ивана!','Shoot the apple off the stump — 5 arrows, farther each time. The fifth: an apple on Ivan’s hat!'),
      L('Ветер сносит стрелу — смотри на флажок и целься с поправкой.','The wind carries the arrow — watch the flag and aim to compensate.'),
      pc?L('Мышью: зажми — тетива натянется, веди — прицел, отпусти — выстрел.','Mouse: hold to draw, move to aim, release to shoot.'):L('Зажми палец — тетива натянется, веди — прицел, отпусти — выстрел.','Hold your finger to draw, slide to aim, release to shoot.')],
      pc:[[['←','↑','↓','→'],L('прицел','aim')],[[L('Пробел','Space')],L('держи — натянуть, отпусти — выстрел','hold to draw, release to shoot')]],
      art:(g2,x,y,s)=>{K.art(g2,'d_stump',x,y+s*.25,s*.8);K.art(g2,'p_apple',x,y-s*.05,s*.4);K.art(g2,'arrow',x-s*.45,y-s*.2,s*.7,{rot:.1});}}),dt);
    END.draw(g,W,H,dt);}

  function drawSky(g,W,H){const hy=V.hy,t=G.t;const sky=g.createLinearGradient(0,0,0,hy);sky.addColorStop(0,'#5aa6e6');sky.addColorStop(.7,'#a8d8f4');sky.addColorStop(1,'#f4f0d8');g.fillStyle=sky;g.fillRect(0,0,W,hy+2);
    K.glow(g,W*.18,hy*.32,Math.min(W,H)*.32,'#fff2b0',.5);g.fillStyle='#fff6cf';g.beginPath();g.arc(W*.18,hy*.32,Math.min(W,H)*.04,0,Math.PI*2);g.fill();
    // облака плывут по ветру
    const w=wind(),cl=K.cloud();G.cdx=(G.cdx||0)+w*(1/60)*24*(calm?.5:1);for(let i=0;i<5;i++){const s=(60+i*22)*Math.min(1.5,W/600+.5),x=(((G.cdx*(.6+i*.15)+i*W*.27)%(W+s*2))+W+s*2)%(W+s*2)-s,y=hy*.12+i*hy*.12;g.globalAlpha=.85;g.drawImage(cl,x-s,y-s*.3,s*2,s*1.1);}g.globalAlpha=1;
    // дальние холмы и лес
    if(!C.h||C.W!==W||C.H!==H){C.W=W;C.H=H;C.h=[];for(let j=0;j<3;j++){const p=new Path2D(),rr=mulberry(seed+j*7);p.moveTo(-10,hy+30);for(let x=-10;x<=W+20;x+=16)p.lineTo(x,hy-6-j*-4-(18+j*10)*(.5+.5*Math.sin(x*.008*(1+j*.4)+rr()*6)));p.lineTo(W+20,hy+30);p.closePath();C.h.push(p);}
      const p=new Path2D(),rr=mulberry(seed+3);p.moveTo(-10,hy+10);let x=-10;while(x<W+20){const h=8+rr()*16,w2=7+rr()*7;p.lineTo(x,hy+2);p.lineTo(x+w2*.5,hy+2-h);p.lineTo(x+w2,hy+2);x+=w2*.7;}p.lineTo(W+20,hy+10);p.closePath();C.fr=p;}
    g.fillStyle='#9ab8c8';g.fill(C.h[0]);g.fillStyle='#7aa088';g.fill(C.h[1]);g.fillStyle='#4f7a5a';g.fill(C.fr);}
  function drawLand(g,W,H){const hy=V.hy,t=cur();const gr=g.createLinearGradient(0,hy,0,H);gr.addColorStop(0,'#a8c86a');gr.addColorStop(.35,'#86b44e');gr.addColorStop(1,'#5a8a34');g.fillStyle=gr;g.fillRect(0,hy,W,H-hy);
    // полосы скошенной травы (дают глубину)
    for(let z=4;z<t.d+40;z+=4){const a=P(-30,z),b=P(30,z);g.fillStyle=(Math.round(z/4))%2?'rgba(255,255,200,.07)':'rgba(40,80,20,.06)';const c=P(0,z+4);g.fillRect(0,c.y,W,Math.max(1,a.y-c.y));}
    // дорожка от лучника к цели
    g.save();g.beginPath();const p0=P(-.8,0),p1=P(.8,0),p2=P(.5,t.d),p3=P(-.5,t.d);g.moveTo(p0.x,p0.y);g.lineTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.lineTo(p3.x,p3.y);g.closePath();g.fillStyle='rgba(210,180,120,.35)';g.fill();g.restore();
    // стога за целью, берёза, флажок
    const fx=V.port?1.05:1.7,sorted=[{z:t.d+40,f:()=>stog(g,-6,t.d+40)},{z:t.d+30,f:()=>stog(g,5,t.d+30)},{z:t.d+55,f:()=>stog(g,1.5,t.d+55)},{z:t.d+16,f:()=>birch(g,-3.6,t.d+16)},{z:t.d+1,f:()=>flagPole(g,fx,t.d+1)},
      {z:t.d*.5,f:()=>{const q=P(-2.6,t.d*.5);K.art(g,'d_bush',q.x,q.y-q.k*.25,q.k*.9);}},{z:t.d*.35,f:()=>{const q=P(3,t.d*.35);K.art(g,'d_shroom',q.x,q.y-q.k*.12,q.k*.35);}},
      {z:t.d+18,f:()=>{const q=P(-8,t.d+18);drawIzba(g,q);}}];
    sorted.sort((a,b)=>b.z-a.z);for(const s of sorted)s.f();
    // цветы на лугу
    const rr=mulberry(seed+t.d);for(let i=0;i<60;i++){const x=(rr()-.5)*14,z=1+rr()*(t.d+8),p=P(x,z);if(p.y>H||Math.abs(x)<.9)continue;g.fillStyle=i%3?'#fff8e0':i%2?'#ffd84a':'#e890c0';g.beginPath();g.arc(p.x,p.y,Math.max(1.2,p.k*.04),0,Math.PI*2);g.fill();}}
  function stog(g,x,z){const p=P(x,z),k=p.k,w=2.4*k,h=3*k;g.save();ell(g,p.x,p.y,w*.55,k*.2,'rgba(40,30,10,.2)',{ol:false,flat:true});
    g.beginPath();g.moveTo(p.x-w/2,p.y);g.quadraticCurveTo(p.x-w*.55,p.y-h*.7,p.x,p.y-h);g.quadraticCurveTo(p.x+w*.55,p.y-h*.7,p.x+w/2,p.y);g.closePath();const gr=g.createLinearGradient(p.x-w/2,0,p.x+w/2,0);gr.addColorStop(0,'#f0d27a');gr.addColorStop(1,'#b88a34');g.fillStyle=gr;g.fill();
    g.strokeStyle='rgba(120,80,20,.5)';g.lineWidth=Math.max(1,k*.03);for(let i=0;i<7;i++){g.beginPath();g.moveTo(p.x-w*.4+i*w*.13,p.y);g.quadraticCurveTo(p.x-w*.2+i*w*.06,p.y-h*.5,p.x,p.y-h*.95);g.stroke();}
    ln(g,[p.x,p.y-h,p.x,p.y-h-k*.6],'#6a4020',Math.max(1.5,k*.06));g.restore();}
  function birch(g,x,z){const p=P(x,z),k=p.k,h=7*k,sw=Math.sin(G.t*.9)*k*.1;g.fillStyle='#f4efe4';g.fillRect(p.x-k*.13,p.y-h,k*.26,h);g.fillStyle='#2a2420';for(let j=0;j<9;j++)g.fillRect(p.x-k*.13+(j%2?k*.12:0),p.y-h*(j+.5)/9,k*.12,k*.05);
    for(const [dx,dy,r] of[[0,-1,1.7],[-1,-.8,1.3],[1,-.78,1.3],[-.4,-.6,1.1],[.5,-.58,1.1]]){const gx=p.x+dx*k+sw,gy=p.y+h*dy,rr=r*k;const gg=g.createRadialGradient(gx-rr*.3,gy-rr*.3,rr*.2,gx,gy,rr);gg.addColorStop(0,'#b8e078');gg.addColorStop(1,'#4f8a3a');g.fillStyle=gg;g.beginPath();g.arc(gx,gy,rr,0,Math.PI*2);g.fill();}}
  function drawIzba(g,p){const k=p.k,w=4*k,h=2.8*k;g.fillStyle='#a8743c';g.fillRect(p.x-w/2,p.y-h,w,h);g.fillStyle='#6a3a1a';g.beginPath();g.moveTo(p.x-w*.6,p.y-h);g.lineTo(p.x,p.y-h-w*.45);g.lineTo(p.x+w*.6,p.y-h);g.closePath();g.fill();
    g.fillStyle='#ffe9a0';g.fillRect(p.x-w*.12,p.y-h*.7,w*.24,h*.32);g.strokeStyle='#e6b53a';g.lineWidth=Math.max(1,k*.08);g.strokeRect(p.x-w*.12,p.y-h*.7,w*.24,h*.32);}
  // флажок: развевается по ветру, сила — длина и волна; над ним стрелка
  function flagPole(g,x,z){const p=P(x,z),k=p.k*.55,h=2.3*k,w=wind(),t=G.t,top=p.y-h;ln(g,[p.x,p.y,p.x,top],'#6a4020',Math.max(2,k*.08));ell(g,p.x,top,k*.1,k*.1,'#e6b53a',{hl:.5});
    const L2=k*(1+Math.abs(w)*1.5),dir=Math.sign(w)||1,hh=k*.6,droop=(1-Math.abs(w))*.9;g.save();g.translate(p.x,top+k*.1);g.scale(dir,1);
    g.beginPath();g.moveTo(0,0);for(let i=0;i<=10;i++){const u=i/10;g.lineTo(L2*u*(1-droop*.4),u*L2*droop*.55+Math.sin(t*(6+Math.abs(w)*6)-u*5)*k*.08*u);}for(let i=10;i>=0;i--){const u=i/10;g.lineTo(L2*u*(1-droop*.4),hh*(1-u*.35)+u*L2*droop*.55+Math.sin(t*(6+Math.abs(w)*6)-u*5)*k*.08*u);}g.closePath();
    const fg=g.createLinearGradient(0,0,L2,0);fg.addColorStop(0,'#c0392b');fg.addColorStop(1,'#ff6a4a');g.fillStyle=fg;g.fill();g.lineWidth=Math.max(1,k*.03);g.strokeStyle='#6a1a10';g.stroke();g.restore();}
  function drawTarget(g){const t=cur(),p=P(0,t.d),k=p.k;
    if(t.iv)drawIvan(g,p,k);else{K.art(g,'d_stump',p.x,p.y-k*.28,k*1.05);}
    // яблоко
    const a=G.apple,ay=appleY(),s=P(0,t.d,ay),r=V.ar;
    if(a.st==='on'){const jig=t.iv?Math.sin(G.t*30)*G.ivan.fear*r*.12:0;K.art(g,'p_apple',s.x+jig,s.y,r*2.6);}
    else if(a.st==='split'){const q=Math.min(1,a.t/.9);for(const d of[-1,1]){g.save();g.globalAlpha=1-q*q;g.translate(s.x+d*q*r*4,s.y-r*3*q+r*9*q*q);g.rotate(d*q*3);g.beginPath();g.arc(0,0,r,d>0?-Math.PI/2:Math.PI/2,d>0?Math.PI/2:Math.PI*1.5);g.closePath();g.fillStyle='#e0332a';g.fill();
        g.beginPath();g.ellipse(0,0,r*.25,r*.95,0,0,Math.PI*2);g.fillStyle='#fff3d0';g.fill();g.restore();}}
    else if(a.st==='off'||a.st==='drop'){const q=Math.min(1,a.t/1);g.save();g.globalAlpha=1-q*.6;K.art(g,'p_apple',s.x+(a.dir||1)*q*r*5,s.y-r*2*q+r*10*q*q,r*2.6,{rot:q*5*(a.dir||1)});g.restore();}}
  function drawIvan(g,p,k){const fear=G.ivan.fear,j=G.ivan.jump,shake=Math.sin(G.t*40)*fear*k*.03,jy=-Math.sin(j*Math.PI)*k*.35;g.save();g.translate(p.x+shake,p.y+jy);
    ell(g,0,0,k*.5,k*.12,'rgba(30,20,10,.25)',{ol:false,flat:true});
    // ноги (коленки дрожат), рубаха, пояс, голова, шапка
    const kn=Math.sin(G.t*30)*fear*k*.05;ln(g,[-k*.14,0,-k*.16+kn,-k*.45,-k*.12,-k*.75],'#3a4a7a',k*.13);ln(g,[k*.14,0,k*.16-kn,-k*.45,k*.12,-k*.75],'#3a4a7a',k*.13);
    ell(g,-k*.17,-k*.02,k*.12,k*.06,'#5a3a1a');ell(g,k*.17,-k*.02,k*.12,k*.06,'#5a3a1a');
    shp(g,'#f4f0e0',{},[-k*.3,-1.35*k,k*.3,-.7*k],()=>{g.moveTo(-k*.26,-k*.72);g.lineTo(-k*.3,-k*1.3);g.quadraticCurveTo(0,-k*1.42,k*.3,-k*1.3);g.lineTo(k*.26,-k*.72);g.closePath();});
    ln(g,[-k*.27,-k*.8,k*.27,-k*.8],'#c0392b',k*.06);for(let i=-2;i<=2;i++)ell(g,i*k*.07,-k*1.25,k*.02,k*.02,'#c0392b',{ol:false,flat:true});
    // руки по швам
    ln(g,[-k*.3,-k*1.25,-k*.4,-k*.85],'#f4f0e0',k*.11);ln(g,[k*.3,-k*1.25,k*.4,-k*.85],'#f4f0e0',k*.11);ell(g,-k*.41,-k*.82,k*.06,k*.06,'#f4c9a3');ell(g,k*.41,-k*.82,k*.06,k*.06,'#f4c9a3');
    ell(g,0,-k*1.5,k*.2,k*.21,'#f4c9a3');
    // глаза зажмурены от страха, рот «о»
    g.strokeStyle='#2a1a10';g.lineWidth=Math.max(1,k*.025);g.beginPath();g.moveTo(-k*.11,-k*1.53);g.lineTo(-k*.04,-k*1.5);g.moveTo(k*.04,-k*1.5);g.lineTo(k*.11,-k*1.53);g.stroke();
    ell(g,0,-k*1.41,k*.035,k*.04+fear*k*.02,'#7a2a1a',{ol:false,flat:true});ell(g,-k*.13,-k*1.45,k*.04,k*.025,'rgba(240,120,120,.5)',{ol:false,flat:true});ell(g,k*.13,-k*1.45,k*.04,k*.025,'rgba(240,120,120,.5)',{ol:false,flat:true});
    // вихры
    for(const d of[-1,1])ln(g,[d*k*.17,-k*1.58,d*k*.24,-k*1.5],'#e8b64a',k*.05);
    // шапка-колпак (слетает)
    if(!G.ivan.capOff){shp(g,'#c0392b',{},[-k*.24,-k*1.98,k*.24,-k*1.62],()=>{g.moveTo(-k*.24,-k*1.64);g.quadraticCurveTo(-k*.2,-k*1.9,0,-k*1.74-k*.04);g.quadraticCurveTo(k*.2,-k*1.9,k*.24,-k*1.64);g.closePath();});ln(g,[-k*.25,-k*1.64,k*.25,-k*1.64],'#f4f0e0',k*.07);}
    g.restore();
    // пот со лба
    if(fear>.4&&Math.random()<.08)K.part(G.P,{k:'drop',x:p.x+k*.15,y:p.y-k*1.55,vx:k*.5,vy:-k*.5,g:k*6,s:Math.max(1.5,k*.03),dur:.6,col:'#bfe8ff'});}
  function drawStuck(g){for(const s of G.stuck){const p=A2S(s.x,s.y);if(s.hay&&(p.y<0||p.y>V.H))continue;g.save();g.translate(p.x,p.y);const r=V.ar;ln(g,[0,0,r*.5,r*.9],'#8a5a2e',Math.max(2,r*.12));
    g.fillStyle='#e0332a';g.beginPath();g.moveTo(r*.4,r*.75);g.lineTo(r*.75,r*.7);g.lineTo(r*.62,r*1.05);g.closePath();g.fill();g.restore();}}
  function drawFlight(g){const f=G.fly;if(!f||f.hit)return;const u=Math.min(1,f.t/f.T),to=A2S(f.r.x,f.r.y),fr=f.from,e=1-Math.pow(1-u,1.6);
    // путь: в экранных координатах, дуга вверх, снос ветром — изгиб
    const x=fr.x+(to.x-fr.x)*e+Math.sin(u*Math.PI)*f.w*V.ar*1.5,y=fr.y+(to.y-fr.y)*e-Math.sin(u*Math.PI)*V.H*.08,sc=1-u*.82;
    const dx=(to.x-fr.x)+Math.cos(u*Math.PI)*f.w*V.ar*1.5*Math.PI,dy=(to.y-fr.y)-Math.cos(u*Math.PI)*V.H*.08*Math.PI,ang=Math.atan2(dy,dx);
    K.art(g,'arrow',x,y,V.ar*5.5*sc+6,{rot:ang});}
  // лук в руке (передний план): лук стоит, тетива оттянута к себе, стрела смотрит в прицел
  function drawBow(g,W,H){const b=bowTip(),dr=G.hold?Math.min(1,G.hold.t/LK.DRAW_T):0,h=Math.min(H*.46,W*(V.port?.62:.3)),pull=h*(.06+dr*.3);
    if(G.state==='end')return;const cp=crossPt(),tilt=Math.max(-.35,Math.min(.35,(cp.x-b.x)/W*.6));
    g.save();g.translate(b.x,b.y);g.rotate(tilt);g.lineCap='round';
    const limb=()=>{g.beginPath();g.moveTo(0,-h/2);g.quadraticCurveTo(-h*.2,0,0,h/2);};
    g.strokeStyle='#4a2810';g.lineWidth=h*.06+3;limb();g.stroke();const bg=g.createLinearGradient(-h*.2,-h/2,0,h/2);bg.addColorStop(0,'#d89a5a');bg.addColorStop(1,'#8a5528');g.strokeStyle=bg;g.lineWidth=h*.06;limb();g.stroke();
    g.strokeStyle='rgba(255,230,180,.6)';g.lineWidth=h*.012;g.beginPath();g.moveTo(-h*.02,-h*.46);g.quadraticCurveTo(-h*.2,0,-h*.02,h*.46);g.stroke();
    g.strokeStyle='#e6b53a';g.lineWidth=h*.02;for(const yy of[-.4,.4]){g.beginPath();g.moveTo(-h*.06,h*yy-h*.02);g.lineTo(-h*.09,h*yy+h*.02);g.stroke();}
    rrect(g,-h*.17,-h*.07,h*.08,h*.14,h*.02);g.fillStyle='#7a2a1a';g.fill();
    // тетива к руке (к себе — вправо-вниз)
    const nx=pull*.9,ny=pull*.25;g.strokeStyle='#f6eedc';g.lineWidth=Math.max(1.5,h*.008);g.beginPath();g.moveTo(0,-h/2);g.lineTo(nx,ny);g.lineTo(0,h/2);g.stroke();
    g.restore();
    const n=nockPt();
    if(G.state==='aim'||G.state==='intro'){const ang=Math.atan2(cp.y-n.y,cp.x-n.x),len=h*(.46+dr*.12);const tx=n.x+Math.cos(ang)*len,ty=n.y+Math.sin(ang)*len;
      // древко сужается вдаль (стрела смотрит в даль)
      g.save();g.lineCap='round';g.strokeStyle='#4a2810';g.lineWidth=h*.03+2;g.beginPath();g.moveTo(n.x,n.y);g.lineTo(tx,ty);g.stroke();g.strokeStyle='#c98a4a';g.lineWidth=h*.028;g.beginPath();g.moveTo(n.x,n.y);g.lineTo(tx,ty);g.stroke();
      g.translate(tx,ty);g.rotate(ang);g.fillStyle='#d8e0ea';g.strokeStyle='#4a5260';g.lineWidth=1.5;g.beginPath();g.moveTo(-h*.01,-h*.03);g.lineTo(h*.07,0);g.lineTo(-h*.01,h*.03);g.closePath();g.fill();g.stroke();g.restore();
      g.save();g.translate(n.x,n.y);g.rotate(ang);for(const d of[-1,1]){g.fillStyle=d>0?'#e0332a':'#b02018';g.beginPath();g.moveTo(-h*.02,0);g.lineTo(h*.07,d*h*.005);g.lineTo(h*.05,d*h*.05);g.lineTo(-h*.03,d*h*.045);g.closePath();g.fill();}g.restore();}
    // рука на тетиве
    ell(g,n.x+h*.02,n.y+h*.015,h*.05,h*.045,'#f4c9a3');ln(g,[n.x+h*.05,n.y+h*.03,n.x+h*.2,n.y+h*.14],'#c8392f',h*.07);
    // богатырь-лучник в углу
    K.art(g,K.heroKey(),V.W*(V.port?.14:.08),H-Math.min(H*.12,90)*.55-6,Math.min(H*.14,96));
    if(dr>0){const bw=Math.min(180,W*.42),bx=V.W/2-bw/2,by=H-18;rrect(g,bx,by,bw,12,6);g.fillStyle='rgba(30,16,6,.55)';g.fill();rrect(g,bx+2,by+2,Math.max(4,(bw-4)*dr),8,4);g.fillStyle=dr>=1?'#8ad04a':'#f0c43a';g.fill();
      K.txt(g,dr>=1?L('Натянута!','Drawn!'):L('Тяни…','Drawing…'),bx+bw/2,by-12,14,dr>=1?'#c8ff9a':'#fff3c8');}}
  function nockPt(){const b=bowTip(),dr=G.hold?Math.min(1,G.hold.t/LK.DRAW_T):0,h=Math.min(V.H*.46,V.W*(V.port?.62:.3)),pull=h*(.06+dr*.3),cp=crossPt(),tilt=Math.max(-.35,Math.min(.35,(cp.x-b.x)/V.W*.6));
    const nx=pull*.9,ny=pull*.25;return {x:b.x+nx*Math.cos(tilt)-ny*Math.sin(tilt),y:b.y+nx*Math.sin(tilt)+ny*Math.cos(tilt)};}
  function crossPt(){const sw=G.hold?swayNow():{x:0,y:0};return A2S(G.aim.x+sw.x,G.aim.y+sw.y);}
  function drawCross(g){if(G.state!=='aim')return;const p=crossPt(),r=V.ar*1.25,dr=G.hold?Math.min(1,G.hold.t/LK.DRAW_T):0;
    g.save();g.strokeStyle=dr>=1?'rgba(200,255,150,.95)':'rgba(255,250,230,.95)';g.lineWidth=2.5;g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=3;g.beginPath();g.arc(p.x,p.y,r,0,Math.PI*2);g.stroke();
    for(const [a,b] of[[1,0],[-1,0],[0,1],[0,-1]]){g.beginPath();g.moveTo(p.x+a*r*.5,p.y+b*r*.5);g.lineTo(p.x+a*r*1.5,p.y+b*r*1.5);g.stroke();}g.fillStyle='#ff5a3a';g.beginPath();g.arc(p.x,p.y,2.5,0,Math.PI*2);g.fill();g.restore();
    if(G.hint&&!G.hold){const q=(G.t*.8)%1;K.hand(g,p.x+V.ar*3+q*20,p.y+V.ar*4,44,q<.25);
      K.txt(g,pc?L('Зажми, веди прицел, отпусти','Hold, move the sight, release'):L('Зажми, веди прицел, отпусти','Hold, slide to aim, release'),V.W/2,V.hy*.5+40,V.W<380?17:20,'#fff8e0',{mw:V.W-24});}}
  function swayNow(){const h=G.hold?G.hold.t:0,a=(calm?.25:.45)+(calm?0:Math.max(0,h-2.5)*.5);return {x:Math.sin(G.t*1.7)*a*.7+Math.sin(G.t*3.1)*a*.3,y:Math.sin(G.t*2.3+1)*a*.6};}

  function drawHUD(g,W,H){const top=8,t=cur(),fs=W<380?15:17;
    // стрелы
    const nA=G.tg.length,pw=Math.min(W-90,nA*26+90);K.plate(g,10,top,pw,46);K.txt(g,L('Стрелы','Arrows'),22,top+15,12,'#e6c98a',{al:'left',ol:false,sh:false,w:700});
    for(let i=0;i<nA;i++){const used=i<G.n;g.globalAlpha=used?.28:1;K.art(g,'arrow',30+i*24,top+32,26,{rot:-Math.PI/2.3});g.globalAlpha=1;}
    // дальность и ветер
    const y2=top+54;K.plate(g,10,y2,Math.min(W-20,210),40);K.txt(g,t.iv?L('Иван, '+t.d+' шагов','Ivan, '+t.d+' paces'):L(t.d+' шагов',t.d+' paces'),22,y2+20,fs,'#fff3c8',{al:'left',mw:96});
    const w=wind(),wx=10+Math.min(W-20,210)-56;K.txt(g,L('ветер','wind'),wx-6,y2+12,11,'#e6c98a',{ol:false,sh:false,w:700});
    const n=Math.abs(w)<.45?1:Math.abs(w)<.75?2:3,dir=Math.sign(w)||1;for(let i=0;i<3;i++){const on=i<n;g.save();g.translate(wx-14+(dir>0?i:2-i)*14+8,y2+27);g.scale(dir,1);g.fillStyle=on?'#8ad0ff':'rgba(255,255,255,.18)';g.beginPath();g.moveTo(-6,-6);g.lineTo(4,0);g.lineTo(-6,6);g.lineTo(-2,0);g.closePath();g.fill();g.restore();}
    // счёт
    const sw=118,sx=W-sw-10-(W<520?52:62);K.plate(g,sx,top,sw,46);K.txt(g,L('Очки','Points'),sx+12,top+15,12,'#e6c98a',{al:'left',ol:false,sh:false,w:700});K.txt(g,String(G.score),sx+sw-14,top+25,26,'#ffd24a',{al:'right'});
    const nx=LK.TIERS.find(q=>q>G.score);if(nx)K.txt(g,L('до звезды: ','next star: ')+(nx-G.score),sx+12,top+36,11,'#fff3c8',{al:'left',ol:false,sh:false,w:700});
    K.plate(g,sx+sw-76,y2,76,30,{r:12});for(let i=0;i<3;i++)K.star(g,sx+sw-58+i*20,y2+15,8,G.score>=LK.TIERS[i],false);
    if(G.msg&&!END.on()){const a=G.msg.t<.15?G.msg.t/.15:G.msg.t>1.5?Math.max(0,1-(G.msg.t-1.5)/.4):1;g.globalAlpha=a;K.txt(g,G.msg.s,W/2,V.hy*.62+30,W<380?22:28,G.msg.col,{mw:W-30});g.globalAlpha=1;}}
}

/* ---------- значок: яблоко, пронзённое стрелой ---------- */
if(typeof art==='function')art('zbb_i5',64,g=>{ell(g,0,4,20,18,'#e0332a',{hl:.55});ln(g,[0,-12,3,-22],'#6a4020',3);shp(g,'#4fb04a',{},[3,-26,18,-14],()=>{g.moveTo(3,-18);g.quadraticCurveTo(10,-28,18,-20);g.quadraticCurveTo(10,-14,3,-18);});
  ln(g,[-28,14,26,-6],'#8a5a2e',3.4);poly(g,[26,-6,18,-7,22,0],'#d8e0ea',{hl:.6});poly(g,[-28,14,-20,8,-18,15],'#e0332a');poly(g,[-28,14,-22,19,-18,15],'#c02a20');});

zbbK.reg({id:'luk',num:5,n:zabN('Лук по яблоку','Apple Archery'),icon:'zbb_i5',kind:'week',en:true,open:()=>true,
  run:lkRun,sim:lkSim,bot:lkSim,tiers:LK.TIERS,_lk:{LK,lkHit,lkWind,lkDrift}});
})();
