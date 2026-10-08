'use strict';
/* OB:MGA общий набор мини-игр MGA («Починка частокола», «Набор ополчения», «Котёл тётушки Яги»):
   холст во весь host.el (Retina), цикл кадров с паузой, касания, частицы (облачка, щепки, искры, монетки, сердечки),
   текст с обводкой, кнопки-плашки, окно-вступление и финальная лента. Подключать ДО js/mg-chast.js / mg-opol.js / mg-kotel.js.
   Рисунки — из art.js через mgakPut (кэш по настоящим границам рисунка — artBox, как в FIX1). */
const MGAK={F:'"BgF",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',C:{},ink:'#3a2410',paper:'#f7e2b0',paper2:'#d9b46e'};
function mgakCalmK(o){return o&&o.calm?1.35:1;}
/* рисунок art.js в квадрат px с центром (x,y); opt: {flip, rot, sx, sy, a, ay(точка опоры по y: 0 центр, 1 низ квадрата)} */
function mgakArt(key,px,dpr){const a=artGet(key);if(!a)return null;const k=Math.max(.25,Math.round(px/a.size*dpr*8)/8),id=key+'@'+k;let c=MGAK.C[id];
  if(!c){const b=artBox(key);c=MGAK.C[id]={c:drawArtK(key,k,b),b,s:a.size};}return c;}
function mgakPut(g,key,x,y,px,dpr,opt){const s=mgakArt(key,px,dpr||2);if(!s)return;opt=opt||{};const f=px/s.s,b=s.b;
  if(!opt.flip&&!opt.rot&&!opt.sx&&!opt.sy&&opt.a==null){g.drawImage(s.c,x+b.x0*f,y+b.y0*f,b.w*f,b.h*f);return;}
  g.save();g.translate(x,y);if(opt.rot)g.rotate(opt.rot);g.scale((opt.flip?-1:1)*(opt.sx||1),opt.sy||1);if(opt.a!=null)g.globalAlpha*=opt.a;
  g.drawImage(s.c,b.x0*f,b.y0*f,b.w*f,b.h*f);g.restore();}
/* текст с обводкой. o: {al, bl, w(вес), ol(цвет обводки|false), lw, mw(макс. ширина), sh(тень)} */
function mgakTxt(g,s,x,y,px,col,o){o=o||{};g.font=(o.w||800)+' '+Math.round(px)+'px '+MGAK.F;g.textAlign=o.al||'center';g.textBaseline=o.bl||'middle';
  if(o.mw){const w=g.measureText(s).width;if(w>o.mw){px*=o.mw/w;g.font=(o.w||800)+' '+Math.round(px)+'px '+MGAK.F;}}
  g.lineJoin='round';if(o.sh){g.fillStyle='rgba(0,0,0,.35)';g.fillText(s,x,y+px*.09);}
  if(o.ol!==false){g.strokeStyle=o.ol||'#2a1608';g.lineWidth=o.lw||Math.max(2,px*.2);g.strokeText(s,x,y);}g.fillStyle=col||'#fff';g.fillText(s,x,y);return px;}
/* разбить строку по ширине */
function mgakWrap(g,s,px,mw,w){g.font=(w||700)+' '+Math.round(px)+'px '+MGAK.F;const out=[];for(const para of String(s).split('\n')){let cur='';for(const word of para.split(' ')){const t=cur?cur+' '+word:word;if(g.measureText(t).width>mw&&cur){out.push(cur);cur=word;}else cur=t;}out.push(cur);}return out;}
function mgakRR(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
/* пергаментная плашка в стиле окон игры */
function mgakPanel(g,x,y,w,h,o){o=o||{};const r=o.r||18;g.save();g.fillStyle='rgba(30,16,4,.35)';mgakRR(g,x+2,y+6,w,h,r);g.fill();
  const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,o.c1||'#fbecc6');gr.addColorStop(1,o.c2||'#e2c084');g.fillStyle=gr;mgakRR(g,x,y,w,h,r);g.fill();
  g.lineWidth=o.lw||3.5;g.strokeStyle=o.bc||MGAK.ink;g.stroke();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.5;mgakRR(g,x+5,y+5,w-10,h-10,Math.max(4,r-5));g.stroke();g.restore();}
/* кнопка: b={x,y,w,h,label,col,icon(fn(g,x,y,s))}; нажатая — ниже на 3 px */
function mgakBtnDraw(g,b,t){const dn=b.dn?3:0,col=b.col||'#5fae3a',pulse=b.pulse?1+Math.sin(t*5)*.03:1;g.save();g.translate(b.x+b.w/2,b.y+b.h/2);g.scale(pulse,pulse);g.translate(-b.w/2,-b.h/2+dn);
  g.fillStyle='rgba(30,16,4,.45)';mgakRR(g,0,6-dn,b.w,b.h,b.h*.3);g.fill();const gr=g.createLinearGradient(0,0,0,b.h);gr.addColorStop(0,shade(col,.28));gr.addColorStop(.55,col);gr.addColorStop(1,shade(col,-.2));
  g.fillStyle=gr;mgakRR(g,0,0,b.w,b.h,b.h*.3);g.fill();g.lineWidth=3;g.strokeStyle=shade(col,-.6);g.stroke();
  g.fillStyle='rgba(255,255,255,.28)';mgakRR(g,6,4,b.w-12,b.h*.36,b.h*.18);g.fill();
  const fs=Math.min(b.h*.42,26),tx=b.w/2;
  if(b.icon){g.save();const iw=b.h*.66;g.font='800 '+Math.round(fs)+'px '+MGAK.F;const lw=Math.min(g.measureText(b.label).width,b.w-iw-24),x0=b.w/2-(lw+iw+6)/2;b.icon(g,x0+iw/2,b.h/2,iw);g.restore();
    mgakTxt(g,b.label,x0+iw+6,b.h/2,fs,'#fff',{al:'left',mw:b.w-iw-24});}
  else mgakTxt(g,b.label,tx,b.h/2,fs,'#fff',{mw:b.w-18});g.restore();}
/* полоска времени/прогресса */
function mgakBar(g,x,y,w,h,f,col,label,t){f=Math.max(0,Math.min(1,f));g.save();g.fillStyle='rgba(30,16,4,.4)';mgakRR(g,x,y+3,w,h,h/2);g.fill();
  g.fillStyle='#4a2c14';mgakRR(g,x,y,w,h,h/2);g.fill();if(f>0){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,shade(col,.35));gr.addColorStop(1,shade(col,-.15));g.fillStyle=gr;mgakRR(g,x+3,y+3,Math.max(h-6,(w-6)*f),h-6,(h-6)/2);g.fill();
    g.fillStyle='rgba(255,255,255,.3)';mgakRR(g,x+6,y+4,Math.max(0,(w-12)*f),(h-6)*.35,(h-6)*.2);g.fill();}
  g.lineWidth=2.5;g.strokeStyle=MGAK.ink;mgakRR(g,x,y,w,h,h/2);g.stroke();if(label)mgakTxt(g,label,x+w/2,y+h/2+1,h*.62,'#fff',{lw:3,mw:w-16});g.restore();}
/* ---------- фон: небо, холмы, лес ---------- */
function mgakSky(g,W,H,stops){const gr=g.createLinearGradient(0,0,0,H);stops.forEach((c,i)=>gr.addColorStop(i/(stops.length-1),c));g.fillStyle=gr;g.fillRect(0,0,W,H);}
function mgakHills(g,W,y,amp,col,seed,top){const r=mulberry(seed);g.beginPath();g.moveTo(0,y+40*0+amp);let x=0;const pts=[];while(x<=W+60){pts.push([x,y-r()*amp]);x+=60+r()*80;}
  g.moveTo(-10,y+400);g.lineTo(-10,pts[0][1]);for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];g.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}g.lineTo(W+10,y+400);g.closePath();
  const gr=g.createLinearGradient(0,y-amp,0,y+80);gr.addColorStop(0,top||shade(col,.12));gr.addColorStop(1,col);g.fillStyle=gr;g.fill();}
function mgakPine(g,x,y,h,col,lt){const w=h*.42;g.fillStyle=shade(col,-.25);g.fillRect(x-h*.04,y-h*.12,h*.08,h*.14);
  for(let i=0;i<3;i++){const yy=y-h*.1-i*h*.27,ww=w*(1-i*.24);g.beginPath();g.moveTo(x-ww,yy);g.quadraticCurveTo(x,yy-h*.06,x+ww,yy);g.lineTo(x,yy-h*.42);g.closePath();g.fillStyle=col;g.fill();
    if(lt){g.beginPath();g.moveTo(x,yy-h*.42);g.lineTo(x-ww*.2,yy-h*.02);g.lineTo(x-ww,yy);g.closePath();g.fillStyle=lt;g.fill();}}}
function mgakForest(g,W,y,h,col,seed,lt){const r=mulberry(seed);let x=-20;while(x<W+30){const hh=h*(.7+r()*.5);mgakPine(g,x,y+r()*h*.12,hh,col,lt);x+=hh*.32+r()*h*.25;}}
function mgakStarsSky(g,W,H,seed,n){const r=mulberry(seed);for(let i=0;i<n;i++){const x=r()*W,y=r()*H,s=r()*1.4+.4;g.fillStyle='rgba(255,250,220,'+(.3+r()*.6)+')';g.beginPath();g.arc(x,y,s,0,TAU);g.fill();}}
function mgakGrassTufts(g,x0,x1,y0,y1,col,seed,n){const r=mulberry(seed);g.strokeStyle=col;g.lineWidth=1.6;g.lineCap='round';for(let i=0;i<n;i++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0),h=4+r()*7;
  g.beginPath();g.moveTo(x-3,y);g.quadraticCurveTo(x-3,y-h*.6,x-5,y-h);g.moveTo(x,y);g.lineTo(x+.5,y-h*1.2);g.moveTo(x+3,y);g.quadraticCurveTo(x+3,y-h*.6,x+6,y-h*.9);g.stroke();}}
/* ---------- частицы ---------- */
function mgakBurst(st,k,x,y,n,o){o=o||{};const calm=st.calm;n=calm?Math.ceil(n/2):n;for(let i=0;i<n;i++){const a=o.a!=null?o.a+(Math.random()-.5)*(o.sp||1):Math.random()*TAU,v=(o.v||160)*(.5+Math.random()*.7);
  st.parts.push({k,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(o.up||0),t:0,dur:(o.dur||.8)*(.7+Math.random()*.6),s:(o.s||8)*(.6+Math.random()*.8),rot:Math.random()*TAU,vr:(Math.random()-.5)*10,col:o.col||'#ffe066',gr:o.gr!=null?o.gr:420,key:o.key});}}
function mgakPuff(st,x,y,s,n,col){for(let i=0;i<(n||5);i++)st.parts.push({k:'puff',x:x+(Math.random()-.5)*s*.8,y:y+(Math.random()-.5)*s*.3,vx:(Math.random()-.5)*60,vy:-20-Math.random()*30,t:0,dur:.55+Math.random()*.3,s:s*(.5+Math.random()*.4),col});}
/* летящий значок к цели (сердечко к счётчику и т.п.) */
function mgakFly(st,key,x,y,tx,ty,px,done){st.parts.push({k:'fly',key,x0:x,y0:y,x,y,tx,ty,t:0,dur:.75,s:px,done});}
function mgakPop(st,s,x,y,px,col){st.parts.push({k:'txt',s,x,y,t:0,dur:1.1,s0:px,col:col||'#fff'});}
function mgakParts(st,g,dt){const L=st.parts;for(let i=L.length-1;i>=0;i--){const p=L[i];p.t+=dt;if(p.t>=p.dur){L.splice(i,1);if(p.done)p.done();continue;}const q=p.t/p.dur;
  if(p.k==='fly'){const e=q*q*(3-2*q);p.x=p.x0+(p.tx-p.x0)*e;p.y=p.y0+(p.ty-p.y0)*e-Math.sin(q*Math.PI)*60;mgakPut(g,p.key,p.x,p.y,p.s*(1+Math.sin(q*Math.PI)*.35),st.dpr);continue;}
  if(p.k==='txt'){const sc=p.t<.15?.6+p.t/.15*.6:1.2-Math.min(.2,(p.t-.15)*.6);g.globalAlpha=q>.7?1-(q-.7)/.3:1;mgakTxt(g,p.s,p.x,p.y-q*46,p.s0*sc,p.col,{lw:Math.max(3,p.s0*.22)});g.globalAlpha=1;continue;}
  p.vy+=(p.gr||0)*dt*(p.k==='puff'?0:1);p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=(p.vr||0)*dt;
  if(p.k==='puff'){const c=fxCloud(),s=p.s*(.6+q*.8);g.globalAlpha=(1-q)*.85;g.drawImage(p.col===1?mgakDarkCloud():c,p.x-s/2,p.y-s/2,s,s);g.globalAlpha=1;}
  else if(p.k==='spark'){g.globalAlpha=1-q;g.fillStyle=p.col;g.save();g.translate(p.x,p.y);g.rotate(p.rot);const r=p.s*(1-q*.5);g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(0,0,r,0);g.quadraticCurveTo(0,0,0,r);g.quadraticCurveTo(0,0,-r,0);g.quadraticCurveTo(0,0,0,-r);g.fill();g.restore();g.globalAlpha=1;}
  else if(p.k==='chip'){g.globalAlpha=q>.7?1-(q-.7)/.3:1;g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.col;g.fillRect(-p.s/2,-p.s/5,p.s,p.s/2.5);g.restore();g.globalAlpha=1;}
  else if(p.k==='dot'){g.globalAlpha=1-q;g.fillStyle=p.col;g.beginPath();g.arc(p.x,p.y,p.s*(1-q*.6),0,TAU);g.fill();g.globalAlpha=1;}
  else if(p.k==='art'){g.globalAlpha=q>.75?1-(q-.75)/.25:1;mgakPut(g,p.key,p.x,p.y,p.s*2,st.dpr,{rot:p.rot});g.globalAlpha=1;}}}
/* ---------- сцена: холст, цикл, касания ---------- */
function mgakStage(host,o){
  const cv=document.createElement('canvas');cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none;display:block';host.el.appendChild(cv);
  const st={host,o,cv,g:cv.getContext('2d'),W:1,H:1,dpr:1,u:1,t:0,parts:[],btns:[],alive:true,calm:!!(o&&o.calm),top:8,draw:null,update:null,down:null,move:null,up:null,onFit:null,shake:0};
  const stTop=()=>{try{const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--st'))||0;return v;}catch(e){return 0;}};
  st.fit=function(){const W=Math.max(200,host.el.clientWidth||host.w),H=Math.max(200,host.el.clientHeight||host.h);st.dpr=Math.min(2.5,host.dpr||1);cv.width=Math.round(W*st.dpr);cv.height=Math.round(H*st.dpr);
    st.W=W;st.H=H;st.wide=W>H*1.15;st.u=Math.max(.72,Math.min(W/390,H/(W>H*1.15?600:740),1.6));st.top=stTop()+8;if(st.onFit)st.onFit();};
  host.onResize(()=>st.fit());
  let last=performance.now(),raf=0;
  const frame=now=>{if(!st.alive)return;raf=requestAnimationFrame(frame);let dt=Math.min(.05,(now-last)/1000);last=now;const pz=host.paused||document.hidden;if(pz)dt=0;
    st.t+=dt;if(st.update&&dt>0)st.update(dt);const g=st.g;g.setTransform(st.dpr,0,0,st.dpr,0,0);g.clearRect(0,0,st.W,st.H);
    g.save();if(st.shake>0&&!st.calm){st.shake=Math.max(0,st.shake-dt*30);g.translate((Math.random()-.5)*st.shake,(Math.random()-.5)*st.shake);}
    st.btns=[];if(st.draw)st.draw(g,dt);mgakParts(st,g,dt);if(st.over)st.over(g,dt);g.restore();for(const b of st.btns)mgakBtnDraw(g,b,st.t);};
  const pt=e=>{const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top,id:e.pointerId};};
  let pressed=null;
  cv.addEventListener('pointerdown',e=>{e.preventDefault();const p=pt(e);try{cv.setPointerCapture(e.pointerId);}catch(x){}
    for(let i=st.btns.length-1;i>=0;i--){const b=st.btns[i];if(p.x>=b.x-6&&p.x<=b.x+b.w+6&&p.y>=b.y-6&&p.y<=b.y+b.h+6){pressed=b;b.dn=1;st.pressId=b.id;return;}}
    if(st.down)st.down(p);});
  cv.addEventListener('pointermove',e=>{const p=pt(e);if(pressed)return;if(st.move)st.move(p);});
  const fin=e=>{const p=pt(e);if(pressed){const b=pressed;pressed=null;st.pressId=null;if(Math.abs(p.x-(b.x+b.w/2))<b.w/2+20&&Math.abs(p.y-(b.y+b.h/2))<b.h/2+20){try{SND.click();}catch(x){}b.fn&&b.fn();}return;}if(st.up)st.up(p,e.type==='pointercancel');};
  cv.addEventListener('pointerup',fin);cv.addEventListener('pointercancel',fin);
  /* кнопка в этом кадре (рисуется поверх всего) */
  st.btn=function(id,x,y,w,h,label,col,fn,o2){const b=Object.assign({id,x,y,w,h,label,col,fn,dn:st.pressId===id},o2||{});st.btns.push(b);return b;};
  /* клавиатура (ПК): Enter/пробел — главная кнопка экрана (id 'go'), остальное — st.key(e.key) */
  st.pc=!!(window.matchMedia&&matchMedia('(hover: hover) and (pointer: fine)').matches);
  const onKey=e=>{if(!st.alive||e.repeat)return;if(e.key==='Enter'||e.key===' '){const b=st.btns.find(b=>b.id==='go');if(b){e.preventDefault();try{SND.click();}catch(x){}b.fn&&b.fn();return;}}
    if(st.key&&st.key(e.key)){e.preventDefault();}};
  window.addEventListener('keydown',onKey);
  st.stop=function(){st.alive=false;cancelAnimationFrame(raf);window.removeEventListener('keydown',onKey);};
  host.onQuit(()=>st.stop());
  st.fit();raf=requestAnimationFrame(frame);return st;}
/* окно-вступление: заголовок, картинка, правила, кнопка «Начать» (+ необязательная кнопка ролика). Рисовать в st.over, пока st.intro */
function mgakIntro(g,st,I){const W=st.W,H=st.H,u=st.u,q=Math.min(1,(st.t-(I.t0||0))/.35),e=1-Math.pow(1-q,3),sc=.86+.14*e+Math.sin(q*Math.PI)*.04;
  g.fillStyle='rgba(12,8,20,'+(.5*e)+')';g.fillRect(0,0,W,H);
  const pw=Math.min(W-28,440*Math.min(1.15,u)),fs=Math.max(15,17*Math.min(u,1.2)),lines=mgakWrap(g,I.text,fs,pw-44,700),lh=fs*1.32,ih=I.ih||110*Math.min(u,1.2),
    bh=Math.max(64,66*Math.min(u,1.1)),ph=70*Math.min(u,1.1)+ih+lines.length*lh+bh+(I.ad?bh*.86+12:0)+48;
  const px=(W-pw)/2,py=Math.max(st.top+56,(H-ph)/2);g.save();g.translate(W/2,py+ph/2);g.scale(sc,sc);g.translate(-W/2,-(py+ph/2));g.globalAlpha=e;
  mgakPanel(g,px,py,pw,ph,{r:22});
  // лента-заголовок
  const rw=pw*.86,rh=50*Math.min(u,1.1),rx=W/2-rw/2,ry=py-rh*.42;g.fillStyle='#8a1f1a';g.beginPath();g.moveTo(rx-16,ry+10);g.lineTo(rx+6,ry+10);g.lineTo(rx+6,ry+rh+10);g.lineTo(rx-16,ry+rh+10);g.lineTo(rx-6,ry+rh/2+10);g.closePath();g.fill();
  g.beginPath();g.moveTo(rx+rw+16,ry+10);g.lineTo(rx+rw-6,ry+10);g.lineTo(rx+rw-6,ry+rh+10);g.lineTo(rx+rw+16,ry+rh+10);g.lineTo(rx+rw+6,ry+rh/2+10);g.closePath();g.fill();
  const rg=g.createLinearGradient(0,ry,0,ry+rh);rg.addColorStop(0,'#e0483c');rg.addColorStop(1,'#a8261e');g.fillStyle=rg;mgakRR(g,rx,ry,rw,rh,8);g.fill();g.lineWidth=3;g.strokeStyle='#4a0e0a';g.stroke();
  mgakTxt(g,I.title,W/2,ry+rh/2+1,rh*.5,'#fff3c8',{mw:rw-24,lw:4});
  let y=ry+rh+14;if(I.pic){g.save();I.pic(g,W/2,y+ih/2,ih);g.restore();}y+=ih+8;
  for(const s of lines){mgakTxt(g,s,W/2,y+lh/2,fs,MGAK.ink,{w:700,ol:false});y+=lh;}
  y+=14;g.restore();g.globalAlpha=1;
  if(q>=1){const bw=Math.min(pw-48,300);st.btn('go',W/2-bw/2,y,bw,bh,I.go||Lg('Начать','Start'),'#5fae3a',I.onGo,{pulse:1});
    if(I.ad)st.btn('ad',W/2-bw/2,y+bh+12,bw,bh*.86,I.ad.label,'#3a7ad8',I.ad.fn,{icon:mgakIcoFilm});}}
function mgakIcoFilm(g,x,y,s){g.save();g.translate(x,y);const w=s*.8,h=s*.58;g.fillStyle='#fff';mgakRR(g,-w/2,-h/2,w,h,s*.1);g.fill();g.fillStyle='#3a7ad8';g.beginPath();g.moveTo(-w*.12,-h*.26);g.lineTo(w*.24,0);g.lineTo(-w*.12,h*.26);g.closePath();g.fill();g.restore();}
/* финальная лента: заголовок + строка награды + значок; через dur секунд → then() */
function mgakFinale(st,F){st.fin=Object.assign({t0:st.t,dur:2.6},F);try{(F.good?SND.win:SND.up)();}catch(e){}
  if(!st.calm)for(let i=0;i<(F.good?36:14);i++)st.parts.push({k:'chip',x:Math.random()*st.W,y:-20-Math.random()*120,vx:(Math.random()-.5)*60,vy:60+Math.random()*120,t:0,dur:2.4,s:7+Math.random()*6,rot:Math.random()*TAU,vr:(Math.random()-.5)*12,col:['#ffd84a','#e8433a','#5fae3a','#4aa8f0','#fff3c8'][i%5],gr:120});
  setTimeout(()=>{if(st.alive&&F.then)F.then();},F.dur*1000||2600);}
function mgakFinDraw(g,st){const F=st.fin;if(!F)return;const W=st.W,H=st.H,u=Math.min(st.u,1.2),q=Math.min(1,(st.t-F.t0)/.45),e=1-Math.pow(1-q,3),bo=q<1?Math.sin(q*Math.PI)*.12:0;
  g.fillStyle='rgba(12,8,20,'+(.5*Math.min(1,q*1.5))+')';g.fillRect(0,0,W,H);
  const cy=H*.44,pw=Math.min(W-28,420*u);g.font='800 '+Math.round(19*u)+'px '+MGAK.F;const L=F.sub?mgakWrap(g,F.sub,19*u,pw-40,800):[],ph=60*u+(F.ico?84*u:0)+L.length*25*u+34*u;
  // лучи за окном
  if(F.good){g.save();g.translate(W/2,cy);g.rotate(st.calm?0:st.t*.35);g.globalAlpha=.32*e;g.fillStyle='#ffe9a0';for(let i=0;i<12;i++){g.rotate(TAU/12);g.beginPath();g.moveTo(0,0);g.lineTo(-40*u,-Math.max(W,H));g.lineTo(40*u,-Math.max(W,H));g.closePath();g.fill();}g.restore();}
  g.save();g.translate(W/2,cy);const sc=.6+.4*e+bo;g.scale(sc,sc);g.globalAlpha=Math.min(1,q*2);
  mgakPanel(g,-pw/2,-ph/2,pw,ph,{r:22});
  // лента с заголовком
  const rw=pw*.92,rh=52*u,rx=-rw/2,ry=-ph/2-rh*.45,c1=F.good?'#e0483c':'#8a6a4a',c2=F.good?'#a8261e':'#5a4028';g.fillStyle=F.good?'#8a1f1a':'#4a3420';
  for(const s of[-1,1]){const x0=s<0?rx:rx+rw;g.beginPath();g.moveTo(x0+s*18,ry+10);g.lineTo(x0-s*6,ry+10);g.lineTo(x0-s*6,ry+rh+10);g.lineTo(x0+s*18,ry+rh+10);g.lineTo(x0+s*8,ry+rh/2+10);g.closePath();g.fill();}
  const rg=g.createLinearGradient(0,ry,0,ry+rh);rg.addColorStop(0,c1);rg.addColorStop(1,c2);g.fillStyle=rg;mgakRR(g,rx,ry,rw,rh,8);g.fill();g.lineWidth=3;g.strokeStyle='#3a0e0a';g.stroke();
  mgakTxt(g,F.title,0,ry+rh/2+1,rh*.46,'#fff3c8',{mw:rw-24,lw:4});
  let y=ry+rh+22*u;if(F.ico){F.ico(g,0,y+30*u,64*u,st.t);y+=84*u;}
  for(const s of L){mgakTxt(g,s,0,y,19*u,MGAK.ink,{ol:false,w:800});y+=25*u;}
  g.restore();g.globalAlpha=1;}
/* бревно лёжа (куча): центр (x,y), длина L, толщина d */
function chastLogH(g,x,y,L,d){g.save();g.translate(x,y);const gr=g.createLinearGradient(0,-d/2,0,d/2);gr.addColorStop(0,'#b07a44');gr.addColorStop(.45,'#8a5a2e');gr.addColorStop(1,'#4e2e14');
  mgakRR(g,-L/2,-d/2,L,d,d*.35);g.fillStyle=gr;g.fill();g.lineWidth=2;g.strokeStyle='#3a2410';g.stroke();
  g.strokeStyle='rgba(50,26,8,.4)';g.lineWidth=1;for(const k of[-.28,.05,.3]){g.beginPath();g.moveTo(-L*.4,d*k);g.lineTo(L*.32,d*k+1);g.stroke();}
  g.beginPath();g.ellipse(L/2-d*.18,0,d*.3,d*.48,0,0,TAU);g.fillStyle='#e8c890';g.fill();g.stroke();g.strokeStyle='rgba(140,90,40,.7)';g.lineWidth=1;
  for(const r of[.32,.62]){g.beginPath();g.ellipse(L/2-d*.18,0,d*.3*r,d*.48*r,0,0,TAU);g.stroke();}g.restore();}
/* пламя костра: основание (x,y), размер s */
function mgakFlame(g,x,y,s,t){const fl=n=>Math.sin(t*n)*.5+Math.sin(t*n*1.7)*.5;g.save();g.globalCompositeOperation='lighter';const gw=g.createRadialGradient(x,y-s*.3,0,x,y-s*.3,s*2.2);gw.addColorStop(0,'rgba(255,190,90,.55)');gw.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=gw;g.fillRect(x-s*2.4,y-s*2.6,s*4.8,s*4.4);g.restore();
  for(const [c,k,o2] of[['#ff6a1e',1,0],['#ffb02e',.72,1.3],['#fff2a0',.42,2.1]]){const h=s*(1.25+fl(9+o2)*.18)*k,w=s*.6*k;g.beginPath();g.moveTo(x-w,y);g.bezierCurveTo(x-w*1.1,y-h*.5,x-w*.2+fl(7+o2)*w*.3,y-h*.7,x+fl(11+o2)*w*.25,y-h);g.bezierCurveTo(x+w*.3,y-h*.6,x+w*1.2,y-h*.45,x+w,y);g.closePath();g.fillStyle=c;g.fill();}}
/* тёмное облачко (дым неудачи) */
function mgakDarkCloud(){if(MGAK.dc)return MGAK.dc;const s=fxCloud(),c=mkCanvas(s.width,s.height),g=c.getContext('2d');g.drawImage(s,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(40,34,46,.82)';g.fillRect(0,0,c.width,c.height);return MGAK.dc=c;}
/* значок клавиши (клавиша с надписью или стрелкой): центр (x,y), размер s; dir — 'L','R','U','D' или текст */
function mgakKey(g,x,y,s,dir,hot){g.save();g.translate(x,y);g.fillStyle='rgba(20,10,0,.45)';mgakRR(g,-s/2,-s/2+3,s,s,s*.22);g.fill();
  const gr=g.createLinearGradient(0,-s/2,0,s/2);gr.addColorStop(0,hot?'#fff7c0':'#ffffff');gr.addColorStop(1,hot?'#f0c040':'#d8d0c0');g.fillStyle=gr;mgakRR(g,-s/2,-s/2,s,s,s*.22);g.fill();g.lineWidth=2;g.strokeStyle='#3a2410';g.stroke();
  if(dir.length===1&&'LRUD'.includes(dir)){g.rotate({R:0,D:Math.PI/2,L:Math.PI,U:-Math.PI/2}[dir]);g.fillStyle='#3a2410';g.beginPath();const a=s*.3;g.moveTo(a,0);g.lineTo(-a*.1,-a*.8);g.lineTo(-a*.1,-a*.3);g.lineTo(-a,-a*.3);g.lineTo(-a,a*.3);g.lineTo(-a*.1,a*.3);g.lineTo(-a*.1,a*.8);g.closePath();g.fill();}
  else mgakTxt(g,dir,0,1,s*.56,'#3a2410',{ol:false});g.restore();}
/* рука-подсказка (палец) с центром кончика пальца в (x,y) */
function mgakHand(g,x,y,u){g.save();g.translate(x,y);g.rotate(-.35);g.lineJoin='round';g.fillStyle='#fff3e0';g.strokeStyle='#3a2410';g.lineWidth=2.5;
  mgakRR(g,-6*u,-2*u,12*u,26*u,6*u);g.fill();g.stroke();mgakRR(g,-14*u,16*u,30*u,26*u,10*u);g.fill();g.stroke();
  for(const dx of[-9,-2,5])  {g.beginPath();g.moveTo(dx*u+3*u,17*u);g.lineTo(dx*u+3*u,24*u);g.stroke();}
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=3;g.beginPath();g.arc(0,0,12*u,0,TAU);g.stroke();g.restore();}
/* сердечко/монета/звезда — значки (рисунки art.js) */
function mgakIco(key){return (g,x,y,s)=>mgakPut(g,key,x,y,s,2);}
/* бот мини-игры: качество игрока q 0..1 (плохой ~.25, средний ~.55, хороший ~.85) → оценка счёта по правилам игры */
function mgakSkill(o){const s=o&&o.skill;return s==='bad'?.25:s==='good'?.88:s==='avg'?.58:typeof s==='number'?s:.58;}
