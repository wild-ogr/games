'use strict';
/* zb2-LOV · ловкостная «Брысь со стола!» (js/zmg-brys.js, id 'brys', ведущая — тётя Валя; волна 2). Набор — ZLK, рекорды — ZMGREC. Основа — «Кот у колбасы» Гастронома (бей крота).
   Столовая: шесть тарелок с котлетами. Кот Ять высовывается к одной — нажми на него (ПК: клавиши 1–6), пока не стащил. Иногда к тарелке тянется рука
   первоклассника — её НЕ трогать. 30 секунд, кот всё наглее (окно короче, появляется чаще). Стащил 3 котлеты или шуганул первоклассника 2 раза — конец раньше.
   Рекорд — сколько раз шуганула. Выключение — BRYS_ON=false, ?off=brys. */
(function(){
if(typeof ZMG_REG!=='function')return;
var BRYS_ON=true;if(!BRYS_ON||(window.ZB2&&ZB2.off('brys')))return;
if(window.ZB2)ZB2.reg('brys',{t:'Мини-игра «Брысь со стола!»',who:'LOV'});
var ID='brys',CUT=[12,22,32],TIME=30,LIVES=3,KIDS=2;
function tierOf(s){return s>=CUT[2]?3:s>=CUT[1]?2:s>=CUT[0]?1:0;}
function init(rnd){return {t:0,n:0,lost:0,kid:0,pop:[],next:.8,dead:false,rnd:rnd,ev:''};}
function win(st){return Math.max(.5,1.2-.03*st.t);}
function gap(st){return Math.max(.28,.85-.02*st.t);}
function step(st,dt){st.ev='';if(st.dead)return;st.t+=dt;if(st.t>=TIME){st.dead=true;st.ev='time';return;}
  st.next-=dt;if(st.next<=0){var free=[0,1,2,3,4,5].filter(function(i){return !st.pop.some(function(p){return p.i===i;});});
    if(free.length){var i=free[Math.floor(st.rnd()*free.length)%free.length],kid=st.t>4&&st.rnd()<.18;st.pop.push({i:i,kid:kid,t:0,w:kid?1.1:win(st),hit:0});}
    st.next=gap(st)*(.7+.6*st.rnd());if(st.t>12&&st.rnd()<.25)st.next*=.4;}
  for(var j=st.pop.length-1;j>=0;j--){var p=st.pop[j];p.t+=dt;if(p.hit){if(p.t>p.hit+.35)st.pop.splice(j,1);continue;}
    if(p.t>=p.w){st.pop.splice(j,1);if(!p.kid){st.lost++;st.ev='lost';st.lp=p.i;if(st.lost>=LIVES){st.dead=true;st.ev='dead';}}}}}
/* нажатие по тарелке i → 'shoo' | 'kid' | '' */
function tap(st,i){if(st.dead)return '';for(var j=0;j<st.pop.length;j++){var p=st.pop[j];if(p.i===i&&!p.hit){p.hit=p.t;if(p.kid){st.kid++;if(st.kid>=KIDS){st.dead=true;st.ev='dead';}return 'kid';}st.n++;return 'shoo';}}return '';}
function botAct(st,k,m,rnd){for(var j=0;j<st.pop.length;j++){var p=st.pop[j];if(p.hit||m[p.i+'_'+p.w]===2)continue;var key=p.i+'_'+p.w;
    if(m[key]==null){m[key]=1;p.react=.3+.45*(1-k)+(.1+.4*(1-k))*rnd();p.wrong=p.kid&&rnd()<.25*(1-k);}
    if(p.t>=p.react){m[key]=2;if(!p.kid||p.wrong)return p.i;}}return -1;}
function sim(o,k){var rnd=o.rnd||Math.random,st=init(rnd),m={},n=0;while(!st.dead&&n<60*40){n++;step(st,1/60);var i=botAct(st,k,m,rnd);if(i>=0)tap(st,i);}return {sc:st.n,st:tierOf(st.n)};}
var SAY={start:['Ять опять к котлетам! Шугай его — нажимай на кота.','Котлеты для 3«Б»! Кота — брысь, детей не трогать.'],shoo:['Брысь!','Кыш, усатый!','Пшёл вон с раздачи!','Брысь со стола!'],
  lost:'Стащил котлету! Ну, наглец…',kid:'Ой! Это же первоклассник — ему можно!',dead:{time:'Звонок! Обед окончен.',lost:'Три котлеты унёс! Сам теперь сытый спит.',kid:'Детей не шугаем! Обед окончен.'}};
ZMG_REG({a:'Жми на кота, когда он высунулся у тарелки, — руку первоклассника не трогай',ns:'Ять повадился к котлетам в столовой. Брысь его со стола — только кота, не детей!',/* zb2-MERGE: правило и «Новая затея!» (просьба MGR) */id:ID,finWho:'valya',deps:['js/zmg-lkit.js','js/zmg-rec-ui.js'],sim:sim,
  lines:{good:'Ни одной котлеты не отдала! Ять в шоке.',ok:'Хорошо караулила! Пару котлет он всё-таки утащил.',bad:'Ять сегодня победил. Завтра реванш!'},
  run:function(host,o){var K=window.ZLK,REC=window.ZMGREC,rnd=o.rnd||Math.random,calm=K.calm(host);
    var f=K.frame(host,{who:'valya'}),C=K.canvas(f.main),c=C.ctx,st=init(rnd),fin=false,go=false,img=null,fx=[];
    window.__zl_brys=st;
    try{if(typeof catSVG==='function'){var im=new Image();im.onload=function(){img=im;};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(catSVG());}}catch(e){}
    function u(n){return n+' '+(typeof plural==='function'?plural(n,'раз','раза','раз'):'раз');}
    function info(){var b=REC&&REC.best?REC.best(ID):0;f.info('<span>🐾 '+st.n+'</span><span>Котлеты: '+'🍖'.repeat(Math.max(0,LIVES-st.lost))+'</span><span>⏱ '+Math.max(0,Math.ceil(TIME-st.t))+'</span><span>Рекорд: '+b+'</span>');host.top('Шуганула: '+st.n);}
    function lay(){var W=C.w,H=C.h,cols=W>H*1.2?3:2,rows=6/cols,pw=Math.min(W/cols,H/rows),r=pw*.34,out=[];
      for(var i=0;i<6;i++){var cx=(i%cols+.5)*W/cols,cy=(Math.floor(i/cols)+.5)*H/rows;out.push({x:cx,y:cy,r:r});}return out;}
    function hitAt(x,y){var L=lay();for(var i=0;i<6;i++){var q=L[i];if(Math.hypot(x-q.x,y-q.y)<q.r*1.35)return i;}return -1;}
    function act(i){if(!go||fin||st.dead||i<0)return;var r=tap(st,i),q=lay()[i];
      if(r==='shoo'){K.snd(host,'tap');fx.push({x:q.x,y:q.y,t:0,txt:K.pick(SAY.shoo,rnd),c:'#2b8a3e'});info();if(st.n===(REC.best(ID)|0)+1&&REC.best(ID)>0)K.pop(host,f.main,'Рекорд!','big');}
      else if(r==='kid'){K.snd(host,'bad');K.buzz('bad');f.say(SAY.kid,'wow');fx.push({x:q.x,y:q.y,t:0,txt:'Ой!',c:'#c92a2a'});}}
    host.ptr(f.main,{down:function(x,y){act(hitAt(x,y));}});
    host.keys(function(k){if(/^[1-6]$/.test(k)){act(+k-1);return true;}return false;});
    var lastLost=0;
    function draw(dt){C.fit();var W=C.w,H=C.h;if(!fin&&go){step(st,dt);
        if(st.ev==='lost'){K.snd(host,'bad');f.say(SAY.lost,'sad');var q=lay()[st.lp];fx.push({x:q.x,y:q.y,t:0,txt:'Утащил!',c:'#c92a2a'});}
        if(st.dead){end();return;}if(Math.floor(st.t)!==lastLost){lastLost=Math.floor(st.t);info();}}
      c.fillStyle='#fdf6e8';c.fillRect(0,0,W,H);c.fillStyle='rgba(201,42,42,.08)';for(var x=0;x<W;x+=40)for(var y=0;y<H;y+=40)if(((x+y)/40)%2===0)c.fillRect(x,y,40,40);
      var L=lay();for(var i=0;i<6;i++){var q=L[i],has=st.lost<LIVES;c.fillStyle='#fff';c.beginPath();c.ellipse(q.x,q.y,q.r,q.r*.8,0,0,7);c.fill();c.strokeStyle='#4dabf7';c.lineWidth=3;c.beginPath();c.ellipse(q.x,q.y,q.r*.86,q.r*.68,0,0,7);c.stroke();
        c.fillStyle='#8a4b1c';c.beginPath();c.ellipse(q.x-q.r*.15,q.y,q.r*.38,q.r*.24,.2,0,7);c.fill();c.fillStyle='#f2c94c';c.beginPath();c.ellipse(q.x+q.r*.32,q.y+q.r*.1,q.r*.22,q.r*.16,0,0,7);c.fill();
        if(host.pc){c.fillStyle='rgba(0,0,0,.35)';c.font='700 13px sans-serif';c.textAlign='center';c.fillText(String(i+1),q.x,q.y+q.r*1.05);}void has;}
      st.pop.forEach(function(p){var q=L[p.i],k=p.hit?Math.max(0,1-(p.t-p.hit)/.35):Math.min(1,p.t/.15),sz=q.r*1.3;
        if(p.kid){c.fillStyle='#f2c9a8';c.save();c.translate(q.x+q.r*.9-k*q.r*.6,q.y-q.r*.2);c.rotate(-.5);K.rr(c,-sz*.15,-sz*.12,sz*.9,sz*.24,sz*.1);c.fill();c.fillStyle='#3d6fc4';c.fillRect(sz*.5,-sz*.14,sz*.4,sz*.28);c.restore();
          c.fillStyle='#b5552b';c.fillRect(q.x+q.r*.6-k*q.r*.6,q.y-q.r*.8,q.r*.3,q.r*.45);}
        else{c.save();c.globalAlpha=k;var dy=(1-k)*sz*.4;if(img)c.drawImage(img,q.x-sz/2,q.y-sz*.85+dy,sz,sz);else{c.fillStyle='#f08c00';c.beginPath();c.arc(q.x,q.y-sz*.3+dy,sz*.35,0,7);c.fill();}
          if(!p.hit){var left=1-p.t/p.w;c.strokeStyle=left<.35?'#c92a2a':'#2b8a3e';c.lineWidth=4;c.beginPath();c.arc(q.x,q.y,q.r*1.08,-Math.PI/2,-Math.PI/2+left*Math.PI*2);c.stroke();}c.restore();}});
      for(var j=fx.length-1;j>=0;j--){var e=fx[j];e.t+=dt;if(e.t>.8){fx.splice(j,1);continue;}c.globalAlpha=1-e.t/.8;c.fillStyle=e.c;c.font='800 20px sans-serif';c.textAlign='center';c.fillText(e.txt,e.x,e.y-30-(calm?0:e.t*40));c.globalAlpha=1;}
      c.textAlign='left';
      if(!go&&!fin){c.fillStyle='rgba(255,255,255,.9)';var tw=Math.min(W-20,320);K.rr(c,(W-tw)/2,H/2-22,tw,44,22);c.fill();c.fillStyle='#2d3436';c.font='700 16px sans-serif';c.textAlign='center';c.textBaseline='middle';
        c.fillText(host.pc?'Кот у тарелки — клик или клавиша 1–6':'Кот у тарелки — нажми на него!',W/2,H/2);c.textBaseline='alphabetic';c.textAlign='left';}}
    function end(){if(fin)return;fin=true;var why=st.t>=TIME?'time':st.kid>=KIDS?'kid':'lost';f.say(SAY.dead[why],why==='time'?'happy':'sad');
      setTimeout(function(){var x={sc:st.n,st:tierOf(st.n),label:'Шуганула кота '+u(st.n)+' · котлет унёс: '+st.lost};if(REC&&REC.finish)REC.finish(host,x);else host.finish(x);},calm?200:700);}
    st.api={bot:function(k){var m={};host.loop(function(){if(go&&!fin){var i=botAct(st,k,m,Math.random);if(i>=0)act(i);}});},end:function(){st.dead=true;end();}};
    f.say(K.pick(SAY.start,rnd),'happy');info();K.loop(host,draw);
    host.intro({who:'valya',text:'Ять повадился к котлетам! Как высунется у тарелки — нажми на него, пока не стащил. А руку первоклассника не трогай — ему можно. 30 секунд!',
      hint:host.pc?'Клик по коту или клавиши 1–6':'Нажимай на кота',btn:'Караулить!'}).then(function(){go=true;});
  }});
})();
