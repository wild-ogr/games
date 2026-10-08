'use strict';
/* OB:MGC (08.10) — общий набор для мини-игр MGC (№4 Ночной дозор, №6 Ловля летучей нечисти, №9 Колокольный набат).
   Всё на одном холсте внутри host.el (договор MG_REG, js/mg-core.js), чёткость Retina (dpr ≤ 2), без внешних библиотек.
   mgkRun(host,o,G) — запускает игру G: {id, title(o), rules(o)→[[ключ рисунка, текст]], tiers(o)→[t1,t2,t3], dur(o), init(st), step(st,dt), draw(st,g),
     down/move/up(st,x,y), bot(st,dt,skill), back(st,g) — фон под окнами, endTitle(st)}. Логика (init/step/bot) не трогает холст —
   поэтому бот (mgkBot) гоняет ту же игру без рисования.
   Вид: пергаментные окна с красной лентой, как в игре (css/look.css), шрифт Rubik (BgF), надписи с обводкой, искры/облачка как fx.js. */
const MGCK={pc:false,spr:{},font:'"BgF",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif'};
/* компьютер с мышью (наведение без нажатия) — правила и подсказки «мышкой» */
function mgkPC(){try{return !!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);}catch(e){return false;}}
function mgkRnd(seed){return typeof mulberry==='function'?mulberry(seed>>>0):Math.random;}
function mgkEase(t){t=Math.max(0,Math.min(1,t));return 1-(1-t)*(1-t)*(1-t);}
function mgkBack(t){t=Math.max(0,Math.min(1,t));const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);}   // «выпрыгивание» с перелётом
/* праздничная шкурка: 'hw' — «Ночь нечисти» (FEST hw…), 'ny' — Святки/Новый год (FEST ny…, kan…), иначе ''. Проверка — ?mgskin=hw|ny */
function mgkSkin(){const q=/[?&]mgskin=(hw|ny|off)\b/.exec(location.search);if(q)return q[1]==='off'?'':q[1];
  try{if(typeof FEST!=='undefined'&&FEST.list){const L=FEST.list()||[];for(const f of L){const id=(f&&f.id)||f;if(/^hw/.test(id))return 'hw';if(/^(ny|kan|sng)/.test(id))return 'ny';}}}catch(e){}
  try{if(typeof FEST!=='undefined'){for(const id of['hw26','hw27'])if(FEST.on(id))return 'hw';for(const id of['ny27','kan27','sng27','ny28'])if(FEST.on(id))return 'ny';}}catch(e){}
  return '';}

/* ---------- спрайты из art.js: холст по настоящим границам (artBox), кэш по размеру (шаг 6 px) ---------- */
function mgkSpr(key,px,dpr){const a=typeof artGet==='function'?artGet(key):null;if(!a)return null;const q=Math.max(12,Math.ceil(px*dpr/6)*6),id=key+'@'+q;let s=MGCK.spr[id];if(s)return s;
  const b=artBox(key),k=q/a.size;return MGCK.spr[id]={c:drawArtK(key,k,b),b,s:a.size,f:null};}
function mgkSil(s){if(!s.d){const c=s.c,f=mkCanvas(c.width,c.height),g=f.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='#05060f';g.fillRect(0,0,f.width,f.height);s.d=f;}return s.d;}
function mgkFlash(s){if(!s.f){const c=s.c,f=mkCanvas(c.width,c.height),g=f.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,255,255,.7)';g.fillRect(0,0,f.width,f.height);s.f=f;}return s.f;}
/* рисунок key так, чтобы его квадрат size лёг в квадрат sz с центром (x,y); o: {fx:-1 зеркально, rot, a, sy (сплющить), fl (вспышка), dark (0..1 в тени)} */
function mgkPut(g,key,x,y,sz,o,dpr){const s=mgkSpr(key,sz,dpr||MGCK.dpr||1);if(!s)return;o=o||{};const f=sz/s.s,b=s.b;
  g.save();g.translate(x,y);if(o.rot)g.rotate(o.rot);g.scale((o.fx||1)*(o.sx||1),o.sy||1);if(o.a!=null)g.globalAlpha*=Math.max(0,Math.min(1,o.a));
  g.drawImage(o.sil?mgkSil(s):o.fl?mgkFlash(s):s.c,b.x0*f,b.y0*f,b.w*f,b.h*f);g.restore();}

/* ---------- надписи ---------- */
function mgkFont(px,w){return (w||800)+' '+Math.round(px)+'px '+MGCK.font;}
function mgkText(g,s,x,y,px,o){o=o||{};g.font=mgkFont(px,o.w);g.textAlign=o.al||'center';g.textBaseline=o.bl||'middle';g.lineJoin='round';
  if(o.sh!==false){g.fillStyle=o.shc||'rgba(30,14,4,.45)';g.fillText(s,x,y+Math.max(1.5,px*.07));}
  if(o.st!==false){g.strokeStyle=o.stc||'#3b2412';g.lineWidth=o.lw||Math.max(3,px*.2);g.strokeText(s,x,y);}
  g.fillStyle=o.c||'#fff';g.fillText(s,x,y);}
function mgkWrap(g,s,maxW,px,w){g.font=mgkFont(px,w);const out=[];for(const para of String(s).split('\n')){let line='';for(const word of para.split(' ')){const t=line?line+' '+word:word;if(g.measureText(t).width>maxW&&line){out.push(line);line=word;}else line=t;}out.push(line);}return out;}
function mgkRR(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
/* пергамент в деревянной раме (как окна игры) */
function mgkPanel(g,x,y,w,h,r){g.save();g.fillStyle='rgba(20,10,4,.35)';mgkRR(g,x+2,y+6,w,h,r);g.fill();
  const gw=g.createLinearGradient(0,y,0,y+h);gw.addColorStop(0,'#b0763c');gw.addColorStop(1,'#7a4a20');g.fillStyle=gw;mgkRR(g,x,y,w,h,r);g.fill();
  const p=Math.max(5,r*.32),gp=g.createLinearGradient(0,y,0,y+h);gp.addColorStop(0,'#fff6dc');gp.addColorStop(1,'#f3dca8');g.fillStyle=gp;mgkRR(g,x+p,y+p,w-2*p,h-2*p,r*.7);g.fill();
  g.strokeStyle='rgba(110,67,31,.35)';g.lineWidth=1.5;mgkRR(g,x+p+3,y+p+3,w-2*p-6,h-2*p-6,r*.6);g.stroke();g.restore();}
/* красная лента заголовка с «ушами» */
function mgkRibbon(g,cx,y,w,h,s){g.save();const e=h*.55;
  for(const d of[-1,1]){const x0=cx+d*(w/2-e*.3);g.fillStyle='#a82c17';g.beginPath();g.moveTo(x0,y+h*.25);g.lineTo(x0+d*e*1.3,y+h*.25);g.lineTo(x0+d*e*.85,y+h*.25+h*.45);g.lineTo(x0+d*e*1.3,y+h*1.15);g.lineTo(x0,y+h*1.15);g.closePath();g.fill();
    g.fillStyle='#7a1e0e';g.beginPath();g.moveTo(x0,y+h);g.lineTo(x0+d*e*.4,y+h*1.15);g.lineTo(x0,y+h*1.15);g.fill();}
  const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#f2573a');gr.addColorStop(1,'#c9361d');g.fillStyle=gr;mgkRR(g,cx-w/2,y,w,h,h*.18);g.fill();
  g.fillStyle='rgba(255,255,255,.22)';mgkRR(g,cx-w/2+4,y+3,w-8,h*.32,h*.14);g.fill();
  let px=h*.56;g.font=mgkFont(px,800);while(g.measureText(s).width>w-24&&px>10){px-=1;g.font=mgkFont(px,800);}
  mgkText(g,s,cx,y+h*.53,px,{stc:'#7a1e0e',lw:px*.22});g.restore();}
/* пухлая кнопка с «губой»: kind 'o' оранжевая (главная), 'b' синяя (ролик), 'g' зелёная, 'p' бумажная. b: {x,y,w,h} — заполняется для попадания */
function mgkBtn(g,b,s,kind,press,icon){const C={o:['#ffb03a','#f07d12','#a04e06','#fff'],b:['#5aa2f5','#2f6fd0','#1c3f78','#fff'],g:['#7cc94e','#4a9a2c','#2c6a16','#fff'],p:['#fffaf0','#f1e0bb','#c9a36a','#3b2412']}[kind||'o'];
  const d=press?3:0,lip=Math.max(4,b.h*.09);g.save();g.fillStyle='rgba(20,10,4,.3)';mgkRR(g,b.x,b.y+lip+2,b.w,b.h,b.h*.3);g.fill();
  g.fillStyle=C[2];mgkRR(g,b.x,b.y+d,b.w,b.h+lip-d,b.h*.3);g.fill();
  const gr=g.createLinearGradient(0,b.y+d,0,b.y+b.h+d);gr.addColorStop(0,C[0]);gr.addColorStop(1,C[1]);g.fillStyle=gr;mgkRR(g,b.x,b.y+d,b.w,b.h,b.h*.3);g.fill();
  g.fillStyle='rgba(255,255,255,.28)';mgkRR(g,b.x+5,b.y+d+4,b.w-10,b.h*.3,b.h*.15);g.fill();
  let px=b.h*.4;g.font=mgkFont(px,800);const iw=icon?px*1.5:0;while(g.measureText(s).width+iw>b.w-20&&px>10){px-=1;g.font=mgkFont(px,800);}
  const tw=g.measureText(s).width,x0=b.x+b.w/2-(tw+iw)/2;
  if(icon)mgkPut(g,icon,x0+px*.6,b.y+d+b.h/2,px*1.4);
  mgkText(g,s,x0+iw+tw/2,b.y+d+b.h*.52,px,kind==='p'?{c:C[3],st:false,sh:false}:{stc:C[2],lw:px*.18,sh:false});g.restore();}
function mgkIn(b,x,y){return b&&x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h+6;}
/* звёздочка ступени (рисованная, без эмодзи) */
function mgkStar(g,x,y,r,on,glow){g.save();if(on&&glow>0){g.globalAlpha=glow;const gs=glowSpr('#ffd84a');g.drawImage(gs,x-r*2.2,y-r*2.2,r*4.4,r*4.4);g.globalAlpha=1;}
  g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.47:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();
  if(on){const gr=g.createRadialGradient(x-r*.3,y-r*.4,r*.1,x,y,r);gr.addColorStop(0,'#fff3a0');gr.addColorStop(.6,'#ffb81c');gr.addColorStop(1,'#e08a0c');g.fillStyle=gr;}else g.fillStyle='#d8c8a2';
  g.fill();g.lineWidth=Math.max(2,r*.13);g.lineJoin='round';g.strokeStyle=on?'#a8650c':'#a8987a';g.stroke();
  if(on){g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(x-r*.22,y-r*.3,r*.2,r*.12,-.6,0,TAU);g.fill();}g.restore();}

/* ---------- частицы, облачка, всплывающие числа ---------- */
function mgkPart(st,p){if(st.pt.length<(st.lite?120:260))st.pt.push(Object.assign({t:0,dur:.6,vx:0,vy:0,gr:0,s:3,col:'#ffe27a',add:1},p));}
function mgkSparks(st,x,y,n,col,v,o){o=o||{};for(let i=0;i<n;i++){const a=(o.a0!=null?o.a0:0)+(o.spr!=null?(st.fr()-.5)*o.spr:st.fr()*TAU),s=(v||120)*(.5+st.fr()*.7);
  mgkPart(st,{x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,gr:o.gr!=null?o.gr:200,dur:(o.dur||.55)*(.7+st.fr()*.6),s:(o.s||3)*(.7+st.fr()*.6),col});}}
function mgkPuff(st,x,y,r){st.fx.push({k:'puf',x,y,r,t:0,dur:.45,a:st.fr()*TAU});}
function mgkNum(st,x,y,s,col,big){st.nums.push({x,y,s,col:col||'#fff2a8',t:0,big:!!big});}
function mgkFxStep(st,dt){for(const p of st.pt){p.t+=dt;p.vy+=p.gr*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}st.pt=st.pt.filter(p=>p.t<p.dur);
  for(const f of st.fx)f.t+=dt;st.fx=st.fx.filter(f=>f.t<f.dur);for(const n of st.nums)n.t+=dt;st.nums=st.nums.filter(n=>n.t<1.1);}
function mgkFxDraw(st,g){const k=st.k;
  for(const f of st.fx)if(f.k==='puf'){const q=f.t/f.dur,im=fxCloud(),e=1-(1-q)*(1-q),r=f.r*(.55+e*.75);g.globalAlpha=Math.max(0,.95*(1-q*q));g.drawImage(im,f.x-r,f.y-r*.9-q*8*k,r*2,r*2);
    const r2=r*.55;g.drawImage(im,f.x+Math.cos(f.a)*r*.7-r2,f.y-r2-q*14*k,r2*2,r2*2);g.globalAlpha=1;}
  g.save();g.globalCompositeOperation='lighter';for(const p of st.pt){const q=p.t/p.dur,a=1-q*q,r=p.s*k*(1-q*.4)*3;g.globalAlpha=a;g.drawImage(glowSpr(p.col),p.x-r,p.y-r,r*2,r*2);}g.restore();g.globalAlpha=1;
  for(const n of st.nums){const q=n.t/1.1,pop=n.t<.16?1+(1-n.t/.16)*.6:1,px=(n.big?30:22)*k*(st.calm?1:pop);g.globalAlpha=q>.7?1-(q-.7)/.3:1;g.font=mgkFont(px);const hw=g.measureText(n.s).width/2+6;mgkText(g,n.s,Math.max(hw,Math.min(st.W-hw,n.x)),n.y-q*40*k,px,{c:n.col});}g.globalAlpha=1;}

/* ---------- звук: только через SND/tone/noise игры, при выключенном звуке — тишина ---------- */
function mgkTone(f,d,type,v,f2,delay){try{if(typeof tone==='function')tone(f,d,type,v,f2,delay);}catch(e){}}
function mgkNoise(d,v,fr,q){try{if(typeof noise==='function')noise(d,v,fr,q);}catch(e){}}
function mgkSnd(k,a){try{if(typeof SND!=='undefined'&&SND[k])SND[k](a);}catch(e){}}

/* ---------- состояние игры (общее для живой игры и бота) ---------- */
function mgkState(G,o,W,H){const st={pc:mgkPC(),o,calm:!!o.calm,lvl:o.lvl|0,W,H,k:Math.max(.78,Math.min(2,Math.min(W/390,H/700))),t:0,score:0,dur:G.dur(o),pt:[],fx:[],nums:[],combo:0,best:0,
  rnd:mgkRnd(o.seed||1),fr:mgkRnd((o.seed||1)^0x5bd1e995),lite:typeof document!=='undefined'&&document.body&&document.body.classList.contains('lite'),skin:o.skin!=null?o.skin:mgkSkin(),ev:[]};
  return st;}

/* ---------- живая игра ---------- */
function mgkRun(host,o,G){const cv=document.createElement('canvas');cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none';host.el.appendChild(cv);
  const g=cv.getContext('2d');let W=0,H=0,dpr=1,raf=0,dead=false,last=0;
  const UI={host,ph:'intro',t:0,btn:null,ad:null,go:null,press:null,endT:0,shown:0,rec:false,adUsed:false};
  let st=null;
  function size(){W=Math.max(200,host.w||innerWidth);H=Math.max(200,host.h||innerHeight);dpr=Math.min(2,host.dpr||devicePixelRatio||1);MGCK.dpr=dpr;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
    const keep=st;st=mgkState(G,o,W,H);if(keep){for(const k of['t','score','combo','best','ev','stats'])if(keep[k]!=null)st[k]=keep[k];if(keep.extra)st.extra=keep.extra;}
    st.live=true;G.init(st,keep);}
  size();host.onResize(()=>{size();});
  function best(){try{const d=S.dzr;if(!d)return 0;const b=d.best||d.rec||d.rb;return b&&b[G.id]?+b[G.id]||0:0;}catch(e){return 0;}}
  function tierOf(s){const T=G.tiers(st.o);let t=0;for(let i=0;i<3;i++)if(s>=T[i])t=i+1;return t;}
  function finish(){if(UI.ph!=='play')return;UI.ph='end';UI.t=0;st.end=true;UI.tier=tierOf(st.score);UI.rec=!o.train&&st.score>0&&st.score>best();if(G.onEnd)G.onEnd(st);mgkSnd(UI.tier>=2?'win':UI.tier?'up':'lose');}
  function pos(e){const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height];}
  let pid=null;
  function down(e){if(dead)return;e.preventDefault&&e.preventDefault();const [x,y]=pos(e);
    if(UI.ph==='intro'){if(mgkIn(UI.btn,x,y)){UI.press=UI.btn;mgkSnd('click');setTimeout(()=>{UI.press=null;start();},110);}
      else if(UI.ad&&mgkIn(UI.ad,x,y)&&!UI.adUsed){UI.press=UI.ad;mgkSnd('click');host.ad(G.adKind||'x').then(ok=>{UI.press=null;if(ok){UI.adUsed=true;st.extra=Object.assign(st.extra||{},{ad:1});if(G.onAd)G.onAd(st);}});}return;}
    if(UI.ph==='end'){if(UI.t>1.3)mgkSend(st,G,UI);return;}
    if(UI.ph!=='play')return;pid=e.pointerId;try{cv.setPointerCapture(e.pointerId);}catch(x){}G.down&&G.down(st,x,y,e.pointerType);}
  function move(e){if(dead||UI.ph!=='play')return;const [x,y]=pos(e);G.move&&G.move(st,x,y,pid!=null,e.pointerType);}
  function up(e){if(dead)return;pid=null;if(UI.ph!=='play')return;const [x,y]=pos(e);G.up&&G.up(st,x,y);}
  cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  function key(e){if(dead||host.paused)return;if(UI.ph==='intro'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();start();return;}
    if(UI.ph==='end'&&UI.t>1.3&&(e.key==='Enter'||e.key===' ')){mgkSend(st,G,UI);return;}if(UI.ph==='play'&&G.key&&G.key(st,e.key))e.preventDefault();}
  window.addEventListener('keydown',key);
  function start(){UI.ph='go';UI.t=0;st.t=0;st.score=0;st.combo=0;st.best=0;G.init(st);if(G.onStart)G.onStart(st);}
  function frame(ts){if(dead)return;raf=requestAnimationFrame(frame);const now=ts/1000;let dt=last?now-last:0;last=now;dt=Math.min(.05,Math.max(0,dt));
    if(host.paused)return;UI.t+=dt;
    if(UI.ph==='go'&&UI.t>1.1){UI.ph='play';UI.t=0;}
    if(UI.ph==='play'){st.t+=dt;G.step(st,dt);if(st.t>=st.dur||st.over)finish();}
    else if(G.idle)G.idle(st,dt);else if(UI.ph==='end'&&G.step&&G.after)G.after(st,dt);
    mgkFxStep(st,dt);draw();}
  function draw(){const cur=UI.ph==='play'&&G.cursor?G.cursor(st):'default';if(cv.style.cursor!==cur)cv.style.cursor=cur;g.setTransform(dpr,0,0,dpr,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';G.draw(st,g,UI);mgkFxDraw(st,g);
    if(UI.ph==='play'||UI.ph==='go')mgkHud(st,g,G,UI);
    if(UI.ph==='intro')mgkIntro(st,g,G,UI);if(UI.ph==='go')mgkGo(st,g,UI);if(UI.ph==='end')mgkEnd(st,g,G,UI);}
  host.onQuit(()=>{dead=true;cancelAnimationFrame(raf);window.removeEventListener('keydown',key);});
  raf=requestAnimationFrame(frame);
  window.__mgc={st:()=>st,ui:UI,start,finish,G};
  return {st:()=>st,UI};}

/* верхняя плашка: счёт (слева), полоска времени (по центру); справа — место под кнопку ✕ оболочки */
function mgkHud(st,g,G,UI){const k=st.k,W=st.W,top=Math.max(8,(G.hudTop||0))+6*k,h=46*k,sx=10*k;
  g.save();mgkPillBox(g,sx,top,Math.max(98*k,Math.min(150*k,W*.3)),h);const sc=UI.ph==='go'?0:st.score;
  if(G.hudIcon)mgkPut(g,G.hudIcon,sx+h*.55,top+h/2,h*.82);mgkText(g,String(sc),sx+h*1.05,top+h*.53,h*.5,{al:'left',c:'#fff3c4'});
  const bx=sx+Math.max(98*k,Math.min(150*k,W*.3))+10*k,bw=Math.max(60,Math.min(420*k,W-bx-72*k)),q=Math.max(0,1-st.t/st.dur);
  mgkPillBox(g,bx,top+h*.18,bw,h*.64);const ix=bx+5*k,iw=bw-10*k,iy=top+h*.32,ih=h*.36;
  g.fillStyle='rgba(0,0,0,.35)';mgkRR(g,ix,iy,iw,ih,ih/2);g.fill();
  const gr=g.createLinearGradient(ix,0,ix+iw,0);const C=G.barCol||['#ffcf4a','#ff8a1e'];gr.addColorStop(0,C[0]);gr.addColorStop(1,C[1]);g.fillStyle=gr;
  if(q>0){mgkRR(g,ix,iy,Math.max(ih,iw*q),ih,ih/2);g.fill();g.fillStyle='rgba(255,255,255,.35)';mgkRR(g,ix+3,iy+2,Math.max(ih-6,iw*q-6),ih*.35,ih*.2);g.fill();}
  const left=Math.ceil(st.dur-st.t);if(G.barIcon)mgkPut(g,G.barIcon,ix+iw*q,iy+ih/2,h*.7);
  mgkText(g,UI.ph==='go'?String(Math.ceil(st.dur)):String(Math.max(0,left)),bx+bw/2,iy+ih/2+1,h*.36,{c:left<=5&&UI.ph==='play'?'#ffd0c0':'#fff'});
  if(st.combo>=3&&UI.ph==='play'){const cx=sx+8*k,cy=top+h+16*k;mgkText(g,Lg('серия ×','streak ×')+st.combo,cx,cy,17*k,{al:'left',c:'#ffe27a'});}
  g.restore();}
function mgkPillBox(g,x,y,w,h){g.fillStyle='rgba(20,10,4,.35)';mgkRR(g,x+1,y+3,w,h,h/2);g.fill();g.fillStyle='rgba(42,24,12,.82)';mgkRR(g,x,y,w,h,h/2);g.fill();
  g.strokeStyle='rgba(255,233,184,.55)';g.lineWidth=2;mgkRR(g,x+1.5,y+1.5,w-3,h-3,h/2-1.5);g.stroke();}

/* окно «как играть»: лента с названием, 2–3 строки с рисунками, кнопка «Начать» (≥ 64 px) и «ролик», если игра его даёт */
function mgkIntro(st,g,G,UI){const W=st.W,H=st.H,k=st.k,a=mgkEase(UI.t/.35);g.save();g.fillStyle='rgba(10,8,20,'+(.45*a)+')';g.fillRect(0,0,W,H);
  const pw=Math.min(W-28,440*k),rules=G.rules(st.o,st),lh=Math.max(54,58*k),ad=G.adKind&&!st.o.train&&G.adLabel&&MGK_HOST_ADOK(),ph=86*k+rules.length*lh+(ad?150:84)*Math.max(.9,k)+(st.o.train?28*k:0);
  const px=(W-pw)/2,py=Math.max(60,(H-ph)/2+(1-a)*40);g.globalAlpha=a;mgkPanel(g,px,py,pw,ph,20*k);
  mgkRibbon(g,W/2,py-18*k,Math.min(pw+20*k,W-8),52*k,G.title(st.o,st));
  let y=py+56*k;const tx=px+26*k+lh;
  for(const [key,txt] of rules){const bob=st.calm?0:Math.sin(UI.t*3+y)*2*k;mgkPut(g,key,px+24*k+lh*.45,y+lh*.42+bob,lh*.82);
    const L=mgkWrap(g,txt,pw-(tx-px)-22*k,Math.max(14,16*k),600),fp=L.length>2?Math.max(13,14.5*k):Math.max(14,16*k);const L2=mgkWrap(g,txt,pw-(tx-px)-22*k,fp,600);g.fillStyle='#3b2412';g.font=mgkFont(fp,600);g.textAlign='left';g.textBaseline='middle';
    L2.forEach((s,i)=>g.fillText(s,tx,y+lh*.42+(i-(L2.length-1)/2)*fp*1.18));y+=lh;}
  if(st.o.train){mgkText(g,Lg('Тренировка: без наград, только рекорд','Practice: no rewards, record only'),W/2,y+8*k,13*k,{c:'#6a4a2a',st:false,sh:false,w:600});y+=26*k;}
  const bh=Math.max(64,62*k),bw=Math.min(pw-48*k,280*k);UI.btn={x:W/2-bw/2,y:y+8*k,w:bw,h:bh};mgkBtn(g,UI.btn,Lg('Начать!','Start!'),'o',UI.press===UI.btn);
  if(ad){UI.ad={x:W/2-bw/2,y:y+bh+26*k,w:bw,h:Math.max(64,56*k)};mgkBtn(g,UI.ad,UI.adUsed?G.adDone():G.adLabel(),UI.adUsed?'g':'b',UI.press===UI.ad);}else UI.ad=null;
  g.restore();}
function MGK_HOST_ADOK(){try{return !!(MG&&MG.cur&&MG.cur.host&&MG.cur.host.adOk());}catch(e){return false;}}
/* «Готовься!» перед началом */
function mgkGo(st,g,UI){const q=UI.t/1.1,s=mgkBack(Math.min(1,q*3)),a=q>.75?1-(q-.75)/.25:1;g.save();g.globalAlpha=Math.max(0,a);
  mgkText(g,Lg('Готовься!','Get ready!'),st.W/2,st.H*.42,46*st.k*s,{c:'#ffe27a',lw:9*st.k});g.restore();}
/* финал (окно итогов и награды рисует оболочка после host.done): лента, счёт «набегает», ступень звёздочками; сам уходит через 3 с, касание — раньше */
function mgkEnd(st,g,G,UI){const W=st.W,H=st.H,k=st.k,t=UI.t,a=mgkEase(t/.4);g.save();g.fillStyle='rgba(10,8,20,'+(.35*a)+')';g.fillRect(0,0,W,H);
  const cy=H*.42,s=mgkBack(Math.min(1,t/.45));g.globalAlpha=Math.min(1,t/.25);
  mgkRibbon(g,W/2,cy-110*k*s,Math.min(360*k,W-30),56*k,G.endTitle?G.endTitle(st):Lg('Готово!','Done!'));
  const sc=Math.round(st.score*mgkEase(Math.min(1,(t-.3)/.9)));if(t>.3&&Math.floor(sc/9)!==UI.shown&&sc<st.score){UI.shown=Math.floor(sc/9);mgkSnd('coin');}
  g.save();g.translate(W/2,cy);g.scale(s,s);mgkText(g,String(Math.max(0,sc)),0,0,64*k,{c:'#ffcf3a',stc:'#5a2a04',lw:10*k});g.restore();
  for(let i=0;i<3;i++){const on=UI.tier>i,tt=t-1.2-i*.25,sp=on&&tt>0?mgkBack(Math.min(1,tt/.35)):1,r=(i===1?28:23)*k*(on&&tt>0?sp:1);
    if(on&&tt>0&&!UI['s'+i]){UI['s'+i]=1;mgkSnd('star',i);}mgkStar(g,W/2+(i-1)*70*k,cy+78*k-(i===1?8*k:0),r,on&&tt>0,on&&tt>0?.6:0);}
  if(G.endLine){const L=G.endLine(st);if(L)mgkText(g,L,W/2,cy+128*k,17*k,{c:'#fff3c4'});}
  g.restore();UI.go={x:0,y:0,w:W,h:H};
  if(t>3.2&&!UI.sent)mgkSend(st,G,UI);}
function mgkSend(st,G,UI){if(UI.sent)return;UI.sent=1;const r={score:st.score,tier:UI.tier,rec:UI.rec,extra:Object.assign({best:st.best},st.extra||{},G.extra?G.extra(st):{})};UI.host.done(r);}

/* ---------- бот: та же логика без рисования. skill: 'bad'|'avg'|'good'. Возвращает {score,tier,…} ---------- */
function mgkBot(G,o,skill){o=Object.assign({lvl:6,seed:12345,calm:false,train:false,skin:''},o||{});const st=mgkState(G,o,390,844);st.bot=skill||'avg';G.init(st);
  const dt=1/30;let n=0;while(st.t<st.dur&&!st.over&&n<20000){st.t+=dt;G.bot(st,dt,st.bot);G.step(st,dt);mgkFxStep(st,dt);n++;}
  const T=G.tiers(o);let t=0;for(let i=0;i<3;i++)if(st.score>=T[i])t=i+1;return Object.assign({score:st.score,tier:t},G.extra?G.extra(st):{});}
function mgcBot(id,skill,o){const G=MGC_G[id];if(!G)return null;return mgkBot(G,o,skill);}
/* сводка бота: N зёрен × 3 умения → средний счёт и доли ступеней (для калибровки MG_RW) */
function mgcBotSum(id,o,N){N=N||20;const out={};for(const sk of['bad','avg','good']){let s=0;const tc=[0,0,0,0];for(let i=0;i<N;i++){const r=mgcBot(id,sk,Object.assign({},o,{seed:1000+i*7919}));s+=r.score;tc[r.tier]++;}out[sk]={avg:Math.round(s/N),tiers:tc};}return out;}
const MGC_G={};
/* регистрация в оболочке (MG_REG из js/mg-core.js); если оболочки нет — игра просто лежит в MGC_G */
function mgcReg(G,meta){MGC_G[G.id]=G;if(typeof MG_REG!=='function')return;
  MG_REG(Object.assign({id:G.id,run(host,o){mgkRun(host,o,G);},bot(a,skill){const o=typeof a==='object'&&a?a:{lvl:a|0};return mgkBot(G,Object.assign({seed:(Math.random()*1e9)>>>0},o),skill||o.skill||'avg');}},meta));}
