'use strict';
/* OB:MG0 рисунки «Дозорной избы» и мини-игр (кодом, в стиле art.js: градиенты, мягкий контур, блики).
   Ключи: mg_izba (изба с вышкой), mg_bell, mg_book, mg_krot / mg_krotL (крот-оборотень / вожак в шлеме), mg_ezh (ёжик-помощник),
   mg_shovel, mg_lantern, mg_scroll, mg_i<num> — значки 14 игр (медальоны), mg_lock.
   Облики застав «Дозорный» (dozor) и «Сторожевой» (storozh) — ветки skinCanvas (обёртка ниже). Знамёна книги — xbnAdd в mg-core.js. */

/* ---------- изба с дозорной вышкой и колоколом ---------- */
function mgBell(g,x,y,s,swing){g.save();g.translate(x,y);g.rotate(swing||0);
  ln(g,[0,-s*.95,0,-s*.7],'#5a3a1a',s*.12);
  shp(g,'#e8b43a',{hl:.6},[-s*.6,-s*.75,s*.6,s*.35],()=>{g.moveTo(-s*.36,-s*.55);g.quadraticCurveTo(-s*.38,-s*.8,0,-s*.8);g.quadraticCurveTo(s*.38,-s*.8,s*.36,-s*.55);
    g.quadraticCurveTo(s*.4,s*.05,s*.62,s*.28);g.lineTo(-s*.62,s*.28);g.quadraticCurveTo(-s*.4,s*.05,-s*.36,-s*.55);g.closePath();});
  ell(g,0,s*.3,s*.62,s*.12,'#c8902a',{lw:s*.05});ell(g,0,s*.42,s*.13,s*.13,'#8a5a1a',{lw:s*.04});shine(g,-s*.18,-s*.4,s*.08,s*.22,.55);g.restore();}
function mgIzba(g,o){o=o||{};const ph=o.ph||0,lit=o.lit!=null?o.lit:1;
  ell(g,0,40,52,8,'rgba(0,0,0,.22)',{ol:false,flat:true});
  // вышка (справа): четыре столба, раскосы, площадка, шатёр с колоколом
  const tx=20;for(const x of[tx-12,tx+12]){rrect(g,x-2.2,-40,4.4,78,1.5);g.fillStyle=grad(g,x,0,10,'#8a5a30');g.fill();outline(g,'#8a5a30',.7);}
  g.strokeStyle='#6a4222';g.lineWidth=1.6;for(let y=-34;y<30;y+=17){g.beginPath();g.moveTo(tx-12,y);g.lineTo(tx+12,y+17);g.moveTo(tx+12,y);g.lineTo(tx-12,y+17);g.stroke();}
  rrect(g,tx-17,-44,34,6,1.6);g.fillStyle=grad(g,tx,-41,18,'#a8743e');g.fill();outline(g,'#a8743e',.8);
  for(let x=tx-15;x<=tx+13;x+=4.7){rrect(g,x,-52,2.4,9,1);g.fillStyle='#9a6a3a';g.fill();}ln(g,[tx-16,-50,tx+16,-50],'#6a4222',1.2);
  for(const x of[tx-14,tx+14])ln(g,[x,-52,x,-66],'#7a4a22',2.2);
  mgBell(g,tx,-58,8,Math.sin(ph*2.2)*.12);
  shp(g,'#b8322e',{hl:.4},[tx-21,-86,tx+21,-64],()=>{g.moveTo(tx-21,-64);g.quadraticCurveTo(tx-8,-70,tx,-86);g.quadraticCurveTo(tx+8,-70,tx+21,-64);g.closePath();});
  for(let i=-2;i<=2;i++)ln(g,[tx+i*7.5,-64.5,tx+i*2.6,-80],'rgba(90,20,10,.45)',.7);
  ln(g,[tx,-86,tx,-98],'#5a3a1a',1.2);const fw=Math.sin(ph*3)*1.5;
  shp(g,'#2f8a4a',{hl:.4},[tx,-98,tx+14,-89],()=>{g.moveTo(tx,-98);g.quadraticCurveTo(tx+7,-99+fw,tx+14,-96+fw);g.lineTo(tx+10,-93.5+fw*.5);g.lineTo(tx+14,-90+fw);g.quadraticCurveTo(tx+7,-92+fw,tx,-90);g.closePath();});
  ell(g,tx,-99,1.6,1.6,'#e6b53a',{lw:.4});
  // изба (слева): сруб, резные наличники, светлое окно, крыльцо
  woodWall(g,-46,-4,46,40,'#a46a36');
  for(let y=0;y<36;y+=5.6){ell(g,-46,y+2.6,2.6,2.6,'#c8945a',{lw:.5});ell(g,0,y+2.6,2.6,2.6,'#c8945a',{lw:.5});}
  shp(g,'#7a4a2a',{hl:.35},[-54,-34,8,-2],()=>{g.moveTo(-54,-2);g.lineTo(-23,-34);g.lineTo(8,-2);g.lineTo(3,-2);g.lineTo(-23,-28);g.lineTo(-49,-2);g.closePath();});
  shp(g,'#5f8f3a',{hl:.35},[-49,-28,3,-3],()=>{g.moveTo(-49,-3);g.lineTo(-23,-28);g.lineTo(3,-3);g.closePath();});
  g.strokeStyle='rgba(30,60,20,.35)';g.lineWidth=.8;for(let i=1;i<5;i++){const y=-28+i*5;g.beginPath();g.moveTo(-23-(y+28)*1.02,y);g.lineTo(-23+(y+28)*1.02,y);g.stroke();}
  // конёк-конь и полотенце-причелина
  shp(g,'#c8945a',{},[-27,-42,-19,-30],()=>{g.moveTo(-23,-30);g.lineTo(-24,-37);g.quadraticCurveTo(-27,-41,-22,-42);g.quadraticCurveTo(-18,-41,-20,-37);g.lineTo(-21,-30);g.closePath();});
  ell(g,-23,-14,6,6,'#fff6e0',{lw:.7});ell(g,-23,-14,4.3,4.3,'#f3d9a0',{ol:false,flat:true});
  // окно: днём — стекло, вечером — тёплый свет
  const wx=-23,wy=8;rrect(g,wx-8,wy-7,16,13,1.5);g.fillStyle='#e8d0a0';g.fill();outline(g,'#e8d0a0',1);
  if(lit){glow(g,wx,wy,16*lit,'#ffc94a','#fff4c0');}
  rrect(g,wx-6,wy-5,12,9,1);g.fillStyle=lit?'#ffd76a':'#7ab8d8';g.fill();ln(g,[wx,wy-5,wx,wy+4],'#8a5a30',1);ln(g,[wx-6,wy-.5,wx+6,wy-.5],'#8a5a30',1);
  shp(g,'#e8d0a0',{},[wx-10,wy-13,wx+10,wy-6],()=>{g.moveTo(wx-10,wy-7);g.quadraticCurveTo(wx,wy-14,wx+10,wy-7);g.lineTo(wx+8,wy-6);g.quadraticCurveTo(wx,wy-11,wx-8,wy-6);g.closePath();});
  // крыльцо и дверь — у вышки
  rrect(g,-8,12,10,24,2);g.fillStyle=grad(g,-3,22,10,'#6a4222');g.fill();outline(g,'#6a4222',.8);ell(g,0,24,1,1,'#e6b53a',{lw:.3});
  rrect(g,-11,34,16,4,1);g.fillStyle='#8a5a30';g.fill();
  // фонарь на столбе
  ln(g,[-50,38,-50,12],'#5a3a1a',1.8);ln(g,[-50,13,-56,13],'#5a3a1a',1.4);
  if(lit)glow(g,-56,19,9*lit,'#ffb43a');rrect(g,-58.5,15,5,7,1);g.fillStyle=lit?'#ffd86a':'#c8b080';g.fill();outline(g,'#8a6a2a',.6);}
art('mg_izba',110,g=>{g.translate(4,-2);mgIzba(g,{lit:1});});
art('mg_bell',30,g=>{mgBell(g,0,2,14,0);});

/* ---------- Дозорная книга, свиток, фонарь, замок ---------- */
art('mg_book',44,g=>{g.rotate(-.08);rrect(g,-15,-17,30,34,3);g.fillStyle=grad(g,0,0,20,'#8a2a22');g.fill();outline(g,'#8a2a22',1.3);
  rrect(g,-12,-14,24,28,2);g.strokeStyle='#e6b53a';g.lineWidth=1.1;g.stroke();
  for(const [x,y] of[[-12,-14],[12,-14],[-12,14],[12,14]])ell(g,x,y,2.2,2.2,'#e6b53a',{lw:.4});
  ell(g,0,-1,7,7,'#e6b53a',{hl:.6});mgBell(g,0,0,4.4,0);
  rrect(g,13,-15,4,30,1.5);g.fillStyle='#f3e2b4';g.fill();outline(g,'#c8a870',.6);shine(g,-8,-10,4,2,.25);});
art('mg_scroll',40,g=>{rrect(g,-11,-14,22,28,2);g.fillStyle=grad(g,0,0,16,'#f3e2b4');g.fill();outline(g,'#c8a870',1);
  for(const y of[-14,14]){ell(g,0,y,13,3.2,'#d8b67a',{lw:.8});}g.fillStyle='#8a5a30';g.font='900 18px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,1);});
art('mg_lantern',30,g=>{glow(g,0,2,14,'#ffb43a');ln(g,[0,-12,0,-8],'#5a3a1a',1.2);rrect(g,-5,-8,10,14,2);g.fillStyle='#ffd86a';g.fill();outline(g,'#8a6a2a',1);
  ln(g,[-5,-1,5,-1],'#8a6a2a',.8);poly(g,[-6,-8,0,-12,6,-8],'#5a4a3a',{lw:.6});ell(g,0,2,2,3,'#fff6c8',{ol:false,flat:true});});
art('mg_lock',32,g=>{g.beginPath();g.arc(0,-3,6.5,Math.PI,0);g.lineWidth=3;g.strokeStyle='#8a8a98';g.stroke();rrect(g,-9,-3,18,15,3);g.fillStyle=grad(g,0,4,12,'#c8a03a');g.fill();outline(g,'#c8a03a',1);
  ell(g,0,3,2,2,'#3a2a14',{ol:false,flat:true});rrect(g,-.8,3,1.6,5,.5);g.fillStyle='#3a2a14';g.fill();});

/* ---------- лопата, крот-оборотень, ёжик ---------- */
function mgShovel(g){g.save();ln(g,[0,-20,0,8],'#8a5a30',3.2);ln(g,[0,-20,0,8],'#b07a44',1.6);rrect(g,-4,-24,8,4,1.5);g.fillStyle='#6a4222';g.fill();
  shp(g,'#aab4c4',{hl:.6},[-7,6,7,24],()=>{g.moveTo(-6,7);g.lineTo(6,7);g.lineTo(7,17);g.quadraticCurveTo(0,26,-7,17);g.closePath();});shine(g,-2.5,12,1.5,4,.6);g.restore();}
art('mg_shovel',50,g=>{g.rotate(.5);mgShovel(g);});
function mgMole(g,o){o=o||{};const fur=o.fur||'#5a4a5a';
  // лапы с когтями — над землёй
  for(const s of[-1,1]){ell(g,s*14,8,6,4.5,shade(fur,.1),{rot:s*.4});for(let i=-1;i<=1;i++)poly(g,[s*14+i*3-1,10,s*14+i*3+1,10,s*14+i*3.4+s*.6,15],'#f3e8d0',{lw:.4});}
  ell(g,0,0,15,15,fur,{hl:.35});
  // мордочка и нос
  ell(g,0,6,8,6,'#c8a0a8',{lw:.8});ell(g,0,3.2,3.6,2.8,'#ff7aa0',{hl:.7,lw:.6});shine(g,-1,2.3,1.2,.7,.7);
  // глаза: злые щёлочки с красным огоньком (оборотень)
  eye(g,-5.5,-4,2.4,{col:o.eyes||'#b01020',angry:1,px:0,white:'#ffe8a0'});eye(g,5.5,-4,2.4,{col:o.eyes||'#b01020',angry:1,flipB:1,px:0,white:'#ffe8a0'});
  fangs(g,0,8.8,1.6);
  // шерсть на макушке
  g.strokeStyle=shade(fur,-.5);g.lineWidth=1.1;for(const a of[-.5,-.15,.2,.5]){g.beginPath();g.moveTo(Math.sin(a)*12,-12);g.lineTo(Math.sin(a)*16,-17.5);g.stroke();}
  if(o.helm){shp(g,'#9aa4b4',{hl:.6},[-14,-22,14,-6],()=>{g.moveTo(-14,-7);g.quadraticCurveTo(-14,-21,0,-22);g.quadraticCurveTo(14,-21,14,-7);g.closePath();});
    rrect(g,-15,-9,30,4,1.5);g.fillStyle='#e6b53a';g.fill();outline(g,'#e6b53a',.6);ln(g,[0,-22,0,-29],'#7a7a8a',1.4);ell(g,0,-30,2.2,2.2,'#e8433a',{lw:.4});shine(g,-6,-16,3,1.5,.6);}}
art('mg_krot',44,g=>{g.translate(0,2);mgMole(g);});
art('mg_krotL',48,g=>{g.translate(0,5);mgMole(g,{fur:'#4a3a52',helm:1,eyes:'#ff2a10'});});
function mgHog(g){// ёжик: колючки, мордочка, яблоко на спине
  const sp=[];for(let i=0;i<=16;i++){const a=Math.PI*.95+i/16*Math.PI*1.1,r=i%2?12:18;sp.push(Math.cos(a)*r+2,Math.sin(a)*r*.9+3);}
  sp.push(10,8,-8,10);poly(g,sp,'#7a5a3a',{hl:.3,lw:1});
  ell(g,10,5,8.5,7,'#e8c8a0',{lw:.9});ell(g,17.6,4,2.2,1.9,'#3a2a2a',{lw:.4});shine(g,17,3.3,.8,.5,.8);
  eye(g,11,2,1.8,{px:.6});ell(g,8,8,2,1.2,'#ff9ab0',{ol:false,flat:true});mouth(g,14,8,1.6,'#5a3a2a',1);
  ell(g,-1,-12,4.2,4,'#e8433a',{lw:.6});ln(g,[-1,-16,0,-18.5],'#5a3a1a',.9);ell(g,1.6,-18,1.8,.9,'#4aa04a',{lw:.3,rot:-.4});shine(g,-2.4,-13.4,1.2,.8,.6);
  for(const x of[-6,6])ell(g,x,12,3,2,'#c8a888',{lw:.5});}
art('mg_ezh',40,g=>{g.translate(-2,0);mgHog(g);});

/* ---------- значки игр: медальон-рамка + эмблема ---------- */
function mgMed(g,col){glow(g,0,0,22,'rgba(255,220,120,.35)');ell(g,0,0,19,19,'#e6b53a',{hl:.6,lw:1.4});ell(g,0,0,15.5,15.5,col,{hl:.35,lw:.9});}
const MG_EMB={
  1:g=>{mgMed(g,'#6a9a4a');ell(g,0,8,12,5,'#7a4a22',{lw:.8});ell(g,0,5,9,5.5,'#9a6a3a',{lw:.8});g.save();g.translate(3,-3);g.rotate(.6);g.scale(.62,.62);mgShovel(g);g.restore();},
  2:g=>{mgMed(g,'#7a9ac8');for(let i=-2;i<=2;i++){rrect(g,i*5-2.2,-10,4.4,20,1.6);g.fillStyle=grad(g,i*5,0,8,'#a8743e');g.fill();outline(g,'#a8743e',.6);poly(g,[i*5-2.2,-10,i*5,-14,i*5+2.2,-10],'#c8945a',{lw:.5});}ln(g,[-12,-3,12,-3],'#6a4222',1.2);ln(g,[-12,5,12,5],'#6a4222',1.2);},
  3:g=>{mgMed(g,'#c8a070');ell(g,-5,6,5,5,'#6a4222',{lw:.7});ell(g,-5,6,1.6,1.6,'#e6b53a',{lw:.3});g.save();g.rotate(-.5);rrect(g,-8,-3,20,8,3.5);g.fillStyle=grad(g,2,0,12,'#4a4a5a');g.fill();outline(g,'#4a4a5a',.8);ell(g,12,1,2,4,'#2a2a34',{lw:.5});g.restore();ell(g,8,-10,3,3,'#3a3a44',{hl:.6,lw:.5});},
  4:g=>{mgMed(g,'#2a3a6a');for(const [x,y] of[[-8,-6],[8,-4]]){glow(g,x,y,4,'#9aff8a');ell(g,x-1.4,y,1,1.2,'#eaffd0',{ol:false,flat:true});ell(g,x+1.4,y,1,1.2,'#eaffd0',{ol:false,flat:true});}
    g.save();g.rotate(.3);ln(g,[0,-2,0,12],'#8a5a30',2.6);glow(g,0,-6,9,'#ffb43a');shp(g,'#ff8a2a',{hl:.7},[-4,-13,4,-2],()=>{g.moveTo(0,-13);g.quadraticCurveTo(4,-7,3,-3);g.quadraticCurveTo(0,-1,-3,-3);g.quadraticCurveTo(-4,-7,0,-13);});g.restore();},
  5:g=>{mgMed(g,'#4a3378');rrect(g,-9,-1,18,10,2);g.fillStyle=grad(g,0,4,10,'#9a5a2a');g.fill();outline(g,'#9a5a2a',.8);shp(g,'#b06a34',{},[-9,-6,9,-1],()=>{g.moveTo(-9,-1);g.quadraticCurveTo(-9,-7,0,-7);g.quadraticCurveTo(9,-7,9,-1);g.closePath();});
    for(const x of[-5,5]){rrect(g,x-1.2,-7,2.4,16,.6);g.fillStyle='#e6b53a';g.fill();}glow(g,7,-9,6,'#5cff9a');ln(g,[2,-4,11,-13],'#d8e0e8',1.3);},
  6:g=>{mgMed(g,'#3a6a8a');g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=.8;g.beginPath();g.arc(0,2,9,0,TAU);g.stroke();for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*4,-6.5);g.lineTo(i*4,10.5);g.moveTo(-8.5,2+i*4);g.lineTo(8.5,2+i*4);g.stroke();}
    shp(g,'#6a3a8a',{hl:.4},[-12,-12,12,-2],()=>{g.moveTo(0,-6);g.quadraticCurveTo(-6,-13,-12,-8);g.quadraticCurveTo(-8,-6,-7,-3);g.quadraticCurveTo(-3,-6,0,-4);g.quadraticCurveTo(3,-6,7,-3);g.quadraticCurveTo(8,-6,12,-8);g.quadraticCurveTo(6,-13,0,-6);});ell(g,0,-6,2.6,2.6,'#6a3a8a',{lw:.4});},
  7:g=>{mgMed(g,'#3a7a4a');g.setLineDash([2.2,2]);ln(g,[-10,10,-4,4,3,6,6,-2,10,-8],'#fff4c0',1.6);g.setLineDash([]);poly(g,[10,-12,12.5,-6,7.5,-6],'#e8433a',{lw:.5});
    for(const [x,y] of[[-9,-6],[2,-10]]){poly(g,[x-4,y+4,x,y-4,x+4,y+4],'#2f6a3a',{lw:.5});}},
  8:g=>{mgMed(g,'#a85a2a');for(const [x,c] of[[-6,'#c8392f'],[6,'#2f6fd6']]){ell(g,x,5,4.6,6,c,{lw:.6});ell(g,x,-4,3.6,3.6,'#f4c9a3',{lw:.5});shp(g,c,{},[x-4,-11,x+4,-6],()=>{g.moveTo(x-4,-6);g.quadraticCurveTo(x,-12,x+4,-6);g.closePath();});}ln(g,[11,-12,11,10],'#8a5a30',1.2);poly(g,[9,-12,11,-16,13,-12],'#aab4c4',{lw:.4});},
  9:g=>{mgMed(g,'#8a3a2a');g.strokeStyle='rgba(255,236,160,.85)';g.lineWidth=1.2;for(const r of[11,14]){g.beginPath();g.arc(0,2,r,-2.4,-.7);g.stroke();}mgBell(g,0,2,9,0);},
  10:g=>{mgMed(g,'#6a4a8a');rrect(g,-8,-10,16,20,1.5);g.fillStyle=grad(g,0,0,12,'#f3e2b4');g.fill();outline(g,'#c8a870',.7);ell(g,0,-10,9.5,2.2,'#d8b67a',{lw:.5});ell(g,0,10,9.5,2.2,'#d8b67a',{lw:.5});
    g.fillStyle='#8a2a22';g.font='900 15px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,1);},
  11:g=>{mgMed(g,'#7a6a5a');shp(g,'#8a5a30',{},[-10,-10,10,12],()=>{g.moveTo(-10,12);g.lineTo(-10,-2);g.quadraticCurveTo(0,-12,10,-2);g.lineTo(10,12);g.closePath();});
    for(const x of[-5,0,5])ln(g,[x,-6+Math.abs(x)*.6,x,12],'#5a3a1e',.9);ln(g,[-11,3,11,3],'#c8a03a',2);ell(g,0,3,1.6,1.6,'#e6b53a',{lw:.4});},
  12:g=>{mgMed(g,'#5a7a6a');ln(g,[-12,-6,4,2],'#a8743e',3.4);ln(g,[-12,-6,4,2],'#c8945a',1.4);ln(g,[4,2,12,-2],'#a8743e',3.4);for(const [x,y] of[[-8,-9],[-1,-5],[7,4]])ell(g,x,y,2.8,2.8,'#3a3a44',{hl:.6,lw:.4});},
  13:g=>{mgMed(g,'#2a2a3a');ln(g,[-6,12,-6,-12],'#5a3a1a',1.4);shp(g,'#c8392f',{hl:.4},[-6,-12,9,-2],()=>{g.moveTo(-6,-12);g.lineTo(9,-10);g.lineTo(6,-7);g.lineTo(9,-4);g.lineTo(-6,-3);g.closePath();});
    g.save();g.translate(5,6);g.rotate(-.8);ln(g,[0,-9,0,6],'#d8e0e8',1.8);ln(g,[-3,3,3,3],'#e6b53a',1.4);g.restore();},
  14:g=>{mgMed(g,'#3a5a3a');for(let i=0;i<3;i++){const x=-5+i*5;glow(g,x,-8-i%2*2,4,'#9aff8a');}ell(g,0,2,11,8,'#2a2a30',{hl:.4,lw:.9});ell(g,0,-4,10,2.6,'#5ac85a',{hl:.6,lw:.6});
    for(const x of[-10,10])ln(g,[x,-3,x*1.25,-7],'#2a2a30',1.4);ell(g,-3,-4.5,1.4,1,'#d8ffb0',{ol:false,flat:true});}};
for(const n in MG_EMB)art('mg_i'+n,44,g=>{MG_EMB[n](g);});

/* ---------- облики застав «Дозорный» и «Сторожевой» (награды Дозорной книги): поверх силуэта, как skinCanvas в art.js ---------- */
{const sk0=skinCanvas;
skinCanvas=function(c,skin,k){if(skin!=='dozor'&&skin!=='storozh')return sk0(c,skin,k);
  const W=c.width,H=c.height,g=c.getContext('2d');let d;try{d=g.getImageData(0,0,W,H).data;}catch(e){return c;}
  const A=(x,y)=>d[(y*W+x)*4+3],up=Math.max(2,Math.round(k*2)),R=mulberry(W*17+skin.length*11);let x0=W,x1=0,y0=H,y1=0;const edge=[];
  for(let y=up;y<H;y++)for(let x=0;x<W;x++)if(A(x,y)>170){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(A(x,y-up)<40)edge.push([x,y]);}
  if(!edge.length)return c;const step=Math.max(1,Math.round(k*1.2)),seen={},E=[];for(const p of edge){const q=Math.floor(p[0]/step)+':'+Math.floor(p[1]/step);if(!seen[q]){seen[q]=1;E.push(p);}}
  g.save();g.setTransform(1,0,0,1,0,0);g.lineJoin='round';g.lineCap='round';
  if(skin==='dozor'){// тёплый вечерний отсвет, красно-белые вымпелы на верхушке, фонари на кромках
    g.globalCompositeOperation='source-atop';const q=g.createLinearGradient(0,y0,0,y1);q.addColorStop(0,'rgba(255,190,90,.22)');q.addColorStop(1,'rgba(90,40,10,.12)');g.fillStyle=q;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
    let top=E[0];for(const p of E)if(p[1]<top[1])top=p;const [px,py]=top,L=9*k;
    g.strokeStyle='#5a3a1a';g.lineWidth=.7*k;g.beginPath();g.moveTo(px,py);g.lineTo(px,py-L);g.stroke();
    for(let i=0;i<3;i++){g.beginPath();g.moveTo(px,py-L+i*2.1*k);g.lineTo(px+7*k-i*1.2*k,py-L+i*2.1*k+1*k);g.lineTo(px,py-L+i*2.1*k+2*k);g.closePath();g.fillStyle=i%2?'#fff4e8':'#d8302a';g.fill();}
    const side=E.filter(p=>p[1]>y0+(y1-y0)*.3&&p[1]<y0+(y1-y0)*.7);for(let i=0;i<Math.min(2,side.length);i++){const [x,y]=side[Math.floor(R()*side.length)];
      const gr=g.createRadialGradient(x,y+2.4*k,0,x,y+2.4*k,4.5*k);gr.addColorStop(0,'rgba(255,230,140,.95)');gr.addColorStop(.4,'rgba(255,170,60,.5)');gr.addColorStop(1,'rgba(255,170,60,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y+2.4*k,4.5*k,0,TAU);g.fill();
      g.fillStyle='#ffd86a';g.strokeStyle='#6a4a1a';g.lineWidth=.35*k;g.beginPath();g.rect(x-1*k,y+1.2*k,2*k,2.6*k);g.fill();g.stroke();}}
  else{// «Сторожевой»: воронёная сталь — холодный отлив, заклёпки по кромкам, щиток со звездой
    const t=mkCanvas(W,H),tg=t.getContext('2d');tg.drawImage(c,0,0);tg.globalAlpha=.42;tg.globalCompositeOperation='color';tg.fillStyle='#5a7090';tg.fillRect(0,0,W,H);
    tg.globalAlpha=1;tg.globalCompositeOperation='destination-in';tg.drawImage(c,0,0);g.clearRect(0,0,W,H);g.drawImage(t,0,0);
    g.globalCompositeOperation='source-atop';g.fillStyle='rgba(200,220,255,.1)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
    for(const [x,y] of E.filter((p,i)=>i%3===0)){g.fillStyle='#d8e0ec';g.beginPath();g.arc(x,y+.9*k,.8*k,0,TAU);g.fill();g.fillStyle='#4a5468';g.beginPath();g.arc(x+.25*k,y+1.15*k,.35*k,0,TAU);g.fill();}
    const cx=(x0+x1)/2,cy=y0+(y1-y0)*.62,r=3.4*k;g.beginPath();g.moveTo(cx-r,cy-r);g.lineTo(cx+r,cy-r);g.lineTo(cx+r,cy+r*.2);g.quadraticCurveTo(cx+r,cy+r*1.1,cx,cy+r*1.5);g.quadraticCurveTo(cx-r,cy+r*1.1,cx-r,cy+r*.2);g.closePath();
    g.fillStyle='#b8322e';g.fill();g.strokeStyle='#e6c25a';g.lineWidth=.6*k;g.stroke();g.fillStyle='#ffd84a';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.3:r*.7;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.95);}g.closePath();g.fill();}
  g.restore();return c;};}
