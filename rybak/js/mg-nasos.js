/* rb2-LOVB (13.10.2026) — ловкостная №8 «Накачай лодку» (журнал hobby-analytics/release-i/rybak-boost2/logs/LOVB.md).
   Насос-лягушка: держи — качаешь (стрелка манометра ползёт рывками в такт «лягушке»), отпусти на черте. Стрелка по инерции доходит ещё чуть-чуть.
   Перекачал за красную черту — «пш-ш!». Две лодки по 3 камеры (левый борт, правый борт, дно): насос всё бойчее, у второй лодки — старый клапан (черта ниже).
   Очки за камеру: в точку (±1,2 %) 10 · близко (±3 %) 7 · рядом (±6 %) 4 · тугая 2 · мягкая 1 · лопнула 0. Всего до 60.
   Управление: держать палец на экране / кнопку «Качать»; ПК — держать Пробел (или ↑, W). Флаг `lov-nasos`. Объявлена в index.html (MGREC.add), файл грузит MGREC.play.
   Бот: DEF.bot(level) — без экрана (sim), на экране — o.bot. */
(function(){
'use strict';
var ID='nasos';
if(window.R2&&R2.off('lov-'+ID))return;
var MD=[20,36,50]; // ступени бота (числа рекордов — в index.html, MGREC.add)
function L2(ru,en){return typeof L==='function'?L(ru,en):ru;}
function kc(k){return window.MG&&MG.kc?MG.kc(k):'';}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function rng(seed){var a=seed>>>0||1;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var TAU=Math.PI*2,STOMP=.45,N=6;

/* ===================== физика камеры (общая для игры и бота) ===================== */
// k — номер камеры 0..5; c: {T черта, B лопнет, r скорость, p давление, h сколько держим, held, inr инерция, ph фаза качка, end}
function newCh(k,R,calm){var B=k<3?1:.9,T=k<3?.5+R()*.32:.45+R()*.3,r=(.24+.045*k+R()*.05)*(calm?.75:1);return {k:k,T:T,B:B,r:r,p:0,h:0,held:0,inr:0,ph:0,done:0,rel:0,res:-1};}
function pulse(ph){var s=Math.sin(ph*Math.PI/STOMP);return .3+.7*s*s;}
function stepCh(c,dt,down,calm){if(c.done)return;
  if(down&&!c.rel){c.held=1;c.h+=dt;c.ph+=dt;c.p+=c.r*(1+.5*Math.min(1,c.h/1.5))*pulse(c.ph)*dt;}
  else if(c.held){c.rel=1;c.held=0;c.inr=calm?.08:.14;}
  if(c.rel&&c.inr>0){var d=Math.min(dt,c.inr);c.inr-=d;c.ph+=d;c.p+=c.r*(1+.5*Math.min(1,c.h/1.5))*pulse(c.ph)*d*(c.inr/.14);}
  if(c.p>=c.B){c.p=c.B;c.res=0;c.done=1;return;}
  if(c.rel&&c.inr<=0){c.done=1;c.res=score(c);}}
function score(c){var d=c.p-c.T,a=Math.abs(d);return a<=.012?10:a<=.03?7:a<=.06?4:d>0?2:1;}
// автопилот: отпустить, когда давление + прикидка инерции дойдёт до черты; ошибка по уровню
function botWant(c,lv,R,st){if(st.aim==null){var sd=lv==='good'?.008:lv==='mid'?.028:.06;st.aim=c.T+(R()+R()+R()-1.5)*sd*2;}
  var rate=c.r*(1+.5*Math.min(1,c.h/1.5)),inr=rate*.14*.45, // в среднем за инерцию
    lag=lv==='good'?.06:lv==='mid'?.14:.22,cmp=lv==='good'?.8:lv==='mid'?.4:0; // запаздывание пальца и сколько игрок его учитывает
  return c.p-rate*.65*lag*(1-cmp)+inr<st.aim;}
function tierOf(s){return s>=MD[2]?3:s>=MD[1]?2:s>=MD[0]?1:0;}
function sim(lv,o){o=o||{};var R=rng(o.seed||((Math.random()*1e9)|0)),tot=0,dt=1/30;
  for(var k=0;k<N;k++){var c=newCh(k,R,o.calm),st={},t=0,go=false,delay=.3+R()*.3;
    while(!c.done&&t<20){t+=dt;if(t>delay)go=c.rel?false:botWant(c,lv||'good',R,st);stepCh(c,dt,go,o.calm);}tot+=Math.max(0,c.res);}
  return {score:tot,tier:tierOf(tot)};}

/* ===================== игра ===================== */
var CSS='.lvn{position:absolute;left:0;top:0;right:0;bottom:0}'+
 '.lvn-hud{position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);display:flex;gap:6px;z-index:4;pointer-events:none}'+
 '.lvn-hud b{padding:7px 12px;border-radius:14px;background:rgba(16,26,36,.6);font:700 17px var(--font,system-ui,sans-serif);color:#fff;white-space:nowrap}'+
 '.lvn-go{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);transform:translateX(-50%);min-width:220px;min-height:68px;border:0;border-radius:22px;z-index:4;'+
 'background:linear-gradient(180deg,#8fdc6a,#4fae3c);color:#123b10;font:800 22px var(--font,system-ui,sans-serif);box-shadow:0 6px 0 #2f7a24,0 10px 18px rgba(0,0,0,.3);touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent}'+
 '.lvn-go.on{transform:translate(-50%,5px);box-shadow:0 1px 0 #2f7a24,0 4px 10px rgba(0,0,0,.3)}.lvn-go .mg-kc{margin-left:8px}'+
 '.lvn-pop{position:absolute;left:50%;transform:translate(-50%,0);font:800 30px var(--font,system-ui,sans-serif);color:#ffe27a;text-shadow:0 2px 6px rgba(0,0,0,.6);pointer-events:none;transition:transform 1s ease-out,opacity 1s;z-index:5;white-space:nowrap}';
function css(){if(document.getElementById('lvnCss'))return;var s=document.createElement('style');s.id='lvnCss';s.textContent=CSS;document.head.appendChild(s);}
var CHN=[['левый борт','left side'],['правый борт','right side'],['дно','floor']];

function run(host,o){o=o||{};css();
  var calm=!!o.calm,bot=o.bot||'',R=rng(o.seed?(o.seed^0x2545f491)+((Math.random()*1e6)|0):(Math.random()*1e9)|0),A=host.art||window.MG_ART;
  var root=document.createElement('div');root.className='lvn';host.el.appendChild(root);
  var cv=host.canvas();root.appendChild(cv.c);var g=cv.g;
  root.insertAdjacentHTML('beforeend','<div class="lvn-hud"><b class="lvn-b"></b><b class="lvn-s"></b></div><button type="button" class="lvn-go">'+L2('Качать','Pump')+kc(L2('Пробел','Space'))+'</button>');
  var hb=root.querySelector('.lvn-b'),hs=root.querySelector('.lvn-s'),btn=root.querySelector('.lvn-go');
  var T=0,k=0,c=null,total=0,res=[],down=0,keyD=0,over=false,pause=0,shake=0,bst={},bdelay=0,burst=0,hiss=[],lastStomp=0;
  function say(t){if(!bot)host.say(t,L2('Петрович','Petrovich'));}
  function hud(){hb.textContent=L2('Лодка ','Boat ')+(k<3?1:2)+' · '+L2(CHN[k%3][0],CHN[k%3][1]);hs.textContent=total+' '+L2('очк.','pts');}
  function begin(i){k=i;c=newCh(i,R,calm);bst={};bdelay=.4+R()*.3;burst=0;hud();
    if(i===0)say(o.again?L2('Ещё разок! Держи — качай, отпусти на черте.','Once more! Hold to pump, let go at the line.'):L2('Держи — качай, отпусти на жёлтой черте!','Hold to pump, let go at the yellow line!'));
    else if(i===3)say(L2('Вторая лодка — клапан старый. Аккуратней!','Boat two — old valve. Careful!'));
    else if(i===1||i===4)say(L2('Теперь правый борт.','Now the right side.'));else say(L2('Дно. Насос разошёлся!','The floor. The pump\'s warmed up!'));}
  function popTxt(t,col){var d=document.createElement('div');d.className='lvn-pop';d.textContent=t;if(col)d.style.color=col;d.style.top=(cv.H*.36)+'px';root.appendChild(d);
    setTimeout(function(){d.style.transform='translate(-50%,-60px)';d.style.opacity='0';},40);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},1200);}
  function judge(){var r=c.res;total+=r;res.push(r);hud();
    if(r===0){burst=1;shake=.4;host.snd('bad');try{if(typeof buzz==='function')buzz(80);}catch(e){}popTxt(L2('Пш-ш-ш!','Pssst!'),'#ff6b5a');say(L2('Пш-ш-ш… Перекачал! Ладно, заклеим.','Pssst… Overdid it! We\'ll patch it.'));}
    else{host.snd(r>=7?'coin':'tap');popTxt('+'+r,r>=10?'#ffe27a':r>=7?'#c8f59a':'#e0e0e0');
      say(r===10?L2('В точку! Звенит, как барабан.','Spot on! Tight as a drum.'):r===7?L2('Хорошо накачал!','Nicely pumped!'):r===4?L2('Сойдёт. Почти.','That\'ll do. Almost.'):r===2?L2('Тугая! Чуть стравим.','Too tight! Let a bit out.'):L2('Мягковато… На такой не уплывёшь.','Too soft… won\'t float far.'));}
    pause=1.5;}
  function finish(){if(over)return;over=true;var line=res.map(function(r){return r===0?'💥':r>=10?'⭐':r;}).join(' · ');
    host.done({score:total,scoreTxt:L2('Очки','Points')+': <b>'+total+'</b>',extra:{line:L2('Камеры: ','Chambers: ')+line}});}
  function setDown(v){down=v;btn.classList.toggle('on',!!(down||keyD));}
  btn.addEventListener('pointerdown',function(e){e.preventDefault();try{btn.setPointerCapture(e.pointerId);}catch(x){}setDown(1);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){btn.addEventListener(n,function(){setDown(0);});});
  cv.c.addEventListener('pointerdown',function(e){if(e.button>0)return;e.preventDefault();try{cv.c.setPointerCapture(e.pointerId);}catch(x){}setDown(1);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){cv.c.addEventListener(n,function(){setDown(0);});});
  btn.addEventListener('contextmenu',function(e){e.preventDefault();});
  var KEY={' ':1,ArrowUp:1,w:1,W:1,'ц':1,'Ц':1};
  host.keys(function(kk){if(!KEY[kk])return false;keyD=1;btn.classList.add('on');return true;});
  host.keysUp(function(kk){if(!KEY[kk])return false;keyD=0;btn.classList.toggle('on',!!down);return true;});
  host.kbd(L2('Держи <b>Пробел</b> — качать, отпусти на черте','Hold <b>Space</b> to pump, release at the line'),8);
  host.amb('water');
  begin(0);
  host.loop(function(dt){if(over)return;T+=dt;var n=bot?3:1,h=dt;
    for(var s=0;s<n;s++){if(pause>0){pause-=h;if(pause<=0){if(k>=N-1){finish();return;}begin(k+1);}continue;}
      var dn=bot?(bdelay>0?(bdelay-=h,false):(!c.rel&&botWant(c,bot,R,bst))):!!(down||keyD);
      var ph0=c.ph;stepCh(c,h,dn,calm);
      if(c.held&&Math.floor(c.ph/STOMP)!==Math.floor(ph0/STOMP))host.snd('tap');
      if(c.done&&pause<=0){judge();}}
    shake=Math.max(0,shake-dt);if(burst)hiss.push({x:0,y:0,t:0});for(var i=hiss.length-1;i>=0;i--){hiss[i].t+=dt;if(hiss[i].t>.8)hiss.splice(i,1);}if(hiss.length>40)hiss.splice(0,hiss.length-40);
    draw();});

  /* ---------- рисунок: берег Селигера, лодка, лягушка-насос, манометр ---------- */
  function draw(){var W=cv.W,H=cv.H,u=Math.min(W,H)/100;g.save();if(shake>0)g.translate((R()-.5)*shake*16,(R()-.5)*shake*10);
    var hz=H*.42,gr=g.createLinearGradient(0,0,0,hz);gr.addColorStop(0,'#7fb8e6');gr.addColorStop(1,'#d8eef7');g.fillStyle=gr;g.fillRect(-20,-20,W+40,hz+20);
    // дальний берег, лес
    g.fillStyle='#4b7a4a';g.beginPath();g.moveTo(-10,hz);for(var x=-10;x<=W+20;x+=u*4)g.lineTo(x,hz-u*(3+2.4*Math.abs(Math.sin(x*.07))+1.6*Math.abs(Math.sin(x*.023))));g.lineTo(W+20,hz);g.fill();
    var wg=g.createLinearGradient(0,hz,0,H*.66);wg.addColorStop(0,'#5d9bb8');wg.addColorStop(1,'#3d7896');g.fillStyle=wg;g.fillRect(-20,hz,W+40,H*.66-hz);
    g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1.5;for(var yy=hz+u*3,rw=0;yy<H*.66;yy+=u*4,rw++){for(var xx=((T*8+rw*30)%60)-60;xx<W;xx+=60){g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+u*5,yy);g.stroke();}}
    // песок
    var sg=g.createLinearGradient(0,H*.64,0,H);sg.addColorStop(0,'#e3cf9b');sg.addColorStop(1,'#c9ad72');g.fillStyle=sg;g.beginPath();g.moveTo(-10,H*.66);g.quadraticCurveTo(W*.5,H*.62,W+10,H*.67);g.lineTo(W+10,H+10);g.lineTo(-10,H+10);g.fill();
    gauge(W*.5,H*.4,Math.min(W*.25,H*.12),u);
    var by=H*.72,bw=Math.min(W*.6,H*.42);boat(W*.55,by,bw,u);
    frog(W*.13,H*.775,u);
    try{if(A&&A.petr)A.petr(g,W*.88,H*.9,Math.min(H*.2,W*.3),T,{arm:c&&c.held?'point':'talk',face:c&&c.res===0?'wow':'smile',look:-1});}catch(e){}
    g.restore();}
  function gauge(x,y,r,u){var a0=Math.PI*.8,a1=Math.PI*2.2,ang=function(v){return a0+(a1-a0)*clamp(v,0,1.15)/1.15;};
    g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(x+3,y+4,r*1.08,0,TAU);g.fill();
    g.fillStyle='#e9e4d6';g.beginPath();g.arc(x,y,r*1.08,0,TAU);g.fill();g.strokeStyle='#6b6f73';g.lineWidth=r*.08;g.stroke();
    g.fillStyle='#fbf8ef';g.beginPath();g.arc(x,y,r*.97,0,TAU);g.fill();
    if(c){// красная зона
      g.lineWidth=r*.16;g.strokeStyle='#e0533f';g.beginPath();g.arc(x,y,r*.8,ang(c.B),ang(1.15));g.stroke();
      // жёлтая черта и зелёный коридор
      g.strokeStyle='rgba(120,200,90,.85)';g.beginPath();g.arc(x,y,r*.8,ang(c.T-.04),ang(c.T+.04));g.stroke();
      g.strokeStyle='#f2b51c';g.lineWidth=r*.07;var at=ang(c.T);g.beginPath();g.moveTo(x+Math.cos(at)*r*.6,y+Math.sin(at)*r*.6);g.lineTo(x+Math.cos(at)*r*.98,y+Math.sin(at)*r*.98);g.stroke();}
    g.strokeStyle='#4a4f55';g.lineWidth=Math.max(1,r*.025);for(var i=0;i<=11;i++){var a=ang(i/10),l=i%5?.86:.78;g.beginPath();g.moveTo(x+Math.cos(a)*r*l,y+Math.sin(a)*r*l);g.lineTo(x+Math.cos(a)*r*.93,y+Math.sin(a)*r*.93);g.stroke();}
    var p=c?c.p:0,an=ang(p)+(c&&c.held?Math.sin(T*40)*.012:0);g.strokeStyle='#c0392b';g.lineWidth=r*.05;g.lineCap='round';g.beginPath();g.moveTo(x-Math.cos(an)*r*.15,y-Math.sin(an)*r*.15);g.lineTo(x+Math.cos(an)*r*.82,y+Math.sin(an)*r*.82);g.stroke();
    g.fillStyle='#3a3f45';g.beginPath();g.arc(x,y,r*.09,0,TAU);g.fill();
    g.fillStyle='#4a4f55';g.font='700 '+Math.round(Math.max(15,r*.17))+'px Golos Text,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(L2('атм','atm'),x,y+r*.42);}
  function boat(x,y,w,u){var hgt=w*.34;g.save();g.translate(x,y);
    g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,hgt*.5,w*.52,hgt*.22,0,0,TAU);g.fill();
    // три камеры: левый борт (дальний), правый борт (ближний), дно
    var fill=function(i){if(!c)return 1;var j=k%3;return i<j?1:i>j?.12:clamp(c.p/c.T,0,1.15);};
    var col=k<3?['#f08a3c','#e0762b']:['#6f9c4a','#5a8a3a'];
    for(var i=0;i<3;i++){var f=fill(i),cur=c&&i===k%3,th=hgt*(.16+.22*Math.min(1,f)),yy=i===0?-hgt*.18:i===1?hgt*.18:hgt*.02;
      if(i===2){g.fillStyle=f>.5?'#3d4a52':'#55636b';g.beginPath();g.ellipse(0,yy,w*.42,hgt*.18*(.5+.5*Math.min(1,f)),0,0,TAU);g.fill();continue;}
      g.fillStyle=f<.4?col[1]:col[0];g.beginPath();g.ellipse(0,yy,w*.5*(.82+.18*Math.min(1,f)),th,0,0,TAU);g.fill();
      if(f<.85){g.strokeStyle='rgba(0,0,0,.22)';g.lineWidth=1.5;for(var m=-3;m<=3;m++){g.beginPath();g.moveTo(m*w*.11,yy-th*.6);g.quadraticCurveTo(m*w*.11+u*1.5,yy,m*w*.11,yy+th*.6);g.stroke();}}
      g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(-w*.12,yy-th*.45,w*.22,th*.18,0,0,TAU);g.fill();
      if(cur){g.strokeStyle='rgba(255,236,140,'+(.5+.4*Math.sin(T*6))+')';g.lineWidth=3;g.beginPath();g.ellipse(0,yy,w*.5*(.82+.18*Math.min(1,f))+3,th+3,0,0,TAU);g.stroke();}}
    // уключины и вёсла
    g.fillStyle='#8a8f94';g.fillRect(-u*.8,-hgt*.42,u*1.6,u*2);
    if(burst){for(var h2=0;h2<hiss.length;h2++){var q=hiss[h2].t/.8;g.strokeStyle='rgba(255,255,255,'+(.7*(1-q))+')';g.lineWidth=2;g.beginPath();g.arc(w*.3+q*u*10,-hgt*.2-q*u*8,u*(1+q*3),0,TAU);g.stroke();}}
    g.restore();
    // шланг от лягушки к лодке
    var W=cv.W,H=cv.H;g.strokeStyle='#2f3b40';g.lineWidth=Math.max(3,u*1.1);g.lineCap='round';g.beginPath();g.moveTo(W*.13+u*8,H*.775+u*1);g.bezierCurveTo(W*.13+u*14,H*.775+u*6,x-w*.6,y+hgt*.5,x-w*.45,y+hgt*.18);g.stroke();}
  function frog(x,y,u){var sq=c&&(c.held||c.inr>0)?pulse(c.ph):0,s=u*9;g.save();g.translate(x,y);g.scale(1+sq*.12,1-sq*.28);
    g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(0,s*.55,s*1.1,s*.25,0,0,TAU);g.fill();
    g.fillStyle='#5fae45';g.beginPath();g.ellipse(0,0,s,s*.62,0,0,TAU);g.fill();g.fillStyle='#4a9436';g.beginPath();g.ellipse(0,s*.3,s*.9,s*.3,0,0,Math.PI);g.fill();
    g.fillStyle='#5fae45';g.beginPath();g.arc(-s*.45,-s*.5,s*.3,0,TAU);g.arc(s*.45,-s*.5,s*.3,0,TAU);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(-s*.45,-s*.52,s*.2,0,TAU);g.arc(s*.45,-s*.52,s*.2,0,TAU);g.fill();
    g.fillStyle='#222';g.beginPath();g.arc(-s*.42,-s*.5,s*.1*(1-sq*.6),0,TAU);g.arc(s*.48,-s*.5,s*.1*(1-sq*.6),0,TAU);g.fill();
    g.strokeStyle='#2c5a20';g.lineWidth=2;g.beginPath();g.arc(0,-s*.1,s*.35,.2,Math.PI-.2);g.stroke();
    g.restore();
}
  if(window.__lvbTest!==undefined)window.__lvbTest={get c(){return c;},get total(){return total;}};}

var DEF={id:ID,n:{ru:'Накачай лодку',en:'Pump the boat'},icon:'<path d="M3 15c0-2 2-3 4-3h10c2 0 4 1 4 3s-2 3-4 3H7c-2 0-4-1-4-3z" fill="currentColor" opacity=".35"/><path d="M3 15c0-2 2-3 4-3h10c2 0 4 1 4 3s-2 3-4 3H7c-2 0-4-1-4-3zM12 12V5M9 5h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  kind:'lov',run:run,bot:function(lv,o){return sim(lv,o);},sim:sim};
(window.MG_REG?window.MG_REG:function(d){(window.MG_PEND=window.MG_PEND||[]).push(d);})(DEF);
window.LOVB_NASOS={sim:sim,newCh:newCh,stepCh:stepCh};
})();
