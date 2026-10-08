'use strict';
/* ================= «🎪 Забавы» (BG0): рисунки кодом в стиле art.js — балаган, Кот Учёный, сундуки старосты, пирог на лопате, украшение «Дуб с цепью» =================
   Только art(...) — глобальных имён нет (ключи ART с приставкой zb_). Примитивы art.js: ell/poly/shp/ln/rrect/glow/shine/grad/outline. */
(function(){
const R=(g,x,y,w,h,r,col,lw)=>{rrect(g,x,y,w,h,r);g.fillStyle=grad(g,x+w/2,y+h/2,Math.max(w,h)/2,col);g.fill();outline(g,col,lw||1);};
/* балаган ярмарки (плитка «Забавы») */
art('zb_tent',44,g=>{ell(g,0,18,19,4,'rgba(0,0,0,.18)',{ol:false,flat:true});
  for(let i=0;i<6;i++){const x0=-16+i*16/3;g.beginPath();g.moveTo(x0,17);g.lineTo(x0+16/3,17);g.lineTo(x0+16/3,-2);g.lineTo(x0,-2);g.closePath();g.fillStyle=i%2?'#fff4dc':'#d8382e';g.fill();}
  g.beginPath();g.rect(-16,-2,32,19);g.strokeStyle='#6a2a14';g.lineWidth=1.2;g.stroke();
  g.beginPath();g.moveTo(-5,17);g.quadraticCurveTo(0,4,5,17);g.closePath();g.fillStyle='#3a1a10';g.fill();
  for(let i=0;i<6;i++){const a0=-16+i*16/3;g.beginPath();g.moveTo(a0,-2);g.lineTo(a0+16/3,-2);g.lineTo(0,-17);g.closePath();g.fillStyle=i%2?'#ffe9a8':'#e8433a';g.fill();g.strokeStyle='#6a2a14';g.lineWidth=.8;g.stroke();}
  for(let i=0;i<6;i++){g.beginPath();g.arc(-16+i*16/3+8/3,-2,8/3,0,Math.PI);g.fillStyle=i%2?'#d8382e':'#ffe9a8';g.fill();g.strokeStyle='#6a2a14';g.lineWidth=.6;g.stroke();}
  ln(g,[0,-17,0,-22],'#6a4022',1.4);g.beginPath();g.moveTo(0,-22);g.lineTo(9,-20.5);g.lineTo(0,-18.5);g.closePath();g.fillStyle='#ffd23a';g.fill();g.strokeStyle='#8a5a10';g.lineWidth=.7;g.stroke();
  shine(g,-6,-8,3,1.5,.35);});
/* Кот Учёный: сидит, в круглых очках, лапами держит свиток */
function kot(g,blink){ell(g,0,36,24,5,'rgba(0,0,0,.18)',{ol:false,flat:true});
  g.lineCap='round';g.strokeStyle='#4a4a5c';g.lineWidth=8;g.beginPath();g.moveTo(14,28);g.bezierCurveTo(34,26,34,4,24,-4);g.stroke();g.strokeStyle='#6e6e84';g.lineWidth=5.6;g.stroke();
  for(const t of[.3,.6,.85]){const x=14+(34-14)*t*1.2,y=28-32*t;ell(g,Math.min(30,x),y,2.4,1.2,'#4a4a5c',{ol:false,flat:true});}
  ell(g,0,16,19,21,'#7a7a90',{lw:1.4});ell(g,0,21,11,14,'#d0d0dc',{ol:false});
  g.strokeStyle='rgba(40,40,60,.45)';g.lineWidth=1.6;for(const s of[-1,1])for(const y of[6,13,20]){g.beginPath();g.moveTo(s*17,y);g.quadraticCurveTo(s*12,y+2,s*10,y+6);g.stroke();}
  for(const s of[-1,1]){poly(g,[s*15,-18,s*13,-36,s*3,-25],'#7a7a90',{lw:1.3});poly(g,[s*12.5,-21,s*11.6,-31,s*5.5,-24.5],'#f0a8b8',{ol:false,flat:true});}
  ell(g,0,-12,17,15,'#7a7a90',{lw:1.4});
  g.strokeStyle='rgba(40,40,60,.4)';g.lineWidth=1.4;for(const x of[-4,0,4]){g.beginPath();g.moveTo(x,-26);g.lineTo(x*.8,-21);g.stroke();}
  ell(g,0,-5,8,5.6,'#e4e4ec',{ol:false});
  for(const s of[-1,1]){if(blink){g.strokeStyle='#2a2a34';g.lineWidth=1.6;g.beginPath();g.moveTo(s*6-3,-13);g.quadraticCurveTo(s*6,-11,s*6+3,-13);g.stroke();}
    else{ell(g,s*6.5,-13,3.6,4,'#e8f070',{lw:.8});ell(g,s*6.5,-13,1.3,3,'#1a1a22',{ol:false,flat:true});shine(g,s*6.5-1,-14.5,1,1,.8);}}
  g.strokeStyle='#c8961e';g.lineWidth=1.5;for(const s of[-1,1]){g.beginPath();g.arc(s*6.5,-13,5.6,0,TAU);g.stroke();}g.beginPath();g.moveTo(-1,-13.5);g.quadraticCurveTo(0,-15,1,-13.5);g.stroke();
  g.beginPath();g.moveTo(-17,-14);g.lineTo(-12,-13.5);g.moveTo(17,-14);g.lineTo(12,-13.5);g.stroke();
  poly(g,[-2,-7.6,2,-7.6,0,-5.4],'#e87890',{ol:false,flat:true});
  g.strokeStyle='#3a2a2a';g.lineWidth=1;g.beginPath();g.moveTo(0,-5.4);g.lineTo(0,-3.6);g.moveTo(-3.6,-2.6);g.quadraticCurveTo(-1.8,-1.4,0,-3.6);g.quadraticCurveTo(1.8,-1.4,3.6,-2.6);g.stroke();
  g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=.7;for(const s of[-1,1])for(const d of[-1.5,.5,2.5]){g.beginPath();g.moveTo(s*6,-4+d*.6);g.lineTo(s*19,-6+d*2);g.stroke();}
  // свиток в лапах
  ell(g,-13,15,3,6,'#e8d29a',{lw:.8});ell(g,13,15,3,6,'#e8d29a',{lw:.8});rrect(g,-13,9.5,26,11,1.5);g.fillStyle=grad(g,0,15,14,'#fff2cf');g.fill();outline(g,'#d8b878',.9);
  g.strokeStyle='rgba(120,80,30,.55)';g.lineWidth=.8;for(const y of[12.5,15,17.5]){g.beginPath();g.moveTo(-9,y);g.lineTo(9,y);g.stroke();}
  for(const s of[-1,1])ell(g,s*9,20,5,3.6,'#8a8aa0',{lw:1});
  ell(g,-8,35,5.4,3.6,'#8a8aa0',{lw:1});ell(g,8,35,5.4,3.6,'#8a8aa0',{lw:1});}
art('zb_kot',80,g=>kot(g,false));art('zb_kot_b',80,g=>kot(g,true));
art('zb_i2',80,g=>{glow(g,0,0,38,'#ffd84a');kot(g,false);});
/* сундуки старосты: три сундука (плитка №11) и один открытый */
function chest(g,x,y,s,col,open){g.save();g.translate(x,y);g.scale(s,s);ell(g,0,12,15,3.5,'rgba(0,0,0,.2)',{ol:false,flat:true});
  R(g,-13,-3,26,15,2.5,col,1.3);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-13,1,26,2);
  for(const x0 of[-9,7])R(g,x0,-3,2.4,15,.6,'#e0a92e',.6);
  if(open){g.save();g.translate(0,-3);g.rotate(-.18);R(g,-13,-12,26,10,3,col,1.2);g.restore();g.fillStyle='#3a1a08';g.fillRect(-12,-4.2,24,2.6);}
  else{shp(g,col,{lw:1.3},[-13,-12,13,-3],()=>{g.moveTo(-13,-3);g.lineTo(-13,-7);g.quadraticCurveTo(0,-14,13,-7);g.lineTo(13,-3);g.closePath();});R(g,-2.6,-5,5.2,5,1,'#ffd84a',.6);}
  g.restore();}
art('zb_i11',48,g=>{glow(g,0,-2,22,'#ffd84a');chest(g,-12,6,.62,'#8a4a22',false);chest(g,12,6,.62,'#2a5a8a',false);chest(g,0,0,.8,'#a8302a',true);});
art('zb_chest_r',40,g=>chest(g,0,0,1.2,'#a8302a',false));art('zb_chest_b',40,g=>chest(g,0,0,1.2,'#2a5a8a',false));art('zb_chest_g',40,g=>chest(g,0,0,1.2,'#3a7a3a',false));
art('zb_chest_ro',40,g=>chest(g,0,0,1.2,'#a8302a',true));art('zb_chest_bo',40,g=>chest(g,0,0,1.2,'#2a5a8a',true));art('zb_chest_go',40,g=>chest(g,0,0,1.2,'#3a7a3a',true));
/* староста: борода, шапка, посох */
art('zb_starosta',90,g=>{ell(g,0,40,22,5,'rgba(0,0,0,.18)',{ol:false,flat:true});
  ln(g,[22,40,26,-30],'#7a4a22',3.4);ell(g,26,-32,3.6,3.6,'#9a6a32');
  shp(g,'#3a6ab8',{lw:1.4},[-20,-6,20,40],()=>{g.moveTo(-14,-4);g.lineTo(14,-4);g.lineTo(20,40);g.lineTo(-20,40);g.closePath();});
  g.fillStyle='#e0a92e';g.fillRect(-18,18,36,3.4);ell(g,0,19.6,3,3,'#ffd84a');
  for(const s of[-1,1])ell(g,s*17,8,5,11,'#3a6ab8',{lw:1.2,rot:s*-.3});ell(g,21,6,4,4,'#f2c49a');ell(g,-19,14,4,4,'#f2c49a');
  ell(g,0,-16,12,13,'#f2c49a',{lw:1.2});
  shp(g,'#f4f4f4',{lw:1,olc:'#a8a8b0'},[-12,-14,12,14],()=>{g.moveTo(-12,-14);g.quadraticCurveTo(-14,4,0,14);g.quadraticCurveTo(14,4,12,-14);g.quadraticCurveTo(6,-8,0,-10);g.quadraticCurveTo(-6,-8,-12,-14);});
  ell(g,0,-14,6,2.6,'#f4f4f4',{olc:'#a8a8b0',lw:.8});
  ell(g,-4.5,-19,1.4,1.8,'#2a1a10',{ol:false,flat:true});ell(g,4.5,-19,1.4,1.8,'#2a1a10',{ol:false,flat:true});ell(g,0,-15.6,2.2,1.8,'#e8a080',{ol:false});
  g.strokeStyle='#f4f4f4';g.lineWidth=2.2;g.beginPath();g.moveTo(-8,-23);g.lineTo(-2,-22);g.moveTo(8,-23);g.lineTo(2,-22);g.stroke();
  shp(g,'#a8302a',{lw:1.2},[-13,-40,13,-25],()=>{g.moveTo(-13,-26);g.quadraticCurveTo(-12,-40,0,-40);g.quadraticCurveTo(12,-40,13,-26);g.closePath();});
  rrect(g,-14,-29,28,6,3);g.fillStyle=grad(g,0,-26,14,'#7a5a3a');g.fill();outline(g,'#7a5a3a',.9);});
/* пирог на деревянной лопате (плитка №13) */
art('zb_i13',48,g=>{glow(g,0,0,22,'#ffb84a');ln(g,[14,14,24,22],'#8a5a2e',4);ell(g,0,4,17,9,'#c8904a',{lw:1.2});
  shp(g,'#e0a040',{hl:.5},[-12,-6,12,8],()=>{g.moveTo(-12,6);g.quadraticCurveTo(-12,-8,0,-8);g.quadraticCurveTo(12,-8,12,6);g.closePath();});
  g.strokeStyle='rgba(120,60,10,.6)';g.lineWidth=1;for(const x of[-5,0,5]){g.beginPath();g.moveTo(x-2,-3);g.lineTo(x+2,1);g.stroke();}shine(g,-5,-4,4,1.6,.5);
  for(const [x,y] of[[-6,-14],[0,-17],[6,-14]]){g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.2;g.beginPath();g.moveTo(x,y+4);g.quadraticCurveTo(x-2,y+2,x,y);g.quadraticCurveTo(x+2,y-2,x,y-4);g.stroke();}});
/* украшение Терема «Дуб с цепью» (неделя загадок) */
function oak(g,s){g.save();g.scale(s,s);ell(g,0,28,26,5,'rgba(0,0,0,.18)',{ol:false,flat:true});
  shp(g,'#7a4a22',{lw:1.3},[-8,-10,8,28],()=>{g.moveTo(-6,-6);g.lineTo(-7,20);g.quadraticCurveTo(-12,27,-15,28);g.lineTo(15,28);g.quadraticCurveTo(10,27,7,20);g.lineTo(6,-6);g.closePath();});
  for(const [x,y,r,c] of[[-14,-12,13,'#3f8a2e'],[13,-12,13,'#3f8a2e'],[0,-22,15,'#4a9a36'],[-6,-6,11,'#56a83e'],[8,-4,10,'#56a83e']])ell(g,x,y,r,r*.85,c,{lw:1.1});
  for(const [x,y] of[[-12,-6],[9,-14],[2,-2]])ell(g,x,y,1.8,2.2,'#c88a2a',{lw:.5});
  g.strokeStyle='#e0b02e';g.lineWidth=1.4;for(let i=0;i<9;i++){const a=Math.PI*.08+i*Math.PI*.105,x=Math.cos(a)*9,y=10+Math.sin(a)*3.4;g.beginPath();g.ellipse(x,y,1.6,1.1,a,0,TAU);g.stroke();}
  g.restore();}
art('zb_dub',64,g=>oak(g,1));
})();
