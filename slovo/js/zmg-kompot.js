'use strict';
/* zb2-LOV · ловкостная «Компот до черты» (js/zmg-kompot.js, id 'kompot', ведущая — тётя Валя; волна 2). Набор — ZLK, рекорды — ZMGREC. Основа — «Заправка до краёв» Выезда / «Весы» Гастронома.
   Держи (палец, Пробел) — тётя Валя наливает компот; отпусти ровно на черте. Попал в полосу — стакан засчитан (ровно — «Отлично!» +1 к серии);
   недолил/перелил — промах (три промаха — конец). Стаканы всё уже (компот поднимается быстрее), черта то выше, то ниже, иногда «булькает» сухофрукт — уровень подскакивает.
   Рекорд — стаканы. Один раз за партию — «продолжить» за рекламу (промахи прощены). Выключение — KOMPOT_ON=false, ?off=kompot. */
(function(){
if(typeof ZMG_REG!=='function')return;
var KOMPOT_ON=true;if(!KOMPOT_ON||(window.ZB2&&ZB2.off('kompot')))return;
if(window.ZB2)ZB2.reg('kompot',{t:'Мини-игра «Компот до черты»',who:'LOV'});
var ID='kompot',CUT=[6,12,20],LIVES=3,TOL=.045,PERF=.012;
function tierOf(s){return s>=CUT[2]?3:s>=CUT[1]?2:s>=CUT[0]?1:0;}
function rate(n){return Math.min(1.1,.32+.035*n);}   // доля стакана в секунду
function glass(st){var n=st.n,R=st.rnd;st.g={lv:0,line:.55+.32*R(),w:Math.max(.42,.8-.018*n),pour:false,done:false,bul:n>=4&&R()<.35?.25+.4*R():-1,bt:0};}
function init(rnd){var st={n:0,miss:0,streak:0,perf:0,dead:false,t:0,rnd:rnd,ev:'',res:0,wait:0};glass(st);return st;}
/* шаг: hold — держат ли; st.ev: 'ok' | 'perf' | 'over' | 'under' | 'dead' */
function step(st,dt,hold){st.ev='';st.t+=dt;if(st.dead)return;var g=st.g;
  if(st.wait>0){st.wait-=dt;if(st.wait<=0)glass(st);return;}
  if(hold){g.pour=true;g.lv+=rate(st.n)*dt;if(g.bul>0&&g.lv>=g.bul){g.lv+=.06;g.bul=-1;g.bt=.5;}if(g.lv>=1){g.lv=1;judge(st);}}
  else if(g.pour)judge(st);
  if(g.bt>0)g.bt-=dt;}
function judge(st){var g=st.g,d=g.lv-g.line;g.pour=false;g.done=true;st.res=d;st.wait=.7;
  if(Math.abs(d)<=TOL){st.n++;if(Math.abs(d)<=PERF){st.perf++;st.streak++;st.ev='perf';}else{st.streak=0;st.ev='ok';}}
  else{st.miss++;st.streak=0;st.ev=d>0?'over':'under';if(st.miss>=LIVES){st.dead=true;st.ev='dead';st.why=d>0?'over':'under';}}}
function revive(st){st.dead=false;st.miss=0;st.wait=.01;}
/* бот: отпускает, когда уровень у черты, с ошибкой реакции (сек) */
function botHold(st,k,m,rnd){var g=st.g;if(st.wait>0||g.done)return false;if(m.e==null)m.e=(rnd()-.5)*2*(.025+.1*(1-k)+.12*(1-k)*(1-k));
  var t=(g.line-g.lv)/rate(st.n);if(t<=m.e){m.e=null;return false;}return true;}
function sim(o,k){var rnd=o.rnd||Math.random,st=init(rnd),m={},n=0,h=false;while(!st.dead&&n<60*150){n++;h=botHold(st,k,m,rnd);step(st,1/60,h);}return {sc:st.n,st:tierOf(st.n)};}
var SAY={start:['Держи — наливаю. Отпускай ровно на черте!','Компот из сухофруктов! До черты — и ни капли мимо.'],perf:['Отлично! Как по мерке.','Ровнёхонько! Сразу видно — наш человек.'],
  ok:['Хорошо! Следующий стакан.','Годится! Несу на раздачу.'],over:'Перелила! Скатерть в компоте…',under:'Недолила — первоклассник обидится.',bul:'Ой, сухофрукт булькнул!'};
ZMG_REG({a:'Держи — компот льётся; отпусти ровно на черте',ns:'Обед! Наливай компот до черты — перелил, недолил — тётя Валя всё видит.',/* zb2-MERGE: правило и «Новая затея!» (просьба MGR) */id:ID,finWho:'valya',deps:['js/zmg-lkit.js','js/zmg-rec-ui.js'],sim:sim,
  lines:{good:'Полный поднос — и всё до черты! Золотые руки.',ok:'Хорошо разлила! Чуть ровнее — и в повара возьму.',bad:'Ничего, тряпка есть — ещё разок!'},
  run:function(host,o){var K=window.ZLK,REC=window.ZMGREC,rnd=o.rnd||Math.random,calm=K.calm(host);
    var f=K.frame(host,{who:'valya'}),C=K.canvas(f.main),c=C.ctx,st=init(rnd),fin=false,go=false,hold=false,keyH=false,asked=false,deadT=0,pour=0;
    window.__zl_kompot=st;
    function u(n){return n+' '+(typeof plural==='function'?plural(n,'стакан','стакана','стаканов'):'стаканов');}
    function info(){var b=REC&&REC.best?REC.best(ID):0,g=REC&&REC.galya?REC.galya(ID):0;f.info('<span>🥤 '+st.n+'</span><span>Промахи: '+'●'.repeat(st.miss)+'○'.repeat(Math.max(0,LIVES-st.miss))+'</span><span>Рекорд: '+b+'</span>'+(g?'<span>Галя: '+g+'</span>':''));host.top(u(st.n));}
    host.ptr(f.main,{down:function(){if(!host.el.querySelector('.zl-cont'))hold=true;},up:function(){hold=false;}});
    K.keys(host,function(k,e,d){if(k===' '||k==='Enter'||K.dir(k)==='U'||K.dir(k)==='D'){if(host.el.querySelector('.zl-cont'))return false;keyH=d;return true;}return false;});
    function draw(dt){C.fit();var H=C.h,W=C.w,s=Math.min(1.3,Math.max(.7,Math.min(W/360,H/480)));
      if(!fin&&go){step(st,dt,hold||keyH);
        if(st.ev==='perf'){K.snd(host,'coin');K.pop(host,f.main,st.streak>=3?'Отлично! ×'+st.streak:'Отлично!');if(rnd()<.4)f.say(K.pick(SAY.perf,rnd),'happy');info();}
        else if(st.ev==='ok'){K.snd(host,'tap');if(rnd()<.3)f.say(K.pick(SAY.ok,rnd),'happy');info();}
        else if(st.ev==='over'||st.ev==='under'){K.snd(host,'bad');K.buzz('bad');f.say(SAY[st.ev],'sad');K.pop(host,f.main,st.ev==='over'?'Перелила!':'Мало!','bad');info();}
        else if(st.ev==='dead'){K.snd(host,'bad');K.buzz('bad');f.say(SAY[st.why]+' Три промаха — поднос забрали.','sad');deadT=0;info();}
        if(st.g.bt>.45)f.say(SAY.bul,'wow');}
      if(st.dead&&!fin){deadT+=dt;if(deadT>.9&&!asked){asked=true;K.cont(host,f.main,{text:'Налито '+u(st.n)+'. Продолжить — промахи простим?',onYes:function(){asked=false;revive(st);info();f.say('Новый поднос! Наливаю.','happy');},onNo:end});}}
      /* рисунок: стол, стакан, черта, струя из половника */
      c.fillStyle='#fdf0e0';c.fillRect(0,0,W,H);c.fillStyle='#e8c9a0';c.fillRect(0,H*.82,W,H*.18);c.fillStyle='rgba(0,0,0,.06)';for(var x=0;x<W;x+=28)c.fillRect(x,H*.82,14,H*.18);
      var g=st.g,gh=H*.48,gw=Math.min(W*.5,200*s)*g.w,gx=W/2-gw/2,gy=H*.82-gh;
      c.fillStyle='rgba(200,230,255,.35)';c.beginPath();c.moveTo(gx,gy);c.lineTo(gx+gw,gy);c.lineTo(gx+gw*.92,gy+gh);c.lineTo(gx+gw*.08,gy+gh);c.closePath();c.fill();
      var lv=Math.min(1,g.lv),ly=gy+gh*(1-lv);if(lv>0){c.save();c.beginPath();c.moveTo(gx,gy);c.lineTo(gx+gw,gy);c.lineTo(gx+gw*.92,gy+gh);c.lineTo(gx+gw*.08,gy+gh);c.closePath();c.clip();
        c.fillStyle='#b5552b';c.fillRect(gx,ly,gw,gh);c.fillStyle='rgba(255,255,255,.25)';c.fillRect(gx+gw*.15,ly,gw*.08,gh);c.fillStyle='#8a3c1c';for(var i=0;i<4;i++){c.beginPath();c.arc(gx+gw*(.25+i*.17),gy+gh-8-((i*13)%20),5*s,0,7);c.fill();}c.restore();}
      var lyL=gy+gh*(1-g.line),tl=gh*TOL;c.fillStyle='rgba(43,138,62,.18)';c.fillRect(gx-14*s,lyL-tl,gw+28*s,tl*2);
      c.strokeStyle='#c92a2a';c.lineWidth=3;c.setLineDash([8,5]);c.beginPath();c.moveTo(gx-18*s,lyL);c.lineTo(gx+gw+18*s,lyL);c.stroke();c.setLineDash([]);
      c.fillStyle='#c92a2a';c.font='700 '+Math.round(14*s)+'px sans-serif';c.textAlign='left';c.fillText('черта',gx+gw+20*s,lyL+5);
      c.strokeStyle='#5c6f82';c.lineWidth=3;c.beginPath();c.moveTo(gx,gy);c.lineTo(gx+gw*.08,gy+gh);c.lineTo(gx+gw*.92,gy+gh);c.lineTo(gx+gw,gy);c.stroke();
      var pouring=(hold||keyH)&&go&&!fin&&!st.dead&&st.wait<=0;var lx=W/2+gw*.1,hy=gy-H*.12;
      c.fillStyle='#adb5bd';c.beginPath();c.ellipse(lx+26*s,hy,30*s,16*s,pouring?.5:.2,0,7);c.fill();c.strokeStyle='#868e96';c.lineWidth=6*s;c.beginPath();c.moveTo(lx+50*s,hy-6*s);c.lineTo(lx+120*s,hy-60*s);c.stroke();
      if(pouring){c.fillStyle='#b5552b';c.fillRect(lx,hy+6*s,7*s,ly-hy-6*s);}
      if(st.wait>0&&st.g.done){var ok=Math.abs(st.res)<=TOL;c.fillStyle=ok?'#2b8a3e':'#c92a2a';c.font='800 '+Math.round(22*s)+'px sans-serif';c.textAlign='center';c.fillText(ok?'✓':'✗',W/2,gy-H*.2);}
      if(!go&&!fin){c.fillStyle='rgba(255,255,255,.88)';var tw=Math.min(W-20,320);K.rr(c,(W-tw)/2,H*.06,tw,44,22);c.fill();c.fillStyle='#2d3436';c.font='700 16px sans-serif';c.textAlign='center';c.textBaseline='middle';
        c.fillText(host.pc?'Держи Пробел — льётся, отпусти на черте':'Держи палец — льётся, отпусти на черте',W/2,H*.06+22);c.textBaseline='alphabetic';}
      c.textAlign='left';}
    function end(){if(fin)return;fin=true;var x={sc:st.n,st:tierOf(st.n),label:'Налито '+u(st.n)+(st.perf?' · ровно: '+st.perf:'')};if(REC&&REC.finish)REC.finish(host,x);else host.finish(x);}
    st.api={bot:function(k){var m={};host.loop(function(){if(go&&!fin&&!st.dead)keyH=botHold(st,k,m,Math.random);});},end:end};
    f.say(K.pick(SAY.start,rnd),'happy');info();K.loop(host,draw);
    host.intro({who:'valya',text:'Обед в столовой! Держи — я наливаю компот. Отпусти ровно на черте: перелила или недолила — промах, три промаха — поднос забираю.',
      hint:host.pc?'Держи Пробел — льётся, отпусти — стоп':'Держи палец на экране — льётся, отпусти — стоп',btn:'Наливай!'}).then(function(){go=true;});
  }});
})();
