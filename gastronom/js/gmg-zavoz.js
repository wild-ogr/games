'use strict';
/* gb-MGC мини-игра №12 «Завоз» (ведущий — Толик, привёз на фургоне). 10.10.2026. Договор — шапка js/gmg-core.js (MG0).
   Ящики по одному съезжают с фургона: молочку и колбасу — в холодильник (←), бакалею — на полку (→), битое — в брак (↓).
   16 ящиков ≈ 30 с, без таймера: следующий ящик подаётся, когда разложен прежний. Ошибка не наказывает — ящик возвращается,
   Толик подсказывает; звёзды — за ящики «с первого раза» (16 — 3★, 13+ — 2★, иначе 1★).
   Управление: свайп по ящику, нажатие на холодильник/полку/брак, три кнопки внизу; ПК — ← → ↓ (A D S), мышь.
   Главная кнопка после задания дня (раз в день, одна раскладка на всех — зерно дня от оболочки) + Затея дня (Пн).
   Тексты — js/gmg-zavoz-data.js, общий набор — js/gmg-mgc.js. Поля сохранения — только host.mem() (рекорд подряд: m.bs).
   Выключение: GB.flag('mg_zavoz') (оболочка) или здесь ZV_ON=false. */
(function(){
if(typeof GMG_REG!=='function')return;
const ZV_ON=true;
if(!ZV_ON)return;
const N=16;
// товары игры (id из GOODS): холодное — молочка и колбаса; сухое — бакалея и хлеб. Яйца не берём (спорно).
const COLD=[5,6,9,10,11,19],DRY=[1,2,3,4,7,8,12,13,14,15,17,18,20,21,22];
const BROKEN=.2;
const isCold=t=>COLD.indexOf(t)>=0;
const want=b=>b.br?'D':isCold(b.t)?'L':'R';
/* раскладка захода: 16 ящиков от зерна (одна на всех в 'day'/'paper'); битых 3–4, не два подряд */
function deal(rnd){const L=[];let nb=0;
  for(let i=0;i<N;i++){const prevBr=i>0&&L[i-1].br;const br=!prevBr&&i>0&&nb<4&&rnd()<BROKEN+(nb<3&&i>N-6?.3:0);if(br)nb++;
    const cold=rnd()<.45;const pool=cold?COLD:DRY;let t=pool[Math.floor(rnd()*pool.length)];
    if(i>0&&L[i-1].t===t)t=pool[(pool.indexOf(t)+1)%pool.length];L.push({t,br});}
  return L;}
const tier=f=>f>=N?3:f>=N-3?2:f>0?1:0;
const EN=()=>typeof LANG!=='undefined'&&LANG==='en';
const T=()=>(window.GMC?GMC.T('zavoz'):{});
GMG_REG({id:'zavoz',n:12,host:'tolik',who:'tolik',deps:['js/gmg-mgc.js','js/gmg-zavoz-data.js'],
  open:()=>true,
  lines:{get good(){return GMC.line('zavoz','st3');},get ok(){return GMC.line('zavoz','st2');},get bad(){return GMC.line('zavoz','st1');}},
  // бот баланса: k — доля верных с первого раза (без DOM, та же раскладка)
  sim(o,k){const L=deal(o.rnd);let f=0;const p=.6+.4*k;
    for(const b of L){if(!b||!b.t||['L','R','D'].indexOf(want(b))<0)throw new Error('zavoz: плохой ящик');if(o.rnd()<p)f++;}
    return {sc:f,st:tier(f)};},
  run(host,o){
    GMC.art=host.art||null;const K=GMC,TX=T(),calm=!!host.calm,weak=K.weak(host);zvCss();
    const L=deal(o.rnd);
    const C=K.cv(host),x=C.x;
    const say=K.msg(host);
    // кнопки: ← Холод · ↓ Брак · Полка →
    const ui=document.createElement('div');ui.className='gmc-ui bot gmc-zv-ui';
    const B=TX.btns||{L:'Холод',R:'Полка',D:'Брак'};
    ui.innerHTML='<button data-d="L">← '+K.esc(B.L)+'</button><button data-d="D" class="warn">↓ '+K.esc(B.D)+'</button><button data-d="R">'+K.esc(B.R)+' →</button>';
    host.el.appendChild(ui);
    [].forEach.call(ui.querySelectorAll('button'),b=>{b.onclick=()=>put(b.getAttribute('data-d'));});
    let i=0,f=0,ok=0,err=0,run=0,best=0,started=false,over=false,t=0;
    let cur=null;          // текущий ящик {b, x,y, a:анимация въезда 0..1, sh:тряска}
    const fly=[];          // разложенные: {b,d,a}
    const bump={L:0,R:0,D:0},got={L:[],R:[],D:0};
    let Z=null;            // раскладка поля
    function lay(){const w=C.w,h=C.h,ub=ui.offsetHeight||72;const fw=Math.min(w,760),x0=(w-fw)/2;
      const s=Math.max(.7,Math.min(1.4,Math.min(fw/420,(h-ub)/560)));
      const vanH=Math.round(Math.min((h-ub)*.24,150*s));
      const colW=Math.round(fw*.27);
      Z={w,h,s,x0,fw,ub,vanH,colW,
        cx:w/2,cy:vanH+((h-ub)-vanH)*.42,box:Math.round(Math.min(120*s,fw*.3,(h-ub-vanH)*.36)),
        L:{x:x0+6,y:vanH+8,w:colW-6,h:(h-ub)-vanH-16},R:{x:x0+fw-colW,y:vanH+8,w:colW-6,h:(h-ub)-vanH-16},
        D:{x:w/2-Math.min(fw*.2,110*s),y:(h-ub)-Math.min(80*s,(h-ub-vanH)*.26),w:Math.min(fw*.4,220*s),h:Math.min(80*s,(h-ub-vanH)*.26)-6}};}
    function next(){if(i>=N){end();return;}cur={b:L[i],a:0,sh:0,miss:0};host.top((TX.left?K.sub(TX.left,{k:i+1,n:N}):(i+1)+' из '+N));}
    function nm(b){try{return GOODS[b.t].n;}catch(e){return 'товар';}}
    function put(d){if(!started||over||!cur||cur.a<.6)return;const b=cur.b,w=want(b);
      if(d===w){if(!cur.miss){f++;run++;best=Math.max(best,run);const cl=TX.combo&&TX.combo[run];if(cl)say(K.pick(cl,o.rnd),'ok');}
        ok++;fly.push({b,d,a:0});if(d==='D')got.D=Math.min(got.D+1,6);else got[d].push(b.t);bump[d]=1;try{host.snd.coin?host.snd.coin():host.snd.pick&&host.snd.pick();}catch(e){}
        i++;cur=null;setTimeout(next,calm?240:120);}
      else{err++;run=0;cur.miss=1;cur.sh=.35;try{host.snd.grumble?host.snd.grumble():host.snd.back&&host.snd.back();}catch(e){}
        const W=TX.wrong||{};const key=b.br?'broken':d==='D'?'notbroken':isCold(b.t)?'cold':'dry';say(K.sub(K.pick(W[key],o.rnd),{n:nm(b)}),'no',1800);}}
    // ---- рисунок ----
    function van(g){const z=Z,s=z.s,h=z.vanH;
      // стена склада: окраска «под панель», ворота, пандус
      g.fillStyle='#e9e1cf';g.fillRect(0,0,z.w,h);g.fillStyle='#9fbfa4';g.fillRect(0,h*.55,z.w,h*.45);g.fillStyle='#86a98b';g.fillRect(0,h*.55,z.w,3*s);
      g.fillStyle='#bfb29a';g.fillRect(0,h-8*s,z.w,8*s);
      // фургон: кабина слева, будка справа, задние двери открыты к ящику
      const vh=Math.min(h-16*s,92*s),vw=Math.min(z.fw*.62,250*s),bx1=z.cx+18*s,bx0=Math.max(z.x0+4,bx1-vw),by=h-8*s,vy=by-vh-12*s;
      const cabW=vw*.26;g.fillStyle='#4f86b8';K.rr(g,bx0,vy+vh*.32,cabW,vh*.68,10*s);g.fill();
      g.fillStyle='#d9ecfa';K.rr(g,bx0+cabW*.14,vy+vh*.4,cabW*.6,vh*.26,4*s);g.fill();
      g.fillStyle='#8fb7d9';K.rr(g,bx0+cabW+2*s,vy,vw-cabW-2*s,vh,6*s);g.fill();g.strokeStyle='#6f97ba';g.lineWidth=2*s;g.stroke();
      g.fillStyle='#fff';g.font='900 '+Math.round(Math.min(16*s,vw*.075))+'px sans-serif';g.textAlign='center';g.textBaseline='middle';
      g.fillText(EN()?'GROCERIES':'ПРОДУКТЫ',bx0+cabW+(vw-cabW)/2,vy+vh*.45);
      g.fillStyle='#6f97ba';g.fillRect(bx1-3*s,vy+4*s,6*s,vh-8*s);
      g.save();g.translate(bx1,vy+4*s);g.transform(1,0,-.0,1,0,0);g.fillStyle='#a9c8e3';g.fillRect(0,0,16*s,vh-8*s);g.restore();
      for(const wx of[bx0+cabW*.5,bx1-vw*.2]){g.fillStyle='#333';g.beginPath();g.arc(wx,by-4*s,12*s,0,7);g.fill();g.fillStyle='#aaa';g.beginPath();g.arc(wx,by-4*s,5*s,0,7);g.fill();}}
    function stock(g,r,list,inner){const s=Z.s,n=list.length;if(!n)return;const rows=4,per=Math.max(2,Math.floor(r.w/(30*s))),gs=Math.min(34*s,r.w/per*1.1);
      for(let j=0;j<n&&j<rows*per;j++){const row=Math.floor(j/per),col=j%per,yy=inner.y+inner.h*(rows-row)/rows-4*s,xx=r.x+r.w*(col+.5)/per;K.good(g,list[j],xx,yy,gs*1.4);}}
    function fridge(g){const r=Z.L,s=Z.s,k=bump.L;g.save();g.translate(r.x+r.w/2,r.y+r.h);g.scale(1+k*.04,1+k*.04);g.translate(-(r.x+r.w/2),-(r.y+r.h));
      g.fillStyle='#f4f7f9';K.rr(g,r.x,r.y,r.w,r.h,10*s);g.fill();g.strokeStyle='#b8c4cc';g.lineWidth=2;g.stroke();
      const inn={x:r.x+8*s,y:r.y+34*s,w:r.w-16*s,h:r.h-50*s};g.fillStyle='#dff1fb';K.rr(g,inn.x,inn.y,inn.w,inn.h,6*s);g.fill();
      g.strokeStyle='#bcd9ea';g.lineWidth=2;for(let j=1;j<4;j++){const yy=inn.y+inn.h*j/4;g.beginPath();g.moveTo(inn.x,yy);g.lineTo(inn.x+inn.w,yy);g.stroke();}
      stock(g,r,got.L,inn);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(inn.x+inn.w*.1,inn.y,inn.w*.12,inn.h);
      label(g,(TX.zone&&TX.zone.L)||'Холодильник',r.x+r.w/2,r.y+17*s,'#2563c9');g.restore();}
    function shelf(g){const r=Z.R,s=Z.s,k=bump.R;g.save();g.translate(r.x+r.w/2,r.y+r.h);g.scale(1+k*.04,1+k*.04);g.translate(-(r.x+r.w/2),-(r.y+r.h));
      g.fillStyle='#b98a55';K.rr(g,r.x,r.y,r.w,r.h,8*s);g.fill();const inn={x:r.x+6*s,y:r.y+34*s,w:r.w-12*s,h:r.h-44*s};
      g.fillStyle='#ead2ab';g.fillRect(inn.x,inn.y,inn.w,inn.h);g.fillStyle='#9a6b3a';for(let j=1;j<=4;j++)g.fillRect(inn.x,inn.y+inn.h*j/4-5*s,inn.w,5*s);
      stock(g,r,got.R,inn);label(g,(TX.zone&&TX.zone.R)||'Полка',r.x+r.w/2,r.y+17*s,'#7a4a1f');g.restore();}
    function bin(g){const r=Z.D,s=Z.s,k=bump.D;g.save();g.translate(0,-k*4*s);
      g.fillStyle='#8a8f94';K.rr(g,r.x,r.y,r.w,r.h,8*s);g.fill();g.fillStyle='#6b6f76';g.fillRect(r.x+6*s,r.y+6*s,r.w-12*s,6*s);
      for(let j=0;j<got.D;j++){g.fillStyle='#b48a55';g.fillRect(r.x+10*s+j*14*s,r.y+r.h-22*s,26*s,14*s);}
      label(g,'↓ '+((TX.zone&&TX.zone.D)||'Брак'),r.x+r.w/2,r.y+r.h/2+2*s,'#c9473f');g.restore();}
    function floor(g){const z=Z,s=z.s,c=Math.max(24,34*s);for(let yy=z.vanH;yy<z.h;yy+=c)for(let xx=0;xx<z.w;xx+=c){g.fillStyle=((xx/c+yy/c)|0)%2?'#e8dcc4':'#d9c7a6';g.fillRect(xx,yy,c,c);}}
    function label(g,t,cx,cy,col){const s=Z.s;g.font='800 '+Math.round(Math.max(14,15*s))+'px sans-serif';g.textAlign='center';g.textBaseline='middle';
      const w=g.measureText(t).width+14;g.fillStyle='rgba(255,255,255,.92)';K.rr(g,cx-w/2,cy-12*s,w,24*s,8*s);g.fill();g.fillStyle=col;g.fillText(t,cx,cy+1);}
    function crate(g,b,cx,cy,sz,rot){g.save();g.translate(cx,cy);if(rot)g.rotate(rot);const hz=sz/2;
      g.fillStyle='#d9b27a';K.rr(g,-hz,-hz*.8,sz,sz*.8,6);g.fill();g.strokeStyle='#8a6b4a';g.lineWidth=Math.max(2,sz*.03);g.stroke();
      g.fillStyle='rgba(138,107,74,.35)';g.fillRect(-hz,-hz*.8+sz*.26,sz,sz*.05);g.fillRect(-hz,-hz*.8+sz*.53,sz,sz*.05);
      K.good(g,b.t,0,hz*.62,sz*1.05);
      if(b.br){g.strokeStyle='#3a2a22';g.lineWidth=Math.max(2,sz*.035);g.beginPath();g.moveTo(-hz*.2,-hz*.8);g.lineTo(-hz*.05,-hz*.3);g.lineTo(-hz*.3,0);g.lineTo(-hz*.1,hz*.4);g.stroke();
        g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(hz*.2,hz*.85,hz*.5,hz*.12,0,0,7);g.fill();
        g.save();g.rotate(-.25);g.strokeStyle='#c9473f';g.lineWidth=3;g.strokeRect(-hz*.55,-hz*.25,hz*1.1,hz*.5);g.fillStyle='#c9473f';
        g.font='900 '+Math.round(sz*.2)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(EN()?'BROKEN':'БОЙ',0,0);g.restore();}
      g.restore();}
    function frame(dt){t+=dt;if(!Z)lay();const z=Z,g=x;g.setTransform(C.dpr,0,0,C.dpr,0,0);
      floor(g);van(g);fridge(g);shelf(g);bin(g);
      for(const k in bump)bump[k]=Math.max(0,bump[k]-dt*4);
      // улетающие ящики
      for(const q of fly){q.a=Math.min(1,q.a+dt*(calm?3:5));const r=Z[q.d],tx=r.x+r.w/2,ty=q.d==='D'?r.y+r.h/2:r.y+r.h*.6,e=q.a*q.a;
        crate(g,q.b,z.cx+(tx-z.cx)*e,z.cy+(ty-z.cy)*e,z.box*(1-.55*e),0);}
      for(let j=fly.length-1;j>=0;j--)if(fly[j].a>=1)fly.splice(j,1);
      if(cur){cur.a=Math.min(1,cur.a+dt*(calm?2.2:4));cur.sh=Math.max(0,cur.sh-dt);const e=1-Math.pow(1-cur.a,3);
        const sx=cur.sh>0?Math.sin(t*50)*6*z.s*cur.sh/.35:0;crate(g,cur.b,z.cx+sx,z.vanH*.6+(z.cy-z.vanH*.6)*e,z.box,(1-e)*.3);}
      // подсказка направления первые 3 ящика
      if(started&&cur&&i<3&&cur.a>=1&&!weak){g.globalAlpha=.55+.35*Math.sin(t*5);const d=want(cur.b),s=z.s;g.fillStyle='#237a3b';g.font='900 '+Math.round(40*s)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';
        g.fillText(d==='L'?'⟵':d==='R'?'⟶':'↓',z.cx+(d==='L'?-1:d==='R'?1:0)*z.box*.85,z.cy+(d==='D'?z.box*.7:0));g.globalAlpha=1;}}
    function end(){if(over)return;over=true;cur=null;const m=host.mem();m.bs=Math.max(+m.bs||0,best);m.n=(+m.n||0)+1;
      try{host.snd.till?host.snd.till(3):host.snd.win&&host.snd.win();}catch(e){}
      const st=tier(f);setTimeout(()=>host.finish({sc:f,st,h:err,label:K.sub(TX.label||'{ok} из {n}',{ok,n:N,f}),line:K.line('zavoz','st'+st,o.rnd)}),calm?700:450);}
    // ---- ввод ----
    K.swipe(host,C.cv,{dir:d=>{if(d!=='U')put(d);},tap:(px,py)=>{const z=Z;if(!z)return;
      if(px<z.L.x+z.L.w&&py>z.L.y)put('L');else if(px>z.R.x&&py>z.R.y)put('R');else if(py>z.D.y-10)put('D');}});
    host.keys(k=>{const d=K.dir(k);if(d&&d!=='U'){put(d);return true;}return false;});
    host.onResize(()=>{Z=null;});
    // бот стенда: k — доля верных
    host.bot=k=>{if(!started||over||!cur||cur.a<1)return;const w=want(cur.b);put(Math.random()<k?w:['L','R','D'].filter(d=>d!==w)[Math.random()<.5?0:1]);};
    host.top('0 из '+N);
    host.loop(frame);
    host.intro({who:'tolik',text:K.esc(K.pick(TX.intro,o.rnd)||'Завоз приехал!'),btn:TX.btn||'Начать',
      hint:(host.pc?(TX.hint&&TX.hint.pc)||'стрелки':(TX.hint&&TX.hint.tel)||'смахните ящик')+' · '+N+' ящиков · ошибиться не страшно'})
      .then(()=>{started=true;Z=null;next();});}});
function zvCss(){GMC.css('gmc-zv-css','.gmg-zavoz .gmg-el,.gmg-zavoz .zmg-el{position:relative;overflow:hidden}.gmc-zv-ui button{flex:1 1 0;max-width:200px}');}
})();
