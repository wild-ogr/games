/* rb2-LOVB (13.10.2026) — ловкостная №1 «Причаль лодку» (журнал hobby-analytics/release-i/rybak-boost2/logs/LOVB.md).
   Дед Митяй с мостков: «Левее! Табань!». Два весла и «Табань», течение сносит вбок, место — между лодками соседей. 3 лодки: место всё уже, течение сильнее.
   Порт идеи «Парковки» Выезда (VYPE: подсказки деда, клавиши, «бум» при касании, решаемость ботом) — руль/газ заменены вёслами.
   Управление: телефон — 4 кнопки внизу (держать — гребок раз в 0,5 с); ПК — ← левое весло, → правое, ↑ оба, ↓ табань (A/D/W/S, Ф/В/Ц/Ы).
   Очки за лодку: 10 − 2 за касание − 1 за каждые 3 с после 10-й + 2 «ровно» (не меньше 2); 25 с не причалил — Митяй подтянет верёвкой (+1). Всего до 36.
   Флаг `lov-prichal` (выключен — игры нет). Объявлена в index.html (MGREC.add, метка rb2:LOVB), файл грузит MGREC.play (R2.need). Рекорд/соседи/«Ещё разок» — оболочка MGREC.
   Бот: DEF.bot(level) — без экрана (sim), ?mg=prichal&bot=good — на экране, ускоренно. Зимняя шкурка «Санки к лунке» — 1.12–28.02 (флаг SEASON `lunka` выключен — нет), o.skin==='ice' или ?skin=ice; RSEZ.ice() SEASON — если появится. */
(function(){
'use strict';
var ID='prichal';
if(window.R2&&R2.off('lov-'+ID))return;
var REC={md:[12,22,30]}; // числа рекордов — в index.html (MGREC.add), здесь только для ступени бота
function L2(ru,en){return typeof L==='function'?L(ru,en):ru;}
function kc(k){return window.MG&&MG.kc?MG.kc(k):'';}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function rng(seed){var a=seed>>>0||1;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var TAU=Math.PI*2,STROKE=.5,TMAX=25;
function winter(){if(/[?&]skin=ice/.test(location.search))return true;if(/[?&]skin=/.test(location.search))return false;if(window.R2&&R2.off('lunka'))return false;
  try{if(window.RSEZ&&typeof RSEZ.ice==='function')return !!RSEZ.ice();}catch(e){}var d=new Date(typeof nowMs==='function'?nowMs():Date.now()),m=d.getMonth()+1;return m===12||m===1||m===2;}

/* ===================== физика (общая для игры и бота без экрана) ===================== */
// st: W,H, L (длина лодки), bw (ширина), py (край мостков), sx (середина места), sw (шаг между лодками), c (течение, пикс/с), x,y,a,v,w
function newBoat(st,i,R,calm){var W=st.W,H=st.H,L=Math.min(H*.15,W*.2);st.L=L;st.bw=L*.42;st.py=H*.27;
  var k=[2.45,2.1,1.82][i];st.sw=st.bw*k;var cs=[.04,.065,.09][i]*H*(calm?.6:1);st.cd=i===0?1:(R()<.5?-1:1);st.c=cs*st.cd;
  st.sx=W*(.3+R()*.4);st.x=clamp(st.sx+(R()-.5)*W*.5-st.cd*W*.08,st.bw,W-st.bw);st.y=H*.73;st.a=(R()-.5)*.5;st.v=0;st.w=0;
  st.tb=0;st.touch=0;st.cool=0;st.sT=0;st.bT=0;st.sl=0;st.sr=0;st.done=0;st.boat=i;st.gust=R()*TAU;
  st.moored=[];for(var j=-4;j<=4;j++){if(!j)continue;var x=st.sx+j*st.sw;if(x>-st.bw&&x<W+st.bw)st.moored.push({x:x,col:j});}}
// точки корпуса: нос, плечи, корма
function hull(st){var s=Math.sin(st.a),c=Math.cos(st.a),hl=st.L/2,hw=st.bw/2,P=[[0,-hl],[hw*.9,-hl*.35],[-hw*.9,-hl*.35],[hw*.85,hl],[-hw*.85,hl]],o=[];
  for(var i=0;i<P.length;i++){var px=P[i][0],py=P[i][1];o.push([st.x+px*c-py*s,st.y+px*s+py*c]);}return o;}
// шаг: inp {l,r,b}; ev(тип, данные) — события для экрана (stroke, bump, dock, rope)
function step(st,dt,inp,calm,ev){var H=st.H,W=st.W;st.tb+=dt;st.cool-=dt;st.sT-=dt;st.bT-=dt;st.gust+=dt*.9;
  if(st.done)return;
  var imp=st.L*1.3,turn=1.0,l=inp.l,r=inp.r;
  if((l||r)&&st.sT<=0){st.sT=STROKE;if(l&&r){st.v+=imp;}else{st.v+=imp*.7;st.w+=l?turn:-turn;}if(l)st.sl=1;if(r)st.sr=1;ev&&ev('stroke',l&&r?0:l?-1:1);}
  if(inp.b&&st.bT<=0){st.bT=STROKE;st.v-=imp*.9;st.w*=.5;st.sl=st.sr=-1;ev&&ev('back');}
  st.v*=Math.exp(-1.1*dt);st.w*=Math.exp(-2.4*dt);st.v=clamp(st.v,-st.L*1.2,st.L*3.2);
  st.a=clamp(st.a+st.w*dt,-1.5,1.5);
  var cur=st.c*(1+.25*Math.sin(st.gust))*nearK(st); // у мостков течение слабее (заводь)
  st.x+=Math.sin(st.a)*st.v*dt+cur*dt;st.y-=Math.cos(st.a)*st.v*dt;
  if(st.x<st.bw*.6){st.x=st.bw*.6;}if(st.x>W-st.bw*.6){st.x=W-st.bw*.6;}
  var yMax=H-H*.2;if(st.y>yMax){st.y=yMax;if(st.v<0)st.v=0;}
  var hit='';
  // соседские лодки — твёрдые: выталкиваем вбок
  var P=hull(st);for(var i=0;i<P.length;i++)for(var j=0;j<st.moored.length;j++){var m=st.moored[j],dx=P[i][0]-m.x,hw=st.bw*.52;
    if(Math.abs(dx)<hw&&P[i][1]<st.py+st.L*.98&&P[i][1]>st.py-4){st.x+=(dx<0?-1:1)*(hw-Math.abs(dx)+.5);if(i===0||P[i][1]<st.py+st.L*.9)st.y+=Math.max(0,st.py+st.L*.98-P[i][1])*.15;hit=hit||'side';P=hull(st);}}
  // мостки — твёрдые
  var bow=P[0],mn=Math.min(P[0][1],P[1][1],P[2][1]);
  if(mn<=st.py+1.5){var inSlot=Math.abs(st.x-st.sx)<(st.sw-st.bw)/2+st.bw*.15;
    if(inSlot&&bow[1]<=st.py+2&&Math.abs(st.a)<.38&&st.v>=-1){var even=Math.abs(st.a)<.12,p=10-2*Math.min(3,st.touch)-Math.max(0,Math.floor((st.tb-10)/3))+(even?2:0);p=Math.max(2,p);
      st.pts=p;st.even=even;st.done=1;st.v=0;st.w=0;ev&&ev('dock',p);return;}
    st.y+=st.py+1.5-mn;hit=hit||(inSlot?'crook':'miss');}
  if(hit){if(st.v>0)st.v=-st.v*.35-st.L*.15;st.w*=.5;if(st.cool<=0){st.cool=.8;st.touch++;ev&&ev('bump',hit);}}
  if(!st.done&&st.tb>(calm?TMAX+10:TMAX)){st.pts=1;st.even=false;st.done=1;ev&&ev('rope',1);}}
function nearK(st){var d=(st.y-st.L/2-st.py)/st.L;return d<.3?.3:d<1.5?.3+.7*(d-.3)/1.2:1;}
// автопилот: перебор двух гребков вперёд (5×5 действий по 0,5 с + 0,5 с по инерции) на копии физики; lv — доля случайных ошибок
var ACT=[{l:0,r:0,b:0},{l:1,r:0,b:0},{l:0,r:1,b:0},{l:1,r:1,b:0},{l:0,r:0,b:1}];
function cl(st){var o={};for(var k in st)o[k]=st[k];return o;}
function cost(s){if(s.done)return s.pts>=2?-100+(12-s.pts)*3:60;var L=s.L,dy=s.y-L/2-s.py,dx=Math.abs(s.x-s.sx)/L;
  return dx*3+Math.abs(s.a)*(dy<L*2?4:1)+Math.max(0,dy)/L*1.6+s.touch*8+(dy<L*1.6?Math.max(0,s.v-L*.9)/L*2:0)+(dy<L*1.1&&dx>.3?3:0);}
function pilot(st,lv,R){var err=lv==='bad'?.4:lv==='mid'?.16:0;if(err&&R()<err)return ACT[(R()*5)|0];
  var best=1e9,bi=3,dt=1/30;
  for(var i=0;i<5;i++)for(var j=0;j<5;j++){var s=cl(st),n;for(n=0;n<15&&!s.done;n++)step(s,dt,ACT[i]);for(n=0;n<15&&!s.done;n++)step(s,dt,ACT[j]);for(n=0;n<15&&!s.done;n++)step(s,dt,ACT[0]);
    var c=cost(s);if(c<best){best=c;bi=i;}}
  return ACT[bi];}
function tierOf(s){return s>=REC.md[2]?3:s>=REC.md[1]?2:s>=REC.md[0]?1:0;}
// бот без экрана: та же физика шагом 1/30 с, телефон 360×600
function sim(lv,o){o=o||{};var R=rng(o.seed||((Math.random()*1e9)|0)),st={W:360,H:600},tot=0,dt=1/30,hold=0,inp={l:0,r:0,b:0};
  for(var i=0;i<3;i++){newBoat(st,i,R,o.calm);var t=0;while(!st.done&&t<60){if(hold<=0){inp=pilot(st,lv||'good',R);hold=lv==='bad'?.35:lv==='mid'?.25:.2;}hold-=dt;step(st,dt,inp,o.calm);t+=dt;}tot+=st.pts||0;}
  return {score:tot,tier:tierOf(tot)};}

/* ===================== игра ===================== */
var CSS='.lvp{position:absolute;left:0;top:0;right:0;bottom:0}.lvp canvas{position:absolute;left:0;top:0;width:100%;height:100%}'+
 '.lvp-hud{position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);display:flex;gap:6px;z-index:4;pointer-events:none}'+
 '.lvp-hud b{padding:7px 12px;border-radius:14px;background:rgba(16,26,36,.6);font:700 17px var(--font,system-ui,sans-serif);color:#fff;white-space:nowrap}'+
 '.lvp-ctl{position:absolute;left:0;right:0;bottom:0;padding:8px 8px calc(env(safe-area-inset-bottom,0px) + 10px);display:flex;gap:8px;justify-content:center;z-index:4}'+
 '.lvp-ctl button{flex:1 1 0;max-width:120px;min-height:68px;border:0;border-radius:18px;background:linear-gradient(180deg,#f3e2c0,#d6b47e);color:#3b2a12;font:700 16px var(--font,system-ui,sans-serif);'+
 'box-shadow:0 5px 0 #9c7a48,0 8px 16px rgba(0,0,0,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;touch-action:none;-webkit-tap-highlight-color:transparent;cursor:pointer;position:relative}'+
 '.lvp-ctl button svg{width:30px;height:30px;display:block}.lvp-ctl button.on{transform:translateY(4px);box-shadow:0 1px 0 #9c7a48,0 3px 8px rgba(0,0,0,.3);background:linear-gradient(180deg,#ffe9b8,#f0c27a)}'+
 '.lvp-ctl button.bk{background:linear-gradient(180deg,#cfe3ef,#97bfd6);box-shadow:0 5px 0 #5f8aa3,0 8px 16px rgba(0,0,0,.3);color:#13324a}.lvp-ctl button.bk.on{box-shadow:0 1px 0 #5f8aa3}'+
 '.lvp-ctl .mg-kc{position:absolute;right:6px;top:4px}'+
 '.lvp-pop{position:absolute;left:50%;transform:translate(-50%,0);font:800 30px var(--font,system-ui,sans-serif);color:#ffe27a;text-shadow:0 2px 6px rgba(0,0,0,.6);pointer-events:none;transition:transform 1s ease-out,opacity 1s;z-index:5;white-space:nowrap}';
function css(){if(document.getElementById('lvpCss'))return;var s=document.createElement('style');s.id='lvpCss';s.textContent=CSS;document.head.appendChild(s);}
var IC={l:'<svg viewBox="0 0 24 24"><path d="M19 15a7 7 0 1 1-3-9.3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M13 2.5l4 3.4-4.6 2.6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',f:'<svg viewBox="0 0 24 24"><path d="M6 12l6-6 6 6M6 19l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',b:'<svg viewBox="0 0 24 24"><path d="M6 5l6 6 6-6M6 12l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',r:'<svg viewBox="0 0 24 24"><path d="M5 15a7 7 0 1 0 3-9.3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M11 2.5l-4 3.4 4.6 2.6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
var COLS=['#c9573b','#3d7fb0','#5f9b4a','#d1a13a','#8a5fb0','#3aa6a0'];
var NB=[['Генки','Genka\'s'],['Михалыча','Mikhalych\'s'],['Кольки','Kolka\'s'],['Петровича','Petrovich\'s']];

function run(host,o){o=o||{};css();
  var calm=!!o.calm,bot=o.bot||'',ice=o.skin==='ice'||winter(),R=rng(o.seed?(o.seed^0x5bd1e995)+((Math.random()*1e6)|0):(Math.random()*1e9)|0),A=host.art||window.MG_ART;
  var root=document.createElement('div');root.className='lvp';host.el.appendChild(root);
  var cv=host.canvas();root.appendChild(cv.c);var g=cv.g;
  root.insertAdjacentHTML('beforeend','<div class="lvp-hud"><b class="lvp-b"></b><b class="lvp-s"></b></div><div class="lvp-ctl">'+
    '<button type="button" data-k="l">'+IC.l+''+(ice?L2('Левая','Left'):L2('Левое','Left'))+kc('←')+'</button>'+
    '<button type="button" data-k="f">'+IC.f+''+(ice?L2('Обе','Both'):L2('Оба','Both'))+kc('↑')+'</button>'+
    '<button type="button" class="bk" data-k="b">'+IC.b+''+(ice?L2('Тормоз','Brake'):L2('Табань','Back'))+kc('↓')+'</button>'+
    '<button type="button" data-k="r">'+IC.r+''+(ice?L2('Правая','Right'):L2('Правое','Right'))+kc('→')+'</button></div>');
  var hb=root.querySelector('.lvp-b'),hs=root.querySelector('.lvp-s'),ctl=root.querySelector('.lvp-ctl');
  var st={W:0,H:0},T=0,total=0,boat=0,res=[],pops=[],splash=[],wake=[],hintK='',hintT=0,shake=0,over=false,pause=0,botHold=0,botInp={l:0,r:0,b:0},lastPts=0;
  var hold={l:0,r:0,f:0,b:0},keyH={};
  function sz(){st.W=cv.W;st.H=cv.H;}
  sz();
  function say(t){if(!bot)host.say(t,L2('Митяй','Mityay'));}
  function begin(i){var px=st.x!=null?{W:st.W,H:st.H}:null;newBoat(st,i,R,calm);boat=i;wake=[];
    if(ice)say(i===0?L2('Санки к лунке! Палками толкайся, позёмка сносит.','Sled to the ice hole! Push with the poles, the snow drift pushes you.'):i===1?L2('Вторые санки! Ветер крепчает.','Second sled! The wind is picking up.'):L2('Последние — к самой тесной лунке.','Last one — to the tightest hole.'));
    else say(i===0&&o.again?L2('Ещё разок! Давай к мосткам.','Once more! To the pier.'):i===0?L2('Давай, внучок, к мосткам! Вон место между лодками.','Come on, sonny, to the pier! There\'s a gap between the boats.'):
      i===1?L2('Вторая! Течение покрепче — бери с запасом.','Boat two! Stronger current — allow for it.'):L2('Последняя, самая узкая щель. Не торопись!','Last one, the tightest spot. Don\'t rush!'));
    hud();}
  function hud(){hb.textContent=(ice?L2('Санки ','Sled '):L2('Лодка ','Boat '))+(boat+1)+'/3';hs.textContent=total+' '+L2('очк.','pts');}
  // события физики → звук, тряска, реплики
  function ev(k,x){if(k==='stroke'){host.snd('splash');for(var i=0;i<2;i++)if(x<=0&&i===0||x>=0&&i===1)oarSplash(i?1:-1);}
    else if(k==='back'){host.snd('tap');oarSplash(-1);oarSplash(1);}
    else if(k==='bump'){shake=.35;host.snd('bad');try{if(typeof buzz==='function')buzz(40);}catch(e){}
      say(x==='side'?(ice?L2('Тише! Генкины санки перевернёшь!','Easy! You\'ll tip Genka\'s sled!'):pick([L2('Тише! Борт Генке поцарапаешь!','Easy! You\'ll scratch Genka\'s boat!'),L2('Ай! Это ж Михалыча лодка!','Ouch! That\'s Mikhalych\'s boat!')])):x==='crook'?L2('Криво заходишь! Выпрямляй!','You\'re crooked! Straighten up!'):L2('Мимо места! Табань, сдай назад.','Missed the spot! Back up.'));}
    else if(k==='dock'){total+=x;lastPts=x;host.snd('coin');popTxt('+'+x+(st.even?' '+L2('ровно!','straight!'):''));
      say(st.even?L2('Как по линеечке! Молодец, внучок.','Straight as a ruler! Well done.'):st.touch?L2('Причалил! Борта только береги.','Docked! Mind the sides though.'):L2('Причалил! Чисто!','Docked! Clean!'));pause=1.4;hud();res.push({p:x,t:st.touch,e:st.even});}
    else if(k==='rope'){total+=1;popTxt('+1');say(L2('Ладно, подтяну верёвкой… +1','Fine, I\'ll pull you in with a rope… +1'));pause=1.6;hud();res.push({p:1,t:st.touch,e:false,rope:1});}}
  function pick(a){return a[(R()*a.length)|0];}
  function oarSplash(side){var s=Math.sin(st.a),c=Math.cos(st.a),ox=side*st.bw*1.1,oy=st.L*.08;splash.push({x:st.x+ox*c-oy*s,y:st.y+ox*s+oy*c,t:0});}
  function popTxt(t){var d=document.createElement('div');d.className='lvp-pop';d.textContent=t;d.style.top=(st.py+st.L*.2)+'px';root.appendChild(d);
    pops.push(d);setTimeout(function(){d.style.transform='translate(-50%,-60px)';d.style.opacity='0';},40);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},1200);}
  function hint(){var dx=st.sx-st.x,h='';if(Math.abs(st.a)>.6)h=L2('Выпрямляй лодку!','Straighten the boat!');
    else if(st.y-st.py<st.L*1.8&&st.v>st.L*1.8)h=L2('Табань! Табань!','Back! Back!');
    else if(dx<-st.bw*.8)h=L2('Левее!','More left!');else if(dx>st.bw*.8)h=L2('Правее!','More right!');else h=L2('Так, так… прямо!','That\'s it… straight!');
    if(h!==hintK||hintT<-4){hintK=h;hintT=2.2;say(h);}}
  function finish(){if(over)return;over=true;
    var line=res.map(function(r,i){return '<span style="white-space:nowrap">'+(r.rope?'⚓':r.e?'⭐':'🛶')+'\u00a0'+r.p+'</span>';}).join(' · ');
    host.done({score:total,scoreTxt:L2('Очки','Points')+': <b>'+total+'</b>',extra:{line:(ice?L2('Санки: ','Sleds: '):L2('Лодки: ','Boats: '))+line}});}
  // ввод
  function inp(){if(bot)return botInp;var f=hold.f||keyH.f;return {l:hold.l||keyH.l||f,r:hold.r||keyH.r||f,b:hold.b||keyH.b};}
  function setBtn(k,on){var b=ctl.querySelector('[data-k="'+k+'"]');if(b)b.classList.toggle('on',!!on);}
  Array.prototype.forEach.call(ctl.querySelectorAll('button'),function(b){var k=b.getAttribute('data-k'),pid=null;
    b.addEventListener('pointerdown',function(e){e.preventDefault();pid=e.pointerId;try{b.setPointerCapture(pid);}catch(x){}hold[k]=1;b.classList.add('on');});
    var up=function(){hold[k]=0;b.classList.remove('on');};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);
    b.addEventListener('contextmenu',function(e){e.preventDefault();});});
  var KM={ArrowLeft:'l',a:'l',A:'l','ф':'l','Ф':'l',ArrowRight:'r',d:'r',D:'r','в':'r','В':'r',ArrowUp:'f',w:'f',W:'f','ц':'f','Ц':'f',ArrowDown:'b',s:'b',S:'b','ы':'b','Ы':'b'};
  host.keys(function(k){var m=KM[k];if(!m)return false;keyH[m]=1;setBtn(m,1);return true;});
  host.keysUp(function(k){var m=KM[k];if(!m)return false;keyH[m]=0;setBtn(m,0);return true;});
  host.kbd(L2('<b>←</b> <b>→</b> — вёсла · <b>↑</b> — оба · <b>↓</b> — табань','<b>←</b> <b>→</b> — oars · <b>↑</b> — both · <b>↓</b> — back'),8);
  host.onResize(function(){var ox=st.x/st.W,oy=st.y/st.H,osx=st.sx/st.W;sz();if(isFinite(ox)){var k=Math.min(st.H*.15,st.W*.2)/st.L;st.x=ox*st.W;st.y=oy*st.H;st.sx=osx*st.W;st.L*=k;st.bw*=k;st.sw*=k;st.c*=k;st.py=st.H*.27;
    var j=0;st.moored.forEach(function(m){m.x=st.sx+m.col*st.sw;});}});
  host.amb('water');
  begin(0);
  host.loop(function(dt){if(over)return;T+=dt;var n=bot?6:1,h=dt; // бот — ускоренно
    for(var s=0;s<n;s++){if(pause>0){pause-=h;if(pause<=0){if(boat>=2){finish();return;}begin(boat+1);}continue;}
      if(bot){botHold-=h;if(botHold<=0){botInp=pilot(st,bot,R);botHold=bot==='bad'?.35:bot==='mid'?.25:.2;}}
      step(st,h,inp(),calm,ev);if(st.done&&pause<=0)pause=1.4;
      if(!st.done){hintT-=h;if(T>1.5&&hintT<=0)hint();}}
    st.sl*=Math.exp(-dt*5);st.sr*=Math.exp(-dt*5);shake=Math.max(0,shake-dt);
    if(!st.done&&Math.abs(st.v)>st.L*.3&&(wake.length===0||Math.hypot(wake[wake.length-1].x-st.x,wake[wake.length-1].y-st.y)>st.L*.18))wake.push({x:st.x+Math.sin(st.a)*st.L*.5,y:st.y+Math.cos(st.a)*st.L*.5,t:0,a:st.a});
    for(var i=wake.length-1;i>=0;i--){wake[i].t+=dt;wake[i].x+=st.c*dt;if(wake[i].t>1.6)wake.splice(i,1);}
    for(i=splash.length-1;i>=0;i--){splash[i].t+=dt;if(splash[i].t>.6)splash.splice(i,1);}
    draw();});

  /* ---------- рисунок ---------- */
  function draw(){var W=st.W,H=st.H,u=Math.min(W,H)/100;g.save();if(shake>0)g.translate((R()-.5)*shake*14,(R()-.5)*shake*10);
    // вода
    var gr=g.createLinearGradient(0,0,0,H);if(ice){gr.addColorStop(0,'#dfeaf2');gr.addColorStop(1,'#b8cfdd');}else{gr.addColorStop(0,'#3f8197');gr.addColorStop(.5,'#2c6c84');gr.addColorStop(1,'#1d5068');}g.fillStyle=gr;g.fillRect(-20,-20,W+40,H+40);
    // струи течения
    g.strokeStyle=ice?'rgba(255,255,255,.5)':'rgba(255,255,255,.14)';g.lineWidth=2;g.lineCap='round';var off=((T*st.c)%120+120)%120;
    for(var y=st.py+st.L*1.2,row=0;y<H;y+=u*9,row++)for(var x=-120+off+(row%3)*40;x<W+120;x+=120){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+u*4,y-u*1.4,x+u*8,y);g.stroke();}
    // кувшинки по краям
    if(!ice){var Rr=rng(11);for(var i=0;i<6;i++){var lx=(i%2?W-u*6:u*6)+(Rr()-.5)*u*6,ly=st.py+st.L*1.4+Rr()*(H*.45);g.fillStyle='#4f8f3c';g.beginPath();g.arc(lx,ly,u*3.2,.4,TAU-.1);g.lineTo(lx,ly);g.fill();if(i===2){g.fillStyle='#f4f0f6';g.beginPath();g.arc(lx+u,ly-u,u*1.3,0,TAU);g.fill();}}}
    // след
    for(i=0;i<wake.length;i++){var wk=wake[i],k=wk.t/1.6;g.strokeStyle='rgba(255,255,255,'+(.35*(1-k))+')';g.lineWidth=2;g.beginPath();g.ellipse(wk.x,wk.y,st.bw*(.3+k*1.2),st.bw*(.15+k*.5),wk.a,0,TAU);g.stroke();}
    // берег и мостки
    var top=st.py-H*.11;g.fillStyle=ice?'#eef3f6':'#5e8d3e';g.fillRect(-20,-20,W+40,top+22);
    g.fillStyle=ice?'#dfe7ec':'#4a7a32';for(i=0;i<W;i+=u*5){g.beginPath();g.moveTo(i,top+2);g.lineTo(i+u*1.2,top-u*3-(i*7%5)*u*.4);g.lineTo(i+u*2.4,top+2);g.fill();}
    g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,st.py,W,u*1.4);
    g.fillStyle=ice?'#a58a6a':'#9a744a';g.fillRect(0,top,W,st.py-top);
    if(ice){g.fillStyle='rgba(250,252,255,.85)';g.fillRect(0,top,W,(st.py-top)*.45);for(i=0;i<W;i+=u*7){g.beginPath();g.arc(i+u*3,top+(st.py-top)*.45,u*2.2,0,Math.PI);g.fill();}}
    g.strokeStyle='rgba(60,35,15,.45)';g.lineWidth=1.2;for(i=top+(st.py-top)/4;i<st.py-1;i+=(st.py-top)/4){g.beginPath();g.moveTo(0,i);g.lineTo(W,i);g.stroke();}
    g.fillStyle='#6a4c2c';for(i=u*4;i<W;i+=u*16){g.fillRect(i,st.py-u*.6,u*2.2,u*2.4);}
    // место
    g.setLineDash([u*2,u*2]);g.strokeStyle=ice?'#c0392b':'#ffe08a';g.lineWidth=2.5;g.strokeRect(st.sx-st.sw/2+st.bw*.12,st.py+2,st.sw-st.bw*.24,st.L*.95);g.setLineDash([]);
    g.fillStyle=ice?'#c0392b':'#ffe08a';g.font='700 '+Math.round(Math.max(16,u*3.8))+'px Golos Text,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';if(ice){g.fillStyle='#22313b';g.beginPath();g.ellipse(st.sx,st.py+st.L*.3,st.bw*.38,st.bw*.26,0,0,TAU);g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.stroke();g.fillStyle='#c0392b';}
    g.fillText(ice?L2('лунка','hole'):L2('сюда','here'),st.sx,st.py+st.L*.72);
    // соседские лодки
    for(i=0;i<st.moored.length;i++){var m=st.moored[i];boatPic(m.x,st.py+st.L/2,0,COLS[(m.col+8)%COLS.length],0);
      g.strokeStyle='rgba(240,230,200,.8)';g.lineWidth=1.4;g.beginPath();g.moveTo(m.x,st.py-u*.5);g.lineTo(m.x,st.py+st.L*.06);g.stroke();}
    // Митяй на мостках у места
    var mx=clamp(st.sx+st.sw*.5,u*10,W-u*10);try{if(A&&A.mit)A.mit(g,mx,st.py-u*.4,(st.py-top)*1.25+u*4,T,{bust:true,arm:'point',face:'talk'});}catch(e){}
    // брызги вёсел
    for(i=0;i<splash.length;i++){var sp=splash[i],q=sp.t/.6;g.strokeStyle='rgba(230,245,255,'+(.8*(1-q))+')';g.lineWidth=2;g.beginPath();g.arc(sp.x,sp.y,u*(1+q*4),0,TAU);g.stroke();}
    // моя лодка
    if(st.L)boatPic(st.x,st.y,st.a,ice?'#c94a3a':'#e9e2d0',1);
    // течение
    g.fillStyle=ice?'rgba(30,50,70,.7)':'rgba(255,255,255,.8)';g.font='600 '+Math.round(Math.max(15,u*3.4))+'px Golos Text,system-ui,sans-serif';g.textAlign=st.cd>0?'left':'right';
    g.fillText(ice?(st.cd>0?L2('позёмка →','drift →'):L2('← позёмка','← drift')):st.cd>0?L2('течение →','current →'):L2('← течение','← current'),st.cd>0?u*3:W-u*3,H-H*.2+u*3);
    g.restore();}
  function boatPic(x,y,a,col,me){var L=st.L,bw=st.bw,u=L/20;g.save();g.translate(x,y);g.rotate(a);
    if(ice){ // санки: полозья и сиденье
      g.fillStyle='rgba(0,0,0,.15)';g.fillRect(-bw*.5+3,-L*.45+4,bw,L*.9);g.strokeStyle='#5b4632';g.lineWidth=u*1.2;g.beginPath();g.moveTo(-bw*.45,L*.45);g.lineTo(-bw*.45,-L*.35);g.quadraticCurveTo(-bw*.45,-L*.5,-bw*.2,-L*.5);
      g.moveTo(bw*.45,L*.45);g.lineTo(bw*.45,-L*.35);g.quadraticCurveTo(bw*.45,-L*.5,bw*.2,-L*.5);g.stroke();g.fillStyle=col;g.fillRect(-bw*.4,-L*.3,bw*.8,L*.7);
      g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;for(var j=-2;j<=2;j++){g.beginPath();g.moveTo(-bw*.4,L*.05+j*L*.12);g.lineTo(bw*.4,L*.05+j*L*.12);g.stroke();}}
    else{
      g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(3,5,bw*.55,L*.52,0,0,TAU);g.fill();
      g.fillStyle=col;g.beginPath();g.moveTo(0,-L/2);g.quadraticCurveTo(bw*.66,-L*.2,bw*.48,L/2);g.lineTo(-bw*.48,L/2);g.quadraticCurveTo(-bw*.66,-L*.2,0,-L/2);g.fill();
      g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=1.6;g.stroke();
      g.fillStyle=me?'#8a6a45':'rgba(70,45,25,.75)';g.beginPath();g.moveTo(0,-L*.42);g.quadraticCurveTo(bw*.52,-L*.16,bw*.38,L*.44);g.lineTo(-bw*.38,L*.44);g.quadraticCurveTo(-bw*.52,-L*.16,0,-L*.42);g.fill();
      g.fillStyle=me?'#c9a46e':'#b08a5a';g.fillRect(-bw*.42,-L*.08,bw*.84,L*.08);g.fillRect(-bw*.4,L*.26,bw*.8,L*.08);}
    if(me){var sl=st.sl||0,sr=st.sr||0;g.strokeStyle='#6b4b2a';g.lineWidth=Math.max(2.5,u*.9);g.lineCap='round';
      if(!ice){g.beginPath();g.moveTo(-bw*.4,0);g.lineTo(-bw*1.3,L*.06+sl*L*.22);g.moveTo(bw*.4,0);g.lineTo(bw*1.3,L*.06+sr*L*.22);g.stroke();
        g.fillStyle='#6b4b2a';g.beginPath();g.ellipse(-bw*1.32,L*.06+sl*L*.22,u*.9,u*2.2,0,0,TAU);g.ellipse(bw*1.32,L*.06+sr*L*.22,u*.9,u*2.2,0,0,TAU);g.fill();}
      // гребец сверху: плечи и кепка
      g.fillStyle='#2f4a6b';g.beginPath();g.ellipse(0,L*.1,bw*.34,bw*.22,0,0,TAU);g.fill();g.fillStyle='#e8b48c';g.beginPath();g.arc(0,L*.08,bw*.17,0,TAU);g.fill();
      g.fillStyle='#3b3f44';g.beginPath();g.arc(0,L*.09,bw*.15,0,TAU);g.fill();g.fillRect(-bw*.08,L*.09-bw*.24,bw*.16,bw*.1);}
    g.restore();}
  if(window.__lvbTest!==undefined)window.__lvbTest={st:st,get total(){return total;},sim:sim};}

var DEF={id:ID,n:{ru:'Причаль лодку',en:'Dock the boat'},icon:'<path d="M3 14h18l-2.5 5h-13z" fill="currentColor" opacity=".35"/><path d="M3 14h18l-2.5 5h-13zM12 4v10M12 4l5 7h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  kind:'lov',run:run,bot:function(lv,o){return sim(lv,o);},sim:sim};
(window.MG_REG?window.MG_REG:function(d){(window.MG_PEND=window.MG_PEND||[]).push(d);})(DEF);
window.LOVB_PRICHAL={sim:sim,REC:REC,newBoat:newBoat,step:step,pilot:pilot,rng:rng};
})();
