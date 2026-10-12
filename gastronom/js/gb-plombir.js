'use strict';
/* ================= PLOMBIR — кот Пломбир (поток ART, 10.10.2026) =================
   Наш кот из обстановки: предмет DECOR id 'cat' (index.html drawCat — рыжий, три тёмные полоски по спине, кремовые лапы и морда,
   розовый нос). Имя «Пломбир» — решение владельца 10.10 (id 'cat' в сохранениях НЕ меняется; тексты переименовывает TEXT).
   Облик берётся из drawCat (позу «спит» — тот же рисунок), остальные позы дорисованы в его цветах. Котов Дурака/Козла/Зины не копируем.
   ДОГОВОР (одна функция рисунка для зала, мини-игры «Кот у колбасы» MGC и помехи «кот-воришка» OBST):
     PLOMBIR.draw(g, cx, by, s, pose, tk, o) — холст; (cx, by) — середина низа, s — ширина (как у drawCat), tk — время в секундах
        pose: 'sleep' спит на прилавке (как drawCat: дышит, кончик хвоста подрагивает) · 'sit' сидит анфас (моргает, раз в ~11 с зевает)
              'sneak' крадётся влево, тянет лапу · 'grab' то же, с колбасой в зубах · 'scared' шуганули: шерсть дыбом, глаза круглые
        o: {mood:'norm'|'happy'|'sad'|'wow', hat:'witch'|'santa', dir:1 (смотрит вправо; по умолчанию влево для sneak/grab),
            still:1 — без движения}. При «спокойном режиме» игры (calm()) движения нет само.
     PLOMBIR.bust(g, mood) — портрет по пояс в координатах 200×220 (для GBP.bust('plombir')).
     PLOMBIR.H(pose) — высота рисунка в долях s (для раскладки). */
(function(){
var PI=Math.PI;
function E(g,x,y,rx,ry,f){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,PI*2);if(f){g.fillStyle=f;g.fill();}}
function P(g,pts,f){g.beginPath();g.moveTo(pts[0],pts[1]);for(var i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();if(f){g.fillStyle=f;g.fill();}}
function V(g,y0,y1,st){var gr=g.createLinearGradient(0,y0,0,y1);for(var i=0;i<st.length;i++)gr.addColorStop(i/(st.length-1),st[i]);return gr;}
// цвета — из drawCat
var C={a:'#f0a257',b:'#d97e36',c:'#b8652a',tail:'#c46b2b',str:'rgba(140,60,15,.55)',paw:'#f3c08a',muz:'#f7d2a6',ear:'#f5b7a8',nose:'#c0587a',lid:'#5a2e10',eye:'#9bc53d',eyeD:'#6e9a22'};
function still(o){if(o&&o.still)return true;try{return !!calm();}catch(e){return false;}}

/* --- спит (drawCat из index.html; + дыхание и кончик хвоста) --- */
function sleep(g,cx,by,s,t){var u=s/100,br=1+Math.sin(t*1.6)*.03,tw=Math.sin(t*.9)>.85?Math.sin(t*14)*3*u:0;
 E(g,cx,by,44*u,5*u,'rgba(40,20,5,.22)');
 g.strokeStyle=C.tail;g.lineWidth=9*u;g.lineCap='round';g.beginPath();g.moveTo(cx+36*u,by-8*u);g.quadraticCurveTo(cx+52*u,by+2*u+tw,cx+18*u,by-2*u+tw*.4);g.stroke();
 E(g,cx+4*u,by-17*u*br,40*u,18*u*br,V(g,by-35*u,by,[C.a,C.b,C.c]));
 g.strokeStyle=C.str;g.lineWidth=3.5*u;var d=[-4,10,24];for(var i=0;i<3;i++){var dx=d[i];g.beginPath();g.moveTo(cx+dx*u,by-34*u*br);g.quadraticCurveTo(cx+(dx+5)*u,by-24*u,cx+(dx+2)*u,by-16*u);g.stroke();}
 E(g,cx-18*u,by-3*u,9*u,4*u,C.paw);E(g,cx-2*u,by-3*u,9*u,4*u,C.paw);
 var hx=cx-32*u,hy=by-20*u;P(g,[hx-13*u,hy-6*u,hx-10*u,hy-24*u,hx-1*u,hy-12*u],C.b);P(g,[hx+1*u,hy-12*u,hx+10*u,hy-24*u,hx+13*u,hy-6*u],C.b);
 P(g,[hx-10*u,hy-9*u,hx-9*u,hy-19*u,hx-4*u,hy-12*u],C.ear);P(g,[hx+4*u,hy-12*u,hx+9*u,hy-19*u,hx+10*u,hy-9*u],C.ear);
 E(g,hx,hy,16*u,14*u,V(g,hy-14*u,hy+14*u,[C.a,C.b]));E(g,hx,hy+5*u,8*u,5*u,C.muz);
 g.strokeStyle=C.lid;g.lineWidth=1.8*u;for(var k=-1;k<=1;k+=2){g.beginPath();g.arc(hx+k*6*u,hy-1*u,3.5*u,.15*PI,.85*PI);g.stroke();}
 P(g,[hx-2*u,hy+3*u,hx+2*u,hy+3*u,hx,hy+5*u],C.nose);g.lineCap='butt';return hy;}

/* --- голова анфас (общая для sit/scared/sneak/bust): (hx,hy) — центр, u — масштаб, m — настроение, t — время --- */
function head(g,hx,hy,u,m,t,o){o=o||{};var yawn=o.yawn||0,bl=o.blink;
 var droop=m==='sad'?1:0,up=m==='wow'?1:0;
 // уши (грусть — в стороны, удивление — торчком)
 var ea=droop?.45:up?-.12:0;
 for(var k=-1;k<=1;k+=2){g.save();g.translate(hx+k*15*u,hy-14*u);g.rotate(k*ea);
  P(g,[k*-9*u,4*u,k*1*u,-20*u-up*3*u,k*10*u,2*u],C.b);P(g,[k*-5*u,1*u,k*1*u,-14*u-up*2*u,k*6*u,0],C.ear);g.restore();}
 // щёки-пух
 P(g,[hx-24*u,hy+2*u,hx-31*u,hy+8*u,hx-22*u,hy+10*u],C.b);P(g,[hx+24*u,hy+2*u,hx+31*u,hy+8*u,hx+22*u,hy+10*u],C.b);
 E(g,hx,hy,26*u,23*u,V(g,hy-23*u,hy+23*u,[C.a,C.b]));
 // полоски на лбу — как три полоски по спине у drawCat
 g.strokeStyle=C.str;g.lineWidth=3.2*u;g.lineCap='round';var d=[-7,0,7];for(var i=0;i<3;i++){g.beginPath();g.moveTo(hx+d[i]*u,hy-22*u);g.lineTo(hx+d[i]*.8*u,hy-(i===1?12:14)*u);g.stroke();}
 E(g,hx,hy+8*u,13*u,9*u,C.muz);E(g,hx,hy+14*u,7*u,4*u,'#fbe3c4');
 // глаза
 var ey=hy-2*u;g.lineCap='round';
 if(yawn>.3||bl||m==='happy'){g.strokeStyle=C.lid;g.lineWidth=2.2*u;for(var k2=-1;k2<=1;k2+=2){g.beginPath();
   if(m==='happy'&&!yawn)g.arc(hx+k2*10*u,ey+2*u,4.5*u,1.15*PI,1.85*PI);else g.arc(hx+k2*10*u,ey-1*u,4.5*u,.15*PI,.85*PI);g.stroke();}}
 else{var r=up?6.4:5.4,ry=m==='sad'?r*.62:r;
  for(var k3=-1;k3<=1;k3+=2){var ex=hx+k3*10*u;E(g,ex,ey,r*u,ry*u,'#fff8e8');E(g,ex,ey,(r-.8)*u,(ry-.8)*u,V(g,ey-ry*u,ey+ry*u,[C.eye,C.eyeD]));
   if(up)E(g,ex,ey,2.8*u,2.8*u,'#1d1408');else E(g,ex+(o.look||0)*1.6*u,ey,1.3*u,(ry-1.4)*u,'#1d1408');
   E(g,ex-1.6*u,ey-1.8*u,1.2*u,1.2*u,'#fff');
   if(m==='sad'){g.fillStyle=C.b;g.fillRect(ex-r*u-.5,ey-ry*u-2*u,2*r*u+1,ry*.75*u+2*u);}}}
 // нос и рот
 P(g,[hx-3.4*u,hy+4*u,hx+3.4*u,hy+4*u,hx,hy+7.4*u],C.nose);
 g.strokeStyle='#7a3b2e';g.lineWidth=1.5*u;
 if(yawn>.05){var oy=hy+12*u,orx=5*u+yawn*3*u,ory=2*u+yawn*7*u;E(g,hx,oy,orx,ory,'#7a2a30');E(g,hx,oy+ory*.45,orx*.6,ory*.45,'#e0707a');
  g.fillStyle='#fff';P(g,[hx-orx*.7,oy-ory*.6,hx-orx*.45,oy-ory*.15,hx-orx*.3,oy-ory*.7]);g.fill();P(g,[hx+orx*.7,oy-ory*.6,hx+orx*.45,oy-ory*.15,hx+orx*.3,oy-ory*.7]);g.fill();}
 else if(m==='wow'){E(g,hx,hy+12*u,2.6*u,3.2*u,'#7a2a30');}
 else{g.beginPath();g.moveTo(hx,hy+7.4*u);g.lineTo(hx,hy+9.5*u);g.moveTo(hx-5*u,hy+10*u);g.quadraticCurveTo(hx-2.4*u,hy+12.5*u,hx,hy+9.5*u);g.quadraticCurveTo(hx+2.4*u,hy+12.5*u,hx+5*u,hy+10*u);g.stroke();
  if(m==='sad'){g.beginPath();g.moveTo(hx-4*u,hy+13*u);g.quadraticCurveTo(hx,hy+11*u,hx+4*u,hy+13*u);g.stroke();}}
 // усы
 g.strokeStyle='rgba(255,250,240,.9)';g.lineWidth=1*u;for(var w=0;w<3;w++){var wy=hy+7*u+w*2.6*u;
  g.beginPath();g.moveTo(hx-9*u,wy);g.lineTo(hx-27*u,wy-4*u+w*4*u);g.moveTo(hx+9*u,wy);g.lineTo(hx+27*u,wy-4*u+w*4*u);g.stroke();}
 if(o.hat)hat(g,hx,hy,u,o.hat);}
function hat(g,hx,hy,u,k){
 if(k==='witch'){E(g,hx,hy-19*u,30*u,5*u,'#2b2235');P(g,[hx-15*u,hy-20*u,hx+15*u,hy-20*u,hx+9*u,hy-48*u,hx+18*u,hy-58*u,hx+2*u,hy-50*u],'#3a2e4a');
  g.fillStyle='#ef7d1a';g.fillRect(hx-15*u,hy-26*u,30*u,4.5*u);E(g,hx+4*u,hy-24*u,2.2*u,2.2*u,'#ffd34d');}
 else if(k==='santa'){P(g,[hx-20*u,hy-17*u,hx+20*u,hy-17*u,hx+26*u,hy-44*u],'#d22d2d');E(g,hx+27*u,hy-44*u,5*u,5*u,'#fff');
  g.fillStyle='#fff';g.beginPath();g.ellipse(hx,hy-17*u,22*u,5*u,0,0,PI*2);g.fill();}}

/* --- сидит анфас --- */
function sit(g,cx,by,s,t,m,o){var u=s/100,sc=o.scared?1:0,lift=sc?6*u:0;by-=lift;
 E(g,cx,by+lift,32*u,5*u,'rgba(40,20,5,.22)');
 // хвост справа, кончик ходит
 var tw=Math.sin(t*1.3)*5*u,tb=sc?14*u:9*u;g.strokeStyle=C.tail;g.lineCap='round';g.lineWidth=tb;
 g.beginPath();g.moveTo(cx+20*u,by-6*u);g.quadraticCurveTo(cx+46*u,by-10*u,cx+42*u,by-(sc?62:38)*u+tw);g.stroke();
 g.strokeStyle=C.str;g.lineWidth=3*u;for(var i=0;i<2;i++){var ty=by-(16+i*12)*u;g.beginPath();g.moveTo(cx+(38+i)*u-tb*.45,ty);g.lineTo(cx+(38+i)*u+tb*.45,ty-3*u);g.stroke();}
 // тело
 var bw=sc?35:30;E(g,cx,by-28*u,bw*u,30*u,V(g,by-58*u,by,[C.a,C.b,C.c]));
 g.strokeStyle=C.str;g.lineWidth=3.5*u;for(var k=-1;k<=1;k+=2){for(var j=0;j<2;j++){g.beginPath();g.moveTo(cx+k*(bw-3)*u,by-(36-j*12)*u);g.quadraticCurveTo(cx+k*(bw-10)*u,by-(32-j*12)*u,cx+k*(bw-13)*u,by-(26-j*12)*u);g.stroke();}}
 E(g,cx,by-26*u,15*u,21*u,C.muz);
 E(g,cx-10*u,by-3*u,8*u,5*u,C.paw);E(g,cx+10*u,by-3*u,8*u,5*u,C.paw);
 g.strokeStyle='rgba(150,90,40,.5)';g.lineWidth=1*u;for(var p=-1;p<=1;p+=2){g.beginPath();g.moveTo(cx+p*10*u-2*u,by-1*u);g.lineTo(cx+p*10*u-2*u,by-4*u);g.moveTo(cx+p*10*u+2*u,by-1*u);g.lineTo(cx+p*10*u+2*u,by-4*u);g.stroke();}
 if(sc){g.strokeStyle=C.b;g.lineWidth=2*u;for(var f=0;f<9;f++){var a=PI*(1.1+f*.1),r=bw*u;g.beginPath();g.moveTo(cx+Math.cos(a)*r,by-28*u+Math.sin(a)*30*u);g.lineTo(cx+Math.cos(a)*(r+5*u),by-28*u+Math.sin(a)*(35*u));g.stroke();}}
 // зевок раз в ~11 с, моргание
 var cyc=t%11,yawn=o.still?0:(cyc>8.6&&cyc<10.4?Math.sin((cyc-8.6)/1.8*PI):0),bl=!o.still&&((t+.7)%3.9)<.14;
 var hy=by-66*u+(sc?-4*u:0);head(g,cx,hy,u,sc?'wow':m,t,{yawn:yawn,blink:bl,hat:o.hat});return hy;}

/* --- крадётся (влево; dir=1 — вправо), grab — с колбасой --- */
function sneak(g,cx,by,s,t,m,o,grab){var u=s/100,dir=o.dir===1?-1:1;g.save();g.translate(cx,by);g.scale(dir,1);
 var st=o.still?0:Math.sin(t*4),pw=grab?0:(o.still?.5:(Math.sin(t*2.2)*.5+.5));
 E(g,0,0,44*u,5*u,'rgba(40,20,5,.22)');
 // хвост вверх, кончик дрожит
 var tw=Math.sin(t*6)*3*u;g.strokeStyle=C.tail;g.lineCap='round';g.lineWidth=8*u;
 g.beginPath();g.moveTo(32*u,-14*u);g.bezierCurveTo(52*u,-18*u,40*u,-46*u,54*u,-56*u+tw);g.stroke();
 // задние лапы
 E(g,26*u,-5*u,11*u,7*u,C.b);E(g,30*u,-2*u,8*u,3.5*u,C.paw);
 // тело низко
 E(g,8*u,-15*u+st*.6*u,36*u,13*u,V(g,-28*u,0,[C.a,C.b,C.c]));
 g.strokeStyle=C.str;g.lineWidth=3.5*u;var d=[2,14,26];for(var i=0;i<3;i++){g.beginPath();g.moveTo(d[i]*u,-27*u);g.quadraticCurveTo((d[i]+4)*u,-20*u,(d[i]+2)*u,-13*u);g.stroke();}
 // передние лапы: одна тянется
 E(g,-14*u,-2*u,8*u,3.5*u,C.paw);
 g.strokeStyle=C.b;g.lineWidth=7*u;g.beginPath();g.moveTo(-18*u,-12*u);g.lineTo(-30*u-pw*14*u,-6*u-pw*6*u);g.stroke();E(g,-31*u-pw*14*u,-5*u-pw*6*u,5*u,3.5*u,C.paw);
 // голова (поворот на три четверти — та же голова анфас, чуть меньше, глаза к добыче)
 var hx=-30*u,hy=-26*u+st*u;g.save();g.translate(hx,hy);g.scale(dir,1);head(g,0,0,u*.72,m,t,{look:-dir,hat:o.hat});g.restore();
 if(grab){g.save();g.translate(hx-2*u,hy+11*u);g.rotate(-.18);
  var lw=34*u,lh=9*u;g.beginPath();g.moveTo(-lw/2+lh/2,-lh/2);g.lineTo(lw/2-lh/2,-lh/2);g.arc(lw/2-lh/2,0,lh/2,-PI/2,PI/2);g.lineTo(-lw/2+lh/2,lh/2);g.arc(-lw/2+lh/2,0,lh/2,PI/2,PI*1.5);g.closePath();
  g.fillStyle=V(g,-lh/2,lh/2,['#f4a3a8','#e07f88','#c9636e']);g.fill();
  g.fillStyle='rgba(255,255,255,.55)';for(var q=-2;q<=2;q++)E(g,q*6*u,-1*u,1*u,.8*u);
  g.strokeStyle='#8a5a2a';g.lineWidth=1.4*u;g.beginPath();g.moveTo(lw/2-1*u,-1*u);g.lineTo(lw/2+4*u,-5*u);g.moveTo(-lw/2+1*u,-1*u);g.lineTo(-lw/2-4*u,-5*u);g.stroke();g.restore();}
 g.restore();}

function draw(g,cx,by,s,pose,tk,o){o=o||{};var t=still(o)?0:(tk||0);if(still(o))o.still=1;var m=o.mood||'norm';g.save();g.lineJoin='round';
 try{if(pose==='sit')sit(g,cx,by,s,t,m,o);else if(pose==='scared'){o.scared=1;sit(g,cx,by,s,t,'wow',o);}
  else if(pose==='sneak')sneak(g,cx,by,s,t,m,o,false);else if(pose==='grab')sneak(g,cx,by,s,t,m,o,true);
  else sleep(g,cx,by,s,t);}finally{g.restore();}}
function bust(g,m){draw(g,100,236,190,'sit',0,{mood:m||'norm',still:1});}
function H(pose){return pose==='sit'||pose==='scared'?1.0:pose==='sleep'?.4:.45;}
window.PLOMBIR={v:1,draw:draw,bust:bust,H:H};
})();
