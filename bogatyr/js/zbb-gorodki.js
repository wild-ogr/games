'use strict';
/* BGB (08.10) «Забава» №4 «Городки» (id 'gorodki').
   Двор с плетнём и теремом; на земле мелом — «город» (квадрат 2×2), в нём фигура из 5 рюх. Тянешь биту назад и отпускаешь —
   бита летит, вращаясь, по дуге, падает и скользит по земле, сметая рюхи. Рюха выбита, если её середина вылетела за черту города.
   5 бит; фигуры по порядку (Пушка, Звезда, Колодец, Рак, Вилка, Стрела, Бабушка в окошке, Письмо). Вся фигура одной битой — +3.
   Механика броска (протяжка «как рогатка», пунктир подсказки) — из «Царь-пушки» Обороны, переписана под вид «из-за спины».
   Подсказка-пунктир показывает полёт только до черты города (дальше — догадывайся сам): меткость, не угадайка.
   Логика (бросок, сбивание, счёт) — чистые функции gk*, ими же играет бот (sim). */
(function(){
const GK={CZ:6.5,CD:2,CW:1,RL:.36,RR:.1,BL:1.05,BATS:5,CLEAN:3,FENCE:16,TIERS:[10,20,30],ZMIN:2,ZMAX:10.4};
// фигуры: x — поперёк (−1…1), z — от черты кона (город 6,5…8,5); o: 'x' лежит поперёк, 'z' лежит вдоль, 'v' стоит
const FIG=[
  {id:'pushka',n:()=>L('Пушка','Cannon'),r:[[-.24,6.62,'v'],[.24,6.62,'v'],[0,6.8,'z'],[0,7.12,'x'],[0,6.62,'v']]},
  {id:'zvezda',n:()=>L('Звезда','Star'),r:[[0,7.2,'v'],[-.34,7.2,'x'],[.34,7.2,'x'],[0,6.86,'z'],[0,7.54,'z']]},
  {id:'kolodec',n:()=>L('Колодец','Well'),r:[[0,6.66,'x'],[0,7.2,'x'],[-.22,6.93,'z'],[.22,6.93,'z'],[0,6.93,'v']]},
  {id:'rak',n:()=>L('Рак','Crayfish'),r:[[0,6.62,'v'],[-.3,6.78,'z'],[.3,6.78,'z'],[0,7.02,'x'],[0,7.36,'z']]},
  {id:'vilka',n:()=>L('Вилка','Fork'),r:[[-.28,6.72,'z'],[0,6.72,'z'],[.28,6.72,'z'],[0,7.02,'x'],[0,7.4,'z']]},
  {id:'strela',n:()=>L('Стрела','Arrow'),r:[[0,6.6,'v'],[-.22,6.86,'z'],[.22,6.86,'z'],[0,7.06,'z'],[0,7.42,'z']]},
  {id:'babka',n:()=>L('Бабушка в окошке','Granny in the Window'),r:[[0,7.05,'v'],[0,6.76,'x'],[0,7.36,'x'],[-.27,7.06,'z'],[.27,7.06,'z']]},
  {id:'pismo',n:()=>L('Письмо','Letter'),r:[[0,7.5,'x'],[-.34,7.18,'v'],[.34,7.18,'v'],[-.34,7.84,'v'],[.34,7.84,'v']]}];
function gkFig(n){const f=FIG[n%FIG.length];return f.r.map((q,i)=>({x:q[0],z:q[1],o:q[2],out:0,id:i}));}
function gkIn(q){return q.x>-GK.CW&&q.x<GK.CW&&q.z>GK.CZ&&q.z<GK.CZ+GK.CD;}
// протяжка → место падения биты (pow 0…1, ax −1…1)
function gkLand(pow,ax){return {zL:GK.ZMIN+pow*(GK.ZMAX-GK.ZMIN),xL:Math.max(-1.9,Math.min(1.9,ax*2.1))};}
function gkSkid(pow){return 1.05+pow*.75;}
/* бросок: aim={xL,zL,pow}, nz — «дрожь руки» {dx,dz,th} (из зерна), calm — шире. → {xL,zL,th,S,hits:[{id,x1,z1,u,out}],outN} — R меняется на месте */
function gkThrow(R,aim,nz,calm,rnd){const xL=aim.xL+nz.dx,zL=aim.zL+nz.dz,th=nz.th,S=gkSkid(aim.pow),v0=.75+aim.pow*.5;
  const reach=GK.BL/2*Math.max(.35,Math.abs(Math.cos(th)))+(calm?.13:.07),hits=[],moved={};
  const q=R.filter(r=>!r.out).sort((a,b)=>a.z-b.z);
  const ext=r=>r.o==='x'?GK.RL/2:GK.RR,extZ=r=>r.o==='z'?GK.RL/2:GK.RR;
  for(const r of q){const lat=r.x-xL,u=r.z-zL;
    if(u<-.16-extZ(r)||u>S+extZ(r))continue;if(Math.abs(lat)>reach+ext(r))continue;
    const v=v0*Math.max(.1,1-.5*Math.max(0,u)/S),cen=Math.max(0,1-Math.abs(lat)/(reach+ext(r)));
    const dist=2.7*v*(.3+.7*cen)*(.8+.4*rnd()),ang=lat*1.05+(rnd()-.5)*.5;
    moved[r.id]={dx:Math.sin(ang)*dist,dz:Math.cos(ang)*dist,u:Math.max(0,u),v};}
  // цепь: выбитая рюха бьёт соседку позади себя (60 % силы)
  for(const r of q){const m=moved[r.id];if(!m)continue;for(const p of q){if(p===r||moved[p.id])continue;const dz=p.z-r.z,dx=p.x-r.x;
      if(dz>-.05&&dz<Math.min(.55,Math.abs(m.dz)*.5)&&Math.abs(dx-m.dx*dz/Math.max(.1,m.dz))<.2){const d=Math.hypot(m.dx,m.dz)*.6*(.7+.4*rnd()),a=Math.atan2(m.dx,m.dz)+(rnd()-.5)*.6;moved[p.id]={dx:Math.sin(a)*d,dz:Math.cos(a)*d,u:m.u+.08,v:m.v*.6,ch:1};}}}
  let outN=0;for(const r of q){const m=moved[r.id];if(!m)continue;const x0=r.x,z0=r.z;r.x+=m.dx;r.z=Math.min(GK.FENCE-.3,r.z+m.dz);const out=!gkIn(r);if(out){r.out=1;outN++;}
    hits.push({id:r.id,x0,z0,x1:r.x,z1:r.z,u:m.u,out,ch:!!m.ch});}
  return {xL,zL,th,S,hits,outN};}
function gkNoise(rnd,calm){const gs=()=>{let s=0;for(let i=0;i<4;i++)s+=rnd();return (s-2)/1.15;};const k=calm?.6:1;return {dx:gs()*.08*k,dz:gs()*.17*k,th:gs()*.42*k};}
function gkTier(s){return s>=GK.TIERS[2]?3:s>=GK.TIERS[1]?2:s>=GK.TIERS[0]?1:0;}

/* ---------- бот: целится в середину оставшихся, ошибка по умению k (0…1) ---------- */
function gkSim(o,k){o=o||{};k=k==null?.6:+k;const seed=(o.seed|0)||20261008,rnd=zbbK.rng(seed*13+7),me=zbbK.rng(seed+977*(1+Math.round(k*100)));
  const gs=()=>{let s=0;for(let i=0;i<4;i++)s+=me();return (s-2)/1.15;};let fig=0,R=gkFig(0),fresh=1,score=0,bats=GK.BATS+(o.more?GK.BATS:0);
  for(let b=0;b<bats;b++){const al=R.filter(r=>!r.out);const mx=al.reduce((s,r)=>s+r.x,0)/al.length,mz=Math.min(...al.map(r=>r.z));
    const zT=mz-.08+gs()*(1.1*(1-k)+.12),xT=mx+gs()*(.5*(1-k)+.05),pow=Math.max(0,Math.min(1,(zT-GK.ZMIN)/(GK.ZMAX-GK.ZMIN)));
    const r=gkThrow(R,{xL:xT,zL:GK.ZMIN+pow*(GK.ZMAX-GK.ZMIN),pow},gkNoise(rnd,o.calm),o.calm,rnd);score+=r.outN;
    if(R.every(q=>q.out)){if(fresh&&r.outN===5)score+=GK.CLEAN;fig++;R=gkFig(fig);fresh=1;}else fresh=0;}
  return {score,tier:gkTier(score)};}

/* =================================== игра =================================== */
function gkRun(host,o){o=o||{};const K=zbbK,seed=(o.seed|0)||20261008,calm=K.calm(o),rnd=K.rng(seed*13+7);
  const G={score:0,bat:0,bats:GK.BATS,fig:0,R:gkFig(0),fresh:1,figN:0,cleanN:0,state:'intro',fly:null,drag:null,P:[],N:[],msg:null,t:0,hint:1,kb:{pow:.5,ax:0},
    shake:0,zoom:1,zoomT:1,ghosts:[],adUsed:0,intro:{t:0},banner:null,hover:null};
  let V=null;const pc=K.pc();window.__zbbG={G,fire:(p,a)=>fire(p,a),gkThrow,FIG};
  const stg=K.stage(host,{resize,down,move,up,step,draw,paused:()=>host.paused});
  const END=K.ender(host,o,{tier:gkTier,adKind:'more',adTitle:L('Ещё 5 бит?','5 more bats?'),adYes:L('Ещё 5 бит за рекламу','5 more bats for an ad'),
    adSub:s=>{const n=s<GK.TIERS[0]?GK.TIERS[0]:s<GK.TIERS[1]?GK.TIERS[1]:GK.TIERS[2];return L('До '+n+' рюх осталось '+(n-s)+'. Посмотри ролик — и брось ещё 5 бит.',(n-s)+' more pins to reach '+n+'. Watch a video and throw 5 more bats.');},
    adWant:s=>s<GK.TIERS[2]&&(s<GK.TIERS[0]?GK.TIERS[0]:s<GK.TIERS[1]?GK.TIERS[1]:GK.TIERS[2])-s<=6,
    onAd:()=>{G.adUsed=1;G.bats+=GK.BATS;G.state='aim';say(L('Ещё 5 бит!','5 more bats!'),'#ffe27a');},
    title:t=>t>=3?L('Знатный городошник!','Master of Gorodki!'):t>=2?L('Метко бьёшь!','Sharp throwing!'):t>=1?L('Добрый бросок!','Nice throwing!'):L('Город устоял','The town held'),
    unit:s=>L('рюх выбито','pins knocked out'),
    finish:(s,t)=>{if(G.done)return;G.done=1;stg.kill();host.done&&host.done({score:s,tier:t,rec:false,extra:{figs:G.figN,clean:G.cleanN,ad:G.adUsed}});}});

  /* ---------- камера: «из-за спины», город — в середине экрана ---------- */
  function resize(W,H){const port=H>W*1.1,D0=6,yN=H*(port?.8:.8),yC=H*(port?.43:.45),A=(yN-yC)/(1/D0-1/(D0+GK.CZ+1)),cw=Math.min(W*(port?.64:.4),H*(port?.36:.42)),F=cw*(D0+GK.CZ+1)/2;
    V={W,H,port,D0,A,F,hy:yN-A/D0,cx:W/2,yN,top:port?112:86};}
  function P(x,z,y){const d=Math.max(.5,z+V.D0);return {x:V.cx+x*V.F/d,y:V.hy+(V.A-(y||0)*V.F)/d,k:V.F/d};}

  /* ---------- управление: протяжка от биты назад ---------- */
  function batPos(){return {x:V.W/2,y:Math.min(V.H-50,V.yN+(V.H-V.yN)*(V.port?.42:.3))};}
  function aimFrom(dx,dy){const Lm=Math.min(V.W,V.H)*.36,len=Math.hypot(dx,dy);return {pow:Math.max(0,Math.min(1,dy/Lm)),ax:Math.max(-1,Math.min(1,-dx/(Lm*.8))),len};}
  function down(p){if(END.down(p))return;
    if(G.state==='intro'){const b=G.intro.b;if(b&&K.hit(b,p))b.pressed=1;return;}
    if(G.state!=='aim')return;G.drag={x0:p.x,y0:p.y,x:p.x,y:p.y,a:null};K.snd('click');}
  function move(p){if(G.drag){G.drag.x=p.x;G.drag.y=p.y;G.drag.a=aimFrom(p.x-G.drag.x0,p.y-G.drag.y0);}}
  function up(p){if(END.up(p))return;
    if(G.state==='intro'){const b=G.intro.b;if(b&&b.pressed&&K.hit(b,p))start();if(b)b.pressed=0;return;}
    const d=G.drag;G.drag=null;if(!d||G.state!=='aim'||d.kb)return;const a=aimFrom(p.x-d.x0,p.y-d.y0);
    if(a.pow<.08){say(L('Тяни биту вниз — назад, к себе','Pull the bat down — back towards you'),'#fff3c8');return;}fire(a.pow,a.ax);}
  function kbAim(){const Lm=Math.min(V.W,V.H)*.36,b=batPos(),k=G.kb;G.drag={x0:b.x,y0:b.y,x:b.x-k.ax*Lm*.8,y:b.y+k.pow*Lm,a:{pow:k.pow,ax:k.ax},kb:1};}
  K.keys(host,(k,e,dn)=>{if(!dn)return false;if(END.on())return END.key(k);
    if(G.state==='intro'){if(k==='Enter'||k===' '){start();return true;}return false;}
    if(G.state!=='aim')return /^Arrow| /.test(k);const Q=G.kb;
    if(k==='ArrowUp'){Q.pow=Math.max(.05,Q.pow-.02);kbAim();return true;}if(k==='ArrowDown'){Q.pow=Math.min(1,Q.pow+.02);kbAim();return true;}
    if(k==='ArrowLeft'){Q.ax=Math.min(1,Q.ax+.03);kbAim();return true;}if(k==='ArrowRight'){Q.ax=Math.max(-1,Q.ax-.03);kbAim();return true;}
    if(k===' '||k==='Enter'){if(!G.drag||!G.drag.kb){kbAim();return true;}const a=G.drag.a;G.drag=null;fire(a.pow,a.ax);return true;}return false;});
  function start(){if(G.state!=='intro')return;G.state='aim';G.t0=G.t;K.snd('click');}

  function fire(pow,ax){if(G.state!=='aim')return;const ld=gkLand(pow,ax),nz=gkNoise(rnd,calm),S0=JSON.parse(JSON.stringify(G.R));
    const res=gkThrow(G.R,{xL:ld.xL,zL:ld.zL,pow},nz,calm,rnd);const keep=G.R;G.R=S0;   // показываем по ходу полёта, итог — res
    G.fly={pow,res,keep,t:0,T:.5+pow*.38,h:.45+pow*.9,sk:0,phase:'air',th0:res.th+Math.PI*(3+Math.round(pow*3)),done:{}};
    G.state='fly';G.hint=0;G.bat++;K.snd('swing');K.snd('whistle');}
  function say(s,col){G.msg={s,t:0,col:col||'#fff3c8'};}

  /* ---------- шаг ---------- */
  function step(dt){G.t+=dt;const f=G.fly;
    if(f){f.t+=dt;const r=f.res;
      if(f.phase==='air'&&f.t>=f.T){f.phase='skid';f.ts=f.t;K.snd('hit');const p=P(r.xL,r.zL);K.dust(G.P,p.x,p.y,p.k*.35,'#9a7a4a',calm?5:9);if(!calm)G.shake=Math.max(G.shake,.25);
        G.zoomT=calm?1:1.12;}
      if(f.phase==='skid'){const q=Math.min(1,(f.t-f.ts)/.5);f.sk=r.S*(1-Math.pow(1-q,2.2));
        for(const h of r.hits)if(!f.done[h.id]&&f.sk>=h.u){f.done[h.id]=1;knock(h);}
        if(Math.random()<.5&&q<.8){const p=P(r.xL,r.zL+f.sk);K.part(G.P,{k:'smoke',x:p.x+(Math.random()-.5)*p.k*.6,y:p.y,vy:-14,s:p.k*.13,dur:.6,a:.55});}
        if(q>=1){for(const h of r.hits)if(!f.done[h.id]){f.done[h.id]=1;knock(h);}f.phase='rest';f.tr=f.t;}}
      if(f.phase==='rest'&&f.t-f.tr>(r.hits.length?1.05:.7))after();}
    for(const g of G.ghosts){g.t+=dt;}
    for(let i=G.ghosts.length-1;i>=0;i--)if(G.ghosts[i].out&&G.ghosts[i].t>g_dur(G.ghosts[i])+1.6)G.ghosts.splice(i,1);
    G.zoom+=(G.zoomT-G.zoom)*(1-Math.exp(-dt*3.2));if(G.state==='aim')G.zoomT=1;
    if(G.msg){G.msg.t+=dt;if(G.msg.t>1.9)G.msg=null;}
    if(G.banner){G.banner.t+=dt;if(G.banner.t>1.8)G.banner=null;}
    if(G.shake>0){G.shake=Math.max(0,G.shake-dt*2.5);}}
  const g_dur=g=>.42+Math.min(.5,Math.hypot(g.x1-g.x0,g.z1-g.z0)*.09);
  function knock(h){const r=G.R.find(q=>q.id===h.id);if(!r)return;r.hide=1;const sp=(Math.random()<.5?-1:1)*(6+Math.random()*8);
    G.ghosts.push({id:h.id,o:r.o,x0:h.x0,z0:h.z0,x1:h.x1,z1:h.z1,t:0,sp,out:h.out,hgt:.25+Math.min(1.1,Math.hypot(h.x1-h.x0,h.z1-h.z0)*.22)});
    const p=P(h.x0,h.z0,.1);K.snd(h.out?'crack':'hit');K.sparks(G.P,p.x,p.y,p.k*.25,['#ffe9b0','#f0c070'],calm?4:8);
    for(let i=0;i<(calm?3:6);i++){const a=-Math.PI/2+(Math.random()-.5)*2.4,v=p.k*(.8+Math.random()*1.4);K.part(G.P,{k:'chip',x:p.x,y:p.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:p.k*7,s:p.k*.03+1,rot:Math.random()*6,vr:(Math.random()-.5)*20,dur:.6,col:'#e8c890'});}
    if(h.out){G.score++;setTimeout(()=>{const q=P(h.x1,Math.min(h.z1,GK.FENCE-.4),.3);K.pop(G.N,q.x,q.y-10,'+1','#ffe27a');if(h.z1>GK.FENCE-.6)K.snd('kill');},g_dur({x0:h.x0,z0:h.z0,x1:h.x1,z1:h.z1})*1000);}}
  function after(){const f=G.fly,r=f.res;G.fly=null;G.R=f.keep;for(const q of G.R)q.hide=0;G.ghosts=G.ghosts.filter(q=>q.out);G.zoomT=1;
    const al=G.R.filter(q=>!q.out),z0=al.length?Math.min(...al.map(q=>q.z)):GK.CZ,z1=al.length?Math.max(...al.map(q=>q.z)):GK.CZ+GK.CD;
    if(!r.hits.length)say(r.zL>z1+.1?L('Перелёт!','Too far!'):r.zL+r.S<z0-.05?L('Недолёт!','Too short!'):L('Мимо!','Missed!'),'#ffd2a0');
    else if(r.outN===0)say(L('Задел, да не выбил','Touched, but still inside'),'#ffd2a0');
    else if(r.outN>=3&&!G.R.every(q=>q.out))say(L('Знатно! −','Great! −')+r.outN,'#c8ff9a');
    if(G.R.every(q=>q.out)){const clean=G.fresh&&r.outN===5;G.figN++;if(clean){G.score+=GK.CLEAN;G.cleanN++;K.snd('combo');}else K.snd('level');
      G.banner={t:0,s:clean?L('С одной биты! +','In one throw! +')+GK.CLEAN:L('Фигура выбита!','Figure cleared!'),sub:FIG[G.fig%FIG.length].n()};
      G.fig++;G.R=gkFig(G.fig);for(const q of G.R)q.pop=0;G.fresh=1;}else G.fresh=0;
    if(G.bat>=G.bats){G.state='end';setTimeout(()=>END.end(G.score),650);}else G.state='aim';}

  /* =================================== рисование =================================== */
  const C={};
  function draw(g,W,H,dt){if(!V)return;const sx=G.shake>0&&!calm?(Math.random()*2-1)*G.shake*6:0,sy=G.shake>0&&!calm?(Math.random()*2-1)*G.shake*6:0;
    g.save();g.translate(sx,sy);if(G.zoom!==1){const cy=P(0,GK.CZ+1).y;g.translate(V.cx,cy);g.scale(G.zoom,G.zoom);g.translate(-V.cx,-cy);}
    drawBack(g,W,H);drawYard(g,W,H);drawCity(g);drawObjs(g);K.parts(g,G.P,dt);
    g.save();K.pops(g,G.N,dt,20/G.zoom);g.restore();g.restore();
    drawHero(g,W,H);if(G.state==='aim'||G.state==='intro')drawHandBat(g);drawAim(g);drawHUD(g,W,H);
    if(G.state==='intro')K.intro(g,W,H,Object.assign(G.intro,{title:L('Городки','Gorodki'),lines:[L('Выбей рюхи из «города» за 5 бит.','Knock the pins out of the “town” with 5 bats.'),
      L('Рюха выбита, когда вылетела за черту. Вся фигура одной битой — +3.','A pin is out once it flies over the line. Whole figure in one throw — +3.'),
      pc?L('Мышью: зажми, потяни назад и отпусти.','Mouse: press, pull back and release.'):L('Потяни биту назад и отпусти. Пунктир покажет полёт до черты.','Pull the bat back and let go. The dotted line shows the flight up to the line.')],
      pc:[[['←','→'],L('прицел влево-вправо','aim left / right')],[['↑','↓'],L('дальше / ближе','farther / nearer')],[[L('Пробел','Space')],L('прицелиться, ещё раз — бросок','aim, press again to throw')]],
      art:(g2,x,y,s)=>{drawRuha(g2,x-s*.32,y+6,'v',s*.55,0);drawRuha(g2,x+s*.32,y+6,'v',s*.55,0);drawRuha(g2,x,y+s*.18,'x',s*.62,0);drawBatShape(g2,x,y-s*.3,s*1.25,-.2);}}),dt);
    END.draw(g,W,H,dt);}

  function drawBack(g,W,H){const hy=V.hy,t=G.t;
    const sky=g.createLinearGradient(0,0,0,Math.max(60,hy+40));sky.addColorStop(0,'#6fb6ec');sky.addColorStop(.6,'#bfe2f6');sky.addColorStop(1,'#fff1cf');g.fillStyle=sky;g.fillRect(0,0,W,Math.max(0,hy)+60);
    // солнце и облака
    const sxx=W*.82,syy=Math.max(26,hy*.35);K.glow(g,sxx,syy,Math.min(W,H)*.35,'#fff2b0',.55);g.fillStyle='#fff6cf';g.beginPath();g.arc(sxx,syy,Math.min(W,H)*.045,0,Math.PI*2);g.fill();
    const cl=K.cloud();for(let i=0;i<4;i++){const s=(70+i*24)*Math.min(1.4,W/600+.5),x=((t*(4+i*2)+i*W*.33)%(W+s*2))-s,y=Math.max(10,hy*.15)+i*14;g.globalAlpha=.85;g.drawImage(cl,x-s,y-s*.3,s*2,s*1.1);}g.globalAlpha=1;
    // дальний лес — силуэт на горизонте
    if(!C.fr||C.w!==W){C.w=W;const p=new Path2D(),rr=mulberry(seed+9);p.moveTo(-10,hy+40);let x=-10;while(x<W+30){const h=(18+rr()*30)*Math.min(1.6,W/500+.4),w=12+rr()*12;p.lineTo(x,hy+4);p.lineTo(x+w*.5,hy+4-h);p.lineTo(x+w,hy+4);x+=w*.7;}p.lineTo(W+30,hy+40);p.closePath();C.fr=p;}
    g.fillStyle='#4f7a5a';g.fill(C.fr);g.fillStyle='rgba(190,220,240,.35)';g.fill(C.fr);
    // терем за плетнём (z 22) и две берёзы
    drawTerem(g,-3.2,27);drawBirch(g,6.6,31,2);drawBirch(g,4.2,22,0);drawBirch(g,-7.2,20,1);}
  function drawTerem(g,x,z){const b=P(x,z),k=b.k,w=3.6*k,h=2.6*k,y=b.y;g.save();
    // сруб
    const lg=g.createLinearGradient(0,y-h,0,y);lg.addColorStop(0,'#c98a4a');lg.addColorStop(1,'#8a5528');g.fillStyle=lg;g.fillRect(b.x-w/2,y-h,w,h);
    g.strokeStyle='rgba(70,36,14,.55)';g.lineWidth=Math.max(1,k*.05);for(let i=1;i<9;i++){const yy=y-h*i/9;g.beginPath();g.moveTo(b.x-w/2,yy);g.lineTo(b.x+w/2,yy);g.stroke();}
    // окна с наличниками
    for(const s of[-1,1]){const wx=b.x+s*w*.24,wy=y-h*.62,ww=w*.17,wh=h*.32;g.fillStyle='#fff3c8';g.fillRect(wx-ww/2-k*.06,wy-wh/2-k*.06,ww+k*.12,wh+k*.12);g.fillStyle='#3a5a8a';g.fillRect(wx-ww/2,wy-wh/2,ww,wh);
      g.fillStyle='rgba(255,240,180,.55)';g.fillRect(wx-ww/2,wy-wh/2,ww*.45,wh*.45);g.fillStyle='#e6b53a';g.beginPath();g.moveTo(wx-ww/2-k*.1,wy-wh/2-k*.06);g.lineTo(wx,wy-wh/2-k*.32);g.lineTo(wx+ww/2+k*.1,wy-wh/2-k*.06);g.closePath();g.fill();}
    // крыша-шатёр с коньком
    g.beginPath();g.moveTo(b.x-w*.62,y-h);g.lineTo(b.x,y-h-w*.58);g.lineTo(b.x+w*.62,y-h);g.closePath();const rg=g.createLinearGradient(b.x-w*.6,0,b.x+w*.6,0);rg.addColorStop(0,'#c0392b');rg.addColorStop(1,'#7a1c1a');g.fillStyle=rg;g.fill();
    g.strokeStyle='#4a1a10';g.lineWidth=Math.max(1,k*.06);g.stroke();g.strokeStyle='rgba(255,220,160,.5)';for(let i=1;i<6;i++){g.beginPath();g.moveTo(b.x-w*.62+i*w*.2,y-h);g.lineTo(b.x,y-h-w*.58);g.stroke();}
    // петушок на коньке
    const px=b.x,py=y-h-w*.58;g.fillStyle='#e6b53a';g.beginPath();g.ellipse(px,py-k*.18,k*.16,k*.12,0,0,Math.PI*2);g.fill();g.beginPath();g.moveTo(px+k*.12,py-k*.24);g.lineTo(px+k*.26,py-k*.36);g.lineTo(px+k*.2,py-k*.16);g.fill();
    g.restore();}
  function drawBirch(g,x,z,i){const b=P(x,z),k=b.k,h=7*k,t=G.t;g.save();
    g.fillStyle='#f4efe4';g.fillRect(b.x-k*.12,b.y-h,k*.24,h);g.fillStyle='#2a2420';for(let j=0;j<9;j++){g.fillRect(b.x-k*.12+(j%2?k*.1:0),b.y-h*(j+.5)/9,k*.12,k*.05);}
    const sw=Math.sin(t*.9+i)*k*.08;for(const [dx,dy,r] of[[0,-1,1.6],[-.9,-.82,1.2],[.9,-.8,1.25],[-.4,-.62,1.1],[.5,-.6,1.1]]){const gx=b.x+dx*k+sw,gy=b.y-h*(-dy)+0,rr=r*k;
      const gr=g.createRadialGradient(gx-rr*.3,gy-rr*.3,rr*.2,gx,gy,rr);gr.addColorStop(0,'#a8d86a');gr.addColorStop(1,'#4f8a3a');g.fillStyle=gr;g.beginPath();g.arc(gx,gy,rr,0,Math.PI*2);g.fill();}
    g.restore();}
  function drawYard(g,W,H){const hy=V.hy;
    // земля: дальний луг → вытоптанный двор
    const yb=P(0,GK.FENCE).y,gr=g.createLinearGradient(0,hy,0,H);gr.addColorStop(0,'#8fbf5a');gr.addColorStop(Math.max(0,Math.min(1,(yb-hy)/(H-hy))),'#a7b55a');gr.addColorStop(1,'#b8925a');
    g.fillStyle=gr;g.fillRect(0,hy,W,H-hy);
    // пятна травы и вытоптанной земли (по зерну)
    const rr=mulberry(seed+3);for(let i=0;i<70;i++){const x=(rr()-.5)*9,z=rr()*14-1.2,p=P(x,z),r=(.25+rr()*.5)*p.k;g.fillStyle=i%3?'rgba(150,110,60,.09)':'rgba(110,170,70,.16)';g.beginPath();g.ellipse(p.x,p.y,r,r*.3*(1+z*.02),0,0,Math.PI*2);g.fill();}
    for(let i=0;i<40;i++){const x=(rr()-.5)*10,z=rr()*13-1,p=P(x,z);if(Math.abs(x)<1.4&&z>-.5&&z<GK.CZ+GK.CD+.5)continue;g.fillStyle=i%3?'#fff8e0':i%2?'#ffd84a':'#e8a0c8';g.beginPath();g.arc(p.x,p.y,Math.max(1.5,p.k*.03),0,Math.PI*2);g.fill();}
    // травинки
    g.strokeStyle='rgba(70,110,40,.55)';g.lineWidth=1.2;for(let i=0;i<46;i++){const x=(rr()-.5)*10,z=rr()*12-1,p=P(x,z),h=p.k*.12;if(Math.abs(x)<1.3&&z>GK.CZ-.5&&z<GK.CZ+GK.CD+.5)continue;
      g.beginPath();g.moveTo(p.x-h*.3,p.y);g.lineTo(p.x-h*.5,p.y-h);g.moveTo(p.x,p.y);g.lineTo(p.x+h*.1,p.y-h*1.2);g.moveTo(p.x+h*.3,p.y);g.lineTo(p.x+h*.6,p.y-h*.9);g.stroke();}
    drawFence(g,W);
    // кот на плетне, подсолнухи у плетня
    const fc=P(2.6,GK.FENCE,1.0);K.art(g,'kot',fc.x,fc.y-fc.k*.12,fc.k*.6,{flip:true});const vp=P(-1.9,GK.FENCE,1.0);K.art(g,'voron',vp.x,vp.y-vp.k*.14,vp.k*.5);
    for(const [x,i] of[[-3.6,0],[-3.0,1],[4.2,2],[4.8,3]])drawSun(g,x,GK.FENCE-.15,i);
    drawHens(g);drawWood(g,-2.7,4.6);drawStump(g,2.5,3.6);{const kp=P(3.7,8.6),j=Math.abs(Math.sin(G.t*2.6))*kp.k*.18;K.art(g,'kolo',kp.x,kp.y-kp.k*.25-j,kp.k*.55);}}
  // поленница сбоку двора
  function drawWood(g,x,z){const p=P(x,z),k=p.k,w=1.3*k,h=.75*k;g.save();g.fillStyle='rgba(40,24,10,.25)';g.beginPath();g.ellipse(p.x,p.y,w*.6,k*.1,0,0,Math.PI*2);g.fill();
    g.fillStyle='#6a4020';g.fillRect(p.x-w/2,p.y-h,w,h);const r=k*.085;for(let row=0;row<4;row++)for(let i=0;i<7;i++){const cx=p.x-w/2+r+(i+(row%2)*.5)*(w-2*r)/6.5,cy=p.y-r-row*r*1.85;if(cx>p.x+w/2-r)continue;
      g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.fillStyle=(i+row)%3?'#e8c890':'#d8b070';g.fill();g.lineWidth=1;g.strokeStyle='#6a4020';g.stroke();g.beginPath();g.arc(cx,cy,r*.45,0,Math.PI*2);g.strokeStyle='rgba(120,70,30,.5)';g.stroke();}
    g.beginPath();g.moveTo(p.x-w*.6,p.y-h);g.lineTo(p.x,p.y-h-k*.32);g.lineTo(p.x+w*.6,p.y-h);g.closePath();g.fillStyle='#8a5a2e';g.fill();g.strokeStyle='#4a2a10';g.lineWidth=1.5;g.stroke();g.restore();}
  function drawStump(g,x,z){const p=P(x,z),k=p.k;K.art(g,'d_stump',p.x,p.y-k*.16,k*.78);K.art(g,'pie',p.x+k*.04,p.y-k*.34,k*.34);}
  // куры гуляют у плетня
  function drawHens(g){const t=G.t;for(let i=0;i<3;i++){const x=-1.6+i*1.5+Math.sin(t*.35+i*2)*.9,z=13.4+i*.8,p=P(x,z),k=p.k,dir=Math.cos(t*.35+i*2)>0?1:-1,peck=Math.max(0,Math.sin(t*3+i*5))>.85?k*.06:0;
    g.save();g.translate(p.x,p.y);g.scale(dir,1);ell(g,0,-k*.02,k*.16,k*.03,'rgba(40,24,10,.2)',{ol:false,flat:true});ln(g,[-k*.03,-k*.02,-k*.03,-k*.1,k*.03,-k*.02,k*.03,-k*.1],'#e0902a',Math.max(1,k*.015));
    ell(g,0,-k*.2,k*.14,k*.11,i===1?'#a8642a':'#f4efe4');ell(g,k*.12,-k*.3+peck,k*.065,k*.065,i===1?'#a8642a':'#f4efe4');poly(g,[k*.17,-k*.31+peck,k*.23,-k*.29+peck,k*.17,-k*.27+peck],'#f0b43a',{ol:false});
    ell(g,k*.11,-k*.37+peck,k*.03,k*.03,'#e0332a',{ol:false});ell(g,-k*.12,-k*.24,k*.05,k*.08,i===1?'#7a4418':'#d8d0c0',{rot:-.6});g.restore();}}
  function drawFence(g,W){const z=GK.FENCE,l=P(-9,z),r=P(9,z),k=P(0,z).k,h=1.0*k;g.save();
    g.fillStyle='#7a5430';for(let x=-9;x<=9;x+=.55){const p=P(x,z);g.fillRect(p.x-k*.045,p.y-h*1.08,k*.09,h*1.08);}
    // плетень: переплетённые прутья
    for(let row=0;row<6;row++){const y0=l.y-h*(row+.5)/6.2;g.strokeStyle=row%2?'#a87444':'#8a5a2e';g.lineWidth=Math.max(1.5,k*.08);g.beginPath();
      for(let x=-9;x<=9;x+=.275){const p=P(x,z),w=((Math.round(x/.275)+row)%2?1:-1)*k*.035;x<=-9?g.moveTo(p.x,y0+w):g.lineTo(p.x,y0+w);}g.stroke();}
    g.fillStyle='rgba(40,20,8,.18)';g.fillRect(l.x,l.y-2,r.x-l.x,4);g.restore();}
  function drawSun(g,x,z,i){const p=P(x,z),k=p.k,h=1.7*k,sw=Math.sin(G.t*1.2+i)*k*.05;g.strokeStyle='#4f8a3a';g.lineWidth=Math.max(1.5,k*.06);g.beginPath();g.moveTo(p.x,p.y);g.quadraticCurveTo(p.x+sw,p.y-h*.5,p.x+sw*2,p.y-h);g.stroke();
    const cx=p.x+sw*2,cy=p.y-h,r=k*.24;g.fillStyle='#ffc93a';for(let j=0;j<12;j++){const a=j/12*Math.PI*2;g.beginPath();g.ellipse(cx+Math.cos(a)*r,cy+Math.sin(a)*r,r*.55,r*.22,a,0,Math.PI*2);g.fill();}
    g.fillStyle='#6a3a14';g.beginPath();g.arc(cx,cy,r*.7,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,220,120,.35)';g.beginPath();g.arc(cx-r*.2,cy-r*.2,r*.25,0,Math.PI*2);g.fill();}
  function chalk(g,pts,w){g.beginPath();pts.forEach((q,i)=>{const p=P(q[0],q[1]);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y);});g.lineWidth=w;g.strokeStyle='rgba(255,255,250,.9)';g.lineCap='round';g.stroke();}
  function drawCity(g){const z0=GK.CZ,z1=GK.CZ+GK.CD,w=GK.CW,k=P(0,z0).k;
    // утоптанная площадка города
    g.beginPath();[[-w,z0],[w,z0],[w,z1],[-w,z1]].forEach((q,i)=>{const p=P(q[0],q[1]);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y);});g.closePath();g.fillStyle='rgba(205,170,110,.55)';g.fill();
    chalk(g,[[-w,z0],[w,z0],[w,z1],[-w,z1],[-w,z0]],Math.max(2,k*.05));
    // штрихи-«лапки» по углам и черта кона
    chalk(g,[[-2.2,0],[2.2,0]],Math.max(2.5,P(0,0).k*.04));for(const s of[-1,1]){const p=P(s*2.2,0);g.fillStyle='#8a5a2e';g.fillRect(p.x-3,p.y-p.k*.35,6,p.k*.35);}
    // дорожка от кона к городу
    g.save();g.globalCompositeOperation='multiply';g.beginPath();[[-.8,0],[.8,0],[1.1,z0],[-1.1,z0]].forEach((q,i)=>{const p=P(q[0],q[1]);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y);});g.closePath();g.fillStyle='rgba(220,190,150,.45)';g.fill();g.restore();}
  // рюха: деревянный цилиндр (берёза) в проекции; o — как лежит; s — масштаб (px на метр), rot — поворот при полёте
  function drawRuha(g,x,y,o,k,rot){const L2=GK.RL*k,R=Math.max(2,GK.RR*k*1.15);g.save();g.translate(x,y);
    ell(g,0,R*.5,o==='x'?L2*.55:R*1.6,R*.45,'rgba(40,24,10,.28)',{ol:false,flat:true});
    if(rot)g.rotate(rot);
    if(o==='v'){const h=L2;const gr=g.createLinearGradient(-R,0,R,0);gr.addColorStop(0,'#c99a5a');gr.addColorStop(.45,'#f2d9a6');gr.addColorStop(1,'#a8743c');g.fillStyle=gr;g.fillRect(-R,-h,R*2,h);
      g.beginPath();g.ellipse(0,0,R,R*.38,0,0,Math.PI);g.fill();g.strokeStyle='#5a3414';g.lineWidth=Math.max(1,R*.16);g.beginPath();g.moveTo(-R,-h);g.lineTo(-R,0);g.ellipse(0,0,R,R*.38,0,Math.PI,0,true);g.lineTo(R,-h);g.stroke();
      g.beginPath();g.ellipse(0,-h,R,R*.38,0,0,Math.PI*2);g.fillStyle='#e8c890';g.fill();g.stroke();g.strokeStyle='rgba(120,70,30,.6)';g.lineWidth=Math.max(.6,R*.08);g.beginPath();g.ellipse(0,-h,R*.5,R*.18,0,0,Math.PI*2);g.stroke();}
    else if(o==='x'){const gr=g.createLinearGradient(0,-R*2,0,0);gr.addColorStop(0,'#f6e0b0');gr.addColorStop(.5,'#d6a868');gr.addColorStop(1,'#9a6a34');g.fillStyle=gr;rrect(g,-L2/2,-R*2,L2,R*2,R*.6);g.fill();
      g.strokeStyle='#5a3414';g.lineWidth=Math.max(1,R*.16);g.stroke();g.fillStyle='#e8c890';g.beginPath();g.ellipse(L2/2-R*.25,-R,R*.35,R*.95,0,0,Math.PI*2);g.fill();g.stroke();
      g.strokeStyle='rgba(60,40,20,.25)';g.lineWidth=1;for(let i=1;i<4;i++){g.beginPath();g.moveTo(-L2/2+L2*i/4,-R*1.9);g.lineTo(-L2/2+L2*i/4+R*.3,-R*1.3);g.stroke();}}
    else{const lz=L2*.32;const gr=g.createLinearGradient(-R,0,R,0);gr.addColorStop(0,'#c99a5a');gr.addColorStop(.45,'#f2d9a6');gr.addColorStop(1,'#a8743c');g.fillStyle=gr;rrect(g,-R,-R*2-lz,R*2,R*2+lz,R*.7);g.fill();g.strokeStyle='#5a3414';g.lineWidth=Math.max(1,R*.16);g.stroke();
      g.beginPath();g.ellipse(0,-R*1.05,R*.92,R*.95,0,0,Math.PI*2);g.fillStyle='#e8c890';g.fill();g.stroke();g.strokeStyle='rgba(120,70,30,.6)';g.lineWidth=Math.max(.6,R*.08);g.beginPath();g.arc(0,-R*1.05,R*.45,0,Math.PI*2);g.stroke();}
    g.restore();}
  function drawObjs(g){const L0=[];
    for(const r of G.R)if(!r.out&&!r.hide)L0.push({z:r.z,f:()=>{const p=P(r.x,r.z);drawRuha(g,p.x,p.y,r.o,p.k,0);}});
    for(const q of G.ghosts){const d=g_dur(q),u=Math.min(1,q.t/d),e=1-Math.pow(1-u,2),x=q.x0+(q.x1-q.x0)*e,z=q.z0+(q.z1-q.z0)*e,y=q.hgt*4*u*(1-u),fade=q.out&&q.t>d?Math.max(0,1-(q.t-d)/1.6):1;
      if(fade<=0)continue;L0.push({z,f:()=>{const p=P(x,z,y),s=P(x,z);g.globalAlpha=fade;ell(g,s.x,s.y,p.k*.16,p.k*.05,'rgba(40,24,10,.25)',{ol:false,flat:true});drawRuha(g,p.x,p.y,u<1?'x':q.o==='v'?'x':q.o,p.k,u<1?q.sp*q.t:0);g.globalAlpha=1;}});}
    const f=G.fly;if(f){const r=f.res;let x,z,y,th;
      if(f.phase==='air'){const u=Math.min(1,f.t/f.T),b=batWorld();x=b.x+(r.xL-b.x)*u;z=b.z+(r.zL-b.z)*u;y=b.y*(1-u)+f.h*4*u*(1-u);th=r.th+(f.th0-r.th)*(1-u);}
      else{x=r.xL;z=r.zL+f.sk;y=.06;th=r.th;}
      L0.push({z,f:()=>{const s=P(x,z);ell(g,s.x,s.y,s.k*GK.BL*.45,s.k*.06,'rgba(30,18,8,.3)',{ol:false,flat:true});drawBat3(g,x,z,y,th);}});}
    L0.sort((a,b)=>b.z-a.z);for(const q of L0)q.f();}
  function batWorld(){return {x:0,z:.25,y:1.0};}
  // бита в мире: отрезок длиной BL, повёрнут в плоскости земли на th (0 — поперёк)
  function drawBat3(g,x,z,y,th){const c=Math.cos(th)*GK.BL/2,s=Math.sin(th)*GK.BL/2,a=P(x-c,z-s,y),b=P(x+c,z+s,y);
    const k=(a.k+b.k)/2;g.save();g.lineCap='round';g.strokeStyle='#4a2a10';g.lineWidth=k*.11+2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
    const gr=g.createLinearGradient(a.x,a.y-k*.05,a.x,a.y+k*.05);g.strokeStyle='#c98a4a';g.lineWidth=k*.11;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
    g.strokeStyle='#f0c88a';g.lineWidth=k*.035;g.beginPath();g.moveTo(a.x,a.y-k*.02);g.lineTo(b.x,b.y-k*.02);g.stroke();
    // толстый конец и обмотка
    g.strokeStyle='#8a2a1a';g.lineWidth=k*.13;g.beginPath();g.moveTo(b.x+(a.x-b.x)*.08,b.y+(a.y-b.y)*.08);g.lineTo(b.x+(a.x-b.x)*.2,b.y+(a.y-b.y)*.2);g.stroke();g.restore();}
  // бита «в руке» (плоская картинка), x,y — середина, s — длина px
  function drawBatShape(g,x,y,s,rot){g.save();g.translate(x,y);g.rotate(rot||0);const w=s*.085;g.lineCap='round';
    g.strokeStyle='#3a2008';g.lineWidth=w+3;g.beginPath();g.moveTo(-s/2,0);g.lineTo(s/2,0);g.stroke();
    const gr=g.createLinearGradient(0,-w/2,0,w/2);gr.addColorStop(0,'#f0c88a');gr.addColorStop(.5,'#c98a4a');gr.addColorStop(1,'#8a5528');g.strokeStyle=gr;g.lineWidth=w;g.beginPath();g.moveTo(-s/2,0);g.lineTo(s/2,0);g.stroke();
    g.strokeStyle='#a83a2a';g.lineWidth=w*1.08;g.beginPath();g.moveTo(-s*.45,0);g.lineTo(-s*.3,0);g.stroke();g.strokeStyle='rgba(255,230,190,.5)';g.lineWidth=1.2;for(let i=0;i<4;i++){const xx=-s*.44+i*s*.04;g.beginPath();g.moveTo(xx,-w*.5);g.lineTo(xx+s*.02,w*.5);g.stroke();}
    g.restore();}
  function drawHandBat(g){const b=batPos(),d=G.drag,len=Math.min(V.W*.62,P(0,.3).k*GK.BL*.95);let x=b.x,y=b.y,rot=-.05;
    if(d&&d.a){x=b.x+(d.x-d.x0)*.55;y=Math.min(V.H-14,b.y+(d.y-d.y0)*.55);rot=-.05-d.a.ax*.3;
      // резинка-«натяжка»: две нити от места хвата
      g.strokeStyle='rgba(255,240,200,.55)';g.lineWidth=2;g.setLineDash([4,5]);g.beginPath();g.moveTo(b.x,b.y);g.lineTo(x,y);g.stroke();g.setLineDash([]);}
    else if(G.state==='aim')y+=Math.sin(G.t*2.4)*3;
    K.glow(g,x,y,len*.5,'#fff3c8',.25);drawBatShape(g,x,y,len,rot);
    if(G.hint&&G.state==='aim'&&!d){const q=(G.t*.7)%1,hx=b.x+len*.05,hy=b.y+q*Math.min(V.W,V.H)*.22;K.hand(g,hx,hy+16,44,q<.15);
      K.txt(g,pc?L('Зажми и тяни вниз — назад','Press and pull down — back'):L('Тяни биту вниз — назад','Pull the bat down — back'),V.W/2,b.y-(V.port?118:64),V.W<380?17:19,'#fff8e0',{mw:V.W-30});}}
  function drawAim(g){const d=G.drag;if(G.state!=='aim'||!d||!d.a||d.a.pow<.08)return;const a=d.a,ld=gkLand(a.pow,a.ax),b=batWorld(),stopZ=GK.CZ,over=ld.zL>stopZ;
    const H0=.45+a.pow*.9,n=18;let lastP=null;
    for(let i=1;i<=n;i++){const u=i/n,z=b.z+(ld.zL-b.z)*u;if(z>stopZ){break;}const x=b.x+(ld.xL-b.x)*u,y=b.y*(1-u)+H0*4*u*(1-u),p=P(x,z,y);
      g.beginPath();g.arc(p.x,p.y,Math.max(2.5,p.k*.05),0,Math.PI*2);g.fillStyle='rgba(255,244,200,'+(1-u*.5)+')';g.fill();g.lineWidth=1.3;g.strokeStyle='rgba(90,50,10,.6)';g.stroke();lastP=p;}
    if(!over){const p=P(ld.xL,ld.zL),k=p.k;g.save();g.strokeStyle='rgba(255,250,220,.95)';g.lineWidth=2.5;g.beginPath();g.ellipse(p.x,p.y,k*.3,k*.08,0,0,Math.PI*2);g.stroke();
      g.setLineDash([5,5]);const e=P(ld.xL,ld.zL+gkSkid(a.pow));g.beginPath();g.moveTo(p.x,p.y);g.lineTo(e.x,e.y);g.strokeStyle='rgba(255,250,220,.55)';g.stroke();g.setLineDash([]);g.restore();}
    else if(lastP){const p=P(ld.xL*(stopZ-b.z)/(ld.zL-b.z),stopZ);K.txt(g,'?',p.x,p.y-p.k*.6,Math.max(18,p.k*.3),'#fff3c8');}
    // сила
    const bw=Math.min(220,V.W*.5),bx=V.W/2-bw/2,by=Math.min(V.H-18,batPos().y+38);{rrect(g,bx,by,bw,12,6);g.fillStyle='rgba(30,16,6,.55)';g.fill();const gr=g.createLinearGradient(bx,0,bx+bw,0);gr.addColorStop(0,'#8ad04a');gr.addColorStop(.6,'#f0c43a');gr.addColorStop(1,'#e0482a');
      rrect(g,bx+2,by+2,Math.max(4,(bw-4)*a.pow),8,4);g.fillStyle=gr;g.fill();}}
  function drawHero(g,W,H){const p=P(-1.55,-.2),s=Math.min(V.port?W*.3:H*.26,p.k*1.2),bob=Math.sin(G.t*2.2)*2;
    K.art(g,K.heroKey(),Math.max(s*.5,p.x),Math.min(H-s*.42,p.y)+bob,s,{flip:false});}

  function drawHUD(g,W,H){const top=8+(V.port?4:0),fs=W<380?15:17;
    // плашка: фигура
    const f=FIG[G.fig%FIG.length],nm=f.n(),pw=Math.min(W-90,Math.max(170,K.tw(g,nm,fs+2)+92));K.plate(g,10,top,pw,46);
    K.txt(g,L('Фигура','Figure'),22,top+15,12,'#e6c98a',{al:'left',ol:false,sh:false,w:700});K.txt(g,nm,22,top+32,fs+1,'#fff3c8',{al:'left',mw:pw-90});
    // мини-схема фигуры
    const mx=10+pw-38,my=top+24;g.save();rrect(g,mx-26,my-18,52,36,6);g.fillStyle='rgba(255,240,200,.12)';g.fill();for(const r of G.R){const x=mx+r.x*20,y=my+(r.z-7.5)*-14;g.fillStyle=r.out?'rgba(255,255,255,.18)':'#f2d9a6';
      if(r.o==='x')g.fillRect(x-6,y-1.6,12,3.2);else if(r.o==='z')g.fillRect(x-1.6,y-5,3.2,10);else{g.beginPath();g.arc(x,y,2.6,0,Math.PI*2);g.fill();}}g.restore();
    // биты
    const y2=top+54,bw2=Math.min(W-20,G.bats*30+86);K.plate(g,10,y2,bw2,36);K.txt(g,L('Биты','Bats'),20,y2+18,13,'#e6c98a',{al:'left',ol:false,sh:false,w:700});
    for(let i=0;i<G.bats;i++){const used=i<G.bat;g.globalAlpha=used?.28:1;drawBatShape(g,74+i*30+12,y2+18,24,-.6);g.globalAlpha=1;}
    // счёт
    const sw=118,sx=W-sw-10-(W<520?52:62);K.plate(g,sx,top,sw,46);K.txt(g,L('Рюх','Pins'),sx+12,top+15,12,'#e6c98a',{al:'left',ol:false,sh:false,w:700});K.txt(g,String(G.score),sx+sw-14,top+25,26,'#ffd24a',{al:'right'});
    const nx=GK.TIERS.find(t=>t>G.score);if(nx)K.txt(g,L('до звезды: ','next star: ')+(nx-G.score),sx+12,top+36,11,'#fff3c8',{al:'left',ol:false,sh:false,w:700});
    // ступени
    K.plate(g,sx+sw-76,y2,76,30,{r:12});for(let i=0;i<3;i++)K.star(g,sx+sw-58+i*20,y2+15,8,G.score>=GK.TIERS[i],false);
    if(G.msg&&!END.on()){const a=G.msg.t<.15?G.msg.t/.15:G.msg.t>1.5?Math.max(0,1-(G.msg.t-1.5)/.4):1;g.globalAlpha=a;K.txt(g,G.msg.s,W/2,P(0,GK.CZ-.9).y,W<380?22:28,G.msg.col,{mw:W-30});g.globalAlpha=1;}
    if(G.banner&&!END.on()){const b=G.banner,a=b.t<.2?b.t/.2:b.t>1.4?Math.max(0,1-(b.t-1.4)/.4):1,sc=calm?1:1+Math.max(0,.3-b.t)*1.2;g.save();g.globalAlpha=a;g.translate(W/2,H*.5);g.scale(sc,sc);
      K.ribbon(g,0,0,Math.min(W-40,380),b.s,W<380?22:26);K.txt(g,b.sub,0,44,18,'#fff3c8');g.restore();}}
}

/* ---------- значок забавы: две рюхи и бита ---------- */
if(typeof art==='function')art('zbb_i4',64,g=>{ell(g,0,24,26,6,'rgba(0,0,0,.18)',{ol:false,flat:true});
  for(const s of[-1,1]){g.save();g.translate(s*13,10);rrect(g,-6,-22,12,24,4);const gr=g.createLinearGradient(-6,0,6,0);gr.addColorStop(0,'#c99a5a');gr.addColorStop(.45,'#f2d9a6');gr.addColorStop(1,'#a8743c');g.fillStyle=gr;g.fill();g.lineWidth=1.6;g.strokeStyle='#5a3414';g.stroke();
    g.beginPath();g.ellipse(0,-22,6,2.4,0,0,Math.PI*2);g.fillStyle='#e8c890';g.fill();g.stroke();g.restore();}
  g.save();g.rotate(-.55);g.lineCap='round';g.strokeStyle='#3a2008';g.lineWidth=9;g.beginPath();g.moveTo(-26,0);g.lineTo(26,0);g.stroke();g.strokeStyle='#c98a4a';g.lineWidth=6;g.beginPath();g.moveTo(-26,0);g.lineTo(26,0);g.stroke();
  g.strokeStyle='#a83a2a';g.lineWidth=7;g.beginPath();g.moveTo(-24,0);g.lineTo(-16,0);g.stroke();g.strokeStyle='#f0c88a';g.lineWidth=2;g.beginPath();g.moveTo(-12,-1.5);g.lineTo(24,-1.5);g.stroke();g.restore();});

zbbK.reg({id:'gorodki',num:4,n:zabN('Городки','Gorodki'),icon:'zbb_i4',kind:'week',en:true,open:()=>true,
  run:gkRun,sim:gkSim,bot:gkSim,tiers:GK.TIERS,_gk:{GK,FIG,gkFig,gkThrow,gkNoise,gkLand,gkTier}});
})();
