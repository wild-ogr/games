'use strict';
/* zb2-LOV · ловкостная «Пирожки на перемене» (js/zmg-pirozhki.js, id 'pirozhki', ведущая — тётя Валя; волна 2). Набор — ZLK, рекорды — ZMGREC. Основа — «Выбросили!» Гастронома (лента и «хватай»).
   По ленте буфета едут пирожки. Заказ класса сверху: «с капустой» (меняется каждые 8 штук). Хватай (нажатие по пирожку, ПК — Пробел: ближайший к корзинке) только нужные;
   чужой или «вчерашний» (с мухой) — ошибка, нужный уехал — тоже ошибка. Три ошибки — конец. 25 секунд, лента ускоряется. Рекорд — пирожки без ошибки за партию.
   Один раз за партию — «продолжить» за рекламу. Вид (SKIN 25.10, VIS V10): пирожки крупнее, легенда 15 px, внизу прилавок буфета (не пустой экран). Выключение — PIR_ON=false, ?off=pirozhki. */
(function(){
if(typeof ZMG_REG!=='function')return;
var PIR_ON=true;if(!PIR_ON||(window.ZB2&&ZB2.off('pirozhki')))return;
if(window.ZB2)ZB2.reg('pirozhki',{t:'Мини-игра «Пирожки на перемене»',who:'LOV'});
var ID='pirozhki',CUT=[8,15,22],TIME=25,LIVES=3,ZONE=.78;   // ZONE — где корзинка (доля ширины): хватать можно везде, Пробел берёт ближайший к ней
var KIND=[{id:'kap',n:'с капустой',col:'#9bc27a'},{id:'kart',n:'с картошкой',col:'#f2d48a'},{id:'pov',n:'с повидлом',col:'#c92a2a'},{id:'yab',n:'с яблоком',col:'#82c91e'}];
function tierOf(s){return s>=CUT[2]?3:s>=CUT[1]?2:s>=CUT[0]?1:0;}
function init(rnd){var st={t:0,n:0,err:0,dead:false,rnd:rnd,pies:[],next:.3,want:0,cnt:0,ev:'',why:''};return st;}
function sp(st){return Math.min(.62,.24+.016*st.t);}   // доля ширины в секунду
function step(st,dt){st.ev='';if(st.dead)return;st.t+=dt;if(st.t>=TIME){st.dead=true;st.ev='time';return;}
  st.next-=dt;if(st.next<=0){var R=st.rnd,k=R()<.45?st.want:Math.floor(R()*KIND.length),old=R()<.12;st.pies.push({x:-.08,k:k,old:old,got:0,w:st.want});st.cnt++;
    if(st.cnt%8===0){var w=st.want;while(w===st.want)w=Math.floor(R()*KIND.length);st.want=w;st.ev='order';}st.next=Math.max(.26,.6-.013*st.t)*(.8+.4*R());}
  var v=sp(st);for(var j=st.pies.length-1;j>=0;j--){var p=st.pies[j];if(p.got){p.got+=dt;if(p.got>.4)st.pies.splice(j,1);continue;}p.x+=v*dt;
    if(p.x>1.08){st.pies.splice(j,1);if(p.k===st.want&&p.w===st.want&&!p.old){st.err++;st.ev='miss';st.why='miss';if(st.err>=LIVES){st.dead=true;st.ev='dead';}}}}}
function good(st,p){return p.k===st.want&&!p.old;}
function grab(st,p){if(!p||p.got||st.dead)return '';p.got=.001;if(good(st,p)){st.n++;return 'ok';}st.err++;st.why=p.old?'old':'wrong';if(st.err>=LIVES){st.dead=true;st.ev='dead';}return p.old?'old':'wrong';}
function nearest(st){var b=null,d=9;st.pies.forEach(function(p){if(p.got||p.x>1)return;var e=Math.abs(p.x-ZONE);if(e<d){d=e;b=p;}});return d<.12?b:null;}
function revive(st){st.dead=false;st.err=0;st.pies=[];st.next=.5;st.t=Math.min(st.t,TIME-8);}
function botAct(st,k,rnd){for(var j=0;j<st.pies.length;j++){var p=st.pies[j];if(p.got)continue;if(p.x<.15+.4*(1-k))continue;
    if(p.see==null){p.see=rnd()<.97-.4*(1-k)*(1-k);p.lag=rnd()<.06*(1-k)?1:0;}if(p.lag)continue;var ok=good(st,p);if(!p.see)ok=!ok&&p.k!==st.want;if(ok)return p;}return null;}
function sim(o,k){var rnd=o.rnd||Math.random,st=init(rnd),n=0;while(!st.dead&&n<60*40){n++;step(st,1/60);var p=botAct(st,k,rnd);if(p)grab(st,p);}return {sc:st.n,st:tierOf(st.n)};}
var SAY={start:['Перемена! Класс заказал пирожки — хватай только нужные.','Лента поехала! Смотри на заказ сверху.'],ok:['Есть!','В корзинку!','Горяченький!'],
  wrong:'Не тот! Класс заказывал другие.',old:'Вчерашний, с мухой! Такой не берём.',miss:'Нужный уехал! Лови следующий.',order:'Новый заказ: ',dead:{time:'Звонок! Перемена кончилась.',dead:'Три ошибки — буфет закрыт.'}};
ZMG_REG({a:'Хватай с ленты только пирожки из заказа — вчерашние с мухой не бери',ns:'Перемена, очередь в буфет! Пирожки по заказу класса — с мухой не брать.',/* zb2-MERGE: правило и «Новая затея!» (просьба MGR) */id:ID,finWho:'valya',deps:['js/zmg-lkit.js','js/zmg-rec-ui.js'],sim:sim,
  lines:{good:'Полная корзинка — и всё по заказу! Класс сыт.',ok:'Хорошо собрала! Пара пирожков — не те.',bad:'Ничего, следующая перемена через 45 минут!'},
  run:function(host,o){var K=window.ZLK,REC=window.ZMGREC,rnd=o.rnd||Math.random,calm=K.calm(host);
    var f=K.frame(host,{who:'valya'}),C=K.canvas(f.main),c=C.ctx,st=init(rnd),fin=false,go=false,asked=false,deadT=0,fx=[];st.want=Math.floor(rnd()*KIND.length);
    window.__zl_pirozhki=st;
    function u(n){return n+' '+(typeof plural==='function'?plural(n,'пирожок','пирожка','пирожков'):'пирожков');}
    function info(){var b=REC&&REC.best?REC.best(ID):0;f.info('<span>Заказ: <b>'+KIND[st.want].n+'</b></span><span>🧺 '+st.n+'</span><span>Ошибки: '+'●'.repeat(st.err)+'○'.repeat(Math.max(0,LIVES-st.err))+'</span><span>Рекорд: '+b+'</span>');host.top('⏱ '+Math.max(0,Math.ceil(TIME-st.t))+' с');}
    function geo(){var W=C.w,H=C.h,r=Math.min(W*.092,H*.12,52);return {W:W,H:H,y:H*.55,r:r};}
    function act(p){if(!go||fin||!p)return;var g=geo(),r=grab(st,p);if(!r)return;
      if(r==='ok'){K.snd(host,'coin');fx.push({x:p.x*g.W,y:g.y,t:0,txt:K.pick(SAY.ok,rnd),c:'#2b8a3e'});}else{K.snd(host,'bad');K.buzz('bad');f.say(SAY[r],'sad');fx.push({x:p.x*g.W,y:g.y,t:0,txt:'✗',c:'#c92a2a'});}info();}
    host.ptr(f.main,{down:function(x,y){var g=geo(),b=null,d=1e9;st.pies.forEach(function(p){if(p.got)return;var e=Math.hypot(p.x*g.W-x,g.y-y);if(e<d){d=e;b=p;}});if(b&&d<g.r*1.6)act(b);}});
    host.keys(function(k){if(k===' '||k==='Enter'||K.dir(k)==='D'){if(host.el.querySelector('.zl-cont'))return false;act(nearest(st));return true;}return false;});
    var lastS=-1;
    function draw(dt){C.fit();var g=geo(),W=g.W,H=g.H;
      if(!fin&&go){step(st,dt);if(st.ev==='order'){f.say(SAY.order+KIND[st.want].n+'!','wow');K.pop(host,f.main,'Заказ: '+KIND[st.want].n);info();}
        else if(st.ev==='miss'){K.snd(host,'bad');f.say(SAY.miss,'sad');info();}
        if(Math.floor(st.t)!==lastS){lastS=Math.floor(st.t);info();}
        if(st.ev==='time'){end();}else if(st.ev==='dead'){deadT=0;f.say(SAY.dead.dead,'sad');}}
      if(st.dead&&st.t<TIME&&!fin){deadT+=dt;if(deadT>.8&&!asked){asked=true;K.cont(host,f.main,{text:'В корзинке '+u(st.n)+'. Продолжить — ошибки простим?',onYes:function(){asked=false;revive(st);info();f.say('Лента снова поехала!','happy');},onNo:end});}}
      c.fillStyle='#fff4e0';c.fillRect(0,0,W,H);c.fillStyle='#f0d9b0';c.fillRect(0,g.y+g.r*1.1,W,H);c.fillStyle='#dcb886';c.fillRect(0,g.y+g.r*1.1,W,5);c.fillStyle='#e2c391';c.fillRect(0,H*.88,W,H*.12);c.fillStyle='rgba(255,255,255,.35)';for(var x3=W*.06;x3<W;x3+=W*.22)c.fillRect(x3,H*.9,W*.14,H*.06);c.fillStyle='#e8c9a0';c.fillRect(0,0,W,H*.18);c.fillStyle='#c4a07a';for(var x=0;x<W;x+=60)c.fillRect(x,H*.18-6,40,6);
      c.fillStyle='#495057';c.fillRect(0,g.y-g.r*1.1,W,g.r*2.2);c.fillStyle='#343a40';var off=(st.t*sp(st)*W)%30;for(var x2=-30+off;x2<W;x2+=30)c.fillRect(x2,g.y-g.r*1.1,3,g.r*2.2);
      c.strokeStyle='rgba(255,212,59,.8)';c.lineWidth=3;c.setLineDash([6,4]);c.strokeRect(ZONE*W-g.r*1.2,g.y-g.r*1.2,g.r*2.4,g.r*2.4);c.setLineDash([]);
      c.font=Math.round(g.r*1.1)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🧺',ZONE*W,g.y+g.r*2.2);
      st.pies.forEach(function(p){var px=p.x*W,py=g.y-(p.got?p.got*80:0),r=g.r;c.globalAlpha=p.got?Math.max(0,1-p.got/.4):1;
        c.fillStyle='#d9973b';c.beginPath();c.ellipse(px,py,r,r*.62,0,0,7);c.fill();c.fillStyle='#e8b05a';c.beginPath();c.ellipse(px,py-r*.12,r*.8,r*.4,0,0,7);c.fill();
        c.fillStyle=KIND[p.k].col;c.beginPath();c.ellipse(px,py-r*.05,r*.5,r*.16,0,0,7);c.fill();
        if(p.old){c.fillStyle='rgba(90,70,40,.35)';c.beginPath();c.ellipse(px,py,r,r*.62,0,0,7);c.fill();c.fillStyle='#212529';c.beginPath();c.arc(px+r*.4,py-r*.5,r*.12,0,7);c.fill();c.fillStyle='rgba(200,220,255,.8)';c.beginPath();c.ellipse(px+r*.32,py-r*.65,r*.12,r*.07,-.5,0,7);c.ellipse(px+r*.5,py-r*.65,r*.12,r*.07,.5,0,7);c.fill();}
        c.globalAlpha=1;});
      c.fillStyle='#2d3436';c.font='700 '+Math.round(Math.min(18,W/22))+'px sans-serif';c.fillText('Класс заказал: пирожки '+KIND[st.want].n,W/2,H*.09);
      var ks=Math.min(W/4.2,120),kx=W/2-ks*1.5;KIND.forEach(function(k,i){c.fillStyle=k.col;c.beginPath();c.ellipse(kx+i*ks,H*.28,g.r*.55,g.r*.2,0,0,7);c.fill();c.fillStyle=st.want===i?'#2b8a3e':'#495057';c.font=(st.want===i?'700 ':'')+'15px sans-serif';c.fillText(k.n.replace('с ',''),kx+i*ks,H*.28+g.r*.5+3);});
      for(var j=fx.length-1;j>=0;j--){var e=fx[j];e.t+=dt;if(e.t>.8){fx.splice(j,1);continue;}c.globalAlpha=1-e.t/.8;c.fillStyle=e.c;c.font='800 20px sans-serif';c.fillText(e.txt,e.x,e.y-g.r*1.6-(calm?0:e.t*40));c.globalAlpha=1;}
      if(!go&&!fin){c.fillStyle='rgba(255,255,255,.9)';var tw=Math.min(W-20,330);K.rr(c,(W-tw)/2,H*.75,tw,44,22);c.fill();c.fillStyle='#2d3436';c.font='700 15px sans-serif';
        c.fillText(host.pc?'Клик по пирожку или Пробел — у корзинки':'Нажимай на нужные пирожки',W/2,H*.75+22);}
      c.textAlign='left';c.textBaseline='alphabetic';}
    function end(){if(fin)return;fin=true;f.say(st.t>=TIME?SAY.dead.time:SAY.dead.dead,'happy');
      setTimeout(function(){var x={sc:st.n,st:tierOf(st.n),label:'В корзинке '+u(st.n)+' · ошибок: '+st.err};if(REC&&REC.finish)REC.finish(host,x);else host.finish(x);},calm?200:600);}
    st.api={bot:function(k){host.loop(function(){if(go&&!fin){var p=botAct(st,k,Math.random);if(p)act(p);}});},end:function(){st.dead=true;end();}};
    f.say(K.pick(SAY.start,rnd),'happy');info();K.loop(host,draw);
    host.intro({who:'valya',text:'Перемена — очередь в буфет! Класс заказал пирожки. Хватай с ленты только те, что в заказе. Чужой или вчерашний (с мухой) — ошибка, нужный уехал — тоже. Три ошибки — буфет закрыт.',
      hint:host.pc?'Клик по пирожку; Пробел — тот, что у корзинки':'Нажимай на нужные пирожки на ленте',btn:'Открыть буфет'}).then(function(){go=true;});
  }});
})();
