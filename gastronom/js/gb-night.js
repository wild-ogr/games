/* ================= GBNIGHT — «Ночная смена: ночь на переучёте» (поток FEST, 10.10.2026) =================
   Грузится лениво (GB.load из js/fest-gb.js), когда идёт праздник hw26/hw27. Работает только на праздничном уровне «Ночной смены»
   (G.fs.k==='hw'): витрина в темноте, фонарик высвечивает 3 полки — ту, над которой палец/мышь, и соседние (+ выбранный товар и подсказка);
   в зале — тыква и свеча, иногда заглядывает «призрак завмага» (смешной, не страшный; только VK/ОК — FESTGB.ghost()).
   «Меньше движения» (calm) — призрак не летает, фонарик не мерцает. Правила уровня не меняет — только рисует поверх. */
(function(){
'use strict';
if(typeof render!=='function'||typeof hitUnit!=='function'||!window.FESTGB)return;
const D=document;
const RU=()=>typeof LANG==='undefined'||LANG!=='en';
const on=()=>!!(G&&G.fs&&FESTGB.events[G.fs.k]&&FESTGB.events[G.fs.k].night&&HALL&&G.units&&G.units.length);
let litI=-1,mk=null,gh={t0:0,show:0,said:0,x:0,last:0};

/* ---- фонарик: куда смотрит ---- */
function track(e){if(!on())return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const i=hitUnit(x,y,U*.35);
  if(i>=0&&i!==litI){litI=i;try{render();}catch(x){}}}
cv.addEventListener('pointermove',track);cv.addEventListener('pointerdown',track);
function lit(){const n=G.units.length,set={};let c=litI;if(c<0||c>=n)c=Math.floor((n-1)/2);
  const a=Math.max(0,Math.min(n-3,c-1));for(let i=a;i<Math.min(n,a+3);i++)set[i]=1;
  if(G.sel)set[G.sel.i]=1;if(G.drag)set[G.drag.i]=1;if(G.hint){set[G.hint.a]=1;set[G.hint.b]=1;}
  for(const k in G.adv)set[k]=1; // ряд выезжает — видно
  return set;}

/* ---- темнота поверх витрины (зал с Валей — при свете: у неё свеча) ---- */
function dark(){const w=cv.width,h=cv.height;if(!mk)mk=D.createElement('canvas');if(mk.width!==w||mk.height!==h){mk.width=w;mk.height=h;}
  const g=mk.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);g.setTransform(dpr,0,0,dpr,0,0);
  g.fillStyle='rgba(10,12,34,.74)';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='destination-out';g.fillRect(HALL.x,HALL.y,HALL.w,HALL.h);
  const L=lit(),fl=calm()?1:.96+.04*Math.sin(performance.now()/180);
  for(const k in L){const u=G.units[k];if(!u)continue;const cx=u.x+u.w/2,cy=u.y+u.h/2,r=Math.max(u.w,u.h)*.62;
    g.save();g.translate(cx,cy);g.scale(1,Math.max(.55,u.h/u.w*1.5));const gr=g.createRadialGradient(0,0,r*.25,0,0,r);
    gr.addColorStop(0,'rgba(0,0,0,'+fl+')');gr.addColorStop(.62,'rgba(0,0,0,'+(.93*fl)+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(-r,-r,r*2,r*2);g.restore();}
  g.globalCompositeOperation='source-over';
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(mk,0,0);ctx.restore();
  // тёплый отсвет фонарика
  ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalCompositeOperation='lighter';
  for(const k in L){const u=G.units[k];if(!u)continue;const cx=u.x+u.w/2,cy=u.y+u.h/2,r=u.w*.55,gr=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    gr.addColorStop(0,'rgba(255,214,140,.10)');gr.addColorStop(1,'rgba(255,214,140,0)');ctx.fillStyle=gr;ctx.fillRect(cx-r,cy-r,r*2,r*2);}
  ctx.restore();}

/* ---- зал: тыква, свеча; призрак завмага ---- */
function hallDeco(){const R=HALL,s=Math.max(26,Math.min(48,R.w*.09));ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
  try{drawGood(ctx,121,R.x+s*.75,R.y+s*1.15,s);}catch(e){}
  const cx=R.x+R.w-s*.6,by=R.y+s*1.2;try{drawGood(ctx,122,cx,by,s*.85);}catch(e){}
  if(!calm()){const t=performance.now()/1000,f=.85+.15*Math.sin(t*9)*Math.sin(t*3.7);
    for(const dx of [-.15,0,.15]){const x=cx+dx*s*.85*1,y=by-s*.85*(dx?(dx<0?.7:.66):.78)-s*.08;
      const gr=ctx.createRadialGradient(x,y,0,x,y,s*.35);gr.addColorStop(0,'rgba(255,200,90,'+(.55*f)+')');gr.addColorStop(1,'rgba(255,200,90,0)');ctx.fillStyle=gr;ctx.fillRect(x-s*.35,y-s*.35,s*.7,s*.7);
      ell(ctx,x,y,s*.03,s*.07*f,'#ffd36b');}}
  ctx.restore();}
function ghost(){if(!FESTGB.ghost())return;const now=performance.now(),R=HALL;
  if(!gh.t0){gh.t0=now+9000;}if(now<gh.t0)return;
  const T=6.5,k=(now-gh.t0)/1000;if(k>T){gh.t0=now+22000+Math.random()*12000;gh.said=0;return;}
  const a=Math.min(1,k*1.5,(T-k)*1.5),s=Math.max(40,Math.min(84,R.h*.38)),cm=calm();
  const x=cm?R.x+R.w*.72:R.x+R.w*(.15+.7*(k/T)),y=R.y+s*.75+(cm?0:Math.sin(k*2.2)*s*.08);gh.x=x;
  if(!gh.said&&k>.8&&!G.speech&&!G.over){gh.said=1;const a2=(FESTGB.tx.hw[RU()?'ghost':'ghostEn'])||[];if(a2.length)say(pick(a2),{x});}
  ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=.82*a;
  // простыня с волнистым низом
  ctx.beginPath();ctx.moveTo(x-s*.32,y+s*.42);ctx.lineTo(x-s*.32,y-s*.05);ctx.bezierCurveTo(x-s*.32,y-s*.52,x+s*.32,y-s*.52,x+s*.32,y-s*.05);ctx.lineTo(x+s*.32,y+s*.42);
  for(let i=0;i<4;i++){const x1=x+s*.32-i*s*.16;ctx.quadraticCurveTo(x1-s*.04,y+s*(i%2?.34:.52),x1-s*.16,y+s*.42);}
  ctx.closePath();ctx.fillStyle=lin(ctx,x-s*.32,0,x+s*.32,0,['#dfe6f5','#ffffff','#d6def0']);ctx.fill();
  // кепка завмага, очки, усы — он добрый
  rrect(ctx,x-s*.2,y-s*.5,s*.4,s*.12,s*.04);ctx.fillStyle='#4a5a7a';ctx.fill();ell(ctx,x+s*.1,y-s*.39,s*.2,s*.04,'#3a4866');
  ctx.strokeStyle='#33405c';ctx.lineWidth=Math.max(1,s*.025);for(const dx of [-.1,.1]){ctx.beginPath();ctx.arc(x+dx*s,y-s*.16,s*.075,0,Math.PI*2);ctx.stroke();ell(ctx,x+dx*s,y-s*.16,s*.025,s*.025,'#2a3350');}
  ctx.beginPath();ctx.moveTo(x-s*.025,y-s*.16);ctx.lineTo(x+s*.025,y-s*.16);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-s*.1,y-s*.02);ctx.quadraticCurveTo(x,y-s*.07,x+s*.1,y-s*.02);ctx.stroke();
  // счёты
  rrect(ctx,x+s*.18,y+s*.02,s*.3,s*.22,s*.03);ctx.fillStyle='#8a5a2b';ctx.fill();ctx.fillStyle='#f7e8c8';ctx.fillRect(x+s*.21,y+s*.05,s*.24,s*.16);
  for(let r=0;r<3;r++){const yy=y+s*(.08+r*.055);ctx.strokeStyle='#6b4a1f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+s*.21,yy);ctx.lineTo(x+s*.45,yy);ctx.stroke();
    for(let b=0;b<4;b++)ell(ctx,x+s*(.24+b*.045+(r===1&&b>1?.05:0)),yy,s*.018,s*.018,b%2?'#c0392b':'#2b2520');}
  ctx.restore();}

/* ---- встраивание ---- */
const oRender=render;render=function(){oRender.apply(this,arguments);if(!on())return;try{dark();hallDeco();ghost();}catch(e){}};
function tipOnce(){try{if(!on()||(S.tips&&S.tips.fs_night))return;S.tips.fs_night=1;save();
  const t=['🔦 Свет отключили! Фонарик светит на три полки — коснитесь полки или наведите мышь, и он переместится.','🔦 The power is out! The torch lights three shelves — tap a shelf or point the mouse to move it.'];
  G.tipQ=G.tipQ||[];if(G.tipOn)G.tipQ.push(t);else{G.tipQ.unshift(t);nextTip();}}catch(e){}}
if(window.GB)GB.startHook.push(function(i){if(i.mode==='fest'){litI=-1;gh.t0=0;gh.said=0;setTimeout(tipOnce,50);}});
window.GBNIGHT={v:1,lit:()=>on()?Object.keys(lit()).map(Number):[],set:i=>{litI=i;},on};
if(on()){tipOnce();try{render();}catch(e){}}
})();
