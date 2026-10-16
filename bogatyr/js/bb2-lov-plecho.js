/* bb2-lov-plecho.js — «Раззудись, плечо» (ловкостная на рекорд, поток LOVA). Горыныч плюётся: летят головешки, репа, поленья, капуста. Проведи пальцем — разруби.
   Курицу и горшок с мёдом не трогать. Три промаха — конец. Несколько одним взмахом — прибавка. Три курицы подряд целы — «Хозяюшка благодарит» (+жизнь).
   Счёт — удары (разрублено + прибавки). Договор — шапка js/bb2-zab-ui.js. */
(function(){
var K=LOVK,TAU=Math.PI*2;
/* числа игры (не экономика) */
var N={lives:3,warm:5,gap0:1.45,gapK:.009,gapMin:.5,bad0:.1,badK:.0022,badMax:.3,grav0:1.25,gravK:.0035,gravMax:1.9,combo:3};
if(!ART.lov_gol){art('lov_gol',40,function(g){var gr=g.createRadialGradient(-3,-3,2,0,0,17);gr.addColorStop(0,'#ffd24a');gr.addColorStop(.45,'#e0531a');gr.addColorStop(1,'#4a1a0c');g.fillStyle=gr;g.beginPath();g.moveTo(-14,4);g.quadraticCurveTo(-16,-10,-4,-13);g.quadraticCurveTo(10,-17,15,-4);g.quadraticCurveTo(18,10,4,14);g.quadraticCurveTo(-10,16,-14,4);g.fill();g.lineWidth=2;g.strokeStyle='#2a1208';g.stroke();
    g.fillStyle='#ffe98a';g.beginPath();g.moveTo(-2,-12);g.quadraticCurveTo(4,-22,1,-28);g.quadraticCurveTo(10,-22,8,-12);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(-5,-4,3,0,TAU);g.fill();});
  art('lov_pol',40,function(g){g.rotate(-.3);var gr=g.createLinearGradient(0,-9,0,9);gr.addColorStop(0,'#b07a40');gr.addColorStop(1,'#6b4320');g.fillStyle=gr;g.beginPath();g.moveTo(-15,-8);g.lineTo(13,-8);g.arc(13,0,8,-Math.PI/2,Math.PI/2);g.lineTo(-15,8);g.closePath();g.fill();g.lineWidth=2;g.strokeStyle='#3a2410';g.stroke();
    g.fillStyle='#e8c88a';g.beginPath();g.ellipse(-15,0,4.5,8,0,0,TAU);g.fill();g.stroke();g.strokeStyle='rgba(58,36,16,.5)';g.lineWidth=1.2;g.beginPath();g.ellipse(-15,0,2,4,0,0,TAU);g.stroke();g.beginPath();g.moveTo(-6,-3);g.lineTo(8,-3);g.moveTo(-3,3);g.lineTo(10,3);g.stroke();});}
var GOOD=[['lov_gol','#ff8a3a',1.15],['m_repa','#f4e6a8',1.2],['lov_pol','#e8c88a',1.2],['m_kap','#9ad86a',1.25]],HEN=['zbc_kura','#fff',1.35],MED=['m_honey','#f0b020',1.25];
function run(host,o){
  var c=ZABK.canvas(host),g=c.getContext('2d'),P=[],H=null,it=[],hal=[],tr=[],sc=0,lives=N.lives,live=false,over=false,dead=0,spT=1,spawned=0,sw=0,swN=0,henOk=0,note=null,sticky=0,cause={m:0,h:0,s:0},demo=0,demoT=0,fg=null,T=0,flash=0,splat=[];
  function grav(){return c.H*Math.min(N.gravMax,N.grav0+N.gravK*sc)*(o.calm?.8:1);}
  function throwOne(kind,x){var W=c.W,Hh=c.H,G=grav(),apex=Hh*(.42+Math.random()*.3),vy=-Math.sqrt(2*G*apex),tx=W*(.25+Math.random()*.5),tt=-vy/G*2;x=x==null?W*(.12+Math.random()*.76):x;
    var d=kind==='hen'?HEN:kind==='med'?MED:GOOD[Math.floor(Math.random()*GOOD.length)],r=Math.max(24,Math.min(W,Hh)*.062)*d[2];
    it.push({k:kind,key:d[0],col:d[1],x:x,y:Hh+r,vx:(tx-x)/tt,vy:vy,r:r,rot:Math.random()*TAU,vr:(Math.random()-.5)*5,t:0});spawned++;}
  function wave(){var n=1+Math.floor(Math.random()*Math.min(4,1+sc/14)),i,bp=spawned<N.warm?0:Math.min(N.badMax,N.bad0+N.badK*sc);for(i=0;i<n;i++){var b=Math.random()<bp;setTimeout(function(q){return function(){if(live&&!over&&!dead&&!host.paused)throwOne(q?(Math.random()<.6?'hen':'med'):'good');};}(b),i*130);}K.snd('swing');}
  function say(t,col){note={t:t,a:1.5,col:col};}
  function lose(why){if(demo)return;cause[why]++;lives--;K.vib(60);flash=.35;if(lives<=0){dead=1;K.snd('lose');setTimeout(function(){if(over)return;K.cont(host,o,sc,function(ok){if(!ok){finish();return;}dead=0;lives=2;it.length=0;spT=1;});},500);}else K.snd('hurt');}
  function cut(q,ax,ay,bx,by){var a=Math.atan2(by-ay,bx-ax),i;q.dead=1;
    for(i=-1;i<=1;i+=2)hal.push({key:q.key,x:q.x,y:q.y,vx:q.vx+Math.cos(a+Math.PI/2)*i*90,vy:q.vy*.4+Math.sin(a+Math.PI/2)*i*90-60,r:q.r,rot:q.rot,vr:i*5,ca:a,sd:i,t:0});
    ZABK.burst(P,q.x,q.y,{n:9,col:q.col,sp:210,s:4,d:.5});
    if(q.k==='good'){if(!demo){sc++;swN++;sw=.35;if(swN===N.combo){sc+=N.combo;say(L('Три одним взмахом! +'+N.combo,'Three in one swing! +'+N.combo),'rgba(40,90,50,.9)');K.snd('combo');}else if(swN>N.combo){sc+=2;say(L('Ещё! +2','More! +2'),'rgba(40,90,50,.9)');}H.set(sc);}K.snd('hit');}
    else if(q.k==='hen'){henOk=0;say(L('Курицу-то за что?!','What did the hen do?!'));ZABK.burst(P,q.x,q.y,{n:14,col:'#fff',sp:160,s:5,d:.9,g:120});K.snd('whistle');lose('h');}
    else{sticky=2.6;splat.length=0;for(i=0;i<7;i++)splat.push([Math.random(),Math.random()*.8,.08+Math.random()*.1]);say(L('Мёд! Липко!','Honey! Sticky!'));K.snd('crack');lose('s');}}
  function slice(ax,ay,bx,by){var i,q,dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;if(l2<4)return;for(i=0;i<it.length;i++){q=it[i];if(q.dead)continue;var t=K.clamp(((q.x-ax)*dx+(q.y-ay)*dy)/l2,0,1),px=ax+dx*t-q.x,py=ay+dy*t-q.y;if(px*px+py*py<q.r*q.r*.8)cut(q,ax,ay,bx,by);}}
  function finish(){if(over)return;over=true;live=false;if(H)H.end();var m=cause.h+cause.s>cause.m?L('Курицу и мёд обходи стороной','Swipe around the hen and honey'):L('Руби на взлёте, пока летит медленно','Slice on the way up, while slow');
    host.done({score:sc,extra:{msg:m}});}
  var bg=K.bg(c,function(x,W,Hh){var gr=x.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,'#2b2f55');gr.addColorStop(.6,'#5a3a4a');gr.addColorStop(1,'#a8502a');x.fillStyle=gr;x.fillRect(0,0,W,Hh);
    x.fillStyle='rgba(255,240,200,.8)';for(var i=0;i<26;i++){x.beginPath();x.arc((i*131)%W,(i*71)%(Hh*.5),1+(i%3)*.5,0,TAU);x.fill();}
    x.fillStyle='#3a2233';x.beginPath();x.moveTo(0,Hh);for(i=0;i<=10;i++)x.lineTo(W*i/10,Hh*(.86-.05*Math.abs(Math.sin(i*1.7))));x.lineTo(W,Hh);x.fill();
    var cx=W*.86,cy=Hh*.93;x.fillStyle='#1c1410';x.beginPath();x.arc(cx,cy,24,0,Math.PI);x.fill();x.fillRect(cx-27,cy-5,54,6);x.fillStyle='#ff8a3a';x.beginPath();x.moveTo(cx-16,cy+30);x.quadraticCurveTo(cx,cy+8,cx+16,cy+30);x.fill();});
  ZABK.loop(host,function(dt,now){var W=c.W,Hh=c.H,i,q,G=grav();T+=dt;
    if(live&&!over&&!dead){
      if(demo){demoT+=dt;if(demoT>.25&&spawned===0){throwOne('good',W*.25);throwOne('good',W*.5);throwOne('hen',W*.8);throwOne('good',W*.62);}
        var tg=it.filter(function(z){return z.k==='good'&&!z.dead;});if(demoT>1.05&&tg.length){q=tg[0];var fx=fg?fg[0]:W*.1,fy=fg?fg[1]:Hh*.6,dx=q.x-fx,dy=q.y-fy,d=Math.hypot(dx,dy)||1,stp=Math.min(d+30,W*2.6*dt),nx=fx+dx/d*stp,ny=fy+dy/d*stp;slice(fx,fy,nx,ny);tr.push(nx,ny,T);fg=[nx,ny,1];}else if(fg)fg[2]=0;
        if(demoT>4){demo=0;it.length=0;hal.length=0;tr.length=0;fg=null;spawned=0;spT=.8;say(L('Теперь ты!','Your turn!'),'rgba(40,90,50,.9)');}}
      else{spT-=dt;if(spT<=0){spT=Math.max(N.gapMin,N.gap0-N.gapK*sc)*(o.calm?1.2:1);wave();}}}
    if(sw>0){sw-=dt;if(sw<=0)swN=0;}if(note){note.a-=dt;if(note.a<=0)note=null;}if(sticky>0)sticky-=dt;if(flash>0)flash-=dt;
    bg(g);ZABK.put(g,'gory',W*.5,Hh+Math.min(W,Hh)*.1+Math.sin(now*2)*4,Math.min(W,Hh)*.62,c.D);
    for(i=it.length-1;i>=0;i--){q=it[i];if(!dead||q.dead){q.t+=dt;q.vy+=G*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.rot+=q.vr*dt;}
      if(q.dead){it.splice(i,1);continue;}
      if(q.y>Hh+q.r*1.5&&q.vy>0){it.splice(i,1);if(q.k==='good'){if(spawned>N.warm&&!demo){say(L('Упустил!','Missed!'));lose('m');}}else if(q.k==='hen'&&!demo){henOk++;if(henOk>=3){henOk=0;if(lives<N.lives){lives++;say(L('Хозяюшка благодарит: +жизнь','The hostess thanks you: +1 life'),'rgba(40,90,50,.9)');}else{sc+=3;H.set(sc);say(L('Хозяюшка благодарит: +3','The hostess thanks you: +3'),'rgba(40,90,50,.9)');}K.snd('heal');}}continue;}
      ZABK.put(g,q.key,q.x,q.y,q.r*2.2,c.D,{rot:q.rot});
      if(q.k!=='good'){g.strokeStyle='rgba(255,80,60,'+(.5+.3*Math.sin(now*9))+')';g.lineWidth=3;g.setLineDash([6,5]);g.beginPath();g.arc(q.x,q.y,q.r*1.15,0,TAU);g.stroke();g.setLineDash([]);}}
    for(i=hal.length-1;i>=0;i--){q=hal[i];q.t+=dt;q.vy+=G*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.rot+=q.vr*dt;if(q.t>1.1||q.y>Hh+60){hal.splice(i,1);continue;}var sp=ZABK.spr(q.key,q.r*2.2,c.D);if(!sp)continue;
      g.save();g.translate(q.x,q.y);g.globalAlpha=Math.min(1,(1.1-q.t)*2.5);g.rotate(q.ca);g.beginPath();g.rect(-q.r*1.6,q.sd>0?0:-q.r*1.6,q.r*3.2,q.r*1.6);g.clip();g.rotate(q.rot-q.ca);g.drawImage(sp,-q.r*1.1,-q.r*1.1,q.r*2.2,q.r*2.2);g.restore();}
    ZABK.parts(g,P,dt);
    /* след взмаха */
    while(tr.length&&T-tr[2]>.22)tr.splice(0,3);if(tr.length>=6){g.lineCap='round';g.lineJoin='round';for(i=3;i<tr.length;i+=3){var a=1-(T-tr[i+2])/.22;g.strokeStyle='rgba(255,246,200,'+Math.max(0,a)+')';g.lineWidth=2+8*a;g.beginPath();g.moveTo(tr[i-3],tr[i-2]);g.lineTo(tr[i],tr[i+1]);g.stroke();}}
    if(sticky>0){g.globalAlpha=Math.min(.75,sticky*.5);g.fillStyle='#e8a818';for(i=0;i<splat.length;i++){g.beginPath();g.arc(splat[i][0]*W,splat[i][1]*Hh+(2.6-sticky)*18,splat[i][2]*W,0,TAU);g.fill();g.fillRect(splat[i][0]*W-splat[i][2]*W*.3,splat[i][1]*Hh,splat[i][2]*W*.6,(2.6-sticky)*60);}g.globalAlpha=1;}
    if(flash>0){g.fillStyle='rgba(200,40,30,'+flash*.6+')';g.fillRect(0,0,W,Hh);}
    /* жизни */
    if(live&&!demo){for(i=0;i<N.lives;i++){var hx=W/2+(i-1)*30,hy=K.top()+84;g.globalAlpha=i<lives?1:.25;ZABK.put(g,'um_shit',hx,hy,26,c.D);}g.globalAlpha=1;
      if(spawned<=N.warm&&!note)K.tag(g,W,Hh-26,L('Разминка: промахи пока не в счёт','Warm-up: misses don’t count yet'));}
    if(demo){K.tag(g,W,K.top()+116,L('Смотри: руби всё, кроме курицы и мёда','Watch: slice everything except the hen and the honey'));if(fg)K.finger(g,fg[0],fg[1],fg[2]);}
    if(note){g.globalAlpha=Math.min(1,note.a*2);K.tag(g,W,Hh*.3,note.t,note.col||'rgba(150,40,20,.88)');g.globalAlpha=1;}
  });
  var lx=0,ly=0;
  K.ptr(c,host,{down:function(x,y){lx=x;ly=y;swN=0;},move:function(x,y,held){if(!held||!live||over||dead||demo)return;slice(lx,ly,x,y);tr.push(x,y,T);if(tr.length>90)tr.splice(0,3);lx=x;ly=y;},up:function(){}});
  host.dbg={st:function(){return {sc:sc,lives:lives,demo:demo,live:live,dead:dead,it:it.map(function(q){return {k:q.k,x:q.x,y:q.y,vy:q.vy,r:q.r};})};},slice:function(ax,ay,bx,by){swN=0;slice(ax,ay,bx,by);tr.push(ax,ay,T,bx,by,T);}};
  ZREC.start(host,o,function(){H=ZREC.hud(host,o);sc=0;lives=N.lives;live=true;spawned=0;if(o.first&&!o.again){demo=1;demoT=0;}});
}
function sim(o,k){var r=o&&o.rnd||Math.random,sc=0,lives=N.lives,n=0;while(lives>0&&n<3000){n++;var bp=n<=N.warm?0:Math.min(N.badMax,N.bad0+N.badK*sc),hard=Math.min(.5,sc*.0022);
    if(r()<bp){if(r()<(1-k)*.22+hard*.15)lives--;}else if(r()<k*.985+.012-hard*(1.15-k)){sc++;if(r()<.12*k)sc+=N.combo;}else if(n>N.warm)lives--;}
  return {score:sc,tier:ZREC.tier('plecho',sc)};}
ZAB_REG({id:'plecho',kind:'lov',n:zabN('Раззудись, плечо','Swing Away'),run:run,sim:sim});
})();
