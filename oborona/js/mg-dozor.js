'use strict';
/* OB:MGC (08.10) — мини-игра №4 «Ночной дозор с факелом» (id 'dozor'). Набор — js/mg-ckit.js.
   Ночь у тына: в темноте горят глаза. Веди факел пальцем — освещённая нечисть замирает, пугается за ~1 с и удирает.
   Светлячков не гони (держишь на них свет — улетят, −очки). Дошла нечисть до тына — «прорвался», −очки, серия сброшена. 60 с «до зари».
   Праздничные шкурки (mgkSkin): 'hw' «Ночь нечисти» — лиловое небо, оранжевая луна, тыквы-фонари, зелёный туман, стая нетопырей;
   'ny' «Святочный дозор» — снег, ели в снегу, гирлянда на тыне, Рождественская звезда, снегопад, святочные черти. */

/* ---- свои рисунки (art): факел и светлячок для окна «как играть» ---- */
art('mgc_torch',40,g=>{g.save();g.rotate(.32);poly(g,[-3,-2,3,-2,2.4,19,-2.4,19],'#8a5628',{lw:1.2});poly(g,[-5,-6,5,-6,4,0,-4,0],'#5a3a1a',{lw:1.1});
  g.beginPath();g.moveTo(0,-23);g.quadraticCurveTo(10,-12,7,-6);g.quadraticCurveTo(0,-1,-7,-6);g.quadraticCurveTo(-10,-12,0,-23);g.fillStyle='#ff7a1e';g.fill();g.lineWidth=1.2;g.strokeStyle='#8a2a06';g.stroke();
  g.beginPath();g.moveTo(0,-17);g.quadraticCurveTo(5,-10,3.5,-7);g.quadraticCurveTo(0,-4.5,-3.5,-7);g.quadraticCurveTo(-5,-10,0,-17);g.fillStyle='#ffe066';g.fill();g.restore();});
art('mgc_ffly',40,g=>{const gl=g.createRadialGradient(0,4,0,0,4,18);gl.addColorStop(0,'rgba(220,255,120,.9)');gl.addColorStop(1,'rgba(220,255,120,0)');g.fillStyle=gl;g.fillRect(-18,-14,36,36);
  ell(g,-6,-4,7,4,'#d8f0ff',{rot:-.5,lw:.8});ell(g,6,-4,7,4,'#d8f0ff',{rot:.5,lw:.8});ell(g,0,-2,3.4,4,'#4a3a2a',{lw:.8});ell(g,0,6,4.4,6,'#f4ff7a',{lw:.9,hl:.6});
  g.fillStyle='#222';g.beginPath();g.arc(-1.3,-3,.8,0,TAU);g.arc(1.3,-3,.8,0,TAU);g.fill();});
art('mgc_pump',40,g=>{for(const [x,r] of[[-9,10],[9,10],[0,12]])ell(g,x,2,r,13,'#f08a1e',{lw:1.3});poly(g,[-2,-12,2,-12,3,-18,-1,-19],'#4a7a2a',{lw:1});
  g.fillStyle='#ffe066';for(const d of[-1,1]){g.beginPath();g.moveTo(d*4,-3);g.lineTo(d*10,-3);g.lineTo(d*7,-8);g.closePath();g.fill();}
  g.beginPath();g.moveTo(-9,4);g.quadraticCurveTo(0,13,9,4);g.lineTo(5,6);g.lineTo(3,4);g.lineTo(0,7);g.lineTo(-3,4);g.lineTo(-5,6);g.closePath();g.fill();});

const DZ_T={   // вид нечисти: размер (px при k=1 вблизи), время испуга (с), очки, цвет глаз, глаз один?
  kot:{sz:58,need:.8,pts:10,eye:'#b8ff3a'},chert:{sz:60,need:.8,pts:10,eye:'#ff5a2a'},wolf:{sz:76,need:1,pts:15,eye:'#ffd23a'},kik:{sz:66,need:1,pts:15,eye:'#fff08a'},
  skel:{sz:68,need:1,pts:15,eye:'#ff7a3a'},upyr:{sz:70,need:1,pts:15,eye:'#ff3a3a'},koldun:{sz:70,need:1.1,pts:18,eye:'#d08aff'},
  lesh:{sz:88,need:1.4,pts:25,eye:'#8aff6a'},shatun:{sz:86,need:1.4,pts:25,eye:'#ffb23a'},liho:{sz:108,need:2.1,pts:60,eye:'#ff2a2a',one:1}};
function dzPool(st){const L=st.lvl,p=['kot','wolf','kik','chert','wolf','kot'];if(L>=1)p.push('skel','upyr');if(L>=2)p.push('lesh','koldun');if(L>=4)p.push('shatun','upyr');
  if(st.skin==='ny')p.push('chert','chert','kot');if(st.skin==='hw')p.push('upyr','skel','koldun');return p;}

const MG_DOZOR={id:'dozor',adKind:'torch',hudIcon:'trf_eye',barCol:['#8a7aff','#ff9ac0'],
  dur:o=>60,
  title:(o,st)=>{const s=st?st.skin:mgkSkin();return s==='hw'?Lg('Ночь нечисти','Night of Monsters'):s==='ny'?Lg('Святочный дозор','Yuletide Watch'):Lg('Ночной дозор','Night Watch');},
  rules:(o,st)=>[['mgc_torch',mgkPC()?Lg('Води мышкой — факел следует за ней. Нажимать не надо.','Move the mouse — the torch follows it. No clicking needed.'):Lg('Веди факел пальцем по тёмному полю.','Drag the torch across the dark field.')],
    [st&&st.skin==='ny'?'chert':'wolf',Lg('Держи свет на нечисти — испугается и убежит.','Keep the light on a monster — it gets scared and runs.')],
    ['mgc_ffly',Lg('Светлячков не гони — убирай от них огонь.','Leave the fireflies alone — keep the fire away.')],
    ['gate',Lg('Не пускай нечисть к тыну. Продержись до зари!','Don\'t let them reach the fence. Hold out till dawn!')]],
  adLabel:()=>Lg('Второй факел — за рекламу','Second torch — watch an ad'),adDone:()=>Lg('Два факела — свет шире!','Two torches — wider light!'),
  endTitle:st=>Lg('Заря занялась!','Dawn has come!'),
  endLine:st=>st.got?Lg('Прогнал нечисти: ','Monsters chased away: ')+st.got+(st.brk?Lg(' · прорвались: ',' · got through: ')+st.brk:''):'',
  tiers:o=>{const L=Math.max(0,Math.min(10,o.lvl|0)),X=[0,3,6,10],Y=[780,1086,1139,1071];let i=0;while(i<2&&L>X[i+1])i++;const A=(Y[i]+(Y[i+1]-Y[i])*(L-X[i])/(X[i+1]-X[i]))*(o.calm?.88:1);   // A ≈ средний бот (mgcBotSum)
    return [Math.round(A*.45),Math.round(A*.8),Math.round(A*1.12)];},
  extra:st=>({got:st.got|0,brk:st.brk|0,ffl:st.ffl|0}),
  onAd(st){st.rMul=1.35;},
  init(st,keep){const W=st.W,H=st.H,k=st.k;st.hy=H*(W>H?.27:.22);st.ph=Math.min(H*.17,150*k);st.palY=H-st.ph;st.zT=st.hy+24*k;st.zB=st.palY-8*k;
    st.R=(st.calm?96:82)*k*Math.max(1,Math.min(1.25,W/H*.9));st.rMul=st.rMul||(st.extra&&st.extra.ad?1.35:1);
    if(!keep){st.mon=[];st.ff=[];st.got=0;st.brk=0;st.ffl=0;st.spawnT=.6;st.touch=!st.pc;st.lx=W/2;st.ly=(st.zT+st.zB)/2;st.tx=st.lx;st.ty=st.ly;st.shake=0;st.red=0;st.dawn=0;st.idl=0;
      const nf=st.skin==='ny'?3:4;for(let i=0;i<nf;i++)st.ff.push(dzFfly(st,i));}
    else{for(const m of st.mon){m.x=m.fx*W;m.y0=st.zT+m.fy*(st.zB-st.zT);}for(const f of st.ff){f.cx=f.fx*W;f.cy=st.zT+f.fy*(st.zB-st.zT);}st.lx=Math.min(st.lx,W);st.ly=Math.min(st.ly,H);}
    st.bush=dzBushes(st);st.bg=null;st.pal=null;st.bats=st.bats||[];},
  onStart(st){st.mon=[];st.got=0;st.brk=0;st.ffl=0;st.spawnT=.5;},
  down(st,x,y,pt){st.touch=pt!=='mouse';dzAim(st,x,y);st.held=true;st.moved=1;},
  move(st,x,y,pr,pt){if(pt==='mouse'||pr){st.touch=pt!=='mouse';dzAim(st,x,y);st.moved=1;}},   // мышь: факел ходит за курсором без нажатия
  cursor:st=>st.touch===false||st.pc?'none':'default',
  up(st){st.held=false;},
  step(st,dt){dzStep(st,dt);},
  idle(st,dt){dzAmb(st,dt);if(st.end){st.dawn=Math.min(1,st.dawn+dt*.7);for(const m of st.mon)if(m.st!=='run'){m.st='run';m.rt=0;}dzMon(st,dt);}},
  bot(st,dt,sk){dzBot(st,dt,sk);},
  draw(st,g,UI){dzDraw(st,g,UI);}};
function dzAim(st,x,y){const k=st.k,off=st.touch?62*k+st.R*st.rMul*.5:st.R*st.rMul*.5;st.tx=x;st.ty=Math.max(st.hy-20*k,y-off);st.fgx=x;st.fgy=y;}
function dzFfly(st,i){const W=st.W;return {cx:(.15+st.fr()*.7)*W,cy:st.zT+(.15+st.fr()*.75)*(st.zB-st.zT),fx:0,fy:0,ph:st.fr()*TAU,sp:.5+st.fr()*.5,an:0,gone:0,x:0,y:0,a:1};}
function dzBushes(st){const r=mgkRnd((st.o.seed||1)^0x2468),W=st.W,k=st.k,n=Math.round(W*(st.zB-st.zT)/(st.W>st.H?11000:7000)),out=[];
  const keys=st.skin==='ny'?['d_snowpine','d_snowpine','d_bush','d_stump']:st.skin==='hw'?['d_dead','d_bush','d_grave','d_stump','d_pine']:['d_bush','d_pine','d_bush','d_oak','d_stump'];
  for(let i=0;i<n;i++){const q=r(),y=st.zT+(.05+q*.9)*(st.zB-st.zT),s=.55+.5*(y-st.zT)/(st.zB-st.zT);out.push({x:(i+.2+r()*.6)/n*W,y,key:keys[(r()*keys.length)|0],sz:(58+r()*40)*k*s,fx:r()<.5?-1:1});}
  return out;}
function dzScale(st,y){return st.k*(.58+.5*Math.max(0,Math.min(1,(y-st.zT)/(st.zB-st.zT))));}
/* ---- логика ---- */
function dzSpawn(st){const W=st.W,k=st.k,pool=dzPool(st);let key=pool[(st.rnd()*pool.length)|0];
  if(st.lvl>=3&&st.t>12&&!st.mon.some(m=>m.key==='liho')&&st.rnd()<.06)key='liho';
  const T=DZ_T[key];let x=0,tries=0;do{x=(.1+st.rnd()*.8)*W;tries++;}while(tries<8&&st.mon.some(m=>m.st!=='run'&&Math.abs(m.x-x)<70*k));
  const fy=st.rnd()*.32,y0=st.zT+fy*(st.zB-st.zT),slow=st.calm?1.4:1,life=Math.max(5.2,7.6-st.lvl*.15-st.t*.015)*slow*(key==='liho'?1.25:1);
  st.mon.push({key,x,y0,y:y0,fx:x/W,fy,age:0,life,prog:0,fear:0,st:'in',it:0,blink:1+st.rnd()*3,bl:0,face:st.rnd()<.5?-1:1,lit:0,sw:st.rnd()*TAU,T,rt:0,shk:0});}
function dzLight(st){return {x:st.lx,y:st.ly,r:st.R*st.rMul*(1+(st.calm?0:Math.sin(st.t*17)*.015+Math.sin(st.t*7.3)*.02))};}
function dzStep(st,dt){dzAmb(st,dt);const k=st.k;
  // факел догоняет палец (мягко — без рывков)
  const f=1-Math.exp(-dt*(st.bot?40:22));st.lx+=(st.tx-st.lx)*f;st.ly+=(st.ty-st.ly)*f;
  const n=st.mon.filter(m=>m.st!=='run').length,maxN=Math.min(7,4+Math.floor(st.lvl/3)+(st.t>25?1:0)),gap=Math.max(1.05,1.6-st.lvl*.045-st.t*.006)*(st.calm?1.35:1);
  st.spawnT-=dt;if(st.spawnT<=0&&n<maxN&&st.t<st.dur-2.5){dzSpawn(st);st.spawnT=gap*(.75+st.rnd()*.5);}
  const L=dzLight(st);
  for(const m of st.mon){if(m.st==='run')continue;const s=dzScale(st,m.y),cy=m.y-m.T.sz*s*.35,d=Math.hypot(m.x-L.x,cy-L.y),inL=d<L.r*.82+m.T.sz*s*.18;
    m.lit+=((inL?1:0)-m.lit)*Math.min(1,dt*10);
    if(inL){m.fear+=dt/(m.T.need*(st.calm?.85:1));m.shk=1;if(m.fear>=1){dzFlee(st,m);continue;}}
    else{m.fear=Math.max(0,m.fear-dt*.45);m.shk=Math.max(0,m.shk-dt*3);m.age+=dt;}
    m.prog=Math.min(1,m.age/m.life);m.y=m.y0+(st.zB+st.ph*.05-m.y0)*m.prog;
    if(m.prog>=1)dzBreach(st,m);}
  dzMon(st,dt);
  for(const fl of st.ff){if(fl.gone>0){fl.gone-=dt;if(fl.gone<=0)Object.assign(fl,dzFfly(st,0));continue;}
    const d=Math.hypot(fl.x-L.x,fl.y-L.y);if(d<L.r*.8){fl.an+=dt/(st.calm?1.4:1.05);if(fl.an>=1){fl.gone=3.5;fl.an=0;st.ffl++;dzPen(st,fl.x,fl.y,10,Lg('Светлячка спугнул!','Firefly scared!'));mgkSparks(st,fl.x,fl.y,8,'#e8ff7a',90,{gr:-40});}}
    else fl.an=Math.max(0,fl.an-dt*.8);}}
function dzAmb(st,dt){const W=st.W;for(const fl of st.ff){if(fl.gone>0)continue;fl.ph+=dt*fl.sp;fl.x=fl.cx+Math.sin(fl.ph*1.3)*38*st.k+Math.sin(fl.ph*.47)*24*st.k;fl.y=fl.cy+Math.sin(fl.ph*1.9+1)*18*st.k;}
  st.shake=Math.max(0,st.shake-dt*2.5);st.red=Math.max(0,st.red-dt*1.6);
  if(st.skin==='hw'&&st.live){if(!st.bats.length||st.bats[st.bats.length-1].t>6){const n=5+((st.fr()*4)|0),y=st.hy*(.15+st.fr()*.35);for(let i=0;i<n;i++)st.bats.push({t:-i*.18,x:-30-i*22-st.fr()*20,y:y+st.fr()*30-15,v:70+st.fr()*30,ph:st.fr()*TAU});}
    for(const b of st.bats){b.t+=dt;b.x+=b.v*dt*st.k;b.ph+=dt*14;}st.bats=st.bats.filter(b=>b.x<W+40);}
  if(st.skin==='ny'&&st.live){st.snow=st.snow||[];while(st.snow.length<(st.lite?40:90))st.snow.push({x:st.fr()*W,y:st.fr()*st.H,v:18+st.fr()*30,r:1+st.fr()*2.2,ph:st.fr()*TAU});
    for(const s of st.snow){s.y+=s.v*dt*st.k;s.ph+=dt;s.x+=Math.sin(s.ph)*10*dt;if(s.y>st.H+4){s.y=-4;s.x=st.fr()*W;}}}}
function dzMon(st,dt){for(const m of st.mon){m.it+=dt;m.blink-=dt;if(m.blink<0){m.bl=.14;m.blink=1.6+st.fr()*3;}m.bl=Math.max(0,m.bl-dt);if(m.st==='in'&&m.it>.5)m.st='lurk';if(m.st==='run')m.rt+=dt;if(m.st==='brk')m.rt+=dt;}
  st.mon=st.mon.filter(m=>!((m.st==='run'&&m.rt>.9)||(m.st==='brk'&&m.rt>.6)));}
function dzFlee(st,m){m.st='run';m.rt=0;st.combo++;st.best=Math.max(st.best,st.combo);st.got++;const add=Math.round(m.T.pts*(1+Math.min(st.combo-1,10)*.1));st.score+=add;
  const s=dzScale(st,m.y),cy=m.y-m.T.sz*s*.4;mgkPuff(st,m.x,cy,m.T.sz*s*.55);mgkSparks(st,m.x,cy,st.calm?4:9,'#ffe27a',150,{gr:120});
  mgkNum(st,m.x,cy-m.T.sz*s*.4,'+'+add,m.key==='liho'?'#ffcf3a':'#fff2a8',m.key==='liho');if(st.live){mgkSnd('kill');if(st.combo%5===0)mgkSnd('coin');if(m.key==='liho')mgkSnd('star',2);}}
function dzBreach(st,m){m.st='brk';m.rt=0;st.brk++;st.combo=0;st.ev.push({t:st.t,s:Lg('Прорвался!','Got through!'),x:m.x,y:st.palY});if(!st.calm)st.shake=1;st.red=1;if(st.live)mgkSnd('leak');}
function dzPen(st,x,y,n,txt){st.score=Math.max(0,st.score-n);st.combo=0;mgkNum(st,x,y-10*st.k,'−'+n,'#ff9a8a');if(txt)st.ev.push({t:st.t,s:txt,x,y});}
/* ---- бот: ведёт факел к самой «срочной» нечисти; плохой — медленно и задевает светлячков ---- */
function dzBot(st,dt,sk){const P={good:{v:900,e:.08,ff:1,nt:.3,idle:0},avg:{v:420,e:.35,ff:.6,nt:1,idle:.15},bad:{v:240,e:.6,ff:.15,nt:2,idle:.35}}[sk]||{v:420,e:.35,ff:.6,nt:1,idle:.15},alive=m=>m&&m.st!=='run'&&m.st!=='brk'&&m.it>P.nt;
  st.bi=(st.bi||0)-dt;if(st.bi<=0){st.bi=1.5;st.bidle=st.rnd()<P.idle;}if(st.bidle)return;
  let m=st.btg;const urgent=st.mon.filter(alive).sort((a,b)=>(a.life-a.age)-(b.life-b.age))[0];
  if(!alive(m)||(urgent&&urgent!==m&&urgent.life-urgent.age<1.3&&m.fear<.5)){m=st.btg=urgent;st.boff=[(st.rnd()-.5)*2*P.e,(st.rnd()-.5)*2*P.e];}
  if(!m)return;st.bj=(st.bj||0)-dt;if(st.bj<=0){st.bj=.5;st.boff=[(st.rnd()-.5)*2*P.e,(st.rnd()-.5)*2*P.e];}
  const s=dzScale(st,m.y),R=st.R*st.rMul;let gx=m.x+st.boff[0]*R,gy=m.y-m.T.sz*s*.35+st.boff[1]*R;
  if(st.rnd()<P.ff)for(const fl of st.ff)if(!fl.gone&&Math.hypot(fl.x-gx,fl.y-gy)<R*.9){gx+=(gx-fl.x)*.6;gy+=(gy-fl.y)*.6;}
  const d=Math.hypot(gx-st.tx,gy-st.ty),st2=P.v*dt;if(d>st2){st.tx+=(gx-st.tx)/d*st2;st.ty+=(gy-st.ty)/d*st2;}else{st.tx=gx;st.ty=gy;}}
/* ---- рисование ---- */
function dzPal(st){const s=st.skin;return s==='hw'?{s0:'#12061f',s1:'#3a1450',s2:'#7a2f6a',f:['#1a0b26','#140820','#0e0618'],fld0:'#1c1a2a',fld1:'#0c0a14',moon:'#ffb347',moonG:'#ff8a1e',dk:'8,4,18',mist:'rgba(120,255,140,.10)'}
  :s==='ny'?{s0:'#06122e',s1:'#16336a',s2:'#3a5f9a',f:['#1a3054','#122440','#0b1830'],fld0:'#8aa3c8',fld1:'#5a7398',moon:'#f4f8ff',moonG:'#bcd6ff',dk:'6,12,30',mist:'rgba(200,225,255,.08)'}
  :{s0:'#060c22',s1:'#14254f',s2:'#2a3f72',f:['#14223d','#0f1a30','#0a1324'],fld0:'#22341f',fld1:'#101a10',moon:'#fff4c8',moonG:'#ffe9a0',dk:'4,7,20',mist:'rgba(170,200,255,.07)'};}
function dzBg(st,dpr){const W=st.W,H=st.H,k=st.k,P=dzPal(st),c=mkCanvas(W*dpr,H*dpr),g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const r=mgkRnd((st.o.seed||1)^0x1357);
  let gr=g.createLinearGradient(0,0,0,st.hy);gr.addColorStop(0,P.s0);gr.addColorStop(.7,P.s1);gr.addColorStop(1,P.s2);g.fillStyle=gr;g.fillRect(0,0,W,st.hy+2);
  // звёзды
  for(let i=0;i<Math.round(W*st.hy/2600);i++){const x=r()*W,y=r()*st.hy*.92,s=r();g.fillStyle='rgba(255,255,240,'+(.25+s*.6)+')';g.beginPath();g.arc(x,y,.5+s*1.3,0,TAU);g.fill();}
  // луна
  const mx=W*(W>H?.78:.6),my=Math.max(st.hy*.5,70*k),mr=(st.skin==='hw'?34:26)*k;g.save();g.globalAlpha=.55;g.drawImage(glowSpr(P.moonG),mx-mr*3.2,my-mr*3.2,mr*6.4,mr*6.4);g.restore();
  gr=g.createRadialGradient(mx-mr*.35,my-mr*.35,mr*.1,mx,my,mr);gr.addColorStop(0,'#ffffff');gr.addColorStop(.5,P.moon);gr.addColorStop(1,shade(P.moon,-.18));g.fillStyle=gr;g.beginPath();g.arc(mx,my,mr,0,TAU);g.fill();
  g.fillStyle='rgba(0,0,0,.08)';for(const [a,b,c2] of[[.3,-.2,.22],[-.35,.25,.16],[.1,.42,.12],[-.15,-.4,.1]]){g.beginPath();g.arc(mx+a*mr,my+b*mr,c2*mr,0,TAU);g.fill();}
  if(st.skin==='ny'){const sx=W*.2,sy=Math.max(st.hy*.55,74*k),sr=16*k;g.save();g.globalAlpha=.8;g.drawImage(glowSpr('#cfe4ff'),sx-sr*3,sy-sr*3,sr*6,sr*6);g.globalAlpha=1;g.fillStyle='#fff';
    g.beginPath();for(let i=0;i<16;i++){const a=i*TAU/16-Math.PI/2,rr=i%2?sr*.22:(i%4?sr*.7:sr*1.6);g.lineTo(sx+Math.cos(a)*rr,sy+Math.sin(a)*rr);}g.closePath();g.fill();g.restore();}
  // облачка у луны (тонкие полосы)
  g.save();g.globalAlpha=st.skin==='hw'?.18:.12;g.fillStyle='#c8d0ff';for(let i=0;i<3;i++){const y=my+(i-1)*mr*.9,x=mx-mr*2+i*mr*.8;mgkRR(g,x,y,mr*(2.6+i),mr*.22,mr*.11);g.fill();}g.restore();
  // лес слоями
  const lay=[[st.hy-28*k,46*k,P.f[0],.9],[st.hy-12*k,56*k,P.f[1],1.1],[st.hy+6*k,40*k,P.f[2],1.3]];
  for(const [y,h,col,sc] of lay){g.fillStyle=col;g.beginPath();g.moveTo(0,H);let x=-10;g.lineTo(x,y+h*.5);while(x<W+20){const w=(16+r()*16)*k*sc,th=h*(.55+r()*.6);g.lineTo(x+w*.5,y+h*.5-th);g.lineTo(x+w,y+h*.5);
      if(st.skin==='ny'){}x+=w*.8;}g.lineTo(W+20,H);g.closePath();g.fill();
    if(st.skin==='ny'){g.fillStyle='rgba(220,235,255,.35)';x=-10;}}
  // поле
  gr=g.createLinearGradient(0,st.hy,0,H);gr.addColorStop(0,P.fld0);gr.addColorStop(1,P.fld1);g.fillStyle=gr;g.fillRect(0,st.hy+20*k,W,H-st.hy);
  g.fillStyle=st.skin==='ny'?'rgba(255,255,255,.18)':'rgba(140,190,120,.12)';g.beginPath();g.moveTo(0,st.hy+20*k);for(let x=0;x<=W;x+=20)g.lineTo(x,st.hy+20*k+Math.sin(x*.03)*4*k);g.lineTo(W,st.hy+34*k);g.lineTo(0,st.hy+34*k);g.fill();
  // травинки / сугробы
  for(let i=0;i<Math.round(W/7);i++){const x=r()*W,y=st.hy+30*k+r()*(H-st.hy),s=(.5+(y-st.hy)/(H-st.hy))*k;
    if(st.skin==='ny'){g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(x,y,14*s,4*s,0,0,TAU);g.fill();}
    else{g.strokeStyle='rgba(120,170,100,'+(.18+r()*.2)+')';g.lineWidth=1.4*s;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+3*s,y-6*s,x+5*s,y-11*s);g.moveTo(x,y);g.quadraticCurveTo(x-2*s,y-5*s,x-4*s,y-9*s);g.stroke();}}
  // вдали: тын, изба с огоньком, погост с крестами
  {const y=st.hy+22*k,c1=st.skin==='ny'?'#3a4a6a':'#0e140e';g.fillStyle=c1;for(let x=W*.05;x<W*.35;x+=7*k){g.beginPath();g.moveTo(x,y);g.lineTo(x,y-11*k);g.lineTo(x+2.5*k,y-14*k);g.lineTo(x+5*k,y-11*k);g.lineTo(x+5*k,y);g.fill();}
   const hx=W*.8;st.hut={x:hx-6*k,y:y-12*k};g.fillRect(hx-18*k,y-18*k,36*k,18*k);g.beginPath();g.moveTo(hx-24*k,y-18*k);g.lineTo(hx,y-34*k);g.lineTo(hx+24*k,y-18*k);g.fill();if(st.skin==='ny'){g.fillStyle='#e8f0ff';g.beginPath();g.moveTo(hx-24*k,y-18*k);g.lineTo(hx,y-34*k);g.lineTo(hx+24*k,y-18*k);g.lineTo(hx+18*k,y-16*k);g.lineTo(hx,y-29*k);g.lineTo(hx-18*k,y-16*k);g.fill();}
   g.fillStyle=c1;const cx0=W*.45,nc=st.skin==='hw'?9:5;for(let i=0;i<nc;i++){const x=cx0+i*14*k+r()*6*k,yy=y+r()*8*k,h=(12+r()*6)*k;g.fillRect(x-1.4*k,yy-h,2.8*k,h);g.fillRect(x-5*k,yy-h*.72,10*k,2.6*k);}}
  // туман
  {const mc=P.mist.match(/[\d.]+/g),col='#'+[0,1,2].map(i=>(+mc[i]).toString(16).padStart(2,'0')).join('');g.save();g.globalAlpha=+mc[3]*5;
  for(let i=0;i<Math.round(W/70);i++){const x=r()*W,y=st.hy+30*k+r()*(st.zB-st.hy),rw=(90+r()*90)*k;g.save();g.translate(x,y);g.scale(1,.22);g.drawImage(glowSpr(col),-rw,-rw,rw*2,rw*2);g.restore();}g.restore();}
  return c;}
function dzPalisade(st,dpr){const W=st.W,H=st.H,k=st.k,ph=st.ph,c=mkCanvas(W*dpr,(ph+30*k)*dpr),g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,30*k*dpr);const r=mgkRnd(77);
  const lw=Math.max(24,30*k),n=Math.ceil(W/lw)+1,top=0;
  for(let i=0;i<n;i++){const x=i*lw-lw*.3+(r()-.5)*3,h=ph*(.86+r()*.14),y=ph-h,w=lw*.96;
    const gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,'#5a3418');gr.addColorStop(.35,'#9a6332');gr.addColorStop(.7,'#7a4a22');gr.addColorStop(1,'#4a2a12');
    g.fillStyle=gr;g.beginPath();g.moveTo(x,ph+4);g.lineTo(x,y+lw*.55);g.lineTo(x+w/2,y-lw*.05);g.lineTo(x+w,y+lw*.55);g.lineTo(x+w,ph+4);g.closePath();g.fill();g.lineWidth=1.6;g.strokeStyle='#2e1a0a';g.stroke();
    g.strokeStyle='rgba(40,20,8,.45)';g.lineWidth=1.2;for(let j=0;j<3;j++){const yy=y+lw+(j+r())*(h-lw)/3;g.beginPath();g.moveTo(x+w*.25,yy);g.quadraticCurveTo(x+w*.5,yy+3,x+w*.75,yy-1);g.stroke();}
    if(r()<.4){g.fillStyle='rgba(40,20,8,.5)';g.beginPath();g.ellipse(x+w*(.3+r()*.4),y+lw+r()*(h-lw*1.5),3,4,0,0,TAU);g.fill();}
    if(st.skin==='ny'){g.fillStyle='#f4f8ff';g.beginPath();g.moveTo(x+w*.08,y+lw*.5);g.quadraticCurveTo(x+w/2,y-lw*.35,x+w*.92,y+lw*.5);g.quadraticCurveTo(x+w*.7,y+lw*.68,x+w*.5,y+lw*.58);g.quadraticCurveTo(x+w*.3,y+lw*.72,x+w*.08,y+lw*.5);g.fill();
      g.strokeStyle='rgba(120,150,190,.6)';g.lineWidth=1;g.stroke();}}
  // поперечина с верёвкой
  for(const yy of[ph*.42,ph*.8]){const gb=g.createLinearGradient(0,yy-6*k,0,yy+6*k);gb.addColorStop(0,'#8a5628');gb.addColorStop(1,'#4a2a12');g.fillStyle=gb;g.fillRect(0,yy-6*k,W,12*k);g.strokeStyle='#2e1a0a';g.lineWidth=1.4;g.strokeRect(-2,yy-6*k,W+4,12*k);
    g.strokeStyle='#c9a36a';g.lineWidth=2;for(let x=lw*.7;x<W;x+=lw*2){g.beginPath();g.moveTo(x-4,yy-7*k);g.lineTo(x+4,yy+7*k);g.moveTo(x+2,yy-7*k);g.lineTo(x+10,yy+7*k);g.stroke();}}
  g.globalCompositeOperation='source-atop';const wg=g.createLinearGradient(0,0,0,ph);wg.addColorStop(0,'rgba(255,160,70,0)');wg.addColorStop(1,'rgba(255,150,60,.3)');g.fillStyle=wg;g.fillRect(0,-30*k,W,ph+30*k);g.globalCompositeOperation='source-over';
  st.palLw=lw;return c;}
function dzDark(st,dpr){if(!st.dk||st.dk.width!==Math.round(st.W*dpr)||st.dk.height!==Math.round(st.H*dpr)){st.dk=mkCanvas(st.W*dpr,st.H*dpr);}return st.dk;}
function dzLightSpr(){if(MGCK.lsp)return MGCK.lsp;const c=mkCanvas(256,256),g=c.getContext('2d'),q=g.createRadialGradient(128,128,0,128,128,128);
  q.addColorStop(0,'rgba(0,0,0,1)');q.addColorStop(.55,'rgba(0,0,0,.95)');q.addColorStop(.8,'rgba(0,0,0,.5)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,256,256);return MGCK.lsp=c;}
function dzEyes(g,st,m,x,y,s,a){if(a<=.02)return;const T=m.T,k=s,col=T.eye,open=m.bl>0?.12:1,er=(T.one?7:4.2)*k,dx=T.one?0:T.sz*.11*k,ey=y;
  g.save();g.globalAlpha=a;g.globalCompositeOperation='lighter';for(const d of T.one?[0]:[-1,1]){g.drawImage(glowSpr(col),x+d*dx-er*4,ey-er*4,er*8,er*8);}g.globalCompositeOperation='source-over';
  for(const d of T.one?[0]:[-1,1]){g.fillStyle=col;g.beginPath();g.ellipse(x+d*dx,ey,er,er*open*.85,d*.25,0,TAU);g.fill();g.fillStyle='#1a0a00';g.beginPath();g.ellipse(x+d*dx,ey,er*.28,er*open*.7,0,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(x+d*dx-er*.35,ey-er*.3*open,er*.25,0,TAU);g.fill();}g.restore();}
function dzDraw(st,g,UI){const W=st.W,H=st.H,k=st.k,dpr=MGCK.dpr||1;if(!st.bg)st.bg=dzBg(st,dpr);if(!st.pal)st.pal=dzPalisade(st,dpr);
  const sh=st.shake>0&&!st.calm?Math.sin(st.t*60)*st.shake*4*k:0;
  g.drawImage(st.bg,0,0,W,H);
  // нетопыри у луны (Ночь нечисти)
  if(st.skin==='hw')for(const b of st.bats){if(b.t<0)continue;const w=Math.sin(b.ph)*.8;g.fillStyle='#120818';g.beginPath();g.moveTo(b.x,b.y);g.quadraticCurveTo(b.x-6*k,b.y-6*k*w,b.x-12*k,b.y-2*k*w);g.quadraticCurveTo(b.x-6*k,b.y+1*k,b.x,b.y+2*k);g.quadraticCurveTo(b.x+6*k,b.y+1*k,b.x+12*k,b.y-2*k*w);g.quadraticCurveTo(b.x+6*k,b.y-6*k*w,b.x,b.y);g.fill();}
  // рассвет: розовая полоса у горизонта
  const dawn=Math.max(st.dawn,UI.ph==='play'?Math.max(0,(st.t-(st.dur-10))/10)*.55:0);
  if(dawn>0){const gr=g.createLinearGradient(0,0,0,st.hy+30*k);gr.addColorStop(0,'rgba(120,160,255,0)');gr.addColorStop(.6,'rgba(255,170,190,'+(dawn*.35)+')');gr.addColorStop(1,'rgba(255,200,120,'+(dawn*.7)+')');g.fillStyle=gr;g.fillRect(0,0,W,st.hy+30*k);}
  // кусты и нечисть — по глубине
  const L=dzLight(st),items=[];for(const b of st.bush)items.push({y:b.y,b});for(const m of st.mon)items.push({y:m.y,m});items.sort((a,b)=>a.y-b.y);
  for(const it of items){if(it.b){const b=it.b;mgkPut(g,b.key,b.x,b.y-b.sz*.35,b.sz,{fx:b.fx});continue;}
    const m=it.m,s=dzScale(st,m.y),sz=m.T.sz*s;let x=m.x+sh,y=m.y-sz*.42,a=1,rot=0,sx=1,sy=1;
    if(m.st==='in'){a=Math.min(1,m.it/.5);}
    if(m.st==='lurk'||m.st==='in'){y+=Math.sin(m.it*2.2+m.sw)*2*k;if(m.shk>0&&!st.calm){x+=Math.sin(m.it*55)*2.2*k*m.shk;}sy=1+Math.sin(m.it*3+m.sw)*.025;}
    if(m.st==='run'){const q=Math.min(1,m.rt/.9),hop=Math.sin(Math.min(1,q*1.4)*Math.PI)*36*k;y-=hop+q*20*k;x+=m.face*q*50*k;a=1-q*q;if(!st.calm)rot=m.face*q*2.4;sx=sy=1-q*.35;}
    if(m.st==='brk'){const q=Math.min(1,m.rt/.6);y+=q*30*k;sx=sy=1+q*.4;a=1-q;}
    g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(m.x,m.y,sz*.32*sx,sz*.08,0,0,TAU);g.fill();
    mgkPut(g,m.key,x,y,sz,{fx:m.face,a,rot,sx,sy,fl:m.st==='run'&&m.rt<.08});}
  // тын
  const pdy=st.red>0&&!st.calm?Math.sin(st.t*50)*st.red*2*k:0;g.drawImage(st.pal,0,st.palY-30*k+pdy,W,st.ph+30*k);
  // темнота с дыркой света
  const dk=dzDark(st,dpr),d=dk.getContext('2d'),P=dzPal(st),dm=1-dawn;d.setTransform(dpr,0,0,dpr,0,0);d.globalCompositeOperation='source-over';d.clearRect(0,0,W,H);
  const gr=d.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba('+P.dk+','+(.22*dm)+')');gr.addColorStop(st.hy/H,'rgba('+P.dk+','+(.55*dm)+')');gr.addColorStop(Math.min(.99,(st.hy+60*k)/H),'rgba('+P.dk+','+(.9*dm)+')');gr.addColorStop(Math.min(.995,st.palY/H),'rgba('+P.dk+','+(.86*dm)+')');gr.addColorStop(1,'rgba('+P.dk+','+(.5*dm)+')');
  d.fillStyle=gr;d.fillRect(0,0,W,H);d.globalCompositeOperation='destination-out';const ls=dzLightSpr();
  if(UI.ph!=='intro'||true){d.drawImage(ls,L.x-L.r*1.25,L.y-L.r*1.25,L.r*2.5,L.r*2.5);}
  for(const fl of st.ff)if(!fl.gone){d.globalAlpha=.55;d.drawImage(ls,fl.x-26*k,fl.y-26*k,52*k,52*k);}
  if(st.skin==='hw')for(let i=1;i<6;i++){d.globalAlpha=.5;d.drawImage(ls,W*i/6-34*k,st.palY-30*k,68*k,68*k);}
  if(st.skin==='ny'){d.globalAlpha=.35;for(let x=st.palLw*.5;x<W;x+=st.palLw*1.3)d.drawImage(ls,x-22*k,st.palY+st.ph*.12-22*k,44*k,44*k);}
  d.globalAlpha=1;d.globalCompositeOperation='source-over';g.drawImage(dk,0,0,W,H);
  // огонёк в избе вдали, лунные блики, плывущий туман, крадущиеся силуэты
  if(st.hut){g.fillStyle='#ffc860';g.fillRect(st.hut.x,st.hut.y,5*k,5*k);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.5+.1*Math.sin(st.t*3);g.drawImage(glowSpr('#ffa030'),st.hut.x-12*k,st.hut.y-12*k,29*k,29*k);g.restore();}
  if(!st.mist){const r=mgkRnd(99);st.mist=[];for(let i=0;i<5;i++)st.mist.push({x:r()*W,y:st.zT+(i+.3)/5*(st.zB-st.zT),w:(160+r()*140)*k,v:(6+r()*8)*(r()<.5?-1:1)});
    st.glint=[];for(let i=0;i<Math.round(W/90);i++)st.glint.push({x:r()*W,y:st.zT+r()*(st.zB-st.zT),r:(30+r()*40)*k,ph:r()*TAU});}
  {const mc=st.skin==='hw'?'#7aff9a':st.skin==='ny'?'#dfe8ff':'#b8c8ff';g.save();g.globalCompositeOperation='lighter';
   for(const p of st.glint){g.globalAlpha=(.07+.03*Math.sin(st.t*.7+p.ph))*(1-dawn);g.save();g.translate(p.x,p.y);g.scale(1,.35);g.drawImage(glowSpr('#a8c0ff'),-p.r,-p.r,p.r*2,p.r*2);g.restore();}
   for(const m of st.mist){const x=((m.x+m.v*st.t*k)%(W+m.w*2)+W+m.w*2)%(W+m.w*2)-m.w;g.globalAlpha=.09;g.save();g.translate(x,m.y);g.scale(1,.18);g.drawImage(glowSpr(mc),-m.w,-m.w,m.w*2,m.w*2);g.restore();}
   g.restore();}
  for(const m of st.mon){if(m.st==='run'||m.st==='brk'||m.lit>.6)continue;const s=dzScale(st,m.y),sz=m.T.sz*s;g.save();g.globalAlpha=.55*(1-m.lit)*Math.min(1,m.it/.5);
    mgkPut(g,m.key,m.x+sh,m.y-sz*.42+Math.sin(m.it*2.2+m.sw)*2*k,sz,{fx:m.face,sil:1});g.restore();}
  // тёплый свет факела
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.22+(st.calm?0:Math.sin(st.t*13)*.03);g.drawImage(glowSpr('#ff9a3a'),L.x-L.r,L.y-L.r,L.r*2,L.r*2);g.restore();
  // глаза в темноте (поверх темноты), кольцо испуга
  for(const m of st.mon){if(m.st==='run'||m.st==='brk')continue;const s=dzScale(st,m.y),sz=m.T.sz*s,x=m.x+sh,y=m.y-sz*.42;
    dzEyes(g,st,m,x,y-sz*.12,s,(1-m.lit*.92)*Math.min(1,m.it/.4));
    if(m.fear>.02){const r=sz*.5;g.save();g.lineCap='round';g.lineWidth=5*k;g.strokeStyle='rgba(30,14,4,.55)';g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();
      g.strokeStyle=m.fear>.7?'#ffe27a':'#ffb03a';g.lineWidth=3.6*k;g.beginPath();g.arc(x,y,r,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,m.fear));g.stroke();g.restore();}
    if(m.prog>.72&&m.lit<.5&&!st.calm){const q=(m.prog-.72)/.28;g.save();g.globalAlpha=.5+.5*Math.sin(st.t*10);mgkText(g,'!',x,y-sz*.7,22*k,{c:'#ff6a4a'});g.restore();}}
  // гирлянда на тыне (Святки), огоньки тыкв (Ночь нечисти)
  if(st.skin==='ny'){const y0=st.palY+st.ph*.12;g.strokeStyle='rgba(30,40,30,.8)';g.lineWidth=1.5;g.beginPath();for(let x=0;x<=W;x+=st.palLw*1.3/4){const q=(x/(st.palLw*1.3))%1;g.lineTo(x,y0+Math.sin(q*Math.PI)*8*k);}g.stroke();
    const C=['#ff4a4a','#ffd23a','#4aff8a','#4ab0ff','#ff7aff'];let i=0;g.save();g.globalCompositeOperation='lighter';
    for(let x=st.palLw*.5;x<W;x+=st.palLw*1.3,i++){const on=.55+.45*Math.sin(st.t*3+i*1.7),col=C[i%5];g.globalAlpha=on;g.drawImage(glowSpr(col),x-14*k,y0+6*k-14*k,28*k,28*k);g.globalAlpha=1;g.fillStyle=col;g.beginPath();g.ellipse(x,y0+7*k,3.2*k,4.4*k,0,0,TAU);g.fill();}g.restore();}
  if(st.skin==='hw'){g.save();g.globalCompositeOperation='lighter';for(let i=1;i<6;i++){g.globalAlpha=.5+.25*Math.sin(st.t*5+i);g.drawImage(glowSpr('#ffb030'),W*i/6-22*k,st.palY+4*k-22*k,44*k,44*k);}g.restore();g.globalAlpha=1;
    for(let i=1;i<6;i++)mgkPut(g,'mgc_pump',W*i/6,st.palY+4*k,30*k);}
  // светлячки
  for(const fl of st.ff){if(fl.gone)continue;const an=fl.an,col=an>.4?'#ffb04a':'#d8ff6a',pul=.7+.3*Math.sin(st.t*4+fl.ph*3);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=pul;g.drawImage(glowSpr(col),fl.x-16*k,fl.y-16*k,32*k,32*k);g.restore();
    g.fillStyle='#fffbd0';g.beginPath();g.arc(fl.x,fl.y,2.6*k,0,TAU);g.fill();
    if(an>.05){g.save();g.lineCap='round';g.lineWidth=3*k;g.strokeStyle='#ff6a3a';g.globalAlpha=.9;g.beginPath();g.arc(fl.x,fl.y,13*k,-Math.PI/2,-Math.PI/2+TAU*an);g.stroke();g.restore();}}
  // снег (Святки)
  if(st.skin==='ny'&&st.snow){g.fillStyle='rgba(255,255,255,.85)';for(const s of st.snow){g.beginPath();g.arc(s.x,s.y,s.r*k*.8,0,TAU);g.fill();}}
  // факел
  dzTorch(st,g,UI);
  // события (надписи «Прорвался!», «Светлячка спугнул!»)
  st.ev=st.ev.filter(e=>st.t-e.t<1.3);for(const e of st.ev){const q=(st.t-e.t)/1.3;g.globalAlpha=q>.7?1-(q-.7)/.3:1;mgkText(g,e.s,Math.max(90*k,Math.min(W-90*k,e.x)),e.y-40*k-q*20*k,20*k,{c:'#ffb0a0'});}g.globalAlpha=1;
  if(st.red>0){g.save();const v=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(200,20,10,0)');v.addColorStop(1,'rgba(200,20,10,'+(.35*st.red)+')');g.fillStyle=v;g.fillRect(0,0,W,H);g.restore();}
  // подсказка в первые секунды
  if(UI.ph==='play'&&st.t<4){g.globalAlpha=st.t>3?4-st.t:1;mgkText(g,Lg('Веди факел к глазам!','Move the torch to the eyes!'),W/2,st.zT-6*k,21*k,{c:'#ffe9b8'});g.globalAlpha=1;}}
function dzTorch(st,g,UI){const k=st.k,L=dzLight(st),fx=L.x,fy=L.y+st.R*st.rMul*.5,ang=Math.max(-.5,Math.min(.5,(st.tx-st.lx)*.004))+.12,len=70*k;
  const bx=fx-Math.sin(ang)*len*-.1,by=fy+16*k;g.save();g.translate(fx,fy+14*k);g.rotate(ang);
  // древко
  const gr=g.createLinearGradient(-5*k,0,5*k,0);gr.addColorStop(0,'#5a3418');gr.addColorStop(.5,'#a8743c');gr.addColorStop(1,'#4a2a12');g.fillStyle=gr;mgkRR(g,-4.5*k,0,9*k,len,4*k);g.fill();g.strokeStyle='#2e1a0a';g.lineWidth=1.4;g.stroke();
  g.fillStyle='#4a3020';mgkRR(g,-7*k,-4*k,14*k,12*k,3*k);g.fill();g.stroke();g.strokeStyle='#c9a36a';g.lineWidth=1.6;g.beginPath();g.moveTo(-7*k,1*k);g.lineTo(7*k,3*k);g.moveTo(-7*k,5*k);g.lineTo(7*k,7*k);g.stroke();
  // пламя
  const t=st.t+(UI.t||0),fl=st.calm?0:Math.sin(t*19)*.08+Math.sin(t*7)*.06,h=(30+(st.rMul>1?8:0))*k*(1+fl),w=13*k;g.globalCompositeOperation='lighter';g.drawImage(glowSpr('#ff8a1e'),-w*3,-h*1.6,w*6,w*6);g.globalCompositeOperation='source-over';
  const lay=[['#ff5a12',1],['#ff9a1e',.78],['#ffe066',.55],['#fffbe0',.3]];for(const [c,s] of lay){g.fillStyle=c;g.beginPath();g.moveTo(Math.sin(t*9)*3*k*s,-4*k-h*s);g.quadraticCurveTo(w*s*1.1,-h*s*.45,w*s*.8,-2*k);g.quadraticCurveTo(0,4*k*s,-w*s*.8,-2*k);g.quadraticCurveTo(-w*s*1.1,-h*s*.45,Math.sin(t*9)*3*k*s,-4*k-h*s);g.fill();}
  g.restore();
  if(!st.calm&&!st.lite&&Math.random()<.5)mgkPart(st,{x:fx+(Math.random()-.5)*10*k,y:fy-8*k,vx:(Math.random()-.5)*30,vy:-60-Math.random()*60,dur:.6+Math.random()*.4,s:1.4,col:'#ffb04a',gr:-20});
  if(UI.ph==='play'&&!st.moved&&st.t<6)dzHint(st,g,fx,fy);}
/* подсказка, пока игрок не сдвинул факел: рука (телефон) или стрелка-курсор (ПК) ходит дугой и тянет за собой круг */
function dzHint(st,g,fx,fy){const k=st.k,q=(st.t%1.6)/1.6,dx=Math.sin(q*TAU)*46*k,x=fx+dx,y=fy+(st.pc?6:60)*k+Math.abs(Math.cos(q*TAU))*-6*k;g.save();g.globalAlpha=Math.min(1,st.t*3);
  if(st.pc){g.translate(x,y);g.fillStyle='#fff';g.strokeStyle='#1a1a1a';g.lineWidth=2*k;g.beginPath();g.moveTo(0,0);g.lineTo(0,26*k);g.lineTo(7*k,20*k);g.lineTo(12*k,31*k);g.lineTo(17*k,29*k);g.lineTo(12*k,18*k);g.lineTo(20*k,18*k);g.closePath();g.fill();g.stroke();g.translate(-x,-y);}
  else{g.fillStyle='#fff3e0';g.strokeStyle='#3b2412';g.lineWidth=2*k;g.beginPath();g.ellipse(x,y+10*k,13*k,16*k,0,0,TAU);g.fill();g.stroke();g.beginPath();mgkRR(g,x-4.5*k,y-22*k,9*k,28*k,4.5*k);g.fill();g.stroke();}
  mgkText(g,st.pc?Lg('Води мышкой','Move the mouse'):Lg('Веди пальцем','Drag your finger'),fx,y+(st.pc?52:48)*k,19*k,{c:'#fff3c4'});g.restore();}
mgcReg(MG_DOZOR,{num:4,n:{ru:'Ночной дозор',en:'Night Watch'},icon:'mgc_torch',kind:'score',fest:1});
