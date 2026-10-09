'use strict';
/* vy-mgb: мини-игра №8 «Найди отличия» (ведущая — баба Шура). 05-minigames.md №8.
   Два рисунка одного двора — «утром» и «вечером» (рисует сама игра по зерну: дом, подъезды, стоянка с машинами «Летнего двора», газон с деревьями,
   клумбой, лавкой, песочницей, котом…). Отличаются ровно 5 вещами: машина перекрашена или уехала, кот ушёл, клумба другого цвета, на окне цветок и т. п.
   Найти все 5 — касанием/щелчком по любой из двух картинок. Без таймера. Промах — красный крестик (считаем); подсказка Шуры — одна на заход.
   Ступени: 5 найдено и промахов ≤ 2 без подсказки — 3★; промахов ≤ 5 и не больше одной подсказки — 2★; иначе — 1★. Счёт = 100 − 4×промах − 10×подсказка (не меньше 10).
   Клавиши ПК: стрелки / WASD (ЦФЫВ) — рамка по сетке 10×7 зон, Enter / пробел — «здесь отличие!» (ровно как щелчок в центр рамки: промах считается так же), H — подсказка. В 'day' раскладка одна на всех (зерно дня). Своё в сохранении: host.mem() {n: заходов, b: лучший счёт}. */
(function(){if(typeof VYMG_REG!=='function'||!window.VYB)return;
const V=window.VYB,L=V.L,PI=Math.PI,N=5,WW=100,HH=70;
/* ---------- сцена (мир 100×70) ---------- */
const CURT=['#ff8fa3','#7fb3ff','#ffd166','#9be29b','#c7a2ff','#ffffff'];
const CAT=['#f2a25a','#7d7d86','#2d2d33','#f4efe6'];
const FLW=['#ff5a6e','#ffc233','#ffffff','#ff8fc0','#9a6bff','#3f86ff'];
const BENCH=['#b8734a','#3f86ff','#4fc24a','#ff5a6e'];
const SPOTS=[[9,52],[25,51],[41,53],[59,52],[75,51],[91,52],[13,64],[30,65],[47,64],[64,65],[81,64],[94,65]];
const SLOTS=[8,19,30,70,81,92];
function scene(seed){const r=V.R(seed*31+7),pal=V.pal(),S={o:[],wall:r()<.5?0:1};
  // окна (10 штук), двери двух подъездов
  for(const wx of [6,15,24,36,45,55,64,76,85,94])S.o.push({k:'win',x:wx,y:6,cu:Math.floor(r()*CURT.length),pot:r()<.3,lit:r()<.25});
  for(const x of [30,70])S.o.push({k:'door',x,y:12.5,c:Math.floor(r()*4)});
  // машины
  const used=[];for(const x of SLOTS){if(r()<.18){S.o.push({k:'slot',x,y:32});continue;}let c;do c=Math.floor(r()*pal.length);while(used.slice(-1)[0]===c);used.push(c);
    S.o.push({k:'car',x,y:32,c,taxi:r()<.12});}
  // голуби и лужа на проезде
  S.o.push({k:'pig',x:44+r()*5,y:25+r()*4,n:2+(r()<.5?1:0)});
  S.o.push({k:'pud',x:55+r()*4,y:38,on:r()<.5});
  // газон: предметы по местам
  const items=['tree','tree','tree','bed','bench','sand','swing','bins','lamp','bike','cat'];V.mix(items,r);const sp=V.mix(SPOTS.slice(),r);
  items.forEach((k,i)=>{const [x,y]=sp[i];const o={k,x,y};
    if(k==='tree'){o.r=5.6+r()*1.2;o.au=0;o.fr=r()<.3;}if(k==='bed')o.c=Math.floor(r()*FLW.length);if(k==='bench')o.c=Math.floor(r()*BENCH.length);
    if(k==='sand')o.ball=Math.floor(r()*FLW.length);if(k==='swing')o.c=Math.floor(r()*BENCH.length);if(k==='bins')o.n=2+(r()<.5?1:0);if(k==='bike')o.c=Math.floor(r()*pal.length);
    if(k==='cat')o.c=Math.floor(r()*CAT.length);S.o.push(o);});
  return S;}
/* что может отличаться: функция вернёт {f(o) — изменить, t:[ru,en] — что изменилось} или null */
function muts(o,r,pal){const M=[];
  const other=(n,c)=>{let x;do x=Math.floor(r()*n);while(x===c);return x;};
  switch(o.k){
    case 'car':M.push({f:o=>{o.c=other(pal.length,o.c);},t:['Машину перекрасили!','The car got repainted!']},{f:o=>{o.k='slot';},t:['Одна машина уехала.','One car has left.']});break;
    case 'slot':M.push({f:o=>{o.k='car';o.c=Math.floor(r()*pal.length);},t:['Приехала новая машина.','A new car has arrived.']});break;
    case 'win':M.push({f:o=>{o.cu=other(CURT.length,o.cu);},t:['Шторки поменяли.','New curtains in the window.']},{f:o=>{o.pot=!o.pot;},t:['Цветок на окне!','A flowerpot on the sill!']});break;
    case 'door':M.push({f:o=>{o.c=(o.c+1+Math.floor(r()*3))%4;},t:['Дверь подъезда покрасили.','The entrance door was painted.']});break;
    case 'tree':M.push({f:o=>{o.au=1;},t:['Дерево пожелтело.','The tree turned yellow.']},{f:o=>{o.fr=!o.fr;},t:['Яблоки на яблоне!','Apples on the tree!']});break;
    case 'bed':M.push({f:o=>{o.c=other(FLW.length,o.c);},t:['На клумбе другие цветы.','Different flowers in the bed.']});break;
    case 'bench':M.push({f:o=>{o.c=other(BENCH.length,o.c);},t:['Лавочку покрасили.','The bench was painted.']},{f:o=>{o.k='gone';},t:['Лавочку унесли!','The bench is gone!']});break;
    case 'sand':M.push({f:o=>{o.ball=other(FLW.length,o.ball);},t:['Мячик другой.','A different ball.']});break;
    case 'swing':M.push({f:o=>{o.c=other(BENCH.length,o.c);},t:['Качели покрасили.','The swing was painted.']});break;
    case 'bins':M.push({f:o=>{o.n=o.n===2?3:2;},t:['Бачков стало иначе.','A different number of bins.']});break;
    case 'lamp':M.push({f:o=>{o.k='gone';},t:['Фонарь пропал!','The lamp post is gone!']});break;
    case 'bike':M.push({f:o=>{o.c=other(pal.length,o.c);},t:['Велосипед другой.','A different bike.']},{f:o=>{o.k='gone';},t:['Велосипед укатил.','The bike rode off.']});break;
    case 'cat':M.push({f:o=>{o.k='gone';},t:['Кот ушёл гулять.','The cat went for a walk.']},{f:o=>{o.c=other(CAT.length,o.c);},t:['Это другой кот!','That is a different cat!']});break;
    case 'pig':M.push({f:o=>{o.n=o.n===2?3:2;},t:['Голубей стало иначе.','A different number of pigeons.']});break;
    case 'pud':M.push({f:o=>{o.on=!o.on;},t:['Лужа!','A puddle!']});break;}
  return M;}
const BOX={win:[4,3.5],door:[4.5,4],car:[4,7],slot:[4,7],pig:[6,4.5],pud:[6,4],tree:[7,7],bed:[7,5.5],bench:[7,4],sand:[7,5.5],swing:[7,5],bins:[6,4],lamp:[4,5],bike:[6,4],cat:[4,4]};
function build(seed){const pal=V.pal(),A=scene(seed),r=V.R(seed*17+3),B=JSON.parse(JSON.stringify(A)),C=JSON.parse(JSON.stringify(A)),ds=[];
  const idx=V.mix(A.o.map((o,i)=>i),r);
  for(const i of idx){if(ds.length>=N)break;const o=A.o[i];const bx=BOX[o.k];if(!bx)continue;
    if(ds.some(d=>Math.hypot(d.x-o.x,(d.y-o.y)*1.3)<15))continue;
    if(o.k==='win'&&ds.some(d=>d.k==='win'))continue;   // окна — не больше одного отличия (мелкие)
    const M=muts(o,r,pal);if(!M.length)continue;const m=M[Math.floor(r()*M.length)],side=r()<.5?0:1;
    m.f(side?C.o[i]:B.o[i]);ds.push({i,k:o.k,x:o.x,y:o.y,w:bx[0]+2,h:bx[1]+2,t:m.t,side,found:false});}
  return {a:B,b:C,ds};}
/* ---------- рисование сцены ---------- */
function drawScene(g,S,u,eve){const P=V.tod('day'),pal=V.pal(),rr=V.rr,ell=V.ell;g.save();g.scale(u,u);
  // газон
  g.fillStyle=V.lg(g,0,0,0,HH,[0,P.lawn[0],1,P.lawn[1]]);g.fillRect(0,0,WW,HH);
  const fr=V.R(99);for(let i=0;i<70;i++){g.fillStyle=i%3?'rgba(255,255,255,.18)':P.fl[i%4];ell(g,fr()*WW,46+fr()*24,.45,.45);g.fill();}
  // дом
  g.fillStyle=S.wall?P.wall2:P.wall;g.fillRect(0,0,WW,15);g.fillStyle=P.roof;g.fillRect(0,0,WW,2.2);g.fillStyle='rgba(0,0,0,.06)';g.fillRect(0,13.6,WW,1.4);
  // тротуар и бордюр
  g.fillStyle=P.walk;g.fillRect(0,15,WW,5.5);g.fillStyle=P.curb;g.fillRect(0,20.2,WW,.8);
  // асфальт и разметка
  g.fillStyle=P.asph;rr(g,1,21,WW-2,22.5,2);g.fill();g.fillStyle=P.asph2;rr(g,36,21,28,22.5,0);g.fill();
  g.strokeStyle=P.mark;g.lineWidth=.45;for(const x of [2.5,13.5,24.5,35.5,64.5,75.5,86.5,97.5]){g.beginPath();g.moveTo(x,24);g.lineTo(x,40);g.stroke();}
  g.fillStyle=P.curb;g.fillRect(0,43.4,WW,.8);
  for(const o of S.o)if(o.k==='pud'&&o.on){g.fillStyle='rgba(120,170,220,.55)';ell(g,o.x,o.y,4.6,2.2,.1);g.fill();g.fillStyle='rgba(255,255,255,.45)';ell(g,o.x-1.2,o.y-.6,1.5,.5,.1);g.fill();}
  for(const o of S.o)draw1(g,o,P,pal,eve);
  if(eve){g.fillStyle='rgba(255,140,70,.13)';g.fillRect(0,0,WW,HH);}
  g.restore();}
function draw1(g,o,P,pal,eve){const rr=V.rr,ell=V.ell,x=o.x,y=o.y;
  switch(o.k){
  case 'win':{g.fillStyle=P.frame;rr(g,x-3.3,y-3,6.6,6,.6);g.fill();g.fillStyle=o.lit?P.lit:P.glass;rr(g,x-2.7,y-2.4,5.4,4.8,.4);g.fill();
    g.fillStyle=CURT[o.cu];rr(g,x-2.7,y-2.4,1.7,4.8,.4);g.fill();rr(g,x+1,y-2.4,1.7,4.8,.4);g.fill();g.fillStyle=P.frame;g.fillRect(x-.2,y-2.4,.4,4.8);
    if(o.pot){g.fillStyle='#c46a3b';rr(g,x-1.2,y+1.4,2.4,1.6,.3);g.fill();g.fillStyle='#4fc24a';ell(g,x,y+.9,1.5,1);g.fill();g.fillStyle='#ff5a6e';ell(g,x-.5,y+.6,.5,.5);g.fill();ell(g,x+.6,y+.8,.5,.5);g.fill();}break;}
  case 'door':{const dc=['#b8734a','#3f86ff','#4fc24a','#ff5a6e'][o.c];g.fillStyle='rgba(0,0,0,.12)';rr(g,x-5,y-5.6,10,1.6,.5);g.fill();g.fillStyle=P.roof;rr(g,x-5,y-6.2,10,1.5,.5);g.fill();
    g.fillStyle=dc;rr(g,x-2.6,y-4.4,5.2,6.9,.5);g.fill();g.fillStyle='rgba(255,255,255,.35)';rr(g,x-1.9,y-3.7,3.8,2.2,.3);g.fill();g.fillStyle='#ffd54a';ell(g,x+1.6,y-.6,.35,.35);g.fill();break;}
  case 'car':{const c=pal[o.c%pal.length];V.car(g,x,y,10.6,5.6,c,PI,{kind:o.taxi?'taxi':''});break;}
  case 'pig':{g.save();g.translate(x,y);g.scale(1.45,1.45);g.translate(-x,-y);for(let i=0;i<o.n;i++){const px=x+i*2.6-2.6,py=y+(i%2)*1.6;g.fillStyle='rgba(0,0,0,.12)';ell(g,px+.3,py+.5,1.2,.8);g.fill();g.fillStyle='#8f97a6';ell(g,px,py,1.25,.9);g.fill();
    g.fillStyle='#6c7484';ell(g,px+1,py-.3,.6,.55);g.fill();g.fillStyle='#ff9340';ell(g,px+1.6,py-.25,.3,.18);g.fill();}g.restore();break;}
  case 'tree':{V.tree(g,x,y,o.r,P,o.au?{col:'#f2b544',col2:'#ffd66b',fruit:o.fr?'#ff5a6e':null}:{fruit:o.fr?'#ff5a6e':null});break;}
  case 'bed':{g.fillStyle=P.trunk;ell(g,x,y,6.2,4.2);g.fill();g.fillStyle='#7a5a3e';ell(g,x,y,5.4,3.5);g.fill();const fc=FLW[o.c];
    for(let i=0;i<9;i++){const a=i/9*PI*2,rx=i%2?3.4:1.8;g.fillStyle='#4fa84a';ell(g,x+Math.cos(a)*rx,y+Math.sin(a)*rx*.6,1.1,.9);g.fill();g.fillStyle=fc;ell(g,x+Math.cos(a)*rx,y+Math.sin(a)*rx*.6-.2,.75,.75);g.fill();}
    g.fillStyle=fc;ell(g,x,y,.9,.9);g.fill();break;}
  case 'bench':{const c=BENCH[o.c];g.fillStyle='rgba(0,0,0,.15)';rr(g,x-5.4,y-1+.6,10.8,3.4,.5);g.fill();g.fillStyle='#4a4a52';g.fillRect(x-4.6,y-1.6,.8,3.8);g.fillRect(x+3.8,y-1.6,.8,3.8);
    g.fillStyle=c;for(let i=0;i<3;i++){rr(g,x-5.4,y-1.6+i*1.2,10.8,.95,.3);g.fill();}break;}
  case 'sand':{g.fillStyle='#c79a5e';rr(g,x-6,y-4.2,12,8.4,1);g.fill();g.fillStyle='#f3d79a';rr(g,x-5.2,y-3.4,10.4,6.8,.8);g.fill();
    g.fillStyle='rgba(180,140,80,.5)';ell(g,x-1.5,y+.5,2.2,1.2);g.fill();g.fillStyle=FLW[o.ball];ell(g,x+2.6,y-1,1.4,1.4);g.fill();g.fillStyle='rgba(255,255,255,.6)';ell(g,x+2.2,y-1.4,.5,.4);g.fill();break;}
  case 'swing':{const c=BENCH[o.c];g.strokeStyle='#5b6472';g.lineWidth=.8;g.beginPath();g.moveTo(x-5.5,y-3.5);g.lineTo(x+5.5,y-3.5);g.stroke();
    g.fillStyle='#5b6472';ell(g,x-5.5,y-3.5,.8,.8);g.fill();ell(g,x+5.5,y-3.5,.8,.8);g.fill();g.strokeStyle='#9aa3b0';g.lineWidth=.3;g.beginPath();g.moveTo(x-2,y-3.5);g.lineTo(x-2,y+1);g.moveTo(x+2,y-3.5);g.lineTo(x+2,y+1);g.stroke();
    g.fillStyle=c;rr(g,x-2.6,y+.4,5.2,1.8,.4);g.fill();break;}
  case 'bins':{for(let i=0;i<o.n;i++){const bx=x-(o.n-1)*1.9+i*3.8;g.fillStyle='rgba(0,0,0,.14)';rr(g,bx-1.6,y-1.6,3.6,3.6,.6);g.fill();g.fillStyle=['#3a8f5a','#3f6fb5','#7b7f8a'][i];rr(g,bx-1.6,y-2,3.2,3.4,.6);g.fill();
    g.fillStyle='rgba(255,255,255,.25)';rr(g,bx-1.2,y-1.6,2.4,.7,.3);g.fill();}break;}
  case 'lamp':{g.fillStyle='rgba(0,0,0,.15)';ell(g,x+.7,y+.9,2,1.6);g.fill();g.fillStyle='#4a5160';rr(g,x-1.2,y+1.2,2.4,1.4,.4);g.fill();g.fillStyle='#4a5160';ell(g,x,y,1.9,1.9);g.fill();g.fillStyle=eve?'#ffe18a':'#f4f1e6';ell(g,x,y,1.3,1.3);g.fill();
    if(eve){g.fillStyle='rgba(255,220,120,.25)';ell(g,x,y,4,4);g.fill();}break;}
  case 'bike':{const c=pal[o.c%pal.length];g.strokeStyle='#2a3340';g.lineWidth=.55;ell(g,x-2.6,y,1.7,1.7);g.stroke();ell(g,x+2.6,y,1.7,1.7);g.stroke();
    g.strokeStyle=c;g.lineWidth=.7;g.beginPath();g.moveTo(x-2.6,y);g.lineTo(x-.3,y-1.6);g.lineTo(x+2.6,y);g.moveTo(x-.3,y-1.6);g.lineTo(x+1.6,y-1.8);g.lineTo(x+2.6,y);g.stroke();
    g.strokeStyle='#2a3340';g.beginPath();g.moveTo(x+1.2,y-2.6);g.lineTo(x+2.2,y-2.6);g.stroke();break;}
  case 'cat':{const c=CAT[o.c],d=V.cmix(c,'#000',.25);g.fillStyle='rgba(0,0,0,.14)';ell(g,x+.4,y+.6,2.2,1.6);g.fill();g.fillStyle=c;ell(g,x,y+.3,2,1.6);g.fill();ell(g,x,y-1.6,1.4,1.3);g.fill();
    g.beginPath();g.moveTo(x-1.3,y-2.2);g.lineTo(x-.9,y-3.4);g.lineTo(x-.3,y-2.6);g.fill();g.beginPath();g.moveTo(x+1.3,y-2.2);g.lineTo(x+.9,y-3.4);g.lineTo(x+.3,y-2.6);g.fill();
    g.strokeStyle=c;g.lineWidth=.8;g.lineCap='round';g.beginPath();g.moveTo(x+1.6,y+.8);g.quadraticCurveTo(x+3.4,y+.6,x+3,y-1);g.stroke();
    g.fillStyle=d;ell(g,x-.5,y-1.6,.25,.3);g.fill();ell(g,x+.5,y-1.6,.25,.3);g.fill();break;}}}
/* ---------- игра ---------- */
const HI=[['Утром у нас один двор, вечером — другой. Найди 5 отличий!','In the morning our yard is one thing, in the evening another. Find 5 differences!'],
  ['Я за двором слежу зорко. А ты найдёшь 5 отличий?','I keep a sharp eye on this yard. Can you spot 5 differences?']];
const OK=[['Верно!','Right!'],['Глаз-алмаз!','Eagle eye!'],['Вот-вот, и я заметила.','Exactly, I noticed too.'],['Молодец!','Well done!']];
const MISS=[['Тут всё как было.','Nothing changed here.'],['Не-а, не то.','Nope, not that.'],['Присмотрись получше.','Look closer.']];
const tierOf=(miss,hint)=>miss<=2&&!hint?3:miss<=5&&hint<=1?2:1;
const scoreOf=(miss,hint)=>Math.max(10,100-miss*4-hint*10);
const __REG=({id:'otlich',
  run(host,o){V.intro(host,'shura',V.esc(L('Утром и вечером двор будто другой! Найди ','In the morning and evening the yard looks different! Find '))+'<strong>'+V.esc(L('5 отличий','5 differences'))+'</strong>'+V.esc(L(' — касайся любой из картинок. Наугад не тыкай: промахи считаю.',' — tap either picture. Don’t guess: I count misses.')),L('Стрелки или WASD — рамка, Enter — «здесь!», H — подсказка; можно и мышкой','Arrows or WASD — frame, Enter — “here!”, H — hint; or use the mouse')).then(()=>play(host,o));},
});
function play(host,o){{const seed=o.seed||1,G=build(seed),m=V.mem(host),pal=V.pal();
    const sayBox=document.createElement('div');host.el.appendChild(sayBox);
    function say(t,mood){sayBox.innerHTML=V.say(host,'shura',t,mood);}
    const S=V.stage(host,{bar:true}),g=S.g,FX=[],marks=[];let miss=0,hint=0,found=0,lock=0,over=false,lay=null,cache=[null,null],hintD=null,mt=[];
    /* KEYS: рамка клавиатуры — клетка 10×10 мира (сетка 10×7); любое отличие целиком накрывает центр своей клетки */
    const KC=10,KX=WW/KC,KY=HH/KC;let kx=4,ky=3,kOn=!!host.pc;
    const bH=S.btn('','💡 '+L('Подсказка','Hint')+(host.pc?V.kc(host,'H'):''),useHint);
    say(V.esc(L(...HI[seed%2])));host.top(L('Найдено ','Found ')+'0 / '+N);
    function layout(){const W=S.W,H=S.H,gap=10,ar=HH/WW;let w,h,pos;
      const wide=W>H*1.15;if(wide){w=Math.min((W-gap*3)/2,(H-36)/ar);h=w*ar;const x0=(W-w*2-gap)/2,y0=Math.max(26,(H-h)/2);pos=[[x0,y0],[x0+w+gap,y0]];}
      else{w=Math.min(W-16,(H-gap-72)/2/ar);h=w*ar;const x0=(W-w)/2,y0=Math.max(24,(H-h*2-gap-22)/2+20);pos=[[x0,y0],[x0,y0+h+gap+22]];}
      lay={w,h,u:w/WW,pos,wide};cache=[null,null];}
    S.resize=layout;
    function bake(i){const c=document.createElement('canvas'),d=S.d;c.width=Math.round(lay.w*d);c.height=Math.round(lay.h*d);const q=c.getContext('2d');q.scale(d,d);drawScene(q,i?G.b:G.a,lay.u,i===1);return c;}
    function hitPic(p){for(let i=0;i<2;i++){const [x,y]=lay.pos[i];if(p.x>=x&&p.x<=x+lay.w&&p.y>=y&&p.y<=y+lay.h)return {i,wx:(p.x-x)/lay.u,wy:(p.y-y)/lay.u};}return null;}
    function tap(p){if(over||host.paused)return;if(S.t<lock){return;}const h=hitPic(p);if(!h)return;
      // ближайшее ненайденное отличие, в рамку которого попали (рамка с запасом под палец ~ 22 px)
      const pad=Math.max(0,11/lay.u-2);let best=null,bd=1e9;
      for(const d of G.ds){if(d.found)continue;const dx=Math.abs(h.wx-d.x),dy=Math.abs(h.wy-d.y);if(dx<=d.w+pad&&dy<=d.h+pad){const dd=dx/d.w+dy/d.h;if(dd<bd){bd=dd;best=d;}}}
      if(best){foundD(best);return;}
      if(G.ds.some(d=>d.found&&Math.abs(h.wx-d.x)<=d.w+pad&&Math.abs(h.wy-d.y)<=d.h+pad))return;   // повторное касание найденного — не промах
      miss++;marks.push({i:h.i,x:h.wx,y:h.wy,t:S.t});V.snd(host,'honk2');V.buzz(25);mt.push(S.t);mt=mt.filter(t=>S.t-t<4);
      if(mt.length>=3){lock=S.t+1.6;mt=[];say(V.esc(L('Не тычь куда попало — глазами ищи!','Don’t just poke around — use your eyes!')),'sad');}
      else say(V.esc(L(...MISS[miss%MISS.length])));}
    function foundD(d){d.found=true;found++;if(hintD===d)hintD=null;V.snd(host,'coin');V.buzz(15);
      for(let i=0;i<2;i++){const [x,y]=lay.pos[i];if(!S.calm)V.burst(FX,x+d.x*lay.u,y+d.y*lay.u,10,['#ffd27a','#fff','#6be3b0']);}
      host.top(L('Найдено ','Found ')+found+' / '+N);say('<strong>'+V.esc(L(...OK[found%OK.length]))+'</strong> '+V.esc(L(...d.t)));
      if(found>=N){over=true;bH.disabled=true;say('<strong>'+V.esc(L('Все пять! Тебе бы в старшие по двору.','All five! You should be in charge of the yard.'))+'</strong>');V.snd(host,'win');
        if(!o.train){m.n=(m.n|0)+1;m.b=Math.max(m.b|0,scoreOf(miss,hint));}
        S.later(()=>{S.stop();host.done({score:scoreOf(miss,hint),tier:tierOf(miss,hint),label:L('5 из 5 · промахов: ','5 of 5 · misses: ')+miss+(hint?L(' · подсказка',' · hint used'):'')});},1500);}}
    function useHint(){if(over||hint>=1)return;const d=G.ds.find(x=>!x.found);if(!d)return;hint++;hintD=d;bH.disabled=true;V.snd(host,'tap');
      say(V.esc(L('Глянь вот сюда, в обведённое место…','Have a look right here, in the circle…')));}
    S.down=p=>{kOn=false;tap(p);};
    function kTap(){if(over||host.paused)return;kOn=true;tap({x:lay.pos[1][0]+(kx+.5)*KC*lay.u,y:lay.pos[1][1]+(ky+.5)*KC*lay.u});}
    S.hover=p=>{S.cursor(p&&hitPic(p)?'crosshair':'');};
    const KM={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1],'ф':[-1,0],'в':[1,0],'ц':[0,-1],'ы':[0,1]};
    V.keys(host,k=>{if(k==='h'||k==='H'||k==='р'||k==='Р'){useHint();return true;}if(over)return false;
      const mv=KM[k]||KM[String(k).toLowerCase()];if(mv){if(kOn){kx=Math.max(0,Math.min(KX-1,kx+mv[0]));ky=Math.max(0,Math.min(KY-1,ky+mv[1]));}kOn=true;return true;}
      if(k==='Enter'||k===' '){if(lay)kTap();return true;}return false;});
    S.frame=(dt,t)=>{const W=S.W,H=S.H;if(!lay)layout();g.clearRect(0,0,W,H);
      for(let i=0;i<2;i++){if(!cache[i])cache[i]=bake(i);const [x,y]=lay.pos[i];
        g.fillStyle='rgba(40,60,90,.18)';V.rr(g,x-3,y+1,lay.w+6,lay.h+6,10);g.fill();g.fillStyle='#fffdf7';V.rr(g,x-4,y-4,lay.w+8,lay.h+8,10);g.fill();
        g.save();V.rr(g,x,y,lay.w,lay.h,7);g.clip();g.drawImage(cache[i],x,y,lay.w,lay.h);
        for(const d of G.ds)if(d.found){const cx=x+d.x*lay.u,cy=y+d.y*lay.u,rx=(d.w+1)*lay.u,ry=(d.h+1)*lay.u;g.lineWidth=3.2;g.strokeStyle='#fff';V.ell(g,cx,cy,rx,ry);g.stroke();g.lineWidth=2;g.strokeStyle='#2fa84f';V.ell(g,cx,cy,rx,ry);g.stroke();}
        if(hintD){const cx=x+hintD.x*lay.u,cy=y+hintD.y*lay.u,pul=S.calm?1:1+.12*Math.sin(t*5),rx=(hintD.w+5)*lay.u*pul;g.lineWidth=3;g.setLineDash([6,5]);g.strokeStyle='#ffb020';V.ell(g,cx,cy,rx,rx*.8);g.stroke();g.setLineDash([]);}
        for(let j=marks.length-1;j>=0;j--){const mk=marks[j],a=1-(t-mk.t)/1.1;if(a<=0){marks.splice(j,1);continue;}if(mk.i!==i)continue;const cx=x+mk.x*lay.u,cy=y+mk.y*lay.u,s=9;
          g.globalAlpha=a;g.lineCap='round';g.lineWidth=5;g.strokeStyle='#fff';g.beginPath();g.moveTo(cx-s,cy-s);g.lineTo(cx+s,cy+s);g.moveTo(cx+s,cy-s);g.lineTo(cx-s,cy+s);g.stroke();
          g.lineWidth=3;g.strokeStyle='#e5484d';g.stroke();g.globalAlpha=1;}
        if(kOn&&!over){const fx=x+kx*KC*lay.u,fy=y+ky*KC*lay.u,fs=KC*lay.u;g.save();g.lineWidth=4;g.strokeStyle='rgba(255,255,255,.9)';V.rr(g,fx+2,fy+2,fs-4,fs-4,6);g.stroke();
          g.setLineDash([7,5]);g.lineWidth=2.5;g.strokeStyle='#2a6fdb';V.rr(g,fx+2,fy+2,fs-4,fs-4,6);g.stroke();g.restore();}
        g.restore();
        const lbl=i?L('🌇 Вечером','🌇 Evening'):L('🌅 Утром','🌅 Morning');V.txt(g,lbl,x+8,y-14,14,'#3c4a5c','left','#fffdf7',700);}
      // точки прогресса
      const dw=14,dx0=W/2-(N*dw)/2+dw/2,dy=lay.wide?14:Math.max(10,lay.pos[0][1]-14);
      if(lay.wide)for(let i=0;i<N;i++){g.fillStyle=i<found?'#2fa84f':'rgba(255,255,255,.75)';V.ell(g,dx0+i*dw,dy,4.5,4.5);g.fill();}
      if(host.pc&&!over){const by=lay.pos[1][1]+lay.h+18;if(by<H-6)V.txt(g,L('←↑→↓ / WASD — рамка · Enter — «здесь отличие!» · H — подсказка','←↑→↓ / WASD — frame · Enter — “here!” · H — hint'),W/2,by,12.5,'#3c4a5c','center','#fffdf7',600);}
      V.parts(g,FX,dt);};
    S.start();
    (window.__vyb||(window.__vyb={})).otlich={G,tap:(i,wx,wy)=>{const [x,y]=lay.pos[i];tap({x:x+wx*lay.u,y:y+wy*lay.u});},lay:()=>lay,st:()=>({miss,hint,found,over}),kc:()=>({kx,ky,kOn})};}}
const SIMF=(o,k)=>{const r=o.rnd||V.R(o.seed||1);const miss=Math.round((1-k)*7*r()+(r()<.3?1:0)),hint=r()<(1-k)*.5?1:0;return {score:scoreOf(miss,hint),tier:tierOf(miss,hint)};};
__REG.sim=SIMF;VYMG_REG(__REG);

})();
