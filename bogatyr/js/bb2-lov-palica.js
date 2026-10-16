/* bb2-lov-palica.js — «Палица за три леса» (ловкостная на рекорд, поток LOVA). Два нажатия: держи — богатырь раскручивает палицу (сила качается),
   отпусти — второе нажатие ловит угол. Палица летит через поле, три леса, болото… Три броска, счёт — сумма вёрст. Ветер каждый бросок другой:
   в лицо — бросай ниже, в спину — выше. Договор — шапка js/bb2-zab-ui.js. */
(function(){
var K=LOVK,TAU=Math.PI*2;
/* числа игры (не экономика): расстояния в вёрстах */
var N={g:30,v:46,pMin:.3,perf:.955,perfK:1.07,wind:7,rest:.38,fric:.55,a0:10,a1:80,per:[1.5,1.25,1.05],aper:[1.25,1.1,.95],max:125};
var SPOT=[[14,['Себе под ноги. Бывает.','Right at your feet. It happens.']],[32,['В огород тётки Маланьи — репа всмятку.','Into Aunt Malanya’s garden — mashed turnips.']],[52,['В огород Яги! Избушка аж присела.','Into Yaga’s garden! The hut ducked.']], // i18n:ru — пары [рус, англ] / русская раскладка
  [72,['В котёл Водяного. Буль!','Into the Water Spirit’s cauldron. Bloop!']],[90,['Лешему по пню. Пень обиделся.','Hit the Leshy’s stump. The stump is offended.']],[104,['Кощею на трон. «Опять?!»','Onto Koschei’s throne. “Again?!”']],[1e9,['За три леса и ещё чуть-чуть! Горыныч пригнулся.','Past three forests and then some! The Dragon ducked.']]]; // i18n:ru — пары [рус, англ] / русская раскладка
var MARK=[[45,'yaga',1.5],[66,'vod',1.1],[86,'lesh',1.1],[101,'kosh',1.5],[116,'gory',1.9]],WOOD=[[18,30],[50,61],[78,92]];
function tri(x){x=x%1;return x<.5?x*2:2-x*2;}
function launch(p,a,w){var perf=p>=N.perf,v=N.v*(N.pMin+(1-N.pMin)*p)*(perf?N.perfK:1),r=a*Math.PI/180;return {x:0,y:.01,vx:Math.cos(r)*v,vy:Math.sin(r)*v,w:w,b:0,done:false,perf:perf,rot:0};}
function step(m,dt){if(m.done)return;m.vx+=m.w*N.wind*dt*(m.y>.5?1:0);m.vy-=N.g*dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.rot+=dt*(6+m.vx*.2);
  if(m.y<=0){m.y=0;if(m.vy<-7&&m.vx>3){m.vy=-m.vy*N.rest;m.vx*=N.fric;m.b++;m.hit=1;}else{m.done=true;m.vy=0;}}
  if(m.vx<0&&m.y<=0)m.done=true;if(m.x<0){m.x=0;m.done=true;}}
function dist(p,a,w){var m=launch(p,a,w),i=0;while(!m.done&&i++<4000)step(m,1/120);return Math.min(N.max,Math.max(0,Math.round(m.x)));}
function spot(d){for(var i=0;i<SPOT.length;i++)if(d<SPOT[i][0])return L(SPOT[i][1][0],SPOT[i][1][1]);return '';}
function run(host,o){
  var c=ZABK.canvas(host),g=c.getContext('2d'),P=[],H=null,ph='idle',n=0,sum=0,res=[],pw=0,pt=0,ang=45,at=0,wind=0,m=null,cam=0,landT=0,note=null,demo=0,demoT=0,over=false,held=false,trail=[],last=null;
  function newThrow(){ph='ready';pt=0;at=0;pw=0;m=null;cam=0;trail.length=0;wind=n===0&&!demo?0:Math.round((Math.random()*2-1)*10)/10;if(Math.abs(wind)<.15)wind=0;}
  function press(auto){if(over||(demo&&!auto))return;if(ph==='ready'){ph='spin';pt=0;held=true;K.snd('swing');}
    else if(ph==='aim'){ph='fly';m=launch(pw,ang,wind);last={p:pw,a:ang,w:wind};K.snd(m.perf?'crit':'shoot');if(m.perf)note={t:L('Богатырский бросок!','A mighty throw!'),a:1.4};}
    else if(ph==='land'&&landT>.7)next();}
  function release(auto){if(over||(demo&&!auto))return;if(ph==='spin'&&held){held=false;if(pt<.12){ph='ready';return;}ph='aim';at=0;K.snd('click');}}
  function next(){if(ph!=='land')return;if(demo){demo=0;n=0;sum=0;res.length=0;note={t:L('Теперь ты! Три броска','Your turn! Three throws'),a:2};newThrow();return;}
    n++;if(n>=3){finish();return;}newThrow();}
  function finish(){if(over)return;over=true;if(H)H.end();var worst=null,i,msg;for(i=0;i<res.length;i++)if(!worst||res[i].d<worst.d)worst=res[i];
    if(worst&&worst.p<.7)msg=L('Отпускай на самом пике силы','Release at the very peak of power');
    else if(worst&&(worst.a<28||worst.a>58))msg=L('Лучший угол — около 45°, с поправкой на ветер','Best angle is about 45°, mind the wind');
    else msg=L('Ищи «богатырский бросок» на пике','Go for the “mighty throw” at the peak');
    host.done({score:Math.min(330,sum),extra:{msg:msg}});}
  var bg=K.bg(c,function(x,W,Hh){var gy=Hh*.78,gr=x.createLinearGradient(0,0,0,gy);gr.addColorStop(0,'#6fb6ea');gr.addColorStop(1,'#e6f4d8');x.fillStyle=gr;x.fillRect(0,0,W,gy);
    x.fillStyle='rgba(255,255,255,.75)';[[.2,.14,30],[.62,.09,24],[.85,.2,34]].forEach(function(q){x.beginPath();x.arc(W*q[0],Hh*q[1],q[2],0,TAU);x.arc(W*q[0]+q[2]*.9,Hh*q[1]+4,q[2]*.7,0,TAU);x.arc(W*q[0]-q[2]*.9,Hh*q[1]+5,q[2]*.6,0,TAU);x.fill();});});
  function geo(){var W=c.W,Hh=c.H;return {W:W,H:Hh,gy:Hh*.78,s:Math.min(W/36,Hh/50),hx:Math.max(54,W*.17)};}
  function sx(G,x){return G.hx+(x-cam)*G.s;}
  function drawWorld(G,now){var i,x,x0=cam-G.hx/G.s-4,x1=cam+(G.W-G.hx)/G.s+4;
    g.fillStyle='#a8d0a0';g.beginPath();g.moveTo(0,G.gy);for(i=0;i<=24;i++){var wx=x0+(x1-x0)*i/24;g.lineTo(sx(G,wx),G.gy-G.H*(.07+.035*Math.sin(wx*.11)+.02*Math.sin(wx*.31)));}g.lineTo(G.W,G.gy);g.fill();
    for(i=0;i<WOOD.length;i++)for(x=WOOD[i][0];x<WOOD[i][1];x+=2.2){if(x<x0||x>x1)continue;var ps=G.s*(7+((x*7)%3));ZABK.put(g,'d_pine',sx(G,x),G.gy-ps*.38,ps,c.D);}
    var gr=g.createLinearGradient(0,G.gy,0,G.H);gr.addColorStop(0,'#6aa63c');gr.addColorStop(1,'#3f7426');g.fillStyle=gr;g.fillRect(0,G.gy,G.W,G.H-G.gy);
    if(x1>60&&x0<74){g.fillStyle='#4a8ea8';K.rr(g,sx(G,60),G.gy+4,14*G.s,G.H*.05,10);g.fill();}
    for(x=Math.max(0,Math.ceil(x0/10)*10);x<=x1;x+=10){var px=sx(G,x);g.fillStyle='#f4ead0';g.fillRect(px-2,G.gy-22,4,26);g.fillStyle='#b8322a';g.fillRect(px-2,G.gy-22,4,6);g.fillRect(px-2,G.gy-10,4,6);ZABK.text(g,String(x),px,G.gy+16,13,{col:'#fff6dc'});}
    for(i=0;i<MARK.length;i++){x=MARK[i][0];if(x<x0-6||x>x1+6)continue;var ms=G.s*7*MARK[i][2];ZABK.put(g,MARK[i][1],sx(G,x),G.gy-ms*.36+Math.sin(now*2+i)*1.5,ms,c.D);}
}
  function drawHero(G,now){var hp=G.s*8.5,hx=sx(G,0)-hp*.2,hy=G.gy-hp*.4,key='h_'+(typeof skinKey==='function'?skinKey(S.hero):'dob')+'_0';if(!ART[key])key='h_dob_0';
    g.fillStyle='rgba(20,40,10,.3)';g.beginPath();g.ellipse(hx,G.gy+2,hp*.3,hp*.08,0,0,TAU);g.fill();ZABK.put(g,key,hx,hy,hp,c.D);
    if(ph==='spin'||ph==='ready'||ph==='aim'){var sp=ph==='spin'?now*(6+pw*16):ph==='aim'?-ang*Math.PI/180-1.2:-1.2,r=hp*.42;ZABK.put(g,'mace',hx+Math.cos(sp)*r,hy-hp*.15+Math.sin(sp)*r,hp*.6,c.D,{rot:sp+1.2});
      if(ph==='spin'&&pw>.5){g.strokeStyle='rgba(255,236,150,'+(pw-.4)+')';g.lineWidth=3;g.beginPath();g.arc(hx,hy-hp*.15,r,sp-1.6,sp);g.stroke();}}
    return {x:hx,y:hy-hp*.15,hp:hp};}
  ZABK.loop(host,function(dt,now){var G=geo(),i;
    if(demo&&!over){demoT+=dt;if(ph==='ready'&&demoT>.7)press(1);else if(ph==='spin'&&pt>N.per[0]*.43)release(1);else if(ph==='aim'&&at>N.aper[0]*.26)press(1);else if(ph==='land'&&landT>1.5)next();}
    if(ph==='spin'){pt+=dt;pw=tri(pt/N.per[Math.min(2,n)]);}
    if(ph==='aim'){at+=dt;ang=N.a0+(N.a1-N.a0)*tri(at/N.aper[Math.min(2,n)]);}
    if(ph==='fly'){for(i=0;i<4;i++){step(m,dt/4);if(m.hit){m.hit=0;K.snd('hit');ZABK.burst(P,sx(G,m.x),G.gy,{n:8,col:'#c8b080',sp:150,a0:-Math.PI,arc:Math.PI});if(!o.calm)host._sh=5;}}
      trail.push(m.x,m.y);if(trail.length>80)trail.splice(0,2);cam=Math.max(0,m.x-(G.W-G.hx)/G.s*.45);
      if(m.done){var d=Math.min(N.max,Math.max(0,Math.round(m.x)));ph='land';landT=0;K.snd(d>=95?'win':'boom');ZABK.burst(P,sx(G,m.x),G.gy,{n:16,col:'#ffe27a',k:'star',s:6});
        if(!demo){res.push({d:d,p:last.p,a:last.a,w:last.w});sum+=d;H.set(sum);}note={t:(demo?'':'+'+d+' · ')+spot(d),a:3,low:1};}}
    if(ph==='land')landT+=dt;if(note){note.a-=dt;if(note.a<=0)note=null;}host._sh=Math.max(0,(host._sh||0)-dt*30);
    bg(g);g.save();if(host._sh>0)g.translate(0,(Math.random()-.5)*host._sh);drawWorld(G,now);var hh=drawHero(G,now);
    if(m){g.fillStyle='rgba(255,255,255,.5)';for(i=0;i<trail.length;i+=4){g.beginPath();g.arc(sx(G,trail[i]),G.gy-trail[i+1]*G.s,2.2,0,TAU);g.fill();}
      var my=G.gy-m.y*G.s-G.s*1.6,ms=G.s*5;if(my<-ms){ZABK.text(g,'▲ '+Math.round(m.y),sx(G,m.x),K.top()+150,15,{});}ZABK.put(g,'mace',sx(G,m.x),my,ms,c.D,{rot:m.done?2.2:m.rot});}
    ZABK.parts(g,P,dt);g.restore();
    /* приборы */
    var top=K.top()+92;
    if(ph!=='idle'){var wt=wind===0?L('ветра нет','no wind'):wind>0?L('ветер в спину','tailwind'):L('ветер в лицо','headwind');K.tag(g,G.W,top,(demo?L('Смотри: ','Watch: '):L('Бросок '+Math.min(3,n+1)+' из 3 · ','Throw '+Math.min(3,n+1)+' of 3 · '))+wt+(wind?' '+(wind>0?'→':'←').repeat(Math.abs(wind)>.6?3:Math.abs(wind)>.3?2:1):''),wind<0?'rgba(120,50,30,.85)':wind>0?'rgba(40,90,50,.85)':null);}
    if(ph==='ready'||ph==='spin'){var bx=G.W-46,bh=Math.min(G.H*.36,250),by=G.gy-bh-10;g.fillStyle='rgba(30,18,8,.6)';K.rr(g,bx-3,by-3,30,bh+6,10);g.fill();var gr=g.createLinearGradient(0,by+bh,0,by);gr.addColorStop(0,'#8fd14a');gr.addColorStop(.7,'#ffd25a');gr.addColorStop(1,'#ff5a3a');
      g.fillStyle=gr;K.rr(g,bx,by+bh*(1-pw),24,Math.max(6,bh*pw),7);g.fill();g.fillStyle='#fff';g.fillRect(bx-6,by+bh*(1-N.perf),36,2);ZABK.text(g,L('сила','power'),bx+12,by-14,13,{});}
    if(ph==='aim'){var r2=hh.hp*1.5,a=-ang*Math.PI/180;g.strokeStyle='rgba(30,18,8,.5)';g.lineWidth=10;g.lineCap='round';g.beginPath();g.arc(hh.x,hh.y,r2,-N.a1*Math.PI/180,-N.a0*Math.PI/180);g.stroke();
      g.strokeStyle='#8fd14a';g.lineWidth=6;g.beginPath();g.arc(hh.x,hh.y,r2,-52*Math.PI/180,-36*Math.PI/180);g.stroke();
      g.strokeStyle='#fff6dc';g.lineWidth=5;g.beginPath();g.moveTo(hh.x,hh.y);g.lineTo(hh.x+Math.cos(a)*r2*1.12,hh.y+Math.sin(a)*r2*1.12);g.stroke();ZABK.text(g,Math.round(ang)+'°',hh.x+Math.cos(a)*r2*1.35,hh.y+Math.sin(a)*r2*1.35,17,{});}
    var hint=ph==='ready'?(zabPC()?L('Держи пробел или мышь — раскрути','Hold Space or the mouse — spin it up'):L('Нажми и держи — раскрути','Press and hold — spin it up')):ph==='spin'?L('Отпусти на самом верху!','Release at the very top!'):ph==='aim'?(zabPC()?L('Пробел — поймай угол','Space — lock the angle'):L('Нажми — поймай угол','Tap — lock the angle')):ph==='land'&&landT>.9?L('Нажми — дальше','Tap to continue'):'';
    if(hint&&!demo)K.tag(g,G.W,G.H-28,hint);
    if(note){g.globalAlpha=Math.min(1,note.a*2);K.tag(g,G.W,note.low?G.gy+G.H*.11:top+38,note.t,'rgba(150,40,20,.88)');g.globalAlpha=1;}
    if(demo){var fx=G.W*(note&&note.low?.86:.5),fy=G.gy+G.H*.1;K.finger(g,fx,fy,ph==='spin');}
    if(ph==='land'&&!demo&&landT>3.2)next();
  });
  K.ptr(c,host,{down:function(){press();},up:function(){release();}});
  function ku(e){if(e.key===' '||e.key==='Enter')release();}
  zabKeys(host,function(k){if(k===' '||k==='Enter'){press();return true;}});window.addEventListener('keyup',ku);host.onQuit(function(){window.removeEventListener('keyup',ku);});
  host.dbg={st:function(){return {ph:ph,pw:pw,ang:ang,n:n,sum:sum,wind:wind,demo:demo,pt:pt,at:at};},press:press,release:release,dist:dist};
  ZREC.start(host,o,function(){H=ZREC.hud(host,o);n=0;sum=0;if(o.first&&!o.again){demo=1;demoT=0;}newThrow();});
}
function gs(r){return (r()+r()+r()-1.5)*1.15;}
function sim(o,k){var r=o&&o.rnd||Math.random,s=0,i;for(i=0;i<3;i++){var w=i?Math.round((r()*2-1)*10)/10:0,p=Math.max(.05,1-Math.abs(gs(r))*(1-k)*.55),a=Math.max(N.a0,Math.min(N.a1,44-w*6*k+gs(r)*(1-k)*26));s+=dist(p,a,w);}
  return {score:s,tier:ZREC.tier('palica',s)};}
ZAB_REG({id:'palica',kind:'lov',n:zabN('Палица за три леса','Mace Over Three Forests'),run:run,sim:sim});
})();
