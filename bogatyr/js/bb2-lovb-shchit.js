/* bb2-lovb-shchit.js — «Щит Добрыни» (ловкостная на рекорд, поток LOVB). Добрыня в середине, стрелы и огненные плевки летят с четырёх сторон.
   Тап по стороне экрана (или стрелка) — щит туда. Темп растёт; с 12-го удара Леший кидает шишки «понарошку» — они не долетают, но сбивают с толку.
   Счёт — отбитые стрелы. Договор — шапка js/bb2-zab-ui.js; общий набор — js/bb2-lov-kit.js (LOVK). */
(function(){
var K=LOVK,TAU=Math.PI*2,DX=[0,1,0,-1],DY=[-1,0,1,0];
/* числа игры (не экономика) */
var N={warm:5,g0:.95,gK:.975,gMin:.34,sw:.3,same:.35,cone:.2,cone0:12,fire0:25,fire:.3,T0:1.6,TK:.012,Tmin:.8};
function gapOf(sc,calm){return Math.max(N.gMin,N.g0*Math.pow(N.gK,sc))*(calm?1.25:1);}
function flyOf(sc,calm){return Math.max(N.Tmin,N.T0-N.TK*sc)*(calm?1.25:1);}
/* расписание: {t прилёта, d сторона 0 верх 1 право 2 низ 3 лево, k 'a'|'f'|'c'} */
function gen(st,r,calm){var sc=st.n,g=gapOf(sc,calm)*(.8+.45*r()),last=st.ld,d;
  d=last<0||r()<N.same?(last<0?Math.floor(r()*4):last):(last+1+Math.floor(r()*3))%4;
  if(d!==last&&last>=0)g=Math.max(g,N.sw*(calm?1.3:1));
  var t=st.tn+g,k=sc>=N.fire0&&r()<N.fire?'f':'a';
  if(sc>=N.cone0&&r()<N.cone){var cd=(d+1+Math.floor(r()*3))%4;st.q.push({t:st.tn+g*.55,d:cd,k:'c'});t+=.12;}
  st.q.push({t:t,d:d,k:k});st.tn=t;st.ld=d;st.n++;}
var SAY=[[10,['Щит-то крепкий!','Sturdy shield!']],[25,['Добрыня, ты уже как ёж!','Dobrynya, you look like a hedgehog!']],[40,['Колчаны пустеют!','Their quivers are running dry!']], // i18n:ru
  [60,['Горыныч обиделся и дует на угли','Gorynych sulks and blows on his coals']],[80,['Щит тяжелее Добрыни!','The shield outweighs Dobrynya!']],[110,['Нечисть пишет жалобу князю','The monsters complain to the prince']]]; // i18n:ru
var CONE=[['Понарошку!','Just kidding!'],['Попался?','Got you?'],['Хи-хи!','Tee-hee!'],['Шишка — не стрела!','A cone’s no arrow!']]; // i18n:ru
function run(host,o){
  var c=ZABK.canvas(host),g=c.getContext('2d'),P=[],H=null,st=null,live=false,over=false,dead=0,demo=0,seen={},bub=null,spr={},s0=0,rnd=Math.random;
  function reset(){st={sc:0,n:0,t:0,tn:.9,ld:-1,q:[],fly:[],dir:0,turn:0,stuck:[],shake:0,flash:0,dT:0,why:'',fool:0,lastC:-1,lastCT:-9,fing:0,fx:0,fy:0,peek:[]};
    var i;for(i=0;i<3;i++)gen(st,rnd,o.calm);bub=null;dead=0;}
  function geo(){var W=c.W,Hh=c.H,top=K.top()+96,cy=top+(Hh-top)*.52,R=K.clamp(Math.min(W,Hh-top)*.2,46,120);return {W:W,H:Hh,cx:W/2,cy:cy,R:R,top:top,
    D:[cy-top+R*.4,W/2+30,Hh-cy+30,W/2+30]};}
  function mk(w,h,fn){var d=c.D,q=document.createElement('canvas');q.width=Math.ceil(w*d);q.height=Math.ceil(h*d);var x=q.getContext('2d');x.setTransform(d,0,0,d,0,0);fn(x,w,h);return q;}
  function sprites(G){if(s0===G.R+c.D*1000)return;s0=G.R+c.D*1000;var R=G.R;
    spr.sh=mk(R*1.3,R*.5,function(x,w,h){x.translate(w/2,h/2);var gr=x.createLinearGradient(0,-h/2,0,h/2);gr.addColorStop(0,'#f06a52');gr.addColorStop(.55,'#c8392f');gr.addColorStop(1,'#7d1b2c');
      x.fillStyle='rgba(40,10,10,.35)';x.beginPath();x.ellipse(0,h*.08,w*.47,h*.42,0,0,TAU);x.fill();
      x.fillStyle=gr;x.strokeStyle='#e6b53a';x.lineWidth=Math.max(3,R*.06);x.beginPath();x.ellipse(0,0,w*.46,h*.38,0,0,TAU);x.fill();x.stroke();
      x.strokeStyle='rgba(255,220,120,.55)';x.lineWidth=Math.max(1.5,R*.025);x.beginPath();x.ellipse(0,0,w*.3,h*.24,0,0,TAU);x.stroke();
      x.fillStyle='#ffd25a';x.strokeStyle='#8a5a12';x.lineWidth=1.5;x.beginPath();x.ellipse(0,0,R*.11,R*.08,0,0,TAU);x.fill();x.stroke();});
    spr.ar=mk(R*.9,R*.18,function(x,w,h){x.strokeStyle='#8a5a2c';x.lineWidth=Math.max(2,h*.16);x.beginPath();x.moveTo(w*.12,h/2);x.lineTo(w*.86,h/2);x.stroke();
      x.fillStyle='#c2ccd8';x.beginPath();x.moveTo(w,h/2);x.lineTo(w*.82,h*.12);x.lineTo(w*.82,h*.88);x.closePath();x.fill();
      x.fillStyle='#e8e0d0';x.beginPath();x.moveTo(0,h*.1);x.lineTo(w*.2,h/2);x.lineTo(0,h*.9);x.lineTo(w*.08,h/2);x.closePath();x.fill();});
    spr.fi=mk(R*.7,R*.7,function(x,w,h){var gr=x.createRadialGradient(w/2,h/2,1,w/2,h/2,w/2);gr.addColorStop(0,'#fff6b0');gr.addColorStop(.35,'#ffb52e');gr.addColorStop(.7,'rgba(240,80,20,.8)');gr.addColorStop(1,'rgba(200,40,10,0)');
      x.fillStyle=gr;x.beginPath();x.arc(w/2,h/2,w/2,0,TAU);x.fill();});
    spr.co=mk(R*.42,R*.5,function(x,w,h){x.translate(w/2,h/2);x.fillStyle='#8a5a2c';x.strokeStyle='#3a2410';x.lineWidth=2;x.beginPath();x.ellipse(0,0,w*.36,h*.44,0,0,TAU);x.fill();x.stroke();
      x.strokeStyle='#5a3618';x.lineWidth=1.6;for(var i=-2;i<=2;i++){x.beginPath();x.moveTo(-w*.32,i*h*.16);x.quadraticCurveTo(0,i*h*.16+h*.1,w*.32,i*h*.16);x.stroke();}
      x.fillStyle='#4c8a2a';x.fillRect(-2,-h*.5,4,h*.12);});}
  var bg=K.bg(c,function(x,W,Hh){var G=geo(),gr=x.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,'#8ec7e8');gr.addColorStop(.42,'#d6efd2');gr.addColorStop(.43,'#8fbf62');gr.addColorStop(1,'#4f8a34');
    x.fillStyle=gr;x.fillRect(0,0,W,Hh);x.fillStyle='rgba(60,100,40,.35)';for(var i=0;i<26;i++){var px=(i*97)%W,py=Hh*.45+((i*53)%100)/100*Hh*.55;x.fillRect(px,py,3,7);x.fillRect(px+4,py+2,3,5);}
    x.fillStyle='rgba(255,240,200,.28)';x.beginPath();x.ellipse(G.cx,G.cy+G.R*.55,G.R*1.25,G.R*.42,0,0,TAU);x.fill();
    x.strokeStyle='rgba(255,250,230,.35)';x.lineWidth=2;x.setLineDash([6,8]);x.beginPath();x.moveTo(0,G.cy-(G.cy-G.top)*.0);x.lineTo(W,G.cy);x.moveTo(G.cx,G.top);x.lineTo(G.cx,Hh);x.stroke();x.setLineDash([]);});
  function say(t,a){bub={t:L(t[0],t[1]),a:a||2.6};}
  function pos(G,p,q){var d=p.d,D=G.D[d],r=G.R+(D-G.R)*(1-q);if(p.k==='c')r=G.R*1.7+(D-G.R*1.7)*(1-q);return [G.cx+DX[d]*r,G.cy+DY[d]*r];}
  function setDir(d,auto){if(!live||dead||over||(demo&&!auto))return;if(st.dir!==d){st.dir=d;st.turn=.08;K.snd('swing');if(st.lastC===d&&st.t-st.lastCT<.7)st.fool=1;else st.fool=0;}}
  function tapAt(x,y){var G=geo(),dx=x-G.cx,dy=y-G.cy;setDir(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));}
  function kill(p){if(dead||demo)return;var nm=[L('сверху','from above'),L('справа','from the right'),L('снизу','from below'),L('слева','from the left')][p.d];
    st.why=st.fool?L('Шишку Лешего ловил, а '+(p.k==='f'?'плевок':'стрела')+' прилетела '+nm+'. Шишки — понарошку!','You chased Leshy’s cone, and a '+(p.k==='f'?'fireball':'arrow')+' came '+nm+'. Cones are fake!')
      :L((p.k==='f'?'Огненный плевок':'Стрела')+' прилетела '+nm+' — смотри, где летит ближе всех','A '+(p.k==='f'?'fireball':'arrow')+' came '+nm+' — watch the closest one');
    if(st.sc<N.warm){st.flash=.4;K.snd('hurt');say(['Разминка — не считается!','Warm-up — doesn’t count!'],1.6);return;} // i18n:ru
    dead=1;st.dT=0;K.snd('hurt');K.vib(80);if(!o.calm)st.shake=10;}
  function block(p,G){st.sc++;var q=pos(G,p,1);ZABK.burst(P,q[0],q[1],{n:p.k==='f'?12:6,sp:p.k==='f'?200:140,col:p.k==='f'?'#ffb52e':'#fff0c0',s:3,d:.4});K.snd(p.k==='f'?'boom':'hit');
    if(p.k==='a'){st.stuck.push({o:(Math.random()-.5)*.7,a:(Math.random()-.5)*.5});if(st.stuck.length>16)st.stuck.shift();}
    if(!demo){H.set(st.sc);for(var i=0;i<SAY.length;i++)if(st.sc===SAY[i][0]&&!seen[i]){seen[i]=1;say(SAY[i][1]);}if(st.sc%25===0){K.snd('level');st.flash=.35;}}}
  function finish(){if(over)return;over=true;live=false;if(H)H.end();host.done({score:st.sc,extra:{msg:st.why||L('Щит не успел','The shield was too slow')}});}
  function afterDeath(){K.cont(host,o,st.sc,function(ok){if(!ok){finish();return;}dead=0;st.fly.length=0;st.q.length=0;st.tn=st.t+1.1;st.ld=-1;var i;for(i=0;i<3;i++)gen(st,rnd,o.calm);st.shake=0;});}
  ZABK.loop(host,function(dt,now){var G=geo(),i,p;sprites(G);
    if(live&&!dead&&!over){st.t+=dt;
      /* выпуск: снаряд появляется за T до прилёта */
      var T=flyOf(st.sc,o.calm);for(i=0;i<st.q.length;i++){p=st.q[i];if(!p.on&&st.t>=p.t-T*(p.k==='f'?.8:1)){p.on=1;p.t0=st.t;p.T=p.t-st.t;st.fly.push(p);
        if(p.k==='c'){st.peek.push({d:p.d,t:0,k:'lesh'});}else if(Math.random()<.35||p.k==='f')st.peek.push({d:p.d,t:0,k:p.k==='f'?'gory':'chert'});}}
      for(i=st.q.length-1;i>=0;i--)if(st.q[i].on)st.q.splice(i,1);
      while(st.q.length<3)gen(st,rnd,o.calm);
      for(i=st.fly.length-1;i>=0;i--){p=st.fly[i];var q=(st.t-p.t0)/Math.max(.05,p.T);
        if(q>=1){st.fly.splice(i,1);if(p.k==='c'){var cp=pos(G,p,1);ZABK.burst(P,cp[0],cp[1],{n:5,sp:90,col:'#8a5a2c',s:3,d:.4});st.lastC=p.d;st.lastCT=st.t;if(!demo&&Math.random()<.5)say(K.pick(CONE),1.4);continue;}
          if(st.dir===p.d)block(p,G);else{kill(p);if(dead)break;}}}
      if(demo){var nx=null;for(i=0;i<st.fly.length;i++){p=st.fly[i];if(p.k!=='c'&&(!nx||p.t<nx.t))nx=p;}
        if(nx&&nx.t-st.t<.4&&st.dir!==nx.d){setDir(nx.d,1);st.fing=.25;st.fx=G.cx+DX[nx.d]*G.R*1.6;st.fy=G.cy+DY[nx.d]*G.R*1.6;}
        if(st.sc>=8){demo=0;reset();st.msg=1.6;}}}
    if(dead&&!over){st.dT+=dt;if(dead===1&&st.dT>.8){dead=2;afterDeath();}}
    st.turn=Math.max(0,st.turn-dt);st.shake=Math.max(0,st.shake-dt*30);st.flash=Math.max(0,st.flash-dt);if(st.fing>0)st.fing-=dt;if(st.msg>0)st.msg-=dt;
    bg(g);g.save();if(st.shake>0)g.translate((Math.random()-.5)*st.shake,(Math.random()-.5)*st.shake);
    /* кто стреляет — выглядывает с края */
    for(i=st.peek.length-1;i>=0;i--){var pk=st.peek[i];pk.t+=dt;if(pk.t>.9){st.peek.splice(i,1);continue;}var pp=G.R*1.1,a=Math.min(1,pk.t*5,(0.9-pk.t)*5),ex=K.clamp(G.cx+DX[pk.d]*(G.W/2),pp*.45,G.W-pp*.45),ey=K.clamp(G.cy+DY[pk.d]*G.D[pk.d]*.95,G.top-pp*.1,G.H-pp*.4);
      ZABK.put(g,pk.k,ex,ey,pp,c.D,{a:a,sx:pk.d===1?-1:1,sy:1});}
    /* Добрыня */
    var hp=G.R*1.75,hk=ART.h_dob_1&&st.turn>0?'h_dob_1':'h_dob_0';g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(G.cx,G.cy+hp*.42,hp*.32,hp*.09,0,0,TAU);g.fill();
    if(dead){var qd=Math.min(1,st.dT*4);ZABK.put(g,hk,G.cx,G.cy+hp*.1*qd,hp,c.D,{rot:.5*qd*(st.dir===1?-1:1)});}else ZABK.put(g,hk,G.cx,G.cy,hp,c.D,{sx:st.dir===3?-1:1,sy:1});
    /* щит и стрелы в нём */
    var ang=[-Math.PI/2,0,Math.PI/2,Math.PI][st.dir],sw=G.R*1.3;g.save();g.translate(G.cx,G.cy);g.rotate(ang+Math.PI/2);g.translate(0,-G.R*.92);
    for(i=0;i<st.stuck.length;i++){var s=st.stuck[i];g.save();g.translate(s.o*sw,-G.R*.02);g.rotate(Math.PI/2+s.a);g.drawImage(spr.ar,-G.R*.62,-G.R*.09,G.R*.9,G.R*.18);g.restore();}
    g.drawImage(spr.sh,-sw/2,-G.R*.31,sw,G.R*.5);g.restore();
    /* снаряды */
    for(i=0;i<st.fly.length;i++){p=st.fly[i];var qq=Math.min(1,(st.t-p.t0)/Math.max(.05,p.T)),xy=pos(G,p,qq);
      if(p.k==='a'){g.save();g.translate(xy[0],xy[1]);g.rotate([Math.PI/2,Math.PI,-Math.PI/2,0][p.d]);g.drawImage(spr.ar,-G.R*.45,-G.R*.09,G.R*.9,G.R*.18);g.restore();}
      else if(p.k==='f'){var fs=G.R*(.55+.08*Math.sin(now*20));g.globalAlpha=.5;g.drawImage(spr.fi,xy[0]-DX[p.d]*G.R*.25-fs/2,xy[1]-DY[p.d]*G.R*.25-fs/2,fs*.8,fs*.8);g.globalAlpha=1;g.drawImage(spr.fi,xy[0]-fs/2,xy[1]-fs/2,fs,fs);}
      else{g.save();g.translate(xy[0],xy[1]-Math.sin(qq*Math.PI)*G.R*.5);g.rotate(qq*9);g.drawImage(spr.co,-G.R*.21,-G.R*.25,G.R*.42,G.R*.5);g.restore();}}
    ZABK.parts(g,P,dt);
    if(bub){bub.a-=dt;K.say(g,bub.t,G.cx+G.R*1.2,G.cy-G.R*1.3,G.W,bub.a);if(bub.a<=0)bub=null;}
    g.restore();
    if(st.flash>0){g.fillStyle=dead||st.sc<N.warm?'rgba(220,60,40,'+(st.flash*.35)+')':'rgba(255,236,150,'+(st.flash*.3)+')';g.fillRect(0,0,G.W,G.H);}
    if(live&&!demo&&st.sc<N.warm){g.globalAlpha=.55+.25*Math.sin(now*6);if(zabPC()){zabKeycap(g,G.cx,G.cy-G.R*2.1,'↑',28);zabKeycap(g,G.cx+G.R*2.1,G.cy,'→',28);zabKeycap(g,G.cx,G.cy+G.R*2.1,'↓',28);zabKeycap(g,G.cx-G.R*2.1,G.cy,'←',28);}
      else{K.finger(g,G.cx-G.R*2,G.cy+G.R*.3,0);}g.globalAlpha=1;K.tag(g,G.W,G.H-26,st.msg>0?L('Теперь ты!','Your turn!'):L('Разминка: промах не считается','Warm-up: misses don’t count'));}
    if(demo){K.tag(g,G.W,G.top+14,L('Смотри: жми туда, откуда летит','Watch: tap where it flies from'));K.finger(g,st.fing>0?st.fx:G.cx+DX[st.dir]*G.R*1.6,st.fing>0?st.fy:G.cy+DY[st.dir]*G.R*1.6+10,st.fing>0);}
  });
  ZABK.tap(c,host,function(x,y){tapAt(x,y);});
  zabKeys(host,function(k){var m={ArrowUp:0,w:0,W:0,'ц':0,'Ц':0,ArrowRight:1,d:1,D:1,'в':1,'В':1,ArrowDown:2,s:2,S:2,'ы':2,'Ы':2,ArrowLeft:3,a:3,A:3,'ф':3,'Ф':3};if(k in m){setDir(m[k]);return true;}}); // i18n:ru
  reset();host.dbg={st:function(){return st;},dir:setDir,dead:function(){return dead;},demo:function(){return demo;}};
  ZREC.start(host,o,function(){H=ZREC.hud(host,o);reset();live=true;if(o.first&&!o.again){demo=1;}});
}
/* бот без экрана: k 0..1 — умение (время на поворот щита и вера шишкам) */
function sim(o,k){var r=o&&o.rnd||Math.random,st={n:0,tn:.9,ld:-1,q:[]},sc=0,dir=0,tb=0,rt=.62-.32*k,i,p,fool=(1-k)*.3,er=(1-k)*.02;
  for(i=0;i<4;i++)gen(st,r,o&&o.calm);
  for(;;){st.q.sort(function(a,b){return a.t-b.t;});p=st.q.shift();if(st.q.length<4)gen(st,r,o&&o.calm);
    if(p.k==='c'){if(r()<fool){dir=p.d;tb=p.t;}continue;}
    var need=dir===p.d?0:rt*(.75+.5*r());if(p.t-tb<need||r()<er){if(sc>=N.warm)break;}
    dir=p.d;tb=p.t;sc++;if(sc>600)break;}
  return {score:sc,tier:ZREC.tier('shchit',sc)};}
ZAB_REG({id:'shchit',kind:'lov',n:zabN('Щит Добрыни','Dobrynya’s Shield'),run:run,sim:sim});
})();
