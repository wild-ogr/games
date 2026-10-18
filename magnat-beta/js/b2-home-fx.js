/* b2-home-fx.js — HOME: деньги «капают» (итог дня под суммой в шапке) и мелкие награды значком в ★ вместо чёрной полосы над меню.
   Только transform/opacity (Web Animations); спокойный режим и «меньше движения» — без движения, просто надпись. Грузится из b2-home.js по требованию. */
(function(){'use strict';
if(typeof document==='undefined'||!window.B2||B2.off('home'))return;
const css=`.b2inc{position:absolute;left:0;top:100%;font:800 15px/1 system-ui,sans-serif;white-space:nowrap;pointer-events:none;opacity:0;color:var(--good,#0a7a3a);z-index:4;text-shadow:0 0 3px var(--hd-bg,#fff),0 0 3px var(--hd-bg,#fff)}
.b2inc.neg{color:var(--bad,#c62828)}
.b2aw{position:fixed;z-index:60;top:0;left:0;max-width:min(330px,90vw);padding:8px 12px;border-radius:16px;background:var(--card,#fff);color:var(--ink,#1d2733);font:600 15px/1.25 system-ui,sans-serif;box-shadow:0 6px 22px rgba(20,30,60,.22);pointer-events:none;opacity:0;will-change:transform,opacity}
.b2aw b{color:var(--lk-cr,#5b4cf0)}
.b2cr{position:fixed;z-index:61;font:800 15px/1 system-ui,sans-serif;color:var(--lk-cr,#5b4cf0);pointer-events:none;opacity:0;text-shadow:0 0 3px #fff}
`;
if(!document.getElementById('b2hfCss')){const se=document.createElement('style');se.id='b2hfCss';se.textContent=css;document.head.appendChild(se);}
/* ---------- деньги «капают»: итог дня под суммой, только transform/opacity ---------- */
let lastC=null,inc=null;
function calmNow(){try{return (typeof calm==='function'&&calm())||document.body.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}}
function drip(W){if(lastC==null){lastC=W.cash;return;}const d=Math.round(W.cash-lastC);lastC=W.cash;
  if(!d||document.hidden||!GAME.running||!GAME.running())return;const hc=document.querySelector('#hdr .hcash'),c=document.getElementById('hCash');if(!hc||!c||!c.offsetParent)return;
  if(!inc){inc=document.createElement('i');inc.className='b2inc';inc.setAttribute('aria-hidden','true');}if(inc.parentNode!==hc)hc.appendChild(inc);
  const t=(d>0?'+':'−')+FMT.money(Math.abs(d)).replace(/^−/,'')+(window.innerWidth>=700?L(' за день',' a day'):'');if(inc.textContent!==t)inc.textContent=t;inc.classList.toggle('neg',d<0);
  const x=0;   /* как в макете LOOK B: под суммой, слева (не наезжает на ★) */
  if(calmNow()||!inc.animate){inc.style.transform='translate('+x+'px,0)';inc.style.opacity=1;clearTimeout(drip.t);drip.t=setTimeout(()=>{inc.style.opacity=0;},1400);return;}
  inc.animate([{opacity:0,transform:`translate(${x}px,8px)`},{opacity:1,transform:`translate(${x}px,1px)`,offset:.2},{opacity:1,transform:`translate(${x}px,0)`,offset:.7},{opacity:0,transform:`translate(${x}px,-4px)`}],{duration:1500,easing:'ease-out'});}
/* ---------- мелкие награды — значком в ★ (вместо чёрной полосы над меню) ---------- */
const AW=/^(🎯|🎖|📷|🏛)\s/;let awQ=[],awT=0;
function awShow(){if(!awQ.length)return;if(typeof modalOn!=='undefined'&&modalOn){clearTimeout(awShow.t);awShow.t=setTimeout(awShow,1000);return;}   /* окно открыто — «пилюля» ждёт его закрытия */
  if(awT>Date.now()){clearTimeout(awShow.t);awShow.t=setTimeout(awShow,awT-Date.now()+50);return;}
  if(awQ.length>2){let n=0;const c=awQ.length;for(const x of awQ){const m=/\+\s?(\d+)\s?💎/.exec(x);if(m)n+=+m[1];}awQ=['🎖 '+L('Ещё ','')+c+' '+pl(c,'награда','награды','наград','reward','rewards')+(n?' · +'+n+' 💎':'')+L(' — в Кабинете ★',' — in the Office ★')];}   /* после долгой отлучки — одной «пилюлей», а не очередью на полминуты */
  const t=awQ.shift();awT=Date.now()+2200;
  const rk=document.getElementById('rkBtn')||document.getElementById('crBtn'),hd=document.getElementById('hdr');if(!rk||!hd){toast0(t,2600);return;}
  const e=document.createElement('div');e.className='b2aw';e.setAttribute('role','status');
  const m=/\+\s?(\d+)\s?💎/.exec(t);e.innerHTML=esc(t).replace(/(\+\s?\d+\s?💎)/,'<b>$1</b>');document.body.appendChild(e);
  const hr=hd.getBoundingClientRect(),r=rk.getBoundingClientRect(),w=e.offsetWidth,x=Math.max(8,Math.min(innerWidth-w-8,r.right-w)),y=hr.bottom+8;
  const tx=r.left+r.width/2-(x+w/2),ty=r.top+r.height/2-(y+e.offsetHeight/2);
  const end=()=>{e.remove();try{if(window.POL&&POL.snd)POL.snd('pop');}catch(x){}try{UI.pulse&&UI.pulse(rk);}catch(x){}if(m)crPop(m[1]);setTimeout(awShow,300);};
  if(calmNow()||!e.animate){e.style.transform=`translate(${x}px,${y}px)`;e.style.opacity=1;setTimeout(end,2000);return;}
  const a=e.animate([{opacity:0,transform:`translate(${x}px,${y-10}px) scale(.9)`},{opacity:1,transform:`translate(${x}px,${y}px)`,offset:.1},{opacity:1,transform:`translate(${x}px,${y}px)`,offset:.72},{opacity:0,transform:`translate(${x+tx}px,${y+ty}px) scale(.15)`}],{duration:2100,easing:'ease-in-out'});a.onfinish=end;}
function crPop(n){const c=document.getElementById('crBtn');if(!c)return;const r=c.getBoundingClientRect(),e=document.createElement('i');e.className='b2cr';e.textContent='+'+n+' 💎';document.body.appendChild(e);
  const x=r.left+4,y=r.bottom+2;if(!e.animate||calmNow()){e.style.transform=`translate(${x}px,${y}px)`;e.style.opacity=1;setTimeout(()=>e.remove(),1500);return;}
  e.animate([{opacity:0,transform:`translate(${x}px,${y+8}px)`},{opacity:1,transform:`translate(${x}px,${y}px)`,offset:.2},{opacity:1,transform:`translate(${x}px,${y}px)`,offset:.75},{opacity:0,transform:`translate(${x}px,${y-8}px)`}],{duration:1500}).onfinish=()=>e.remove();}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let toast0=null;
function wrapToast(){if(typeof window.toast!=='function'||window.toast.b2h)return;toast0=window.toast;
  const f=function(t,ms){try{if(typeof t==='string'&&AW.test(t)&&!document.hidden&&!window.__chk&&!B2.off('home')){awQ.push(t);awShow();B2.ev('home','aw',{k:t.slice(0,2)});return;}}catch(e){}return toast0.apply(this,arguments);};
  f.b2h=1;f.q=toast0.q;window.toast=f;}
wrapToast();
if(GAME.on)GAME.on('change',()=>{const W=GAME.W;if(W)lastC=W.cash;});
window.B2HF={day(W){if(W)drip(W);},reset(){lastC=null;}};
})();
