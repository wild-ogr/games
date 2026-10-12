'use strict';
/* gb-MG0 · мини-игра №1 «Двести грамм докторской» (ведущая — тётя Валя). Договор — шапка js/gmg-core.js; набор — js/gmg-ckit.js (GMGK); тексты — js/gmg-vesy-data.js.
   Основа — «Заправка до краёв» Выезда (держи-отпусти). Пять покупателей просят «двести грамм», «полкило»… Держишь кнопку (Пробел) — Валя режет/сыплет,
   стрелка весов бежит быстрее и быстрее; отпустил — кусок ещё чуть «досыпается» (≈0,08 с) и весы встают. Очки за покупателя: ±5 г — 3, ±20 — 2, ±50 — 1.
   Всего до 15; звёзды 5/8/11. Ни чтения, ни счёта — первая игра, на 5-м уровне. Образец для MGA–MGC. */
(function(){if(typeof GMG_REG!=='function')return;
var ID='vesy',N=5,CUT=[5,8,11],MAXW=1000,V0=90,VK=.15,RAMP=.3,COAST=.08,CALMK=.75;
function D(){return (window.GMG&&GMG.data&&GMG.data.vesy)||null;}
function acc(d){var a=Math.abs(d);return a<=5?3:a<=20?2:a<=50?1:0;}
function fill(t,w){return String(t).replace('{w}',w).replace('{n}',w);}
/* пять заказов из пула: разные покупатели подряд, зерно игры (Затея дня — одна раскладка на всех) */
function plan(R,K){var d=D(),pool=K.shuffle(d.o,R),out=[],last='';
  for(var i=0;i<pool.length&&out.length<N;i++){if(pool[i][0]===last&&pool.length-i>N-out.length)continue;out.push(pool[i]);last=pool[i][0];}
  for(i=0;out.length<N;i++)out.push(pool[i%pool.length]);return out.map(function(o){return {kind:o[0],good:o[1],tgt:o[2],ask:o[3]};});}

function run(host,o){var K=window.GMGK,d=D(),T=host.T,R=o.rnd||Math.random,calm=K.calm(o),spd=calm?CALMK:1,rs=plan(R,K);
  var f=K.frame(host,o,{who:'valya'}),C=K.canvas(f.main,o),ctx=C.ctx,P=K.pops();
  var st={i:0,ph:'wait',w:0,v:0,hold:false,coast:0,shown:0,vel:0,res:[],score:0,fin:false,t:0,mood:0,msg:'',msgT:0};
  var bHold=K.btn(T(d.hold,'✋ Hold — slicing')+K.kc(T('Пробел','Space'),host),'green');bHold.style.cssText='flex:1;max-width:440px;min-height:64px;font-size:20px';
  function down(e){if(e)e.preventDefault();press(true);}function up(e){if(e)e.preventDefault();press(false);}
  bHold.addEventListener('pointerdown',down);bHold.addEventListener('pointerup',up);bHold.addEventListener('pointercancel',up);
  bHold.addEventListener('pointerleave',function(){if(st.hold)press(false);});bHold.addEventListener('contextmenu',function(e){e.preventDefault();});
  f.foot.appendChild(bHold);
  function cur(){return rs[Math.min(st.i,N-1)];}
  function startOne(){var r=cur();st.ph='wait';st.w=0;st.v=0;st.hold=false;st.coast=0;st.mood=0;st.walk=calm?0:1;
    f.prog(N,st.i,st.res);host.top((st.i+1)+' '+T(d.of,'of')+' '+N);f.say(T(r.ask,r.ask),'norm',r.kind);bHold.disabled=false;}
  function press(on){if(st.fin||st.ph!=='wait'&&st.ph!=='pour')return;if(on&&host.paused)return;
    if(on){if(st.hold||st.ph!=='wait')return;st.hold=true;st.ph='pour';bHold.classList.add('on');K.snd(host,'pick');}
    else{if(!st.hold)return;st.hold=false;bHold.classList.remove('on');st.ph='coast';st.coast=COAST;bHold.disabled=true;}}
  function judge(){var r=cur(),w=Math.round(st.w),dv=w-r.tgt,p=acc(dv);st.res.push(p);st.score+=p;st.ph='judge';st.mood=p>=2?1:p?0:-1;
    var J=d.judge,txt=fill(K.pick(p===3?J[3]:p===2?J[2]:p===1?J[1]:dv<0?J.under:J.over,R),w);
    f.say(T(txt,txt),p>=2?'happy':p?'norm':'sad','valya');f.prog(N,-1,st.res);
    K.snd(host,p>=2?'right':p?'tap':'wrong');if(p===3)K.snd(host,'coin');K.buzz(p>=2?15:30);
    P.add((dv>0?'+':'')+dv+' '+T(d.gram,'g'),st.sx||C.w*.6,(st.py||C.h*.2)-34,p>=2?'#2b8a3e':p?'#b7791f':'#c8401c',calm?20:24);
    st.next=calm?.9:1.4;}
  function next(){if(st.fin)return;if(st.i>=N-1){finish();return;}st.i++;startOne();}
  function finish(){if(st.fin)return;st.fin=true;var ex=st.res.filter(function(x){return x>=3;}).length;
    host.finish({sc:st.score,st:K.tier(st.score,CUT),label:T(st.score+' очк. из '+N*3+' · «как в аптеке»: '+ex+' из '+N,st.score+' pts of '+N*3+' · spot on: '+ex+' of '+N)});}
  K.keys(host,function(k,e,dn){if(k===' '||k==='Spacebar'){press(dn);return true;}return false;});
  /* физика: скорость растёт с весом (кусок толще — режется быстрее), разгон RAMP с; отпустил — «досыпка» COAST с с затуханием */
  function step(dt){var r=cur();if(st.walk>0)st.walk=Math.max(0,st.walk-dt*2.2);
    if(st.ph==='pour'){var top=(V0+st.w*VK)*spd;st.v=Math.min(top,st.v+top*dt/RAMP);st.w=Math.min(MAXW,st.w+st.v*dt);if(st.w>=MAXW){press(false);}}
    else if(st.ph==='coast'){var k=Math.min(dt,st.coast);st.w=Math.min(MAXW,st.w+st.v*k*.5);st.v*=Math.max(0,1-dt/COAST);st.coast-=dt;if(st.coast<=0){st.v=0;st.ph='settle';st.setT=calm?.05:.35;}}
    else if(st.ph==='settle'){st.setT-=dt;if(st.setT<=0)judge();}
    else if(st.ph==='judge'){st.next-=dt;if(st.next<=0)next();}
    // стрелка — с пружинкой (на спокойном — без)
    if(calm)st.shown=st.w;else{var a=(st.w-st.shown)*90-st.vel*12;st.vel+=a*dt;st.shown+=st.vel*dt;}
    void r;}
  /* ---- рисование ---- */
  function draw(dt,t){step(dt);st.t=t;if(C.w!==f.main.clientWidth||C.h!==f.main.clientHeight)C.fit();var c=ctx,W=C.w,H=C.h,r=cur(),A=host.art;
    var cy=H*.62;   // край прилавка
    var g=c.createLinearGradient(0,0,0,cy);g.addColorStop(0,'#f7e3bd');g.addColorStop(1,'#efd29f');c.fillStyle=g;c.fillRect(0,0,W,cy);
    c.fillStyle='rgba(160,103,58,.12)';for(var x=0;x<W;x+=46)c.fillRect(x,0,2,cy);   // плитка стены
    c.fillStyle='#8d5a2b';c.fillRect(0,cy,W,H-cy);c.fillStyle='#a8703a';c.fillRect(0,cy-6,W,10);c.fillStyle='rgba(0,0,0,.12)';c.fillRect(0,cy+4,W,3);
    var wide=W>H*1.1,ph=Math.min(H*.52,W*(wide?.3:.4)),px=W*.2-st.walk*W*.5;
    // покупатель за прилавком
    if(st.ph!=='done'&&r)A.person(c,r.kind,px,cy+ph*.1,ph,st.mood,t,st.ph==='wait'?1:0);
    c.fillStyle='#8d5a2b';c.fillRect(0,cy+2,W*.42,H-cy);c.fillStyle='#a8703a';c.fillRect(0,cy-6,W*.42,10);
    // весы: циферблат на подставке, чаша сверху
    var R=Math.max(54,Math.min(W*(wide?.17:.22),H*.24)),sx=W*(wide?.62:.66),sy=cy-R*1.25;st.sx=sx;st.sy=sy;
    c.fillStyle='#e9ecef';K.rr(c,sx-R*.9,cy-R*.4,R*1.8,R*.47,10);c.fill();c.fillStyle='#ced4da';c.fillRect(sx-R*.9,cy-R*.02,R*1.8,R*.08);
    c.fillStyle='#dee2e6';c.fillRect(sx-R*.12,sy+R*.9,R*.24,cy-sy-R*1.1);
    c.fillStyle='#495057';c.beginPath();c.arc(sx,sy,R+7,0,7);c.fill();c.fillStyle='#fffdf4';c.beginPath();c.arc(sx,sy,R,0,7);c.fill();
    var A0=Math.PI*.75,AS=Math.PI*1.5;
    // цель — зелёная дуга ±20 г, ярче ±5 г
    if(r&&st.ph!=='done'){var ta=A0+r.tgt/MAXW*AS,d20=20/MAXW*AS,d5=5/MAXW*AS;c.lineCap='butt';
      c.strokeStyle='rgba(43,138,62,.35)';c.lineWidth=R*.16;c.beginPath();c.arc(sx,sy,R*.84,ta-d20,ta+d20);c.stroke();
      c.strokeStyle='rgba(43,138,62,.85)';c.beginPath();c.arc(sx,sy,R*.84,ta-d5-.01,ta+d5+.01);c.stroke();}
    c.strokeStyle='#343a40';c.fillStyle='#343a40';c.textAlign='center';c.textBaseline='middle';c.font='700 '+Math.round(R*.17)+'px -apple-system,"Segoe UI",Roboto,sans-serif';
    for(var i=0;i<=20;i++){var a=A0+i*AS/20,big=i%2===0;c.lineWidth=big?3:1.5;c.beginPath();c.moveTo(sx+Math.cos(a)*R*(big?.74:.8),sy+Math.sin(a)*R*(big?.74:.8));c.lineTo(sx+Math.cos(a)*R*.95,sy+Math.sin(a)*R*.95);c.stroke();
      if(i%4===0)c.fillText(i*50,sx+Math.cos(a)*R*.56,sy+Math.sin(a)*R*.56);}
    var na=A0+Math.max(0,Math.min(MAXW*1.02,st.shown))/MAXW*AS;c.strokeStyle='#c62828';c.lineWidth=Math.max(3,R*.05);c.lineCap='round';c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+Math.cos(na)*R*.9,sy+Math.sin(na)*R*.9);c.stroke();
    c.fillStyle='#c62828';c.beginPath();c.arc(sx,sy,R*.08,0,7);c.fill();
    var bx=R*.62,by2=cy-R*.3,bh=R*.3;c.fillStyle='#2d3436';K.rr(c,sx-bx/2,by2,bx,bh,6);c.fill();c.fillStyle='#ffd36e';c.font='800 '+Math.round(bh*.66)+'px -apple-system,"Segoe UI",Roboto,sans-serif';c.fillText(Math.round(st.ph==='wait'?0:st.w)+' '+T(d.gram,'g'),sx,by2+bh*.54);
    // чаша и товар: растёт с весом
    var pY=sy-R-14;st.py=pY;c.fillStyle='#adb5bd';c.beginPath();c.ellipse(sx,pY,R*1.05,R*.16,0,0,7);c.fill();c.fillStyle='#ced4da';c.beginPath();c.ellipse(sx,pY-3,R*1.0,R*.12,0,0,7);c.fill();
    if(r&&st.w>1&&st.ph!=='done'){var gs=Math.min(R*1.3,R*.45+Math.sqrt(st.w)*R*.035);A.good(c,r.good,sx,pY-2,gs);}
    // ценник «Нужно: N г»
    if(r&&st.ph!=='done'){var tx=fill(T(d.need,'Need: {n} g'),r.tgt);c.font='800 '+Math.round(Math.max(16,Math.min(22,W/20)))+'px -apple-system,"Segoe UI",Roboto,sans-serif';
      var tw=c.measureText(tx).width+24,ty=cy+Math.min(46,(H-cy)*.45);c.fillStyle='#fffaf0';K.rr(c,sx-tw/2,ty-18,tw,36,10);c.fill();c.strokeStyle='#e0a33a';c.lineWidth=2;c.stroke();
      c.fillStyle='#8b2a14';c.fillText(tx,sx,ty+1);}
    // подсказка на первом покупателе
    if(st.ph==='wait'&&st.i===0&&!st.res.length){var hs=K.pc(host)?T(d.hintPC,'Hold Space, let go to weigh'):T(d.hintTouch,'Hold the button below and let go in time');
      c.font='700 '+Math.max(13,Math.min(17,W/26))+'px -apple-system,"Segoe UI",Roboto,sans-serif';var hw=Math.min(W-16,c.measureText(hs).width+20),hy=H-24;
      c.fillStyle='rgba(59,42,26,.78)';K.rr(c,W/2-hw/2,hy-14,hw,28,14);c.fill();c.fillStyle='#fff';c.fillText(hs,W/2,hy,hw-12);}
    P.draw(c,dt);c.textAlign='left';c.textBaseline='alphabetic';c.lineCap='butt';}
  K.loop(host,draw);f.say(T('Покупатели ждут — пятеро у весов!','Five customers at the scales!'),'happy','valya');
  host.bot=function(k){var r=cur();if(st.fin||!r)return;if(st.ph==='wait'&&!host.paused){press(true);st.botE=(1-k)*60*(R()*2-1);return;}
    if(st.ph==='pour'){var lead=st.v*COAST*.5;if(st.w+lead>=r.tgt+(st.botE||0))press(false);}};
  st.api={press:press,next:next,st:st};window.__gm0_vesy=st;
  K.intro(host,{who:'valya',text:T(d.intro,d.intro),hint:K.pc(host)?T(d.hintPC,'Space — hold'):T(d.hintTouch,'Hold the button'),btn:T('К весам','To the scales')},startOne);}
/* бот баланса: промах в граммах ~ нормальный, разброс (55 − 50k) г */
function sim(o,k){var R=o.rnd||Math.random,s=0;k=k==null?.6:k;var sd=Math.max(4,55-50*k);
  for(var i=0;i<N;i++){var e=(R()+R()+R()-1.5)*2*sd;s+=acc(e);}return {sc:s,st:s>=CUT[2]?3:s>=CUT[1]?2:s>=CUT[0]?1:0};}
GMG_REG({id:ID,deps:['ckit','js/gmg-vesy-data.js'],run:run,sim:sim,open:function(){return true;},
  lines:{good:function(){var d=D();return d?d.lines.good:'';},ok:function(){var d=D();return d?d.lines.ok:'';},bad:function(){var d=D();return d?d.lines.bad:'';}}});
})();
