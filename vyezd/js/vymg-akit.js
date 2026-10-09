'use strict';
/* vy-mga: общий набор потока MGA для мини-игр Выезда (Багажник, Дорожные работы, Регулировщик, Номера).
   Наружу — только VYA (префикс vya-, чтобы не пересечься с MG0/MGB/MGC). Подключается ДО js/vymg-bagazh.js и др.
   Холст на весь host.el с ретиной, касание и мышь (pointer*), генератор от зерна, реплики героев, звуки,
   простые рисунки машин (сбоку и сверху) — если ART уже дал VYCARS, машины Номеров берутся оттуда. */
(function(){
if(window.VYA)return;
const VYA={};
/* два языка (Яндекс EN): VYA.L('рус','eng') */
VYA.L=(ru,en)=>{try{return typeof L==='function'?L(ru,en==null?ru:en):ru;}catch(e){return ru;}};
/* генератор 0..1 от зерна (mulberry32) */
VYA.rng=function(seed){let a=(seed|0)||0x9e3779b9;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
VYA.pick=(r,a)=>a[Math.floor(r()*a.length)];
VYA.shuffle=(r,a)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
VYA.clamp=(v,a,b)=>v<a?a:v>b?b:v;
/* звук: оболочка (host.snd) → SND игры → тишина */
VYA.snd=function(host,k){try{if(host&&typeof host.snd==='function'){host.snd(k);return;}if(host&&host.snd&&typeof host.snd[k]==='function'){host.snd[k]();return;}
  if(typeof SND==='object'&&SND&&typeof SND[k]==='function')SND[k]();}catch(e){}};
/* реплика ведущего: оболочка рисует портрет; без оболочки — простой пузырь */
const NAMES={shura:['Баба Шура','Granny Shura'],tolik:['Толик','Tolik'],mihalych:['Михалыч','Mikhalych'],valerka:['Валерка','Valerka'],mityai:['Дед Митяй','Grandpa Mityai']};
const nm=w=>NAMES[w]?VYA.L(NAMES[w][0],NAMES[w][1]):'';
VYA.sayHTML=function(host,who,text,mood){try{if(host&&typeof host.say==='function'){const h=host.say(who,text,mood);if(typeof h==='string')return h;}}catch(e){}
  let pic='';try{if(who==='shura'&&typeof shuraSvg==='function')pic=shuraSvg(mood);}catch(e){}
  return '<div class="vya-say"><div class="vya-pic">'+(pic||'<b>'+(nm(who)||'?')[0]+'</b>')+'</div><div class="vya-bub"><em>'+nm(who)+'</em>'+text+'</div></div>';};
/* строка реплики сверху: el.vyaSay(who,text,mood) меняет текст без перерисовки всего */
VYA.sayBox=function(host,parent){const d=document.createElement('div');d.className='vya-saybox';parent.appendChild(d);
  let last='';d.set=(who,text,mood)=>{const k=who+'|'+text+'|'+(mood||'');if(k===last)return;last=k;d.innerHTML=VYA.sayHTML(host,who,text,mood);};return d;};
/* холст на всё оставшееся место: {cv,cx,W,H,dpr,pt(e),fit()} ; onFit(fn) вызывается при смене размера */
VYA.canvas=function(host,parent){const wrap=document.createElement('div');wrap.className='vya-cvw';const cv=document.createElement('canvas');cv.className='vya-cv';wrap.appendChild(cv);parent.appendChild(wrap);
  const C={cv,wrap,cx:cv.getContext('2d'),W:1,H:1,dpr:1,fns:[]};
  C.fit=function(){const r=wrap.getBoundingClientRect(),w=Math.max(200,Math.round(r.width)),h=Math.max(200,Math.round(r.height)),dpr=Math.min(2.5,window.devicePixelRatio||1);
    if(w===C.W&&h===C.H&&dpr===C.dpr)return false;C.W=w;C.H=h;C.dpr=dpr;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.width=w+'px';cv.style.height=h+'px';
    C.cx.setTransform(dpr,0,0,dpr,0,0);C.fns.forEach(f=>f(w,h));return true;};
  C.onFit=f=>C.fns.push(f);
  C.pt=e=>{const r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
  let ro=null;try{ro=new ResizeObserver(()=>C.fit());ro.observe(wrap);}catch(e){window.addEventListener('resize',C.fit);}
  if(host&&typeof host.onResize==='function')host.onResize(()=>C.fit());
  C.kill=()=>{try{ro&&ro.disconnect();}catch(e){}window.removeEventListener('resize',C.fit);};
  return C;};
/* цикл кадров со своим dt; останавливается при host.paused (ролик/«Выйти?») */
VYA.loop=function(host,step){if(host&&typeof host.loop==='function'){let on=true;host.loop(dt=>{if(on)step(dt);});return ()=>{on=false;};}let on=true,last=0,id=0;const f=t=>{if(!on)return;const dt=last?Math.min(.05,(t-last)/1000):0;last=t;if(!(host&&host.paused))step(dt);id=requestAnimationFrame(f);};id=requestAnimationFrame(f);
  return ()=>{on=false;cancelAnimationFrame(id);};};
VYA.pc=function(host){if(host&&'pc' in host)return !!host.pc;try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}};
VYA.kc=function(host,k){if(host&&typeof host.kc==='function')return host.kc(k);return '<span class="vya-kc">'+k+'</span>';};
/* круглый прямоугольник */
VYA.rr=function(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
VYA.shade=function(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.round(k<0?v*(1+k):v+(255-v)*k);return 'rgb('+f(r)+','+f(g)+','+f(b)+')';};
/* советские цвета машин */
VYA.COL=['#c0392b','#2e86c1','#f1c40f','#ecf0e1','#27ae60','#8e44ad','#d35400','#5d6d7e','#1abc9c','#a04000','#e8daef','#16a085'];
/* машина сбоку (носом вправо, если dir>0): «Жигули»-подобный силуэт; x,y — левый нижний угол кузова над землёй, w — длина */
VYA.carSide=function(c,x,y,w,col,dir,kind){const h=w*.36;c.save();c.translate(x+w/2,y);if(dir<0)c.scale(-1,1);c.translate(-w/2,0);
  const dk=VYA.shade(col,-.3);
  if(kind==='bus'){ // ЛиАЗ / ПАЗик
    VYA.rr(c,0,-w*.42,w,w*.36,w*.05);c.fillStyle=col;c.fill();c.fillStyle='#d6eaf8';for(let i=0;i<5;i++)VYA.rr(c,w*(.06+i*.18),-w*.38,w*.14,w*.12,3),c.fill();
    c.fillStyle=dk;c.fillRect(0,-w*.13,w,w*.03);}
  else{c.beginPath();c.moveTo(w*.02,-h*.35);c.lineTo(w*.04,-h*.72);c.lineTo(w*.26,-h*.78);c.lineTo(w*.36,-h*1.18);c.lineTo(w*.7,-h*1.18);c.lineTo(w*.8,-h*.78);c.lineTo(w*.97,-h*.72);c.lineTo(w*.99,-h*.35);c.closePath();
    c.fillStyle=col;c.fill();c.lineWidth=Math.max(1,w*.012);c.strokeStyle=dk;c.stroke();
    c.fillStyle='#cfe8f7';c.beginPath();c.moveTo(w*.39,-h*1.1);c.lineTo(w*.52,-h*1.1);c.lineTo(w*.52,-h*.8);c.lineTo(w*.31,-h*.8);c.closePath();c.fill();
    c.beginPath();c.moveTo(w*.55,-h*1.1);c.lineTo(w*.68,-h*1.1);c.lineTo(w*.76,-h*.8);c.lineTo(w*.55,-h*.8);c.closePath();c.fill();
    c.fillStyle='#bdc3c7';c.fillRect(w*.0,-h*.42,w*.06,h*.1);c.fillRect(w*.94,-h*.42,w*.06,h*.1);
    c.fillStyle='#f9e79f';c.fillRect(w*.965,-h*.66,w*.03,h*.1);c.fillStyle='#e74c3c';c.fillRect(w*.005,-h*.66,w*.025,h*.1);
    if(kind==='amb'){c.fillStyle='#e74c3c';c.fillRect(w*.1,-h*.6,w*.8,h*.09);c.fillRect(w*.5,-h*1.3,w*.08,h*.12);}
    if(kind==='police'){c.fillStyle='#2e86c1';c.fillRect(w*.08,-h*.58,w*.84,h*.09);}}
  c.fillStyle='#222';for(const k of [.2,.78]){c.beginPath();c.arc(w*k,-h*.3,h*.27,0,7);c.fill();}
  c.fillStyle='#95a5a6';for(const k of [.2,.78]){c.beginPath();c.arc(w*k,-h*.3,h*.12,0,7);c.fill();}
  c.restore();};
/* машина сверху (носом вверх): x,y — центр, w×h — размер; kind: car|amb|bus|police */
VYA.carTop=function(c,x,y,w,h,col,kind,ang){c.save();c.translate(x,y);if(ang)c.rotate(ang);
  const dk=VYA.shade(col,-.3);c.fillStyle='rgba(0,0,0,.18)';VYA.rr(c,-w/2+2,-h/2+3,w,h,w*.28);c.fill();
  c.fillStyle=col;VYA.rr(c,-w/2,-h/2,w,h,w*.28);c.fill();c.strokeStyle=dk;c.lineWidth=1.2;c.stroke();
  if(kind==='bus'){c.fillStyle='#d6eaf8';c.fillRect(-w*.36,-h*.44,w*.72,h*.1);c.fillStyle=dk;for(let i=0;i<4;i++)c.fillRect(-w*.3,-h*.25+i*h*.17,w*.6,h*.06);}
  else{c.fillStyle='#2c3e50';VYA.rr(c,-w*.36,-h*.24,w*.72,h*.18,3);c.fill();VYA.rr(c,-w*.34,h*.18,w*.68,h*.12,3);c.fill();
    c.fillStyle=VYA.shade(col,.15);VYA.rr(c,-w*.36,-h*.05,w*.72,h*.22,3);c.fill();}
  c.fillStyle='#fdfefe';c.fillRect(-w*.42,-h*.5,w*.18,h*.04);c.fillRect(w*.24,-h*.5,w*.18,h*.04);
  if(kind==='amb'){c.fillStyle='#e74c3c';c.fillRect(-w*.08,-h*.05,w*.16,h*.24);c.fillRect(-w*.24,h*.04,w*.48,h*.06);c.fillStyle='#3498db';c.fillRect(-w*.2,-h*.2,w*.4,h*.06);}
  if(kind==='police'){c.fillStyle='#3498db';c.fillRect(-w*.3,-h*.14,w*.6,h*.06);}
  c.restore();};
/* стили набора: только свои классы vya-* */
const css=`.vya-root{display:flex;flex-direction:column;flex:1;min-height:0;height:100%;gap:6px;padding:6px 8px 8px;box-sizing:border-box;position:relative}
.vya-saybox{flex:none;min-height:50px}.vya-saybox .vymg-say{margin:0;align-items:center}.vya-saybox .vymg-av{width:46px;height:46px;border-radius:50%}.vya-saybox .vymg-sb{font-size:15px;line-height:1.28;padding:6px 10px}
.vya-say{display:flex;align-items:center;gap:8px}
.vya-pic{flex:none;width:46px;height:46px;border-radius:50%;background:#fff3d6;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 2px 0 rgba(0,0,0,.12)}
.vya-pic svg{width:100%;height:100%}.vya-pic b{font-size:22px;color:#7a4b1e}
.vya-bub{background:#fffdf7;border-radius:14px;padding:6px 10px;font-size:15px;line-height:1.25;box-shadow:0 2px 0 rgba(0,0,0,.1);flex:1}
.vya-bub em{display:block;font-style:normal;font-weight:800;font-size:12px;color:#a0522d}
.vya-cvw{flex:1;min-height:200px;position:relative;touch-action:none}
.vya-cv{position:absolute;left:0;top:0;display:block;touch-action:none}
.vya-row{flex:none;display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.vya-row .btn{min-height:52px;min-width:56px;font-size:16px}
.vya-row .btn[disabled]{opacity:.45}
.vya-note{flex:none;text-align:center;font-size:13px;color:#4a5a5a;line-height:1.25}
.vya-kc{display:inline-block;min-width:20px;padding:0 5px;border-radius:5px;background:#fff;border:1px solid #b9b2a0;border-bottom-width:3px;font-weight:800;font-size:12px}
body.big .vya-bub{font-size:18px}body.big .vya-note{font-size:15px}`;
VYA.css=function(){if(document.getElementById('vya-css'))return;const s=document.createElement('style');s.id='vya-css';s.textContent=css;document.head.appendChild(s);};
/* корень игры внутри host.el */
VYA.root=function(host){VYA.css();const r=document.createElement('div');r.className='vya-root';host.el.innerHTML='';host.el.appendChild(r);return r;};
/* клавиши ПК: оболочка (host.keys) или свой слушатель, снимается в onQuit */
VYA.keys=function(host,fn){if(host&&typeof host.keys==='function'){host.keys(fn);return ()=>{};}
  const h=e=>{if(fn(e.key,e))e.preventDefault();};window.addEventListener('keydown',h);return ()=>window.removeEventListener('keydown',h);};
/* KEYS: разбор клавиш ПК. VYA.dir(k) → [dx,dy] для стрелок, WASD и русских Ц/Ф/Ы/В (любой регистр) или null;
   VYA.num(k) → 1..9 для цифр (верхний ряд и цифровой блок дают e.key '1'…'9') или 0; VYA.isGo(k) — Пробел/Enter */
const DIRS={arrowup:[0,-1],arrowdown:[0,1],arrowleft:[-1,0],arrowright:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0],'ц':[0,-1],'ы':[0,1],'ф':[-1,0],'в':[1,0]};
VYA.dir=k=>DIRS[String(k||'').toLowerCase()]||null;
VYA.num=k=>/^[1-9]$/.test(k)?+k:0;
VYA.isGo=k=>k===' '||k==='Enter'||k==='Spacebar';
VYA.is=(k,list)=>list.includes(String(k||'').toLowerCase());
/* «одно нажатие до начала» — карточка оболочки (host.intro); без оболочки — сразу */
VYA.intro=function(host,t){try{if(host&&typeof host.intro==='function')return host.intro(t);}catch(e){}return Promise.resolve();};
VYA.top=(host,t)=>{try{host&&host.top&&host.top(t);}catch(e){}};
window.VYA=VYA;
})();
