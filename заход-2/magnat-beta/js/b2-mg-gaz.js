/* b2-mg-gaz.js — MG2: «🚚 Газель задом к рампе» (договор — шапка js/b2-mg-core.js; опись — js/b2-mg2.js, id 'gaz').
   Подработка «Грузчик» и «Встать за прилавок» в своей газели. Газель сама сдаёт задом; держите ◀ или ▶ — корма уходит туда, отпустили — колёса прямо.
   3 рампы: встать ровно в зелёный проём. Рекорд — время (меньше лучше): конус +2 с, «бум» о чужую машину/стену/мимо проёма +3 с и заново.
   Физика — «велосипедная» модель движка «Парковки» Выезда (VYPE: база, поворот колёс, задний свес), упрощена: газ сам, только руль. */
(function(root){'use strict';
if(!root.MG)return;
const L0=92,W0=40,LW=58,ROV=14,DMAX=.5,V=-62,RY=86,BAYS=[70,180,290];
const SAY=[['«Левее! Да моё левее!»','“More left! No, MY left!”'],['«Давай-давай-давай… стоп! Шучу, давай»','“Come on, come on… stop! Kidding, keep going”'],
  ['«Я тут постою, ты не волнуйся»','“I’ll stand right here, don’t worry”'],['«Правее! Нет, тоже не туда»','“More right! No, not there either”'],['«Зеркала — для красоты?»','“Are the mirrors just for looks?”']];
const OK=[['Ровно! Разгружаем','Spot on! Unloading'],['Как по линейке!','Like a ruler!'],['Витя аплодирует','Vitya applauds']];
let cur=null;
if(typeof window!=='undefined')['pointerup','pointercancel'].forEach(t=>window.addEventListener(t,()=>{if(cur)cur.up();}));
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null;
  const R=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  function round(){const k=s.n,bi=k===0?1:Math.floor(Math.random()*3),bx=BAYS[bi],sg=bx>=290?-1:bx<=70?1:(Math.random()<.5?-1:1);
    s.bay=bx;s.park=BAYS.filter(x=>x!==bx).map(x=>[x-24,RY,x+24,RY+86]);
    const off=(k===0?55:R(70,110))*sg;s.p={x:cl(bx+off,60,300),y:405,th:Math.PI/2+cl(-sg*R(.05,.25)*(k?1:.5),-.3,.3)};s.d=0;s.st={x:s.p.x,y:s.p.y,th:s.p.th};
    s.cones=[];const nc=k===0?0:k===1?2:3;for(let i=0;i<nc;i++)s.cones.push({x:cl(bx+R(-120,120),20,340),y:R(200,320),down:0});
    s.cones=s.cones.filter(c=>Math.abs(c.x-bx)>40||c.y>290);s.wait=.6;}
  function geo(p){const c=Math.cos(p.th),n=Math.sin(p.th),cx=p.x+(L0/2-ROV)*c,cy=p.y+(L0/2-ROV)*n,o=[];
    for(const [u,w] of [[1,1],[1,-1],[-1,-1],[-1,1],[0,1],[0,-1],[1,0],[-1,0]])o.push([cx+u*L0/2*c-w*W0/2*n,cy+u*L0/2*n+w*W0/2*c]);
    return {c,n,cx,cy,o,rx:p.x-ROV*c,ry:p.y-ROV*n};}
  function inT(g,x,y,r){const dx=x-g.cx,dy=y-g.cy,u=dx*g.c+dy*g.n,w=-dx*g.n+dy*g.c;return Math.abs(u)<=L0/2+r&&Math.abs(w)<=W0/2+r;}
  function bad(txt){s.pen+=S.warm||S.demo?0:3;sh.snd('no');s.msg={t:1,a:txt+(S.warm||S.demo?'':L(' +3 с',' +3 s')),c:'#c62828'};s.p={x:s.st.x,y:s.st.y,th:s.st.th};s.d=0;s.wait=.7;
    if(!S.demo)sh.say(T(pick(SAY)));}
  function step2(dt){const p=s.p;let want=-s.in*DMAX;s.d+=cl(want-s.d,-2.6*dt,2.6*dt);
    for(let i=0;i<3;i++){const h=dt/3;p.x+=V*Math.cos(p.th)*h;p.y+=V*Math.sin(p.th)*h;p.th+=V/LW*Math.tan(s.d)*h;}
    const g=geo(p);
    for(const q of s.park){if(g.o.some(o=>o[0]>q[0]&&o[0]<q[2]&&o[1]>q[1]&&o[1]<q[3])||[[q[0],q[3]],[q[2],q[3]]].some(o=>inT(g,o[0],o[1],0)))return bad(L('Бум! Чужая машина','Bang! Someone’s van'));}
    if(g.o.some(o=>o[0]<4||o[0]>356))return bad(L('Бум! Забор','Bang! The fence'));
    if(g.o.some(o=>o[1]>530))return bad(L('Уехали со двора','Left the yard'));
    for(const c of s.cones)if(!c.down&&inT(g,c.x,c.y,8)){c.down=1;if(!S.warm&&!S.demo)s.pen+=2;sh.snd('no');sh.fx(c.x,c.y-20,L('Конус! ','Cone! ')+(S.warm||S.demo?'':L('+2 с','+2 s')),'#c86b3c');}
    if(g.ry<=RY||g.o.some(o=>o[1]<RY-3)){const a=Math.abs(p.th-Math.PI/2),dx=Math.abs(g.rx-s.bay);
      if(dx<=13&&a<=.17){s.n++;sh.snd('coin');s.msg={t:1,a:T(pick(OK)),c:'#0a7a3a'};p.y+=RY-g.ry;s.done=.9;if(!S.demo&&s.n<3)sh.say(L('«Ещё рампа! Там коробки ждут»','“Another dock! The boxes are waiting”'));}
      else bad(dx>13?L('Мимо проёма','Missed the bay'):L('Криво встали','Parked crooked'));}}
  function bot(){const g=geo(s.p),e=g.rx-s.bay,a=s.p.th-Math.PI/2,ahead=(g.ry-RY)/300,dc=.012*e+1.2*a*(.6+ahead);s.in=dc>.07?-1:dc<-.07?1:0;}
  return {
    reset(demo){s={n:0,pen:0,tm:0,in:0,msg:null,done:0};round();},
    step(dt){if(s.msg){s.msg.t-=dt;if(s.msg.t<=0)s.msg=null;}
      if(s.done){s.done-=dt;if(s.done<=0){s.done=0;if(s.n>=3){if(S.demo)s.n=0;else{sh.end();s.done=99;return;}}round();}return;}
      if(s.wait>0){s.wait-=dt;return;}
      if(S.demo)bot();s.tm+=dt;step2(dt);if(S.st==='play'){Object.assign(S,{score:Math.round((s.tm+s.pen)*10)});if(s.tm>99){s.done=99;sh.end();}}},
    draw(c){c.fillStyle='#8d949c';c.fillRect(0,0,360,520);c.fillStyle='#a3a9b0';for(let y=200;y<520;y+=64)for(let x=(y/64%2)*30;x<360;x+=60)c.fillRect(x,y,26,3);
      c.fillStyle='#6b5b4b';c.fillRect(0,0,360,58);c.fillStyle='#fff';c.font='bold 15px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('СКЛАД · РАМПА','WAREHOUSE · DOCK'),180,14);
      c.fillStyle='#b7b0a3';c.fillRect(0,58,360,RY-58);
      for(const x of BAYS){const me=x===s.bay;c.fillStyle=me?'#3d8b4f':'#4a4038';c.fillRect(x-32,26,64,34);c.fillStyle='#1d2733';c.fillRect(x-36,RY-6,6,10);c.fillRect(x+30,RY-6,6,10);
        if(me){c.strokeStyle='#2ecc71';c.lineWidth=4;c.setLineDash([10,8]);c.strokeRect(x-26,RY,52,96);c.setLineDash([]);c.fillStyle='#fff';c.font='bold 16px sans-serif';c.fillText(L('СЮДА','HERE'),x,44);}}
      for(const q of s.park){c.fillStyle='#e9edf2';sh.rr(c,q[0],q[1],q[2]-q[0],q[3]-q[1],6);c.fill();c.fillStyle='#6d7f99';sh.rr(c,q[0]+3,q[3]-24,q[2]-q[0]-6,22,5);c.fill();}
      // Витя у проёма
      const vx=s.bay+(s.bay<300?44:-44),vy=RY+26,wv=Math.sin((S.t||0)*8)*6;c.fillStyle='#2e7d32';sh.rr(c,vx-9,vy,18,30,6);c.fill();c.fillStyle='#f2c9a5';c.beginPath();c.arc(vx,vy-8,9,0,7);c.fill();
      c.strokeStyle='#f2c9a5';c.lineWidth=5;c.beginPath();c.moveTo(vx+8,vy+6);c.lineTo(vx+16+wv,vy-14);c.stroke();
      for(const k of s.cones){c.save();c.translate(k.x,k.y);if(k.down)c.rotate(1.3);c.fillStyle='#f06a1e';c.beginPath();c.moveTo(0,-12);c.lineTo(8,8);c.lineTo(-8,8);c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(-5,-2,10,3);c.restore();}
      // газель
      const p=s.p,cs=Math.cos(p.th),sn=Math.sin(p.th);c.save();c.translate(p.x,p.y);c.rotate(p.th);
      c.fillStyle='#1d2733';for(const [u,w] of [[0,-W0/2-2],[0,W0/2-4],[LW,-W0/2-2],[LW,W0/2-4]]){c.save();c.translate(u,w+3);if(u)c.rotate(s.d);c.fillRect(-9,-3,18,6);c.restore();}
      c.fillStyle='#f4f6f8';sh.rr(c,-ROV,-W0/2,62,W0,4);c.fill();c.strokeStyle='#9aa3ad';c.lineWidth=2;c.stroke();
      c.fillStyle='#2f6fb5';sh.rr(c,-ROV+64,-W0/2+2,L0-66,W0-4,8);c.fill();c.fillStyle='#bfe3ff';c.fillRect(-ROV+L0-14,-W0/2+6,8,W0-12);
      c.fillStyle='#d32f2f';c.fillRect(-ROV-1,-W0/2+2,4,8);c.fillRect(-ROV-1,W0/2-10,4,8);
      c.restore();
      c.textAlign='center';c.font='bold 16px sans-serif';c.fillStyle='#fff';c.fillText(L('Рампа ','Dock ')+Math.min(3,s.n+1)+L(' из 3',' of 3'),300,505);
      if(s.msg){c.globalAlpha=Math.min(1,s.msg.t*2);c.fillStyle='#fff';sh.rr(c,40,236,280,42,12);c.fill();c.fillStyle=s.msg.c;c.font='bold 18px sans-serif';c.fillText(s.msg.a,180,257);c.globalAlpha=1;}
      // подсказка: стрелки по краям
      c.globalAlpha=s.in<0?.9:.35;c.fillStyle='#fff';c.beginPath();c.moveTo(14,470);c.lineTo(44,450);c.lineTo(44,490);c.fill();
      c.globalAlpha=s.in>0?.9:.35;c.beginPath();c.moveTo(346,470);c.lineTo(316,450);c.lineTo(316,490);c.fill();c.globalAlpha=1;},
    down(x){s.in=x<180?-1:1;cur=this;},up(){s.in=0;},
    key(k,up){if(k!=='ArrowLeft'&&k!=='ArrowRight')return;if(up){if((k==='ArrowLeft')===(s.in<0))s.in=0;}else s.in=k==='ArrowLeft'?-1:1;},
    peek(){return s;},ai(){if(s&&!s.done&&!(s.wait>0))bot();},
    finger(){return s?{x:s.in<0?60:s.in>0?300:180,y:470,down:!!s.in}:null;}};}
MG.game('gaz',{hero:{n:['Витя Козлов','Vitya Kozlov'],a:'🚚',c:'#2e7d32',l:['','']},
  how:['Газель сама едет задом. <b>Держите ◀ или ▶</b> — корма уходит туда. Встаньте <b>ровно в зелёный проём</b>. 3 рампы на время.','The van reverses by itself. <b>Hold ◀ or ▶</b> — the back swings that way. Park <b>straight in the green bay</b>. 3 docks against the clock.'],
  go:['«Три рампы, коробки ждут. Я машу — ты рулишь!»','“Three docks, the boxes are waiting. I wave — you steer!”'],
  hand:'hold',dur:0,demoT:9,make,btns:[['◀ '+(typeof L==='function'?L('Влево','Left'):'Влево'),'ArrowLeft'],[(typeof L==='function'?L('Вправо','Right'):'Вправо')+' ▶','ArrowRight']]});
})(typeof window!=='undefined'?window:globalThis);
