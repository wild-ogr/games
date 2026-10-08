/* RB:MGC (08.10.2026) — мини-игра №10 «Ночные раки с фонарём».
   Ночь, мелководье у берега. Ведёшь пальцем — светишь фонарём по дну; раки выползают из-под камней (в темноте выдают себя блеском глаз).
   Тапни рака в пятне света — он в ведре. Подержишь на нём свет слишком долго (≥2,6 с, спокойный режим ≥4 с) — пугается и юркает под камень.
   Жёсткого таймера нет: за ночь выходит N раков (10–12, по зерну дня), игра кончается, когда все вышли и спрятались/пойманы.
   Иногда под камнем блестит находка (в Книгу двора). Награда: host.done({score: поймано, tier, rec, extra:{rk, kinds, find}}).
   Сохранение: S.mg.raki = {n, tot, rec, finds:{}, kinds:{}}. */
(function(){
'use strict';
var ID='raki',A=window.MGCA;
function L2(ru,en){return typeof L==='function'?L(ru,en):ru;}
function kc(k){return window.MG&&MG.kc?MG.kc(k):'';} /* RB:MGPC значок клавиши (виден только на ПК) */
function snd(k){try{if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(e){}}
function vib(ms){try{if(typeof buzz==='function')buzz(ms);}catch(e){}}
function today(){return typeof dayKey==='function'?dayKey(0):20261008;}
function st(){if(typeof S==='undefined')return {finds:{},kinds:{}};if(!S.mg||typeof S.mg!=='object')S.mg={};var m=S.mg[ID];if(!m||typeof m!=='object')m=S.mg[ID]={};
  if(!m.finds||typeof m.finds!=='object')m.finds={};if(!m.kinds||typeof m.kinds!=='object')m.kinds={};return m;}
var FINDS=[{id:'spoon',n:'Дедова блесна',en:'Grandpa\'s spoon lure'},{id:'coin',n:'Старинная копейка',en:'Old kopeck'},{id:'shell',n:'Речная ракушка-перловица',en:'River pearl mussel'},{id:'horse',n:'Подкова на счастье',en:'Lucky horseshoe'}];
function tierOf(c,n){var f=n?c/n:0;return c<=0?0:f>=.9?3:f>=.6?2:f>=.25?1:0;}

function needArt(cb){if(window.MGCA){A=window.MGCA;cb();return true;}var s=document.createElement('script');s.src='js/mg-mgc-art.js';s.onload=function(){A=window.MGCA;cb();};document.head.appendChild(s);return false;}
function run(host,o){
  if(!window.MGCA){needArt(function(){run(host,o);});return;}A=window.MGCA;
  o=o||{};A.css();var m=st(),seed=o.seed||today(),R0=A.rng(seed*17+11),calm=!!o.calm,q=new URLSearchParams(location.search),bot=o.bot||'';
  var NR=10+Math.floor(R0()*3),hasFind=R0()<.3,findK=FINDS[Math.floor(R0()*FINDS.length)];
  if(o.train)hasFind=false;
  var root=document.createElement('div');root.className='mgc mgc-nraki';host.el.appendChild(root);
  var cv=document.createElement('canvas');root.appendChild(cv);var g=cv.getContext('2d');
  root.insertAdjacentHTML('beforeend','<div class="mgc-top"><div class="mgc-ttl"></div><div class="mgc-sub"></div></div><div class="mgc-cnt"><span>0</span></div><div class="mgc-say"></div><div class="mgc-bot"></div><div class="mgc-fin"></div>');
  var $=function(s){return root.querySelector(s);},ttl=$('.mgc-ttl'),sub=$('.mgc-sub'),cnt=$('.mgc-cnt'),sayEl=$('.mgc-say'),botEl=$('.mgc-bot'),fin=$('.mgc-fin');
  cnt.insertBefore(A.icon('rak',34),cnt.firstChild);root.classList.add('cnt-on');A.fontOf(root);
  var W,H,G0,P,BG,DK,dk,T=0,last=0,raf=0,dead=false,ph='play',phT=0,sayT=0,parts=[],rips=[];
  var light={x:0,y:0,tx:0,ty:0,on:false},rk=[],stones=[],weeds=[],spawned=0,caught=0,hid=0,nextT=1.2,kinds={},find=null,gotFind=false,FL=null,bucket={n:0,bump:0};
  function ic(k){return window.LOOK?LOOK.I(k):'';}
  function say(txt,ms){sayEl.innerHTML=(window.LOOK&&LOOK.av?'<div class="av">'+LOOK.av('petr')+'</div>':'')+'<div><b>'+L2('Петрович','Petrovich')+':</b> '+txt+'</div>';sayEl.classList.add('on');sayT=(ms||3800)/1000;}
  /* геометрия: небо и дальний берег сверху, ниже — дно мелководья в перспективе */
  function yTop(){return H*(G0.land?.3:.27);}
  function scl(y){var t=Math.max(0,Math.min(1,(y-yTop())/(H-yTop())));return .55+.6*t;}
  function LR(){return Math.min(W,H)*(calm?.25:.2)*(G0.land?.9:1);}
  function resize(){var r=root.getBoundingClientRect();W=Math.max(200,r.width);H=Math.max(200,r.height);var d=A.dpr();cv.width=Math.round(W*d);cv.height=Math.round(H*d);g.setTransform(d,0,0,d,0,0);
    G0=A.geo(W,H,{shY:.27});G0.hz=H*(G0.land?.2:.17);G0.shY=yTop();P=A.pal('birch','night','sun');
    BG=document.createElement('canvas');BG.width=cv.width;BG.height=cv.height;var b=BG.getContext('2d');b.scale(d,d);paintBg(b);
    DK=document.createElement('canvas');DK.width=Math.round(W*Math.min(1,d));DK.height=Math.round(H*Math.min(1,d));dk=DK.getContext('2d');
    if(!light.on){light.x=light.tx=W*.5;light.y=light.ty=yTop()+(H-yTop())*.45;}
    FL=A.flies(A.low()?6:12,W,G0.hz-G0.u*6,yTop()+G0.u*4,seed%37);}
  function paintBg(b){var u=G0.u,hz=G0.hz,yt=yTop(),R=A.rng(seed%1000+5);
    A.scene(b,W,H,{W:W,H:H,u:u,land:G0.land,hz:hz,shY:yt,yAt:function(d){return yt-(yt-hz)*d;},sAt:function(d){return 1-d*.7;}},P,{seed:seed%1000,shore:false});
    /* дно: песок с галькой, ближе — крупнее; сверху — полупрозрачная вода */
    var bg=b.createLinearGradient(0,yt,0,H);bg.addColorStop(0,'#5a6a5a');bg.addColorStop(.4,'#8a8460');bg.addColorStop(1,'#a89a70');b.fillStyle=bg;
    b.beginPath();b.moveTo(0,yt+u*1.5);for(var x=0;x<=W+10;x+=W/16)b.lineTo(x,yt+Math.sin(x*.03)*u*.6);b.lineTo(W,H);b.lineTo(0,H);b.fill();
    for(var i=0;i<380;i++){var yy=yt+Math.pow(R(),.8)*(H-yt),s=scl(yy),r=u*(.25+R()*.7)*s;b.fillStyle=['#7a7466','#968e78','#6a6a5e','#b0a68a','#5e5a4e'][i%5];b.beginPath();b.ellipse(R()*W,yy,r*1.3,r*.8,R()*3,0,7);b.fill();}
    /* рябь песка */
    b.strokeStyle='rgba(60,50,30,.18)';b.lineWidth=Math.max(1,u*.25);for(i=0;i<40;i++){var y2=yt+R()*(H-yt),x2=R()*W,l=u*(4+R()*8)*scl(y2);b.beginPath();b.moveTo(x2,y2);b.quadraticCurveTo(x2+l/2,y2-u*.6,x2+l,y2);b.stroke();}
    /* топляк — затонувшая ветка */
    b.strokeStyle='#3a3020';b.lineCap='round';b.lineWidth=u*1.6;b.beginPath();b.moveTo(W*.62,H*.93);b.quadraticCurveTo(W*.8,H*.86,W*1.02,H*.88);b.stroke();b.lineWidth=u*.7;b.beginPath();b.moveTo(W*.78,H*.875);b.lineTo(W*.84,H*.81);b.stroke();
    /* камни-укрытия */
    stones=[];var nS=G0.land?9:8,cols=G0.land?5:4;
    for(i=0;i<nS;i++){var row=Math.floor(i/cols),col=i%cols,sx=W*((col+.5+(row%2?.35:-.1))/(cols+.2)),sy=yt+(H-yt)*(.16+row*.4)+(R()-.5)*u*5,ss=scl(sy)*u*(6+R()*3.5);
      sx=Math.max(ss*1.2,Math.min(W-ss*1.2,sx));stones.push({x:sx,y:sy,s:ss});drawStone(b,sx,sy,ss,R);}
    /* вода поверх дна: лёгкий сине-зелёный слой и блики поверхности */
    var wg=b.createLinearGradient(0,yt,0,H);wg.addColorStop(0,'rgba(20,60,70,.55)');wg.addColorStop(1,'rgba(30,80,80,.25)');b.fillStyle=wg;b.fillRect(0,yt,W,H-yt);
    weeds=[];for(i=0;i<9;i++)weeds.push({x:R()*W,y:yt+(H-yt)*(.1+R()*.85),h:u*(6+R()*8),ph:R()*7});}
  function drawStone(b,x,y,s,R){b.fillStyle='rgba(0,0,0,.35)';b.beginPath();b.ellipse(x+s*.15,y+s*.35,s*1.15,s*.45,0,0,7);b.fill();
    var gr=b.createRadialGradient(x-s*.3,y-s*.35,s*.1,x,y,s*1.2);gr.addColorStop(0,'#9a968a');gr.addColorStop(.6,'#6e6c64');gr.addColorStop(1,'#46443e');b.fillStyle=gr;
    b.beginPath();b.moveTo(x-s,y+s*.2);b.quadraticCurveTo(x-s*1.05,y-s*.5,x-s*.3,y-s*.62);b.quadraticCurveTo(x+s*.5,y-s*.8,x+s*.95,y-s*.1);b.quadraticCurveTo(x+s*1.1,y+s*.35,x+s*.4,y+s*.42);b.quadraticCurveTo(x-s*.5,y+s*.5,x-s,y+s*.2);b.fill();
    b.fillStyle='rgba(90,120,60,.45)';b.beginPath();b.ellipse(x-s*.2,y-s*.45,s*.4,s*.12,-.2,0,7);b.fill();
    b.fillStyle='rgba(10,8,5,.75)';b.beginPath();b.ellipse(x,y+s*.3,s*.55,s*.13,0,0,7);b.fill();}
  function bucketPos(){return {x:W*(G0.land?.9:.83),y:H*.965,s:G0.u*(G0.land?9:10)};}

  /* ---------- раки ---------- */
  function spawn(){var i,best=null,bd=-1;for(i=0;i<stones.length;i++){var s=stones[i],d=Math.hypot(s.x-light.x,s.y-light.y)+Math.random()*G0.u*30;if(d>bd&&!stones[i].busy){bd=d;best=s;}}if(!best)best=stones[0];
    best.busy=1;var r=Math.random(),k=r<.01?'gold':r<.05?'blue':r<.4?'dlin':'shir';if(spawned===NR-3&&hasFind&&!find){find={st:best,t:0,on:1};}
    rk.push({x:best.x,y:best.y+best.s*.25,home:best,st:'out',t:0,lit:0,k:k,a:Math.random()*7,v:G0.u*(calm?4:5.5),tx:0,ty:0,wob:Math.random()*7,life:6+Math.random()*3});spawned++;
    rips.push({x:best.x,y:best.y,t0:T,s:G0.u*3});}
  function pickTarget(r){var a=Math.random()*Math.PI*2,d=G0.u*(8+Math.random()*14);r.tx=Math.max(G0.u*4,Math.min(W-G0.u*4,r.home.x+Math.cos(a)*d*1.6));r.ty=Math.max(yTop()+G0.u*4,Math.min(H*.93,r.home.y+Math.sin(a)*d*.8+G0.u*6));}
  function inLight(x,y){return Math.hypot(x-light.x,(y-light.y)*1.25)<LR()*.92;}
  function tapAt(x,y){if(ph!=='play')return;var hit=null,hd=1e9;rk.forEach(function(r){if(r.st!=='out'&&r.st!=='flee')return;var d=Math.hypot(x-r.x,y-r.y);if(d<hd){hd=d;hit=r;}});
    var rr=hit?Math.max(40,G0.u*9*scl(hit.y)):0;
    if(hit&&hd<rr&&inLight(hit.x,hit.y)){grab(hit);return true;}
    if(find&&find.on&&!gotFind&&inLight(find.st.x,find.st.y)&&Math.hypot(x-find.st.x,y-find.st.y)<Math.max(40,find.st.s*1.4)){gotFind=true;find.on=0;snd('newf');say(L2('Гляди-ка, под камнем: ','Look under the stone: ')+'<b>'+L2(findK.n,findK.en)+'</b>! '+L2('В Книгу двора.','Into the yard book.'),4200);
      for(var i=0;i<14;i++)parts.push({x:find.st.x,y:find.st.y,vx:(Math.random()-.5)*G0.u*30,vy:-G0.u*(6+Math.random()*16),t:0,life:.8,k:'spark'});return true;}
    return false;}
  function grab(r){r.st='net';r.t=0;r.bx=r.x;r.by=r.y;r.home.busy=0;snd('splash');vib(20);rips.push({x:r.x,y:r.y,t0:T,s:G0.u*5});
    for(var i=0;i<10;i++)parts.push({x:r.x,y:r.y,vx:(Math.random()-.5)*G0.u*24,vy:-G0.u*(5+Math.random()*12),t:0,life:.6,k:'drop'});}
  function inBucket(r){r.st='done';caught++;bucket.n++;bucket.bump=1;kinds[r.k]=(kinds[r.k]||0)+1;cnt.querySelector('span').textContent=caught;cnt.classList.remove('pop');void cnt.offsetWidth;cnt.classList.add('pop');snd('coin');
    if(r.k==='blue')say(L2('Голубой! Вот это ночь!','A blue one! What a night!'),2600);
    else if(caught===1)say(L2('Есть первый! Свети потихоньку — рак света не любит.','First one! Easy with the light — they dislike it.'),3600);
    else if(Math.random()<.25)say([L2('Ловко!','Neat!'),L2('В ведро его, красавца.','Into the bucket.'),L2('Вот это рука!','What a hand!')][Math.floor(Math.random()*3)],1800);}
  function hide(r){r.st='hide';r.t=0;}
  function hidden(r){r.st='gone';hid++;r.home.busy=0;rips.push({x:r.x,y:r.y,t0:T,s:G0.u*3});if(hid===1)say(L2('Спрятался! Долго светил — он и юркнул. Лови сразу.','He hid! Too much light. Grab them quickly.'),3600);}

  function upd(dt){T+=dt;phT+=dt;if(sayT>0){sayT-=dt;if(sayT<=0)sayEl.classList.remove('on');}
    if(ph==='play'&&(K.l||K.r||K.u||K.d)){var ks=Math.max(W,H)*(calm?.42:.55)*dt;light.on=true;light.tx=Math.max(0,Math.min(W,light.tx+((K.r?1:0)-(K.l?1:0))*ks));light.ty=Math.max(yTop(),Math.min(H,light.ty+((K.d?1:0)-(K.u?1:0))*ks));} /* RB:MGPC стрелки ведут фонарь */
    var k=Math.min(1,dt*(bot?6:14));light.x+=(light.tx-light.x)*k;light.y+=(light.ty-light.y)*k;
    if(ph==='play'){nextT-=dt;var out=rk.filter(function(r){return r.st==='out'||r.st==='flee';}).length;
      if(spawned<NR&&nextT<=0&&out<(calm?2:3)){spawn();nextT=(calm?2.6:1.9)*(.7+Math.random()*.6);}
      var lim=calm?4:2.6;
      rk.forEach(function(r){r.t+=dt;
        if(r.st==='out'){if(!r.tx||Math.hypot(r.tx-r.x,r.ty-r.y)<G0.u*1.5)pickTarget(r);var dx=r.tx-r.x,dy=r.ty-r.y,d=Math.hypot(dx,dy)||1,v=r.v*scl(r.y);
          if(inLight(r.x,r.y)){r.lit+=dt;v*=.35;}else r.lit=Math.max(0,r.lit-dt*.5);
          r.a=Math.atan2(dy,dx);r.x+=dx/d*v*dt;r.y+=dy/d*v*dt;
          if(r.lit>lim||r.t>r.life*(calm?1.4:1)){r.st='flee';r.t=0;}}
        else if(r.st==='flee'){var hx=r.home.x,hy=r.home.y+r.home.s*.2,dx2=hx-r.x,dy2=hy-r.y,d2=Math.hypot(dx2,dy2);r.a=Math.atan2(-dy2,-dx2);/* пятится хвостом вперёд */
          var sp=G0.u*(calm?14:20)*scl(r.y);if(d2<sp*dt+1)hidden(r);else{r.x+=dx2/d2*sp*dt;r.y+=dy2/d2*sp*dt;}}
        else if(r.st==='net'){var bp=bucketPos(),kb=Math.min(1,r.t/.55);r.x=r.bx+(bp.x-r.bx)*kb;r.y=r.by+(bp.y-bp.s*.8-r.by)*kb-Math.sin(kb*Math.PI)*H*.12;r.a+=dt*10;if(kb>=1)inBucket(r);}
        if(bot&&r.st==='out'&&!r.bq){r.bq=1;var p=bot==='good'?1:bot==='mid'?.6:.25;r.botGo=Math.random()<p;r.botT=.5+Math.random()*.6;}
      });
      /* бот: ведёт свет к ближайшему, ловит после задержки */
      if(bot){var tg=null,bd=1e9;rk.forEach(function(r){if(r.st==='out'&&r.botGo){var d=Math.hypot(r.x-light.x,r.y-light.y);if(d<bd){bd=d;tg=r;}}});
        if(tg){light.tx=tg.x;light.ty=tg.y;if(inLight(tg.x,tg.y)&&tg.t>tg.botT)tapAt(tg.x,tg.y);}
        else{var any=rk.filter(function(r){return r.st==='out';})[0];if(any){light.tx=any.x+G0.u*40*(any.x<W/2?1:-1);light.ty=any.y;}}}
      if(spawned>=NR&&!rk.some(function(r){return r.st==='out'||r.st==='flee'||r.st==='net';})&&phT>1)end();}
    if(bucket.bump>0)bucket.bump=Math.max(0,bucket.bump-dt*3);
    for(var j=parts.length-1;j>=0;j--){var p2=parts[j];p2.t+=dt;p2.x+=p2.vx*dt;p2.y+=p2.vy*dt;p2.vy+=G0.u*60*dt;if(p2.t>p2.life)parts.splice(j,1);}}
  function draw(){var u=G0.u,yt=yTop(),lr=LR();g.drawImage(BG,0,0,W,H);
    /* водоросли */
    g.lineCap='round';weeds.forEach(function(w){var s=scl(w.y);g.strokeStyle='rgba(60,100,50,.8)';g.lineWidth=Math.max(1,u*.5*s);for(var i=0;i<3;i++){g.beginPath();g.moveTo(w.x+i*u,w.y);g.quadraticCurveTo(w.x+i*u+Math.sin(T+w.ph+i)*u*2,w.y-w.h*s*.5,w.x+i*u+Math.sin(T*.8+w.ph+i)*u*3,w.y-w.h*s);g.stroke();}});
    /* находка */
    if(find&&find.on){var fs=find.st;A.star(g,fs.x+fs.s*.2,fs.y+fs.s*.25,u*1.3*(.6+.4*Math.sin(T*5)),'rgba(255,230,140,.9)');}
    /* раки */
    rk.forEach(function(r){if(r.st==='done'||r.st==='gone')return;var s=scl(r.y),L=u*(G0.land?13:15)*s;
      A.rak(g,r.x,r.y,L,r.a,{t:T+r.wob,k:r.k,walk:r.st==='out'?.6:r.st==='flee'?1.6:0,claw:r.st==='net'?1:.3+.3*Math.sin(T*2+r.wob),curl:r.st==='flee'?.5:r.st==='net'?.9:0});});
    rips=rips.filter(function(r){return A.ripple(g,r,T);});
    A.drawShim(g,{W:W,yAt:function(d){return yt-(yt-G0.hz)*d*.9;},shY:yt,u:u},SHM,T,P);
    /* темнота с пятном фонаря */
    var d=DK.width/W;dk.setTransform(d,0,0,d,0,0);dk.globalCompositeOperation='source-over';dk.clearRect(0,0,W,H);
    var dg=dk.createLinearGradient(0,0,0,H);dg.addColorStop(0,'rgba(2,6,18,.15)');dg.addColorStop(Math.max(0,Math.min(1,(yt-u*4)/H)),'rgba(2,6,18,.25)');dg.addColorStop(Math.min(1,(yt+u*6)/H),'rgba(2,8,16,.72)');dg.addColorStop(1,'rgba(2,8,16,.78)');dk.fillStyle=dg;dk.fillRect(0,0,W,H);
    dk.globalCompositeOperation='destination-out';dk.save();dk.translate(light.x,light.y);dk.scale(1,.8);var lg=dk.createRadialGradient(0,0,lr*.15,0,0,lr);lg.addColorStop(0,'rgba(0,0,0,1)');lg.addColorStop(.7,'rgba(0,0,0,.85)');lg.addColorStop(1,'rgba(0,0,0,0)');dk.fillStyle=lg;dk.beginPath();dk.arc(0,0,lr,0,7);dk.fill();dk.restore();
    /* ведро и Петрович слегка видны в отсвете */
    var bp=bucketPos();dk.save();dk.translate(bp.x,bp.y-bp.s*.5);var bg2=dk.createRadialGradient(0,0,1,0,0,bp.s*2.2);bg2.addColorStop(0,'rgba(0,0,0,.6)');bg2.addColorStop(1,'rgba(0,0,0,0)');dk.fillStyle=bg2;dk.fillRect(-bp.s*3,-bp.s*3,bp.s*6,bp.s*6);dk.restore();
    g.drawImage(DK,0,0,W,H);
    /* тёплый свет фонаря поверх */
    g.save();g.globalCompositeOperation='lighter';g.translate(light.x,light.y);g.scale(1,.8);A.glow(g,0,0,lr,'255,210,140',.16);g.restore();
    /* каустика в пятне */
    if(!A.low()){g.save();g.beginPath();g.ellipse(light.x,light.y,lr*.85,lr*.68,0,0,7);g.clip();g.strokeStyle='rgba(255,240,200,.12)';g.lineWidth=Math.max(1,u*.3);
      for(var i=0;i<7;i++){var cy=light.y-lr*.6+i*lr*.2;g.beginPath();for(var x=light.x-lr;x<=light.x+lr;x+=u*2)g.lineTo(x,cy+Math.sin(x*.05+T*1.5+i)*u*1.2);g.stroke();}g.restore();}
    /* блеск глаз в темноте — подсказка, где рак */
    rk.forEach(function(r){if(r.st!=='out')return;if(inLight(r.x,r.y))return;var s=scl(r.y),L=u*15*s,a=.45+.4*Math.sin(T*4+r.wob),ex=Math.cos(r.a)*L*.27,ey=Math.sin(r.a)*L*.27,px=-Math.sin(r.a)*L*.05,py=Math.cos(r.a)*L*.05;
      g.fillStyle='rgba(255,170,90,'+a+')';g.beginPath();g.arc(r.x+ex+px,r.y+ey+py,1.6+u*.25,0,7);g.arc(r.x+ex-px,r.y+ey-py,1.6+u*.25,0,7);g.fill();});
    /* луч фонаря от игрока (снизу) */
    g.save();g.globalCompositeOperation='lighter';var sx=W*.5,sy=H+u*4;var bm=g.createLinearGradient(sx,sy,light.x,light.y);bm.addColorStop(0,'rgba(255,220,150,.10)');bm.addColorStop(1,'rgba(255,220,150,.02)');g.fillStyle=bm;
    var ang=Math.atan2(light.y-sy,light.x-sx),nx=-Math.sin(ang),ny=Math.cos(ang);g.beginPath();g.moveTo(sx-nx*u*3,sy-ny*u*3);g.lineTo(light.x-nx*lr*.7,light.y-ny*lr*.55);g.lineTo(light.x+nx*lr*.7,light.y+ny*lr*.55);g.lineTo(sx+nx*u*3,sy+ny*u*3);g.fill();g.restore();
    /* раки в сачке поверх темноты */
    rk.forEach(function(r){if(r.st!=='net')return;var s=scl(r.y);A.rak(g,r.x,r.y,u*15*s,r.a,{t:T,k:r.k,claw:1,curl:.9});});
    /* Петрович по колено в воде слева с фонарём-«летучей мышью», ведро справа */
    var pH=H*(G0.land?.5:.3),px2=W*(G0.land?.1:.17),py2=H*(G0.land?1.1:1.04);
    A.petr(g,px2,py2,pH,{P:A.pal('birch','evening','sun'),t:T,pose:caught&&bucket.bump>.3?'cheer':'stand',dir:1,smile:caught>0});
    var wl=py2-pH*.3,wgr=g.createLinearGradient(0,wl,0,H);wgr.addColorStop(0,'rgba(20,55,65,.75)');wgr.addColorStop(1,'rgba(10,30,40,.9)');g.fillStyle=wgr;g.beginPath();g.moveTo(-5,wl);for(var xx=0;xx<=px2+pH*.5;xx+=u*2)g.lineTo(xx,wl+Math.sin(xx*.08+T*2)*u*.4);g.quadraticCurveTo(px2+pH*.6,wl+pH*.2,px2+pH*.42,H+5);g.lineTo(-5,H+5);g.fill();/* вода по колено */
    g.strokeStyle='rgba(220,240,255,.35)';g.lineWidth=Math.max(1,u*.3);g.beginPath();g.ellipse(px2,wl+u*.3,pH*.2,u*1.2,0,0,7);g.stroke();
    var ls=u*(G0.land?3.6:3.2),up=caught&&bucket.bump>.3;A.lamp(g,px2+pH*(up?.28:.195),py2-pH*(up?.93:.353)+ls*1.15,ls,T,true);
    drawBucket(g,bp);
    parts.forEach(function(q2){var a=1-q2.t/q2.life;if(q2.k==='drop'){g.fillStyle='rgba(215,238,250,'+(.8*a)+')';g.beginPath();g.ellipse(q2.x,q2.y,u*.35,u*.6,0,0,7);g.fill();}else A.star(g,q2.x,q2.y,u*1.2*a+1,'rgba(255,224,120,'+a+')');});
    if(FL)A.drawFlies(g,FL,T,u,true);
    /* RB:MGPC на ПК первые разы — значок «Пробел» над раком, которого поймает клавиша */
    if(host.pc&&!bot&&ph==='play'&&caught<3&&window.MG&&MG.keycap){var kt=keyTarget();if(kt)MG.keycap(g,kt.x,Math.max(yTop()+18,kt.y-u*15*scl(kt.y)*.55-14),L2('Пробел','Space'),Math.round(Math.max(24,Math.min(30,u*5))));}}
  function drawBucket(g2,bp){var s=bp.s*(1+bucket.bump*.06),x=bp.x,y=bp.y,u=G0.u;
    g2.fillStyle='rgba(0,0,0,.3)';g2.beginPath();g2.ellipse(x,y,s*.7,s*.14,0,0,7);g2.fill();
    var gr=g2.createLinearGradient(x-s*.55,0,x+s*.55,0);gr.addColorStop(0,'#5d666b');gr.addColorStop(.5,'#a8b2b8');gr.addColorStop(1,'#4f585d');g2.fillStyle=gr;
    g2.beginPath();g2.moveTo(x-s*.55,y-s);g2.lineTo(x+s*.55,y-s);g2.lineTo(x+s*.42,y);g2.lineTo(x-s*.42,y);g2.closePath();g2.fill();
    g2.strokeStyle='rgba(0,0,0,.25)';g2.lineWidth=Math.max(1,s*.03);[.3,.65].forEach(function(k){g2.beginPath();g2.moveTo(x-s*(.55-.13*k),y-s+s*k);g2.lineTo(x+s*(.55-.13*k),y-s+s*k);g2.stroke();});
    g2.fillStyle='#2a3a3e';g2.beginPath();g2.ellipse(x,y-s,s*.55,s*.14,0,0,7);g2.fill();
    for(var i=0;i<Math.min(5,bucket.n);i++)A.rak(g2,x-s*.3+i*s*.15,y-s*1.02,s*.5,-Math.PI/2+(i%2?.4:-.4),{t:T+i,k:'shir',noShadow:1,walk:.2});
    g2.strokeStyle='#8a949a';g2.lineWidth=Math.max(1.5,s*.04);g2.beginPath();g2.ellipse(x,y-s,s*.55,s*.14,0,0,7);g2.stroke();g2.beginPath();g2.arc(x,y-s*1.05,s*.55,Math.PI*1.1,Math.PI*1.9);g2.stroke();}

  function end(){if(ph!=='play')return;ph='end';phT=0;var tier=tierOf(caught,NR),rec=!o.train&&caught>(m.rec||0);
    if(!o.train&&!bot){m.n=(m.n||0)+1;m.tot=(m.tot||0)+caught;if(rec)m.rec=caught;for(var k in kinds)m.kinds[k]=(m.kinds[k]||0)+kinds[k];if(gotFind)m.finds[findK.id]=1;A.save();}
    say(tier===3?L2('Полное ведро! Ну ты мастер ночной ловли.','A full bucket! Night master.'):tier>=2?L2('Хороша ночка! Завтра — раки к ухе.','Good night! Crayfish for the soup.'):L2('Ничего, рак — зверь хитрый. Завтра ещё сходим.','Crayfish are sly. We\'ll try tomorrow.'),3600);
    var res=function(){var n=o.train?0:caught;stop();fin.classList.remove('on');root.classList.remove('fin-on');sayEl.classList.remove('on');botEl.innerHTML='';host.done({score:caught,tier:tier,rec:rec,scoreTxt:L2('Поймано','Caught')+': <b>'+caught+' '+L2('из','of')+' '+NR+'</b>',extra:{rk:n,kinds:kinds,find:gotFind?findK.id:'',n:NR,
      line:(gotFind?L2('Находка: ','Find: ')+L2(findK.n,findK.en):'')}});};
    if(bot){setTimeout(res,100);return;}
    setTimeout(function(){if(dead)return;sayEl.classList.remove('on');
      fin.innerHTML='<h2>'+(o.train?L2('Тренировка','Practice'):L2('Ночной улов','Night catch'))+'</h2><div class="stars"></div><div class="big"></div><p>'+L2('Поймано ','Caught ')+'<b>'+caught+' '+L2('из','of')+' '+NR+'</b></p>'+
        (gotFind?'<p><b>'+L2('Находка: ','Find: ')+L2(findK.n,findK.en)+'</b></p>':'')+(rec?'<div class="rec">'+L2('Рекорд ночи!','Night record!')+'</div>':'')+
        '<button class="btn green" id="nrOk" data-enter>'+(o.train?L2('Готово','Done'):L2('Забрать','Collect'))+kc('Enter')+'</button>';
      var stw=fin.querySelector('.stars');for(var i=0;i<3;i++)stw.appendChild(A.icon('star',52,{off:i>=tier}));var big=fin.querySelector('.big');big.appendChild(A.icon('rak',64));var sp=document.createElement('span');sp.textContent='× '+caught;big.appendChild(sp);
      fin.classList.add('on');root.classList.add('fin-on');if(tier>=2)snd(tier===3?'record':'newf');
      fin.querySelector('#nrOk').onclick=function(){snd('coin');res();};},1200);}
  function stop(){dead=true;cancelAnimationFrame(raf);removeEventListener('resize',resize);}
  host.onquit=stop;
  var SHM=null;
  function frame(ts){if(dead)return;if(!root.isConnected){stop();return;}var dt=Math.min(.05,(ts-last)/1000||.016);last=ts;if(host.paused){dt=0;K={};}upd(dt);draw();raf=requestAnimationFrame(frame);} /* RB:MGPC пауза оболочки — время ночи стоит */
  /* один палец: ведёшь — свет идёт за пальцем; коснулся рака в свете — поймал */
  var down=false;
  /* RB:MGPC мышь: свет идёт за курсором и без нажатия; щелчок — поймать; над раком в свете — «рука». Палец — как было (ведёшь с нажатием). */
  function pxy(e){var r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function canHit(x,y){if(ph!=='play')return false;for(var i=0;i<rk.length;i++){var r=rk[i];if((r.st==='out'||r.st==='flee')&&inLight(r.x,r.y)&&Math.hypot(x-r.x,y-r.y)<Math.max(40,G0.u*9*scl(r.y)))return true;}
    return !!(find&&find.on&&!gotFind&&inLight(find.st.x,find.st.y)&&Math.hypot(x-find.st.x,y-find.st.y)<Math.max(40,find.st.s*1.4));}
  cv.addEventListener('pointerdown',function(e){if(e.button>0||!G0)return;var p=pxy(e);down=true;light.on=true;if(!tapAt(p.x,p.y)){light.tx=p.x;light.ty=Math.max(yTop(),p.y);}try{cv.setPointerCapture(e.pointerId);}catch(er){}});
  cv.addEventListener('pointermove',function(e){if((!down&&e.pointerType!=='mouse')||!G0)return;var p=pxy(e);light.on=true;light.tx=p.x;light.ty=Math.max(yTop(),p.y);
    if(e.pointerType==='mouse'){var c=canHit(p.x,p.y)?'pointer':'crosshair';if(cv.style.cursor!==c)cv.style.cursor=c;}});
  var up=function(){down=false;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('lostpointercapture',up);
  /* RB:MGPC клавиши: стрелки — фонарь, пробел/Enter — поймать рака в пятне света (ближнего к середине пятна) */
  var K={},KM={ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d'};
  function keyTarget(){var best=null,bd=1e9;rk.forEach(function(r){if((r.st==='out'||r.st==='flee')&&inLight(r.x,r.y)){var d=Math.hypot(r.x-light.x,r.y-light.y);if(d<bd){bd=d;best=r;}}});return best;}
  host.keys(function(k){if(KM[k]){if(ph==='play')K[KM[k]]=1;return true;}
    if(k===' '||k==='Enter'){if(ph!=='play')return ph==='end'&&!fin.classList.contains('on');var t=keyTarget();if(t)tapAt(t.x,t.y);else if(find&&find.on&&!gotFind&&inLight(find.st.x,find.st.y))tapAt(find.st.x,find.st.y);return true;}
    return false;});
  host.keysUp(function(k){if(KM[k]){K[KM[k]]=0;return true;}return false;});
  host.amb('night','night'); /* RB:MGPC всегда ночь у воды */
  addEventListener('resize',resize);resize();SHM=A.shim({W:W,u:G0.u},seed%53).slice(0,30);
  ttl.textContent=o.train?L2('Тренировка: ночные раки','Practice: night crayfish'):L2('Ночные раки','Night crayfish');sub.textContent=host.pc?L2('Свети мышкой, щёлкни по раку в свете','Shine with the mouse, click a crayfish in the light'):L2('Веди пальцем, лови рака в свете','Drag to shine, tap to catch');
  host.kbd(host.L('Свети мышкой или '+kc('←')+kc('→')+kc('↑')+kc('↓')+' · лови — щелчок или '+kc('Пробел'),'Shine: mouse or '+kc('←')+kc('→')+kc('↑')+kc('↓')+' · catch: click or '+kc('Space')),9);
  say(L2('Глаза у рака в темноте блестят — туда и свети. Лови сразу, а то спрячется!','At night crayfish crawl out. Their eyes glint in the dark — shine there, and grab fast.'),6500);
  window.__mgc={get ph(){return ph;},rk:rk,tap:tapAt,light:light,get caught(){return caught;},inLight:inLight};
  raf=requestAnimationFrame(function(ts){last=ts;frame(ts);});}

/* авто-игрок без экрана: доля пойманных по уровню */
function sim(q,seed){var p=q==='good'?.97:q==='mid'?.68:.3,R=(window.MGCA||{rng:function(){return Math.random;}}).rng(seed||Math.floor(Math.random()*1e9)),n=10+Math.floor(R()*3),c=0;for(var i=0;i<n;i++)if(R()<p)c++;return {score:c,tier:tierOf(c,n),n:n};}

var DEF={id:ID,n:{ru:'Ночные раки',en:'Night crayfish'},icon:'nraki',kind:'score',
  open:function(){return typeof S!=='undefined'&&!!(S.open&&S.open[5]);}, /* с Байкала; в праздник FEST — всем (решает оболочка) */
  run:run,sim:sim};
(window.MG_REG?window.MG_REG:function(d){(window.MG_PEND=window.MG_PEND||[]).push(d);})(DEF);
})();
