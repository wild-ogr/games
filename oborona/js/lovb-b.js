'use strict';
/* ob2-LOVB · ловкостные «Отогрей заставы» (otogrey) и «Зарисуй нечисть» (zaris). Набор — js/lovb-kit.js (LVB). Грузится лениво.
   Флаги: lov-otogrey, lov-zaris. Журнал — hobby-analytics/release-i/oborona-boost2/logs/LOVB.md. Без ?. ?? .at(). */
(function(){if(typeof LVB==='undefined')return;var L=LVB.L,pick=LVB.pick;

/* =================== «Отогрей заставы» ===================
   Карачун дышит инеем на заставы. Держи палец на заставе — она оттаивает. Отогрел до конца — застава «ожила» (+1) и пуляет снежком в Карачуна.
   Иней дошёл до верха — застава заледенела (−❤). 40 секунд, Карачун дышит всё чаще, с 15-й секунды — на две сразу.
   ПК: мышь (держи на заставе) или клавиши 1–4 (держать). */
if(!(typeof OB2!=='undefined'&&OB2.off('lov-otogrey'))){
var OT={T:40,N:4,WARM:1.15};
var OT_TW=['t_arch_2','t_mag_2','t_izba_2','t_arch_3'];
function otInit(st){st.tt=0;st.sc=0;st.tw=[];for(var i=0;i<OT.N;i++)st.tw.push({ice:0,hit:0,frz:0,shake:0,live:0,blow:0});st.next=1.2;st.cur=-1;st.balls=[];st.kb=0;}
function otRate(st){return Math.min(.6,.36+.008*st.tt)*(st.calm?.75:1);}
function otCreep(st){return Math.min(.2,.07+.004*st.tt)*(st.calm?.7:1);}
function otStep(st,dt,inp){st.tt+=dt;if(st.tt>=OT.T&&!st.demo){st.over='time';return;}
  /* какая застава под пальцем */
  if(inp.press&&inp.key!=null)st.hk=inp.key;
  var sel=-1;if(inp.hold){if(inp.drag)sel=otAt(st,inp.drag.x);else if(inp.tap)sel=otAt(st,inp.tap.x);else if(st.hk!=null)sel=st.hk;else sel=st.cur;}else st.hk=null;
  if(inp.tap&&inp.tap.x!=null)st.cur=otAt(st,inp.tap.x);if(inp.drag)st.cur=otAt(st,inp.drag.x);if(!inp.hold)st.cur=-1;else if(sel>=0)st.cur=sel;
  /* дыхание Карачуна */
  st.next-=dt;if(st.next<=0){var n=st.tt>15&&st.rnd()<.45?2:1,free=[];for(var i=0;i<OT.N;i++)if(!st.tw[i].frz&&st.tw[i].blow<=0)free.push(i);
    for(var k=0;k<n&&free.length;k++){var j=free.splice(Math.floor(st.rnd()*free.length),1)[0];st.tw[j].blow=1+st.rnd()*.6;}st.kb=.6;
    st.next=Math.max(.7,2.1-.035*st.tt)*(.8+.4*st.rnd());}
  st.kb=Math.max(0,st.kb-dt);
  for(var q=0;q<OT.N;q++){var t=st.tw[q];t.shake=Math.max(0,t.shake-dt);t.live=Math.max(0,t.live-dt);
    if(t.frz){t.frz-=dt;if(t.frz<=0){t.frz=0;t.ice=.35;}continue;}
    if(t.blow>0){t.blow-=dt;t.ice+=otRate(st)*dt;continue;}
    if(t.ice>0&&q!==sel)t.ice+=otCreep(st)*dt;
    if(q===sel&&t.ice>0){t.ice-=OT.WARM*dt;t.shake=.1;if(t.ice<=0){t.ice=0;if(t.hit>.25){st.sc++;st.scChanged=1;t.live=1;st.balls.push({q:q,u:0});st.snd('up');st.pop(pick(OT_G.say.good,st.rnd),'');}t.hit=0;}}
    if(t.ice>t.hit)t.hit=t.ice;
    if(t.ice>=1){t.ice=1;t.frz=2.2;t.blow=0;t.hit=0;st.err='frozen';}}
  for(var b=st.balls.length-1;b>=0;b--){st.balls[b].u+=dt*1.6;if(st.balls[b].u>=1){st.balls.splice(b,1);st.kh=.5;}}st.kh=Math.max(0,(st.kh||0)-dt);}
function otGeo(st){var W=st.W,H=st.H,cw=Math.min(W/OT.N,150),x0=(W-cw*OT.N)/2;return {cw:cw,x0:x0,y:H*.72,s:Math.min(cw*1.02,H*.26)};}
function otAt(st,x){var g=otGeo(st);var i=Math.floor((x-g.x0)/g.cw);return i<0||i>=OT.N?-1:i;}
function otBot(st,inp){var b=st.botQ!=null&&st.botQ>=0&&st.tw[st.botQ]&&st.tw[st.botQ].ice>0&&!st.tw[st.botQ].frz&&st.tw[st.botQ].blow<=0?st.botQ:-1,m=b>=0?Math.max(.85,st.tw[b].ice+.3):.15;for(var i=0;i<OT.N;i++){var t=st.tw[i];if(!t.frz&&t.blow<=0&&t.ice>m){m=t.ice;b=i;}}if(b>=0){var g=otGeo(st);inp.hold=true;inp.drag={x:g.x0+g.cw*(b+.5),y:g.y};st.botQ=b;return true;}st.botQ=-1;return false;}
function otSim(o,k){var rnd=o.rnd||Math.random,st={rnd:rnd,calm:false,W:360,H:600,snd:function(){},pop:function(){},scChanged:0},dt=1/30,err=0,lag=0;otInit(st);
  while(st.tt<OT.T&&err<3){var inp={hold:false};lag-=dt;var cb=st.bq>=0&&st.tw[st.bq];if(cb&&(cb.ice<=0||cb.frz))st.bq=-1;if(lag<=0){lag=.12+(1-k)*.5;var m=st.bq>=0?Math.max(.85,st.tw[st.bq].ice+.3):.1+(1-k)*.25;for(var i=0;i<OT.N;i++){var t=st.tw[i];if(!t.frz&&t.blow<=0&&t.ice>m){m=t.ice;st.bq=i;}}}
    if(st.bq>=0){inp.hold=true;st.hk=st.bq;}otStep(st,dt,inp);if(st.err){err++;st.err='';}}return {sc:st.sc};}
var OT_G={id:'otogrey',num:23,n:{ru:'Отогрей заставы',en:'Thaw the Outposts'},icon:'karach',who:'tour_nb0',nm:L('Воевода Ратибор','Commander Ratibor'),icoTxt:'🔥',
  title:L('Отогрей заставы','Thaw the Outposts'),rule:L('Карачун дышит инеем на заставы. Держи палец на заставе — оттает и «оживёт». Не дай инею дойти до верха!','Karachun breathes frost on the outposts. Hold your finger on one to thaw it back to life. Don’t let the frost reach the top!'),
  hint:{pc:L('Держи мышь на заставе или клавиши 1–4','Hold the mouse on an outpost or keys 1–4'),ph:L('Держи палец на заставе, которую морозят','Hold your finger on the outpost being frozen')},
  unit:L(['застава','заставы','застав'],['outpost','outposts','outposts']),cut:[7,13,19],warm:2,lives:3,drag:true,keys:{'1':0,'2':1,'3':2,'4':3},
  say:{start:[L('Карачун пришёл! Грей заставы, а то стрельцы в сосульки превратятся.','Karachun is here! Warm the outposts or the archers turn into icicles.'),L('Дует, старый! Держи палец на заставе — оттаивает.','The old man is blowing! Hold your finger on an outpost to thaw it.')],
    good:[L('Ожила!','Thawed!'),L('Стрельцы чихнули — и в бой!','The archers sneezed — and back to battle!'),L('Тёпленько!','Toasty!'),L('Снежком его!','Snowball him!')],
    warm:[L('Ничего, это разминка — оттаяли!','No worries, warm-up — thawed it out!')],
    bad:{frozen:L('Заледенела! Стрельцы в ледышках чихают.','Frozen solid! The archers are sneezing in their ice.'),time:L('Отбились! Карачун ушёл дуть в другие края.','We held! Karachun went to blow elsewhere.')}},
  init:function(st){otInit(st);},
  step:function(st,dt,inp){otStep(st,dt,inp);if(st.tt>14.9&&st.tt<15.1&&!st.said15){st.said15=1;st.msg(L('Разошёлся старик — на две сразу дует!','The old man’s at it — blowing on two at once!'),'norm');}},
  forgive:function(st){for(var i=0;i<OT.N;i++)if(st.tw[i].frz){st.tw[i].frz=0;st.tw[i].ice=.3;}},
  revive:function(st){for(var i=0;i<OT.N;i++){st.tw[i].frz=0;st.tw[i].ice=0;st.tw[i].blow=0;}st.next=1.5;st.tt=Math.min(st.tt,OT.T-12);},
  lose:function(){},
  bot:function(st,inp){return otBot(st,inp);},
  finger:function(st){var g=otGeo(st),q=st.botQ!=null&&st.botQ>=0?st.botQ:1;return {x:g.x0+g.cw*(q+.5),y:g.y-g.s*.15};},
  label:function(st){return L('Отогрето: ','Thawed: ')+LVB.pl(st.sc,OT_G.unit);},
  info:function(st){return '<span>⏱ '+Math.max(0,Math.ceil(OT.T-st.tt))+'</span>';},
  draw:function(st,c){var W=st.W,H=st.H,g=otGeo(st);
    var bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#5a78a8');bg.addColorStop(.6,'#bcd4ee');bg.addColorStop(1,'#eef6ff');c.fillStyle=bg;c.fillRect(0,0,W,H);
    c.fillStyle='#dfeaf6';c.beginPath();c.moveTo(0,H*.6);for(var x=0;x<=W;x+=W/6)c.lineTo(x,H*.6-H*.08*Math.abs(Math.sin(x*.013+1)));c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.fill();
    c.fillStyle='#f6fbff';c.fillRect(0,g.y+g.s*.32,W,H);
    /* снежинки */
    if(!st.calm){c.fillStyle='rgba(255,255,255,.8)';for(var i=0;i<30;i++){var sx=(i*97+st.tt*20*(1+i%3))%W,sy=(i*53+st.tt*(30+i%4*12))%H;c.fillRect(sx,sy,2,2);}}
    /* Карачун наверху */
    var kx=W/2+(st.calm?0:Math.sin(st.tt*.8)*W*.18),ky=H*.18,ks=Math.min(H*.3,W*.42);st.put('karach',kx,ky,ks,{sx:st.kh?.9:1,sy:st.kh?1.1:1});
    if(st.kh)LVB.text(c,L('Ай!','Ouch!'),kx+ks*.35,ky-ks*.3,20,{col:'#fff'});
    /* дыхание: струя инея к заставам */
    for(var q=0;q<OT.N;q++){var t=st.tw[q];if(t.blow>0&&!t.frz){var tx=g.x0+g.cw*(q+.5),ty=g.y-g.s*.3;c.save();c.globalAlpha=.55;var gr=c.createLinearGradient(kx,ky,tx,ty);gr.addColorStop(0,'rgba(220,240,255,.1)');gr.addColorStop(1,'rgba(200,230,255,.9)');
        c.fillStyle=gr;c.beginPath();c.moveTo(kx-6,ky+ks*.12);c.lineTo(tx-g.cw*.32,ty);c.lineTo(tx+g.cw*.32,ty);c.lineTo(kx+6,ky+ks*.12);c.closePath();c.fill();c.restore();
        if(!st.calm){c.fillStyle='#fff';for(var p=0;p<5;p++){var u=((st.tt*1.8+p*.2)%1);c.fillRect(kx+(tx-kx)*u+Math.sin(p*7+st.tt*5)*g.cw*.12*u,ky+ks*.12+(ty-ky-ks*.12)*u,3,3);}}}}
    /* заставы с инеем */
    for(var j=0;j<OT.N;j++){var w=st.tw[j],cx=g.x0+g.cw*(j+.5),sh=w.shake&&!st.calm?Math.sin(st.tt*60)*1.5:0,on=st.cur===j||st.demo&&st.botQ===j;
      if(on){var hg=c.createRadialGradient(cx,g.y,4,cx,g.y,g.s*.7);hg.addColorStop(0,'rgba(255,170,60,.55)');hg.addColorStop(1,'rgba(255,140,40,0)');c.fillStyle=hg;c.fillRect(cx-g.s,g.y-g.s,g.s*2,g.s*2);}
      st.put(OT_TW[j%OT_TW.length],cx+sh,g.y,g.s*(w.live?1+.08*Math.sin(w.live*20):1));
      if(w.ice>0||w.frz){var lv=w.frz?1:w.ice,bw0=g.s*.78,full=g.s*.95,ih=full*lv,bot=g.y+g.s*.36,top=bot-ih;c.save();c.globalAlpha=w.frz?.82:.6;
        var ig=c.createLinearGradient(cx-bw0/2,0,cx+bw0/2,0);ig.addColorStop(0,'#d6efff');ig.addColorStop(.5,'#f4fbff');ig.addColorStop(1,'#b8dcf6');c.fillStyle=ig;LVB.rr(c,cx-bw0/2,top,bw0,ih,8);c.fill();
        c.globalAlpha=1;c.strokeStyle='#ffffff';c.lineWidth=2.5;c.stroke();c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=3;c.beginPath();c.moveTo(cx-bw0*.25,bot-4);c.lineTo(cx-bw0*.05,Math.max(top+6,bot-ih*.6));c.moveTo(cx+bw0*.1,bot-4);c.lineTo(cx+bw0*.22,Math.max(top+6,bot-ih*.35));c.stroke();
        c.fillStyle='#e8f6ff';for(var z=0;z<4;z++){var ix=cx-bw0*.38+z*bw0*.25;c.beginPath();c.moveTo(ix,top+2);c.lineTo(ix+bw0*.1,top+2);c.lineTo(ix+bw0*.05,top+10+((z*7)%9));c.closePath();c.fill();}c.restore();}
      /* шкала инея */
      var bw=g.cw*.62,bx=cx-bw/2,by=g.y+g.s*.48;c.fillStyle='rgba(30,40,70,.35)';LVB.rr(c,bx,by,bw,9,5);c.fill();c.fillStyle=w.ice>.7||w.frz?'#4dabf7':'#a5d8ff';LVB.rr(c,bx,by,bw*(w.frz?1:w.ice),9,5);c.fill();
      if(w.frz)LVB.text(c,'❄',cx,g.y-g.s*.1,g.s*.4,{col:'#fff',olc:'#4a7aa8'});
      if(st.pc&&!st.demo)LVB.text(c,String(j+1),cx,by+24,15,{col:'#3a2410',ol:false});}
    for(var b=0;b<st.balls.length;b++){var bl=st.balls[b],sx0=g.x0+g.cw*(bl.q+.5),sy0=g.y-g.s*.4,u=bl.u,bx2=sx0+(kx-sx0)*u,by2=sy0+(ky-sy0)*u-Math.sin(u*Math.PI)*H*.12;c.fillStyle='#fff';c.strokeStyle='#7a9ac0';c.lineWidth=2;c.beginPath();c.arc(bx2,by2,7,0,7);c.fill();c.stroke();}}};
OT_G.sim=otSim;LVB.reg(OT_G);
}

/* =================== «Зарисуй нечисть» ===================
   Дед Пахом рисует нечисть в Бестиарий. Нечисть вертится: Кикимора корчит рожи, Леший шевелит ветками, кот Баюн лезет в кадр.
   Жми «Готово!», когда ВСЕ замерли. Шевелился кто-то — портрет «с рожей» (ошибка, конец после разминки); 6 с на портрет — иначе Пахом заснул.
   Каждые 3 портрета — ещё одна нечисть в кадре (до 5). Если пришли после боя с новой нечистью (o.ctx.foe) — она в кадре первой. */
if(!(typeof OB2!=='undefined'&&OB2.off('lov-zaris'))){
var ZR={TL:6};
var ZR_POOL=['kik','lesh','muh','wolf','bat','piy','vod','upyr','skel','voron','prizr','snow','rusalka','chert','rak'];
function zrNight(){try{if(typeof mgFestNow==='function'&&mgFestNow())return true;}catch(e){}return /[?&]mgskin=hw/.test(location.search);}
function zrSet(st){var n=Math.min(5,3+Math.floor(st.sc/3)),a=[],pool=ZR_POOL.filter(function(k){return typeof ART!=='undefined'&&ART[k];});
  try{var sn=typeof S!=='undefined'&&S.seen?Object.keys(S.seen):[];var known=pool.filter(function(k){return sn.indexOf(k)>=0;});if(known.length>=3)pool=known;}catch(e){}
  if(st.foe&&ART[st.foe])a.push(st.foe);while(a.length<n){var k=pool[Math.floor(st.rnd()*pool.length)];if(a.indexOf(k)<0||pool.length<n)a.push(k);}
  if(st.sc>=2&&st.rnd()<.5)a[a.length-1]='kot';
  st.mon=a.map(function(k,i){return {k:k,mv:0,cd:.4+st.rnd()*1.6,tw:0,kind:Math.floor(st.rnd()*3)};});st.pt=0;}
function zrStill(st){for(var i=0;i<st.mon.length;i++)if(st.mon[i].mv>0)return false;return true;}
function zrInit(st){st.tt=0;st.sc=0;st.book=[];st.flash=0;st.foe=st.o&&st.o.ctx&&st.o.ctx.foe||'';zrSet(st);}
function zrLvl(st){return Math.min(1,st.sc/12);}
function zrStep(st,dt,inp){st.tt+=dt;st.pt+=dt;st.flash=Math.max(0,st.flash-dt);var lv=zrLvl(st);
  for(var i=0;i<st.mon.length;i++){var m=st.mon[i];if(m.mv>0){m.mv-=dt;if(m.mv<=0){m.mv=0;m.cd=(.9-.45*lv)+st.rnd()*(1.4-.6*lv);}}
    else{m.cd-=dt;if(m.cd<.22&&m.cd>0)m.tw=1;else m.tw=0;if(m.cd<=0){m.mv=(.55+.5*lv)+st.rnd()*(.6+.5*lv);m.kind=Math.floor(st.rnd()*3);}}}
  if(st.pt>ZR.TL&&!st.demo){st.err='sleep';zrShot(st,false,true);return;}
  if(inp.press){var ok=zrStill(st);zrShot(st,ok);if(!ok)st.err='blur';}}
function zrShot(st,ok,sl){st.flash=.35;st.book.push({k:st.mon.map(function(m){return m.k;}),ok:ok,sl:sl});if(st.book.length>6)st.book.shift();
  if(ok){st.sc++;st.scChanged=1;st.snd('coin');st.pop(pick([L('Как живые!','So lifelike!'),L('В книгу!','Into the book!'),L('Ровненько!','Neat!')],st.rnd),'');if(st.sc%3===0)st.msg(pick(ZR_G.say.good,st.rnd),'happy');}
  zrSet(st);}
function zrBot(st,inp){if(zrStill(st)&&st.pt>.35){var ok=true;for(var i=0;i<st.mon.length;i++)if(st.mon[i].cd<.18)ok=false;if(ok){inp.press=true;return true;}}return false;}
function zrSim(o,k){var rnd=o.rnd||Math.random,st={rnd:rnd,o:{ctx:{}},snd:function(){},pop:function(){},msg:function(){}},dt=1/30,n=0;var ART0=typeof ART!=='undefined';if(!ART0)return {sc:0};zrInit(st);
  var rt=0;while(n<60*90){n++;var inp={};rt-=dt;if(zrStill(st)&&st.pt>.3+(1-k)*.4){var ok=true;for(var i=0;i<st.mon.length;i++)if(st.mon[i].cd<.1+(1-k)*.35)ok=false;if(ok||rnd()<(1-k)*.02)inp.press=true;}
    zrStep(st,dt,inp);if(st.err)break;}return {sc:st.sc};}
var ZR_G={id:'zaris',num:24,n:{ru:'Зарисуй нечисть',en:'Sketch the Monsters'},icon:'kik',who:'tour_nb2',nm:L('Дед Пахом','Grandpa Pakhom'),icoTxt:'🖌',alwaysIntro:false,
  title:L('Зарисуй нечисть','Sketch the Monsters'),rule:L('Дед Пахом рисует нечисть для Книги. Жми «Готово!», когда ВСЕ замерли. Шевельнулся кто — выйдет рожа!','Grandpa Pakhom sketches monsters for the Book. Press “Done!” when they ALL freeze. If anyone moves — you get a funny face!'),
  hint:{pc:L('Пробел или Enter — «Готово!»','Space or Enter — “Done!”'),ph:L('Жми «Готово!» внизу, когда все замерли','Press “Done!” below when everyone is still')},
  unit:L(['портрет','портрета','портретов'],['portrait','portraits','portraits']),cut:[3,7,12],warm:2,btn:{t:L('🖌 Готово!','🖌 Done!'),k:L('Пробел','Space')},
  say:{start:[L('Сидите смирно, голубчики, — в Книгу рисую!','Sit still, my dears — I’m drawing you for the Book!'),L('Кикимора, не корчи рожи! Леший, ветки опусти!','Kikimora, stop pulling faces! Leshy, branches down!')],
    good:[L('Как живые! Бабка моя испугается.','So lifelike! My old woman will be scared.'),L('Вот это портрет — хоть в терем вешай!','What a portrait — hang it in the tower!'),L('Баюн, брысь из кадра! А, ладно, пусть будет.','Bayun, out of the frame! Oh well, let him stay.')],
    warm:[L('Ничего, это разминка — бумаги полно!','No worries, warm-up — plenty of paper!')],
    bad:{blur:L('Шевельнулся! Вышла рожа — тоже в книгу, на последнюю страницу.','Someone moved! A funny face — it goes on the last page.'),sleep:L('Пахом задремал над листом… Жми, когда все замерли!','Pakhom dozed off over the page… Press when they’re all still!')}},
  init:function(st){zrInit(st);if(st.foe&&!st.demo)st.msg(L('Новенький! Зарисуем — и в Книгу нечисти.','A newcomer! Let’s sketch it for the Monster Book.'),'happy');},
  step:function(st,dt,inp){zrStep(st,dt,inp);},forgive:function(){},revive:function(st){zrSet(st);},
  bot:function(st,inp){return zrBot(st,inp);},finger:function(st){return {x:st.W/2,y:st.H-34};},
  label:function(st){return L('В Книге: ','In the Book: ')+LVB.pl(st.sc,ZR_G.unit);},
  info:function(st){return '<span>⏳ '+Math.max(0,Math.ceil(ZR.TL-st.pt))+'</span>';},
  draw:function(st,c){var W=st.W,H=st.H,nt=zrNight();
    var bg=c.createLinearGradient(0,0,0,H);if(nt){bg.addColorStop(0,'#1a1840');bg.addColorStop(1,'#3a3060');}else{bg.addColorStop(0,'#bfe3c8');bg.addColorStop(1,'#7fb46a');}c.fillStyle=bg;c.fillRect(0,0,W,H);
    if(nt){c.fillStyle='#fff6c0';c.beginPath();c.arc(W*.82,H*.12,Math.min(W,H)*.07,0,7);c.fill();c.fillStyle='#1a1840';c.beginPath();c.arc(W*.8,H*.11,Math.min(W,H)*.065,0,7);c.fill();}
    /* мольберт-рамка */
    var fw=Math.min(W*.94,560),fh=Math.min(H*.62,fw*.8),fx=(W-fw)/2,fy=H*.04;
    c.fillStyle=nt?'#2a2850':'#f6ecd2';LVB.rr(c,fx,fy,fw,fh,10);c.fill();c.strokeStyle='#6a4426';c.lineWidth=8;c.stroke();
    c.fillStyle=nt?'#3a3a6a':'#d8eac0';c.fillRect(fx+6,fy+fh*.62,fw-12,fh*.38-6);
    var n=st.mon.length,cw=(fw-20)/n,ms=Math.min(cw*.95,fh*.55);
    for(var i=0;i<n;i++){var m=st.mon[i],x=fx+10+cw*(i+.5),y=fy+fh*.6,o={},a=st.calm?.5:1;
      if(m.mv>0){var p=st.tt*14+i;if(m.kind===0){o.rot=Math.sin(p)*.25*a;}else if(m.kind===1){y-=Math.abs(Math.sin(p*.8))*ms*.18*a;}else{o.sx=1+Math.sin(p)*.15*a;o.sy=1-Math.sin(p)*.12*a;}}
      else if(m.tw&&!st.calm){o.rot=Math.sin(st.tt*40)*.04;}
      st.put(m.k,x,y-ms*.15,ms,o);
      if(m.mv>0&&!st.calm)LVB.text(c,m.kind===0?'😜':m.kind===1?'!':'~',x+ms*.3,y-ms*.6,ms*.28,{ol:false});}
    var still=zrStill(st);c.fillStyle=still?'rgba(80,200,90,.9)':'rgba(220,70,50,.9)';LVB.rr(c,W/2-70,fy+fh+8,140,30,15);c.fill();
    LVB.text(c,still?L('Замерли!','Frozen!'):L('Вертятся…','Fidgeting…'),W/2,fy+fh+23,16,{ol:false,col:'#fff'});
    if(st.flash>0){c.fillStyle='rgba(255,255,255,'+(st.flash*2)+')';c.fillRect(fx,fy,fw,fh);}
    /* страницы книги */
    var by=fy+fh+46,bs=Math.min(64,(H-by-8)*.9);if(bs>24){for(var b=0;b<st.book.length;b++){var bk=st.book[b],bx=W/2+(b-(st.book.length-1)/2)*(bs+6);c.fillStyle=bk.ok?'#fdf6e0':'#f0d8d0';c.fillRect(bx-bs/2,by,bs,bs*.8);c.strokeStyle='#6a4426';c.lineWidth=2;c.strokeRect(bx-bs/2,by,bs,bs*.8);
      for(var q=0;q<bk.k.length;q++)st.put(bk.k[q],bx-bs*.32+q*(bs*.64/Math.max(1,bk.k.length-1)),by+bs*.42,bs*.4,bk.ok?{}:{rot:.4,a:.7});if(!bk.ok)LVB.text(c,bk.sl?'💤':'😜',bx+bs*.3,by+bs*.15,bs*.3,{ol:false});}}}};
ZR_G.sim=zrSim;LVB.reg(ZR_G);
}

})();
