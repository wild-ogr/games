'use strict';
/* vy-mga: мини-игра «Багажник на дачу» (id 'bagazh', ведущая — баба Шура). 05-minigames.md №3.
   Уложи все дачные вещи в багажник (вид сверху, бампер внизу). Без таймера. Вещь — фигура из клеток; её тащат пальцем/мышью
   или выбирают и нажимают клетку; ↻ / R / правая кнопка / колёсико — повернуть. Ящик рассады — у самого бампера (достать первой).
   Раскладка от зерна: багажник режется на фигуры (значит, решение есть всегда), потом вещи перемешиваются и поворачиваются.
   Клавиатура (ПК, KEYS): ←/→ (A/D) или 1–9 — вещь на полке; Enter/Пробел — взять в багажник; стрелки/WASD — двигать её по сетке; R — повернуть;
   Enter/Пробел — положить; Backspace — обратно на полку; ↑ с полки — курсор по багажнику (Enter на вещи — переложить, ↓ с нижнего ряда — на полку); H — подсказка.
   Звёзды: 3★ — без подсказки и не больше 2 перекладываний, 2★ — ≤1 подсказки и ≤8 перекладываний, иначе 1★. Доиграть можно всегда. */
(function(){
if(typeof VYMG_REG!=='function'||!window.VYA)return;
const A=window.VYA,L=A.L;
const ID='bagazh';
/* ---------- фигуры ---------- */
const norm=s=>{const mx=Math.min(...s.map(p=>p[0])),my=Math.min(...s.map(p=>p[1]));return s.map(p=>[p[0]-mx,p[1]-my]).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);};
const rot1=s=>norm(s.map(([x,y])=>[-y,x]));
const key=s=>norm(s).map(p=>p.join(',')).join(';');
function rotN(s,n){for(let i=0;i<((n%4)+4)%4;i++)s=rot1(s);return s;}
/* класс фигуры (без учёта поворота) → вещи. c — цвет, d — узор */
function shapeClass(s){const n=s.length;const ks=[0,1,2,3].map(r=>key(rotN(s,r)));const has=k=>ks.includes(k);
  if(n===2)return 'd2';
  if(n===3)return has('0,0;1,0;2,0')?'i3':'l3';
  if(n===4){if(has('0,0;1,0;2,0;3,0'))return 'i4';if(has('0,0;1,0;0,1;1,1'))return 'o4';if(has('0,0;1,0;2,0;1,1'))return 't4';if(has('1,0;2,0;0,1;1,1')||has('0,0;1,0;1,1;2,1'))return 's4';return 'l4';}
  return 'p5';}
const ITEMS={
  d2:[{n:['Термос','Thermos'],c:'#2e8b57',d:'thermos'},{n:['Банки','Jars'],c:'#c0392b',d:'jars'},{n:['Чайник','Kettle'],c:'#5d8aa8',d:'kettle'}],
  i3:[{n:['Удочки','Fishing rods'],c:'#8d6e63',d:'rods'},{n:['Грабли','Rake'],c:'#a1887f',d:'rake'}],
  l3:[{n:['Сумка','Bag'],c:'#6a5acd',d:'check'},{n:['Вёдра','Buckets'],c:'#2980b9',d:'bucket'}],
  i4:[{n:['Ковёр','Rug'],c:'#b03a2e',d:'rug'},{n:['Лопата','Shovel'],c:'#9c7a54',d:'shovel'}],
  o4:[{n:['Кабачки','Squash'],c:'#58a64a',d:'squash'},{n:['Ящик','Crate'],c:'#c49a5c',d:'crate'}],
  t4:[{n:['Таз','Basin'],c:'#95a5a6',d:'basin'},{n:['Мешок','Sack'],c:'#b8a07a',d:'sack'}],
  s4:[{n:['Картошка','Potatoes'],c:'#a0784a',d:'sack'},{n:['Шланг','Hose'],c:'#27ae60',d:'hose'}],
  l4:[{n:['Тележка','Trolley'],c:'#8e44ad',d:'check'},{n:['Лейка','Can'],c:'#16a085',d:'bucket'}],
  p5:[{n:['Раскладушка','Cot'],c:'#d68910',d:'cot'},{n:['Велосипед','Bike'],c:'#1f618d',d:'bike'},{n:['Палатка','Tent'],c:'#2e7d32',d:'tent'}]};
const SEED_ITEM={n:['Рассада','Seedlings'],c:'#7cb342',d:'seed'};
/* ---------- генератор: разрезать C×R на фигуры 2–5 клеток ---------- */
function cut(rnd,C,R,nMin,nMax){
  for(let tries=0;tries<400;tries++){const g=new Array(C*R).fill(-1),P=[];
    const want=()=>{const v=rnd();return v<.18?2:v<.5?3:v<.9?4:5;};
    let ok=true;
    for(let i=0;i<C*R;i++){if(g[i]>=0)continue;const id=P.length,cells=[i],t=want();g[i]=id;
      while(cells.length<t){const fr=[];for(const c of cells){const x=c%C,y=(c/C)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=C||ny>=R)continue;const j=ny*C+nx;if(g[j]<0&&!fr.includes(j))fr.push(j);}}
        if(!fr.length)break;const j=fr[Math.floor(rnd()*fr.length)];g[j]=id;cells.push(j);}
      P.push(cells);}
    // одиночки — к соседу, у которого < 5 клеток
    for(let id=0;id<P.length;id++){if(P[id].length!==1)continue;const c=P[id][0],x=c%C,y=(c/C)|0;const nb=[];
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=C||ny>=R)continue;const o=g[ny*C+nx];if(o!==id&&P[o].length>=1&&P[o].length<5&&!nb.includes(o))nb.push(o);}
      if(!nb.length){ok=false;break;}const o=nb[Math.floor(rnd()*nb.length)];P[o].push(c);g[c]=o;P[id]=[];}
    if(!ok)continue;
    const Q=P.filter(p=>p.length);if(Q.length<nMin||Q.length>nMax)continue;
    const cls=Q.map(p=>shapeClass(p.map(c=>[c%C,(c/C)|0])));if(cls.filter(c=>c==='d2').length>2)continue;
    return Q.map(p=>p.map(c=>[c%C,(c/C)|0]));}
  return null;}
function size(o){const lv=(o&&o.lvl)|0;let t=o&&o.mode==='day'?1:lv<12?0:lv<40?1:2;if(o&&o.calm)t=Math.max(0,t-1);return [[5,4,5,6],[6,4,6,8],[7,4,7,9]][t];}
function gen(seed,o){const rnd=A.rng(seed*31+7);const [C,R,nMin,nMax]=size(o);let parts=null,s=seed;
  for(let k=0;k<20&&!parts;k++){parts=cut(rnd,C,R,nMin,nMax);}
  if(!parts)parts=cut(A.rng(12345),C,R,1,99);
  const P=parts.map((cells,i)=>{const mx=Math.min(...cells.map(p=>p[0])),my=Math.min(...cells.map(p=>p[1]));const base=norm(cells);
    const cl=shapeClass(base),it=A.pick(rnd,ITEMS[cl]);return {i,base,sol:[mx,my],cl,it,r:0,s:base,at:null,fr:false};});
  // рассада — фигура 2–4 клеток у бампера (нижний ряд)
  const cand=P.filter(p=>p.base.length<=4&&p.base.some(([x,y])=>y+p.sol[1]===R-1));
  if(cand.length&&!(o&&o.lvl<4)){const p=A.pick(rnd,cand);p.fr=true;p.it=SEED_ITEM;}
  // одинаковые названия рядом — сменить на другое из той же группы
  const used={};for(const p of P){const nm=p.it.n[0];if(used[nm]&&!p.fr){const alt=ITEMS[p.cl].find(x=>!used[x.n[0]]);if(alt)p.it=alt;}used[p.it.n[0]]=1;}
  // повороты: не меньше половины несимметричных вещей «не так»
  for(const p of P){p.r=Math.floor(rnd()*4);p.s=rotN(p.base,p.r);}
  const asym=P.filter(p=>key(rotN(p.base,1))!==key(p.base));let wrong=asym.filter(p=>key(p.s)!==key(p.base)).length;
  for(const p of asym){if(wrong>=Math.ceil(asym.length/2))break;if(key(p.s)===key(p.base)){p.r=(p.r+1)%4;p.s=rotN(p.base,p.r);wrong++;}}
  A.shuffle(rnd,P);P.forEach((p,k)=>p.k=k);
  return {C,R,P};}
/* сколько поворотов от текущего вида до решения */
function needRot(p){for(let n=0;n<4;n++)if(key(rotN(p.s,n))===key(p.base))return n;return 0;}
function tierOf(h,t){return h===0&&t<=2?3:h<=1&&t<=8?2:1;}

/* ---------- рисунки вещей ---------- */
function drawItem(c,p,x0,y0,s,alpha,hl){const cells=p.s,set={};cells.forEach(([x,y])=>set[x+','+y]=1);const col=p.it.c,dk=A.shade(col,-.35),lt=A.shade(col,.25);
  c.save();c.globalAlpha=alpha==null?1:alpha;const pad=Math.max(1.5,s*.06);
  // тень
  c.fillStyle='rgba(0,0,0,.22)';for(const [x,y] of cells){c.fillRect(x0+x*s+pad+2,y0+y*s+pad+3,s-pad*2,s-pad*2);}
  // тело: клетки и перемычки между соседними клетками
  c.fillStyle=col;for(const [x,y] of cells){A.rr(c,x0+x*s+pad,y0+y*s+pad,s-pad*2,s-pad*2,s*.16);c.fill();
    if(set[(x+1)+','+y])c.fillRect(x0+x*s+s-pad-1,y0+y*s+pad,pad*2+2,s-pad*2);if(set[x+','+(y+1)])c.fillRect(x0+x*s+pad,y0+y*s+s-pad-1,s-pad*2,pad*2+2);}
  // узор
  const d=p.it.d;c.lineCap='round';
  for(const [x,y] of cells){const cx=x0+x*s+s/2,cy=y0+y*s+s/2,q=s*.32;
    if(d==='rug'){c.strokeStyle='#f5cba7';c.lineWidth=Math.max(1,s*.05);c.beginPath();c.moveTo(cx-q,cy);c.lineTo(cx,cy-q*.7);c.lineTo(cx+q,cy);c.lineTo(cx,cy+q*.7);c.closePath();c.stroke();c.fillStyle='#1a5276';c.beginPath();c.arc(cx,cy,s*.07,0,7);c.fill();}
    else if(d==='seed'){c.fillStyle='#6d4c41';c.fillRect(cx-q,cy-q*.2,q*2,q*1.1);c.fillStyle='#2e7d32';for(const k of [-.6,0,.6]){c.beginPath();c.ellipse(cx+q*k-q*.15,cy-q*.45,q*.25,q*.12,-.6,0,7);c.ellipse(cx+q*k+q*.15,cy-q*.5,q*.25,q*.12,.6,0,7);c.fill();}}
    else if(d==='jars'){c.fillStyle='rgba(255,255,255,.55)';A.rr(c,cx-q*.6,cy-q*.6,q*1.2,q*1.4,q*.3);c.fill();c.fillStyle='#8e1b10';c.fillRect(cx-q*.62,cy-q*.85,q*1.24,q*.3);c.fillStyle='#e74c3c';A.rr(c,cx-q*.45,cy-q*.2,q*.9,q*.9,q*.2);c.fill();}
    else if(d==='thermos'){c.fillStyle=lt;A.rr(c,cx-q*.45,cy-q,q*.9,q*2,q*.35);c.fill();c.fillStyle='#ecf0f1';c.fillRect(cx-q*.5,cy-q,q,q*.35);}
    else if(d==='kettle'){c.fillStyle=lt;c.beginPath();c.arc(cx,cy+q*.1,q*.7,0,7);c.fill();c.strokeStyle=dk;c.lineWidth=Math.max(1,s*.05);c.beginPath();c.arc(cx,cy-q*.4,q*.45,Math.PI,0);c.stroke();}
    else if(d==='rods'||d==='rake'||d==='shovel'){c.strokeStyle='#5d4037';c.lineWidth=Math.max(1.5,s*.09);c.beginPath();c.moveTo(cx-s*.5,cy);c.lineTo(cx+s*.5,cy);c.stroke();}
    else if(d==='check'){c.fillStyle='rgba(255,255,255,.28)';for(let i=0;i<3;i++)for(let j=0;j<3;j++)if((i+j)%2===0)c.fillRect(cx-q+i*q*.67,cy-q+j*q*.67,q*.67,q*.67);}
    else if(d==='bucket'){c.fillStyle=lt;c.beginPath();c.moveTo(cx-q*.7,cy-q*.6);c.lineTo(cx+q*.7,cy-q*.6);c.lineTo(cx+q*.5,cy+q*.75);c.lineTo(cx-q*.5,cy+q*.75);c.closePath();c.fill();c.strokeStyle=dk;c.lineWidth=Math.max(1,s*.04);c.beginPath();c.arc(cx,cy-q*.6,q*.7,Math.PI,0);c.stroke();}
    else if(d==='squash'){c.fillStyle='#33691e';c.beginPath();c.ellipse(cx,cy,q*.95,q*.45,.5,0,7);c.fill();c.fillStyle='#9ccc65';c.beginPath();c.ellipse(cx-q*.2,cy-q*.1,q*.4,q*.12,.5,0,7);c.fill();}
    else if(d==='crate'){c.strokeStyle=dk;c.lineWidth=Math.max(1,s*.05);for(const k of [-.5,0,.5]){c.beginPath();c.moveTo(cx-q,cy+q*k);c.lineTo(cx+q,cy+q*k);c.stroke();}}
    else if(d==='basin'){c.fillStyle=lt;c.beginPath();c.arc(cx,cy,q*.8,0,7);c.fill();c.fillStyle=col;c.beginPath();c.arc(cx,cy,q*.5,0,7);c.fill();}
    else if(d==='sack'){c.fillStyle='rgba(90,60,30,.35)';for(let i=0;i<5;i++){c.beginPath();c.arc(cx-q*.6+i*q*.3,cy+((i%2)-.5)*q*.6,q*.22,0,7);c.fill();}}
    else if(d==='hose'){c.strokeStyle='#1e8449';c.lineWidth=Math.max(1.5,s*.07);c.beginPath();c.arc(cx,cy,q*.65,0,7);c.stroke();c.beginPath();c.arc(cx,cy,q*.3,0,7);c.stroke();}
    else if(d==='cot'){c.strokeStyle='#7e5109';c.lineWidth=Math.max(1,s*.05);c.strokeRect(cx-q,cy-q,q*2,q*2);c.beginPath();c.moveTo(cx-q,cy-q);c.lineTo(cx+q,cy+q);c.stroke();}
    else if(d==='bike'){c.strokeStyle='#d6eaf8';c.lineWidth=Math.max(1,s*.05);c.beginPath();c.arc(cx,cy,q*.7,0,7);c.stroke();c.beginPath();c.moveTo(cx-q*.7,cy);c.lineTo(cx+q*.7,cy);c.stroke();}
    else if(d==='tent'){c.fillStyle=lt;c.beginPath();c.moveTo(cx,cy-q*.8);c.lineTo(cx+q*.8,cy+q*.6);c.lineTo(cx-q*.8,cy+q*.6);c.closePath();c.fill();}}
  // подсветка выбранной
  if(hl){c.strokeStyle='#ffd54f';c.lineWidth=Math.max(2,s*.08);for(const [x,y] of cells){A.rr(c,x0+x*s+pad*.5,y0+y*s+pad*.5,s-pad,s-pad,s*.18);c.stroke();}}
  // название — на самой «длинной» стороне
  if(s>=26){const mx=Math.max(...cells.map(q=>q[0]))+1,my=Math.max(...cells.map(q=>q[1]))+1;const nm=L(p.it.n[0],p.it.n[1]);
    let fs=Math.max(10,Math.min(s*.3,16));c.font='800 '+fs+'px Rubik,sans-serif';
    // клетка-центр — ближайшая к центру рамки
    const bx=mx/2,by=my/2;let best=cells[0],bd=1e9;for(const q of cells){const dd=(q[0]+.5-bx)**2+(q[1]+.5-by)**2;if(dd<bd){bd=dd;best=q;}}
    const tx=x0+best[0]*s+s/2,ty=y0+best[1]*s+s/2;while(c.measureText(nm).width>s*1.9&&fs>9){fs--;c.font='800 '+fs+'px Rubik,sans-serif';}
    c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=Math.max(2,fs*.22);c.strokeStyle='rgba(0,0,0,.5)';c.strokeText(nm,tx,ty);c.fillStyle='#fff';c.fillText(nm,tx,ty);}
  c.restore();}

/* ---------- сама игра ---------- */
function run(host,o){
  const seed=(o.seed|0)||20261009,G=gen(seed,o),C=G.C,R=G.R,P=G.P;
  const grid=new Array(C*R).fill(-1);let started=false,sel=-1,held=null,hints=0,takes=0,placed=0,fin=false,winT=0,shake=0,stuckSaid=false,moves=0,flash=null;
  const root=A.root(host),say=A.sayBox(host,root),cv=A.canvas(host,root),c=cv.cx;
  const row=document.createElement('div');row.className='vya-row';
  const pc=A.pc(host),kk=t=>pc?' '+A.kc(host,t):'';
  row.innerHTML='<button class="btn vya-rot">↻ '+L('Повернуть','Rotate')+kk('R')+'</button><button class="btn vya-hint">💡 '+L('Подсказка','Hint')+kk('H')+'</button>';root.appendChild(row);
  const note=document.createElement('div');note.className='vya-note';root.appendChild(note);
  /* KEYS: курсор клавиатуры. mode: 'tray' — выбор вещи на полке, 'grid' — курсор по багажнику, 'hold' — вещь «в руках» над сеткой (ax,ay — левый верх) */
  const kb={mode:'tray',cx:0,cy:0,p:null,ax:0,ay:0,used:false};
  const kbNote=()=>{if(!pc)return;const K=t=>A.kc(host,t);
    const AR=K(L('стрелки','arrows'));
    note.innerHTML=kb.mode==='hold'?AR+L(' двигать · ',' move · ')+K('R')+L(' повернуть · ',' rotate · ')+K('Enter')+L(' положить · ',' drop · ')+K('Backspace')+L(' на полку',' back')
      :kb.mode==='grid'?AR+L(' по багажнику · ',' trunk · ')+K('Enter')+L(' переложить вещь · ',' move item · ')+K('↓')+L(' на полку',' to shelf')
      :AR+L(' или ',' or ')+K('1–9')+L(' вещь · ',' item · ')+K('Enter')+L(' взять · ',' take · ')+K('R')+L(' повернуть · ',' rotate · ')+K('↑')+L(' в багажник · ',' trunk · ')+L('или тащите мышью','or drag with the mouse');};
  note.innerHTML=pc?'':L('Тащите вещь пальцем или нажмите вещь, потом клетку. Нажмите выбранную ещё раз — повернётся','Drag an item, or tap it and then a cell. Tap the selected item again to rotate');
  kbNote();
  const hasSeed=P.some(p=>p.fr);
  say.set('shura',hasSeed?L('Всё на дачу! Уложи так, чтобы всё влезло. Рассаду — к самому бамперу, её первой достанем.','Off to the dacha! Pack it all in. Seedlings go right by the bumper — we take them out first.')
    :L('Всё на дачу! Уложи вещи так, чтобы всё влезло и крышка закрылась.','Off to the dacha! Fit everything in so the lid closes.'));
  /* --- раскладка экрана --- */
  let Lay=null;
  function layout(){const W=cv.W,H=cv.H;let best=null;
    for(let s=Math.min(78,Math.floor((W-12)/(C+1.2)));s>=22&&!best;s-=2)for(const tk of [.75,.62,.5]){const carH=s*R+s*1.5,ts=Math.max(14,Math.round(s*tk));const trayW=W-16;
      // полка: квадратные ячейки по наибольшему размеру вещи
      let x=0,y=0,rowH=0;const slots=[];for(const p of P){const md=Math.max(...p.base.map(q=>Math.max(q[0],q[1])))+1,sz=md*ts+ts*.6;if(x+sz>trayW&&x>0){x=0;y+=rowH;rowH=0;}slots.push({x,y,sz,row:0});x+=sz;rowH=Math.max(rowH,sz);}
      const trayH=y+rowH;if(carH+trayH+14<=H){best={s,ts,slots,carH,trayH};break;}}
    if(!best){const s=22,ts=12;let x=0,y=0,rowH=0;const slots=[];for(const p of P){const md=Math.max(...p.base.map(q=>Math.max(q[0],q[1])))+1,sz=md*ts+ts*.6;if(x+sz>W-16&&x>0){x=0;y+=rowH;rowH=0;}slots.push({x,y,sz});x+=sz;rowH=Math.max(rowH,sz);}best={s,ts,slots,carH:s*R+s*1.5,trayH:y+rowH};}
    const s=best.s;best.gx=Math.round((W-C*s)/2);best.gy=Math.round(s*.55);
    // ряды полки — по центру
    const rows={};best.slots.forEach(sl=>{(rows[sl.y]=rows[sl.y]||[]).push(sl);});
    const ty=best.carH+10+Math.max(0,(H-best.carH-10-best.trayH)/2);for(const y in rows){const r=rows[y],w=r.reduce((a,sl)=>a+sl.sz,0);let x=(W-w)/2;for(const sl of r){sl.X=x;sl.Y=ty+sl.y;x+=sl.sz;}}
    Lay=best;}
  cv.onFit(()=>{layout();draw();});
  /* где лежит вещь на полке: левый верх её клеток и масштаб */
  function trayPos(p){const sl=Lay.slots[p.k],ts=Lay.ts,mx=Math.max(...p.s.map(q=>q[0]))+1,my=Math.max(...p.s.map(q=>q[1]))+1;return {x:sl.X+(sl.sz-mx*ts)/2,y:sl.Y+(sl.sz-my*ts)/2,s:ts};}
  function cellsAt(p,ax,ay){return p.s.map(([x,y])=>[x+ax,y+ay]);}
  function why(p,ax,ay){for(const [x,y] of cellsAt(p,ax,ay)){if(x<0||y<0||x>=C||y>=R)return 'out';const v=grid[y*C+x];if(v>=0&&v!==p.i)return 'busy';}
    if(p.fr&&!cellsAt(p,ax,ay).some(([x,y])=>y===R-1))return 'seed';return '';}
  function put(p,ax,ay){cellsAt(p,ax,ay).forEach(([x,y])=>grid[y*C+x]=p.i);p.at=[ax,ay];p.pop=1;placed++;moves++;A.snd(host,'tap');}
  function lift(p){for(let k=0;k<grid.length;k++)if(grid[k]===p.i)grid[k]=-1;p.at=null;placed--;takes++;moves++;}
  function rotate(p){if(!p||p.at)return;p.r=(p.r+1)%4;p.s=rot1(p.s);A.snd(host,'tap');draw();}
  const byI=i=>P.find(p=>p.i===i);
  /* --- ввод --- */
  let down=null;
  function hitTray(pt){for(const p of P){if(p.at)continue;const sl=Lay.slots[p.k];if(pt.x>=sl.X&&pt.x<sl.X+sl.sz&&pt.y>=sl.Y&&pt.y<sl.Y+sl.sz){
      const tp=trayPos(p);let best=p.s[0],bd=1e9;for(const q of p.s){const dd=(tp.x+(q[0]+.5)*tp.s-pt.x)**2+(tp.y+(q[1]+.5)*tp.s-pt.y)**2;if(dd<bd){bd=dd;best=q;}}return {p,cell:best};}}return null;}
  function hitGrid(pt){const s=Lay.s,x=Math.floor((pt.x-Lay.gx)/s),y=Math.floor((pt.y-Lay.gy)/s);return x>=0&&y>=0&&x<C&&y<R?[x,y]:null;}
  /* куда ляжет вещь, которую держат: клетка-«хват» под точкой */
  function heldAnchor(h){const s=Lay.s,px=h.x,py=h.y-h.lift,cx=Math.floor((px-Lay.gx)/s),cy=Math.floor((py-Lay.gy)/s);return [cx-h.cell[0],cy-h.cell[1]];}
  cv.cv.addEventListener('contextmenu',e=>{e.preventDefault();});
  cv.cv.addEventListener('pointerdown',e=>{if(!started||fin||host.paused)return;const pt=cv.pt(e);if(kb.mode!=='tray'){kb.mode='tray';kb.p=null;kbNote();}
    if(e.button===2){const p=sel>=0?byI(sel):null;if(held)rotateHeld();else if(p)rotate(p);return;}
    const t=hitTray(pt);if(t){down={x:pt.x,y:pt.y,p:t.p,cell:t.cell,from:'tray',id:e.pointerId,touch:e.pointerType==='touch'};try{cv.cv.setPointerCapture(e.pointerId);}catch(_){}return;}
    const g=hitGrid(pt);if(g){const v=grid[g[1]*C+g[0]];
      if(v>=0){const p=byI(v);down={x:pt.x,y:pt.y,p,cell:[g[0]-p.at[0],g[1]-p.at[1]],from:'grid',id:e.pointerId,touch:e.pointerType==='touch'};try{cv.cv.setPointerCapture(e.pointerId);}catch(_){}return;}
      if(sel>=0)tapPlace(byI(sel),g);}});
  cv.cv.addEventListener('pointermove',e=>{const pt=cv.pt(e);hover=pt;
    if(down&&!held&&Math.hypot(pt.x-down.x,pt.y-down.y)>8){const p=down.p;if(p.at)lift(p);sel=p.i;held={p,cell:down.cell,x:pt.x,y:pt.y,lift:down.touch?Lay.s*.9:0};}
    if(held){held.x=pt.x;held.y=pt.y;}draw();});
  let hover=null;
  function endDown(e){if(!down)return;const d=down;down=null;
    if(held){const h=held;held=null;const [ax,ay]=heldAnchor(h),w=why(h.p,ax,ay);
      if(!w&&hitGrid({x:h.x,y:h.y-h.lift})){put(h.p,ax,ay);sel=nextSel();after();}
      else{if(w==='seed'&&hitGrid({x:h.x,y:h.y-h.lift}))tipSeed();draw();}
      return;}
    // нажатие без перетаскивания
    if(d.from==='tray'){if(sel===d.p.i)rotate(d.p);else{sel=d.p.i;A.snd(host,'tap');draw();}}
    else{lift(d.p);sel=d.p.i;draw();}}
  cv.cv.addEventListener('pointerup',endDown);cv.cv.addEventListener('pointercancel',()=>{down=null;held=null;draw();});
  cv.cv.addEventListener('wheel',e=>{if(held){e.preventDefault();rotateHeld();}else if(sel>=0){e.preventDefault();rotate(byI(sel));}},{passive:false});
  function rotateHeld(){const h=held;if(!h)return;const p=h.p;const old=p.s;p.r=(p.r+1)%4;p.s=rot1(p.s);
    // хват — та же «по счёту» клетка после поворота
    const idx=old.findIndex(q=>q[0]===h.cell[0]&&q[1]===h.cell[1]);const raw=old.map(([x,y])=>[-y,x]),mx=Math.min(...raw.map(q=>q[0])),my=Math.min(...raw.map(q=>q[1]));
    const r=raw[Math.max(0,idx)];h.cell=[r[0]-mx,r[1]-my];A.snd(host,'tap');draw();}
  /* «нажал вещь → нажал клетку»: ложится так, чтобы клетка была под вещью; сначала — по центру */
  function tapPlace(p,g){if(!p||p.at)return;const cx=p.s.reduce((a,q)=>a+q[0],0)/p.s.length,cy=p.s.reduce((a,q)=>a+q[1],0)/p.s.length;
    const opts=p.s.map(q=>[g[0]-q[0],g[1]-q[1],(q[0]-cx)**2+(q[1]-cy)**2]).sort((a,b)=>a[2]-b[2]);let seedBad=false;
    for(const [ax,ay] of opts){const w=why(p,ax,ay);if(!w){put(p,ax,ay);sel=nextSel();after();return;}if(w==='seed')seedBad=true;}
    if(seedBad)tipSeed();shake=.3;A.snd(host,'honk2');draw();}
  function tipSeed(){say.set('shura',L('Рассаду — к самому бамперу! Её первой достанем.','Seedlings right by the bumper! They come out first.'),'sad');shake=.3;}
  function nextSel(){const p=P.find(q=>!q.at);return p?p.i:-1;}
  function after(){VYA_top();if(placed===P.length){fin=true;winT=0;A.snd(host,'win');
      const t=tierOf(hints,takes);say.set('shura',t===3?L('Всё влезло, и рассада цела! Поехали на дачу.','It all fits and the seedlings are safe! Off we go.'):L('Влезло! Чуть повозились, но поехали.','It fits! Took a while, but off we go.'));
      setTimeout(()=>finish(),1300);}
    else if(moves>=P.length*3&&!stuckSaid&&hints===0){stuckSaid=true;say.set('shura',L('Не лезет? Нажми «Подсказка» — покажу, куда.','Won’t fit? Press “Hint” and I’ll show you.'));}
    draw();}
  function finish(){const t=tierOf(hints,takes),sc=Math.max(10,100-hints*15-takes*3);
    host.done({score:sc,tier:t,label:L('Всё влезло','All packed')+(hints?L(' · подсказок: ',' · hints: ')+hints:'')+(takes?L(' · перекладывали: ',' · re-packed: ')+takes:'')});}
  function VYA_top(){A.top(host,L('уложено ','packed ')+placed+L(' из ',' of ')+P.length);}
  /* подсказка Шуры: одна вещь — на своё место из решения (мешающие — обратно на полку) */
  function hint(){if(fin)return;if(kb.mode!=='tray'){kb.mode='tray';kb.p=null;kbNote();}let p=P.find(q=>!q.at&&q.i===sel)||P.find(q=>!q.at);if(!p){return;}
    // вещь, которая уже не на своём месте, — тоже можно поправить
    hints++;p.r=(p.r+needRot(p))%4;p.s=p.base.slice();const ax=p.sol[0],ay=p.sol[1];
    for(const [x,y] of cellsAt(p,ax,ay)){const v=grid[y*C+x];if(v>=0&&v!==p.i){const q=byI(v);lift(q);takes--;}}
    put(p,ax,ay);flash={i:p.i,t:1.2};sel=nextSel();
    say.set('shura',L(p.it.n[0]+' — вот сюда. Дальше сам!',p.it.n[1]+' goes here. Your turn!'));after();}
  const hb=row.querySelector('.vya-hint');hb.onclick=()=>hint();
  row.querySelector('.vya-rot').onclick=()=>{if(held)rotateHeld();else{if(sel<0)sel=nextSel();rotate(byI(sel));}};
  /* KEYS: клавиатура — выбрать вещь, взять, двигать по сетке, повернуть, положить */
  const freeP=()=>P.filter(p=>!p.at).sort((a,b)=>a.k-b.k);
  function fitA(p,ax,ay){const mx=Math.max(...p.s.map(q=>q[0])),my=Math.max(...p.s.map(q=>q[1]));return [A.clamp(ax,0,C-1-mx),A.clamp(ay,0,R-1-my)];}
  /* куда поставить взятую вещь: ближайшее к курсору свободное место (рассада — у бампера), иначе — просто у курсора */
  function bestA(p){let best=null,bd=1e9;for(let y=0;y<R;y++)for(let x=0;x<C;x++){if(why(p,x,y))continue;const d=(x-kb.cx)**2+(y-kb.cy)**2;if(d<bd){bd=d;best=[x,y];}}
    return best||fitA(p,kb.cx,kb.cy);}
  function kbTake(p,at){if(!p)return;sel=p.i;kb.p=p;kb.mode='hold';[kb.ax,kb.ay]=at||bestA(p);A.snd(host,'tap');kbNote();draw();}
  function kbDrop(){const p=kb.p;if(!p)return;const w=why(p,kb.ax,kb.ay);
    if(w){if(w==='seed')tipSeed();else say.set('shura',L('Сюда не лезет — подвинь или поверни.','It won’t fit here — move or rotate it.'),'sad');shake=.3;A.snd(host,'honk2');draw();return;}
    put(p,kb.ax,kb.ay);kb.cx=kb.ax;kb.cy=kb.ay;kb.p=null;kb.mode='tray';sel=nextSel();kbNote();after();}
  function kbBack(){kb.p=null;kb.mode='tray';kbNote();draw();}
  const unk=A.keys(host,(k,e)=>{if(!started||fin)return false;const d=A.dir(k),n=A.num(k);
    if(d||A.isGo(k)||n||k==='Tab')kb.used=true;
    if(A.is(k,['r','к'])){if(held)rotateHeld();else if(kb.mode==='hold'){rotate(kb.p);[kb.ax,kb.ay]=fitA(kb.p,kb.ax,kb.ay);draw();}else{if(sel<0)sel=nextSel();rotate(byI(sel));}return true;}
    if(A.is(k,['h','р'])){hint();return true;}
    if(held)return false;
    if(n){const f=freeP()[n-1];if(f){if(kb.mode==='hold')kb.p=null;kbTake(f);}return true;}
    if(kb.mode==='hold'){if(d){[kb.ax,kb.ay]=fitA(kb.p,kb.ax+d[0],kb.ay+d[1]);draw();return true;}
      if(A.isGo(k)){kbDrop();return true;}if(k==='Backspace'||k==='Delete'||A.is(k,['x','ч'])){kbBack();return true;}return false;}
    if(kb.mode==='grid'){if(d){if(d[1]>0&&kb.cy>=R-1){kb.mode='tray';if(sel<0)sel=nextSel();kbNote();draw();return true;}
        kb.cx=A.clamp(kb.cx+d[0],0,C-1);kb.cy=A.clamp(kb.cy+d[1],0,R-1);draw();return true;}
      if(A.isGo(k)){const v=grid[kb.cy*C+kb.cx];if(v>=0){const p=byI(v),at=p.at.slice();lift(p);kbTake(p,at);}else{const p=byI(sel>=0?sel:nextSel());if(p&&!p.at)kbTake(p,fitA(p,kb.cx,kb.cy));}return true;}
      if(k==='Backspace'){kb.mode='tray';kbNote();draw();return true;}return false;}
    // полка
    if(k==='Tab'||d&&d[0]){const free=freeP();if(free.length){let j=free.findIndex(p=>p.i===sel);j=j<0?0:(j+((d&&d[0]<0)||(k==='Tab'&&e&&e.shiftKey)?-1:1)+free.length)%free.length;sel=free[j].i;A.snd(host,'tap');draw();}return true;}
    if(d&&d[1]<0){kb.mode='grid';kb.cy=R-1;kb.cx=A.clamp(kb.cx,0,C-1);kbNote();draw();return true;}
    if(d)return true;
    if(A.isGo(k)){const p=byI(sel>=0?sel:nextSel());if(p&&!p.at)kbTake(p);return true;}
    return false;});
  /* --- рисование --- */
  function drawCar(){const s=Lay.s,gx=Lay.gx,gy=Lay.gy,W=C*s,H=R*s,body='#d7dbcf',bd='#9aa093';
    // кузов вокруг багажника
    c.fillStyle='rgba(0,0,0,.15)';A.rr(c,gx-s*.5+4,gy-s*.45+6,W+s,H+s*1.25,s*.5);c.fill();
    c.fillStyle=body;A.rr(c,gx-s*.5,gy-s*.45,W+s,H+s*1.25,s*.5);c.fill();c.strokeStyle=bd;c.lineWidth=2;c.stroke();
    // заднее стекло (сверху) и фонари
    c.fillStyle='#9ec9e2';A.rr(c,gx+s*.4,gy-s*.4,W-s*.8,s*.28,s*.12);c.fill();
    c.fillStyle='#e74c3c';A.rr(c,gx-s*.45,gy+H+s*.08,s*.6,s*.32,4);c.fill();A.rr(c,gx+W-s*.15,gy+H+s*.08,s*.6,s*.32,4);c.fill();
    c.fillStyle='#f39c12';c.fillRect(gx-s*.45,gy+H+s*.08,s*.18,s*.32);c.fillRect(gx+W+s*.27,gy+H+s*.08,s*.18,s*.32);
    // бампер и номер
    c.fillStyle='#b0b6b9';A.rr(c,gx-s*.6,gy+H+s*.55,W+s*1.2,s*.22,s*.1);c.fill();
    const pw=Math.min(W*.42,s*2.4),ph=s*.34;c.fillStyle='#fdfefe';A.rr(c,gx+W/2-pw/2,gy+H+s*.1,pw,ph,3);c.fill();c.strokeStyle='#333';c.lineWidth=1;c.stroke();
    c.fillStyle='#222';c.font='800 '+Math.round(ph*.7)+'px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('д 19-80 КЕ',gx+W/2,gy+H+s*.1+ph/2+1);
    // дно багажника
    c.fillStyle='#4a4f55';A.rr(c,gx-3,gy-3,W+6,H+6,s*.18);c.fill();c.fillStyle='#5b6168';c.fillRect(gx,gy,W,H);
    c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;for(let x=1;x<C;x++){c.beginPath();c.moveTo(gx+x*s,gy);c.lineTo(gx+x*s,gy+H);c.stroke();}for(let y=1;y<R;y++){c.beginPath();c.moveTo(gx,gy+y*s);c.lineTo(gx+W,gy+y*s);c.stroke();}
    // место рассады у бампера
    if(hasSeed){const sp=P.find(p=>p.fr);if(!sp.at){c.fillStyle='rgba(124,179,66,.22)';c.fillRect(gx,gy+(R-1)*s,W,s);c.fillStyle='rgba(255,255,255,.55)';c.font='700 '+Math.round(s*.22)+'px Rubik,sans-serif';c.fillText('🌱 '+L('рассада — сюда','seedlings here'),gx+W/2,gy+(R-.5)*s);}}}
  function draw(){if(!Lay)return;const W=cv.W,H=cv.H;c.clearRect(0,0,W,H);let ox=0;if(shake>0){ox=Math.sin(shake*60)*5*shake;}
    c.save();c.translate(ox,0);drawCar();const s=Lay.s;
    for(const p of P){if(!p.at)continue;let k=1;if(p.pop>0)k=1+p.pop*.08;
      c.save();if(k!==1){const cxp=Lay.gx+(p.at[0]+.5)*s,cyp=Lay.gy+(p.at[1]+.5)*s;c.translate(cxp,cyp);c.scale(k,k);c.translate(-cxp,-cyp);}
      drawItem(c,p,Lay.gx+p.at[0]*s,Lay.gy+p.at[1]*s,s,1,flash&&flash.i===p.i);c.restore();}
    // крышка закрывается на победе
    if(fin){const k=Math.min(1,winT/.7);c.fillStyle='#c9cfc2';A.rr(c,Lay.gx-4,Lay.gy-4,C*s+8,(R*s+8)*k,s*.2);c.fill();
      if(k>=1){c.fillStyle='#7d8471';c.font='800 '+Math.round(s*.45)+'px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('Закрыто!','Closed!'),Lay.gx+C*s/2,Lay.gy+R*s/2);}}
    // подсветка, куда ляжет
    if(held){const [ax,ay]=heldAnchor(held),onG=hitGrid({x:held.x,y:held.y-held.lift}),w=why(held.p,ax,ay);
      if(onG){c.fillStyle=w?'rgba(231,76,60,.35)':'rgba(255,255,255,.35)';for(const [x,y] of cellsAt(held.p,ax,ay))if(x>=0&&y>=0&&x<C&&y<R)c.fillRect(Lay.gx+x*s+2,Lay.gy+y*s+2,s-4,s-4);}}
    else if(kb.mode==='hold'&&kb.p&&!fin){const p=kb.p,w=why(p,kb.ax,kb.ay);c.fillStyle=w?'rgba(231,76,60,.4)':'rgba(255,255,255,.35)';
      for(const [x,y] of cellsAt(p,kb.ax,kb.ay))c.fillRect(Lay.gx+x*s+2,Lay.gy+y*s+2,s-4,s-4);drawItem(c,p,Lay.gx+kb.ax*s,Lay.gy+kb.ay*s,s,.8,true);}
    else if(kb.mode==='grid'&&!fin){c.strokeStyle='#ffd54f';c.lineWidth=3;c.strokeRect(Lay.gx+kb.cx*s+2,Lay.gy+kb.cy*s+2,s-4,s-4);}
    else if(hover&&sel>=0&&!fin){const g=hitGrid(hover);const p=byI(sel);if(g&&p&&!p.at&&grid[g[1]*C+g[0]]<0){c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;c.strokeRect(Lay.gx+g[0]*s+2,Lay.gy+g[1]*s+2,s-4,s-4);}}
    c.restore();
    // полка
    if(!fin){c.fillStyle='rgba(255,255,255,.35)';const y0=Math.min(...Lay.slots.map(sl=>sl.Y))-6,y1=Math.max(...Lay.slots.map(sl=>sl.Y+sl.sz))+6;A.rr(c,6,y0,W-12,y1-y0,12);c.fill();
      for(const p of P){if(p.at||(held&&held.p===p)||(kb.mode==='hold'&&kb.p===p))continue;const tp=trayPos(p);drawItem(c,p,tp.x,tp.y,tp.s,kb.mode==='grid'?.75:1,p.i===sel);}
      if(pc&&kb.used){const fr=freeP();fr.forEach((p,j)=>{if(j>8||kb.p===p)return;const sl=Lay.slots[p.k];c.fillStyle='#fff';A.rr(c,sl.X+1,sl.Y+1,17,17,4);c.fill();c.strokeStyle='#8a8370';c.lineWidth=1;c.stroke();
        c.fillStyle='#333';c.font='800 12px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(j+1),sl.X+9.5,sl.Y+10.5);});}}
    if(held){const s2=s,p=held.p;drawItem(c,p,held.x-(held.cell[0]+.5)*s2,held.y-held.lift-(held.cell[1]+.5)*s2,s2,.85,true);}}
  /* анимации: всплеск уложенной, тряска, крышка */
  const stop=A.loop(host,dt=>{let any=false;for(const p of P)if(p.pop>0){p.pop=Math.max(0,p.pop-dt*(o.calm?8:4));any=true;}
    if(shake>0){shake=Math.max(0,shake-dt);any=true;}if(flash){flash.t-=dt;if(flash.t<=0)flash=null;any=true;}if(fin&&winT<1){winT+=dt;any=true;}if(any)draw();});
  host.onQuit&&host.onQuit(()=>{stop();unk();cv.kill();});
  VYA_top();cv.fit();layout();draw();
  A.intro(host,{who:'shura',text:L('Едем на дачу! Уложи все вещи в багажник — <strong>всё должно влезть</strong>, иначе крышка не закроется.'+(hasSeed?' Ящик рассады — <strong>к самому бамперу</strong>.':''),
      'Off to the dacha! Pack everything into the trunk — <strong>it all has to fit</strong> or the lid won’t close.'+(hasSeed?' The seedlings go <strong>right by the bumper</strong>.':'')),
    hint:pc?L('Клавиши: стрелки или 1–9 — вещь, Enter — взять, стрелки — двигать, R — повернуть, Enter — положить. Или тащите мышью. Таймера нет.','Keys: arrows or 1–9 — item, Enter — take, arrows — move, R — rotate, Enter — drop. Or drag with the mouse. No timer.'):L('Тащите вещь пальцем в багажник. Нажмите вещь ещё раз — повернётся. Таймера нет.','Drag an item into the trunk. Tap it again to rotate. No timer.'),
    btn:L('Укладывать','Start packing')}).then(()=>{started=true;say.set('shura',hasSeed?L('Рассаду — к бамперу, остальное — как ляжет. Всё должно влезть!','Seedlings by the bumper, the rest wherever it fits!'):L('Всё должно влезть — крутите вещи, если не лезут.','It all has to fit — rotate items if they won’t go in.'));});
  // для автотеста стенда: где что лежит (координаты страницы)
  host.el._mga={G,grid,P,sel:()=>sel,fin:()=>fin,need:needRot,lay:()=>Lay,
    trayXY:(i)=>{const p=byI(i),tp=trayPos(p),r=cv.cv.getBoundingClientRect();return [r.left+tp.x+(p.s[0][0]+.5)*tp.s,r.top+tp.y+(p.s[0][1]+.5)*tp.s];},
    cellXY:(x,y)=>{const r=cv.cv.getBoundingClientRect();return [r.left+Lay.gx+(x+.5)*Lay.s,r.top+Lay.gy+(y+.5)*Lay.s];},
    rotRaw:(i)=>{const p=byI(i);return p.s.map(q=>q.slice());},stats:()=>({hints,takes,placed,moves}),kb:()=>({mode:kb.mode,ax:kb.ax,ay:kb.ay,cx:kb.cx,cy:kb.cy,p:kb.p?kb.p.i:-1})};}

/* бот для оболочки: k — умение 0..1 (сколько перекладываний и подсказок у живого игрока) */
function sim(o,k){const seed=(o&&o.seed)|0,G=gen(seed||1,o),r=A.rng(seed*7+3),n=G.P.length;k=k==null?.6:k;
  let takes=0,hints=0;for(let i=0;i<n;i++){if(r()>k*.95+.05)takes+=1+Math.floor(r()*2);}if(r()>k)hints+=1;if(r()>k+.3)hints+=1;
  const t=tierOf(hints,takes);return {score:Math.max(10,100-hints*15-takes*3),tier:t};}

VYMG_REG({id:ID,run,sim,gen});
})();
