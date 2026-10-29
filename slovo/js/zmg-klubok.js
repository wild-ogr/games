'use strict';
(function(){
if(typeof ZMG_REG!=='function')return;
var KLUB_ON=true;if(!KLUB_ON||(window.ZB2&&ZB2.off('klubok')))return;
if(window.ZB2)ZB2.reg('klubok',{t:'Мини-игра «Клубок Яти»',who:'LOV'});
var ID='klubok',CUT=[10,22,34],GW=9,GH=11,LIVES=3,AL='АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ';
var SPARE=['КОТ','ДОМ','СОК','ЧАЙ','МЕЛ','ЛУК','РЫБА','ЛАПА','НОРА','КАША','ШАРФ','МЯЧ','ЛИСТ','ПЕНАЛ','ТЕТРАДЬ','КЛУБОК','НИТКА','ПАРТА'];
var DX={L:[-1,0],R:[1,0],U:[0,-1],D:[0,1]},OPP={L:'R',R:'L',U:'D',D:'U'};
function tierOf(s){return s>=CUT[2]?3:s>=CUT[1]?2:s>=CUT[0]?1:0;}
function init(rnd,words){var st={body:[[4,8],[4,9]],dir:'U',nd:'U',t:0,acc:0,n:0,lives:LIVES,dead:false,rnd:rnd,words:words,wi:0,w:'',k:0,lt:[],ev:'',grow:0,why:''};newWord(st);return st;}
function free(st,x,y){if(st.body.some(function(b){return b[0]===x&&b[1]===y;}))return false;if(st.lt.some(function(l){return l.x===x&&l.y===y;}))return false;return true;}
function place(st,ch,good){for(var i=0;i<60;i++){var x=Math.floor(st.rnd()*GW),y=Math.floor(st.rnd()*GH),h=st.body[0];if(Math.abs(x-h[0])+Math.abs(y-h[1])<3)continue;if(free(st,x,y)){st.lt.push({x:x,y:y,c:ch,good:good});return;}}}
function newWord(st){st.w=st.words[st.wi++%st.words.length];st.k=0;st.lt=[];placeNext(st);}
function placeNext(st){st.lt=st.lt.filter(function(l){return false;});var need=st.w.charAt(st.k);place(st,need,true);var n=Math.min(3,1+Math.floor(st.n/6));
for(var i=0;i<n;i++){var ch;do ch=AL.charAt(Math.floor(st.rnd()*AL.length));while(ch===need);place(st,ch,false);}}
function spd(st){return Math.min(7.5,3.2+.12*st.n);}
function turn(st,d){if(d&&d!==OPP[st.dir])st.nd=d;}
function step(st,dt){st.ev='';if(st.dead)return;st.t+=dt;st.acc+=dt*spd(st);if(st.acc<1)return;st.acc-=1;
st.dir=st.nd;var h=st.body[0],x=h[0]+DX[st.dir][0],y=h[1]+DX[st.dir][1];
if(x<0||y<0||x>=GW||y>=GH||st.body.slice(0,st.body.length-(st.grow?0:1)).some(function(b){return b[0]===x&&b[1]===y;})){st.dead=true;st.ev='dead';st.why=x<0||y<0||x>=GW||y>=GH?'wall':'self';return;}
st.body.unshift([x,y]);var hit=null;st.lt.forEach(function(l,i){if(l.x===x&&l.y===y)hit=i;});
if(hit!=null){var l=st.lt[hit];st.lt.splice(hit,1);if(l.good){st.n++;st.k++;st.grow++;st.ev='ok';if(st.k>=st.w.length){st.ev='word';newWord(st);}else placeNext(st);}
else{st.lives--;st.ev='bad';if(st.lives<=0){st.dead=true;st.ev='dead';st.why='tangle';}}}
if(st.grow>0)st.grow--;else st.body.pop();}
function revive(st){st.dead=false;st.lives=LIVES;var h=st.body[0];st.body=[[Math.max(1,Math.min(GW-2,h[0])),Math.max(1,Math.min(GH-2,h[1]))]];st.body.push([st.body[0][0],Math.min(GH-1,st.body[0][1]+1)]);st.dir=st.nd='U';st.lt=[];placeNext(st);}
function bfs(st,tx,ty){var h=st.body[0],seen={},q=[[h[0],h[1],null]],block={};st.body.forEach(function(b,i){if(i<st.body.length-1)block[b[0]+','+b[1]]=1;});st.lt.forEach(function(l){if(!l.good)block[l.x+','+l.y]=1;});
seen[h[0]+','+h[1]]=1;while(q.length){var c=q.shift();if(c[0]===tx&&c[1]===ty)return c[2];for(var d in DX){if(!c[2]&&d===OPP[st.dir])continue;var x=c[0]+DX[d][0],y=c[1]+DX[d][1],k=x+','+y;
if(x<0||y<0||x>=GW||y>=GH||seen[k]||block[k])continue;seen[k]=1;q.push([x,y,c[2]||d]);}}return null;}
function botDir(st,k,rnd){var g=null;st.lt.forEach(function(l){if(l.good)g=l;});if(!g)return null;var d=bfs(st,g.x,g.y);if(!d){var h=st.body[0];for(var e in DX){if(e===OPP[st.dir])continue;var x=h[0]+DX[e][0],y=h[1]+DX[e][1];if(x>=0&&y>=0&&x<GW&&y<GH&&free(st,x,y)){d=e;break;}}}
if(rnd()<.13*(1-k)*(1-k)+.006){var ks=Object.keys(DX);d=ks[Math.floor(rnd()*4)];}return d;}
function sim(o,k){var rnd=o.rnd||Math.random,st=init(rnd,SPARE.slice().sort(function(){return rnd()-.5;})),n=0,last=-1;while(!st.dead&&n<60*120){n++;if(st.body[0][0]*99+st.body[0][1]!==last){last=st.body[0][0]*99+st.body[0][1];turn(st,botDir(st,k,rnd));}step(st,1/60);}return{sc:st.n,st:tierOf(st.n)};}
var WHY={wall:'Ять упёрся в стену!',self:'Запутался в своей нитке!',tangle:'Три раза не та буква — клубок запутался!'};
ZMG_REG({a:'Веди кота по буквам слова по порядку — в стену и в нитку не врезаться',ns:'Ять нашёл клубок и теперь пишет нитками слова. Помоги ему не запутаться.',id:ID,finWho:'yat',deps:['js/zmg-lkit.js','js/zmg-rec-ui.js'],sim:sim,
lines:{good:'Мур! Вот это нитка — через всю квартиру!',ok:'Хорошо поиграли! Мур.',bad:'Мяу… Запутался. Ещё разок?'},
run:function(host,o){var K=window.ZLK,REC=window.ZMGREC,rnd=o.rnd||Math.random,calm=K.calm(host);
var L=[];try{L=(host.words({min:3,max:6})||[]).filter(function(w){return/^[а-яё]+$/.test(w)&&!/[ъыь]/.test(w.charAt(0));}).slice(0,30).map(function(w){return w.toUpperCase().replace(/Ё/g,'Е');});}catch(e){}
if(L.length<6)L=L.concat(SPARE.slice().sort(function(){return rnd()-.5;}));
var f=K.frame(host,{who:'yat'}),C=K.canvas(f.main),c=C.ctx,st=init(rnd,L),fin=false,go=false,asked=false,deadT=0,catI=null,sx=null,sy=null;
window.__zl_klubok=st;
try{if(typeof catSVG==='function'){var im=new Image();im.onload=function(){catI=im;};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(catSVG());}}catch(e){}
function u(n){return n+' '+(typeof plural==='function'?plural(n,'буква','буквы','букв'):'букв');}
function info(){var w='';for(var i=0;i<st.w.length;i++)w+='<b style="'+(i<st.k?'color:#2b8a3e':i===st.k?'text-decoration:underline':'opacity:.55')+'">'+st.w.charAt(i)+'</b>';
var b=REC&&REC.best?REC.best(ID):0;f.info('<span style="letter-spacing:.12em;font-size:17px">'+w+'</span><span>🧶 '+st.n+'</span><span>'+'❤'.repeat(Math.max(0,st.lives))+'</span><span>Рекорд: '+b+'</span>');host.top('Нитка: '+st.n);}
function geo(){var W=C.w,H=C.h,cs=Math.floor(Math.min((W-12)/GW,(H-12)/GH));return{cs:cs,x:Math.floor((W-cs*GW)/2),y:Math.floor((H-cs*GH)/2),W:W,H:H};}
host.ptr(f.main,{down:function(x,y){sx=x;sy=y;},up:function(x,y){if(sx==null||!go||fin)return;var dx=x-sx,dy=y-sy;sx=null;
if(Math.hypot(dx,dy)>18){turn(st,Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U'));return;}
var g=geo(),h=st.body[0],hx=g.x+(h[0]+.5)*g.cs,hy=g.y+(h[1]+.5)*g.cs,ex=x-hx,ey=y-hy;
if(st.dir==='U'||st.dir==='D')turn(st,ex>0?'R':'L');else turn(st,ey>0?'D':'U');}});
host.keys(function(k){var d=K.dir(k);if(d){if(go&&!fin)turn(st,d);return true;}return false;});
function draw(dt){C.fit();var g=geo(),cs=g.cs;
if(!fin&&go){step(st,dt);if(st.ev==='ok'){K.snd(host,'tap');info();if(st.n===(REC.best(ID)|0)+1&&REC.best(ID)>0)K.pop(host,f.main,'Рекорд!','big');}
else if(st.ev==='word'){K.snd(host,'coin');K.pop(host,f.main,'Слово!');f.say('Мур! Новое слово — '+st.w+'.','happy');info();}
else if(st.ev==='bad'){K.snd(host,'bad');K.buzz('bad');f.say('Не та буква! Нитка путается…','sad');info();}
else if(st.ev==='dead'){K.snd(host,'bad');K.buzz('bad');f.say(WHY[st.why],'sad');deadT=0;info();}}
if(st.dead&&!fin){deadT+=dt;if(deadT>.9&&!asked){asked=true;K.cont(host,f.main,{text:WHY[st.why]+'<br>Нитка — '+u(st.n)+'. Продолжить?',onYes:function(){asked=false;revive(st);info();f.say('Распутал! Тянем дальше.','happy');},onNo:end});}}
c.fillStyle='#f4e6cf';c.fillRect(0,0,g.W,g.H);for(var y=0;y<GH;y++)for(var x=0;x<GW;x++){c.fillStyle=(x+y)%2?'#e6d0ad':'#ecd9ba';c.fillRect(g.x+x*cs,g.y+y*cs,cs,cs);}
c.strokeStyle='#8a5a2b';c.lineWidth=4;c.strokeRect(g.x-2,g.y-2,cs*GW+4,cs*GH+4);
st.lt.forEach(function(l){var px=g.x+l.x*cs,py=g.y+l.y*cs;c.fillStyle=l.good?'#fff':'#fff8e8';K.rr(c,px+3,py+3,cs-6,cs-6,6);c.fill();c.strokeStyle=l.good?'#2b8a3e':'#c9b48f';c.lineWidth=2;c.stroke();
c.fillStyle='#1f3350';c.font='800 '+Math.round(cs*.55)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(l.c,px+cs/2,py+cs/2+1);});
var B=st.body,fr=Math.min(1,st.acc);c.strokeStyle='#c2255c';c.lineWidth=Math.max(3,cs*.18);c.lineCap='round';c.lineJoin='round';c.beginPath();
for(var i=B.length-1;i>=0;i--){var px2=g.x+(B[i][0]+.5)*cs,py2=g.y+(B[i][1]+.5)*cs;if(i===B.length-1)c.moveTo(px2,py2);else c.lineTo(px2,py2);}c.stroke();
var h=B[0],hx=g.x+(h[0]+.5)*cs,hy=g.y+(h[1]+.5)*cs;void fr;
c.fillStyle='#c2255c';c.beginPath();c.arc(g.x+(B[B.length-1][0]+.5)*cs,g.y+(B[B.length-1][1]+.5)*cs,cs*.32,0,7);c.fill();
if(catI)c.drawImage(catI,hx-cs*.7,hy-cs*.75,cs*1.4,cs*1.4);else{c.fillStyle='#f08c00';c.beginPath();c.arc(hx,hy,cs*.45,0,7);c.fill();}
c.textAlign='left';c.textBaseline='alphabetic';
if(!go&&!fin){c.fillStyle='rgba(255,255,255,.9)';var tw=Math.min(g.W-20,330);K.rr(c,(g.W-tw)/2,g.H-58,tw,44,22);c.fill();c.fillStyle='#2d3436';c.font='700 15px sans-serif';c.textAlign='center';c.textBaseline='middle';
c.fillText(host.pc?'Стрелки — куда идёт Ять':'Свайп или нажатие сбоку — поворот',g.W/2,g.H-36);c.textAlign='left';c.textBaseline='alphabetic';}}
function end(){if(fin)return;fin=true;var x={sc:st.n,st:tierOf(st.n),label:'Нитка — '+u(st.n)+(st.why?'. '+WHY[st.why]:'')};if(REC&&REC.finish)REC.finish(host,x);else host.finish(x);}
st.api={bot:function(k){var last=-1;host.loop(function(){if(go&&!fin&&!st.dead){var h=st.body[0],key=h[0]*99+h[1]+st.k*1e4;if(key!==last){last=key;turn(st,botDir(st,k,Math.random));}}});},end:end};
f.say('Мяу! Тяни нитку по буквам — по порядку. Сначала «'+st.w.charAt(0)+'».','happy');info();K.loop(host,draw);
host.intro({who:'yat',text:'Мур! Я нашёл клубок. Веди меня по буквам слова по порядку — нитка тянется следом. В стену и в нитку не врезаться, чужие буквы не трогать!',
hint:host.pc?'Стрелки — повороты':'Свайп в нужную сторону или нажатие слева/справа от Ятя',btn:'Мур!'}).then(function(){go=true;});
}});
})();
