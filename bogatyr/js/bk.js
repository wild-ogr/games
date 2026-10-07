/* Приёмы боссов BK, фазы, «ярость», мини-боссы — зона A21 BK. Справочник — release-h/bogatyr-chapters/ENGINE-API.md, раздел «BK».
   Хуки game.js: BK_STEP(b,dt) → BK_RUN(b,dt,G) (только у врагов с e.kit), BK_DRAW(c,G) (мир, после сущностей).
   BK[приём]={x, start(b,G,a), step(b,dt,G,a) → true = приём окончен, draw(c,b,G,a)} — a — строка kit.a/ph.add ({k:'ring',cd:4,n:12}),
   состояние запуска — b.bk.m (новый объект на каждый запуск); x:1 — приём сам ведёт босса (старый bossAI на это время стоит).
   BK_RUN → true: босс ведётся набором приёмов целиком (новые боссы тем); у «ярых» (b.bv) → false, кроме приёмов x:1 и замаха (m.hold) — старый bossAI поверх.
   Опасности — G.bkO [{k:'blast'|'wall'|'trail'|'mark'|'foot', x,y,r,(x2,y2), arm, dur, e (прошло), t (до удара), dmg}] — они же в G.warn с флагом bk:1 (бот обходит).
   Все предупреждения ≥ 0,8 с; копий/свиты одного босса ≤ 20 (BK_CAP); спокойный режим — без мигания, «мало» — меньше частиц. Без тем ничего не делает. */
const BK={};
const BK_CAP=20;
const bkW=a=>Math.max(.8,a&&a.w||.9); /* предупреждение, с */
function bkD(b,a,k){return b.dmg*(a&&a.dmg!=null?a.dmg:k);}
function bkAng(b){const H=G.hero;return Math.atan2(H.y-b.y,H.x-b.x);}
function bkCol(b,a){return a&&a.col||EN[b.type]&&EN[b.type].col||'#ff5a3a';}
function bkSnd(k){try{if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(x){}}
function bkSeg(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy||1;const q=clamp(((px-x1)*dx+(py-y1)*dy)/l,0,1);return [x1+dx*q,y1+dy*q];}
function bkIn(o,x,y,pad){if(o.x2!=null){const p=bkSeg(x,y,o.x,o.y,o.x2,o.y2);return (x-p[0])**2+(y-p[1])**2<(o.r+pad)**2;}return (x-o.x)**2+(y-o.y)**2<(o.r+pad)**2;}
/* опасность: в G.bkO и в G.warn (кроме следов 'foot') */
function bkO(b,o){const L=G.bkO||(G.bkO=[]);if(L.length>=80)return null;o.e=0;o.arm=o.arm||0;o.t=o.arm;o.dur=o.dur||o.arm+.3;o.own=b;o.src=b.type;o.bk=1;L.push(o);
  if(o.k!=='foot')(G.warn||(G.warn=[])).push(o);return o;}
function bkMine(b){let n=0;for(const e of G.en)if(!e.dead&&e.bkB===b)n++;return n;}
function bkPt(n,col,x,y,sp,dur,s){if(!G.pt||G.pt.length>(qLow()?200:500))return;for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(.3,1)*sp;G.pt.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,dur:dur||.5,col,s:s||rand(2,4)});}}
function bkPoof(e){if(e.dead)return;e.dead=true;G.fx.push({k:'poof',x:e.x,y:e.y,t:0,dur:.5});}
function bkName(b){const v=b.bv&&BOSS[b.bv];return v&&v.n?L(v.n,v.en&&v.en.n||v.n):EN[b.type].n;}
/* свита/призыв: обычный вид (не босс), не больше BK_CAP своих на босса */
function bkSpawn(b,id,x,y){if(!EN[id]||EN[id].boss||id==='egg'||bkMine(b)>=BK_CAP)return null;const e=mkEnemy(id,x,y);e.bkB=b;return e;}
/* ложный двойник/гнездо: враг вида босса без босса (e.boss=0), опыт 0; ведёт его BEH._bkf */
function bkFake(b,x,y,hp,o){if(bkMine(b)>=BK_CAP)return null;const e=mkEnemy(b.type,x,y);e.boss=0;delete e.kit;e.mini=0;e.phase=-1;e.at=e.at2=e.at3=1e9;
  e.hp=e.max=Math.max(1,hp);e.xp=0;e.dmg=b.dmg*.5;e.spd=b.spd;e.sc=b.sc;e.r=b.r;e.rage=b.rage;e.face=b.face;e.beh='_bkf';e.bkB=b;e.bkF=1;if(o)Object.assign(e,o);
  G.fx.push({k:'poof',x,y,t:0,dur:.5});return e;}
BEH._bkf={step(e,dt,G){const b=e.bkB,s=b&&b.bk;
    if(!b||b.dead||!s||e.bkK!=null&&e.bkK!==s.kid){bkPoof(e);return true;}
    if(e.nest){e.kx=e.ky=0;return true;}
    const H=G.hero,dx=H.x-e.x,dy=H.y-e.y,d=Math.hypot(dx,dy)||1,sp=e.spd*(e.slow>0?.55:1);
    e.x+=(dx/d*sp+e.kx)*dt;e.y+=(dy/d*sp+e.ky)*dt;e.kx*=Math.pow(.01,dt);e.ky*=Math.pow(.01,dt);e.face=dx<0?-1:1;return true;},
  die(e,G){const b=e.bkB,s=b&&b.bk;if(!s||b.dead)return;
    if(e.nest){const h=Math.min(b.hp-1,b.max*(e.nest.hk||.04));if(h>0){b.hp-=h;b.flash=.1;addNum(b.x,b.y-b.r*1.2,h,'#ffd84a');}bkSnd('crack');}}};

/* ---------- приёмы ---------- */
BK.ring={start(b,G,a){const m=b.bk.m;m.w=bkW(a);m.i=0;m.hold=a.hold!==0;},
  step(b,dt,G,a){const m=b.bk.m;if(m.T<m.w)return false;const n=Math.min(a.n||12,40),o=(b.bk.rot=(b.bk.rot||0)+.26);
    for(let i=0;i<n;i++)eShoot(b,o+i/n*TAU,a.sp||140,bkCol(b,a),a.r||7,bkD(b,a,.6),a.ice);bkSnd('shoot');
    if(++m.i>=(a.rep||1))return true;m.T=m.w-(a.gap||.45);m.hold=0;return false;},
  draw(c,b,G,a){const m=b.bk.m;if(m.T>=m.w||m.i)return;const q=m.T/m.w;c.strokeStyle=rgba(bkCol(b,a),.35+.5*q);c.lineWidth=3;c.beginPath();c.arc(b.x,b.y,b.r*(2.2-q*1.1),0,TAU);c.stroke();}};
BK.fan={start(b,G,a){const m=b.bk.m;m.w=bkW(a);m.i=0;m.a=bkAng(b);m.hold=1;},
  step(b,dt,G,a){const m=b.bk.m;if(m.T<m.w){let d=bkAng(b)-m.a;d=Math.atan2(Math.sin(d),Math.cos(d));m.a+=clamp(d,-dt*1.2,dt*1.2);return false;}
    const n=Math.min(a.n||5,25),arc=a.arc||.9;for(let i=0;i<n;i++)eShoot(b,m.a+(n>1?(i/(n-1)-.5)*arc:0),a.sp||210,bkCol(b,a),a.r||8,bkD(b,a,.7),a.ice);bkSnd('shoot');
    if(++m.i>=(a.rep||1))return true;m.T=m.w-(a.gap||.5);m.a=bkAng(b);return false;},
  draw(c,b,G,a){const m=b.bk.m;if(m.T>=m.w)return;const arc=a.arc||.9,L=a.len||300;c.fillStyle=rgba('#ff3a2a',.1+.12*m.T/m.w);c.beginPath();c.moveTo(b.x,b.y);c.arc(b.x,b.y,L,m.a-arc/2,m.a+arc/2);c.closePath();c.fill();}};
BK.dash={x:1,start(b,G,a){const m=b.bk.m;m.w=bkW(a);m.i=0;bkDashAim(b,a,m);},
  step(b,dt,G,a){const m=b.bk.m;if(m.st==='aim'){if(m.T>=m.w){m.st='go';m.T=0;bkSnd('swing');}return false;}
    const sp=a.sp||520;b.x+=m.dx*sp*dt;b.y+=m.dy*sp*dt;b.face=m.dx<0?-1:1;if(Math.random()<(qLow()?.3:.7))bkPt(1,a.col||'#c8b89a',b.x,b.y+b.r*.6,40,.6,rand(4,8));
    if(m.T>=(a.dur||.7)){if(++m.i>=(a.rep||1))return true;bkDashAim(b,a,m);m.T=0;}return false;},
  draw(c,b,G,a){const m=b.bk.m;if(m.st!=='aim')return;const L=(a.sp||520)*(a.dur||.7);c.strokeStyle='rgba(255,60,60,'+(CALM()?.4:.3+Math.sin(G.t*30)*.15)+')';c.lineWidth=b.r*1.2;c.lineCap='round';
    c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x+m.dx*L,b.y+m.dy*L);c.stroke();}};
function bkDashAim(b,a,m){const an=bkAng(b),L=(a.sp||520)*(a.dur||.7);m.st='aim';m.dx=Math.cos(an);m.dy=Math.sin(an);m.w=m.i?Math.max(.8,(a.w||.9)*.9):bkW(a);
  bkO(b,{k:'mark',x:b.x,y:b.y,x2:b.x+m.dx*L,y2:b.y+m.dy*L,r:b.r,arm:m.w,dur:m.w+(a.dur||.7)});}
BK.summon={start(b,G,a){const m=b.bk.m,H=G.hero,id=a.id||G.ch.en&&G.ch.en[0],n=Math.min(a.n||5,BK_CAP-bkMine(b));m.w=bkW(a);m.id=id;m.p=[];m.hold=1;
    for(let i=0;i<n;i++){const an=i/n*TAU+rand(-.3,.3),x=a.at==='hero'?H.x+Math.cos(an)*VIEW.R*.6:b.x+Math.cos(an)*80,y=a.at==='hero'?H.y+Math.sin(an)*VIEW.R*.6:b.y+Math.sin(an)*80;
      m.p.push([x,y]);G.fx.push({k:'pulse',x,y,t:0,dur:m.w,r1:46});}
    if(a.say)say(b,L(a.say.ru,a.say.en||a.say.ru),1.6);},
  step(b,dt,G,a){const m=b.bk.m;if(m.T<m.w)return false;for(const p of m.p){bkSpawn(b,m.id,p[0],p[1]);bkPt(5,'#b59f59',p[0],p[1],120);}return true;}};
BK.zones={start(b,G,a){const m=b.bk.m;m.i=0;m.T=9;},
  step(b,dt,G,a){const m=b.bk.m;if(m.T<(a.gap||.6))return false;m.T=0;const H=G.hero,n=Math.min(a.n||3,12);
    for(let i=0;i<n;i++)bkO(b,{k:'blast',x:H.x+(i?rand(-120,120):0),y:H.y+(i?rand(-110,110):0),r:a.r||58,arm:Math.max(.8,a.w||1.1),dmg:bkD(b,a,1),slow:a.slow!=null?a.slow:1.5,col:a.col||'#8ad0ff'});
    return ++m.i>=(a.rep||1);}};
BK.wave={start(b,G,a){const m=b.bk.m;m.w=bkW(a);m.hold=1;},
  step(b,dt,G,a){const m=b.bk.m;if(m.T<m.w)return false;bkSnd('boom');G.shake=Math.max(G.shake,6);
    G.fx.push({k:'wave',x:b.x,y:b.y,t:0,dur:a.dur||.9,r1:a.r||340,col:bkCol(b,a),dmg:bkD(b,a,1.1)});return true;},
  draw(c,b,G,a){const m=b.bk.m,q=m.T/m.w;if(q>=1)return;c.strokeStyle=rgba(bkCol(b,a),.3+.5*q);c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.arc(b.x,b.y,b.r+8+((1-q)*3+i)%1*44,0,TAU);c.stroke();}}};
BK.beam={x:1,start(b,G,a){const m=b.bk.m;m.w=Math.max(.8,a.w||1.1);m.a=bkAng(b);m.st='aim';m.o=bkO(b,{k:'mark',x:b.x,y:b.y,x2:b.x,y2:b.y,r:a.wd||22,arm:m.w,dur:m.w+(a.dur||2.4)});say(b,L('Вижу тебя!','I see you!'),1.1);},
  step(b,dt,G,a){const m=b.bk.m,H=G.hero,len=a.len||480,ox=b.x,oy=b.y-b.r*.6;
    if(m.st==='go'||m.T>m.w*.5){let d=Math.atan2(H.y-oy,H.x-ox)-m.a;d=Math.atan2(Math.sin(d),Math.cos(d));m.a+=clamp(d,-dt*(a.turn||.7),dt*(a.turn||.7));}
    const ux=Math.cos(m.a),uy=Math.sin(m.a);if(m.o){m.o.x=ox;m.o.y=oy;m.o.x2=ox+ux*len;m.o.y2=oy+uy*len;}
    if(m.st==='aim'){if(m.T>=m.w){m.st='go';m.T=0;bkSnd('zap');}return false;}
    const px=H.x-ox,py=H.y-oy,al=px*ux+py*uy;if(al>0&&al<len&&Math.abs(px*uy-py*ux)<(a.wd||22))hurtHero(bkD(b,a,.55),b.type);
    if(Math.random()<(qLow()?.2:.5))spark(ox+ux*rand(20,len),oy+uy*rand(20,len),'#ff6a8a',1);b.x+=b.kx*dt;b.y+=b.ky*dt;
    return m.T>=(a.dur||2.4);},
  draw(c,b,G,a){const m=b.bk.m,len=a.len||480,ox=b.x,oy=b.y-b.r*.6,x2=ox+Math.cos(m.a)*len,y2=oy+Math.sin(m.a)*len,col=a.col||'#ff3c6e';c.lineCap='round';
    if(m.st==='aim'){c.strokeStyle=rgba(col,CALM()?.5:.35+Math.sin(G.t*30)*.2);c.lineWidth=3;c.beginPath();c.moveTo(ox,oy);c.lineTo(x2,y2);c.stroke();return;}
    c.globalCompositeOperation='lighter';c.strokeStyle=rgba(col,.45);c.lineWidth=(a.wd||22)*1.8;c.beginPath();c.moveTo(ox,oy);c.lineTo(x2,y2);c.stroke();
    c.strokeStyle='rgba(255,220,230,.9)';c.lineWidth=(a.wd||22)*.5;c.stroke();c.globalCompositeOperation='source-over';}};
BK.tele={x:1,start(b,G,a){const m=b.bk.m,H=G.hero,an=rand(0,TAU),d=a.d||170;m.w=bkW(a);m.x=H.x+Math.cos(an)*d;m.y=H.y+Math.sin(an)*d;
    bkO(b,{k:'blast',x:m.x,y:m.y,r:b.r+26,arm:m.w,dmg:bkD(b,a,.8),col:bkCol(b,a),kb:300});},
  step(b,dt,G,a){const m=b.bk.m;if(m.T<m.w)return false;G.fx.push({k:'poof',x:b.x,y:b.y,t:0,dur:.5});b.x=m.x;b.y=m.y;G.fx.push({k:'poof',x:b.x,y:b.y,t:0,dur:.5});
    if(a.n)for(let i=0;i<Math.min(a.n,30);i++)eShoot(b,i/a.n*TAU,a.sp||140,bkCol(b,a),7,bkD(b,a,.6));return true;},
  draw(c,b,G,a){const m=b.bk.m;if(m.T<m.w&&Math.floor(m.T*12)%2&&!CALM())return;c.globalAlpha=.5;drawSpr(b.type,b.x,b.y,b.face*b.sc*1.05,b.sc*1.05,true);c.globalAlpha=1;worldT();}};
BK.wall={pass:1,start(b,G,a){const H=G.hero,n=Math.min(a.n||3,8),len=a.len||240,arm=Math.max(.8,a.w||1),dur=arm+(a.dur||6);
    if(a.at==='line'){const an=bkAng(b),ux=Math.cos(an),uy=Math.sin(an);for(let i=0;i<n;i++){const d=60+i*90,x=b.x+ux*d,y=b.y+uy*d;bkO(b,{k:'wall',x:x-uy*len/2,y:y+ux*len/2,x2:x+uy*len/2,y2:y-ux*len/2,r:a.wd||14,arm,dur,dmg:bkD(b,a,.6),fire:a.fire,col:a.col||(a.fire?'#ff7a2a':'#3fbf7f')});}return;}
    const an=rand(0,TAU);for(let i=0;i<n;i++){const s=i%2?1:-1,o=(a.gap||110)*(Math.floor(i/2)+1)*s*(n===1?0:1),pa=an+Math.PI/2,x=H.x+Math.cos(pa)*o,y=H.y+Math.sin(pa)*o,ux=Math.cos(an)*len/2,uy=Math.sin(an)*len/2;
      bkO(b,{k:'wall',x:x-ux,y:y-uy,x2:x+ux,y2:y+uy,r:a.wd||14,arm,dur,dmg:bkD(b,a,.6),fire:a.fire,col:a.col||(a.fire?'#ff7a2a':'#3fbf7f')});}},
  step(){return true;}};
BK.pull={x:1,start(b,G,a){const m=b.bk.m;m.w=bkW(a);m.o=bkO(b,{k:'mark',x:b.x,y:b.y,r:b.r+30,arm:m.w,dur:m.w+(a.dur||3)});say(b,L('Ко мне!','Come here!'),1.2);},
  step(b,dt,G,a){const m=b.bk.m,H=G.hero;b.x+=b.kx*dt;b.y+=b.ky*dt;if(m.T<m.w)return false;const dx=b.x-H.x,dy=b.y-H.y,d=Math.hypot(dx,dy)||1,R=a.r||VIEW.R*1.1;
    if(d<R&&d>b.r){const f=(a.f||110)*(1-d/R*.4);H.x+=dx/d*f*dt;H.y+=dy/d*f*dt;}
    if(a.n&&(m.sT=(m.sT||0)-dt)<=0){m.sT=a.gap||1;for(let i=0;i<Math.min(a.n,20);i++)eShoot(b,i/a.n*TAU+G.t,a.sp||110,bkCol(b,a),6,bkD(b,a,.5));}
    return m.T>=m.w+(a.dur||3);},
  draw(c,b,G,a){const m=b.bk.m,on=m.T>=m.w,q=on?1:m.T/m.w,col=a.col||'#7ab8ff';c.strokeStyle=rgba(col,.25+.35*q);c.lineWidth=3;
    for(let i=0;i<4;i++){const r=b.r+20+((on?G.t*.8:0)+i/4)%1*160*(on?1:q);c.beginPath();c.arc(b.x,b.y,r,G.t*2+i,G.t*2+i+4);c.stroke();}}};
BK.cone={start(b,G,a){const m=b.bk.m;m.w=Math.max(.8,a.w||1);m.a=bkAng(b);m.hold=1;},
  step(b,dt,G,a){const m=b.bk.m;if(m.T<m.w*.5){m.a=bkAng(b);return false;}if(m.T<m.w)return false;if(m.fl==null){m.fl=0;const H=G.hero,dx=H.x-b.x,dy=H.y-b.y,d=Math.hypot(dx,dy)||1;
      let da=Math.atan2(dy,dx)-m.a;da=Math.atan2(Math.sin(da),Math.cos(da));bkSnd(a.snd||'whistle');G.shake=Math.max(G.shake,6);
      if(d<(a.len||300)&&Math.abs(da)<(a.ang||.55)){hurtHero(bkD(b,a,1),b.type);H.kx+=dx/d*(a.kb||650);H.ky+=dy/d*(a.kb||650);}}
    m.fl+=dt;return m.fl>.3;},
  draw(c,b,G,a){const m=b.bk.m,A=a.ang||.55,len=a.len||300,col=a.col||'#bfe8ff';c.beginPath();c.moveTo(b.x,b.y);c.arc(b.x,b.y,len,m.a-A,m.a+A);c.closePath();
    if(m.fl==null){const q=Math.min(1,m.T/m.w);c.fillStyle=rgba('#ff3a2a',CALM()?.18:.1+.15*q);c.fill();c.strokeStyle=rgba('#ff3a2a',.6);c.lineWidth=2;c.stroke();}
    else{c.fillStyle=rgba(col,.5*(1-m.fl/.3));c.fill();}}};
BK.rain={start(b,G,a){const m=b.bk.m;m.i=0;m.T=9;},
  step(b,dt,G,a){const m=b.bk.m,H=G.hero,n=Math.min(a.n||8,30);if(m.T<(a.gap||.35))return false;m.T=0;const aim=m.i%3===0;
    bkO(b,{k:'blast',x:H.x+(aim?rand(-30,30):rand(-220,220)),y:H.y+(aim?rand(-30,30):rand(-190,190)),r:a.r||54,arm:Math.max(.8,a.w||1.3),dmg:bkD(b,a,.9),col:a.col||'#ff7a2a',boom:1});
    return ++m.i>=n;}};
BK.clone={start(b,G,a){const m=b.bk.m;m.w=bkW(a);m.hold=1;},
  step(b,dt,G,a){const m=b.bk.m,s=b.bk;if(m.T<m.w)return false;const H=G.hero,n=Math.min(a.n||2,8),d=a.d||200,a0=rand(0,TAU),me=randi(0,n);s.kid=(s.kid||0)+1;
    G.fx.push({k:'poof',x:b.x,y:b.y,t:0,dur:.5});for(let i=0;i<=n;i++){const an=a0+i/(n+1)*TAU,x=H.x+Math.cos(an)*d,y=H.y+Math.sin(an)*d;
      if(i===me){b.x=x;b.y=y;G.fx.push({k:'poof',x,y,t:0,dur:.5});}else bkFake(b,x,y,a.hp>0?b.max*a.hp:1,{bkK:s.kid});}
    s.kT=a.dur||10;say(b,L('Где я настоящий?','Which one is real?'),1.5);return true;},
  draw(c,b,G,a){const m=b.bk.m;if(m.T<m.w&&(CALM()||Math.floor(m.T*10)%2)){c.globalCompositeOperation='lighter';glowDot(b.x,b.y,b.r*2.4,'#8a6aff');c.globalCompositeOperation='source-over';}}};
BK.split={start(b,G,a){const m=b.bk.m;m.w=bkW(a);m.hold=1;},
  step(b,dt,G,a){const m=b.bk.m,s=b.bk;if(m.T<m.w){b.x+=rand(-1,1)*(CALM()?0:2);return false;}const n=Math.min(a.n||3,8)-1;s.kid=(s.kid||0)+1;
    s.sc0=s.sc0||b.sc;b.sc=s.sc0*(a.sc||.72);for(let i=0;i<n;i++){const an=i/n*TAU+rand(-.4,.4),e=bkFake(b,b.x+Math.cos(an)*50,b.y+Math.sin(an)*50,b.max*(a.hp||.04),{bkK:s.kid,sc:b.sc,r:b.r*.8});if(e){e.kx=Math.cos(an)*380;e.ky=Math.sin(an)*380;}}
    s.spT=a.dur||12;G.shake=Math.max(G.shake,8);bkSnd('boom');return true;}};
BK.burrow={x:1,inv:1,start(b,G,a){const m=b.bk.m,s=b.bk;m.st='dig';s.sc0=s.sc0||b.sc;s.dm0=b.dmg;b.invul=true;s.inv=1;bkPt(10,'#8a6a3a',b.x,b.y+b.r*.5,140,.6,rand(4,7));},
  step(b,dt,G,a){const m=b.bk.m,s=b.bk,H=G.hero;
    if(m.st==='dig'){b.sc=s.sc0*Math.max(.01,1-m.T/.4);if(m.T>=.4){m.st='go';m.T=0;b.sc=.01;b.dmg=0;}return false;}
    if(m.st==='go'){const dx=H.x-b.x,dy=H.y-b.y,d=Math.hypot(dx,dy)||1,sp=a.sp||260;if(d>8){b.x+=dx/d*Math.min(d,sp*dt);b.y+=dy/d*Math.min(d,sp*dt);}
      if(Math.random()<(qLow()?.2:.5))bkPt(1,'#8a6a3a',b.x,b.y,60,.5,rand(3,6));
      if(m.T>=(a.dur||1.6)){m.st='warn';m.T=0;m.w=bkW(a);m.x=H.x;m.y=H.y;bkO(b,{k:'blast',x:m.x,y:m.y,r:a.r||70,arm:m.w,dmg:bkD(b,a,1.2),kb:500,col:'#c8a060',boom:1});}return false;}
    if(m.T<m.w){b.x+=(m.x-b.x)*Math.min(1,dt*6);b.y+=(m.y-b.y)*Math.min(1,dt*6);return false;}
    b.x=m.x;b.y=m.y;b.sc=s.sc0;s.sc0=0;b.dmg=s.dm0;b.invul=false;s.inv=0;bkPt(14,'#8a6a3a',b.x,b.y,200,.7,rand(4,8));return true;},
  draw(c,b,G,a){const m=b.bk.m;if(m.st!=='go'&&m.st!=='warn')return;c.fillStyle='rgba(90,60,30,.75)';c.beginPath();c.ellipse(b.x,b.y,b.r*.9,b.r*.45,0,0,TAU);c.fill();
    c.fillStyle='rgba(140,100,60,.8)';c.beginPath();c.ellipse(b.x,b.y-3,b.r*.6,b.r*.28,0,0,TAU);c.fill();}};
BK.nest={x:1,inv:1,start(b,G,a){const m=b.bk.m,s=b.bk,H=G.hero,n=Math.min(a.n||3,6),d=a.d||170,a0=rand(0,TAU),me=randi(0,n-1);s.kid=(s.kid||0)+1;m.k=s.kid;m.p=[];
    G.fx.push({k:'poof',x:b.x,y:b.y,t:0,dur:.5});s.sc0=s.sc0||b.sc;s.dm0=b.dmg;
    for(let i=0;i<n;i++){const an=a0+i/n*TAU,x=H.x+Math.cos(an)*d,y=H.y+Math.sin(an)*d;m.p.push([x,y]);
      const e=bkFake(b,x,y,b.max*(a.hp||.03),{bkK:s.kid,nest:{hk:a.hk||.04},sc:.01,r:30,dmg:0,spd:0});if(i===me){b.x=x;b.y=y-24;}}
    b.sc=s.sc0*.6;b.invul=true;s.inv=1;b.dmg=0;m.sT=2;say(b,L('Ищи меня в гнезде!','Find me in my nest!'),1.6);},
  step(b,dt,G,a){const m=b.bk.m,s=b.bk;let left=0;for(const e of G.en)if(!e.dead&&e.nest&&e.bkB===b&&e.bkK===m.k)left++;
    if(a.n0!==0&&(m.sT-=dt)<=0){if(m.sT<=-bkW(a)){m.sT=a.gap||2.6;const n=a.ring||8;for(let i=0;i<n;i++)eShoot(b,i/n*TAU+G.t,120,bkCol(b,a),7,bkD(b,a,.5));}}
    const end=!left||m.T>=(a.dur||14);if(!end)return false;s.kid++;b.sc=s.sc0;s.sc0=0;b.dmg=s.dm0;b.invul=false;s.inv=0;
    if(!left){b.stun=a.stun||2.5;say(b,L('Ой-ой, гнездо!','Oh no, my nest!'),1.5);}return true;},
  draw(c,b,G,a){const m=b.bk.m;if(m.sT<0){c.globalCompositeOperation='lighter';glowDot(b.x,b.y,b.r*2,bkCol(b,a));c.globalCompositeOperation='source-over';}}};
BK.spin={x:1,start(b,G,a){const m=b.bk.m;m.w=bkW(a);m.a=0;m.o=bkO(b,{k:'mark',x:b.x,y:b.y,r:a.r||120,arm:m.w,dur:m.w+(a.dur||3)});},
  step(b,dt,G,a){const m=b.bk.m,H=G.hero,R=a.r||120;m.o.x=b.x;m.o.y=b.y;if(m.T<m.w)return false;m.a+=(a.sp||4)*dt;
    const dx=H.x-b.x,dy=H.y-b.y,d=Math.hypot(dx,dy)||1,sp=b.spd*(a.mv||.7);b.x+=(dx/d*sp+b.kx)*dt;b.y+=(dy/d*sp+b.ky)*dt;b.face=dx<0?-1:1;
    const n=a.n||2;for(let i=0;i<n;i++){const an=m.a+i/n*TAU,p=bkSeg(H.x,H.y,b.x,b.y,b.x+Math.cos(an)*R,b.y+Math.sin(an)*R);if((H.x-p[0])**2+(H.y-p[1])**2<18*18){hurtHero(bkD(b,a,.7),b.type);break;}}
    return m.T>=m.w+(a.dur||3);},
  draw(c,b,G,a){const m=b.bk.m,R=a.r||120,col=a.col||'#d8d8e8';if(m.T<m.w){const q=m.T/m.w;c.fillStyle=rgba('#ff3a2a',CALM()?.15:.08+.12*q);c.beginPath();c.arc(b.x,b.y,R,0,TAU);c.fill();
      c.strokeStyle=rgba('#ff3a2a',.6);c.lineWidth=2;c.beginPath();c.arc(b.x,b.y,R*q,0,TAU);c.stroke();return;}
    c.strokeStyle=rgba('#ff3a2a',.35);c.lineWidth=2;c.beginPath();c.arc(b.x,b.y,R,0,TAU);c.stroke();c.lineCap='round';
    const n=a.n||2;for(let i=0;i<n;i++){const an=m.a+i/n*TAU;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x+Math.cos(an)*R,b.y+Math.sin(an)*R);c.strokeStyle='rgba(25,20,35,.7)';c.lineWidth=11;c.stroke();c.strokeStyle=rgba(col,.95);c.lineWidth=6;c.stroke();
      c.strokeStyle=rgba(col,.25);c.lineWidth=16;c.beginPath();c.arc(b.x,b.y,R*.85,an-.5,an);c.stroke();}}};
BK.invis={pass:1,start(b,G,a){const s=b.bk;s.invT=a.dur||6;if(s.sh0==null)s.sh0=b.shade||0;b.shade=1;G.fx.push({k:'poof',x:b.x,y:b.y,t:0,dur:.5});if(a.say!==0)say(b,L('Ищи по следам!','Follow my tracks!'),1.4);},step(){return true;}};
BK.trail={pass:1,start(b,G,a){const s=b.bk;s.trT=a.dur||6;s.trA=a;},step(){return true;}};

/* ---------- ход босса ---------- */
function bkAdd(s,a,i){if(!a||!a.k)return;if(!BK[a.k]){if(typeof hookUnk==='function')hookUnk('bk',a.k);return;}s.a.push(a);s.t.push(i<0?Math.min(1.2,(a.cd||6)*.3):(a.cd||6)*.4+i*1.1);}
function bkInit(b,k){const s=b.bk={a:[],t:[],ph:(k.ph||[]).filter(p=>p&&p.hp>0).sort((x,y)=>y.hp-x.hp),pi:0,cur:null,m:null,gap:1,inv:0,kid:0,spdK:1};
  for(const a of k.a||[])bkAdd(s,a,s.a.length);return s;}
function bkPhase(b,s){if(s.pi>=s.ph.length||b.invul&&!s.inv)return;const q=b.hp/b.max;
  while(s.pi<s.ph.length&&q<=s.ph[s.pi].hp){const p=s.ph[s.pi++];
    if(p.rm)for(const k of[].concat(p.rm))for(let i=s.a.length-1;i>=0;i--)if(s.a[i].k===k&&!(s.cur===s.a[i])){s.a.splice(i,1);s.t.splice(i,1);}
    if(p.add)for(const a of[].concat(p.add))bkAdd(s,a,-1);
    if(p.spd>0)s.spdK=p.spd;
    if(p.sum)for(const z of[].concat(p.sum)){const n=Math.min(z.n||4,BK_CAP);for(let i=0;i<n;i++){const an=i/n*TAU,x=b.x+Math.cos(an)*90,y=b.y+Math.sin(an)*90;if(bkSpawn(b,z.id,x,y))G.fx.push({k:'poof',x,y,t:0,dur:.5});}}
    if(p.say){const t=L(p.say.ru,p.say.en||p.say.ru);say(b,t,2.6);banner(bkName(b),t,4);}
    G.shake=Math.max(G.shake,10);bkSnd('boss');G.fx.push({k:'wave',x:b.x,y:b.y,t:0,dur:.8,r1:220,col:b.rage?'#ff2a1a':'#ffb03a'});}}
function bkTick(dt){const L=G.bkO;if(!L||!L.length)return;const H=G.hero;
  for(const o of L){o.e+=dt;o.t=o.arm-o.e;if(o.own&&o.own.dead){o.e=o.dur;continue;}
    if(o.k==='blast'){if(!o.hit&&o.e>=o.arm){o.hit=1;if(o.boom){G.fx.push({k:'boom',x:o.x,y:o.y,t:0,dur:.45,r:o.r*1.3});bkSnd('boom');}else{bkSnd('zap');spark(o.x,o.y,'#ffffff',8);}
        if(bkIn(o,H.x,H.y,8)){hurtHero(o.dmg,o.src);if(o.slow)H.slowT=o.slow;if(o.kb){const dx=H.x-o.x,dy=H.y-o.y,d=Math.hypot(dx,dy)||1;H.kx+=dx/d*o.kb;H.ky+=dy/d*o.kb;}}}}
    else if(o.k==='wall'){if(o.e>=o.arm&&bkIn(o,H.x,H.y,11)){if(!o.on)hurtHero(o.dmg,o.src);const p=bkSeg(H.x,H.y,o.x,o.y,o.x2,o.y2);let dx=H.x-p[0],dy=H.y-p[1],d=Math.hypot(dx,dy);
        if(d<.01){dx=-(o.y2-o.y);dy=o.x2-o.x;d=Math.hypot(dx,dy)||1;}H.x=p[0]+dx/d*(o.r+11.5);H.y=p[1]+dy/d*(o.r+11.5);if(o.fire&&(o.tk=(o.tk||0)-dt)<=0){o.tk=.5;hurtHero(o.dmg*.5,o.src);}}
      if(o.e>=o.arm)o.on=1;}
    else if(o.k==='trail'){if(o.e>=o.arm&&bkIn(o,H.x,H.y,6)){H.slowT=Math.max(H.slowT||0,.15);if(o.dmg&&(o.tk=(o.tk||0)-dt)<=0){o.tk=.6;hurtHero(o.dmg,o.src);}}}}
  compact(L,o=>o.e<o.dur);if(G.warn)compact(G.warn,w=>!w.bk||w.e<w.dur);}
/* пассивные: след (trail), невидимость (invis), двойники (clone), деление (split) — таймеры на боссе */
function bkPass(b,dt,s){
  if(s.trT>0){s.trT-=dt;const a=s.trA||{};if((s.trD=(s.trD||0)-dt)<=0){s.trD=a.every||.28;bkO(b,{k:'trail',x:b.x+rand(-6,6),y:b.y+b.r*.4,r:a.r||30,arm:Math.max(.8,a.w||.8),dur:a.life||5,dmg:a.dmg>0?b.dmg*a.dmg:0,col:a.col||'#8a9a4a'});}}
  if(s.invT>0){s.invT-=dt;if((s.fpD=(s.fpD||0)-dt)<=0){s.fpD=qLow()?.4:.26;s.fpS=-(s.fpS||1);const n=Math.atan2(G.hero.y-b.y,G.hero.x-b.x)+Math.PI/2;
      bkO(b,{k:'foot',x:b.x+Math.cos(n)*7*s.fpS,y:b.y+b.r*.5+Math.sin(n)*7*s.fpS,r:6,arm:0,dur:2.6,a:n});}
    if(s.invT<=0){b.shade=s.sh0||0;s.sh0=null;G.fx.push({k:'poof',x:b.x,y:b.y,t:0,dur:.5});}}
  if(s.kT>0){s.kT-=dt;if(s.kT<=0&&!(s.cur&&BK[s.cur.k].inv))s.kid++;}
  if(s.spT>0){s.spT-=dt;let n=0;for(const e of G.en)if(!e.dead&&e.bkF&&e.bkB===b&&e.bkK===s.kid)n++;
    if(!n||s.spT<=0){s.spT=0;s.kid++;if(s.sc0){b.sc=s.sc0;s.sc0=0;}G.fx.push({k:'wave',x:b.x,y:b.y,t:0,dur:.6,r1:140,col:bkCol(b)});}}}
function BK_RUN(b,dt,G){const k=b.kit;if(!k)return false;const s=b.bk||bkInit(b,k),own=!b.bv;
  if(G.bkTk!==G.t){G.bkTk=G.t;bkTick(dt);}
  bkPhase(b,s);bkPass(b,dt,s);
  let ctl=false;
  if(s.cur){const a=s.cur,m=BK[a.k],st=s.m;st.T+=dt;let done=true;try{done=!m.step||!!m.step(b,dt,G,a);}catch(x){if(typeof hookErr==='function')hookErr('bk '+a.k,x);}
    ctl=!!(m.x||st.hold&&st.T<(st.w||0));if(done){s.cur=null;s.m=null;s.gap=m.pass?0:.6;}}
  else{s.gap-=dt;for(let i=0;i<s.t.length;i++)s.t[i]-=dt;
    if(s.gap<=0)for(let i=0;i<s.a.length;i++){if(s.t[i]>0)continue;const a=s.a[i],m=BK[a.k];if(!m)continue;
      if(m.inv&&b.invul)continue; /* Кощей с яйцом и т. п. — неуязвимость не наша */
      if(m.x&&b.bv&&b.state)continue; /* старый ИИ занят своим (свист, рывок, дыхание) */
      if((m.x||m.inv)&&(s.spT>0||s.invT>0&&m.inv))continue;
      s.t[i]=a.cd||6;s.cur=a;s.m={T:0};try{if(m.start)m.start(b,G,a);}catch(x){if(typeof hookErr==='function')hookErr('bk '+a.k,x);s.cur=null;s.m=null;}break;}}
  if(own&&!ctl){const H=G.hero,dx=H.x-b.x,dy=H.y-b.y,d=Math.hypot(dx,dy)||1,sp=b.spd*s.spdK*(b.slow>0?.55:1)*(s.spT>0?1.25:1);
    b.x+=(dx/d*sp+b.kx)*dt;b.y+=(dy/d*sp+b.ky)*dt;b.face=dx<0?-1:1;
    if(Math.random()<dt/7&&PH.boss[b.type]&&PH.boss[b.type].lines)say(b,pick(PH.boss[b.type].lines));}
  if(own||ctl){b.kx*=Math.pow(.01,dt);b.ky*=Math.pow(.01,dt);}
  return own||ctl;}

/* ---------- рисование (мир, после сущностей): опасности, приёмы, ярость, гнёзда, полоса мини-босса. Без Math.random ---------- */
function BK_DRAW(c,G){const calm=CALM(),lo=qLow(),pul=calm?.5:.5+Math.sin(G.t*14)*.5;
  if(G.bkO&&G.bkO.length){compact(G.bkO,o=>!(o.own&&o.own.dead));if(G.warn)compact(G.warn,w=>!(w.bk&&w.own&&w.own.dead));
    for(const o of G.bkO){if(!onScreen(o.x2!=null?{x:(o.x+o.x2)/2,y:(o.y+o.y2)/2}:o,o.r+200))continue;const q=o.arm>0?Math.min(1,o.e/o.arm):1;
      if(o.k==='blast'){if(o.hit){const p=(o.e-o.arm)/Math.max(.05,o.dur-o.arm);if(!o.boom)glowDot(o.x,o.y,o.r*1.2*(1-p*.5),'#ffffff');continue;}
        c.fillStyle=rgba(o.col,.12+.2*q);c.beginPath();c.ellipse(o.x,o.y,o.r,o.r*(o.boom?.78:1),0,0,TAU);c.fill();c.strokeStyle=rgba(o.col,.85);c.lineWidth=2;c.beginPath();c.ellipse(o.x,o.y,o.r*q,o.r*q*(o.boom?.78:1),0,0,TAU);c.stroke();}
      else if(o.k==='wall'){c.lineCap='round';if(o.e<o.arm){c.strokeStyle=rgba(o.col,.25+.3*q*pul);c.lineWidth=o.r*2;c.beginPath();c.moveTo(o.x,o.y);c.lineTo(o.x2,o.y2);c.stroke();continue;}
        const f=Math.min(1,(o.dur-o.e)/.4);c.strokeStyle='rgba(20,20,30,'+.5*f+')';c.lineWidth=o.r*2+6;c.beginPath();c.moveTo(o.x,o.y);c.lineTo(o.x2,o.y2);c.stroke();
        c.strokeStyle=rgba(o.col,.95*f);c.lineWidth=o.r*2;c.stroke();if(!lo){c.strokeStyle='rgba(255,255,255,'+.35*f+')';c.lineWidth=o.r*.6;c.stroke();}}
      else if(o.k==='trail'){const f=Math.min(1,(o.dur-o.e)/.8);c.fillStyle=rgba(o.col,(o.e<o.arm?.15:.38)*f);c.beginPath();c.ellipse(o.x,o.y,o.r,o.r*.7,0,0,TAU);c.fill();}
      else if(o.k==='foot'){const f=1-o.e/o.dur;c.fillStyle='rgba(40,30,20,'+.55*f+')';c.save();c.translate(o.x,o.y);c.rotate(o.a);c.beginPath();c.ellipse(0,0,4,7,0,0,TAU);c.fill();c.restore();}}}
  for(const e of G.en){if(e.dead||!e.nest||!onScreen(e,120))continue; /* гнёзда — первым проходом: рисунки приёмов (каменный цветок Хозяйки и т. п.) ложатся поверх */
    {const s=1+Math.sin(G.t*3+e.ph)*.03;c.fillStyle='#5a3a1e';c.beginPath();c.ellipse(e.x,e.y,34*s,20*s,0,0,TAU);c.fill();c.strokeStyle='#8a6a3a';c.lineWidth=4;
      for(let i=0;i<5;i++){c.beginPath();c.ellipse(e.x,e.y,30-i*3,17-i*2,i*.35,0,Math.PI*1.4);c.stroke();}
      const q=e.hp/e.max;c.fillStyle='rgba(0,0,0,.5)';c.fillRect(e.x-22,e.y-30,44,5);c.fillStyle='#ffd84a';c.fillRect(e.x-22,e.y-30,44*q,5);
      c.strokeStyle='rgba(255,216,74,'+(.35+.4*pul)+')';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,40,0,TAU);c.stroke();}}
  for(const e of G.en){if(e.dead||e.nest||!onScreen(e,120))continue;
    if(e.bkF&&!e.boss&&e.sc>.05){c.globalCompositeOperation='lighter';const R=e.r*1.7;c.drawImage(glowSpr('aura_b'),e.x-R,e.y-R,R*2,R*2);c.globalCompositeOperation='source-over';}
    if(e.bk&&e.bk.cur){const m=BK[e.bk.cur.k];if(m&&m.draw)try{m.draw(c,e,G,e.bk.cur);}catch(x){if(typeof hookErr==='function')hookErr('bk.draw '+e.bk.cur.k,x);}worldT();c.globalAlpha=1;c.globalCompositeOperation='source-over';}
    if(e.rage&&e.sc>.3&&!(e.shade&&Math.hypot(e.x-G.hero.x,e.y-G.hero.y)>150))bkRage(c,e,calm,lo);}
  const m=G.mb;if(m&&!m.dead){const d=VIEW.dpr,W=VIEW.W,top=(window.__safeTop||0)+8,w=Math.min(300,W*.56),x=(W-w)/2,y=top+(G.boss&&!G.boss.dead?140:92),q=clamp(m.hp/m.max,0,1),nm=EN[m.type].n;
    c.setTransform(d,0,0,d,0,0);c.fillStyle=CVL.track;rr(c,x,y,w,12,6);c.fill();c.fillStyle=m.invul?'#8a8aa0':'#ffa03a';rr(c,x+2,y+2,(w-4)*q,8,4);c.fill();
    c.font='800 13px '+CVL.font;c.textAlign='center';c.lineWidth=3.5;c.strokeStyle=CVL.stroke;c.strokeText(nm,W/2,y+25);c.fillStyle='#ffe0b0';c.fillText(nm,W/2,y+25);}}
/* «ярость»: тёмно-красный ореол и красные глаза кодом поверх старого рисунка */
function bkRage(c,e,calm,lo){const k=calm?1:1+Math.sin(G.t*6+e.ph)*.12,R=e.r*e.sc;
  if(!lo){c.globalCompositeOperation='lighter';c.globalAlpha=.6;glowDot(e.x,e.y,R*2.6*k,'#ff2a1a');c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  c.strokeStyle='rgba(120,0,10,'+(calm?.5:.35+.25*(k-.88)/.24)+')';c.lineWidth=6;c.beginPath();c.arc(e.x,e.y,R*1.25*k,0,TAU);c.stroke();
  const v=e.bv&&BOSS[e.bv],ee=v&&v.eye||BK_EYE[e.type]||[.8,.1,.16],one=e.type==='liho',ey=e.y-R*ee[0],ex=e.x+(e.face||1)*R*ee[1];for(let i=0;i<(one?1:2);i++){const x=one?ex:ex+(i?1:-1)*R*ee[2];
    if(!lo){c.globalCompositeOperation='lighter';glowDot(x,ey,R*.42,'#ff1a0a');c.globalCompositeOperation='source-over';}c.fillStyle='#ff2a10';c.beginPath();c.arc(x,ey,Math.max(3,R*.09),0,TAU);c.fill();c.fillStyle='#ffe0c0';c.beginPath();c.arc(x,ey,Math.max(1.2,R*.035),0,TAU);c.fill();}}
/* где глаза у старых боссов: [вверх, вбок по взгляду, расстояние между глазами] в долях радиуса; тема может дать BOSS[bv].eye */
const BK_EYE={solo:[.85,.04,.16],kosh:[.92,0,.1],yaga:[.8,.1,.14],gory:[.85,0,.2],karach:[.95,.05,.14],morcar:[.85,.05,.16],tugar:[1.25,.12,.1],liho:[.7,0,0]};

/* имя «ярого» по умолчанию: «Соловей-разбойник ярый» / «Nightingale the Robber the Furious» (если тема не дала n) */
function bkI18(id,k){const o=EN[id];if(typeof I18D!=='undefined')for(const r of I18D)if(r[0]===o&&r[1]===k)return {ru:r[2],en:r[3]};return {ru:o[k],en:o[k]};}
function BK_INIT(){for(const id in BOSS){const v=BOSS[id];if(!v||!v.rage||!v.base||!EN[v.base]||v.n)continue;const n=bkI18(v.base,'n'),g=EN[v.base].g;
    v.n=n.ru+' '+(g==='f'?'ярая':g==='n'?'ярое':'ярый');if(!v.g&&g)v.g=g;v.en=Object.assign({},v.en,{n:n.en+' the Furious'});}} // i18n:ru — en: «the Furious»
if(typeof addEventListener==='function')addEventListener('DOMContentLoaded',BK_INIT);
