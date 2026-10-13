'use strict';
/* ob2-LOVA · «Златая цепь» (флаг lov-cep, num 17). Движок — «Скакалка» Зины (показ с пальцем, зелёная полоса «ЖМИ!», разминка, «почему сбился»); основа — макет preview/MG.html.
   Лукоморье: Леший и Русалка крутят златую цепь, Кот Баюн прыгает. Нажми, чтобы цепь прошла под лапами, пока Баюн в воздухе. Темп +4 % за прыжок;
   каждые 10 прыжков Баюн зевает — Леший раззевался и крутит медленнее (передышка). Рекорд — прыжки подряд. Разминка — 5 прыжков: сбился — цепь встанет, начнём снова. */
(function(){var K=window.LOVK;if(!K)return;var WW=K.WW,WH=K.WH,L=K.L;
var UNIT=[['прыжок','прыжка','прыжков'],['jump','jumps']];
var WARM=5,OM0=2*Math.PI/2.1,OMX=2*Math.PI/.42,GY=392,LX=58,RX=302,HY=GY-46;
var CNT=[['Раз!','One!'],['Два!','Two!'],['Три!','Three!'],['Четыре!','Four!'],['Пять!','Five!'],['Шесть!','Six!'],['Семь!','Seven!'],['Восемь!','Eight!'],['Девять!','Nine!'],['Десять!','Ten!']];
K.G.cep={id:'cep',num:17,name:['Златая цепь','The Golden Chain'],who:['Кот Баюн','Bayun the Cat'],face:'kot',unit:UNIT,mid:18,medal:[10,25,45],demoT:5.2,
  demoTxt:['Мр-р. Смотри: жми, когда цепь подходит к лапам — шарик в зелёной полосе «ЖМИ!».','Purr. Watch: tap as the chain nears my paws — when the ball is in the green “JUMP!” band.'],
  goTxt:['Твоя очередь! Первые 5 прыжков — разминка: собьёшься — начнём снова.','Your turn! The first 5 jumps are a warm-up: trip and we start again.'],
  againTxt:['Мр-р. Ещё разок? Я не устал. Почти.','Purr. One more? I’m not tired. Almost.'],
  make:function(sh){var Q=sh.S,ph,om,jt,JT,warm,stopT,lastEnd,why,dead,yawn,tail,sp;
    function toB(){return ((Math.PI-ph%(2*Math.PI))+2*Math.PI)%(2*Math.PI)/om;}
    function air(){return jt>=0&&jt/JT>.16&&jt/JT<.86;}
    function score(){sh.setScore(Q.score+' <small>'+sh.pl(Q.score)+'</small>');}
    function jump(){if(dead||stopT>0||jt>=0)return;jt=0;sh.snd('up');}
    var g={reset:function(demo){ph=Math.PI*.15;om=Q.calm?OM0*.85:OM0;jt=-1;JT=.62;warm=Q.warmOn||demo?WARM:0;stopT=0;lastEnd=-9;why='';dead=false;yawn=0;tail=0;sp=[];Q.score=0;score();
        sh.warm(!demo&&Q.warmOn,L('Разминка: ','Warm-up: ')+WARM);},
      press:function(d){if(d&&Q.st==='play')jump();},
      peek:function(){return {tb:toB(),JT:JT,jt:jt,stop:stopT,dead:dead};},   // для стенда
      step:function(dt){tail+=dt;sp.forEach(function(p){p.t+=dt;p.vy+=260*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;});sp=sp.filter(function(p){return p.t<.6;});yawn=Math.max(0,yawn-dt);
        if(dead)return;if(stopT>0){stopT-=dt;if(stopT<=0)ph=Math.PI*.15;return;}
        var p0=ph;ph+=om*dt;if(jt>=0){jt+=dt;if(jt>JT){jt=-1;lastEnd=Q.t;}}
        if(Q.st==='demo'){if(jt<0&&toB()<JT*.5)jt=0;}
        var cr=Math.floor((p0-Math.PI)/(2*Math.PI))!==Math.floor((ph-Math.PI)/(2*Math.PI));if(!cr)return;
        if(Q.st==='demo')return;
        if(air()){for(var i=0;i<8;i++)sp.push({x:WW/2+(Q.rnd()-.5)*60,y:GY,vx:(Q.rnd()-.5)*90,vy:-40-Q.rnd()*60,t:0});
          if(warm>0&&Q.warmOn){warm--;sh.warm(warm>0,L('Разминка: ','Warm-up: ')+warm);sh.pop(L('Хоп!','Hop!'));if(!warm)sh.say(L('Разминка всё! Теперь — на рекорд. Темп растёт, мр-р.','Warm-up done! Now for the record. The pace picks up, purr.'));return;}
          Q.score++;score();om=Math.min(OMX,om*1.05);if(Q.score>20)om=Math.max(OM0,Math.min(OMX,om*(.9+.22*Q.rnd())));JT=Math.max(.26,Math.PI*1.02/om);
          var n=Q.score;sh.pop(n<=10?L(CNT[n-1][0],CNT[n-1][1]):String(n));if(n%5===0)sh.snd('purr');
          if(n===21)sh.say(L('Русалка шалит — цепь то быстрее, то медленнее. Следи за шариком!','Rusalka is playing tricks — the chain speeds up and slows down. Watch the ball!'));
          if(n%15===0){om=Math.max(OM0,om*.88);JT=Math.max(.26,Math.PI*1.02/om);yawn=2;sh.say(L('Баюн зевнул — Леший раззевался и крутит медленнее. Передышка!','Bayun yawned — Leshy is yawning too and turns slower. Breather!'));}}
        else{why=jt>=0&&jt/JT<=.16?'late':(Q.t-lastEnd<.5?'early':'none');var W={late:L('Поздно: Баюн оттолкнулся, когда цепь уже была у лап.','Too late: Bayun pushed off when the chain was already at his paws.'),
            early:L('Рано: Баюн приземлился раньше, чем прошла цепь.','Too early: Bayun landed before the chain passed.'),none:L('Не прыгнул: цепь задела лапы.','No jump: the chain caught his paws.')}[why];
          sh.snd('lose');
          if(warm>0&&Q.warmOn){warm--;stopT=1.3;jt=-1;sh.warm(warm>0,L('Разминка: ','Warm-up: ')+warm);sh.pop(L('Ой! Ещё раз','Oops! Again'),1);sh.say(W+' '+L('Жми, когда шарик в зелёной полосе.','Tap when the ball is in the green band.'));return;}
          dead=true;jt=-1;sh.end(Q.score,W);}},
      finger:function(){return {x:WW/2+92,y:GY-96,down:jt>=0&&jt<.15};},
      bg:function(c,w,h){var gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#7cc0e6');gr.addColorStop(.55,'#d6eee4');gr.addColorStop(.56,'#3a86b8');gr.addColorStop(.6,'#5aa0c8');gr.addColorStop(.61,'#6aa84e');gr.addColorStop(1,'#467e34');c.fillStyle=gr;c.fillRect(0,0,w,h);
        c.fillStyle='rgba(255,255,255,.35)';for(var i=0;i<w;i+=40){c.fillRect(i+((Q.t*12)%40),h*.575,18,2);}},
      draw:function(c){var t=Q.t;
        sh.put('luk_dub',WW/2,150,210);
        // цепь на дубе (по сказке) — немного блеска
        // держатели
        sh.put('lesh',LX-12,GY-22,96);sh.put('rusalka',RX+14,GY-14,80,{sx:-1});
        sh.text(L('Леший','Leshy'),LX-10,GY+40,13,{col:'#fff6dc'});sh.text(L('Русалка','Rusalka'),RX+12,GY+40,13,{col:'#fff6dc'});
        var co=Math.cos(ph),mid=HY+(co<0?-co*58:-co*190),front=Math.sin(ph)<0;
        function chain(){var n=22;for(var i=0;i<=n;i++){var u=i/n,x=LX+(RX-LX)*u,y=HY*(1-u)*(1-u)+2*(1-u)*u*(2*mid-HY)/1+HY*u*u;
            c.save();c.translate(x,y);c.rotate(i%2?0:Math.PI/2);c.strokeStyle='#8a5a0a';c.lineWidth=4.5;c.beginPath();c.ellipse(0,0,6,3.6,0,0,7);c.stroke();c.strokeStyle='#ffd34a';c.lineWidth=2.6;c.stroke();c.restore();}}
        // тень цепи на земле — темнеет, когда цепь у земли
        var nb=Math.max(0,1-Math.abs(mid-(GY+6))/120);c.fillStyle='rgba(0,0,0,'+(.08+.3*nb)+')';c.beginPath();c.ellipse(WW/2,GY+12,110,8,0,0,7);c.fill();
        if(!front)chain();
        var jy=jt>=0?Math.sin(Math.min(1,jt/JT)*Math.PI)*92:0;c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(WW/2,GY+10,30-jy/8,7,0,0,7);c.fill();
        sh.put('kot',WW/2,GY-24-jy,74,{rot:jt>=0?Math.sin(jt*8)*.12:Math.sin(tail*3)*.03});
        if(yawn>0)sh.text('Zz',WW/2+34,GY-74-jy,18,{col:'#fff6dc'});
        if(front)chain();
        sp.forEach(function(p){c.globalAlpha=1-p.t/.6;c.fillStyle='#ffe27a';c.fillRect(p.x,p.y,3.5,3.5);});c.globalAlpha=1;
        // полоса «ЖМИ!»: шарик бежит к правому краю — там цепь у лап
        var T=2*Math.PI/om,tb=dead||stopT>0?T:toB(),bx=36,bw=288,by=GY+56,u=1-tb/T,z0=1-JT*.86/T,z1=1-JT*.16/T;
        c.fillStyle='rgba(30,20,10,.45)';sh.rr(bx,by,bw,24,12);c.fill();
        var on=tb>=JT*.16&&tb<=JT*.86;c.fillStyle=on?'#4fd85a':'#2f9a3a';sh.rr(bx+bw*z0,by,bw*(z1-z0),24,10);c.fill();
        sh.text(L('ЖМИ!','JUMP!'),bx+bw*(z0+z1)/2,by+12,13,{col:'#fff',ol:false,w:900});
        c.fillStyle='#ffd34a';c.beginPath();c.arc(bx+bw*u,by+12,11,0,7);c.fill();c.strokeStyle='#7a4b12';c.lineWidth=2;c.stroke();
        if(Q.st==='play'&&Q.score===0&&!(warm<WARM))sh.text(Q.pc?L('Пробел — прыжок','Space — jump'):L('Нажми на экран — прыжок','Tap the screen — jump'),WW/2,by+52,16,{col:'#fff6dc'});}};
    return g;}};
})();
