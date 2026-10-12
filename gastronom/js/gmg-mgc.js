'use strict';
/* gb-MGC — общий набор мини-игр потока MGC (№12 Завоз, №13 Пирамида, №14 Склад, №15 Кот у колбасы). 10.10.2026.
   Грузится оболочкой как deps игры ('js/gmg-mgc.js'), строк в index.html нет. Наружу — только window.GMC (CSS-префикс gmc-).
   GMC.cv(host) → {cv,x,w,h,dpr,fit()} — холст во весь host.el; плотность ≤ 2, на слабых телефонах и в спокойном режиме ≤ 1,25.
   GMC.weak(host) — слабое устройство (≤4 ядер / ≤3 ГБ / спокойный режим) → меньше частиц и плотность 1,25.
   GMC.swipe(host, el, {dir(d), tap(x,y)}) — свайп (L|R|U|D) или нажатие; GMC.dir(key) — стрелки/WASD/ЦФЫВ → L|R|U|D|''.
   GMC.T(id) — тексты игры (js/gmg-<id>-data.js → GMC_DATA[id]); GMC.line(id,key,rnd,ctx) — случайная строка с {подстановкой}.
   GMC.art = host.art оболочки (ставит каждая игра в run); GMC.good(g,type,cx,by,s) — товар host.art.good / drawGood (нет — простая коробка); GMC.tierOf(v,[t1,t2,t3]); GMC.shuffle(a,rnd).
   GMC.btns(html) — ряд крупных кнопок ≥56 px; GMC.css(id,text) — стили один раз. */
(function(){
if(window.GMC)return;
const DATA=window.GMC_DATA=window.GMC_DATA||{};
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
function weak(host){if(host&&host.calm)return true;try{const n=navigator.hardwareConcurrency||8,m=navigator.deviceMemory||8;return n<=4||m<=3;}catch(e){return false;}}
function cv(host){const c=document.createElement('canvas');c.className='gmc-cv';host.el.appendChild(c);
  const d=Math.min(weak(host)?1.25:2,window.devicePixelRatio||1,host.dpr||2);
  const r={cv:c,x:c.getContext('2d'),w:0,h:0,dpr:d,fit:null};
  r.fit=()=>{r.w=Math.max(1,host.el.clientWidth);r.h=Math.max(1,host.el.clientHeight);c.width=Math.round(r.w*d);c.height=Math.round(r.h*d);
    c.style.width=r.w+'px';c.style.height=r.h+'px';r.x.setTransform(d,0,0,d,0,0);};
  r.fit();host.onResize(()=>r.fit());return r;}
function dir(k){return k==='ArrowLeft'||k==='a'||k==='A'||k==='ф'||k==='Ф'?'L':k==='ArrowRight'||k==='d'||k==='D'||k==='в'||k==='В'?'R':
  k==='ArrowUp'||k==='w'||k==='W'||k==='ц'||k==='Ц'?'U':k==='ArrowDown'||k==='s'||k==='S'||k==='ы'||k==='Ы'?'D':'';}
function swipe(host,el,h){let sx=0,sy=0,on=false;const MIN=26;
  host.ptr(el,{down:(x,y)=>{sx=x;sy=y;on=true;},
    up:(x,y)=>{if(!on)return;on=false;const dx=x-sx,dy=y-sy,ax=Math.abs(dx),ay=Math.abs(dy);
      if(Math.max(ax,ay)<MIN){if(h.tap)h.tap(x,y);return;}
      if(h.dir)h.dir(ax>ay?(dx<0?'L':'R'):(dy<0?'U':'D'));}});}
function T(id){return DATA[id]||{};}
function pick(a,rnd){if(!a)return '';if(typeof a==='string')return a;return a.length?a[Math.floor((rnd||Math.random)()*a.length)%a.length]:'';}
function sub(t,c){return String(t||'').replace(/\{(\w+)\}/g,(m,k)=>c&&c[k]!=null?c[k]:'');}
function line(id,key,rnd,ctx){return sub(pick(T(id)[key],rnd),ctx);}
function good(g,t,cx,by,s){try{const A=window.GMC&&GMC.art;if(A&&typeof A.good==='function'){A.good(g,t,cx,by,s);return;}if(typeof drawGood==='function'){drawGood(g,t,cx,by,s);return;}}catch(e){}
  const u=s/100;g.fillStyle='#d9b27a';g.fillRect(cx-22*u,by-40*u,44*u,40*u);g.strokeStyle='#8a6b4a';g.lineWidth=2;g.strokeRect(cx-22*u,by-40*u,44*u,40*u);}
function tierOf(v,t){return v>=t[2]?3:v>=t[1]?2:v>=t[0]?1:0;}
function shuffle(a,rnd){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const q=a[i];a[i]=a[j];a[j]=q;}return a;}
function css(id,text){if(document.getElementById(id))return;const st=document.createElement('style');st.id=id;st.textContent=text;document.head.appendChild(st);}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
css('gmc-kit-css',
'.gmc-cv{position:absolute;left:0;top:0;z-index:0}'+
'.gmc-ui{position:absolute;left:0;right:0;z-index:2;display:flex;justify-content:center;gap:8px;padding:6px 8px;pointer-events:none}'+
'.gmc-ui.bot{bottom:0;padding-bottom:max(8px,env(safe-area-inset-bottom))}.gmc-ui.top{top:0}'+
'.gmc-ui button{pointer-events:auto;min-height:56px;min-width:56px;border:0;border-radius:14px;font:800 18px/1.1 inherit;color:#fff;background:#2563c9;box-shadow:0 3px 0 rgba(0,0,0,.25);padding:0 12px;cursor:pointer;touch-action:manipulation}'+
'.gmc-ui button:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.25)}.gmc-ui button.sec{background:#6b6f76}.gmc-ui button.ok{background:#237a3b}.gmc-ui button.warn{background:#c2410c}'+
'.gmc-ui button.rw{background:#7a3fb0}.gmc-ui button[disabled]{opacity:.45}.gmc-ui kbd{font:12px monospace;opacity:.8;margin-left:4px}'+
'.gmc-msg{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:3;max-width:92%;padding:6px 14px;border-radius:14px;background:rgba(31,51,80,.9);color:#fff;font:800 17px/1.3 inherit;text-align:center;opacity:0;transition:opacity .2s;pointer-events:none}'+
'.gmc-msg.on{opacity:1}.gmc-msg.ok{background:rgba(35,122,59,.92)}.gmc-msg.no{background:rgba(194,65,12,.92)}'+
'@media (prefers-reduced-motion:reduce){.gmc-msg{transition:none}}');
/* реплика поверх поля (одна строка, сама гаснет) */
function msg(host){const d=document.createElement('div');d.className='gmc-msg';host.el.appendChild(d);let t=0;
  const f=(text,cls,ms)=>{d.textContent=text;d.className='gmc-msg on'+(cls?' '+cls:'');clearTimeout(t);t=setTimeout(()=>{d.className='gmc-msg';},ms||1300);};
  host.onQuit(()=>clearTimeout(t));f.el=d;return f;}
window.GMC={DATA,esc,weak,cv,dir,swipe,T,pick,sub,line,good,tierOf,shuffle,css,rr,msg};
})();
