/* K1: «Двор мечты» в виде Г «Летний двор» (03.10). Грузится после js/look.js.
   55 вещей DREAM (данные — поток K2, index.html) нарисованы canvas 2D — мармеладные цвета, мягкие тени, блики; без эмодзи.
   LK.dreamDraw(g,W,H) — стоящие (S.yd[id]===1) и строящиеся (S.yb[id]: ограждение с лентой) вещи на прозрачном холсте W×H
     поверх фона yardG (1200×800, cover, низ-центр). Возвращает число нарисованного.
   LK.dreamUrl(tod?) → 'url("data:image/png…")' слоя 1200×800 или '' (вещей нет / нет DREAM и S); кэш по набору id+состояние(+tod: 'night' — вещи темнее, 'eve' — теплее; без tod — дневные).
   Координаты K2 (фон 400×700, низ-центр вещи) → 1200×800: x'=600+(x−200)·k, y'=800−(700−y)·k, k=1,143;
   вещам, которым на новом фоне нужно своё место (балконы, крыши, яблоня, верёвки через двор), — таблица POS. Размеры — SZ. */
(function(){
'use strict';
var Wn=window,K=1.143,g=null;
function hex2(h){var n=parseInt(h.slice(1),16);return [n>>16,n>>8&255,n&255];}
function mx(h,k){var c=hex2(h);function f(v){return Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));}return '#'+c.map(function(v){return ('0'+f(v).toString(16)).slice(-2);}).join('');}
function ra(h,a){var c=hex2(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
function rrp(x,y,w,h,r){r=Math.max(0,Math.min(r,Math.abs(w)/2,Math.abs(h)/2));g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
/* мармеладная заливка: светлый верх → цвет → чуть темнее низ */
function lg(y0,y1,c,a,b){var gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,mx(c,a==null?.38:a));gr.addColorStop(.55,c);gr.addColorStop(1,mx(c,b==null?-.14:b));return gr;}
function box(x,y,w,h,r,c,gl){rrp(x,y,w,h,r);g.fillStyle=lg(y,y+h,c);g.fill();if(gl!==0&&h>2.5&&w>3){g.fillStyle='rgba(255,255,255,'+(gl||.45)+')';rrp(x+w*.12,y+h*.12,w*.76,Math.max(.8,h*.22),h*.11);g.fill();}}
function ball(x,y,r,c,gl){var gr=g.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r*1.05);gr.addColorStop(0,mx(c,.5));gr.addColorStop(.55,c);gr.addColorStop(1,mx(c,-.2));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();
  if(gl!==0){g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(x-r*.35,y-r*.42,r*.3,r*.17,-.6,0,7);g.fill();}}
function ell(x,y,rx,ry,c,a){g.fillStyle=a==null?c:ra(c,a);g.beginPath();g.ellipse(x,y,Math.abs(rx),Math.abs(ry),0,0,7);g.fill();}
function ln(p,w,c){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.stroke();}
function poly(p,fill){g.beginPath();g.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();g.fillStyle=fill;g.fill();}
function leafy(x,y,r,dark){var gr=g.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);gr.addColorStop(0,dark?'#9fdc6a':'#b8ec7a');gr.addColorStop(.5,dark?'#4fab48':'#6cc34f');gr.addColorStop(1,dark?'#237338':'#2f8a43');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();}
function flower(x,y,r,c,ctr){g.fillStyle=c;for(var i=0;i<5;i++){var a=i*1.2566;g.beginPath();g.ellipse(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55,r*.48,r*.3,a,0,7);g.fill();}g.fillStyle=ctr||'#ffc21a';g.beginPath();g.arc(x,y,r*.32,0,7);g.fill();}
function stem(x,y0,y1,w){ln([x,y0,x,y1],w||1.4,'#3f9a3c');}
function wheel(x,y,r){ball(x,y,r,'#3a4250',0);g.fillStyle='#dfe6ee';g.beginPath();g.arc(x,y,r*.5,0,7);g.fill();g.fillStyle='#9aa7b6';g.beginPath();g.arc(x,y,r*.22,0,7);g.fill();}
var WOOD='#c98a52',WOODD='#8a5a34',IRON='#4f5d6e',CR='#ff4f6a',OR='#ff9a2e',YE='#ffc21a',GR='#7cc93f',TE='#22bfae',BL='#3f86ff',VI='#9b5de5',PI='#ff6fae';

/* ---- рисунки: начало координат — низ-центр вещи, «размер» ~40 единиц (масштаб — SZ) ---- */
var D={
bench:function(){box(-19,-13,3,13,1,IRON,0);box(16,-13,3,13,1,IRON,0);box(-17,-26,2.5,14,1,IRON,0);box(14.5,-26,2.5,14,1,IRON,0);
  box(-22,-15,44,5,2,OR);box(-21,-27,42,4.5,2,OR);box(-21,-21.5,42,4.5,2,OR);},
urn:function(){poly([-7,-20,7,-20,5.5,0,-5.5,0],lg(-20,0,TE));box(-8,-22,16,3.5,1.5,mx(TE,-.2));g.fillStyle='rgba(255,255,255,.4)';rrp(-4.5,-17,2.5,14,1.2);g.fill();},
lamp:function(){box(-1.6,-40,3.2,40,1.5,IRON,0);box(-4,-4,8,4,1.5,IRON,0);ln([0,-39,5,-42,10,-41],2,IRON);
  var gr=g.createRadialGradient(10,-36,0,10,-36,10);gr.addColorStop(0,'rgba(255,240,170,.85)');gr.addColorStop(1,'rgba(255,220,120,0)');g.fillStyle=gr;g.beginPath();g.arc(10,-36,10,0,7);g.fill();
  poly([5.5,-41,14.5,-41,12.5,-37.5,7.5,-37.5],lg(-41,-37,'#3a4a5a'));ball(10,-36.5,2.4,'#fff1b0',0);},
cat:function(){ln([8,-3,14,-6,13,-13],3.2,'#f08a2c');
  g.fillStyle=lg(-16,0,'#ff9f43');g.beginPath();g.ellipse(0,-8,10,8,0,0,7);g.fill();
  g.fillStyle=lg(-26,-10,'#ffa94d');g.beginPath();g.arc(-6,-17,7,0,7);g.fill();
  poly([-12,-20,-11.5,-27,-7,-22],'#ff9f43');poly([-4.5,-23,-0.5,-27,-0.5,-19],'#ff9f43');poly([-11,-21.5,-10.8,-25,-8.5,-22.5],'#ffc9c9');
  ln([-9,-17,-8,-16.2,-7,-17],1,'#4a3020');ln([-5,-17,-4,-16.2,-3,-17],1,'#4a3020');g.fillStyle='#e8590c';g.beginPath();g.arc(-6,-15,.9,0,7);g.fill();
  ln([2,-10,5,-12],1.4,'#e07a1c');ln([-1,-5,3,-7],1.4,'#e07a1c');ell(-1,-1,5,1.8,'#ffffff',.6);},
balc:function(){for(var i=0;i<4;i++){var x=-9+i*6,xx=x+(i%2?1:-1);ln([x,-5,xx,-10],1.2,'#3f9a3c');ball(xx,-11.5,3,[CR,OR,PI,CR][i],0);g.fillStyle='#fff3b0';g.beginPath();g.arc(xx,-11.5,.9,0,7);g.fill();}
  ell(-6,-6,4,2.5,'#4fab48');ell(5,-6,4,2.5,'#4fab48');box(-13,-6,26,6,2,'#c8643c');},
sand:function(){poly([-20,0,20,0,15,-11,-15,-11],lg(-11,0,WOOD));poly([-16.5,-2.5,16.5,-2.5,13,-9.5,-13,-9.5],lg(-10,-2,'#ffd77a',.3,-.05));
  ell(4,-6,5,2,'#f2bf5e');box(-12,-12,3,3,1,WOODD,0);box(9,-12,3,3,1,WOODD,0);
  poly([-9,-13,-4,-13,-4.8,-7.5,-8.2,-7.5],lg(-13,-7,CR));ln([-9,-13,-6.5,-16,-4,-13],.8,'#c92a3a');ln([7,-12,11,-17],1.4,BL);poly([10,-18,13.5,-20,12.5,-15.5],BL);},
swing:function(){ln([-19,0,-13,-38],3.5,OR);ln([-7,0,-13,-38],3.5,OR);ln([19,0,13,-38],3.5,OR);ln([7,0,13,-38],3.5,OR);box(-16,-40.5,32,3.5,1.6,CR);
  ln([-5,-37,-5,-12],.9,'#7d8b8a');ln([5,-37,5,-12],.9,'#7d8b8a');box(-7,-13,14,3,1.3,YE);},
slide:function(){ln([-16,0,-16,-30],2.6,BL);ln([-8,0,-8,-30],2.6,BL);for(var i=0;i<5;i++)ln([-16,-5-i*5.5,-8,-5-i*5.5],1.6,mx(BL,.3));
  box(-17,-31,12,3,1.2,YE);g.beginPath();g.moveTo(-7,-31);g.bezierCurveTo(4,-30,6,-6,20,-3);g.lineTo(20,0);g.lineTo(16,0);g.bezierCurveTo(4,-4,0,-24,-7,-26);g.closePath();g.fillStyle=lg(-31,0,CR);g.fill();
  ln([-6,-29.5,1,-27,5,-17,10,-7,18,-3],1,'rgba(255,255,255,.6)');ln([-19,-30,-19,-37,-5,-37,-5,-30],1.4,BL);},
carou:function(){ln([0,-6,0,-30],2.2,IRON);ell(0,-4,19,5.5,'#5a4a3a');g.fillStyle=lg(-10,-2,'#ffd23a');g.beginPath();g.ellipse(0,-6,19,5.5,0,0,7);g.fill();
  [CR,BL,GR,VI].forEach(function(c,i){var x=-13+i*8.6;ln([x,-8,x,-18],1.3,'#e9ecef');box(x-2.5,-14,5,5,1.5,c,0);});
  for(var i=0;i<6;i++){g.beginPath();g.moveTo(0,-38);g.lineTo(-20+i*6.67,-27);g.lineTo(-20+(i+1)*6.67,-27);g.closePath();g.fillStyle=i%2?'#fff':CR;g.fill();}
  g.beginPath();g.ellipse(0,-27,20,3,0,0,Math.PI);g.fillStyle=CR;g.fill();ball(0,-38.5,1.8,YE,0);},
rocket:function(){poly([-8,0,-6,-9,-12,-4,-12,0],lg(-9,0,CR));poly([8,0,6,-9,12,-4,12,0],lg(-9,0,CR));
  for(var i=0;i<6;i++)ln([-6.5,-3-i*5,6.5,-3-i*5],1.1,'#adb5bd');ln([-6.5,0,-6.5,-30],1.8,'#e9ecef');ln([6.5,0,6.5,-30],1.8,'#e9ecef');
  box(-7,-31,14,3,1,BL,0);g.beginPath();g.moveTo(-7,-31);g.quadraticCurveTo(-6,-40,0,-46);g.quadraticCurveTo(6,-40,7,-31);g.closePath();g.fillStyle=lg(-46,-31,CR);g.fill();
  ball(0,-35,2.6,'#a5d8ff');g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.ellipse(-2.5,-38,1,4,-.3,0,7);g.fill();},
daisy:function(){ell(0,-1.5,9,3,'#4fab48');for(var i=0;i<5;i++){var x=-7+i*3.5,y=-6-(i%2)*3.5;stem(x,-2,y);flower(x,y,3.2,'#fff');}},
tulip:function(){ell(0,-1.5,8,2.8,'#4fab48');var cs=[CR,YE,PI,OR];for(var i=0;i<4;i++){var x=-6+i*4,y=-9-(i%2)*3;stem(x,-2,y);g.beginPath();g.ellipse(x-1.8,y+5,1.2,3.5,-.4,0,7);g.fillStyle='#4fab48';g.fill();
  g.beginPath();g.moveTo(x-2.3,y-3.5);g.lineTo(x-1.1,y-1.8);g.lineTo(x,y-3.6);g.lineTo(x+1.1,y-1.8);g.lineTo(x+2.3,y-3.5);g.quadraticCurveTo(x+2.4,y+.6,x,y+.6);g.quadraticCurveTo(x-2.4,y+.6,x-2.3,y-3.5);g.fillStyle=lg(y-4,y+1,cs[i]);g.fill();}},
rose:function(){leafy(0,-6,7,1);leafy(-5,-4,4.5,1);leafy(5,-4,4.5,1);[[-3,-8],[3,-9],[0,-4],[-6,-4],[5.5,-4.5]].forEach(function(p){ball(p[0],p[1],2.2,'#e8344e');ln([p[0]-1,p[1]-.3,p[0]+.4,p[1]+.6,p[0]+1,p[1]-.5],.6,'#a5162e');});},
fence:function(){for(var i=0;i<11;i++){var x=-19.5+i*3.9;poly([x-1.3,0,x+1.3,0,x+1.3,-8,x,-10,x-1.3,-8],lg(-10,0,'#fdfdfd',.2,-.12));}
  box(-20,-7,40,1.4,.6,'#e3e8ee',0);box(-20,-3.6,40,1.4,.6,'#e3e8ee',0);},
sunfl:function(){ln([0,0,0,-32],1.8,'#3f9a3c');ell(-3.5,-14,4,1.8,'#4fab48');ell(3.5,-21,4,1.8,'#4fab48');
  g.fillStyle=YE;for(var i=0;i<12;i++){var a=i*.5236;g.beginPath();g.ellipse(Math.cos(a)*5.2,-34+Math.sin(a)*5.2,3.2,1.5,a,0,7);g.fill();}ball(0,-34,3.6,'#7a4a22',0);g.fillStyle='rgba(255,220,150,.35)';g.beginPath();g.arc(-1,-35,1.4,0,7);g.fill();},
garage:function(){g.beginPath();g.moveTo(-20,0);g.lineTo(-20,-9);g.bezierCurveTo(-18,-22,18,-22,20,-9);g.lineTo(20,0);g.closePath();g.fillStyle=lg(-22,0,'#9fb3c8',.35,-.2);g.fill();
  g.save();g.clip();for(var i=-18;i<=18;i+=3)ln([i,0,i*.92,-20],.7,'rgba(255,255,255,.35)');g.restore();
  g.beginPath();g.moveTo(-11,0);g.lineTo(-11,-9);g.quadraticCurveTo(0,-15,11,-9);g.lineTo(11,0);g.closePath();g.fillStyle=lg(-15,0,'#5f7387');g.fill();
  ln([-11,-5,11,-5],.5,'rgba(255,255,255,.25)');box(-1.2,-4,2.4,1.2,.5,'#ced4da',0);g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(-9,-14,6,1.6,-.35,0,7);g.fill();},
car:function(){g.beginPath();g.moveTo(-20,-4);g.lineTo(-20,-9);g.quadraticCurveTo(-19,-11,-15,-11);g.lineTo(-10,-11);g.lineTo(-6,-18);g.lineTo(7,-18);g.lineTo(11,-11);g.lineTo(18,-11);g.quadraticCurveTo(20,-10,20,-7);g.lineTo(20,-4);g.closePath();g.fillStyle=lg(-18,-4,'#4dabf7');g.fill();
  poly([-8.5,-11.5,-5.3,-16.8,0,-16.8,0,-11.5],'#e7f5ff');poly([1.2,-11.5,1.2,-16.8,6.3,-16.8,9.4,-11.5],'#e7f5ff');ln([-19,-8,19,-8],.8,'#e9ecef');
  box(-21,-5.5,6,2,.8,'#dee2e6',0);box(15,-5.5,6,2,.8,'#dee2e6',0);ball(18.5,-9,1.2,'#fff3b0',0);wheel(-11,-3,3.6);wheel(11,-3,3.6);},
tools:function(){box(-14,-14,28,3,1,WOOD);box(-13,-11,2.5,11,.8,WOODD,0);box(10.5,-11,2.5,11,.8,WOODD,0);box(-13,-5,26,1.5,.6,WOODD,0);
  box(-11,-18.5,7,4.5,1,'#5f7387',0);box(-9,-21,3,2.5,.6,'#5f7387',0);ln([-4,-16.5,-1,-16.5],1,'#adb5bd');
  ln([2,-14.5,9,-18],1.4,'#868e96');box(8,-20,3.6,3,1,CR,0);box(1,-16,7,2,1,YE,0);ball(-8,-3,2.2,BL,0);box(4,-4.2,7,4.2,1,OR,0);},
tyres:function(){[[-6,-3.2,'#ffffff'],[6,-3.2,YE],[0,-9.6,CR]].forEach(function(p){ell(p[0],p[1],6.5,3.6,'#2f3540');g.fillStyle=lg(p[1]-3.6,p[1]+3.6,p[2]);g.beginPath();g.ellipse(p[0],p[1]-.6,6.5,2.9,0,0,7);g.fill();ell(p[0],p[1]-1,4,1.6,'#6e4a33');});
  [[-6,-5,PI],[6,-5,'#ffffff'],[0,-11,OR],[-2,-12.5,PI],[2.5,-12,CR]].forEach(function(p){flower(p[0],p[1]-1,1.8,p[2],YE);});leafy(-8,-4.5,1.4,1);leafy(8,-4.5,1.4,1);},
moto:function(){g.fillStyle=lg(-12,-3,'#2f9e44');g.beginPath();g.ellipse(9,-7,10,5,0,0,7);g.fill();box(1,-14,16,3,1.5,'#2f9e44');ball(14,-14,2,'#e9ecef');
  wheel(10,-3,3);ln([-16,-3,-10,-12,-2,-12,4,-3],2.6,'#2b8a3e');box(-12,-15,7,2.4,1,'#343a40',0);ln([-6,-16,-2,-19,1,-19],1.4,'#adb5bd');
  ln([-10,-12,-17,-12],1.2,'#adb5bd');ball(-3.5,-14,1.4,'#fff3b0',0);wheel(-16,-3,3.4);wheel(4,-3,3.4);},
hbar:function(){box(-19,-38,3.4,38,1.5,BL,0);box(15.6,-38,3.4,38,1.5,BL,0);ln([-17,-34,17,-34],1.8,'#adb5bd');ball(-17.3,-38.5,2,YE,0);ball(17.3,-38.5,2,YE,0);},
goal:function(){g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=.6;for(var i=-18;i<=18;i+=3){g.beginPath();g.moveTo(i,-1);g.lineTo(i*.8,-21);g.stroke();}for(var j=2;j<=22;j+=3){g.beginPath();g.moveTo(-18,-j);g.lineTo(18,-j);g.stroke();}
  ln([-19,0,-19,-24,19,-24,19,0],2.4,'#fff');ln([-19,-24,-15,-21,15,-21,19,-24],1,'#dee2e6');ball(9,-3,3,'#ffffff');ln([7.5,-4.5,9,-3,10.6,-4.3],.7,'#343a40');},
pong:function(){box(-14,-10,2,10,.8,IRON,0);box(12,-10,2,10,.8,IRON,0);poly([-20,-10,20,-10,16,-16,-16,-16],lg(-16,-10,'#2f9e44'));poly([-20,-10,20,-10,20,-8.5,-20,-8.5],'#237a35');
  ln([0,-10,0,-16],.7,'#fff');ln([-18,-12.5,18,-12.5],.6,'rgba(255,255,255,.7)');poly([-17,-13,17,-13,17,-15,-17,-15],'rgba(255,255,255,.35)');ball(7,-19,1.2,'#fff3e0',0);box(-12,-12,4.5,2,1,CR,0);},
hock:function(){poly([-22,0,22,0,18,-9,-18,-9],lg(-9,0,'#d0ebff',.6,-.05));
  poly([-22,0,22,0,22,-2.4,-22,-2.4],lg(-2.4,0,'#ffffff'));ln([-22,-1.2,22,-1.2],.6,BL);ln([-22,-.4,-22,-3.4,-18,-11,18,-11,22,-3.4,22,-.4],1.6,'#fff');
  ln([-20,-6.5,20,-6.5],.5,'rgba(255,79,106,.6)');ln([0,-2.4,0,-9],.5,'rgba(63,134,255,.6)');ln([-14,-4,-14,-6.5,-11,-6.5,-11,-4],1,CR);ln([4,-6,8,-3,9,-3],1.2,'#495057');ell(10.5,-3.2,1.3,.6,'#212529');},
hoop:function(){box(-1.5,-40,3,40,1.2,IRON,0);ln([0,-34,4,-34],1.6,IRON);box(3,-44,13,10,1.5,'#ffffff',0);g.strokeStyle=CR;g.lineWidth=.9;g.strokeRect(6.5,-41,6,5);
  g.strokeStyle=OR;g.lineWidth=1.4;g.beginPath();g.ellipse(9.5,-35,4.2,1.2,0,0,7);g.stroke();
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=.6;g.beginPath();g.moveTo(5.5,-35);g.lineTo(7,-30);g.lineTo(12,-30);g.lineTo(13.5,-35);g.moveTo(8,-35);g.lineTo(8.3,-30);g.moveTo(11,-35);g.lineTo(10.7,-30);g.stroke();ball(-7,-3,3.2,OR);},
beds:function(){for(var i=0;i<3;i++){var y=-1-i*3.6,w=20-i*1.5;g.beginPath();g.ellipse(0,y,w,2.4,0,Math.PI,0);g.fillStyle=lg(y-2.4,y,'#9a6a44');g.fill();
  for(var j=0;j<7;j++){var x=-w+3+j*(w*2-6)/6;if(i===1)ln([x-1,y-1.6,x,y-4.2,x+1,y-1.6],1,'#51a83d');else if(i===0){ln([x,y-1.5,x-1.2,y-4],1,'#3f9a3c');ln([x,y-1.5,x+1.2,y-4],1,'#3f9a3c');ell(x,y-1.2,1,.6,OR);}else leafy(x,y-2.2,1.6,0);}}},
green:function(){var arch=function(){g.beginPath();g.moveTo(-20,0);g.lineTo(-20,-12);g.bezierCurveTo(-19,-27,19,-27,20,-12);g.lineTo(20,0);};arch();g.closePath();g.fillStyle='rgba(190,232,255,.6)';g.fill();
  g.save();g.clip();[[-12,-6],[-5,-8],[3,-7],[11,-6]].forEach(function(p){ln([p[0],0,p[0],-12],1,'#3f9a3c');leafy(p[0],-9,3.2,1);ball(p[0]-1.5,p[1]+1,1.5,'#ff4f4f',0);ball(p[0]+1.6,p[1]-1.2,1.3,'#ff6b3a',0);});
  g.fillStyle='rgba(255,255,255,.3)';g.fillRect(-20,-30,40,30);g.restore();
  g.strokeStyle='#f8f9fa';g.lineWidth=1.4;arch();g.stroke();
  for(var i=-12;i<=12;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i,-12);g.quadraticCurveTo(i*.9,-22,i*.6,-23);g.stroke();}ln([-20,-12,20,-12],1,'#f8f9fa');
  g.fillStyle='rgba(255,255,255,.65)';g.beginPath();g.ellipse(-10,-19,6,1.6,-.6,0,7);g.fill();},
apple:function(){ball(0,-3.2,3.2,'#ff3b4e');ln([0,-6,.6,-7.6],.7,'#7a4a22');ell(1.9,-7.2,1.5,.7,'#4fab48');},
pumpk:function(){ball(-3.5,-5,4.2,'#ff8a1c',0);ball(3.5,-5,4.2,'#ff8a1c',0);ball(0,-5.4,4.6,'#ff9a2e');ln([0,-9.6,.8,-11.6],1.3,'#5c8a2e');ell(2.6,-10,1.8,.8,'#4fab48');ln([-2,-9,-2.5,-1.5],.4,'rgba(170,70,0,.4)');ln([2,-9,2.5,-1.5],.4,'rgba(170,70,0,.4)');},
well:function(){box(-11,-14,22,14,2.5,'#a3adb8');for(var r=0;r<3;r++)for(var c=0;c<4;c++){g.fillStyle='rgba(255,255,255,'+(.18+((r+c)%2)*.12)+')';rrp(-10.5+c*5.4+(r%2)*2.4,-13.5+r*4.6,4.6,3.8,1.2);g.fill();}
  ell(0,-14,11,2.4,'#5f6b78');ell(0,-14,9,1.6,'#2b3a4a');box(-12,-33,2.4,19,1,WOODD,0);box(9.6,-33,2.4,19,1,WOODD,0);ln([-10,-27,10,-27],1.6,WOODD);
  poly([-15,-31,15,-31,0,-41],lg(-41,-31,CR));ln([-15,-31,0,-41,15,-31],1,mx(CR,-.25));ln([3,-27,3,-19],.6,'#495057');box(1,-19.5,4.2,4,1,BL,0);},
dovec:function(){box(-1.6,-10,3.2,10,1,WOODD,0);ln([-6,0,0,-8,6,0],1.4,WOODD);box(-11,-26,22,16,2,'#74c0fc');g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.5;for(var i=-9;i<=9;i+=2.2){g.beginPath();g.moveTo(i,-23);g.lineTo(i,-12);g.stroke();}
  box(-12,-11,24,2,.8,'#f8f9fa',0);poly([-14,-25,14,-25,0,-35],lg(-35,-25,'#1c7ed6'));ln([-14,-25,0,-35,14,-25],1,'#f8f9fa');box(-2.5,-23.5,5,5,1,'#264b6e',0);ln([0,-35,0,-39],.8,'#495057');poly([0,-39,4,-38,0,-37],CR);},
doves:function(){g.fillStyle='#f1f3f5';g.beginPath();g.ellipse(0,-3,4.2,2,-.1,0,7);g.fill();ball(3.8,-4.6,1.6,'#f8f9fa',0);poly([5.2,-4.8,6.8,-4.3,5.2,-4],OR);
  g.beginPath();g.moveTo(-1,-4);g.quadraticCurveTo(-3,-12,-7,-12);g.quadraticCurveTo(-4,-8,-2,-3);g.fillStyle='#dee2e6';g.fill();g.beginPath();g.moveTo(.5,-4);g.quadraticCurveTo(2,-11,6,-11.5);g.quadraticCurveTo(3,-7,1.8,-3.5);g.fillStyle='#fff';g.fill();
  poly([-4,-3,-7.5,-1.5,-7.5,-4.5],'#ced4da');ball(4.3,-5,.4,'#212529',0);},
birdh:function(){box(-4.5,-10,9,10,1.2,OR);poly([-6.5,-9.5,6.5,-9.5,0,-15],lg(-15,-9,CR));ball(0,-6,1.6,'#5a3a22',0);ln([0,-3,0,-1.4],.8,WOODD);ln([-1.5,-1.4,1.5,-1.4],.8,WOODD);},
feed:function(){ln([-4.5,-14,-4.5,-24],.5,'#868e96');ln([4.5,-14,4.5,-24],.5,'#868e96');poly([-7,-14,7,-14,0,-19],lg(-19,-14,TE));box(-5,-14,1.2,8,.4,WOOD,0);box(3.8,-14,1.2,8,.4,WOOD,0);box(-6.5,-7,13,2.2,.8,WOOD,0);
  for(var i=0;i<6;i++)ell(-4+i*1.6,-7.2,.6,.4,'#f2c14e');g.fillStyle='#ff8a5c';g.beginPath();g.ellipse(2.5,-8.6,1.7,1.1,0,0,7);g.fill();ball(3.8,-9.6,.9,'#ff8a5c',0);poly([4.6,-9.8,5.6,-9.6,4.6,-9.3],'#495057');},
vane:function(){ln([0,0,0,-24],1.2,IRON);ln([-7,-14,7,-14],.9,IRON);poly([7.5,-14,4.5,-15.6,4.5,-12.4],IRON);poly([-7,-14,-9,-15.8,-9,-12.2],IRON);
  g.fillStyle=lg(-30,-21,OR);g.beginPath();g.moveTo(-5,-22);g.quadraticCurveTo(-7,-28,-3,-29);g.quadraticCurveTo(-1,-25,1,-24);g.quadraticCurveTo(2,-29,4,-29);g.lineTo(5.5,-28);g.lineTo(4,-27);g.quadraticCurveTo(5,-24,3,-22);g.closePath();g.fill();
  poly([2.5,-30,4,-31.5,4.5,-29.6],CR);ball(0,-24.5,.9,YE,0);},
dtab:function(){box(-20,-7,8,2,1,WOODD,0);box(12,-7,8,2,1,WOODD,0);box(-18,-5,1.6,5,.5,WOODD,0);box(16.4,-5,1.6,5,.5,WOODD,0);
  box(-2,-13,4,13,1,WOODD,0);box(-7,-1.5,14,1.5,.6,WOODD,0);poly([-16,-13,16,-13,13,-17,-13,-17],lg(-17,-13,WOOD));box(-16,-13,32,2,.8,mx(WOOD,-.15),0);
  [[-11,-15],[-8,-15.6],[9,-14.8]].forEach(function(p){box(p[0],p[1],2.8,1.4,.4,'#f8f9fa',0);});},
samov:function(){box(-2,-3,4,3,1,'#c08a1e',0);ball(0,-7,5,'#f2b632');box(-3.5,-12.5,7,2.4,1,'#d99a1a',0);box(-1.4,-16,2.8,3.5,.8,'#b07a16',0);ell(0,-16.2,2.2,.8,'#8a5a10');
  ln([5,-7,7.5,-6,7.5,-4.5],1,'#b07a16');ln([-5,-9,-7,-9,-7,-6],.9,'#b07a16');ln([5,-9,7,-9,7,-6.5],.9,'#b07a16');ell(7.8,-3,1.6,.6,'#ffffff',.85);},
chess:function(){poly([-7,-1,7,-1,5.5,-4.5,-5.5,-4.5],'#f8f0e3');for(var r=0;r<3;r++)for(var c=0;c<4;c++)if((r+c)%2){var y0=-1-r*1.17,y1=y0-1.17,w0=7-r*.5,w1=w0-.5;g.fillStyle='#8a5a34';g.beginPath();g.moveTo(-w0+c*w0/2,y0);g.lineTo(-w0+(c+1)*w0/2,y0);g.lineTo(-w1+(c+1)*w1/2,y1);g.lineTo(-w1+c*w1/2,y1);g.closePath();g.fill();}
  ell(-2.5,-4,1.4,.5,'#fff');ball(-2.5,-6.2,1.1,'#ffffff',0);box(-3.2,-5.6,1.4,1.8,.4,'#ffffff',0);ell(3,-3.2,1.4,.5,'#343a40');ball(3,-5.6,1.1,'#343a40',0);box(2.3,-5,1.4,1.8,.4,'#343a40',0);},
radio:function(){box(-9,-3,1.4,3,.4,WOODD,0);box(7.6,-3,1.4,3,.4,WOODD,0);box(-10,-13,20,10,2,'#b5703a');box(-8,-11.5,9,7,1.4,'#f1d8a8',0);g.strokeStyle='rgba(138,90,52,.5)';g.lineWidth=.4;for(var i=-7;i<1;i+=1.3){g.beginPath();g.moveTo(i,-11);g.lineTo(i,-5);g.stroke();}
  box(2.5,-11.5,5.5,2.4,.6,'#fff3c0',0);ball(4,-6.5,1.3,'#ffd23a',0);ball(7,-6.5,1.3,'#ffd23a',0);ln([2,-14,5,-16,8,-15],.6,'#495057');
  g.fillStyle=CR;g.beginPath();g.ellipse(-11,-16,1.3,1,-.4,0,7);g.fill();ln([-9.9,-16.3,-9.9,-20.5,-8,-19.5],.6,CR);},
gazeb:function(){box(-17,-24,2.4,24,1,'#f8f9fa',0);box(14.6,-24,2.4,24,1,'#f8f9fa',0);box(-5,-24,2,24,1,'#e9ecef',0);box(3,-24,2,24,1,'#e9ecef',0);
  box(-17,-10,34,2,1,'#f1f3f5',0);for(var i=-15;i<15;i+=3)ln([i,-8,i,-3],.7,'#e9ecef');box(-17,-3.4,34,1.4,.6,'#f1f3f5',0);
  g.beginPath();g.moveTo(-22,-23);g.quadraticCurveTo(-10,-27,0,-40);g.quadraticCurveTo(10,-27,22,-23);g.closePath();g.fillStyle=lg(-40,-23,OR);g.fill();
  for(var j=0;j<6;j++){var x=-20+j*8;g.beginPath();g.arc(x,-23,2.4,0,Math.PI);g.fillStyle=j%2?'#fff':CR;g.fill();}ln([0,-40,0,-43],1,'#495057');ball(0,-44,1.4,YE,0);
  g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(-8,-30,6,1.4,-.7,0,7);g.fill();},
grape:function(){ell(-2,-12,4,2,'#4fab48');ell(3,-12.5,3.4,1.7,'#5fb84a');ln([0,-12,0,-9],.6,'#7a5230');var p=[[-1.6,-8.5],[1.6,-8.5],[0,-6.4],[-2.6,-6.4],[2.6,-6.4],[-1.2,-4.3],[1.2,-4.3],[0,-2.3]];p.forEach(function(q){ball(q[0],q[1],1.4,'#8e4fd6',0);});
  g.fillStyle='rgba(255,255,255,.5)';p.forEach(function(q){g.beginPath();g.arc(q[0]-.5,q[1]-.5,.4,0,7);g.fill();});},
fount:function(){ell(0,-3,20,5,'#5f7387');g.fillStyle=lg(-10,0,'#cfd8e3');g.beginPath();g.ellipse(0,-5,20,5,0,0,7);g.fill();ell(0,-5.5,17,3.8,'#4dabf7');ell(-5,-6.3,7,1.2,'#ffffff',.45);
  box(-2.2,-16,4.4,11,1.5,'#cfd8e3');ell(0,-16,7,1.8,'#a3b3c4');ell(0,-16.4,5.6,1.2,'#74c0fc');
  g.strokeStyle='rgba(165,216,255,.95)';g.lineWidth=1.4;g.lineCap='round';[-1,1].forEach(function(s){g.beginPath();g.moveTo(0,-17);g.quadraticCurveTo(s*7,-30,s*13,-7);g.stroke();g.beginPath();g.moveTo(0,-17);g.quadraticCurveTo(s*3,-26,s*6,-16.5);g.stroke();});
  ln([0,-17,0,-27],1.6,'rgba(208,235,255,.95)');ball(0,-28,1.4,'#e7f5ff',0);[[-9,-25],[9,-24],[-4,-30],[4,-31]].forEach(function(q){ball(q[0],q[1],.7,'#d0ebff',0);});},
linden:function(){box(-2.2,-20,4.4,20,1.6,'#8a6141',0);leafy(0,-34,14,0);leafy(-10,-26,9,1);leafy(10,-27,9.5,1);leafy(1,-44,8.5,0);
  g.fillStyle='rgba(255,246,170,.6)';[[-6,-36],[5,-30],[-11,-27],[9,-40],[2,-25],[-2,-44]].forEach(function(q){g.beginPath();g.arc(q[0],q[1],1.1,0,7);g.fill();});},
icecr:function(){box(-12,-18,24,18,2,'#fff4f8');box(-9,-15,18,7,1.5,'#a5d8ff');box(-12,-8,24,1.6,.6,PI,0);
  for(var i=0;i<6;i++){var x=-14+i*4.67,c=i%2?'#ffffff':PI;poly([x,-26,x+4.67,-26,x+4.67,-20,x,-20],c);g.beginPath();g.arc(x+2.33,-20,2.33,0,Math.PI);g.fillStyle=c;g.fill();}
  box(-14,-27.5,28,2,1,mx(PI,-.2),0);poly([-2.2,-31,2.2,-31,0,-26.5],'#f0b46a');ball(0,-32.2,2.4,'#fff0f6',0);ball(-1,-34,1.6,'#ff8fab',0);
  g.fillStyle='rgba(255,255,255,.55)';rrp(-7,-14,3,5,1);g.fill();box(-4,-12,3,3.6,1,YE,0);box(1,-12,3,3.6,1,'#ff8fab',0);},
clock:function(){box(-1.4,-30,2.8,30,1,'#3f4a5a',0);box(-3,-3,6,3,1,'#3f4a5a',0);ln([0,-30,0,-32],1.4,'#3f4a5a');ball(0,-36,6.5,'#3f4a5a',0);g.fillStyle='#fffdf2';g.beginPath();g.arc(0,-36,5.2,0,7);g.fill();
  for(var i=0;i<12;i++){var a=i*.5236;g.fillStyle='#495057';g.beginPath();g.arc(Math.cos(a)*4.3,-36+Math.sin(a)*4.3,i%3?.25:.45,0,7);g.fill();}ln([0,-36,0,-39.5],.7,'#212529');ln([0,-36,2.6,-35],.7,'#212529');ball(0,-43,1.4,YE,0);},
pbench:function(){g.strokeStyle='#2b6a45';g.lineWidth=1.8;g.lineCap='round';[-18,18].forEach(function(x){g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x*.92,-8,x*1.02,-12);g.quadraticCurveTo(x*1.1,-22,x*.95,-24);g.stroke();});
  box(-20,-13,40,4,1.6,'#3fae6a');box(-19,-25,38,3.6,1.6,'#3fae6a');box(-19,-20.5,38,3.6,1.6,'#3fae6a');},
garl:function(w){var L=w/2,cs=[CR,YE,GR,BL,PI,OR];g.strokeStyle='#4a5560';g.lineWidth=.9;g.beginPath();g.moveTo(-L,0);g.quadraticCurveTo(0,26,L,0);g.stroke();
  var n=Math.round(w/16);for(var i=0;i<=n;i++){var t=i/n,x=-L+w*t,y=2*t*(1-t)*26,c=cs[i%6];var gr=g.createRadialGradient(x,y+3,0,x,y+3,7);gr.addColorStop(0,ra(c,.55));gr.addColorStop(1,ra(c,0));g.fillStyle=gr;g.beginPath();g.arc(x,y+3,7,0,7);g.fill();
    g.fillStyle='#5a6672';g.fillRect(x-.9,y-.4,1.8,1.6);ball(x,y+3,2.2,c);}},
xtree:function(){box(-2,-6,4,6,1,'#8a6141',0);[[-15,-6,-24],[-12,-18,-34],[-9,-29,-44]].forEach(function(q){g.beginPath();g.moveTo(q[0],q[1]);g.quadraticCurveTo(0,q[1]+2.5,-q[0],q[1]);g.lineTo(0,q[2]);g.closePath();g.fillStyle=lg(q[2],q[1],'#2f9e44',.35,-.2);g.fill();});
  ln([-10,-9,0,-12,9,-14],.6,'rgba(255,230,140,.9)');ln([-8,-22,1,-25,7,-27],.6,'rgba(255,230,140,.9)');
  [[-7,-10,CR],[6,-12,YE],[-3,-21,BL],[5,-23,CR],[-6,-26,OR],[2,-33,PI],[-1,-14,VI]].forEach(function(q){ball(q[0],q[1],1.7,q[2]);});
  g.fillStyle=YE;g.beginPath();for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,r=i%2?1.4:3.4;g.lineTo(Math.cos(a)*r,-46+Math.sin(a)*r);}g.closePath();g.fill();},
stage:function(){box(-22,-10,44,10,1.5,'#c92a2a');box(-22,-11,44,2.4,1,YE,0);
  box(-22,-38,4,28,1.2,'#7a1f2b',0);box(18,-38,4,28,1.2,'#7a1f2b',0);box(-22,-40,44,4,1.5,'#7a1f2b',0);
  [-1,1].forEach(function(s){g.beginPath();g.moveTo(s*18,-36);g.lineTo(s*9,-36);g.quadraticCurveTo(s*13,-24,s*17,-11);g.lineTo(s*18,-11);g.closePath();g.fillStyle=lg(-36,-11,CR);g.fill();});
  for(var i=0;i<9;i++){var x=-18+i*4.5;poly([x,-36,x+4.5,-36,x+2.25,-32.5],[CR,YE,BL,GR][i%4]);}ln([-4,-11,-4,-17],.7,'#495057');ball(-4,-18,1.2,'#343a40',0);},
ballo:function(c){ln([0,0,1,-6,-1,-12,0,-16],.5,'#868e96');g.fillStyle=lg(-26,-15,c);g.beginPath();g.ellipse(0,-21,4.2,5.2,0,0,7);g.fill();poly([-1,-15.6,1,-15.6,0,-16.8],c);g.fillStyle='rgba(255,255,255,.65)';g.beginPath();g.ellipse(-1.5,-23,1,1.8,-.4,0,7);g.fill();},
salut:function(c){var n=16;for(var i=0;i<n;i++){var a=i/n*Math.PI*2,r=i%2?13:17,gr=g.createLinearGradient(0,0,Math.cos(a)*r,Math.sin(a)*r);gr.addColorStop(0,ra(c,0));gr.addColorStop(1,c);g.strokeStyle=gr;g.lineWidth=1.3;g.lineCap='round';g.beginPath();g.moveTo(Math.cos(a)*4,Math.sin(a)*4);g.lineTo(Math.cos(a)*r,Math.sin(a)*r);g.stroke();
    ball(Math.cos(a)*(r+1.6),Math.sin(a)*(r+1.6),i%2?.9:1.2,i%3?c:'#fff8d8',0);}var gr2=g.createRadialGradient(0,0,0,0,0,9);gr2.addColorStop(0,'rgba(255,255,230,.9)');gr2.addColorStop(1,'rgba(255,255,230,0)');g.fillStyle=gr2;g.beginPath();g.arc(0,0,9,0,7);g.fill();},
swan:function(){ell(0,-2,11,3,'#2f3540');g.fillStyle=lg(-12,-1,'#ffffff',.2,-.12);g.beginPath();g.moveTo(-11,-3);g.quadraticCurveTo(-10,-10,-2,-9);g.quadraticCurveTo(6,-9,8,-5);g.quadraticCurveTo(4,-1,-6,-1);g.closePath();g.fill();
  g.strokeStyle='#fff';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(5,-6);g.quadraticCurveTo(11,-10,8,-17);g.quadraticCurveTo(6,-21,9,-22);g.stroke();ball(9.5,-21.5,1.9,'#ffffff',0);poly([11,-22,14.5,-21,11,-20.4],OR);ball(9.3,-22.3,.45,'#212529',0);
  for(var i=0;i<5;i++)ln([-8+i*3,-7.5,-6.5+i*3,-4.5],.5,'rgba(120,130,140,.45)');ell(-4,-1,2,1,GR);flower(-9,-3.5,1.6,PI);},
soda:function(){box(-8,-34,16,34,2,CR);box(-6,-31,12,6,1.2,'#ffffff');g.fillStyle='#e03150';rrp(-4.5,-29.5,9,1.2,.6);g.fill();rrp(-3.5,-27.5,7,1.2,.6);g.fill();
  box(-6,-22,12,9,1.2,'#33415c');box(-3,-17,6,4,1,'#a5d8ff',0);ln([0,-21,0,-18],.8,'#ced4da');box(-5.5,-11,4,2.5,.8,YE,0);box(2,-11,3.5,3,.8,'#e9ecef',0);
  box(-8,-3,16,3,1,'#c92a2a',0);g.fillStyle='rgba(255,255,255,.35)';rrp(5,-33,1.6,30,.8);g.fill();},
chime:function(){ln([-5,-14,5,-14],1.2,'#adb5bd');ln([0,-14,0,-17],.6,'#868e96');[[-4,9,TE],[-1.5,11,BL],[1.5,8,VI],[4,10,TE]].forEach(function(q){ln([q[0],-14,q[0],-14+q[1]*.35],.3,'#868e96');box(q[0]-.7,-14+q[1]*.35,1.4,q[1]*.65,.6,q[2],.6);});ball(0,-4,1,YE,0);},
lantn:function(w){var L=w/2,cs=[CR,OR,YE,PI,CR,OR,YE],n=7;g.strokeStyle='#5a4a40';g.lineWidth=.7;g.beginPath();g.moveTo(-L,0);g.quadraticCurveTo(0,20,L,0);g.stroke();
  for(var i=1;i<n;i++){var t=i/n,x=-L+w*t,y=2*t*(1-t)*20,c=cs[i%7],gr=g.createRadialGradient(x,y+6,0,x,y+6,10);gr.addColorStop(0,'rgba(255,220,140,.5)');gr.addColorStop(1,'rgba(255,220,140,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y+6,10,0,7);g.fill();
    ln([x,y,x,y+1.6],.5,'#5a4a40');box(x-2.2,y+1.6,4.4,1,.3,'#5a3a22',0);g.fillStyle=lg(y+2.4,y+10,c,.45,-.15);g.beginPath();g.ellipse(x,y+6.2,3.6,3.8,0,0,7);g.fill();box(x-2,y+9.6,4,1,.3,'#5a3a22',0);
    g.strokeStyle='rgba(120,40,20,.25)';g.lineWidth=.35;g.beginPath();g.ellipse(x,y+6.2,1.6,3.8,0,0,7);g.stroke();}}
};
/* размер рисунка: px (в 1200×800) на «40 единиц» */
var SZ={bench:46,urn:24,lamp:76,cat:28,balc:34,sand:50,swing:50,slide:48,carou:46,rocket:42,daisy:36,tulip:34,rose:34,fence:90,sunfl:52,
  garage:76,car:58,tools:40,tyres:40,moto:52,hbar:52,goal:56,pong:48,hock:80,hoop:58,beds:62,green:56,apple:34,pumpk:34,well:44,
  dovec:50,doves:34,birdh:24,feed:24,vane:30,dtab:58,samov:28,chess:26,radio:26,gazeb:66,grape:26,fount:62,linden:84,icecr:48,clock:46,
  pbench:46,garl:40,xtree:58,stage:84,ballo:30,salut:48,swan:38,soda:44,chime:34,lantn:40};
/* свои места на новом фоне (x,y низ-центр в 1200×800; несколько — по одной на штуку) */
var POS={balc:[[420,454],[765,406],[765,502]],apple:[[497,478],[540,500],[468,506]],dovec:[[758,280]],vane:[[442,288]],
  birdh:[[521,578]],feed:[[566,544]],chime:[[756,421],[436,469]],grape:[[490,601],[513,604],[536,601]],
  radio:[[640,728]],clock:[[668,652]],samov:[[594,705]],chess:[[618,705]],doves:[[690,250],[714,236],[736,258]],linden:[[392,640],[808,640]],
  garl:[[600,362]],lantn:[[600,404]],salut:[[470,190],[600,130],[730,200]],ballo:[[490,590],[502,586],[514,591]]};
/* без тени на земле: висят, летят, стоят на другой вещи */
var AIR={balc:1,apple:1,dovec:1,vane:1,birdh:1,feed:1,chime:1,grape:1,doves:1,garl:1,lantn:1,salut:1,ballo:1,cat:1,samov:1,chess:1};
var TOP={garl:1,lantn:1,salut:1}; // рисуются первыми (за всем)
var BCOL=[CR,BL,YE,VI,TE,OR],SCOL=[CR,YE,BL];
/* перевод K2 → 1200×800; по ширине чуть сжато (×0,92) и прижато внутрь полосы 418…782 — она видна на телефоне 320–375 px */
function places(d){if(POS[d.id])return POS[d.id];var x=600+(d.x-200)*K*.92,y=800-(700-d.y)*K,hw=(SZ[d.id]||40)*.5,o=[];
  for(var i=0;i<d.k;i++){var xi=x+(i-(d.k-1)/2)*(d.dx?d.dx*K:d.s*1.7*K);o.push([Math.max(418+hw,Math.min(782-hw,xi)),y]);}return o;}
function shadow(x,y,w){var gr=g.createRadialGradient(x,y,0,x,y,w);gr.addColorStop(0,'rgba(40,80,50,.26)');gr.addColorStop(1,'rgba(40,80,50,0)');g.save();g.translate(x,y);g.scale(1,.22);g.translate(-x,-y);g.fillStyle=gr;g.beginPath();g.arc(x,y,w,0,7);g.fill();g.restore();}
/* стройка: ограждение — столбики, красно-белая лента, конус, мешок */
function site(x,y,w){var h=Math.max(16,w*.42),L=w/2;shadow(x,y,L*1.05);
  g.fillStyle='rgba(170,130,90,.35)';g.beginPath();g.ellipse(x,y-2,L*.9,4,0,0,7);g.fill();
  [-1,-.33,.33,1].forEach(function(t){var px=x+t*L;box(px-1.6,y-h,3.2,h,1,'#f8f9fa',0);g.fillStyle='#ff6b00';g.fillRect(px-1.6,y-h*.66,3.2,h*.16);g.fillRect(px-1.6,y-h*.33,3.2,h*.16);ball(px,y-h-1,1.8,OR,0);});
  [.78,.44].forEach(function(f){var yy=y-h*f;g.save();g.beginPath();g.moveTo(x-L,yy-1.8);g.quadraticCurveTo(x,yy+3,x+L,yy-1.8);g.lineTo(x+L,yy+1.8);g.quadraticCurveTo(x,yy+6.6,x-L,yy+1.8);g.closePath();g.clip();
    for(var i=-L-6,k=0;i<L+6;i+=6,k++){g.fillStyle=k%2?'#ff4f4f':'#ffffff';g.beginPath();g.moveTo(x+i,yy+8);g.lineTo(x+i+3,yy+8);g.lineTo(x+i+6,yy-4);g.lineTo(x+i+3,yy-4);g.fill();}g.restore();});
  var cx=x+L*.62;poly([cx-5,y,cx+5,y,cx+1.4,y-12,cx-1.4,y-12],lg(y-12,y,'#ff7a1a'));g.fillStyle='#fff';g.fillRect(cx-3.3,y-7,6.6,2);box(cx-6,y-1.6,12,1.6,.6,'#e8590c',0);
  box(x-L*.55,y-6,10,6,2.5,'#d9c7a3');ln([x-L*.55+2,y-4,x-L*.55+8,y-4],.5,'rgba(120,90,50,.4)');}
function dreamDraw(cg,W,H,tod){if(typeof DREAM==='undefined'||typeof S==='undefined'||!S||!cg)return 0;var yd=S.yd||{},yb=S.yb||{};
  g=cg;var sc=W/1200,items=[],n=0,built={};
  DREAM.forEach(function(d){var st=yd[d.id]===1?1:yb[d.id]?2:0;if(!st||!D[d.id])return;places(d).forEach(function(p,i){items.push({d:d,x:p[0],y:p[1],i:i,st:st});});});
  items.sort(function(a,b){return (TOP[a.d.id]?-1e4:0)+a.y-((TOP[b.d.id]?-1e4:0)+b.y);});
  g.save();g.scale(sc,sc);
  items.forEach(function(it){var id=it.d.id;try{
    if(it.st===2){if(built[id])return;built[id]=1;var ps=places(it.d),x0=ps[0][0],x1=ps[ps.length-1][0],
        w=Math.max(46,Math.min(110,(SZ[id]||40)*.9+Math.abs(x1-x0))),gy=Math.max(612,Math.min(792,it.y));site((x0+x1)/2,gy,w);n++;return;}
    g.save();
    if(id==='garl'||id==='lantn'){g.translate(it.x,it.y);D[id](id==='garl'?380:300);}
    else{var s=(SZ[id]||40)/40;if(!AIR[id])shadow(it.x,it.y,(SZ[id]||40)*.55);g.translate(it.x,it.y);g.scale(s,s);D[id](id==='ballo'?BCOL[it.i%6]:id==='salut'?SCOL[it.i%3]:undefined);}
    g.restore();n++;}catch(e){try{g.restore();}catch(e2){}}});
  g.restore();
  if(tod==='night'||tod==='eve'){g.save();g.globalCompositeOperation='source-atop';g.fillStyle=tod==='night'?'rgba(24,36,86,.38)':'rgba(255,140,90,.10)';g.fillRect(0,0,W,H);g.restore();} /* ночью вещи темнее, вечером теплее */
  return n;}
var cKey=null,cUrl='';
function dreamUrl(tod){if(typeof DREAM==='undefined'||typeof S==='undefined'||!S)return '';var yd=S.yd||{},yb=S.yb||{},key='';
  DREAM.forEach(function(d){if(yd[d.id]===1)key+=d.id+'1,';else if(yb[d.id])key+=d.id+'2,';});key=key&&key+(tod||'');
  if(!key)return '';if(key===cKey)return cUrl;
  try{var c=document.createElement('canvas');c.width=1200;c.height=800;dreamDraw(c.getContext('2d'),1200,800,tod);cUrl='url("'+c.toDataURL('image/png')+'")';cKey=key;}catch(e){return '';}
  return cUrl;}
/* сведение: значок вещи для списка окна «Двор мечты» (вместо системного эмодзи) — рисунок вещи, вписанный в квадрат; кэш по id */
var IC={};
function dreamIcon(id){if(id in IC)return IC[id];IC[id]='';if(!D[id])return '';
  try{var N=240,c=document.createElement('canvas');c.width=c.height=N;g=c.getContext('2d');g.save();
    if(id==='garl'||id==='lantn'){g.translate(N/2,N*.3);D[id](200);}
    else{g.translate(N/2,N*.72);g.scale(3,3);D[id](id==='ballo'?BCOL[0]:id==='salut'?SCOL[0]:undefined);}
    g.restore();
    var d=g.getImageData(0,0,N,N).data,x0=N,y0=N,x1=-1,y1=-1,x,y;
    for(y=0;y<N;y++)for(x=0;x<N;x++)if(d[(y*N+x)*4+3]>24){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    if(x1<0)return '';
    var w=x1-x0+1,h=y1-y0+1,M=96,k=Math.min((M-8)/w,(M-8)/h),o=document.createElement('canvas');o.width=o.height=M;
    var og=o.getContext('2d');og.imageSmoothingQuality='high';og.drawImage(c,x0,y0,w,h,(M-w*k)/2,(M-h*k)/2,w*k,h*k);
    IC[id]=o.toDataURL('image/png');}catch(e){IC[id]='';}
  return IC[id];}
var LK=Wn.LK||(Wn.LK={});LK.dreamDraw=dreamDraw;LK.dreamUrl=dreamUrl;LK.dreamPics=D;LK.dreamIcon=dreamIcon;
})();
