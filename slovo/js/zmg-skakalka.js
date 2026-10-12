'use strict';
/* zb2-LOV · ловкостная «Скакалка» (js/zmg-skakalka.js, id 'skakalka', ведущая — Нина Аркадьевна; решение владельца 12.10: задумка одобрена, нужна ПОНЯТНОСТЬ — макет MG.html разд. 9).
   Валерка и Галя крутят скакалку, кот Ять прыгает. Понятность: сначала ПОКАЗ (верёвка крутится сама, Ять прыгает сам, палец 👆 «нажимает» в нужный миг);
   зелёная полоса «ЖМИ!» под Ятью, когда верёвка подходит к полу, и темнеющая тень верёвки; счёт вслух («Раз! Два!…») и звук на каждый прыжок;
   первые 5 прыжков — разминка без проигрыша; в итоге — ПОЧЕМУ сбился (рано / поздно / не прыгнул). Темп растёт на 4 % за прыжок. Рекорд — прыжки подряд.
   Сбился — один раз за партию «продолжить» за рекламу. Основа — «Заведи Москвич» Выезда (поймай зону) и макет. Физика — одна step() для экрана и бота (sim). Выключение — ROPE_ON=false, ?off=skakalka. */
(function(){
if(typeof ZMG_REG!=='function')return;
var ROPE_ON=true;if(!ROPE_ON||(window.ZB2&&ZB2.off('skakalka')))return;
if(window.ZB2)ZB2.reg('skakalka',{t:'Мини-игра «Скакалка»',who:'LOV'});
var ID='skakalka',CUT=[10,22,36],WARM=5,OM0=2*Math.PI/2.2,OMX=2*Math.PI/.36,COUNT=['Раз!','Два!','Три!','Четыре!','Пять!','Шесть!','Семь!','Восемь!','Девять!','Десять!'];
function tierOf(s){return s>=CUT[2]?3:s>=CUT[1]?2:s>=CUT[0]?1:0;}
function init(){return {mode:'demo',ph:Math.PI*.2,om:OM0,jt:-1,JT:.6,sc:0,warm:0,t:0,lastEnd:-9,why:'',stopT:0,ev:''};}
function toBottom(st){return ((Math.PI-st.ph%(2*Math.PI))+2*Math.PI)%(2*Math.PI)/st.om;}
function air(st){return st.jt>=0&&st.jt/st.JT>.18&&st.jt/st.JT<.85;}
function jump(st){if(st.mode==='demo'||st.mode==='over'||st.mode==='stop'||st.mode==='dead')return false;if(st.jt<0){st.jt=0;return true;}return false;}
/* шаг: st.ev — событие шага: 'jump' (засчитан), 'warm' (разминка), 'miss' (сбился в разминке), 'dead' (конец), 'go' (разминка пройдена) */
function step(st,dt){st.ev='';st.t+=dt;
  if(st.mode==='stop'){st.stopT-=dt;if(st.stopT<=0){st.mode='warm';st.ph=Math.PI*.1;}return;}
  if(st.mode==='over'||st.mode==='dead')return;
  var p0=st.ph;st.ph+=st.om*dt;if(st.jt>=0){st.jt+=dt;if(st.jt>st.JT){st.jt=-1;st.lastEnd=st.t;}}
  if(st.mode==='demo'){if(st.jt<0&&toBottom(st)<.22)st.jt=0;return;}
  var crossed=Math.floor((p0-Math.PI)/(2*Math.PI))!==Math.floor((st.ph-Math.PI)/(2*Math.PI));if(!crossed)return;
  if(air(st)){if(st.mode==='warm'){st.warm++;st.ev='warm';if(st.warm>=WARM){st.mode='go';st.ev='go';}}
    else{st.sc++;st.om=Math.min(OMX,st.om*1.04);st.JT=Math.max(.24,Math.PI*1.0/st.om);st.ev='jump';}}
  else{st.why=st.jt>=0&&st.jt/st.JT<=.18?'late':(st.t-st.lastEnd<.5?'early':'none');
    if(st.mode==='warm'){st.mode='stop';st.stopT=1.2;st.jt=-1;st.ev='miss';}else{st.mode='dead';st.jt=-1;st.ev='dead';}}}
function revive(st){st.mode='go';st.ph=Math.PI*.1;st.jt=-1;st.om=Math.max(OM0,st.om*.85);st.JT=Math.max(.24,Math.PI*1.0/st.om);}
/* бот: жмёт за ~0,45 прыжка до пола, ошибка по времени — от умения k */
function botWant(st,k,mem,rnd){if(st.jt>=0||st.mode==='demo'||st.mode==='stop'||st.mode==='dead')return false;var tb=toBottom(st);
  if(mem.e==null){mem.e=(rnd()-.5)*2*(.045+.12*(1-k)+.15*(1-k)*(1-k));if(rnd()<.006+.03*(1-k))mem.e+=.4;}if(tb<=Math.max(0,st.JT*.5+mem.e)){mem.e=null;return true;}return false;}
function sim(o,k){var rnd=o.rnd||Math.random,st=init(),m={},dt=1/60,n=0;st.mode='warm';st.ph=Math.PI*.1;
  while(st.mode!=='dead'&&n<60*180){n++;if(botWant(st,k,m,rnd))jump(st);step(st,dt);}return {sc:st.sc,st:tierOf(st.sc),t:n*dt};}
var WHY={late:'Поздно: Ять оттолкнулся, когда верёвка уже была у лап.',early:'Рано: Ять приземлился раньше, чем прошла верёвка.',none:'Не прыгнул: верёвка задела лапы.'};
ZMG_REG({a:'Жми, когда верёвка внизу — Ять прыгает!',ns:'Кот Ять записался на скакалку. Командуй, когда прыгать — сам он не считает.',/* zb2-MERGE: правило и «Новая затея!» (просьба MGR) */id:ID,finWho:'nina',deps:['js/zmg-lkit.js','js/zmg-rec-ui.js'],sim:sim,
  lines:{good:'Вот это прыгучесть! Ять — чемпион двора.',ok:'Хорошо скакали! Ещё чуть-чуть — и рекорд.',bad:'Ничего, Ять отдохнёт — и снова!'},
  run:function(host,o){
    var K=window.ZLK,REC=window.ZMGREC,rnd=o.rnd||Math.random,calm=K.calm(host);
    var f=K.frame(host,{who:'nina'}),C=K.canvas(f.main),c=C.ctx,st=init(),fin=false,want=false,pop=null,asked=false,deadT=0,demoT=0;
    window.__zl_skakalka=st;
    var img={};function pic(k,svg){if(img[k]!==undefined)return img[k];img[k]=null;try{if(!svg)return null;var im=new Image();im.onload=function(){img[k]=im;};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);}catch(e){}return null;}
    function cat(){return pic('cat',typeof catSVG==='function'?catSVG():'');}function face(w){return pic(w,host.face(w,'happy'));}
    function u(n){return n+' '+(typeof plural==='function'?plural(n,'прыжок','прыжка','прыжков'):'прыжков');}
    function info(){var b=REC&&REC.best?REC.best(ID):0,g=REC&&REC.galya?REC.galya(ID):0;f.info('<span>🪢 '+st.sc+'</span><span>Рекорд: '+b+'</span>'+(g?'<span>Галя: '+g+'</span>':''));host.top(st.mode==='go'||st.mode==='dead'?u(st.sc):'Разминка');}
    function popT(t,col){pop={t:t,a:1,c:col||'#25324a'};}
    K.tap(host,f.main,function(){if(!fin)want=true;});host.ptr(f.foot,{down:function(){if(!fin)want=true;}});
    /* показ — карточка поверх поля (одна кнопка), до неё верёвка крутится сама */
    var demo=document.createElement('div');demo.className='zl-cont';demo.style.alignItems='flex-start';demo.style.background='transparent';demo.style.pointerEvents='none';
    demo.innerHTML='<div style="pointer-events:auto;padding:10px 12px"><p style="margin:0 0 6px"><b>Смотри: Ять прыгает, когда верёвка внизу</b><br><span style="font-size:14px">Верёвка опускается к полу — зелёная полоса под Ятью загорается «ЖМИ!»: нажми, и Ять подпрыгнет. Первые '+WARM+' прыжков — разминка, ошибаться можно.</span></p><button class="btn green" type="button">Понятно, прыгаем!'+(host.pc?' <kbd class="zmg-kc">Enter</kbd>':'')+'</button></div>';
    var finger=document.createElement('div');finger.style.cssText='position:absolute;font-size:40px;left:56%;pointer-events:none;z-index:2;transition:transform .12s';finger.textContent='👆';
    function startPlay(){if(st.mode!=='demo')return;K.snd(host,'tap');if(demo.parentNode)demo.parentNode.removeChild(demo);if(finger.parentNode)finger.parentNode.removeChild(finger);
      st.mode='warm';st.ph=Math.PI*.1;st.jt=-1;f.say('Разминка: прыгай, когда полоса зелёная. Ошибки не считаются.','happy');info();}
    demo.querySelector('button').onclick=function(e){e.stopPropagation();startPlay();};
    host.keys(function(k){if(st.mode==='demo'&&(k==='Enter'||k===' ')){startPlay();return true;}return false;});
    function geo(){var w=C.w,h=C.h,s=Math.min(1.25,Math.max(.7,Math.min(w/360,h/520)));return {s:s,fy:h*.8,lx:w/2-Math.min(150*s,w*.36),rx:w/2+Math.min(150*s,w*.36),hy:h*.46};}
    function kid(g,x,col,who,nm){var s=g.s;c.fillStyle=col;K.rr(c,x-15*s,g.hy-8*s,30*s,g.fy-g.hy+8*s,8*s);c.fill();var im=face(who),r=19*s;
      c.save();c.beginPath();c.arc(x,g.hy-26*s,r,0,7);c.closePath();if(im){c.clip();c.drawImage(im,x-r,g.hy-26*s-r,2*r,2*r);}else{c.fillStyle='#f2c9a8';c.fill();}c.restore();
      c.fillStyle='#333';c.font='600 '+Math.round(13*s)+'px sans-serif';c.textAlign='center';c.fillText(nm,x,g.fy+18*s);}
    function draw(dt){C.fit();
      if(!fin){if(want){want=false;if(st.mode!=='demo')jump(st);}step(st,dt);if(st.mode==='demo'){demoT+=dt;}
        if(st.ev==='warm'){popT('Разминка '+st.warm+' из '+WARM,'#2b8a3e');K.snd(host,'tap');}
        else if(st.ev==='go'){f.say('Молодец! Теперь — на счёт. Быстрее будет!','happy');info();}
        else if(st.ev==='jump'){popT(st.sc<=10?COUNT[st.sc-1]:String(st.sc));K.snd(host,'coin');info();if(st.sc%10===0)f.say(st.sc+'! Ять, ты чемпион двора!','happy');
          if(st.sc===(REC.best(ID)|0)+1&&REC.best(ID)>0)K.pop(host,f.main,'Рекорд!','big');}
        else if(st.ev==='miss'){popT('Не страшно!','#c92a2a');K.snd(host,'bad');f.say(WHY[st.why]+' Ещё раз — жди зелёную полосу.','norm');}
        else if(st.ev==='dead'){K.snd(host,'bad');K.buzz('bad');f.say(WHY[st.why],'sad');deadT=0;}}
      if(st.mode==='dead'&&!fin){deadT+=dt;if(deadT>1&&!asked){asked=true;K.cont(host,f.main,{text:WHY[st.why]+'<br>'+u(st.sc)+' подряд. Продолжить счёт?',onYes:function(){asked=false;revive(st);f.say('Продолжаем! Я считаю дальше.','happy');},onNo:end});}}
      if(pop){pop.a-=dt*1.2;if(pop.a<=0)pop=null;}
      var g=geo(),s=g.s;c.fillStyle='#e9f0e4';c.fillRect(0,0,C.w,C.h);c.fillStyle='#cfc4ad';c.fillRect(0,g.fy,C.w,C.h-g.fy);
      var tb=toBottom(st),ready=st.mode!=='dead'&&st.mode!=='stop'&&tb<.32&&tb>0;
      c.fillStyle=ready?'rgba(43,138,62,.85)':'rgba(43,138,62,.18)';c.beginPath();c.ellipse(C.w/2,g.fy+6*s,60*s,11*s,0,0,7);c.fill();
      if(ready&&st.mode!=='go'){c.fillStyle='#2b6e35';c.font='800 '+Math.round(22*s)+'px sans-serif';c.textAlign='center';c.fillText('ЖМИ!',C.w/2,g.fy+40*s);}
      var near=Math.max(0,Math.cos(st.ph-Math.PI));c.fillStyle='rgba(60,40,30,'+(.08+.35*near*near)+')';c.fillRect(g.lx,g.fy-2,g.rx-g.lx,4);
      kid(g,g.lx-10*s,'#3d6fc4','valerka','Валерка');kid(g,g.rx+10*s,'#c4466b','galya','Галя');
      var amp=g.fy-g.hy+30*s,yy=g.hy-30*s+amp*(1-Math.cos(st.ph))/2,front=Math.cos(st.ph)<0;
      var rope=function(){c.strokeStyle=front?'#d2352b':'rgba(210,53,43,.4)';c.lineWidth=front?5:3;c.beginPath();c.moveTo(g.lx+4,g.hy);c.quadraticCurveTo(C.w/2,2*yy-g.hy,g.rx-4,g.hy);c.stroke();};
      if(!front)rope();
      var jy=st.jt>=0?Math.sin(Math.PI*Math.min(1,st.jt/st.JT))*C.h*.17:0,cs=86*s,ci=cat();
      c.fillStyle='rgba(0,0,0,'+(.18-.1*jy/(C.h*.17))+')';c.beginPath();c.ellipse(C.w/2,g.fy,cs*.4,cs*.08,0,0,7);c.fill();
      if(ci)c.drawImage(ci,C.w/2-cs/2,g.fy-cs-jy+4,cs,cs);else{c.fillStyle='#f08c00';c.beginPath();c.arc(C.w/2,g.fy-cs/2-jy,cs/2.4,0,7);c.fill();}
      if(front)rope();
      c.textAlign='center';c.fillStyle='#25324a';c.font='800 '+Math.round(28*s)+'px sans-serif';if(st.mode==='go'||st.mode==='dead')c.fillText(String(st.sc),C.w/2,36*s);
      if(st.mode==='warm'||st.mode==='stop'){c.font='700 '+Math.round(15*s)+'px sans-serif';c.fillStyle='#6b7385';c.fillText('Разминка '+st.warm+' / '+WARM+' — ошибки не считаются',C.w/2,26*s);}
      if(pop){c.globalAlpha=Math.max(0,pop.a);c.fillStyle=pop.c;c.font='italic 800 '+Math.round(32*s)+'px sans-serif';c.fillText(pop.t,C.w/2,g.hy-70*s-(calm?0:(1-pop.a)*20));c.globalAlpha=1;}
      c.textAlign='left';
      if(st.mode==='demo'&&finger.parentNode){finger.style.top=(g.fy-14)+'px';finger.style.transform=!calm&&tb<.3?'translateY(10px) scale(.9)':'none';}}
    function end(){if(fin)return;fin=true;var x={sc:st.sc,st:tierOf(st.sc),label:u(st.sc)+' подряд.'+(st.why?' '+WHY[st.why]:'')};
      if(REC&&REC.finish)REC.finish(host,x);else host.finish(x);}
    st.api={bot:function(k){var m={};host.loop(function(){if(st.mode==='demo'){startPlay();return;}if(!fin&&botWant(st,k,m,Math.random))want=true;});},end:end,start:startPlay};
    f.say('Ять прыгает, когда верёвка внизу. Я считаю вслух!','happy');info();K.loop(host,draw);
    host.intro({who:'nina',text:'Валерка и Галя крутят скакалку, кот Ять прыгает. Сначала посмотри, как надо, — потом твоя очередь!',
      hint:host.pc?'Пробел или клик — прыжок':'Нажимай на экран — Ять прыгает',btn:'Смотреть показ'}).then(function(){f.main.appendChild(finger);f.main.appendChild(demo);});
  }});
})();
