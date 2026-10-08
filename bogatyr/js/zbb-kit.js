'use strict';
/* BGB (08.10) — набор сцены «Забав» помощника BGB: Городки (№4), Лук по яблоку (№5), Перетягивание каната (№7).
   Всё в замыкании; наружу — один объект window.zbbK (приставка zbb — чтобы не столкнуться с наборами других помощников).
   Перенесено из Обороны (mg-bkit.js «Царь-пушка») и переименовано: сцена-холст, рисунки art.js, текст с обводкой,
   плашки/кнопки, частицы, всплывающие числа, финал со звёздами, вступление «как играть» (телефон / ПК со значками клавиш),
   окно «по нужде» за ролик. Ничего в бою и сохранении не трогает. */
(function(){
const TAU2=Math.PI*2;
const K={dpr:1,C:{}};
const FONT='"BgF",system-ui,-apple-system,sans-serif';
K.calm=o=>!!(o&&o.calm)||(typeof S!=='undefined'&&S&&!!S.calm);
K.rng=seed=>mulberry(((seed|0)^0x5bd1e995)>>>0);
K.snd=(k,a)=>{try{if(typeof SND!=='undefined'&&SND[k])SND[k](a);}catch(e){}};
K.font=(px,w)=>(w||800)+' '+Math.round(px)+'px '+FONT;
K.L=(ru,en)=>typeof L==='function'?L(ru,en):ru;
K.en=()=>typeof LANG!=='undefined'&&LANG==='en';
// ПК: есть мышь (hover + точный указатель)
K.pc=()=>{try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}};
K.heroKey=()=>{try{const h=HERO_BY[S.hero]&&heroOpen(HERO_BY[S.hero])?S.hero:'dob';const k='h_'+(typeof skinKey==='function'?skinKey(h):h)+'_0';return ART[k]?k:'h_dob_0';}catch(e){return 'h_dob_0';}};

/* ---------- сцена: холст во весь host.el, Retina (dpr ≤ 2), кадры, касания ---------- */
K.stage=function(host,h){
  const el=host.el,cv=document.createElement('canvas');
  cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:pointer';
  if(getComputedStyle(el).position==='static')el.style.position='relative';
  el.appendChild(cv);
  const st={cv,g:cv.getContext('2d'),W:1,H:1,dpr:1,t:0,alive:true,raf:0,last:0,shx:0,shy:0,shake:0};
  function fit(){const r=el.getBoundingClientRect(),W=Math.max(200,Math.round(r.width||innerWidth)),H=Math.max(200,Math.round(r.height||innerHeight)),d=Math.min(2,window.devicePixelRatio||1);
    if(W===st.W&&H===st.H&&d===st.dpr)return;st.W=W;st.H=H;st.dpr=d;K.dpr=d;cv.width=Math.round(W*d);cv.height=Math.round(H*d);h.resize&&h.resize(W,H,d);}
  st.fit=fit;fit();
  const onR=()=>fit();window.addEventListener('resize',onR);let ro=null;try{ro=new ResizeObserver(onR);ro.observe(el);}catch(e){}
  function pos(e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*(st.W/(r.width||st.W)),y:(e.clientY-r.top)*(st.H/(r.height||st.H)),id:e.pointerId,m:e.pointerType==='mouse'};}
  let pid=null;
  const pd=e=>{if(!st.alive||(h.paused&&h.paused()))return;e.preventDefault();if(pid!=null&&pid!==e.pointerId)return;pid=e.pointerId;try{cv.setPointerCapture(e.pointerId);}catch(_){}h.down&&h.down(pos(e));},
    pm=e=>{if(!st.alive)return;if(pid==null){h.hover&&h.hover(pos(e));return;}if(pid!==e.pointerId)return;e.preventDefault();h.move&&h.move(pos(e));},
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
    const g=st.g;g.setTransform(st.dpr,0,0,st.dpr,0,0);h.draw&&h.draw(g,st.W,st.H,dt);}
  st.raf=requestAnimationFrame(frame);
  st.stop=()=>{if(!st.alive)return;st.alive=false;cancelAnimationFrame(st.raf);window.removeEventListener('resize',onR);try{ro&&ro.disconnect();}catch(e){}
    cv.removeEventListener('pointerdown',pd);cv.removeEventListener('pointermove',pm);cv.removeEventListener('pointerup',pu);cv.removeEventListener('pointercancel',pc);};
  st.kill=()=>{st.stop();if(cv.parentNode)cv.parentNode.removeChild(cv);};
  if(host.onQuit)host.onQuit(()=>st.kill());
  return st;};

/* ---------- клавиши: только пока игра на экране, не на паузе и без окна поверх (оболочки) ---------- */
K.keys=function(host,fn){const veil=()=>{const r=host.root||(host.el&&host.el.parentNode);return !!(r&&r.querySelector&&r.querySelector('.mgVeil,.zbVeil,.zabVeil'));};
  const kd=e=>{if(!host.el||!host.el.isConnected){off();return;}if(host.paused||veil())return;if(e.repeat&&!/^Arrow/.test(e.key))return;
    try{if(fn(e.key,e,true)){e.preventDefault();e.stopImmediatePropagation();}}catch(x){console.error(x);}},
    ku=e=>{if(!host.el||!host.el.isConnected){off();return;}if(host.paused||veil())return;try{if(fn(e.key,e,false)){e.preventDefault();e.stopImmediatePropagation();}}catch(x){console.error(x);}},
    off=()=>{window.removeEventListener('keydown',kd,true);window.removeEventListener('keyup',ku,true);};
  window.addEventListener('keydown',kd,true);window.addEventListener('keyup',ku,true);if(host.onQuit)host.onQuit(off);return off;};

/* ---------- рисунок art.js целиком (с запасом по краям: колпаки/ветки не обрезаются), кэш по размеру ---------- */
K.art=function(g,key,x,y,sz,o){o=o||{};const a=typeof ART!=='undefined'&&ART[key];if(!a)return;const d=K.dpr||1,q=Math.max(.25,Math.min(5,Math.ceil(sz/a.size*d*4)/4)),id=key+'@'+q;
  let c=K.C[id];if(!c){const px=Math.ceil(a.size*q),pad=Math.ceil(px*.3);c=mkCanvas(px+pad*2,px+pad*2);const cg=c.getContext('2d');
    if(a.tint){cg.drawImage(drawArt(key,px),pad,pad);}else{cg.setTransform(q,0,0,q,pad+px/2,pad+px/2);cg.lineJoin='round';cg.lineCap='round';try{a.fn(cg);}catch(e){}}
    c.q=q;c.pad=pad;c.px=px;K.C[id]=c;}
  const f=sz/(c.px);g.save();g.translate(x,y);if(o.rot)g.rotate(o.rot);g.scale((o.flip?-1:1)*(o.sx||1),o.sy||1);if(o.alpha!=null)g.globalAlpha*=o.alpha;
  g.drawImage(c,-c.width/2*f,-c.height/2*f,c.width*f,c.height*f);g.restore();};

/* ---------- текст с обводкой ---------- */
K.txt=function(g,s,x,y,px,col,o){o=o||{};g.font=K.font(px,o.w);g.textAlign=o.al||'center';g.textBaseline=o.bl||'middle';g.lineJoin='round';g.miterLimit=2;
  if(o.mw){const w=g.measureText(s).width;if(w>o.mw){px=px*o.mw/w;g.font=K.font(px,o.w);}}
  if(o.sh!==false){g.fillStyle='rgba(20,8,0,.35)';g.fillText(s,x,y+Math.max(1.5,px*.08));}
  if(o.ol!==false){g.lineWidth=o.lw||Math.max(2.5,px*.2);g.strokeStyle=o.ol||'#2a1406';g.strokeText(s,x,y);}g.fillStyle=col||'#fff';g.fillText(s,x,y);};
K.tw=(g,s,px,w)=>{g.font=K.font(px,w);return g.measureText(s).width;};
K.wrap=function(g,s,px,maxW,w){g.font=K.font(px,w);const out=[];for(const para of String(s).split('\n')){let line='';for(const wd of para.split(' ')){const t=line?line+' '+wd:wd;if(g.measureText(t).width>maxW&&line){out.push(line);line=wd;}else line=t;}out.push(line);}return out;};

/* ---------- плашки, свиток, кнопки, значки ---------- */
K.plate=function(g,x,y,w,h,o){o=o||{};const r=o.r!=null?o.r:Math.min(h/2,14);g.save();
  g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=8;g.shadowOffsetY=3;rrect(g,x,y,w,h,r);
  const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,o.c1||'#5a3418');gr.addColorStop(1,o.c2||'#33190a');g.fillStyle=gr;g.fill();g.restore();
  rrect(g,x+1.5,y+1.5,w-3,h-3,Math.max(1,r-1.5));g.lineWidth=2;g.strokeStyle=o.rim||'#e6b53a';g.stroke();
  rrect(g,x+4,y+4,w-8,Math.max(2,h*.42),Math.max(1,r-4));g.fillStyle='rgba(255,240,200,.08)';g.fill();};
K.scroll=function(g,x,y,w,h){g.save();g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=18;g.shadowOffsetY=6;rrect(g,x,y,w,h,16);g.fillStyle='#f3e2bb';g.fill();g.restore();
  const gr=g.createRadialGradient(x+w/2,y+h*.4,Math.min(w,h)*.2,x+w/2,y+h/2,Math.max(w,h)*.75);gr.addColorStop(0,'#fbf0d4');gr.addColorStop(1,'#dcbf86');rrect(g,x,y,w,h,16);g.fillStyle=gr;g.fill();
  rrect(g,x+6,y+6,w-12,h-12,11);g.lineWidth=2;g.strokeStyle='#b0823c';g.stroke();rrect(g,x+11,y+11,w-22,h-22,8);g.lineWidth=1;g.strokeStyle='rgba(140,90,30,.45)';g.stroke();
  g.fillStyle='#b0823c';for(const [cx,cy] of[[x+14,y+14],[x+w-14,y+14],[x+14,y+h-14],[x+w-14,y+h-14]]){g.beginPath();g.moveTo(cx,cy-5);g.lineTo(cx+5,cy);g.lineTo(cx,cy+5);g.lineTo(cx-5,cy);g.closePath();g.fill();}};
// красная лента-заголовок
K.ribbon=function(g,cx,cy,w,title,px){const h=px*1.9;g.save();g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=10;g.shadowOffsetY=4;
  g.beginPath();g.moveTo(cx-w/2-16,cy-h*.32);g.lineTo(cx-w/2+8,cy-h*.32);g.lineTo(cx-w/2+8,cy+h*.5);g.lineTo(cx-w/2-16,cy+h*.5);g.lineTo(cx-w/2-6,cy+h*.09);g.closePath();g.fillStyle='#7a1c1a';g.fill();
  g.beginPath();g.moveTo(cx+w/2+16,cy-h*.32);g.lineTo(cx+w/2-8,cy-h*.32);g.lineTo(cx+w/2-8,cy+h*.5);g.lineTo(cx+w/2+16,cy+h*.5);g.lineTo(cx+w/2+6,cy+h*.09);g.closePath();g.fill();g.restore();
  rrect(g,cx-w/2,cy-h/2,w,h,8);const gr=g.createLinearGradient(0,cy-h/2,0,cy+h/2);gr.addColorStop(0,'#e0483c');gr.addColorStop(1,'#a8282a');g.fillStyle=gr;g.fill();g.lineWidth=2.5;g.strokeStyle='#ffd27a';g.stroke();
  K.txt(g,title,cx,cy+1,px,'#fff3c8',{mw:w-24});};
K.btn=function(g,b,label,o){o=o||{};const {x,y,w,h}=b,pr=b.pressed?2:0,c=o.col||'#3f9a3a';g.save();g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=10;g.shadowOffsetY=4;
  rrect(g,x,y+pr,w,h,h*.32);g.fillStyle=shade(c,-.45);g.fill();g.restore();rrect(g,x,y+pr,w,h-5,h*.32);const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,shade(c,.35));gr.addColorStop(1,c);g.fillStyle=gr;g.fill();
  rrect(g,x+6,y+pr+4,w-12,h*.3,h*.2);g.fillStyle='rgba(255,255,255,.28)';g.fill();
  let px=o.px||Math.min(26,h*.42);const iw=o.icon?h*.62:0,kw=o.key?K.kcW(o.key,h*.42)+10:0;while(px>12&&K.tw(g,label,px)>w-24-iw-kw)px-=1;
  const tw=K.tw(g,label,px),tx=x+w/2+(iw-kw)/2;if(o.icon)o.icon(g,tx-tw/2-iw*.55,y+pr+h/2-3,h*.42);
  K.txt(g,label,tx,y+pr+h/2-3,px,'#fff',{ol:shade(c,-.6)});if(o.key)K.keycap(g,tx+tw/2+kw/2+2,y+pr+h/2-3,o.key,h*.42);};
K.hit=(b,p)=>!!b&&p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h;
K.kcW=(lbl,px)=>{const s=String(lbl);return Math.max(px,px*(s.length>2?.3:.36)*s.length+px*.62);};
K.keycap=function(g,x,y,lbl,px){px=px||24;const s=String(lbl),w=K.kcW(s,px);g.save();g.fillStyle='rgba(30,18,8,.55)';rrect(g,x-w/2,y-px/2+3,w,px,px*.22);g.fill();
  const gr=g.createLinearGradient(0,y-px/2,0,y+px/2);gr.addColorStop(0,'#fffaf0');gr.addColorStop(1,'#e6d2a8');g.fillStyle=gr;rrect(g,x-w/2,y-px/2,w,px,px*.22);g.fill();g.strokeStyle='#5a3a1a';g.lineWidth=Math.max(1.5,px*.07);g.stroke();
  g.font='900 '+Math.round(px*(s.length>2?.42:.62))+'px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#3a2410';g.fillText(s,x,y+px*.03);g.restore();return w;};
K.star=function(g,x,y,r,on,glowOn){g.save();g.translate(x,y);if(on&&glowOn)g.drawImage(glowSpr('#ffd84a'),-r*2,-r*2,r*4,r*4);g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr+r*.06);}g.closePath();
  if(on){const gr=g.createLinearGradient(0,-r,0,r);gr.addColorStop(0,'#fff19a');gr.addColorStop(.5,'#ffc93a');gr.addColorStop(1,'#e08a12');g.fillStyle=gr;}else g.fillStyle='rgba(40,30,50,.55)';
  g.fill();g.lineWidth=Math.max(1.2,r*.14);g.strokeStyle=on?'#7a4206':'rgba(255,230,180,.45)';g.stroke();if(on){g.beginPath();g.ellipse(-r*.22,-r*.3,r*.22,r*.12,-.5,0,TAU2);g.fillStyle='rgba(255,255,255,.7)';g.fill();}g.restore();};
// значок «ролик» (кинолента с треугольником) — без эмодзи
K.icAd=function(g,x,y,s){g.save();g.translate(x,y);rrect(g,-s*.6,-s*.42,s*1.2,s*.84,s*.16);g.fillStyle='#fff6dc';g.fill();g.lineWidth=s*.08;g.strokeStyle='#4a2a10';g.stroke();
  g.beginPath();g.moveTo(-s*.16,-s*.24);g.lineTo(s*.26,0);g.lineTo(-s*.16,s*.24);g.closePath();g.fillStyle='#d8392f';g.fill();g.restore();};
K.hand=function(g,x,y,s,press){g.save();g.translate(x,y);g.scale(s/40,s/40);g.rotate(-.35);
  g.beginPath();g.moveTo(-6,-26);g.quadraticCurveTo(-6,-32,0,-32);g.quadraticCurveTo(6,-32,6,-26);g.lineTo(6,-6);g.lineTo(14,-8);g.quadraticCurveTo(20,-6,18,2);g.lineTo(14,16);g.quadraticCurveTo(10,24,0,24);g.lineTo(-6,24);g.quadraticCurveTo(-14,22,-16,12);g.lineTo(-20,0);g.quadraticCurveTo(-20,-6,-14,-4);g.lineTo(-6,2);g.closePath();
  g.fillStyle='#fff3e0';g.fill();g.lineWidth=2.5;g.strokeStyle='#3a2410';g.stroke();if(press){g.beginPath();g.arc(0,-34,10,0,TAU2);g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=3;g.stroke();}g.restore();};
K.glow=function(g,x,y,r,col,a){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a==null?.6:a;g.drawImage(glowSpr(col),x-r,y-r,r*2,r*2);g.restore();};
// облако (спрайт, кэш)
K.cloud=function(){if(K.cl)return K.cl;const c=mkCanvas(200,110),g=c.getContext('2d');
  for(const [x,y,r] of[[60,70,34],[100,52,44],[145,68,32],[80,80,28],[125,82,30]]){const gr=g.createRadialGradient(x-r*.3,y-r*.4,r*.2,x,y,r);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.75,'rgba(250,246,240,.95)');gr.addColorStop(1,'rgba(230,226,236,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU2);g.fill();}
  return K.cl=c;};

/* ---------- частицы: spark (свет), smoke (облачко), chip (щепка), ring (волна), drop (капля), leaf (лист) ---------- */
K.part=(P,p)=>{if(P.length<420)P.push(Object.assign({t:0,dur:.6,vx:0,vy:0,g:0,rot:0,vr:0,s:4,col:'#fff',a:1},p));};
K.parts=function(g,P,dt){for(let i=P.length-1;i>=0;i--){const p=P[i];p.t+=dt;if(p.t>=p.dur){P.splice(i,1);continue;}if(p.t<0)continue;
    p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.fr){p.vx*=1-p.fr*dt;p.vy*=1-p.fr*dt;}
    const q=p.t/p.dur;
    if(p.k==='spark'){const r=p.s*(1-q*.6);g.globalCompositeOperation='lighter';g.globalAlpha=p.a*(1-q);g.drawImage(glowSpr(p.col),p.x-r*2,p.y-r*2,r*4,r*4);g.globalCompositeOperation='source-over';}
    else if(p.k==='smoke'){const r=p.s*(.5+Math.sqrt(q)*.9);g.globalAlpha=p.a*(1-q)*(q<.1?q*10:1);g.drawImage(K.cloud(),p.x-r,p.y-r*.6,r*2,r*1.2);}
    else if(p.k==='chip'){g.globalAlpha=p.a*Math.min(1,(1-q)*3);g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.col;g.fillRect(-p.s,-p.s*.4,p.s*2,p.s*.8);g.restore();}
    else if(p.k==='ring'){g.globalAlpha=p.a*(1-q);g.strokeStyle=p.col;g.lineWidth=(p.w||4)*(1-q)+.5;g.beginPath();g.ellipse(p.x,p.y,p.s*(.2+q),p.s*(.2+q)*(p.fl||1),0,0,TAU2);g.stroke();}
    else if(p.k==='drop'){g.globalAlpha=p.a*(1-q*q);g.fillStyle=p.col;g.beginPath();g.arc(p.x,p.y,p.s*(1-q*.4),0,TAU2);g.fill();}
    else if(p.k==='leaf'){g.globalAlpha=p.a*(1-q);g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.col;g.beginPath();g.ellipse(0,0,p.s,p.s*.45,0,0,TAU2);g.fill();g.restore();}
    g.globalAlpha=1;}};
K.dust=function(P,x,y,r,col,n){for(let i=0;i<(n||8);i++){const a=-Math.PI/2+(Math.random()-.5)*2.6,v=r*(.8+Math.random()*1.6);K.part(P,{k:'smoke',x:x+(Math.random()-.5)*r,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.5,s:r*(.35+Math.random()*.3),dur:.7+Math.random()*.5,a:.75,fr:2.2});}
  for(let i=0;i<(n||8);i++){const a=-Math.PI/2+(Math.random()-.5)*2.2,v=r*(2+Math.random()*3);K.part(P,{k:'chip',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:r*12,s:r*(.05+Math.random()*.06),rot:Math.random()*6,vr:(Math.random()-.5)*20,dur:.7,col:col||'#8a6a3a'});}};
K.sparks=function(P,x,y,r,cols,n){for(let i=0;i<(n||14);i++){const a=Math.random()*TAU2,v=r*(1.5+Math.random()*2.5);K.part(P,{k:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-r,g:r*3,s:r*(.14+Math.random()*.16),dur:.4+Math.random()*.4,col:(cols||['#ffe27a','#ffb03a'])[i%(cols||[0,0]).length],fr:2});}};

/* ---------- всплывающие числа ---------- */
K.pop=(Ls,x,y,s,col,big)=>{Ls.push({x,y,s:String(s),col:col||'#ffe27a',t:0,big:big?1.35:1});};
K.pops=function(g,Ls,dt,px){for(let i=Ls.length-1;i>=0;i--){const n=Ls[i];n.t+=dt;if(n.t>1.3){Ls.splice(i,1);continue;}const q=n.t/1.3,p=n.t<.14?1+(1-n.t/.14)*.6:1;
  g.globalAlpha=q>.7?(1-q)/.3:1;K.txt(g,n.s,n.x,n.y-q*px*2.2,px*n.big*p,n.col);g.globalAlpha=1;}};

/* ---------- вступление «как играть»: I={title, lines:[...], pc:[[ключи,текст],...], art(g,x,y,s)?, t} → кнопка «Начать» ---------- */
K.intro=function(g,W,H,I,dt){I.t=(I.t||0)+dt;const q=Math.min(1,I.t/.35),e=1-Math.pow(1-q,3);
  g.fillStyle='rgba(12,8,4,'+(.5*e)+')';g.fillRect(0,0,W,H);
  const pc=K.pc(),rows=pc&&I.pc?I.pc:null,w=Math.min(W-28,470),px=W<380?16:18;
  const lines=[];for(const s of I.lines){for(const l of K.wrap(g,s,px,w-60,700))lines.push(l);lines.push(null);}lines.pop();
  const rh=px*1.45,hh=(I.art?110:20)+lines.length*rh+(rows?rows.length*(px*2.1)+14:0)+150,h=Math.min(H-40,hh),x=(W-w)/2,y=Math.max(20,(H-h)/2)+(1-e)*30;
  g.globalAlpha=e;K.scroll(g,x,y,w,h);K.ribbon(g,W/2,y+4,Math.min(w-30,360),I.title,W<380?22:26);
  let cy=y+46;if(I.art){I.art(g,W/2,cy+44,90);cy+=104;}
  for(const l of lines){if(l==null){cy+=rh*.4;continue;}K.txt(g,l,W/2,cy,px,'#4a2a10',{ol:false,sh:false,w:700});cy+=rh;}
  if(rows){cy+=8;for(const [ks,tx] of rows){g.font=K.font(px-1,700);const kp=px*1.5;let kw=0;for(const k of ks)kw+=K.kcW(k,kp)+6;const tw=Math.min(g.measureText(tx).width,w-60-kw),tot=kw+4+tw;let kx=W/2-tot/2;
      for(const k of ks){const ww=K.kcW(k,kp);K.keycap(g,kx+ww/2,cy,k,kp);kx+=ww+6;}
      K.txt(g,tx,kx+4,cy,px-1,'#4a2a10',{ol:false,sh:false,al:'left',w:700,mw:x+w-kx-22});cy+=px*2.1;}}
  const bw=Math.min(w-60,280),b=I.b={x:W/2-bw/2,y:Math.min(y+h-78,cy+14),w:bw,h:60,pressed:I.b&&I.b.pressed};
  K.btn(g,b,L('Начать','Start'),{col:'#3f9a3a',key:pc?L('Пробел','Space'):null});g.globalAlpha=1;return b;};

/* ---------- просьба «по нужде» за ролик: O={title, sub, yes, t} → O.bs = [да, нет] ---------- */
K.offer=function(g,W,H,O,dt){O.t=(O.t||0)+dt;const e=Math.min(1,O.t/.3);g.fillStyle='rgba(12,8,4,'+(.55*e)+')';g.fillRect(0,0,W,H);g.globalAlpha=e;
  const w=Math.min(W-28,430),h=268,x=(W-w)/2,y=(H-h)/2;K.scroll(g,x,y,w,h);K.ribbon(g,W/2,y+4,Math.min(w-40,330),O.title,22);
  const ls=K.wrap(g,O.sub,17,w-56,700);let cy=y+50;for(const l of ls){K.txt(g,l,W/2,cy,17,'#4a2a10',{ol:false,sh:false,w:700});cy+=24;}
  const bw=w-56,b1={x:x+28,y:y+h-140,w:bw,h:60},b2={x:x+28,y:y+h-72,w:bw,h:52};if(O.bs){b1.pressed=O.bs[0].pressed;b2.pressed=O.bs[1].pressed;}
  K.btn(g,b1,O.yes,{col:'#d8862a',icon:K.icAd});K.btn(g,b2,L('Нет, хватит','No, that’s enough'),{col:'#8a7a6a',px:18});g.globalAlpha=1;O.bs=[b1,b2];return O.bs;};

/* ---------- короткий финал перед host.done (окно наград рисует оболочка): E={title,score,unit,tier,t,calm} ~2,5 с ---------- */
K.finale=function(g,W,H,E,dt){E.t+=dt;const q=Math.min(1,E.t/.4),ease=1-Math.pow(1-q,3),calm=E.calm,out=E.t>2.3?Math.min(1,(E.t-2.3)/.3):0;
  g.fillStyle='rgba(10,6,20,'+(.45*ease*(1-out*.3))+')';g.fillRect(0,0,W,H);g.globalAlpha=ease*(1-out);
  const cy=H*.4+(calm?0:(1-ease)*-40),rw=Math.min(W-24,460);
  K.ribbon(g,W/2,cy,rw-60,E.title,W<380?24:30);
  const sc=Math.round(E.score*Math.min(1,Math.max(0,(E.t-.25)/.6)));K.txt(g,String(sc),W/2,cy+82,62,'#ffd24a',{ol:'#4a2006'});
  if(E.unit)K.txt(g,E.unit,W/2,cy+124,20,'#fff3c8');
  for(let i=0;i<3;i++){const on=E.tier>i,tS=.75+i*.3,k=on?Math.min(1,Math.max(0,(E.t-tS)/.22)):0;if(on&&k>0&&!E['s'+i]){E['s'+i]=1;K.snd('gem');}
    const p=k>0&&k<1&&!calm?1+Math.sin(k*Math.PI)*.6:1,x=W/2+(i-1)*64,y=cy+172-(i===1?10:0);K.star(g,x,y,(i===1?27:23)*p,on&&k>0,on&&k>=1);}
  g.globalAlpha=1;return E.t>2.65;};

/* ---------- общий ход «конец → (просьба за ролик) → финал → host.done» ---------- */
// GS: {host,o,tier(s),title(t),unit,adKind,adTitle,adSub,adYes,adWant()→bool,onAd()}
K.ender=function(host,o,GS){const E={st:0,offer:null,fin:null,used:0,done:0};
  E.end=score=>{E.score=score;if(!o.train&&o.mode!=='day2'&&o.mode!=='train'&&!E.used&&GS.adWant&&GS.adWant(score)&&host.ad&&host.adOk&&(()=>{try{return host.adOk();}catch(e){return false;}})()){E.offer={t:0};try{host.offer&&host.offer();}catch(e){}return;}E.final();};
  E.final=()=>{E.offer=null;const t=GS.tier(E.score);E.fin={t:0,calm:K.calm(o),title:GS.title(t,E.score),score:E.score,unit:GS.unit?GS.unit(E.score):'',tier:t};K.snd(t>=2?'win':t>=1?'level':'lose');};
  E.yes=()=>{if(E.busy)return;E.busy=1;K.snd('click');host.ad(GS.adKind||'more').then(ok=>{E.busy=0;if(ok){E.used=1;E.offer=null;GS.onAd&&GS.onAd();}else E.final();});};
  E.no=()=>{K.snd('click');E.final();};
  E.draw=(g,W,H,dt)=>{if(E.offer){K.offer(g,W,H,Object.assign(E.offer,{title:GS.adTitle,sub:GS.adSub(E.score),yes:GS.adYes}),dt);return;}
    if(E.fin&&K.finale(g,W,H,E.fin,dt)&&!E.done){E.done=1;GS.finish(E.score,E.fin.tier);}};
  E.down=p=>{if(E.offer&&E.offer.bs){for(const b of E.offer.bs)if(K.hit(b,p))b.pressed=1;return true;}if(E.fin){E.fin.t=Math.max(E.fin.t,2.3);return true;}return false;};
  E.up=p=>{if(E.offer&&E.offer.bs){const [a,b]=E.offer.bs;if(a.pressed&&K.hit(a,p))E.yes();else if(b.pressed&&K.hit(b,p))E.no();a.pressed=b.pressed=0;return true;}return !!E.fin;};
  E.key=k=>{if(E.offer){if(k==='Enter'||k===' ')E.yes();else if(k==='Escape'||k==='Backspace')E.no();return true;}if(E.fin){if(k==='Enter'||k===' ')E.fin.t=Math.max(E.fin.t,2.3);return true;}return false;};
  E.on=()=>!!(E.offer||E.fin);
  return E;};

/* ---------- регистрация (ядро BG0: ZAB_REG; пока ядра нет — копим в очередь) ---------- */
K.reg=function(g){if(typeof ZAB_REG==='function')ZAB_REG(g);else(window.zbbQ=window.zbbQ||[]).push(g);};

window.zbbK=K;
})();
