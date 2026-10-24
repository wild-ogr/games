/* Общие персонажи серии (правило владельца 09.10: один герой = один облик во всех играх) — тётя Валя и дед Митяй.
   Тётя Валя — родная игра «Гастроном» (~/Projects/gastronom, index.html drawPerson(g,'valya',…), сборка 2fd7324);
   дед Митяй — родная игра «Рыбалка с Петровичем» (~/Projects/rybak, js/mg-art.js mit(), 890b87b).
   Код рисования перенесён БЕЗ ИЗМЕНЕНИЙ (Canvas); здесь только рамка: рисуем в холст 400×440, отдаём картинкой внутри SVG
   (тот же размер 200×220, что у остальных жителей двора в js/look.js). Настроения Викторины norm|happy|sad|wow:
   Валя — mood 0 / 1 / −1 / рот «говорит» (как в Гастрономе); Митяй — в Рыбалке есть norm и smile, грусть и удивление
   дорисованы поверх (брови домиком, рот «о»), в его же цветах.
   KIN.bust(id,m) — по пояс 200×220 (LK.who), KIN.head(id,m,bg) — 200×200 «Классика» (portrait), KIN.face(id,cls) — значок. */
(function(){
'use strict';
/* ---- из «Гастронома» (помощники рисования и drawPerson — как есть) ---- */
var GA=(function(){
const SKIN='#f2c9a7';
const hasDecor=()=>false; // у Вали в Викторине нет покупных украшений Гастронома
function shade(hex,p){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=p<0?0:255,q=Math.abs(p);r=Math.round((t-r)*q+r);g=Math.round((t-g)*q+g);b=Math.round((t-b)*q+b);return`rgb(${r},${g},${b})`;}
// скруглённый прямоугольник; старые браузеры без roundRect (Chrome < 99, Safari < 16) — через arcTo
function rrect(g,x,y,w,h,r){g.beginPath();r=Math.max(0,Math.min(r||0,w/2,h/2));if(g.roundRect){g.roundRect(x,y,w,h,r);return;}
  g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function ell(g,x,y,rx,ry,f){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);if(f){g.fillStyle=f;g.fill();}}
function lin(g,x0,y0,x1,y1,st){const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>gr.addColorStop(i/(st.length-1),c));return gr;}
function poly(g,pts,f){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();if(f){g.fillStyle=f;g.fill();}}
function drawPerson(g,kind,cx,by,h,mood,tk,talk){const u=h/100,bob=Math.sin(tk*2+cx*.01)*1.2*u;by+=bob;const hx=cx,hy=by-60*u;g.save();g.lineCap='round';g.lineJoin='round';
  const C={babka:'#7d5a44',school:'#f3f3ef',police:'#35557a',intel:'#8a8f94',worker:'#2f4f6f',student:'#1e8f7a',revizor:'#2d3436',valya:'#fbfbfb',veteran:'#5b5146'}[kind];
  // плечи
  g.beginPath();g.moveTo(cx-38*u,by+12*u);g.lineTo(cx-36*u,by-20*u);g.quadraticCurveTo(cx-34*u,by-36*u,cx-14*u,by-38*u);g.lineTo(cx+14*u,by-38*u);g.quadraticCurveTo(cx+34*u,by-36*u,cx+36*u,by-20*u);g.lineTo(cx+38*u,by+12*u);g.closePath();
  g.fillStyle=lin(g,cx-38*u,0,cx+38*u,0,[shade(C,-.18),C,shade(C,-.08),shade(C,-.28)]);g.fill();
  if(kind==='valya'){g.strokeStyle='#d9d9d9';g.lineWidth=1.5*u;g.beginPath();g.moveTo(cx,by-36*u);g.lineTo(cx,by+12*u);g.stroke();for(let k=0;k<3;k++)ell(g,cx+4*u,by-24*u+k*12*u,1.8*u,1.8*u,'#c9c9c9');
    poly(g,[cx-12*u,by-38*u,cx,by-26*u,cx+12*u,by-38*u],'#f2c9a7');
    // бусы (обстановка): коралловые бусины дугой по вороту
    if(hasDecor('beads'))for(let k=0;k<=10;k++){const t=k/10*2-1,x=cx+t*15*u,y=by-37.5*u+(1-t*t)*14*u;ell(g,x,y,2.5*u,2.5*u,k%2?'#d9483b':'#e8604f');ell(g,x-.8*u,y-.8*u,.9*u,.9*u,'rgba(255,255,255,.7)');}
    // значок «Отличник торговли» (за задания дня): золотой кружок с красной звездой на груди
    if(hasDecor('q_badge')){const bx=cx-22*u,by2=by-29*u;poly(g,[bx-3.2*u,by2-9*u,bx+3.2*u,by2-9*u,bx+2*u,by2-3*u,bx-2*u,by2-3*u],'#c62828');ell(g,bx,by2,6*u,6*u,'#b8860b');ell(g,bx,by2,5*u,5*u,'#f2c94c');qStar(g,bx,by2-.4*u,3.8*u,'#c62828');}}
  else if(kind==='school'){poly(g,[cx-10*u,by-38*u,cx,by-28*u,cx+10*u,by-38*u],'#f3f3ef');poly(g,[cx-3*u,by-30*u,cx+3*u,by-30*u,cx+9*u,by-6*u,cx+1*u,by-10*u,cx-6*u,by-4*u],'#d63031');ell(g,cx,by-31*u,3.5*u,3*u,'#b71c1c');
    // бидон
    const bx=cx+34*u,byy=by-2*u;rrect(g,bx-9*u,byy-24*u,18*u,26*u,4*u);g.fillStyle=lin(g,bx-9*u,0,bx+9*u,0,['#8f9aa0','#e3e8ea','#8f9aa0']);g.fill();rrect(g,bx-5*u,byy-30*u,10*u,7*u,2*u);g.fillStyle='#b5bec2';g.fill();
    g.strokeStyle='#6f7a80';g.lineWidth=1.6*u;g.beginPath();g.arc(bx,byy-30*u,7*u,Math.PI,0);g.stroke();}
  else if(kind==='police'){poly(g,[cx-10*u,by-38*u,cx,by-26*u,cx+10*u,by-38*u],'#f0f0f0');g.fillStyle='#c0392b';g.fillRect(cx-16*u,by-34*u,6*u,4*u);g.fillRect(cx+10*u,by-34*u,6*u,4*u);
    g.fillStyle='#d4a017';g.fillRect(cx-32*u,by-26*u,14*u,4*u);g.fillRect(cx+18*u,by-26*u,14*u,4*u);for(let k=0;k<3;k++)ell(g,cx,by-18*u+k*10*u,1.8*u,1.8*u,'#d4a017');}
  else if(kind==='intel'||kind==='revizor'){poly(g,[cx-11*u,by-38*u,cx,by-14*u,cx+11*u,by-38*u],'#f4f4f0');poly(g,[cx-3*u,by-34*u,cx+3*u,by-34*u,cx+4*u,by-12*u,cx,by-8*u,cx-4*u,by-12*u],kind==='revizor'?'#c0392b':'#2c3e50');
    if(kind==='revizor'){rrect(g,cx+18*u,by-18*u,24*u,30*u,2*u);g.fillStyle='#8b1e1e';g.fill();g.fillStyle='#f5f0e0';g.fillRect(cx+21*u,by-15*u,18*u,3*u);}}
  else if(kind==='worker'){poly(g,[cx-14*u,by-38*u,cx-4*u,by-24*u,cx,by-36*u],shade(C,.15));poly(g,[cx+14*u,by-38*u,cx+4*u,by-24*u,cx,by-36*u],shade(C,.15));g.fillStyle='#f39c12';g.fillRect(cx-36*u,by-8*u,72*u,4*u);}
  else if(kind==='student'){g.fillStyle='#f1c40f';rrect(g,cx-18*u,by-40*u,36*u,10*u,5*u);g.fill();g.fillStyle='#e67e22';for(let k=0;k<3;k++)g.fillRect(cx-14*u+k*10*u,by-40*u,4*u,10*u);
    g.fillStyle='#f1c40f';g.fillRect(cx+6*u,by-32*u,8*u,24*u);g.fillStyle='#e67e22';g.fillRect(cx+6*u,by-24*u,8*u,3*u);g.fillRect(cx+6*u,by-16*u,8*u,3*u);}
  // ветеран: пиджак, орденские планки и две медали
  else if(kind==='veteran'){poly(g,[cx-10*u,by-38*u,cx,by-24*u,cx+10*u,by-38*u],'#f4f4f0');for(let k=0;k<3;k++){g.fillStyle=['#c0392b','#f39c12','#2e86de'][k];g.fillRect(cx-30*u+k*7*u,by-30*u,6*u,4*u);}
    for(let k=0;k<2;k++){g.fillStyle=k?'#c0392b':'#d35400';g.fillRect(cx-27*u+k*9*u,by-25*u,3.5*u,6*u);ell(g,cx-25.3*u+k*9*u,by-16*u,4.2*u,4.2*u,'#f1c40f');ell(g,cx-25.3*u+k*9*u,by-16*u,2*u,2*u,'#c9950c');}}
  else if(kind==='babka'){poly(g,[cx-10*u,by-38*u,cx,by-30*u,cx+10*u,by-38*u],'#a0785c');for(let k=0;k<3;k++)ell(g,cx+2*u,by-24*u+k*11*u,2*u,2*u,'#3e2a1f');}
  // шея и волосы сзади
  g.fillStyle=shade(SKIN,-.12);g.fillRect(hx-6*u,hy+12*u,12*u,12*u);
  if(kind==='student'){g.beginPath();g.moveTo(hx-20*u,hy-6*u);g.quadraticCurveTo(hx-26*u,hy+22*u,hx-18*u,hy+30*u);g.lineTo(hx+18*u,hy+30*u);g.quadraticCurveTo(hx+26*u,hy+22*u,hx+20*u,hy-6*u);g.closePath();g.fillStyle='#a0522d';g.fill();}
  if(kind==='babka'){ell(g,hx,hy+1*u,23*u,25*u,'#c0392b');g.fillStyle='#fff';for(const [x,y] of [[-18,8],[18,8],[-20,-6],[20,-6],[-12,20],[12,20]])ell(g,hx+x*u,hy+y*u,1.7*u,1.7*u);}
  if(kind==='valya'){for(const [x,y,r] of [[-17,-10,8],[17,-10,8],[-19,2,7],[19,2,7],[-12,-18,8],[12,-18,8],[0,-21,9]])ell(g,hx+x*u,hy+y*u,r*u,r*u,'#b5523b');}
  // голова
  ell(g,hx,hy,17*u,19*u,lin(g,hx-17*u,0,hx+17*u,0,[shade(SKIN,-.1),SKIN,shade(SKIN,-.14)]));
  ell(g,hx-17*u,hy+1*u,3*u,4.5*u,shade(SKIN,-.1));ell(g,hx+17*u,hy+1*u,3*u,4.5*u,shade(SKIN,-.1));
  // причёска / головной убор
  if(kind==='babka'){g.beginPath();g.moveTo(hx-19*u,hy+4*u);g.quadraticCurveTo(hx-22*u,hy-26*u,hx,hy-24*u);g.quadraticCurveTo(hx+22*u,hy-26*u,hx+19*u,hy+4*u);g.quadraticCurveTo(hx+14*u,hy-10*u,hx,hy-12*u);g.quadraticCurveTo(hx-14*u,hy-10*u,hx-19*u,hy+4*u);
    g.fillStyle='#c0392b';g.fill();g.fillStyle='#fff';for(const [x,y] of [[-10,-16],[2,-19],[12,-12],[-15,-4],[15,0],[-4,-10]])ell(g,hx+x*u,hy+y*u,1.6*u,1.6*u);
    ell(g,hx,hy-11*u,12*u,3*u,'#d5d5d5');poly(g,[hx-9*u,hy+19*u,hx,hy+16*u,hx+9*u,hy+19*u,hx+3*u,hy+30*u,hx-3*u,hy+30*u],'#a93226');}
  else if(kind==='school'){g.beginPath();g.moveTo(hx-18*u,hy-2*u);g.quadraticCurveTo(hx-18*u,hy-24*u,hx,hy-23*u);g.quadraticCurveTo(hx+18*u,hy-24*u,hx+18*u,hy-2*u);g.lineTo(hx+12*u,hy-10*u);g.lineTo(hx+2*u,hy-8*u);g.lineTo(hx-8*u,hy-12*u);g.closePath();g.fillStyle='#6d4c41';g.fill();
    for(const [x,y] of [[-9,5],[-6,7],[7,5],[10,7]])ell(g,hx+x*u,hy+y*u,.9*u,.9*u,'#c47b53');}
  else if(kind==='police'){g.fillStyle='#1c2833';rrect(g,hx-17*u,hy-14*u,34*u,6*u,3*u);g.fill();ell(g,hx,hy-20*u,22*u,8*u,'#35557a');g.fillStyle='#35557a';g.fillRect(hx-17*u,hy-20*u,34*u,8*u);
    g.fillStyle='#c0392b';g.fillRect(hx-17*u,hy-15*u,34*u,4*u);ell(g,hx,hy-17*u,3.5*u,3.5*u,'#f1c40f');ell(g,hx,hy-17*u,1.6*u,1.6*u,'#c0392b');}
  else if(kind==='intel'){g.fillStyle='#8d6e63';g.beginPath();g.moveTo(hx-15*u,hy+6*u);g.quadraticCurveTo(hx,hy+26*u,hx+15*u,hy+6*u);g.quadraticCurveTo(hx,hy+14*u,hx-15*u,hy+6*u);g.fill();
    ell(g,hx,hy-14*u,26*u,5*u,'#5d4037');g.beginPath();g.moveTo(hx-15*u,hy-14*u);g.quadraticCurveTo(hx-15*u,hy-32*u,hx,hy-30*u);g.quadraticCurveTo(hx+15*u,hy-32*u,hx+15*u,hy-14*u);g.closePath();g.fillStyle='#6d4c41';g.fill();g.fillStyle='#3e2723';g.fillRect(hx-15*u,hy-19*u,30*u,4*u);}
  else if(kind==='veteran'){ell(g,hx-15*u,hy-3*u,4*u,7*u,'#d0d0d0');ell(g,hx+15*u,hy-3*u,4*u,7*u,'#d0d0d0');ell(g,hx,hy-14*u,20*u,8*u,'#6d6256');g.fillStyle='#5d5347';g.beginPath();g.ellipse(hx+7*u,hy-10*u,14*u,4*u,.12,0,Math.PI*2);g.fill();}
  else if(kind==='worker'){ell(g,hx,hy-14*u,21*u,9*u,'#6b6b6b');g.fillStyle='#595959';g.beginPath();g.ellipse(hx+8*u,hy-10*u,14*u,4*u,.15,0,Math.PI*2);g.fill();ell(g,hx,hy-19*u,4*u,2*u,'#7d7d7d');
    g.fillStyle='rgba(80,60,50,.35)';for(let k=0;k<10;k++)ell(g,hx-10*u+(k*7%20)*u,hy+11*u+(k*3%6)*u,.8*u,.8*u);}
  else if(kind==='student'){g.beginPath();g.moveTo(hx-18*u,hy);g.quadraticCurveTo(hx-16*u,hy-24*u,hx,hy-22*u);g.quadraticCurveTo(hx+16*u,hy-24*u,hx+18*u,hy);g.quadraticCurveTo(hx+8*u,hy-14*u,hx-18*u,hy);g.fillStyle='#a0522d';g.fill();
    g.save();g.translate(hx+3*u,hy-21*u);g.rotate(-.2);ell(g,0,0,17*u,6*u,'#c0392b');ell(g,0,-5*u,2.2*u,2.2*u,'#8e1b1b');g.restore();}
  else if(kind==='revizor'){ell(g,hx-15*u,hy-4*u,4*u,7*u,'#9e9e9e');ell(g,hx+15*u,hy-4*u,4*u,7*u,'#9e9e9e');g.strokeStyle='#9e9e9e';g.lineWidth=1.5*u;g.beginPath();g.moveTo(hx-12*u,hy-16*u);g.quadraticCurveTo(hx,hy-22*u,hx+12*u,hy-15*u);g.stroke();}
  else if(kind==='valya'){ell(g,hx,hy-18*u,19*u,8*u,'#fff');g.fillStyle='#fff';for(let k=-3;k<=3;k++)ell(g,hx+k*5.5*u,hy-24*u,3.4*u,3.4*u);g.strokeStyle='#e3e3e3';g.lineWidth=1*u;ell(g,hx,hy-18*u,15*u,5*u);g.stroke();
    ell(g,hx-17*u,hy+6*u,2*u,2*u,'#f1c40f');ell(g,hx+17*u,hy+6*u,2*u,2*u,'#f1c40f');}
  // лицо
  const blink=(tk+cx*.013)%3.7<.12,ey=hy-1*u;g.fillStyle='#2b1d14';g.strokeStyle='#2b1d14';g.lineWidth=1.8*u;
  if(mood>0){for(const k of[-1,1]){g.beginPath();g.arc(hx+k*6.5*u,ey+1.5*u,3*u,Math.PI*1.15,Math.PI*1.85);g.stroke();}}
  else if(blink){for(const k of[-1,1]){g.beginPath();g.moveTo(hx+k*6.5*u-2.5*u,ey);g.lineTo(hx+k*6.5*u+2.5*u,ey);g.stroke();}}
  else{ell(g,hx-6.5*u,ey,2.3*u,2.6*u,'#2b1d14');ell(g,hx+6.5*u,ey,2.3*u,2.6*u,'#2b1d14');ell(g,hx-5.8*u,ey-.9*u,.8*u,.8*u,'#fff');ell(g,hx+7.2*u,ey-.9*u,.8*u,.8*u,'#fff');}
  if(mood<0){g.lineWidth=2*u;for(const k of[-1,1]){g.beginPath();g.moveTo(hx+k*10*u,ey-7*u);g.lineTo(hx+k*3*u,ey-4.5*u);g.stroke();}}
  else if(kind!=='police'&&kind!=='revizor'){g.lineWidth=1.4*u;g.strokeStyle='rgba(60,40,30,.6)';for(const k of[-1,1]){g.beginPath();g.moveTo(hx+k*9.5*u,ey-6.5*u);g.lineTo(hx+k*4*u,ey-7*u);g.stroke();}}
  if(kind==='intel'||kind==='revizor'){g.strokeStyle='#2b2b2b';g.lineWidth=1.6*u;const r=kind==='revizor'?5.5*u:4.8*u;for(const k of[-1,1]){g.beginPath();g.arc(hx+k*6.5*u,ey,r,0,Math.PI*2);g.stroke();}g.beginPath();g.moveTo(hx-1.7*u,ey);g.lineTo(hx+1.7*u,ey);g.stroke();}
  ell(g,hx-10*u,hy+6*u,4*u,2.6*u,'rgba(230,110,100,.35)');ell(g,hx+10*u,hy+6*u,4*u,2.6*u,'rgba(230,110,100,.35)');
  g.strokeStyle=shade(SKIN,-.3);g.lineWidth=1.4*u;g.beginPath();g.moveTo(hx,hy+1*u);g.quadraticCurveTo(hx+2.5*u,hy+5*u,hx-.5*u,hy+6*u);g.stroke();
  if(kind==='veteran'){g.fillStyle='#c8c8c8';g.beginPath();g.moveTo(hx-9*u,hy+10*u);g.quadraticCurveTo(hx,hy+5*u,hx+9*u,hy+10*u);g.quadraticCurveTo(hx,hy+8.5*u,hx-9*u,hy+10*u);g.fill();}
  if(kind==='police'){g.fillStyle='#5d4037';g.beginPath();g.moveTo(hx-8*u,hy+10*u);g.quadraticCurveTo(hx,hy+6*u,hx+8*u,hy+10*u);g.quadraticCurveTo(hx,hy+9*u,hx-8*u,hy+10*u);g.fill();}
  if(kind==='babka'){g.strokeStyle='rgba(120,80,60,.35)';g.lineWidth=1*u;for(const k of[-1,1]){g.beginPath();g.moveTo(hx+k*11*u,ey+3*u);g.lineTo(hx+k*13*u,ey+5*u);g.stroke();}}
  const my=hy+11*u;g.lineWidth=2*u;g.strokeStyle=kind==='valya'?'#c0392b':'#7a3b2e';
  if(talk>0&&Math.sin(tk*18)>0){ell(g,hx,my,4*u,3*u,'#7a2a20');}
  else if(mood>0){g.beginPath();g.arc(hx,my-3*u,6*u,Math.PI*.15,Math.PI*.85);g.stroke();}
  else if(mood<0){g.beginPath();g.arc(hx,my+4*u,5*u,Math.PI*1.2,Math.PI*1.8);g.stroke();}
  else{g.beginPath();g.moveTo(hx-4*u,my);g.quadraticCurveTo(hx,my+2.5*u,hx+4*u,my);g.stroke();}
  g.restore();}

/* ================= зал: стена, вывеска, прилавок, обстановка ================= */
// звезда (обстановка «за задания»)
function qStar(g,x0,y0,r,col){g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r;g.lineTo(x0+Math.cos(a)*rr,y0+Math.sin(a)*rr);}g.closePath();g.fillStyle=col;g.fill();}
return {drawPerson:drawPerson,SKIN:SKIN};
})();
/* ---- из «Рыбалки» (помощники рисования и mit — как есть) ---- */
var RY=(function(){
var PI=Math.PI;
function rnd(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function el(g,x,y,rx,ry,r){g.beginPath();g.ellipse(x,y,Math.abs(rx),Math.abs(ry),r||0,0,PI*2);}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();}
function lg(g,x0,y0,x1,y1,st){var gr=g.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)gr.addColorStop(st[i],st[i+1]);return gr;}
function rg(g,x,y,r0,r1,st){var gr=g.createRadialGradient(x,y,r0,x,y,r1);for(var i=0;i<st.length;i+=2)gr.addColorStop(st[i],st[i+1]);return gr;}
function blink(t,ph){var c=(t+ph)%4.3;return c<.12?1-Math.abs(c-.06)/.06:0;}
function shade(night,c,k){return night?mix(c,'#1b2440',k||.45):c;}
function hx(c){c=c.replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];var n=parseInt(c,16);return [n>>16&255,n>>8&255,n&255];}
function mix(a,b,k){var x=hx(a),y=hx(b);return 'rgb('+Math.round(x[0]+(y[0]-x[0])*k)+','+Math.round(x[1]+(y[1]-x[1])*k)+','+Math.round(x[2]+(y[2]-x[2])*k)+')';}
function lim(v,a,b){return v<a?a:v>b?b:v;}
function mit(g,x,y,s,t,o){o=o||{};var k=s/100,N=!!o.night,face=o.face||'smile';
  var C={shirt:shade(N,'#7b8c5a'),shirtD:shade(N,'#5d6b42'),skin:shade(N,'#e6b892',.35),skinD:shade(N,'#c99572',.35),beard:shade(N,'#f1f1ec',.3),cap:shade(N,'#3d4752'),capD:shade(N,'#28303a'),pants:shade(N,'#4b4036'),boot:shade(N,'#2a2420')};
  g.save();g.translate(x,y);g.scale(k,k);
  if(!o.bust){g.fillStyle='rgba(0,0,0,.2)';el(g,0,0,22,4.5);g.fill();
    g.fillStyle=C.pants;rr(g,-11,-40,10,36,4);g.fill();rr(g,1,-40,10,36,4);g.fill();g.fillStyle=C.boot;rr(g,-13,-7,13,7,3);g.fill();rr(g,0,-7,13,7,3);g.fill();
    // палка
    g.strokeStyle=shade(N,'#8a6a42');g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(-26,0);g.lineTo(-22,-56);g.stroke();g.beginPath();g.arc(-19,-56,3.4,PI,PI*1.9);g.stroke();}
  var br=Math.sin(t*1.5)*.6;
  // рубаха
  g.fillStyle=lg(g,-18,0,18,0,[0,C.shirtD,.4,C.shirt,1,C.shirtD]);g.beginPath();g.moveTo(-17,-36);g.quadraticCurveTo(-20,-58,-16,-70+br);g.quadraticCurveTo(0,-76,16,-70+br);g.quadraticCurveTo(20,-58,17,-36);g.quadraticCurveTo(0,-32,-17,-36);g.fill();
  g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=1;g.beginPath();g.moveTo(-17,-44);g.quadraticCurveTo(0,-41,17,-44);g.stroke(); // поясок
  g.strokeStyle=shade(N,'#b8402e');g.lineWidth=2.2;g.beginPath();g.moveTo(-17,-43);g.quadraticCurveTo(0,-40,17,-43);g.stroke();
  // руки
  if(!o.bust){g.strokeStyle=C.shirt;g.lineWidth=8.5;g.lineCap='round';g.beginPath();g.moveTo(-15,-66);g.quadraticCurveTo(-24,-60,-22,-52);g.stroke();g.fillStyle=C.skin;el(g,-22,-54,4,4.2);g.fill();
    if(o.arm==='point'){g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(28,-72,36,-80);g.stroke();g.fillStyle=C.skin;el(g,37,-81,4,4.2);g.fill();}
    else{g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(22,-54,19,-42);g.stroke();g.fillStyle=C.skin;el(g,19,-41,4,4.2);g.fill();}}
  else if(o.arm==='point'){g.strokeStyle=C.shirt;g.lineWidth=8.5;g.lineCap='round';g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(26,-74,30,-84);g.stroke();g.fillStyle=C.skin;el(g,31,-86,4,4.4);g.fill();g.strokeStyle=C.skin;g.lineWidth=2.4;g.beginPath();g.moveTo(32,-89);g.lineTo(34,-95);g.stroke();}
  // голова
  g.save();g.translate(0,-86+br*.3);g.rotate(Math.sin(t*.8)*.03);
  g.fillStyle=C.skinD;el(g,-11.6,0,2.8,3.8);g.fill();el(g,11.6,0,2.8,3.8);g.fill();
  g.fillStyle=rg(g,-3,-3,2,15,[0,mix(C.skin,'#fff',.12),1,C.skin]);el(g,0,0,11.5,13);g.fill();
  // борода
  g.fillStyle=lg(g,0,2,0,26,[0,C.beard,1,mix(C.beard,'#b9b9b0',.5)]);g.beginPath();g.moveTo(-11,1);g.bezierCurveTo(-13,14,-7,26,0,28);g.bezierCurveTo(7,26,13,14,11,1);g.bezierCurveTo(6,8,-6,8,-11,1);g.fill();
  g.strokeStyle='rgba(150,150,140,.5)';g.lineWidth=.7;for(var i=-2;i<=2;i++){g.beginPath();g.moveTo(i*3,10);g.quadraticCurveTo(i*3.4,18,i*2,25);g.stroke();}
  g.fillStyle=C.beard;g.beginPath();g.moveTo(.4,4.5);g.bezierCurveTo(-4,3.6,-8,5,-8.5,8.2);g.bezierCurveTo(-5,7.4,-2,7.6,.4,7);g.bezierCurveTo(3,7.6,6,7.4,9,8.2);g.bezierCurveTo(8,5,4,3.6,.4,4.5);g.fill();
  g.fillStyle=shade(N,'#e09484',.35);el(g,.4,2.6,2.8,3.2);g.fill();
  // глаза — добрые щёлочки, очки
  var bl=blink(t,2.4);g.strokeStyle=shade(N,'#2a211b');g.lineWidth=1.3;g.lineCap='round';
  if(bl>.5||face==='smile'){g.beginPath();g.arc(-4.6,-1.5,2.2,PI*1.15,PI*1.85);g.stroke();g.beginPath();g.arc(4.6,-1.5,2.2,PI*1.15,PI*1.85);g.stroke();}
  else{g.fillStyle=shade(N,'#2a211b');el(g,-4.6,-1.6,1.4,1.7);g.fill();el(g,4.6,-1.6,1.4,1.7);g.fill();}
  g.strokeStyle=shade(N,'#8a7a5a');g.lineWidth=1;el(g,-4.6,-1.6,3.6,3.2);g.stroke();el(g,4.6,-1.6,3.6,3.2);g.stroke();g.beginPath();g.moveTo(-1,-1.8);g.lineTo(1,-1.8);g.stroke();
  g.strokeStyle=C.beard;g.lineWidth=2;g.beginPath();g.moveTo(-8,-6);g.quadraticCurveTo(-5,-7.6,-2,-6);g.moveTo(2,-6);g.quadraticCurveTo(5,-7.6,8,-6);g.stroke();
  // картуз
  g.fillStyle=lg(g,0,-19,0,-6,[0,mix(C.cap,'#fff',.1),1,C.cap]);g.beginPath();g.moveTo(-12.5,-6.5);g.lineTo(-13.5,-15);g.quadraticCurveTo(0,-21,13.5,-15);g.lineTo(12.5,-6.5);g.quadraticCurveTo(0,-9,-12.5,-6.5);g.fill();
  g.fillStyle=C.capD;g.beginPath();g.moveTo(-11.5,-7);g.quadraticCurveTo(-2,-1,9,-6.6);g.quadraticCurveTo(-1,-4.6,-11.5,-7);g.fill();g.fillStyle=shade(N,'#1f252c');g.fillRect(-12.8,-9.4,25.6,2);
  g.restore();g.restore();}
return {mit:mit,PI:PI,el:el,shade:shade};
})();
var URL={};
function cv(){var c=document.createElement('canvas');c.width=400;c.height=440;return c;}
function draw(id,m){var k=id+':'+m;if(URL[k])return URL[k];var c=cv(),g=c.getContext('2d');if(!g)return '';g.scale(2,2);
 if(id==='valya'){var u=2.7,tk=0.05;GA.drawPerson(g,'valya',100,262,u*100,m==='happy'?1:0,tk,m==='wow'?1:0);
  if(m==='sad'){ // в Гастрономе mood<0 — сердитая; грустную рисуем поверх обычной в её же цветах: брови домиком, уголки рта вниз
   var hy=262+Math.sin(tk*2+100*.01)*1.2*u-60*u,ey=hy-u,my=hy+11*u;g.save();g.lineCap='round';g.strokeStyle=GA.SKIN;g.lineWidth=3.4*u;
   g.beginPath();g.moveTo(100-4.5*u,my);g.quadraticCurveTo(100,my+2.5*u,100+4.5*u,my);g.stroke();
   g.beginPath();g.moveTo(100-9.5*u,ey-6.5*u);g.lineTo(100-4*u,ey-7*u);g.moveTo(100+9.5*u,ey-6.5*u);g.lineTo(100+4*u,ey-7*u);g.stroke();
   g.strokeStyle='rgba(60,40,30,.6)';g.lineWidth=1.4*u;g.beginPath();g.moveTo(100-10*u,ey-5.5*u);g.lineTo(100-4*u,ey-8*u);g.moveTo(100+10*u,ey-5.5*u);g.lineTo(100+4*u,ey-8*u);g.stroke();
   g.strokeStyle='#c0392b';g.lineWidth=2*u;g.beginPath();g.arc(100,my+4*u,5*u,Math.PI*1.2,Math.PI*1.8);g.stroke();g.restore();}}
 else if(id==='mityai'){var s=360,x=100,y=100+86*3.6;RY.mit(g,x,y,s,0,{bust:true,face:m==='happy'?'smile':'norm'});
  if(m==='sad'||m==='wow'){g.save();g.translate(x,y);g.scale(3.6,3.6);g.translate(0,-86);g.lineCap='round';
   g.strokeStyle='#e6b892';g.lineWidth=3.2;g.beginPath();g.moveTo(-8,-6);g.quadraticCurveTo(-5,-7.6,-2,-6);g.moveTo(2,-6);g.quadraticCurveTo(5,-7.6,8,-6);g.stroke();
   g.strokeStyle='#f1f1ec';g.lineWidth=2;g.beginPath();
   if(m==='sad'){g.moveTo(-8,-5.6);g.lineTo(-2.2,-8);g.moveTo(8,-5.6);g.lineTo(2.2,-8);}
   else{g.moveTo(-8,-8);g.quadraticCurveTo(-5,-10,-2,-8.4);g.moveTo(2,-8.4);g.quadraticCurveTo(5,-10,8,-8);}
   g.stroke();if(m==='wow'){g.fillStyle='#6b2a22';RY.el(g,.4,10.4,1.9,2.4);g.fill();}g.restore();}}
 try{return URL[k]=c.toDataURL('image/png');}catch(e){return '';}}
function img(id,m,y){return '<image href="'+draw(id,m||'norm')+'" x="0" y="'+(y||0)+'" width="200" height="220"/>';}
function bust(id,m){return '<svg viewBox="0 0 200 220" class="bust" data-pv="'+id+'/'+(m||'norm')+'" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'+img(id,m)+'</svg>';}
function head(id,m,bg){return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="overflow:hidden" data-pv="'+id+'/'+(m||'norm')+'"><rect width="200" height="200" fill="'+(bg||'#f1ede2')+'"/>'+img(id,m,-8)+'</svg>';}
function face(id,cls){return '<svg class="ic face'+(cls?' '+cls:'')+'" viewBox="34 6 132 150" aria-hidden="true" focusable="false">'+img(id,'norm')+'</svg>';}
window.KIN={ids:{valya:1,mityai:1},bust:bust,head:head,face:face,draw:draw};
})();
