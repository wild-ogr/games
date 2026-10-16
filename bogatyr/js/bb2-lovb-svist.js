/* bb2-lovb-svist.js — «Свист Соловья» (ловкостная на рекорд, поток LOVB). Соловей-разбойник свистит — богатыря сдувает. Держи палец слева или справа
   (стрелки ←/→) — упирайся против ветра и стой в круге. Порывы меняют сторону; Соловей набирает воздух — видно, куда дунет. Каждые 30 с у него
   кончается воздух (передышка), потом свистит злее. Счёт — секунды. Договор — шапка js/bb2-zab-ui.js. */
(function(){
var K=LOVK,TAU=Math.PI*2;
/* числа игры (не экономика): x — место в круге −1…1, сила упора P, ветер до P×wMax */
var N={warm:4,P:2.4,damp:1.1,ramp:.22,w0:.55,wK:.016,wMax:1.6,d0:2.6,dK:.022,dMin:.75,tele:.55,lap:30,rest:3,lapK:.12,calm:.8};
function wmax(t,calm){return Math.min(N.wMax,N.w0+N.wK*t)*(calm?N.calm:1);}
function segGen(t,r,prev,calm){var d=Math.max(N.dMin,N.d0-N.dK*t)*(.7+.6*r()),dir=prev&&r()<.72?-prev.dir:(r()<.5?-1:1),s=wmax(t,calm)*(.7+.3*r());
  if(t<N.warm)s*=.5;return {t0:t,d:d,dir:dir,s:s,gust:r()<.25&&t>12};}
/* ветер в момент t по отрезку (с разгоном и спадом) */
function windAt(sg,t){var q=(t-sg.t0)/sg.d;if(q<0||q>1)return 0;var e=Math.min(1,q*5,(1-q)*6);var g=sg.gust&&q>.45&&q<.62?1.25:1;return sg.dir*sg.s*e*g;}
var SAY=[[8,['Фью-у-у!','Whee-ew!']],[20,['Да что ж ты такой тяжёлый!','Why are you so heavy?!']],[30,['Уф… воздух кончился…','Phew… out of breath…']],[45,['Шлем-то улетел!','There goes the helmet!']], // i18n:ru
  [60,['Соловей посинел!','The Nightingale’s turned blue!']],[90,['Свистну так, что лапти слетят!','I’ll whistle your boots off!']],[120,['Всё, иду в певчие…','That’s it, I’m joining the choir…']]]; // i18n:ru
function run(host,o){
  var c=ZABK.canvas(host),g=c.getContext('2d'),P=[],H=null,st=null,live=false,over=false,dead=0,demo=0,demoT=0,bub=null,seen={},rnd=Math.random,spr={},s0=0,hk='dob';
  try{hk=typeof skinKey==='function'?skinKey(S.hero):S.hero;if(!ART['h_'+hk+'_0'])hk='dob';}catch(e){hk='dob';}
  function reset(){st={t:0,x:0,v:0,w:0,in:0,sg:null,nx:null,rest:0,lap:0,helm:null,hT:0,dT:0,why:'',shake:0,flash:0,msg:0,leaves:[],tilt:0,ins:0};st.sg=segGen(.3,rnd,null,o.calm);st.sg.s*=.6;st.nx=segGen(st.sg.t0+st.sg.d,rnd,st.sg,o.calm);bub=null;dead=0;}
  function geo(){var W=c.W,Hh=c.H,R=K.clamp(Math.min(W*.36,(Hh-K.top()-120)*.4),90,260);return {W:W,H:Hh,cx:W/2,gy:Hh*.72,R:R,hp:K.clamp(R*.95,80,180)};}
  function mk(w,h,fn){var d=c.D,q=document.createElement('canvas');q.width=Math.ceil(w*d);q.height=Math.ceil(h*d);var x=q.getContext('2d');x.setTransform(d,0,0,d,0,0);fn(x,w,h);return q;}
  function sprites(G){if(s0===G.R+c.D*1000)return;s0=G.R+c.D*1000;
    spr.leaf=mk(18,10,function(x){x.fillStyle='#6fb04a';x.beginPath();x.ellipse(9,5,8,3.6,.3,0,TAU);x.fill();x.strokeStyle='#3d7a26';x.lineWidth=1;x.beginPath();x.moveTo(2,6);x.lineTo(16,4);x.stroke();});
    spr.str=mk(60,6,function(x){var gr=x.createLinearGradient(0,0,60,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;K.rr(x,0,1,60,4,2);x.fill();});
    spr.helm=mk(36,30,function(x){x.fillStyle='#c2ccd8';x.strokeStyle='#5a6470';x.lineWidth=2;x.beginPath();x.moveTo(4,24);x.quadraticCurveTo(4,4,18,2);x.quadraticCurveTo(32,4,32,24);x.closePath();x.fill();x.stroke();
      x.fillStyle='#e6b53a';x.fillRect(3,22,30,5);x.fillStyle='#c2ccd8';x.beginPath();x.moveTo(16,2);x.lineTo(18,-6+6);x.lineTo(20,2);x.fill();});}
  var bg=K.bg(c,function(x,W,Hh){var G=geo(),gr=x.createLinearGradient(0,0,0,G.gy);gr.addColorStop(0,'#7fb8e0');gr.addColorStop(1,'#d8ecd0');x.fillStyle=gr;x.fillRect(0,0,W,G.gy);
    x.fillStyle='#9fc888';x.beginPath();x.moveTo(0,G.gy);for(var i=0;i<=10;i++)x.lineTo(W*i/10,G.gy-Hh*(.06+.04*Math.sin(i*1.7)));x.lineTo(W,G.gy);x.fill();
    gr=x.createLinearGradient(0,G.gy,0,Hh);gr.addColorStop(0,'#78b048');gr.addColorStop(1,'#4a7e2c');x.fillStyle=gr;x.fillRect(0,G.gy,W,Hh-G.gy);
    /* круг, в котором надо устоять */
    x.fillStyle='rgba(230,210,150,.55)';x.beginPath();x.ellipse(G.cx,G.gy+G.R*.08,G.R*1.04,G.R*.2,0,0,TAU);x.fill();
    x.strokeStyle='#8a5a2c';x.lineWidth=3;x.setLineDash([8,6]);x.beginPath();x.ellipse(G.cx,G.gy+G.R*.08,G.R*1.04,G.R*.2,0,0,TAU);x.stroke();x.setLineDash([]);
    /* дуб Соловья сверху */
    var ty=K.top()+128,tx=G.cx;x.fillStyle='#5d3a1c';x.fillRect(tx-W*.035,ty+30,W*.07,Hh*.08);x.fillStyle='#3d8a35';x.beginPath();x.ellipse(tx,ty+30,W*.32,44,0,0,TAU);x.fill();x.fillStyle='#4aa83e';x.beginPath();x.ellipse(tx-W*.08,ty+18,W*.16,26,0,0,TAU);x.fill();});
  function say(t,a){bub={t:L(t[0],t[1]),a:a||2.4};}
  function setIn(d){if(!live||dead||over||demo)return;st.in=d;}
  function kill(){if(dead||demo)return;dead=1;st.dT=0;K.snd('hurt');K.vib(90);if(!o.calm)st.shake=8;
    st.why=st.x>0?L('Сдуло вправо — держи палец слева, когда дует вправо','Blown right — hold LEFT when the wind blows right'):L('Сдуло влево — держи палец справа, когда дует влево','Blown left — hold RIGHT when the wind blows left');
    if(Math.abs(st.v)>1.6)st.why=L('Слишком сильно упёрся — порыв кончился, и ты сам вылетел. Отпускай раньше','Leaned too hard — the gust stopped and you flew out yourself. Let go sooner');}
  function finish(){if(over)return;over=true;live=false;if(H)H.end();host.done({score:Math.floor(st.t),extra:{msg:st.why}});}
  function afterDeath(){K.cont(host,o,Math.floor(st.t),function(ok){if(!ok){finish();return;}dead=0;st.x=0;st.v=0;st.rest=1.5;st.shake=0;});}
  function step(dt){var t=st.t;if(t>=st.sg.t0+st.sg.d){st.sg=st.nx;st.nx=segGen(st.sg.t0+st.sg.d,rnd,st.sg,o.calm);}
    var lap=Math.floor(t/N.lap);if(lap>st.lap){st.lap=lap;st.rest=N.rest;if(!demo){say(SAY[2][1]);K.snd('level');st.flash=.4;}}
    if(st.rest>0){st.rest-=dt;st.w=0;var sh=st.rest>0?0:1;st.sg.t0=st.t+.4;st.sg.d=Math.max(st.sg.d,.8);st.nx.t0=st.sg.t0+st.sg.d;}
    else st.w=windAt(st.sg,t)*N.P;
    st.ins+=(st.in-st.ins)*Math.min(1,dt/N.ramp);var a=st.w+st.ins*N.P;st.v+=a*dt;st.v*=Math.exp(-N.damp*dt);st.x+=st.v*dt;
    if(st.t<N.warm||demo){if(Math.abs(st.x)>.92){st.x=.92*(st.x>0?1:-1);st.v*=-.3;}}
    else if(Math.abs(st.x)>1)kill();}
  ZABK.loop(host,function(dt,now){var G=geo(),i;sprites(G);
    if(live&&!dead&&!over){if(demo){demoT+=dt;var want=-(st.w/N.P*.9+st.x*1.6+st.v*.5);st.in=want>.15?1:want<-.15?-1:0;if(demoT>4.5){demo=0;reset();st.msg=1.6;}}
      step(dt);if(!demo){st.t+=0;H.set(Math.floor(st.t));for(i=0;i<SAY.length;i++)if(i!==2&&Math.floor(st.t)===SAY[i][0]&&!seen[i]){seen[i]=1;say(SAY[i][1]);}}st.t+=dt;
      if(Math.abs(st.x)>.68&&!st.helm&&!demo&&st.t>N.warm){st.helm={x:G.cx+st.x*G.R,y:G.gy-G.hp*.85,vx:(st.x>0?1:-1)*220,vy:-260,r:0};K.snd('whistle');}
      if(Math.abs(st.w)>.3&&Math.random()<Math.abs(st.w)*dt*6)st.leaves.push({x:st.w>0?-20:G.W+20,y:K.top()+180+Math.random()*(G.gy-K.top()-140),vx:st.w*120+(st.w>0?140:-140),r:Math.random()*6,k:Math.random()<.5});}
    if(dead&&!over){st.dT+=dt;st.x+=(st.x>0?1:-1)*dt*1.4;if(dead===1&&st.dT>.9){dead=2;afterDeath();}}
    st.shake=Math.max(0,st.shake-dt*30);st.flash=Math.max(0,st.flash-dt);if(st.msg>0)st.msg-=dt;st.tilt+=((st.w/N.P)*.35-st.in*.18-st.tilt)*Math.min(1,dt*8);
    bg(g);g.save();if(st.shake>0)g.translate((Math.random()-.5)*st.shake,(Math.random()-.5)*st.shake);
    /* Соловей на дубу: набирает воздух перед порывом и смотрит, куда дунет */
    var nxt=st.nx,tl=nxt.t0-st.t,inh=st.rest<=0&&tl<N.tele&&tl>0,sx=G.cx,sy=K.top()+126,ss=K.clamp(G.W*.17,58,110),face=(st.w!==0?(st.w>0?1:-1):inh?nxt.dir:st.sg.dir);
    ZABK.put(g,'solo',sx,sy,ss*(inh?1.08+.05*Math.sin(now*30):1),c.D,{sx:face,sy:1,rot:st.rest>0?.25*Math.sin(now*3):0});
    if(inh){g.globalAlpha=.6+.4*Math.sin(now*14);K.tag(g,G.W,sy+ss*.75,nxt.dir>0?L('Дунет вправо →','Blows right →'):L('← Дунет влево','← Blows left'),'rgba(150,40,20,.86)');g.globalAlpha=1;}
    /* струи ветра и листья */
    var ws=Math.abs(st.w)/N.P;if(ws>.05){g.globalAlpha=Math.min(.9,ws);for(i=0;i<7;i++){var yy=K.top()+190+i*(G.gy-K.top()-170)/7,xx=((now*700*(st.w>0?1:-1)+i*173)%(G.W+120)+G.W+120)%(G.W+120)-60;g.drawImage(spr.str,xx,yy,60+ws*50,5);}g.globalAlpha=1;}
    for(i=st.leaves.length-1;i>=0;i--){var lf=st.leaves[i];lf.x+=lf.vx*dt;lf.r+=dt*8;if(lf.x<-40||lf.x>G.W+40){st.leaves.splice(i,1);continue;}g.save();g.translate(lf.x,lf.y+Math.sin(lf.r)*6);g.rotate(lf.r);g.drawImage(spr.leaf,-9,-5,18,10);g.restore();}
    if(st.leaves.length>40)st.leaves.splice(0,10);
    /* богатырь */
    var hx=G.cx+st.x*G.R,hy=G.gy-G.hp*.38;g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(hx,G.gy+4,G.hp*.3,G.hp*.08,0,0,TAU);g.fill();
    var lean=st.in!==0?1:0;ZABK.put(g,'h_'+hk+'_'+(lean&&ART['h_'+hk+'_1']?1:0),hx,hy-(dead?st.dT*G.hp*.6:0),G.hp,c.D,{rot:dead?st.dT*6*(st.x>0?1:-1):st.tilt,sx:st.in<0?-1:1,sy:1});
    if(st.helm){var hm=st.helm;hm.x+=hm.vx*dt;hm.y+=hm.vy*dt;hm.vy+=600*dt;hm.r+=dt*9;if(hm.y<G.H+40){g.save();g.translate(hm.x,hm.y);g.rotate(hm.r);g.drawImage(spr.helm,-18,-15,36,30);g.restore();}}
    /* где упираешься */
    if(live&&!dead&&st.in!==0){g.globalAlpha=.35;g.fillStyle='#fff';g.beginPath();g.arc(st.in<0?G.W*.15:G.W*.85,G.gy+G.R*.45,28,0,TAU);g.fill();g.globalAlpha=1;}
    ZABK.parts(g,P,dt);
    if(bub){bub.a-=dt;K.say(g,bub.t,sx+ss*.9,sy+ss*.2,G.W,bub.a);if(bub.a<=0)bub=null;}
    g.restore();
    if(st.flash>0){g.fillStyle='rgba(255,236,150,'+(st.flash*.3)+')';g.fillRect(0,0,G.W,G.H);}
    if(live&&!demo&&st.t<N.warm){g.globalAlpha=.6+.25*Math.sin(now*6);if(zabPC()){zabKeycap(g,G.W*.15,G.H-70,'←',30);zabKeycap(g,G.W*.85,G.H-70,'→',30);}else{K.finger(g,G.W*.15,G.H-90,0);K.finger(g,G.W*.85,G.H-90,0);}g.globalAlpha=1;
      K.tag(g,G.W,G.H-24,st.msg>0?L('Теперь ты!','Your turn!'):L('Разминка: из круга не сдует','Warm-up: you won’t be blown out'));}
    if(demo){K.tag(g,G.W,G.H-24,L('Смотри: дует вправо — держи слева','Watch: wind blows right — hold left'));if(st.in)K.finger(g,st.in<0?G.W*.15:G.W*.85,G.H-90,1);}
  });
  /* держать палец: левая/правая половина экрана */
  var pid=-1;function px(e){var r=c.getBoundingClientRect();return e.clientX-r.left<c.W/2?-1:1;}
  function dn(e){if(host.paused||host.root.querySelector('.zabVeil'))return;pid=e.pointerId;try{c.setPointerCapture(pid);}catch(x){}setIn(px(e));e.preventDefault();}
  function mv(e){if(e.pointerId!==pid)return;setIn(px(e));}
  function up(e){if(e.pointerId!==pid)return;pid=-1;setIn(0);}
  c.addEventListener('pointerdown',dn);c.addEventListener('pointermove',mv);c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
  host.onQuit(function(){c.removeEventListener('pointerdown',dn);c.removeEventListener('pointermove',mv);c.removeEventListener('pointerup',up);c.removeEventListener('pointercancel',up);window.removeEventListener('keyup',ku);});
  var keys={};function kv(){setIn((keys.r?1:0)-(keys.l?1:0));}
  function side(k){return k==='ArrowLeft'||k==='a'||k==='A'||k==='ф'||k==='Ф'?'l':k==='ArrowRight'||k==='d'||k==='D'||k==='в'||k==='В'?'r':'';} // i18n:ru
  zabKeys(host,function(k){var s=side(k);if(s){keys[s]=1;kv();return true;}});
  function ku(e){var s=side(e.key);if(s){keys[s]=0;kv();}}window.addEventListener('keyup',ku);
  reset();host.dbg={st:function(){return st;},hold:function(d){st.in=d;},live:function(){return live&&!dead;},demo:function(){return demo;}};
  ZREC.start(host,o,function(){H=ZREC.hud(host,o);reset();live=true;if(o.first&&!o.again){demo=1;demoT=0;}});
}
/* бот без экрана: та же физика, игрок с запаздыванием rt и «пережимом» */
function sim(o,k){var r=o&&o.rnd||Math.random,t=0,x=0,v=0,dt=1/30,rt=.42-.26*k,buf=[],sg=segGen(.3,r,null,o&&o.calm),nx;sg.s*=.6;nx=segGen(sg.t0+sg.d,r,sg,o&&o.calm);
  var lap=0,rest=0,inp=0,ins=0,gain=1.2+.8*k;
  for(;t<400;t+=dt){if(t>=sg.t0+sg.d){sg=nx;nx=segGen(sg.t0+sg.d,r,sg,o&&o.calm);}var lp=Math.floor(t/N.lap);if(lp>lap){lap=lp;rest=N.rest;}
    var w=0;if(rest>0){rest-=dt;sg.t0=t+.4;nx.t0=sg.t0+sg.d;}else w=windAt(sg,t)*N.P;
    buf.push([w,x,v]);var seen=buf.length>rt/dt?buf.shift():[0,0,0],want=-(seen[0]/N.P*.9+seen[1]*gain+seen[2]*.9)+(r()-.5)*(1-k)*.6;inp=want>.15?1:want<-.15?-1:0;ins+=(inp-ins)*Math.min(1,dt/N.ramp);
    v+=(w+ins*N.P)*dt;v*=Math.exp(-N.damp*dt);x+=v*dt;if(t<N.warm){if(Math.abs(x)>.92){x=.92*(x>0?1:-1);v*=-.3;}}else if(Math.abs(x)>1)break;}
  var sc=Math.floor(t);return {score:sc,tier:ZREC.tier('svist',sc)};}
ZAB_REG({id:'svist',kind:'lov',n:zabN('Свист Соловья','Nightingale’s Whistle'),run:run,sim:sim});
})();
