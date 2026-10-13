'use strict';
/* ob2-LOVA · «Ступа тётушки Яги» (флаг lov-stupa, num 18). Движок — «Парковка» Выезда (порт Зины zmg-park-eng.js: «велосипедная» модель — руль, база, газ/тормоз);
   основа — макет preview/MG.html. Тётушка вернулась с облёта: поставь ступу в сарайчик у избы между котлом, курами и поленницей.
   Управление: ◀ ▶ — поворот метлой (держать), «Вперёд» / «Назад» — держать; ПК — стрелки (Пробел — вперёд). Ступа — круг, метла сзади — тоже задевает.
   Три ступы за партию, двор всё теснее. ★ поставила · ★ без касаний · ★ задом (носом к двери — утром сразу на вылет). Счёт — время трёх ступ + 5 с за касание (меньше — лучше).
   Не поставила за 45 с — Яга ставит сама (+20 с, без звёзд). Первая ступа первой партии — разминка: касания не считаются. */
(function(){var K=window.LOVK;if(!K)return;var WW=K.WW,WH=K.WH,L=K.L;
var UNIT=[['секунда','секунды','секунд'],['second','seconds']];
var R=18,BR=8,BOFF=27,LW=30,DMAX=.62,LIM=45,PEN=5,LATE=20;
// дворы: сарай (x — центр, w — ширина внутри, d — глубина), предметы: k hen|pot|wood|stump, x,y, m — ходит
// p — путь автопилота показа и стенда (точки обхода)
var LAY=[{bw:96,p:[[180,300],[180,95]],o:[{k:'pot',x:84,y:262},{k:'hen',x:262,y:318,m:1}]},
  {bw:86,p:[[110,420],[110,330],[195,280],[180,200],[180,95]],o:[{k:'hen',x:118,y:246,m:1},{k:'pot',x:250,y:258},{k:'wood',x:184,y:352,w:74,h:24},{k:'hen',x:300,y:400,m:1}]},
  {bw:78,p:[[235,420],[235,300],[187,250],[180,200],[180,95]],o:[{k:'wood',x:120,y:236,w:70,h:24},{k:'hen',x:262,y:226,m:1},{k:'pot',x:188,y:316},{k:'hen',x:92,y:372,m:1},{k:'stump',x:286,y:378}]}];
var BY=34,BD=118;
function circBox(cx,cy,r,b){var px=Math.max(b.x,Math.min(b.x+b.w,cx)),py=Math.max(b.y,Math.min(b.y+b.h,cy)),dx=cx-px,dy=cy-py;return dx*dx+dy*dy<r*r;}
K.G.stupa={id:'stupa',num:18,name:['Ступа тётушки Яги','Auntie Yaga’s Mortar'],who:['Тётушка Яга','Auntie Yaga'],face:'tetka',unit:UNIT,mid:44,lower:true,medal:[75,52,36],demoT:6,endDelay:900,
  buttons:[{k:'L',t:'◀',kc:'←'},{k:'R',t:'▶',kc:'→'},{k:'U',t:'⬆<small>'+L('Вперёд','Forward')+'</small>',kc:'↑'},{k:'D',t:'⬇<small>'+L('Назад','Back')+'</small>',kc:'↓'}],
  demoTxt:['Триста лет летаю, а ставить — как в первый раз! ◀ ▶ — рулю метлой, «Вперёд»/«Назад» — держать.','Three hundred years of flying, and parking is still like the first time! ◀ ▶ steer with the broom, hold “Forward”/“Back”.'],
  goTxt:['Твоя очередь! Поставь в сарай и постой. Первая ступа — разминка: кур задевай, не считается.','Your turn! Park it in the shed and hold still. The first mortar is a warm-up: bumping hens doesn’t count.'],
  againTxt:['Ещё разок? Задом заедешь — носом к двери, утром сразу на вылет!','Once more? Back it in — nose to the door, ready to fly at dawn!'],
  make:function(sh){var Q=sh.S,wi=0,p,inp,round,touch,touchR,t0,tR,stars,still,obs,warm,flash,fx,barn,walls,done,msgT,lastHit;
    function score(){sh.setScore(L('Ступа ','Mortar ')+Math.min(3,round+1)+L(' из 3',' of 3')+' · ★ '+stars);}
    function startRound(){wi=0;var Ly=LAY[Math.min(2,round)];p={x:WW/2,y:WH-48,th:-Math.PI/2,v:0,d:0};still=0;tR=0;touchR=0;
      barn={x:WW/2-Ly.bw/2,y:BY,w:Ly.bw,h:BD};
      walls=[{x:barn.x-12,y:BY-16,w:12,h:BD+16},{x:barn.x+barn.w,y:BY-16,w:12,h:BD+16},{x:barn.x-12,y:BY-16,w:barn.w+24,h:16}];
      obs=Ly.o.map(function(o){var r=o.k==='hen'?13:o.k==='pot'?22:o.k==='stump'?15:0;return {k:o.k,x:o.x,y:o.y,x0:o.x,r:r,m:o.m,w:o.w,h:o.h,ph:Q.rnd()*6,dir:1};});}
    function hitAt(x,y,th){var bx=x-Math.cos(th)*BOFF,by=y-Math.sin(th)*BOFF,i,o;
      if(x<R||x>WW-R||y<R||y>WH-R)return {k:'fence'};if(bx<BR||bx>WW-BR||by<BR||by>WH-BR)return {k:'fence'};
      for(i=0;i<walls.length;i++)if(circBox(x,y,R,walls[i])||circBox(bx,by,BR,walls[i]))return {k:'wall'};
      for(i=0;i<obs.length;i++){o=obs[i];if(o.k==='wood'){var b={x:o.x-o.w/2,y:o.y-o.h/2,w:o.w,h:o.h};if(circBox(x,y,R,b)||circBox(bx,by,BR,b))return o;}
        else{var d1=Math.hypot(x-o.x,y-o.y),d2=Math.hypot(bx-o.x,by-o.y);if(d1<R+o.r||d2<BR+o.r)return o;}}
      return null;}
    function hit(o){if(flash>0)return;flash=.6;var same=lastHit===o&&Q.t-(hit.t||0)<1.1;hit.t=Q.t;lastHit=o;if(same)return;var W={hen:[L('Ко-ко!','Cluck!'),'whistle'],pot:[L('Зелье расплескала!','Spilled the potion!'),'splash'],wood:[L('Дрова рассыпала!','Scattered the firewood!'),'build'],
        stump:[L('Ой, пенёк!','Oops, a stump!'),'build'],wall:[L('Сарай не трожь — он старше меня!','Mind the shed — it’s older than me!'),'build'],fence:[L('Тын!','The fence!'),'build']}[o.k]||['!','build'];
      sh.snd(W[1]);if(o.k==='hen')for(var i=0;i<10;i++)fx.push({x:o.x,y:o.y,vx:(Q.rnd()-.5)*160,vy:(Q.rnd()-.5)*160,t:0,c:'#fbf6ec'});
      if(Q.st!=='play')return;if(warm>0&&Q.warmOn){sh.pop(W[0]+' '+L('(разминка)','(warm-up)'));return;}touch++;touchR++;sh.pop(W[0]+' +'+PEN+L(' с',' s'),1);}
    function inside(){var bx=p.x-Math.cos(p.th)*BOFF,by=p.y-Math.sin(p.th)*BOFF,m=2;
      return p.x-R>=barn.x-m&&p.x+R<=barn.x+barn.w+m&&p.y-R>=barn.y-m&&p.y+R<=barn.y+barn.h+m&&bx>=barn.x&&bx<=barn.x+barn.w&&by>=barn.y&&by<=barn.y+barn.h+4;}
    function parked(self){var nose=Math.sin(p.th)>.5,st=0;
      if(!self){st=1;if(!touchR||(warm>0&&Q.warmOn))st++;if(nose)st++;}
      if(Q.st==='play'){stars+=st;
        sh.pop(self?L('Сама поставлю!','I’ll do it myself!'):(nose?L('Носом к двери! ','Nose to the door! '):L('Встала! ','Parked! '))+(self?'':'★'.repeat(st)),self);sh.snd(self?'lose':st>=3?'win':'coin');
        if(self)t0+=LATE;
        round++;if(warm>0&&Q.warmOn){warm=0;sh.warm(false);sh.say(L('Разминка всё! Теперь касание — +5 секунд. А задом заедешь — звёздочка!','Warm-up over! Now each bump is +5 seconds. Back it in for a star!'));}
        else if(!self)sh.say(nose?L('Вот это лихо! Хоть сейчас на облёт.','Now that’s dashing! Ready to fly right now.'):L('Годится. А задом-то слабо?','Good enough. Can you back it in, though?'));else sh.say(L('Яга не дождалась — поставила сама. +','Yaga got tired of waiting and parked it herself. +')+LATE+L(' с',' s'));
        if(round>=3){done=true;var sc=Math.round((t0+touch*PEN)*10)/10;sh.end(sc,L('Время ','Time ')+(Math.round(t0*10)/10)+L(' с + касания ',' s + bumps ')+touch*PEN+L(' с. Звёзд: ',' s. Stars: ')+stars+L(' из 9.',' of 9.'));return;}
        score();startRound();return;}
      sh.pop(L('Встала!','Parked!'));startRound();}
    function auto(dt){inp={};var P=LAY[Math.min(2,round)].p;while(wi<P.length-1&&Math.hypot(P[wi][0]-p.x,P[wi][1]-p.y)<26)wi++;
      var gx=P[wi][0],gy=P[wi][1],last=wi===P.length-1,a=Math.atan2(gy-p.y,gx-p.x),da=a-p.th;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
      var dd=Math.hypot(gx-p.x,gy-p.y);if(!last||dd>10)inp.U=!(last&&inside()&&dd<22);if(da>.06)inp.R=true;else if(da<-.06)inp.L=true;}
    var g={reset:function(demo){round=0;touch=0;stars=0;t0=0;warm=Q.warmOn||demo?1:0;inp={};fx=[];flash=0;done=false;msgT=0;startRound();score();sh.warm(!demo&&Q.warmOn,L('Разминка: ступа 1','Warm-up: mortar 1'));},
      press:function(d,k){inp[k]=d;},
      step:function(dt){if(done)return;flash=Math.max(0,flash-dt);fx.forEach(function(q){q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.95;q.vy*=.95;});fx=fx.filter(function(q){return q.t<.8;});
        if(Q.st==='demo'||g.bot)auto(dt);if(Q.st==='play'){t0+=dt;tR+=dt;if(tR>LIM){parked(true);return;}}
        var vmax=Q.calm?80:108,vrev=Q.calm?62:78,tv=(inp.U?vmax:0)-(inp.D?vrev:0);
        if(tv)p.v+=Math.max(-240*dt,Math.min(240*dt,tv-p.v));else{var dc=280*dt;p.v=Math.abs(p.v)<=dc?0:p.v-(p.v>0?dc:-dc);}
        var sd=(inp.R?DMAX:0)-(inp.L?DMAX:0),dr=(sd?3.2:4.5)*dt;p.d+=Math.max(-dr,Math.min(dr,sd-p.d));
        var n=3,h=dt/n;for(var i=0;i<n;i++){var nx=p.x+p.v*Math.cos(p.th)*h,ny=p.y+p.v*Math.sin(p.th)*h,nt=p.th+p.v/LW*Math.tan(p.d)*h,o=hitAt(nx,ny,nt);
          if(o){hit(o);p.v=-p.v*.3;break;}p.x=nx;p.y=ny;p.th=nt;}
        // куры бродят; наскочила сама — тоже касание
        obs.forEach(function(o){if(!o.m)return;o.ph+=dt;var nx=o.x0+Math.sin(o.ph*.8)*30;var ox=o.x;o.x=nx;if(hitAt(p.x,p.y,p.th)===o){o.x=ox;o.ph-=dt;hit(o);}});
        if(inside()&&Math.abs(p.v)<14){still+=dt;if(still>.55)parked(false);}else still=0;},
      finger:function(){return null;},fingerBtn:function(){if(Q.st!=='demo')return null;var s='';for(var k in inp)if(inp[k])s+=k;return s||null;},
      bg:function(c,w,h){c.fillStyle='#b9a46a';c.fillRect(0,0,w,h);c.fillStyle='rgba(100,80,40,.16)';for(var i=0;i<70;i++){c.beginPath();c.arc((i*97)%w,(i*53+i*i)%h,2+i%4,0,7);c.fill();}
        c.fillStyle='rgba(90,140,60,.35)';for(var j=0;j<30;j++){c.beginPath();c.arc((j*131)%w,(j*71+j*j*3)%h,6+j%5,0,7);c.fill();}},
      draw:function(c){var t=Q.t;
        // тын по краю двора
        c.strokeStyle='#6a4426';c.lineWidth=5;c.strokeRect(2,2,WW-4,WH-4);
        sh.put('mg_izba',40,74,92);sh.put('d_pine',WW-26,96,54);sh.put('d_pine',WW-30,WH-60,50);
        // сарай: стены, крыша, место стоянки
        c.fillStyle='rgba(70,45,20,.28)';c.fillRect(barn.x,barn.y,barn.w,barn.h);
        c.strokeStyle='rgba(255,255,255,.85)';c.setLineDash([7,6]);c.lineWidth=2;c.strokeRect(barn.x+4,barn.y+4,barn.w-8,barn.h-8);c.setLineDash([]);
        walls.forEach(function(wl){var gr=c.createLinearGradient(wl.x,0,wl.x+wl.w,0);gr.addColorStop(0,'#8a5a2e');gr.addColorStop(1,'#5a3416');c.fillStyle=gr;c.fillRect(wl.x,wl.y,wl.w,wl.h);
          c.strokeStyle='rgba(40,20,5,.5)';c.lineWidth=1;c.strokeRect(wl.x,wl.y,wl.w,wl.h);});
        c.fillStyle='#9a3a24';c.beginPath();c.moveTo(barn.x-18,BY-14);c.lineTo(WW/2,BY-30);c.lineTo(barn.x+barn.w+18,BY-14);c.closePath();c.fill();
        sh.text(L('САРАЙ','SHED'),WW/2,barn.y+barn.h*.5,13,{col:'rgba(255,246,220,.75)',ol:false});
        sh.text(L('▼ дверь ▼','▼ door ▼'),WW/2,barn.y+barn.h+12,11,{col:'#fff6dc',lw:3});
        // предметы
        obs.forEach(function(o){if(o.k==='hen'){var fl=Math.cos(o.ph*.8)<0?-1:1;sh.put('mga_hen',o.x,o.y,34,{sx:fl});}
          else if(o.k==='pot'){c.fillStyle='#ff8a2a';for(var i=0;i<3;i++){c.beginPath();c.arc(o.x-10+i*10,o.y+18,5+Math.sin(t*9+i)*1.5,0,7);c.fill();}
            c.fillStyle='#26262c';c.beginPath();c.arc(o.x,o.y,o.r,0,7);c.fill();c.fillStyle='#5ad06a';c.beginPath();c.arc(o.x,o.y,o.r-6,0,7);c.fill();c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.arc(o.x-4,o.y-3+Math.sin(t*5)*2,3,0,7);c.fill();}
          else if(o.k==='stump'){c.fillStyle='#7a5228';c.beginPath();c.arc(o.x,o.y,o.r,0,7);c.fill();c.strokeStyle='#c89a5a';c.lineWidth=2;c.beginPath();c.arc(o.x,o.y,o.r-5,0,7);c.stroke();c.beginPath();c.arc(o.x,o.y,o.r-10,0,7);c.stroke();}
          else if(o.k==='wood'){for(var j=0;j<4;j++){c.fillStyle=j%2?'#8a5a2e':'#a06a34';sh.rr(o.x-o.w/2,o.y-o.h/2+j*(o.h/4),o.w,o.h/4+1,4);c.fill();}
            c.fillStyle='#e8c48a';for(var q=0;q<4;q++){c.beginPath();c.arc(o.x+o.w/2-4,o.y-o.h/2+o.h/8+q*o.h/4,o.h/9,0,7);c.fill();}}});
        // ступа: сверху — ступа, Яга (платок, нос вперёд), метла сзади
        c.save();c.translate(p.x,p.y);c.rotate(p.th);
        c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(3,4,R+2,R,0,0,7);c.fill();
        c.strokeStyle='#c8a070';c.lineWidth=4;c.beginPath();c.moveTo(-6,0);c.lineTo(-BOFF,0);c.stroke();
        c.fillStyle='#e0b24a';c.beginPath();c.moveTo(-BOFF+6,-3);c.lineTo(-BOFF-8,-9);c.lineTo(-BOFF-10,9);c.lineTo(-BOFF+6,3);c.fill();c.strokeStyle='#a07020';c.lineWidth=1;c.stroke();
        c.fillStyle=flash>0&&Math.sin(t*30)>0?'#d04a3a':'#8a5a2a';c.beginPath();c.arc(0,0,R,0,7);c.fill();c.strokeStyle='#4a2a10';c.lineWidth=3;c.stroke();
        c.strokeStyle='#6a4018';c.lineWidth=2;c.beginPath();c.arc(0,0,R-5,0,7);c.stroke();
        c.fillStyle='#c0392b';c.beginPath();c.arc(-1,0,10,0,7);c.fill();c.fillStyle='#f4f0e0';for(var d=0;d<5;d++){c.beginPath();c.arc(-1+Math.cos(d*1.3)*6,Math.sin(d*1.3)*6,1.6,0,7);c.fill();}
        c.fillStyle='#9ab88a';c.beginPath();c.moveTo(8,-3);c.lineTo(16,0);c.lineTo(8,3);c.fill();
        c.restore();
        fx.forEach(function(q){c.globalAlpha=1-q.t/.8;c.fillStyle=q.c;c.beginPath();c.ellipse(q.x,q.y,4,2,q.t*8,0,7);c.fill();});c.globalAlpha=1;
        // табло
        var tm=Q.st==='play'?(Math.round((t0+touch*PEN)*10)/10).toFixed(1):'0.0';c.fillStyle='rgba(40,24,10,.72)';sh.rr(8,WH-32,150,24,10);c.fill();
        sh.text(tm.replace('.',typeof LANG!=='undefined'&&LANG==='en'?'.':',')+L(' с',' s')+'  ·  '+L('касаний ','bumps ')+touch,83,WH-20,13,{col:'#fff6dc',ol:false,w:800,mw:140});
        if(Q.st==='play'&&tR>LIM-10)sh.text(L('Яга ворчит: ещё ','Yaga grumbles: ')+Math.ceil(LIM-tR)+L(' с — и сама поставлю!',' s more and I’ll park it myself!'),WW/2,WH-52,13,{col:'#ffe066',mw:340});}};
    return g;}};
})();
