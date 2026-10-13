'use strict';
/* ob2-LOVA · «Сруб заставы» (флаг lov-srub, num 15). Движок — «Стопка учебников» Зины ← «Пирамида» Гастронома; основа — макет preview/MG.html.
   Бревно ездит над срубом — нажми, чтобы уронить. Что свисает — отпиливается. Ровно (±5) — «Как по отвесу!», бревно не укорачивается; 3 ровных подряд — бревно длиннее.
   Каждые 5 венцов — ярус (флажок и шлем-крыша на миг). Рекорд — венцы. Ведёт Кузнец Микула. Грузится лениво (LOVK). */
(function(){var K=window.LOVK;if(!K)return;var WW=K.WW,WH=K.WH,L=K.L;
var UNIT=[['венец','венца','венцов'],['course','courses']];
var LOGC=[['#c08a4c','#94622e','#6a4018'],['#b47c40','#8a5824','#5f3a14']];
function logShape(c,x,y,w,h,col,sh){var g=c.createLinearGradient(0,y,0,y+h);g.addColorStop(0,col[0]);g.addColorStop(.55,col[1]);g.addColorStop(1,col[2]);c.fillStyle=g;
  sh.rr(x,y,w,h,h/2);c.fill();c.strokeStyle='rgba(50,24,8,.65)';c.lineWidth=1.4;c.stroke();
  c.strokeStyle='rgba(60,30,10,.25)';c.lineWidth=1;c.beginPath();for(var i=x+h;i<x+w-h;i+=23){c.moveTo(i,y+5);c.lineTo(i+9,y+5);}c.stroke();
  if(w>h*1.2){c.fillStyle='#ecc98e';c.beginPath();c.ellipse(x+w-h/2.2,y+h/2,h/2.7,h/2.25,0,0,7);c.fill();c.strokeStyle='#a0703a';c.lineWidth=1;c.beginPath();c.ellipse(x+w-h/2.2,y+h/2,h/5,h/4.5,0,0,7);c.stroke();
    c.beginPath();c.ellipse(x+w-h/2.2,y+h/2,h/12,h/11,0,0,7);c.stroke();}}
K.G.srub={id:'srub',num:15,name:['Сруб заставы','Log Fort'],who:['Кузнец Микула','Mikula the Smith'],face:'tour_nb4',unit:UNIT,mid:14,medal:[10,20,32],demoT:4.6,
  demoTxt:['Смотри: бревно ездит — жми, когда оно над срубом. Что свисает — отпилю!','Watch: the log slides — tap when it is over the walls. Whatever hangs over, I saw off!'],
  goTxt:['Твоя очередь! Первые 3 бревна — разминка: мимо не считается.','Your turn! The first 3 logs are a warm-up: misses don’t count.'],
  againTxt:['Ровнее! Мне на этот сруб пушку ставить.','Keep it straight! I’m putting a cannon on top of this.'],
  make:function(sh){var Q=sh.S,Lg2=L,L2,cur,dir,spd,wob=0,vNow=0,cam,warm,chips,dust,perf,flag,roof;
    var PH=[['Ровнее! Мне туда пушку ставить!','Straighter! A cannon goes up there!'],['Ну-ка, ещё венец!','Come on, another course!'],['Крепко сидит. Дальше!','Solid. Next!'],['Плотники обзавидуются.','The carpenters will be jealous.']];
    function ly(i){return WH-46-i*24;}
    function newLog(){var t=L2[L2.length-1];dir=Q.rnd()<.5?1:-1;cur={x:dir>0?-t.w+6:WW-6,w:t.w,fall:false};}
    function drop(){if(!cur||cur.fall)return;cur.fall=true;cur.y=ly(L2.length)-84;cur.vy=0;cur.ty=ly(L2.length);}
    function score(){sh.setScore(Q.score+' <small>'+sh.pl(Q.score)+'</small>');}
    function land(){var t=L2[L2.length-1],a=Math.max(cur.x,t.x),b=Math.min(cur.x+cur.w,t.x+t.w),ov=b-a,ex=Math.abs(cur.x-t.x)<4,y=ly(L2.length);
      if(ov<=4){chips.push({x:cur.x,y:y,w:cur.w,vx:dir*50,vy:-40,r:0,vr:dir*2.4});cur=null;sh.snd('boom');
        if(Q.auto){g.reset(true);return;}
        if(warm>0&&Q.warmOn){sh.pop(Lg2('Мимо! В разминке не считается','Missed! Doesn’t count in warm-up'),1);warm--;sh.warm(warm>0,Lg2('Разминка: ','Warm-up: ')+warm);sh.say(Lg2('Не беда — жми, когда бревно над срубом. Пунктир — края сруба.','No matter — tap when the log is above the walls. The dashed lines are the edges.'));newLog();return;}
        sh.end(Q.score,Lg2('Бревно ушло мимо сруба. Смотри на пунктир — это края сруба.','The log missed the walls. Watch the dashed lines — they mark the edges.'));return;}
      if(ex){a=t.x;ov=t.w;perf++;sh.snd('star');for(var i=0;i<14;i++)dust.push({x:a+Q.rnd()*ov,y:y+20,vx:(Q.rnd()-.5)*60,vy:-40-Q.rnd()*60,t:0,c:'#ffe27a'});
        if(perf>=3&&ov<200){ov=Math.min(200,ov+10);a=Math.max(0,a-5);perf=0;sh.pop(Lg2('Мастер! Бревно длиннее','Master! A longer log'));}else sh.pop(Lg2('Как по отвесу!','Plumb straight!'));}
      else{perf=0;var cl=cur.x<a,cx=cl?cur.x:b,cw=cur.w-ov;if(cw>0){chips.push({x:cx,y:y,w:cw,vx:cl?-70:70,vy:-90,r:0,vr:cl?-3:3});for(var j=0;j<10;j++)dust.push({x:cl?a:b,y:y+10,vx:(cl?-1:1)*(20+Q.rnd()*80),vy:-30-Q.rnd()*70,t:0,c:'#e8c48a'});}sh.snd('build');}
      L2.push({x:a,w:ov});
      if(!Q.auto){Q.score++;score();if(warm>0){warm--;sh.warm(warm>0&&Q.warmOn,Lg2('Разминка: ','Warm-up: ')+warm);if(!warm&&Q.warmOn)sh.say(Lg2('Разминка всё! Теперь — на рекорд. Мимо — и сруб готов.','Warm-up over! Now for the record. One miss and the fort is done.'));}
        if(Q.score%5===0){flag=1.6;roof=1.2;sh.pop(Lg2('Ярус готов!','Tier done!'));if(Q.score===15)sh.say(Lg2('Высоко забрались — тут ветер! Бревно гуляет, лови момент.','We’re up high — it’s windy! The log sways, catch the moment.'));else sh.say(Lg2(PH[(Q.score/5|0)%PH.length][0],PH[(Q.score/5|0)%PH.length][1]));}}
      spd=Math.min(Q.calm?220:330,spd+(Q.calm?6:9));newLog();}
    var g={reset:function(demo){L2=[{x:80,w:200}];warm=Q.warmOn||demo?3:0;cam=0;chips=[];dust=[];perf=0;flag=0;roof=0;spd=Q.calm?80:100;wob=0;Q.score=0;newLog();score();
        sh.warm(!demo&&Q.warmOn,Lg2('Разминка: 3','Warm-up: 3'));},
      press:function(d){if(d)drop();},
      peek:function(){var t=L2[L2.length-1];return cur?{x:cur.x,tx:t.x,f:cur.fall,spd:vNow,dir:dir}:null;},   // для стенда
      step:function(dt){if(cur){if(cur.fall){cur.vy+=1100*dt;cur.y+=cur.vy*dt;if(cur.y>=cur.ty)land();}
          else{wob+=dt*2.4;vNow=spd*(Q.score>=15&&!Q.auto?1+.3*Math.sin(wob):1);cur.x+=dir*vNow*dt;if(cur.x<-cur.w*.6&&dir<0)dir=1;if(cur.x>WW-cur.w*.4&&dir>0)dir=-1;
            if(Q.auto&&Q.st==='demo'){var t=L2[L2.length-1];if(Math.abs(cur.x-t.x)<(L2.length>3?16:3))drop();}}}
        chips.forEach(function(p){p.vy+=800*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;});chips=chips.filter(function(p){return p.y<WH+cam+200;});
        dust.forEach(function(p){p.t+=dt;p.vy+=300*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;});dust=dust.filter(function(p){return p.t<.8;});
        var want=Math.max(0,(L2.length-7)*24);cam+=(want-cam)*Math.min(1,dt*4);flag=Math.max(0,flag-dt);roof=Math.max(0,roof-dt);},
      finger:function(){if(!cur||cur.fall)return {x:WW/2,y:WH-120,down:false};var t=L2[L2.length-1];return {x:WW/2,y:WH-120,down:Math.abs(cur.x-t.x)<22};},
      bg:function(c,w,h){var gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#8cc7ec');gr.addColorStop(.62,'#dcefe9');gr.addColorStop(.63,'#a9c97e');gr.addColorStop(1,'#6f9d4c');c.fillStyle=gr;c.fillRect(0,0,w,h);
        c.fillStyle='rgba(255,255,255,.75)';[[.18,.12,26],[.3,.1,20],[.75,.18,30],[.86,.16,22]].forEach(function(q){c.beginPath();c.arc(w*q[0],h*q[1],q[2],0,7);c.arc(w*q[0]+q[2],h*q[1]+4,q[2]*.8,0,7);c.fill();});
        c.fillStyle='#4f7f3c';for(var i=-20;i<w+40;i+=34){c.beginPath();c.moveTo(i,h*.63);c.lineTo(i+17,h*.63-46-((i*7)%26));c.lineTo(i+34,h*.63);c.fill();}
        c.fillStyle='#3e6a30';for(var j=-10;j<w+40;j+=46){c.beginPath();c.moveTo(j,h*.63);c.lineTo(j+23,h*.63-28-((j*5)%18));c.lineTo(j+46,h*.63);c.fill();}},
      draw:function(c){c.save();c.translate(0,cam);
        // земля и фундамент
        c.fillStyle='#8a6a3a';c.fillRect(-2000,WH-22,WW+4000,400);c.fillStyle='#7a7a6e';sh.rr(72,WH-46,216,26,7);c.fill();c.strokeStyle='#4a4a40';c.lineWidth=1.5;c.stroke();
        c.strokeStyle='rgba(40,40,30,.35)';c.beginPath();for(var s=86;s<280;s+=28){c.moveTo(s,WH-46);c.lineTo(s-4,WH-20);}c.stroke();
        sh.put('tour_nb4',34,WH-56,62);
        for(var i=1;i<L2.length;i++){var b=L2[i];logShape(c,b.x,ly(i),b.w,22,LOGC[i%2],sh);
          if(i%5===0){var fx=b.x+b.w-10;c.strokeStyle='#5a3a1a';c.lineWidth=2;c.beginPath();c.moveTo(fx,ly(i));c.lineTo(fx,ly(i)-22);c.stroke();c.fillStyle='#c0392b';c.beginPath();c.moveTo(fx,ly(i)-22);c.lineTo(fx+14,ly(i)-17);c.lineTo(fx,ly(i)-12);c.fill();}}
        if(roof>0&&L2.length>1){var tb=L2[L2.length-1],ry=ly(L2.length-1)-(1.2-roof)*30,al=Math.min(1,roof*2);c.globalAlpha=al;c.fillStyle='#4a6a8a';c.beginPath();c.moveTo(tb.x-6,ry);c.quadraticCurveTo(tb.x+tb.w/2,ry-44,tb.x+tb.w+6,ry);c.fill();
          c.fillStyle='#e6b53a';c.beginPath();c.arc(tb.x+tb.w/2,ry-24,4,0,7);c.fill();c.globalAlpha=1;}
        if(cur){var cy=cur.fall?cur.y:ly(L2.length)-84;
          if(!cur.fall){var t=L2[L2.length-1];c.setLineDash([5,6]);c.strokeStyle='rgba(58,36,18,.55)';c.lineWidth=2;c.beginPath();c.moveTo(t.x,cy+26);c.lineTo(t.x,ly(L2.length)+22);c.moveTo(t.x+t.w,cy+26);c.lineTo(t.x+t.w,ly(L2.length)+22);c.stroke();c.setLineDash([]);
            c.strokeStyle='rgba(70,40,15,.7)';c.lineWidth=2;c.beginPath();c.moveTo(cur.x+cur.w*.2,cy);c.lineTo(cur.x+cur.w/2,cy-26);c.lineTo(cur.x+cur.w*.8,cy);c.stroke();}
          logShape(c,cur.x,cy,cur.w,22,['#d09a58','#a06a34','#744a1c'],sh);}
        chips.forEach(function(p){c.save();c.translate(p.x+p.w/2,p.y+11);c.rotate(p.r);logShape(c,-p.w/2,-11,p.w,22,LOGC[0],sh);c.restore();});
        dust.forEach(function(p){c.globalAlpha=1-p.t/.8;c.fillStyle=p.c;c.fillRect(p.x,p.y,3,3);});c.globalAlpha=1;
        c.restore();
        if(Q.st==='play'&&Q.score===0&&cur&&!cur.fall)sh.text(Q.pc?L('Пробел — уронить бревно','Space — drop the log'):L('Нажми — уронить бревно','Tap — drop the log'),WW/2,66,17,{col:'#fff6dc'});}};
    return g;}};
})();
