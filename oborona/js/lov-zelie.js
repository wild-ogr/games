'use strict';
/* ob2-LOVA · «Зелье до черты» (флаг lov-zelie, num 16). Движок — «Компот до черты» Зины ← «Заправка» Выезда / «Весы» Гастронома; основа — макет preview/MG.html.
   Держи (палец, Пробел) — тётушка Яга наливает зелье, струя всё сильнее; отпусти в золотой полосе. После отпускания капает ещё чуть-чуть (бери с запасом).
   Ровно в середине — «Ай, хозяйка!». Перелил — из склянки выпрыгивает лягушка; недолил/перелил — промах, три промаха — конец. С 5-й склянки зелье «булькает» (уровень подскакивает).
   Склянки всё уже, черта то выше, то ниже. Рекорд — склянки. Разминка — первые 3 склянки (промах не считается). Грузится лениво (LOVK). */
(function(){var K=window.LOVK;if(!K)return;var WW=K.WW,WH=K.WH,L=K.L;
var UNIT=[['склянка','склянки','склянок'],['flask','flasks']];
var COL=[['#5ad06a','#2e9a3e'],['#b07ae8','#7a3ac0'],['#ff9a3a','#d0601a'],['#4ac0e8','#1a80b0'],['#e85a7a','#b02a4a']];
var LAB=[['стрельцам','archers'],['колдуну','wizard'],['не пить!','no drinking!'],['пушкарям','gunners'],['от икоты','for hiccups'],['Лешему','Leshy'],['для храбрости','for courage'],['коту','the cat']];
var LIVES=3;
K.G.zelie={id:'zelie',num:16,name:['Зелье до черты','Potion to the Line'],who:['Тётушка Яга','Auntie Yaga'],face:'tetka',unit:UNIT,mid:9,medal:[6,12,20],demoT:5,
  demoTxt:['Смотри, милок: держишь — льётся, отпускаешь в золотой полосе. Перельёшь — лягушка выпрыгнет!','Watch, dearie: hold — it pours, let go in the golden band. Overfill — and out jumps a frog!'],
  goTxt:['Держи и отпускай на черте! Первые 3 склянки — разминка.','Hold and let go at the line! The first 3 flasks are a warm-up.'],
  againTxt:['Ещё склянку, ещё! Заставам зелье нужно.','Another flask, another! The outposts need potions.'],
  make:function(sh){var Q=sh.S,lv,v,hold,band,warm,state,tt,frogs,flasks,acc,lives,drip,col,lab,bulk,sp,bub;
    function score(){var h='';for(var i=0;i<LIVES;i++)h+=i<lives?'❤':'🖤';sh.setScore(Q.score+' <small>'+sh.pl(Q.score)+'</small>'+(Q.st==='play'&&!(warm>0&&Q.warmOn)?' <small>'+h+'</small>':''));}
    function next(){lv=0;v=0;acc=0;hold=false;drip=0;state='fill';tt=0;var n=flasks;var w=Math.max(.055,.17-n*.008);var mid=.42+Q.rnd()*.4;band=[mid-w/2,mid+w/2];
      col=COL[n%COL.length];lab=LAB[(n*3+1)%LAB.length];bulk=n>=4&&Q.rnd()<.55?.25+Q.rnd()*.4:0;}
    function judge(){var mid=(band[0]+band[1])/2;
      if(lv>=band[0]&&lv<=band[1]){state='wait';tt=0;flasks++;var ex=Math.abs(lv-mid)<(band[1]-band[0])*.2;sh.snd(ex?'star':'coin');
        sh.pop(ex?L('Ай, хозяйка!','Oh, well done!'):L('Годится!','Good enough!'));for(var i=0;i<12;i++)sp.push({x:WW/2+(Q.rnd()-.5)*50,y:170,vx:(Q.rnd()-.5)*120,vy:-60-Q.rnd()*120,t:0});
        if(!Q.auto){Q.score++;if(warm>0){warm--;sh.warm(warm>0&&Q.warmOn,L('Разминка: ','Warm-up: ')+warm);if(!warm&&Q.warmOn)sh.say(L('Разминка всё! Три промаха — и я закрываю лавочку.','Warm-up over! Three misses and I close the shop.'));}
          else if(Q.score%5===0)sh.say(L('Ох, руки золотые! Ещё бы метлу мне починил…','Golden hands! If only you could mend my broom…'));}
        score();}
      else miss(lv<band[0]?L('Рано отпустил — зелье не дошло до черты.','Let go too early — the potion didn’t reach the line.'):L('Поздно отпустил — зелье выше черты, вот лягушка и выпрыгнула.','Let go too late — the potion went over the line, so a frog jumped out.'),lv>band[1]);}
    function miss(why,over){state='wait';tt=0;hold=false;if(over){frogs.push({t:0,dir:Q.rnd()<.5?-1:1});sh.snd('frog');}else sh.snd('leak');
      if(Q.auto)return;if(warm>0&&Q.warmOn){sh.pop(L('Мимо — в разминке не считается','Miss — doesn’t count in warm-up'),1);warm--;sh.warm(warm>0,L('Разминка: ','Warm-up: ')+warm);sh.say(why+' '+L('Ещё раз!','Again!'));return;}
      lives--;score();sh.pop(over?L('Ква!','Croak!'):L('Недолил!','Too little!'),1);
      if(lives<=0){sh.end(Q.score,why);return;}sh.say(why+' '+L('Осталось промахов: ','Misses left: ')+lives+'.');}
    var g={reset:function(demo){warm=Q.warmOn||demo?3:0;flasks=0;lives=LIVES;frogs=[];sp=[];bub=[];Q.score=0;next();score();sh.warm(!demo&&Q.warmOn,L('Разминка: 3','Warm-up: 3'));},
      peek:function(){return {lv:lv,b0:band[0],b1:band[1],st:state,hold:hold,v:v};},   // для стенда
      press:function(d){if(state!=='fill')return;if(d){hold=true;}else if(hold){hold=false;drip=.22;}},
      step:function(dt){tt+=dt;var rt=(Q.calm?.12:.15)+Math.min(.25,flasks*.011);
        if(state==='fill'){
          if(Q.auto&&Q.st==='demo'){if(hold&&lv>=band[0]+(band[1]-band[0])*.15){hold=false;drip=.22;}else if(!hold&&drip<=0&&lv<band[0])hold=true;}
          if(hold){acc+=dt;v=rt*(1+acc*1.3);lv+=v*dt;if(bulk&&lv>bulk){lv+=.035;bulk=0;sh.snd('splash');sh.pop(L('Бульк!','Blub!'));}}
          else if(drip>0){var d=Math.min(dt,drip);drip-=d;lv+=v*.25*d;if(drip<=0)judge();}
          if(lv>=1){lv=1;miss(L('Через край! Лягушка уже тут как тут.','Over the brim! The frog is right there.'),true);}
          if(hold&&Q.rnd()<dt*20)bub.push({x:WW/2+(Q.rnd()-.5)*30,y:440,t:0});}
        else if(state==='wait'&&tt>.85)next();
        frogs.forEach(function(f){f.t+=dt;});frogs=frogs.filter(function(f){return f.t<1.6;});
        sp.forEach(function(p){p.t+=dt;p.vy+=300*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;});sp=sp.filter(function(p){return p.t<.7;});
        bub.forEach(function(p){p.t+=dt;p.y-=40*dt;});bub=bub.filter(function(p){return p.t<1;});},
      finger:function(){return {x:WW/2+70,y:WH-70,down:hold};},
      bg:function(c,w,h){var gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#3a2a44');gr.addColorStop(.7,'#5a3e36');gr.addColorStop(1,'#3e2a20');c.fillStyle=gr;c.fillRect(0,0,w,h);
        c.fillStyle='rgba(120,80,50,.35)';for(var y=h*.12;y<h;y+=h*.16){c.fillRect(0,y,w,3);}
        c.fillStyle='rgba(255,210,120,.10)';for(var i=0;i<5;i++){c.beginPath();c.arc(w*(i+.5)/5,h*.07,28,0,7);c.fill();}},
      draw:function(c){var t=Q.t,fx=WW/2,top=176,bot=440,H=bot-top,wv=Math.max(56,96-Math.min(40,flasks*2.6));
        // полка и котёл
        c.fillStyle='#6a4426';c.fillRect(0,WH-40,WW,12);c.fillStyle='#4a2e18';c.fillRect(0,WH-28,WW,28);
        c.fillStyle='#ff8a2a';for(var i=0;i<5;i++){c.beginPath();c.moveTo(26+i*18,150);c.quadraticCurveTo(34+i*18,126+Math.sin(t*9+i)*8,44+i*18,150);c.fill();}
        c.fillStyle='#2a2a30';c.beginPath();c.ellipse(70,108,62,40,0,0,7);c.fill();c.strokeStyle='#111';c.lineWidth=3;c.stroke();
        c.fillStyle=col[0];c.beginPath();c.ellipse(70,78,54,12,0,0,7);c.fill();c.fillStyle='rgba(255,255,255,.4)';for(var b=0;b<4;b++){c.beginPath();c.arc(44+b*17,76+Math.sin(t*5+b)*2,3+(b%2),0,7);c.fill();}
        sh.put('tetka',150,70,78,{sx:-1});
        // струя
        if(hold&&state==='fill'){c.strokeStyle=col[0];c.lineWidth=5+v*14;c.lineCap='round';c.beginPath();c.moveTo(118,96);c.quadraticCurveTo(fx,64,fx,top+H*(1-lv));c.stroke();c.lineCap='butt';}
        else if(drip>0){c.fillStyle=col[0];c.beginPath();c.arc(fx,top+30+(.22-drip)*300,4,0,7);c.fill();}
        // склянка
        c.save();sh.rr(fx-wv/2,top,wv,H,20);c.fillStyle='rgba(220,240,255,.16)';c.fill();c.clip();var y=top+H*(1-lv);
        var lg=c.createLinearGradient(0,y,0,bot);lg.addColorStop(0,col[0]);lg.addColorStop(1,col[1]);c.fillStyle=lg;c.fillRect(fx-wv/2,y,wv,bot-y);
        c.fillStyle='rgba(255,255,255,.55)';for(var k=0;k<5;k++){c.beginPath();c.arc(fx-wv/2.6+k*wv/5,y+3+Math.sin(t*7+k)*2.5,3.5,0,7);c.fill();}
        bub.forEach(function(p){if(p.y>y){c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.arc(p.x,p.y,2.5,0,7);c.fill();}});
        c.fillStyle='rgba(255,255,255,.18)';c.fillRect(fx-wv/2+8,top+10,7,H-20);c.restore();
        sh.rr(fx-wv/2,top,wv,H,20);c.strokeStyle='#e8f4ff';c.lineWidth=3;c.stroke();c.fillStyle='#8a5a2e';sh.rr(fx-wv/2+6,top-10,wv-12,12,4);c.fill();
        // ярлык
        c.fillStyle='#f4e2b8';sh.rr(fx-46,bot-58,92,24,6);c.fill();c.strokeStyle='#8a5a2e';c.lineWidth=1.5;c.stroke();sh.text(L(lab[0],lab[1]),fx,bot-46,13,{col:'#5a2e0a',ol:false,w:800,mw:84});
        // черта
        var y1=top+H*(1-band[1]),y2=top+H*(1-band[0]);c.fillStyle='rgba(255,210,80,.38)';c.fillRect(fx-wv/2-18,y1,wv+36,y2-y1);c.strokeStyle='#ffd250';c.lineWidth=2.5;
        c.beginPath();c.moveTo(fx-wv/2-18,y1);c.lineTo(fx+wv/2+18,y1);c.moveTo(fx-wv/2-18,y2);c.lineTo(fx+wv/2+18,y2);c.stroke();
        sh.text(L('черта','line'),fx+wv/2+22,(y1+y2)/2,14,{al:'left',col:'#ffd250'});
        // готовые склянки
        for(var q=0;q<Math.min(flasks,11);q++){var cc=COL[q%COL.length];c.fillStyle=cc[0];sh.rr(10+q*31,WH-76,20,34,6);c.fill();c.strokeStyle='#e8f4ff';c.lineWidth=1.5;c.stroke();c.fillStyle='#8a5a2e';c.fillRect(14+q*31,WH-81,12,5);}
        sp.forEach(function(p){c.globalAlpha=1-p.t/.7;c.fillStyle='#ffe27a';c.fillRect(p.x,p.y,4,4);});c.globalAlpha=1;
        frogs.forEach(function(f){var a=f.t/1.6;sh.put('frog',fx+f.dir*a*170,top-10-Math.sin(a*Math.PI)*120+a*200,46,{rot:f.dir*a*3});});
        if(Q.st==='play'&&state==='fill'&&!hold&&lv===0&&Q.score===0)sh.text(Q.pc?L('Держи Пробел','Hold Space'):L('Держи палец на экране','Hold your finger on the screen'),WW/2,WH-15,16,{col:'#fff6dc'});}};
    return g;}};
})();
