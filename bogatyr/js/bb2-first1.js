/* ===== bb2-first1.js — поток NOVICE: сам первый поход (догружается сразу, но только новичку: BB2.need('nv1') из bb2-first.js). =====
   Флаги: first2 (мир ждёт первого движения, первые уровни без окна, первая карточка из двух и без цифр, «страшно, но погибнуть нельзя», свист конусом, честные звёзды),
   tapgo (нажатие без ведения = «иди туда», первые 3 похода), autowalk (рука сама ведёт после 6 с без движения), pchint (клавиши на ПК). Числа — NV.K в bb2-first.js. */
(function(){
  var o=NV,K=o.K,PC=o.pc,on=o.on,st=o.st,SP={};o.f1=1;
  /* ---------- готовые картинки (рисуются один раз) ---------- */
  function cvs(w,h,fn){var c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'));return c;}
  function spRed(){return SP.red||(SP.red=cvs(128,128,function(c){var g=c.createRadialGradient(64,64,26,64,64,92);g.addColorStop(0,'rgba(210,10,10,0)');g.addColorStop(1,'rgba(210,10,10,.9)');c.fillStyle=g;c.fillRect(0,0,128,128);}));}
  function spCone(){return SP.cone||(SP.cone=cvs(170,190,function(c){c.fillStyle='rgba(120,205,255,.5)';c.strokeStyle='rgba(235,250,255,.95)';c.lineWidth=3;c.beginPath();c.moveTo(0,95);c.arc(0,95,168,-K.whAng,K.whAng);c.closePath();c.fill();c.stroke();}));}
  function spArrow(){return SP.ar||(SP.ar=cvs(120,80,function(c){c.fillStyle='#ffd84a';c.strokeStyle='rgba(40,20,0,.85)';c.lineWidth=6;c.lineJoin='round';c.beginPath();c.moveTo(8,28);c.lineTo(66,28);c.lineTo(66,8);c.lineTo(112,40);c.lineTo(66,72);c.lineTo(66,52);c.lineTo(8,52);c.closePath();c.stroke();c.fill();}));}
  function spKeys(){return SP.keys||(SP.keys=cvs(300,200,function(c){c.textAlign='center';c.textBaseline='middle';c.font='900 34px sans-serif';
    [['W',150,50],['A',80,125],['S',150,125],['D',220,125]].forEach(function(q){c.fillStyle='rgba(20,24,44,.72)';c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=4;c.fillRect(q[1]-31,q[2]-31,62,62);c.strokeRect(q[1]-31,q[2]-31,62,62);c.fillStyle='#fff';c.fillText(q[0],q[1],q[2]+2);});
    c.font='700 24px sans-serif';c.fillStyle='rgba(255,255,255,.9)';c.fillText('← ↑ ↓ →',150,182);}));}
  function spDot(){return SP.dot||(SP.dot=cvs(64,64,function(c){c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=5;c.beginPath();c.arc(32,32,22,0,7);c.stroke();c.fillStyle='rgba(255,216,74,.9)';c.beginPath();c.arc(32,32,7,0,7);c.fill();}));}
  function hand(c,ox,oy,px,py){c.fillStyle='rgba(255,255,255,.10)';c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=2;c.beginPath();c.arc(ox,oy,48,0,7);c.fill();c.stroke();
    c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(px,py,20,0,7);c.fill();c.font='30px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('👆',px+6,py+22);}
  BB2.hook('tutDraw',function(c,g){var n=g.nv,t=performance.now()/1000,W=VIEW.W,H=VIEW.H;if(n&&n.demo)return true;if(hintOn(g))return true;
    if(PC&&on('pchint')){c.globalAlpha=.75+Math.sin(t*4)*.2;c.drawImage(spKeys(),W/2-75,H*.6,150,100);c.globalAlpha=1;return true;}
    if(n&&n.wait){var a=t*2.2,cx=W/2,cy=H*.56;hand(c,cx,cy,cx+Math.cos(a)*34,cy+Math.sin(a)*22);return true;}});

  /* ---------- нажатие без ведения = «иди туда» (первые походы) ---------- */
  var tp=null;
  function tapOk(){return on('tapgo')&&(S.runs|0)<K.tapRuns;}
  function bind(){if(o.bound)return;var cv=document.getElementById('cv')||document.querySelector('canvas');if(!cv)return;o.bound=1;
    cv.addEventListener('pointerdown',function(e){tp=null;if(!G||G.over||G.paused)return; /* без IN.on: этот слушатель может стоять раньше игрового (initInput) — тогда IN.on ещё false и нажатие терялось */G.nvGo=null;tp={x:e.clientX,y:e.clientY,t:Date.now(),id:e.pointerId};});
    cv.addEventListener('pointerup',function(e){var q=tp;tp=null;if(!q||!G||G.over||q.id!==e.pointerId)return;var ho=hitOk(G);if(!tapOk()&&!ho)return;
      if(Math.hypot(e.clientX-q.x,e.clientY-q.y)>12||Date.now()-q.t>450)return;var r=cv.getBoundingClientRect(),wx=G.cam.x+(e.clientX-r.left-VIEW.W/2)/VIEW.zoom,wy=G.cam.y+(e.clientY-r.top-VIEW.H/2)/VIEW.zoom;
      if(ho)strike(G,wx,wy);if(!tapOk())return;
      G.nvGo={x:wx,y:wy,t:0};if(!G.nvTap){G.nvTap=1;st('nv_tap',{s:Math.floor(G.t)});}});}
  /* ---------- tap1: «Хрясь!» — нажатие в первые секунды первого похода = рывок к пальцу и удар вокруг ---------- */
  function hitOk(g){var n=g&&g.nv;return !!(n&&n.hit&&n.first&&!g.over&&!g.paused&&g.t<K.hitT&&!(g.boss&&!g.boss.dead)&&on('tap1'));}
  function hintOn(g){var n=g.nv;if(on('fsth'))return !!(n&&n.first&&!g.over&&!g.paused&&g.nvMv==null&&g.t<K.hitT&&!n.demo&&!(g.boss&&!g.boss.dead));return hitOk(g)&&n.hit.n<K.hitHint&&!n.demo;}
  function strike(g,x,y){var n=g.nv,h=n.hit,H=g.hero,R=K.hitR,k=0,i,e,ex,ey,d;if(h.cd>0)return;h.cd=K.hitCd;h.n++;
    ex=x-H.x;ey=y-H.y;d=Math.hypot(ex,ey)||1;var j=Math.min(d,K.hitDash);for(i=0;i<5;i++)burst(H.x+ex/d*j*i/5,H.y+ey/d*j*i/5,'#ffe07a',2,60);
    H.x+=ex/d*j;H.y+=ey/d*j;if(Math.abs(ex)>4)H.flip=ex<0?-1:1;
    for(i=0;i<g.en.length;i++){e=g.en[i];if(e.dead||e.prop)continue;ex=e.x-H.x;ey=e.y-H.y;d=Math.hypot(ex,ey)||1;if(d>R+(e.r||0))continue;k++;hitEnemy(e,e.boss||e.elite?K.hitBig:e.hp+1,ex/d*320,ey/d*320);}
    g.fx.push({k:'wave',own:1,x:H.x,y:H.y,t:0,dur:.45,r1:R,col:'#ffe07a'});g.shake=Math.max(g.shake||0,7);try{vib(25);}catch(e){}
    heroSay(k?L('Хрясь!','Smash!'):L('Эх!','Hah!'));if(h.n===1)st('nv_hit',{s:Math.round(g.t*10)/10,k:k});if(g.nvMv==null)g.nvMv=g.t;}
  /* ---------- BG-FIRST 29.10 ---------- fsth: одна подсказка «Веди пальцем!» — рука-джойстик от богатыря к ближайшей нечисти, пока игрок не сдвинулся (вместо «Жми — ударь!», которая спорила с нижней «Веди пальцем…»; нажатие по-прежнему = «Хрясь!»).
     fstp: «сила с первой секунды» — в 0,15 с рядом встаёт кучка мелкой нечисти, в 0,9 с богатырь сам делает «Хрясь!» и раскидывает её (STAT fst_p). Выключить: ?bb2=-fsth / -fstp. */
  function dragHint(c,g){var W=VIEW.W,Hh=VIEW.H,z=VIEW.zoom,h=g.hero,hx=W/2+(h.x-VIEW.cx)*z,hy=Hh/2+(h.y-VIEW.cy)*z,e=nearEn(g),dx=1,dy=-.3,d,t=performance.now()/1000,k=Math.min(1,(t%1.5)/1.1),ox=hx,oy=Math.min(Hh-250,hy+95),f=typeof CVL!=='undefined'&&CVL.font||'sans-serif',s=L('Веди пальцем!','Drag your finger!'),ty=Math.max(120,hy-(h.r||16)*z-118);
    if(e){dx=W/2+(e.x-VIEW.cx)*z-hx;dy=Hh/2+(e.y-VIEW.cy)*z-hy;}d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
    c.save();c.globalAlpha=.9;c.strokeStyle='rgba(255,216,74,.75)';c.lineWidth=5;c.setLineDash([8,8]);c.beginPath();c.moveTo(ox,oy);c.lineTo(ox+dx*44*k,oy+dy*44*k);c.stroke();c.setLineDash([]);c.globalAlpha=1;
    hand(c,ox,oy,ox+dx*44*k,oy+dy*44*k);
    c.font='900 28px '+f;c.textAlign='center';c.textBaseline='middle';c.lineWidth=7;c.strokeStyle='rgba(40,20,0,.85)';var tx=Math.min(W-c.measureText(s).width/2-10,Math.max(c.measureText(s).width/2+10,hx));
    c.strokeText(s,tx,ty);c.fillStyle='#ffd84a';c.fillText(s,tx,ty);c.restore();}
  function power(g,n){var H=g.hero,i,a,e,R=K.hitR,k=0,ty=g.ch&&g.ch.en&&g.ch.en[0];if(!ty||typeof EN==='undefined'||!EN[ty])return;
    if(!n.pw&&g.t>=.15){n.pw=1;for(i=0;i<6;i++){a=i/6*6.283+.4;mkEnemy(ty,H.x+Math.cos(a)*(70+i%2*22),H.y+Math.sin(a)*(70+i%2*22));}return;}
    if(n.pw===1&&g.t>=.9){n.pw=2;for(i=0;i<g.en.length;i++){e=g.en[i];if(e.dead||e.prop||e.boss||e.elite)continue;var ex=e.x-H.x,ey=e.y-H.y,d=Math.hypot(ex,ey)||1;if(d>R+(e.r||0))continue;k++;hitEnemy(e,e.hp+1,ex/d*360,ey/d*360);}
      for(i=0;i<8;i++)burst(H.x+Math.cos(i/8*6.283)*40,H.y+Math.sin(i/8*6.283)*40,'#ffe07a',3,150);
      g.fx.push({k:'wave',own:1,x:H.x,y:H.y,t:0,dur:.5,r1:R+20,col:'#ffe07a'});g.shake=Math.max(g.shake||0,8);heroSay(L('Хрясь!','Smash!'));st('fst_p',{k:k});}}
  function nearEn(g){var H=g.hero,b=null,bd=1e9,i,e,d,sx,sy,z=VIEW.zoom;for(i=0;i<g.en.length;i++){e=g.en[i];if(e.dead||e.prop)continue;
      sx=VIEW.W/2+(e.x-VIEW.cx)*z;sy=VIEW.H/2+(e.y-VIEW.cy)*z;if(sx<40||sx>VIEW.W-40||sy<130||sy>VIEW.H-200)continue; /* не под шапкой и не под подсказкой внизу */d=Math.hypot(e.x-H.x,e.y-H.y);if(d<bd){bd=d;b=e;}}return b;}
  function hitHint(c,g){var e=nearEn(g),W=VIEW.W,Hh=VIEW.H,t=performance.now()/1000,x=W/2,y=Hh/2,z=VIEW.zoom,p=.5+.5*Math.sin(t*6);
    if(e){x=W/2+(e.x-VIEW.cx)*z;y=Hh/2+(e.y-VIEW.cy)*z;}
    c.save();c.strokeStyle='rgba(255,216,74,'+(.55+.4*p)+')';c.lineWidth=4;c.beginPath();c.arc(x,y,(e?e.r*z:30)+10+p*8,0,7);c.stroke();
    c.font='44px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('👆',x+10,y+30+p*10);
    c.font='900 26px '+(typeof CVL!=='undefined'?CVL.font:'sans-serif');c.lineWidth=6;c.strokeStyle='rgba(40,20,0,.85)';var s=L('Жми — ударь!','Tap to strike!'),ty=Math.max(90,y-(e?e.r*z:30)-30);
    c.strokeText(s,Math.min(W-90,Math.max(90,x)),ty);c.fillStyle='#ffd84a';c.fillText(s,Math.min(W-90,Math.max(90,x)),ty);c.restore();}
  bind();BB2.hook('ready',bind);
  function walk(g,dx,dy,dt){var H=g.hero,d=Math.hypot(dx,dy)||1,sp=g.st.spd;H.x+=dx/d*sp*dt;H.y+=dy/d*sp*dt;H.fx=dx/d;H.fy=dy/d;H.step+=dt*9;if(H.fx<-.15)H.flip=-1;else if(H.fx>.15)H.flip=1;H.moving=true;}
  function real(){var v=inputVec();return Math.hypot(v.x,v.y)>.05;}
  function tapGo(g,dt){var q=g.nvGo;if(!q)return;if(real()){g.nvGo=null;return;}var H=g.hero,dx=q.x-H.x,dy=q.y-H.y;q.t+=dt;
    if(Math.hypot(dx,dy)<8||q.t>5){g.nvGo=null;return;}walk(g,dx,dy,dt);try{STAT.move();}catch(e){}}

  /* ---------- автоход: рука сама ведёт богатыря три шага и возвращает управление ---------- */
  function demoStep(g,dt){var n=g.nv,d=n.demo;if(!d)return;d.t+=dt;if(d.t>=1.1||real()||g.nvGo){n.demo=null;n.idle=0;g.hero.moving=false;return;}walk(g,d.s,-.25,dt);}
  function demoGo(g){var n=g.nv;n.dn=(n.dn|0)+1;n.demo={t:0,s:n.dn%2?1:-1};n.idle=0;if(n.dn===1)st('nv_auto',{s:Math.floor(g.t),w:n.wait?1:0});}

  /* ---------- мир ждёт первого движения ---------- */
  function wake(g,k){var n=g.nv;if(!n||!n.wait)return;n.wait=0;g.hs=0;n.idle=0;st('nv_mv1',{k:k,s:Math.round(n.wt)});BB2.ev('nv','wake',g);}
  function waiter(){var g=typeof G!=='undefined'?G:null,n=g&&g.nv;if(!n||!n.wait||g.over)return;var t=performance.now(),dt=Math.min(.05,(t-n.w0)/1000);n.w0=t;
    if(!g.paused&&!document.hidden){n.wt+=dt;
      if(real())wake(g,IN.on?'drag':'key');else if(g.nvGo)wake(g,'tap');else if(n.wt>K.waitMax)wake(g,'auto');
      else{g.hs=1e9;if(n.demo){demoStep(g,dt);g.cam.x=g.hero.x;g.cam.y=g.hero.y;VIEW.cx=g.cam.x;VIEW.cy=g.cam.y;}else if(on('autowalk')&&(n.idle+=dt)>=K.idle)demoGo(g);rDirty=true;}}
    requestAnimationFrame(waiter);}

  /* ---------- начало первого похода ---------- */
  BB2.hook('run',function(g){wrapXp();if(BB2.nvMode||g.nvm)return;var camp=g.dif==='n'&&!g.endless&&!g.daily&&!g.weekly,pos=chPos(g.chi);
    if(!camp||pos!==1||g.short!==FIRST||!on('first2'))return;
    var n=g.nv={sc:1,first:g.first?1:0,idle:0,lv:0,saves:0,loaf:0,whHit:0,whOk:0,wt:0,nh:g.novHeal,s0:{d:S.stars[g.chi+'d'],t:S.stars[g.chi+'t']}};
    if(!n.first)return;
    g.banner=null;g.bq=[];if(g.tut){g.tut.xOff=1;var x=document.getElementById('tipX');if(x)x.classList.remove('on');}
    if(on('tap1')){n.hit={n:0,cd:0};st('nv_wait',{pc:PC?1:0,a:1});BB2.ev('nv','wake',g);return;} /* tap1: мир живой сразу, без заморозки */
    n.wait=1;n.w0=performance.now();g.hs=1e9;st('nv_wait',{pc:PC?1:0});requestAnimationFrame(waiter);});

  /* ---------- кадр ---------- */
  function gap(g){var n=g.nv,H=g.hero,a=Math.atan2(H.fy,H.fx),R=VIEW.R-20,i,e,d;for(i=0;i<g.en.length;i++){e=g.en[i];if(e.dead||e.boss||e.elite)continue;d=Math.hypot(e.x-H.x,e.y-H.y);
      if(d>R-50&&Math.abs(Math.atan2(Math.sin(Math.atan2(e.y-H.y,e.x-H.x)-a),Math.cos(Math.atan2(e.y-H.y,e.x-H.x)-a)))<.5)e.dead=true;}
    n.ring={x:H.x,y:H.y,a:a,t:0,R:R};BB2.ev('nv','ring',g);}
  function whistle(g,dt){var n=g.nv,e=g.boss,H=g.hero,w=n.wh;if(!e||e.dead||e.type!=='solo'||e.intro>0||g.win){n.wh=null;return;}e.at=9;
    if(!w){n.whT=(n.whT==null?K.whFirst:n.whT)-dt;if(n.whT<=0){n.wh={a:Math.atan2(H.y-e.y,H.x-e.x),t:K.whWarn};e.stun=K.whWarn;say(e,L('Фью-ю-ю-ить!','Fwee-ee-eet!'),1.1);}return;}
    w.t-=dt;if(w.t>0)return;n.wh=null;n.whT=K.whCd;SND.whistle();g.shake=8;
    var dx=H.x-e.x,dy=H.y-e.y,d=Math.hypot(dx,dy)||1,q=Math.atan2(dy,dx)-w.a;q=Math.abs(Math.atan2(Math.sin(q),Math.cos(q)));
    for(var i=0;i<6;i++)burst(e.x+Math.cos(w.a)*i*55,e.y+Math.sin(w.a)*i*55,'#bfe8ff',5,160);
    if(d<K.whR&&q<K.whAng){n.whHit++;n.pass=1;H.inv=0;hurtHero(g.st.maxHp*K.whDmg+g.st.armor,'solo');n.pass=0;H.kx+=dx/d*520;H.ky+=dy/d*520;}
    else{n.whOk++;heroSay(L('Увернулся!','Dodged!'));}}
  /* первые уровни без окна: сразу при наборе опыта (окно уровня открывается в конце того же кадра — крючок frame опаздывает) */
  function autoLv(g){var n=g.nv,H=g.hero;while(g.lvlQ>0&&H.hp>0&&(g.t<K.noWin||n.lv<K.autoLv)){var w=g.weapons[0],c=w.lvl<5?{t:'w',id:w.id,lvl:w.lvl+1}:rollCards(1)[0];if(!c)break;applyCard(c);g.lvlQ--;n.lv++;SND.level();
        heroSay(c.t==='w'&&c.id===w.id?L('Меч сильнее!','Stronger blade!'):qt(cardInfo(c).name)+'!');g.fx.push({k:'wave',own:1,x:H.x,y:H.y,t:0,dur:.5,r1:150,col:'#ffe07a'});BB2.ev('nv','lvl',g);}}
  function wrapXp(){if(o.axW||typeof addXp!=='function')return;o.axW=1;var ax0=addXp;addXp=function(v){ax0(v);var g=G,n=g&&g.nv;if(n&&n.first&&!g.over)autoLv(g);};} /* файл может прийти раньше game.js — оборачиваем при первом походе */
  BB2.hook('frame',function(dt,g){tapGo(g,dt);var n=g.nv,H=g.hero;if(!n)return;if(n.hit&&n.hit.cd>0)n.hit.cd-=dt;
    if(n.nh&&!g.novHeal){n.nh=0;n.loaf=1;}
    if(real()||g.nvGo){n.idle=0;n.still=0;if(g.nvMv==null)g.nvMv=g.t;}else{n.idle+=dt;n.still=(n.still||0)+dt;}
    if(n.first){
      if(n.pw!==2&&on('fstp')&&!g.over)power(g,n);
      if(n.demo)demoStep(g,dt);else if(on('autowalk')&&g.t<45&&n.idle>=K.idle&&!g.boss)demoGo(g);
      if(g.tut&&!n.x10&&g.t>=10){n.x10=1;if(TUT[g.tut.i]){g.tut.xOff=0;document.getElementById('tipX').classList.add('on');}}
      autoLv(g);}
    if(!n.ringD&&!g.ev.some(function(e){return e.k==='ring';})){n.ringD=1;gap(g);}
    var r=n.ring;if(r&&!r.out){r.t+=dt; /* стоять в кольце больно: раз в 0,6 с удар, пока не пошёл; каравай прилетел — кольцо отпускает */
      if(n.still>K.still&&r.t>2&&(r.h=(r.h||0)+dt)>=.6){r.h=0;n.pass=1;hurtHero(g.st.maxHp*K.ringHit+g.st.armor,g.ch.en[0]);n.pass=0;}
      if(Math.hypot(H.x-r.x,H.y-r.y)>r.R*.85||r.t>K.ringDur||n.loaf||n.saves){r.out=1;st('nv_ring',{s:Math.floor(g.t),l:n.loaf,v:n.saves});}}
    whistle(g,dt);});
  BB2.hook('hurt',function(d,src,g){var n=g.nv;if(!n)return;if(n.pass)return d;var r=n.ring;if(r&&!r.out&&n.still>K.still)return Math.max(d,g.st.maxHp*K.ringHit+g.st.armor);},60);
  BB2.hook('down',function(g){var n=g.nv;if(!n||!n.sc)return;n.saves++;revive(L('Рано падать, богатырь!','Too soon to fall, hero!'));return true;},10);
  BB2.hook('bossIn',function(e,g){if(g.nv)BB2.ev('nv','boss',g);});

  /* ---------- рисование ---------- */
  BB2.hook('draw',function(c,g){var q=g.nvGo,n=g.nv,B=VIEW.B,w,e;
    if(q){c.setTransform(B,0,0,B,(q.x-VIEW.cx)*B+cv.width/2,(q.y-VIEW.cy)*B+cv.height/2);c.drawImage(spDot(),-14,-14,28,28);}
    w=n&&n.wh;e=g.boss;if(w&&e){c.setTransform(B,0,0,B,(e.x-VIEW.cx)*B+cv.width/2,(e.y-VIEW.cy)*B+cv.height/2);c.rotate(w.a);c.globalAlpha=.45+.5*(1-w.t/K.whWarn);c.drawImage(spCone(),0,-190,340,380);c.globalAlpha=1;}
    if(q||w)c.setTransform(B,0,0,B,-VIEW.cx*B+cv.width/2,-VIEW.cy*B+cv.height/2);});
  BB2.hook('drawTop',function(c,g){var n=g.nv;if(!n)return;if(hintOn(g)&&!IN.on)(on('fsth')?dragHint:hitHint)(c,g);var W=VIEW.W,H=VIEW.H,h=g.hero,d=n.demo,r=n.ring,k;
    if(d){var ox=W/2,oy=H*.62,m=Math.min(1,d.t*4)*40;hand(c,ox,oy,ox+d.s*m,oy-m*.25);}
    k=1-h.hp/(g.st.maxHp||1);if(k>.35&&!g.over){c.globalAlpha=Math.min(.75,(k-.35)*1.2)*(.75+.25*Math.sin(g.t*7));c.drawImage(spRed(),0,0,W,H);c.globalAlpha=1;}
    if(r&&!r.out){var a=r.a,x=W/2+Math.cos(a)*Math.min(W,H)*.3,y=H/2+Math.sin(a)*Math.min(W,H)*.3,p=1+Math.sin(g.t*8)*.08;c.save();c.translate(x,y);c.rotate(a);c.scale(p,p);c.drawImage(spArrow(),-36,-24,72,48);c.restore();}});

  /* ---------- первая карточка: из двух и без цифр ---------- */
  BB2.hook('upOffer',function(cards,g){var n=g.nv;if(!n||!n.first||n.c2)return;n.c2=1;var w=g.weapons[0],a=[],id=g.weapons.some(function(q){return q.id==='perun';})?'fire':'perun';
    if(!g.wk.only)a.push({t:'w',id:id,lvl:1});if(w.lvl<5)a.push({t:'w',id:w.id,lvl:w.lvl+1});if(a.length<2)return;cards.length=0;cards.push(a[0],a[1]);st('nv_c2',{s:Math.floor(g.t)});});
  BB2.hook('upPick',function(c,cards,g){var n=g.nv;if(!n)return;if(n.c2===1){n.c2=2;st('nv_c2p',{k:c?c.id:'skip',s:Math.floor(g.t)});}BB2.ev('nv','card',g);});

  /* ---------- окна: первая карточка без цифр; итоги — честные звёзды ---------- */
  BB2.hook('modal',function(kind,m){var g=typeof G!=='undefined'?G:null,n=g&&g.nv;if(!n)return;
    if(kind==='level'&&n.c2===1){m.classList.add('nv2');var u=m.querySelectorAll('.upc'),i,s;for(i=0;i<u.length;i++){s=u[i].querySelector('div>span:last-child');if(s&&/\d/.test(s.textContent)){s.setAttribute('data-f',s.innerHTML);s.textContent=L('Твоё оружие станет сильнее','Your weapon gets stronger');}}
        var b=BB2.put(m,'end','<button class="btn ghost nvmore">'+L('Подробнее (цифры)','Details (numbers)')+'</button>','nvMore');b.firstChild.onclick=function(){m.classList.remove('nv2');var q=m.querySelectorAll('[data-f]'),j;for(j=0;j<q.length;j++)q[j].innerHTML=q[j].getAttribute('data-f');b.style.display='none';};}
    if(kind==='result'&&n.sc&&g.win&&g.starGot){var e=m.querySelector('.rstars small'),a=[];if(!g.starGot.d)a.push(L('вырвись из кольца без каравая','break out of the ring without the loaf'));if(!g.starGot.t)a.push(L('ни разу не попади под свист','never get caught by the whistle'));
        if(e&&a.length)e.innerHTML=L('Вернись за остальными: ','Come back for the rest: ')+a.join(L(' · ',' · '));}});
  try{var css=document.createElement('style');css.textContent='.nv2 .upc .delta{display:none}.nv2 .upc{padding-top:16px;padding-bottom:16px}.nv2 .upc b{font-size:18px}.nvmore{width:100%;margin-top:8px;font-size:13px;opacity:.8}';document.head.appendChild(css);}catch(e){}
  /* ---------- итог: честные звёзды первой главы (старые звёзды игрока не трогаем) ---------- */
  BB2.hook('end',function(g,win){var n=g.nv,k,i;
    if(n&&n.sc&&win&&g.starGot){var got={w:1,d:!n.loaf&&!n.saves?1:0,t:!n.whHit?1:0},nw=0;
      for(i=1;i<3;i++){k=STAR_K[i];if(!n.s0[k]){if(got[k])S.stars[g.chi+k]=1;else delete S.stars[g.chi+k];if(got[k])nw++;}}
      g.starNew=nw+(g.fw?1:0);g.starGot=got;st('nv_star',{d:got.d,t:got.t,l:n.loaf,v:n.saves,h:n.whHit,o:n.whOk});BB2.ev('nv','end',g);}});
})();
