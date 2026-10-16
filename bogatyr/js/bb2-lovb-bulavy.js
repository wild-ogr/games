/* bb2-lovb-bulavy.js — «Три булавы» (ловкостная на рекорд, поток LOVB). Микула Селянинович жонглирует: тап по падающей булаве в полосе рук — подбросить.
   Сначала одна, с 8-го подброса две, с 22-го — три; тогда прибегает питомец и один раз ловит булаву сам. Уронил — на ногу, «Ой-ёй». Счёт — подбросы.
   Договор — шапка js/bb2-zab-ui.js. */
(function(){
var K=LOVK,TAU=Math.PI*2;
/* числа игры (не экономика); высоты — доли экрана */
var N={warm:3,add:[8,22],g0:1.05,gK:.006,gMax:1.55,ap0:.22,ap1:.36,zone:.46,catchW:.2};
function gOf(sc,calm){return Math.min(N.gMax,N.g0*(1+N.gK*sc))*(calm?.8:1);}
var SAY=[[5,['Эх, раз!','Heave-ho!']],[8,['Держи вторую!','Catch another!']],[15,['Пахать и то легче','Ploughing is easier']],[22,['И третью!','And a third!']],[40,['Ярмарка в восторге!','The fair is cheering!']],[60,['Микула, ты в скоморохи иди!','Mikula, join the jesters!']],[90,['Булавы сами просятся в руки','The maces fly into your hands']]]; // i18n:ru
function run(host,o){
  var c=ZABK.canvas(host),g=c.getContext('2d'),P=[],H=null,st=null,live=false,over=false,dead=0,demo=0,demoQ=0,bub=null,seen={},spr={},s0=0,pet='pt_ezh';
  try{var pc=S.pet&&S.pet.cur;if(pc&&typeof PETS!=='undefined'&&PETS[pc]&&ART[PETS[pc].k])pet=PETS[pc].k;}catch(e){}
  function geo(){var W=c.W,Hh=c.H,gy=Hh*.9,hy=Hh*.72;return {W:W,H:Hh,gy:gy,hy:hy,zt:Hh*N.zone,hp:K.clamp(Math.min(W*.4,Hh*.22),90,190),ms:K.clamp(Math.min(W,Hh)*.18,56,116)};}
  function reset(){st={sc:0,m:[],t:0,dT:0,why:'',pet:0,petX:-60,petT:0,shake:0,flash:0,msg:0,fing:0,fx:0,fy:0,arm:0,foot:0,cy:0};bub=null;dead=0;}
  function toss(m,G,first){var gg=gOf(st.sc,o.calm)*G.H,ap=G.H*(N.ap0+(N.ap1-N.ap0)*Math.random()),h=Math.max(G.H*.15,m.y-ap),vy=-Math.sqrt(2*gg*h),tUp=-vy/gg,tDn=Math.sqrt(2*Math.max(1,G.hy-ap)/gg);
    var tx=G.W*(.22+.56*Math.random());if(st.m.length>1){var far=0,i;for(i=0;i<st.m.length;i++)if(st.m[i]!==m&&Math.abs(st.m[i].x-tx)<G.W*.12)far=1;if(far)tx=G.W-tx;}
    m.vx=(tx-m.x)/(tUp+tDn);m.vy=vy;m.vr=(Math.random()<.5?-1:1)*(7+Math.random()*5);if(!first){st.sc++;st.arm=.15;K.snd('swing');}}
  function add(G,fromSide){var m={x:fromSide?(Math.random()<.5?-20:G.W+20):G.W/2,y:fromSide?G.H*.55:G.hy,vx:0,vy:0,r:0,vr:0};st.m.push(m);
    if(fromSide){var gg=gOf(st.sc,o.calm)*G.H,ap=G.H*.25,vy=-Math.sqrt(2*gg*(m.y-ap)),T=-vy/gg+Math.sqrt(2*(G.hy-ap)/gg);m.vy=vy;m.vx=(G.W*(.35+.3*Math.random())-m.x)/T;m.vr=8;}else toss(m,G,1);}
  function mk(w,h,fn){var d=c.D,q=document.createElement('canvas');q.width=Math.ceil(w*d);q.height=Math.ceil(h*d);var x=q.getContext('2d');x.setTransform(d,0,0,d,0,0);fn(x,w,h);return q;}
  function sprites(G){if(s0===G.ms+c.D*1000)return;s0=G.ms+c.D*1000;var s=G.ms;
    spr.mace=mk(s,s,function(x){x.translate(s/2,s/2);x.rotate(-.6);x.fillStyle='#8a5a2c';x.strokeStyle='#3a2410';x.lineWidth=2;K.rr(x,-s*.06,-s*.05,s*.12,s*.5,s*.05);x.fill();x.stroke();
      x.fillStyle='#e6b53a';x.fillRect(-s*.08,s*.38,s*.16,s*.07);
      var gr=x.createRadialGradient(-s*.06,-s*.22,2,0,-s*.16,s*.2);gr.addColorStop(0,'#e8eef4');gr.addColorStop(1,'#6a7480');x.fillStyle=gr;
      for(var i=0;i<8;i++){var a=i/8*TAU;x.beginPath();x.moveTo(Math.cos(a)*s*.15,-s*.16+Math.sin(a)*s*.15);x.lineTo(Math.cos(a+.2)*s*.26,-s*.16+Math.sin(a+.2)*s*.26);x.lineTo(Math.cos(a+.4)*s*.15,-s*.16+Math.sin(a+.4)*s*.15);x.fill();}
      x.beginPath();x.arc(0,-s*.16,s*.17,0,TAU);x.fill();x.strokeStyle='#3a4450';x.stroke();});}
  var bg=K.bg(c,function(x,W,Hh){var G=geo(),gr=x.createLinearGradient(0,0,0,G.gy);gr.addColorStop(0,'#f6d48a');gr.addColorStop(.6,'#f2e6c0');gr.addColorStop(1,'#d8e8b0');x.fillStyle=gr;x.fillRect(0,0,W,G.gy);
    /* ярмарочные флажки */
    x.strokeStyle='#6b4320';x.lineWidth=2;x.beginPath();x.moveTo(0,K.top()+112);x.quadraticCurveTo(W/2,K.top()+150,W,K.top()+112);x.stroke();
    var col=['#d8483a','#3d8a35','#2f7ab8','#e6b53a'];for(var i=0;i<9;i++){var t=(i+.5)/9,px=W*t,py=K.top()+112+Math.sin(t*Math.PI)*36;x.fillStyle=col[i%4];x.beginPath();x.moveTo(px-9,py);x.lineTo(px+9,py);x.lineTo(px,py+18);x.fill();}
    gr=x.createLinearGradient(0,G.gy,0,Hh);gr.addColorStop(0,'#a87c44');gr.addColorStop(1,'#7a5228');x.fillStyle=gr;x.fillRect(0,G.gy,W,Hh-G.gy);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(0,G.gy,W,3);
    /* полоса рук: где ловить */
    x.fillStyle='rgba(255,250,220,.28)';x.fillRect(0,G.zt,W,G.gy-G.zt);x.strokeStyle='rgba(140,90,40,.35)';x.setLineDash([6,8]);x.beginPath();x.moveTo(0,G.zt);x.lineTo(W,G.zt);x.stroke();x.setLineDash([]);});
  function say(t,a){bub={t:L(t[0],t[1]),a:a||2.4};}
  function tapAt(x,y,auto){if(!live||dead||over||(demo&&!auto))return;var G=geo(),best=null,bd=1e9,i,m;
    for(i=0;i<st.m.length;i++){m=st.m[i];if(m.y<G.zt-G.ms*.4||m.vy<-30)continue;var d=Math.abs(m.x-x)+Math.abs(m.y-y)*.35;if(Math.abs(m.x-x)<G.W*N.catchW&&d<bd){bd=d;best=m;}}
    if(!best){K.snd('click');return;}toss(best,G);ZABK.burst(P,best.x,best.y,{n:5,sp:110,col:'#fff0c0',s:3,d:.3});
    if(!demo){H.set(st.sc);for(i=0;i<SAY.length;i++)if(st.sc===SAY[i][0]&&!seen[i]){seen[i]=1;say(SAY[i][1]);}if(st.sc===N.add[0]||st.sc===N.add[1]){add(G,1);K.snd('level');}if(st.sc===N.add[1]){st.pet=1;st.petT=0;}}}
  function drop(m,G){if(st.pet===1&&st.m.length>=3&&!demo){st.pet=2;st.petX=m.x;m.y=G.gy-4;toss(m,G,1);say(['Питомец поймал!','Your pet caught it!'],1.8);K.snd('coin');return;} // i18n:ru
    if(demo||st.sc<N.warm){m.x=G.W/2;m.y=G.hy;toss(m,G,1);if(!demo){st.flash=.35;say(['Разминка — подними и снова!','Warm-up — pick it up, again!'],1.6);}return;} // i18n:ru
    if(dead)return;dead=1;st.dT=0;st.foot=m.x;K.snd('hurt');K.vib(90);if(!o.calm)st.shake=10;say(['Ой-ёй! Прямо на ногу!','Ouch! Right on the foot!'],2); // i18n:ru
    st.why=st.m.length>=3?L('Три булавы — лови ту, что ниже всех','Three maces — catch the lowest one first'):st.m.length>=2?L('Пока ловил одну, вторая упала — смотри на обе','While catching one, the other fell — watch both'):L('Булава упала — жми, когда она в светлой полосе','The mace fell — tap when it is in the light band');}
  function finish(){if(over)return;over=true;live=false;if(H)H.end();host.done({score:st.sc,extra:{msg:st.why}});}
  function afterDeath(G){K.cont(host,o,st.sc,function(ok){if(!ok){finish();return;}dead=0;var n=st.m.length,i;st.m.length=0;for(i=0;i<n;i++){add(G,0);st.m[i].x=G.W*(.3+.4*i/Math.max(1,n-1));st.m[i].y=G.hy-i*G.H*.12;}st.shake=0;});}
  ZABK.loop(host,function(dt,now){var G=geo(),i,m;sprites(G);
    if(live&&!dead&&!over){st.t+=dt;var gg=gOf(st.sc,o.calm)*G.H;
      for(i=0;i<st.m.length;i++){m=st.m[i];m.vy+=gg*dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.r+=m.vr*dt;if(m.x<G.ms*.4){m.x=G.ms*.4;m.vx=Math.abs(m.vx);}if(m.x>G.W-G.ms*.4){m.x=G.W-G.ms*.4;m.vx=-Math.abs(m.vx);}
        if(m.y>G.gy-G.ms*.2){drop(m,G);if(dead)break;}}
      if(demo){demoQ-=dt;for(i=0;i<st.m.length;i++){m=st.m[i];if(m.vy>0&&m.y>G.hy-G.ms*.3&&demoQ<=0){tapAt(m.x,m.y,1);st.fing=.25;st.fx=m.x;st.fy=m.y+G.ms*.5;demoQ=.2;}}if(st.sc>=6){demo=0;reset();add(G,0);st.msg=1.6;}}}
    if(dead&&!over){st.dT+=dt;if(dead===1&&st.dT>1){dead=2;afterDeath(G);}}
    st.shake=Math.max(0,st.shake-dt*30);st.flash=Math.max(0,st.flash-dt);st.arm=Math.max(0,st.arm-dt);if(st.fing>0)st.fing-=dt;if(st.msg>0)st.msg-=dt;
    bg(g);g.save();if(st.shake>0)g.translate((Math.random()-.5)*st.shake,(Math.random()-.5)*st.shake);
    /* Микула */
    var hk=ART.h_mik_0?'h_mik_':'h_dob_',hx=G.W/2,hy=G.gy-G.hp*.42;g.fillStyle='rgba(40,20,5,.3)';g.beginPath();g.ellipse(hx,G.gy+3,G.hp*.32,G.hp*.08,0,0,TAU);g.fill();
    ZABK.put(g,hk+(st.arm>0&&ART[hk+'1']?1:0),hx,hy+(dead?Math.sin(st.dT*20)*3:0),G.hp,c.D,{sx:1,sy:1});
    /* питомец */
    if(st.pet){st.petT+=dt;var tx=st.pet===2?G.W*.82:G.W*.18,px=st.petT<1?K.lerp(-40,tx,st.petT):tx;ZABK.put(g,pet,px,G.gy-G.hp*.18+Math.abs(Math.sin(now*6))*-4,G.hp*.42,c.D,{sx:1,sy:1});}
    /* булавы */
    for(i=0;i<st.m.length;i++){m=st.m[i];var sh=Math.max(.2,1-(G.gy-m.y)/G.H);g.fillStyle='rgba(40,20,5,'+(.25*sh)+')';g.beginPath();g.ellipse(m.x,G.gy+2,G.ms*.3*sh,G.ms*.07,0,0,TAU);g.fill();
      g.save();g.translate(m.x,m.y);g.rotate(m.r);g.drawImage(spr.mace,-G.ms/2,-G.ms/2,G.ms,G.ms);g.restore();
      if(live&&!dead&&m.vy>0&&m.y>G.zt-G.ms*.4){g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=3;g.beginPath();g.arc(m.x,m.y,G.ms*.55,0,TAU);g.stroke();}}
    if(dead){for(i=0;i<3;i++){var a=now*5+i*2.1;ZABK.text(g,'✦',hx+Math.cos(a)*G.hp*.3,hy-G.hp*.35+Math.sin(a)*6,16,{col:'#ffe27a'});}}
    ZABK.parts(g,P,dt);
    if(bub){bub.a-=dt;K.say(g,bub.t,hx,hy-G.hp*.55,G.W,bub.a);if(bub.a<=0)bub=null;}
    g.restore();
    if(st.flash>0){g.fillStyle='rgba(255,236,150,'+(st.flash*.3)+')';g.fillRect(0,0,G.W,G.H);}
    if(live&&!demo&&st.sc<N.warm)K.tag(g,G.W,G.H-24,st.msg>0?L('Теперь ты!','Your turn!'):L('Разминка: уронил — не беда','Warm-up: dropping is fine'));
    if(demo){K.tag(g,G.W,K.top()+116,L('Смотри: жми по булаве, когда она в светлой полосе','Watch: tap the mace in the light band'));if(st.fing>0)K.finger(g,st.fx,st.fy,1);}
  });
  ZABK.tap(c,host,function(x,y){tapAt(x,y);});
  zabKeys(host,function(k){if(k===' '||k==='Enter'||k==='ArrowDown'||k==='ArrowUp'){var G=geo(),lo=null,i;for(i=0;i<st.m.length;i++)if(st.m[i].vy>0&&(!lo||st.m[i].y>lo.y))lo=st.m[i];if(lo)tapAt(lo.x,lo.y);return true;}});
  reset();host.dbg={st:function(){var G=geo();st.cy=G.zt;return st;},tap:tapAt,live:function(){return live&&!dead;},demo:function(){return demo;}};
  ZREC.start(host,o,function(){var G=geo();H=ZREC.hud(host,o);reset();add(G,0);live=true;if(o.first&&!o.again){demo=1;demoQ=.3;}});
}
/* бот без экрана: шанс сорваться на подбросе растёт с числом булав и тяжестью */
function sim(o,k){var r=o&&o.rnd||Math.random,sc=0;for(;sc<800;){var n=sc>=N.add[1]?3:sc>=N.add[0]?2:1,gm=gOf(sc)/N.g0,p=.002+(1-k)*(.004+.018*(n-1)+.05*(gm-1))+(n===3?(1-k)*.01:0);
    if(sc>=N.warm&&r()<p)break;sc++;}
  return {score:sc,tier:ZREC.tier('bulavy',sc)};}
ZAB_REG({id:'bulavy',kind:'lov',n:zabN('Три булавы','Three Maces'),run:run,sim:sim});
})();
