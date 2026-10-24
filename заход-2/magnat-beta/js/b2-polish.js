/* b2-polish.js — POLISH «Магнат 2.0»: вид уровня топа по стиль-гиду (hobby-analytics/release-b/M50-boost/logs/STYLE.md).
   window.POL: d(x) «+86 тыс. ₽», ds(x) «+86 тыс.», roll(el,a,b,ms,fmt) докрутка, pop(el,delta) всплывающее «+…», ic(key) значок,
   snd(name) звук (tap coin cash coins stamp gavel bell build pop swoosh win no alert; файлы — по требованию, иначе SND), still() — не двигать.
   CSS — секция «b2-polish» в css/look-a.css. Класс html.b2p — поток включён; html.b2-still — спокойный режим / меньше движения / слабый телефон.
   Тяжёлое: b2-icons.js (значки сверх icons.js), b2-polish-snd.js (звуки). Устройство: B2.s('p'). Флаг: B2.off.polish. */
(function(){'use strict';
B2.off.polish=0;          // 1 — выключено по умолчанию
if(B2.off('polish'))return;
const DOM=typeof document!=='undefined'&&typeof window!=='undefined';
const R=typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:{});
const money=x=>(R.FMT&&FMT.money)?FMT.money(x):String(Math.round(x||0))+' ₽';
const sgn=x=>x>0?'+':x<0?'−':'';
const POL={
  d(x){x=Math.round(x||0);return sgn(x)+money(Math.abs(x));},
  ds(x){return POL.d(x).replace(/\s?₽$/,'');},
  cls(x){return x>0?'b2-pos':x<0?'b2-neg':'';},
  still(){if(!DOM)return true;const b=document.body;return !!(b&&b.classList.contains('calm'))||RM||weak||document.hidden;},
  ic(k){const I=R.ICONS;if(!I||!I.svg||!I.svg(k))return '';return '<lk-i class="i-'+k+'" style="'+I.vars(k)+'">'+I.svg(k)+'</lk-i>';},
  roll(el,a,b,ms,fmt){if(!el)return;fmt=fmt||money;a=+a||0;b=+b||0;
    if(el._b2r)cancelAnimationFrame(el._b2r);
    if(a===b||POL.still()||!R.requestAnimationFrame){el.textContent=fmt(b);return;}
    ms=ms||Math.min(900,Math.max(600,Math.log10(Math.abs(b-a)+1)*110));const t0=performance.now();
    const st=t=>{let k=Math.min(1,(t-t0)/ms);k=1-Math.pow(1-k,3);el.textContent=fmt(a+(b-a)*k);if(k<1)el._b2r=requestAnimationFrame(st);else el._b2r=0;};
    el._b2r=requestAnimationFrame(st);},
  pop(el,delta,txt){if(!DOM||!el||!delta||POL.still())return;const r=el.getBoundingClientRect?el.getBoundingClientRect():null;if(!r||!r.width)return;
    const p=document.createElement('div');p.className='b2-pop '+POL.cls(delta);p.textContent=txt||POL.ds(delta);
    p.style.left=Math.round(r.left+r.width/2)+'px';p.style.top=Math.round(r.top-4)+'px';document.body.appendChild(p);setTimeout(()=>{p.remove();},1300);},
  snd(n){if(!DOM)return;try{if(typeof S!=='undefined'&&S&&S.sound===false)return;}catch(e){}
    if(SX&&SX.play(n))return;const old={cash:'close',coins:'coin',stamp:'gavel',bell:'win',pop:'coin'};
    const f=typeof SND!=='undefined'&&(SND[n]||SND[old[n]]);if(f&&n!=='swoosh')try{f();}catch(e){}
    if(!SX&&!sxL){sxL=1;B2.need('b2-polish-snd.js').then(()=>{SX=R.POLSND||null;}).catch(()=>{});}}
};
let SX=null,sxL=0,RM=false,weak=false;
R.POL=POL;
if(!DOM)return;
try{RM=!!(matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){}
const H=document.documentElement;H.classList.add('b2p');
function upd(){H.classList.toggle('b2-still',POL.still());}
// слабый телефон: 3 с после загрузки меряем кадры; средний кадр > 45 мс → не двигать (запомнить на устройстве, пересчёт раз в 7 дней)
const sp=B2.s('p');
if(sp.wk&&Date.now()-sp.wkT<7*864e5)weak=sp.wk===2;
else setTimeout(()=>{if(document.hidden)return;let n=0,t0=0;const f=t=>{if(!t0)t0=t;n++;if(t-t0<3000)requestAnimationFrame(f);else{weak=n>0&&(t-t0)/n>45;sp.wk=weak?2:1;sp.wkT=Date.now();upd();}};requestAnimationFrame(f);},4000);
['click','visibilitychange'].forEach(e=>document.addEventListener(e,()=>setTimeout(upd,0),{passive:true}));
if(document.body)upd();else document.addEventListener('DOMContentLoaded',upd);
// Людмила ≤ 2 строк (STYLE §6): длинный текст .say / пузыря — 2 строки и «▼ Подробнее» (не в обучении и не там, где внутри кнопки)
function cut(el){if(!el||el.__b2c)return;let ps=[].filter.call(el.children,c=>c.tagName==='P'&&!c.querySelector('button,input,a'));
  if(!ps.length){if(el.querySelector('button,input,select,a,.btn'))return;ps=[].slice.call(el.childNodes);}
  const w=document.createElement('div');w.className='b2-cut';const ref=ps[0];if(!ref)return;el.insertBefore(w,ref);ps.forEach(n=>w.appendChild(n));
  const lh=parseFloat(getComputedStyle(w).lineHeight)||22;el.__b2c=1;if(w.scrollHeight<=lh*2.6+6){w.classList.remove('b2-cut');return;}
  const b=document.createElement('button');b.className='b2-more noenter';b.type='button';b.textContent=(typeof L==='function'?L('▼ Подробнее','▼ More'):'▼');
  b.onclick=e=>{e.stopPropagation();w.classList.remove('b2-cut');b.remove();};w.insertAdjacentElement('afterend',b);}
function cuts(){try{document.querySelectorAll('.say>div').forEach(cut);const a=document.getElementById('adv');if(a&&a.classList.contains('on')&&!document.getElementById('advOff'))cut(a.querySelector('.at'));}catch(e){}}
let cT=0;const cq=()=>{if(!cT)cT=requestAnimationFrame(()=>{cT=0;cuts();});};
const mo=()=>{['main','modal','adv'].forEach(id=>{const e=document.getElementById(id);if(e)new MutationObserver(cq).observe(e,{childList:true,subtree:true});});cq();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mo);else mo();
// значки сверх icons.js — по требованию, сразу после старта
B2.need('b2-icons.js').catch(()=>{});
// живые звуки (b2-polish-snd.js, ~100 КБ) — после первого касания: заменяют синтез SND.coin/close/gavel/win/build/tap
const sxGo=()=>{if(sxL)return;sxL=1;setTimeout(()=>B2.need('b2-polish-snd.js').then(()=>{SX=R.POLSND||null;}).catch(()=>{}),300);};
['pointerdown','keydown'].forEach(e=>document.addEventListener(e,sxGo,{capture:true,passive:true,once:true}));
})();
