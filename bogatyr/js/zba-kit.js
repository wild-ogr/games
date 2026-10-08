'use strict';
/* BGA (08.10) — набор для забав BGA (js/zba-kit.js): №1 «Кузнецова наковальня», №9 «Сбор трав для зелья», №10 «Гадание у колодца».
   Основа — mg-ckit.js Обороны (ветка ob-final), ПЕРЕИМЕНОВАНО: всё внутри IIFE, наружу только window.ZBA (префикс zba — грабля «одинаковые имена» из Обороны).
   Игра — объект G: {id, title(o), rules(o,st)→[[ключ рисунка, текст]], tiers(o)→[t1,t2,t3], dur(o), init(st,keep), step(st,dt), draw(st,g,UI),
     down/move/up(st,x,y), key(st,k)→bool, bot(st,dt,skill), idle(st,dt), endTitle(st), endLine(st), extra(st), pick(st) — выбор в окне «как играть»,
     pcHint(st)→[[клавиши], текст] — подсказка ПК в первые секунды}. Логика (init/step/bot) не трогает холст — бот гоняет ту же игру без рисования.
   Регистрация: ZBA.reg(G,{num,n:zabN(..),icon,kind,open,en}) → ZAB_REG ядра (js/zab-core.js от BG0), плюс sim(o,k) для zbBot; ядра нет — игра ждёт в ZBA.G.
   Стенд с ядром: ?zab=<id> (окно итогов и награды — ядро). Стенд без ядра: ?zba=<id> (&train=1 &calm=1 &lvl=N &seed=N) — своя простая оболочка (host по договору mg-core Обороны). */
(function(){
const TAU2=Math.PI*2;
const K={spr:{},nspr:0,dpr:1,font:'"BgF",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',G:{},pend:[],cur:null};
function isPC(){try{return !!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches)||/[?&]zbapc=1/.test(location.search);}catch(e){return false;}}
function rnd(seed){seed=seed>>>0;return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const cl=(v,a,b)=>v<a?a:v>b?b:v;
function ease(t){t=cl(t,0,1);return 1-(1-t)*(1-t)*(1-t);}
function back(t){t=cl(t,0,1);const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);}
function hexA(col,a){if(typeof rgba==='function')try{return rgba(col,a);}catch(e){}return col;}

/* ---------- спрайты из art.js (ART/drawArt): квадрат size → холст q px, кэш с шагом 6 px ---------- */
function spr(key,px){const a=typeof ART!=='undefined'&&ART[key];if(!a)return null;const q=Math.max(12,Math.min(1024,Math.ceil(px*K.dpr/6)*6)),id=key+'@'+q;let s=K.spr[id];if(s)return s;
  if(K.nspr>400){K.spr={};K.nspr=0;}K.nspr++;return K.spr[id]={c:drawArt(key,q),s:a.size,f:null,d:null};}
function sprFl(s){if(!s.f){const c=s.c,f=mkCanvas(c.width,c.height),g=f.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,255,255,.7)';g.fillRect(0,0,f.width,f.height);s.f=f;}return s.f;}
function sprSil(s,col){if(!s.d){const c=s.c,f=mkCanvas(c.width,c.height),g=f.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=col||'#05060f';g.fillRect(0,0,f.width,f.height);s.d=f;}return s.d;}
/* рисунок key в квадрат sz с центром (x,y); o: {fx:-1 зеркально, rot, a, sx, sy, fl (вспышка), sil (силуэт)} */
function put(g,key,x,y,sz,o){const s=spr(key,sz);if(!s)return;o=o||{};g.save();g.translate(x,y);if(o.rot)g.rotate(o.rot);g.scale((o.fx||1)*(o.sx||1),o.sy||1);
  if(o.a!=null)g.globalAlpha*=cl(o.a,0,1);g.drawImage(o.sil?sprSil(s,o.sil===true?null:o.sil):o.fl?sprFl(s):s.c,-sz/2,-sz/2,sz,sz);g.restore();}
function glow(col){return typeof glowSpr==='function'?glowSpr(col):null;}
function glowAt(g,col,x,y,r,a){const s=glow(col);if(!s)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha*=a==null?1:a;g.drawImage(s,x-r,y-r,r*2,r*2);g.restore();}
function canvas(w,h){return mkCanvas(w,h);}

/* ---------- надписи ---------- */
function font(px,w){return (w||800)+' '+Math.round(px)+'px '+K.font;}
function text(g,s,x,y,px,o){o=o||{};g.font=font(px,o.w);g.textAlign=o.al||'center';g.textBaseline=o.bl||'middle';g.lineJoin='round';
  if(o.mw){const w=g.measureText(s).width;if(w>o.mw){px=px*o.mw/w;g.font=font(px,o.w);}}
  if(o.sh!==false){g.fillStyle=o.shc||'rgba(30,14,4,.45)';g.fillText(s,x,y+Math.max(1.5,px*.07));}
  if(o.st!==false){g.strokeStyle=o.stc||'#3b2412';g.lineWidth=o.lw||Math.max(3,px*.2);g.strokeText(s,x,y);}
  g.fillStyle=o.c||'#fff';g.fillText(s,x,y);}
function wrap(g,s,maxW,px,w){g.font=font(px,w);const out=[];for(const para of String(s).split('\n')){let line='';for(const word of para.split(' ')){const t=line?line+' '+word:word;if(g.measureText(t).width>maxW&&line){out.push(line);line=word;}else line=t;}out.push(line);}return out;}
function rr(g,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
/* пергамент в деревянной раме */
function panel(g,x,y,w,h,r){g.save();g.fillStyle='rgba(10,6,2,.4)';rr(g,x+2,y+7,w,h,r);g.fill();
  const gw=g.createLinearGradient(0,y,0,y+h);gw.addColorStop(0,'#b0763c');gw.addColorStop(1,'#6e4019');g.fillStyle=gw;rr(g,x,y,w,h,r);g.fill();
  g.strokeStyle='rgba(255,220,160,.35)';g.lineWidth=1.5;rr(g,x+1.5,y+1.5,w-3,h-3,r-1);g.stroke();
  const p=Math.max(5,r*.32),gp=g.createLinearGradient(0,y,0,y+h);gp.addColorStop(0,'#fff6dc');gp.addColorStop(1,'#f0d7a2');g.fillStyle=gp;rr(g,x+p,y+p,w-2*p,h-2*p,r*.7);g.fill();
  g.strokeStyle='rgba(110,67,31,.35)';g.lineWidth=1.5;rr(g,x+p+3,y+p+3,w-2*p-6,h-2*p-6,r*.6);g.stroke();g.restore();}
/* красная лента заголовка с «ушами» */
function ribbon(g,cx,y,w,h,s){g.save();const e=h*.55;
  for(const d of[-1,1]){const x0=cx+d*(w/2-e*.3);g.fillStyle='#a82c17';g.beginPath();g.moveTo(x0,y+h*.25);g.lineTo(x0+d*e*1.3,y+h*.25);g.lineTo(x0+d*e*.85,y+h*.25+h*.45);g.lineTo(x0+d*e*1.3,y+h*1.15);g.lineTo(x0,y+h*1.15);g.closePath();g.fill();
    g.fillStyle='#7a1e0e';g.beginPath();g.moveTo(x0,y+h);g.lineTo(x0+d*e*.4,y+h*1.15);g.lineTo(x0,y+h*1.15);g.fill();}
  const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#f2573a');gr.addColorStop(1,'#c9361d');g.fillStyle=gr;rr(g,cx-w/2,y,w,h,h*.18);g.fill();
  g.fillStyle='rgba(255,255,255,.22)';rr(g,cx-w/2+4,y+3,w-8,h*.32,h*.14);g.fill();
  let px=h*.56;g.font=font(px,900);while(g.measureText(s).width>w-24&&px>10){px-=1;g.font=font(px,900);}
  text(g,s,cx,y+h*.53,px,{stc:'#7a1e0e',lw:px*.22,w:900});g.restore();}
/* пухлая кнопка с «губой»: 'o' оранжевая, 'b' синяя (ролик), 'g' зелёная, 'p' бумажная */
function btn(g,b,s,kind,press,icon){const C={o:['#ffb03a','#f07d12','#a04e06','#fff'],b:['#5aa2f5','#2f6fd0','#1c3f78','#fff'],g:['#7cc94e','#4a9a2c','#2c6a16','#fff'],p:['#fffaf0','#f1e0bb','#c9a36a','#3b2412']}[kind||'o'];
  const d=press?3:0,lip=Math.max(4,b.h*.09);g.save();g.fillStyle='rgba(20,10,4,.3)';rr(g,b.x,b.y+lip+2,b.w,b.h,b.h*.3);g.fill();
  g.fillStyle=C[2];rr(g,b.x,b.y+d,b.w,b.h+lip-d,b.h*.3);g.fill();
  const gr=g.createLinearGradient(0,b.y+d,0,b.y+b.h+d);gr.addColorStop(0,C[0]);gr.addColorStop(1,C[1]);g.fillStyle=gr;rr(g,b.x,b.y+d,b.w,b.h,b.h*.3);g.fill();
  g.fillStyle='rgba(255,255,255,.28)';rr(g,b.x+5,b.y+d+4,b.w-10,b.h*.3,b.h*.15);g.fill();
  let px=b.h*.4;g.font=font(px,900);const iw=icon?px*1.5:0;while(g.measureText(s).width+iw>b.w-20&&px>10){px-=1;g.font=font(px,900);}
  const tw=g.measureText(s).width,x0=b.x+b.w/2-(tw+iw)/2;if(icon)put(g,icon,x0+px*.6,b.y+d+b.h/2,px*1.4);
  text(g,s,x0+iw+tw/2,b.y+d+b.h*.52,px,kind==='p'?{c:C[3],st:false,sh:false,w:900}:{stc:C[2],lw:px*.18,sh:false,w:900});g.restore();}
function inB(b,x,y){return b&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h+6;}
/* звёздочка ступени (рисованная) */
function star(g,x,y,r,on,gl){g.save();if(on&&gl>0)glowAt(g,'#ffd84a',x,y,r*2.2,gl);
  g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.47:r;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}g.closePath();
  if(on){const gr=g.createRadialGradient(x-r*.3,y-r*.4,r*.1,x,y,r);gr.addColorStop(0,'#fff3a0');gr.addColorStop(.6,'#ffb81c');gr.addColorStop(1,'#e08a0c');g.fillStyle=gr;}else g.fillStyle='#d8c8a2';
  g.fill();g.lineWidth=Math.max(2,r*.13);g.lineJoin='round';g.strokeStyle=on?'#a8650c':'#a8987a';g.stroke();
  if(on){g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(x-r*.22,y-r*.3,r*.2,r*.12,-.6,0,TAU2);g.fill();}g.restore();}
/* значок клавиши (ПК) */
function keycap(g,x,y,lbl,px){px=px||24;g.font=font(px*.62,900);const w=Math.max(px,g.measureText(String(lbl)).width+px*.55);g.save();g.fillStyle='rgba(30,18,8,.55)';rr(g,x-w/2,y-px/2+3,w,px,px*.22);g.fill();
  const gr=g.createLinearGradient(0,y-px/2,0,y+px/2);gr.addColorStop(0,'#fffaf0');gr.addColorStop(1,'#e6d2a8');g.fillStyle=gr;rr(g,x-w/2,y-px/2,w,px,px*.22);g.fill();g.strokeStyle='#5a3a1a';g.lineWidth=Math.max(1.5,px*.07);g.stroke();
  g.textAlign='center';g.textBaseline='middle';g.fillStyle='#3a2410';g.fillText(String(lbl),x,y+px*.04);g.restore();return w;}
function pill(g,x,y,w,h){g.fillStyle='rgba(20,10,4,.35)';rr(g,x+1,y+3,w,h,h/2);g.fill();g.fillStyle='rgba(42,24,12,.84)';rr(g,x,y,w,h,h/2);g.fill();
  g.strokeStyle='rgba(255,233,184,.55)';g.lineWidth=2;rr(g,x+1.5,y+1.5,w-3,h-3,h/2-1.5);g.stroke();}

/* ---------- частицы, облачка, всплывающие числа ---------- */
function part(st,p){if(st.pt.length<(st.lite?120:260))st.pt.push(Object.assign({t:0,dur:.6,vx:0,vy:0,gr:0,s:3,col:'#ffe27a'},p));}
function sparks(st,x,y,n,col,v,o){o=o||{};for(let i=0;i<n;i++){const a=(o.a0!=null?o.a0:0)+(o.spr!=null?(st.fr()-.5)*o.spr:st.fr()*TAU2),s=(v||120)*(.5+st.fr()*.7);
  part(st,{x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,gr:o.gr!=null?o.gr:200,dur:(o.dur||.55)*(.7+st.fr()*.6),s:(o.s||3)*(.7+st.fr()*.6),col,k:o.k});}}
function puff(st,x,y,r,col){st.fx.push({k:'puf',x,y,r,t:0,dur:.6,a:st.fr()*TAU2,col:col||'#ffffff'});}
function num(st,x,y,s,col,big){st.nums.push({x,y,s,col:col||'#fff2a8',t:0,big:!!big});}
function fxStep(st,dt){for(const p of st.pt){p.t+=dt;p.vy+=p.gr*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}st.pt=st.pt.filter(p=>p.t<p.dur);
  for(const f of st.fx)f.t+=dt;st.fx=st.fx.filter(f=>f.t<f.dur);for(const n of st.nums)n.t+=dt;st.nums=st.nums.filter(n=>n.t<1.1);}
function fxDraw(st,g){const k=st.k;
  for(const f of st.fx)if(f.k==='puf'){const q=f.t/f.dur,e=1-(1-q)*(1-q),r=f.r*(.5+e*.9);g.save();g.globalAlpha=Math.max(0,.75*(1-q*q));
    for(let i=0;i<4;i++){const a=f.a+i*1.7,d=r*.45;g.fillStyle=f.col;g.beginPath();g.arc(f.x+Math.cos(a)*d,f.y+Math.sin(a)*d*.6-q*16*k,r*(.55-i*.06),0,TAU2);g.fill();}g.restore();}
  g.save();g.globalCompositeOperation='lighter';for(const p of st.pt){const q=p.t/p.dur,a=1-q*q,r=p.s*k*(1-q*.4)*3;g.globalAlpha=a;const s=glow(p.col);if(s)g.drawImage(s,p.x-r,p.y-r,r*2,r*2);
    if(p.k==='spark'){g.strokeStyle=p.col;g.lineWidth=p.s*k*.6;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.035,p.y-p.vy*.035);g.stroke();}}g.restore();g.globalAlpha=1;
  for(const n of st.nums){const q=n.t/1.1,pop=n.t<.16?1+(1-n.t/.16)*.6:1,px=(n.big?32:24)*k*(st.calm?1:pop);g.globalAlpha=q>.7?1-(q-.7)/.3:1;g.font=font(px,900);const hw=g.measureText(n.s).width/2+6;
    text(g,n.s,Math.max(hw,Math.min(st.W-hw,n.x)),n.y-q*40*k,px,{c:n.col,w:900});}g.globalAlpha=1;}

/* ---------- звук: через tone/noise/SND игры (выключенный звук — тишина) ---------- */
function tn(f,d,type,v,f2,delay){try{if(typeof tone==='function')tone(f,d,type,v,f2,delay);}catch(e){}}
function nz(d,v,fr,q){try{if(typeof noise==='function')noise(d,v,fr,q);}catch(e){}}
function snd(k,a){try{if(typeof SND!=='undefined'&&SND[k])SND[k](a);}catch(e){}}
function vib(ms){try{if(typeof vibrate==='function')vibrate(ms);}catch(e){}}

/* ---------- состояние (общее для живой игры и бота) ---------- */
function state(G,o,W,H){const st={pc:isPC(),o,calm:!!o.calm,lvl:o.lvl|0,W,H,k:Math.max(.78,Math.min(2,Math.min(W/390,H/700))),t:0,score:0,dur:G.dur(o),pt:[],fx:[],nums:[],combo:0,best:0,
  rnd:rnd(o.seed||1),fr:rnd((o.seed||1)^0x5bd1e995),lite:typeof document!=='undefined'&&document.body&&document.body.classList.contains('lite'),ev:[]};return st;}

/* ---------- живая игра ---------- */
function run(host,o,G){o=Object.assign({calm:false,lvl:0,seed:1,train:false,mode:'day',ctx:{}},o||{});
  const cv=document.createElement('canvas');cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none';host.el.appendChild(cv);
  const g=cv.getContext('2d');let W=0,H=0,dpr=1,raf=0,dead=false,last=0;
  const UI={host,ph:'intro',t:0,btn:null,ad:null,press:null,shown:0,rec:false,adUsed:false,picks:[]};let st=null;
  function size(){W=Math.max(200,host.w||innerWidth);H=Math.max(200,host.h||innerHeight);dpr=Math.min(2,host.dpr||devicePixelRatio||1);if(dpr!==K.dpr){K.spr={};K.nspr=0;}K.dpr=dpr;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
    const keep=st;st=state(G,o,W,H);if(keep){for(const k of['t','score','combo','best','ev','stats','dur','pickSel'])if(keep[k]!=null)st[k]=keep[k];if(keep.extra)st.extra=keep.extra;}
    st.live=true;G.init(st,keep);}
  size();host.onResize(()=>{size();});
  function tierOf(s){const T=G.tiers(st.o);let t=G.minTier||0;for(let i=0;i<3;i++)if(s>=T[i])t=Math.max(t,i+1);return t;}
  function finish(){if(UI.ph!=='play')return;UI.ph='end';UI.t=0;st.end=true;UI.tier=tierOf(st.score);if(G.onEnd)G.onEnd(st,UI.tier);snd(UI.tier>=3?'win':UI.tier>=2?'level':'chest');}
  function pos(e){const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height];}
  let pid=null;
  function down(e){if(dead||host.paused)return;e.preventDefault&&e.preventDefault();const [x,y]=pos(e);
    if(UI.ph==='intro'){if(inB(UI.btn,x,y)){UI.press=UI.btn;snd('click');setTimeout(()=>{UI.press=null;start();},110);return;}
      for(const p of UI.picks)if(inB(p,x,y)){pickSet(p.i);return;}return;}
    if(UI.ph==='end'){if(UI.t>1.3)send();return;}
    if(UI.ph!=='play')return;pid=e.pointerId;try{cv.setPointerCapture(e.pointerId);}catch(x){}G.down&&G.down(st,x,y,e.pointerType);}
  function move(e){if(dead)return;const [x,y]=pos(e);if(UI.ph==='play')G.move&&G.move(st,x,y,pid!=null,e.pointerType);else{UI.hov=null;for(const p of UI.picks)if(inB(p,x,y))UI.hov=p.i;}}
  function up(e){if(dead)return;pid=null;if(UI.ph!=='play')return;const [x,y]=pos(e);G.up&&G.up(st,x,y);}
  cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  function pickSet(i){const P=G.pick&&G.pick(st);if(!P||!P.items.length)return;i=(i+P.items.length)%P.items.length;if(P.set)P.set(st,i);st.pickSel=i;snd('click');}
  function key(e){if(dead||host.paused)return;if(host.root&&host.root.querySelector&&host.root.querySelector('.mgVeil,.zbVeil,.zabVeil'))return;
    if(UI.ph==='intro'){if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!e.repeat)start();return;}
      const P=G.pick&&G.pick(st);if(P&&P.items.length>1){const cur=st.pickSel|0;if(e.key==='ArrowLeft'){e.preventDefault();pickSet(cur-1);}else if(e.key==='ArrowRight'){e.preventDefault();pickSet(cur+1);}
        else if(/^[1-9]$/.test(e.key)&&+e.key<=P.items.length)pickSet(+e.key-1);}return;}
    if(UI.ph==='end'&&UI.t>1.3&&(e.key==='Enter'||e.key===' ')){e.preventDefault();send();return;}
    if(UI.ph==='play'&&G.key){if(e.repeat&&!/^Arrow/.test(e.key))return;if(G.key(st,e.key,e))e.preventDefault();}}
  window.addEventListener('keydown',key);
  function start(){if(UI.ph!=='intro')return;UI.ph='go';UI.t=0;st.t=0;st.score=0;st.combo=0;st.best=0;G.init(st);if(G.onStart)G.onStart(st);}
  function send(){if(UI.sent)return;UI.sent=1;const r={score:st.score,tier:UI.tier,rec:UI.rec,extra:Object.assign({best:st.best},st.extra||{},G.extra?G.extra(st,UI.tier):{})};host.done(r);}
  function frame(ts){if(dead)return;raf=requestAnimationFrame(frame);const now=ts/1000;let dt=last?now-last:0;last=now;dt=Math.min(.05,Math.max(0,dt));
    if(host.paused)return;UI.t+=dt;
    if(UI.ph==='go'&&UI.t>1.1){UI.ph='play';UI.t=0;}
    if(UI.ph==='play'){st.t+=dt;G.step(st,dt);if(st.t>=st.dur||st.over)finish();}
    else if(G.idle)G.idle(st,dt);
    if(UI.ph==='end'&&UI.t>3.4&&!UI.sent)send();
    fxStep(st,dt);draw();}
  function draw(){const cur=UI.ph==='play'&&G.cursor?G.cursor(st):'default';if(cv.style.cursor!==cur)cv.style.cursor=cur;g.setTransform(dpr,0,0,dpr,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
    G.draw(st,g,UI);fxDraw(st,g);
    if(UI.ph==='play'||UI.ph==='go')hud(st,g,G,UI);
    if(UI.ph==='play'&&st.pc&&G.pcHint&&st.t<5)pcTip(st,g,G);
    if(UI.ph==='intro')intro(st,g,G,UI);if(UI.ph==='go')goTxt(st,g,UI);if(UI.ph==='end')endScr(st,g,G,UI);}
  host.onQuit(()=>{dead=true;cancelAnimationFrame(raf);window.removeEventListener('keydown',key);});
  raf=requestAnimationFrame(frame);
  K.cur={st:()=>st,ui:UI,start,finish,G,send};
  return K.cur;}

/* верхняя плашка: счёт слева, полоска времени; справа — место под ✕ оболочки */
function hud(st,g,G,UI){const k=st.k,W=st.W,top=Math.max(8,(G.hudTop||0))+6*k,h=46*k,sx=10*k,sw=Math.max(98*k,Math.min(150*k,W*.3));
  g.save();pill(g,sx,top,sw,h);const sc=UI.ph==='go'?0:st.score;
  if(G.hudIcon)put(g,G.hudIcon,sx+h*.55,top+h/2,h*.82);text(g,G.hudScore?G.hudScore(st,sc):String(sc),sx+h*1.08,top+h*.53,h*.5,{al:'left',c:'#fff3c4',w:900});
  const bx=sx+sw+10*k,bw=Math.max(60,Math.min(420*k,W-bx-74*k)),q=Math.max(0,1-st.t/st.dur);
  if(G.hudBar){G.hudBar(st,g,bx,top,bw,h);g.restore();if(G.hudExtra)G.hudExtra(st,g,top+h+8*k);return;}
  pill(g,bx,top+h*.18,bw,h*.64);const ix=bx+5*k,iw=bw-10*k,iy=top+h*.32,ih=h*.36;
  g.fillStyle='rgba(0,0,0,.35)';rr(g,ix,iy,iw,ih,ih/2);g.fill();
  const gr=g.createLinearGradient(ix,0,ix+iw,0);const C=G.barCol||['#ffcf4a','#ff8a1e'];gr.addColorStop(0,C[0]);gr.addColorStop(1,C[1]);g.fillStyle=gr;
  if(q>0){rr(g,ix,iy,Math.max(ih,iw*q),ih,ih/2);g.fill();g.fillStyle='rgba(255,255,255,.35)';rr(g,ix+3,iy+2,Math.max(ih-6,iw*q-6),ih*.35,ih*.2);g.fill();}
  const left=Math.ceil(st.dur-st.t);
  text(g,UI.ph==='go'?String(Math.ceil(st.dur)):String(Math.max(0,left)),bx+bw/2,iy+ih/2+1,h*.36,{c:left<=5&&UI.ph==='play'?'#ffd0c0':'#fff'});
  if(st.combo>=3&&UI.ph==='play'&&!G.noCombo)text(g,L('серия ×','streak ×')+st.combo,sx+8*k,top+h+16*k,17*k,{al:'left',c:'#ffe27a'});
  g.restore();if(G.hudExtra)G.hudExtra(st,g,top+h+8*k);}
/* подсказка ПК в первые секунды: клавиши + текст внизу */
function pcTip(st,g,G){const P=G.pcHint(st);if(!P)return;const k=st.k,a=Math.min(1,(5-st.t)/.6,st.t/.3),y=st.H-(G.tipY?G.tipY(st):40*k),px=26*k;g.save();g.globalAlpha=Math.max(0,a);
  g.font=font(16*k,800);const tw=g.measureText(P[1]).width,kw=P[0].reduce((s,x)=>s+Math.max(px,(String(x).length)*px*.36+px*.55)+6*k,0),w=kw+tw+40*k;
  pill(g,st.W/2-w/2,y-22*k,w,44*k);let x=st.W/2-w/2+18*k;for(const kk of P[0]){const kw1=keycap(g,x+Math.max(px,String(kk).length*px*.36+px*.55)/2,y,kk,px);x+=kw1+6*k;}
  text(g,P[1],x+6*k,y+1,16*k,{al:'left',c:'#fff3c4'});g.restore();}

/* окно «как играть»: лента, строки с рисунками, выбор (pick), кнопка «Начать» (≥ 64 px), на ПК — «Enter — начать» */
function intro(st,g,G,UI){const W=st.W,H=st.H,k=Math.min(st.k,Math.max(.78,H/760)),a=ease(UI.t/.35);g.save();g.fillStyle='rgba(10,8,20,'+(.5*a)+')';g.fillRect(0,0,W,H);
  const pw=Math.min(W-28,440*k),rules=G.rules(st.o,st),lh=Math.max(52,56*k),P=G.pick&&G.pick(st),pkH=P&&P.items.length?118*k:0,
    ph=78*k+rules.length*lh+pkH+(st.pc?118:88)*Math.max(.9,k)+(st.o.train?26*k:0);
  const px=(W-pw)/2,py=Math.max(54,(H-ph)/2+(1-a)*40);g.globalAlpha=a;panel(g,px,py,pw,ph,20*k);
  ribbon(g,W/2,py-18*k,Math.min(pw+20*k,W-8),52*k,G.title(st.o,st));
  let y=py+52*k;const tx=px+26*k+lh;
  for(const [key,txt] of rules){const bob=st.calm?0:Math.sin(UI.t*3+y)*2*k;put(g,key,px+22*k+lh*.45,y+lh*.42+bob,lh*.86);
    let fp=Math.max(14,16*k);let L2=wrap(g,txt,pw-(tx-px)-20*k,fp,600);if(L2.length>2){fp=Math.max(13,14*k);L2=wrap(g,txt,pw-(tx-px)-20*k,fp,600);}
    g.fillStyle='#3b2412';g.font=font(fp,600);g.textAlign='left';g.textBaseline='middle';L2.forEach((s,i)=>g.fillText(s,tx,y+lh*.42+(i-(L2.length-1)/2)*fp*1.18));y+=lh;}
  UI.picks=[];
  if(P&&P.items.length){text(g,P.title,W/2,y+10*k,16*k,{c:'#7a3a10',st:false,sh:false,w:900});const n=P.items.length,tw=Math.min(96*k,(pw-40*k)/n-8*k),th=78*k,x0=W/2-(n*tw+(n-1)*10*k)/2,sel=st.pickSel|0;
    P.items.forEach((it,i)=>{const b={x:x0+i*(tw+10*k),y:y+24*k,w:tw,h:th,i},on=i===sel,hv=UI.hov===i;g.save();
      g.fillStyle=on?'#ffe9a8':'rgba(110,67,31,.12)';rr(g,b.x,b.y,b.w,b.h,14*k);g.fill();g.lineWidth=on?3.5*k:2*k;g.strokeStyle=on?'#e08a0c':hv?'#b07a40':'rgba(110,67,31,.35)';g.stroke();
      if(on)glowAt(g,'#ffd84a',b.x+b.w/2,b.y+th*.38,th*.5,.5);put(g,it.key,b.x+b.w/2,b.y+th*.4,th*.56);
      const lp=wrap(g,it.label,b.w-6*k,12*k,800);g.fillStyle='#3b2412';g.font=font(lp.length>1?11*k:12*k,800);g.textAlign='center';g.textBaseline='middle';lp.slice(0,2).forEach((s,j)=>g.fillText(s,b.x+b.w/2,b.y+th*.82+(j-(Math.min(2,lp.length)-1)/2)*12*k));
      if(st.pc&&n>1)keycap(g,b.x+12*k,b.y+12*k,String(i+1),18*k);g.restore();UI.picks.push(b);});
    y+=pkH;}
  if(st.o.train){text(g,L('Тренировка: без наград, только рекорд','Practice: no rewards, record only'),W/2,y+8*k,13*k,{c:'#6a4a2a',st:false,sh:false,w:600});y+=26*k;}
  const bh=Math.max(64,62*k),bw=Math.min(pw-48*k,280*k);UI.btn={x:W/2-bw/2,y:y+8*k,w:bw,h:bh};btn(g,UI.btn,L('Начать!','Start!'),'o',UI.press===UI.btn);
  if(st.pc){const yy=UI.btn.y+bh+28*k;g.font=font(14*k,700);const t1=L('— начать','— start'),w1=keycap(g,0,-999,'Enter',22*k),w2=keycap(g,0,-999,L('Пробел','Space'),22*k),tw=g.measureText(t1).width,ttl=w1+w2+tw+30*k;let x=W/2-ttl/2;
    keycap(g,x+w1/2,yy,'Enter',22*k);x+=w1+6*k;text(g,'/',x+4*k,yy,14*k,{c:'#6a4a2a',st:false,sh:false});x+=14*k;keycap(g,x+w2/2,yy,L('Пробел','Space'),22*k);x+=w2+8*k;text(g,t1,x,yy,14*k,{al:'left',c:'#6a4a2a',st:false,sh:false,w:700});}
  g.restore();}
function goTxt(st,g,UI){const q=UI.t/1.1,s=back(Math.min(1,q*3)),a=q>.75?1-(q-.75)/.25:1;g.save();g.globalAlpha=Math.max(0,a);
  text(g,L('Готовься!','Get ready!'),st.W/2,st.H*.42,46*st.k*s,{c:'#ffe27a',lw:9*st.k,w:900});g.restore();}
/* финал (окно наград рисует оболочка после host.done): лента, счёт «набегает», ступень звёздочками, значок итога (G.endBadge) */
function endScr(st,g,G,UI){const W=st.W,H=st.H,k=st.k,t=UI.t,a=ease(t/.4);g.save();g.fillStyle='rgba(10,8,20,'+(.45*a)+')';g.fillRect(0,0,W,H);
  const cy=H*.42,s=back(Math.min(1,t/.45));g.globalAlpha=Math.min(1,t/.25);
  ribbon(g,W/2,cy-118*k*s,Math.min(380*k,W-30),56*k,G.endTitle?G.endTitle(st,UI.tier):L('Готово!','Done!'));
  const sc=Math.round(st.score*ease(Math.min(1,(t-.3)/.9)));if(t>.3&&Math.floor(sc/3)!==UI.shown&&sc<st.score){UI.shown=Math.floor(sc/3);snd('coin');}
  g.save();g.translate(W/2,cy);g.scale(s,s);text(g,String(Math.max(0,sc)),0,0,64*k,{c:'#ffcf3a',stc:'#5a2a04',lw:10*k,w:900});g.restore();
  for(let i=0;i<3;i++){const on=UI.tier>i,tt=t-1.2-i*.25,sp=on&&tt>0?back(Math.min(1,tt/.35)):1,r=(i===1?28:23)*k*(on&&tt>0?sp:1);
    if(on&&tt>0&&!UI['s'+i]){UI['s'+i]=1;tn(660+i*220,.18,'triangle',.08);}star(g,W/2+(i-1)*70*k,cy+78*k-(i===1?8*k:0),r,on&&tt>0,on&&tt>0?.6:0);}
  if(G.endLine){const ln=G.endLine(st,UI.tier);if(ln)text(g,ln,W/2,cy+128*k,17*k,{c:'#fff3c4',mw:W-30});}
  if(G.endBadge&&t>1.9)G.endBadge(st,g,W/2,cy+176*k,Math.min(1,(t-1.9)/.35),UI.tier);
  if(t>1.3)text(g,st.pc?L('Enter — дальше','Enter — continue'):L('Коснись — дальше','Tap to continue'),W/2,H-34*k,14*k,{c:'rgba(255,243,196,.75)'});
  g.restore();}

/* ---------- бот: та же логика без рисования. skill: 'bad'|'avg'|'good' ---------- */
function bot(G,o,skill){o=Object.assign({lvl:6,seed:12345,calm:false,train:false},o||{});const st=state(G,o,390,844);st.bot=skill||'avg';st.pc=false;G.init(st);if(G.onStart)G.onStart(st);
  const dt=1/30;let n=0;while(st.t<st.dur&&!st.over&&n<20000){st.t+=dt;G.bot(st,dt,st.bot);G.step(st,dt);fxStep(st,dt);n++;}
  const T=G.tiers(o);let t=G.minTier||0;for(let i=0;i<3;i++)if(st.score>=T[i])t=Math.max(t,i+1);return Object.assign({score:st.score,tier:t},G.extra?G.extra(st,t):{});}
function botId(id,skill,o){const G=K.G[id];return G?bot(G,o,skill):null;}
/* сводка: N зёрен × 3 умения → средний счёт и число ступеней 0..3 */
function botSum(id,o,N){N=N||40;const out={};for(const sk of['bad','avg','good']){let s=0;const tc=[0,0,0,0];for(let i=0;i<N;i++){const r=botId(id,sk,Object.assign({},o,{seed:1000+i*7919}));s+=r.score;tc[r.tier]++;}out[sk]={avg:Math.round(s/N),tiers:tc};}return out;}

/* ---------- регистрация ---------- */
function reg(G,meta){K.G[G.id]=G;const R=Object.assign({id:G.id,run(host,o){return run(host,o,G);},
    sim(o,k){const sk=k<.45?'bad':k<.75?'avg':'good';const r=bot(G,Object.assign({},o||{}),sk);return {score:r.score,tier:r.tier};},
    bot(a,skill){const o=typeof a==='object'&&a?a:{lvl:a|0};return bot(G,Object.assign({seed:(Math.random()*1e9)>>>0},o),skill||o.skill||'avg');}},meta);
  K.reg=K.reg||{};K.reg[G.id]=R;if(typeof ZAB_REG==='function')ZAB_REG(R);else K.pend.push(R);}
function flush(){if(typeof ZAB_REG!=='function')return;const p=K.pend;K.pend=[];for(const R of p)try{ZAB_REG(R);}catch(e){console.warn('zba reg',e);}}
if(typeof addEventListener==='function'){addEventListener('DOMContentLoaded',flush);addEventListener('load',flush);}

/* ---------- стенд без ядра: ?zba=<id>&train=1&calm=1&lvl=N&seed=N — простая оболочка по договору host ---------- */
function stand(id,opt){const R=K.reg&&K.reg[id];if(!R){if(typeof toast==='function')toast('?zba='+id+L(': нет. Есть: ',': none. Have: ')+Object.keys(K.reg||{}).join(', '));return;}opt=opt||{};
  if(!document.getElementById('zbaCss')){const s=document.createElement('style');s.id='zbaCss';s.textContent='#zbaHost{position:fixed;inset:0;z-index:60;background:#141a2e;overflow:hidden;touch-action:none;user-select:none}#zbaHost .el{position:absolute;inset:0}'+
    '#zbaHost .x{position:absolute;z-index:6;top:calc(var(--st,0px) + 8px);right:8px;width:52px;height:52px;border-radius:16px;border:3px solid #3a2410;background:linear-gradient(#fdf0cf,#e6c98a);color:#3a2410;font:900 24px/1 var(--f);box-shadow:0 4px 0 rgba(40,24,10,.5);display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer}'+
    '#zbaHost .zbVeil{position:absolute;inset:0;z-index:7;background:rgba(14,10,6,.6);display:flex;align-items:center;justify-content:center;padding:14px}#zbaHost .zbVeil>div{background:#fff6dc;color:#3b2412;border:6px solid #8a5426;border-radius:20px;padding:18px;max-width:420px;width:100%;text-align:center;font-weight:700}'+
    '#zbaHost .zbVeil button{min-height:52px;margin:8px 4px 0;padding:10px 18px;border-radius:14px;background:#f07d12;color:#fff;font-weight:900;font-size:17px}#zbaHost .zbVeil button.g{background:#8a6a4a}';document.head.appendChild(s);}
  const old=document.getElementById('zbaHost');if(old)old.remove();
  const root=document.createElement('div');root.id='zbaHost';const el=document.createElement('div');el.className='el';root.appendChild(el);const qb=document.createElement('button');qb.className='x';qb.textContent='✕';root.appendChild(qb);document.body.appendChild(root);
  const rs=[],qs=[];let fin=false,hold=false;
  const close=()=>{for(const f of qs)try{f();}catch(e){}removeEventListener('resize',onRs);root.remove();};
  const host={el,root,id,get w(){return root.clientWidth;},get h(){return root.clientHeight;},get dpr(){return Math.min(3,devicePixelRatio||1);},get paused(){return hold;},snd:typeof SND!=='undefined'?SND:{},
    onResize(f){rs.push(f);},onQuit(f){qs.push(f);},adOk(){return false;},ad(){return Promise.resolve(false);},quit(){fin=true;close();},
    done(r){if(fin)return;fin=true;window.__zbaLast=r;const v=document.createElement('div');v.className='zbVeil';const ex=r.extra||{};
      v.innerHTML='<div><h3 style="margin:0 0 8px">'+(R.n?(LANG==='en'?R.n.en:R.n.ru):id)+'</h3><div style="font-size:44px;font-weight:900">'+r.score+'</div><div>'+L('Ступень ','Tier ')+r.tier+L(' из 3',' of 3')+'</div>'+
        (ex.buf?'<div style="margin-top:8px;color:#2f7a1c">'+L('Сила на 1 поход: ','Battle boost: ')+JSON.stringify(ex.buf)+'</div>':'')+(ex.note?'<div style="margin-top:6px">'+ex.note+'</div>':'')+
        '<div style="margin-top:6px;font-size:12px;opacity:.7">'+L('Стенд BGA: окно наград — у оболочки BG0','BGA stand: rewards window belongs to the BG0 shell')+'</div><button data-k="again">'+L('Ещё раз','Again')+'</button><button class="g" data-k="out">'+L('Выйти','Exit')+'</button></div>';
      root.appendChild(v);v.querySelector('[data-k=again]').onclick=()=>{close();stand(id,opt);};v.querySelector('[data-k=out]').onclick=close;}};
  const onRs=()=>{for(const f of rs)try{f(host.w,host.h);}catch(e){console.error(e);}};addEventListener('resize',onRs);
  qb.onclick=()=>{snd('click');close();};
  const day=typeof dayKey==='function'?dayKey():'2026-10-08';let h=2166136261;const s=day+'|'+id;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  const o={calm:opt.calm!=null?!!opt.calm:!!(typeof S!=='undefined'&&S.calm),lvl:opt.lvl!=null?opt.lvl:(()=>{try{return Object.keys(S.done||{}).length;}catch(e){return 3;}})(),seed:opt.seed!=null?opt.seed>>>0:h>>>0,
    train:!!opt.train,day,lang:typeof LANG!=='undefined'?LANG:'ru',mode:opt.train?'train':'day',ctx:opt.ctx||{}};o.rnd=rnd(o.seed);
  try{R.run(host,o);}catch(e){console.error(e);close();}
  return host;}
{const m=/[?&]zba=([a-z0-9_-]+)/i.exec(typeof location!=='undefined'?location.search:'');if(m){const id=m[1];const qv=k=>{const x=new RegExp('[?&]'+k+'=([^&]*)').exec(location.search);return x?x[1]:null;};
  const go=()=>{const l=document.getElementById('loading');if(!document.body||l&&l.style.display!=='none'){setTimeout(go,100);return;}
    const op={train:qv('train')==='1'};if(qv('calm')!=null)op.calm=qv('calm')==='1';if(qv('lvl')!=null)op.lvl=+qv('lvl');if(qv('seed')!=null)op.seed=+qv('seed')>>>0;stand(id,op);};
  addEventListener('load',()=>setTimeout(go,60));}}

window.ZBA={K,isPC,rnd,cl,ease,back,hexA,spr,put,glow,glowAt,canvas,font,text,wrap,rr,panel,ribbon,btn,inB,star,keycap,pill,
  part,sparks,puff,num,tn,nz,snd,vib,state,run,bot:botId,botSum,reg,flush,stand,TAU:TAU2};
})();
