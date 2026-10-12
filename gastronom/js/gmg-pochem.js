'use strict';
/* gb-MGA мини-игра №3 «Почём?» (ведёт дед Митяй; id 'pochem'). Договор — шапка js/gmg-core.js (MG0).
   Пять вопросов: товар 80-х — три цены, выбери верную; после ответа — байка Митяя одной строкой. Без таймера.
   Звёзды: 5 — 3★, 4 — 2★, 2–3 — 1★. Затея дня ('day') — одни вопросы у всех (по дню); иначе — по кругу банка (host.mem().k), повтор — после всего банка.
   ПК: 1–3 — ответ, Enter/Пробел — дальше. Данные — js/gmg-pochem-data.js (GMG.data.pochem.q; банк ~120 цен — от TEXT тем же форматом). */
(function(){
if(typeof GMG_REG!=='function')return;
const ID='pochem',N=5;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const fill=(t,c)=>String(t||'').replace(/\{(\w+)\}/g,(m,k)=>c&&c[k]!=null?c[k]:'');
const T=()=>window.GMG&&GMG.data&&GMG.data.pochem||{};
const tierOf=n=>n>=5?3:n>=4?2:n>=2?1:0;
function rng(seed){let s=seed>>>0;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function perm(n,seed){const a=[],r=rng(seed);for(let i=0;i<n;i++)a.push(i);for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
/* вопросы захода: day — по номеру дня; иначе — с места host.mem().k (круг банка без повторов) */
function make(o,mem){const B=(T().q||[]).filter(x=>x&&x[1]&&x[2]&&x[3]&&x[4]),L=B.length;if(!L)return [];
  const P=perm(L,0x90c3);let st;
  if((o.mode==='plan'||o.mode==='day')){const d=String(o.day||0);st=(+d.slice(0,4)*372+(+d.slice(4,6))*31+(+d.slice(6,8)))*N%L;}
  else{st=mem&&mem.k>=0?mem.k%L:Math.floor(o.rnd()*L);if(mem)mem.k=(st+N)%L;}
  const out=[];for(let i=0;out.length<N&&i<L;i++){const x=B[P[(st+i)%L]],ord=perm(3,((o.seed|0)+i*7919)>>>0);
    out.push({g:+x[0]||0,q:x[1],opts:ord.map(k=>x[2+k]),ok:ord.indexOf(0),b:x[5]||'',ic:x[6]||'🏷'});}
  return out;}
function sim(o,k){const Q=make(o,null);let s=0;const p=Math.min(.97,.34+k*.6);for(let i=0;i<Q.length;i++)if(o.rnd()<p)s++;return {sc:s,st:tierOf(s)};}

function run(host,o){const D=T(),Q=make(o,host.mem());if(!Q.length){host.quit();return;}
  let i=-1,sc=0,lock=false,fin=false;const fest=host.fest&&host.fest.id;
  host.el.innerHTML='<div class="gma-wrap gma-pc'+(fest?' gma-f-'+esc(fest):'')+'"><div class="gma-say"></div><div class="gma-dots">'+Q.map(()=>'<i></i>').join('')+'</div>'+
    '<div class="gma-pc-pic"></div><div class="gma-pc-opts"></div><div class="gma-pc-out"></div></div>';
  const $=s=>host.el.querySelector(s),say=$('.gma-say'),pic=$('.gma-pc-pic'),opts=$('.gma-pc-opts'),out=$('.gma-pc-out'),dots=[].slice.call(host.el.querySelectorAll('.gma-dots i'));
  function drawPic(q){if(q.g&&typeof drawGood==='function'){const c=document.createElement('canvas'),w=130,h=112,d=host.dpr;c.width=w*d;c.height=h*d;c.style.width=w+'px';c.style.height=h+'px';
      const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);try{drawGood(g,q.g,w/2,h-8,84);}catch(e){}pic.innerHTML='';pic.appendChild(c);}
    else pic.innerHTML='<span class="gma-pc-ic">'+esc(q.ic)+'</span>';}
  function show(){i++;const q=Q[i];if(!q){end();return;}lock=false;host.top((i+1)+' из '+Q.length);dots.forEach((d,k)=>{if(k===i)d.className='cur';});
    const a=(D.ask||[])[i===Q.length-1?4:i%4]||'Почём {q}?';
    say.innerHTML=host.say('mityai',esc(a).replace('{q}','<b>'+esc(q.q)+'</b>'),'norm');drawPic(q);out.innerHTML='';
    opts.innerHTML=q.opts.map((t,k)=>'<button class="gma-opt" data-k="'+k+'">'+(host.pc?host.kc(k+1)+' ':'')+'<span>'+esc(t)+'</span></button>').join('');
    [].forEach.call(opts.querySelectorAll('.gma-opt'),b=>b.onclick=()=>pick(+b.dataset.k));}
  function pick(k){const q=Q[i];if(lock||!q)return;lock=true;const ok=k===q.ok;if(ok)sc++;
    const bs=[].slice.call(opts.querySelectorAll('.gma-opt'));bs.forEach((b,j)=>{b.disabled=true;if(j===q.ok)b.classList.add('ok');});if(!ok)bs[k].classList.add('no');
    dots[i].className=ok?'ok':'no';try{ok?host.snd.coin():host.snd.sigh();}catch(e){}
    const ol=ok?(D.ok||[])[i%(D.ok||[1]).length]:(D.no||[])[i%(D.no||[1]).length];
    say.innerHTML=host.say('mityai','<b>'+esc(ol||'')+'</b> '+esc(q.b),ok?'happy':'sad');
    out.innerHTML='<button class="btn green gma-pc-nx">'+esc(i>=Q.length-1?D.last||'Итоги':D.next||'Дальше ▸')+(host.pc?' '+host.kc('Enter'):'')+'</button>';
    out.querySelector('button').onclick=next;try{out.querySelector('button').scrollIntoView({block:'nearest'});}catch(e){}}
  function next(){if(!lock||fin)return;try{host.snd.tap();}catch(e){}show();}
  function end(){if(fin)return;fin=true;host.top('');host.finish({sc,st:tierOf(sc),h:Q.length-sc,label:fill(D.label,{n:sc})});}
  host.keys(k=>{if(fin)return false;if((k==='Enter'||k===' ')&&lock){next();return true;}const j={'1':0,'2':1,'3':2}[k];if(j==null||lock)return false;pick(j);return true;});
  host.onQuit(()=>{fin=true;});
  host.bot=k=>{const q=Q[i];if(!q)return;if(lock){next();return;}pick(Math.random()<k?q.ok:(q.ok+1)%3);};
  host.el._mga={Q,i:()=>i,lock:()=>lock,sc:()=>sc};
  host.intro({who:'mityai',text:D.intro,hint:esc(host.pc?D.hintPC||D.hint:D.hint),btn:D.btn||'Начать'}).then(show);}

GMG_REG({id:ID,deps:['js/gmg-pochem-data.js'],run,sim,make,open:()=>!!(T().q?T().q.length>=5:true),
  get lines(){return T().lines||{};}});

(function(){if(document.getElementById('gma-pc-css'))return;const st=document.createElement('style');st.id='gma-pc-css';st.textContent=
'.gma-dots{display:flex;gap:8px;justify-content:center;margin:4px 0}.gma-dots i{width:14px;height:14px;border-radius:50%;background:#e2d6c2;display:block}'+
'.gma-dots i.cur{background:#f0b54a;box-shadow:0 0 0 3px rgba(240,181,74,.35)}.gma-dots i.ok{background:#2b8a3e}.gma-dots i.no{background:#c8401c}'+
'.gma-pc-pic{display:flex;justify-content:center;align-items:center;height:112px;margin:2px auto}.gma-pc-ic{font-size:76px;line-height:1}'+
'.gma-pc-opts{margin:4px auto 0;width:calc(100% - 24px);max-width:560px;display:grid;grid-template-columns:1fr;gap:10px}'+
'.gma-opt{position:relative;border:0;font:inherit;cursor:pointer;min-height:58px;padding:10px 12px;border-radius:16px;background:#fff;box-shadow:0 4px 0 #cdb892;'+
'display:flex;align-items:center;justify-content:center;gap:8px;font-weight:800;font-size:22px;color:#3b2a1a}'+
'.gma-opt:active{transform:translateY(3px);box-shadow:0 1px 0 #cdb892}.gma-opt[disabled]{cursor:default}'+
'.gma-opt.ok{background:#e3f7e8;color:#1e6b31;box-shadow:0 4px 0 #2b8a3e}.gma-opt.no{background:#fde6e4;color:#a12a14;box-shadow:0 4px 0 #c8401c}'+
'.gma-pc-out{margin:10px auto 0;width:calc(100% - 24px);max-width:560px}.gma-pc-out .btn{width:100%;min-height:56px;font-size:19px}'+
'@media (min-width:700px){.gma-pc-opts{grid-template-columns:1fr 1fr 1fr}.gma-opt{min-height:72px;font-size:24px}}'+
'@media (max-height:620px){.gma-pc-pic{height:86px}.gma-pc-pic canvas{transform:scale(.8)}.gma-pc-ic{font-size:60px}.gma-opt{min-height:56px;font-size:20px}}';
document.head.appendChild(st);})();
(function(){if(document.getElementById('gma-css'))return;const st=document.createElement('style');st.id='gma-css';st.textContent=
'.gma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:4px 0 10px;min-height:0;overflow-y:auto;overflow-x:hidden;font-size:17px}'+
'.gma-say{margin:0 auto;width:calc(100% - 20px);max-width:560px;min-height:58px}'+
'.gma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 20px);max-width:560px}.gma-row .btn{flex:1 1 0;min-height:56px;font-size:18px;margin:0}'+
'.gma-row .btn[disabled]{opacity:.45}';document.head.appendChild(st);})();
})();
