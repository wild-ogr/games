'use strict';
/* OB:VIS (08.10) — «сочность» боя. Всё на холсте, готовыми спрайтами с кэшем (облачко рисуется один раз), без градиентов в кадре.
   Подключение в game.js — точечно (// OB:VIS): killEnemy → fxDeath, tryBuild/tryUpgrade → fxBuild, addNum → fxNum, render → fxDraw/fxNumK, drawTower → fxTowerB.
   Работает для любой нечисти и глав (берёт e.key/e.sz, ничего не перечисляет).
   Спокойно (выкл. «Тряска экрана» или prefers-reduced-motion): без кувырка и прыжков — только тает. body.lite: меньше частиц. */
const FX={cloud:null};
function fxCalm(){return REDUCED||!S.shake;}
function fxLite(){return document.body.classList.contains('lite');}
// своя случайность для украшений — бой от числа частиц не зависит
let fxSeed=12345;function fxR(){fxSeed=(fxSeed*1103515245+12345)&0x7fffffff;return fxSeed/0x7fffffff;}
// облачко «пуф»: белые клубы с мягкой серой каймой, 64×64, рисуется один раз
function fxCloud(){if(FX.cloud)return FX.cloud;const n=96,c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d'),B=[[.5,.56,.26],[.32,.6,.2],[.68,.6,.2],[.42,.4,.2],[.6,.38,.19],[.5,.7,.2]];
  g.fillStyle='rgba(120,110,130,.55)';for(const [x,y,r] of B){g.beginPath();g.arc(x*n,y*n+2,r*n+3,0,TAU);g.fill();}
  g.fillStyle='#f6f2ea';for(const [x,y,r] of B){g.beginPath();g.arc(x*n,y*n,r*n,0,TAU);g.fill();}
  g.fillStyle='#ffffff';for(const [x,y,r] of B){g.beginPath();g.arc(x*n-r*n*.25,y*n-r*n*.3,r*n*.55,0,TAU);g.fill();}
  return FX.cloud=c;}
// смерть нечисти: кувырок с подскоком + облачко + пара звёздочек
function fxDeath(e){if(!G)return;const calm=fxCalm(),lite=fxLite(),dir=e.face||1;
  G.fx.push({k:'xdie',key:e.key,x:e.x,y:e.y,sz:e.sz,face:e.face||1,fly:e.fly,t:0,dur:calm?.3:.42,rot:calm?0:dir*(1.6+fxR()*.8)});
  G.fx.push({k:'xpuf',x:e.x,y:e.y-e.r*.6-(e.fly?16:0),r:Math.max(16,e.r*1.7),t:-.06,dur:.42,a:fxR()*TAU});
  if(!lite&&!calm)for(let i=0;i<3&&G.pt.length<300;i++){const a=-Math.PI/2+(fxR()-.5)*2.2,v=60+fxR()*50;G.pt.push({x:e.x,y:e.y-e.r,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,dur:.45+fxR()*.2,col:'#fff2a8',s:1.6+fxR(),add:1});}}
// постройка и улучшение: застава подпрыгивает (t.bounce в drawTower), пыльное кольцо по земле
function fxBuild(t,up){if(!G)return;t.bounce=up?.42:.38;t.bT=G.t;t.bAmp=fxCalm()?.04:up?.16:.12;G.fx.push({k:'xring',x:t.x,y:t.y+8,t:0,dur:.4,r:34});
  if(up&&!fxLite())for(let i=0;i<5&&G.pt.length<300;i++){const a=i/5*TAU;G.pt.push({x:t.x+Math.cos(a)*10,y:t.y-30,vx:Math.cos(a)*55,vy:-50-fxR()*40,t:0,dur:.6,col:'#ffe27a',s:2,add:1});}}
// сжатие/растяжение заставы при подскоке: {sx,sy,dy}
function fxTowerB(t){if(!(t.bounce>0))return null;const big=t.bT!=null&&G.t-t.bT<.5,d=big?(t.bAmp>.13?.42:.38):.35,q=1-Math.max(0,t.bounce)/d,A=big?t.bAmp:.06;
  const hop=big?Math.sin(Math.min(1,q*1.6)*Math.PI)*(fxCalm()?0:A*55):0,sq=Math.sin(q*Math.PI*2)*A;return {sx:1+sq,sy:1-sq,dy:-hop};}
// числа: «+41» рядом с «+41» — одно «+82»; крупные цифры у крита и монет — «выпрыгивают»
function fxNum(x,y,v,col){if(!G)return false;if(typeof v==='string'&&/^\+\d+$/.test(v)){for(const n of G.nums)if(n.col===col&&n.t<.45&&typeof n.v==='string'&&/^\+\d+$/.test(n.v)&&(n.x-x)**2+(n.y-y)**2<46*46){n.v='+'+(+n.v.slice(1)+ +v.slice(1));n.t=Math.min(n.t,.08);n.pop=1;return true;}}
  return false;}
function fxNumK(n){const p=n.t<.16?1+(1-n.t/.16)*.55:1;return (n.big?1.45:1)*(fxCalm()?1:p);}
// рисование своих эффектов (зовёт render для f.k, начинающихся на 'x'); c — в мировых координатах (worldT)
function fxDraw(c,f,q){
  if(f.k==='xdie'){if(f.t<0)return;const sp=SPR[f.key]||spr(f.key);if(!sp)return;const hop=f.rot?Math.sin(q*Math.PI)*14:0,k=1-q*.45;
    drawSpr(f.key,f.x,f.y-(f.fly?16:0)-hop-6+q*6,f.face*f.sz*k,f.sz*k,q<.25,f.rot*q,Math.max(0,1-q*q*1.1));worldT();}
  else if(f.k==='xpuf'){if(f.t<0)return;const im=fxCloud(),e=1-(1-q)*(1-q),r=f.r*(.55+e*.75);c.globalAlpha=Math.max(0,.95*(1-q*q));
    c.drawImage(im,f.x-r,f.y-r*.9-q*8,r*2,r*2);if(!fxLite()){const r2=r*.55;c.drawImage(im,f.x+Math.cos(f.a)*r*.7-r2,f.y-r2-q*14,r2*2,r2*2);}c.globalAlpha=1;}
  else if(f.k==='xring'){c.strokeStyle=rgba('#e8dcc0',.75*(1-q));c.lineWidth=3*(1-q)+1;c.beginPath();c.ellipse(f.x,f.y,f.r*(.4+q*.8),f.r*(.4+q*.8)*.4,0,0,TAU);c.stroke();}}
// значки на холсте вместо эмодзи (на старых Android эмодзи — серые квадраты): звёздочки оглушения по кругу и огонёк
function fxStar4(c,x,y,r){c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x,y,x+r,y);c.quadraticCurveTo(x,y,x,y+r);c.quadraticCurveTo(x,y,x-r,y);c.quadraticCurveTo(x,y,x,y-r);c.fill();c.stroke();}
function fxStars(c,x,y,rx,col){const t=REDUCED?0:G.t*3.2;c.fillStyle=col;c.strokeStyle='rgba(60,30,5,.75)';c.lineWidth=.9;
  for(let i=0;i<3;i++){const a=t+i*TAU/3;fxStar4(c,x+Math.cos(a)*rx,y+Math.sin(a)*rx*.35,3.4+Math.sin(a)*.8);}}
function fxFlame(c,x,y){const f=REDUCED?0:Math.sin(G.t*14)*.8;c.fillStyle='#ff7a1e';c.strokeStyle='#7a2a06';c.lineWidth=1.1;c.beginPath();c.moveTo(x,y-9-f);c.quadraticCurveTo(x+7,y-2,x+5,y+3);c.quadraticCurveTo(x,y+7,x-5,y+3);c.quadraticCurveTo(x-7,y-2,x,y-9-f);c.fill();c.stroke();
  c.fillStyle='#ffe066';c.beginPath();c.moveTo(x,y-3-f*.5);c.quadraticCurveTo(x+3.5,y+1,x+2,y+3.5);c.quadraticCurveTo(x,y+5,x-2,y+3.5);c.quadraticCurveTo(x-3.5,y+1,x,y-3-f*.5);c.fill();}
// ▲ над заставами (хватает на улучшение): самая выгодная — та, что дешевле улучшить при низком уровне (как у советчика: сначала низкие уровни)
function fxUpBest(){if(FX.ubT===G.t&&FX.ubG===G)return FX.ub;FX.ubT=G.t;FX.ubG=G;let best=null,bv=1e18;
  for(const t of G.tw){if(!t||t.lvl>=4||t.stunT>0)continue;const c=t.lvl<3?upCost(t):branchUnlocked()?Math.min(upCost(t,1),upCost(t,2)):1e9;if(G.coins<c)continue;const v=t.lvl*1e6+c;if(v<bv){bv=v;best=t;}}
  return FX.ub=best;}
