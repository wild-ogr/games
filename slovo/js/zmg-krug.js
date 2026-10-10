'use strict';
/* zb-MG0 круг букв Зины для мини-игр (js/zmg-krug.js; грузится оболочкой, когда игре нужен deps:['krug']).
   Как в основной игре: свайп по буквам (назад на предыдущую — убрать), или нажатия (буква — добавить, последняя — убрать, ✔ — проверить, ✕ — стереть);
   на ПК — клавиатура: буквы, Backspace, Enter, Пробел — перемешать (только пока круг на экране и игра не на паузе).
   Создание: host.krug(el, {letters, onWord, size?, shuffle?:true, min?:2}) → k   (то же — ZMGK.make(el, opts, host))
     letters — строка или массив букв (повторы можно); onWord(w) → 'ok' | 'dup' | 'bad' (true = 'ok', false = 'bad'); можно вернуть Promise.
     size — диаметр круга (px), по умолчанию — от размеров el (≤ 300). el — пустой контейнер игры (круг занимает его целиком по ширине).
   k.set(letters) — новые буквы; k.shuffle(); k.clear(); k.word() — набранное; k.flash(kind) — мигнуть 'ok'|'bad'|'dup'; k.lock(true/false) — не принимать ввод;
   k.type(w) — набрать слово программно (бот стенда; вернёт false, если букв нет); k.destroy() — оболочка зовёт сама при выходе.
   Классы — zmg-krug*. */
(function(){
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const norm=c=>String(c).toLowerCase().replace('ё','е');
function make(el,o,host){o=o||{};let L=[],sel=[],locked=false,drag=null,moved=false,dead=false;
  const root=document.createElement('div');root.className='zmg-krug';
  root.innerHTML='<div class="zmg-kw"><span class="zmg-kwt"></span></div><div class="zmg-kc0"><svg class="zmg-kln"></svg><div class="zmg-kls"></div>'+
    '<button type="button" class="zmg-ksh" aria-label="Перемешать">🔀</button></div><div class="zmg-kbt"><button type="button" class="zmg-kx" aria-label="Стереть">✕</button><button type="button" class="zmg-kok" aria-label="Проверить">✔</button></div>'+
    (host&&host.pc?'<p class="zmg-hint zmg-khint">на компьютере: печатай буквы, '+(host.kc?host.kc('Enter'):'Enter')+' — проверить, '+(host.kc?host.kc('⌫'):'⌫')+' — стереть, '+(host.kc?host.kc('Пробел'):'Пробел')+' — перемешать</p>':'');
  el.appendChild(root);
  const c0=root.querySelector('.zmg-kc0'),ls=root.querySelector('.zmg-kls'),svg=root.querySelector('.zmg-kln'),kwt=root.querySelector('.zmg-kwt'),kw=root.querySelector('.zmg-kw'),kbt=root.querySelector('.zmg-kbt');
  let D=0,btns=[];
  function layout(){const W=el.clientWidth||300,Hh=el.clientHeight||400;const hint=root.querySelector('.zmg-khint');
    D=o.size||Math.max(170,Math.min(300,W-40,Hh-(kw.offsetHeight||44)-(kbt.offsetHeight||0)-(hint?hint.offsetHeight+6:0)-24));
    c0.style.width=c0.style.height=D+'px';svg.setAttribute('viewBox','0 0 '+D+' '+D);
    const n=L.length,r=D/2,lr=Math.max(22,Math.min(34,D*(n>7?.12:.14))),R=r-lr-6;
    btns.forEach((b,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,x=r+R*Math.cos(a),y=r+R*Math.sin(a);b.style.width=b.style.height=lr*2+'px';b.style.left=(x-lr)+'px';b.style.top=(y-lr)+'px';b.style.fontSize=Math.round(lr*1.05)+'px';b._x=x;b._y=y;});
    lines();}
  function build(){ls.innerHTML='';btns=L.map((ch,i)=>{const b=document.createElement('button');b.type='button';b.className='zmg-kl';b.textContent=ch.toUpperCase();b.dataset.i=i;ls.appendChild(b);return b;});sel=[];show();layout();}
  function show(){const w=sel.map(i=>L[i]).join('');kwt.textContent=w.toUpperCase();kw.classList.toggle('on',!!w);btns.forEach((b,i)=>b.classList.toggle('on',sel.indexOf(i)>=0));
    kbt.classList.toggle('on',!!w&&!drag);lines();}
  function lines(px,py){let h='';for(let j=1;j<sel.length;j++){const a=btns[sel[j-1]],b=btns[sel[j]];if(a&&b)h+='<line x1="'+a._x+'" y1="'+a._y+'" x2="'+b._x+'" y2="'+b._y+'"/>';}
    if(drag&&sel.length&&px!=null){const a=btns[sel[sel.length-1]];h+='<line x1="'+a._x+'" y1="'+a._y+'" x2="'+px+'" y2="'+py+'" class="tl"/>';}svg.innerHTML=h;}
  function add(i){if(i<0||i>=L.length)return;const k=sel.indexOf(i);if(k>=0){if(k===sel.length-2&&drag){sel.pop();snd('tap');show();}return;}sel.push(i);snd('letter',sel.length-1);show();}
  function snd(k,a){try{if(host&&host.snd&&host.snd[k])host.snd[k](a);}catch(e){}}
  function flash(kind){root.classList.remove('ok','bad','dup');void root.offsetWidth;root.classList.add(kind);setTimeout(()=>root.classList.remove(kind),450);}
  function submit(){const w=sel.map(i=>L[i]).join('');sel=[];drag=null;show();if(!w||w.length<(o.min||2)){return;}
    let r;try{r=o.onWord?o.onWord(w):'bad';}catch(e){console.error(e);r='bad';}
    Promise.resolve(r).then(v=>{const k=v===true?'ok':v===false||v==null?'bad':String(v);flash(k);if(k==='bad')snd('bad');else if(k==='dup')snd('old');});}
  function clear(){sel=[];drag=null;show();}
  // касания: точка → ближайшая буква в радиусе
  function hit(cx,cy){let best=-1,bd=1e9;btns.forEach((b,i)=>{const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,d=Math.hypot(cx-x,cy-y);if(d<r.width*.55&&d<bd){bd=d;best=i;}});return best;}
  const paused=()=>locked||dead||(host&&host.paused);
  function local(ev){const r=c0.getBoundingClientRect(),zk=r.width/(D||1)||1;return [(ev.clientX-r.left)/zk,(ev.clientY-r.top)/zk];}
  const dn=ev=>{if(paused())return;const i=hit(ev.clientX,ev.clientY);if(i<0)return;ev.preventDefault();try{c0.setPointerCapture(ev.pointerId);}catch(x){}
    moved=false;const was=sel.slice();drag={id:ev.pointerId,i0:i,was};
    if(sel.length&&sel[sel.length-1]===i){/* нажатие на последнюю — решим на отпускании */}else if(sel.indexOf(i)<0)add(i);};
  const mv=ev=>{if(!drag||drag.id!==ev.pointerId||paused())return;const i=hit(ev.clientX,ev.clientY);if(i>=0&&i!==sel[sel.length-1]){moved=true;if(sel.indexOf(i)<0||sel.indexOf(i)===sel.length-2)add(i);}
    const p=local(ev);lines(p[0],p[1]);};
  const up=ev=>{if(!drag||drag.id!==ev.pointerId)return;const d=drag;drag=null;
    if(moved&&sel.length>1){submit();return;}
    // нажатие без протягивания: ввод нажатиями
    if(!moved&&d.was.length&&d.was[d.was.length-1]===d.i0){sel.pop();snd('tap');}
    show();};
  c0.addEventListener('pointerdown',dn);c0.addEventListener('pointermove',mv);c0.addEventListener('pointerup',up);c0.addEventListener('pointercancel',up);c0.style.touchAction='none';
  root.querySelector('.zmg-ksh').onclick=ev=>{ev.stopPropagation();if(paused())return;shuffle();};
  root.querySelector('.zmg-kok').onclick=()=>{if(!paused())submit();};
  root.querySelector('.zmg-kx').onclick=()=>{if(!paused()){clear();snd('tap');}};
  kw.onclick=()=>{if(!paused()&&sel.length)submit();};
  function shuffle(){const idx=L.map((_,i)=>i);for(let i=idx.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=idx[i];idx[i]=idx[j];idx[j]=t;}
    L=idx.map(i=>L[i]);build();snd('tap');}
  function set(x){L=(Array.isArray(x)?x:String(x||'').split('')).map(c=>String(c).toLowerCase());if(o.shuffle!==false){const a=L;for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}}build();}
  // клавиатура ПК
  if(host&&host.keys)host.keys((k,e)=>{if(dead||locked||!root.isConnected)return false;
    if(k==='Enter'){if(sel.length){submit();return true;}return false;}
    if(k==='Backspace'){if(sel.length){sel.pop();show();snd('tap');}return true;}
    if(k===' '){shuffle();return true;}
    if(k&&k.length===1&&/[а-яё]/i.test(k)){const c=norm(k);for(let i=0;i<L.length;i++)if(sel.indexOf(i)<0&&norm(L[i])===c){add(i);return true;}flash('bad');return true;}
    return false;});
  if(host&&host.onResize)host.onResize(()=>{if(!dead)layout();});
  const ro=window.ResizeObserver?new ResizeObserver(()=>{if(!dead)layout();}):null;if(ro)ro.observe(el);
  set(o.letters||'');
  return {el:root,set,shuffle,clear,flash,word:()=>sel.map(i=>L[i]).join(''),letters:()=>L.slice(),lock(v){locked=!!v;if(locked)clear();},
    type(w){clear();const used=[];for(const ch of String(w)){let f=-1;for(let i=0;i<L.length;i++)if(used.indexOf(i)<0&&norm(L[i])===norm(ch)){f=i;break;}if(f<0)return false;used.push(f);}
      sel=used;show();submit();return true;},
    destroy(){dead=true;if(ro)ro.disconnect();c0.removeEventListener('pointerdown',dn);c0.removeEventListener('pointermove',mv);c0.removeEventListener('pointerup',up);c0.removeEventListener('pointercancel',up);root.remove();}};}
window.ZMGK={make};
(function(){if(document.getElementById('zmgk-css'))return;const st=document.createElement('style');st.id='zmgk-css';st.textContent=
'.zmg-krug{display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0;width:100%}'+
'.zmg-kw{min-height:44px;min-width:120px;max-width:92%;padding:4px 16px;border-radius:14px;background:transparent;display:flex;align-items:center;justify-content:center;font:900 26px/1 var(--font,Arial);letter-spacing:3px;color:var(--ink,#27324a);cursor:pointer;box-sizing:border-box}'+
'.zmg-kw.on{background:#fff;box-shadow:0 3px 0 var(--edge,#d5d9e3)}'+
'.zmg-kc0{position:relative;border-radius:50%;background:radial-gradient(circle,#fff 0,#fff 55%,var(--blue3,#dbe7fb) 100%);box-shadow:0 0 0 4px #fff,0 6px 18px rgba(29,79,163,.18);touch-action:none}'+
'.zmg-kln{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}.zmg-kln line{stroke:var(--blue2,#2f6fd6);stroke-width:7;stroke-linecap:round;opacity:.55}.zmg-kln line.tl{opacity:.3}'+
'.zmg-kls{position:absolute;left:0;top:0;width:100%;height:100%}'+
'.zmg-kl{position:absolute;border:0;border-radius:50%;background:#fff;color:var(--blue,#1d4fa3);font-weight:900;font-family:var(--font,Arial);box-shadow:0 3px 0 var(--edge,#d5d9e3),0 0 0 2px var(--blue3,#dbe7fb) inset;cursor:pointer;padding:0;transition:transform .1s,background .1s}'+
'.zmg-kl.on{background:var(--blue2,#2f6fd6);color:#fff;transform:scale(1.08)}'+
'.zmg-ksh{position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px 0 0 -24px;border:0;border-radius:50%;background:var(--soft,#f3f6fc);font-size:22px;cursor:pointer}'+
'.zmg-kbt{display:flex;gap:14px;visibility:hidden}.zmg-kbt.on{visibility:visible}'+
'.zmg-kbt button{width:56px;height:48px;border:0;border-radius:14px;font-size:22px;font-weight:900;cursor:pointer;background:#fff;box-shadow:0 3px 0 var(--edge,#d5d9e3)}.zmg-kbt .zmg-kok{background:var(--green,#34a853);color:#fff;box-shadow:0 3px 0 var(--green2,#237a3b)}'+
'.zmg-krug.ok .zmg-kc0{box-shadow:0 0 0 5px var(--green,#34a853),0 6px 18px rgba(0,0,0,.1)}.zmg-krug.bad .zmg-kc0{animation:zmgShake .35s}.zmg-krug.dup .zmg-kc0{box-shadow:0 0 0 5px var(--gold,#f5b72d)}'+
'@keyframes zmgShake{0%,100%{transform:none}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}'+
'.zmg-khint{margin:0;text-align:center}'+
'@media (prefers-reduced-motion:reduce){.zmg-krug.bad .zmg-kc0{animation:none}}';document.head.appendChild(st);})();
})();
