'use strict';
/* gb-MGB мини-игра №7 «Кто крайний?» (ведёт тётя Валя; покупатели — родной drawPerson зала). 05-minigames.md §3 №7.
   У прилавка толпа: 4–6 покупателей, каждый говорит одну фразу («Я за мужчиной в шляпе», «Мама с малышом — без очереди!», «Я только спросить!» — встаёт
   сразу за первым, «Я крайний»…). Нажми на покупателя — он встанет на ближайшее свободное место; нажми ещё раз (или на него в очереди) — выйдет.
   Встали все — Валя проверяет: неверно — те, чья фраза не сходится, громко спорят (переставь); две ссоры в очереди — Валя сама ставит первого.
   Очереди строит генератор по зерну (gen): решение одно-единственное — проверяется перебором всех перестановок (≤ 720); проверка 100 % —
   ../MGB-tools/t_krainiy.py. 2 очереди за заход: 4 и 5 человек (с 80-го уровня — 5 и 6). Без таймера.
   Ступени: споров 0 — 3★, 1–2 — 2★, больше — 1★. Счёт = 50 − 8×спор − 10×подсказка Вали (не меньше 10).
   ПК: 1–6 — покупатель (в очередь / из очереди), Backspace — убрать последнего, Enter — дальше. Тексты — js/gmg-krainiy-data.js. Классы — gmb-k*.
   Договор — шапка js/gmg-core.js (MG0). Выключение — GB.flag('mg_krainiy') (смотрит оболочка). */
(function(){
if(typeof GMG_REG!=='function')return;
const KINDS=['babka','school','police','intel','worker','student','veteran'];
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const D=()=>window.GMG_KRAINIY||{};
function mix(a,rnd){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
const PERM={};
function perms(n){if(PERM[n])return PERM[n];const out=[],a=[];const used=[];
  (function rec(){if(a.length===n){out.push(a.slice());return;}for(let i=0;i<n;i++)if(!used[i]){used[i]=1;a.push(i);rec();a.pop();used[i]=0;}})();return PERM[n]=out;}
/* подсказка {t,a,b,k}: a, b — номера людей; P[человек] = место (0 — у прилавка) */
function holds(c,P,n){const pa=P[c.a],pb=c.b!=null?P[c.b]:0;
  switch(c.t){case 'first':case 'vet':return pa===0;case 'last':return pa===n-1;case 'behind':return pa===pb+1;case 'front':return pb===pa+1;
    case 'before':return pa<pb;case 'after':return pa>pb;case 'pos':return pa===c.k;case 'ask':return pa===1;case 'notadj':return Math.abs(pa-pb)>1;}return true;}
function count(cl,n,stop){const L=perms(n);let s=0;const P=new Array(n);
  for(const pm of L){for(let i=0;i<n;i++)P[pm[i]]=i;let ok=true;for(const c of cl)if(!holds(c,P,n)){ok=false;break;}if(ok&&++s>=stop)return s;}return s;}
function cands(a,P,n,vet,askUsed){const pa=P[a],C=[];const add=(w,c)=>{for(let i=0;i<w;i++)C.push(c);};
  if(a===vet)return [{t:'vet',a}];
  for(let b=0;b<n;b++){if(b===a)continue;const pb=P[b];
    if(pa===pb+1)add(3,{t:'behind',a,b});if(pb===pa+1)add(3,{t:'front',a,b});
    if(pb>pa+1)add(2,{t:'before',a,b});if(pb<pa-1)add(2,{t:'after',a,b});if(Math.abs(pa-pb)>1&&b!==vet)add(1,{t:'notadj',a,b});}
  if(pa===0)add(2,{t:'first',a});if(pa===n-1)add(2,{t:'last',a});if(pa===1&&!askUsed)add(2,{t:'ask',a});if(pa>0&&pa<n-1)add(1,{t:'pos',a,k:pa});
  return C;}
/* очередь из n человек: {kinds:[облик человека i], sol:[i у места 0, …], cl:[подсказка человека i]} — решение единственное */
function gen(n,rnd){const kinds=mix(KINDS.filter(k=>k!=='veteran'),rnd).slice(0,n);if(rnd()<.4)kinds[0]='veteran';
  const vet=kinds.indexOf('veteran');
  let sol=mix(kinds.map((_,i)=>i),rnd);if(vet>=0){sol.splice(sol.indexOf(vet),1);sol.unshift(vet);}
  const P=[];sol.forEach((h,i)=>{P[h]=i;});
  for(let t=0;t<300;t++){let askUsed=false;const cl=[];
    for(let a=0;a<n;a++){const C=cands(a,P,n,vet,askUsed);const c=C[Math.floor(rnd()*C.length)];if(c.t==='ask')askUsed=true;cl.push(c);}
    if(count(cl,n,2)!==1)continue;
    let none=0;for(const a of mix(kinds.map((_,i)=>i),rnd)){if(none>=1||a===vet)continue;const keep=cl[a];cl[a]={t:'none',a};if(count(cl,n,2)===1)none++;else cl[a]=keep;}
    return {kinds,sol,cl};}
  const cl=kinds.map((_,a)=>a===vet?{t:'vet',a}:P[a]===0?{t:'first',a}:P[a]===n-1?{t:'last',a}:{t:'pos',a,k:P[a]});return {kinds,sol,cl};}
function txt(c,kinds){const d=D(),pp=d.ppl||{},me=pp[kinds[c.a]]||{},f=me.f?1:0,L=(d.cl||{})[c.t]||['',''],b=c.b!=null?pp[kinds[c.b]]||{}:{};
  let s=L[f]||L[0]||'';s=s.replace('{b}',c.t==='before'||c.t==='after'?b.g||'':c.t==='front'?b.n||'':b.i||'');if(c.t==='pos'){const o=(d.ord||[])[c.k]||['',''];s=s.replace('{k}',o[f]);}
  return s;}
const tierOf=e=>e<=0?3:e<=2?2:1;

GMG_REG({id:'krainiy',who:'valya',finWho:'valya',deps:['js/gmg-krainiy-data.js'],gen,count,holds,
  open:()=>typeof drawPerson==='function',
  lines:{good:()=>(D().lines||{}).good,ok:()=>(D().lines||{}).ok,bad:()=>(D().lines||{}).bad},
  sim(o,k){let e=0;for(let r=0;r<2;r++){while(o.rnd()>.45+.5*k)e++;}const st=tierOf(e);return {sc:Math.max(10,50-8*e),st};},
  run(host,o){const d=D(),sizes=(o.lvl|0)>=80?[5,6]:[4,5];
    let ri=0,Q=null,place=[],fixed=0,busy=false,timer=0,err=0,errR=0,help=0,an=0,okN=0,bdN=0,argue={};
    const fm=(s,m)=>String(s||'').replace(/\{(\w+)\}/g,(x,k)=>m[k]!=null?m[k]:x);
    host.el.innerHTML='<div class="gmb-k"><div class="gmb-kq"><canvas></canvas></div><div class="gmb-ks"></div><div class="gmb-kl"></div>'+
      (host.pc?'<p class="gmg-hint gmb-kh">на компьютере: '+host.kc('1')+'–'+host.kc('6')+' — покупатель, '+host.kc('Backspace')+' — убрать последнего</p>':'<p class="gmg-hint gmb-kh">'+esc(d.hint||'')+'</p>')+'</div>';
    const $=s=>host.el.querySelector(s),qw=$('.gmb-kq'),cv=qw.querySelector('canvas'),say=$('.gmb-ks'),list=$('.gmb-kl');
    const g=cv.getContext('2d');let W=0,H=0;
    function fit(){W=Math.max(1,qw.clientWidth);H=Math.max(1,qw.clientHeight);cv.width=Math.round(W*host.dpr);cv.height=Math.round(H*host.dpr);cv.style.width=W+'px';cv.style.height=H+'px';draw();}
    host.onResize(fit);
    const S1=(t,m)=>{say.innerHTML=host.say('valya',t,m||'norm');};
    const n=()=>Q.kinds.length;
    function geo(){const cw=Math.min(92,W*.2),sw=(W-cw-10)/n(),ph=Math.min(H*.86,sw*1.5,150);return {cw,sw,ph,base:H-16};}
    function draw(){if(!Q||!W)return;g.setTransform(host.dpr,0,0,host.dpr,0,0);g.clearRect(0,0,W,H);const G=geo();
      // пол и стена
      g.fillStyle='#f3e3c4';g.fillRect(0,0,W,H);g.fillStyle='#d9b98a';g.fillRect(0,G.base-4,W,H-G.base+4);
      g.fillStyle='rgba(120,80,40,.12)';for(let x=0;x<W;x+=26)g.fillRect(x,G.base-4,1,H);
      // прилавок и Валя
      const vh=Math.min(H*.8,G.cw*1.5);try{drawPerson(g,'valya',G.cw*.48,G.base-vh*.28,vh,'happy',0,false);}catch(e){}
      g.fillStyle='#a0673a';g.fillRect(0,G.base-vh*.42,G.cw,vh*.42+4);g.fillStyle='#c98a52';g.fillRect(0,G.base-vh*.42,G.cw,6);
      g.fillStyle='#fffaf0';g.font='800 '+Math.round(Math.min(13,G.cw/6))+'px sans-serif';g.textAlign='center';g.fillText('КАССА',G.cw/2,G.base-vh*.42+20);
      for(let i=0;i<n();i++){const cx=G.cw+6+G.sw*(i+.5),h=place[i];
        g.fillStyle=i<fixed?'#2f8f4e':'#7a4a2a';g.beginPath();g.arc(cx,G.base+6,8,0,7);g.fill();g.fillStyle='#fff';g.font='800 11px sans-serif';g.fillText(String(i+1),cx,G.base+10);
        if(h==null){g.strokeStyle='rgba(122,74,42,.35)';g.setLineDash([5,4]);g.lineWidth=2;g.beginPath();g.arc(cx,G.base-G.ph*.62,G.ph*.17,0,7);g.stroke();
          g.beginPath();g.moveTo(cx-G.ph*.3,G.base-4);g.quadraticCurveTo(cx,G.base-G.ph*.55,cx+G.ph*.3,G.base-4);g.stroke();g.setLineDash([]);continue;}
        try{drawPerson(g,Q.kinds[h],cx,G.base-G.ph*.1,G.ph*.9,argue[h]?'sad':'happy',argue[h]?.6:0,false);}catch(e){}
        if(argue[h]){g.fillStyle='#e2463b';g.font='900 '+Math.round(G.ph*.28)+'px sans-serif';g.fillText('!',cx+G.sw*.28,G.base-G.ph*.85);}}}
    function portrait(kind){const c=document.createElement('canvas'),s=48,r=host.dpr;c.width=s*r;c.height=s*r;c.style.width=c.style.height=s+'px';const x=c.getContext('2d');x.setTransform(r,0,0,r,0,0);
      try{drawPerson(x,kind,s/2,s*1.36,s*.98,'happy',0,false);}catch(e){}return c;}
    function cards(){list.innerHTML='';Q.kinds.forEach((k,i)=>{const b=document.createElement('button');b.type='button';b.className='gmb-kc';b.setAttribute('data-i',i);
        const c=Q.cl[i];b.innerHTML='<span class="gmb-kp"></span><span class="gmb-kt"><b>'+esc(((d.ppl||{})[k]||{}).n||k)+'</b><span class="gmb-kx">«'+esc(txt(c,Q.kinds))+'»</span>'+
          (c.t==='ask'?'<small>'+esc(d.askNote||'')+'</small>':'')+'</span><span class="gmb-kn">'+(host.pc?(i+1):'')+'</span>';
        b.querySelector('.gmb-kp').appendChild(portrait(k));b.onclick=()=>tap(i);list.appendChild(b);});mark();}
    function mark(){[].slice.call(list.children).forEach(b=>{const i=+b.getAttribute('data-i'),p=place.indexOf(i);b.classList.toggle('on',p>=0);b.classList.toggle('fx',p>=0&&p<fixed);
      b.classList.toggle('argue',!!argue[i]);b.querySelector('.gmb-kn').textContent=p>=0?String(p+1):(host.pc?String(i+1):'');});draw();}
    function show(){Q=gen(sizes[ri],o.rnd);place=new Array(n()).fill(null);fixed=0;errR=0;argue={};busy=false;
      host.top(fm(d.top,{n:ri+1,m:sizes.length}));cards();fit();
      S1(esc(ri?d.valNext||'':d.start||''),'norm');}
    function tap(i){if(busy||!Q)return;const p=place.indexOf(i);
      if(p>=0){if(p<fixed)return;place[p]=null;argue={};try{host.snd.back&&host.snd.back();}catch(e){}mark();return;}
      const j=place.indexOf(null);if(j<0)return;place[j]=i;argue={};try{host.snd.pick&&host.snd.pick();}catch(e){}mark();
      if(place.indexOf(null)<0)check();}
    function undo(){if(busy)return;for(let j=n()-1;j>=fixed;j--)if(place[j]!=null){tap(place[j]);return;}}
    function check(){const P=[];place.forEach((h,i)=>{P[h]=i;});const bad=Q.cl.filter(c=>!holds(c,P,n())).map(c=>c.a);
      if(!bad.length&&place.every((h,i)=>h===Q.sol[i])){busy=true;try{host.snd.happy?host.snd.happy():host.snd.coin&&host.snd.coin();}catch(e){}
        S1(esc((d.valOk||[''])[okN++%(d.valOk||['']).length]),'happy');list.classList.add('done');timer=setTimeout(next,host.calm?2400:1600);return;}
      // неверно: если все фразы сходятся, но порядок не тот (не бывает — решение единственное), спорит первый не на месте
      if(!bad.length){for(let i=0;i<n();i++)if(place[i]!==Q.sol[i]){bad.push(place[i]);break;}}
      err++;errR++;argue={};bad.forEach(h=>{argue[h]=1;});try{host.snd.grumble&&host.snd.grumble();}catch(e){}
      [].slice.call(list.children).forEach(b=>{const i=+b.getAttribute('data-i');if(argue[i]){const x=b.querySelector('.gmb-kx');x.setAttribute('data-was',x.textContent);x.textContent='«'+(d.argue||['!'])[an++%(d.argue||['!']).length]+'»';
        setTimeout(()=>{if(x.getAttribute('data-was'))x.textContent=x.getAttribute('data-was');},1600);}});
      if(errR>=2&&!fixed){help++;const f=Q.sol[0];place=new Array(n()).fill(null);place[0]=f;fixed=1;argue={};S1(esc(d.valHelp||''),'norm');}
      else S1(esc((d.valBad||[''])[bdN++%(d.valBad||['']).length]),'sad');
      mark();}
    function next(){clearTimeout(timer);timer=0;if(!busy)return;list.classList.remove('done');ri++;if(ri>=sizes.length){fin();return;}show();}
    function fin(){host.finish({sc:Math.max(10,50-8*err-10*help),st:help?Math.min(2,tierOf(err)):tierOf(err),h:err+help,label:fm(d.label,{n:sizes.length,e:err})});}
    qw.addEventListener('click',e=>{if(busy){if(timer)next();return;}const b=cv.getBoundingClientRect(),x=e.clientX-b.left,G=geo();const i=Math.floor((x-G.cw-6)/G.sw);if(i>=0&&i<n()&&place[i]!=null)tap(place[i]);});
    say.onclick=()=>{if(busy&&timer)next();};
    host.keys(k=>{if(busy){if(k==='Enter'||k===' '){if(timer)next();return true;}return false;}
      if(/^[1-6]$/.test(k)){const i=+k-1;if(Q&&i<n()){tap(i);return true;}return false;}
      if(k==='Backspace'){undo();return true;}return false;});
    host.onQuit(()=>{clearTimeout(timer);timer=0;});
    // бот: на свободное место — с вероятностью k верного, иначе случайного; очередь полна и неверна — убрать первого не на месте
    let bE=0;host.bot=k=>{if(!Q)return;if(busy){if(timer)next();return;}
      if(err>bE){for(let x=fixed;x<n();x++)if(place[x]!=null&&place[x]!==Q.sol[x]){tap(place[x]);return;}bE=err;}   // после спора — вывести всех не на своих местах
      const j=place.indexOf(null);if(j<0)return;
      const free=Q.kinds.map((_,i)=>i).filter(i=>place.indexOf(i)<0),want=Q.sol[j];
      tap(free.indexOf(want)>=0&&(Math.random()<k||free.length<2)?want:free[Math.floor(Math.random()*free.length)]);};
    host.intro({who:'valya',text:esc(d.intro||'').replace(/&lt;(\/?b)&gt;/g,'<$1>'),btn:'Расставить!',hint:sizes.length+' очереди · ~40 секунд · без спешки'}).then(show);}});
(function(){if(document.getElementById('gmb-k-css'))return;const st=document.createElement('style');st.id='gmb-k-css';st.textContent=
'.gmb-k{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;padding:0 0 6px}'+
'.gmb-kq{flex:0 0 auto;height:26vh;min-height:104px;max-height:190px;cursor:pointer;box-shadow:0 2px 0 rgba(0,0,0,.08)}.gmb-kq canvas{display:block}'+
'.gmb-ks{flex:0 0 auto;margin:8px auto 0;width:calc(100% - 20px);max-width:620px;min-height:58px;cursor:pointer}.gmb-ks .gmg-say{margin:0}.gmb-ks .gmg-av{width:46px;height:46px}.gmb-ks .gmg-sb{font-size:16px;padding:7px 11px}'+
'.gmb-kl{flex:1 1 auto;min-height:0;overflow-y:auto;margin:6px auto 0;width:calc(100% - 20px);max-width:620px;display:grid;grid-template-columns:1fr;gap:6px;align-content:start}'+
'@media (min-width:700px){.gmb-kl{grid-template-columns:1fr 1fr}}'+
'.gmb-kc{display:flex;align-items:center;gap:8px;min-height:58px;border:0;border-radius:14px;background:#fff;box-shadow:0 3px 0 var(--edge,#d9c8a8);padding:4px 8px 4px 4px;text-align:left;cursor:pointer;color:var(--ink,#3b2a1a);font:inherit}'+
'.gmb-kp{flex:0 0 48px;height:48px;border-radius:50%;overflow:hidden;background:#f6ece4}.gmb-kp canvas{display:block}'+
'.gmb-kt{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.2}.gmb-kt b{font-size:13px;color:#8a6a4a;font-weight:700}.gmb-kx{font-size:17px;font-weight:800}.gmb-kt small{font-size:13px;color:#2f6fb5}'+
'.gmb-kn{flex:0 0 30px;height:30px;border-radius:50%;background:#efe4d0;color:#7a4a2a;font:800 16px/30px sans-serif;text-align:center}'+
'.gmb-kc.on{background:#fff6dd}.gmb-kc.on .gmb-kn{background:#7a4a2a;color:#fff}.gmb-kc.fx .gmb-kn{background:#2f8f4e}'+
'.gmb-kc.argue{background:#ffe3df;animation:gmbArg .5s 2}.gmb-kc.argue .gmb-kx{color:#c62828}@keyframes gmbArg{0%,100%{transform:none}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}'+
'.gmb-kl.done .gmb-kc{background:#e7f6ea}.gmb-kh{text-align:center;margin:6px 10px 0;flex:0 0 auto}'+
'body.calm .gmb-kc.argue{animation:none}'+
'@media (max-height:620px){.gmb-kc{min-height:56px;padding:2px 8px 2px 4px}.gmb-kp{flex-basis:44px;height:44px}.gmb-kx{font-size:16px}.gmb-kt b{font-size:12px}.gmb-kl{gap:4px;margin-top:4px}.gmb-kq{height:17vh;min-height:88px}.gmb-ks{min-height:46px;margin-top:4px}.gmb-ks .gmg-sb{font-size:15px;padding:5px 9px}.gmb-ks .gmg-av{width:40px;height:40px}.gmb-kh{display:none}}';
document.head.appendChild(st);})();
})();
