/* RB:MGD — мини-игра №6 «Распутай „бороду“» (00-plan §5, 09-minigames №6).
   Леска спуталась: тянешь поплавки/грузила одним пальцем, пока лески не перестанут перекрещиваться (классическая «распутайка»).
   Без таймера. Узор — из прямых в общем положении (всегда решается), зерно дня o.seed — одинаков у всех.
   Открывается по событию: в этот день был обрыв или сход (обёртка finish → S.mg.boroda.ev = день); «Дело дня» по четвергам — оболочка.
   Реклама по нужде: «Петрович распутает» (host.ad) — распутывает сам, ступень 1.
   Сохранение: S.mg.boroda = {ev: день обрыва/схода, n: распутано всего}. */
(function(){
'use strict';
var A=window.MGDA,Lx=A.L;
function today(){try{return dayKey(0);}catch(e){return 0;}}
function st(){try{if(!S.mg||typeof S.mg!=='object')S.mg={};var m=S.mg.boroda;if(!m||typeof m!=='object')m=S.mg.boroda={};if(typeof m.ev!=='number')m.ev=0;if(typeof m.n!=='number')m.n=0;return m;}catch(e){return {ev:0,n:0};}}
/* обрыв/сход → «борода» сегодня */
function hook(){if(typeof finish!=='function'||finish.__mgdBor)return;var f0=finish;
  finish=function(){try{if(G&&!G.over&&!G.tourn&&G.catch.some(function(c){return c.lost;})){var m=st();if(m.ev!==today()){m.ev=today();m.new=1;}}}catch(e){}return f0.apply(this,arguments);};finish.__mgdBor=1;}
/* ---- головоломка: k прямых → вершины в точках пересечения, рёбра — соседние точки на каждой прямой ---- */
function make(k,seed){var R=A.rng(seed*13+5),lines=[],tries=0;
  while(lines.length<k&&tries<500){tries++;var a=R()*Math.PI,cx=.5+(R()-.5)*.4,cy=.5+(R()-.5)*.4,L={x:cx,y:cy,dx:Math.cos(a),dy:Math.sin(a)},ok=true;
    for(var i=0;i<lines.length;i++){var c=Math.abs(L.dx*lines[i].dy-L.dy*lines[i].dx);if(c<.25){ok=false;break;}}if(ok)lines.push(L);}
  var P=[],on=lines.map(function(){return [];});
  for(var i2=0;i2<lines.length;i2++)for(var j=i2+1;j<lines.length;j++){var a1=lines[i2],b=lines[j],den=a1.dx*b.dy-a1.dy*b.dx,t=((b.x-a1.x)*b.dy-(b.y-a1.y)*b.dx)/den;
    var id=P.length;P.push({x:a1.x+a1.dx*t,y:a1.y+a1.dy*t});on[i2].push([t,id]);var u=((b.x-a1.x)*a1.dy-(b.y-a1.y)*a1.dx)/den;on[j].push([u,id]);}
  var E=[],seen={};on.forEach(function(arr){arr.sort(function(p,q){return p[0]-q[0];});for(var i=0;i+1<arr.length;i++){var a2=arr[i][1],b2=arr[i+1][1],key=Math.min(a2,b2)+'_'+Math.max(a2,b2);if(!seen[key]){seen[key]=1;E.push([a2,b2]);}}});
  // решение в долях 0..1
  var mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;P.forEach(function(p){mnx=Math.min(mnx,p.x);mny=Math.min(mny,p.y);mxx=Math.max(mxx,p.x);mxy=Math.max(mxy,p.y);});
  var sol=P.map(function(p){return {x:(p.x-mnx)/Math.max(1e-6,mxx-mnx),y:(p.y-mny)/Math.max(1e-6,mxy-mny)};});
  // начало: по кругу в случайном порядке, пока не будет хотя бы n/2 узлов
  var n=P.length,best=null,bc=-1;for(var tr=0;tr<12;tr++){var ord=[];for(var q=0;q<n;q++)ord.push(q);for(q=n-1;q>0;q--){var r=Math.floor(R()*(q+1)),tmp=ord[q];ord[q]=ord[r];ord[r]=tmp;}
    var pos=[];for(q=0;q<n;q++){var ang=-Math.PI/2+q*2*Math.PI/n;pos[ord[q]]={x:.5+.5*Math.cos(ang),y:.5+.5*Math.sin(ang)};}
    var c=cross(pos,E).n;if(c>bc){bc=c;best=pos;}if(c>=n)break;}
  return {n:n,E:E,sol:sol,start:best,par:n};}
function segX(a,b,c,d){function o(p,q,r){var v=(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);return v>1e-9?1:v<-1e-9?-1:0;}
  return o(a,b,c)*o(a,b,d)<0&&o(c,d,a)*o(c,d,b)<0;}
function cross(pos,E){var n=0,bad={},pts=[];for(var i=0;i<E.length;i++)for(var j=i+1;j<E.length;j++){var e=E[i],f=E[j];if(e[0]===f[0]||e[0]===f[1]||e[1]===f[0]||e[1]===f[1])continue;
  var a=pos[e[0]],b=pos[e[1]],c=pos[f[0]],d=pos[f[1]];if(segX(a,b,c,d)){n++;bad[i]=1;bad[j]=1;var den=(b.x-a.x)*(d.y-c.y)-(b.y-a.y)*(d.x-c.x),t=((c.x-a.x)*(d.y-c.y)-(c.y-a.y)*(d.x-c.x))/den;pts.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}
  return {n:n,bad:bad,pts:pts};}
function tierOf(moves,par){return moves<=Math.ceil(par*1.5)?3:moves<=Math.ceil(par*2.6)?2:1;}
function scoreOf(moves,par){return Math.max(1,Math.round(100*par/Math.max(par,moves)));}
var SAY={hi:[Lx('Эх, «борода»! Тяни поплавки пальцем, чтобы лески нигде не перекрещивались.','What a tangle! Drag the floats so no lines cross.'),Lx('Вот так снасть спуталась! Растаскивай узелки — без спешки, рыба подождёт.','Untangle it — no rush, the fish will wait.')],
  good:[Lx('Во, пошло дело!','That’s it!'),Lx('Ага, ослабла!','Getting looser!'),Lx('Ловко!','Nice!')],
  win:[Lx('Как новенькая! Хоть сейчас забрасывай.','Good as new!'),Lx('Ну, руки золотые! Митяй бы так не смог.','Golden hands!')],
  help:[Lx('Дай-ка я… Тут петельку, тут узелок — готово!','Let me… there you go!')]};
function pick(a){return a[Math.floor(Math.random()*a.length)];}
var KINDS=['float','sinker','bead','float2','bead2'];
function drawNode(g,x,y,r,kind,sel,t,ok){g.save();g.translate(x,y);var s=sel?1.18:1;g.scale(s,s);
  g.fillStyle='rgba(0,0,0,.28)';A.ell(g,r*.18,r*.3,r*1.02,r*.9);g.fill();
  if(sel){var gl=g.createRadialGradient(0,0,r*.5,0,0,r*2);gl.addColorStop(0,'rgba(255,240,170,.55)');gl.addColorStop(1,'rgba(255,240,170,0)');g.fillStyle=gl;A.ell(g,0,0,r*2,r*2);g.fill();}
  if(kind==='float'||kind==='float2'){var top=kind==='float'?'#e03131':'#f08c00';g.fillStyle='#f6f6f2';A.ell(g,0,0,r,r);g.fill();g.save();A.ell(g,0,0,r,r);g.clip();g.fillStyle=top;g.fillRect(-r,-r,r*2,r*1.05);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-r,-r*.08,r*2,r*.16);g.restore();
    var hg=g.createRadialGradient(-r*.35,-r*.4,1,0,0,r);hg.addColorStop(0,'rgba(255,255,255,.75)');hg.addColorStop(.4,'rgba(255,255,255,0)');hg.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=hg;A.ell(g,0,0,r,r);g.fill();
    g.fillStyle='#2a2a2a';A.ell(g,0,0,r*.18,r*.18);g.fill();}
  else if(kind==='sinker'){var sg=g.createRadialGradient(-r*.3,-r*.35,1,0,0,r);sg.addColorStop(0,'#e6eaec');sg.addColorStop(.5,'#8d989e');sg.addColorStop(1,'#4b555a');g.fillStyle=sg;g.beginPath();g.moveTo(0,-r*1.05);g.quadraticCurveTo(r*1.05,r*.1,0,r*.95);g.quadraticCurveTo(-r*1.05,r*.1,0,-r*1.05);g.fill();
    g.strokeStyle='rgba(30,35,38,.5)';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-r*.7);g.lineTo(0,r*.6);g.stroke();}
  else{var bc=kind==='bead'?'#2f9fd6':'#40b06a';var bg=g.createRadialGradient(-r*.35,-r*.35,1,0,0,r);bg.addColorStop(0,'#fff');bg.addColorStop(.25,A.shade(bc,.3));bg.addColorStop(1,A.shade(bc,-.35));g.fillStyle=bg;A.ell(g,0,0,r*.92,r*.92);g.fill();g.fillStyle='rgba(0,0,0,.35)';A.ell(g,0,0,r*.2,r*.2);g.fill();}
  if(ok){g.strokeStyle='rgba(255,210,122,.9)';g.lineWidth=2.5;A.ell(g,0,0,r*1.15,r*1.15);g.stroke();}
  g.restore();}
var CSS='.mgb-chip{position:absolute;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 70px);display:flex;align-items:center;padding:6px 14px;border-radius:16px;background:var(--pn,rgba(16,26,36,.42));-webkit-backdrop-filter:var(--blur,blur(18px));backdrop-filter:var(--blur,blur(18px));border:1px solid var(--pnB,rgba(255,255,255,.2));font-size:18px;font-weight:600;white-space:nowrap;pointer-events:none;text-shadow:var(--txSh)}'+
'.mgb-chip b{color:#ff9a8b;margin:0 4px}.mgb-chip b.z{color:#6be3b0}.mgb-chip span{margin-left:12px;color:var(--tx2,rgba(255,255,255,.84));font-weight:400}'+
'@media (max-width:640px){.mgb-chip{top:calc(env(safe-area-inset-top,0px) + 118px)}}.mgb-bar{position:absolute;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));width:min(52%,300px)}.mgb-bar .mgd-btn{width:100%;margin-top:0}';
function css(){if(document.getElementById('mgb-css'))return;var s=document.createElement('style');s.id='mgb-css';s.textContent=CSS;document.head.appendChild(s);}

function run(host,o){var lines=o.calm?4:5;var P=make(lines,o.seed||1);
  if(o.bot){var mv=Math.round(P.par*({bad:3.4,mid:2.1,good:1.2}[o.bot]||2)),t=o.bot==='bad'?1:tierOf(mv,P.par);host.done({score:scoreOf(mv,P.par),tier:t});return;}
  css();var Sx=A.stage(host,o),g=Sx.g,m=st();
  var pos=P.start.map(function(p){return {x:p.x,y:p.y};}),kind=pos.map(function(_,i){return KINDS[i%KINDS.length];});
  var area={x:0,y:0,w:1,h:1},lay={},bg=null,drag=-1,dragOff={x:0,y:0},moved=0,moves=0,cr=cross(pos,P.E),best=cr.n,won=false,helping=null,ended=false,petr={mood:'think',talk:0,pose:'scratch'};
  function layout(){var W=Sx.W,H=Sx.H,wide=W>H*1.1;lay.wide=wide;lay.r=A.clamp(Math.min(W,H)*.045,17,28);
    if(wide){lay.ps=Math.min(H*.42,W*.2);lay.px=lay.ps*.62+10;lay.py=H;area={x:lay.ps*1.25+lay.r*2,y:124+lay.r,w:W-lay.ps*1.25-lay.r*4-24,h:H-124-lay.r*2-96};}
    else{lay.ps=Math.min(W*.42,H*.2);lay.px=lay.ps*.6+6;lay.py=H;area={x:lay.r*1.6,y:168+lay.r,w:W-lay.r*3.2,h:H-168-lay.r*2-lay.ps*1.05-24};}
    var sq=Math.min(area.w,area.h*1.3);area.x+=(area.w-sq)/2;area.w=sq;}
  Sx.resize=function(){bg=null;layout();};layout();
  function toPx(p){return {x:area.x+p.x*area.w,y:area.y+p.y*area.h};}
  function bake(){var c=document.createElement('canvas'),d=Sx.d;c.width=Math.round(Sx.W*d);c.height=Math.round(Sx.H*d);var q=c.getContext('2d');q.scale(d,d);A.pier(q,Sx.W,Sx.H,{water:lay.wide?.1:.075});
    var tw=Math.min(Sx.W*.36,200);A.tackleBox(q,Sx.W-tw*.82,Sx.H-tw*.42,tw,tw*.62);bg=c;}
  var top=Sx.el('div','mgd-top');Sx.el('div','mgd-ttl',Lx('Распутай «бороду»','Untangle the line'),top);
  var chip=Sx.el('div','mgb-chip');function upChip(){chip.innerHTML=Lx('Перехлёстов','Crossings')+':<b class="'+(cr.n?'':'z')+'">'+cr.n+'</b><span>'+Lx('ходов','moves')+': '+moves+'</span>';}upChip();
  var lastSay='';function speak(t){lastSay=t;petr.talk=MGDA.talkT(t);Sx.speak(Lx('Петрович','Petrovich'),t,lay.px+lay.ps*.1,lay.py-lay.ps*1.05,{hide:won?0:3800});}
  var adBox=null;if(host.adOk&&host.adOk()&&!o.train){adBox=Sx.el('div','mgb-bar');Sx.btn('ad',A.icon('ad')+Lx('Петрович распутает','Petrovich will do it'),function(b){host.ad('help').then(function(ok){if(!ok){b.disabled=false;return;}helpSolve();});},adBox);}
  host.amb('shore','day'); // RB:MGPC мостки днём
  // RB:MGPC на ПК — «тяни мышкой» и плашка клавиш
  var HI_PC=Lx('Эх, «борода»! Тяни поплавки мышкой, чтобы лески нигде не перекрещивались.','What a tangle! Drag the floats with the mouse so no lines cross.');
  Sx.later(function(){speak(host.pc?HI_PC:pick(SAY.hi));},Sx.calm?50:400);
  Sx.kbd(Lx('Тяни мышкой. '+Sx.kc('Tab')+Sx.kc('←')+Sx.kc('→')+' — выбрать, '+Sx.kc('Enter')+' — взять/отпустить, стрелки — тянуть',
    'Drag with the mouse. '+Sx.kc('Tab')+Sx.kc('←')+Sx.kc('→')+' — select, '+Sx.kc('Enter')+' — grab/release, arrows — move'),9);
  function nodeAt(p){var best=-1,bd=1e9,hr=Math.max(36,lay.r*1.8);for(var i=0;i<pos.length;i++){var q=toPx(pos[i]),d=Math.hypot(q.x-p.x,q.y-p.y);if(d<hr&&d<bd){bd=d;best=i;}}return best;}
  /* RB:MGPC наведение мышью: подсветка узла и «рука» */
  var hov=-1;Sx.hover=function(p){hov=p&&!won&&!helping?nodeAt(p):-1;Sx.cursor(hov>=0?'grab':'');};
  Sx.down=function(p){if(won||helping)return;var i=nodeAt(p);if(i<0)return;kRelease();kb.on=false;drag=i;Sx.cursor('grabbing');var q=toPx(pos[i]);dragOff={x:q.x-p.x,y:q.y-p.y};moved=0;A.snd('click');};
  Sx.move=function(p){if(drag<0)return;var nx=A.clamp((p.x+dragOff.x-area.x)/area.w,-.04,1.04),ny=A.clamp((p.y+dragOff.y-area.y)/area.h,-.04,1.04);moved+=Math.hypot(nx-pos[drag].x,ny-pos[drag].y)*area.w;pos[drag].x=nx;pos[drag].y=ny;cr=cross(pos,P.E);upChip();};
  Sx.up=function(p){if(drag<0)return;var was=drag;drag=-1;Sx.cursor(p&&nodeAt(p)>=0?'grab':'');endMove();};
  function endMove(){if(moved>6){moves++;var prev=best;cr=cross(pos,P.E);if(cr.n<best){best=cr.n;if(cr.n>0&&Math.random()<.35)speak(pick(SAY.good));}upChip();A.snd('plop');if(cr.n===0)win(false);}moved=0;}
  /* RB:MGPC клавиши: Tab/стрелки — выбрать узел, Enter/пробел — взять/отпустить, стрелки — тянуть взятый */
  var kb={on:false,i:0},kHold=false;
  function kNext(d){kb.i=(kb.i+d+pos.length)%pos.length;}
  function kDir(dx,dy){var a=toPx(pos[kb.i]),best=-1,bs=1e9;for(var i=0;i<pos.length;i++){if(i===kb.i)continue;var q=toPx(pos[i]),vx=q.x-a.x,vy=q.y-a.y,along=vx*dx+vy*dy;if(along<=4)continue;var side=Math.abs(vx*dy-vy*dx),sc=along+side*2;if(sc<bs){bs=sc;best=i;}}if(best>=0)kb.i=best;}
  function kRelease(){if(!kHold)return;kHold=false;drag=-1;endMove();}
  Sx.keys(function(k,e){if(won||helping)return false;var arr={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[k];
    if(k==='Tab'){kRelease();if(kb.on)kNext(e&&e.shiftKey?-1:1);kb.on=true;A.snd('tap');return true;}
    if(k==='Enter'||k===' '){if(!kb.on){kb.on=true;return true;}if(kHold){kRelease();}else{kHold=true;drag=kb.i;moved=0;A.snd('click');}return true;}
    if(arr){if(!kb.on){kb.on=true;return true;}
      if(kHold){var st0=(e&&e.repeat?.03:.022),i=kb.i,nx=A.clamp(pos[i].x+arr[0]*st0,-.04,1.04),ny=A.clamp(pos[i].y+arr[1]*st0,-.04,1.04);moved+=Math.hypot(nx-pos[i].x,ny-pos[i].y)*area.w;pos[i].x=nx;pos[i].y=ny;cr=cross(pos,P.E);upChip();if(cr.n===0)kRelease();}
      else kDir(arr[0],arr[1]);return true;}
    return false;});
  function helpSolve(){if(won)return;kHold=false;drag=-1;Sx.cursor('');helping={t:0,from:pos.map(function(p){return {x:p.x,y:p.y};})};petr.mood='smile';petr.pose='point';speak(pick(SAY.help));if(adBox)adBox.style.display='none';}
  function win(helped){if(won)return;won=true;kHold=false;kb.on=false;Sx.cursor('');petr.mood='laugh';petr.pose='wave';if(adBox)adBox.style.display='none';
    var tier=helped?1:tierOf(moves,P.par),sc=helped?0:scoreOf(moves,P.par);A.snd('catch');
    var c=toPx({x:.5,y:.5});A.burst(Sx,c.x,c.y,36,['#ffd27a','#fff','#6be3b0','#ff8f4f']);
    Sx.later(function(){speak(pick(SAY.win));},300);
    if(!o.train){m.n=(m.n||0)+1;}
    Sx.later(function(){if(ended)return;ended=true;Sx.hush();host.done({score:sc,tier:tier,title:helped?Lx('Распутано!','Untangled!'):tier===3?Lx('Как новенькая!','Good as new!'):tier===2?Lx('Распутал!','Untangled!'):Lx('Справился!','Done!'),
      scoreTxt:helped?Lx('Распутал Петрович','Petrovich did it'):Lx('Ходов','Moves')+': <b>'+moves+'</b> · '+Lx('счёт','score')+' <b>'+sc+'</b>',
      extra:{line:Lx('Всего распутано: ','Untangled in total: ')+(m.n||1)}});},Sx.calm?900:2400);}
  Sx.frame=function(dt,t){var W=Sx.W,H=Sx.H;if(!bg)bake();g.drawImage(bg,0,0,W,H);
    if(petr.talk>0)petr.talk-=dt;
    if(helping){helping.t+=dt/1.6;var k=A.ease(helping.t);for(var i=0;i<pos.length;i++){pos[i].x=helping.from[i].x+(P.sol[i].x-helping.from[i].x)*k;pos[i].y=helping.from[i].y+(P.sol[i].y-helping.from[i].y)*k;}cr=cross(pos,P.E);upChip();if(helping.t>=1){helping=null;win(true);}}
    // лески: тень, потом сама леска
    var px=pos.map(toPx),gold=won?Math.min(1,(t%100)):0;
    g.lineCap='round';
    for(var e=0;e<P.E.length;e++){var a=px[P.E[e][0]],b=px[P.E[e][1]];g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=3.5;g.beginPath();g.moveTo(a.x+2,a.y+3);g.lineTo(b.x+2,b.y+3);g.stroke();}
    for(e=0;e<P.E.length;e++){var a2=px[P.E[e][0]],b2=px[P.E[e][1]],bad=!!cr.bad[e];
      var sag=Math.hypot(b2.x-a2.x,b2.y-a2.y)*.03,mx=(a2.x+b2.x)/2,my=(a2.y+b2.y)/2+sag;
      g.strokeStyle=won?'#ffe08a':bad?'#ffb3a3':'#e9fbff';g.lineWidth=won?3.2:bad?2.6:2.4;g.beginPath();g.moveTo(a2.x,a2.y);g.quadraticCurveTo(mx,my,b2.x,b2.y);g.stroke();
      if(!bad&&!won){g.strokeStyle='rgba(120,230,255,.35)';g.lineWidth=5;g.beginPath();g.moveTo(a2.x,a2.y);g.quadraticCurveTo(mx,my,b2.x,b2.y);g.stroke();}}
    // узелки на перехлёстах
    for(var j=0;j<cr.pts.length;j++){var q=toPx(cr.pts[j]),rr=Math.max(5,lay.r*.32);g.strokeStyle='#ff7b6b';g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,rr,0,Math.PI*2);g.stroke();g.beginPath();g.arc(q.x+rr*.6,q.y-rr*.4,rr*.55,0,Math.PI*1.6);g.stroke();}
    for(i=0;i<px.length;i++){var free=!won&&!Object.keys(cr.bad).some(function(ei){var E=P.E[ei];return E[0]===i||E[1]===i;});drawNode(g,px[i].x,px[i].y,lay.r,kind[i],i===drag||(i===hov&&drag<0),t,won);}
    // RB:MGPC курсор клавиатуры: пунктирное кольцо; взятый узел — стрелки-значки
    if(kb.on&&!won&&px[kb.i]){var kq=px[kb.i],kr=lay.r*1.75;g.save();g.setLineDash([6,5]);g.lineDashOffset=-t*20;g.strokeStyle='#fff';g.lineWidth=3;g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=A.low()?0:4;A.ell(g,kq.x,kq.y,kr,kr);g.stroke();g.restore();
      if(host.pc){if(kHold){var kp=Math.round(A.clamp(lay.r*.8,18,22)),ko=kr+kp*.8;MG.keycap(g,kq.x,kq.y-ko,'↑',kp);MG.keycap(g,kq.x,kq.y+ko,'↓',kp);MG.keycap(g,kq.x-ko,kq.y,'←',kp);MG.keycap(g,kq.x+ko,kq.y,'→',kp);}
        else MG.keycap(g,kq.x+kr*.8,kq.y-kr*.8,'Enter',24);}}
    // Петрович в углу (сидит на мостках), кот рядом
    A.cat(g,lay.px+lay.ps*.68,lay.py+lay.ps*.02,lay.ps*.46,t,{lx:drag>=0?(px[drag].x>W/2?1:-1):0});
    A.petr(g,lay.px,lay.py+lay.ps*.12,lay.ps,t,{mood:won?'laugh':petr.mood,talk:petr.talk>0,pose:won?'wave':petr.pose,lx:drag>=0?(px[drag].x>lay.px?1:-1):.5});};
  run.stopFn=function(){Sx.stop();};
  run.dbg={sol:function(i){return toPx(P.sol[i]);},at:function(i){return toPx(pos[i]);},n:P.n,cr:function(){return cr.n;},c:Sx.c};}
hook();
MG_REG({id:'boroda',n:{ru:'Распутай «бороду»',en:'Untangle the line'},icon:'line',kind:'event',
  ready:function(){return st().ev===today();},run:run,stop:function(){if(run.stopFn)run.stopFn();},_t:{make:make,cross:cross,run:run}});
})();
