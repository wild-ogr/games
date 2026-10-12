'use strict';
/* gb-MGB мини-игра №10 «Стол заказов» (ведёт Галя с третьего). 05-minigames.md §3 №10.
   Галя «диктует» заказ: 5–7 товаров (карточки drawGood) видны 5 с (спокойный режим — 7 с; «Запомнили!» — сразу), потом прячутся;
   на полке 12 товаров — нажимайте, чтобы положить в заказ (ещё раз — убрать), «Собрано!» — когда набрано сколько нужно.
   Один раз за заход — «Что там было?» (Галя повторит 3 с, на 3★ не хватит). 2 заказа: 5 и 6 товаров (с 80-го уровня — 6 и 7). Без таймера на сбор.
   Ступени: всё верно и без переспроса — 3★; ошибок ≤ 2 — 2★; иначе — 1★. Счёт = 10×верных − 5×переспрос.
   Новый год (host.fest.id==='ny'): «заказ на оливье» — в заказе всегда горошек, докторская, яйца и майонез (майонез рисует игра).
   ПК: стрелки — по полке, Пробел — взять/убрать, Enter — «Запомнили!»/«Собрано!», 1–9 — товар по номеру. Тексты — js/gmg-zakaz-data.js. Классы — gmb-z*.
   Договор — шапка js/gmg-core.js. Выключение — GB.flag('mg_zakaz'). */
(function(){
if(typeof GMG_REG!=='function')return;
const SHELF=12,POOL=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],OLIV=[4,9,16,'m'];
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const D=()=>window.GMG_ZAKAZ||{};
const fm=(s,m)=>String(s||'').replace(/\{(\w+)\}/g,(x,k)=>m[k]!=null?m[k]:x);
const pk=(a,i)=>a&&a.length?a[i%a.length]:'';
function mix(a,rnd){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
const nm=t=>t==='m'?D().mayo||'':(()=>{try{return GOODS[t].n;}catch(e){return '';}})();
function mayo(g,cx,by,s){const u=s/100;g.save();g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.ellipse(cx,by,30*u,6*u,0,0,7);g.fill();
  g.fillStyle='#fbfbf6';g.beginPath();g.moveTo(cx-22*u,by-4*u);g.lineTo(cx-24*u,by-52*u);g.lineTo(cx+24*u,by-52*u);g.lineTo(cx+22*u,by-4*u);g.closePath();g.fill();
  g.strokeStyle='#d8d8cc';g.lineWidth=2*u;g.stroke();g.fillStyle='#1e63b5';g.fillRect(cx-26*u,by-64*u,52*u,13*u);g.fillStyle='#4f8fd9';g.fillRect(cx-26*u,by-64*u,52*u,4*u);
  g.fillStyle='#f6c945';g.fillRect(cx-24*u,by-40*u,48*u,20*u);g.fillStyle='#e8732c';g.beginPath();g.ellipse(cx,by-30*u,9*u,6*u,0,0,7);g.fill();g.restore();}
function drawItem(g,t,cx,by,s){if(t==='m'){mayo(g,cx,by,s);return;}try{drawGood(g,t,cx,by,s);}catch(e){}}
/* заказ: НГ — «на оливье» (горошек, докторская, яйца, майонез + добор); иначе — заказ Гали из GMG_ZAKAZ.orders (праздник fid — его заказы),
   первые n товаров (не хватает — добор случайными); нет заказов — случайные n. occ/say — повод и реплика Гали. */
function make(n,rnd,ny,fid,used){used=used||[];let order,occ='',say='';
  if(ny)order=mix(OLIV.concat(mix(POOL.filter(t=>OLIV.indexOf(t)<0),rnd).slice(0,n-OLIV.length)),rnd);
  else{const all=(D().orders||[]).filter(x=>x&&x[2]&&x[2].length);let c=all.filter(x=>fid&&x[3]===fid&&used.indexOf(x)<0);
    if(!c.length)c=all.filter(x=>!x[3]&&used.indexOf(x)<0);
    if(c.length){const x=c[Math.floor(rnd()*c.length)];used.push(x);occ=x[0];say=x[1];
      order=x[2].filter((t,i,a)=>POOL.indexOf(t)>=0&&a.indexOf(t)===i).slice(0,n);
      if(order.length<n)order=order.concat(mix(POOL.filter(t=>order.indexOf(t)<0),rnd).slice(0,n-order.length));order=mix(order,rnd);}
    else order=mix(POOL,rnd).slice(0,n);}
  const rest=mix(POOL.filter(t=>order.indexOf(t)<0),rnd).slice(0,SHELF-order.length);return {order,shelf:mix(order.concat(rest),rnd),occ,say};}
const tierOf=(m,h)=>m===0&&!h?3:m<=2?2:1;
GMG_REG({id:'zakaz',who:'galya',finWho:'galya',deps:['js/gmg-zakaz-data.js'],make,
  open:()=>typeof drawGood==='function',
  lines:{good:()=>(D().lines||{}).good,ok:()=>(D().lines||{}).ok,bad:()=>(D().lines||{}).bad},
  sim(o,k){let m=0,c=0;const h=o.rnd()<(1-k)*.4?1:0;for(const n of [5,6])for(let i=0;i<n;i++){if(o.rnd()<.55+.44*k+(h?.05:0))c++;else m++;}return {sc:Math.max(0,c*10-5*h),st:tierOf(m,h)};},
  run(host,o){const d=D(),ny=!!(host.fest&&host.fest.id==='ny'),sizes=(o.lvl|0)>=80?[6,7]:[5,6],usedO=[];
    let ri=0,Q=null,sel=[],ph='',miss=0,good=0,ask=0,timer=0,foc=0,okN=0;
    host.el.innerHTML='<div class="gmb-z"><div class="gmb-zs"></div><div class="gmb-zo"></div><div class="gmb-zb"><i></i></div><div class="gmb-zg"></div>'+
      '<div class="gmb-za"><button type="button" class="btn gmb-zq">'+esc(d.ask||'')+'</button><button type="button" class="btn green gmb-zd"></button></div>'+
      (host.pc?'<p class="gmg-hint gmb-zk">'+host.kc('←')+host.kc('→')+host.kc('↑')+host.kc('↓')+' — полка, '+host.kc('Пробел')+' — взять, '+host.kc('Enter')+' — дальше</p>':'')+'</div>';
    const $=s=>host.el.querySelector(s),say=$('.gmb-zs'),ord=$('.gmb-zo'),bar=$('.gmb-zb'),bi=bar.querySelector('i'),grid=$('.gmb-zg'),bQ=$('.gmb-zq'),bD=$('.gmb-zd');
    const S1=(t,m)=>{say.innerHTML=host.say('galya',t,m||'norm');};
    function pic(t,s){const c=document.createElement('canvas'),dp=host.dpr;c.width=s*dp;c.height=s*dp;c.style.width=c.style.height=s+'px';const g=c.getContext('2d');g.setTransform(dp,0,0,dp,0,0);
      drawItem(g,t,s/2,s*.86,s*1.05);return c;}
    function card(t,cls,i){const b=document.createElement(cls==='gmb-zc'?'div':'button');b.className=cls;if(b.tagName==='BUTTON')b.type='button';if(i!=null)b.setAttribute('data-i',i);
      b.appendChild(pic(t,cls==='gmb-zc'?46:52));const s=document.createElement('span');s.textContent=nm(t);b.appendChild(s);return b;}
    function showOrder(ms,first){ph='show';ord.innerHTML='';Q.order.forEach(t=>ord.appendChild(card(t,'gmb-zc')));ord.classList.add('on');grid.classList.add('dim');
      bar.classList.add('on');bi.style.transition='none';bi.style.width='100%';void bi.offsetWidth;bi.style.transition='width '+ms+'ms linear';bi.style.width='0%';
      bD.textContent=d.ready||'OK';bD.disabled=false;bQ.style.visibility='hidden';clearTimeout(timer);timer=setTimeout(hideOrder,ms);
      if(first)S1((Q.occ?'<b>'+esc(Q.occ)+'.</b> ':'')+esc(ny&&ri===0?(d.ny||{}).dict||'':Q.say||pk(d.dict,ri+(o.seed|0)))+(Q.say?'':' <b>'+Q.order.length+'</b>'));}
    function hideOrder(){clearTimeout(timer);timer=0;if(ph!=='show')return;ph='pick';ord.classList.remove('on');ord.innerHTML='';grid.classList.remove('dim');bar.classList.remove('on');
      bQ.style.visibility=ask?'hidden':'visible';upd();S1(esc(fm(d.pick,{n:Q.order.length})));}
    function upd(){[].slice.call(grid.children).forEach((b,i)=>{b.classList.toggle('on',sel.indexOf(i)>=0);b.classList.toggle('kf',!!host.pc&&ph==='pick'&&i===foc);});
      bD.textContent=(d.go||'OK')+' '+sel.length+'/'+Q.order.length;bD.disabled=ph!=='pick'||sel.length!==Q.order.length;}
    function round(){Q=make(sizes[ri],o.rnd,ny&&ri===0,host.fest&&host.fest.id,usedO);sel=[];foc=0;grid.innerHTML='';Q.shelf.forEach((t,i)=>{const b=card(t,'gmb-zi',i);b.onclick=()=>tog(i);grid.appendChild(b);});
      host.top(fm(d.top,{n:ri+1,m:sizes.length}));showOrder(host.calm?7000:5000,true);}
    function tog(i){if(ph!=='pick')return;const p=sel.indexOf(i);if(p>=0)sel.splice(p,1);else if(sel.length<Q.order.length)sel.push(i);else return;foc=i;
      try{(p>=0?host.snd.back:host.snd.pick)();}catch(e){}upd();}
    function done(){if(ph!=='pick'||sel.length!==Q.order.length)return;ph='res';const got=sel.map(i=>Q.shelf[i]),ok=got.filter(t=>Q.order.indexOf(t)>=0),bad=got.filter(t=>Q.order.indexOf(t)<0),lost=Q.order.filter(t=>got.indexOf(t)<0);
      good+=ok.length;miss+=lost.length;
      [].slice.call(grid.children).forEach((b,i)=>{const t=Q.shelf[i];if(sel.indexOf(i)>=0)b.classList.add(Q.order.indexOf(t)>=0?'ok':'no');else if(Q.order.indexOf(t)>=0)b.classList.add('lost');});
      bD.disabled=true;bQ.style.visibility='hidden';
      if(!lost.length){try{host.snd.happy&&host.snd.happy();}catch(e){}S1('<b>'+esc(pk(d.ok,okN++))+'</b>','happy');}
      else{try{host.snd.grumble&&host.snd.grumble();}catch(e){}S1(esc(fm(pk(d.part,ri),{a:nm(bad[0]),b:nm(lost[0])})),'sad');}
      timer=setTimeout(next,host.calm?2600:1900);}
    function next(){clearTimeout(timer);timer=0;if(ph!=='res')return;ri++;if(ri>=sizes.length){fin();return;}S1(esc(d.next||''));round();}
    function fin(){ph='end';const tot=sizes.reduce((a,b)=>a+b,0);host.finish({sc:Math.max(0,good*10-5*ask),st:tierOf(miss,ask),h:miss+ask,label:fm(d.label,{c:good,t:tot,h:ask?d.labelH||'':''})});}
    bD.onclick=()=>{if(ph==='show')hideOrder();else done();};
    bQ.onclick=()=>{if(ph!=='pick'||ask)return;ask++;S1(esc(d.again||''));showOrder(3000,false);};
    say.onclick=()=>{if(ph==='res')next();};
    host.keys(k=>{if(ph==='show'){if(k==='Enter'||k===' '){hideOrder();return true;}return false;}
      if(ph==='res'){if(k==='Enter'||k===' '){next();return true;}return false;}
      if(ph!=='pick')return false;const cols=Math.max(1,Math.round(grid.clientWidth/(grid.children[0]?grid.children[0].offsetWidth+6:80)));
      const mv={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[k];if(mv){foc=Math.max(0,Math.min(SHELF-1,foc+mv));upd();return true;}
      if(k===' '){tog(foc);return true;}if(k==='Enter'){if(sel.length===Q.order.length)done();else tog(foc);return true;}
      if(/^[1-9]$/.test(k)){tog(+k-1);return true;}return false;});
    host.onQuit(()=>{clearTimeout(timer);timer=0;});
    host.bot=k=>{if(ph==='show'){hideOrder();return;}if(ph==='res'){next();return;}if(ph!=='pick')return;
      if(sel.length===Q.order.length){done();return;}
      if(!ask&&Math.random()<(1-k)*.15){bQ.click();return;}
      const need=Q.shelf.map((t,i)=>i).filter(i=>sel.indexOf(i)<0&&Q.order.indexOf(Q.shelf[i])>=0),oth=Q.shelf.map((t,i)=>i).filter(i=>sel.indexOf(i)<0&&Q.order.indexOf(Q.shelf[i])<0);
      tog(Math.random()<.55+.44*k||!oth.length?need[0]:oth[Math.floor(Math.random()*oth.length)]);};
    host.intro({who:'galya',text:esc(ny?(d.ny||{}).intro||'':d.intro||'').replace(/&lt;(\/?b)&gt;/g,'<$1>'),btn:'Диктуйте!',hint:esc(d.hint||'')}).then(round);}});
(function(){if(document.getElementById('gmb-z-css'))return;const st=document.createElement('style');st.id='gmb-z-css';st.textContent=
'.gmb-z{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;overflow-y:auto;padding-bottom:8px}'+
'.gmb-zs{flex:0 0 auto;margin:8px auto 0;width:calc(100% - 20px);max-width:620px;min-height:56px;cursor:pointer}.gmb-zs .gmg-say{margin:0}.gmb-zs .gmg-av{width:46px;height:46px}.gmb-zs .gmg-sb{font-size:16px;padding:7px 11px}'+
'.gmb-zo{display:none;margin:8px auto 0;width:calc(100% - 20px);max-width:620px;background:#fffef6;border-radius:6px;box-shadow:0 3px 10px rgba(60,40,20,.2);padding:8px;box-sizing:border-box;flex-wrap:wrap;justify-content:center;gap:6px}'+
'.gmb-zo.on{display:flex}.gmb-zc{width:76px;display:flex;flex-direction:column;align-items:center;font:700 13px/1.15 sans-serif;text-align:center}.gmb-zc canvas{display:block}'+
'.gmb-zb{display:none;margin:6px auto 0;width:calc(100% - 40px);max-width:600px;height:8px;border-radius:4px;background:#ead9bb;overflow:hidden}.gmb-zb.on{display:block}.gmb-zb i{display:block;height:100%;width:100%;background:#e8732c;border-radius:4px}'+
'.gmb-zg{margin:8px auto 0;width:calc(100% - 20px);max-width:620px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;transition:opacity .2s}'+
'@media (min-width:700px){.gmb-zg{grid-template-columns:repeat(6,1fr)}}.gmb-zg.dim{opacity:.25;pointer-events:none}'+
'.gmb-zi{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-height:84px;border:0;border-radius:12px;background:#fff;box-shadow:0 3px 0 var(--edge,#d9c8a8);padding:4px 2px 5px;cursor:pointer;color:var(--ink,#3b2a1a);font:700 12.5px/1.1 sans-serif;text-align:center}'+
'.gmb-zi canvas{display:block}.gmb-zi span{display:block;min-height:2.2em;display:flex;align-items:center}.gmb-zi.on{background:#ffe9b8;box-shadow:0 0 0 3px #e8a33c,0 3px 0 #c98a3a}.gmb-zi.kf{outline:3px dashed #2a6fdb;outline-offset:1px}'+
'.gmb-zi.ok{background:#dff3e3;box-shadow:0 0 0 3px #2f8f4e}.gmb-zi.no{background:#ffe0dc;box-shadow:0 0 0 3px #e2463b}.gmb-zi.lost{box-shadow:0 0 0 3px #e2463b;animation:gmbPul .8s 2}@keyframes gmbPul{50%{transform:scale(1.06)}}'+
'.gmb-za{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:10px auto 0;width:calc(100% - 20px)}.gmb-za .btn{min-height:56px;font-size:17px;min-width:130px}.gmb-za .btn:disabled{opacity:.5}'+
'.gmb-zk{text-align:center;margin:6px 10px 0}body.calm .gmb-zi.lost{animation:none}'+
'@media (max-height:620px){.gmb-zs{min-height:48px;margin-top:4px}.gmb-zi{min-height:76px}.gmb-zi canvas{width:44px!important;height:44px!important}.gmb-zc{width:64px}.gmb-zc canvas{width:40px!important;height:40px!important}}';
document.head.appendChild(st);})();
})();
