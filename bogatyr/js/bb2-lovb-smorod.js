/* bb2-lovb-smorod.js — «Через Смородину» (ловкостная на рекорд, поток LOVB; в разборе 03 — «Калинов мост», имя занято башней TAIL).
   Садко переправляется через реку Смородину по плывущим брёвнам и льдинам: тап — прыжок вперёд. Не успел — бревно уплыло, льдина нырнула — купание.
   На каждом бревне Садко берёт ноту — выходит песня. Каждые 5 рек — берег. Счёт — прыжки. Договор — шапка js/bb2-zab-ui.js. */
(function(){
var K=LOVK,TAU=Math.PI*2;
/* числа игры (не экономика); длины — в «бревенных» единицах u */
var N={warm:3,hop:.2,bank:6,v0:.85,vK:.045,vMax:2.5,len0:3.4,lenK:.035,lenMin:1.9,gap0:1.3,gapK:.03,gapMax:2.7,ice0:8,ice:.35,cyc:4.2,dive:1.1,warn:.7};
var MEL=[392,440,494,587,494,440,392,330,392,440,494,440,392,294,330,392]; /* песня Садко: по ноте на прыжок */
var SAY=[[6,['Первый берег! Водяной хмурится','First bank! The Water Spirit frowns']],[18,['Гусли сухие — песня громче!','Dry harp — louder song!']],[30,['Водяной заслушался','The Water Spirit is listening']], // i18n:ru
  [48,['Рыбы подпевают!','The fish sing along!']],[66,['Смородина таких не видала','The Smorodina has never seen the like']],[90,['Царь Морской зовёт в гости!','The Sea Tsar invites you over!']]]; // i18n:ru
function lane(i,seed,calm,wu){var r=mulberry((seed|0)*31+i*977+7),v=Math.min(N.vMax,N.v0+N.vK*i)*(calm?.75:1)*(.85+.3*r()),it=[],x=0,
    lm=Math.max(N.lenMin,N.len0-N.lenK*i),gm=Math.min(N.gapMax,N.gap0+N.gapK*i),n=0;
  while(x<wu||n<3){var ice=i>=N.ice0&&r()<N.ice,len=ice?1.25:lm*(.75+.5*r());it.push({x:x,len:len,k:ice?'i':'l',ph:r()*N.cyc});x+=len+gm*(.75+.5*r());n++;}
  return {dir:i%2?1:-1,v:v,it:it,per:x};}
function run(host,o){
  var c=ZABK.canvas(host),g=c.getContext('2d'),P=[],H=null,st=null,live=false,over=false,dead=0,demo=0,bub=null,spr={},s0=0,lanes={},seed=(o.seed|0)+(o.again|0)*101;
  function L_(i){var G=geo();return lanes[i]||(lanes[i]=lane(i,seed,o.calm,G.W/G.u+9));}
  function isBank(r){return r%N.bank===0;}
  function geo(){var W=c.W,Hh=c.H,rh=K.clamp(Hh*.105,50,88),u=K.clamp(Math.min(W/7,rh*.95),36,80);return {W:W,H:Hh,rh:rh,u:u,by:Hh*.8};}
  function reset(){st={sc:0,row:0,cam:0,x:c.W/2,on:null,hop:0,hx:0,t:0,dT:0,why:'',banks:0,note:0,flash:0,shake:0,msg:0,fing:0,splash:null,idle:0,iw:0};bub=null;dead=0;}
  /* где предмет полосы i в момент t: левый край в пикселях */
  function itX(G,ln,q,t){var p=ln.per*G.u,x=(q.x*G.u+ln.dir*ln.v*G.u*t)%p;if(x<0)x+=p;return x-(p-G.W)/2-G.u*.5;}
  function under(q,t){if(q.k!=='i')return 0;var f=(t+q.ph)%N.cyc;return f>N.cyc-N.dive?2:f>N.cyc-N.dive-N.warn?1:0;}
  function find(G,i,x,t){var ln=L_(i),k,q,a,p=ln.per*G.u;for(k=0;k<ln.it.length;k++){q=ln.it[k];a=itX(G,ln,q,t);
      if(x>=a-G.u*.22&&x<=a+q.len*G.u+G.u*.22&&under(q,t)<2)return q;if(x>=a-p-G.u*.22&&x<=a-p+q.len*G.u+G.u*.22&&under(q,t)<2)return q;}return null;}
  function mk(w,h,fn){var d=c.D,q=document.createElement('canvas');q.width=Math.ceil(w*d);q.height=Math.ceil(h*d);var x=q.getContext('2d');x.setTransform(d,0,0,d,0,0);fn(x,w,h);return q;}
  function logSpr(G,len){var k='l'+Math.round(len*4);if(spr[k])return spr[k];var w=len*G.u,h=G.rh*.6;return spr[k]=mk(w,h,function(x){var gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#a9763c');gr.addColorStop(.5,'#7c4f26');gr.addColorStop(1,'#4c2e14');
    x.fillStyle=gr;K.rr(x,1,2,w-2,h-4,h*.42);x.fill();x.strokeStyle='#3a2410';x.lineWidth=2;x.stroke();x.strokeStyle='rgba(40,22,8,.45)';x.lineWidth=1.5;
    for(var i=1;i<len*2;i++){x.beginPath();x.moveTo(i*w/(len*2),h*.25);x.lineTo(i*w/(len*2)+5,h*.72);x.stroke();}
    x.fillStyle='#d9a86a';x.beginPath();x.ellipse(w-h*.3,h/2,h*.22,h*.36,0,0,TAU);x.fill();x.strokeStyle='#8a5a2c';x.beginPath();x.ellipse(w-h*.3,h/2,h*.11,h*.18,0,0,TAU);x.stroke();});}
  function sprites(G){if(s0===G.u+c.D*1000)return;s0=G.u+c.D*1000;for(var k in spr)delete spr[k];var h=G.rh*.62,w=1.25*G.u;
    spr.ice=mk(w,h,function(x){x.fillStyle='#e8f6ff';x.strokeStyle='#7fb6d8';x.lineWidth=2;x.beginPath();x.moveTo(w*.08,h*.3);x.lineTo(w*.35,h*.06);x.lineTo(w*.8,h*.12);x.lineTo(w*.96,h*.55);x.lineTo(w*.7,h*.94);x.lineTo(w*.2,h*.88);x.closePath();x.fill();x.stroke();
      x.strokeStyle='rgba(120,180,220,.6)';x.beginPath();x.moveTo(w*.3,h*.3);x.lineTo(w*.55,h*.55);x.lineTo(w*.5,h*.8);x.stroke();});
    spr.wave=mk(G.u*2,G.rh*.3,function(x,w,hh){x.strokeStyle='rgba(255,255,255,.28)';x.lineWidth=2;x.beginPath();x.moveTo(0,hh*.6);x.quadraticCurveTo(w*.25,0,w*.5,hh*.6);x.quadraticCurveTo(w*.75,hh*1.1,w,hh*.6);x.stroke();});
    spr.bank=mk(G.W,G.rh,function(x,w,hh){var gr=x.createLinearGradient(0,0,0,hh);gr.addColorStop(0,'#8fcf62');gr.addColorStop(1,'#5f9a3a');x.fillStyle=gr;x.fillRect(0,0,w,hh);
      x.fillStyle='#d8c08a';x.fillRect(0,hh-6,w,6);x.fillRect(0,0,w,4);x.fillStyle='rgba(40,80,20,.35)';for(var i=0;i<w/14;i++){var px=(i*37)%w,py=8+((i*53)%(hh-20));x.fillRect(px,py,2,7);x.fillRect(px+3,py+2,2,5);}
      for(i=0;i<3;i++){var rx=w*(.15+i*.35);x.fillStyle='#4f8a34';x.beginPath();x.arc(rx,hh*.4,hh*.18,0,TAU);x.arc(rx+hh*.16,hh*.46,hh*.14,0,TAU);x.fill();}});}
  function say(t,a){bub={t:L(t[0],t[1]),a:a||2.6};}
  function note(){var f=MEL[st.note%MEL.length];st.note++;try{tone(f,.28,'triangle',.08,0,0);tone(f*2,.18,'sine',.025,0,.02);}catch(e){}}
  function jump(auto){if(!live||dead||over||st.hop>0||(demo&&!auto))return;st.hop=N.hop;st.hx=st.x;st.idle=0;st.iw=0;K.snd('swing');}
  function land(G){st.row++;var r=st.row;if(isBank(r)){st.on=null;st.x=K.clamp(st.x,G.u*.6,G.W-G.u*.6);st.banks++;K.snd('level');ZABK.burst(P,st.x,G.by,{n:10,col:'#ffe27a',k:'star',s:6});}
    else{var q=find(G,r,st.x,st.t);if(!q){fall(G,0);return;}st.on=q;st.off=st.x-itX(G,L_(r),q,st.t);if(st.off>q.len*G.u)st.off-=L_(r).per*G.u;}
    st.sc++;note();if(!demo){H.set(st.sc);for(var i=0;i<SAY.length;i++)if(st.sc===SAY[i][0])say(SAY[i][1]);}}
  function fall(G,why){if(dead)return;st.splash={x:st.x,t:0};ZABK.burst(P,st.x,G.by,{n:14,sp:170,col:'#bfe6ff',s:4,d:.5,a0:-Math.PI,arc:Math.PI});K.snd('boom');
    if(demo){st.row--;st.on=null;st.x=G.W/2;st.row=Math.floor(st.row/N.bank)*N.bank;return;}
    if(st.sc<N.warm){st.flash=.4;say(['Разминка — Водяной вернул!','Warm-up — the Water Spirit brought you back!'],1.8);st.row=Math.floor((st.row-(isBank(st.row)?0:0))/N.bank)*N.bank;st.on=null;st.x=G.W/2;return;} // i18n:ru
    st.why=why===3?L('Засиделся на берегу — Водяной утащил','Sat too long on the bank — the Water Spirit grabbed you'):why===1?L('Бревно уплыло за край — прыгай раньше','The log drifted off the edge — hop sooner'):why===2?L('Льдина нырнула — она дрожит перед этим','The ice floe dove — it shivers first'):L('Прыгнул мимо бревна — жди, пока подплывёт','You hopped past the log — wait till it drifts up');
    dead=1;st.dT=0;K.vib(80);if(!o.calm)st.shake=8;}
  function finish(){if(over)return;over=true;live=false;if(H)H.end();
    host.done({score:st.sc,extra:{msg:st.why+'. '+L('Водяной вернул на берег — с квитанцией','The Water Spirit returned you ashore — with a receipt')}});}
  function afterDeath(G){K.cont(host,o,st.sc,function(ok){if(!ok){finish();return;}dead=0;st.splash=null;st.idle=0;st.iw=0;st.row=Math.floor(st.row/N.bank)*N.bank;st.on=null;st.x=G.W/2;st.shake=0;});}
  /* для бота и показа: безопасно ли прыгать сейчас */
  function safe(){var G=geo(),r=st.row+1;if(isBank(r))return true;var t=st.t+N.hop,q=find(G,r,st.x,t);if(!q)return false;if(under(q,t+.5))return false;
    var a=itX(G,L_(r),q,t);return st.x>a+G.u*.15&&st.x<a+q.len*G.u-G.u*.15;}
  function risk(){if(!st.on)return false;var G=geo(),ln=L_(st.row);return (ln.dir>0?G.W-st.x:st.x)<G.u*.7||under(st.on,st.t+.35)>0;}
  var demoQ=0;
  ZABK.loop(host,function(dt,now){var G=geo(),i;sprites(G);
    if(live&&!dead&&!over){st.t+=dt;
      if(st.hop>0){st.hop-=dt;if(st.hop<=0){st.hop=0;land(G);}}
      else if(!st.on&&!demo&&st.sc>=N.warm){st.idle+=dt;if(st.idle>5&&!st.iw){st.iw=1;say(['Водяной подкрадывается…','The Water Spirit is creeping up…'],2);}if(st.idle>8)fall(G,3);} // i18n:ru
      else if(st.on){var ln=L_(st.row);st.x=itX(G,ln,st.on,st.t)+st.off;if(st.x<-G.u*.1||st.x>G.W+G.u*.1)fall(G,1);else if(under(st.on,st.t)>=2)fall(G,2);}
      if(demo){demoQ-=dt;if(demoQ<=0&&st.hop<=0&&(safe()||risk())){jump(1);st.fing=.25;demoQ=.35;}if(st.sc>=7){demo=0;lanes={};reset();st.msg=1.6;}}}
    if(dead&&!over){st.dT+=dt;if(dead===1&&st.dT>.9){dead=2;afterDeath(G);}}
    var tc=st.row+(st.hop>0?1-st.hop/N.hop:0);st.cam+=(tc-st.cam)*Math.min(1,dt*7);
    st.shake=Math.max(0,st.shake-dt*30);st.flash=Math.max(0,st.flash-dt);if(st.fing>0)st.fing-=dt;if(st.msg>0)st.msg-=dt;
    g.setTransform(c.D,0,0,c.D,0,0);g.save();if(st.shake>0)g.translate((Math.random()-.5)*st.shake,(Math.random()-.5)*st.shake);
    var gr=g.createLinearGradient(0,0,0,G.H);gr.addColorStop(0,'#3a7fb8');gr.addColorStop(1,'#245a8a');g.fillStyle=gr;g.fillRect(0,0,G.W,G.H);
    var r0=Math.floor(st.cam)-2,r1=Math.ceil(st.cam+G.H/G.rh)+1,r,y;
    for(r=r0;r<=r1;r++){if(r<0)continue;y=G.by-(r-st.cam)*G.rh-G.rh/2;if(y>G.H||y<-G.rh)continue;
      if(isBank(r)){g.drawImage(spr.bank,0,y,G.W,G.rh);continue;}
      var ln=L_(r),k,wo=((ln.dir*ln.v*G.u*st.t*.6)%(G.u*2)+G.u*2)%(G.u*2);for(k=-1;k<G.W/(G.u*2)+1;k++)g.drawImage(spr.wave,k*G.u*2+wo-G.u*2,y+G.rh*.62,G.u*2,G.rh*.3);
      for(k=0;k<ln.it.length;k++){var q=ln.it[k],ax=itX(G,ln,q,st.t),p=ln.per*G.u,j;for(j=0;j<2;j++){var xx=ax-j*p;if(xx>G.W||xx+q.len*G.u<0)continue;
        if(q.k==='l')g.drawImage(logSpr(G,q.len),xx,y+G.rh*.2,q.len*G.u,G.rh*.6);
        else{var un=under(q,st.t);if(un===2){g.globalAlpha=.25;}var jx=un===1&&!o.calm?Math.sin(now*40)*2:0;g.drawImage(spr.ice,xx+jx,y+G.rh*.19,1.25*G.u,G.rh*.62);g.globalAlpha=1;}}}}
    /* Садко */
    var hp=G.rh*1.25,hy=G.by-(st.row-st.cam)*G.rh-hp*.3,ja=0;if(st.hop>0){ja=1-st.hop/N.hop;hy-=G.rh*ja+Math.sin(ja*Math.PI)*G.rh*.5;}
    if(st.splash){st.splash.t+=dt;var sa=Math.max(0,1-st.splash.t);g.strokeStyle='rgba(230,245,255,'+sa+')';g.lineWidth=3;g.beginPath();g.ellipse(st.splash.x,G.by,G.u*(.3+st.splash.t),G.u*(.1+st.splash.t*.3),0,0,TAU);g.stroke();
      if(dead)ZABK.put(g,'vod',st.splash.x,G.by-G.rh*.3*Math.min(1,st.dT*2),G.rh*1.4,c.D,{a:Math.min(1,st.dT*2)});}
    if(!dead||st.dT<.15){g.fillStyle='rgba(10,30,50,.3)';g.beginPath();g.ellipse(st.x,G.by-(st.row-st.cam)*G.rh+G.rh*.12,hp*.25,hp*.07,0,0,TAU);g.fill();
      ZABK.put(g,ART.h_sad_0?(st.hop>0&&ART.h_sad_1?'h_sad_1':'h_sad_0'):'h_dob_0',st.x,hy,hp,c.D,{sx:1,sy:1});ZABK.put(g,'i_gusli',st.x+hp*.22,hy+hp*.08,hp*.38,c.D,{rot:-.3+Math.sin(now*6)*.08});}
    ZABK.parts(g,P,dt);
    if(bub){bub.a-=dt;K.say(g,bub.t,G.W/2,K.top()+150,G.W,bub.a);if(bub.a<=0)bub=null;}
    g.restore();
    if(st.flash>0){g.fillStyle='rgba(120,200,255,'+(st.flash*.4)+')';g.fillRect(0,0,G.W,G.H);}
    if(live&&!demo&&st.sc<N.warm){g.globalAlpha=.6+.25*Math.sin(now*6);if(zabPC())zabKeycap(g,G.W/2,G.H-62,L('Пробел','Space'),28);else K.finger(g,G.W*.72,G.H-80,0);g.globalAlpha=1;
      K.tag(g,G.W,G.H-24,st.msg>0?L('Теперь ты!','Your turn!'):L('Разминка: упал — не беда','Warm-up: falling is fine'));}
    if(demo){K.tag(g,G.W,K.top()+116,L('Смотри: жми, когда бревно прямо перед Садко','Watch: tap when a log is right ahead'));K.finger(g,G.W*.72,G.H-80,st.fing>0);}
  });
  ZABK.tap(c,host,function(){jump();});
  zabKeys(host,function(k){if(k===' '||k==='ArrowUp'||k==='w'||k==='W'||k==='ц'||k==='Ц'||k==='Enter'){jump();return true;}}); // i18n:ru
  reset();host.dbg={st:function(){return st;},jump:jump,safe:safe,risk:risk,live:function(){return live&&!dead&&st.hop<=0;},demo:function(){return demo;}};
  ZREC.start(host,o,function(){H=ZREC.hud(host,o);lanes={};reset();live=true;if(o.first&&!o.again){demo=1;demoQ=.6;}});
}
/* бот без экрана: k — умение (точность и смелость). Модель: на каждой реке шанс сорваться растёт со скоростью полосы */
function sim(o,k,seed){var r=o&&o.rnd||Math.random,sc=0,i;for(i=1;i<2000;i++){if(i%N.bank===0){sc++;continue;}
    var v=Math.min(N.vMax,N.v0+N.vK*i),lm=Math.max(N.lenMin,N.len0-N.lenK*i),gm=Math.min(N.gapMax,N.gap0+N.gapK*i),ice=i>=N.ice0?N.ice:0,
      p=.004+(1-k)*.05*(v/(lm*.8))*(1+gm/3)+ice*(1-k)*.06;if(sc>=N.warm&&r()<p)break;sc++;}
  return {score:sc,tier:ZREC.tier('smorod',sc)};}
ZAB_REG({id:'smorod',kind:'lov',n:zabN('Через Смородину','Across the Smorodina'),run:run,sim:sim});
})();
