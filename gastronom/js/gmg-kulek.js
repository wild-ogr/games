'use strict';
/* gb-MGB мини-игра №11 «Что в кульке?» (ведёт дед Семён, разгадывает с 1974-го). 05-minigames.md §3 №11, основа — zmg-zagadki Зины.
   5 загадок; у каждой 3 подсказки — от трудной к лёгкой — и 4 варианта-товара (рисунок drawGood + название), видны сразу.
   Угадал с 1-й подсказки — 3 очка, со 2-й — 2, с 3-й — 1; неверно — вариант зачёркивается и открывается следующая подсказка; неверно после 3-й — 0,
   Семён называет ответ. Подсказку можно открыть и самому («Ещё подсказка»). Без таймера. Ступени по очкам из 15: 12+ — 3★, 8+ — 2★, иначе — 1★.
   Загадки — js/gmg-kulek-data.js (GMG_KULEK.items [ответ, п1, п2, п3, реплика, рисунок]; 60 от TEXT). 'day'/'fest' — набор по зерну дня; иначе — свой круг (host.mem().k).
   ПК: 1–4 — ответ, Пробел — ещё подсказка, Enter — дальше. Классы — gmb-k2*. Договор — шапка js/gmg-core.js. Выключение — GB.flag('mg_kulek'). */
(function(){
if(typeof GMG_REG!=='function')return;
const N=5;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const D=()=>window.GMG_KULEK||{};
const fm=(s,m)=>String(s||'').replace(/\{(\w+)\}/g,(x,k)=>m[k]!=null?m[k]:x);
const pk=(a,i)=>a&&a.length?a[i%a.length]:'';
function mix(a,rnd){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
const R=seed=>{let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
const tierOf=s=>s>=12?3:s>=8?2:1;
/* рисунок ответа: 1–22 — товар игры; имя — редкий товар RARE или новый GBG (когда подключён); нет рисунка — вариант-надпись */
function picOf(g){try{if(typeof g==='number')return g>0&&GOOD_DRAW[g]?g:0;if(!g)return 0;
  for(let k=0;k<RARE.length;k++)if(RARE[k].n===g&&GOOD_DRAW[RARE0+k])return RARE0+k;
  if(window.GBG&&GBG.ids)for(const id of GBG.ids()){const x=GBG.get(id);if(x&&x.n===g&&!x.draft&&GOOD_DRAW[id])return id;}}catch(e){}return 0;}
function make(host,o){const I=(D().items||[]).filter(x=>x&&x[0]&&x[3]).map(x=>({a:x[0],h:[x[1],x[2],x[3]],s:x[4]||'',p:picOf(x[5])}));if(I.length<4)return [];
  const m=host.mem(),day=o.mode==='plan'||o.mode==='daily'||o.mode==='fest'||o.mode==='day';
  const P=mix(I.map((_,i)=>i),R(0x5e3a));let st;if(day)st=Math.floor(o.rnd()*I.length);else{st=(m.k|0)%I.length;m.k=(st+N)%I.length;}
  const L=[];for(let i=0;i<N&&i<I.length;i++){const x=I[P[(st+i)%I.length]];
    // варианты: у ответа с рисунком — тоже с рисунками, без рисунка — надписи (вид одного вопроса одинаковый)
    let pool=I.filter(y=>y!==x&&!!y.p===!!x.p);if(pool.length<3)pool=I.filter(y=>y!==x);
    L.push({a:x.a,h:x.h,s:x.s,pic:!!x.p,opts:mix([x].concat(mix(pool,o.rnd).slice(0,3)),o.rnd)});}
  return L;}
GMG_REG({id:'kulek',who:'semyon',finWho:'semyon',deps:['js/gmg-kulek-data.js'],
  open:()=>typeof drawGood==='function',
  lines:{good:()=>(D().lines||{}).good,ok:()=>(D().lines||{}).ok,bad:()=>(D().lines||{}).bad},
  sim(o,k){let s=0;for(let i=0;i<N;i++){const r=o.rnd();if(r<.25+.5*k)s+=3;else if(r<.5+.4*k)s+=2;else if(r<.72+.26*k)s+=1;}return {sc:s,st:tierOf(s)};},
  run(host,o){const d=D(),L=make(host,o);if(!L.length){host.quit();return;}
    let i=0,q=null,shown=1,score=0,busy=false,timer=0,okN=0,bdN=0,ltN=0,started=false;
    host.el.innerHTML='<div class="gmb-q"><div class="gmb-qp"><span class="gmb-qpt"></span><div class="gmg-dots">'+L.map(()=>'<i></i>').join('')+'</div></div>'+
      '<div class="gmb-qh"></div><div class="gmb-qo">'+[0,1,2,3].map(k=>'<button type="button" class="gmb-qb" data-i="'+k+'"><canvas></canvas><span></span>'+(host.pc?'<kbd class="gmg-kc">'+(k+1)+'</kbd>':'')+'</button>').join('')+'</div>'+
      '<div class="gmb-qs"></div>'+(host.pc?'<p class="gmg-hint gmb-qk">'+host.kc('1')+'–'+host.kc('4')+' — ответ, '+host.kc('Пробел')+' — ещё подсказка, '+host.kc('Enter')+' — дальше</p>':'')+'</div>';
    const $=s=>host.el.querySelector(s),hl=$('.gmb-qh'),say=$('.gmb-qs'),pt=$('.gmb-qpt'),btns=[].slice.call(host.el.querySelectorAll('.gmb-qb')),dots=[].slice.call(host.el.querySelectorAll('.gmb-qp .gmg-dots i'));
    const S1=(t,m)=>{say.innerHTML=t?host.say('semyon',t,m||'norm'):'';};
    function pic(c,t){const s=56,dp=host.dpr;c.style.display=t?'':'none';if(!t)return;c.width=s*dp;c.height=s*dp;c.style.width=c.style.height=s+'px';const g=c.getContext('2d');g.setTransform(dp,0,0,dp,0,0);g.clearRect(0,0,s,s);try{drawGood(g,t,s/2,s*.88,s*1.02);}catch(e){}}
    function drawHints(){let h='';for(let k=0;k<shown&&k<3;k++)h+='<div class="gmb-qc'+(k===shown-1?' new':'')+'"><span class="gmb-qn">'+(k+1)+'</span><span>'+esc(q.h[k])+'</span></div>';
      if(shown<3&&!busy)h+='<button type="button" class="gmb-qc lock"><span class="gmb-qn">'+(shown+1)+'</span><span class="gmb-qt">'+esc(d.more||'')+'</span><small>'+esc(fm(d.forPts,{n:3-shown}))+'</small></button>';
      hl.innerHTML=h;const b=hl.querySelector('.lock');if(b)b.onclick=()=>{try{host.snd.pick&&host.snd.pick();}catch(e){}more();};}
    function show(){q=L[i];shown=1;busy=false;host.top(fm(d.top,{n:i+1,m:L.length}));pt.textContent=fm(d.pts,{n:score});
      dots.forEach((x,k)=>{x.classList.toggle('cur',k===i);});
      btns.forEach((b,k)=>{const t=q.opts[k];b.className='gmb-qb'+(q.pic?'':' txt');b.disabled=false;pic(b.querySelector('canvas'),q.pic?t.p:0);b.querySelector('span').textContent=t.a;});drawHints();S1('');}
    function more(){if(busy||shown>=3)return;shown++;drawHints();}
    function pickA(k){if(busy||!q||!started)return;const b=btns[k];if(b.disabled)return;const t=q.opts[k];
      if(t.a===q.a){const p=4-shown;score+=p;busy=true;b.classList.add('ok');try{host.snd.coin&&host.snd.coin();}catch(e){}dots[i].classList.add('ok');pt.textContent=fm(d.pts,{n:score});
        S1('<b>'+esc(shown===1?pk(d.ok,okN++):pk(d.late,ltN++))+'</b> '+esc(q.s),'happy');drawHints();timer=setTimeout(next,host.calm?3000:2300);return;}
      b.classList.add('no');b.disabled=true;try{host.snd.back&&host.snd.back();}catch(e){}
      if(shown<3){shown++;drawHints();S1(esc(pk(d.bad,bdN++)));return;}
      busy=true;dots[i].classList.add('no');btns.forEach((x,j)=>{if(q.opts[j].a===q.a)x.classList.add('ok');x.disabled=true;});S1(esc(fm(d.miss,{a:q.a}))+' '+esc(q.s),'sad');drawHints();timer=setTimeout(next,host.calm?3200:2600);}
    function next(){clearTimeout(timer);timer=0;if(!busy)return;i++;if(i>=L.length){fin();return;}show();}
    function fin(){host.finish({sc:score,st:tierOf(score),label:fm(d.label,{n:score,m:L.length*3})});}
    btns.forEach((b,k)=>{b.onclick=()=>pickA(k);});
    say.onclick=()=>{if(busy&&timer)next();};
    host.keys(k=>{if(!started)return false;if(busy){if(k==='Enter'||k===' '){if(timer)next();return true;}return false;}
      if(/^[1-4]$/.test(k)){pickA(+k-1);return true;}if(k===' '){more();return true;}return false;});
    host.onQuit(()=>{clearTimeout(timer);timer=0;});
    host.bot=k=>{if(!q||!started)return;if(busy){if(timer)next();return;}
      if(shown<3&&Math.random()<(1-k)*.3){more();return;}
      const ok=q.opts.findIndex(x=>x.a===q.a),wr=btns.map((b,j)=>j).filter(j=>j!==ok&&!btns[j].disabled);
      pickA(Math.random()<.35+.6*k||!wr.length?ok:wr[Math.floor(Math.random()*wr.length)]);};
    host.intro({who:'semyon',text:esc(d.intro||'').replace(/&lt;(\/?b)&gt;/g,'<$1>'),btn:'Загадывайте!',hint:esc(d.hint||'')}).then(()=>{started=true;show();});}});
(function(){if(document.getElementById('gmb-q-css'))return;const st=document.createElement('style');st.id='gmb-q-css';st.textContent=
'.gmb-q{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;overflow-y:auto;padding:6px 0 8px}'+
'.gmb-qp{display:flex;align-items:center;justify-content:space-between;margin:0 auto;width:calc(100% - 24px);max-width:560px;font-weight:800;font-size:16px}'+
'.gmb-qp .gmg-dots{display:flex;gap:6px}.gmb-qp .gmg-dots i{width:12px;height:12px;border-radius:50%;background:#e6d6b8;display:block}.gmb-qp .gmg-dots i.cur{background:#e8a33c}.gmb-qp .gmg-dots i.ok{background:#2f8f4e}.gmb-qp .gmg-dots i.no{background:#e2463b}'+
'.gmb-qh{margin:8px auto 0;width:calc(100% - 20px);max-width:560px;display:flex;flex-direction:column;gap:5px}'+
'.gmb-qc{display:flex;align-items:center;gap:8px;background:#fff8e6;border-radius:12px;padding:7px 10px;font:600 17px/1.3 var(--font,sans-serif);box-shadow:0 2px 0 #ead9bb;text-align:left;color:var(--ink,#3b2a1a)}'+
'.gmb-qc.new{animation:gmbIn .3s ease-out}@keyframes gmbIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}'+
'.gmb-qn{flex:0 0 26px;height:26px;border-radius:50%;background:#a0673a;color:#fff;font:800 15px/26px sans-serif;text-align:center}'+
'.gmb-qc.lock{border:2px dashed #d2b98f;background:transparent;box-shadow:none;cursor:pointer;min-height:48px;width:100%}.gmb-qc.lock .gmb-qn{background:#d2b98f}.gmb-qt{flex:1 1 auto;font-weight:800}.gmb-qc small{font-size:13px;color:#8a6a4a}'+
'.gmb-qo{margin:10px auto 0;width:calc(100% - 20px);max-width:560px;display:grid;grid-template-columns:1fr 1fr;gap:8px}'+
'@media (min-width:700px){.gmb-qo{grid-template-columns:repeat(4,1fr)}}'+
'.gmb-qb{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-height:96px;border:0;border-radius:14px;background:#fff;box-shadow:0 3px 0 var(--edge,#d9c8a8);cursor:pointer;color:var(--ink,#3b2a1a);font:800 16px/1.15 sans-serif;padding:4px 4px 8px}'+
'.gmb-qb canvas{display:block}.gmb-qb.txt{justify-content:center;min-height:64px;font-size:18px}.gmb-qb kbd{position:absolute;left:6px;top:6px}.gmb-qb.ok{background:#dff3e3;box-shadow:0 0 0 3px #2f8f4e}.gmb-qb.no{opacity:.45;text-decoration:line-through;text-decoration-color:#e2463b}'+
'.gmb-qs{margin:10px auto 0;width:calc(100% - 20px);max-width:560px;min-height:58px;cursor:pointer}.gmb-qs .gmg-say{margin:0}.gmb-qs .gmg-av{width:46px;height:46px}.gmb-qs .gmg-sb{font-size:16px;padding:7px 11px}'+
'.gmb-qk{text-align:center;margin:6px 10px 0}body.calm .gmb-qc.new{animation:none}'+
'@media (max-height:620px){.gmb-qc{font-size:15.5px;padding:5px 9px}.gmb-qb{min-height:78px}.gmb-qb canvas{width:44px!important;height:44px!important}.gmb-qs{min-height:50px}}';
document.head.appendChild(st);})();
})();
