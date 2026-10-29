'use strict';
(function(){
if(typeof ZMG_REG!=='function')return;
var SAM_ON=true;if(!SAM_ON||(window.ZB2&&ZB2.off('samolet')))return;
var ID='samolet',CUT=[5,12,20];
if(window.ZB2)ZB2.reg('samolet',{t:'Мини-игра «Самолётик»',who:'LOV'});
var G=2.3,JUMP=-.66,VMAX=1.15,R=.028,X0=.32,TOP=.05,FLOOR=.93,PW=.13;
function gapOf(i){return Math.max(.25,.38-.0065*i);}
function dxOf(i){return Math.max(.44,.6-.007*i);}
function spOf(i){return Math.min(.66,.36+.011*i);}
function newObs(st,x){var i=st.made++,g=gapOf(i),lo=TOP+.05+g/2,hi=FLOOR-.06-g/2,prev=st.lastY==null?.5:st.lastY,sh=.34;
var y=lo+(hi-lo)*st.rnd();y=Math.max(prev-sh,Math.min(prev+sh,y));y=Math.max(lo,Math.min(hi,y));st.lastY=y;
var k=i%5===4?'zav':st.rnd()<.5?'map':'lamp',b=i%5===4?'door':st.rnd()<.6?'books':'globe';
st.obs.push({x:x,y:y,g:g,i:i,top:k,bot:b,pass:false,c:Math.floor(st.rnd()*4)});}
function init(rnd,aspect){var st={y:.45,vy:0,t:0,sc:0,made:0,obs:[],rnd:rnd,lastY:null,aspect:aspect,dead:false,go:false,flapT:-9};
var x=aspect+.15;for(var k=0;k<4;k++){newObs(st,x);x+=dxOf(k);}return st;}
function hit(st){if(st.y+R>FLOOR)return'floor';for(var j=0;j<st.obs.length;j++){var o=st.obs[j];
if(X0+R>o.x-PW/2&&X0-R<o.x+PW/2&&(st.y-R*.8<o.y-o.g/2||st.y+R*.8>o.y+o.g/2))return o.top==='zav'&&st.y>o.y?'zav':st.y<o.y?o.top:o.bot;}return'';}
function step(st,dt,flap){if(st.dead)return'';st.t+=dt;
if(!st.go){st.y=.45+Math.sin(st.t*3)*.02;if(!flap)return'';st.go=true;}
if(flap){st.vy=JUMP;st.flapT=st.t;}
st.vy=Math.min(VMAX,st.vy+G*dt);st.y+=st.vy*dt;if(st.y-R<TOP){st.y=TOP+R;if(st.vy<0)st.vy=0;}
var sp=spOf(st.sc);for(var j=0;j<st.obs.length;j++){var o=st.obs[j];o.x-=sp*dt;if(!o.pass&&o.x+PW/2<X0-R){o.pass=true;st.sc++;st.just=1;}}
while(st.obs.length&&st.obs[0].x<-.3)st.obs.shift();
var last=st.obs[st.obs.length-1];if(!last||last.x<st.aspect+.2)newObs(st,(last?last.x:st.aspect)+dxOf(st.made));
var h=hit(st);if(h)st.dead=true;return h;}
function revive(st){st.dead=false;st.go=false;st.vy=0;st.y=.45;st.t=0;st.obs=st.obs.filter(function(o){return o.x>X0+.55;});
var last=st.obs[st.obs.length-1];if(!last)newObs(st,X0+.7);}
function botFlap(st,k,rnd,mem){var nx=null;for(var j=0;j<st.obs.length;j++){var o=st.obs[j];if(o.x+PW/2>X0-R){nx=o;break;}}
var ty=nx?nx.y+nx.g*.12:.5;mem.err=mem.err==null||rnd()<.02?(rnd()-.5)*(1-k)*.22:mem.err;ty+=mem.err;
var lag=.03+(1-k)*.13,py=st.y+st.vy*lag+.5*G*lag*lag;return py>ty&&st.vy>-.1&&st.t-st.flapT>.12+(1-k)*.06;}
function sim(o,k){var rnd=o.rnd||Math.random,st=init(rnd,.62),mem={},dt=1/60,n=0,dead=0;
while(n<60*120){n++;var f=!st.go||botFlap(st,k,rnd,mem);if(rnd()<(1-k)*.004)f=!f;if(step(st,dt,f)){dead=1;break;}}
return{sc:st.sc,st:tierOf(st.sc),t:n*dt,dead:dead};}
function tierOf(s){return s>=CUT[2]?3:s>=CUT[1]?2:s>=CUT[0]?1:0;}
var PL=[{n:'Класс',wall:'#f3ead2',low:'#d9c9a3',fl:'#b98a5a',acc:'#2f6b3a',win:1},{n:'Коридор',wall:'#e3eef3',low:'#a9c6d3',fl:'#c4a77d',acc:'#7a5c3e',door:1},
{n:'Лестница',wall:'#efe3e3',low:'#c9a9a9',fl:'#9a9a9a',acc:'#6b4b4b',rail:1},{n:'Спортзал',wall:'#f4f0de',low:'#e0b860',fl:'#d9a35c',acc:'#c92a2a',gym:1},
{n:'Столовая',wall:'#fdf0e0',low:'#e8c9a0',fl:'#bfa080',acc:'#e8590c',tile:1}];
var SAY={start:['Самолётик с задней парты — до доски! Жми — подлетает, отпустишь — планирует.','Спорим, до доски долетит? Только Нину Аркадьевну не задень!'],
five:['Пять парт! Завуч ничего не видит.','Летит! Прямо как у меня на контрольной.'],ten:['Вылетел в коридор! Это уже рекорд школы!'],
zone:['Новое место: ','Летим дальше: '],crash:{floor:'Приземлился на пол. Подбери — и снова!',map:'В карту мира! Прямо в Австралию.',lamp:'Зацепился за лампу. Ну, электрик починит.',
books:'В стопку учебников! Библиотекарь будет ругаться.',globe:'Сбил глобус! Земля вертится — и я тоже.',door:'Влетел в дверь! Хорошо, что не к директору.',zav:'Завуч поймала взглядом! Самолётик конфискован.'}};
ZMG_REG({a:'Жми — самолётик подлетает. Облети лампы и глобус до доски!',ns:'Сложила самолётик из старой контрольной. Долетит до доски — оценку исправлю. Шучу. Наверное.',id:ID,finWho:'valerka',deps:['js/zmg-lkit.js','js/zmg-rec-ui.js'],sim:sim,
lines:{good:'Вот это полёт! Самолётик — в музей школы.',ok:'Неплохо пролетел! Ещё бы чуть-чуть до доски.',bad:'Ничего! Сложим новый — бумаги полно.'},
run:function(host,o){
var K=window.ZLK,REC=window.ZMGREC,rnd=o.rnd||Math.random,calm=K.calm(host);
var f=K.frame(host,{who:'valerka'}),C=K.canvas(f.main),c=C.ctx,st=init(rnd,C.w/C.h),flap=false,fin=false,crashT=0,crashWhy='',zone=0,bg=null,bgKey='',sayT=0;
window.__zl_samolet=st;
function info(){var b=REC&&REC.best?REC.best(ID):0,g=REC&&REC.galya?REC.galya(ID):0;f.info('<span>✈ '+st.sc+'</span><span>Рекорд: '+b+'</span>'+(g?'<span>Галя: '+g+'</span>':''));host.top(st.sc+' '+(typeof plural==='function'?plural(st.sc,'парта','парты','парт'):'парт'));}
function say(t,m){f.say(t,m||'norm');sayT=st.t;}
K.tap(host,f.main,function(){if(fin||st.dead)return;flap=true;});
host.ptr(f.foot,{down:function(){if(!fin&&!st.dead)flap=true;}});
function bgDraw(){var key=C.w+'x'+C.h+'|'+zone;if(bgKey===key)return;bgKey=key;var p=PL[zone%PL.length],H=C.h,w=C.w,d=C.dpr;
bg=document.createElement('canvas');bg.width=Math.round(w*d);bg.height=Math.round(H*d);var g=bg.getContext('2d');g.setTransform(d,0,0,d,0,0);
g.fillStyle=p.wall;g.fillRect(0,0,w,H);g.fillStyle=p.low;g.fillRect(0,H*.62,w,H*.31);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,H*.62,w,3);
g.fillStyle=p.fl;g.fillRect(0,H*FLOOR,w,H*(1-FLOOR));g.fillStyle='rgba(0,0,0,.1)';for(var x=0;x<w;x+=H*.12)g.fillRect(x,H*FLOOR,2,H);
g.fillStyle='#fff';g.fillRect(0,0,w,H*TOP);g.fillStyle='rgba(0,0,0,.06)';g.fillRect(0,H*TOP,w,2);
if(p.win)for(var i=0;i<w;i+=H*.7){g.fillStyle='#bfe0f2';g.fillRect(i+H*.12,H*.16,H*.26,H*.32);g.strokeStyle='#fff';g.lineWidth=H*.012;g.strokeRect(i+H*.12,H*.16,H*.26,H*.32);g.beginPath();g.moveTo(i+H*.25,H*.16);g.lineTo(i+H*.25,H*.48);g.stroke();}
if(p.door)for(var j=0;j<w;j+=H*.8){g.fillStyle='#b08860';g.fillRect(j+H*.3,H*.3,H*.2,H*.63);g.fillStyle='#e9d8b5';g.fillRect(j+H*.33,H*.34,H*.14,H*.12);}
if(p.rail){g.strokeStyle=p.acc;g.lineWidth=H*.01;for(var r=0;r<w;r+=H*.5){g.beginPath();g.moveTo(r,H*.8);g.lineTo(r+H*.5,H*.55);g.stroke();}}
if(p.gym){g.strokeStyle='#fff';g.lineWidth=H*.008;g.beginPath();g.arc(w/2,H*FLOOR,H*.25,Math.PI,0);g.stroke();for(var q=0;q<w;q+=H*.9){g.fillStyle='#8a6b4a';g.fillRect(q+H*.6,H*.2,H*.012,H*.42);for(var y=H*.24;y<H*.6;y+=H*.06)g.fillRect(q+H*.6,y,H*.2,H*.008);g.fillRect(q+H*.8,H*.2,H*.012,H*.42);}}
if(p.tile){g.fillStyle='rgba(255,255,255,.35)';for(var a=0;a<w;a+=H*.08)for(var b=H*.62;b<H*FLOOR;b+=H*.08)g.fillRect(a+1,b+1,H*.08-2,H*.08-2);}
g.fillStyle=p.acc;g.fillRect(w-H*.05,H*.18,H*.05,H*.4);
}
function obstacle(o){var H=C.h,x=o.x*H,w=PW*H,t=(o.y-o.g/2)*H,b=(o.y+o.g/2)*H,col=['#c92a2a','#1971c2','#2b8a3e','#e8590c'][o.c];
if(o.top==='map'){c.fillStyle='#8a6b4a';c.fillRect(x-w*.55,TOP*H,w*1.1,H*.025);c.fillStyle='#d8f0f7';c.fillRect(x-w/2,TOP*H,w,t-TOP*H);
c.fillStyle='#9fd18b';c.beginPath();c.ellipse(x-w*.15,TOP*H+(t-TOP*H)*.35,w*.22,(t-TOP*H)*.18,0,0,7);c.ellipse(x+w*.2,TOP*H+(t-TOP*H)*.65,w*.18,(t-TOP*H)*.14,0,0,7);c.fill();
c.fillStyle='#8a6b4a';c.fillRect(x-w*.55,t-H*.02,w*1.1,H*.02);}
else if(o.top==='lamp'){c.fillStyle='#555';c.fillRect(x-w*.1,TOP*H,w*.2,t-TOP*H-H*.05);c.fillStyle='#f1f3f5';c.beginPath();c.moveTo(x-w/2,t);c.lineTo(x-w*.25,t-H*.06);c.lineTo(x+w*.25,t-H*.06);c.lineTo(x+w/2,t);c.closePath();c.fill();
c.fillStyle='rgba(255,236,153,.6)';c.beginPath();c.arc(x,t,w*.18,0,Math.PI);c.fill();}
else{c.fillStyle='#6c757d';c.fillRect(x-w*.08,TOP*H,w*.16,t-TOP*H-H*.08);c.fillStyle='#ffd8a8';c.beginPath();c.arc(x,t-H*.045,w*.36,0,7);c.fill();
c.fillStyle='#868e96';c.beginPath();c.arc(x,t-H*.075,w*.38,Math.PI,0);c.fill();c.strokeStyle='#212529';c.lineWidth=2;c.beginPath();c.arc(x-w*.13,t-H*.045,w*.1,0,7);c.arc(x+w*.13,t-H*.045,w*.1,0,7);c.stroke();
c.fillStyle='rgba(255,80,80,'+(calm?.15:.15+.1*Math.sin(st.t*6))+')';c.beginPath();c.moveTo(x,t-H*.03);c.lineTo(x-w*1.4,t+H*.05);c.lineTo(x+w*1.4,t+H*.05);c.closePath();c.fill();}
var fy=FLOOR*H;
if(o.bot==='books'){var y=fy,k=0;while(y>b){var bh=Math.min(H*.035,y-b),wd=w*(.86+.14*((k*37)%3)/2);c.fillStyle=['#c92a2a','#1971c2','#2b8a3e','#e8590c','#7048e8'][(k+o.c)%5];c.fillRect(x-wd/2,y-bh,wd,bh-1);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(x-wd/2+3,y-bh*.6,wd*.5,1);y-=bh;k++;}}
else if(o.bot==='globe'){c.fillStyle='#8a6b4a';c.fillRect(x-w/2,b+w*.9,w,fy-b-w*.9);c.fillStyle='#6b4f36';c.fillRect(x-w*.08,b+w*.6,w*.16,w*.32);
c.fillStyle='#4dabf7';c.beginPath();c.arc(x,b+w*.42,w*.42,0,7);c.fill();c.fillStyle='#69db7c';c.beginPath();c.ellipse(x-w*.1,b+w*.35,w*.15,w*.2,.4,0,7);c.fill();}
else{c.fillStyle='#a07850';c.fillRect(x-w/2,b,w,fy-b);c.fillStyle='#e9d8b5';c.fillRect(x-w*.35,b+H*.04,w*.7,H*.08);c.fillStyle='#212529';c.font='700 '+Math.round(H*.022)+'px sans-serif';c.textAlign='center';c.fillText('УЧИТЕЛЬСКАЯ',x,b+H*.09,w*.66);}}
function plane(){var H=C.h,x=X0*H,y=st.y*H,s=H*.05,a=Math.max(-.6,Math.min(.8,st.vy*.9));c.save();c.translate(x,y);c.rotate(st.dead?1.2:a);
c.fillStyle='#fff';c.strokeStyle='#495057';c.lineWidth=1.5;c.beginPath();c.moveTo(s*1.1,0);c.lineTo(-s*.9,-s*.55);c.lineTo(-s*.5,0);c.lineTo(-s*.9,s*.35);c.closePath();c.fill();c.stroke();
c.fillStyle='#dee2e6';c.beginPath();c.moveTo(s*1.1,0);c.lineTo(-s*.5,0);c.lineTo(-s*.75,s*.18);c.closePath();c.fill();c.strokeStyle='#adb5bd';c.beginPath();c.moveTo(-s*.2,-s*.2);c.lineTo(s*.3,-s*.08);c.stroke();c.restore();}
function draw(dt){if(C.fit()){st.aspect=C.w/C.h;bgKey='';}
if(!fin){var why=step(st,dt,flap);flap=false;
if(st.just){st.just=0;K.snd(host,'tap');info();if(st.sc%10===0){zone=Math.floor(st.sc/10);K.pop(host,f.main,'Новое место: '+PL[zone%PL.length].n+'!','big');say(K.pick(SAY.zone,rnd)+PL[zone%PL.length].n.toLowerCase()+'!','happy');}
else if(st.sc===5)say(K.pick(SAY.five,rnd),'happy');else if(st.sc===(REC.best(ID)|0)+1&&REC.best(ID)>0)K.pop(host,f.main,'Рекорд!','big');}
if(why){crashWhy=why;crashT=0;K.snd(host,'bad');K.buzz('bad');say(SAY.crash[why]||SAY.crash.floor,'sad');}}
if(st.dead&&!fin){crashT+=dt;if(crashT>.8&&!st.asked){st.asked=1;ask();}}
bgDraw();c.drawImage(bg,0,0,C.w,C.h);for(var j=0;j<st.obs.length;j++)obstacle(st.obs[j]);plane();
if(!st.go&&!st.dead&&!fin){c.fillStyle='rgba(255,255,255,.85)';var tw=Math.min(C.w-20,300);K.rr(c,(C.w-tw)/2,C.h*.7,tw,44,22);c.fill();c.fillStyle='#2d3436';c.font='700 17px sans-serif';c.textAlign='center';c.textBaseline='middle';
c.fillText(host.pc?'Пробел или клик — взлететь':'Нажми — и полетели!',C.w/2,C.h*.7+22);c.textBaseline='alphabetic';
if(!calm){var px=C.w/2+Math.sin(st.t*4)*4;c.font='30px sans-serif';c.fillText('👆',px,C.h*.7+80);}}}
function ask(){K.cont(host,f.main,{text:'Самолётик упал на '+st.sc+'-й парте. Продолжить полёт с того же места?',
onYes:function(){st.asked=0;revive(st);say('Валерка сложил новый — летим дальше!','happy');},onNo:end});}
function end(){if(fin)return;fin=true;var sc=st.sc,u=typeof plural==='function'?plural(sc,'парту','парты','парт'):'парт';
(REC&&REC.finish?REC.finish:function(h,x){h.finish(x);})(host,{sc:sc,st:tierOf(sc),label:'Самолётик пролетел '+sc+' '+u});}
host.bot=function(k){};
st.api={bot:function(k){var m={},r2=Math.random;host.loop(function(){if(!fin&&!st.dead&&(!st.go||botFlap(st,k,r2,m)))flap=true;});},end:end};
say(K.pick(SAY.start,rnd),'happy');info();K.loop(host,draw);
host.intro({who:'valerka',text:'Сложил самолётик из промокашки! Жми — подлетает, отпустишь — планирует. Облети карты, лампы и стопки учебников. Каждая парта — очко.',
hint:host.pc?'Пробел, ↑ или клик — взлететь':'Нажимай на экран — самолётик подлетает',btn:'Полетели!'});
}});
})();
