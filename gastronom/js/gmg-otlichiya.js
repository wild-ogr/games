'use strict';
/* gb-MGB мини-игра №8 «Отличия на прилавке» (ведёт школьник Валерка). 05-minigames.md §3 №8, основа — vymg-otlich «Выезда».
   Прилавок гастронома «утром» и «вечером» (рисует игра по зерну родными рисунками: товары drawGood на полках, кот Пломбир drawCat, весы с гирьками,
   часы, плакат, цветы в банке, счёты, ценники). Отличаются ровно 5 вещами. Найти — касанием/щелчком по любой из двух картинок. Без таймера.
   Промах — красный крестик (считаем; 3 промаха подряд за 4 с — пауза 1,5 с «глазами ищите»); подсказка Валерки — одна на заход.
   Ступени: промахов ≤ 2 без подсказки — 3★; промахов ≤ 5 и подсказок ≤ 1 — 2★; иначе — 1★. Счёт = 100 − 4×промах − 10×подсказка (не меньше 10).
   ПК: стрелки/WASD — рамка по сетке 10×7, Enter/Пробел — «здесь отличие!», H — подсказка. 'day'/'fest' — раскладка по зерну дня (даёт оболочка).
   Тексты — js/gmg-otlichiya-data.js. Классы — gmb-o*. Договор — шапка js/gmg-core.js (MG0). Выключение — GB.flag('mg_otlichiya'). */
(function(){
if(typeof GMG_REG!=='function')return;
const N=5,WW=100,HH=70,PI=Math.PI;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const D=()=>window.GMG_OTLICHIYA||{};
const fm=(s,m)=>String(s||'').replace(/\{(\w+)\}/g,(x,k)=>m[k]!=null?m[k]:x);
const pk=(a,i)=>a&&a.length?a[i%a.length]:'';
function mix(a,rnd){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;}
const R=seed=>{let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
const POST=['#c0392b','#2e7d32','#1565c0','#ef8f00'],FLW=['#e53935','#fdd835','#ffffff','#8e24aa','#fb8c00'],GOODS_OK=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
const gnm=t=>{try{return GOODS[t].n;}catch(e){return '';}};
/* ---------- сцена (мир 100×70): стена 0–42, прилавок 42–70 ---------- */
function scene(seed){const r=R(seed*31+7),S={o:[]};
  S.o.push({k:'clock',x:11,y:11,w:6.5,h:6.5,v:1+Math.floor(r()*12)});
  S.o.push({k:'poster',x:31,y:14,w:9.5,h:9,v:Math.floor(r()*POST.length)});
  S.o.push({k:'lamp',x:24,y:2,w:4,h:3,v:1},{k:'lamp',x:74,y:2,w:4,h:3,v:1});
  const gs=mix(GOODS_OK,r);let gi=0;
  for(const y of [22,37])for(const x of [53,65,77,89])S.o.push({k:'good',x,y:y-4,by:y,w:5.6,h:5,v:gs[gi++]});
  S.o.push({k:'scale',x:13,y:39,w:9,h:5.5,v:1+Math.floor(r()*3)});
  S.o.push({k:'cat',x:36,y:39,w:7,h:5,v:r()<.75?1:0});
  S.o.push({k:'flower',x:59,y:38,w:4.5,h:6,v:Math.floor(r()*FLW.length)});
  S.o.push({k:'abacus',x:84,y:39.5,w:8,h:4.5,v:[1+Math.floor(r()*6),1+Math.floor(r()*6),1+Math.floor(r()*6)]});
  for(const x of [13,36,59,84])S.o.push({k:'tag',x,y:56,w:7.5,h:4.5,v:[12,14,16,18,22,24,28,30,32,37,44,48][Math.floor(r()*12)]});
  return S;}
function clone(S){return {o:S.o.map(o=>Object.assign({},o,{v:Array.isArray(o.v)?o.v.slice():o.v}))};}
/* что может отличаться: {f(o), t:текст} */
function muts(o,r){const d=D().d||{},M=[],oth=(n,c)=>{let x;do x=Math.floor(r()*n);while(x===c);return x;};
  switch(o.k){
    case 'clock':M.push({f:o=>{o.v=(o.v+2+Math.floor(r()*8))%12+1;},t:d.clock});break;
    case 'poster':M.push({f:o=>{o.v=oth(POST.length,o.v);},t:d.poster});break;
    case 'lamp':M.push({f:o=>{o.v=o.v?0:1;},t:d.lamp});break;
    case 'good':{const a=o.v;M.push({f:o=>{let t;do t=GOODS_OK[Math.floor(r()*GOODS_OK.length)];while(t===a);o.v=t;o.t2=fm(d.good,{a:gnm(a),b:gnm(t)});},t:''});
      M.push({f:o=>{o.v=0;},t:fm(d.gone,{a:gnm(a)})});break;}
    case 'scale':M.push({f:o=>{o.v=o.v===1?2+Math.floor(r()*2):o.v-1;},t:d.scale});break;
    case 'cat':M.push({f:o=>{o.v=o.v?0:1;},t:d.cat});break;
    case 'flower':M.push({f:o=>{o.v=oth(FLW.length,o.v);},t:d.flower});break;
    case 'abacus':M.push({f:o=>{const i=Math.floor(r()*3);o.v[i]=o.v[i]>3?o.v[i]-2-Math.floor(r()*2):o.v[i]+2+Math.floor(r()*2);},t:d.abacus});break;
    case 'tag':{const a=o.v;M.push({f:o=>{const L=[12,14,16,18,22,24,28,30,32,37,44,48].filter(x=>x!==a);o.v=L[Math.floor(r()*L.length)];o.t2=fm(d.tag,{a,b:o.v});},t:''});break;}}
  return M;}
function build(seed){const B=scene(seed),r=R(seed*7+3),C=clone(B),ds=[];
  // одна вещь на «гнездо»: не больше 2 товаров и 1 ценника, лампы — не больше одной
  const order=mix(B.o.map((_,i)=>i),r);let ng=0,nt=0,nl=0;
  for(const i of order){if(ds.length>=N)break;const o=B.o[i];if(o.k==='good'&&ng>=2)continue;if(o.k==='tag'&&nt>=1)continue;if(o.k==='lamp'&&nl>=1)continue;
    const M=muts(o,r);if(!M.length)continue;const m=M[Math.floor(r()*M.length)],side=r()<.5?0:1,tgt=side?C.o[i]:B.o[i];m.f(tgt);
    if(o.k==='good')ng++;if(o.k==='tag')nt++;if(o.k==='lamp')nl++;
    ds.push({i,k:o.k,x:o.x,y:o.y,w:o.w+1,h:o.h+1,t:tgt.t2||m.t,found:false});}
  return {a:B,b:C,ds};}
/* ---------- рисование ---------- */
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function el(g,x,y,rx,ry){g.beginPath();g.ellipse(x,y,Math.max(.05,rx),Math.max(.05,ry),0,0,PI*2);}
function drawScene(g,S,u,eve){g.save();g.scale(u,u);
  g.fillStyle='#efe0bf';g.fillRect(0,0,WW,42);g.fillStyle='#e3cfa6';for(let x=0;x<WW;x+=5)g.fillRect(x,0,.25,42);
  g.fillStyle='#b5835a';g.fillRect(0,40,WW,2);
  // полки
  g.fillStyle='#8a5a34';for(const y of [22,37]){g.fillRect(45,y,54,1.6);}g.fillStyle='#6e4526';g.fillRect(45,8,1.2,31);g.fillRect(97.8,8,1.2,31);
  // прилавок
  g.fillStyle='#c98a52';g.fillRect(0,42,WW,4);g.fillStyle='#a0673a';g.fillRect(0,46,WW,24);
  g.fillStyle='rgba(0,0,0,.08)';for(const x of [24.5,47.5,71.5])g.fillRect(x,48,1,22);
  for(const o of S.o)draw1(g,o,eve);
  if(eve){g.fillStyle='rgba(60,40,120,.12)';g.fillRect(0,0,WW,HH);}
  g.restore();}
function draw1(g,o,eve){const x=o.x,y=o.y;
  switch(o.k){
  case 'clock':{g.fillStyle='#5d4037';el(g,x,y,6.4,6.4);g.fill();g.fillStyle='#fffdf5';el(g,x,y,5.4,5.4);g.fill();g.fillStyle='#5d4037';
    for(let i=0;i<12;i++){const a=i/12*PI*2;el(g,x+Math.sin(a)*4.6,y-Math.cos(a)*4.6,.35,.35);g.fill();}
    const ha=o.v/12*PI*2;g.strokeStyle='#222';g.lineCap='round';g.lineWidth=.9;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.sin(ha)*3,y-Math.cos(ha)*3);g.stroke();
    g.lineWidth=.55;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-4.3);g.stroke();break;}
  case 'poster':{g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x-9+.6,y-8.5+.6,18,17);g.fillStyle='#fffaf0';g.fillRect(x-9,y-8.5,18,17);g.fillStyle=POST[o.v];g.fillRect(x-8,y-7.5,16,9);
    g.fillStyle='#f5c26b';el(g,x,y-3,4.6,2.6);g.fill();g.strokeStyle='#c98a3a';g.lineWidth=.35;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(x+i*1.6-.6,y-4.6);g.lineTo(x+i*1.6+.6,y-1.6);g.stroke();}
    g.fillStyle=POST[o.v];g.font='800 2.3px sans-serif';g.textAlign='center';const t=String(D().poster||'').split(' — ');g.fillText(t[0]||'',x,y+4.2);g.font='700 1.8px sans-serif';g.fillText(t[1]||'',x,y+6.6);break;}
  case 'lamp':{g.strokeStyle='#555';g.lineWidth=.3;g.beginPath();g.moveTo(x,0);g.lineTo(x,y);g.stroke();g.fillStyle='#2e7d32';g.beginPath();g.moveTo(x-3.6,y+2.4);g.lineTo(x-1.2,y);g.lineTo(x+1.2,y);g.lineTo(x+3.6,y+2.4);g.closePath();g.fill();
    g.fillStyle=o.v?'#fff3b0':'#9e9e9e';el(g,x,y+2.6,1.3,.8);g.fill();if(o.v&&eve){g.fillStyle='rgba(255,235,150,.28)';el(g,x,y+6,7,5);g.fill();}break;}
  case 'good':{if(o.v&&typeof drawGood==='function')drawGood(g,o.v,x,o.by,9.5);break;}
  case 'scale':{g.fillStyle='#d0d4d8';rr(g,x-7,y+1,14,3,.8);g.fill();g.fillStyle='#e9ecef';el(g,x-3.5,y,3.8,1);g.fill();el(g,x+3.5,y,3.8,1);g.fill();
    g.fillStyle='#b0b6bc';g.fillRect(x-.5,y-4,1,5);g.fillStyle='#fff';el(g,x,y-4.5,2,1.6);g.fill();g.strokeStyle='#c62828';g.lineWidth=.3;g.beginPath();g.moveTo(x,y-3.6);g.lineTo(x+.9,y-5.3);g.stroke();
    for(let i=0;i<o.v;i++){const gx=x+2+i*1.9;g.fillStyle='#424242';rr(g,gx-.8,y-2.2+(i%2)*.2,1.6,2,.4);g.fill();el(g,gx,y-2.5,.45,.35);g.fill();}break;}
  case 'cat':{if(o.v&&typeof drawCat==='function')drawCat(g,x,y+3,13);break;}
  case 'flower':{g.fillStyle='rgba(160,200,230,.55)';rr(g,x-2,y-1,4,5,1);g.fill();g.strokeStyle='#2e7d32';g.lineWidth=.35;
    for(const [dx,dy] of [[-1.6,-4.6],[0,-5.6],[1.6,-4.4]]){g.beginPath();g.moveTo(x,y+1);g.lineTo(x+dx,y+dy);g.stroke();g.fillStyle=FLW[o.v];el(g,x+dx,y+dy,1.1,1.1);g.fill();g.fillStyle='#fbc02d';el(g,x+dx,y+dy,.35,.35);g.fill();}break;}
  case 'abacus':{g.fillStyle='#8d6e63';rr(g,x-7,y-3.6,14,7.4,.6);g.fill();g.fillStyle='#f5e6c8';g.fillRect(x-6.2,y-2.8,12.4,5.8);g.strokeStyle='#5d4037';g.lineWidth=.2;
    for(let rI=0;rI<3;rI++){const ry=y-1.8+rI*1.9;g.beginPath();g.moveTo(x-6.2,ry);g.lineTo(x+6.2,ry);g.stroke();for(let b=0;b<8;b++){const left=b<o.v[rI];g.fillStyle=b===3||b===4?'#3e2723':'#c62828';
      const bx=left?x-5.6+b*1.15:x+5.6-(7-b)*1.15;el(g,bx,ry,.55,.75);g.fill();}}break;}
  case 'tag':{g.fillStyle='#fffdf5';rr(g,x-7,y-4,14,8,.8);g.fill();g.strokeStyle='#c62828';g.lineWidth=.3;rr(g,x-6.4,y-3.4,12.8,6.8,.6);g.stroke();
    g.fillStyle='#263238';g.font='800 3.5px sans-serif';g.textAlign='center';g.fillText(o.v+' коп.',x,y+1.3);break;}}}
/* ---------- игра ---------- */
const tierOf=(m,h)=>m<=2&&!h?3:m<=5&&h<=1?2:1;
const scoreOf=(m,h)=>Math.max(10,100-m*4-h*10);
GMG_REG({id:'otlichiya',who:'valerka',finWho:'valerka',deps:['js/gmg-otlichiya-data.js'],build,
  open:()=>typeof drawGood==='function',
  lines:{good:()=>(D().lines||{}).good,ok:()=>(D().lines||{}).ok,bad:()=>(D().lines||{}).bad},
  sim(o,k){const r=o.rnd;const m=Math.round((1-k)*7*r()+(r()<.3?1:0)),h=r()<(1-k)*.5?1:0;return {sc:scoreOf(m,h),st:tierOf(m,h)};},
  run(host,o){const d=D(),G=build(o.seed||1);
    let miss=0,hint=0,found=0,lock=0,over=false,lay=null,cache=[null,null],hintD=null,mt=[],marks=[],kx=4,ky=3,kOn=!!host.pc,okN=0,msN=0,started=false;
    const t0=Date.now(),now=()=>(Date.now()-t0)/1000;let T=0;   // время — по часам, не по кадрам (кадров нет в свёрнутой вкладке)
    host.el.innerHTML='<div class="gmb-o"><div class="gmb-os"></div><div class="gmb-ov"><canvas></canvas></div><div class="gmb-ob"><button type="button" class="btn gmb-oh">'+esc(d.helpBtn||'💡')+(host.pc?' '+host.kc('H'):'')+'</button>'+
      (host.pc?'<span class="gmg-hint">'+host.kc('←')+host.kc('↑')+host.kc('→')+host.kc('↓')+' — рамка, '+host.kc('Enter')+' — «здесь!»</span>':'')+'</div></div>';
    const $=s=>host.el.querySelector(s),say=$('.gmb-os'),st=$('.gmb-ov'),cv=st.querySelector('canvas'),g=cv.getContext('2d'),bH=$('.gmb-oh');let W=0,H=0;
    const S1=(t,m)=>{say.innerHTML=host.say('valerka',t,m||'norm');};
    function layout(){W=Math.max(1,st.clientWidth);H=Math.max(1,st.clientHeight);cv.width=Math.round(W*host.dpr);cv.height=Math.round(H*host.dpr);cv.style.width=W+'px';cv.style.height=H+'px';
      const gap=10,ar=HH/WW,lab=20;let w,pos;const wide=W>H*1.25;
      if(wide){w=Math.min((W-gap*3)/2,(H-lab-8)/ar);const h=w*ar,x0=(W-w*2-gap)/2,y0=Math.max(lab,(H-h)/2+6);pos=[[x0,y0],[x0+w+gap,y0]];}
      else{w=Math.min(W-16,(H-gap-lab*2-4)/2/ar);const h=w*ar,x0=(W-w)/2,y0=Math.max(lab,(H-h*2-gap-lab)/2+lab/2);pos=[[x0,y0],[x0,y0+h+gap+lab]];}
      lay={w,h:w*ar,u:w/WW,pos,wide};cache=[null,null];}
    host.onResize(layout);
    function bake(i){const c=document.createElement('canvas'),dp=host.dpr;c.width=Math.round(lay.w*dp);c.height=Math.round(lay.h*dp);const q=c.getContext('2d');q.scale(dp,dp);drawScene(q,i?G.b:G.a,lay.u,i===1);return c;}
    function hitPic(x,y){for(let i=0;i<2;i++){const p=lay.pos[i];if(x>=p[0]&&x<=p[0]+lay.w&&y>=p[1]&&y<=p[1]+lay.h)return {i,wx:(x-p[0])/lay.u,wy:(y-p[1])/lay.u};}return null;}
    function tap(x,y){T=now();if(!lay)layout();if(over||!started||T<lock)return;const h=hitPic(x,y);if(!h)return;
      const pad=Math.max(0,11/lay.u-2);let best=null,bd=1e9;
      for(const q of G.ds){if(q.found)continue;const dx=Math.abs(h.wx-q.x),dy=Math.abs(h.wy-q.y);if(dx<=q.w+pad&&dy<=q.h+pad){const dd=dx/q.w+dy/q.h;if(dd<bd){bd=dd;best=q;}}}
      if(best){foundD(best);return;}
      if(G.ds.some(q=>q.found&&Math.abs(h.wx-q.x)<=q.w+pad&&Math.abs(h.wy-q.y)<=q.h+pad))return;
      miss++;marks.push({i:h.i,x:h.wx,y:h.wy,t:T});try{host.snd.back&&host.snd.back();}catch(e){}mt.push(T);mt=mt.filter(t=>T-t<4);
      if(mt.length>=3){lock=T+1.5;mt=[];S1(esc(d.poke||''),'sad');}else S1(esc(pk(d.miss,msN++)));}
    function foundD(q){q.found=true;found++;if(hintD===q)hintD=null;try{host.snd.coin&&host.snd.coin();}catch(e){}
      host.top(fm(d.top,{n:found}));S1('<b>'+esc(pk(d.ok,okN++))+'</b> '+esc(q.t),'happy');
      if(found>=N){over=true;bH.disabled=true;S1('<b>'+esc(d.done||'')+'</b>','happy');try{host.snd.happy&&host.snd.happy();}catch(e){}
        setTimeout(()=>host.finish({sc:scoreOf(miss,hint),st:tierOf(miss,hint),h:miss+hint,label:fm(d.label,{m:miss,h:hint?d.labelH||'':''})}),host.calm?1800:1300);}}
    function useHint(){if(over||hint>=1||!started)return;const q=G.ds.filter(x=>!x.found)[0];if(!q)return;hint++;hintD=q;bH.disabled=true;try{host.snd.pick&&host.snd.pick();}catch(e){}S1(esc(d.helpQ||''));}
    bH.onclick=useHint;
    host.ptr(cv,{down:(x,y)=>{kOn=false;tap(x,y);}});
    const KM={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1],'ф':[-1,0],'в':[1,0],'ц':[0,-1],'ы':[0,1]};
    host.keys(k=>{const kl=String(k).toLowerCase();if(kl==='h'||kl==='р'){useHint();return true;}if(over||!started)return false;
      const mv=KM[k]||KM[kl];if(mv){if(kOn){kx=Math.max(0,Math.min(9,kx+mv[0]));ky=Math.max(0,Math.min(6,ky+mv[1]));}kOn=true;return true;}
      if(k==='Enter'||k===' '){kOn=true;const p=lay.pos[1];tap(p[0]+(kx+.5)*10*lay.u,p[1]+(ky+.5)*10*lay.u);return true;}return false;});
    function frame(dt){T=now();if(!lay)layout();g.setTransform(host.dpr,0,0,host.dpr,0,0);g.clearRect(0,0,W,H);
      for(let i=0;i<2;i++){if(!cache[i])cache[i]=bake(i);const x=lay.pos[i][0],y=lay.pos[i][1];
        g.fillStyle='rgba(60,40,20,.18)';rr(g,x-3,y+1,lay.w+6,lay.h+6,10);g.fill();g.fillStyle='#fffaf0';rr(g,x-4,y-4,lay.w+8,lay.h+8,10);g.fill();
        g.save();rr(g,x,y,lay.w,lay.h,7);g.clip();g.drawImage(cache[i],x,y,lay.w,lay.h);
        for(const q of G.ds)if(q.found){const cx=x+q.x*lay.u,cy=y+q.y*lay.u,rx=(q.w+1)*lay.u,ry=(q.h+1)*lay.u;g.lineWidth=3.2;g.strokeStyle='#fff';el(g,cx,cy,rx,ry);g.stroke();g.lineWidth=2;g.strokeStyle='#2fa84f';el(g,cx,cy,rx,ry);g.stroke();}
        if(hintD){const cx=x+hintD.x*lay.u,cy=y+hintD.y*lay.u,pul=host.calm?1:1+.12*Math.sin(T*5),rx=(hintD.w+5)*lay.u*pul;g.lineWidth=3;g.setLineDash([6,5]);g.strokeStyle='#ffb020';el(g,cx,cy,rx,rx*.8);g.stroke();g.setLineDash([]);}
        for(let j=marks.length-1;j>=0;j--){const mk=marks[j],a=1-(T-mk.t)/1.1;if(a<=0){marks.splice(j,1);continue;}if(mk.i!==i)continue;const cx=x+mk.x*lay.u,cy=y+mk.y*lay.u,s=9;
          g.globalAlpha=a;g.lineCap='round';g.lineWidth=5;g.strokeStyle='#fff';g.beginPath();g.moveTo(cx-s,cy-s);g.lineTo(cx+s,cy+s);g.moveTo(cx+s,cy-s);g.lineTo(cx-s,cy+s);g.stroke();
          g.lineWidth=3;g.strokeStyle='#e5484d';g.stroke();g.globalAlpha=1;}
        if(kOn&&!over&&i===1){const fx=x+kx*10*lay.u,fy=y+ky*10*lay.u,fs=10*lay.u;g.lineWidth=4;g.strokeStyle='rgba(255,255,255,.9)';rr(g,fx+2,fy+2,fs-4,fs-4,6);g.stroke();
          g.setLineDash([7,5]);g.lineWidth=2.5;g.strokeStyle='#2a6fdb';rr(g,fx+2,fy+2,fs-4,fs-4,6);g.stroke();g.setLineDash([]);}
        g.restore();
        g.fillStyle='#5b3a1e';g.font='800 14px sans-serif';g.textAlign='left';g.fillText((i?'🌙 ':'☀️ ')+(i?d.evening:d.morning),x+4,y-8);}}
    host.loop(frame);
    host.onQuit(()=>{});
    host.bot=k=>{T=now();if(!lay)layout();if(over||!started||T<lock)return;const q=G.ds.filter(x=>!x.found)[0];if(!q)return;const p=lay.pos[Math.random()<.5?0:1];
      if(Math.random()<.3+.65*k){tap(p[0]+q.x*lay.u,p[1]+q.y*lay.u);return;}
      // промах: точка подальше от всех отличий
      for(let t=0;t<20;t++){const wx=5+Math.random()*90,wy=5+Math.random()*60;if(G.ds.every(z=>Math.abs(z.x-wx)>z.w+8||Math.abs(z.y-wy)>z.h+8)){tap(p[0]+wx*lay.u,p[1]+wy*lay.u);return;}}
      if(!hint&&Math.random()<.5)useHint();};
    host.top(fm(d.top,{n:0}));
    host.intro({who:'valerka',text:esc(d.intro||'').replace(/&lt;(\/?b)&gt;/g,'<$1>'),btn:'Искать!',hint:esc(d.hint||'')}).then(()=>{started=true;S1(esc(pk(d.start,o.seed|0)));});}});
(function(){if(document.getElementById('gmb-o-css'))return;const st=document.createElement('style');st.id='gmb-o-css';st.textContent=
'.gmb-o{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}'+
'.gmb-os{flex:0 0 auto;margin:8px auto 0;width:calc(100% - 20px);max-width:620px;min-height:56px}.gmb-os .gmg-say{margin:0}.gmb-os .gmg-av{width:46px;height:46px}.gmb-os .gmg-sb{font-size:16px;padding:7px 11px}'+
'.gmb-ov{flex:1 1 auto;min-height:0;position:relative}.gmb-ov canvas{display:block;cursor:crosshair}'+
'.gmb-ob{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:4px 10px 8px}.gmb-oh{min-height:56px;min-width:150px;font-size:17px}.gmb-oh:disabled{opacity:.45}'+
'@media (max-height:620px){.gmb-os{min-height:48px;margin-top:4px}.gmb-oh{min-height:48px}}';
document.head.appendChild(st);})();
})();
