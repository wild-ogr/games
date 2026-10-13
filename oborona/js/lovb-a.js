'use strict';
/* ob2-LOVB · ловкостные «Ковёр-самолёт» (kover) и «Кузня Микулы» (kuzn). Набор — js/lovb-kit.js (LVB). Грузится лениво.
   Флаги: lov-kover, lov-kuzn. Журнал — hobby-analytics/release-i/oborona-boost2/logs/LOVB.md. Без ?. ?? .at(). */
(function(){if(typeof LVB==='undefined')return;var L=LVB.L,pick=LVB.pick;

/* =================== «Ковёр-самолёт» ===================
   Иван летит на ковре к Тридевятому царству: нажал/держишь — ковёр взмывает, отпустил — плавно снижается.
   Облетай дубы, тучи и шеи Горыныча, сороки Соловья (с 15-й вёрсты). Каждая преграда — вёрста; каждые 10 вёрст — новая земля.
   Физика — в долях высоты поля (H=1), step() один и для экрана, и для бота (sim). Ковёр ждёт первого нажатия. */
if(!(typeof OB2!=='undefined'&&OB2.off('lov-kover'))){
var KV={G:2.1,JUMP:-.62,VMAX:1.05,R:.035,X0:.3,TOP:.04,FLOOR:.92,PW:.14};
function kvGap(i,c){return Math.max(.27,.4-.006*i)+(c?.05:0);}
function kvDx(i){return Math.max(.46,.62-.007*i);}
function kvSp(i,c){return Math.min(.64,.34+.011*i)*(c?.85:1);}
function kvObs(st,x){var i=st.made++,g=kvGap(i,st.calm),lo=KV.TOP+.06+g/2,hi=KV.FLOOR-.07-g/2,pv=st.lastY==null?.5:st.lastY,sh=.32;
  var y=lo+(hi-lo)*st.rnd();y=Math.max(pv-sh,Math.min(pv+sh,y));y=Math.max(lo,Math.min(hi,y));st.lastY=y;
  var top=i%5===4?'gory':st.rnd()<.5?'cloud':'branch',bot=st.rnd()<.7?'oak':'tower',bird=i>=15&&st.rnd()<.45;
  st.obs.push({x:x,y:y,g:g,i:i,top:top,bot:bot,pass:false,bird:bird?{ph:st.rnd()*6,a:Math.min(g*.28,.08)}:null});}
function kvInit(st){st.y=.45;st.vy=0;st.go=false;st.made=0;st.obs=[];st.lastY=null;st.flapT=-9;st.zone=0;st.dead=false;st.sc=0;st.tt=0;st.read=0;
  var A=(st.W||360)/(st.H||640);st.A=A;var x=A+.2;for(var k=0;k<4;k++){kvObs(st,x);x+=kvDx(k);}}
function kvHit(st){var R=KV.R;if(st.y+R>KV.FLOOR)return 'floor';for(var j=0;j<st.obs.length;j++){var o=st.obs[j];
    if(KV.X0+R*1.3>o.x-KV.PW/2&&KV.X0-R*1.3<o.x+KV.PW/2&&(st.y-R*.7<o.y-o.g/2||st.y+R*.6>o.y+o.g/2))return st.y<o.y?o.top:o.bot;
    if(o.bird){var by=o.y+Math.sin(st.tt*2.2+o.bird.ph)*o.bird.a,dx=KV.X0-o.x,dy=st.y-by;if(dx*dx+dy*dy<(R+.025)*(R+.025))return 'bird';}}return '';}
function kvStep(st,dt,hold){if(st.dead)return '';st.tt+=dt;
  if(!st.go){st.y=.45+Math.sin(st.tt*3)*.02;if(!hold)return '';st.go=true;}
  if(hold){st.vy=Math.max(KV.JUMP,st.vy-4.2*dt);if(st.vy>0)st.vy*=.86;}else st.vy=Math.min(KV.VMAX*(st.calm?.85:1),st.vy+KV.G*(st.calm?.85:1)*dt);
  st.y+=st.vy*dt;if(st.y-KV.R<KV.TOP){st.y=KV.TOP+KV.R;if(st.vy<0)st.vy=0;}
  var sp=kvSp(st.sc,st.calm);for(var j=0;j<st.obs.length;j++){var o=st.obs[j];o.x-=sp*dt;if(!o.pass&&o.x+KV.PW/2<KV.X0-KV.R){o.pass=true;st.sc++;st.just=1;}}
  while(st.obs.length&&st.obs[0].x<-.4)st.obs.shift();
  var last=st.obs[st.obs.length-1];if(!last||last.x<st.A+.25)kvObs(st,(last?last.x:st.A)+kvDx(st.made));
  var h=kvHit(st);if(h)st.dead=true;return h;}
function kvRevive(st){st.dead=false;st.go=false;st.vy=0;st.y=.45;st.obs=st.obs.filter(function(o){return o.x>KV.X0+.6;});var last=st.obs[st.obs.length-1];if(!last)kvObs(st,KV.X0+.8);}
/* бот: держит ковёр у середины прохода; k — умение */
function kvBot(st,k,rnd,m){var nx=null;for(var j=0;j<st.obs.length;j++){var o=st.obs[j];if(o.x+KV.PW/2>KV.X0-KV.R){nx=o;break;}}
  var ty=nx?nx.y+nx.g*.08:.5;m.err=m.err==null||rnd()<.03?(rnd()-.5)*(1-k)*.5:m.err;ty+=m.err;var lag=.04+(1-k)*.22,py=st.y+st.vy*lag+.5*KV.G*lag*lag;return py>ty;}
function kvSim(o,k){var rnd=o.rnd||Math.random,st={rnd:rnd,calm:false,W:360,H:640},m={},dt=1/60,n=0;kvInit(st);
  while(n<60*150){n++;var h=!st.go||kvBot(st,k,rnd,m);if(rnd()<(1-k)*.02)h=!h;if(kvStep(st,dt,h))break;}return {sc:st.sc,t:n*dt};}
var KV_LAND=[{n:['Дремучий лес','Deep Forest'],s0:'#9fd3f0',s1:'#e8f4e0',h0:'#5f9a52',h1:'#3e7a3a'},{n:['Гиблое болото','Grim Bog'],s0:'#a9c8b8',s1:'#e6efd8',h0:'#6f8f5a',h1:'#4c6a3e'},
  {n:['Дикое поле','Wild Field'],s0:'#f2c98a',s1:'#fbeacc',h0:'#c9a35a',h1:'#9a7a3e'},{n:['Студёные горы','Frosty Peaks'],s0:'#bcd8f2',s1:'#f2f8ff',h0:'#d8e6f2',h1:'#9ab4cc'},
  {n:['Морское царство','Sea Kingdom'],s0:'#8fd0e8',s1:'#e2f6fb',h0:'#3f8fb8',h1:'#2a6a94'},{n:['Огненная земля','Fire Land'],s0:'#f0a070',s1:'#fde0c0',h0:'#b8583a',h1:'#7a3020'},
  {n:['Тридевятое царство','Thrice-Nine Kingdom'],s0:'#b8a8f0',s1:'#f6eaff',h0:'#8a6ac8',h1:'#5a4494'}];
var KV_READ=[['«Пункт первый: ковёр не стирать». Понял.','“Rule one: do not wash the carpet.” Got it.'],['«Пункт второй: над дубами не пролетать». А как же?..','“Rule two: don’t fly over oaks.” Then how?..'],
  ['«При встрече с Горынычем — не дышать». Он и так за всех дышит.','“When meeting Gorynych — hold your breath.” He breathes for everyone.'],['«Ковёр летает на честном слове». Даю честное слово!','“The carpet runs on a word of honour.” I give my word!'],
  ['«Гарантия — триста лет». Мне хватит.','“Warranty: three hundred years.” Good enough.'],['«Сорок не кормить». Да они сами кого хочешь накормят.','“Don’t feed the magpies.” They’d feed on you first.']];
var KV_G={id:'kover',num:21,n:{ru:'Ковёр-самолёт',en:'Flying Carpet'},icon:'hp_iva',who:'hp_iva',nm:L('Иван','Ivan'),icoTxt:'🧭',
  title:L('Ковёр-самолёт','Flying Carpet'),rule:L('Иван летит к Тридевятому царству. Держи палец — ковёр взмывает, отпустил — снижается. Облетай дубы, тучи и Горыныча!','Ivan flies to the Thrice-Nine Kingdom. Hold — the carpet rises, let go — it glides down. Dodge oaks, clouds and Gorynych!'),
  hint:{pc:L('Держи Пробел, ↑ или кнопку мыши — вверх','Hold Space, ↑ or the mouse button to rise'),ph:L('Держи палец на экране — ковёр взмывает','Hold your finger on the screen to rise')},
  unit:L(['вёрста','вёрсты','вёрст'],['verst','versts','versts']),cut:[5,12,20],warm:2,
  say:{start:[L('Поехали! Держу — взлетаю, отпускаю — снижаюсь. Вроде просто…','Off we go! Hold to rise, let go to glide. Seems easy…'),L('Ковёр новый, инструкция толстая. Читать буду на ходу!','New carpet, thick manual. I’ll read it on the way!')],
    warm:[L('Ничего, это разминка — ковёр сам поднялся!','No worries, warm-up — the carpet caught itself!')],
    bad:{floor:L('Ковёр сел на траву. Устал, видать.','The carpet landed in the grass. Must be tired.'),oak:L('Прямо в дуб! Дуб даже не шелохнулся.','Right into an oak! The oak didn’t even flinch.'),tower:L('Зацепил сторожевую вышку. Дозорный ругается.','Clipped a watchtower. The sentry is grumbling.'),
      cloud:L('Влетел в тучу — промок до нитки!','Flew into a cloud — soaked to the bone!'),branch:L('Ветка поймала за кисточку ковра.','A branch caught the carpet’s tassel.'),gory:L('Горыныч чихнул — бахрома дымится!','Gorynych sneezed — the fringe is smoking!'),bird:L('Сорока утащила шапку! И меня заодно.','A magpie stole my hat! And me with it.')}},
  init:function(st){kvInit(st);st.bg=null;st.bgk='';},resize:function(st){st.A=st.W/st.H;st.bgk='';},
  step:function(st,dt,inp){var why=kvStep(st,dt,inp.hold||inp.press);
    if(st.just){st.just=0;st.scChanged=1;st.snd('tap');if(st.sc%10===0){st.zone=Math.floor(st.sc/10);st.snd('whistle');var ln=KV_LAND[st.zone%KV_LAND.length].n;st.pop(L('Новая земля: ','New land: ')+L(ln[0],ln[1])+'!','big');st.msg(L('Ого, внизу — ','Look, below us — ')+L(ln[0],ln[1])+'!','happy');}
      else if(st.sc%4===2){var r=KV_READ[st.read++%KV_READ.length];st.msg(L('Читаю инструкцию: ','Reading the manual: ')+L(r[0],r[1]),'norm');}}
    if(why)st.err=why;},
  forgive:function(st){kvRevive(st);},revive:function(st){kvRevive(st);},
  bot:function(st,inp){st.bm=st.bm||{};var h=!st.go||kvBot(st,.95,Math.random,st.bm);inp.hold=h;return h;},
  finger:function(st){return {x:st.W*.5,y:st.H*.62};},
  label:function(st){return L('Пролетел: ','Flew: ')+LVB.pl(st.sc,KV_G.unit);},
  draw:function(st,c){var W=st.W,H=st.H,z=KV_LAND[st.zone%KV_LAND.length],k=st.W+'x'+st.H+'|'+st.zone;
    if(st.bgk!==k){st.bgk=k;var b=document.createElement('canvas'),d=st.dpr||1;b.width=Math.round(W*d);b.height=Math.round(H*d);var g=b.getContext('2d');g.setTransform(d,0,0,d,0,0);
      var gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,z.s0);gr.addColorStop(1,z.s1);g.fillStyle=gr;g.fillRect(0,0,W,H);
      g.fillStyle='rgba(255,255,255,.7)';for(var i=0;i<6;i++){var cx=(i*173)%W,cy=H*(.1+.07*(i%3));g.beginPath();g.ellipse(cx,cy,H*.08,H*.025,0,0,7);g.ellipse(cx+H*.05,cy-H*.015,H*.05,H*.025,0,0,7);g.fill();}
      st.bg=b;}
    c.drawImage(st.bg,0,0,W,H);
    /* дальние холмы — медленно (паралакс), ближние — быстрее */
    var off=(st.tt*kvSp(st.sc,st.calm)*H);
    function hills(col,yk,amp,sp,per){c.fillStyle=col;c.beginPath();c.moveTo(0,H);var o=(off*sp)%per;for(var x=-per;x<=W+per;x+=per/8){var X=x-o;c.lineTo(X,H*yk-amp*H*(.5+.5*Math.sin((x/per)*Math.PI*2)));}c.lineTo(W,H);c.closePath();c.fill();}
    hills(z.h0,.86,.08,.15,H*.9);hills(z.h1,.95,.05,.4,H*.6);
    c.fillStyle=z.h1;c.fillRect(0,H*KV.FLOOR,W,H*(1-KV.FLOOR));
    for(var j=0;j<st.obs.length;j++)kvDrawObs(st,c,st.obs[j]);
    kvDrawCarpet(st,c);
    if(!st.go&&!st.dead&&!st.demo&&st.live){var tw=Math.min(W-24,320);c.fillStyle='rgba(255,250,240,.92)';LVB.rr(c,(W-tw)/2,H*.7,tw,44,22);c.fill();
      LVB.text(c,st.pc?L('Держи Пробел — взлететь','Hold Space to take off'):L('Держи палец — и полетели!','Hold your finger — and off we go!'),W/2,H*.7+22,17,{ol:false,col:'#3a2410',mw:tw-20});
      if(!st.calm)LVB.finger(c,W/2,H*.7+50,false,st.t);}}};
function kvDrawObs(st,c,o){var H=st.H,x=o.x*H,w=KV.PW*H,t=(o.y-o.g/2)*H,b=(o.y+o.g/2)*H,top0=KV.TOP*H*0,fy=KV.FLOOR*H;
  /* верх */
  if(o.top==='cloud'){var cg=c.createLinearGradient(0,0,0,t);cg.addColorStop(0,'#6a7088');cg.addColorStop(1,'#9aa0b8');c.fillStyle=cg;
    /* грозовая туча — клубами до самого верха */
    c.beginPath();for(var yy=t-w*.62,q=0;yy>-w*.4;yy-=w*.34,q++){var dx=(q%2?.14:-.12)*w;c.moveTo(x+dx-w*.08+w*.36,yy);c.arc(x+dx-w*.08,yy,w*.36,0,7);c.moveTo(x+dx+w*.2+w*.26,yy-w*.12);c.arc(x+dx+w*.2,yy-w*.12,w*.26,0,7);}
    c.strokeStyle='#4a4e66';c.lineWidth=4;c.stroke();c.fill();
    c.beginPath();for(var i=-1;i<=1;i++){c.moveTo(x+i*w*.3+w*.3,t-w*.32);c.arc(x+i*w*.3,t-w*.32,w*.3,0,7);}c.strokeStyle='#4a4e66';c.lineWidth=4;c.stroke();c.fill();
    c.fillStyle='rgba(150,190,255,.8)';for(var r=0;r<3;r++){var ry=t+((st.tt*120+r*23)%(w*.6));c.fillRect(x-w*.25+r*w*.25,ry,2,8);}}
  else if(o.top==='branch'){c.fillStyle='#6a4426';c.fillRect(x-w*.18,0,w*.36,t);c.strokeStyle='#3a2410';c.lineWidth=2;c.strokeRect(x-w*.18,-2,w*.36,t+2);
    c.fillStyle='#4f8a3e';c.beginPath();c.ellipse(x,t-w*.18,w*.62,w*.34,0,0,7);c.fill();c.stroke();c.fillStyle='#6fb055';c.beginPath();c.ellipse(x-w*.15,t-w*.26,w*.3,w*.15,0,0,7);c.fill();}
  else{/* шея Горыныча сверху, голова у прохода */c.fillStyle='#3f8a3a';c.fillRect(x-w*.22,0,w*.44,t-w*.3);c.strokeStyle='#1f4a1e';c.lineWidth=2;c.strokeRect(x-w*.22,-2,w*.44,t-w*.3+2);
    c.fillStyle='#7cc06a';for(var s=w*.2;s<t-w*.4;s+=w*.3){c.beginPath();c.ellipse(x,s,w*.12,w*.07,0,0,7);c.fill();}
    st.put('gory',x,t-w*.35,w*1.3,{rot:Math.PI*.04});
    if(!st.calm){c.fillStyle='rgba(255,140,40,'+(.35+.25*Math.sin(st.tt*9))+')';c.beginPath();c.moveTo(x-w*.2,t-w*.1);c.lineTo(x-w*1.1,t+w*.05);c.lineTo(x-w*.2,t+w*.1);c.closePath();c.fill();}}
  /* низ */
  if(o.bot==='oak'){c.fillStyle='#6a4426';c.fillRect(x-w*.17,b+w*.35,w*.34,fy-b);c.strokeStyle='#3a2410';c.lineWidth=2;c.strokeRect(x-w*.17,b+w*.35,w*.34,fy-b);
    c.fillStyle='#3f7a34';c.beginPath();c.moveTo(x-w*.25+w*.32,b+w*.42);c.arc(x-w*.25,b+w*.42,w*.32,0,7);c.moveTo(x+w*.25+w*.32,b+w*.42);c.arc(x+w*.25,b+w*.42,w*.32,0,7);c.moveTo(x+w*.38,b+w*.3);c.arc(x,b+w*.3,w*.38,0,7);c.lineWidth=4;c.stroke();c.fill();
    c.fillStyle='#5f9e4a';c.beginPath();c.arc(x-w*.1,b+w*.22,w*.18,0,7);c.fill();c.fillStyle='#c8963a';for(var a=0;a<3;a++){c.beginPath();c.arc(x-w*.3+a*w*.3,b+w*.5+(a%2)*w*.1,w*.05,0,7);c.fill();}}
  else{c.fillStyle='#a8743e';c.fillRect(x-w*.36,b+w*.2,w*.72,fy-b);c.strokeStyle='#3a2410';c.lineWidth=2;c.strokeRect(x-w*.36,b+w*.2,w*.72,fy-b);
    c.strokeStyle='rgba(58,36,16,.45)';for(var y=b+w*.36;y<fy;y+=w*.16){c.beginPath();c.moveTo(x-w*.36,y);c.lineTo(x+w*.36,y);c.stroke();}
    c.fillStyle='#b8322e';c.beginPath();c.moveTo(x-w*.46,b+w*.22);c.lineTo(x,b-w*.1);c.lineTo(x+w*.46,b+w*.22);c.closePath();c.fill();c.strokeStyle='#3a2410';c.stroke();}
  if(o.bird){var by=(o.y+Math.sin(st.tt*2.2+o.bird.ph)*o.bird.a)*H;st.put('voron',x,by,H*.06,{fx:-1});}}
function kvDrawCarpet(st,c){var H=st.H,x=KV.X0*H,y=st.y*H,s=H*.07,a=Math.max(-.35,Math.min(.45,st.vy*.6));c.save();c.translate(x,y);c.rotate(st.dead?.7:a);
  var wv=st.calm?0:Math.sin(st.tt*10)*s*.08;
  c.fillStyle='#b8322e';c.beginPath();c.moveTo(-s*1.2,s*.15);c.quadraticCurveTo(-s*.4,s*.15+wv,0,s*.2);c.quadraticCurveTo(s*.6,s*.25-wv,s*1.2,s*.12);c.lineTo(s*1.2,s*.42);c.quadraticCurveTo(s*.6,s*.55-wv,0,s*.5);c.quadraticCurveTo(-s*.4,s*.45+wv,-s*1.2,s*.45);c.closePath();c.fill();
  c.strokeStyle='#3a2410';c.lineWidth=2;c.stroke();c.strokeStyle='#e6b53a';c.lineWidth=2;c.beginPath();c.moveTo(-s*1.05,s*.3);c.quadraticCurveTo(0,s*.36,s*1.05,s*.27);c.stroke();
  c.fillStyle='#e6b53a';for(var i=0;i<5;i++){c.beginPath();c.moveTo(-s*1.2,s*(.17+i*.065));c.lineTo(-s*1.38,s*(.2+i*.065)+wv*.5);c.lineTo(-s*1.2,s*(.21+i*.065));c.fill();}
  st.put('hp_iva',-s*.05,-s*.28,s*1.25);
  c.restore();}
KV_G.sim=kvSim;LVB.reg(KV_G);
}


/* =================== «Кузня Микулы» ===================
   По жёлобу кузни едут подковы, ядра, наконечники и ржавые гвозди. Заказ сверху меняется каждые 8 штук («Пушкарям — ядра!»).
   Хватай только нужное: нажатие по вещи (или по полю/Пробел — ближайшая к клещам). Чужое, ржавое или упущенное нужное — ошибка, 3 ошибки — конец.
   Золотая подкова-счастливица — всегда в дело и ×2. 30 секунд, жёлоб ускоряется. */
if(!(typeof OB2!=='undefined'&&OB2.off('lov-kuzn'))){
var KZ={T:30,ZONE:.74,WIN:.13};
var KZ_K=[{id:'ball',n:['ядра','cannonballs'],to:['Пушкарям','For the gunners']},{id:'shoe',n:['подковы','horseshoes'],to:['Коню Ильи','For Ilya’s horse']},
  {id:'tip',n:['наконечники','arrowheads'],to:['Стрельцам','For the archers']},{id:'axe',n:['топоры','axes'],to:['Плотникам','For the carpenters']}];
function kzSp(st){return Math.min(.6,.22+.014*st.tt)*(st.calm?.8:1);}
function kzInit(st){st.tt=0;st.items=[];st.next=.25;st.want=0;st.cnt=0;st.sc=0;st.ordT=0;}
function kzStep(st,dt,inp){st.tt+=dt;if(st.tt>=KZ.T&&!st.demo){st.over='time';return;}st.ordT+=dt;
  st.next-=dt;if(st.next<=0){var R=st.rnd,r=R(),k,bad=false,gold=false;if(r<.08)gold=true;else if(r<.2)bad=true;k=gold||bad?-1:R()<.5?st.want:Math.floor(R()*KZ_K.length);
    st.items.push({x:-.08,k:k,bad:bad,gold:gold,w:st.want,got:0,wob:R()*6});st.cnt++;
    if(st.cnt%8===0){var w=st.want;while(w===st.want)w=Math.floor(R()*KZ_K.length);st.want=w;st.ordT=0;st.newOrd=1;}
    st.next=Math.max(.17/kzSp(st),Math.max(.3,.62-.011*st.tt)*(.75+.5*R()));}
  var v=kzSp(st);
  /* хватание */
  if(inp.press){var it=null;if(inp.tap&&inp.tap.x!=null){var bd=1e9;for(var j=0;j<st.items.length;j++){var p=st.items[j];if(p.got)continue;var dx=p.x*st.W-inp.tap.x,dy=st.H*.55-inp.tap.y,d=dx*dx+dy*dy;if(d<bd){bd=d;it=p;}}
      if(it&&Math.sqrt(bd)>Math.max(46,st.W*.09))it=null;}
    if(!it)it=kzNear(st);if(it)kzGrab(st,it);}
  for(var i=st.items.length-1;i>=0;i--){var q=st.items[i];if(q.got){q.got+=dt;if(q.got>.45)st.items.splice(i,1);continue;}q.x+=v*dt;
    if(q.x>1.06){st.items.splice(i,1);if(kzGood(st,q)&&q.w===st.want&&!q.gold){st.err='miss';}}}}
function kzGood(st,p){return p.gold||!p.bad&&p.k===st.want;}
function kzNear(st){var b=null,d=9;for(var j=0;j<st.items.length;j++){var p=st.items[j];if(p.got||p.x>1)continue;var e=Math.abs(p.x-KZ.ZONE);if(e<d){d=e;b=p;}}return d<KZ.WIN?b:null;}
function kzGrab(st,p){p.got=.001;p.gx=p.x;if(kzGood(st,p)){st.sc+=p.gold?2:1;st.scChanged=1;st.snd('coin');st.pop(p.gold?L('Счастливица! ×2','Lucky! ×2'):pick([L('В дело!','Into the work!'),L('Годится!','Good one!'),L('Звонко!','Rings true!')],st.rnd),p.gold?'big':'');
    if(st.sc%6===0)st.msg(pick(KZ_G.say.good,st.rnd),'happy');}
  else{p.bad2=1;st.err=p.bad?'rust':'wrong';}}
function kzBot(st,inp,k){var p=kzNear(st);if(p&&kzGood(st,p)&&Math.abs(p.x-KZ.ZONE)<.03+.04*(k||1)){inp.press=true;return true;}return false;}
function kzSim(o,k){var rnd=o.rnd||Math.random,st={rnd:rnd,calm:false,W:360,H:640,snd:function(){},pop:function(){},msg:function(){}},dt=1/30,n=0,err=0;kzInit(st);
  while(st.tt<KZ.T&&err<3){n++;var inp={press:false};var p=kzNear(st);if(p&&Math.abs(p.x-KZ.ZONE)<.04){if(p.see==null)p.see=rnd()<.97-.45*(1-k);if(p.see?kzGood(st,p):!kzGood(st,p)&&rnd()<.3)inp.press=true;}
    kzStep(st,dt,inp);if(st.err){err++;st.err='';}}return {sc:st.sc};}
var KZ_G={id:'kuzn',num:22,n:{ru:'Кузня Микулы',en:'Mikula’s Forge'},icon:'hp_mik',who:'hp_mik',nm:L('Кузнец Микула','Mikula the Smith'),icoTxt:'⚒',
  title:L('Кузня Микулы','Mikula’s Forge'),rule:L('По жёлобу едет кузнечный товар. Хватай только то, что в заказе сверху. Ржавое — Кощеево, не бери!','Smithy goods slide down the chute. Grab only what the order up top says. Rusty stuff is Koschei’s — leave it!'),
  hint:{pc:L('Клик по вещи или Пробел — схватить у клещей','Click an item or press Space to grab at the tongs'),ph:L('Нажми на нужную вещь — схватишь','Tap the right item to grab it')},
  unit:L(['вещь','вещи','вещей'],['item','items','items']),cut:[6,13,21],warm:2,lives:3,
  btn:{t:L('🔧 Хватай!','🔧 Grab!'),k:L('Пробел','Space')},
  say:{start:[L('Заказы горят! Подавай, что прошу, — ржавое не трогай.','Orders are burning! Hand me what I ask — leave the rusty stuff.'),L('Ну-ка, подручный, глаз да глаз! Что в заказе — то и хватай.','Come on, apprentice, eyes sharp! Grab what’s on the order.')],
    good:[L('Вот это подручный! Хоть сейчас в дружину.','What a helper! Ready for the druzhina.'),L('Гудит кузня! Нечисть уже трясётся.','The forge is roaring! The monsters are shaking.'),L('Ровно подаёшь — как молотом бьёшь!','Steady hands — like hammer blows!')],
    warm:[L('Ничего, на разминке и я гвозди путал!','No worries, I mixed up nails on warm-ups too!')],
    bad:{wrong:L('Это не то! Заказ сверху — гляди туда.','Not that one! The order is up top — look there.'),rust:L('Это ж Кощеево, ржавое! Не бери!','That’s Koschei’s rusty junk! Don’t take it!'),miss:L('Упустил! Нужное уехало в сугроб.','Missed it! The right one slid into the snow.'),time:L('Всё, гудок! Смена кончилась.','That’s the horn! Shift’s over.')}},
  init:function(st){kzInit(st);},
  step:function(st,dt,inp){kzStep(st,dt,inp);if(st.newOrd){st.newOrd=0;var o=KZ_K[st.want];st.msg(L(o.to[0]+' — '+o.n[0]+'! Живо!',o.to[1]+' — '+o.n[1]+'! Quick!'),'norm');st.pop(L('Новый заказ!','New order!'),'');}},
  forgive:function(){},revive:function(st){st.lives=3;st.items=st.items.filter(function(p){return p.x<.3;});st.tt=Math.min(st.tt,KZ.T-10);},
  bot:function(st,inp){return kzBot(st,inp,1);},
  finger:function(st){var p=kzNear(st);return p?{x:p.x*st.W,y:st.H*.55}:{x:KZ.ZONE*st.W,y:st.H*.55};},
  label:function(st){return L('Подано без промаха: ','Handed over: ')+LVB.pl(st.sc,KZ_G.unit);},
  info:function(st){return '<span>⏱ '+Math.max(0,Math.ceil(KZ.T-st.tt))+'</span>';},
  draw:function(st,c){var W=st.W,H=st.H,cy=H*.55,ih=Math.min(70,Math.max(48,H*.1));
    /* стена кузни, горн, наковальня */
    var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a2418');g.addColorStop(1,'#1e120c');c.fillStyle=g;c.fillRect(0,0,W,H);
    c.fillStyle='rgba(255,255,255,.05)';for(var y=0;y<H;y+=26)for(var x=((y/26)%2)*30;x<W;x+=60){c.fillRect(x+2,y+2,56,22);}
    var fl=st.calm?.5:.5+.5*Math.sin(st.tt*7);var gl=c.createRadialGradient(W*.15,H*.86,4,W*.15,H*.86,H*.3);gl.addColorStop(0,'rgba(255,170,60,'+(.55+.2*fl)+')');gl.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=gl;c.fillRect(0,H*.55,W*.6,H*.45);
    kzForge(c,W,H,fl);
    /* заказ */
    var o=KZ_K[st.want],bw=Math.min(W-24,380),bx=(W-bw)/2,by=Math.max(H*.07,44),bh=Math.max(56,H*.11),ap=st.ordT<.6&&!st.calm?1+.08*Math.sin(st.ordT*20):1;
    c.save();c.translate(W/2,by+bh/2);c.scale(ap,ap);c.translate(-W/2,-(by+bh/2));
    c.fillStyle='#fdf0cf';LVB.rr(c,bx,by,bw,bh,14);c.fill();c.strokeStyle='#3a2410';c.lineWidth=3;c.stroke();c.fillStyle='#b8322e';LVB.rr(c,bx,by,bw,18,9);c.fill();
    LVB.text(c,L('ЗАКАЗ','ORDER'),W/2,by+9.5,12,{ol:false,col:'#fff6dc'});
    kzDraw(c,{k:st.want},bx+bh*.55,by+bh*.58,bh*.6,st.tt);LVB.text(c,L(o.to[0]+' — '+o.n[0]+'!',o.to[1]+' — '+o.n[1]+'!'),bx+bh*1.05,by+bh*.6,Math.min(22,bw*.06),{al:'left',ol:false,col:'#3a2410',mw:bw-bh*1.2});
    c.restore();
    /* жёлоб с катками */
    var th=ih*1.25;c.fillStyle='#6a4426';c.fillRect(0,cy-th/2,W,th);c.fillStyle='#8a5a30';c.fillRect(0,cy-th/2,W,6);c.fillStyle='#4a2c16';c.fillRect(0,cy+th/2-6,W,6);
    var ro=(st.tt*kzSp(st)*W)%28;c.fillStyle='rgba(0,0,0,.25)';for(var rx=-28+ro;rx<W;rx+=28)c.fillRect(rx,cy-th/2+6,3,th-12);
    /* клещи у зоны */
    var zx=KZ.ZONE*W;c.fillStyle='rgba(255,226,122,.18)';c.fillRect(zx-KZ.WIN*W,cy-th/2,KZ.WIN*W*2,th);c.strokeStyle='rgba(255,226,122,.7)';c.setLineDash([6,5]);c.lineWidth=2;c.strokeRect(zx-KZ.WIN*W,cy-th/2,KZ.WIN*W*2,th);c.setLineDash([]);
    c.strokeStyle='#2a2c34';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(zx-10,cy-th*.6);c.lineTo(zx-4,cy-th*1.5);c.moveTo(zx+10,cy-th*.6);c.lineTo(zx+4,cy-th*1.5);c.stroke();c.lineCap='butt';
    for(var i=0;i<st.items.length;i++){var p=st.items[i],px=(p.got?p.gx:p.x)*W,py=cy+(st.calm?0:Math.sin(st.tt*8+p.wob)*1.5);
      if(p.got){var u=Math.min(1,p.got/.45);py-=u*th*1.4;c.globalAlpha=1-u;}kzDraw(c,p,px,py,ih,st.tt);
      if(p.got&&p.bad2){LVB.text(c,'✗',px,py-ih*.5,ih*.6,{col:'#ff6b5a'});}c.globalAlpha=1;}
    if(st.demo)return;
    if(st.live&&st.tt<4&&st.pc){LVB.text(c,L('Пробел — схватить у клещей','Space — grab at the tongs'),W/2,cy+th*1.1,15,{col:'#fff6dc'});}}};
/* горн (кирпичный, с устьем, углями и колпаком) слева и наковальня на чурбаке справа; fl — мерцание 0..1 */
function kzForge(c,W,H,fl){var u=Math.min(W*.3,H*.21),fx=W*.04,fy=H-u*.95,fw=u*1.05,fh=u*.95,ol='#1e120c';c.lineWidth=2.5;c.strokeStyle=ol;
  /* колпак и труба */
  c.fillStyle='#4a3a32';c.beginPath();c.moveTo(fx-u*.06,fy);c.lineTo(fx+fw+u*.06,fy);c.lineTo(fx+fw*.68,fy-u*.38);c.lineTo(fx+fw*.32,fy-u*.38);c.closePath();c.fill();c.stroke();
  c.fillRect(fx+fw*.36,fy-u*1.2,fw*.28,u*.84);c.strokeRect(fx+fw*.36,fy-u*1.2,fw*.28,u*.84);
  /* кладка */
  c.fillStyle='#8a4a32';c.fillRect(fx,fy,fw,fh);c.strokeRect(fx,fy,fw,fh);c.strokeStyle='rgba(30,18,12,.5)';c.lineWidth=1.2;
  for(var r=0,bh=fh/5;r<5;r++){var yy=fy+r*bh;c.beginPath();c.moveTo(fx,yy);c.lineTo(fx+fw,yy);for(var xx=fx+((r%2)?fw/8:fw/4);xx<fx+fw;xx+=fw/4){c.moveTo(xx,yy);c.lineTo(xx,yy+bh);}c.stroke();}
  /* устье с углями */
  var mx=fx+fw*.5,my=fy+fh*.62,mr=fw*.3;c.fillStyle='#2a140a';c.beginPath();c.moveTo(mx-mr,my+fh*.22);c.lineTo(mx-mr,my);c.arc(mx,my,mr,Math.PI,0);c.lineTo(mx+mr,my+fh*.22);c.closePath();c.fill();c.strokeStyle=ol;c.lineWidth=2.5;c.stroke();
  var cg=c.createRadialGradient(mx,my+fh*.12,2,mx,my+fh*.12,mr*1.1);cg.addColorStop(0,'rgba(255,240,150,'+(.8+.2*fl)+')');cg.addColorStop(.5,'rgba(255,140,40,.9)');cg.addColorStop(1,'rgba(160,40,10,.2)');c.fillStyle=cg;
  c.beginPath();c.moveTo(mx-mr*.85,my+fh*.2);c.quadraticCurveTo(mx,my-mr*(.5+.35*fl),mx+mr*.85,my+fh*.2);c.closePath();c.fill();
  c.fillStyle='#ffd25a';for(var i=0;i<4;i++){c.beginPath();c.arc(mx-mr*.55+i*mr*.37,my+fh*.17,mr*.13,0,7);c.fill();}
  /* наковальня на чурбаке */
  var ax=W*.78,ay=H-u*.5,aw=u*.95;c.fillStyle='#8a5a30';c.fillRect(ax-aw*.22,ay,aw*.44,H-ay);c.strokeRect(ax-aw*.22,ay,aw*.44,H-ay);c.strokeStyle='rgba(30,18,12,.45)';c.beginPath();c.ellipse(ax,ay,aw*.22,u*.05,0,0,7);c.stroke();
  c.fillStyle='#5a5e6a';c.strokeStyle=ol;c.lineWidth=2.5;c.beginPath();var t=ay-u*.32;
  c.moveTo(ax-aw*.62,t);c.quadraticCurveTo(ax-aw*.45,t+u*.1,ax-aw*.28,t+u*.12);c.lineTo(ax-aw*.18,t+u*.14);c.lineTo(ax-aw*.2,ay);c.lineTo(ax+aw*.2,ay);c.lineTo(ax+aw*.18,t+u*.14);c.lineTo(ax+aw*.42,t+u*.12);c.lineTo(ax+aw*.42,t);c.closePath();c.fill();c.stroke();
  c.fillStyle='#8a90a0';c.fillRect(ax-aw*.3,t+1.5,aw*.7,u*.035);
  /* молот, прислонённый к чурбаку */
  c.save();c.translate(ax+aw*.42,H-u*.05);c.rotate(-.35);c.fillStyle='#a8743e';c.fillRect(-u*.03,-u*.48,u*.06,u*.48);c.strokeRect(-u*.03,-u*.48,u*.06,u*.48);c.fillStyle='#4a4e5a';c.fillRect(-u*.12,-u*.56,u*.24,u*.12);c.strokeRect(-u*.12,-u*.56,u*.24,u*.12);c.restore();}
/* вещи кузни: k — вид (0 ядро, 1 подкова, 2 наконечник, 3 топор), bad — ржавый гвоздь, gold — подкова-счастливица */
function kzDraw(c,p,x,y,s,t){c.save();c.translate(x,y);var r=s*.36;c.lineWidth=2.5;c.strokeStyle='#1e1410';
  if(p.bad){c.rotate(.5);c.fillStyle='#8a4a22';c.fillRect(-r*.12,-r,r*.24,r*1.7);c.strokeRect(-r*.12,-r,r*.24,r*1.7);c.fillStyle='#6a3416';c.fillRect(-r*.4,-r*1.1,r*.8,r*.22);c.strokeRect(-r*.4,-r*1.1,r*.8,r*.22);
    c.fillStyle='#c8642a';for(var i=0;i<4;i++){c.beginPath();c.arc((i%2?.1:-.08)*r,-r*.6+i*r*.4,r*.1,0,7);c.fill();}c.restore();return;}
  var k=p.gold?1:p.k;
  if(k===0){var g=c.createRadialGradient(-r*.35,-r*.35,r*.1,0,0,r);g.addColorStop(0,'#8a8e9a');g.addColorStop(1,'#1e2028');c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,7);c.fill();c.stroke();}
  else if(k===1){c.strokeStyle=p.gold?'#7a5a10':'#1e1410';c.lineWidth=r*.62;c.lineCap='round';c.beginPath();c.arc(0,-r*.05,r*.62,Math.PI*.95,Math.PI*.05,false);c.stroke();
    c.strokeStyle=p.gold?'#ffd84a':'#9aa0ac';c.lineWidth=r*.4;c.beginPath();c.arc(0,-r*.05,r*.62,Math.PI*.95,Math.PI*.05,false);c.stroke();c.lineCap='butt';
    c.fillStyle='#1e1410';for(var j=0;j<3;j++){var a=Math.PI*(1.1+j*.4);c.beginPath();c.arc(Math.cos(a)*r*.62,-r*.05+Math.sin(a)*r*.62,r*.06,0,7);c.fill();}
    if(p.gold){c.fillStyle='rgba(255,240,150,'+(.5+.5*Math.sin(t*8))+')';c.font=Math.round(r*.9)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('✦',r*.8,-r*.8);}}
  else if(k===2){c.fillStyle='#c8ccd6';c.beginPath();c.moveTo(r*1.05,0);c.lineTo(-r*.3,-r*.55);c.lineTo(-r*.05,0);c.lineTo(-r*.3,r*.55);c.closePath();c.fill();c.stroke();c.fillStyle='#7a5030';c.fillRect(-r*1,-r*.12,r*.75,r*.24);c.strokeRect(-r*1,-r*.12,r*.75,r*.24);}
  else{c.fillStyle='#8a5a30';c.fillRect(-r*.12,-r*1,r*.24,r*2);c.strokeRect(-r*.12,-r*1,r*.24,r*2);c.fillStyle='#b8bcc8';c.beginPath();c.moveTo(r*.1,-r*.95);c.quadraticCurveTo(r*1.1,-r*.9,r*.95,-r*.1);c.lineTo(r*.1,-r*.35);c.closePath();c.fill();c.stroke();}
  c.restore();}
KZ_G.sim=kzSim;LVB.reg(KZ_G);
}

})();
