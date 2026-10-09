'use strict';
/* vy-mga: мини-игра «Регулировщик» (id 'regul', ведущий — Валерка, юный инспектор ЮИД). 05-minigames.md №6.
   Перекрёсток у двора: машины подъезжают с четырёх сторон. Нажми на дорогу — Валерка махнёт жезлом и пропустит этот поток
   (север–юг или запад–восток). Столкновений не бывает: машины ждут, пока перекрёсток освободится. Кто ждёт слишком долго —
   сердится и бибикает; скорую — пропусти сразу. Проиграть нельзя: заход кончается, когда проедут все машины (≈40–60 с).
   Звёзды: сердитых ≤1 и скорая не ждала → 3★; сердитых ≤4 (скорая ждала не больше раза) → 2★; иначе 1★.
   Клавиатура (ПК, KEYS): ↑/↓ (W/S) — пустить север–юг, ←/→ (A/D) — запад–восток, Пробел/Enter — переключить поток.
   Движок — чистые функции (eng*): им же играет бот sim(o,k). */
(function(){
if(typeof VYMG_REG!=='function'||!window.VYA)return;
const A=window.VYA,L=A.L,ID='regul';
const D=8,SL=2,STOP=D-SL,BIN=D-1,BOUT=D+1,ACC=10;   // единицы: полоса = 1, перекрёсток — квадрат 2×2 в центре
const KIND={car:{len:.95,v:4.6,pat:4.5},bus:{len:1.7,v:3.6,pat:5.5},amb:{len:1.1,v:5.6,pat:2.2}};
const axisOf=a=>a&1;   // 0 — север/юг (рукава 0,2), 1 — запад/восток (1,3)
function cfg(o){const lv=(o&&o.lvl)|0;let t=o&&o.mode==='day'?1:lv<25?0:lv<60?1:2;const calm=!!(o&&o.calm);
  return {N:[22,26,30][t],gap:[.92,.8,.7][t]*(calm?1.3:1),pat:calm?1.6:1,amb:t?2:1,bus:.14};}
/* расписание приездов от зерна: волнами — то одна ось гуще, то другая */
function plan(seed,c){const r=A.rng(seed*13+5),P=[];let t=1.2,wave=r()<.5?0:1,wt=0;
  for(let i=0;i<c.N;i++){if(t>wt+7+r()*3){wave^=1;wt=t;}
    const ax=r()<.7?wave:wave^1,arm=ax+(r()<.5?0:2);const kind=r()<c.bus?'bus':'car';P.push({t,arm,kind});t+=c.gap*(.45+r()*1.1);}
  // скорая: 1–2 раза, не в самом начале
  const idx=[];while(idx.length<c.amb){const i=Math.floor(c.N*(.3+r()*.6));if(!idx.includes(i))idx.push(i);}idx.forEach(i=>P[i].kind='amb');
  return P;}
function engNew(seed,o){const c=cfg(o);return {c,plan:plan(seed,c),pi:0,pend:[],cars:[],t:0,axis:plan(seed,c)[0].arm&1,passed:0,angry:0,ambLate:0,ambN:0,done:false,ev:[],sw:0};}
function inBox(car){return car.s>BIN-.05&&car.s-KIND[car.kind].len<BOUT;}
function engStep(E,dt){E.t+=dt;const ev=E.ev;
  while(E.pi<E.plan.length&&E.plan[E.pi].t<=E.t){const p=E.plan[E.pi++];E.pend.push({arm:p.arm,kind:p.kind,s:0,v:0,w:0,ang:false,late:false,id:E.pi});}
  // въезд на экран: если в рукаве есть место
  for(let i=0;i<E.pend.length;i++){const p=E.pend[i];const last=E.cars.filter(c=>c.arm===p.arm).reduce((m,c)=>Math.min(m,c.s-KIND[c.kind].len),99);
    if(last>.3){E.cars.push(p);E.pend.splice(i,1);i--;if(p.kind==='amb'){E.ambN++;ev.push({k:'amb',arm:p.arm});}}else{p.w+=dt;}}
  const busy=[false,false];for(const c of E.cars)if(inBox(c))busy[axisOf(c.arm)]=true;
  for(let a=0;a<4;a++){const q=E.cars.filter(c=>c.arm===a).sort((x,y)=>y.s-x.s);let ahead=null;
    for(const c of q){const K=KIND[c.kind];let lim=1e9;if(ahead)lim=ahead.s-KIND[ahead.kind].len-.28;
      const committed=c.s>STOP+.02;if(!committed){const go=E.axis===axisOf(a)&&!busy[axisOf(a)^1];if(!go)lim=Math.min(lim,STOP);}
      c.v=Math.min(K.v,c.v+ACC*dt);let ds=Math.min(c.v*dt,Math.max(0,lim-c.s));if(ds<c.v*dt-1e-6)c.v=dt>0?ds/dt:0;c.s+=ds;
      if(!committed&&c.v<.6){c.w+=dt;const pat=K.pat*(c.kind==='amb'?1:E.c.pat);
        if(c.w>pat&&!c.ang){c.ang=true;if(c.kind==='amb'){E.ambLate++;ev.push({k:'late',arm:a});}else{E.angry++;ev.push({k:'angry',arm:a});}}}
      if(c.s>STOP+.02&&!committed&&inBox(c))busy[axisOf(a)]=true;
      ahead=c;}}
  for(let i=0;i<E.cars.length;i++){const c=E.cars[i];if(c.s-KIND[c.kind].len>2*D+1){E.cars.splice(i,1);i--;E.passed++;ev.push({k:'pass'});}}
  // Валерка сам махнёт, если на закрытой оси ждут слишком долго (игрок отвлёкся) — заход всегда кончается
  if(E.auto!==false){const nd=engNeed(E),o2=E.axis^1;if(nd[o2].max>2.2&&nd[E.axis].n===0||nd[o2].max>3.2){E.axis=o2;E.sw++;ev.push({k:'auto'});}}
  if(E.passed>=E.c.N)E.done=true;}
function engSet(E,ax){if(E.axis!==ax){E.axis=ax;E.sw++;return true;}return false;}
/* кто ждёт: по оси — сумма ожиданий и есть ли скорая */
function engNeed(E){const r=[{w:0,n:0,amb:0,max:0},{w:0,n:0,amb:0,max:0}];for(const c of E.cars.concat(E.pend)){if(c.s>STOP+.02)continue;const x=r[axisOf(c.arm)];x.n++;x.w+=c.w;x.max=Math.max(x.max,c.w/(KIND[c.kind].pat*(c.kind==='amb'?1:E.c.pat)));if(c.kind==='amb')x.amb=1;}return r;}
function tierOf(E){return E.angry<=1&&E.ambLate===0?3:E.angry<=3&&E.ambLate<=1?2:1;}
function scoreOf(E){return Math.max(10,100-E.angry*6-E.ambLate*12);}
/* бот: умение k — время реакции и точность выбора */
function sim(o,k){k=k==null?.6:k;const lazy=k===0;const seed=((o&&o.seed)|0)||1,E=engNew(seed,o),r=A.rng(seed*3+1),react=.35+(1-k)*1.6;let want=E.axis,since=0,tt=0;
  for(let i=0;i<20000&&!E.done;i++){engStep(E,1/30);tt+=1/30;if(tt<.25)continue;tt=0;const nd=engNeed(E),cur=E.axis,oth=cur^1;
    let w=cur;if(nd[oth].amb&&!nd[cur].amb)w=oth;else if(nd[oth].max>.55+(1-k)*.35&&nd[oth].max>nd[cur].max)w=oth;else if(nd[cur].n===0&&nd[oth].n>0)w=oth;
    if(r()>.6+k*.4&&r()<.08)w=oth;   // промах
    if(lazy)continue;if(w!==want){want=w;since=0;}else since+=.25;if(want!==E.axis&&since>=react)engSet(E,want);}
  return {score:scoreOf(E),tier:tierOf(E)};}

function run(host,o){
  const seed=(o.seed|0)||20261009,E=engNew(seed,o);let started=false,fin=false,flash=0,said={},tw=0,wand=E.axis,finT=0;
  const root=A.root(host),say=A.sayBox(host,root),cv=A.canvas(host,root),c=cv.cx;const pc=A.pc(host);
  const note=document.createElement('div');note.className='vya-note';root.appendChild(note);
  note.innerHTML=pc?A.kc(host,'↑')+A.kc(host,'↓')+L(' — север–юг · ',' — north–south · ')+A.kc(host,'→')+L(' — запад–восток · ',' — west–east · ')+A.kc(host,L('Пробел','Space'))+L(' — переключить · или щелчок по дороге',' — switch · or click a road'):L('Нажми на дорогу — Валерка пропустит этот поток','Tap a road — Valerka lets that flow go');
  say.set('valerka',L('Я сегодня дежурный ЮИД! Показывай, кого пропускать, — я махну жезлом.','I’m on traffic duty today! Show me who to let through and I’ll wave the baton.'));
  let u=30,cx0=0,cy0=0;
  cv.onFit((W,H)=>{u=Math.max(18,Math.min(W/10.5,H/12.5));cx0=W/2;cy0=H/2;draw();});
  const P=(x,y)=>[cx0+x*u,cy0+y*u];
  function carXY(car){const s=car.s,K=KIND[car.kind],m=s-K.len/2;   // центр кузова
    switch(car.arm){case 0:return [-.5,-D+m,Math.PI];case 1:return [D-m,-.5,-Math.PI/2];case 2:return [.5,D-m,0];default:return [-D+m,.5,Math.PI/2];}}
  function setAxis(ax){if(!started||fin)return;if(engSet(E,ax)){A.snd(host,'tap');tw=0;}}
  cv.cv.addEventListener('pointerdown',e=>{if(!started||fin||host.paused)return;const p=cv.pt(e),dx=(p.x-cx0)/u,dy=(p.y-cy0)/u;
    if(Math.abs(dx)<1.3&&Math.abs(dy)<1.3||Math.hypot(dx+1.95,dy+1.95)<.8){setAxis(E.axis^1);return;}
    setAxis(Math.abs(dy)>Math.abs(dx)?0:1);});
  const unk=A.keys(host,k=>{if(!started||fin)return false;const d=A.dir(k);if(d){setAxis(d[1]?0:1);return true;}
    if(A.isGo(k)){setAxis(E.axis^1);return true;}return false;});
  const side=a=>[L('с севера','from the north'),L('с востока','from the east'),L('с юга','from the south'),L('с запада','from the west')][a];
  function events(){for(const ev of E.ev.splice(0)){
      if(ev.k==='amb'){A.snd(host,'siren');say.set('valerka',L('Скорая '+side(ev.arm)+'! Пропускаем первой!','Ambulance '+side(ev.arm)+'! Let it through first!'),'wow');flash=1;}
      else if(ev.k==='angry'){A.snd(host,'honk2');if(!said.a){said.a=1;say.set('valerka',L('Бибикают — заждались. Нажми на ту дорогу, где очередь!','They’re honking — tired of waiting. Tap the road with the queue!'),'sad');}}
      else if(ev.k==='auto'){if(!said.auto){said.auto=1;say.set('valerka',L('Ладно, сам махну! А ты нажимай на дорогу, где ждут.','Fine, I’ll wave them on! You tap the road where they wait.'));}}
      else if(ev.k==='late'){say.set('valerka',L('Скорая ждёт! В следующий раз — сразу её.','The ambulance is waiting! Next time — let it go at once.'),'sad');}
      else if(ev.k==='pass'){if(E.passed===Math.ceil(E.c.N/2)&&!said.h){said.h=1;say.set('valerka',E.angry?L('Половина проехала. Смотри, где копится очередь.','Half are through. Watch where the queue builds up.'):L('Половина проехала — и никто не сердится! Так держать.','Half are through and nobody’s cross! Keep it up.'),'happy');}}}}
  function finish(){const t=tierOf(E);host.done({score:scoreOf(E),tier:t,
      label:L('Проехало ','Passed ')+E.passed+(E.angry?L(' · сердились: ',' · cross: ')+E.angry:L(' · никто не сердился',' · nobody got cross'))+(E.ambLate?L(' · скорая ждала',' · ambulance waited'):'')});}
  function top(){A.top(host,E.passed+' / '+E.c.N+(E.angry?'  😠 '+E.angry:''));}
  /* рисование */
  function draw(){const W=cv.W,H=cv.H;c.clearRect(0,0,W,H);
    c.fillStyle='#9ccc65';c.fillRect(0,0,W,H);
    // тротуары и деревья по углам
    c.fillStyle='#d5d0c4';{const [x]=P(-1.4,0),[,y]=P(0,-1.4);c.fillRect(x,0,2.8*u,H);c.fillRect(0,y,W,2.8*u);}
    for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const [x,y]=P(sx*3.4,sy*3.6);c.fillStyle='#2e7d32';c.beginPath();c.arc(x,y,u*.8,0,7);c.fill();c.fillStyle='#43a047';c.beginPath();c.arc(x-u*.2,y-u*.2,u*.45,0,7);c.fill();}
    // дороги
    c.fillStyle='#5f6368';{const [x,y]=P(-1,-99);c.fillRect(x,0,2*u,H);const [x2,y2]=P(-99,-1);c.fillRect(0,y2,W,2*u);}
    // разметка: осевая, стоп-линии, зебры
    c.strokeStyle='#f4f6f6';c.lineWidth=Math.max(1.5,u*.07);c.setLineDash([u*.4,u*.35]);
    c.beginPath();c.moveTo(cx0,0);c.lineTo(cx0,cy0-u*1.9);c.moveTo(cx0,cy0+u*1.9);c.lineTo(cx0,H);c.moveTo(0,cy0);c.lineTo(cx0-u*1.9,cy0);c.moveTo(cx0+u*1.9,cy0);c.lineTo(W,cy0);c.stroke();c.setLineDash([]);
    c.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<5;i++){const k=-1+.2+i*.4;
      c.fillRect(cx0+k*u-u*.09,cy0-u*1.85,u*.18,u*.55);c.fillRect(cx0+k*u-u*.09,cy0+u*1.3,u*.18,u*.55);
      c.fillRect(cx0-u*1.85,cy0+k*u-u*.09,u*.55,u*.18);c.fillRect(cx0+u*1.3,cy0+k*u-u*.09,u*.55,u*.18);}
    // светофор-стрелки: зелёные на открытой оси, красные «стоп» на закрытой
    const g=E.axis;for(let a=0;a<4;a++){const open=axisOf(a)===g;const [lx,ly]=[[-.5,-SL-.12],[SL+.12,-.5],[.5,SL+.12],[-SL-.12,.5]][a];
      const [x,y]=P(lx,ly);c.save();c.translate(x,y);c.rotate([Math.PI,-Math.PI/2,0,Math.PI/2][a]);
      if(open){c.fillStyle='rgba(76,175,80,.9)';c.beginPath();c.moveTo(0,-u*.55);c.lineTo(u*.32,-u*.1);c.lineTo(-u*.32,-u*.1);c.closePath();c.fill();}
      else{c.fillStyle='rgba(229,57,53,.95)';c.fillRect(-u*.48,-u*.08,u*.96,u*.16);}c.restore();}
    // машины
    for(const car of E.cars){const [x,y,ang]=carXY(car),[px,py]=P(x,y),K=KIND[car.kind];const col=car.kind==='amb'?'#fdfefe':car.kind==='bus'?'#f4d03f':A.COL[car.id%A.COL.length];
      const pat=K.pat*(car.kind==='amb'?1:E.c.pat),wr=car.s<=STOP+.02?car.w/pat:0;
      if(wr>.6&&!car.ang){c.strokeStyle='rgba(229,57,53,'+(.4+.4*Math.sin(E.t*10))+')';c.lineWidth=3;c.beginPath();c.arc(px,py,u*.75,0,7);c.stroke();}
      A.carTop(c,px,py,u*.62,u*K.len,col,car.kind,ang);
      if(car.kind==='amb'&&Math.sin(E.t*14)>0){c.fillStyle='rgba(52,152,219,.55)';c.beginPath();c.arc(px,py,u*.6,0,7);c.fill();}
      if(car.ang&&car.s<=STOP+.02){c.fillStyle='#fff';A.rr(c,px+u*.3,py-u*.95,u*1.15,u*.5,u*.15);c.fill();c.fillStyle='#c0392b';c.font='800 '+Math.round(u*.3)+'px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('Би-би!','Beep!'),px+u*.88,py-u*.7);}}
    // невидимый хвост очереди: «+N» у края
    for(let a=0;a<4;a++){let k=E.pend.filter(p=>p.arm===a).length;for(const car of E.cars){if(car.arm!==a)continue;const [x,y]=carXY(car),[px,py]=P(x,y);if(px<-u*.3||py<-u*.3||px>W+u*.3||py>H+u*.3)k++;}
      if(!k)continue;const [bx,by]=[[cx0-u*.5,u*.5],[W-u*.6,cy0-u*.5],[cx0+u*.5,H-u*.5],[u*.6,cy0+u*.5]][a];
      c.fillStyle='rgba(192,57,43,.92)';c.beginPath();c.arc(bx,by,u*.42,0,7);c.fill();c.fillStyle='#fff';c.font='800 '+Math.round(u*.36)+'px Rubik,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('+'+k,bx,by+1);}
    // Валерка на «стакане» у угла перекрёстка, жезл — вдоль открытой оси
    const [vx,vy]=P(-1.95,-1.95);c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.arc(vx+2,vy+3,u*.62,0,7);c.fill();
    c.fillStyle='#fdfefe';c.beginPath();c.arc(vx,vy,u*.62,0,7);c.fill();c.strokeStyle='#1f3b57';c.lineWidth=2;c.stroke();
    c.fillStyle='#1f3b57';c.beginPath();c.arc(vx,vy,u*.36,0,7);c.fill();c.fillStyle='#e74c3c';c.fillRect(vx-u*.36,vy-u*.06,u*.72,u*.12);
    const wa=wand*Math.PI/2+Math.sin(tw*12)*.35*Math.max(0,1-tw*2);c.save();c.translate(vx,vy);c.rotate(wa+Math.PI);
    for(let i=0;i<5;i++){c.fillStyle=i%2?'#222':'#fff';c.fillRect(-u*.07,-u*1.2+i*u*.17,u*.14,u*.17);}c.restore();
    if(flash>0){c.fillStyle='rgba(52,152,219,'+flash*.18+')';c.fillRect(0,0,W,H);}
  }
  const stop=A.loop(host,dt=>{if(!started)return;if(!fin){engStep(E,dt);events();top();if(E.done){fin=true;A.snd(host,'win');
      const t=tierOf(E);say.set('valerka',t===3?L('Ни одной пробки! Вот это регулировка.','Not a single jam! That’s how it’s done.'):L('Все проехали! Пробки бывают — в следующий раз быстрее махнём.','Everyone’s through! Next time we’ll wave quicker.'),'happy');}}
    else{finT+=dt;if(finT>1.1&&finT<99){finT=99;finish();}}
    tw+=dt;if(wand!==E.axis){wand=E.axis;tw=0;}if(flash>0)flash=Math.max(0,flash-dt*1.5);draw();});
  host.onQuit&&host.onQuit(()=>{stop();unk();cv.kill();});
  top();cv.fit();draw();
  A.intro(host,{who:'valerka',text:L('Я дежурю на перекрёстке у двора. Нажимай на дорогу, <strong>какой поток пустить</strong>, — я махну жезлом. Долго ждать никто не любит, а <strong>скорую — сразу</strong>!','I’m on duty at the crossroads. Tap a road to <strong>choose which flow goes</strong> — I’ll wave the baton. Nobody likes waiting, and <strong>the ambulance goes first</strong>!'),
    hint:pc?L('Стрелки ↑↓ — пустить север–юг, влево/вправо — запад–восток, Пробел — переключить. Или щелчок по дороге. Столкновений не будет — машины ждут сами.','Arrows ↑↓ — north–south, ←→ — west–east, Space — switch. Or click a road. No crashes — cars wait on their own.'):L('Столкновений не будет — машины сами ждут, пока свободно.','No crashes — cars wait until it’s clear.'),
    btn:L('Встать на пост','Take the post')}).then(()=>{started=true;});
  host.el._mga={E,started:()=>started,fin:()=>fin,need:()=>engNeed(E),set:ax=>setAxis(ax),
    armXY:a=>{const r=cv.cv.getBoundingClientRect();const p=P(...[[0,-4],[4,0],[0,4],[-4,0]][a]);return [r.left+p[0],r.top+p[1]];}};}

VYMG_REG({id:ID,run,sim,eng:{engNew,engStep,engSet,engNeed,tierOf}});
})();
