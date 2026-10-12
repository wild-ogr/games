'use strict';
/* gb-MGC мини-игра №14 «Склад» (ведущий — дядя Коля). 10.10.2026. Договор — шапка js/gmg-core.js (MG0). Открывается с 30-го уровня (оболочка).
   Мини-«сокобан» 5×5: тележкой толкайте ящики на меловые места; 3 подсобки за заход (лёгкая, средняя, трудная — из готовых
   комнат js/gmg-sklad-data.js, генератор ../MGC-tools/sklad_gen.py проверяет решаемость). Ходы без лимита, «Отменить» и «Заново» — даром.
   Ролик по нужде — «📺 Пропустить комнату» (после 3× оптимума ходов или 90 с в комнате; один раз за заход).
   Звёзды по ходам против лучшего решения: ≤1,25× — 3★, ≤2× — 2★, иначе 1★ (пропущенная комната считается как 2,5× оптимума).
   Управление: свайп, нажатие клетки (шаг в её сторону), кнопки «Отменить»/«Заново»; ПК — стрелки/WASD, Z/Backspace — отменить, R — заново.
   GMC_SKLAD.solve(room) — BFS (бот стенда, проверка всех комнат в sim). Выключение: GB.flag('mg_sklad') (оболочка) или SK_ON=false. */
(function(){
if(typeof GMG_REG!=='function')return;
const SK_ON=true;
if(!SK_ON)return;
const W=5,D={U:[-1,0],D:[1,0],L:[0,-1],R:[0,1]};
const EN=()=>typeof LANG!=='undefined'&&LANG==='en';
function parse(s){const r={walls:[],goals:[],boxes:[],pl:0};for(let i=0;i<25;i++){const c=s.charAt(i);r.walls[i]=c==='#';r.goals[i]=c==='o'||c==='*'||c==='+';
  if(c==='B'||c==='*')r.boxes.push(i);if(c==='@'||c==='+')r.pl=i;}return r;}
const step=(i,d)=>{const r=Math.floor(i/W)+D[d][0],q=i%W+D[d][1];return r<0||r>=W||q<0||q>=W?-1:r*W+q;};
/* BFS по ходам → массив направлений (заглавная — толчок) или null */
function solve(s,lim){const P=parse(s);let gm=0;for(let i=0;i<25;i++)if(P.goals[i])gm+=Math.pow(2,i);
  let bm0=0;for(const b of P.boxes)bm0+=Math.pow(2,b);const has=(m,i)=>Math.floor(m/Math.pow(2,i))%2===1;
  const key=(p,m)=>m*32+p,par=new Map(),q=[[P.pl,bm0]];par.set(key(P.pl,bm0),null);let h=0;lim=lim||300000;
  while(h<q.length){const [p,m]=q[h++];if(m===gm){const path=[];let k=key(p,m);while(par.get(k)){const e=par.get(k);path.push(e[1]);k=e[0];}return path.reverse();}
    if(h>lim)return null;
    for(const d of'UDLR'){const n=step(p,d);if(n<0||P.walls[n])continue;let nm=m,mv=d.toLowerCase();
      if(has(m,n)){const b=step(n,d);if(b<0||P.walls[b]||has(m,b))continue;nm=m-Math.pow(2,n)+Math.pow(2,b);mv=d;}
      const k=key(n,nm);if(par.has(k))continue;par.set(k,[key(p,m),mv]);q.push([n,nm]);}}
  return null;}
window.GMC_SKLAD={solve,parse};
function pickRooms(rnd){const R=(window.GMC_DATA&&GMC_DATA.sklad&&GMC_DATA.sklad.rooms)||{};const out=[];
  for(const k of['e','m','h']){const L=R[k]||[];if(L.length)out.push(L[Math.floor(rnd()*L.length)%L.length]);}return out;}
const tierOf=(m,o)=>m<=o*1.25?3:m<=o*2?2:m>0?1:0;
let verified=null;   // проверка всех комнат (один раз за сеанс): решаемы и оптимум совпадает с данными
function verifyAll(){if(verified)return verified;const R=GMC_DATA.sklad.rooms;let n=0;
  for(const k in R)for(const r of R[k]){const p=solve(r[0]);if(!p)throw new Error('sklad: нерешаемая комната '+r[0]);if(p.length!==r[1])throw new Error('sklad: оптимум '+r[0]+' '+p.length+'≠'+r[1]);n++;}
  return verified={n};}
GMG_REG({id:'sklad',n:14,host:'kolya',who:'kolya',deps:['js/gmg-mgc.js','js/gmg-sklad-data.js'],
  open:()=>true,
  lines:{get good(){return GMC.line('sklad','st3');},get ok(){return GMC.line('sklad','st2');},get bad(){return GMC.line('sklad','st1');}},
  sim(o,k){verifyAll();const rooms=pickRooms(o.rnd);if(rooms.length!==3)throw new Error('sklad: нет 3 комнат');let M=0,O=0;
    for(const r of rooms){O+=r[1];M+=Math.round(r[1]*(1+(1-k)*o.rnd()*2.2));}const st=tierOf(M,O);return {sc:Math.round(300*O/M),st};},
  run(host,o){
    GMC.art=host.art||null;const K=GMC,TX=K.T('sklad'),calm=!!host.calm,weak=K.weak(host);
    K.css('gmc-sk-css','.gmg-sklad .gmg-el,.gmg-sklad .zmg-el{position:relative;overflow:hidden}.gmc-sk-ui button{flex:0 1 auto}.gmc-sk-ui .gmc-sk-skip{display:none}.gmc-sk-ui.need .gmc-sk-skip{display:block}'+
      '@media (max-width:380px){.gmc-sk-ui button{font-size:16px;padding:0 8px}}');
    const C=K.cv(host),x=C.x,say=K.msg(host);
    const ui=document.createElement('div');ui.className='gmc-ui bot gmc-sk-ui';
    ui.innerHTML='<button class="sec gmc-sk-undo">↶ '+K.esc(TX.undo||'Отменить')+(host.pc?'<kbd>Z</kbd>':'')+'</button><button class="sec gmc-sk-reset">⟲ '+K.esc(TX.reset||'Заново')+(host.pc?'<kbd>R</kbd>':'')+'</button>'+
      '<button class="rw gmc-sk-skip">'+K.esc(TX.skip||'📺 Пропустить')+'</button>';host.el.appendChild(ui);
    const bU=ui.querySelector('.gmc-sk-undo'),bR=ui.querySelector('.gmc-sk-reset'),bS=ui.querySelector('.gmc-sk-skip');
    const rooms=pickRooms(o.rnd);
    let ri=-1,P=null,boxes=[],pl=0,hist=[],moves=0,roomT=0,totalM=0,totalO=0,solved=0,skipped=0,started=false,over=false,busy=false,t=0,face='R',adUsed=false;
    let anim=null;   // {p0,p1,b:{i,from,to},a}
    const goodOf=o.rnd()<.5?[1,14,21,13]:[2,4,15,12];   // что в ящиках этого захода
    let Z=null;
    function lay(){const w=C.w,h=C.h,ub=ui.offsetHeight||72,av=h-ub-16,sz=Math.floor(Math.min(w-24,av,560)/W);
      Z={w,h,ub,cell:sz,x0:Math.round((w-sz*W)/2),y0:Math.round(8+Math.max(0,(av-sz*W)/2))};}
    function load(i){ri=i;const r=rooms[i];P=parse(r[0]);boxes=P.boxes.slice();pl=P.pl;hist=[];moves=0;roomT=0;anim=null;ui.classList.remove('need');
      host.top(K.sub(TX.room||'Комната {k} из 3',{k:i+1})+' · 0');botPath=null;}
    const boxAt=i=>boxes.indexOf(i);
    function won(){for(const b of boxes)if(!P.goals[b])return false;return true;}
    function stuck(){for(const b of boxes){if(P.goals[b])continue;const wl=d=>{const n=step(b,d);return n<0||P.walls[n];};if((wl('U')||wl('D'))&&(wl('L')||wl('R')))return true;}return false;}
    function move(d){if(!started||over||busy||anim)return false;const n=step(pl,d);face=d==='L'||d==='R'?d:face;if(n<0||P.walls[n])return bonk();
      const bi=boxAt(n);let bt=-1;if(bi>=0){bt=step(n,d);if(bt<0||P.walls[bt]||boxAt(bt)>=0)return bonk();}
      hist.push([pl,boxes.slice()]);anim={p0:pl,p1:n,b:bi>=0?{i:bi,from:n,to:bt}:null,a:0};pl=n;if(bi>=0)boxes[bi]=bt;moves++;
      try{bi>=0?(host.snd.box?host.snd.box():host.snd.drop&&host.snd.drop()):(host.snd.tap&&host.snd.tap());}catch(e){}
      host.top(K.sub(TX.room||'Комната {k} из 3',{k:ri+1})+' · '+moves);
      if(bi>=0&&!won()&&stuck())say(TX.stuck||'Ящик в углу — отмените ход','no',2200);
      need();return true;}
    function bonk(){try{host.snd.back&&host.snd.back();}catch(e){}return false;}
    function undo(){if(!started||over||busy||!hist.length)return;const h=hist.pop();pl=h[0];boxes=h[1];anim=null;try{host.snd.back&&host.snd.back();}catch(e){}
      host.top(K.sub(TX.room||'Комната {k} из 3',{k:ri+1})+' · '+moves);}
    function reset(){if(!started||over||busy||!hist.length)return;const h=hist[0];hist=[];pl=h[0];boxes=h[1];anim=null;botPath=null;try{host.snd.back&&host.snd.back();}catch(e){}}
    function need(){const r=rooms[ri];if(!adUsed&&host.adOk&&host.adOk()&&(moves>r[1]*3||roomT>90))ui.classList.add('need');}
    function roomDone(skip){busy=true;const r=rooms[ri];totalO+=r[1];totalM+=skip?Math.round(r[1]*2.5):Math.max(moves,r[1]);if(skip)skipped++;else solved++;
      try{host.snd.happy?host.snd.happy():host.snd.win&&host.snd.win();}catch(e){}say(K.pick(TX.done,o.rnd)||'Порядок!','ok',1500);
      setTimeout(()=>{busy=false;if(ri+1<rooms.length)load(ri+1);else end();},calm?1300:900);}
    function end(){if(over)return;over=true;[bU,bR,bS].forEach(b=>b.disabled=true);const st=tierOf(totalM,totalO);const m=host.mem();m.n=(+m.n||0)+1;
      host.finish({sc:Math.round(300*totalO/Math.max(1,totalM)),st,h:skipped,label:K.sub(TX.label||'{r} из 3',{r:solved+skipped,m:totalM,o:totalO}),line:K.line('sklad','st'+st,o.rnd)});}
    // ---- рисунок ----
    function rack(g,X,Y,c){g.fillStyle='#5f6b74';g.fillRect(X+2,Y+2,c-4,c-4);g.fillStyle='#808d96';for(let j=1;j<=3;j++)g.fillRect(X+3,Y+c*j/3.4,c-6,3);
      g.fillStyle='#9aa7b0';g.fillRect(X+2,Y+2,4,c-4);g.fillRect(X+c-6,Y+2,4,c-4);
      if(!weak){g.fillStyle='#c79a63';g.fillRect(X+c*.18,Y+c*.12,c*.22,c*.16);g.fillStyle='#d9534f';g.fillRect(X+c*.52,Y+c*.42,c*.14,c*.15);g.fillStyle='#e9cf8a';g.fillRect(X+c*.3,Y+c*.71,c*.3,c*.12);}}
    function goal(g,X,Y,c){g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=Math.max(3,c*.06);g.lineCap='round';g.beginPath();
      g.moveTo(X+c*.3,Y+c*.3);g.lineTo(X+c*.7,Y+c*.7);g.moveTo(X+c*.7,Y+c*.3);g.lineTo(X+c*.3,Y+c*.7);g.stroke();g.beginPath();g.arc(X+c/2,Y+c/2,c*.32,0,7);g.stroke();}
    function crate(g,X,Y,c,on,gi){const p=c*.08;g.fillStyle=on?'#cfe8b8':'#d9b27a';K.rr(g,X+p,Y+p,c-2*p,c-2*p,6);g.fill();g.strokeStyle=on?'#4c9a52':'#8a6b4a';g.lineWidth=Math.max(2,c*.05);g.stroke();
      g.beginPath();g.moveTo(X+p,Y+p);g.lineTo(X+c-p,Y+c-p);g.moveTo(X+c-p,Y+p);g.lineTo(X+p,Y+c-p);g.strokeStyle=on?'rgba(76,154,82,.45)':'rgba(138,107,74,.45)';g.stroke();
      if(!weak)K.good(g,goodOf[gi%goodOf.length],X+c/2,Y+c*.78,c*.62);
      if(on){g.fillStyle='#237a3b';g.font='900 '+Math.round(c*.3)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('✓',X+c*.8,Y+c*.22);}}
    function truck(g,X,Y,c){g.save();g.translate(X+c/2,Y+c/2);if(face==='L')g.scale(-1,1);const u=c/100;
      g.strokeStyle='#c2410c';g.lineWidth=7*u;g.lineCap='round';g.beginPath();g.moveTo(-26*u,-34*u);g.lineTo(-14*u,30*u);g.lineTo(26*u,30*u);g.stroke();
      g.beginPath();g.moveTo(-26*u,-34*u);g.lineTo(-38*u,-36*u);g.stroke();
      g.fillStyle='#2b2b2b';g.beginPath();g.arc(-10*u,34*u,10*u,0,7);g.fill();g.fillStyle='#aaa';g.beginPath();g.arc(-10*u,34*u,4*u,0,7);g.fill();
      g.fillStyle='#f5b72d';K.rr(g,-6*u,-18*u,30*u,40*u,4*u);g.fill();g.restore();}
    const pos=i=>[Z.x0+(i%W)*Z.cell,Z.y0+Math.floor(i/W)*Z.cell];
    function frame(dt){t+=dt;if(started&&!over&&!busy){roomT+=dt;if(Math.floor(roomT)%5===0)need();}if(!Z)lay();const z=Z,g=x,c=z.cell;g.setTransform(C.dpr,0,0,C.dpr,0,0);
      g.fillStyle='#4a3f35';g.fillRect(0,0,z.w,z.h);g.fillStyle='#57493d';for(let yy=0;yy<z.h;yy+=22)g.fillRect(0,yy,z.w,2);
      if(!P)return;
      for(let i=0;i<25;i++){const [X,Y]=pos(i);g.fillStyle=((i%W)+Math.floor(i/W))%2?'#b9b3a6':'#c6c0b3';g.fillRect(X,Y,c,c);}
      g.strokeStyle='#3a2f26';g.lineWidth=4;g.strokeRect(z.x0-2,z.y0-2,c*W+4,c*W+4);
      for(let i=0;i<25;i++){const [X,Y]=pos(i);if(P.walls[i])rack(g,X,Y,c);else if(P.goals[i])goal(g,X,Y,c);}
      let e=1;if(anim){anim.a=Math.min(1,anim.a+dt*(calm?7:12));e=anim.a;if(anim.a>=1){anim=null;if(won()&&!busy)roomDone(false);}}
      boxes.forEach((b,bi)=>{let [X,Y]=pos(b);if(anim&&anim.b&&anim.b.i===bi){const a=pos(anim.b.from);X=a[0]+(X-a[0])*e;Y=a[1]+(Y-a[1])*e;}crate(g,X,Y,c,P.goals[b]&&(!anim||!anim.b||anim.b.i!==bi),bi);});
      let [X,Y]=pos(pl);if(anim){const a=pos(anim.p0);X=a[0]+(X-a[0])*e;Y=a[1]+(Y-a[1])*e;}truck(g,X,Y,c);}
    // ---- ввод ----
    K.swipe(host,C.cv,{dir:d=>move(d),tap:(px,py)=>{if(!Z)return;const [X,Y]=pos(pl),dx=px-(X+Z.cell/2),dy=py-(Y+Z.cell/2);
      if(Math.max(Math.abs(dx),Math.abs(dy))<Z.cell*.5)return;move(Math.abs(dx)>Math.abs(dy)?(dx<0?'L':'R'):(dy<0?'U':'D'));}});
    host.keys((k,e)=>{const d=K.dir(k);if(d){move(d);return true;}if(k==='z'||k==='Z'||k==='я'||k==='Я'||k==='Backspace'){undo();return true;}if(k==='r'||k==='R'||k==='к'||k==='К'){reset();return true;}return false;});
    bU.onclick=()=>undo();bR.onclick=()=>reset();
    bS.onclick=()=>{if(adUsed||busy||over)return;adUsed=true;ui.classList.remove('need');host.adNeed('skip').then(ok2=>{if(ok2&&!over&&!busy)roomDone(true);});};
    host.onResize(()=>{Z=null;});
    // бот стенда: идёт по решению BFS; с вероятностью (1-k) делает лишний ход и отменяет его
    let botPath=null,detour=0;
    host.bot=k=>{if(!started||over||busy||anim)return;if(detour){detour=0;undo();return;}
      if(!botPath){botPath=solve(rooms[ri][0]).slice();if(hist.length){reset();botPath=solve(rooms[ri][0]).slice();}}
      if(Math.random()>k&&Math.random()<.4){const ds='UDLR'.split('').filter(d=>{const n=step(pl,d);return n>=0&&!P.walls[n]&&boxAt(n)<0;});if(ds.length){move(ds[Math.floor(Math.random()*ds.length)]);detour=1;return;}}
      const d=botPath.shift();if(d)move(d.toUpperCase());};
    load(0);host.loop(frame);
    host.intro({who:'kolya',text:K.esc(K.pick(TX.intro,o.rnd)),btn:TX.btn||'Начать',
      hint:(host.pc?(TX.hint&&TX.hint.pc):(TX.hint&&TX.hint.tel))+' · 3 подсобки · ходы не считаем на время'})
      .then(()=>{started=true;Z=null;});}});
})();
