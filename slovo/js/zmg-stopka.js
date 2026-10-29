'use strict';
(function(){
if(typeof ZMG_REG!=='function')return;
var STOPKA_ON=true;if(!STOPKA_ON||(window.ZB2&&ZB2.off('stopka')))return;
if(window.ZB2)ZB2.reg('stopka',{t:'Мини-игра «Стопка учебников»',who:'LOV'});
var ID='stopka',CUT=[8,15,24],W0=.56,PERF=.014,BH=.075;
function spOf(n){return Math.min(1.5,.62+.035*n);}
function tierOf(s){return s>=CUT[2]?3:s>=CUT[1]?2:s>=CUT[0]?1:0;}
function init(rnd){var st={stack:[{x:.5-W0/2,w:W0,c:0}],cur:null,n:0,streak:0,dead:false,t:0,rnd:rnd,cuts:[],pf:0};spawn(st);return st;}
function spawn(st){var top=st.stack[st.stack.length-1],dir=st.rnd()<.5?1:-1;st.cur={x:dir>0?-top.w*.3:1-top.w*.7,w:top.w,dir:dir,c:1+Math.floor(st.rnd()*6)};}
function step(st,dt){if(st.dead||!st.cur)return;st.t+=dt;var c=st.cur,sp=spOf(st.n);c.x+=c.dir*sp*dt;
if(c.x+c.w>1.08){c.x=1.08-c.w;c.dir=-1;}if(c.x<-.08){c.x=-.08;c.dir=1;}
for(var i=st.cuts.length-1;i>=0;i--){var k=st.cuts[i];k.vy+=3*dt;k.y+=k.vy*dt;k.a+=k.va*dt;if(k.y>3)st.cuts.splice(i,1);}}
function drop(st){var c=st.cur,top=st.stack[st.stack.length-1];if(!c||st.dead)return'';var off=c.x-top.x;
if(Math.abs(off)<=PERF){c.x=top.x;st.streak++;st.pf++;var w=top.w;if(st.streak%3===0)w=Math.min(W0,w+.03);st.stack.push({x:c.x-(w-top.w)/2,w:w,c:c.c});st.n++;spawn(st);return'perfect';}
var a=Math.max(c.x,top.x),b=Math.min(c.x+c.w,top.x+top.w);
if(b-a<=.01){st.dead=true;st.cuts.push({x:c.x,w:c.w,y:0,vy:0,a:0,va:c.dir*2,c:c.c,lv:st.stack.length});st.cur=null;return'miss';}
st.cuts.push({x:off>0?b:c.x,w:c.w-(b-a),y:0,vy:0,a:0,va:(off>0?1:-1)*3,c:c.c,lv:st.stack.length});
st.stack.push({x:a,w:b-a,c:c.c});st.n++;st.streak=0;spawn(st);return'ok';}
function revive(st){st.dead=false;var top=st.stack[st.stack.length-1];top.w=Math.max(top.w,.3);if(top.x+top.w>1)top.x=1-top.w;spawn(st);}
function botWant(st,k,mem,rnd){var c=st.cur,top=st.stack[st.stack.length-1];if(!c)return false;var sp=spOf(st.n);if(mem.err==null)mem.err=(rnd()-.5)*2*(.035+.13*(1-k))*sp*c.dir;
var off=c.x-top.x;if(Math.abs(off-mem.err)<sp/60*.6+.002){mem.err=null;return true;}return false;}
function sim(o,k){var rnd=o.rnd||Math.random,st=init(rnd),m={},dt=1/60,n=0;while(!st.dead&&n<60*150){n++;step(st,dt);if(botWant(st,k,m,rnd))drop(st);}return{sc:st.n,st:tierOf(st.n),t:n*dt};}
var COL=['#c92a2a','#1971c2','#2b8a3e','#e8590c','#7048e8','#0c8599','#d6336c'];
var TIT=['АЗБУКА','МАТЕМАТИКА','РУССКИЙ','ИСТОРИЯ','ГЕОГРАФИЯ','ПРИРОДОВЕД.','ЧТЕНИЕ','ПРОПИСИ','АТЛАС','СЛОВАРЬ'];
var SAY={start:['Учебники — в стопку! Ровненько, как в библиотеке.','Роняй точно на стопку — что свисает, то отрежем.'],
perf:['Отлично! Как по линеечке.','Ровно! Библиотекарь плачет от счастья.','Вот это аккуратность!'],ok:['Свисает — отрезали. Дальше!','Чуть криво, но держится.'],
miss:'Мимо! Учебник на полу. Собираем…',h:['Стопка до потолка скоро!','Выше Валерки уже!','Скоро в шкаф не влезет!']};
ZMG_REG({a:'Роняй учебник ровно на стопку — выше и выше',ns:'Учебники на склад! Ставь стопкой ровно — кривую завуч заметит из коридора.',id:ID,finWho:'vp',deps:['js/zmg-lkit.js','js/zmg-rec-ui.js'],sim:sim,
lines:{good:'Стопка — как башня! Ставлю пять за аккуратность.',ok:'Хорошая стопка! Чуть ровнее — и до потолка.',bad:'Учебники рассыпались — ничего, соберём заново.'},
run:function(host,o){
var K=window.ZLK,REC=window.ZMGREC,rnd=o.rnd||Math.random,calm=K.calm(host);
var f=K.frame(host,{who:'vp'}),C=K.canvas(f.main),c=C.ctx,st=init(rnd),fin=false,go=false,want=false,camY=0,deadT=0,asked=false,bg=null,bgK='';
window.__zl_stopka=st;
function u(n){return n+' '+(typeof plural==='function'?plural(n,'учебник','учебника','учебников'):'учебников');}
function info(){var b=REC&&REC.best?REC.best(ID):0,g=REC&&REC.galya?REC.galya(ID):0;f.info('<span>📚 '+st.n+'</span><span>Рекорд: '+b+'</span>'+(g?'<span>Галя: '+g+'</span>':''));host.top(u(st.n));}
K.tap(host,f.main,function(){if(!fin&&go&&!st.dead)want=true;});host.ptr(f.foot,{down:function(){if(!fin&&go&&!st.dead)want=true;}});
function bgDraw(){var k=C.w+'x'+C.h;if(bgK===k)return;bgK=k;var d=C.dpr;bg=document.createElement('canvas');bg.width=Math.round(C.w*d);bg.height=Math.round(C.h*d);var g=bg.getContext('2d');g.setTransform(d,0,0,d,0,0);
g.fillStyle='#f4ead6';g.fillRect(0,0,C.w,C.h);var sw=Math.max(60,C.w*.16);
for(var x of[0,C.w-sw]){g.fillStyle='#8a5a2b';g.fillRect(x,0,sw,C.h);for(var y=20;y<C.h;y+=70){g.fillStyle='#6b4420';g.fillRect(x,y+56,sw,8);for(var b=x+4;b<x+sw-8;b+=11){g.fillStyle=COL[Math.floor((b*7+y)/11)%COL.length];g.fillRect(b,y+18+((b*3)%14),9,38-((b*3)%14));}}}
g.fillStyle='rgba(0,0,0,.05)';for(var yy=0;yy<C.h;yy+=24)g.fillRect(sw,yy,C.w-2*sw,1);}
function book(x,y,w,h,ci,t){var p=w*C.w,px=x*C.w;c.fillStyle=COL[ci%COL.length];K.rr(c,px,y,p,h,3);c.fill();c.fillStyle='rgba(255,255,255,.9)';c.fillRect(px,y+h*.2,p,h*.12);c.fillRect(px,y+h*.68,p,h*.12);
if(p>60){c.fillStyle='#fff';c.font='700 '+Math.round(h*.36)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(TIT[ci%TIT.length],px+p/2,y+h*.47,p-8);c.textBaseline='alphabetic';}}
function draw(dt){if(C.fit())bgK='';bgDraw();if(!fin&&go){step(st,dt);if(want){want=false;var r=drop(st);
if(r==='perfect'){K.snd(host,'coin');K.pop(host,f.main,st.streak>=3?'Отлично! ×'+st.streak:'Отлично!');if(rnd()<.4)f.say(K.pick(SAY.perf,rnd),'happy');info();}
else if(r==='ok'){K.snd(host,'tap');if(st.n%7===0)f.say(K.pick(SAY.h,rnd),'happy');else if(rnd()<.25)f.say(K.pick(SAY.ok,rnd),'norm');info();
if(st.n===(REC.best(ID)|0)+1&&REC.best(ID)>0)K.pop(host,f.main,'Рекорд!','big');}
else if(r==='miss'){K.snd(host,'bad');K.buzz('bad');f.say(SAY.miss,'sad');deadT=0;}}}
if(st.dead&&!fin){deadT+=dt;if(deadT>.9&&!asked){asked=true;K.cont(host,f.main,{text:'Стопка — '+u(st.n)+'. Продолжить с того же места?',onYes:function(){asked=false;revive(st);f.say('Ещё учебник принесли — продолжаем!','happy');},onNo:end});}}
var bh=Math.min(C.w*BH,C.h/12),floor=C.h-12,topY=floor-st.stack.length*bh,want2=Math.max(0,C.h*.45-topY);camY+=calm?(want2-camY):(want2-camY)*Math.min(1,dt*6);
c.drawImage(bg,0,0,C.w,C.h);c.save();c.translate(0,camY);
c.fillStyle='#6b4420';c.fillRect(0,floor,C.w,C.h);
for(var i=0;i<st.stack.length;i++){var s=st.stack[i];book(s.x,floor-(i+1)*bh,s.w,bh-2,s.c);}
for(var j=0;j<st.cuts.length;j++){var k=st.cuts[j],y=floor-k.lv*bh-bh+k.y*C.h;c.save();c.translate((k.x+k.w/2)*C.w,y+bh/2);c.rotate(k.a);c.translate(-(k.x+k.w/2)*C.w,-(y+bh/2));book(k.x,y,k.w,bh-2,k.c);c.restore();}
if(st.cur&&!st.dead){var cy=floor-(st.stack.length+1)*bh-bh*.6;book(st.cur.x,cy,st.cur.w,bh-2,st.cur.c);
c.strokeStyle='rgba(0,0,0,.18)';c.setLineDash([4,4]);c.beginPath();var tp=st.stack[st.stack.length-1];c.moveTo(tp.x*C.w,cy+bh);c.lineTo(tp.x*C.w,floor-st.stack.length*bh);c.moveTo((tp.x+tp.w)*C.w,cy+bh);c.lineTo((tp.x+tp.w)*C.w,floor-st.stack.length*bh);c.stroke();c.setLineDash([]);}
c.restore();
if(!go&&!fin){c.fillStyle='rgba(255,255,255,.88)';var tw=Math.min(C.w-20,300);K.rr(c,(C.w-tw)/2,C.h*.2,tw,44,22);c.fill();c.fillStyle='#2d3436';c.font='700 17px sans-serif';c.textAlign='center';c.textBaseline='middle';
c.fillText(host.pc?'Пробел или клик — уронить':'Нажми — учебник упадёт',C.w/2,C.h*.2+22);c.textBaseline='alphabetic';}}
function end(){if(fin)return;fin=true;var x={sc:st.n,st:tierOf(st.n),label:'Стопка: '+u(st.n)+(st.pf?' · ровно: '+st.pf:'')};if(REC&&REC.finish)REC.finish(host,x);else host.finish(x);}
st.api={bot:function(k){var m={};host.loop(function(){if(go&&!fin&&!st.dead&&botWant(st,k,m,Math.random))want=true;});},end:end};
f.say(K.pick(SAY.start,rnd),'happy');info();K.loop(host,draw);
host.intro({who:'vp',text:'Библиотеку переезжаем! Учебник ездит над стопкой — нажми, и он упадёт. Что свисает — отрежем. Ровно — «Отлично!», а три раза подряд — учебник пошире.',
hint:host.pc?'Пробел, Enter или клик — уронить учебник':'Нажимай на экран, когда учебник над стопкой',btn:'Начать'}).then(function(){go=true;});
}});
})();
