'use strict';
/* ob2-LOVB · ловкостные «Змеёныш» (zmey) и «Яблочко» (yabl). Набор — js/lovb-kit.js (LVB). Грузится лениво.
   Флаги: lov-zmey, lov-yabl. Журнал — hobby-analytics/release-i/oborona-boost2/logs/LOVB.md. Без ?. ?? .at(). */
(function(){if(typeof LVB==='undefined')return;var L=LVB.L,pick=LVB.pick;

/* =================== «Змеёныш» ===================
   Маленький Горыныч ползёт за молодильными яблоками, хвост растёт. Нельзя врезаться в хвост и в частокол.
   Три головы спорят, куда ползти. Гнилое яблоко — икает огоньком и теряет 2 звена (−1). Рекорд — съеденные яблоки.
   Управление: свайп или нажатие с той стороны, куда повернуть; ПК — стрелки/WASD. Поворот «назад» не принимается. */
if(!(typeof OB2!=='undefined'&&OB2.off('lov-zmey'))){
var ZM_D={U:[0,-1],D:[0,1],L:[-1,0],R:[1,0]},ZM_OPP={U:'D',D:'U',L:'R',R:'L'};
function zmGrid(st){if(st.W>st.H*1.15){st.gw=15;st.gh=9;}else{st.gw=9;st.gh=Math.max(10,Math.min(13,Math.round(9*st.H/st.W)));}}
function zmInit(st){zmGrid(st);st.tt=0;st.sc=0;st.acc=0;st.q=[];st.hic=0;st.say=0;zmPlace(st,3);st.apples=[];zmApple(st,false);st.rot=null;}
function zmPlace(st,n){var cx=Math.floor(st.gw/2)-1,cy=Math.floor(st.gh/2);st.body=[];for(var i=0;i<n;i++)st.body.push({x:cx-i,y:cy});st.dir='R';st.q=[];st.grow=0;st.wait=true;}
function zmFree(st,x,y){for(var i=0;i<st.body.length;i++)if(st.body[i].x===x&&st.body[i].y===y)return false;for(var j=0;j<st.apples.length;j++)if(st.apples[j].x===x&&st.apples[j].y===y)return false;return true;}
function zmApple(st,rot){for(var k=0;k<200;k++){var x=Math.floor(st.rnd()*st.gw),y=Math.floor(st.rnd()*st.gh);if(zmFree(st,x,y)&&(Math.abs(x-st.body[0].x)+Math.abs(y-st.body[0].y)>2)){st.apples.push({x:x,y:y,rot:rot,t:0});return;}}}
function zmSpd(st){return Math.min(8.5,4.2+.17*st.sc)*(st.calm?.75:1);}
function zmTurn(st,d){var last=st.q.length?st.q[st.q.length-1]:st.dir;if(d===last||d===ZM_OPP[last])return;if(st.q.length<2)st.q.push(d);st.wait=false;}
function zmStep(st,dt,inp){st.tt+=dt;st.hic=Math.max(0,st.hic-dt);
  if(inp.dir)zmTurn(st,inp.dir);
  else if(inp.press&&inp.tap&&inp.tap.x!=null){var g=zmGeo(st),h=st.body[0],hx=g.x0+(h.x+.5)*g.c,hy=g.y0+(h.y+.5)*g.c,cur=st.q.length?st.q[st.q.length-1]:st.dir;
    if(cur==='L'||cur==='R')zmTurn(st,inp.tap.y<hy?'U':'D');else zmTurn(st,inp.tap.x<hx?'L':'R');}
  else if(inp.press&&st.wait)st.wait=false;
  for(var a=st.apples.length-1;a>=0;a--){var ap=st.apples[a];ap.t+=dt;if(ap.rot&&ap.t>6)st.apples.splice(a,1);}
  if(st.wait)return;
  st.acc+=dt*zmSpd(st);while(st.acc>=1){st.acc-=1;if(zmMove(st))return;}}
function zmMove(st){if(st.q.length)st.dir=st.q.shift();var d=ZM_D[st.dir],h=st.body[0],nx=h.x+d[0],ny=h.y+d[1];
  if(nx<0||ny<0||nx>=st.gw||ny>=st.gh){st.err='wall';return true;}
  for(var i=0;i<st.body.length-(st.grow?0:1);i++)if(st.body[i].x===nx&&st.body[i].y===ny){st.err='tail';return true;}
  st.body.unshift({x:nx,y:ny});if(st.grow)st.grow--;else st.body.pop();
  for(var a=0;a<st.apples.length;a++){var ap=st.apples[a];if(ap.x===nx&&ap.y===ny){st.apples.splice(a,1);
      if(ap.rot){st.hic=.8;st.sc=Math.max(0,st.sc-1);st.scChanged=1;for(var k=0;k<2&&st.body.length>3;k++)st.body.pop();st.pop(L('Ик! −1','Hic! −1'),'bad');st.msg(L('Гнилое! Икает огоньком… Средняя голова: «Я ж говорила — не это!»','Rotten! Hiccupping fire… Middle head: “I told you — not that one!”'),'sad');}
      else{st.sc++;st.scChanged=1;st.grow+=1;st.snd('coin');if(st.sc%5===0)st.pop(pick([L('Растёт!','Growing!'),L('Хрум!','Crunch!'),L('Молодильное!','Rejuvenating!')],st.rnd),'');zmApple(st,false);if(st.sc>=4&&st.rnd()<.3&&st.apples.length<3)zmApple(st,true);}
      break;}}
  st.say-=1;if(st.say<=0&&st.q.length===0&&st.rnd()<.04){st.say=40;st.msg(pick(ZM_G.say.argue,st.rnd),'norm');}
  return false;}
function zmGeo(st){var c=Math.floor(Math.min((st.W-16)/st.gw,(st.H-16)/st.gh));return {c:c,x0:(st.W-c*st.gw)/2,y0:(st.H-c*st.gh)/2};}
/* бот: к ближайшему хорошему яблоку, избегая хвоста и стен (жадно на шаг вперёд + проверка тупика) */
function zmSafe(st,x,y){if(x<0||y<0||x>=st.gw||y>=st.gh)return false;for(var i=0;i<st.body.length-1;i++)if(st.body[i].x===x&&st.body[i].y===y)return false;return true;}
function zmRoom(st,x,y,lim){var seen={},q=[[x,y]],n=0;seen[x+','+y]=1;while(q.length&&n<lim){var p=q.shift();n++;for(var k in ZM_D){var a=p[0]+ZM_D[k][0],b=p[1]+ZM_D[k][1];if(!seen[a+','+b]&&zmSafe(st,a,b)){seen[a+','+b]=1;q.push([a,b]);}}}return n;}
function zmBotDir(st,k){var h=st.body[0],t=null,bd=1e9;for(var a=0;a<st.apples.length;a++){var ap=st.apples[a];if(ap.rot)continue;var d=Math.abs(ap.x-h.x)+Math.abs(ap.y-h.y);if(d<bd){bd=d;t=ap;}}
  var best=null,bs=-1e9,cur=st.q.length?st.q[st.q.length-1]:st.dir;for(var dd in ZM_D){if(dd===ZM_OPP[cur])continue;var nx=h.x+ZM_D[dd][0],ny=h.y+ZM_D[dd][1];if(!zmSafe(st,nx,ny))continue;
    var sc=-(t?Math.abs(t.x-nx)+Math.abs(t.y-ny):0)+Math.min(30,zmRoom(st,nx,ny,st.body.length+8))*.6;for(var r=0;r<st.apples.length;r++)if(st.apples[r].rot&&st.apples[r].x===nx&&st.apples[r].y===ny)sc-=5;if(dd===cur)sc+=.3;if(k<1&&st.rnd()<(1-k)*.35)sc+=st.rnd()*14;if(sc>bs){bs=sc;best=dd;}}
  return best;}
function zmSim(o,k){var rnd=o.rnd||Math.random,st={rnd:rnd,calm:false,W:360,H:460,snd:function(){},pop:function(){},msg:function(){}},dt=1/30,n=0;zmInit(st);st.wait=false;
  while(n<30*120){n++;var inp={};if(st.acc+dt*zmSpd(st)>=1&&rnd()>(1-k)*.22){var d=zmBotDir(st,k);if(d&&d!==st.dir)inp.dir=d;}zmStep(st,dt,inp);if(st.err)break;}return {sc:st.sc};}
var ZM_G={id:'zmey',num:19,n:{ru:'Змеёныш',en:'Little Dragon'},icon:'gory',who:'gory',nm:L('Змеёныш Горыныч','Little Gorynych'),icoTxt:'🍎',dirs:true,swipe:true,
  title:L('Змеёныш','Little Dragon'),rule:L('Маленький Горыныч ползёт за молодильными яблоками — хвост растёт. Не врежься в хвост и в частокол! Гнилые не ешь.','Little Gorynych crawls after rejuvenating apples — his tail grows. Don’t hit the tail or the fence! Skip the rotten ones.'),
  hint:{pc:L('Стрелки или WASD — повернуть','Arrows or WASD to turn'),ph:L('Проведи пальцем или нажми с той стороны, куда повернуть','Swipe, or tap on the side you want to turn to')},
  unit:L(['яблоко','яблока','яблок'],['apple','apples','apples']),cut:[8,16,26],warm:2,
  say:{start:[L('Левая голова: «Налево!» Правая: «Направо!» Средняя: «Где яблоки?!»','Left head: “Left!” Right head: “Right!” Middle head: “Where are the apples?!”'),L('Мы растём! Нам нужны молодильные яблоки. Много яблок.','We’re growing! We need rejuvenating apples. Lots of apples.')],
    argue:[L('«Налево!» — «Нет, направо!» — «Обе неправы!»','“Left!” — “No, right!” — “You’re both wrong!”'),L('Левая голова: «Я первая увидела яблоко!»','Left head: “I saw the apple first!”'),L('Средняя голова: «Хвост, не отставай!»','Middle head: “Tail, keep up!”'),L('Правая голова: «Мне никогда не достаётся…»','Right head: “I never get any…”')],
    warm:[L('Ничего, это разминка — головы помирились!','No worries, warm-up — the heads made peace!')],
    bad:{wall:L('В частокол! Три шишки на три головы.','Into the fence! Three bumps on three heads.'),tail:L('Укусил себя за хвост! Головы спорят, чья вина.','Bit his own tail! The heads argue whose fault it is.')}},
  init:function(st){zmInit(st);},resize:function(st){if(!st.live&&!st.demo)zmInit(st);},
  step:function(st,dt,inp){zmStep(st,dt,inp);},
  forgive:function(st){var n=Math.min(st.body.length,6);zmPlace(st,Math.max(3,n));st.apples=st.apples.filter(function(a){return zmFree({body:st.body,apples:[]},a.x,a.y);});if(!st.apples.length)zmApple(st,false);},
  revive:function(st){ZM_G.forgive(st);},
  bot:function(st,inp){if(st.wait){inp.press=true;return true;}var fresh=st.acc+1/60*zmSpd(st)>=1;if(!fresh)return !!st.bf&&(st.bf-=1)>0;var d=zmBotDir(st,1);if(d&&d!==st.dir&&!st.q.length){inp.dir=d;st.bfDir=d;st.bf=8;return true;}return !!st.bf&&(st.bf-=1)>0;},
  finger:function(st){var g=zmGeo(st),h=st.body[0],d=st.bfDir||'U',o=ZM_D[d];return {x:g.x0+(h.x+.5+o[0]*1.6)*g.c,y:g.y0+(h.y+.5+o[1]*1.6)*g.c};},
  label:function(st){return L('Съел: ','Ate: ')+LVB.pl(st.sc,ZM_G.unit);},
  draw:function(st,c){var W=st.W,H=st.H,g=zmGeo(st),C=g.c;
    c.fillStyle='#6a8a3e';c.fillRect(0,0,W,H);
    for(var y=0;y<st.gh;y++)for(var x=0;x<st.gw;x++){c.fillStyle=(x+y)%2?'#a8cf72':'#b6d97f';c.fillRect(g.x0+x*C,g.y0+y*C,C,C);}
    /* частокол по краю */
    c.fillStyle='#8a5a30';c.strokeStyle='#3a2410';c.lineWidth=1.5;var pw=Math.max(5,C*.22);
    function stake(px,py){c.beginPath();c.moveTo(px-pw/2,py+pw*1.2);c.lineTo(px-pw/2,py-pw*.4);c.lineTo(px,py-pw*1.1);c.lineTo(px+pw/2,py-pw*.4);c.lineTo(px+pw/2,py+pw*1.2);c.closePath();c.fill();c.stroke();}
    for(var sx=g.x0;sx<=g.x0+C*st.gw;sx+=pw*1.15){stake(sx,g.y0-pw*.9);stake(sx,g.y0+C*st.gh+pw*.3);}
    for(var sy=g.y0;sy<=g.y0+C*st.gh;sy+=pw*1.15){stake(g.x0-pw*.6,sy);stake(g.x0+C*st.gw+pw*.6,sy);}
    /* яблоки */
    for(var a=0;a<st.apples.length;a++){var ap=st.apples[a],ax=g.x0+(ap.x+.5)*C,ay=g.y0+(ap.y+.5)*C,r=C*.36*(st.calm?1:1+.05*Math.sin(st.tt*5+a));
      c.fillStyle=ap.rot?'#7a6a3a':'#e8382a';c.beginPath();c.arc(ax,ay+r*.08,r,0,7);c.fill();c.strokeStyle='#3a2410';c.lineWidth=1.5;c.stroke();
      if(!ap.rot){c.fillStyle='rgba(255,230,120,.8)';c.beginPath();c.arc(ax-r*.35,ay-r*.3,r*.22,0,7);c.fill();}else{c.fillStyle='#4a3a1a';c.beginPath();c.arc(ax+r*.25,ay+r*.1,r*.18,0,7);c.fill();c.fillStyle='#f0e0b0';c.fillRect(ax+r*.2,ay-r*.05,r*.4,r*.12);}
      c.strokeStyle='#5a3a1a';c.lineWidth=2;c.beginPath();c.moveTo(ax,ay-r*.8);c.lineTo(ax+r*.1,ay-r*1.15);c.stroke();c.fillStyle='#4f9a3a';c.beginPath();c.ellipse(ax+r*.35,ay-r*.95,r*.3,r*.14,-.5,0,7);c.fill();}
    /* тело */
    var b=st.body,fr=st.acc;for(var i=b.length-1;i>=0;i--){var p=b[i],px=g.x0+(p.x+.5)*C,py=g.y0+(p.y+.5)*C,rr=C*(.42-.12*i/Math.max(1,b.length));
      c.fillStyle=i%2?'#3f8a3a':'#4fa04a';c.beginPath();c.arc(px,py,rr,0,7);c.fill();c.strokeStyle='#1f4a1e';c.lineWidth=1.5;c.stroke();
      if(i>0){c.fillStyle='#e6b53a';c.beginPath();c.moveTo(px-rr*.25,py-rr*.6);c.lineTo(px,py-rr*1.05);c.lineTo(px+rr*.25,py-rr*.6);c.closePath();c.fill();}}
    /* три головы */
    var h=b[0],hx=g.x0+(h.x+.5)*C,hy=g.y0+(h.y+.5)*C,d=ZM_D[st.dir],ang=Math.atan2(d[1],d[0]);c.save();c.translate(hx,hy);c.rotate(ang);
    for(var k=-1;k<=1;k++){var nx=C*.35,ny=k*C*.3,wob=st.calm?0:Math.sin(st.tt*6+k*2)*C*.04;c.strokeStyle='#3f8a3a';c.lineWidth=C*.16;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(nx,ny+wob);c.stroke();c.lineCap='butt';
      c.fillStyle='#5fb05a';c.beginPath();c.ellipse(nx+C*.08,ny+wob,C*.2,C*.15,0,0,7);c.fill();c.strokeStyle='#1f4a1e';c.lineWidth=1.5;c.stroke();
      c.fillStyle='#fff';c.beginPath();c.arc(nx+C*.12,ny+wob-C*.05,C*.055,0,7);c.fill();c.fillStyle='#222';c.beginPath();c.arc(nx+C*.14,ny+wob-C*.05,C*.028,0,7);c.fill();
      if(st.hic>0&&k===0){c.fillStyle='rgba(255,140,40,.9)';c.beginPath();c.arc(nx+C*.4,ny,C*.12*(1+st.hic),0,7);c.fill();}}
    c.restore();
    if(st.wait&&st.live&&!st.demo){var tw=Math.min(W-24,330);c.fillStyle='rgba(255,250,240,.92)';LVB.rr(c,(W-tw)/2,H*.78,tw,44,22);c.fill();
      LVB.text(c,st.pc?L('Стрелка — поползли!','Press an arrow to go!'):L('Проведи пальцем — поползли!','Swipe to start crawling!'),W/2,H*.78+22,16,{ol:false,col:'#3a2410',mw:tw-16});}}};
ZM_G.sim=zmSim;LVB.reg(ZM_G);
}

/* =================== «Яблочко» ===================
   Стрелец натягивает лук: держи — тетива тянется, отпусти, когда стрелка в зелёной зоне. Мишень — яблоко на шапке Лешего.
   Каждое попадание — Леший отходит дальше, зона уже; ветер (флажок) сдвигает зону. Перетянул или отпустил не там — промах (после разминки — конец).
   Рекорд — попадания подряд. Лешего не задеваем никогда: промах — в дупло (сова) или в пенёк. */
if(!(typeof OB2!=='undefined'&&OB2.off('lov-yabl'))){
function ybRound(st){var n=st.sc,R=st.rnd;st.dist=Math.min(1,.25+.06*n);st.wind=n<2?0:Math.round((R()*2-1)*Math.min(3,1+n/4));
  var w=Math.max(.07,.2-.011*n)*(st.calm?1.35:1),ctr=.45+.25*st.dist+st.wind*.035;st.zone=[Math.max(.12,ctr-w/2),Math.min(.97,ctr+w/2)];
  st.pw=0;st.ph='aim';st.arr=null;st.res='';st.rt=0;st.drawT=0;}
function ybInit(st){st.tt=0;st.sc=0;ybRound(st);st.owl=0;}
function ybStep(st,dt,inp){st.tt+=dt;st.owl=Math.max(0,st.owl-dt);
  if(st.ph==='aim'){if(inp.hold){st.ph='draw';st.drawT=0;}}
  else if(st.ph==='draw'){st.drawT+=dt;var sp=(st.calm?.55:.75)+.02*Math.min(10,st.sc);st.pw=Math.min(1.12,st.pw+sp*dt*(.6+.8*st.pw));
    if(st.pw>=1.12){ybShoot(st,'over');return;}
    if(!inp.hold){ybShoot(st,st.pw>=st.zone[0]&&st.pw<=st.zone[1]?'hit':st.pw<st.zone[0]?'short':'long');}}
  else if(st.ph==='fly'){st.rt+=dt;st.arr.u=Math.min(1,st.rt/.55);if(st.rt>=.55){st.ph='res';st.rt=0;ybResult(st);}}
  else if(st.ph==='res'){st.rt+=dt;if(st.rt>.9){if(st.res==='hit')ybRound(st);else{st.err=st.res;}}}}
function ybShoot(st,r){st.res=r;st.ph='fly';st.rt=0;st.arr={u:0,r:r};st.snd('arrow');}
function ybResult(st){if(st.res==='hit'){st.sc++;st.scChanged=1;st.snd('coin');st.pop(pick([L('В яблочко!','Bullseye!'),L('Точно!','Spot on!'),L('Ай да стрелец!','What a shot!')],st.rnd),'');if(st.sc%3===0)st.msg(pick(YB_G.say.good,st.rnd),'happy');}
  else if(st.res==='long')st.owl=1.6;}
function ybBot(st,inp,k){if(st.ph==='aim'){inp.hold=true;st.bt=(st.zone[0]+st.zone[1])/2+(st.rnd()-.5)*(1-k)*.3;return true;}if(st.ph==='draw'){if(st.pw<st.bt){inp.hold=true;return true;}return false;}return false;}
function ybSim(o,k){var rnd=o.rnd||Math.random,st={rnd:rnd,calm:false,snd:function(){},pop:function(){},msg:function(){}},dt=1/60,n=0;ybInit(st);
  while(n<60*200){n++;var inp={};ybBot(st,inp,k);ybStep(st,dt,inp);if(st.err)break;}return {sc:st.sc};}
var YB_G={id:'yabl',num:20,n:{ru:'Яблочко',en:'Apple Shot'},icon:'lesh',who:'tour_nb3',nm:L('Атаманша Василиса','Atamansha Vasilisa'),icoTxt:'🎯',
  title:L('Яблочко','Apple Shot'),rule:L('Держи — тетива натягивается. Отпусти, когда стрелка в зелёной зоне, — и стрела собьёт яблоко с шапки Лешего. Ветер сдвигает зону!','Hold to draw the bow. Release when the needle is in the green zone to knock the apple off Leshy’s cap. Wind shifts the zone!'),
  hint:{pc:L('Держи Пробел — натянуть, отпусти — выстрел','Hold Space to draw, release to shoot'),ph:L('Держи палец — натянуть, отпусти — выстрел','Hold to draw, release to shoot')},
  unit:L(['яблоко','яблока','яблок'],['apple','apples','apples']),cut:[5,10,16],warm:2,
  say:{start:[L('Лешему не впервой. Он даже уши почти не прижимает.','Leshy has done this before. He barely flattens his ears.'),L('Тетиву тяни плавно, отпускай в зелёной. Лешего не пугай!','Draw smoothly, release in the green. Don’t scare Leshy!')],
    good:[L('Леший: «Ещё! Только не в нос!»','Leshy: “Again! Just not in the nose!”'),L('Вот это глаз! Хоть в стрельцы на заставу.','What an eye! Join the archers at the outpost.'),L('Яблок у Лешего — полный короб. Стреляй!','Leshy has a whole basket of apples. Shoot!')],
    warm:[L('Ничего, это разминка — Леший подаст стрелу!','No worries, warm-up — Leshy hands the arrow back!')],
    bad:{short:L('Недотянул — стрела в пенёк.','Too weak — the arrow hit a stump.'),long:L('Перелёт! Стрела в дупло — оттуда вылетела сова.','Overshot! Into a hollow — an owl flew out.'),over:L('Перетянул — тетива дрогнула, стрела упала.','Overdrawn — the string trembled and the arrow dropped.')}},
  init:function(st){ybInit(st);},step:function(st,dt,inp){ybStep(st,dt,inp);},
  forgive:function(st){ybRound(st);},revive:function(st){ybRound(st);},
  bot:function(st,inp){return ybBot(st,inp,1);},finger:function(st){return {x:st.W*.5,y:st.H*.86};},
  label:function(st){return L('Сбито: ','Shot down: ')+LVB.pl(st.sc,YB_G.unit);},
  draw:function(st,c){var W=st.W,H=st.H,gy=H*.66;
    var bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#a8d8f0');bg.addColorStop(.7,'#e8f4d8');c.fillStyle=bg;c.fillRect(0,0,W,H);
    c.fillStyle='#4f8a3e';c.beginPath();c.moveTo(0,gy);for(var x=0;x<=W;x+=W/5)c.lineTo(x,gy-H*.05*Math.abs(Math.sin(x*.02)));c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.fill();c.fillStyle='#6fae55';c.fillRect(0,gy,W,H-gy);
    c.fillStyle='#fff3b0';c.beginPath();c.arc(W*.86,H*.1,Math.min(W,H)*.06,0,7);c.fill();c.fillStyle='rgba(255,255,255,.85)';for(var q=0;q<4;q++){var qx=((q*157+st.tt*(6+q*3))%(W+120))-60,qy=H*(.18+.08*(q%2));c.beginPath();c.ellipse(qx,qy,H*.07,H*.022,0,0,7);c.ellipse(qx+H*.04,qy-H*.014,H*.045,H*.022,0,0,7);c.fill();}
    /* лес позади и дупло */
    for(var t=0;t<5;t++){var tx=W*(.1+t*.22),ts=H*.18;c.fillStyle='#5a3a22';c.fillRect(tx-ts*.06,gy-ts*.9,ts*.12,ts*.9);c.fillStyle=t%2?'#3f7a34':'#4f8a3e';c.beginPath();c.arc(tx,gy-ts,ts*.38,0,7);c.fill();}
    /* Леший с яблоком: чем дальше — тем меньше и ближе к горизонту */
    var ls=Math.min(W*.42,H*(.26-.12*st.dist)),lx=W*(.56+.3*st.dist),ly=gy+(1-st.dist)*H*.07,nerv=st.ph==='draw'&&!st.calm?Math.sin(st.tt*30)*.05:0;
    st.put('lesh',lx,ly-ls*.3,ls,{rot:nerv});var ax=lx,ay=ly-ls*.86;
    if(!(st.res==='hit'&&st.ph==='res')){c.fillStyle='#e8382a';c.beginPath();c.arc(ax,ay,ls*.09,0,7);c.fill();c.strokeStyle='#3a2410';c.lineWidth=1.5;c.stroke();c.strokeStyle='#5a3a1a';c.beginPath();c.moveTo(ax,ay-ls*.09);c.lineTo(ax+2,ay-ls*.14);c.stroke();}
    else{var u=Math.min(1,st.rt/.9);c.fillStyle='#e8382a';c.beginPath();c.arc(ax+u*W*.12,ay-Math.sin(u*Math.PI)*H*.06+u*H*.08,ls*.09,0,7);c.fill();}
    if(st.ph==='draw'&&!st.calm){c.fillStyle='#8ac8f0';c.beginPath();c.arc(lx+ls*.25,ly-ls*.75,3,0,7);c.fill();}
    /* флажок ветра */
    var fx=W*.5,fy=H*.08;c.strokeStyle='#5a3a1a';c.lineWidth=3;c.beginPath();c.moveTo(fx,fy);c.lineTo(fx,fy+H*.12);c.stroke();var wl=st.wind*W*.03,fl=st.calm?0:Math.sin(st.tt*8)*3;
    c.fillStyle='#b8322e';c.beginPath();c.moveTo(fx,fy);c.quadraticCurveTo(fx+wl*.5,fy+5+fl,fx+(wl||4),fy+9);c.lineTo(fx,fy+18);c.closePath();c.fill();
    LVB.text(c,st.wind?L('ветер ','wind ')+(st.wind>0?'→ ':'← ')+Math.abs(st.wind):L('без ветра','no wind'),fx,fy+H*.12+12,13,{col:'#3a2410',ol:false});
    /* сова */
    if(st.owl>0){var ou=1-st.owl/1.6;LVB.text(c,'🦉',W*.85-ou*W*.5,H*.3-ou*H*.2,30,{ol:false});}
    /* стрелец слева внизу и лук */
    var sx=W*.14,sy=H*.83,ss=Math.min(H*.2,W*.34);st.put('tour_nb3',sx,sy-ss*.25,ss);
    var pw=Math.min(1,st.ph==='draw'?st.pw:0);c.strokeStyle='#6a3a1a';c.lineWidth=4;c.beginPath();c.arc(sx+ss*.32,sy-ss*.42,ss*.32,-1.2,1.2);c.stroke();
    c.strokeStyle='#eee';c.lineWidth=1.5;var bxp=sx+ss*.32+Math.cos(1.2)*ss*.32,by0=sy-ss*.42-Math.sin(1.2)*ss*.32,by1=sy-ss*.42+Math.sin(1.2)*ss*.32,px=bxp-pw*ss*.3;c.beginPath();c.moveTo(bxp,by0);c.lineTo(px,sy-ss*.42);c.lineTo(bxp,by1);c.stroke();
    /* летящая стрела */
    var ex=ax,ey=ay;if(st.arr){var r=st.arr.r;if(r==='short'){ex=W*.45;ey=gy+4;}else if(r==='long'){ex=W*.88;ey=H*.3;}else if(r==='over'){ex=px+30;ey=gy+10;}
      var u2=st.arr.u,ax0=px,ay0=sy-ss*.42,cx=ax0+(ex-ax0)*u2,cy=ay0+(ey-ay0)*u2-Math.sin(u2*Math.PI)*H*.08*(r==='over'?0:1),an=Math.atan2(ey-ay0-Math.cos(u2*Math.PI)*H*.08*Math.PI*(r==='over'?0:1),ex-ax0);
      c.save();c.translate(cx,cy);c.rotate(an);c.strokeStyle='#5a3a1a';c.lineWidth=3;c.beginPath();c.moveTo(-26,0);c.lineTo(8,0);c.stroke();c.fillStyle='#c8ccd6';c.beginPath();c.moveTo(14,0);c.lineTo(6,-5);c.lineTo(6,5);c.closePath();c.fill();c.fillStyle='#e6b53a';c.fillRect(-28,-4,7,8);c.restore();}
    else if(st.ph!=='res'){c.save();c.translate(px,sy-ss*.42);c.strokeStyle='#5a3a1a';c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.lineTo(34,0);c.stroke();c.fillStyle='#c8ccd6';c.beginPath();c.moveTo(40,0);c.lineTo(32,-5);c.lineTo(32,5);c.closePath();c.fill();c.restore();}
    /* шкала натяжения с зелёной зоной */
    var mw=Math.min(W-40,420),mx=(W-mw)/2,my=H*.91,mh=22;c.fillStyle='#3a2410';LVB.rr(c,mx-3,my-3,mw+6,mh+6,13);c.fill();c.fillStyle='#fdf0cf';LVB.rr(c,mx,my,mw,mh,10);c.fill();
    c.fillStyle='#e8a090';c.fillRect(mx+mw*(1/1.12),my,mw*(1-1/1.12),mh);
    c.fillStyle='#5fc04a';c.fillRect(mx+mw*st.zone[0]/1.12,my,mw*(st.zone[1]-st.zone[0])/1.12,mh);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(mx+mw*st.zone[0]/1.12,my,mw*(st.zone[1]-st.zone[0])/1.12,mh*.4);
    var nx=mx+mw*Math.min(1.12,st.pw)/1.12;c.fillStyle='#b8322e';c.beginPath();c.moveTo(nx,my-2);c.lineTo(nx-7,my-12);c.lineTo(nx+7,my-12);c.closePath();c.fill();c.fillRect(nx-1.5,my,3,mh);
    if(st.ph==='aim'&&st.live&&!st.demo)LVB.text(c,st.pc?L('Держи Пробел — натянуть','Hold Space to draw'):L('Держи палец — натянуть','Hold to draw'),W/2,my-24,16,{col:'#fff6dc'});}};
YB_G.sim=ybSim;LVB.reg(YB_G);
}

})();
