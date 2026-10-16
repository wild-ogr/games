/* bb2-lov-dub.js — «Дуб Соловья» (ловкостная на рекорд, поток LOVA). Илья рубит дуб, на котором сидит Соловей: тап слева/справа — удар с этой стороны,
   сук над головой — перейди на другую. Полоска времени тает, каждый удар её возвращает. Счёт — поленья. Договор — шапка js/bb2-zab-ui.js. */
(function(){
var K=LOVK,TAU=Math.PI*2;
/* числа игры (не экономика): запас времени 0..1 */
var N={warm:5,gain:.062,drain0:.115,drainK:.0021,drainMax:.4,gold:10,goldGain:.2};
function drainOf(sc,calm){return Math.min(N.drainMax,N.drain0+N.drainK*sc)*(calm?.8:1);}
function nextSeg(prev,sc,r){if(prev)return r()<.5?0:prev;var p=Math.min(.42,.3+sc*.0015),x=r();return x<p?-1:x<2*p?1:0;}
var SAY=[[8,['Фьють! Кто там стучит?','Tweet! Who’s knocking?']],[20,['Эй, это мой дуб!','Hey, that’s my oak!']],[35,['Фью-у-у… щекотно же!','Whee-ew… that tickles!']],[50,['Самовар-то за что?!','Not the samovar!']], // i18n:ru — пары [рус, англ] / русская раскладка
  [65,['Давай договоримся?','Can we make a deal?']],[80,['Я больше не буду свистеть!','I’ll never whistle again!']],[100,['Сдаюсь. Свищу шёпотом…','I give up. Whistling in a whisper…']],[130,['Ты вообще устаёшь?!','Do you ever get tired?!']],[170,['Дуб кончился. Руби совесть!','Out of oak. Chop your conscience!']]]; // i18n:ru — пары [рус, англ] / русская раскладка
function run(host,o){
  var c=ZABK.canvas(host),g=c.getContext('2d'),P=[],H=null,st=null,demo=0,dead=0,over=false,live=false,seen={},logs=[],junk=[],bub=null,sh0=0,spr={};
  function rnd(){return Math.random();}
  function reset(){st={sc:0,side:-1,segs:[],time:1,sw:0,off:0,dT:0,shake:0,t:0,flash:0};var prev=0,i;for(i=0;i<14;i++){var s=i<N.warm+1?0:nextSeg(prev,0,rnd);st.segs.push(s);prev=s;}logs.length=0;junk.length=0;bub=null;dead=0;}
  function geo(){var W=c.W,Hh=c.H,sh=K.clamp(Hh*.105,50,92),tw=sh*.92;return {W:W,H:Hh,sh:sh,tw:tw,cx:W/2,gy:Hh*.8,px:tw/2+sh*.62,bl:Math.min(W/2-tw/2-4,sh*1.75)};}
  function mk(w,h,fn){var d=c.D,q=document.createElement('canvas');q.width=Math.ceil(w*d);q.height=Math.ceil(h*d);var x=q.getContext('2d');x.setTransform(d,0,0,d,0,0);fn(x,w,h);return q;}
  function sprites(G){if(sh0===G.sh+c.D*1000)return;sh0=G.sh+c.D*1000;
    spr.tr=mk(G.tw,G.sh,function(x,w,h){var gr=x.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#5d3a1c');gr.addColorStop(.35,'#9a6532');gr.addColorStop(.7,'#7c4f26');gr.addColorStop(1,'#4c2e14');x.fillStyle=gr;x.fillRect(0,0,w,h);
      x.strokeStyle='rgba(40,22,8,.55)';x.lineWidth=2;for(var i=0;i<5;i++){var bx=w*(.12+i*.19);x.beginPath();x.moveTo(bx,2);x.quadraticCurveTo(bx+(i%2?5:-5),h/2,bx+(i%2?-2:3),h-2);x.stroke();}
      x.fillStyle='rgba(255,220,150,.12)';x.fillRect(w*.28,0,w*.1,h);x.fillStyle='rgba(30,16,6,.5)';x.fillRect(0,h-2,w,2);});
    spr.go=mk(G.tw,G.sh,function(x,w,h){x.drawImage(spr.tr,0,0,w,h);x.fillStyle='rgba(255,208,60,.5)';x.fillRect(0,0,w,h);x.fillStyle='rgba(255,250,200,.55)';x.fillRect(w*.25,0,w*.12,h);});
    spr.br=mk(G.bl,G.sh,function(x,w,h){var y=h*.5;x.strokeStyle='#4c2e14';x.lineCap='round';x.lineWidth=h*.26;x.beginPath();x.moveTo(-4,y+h*.08);x.quadraticCurveTo(w*.4,y,w*.72,y-h*.12);x.stroke();
      x.strokeStyle='#8a5a2c';x.lineWidth=h*.14;x.beginPath();x.moveTo(-4,y+h*.05);x.quadraticCurveTo(w*.4,y-h*.03,w*.72,y-h*.14);x.stroke();
      var L=[[.5,.3,.3,'#2f7a2a'],[.72,.38,.34,'#3d9a35'],[.86,.2,.26,'#58b848'],[.62,.14,.24,'#4aa83e'],[.9,.5,.2,'#2f7a2a']],i;
      for(i=0;i<L.length;i++){x.fillStyle=L[i][3];x.beginPath();x.arc(w*L[i][0],h*L[i][1],h*L[i][2],0,TAU);x.fill();}x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.arc(w*.8,h*.14,h*.1,0,TAU);x.fill();});}
  var bg=K.bg(c,function(x,W,Hh){var gy=Hh*.8,gr=x.createLinearGradient(0,0,0,gy);gr.addColorStop(0,'#7fc4ee');gr.addColorStop(1,'#d8f0d0');x.fillStyle=gr;x.fillRect(0,0,W,gy);
    x.fillStyle='#9fd0a0';x.beginPath();x.moveTo(0,gy);for(var i=0;i<=8;i++)x.lineTo(W*i/8,gy-Hh*(.1+.05*Math.sin(i*1.9)));x.lineTo(W,gy);x.fill();
    x.fillStyle='#6fb070';for(i=0;i<7;i++){var px=W*(i+.5)/7,ph=Hh*(.08+.04*((i*37)%5)/5);x.beginPath();x.moveTo(px-ph*.5,gy);x.lineTo(px,gy-ph*2);x.lineTo(px+ph*.5,gy);x.fill();}
    gr=x.createLinearGradient(0,gy,0,Hh);gr.addColorStop(0,'#6aa63c');gr.addColorStop(1,'#3f7426');x.fillStyle=gr;x.fillRect(0,gy,W,Hh-gy);x.fillStyle='rgba(255,255,255,.1)';x.fillRect(0,gy,W,3);});
  function drawJunk(j,s){g.save();g.translate(j.x,j.y);g.rotate(j.r);g.scale(s,s);g.lineWidth=2;g.strokeStyle='#3a2410';
    if(j.k===0){g.fillStyle='#d9a441';g.beginPath();g.ellipse(0,0,11,13,0,0,TAU);g.fill();g.stroke();g.fillRect(-7,-19,14,6);g.strokeRect(-7,-19,14,6);g.fillRect(-9,12,18,5);g.strokeRect(-9,12,18,5);g.beginPath();g.moveTo(11,-2);g.lineTo(19,-6);g.stroke();g.fillStyle='#fff3c4';g.fillRect(-4,-6,3,8);}
    else if(j.k===1){g.fillStyle='#d8b46a';g.beginPath();g.moveTo(-14,4);g.quadraticCurveTo(-12,-8,0,-6);g.quadraticCurveTo(14,-4,15,5);g.lineTo(-14,8);g.closePath();g.fill();g.stroke();g.beginPath();for(var i=-10;i<12;i+=5){g.moveTo(i,-5);g.lineTo(i+4,6);}g.stroke();}
    else{g.fillStyle='#b8322a';g.beginPath();g.moveTo(-13,6);g.quadraticCurveTo(0,-22,13,6);g.closePath();g.fill();g.stroke();g.fillStyle='#f3e6c8';K.rr(g,-15,4,30,7,3);g.fill();g.stroke();}
    g.restore();}
  function say(t){bub={t:L(t[0],t[1]),a:3};}
  function kill(why){if(dead||demo)return;dead=1;st.dT=0;st.why=why;K.snd('hurt');K.vib(80);if(!o.calm)st.shake=10;}
  function tapSide(s,auto){if(!live||dead||over||(demo&&!auto))return;var G=geo();st.side=s;st.sw=.13;
    if(st.segs[0]===s){kill(1);return;}
    var top=st.segs.shift(),gold=(st.sc+1)%N.gold===0;st.sc++;st.off=1;st.time=Math.min(1,st.time+N.gain+(gold?N.goldGain:0));
    st.segs.push(nextSeg(st.segs[st.segs.length-1],st.sc,rnd));
    logs.push({x:G.cx,y:G.gy-G.sh/2,vx:-s*(260+Math.random()*120),vy:-200-Math.random()*90,r:0,vr:-s*(6+Math.random()*5),t:0,br:top,gold:(st.sc)%N.gold===0});if(logs.length>10)logs.shift();
    ZABK.burst(P,G.cx+s*G.tw*.4,G.gy-G.sh*.3,{n:5,sp:170,col:'#e8c88a',s:3,d:.4,a0:s>0?-.9:Math.PI-.4,arc:1.3});
    K.snd(gold?'coin':'hit');if(gold&&!demo){ZABK.burst(P,G.cx,G.gy-G.sh,{n:10,col:'#ffe27a',k:'star',s:6});st.flash=.5;}
    if(!demo){H.set(st.sc);for(var i=0;i<SAY.length;i++)if(st.sc===SAY[i][0]&&!seen[i]){seen[i]=1;say(SAY[i][1]);K.snd('whistle');}
      if(st.sc%50===0){for(i=0;i<9;i++)junk.push({x:G.cx+(Math.random()-.5)*G.W*.8,y:-20-Math.random()*200,vy:160+Math.random()*120,r:Math.random()*6,vr:(Math.random()-.5)*6,k:i%3});K.snd('chest');}}
    if(st.segs[0]===s)kill(2);}
  function finish(){if(over)return;over=true;live=false;if(H)H.end();
    host.done({score:st.sc,extra:{msg:st.why===3?L('Время вышло — руби чаще','Out of time — chop faster'):st.why===2?L('Сук по шлему — смотри на ветку выше','A branch hit you — watch the one above'):L('Шагнул прямо под сук','You stepped right under a branch')}});}
  function afterDeath(){K.cont(host,o,st.sc,function(ok){if(!ok){finish();return;}dead=0;st.time=.75;if(st.segs[0]===st.side)st.segs[0]=0;if(st.segs[1]===st.side)st.segs[1]=0;st.shake=0;});}
  var demoQ=0,demoN=0;
  ZABK.loop(host,function(dt,now){var G=geo(),i;sprites(G);
    if(live&&!dead&&!over){st.t+=dt;
      if(demo){demoQ-=dt;if(demoQ<=0){demoQ=.34;if(demoN>=9){demo=0;reset();st.msg=1.6;}else{demoN++;var s=st.segs[1]===st.side?-st.side:st.side;if(st.segs[0]===s)s=-s;tapSide(s,1);st.fing=.2;}}}
      else if(st.sc>=N.warm){st.time-=drainOf(st.sc,o.calm)*dt;if(st.time<=0){st.time=0;kill(3);}}}
    if(dead&&!over){st.dT+=dt;if(dead===1&&st.dT>.9){dead=2;afterDeath();}}
    st.off=Math.max(0,st.off-dt*14);st.sw=Math.max(0,st.sw-dt);st.shake=Math.max(0,st.shake-dt*30);st.flash=Math.max(0,st.flash-dt);if(st.fing>0)st.fing-=dt;if(st.msg>0)st.msg-=dt;
    bg(g);g.save();if(st.shake>0)g.translate((Math.random()-.5)*st.shake,(Math.random()-.5)*st.shake);
    /* ствол */
    var n=Math.ceil(G.gy/G.sh)+2,y;for(i=0;i<n&&i<st.segs.length;i++){y=G.gy-(i+1)*G.sh-st.off*G.sh*.9;var gold=(st.sc+i+1)%N.gold===0;
      g.drawImage(gold?spr.go:spr.tr,G.cx-G.tw/2,y,G.tw,G.sh+1);
      if(st.segs[i]>0)g.drawImage(spr.br,G.cx+G.tw/2-2,y,G.bl,G.sh);else if(st.segs[i]<0){g.save();g.translate(G.cx-G.tw/2+2,y);g.scale(-1,1);g.drawImage(spr.br,0,0,G.bl,G.sh);g.restore();}}
    g.fillStyle='#4c2e14';K.rr(g,G.cx-G.tw*.62,G.gy-6,G.tw*1.24,16,7);g.fill();g.fillStyle='#8a5a2c';K.rr(g,G.cx-G.tw*.56,G.gy-8,G.tw*1.12,8,4);g.fill();
    /* Соловей */
    var sy=K.lerp(K.top()+G.sh*2.5,G.gy-G.sh*3.6,Math.min(1,st.sc/140))+Math.sin(now*3)*3-st.off*10,sp=G.sh*1.45;
    g.fillStyle='#4c2e14';K.rr(g,G.cx-G.tw*.9,sy+sp*.3,G.tw*1.8,10,5);g.fill();ZABK.put(g,'solo',G.cx,sy,sp,c.D,{rot:Math.sin(now*9)*(st.off>0?.12:.02)});
    if(bub){bub.a-=dt;K.say(g,bub.t,G.cx,sy-sp*.42,G.W,bub.a);if(bub.a<=0)bub=null;}
    /* летящие поленья и трофеи */
    for(i=logs.length-1;i>=0;i--){var l=logs[i];l.t+=dt;l.x+=l.vx*dt;l.y+=l.vy*dt;l.vy+=900*dt;l.r+=l.vr*dt;if(l.t>1){logs.splice(i,1);continue;}g.save();g.translate(l.x,l.y);g.rotate(l.r);g.globalAlpha=Math.min(1,(1-l.t)*3);g.drawImage(l.gold?spr.go:spr.tr,-G.tw/2,-G.sh/2,G.tw,G.sh);g.restore();}
    for(i=junk.length-1;i>=0;i--){var j=junk[i];j.y+=j.vy*dt;j.vy+=500*dt;j.r+=j.vr*dt;if(j.y>G.H+40){junk.splice(i,1);continue;}drawJunk(j,G.sh/52);}
    /* богатырь */
    var hx=G.cx+st.side*G.px,hp=G.sh*1.5,hy=G.gy-hp*.42,key=ART.h_ily_0?'h_ily_'+(st.sw>0?1:0):'h_dob_0';
    g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(hx,G.gy+2,hp*.3,hp*.09,0,0,TAU);g.fill();
    if(dead){var q=Math.min(1,st.dT*4);ZABK.put(g,key,hx,hy+hp*.2*q,hp,c.D,{sx:-st.side*(1+.25*q),sy:1-.4*q});for(i=0;i<3;i++){var a=now*5+i*2.1;ZABK.text(g,'✦',hx+Math.cos(a)*hp*.3,hy-hp*.3+Math.sin(a)*6,16,{col:'#ffe27a'});}}
    else{ZABK.put(g,key,hx,hy,hp,c.D,{sx:-st.side,sy:1});var sw=st.sw>0?1-st.sw/.13:1;ZABK.put(g,'axe',hx-st.side*hp*(.3+.12*Math.sin(sw*Math.PI)),hy-hp*.02,hp*.55,c.D,{rot:-st.side*(-1.1+sw*1.5),sx:-st.side,sy:1});}
    ZABK.parts(g,P,dt);g.restore();
    if(st.flash>0){g.fillStyle='rgba(255,236,150,'+(st.flash*.3)+')';g.fillRect(0,0,G.W,G.H);}
    /* полоска времени и подсказки */
    if(live&&!demo){var bw=Math.min(G.W*.62,270),by=K.top()+84,low=st.time<.25;K.bar(g,G.cx-bw/2,by,bw,12,st.time,low?'#ff5a3a':'#ffd25a',low?'#ff8a3a':'#8fd14a');
      if(st.sc<N.warm){var al=.55+.25*Math.sin(now*6);g.globalAlpha=al;if(zabPC()){zabKeycap(g,G.W*.2,G.gy+G.sh*.75,'←',30);zabKeycap(g,G.W*.8,G.gy+G.sh*.75,'→',30);}else{K.finger(g,G.W*.2,G.gy+G.sh*.5,0);K.finger(g,G.W*.8,G.gy+G.sh*.5,0);}g.globalAlpha=1;
        K.tag(g,G.W,G.H-26,st.msg>0?L('Теперь ты!','Your turn!'):L('Разминка: время не идёт','Warm-up: the clock is paused'));}
}
    if(demo){K.tag(g,G.W,K.top()+116,L('Смотри: руби с той стороны, где над головой нет сука','Watch: chop from the side with no branch overhead'));K.finger(g,G.cx+st.side*G.W*.3,G.gy+G.sh*.45,st.fing>0);}
  });
  ZABK.tap(c,host,function(x){tapSide(x<c.W/2?-1:1);});
  zabKeys(host,function(k){if(k==='ArrowLeft'||k==='a'||k==='A'||k==='ф'||k==='Ф'){tapSide(-1);return true;}if(k==='ArrowRight'||k==='d'||k==='D'||k==='в'||k==='В'){tapSide(1);return true;}}); // i18n:ru — пары [рус, англ] / русская раскладка
  reset();host.dbg={st:function(){return st;},tap:tapSide,dead:function(){return dead;},demo:function(){return demo;}};
  ZREC.start(host,o,function(){H=ZREC.hud(host,o);reset();live=true;if(o.first&&!o.again){demo=1;demoN=0;demoQ=.5;}});
}
function sim(o,k){var sc=0,time=1,prev=0,segs=[],side=-1,r=o&&o.rnd||Math.random,i,cps=2.2+4.2*k,err=(1-k)*.05;for(i=0;i<3;i++)segs.push(0);
  for(;;){if(sc>=N.warm){time-=drainOf(sc)/(cps*(.85+.3*r()));if(time<=0)break;}
    var s=segs[1]===side?-side:side;if(segs[0]===s)s=-s;if((segs[1]||segs[0])&&r()<err)s=-s;side=s;if(segs[0]===s)break;segs.shift();sc++;time=Math.min(1,time+N.gain+(sc%N.gold===0?N.goldGain:0));
    prev=segs[segs.length-1];if(sc<N.warm)segs.push(0);else segs.push(nextSeg(prev,sc,r));if(segs[0]===s)break;if(sc>600)break;}
  return {score:sc,tier:ZREC.tier('dub',sc)};}
ZAB_REG({id:'dub',kind:'lov',n:zabN('Дуб Соловья','Nightingale’s Oak'),run:run,sim:sim});
})();
