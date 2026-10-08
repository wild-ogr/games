'use strict';
/* OB:MGB (08.10) общий движок «поворот плиток» и две игры на нём:
   №11 «Ремонт ворот» (id 'vorota') — спокойная головоломка без таймера: резные доски ворот, золотой узор от солнца-оберега до засова;
   №12 «Доставка снарядов» (id 'snaryad') — на время: ядра катятся по желобам стены, поворачивай желоба, чтобы ядра попали к пушкам, а не в ров.
   Направления 0 С,1 В,2 Ю,3 З; маска — биты 1<<d. Плитки: E (тупик) 1, I 5, L 3, T 7, X 15. Поворот — по часовой.
   Логика — чистые функции tl…, vt…, sn…, ими же играют боты. */

const TL={DX:[0,1,0,-1],DY:[-1,0,1,0],BASE:{E:1,I:5,L:3,T:7,X:15}};
function tlRot(m,r){r=((r%4)+4)%4;return ((m<<r)|(m>>(4-r)))&15;}
function tlDeg(m){let n=0;for(let d=0;d<4;d++)if(m>>d&1)n++;return n;}
function tlType(m){const n=tlDeg(m);return n===1?'E':n===3?'T':n===4?'X':(m===5||m===10)?'I':'L';}
function tlFit(base,m){for(let r=0;r<4;r++)if(tlRot(base,r)===m)return r;return 0;}
function tlMask(t){return tlRot(TL.BASE[t.k],t.r);}
// сколько нажатий (по часовой) от r до правильного (с учётом симметрии I и X)
function tlTaps(t){const want=t.m;for(let n=0;n<4;n++)if(tlRot(TL.BASE[t.k],t.r+n)===want)return n;return 0;}
// разметка сетки в прямоугольнике: клетка ≥ 64 px, если влезает
function tlLayout(C,R,x,y,w,h,maxCell){const cs=Math.floor(Math.min(w/C,h/R,maxCell||120));return {cs,x:Math.round(x+(w-cs*C)/2),y:Math.round(y+(h-cs*R)/2),C,R};}
function tlAt(G,p){const c=Math.floor((p.x-G.x)/G.cs),r=Math.floor((p.y-G.y)/G.cs);return c>=0&&r>=0&&c<G.C&&r<G.R?{c,r}:null;}
// анимация поворота плитки: t.ra — показанный угол (в четвертях), догоняет t.r с «пружинкой»
function tlAnim(t,dt,calm){const d=t.r-t.ra;if(Math.abs(d)<.002){t.ra=t.r;return 0;}t.ra+=d*Math.min(1,dt*(calm?12:18));return d;}

/* ============================== №11 «Ремонт ворот» ============================== */
// случайное остовное дерево (обход в глубину) — весь узор связан; исток слева (строка sr), засов справа (строка er)
function vtGen(seed,C,R){const rnd=mgbRng(seed*13+5),M=new Array(C*R).fill(0),seen=new Array(C*R).fill(0);
  const st=[[Math.floor(rnd()*C),Math.floor(rnd()*R)]];seen[st[0][1]*C+st[0][0]]=1;
  while(st.length){const [c,r]=st[st.length-1],ds=[0,1,2,3].filter(d=>{const nc=c+TL.DX[d],nr=r+TL.DY[d];return nc>=0&&nr>=0&&nc<C&&nr<R&&!seen[nr*C+nc];});
    // меньше развилок у краёв, длинные «коридоры»
    if(!ds.length||(st.length>3&&rnd()<.08)){st.pop();continue;}const d=ds[Math.floor(rnd()*ds.length)],nc=c+TL.DX[d],nr=r+TL.DY[d];
    M[r*C+c]|=1<<d;M[nr*C+nc]|=1<<((d+2)%4);seen[nr*C+nc]=1;st.push([nc,nr]);}
  const sr=Math.floor(rnd()*R),er=Math.floor(rnd()*R);M[sr*C]|=8;M[er*C+C-1]|=2;
  const T=[];for(let i=0;i<C*R;i++){const m=M[i],k=tlType(m);T.push({m,k,r:0,ra:0,c:i%C,rr:(i/C)|0,v:Math.floor(rnd()*4)});}
  // обереги — на трёх ветках вдали от прямого пути (тупики-листья, если есть)
  const path=vtPath(T,C,R,sr,er),onP={};for(const i of path)onP[i]=1;
  const leaves=T.map((t,i)=>i).filter(i=>!onP[i]&&T[i].k==='E'),other=T.map((t,i)=>i).filter(i=>!onP[i]&&T[i].k!=='E');
  const pick=(a)=>a.splice(Math.floor(rnd()*a.length),1)[0];const ch=[];while(ch.length<3&&(leaves.length||other.length))ch.push(pick(leaves.length?leaves:other));
  ch.forEach((i,n)=>T[i].charm=n+1);
  // перемешать повороты: не меньше 75 % плиток не на месте (крест X не считается)
  for(const t of T){t.r=Math.floor(rnd()*4);}
  let wrong=T.filter(t=>t.k!=='X'&&tlMask(t)!==t.m).length,need=Math.ceil(T.filter(t=>t.k!=='X').length*.75);
  for(const t of T){if(wrong>=need)break;if(t.k!=='X'&&tlMask(t)===t.m){t.r=(t.r+1)%4;if(tlMask(t)!==t.m)wrong++;}}
  if(tlMask(T[sr*C])&8&&vtFlow(T,C,R,sr).has(er*C+C-1)){const t=T[sr*C];t.r=(t.r+1)%4;}
  for(const t of T)t.ra=t.r;
  return {T,C,R,sr,er,par:T.reduce((s,t)=>s+tlTaps(t),0)};}
// путь в дереве от истока до засова (по правильным маскам)
function vtPath(T,C,R,sr,er){const s=sr*C,e=er*C+C-1,prev={},q=[s];prev[s]=-1;
  while(q.length){const i=q.shift();if(i===e)break;const c=i%C,r=(i/C)|0;for(let d=0;d<4;d++){if(!(T[i].m>>d&1))continue;const nc=c+TL.DX[d],nr=r+TL.DY[d];if(nc<0||nr<0||nc>=C||nr>=R)continue;const j=nr*C+nc;if(j in prev)continue;prev[j]=i;q.push(j);}}
  const out=[];let i=e;while(i!=null&&i>=0){out.push(i);i=prev[i];}return out;}
// течение золота: от истока (вход с запада в клетку (0,sr)) по совпадающим пазам → множество клеток
function vtFlow(T,C,R,sr){const lit=new Set(),s=sr*C;if(!(tlMask(T[s])&8))return lit;const q=[s];lit.add(s);
  while(q.length){const i=q.shift(),c=i%C,r=(i/C)|0,m=tlMask(T[i]);for(let d=0;d<4;d++){if(!(m>>d&1))continue;const nc=c+TL.DX[d],nr=r+TL.DY[d];if(nc<0||nr<0||nc>=C||nr>=R)continue;const j=nr*C+nc;if(lit.has(j))continue;if(tlMask(T[j])>>((d+2)%4)&1){lit.add(j);q.push(j);}}}
  return lit;}
function vtDone(P,lit){const e=P.er*P.C+P.C-1;return lit.has(e)&&!!(tlMask(P.T[e])&2);}
function vtFull(P,lit){return lit.size===P.T.length&&P.T.every(t=>tlMask(t)===t.m);}
function vtScore(P,lit,moves){if(!vtDone(P,lit))return 0;let s=10;for(const t of P.T)if(t.charm&&lit.has(t.rr*P.C+t.c))s+=4;const full=vtFull(P,lit);if(full)s+=4;
  s+=moves<=Math.ceil(P.par*1.15)+1?4:moves<=P.par*2+2?2:0;return s;}
function vtTier(s){return s>=29?3:s>=20?2:s>0?1:0;}
function vtSize(o,port){const lv=(o&&o.lvl)|0;let C=lv<3?4:5,R=lv<3?5:lv<6?5:6;if(o&&o.calm){R=Math.max(4,R-1);}return [C,R];}   // одна доска на всех устройствах
/* бот «Ремонта»: игрок без таймера доводит узор до засова; умение — сколько лишних нажатий и доводит ли узор целиком.
   Модель: каждый неверный поворот плитки игрок находит с вероятностью p за «проход», лишние нажатия — промахи. */
function vtBot(o){o=o||{};const sk=o.skill==null?1:o.skill,P=vtGen((o.seed|0)||20261008,...vtSize(o,!o.wide)),rnd=mulberry(((o.seed|0)+17)*(sk+3));
  const K=[{find:.55,waste:.9,quit:.5},{find:.75,waste:.45,quit:.2},{find:.95,waste:.1,quit:0}][sk];let moves=0;
  // 1) дотянуть путь до засова; 2) по желанию — остальные ветки (обереги и узор целиком)
  const path=vtPath(P.T,P.C,P.R,P.sr,P.er),fix=i=>{const t=P.T[i],n=tlTaps(t);t.r+=n;moves+=n;if(rnd()<K.waste)moves+=1+Math.floor(rnd()*4);};
  for(const i of path.slice().reverse())fix(i);
  if(rnd()>=K.quit){for(let pass=0;pass<3;pass++)for(let i=0;i<P.T.length;i++){if(tlMask(P.T[i])!==P.T[i].m&&rnd()<K.find)fix(i);}}
  const lit=vtFlow(P.T,P.C,P.R,P.sr),s=vtScore(P,lit,moves);return {score:s,tier:vtTier(s),moves,par:P.par};}

/* ---- рисование доски ворот (дуб, резьба, золото) ---- */
const VT_WOOD={};
function vtWood(cs,v){const id=cs+':'+v;if(VT_WOOD[id])return VT_WOOD[id];const d=Math.min(2,MGB.dpr||1),n=Math.ceil(cs*d),c=mkCanvas(n,n),g=c.getContext('2d'),r=mulberry(v*97+11);g.scale(d,d);
  const base=['#b07a44','#a8703c','#b8844c','#a06a38'][v%4];const gr=g.createLinearGradient(0,0,cs,cs);gr.addColorStop(0,shade(base,.18));gr.addColorStop(1,shade(base,-.18));g.fillStyle=gr;g.fillRect(0,0,cs,cs);
  // волокна
  g.lineWidth=1;for(let i=0;i<14;i++){const y=r()*cs,a=.06+r()*.12;g.strokeStyle='rgba(70,36,10,'+a+')';g.beginPath();g.moveTo(0,y);for(let x=0;x<=cs;x+=cs/8)g.lineTo(x,y+Math.sin(x*.08+i)*2.5);g.stroke();}
  if(r()<.6){const kx=cs*(.2+r()*.6),ky=cs*(.2+r()*.6);g.strokeStyle='rgba(70,36,10,.35)';for(let k=1;k<4;k++){g.beginPath();g.ellipse(kx,ky,k*2.6,k*1.6,.3,0,TAU);g.stroke();}}
  // фаска
  g.lineWidth=3;g.strokeStyle='rgba(255,230,180,.35)';g.beginPath();g.moveTo(2,cs-2);g.lineTo(2,2);g.lineTo(cs-2,2);g.stroke();g.strokeStyle='rgba(40,18,4,.55)';g.beginPath();g.moveTo(cs-2,2);g.lineTo(cs-2,cs-2);g.lineTo(2,cs-2);g.stroke();
  // гвоздики по углам
  for(const [x,y] of[[.12,.12],[.88,.12],[.12,.88],[.88,.88]]){g.beginPath();g.arc(x*cs,y*cs,cs*.028,0,TAU);g.fillStyle='#3a2a20';g.fill();g.beginPath();g.arc(x*cs-cs*.008,y*cs-cs*.008,cs*.012,0,TAU);g.fillStyle='rgba(255,240,210,.6)';g.fill();}
  return VT_WOOD[id]=c;}
function vtGroove(g,m,cs,lit,t,k){const w=cs*.24,h=cs/2;g.lineCap='round';g.lineJoin='round';
  const path=()=>{g.beginPath();for(let d=0;d<4;d++)if(m>>d&1){g.moveTo(0,0);g.lineTo(TL.DX[d]*(h+1),TL.DY[d]*(h+1));}if(tlDeg(m)===1){g.moveTo(0,0);g.lineTo(0,0);}};
  // паз: тёмное углубление с подсветкой края
  path();g.lineWidth=w+4;g.strokeStyle='rgba(255,225,170,.35)';g.stroke();
  path();g.lineWidth=w;g.strokeStyle='#3a1e0a';g.stroke();
  path();g.lineWidth=w*.55;g.strokeStyle='#24120a';g.stroke();
  if(tlDeg(m)===1){g.beginPath();g.arc(0,0,w*.85,0,TAU);g.fillStyle='#3a1e0a';g.fill();}
  if(lit){const q=Math.min(1,k);path();g.lineWidth=w*.78*q;const gg=g.createLinearGradient(-h,-h,h,h);gg.addColorStop(0,'#fff2a8');gg.addColorStop(.5,'#ffc93a');gg.addColorStop(1,'#d88a12');g.strokeStyle=gg;g.stroke();
    path();g.lineWidth=w*.22*q;g.strokeStyle='rgba(255,255,230,.8)';g.setLineDash([cs*.08,cs*.16]);g.lineDashOffset=-t*cs*.6;g.stroke();g.setLineDash([]);
    if(tlDeg(m)===1){g.beginPath();g.arc(0,0,w*.7*q,0,TAU);g.fillStyle='#ffc93a';g.fill();}}}
// обереги: 1 солнце-коловрат, 2 птица-сирин, 3 конёк
function vtCharm(g,n,s,on,t){g.save();if(on){g.globalCompositeOperation='lighter';g.globalAlpha=.7+.3*Math.sin(t*4);g.drawImage(glowSpr('#ffd84a'),-s*1.6,-s*1.6,s*3.2,s*3.2);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
  const col=on?'#ffe27a':'#5a3418',ol=on?'#8a4a06':'#2a1608';g.lineWidth=s*.16;g.strokeStyle=ol;g.fillStyle=col;g.lineCap='round';
  g.beginPath();g.arc(0,0,s*.62,0,TAU);g.fillStyle=on?'#c8781a':'#7a4a22';g.fill();g.stroke();g.fillStyle=col;
  if(n===1){for(let i=0;i<6;i++){g.save();g.rotate(i*TAU/6+(on?t*.8:0));g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(s*.35,-s*.1,s*.42,-s*.42);g.lineWidth=s*.14;g.strokeStyle=col;g.stroke();g.restore();}g.beginPath();g.arc(0,0,s*.12,0,TAU);g.fill();}
  else if(n===2){g.beginPath();g.moveTo(-s*.38,s*.1);g.quadraticCurveTo(-s*.1,-s*.45,s*.1,-s*.1);g.quadraticCurveTo(s*.3,-s*.4,s*.42,-s*.2);g.quadraticCurveTo(s*.3,s*.1,s*.05,s*.32);g.quadraticCurveTo(-s*.2,s*.3,-s*.38,s*.1);g.fill();g.beginPath();g.arc(s*.22,-s*.2,s*.05,0,TAU);g.fillStyle=ol;g.fill();}
  else{g.beginPath();g.moveTo(-s*.35,s*.35);g.lineTo(-s*.2,-s*.05);g.quadraticCurveTo(-s*.05,-s*.42,s*.25,-s*.38);g.lineTo(s*.4,-s*.18);g.lineTo(s*.18,-s*.12);g.quadraticCurveTo(s*.2,s*.1,s*.32,s*.35);g.closePath();g.fill();}
  g.restore();}

function vtRun(host,o){o=o||{};const calm=mgbCalm(o),seed=(o.seed|0)||20261008;
  const port0=(host.h||innerHeight)>(host.w||innerWidth)*1.1,P=vtGen(seed,...vtSize(o,port0)),T=P.T;
  const S2={t:0,moves:0,lit:new Set(),litT:{},state:'play',P:[],N:[],E:null,hintUsed:0,done:0,tug:0,bolt:0,win:0,msg:null,btn:null,hb:null,shk:{}};
  let G0=null,W=1,H=1,port=port0;
  const stg=mgbStage(host,{resize,down,move:()=>{},up,step,draw,paused:()=>host.paused});MGB.dpr=stg.dpr;host.onQuit&&host.onQuit(()=>stg.kill());
  window.__mgb={P,S:S2,tap:(i)=>tap(i)};
  function resize(w,h,d){W=w;H=h;MGB.dpr=d;port=h>w*1.1;const top=port?124:70,bot=port?100:92;
    const cs=Math.floor(Math.min(w/(P.C+1.5),(h-top-bot)/(P.R+1.75),96));G0={cs,C:P.C,R:P.R,x:Math.round((w-cs*P.C)/2),y:Math.round(top+cs*1.3+Math.max(0,(h-top-bot-cs*(P.R+1.75))*.4))};}
  function relit(fresh){const old=S2.lit;S2.lit=vtFlow(T,P.C,P.R,P.sr);for(const i of S2.lit)if(!old.has(i))S2.litT[i]=fresh?0:1;for(const i of old)if(!S2.lit.has(i))delete S2.litT[i];
    let nc=0;for(const t of T)if(t.charm&&S2.lit.has(t.rr*P.C+t.c)&&!old.has(t.rr*P.C+t.c)){nc++;const [x,y]=cellXY(t.rr*P.C+t.c);mgbPop(S2.N,x,y-20,'+4','#ffe27a',true);mgbSnd('star',t.charm-1);for(let k=0;k<10;k++){const a=Math.random()*TAU,v=60+Math.random()*90;mgbPart(S2.P,{k:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:5,dur:.6,col:'#ffe27a',fr:2});}}
    const dn=vtDone(P,S2.lit);if(dn&&!S2.ready){S2.ready=1;mgbSnd('up');S2.msg={s:Lg('Узор дошёл до засова!','The pattern reached the bolt!'),t:0};}if(!dn)S2.ready=0;
    if(vtFull(P,S2.lit)&&!S2.fullSaid){S2.fullSaid=1;mgbSnd('win');S2.msg={s:Lg('Узор целиком — ворота как новые!','Whole pattern — good as new!'),t:0};}}
  relit(false);for(const i in S2.litT)S2.litT[i]=1;
  function cellXY(i){return [G0.x+(i%P.C+.5)*G0.cs,G0.y+(((i/P.C)|0)+.5)*G0.cs];}
  function tap(i){const t=T[i];if(!t||S2.state!=='play')return;t.r=t.r+1;S2.moves++;mgbSnd('click');t.pop=1;relit(true);}
  function down(p){if(S2.E){S2.E.t=Math.max(S2.E.t,2.2);return;}
    for(const b of[S2.btn,S2.hb])if(b&&mgbHit(b,p)){b.pressed=1;return;}
    if(S2.state!=='play')return;const a=tlAt(G0,p);if(a){tap(a.r*P.C+a.c);}}
  function up(p){for(const b of[S2.btn,S2.hb])if(b&&b.pressed){b.pressed=0;if(mgbHit(b,p))b.fn();}}
  mgKeys(host,k=>{if(k!=='Enter'&&k!==' ')return false;if(S2.E){S2.E.t=Math.max(S2.E.t,2.2);return true;}if(S2.ready&&S2.state==='play'){finishPuzzle();return true;}return true;});   // OB:FINAL ПК: Enter/пробел — «Задвинуть засов!»
  function finishPuzzle(){if(S2.state!=='play')return;S2.state='win';S2.win=0;mgbSnd('build');setTimeout(()=>mgbSnd('win'),500);
    for(let k=0;k<26;k++){const a=Math.random()*TAU,v=120+Math.random()*220;mgbPart(S2.P,{k:'spark',x:W/2,y:G0.y+G0.cs*P.R/2,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,g:200,s:6,dur:1.1,col:k%2?'#ffe27a':'#fff',fr:1});}
    for(let k=0;k<18;k++){const a=-Math.PI/2+(Math.random()-.5)*2.4,v=200+Math.random()*200;mgbPart(S2.P,{k:'chip',x:W/2+(Math.random()-.5)*G0.cs*P.C,y:G0.y+G0.cs*P.R,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:900,s:5,rot:Math.random()*6,vr:(Math.random()-.5)*20,dur:1.2,col:'#c8945a'});}
    const sc=vtScore(P,S2.lit,S2.moves);setTimeout(()=>{S2.E={t:0,calm,title:vtFull(P,S2.lit)?Lg('Ворота как новые!','Gates good as new!'):Lg('Ворота заперты!','Gates locked!'),score:sc,tier:vtTier(sc)};},1500);}
  function hint(){if(S2.hintUsed||S2.state!=='play')return;S2.hintBusy=1;Promise.resolve(host.ad('hint')).then(ok=>{S2.hintBusy=0;if(!ok)return;S2.hintUsed=1;
    // одна доска сама встаёт на место: сначала на пути к засову
    const path=vtPath(T,P.C,P.R,P.sr,P.er).reverse(),cand=path.concat(T.map((t,i)=>i)).find(i=>tlMask(T[i])!==T[i].m);if(cand==null)return;const t=T[cand];t.r+=tlTaps(t);t.hint=1;relit(true);
    const [x,y]=cellXY(cand);for(let k=0;k<14;k++){const a=Math.random()*TAU,v=50+Math.random()*90;mgbPart(S2.P,{k:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,s:5,dur:.7,col:'#bff0ff',fr:2});}}).catch(()=>{S2.hintBusy=0;});}
  function step(dt){S2.t+=dt;for(const t of T){tlAnim(t,dt,calm);if(t.pop)t.pop=Math.max(0,t.pop-dt*4);}for(const i in S2.litT)S2.litT[i]=Math.min(1,S2.litT[i]+dt*3.2);
    if(S2.msg){S2.msg.t+=dt;if(S2.msg.t>2.2)S2.msg=null;}if(S2.state==='win'){S2.win+=dt;S2.bolt=Math.min(1,S2.bolt+dt*1.6);}S2.tug=S2.state==='win'?S2.tug+dt:0;}
  function finish(){if(S2.done)return;S2.done=1;const sc=vtScore(P,S2.lit,S2.moves);stg.kill();
    host.done&&host.done({score:sc,tier:vtTier(sc),rec:false,extra:{moves:S2.moves,par:P.par,full:vtFull(P,S2.lit)?1:0,charms:T.filter(t=>t.charm&&S2.lit.has(t.rr*P.C+t.c)).length,hint:S2.hintUsed}});}

  /* ---------- рисование ---------- */
  function draw(g){const t=S2.t,cs=G0.cs,gx=G0.x,gy=G0.y,gw=cs*P.C,gh=cs*P.R;
    // ночное небо в проёме и каменная арка проезжей башни
    const sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#141a3a');sk.addColorStop(.6,'#2a2a5a');sk.addColorStop(1,'#4a3a5a');g.fillStyle=sk;g.fillRect(0,0,W,H);
    {const r=mulberry(seed+1);g.fillStyle='#fff';for(let i=0;i<50;i++){const x=r()*W,y=r()*H*.5;g.globalAlpha=.3+.5*Math.abs(Math.sin(t*1.3+i));g.fillRect(x,y,1.5,1.5);}g.globalAlpha=1;}
    // луна и Тугарин вдали (улетает, когда ворота починены)
    const mx=W*.85,my=port?170:H*.16;g.globalCompositeOperation='lighter';g.globalAlpha=.4;g.drawImage(glowSpr('#c8d8ff'),mx-90,my-90,180,180);g.globalAlpha=1;g.globalCompositeOperation='source-over';
    g.beginPath();g.arc(mx,my,26,0,TAU);g.fillStyle='#f4f0d8';g.fill();g.beginPath();g.arc(mx-8,my-6,5,0,TAU);g.arc(mx+9,my+7,4,0,TAU);g.fillStyle='rgba(180,170,140,.35)';g.fill();
    {const tq=S2.tug,tx=W*.18+tq*W*.9+Math.sin(t*.7)*10,ty=(port?200:Math.max(96,(G0.y-G0.cs*1.4)*.7))-tq*80+Math.sin(t*1.3)*6;if(tq<1.6){g.globalAlpha=.85*Math.max(0,1-tq/1.6);mgbArt(g,'tugar',tx,ty,port?90:110,{flip:tq>0});g.globalAlpha=1;}}
    // стена: камни
    const wallTop=Math.min(gy-(port?70:56),gy-cs*.4);drawStones(g,0,wallTop,W,H-wallTop);
    // мостовая и обломки досок у ворот
    {const ry=gy+gh+cs*.2;if(H-ry>70){const gr=g.createLinearGradient(0,ry,0,H);gr.addColorStop(0,'#5a5060');gr.addColorStop(1,'#2a2430');g.fillStyle=gr;g.fillRect(0,ry,W,H-ry);
      const r=mulberry(seed+8);for(let i=0;i<40;i++){const x=r()*W,y=ry+8+r()*(H-ry-8),rw=10+r()*14;g.fillStyle=i%2?'rgba(140,130,150,.35)':'rgba(30,24,36,.35)';g.beginPath();g.ellipse(x,y,rw,rw*.45,0,0,TAU);g.fill();}
      if(S2.state!=='win'||S2.win<1){g.globalAlpha=S2.state==='win'?Math.max(0,1-S2.win):1;const yy=ry+Math.min(60,(H-ry)*.35);for(const [x,a,l] of[[.18,.3,.9],[.26,-.5,.7],[.8,.2,.8],[.72,-.25,.6]]){g.save();g.translate(W*x,yy);g.rotate(a);rrect(g,-cs*l/2,-cs*.1,cs*l,cs*.2,3);g.fillStyle='#9a6a3a';g.fill();g.lineWidth=1.5;g.strokeStyle='#4a2a10';g.stroke();g.restore();}
        mgbArt(g,'axe',W*.5,yy+4,cs*.6,{rot:-.4});g.globalAlpha=1;}}}
    // ворота: рама с резным наличником-кокошником
    const fx=gx-cs*.28,fy=gy-cs*.28,fw=gw+cs*.56,fh=gh+cs*.4;
    // шатёр проездной башни над воротами (сколько влезает неба)
    {const top0=port?132:12,ky0=fy-cs*.12-cs*1.2,hgt=Math.max(0,ky0-top0);if(hgt>40){const bw=fw*.92,cx=fx+fw/2,by0=ky0+cs*.4;
      rrect(g,cx-bw/2-6,by0-cs*.32,bw+12,cs*.4,4);g.fillStyle='#8a8498';g.fill();g.lineWidth=1.5;g.strokeStyle='#3a3448';g.stroke();
      const rh=Math.min(hgt*.95,bw*1.3),ry=by0-cs*.32;g.save();g.beginPath();g.moveTo(cx-bw/2,ry);g.lineTo(cx,ry-rh);g.lineTo(cx+bw/2,ry);g.closePath();
      const rg=g.createLinearGradient(cx-bw/2,0,cx+bw/2,0);rg.addColorStop(0,'#3a9a5a');rg.addColorStop(.5,'#2f7a4a');rg.addColorStop(1,'#1e5a34');g.fillStyle=rg;g.fill();g.lineWidth=2.5;g.strokeStyle='#14361e';g.stroke();g.clip();
      for(let i=1;i<9;i++){const yy=ry-rh*i/9;g.beginPath();g.moveTo(cx-bw,yy);g.lineTo(cx+bw,yy);g.lineWidth=1.2;g.strokeStyle='rgba(230,200,90,.45)';g.stroke();}
      for(let i=-4;i<=4;i++){g.beginPath();g.moveTo(cx,ry-rh);g.lineTo(cx+i*bw/8,ry);g.lineWidth=.8;g.strokeStyle='rgba(10,40,20,.35)';g.stroke();}g.restore();
      // слуховые окошки
      for(const k of[-.22,.22]){const wx=cx+k*bw*.6,wy=ry-rh*.28;shp(g,'#e6b53a',{lw:1},[wx-8,wy-16,wx+8,wy+8],()=>{g.moveTo(wx-8,wy+8);g.lineTo(wx-8,wy-6);g.lineTo(wx,wy-16);g.lineTo(wx+8,wy-6);g.lineTo(wx+8,wy+8);g.closePath();});
        rrect(g,wx-4,wy-6,8,12,3);g.fillStyle=S2.state==='win'?'#ffd86a':'#1a0e10';g.fill();}
      ln(g,[cx,ry-rh,cx,ry-rh-22],'#8a6a20',2.5);ell(g,cx,ry-rh-24,4,4,'#ffd24a',{hl:.7});const fw2=Math.sin(S2.t*5)*2;shp(g,'#e8433a',{},[cx,ry-rh-22,cx+20,ry-rh-10],()=>{g.moveTo(cx,ry-rh-22);g.quadraticCurveTo(cx+10,ry-rh-26+fw2,cx+20,ry-rh-18+fw2);g.quadraticCurveTo(cx+10,ry-rh-12,cx,ry-rh-12);g.closePath();});}}
    // кокошник над воротами
    const ky=fy-cs*.12;g.save();g.beginPath();g.moveTo(fx-cs*.15,ky);g.quadraticCurveTo(fx+fw/2,ky-cs*1.3,fx+fw+cs*.15,ky);g.closePath();const kg=g.createLinearGradient(0,ky-cs*1.2,0,ky);kg.addColorStop(0,'#8a5a2e');kg.addColorStop(1,'#5a3418');g.fillStyle=kg;g.fill();g.lineWidth=4;g.strokeStyle='#e6b53a';g.stroke();
    g.clip();for(let i=0;i<9;i++){const x=fx+fw*(i+.5)/9;g.beginPath();g.arc(x,ky,cs*.22,Math.PI,0);g.lineWidth=2;g.strokeStyle='rgba(230,181,58,.55)';g.stroke();}g.restore();
    g.save();g.translate(fx+fw/2,ky-cs*.48);vtCharm(g,1,cs*.38,S2.state==='win'||!!S2.ready,t);g.restore();
    rrect(g,fx-8,fy-8,fw+16,fh+16,10);g.fillStyle='#3a2210';g.fill();rrect(g,fx,fy,fw,fh,8);const fg=g.createLinearGradient(fx,0,fx+fw,0);fg.addColorStop(0,'#6a4022');fg.addColorStop(.5,'#8a5a2e');fg.addColorStop(1,'#5a3418');g.fillStyle=fg;g.fill();g.lineWidth=2.5;g.strokeStyle='#e6b53a';g.stroke();
    // трещины и подпалины от Тугарина (тают, когда узор светится)
    // доски
    for(let i=0;i<T.length;i++){const tt=T[i],c=i%P.C,r=(i/P.C)|0,x=gx+c*cs,y=gy+r*cs,lit=S2.lit.has(i),k=S2.litT[i]||0;
      g.save();g.translate(x+cs/2,y+cs/2);const pop=tt.pop?1+Math.sin(tt.pop*Math.PI)*.06:1;g.scale(pop,pop);
      g.save();g.rotate((tt.ra%4)*Math.PI/2);g.drawImage(vtWood(cs,tt.v),-cs/2,-cs/2,cs,cs);vtGroove(g,TL.BASE[tt.k],cs,lit,t,k);g.restore();
      if(tt.charm)vtCharm(g,tt.charm,cs*.3,lit,t);
      if(tt.hint){g.strokeStyle='rgba(190,240,255,.7)';g.lineWidth=3;rrect(g,-cs/2+3,-cs/2+3,cs-6,cs-6,6);g.stroke();}
      g.restore();}
    // тени-скосы между досками
    g.strokeStyle='rgba(30,14,4,.55)';g.lineWidth=2;for(let c=1;c<P.C;c++){g.beginPath();g.moveTo(gx+c*cs,gy);g.lineTo(gx+c*cs,gy+gh);g.stroke();}for(let r=1;r<P.R;r++){g.beginPath();g.moveTo(gx,gy+r*cs);g.lineTo(gx+gw,gy+r*cs);g.stroke();}
    // кованые полосы-петли
    for(const r of[.5,P.R-.5]){const y=gy+r*cs;g.fillStyle='rgba(40,40,52,.55)';g.fillRect(gx-cs*.25,y-4,cs*.6,8);}
    // исток — солнце-оберег слева, засов справа
    const sy=gy+(P.sr+.5)*cs,ey=gy+(P.er+.5)*cs,on=S2.lit.size>0;
    g.save();g.translate(gx-cs*.3,sy);g.drawImage(glowSpr('#ffd84a'),-cs*.7,-cs*.7,cs*1.4,cs*1.4);vtCharm(g,1,cs*.36,true,t);g.restore();
    if(tlMask(T[P.sr*P.C])&8){g.lineCap='round';g.strokeStyle=on?'#ffc93a':'#3a1e0a';g.lineWidth=cs*.18;g.beginPath();g.moveTo(gx-cs*.12,sy);g.lineTo(gx+2,sy);g.stroke();}
    drawBolt(g,gx+gw,ey,cs,S2.ready||S2.state==='win');
    // частицы, числа
    mgbParts(g,S2.P,1/60);mgbPops(g,S2.N,1/60,22);
    // свечение всей доски при победе
    if(S2.state==='win'){const q=Math.min(1,S2.win/.6);g.globalCompositeOperation='lighter';g.globalAlpha=.35*(1-Math.abs(q*2-1)*.5);g.drawImage(glowSpr('#ffd84a'),gx-gw*.3,gy-gh*.3,gw*1.6,gh*1.6);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
    drawHUDv(g);
    if(S2.E&&mgbFinale(g,W,H,S2.E,1/60))finish();}
  function drawStones(g,x,y,w,h){if(!S2.stc||S2.stc.w!==w||S2.stc.h!==h){const d=Math.min(2,MGB.dpr||1),c=mkCanvas(w*d,h*d),q=c.getContext('2d'),r=mulberry(seed+4);q.scale(d,d);
      q.fillStyle='#4a4658';q.fillRect(0,0,w,h);const bh=34;for(let row=0;row*bh<h;row++){let xx=-(row%2)*30;while(xx<w){const bw=50+r()*40,cc=['#6a6478','#5e5a6e','#726a80','#646074'][Math.floor(r()*4)];rrect(q,xx+2,row*bh+2,bw-4,bh-4,6);const gg=q.createLinearGradient(0,row*bh,0,row*bh+bh);gg.addColorStop(0,shade(cc,.15));gg.addColorStop(1,shade(cc,-.2));q.fillStyle=gg;q.fill();
          if(r()<.15){q.strokeStyle='rgba(20,16,30,.4)';q.lineWidth=1.2;q.beginPath();q.moveTo(xx+bw*.3,row*bh+6);q.lineTo(xx+bw*.45,row*bh+bh*.5);q.lineTo(xx+bw*.38,row*bh+bh-6);q.stroke();}
          if(r()<.12){q.fillStyle='rgba(90,140,70,.35)';q.beginPath();q.ellipse(xx+bw*.5,row*bh+bh-6,bw*.3,5,0,0,TAU);q.fill();}xx+=bw;}}
      const sh=q.createLinearGradient(0,0,0,h);sh.addColorStop(0,'rgba(10,8,30,.1)');sh.addColorStop(1,'rgba(10,8,30,.55)');q.fillStyle=sh;q.fillRect(0,0,w,h);
      // факелы по бокам
      S2.stc={c,w,h};}
    g.drawImage(S2.stc.c,x,y,w,h);
    for(const tx of[(G0.x-G0.cs*.6)/2,W-(G0.x-G0.cs*.6)/2]){if(G0.x<G0.cs*1.3)continue;const ty=y+60;g.globalCompositeOperation='lighter';g.globalAlpha=.55+.15*Math.sin(S2.t*9+tx);g.drawImage(glowSpr('#ff9a3a'),tx-70,ty-80,140,140);g.globalAlpha=1;g.globalCompositeOperation='source-over';
      ln(g,[tx,ty+30,tx,ty],'#4a2a12',5);const f=Math.sin(S2.t*12+tx)*2;g.fillStyle='#ff7a1e';g.beginPath();g.moveTo(tx-7,ty);g.quadraticCurveTo(tx-6,ty-16,tx+f,ty-26);g.quadraticCurveTo(tx+6,ty-16,tx+7,ty);g.fill();g.fillStyle='#ffd25a';g.beginPath();g.moveTo(tx-3,ty);g.quadraticCurveTo(tx,ty-14,tx+f*.5,ty-16);g.quadraticCurveTo(tx+3,ty-8,tx+3,ty);g.fill();}}
  function drawBolt(g,x,y,cs,on){const sl=S2.bolt;   // скоба и засов (въезжает при победе)
    g.save();g.translate(x,y);rrect(g,cs*.08,-cs*.28,cs*.34,cs*.56,6);g.fillStyle='#3a3a48';g.fill();g.lineWidth=2;g.strokeStyle='#15151e';g.stroke();
    if(on){g.globalCompositeOperation='lighter';g.globalAlpha=.6+.3*Math.sin(S2.t*6);g.drawImage(glowSpr('#ffd84a'),-cs*.4,-cs*.6,cs*1.2,cs*1.2);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
    const bx=cs*.9-sl*cs*1.05;rrect(g,bx-cs*.1,-cs*.1,cs*.9,cs*.2,cs*.08);const bg=g.createLinearGradient(0,-cs*.1,0,cs*.1);bg.addColorStop(0,'#c8c8d8');bg.addColorStop(1,'#5a5a6a');g.fillStyle=bg;g.fill();g.lineWidth=1.5;g.strokeStyle='#22222c';g.stroke();
    ell(g,bx+cs*.62,-cs*.18,cs*.07,cs*.1,'#8a8a9a');g.restore();}
  function drawHUDv(g){const A=W-10-68;
    // заголовок-плашка и счётчик ходов
    const w1=Math.min(A,port?A:360);mgbPlate(g,10,8,w1,50);mgbTxt(g,Lg('Ремонт ворот','Mend the gates'),22,33,port?19:20,'#ffe9b0',{al:'left'});
    const mv=Lg('ходы','moves')+' '+S2.moves;mgbTxt(g,mv,10+w1-14,33,16,'#fff',{al:'right'});
    // обереги
    const y2=port?66:8,x2=port?10:10+w1+8,w2=port?A:Math.min(300,A-w1-8);mgbPlate(g,x2,y2,w2,port?48:50);const n=T.filter(t=>t.charm).length;
    for(let i=0;i<n;i++){const t=T.find(q=>q.charm===i+1),on=t&&S2.lit.has(t.rr*P.C+t.c),cx=x2+20+i*42,cy=y2+(port?24:25);g.save();g.translate(cx,cy);vtCharm(g,i+1,15,on,S2.t);g.restore();}
    {const full=vtFull(P,S2.lit);mgbStar(g,x2+20+n*42,y2+(port?24:25),11,full,full);let f2=14;const tx=Lg('обереги и узор целиком','charms & whole pattern');while(f2>10&&mgbTW(g,tx,f2,700)>w2-(n*42+48))f2-=.5;mgbTxt(g,tx,x2+36+n*42,y2+(port?24:25),f2,'#e8d8b0',{al:'left',w:700,lw:3});}
    // подсказка / кнопки внизу
    const by=H-(port?84:76);
    if(S2.state==='play'){
      if(S2.ready){S2.btn={x:W/2-Math.min(150,W/2-14),y:by,w:Math.min(300,W-28),h:68,fn:finishPuzzle,pressed:S2.btn&&S2.btn.pressed};const b=S2.btn;const pulse=calm?0:Math.sin(S2.t*5)*3;
        mgbBtn(g,{x:b.x-pulse,y:b.y-pulse/2,w:b.w+pulse*2,h:b.h+pulse,pressed:b.pressed},Lg('Задвинуть засов!','Slide the bolt!'),{col:'#3a9a4a'});if(mgPC())mgKeycap(g,b.x+b.w-44,b.y+b.h/2,'Enter',26);}
      else{S2.btn=null;const tip=S2.moves<3?(mgPC()?Lg('Щёлкай мышкой по доскам — поворачиваются. Веди золото от солнца к засову.','Click boards to turn them. Lead the gold from the sun to the bolt.'):Lg('Касайся досок — поворачиваются. Веди золото от солнца к засову.','Tap boards to turn them. Lead the gold from the sun to the bolt.'))
          :Lg('Через обереги — больше очков. Спешить некуда.','Through the charms — more points. No hurry.');
        const hw=(host.adOk&&host.adOk()&&!o.train&&!S2.hintUsed)?Math.min(140,W*.3):0,w3=Math.min(560,W-20)-(hw?hw+8:0),x3=(W-Math.min(560,W-20))/2;
        const ls=mgbWrap(g,tip,port?15:16,w3-24).slice(0,3),hh=ls.length*20+20;mgbPlate(g,x3,H-hh-12,w3,hh,{c1:'#3a2a4a',c2:'#1e1428',rim:'#b89ae0'});ls.forEach((s,i)=>mgbTxt(g,s,x3+w3/2,H-hh-12+hh/2+(i-(ls.length-1)/2)*20,port?15:16,'#fff3d8',{w:700}));
        if(hw){S2.hb={x:x3+w3+8,y:H-Math.max(hh,64)-12,w:hw,h:Math.max(hh,64),fn:hint,pressed:S2.hb&&S2.hb.pressed};if(!S2.hintBusy){mgbBtn(g,S2.hb,'',{col:'#4a7ac0'});const b=S2.hb;mgbTxt(g,Lg('Подсказка','Hint'),b.x+b.w/2,b.y+b.h*.36,15,'#fff',{ol:'#1a3a6a'});mgbTxt(g,Lg('за рекламу','for an ad'),b.x+b.w/2,b.y+b.h*.64,12,'#dfeeff',{ol:'#1a3a6a',w:700});}}else S2.hb=null;}}
    else{S2.btn=null;S2.hb=null;}
    if(S2.msg){const m=S2.msg,q=m.t/2.2,p=m.t<.15?1+(1-m.t/.15)*.4:1;g.globalAlpha=q>.8?(1-q)/.2:1;let f=26;while(f>15&&mgbTW(g,m.s,f)>W-30)f--;mgbTxt(g,m.s,W/2,G0.y-(port?28:22)-q*8,f*p,'#ffe27a');g.globalAlpha=1;}}
  return {stop:()=>stg.kill()};}

/* ============================== №12 «Доставка снарядов» ============================== */
const SN={BALLS:18,SPD:1.15};
// поле: C×R желобов; сверху — лари с ядрами (входы), снизу — пушки (выходы) и ров
function snGen(seed,C,R){const rnd=mgbRng(seed*31+7);
  for(let tryN=0;tryN<300;tryN++){const ents=[],cans=[];const ne=2,nc=2;
    const cols=[...Array(C).keys()];const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
    sh(cols);for(let i=0;i<ne;i++)ents.push(cols[i]);ents.sort((a,b)=>a-b);const c2=sh([...Array(C).keys()]);for(let i=0;i<nc;i++)cans.push(c2[i]);cans.sort((a,b)=>a-b);
    if(cans[0]===0&&cans[cans.length-1]===C-1&&C<6)continue;
    const need=new Array(C*R).fill(null).map(()=>[]);let ok=true;
    ents.forEach((ec,k)=>{if(!ok)return;const tc=cans[k%cans.length];let c=ec,r=0,from=0;const seen={};
      for(let s=0;s<C*R*2&&ok;s++){seen[r*C+c]=1;let d;
        if(r===R-1&&c===tc)d=2;else{const opts=[];if(r<R-1)opts.push(2,2);if(c<tc||(r<R-1&&c<C-1&&rnd()<.25))opts.push(1);if(c>tc||(r<R-1&&c>0&&rnd()<.25))opts.push(3);
          let o2=opts.filter(dd=>{const nc2=c+TL.DX[dd],nr=r+TL.DY[dd];return nc2>=0&&nc2<C&&nr<=R-1&&!seen[nr*C+nc2]&&!(r===R-1&&dd===2);});if(r===R-1)o2=o2.filter(dd=>dd===(c<tc?1:3));if(!o2.length){ok=false;break;}d=o2[Math.floor(rnd()*o2.length)];}
        need[r*C+c].push((1<<from)|(1<<d));if(d===2&&r===R-1)break;c+=TL.DX[d];r+=TL.DY[d];from=(d+2)%4;}});
    if(!ok)continue;
    const T=[];let bad=false;for(let i=0;i<C*R;i++){const n=need[i];let m,k;
      if(n.length===0){k=rnd()<.62?'L':'I';T.push({k,m:-1,r:Math.floor(rnd()*4),ra:0,v:Math.floor(rnd()*4)});continue;}
      if(n.length===1){m=n[0];k=tlType(m);}else if(n.length===2&&((n[0]===5&&n[1]===10)||(n[0]===10&&n[1]===5))){m=15;k='X';}else if(n.every(x=>x===n[0])){m=n[0];k=tlType(m);}else{bad=true;break;}
      T.push({k,m,r:Math.floor(rnd()*4),ra:0,v:Math.floor(rnd()*4)});}
    if(bad)continue;
    // разбросать: решение не собрано
    for(const t of T){if(t.m>=0&&t.k!=='X'&&tlMask(t)===t.m&&rnd()<.85)t.r++;t.ra=t.r;}
    const sched=[];let tt=1.4;for(let i=0;i<SN.BALLS;i++){sched.push({t:tt,e:ents[Math.floor(rnd()*ents.length)]});tt+=Math.max(1.7,3.1-i*.09)+rnd()*.5;}
    return {T,C,R,ents,cans,sched};}
  return null;}
function snSize(o,port){return [5,6];}   // одно поле на всех (зерно дня — одинаковое у всех, и стоя, и лёжа)
// состояние игры (чистое): шаги и касания одинаковы у игры и бота
function snState(seed,o,port){const [C,R]=snSize(o,port),P=snGen(seed,C,R);const lv=Math.max(0,Math.min(10,(o&&o.lvl)|0));
  return {P,t:0,balls:[],qi:0,score:0,deliv:0,miss:0,want:P.cans[0],wantT:0,spd:SN.SPD*(1+lv*.03)*((o&&o.calm)?.72:1),ev:[],extra:0,total:P.sched.length,kT:7,kI:(o&&o.calm)?11:Math.max(4.5,7.5-lv*.3),kq:[],kr:mgbRng(seed+77)};}
function snLocked(st,i){for(const b of st.balls)if(!b.out&&b.i===i&&b.p>=0)return true;return false;}
function snTap(st,i){if(snLocked(st,i))return false;st.P.T[i].r++;return true;}
// шаг: ядро идёт от края клетки к центру (p 0….5), там выбирает выход по маске, дальше к краю
function snStep(st,dt){const P=st.P,C=P.C,R=P.R;st.t+=dt;st.wantT+=dt;
  while(st.qi<P.sched.length&&P.sched[st.qi].t<=st.t){const e=P.sched[st.qi++].e;st.balls.push({c:e,r:0,i:e,from:0,to:-1,p:-1.3,id:st.qi,rot:0});st.ev.push({k:'spawn',c:e});}
  for(const b of st.balls){if(b.out)continue;const sp=st.spd*dt;b.rot+=sp*6;
    if(b.p<.5&&b.p+sp>=.5){const m=tlMask(P.T[b.i]);if(!(m>>b.from&1)){b.out='drop';st.miss++;st.ev.push({k:'drop',b});continue;}
      let to;if(P.T[b.i].k==='X')to=(b.from+2)%4;else{to=-1;for(let d=0;d<4;d++)if(d!==b.from&&(m>>d&1)){to=d;break;}}
      b.to=to;}
    b.p+=sp;
    if(b.p>=1){const d=b.to,nc=b.c+TL.DX[d],nr=b.r+TL.DY[d];
      if(nr>=R){if(P.cans.indexOf(b.c)>=0){const pts=b.c===st.want?2:1;st.score+=pts;st.deliv++;b.out='can';st.ev.push({k:'can',b,c:b.c,pts});if(b.c===st.want){const o2=P.cans.filter(x=>x!==st.want);st.want=o2[Math.floor((st.t*7)%o2.length)];st.wantT=0;}}
        else{b.out='moat';st.miss++;st.ev.push({k:'moat',b,c:b.c});}continue;}
      if(nr<0||nc<0||nc>=C){b.out='side';st.miss++;st.ev.push({k:'side',b});continue;}
      b.c=nc;b.r=nr;b.i=nr*C+nc;b.from=(d+2)%4;b.to=-1;b.p-=1;b.steps=(b.steps||0)+1;if(b.steps>C*R*2){b.out='drop';st.miss++;st.ev.push({k:'drop',b});}}}
  // стрела нечисти сбивает желоб на пути (предупреждение — 1 с)
  if(st.t>=st.kT){st.kT+=st.kI;const used=[];for(let i=0;i<P.T.length;i++)if(P.T[i].m>=0&&P.T[i].k!=='X'&&!snLocked(st,i))used.push(i);if(used.length){const i=used[Math.floor(st.kr()*used.length)];st.ev.push({k:'warn',i});st.kq.push({i,t:st.t+1});}}
  for(let j=st.kq.length-1;j>=0;j--)if(st.t>=st.kq[j].t){const i=st.kq[j].i;st.kq.splice(j,1);if(!snLocked(st,i)){P.T[i].r++;st.ev.push({k:'knock',i});}}
  if(st.wantT>12){const o2=st.P.cans.filter(x=>x!==st.want);st.want=o2[Math.floor((st.t*3)%o2.length)];st.wantT=0;}
  st.balls=st.balls.filter(b=>!b.out||b.keep);}
function snOver(st){return st.qi>=st.P.sched.length&&st.balls.every(b=>b.out);}
function snTiers(){return [8,20];}
function snTier(s){const T=snTiers();return s>=T[1]?3:s>=T[0]?2:s>0?1:0;}
/* бот: для ближайшего ядра ищет маршрут к пушке (поиском по клеткам, у незанятых плиток — любой поворот) и жмёт нужные плитки
   со своей скоростью; skill 0 — 0,7 касания/с, реакция 1,4 с; 1 — 1,6/с; 2 — 3/с */
function snRoute(st,b){const P=st.P,C=P.C,R=P.R;// от следующего центра: начинаем с клетки b.i, вход b.from
  const key=(i,f)=>i*4+f,prev={},q=[[b.i,b.from]];prev[key(b.i,b.from)]=null;let goal=null;
  while(q.length){const [i,f]=q.shift(),t=P.T[i],c=i%C,r=(i/C)|0,lock=snLocked(st,i)&&i!==b.i;let outs=[];
    const can=m=>m>>f&1;
    if(lock||(i===b.i&&b.p>=.5)){const m=tlMask(t);if(can(m)){if(t.k==='X')outs=[(f+2)%4];else for(let d=0;d<4;d++)if(d!==f&&(m>>d&1))outs.push(d);}}
    else if(t.k==='X')outs=[(f+2)%4];else if(t.k==='I')outs=[(f+2)%4];else outs=[(f+1)%4,(f+3)%4];
    for(const d of outs){const nc=c+TL.DX[d],nr=r+TL.DY[d];if(nr>=R){if(P.cans.indexOf(c)>=0){const g2=[i,f,d,c];if(!goal||c===st.want)goal=g2;if(c===st.want){q.length=0;break;}}continue;}
      if(nr<0||nc<0||nc>=C)continue;const j=nr*C+nc,nf=(d+2)%4,k=key(j,nf);if(k in prev)continue;prev[k]=[i,f,d];q.push([j,nf]);}}
  if(!goal)return null;// собрать нужные маски
  const need=[];let cur=[goal[0],goal[1],goal[2]];while(cur){const [i,f,d]=cur;need.push([i,(1<<f)|(1<<d)]);const p=prev[key(i,f)];cur=p;}
  return need.reverse();}
function snBot(o){o=o||{};const sk=o.skill==null?1:o.skill,seed=(o.seed|0)||20261008,st=snState(seed,o,!o.wide),rnd=mulberry(seed*3+sk);
  const K=[{rate:.7,react:1.4,err:.2},{rate:1.6,react:.7,err:.08},{rate:3,react:.35,err:.02}][sk];let cd=0;const dt=1/30;
  for(let n=0;n<6000&&!snOver(st);n++){snStep(st,dt);cd-=dt;if(cd>0)continue;
    const live=st.balls.filter(b=>!b.out&&(st.t-((st.P.sched[b.id-1]||{}).t||0))>K.react*.5).sort((a,b)=>(a.steps||0)-(b.steps||0)||b.p-a.p);let did=false;
    for(const e of st.P.ents)live.push({i:e,c:e,r:0,from:0,p:-1,to:-1});
    for(const b of live){const rt=snRoute(st,b);if(!rt)continue;for(const [i,m] of rt){const t=st.P.T[i];if(t.k==='X'||snLocked(st,i))continue;if(tlMask(t)!==m&&!(t.k==='I'&&tlRot(5,t.r)===m)){if(rnd()<K.err){snTap(st,Math.floor(rnd()*st.P.T.length));}else snTap(st,i);did=true;break;}}if(did)break;}
    cd=did?1/K.rate:.1;}
  return {score:st.score,tier:snTier(st.score),deliv:st.deliv,miss:st.miss};}

function snRun(host,o){o=o||{};const calm=mgbCalm(o),seed=(o.seed|0)||20261008,port0=(host.h||innerHeight)>(host.w||innerWidth)*1.1;
  const st=snState(seed,o,port0),P=st.P,T=P.T;
  const S2={t:0,P:[],N:[],E:null,adUsed:0,done:0,state:'play',fx:[],cfire:{},msg:{s:Lg('Поворачивай желоба — веди ядра к пушкам!','Turn the chutes — guide the balls to the cannons!'),t:0},shake:{},loader:{},warn:{},arrows:[],walk:[],shots:[],flies:[],coins:[],wT:0,wr:mgbRng(seed+99)};
  let G0=null,W=1,H=1,port=port0;
  const stg=mgbStage(host,{resize,down,move:()=>{},up,step,draw,paused:()=>host.paused});MGB.dpr=stg.dpr;host.onQuit&&host.onQuit(()=>stg.kill());
  window.__mgb={st,S:S2};
  function resize(w,h,d){W=w;H=h;MGB.dpr=d;port=h>w*1.1;const hl=!port&&w>=h*1.2,top=hl?10:66,bot=port?92:64,hw=hl?Math.min(250,w*.2):0;
    const cs=Math.floor(Math.min((w-24-hw*2)/P.C,(h-top-bot)/(P.R+2.2),port?84:90)),extra=Math.max(0,h-top-bot-cs*(P.R+2.2));
    const fh=extra>=cs*.6?Math.min(cs*1.35,extra*.8):0,lr=extra-fh;
    G0={cs,C:P.C,R:P.R,x:Math.round((w-cs*P.C)/2),y:Math.round(top+cs*1.25+lr*.85),fh,hl,hw,top};
    // поле за рвом: стоя — полосой под пушками; на широком экране — в большой бойнице справа
    const gx2=G0.x+cs*P.C,gb=G0.y+cs*P.R;if(fh>0)G0.F={x:0,y:gb+cs*.98,w,h:fh,arch:0};else if(w-gx2>cs*2.2){const x=gx2+cs*.5,ww=w-x-16;G0.F={x,y:G0.y+cs*P.R*.3,w:ww,h:gb+cs*.9-(G0.y+cs*P.R*.3),arch:1};}else G0.F=null;}
  function cXY(i){return [G0.x+(i%P.C+.5)*G0.cs,G0.y+(((i/P.C)|0)+.5)*G0.cs];}
  function down(p){if(S2.E){S2.E.t=Math.max(S2.E.t,2.2);return;}if(S2.offer){for(const b of S2.offer.bs)if(mgbHit(b,p))b.pressed=1;return;}
    if(S2.state!=='play')return;const a=tlAt(G0,p);if(!a)return;const i=a.r*P.C+a.c;if(snTap(st,i)){mgbSnd('click');T[i].pop=1;}else{S2.shake[i]=.3;mgbSnd('leak');}}
  function up(p){if(S2.offer){for(const b of S2.offer.bs){if(b.pressed&&mgbHit(b,p))b.fn();b.pressed=0;}}}
  function ballXY(b){const cs=G0.cs,[cx,cy]=cXY(b.i),h=cs/2;let x,y;if(b.p<0)return [cx,cy-h+b.p*cs*.62];if(b.p<.5){const k=1-b.p*2;x=cx+TL.DX[b.from]*h*k;y=cy+TL.DY[b.from]*h*k;}
    else{const d=b.to<0?(b.from+2)%4:b.to,k=(b.p-.5)*2;x=cx+TL.DX[d]*h*k;y=cy+TL.DY[d]*h*k;
      // по дуге в угловом желобе
      if(T[b.i].k==='L'&&b.to>=0){const a0=[cx+TL.DX[b.from]*h,cy+TL.DY[b.from]*h],a1=[cx+TL.DX[d]*h,cy+TL.DY[d]*h],cc=[a0[0]+a1[0]-cx,a0[1]+a1[1]-cy],q=b.p;
        const s0=Math.atan2(a0[1]-cc[1],a0[0]-cc[0]),s1=Math.atan2(a1[1]-cc[1],a1[0]-cc[0]);let da=s1-s0;if(da>Math.PI)da-=TAU;if(da<-Math.PI)da+=TAU;const a=s0+da*q;x=cc[0]+Math.cos(a)*h;y=cc[1]+Math.sin(a)*h;}}
    if(T[b.i].k==='L'&&b.p<.5&&b.to>=0){const d=b.to,a0=[cx+TL.DX[b.from]*h,cy+TL.DY[b.from]*h],a1=[cx+TL.DX[d]*h,cy+TL.DY[d]*h],cc=[a0[0]+a1[0]-cx,a0[1]+a1[1]-cy],q=b.p;
      const s0=Math.atan2(a0[1]-cc[1],a0[0]-cc[0]),s1=Math.atan2(a1[1]-cc[1],a1[0]-cc[0]);let da=s1-s0;if(da>Math.PI)da-=TAU;if(da<-Math.PI)da+=TAU;const a=s0+da*q;x=cc[0]+Math.cos(a)*h;y=cc[1]+Math.sin(a)*h;}
    return [x,y];}
  function step(dt){S2.t+=dt;for(const t of T){tlAnim(t,dt,calm);if(t.pop)t.pop=Math.max(0,t.pop-dt*4);}for(const k in S2.shake){S2.shake[k]-=dt;if(S2.shake[k]<=0)delete S2.shake[k];}
    if(S2.state==='play'){
      // ядро выбирает выход в центре клетки — до этого мига в L-желобе уже знаем поворот (to) для дуги
      for(const b of st.balls)if(!b.out&&b.p<.5&&T[b.i].k==='L'){const m=tlMask(T[b.i]);b.to=-1;if(m>>b.from&1)for(let d=0;d<4;d++)if(d!==b.from&&(m>>d&1))b.to=d;}
      snStep(st,dt);
      for(const e of st.ev){if(e.k==='spawn'){S2.loader[e.c]=.6;mgbSnd('build');}
        else if(e.k==='can'){const x=G0.x+(e.c+.5)*G0.cs,y=G0.y+G0.cs*P.R+G0.cs*.5;S2.cfire[e.c]=1;fireAt(e.c,e.pts);mgbSnd('cannon');mgbSnd('boom');mgbPop(S2.N,x,y-G0.cs*.6,'+'+e.pts,e.pts>1?'#ffd24a':'#ffe9a0',e.pts>1);
          for(let k=0;k<6;k++)mgbPart(S2.P,{k:'smoke',x:x+(Math.random()-.5)*10,y:y+G0.cs*.3,vx:(Math.random()-.5)*40,vy:40+Math.random()*50,s:14+Math.random()*10,dur:1,a:.85,fr:1.5});mgbPart(S2.P,{k:'spark',x,y:y+G0.cs*.35,s:22,dur:.2,col:'#fff1b0'});if(!calm)stg.shake=Math.max(stg.shake,.25);}
        else if(e.k==='warn'){S2.warn[e.i]=1;mgbSnd('whistle');}
        else if(e.k==='knock'){delete S2.warn[e.i];T[e.i].pop=1;S2.arrows.push({i:e.i,t:0});const [x,y]=cXY(e.i);mgbSnd('arrow');for(let k=0;k<8;k++){const a=Math.random()*TAU,v=60+Math.random()*90;mgbPart(S2.P,{k:'chip',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,g:500,s:3,rot:Math.random()*6,vr:10,dur:.7,col:'#a8743c'});}}
        else{const [x,y]=e.b?ballXY(e.b):[0,0];S2.fx.push({k:e.k,x,y,c:e.c,t:0,i:e.b&&e.b.i});if(e.k==='moat'){mgbSnd('splash');}else mgbSnd('leak');}}
      st.ev.length=0;
      if(snOver(st)){S2.state='end';setTimeout(endOrOffer,600);}}
    stepFx(dt);
    for(const k in S2.loader)S2.loader[k]=Math.max(0,S2.loader[k]-dt);for(const k in S2.cfire)S2.cfire[k]=Math.max(0,S2.cfire[k]-dt*1.6);
    for(let i=S2.fx.length-1;i>=0;i--){const f=S2.fx[i];f.t+=dt;if(f.t>1.2)S2.fx.splice(i,1);}
    if(S2.msg){S2.msg.t+=dt;if(S2.msg.t>2.6)S2.msg=null;}}
  function endOrOffer(){const T2=snTiers(),s=st.score,gap=s<T2[0]?T2[0]-s:s<T2[1]?T2[1]-s:99;
    if(!o.train&&!S2.adUsed&&host.ad&&host.adOk&&host.adOk()&&gap<=3){S2.offer={t:0,gap,bs:[]};return;}showEnd();}
  function more(){S2.adUsed=1;S2.offer=null;const t0=st.t+1;for(let i=0;i<3;i++)P.sched.push({t:t0+i*2.2,e:P.ents[i%P.ents.length]});st.total+=3;S2.state='play';S2.msg={s:Lg('Ещё 3 ядра!','3 more balls!'),t:0};}
  function showEnd(){S2.offer=null;const tier=snTier(st.score);S2.E={t:0,calm,title:tier>=3?Lg('Пушки сыты!','Cannons well fed!'):tier>=2?Lg('Славно подали!','Well delivered!'):Lg('Подноска окончена','Delivery over'),score:st.score,tier};mgbSnd(tier>=2?'win':'lose');}
  function finish(){if(S2.done)return;S2.done=1;stg.kill();host.done&&host.done({score:st.score,tier:snTier(st.score),rec:false,extra:{deliv:st.deliv,miss:st.miss,ad:S2.adUsed}});}

  // поле за рвом: нечисть бредёт к стене, пушки бьют по ней (только вид — счёт уже засчитан доставкой)
  function fieldY(){return G0.F?G0.F.y:0;}
  function fGround(){const F=G0.F;return F.arch?F.y+F.h*.72:F.y+F.h*.62;}
  const WK=['upyr','kik','skel','wolf','chert','lesh','bat'];
  function stepFx(dt){const cs=G0.cs;
    for(const b of st.balls){if(b.out||b.p<0)continue;if(Math.random()<(calm?.12:.3)){const [x,y]=ballXY(b);mgbPart(S2.P,{k:'spark',x:x+(Math.random()-.5)*cs*.1,y:y+cs*.08,vx:(Math.random()-.5)*60,vy:-20-Math.random()*40,g:260,s:2+Math.random()*1.5,dur:.35,col:Math.random()<.5?'#ffd27a':'#fff2c0'});}}
    if(G0.F){S2.wT-=dt;if(S2.wT<=0&&S2.walk.length<6){S2.wT=1.6+S2.wr()*1.8;S2.walk.push({key:WK[Math.floor(S2.wr()*WK.length)],x:G0.F.x+G0.F.w+30,v:(18+S2.wr()*16)*(calm?.7:1),ph:S2.wr()*6});}
      for(let i=S2.walk.length-1;i>=0;i--){const w=S2.walk[i];w.x-=w.v*dt;if(w.x<G0.F.x-40)S2.walk.splice(i,1);}}
    for(let i=S2.shots.length-1;i>=0;i--){const q=S2.shots[i];q.t+=dt;if(q.t>=q.dur){S2.shots.splice(i,1);hitField(q);}}
    for(let i=S2.flies.length-1;i>=0;i--){const q=S2.flies[i];q.t+=dt;q.vy+=900*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.rot+=q.vr*dt;if(q.t>1.4)S2.flies.splice(i,1);}
    for(let i=S2.coins.length-1;i>=0;i--){const q=S2.coins[i];q.t+=dt;if(q.t>=q.dur){S2.coins.splice(i,1);S2.bump=1;}}
    if(S2.bump)S2.bump=Math.max(0,S2.bump-dt*4);}
  function fireAt(c,pts){const cs=G0.cs,s=cs*.5,x0=G0.x+(c+.5)*cs+s*.85,y0=G0.y+G0.cs*P.R+cs*.42;
    for(let k=0;k<6;k++)mgbPart(S2.P,{k:'spark',x:x0,y:y0,vx:120+Math.random()*160,vy:(Math.random()-.5)*90,s:3+Math.random()*3,dur:.3,col:'#ffb03a',fr:3});
    if(!G0.F)return;const fy=fGround();let tg=null;for(const w of S2.walk)if(!w.hit&&w.x>x0-cs*.5&&(!tg||w.x<tg.x))tg=w;if(!tg)for(const w of S2.walk)if(!w.hit&&(!tg||Math.abs(w.x-x0)<Math.abs(tg.x-x0)))tg=w;
    const dur=.55,x1=tg?tg.x-tg.v*dur:x0+cs*1.6;if(tg)tg.hit=1;S2.shots.push({x0,y0,x1,y1:fy,t:0,dur,w:tg,pts});}
  function hitField(q){const cs=G0.cs;mgbBoom(S2.P,q.x1,q.y1,cs*.32,{chips:6,cols:['#5a8a34','#6a4a2a','#3a3a44']});mgbSnd('boom');
    if(q.w){const i=S2.walk.indexOf(q.w);if(i>=0)S2.walk.splice(i,1);S2.flies.push({key:q.w.key,x:q.x1,y:q.y1-cs*.3,vx:60+Math.random()*80,vy:-380-Math.random()*120,rot:0,vr:8,t:0});mgbSnd('kill');}
    mgbPop(S2.N,q.x1,q.y1-cs*.7,'+'+q.pts,q.pts>1?'#ffd24a':'#ffe9a0',q.pts>1);
    for(let k=0;k<q.pts+1;k++)S2.coins.push({x0:q.x1,y0:q.y1-cs*.4,t:-k*.08,dur:.7});}
  function drawField(g){const cs=G0.cs,F=G0.F;if(!F)return;const fy=F.y,fh=F.h,X=F.x,Wf=F.w;g.save();
    if(F.arch){// бойница: каменный проём с аркой
      const path=()=>{g.beginPath();g.moveTo(X,fy+fh);g.lineTo(X,fy+Wf*.5);g.arc(X+Wf/2,fy+Wf*.5,Wf/2,Math.PI,0);g.lineTo(X+Wf,fy+fh);g.closePath();};
      g.save();g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=14;path();g.fillStyle='#3a2a2a';g.fill();g.restore();path();g.clip();
      const sk=g.createLinearGradient(0,fy,0,fy+fh);sk.addColorStop(0,'#7ab4e4');sk.addColorStop(.5,'#cfe6f0');sk.addColorStop(1,'#cfe6f0');g.fillStyle=sk;g.fillRect(X,fy,Wf,fh);
      g.fillStyle='#8ab0c8';g.beginPath();g.moveTo(X,fy+fh*.5);for(let x=X;x<=X+Wf;x+=12)g.lineTo(x,fy+fh*.42-Math.sin(x*.03)*fh*.05);g.lineTo(X+Wf,fy+fh*.5);g.closePath();g.fill();}
    const top0=F.arch?fy+fh*.48:fy,wy=top0+(fy+fh-top0)*.22,wg=g.createLinearGradient(0,top0,0,wy);wg.addColorStop(0,'#24486a');wg.addColorStop(1,'#3a6a90');g.fillStyle=wg;g.fillRect(X,top0,Wf,wy-top0);
    g.fillStyle='rgba(220,240,255,.35)';for(let i=0;i<Math.ceil(Wf/60)+1;i++){const x=X+(i*60+S2.t*12)%(Wf+60)-30;g.fillRect(x,top0+(i%3)*(wy-top0)*.25+3,22,2);}
    const gg=g.createLinearGradient(0,wy,0,fy+fh);gg.addColorStop(0,'#7caa48');gg.addColorStop(1,'#4a7a2a');g.fillStyle=gg;g.fillRect(X,wy,Wf,fy+fh-wy);
    g.strokeStyle='rgba(255,240,170,.5)';g.lineWidth=2;g.beginPath();g.moveTo(X,wy);g.lineTo(X+Wf,wy);g.stroke();
    {const r=mulberry(seed+31);for(let i=0;i<Math.ceil(Wf/38);i++){const x=X+r()*Wf,y=wy+6+r()*((fy+fh-wy)*.6);ln(g,[x,y,x-2,y-6],'#3a6a24',1.5);ln(g,[x+3,y,x+4,y-7],'#3a6a24',1.5);}
      for(let i=0;i<Math.ceil(Wf/160);i++)mgbArt(g,i%2?'d_bush':'d_stone',X+r()*Wf,wy+(fy+fh-wy)*.3,cs*.45);}
    const gy2=fGround();for(const w of S2.walk){const bob=calm?0:Math.abs(Math.sin(S2.t*5+w.ph))*3;ell(g,w.x,gy2+cs*.02,cs*.2,cs*.05,'rgba(0,0,0,.3)',{ol:false,flat:true});mgbArt(g,w.key,w.x,gy2-cs*.25-bob,cs*.55,{flip:true});}
    for(const q of S2.flies){g.globalAlpha=Math.max(0,1-q.t/1.4);mgbArt(g,q.key,q.x,q.y,cs*.55,{rot:q.rot});g.globalAlpha=1;}
    g.restore();
    if(F.arch){g.beginPath();g.moveTo(X,fy+fh);g.lineTo(X,fy+Wf*.5);g.arc(X+Wf/2,fy+Wf*.5,Wf/2,Math.PI,0);g.lineTo(X+Wf,fy+fh);g.lineWidth=7;g.strokeStyle='#8a8498';g.stroke();g.lineWidth=2;g.strokeStyle='#3a3448';g.stroke();}}
  // подносчик: кафтан, шапка, борода; k>0 — бросает ядро в ларь
  function drawLoader(g,x,y,sc,k,ph,flip){const t=S2.t,walk=Math.sin(t*3+ph),th=k>0?Math.sin(Math.min(1,k/.6)*Math.PI):0;g.save();g.translate(x,y);g.scale(sc*(flip?-1:1),sc);
    // ноги
    for(const d of[-1,1]){const sw=d*walk*2*(k>0?0:1);rrect(g,d*5-3+sw,-12,6,12,2);g.fillStyle='#2a1a14';g.fill();ell(g,d*5+sw+1,-1,4.5,2.5,'#1a0e08',{ol:false,flat:true});}
    // кафтан
    shp(g,'#c0302a',{hl:.25,lw:1.4},[-11,-40,11,-10],()=>{g.moveTo(-8,-40);g.lineTo(8,-40);g.lineTo(12,-10);g.lineTo(-12,-10);g.closePath();});
    ln(g,[0,-40,0,-10],'#e6b53a',1.6);rrect(g,-11,-24,22,3.5,1);g.fillStyle='#e6b53a';g.fill();
    // руки с ядром
    const ay=-30-th*16,bx=4+th*6;ln(g,[-7,-36,-2,ay],'#a8282a',5);ln(g,[7,-36,2,ay],'#a8282a',5);mgbBall(g,bx*0,ay-5-th*4,6.5);
    // голова, борода, шапка
    ell(g,0,-47,7,7,'#f2c8a0',{lw:1});shp(g,'#8a5a2a',{lw:1},[-7,-46,7,-34],()=>{g.moveTo(-7,-46);g.quadraticCurveTo(0,-30,7,-46);g.quadraticCurveTo(0,-40,-7,-46);g.closePath();});
    ell(g,-2.5,-49,1.2,1.4,'#2a1a10',{ol:false,flat:true});ell(g,2.5,-49,1.2,1.4,'#2a1a10',{ol:false,flat:true});
    shp(g,'#5a3418',{hl:.3,lw:1},[-8,-60,8,-51],()=>{g.moveTo(-8,-51);g.quadraticCurveTo(-8,-61,0,-61);g.quadraticCurveTo(8,-61,8,-51);g.closePath();});ell(g,0,-61,3,2,'#c0302a',{lw:.8});
    g.restore();}
  /* ---------- рисование ---------- */
  function draw(g){const cs=G0.cs,gx=G0.x,gy=G0.y,gw=cs*P.C,gh=cs*P.R,t=S2.t;g.save();g.translate(stg.shx,stg.shy);
    // небо дня и даль над стеной
    const sk=g.createLinearGradient(0,0,0,gy);sk.addColorStop(0,'#6aa8e0');sk.addColorStop(1,'#cfe6f0');g.fillStyle=sk;g.fillRect(-10,-10,W+20,gy+10);
    {const cl=fxCloud(),r=mulberry(seed+2);for(let i=0;i<5;i++){const x=((r()*W*1.4+t*(6+i*2))%(W*1.4))-W*.2,y=r()*gy*.5+10,s=40+r()*50;g.globalAlpha=.85;g.drawImage(cl,x-s,y-s*.5,s*2,s);}g.globalAlpha=1;}
    {const hy=gy-cs*.9;g.fillStyle='#8ab0c8';g.beginPath();g.moveTo(0,hy);for(let x=0;x<=W;x+=20)g.lineTo(x,hy-cs*.55-Math.sin(x*.012+1)*cs*.25-Math.sin(x*.031)*cs*.1);g.lineTo(W,hy);g.closePath();g.fill();
      g.fillStyle='#5a8a6a';g.beginPath();g.moveTo(0,hy);for(let x=0;x<=W;x+=14)g.lineTo(x,hy-cs*.28-((x*7)%23<11?cs*.18:0)*Math.abs(Math.sin(x*.4)));g.lineTo(W,hy);g.closePath();g.fill();}
    // стена-разрез: кладка
    const wt=gy-cs*.9;drawWall(g,wt,gx,gw);drawField(g);
    // по бокам (на широком экране): стяги и пирамиды ядер
    {const sw=gx-cs*.4;if(sw>cs*1.1)for(const sd of[0,1]){if(sd===1&&G0.F&&G0.F.arch)continue;const cx=sd?W-sw/2:sw/2,bw=Math.min(cs*1.1,sw*.55),y0=Math.max(wt+10,G0.hl&&!sd?8+50*2+24:0),bh=Math.min(gh*.75,cs*3.6,gy+gh-y0-cs*1.2),wv=Math.sin(t*1.6+sd)*3;
      if(bh>cs*1.2){ln(g,[cx-bw/2-6,y0,cx+bw/2+6,y0],'#5a3418',5);g.beginPath();g.moveTo(cx-bw/2,y0);g.lineTo(cx+bw/2,y0);g.lineTo(cx+bw/2+wv*.5,y0+bh);g.lineTo(cx+wv,y0+bh-bw*.35);g.lineTo(cx-bw/2+wv*.5,y0+bh);g.closePath();
        const bg=g.createLinearGradient(cx-bw/2,0,cx+bw/2,0);bg.addColorStop(0,'#c0302a');bg.addColorStop(.5,'#e8433a');bg.addColorStop(1,'#a02420');g.fillStyle=bg;g.fill();g.lineWidth=2.5;g.strokeStyle='#e6b53a';g.stroke();
        g.save();g.translate(cx+wv*.4,y0+bh*.42);vtCharm(g,1,bw*.3,true,t);g.restore();}
      const py=gy+gh+cs*.9;for(const [bx,by] of[[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1.5,-1],[-.5,-1],[.5,-1],[1.5,-1],[-1,-2],[0,-2],[1,-2],[-.5,-3],[.5,-3]])mgbBall(g,cx+bx*cs*.2,py+by*cs*.17,cs*.11);}}
    // лари с ядрами наверху (входы)
    {const py=gy-cs*.1;rrect(g,gx-14,py-2,gw+28,cs*.14,4);const pg=g.createLinearGradient(0,py,0,py+cs*.14);pg.addColorStop(0,'#a8743c');pg.addColorStop(1,'#5a3a1a');g.fillStyle=pg;g.fill();g.lineWidth=1.5;g.strokeStyle='#3a2210';g.stroke();}
    for(const e of P.ents){const x=gx+(e+.5)*cs,y=gy-cs*.5;g.save();g.translate(x,y);snChute(g,'I',cs*.5,false);g.restore();drawHopper(g,x,y-cs*.12,cs,S2.loader[e]||0);const ls=cs*.9/62,k=S2.loader[e]||0,sd=(x-cs*.66<14||(P.ents.indexOf(e)===1&&x+cs*.66<W-14))?1:-1,lx=x+sd*cs*.66;drawLoader(g,lx,gy-cs*.1,ls,k,e,sd<0);}
    // желоба
    for(let i=0;i<T.length;i++){const tt=T[i],c=i%P.C,r=(i/P.C)|0,x=gx+c*cs,y=gy+r*cs,lock=snLocked(st,i);
      g.save();g.translate(x+cs/2+(S2.shake[i]?Math.sin(S2.shake[i]*60)*3:0),y+cs/2);
      // каменная ниша
      rrect(g,-cs/2+2,-cs/2+2,cs-4,cs-4,8);g.fillStyle=lock?'#5a5468':'#4a4558';g.fill();g.lineWidth=1.5;g.strokeStyle='rgba(0,0,0,.4)';g.stroke();
      rrect(g,-cs/2+5,-cs/2+5,cs-10,cs*.3,6);g.fillStyle='rgba(255,255,255,.05)';g.fill();
      const pop=tt.pop?1+Math.sin(tt.pop*Math.PI)*.08:1;g.scale(pop,pop);g.rotate((tt.ra%4)*Math.PI/2);snChute(g,tt.k,cs,lock);g.restore();}
    // стрелы нечисти: красное кольцо-предупреждение, потом стрела торчит из желоба
    for(const i in S2.warn){const [x,y]=cXY(+i),p=.5+.5*Math.sin(t*18);g.strokeStyle='rgba(255,70,50,'+(.5+.4*p)+')';g.lineWidth=4;rrect(g,x-cs/2+4,y-cs/2+4,cs-8,cs-8,8);g.stroke();
      const ax=W+20-(1-Math.min(1,(S2.warn[i]-=1/60)<0?1:0))*0,ay=y;g.save();g.translate(x+cs*.75+(S2.warn[i])*W*.3,y-cs*.2);g.rotate(Math.PI);mgbArt(g,'arrow',0,0,cs*.6);g.restore();}
    for(let k=S2.arrows.length-1;k>=0;k--){const a2=S2.arrows[k];a2.t+=1/60;if(a2.t>1.6){S2.arrows.splice(k,1);continue;}const [x,y]=cXY(a2.i);g.globalAlpha=Math.min(1,(1.6-a2.t)*2);g.save();g.translate(x+cs*.15,y-cs*.15);g.rotate(Math.PI*.85);mgbArt(g,'arrow',0,0,cs*.6);g.restore();g.globalAlpha=1;}
    // пушки и ров внизу
    const by=gy+gh;for(let c=0;c<P.C;c++){const x=gx+(c+.5)*cs;if(P.cans.indexOf(c)>=0)drawCan(g,x,by,cs,c===st.want,S2.cfire[c]||0,c);else drawMoat(g,x,by,cs);}
    // ядра
    for(const b of st.balls){if(b.out)continue;const [x,y]=ballXY(b);ell(g,x+2,y+3,cs*.12,cs*.07,'rgba(0,0,0,.3)',{ol:false,flat:true});mgbBall(g,x,y,cs*.13);
      g.save();g.translate(x,y);g.rotate(b.rot);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(-cs*.02,-cs*.11,cs*.04,cs*.05);g.restore();}
    for(const q of S2.shots){const k=q.t/q.dur,x=q.x0+(q.x1-q.x0)*k,y=q.y0+(q.y1-q.y0)*k-Math.sin(k*Math.PI)*cs*.9;mgbPart(S2.P,{k:'smoke',x,y,s:cs*.12,dur:.4,a:.5});mgbBall(g,x,y,cs*.1);}
    // промахи: ядро вываливается из желоба / в ров
    for(const f of S2.fx){const q=f.t/1.2;if(f.k==='moat'){const x=gx+(f.c+.5)*cs,y=by+cs*.55;if(q<.3)mgbBall(g,x,by+q*cs*1.4,cs*.13);if(q>.25&&!f.sp){f.sp=1;for(let k=0;k<10;k++){const a=-Math.PI/2+(Math.random()-.5)*1.6,v=80+Math.random()*120;mgbPart(S2.P,{k:'drop',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:600,s:2.5,dur:.7,col:'#cfe8ff'});}mgbPart(S2.P,{k:'ring',x,y,s:cs*.5,dur:.6,col:'#e8f6ff',w:3,fl:.35});}}
      else{g.globalAlpha=Math.max(0,1-q);mgbBall(g,f.x+q*20,f.y+q*q*cs*2.4,cs*.13);g.globalAlpha=1;if(q<.5)mgbTxt(g,'!',f.x,f.y-cs*.4,24,'#ff8a6a');}}
    mgbParts(g,S2.P,1/60);mgbPops(g,S2.N,1/60,22);
    g.restore();
    drawHUDs(g);
    if(S2.offer)drawOffer(g);
    if(S2.E&&mgbFinale(g,W,H,S2.E,1/60))finish();}
  function drawWall(g,wt,gx,gw){if(!S2.wc||S2.wc.w!==W||S2.wc.h!==H){const d=Math.min(2,MGB.dpr||1),c=mkCanvas(W*d,(H-wt)*d),q=c.getContext('2d'),r=mulberry(seed+6);q.scale(d,d);const h=H-wt;
      q.fillStyle='#8a5a44';q.fillRect(0,0,W,h);const bh=22;for(let row=0;row*bh<h;row++){let x=-(row%2)*24;while(x<W){const bw=40+r()*16,cc=['#b4523e','#a84a38','#bc5a44','#9a4434'][Math.floor(r()*4)];q.fillStyle=cc;q.fillRect(x+1.5,row*bh+1.5,bw-3,bh-3);q.fillStyle='rgba(255,220,200,.12)';q.fillRect(x+1.5,row*bh+1.5,bw-3,3);x+=bw;}}
      const sh=q.createLinearGradient(0,0,0,h);sh.addColorStop(0,'rgba(0,0,0,.05)');sh.addColorStop(1,'rgba(30,10,0,.45)');q.fillStyle=sh;q.fillRect(0,0,W,h);
      // зубцы «ласточкин хвост» по верху
      S2.wc={c,w:W,h:H};}
    g.drawImage(S2.wc.c,0,wt,W,H-wt);
    for(let x=-8;x<W;x+=34){g.fillStyle='#c4523c';g.beginPath();g.moveTo(x,wt);g.lineTo(x,wt-18);g.lineTo(x+6,wt-24);g.lineTo(x+12,wt-17);g.lineTo(x+18,wt-24);g.lineTo(x+24,wt-18);g.lineTo(x+24,wt);g.closePath();g.fill();g.lineWidth=1.5;g.strokeStyle='#5a1a10';g.stroke();}
    // тёмная ниша под поле желобов
    rrect(g,gx-10,G0.y-8,gw+20,G0.cs*P.R+16,14);g.fillStyle='rgba(20,10,20,.45)';g.fill();g.lineWidth=3;g.strokeStyle='#e6b53a';g.stroke();}
  function drawHopper(g,x,y,cs,k){const s=cs*.42;g.save();g.translate(x,y-(k>0?Math.sin(k/.6*Math.PI)*4:0));
    shp(g,'#8a5a2e',{hl:.25},[-s,-s*.9,s,s*.5],()=>{g.moveTo(-s,-s*.9);g.lineTo(s,-s*.9);g.lineTo(s*.35,s*.5);g.lineTo(-s*.35,s*.5);g.closePath();});
    for(const yy of[-.5,-.1])ln(g,[-s*(1-(.9+yy)*.4),s*yy,s*(1-(.9+yy)*.4),s*yy],'#4a2a12',1.6);
    for(const [bx,byy] of[[-.45,-1.05],[0,-1.12],[.45,-1.05],[-.22,-1.38],[.22,-1.38]])mgbBall(g,bx*s,byy*s,s*.24);
    g.restore();}
  function snChute(g,k,cs,lock){const h=cs/2,w=cs*.34;g.lineCap='butt';g.lineJoin='round';
    const path=()=>{g.beginPath();if(k==='I'){g.moveTo(0,-h);g.lineTo(0,h);}else if(k==='L'){g.moveTo(0,-h);g.arc(h,-h,h,Math.PI,Math.PI/2,true);}else{g.moveTo(0,-h);g.lineTo(0,h);g.moveTo(-h,0);g.lineTo(h,0);}};
    // опоры-скобы
    g.strokeStyle='#2a2a34';g.lineWidth=3;for(const a of(k==='I'?[-.3,.3]:k==='L'?[-.3]:[]))ln(g,[-w*.65,a*cs,w*.65,a*cs],'#2a2a34',3);
    path();g.lineWidth=w+6;g.strokeStyle='#3a2210';g.stroke();
    path();g.lineWidth=w;g.strokeStyle=lock?'#c89a5a':'#a8743c';g.stroke();
    path();g.lineWidth=w*.55;g.strokeStyle=lock?'#7a5a32':'#5a3a1a';g.stroke();
    path();g.lineWidth=w*.12;g.strokeStyle='rgba(255,230,180,.35)';g.stroke();
    if(k==='X'){g.beginPath();g.arc(0,0,w*.42,0,TAU);g.fillStyle='#5a3a1a';g.fill();}}
  function drawCan(g,x,y,cs,want,fire,c){const s=cs*.5;g.save();g.translate(x,y+cs*.42);
    // бойница-ниша
    rrect(g,-s*.98,-s*.8,s*1.96,s*1.72,s*.3);g.fillStyle='#2a1a14';g.fill();g.lineWidth=2;g.strokeStyle='#14080a';g.stroke();
    // воронка-приёмник под желобом
    shp(g,'#8a5a2e',{hl:.25,lw:1.2},[-s*.38,-s*.82,s*.38,-s*.38],()=>{g.moveTo(-s*.38,-s*.82);g.lineTo(s*.38,-s*.82);g.lineTo(s*.14,-s*.38);g.lineTo(-s*.14,-s*.38);g.closePath();});
    const rec=fire*fire*s*.22;g.save();g.translate(-rec,0);
    // ствол лежит, смотрит вправо, к бойнице
    const gb=g.createLinearGradient(0,-s*.34,0,s*.3);gb.addColorStop(0,'#f6d68a');gb.addColorStop(.4,'#c99a44');gb.addColorStop(1,'#6a4012');
    g.beginPath();g.moveTo(-s*.78,-s*.3);g.lineTo(s*.7,-s*.2);g.lineTo(s*.7,s*.2);g.lineTo(-s*.78,s*.3);g.quadraticCurveTo(-s*.98,0,-s*.78,-s*.3);g.closePath();g.fillStyle=gb;g.fill();g.lineWidth=2;g.strokeStyle='#4a2a08';g.stroke();
    for(const xx of[-.45,.05,.45])ln(g,[s*xx,-s*.3+(xx+.78)*.07*s,s*xx,s*.3-(xx+.78)*.07*s],'#6a3a10',2.5);
    rrect(g,s*.62,-s*.27,s*.2,s*.54,4);g.fillStyle=gb;g.fill();g.stroke();ell(g,s*.83,0,s*.05,s*.16,'#1a0e06',{ol:false,flat:true});g.restore();
    // лафет и колесо
    shp(g,'#7a4a22',{hl:.2,lw:1.2},[-s*.7,s*.15,s*.4,s*.5],()=>{g.moveTo(-s*.7,s*.5);g.lineTo(-s*.5,s*.15);g.lineTo(s*.3,s*.15);g.lineTo(s*.4,s*.5);g.closePath();});
    g.beginPath();g.arc(-s*.05,s*.55,s*.3,0,TAU);g.fillStyle='#5a3418';g.fill();g.lineWidth=2;g.strokeStyle='#2a1608';g.stroke();for(let k=0;k<6;k++){const a=k*Math.PI/3;ln(g,[-s*.05,s*.55,-s*.05+Math.cos(a)*s*.26,s*.55+Math.sin(a)*s*.26],'#c99a44',1.6);}
    if(fire>0){g.globalCompositeOperation='lighter';g.globalAlpha=fire;g.drawImage(glowSpr('#ffb050'),s*.4,-s*.8,s*1.6,s*1.6);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
    // знамя «×2» над той, что ждёт
    if(want){const wv=Math.sin(S2.t*6)*2,fx=-s*.82;ln(g,[fx,-s*.6,fx,-s*1.05],'#3a2410',2.5);shp(g,'#e8433a',{},[fx,-s*1.05,fx+s*.75,-s*.62],()=>{g.moveTo(fx,-s*1.05);g.quadraticCurveTo(fx+s*.4,-s*1.1+wv,fx+s*.75,-s*.9+wv);g.quadraticCurveTo(fx+s*.4,-s*.65,fx,-s*.65);g.closePath();});}
    g.restore();
    if(want)mgbTxt(g,'×2',x-s*.42,y+cs*.42-s*.86,Math.max(12,s*.34),'#fff',{lw:3});}
  function drawMoat(g,x,y,cs){const s=cs*.5;g.save();g.translate(x,y+cs*.42);rrect(g,-s*.95,-s*.8,s*1.9,s*1.7,s*.3);const wg=g.createLinearGradient(0,-s*.8,0,s*.9);wg.addColorStop(0,'#1a2a3a');wg.addColorStop(.35,'#2a5a80');wg.addColorStop(1,'#14304a');g.fillStyle=wg;g.fill();
    g.fillStyle='rgba(200,230,255,.35)';for(let i=0;i<3;i++){const yy=-s*.1+i*s*.28,ph=S2.t*1.5+i+x;g.fillRect(-s*.6+Math.sin(ph)*s*.15,yy,s*.5,2);}
    g.globalAlpha=.8;mgbTxt(g,Lg('ров','moat'),0,s*.62,Math.max(10,s*.3),'#bfe4ff',{lw:3});g.globalAlpha=1;g.restore();}
  function drawHUDs(g){const bh=50;let r1,r2;
    if(G0.hl){const w=Math.min(G0.hw,G0.x-24);r1=[10,8,w,bh];r2=[10,8+bh+8,w,bh];}else{const A=Math.min(W-10-68,640),w1=Math.floor((A-8)*.5);r1=[10,8,w1,bh];r2=[18+w1,8,A-w1-8,bh];}
    mgbPlate(g,...r1);const left=st.total-st.qi+st.balls.filter(b=>!b.out).length,cy1=r1[1]+bh/2;let f=16;const lb=Lg('Ядра','Balls');mgbTxt(g,lb,r1[0]+12,cy1,f,'#ffe9b0',{al:'left'});mgbBall(g,r1[0]+12+mgbTW(g,lb,f)+16,cy1,9);mgbTxt(g,'×'+left,r1[0]+12+mgbTW(g,lb,f)+30,cy1,20,'#fff',{al:'left'});
    const [sx,sy,sw]=r2,cy=sy+bh/2,bp=1+(S2.bump||0)*.25;mgbPlate(g,sx,sy,sw,bh);mgbStar(g,sx+22,cy,13*bp,true,S2.bump>0);mgbTxt(g,String(st.score),sx+40,cy-1,26*bp,'#ffd24a',{al:'left'});
    const T2=snTiers(),mx=T2[1]*1.2,px0=sx+40+mgbTW(g,'00',26)+12,pw=sx+sw-14-px0;if(pw>40){const y=cy-4,fr=Math.min(1,st.score/mx);rrect(g,px0,y-6,pw,12,6);g.fillStyle='rgba(0,0,0,.4)';g.fill();if(fr>0){rrect(g,px0,y-6,Math.max(12,pw*fr),12,6);const gg=g.createLinearGradient(0,y-6,0,y+6);gg.addColorStop(0,'#ffe27a');gg.addColorStop(1,'#d88a1a');g.fillStyle=gg;g.fill();}
      for(const v of T2){const x=px0+pw*v/mx;g.fillStyle=st.score>=v?'#fff':'rgba(255,255,255,.45)';g.fillRect(x-1,y-8,2,16);mgbTxt(g,String(v),x,y+15,11,st.score>=v?'#ffe9a0':'#d8c8a0',{lw:3});}}
    for(const q of S2.coins){if(q.t<0)continue;const k=q.t/q.dur,e=k*k,x=q.x0+(sx+22-q.x0)*e,y=q.y0+(cy-q.y0)*e-Math.sin(k*Math.PI)*60;mgbStar(g,x,y,9,true);}
    // подсказка снизу
    if(S2.state==='play'){const tip=st.t<8?(mgPC()?Lg('Щёлкай мышкой по желобу — он поворачивается. Под знаменем «×2» пушка ждёт ядро.','Click a chute to turn it. The cannon under the «×2» banner is waiting.'):Lg('Касайся желоба — он поворачивается. Под знаменем «×2» пушка ждёт ядро.','Tap a chute to turn it. The cannon under the «×2» banner is waiting.'))
        :Lg('Желоб с ядром не повернуть — готовь путь заранее.','A chute with a ball inside is locked — prepare the path ahead.');
      const w3=Math.min(560,W-20),x3=(W-w3)/2,fs=port?15:16,ls=mgbWrap(g,tip,fs,w3-24).slice(0,3),hh=ls.length*20+18;mgbPlate(g,x3,H-hh-10,w3,hh,{c1:'#3a2a4a',c2:'#1e1428',rim:'#b89ae0'});ls.forEach((s,i)=>mgbTxt(g,s,W/2,H-hh-10+hh/2+(i-(ls.length-1)/2)*20,fs,'#fff3d8',{w:700}));}
    if(S2.msg){const m=S2.msg,q=m.t/2.6;g.globalAlpha=q>.8?(1-q)/.2:1;let f2=24;while(f2>14&&mgbTW(g,m.s,f2)>W-24)f2--;mgbTxt(g,m.s,W/2,G0.y-G0.cs*1.55,f2,'#fff');g.globalAlpha=1;}}
  function drawOffer(g){const O=S2.offer;O.t+=1/60;const e=Math.min(1,O.t/.3);g.fillStyle='rgba(10,6,20,'+.5*e+')';g.fillRect(0,0,W,H);const w=Math.min(W-32,400),h=250,x=(W-w)/2,y=(H-h)/2;g.globalAlpha=e;mgbScroll(g,x,y,w,h);
    mgbTxt(g,Lg('Ещё чуть-чуть!','So close!'),W/2,y+40,26,'#ffd24a',{ol:'#5a2a06'});
    mgbWrap(g,Lg('До следующей награды не хватает '+O.gap+' '+plw(O.gap,'очка','очков','очков','point','points')+'.','Only '+O.gap+' '+plw(O.gap,'очко','очка','очков','point','points')+' to the next reward.'),17,w-50).forEach((s,i)=>mgbTxt(g,s,W/2,y+78+i*22,17,'#5a3010',{sh:false,lw:.1,ol:'#f3e2bb',w:700}));
    O.bs=[{x:x+20,y:y+h-122,w:w-40,h:64,fn:()=>{O.busy=1;Promise.resolve(host.ad('more')).then(ok=>{if(ok)more();else showEnd();}).catch(()=>showEnd());}},{x:x+20,y:y+h-52,w:w-40,h:44,fn:()=>showEnd()}];
    if(!O.busy){mgbBtn(g,O.bs[0],Lg('Ещё 3 ядра за рекламу','3 more balls for an ad'),{col:'#3a8a4a'});mgbBtn(g,O.bs[1],Lg('Хватит, подсчитать','Done, count it up'),{col:'#8a6a4a',px:16});}g.globalAlpha=1;}
  return {stop:()=>stg.kill()};}

if(typeof MG_REG==='function'){
  MG_REG({id:'vorota',num:11,n:{ru:'Ремонт ворот',en:'Mend the Gates'},icon:'gate',kind:'score',run:vtRun,bot:vtBot});
  MG_REG({id:'snaryad',num:12,n:{ru:'Доставка снарядов',en:'Cannonball Delivery'},icon:'ball',kind:'score',run:snRun,bot:snBot});}
