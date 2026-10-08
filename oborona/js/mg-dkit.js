'use strict';
/* ================= OB:MGD — набор рисования мини-игр MGD (№7 «Разведка тропы» mg-razv.js, №13 «Набег на логово» mg-nabeg.js) =================
   Холст во весь host.el (retina, dpr ≤ 2, сам подстраивается под окно), кадр по requestAnimationFrame, касания/мышь/клавиши,
   кэш рисунков art.js по настоящим границам (artBox — правило FIX1), текст с обводкой, кнопки (цель ≥ 64 px), частицы «сочности»,
   окно итогов со ступенями-звёздами. Только внутри host.el; баланс боя и сохранение не трогает. */
const MGD=(function(){
const FONT='"BgF",system-ui,-apple-system,sans-serif';
const font=(w,px)=>w+' '+Math.round(px*10)/10+'px '+FONT;
const ease={out:t=>1-(1-t)*(1-t),back:t=>{const c=1.7;t-=1;return 1+t*t*((c+1)*t+c);},inout:t=>t<.5?2*t*t:1-2*(1-t)*(1-t)};
const sfx=(k,a)=>{try{if(typeof SND!=='undefined'&&SND[k])SND[k](a);}catch(e){}};

/* ---------- сцена ---------- */
function stage(host){
  const el=host.el,cv=document.createElement('canvas');
  if(getComputedStyle(el).position==='static')el.style.position='relative';
  cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;outline:none';
  cv.tabIndex=0;el.appendChild(cv);
  const st={cv,g:cv.getContext('2d'),W:0,H:0,dpr:1,t:0,alive:true,btns:[],fx:[],down:null,ptr:{x:0,y:0,on:false},keys:{},onResize:null,onDown:null,onMove:null,onUp:null,onKey:null,frame:null,host};
  function fit(){const r=el.getBoundingClientRect(),W=Math.round(r.width||innerWidth),H=Math.round(r.height||innerHeight),d=Math.min(2,window.__forceDpr||devicePixelRatio||1);
    if(W===st.W&&H===st.H&&d===st.dpr)return;st.W=W;st.H=H;st.dpr=d;cv.width=Math.round(W*d);cv.height=Math.round(H*d);SC={};if(st.onResize)st.onResize();}
  st.fit=fit;fit();
  const pos=e=>{const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
  const L=[];const on=(t,ev,f,o)=>{t.addEventListener(ev,f,o);L.push([t,ev,f,o]);};
  on(cv,'pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(_){}const p=pos(e);st.ptr={x:p.x,y:p.y,on:true,t0:st.t,x0:p.x,y0:p.y};
    for(let i=st.btns.length-1;i>=0;i--){const b=st.btns[i];if(!b.dis&&p.x>=b.x-b.pad&&p.x<=b.x+b.w+b.pad&&p.y>=b.y-b.pad&&p.y<=b.y+b.h+b.pad){st.ptr.btn=b;b.down=st.t;return;}}
    if(st.onDown)st.onDown(p.x,p.y);});
  on(cv,'pointermove',e=>{const p=pos(e);st.ptr.x=p.x;st.ptr.y=p.y;if(st.ptr.on&&!st.ptr.btn&&st.onMove)st.onMove(p.x,p.y);});
  const up=e=>{const p=pos(e),b=st.ptr.btn;st.ptr.on=false;st.ptr.btn=null;
    if(b){if(p.x>=b.x-b.pad-12&&p.x<=b.x+b.w+b.pad+12&&p.y>=b.y-b.pad-12&&p.y<=b.y+b.h+b.pad+12&&b.fn){sfx('click');b.fn();}return;}
    if(st.onUp)st.onUp(p.x,p.y,st.t-(st.ptr.t0||st.t),Math.hypot(p.x-(st.ptr.x0||p.x),p.y-(st.ptr.y0||p.y)));};
  on(cv,'pointerup',up);on(cv,'pointercancel',up);on(cv,'contextmenu',e=>e.preventDefault());
  on(window,'keydown',e=>{if(!st.alive)return;st.keys[e.key]=1;if(st.onKey&&st.onKey(e.key,1))e.preventDefault();});
  on(window,'keyup',e=>{st.keys[e.key]=0;if(st.onKey)st.onKey(e.key,0);});
  on(window,'resize',fit);
  let ro=null;try{ro=new ResizeObserver(fit);ro.observe(el);}catch(_){}
  let last=performance.now();
  function tick(now){if(!st.alive)return;if(!cv.isConnected){st.kill();return;}requestAnimationFrame(tick);let dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
    if(document.hidden||host.paused||st.paused)dt=0;st.t+=dt;fit();st.btns=[];
    const g=st.g;g.setTransform(st.dpr,0,0,st.dpr,0,0);g.lineJoin='round';g.lineCap='round';
    try{if(st.frame)st.frame(dt);}catch(e){console.error(e);st.err=(st.err||0)+1;if(st.err>5)st.alive=false;}}
  requestAnimationFrame(tick);
  st.kill=()=>{st.alive=false;for(const [t,ev,f,o] of L)t.removeEventListener(ev,f,o);if(ro)ro.disconnect();cv.remove();};
  try{cv.focus({preventScroll:true});}catch(_){}
  return st;}

/* ---------- рисунки art.js ---------- */
let SC={};   // кэш: ключ@плотность → холст по границам рисунка
function sprite(key,k){k=Math.max(.25,Math.round(k*8)/8);const id=key+'@'+k;let s=SC[id];if(s)return s;const a=artGet(key);if(!a)return null;const b=artBox(key);
  return SC[id]={c:drawArtK(key,k,b),b,size:a.size};}
// рисунок key: его квадрат size ложится в квадрат sz с центром (x,y); flip — зеркально; вылезающие части видны целиком
function put(g,dpr,key,x,y,sz,flip){const a=artGet(key);if(!a)return;const f=sz/a.size,s=sprite(key,f*dpr);if(!s)return;const b=s.b;
  if(flip){g.save();g.translate(x,y);g.scale(-1,1);g.drawImage(s.c,b.x0*f,b.y0*f,b.w*f,b.h*f);g.restore();}
  else g.drawImage(s.c,x+b.x0*f,y+b.y0*f,b.w*f,b.h*f);}
// белая вспышка рисунка (попадание)
const FL={};function flash(key,k){const s=sprite(key,k),id=key+'@'+k;if(!s)return null;let f=FL[id];if(f&&f.src===s.c)return f;const c=mkCanvas(s.c.width,s.c.height),q=c.getContext('2d');
  q.drawImage(s.c,0,0);q.globalCompositeOperation='source-atop';q.fillStyle='rgba(255,255,255,.8)';q.fillRect(0,0,c.width,c.height);return FL[id]={c,b:s.b,src:s.c};}
function putFlash(g,dpr,key,x,y,sz){const a=artGet(key);if(!a)return;const f=sz/a.size,s=flash(key,Math.max(.25,Math.round(f*dpr*8)/8));if(!s)return;const b=s.b;g.drawImage(s.c,x+b.x0*f,y+b.y0*f,b.w*f,b.h*f);}

/* ---------- текст ---------- */
function txt(g,s,x,y,px,col,o){o=o||{};g.font=font(o.w||800,px);g.textAlign=o.al||'center';g.textBaseline=o.base||'middle';
  if(o.max){const m=g.measureText(s).width;if(m>o.max){px*=o.max/m;g.font=font(o.w||800,px);}}
  if(o.sw!==0){g.lineWidth=o.sw||Math.max(2.5,px*.2);g.strokeStyle=o.sc||'rgba(42,22,8,.92)';g.strokeText(s,x,y);}
  g.fillStyle=col||'#fff';g.fillText(s,x,y);return px;}
// перенос строк по ширине
function wrap(g,s,px,w,wt){g.font=font(wt||700,px);const out=[];let line='';for(const word of String(s).split(' ')){const t=line?line+' '+word:word;if(g.measureText(t).width>w&&line){out.push(line);line=word;}else line=t;}if(line)out.push(line);return out;}

/* ---------- плашки, кнопки, лента ---------- */
function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
// пергамент в деревянной раме (как окна игры «Живая сказка»)
function parch(g,x,y,w,h){g.save();g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=18;g.shadowOffsetY=6;rr(g,x,y,w,h,16);g.fillStyle='#6b3f1f';g.fill();g.restore();
  let gr=g.createLinearGradient(x,y,x,y+h);gr.addColorStop(0,'#8a5630');gr.addColorStop(1,'#5a3218');rr(g,x,y,w,h,16);g.fillStyle=gr;g.fill();
  g.strokeStyle='#e6b53a';g.lineWidth=2;rr(g,x+5,y+5,w-10,h-10,12);g.stroke();
  gr=g.createRadialGradient(x+w/2,y+h*.4,10,x+w/2,y+h/2,Math.max(w,h)*.75);gr.addColorStop(0,'#fff6dc');gr.addColorStop(.7,'#f3dfb0');gr.addColorStop(1,'#d9b878');
  rr(g,x+9,y+9,w-18,h-18,9);g.fillStyle=gr;g.fill();g.strokeStyle='rgba(120,70,20,.35)';g.lineWidth=1;g.stroke();
  g.save();rr(g,x+9,y+9,w-18,h-18,9);g.clip();g.globalAlpha=.07;for(let i=0;i<40;i++){g.fillStyle=i%2?'#7a4a1a':'#fff';g.beginPath();g.arc(x+hash(i,1,7)*w,y+hash(i,2,7)*h,4+hash(i,3,7)*20,0,TAU);g.fill();}g.restore();}
// красная лента заголовка с золотой каймой
function ribbon(g,cx,cy,w,h,s,px){const x=cx-w/2,y=cy-h/2,k=h*.55;g.save();g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=8;g.shadowOffsetY=3;
  for(const d of[-1,1]){g.beginPath();const ex=cx+d*(w/2+k*.9);g.moveTo(cx+d*(w/2-k),y+h*.25);g.lineTo(ex,y+h*.25);g.lineTo(ex-d*k*.55,cy+h*.12+h*.25);g.lineTo(ex,y+h*1.25);g.lineTo(cx+d*(w/2-k),y+h*1.25);g.closePath();g.fillStyle='#8e1f1f';g.fill();}
  g.restore();const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#e0483a');gr.addColorStop(1,'#a8261f');rr(g,x,y,w,h,6);g.fillStyle=gr;g.fill();
  g.strokeStyle='#f2c94c';g.lineWidth=2.2;rr(g,x+3,y+3,w-6,h-6,4);g.stroke();txt(g,s,cx,cy+1,px||h*.5,'#fff7e0',{max:w-24,w:800});}
// кнопка: дерево/цвет, золотая кайма, «нажатие»; цель касания не меньше 64 px (pad)
function btn(st,x,y,w,h,label,fn,o){o=o||{};const g=st.g,dn=st.ptr.on&&st.ptr.btn&&st.ptr.btn.id===o.id&&o.id!=null,col=o.col||'#3f8f3a',dy=dn?2:0,r=o.r==null?Math.min(16,h/2):o.r;
  g.save();if(o.alpha!=null)g.globalAlpha=o.alpha;
  if(!o.flat){g.fillStyle='rgba(0,0,0,.35)';rr(g,x,y+5,w,h,r);g.fill();}
  const gr=g.createLinearGradient(0,y+dy,0,y+h+dy);gr.addColorStop(0,o.dis?'#9a9488':shade(col,.28));gr.addColorStop(1,o.dis?'#6e685e':shade(col,-.22));
  rr(g,x,y+dy,w,h,r);g.fillStyle=gr;g.fill();g.lineWidth=2.5;g.strokeStyle=o.dis?'#cfc6b0':(o.rim||'#f2c94c');g.stroke();
  g.globalAlpha*=.35;rr(g,x+4,y+dy+3,w-8,h*.42,r*.8);g.fillStyle='#fff';g.fill();g.globalAlpha=o.alpha==null?1:o.alpha;
  if(o.draw)o.draw(g,x,y+dy,w,h);
  if(label)txt(g,label,x+w/2+(o.lx||0),y+h/2+dy+1,o.px||Math.min(24,h*.4),'#fff',{max:w-(o.lx?Math.abs(o.lx)*2+16:16)});
  g.restore();const pad=Math.max(0,(64-Math.min(w,h))/2);st.btns.push({x,y,w,h,pad,fn,dis:o.dis,id:o.id});}

/* ---------- значки кодом (без эмодзи) ---------- */
const ICO={
  star(g,x,y,r,col){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}g.closePath();
    const gr=g.createLinearGradient(0,y-r,0,y+r);gr.addColorStop(0,col?shade(col,.35):'#fff3a0');gr.addColorStop(1,col||'#e6a21a');g.fillStyle=gr;g.fill();g.lineWidth=Math.max(1.5,r*.12);g.strokeStyle='#7a4a08';g.stroke();},
  starE(g,x,y,r){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}g.closePath();g.fillStyle='rgba(60,35,15,.35)';g.fill();g.lineWidth=Math.max(1.5,r*.1);g.strokeStyle='rgba(90,55,20,.6)';g.stroke();},
  heart(g,x,y,r,col){g.beginPath();g.moveTo(x,y+r*.85);g.bezierCurveTo(x-r*1.4,y-r*.1,x-r*.6,y-r*1.1,x,y-r*.35);g.bezierCurveTo(x+r*.6,y-r*1.1,x+r*1.4,y-r*.1,x,y+r*.85);
    g.fillStyle=col||'#e0303a';g.fill();g.lineWidth=r*.14;g.strokeStyle='#5a1010';g.stroke();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(x-r*.42,y-r*.38,r*.2,r*.13,-.6,0,TAU);g.fill();},
  shield(g,x,y,r){g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x+r*.9,y-r*.75,x+r*.85,y-r*.2);g.quadraticCurveTo(x+r*.75,y+r*.6,x,y+r);g.quadraticCurveTo(x-r*.75,y+r*.6,x-r*.85,y-r*.2);g.quadraticCurveTo(x-r*.9,y-r*.75,x,y-r);g.closePath();
    const gr=g.createLinearGradient(x-r,y-r,x+r,y+r);gr.addColorStop(0,'#ffe680');gr.addColorStop(1,'#c88a12');g.fillStyle=gr;g.fill();g.lineWidth=r*.12;g.strokeStyle='#6a3e06';g.stroke();
    g.beginPath();g.moveTo(x,y-r*.62);g.lineTo(x,y+r*.6);g.moveTo(x-r*.5,y-r*.1);g.lineTo(x+r*.5,y-r*.1);g.lineWidth=r*.16;g.strokeStyle='#b8322e';g.stroke();},
  cap(g,x,y,r){ // шапка-невидимка: высокая меховая шапка-колпак с переливом и звёздочками
    const gr=g.createLinearGradient(x-r,y-r*1.2,x+r,y+r*.2);gr.addColorStop(0,'#c8b0ff');gr.addColorStop(.5,'#6ad0ff');gr.addColorStop(1,'#8a5aff');
    g.beginPath();g.moveTo(x-r*.72,y+r*.2);g.bezierCurveTo(x-r*.85,y-r*.6,x-r*.3,y-r*1.1,x+r*.15,y-r*1.15);g.quadraticCurveTo(x+r*.35,y-r*1.18,x+r*.3,y-r*.95);g.bezierCurveTo(x+r*.7,y-r*.7,x+r*.8,y-r*.2,x+r*.72,y+r*.2);g.closePath();
    g.fillStyle=gr;g.fill();g.lineWidth=r*.09;g.strokeStyle='#2a1a60';g.stroke();
    g.beginPath();g.arc(x+r*.2,y-r*1.12,r*.16,0,TAU);g.fillStyle='#fff3a0';g.fill();g.stroke();
    g.beginPath();g.ellipse(x,y+r*.28,r*.95,r*.32,0,0,TAU);const fr=g.createLinearGradient(0,y,0,y+r*.6);fr.addColorStop(0,'#c08a5a');fr.addColorStop(1,'#7a4a24');g.fillStyle=fr;g.fill();g.strokeStyle='#3a200c';g.stroke();
    g.strokeStyle='rgba(60,30,10,.5)';g.lineWidth=r*.05;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(x+i*r*.24,y+r*.08);g.lineTo(x+i*r*.26,y+r*.48);g.stroke();}
    g.fillStyle='rgba(255,255,255,.85)';for(const [a,b,s] of[[-.35,-.45,.14],[.25,-.6,.1],[.05,-.15,.08],[.5,-.25,.07]])fx4(g,x+a*r,y+b*r,s*r*1.6);},
  film(g,x,y,r){rr(g,x-r,y-r*.7,r*2,r*1.4,r*.25);g.fillStyle='#2a2a36';g.fill();g.beginPath();g.moveTo(x-r*.25,y-r*.38);g.lineTo(x+r*.42,y);g.lineTo(x-r*.25,y+r*.38);g.closePath();g.fillStyle='#fff';g.fill();},
  arrow(g,x,y,r,a,col){g.save();g.translate(x,y);g.rotate(a||0);g.beginPath();g.moveTo(r,0);g.lineTo(-r*.2,-r*.8);g.lineTo(-r*.2,-r*.32);g.lineTo(-r,-r*.32);g.lineTo(-r,r*.32);g.lineTo(-r*.2,r*.32);g.lineTo(-r*.2,r*.8);g.closePath();
    g.fillStyle=col||'#ffd84a';g.fill();g.lineWidth=r*.14;g.strokeStyle='#5a3208';g.stroke();g.restore();},
  roots(g,x,y,r,a){g.save();g.globalAlpha*=a==null?1:a;g.strokeStyle='#5b3a1c';g.lineWidth=r*.18;for(let i=0;i<6;i++){const q=i/6*TAU+.3;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(q+.5)*r*.6,y+Math.sin(q+.5)*r*.4,x+Math.cos(q)*r,y+Math.sin(q)*r*.6);g.stroke();}
    g.strokeStyle='#8a6a3a';g.lineWidth=r*.07;for(let i=0;i<6;i++){const q=i/6*TAU+.3;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(q+.5)*r*.6,y+Math.sin(q+.5)*r*.4,x+Math.cos(q)*r,y+Math.sin(q)*r*.6);g.stroke();}g.restore();}
};
function fx4(g,x,y,r){g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r,y);g.quadraticCurveTo(x,y,x,y-r);g.fill();}

/* ---------- частицы «сочности» (как fx.js: облачка, искры, монетки, всплывающие числа) ---------- */
function cloud(){return typeof fxCloud==='function'?fxCloud():null;}
function fxAdd(st,p){p.t=0;p.dur=p.dur||1;st.fx.push(p);if(st.fx.length>260)st.fx.shift();return p;}
function burst(st,x,y,n,o){o=o||{};for(let i=0;i<n;i++){const a=Math.random()*TAU,v=(o.v||120)*(.4+Math.random()*.8);
  fxAdd(st,{k:o.k||'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(o.up||40),g:o.g==null?260:o.g,r:(o.r||5)*(.6+Math.random()*.7),col:o.col||'#ffd84a',dur:(o.dur||.7)*(.7+Math.random()*.5),rot:Math.random()*TAU,vr:(Math.random()-.5)*8});}}
function puff(st,x,y,r,n,o){o=o||{};for(let i=0;i<(n||5);i++){const a=Math.random()*TAU;fxAdd(st,{k:'puff',x:x+Math.cos(a)*r*.3,y:y+Math.sin(a)*r*.2,vx:Math.cos(a)*r*1.2,vy:Math.sin(a)*r*.6-r*.4,r:r*(.5+Math.random()*.4),dur:o.dur||.7,col:o.col,g:0});}}
function num(st,x,y,s,col,px){fxAdd(st,{k:'num',x,y,vx:0,vy:-46,g:0,s,col:col||'#fff',px:px||22,dur:1.1});}
function fxRun(st,g,dt){const cl=cloud();for(let i=st.fx.length-1;i>=0;i--){const p=st.fx[i];p.t+=dt;if(p.t>=p.dur){st.fx.splice(i,1);continue;}
    p.vy+=(p.g||0)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.vr)p.rot+=p.vr*dt;const q=p.t/p.dur;
    if(p.k==='spark'){g.globalAlpha=Math.min(1,(1-q)*1.6);g.fillStyle=p.col;fx4(g,p.x,p.y,p.r*(1-q*.4));}
    else if(p.k==='dot'){g.globalAlpha=(1-q);g.fillStyle=p.col;g.beginPath();g.arc(p.x,p.y,p.r*(1-q*.5),0,TAU);g.fill();}
    else if(p.k==='leaf'){g.save();g.globalAlpha=Math.min(1,(1-q)*2);g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.col;g.beginPath();g.ellipse(0,0,p.r,p.r*.45,0,0,TAU);g.fill();g.restore();}
    else if(p.k==='puff'&&cl){const e=1-(1-q)*(1-q),r=p.r*(.6+e*.8);g.globalAlpha=Math.max(0,.9*(1-q*q));g.drawImage(cl,p.x-r,p.y-r,r*2,r*2);}
    else if(p.k==='ring'){g.globalAlpha=(1-q);g.strokeStyle=p.col||'#fff';g.lineWidth=(p.w||4)*(1-q)+1;g.beginPath();g.ellipse(p.x,p.y,p.r*(.3+q),p.r*(.3+q)*(p.fl||1),0,0,TAU);g.stroke();}
    else if(p.k==='num'){const k=p.t<.15?1+(1-p.t/.15)*.6:1;g.globalAlpha=q<.7?1:(1-q)/.3;txt(g,p.s,p.x,p.y,p.px*k,p.col);}
    else if(p.k==='img'&&p.draw){g.globalAlpha=q<.75?1:(1-q)/.25;p.draw(g,p,q);}
  }g.globalAlpha=1;}

/* ---------- окно итогов: ступени-звёзды, счёт, рекорд, своё содержимое ---------- */
function rec(id){try{return +(JSON.parse(localStorage.getItem('oborona-mgd-rec')||'{}')[id]||0);}catch(e){return 0;}}
function setRec(id,v){try{const o=JSON.parse(localStorage.getItem('oborona-mgd-rec')||'{}');o[id]=v;localStorage.setItem('oborona-mgd-rec',JSON.stringify(o));}catch(e){}}
// o: {title, tier 0..3, score, rec, sub, body(g,x,y,w,h) — своё содержимое, bodyH, btn, onDone}; рисовать каждый кадр через drawResult
function result(st,o){st.res=Object.assign({t0:st.t,shown:0},o);st.res.played=[];}
function drawResult(st){const R=st.res;if(!R)return;if(R.auto&&st.t-R.t0>R.auto&&!R.done){R.done=1;R.onDone&&R.onDone();return;}const g=st.g,W=st.W,H=st.H,a=Math.min(1,(st.t-R.t0)/.35);
  g.fillStyle='rgba(12,8,4,'+(.6*a)+')';g.fillRect(0,0,W,H);
  const w=Math.min(W-24,R.wide?Math.min(760,W-24):440),bh=R.bodyH||0,h=Math.min(H-24,(R.tier!=null?170:70)+bh+(R.sub?24:0)+96),x=(W-w)/2,y0=(H-h)/2,y=y0+(1-ease.back(a))*60;
  g.globalAlpha=a;parch(g,x,y,w,h);ribbon(g,W/2,y+6,Math.min(w-70,320),44,R.title,22);
  const sy=y+76,sr=Math.min(30,w*.07);let cy=y+64;if(R.tier!=null){
  for(let i=0;i<3;i++){const ti=st.t-R.t0-.45-i*.38,sx=W/2+(i-1)*sr*2.5,yy=sy+(i===1?-6:4);
    if(i<R.tier&&ti>0){if(!R.played[i]){R.played[i]=1;sfx('star',i);burst(st,sx,yy,12,{r:6,v:160,dur:.6});}const k=ease.back(Math.min(1,ti/.35));g.save();g.translate(sx,yy);g.scale(k,k);ICO.star(g,0,0,sr);g.restore();}
    else ICO.starE(g,sx,yy,sr);}
  cy=sy+sr+22;}
  if(R.score!=null){txt(g,Lg('Счёт: ','Score: ')+R.score,W/2,cy,22,'#5a2e0a',{sw:0,w:800});cy+=24;}
  if(R.rec){const k=1+.06*Math.sin(st.t*6);g.save();g.translate(W/2,cy+2);g.scale(k,k);txt(g,Lg('Новый рекорд!','New record!'),0,0,18,'#ffd84a',{sc:'#8a1a1a',sw:4});g.restore();cy+=24;}
  if(R.sub){for(const l of wrap(g,R.sub,16,w-50)){txt(g,l,W/2,cy,16,'#6a3a12',{sw:0,w:700});cy+=20;}}
  if(R.body){g.save();R.body(g,x+16,cy+4,w-32,bh);g.restore();}
  const bw=Math.min(240,w-60);btn(st,W/2-bw/2,y+h-72,bw,54,R.btn||Lg('Дальше','Continue'),()=>{if(R.done)return;R.done=1;R.onDone&&R.onDone();},{id:'res',col:'#3f8f3a',px:22,dis:st.t-R.t0<.6});
  g.globalAlpha=1;}

return {FONT,font,ease,sfx,stage,sprite,put,putFlash,txt,wrap,rr,parch,ribbon,btn,ICO,fx4,fxAdd,burst,puff,num,fxRun,result,drawResult,rec,setRec,cloud};
})();
