'use strict';
/* MGB (буст 09.10): общий набор для затей №8–11 («Что лишнее?», «По трём подсказкам», «Кроссвордик дня», «Пословицы» — с 09.10 вместо «Городов»).
   Наружу — только window.VMB (приставка помощника MGB: vmb). Ядро мини-игр (VMG_REG, окно итогов, награды, ✕) — js/vmg-core.js (MG0), здесь его нет.
   VMB.shell(host,{g,who,name,acc}) — рамка затеи: шапка (имя + точки хода; справа место под ✕ ядра), ведущий с репликой, поле игры, подвал;
   VMB.keys(host,fn) — клавиши, пока затея на экране (не в паузе/окне ядра; fn(key,e) вернёт true — клавиша съедена);
   VMB.pc() — есть мышь; VMB.kc(t) — значок клавиши (виден только на ПК); VMB.snd(host,k) — звук (host.snd → SND игры);
   VMB.dayN(day) — номер дня (принимает '2026-10-09' и 20261009); VMB.perm(n,seed) — перестановка по зерну; VMB.R(seed) — генератор;
   VMB.box(id) — своё место затеи в сохранении S.vmg.<id> (если ядро завело S.vmg) — только для круга наборов и недорешённого кроссворда;
   VMB.norm(s) — буквы для сравнения (заглавные, Ё=Е, без пробелов/дефисов/кавычек); VMB.pop(el) — вспышка-праздник у элемента. */
(function(){if(typeof VMG_REG!=='function')return;   // без оболочки MG0 затея не регистрируется
const D=document;
const $q=(r,s)=>r.querySelector(s),$a=(r,s)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
function pc(){if(/[?&]vmbpc=1/.test(location.search))return true;try{return matchMedia('(hover:hover) and (pointer:fine)').matches;}catch(e){return false;}}
function calm(){try{return D.body.classList.contains('calm')||matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(e){return false;}}
function R(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function perm(n,seed){const r=R(seed),a=[];for(let i=0;i<n;i++)a.push(i);for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));const x=a[i];a[i]=a[j];a[j]=x;}return a;}
function mix(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const x=a[i];a[i]=a[j];a[j]=x;}return a;}
function dayN(day){let s=String(day==null?'':day).replace(/\D/g,'');if(s.length<8){const d=new Date();s=''+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');}
  return Math.floor(Date.UTC(+s.slice(0,4),+s.slice(4,6)-1,+s.slice(6,8))/864e5);}
function norm(s){return String(s||'').toUpperCase().replace(/Ё/g,'Е').replace(/[^А-ЯA-Z0-9]/g,'');}
function snd(host,k){try{const s=host&&host.snd;if(s&&typeof s[k]==='function'){s[k]();return;}if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(e){}}
function buzz(ms){try{if(typeof window.buzz==='function')window.buzz(ms);}catch(e){}}
let CUR=null;   // текущая затея (рамку ставит shell)
/* свой склад затеи: в оболочке MG0 — host.mem() (S.vmg.m.<id>, ≤ 1 КБ, числа/строки); без оболочки — нет */
function box(id){try{if(CUR&&typeof CUR.mem==='function')return CUR.mem();}catch(e){}return null;}
function save(){try{if(typeof window.save==='function')window.save();else if(typeof save0==='function')save0();}catch(e){}}
function who(id,m){try{if(typeof portrait==='function')return portrait(id,m||'norm');}catch(e){}return '';}
function kc(t){return '<kbd class="vmb-kc">'+esc(t)+'</kbd>';}

function keys(host,fn){if(typeof host.keys==='function'){host.keys((k,e)=>fn(k,e));return ()=>{};}   // оболочка MG0: один перехватчик клавиш
  const h=e=>{if(host.paused||host.__vmbOff)return;if(e.ctrlKey||e.metaKey||e.altKey)return;
    const root=host.root||host.el&&host.el.parentNode;if(root&&root.querySelector&&root.querySelector('.mgVeil,.vmgVeil'))return;
    if(e.repeat&&!/^Arrow|Backspace/.test(e.key))return;try{if(fn(e.key,e))e.preventDefault();}catch(x){console.error(x);}};
  window.addEventListener('keydown',h);let off=()=>{window.removeEventListener('keydown',h);off=()=>{};};
  try{host.onQuit(()=>off());}catch(e){}return ()=>off();}

/* ---------- стиль «Дворовое шоу» (свои токены с запасом для «Классики») ---------- */
const CSS=
'.vmb{--k:1;--ink:var(--q-ink,#1b2433);--ink2:var(--q-ink2,#3c4a5c);--o:#233247;--card:var(--q-bg,#fffaf0);--pan:#fffdf6;--line:#e6dcc4;--acc:#ff7a1a;--ok:#2fa84f;--okd:#1d7a36;--no:#e5484d;--nod:#a82a2f;--gold:#ffcf40;--tip:#3f8fe0;'+
 '--sh:0 4px 0 var(--o);--bd:2.5px solid var(--o);position:absolute;inset:0;display:flex;flex-direction:column;overflow:hidden;color:var(--ink);font-family:KF,Rubik,-apple-system,"Segoe UI",Roboto,sans-serif;'+
 'background:radial-gradient(120% 60% at 50% -8%,rgba(255,247,214,.95) 0,rgba(255,247,214,0) 60%),linear-gradient(180deg,#bfe6f5 0,#a9dcf1 55%,#9ccfe6 100%);-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
'.vmb *{box-sizing:border-box}'+
'#vmgHost .vmg-el>.vmb.in{max-width:none}.vmb.in{position:relative;inset:auto;flex:1 0 auto;overflow:visible;background:none}.vmb.in:before{display:none}.vmb.in .vmb-body{overflow:visible;padding:0;flex:1 0 auto}'+
'.vmb.in.tight .vmb-stage{display:none}.vmb.in .vmb-pipsrow{position:static;min-height:0;padding:0;justify-content:center}.vmb.in .vmb-pips{margin:0}'+
'.vmb-bg{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}.vmb-bg svg{display:block;width:100%;height:100%}.vmb-bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.28) 40%,rgba(255,255,255,.18))}'+
'.vmb-top,.vmb-body{z-index:1}'+
'body.big .vmb{--k:1.14}'+
'.vmb:before{content:"";position:absolute;left:-10%;right:-10%;bottom:-40px;height:120px;background:radial-gradient(60% 100% at 50% 100%,rgba(35,50,71,.13),rgba(35,50,71,0));pointer-events:none}'+
'.vmb-top{position:relative;flex:none;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) 72px 4px 12px;min-height:66px}'+
'.vmb-chip{display:flex;align-items:center;gap:8px;min-width:0;background:var(--pan);border:var(--bd);box-shadow:0 3px 0 var(--o);border-radius:14px;padding:5px 12px 5px 6px;font-weight:800;font-size:calc(17px*var(--k));line-height:1.1;white-space:nowrap}'+
'.vmb-chip i{flex:none;width:32px;height:32px;border-radius:10px;background:var(--acc);border:2px solid var(--o);display:flex;align-items:center;justify-content:center;font-style:normal;color:#fff}.vmb-chip i svg{width:22px;height:22px;display:block}'+
'.vmb-chip span{overflow:hidden;text-overflow:ellipsis}'+
'.vmb-chip .s{display:none}@media (max-width:370px){.vmb-chip .s{display:inline}.vmb-chip .s~.l,.vmb-chip .l:not(:last-child){display:none}}'+
'.vmb-pips{display:flex;gap:5px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}'+
'.vmb-pips b{width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.7);border:2px solid var(--o);transition:transform .25s}'+
'.vmb-pips b.cur{background:var(--gold);transform:scale(1.25)}.vmb-pips b.ok{background:var(--ok)}.vmb-pips b.no{background:var(--no)}'+
'.vmb-body{position:relative;flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:2px 12px calc(env(safe-area-inset-bottom,0px) + 12px)}'+
'.vmb-col{max-width:640px;margin:0 auto;display:flex;flex-direction:column;justify-content:center;gap:10px;min-height:100%;padding-bottom:4px}'+
'.vmb-stage{display:flex;align-items:flex-end;gap:8px}'+
'.vmb-who{flex:none;width:calc(92px*var(--k));height:calc(92px*var(--k));display:flex;align-items:flex-end;justify-content:center;filter:drop-shadow(0 3px 0 rgba(35,50,71,.25))}'+
'html:not(.lk) .vmb-who{border-radius:50%;background:radial-gradient(circle at 50% 35%,#fff 0,#ffe9a8 70%);border:var(--bd);overflow:hidden}'+
'.vmb-who svg{width:100%;height:100%;display:block}'+
'.vmb-bub{position:relative;flex:1;min-width:0;background:var(--card);border:var(--bd);box-shadow:0 3px 0 var(--o);border-radius:18px;padding:10px 14px;font-size:calc(18px*var(--k));line-height:1.3;font-weight:600;margin-bottom:6px;animation:vmbIn .3s ease-out both}'+
'.vmb-bub:before{content:"";position:absolute;left:-13px;bottom:14px;border:9px solid transparent;border-right:13px solid var(--o);border-left:0}'+
'.vmb-bub:after{content:"";position:absolute;left:-9px;bottom:16px;border:7px solid transparent;border-right:10px solid var(--card);border-left:0}'+
'.vmb-bub small{display:block;font-size:calc(14px*var(--k));font-weight:700;color:var(--ink2);margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em}'+
'.vmb-bub b{color:#c2410c}.vmb-bub .nm{color:var(--acc);font-weight:800;margin-right:4px}'+
'.vmb-btn{appearance:none;-webkit-appearance:none;font:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;min-height:56px;padding:8px 16px;border-radius:16px;border:var(--bd);background:var(--pan);color:var(--ink);box-shadow:var(--sh);font-weight:800;font-size:calc(19px*var(--k));line-height:1.15;text-align:center;touch-action:manipulation;transition:transform .08s,box-shadow .08s}'+
'.vmb-btn:active{transform:translateY(3px);box-shadow:0 1px 0 var(--o)}'+
'.vmb-btn.go{background:var(--acc);color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.18)}.vmb-btn.blue{background:var(--tip);color:#fff}.vmb-btn.grn{background:var(--ok);color:#fff}'+
'.vmb-btn[disabled]{opacity:.45;pointer-events:none}'+
'.vmb-btn small{font-weight:600;font-size:.8em;opacity:.9}'+
'.vmb-kc{display:none;flex:none;min-width:26px;height:26px;padding:0 6px;border-radius:7px;background:#fff;border:2px solid var(--o);box-shadow:0 2px 0 var(--o);color:var(--o);font:800 14px/22px Manrope,KF,sans-serif;text-align:center;vertical-align:middle}'+
'.vmb.pc .vmb-kc{display:inline-block}.vmb-btn.go .vmb-kc,.vmb-btn.blue .vmb-kc,.vmb-btn.grn .vmb-kc{background:rgba(255,255,255,.9)}'+
'.vmb-pchint{display:none;text-align:center;font-size:15px;color:var(--ink2);font-weight:600}.vmb.pc .vmb-pchint{display:block}'+
'.vmb-card{background:var(--card);border:var(--bd);box-shadow:var(--sh);border-radius:18px;padding:12px 14px}'+
'.vmb-note{border-radius:16px;padding:10px 14px;font-size:calc(17px*var(--k));line-height:1.32;font-weight:600;background:#fff;border:var(--bd);box-shadow:0 3px 0 var(--o);animation:vmbIn .3s ease-out both}'+
'.vmb-note.ok{background:#e3f7e8}.vmb-note.no{background:#fde6e4}.vmb-note b.h{display:block;font-size:1.08em;font-weight:800;margin-bottom:2px}.vmb-note.ok b.h{color:var(--okd)}.vmb-note.no b.h{color:var(--nod)}'+
'.vmb-spark{position:absolute;pointer-events:none;width:10px;height:10px;border-radius:2px;z-index:5;animation:vmbSpark .8s ease-out forwards}'+
'.vmb-shake{animation:vmbShake .38s}'+
'@keyframes vmbIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'+
'@keyframes vmbPop{0%{transform:scale(.7);opacity:0}70%{transform:scale(1.06);opacity:1}100%{transform:scale(1)}}'+
'@keyframes vmbShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}'+
'@keyframes vmbSpark{from{opacity:1;transform:translate(0,0) rotate(0)}to{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(260deg)}}'+
'body.calm .vmb *{animation:none!important;transition:none!important}'+
'@media (max-width:370px){.vmb-top{padding-left:8px;gap:6px;padding-right:66px}.vmb-chip{font-size:15px;padding-right:8px}.vmb-chip i{width:26px;height:26px}.vmb-chip i svg{width:18px;height:18px}.vmb-pips{gap:3px}.vmb-pips b{width:10px;height:10px}.vmb-who{width:calc(66px*var(--k));height:calc(66px*var(--k))}.vmb-bub{font-size:calc(16.5px*var(--k));padding:8px 11px}.vmb-body{padding-left:9px;padding-right:9px}}'+
'@media (max-height:600px){.vmb-who{width:58px;height:58px}.vmb-top{min-height:60px}}'+
'@media (min-width:760px) and (min-height:520px){.vmb{--k:1.1}.vmb-who{width:calc(112px*var(--k));height:calc(112px*var(--k))}.vmb-bub{font-size:calc(20px*var(--k))}.vmb-col{gap:14px;max-width:720px}.vmb-top{min-height:72px}}'+
'@media (min-width:1100px) and (min-height:720px){.vmb{--k:1.2}body.big .vmb{--k:1.32}}';
/* фон — та же сцена двора/студии/доски, что за игрой (#scene, js/look.js), в «Классике» — небо */
function bg(){try{const sc=D.getElementById('scene');if(sc&&sc.innerHTML&&window.LK&&LK.on())return sc.innerHTML;}catch(e){}return '';}
const SV=p=>'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
const IC={ls:SV('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M15 15l5 5M20 15l-5 5"/>'),
 tri:SV('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
 kr:SV('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><rect x="9" y="9" width="6" height="6" fill="#fff" stroke="none"/>'),
 po:SV('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M9 8h6"/>'),
 gor:SV('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>')};
function css(){if(D.getElementById('vmbCss'))return;const s=D.createElement('style');s.id='vmbCss';s.textContent=CSS;D.head.appendChild(s);}

/* рамка затеи */
function shell(host,o){css();CUR=host;if(window.__vmgStand&&!host.__vmbT){host.__vmbT=1;window.__vmgRes=null;const d0=host.done;host.done=r=>{window.__vmgRes=r;return d0.call(host,r);};}   // стенд ?vmg=: итог — в window.__vmgRes для проверок
  const core=typeof host.top==='function';const el=D.createElement('div');el.className='vmb '+(o.cls||'')+((host.pc!=null?host.pc||pc():pc())?' pc':'')+(core?' in':'');
  el.innerHTML='<div class="vmb-bg">'+bg()+'</div><div class="vmb-top"><div class="vmb-chip"><i>'+(IC[o.mark]||'')+'</i><span class="l">'+esc(o.name)+'</span>'+(o.short?'<span class="s">'+esc(o.short)+'</span>':'')+'</div><div class="vmb-pips"></div></div>'+
    '<div class="vmb-body"><div class="vmb-col"><div class="vmb-stage"><div class="vmb-who"></div><div class="vmb-bub"></div></div><div class="vmb-main"></div></div></div>';
  host.el.appendChild(el);
  // в оболочке MG0 шапку (название, ✕) рисует она: своя шапка не нужна, точки хода — в начале поля, прокручивает host.el
  if(core){const t=$q(el,'.vmb-top');const pp=$q(el,'.vmb-pips');t.classList.add('vmb-pipsrow');t.innerHTML='';t.appendChild(pp);$q(el,'.vmb-col').insertBefore(t,$q(el,'.vmb-stage'));$q(el,'.vmb-bg').remove();}
  const W={el,core,host,body:core?host.el:$q(el,'.vmb-body'),col:$q(el,'.vmb-col'),main:$q(el,'.vmb-main'),stage:$q(el,'.vmb-stage'),pipsEl:$q(el,'.vmb-pips'),wid:o.who,
    say(html,mood,head){const w=$q(el,'.vmb-who');const m=mood||'norm';if(w.dataset.m!==m){w.innerHTML=who(o.who,m);w.dataset.m=m;}
      const b=$q(el,'.vmb-bub');b.innerHTML=(head?'<small>'+esc(head)+'</small>':'')+(o.nm?'<span class="nm">'+esc(o.nm)+':</span>':'')+html;b.style.animation='none';void b.offsetWidth;b.style.animation='';},
    pips(n){this.pipsEl.innerHTML='<b></b>'.repeat(n);},
    prog(t){if(core)try{host.top(t);}catch(e){}},
    // после ответа: если поле не влезло без прокрутки — прячем реплику ведущего (её смысл уже в карточке ответа); fit(0) — вернуть
    fit(on){if(!core)return;el.classList.remove('tight');if(on!==0&&host.el.scrollHeight>host.el.clientHeight+2)el.classList.add('tight');},
    pip(i,st){const p=this.pipsEl.children;for(let k=0;k<p.length;k++)if(k===i)p[k].className=st||'cur';else if(st==='cur'&&p[k].className==='cur')p[k].className='';},
    top(){try{W.body.scrollTop=0;}catch(e){}}};
  return W;}

/* праздник: искры от элемента (без холста, лёгкие) */
function pop(target,n){if(calm()||!target)return;const host=target.closest('.vmb');if(!host)return;const r=target.getBoundingClientRect(),h=host.getBoundingClientRect();
  const C=['#ffcf40','#ff7a1a','#2fa84f','#3f8fe0','#e5484d','#8d5fae'];n=n||14;
  for(let i=0;i<n;i++){const s=D.createElement('i');s.className='vmb-spark';const a=Math.random()*Math.PI*2,d=40+Math.random()*70;
    s.style.left=(r.left-h.left+r.width/2-5)+'px';s.style.top=(r.top-h.top+r.height/2-5)+'px';s.style.background=C[i%C.length];
    s.style.setProperty('--dx',Math.round(Math.cos(a)*d)+'px');s.style.setProperty('--dy',Math.round(Math.sin(a)*d-20)+'px');host.appendChild(s);setTimeout(()=>s.remove(),850);}}
function shake(el){if(!el)return;el.classList.remove('vmb-shake');void el.offsetWidth;el.classList.add('vmb-shake');}
/* ступень по очкам: пороги [1★,2★,3★] */
function tier(sc,th){return sc>=th[2]?3:sc>=th[1]?2:sc>=th[0]?1:0;}

window.VMB={css,shell,keys,pc,calm,kc,snd,buzz,R,perm,mix,dayN,norm,box,save,who,esc,pop,shake,tier,$q,$a};
})();
