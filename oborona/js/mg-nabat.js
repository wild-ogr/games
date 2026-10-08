'use strict';
/* OB:MGC (08.10) — мини-игра №9 «Колокольный набат» (id 'nabat', ритм). Набор — js/mg-ckit.js.
   Звонница на холме над деревней, три колокола. К колоколу сходится светящийся круг — коснись колокола, когда круг ляжет на обод.
   Играется БЕЗ звука: такт видно (круги, мигающие фонари на столбах, «кивок» колоколов), окно мягкое (±0,34 с, спокойно ±0,42 с);
   звук колоколов — синтез (tone), при выключенном звуке молчит. Мимо — серия сброшена, нечисть на горизонте подходит; «чисто» — отступает.
   Без промахов — «чистый звон» (extra.clean). ~45 с. */

const NB_BELL=[{n:Lg('малый','small'),r:40,f:392,col:'#5ab0ff'},{n:Lg('большой','big'),r:60,f:196,col:'#ff6a4a'},{n:Lg('средний','middle'),r:49,f:294,col:'#6ae07a'}];   // слева направо
art('mgc_bell',40,g=>{nbBellPath(g,0,-2,15,26);const gr=g.createLinearGradient(-15,0,15,0);gr.addColorStop(0,'#6a3a0c');gr.addColorStop(.35,'#f0c050');gr.addColorStop(.5,'#fff2a8');gr.addColorStop(.7,'#c08a28');gr.addColorStop(1,'#5a3008');
  g.fillStyle=gr;g.fill();g.lineWidth=1.3;g.strokeStyle='#4a2804';g.stroke();ell(g,0,14,3.4,3.4,'#5a3a1a',{lw:.8});g.strokeStyle='#8a5a14';g.lineWidth=1.4;g.beginPath();g.ellipse(0,-12,9,2.2,0,0,Math.PI);g.stroke();g.beginPath();g.ellipse(0,9,14,3,0,0,Math.PI);g.stroke();});
art('mgc_zvon',66,g=>{g.translate(0,3);drawHero(g,HERO_ART.mik,0);});   // звонарь — дед в войлочной шапке
/* силуэт колокола: x,y — середина высоты, r — полуширина у края, h — высота */
function nbBellPath(g,x,y,r,h){const t=y-h/2,b=y+h/2;g.beginPath();g.moveTo(x-r*.42,t+h*.06);g.quadraticCurveTo(x-r*.48,t-h*.02,x,t-h*.02);g.quadraticCurveTo(x+r*.48,t-h*.02,x+r*.42,t+h*.06);
  g.bezierCurveTo(x+r*.62,t+h*.4,x+r*.6,b-h*.3,x+r*.86,b-h*.1);g.quadraticCurveTo(x+r*1.06,b-h*.02,x+r,b);g.quadraticCurveTo(x,b+h*.08,x-r,b);g.quadraticCurveTo(x-r*1.06,b-h*.02,x-r*.86,b-h*.1);
  g.bezierCurveTo(x-r*.6,b-h*.3,x-r*.62,t+h*.4,x-r*.42,t+h*.06);g.closePath();}

const MG_NABAT={id:'nabat',hudIcon:'mgc_bell',barCol:['#ffe07a','#ff9a3a'],
  dur:o=>46,
  title:()=>Lg('Колокольный набат','Alarm Bells'),
  rules:()=>[['mgc_bell',Lg('К колоколу сходится светлый круг.','A glowing ring closes in on a bell.')],
    ['mgc_bell',mgkPC()?Lg('Щёлкни по колоколу (или клавиши 1 2 3), когда круг ляжет на край.','Click the bell (or keys 1 2 3) when the ring meets its rim.'):Lg('Коснись колокола, когда круг ляжет на край.','Tap the bell when the ring meets its rim.')],
    ['star',Lg('Можно без звука — смотри на круги. Чуть раньше или позже — тоже засчитаем.','Works without sound — watch the rings. A bit early or late still counts.')],
    ['wolf',Lg('Звонкий набат гонит нечисть прочь от деревни!','A clear alarm drives monsters away!')]],
  endTitle:st=>st.miss===0&&st.hit>0?Lg('Чистый звон!','Perfect ringing!'):Lg('Звон на всю округу!','The bells rang out!'),
  endLine:st=>Lg('Чисто ','Perfect ')+st.cnt[0]+' · '+Lg('хорошо ','good ')+(st.cnt[1]+st.cnt[2])+' · '+Lg('мимо ','missed ')+st.miss,
  tiers:o=>{const c=o.calm?.8:1,L=Math.min(10,o.lvl|0);return [Math.round((200+10*L)*c),Math.round((400+25*L)*c),Math.round((560+40*L)*c)];},
  extra:st=>({hit:st.hit|0,miss:st.miss|0,perf:st.cnt[0]|0,clean:st.miss===0&&st.hit>0?1:0}),
  init(st,keep){const W=st.W,H=st.H,k=st.k,wide=W>H*1.2;st.wide=wide;
    st.beamY=H*(wide?.2:.34);st.floorY=H*(wide?.8:.7);st.px0=W*(wide?.07:.06);st.px1=W*(wide?.93:.94);
    const span=st.px1-st.px0,fx=wide?[.2,.5,.8]:[.18,.5,.82],ks=wide?Math.min(H/480,span/380):Math.min(k*1.1,span/390);
    st.bells=NB_BELL.map((b,i)=>{const r=b.r*ks,rope=(i===1?18:34)*k*(wide?1.3:1)+(wide?0:H*.05);return Object.assign({},b,{i,x:st.px0+span*fx[i],top:st.beamY+rope,r,h:r*1.75,cy:st.beamY+rope+r*.9,ang:keep&&keep.bells?keep.bells[i].ang:0,av:keep&&keep.bells?keep.bells[i].av:0,fl:0});});
    st.tapR=st.bells.map(b=>Math.max(b.r*1.35,46));st.zv={x:W/2,y:st.floorY-4*k,sz:Math.max(50*k,Math.min(wide?H*.26:Math.min(130*k,H*.17),(st.floorY-(st.bells[1].top+st.bells[1].h*1.05))/.95)),pull:0,bi:1};
    if(!keep){st.notes=nbSong(st);st.hit=0;st.miss=0;st.cnt=[0,0,0];st.ring=[];st.lab=[];st.horde=nbHorde(st);st.beat=0;st.doves=nbDoves(st);}
    else{st.notes=keep.notes;st.ring=[];st.lab=[];st.horde=keep.horde;st.doves=nbDoves(st);st.cnt=keep.cnt;st.hit=keep.hit;st.miss=keep.miss;}
    st.bg=null;},
  onStart(st){st.notes=nbSong(st);st.hit=0;st.miss=0;st.cnt=[0,0,0];},
  down(st,x,y){let bi=-1,bd=1e9;st.bells.forEach((b,i)=>{const d=Math.hypot(x-b.x,(y-b.cy)*.85);if(d<st.tapR[i]+20*st.k&&d<bd){bd=d;bi=i;}});if(bi>=0)nbTap(st,bi);},
  key(st,kk){const i={'1':0,'2':1,'3':2,ArrowLeft:0,ArrowDown:1,ArrowUp:1,ArrowRight:2,a:0,s:1,d:2,'ф':0,'ы':1,'в':2}[kk];if(i==null)return false;nbTap(st,i);return true;},
  cursor:()=>'pointer',
  step(st,dt){nbStep(st,dt);},
  idle(st,dt){nbAmb(st,dt);},
  bot(st,dt,sk){nbBot(st,dt,sk);},
  draw(st,g,UI){nbDraw(st,g,UI);}};
function nbWin(st){return st.calm?[.14,.27,.42]:[.1,.2,.34];}
function nbLead(st){return st.calm?1.9:1.5;}
function nbBpm(st){return st.calm?66:Math.min(96,74+Math.min(st.lvl,8)*2.6);}
/* ноты по зерну дня: такты по 4 доли из набора «перезвонов»; восьмые — с 5-й главы, не в спокойном режиме */
function nbSong(st){const r=mgkRnd((st.o.seed||1)^0xbe11),bt=60/nbBpm(st),out=[],fast=st.lvl>=5&&!st.calm;
  const P=[[[0,1],[1,0],[2,2],[3,0]],[[0,1],[2,1]],[[0,0],[1,2],[2,1]],[[0,2],[1,2],[2,0],[3,1]],[[0,1],[1,1],[2,0],[3,2]],[[0,0],[1,0],[2,1]]],
    F=[[[0,1],[1,0],[1.5,0],[2,2],[3,1]],[[0,0],[.5,2],[1,0],[2,1],[3,1]],[[0,2],[1,0],[2,2],[2.5,2],[3,1]]];
  let t=2.2,m=0;while(t<st.dur-1.6){let pat;if(m===0)pat=[[0,1],[2,1]];else if(m%4===3&&st.lvl<3)pat=[[0,1]];else pat=fast&&r()<.35?F[(r()*F.length)|0]:P[(r()*P.length)|0];
    for(const [o,b] of pat){const nt=t+o*bt;if(nt<st.dur-1.4)out.push({t:nt,b,st:'wait'});}t+=4*bt;m++;}
  st.bt=bt;st.t0=2.2;return out;}
function nbHorde(st){const keys=['wolf','kik','upyr','lesh','chert','skel','kot'],out=[];for(let i=0;i<7;i++)out.push({key:keys[i],x:(i+.5)/7,d:.6,j:0,ph:i*1.3});return out;}
function nbDoves(st){const out=[];for(let i=0;i<4;i++)out.push({i,fly:0,ph:i*1.7});return out;}
function nbTap(st,bi){const now=st.t,W=nbWin(st),b=st.bells[bi];let best=null,bd=1e9;
  for(const n of st.notes){if(n.st!=='wait'||n.b!==bi)continue;const d=Math.abs(n.t-now);if(d<=W[2]&&d<bd){bd=d;best=n;}}
  nbRing(st,b,best?1:.35);
  if(!best){b.fl=.4;return;}
  const gr=bd<=W[0]?0:bd<=W[1]?1:2,pts=[10,6,3][gr];best.st='hit';best.g=gr;st.hit++;st.cnt[gr]++;st.combo++;st.best=Math.max(st.best,st.combo);
  const add=Math.round(pts*(1+Math.min(st.combo,20)*.05));st.score+=add;b.fl=1;
  const L=[Lg('Чисто!','Perfect!'),Lg('Хорошо!','Good!'),Lg(best.t>now?'Рановато':'Поздновато',best.t>now?'Early':'Late')][gr];
  st.lab.push({x:b.x,y:b.cy+b.h*1.05,s:L,c:['#ffe27a','#bfffb0','#ffd0b0'][gr],t:0});mgkNum(st,b.x,b.cy+b.h*.2,'+'+add,'#fff2a8');
  mgkSparks(st,b.x,b.cy+b.h*.45,st.calm?4:(gr?7:14),gr?'#ffe9a0':'#ffd23a',160,{gr:120});
  if(!st.calm){st.nfx=st.nfx||[];for(let i=0;i<(gr?1:2);i++)st.nfx.push({x:b.x+(st.fr()-.5)*b.r*1.6,y:b.cy,t:0,ph:st.fr()*TAU,c:b.col,d:st.fr()<.5});}
  if(gr===0)for(const h of st.horde){h.d=Math.min(1,h.d+.03);h.j=.4;}
  if(st.combo&&st.combo%10===0){for(const d of st.doves)if(!d.fly)d.fly=.001;if(st.live)mgkSnd('up');}}
function nbRing(st,b,force){if(st.zv){st.zv.pull=1;st.zv.bi=b.i;}b.av+=(st.calm?.35:.7)*force*(b.ang>0?-1:1)*(b.i===1?.7:1);b.fl=Math.max(b.fl,.6*force);
  st.ring.push({x:b.x,y:b.cy+b.h*.25,r:b.r,t:0,col:b.col,f:force});
  if(st.live){const f=b.f,v=.09*force;mgkTone(f,1.9,'sine',v);mgkTone(f*2.01,1.1,'sine',v*.45);mgkTone(f*2.76,.7,'sine',v*.3);mgkTone(f*5.4,.3,'sine',v*.15);mgkNoise(.05,.05*force,2400,1.5);}}
function nbAmb(st,dt){if(st.zv)st.zv.pull=Math.max(0,st.zv.pull-dt*4);if(st.nfx){for(const n of st.nfx){n.t+=dt;n.y-=40*st.k*dt;n.x+=Math.sin(n.t*4+n.ph)*20*st.k*dt;}st.nfx=st.nfx.filter(n=>n.t<1.4);}for(const b of st.bells){b.av+=-b.ang*22*dt-b.av*2.2*dt;b.ang+=b.av*dt;b.fl=Math.max(0,b.fl-dt*2.2);}
  for(const r of st.ring)r.t+=dt;st.ring=st.ring.filter(r=>r.t<.8);for(const l of st.lab)l.t+=dt;st.lab=st.lab.filter(l=>l.t<.9);
  for(const h of st.horde){h.j=Math.max(0,h.j-dt*1.5);h.ph+=dt;}for(const d of st.doves){if(d.fly){d.fly+=dt;if(d.fly>3.4)d.fly=0;}}}
function nbStep(st,dt){nbAmb(st,dt);const W=nbWin(st);st.beat=st.bt?((st.t-st.t0)/st.bt):0;
  for(const n of st.notes)if(n.st==='wait'&&st.t>n.t+W[2]){n.st='miss';st.miss++;st.combo=0;const b=st.bells[n.b];st.lab.push({x:b.x,y:b.cy+b.h*1.05,s:Lg('мимо','miss'),c:'#c8c0d8',t:0});for(const h of st.horde)h.d=Math.max(0,h.d-.05);}
  if(!st.notes.some(n=>n.st==='wait')&&st.t>3&&st.t<st.dur-.5&&st.notes.length)st.dur=Math.min(st.dur,st.t+1.2);}
/* бот: касается нужного колокола с разбросом по времени; плохой иногда пропускает */
function nbBot(st,dt,sk){const P={good:{s:.045,p:.01},avg:{s:.11,p:.06},bad:{s:.2,p:.15}}[sk]||{s:.11,p:.06};
  for(const n of st.notes){if(n.bs!=null||n.st!=='wait')continue;if(n.t-st.t>.6)break;let z=0;for(let i=0;i<6;i++)z+=st.rnd();z=(z-3)/Math.sqrt(.5);n.bs=st.rnd()<P.p?-1:n.t+z*P.s;}
  for(const n of st.notes){if(n.st==='wait'&&n.bs>0&&st.t>=n.bs){n.bs=0;nbTap(st,n.b);}}}

/* ---- рисование ---- */
function nbBg(st,dpr){const W=st.W,H=st.H,k=st.k,c=mkCanvas(W*dpr,H*dpr),g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const r=mgkRnd(4242),hz=st.floorY+H*.08;
  const S=st.skin==='hw'?['#140828','#3a1450','#a8406a','#ff8a4a']:st.skin==='ny'?['#0a1838','#24407a','#7a8ac8','#ffc8a0']:['#101a44','#3a3a7a','#c86a7a','#ffb36a'];
  let gr=g.createLinearGradient(0,0,0,hz);gr.addColorStop(0,S[0]);gr.addColorStop(.5,S[1]);gr.addColorStop(.85,S[2]);gr.addColorStop(1,S[3]);g.fillStyle=gr;g.fillRect(0,0,W,hz+2);
  for(let i=0;i<70;i++){const x=r()*W,y=r()*hz*.6;g.fillStyle='rgba(255,255,240,'+(.2+r()*.6)*(1-y/(hz*.6))+')';g.beginPath();g.arc(x,y,.6+r()*1.2,0,TAU);g.fill();}
  // месяц
  const mx=W*.86,my=H*.09,mr=20*k;g.save();g.globalAlpha=.5;g.drawImage(glowSpr('#ffe9a0'),mx-mr*3,my-mr*3,mr*6,mr*6);g.restore();g.fillStyle='#fff4c8';g.beginPath();g.arc(mx,my,mr,0,TAU);g.fill();g.fillStyle=S[0];g.beginPath();g.arc(mx+mr*.45,my-mr*.2,mr*.85,0,TAU);g.fill();
  // дальний лес и холмы
  for(const [y,amp,col] of[[hz-30*k,20*k,shade(S[1],-.3)],[hz-10*k,14*k,shade(S[1],-.5)]]){g.fillStyle=col;g.beginPath();g.moveTo(0,H);for(let x=0;x<=W+8;x+=8)g.lineTo(x,y-Math.sin(x*.008+y)*amp);g.lineTo(W,H);g.fill();}
  g.fillStyle=shade(S[1],-.62);for(let x=-10;x<W;x+=(9+r()*10)*k){const h=(14+r()*14)*k,y=hz-4*k;g.beginPath();g.moveTo(x,y);g.lineTo(x+6*k,y-h);g.lineTo(x+12*k,y);g.fill();}
  // деревня внизу: крыши с тёплыми окнами
  const vy=hz+4*k;gr=g.createLinearGradient(0,vy,0,H);gr.addColorStop(0,st.skin==='ny'?'#3a4a6a':'#1a2a1a');gr.addColorStop(1,st.skin==='ny'?'#22304a':'#0e160e');g.fillStyle=gr;g.fillRect(0,vy,W,H-vy);
  for(let i=0;i<Math.round(W/38);i++){const x=r()*W,y=vy+20*k+r()*(H-vy-40*k),s=(.6+(y-vy)/(H-vy))*k,w=34*s,h=18*s;
    g.fillStyle=st.skin==='ny'?'#2a3450':'#2a1c12';g.fillRect(x-w/2,y-h,w,h);g.fillStyle=st.skin==='ny'?'#e8f0ff':'#3a2414';g.beginPath();g.moveTo(x-w*.62,y-h);g.lineTo(x,y-h-16*s);g.lineTo(x+w*.62,y-h);g.fill();
    g.fillStyle='#ffc860';g.fillRect(x-w*.22,y-h*.7,6*s,6*s);if(r()<.5)g.fillRect(x+w*.1,y-h*.7,6*s,6*s);g.save();g.globalAlpha=.35;g.drawImage(glowSpr('#ffb040'),x-14*s,y-h-4*s,28*s,24*s);g.restore();}
  return c;}
function nbFrame(st,g){const k=st.k,W=st.W,y0=st.beamY,y1=st.floorY,x0=st.px0,x1=st.px1,pw=16*k,snow=st.skin==='ny';
  const wood=(x,y,w,h,v)=>{const gr=v?g.createLinearGradient(x,0,x+w,0):g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#5a3418');gr.addColorStop(.4,'#a8743c');gr.addColorStop(1,'#4a2a12');g.fillStyle=gr;g.fillRect(x,y,w,h);g.strokeStyle='#2e1a0a';g.lineWidth=1.5;g.strokeRect(x,y,w,h);};
  // крыша
  const ry=y0-14*k,rh=Math.min(90*k,(x1-x0)*.24,Math.max(30*k,y0-14*k-70*k)),cx=(x0+x1)/2;g.fillStyle='#4a2a14';g.beginPath();g.moveTo(x0-24*k,ry);g.lineTo(cx,ry-rh);g.lineTo(x1+24*k,ry);g.closePath();g.fill();
  const gr=g.createLinearGradient(0,ry-rh,0,ry);gr.addColorStop(0,'#8a5a2a');gr.addColorStop(1,'#5a3418');g.fillStyle=gr;g.beginPath();g.moveTo(x0-20*k,ry-3*k);g.lineTo(cx,ry-rh+3*k);g.lineTo(x1+20*k,ry-3*k);g.closePath();g.fill();
  g.strokeStyle='rgba(40,20,8,.5)';g.lineWidth=1.2;for(let i=1;i<6;i++){const q=i/6;g.beginPath();g.moveTo(x0-20*k+(cx-x0+20*k)*q,ry-3*k-(rh-6*k)*q);g.lineTo(x1+20*k-(x1+20*k-cx)*q,ry-3*k-(rh-6*k)*q);g.stroke();}
  if(snow){g.fillStyle='#f4f8ff';g.beginPath();g.moveTo(x0-22*k,ry-2*k);g.lineTo(cx,ry-rh);g.lineTo(x1+22*k,ry-2*k);g.lineTo(x1+10*k,ry+4*k);g.lineTo(cx,ry-rh+10*k);g.lineTo(x0-10*k,ry+4*k);g.closePath();g.fill();}
  // маковка
  const my=ry-rh,mr=Math.min(22*k,rh*.32);wood(cx-5*k,my-mr*.9,10*k,mr,1);g.save();g.translate(cx,my-mr*1.6);const mg=g.createRadialGradient(-mr*.3,-mr*.3,1,0,0,mr);mg.addColorStop(0,'#fff2a0');mg.addColorStop(.6,'#e8a820');mg.addColorStop(1,'#8a5a08');g.fillStyle=mg;
  g.beginPath();g.moveTo(0,-mr*1.3);g.bezierCurveTo(mr*.3,-mr*.7,mr*1.05,-mr*.4,mr*.8,mr*.25);g.quadraticCurveTo(0,mr*.6,-mr*.8,mr*.25);g.bezierCurveTo(-mr*1.05,-mr*.4,-mr*.3,-mr*.7,0,-mr*1.3);g.fill();g.strokeStyle='#5a3a06';g.lineWidth=1.4;g.stroke();g.restore();
  // столбы, балка, пол, перила
  wood(x0-pw/2,y0-14*k,pw,y1-y0+14*k,1);wood(x1-pw/2,y0-14*k,pw,y1-y0+14*k,1);wood(x0-26*k,y0-14*k,x1-x0+52*k,16*k,0);
  wood(x0-30*k,y1,x1-x0+60*k,14*k,0);
  // подкосы
  g.strokeStyle='#5a3418';g.lineWidth=7*k;g.beginPath();g.moveTo(x0,y0+40*k);g.lineTo(x0+40*k,y0+2*k);g.moveTo(x1,y0+40*k);g.lineTo(x1-40*k,y0+2*k);g.stroke();}
function nbRail(st,g){const k=st.k,x0=st.px0-30*k,x1=st.px1+30*k,y1=st.floorY,h=Math.max(34*k,st.zv.sz*.32),bw=8*k;
  const gr=g.createLinearGradient(0,y1-h-8*k,0,y1-h+6*k);gr.addColorStop(0,'#b07a40');gr.addColorStop(1,'#5a3418');
  for(let x=x0+10*k;x<x1-4*k;x+=Math.max(20*k,h*.55)){const gb=g.createLinearGradient(x-bw/2,0,x+bw/2,0);gb.addColorStop(0,'#5a3418');gb.addColorStop(.5,'#b07a40');gb.addColorStop(1,'#4a2a12');g.fillStyle=gb;
    g.beginPath();g.moveTo(x-bw/2,y1);g.quadraticCurveTo(x-bw,y1-h*.5,x-bw/2,y1-h);g.lineTo(x+bw/2,y1-h);g.quadraticCurveTo(x+bw,y1-h*.5,x+bw/2,y1);g.fill();g.strokeStyle='#2e1a0a';g.lineWidth=1.2;g.stroke();}
  g.fillStyle=gr;mgkRR(g,x0,y1-h-8*k,x1-x0,14*k,5*k);g.fill();g.strokeStyle='#2e1a0a';g.lineWidth=1.5;g.stroke();
  if(st.skin==='ny'){g.fillStyle='#f4f8ff';mgkRR(g,x0,y1-h-12*k,x1-x0,6*k,3*k);g.fill();}}
function nbRopes(st,g){const k=st.k,z=st.zv,hx=z.x,hy=z.y-z.sz*.62;for(const b of st.bells){const a=b.ang*.35,cx=b.x+Math.sin(a)*b.h*1.0,cy=b.top+b.h*.98;const pl=z.pull&&z.bi===b.i?z.pull*10*k:0;
    g.strokeStyle='#5a3a1a';g.lineWidth=4*k;g.beginPath();g.moveTo(cx,cy);g.quadraticCurveTo((cx+hx)/2,Math.max(cy,hy)+30*k-pl*2,hx+(b.i-1)*14*k,hy+pl);g.stroke();
    g.strokeStyle='#c9a36a';g.lineWidth=2.2*k;g.stroke();}}
function nbZvon(st,g){const z=st.zv,k=st.k,p=z.pull,dx=(z.bi-1)*8*k*p;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(z.x,z.y,z.sz*.32,z.sz*.07,0,0,TAU);g.fill();
  mgkPut(g,'mgc_zvon',z.x+dx,z.y-z.sz*.48+p*4*k,z.sz,{sy:1-p*.06,sx:1+p*.03,rot:(z.bi-1)*.06*p});}
function nbBell(st,g,b){const k=st.k;g.save();g.translate(b.x,b.top);g.rotate(b.ang*.35);
  // верёвка/ухо
  g.strokeStyle='#c9a36a';g.lineWidth=3*k;g.beginPath();g.moveTo(0,-(b.top-st.beamY));g.lineTo(0,0);g.stroke();
  const h=b.h,r=b.r,y=h*.5;if(b.fl>0){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=b.fl*.6;g.drawImage(glowSpr('#ffd860'),-r*1.8,y-r*1.8,r*3.6,r*3.6);g.restore();}
  nbBellPath(g,0,y,r,h);const gr=g.createLinearGradient(-r,0,r,0);gr.addColorStop(0,'#5a3008');gr.addColorStop(.25,'#c08a28');gr.addColorStop(.42,'#ffe890');gr.addColorStop(.52,'#fff8d0');gr.addColorStop(.7,'#c8902c');gr.addColorStop(1,'#4a2804');
  g.fillStyle=gr;g.fill();g.lineWidth=2*k;g.strokeStyle='#3a2004';g.stroke();
  g.save();nbBellPath(g,0,y,r,h);g.clip();g.strokeStyle='rgba(90,50,8,.75)';g.lineWidth=2*k;for(const q of[.22,.3]){g.beginPath();g.ellipse(0,y-h/2+h*q,r*.55,r*.08,0,0,Math.PI);g.stroke();}
  for(const q of[.8,.88]){g.beginPath();g.ellipse(0,y-h/2+h*q,r*.95,r*.12,0,0,Math.PI);g.stroke();}
  g.fillStyle='rgba(90,50,8,.6)';for(let i=-3;i<=3;i++){g.beginPath();g.arc(i*r*.17,y+h*.12,1.8*k,0,TAU);g.fill();}
  if(b.fl>0){g.fillStyle='rgba(255,255,255,'+b.fl*.35+')';g.fillRect(-r*1.2,y-h,r*2.4,h*2);}g.restore();
  // язык
  g.rotate(-b.ang*.5);ell(g,0,y+h*.48,r*.14,r*.14,'#4a3a2a',{lw:1.2});g.restore();
  // ухо на балке
  g.fillStyle='#3a2410';g.fillRect(b.x-8*k,st.beamY-3*k,16*k,8*k);}
function nbDraw(st,g,UI){const W=st.W,H=st.H,k=st.k,dpr=MGCK.dpr||1;if(!st.bg)st.bg=nbBg(st,dpr);g.drawImage(st.bg,0,0,W,H);
  // нечисть на горизонте (силуэты с глазами)
  const hz=st.floorY+H*.08;for(const h of st.horde){const s=(1-h.d)*.6+.25,sz=46*k*s,x=W*h.x+Math.sin(h.ph)*4*k,y=hz-4*k-h.j*14*k*Math.sin(h.j*Math.PI*2.5);
    g.save();g.globalAlpha=.85;mgkPut(g,h.key,x,y-sz*.4,sz,{a:.9});g.globalCompositeOperation='source-atop';g.restore();
    g.save();g.globalAlpha=.6;g.fillStyle='#120a1e';g.beginPath();g.ellipse(x,y,sz*.3,sz*.06,0,0,TAU);g.fill();g.restore();}
  g.save();g.globalAlpha=.55;g.fillStyle=st.skin==='ny'?'#24407a':'#2a1a3a';g.fillRect(0,hz-60*k,W,64*k);g.restore();   // дымка поверх — силуэты темнее
  nbFrame(st,g);
  // фонари на столбах — мигают в такт (виден ритм без звука)
  const bq=st.bt&&UI.ph==='play'?Math.max(0,1-(((st.t-st.t0)/st.bt)%1+1)%1*2.2):0;
  for(const x of[st.px0,st.px1]){const y=st.beamY+60*k;g.fillStyle='#2e1a0a';g.fillRect(x-9*k,y-12*k,18*k,24*k);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.45+bq*.55;g.drawImage(glowSpr('#ffb040'),x-34*k*(1+bq*.3),y-34*k*(1+bq*.3),68*k*(1+bq*.3),68*k*(1+bq*.3));g.restore();
    g.fillStyle='#ffe07a';g.fillRect(x-5*k,y-8*k,10*k,16*k);}
  // голуби на крыше
  const cx=(st.px0+st.px1)/2;for(const d of st.doves){const bx=cx+(d.i-1.5)*26*k,by=st.beamY-14*k-4*k;let x=bx,y=by-6*k,fl=0;
    if(d.fly){const q=d.fly/3.4;x=bx+Math.sin(q*TAU)*W*.3;y=by-Math.sin(q*Math.PI)*H*.15;fl=1;}mgkPut(g,'mgc_dove',x,y,(fl?26:20)*k,{fx:d.i%2?1:-1,sy:fl?1+Math.sin(st.t*20)*.15:1});}
  // колокола
  for(const b of st.bells)nbBell(st,g,b);
  nbRopes(st,g);nbZvon(st,g);nbRail(st,g);
  if(st.nfx)for(const n of st.nfx){g.save();g.globalAlpha=Math.max(0,1-n.t/1.4);nbNote(g,n.x,n.y,11*k,n.c,n.d);g.restore();}
  // волны звона
  for(const r of st.ring){const q=r.t/.8;g.save();g.globalAlpha=(1-q)*.8*r.f;g.strokeStyle='#ffe9a0';g.lineWidth=(5-q*4)*k;g.beginPath();g.arc(r.x,r.y,r.r*(1+q*1.6),0,TAU);g.stroke();g.restore();}
  // обод-цель и сходящиеся круги
  const lead=nbLead(st);
  for(const b of st.bells){const y=b.cy;g.save();g.setLineDash([5*k,5*k]);g.globalAlpha=.55;g.strokeStyle=b.col;g.lineWidth=2.2*k;g.beginPath();g.arc(b.x,y,b.r*1.08,0,TAU);g.stroke();g.restore();}
  if(UI.ph==='play')for(const n of st.notes){if(n.st!=='wait')continue;const dtn=n.t-st.t;if(dtn>lead||dtn<-.35)continue;const b=st.bells[n.b],q=Math.max(0,dtn/lead),R=b.r*1.08*(1+q*1.15),a=dtn<0?Math.max(0,1+dtn/.35):Math.min(1,(lead-dtn)/.25);
    g.save();g.globalAlpha=a;g.strokeStyle='rgba(20,10,4,.5)';g.lineWidth=(8-q*3)*k;g.beginPath();g.arc(b.x,b.cy,R,0,TAU);g.stroke();g.strokeStyle=b.col;g.lineWidth=(5.5-q*2.5)*k;g.beginPath();g.arc(b.x,b.cy,R,0,TAU);g.stroke();
    if(q<.12){g.globalCompositeOperation='lighter';g.globalAlpha=a*(1-q/.12)*.7;g.drawImage(glowSpr(b.col),b.x-R*1.3,b.cy-R*1.3,R*2.6,R*2.6);}g.restore();}
  if(st.pc)for(const b of st.bells){const y=b.top+b.h*1.12;g.save();mgkPillBox(g,b.x-15*k,y-13*k,30*k,26*k);mgkText(g,String(b.i+1),b.x,y+1,16*k,{c:'#fff3c4'});g.restore();}
  // надписи «Чисто!»
  for(const l of st.lab){const q=l.t/.9,s=st.calm?1:mgkBack(Math.min(1,l.t/.18));g.save();g.globalAlpha=q>.6?1-(q-.6)/.4:1;g.translate(l.x,l.y-q*24*k);g.scale(s,s);mgkText(g,l.s,0,0,20*k,{c:l.c});g.restore();}
  if(UI.ph==='play'&&st.t<st.t0+.2){g.globalAlpha=Math.min(1,(st.t0+.2-st.t)*2);mgkText(g,Lg('Жди круг — и бей!','Wait for the ring — then tap!'),W/2,st.floorY+30*k,21*k,{c:'#fff3c4'});g.globalAlpha=1;}}
function nbNote(g,x,y,s,col,dbl){g.fillStyle=col;g.strokeStyle='#2a1406';g.lineWidth=1.4;g.beginPath();g.ellipse(x,y,s*.55,s*.4,-.4,0,TAU);g.fill();g.stroke();
  g.fillRect(x+s*.42,y-s*1.6,s*.16,s*1.6);if(dbl){g.beginPath();g.ellipse(x+s*1.2,y-s*.2,s*.55,s*.4,-.4,0,TAU);g.fill();g.stroke();g.fillRect(x+s*1.62,y-s*1.8,s*.16,s*1.6);g.fillRect(x+s*.42,y-s*1.8,s*1.36,s*.3);}
  else{g.beginPath();g.moveTo(x+s*.58,y-s*1.6);g.quadraticCurveTo(x+s*1.3,y-s*1.1,x+s*1.1,y-s*.6);g.lineWidth=s*.18;g.strokeStyle=col;g.stroke();}}
mgcReg(MG_NABAT,{num:9,n:{ru:'Колокольный набат',en:'Alarm Bells'},icon:'mgc_bell',kind:'score'});
