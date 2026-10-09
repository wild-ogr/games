'use strict';
/* vy-mgb: общий набор помощника MGB для мини-игр «Найди отличия», «Байки гаража», «Домино с Митяем», «Снегоуборка».
   Наружу — только window.VYB (приставка помощника MGB: vyb-). Ядро мини-игр (VYMG_REG, шапка с ✕, окно итогов, награды) — js/vymg-core.js (MG0).
   Подключается ПОСЛЕ js/vymg-core.js и ДО js/vymg-otlich.js / bayki / domino / sneg. Без ядра — ничего не делает (предохранитель).
   VYB.R(seed) — генератор 0..1; VYB.mix(a,r) — перемешать; VYB.L(ru,en); VYB.esc(s); VYB.pc() — мышь/клавиатура; VYB.calm() — спокойный режим;
   VYB.snd(host,k) — звук (host.snd → SND игры: tap/coin/win/crash/horn/meow/flutter…); VYB.buzz(ms);
   VYB.say(host,who,html,mood) — реплика ведущего (host.say ядра; без него — своя строка); VYB.keys(host,fn) — клавиши ПК;
   VYB.mem(host) — свой склад игры (host.mem() ядра → S.vymg.<id>; без ядра — пустой объект в памяти);
   VYB.stage(host,{bar}) — холст на всё поле игры: {cv,g,W,H,d, frame(dt,t), down(p)/move(p)/up(p), resize(), later(fn,ms), stop(), el(tag,cls,html,parent), btn(cls,html,fn,parent)};
   VYB.car(g,x,y,len,wid,col,ang,o) — машина сверху в виде «Летнего двора» (настоящий рисовальщик игры, если он есть);
   VYB.mit(g,x,y,s,t,o) — дед Митяй (облик из Рыбалки, ~/Projects/rybak/js/mg-art.js mit(); если ART дал свой — берём его);
   VYB.pal() — краски машин темы; VYB.tod(t) — палитра двора LOOK.tod (day/morning/evening/night); VYB.rr/ell/lg — рисование. */
(function(){if(typeof VYMG_REG!=='function')return;   // без оболочки MG0 игры не регистрируются
const D=document,PI=Math.PI;
const L=(ru,en)=>{try{return typeof window.L==='function'?window.L(ru,en):(typeof LANG!=='undefined'&&LANG==='en'?en:ru);}catch(e){return ru;}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
function R(seed){let a=(seed>>>0)||1;return()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function mix(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const x=a[i];a[i]=a[j];a[j]=x;}return a;}
function pc(){if(/[?&]vybpc=1/.test(location.search))return true;try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
function calm(){try{return D.body.classList.contains('calm')||matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){return false;}}
function snd(host,k){try{const s=host&&host.snd;if(s&&typeof s[k]==='function'){s[k]();return;}if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(e){}}
function buzz(ms){try{if(typeof window.buzz==='function')window.buzz(ms);else if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
const WHO={shura:['Баба Шура','Granny Shura'],tolik:['Толик','Tolik'],mityai:['Дед Митяй','Grandpa Mityai'],mihalych:['Михалыч','Mikhalych'],valerka:['Валерка','Valerka']};
function say(host,who,html,mood){try{if(host&&typeof host.say==='function')return '<div class="vyb-sayw">'+host.say(who,html,mood)+'</div>';}catch(e){}
  const n=WHO[who]||[who,who];let av='';try{if(who==='shura'&&typeof shuraSvg==='function')av=shuraSvg(mood==='sad'?'sad':'');}catch(e){}
  return '<div class="vyb-say">'+(av?'<span class="vyb-av">'+av+'</span>':'')+'<p><b>'+esc(L(n[0],n[1]))+':</b> <span class="vyb-sb">'+html+'</span></p></div>';}
/* «одно нажатие до начала» (host.intro ядра); без ядра — сразу */
function intro(host,who,text,hint){try{if(host&&typeof host.intro==='function')return host.intro({who,text,hint:hint&&host.pc?hint:''});}catch(e){}return Promise.resolve();}
function keys(host,fn){if(host&&typeof host.keys==='function'){host.keys((k,e)=>fn(k,e));return;}
  const h=e=>{if(host.paused||e.ctrlKey||e.metaKey||e.altKey)return;try{if(fn(e.key,e))e.preventDefault();}catch(x){console.error(x);}};
  addEventListener('keydown',h);try{host.onQuit(()=>removeEventListener('keydown',h));}catch(e){}}
const MEM={};
function mem(host){try{if(host&&typeof host.mem==='function'){const m=host.mem();if(m&&typeof m==='object')return m;}}catch(e){}const id=host&&host.id||'x';return MEM[id]||(MEM[id]={});}
function kc(host,t){try{if(host&&typeof host.kc==='function')return host.kc(t);}catch(e){}return '<kbd class="vyb-kc">'+esc(t)+'</kbd>';}
/* ---------- рисование ---------- */
function rr(g,x,y,w,h,r){r=Math.max(0,Math.min(r||0,Math.abs(w)/2,Math.abs(h)/2));g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function ell(g,x,y,rx,ry,rot){g.beginPath();g.ellipse(x,y,Math.abs(rx),Math.abs(ry),rot||0,0,PI*2);}
function lg(g,x0,y0,x1,y1,st){const gr=g.createLinearGradient(x0,y0,x1,y1);for(let i=0;i<st.length;i+=2)gr.addColorStop(st[i],st[i+1]);return gr;}
function rg(g,x,y,r0,r1,st){const gr=g.createRadialGradient(x,y,r0,x,y,r1);for(let i=0;i<st.length;i+=2)gr.addColorStop(st[i],st[i+1]);return gr;}
function hx(c){c=String(c).replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];const n=parseInt(c,16);return [n>>16&255,n>>8&255,n&255];}
function cmix(a,b,k){const x=hx(a),y=hx(b);return 'rgb('+Math.round(x[0]+(y[0]-x[0])*k)+','+Math.round(x[1]+(y[1]-x[1])*k)+','+Math.round(x[2]+(y[2]-x[2])*k)+')';}
const PAL0=['#ff5a6e','#3f86ff','#4fc24a','#ffc233','#9a6bff','#ff9340','#19c2b8','#f6f8fc','#5b74b8','#ff8fc0'];
function pal(){try{if(typeof LOOK!=='undefined'&&LOOK.pal&&LOOK.pal.length>=8)return LOOK.pal.slice();}catch(e){}return PAL0.slice();}
const TOD0={sky:['#bfe8f6','#e9f7ff'],lawn:['#b9e79a','#9bd97e'],wall:'#ffe9c6',wall2:'#f6d7a6',roof:'#e2795a',frame:'#ffffff',glass:'#8fd0f2',lit:'#ffe9a8',door:'#b8734a',box:'#e2795a',
  walk:'#f4efe4',walkSh:'rgba(40,70,60,.2)',curb:'#ffffff',asph:'#c3ced9',asph2:'#cfd9e3',mark:'rgba(255,255,255,.8)',bush:'#63c05a',bush2:'#86d877',trunk:'#8a6a4a',sh:'rgba(40,60,90,.22)',fl:['#ff5a6e','#ffc233','#ffffff','#ff8fc0']};
function tod(t){try{if(typeof LOOK!=='undefined'&&LOOK.tod&&LOOK.tod[t||'day'])return Object.assign({},TOD0,LOOK.tod[t||'day']);}catch(e){}return Object.assign({},TOD0);}
/* Машина сверху. (x,y) — центр, len — длина, wid — ширина, ang — куда смотрит нос (0 — вверх, PI/2 — вправо). Если в игре есть настоящий рисовальщик
   (makeVehicle + drawVehicle «Летнего двора») — рисуем им, чтобы машины были те же, что во дворах. o: {kind:'taxi'|'amb', len:2|3, snow:0..1} */
const DIRA=[0,PI/2,PI,-PI/2];
function car(g,x,y,len,wid,col,ang,o){o=o||{};const L2=o.cells||2;
  if(!o.own&&typeof makeVehicle==='function'&&typeof drawVehicle==='function'){try{
    const cs=wid/.8,cells=[];for(let i=L2-1;i>=0;i--)cells.push([i,0]);const v=makeVehicle(cells,1,col,L2,1,o.kind||'');if(typeof recolor==='function'&&!o.kind)recolor(v,col);
    v.noArrow=true;g.save();g.translate(x,y);g.rotate(ang-PI/2);const sc=len/((L2-1+.84)*cs);g.scale(sc,1);
    drawVehicle(g,v,0,([px,py])=>[(px-(L2-1)/2)*cs,(py)*cs],cs,{noArrow:true});g.restore();
    if(o.snow)snowCap(g,x,y,len,wid,ang,o.snow);return;}catch(e){}}
  // свой простой рисунок (без игры — на стенде ядра)
  g.save();g.translate(x,y);g.rotate(ang);const w=wid,h=len,ed=cmix(col,'#000',.18),rf=cmix(col,'#fff',.22);
  g.fillStyle='rgba(40,60,90,.22)';rr(g,-w/2+w*.06,-h/2+w*.12,w,h,w*.25);g.fill();
  g.fillStyle='#2a3340';for(const sx of [-1,1])for(const sy of [-1,1]){rr(g,sx*w/2-w*.09,sy*h*.3-w*.2,w*.18,w*.4,w*.06);g.fill();}
  g.fillStyle=ed;rr(g,-w/2,-h/2,w,h,w*.25);g.fill();g.fillStyle=col;rr(g,-w/2+w*.04,-h/2+w*.03,w*.92,h-w*.08,w*.23);g.fill();
  g.fillStyle='#27466e';rr(g,-w*.4,-h*.24,w*.8,h*.56,w*.15);g.fill();g.fillStyle=rf;rr(g,-w*.36,-h*.12,w*.72,h*.32,w*.12);g.fill();
  g.fillStyle='#fffbe0';for(const sx of [-1,1]){rr(g,sx*w*.25-w*.09,-h/2+w*.02,w*.18,w*.1,w*.04);g.fill();}
  g.fillStyle='#e03144';for(const sx of [-1,1]){rr(g,sx*w*.25-w*.09,h/2-w*.1,w*.18,w*.08,w*.03);g.fill();}
  if(o.kind==='taxi'){for(let i=-2;i<=2;i++){g.fillStyle=i%2?'#1d2430':'#fff';g.fillRect(i*w*.09-w*.045,h*.22,w*.09,w*.09);}}
  g.restore();if(o.snow)snowCap(g,x,y,len,wid,ang,o.snow);}
function snowCap(g,x,y,len,wid,ang,k){g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=Math.min(1,k)*.95;g.fillStyle='#ffffff';
  // шапка снега на крыше и полоски на капоте/багажнике — машина узнаваема
  ell(g,-wid*.08,len*.02,wid*.26,len*.16);g.fill();ell(g,wid*.1,len*.06,wid*.2,len*.12);g.fill();ell(g,0,-len*.34,wid*.24,len*.06);g.fill();ell(g,0,len*.38,wid*.2,len*.05);g.fill();
  g.fillStyle='rgba(180,205,230,.6)';ell(g,wid*.06,len*.12,wid*.12,len*.05);g.fill();g.restore();}
/* дерево, куст, клумба сверху */
function tree(g,x,y,r,P,o){o=o||{};g.fillStyle=P.sh;ell(g,x+r*.18,y+r*.3,r,r*.9);g.fill();
  const c1=o.col||P.bush,c2=o.col2||P.bush2;g.fillStyle=c1;for(let i=0;i<6;i++){const a=i/6*PI*2;ell(g,x+Math.cos(a)*r*.48,y+Math.sin(a)*r*.48,r*.56,r*.56);g.fill();}
  g.fillStyle=c2;ell(g,x-r*.2,y-r*.22,r*.48,r*.44);g.fill();if(o.fruit){g.fillStyle=o.fruit;for(let i=0;i<5;i++){const a=i*1.3+.4;ell(g,x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.45,r*.12,r*.12);g.fill();}}}
/* ---------- дед Митяй (облик из Рыбалки: картуз, очки, белая борода, рубаха с пояском) ---------- */
function blink(t,ph){const c=(t+ph)%4.3;return c<.12?1-Math.abs(c-.06)/.06:0;}
function mit(g,x,y,s,t,o){o=o||{};try{if(window.VYPEOPLE&&typeof VYPEOPLE.mit==='function'){VYPEOPLE.mit(g,x,y,s,t,o);return;}}catch(e){}
  const k=s/100,face=o.face||'smile';
  const C={shirt:'#7b8c5a',shirtD:'#5d6b42',skin:'#e6b892',skinD:'#c99572',beard:'#f1f1ec',cap:'#3d4752',capD:'#28303a',pants:'#4b4036',boot:'#2a2420'};
  g.save();g.translate(x,y);g.scale(k,k);
  if(!o.bust){g.fillStyle='rgba(0,0,0,.2)';ell(g,0,0,22,4.5);g.fill();
    g.fillStyle=C.pants;rr(g,-11,-40,10,36,4);g.fill();rr(g,1,-40,10,36,4);g.fill();g.fillStyle=C.boot;rr(g,-13,-7,13,7,3);g.fill();rr(g,0,-7,13,7,3);g.fill();}
  const br=Math.sin(t*1.5)*.6;
  g.fillStyle=lg(g,-18,0,18,0,[0,C.shirtD,.4,C.shirt,1,C.shirtD]);g.beginPath();g.moveTo(-17,-36);g.quadraticCurveTo(-20,-58,-16,-70+br);g.quadraticCurveTo(0,-76,16,-70+br);g.quadraticCurveTo(20,-58,17,-36);g.quadraticCurveTo(0,-32,-17,-36);g.fill();
  g.strokeStyle='#b8402e';g.lineWidth=2.2;g.beginPath();g.moveTo(-17,-43);g.quadraticCurveTo(0,-40,17,-43);g.stroke();
  const arm=o.arm||'rest';g.lineCap='round';
  if(arm==='point'){g.strokeStyle=C.shirt;g.lineWidth=8.5;g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(26,-74,30,-84);g.stroke();g.fillStyle=C.skin;ell(g,31,-86,4,4.4);g.fill();g.strokeStyle=C.skin;g.lineWidth=2.4;g.beginPath();g.moveTo(32,-89);g.lineTo(34,-95);g.stroke();}
  else if(arm==='tile'){g.strokeStyle=C.shirt;g.lineWidth=8.5;g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(24,-56,20,-44);g.stroke();g.fillStyle=C.skin;ell(g,20,-43,4,4.2);g.fill();
    g.fillStyle='#fffdf6';rr(g,14,-58,9,16,2);g.fill();g.fillStyle='#1e1a16';ell(g,18.5,-54,1.3,1.3);g.fill();ell(g,18.5,-46,1.3,1.3);g.fill();}
  else if(arm==='scratch'){g.strokeStyle=C.shirt;g.lineWidth=8.5;g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(26,-80,16,-96);g.stroke();g.fillStyle=C.skin;ell(g,14,-97,4,4.2);g.fill();}
  g.save();g.translate(0,-86+br*.3);g.rotate(Math.sin(t*.8)*.03);
  g.fillStyle=C.skinD;ell(g,-11.6,0,2.8,3.8);g.fill();ell(g,11.6,0,2.8,3.8);g.fill();
  g.fillStyle=rg(g,-3,-3,2,15,[0,cmix(C.skin,'#fff',.12),1,C.skin]);ell(g,0,0,11.5,13);g.fill();
  g.fillStyle=lg(g,0,2,0,26,[0,C.beard,1,cmix(C.beard,'#b9b9b0',.5)]);g.beginPath();g.moveTo(-11,1);g.bezierCurveTo(-13,14,-7,26,0,28);g.bezierCurveTo(7,26,13,14,11,1);g.bezierCurveTo(6,8,-6,8,-11,1);g.fill();
  g.strokeStyle='rgba(150,150,140,.5)';g.lineWidth=.7;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*3,10);g.quadraticCurveTo(i*3.4,18,i*2,25);g.stroke();}
  if(face==='laugh'||face==='wow'){g.fillStyle='#6b2f25';ell(g,.4,10,face==='wow'?2.6:4,face==='wow'?3:2.6);g.fill();}
  g.fillStyle=C.beard;g.beginPath();g.moveTo(.4,4.5);g.bezierCurveTo(-4,3.6,-8,5,-8.5,8.2);g.bezierCurveTo(-5,7.4,-2,7.6,.4,7);g.bezierCurveTo(3,7.6,6,7.4,9,8.2);g.bezierCurveTo(8,5,4,3.6,.4,4.5);g.fill();
  g.fillStyle='#e09484';ell(g,.4,2.6,2.8,3.2);g.fill();
  const bl=blink(t,2.4);g.strokeStyle='#2a211b';g.lineWidth=1.3;g.lineCap='round';
  if(bl>.5||face==='smile'||face==='laugh'){g.beginPath();g.arc(-4.6,-1.5,2.2,PI*1.15,PI*1.85);g.stroke();g.beginPath();g.arc(4.6,-1.5,2.2,PI*1.15,PI*1.85);g.stroke();}
  else{g.fillStyle='#2a211b';ell(g,-4.6,-1.6,1.4,1.7);g.fill();ell(g,4.6,-1.6,1.4,1.7);g.fill();}
  g.strokeStyle='#8a7a5a';g.lineWidth=1;ell(g,-4.6,-1.6,3.6,3.2);g.stroke();ell(g,4.6,-1.6,3.6,3.2);g.stroke();g.beginPath();g.moveTo(-1,-1.8);g.lineTo(1,-1.8);g.stroke();
  g.strokeStyle=C.beard;g.lineWidth=2;g.beginPath();if(face==='think'){g.moveTo(-8,-7);g.quadraticCurveTo(-5,-6,-2,-7.6);g.moveTo(2,-7.6);g.quadraticCurveTo(5,-6,8,-7);}else{g.moveTo(-8,-6);g.quadraticCurveTo(-5,-7.6,-2,-6);g.moveTo(2,-6);g.quadraticCurveTo(5,-7.6,8,-6);}g.stroke();
  g.fillStyle=lg(g,0,-19,0,-6,[0,cmix(C.cap,'#fff',.1),1,C.cap]);g.beginPath();g.moveTo(-12.5,-6.5);g.lineTo(-13.5,-15);g.quadraticCurveTo(0,-21,13.5,-15);g.lineTo(12.5,-6.5);g.quadraticCurveTo(0,-9,-12.5,-6.5);g.fill();
  g.fillStyle=C.capD;g.beginPath();g.moveTo(-11.5,-7);g.quadraticCurveTo(-2,-1,9,-6.6);g.quadraticCurveTo(-1,-4.6,-11.5,-7);g.fill();g.fillStyle='#1f252c';g.fillRect(-12.8,-9.4,25.6,2);
  g.restore();g.restore();}
/* ---------- холст на всё поле игры ---------- */
function stage(host,opt){opt=opt||{};const box=D.createElement('div');box.className='vyb-st';const cv=D.createElement('canvas');cv.className='vyb-cv';box.appendChild(cv);
  host.el.classList.add('vyb-host');host.el.appendChild(box);let bar=null;if(opt.bar){bar=D.createElement('div');bar.className='vyb-bar';host.el.appendChild(bar);}
  const g=cv.getContext('2d'),S={cv,g,W:300,H:300,d:1,box,bar,calm:calm(),frame:null,down:null,move:null,up:null,resize:null,hover:null,stopped:false,t:0};
  function fit(){const r=box.getBoundingClientRect(),w=Math.max(200,Math.round(r.width)),h=Math.max(200,Math.round(r.height)),d=Math.min(2,window.devicePixelRatio||1);
    if(w===S.W&&h===S.H&&d===S.d&&cv.width)return;S.W=w;S.H=h;S.d=d;cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';g.setTransform(d,0,0,d,0,0);
    if(S.resize)try{S.resize();}catch(e){console.error(e);}}
  S.fit=fit;
  const pos=e=>{const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top,id:e.pointerId};};
  let isDown=false;
  cv.addEventListener('pointerdown',e=>{if(S.stopped||host.paused)return;isDown=true;try{cv.setPointerCapture(e.pointerId);}catch(x){}e.preventDefault();if(S.down)try{S.down(pos(e));}catch(x){console.error(x);}});
  cv.addEventListener('pointermove',e=>{if(S.stopped)return;const p=pos(e);if(isDown){if(S.move)try{S.move(p);}catch(x){console.error(x);}}else if(S.hover)try{S.hover(p);}catch(x){}});
  const upH=e=>{if(!isDown)return;isDown=false;if(S.up)try{S.up(pos(e));}catch(x){console.error(x);}};
  cv.addEventListener('pointerup',upH);cv.addEventListener('pointercancel',upH);cv.addEventListener('pointerleave',()=>{if(S.hover&&!isDown)try{S.hover(null);}catch(x){}});
  cv.style.touchAction='none';
  let last=0,raf=0;const tm=[];
  function loop(ts){if(S.stopped)return;raf=requestAnimationFrame(loop);const dt=last?Math.min(.05,(ts-last)/1000):.016;last=ts;S.t+=dt;fit();
    if(S.frame&&!host.paused)try{S.frame(dt,S.t);}catch(e){console.error(e);S.stopped=true;}}
  S.start=()=>{fit();raf=requestAnimationFrame(loop);};
  S.later=(fn,ms)=>{const id=setTimeout(()=>{if(!S.stopped)fn();},S.calm?Math.min(ms,ms*.6):ms);tm.push(id);return id;};
  S.stop=()=>{S.stopped=true;cancelAnimationFrame(raf);tm.forEach(clearTimeout);};
  S.el=(tag,cls,html,parent)=>{const e=D.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;(parent||bar||host.el).appendChild(e);return e;};
  S.btn=(cls,html,fn,parent)=>{const b=S.el('button','btn vyb-b '+(cls||''),html,parent);b.type='button';b.onclick=e=>{e.preventDefault();if(S.stopped||host.paused)return;fn();};return b;};
  S.cursor=c=>{cv.style.cursor=c||'';};
  try{host.onQuit(()=>S.stop());}catch(e){}try{host.onResize(()=>fit());}catch(e){}
  return S;}
/* текст с обводкой на холсте */
function txt(g,s,x,y,size,col,al,stroke,wt){g.font=(wt||800)+' '+size+'px Rubik,-apple-system,"Segoe UI",Roboto,sans-serif';g.textAlign=al||'center';g.textBaseline='middle';
  if(stroke){g.lineJoin='round';g.lineWidth=Math.max(3,size*.22);g.strokeStyle=stroke;g.strokeText(s,x,y);}g.fillStyle=col||'#fff';g.fillText(s,x,y);}
/* вспышка-частицы */
function burst(arr,x,y,n,cols){for(let i=0;i<n;i++){const a=Math.random()*PI*2,v=60+Math.random()*160;arr.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,l:.8+Math.random()*.5,c:cols[i%cols.length],r:2+Math.random()*3});}}
function parts(g,arr,dt){for(let i=arr.length-1;i>=0;i--){const p=arr[i];p.l-=dt;if(p.l<=0){arr.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt;g.globalAlpha=Math.min(1,p.l*2);g.fillStyle=p.c;ell(g,p.x,p.y,p.r,p.r);g.fill();}g.globalAlpha=1;}
/* ---------- стиль (приставка vyb-) ---------- */
const CSS=
'.vyb-host{display:flex;flex-direction:column;min-height:0}'+
'.vyb-st{position:relative;flex:1 1 auto;min-height:220px;overflow:hidden}.vyb-cv{position:absolute;left:0;top:0;display:block;touch-action:none;-webkit-user-select:none;user-select:none}'+
'.vyb-bar{flex:none;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;padding:8px 12px calc(10px + env(safe-area-inset-bottom,0px))}'+
'.vyb-bar .btn{min-height:48px;font-size:16px;padding:10px 16px}.vyb-b:disabled{opacity:.45}.vyb-b small{font-weight:600;opacity:.75}'+
'.vyb-say{display:flex;gap:10px;align-items:center;background:#fffdf7;border-radius:16px;padding:8px 12px;margin:8px 12px 0;box-shadow:0 3px 0 #e2d9c4;flex:none}'+
'.vyb-sayw{flex:none;padding:8px 12px 0}.vyb-sayw .vymg-say{margin:0}'+
'.vyb-say p{margin:0;font-size:15.5px;line-height:1.3}.vyb-av{flex:none;width:44px;height:44px;border-radius:50%;overflow:hidden;background:#ffe1ec}.vyb-av svg{width:100%;height:100%}'+
'.vyb-kc{display:inline-block;min-width:1.4em;padding:0 5px;border:1px solid #b9ae95;border-bottom-width:2px;border-radius:6px;font:700 12px/1.5 inherit;background:#fff;color:#4a4237;margin-left:6px;vertical-align:1px}'+
'.vyb-pick{animation:vybPop .35s ease}@keyframes vybPop{0%{transform:scale(.92)}60%{transform:scale(1.04)}100%{transform:none}}'+
'@media (prefers-reduced-motion:reduce){.vyb-pick{animation:none}}';
try{if(!D.getElementById('vybcss')){const st=D.createElement('style');st.id='vybcss';st.textContent=CSS;D.head.appendChild(st);}}catch(e){}
window.VYB={intro,R,mix,L,esc,pc,calm,snd,buzz,say,keys,mem,kc,rr,ell,lg,rg,cmix,pal,tod,car,snowCap,tree,mit,stage,txt,burst,parts,WHO};
})();
