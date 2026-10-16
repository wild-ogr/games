/* bb2-lov-uvern.js — «Увернись!» (ловкостная на рекорд, поток LOVA; id uvern — её же зовёт разминка после поражения потока ZAB).
   Ристалище на движке боя (js/bb2-lov-rist.js): богатырь без оружия в кругу частокола, води пальцем — уходи от нечисти. Каждые 5 с её больше и она шустрее.
   Задели — конец. Счёт — секунды. Хитрость для мастеров: нечисть, столкнувшись лбами, на секунду видит звёзды (мимо оглушённых можно пройти). */
(function(){
var K=LOVK,TAU=Math.PI*2,R=LOVRIST;
/* числа игры (не экономика) */
var N={wave:5,life:13,sp:{slow:46,mid:70,fast:92,fly:84},dash:205,grow:.03,growMax:1.5,gap0:1.5,gapK:.085,gapMin:.3,evEvery:13,warm:4};
function mult(n){return Math.min(N.growMax,.86+N.grow*n);}
function gapOf(n,calm){return Math.max(N.gapMin,N.gap0-N.gapK*n)*(calm?1.25:1);}
var VOE=[['Меч дома забыл? Ну бегай, бегай!','Left your sword at home? Run, then!'],['Не в толпу — вбок, вбок!','Not into the crowd — sideways!'],['Лбами их, лбами сталкивай!','Make them bump heads!'],['Шибче! У меня щи стынут.','Faster! My soup’s getting cold.'], // i18n:ru — пары [рус, англ] / русская раскладка
  ['Гляди-ка, ещё бегает!','Well, well — still running!'],['Вот так и в бою надо!','That’s how you do it in battle!'],['Этак ты и от Кощея уйдёшь.','You’d outrun Koschei like that.']]; // i18n:ru — пары [рус, англ] / русская раскладка
var TIRED=[['Уф…','Phew…'],['Я домой.','Going home.'],['Ну его.','Forget it.'],['Перекур!','Break time!']]; // i18n:ru — пары [рус, англ] / русская раскладка
function run(host,o){
  var A=null,g=null,H=null,T=null,t=0,live=false,over=false,hitBy='',hitT=-1,grace=o.first?1:0,spT=1,evT=0,wave=-1,voeT=2.5,voe=null,bumps=0,msg=null,demo=0,demoT=0,fence=null,stars=[],dir=1;
  function chi(){try{var a=[],i;for(i=0;i<ORD.length;i++){if(i&&!S.done[ORD[i-1]])break;if(CH[ORD[i]]&&CH[ORD[i]].en)a.push(ORD[i]);}return a.length?a[(Math.floor(o.seed||0)+(o.again|0))%a.length]:0;}catch(e){return 0;}}
  function edge(a,d){return [Math.cos(a)*(R.R+(d||26)),Math.sin(a)*(R.R+(d||26))];}
  function put(kind,a,p){var ty=K.pick(T[kind]),xy=edge(a,p&&p.d),m=mult(Math.max(0,wave));p=p||{};
    var e=R.spawn(ty,xy[0],xy[1],{spd:N.sp[kind]*m*(.92+Math.random()*.16)*(p.k||1),fly:kind==='fly',life:p.life||N.life*(.85+Math.random()*.3)});
    if(kind==='fast'){e.beh='lov_dash';e.ds=0;e.dt=.4+Math.random()*.6;}return e;}
  function kindOf(){var n=wave,x=Math.random();if(n<2)return 'slow';if(n<4)return x<.6?'slow':'mid';if(n<7)return x<.4?'slow':x<.8?'mid':'fast';return x<.28?'slow':x<.6?'mid':x<.84?'fast':'fly';}
  function say(e,t2){try{say2(e,L(t2[0],t2[1]));}catch(x){}}
  function say2(e,s){g.bub.push({e:e,s:s,t:0,dur:2.2});if(g.bub.length>4)g.bub.shift();}
  function note(t2,sub){msg={t:L(t2[0],t2[1]),s:sub?L(sub[0],sub[1]):'',a:2.4};}
  /* события раз в ~13 с: кольцо с воротами, клин бегунов, стая летунов */
  function event(){var k=Math.floor(Math.random()*3),i,a0=Math.random()*TAU,hx=g.hero.x,hy=g.hero.y;
    if(wave<3)k=0;
    if(k===0){var n=12+Math.min(10,wave),gapA=a0;for(i=0;i<n;i++){var a=a0+.5+i/n*(TAU-1);put('slow',a,{life:9,k:.9});}note(['Окружают! Ищи ворота','Surrounded! Find the gap']);} // i18n:ru — пары [рус, англ] / русская раскладка
    else if(k===1){var b=Math.atan2(hy,hx)+Math.PI+(Math.random()-.5);for(i=0;i<5;i++)put('fast',b+(i-2)*.16,{life:8});note(['Бегуны клином!','Runners in a wedge!'],['Уйди с прямой','Step off their line']);} // i18n:ru — пары [рус, англ] / русская раскладка
    else{for(i=0;i<7;i++)put('fly',a0+(Math.random()-.5)*.9,{life:8,d:30+Math.random()*50});note(['Нетопыри!','Bats!'],['Летят напролом','They fly straight through']);} // i18n:ru — пары [рус, англ] / русская раскладка
    K.snd('whistle');}
  function bump(e,q){if(e.stun>0||q.stun>0||e.fly||q.fly)return;var dx=q.x-e.x,dy=q.y-e.y,d=Math.hypot(dx,dy)||1;if(d>e.r+q.r+2)return;
    var hx=g.hero.x,hy=g.hero.y,ax=hx-e.x,ay=hy-e.y,bx=hx-q.x,by=hy-q.y,al=Math.hypot(ax,ay)||1,bl=Math.hypot(bx,by)||1;if((ax*bx+ay*by)/(al*bl)>-.15&&!(e.ds===2||q.ds===2))return;
    e.stun=q.stun=1;e.kx=-dx/d*120;e.ky=-dy/d*120;q.kx=dx/d*120;q.ky=dy/d*120;e.ds=q.ds=0;e.dt=q.dt=1.2;bumps++;stars.push({x:(e.x+q.x)/2,y:(e.y+q.y)/2-14,t:0});burst((e.x+q.x)/2,(e.y+q.y)/2,'#ffe27a',8,120);K.snd('hit');
    if(bumps===1||bumps%6===0)say2(e,L('Ой! Лбами!','Ouch! Heads!'));}
  function frame(dt){var Hh=g.hero,d=Math.hypot(Hh.x,Hh.y),i,e;
    if(d>R.R-14){Hh.x*=(R.R-14)/d;Hh.y*=(R.R-14)/d;}
    if(demo){demoT+=dt;var best=null,bd=1e9;for(i=0;i<g.en.length;i++){e=g.en[i];var q=(e.x-Hh.x)*(e.x-Hh.x)+(e.y-Hh.y)*(e.y-Hh.y);if(q<bd){bd=q;best=e;}}
      var ang=best?Math.atan2(Hh.y-best.y,Hh.x-best.x)+dir*1.1:demoT;if(d>R.R*.6)ang=Math.atan2(-Hh.y,-Hh.x)+dir*.9;
      IN.on=true;IN.id=-7;IN.ox=VIEW.W/2;IN.oy=VIEW.H*.74;IN.px=IN.ox+Math.cos(ang)*42;IN.py=IN.oy+Math.sin(ang)*42;A.fake=1;
      if(demoT>4.2){demo=0;A.fake=0;IN.on=false;begin(1);return;}}
    else t+=dt;
    var n=Math.floor(t/N.wave);if(n!==wave&&!demo){wave=n;if(n>0&&n%3===0)K.snd('level');}
    spT-=dt;if(spT<=0){spT=demo?.7:t<N.warm?1.4:gapOf(wave,o.calm);put(demo?'slow':kindOf(),Math.random()*TAU);}
    if(!demo){evT-=dt;if(evT<=0){evT=N.evEvery*(.85+Math.random()*.3);event();}
      voeT-=dt;if(voeT<=0&&voe){voeT=7+Math.random()*4;say(voe,t<4?VOE[0]:K.pick(VOE));}}
    for(i=0;i<g.en.length;i++){e=g.en[i];if(e.dead)continue;if(e.lovT>0){e.lovT-=dt;if(e.lovT<=0){e.dead=true;burst(e.x,e.y,'#d8d0c0',8,90);if(Math.random()<.25&&onScreen(e,-20))say(e,K.pick(TIRED));continue;}}
      if(!e.fly&&!(e.stun>0))forNear(e.x,e.y,e.r+18,function(q){if(q!==e&&!q.dead)bump(e,q);});}
    for(i=stars.length-1;i>=0;i--){stars[i].t+=dt;if(stars[i].t>1)stars.splice(i,1);}
    if(msg){msg.a-=dt;if(msg.a<=0)msg=null;}
    if(H&&!demo)H.set(Math.floor(t));}
  function onHit(src){if(!live||over||demo||hitT>=0)return;var Hh=g.hero;
    if(grace>0||t<1.2){if(t>=1.2){grace--;note(['Первый раз прощаю!','First one’s free!'],['Не лезь в толпу — обходи','Don’t run into the crowd — go around']);}Hh.inv=1.6;push(150);K.snd('hurt');return;} // i18n:ru — пары [рус, англ] / русская раскладка
    hitBy=src||'';hitT=0;live=false;A.pause(true);K.snd('hurt');K.vib(90);
    setTimeout(function(){if(over)return;K.cont(host,o,Math.floor(t),function(ok){if(!ok){finish();return;}hitT=-1;live=true;push(190);g.hero.inv=2.2;A.pause(false);});},650);}
  function push(r){var Hh=g.hero,i,e;for(i=0;i<g.en.length;i++){e=g.en[i];var dx=e.x-Hh.x,dy=e.y-Hh.y,d=Math.hypot(dx,dy)||1;if(d<r){e.stun=1.2;e.kx=dx/d*260;e.ky=dy/d*260;}}g.fx.push({k:'wave',own:1,t:0,dur:.4,r1:r,col:'#ffe07a'});}
  function finish(){if(over)return;over=true;live=false;if(H)H.end();A.close();
    var sc=Math.floor(t);host.done({score:sc,extra:{msg:(sc<12?L('Не беги в толпу — обходи по дуге','Don’t run into the crowd — circle around it'):bumps<2?L('Хитрость: столкни нечисть лбами','Trick: make monsters bump heads'):L('От бегунов уходи вбок','Sidestep the runners'))}});}
  function begin(fresh){var i;g.en.length=0;g.bub.length=0;g.hero.x=0;g.hero.y=0;g.cam.x=0;g.cam.y=0;t=0;wave=-1;spT=.6;evT=N.evEvery;voeT=2.2;bumps=0;hitT=-1;live=true;stars.length=0;
    for(i=0;i<3;i++)put('slow',i/3*TAU+1,{life:N.life});if(fresh)note(['Теперь ты!','Your turn!'],zabPC()?['Стрелки или мышь','Arrows or mouse']:['Води пальцем','Drag your finger']);A.pause(false);} // i18n:ru — пары [рус, англ] / русская раскладка
  /* частокол — готовой картинкой один раз, дальше только drawImage */
  function mkFence(){var k=Math.min(VIEW.B,2.5),w=16,h=40,q=mkCanvas(w*k,h*k),x=q.getContext('2d');x.setTransform(k,0,0,k,0,0);var gr=x.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#6b4320');gr.addColorStop(.5,'#a9763c');gr.addColorStop(1,'#5a3618');
    x.fillStyle=gr;x.beginPath();x.moveTo(1.5,h);x.lineTo(1.5,9);x.lineTo(w/2,0);x.lineTo(w-1.5,9);x.lineTo(w-1.5,h);x.closePath();x.fill();x.strokeStyle='#3a2410';x.lineWidth=1.6;x.stroke();x.fillStyle='rgba(255,230,170,.22)';x.fillRect(5,10,2,h-12);return q;}
  function draw(c){if(!fence)fence=mkFence();var n=Math.round(TAU*R.R/15),i,a,x,y;worldT();
    for(i=0;i<n;i++){a=i/n*TAU;x=Math.cos(a)*(R.R+8);y=Math.sin(a)*(R.R+8);if(Math.abs(x-VIEW.cx)>VIEW.ww+20||Math.abs(y-VIEW.cy)>VIEW.wh+44)continue;c.drawImage(fence,x-8,y-34,16,40);}
    if(voe){drawSpr('zb_starosta',voe.x,voe.y,.62,.62);worldT();}
    for(i=0;i<stars.length;i++){var s=stars[i],j;c.globalAlpha=1-s.t;c.fillStyle='#ffe27a';for(j=0;j<3;j++){var an=s.t*7+j*2.1;c.beginPath();c.arc(s.x+Math.cos(an)*14,s.y-s.t*10+Math.sin(an)*5,2.6,0,TAU);c.fill();}c.globalAlpha=1;}
    for(i=0;i<g.en.length;i++){var e=g.en[i];if(e.ds===1&&!e.dead){c.strokeStyle='rgba(255,90,60,.55)';c.lineWidth=3;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x+e.dx*70,e.y+e.dy*70);c.stroke();}}}
  function hud(c,G0,W,Hh){if(demo){K.tag(c,W,K.top()+116,L('Смотри: води пальцем, обходи нечисть по дуге','Watch: drag your finger, circle around the monsters'));K.finger(c,IN.px,IN.py,1);return;}
    if(msg){c.globalAlpha=Math.min(1,msg.a*2);K.tag(c,W,K.top()+116,msg.t,'rgba(150,40,20,.86)');if(msg.s)K.tag(c,W,K.top()+150,msg.s);c.globalAlpha=1;}
    if(live&&t<N.warm&&!msg)K.tag(c,W,Hh-30,L('Разминка: нечисть пока сонная','Warm-up: the monsters are still sleepy'));
    if(hitT>=0){c.fillStyle='rgba(180,30,20,.25)';c.fillRect(0,0,W,Hh);}}
  /* бегун: прицелился (красная черта) → рывок по прямой → отдышался */
  if(typeof BEH!=='undefined'&&!BEH.lov_dash)BEH.lov_dash={step:function(e,dt,G0){var Hh=G0.hero;e.dt-=dt;
    if(e.ds===1){if(e.dt<=0){e.ds=2;e.dt=1.05;}return true;}
    if(e.ds===2){e.x+=e.dx*N.dash*dt;e.y+=e.dy*N.dash*dt;e.face=e.dx<0?-1:1;if(e.dt<=0||Math.hypot(e.x,e.y)>R.R+40){e.ds=0;e.dt=.9+Math.random()*.5;}return true;}
    if(e.dt<=0&&Math.hypot(Hh.x-e.x,Hh.y-e.y)<230){var dx=Hh.x-e.x,dy=Hh.y-e.y,d=Math.hypot(dx,dy)||1;e.dx=dx/d;e.dy=dy/d;e.ds=1;e.dt=.55;e.flash=.3;return true;}
    return false;}};
  A=R.open(host,{chi:chi(),frame:frame,hit:onHit,draw:draw,hud:hud});g=A.G;T=R.types();dir=Math.random()<.5?1:-1;
  voe={x:0,y:-R.R-26,r:16,sc:1,dead:false};
  ZABK.loop(host,function(){if(G===g&&live&&hitT<0)g.paused=host.paused;});
  host.dbg={t:function(){return t;},G:function(){return g;},live:function(){return live;},demo:function(){return demo;},bumps:function(){return bumps;},A:A};
  ZREC.start(host,o,function(){H=ZREC.hud(host,o);if(o.first&&!o.again){demo=1;demoT=0;g.en.length=0;live=true;spT=.2;A.pause(false);}else begin(0);});
}
ZAB_REG({id:'uvern',kind:'lov',n:zabN('Увернись!','Dodge!'),run:run});
})();
