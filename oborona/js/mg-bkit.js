'use strict';
/* OB:MGB (08.10) — общий «набор сцены» мини-игр MGB (Царь-пушка, Доставка снарядов, Ремонт ворот).
   Только своё, с приставкой mgb*: холст во весь host.el (Retina, dpr ≤ 2), кадры, касания, текст с обводкой,
   частицы (искры, дым-облачка, щепки), всплывающие числа, плашки и окно итогов со ступенями.
   Ничего в бою/сохранении не трогает. */

const MGB={};
function mgbCalm(o){return !!(o&&o.calm)||REDUCED||(typeof S!=='undefined'&&S&&S.shake===0);}
function mgbRng(seed){return mulberry((seed|0)^0x5bd1e995);}
// звук — только из имеющегося набора SND (тихо падаем, если звук выключен)
function mgbSnd(k,a){try{if(typeof SND!=='undefined'&&SND[k])SND[k](a);}catch(e){}}
function mgbFont(px,w){return (w||800)+' '+Math.round(px)+'px BgF, system-ui, sans-serif';}

/* ---------- сцена: холст, размер, кадры, касания ---------- */
function mgbStage(host,h){
  const el=host.el,cv=document.createElement('canvas');
  cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;';
  if(getComputedStyle(el).position==='static')el.style.position='relative';
  el.appendChild(cv);
  const st={cv,g:cv.getContext('2d'),W:1,H:1,dpr:1,t:0,alive:true,raf:0,last:0,shx:0,shy:0,shake:0};
  function fit(){const r=el.getBoundingClientRect(),W=Math.max(200,Math.round(r.width||innerWidth)),H=Math.max(200,Math.round(r.height||innerHeight)),d=Math.min(2,window.devicePixelRatio||1);
    if(W===st.W&&H===st.H&&d===st.dpr)return;st.W=W;st.H=H;st.dpr=d;cv.width=Math.round(W*d);cv.height=Math.round(H*d);h.resize&&h.resize(W,H,d);}
  st.fit=fit;fit();
  const onR=()=>fit();window.addEventListener('resize',onR);let ro=null;try{ro=new ResizeObserver(onR);ro.observe(el);}catch(e){}
  function pos(e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*(st.W/(r.width||st.W)),y:(e.clientY-r.top)*(st.H/(r.height||st.H)),id:e.pointerId};}
  let pid=null;
  const pd=e=>{if(!st.alive)return;e.preventDefault();if(pid!=null&&pid!==e.pointerId)return;pid=e.pointerId;try{cv.setPointerCapture(e.pointerId);}catch(_){}h.down&&h.down(pos(e));},
    pm=e=>{if(!st.alive||pid!==e.pointerId)return;e.preventDefault();h.move&&h.move(pos(e));},
    pu=e=>{if(!st.alive||pid!==e.pointerId)return;e.preventDefault();pid=null;h.up&&h.up(pos(e));},
    pc=e=>{if(pid!==e.pointerId)return;pid=null;h.cancel?h.cancel():h.up&&h.up(pos(e));};
  cv.addEventListener('pointerdown',pd);cv.addEventListener('pointermove',pm);cv.addEventListener('pointerup',pu);cv.addEventListener('pointercancel',pc);
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  function frame(now){if(!st.alive)return;st.raf=requestAnimationFrame(frame);
    if(!el.isConnected){st.stop();return;}
    if(document.hidden||(h.paused&&h.paused())){st.last=now;return;}
    fit();const dt=Math.min(.05,st.last?(now-st.last)/1000:0);st.last=now;
    st.t+=dt;h.step&&h.step(dt);
    if(st.shake>0){st.shake=Math.max(0,st.shake-dt*2.6);const a=st.shake*st.shake*9;st.shx=(Math.random()*2-1)*a;st.shy=(Math.random()*2-1)*a;}else st.shx=st.shy=0;
    const g=st.g;g.setTransform(st.dpr,0,0,st.dpr,0,0);h.draw&&h.draw(g,st.W,st.H);}
  st.raf=requestAnimationFrame(frame);
  st.stop=()=>{if(!st.alive)return;st.alive=false;cancelAnimationFrame(st.raf);window.removeEventListener('resize',onR);try{ro&&ro.disconnect();}catch(e){}
    cv.removeEventListener('pointerdown',pd);cv.removeEventListener('pointermove',pm);cv.removeEventListener('pointerup',pu);cv.removeEventListener('pointercancel',pc);};
  st.kill=()=>{st.stop();if(cv.parentNode)cv.parentNode.removeChild(cv);};
  return st;}

/* ---------- кэш рисунков art.js под нужный размер (холст по границам рисунка — artBox) ---------- */
const MGB_SPR={};
// put: нарисовать рисунок key так, чтобы его квадрат size стал sz px с центром (x,y); flip — зеркально
function mgbArt(g,key,x,y,sz,o){o=o||{};const a=artGet(key);if(!a)return;const b=artBox(key),dpr=MGB.dpr||1,
  q=Math.max(.25,Math.min(4,Math.ceil(sz/a.size*dpr*4)/4)),id=key+'@'+q;let c=MGB_SPR[id];
  if(!c){c=MGB_SPR[id]=drawArtK(key,q,b);}
  const f=sz/a.size;g.save();g.translate(x,y);if(o.rot)g.rotate(o.rot);g.scale((o.flip?-1:1)*(o.sx||1),o.sy||1);if(o.alpha!=null)g.globalAlpha*=o.alpha;
  g.drawImage(c,b.x0*f,b.y0*f,b.w*f,b.h*f);g.restore();}

/* ---------- текст с обводкой ---------- */
function mgbTxt(g,s,x,y,px,col,o){o=o||{};g.font=mgbFont(px,o.w);g.textAlign=o.al||'center';g.textBaseline=o.bl||'middle';
  g.lineJoin='round';g.miterLimit=2;
  if(o.sh!==false){g.fillStyle='rgba(20,8,0,.35)';g.fillText(s,x,y+Math.max(1.5,px*.08));}
  g.lineWidth=o.lw||Math.max(2.5,px*.2);g.strokeStyle=o.ol||'#2a1406';g.strokeText(s,x,y);g.fillStyle=col||'#fff';g.fillText(s,x,y);}
function mgbTW(g,s,px,w){g.font=mgbFont(px,w);return g.measureText(s).width;}
// перенос по словам, подбор размера под ширину; возвращает строки
function mgbWrap(g,s,px,maxW){g.font=mgbFont(px);const out=[];for(const para of String(s).split('\n')){let line='';for(const w of para.split(' ')){const t=line?line+' '+w:w;if(g.measureText(t).width>maxW&&line){out.push(line);line=w;}else line=t;}out.push(line);}return out;}

/* ---------- плашки ---------- */
// тёмное дерево с золотой каймой (верхние плашки счёта, подсказка)
function mgbPlate(g,x,y,w,h,o){o=o||{};const r=o.r!=null?o.r:Math.min(h/2,14);g.save();
  g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=8;g.shadowOffsetY=3;rrect(g,x,y,w,h,r);
  const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,o.c1||'#5a3418');gr.addColorStop(1,o.c2||'#33190a');g.fillStyle=gr;g.fill();g.restore();
  rrect(g,x+1.5,y+1.5,w-3,h-3,Math.max(1,r-1.5));g.lineWidth=2;g.strokeStyle=o.rim||'#e6b53a';g.stroke();
  rrect(g,x+4,y+4,w-8,Math.max(2,h*.42),Math.max(1,r-4));g.fillStyle='rgba(255,240,200,.08)';g.fill();}
// свиток-пергамент (подсказки, окно итогов)
function mgbScroll(g,x,y,w,h){g.save();g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=18;g.shadowOffsetY=6;rrect(g,x,y,w,h,16);g.fillStyle='#f3e2bb';g.fill();g.restore();
  const gr=g.createRadialGradient(x+w/2,y+h*.4,Math.min(w,h)*.2,x+w/2,y+h/2,Math.max(w,h)*.75);gr.addColorStop(0,'#fbf0d4');gr.addColorStop(1,'#dcbf86');rrect(g,x,y,w,h,16);g.fillStyle=gr;g.fill();
  rrect(g,x+6,y+6,w-12,h-12,11);g.lineWidth=2;g.strokeStyle='#b0823c';g.stroke();rrect(g,x+11,y+11,w-22,h-22,8);g.lineWidth=1;g.strokeStyle='rgba(140,90,30,.45)';g.stroke();
  // уголки-узоры
  g.fillStyle='#b0823c';for(const [cx,cy] of[[x+14,y+14],[x+w-14,y+14],[x+14,y+h-14],[x+w-14,y+h-14]]){g.beginPath();g.moveTo(cx,cy-5);g.lineTo(cx+5,cy);g.lineTo(cx,cy+5);g.lineTo(cx-5,cy);g.closePath();g.fill();}}
// кнопка (≥64 px высоты на касание): возвращает прямоугольник
function mgbBtn(g,b,label,o){o=o||{};const {x,y,w,h}=b,pr=b.pressed?2:0,c=o.col||'#f0a93a';g.save();g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=10;g.shadowOffsetY=4;
  rrect(g,x,y+pr,w,h,h*.32);g.fillStyle=shade(c,-.45);g.fill();g.restore();rrect(g,x,y+pr,w,h-5,h*.32);const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,shade(c,.35));gr.addColorStop(1,c);g.fillStyle=gr;g.fill();
  rrect(g,x+6,y+pr+4,w-12,h*.3,h*.2);g.fillStyle='rgba(255,255,255,.28)';g.fill();
  let px=o.px||Math.min(26,h*.4);while(px>12&&mgbTW(g,label,px)>w-24-(o.icon?h*.6:0))px-=1;
  const tx=x+w/2+(o.icon?h*.25:0);if(o.icon)o.icon(g,tx-mgbTW(g,label,px)/2-h*.32,y+pr+h/2-3,h*.42);
  mgbTxt(g,label,tx,y+pr+h/2-3,px,'#fff',{ol:shade(c,-.6)});}
function mgbHit(b,p){return b&&p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;}

/* ---------- значки (без эмодзи) ---------- */
function mgbStar(g,x,y,r,on,glowOn){g.save();g.translate(x,y);if(on&&glowOn)g.drawImage(glowSpr('#ffd84a'),-r*2,-r*2,r*4,r*4);g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr+r*.06);}g.closePath();
  if(on){const gr=g.createLinearGradient(0,-r,0,r);gr.addColorStop(0,'#fff19a');gr.addColorStop(.5,'#ffc93a');gr.addColorStop(1,'#e08a12');g.fillStyle=gr;}else g.fillStyle='rgba(40,30,50,.55)';
  g.fill();g.lineWidth=Math.max(1.2,r*.14);g.strokeStyle=on?'#7a4206':'rgba(255,230,180,.45)';g.stroke();if(on){g.beginPath();g.ellipse(-r*.22,-r*.3,r*.22,r*.12,-.5,0,TAU);g.fillStyle='rgba(255,255,255,.7)';g.fill();}g.restore();}
function mgbBall(g,x,y,r,col){const gr=g.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);gr.addColorStop(0,col?shade(col,.5):'#8a8a98');gr.addColorStop(.6,col||'#33333d');gr.addColorStop(1,'#111118');
  g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle=gr;g.fill();g.lineWidth=Math.max(1,r*.14);g.strokeStyle='#0c0c12';g.stroke();g.beginPath();g.ellipse(x-r*.35,y-r*.38,r*.3,r*.17,-.6,0,TAU);g.fillStyle='rgba(255,255,255,.55)';g.fill();}
// трофей (кубок-оберег) для окна итогов
function mgbTrophy(g,x,y,r){g.save();g.translate(x,y);g.drawImage(glowSpr('#ffd84a'),-r*1.8,-r*1.8,r*3.6,r*3.6);
  shp(g,'#f0b43a',{hl:.6},[-r*.7,-r*.8,r*.7,r*.3],()=>{g.moveTo(-r*.7,-r*.8);g.lineTo(r*.7,-r*.8);g.quadraticCurveTo(r*.68,r*.25,0,r*.3);g.quadraticCurveTo(-r*.68,r*.25,-r*.7,-r*.8);g.closePath();});
  g.lineWidth=r*.12;g.strokeStyle='#b07a10';for(const s of[-1,1]){g.beginPath();g.arc(s*r*.72,-r*.4,r*.26,s>0?-1.4:1.4-Math.PI*0,s>0?1.4:Math.PI*2-1.4,s<0);g.stroke();}
  rrect(g,-r*.14,r*.28,r*.28,r*.3,r*.05);g.fillStyle='#d89a2a';g.fill();rrect(g,-r*.45,r*.55,r*.9,r*.25,r*.08);g.fillStyle='#8a4a1a';g.fill();g.lineWidth=1;g.strokeStyle='#4a2008';g.stroke();
  mgbStar(g,0,-r*.3,r*.26,true);g.restore();}

/* ---------- частицы ---------- */
// P — массив; виды: spark (свет, сложение), smoke (облачко fxCloud), chip (щепка/обломок с гравитацией), ring (ударная волна), drop (капля)
function mgbPart(P,p){if(P.length<420)P.push(Object.assign({t:0,dur:.6,vx:0,vy:0,g:0,rot:0,vr:0,s:4,col:'#fff',a:1},p));}
function mgbParts(g,P,dt,sc){sc=sc||1;for(let i=P.length-1;i>=0;i--){const p=P[i];p.t+=dt;if(p.t>=p.dur){P.splice(i,1);continue;}if(p.t<0)continue;
    p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.fr){p.vx*=1-p.fr*dt;p.vy*=1-p.fr*dt;}
    const q=p.t/p.dur;
    if(p.k==='spark'){const r=p.s*(1-q*.6);g.globalCompositeOperation='lighter';g.globalAlpha=p.a*(1-q);g.drawImage(glowSpr(p.col),p.x-r*2,p.y-r*2,r*4,r*4);g.globalCompositeOperation='source-over';}
    else if(p.k==='smoke'){const r=p.s*(.5+Math.sqrt(q)*.9);g.globalAlpha=p.a*(1-q)*(q<.1?q*10:1);if(p.dark){g.filter='none';}g.drawImage(p.dark?mgbDarkCloud():fxCloud(),p.x-r,p.y-r,r*2,r*2);}
    else if(p.k==='chip'){g.globalAlpha=p.a*Math.min(1,(1-q)*3);g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.col;g.fillRect(-p.s,-p.s*.4,p.s*2,p.s*.8);g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=.8;g.strokeRect(-p.s,-p.s*.4,p.s*2,p.s*.8);g.restore();}
    else if(p.k==='ring'){g.globalAlpha=p.a*(1-q);g.strokeStyle=p.col;g.lineWidth=(p.w||4)*(1-q)+.5;g.beginPath();g.ellipse(p.x,p.y,p.s*(.2+q),p.s*(.2+q)*(p.fl||1),0,0,TAU);g.stroke();}
    else if(p.k==='drop'){g.globalAlpha=p.a*(1-q*q);g.fillStyle=p.col;g.beginPath();g.arc(p.x,p.y,p.s*(1-q*.4),0,TAU);g.fill();}
    else if(p.k==='leaf'){g.globalAlpha=p.a*(1-q);g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.col;g.beginPath();g.ellipse(0,0,p.s,p.s*.45,0,0,TAU);g.fill();g.restore();}
    g.globalAlpha=1;}}
function mgbDarkCloud(){if(MGB.dc)return MGB.dc;const s=fxCloud(),c=mkCanvas(s.width,s.height),g=c.getContext('2d');g.drawImage(s,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(60,50,56,.82)';g.fillRect(0,0,c.width,c.height);return MGB.dc=c;}
// взрыв: вспышка, огонь, дым, обломки
function mgbBoom(P,x,y,r,o){o=o||{};const lite=document.body.classList.contains('lite'),n=lite?.5:1;
  mgbPart(P,{k:'spark',x,y,s:r*1.1,dur:.28,col:'#fff2b0'});
  for(let i=0;i<10*n;i++){const a=Math.random()*TAU,v=r*(1.5+Math.random()*2.5);mgbPart(P,{k:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-r,g:r*3,s:r*(.18+Math.random()*.2),dur:.35+Math.random()*.35,col:Math.random()<.5?'#ffb03a':'#ffe27a',fr:2});}
  for(let i=0;i<6*n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.6,v=r*(.6+Math.random());mgbPart(P,{k:'smoke',x:x+(Math.random()-.5)*r*.6,y:y-r*.2,vx:Math.cos(a)*v,vy:Math.sin(a)*v-r*.5,s:r*(.5+Math.random()*.4),dur:.9+Math.random()*.6,t:-Math.random()*.1,dark:i%2===0,a:.85,fr:1.5});}
  for(let i=0;i<(o.chips||8)*n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.4,v=r*(2+Math.random()*3);mgbPart(P,{k:'chip',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:r*9,s:r*(.06+Math.random()*.08),rot:Math.random()*6,vr:(Math.random()-.5)*20,dur:.9+Math.random()*.5,col:(o.cols||['#7a4a22','#a87444','#3a3a44'])[i%(o.cols||[0,0,0]).length]});}
  mgbPart(P,{k:'ring',x,y:y+r*.1,s:r*1.6,dur:.4,col:'#fff1c8',w:r*.18,fl:.45});}

/* ---------- всплывающие числа ---------- */
function mgbPop(L,x,y,s,col,big){L.push({x,y,s:String(s),col:col||'#ffe27a',t:0,big:big?1.35:1});}
function mgbPops(g,L,dt,px){for(let i=L.length-1;i>=0;i--){const n=L[i];n.t+=dt;if(n.t>1.3){L.splice(i,1);continue;}const q=n.t/1.3,p=n.t<.14?1+(1-n.t/.14)*.6:1;
  g.globalAlpha=q>.7?(1-q)/.3:1;mgbTxt(g,n.s,n.x,n.y-q*px*2.2,px*n.big*p,n.col);g.globalAlpha=1;}}

/* ---------- короткий финал перед host.done (окно наград рисует оболочка MG0) ----------
   E={title, score, tier, t:0, calm}; ~2,4 с, касание — сразу дальше */
function mgbFinale(g,W,H,E,dt){E.t+=dt;const q=Math.min(1,E.t/.4),ease=1-Math.pow(1-q,3),calm=E.calm,out=E.t>2.1?Math.min(1,(E.t-2.1)/.3):0;
  g.fillStyle='rgba(10,6,20,'+(.45*ease*(1-out*.3))+')';g.fillRect(0,0,W,H);g.globalAlpha=ease*(1-out);
  const cy=H*.44+(calm?0:(1-ease)*-40),rw=Math.min(W-24,460),rx=(W-rw)/2;
  g.save();g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=14;g.shadowOffsetY=5;g.beginPath();g.moveTo(rx,cy-26);g.lineTo(rx+rw,cy-26);g.lineTo(rx+rw-18,cy+4);g.lineTo(rx+rw,cy+34);g.lineTo(rx,cy+34);g.lineTo(rx+18,cy+4);g.closePath();g.fillStyle='#8a2420';g.fill();g.restore();
  rrect(g,rx+26,cy-38,rw-52,72,10);const gr=g.createLinearGradient(0,cy-38,0,cy+34);gr.addColorStop(0,'#e0483c');gr.addColorStop(1,'#a8282a');g.fillStyle=gr;g.fill();g.lineWidth=2.5;g.strokeStyle='#ffd27a';g.stroke();
  let px=30;while(px>16&&mgbTW(g,E.title,px)>rw-80)px--;mgbTxt(g,E.title,W/2,cy-2,px,'#fff3c8');
  const sc=Math.round(E.score*Math.min(1,Math.max(0,(E.t-.25)/.6)));mgbTxt(g,String(sc),W/2,cy+84,58,'#ffd24a',{ol:'#4a2006'});
  for(let i=0;i<3;i++){const on=E.tier>i,tS=.75+i*.3,k=on?Math.min(1,Math.max(0,(E.t-tS)/.22)):0;if(on&&k>0&&!E['s'+i]){E['s'+i]=1;mgbSnd('star',i);}
    const p=k>0&&k<1&&!calm?1+Math.sin(k*Math.PI)*.6:1,x=W/2+(i-1)*62,y=cy+150-(i===1?10:0);mgbStar(g,x,y,(i===1?26:22)*p,on&&k>0,on&&k>=1);}
  g.globalAlpha=1;return E.t>2.45;}

/* ---------- облачко-подсказка с пальцем (обучение) ---------- */
function mgbHand(g,x,y,s,press){g.save();g.translate(x,y);g.scale(s/40,s/40);g.rotate(-.35);
  g.beginPath();g.moveTo(-6,-26);g.quadraticCurveTo(-6,-32,0,-32);g.quadraticCurveTo(6,-32,6,-26);g.lineTo(6,-6);g.lineTo(14,-8);g.quadraticCurveTo(20,-6,18,2);g.lineTo(14,16);g.quadraticCurveTo(10,24,0,24);g.lineTo(-6,24);g.quadraticCurveTo(-14,22,-16,12);g.lineTo(-20,0);g.quadraticCurveTo(-20,-6,-14,-4);g.lineTo(-6,2);g.closePath();
  g.fillStyle='#fff3e0';g.fill();g.lineWidth=2.5;g.strokeStyle='#3a2410';g.stroke();if(press){g.beginPath();g.arc(0,-34,10,0,TAU);g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=3;g.stroke();}g.restore();}
