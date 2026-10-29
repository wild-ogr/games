'use strict';
(function(){
if(typeof ZMG_REG!=='function')return;
var PARK_ON=true;if(!PARK_ON||(window.ZB2&&ZB2.off('park')))return;
if(window.ZB2)ZB2.reg('park',{t:'Мини-игра «Тележка с макулатурой»',who:'LOV'});
var ID='park',N=3,CUT=[3,6,8],LIMIT=75,LOAD=[30,35,40],PLACES=['yard','school','market','station'];
var LOTS=[['dock',.08],['bay',.32],['lane',.5]];
function tierOf(stars){return stars>=CUT[2]?3:stars>=CUT[1]?2:stars>=CUT[0]?1:0;}
function kgOf(r,i){if(!r.parked||r.helped||r.late)return 0;var k=LOAD[i]||40;if(!r.touch&&!r.sloppy&&!r.nose)k+=15;if(r.time<=r.par)k+=10+Math.min(15,Math.max(0,Math.round(r.par-r.time)));return k;}
function sim(o,k){var R=o.rnd||Math.random,st=0,kg=0;k=k==null?.6:k;
for(var i=0;i<N;i++){var d=LOTS[i][1],r=window.ZLPE?ZLPE.simLot(R,k,d):{parked:R()<k,stars:R()<k?2:0};var par=22+i*3;
r.par=par;r.time=r.fast?par*(.55+.4*R()):par*(1.05+.9*(1-k)+.3*R());st+=r.stars;kg+=kgOf(r,i);}
return{sc:kg,st:tierOf(st),stars:st};}
var SAY={hit:['Ох! Пачка упала!','Тише, тише — задела!','Бах! Аккуратнее, Зинаида Пална!','Ой! Ящик не мой — я не видел.'],
near:['Стоп! Ещё чуть — и в ящики!','Осторожно, близко!'],back:['Ещё! Ещё!','Так, так, хорошо… ещё!','Давай-давай, помаленьку!'],
left:['Руль влево!','Левее крути!'],right:['Руль вправо!','Правее крути!'],stopturn:['Стоп! Теперь руль до упора — и задом!'],
fwd:['Проезжай вперёд, мимо окошка.','Вперёд, вперёд — проезжай окошко.'],lane:['Задом, задом — держи по центру!','Столбы рядом — смотри!'],
crook:['Кривовато! Выровняй.','Встала наискось — поправь.'],deeper:['Ещё назад! Ручка торчит.','Глубже, глубже — до окошка!'],
ok3:'Стоп! Встала как влитая! Принимаю!',ok2:'Встала! Ну, почти идеально.',ok1:'Встала… Ну, главное — встала.',nose:'Передом приехала! Задом надо… Ладно, приму.',
auto:'Ладно, Зинаида Пална, смотри, как надо…',idle:'Чего стоим? Газуй!',help:'Вот так! Руль до упора — и потихоньку. В следующий раз сама!',
late:'Всё, обед! Приём до 14:00 — приходи через час.',crooked:' Чуть криво.'};
ZMG_REG({a:'Поставь тележку задом к окошку приёма — руль, газ, тормоз',ns:'Михалыч принимает макулатуру до обеда. Подкати тележку к окошку — да аккуратно, не снеси ящики!',id:ID,finWho:'zina',deps:['js/zmg-lkit.js','js/zmg-park-eng.js','js/zmg-rec-ui.js'],sim:sim,
lines:{good:'Михалыч расписался: «Сдала как по линеечке!»',ok:'Сдала! Михалыч ворчит, но взвесил.',bad:'Ничего, макулатура не испортится — завтра сдадим.'},
run:function(host,o){
var K=window.ZLK,E=window.ZLPE,REC=window.ZMGREC,R=o.rnd||Math.random,calm=K.calm(host),seed=(o.seed>>>0)||Math.floor(R()*4294967296);
var th=PLACES[Math.floor(R()*PLACES.length)%PLACES.length];
var lots=LOTS.map(function(l,i){return{kind:l[0],th:th,tight:l[1],seed:(seed+i*7919)>>>0,calm:calm,dim:E.CART};});
var f=K.frame(host,{who:'mihalych',nm:'Михалыч, приёмщик'}),C=K.canvas(f.main),ctx=C.ctx;
var SC=null,p=null,cur=null,WROT=E.WROT;
var st={i:0,res:[],rs:[],kg:0,stars:0,fin:false,t:0,touch:0,inC:0,hitT:-9,sayT:-9,lastSay:'',okT:0,done:false,ped:0,wheel:0,d:0,v:0,auto:null,t0:0,
gear:-1,gas:0,brk:0,kL:0,kR:0,kU:0,kD:0,kB:0,helpOn:false,go:0};
window.__zl_park=st;host.onQuit(function(){st.fin=true;});
var foot=f.foot;foot.style.gap='10px';
var wh=document.createElement('div');wh.className='zl-wheel';wh.style.cssText='flex:none;width:108px;height:108px;touch-action:none;cursor:grab;position:relative';
wh.innerHTML='<svg viewBox="0 0 100 100" width="108" height="108" style="display:block"><circle cx="50" cy="50" r="44" fill="none" stroke="#263247" stroke-width="10"/>'+
'<path d="M50 50 L10 46 M50 50 L90 46 M50 50 L50 90" stroke="#263247" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="50" r="13" fill="#263247"/><rect x="45" y="2" width="10" height="10" rx="2" fill="#f2b705"/></svg>';
var wtxt=document.createElement('div');wtxt.style.cssText='position:absolute;left:50%;transform:translateX(-50%);bottom:4px;background:rgba(255,255,255,.85);border-radius:8px;padding:0 5px;white-space:nowrap;text-align:center;font:700 11px sans-serif;color:#263247;opacity:.7;pointer-events:none';wh.appendChild(wtxt);
var pan=document.createElement('div');pan.style.cssText='flex:1;max-width:300px;display:flex;flex-direction:column;gap:8px';
var gr=document.createElement('div');gr.style.cssText='display:flex;border-radius:14px;overflow:hidden;box-shadow:0 0 0 2px #263247';
var gF=document.createElement('button'),gB=document.createElement('button');[gF,gB].forEach(function(b){b.type='button';b.style.cssText='flex:1;min-height:44px;border:0;font:700 16px inherit;font-family:inherit;cursor:pointer';gr.appendChild(b);});
gF.innerHTML='▲ Вперёд';gB.innerHTML='▼ Назад';
var row=document.createElement('div');row.style.cssText='display:flex;gap:8px';
var bBrk=K.btn('Тормоз'+K.kc('Пробел',host),''),bGas=K.btn('Газ'+K.kc('↑↓',host),'green');
bBrk.style.cssText='flex:1;background:#d9480f;color:#fff;box-shadow:0 4px 0 #a33a0b';bGas.style.flex='1';row.appendChild(bBrk);row.appendChild(bGas);
pan.appendChild(gr);pan.appendChild(row);
function gearUI(){gF.style.background=st.gear>0?'#263247':'#fff';gF.style.color=st.gear>0?'#fff':'#263247';gB.style.background=st.gear<0?'#263247':'#fff';gB.style.color=st.gear<0?'#fff':'#263247';}
gF.onclick=function(){if(st.auto||st.done)return;st.gear=1;gearUI();K.snd(host,'tap');};gB.onclick=function(){if(st.auto||st.done)return;st.gear=-1;gearUI();K.snd(host,'tap');};
function hold(b,k){var on=function(e){e.preventDefault();if(st.auto||st.done)return;st[k]=1;b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(x){}},
off=function(){st[k]=0;b.classList.remove('on');};
b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);}
hold(bGas,'gas');hold(bBrk,'brk');
var wa=null,lastTap=0;
function ang(e){var r=wh.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI;}
wh.addEventListener('pointerdown',function(e){if(st.auto||st.done)return;e.preventDefault();var now=Date.now();if(now-lastTap<300){st.wheel=0;lastTap=0;return;}lastTap=now;wa=ang(e);try{wh.setPointerCapture(e.pointerId);}catch(x){}});
wh.addEventListener('pointermove',function(e){if(wa==null||st.auto)return;var a=ang(e),d=a-wa;if(d>180)d-=360;if(d<-180)d+=360;wa=a;st.wheel=Math.max(-WROT,Math.min(WROT,st.wheel+d));});
var wup=function(){wa=null;};wh.addEventListener('pointerup',wup);wh.addEventListener('pointercancel',wup);
function ctrls(){foot.innerHTML='';foot.appendChild(wh);foot.appendChild(pan);gearUI();}
var bHelp=K.btn('🎬 Михалыч поможет<small>за рекламу · эта сдача без ★</small>','zbad zmg-ad');bHelp.style.cssText='position:absolute;right:8px;top:8px;min-height:44px;font-size:14px;padding:6px 10px;display:none;z-index:2';
bHelp.onclick=function(){if(st.done||st.auto)return;K.snd(host,'tap');bHelp.disabled=true;host.adNeed('help').then(function(ok){bHelp.disabled=false;if(ok&&!st.done){try{STAT.ev('cont',{id:ID,k:'help'});}catch(e){}autoRun(true);}else bHelp.style.display='none';});};
f.main.appendChild(bHelp);
K.keys(host,function(k,e,d){var m=K.dir(k);
if(m==='L'||m==='R'){st[m==='L'?'kL':'kR']=d?1:0;return true;}
if(m==='U'||m==='D'){st[m==='U'?'kU':'kD']=d?1:0;if(d&&!st.auto&&!st.done){st.gear=m==='U'?1:-1;gearUI();}return true;}
if(k===' '){st.kB=d?1:0;if(d&&st.done&&st.nextOn)next();return true;}
if(!d)return false;
if(k==='Enter'){if(st.done&&st.nextOn)next();return true;}
if(k==='y'||k==='Y'||k==='н'||k==='Н'){if(!st.auto)st.wheel=0;return true;}
if((k==='h'||k==='H'||k==='р'||k==='Р')&&bHelp.style.display!=='none'&&!st.done&&!st.auto){bHelp.click();return true;}return false;});
function load(i){cur=E.fresh(lots[i]);SC=cur.S;st.S=SC;st.par=cur.par;p={x:SC.start.x,y:SC.start.y,th:SC.start.th};st.p=p;fit();}
function startTask(){if(!cur||st.loaded!==st.i){load(st.i);st.loaded=st.i;}
st.go=1;p.x=SC.start.x;p.y=SC.start.y;p.th=SC.start.th;st.v=0;st.d=0;st.wheel=0;st.ped=0;st.touch=0;st.okT=0;st.done=false;st.nextOn=false;st.auto=null;st.helped=false;
st.gear=SC.kind==='lane'?-1:1;st.t0=st.t;st.helpOn=false;bHelp.style.display='none';st.inC=0;st.lastSay='';st.late=false;
host.top('Сдача '+(st.i+1)+' из '+N);ctrls();info();sayNow(SC.task,'norm');}
function info(){var b=REC&&REC.best?REC.best(ID):0;f.info('<span>'+E.THEMES[th].n+'</span><span>Сдано: '+st.kg+' кг</span><span>Рекорд: '+b+' кг</span>');}
function sayNow(t,m){st.lastSay=t;st.sayT=st.t;f.say(t,m||'norm');}
function say(t,m,force){if(!force&&(st.t-st.sayT<1.6||t===st.lastSay))return;sayNow(t,m);}
function finishTask(r,why){st.done=true;st.ped=0;r.time=Math.round((st.t-st.t0)*10)/10;r.par=st.par;r.touch=st.touch;r.helped=!!st.helped;r.late=!!r.late;
r.stars=r.helped||!r.parked||r.late?0:1+(!st.touch&&!r.sloppy&&!r.nose?1:0)+(r.time<=st.par?1:0);r.kg=kgOf(r,st.i);
st.rs.push(r);st.res.push(r.stars);st.stars+=r.stars;st.kg+=r.kg;bHelp.style.display='none';info();
K.snd(host,r.stars>=2?'win':r.stars?'coin':'bad');K.buzz(r.stars?'win':'bad');
if(!r.helped&&!r.late&&r.parked)why+=' '+'★'.repeat(r.stars)+'☆'.repeat(3-r.stars)+(r.stars<3?' — '+(st.touch||r.sloppy||r.nose?'без касаний и ровно — ещё ★':'быстрее '+st.par+' с — ещё ★'):'');
sayNow(why,r.stars>=2?'happy':r.stars?'norm':'sad');if(r.kg)K.pop(host,f.main,'+'+r.kg+' кг','big');
var last=st.i>=N-1;setTimeout(function(){if(st.fin)return;foot.innerHTML='';var b=K.btn((last?'Итоги':'Следующая сдача')+K.kc('Enter',host),'green',next);b.style.flex='1';b.style.maxWidth='420px';foot.appendChild(b);st.nextOn=true;},calm?200:700);}
function next(){if(!st.done||!st.nextOn||host.paused)return;if(st.i>=N-1){fin();return;}st.i++;startTask();}
function fin(){if(st.fin)return;st.fin=true;var clean=st.rs.filter(function(r){return r.stars===3;}).length;
var x={sc:st.kg,st:tierOf(st.stars),label:'Сдано '+st.kg+' кг · звёзд '+st.stars+' из 9'+(clean?' · идеально: '+clean:'')};
if(REC&&REC.finish)REC.finish(host,x);else host.finish(x);}
function autoRun(help){if(st.done||st.auto)return;if(help){st.helped=true;bHelp.style.display='none';sayNow(SAY.auto,'happy');st.fade=1;p.x=SC.start.x;p.y=SC.start.y;p.th=SC.start.th;st.v=0;st.d=0;st.wheel=0;}
st.auto={q:SC.plan.slice(),cur:null};st.ped=0;}
function step(dt){if(!SC||!st.go)return;if(st.fade>0)st.fade=Math.max(0,st.fade-dt*2);
st.ph=st.ph&&st.phS===SC?st.ph:(st.phS=SC,E.phys(SC));
if(st.auto){st.brk=0;E.apStep(st,dt);}
else if(!st.done){var kd=st.kR-st.kL;if(kd)st.wheel=Math.max(-WROT,Math.min(WROT,st.wheel+kd*320*dt));
st.brk=st.brk||st.kB?1:0;st.ped=(st.gas||st.kU||st.kD)&&!st.brk?st.gear:0;}
st.stop=st.done;var was=st.inC;st.inC=0;
E.carStep(st,dt,function(hit){if(!was&&st.t-st.hitT>.6){st.touch++;st.hitT=st.t;K.snd(host,'bad');K.buzz('bad');say(K.pick(SAY.hit,R),'wow',true);st.shake=calm?0:.25;}
st.inC=1;var bk=-(st.v>0?1:-1)*.06;p.x+=Math.cos(p.th)*bk;p.y+=Math.sin(p.th)*bk;if(E.hitOf(SC,p))p.x-=Math.cos(p.th)*bk,p.y-=Math.sin(p.th)*bk;st.v=0;return true;});
if(st.shake>0)st.shake=Math.max(0,st.shake-dt);
if(!st.done&&!st.helpOn&&(st.t-st.t0>40||st.touch>=3)&&!st.auto){st.helpOn=true;if(host.adOk&&host.adOk())bHelp.style.display='';else say('Подскажу даром: проедь вперёд мимо окошка, руль до упора — и задом, потихоньку.','norm',true);}
if(!st.done&&!st.auto&&st.t-st.t0>LIMIT){finishTask({parked:false,late:true},SAY.late);return;}
judge(dt);}
function judge(dt){if(st.done)return;var vd=E.verdict(SC,p),still=Math.abs(st.v)<.03&&st.ped===0;
if(vd.inn&&still){st.okT+=dt;if(st.okT>.6){if(vd.e>12&&!st.auto){say(K.pick(SAY.crook,R),'norm');return;}
var r={parked:true,sloppy:vd.sloppy,nose:vd.nose};if(st.helped){finishTask(r,SAY.help);return;}
var pts=Math.max(1,3-Math.min(2,st.touch)-(vd.sloppy?1:0)-(vd.nose?1:0));
finishTask(r,vd.nose?SAY.nose:pts===3?SAY.ok3:pts===2?SAY.ok2+(vd.sloppy?SAY.crooked:''):SAY.ok1);}return;}
st.okT=0;if(st.auto)return;
var cnt=E.nearIn(SC,p,.7);
if(cnt>=3&&vd.e>9&&st.v<=0&&E.nearIn(SC,p,.05)>=2){say(K.pick(SAY.crook,R),'norm');return;}
if(cnt>=3&&!vd.inn){if(st.v<0||Math.abs(st.v)<.02)say(K.pick(SAY.deeper,R),'norm');return;}
if(minDist()<.35&&Math.abs(st.v)>.1){say(K.pick(SAY.near,R),'wow');return;}
if(st.v<-.1){var want=ppAdvice();if(want!=null){var dif=want-st.d;if(dif<-.3)say(K.pick(SAY.left,R),'norm');else if(dif>.3)say(K.pick(SAY.right,R),'norm');else say(K.pick(SC.kind==='lane'?SAY.lane:SAY.back,R),'happy');}}
else if(st.v>.1){if(SC.goX!=null&&p.x>=SC.goX-.15&&SC.kind!=='lane')say(SAY.stopturn[0],'wow');else if(st.t-st.t0<6&&SC.kind!=='lane')say(K.pick(SAY.fwd,R),'norm');}
else if(st.t-st.t0>6&&st.t-st.sayT>5)say(SAY.idle,'norm');}
function ppAdvice(){var sl=SC.slot,cm=SC.cm,cu=Math.cos(sl.th),su=Math.sin(sl.th),s=(p.x-SC.tgt.x)*cu+(p.y-SC.tgt.y)*su;if(s>cm.L+4.5)return null;var Ld=2.4,ax=SC.tgt.x+cu*Math.max(-.5,s-Ld),ay=SC.tgt.y+su*Math.max(-.5,s-Ld);
var al=E.norm(Math.atan2(ay-p.y,ax-p.x)-(p.th+Math.PI));return Math.max(-cm.DMAX,Math.min(cm.DMAX,-Math.atan2(2*cm.LW*Math.sin(al),Math.max(1,Math.hypot(ax-p.x,ay-p.y)))));}
function minDist(){var cs=E.corners(E.carBox(p,SC.cm)),m=9;SC.obs.forEach(function(o){var c=Math.cos(-o.a),s=Math.sin(-o.a);cs.forEach(function(q){var x=(q.x-o.cx)*c-(q.y-o.cy)*s,y=(q.x-o.cx)*s+(q.y-o.cy)*c,dx=Math.max(0,Math.abs(x)-o.hw),dy=Math.max(0,Math.abs(y)-o.hh);m=Math.min(m,Math.hypot(dx,dy));});});return m;}
var V={s:20,ox:0,oy:0},rr=K.rr;
function fit(){C.fit();if(!SC)return;var pad=6;V.wv=C.h>C.w*1.15?Math.min(SC.WW,11.5):SC.WW;V.wh=SC.WH;
var top=SC.gar?-3.3:-3.4,sc=function(h){return Math.min((C.w-pad*2)/V.wv,(C.h-pad*2)/h);},s0=sc(V.wh);if(!SC.gar&&sc(V.wh-top)<s0*.9)top=Math.max(top,-1.2);
V.s=sc(V.wh-top);V.oy=(C.h-(V.wh-top)*V.s)/2-top*V.s;V.cx=null;cam(1);}
function cam(k){if(!SC)return;var half=C.w/V.s/2,want=SC.WW/2;if(half*2<SC.WW&&p)want=Math.max(half,Math.min(SC.WW-half,(p.x+Math.cos(p.th)*SC.cm.CC+SC.slot.cx)/2));V.cx=V.cx==null||k>=1?want:V.cx+(want-V.cx)*k;V.ox=C.w/2-V.cx*V.s;}
function draw(dt,t){st.t+=dt;step(dt);if(C.fit())fit();if(!SC)return;cam(Math.min(1,dt*3));var c=ctx,s=V.s,T=SC.thm;
c.fillStyle=T.grass;c.fillRect(0,0,C.w,C.h);c.save();var sh=st.shake>0?(Math.random()-.5)*4*st.shake/.25:0;c.translate(V.ox+sh,V.oy);c.scale(s,s);
ground(c,t);SC.cars.forEach(function(k){item(c,k);});SC.obs.forEach(function(o){obst(c,o);});target(c,t);
var b=E.carBox(p,SC.cm);cart(c,b.cx,b.cy,p.th,SC.cm,{wheels:st.d,rev:st.v<-.05});c.restore();
if(st.fade>0){c.fillStyle='rgba(255,255,255,'+st.fade*.8+')';c.fillRect(0,0,C.w,C.h);}
wh.firstChild.style.transform='rotate('+st.wheel+'deg)';wtxt.textContent=Math.abs(st.wheel)<15?'прямо':(st.wheel<0?'◀ влево':'вправо ▶');
c.font='700 13px sans-serif';c.textBaseline='middle';var tt='Касаний: '+st.touch,tw=c.measureText(tt).width+16;c.fillStyle='rgba(255,253,247,.92)';rr(c,8,8,tw,26,13);c.fill();c.fillStyle=st.touch?'#c92a2a':'#2d3436';c.fillText(tt,16,21);
if(!st.helped&&st.go){var el=st.done&&st.rs.length?st.rs[st.rs.length-1].time:Math.max(0,st.t-st.t0),over=el>st.par,t2='⏱ '+Math.floor(el)+' с · норма '+st.par+' с',tw2=c.measureText(t2).width+16;
c.fillStyle='rgba(255,253,247,.92)';rr(c,8,40,tw2,26,13);c.fill();c.fillStyle=over?'#868e96':'#2b8a3e';c.fillText(t2,16,53);
if(!st.done&&el>LIMIT-15){var t3='Обед через '+Math.max(0,Math.ceil(LIMIT-el))+' с!',tw3=c.measureText(t3).width+16;c.fillStyle='rgba(255,236,236,.95)';rr(c,8,72,tw3,26,13);c.fill();c.fillStyle='#c92a2a';c.fillText(t3,16,85);}}
c.textBaseline='alphabetic';}
function ground(c,t){var T=SC.thm,k=SC.kind,W=SC.WW;
c.fillStyle=T.asph;c.fillRect(-4,SC.road[0]-.2,W+8,SC.road[1]-SC.road[0]+.4);c.fillStyle='rgba(255,255,255,.08)';for(var i=0;i<40;i++)c.fillRect(((i*7.31)%W),SC.road[0]+((i*3.17)%(SC.road[1]-SC.road[0])),.3,.08);
c.fillStyle=T.walk;c.fillRect(-4,SC.road[1]+.2,W+8,.25);
for(var tr=0;tr<W/3.6;tr++){var tx=1.5+tr*3.6,ty=SC.road[1]+1.4;c.fillStyle='#5c9e46';c.beginPath();c.arc(tx,ty,.9,0,7);c.fill();c.fillStyle='#74b85a';c.beginPath();c.arc(tx-.2,ty-.2,.55,0,7);c.fill();}
if(k==='bay'||k==='lane'){var y0=SC.slot.cy-SC.slot.hl;c.fillStyle=T.side;c.fillRect(-4,y0,W+8,SC.road[0]-y0);c.fillStyle=T.walk;c.fillRect(-4,-4,W+8,y0-.15+4);c.fillStyle='rgba(0,0,0,.15)';c.fillRect(-4,y0-.15,W+8,.18);
backdrop(c,y0-.2);c.strokeStyle=T.line;c.lineWidth=.12;
if(k==='lane'){c.fillStyle=T.side;c.fillRect(SC.slot.cx-SC.lane/2,SC.road[0],SC.lane,SC.WH-SC.road[0]+1);}
else SC.bays.forEach(function(x){var sl=SC.slot;[-1,1].forEach(function(sd){var ex=x+sl.hw*sd;c.beginPath();c.moveTo(ex,sl.cy-sl.hl);c.lineTo(ex,sl.cy+sl.hl);c.stroke();});});}
else{c.fillStyle=T.wall;c.fillRect(-4,-4,W+8,3.7);backdrop(c,-.6);
SC.gar.forEach(function(g){var a=g[0],b=g[1];c.fillStyle=g[2]?'#cfd4d9':'#b5bcc3';c.fillRect(a,-.6,b-a,SC.road[0]+.6);c.fillStyle='rgba(0,0,0,.06)';for(var r=0;r<SC.road[0];r+=1)c.fillRect(a,r,b-a,.06);
if(g[2]){c.fillStyle='#f59f00';for(var z=a+.1;z<b-.2;z+=.6)c.fillRect(z,.05,.3,.25);}});}}
function backdrop(c,y){var T=SC.thm,W=SC.WW,b=T.back;
if(b==='house'||b==='school'){c.fillStyle=T.wall;c.fillRect(-4,y-3.2,W+8,3.0);c.fillStyle=b==='school'?'#b5651d':'#c9765a';c.fillRect(-4,y-3.3,W+8,.25);
for(var x=.8;x<W;x+=2.2){c.fillStyle='#bfe0f2';c.fillRect(x,y-2.6,1.1,.9);c.strokeStyle='#fff';c.lineWidth=.08;c.strokeRect(x,y-2.6,1.1,.9);}}
else if(b==='kiosks'){var cols=['#e03131','#1971c2','#2f9e44','#f08c00'];for(var x3=-1,i=0;x3<W+2;x3+=3.0,i++){c.fillStyle='#f1e3c8';c.fillRect(x3,y-2.4,2.6,2.3);
for(var s2=0;s2<4;s2++){c.fillStyle=s2%2?'#fff':cols[i%4];c.fillRect(x3+s2*.65,y-2.9,.65,.6);}c.fillStyle='#ffd8a8';c.fillRect(x3+.4,y-1.6,1.8,.7);}}
else{c.fillStyle='#e9c46a';c.fillRect(-4,y-3.4,W+8,3.3);c.fillStyle='#b5651d';c.fillRect(-4,y-3.6,W+8,.3);for(var x4=.6;x4<W;x4+=2.0){c.fillStyle='#a5d8ff';c.fillRect(x4,y-2.9,.9,1.6);}
var cx=W/2;c.fillStyle='#fff';c.beginPath();c.arc(cx,y-3.9,.8,0,7);c.fill();c.strokeStyle='#343a40';c.lineWidth=.1;c.stroke();c.beginPath();c.moveTo(cx,y-3.9);c.lineTo(cx,y-4.4);c.moveTo(cx,y-3.9);c.lineTo(cx+.35,y-3.9);c.stroke();}
if(SC.kind==='dock'){var sl=SC.slot,a=SC.ramp[0],bb=SC.ramp[1],wy=-.55;c.fillStyle='#343a40';c.fillRect(a-.1,wy-1.5,bb-a+.2,1.5);c.fillStyle='#ffe8a3';c.fillRect(a+.1,wy-1.3,bb-a-.2,1.15);
c.fillStyle='#eebf99';c.beginPath();c.arc(sl.cx,wy-.6,.32,0,7);c.fill();c.fillStyle='#6f5136';c.beginPath();c.arc(sl.cx,wy-.75,.34,Math.PI,0);c.fill();c.fillStyle='#ff8a1f';c.fillRect(sl.cx-.45,wy-.3,.9,.2);
c.fillStyle='#fff';c.fillRect(a-1.2,wy-2.5,bb-a+2.4,.8);c.fillStyle='#c92a2a';c.font='bold .5px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('ПРИЁМ МАКУЛАТУРЫ',sl.cx,wy-2.1,bb-a+2.2);
c.fillStyle='#fff';c.fillRect(bb+1.4,wy-1.6,2.6,.7);c.fillStyle='#343a40';c.font='.34px sans-serif';c.fillText('обед 13:00–14:00',bb+2.7,wy-1.25,2.5);c.textAlign='left';c.textBaseline='alphabetic';}}
function item(c,k){c.save();c.translate(k.cx,k.cy);c.rotate(k.a);var L=k.L,W=k.W;c.fillStyle='rgba(0,0,0,.18)';rr(c,-L/2+.1,-W/2+.12,L,W,.25);c.fill();
if(k.id==='queue'){var n=3;for(var i=0;i<n;i++){var x=-L/2+L*(i+.5)/n,col=['#7048e8','#1971c2','#c2255c','#2b8a3e'][(i+k.v)%4];c.fillStyle=col;c.beginPath();c.ellipse(x,0,.42,.5,0,0,7);c.fill();
c.fillStyle=i%2?'#868e96':'#e9ecef';c.beginPath();c.arc(x,0,.26,0,7);c.fill();c.fillStyle='#f1e3c8';c.fillRect(x-.18,-.5,.36,.3);c.strokeStyle='#a07850';c.lineWidth=.04;c.strokeRect(x-.18,-.5,.36,.3);}}
else if(k.id==='crates'){for(var j=0;j<3;j++){var x2=-L/2+L*j/3;c.fillStyle='#c08a4a';c.fillRect(x2+.05,-W/2,L/3-.1,W);c.strokeStyle='#8a5a2a';c.lineWidth=.06;c.strokeRect(x2+.1,-W/2+.05,L/3-.2,W-.1);c.beginPath();c.moveTo(x2+.1,-W/2+.05);c.lineTo(x2+L/3-.1,W/2-.05);c.stroke();}}
else if(k.id==='bench'){c.fillStyle='#8a5a2a';c.fillRect(-L/2,-W/2,L,W);c.fillStyle='#b07a40';for(var y=-W/2+.1;y<W/2;y+=.28)c.fillRect(-L/2+.05,y,L-.1,.18);}
else if(k.id==='barrels'){[[-.5,-.35],[.5,-.35],[0,.4]].forEach(function(q){c.fillStyle='#2f6b9a';c.beginPath();c.arc(q[0]*L/2.2,q[1]*W/1.6,.5,0,7);c.fill();c.strokeStyle='#1d4567';c.lineWidth=.08;c.beginPath();c.arc(q[0]*L/2.2,q[1]*W/1.6,.36,0,7);c.stroke();});}
else if(k.id==='kiosk'){c.fillStyle='#f1e3c8';c.fillRect(-L/2,-W/2,L,W);for(var s3=0;s3<6;s3++){c.fillStyle=s3%2?'#fff':'#e03131';c.fillRect(-L/2+s3*L/6,-W/2,L/6,.4);}}
else if(k.id==='bikes'){c.strokeStyle='#343a40';c.lineWidth=.08;[-.3,.3].forEach(function(o2){c.beginPath();c.arc(-L/3,o2*W,.35,0,7);c.arc(L/3,o2*W,.35,0,7);c.stroke();c.beginPath();c.moveTo(-L/3,o2*W);c.lineTo(L/3,o2*W);c.stroke();});}
else{c.restore();cart(c,k.cx,k.cy,k.a,{L:L,W:W,ROV:.4,LW:2},{other:k.v});return;}
c.restore();}
function obst(c,o){if(o.t==='car')return;c.save();c.translate(o.cx,o.cy);c.rotate(o.a);var w=o.hw*2,h=o.hh*2;
if(o.t==='bin'){c.fillStyle='#2f9e44';rr(c,-o.hw,-o.hh,w,h,.15);c.fill();c.fillStyle='#237032';c.fillRect(-o.hw,-o.hh,w,.18);}
else if(o.t==='bush'){c.fillStyle='#4f9a3c';c.beginPath();c.arc(0,0,o.hw,0,7);c.fill();}
else if(o.t==='crate'){c.fillStyle='#c08a4a';c.fillRect(-o.hw,-o.hh,w,h);c.strokeStyle='#8a5a2a';c.lineWidth=.06;c.strokeRect(-o.hw+.05,-o.hh+.05,w-.1,h-.1);c.beginPath();c.moveTo(-o.hw,-o.hh);c.lineTo(o.hw,o.hh);c.stroke();}
else if(o.t==='wall'&&SC.kind!=='lane'){c.fillStyle='#495057';c.fillRect(-o.hw,-o.hh,w,h);}
else if(o.t==='wall'){c.fillStyle='#8f5b3a';c.fillRect(-o.hw,-o.hh,w,h);}
else if(o.t==='wall2'){c.fillStyle='#b4a28c';c.fillRect(-o.hw,-o.hh,w,h);c.fillStyle='rgba(0,0,0,.12)';for(var yy=-o.hh;yy<o.hh;yy+=.5)c.fillRect(-o.hw,yy,w,.05);}
else if(o.t==='post'){c.fillStyle='#e8590c';c.fillRect(-o.hw,-o.hh,w,h);c.fillStyle='#fff';c.fillRect(-o.hw,-.06,w,.12);}
else if(o.t==='rail'){c.fillStyle='#f59f00';c.fillRect(-o.hw*.5,-o.hh,o.hw,h);c.fillStyle='#343a40';for(var y2=-o.hh;y2<o.hh;y2+=.6)c.fillRect(-o.hw*.5,y2,o.hw,.3);}
c.restore();}
function target(c,t){var sl=SC.slot,pl=calm?1:.6+.4*Math.sin(t*4);c.save();c.translate(sl.cx,sl.cy);c.rotate(sl.th);
c.strokeStyle='rgba(255,212,59,'+pl+')';c.lineWidth=.13;c.setLineDash([.5,.35]);c.strokeRect(-sl.hl+.08,-sl.hw+.08,sl.hl*2-.16,sl.hw*2-.16);c.setLineDash([]);
c.fillStyle='rgba(255,212,59,'+(.45*pl)+')';c.beginPath();c.moveTo(1.2,0);c.lineTo(.2,-.7);c.lineTo(.2,-.3);c.lineTo(-1.2,-.3);c.lineTo(-1.2,.3);c.lineTo(.2,.3);c.lineTo(.2,.7);c.closePath();c.fill();c.restore();}
function cart(c,cx,cy,a,cm,o){var L=cm.L,W=cm.W;c.save();c.translate(cx,cy);c.rotate(a);
c.fillStyle='rgba(0,0,0,.22)';rr(c,-L/2+.12,-W/2+.15,L*.82,W,.2);c.fill();
c.fillStyle='#212529';var fx=-L/2+cm.ROV+cm.LW,bx=-L/2+cm.ROV;[-1,1].forEach(function(sd){c.save();c.translate(fx,sd*(W/2-.02));c.rotate(o.wheels||0);c.fillRect(-.28,-.1,.56,.2);c.restore();c.fillRect(bx-.28,sd*(W/2-.02)-.1,.56,.2);});
c.fillStyle=o.other!=null?['#868e96','#5c7cfa','#e8590c','#2b8a3e'][o.other%4]:'#4a6fa5';rr(c,-L/2,-W/2+.1,L*.8,W-.2,.12);c.fill();
c.fillStyle='#f1e3c8';for(var i=0;i<3;i++){var x=-L/2+.15+i*(L*.8-.3)/3;c.fillRect(x,-W/2+.25,(L*.8-.3)/3-.08,W-.5);c.strokeStyle='#a07850';c.lineWidth=.05;c.beginPath();c.moveTo(x,0);c.lineTo(x+(L*.8-.3)/3-.08,0);c.stroke();}
c.strokeStyle='#343a40';c.lineWidth=.12;c.beginPath();c.moveTo(L*.3,-W/2+.25);c.lineTo(L/2-.05,-W/2+.25);c.lineTo(L/2-.05,W/2-.25);c.lineTo(L*.3,W/2-.25);c.stroke();
if(o.other==null){c.fillStyle='#7048e8';c.beginPath();c.arc(L/2+.25,0,.38,0,7);c.fill();c.fillStyle='#c9c9c9';c.beginPath();c.arc(L/2+.25,0,.24,0,7);c.fill();c.fillStyle='#adb5bd';c.beginPath();c.arc(L/2+.38,0,.12,0,7);c.fill();
if(o.rev){c.fillStyle='rgba(255,255,230,.25)';c.beginPath();c.moveTo(-L/2,-W/2+.2);c.lineTo(-L/2-1.2,-W/2-.2);c.lineTo(-L/2-1.2,W/2+.2);c.lineTo(-L/2,W/2-.2);c.fill();}}
c.restore();}
host.onResize(fit);K.loop(host,draw);
load(0);st.loaded=0;ctrls();info();sayNow('Задом, Зинаида Пална, задом! Окошко у меня одно.','happy');
host.intro({who:'zina',text:'Собрала макулатуру со всего подъезда! Михалыч принимает до 14:00 — поставлю тележку задом к окошку. Три сдачи: каждый раз проход уже.',
hint:host.pc?'←/→ — руль · ↑ — газ вперёд · ↓ — газ назад · Пробел — тормоз · Н — руль прямо · Enter — дальше':'Руль крути пальцем · «Вперёд/Назад» — передача · держи «Газ», «Тормоз» — стоп',btn:'Поехали'}).then(function(){st.t0=st.t;startTask();});
st.api={ff:function(n){for(var i=0;i<n&&!st.done;i++){st.t+=1/60;step(1/60);}return st.done;},go:function(i){st.i=i;startTask();},auto:function(){autoRun(false);},help:function(){autoRun(true);},next:next,
scene:function(){return SC;},pose:function(){return p;},bot:function(){var tk=setInterval(function(){if(st.fin){clearInterval(tk);return;}if(!st.go)return;if(st.done){if(st.nextOn)next();}else if(!st.auto&&!st.botOn){st.botOn=st.i+1;p.x=SC.start.x;p.y=SC.start.y;p.th=SC.start.th;st.v=0;st.d=0;st.wheel=0;autoRun(false);}else if(st.botOn&&st.botOn!==st.i+1)st.botOn=0;},300);}};
}});
})();
