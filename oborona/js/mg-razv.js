'use strict';
/* ================= OB:MGD №7 «Разведка тропы» (id razv, kind 'prep') =================
   Лабиринт по зерну (o.seed + глава Логова; у всех одинаковый), туман открывается по ходу, корни-ловушки Лешего, три пера жар-птицы.
   Веди пальцем (разведчик идёт за пальцем), касание по открытой тропе — сам дойдёт, клавиши — стрелки/WASD. Без таймера.
   Итог — «Донесение разведчика»: состав волн Логова из mkWaves(глава,6) (та же функция и то же зерно, что у боя; бой не меняется).
   Счёт: 100 − 20 за корни + 10 за перо + до 20 за короткий путь (макс. 150); ступени 120/85/дошёл. */
(function(){
const ID='razv',DIRS=[[1,0],[-1,0],[0,1],[0,-1]];

/* ---------- Логово и его волны ---------- */
function lairCh(o){if(o&&o.ch==null&&o.ctx&&o.ctx.lair!=null)o.ch=o.ctx.lair;/* OB:FINAL оболочка даёт ctx.lair */if(o&&o.ch!=null&&CH[o.ch]&&CH[o.ch].lair)return o.ch;const ord=(typeof CH_ORDER!=='undefined'?CH_ORDER:CH.map((_,i)=>i)).filter(c=>CH[c]&&CH[c].lair);
  let last=null;for(const c of ord)if(S.stars&&S.stars[c+'-5']){if(!S.stars[c+'-6'])return c;last=c;}return last!=null?last:ord[0];}
function lairWaves(c){let ws=[];try{ws=mkWaves(c,6);}catch(e){return [];}
  return ws.map(w=>{const out=[];for(const g of w.g){const o=out.find(x=>x.t===g.t&&!x.lead===!g.lead);if(o)o.n+=g.n;else{const d=EN[g.t]||{};out.push({t:g.t,n:g.n,lead:!!g.lead,boss:!!d.boss,fly:!!d.fly,art:d.art||g.t});}}return out;});}
function lairName(c){const l=CH[c]&&CH[c].levels;return l&&l[6]?l[6]:Lg('Логово','Lair');}

/* ---------- лабиринт ---------- */
function dims(lvl){return lvl>=6?[8,12]:lvl>=3?[7,11]:[6,9];}
function genMaze(seed,lvl){const R=mulberry(seed>>>0),[cw,chh]=dims(lvl),BW=cw*2+1,BH=chh*2+1,m=new Uint8Array(BW*BH),I=(x,y)=>y*BW+x;
  const vis=new Uint8Array(cw*chh),st=[[0,chh-1]];vis[(chh-1)*cw]=1;m[I(1,BH-2)]=1;
  while(st.length){const [x,y]=st[st.length-1],nb=[];for(const [dx,dy] of DIRS){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<cw&&ny<chh&&!vis[ny*cw+nx])nb.push([nx,ny,dx,dy]);}
    if(!nb.length){st.pop();continue;}const [nx,ny,dx,dy]=nb[Math.floor(R()*nb.length)];vis[ny*cw+nx]=1;m[I(2*x+1+dx,2*y+1+dy)]=1;m[I(2*nx+1,2*ny+1)]=1;st.push([nx,ny]);}
  // петли: часть тупиков открываем — есть обходы вокруг корней
  for(let y=0;y<chh;y++)for(let x=0;x<cw;x++){const bx=2*x+1,by=2*y+1;let n=0;for(const [dx,dy] of DIRS)if(m[I(bx+dx,by+dy)])n++;
    if(n===1&&R()<.42){const c=DIRS.filter(([dx,dy])=>{const wx=bx+dx,wy=by+dy;return wx>0&&wy>0&&wx<BW-1&&wy<BH-1&&!m[I(wx,wy)];});if(c.length){const [dx,dy]=c[Math.floor(R()*c.length)];m[I(bx+dx,by+dy)]=1;}}}
  const S0=I(1,BH-2),G0=I(BW-2,1),trap=new Uint8Array(BW*BH),feat=[];
  const ok=i=>{const d=bfs(m,BW,BH,S0,trap);return d.dist[G0]>=0;};
  const path=()=>{const d=bfs(m,BW,BH,S0,trap),p=[];let i=G0;while(i!==S0&&i>=0){p.push(i);i=d.prev[i];}return p.reverse();};
  const far=i=>{const x=i%BW,y=i/BW|0;return Math.abs(x-1)+Math.abs(y-(BH-2))>2&&Math.abs(x-(BW-2))+Math.abs(y-1)>2;};
  const NT=Math.min(9,4+Math.floor(lvl/2));let tries=0;
  for(let k=0;k<NT&&tries<400;tries++){const onP=k<Math.ceil(NT*.6),pool=onP?path():[];let i;
    if(onP){const c=pool.filter(far);if(!c.length)continue;i=c[Math.floor(R()*c.length)];}else{i=Math.floor(R()*BW*BH);if(!m[i]||!far(i)||trap[i])continue;}
    trap[i]=1;if(!ok()){trap[i]=0;continue;}k++;}
  // перья — в дальних тупиках, не на верном пути
  const sol=new Set(path()),dE=[];for(let i=0;i<BW*BH;i++){if(!m[i]||trap[i]||sol.has(i)||i===S0||i===G0)continue;let n=0;const x=i%BW,y=i/BW|0;for(const [dx,dy] of DIRS)if(m[I(x+dx,y+dy)])n++;if(n===1)dE.push(i);}
  for(let k=0;k<3&&dE.length;k++){let bi=0,bv=-1;for(let j=0;j<dE.length;j++){const i=dE[j];let v=R()*3;for(const f of feat)v+=Math.min(8,Math.abs(f%BW-i%BW)+Math.abs((f/BW|0)-(i/BW|0)));if(v>bv){bv=v;bi=j;}}feat.push(dE[bi]);dE.splice(bi,1);}
  const best=path().length;
  return {BW,BH,m,S0,G0,trap,feat,best};}
function bfs(m,BW,BH,s,block,known){const N=BW*BH,dist=new Int32Array(N).fill(-1),prev=new Int32Array(N).fill(-1),q=[s];dist[s]=0;
  for(let h=0;h<q.length;h++){const i=q[h],x=i%BW,y=i/BW|0;for(const [dx,dy] of DIRS){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=BW||ny>=BH)continue;const j=ny*BW+nx;
    if(!m[j]||dist[j]>=0||(block&&block[j])||(known&&!known[j]))continue;dist[j]=dist[i]+1;prev[j]=i;q.push(j);}}return {dist,prev};}
function route(Z,from,to,block,known){const d=bfs(Z.m,Z.BW,Z.BH,from,block,known);if(d.dist[to]<0)return null;const p=[];let i=to;while(i!==from){p.push(i);i=d.prev[i];}return p.reverse();}

/* ---------- счёт ---------- */
function scoreOf(hits,feathers,steps,best){const eff=Math.round(20*clamp(1-(steps-best)/(best*1.2),0,1));return Math.max(0,100-20*hits+10*feathers+eff);}
function tierOf(sc,reached){return !reached?0:sc>=120?3:sc>=85?2:1;}
// бот без экрана: good — обходит корни и собирает перья, mid — 1 корень и 1 перо, bad — 3 корня, без перьев, плутает
function botSim(q,o){o=o||{};const lvl=o.lvl==null?3:o.lvl,Z=genMaze(((o.seed|0)^0x5a17)+lairCh(o)*7919,lvl);
  if(q==='good'){let pos=Z.S0,steps=0,got=0;for(const f of Z.feat){const a=route(Z,pos,f,Z.trap),b=route(Z,f,Z.G0,Z.trap),c=route(Z,pos,Z.G0,Z.trap);if(a&&b&&c&&a.length+b.length-c.length<=10){steps+=a.length;pos=f;got++;}}
    steps+=route(Z,pos,Z.G0,Z.trap).length;const sc=scoreOf(0,got,steps,Z.best);return {score:sc,tier:tierOf(sc,1)};}
  if(q==='mid'){const sc=scoreOf(1,1,Math.round(Z.best*1.5),Z.best);return {score:sc,tier:tierOf(sc,1)};}
  const sc=scoreOf(3,0,Math.round(Z.best*3),Z.best);return {score:sc,tier:tierOf(sc,1)};}

/* ---------- игра ---------- */
function run(host,o){o=Object.assign({},o||{});{const m=/[?&]mgbot=(good|mid|bad)/.exec(location.search);if(m&&!o.bot)o.bot=m[1];}const st=MGD.stage(host),g=st.g,lvl=o.lvl==null?(typeof chaptersDone==='function'?chaptersDone():3):o.lvl,calm=!!o.calm;
  const c=lairCh(o),seed=((o.seed|0)^0x5a17)+c*7919,Z0=genMaze(seed,lvl),waves=lairWaves(c),boss=CH[c].boss,bossArt=(EN[boss]&&EN[boss].art)||boss;
  // альбом — лабиринт поворачиваем (тот же лабиринт, только набок)
  const wide=st.W>st.H*1.1;let Z=Z0;
  if(wide){const BW=Z0.BH,BH=Z0.BW,T=i=>{const x=i%Z0.BW,y=i/Z0.BW|0;return (Z0.BW-1-x)*BW+(Z0.BH-1-y);};   // поворот: старт слева, Логово справа
    const m=new Uint8Array(BW*BH),tr=new Uint8Array(BW*BH);for(let i=0;i<Z0.m.length;i++){m[T(i)]=Z0.m[i];tr[T(i)]=Z0.trap[i];}
    Z={BW,BH,m,trap:tr,S0:T(Z0.S0),G0:T(Z0.G0),feat:Z0.feat.map(T),best:Z0.best};}
  const {BW,BH,m}=Z,N=BW*BH,known=new Uint8Array(N),sprung=new Uint8Array(N),featGot=new Uint8Array(N),RV=calm?3.2:2.4;
  const S={x:Z.S0%BW,y:Z.S0/BW|0,fx:0,fy:0,p:1,dir:1,stuck:0,steps:0,hits:0,feathers:0,walk:0,route:[]},foot=[];
  let B=48,M=0,ground=null,fogMask=null,FMK=6,camX=0,camY=0,phase='intro',hintT=0,hintUsed=false,endT=0,leshy=null,doneSent=false,shake=0,lastMoveT=0;
  const flies=[];for(let i=0;i<14;i++)flies.push({x:Math.random(),y:Math.random(),p:Math.random()*TAU,s:.5+Math.random()});
  
  /* --- размеры и фон --- */
  function layout(){B=Math.round(clamp(Math.min(st.W/7.2,st.H/9.5),40,78));M=Math.round(B*1.6);bakeGround();bakeFog();snapCam();}
  st.onResize=layout;
  const isP=(x,y)=>x>=0&&y>=0&&x<BW&&y<BH&&m[y*BW+x]===1;
  function treeOf(x,y){const h=hash(x,y,seed&1023);return h<.46?['d_pine',1.62]:h<.7?['d_oak',1.7]:h<.86?['d_bush',1.05]:h<.92?['d_snowpine',0]:h<.96?['d_stone',.7]:['d_stump',.75];}
  function bakeGround(){const Wp=BW*B+M*2,Hp=BH*B+M*2,k=Math.min(st.dpr,Math.sqrt(7e6/(Wp*Hp)));ground={c:mkCanvas(Wp*k,Hp*k),k};const q=ground.c.getContext('2d');q.scale(k,k);q.lineCap='round';q.lineJoin='round';
    // трава с пятнами света и тени
    let gr=q.createLinearGradient(0,0,Wp,Hp);gr.addColorStop(0,'#3d7a35');gr.addColorStop(.5,'#4a8a3a');gr.addColorStop(1,'#356e30');q.fillStyle=gr;q.fillRect(0,0,Wp,Hp);
    for(let i=0;i<Wp*Hp/900;i++){const x=hash(i,3,seed)*Wp,y=hash(i,5,seed)*Hp,r=B*(.3+hash(i,7,seed)*.9);q.fillStyle=hash(i,9,seed)<.5?'rgba(20,50,15,.10)':'rgba(170,220,90,.07)';q.beginPath();q.ellipse(x,y,r,r*.7,0,0,TAU);q.fill();}
    q.strokeStyle='rgba(120,180,70,.45)';q.lineWidth=1.3;for(let i=0;i<Wp*Hp/420;i++){const x=hash(i,11,seed)*Wp,y=hash(i,13,seed)*Hp,s=B*.09;q.beginPath();q.moveTo(x-s,y);q.lineTo(x-s*.4,y-s*1.6);q.moveTo(x,y);q.lineTo(x+s*.1,y-s*2);q.moveTo(x+s,y);q.lineTo(x+s*.6,y-s*1.5);q.stroke();}
    q.translate(M,M);
    // тропа: тёмная кромка → земля → светлая середина, сглаженно между соседними клетками
    const trail=(w,col)=>{q.strokeStyle=col;q.lineWidth=B*w;q.beginPath();for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){if(!isP(x,y))continue;const cx=x*B+B/2,cy=y*B+B/2;q.moveTo(cx,cy);q.lineTo(cx+.01,cy);
      if(isP(x+1,y)){q.moveTo(cx,cy);q.lineTo(cx+B,cy);}if(isP(x,y+1)){q.moveTo(cx,cy);q.lineTo(cx,cy+B);}}q.stroke();};
    trail(.98,'rgba(30,45,15,.35)');trail(.86,'#7a5a32');trail(.74,'#b08654');trail(.4,'#c39a62');
    for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){if(!isP(x,y))continue;for(let j=0;j<4;j++){const h=hash(x*7+j,y*13,seed),px=x*B+B*(.2+hash(x,y*3+j,seed)*.6),py=y*B+B*(.2+hash(x*5+j,y,seed)*.6);
      if(h<.5){q.fillStyle=h<.25?'#8e6a40':'#d8b884';q.beginPath();q.ellipse(px,py,B*.035+h*B*.05,B*.025+h*B*.03,h*6,0,TAU);q.fill();}}
      if(hash(x,y,seed+9)<.18){const ex=x*B+(hash(x,y,3)<.5?B*.12:B*.88),ey=y*B+B*(.3+hash(x,y,5)*.4);const col=['#f4f0ff','#ffd84a','#ff8ac8','#9ad0ff'][Math.floor(hash(x,y,7)*4)];
        for(let k2=0;k2<5;k2++){q.fillStyle=col;q.beginPath();q.arc(ex+Math.cos(k2*1.256)*B*.05,ey+Math.sin(k2*1.256)*B*.05,B*.035,0,TAU);q.fill();}q.fillStyle='#ffcf3a';q.beginPath();q.arc(ex,ey,B*.03,0,TAU);q.fill();}}
    // тени под кронами
    for(let y=-1;y<=BH;y++)for(let x=-1;x<=BW;x++){if(isP(x,y))continue;q.fillStyle='rgba(15,35,10,.28)';q.beginPath();q.ellipse(x*B+B/2+B*.08,y*B+B*.72,B*.6,B*.3,0,0,TAU);q.fill();}
    // деревья (порядок по y — кроны перекрывают дальние)
    const D=st.dpr*k;
    for(let y=-2;y<=BH+1;y++)for(let x=-2;x<=BW+1;x++){if(isP(x,y))continue;if(x===BW-2&&y<=0)continue;drawTree(q,x,y,k);}
    q.setTransform(1,0,0,1,0,0);}
  function drawTree(q,x,y,k){const [key,s]=treeOf(x,y);if(!s||!ART[key])return drawTreeAlt(q,x,y);const j=(hash(x,y,77)-.5)*B*.18,cx=x*B+B/2+j,cy=y*B+B*.5-B*s*.22;
    MGD.put(q,k||1,key,cx,cy,B*s,hash(x,y,5)<.5);}
  function drawTreeAlt(q,x,y){MGD.put(q,1,'d_pine',x*B+B/2,y*B+B*.5-B*.35,B*1.5,false);}
  function bakeFog(){fogMask=mkCanvas(BW*FMK+FMK*4,BH*FMK+FMK*4);for(let i=0;i<N;i++)if(known[i])paintFog(i,true);}
  function paintFog(i,quiet){const q=fogMask.getContext('2d'),x=(i%BW+2.5)*FMK,y=((i/BW|0)+2.5)*FMK,r=FMK*1.15;const gr=q.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.6,'rgba(0,0,0,.85)');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(x-r,y-r,r*2,r*2);}
  function reveal(x,y){const r=Math.ceil(RV);for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++){if(xx<-1||yy<-1||xx>BW||yy>BH)continue;if(Math.hypot(xx-x,yy-y)>RV)continue;
    if(xx>=0&&yy>=0&&xx<BW&&yy<BH){const i=yy*BW+xx;if(!known[i]){known[i]=1;paintFog(i);}}else paintEdge(xx,yy);}}
  function paintEdge(x,y){const q=fogMask.getContext('2d'),px=(x+2.5)*FMK,py=(y+2.5)*FMK,r=FMK*1.1,gr=q.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(0,0,0,.9)');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(px-r,py-r,r*2,r*2);}

  /* --- камера --- */
  const sX=()=>(S.fx+(S.x-S.fx)*S.p)*B+B/2,sY=()=>(S.fy+(S.y-S.fy)*S.p)*B+B/2;
  const TOP=()=>Math.min(78,st.H*.11),BOT=()=>Math.min(96,st.H*.13);
  function camTarget(){const Wp=BW*B,Hp=BH*B,vw=st.W,vh=st.H-TOP()-BOT();let x=sX()-vw/2,y=sY()-TOP()-vh/2;
    x=Wp+M*1.2<vw?(Wp-vw)/2:clamp(x,-M*.8,Wp-vw+M*.8);y=Hp+M*1.2<vh+TOP()+BOT()?(Hp-st.H)/2:clamp(y,-M*.8-TOP(),Hp-st.H+M*.8+BOT());return [x,y];}
  function snapCam(){const [x,y]=camTarget();camX=x;camY=y;}

  /* --- ходьба --- */
  function canGo(x,y){return isP(x,y);}
  function step(dx,dy){if(S.p<1||S.stuck>0||phase!=='play')return false;const nx=S.x+dx,ny=S.y+dy;if(!canGo(nx,ny))return false;
    S.fx=S.x;S.fy=S.y;S.x=nx;S.y=ny;S.p=0;if(dx)S.dir=dx>0?1:-1;S.steps++;lastMoveT=st.t;return true;}
  function arrive(){const i=S.y*BW+S.x;reveal(S.x,S.y);foot.push({x:S.fx*B+B/2+(S.x-S.fx)*B*.5,y:S.fy*B+B/2+(S.y-S.fy)*B*.5+B*.18,a:Math.atan2(S.y-S.fy,S.x-S.fx),t:st.t});if(foot.length>60)foot.shift();
    if(Math.random()<.5)MGD.fxAdd(st,{k:'dot',x:sX(),y:sY()+B*.32,vx:0,vy:0,r:B*.06,col:'rgba(150,110,60,.6)',dur:.5,world:1});
    if(Z.trap[i]&&!sprung[i]){sprung[i]=1;S.hits++;S.stuck=1.1;S.route=[];shake=.35;MGD.sfx('roots');MGD.sfx('leak');wpuff(sX(),sY()+B*.2,B*.5,6,{col:'#5b3a1c'});wnum(sX(),sY()-B*.7,Lg('Корни!','Roots!'),'#ffb0a0');popLeshy(S.x,S.y);}
    const fi=Z.feat.indexOf(i);if(fi>=0&&!featGot[i]){featGot[i]=1;S.feathers++;MGD.sfx('coin');MGD.sfx('up');wburst(sX(),sY()-B*.3,16,{col:'#ffd84a',r:B*.12,v:B*3});wnum(sX(),sY()-B*.8,'+10','#ffe66a');}
    if(i===Z.G0){phase='end';endT=st.t;S.route=[];MGD.sfx('boss');setTimeout(()=>MGD.sfx('win'),700);wburst(sX(),sY()-B*.5,30,{col:'#ffd84a',r:B*.14,v:B*4});}}
  function popLeshy(x,y){let best=null;for(const [dx,dy] of [[1,0],[-1,0],[0,-1],[0,1],[1,-1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(!isP(nx,ny)){best=[nx,ny];break;}}if(!best)return;
    leshy={x:best[0],y:best[1],t:st.t,say:pick(Lg(['Ха-ха! Заплутал?','Мои корни!','Не ходи в мой лес!','Хо-хо-хо!'],['Ha-ha! Lost?','My roots!','Stay out of my woods!','Ho-ho-ho!']))};setTimeout(()=>MGD.sfx('frog'),250);}
  // частицы — в мировых координатах (переводим в экран при добавлении и сдвигаем вместе с камерой)
  const wfx=[];function wburst(x,y,n,o2){const a=st.fx.length;MGD.burst(st,x,y,n,o2);for(let k=a;k<st.fx.length;k++)st.fx[k].world=1;}
  function wpuff(x,y,r,n,o2){const a=st.fx.length;MGD.puff(st,x,y,r,n,o2);for(let k=a;k<st.fx.length;k++)st.fx[k].world=1;}
  function wnum(x,y,s,col){MGD.num(st,x,y,s,col,Math.max(20,B*.42));st.fx[st.fx.length-1].world=1;}

  /* --- управление --- */
  let steer=null;
  st.onDown=(x,y)=>{if(phase==='intro'){return;}if(phase!=='play')return;steer={x,y};};
  st.onMove=(x,y)=>{if(steer){steer.x=x;steer.y=y;S.route=[];}};
  st.onUp=(x,y,dt,dist)=>{steer=null;if(phase!=='play')return;if(dt<.35&&dist<14){const bx=Math.floor((x+camX)/B),by=Math.floor((y+camY)/B);if(!isP(bx,by))return;const i=by*BW+bx;
      const blk=new Uint8Array(N);for(let j=0;j<N;j++)if(Z.trap[j]&&!sprung[j]&&known[j])blk[j]=1;
      const r=known[i]?route(Z,S.y*BW+S.x,i,blk,known):null;if(r){S.route=r;tapMark={x:bx,y:by,t:st.t};}}};
  let tapMark=null;
  st.onKey=(k,d)=>{if(d&&phase==='intro'&&(k==='Enter'||k===' ')){start();return true;}return /^Arrow|^[wasdWASD]$/.test(k);};
  function think(){if(S.p<1||S.stuck>0||phase!=='play')return;
    if(o.bot&&!S.route.length)botPlan();
    if(S.route.length){const n=S.route[0],nx=n%BW,ny=n/BW|0;if(Math.abs(nx-S.x)+Math.abs(ny-S.y)===1&&step(nx-S.x,ny-S.y)){S.route.shift();return;}S.route=[];}
    const K=st.keys;let kx=(K.ArrowRight||K.d||K.D?1:0)-(K.ArrowLeft||K.a||K.A?1:0),ky=(K.ArrowDown||K.s||K.S?1:0)-(K.ArrowUp||K.w||K.W?1:0);
    if(kx||ky){if(kx&&step(kx,0))return;if(ky&&step(0,ky))return;}
    if(steer){const dx=steer.x-(sX()-camX),dy=steer.y-(sY()-camY);if(Math.hypot(dx,dy)<B*.4)return;const ax=Math.abs(dx),ay=Math.abs(dy);
      const px=[Math.sign(dx),0],py=[0,Math.sign(dy)],[a,b]=ax>=ay?[px,py]:[py,px],sec=Math.min(ax,ay)>Math.max(ax,ay)*.3;
      if(step(a[0],a[1]))return;if(sec&&step(b[0],b[1]))return;}}
  // бот на экране: тот же план, что в botSim
  let botQ=null;function botPlan(){if(botQ)return;const q=o.bot,cur=S.y*BW+S.x;let r=[];
    if(q==='good'){let pos=cur;for(const f of Z.feat){const a=route(Z,pos,f,Z.trap),b=route(Z,f,Z.G0,Z.trap),cc=route(Z,pos,Z.G0,Z.trap);if(a&&b&&cc&&a.length+b.length-cc.length<=10){r=r.concat(a);pos=f;}}r=r.concat(route(Z,pos,Z.G0,Z.trap));}
    else{const tr=[];for(let i=0;i<N;i++)if(Z.trap[i])tr.push(i);const want=q==='mid'?1:3;let pos=cur;
      tr.sort((a,b)=>route(Z,cur,a,null).length-route(Z,cur,b,null).length);for(let k=0;k<want&&k<tr.length;k++){r=r.concat(route(Z,pos,tr[k],null));pos=tr[k];}
      if(q==='mid'&&Z.feat.length){r=r.concat(route(Z,pos,Z.feat[0],null));pos=Z.feat[0];}r=r.concat(route(Z,pos,Z.G0,null));}
    botQ=1;S.route=r;}

  /* --- подсказка воеводы (за рекламу) --- */
  function askHint(){if(hintUsed||phase!=='play')return;const p=host.ad?host.ad('hint'):Promise.resolve(false);st.paused=true;
    Promise.resolve(p).then(ok=>{st.paused=false;if(ok){hintUsed=true;hintT=10;MGD.sfx('up');}}).catch(()=>{st.paused=false;});}
  const adOk=()=>!o.bot&&!!host.ad&&(!host.adOk||host.adOk());

  function start(){if(phase!=='intro')return;phase='play';MGD.sfx('wave');reveal(S.x,S.y);}

  /* ---------- отрисовка ---------- */
  function drawLair(q){const gx=(Z.G0%BW)*B+B/2,gy=(Z.G0/BW|0)*B+B/2,t=st.t,s=B*1.2;
    q.save();q.translate(gx,gy-s*.15);
    // тень и тёмный ореол — холм читается поверх тумана
    q.globalAlpha=.55;q.drawImage(glowSpr('#000000'),-s*2.6,-s*2.4,s*5.2,s*4.2);q.globalAlpha=1;
    q.fillStyle='rgba(0,0,0,.35)';q.beginPath();q.ellipse(0,s*.62,s*1.8,s*.38,0,0,TAU);q.fill();
    // холм: каменистый, со мхом
    let gr=q.createLinearGradient(0,-s*1.9,0,s*.7);gr.addColorStop(0,'#7d8a62');gr.addColorStop(.5,'#5a6244');gr.addColorStop(1,'#33331f');q.fillStyle=gr;
    q.beginPath();q.moveTo(-s*1.9,s*.62);q.bezierCurveTo(-s*1.8,-s*.6,-s*1.1,-s*1.75,-s*.2,-s*1.85);q.bezierCurveTo(s*.9,-s*1.95,s*1.75,-s*.9,s*1.9,s*.62);q.closePath();q.fill();q.strokeStyle='#26261a';q.lineWidth=2.5;q.stroke();
    q.save();q.clip();for(let k=0;k<14;k++){const a=-3+k*.22,r=s*(1.05+hash(k,1,3)*.65);q.fillStyle=['#8a9670','#6b7656','#949d7c','#5a6448'][k%4];q.beginPath();q.ellipse(Math.cos(a)*r*1.05,Math.sin(a)*r*.95+s*.25,s*(.22+hash(k,2,3)*.16),s*(.14+hash(k,4,3)*.1),a,0,TAU);q.fill();q.strokeStyle='rgba(30,30,20,.4)';q.lineWidth=1.2;q.stroke();}
      q.fillStyle='rgba(120,170,70,.55)';for(let k=0;k<9;k++){q.beginPath();q.ellipse(-s*1.4+k*s*.35,-s*1.2-Math.sin(k*.8)*s*.45+Math.abs(k-4)*s*.13,s*.22,s*.09,0,0,TAU);q.fill();}q.restore();
    // каменная арка и пасть
    for(let k=0;k<9;k++){const a=Math.PI+k*Math.PI/8,x=Math.cos(a)*s*.9,y=Math.sin(a)*s*1.05+s*.1;q.fillStyle=k%2?'#9a9a8a':'#82827a';q.beginPath();q.ellipse(x,y,s*.2,s*.17,a,0,TAU);q.fill();q.strokeStyle='#3a3a30';q.lineWidth=1.5;q.stroke();}
    q.fillStyle='#120a08';q.beginPath();q.moveTo(-s*.72,s*.62);q.lineTo(-s*.72,s*.1);q.quadraticCurveTo(-s*.7,-s*.85,0,-s*.85);q.quadraticCurveTo(s*.7,-s*.85,s*.72,s*.1);q.lineTo(s*.72,s*.62);q.closePath();q.fill();
    q.save();q.clip();gr=q.createRadialGradient(0,0,s*.1,0,0,s);gr.addColorStop(0,'rgba(255,90,30,.45)');gr.addColorStop(1,'rgba(255,90,30,0)');q.fillStyle=gr;q.fillRect(-s,-s,s*2,s*2);
      MGD.put(q,st.dpr,bossArt,0,s*.12+Math.sin(t*1.3)*s*.04,s*1.45,false);gr=q.createLinearGradient(0,-s*.9,0,s*.7);gr.addColorStop(0,'rgba(10,5,5,.05)');gr.addColorStop(1,'rgba(10,5,5,.75)');q.fillStyle=gr;q.fillRect(-s,-s,s*2,s*2);q.restore();
    // колья, черепа, факелы
    for(const d of[-1,1]){for(let k=0;k<3;k++){const x=d*(s*.98+k*s*.3),y=s*.6-k*s*.04,hh=s*(.62-k*.12);q.fillStyle='#6a4424';q.beginPath();q.moveTo(x-s*.08,y);q.lineTo(x-s*.05,y-hh);q.lineTo(x,y-hh-s*.12);q.lineTo(x+s*.05,y-hh);q.lineTo(x+s*.08,y);q.closePath();q.fill();q.strokeStyle='#2e1a0a';q.lineWidth=1.3;q.stroke();}
      const tx=d*s*.98,ty=-s*.15,fl=Math.sin(t*14+d*2)*s*.04;q.strokeStyle='#3a2410';q.lineWidth=s*.09;q.beginPath();q.moveTo(tx,ty+s*.7);q.lineTo(tx,ty);q.stroke();
      q.globalAlpha=.8+.2*Math.sin(t*9+d);q.drawImage(glowSpr('#ff8a2a'),tx-s*.7,ty-s*.9,s*1.4,s*1.4);q.globalAlpha=1;
      q.fillStyle='#ff7a1a';q.beginPath();q.moveTo(tx-s*.13,ty);q.quadraticCurveTo(tx-s*.1,ty-s*.3,tx+fl,ty-s*.5);q.quadraticCurveTo(tx+s*.12,ty-s*.25,tx+s*.13,ty);q.closePath();q.fill();
      q.fillStyle='#ffe066';q.beginPath();q.moveTo(tx-s*.06,ty);q.quadraticCurveTo(tx,ty-s*.28-fl,tx+s*.06,ty);q.closePath();q.fill();}
    if(ART.skull)MGD.put(q,st.dpr,'skull',0,-s*1.05,s*.55,false);
    for(const d of[-1,1])MGD.put(q,st.dpr,'d_bush',d*s*1.55,s*.45,s*.95,d<0);
    q.restore();}
  function drawScout(q){const x=sX(),y=sY(),bob=S.p<1?Math.abs(Math.sin(S.walk*9))*B*.08:Math.sin(st.t*2.2)*B*.015;let jx=0;if(S.stuck>0)jx=Math.sin(st.t*40)*B*.04;
    q.fillStyle='rgba(0,0,0,.3)';q.beginPath();q.ellipse(x,y+B*.32,B*.3,B*.1,0,0,TAU);q.fill();
    q.save();q.translate(x+jx,y-bob);if(S.p<1){q.rotate(Math.sin(S.walk*9)*.06);}MGD.put(q,st.dpr,'hp_iva',0,-B*.12,B*1.05,S.dir<0);q.restore();
    if(S.stuck>0){MGD.ICO.roots(q,x,y+B*.2,B*.5*(1-Math.max(0,S.stuck-.8)),1);}}
  function drawTrap(q,i,near){const x=(i%BW)*B+B/2,y=(i/BW|0)*B+B/2;if(sprung[i]){MGD.ICO.roots(q,x,y+B*.05,B*.42,.95);return;}
    MGD.ICO.roots(q,x,y+B*.1,B*.3,calm?.95:.7);const a=.5+.5*Math.sin(st.t*3+i);q.globalAlpha=(calm?.9:.6)*a;q.drawImage(glowSpr('#b06aff'),x-B*.35,y-B*.25,B*.7,B*.7);q.globalAlpha=1;
    q.fillStyle='#e0c0ff';MGD.fx4(q,x+B*.12,y-B*.05,B*.07*(a+.3));}
  function frame(dt){const W=st.W,H=st.H;if(!ground)layout();
    // логика
    if(phase==='play'||phase==='end'){if(S.stuck>0)S.stuck-=dt;if(S.p<1){S.walk+=dt;S.p=Math.min(1,S.p+dt*(calm?3.2:4.4)*(o.bot?1.6:1));if(S.p>=1)arrive();}think();if(hintT>0)hintT-=dt;}
    const [tx,ty]=camTarget(),k=phase==='end'?2.5:6;camX+=(tx-camX)*Math.min(1,dt*k);camY+=(ty-camY)*Math.min(1,dt*k);if(shake>0)shake-=dt;
    const ox=-camX+(shake>0&&!REDUCED?(Math.random()-.5)*6*shake:0),oy=-camY;
    // фон
    g.fillStyle='#1d3a1a';g.fillRect(0,0,W,H);
    g.drawImage(ground.c,ox-M,oy-M,ground.c.width/ground.k,ground.c.height/ground.k);
    g.save();g.translate(ox,oy);
    for(const f of foot){const a=Math.max(0,1-(st.t-f.t)/40)*.45;if(a<=0)continue;g.globalAlpha=a;g.fillStyle='#5a3e1e';g.save();g.translate(f.x,f.y);g.rotate(f.a);g.beginPath();g.ellipse(-B*.06,-B*.06,B*.05,B*.028,0,0,TAU);g.ellipse(B*.06,B*.06,B*.05,B*.028,0,0,TAU);g.fill();g.restore();}g.globalAlpha=1;
    // корни, перья, Логово
    const x0=Math.floor(camX/B)-1,x1=Math.ceil((camX+W)/B)+1,y0=Math.floor(camY/B)-1,y1=Math.ceil((camY+H)/B)+2;
    for(let y=Math.max(0,y0);y<Math.min(BH,y1);y++)for(let x=Math.max(0,x0);x<Math.min(BW,x1);x++){const i=y*BW+x;if(Z.trap[i]&&(known[i]||phase==='end'))drawTrap(g,i);}
    for(const i of Z.feat){if(featGot[i])continue;const x=(i%BW)*B+B/2,y=(i/BW|0)*B+B/2,b=Math.sin(st.t*2.4+i)*B*.06;g.globalAlpha=.75;g.drawImage(glowSpr('#ffd84a'),x-B*.5,y-B*.5+b,B,B);g.globalAlpha=1;if(ART.trf_feather)MGD.put(g,st.dpr,'trf_feather',x,y-B*.08+b,B*.62,false);}
    if(tapMark&&st.t-tapMark.t<.6){const q=(st.t-tapMark.t)/.6;g.globalAlpha=1-q;g.strokeStyle='#fff6c0';g.lineWidth=3;g.beginPath();g.ellipse(tapMark.x*B+B/2,tapMark.y*B+B*.6,B*.35*(.5+q),B*.17*(.5+q),0,0,TAU);g.stroke();g.globalAlpha=1;}
    drawScout(g);
    // деревья ниже разведчика — поверх него (кроны впереди)
    const scx=Math.round(sX()/B-.5),scy=Math.round(sY()/B-.5);for(let y=scy+1;y<=scy+2;y++)for(let x=scx-1;x<=scx+1;x++){if(isP(x,y))continue;drawTree(g,x,y,st.dpr);}
    if(leshy){const a=st.t-leshy.t;if(a>2.2)leshy=null;else{const up=a<.3?a/.3:a>1.9?(2.2-a)/.3:1,lx=leshy.x*B+B/2,ly=leshy.y*B+B*.55;g.save();g.beginPath();g.rect(lx-B,ly-B*2.2,B*2,B*2.2);g.clip();MGD.put(g,st.dpr,'lesh',lx,ly-B*.55*up+B*.5*(1-up),B*1.1,leshy.x<S.x);g.restore();
      if(up>.9){bubble(g,lx,ly-B*1.25,leshy.say);}}}
    g.restore();
    // туман
    drawFog(ox,oy);
    // свет Логова сквозь туман + подсказка
    g.save();g.translate(ox,oy);{const gx=(Z.G0%BW)*B+B/2,gy=(Z.G0/BW|0)*B,p=.45+.2*Math.sin(st.t*2.5);g.globalAlpha=p;g.drawImage(glowSpr('#ff5a2a'),gx-B*2.4,gy-B*2.6,B*4.8,B*4.8);g.globalAlpha=1;}
    drawLair(g);if(Math.abs(S.x-Z.G0%BW)+Math.abs(S.y-(Z.G0/BW|0))<=1)drawScout(g);
    if(hintT>0){const blk=new Uint8Array(N);for(let j=0;j<N;j++)if(Z.trap[j]&&!sprung[j])blk[j]=1;const r=route(Z,S.y*BW+S.x,Z.G0,blk)||[];let px=S.x,py=S.y;const a=Math.min(1,hintT)*(.75+.25*Math.sin(st.t*6));g.globalAlpha=a;
      for(let k2=0;k2<Math.min(r.length,14);k2++){const nx=r[k2]%BW,ny=r[k2]/BW|0;MGD.ICO.arrow(g,(px+nx)/2*B+B/2,(py+ny)/2*B+B/2,B*.2,Math.atan2(ny-py,nx-px),'#ffe066');px=nx;py=ny;}g.globalAlpha=1;}
    g.restore();
    // светлячки и лучи
    ambient(dt);
    // частицы
    g.save();g.translate(ox,oy);const keep=st.fx;st.fx=keep.filter(p=>p.world);const scr=keep.filter(p=>!p.world);MGD.fxRun(st,g,dt);const wl=st.fx;st.fx=scr;g.restore();MGD.fxRun(st,g,dt);st.fx=st.fx.concat(wl);
    hud();
    if(phase==='intro')intro();
    if(phase==='end'&&st.t-endT>1.4&&!st.res)finish();
    MGD.drawResult(st);}
  function bubble(q,x,y,s){q.font=MGD.font(800,Math.max(14,B*.3));const w=q.measureText(s).width+20,h=Math.max(28,B*.52);MGD.rr(q,x-w/2,y-h/2,w,h,h/2);q.fillStyle='#fffbe8';q.fill();q.strokeStyle='#5a3a1c';q.lineWidth=2;q.stroke();
    q.beginPath();q.moveTo(x-6,y+h/2-1);q.lineTo(x,y+h/2+9);q.lineTo(x+6,y+h/2-1);q.fillStyle='#fffbe8';q.fill();MGD.txt(q,s,x,y+1,Math.max(14,B*.3),'#3a2a10',{sw:0});}
  let fogC=null;
  function drawFog(ox,oy){const W=st.W,H=st.H,k=Math.min(st.dpr,1.25);if(!fogC||fogC.width!==Math.round(W*k)||fogC.height!==Math.round(H*k))fogC=mkCanvas(W*k,H*k);const q=fogC.getContext('2d');q.setTransform(k,0,0,k,0,0);q.globalCompositeOperation='source-over';
    q.clearRect(0,0,W,H);const gr=q.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1a2a30');gr.addColorStop(1,'#14261c');q.fillStyle=gr;q.fillRect(0,0,W,H);
    const cl=MGD.cloud();if(cl){q.globalAlpha=.13;for(let i=0;i<9;i++){const r=B*(2.2+hash(i,1,9)*1.8),x=((hash(i,2,9)*1.6*W+st.t*B*.25*(.4+hash(i,3,9)))%(W+r*2))-r,y=hash(i,4,9)*H;q.drawImage(cl,x-r,y-r,r*2,r*2);}q.globalAlpha=1;}
    q.globalCompositeOperation='destination-out';q.imageSmoothingEnabled=true;const fs=B/FMK;q.drawImage(fogMask,ox-2*FMK*fs,oy-2*FMK*fs,fogMask.width*fs,fogMask.height*fs);
    // вокруг разведчика всегда чуть светлее
    const sx=sX()+ox,sy=sY()+oy,r=B*RV*.9,g2=q.createRadialGradient(sx,sy,0,sx,sy,r);g2.addColorStop(0,'rgba(0,0,0,1)');g2.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=g2;q.fillRect(sx-r,sy-r,r*2,r*2);
    q.globalCompositeOperation='source-over';g.drawImage(fogC,0,0,W,H);}
  function ambient(dt){const W=st.W,H=st.H;g.save();g.globalCompositeOperation='lighter';
    for(let i=0;i<3;i++){const x=((hash(i,1,4)*W+st.t*12*(i+1))%(W*1.4))-W*.2,gr=g.createLinearGradient(x,0,x+W*.25,H);gr.addColorStop(0,'rgba(255,240,180,.07)');gr.addColorStop(1,'rgba(255,240,180,0)');
      g.fillStyle=gr;g.beginPath();g.moveTo(x,0);g.lineTo(x+W*.12,0);g.lineTo(x+W*.42,H);g.lineTo(x+W*.25,H);g.closePath();g.fill();}
    for(const f of flies){f.p+=dt*f.s;const x=((f.x*W+Math.sin(f.p)*30)%W+W)%W,y=((f.y*H+Math.cos(f.p*.7)*24-st.t*6*f.s)%H+H)%H,a=.4+.4*Math.sin(f.p*3);g.globalAlpha=a;g.drawImage(glowSpr('#ffe66a'),x-9,y-9,18,18);}
    g.restore();
    const v=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=v;g.fillRect(0,0,W,H);}
  function hud(){const W=st.W,H=st.H,top=TOP(),pw=Math.min(W-130,360),px=W/2-pw/2;
    // табличка: куда идём
    g.save();MGD.rr(g,px,10,pw,top-18,12);let gr=g.createLinearGradient(0,10,0,top-8);gr.addColorStop(0,'#7a4a24');gr.addColorStop(1,'#4a2a12');g.fillStyle=gr;g.fill();g.strokeStyle='#e6b53a';g.lineWidth=2;g.stroke();
    MGD.txt(g,Lg('Тропа к Логову','Trail to the Lair'),W/2,10+(top-18)*.3,Math.min(13,top*.2),'#f2d79a',{sw:0,w:700});
    MGD.txt(g,Lg('«'+lairName(c)+'»','“'+lairName(c)+'”'),W/2,10+(top-18)*.68,Math.min(20,top*.3),'#fff',{max:pw-20});g.restore();
    // перья и корни
    const ix=12,iy=H-BOT()+12,s=Math.min(46,BOT()*.5);
    g.save();MGD.rr(g,ix,iy,s*3.4,s*1.25,s*.4);g.fillStyle='rgba(30,18,8,.72)';g.fill();g.strokeStyle='rgba(230,181,58,.8)';g.lineWidth=2;g.stroke();
    if(ART.trf_feather)MGD.put(g,st.dpr,'trf_feather',ix+s*.62,iy+s*.62,s*.95,false);MGD.txt(g,S.feathers+'/'+Z.feat.length,ix+s*1.2,iy+s*.64,s*.46,'#ffe066',{al:'left'});
    MGD.ICO.roots(g,ix+s*2.5,iy+s*.64,s*.3,1);MGD.txt(g,''+S.hits,ix+s*2.92,iy+s*.64,s*.46,S.hits?'#ff9a8a':'#fff',{al:'left'});g.restore();
    // компас к Логову
    const cx=44,cy=top+34,gx=(Z.G0%BW)*B+B/2-sX(),gy=(Z.G0/BW|0)*B+B/2-sY(),a=Math.atan2(gy,gx);
    g.save();g.beginPath();g.arc(cx,cy,28,0,TAU);g.fillStyle='rgba(30,18,8,.72)';g.fill();g.strokeStyle='#e6b53a';g.lineWidth=2.5;g.stroke();
    MGD.ICO.arrow(g,cx,cy,17,a,'#ff7a3a');g.restore();
    // подсказка за рекламу
    if(phase==='play'&&!hintUsed&&adOk()&&st.t-lastMoveT>0){const bw=Math.min(210,W*.5),bh=56;MGD.btn(st,W-bw-12,H-bh-16,bw,bh,Lg('Подсказка за рекламу','Hint for an ad'),askHint,{id:'hint',col:'#2f6aa8',px:15,lx:16,
      draw:(q,x,y,w,h)=>{MGD.ICO.film(q,x+24,y+h/2,12);}});}
    if(hintT>0){MGD.txt(g,Lg('Воевода показывает путь: ','The commander shows the way: ')+Math.ceil(hintT),W/2,H-BOT()+14,16,'#ffe066');}}
  function intro(){const W=st.W,H=st.H,w=Math.min(W-28,420),lines=[Lg('Проведи разведчика к Логову.','Lead the scout to the Lair.'),(mgPC()?Lg('Стрелки или W A S D — разведчик идёт. Или щёлкни мышкой по тропе — дойдёт сам. Enter — начать.','Arrows or W A S D move the scout. Or click the trail — he walks there. Enter — start.'):Lg('Веди пальцем — он идёт следом. Можно коснуться тропы — дойдёт сам.','Drag — he follows your finger. Or tap the trail — he walks there.')),   // OB:FINAL ПК
      Lg('Обходи корни Лешего, собирай перья жар-птицы.','Avoid Leshy’s roots, collect firebird feathers.')];
    g.fillStyle='rgba(10,8,4,.55)';g.fillRect(0,0,W,H);let L=[];for(const l of lines)L=L.concat(MGD.wrap(g,l,17,w-50));const h=118+L.length*24+86,y=(H-h)/2,x=(W-w)/2;
    MGD.parch(g,x,y,w,h);MGD.ribbon(g,W/2,y+6,Math.min(w-70,300),44,Lg('Разведка тропы','Trail Scouting'),22);
    MGD.put(g,st.dpr,'hp_iva',x+52,y+80,62,false);MGD.put(g,st.dpr,bossArt,x+w-56,y+78,60,true);MGD.ICO.roots(g,W/2,y+84,20,1);
    let yy=y+124;for(const l of L){MGD.txt(g,l,W/2,yy,17,'#4a2a0a',{sw:0,w:700});yy+=24;}
    MGD.btn(st,W/2-100,y+h-74,200,56,Lg('В путь!','Let’s go!'),start,{id:'go',col:'#3f8f3a',px:22});
    if(o.bot)start();}
  function finish(){const sc=scoreOf(S.hits,S.feathers,S.steps,Z.best),tier=tierOf(sc,1);
    const rows=waves.length,cols=st.W>=620?4:st.W>=330?2:1,chipH=st.H<700?34:40,bodyH=30+(Math.ceil((rows-1)/cols)+1)*(chipH+6)+28;
    MGD.result(st,{auto:o.bot?3:0,title:Lg('Донесение разведчика','Scout’s Report'),wide:cols>2,bodyH,sub:Lg('Логово «'+lairName(c)+'» найдено! Воевода знает, кто там ждёт.','The Lair “'+lairName(c)+'” is found! The commander knows who waits there.'),
      body:(q,x,y,w)=>report(q,x,y,w,cols,chipH),
      onDone:()=>{if(doneSent)return;doneSent=true;const r={score:sc,tier,extra:{lair:c,hits:S.hits,feathers:S.feathers,waves:waves.map(w=>w.map(e=>[e.t,e.n,e.lead?1:0]))}};window.__mgdRes=r;st.kill();host.done(r);}});}
  // «Донесение разведчика»: волны Логова значками
  function report(q,x,y,w,cols,chipH){MGD.txt(q,Lg('В Логове '+waves.length+' '+plw(waves.length,'волна','волны','волн','wave','waves')+' — вот кто идёт:','The Lair has '+waves.length+' '+plw(waves.length,'волна','волны','волн','wave','waves')+' — here is who comes:'),x+w/2,y+10,15,'#7a1a10',{sw:0,w:800,max:w});
    const cw=(w-(cols-1)*6)/cols,n=waves.length;for(let i=0;i<n;i++){const last=i===n-1,col=last?0:i%cols,row=last?Math.ceil((n-1)/cols):Math.floor(i/cols),ww=last?w:cw,cx=x+col*(cw+6),cy=y+28+row*(chipH+6),a=Math.min(1,Math.max(0,(st.t-st.res.t0-.5-i*.06)/.3));
      q.globalAlpha=a;MGD.rr(q,cx,cy,ww,chipH,8);q.fillStyle=last?'rgba(160,30,20,.18)':'rgba(120,70,20,.12)';q.fill();q.strokeStyle=last?'rgba(160,30,20,.6)':'rgba(120,70,20,.35)';q.lineWidth=1.5;q.stroke();
      q.beginPath();q.arc(cx+15,cy+chipH/2,11,0,TAU);q.fillStyle=last?'#b8322e':'#7a4a24';q.fill();MGD.txt(q,''+(i+1),cx+15,cy+chipH/2+1,12,'#fff',{sw:0});
      const L=waves[i].slice().sort((a,b)=>(b.boss?2:b.lead?1:0)-(a.boss?2:a.lead?1:0));let ex=cx+32;const ic=chipH-8;
      for(const e of L){q.font=MGD.font(800,12);const s=e.boss?'':'×'+e.n,tw=s?q.measureText(s).width:0;if(ex+ic+tw>cx+ww-2)break;
        MGD.put(q,st.dpr,e.art,ex+ic/2,cy+chipH/2,ic*(e.boss?1.2:e.lead?1.1:1),false);if(e.boss||e.lead)crown(q,ex+ic*.78,cy+6,e.boss?'#ffd84a':'#d8dde8');
        if(s){MGD.txt(q,s,ex+ic-3,cy+chipH-8,12,'#3a2208',{sw:2.5,sc:'#fff4d8',al:'left'});ex+=ic+tw+2;}else ex+=ic+6;}}
    q.globalAlpha=1;const ly=y+28+(Math.ceil((n-1)/cols)+1)*(chipH+6)+8;crown(q,x+w/2-110,ly-6,'#ffd84a');MGD.txt(q,Lg('ярый босс','raging boss'),x+w/2-96,ly,13,'#5a2e0a',{sw:0,al:'left'});
    crown(q,x+w/2+18,ly-6,'#d8dde8');MGD.txt(q,Lg('вожак','leader'),x+w/2+32,ly,13,'#5a2e0a',{sw:0,al:'left'});}
  function crown(q,x,y,col){q.beginPath();q.moveTo(x-7,y+5);q.lineTo(x-7,y-3);q.lineTo(x-3.5,y+1);q.lineTo(x,y-5);q.lineTo(x+3.5,y+1);q.lineTo(x+7,y-3);q.lineTo(x+7,y+5);q.closePath();q.fillStyle=col;q.fill();q.lineWidth=1.3;q.strokeStyle='#5a3208';q.stroke();}
  st.frame=frame;layout();reveal(S.x,S.y);if(host.onQuit)host.onQuit(()=>st.kill());
  const api={st,Z,S,known,reveal,goTo:i=>{S.x=i%BW;S.y=i/BW|0;S.fx=S.x;S.fy=S.y;S.p=1;if(phase==='intro')start();reveal(S.x,S.y);snapCam();},revealAll:()=>{for(let i=0;i<N;i++){known[i]=1;paintFog(i);}}};window.__mgdRun=api;return api;}

MG_REG({id:ID,num:7,n:{ru:'Разведка тропы',en:'Trail Scouting'},icon:'hp_iva',kind:'prep',run,bot:o=>botSim((o&&o.q)||'mid',typeof o==='number'?{lvl:o}:o),lair:lairCh,waves:lairWaves});
})();
