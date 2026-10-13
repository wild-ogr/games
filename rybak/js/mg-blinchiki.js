'use strict';
/* rb2-LOVA №4 «Блинчики» (js/mg-blinchiki.js, id 'blinchiki', флаг lov-blinchiki) — первая ловкостная для новичка (после 1-й рыбалки, вход — MGREC).
   Петрович на спор кидает камешки по воде: жми в миг, когда камень касается воды (тень темнеет, внизу горит «ЖМИ!») — он подпрыгнет ещё.
   Каждый прыжок короче и быстрее, окно уже. 3 камешка за партию, рекорд — блинчики за три броска. Рано нажал — «бульк».
   Понятность (замечание владельца к «Скакалке» Зины): перед партией — показ (камень летит сам, палец жмёт), у новичка первые 2 прыжка первого камня —
   сами с пальцем, а первый камень, утонувший раньше 3 прыжков, — разминка (не считается, Петрович даёт ещё один). Зимой — «Шайба по льду» (флаг lov-wint).
   Числа: окно 0,13 с → 0,055 с (−0,006 за прыжок; спокойный режим ×1,35), период 0,95 с ×0,92 за прыжок (не меньше 0,3 с), до 30 прыжков на камень.
   Баланс ботом: LK.simMany('blinchiki',k,200) — LOVA-tools/bal.py. */
(function(){
if(typeof MG_REG!=='function'||typeof R2==='undefined')return;
var ID='blinchiki',KIT=window.LK?Promise.resolve():R2.need('js/mg-lkit.js'),G0=null;
function g(){return G0||(G0=window.LK.add(def(window.LK)));}
MG_REG({id:ID,kind:'lov',n:{ru:'Блинчики',en:'Skipping stones'},icon:'star',
  run:function(h,o){KIT.then(function(){window.LK.run(g(),h,o);},function(){try{h.quit();}catch(e){}});},
  bot:function(lv,o){return window.LK?window.LK.bot(g(),lv,o):null;}});
KIT.then(g,function(){});
function def(K){
var TAU=Math.PI*2;
var SAY10=[['Пять! Неплохо.','Five! Not bad.'],['Десять! Ого!','Ten! Wow!'],['Пятнадцать! Как на Волге!','Fifteen! Like on the Volga!'],['Двадцать! Петрович снял кепку.','Twenty! Petrovich takes off his cap.']];
function Lx(a){return L(a[0],a[1]);}
var G={id:ID,amb:'water',n:['Блинчики','Stone skipping'],who:L('Петрович','Petrovich'),
 u:LANG==='en'?['skip','skips','skips']:['блинчик','блинчика','блинчиков'],mid:20,md:[10,20,32],
 short:['Жми, когда камень коснётся воды!','Tap when the stone touches the water!'],
 winterShort:['Жми, когда шайба коснётся льда!','Tap when the puck touches the ice!'],
 rules:[['Камень прыгает по воде. Жми, когда он касается воды.','The stone skips over the water. Tap when it touches the water.'],
   ['Тень темнеет и горит «ЖМИ!» — вот этот миг.','The shadow darkens and “TAP!” lights up — that’s the moment.'],
   ['Три камешка. Рано нажал — «бульк».','Three stones. Tap too early — splash.']],
 ctl:[['M',L('Жми — когда коснётся','Tap — when it touches'),L('Пробел','Space')]],
 winter:{n:['Шайба по льду','Puck on ice'],rules:[['Шайба скачет по кочкам льда. Жми, когда она коснётся льда.','The puck bounces over the ice. Tap when it touches the ice.'],
   ['Тень темнеет и горит «ЖМИ!» — вот этот миг.','The shadow darkens and “TAP!” lights up — that’s the moment.'],['Три шайбы. Рано нажал — шайба в сугроб.','Three pucks. Too early — into the snowdrift.']]},
 init:function(st,fr){st.t=0;st.sc=0;st.stone=0;st.wait=.7;st.rip=[];st.scroll=0;st.warm=fr.novice&&!fr.demo?1:0;this.stoneNew(st,fr);
   if(!fr.demo){var n=Math.max(10,fr.rec||0);fr.say(fr.winter?L('Спорим, больше '+n+' кочек шайба не пройдёт?','Bet the puck won’t clear more than '+n+'?'):L('Спорим, больше '+n+' блинчиков не сделаешь?','Bet you can’t do more than '+n+' skips?'));}},
 stoneNew:function(st,fr){st.T0=.95;st.T=st.T0;st.tt=0;st.n=0;st.spoil=0;st.sink=0;st.auto=(st.stone===0&&fr.novice&&!fr.demo)?2:0;},
 win:function(st,fr){return Math.max(.055,.13-st.n*.006)*(fr.calm?1.35:1);},
 step:function(st,dt,inp,fr){var W=fr.W;st.t+=dt;var self=this;
  var hud=function(){fr.score(st.sc+' · '+(fr.winter?L('шайба ','puck '):L('камень ','stone '))+Math.min(3,st.stone+1)+'/3');};
  if(st.wait>0){st.wait-=dt;hud();return;}
  if(st.sink){st.sink-=dt;if(st.sink<=0){
      if(st.warm===2){st.warm=0;self.stoneNew(st,fr);st.wait=.8;return;}
      st.stone++;if(st.stone>=3){fr.end(st.sc,fr.winter?L('Три шайбы','Three pucks'):L('Три камешка','Three stones'));return;}self.stoneNew(st,fr);st.wait=.7;}return;}
  st.tt+=dt;var win=this.win(st,fr),spd=W*.55/st.T;st.scroll+=spd*dt;
  for(var i=0;i<st.rip.length;i++){st.rip[i].x-=spd*dt;st.rip[i].a+=dt;}st.rip=st.rip.filter(function(r){return r.a<1.4;});
  function bounce(){st.n++;st.sc++;st.rip.push({x:W*.52,a:0});st.T=Math.max(.3,st.T*.92);st.tt=0;fr.snd('plop');
    if(st.n>=30){st.sink=1.2;fr.say(L('Тридцать! Дальше камень сам не летит — вот это бросок!','Thirty! The stone can’t go further — what a throw!'));return;}
    if(st.n%5===0)fr.say(Lx(SAY10[Math.min(3,st.n/5-1)]));}
  if(st.auto&&st.tt>=st.T){st.auto--;bounce();fr.finger();return;}
  if(fr.edge('M')&&!st.auto&&!st.spoil){
    if(st.tt>=st.T-win&&st.tt<=st.T+win){var ex=Math.abs(st.T-st.tt)<win*.3;bounce();if(ex&&st.n>3)fr.pop(L('Точно!','Spot on!'));return;}
    if(st.tt<st.T-win&&st.tt>st.T-win*3.5){st.spoil=1;}} // совсем рано (камень высоко) — не считаем: случайное касание
  if(st.spoil||st.tt>st.T+win){st.rip.push({x:W*.52,a:0,big:1});fr.snd('splash');fr.shake(3);
    var why=st.spoil?L('Бульк. Рано нажал.','Splash. Too early.'):L('Бульк! Опоздал.','Splash! Too late.');
    if(st.warm===1&&st.stone===0&&st.n<3){st.warm=2;fr.say(why+' '+L('Разминка — не считается. Держи ещё камешек!','Warm-up — doesn’t count. Here’s another stone!'));st.sc-=st.n;}
    else{if(st.warm===1)st.warm=0;fr.say(why);}
    st.sink=1;}
  hud();},
 bot:function(st,fr,k,mem){if(st.wait>0||st.sink||st.auto){mem.p=0;return {};}
  if(mem.n!==st.n||mem.s!==st.stone){mem.n=st.n;mem.s=st.stone;mem.p=0;var w=this.win(st,fr),r=fr.rnd(-1,1)+fr.rnd(-1,1);
    mem.e=k>=1?-.01:r*(.016+.13*(1-k))*(1+st.n*.03);if(k<1&&fr.rnd(0,1)<.012*(1-k))mem.e=-w*2;}
  if(!mem.p&&st.tt>=st.T+mem.e){mem.p=1;return {M:1};}return {};},
 draw:function(g,st,fr){var W=fr.W,H=fr.H,wy=H*.76,A=fr.art,wt=fr.winter,t=st.t;
  fr.layer(wt?'bw':'bs',function(x,w,h){var wy2=h*.5;
    if(A&&A.sky)A.sky(x,w,h,wy2,wt?'day':'evening',0);else{x.fillStyle=wt?'#cfe3f2':'#f7b97a';x.fillRect(0,0,w,wy2);}
    // дальний берег
    x.fillStyle=wt?'#e9f1f7':'#4f6f4c';x.beginPath();x.moveTo(0,wy2);for(var i=0;i<=24;i++){var px=i*w/24;x.lineTo(px,wy2-h*.035-Math.abs(Math.sin(i*1.7))*h*.03);}x.lineTo(w,wy2);x.fill();
    for(var j=0;j<w/16+1;j++){var tx=j*16+((j*37)%9),th=h*(.05+((j*53)%7)/100);x.fillStyle=wt?'#4c6a5c':'#3d5a3c';x.beginPath();x.moveTo(tx-7,wy2-h*.03);x.lineTo(tx,wy2-h*.03-th);x.lineTo(tx+7,wy2-h*.03);x.fill();
      if(wt){x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.moveTo(tx-3,wy2-h*.03-th*.55);x.lineTo(tx,wy2-h*.03-th);x.lineTo(tx+3,wy2-h*.03-th*.55);x.fill();}}
    var gr=x.createLinearGradient(0,wy2,0,h);if(wt){gr.addColorStop(0,'#dcebf5');gr.addColorStop(1,'#a9c8dc');}else{gr.addColorStop(0,'#6fa4b8');gr.addColorStop(1,'#2d5f73');}x.fillStyle=gr;x.fillRect(0,wy2,w,h-wy2);
    if(!wt){for(var q=0;q<16;q++){var qy=wy2+6+q*q*1.6,qa=.5*(1-q/16);if(qy>h)break;x.fillStyle='rgba(255,214,150,'+qa+')';x.beginPath();x.ellipse(w*.79+Math.sin(q*2.3)*6,qy,w*(.05+q*.004),1.6+q*.15,0,0,TAU);x.fill();}}
    // ближний берег слева: песок, камыш
    x.fillStyle=wt?'#f4f8fb':'#c9b48a';x.beginPath();x.moveTo(0,h);x.lineTo(0,h*.8);x.quadraticCurveTo(w*.2,h*.82,w*.34,h);x.fill();x.fillStyle=wt?'#dfeaf2':'#b39c70';x.beginPath();x.moveTo(0,h*.8);x.quadraticCurveTo(w*.2,h*.82,w*.34,h);x.lineTo(w*.3,h);x.quadraticCurveTo(w*.18,h*.84,0,h*.83);x.fill();
    if(A&&A.grass&&!wt)A.grass(x,w*.01,h*.815,w*.08,h*.08,0,'#5d7d3a',12,3);});
  // рябь/царапины, бегущие назад
  var o2=st.scroll%60;g.strokeStyle=wt?'rgba(255,255,255,.55)':'rgba(255,255,255,.25)';g.lineWidth=1;
  for(var y=H*.53;y<H;y+=22)for(var xx=-60-o2+(y%44);xx<W;xx+=60){g.beginPath();g.moveTo(xx,y);g.lineTo(xx+18,y);g.stroke();}
  for(var i=0;i<st.rip.length;i++){var r=st.rip[i];g.strokeStyle=wt?'rgba(120,150,175,'+(.7-r.a*.45)+')':'rgba(255,255,255,'+(.8-r.a*.5)+')';g.lineWidth=r.big?3:2;g.beginPath();g.ellipse(r.x,wy+2,(r.big?16:10)+r.a*40,3+r.a*9,0,0,TAU);g.stroke();}
  if(A&&A.petr)A.petr(g,W*.13,H*.98,Math.min(H*.2,W*.36),t,{arm:st.sink?'shrug':(st.n>=10?'laugh':'point'),face:st.n>=10?'wow':'smile',look:1});
  if(!st.sink&&st.wait<=0){var u=Math.min(1.08,st.tt/st.T),hh=H*.36*Math.pow(st.T/st.T0,1.2),x=W*.52,yy=wy-hh*4*u*(1-u)-4;
    var k=K.clamp((u-.55)/.45,0,1);g.fillStyle='rgba(10,30,40,'+(.15+k*.55)+')';g.beginPath();g.ellipse(x,wy+3,6+k*12,2+k*3,0,0,TAU);g.fill();
    var win=this.win(st,fr),inW=st.tt>=st.T-win;
    if(u>.8&&!st.auto){g.fillStyle=inW?'#3fdc7a':'rgba(63,220,122,.45)';K.rr(g,x-40,wy+16,80,30,11);g.fill();g.fillStyle='#062611';g.font='800 17px '+fr.font;g.textAlign='center';g.fillText(L('ЖМИ!','TAP!'),x,wy+37);}
    g.save();g.translate(x,yy);g.rotate(wt?0:Math.sin(t*10)*.3);
    if(wt){g.fillStyle='#16191d';g.beginPath();g.ellipse(0,2,11,4.5,0,0,TAU);g.fill();g.fillRect(-11,-2,22,4);g.fillStyle='#2b3036';g.beginPath();g.ellipse(0,-2,11,4.5,0,0,TAU);g.fill();}
    else{g.fillStyle='#7d8086';g.beginPath();g.ellipse(0,0,10,5.5,0,0,TAU);g.fill();g.fillStyle='#b9bcc1';g.beginPath();g.ellipse(-2,-1.6,5.5,2.2,0,0,TAU);g.fill();}
    g.restore();
    g.fillStyle='#fff';g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=4;g.font='800 42px '+fr.font;g.textAlign='center';var ny=Math.max(H*.24,150);g.strokeText(String(st.n),x,ny);g.fillText(String(st.n),x,ny);}
  // камешки в запасе
  for(var s=0;s<3;s++){var used=s<st.stone;g.globalAlpha=used?.28:1;g.fillStyle=wt?'#1d2126':'#8c8f94';g.beginPath();g.ellipse(W-22-s*26,62,9,5,0,0,TAU);g.fill();}g.globalAlpha=1;
  if(st.warm===1&&st.stone===0&&!fr.demo){g.fillStyle='rgba(13,22,31,.7)';var by=Math.max(H*.24,150)+34;K.rr(g,W/2-Math.min(W/2-8,150),by-20,Math.min(W-16,300),30,12);g.fill();g.fillStyle='#fff';g.font='600 17px '+fr.font;g.textAlign='center';g.fillText(L('Разминка — ошибка не в счёт','Warm-up — misses don’t count'),W/2,by);}
 }};
return G;}
})();
