/* bb2-lov-ivpech.js — «Печь Ивана» (ловкостная на рекорд, поток LOVA; id ivpech — id pech занят старой Забавой «Печь»).
   Иван-дурак едет на печи и ставит её к терему между телегой, колодцем и гусями. Веди пальцем (печь едет туда, куда тянешь; потянул назад — задний ход),
   на ПК — стрелки. Печь заносит. Встал в рамку ровно и замер — двор сдан: +время, следующий двор теснее. Задел — −2 с и блин из трубы. Счёт — дворы. */
(function(){
var K=LOVK,TAU=Math.PI*2,FW=360,FH=560;
/* числа игры (не экономика) */
var N={t0:28,add:[9,8,7,6],pen:2,vmax:150,acc:260,turn:3.1,grip:5.5,hold:.45,pw:36,ph:50};
var CAR=[['Опять он на печи!','He’s on that stove again!'],['Ровнее ставь, Ваня!','Park it straight, Vanya!'],['Гусей не пугай!','Don’t scare the geese!'],['Блины-то не растряси!','Don’t shake up the pancakes!'],['По щучьему велению — левее!','By the pike’s command — more to the left!']]; // i18n:ru — пары [рус, англ] / русская раскладка
function slotF(n){return Math.max(1.22,1.62-.05*n);}
function gen(n,r){var Y={slot:null,obs:[],geese:[],n:n},side=n<2?0:Math.floor(r()*3),f=slotF(n),w=N.pw*f+6,h=N.ph*f*.92+6,i,t;
  if(side===0)Y.slot={x:70+r()*220,y:58+h/2,w:w,h:h,ax:0};else Y.slot={x:side===1?34+h/2:FW-34-h/2,y:150+r()*170,w:h,h:w,ax:1,sd:side};
  Y.start={x:120+r()*120,y:FH-70,th:-Math.PI/2};
  var cnt=Math.min(7,2+Math.floor(n*.8)),kinds=['cart','well','hay'],R={cart:34,well:22,hay:26};
  function free(x,y,rad){if(Math.hypot(x-Y.start.x,y-Y.start.y)<rad+78)return false;if(Math.hypot(x-Y.slot.x,y-Y.slot.y)<rad+Math.max(Y.slot.w,Y.slot.h)/2+46)return false;
    if(Y.slot.ax===0&&Math.abs(x-Y.slot.x)<rad+30&&y<Y.slot.y+150)return false;if(Y.slot.ax===1&&Math.abs(y-Y.slot.y)<rad+30&&Math.abs(x-Y.slot.x)<150)return false;
    for(var j=0;j<Y.obs.length;j++)if(Math.hypot(x-Y.obs[j].x,y-Y.obs[j].y)<rad+Y.obs[j].r+52)return false;return true;}
  for(i=0,t=0;i<cnt&&t<300;t++){var k=kinds[Math.floor(r()*3)],x=44+r()*(FW-88),y=120+r()*(FH-260);if(!free(x,y,R[k]))continue;Y.obs.push({k:k,x:x,y:y,r:R[k],a:k==='cart'?(r()<.5?0:Math.PI/2):0});i++;}
  var gn=n<1?0:Math.min(3,1+Math.floor(n/3));for(i=0,t=0;i<gn&&t<200;t++){var gx=50+r()*(FW-100),gy=140+r()*(FH-300);if(!free(gx,gy,12))continue;var ga=r()*TAU;Y.geese.push({x:gx,y:gy,x0:gx,y0:gy,dx:Math.cos(ga),dy:Math.sin(ga),ph:r()*TAU,sp:16+r()*10+n,r:10,gone:0});i++;}
  return Y;}
function run(host,o){
  var c=ZABK.canvas(host),g=c.getContext('2d'),P=[],H=null,Y=null,car=null,time=N.t0,sc=0,live=false,over=false,dead=0,holdT=0,joy=null,keys={},hits=0,blin=[],note=null,fade=0,demo=0,demoT=0,lastHit=-9,T=0,bub=null,smoke=0;
  function rnd(){return Math.random();}
  function newYard(){Y=gen(sc,rnd);car={x:Y.start.x,y:Y.start.y,th:Y.start.th,vx:0,vy:0,v:0};holdT=0;fade=1;}
  function geo(){var W=c.W,Hh=c.H,top=K.top()+92,k=Math.min(W/FW,(Hh-top-6)/FH);return {W:W,H:Hh,k:k,ox:(W-FW*k)/2,oy:top+(Hh-top-6-FH*k)/2};}
  var grass=null,gk=0;
  function mkGrass(G){gk=G.k*1000+c.D;grass=document.createElement('canvas');grass.width=Math.ceil(FW*G.k*c.D);grass.height=Math.ceil(FH*G.k*c.D);var x=grass.getContext('2d'),i;x.setTransform(G.k*c.D,0,0,G.k*c.D,0,0);
    var gr=x.createLinearGradient(0,0,0,FH);gr.addColorStop(0,'#7fbd4e');gr.addColorStop(1,'#5f9f3a');x.fillStyle=gr;x.fillRect(0,0,FW,FH);
    for(i=0;i<90;i++){var px=(i*97)%FW,py=(i*193)%FH;x.fillStyle=i%3?'rgba(255,255,255,.07)':'rgba(40,90,20,.16)';x.beginPath();x.ellipse(px,py,10+i%9,5+i%4,0,0,TAU);x.fill();}
    x.strokeStyle='#6b4320';x.lineWidth=7;x.strokeRect(10,10,FW-20,FH-20);x.strokeStyle='#a9763c';x.lineWidth=3;x.strokeRect(10,10,FW-20,FH-20);
    for(i=0;i<60;i++){var q=i/60,fx=q<.25?10+(FW-20)*q*4:q<.5?FW-10:q<.75?FW-10-(FW-20)*(q-.5)*4:10,fy=q<.25?10:q<.5?10+(FH-20)*(q-.25)*4:q<.75?FH-10:FH-10-(FH-20)*(q-.75)*4;x.fillStyle='#5a3618';x.beginPath();x.arc(fx,fy,4.5,0,TAU);x.fill();}}
  function drawObs(b,now){g.save();g.translate(b.x,b.y);g.lineWidth=2;g.strokeStyle='#3a2410';
    if(b.k==='cart'){g.rotate(b.a);g.fillStyle='#2a1a0c';[[-24,-19],[14,-19],[-24,13],[14,13]].forEach(function(w){K.rr(g,w[0],w[1],10,6,2);g.fill();});g.fillStyle='#a9763c';K.rr(g,-30,-15,60,30,4);g.fill();g.stroke();g.strokeStyle='rgba(58,36,16,.5)';for(var i=-20;i<=20;i+=10){g.beginPath();g.moveTo(i,-14);g.lineTo(i,14);g.stroke();}
      g.fillStyle='#e8c860';g.beginPath();g.ellipse(0,0,20,10,0,0,TAU);g.fill();g.strokeStyle='#3a2410';g.beginPath();g.moveTo(30,0);g.lineTo(44,0);g.stroke();}
    else if(b.k==='well'){g.fillStyle='#9a9388';g.beginPath();g.arc(0,0,22,0,TAU);g.fill();g.stroke();g.fillStyle='#2f5f86';g.beginPath();g.arc(0,0,13,0,TAU);g.fill();g.stroke();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(-4,-4,4,0,TAU);g.fill();g.fillStyle='#6b4320';g.fillRect(-25,-3,50,5);g.strokeRect(-25,-3,50,5);}
    else{g.fillStyle='#e6c452';g.beginPath();g.arc(0,0,26,0,TAU);g.fill();g.stroke();g.strokeStyle='rgba(120,84,20,.6)';for(var j=0;j<9;j++){var a=j*.7;g.beginPath();g.moveTo(Math.cos(a)*6,Math.sin(a)*6);g.lineTo(Math.cos(a+.2)*22,Math.sin(a+.2)*22);g.stroke();}g.fillStyle='#f6dc7a';g.beginPath();g.arc(-5,-6,8,0,TAU);g.fill();}
    g.restore();}
  function drawGoose(q,now){if(q.gone>=1)return;g.save();g.translate(q.x,q.y-(q.gone*60));g.globalAlpha=1-q.gone;g.rotate(Math.atan2(q.dy,q.dx)*(Math.sin(now*1.3+q.ph)>0?1:1));g.lineWidth=1.6;g.strokeStyle='#3a2410';
    g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,11,8,0,0,TAU);g.fill();g.stroke();g.beginPath();g.arc(11,0,4.6,0,TAU);g.fill();g.stroke();g.fillStyle='#f08a1a';g.beginPath();g.moveTo(15,-2);g.lineTo(21,0);g.lineTo(15,2);g.fill();g.fillStyle='#3a2410';g.beginPath();g.arc(12,-1.5,.9,0,TAU);g.fill();
    if(q.gone>0){g.fillStyle='#fff';g.beginPath();g.ellipse(-2,-9-Math.sin(now*30)*3,7,3,-.4,0,TAU);g.fill();g.stroke();g.beginPath();g.ellipse(-2,9+Math.sin(now*30)*3,7,3,.4,0,TAU);g.fill();g.stroke();}g.restore();}
  function drawCar(now){g.save();g.translate(car.x,car.y);g.rotate(car.th+Math.PI/2);g.fillStyle='rgba(20,40,10,.28)';K.rr(g,-N.pw/2+3,-N.ph/2+5,N.pw,N.ph,7);g.fill();
    g.lineWidth=2.2;g.strokeStyle='#3a2410';g.fillStyle='#f6efe0';K.rr(g,-N.pw/2,-N.ph/2,N.pw,N.ph,7);g.fill();g.stroke();g.fillStyle='#3a3028';K.rr(g,-9,-N.ph/2-2,18,9,4);g.fill();
    g.fillStyle='#c94a32';g.beginPath();g.arc(-N.pw/2+9,-N.ph/2+11,6,0,TAU);g.fill();g.stroke();g.fillStyle='#2a1a0c';g.beginPath();g.arc(-N.pw/2+9,-N.ph/2+11,3,0,TAU);g.fill();
    g.fillStyle='#5a8fd0';K.rr(g,-3,-6,16,26,6);g.fill();g.stroke();g.fillStyle='#ffd9b0';g.beginPath();g.arc(5,-11,7,0,TAU);g.fill();g.stroke();g.fillStyle='#e0b040';g.beginPath();g.arc(5,-14,7,Math.PI,TAU);g.fill();
    g.strokeStyle='#4a78b8';g.lineWidth=2;for(var i=-N.pw/2+5;i<N.pw/2;i+=7){g.beginPath();g.moveTo(i,N.ph/2-7);g.lineTo(i+3,N.ph/2-3);g.stroke();}g.restore();}
  function drawSlot(now){var s=Y.slot,okA=aligned(),q=holdT/N.hold;g.save();g.translate(s.x,s.y);g.fillStyle=okA&&inSlot()?'rgba(255,226,122,.5)':'rgba(255,255,255,.2)';K.rr(g,-s.w/2,-s.h/2,s.w,s.h,8);g.fill();
    g.setLineDash([9,6]);g.lineDashOffset=-now*14;g.lineWidth=3.5;g.strokeStyle=okA&&inSlot()?'#ffe27a':'#fff6dc';g.stroke();g.setLineDash([]);
    if(q>0){g.strokeStyle='#8fd14a';g.lineWidth=6;g.beginPath();g.arc(0,0,16,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,q));g.stroke();}g.restore();
    var tx=s.ax===0?s.x:s.sd===1?24:FW-24,ty=s.ax===0?28:s.y,ts=64;ZABK.put(g,'tm_terem',tx,ty,ts,c.D*geo().k);}
  function inSlot(){var s=Y.slot;return Math.abs(car.x-s.x)<s.w/2-N.pw*.34&&Math.abs(car.y-s.y)<s.h/2-N.pw*.34;}
  function aligned(){var s=Y.slot,a=car.th-(s.ax===0?Math.PI/2:0),d=Math.abs(Math.atan2(Math.sin(2*a),Math.cos(2*a)))/2;return d<.38;}
  function pts(){var cx=Math.cos(car.th),sy=Math.sin(car.th);return [[car.x+cx*12,car.y+sy*12],[car.x-cx*12,car.y-sy*12]];}
  function hit(nx,ny,why){var now=T;car.x+=nx*4;car.y+=ny*4;var dot=car.vx*nx+car.vy*ny;if(dot<0){car.vx-=1.5*dot*nx;car.vy-=1.5*dot*ny;}car.v*=-.35;
    if(now-lastHit<.7||demo)return;lastHit=now;hits++;time-=N.pen;K.snd('crack');K.vib(40);if(!o.calm)host._sh=6;blin.push({x:car.x,y:car.y,vx:(Math.random()-.5)*120,vy:-170,t:0});note={t:'−'+N.pen+L(' с · ',' s · ')+why,a:1.4};}
  function physics(dt){var ax=0,ay=0,m=0,i,p,b;
    if(demo){var s=Y.slot,tx=s.x,ty=s.y+(s.ax===0?(Math.abs(car.x-s.x)>14&&car.y<s.y+120?90:0):0),d=Math.hypot(tx-car.x,ty-car.y);ax=(tx-car.x)/(d||1);ay=(ty-car.y)/(d||1);m=inSlot()&&aligned()?0:Math.min(1,d/90+.25);joy={ox:FW/2,oy:FH-60,x:FW/2+ax*40*m,y:FH-60+ay*40*m,fake:1};}
    else if(joy){ax=joy.x-joy.ox;ay=joy.y-joy.oy;m=Math.hypot(ax,ay);if(m>6){ax/=m;ay/=m;m=Math.min(1,m/42);}else m=0;}
    var thr=0,rot=0;
    if(m>0){var want=Math.atan2(ay,ax),df=Math.atan2(Math.sin(want-car.th),Math.cos(want-car.th));
      if(Math.abs(df)>2.2&&car.v<40){thr=-.55*m;df=Math.atan2(Math.sin(want+Math.PI-car.th),Math.cos(want+Math.PI-car.th));}else thr=m*(Math.abs(df)>1.2?.55:1);
      rot=K.clamp(df*2.2,-1,1);}
    else{thr=(keys.up?1:0)-(keys.down?.55:0);rot=((keys.right?1:0)-(keys.left?1:0))*(car.v<-2?-1:1);}
    var tv=thr*N.vmax;car.v+=K.clamp(tv-car.v,-N.acc*dt*(thr===0?1.4:1),N.acc*dt);car.th+=rot*N.turn*dt*K.clamp(Math.abs(car.v)/70,0,1);
    var hx=Math.cos(car.th)*car.v,hy=Math.sin(car.th)*car.v,gq=Math.min(1,N.grip*dt);car.vx+=(hx-car.vx)*gq;car.vy+=(hy-car.vy)*gq;car.x+=car.vx*dt;car.y+=car.vy*dt;
    var slip=Math.hypot(hx-car.vx,hy-car.vy);smoke-=dt;if((slip>45||Math.abs(car.v)>100)&&smoke<=0){smoke=slip>45?.04:.12;P.push({x:car.x-Math.cos(car.th)*22,y:car.y-Math.sin(car.th)*22,vx:(Math.random()-.5)*20,vy:-18,t:0,d:.7,c:slip>45?'#fff':'rgba(255,255,255,.6)',s:slip>45?6:4,g:0,k:'dot'});}
    p=pts();for(i=0;i<2;i++){if(p[i][0]<28)hit(1,0,L('плетень','the fence'));else if(p[i][0]>FW-28)hit(-1,0,L('плетень','the fence'));if(p[i][1]<28)hit(0,1,L('плетень','the fence'));else if(p[i][1]>FH-28)hit(0,-1,L('плетень','the fence'));
      for(var j=0;j<Y.obs.length;j++){b=Y.obs[j];var cs=b.k==='cart'?[[b.x+Math.cos(b.a)*15,b.y+Math.sin(b.a)*15,18],[b.x-Math.cos(b.a)*15,b.y-Math.sin(b.a)*15,18]]:[[b.x,b.y,b.r]];
        for(var q=0;q<cs.length;q++){var dx=p[i][0]-cs[q][0],dy=p[i][1]-cs[q][1],dd=Math.hypot(dx,dy)||1;if(dd<cs[q][2]+16)hit(dx/dd,dy/dd,b.k==='cart'?L('телега','the cart'):b.k==='well'?L('колодец','the well'):L('стог','the haystack'));}}
      for(j=0;j<Y.geese.length;j++){b=Y.geese[j];if(b.gone)continue;if(Math.hypot(p[i][0]-b.x,p[i][1]-b.y)<b.r+15){b.gone=.01;if(!demo){lastHit=-9;var vx=car.vx,vy=car.vy,v=car.v;hit(0,0,L('гусь: «Га-га!»','goose: “Honk!”'));car.vx=vx;car.vy=vy;car.v=v*.6;K.snd('whistle');}}}}
    for(j=0;j<Y.geese.length;j++){b=Y.geese[j];if(b.gone){b.gone=Math.min(1,b.gone+dt*1.5);continue;}var w=Math.sin(T*.8+b.ph);b.x=b.x0+b.dx*w*34;b.y=b.y0+b.dy*w*34;}
    if(inSlot()&&aligned()&&Math.abs(car.v)<16){holdT+=dt;if(holdT>=N.hold)parked();}else holdT=Math.max(0,holdT-dt*2);}
  function parked(){K.snd('win');ZABK.burst(P,car.x,car.y,{n:18,col:'#ffe27a',k:'star',s:6,sp:200});
    if(demo){demo=0;joy=null;sc=0;time=N.t0;hits=0;note={t:L('Теперь ты!','Your turn!'),a:1.8};newYard();return;}
    sc++;H.set(sc);var add=N.add[Math.min(N.add.length-1,Math.floor((sc-1)/2))];time+=add;note={t:L('Двор сдан! +'+add+' с','Yard done! +'+add+' s'),a:1.5};bub={t:L.apply(null,K.pick(CAR)),a:2.2};newYard();}
  function finish(){if(over)return;over=true;live=false;if(H)H.end();host.done({score:sc,extra:{msg:hits>sc+1?L('Задел '+hits+' раз: −'+N.pen+' с за каждый','Bumped '+hits+'×: −'+N.pen+' s each'):L('К рамке — прямо, отпускай заранее','Go straight in, let go early')}});}
  ZABK.loop(host,function(dt,now){var G=geo(),i;T+=dt;if(!grass||gk!==G.k*1000+c.D)mkGrass(G);
    if(live&&!over&&!dead&&Y){physics(dt);if(!demo){time-=dt;if(time<=0){time=0;dead=1;K.snd('lose');K.cont(host,o,sc,function(ok){if(!ok){finish();return;}dead=0;time=12;});}}else{demoT+=dt;if(demoT>9){demoT=0;parked();}}}
    host._sh=Math.max(0,(host._sh||0)-dt*30);fade=Math.max(0,fade-dt*3);if(note){note.a-=dt;if(note.a<=0)note=null;}if(bub){bub.a-=dt;if(bub.a<=0)bub=null;}
    g.setTransform(c.D,0,0,c.D,0,0);g.fillStyle='#3f7426';g.fillRect(0,0,G.W,G.H);g.save();g.translate(G.ox+(host._sh?(Math.random()-.5)*host._sh:0),G.oy);g.scale(G.k,G.k);g.drawImage(grass,0,0,FW,FH);
    if(Y){drawSlot(now);for(i=0;i<Y.obs.length;i++)drawObs(Y.obs[i],now);for(i=0;i<Y.geese.length;i++)drawGoose(Y.geese[i],now);drawCar(now);
      for(i=blin.length-1;i>=0;i--){var b=blin[i];b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=420*dt;if(b.t>1){blin.splice(i,1);continue;}g.fillStyle='#e8b84a';g.strokeStyle='#8a5a1c';g.lineWidth=1.5;g.beginPath();g.ellipse(b.x,b.y,8,8*Math.abs(Math.cos(b.t*9))+1.5,0,0,TAU);g.fill();g.stroke();}
      ZABK.parts(g,P,dt);
      if(bub){var s=Y.slot;K.say(g,bub.t,s.ax===0?s.x:FW/2,s.ax===0?80:s.y-36,FW,bub.a);}
      if(joy&&!joy.fake){g.fillStyle='rgba(255,255,255,.12)';g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=2;g.beginPath();g.arc(joy.ox,joy.oy,42,0,TAU);g.fill();g.stroke();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(joy.ox+K.clamp(joy.x-joy.ox,-42,42),joy.oy+K.clamp(joy.y-joy.oy,-42,42),16,0,TAU);g.fill();}
      if(joy&&joy.fake)K.finger(g,joy.x,joy.y,1);
      if(fade>0){g.fillStyle='rgba(255,246,220,'+fade*.6+')';g.fillRect(0,0,FW,FH);}}
    g.restore();
    if(live&&!demo){var bw=Math.min(G.W*.5,220),low=time<8;K.bar(g,G.W/2-bw/2,K.top()+72,bw,12,time/N.t0,low?'#ff5a3a':'#ffd25a',low?'#ff8a3a':'#8fd14a');ZABK.text(g,Math.ceil(time)+L(' с',' s'),G.W/2+bw/2+26,K.top()+79,16,{col:low?'#ffb0a0':'#fff6dc'});
      if(sc===0&&time>N.t0-7&&!note)K.tag(g,G.W,G.H-26,zabPC()?L('Стрелки: ↑ ход, ↓ назад, ← → руль','Arrows: ↑ go, ↓ reverse, ← → steer'):L('Тяни палец — печь едет туда. Назад — задний ход','Drag — the stove follows. Pull back to reverse'));}
    if(demo)K.tag(g,G.W,K.top()+116,L('Смотри: встань в рамку ровно и замри','Watch: stop inside the frame, straight and still'));
    if(note){g.globalAlpha=Math.min(1,note.a*2);K.tag(g,G.W,G.H*.5,note.t,'rgba(150,40,20,.88)');g.globalAlpha=1;}
  });
  function loc(x,y){var G=geo();return [(x-G.ox)/G.k,(y-G.oy)/G.k];}
  K.ptr(c,host,{down:function(x,y){if(demo||!live)return;var p=loc(x,y);joy={ox:p[0],oy:p[1],x:p[0],y:p[1]};},move:function(x,y,held){if(!held||!joy||joy.fake)return;var p=loc(x,y);joy.x=p[0];joy.y=p[1];var dx=joy.x-joy.ox,dy=joy.y-joy.oy,d=Math.hypot(dx,dy);if(d>56){joy.ox=joy.x-dx/d*56;joy.oy=joy.y-dy/d*56;}},up:function(){if(joy&&!joy.fake)joy=null;}});
  var KM={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right','ц':'up','ы':'down','ф':'left','в':'right'}; // i18n:ru — пары [рус, англ] / русская раскладка
  function kd(e){if(KM[e.key]){keys[KM[e.key]]=1;if(/^Arrow/.test(e.key))e.preventDefault();}}function ku(e){if(KM[e.key])keys[KM[e.key]]=0;}
  window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);host.onQuit(function(){window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);});
  host.dbg={st:function(){return {sc:sc,time:time,car:car,slot:Y&&Y.slot,hits:hits,demo:demo,live:live,in:Y?inSlot():0,al:Y?aligned():0};},joy:function(ax,ay){joy=ax==null?null:{ox:180,oy:400,x:180+ax*42,y:400+ay*42};},Y:function(){return Y;}};
  newYard();
  ZREC.start(host,o,function(){H=ZREC.hud(host,o);sc=0;time=N.t0;hits=0;T=0;live=true;if(o.first&&!o.again){demo=1;demoT=0;}newYard();});
}
function sim(o,k){var r=o&&o.rnd||Math.random,t=N.t0,sc=0;for(;;){var need=(5.2+sc*.45)*(1.9-k)*(.8+.4*r())+(r()<(1-k)*.6?N.pen+1.5:0);t-=need;if(t<0||sc>40)break;sc++;t+=N.add[Math.min(N.add.length-1,Math.floor((sc-1)/2))];}return {score:sc,tier:ZREC.tier('ivpech',sc)};}
ZAB_REG({id:'ivpech',kind:'lov',n:zabN('Печь Ивана','Ivan’s Stove'),run:run,sim:sim});
})();
