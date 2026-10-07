'use strict';
/* ================= Подворье — рисунки кодом (стиль js/art.js: градиенты, мягкий контур, блики) =================
   Только новые ключи с приставкой m_ (героев и нечисть не трогаем). Используется js/meta.js.
   Сцена подворья рисуется теми же функциями: metaArt(g,key,x,y,s) — рисунок key в точке (x,y) с масштабом s. */
function metaArt(g,key,x,y,s){const a=ART[key];if(!a)return;g.save();g.translate(x,y);g.scale(s,s);g.lineJoin='round';g.lineCap='round';try{a.fn(g);}catch(e){}g.restore();}
// бабушка — круглое лицо, красный платок в горошек, сарафан (те же пропорции, что у богатырей)
art('m_babka',56,g=>{
  ell(g,0,15,15,12,'#3a6ab8');rrect(g,-13,10,26,4,1.5);g.fillStyle='#f4efe2';g.fill(); // сарафан и передник
  shp(g,'#f4efe2',{hl:.2},[-8,8,8,26],()=>{g.moveTo(-8,9);g.lineTo(8,9);g.lineTo(9,25);g.quadraticCurveTo(0,27,-9,25);g.closePath();});
  ln(g,[-6,14,6,14],'#e0453a',1.2);ln(g,[-6,18,6,18],'#e0453a',1.2);
  ell(g,13,13,4.4,4.4,'#f2c6a0');ell(g,-13,13,4.4,4.4,'#f2c6a0');
  ell(g,0,-6,12.5,12,'#f2c6a0');
  shp(g,'#d0d4dc',{hl:.4},[-11,-14,11,-6],()=>{g.moveTo(-11,-7);g.quadraticCurveTo(-8,-14,0,-14);g.quadraticCurveTo(8,-14,11,-7);g.quadraticCurveTo(0,-10,-11,-7);}); // седые волосы
  shp(g,'#d8382e',{hl:.35},[-16,-25,16,4],()=>{g.moveTo(-14,2);g.quadraticCurveTo(-17,-24,0,-24);g.quadraticCurveTo(17,-24,14,2);g.quadraticCurveTo(12,-10,9,-13);g.quadraticCurveTo(0,-17,-9,-13);g.quadraticCurveTo(-12,-10,-14,2);}); // платок
  g.fillStyle='rgba(255,255,255,.85)';for(const [x,y] of[[-9,-17],[-3,-20],[4,-20],[10,-16],[-12,-8],[12,-8],[-6,-14],[6,-14]]){g.beginPath();g.arc(x,y,1.1,0,TAU);g.fill();}
  shp(g,'#d8382e',{},[-6,0,6,8],()=>{g.moveTo(-5,1);g.lineTo(0,5);g.lineTo(5,1);g.lineTo(3,8);g.lineTo(0,5.5);g.lineTo(-3,8);g.closePath();}); // узел
  eye(g,-4,-6,2.2,{px:0});eye(g,4,-6,2.2,{px:0});
  for(const x of[-4,4]){g.beginPath();g.arc(x,-6,3.6,0,TAU);g.lineWidth=.9;g.strokeStyle='#7a5a3a';g.stroke();}ln(g,[-.4,-6,.4,-6],'#7a5a3a',.9); // очки
  g.beginPath();g.ellipse(-7.5,-1,2.4,1.5,0,0,TAU);g.ellipse(7.5,-1,2.4,1.5,0,0,TAU);g.fillStyle='rgba(240,110,110,.5)';g.fill();
  ell(g,0,-2,1.8,1.5,'#e8a888',{ol:false});mouth(g,0,1.6,3,'#9a3a2a',1);
  shine(g,-6,-21,4,1.8,.35);});
// грядка: земля с бороздами в деревянной рамке
art('m_bed',64,g=>{ell(g,0,10,30,8,'rgba(0,0,0,.16)',{ol:false,flat:true});
  rrect(g,-28,-12,56,24,5);g.fillStyle=grad(g,0,0,30,'#a8733d',.25,-.3);g.fill();outline(g,'#a8733d',1.3);
  rrect(g,-25,-9,50,18,4);g.fillStyle=grad(g,0,0,26,'#6a4426',.2,-.35);g.fill();
  g.strokeStyle='rgba(40,22,10,.55)';g.lineWidth=1.6;for(const y of[-4,1,6]){g.beginPath();g.moveTo(-22,y);g.quadraticCurveTo(0,y-2,22,y);g.stroke();}
  g.strokeStyle='rgba(170,120,80,.45)';g.lineWidth=1;for(const y of[-5.5,-.5,4.5]){g.beginPath();g.moveTo(-21,y);g.quadraticCurveTo(0,y-2,21,y);g.stroke();}});
art('m_sprout',24,g=>{ln(g,[0,8,0,-1],'#3f8a2a',1.6);for(const s of[-1,1])ell(g,s*4,-3,4.4,2.4,'#5ac83a',{rot:s*-.5,hl:.5,lw:.6});ell(g,0,8,4,1.4,'rgba(60,30,10,.5)',{ol:false,flat:true});});
art('m_repa',28,g=>{for(const [a,l] of[[-.5,10],[0,12],[.5,10]]){ln(g,[0,-4,Math.sin(a)*l*.6,-4-l*.7],'#3f8a2a',1.4);ell(g,Math.sin(a)*l*.7,-4-l*.85,2.6,4.2,'#4ab83a',{rot:a,hl:.5,lw:.5});}
  shp(g,'#f2d23a',{hl:.55},[-9,-5,9,12],()=>{g.moveTo(0,12);g.quadraticCurveTo(-10,6,-8,0);g.quadraticCurveTo(-6,-6,0,-5);g.quadraticCurveTo(6,-6,8,0);g.quadraticCurveTo(10,6,0,12);});
  shp(g,'#c86ad0',{ol:false},[-7,-5,7,0],()=>{g.moveTo(-7.5,-1);g.quadraticCurveTo(-5,-6,0,-5);g.quadraticCurveTo(5,-6,7.5,-1);g.quadraticCurveTo(0,-3,-7.5,-1);});
  ln(g,[0,12,0,14],'#c8a03a',1);shine(g,-3.5,0,2.2,1.2,.55);});
art('m_kap',28,g=>{ell(g,0,9,11,3,'rgba(0,0,0,.15)',{ol:false,flat:true});for(const s of[-1,1])ell(g,s*6,2,6.5,8,'#5aa83a',{rot:s*.6,hl:.4});
  ell(g,0,0,9,8.5,'#9ad86a',{hl:.55});g.strokeStyle='rgba(60,120,40,.6)';g.lineWidth=1;for(const a of[-.5,0,.5]){g.beginPath();g.ellipse(0,0,8*Math.abs(Math.cos(a))+1,7,a,Math.PI*.15,Math.PI*.85);g.stroke();}shine(g,-3,-4,3,1.5,.5);});
art('m_gor',28,g=>{ln(g,[-8,-9,-6,-6],'#3f8a2a',1.4);ell(g,-10,-10,3,1.8,'#5ac83a',{rot:-.4,lw:.5});
  shp(g,'#6ac84a',{hl:.45},[-10,-8,10,8],()=>{g.moveTo(-9,-7);g.quadraticCurveTo(10,-6,10,6);g.quadraticCurveTo(-4,5,-9,-7);});
  for(const [x,y] of[[-3,-2],[1.5,0],[5.5,2.6]])ell(g,x,y,2.6,2.6,'#b8f07a',{hl:.6,lw:.5});ln(g,[-9,-7,10,6],'rgba(40,100,30,.5)',.8);});
art('m_honey',26,g=>{ell(g,0,9,9,2.6,'rgba(0,0,0,.15)',{ol:false,flat:true});
  shp(g,'#c8743a',{hl:.35},[-9,-6,9,9],()=>{g.moveTo(-6,-6);g.quadraticCurveTo(-11,2,-6,9);g.lineTo(6,9);g.quadraticCurveTo(11,2,6,-6);g.closePath();});
  rrect(g,-7,-8,14,3.4,1.4);g.fillStyle='#f4efe2';g.fill();outline(g,'#c8b89a',.7);ln(g,[-6.5,-6,6.5,-6],'#e0453a',1);
  shp(g,'#ffb52a',{hl:.6,lw:.5},[-6,-5,3,3],()=>{g.moveTo(-6,-5);g.lineTo(3,-5);g.quadraticCurveTo(3,0,1,1);g.quadraticCurveTo(0,4,-1,1);g.quadraticCurveTo(-6,0,-6,-5);});
  shine(g,-4,0,1.6,3,.35);});
// улей-колода из соломы (жгутами), леток, пчёлки
art('m_hive',52,g=>{ell(g,0,18,18,5,'rgba(0,0,0,.18)',{ol:false,flat:true});rrect(g,-17,15,34,5,2);g.fillStyle=grad(g,0,17,18,'#8a5a2e');g.fill();outline(g,'#8a5a2e',1);
  for(let i=0;i<5;i++){const y=12-i*6,w=16-i*i*.55;ell(g,0,y,w,4.4,i%2?'#e0b04a':'#d8a23e',{hl:.45,lw:.9});}
  ell(g,0,-17,4.6,2.6,'#c8923a',{hl:.4,lw:.8});ell(g,0,7,4,3,'#3a2410',{ol:false});
  for(const [x,y] of[[13,-10],[-14,-4],[9,-19]]){ell(g,x,y,2.4,1.8,'#ffcf2a',{lw:.5});ln(g,[x-.6,y-1.6,x-.6,y+1.6],'#2a1a0a',.7);ell(g,x+.4,y-2.2,1.4,1,'rgba(220,240,255,.85)',{ol:false,flat:true});}});
// русская печь: белёная, устье с огнём, лежанка, труба
art('m_oven',72,g=>{ell(g,0,28,30,6,'rgba(0,0,0,.18)',{ol:false,flat:true});
  rrect(g,-26,-8,52,36,5);g.fillStyle=grad(g,0,8,32,'#f4efe2',.2,-.18);g.fill();outline(g,'#cfc6b4',1.2);
  rrect(g,-28,-14,56,8,3);g.fillStyle=grad(g,0,-10,30,'#e8e0cc',.2,-.2);g.fill();outline(g,'#cfc6b4',1);
  rrect(g,8,-34,12,22,2);g.fillStyle=grad(g,14,-24,12,'#f0eadc',.2,-.2);g.fill();outline(g,'#cfc6b4',1);rrect(g,6,-37,16,5,1.5);g.fillStyle='#d8d0bc';g.fill();
  shp(g,'#3a2418',{ol:false},[-13,-2,13,22],()=>{g.moveTo(-13,22);g.lineTo(-13,6);g.quadraticCurveTo(-13,-2,0,-2);g.quadraticCurveTo(13,-2,13,6);g.lineTo(13,22);g.closePath();});
  glow(g,0,14,16,'#ff8a1a','#ffe08a');for(const [x,h] of[[-6,9],[0,12],[6,8]])shp(g,'#ffb03a',{ol:false},[x-4,20-h,x+4,20],()=>{g.moveTo(x-4,20);g.quadraticCurveTo(x-3,20-h*.5,x,20-h);g.quadraticCurveTo(x+3,20-h*.5,x+4,20);g.closePath();});
  ln(g,[-11,21,11,21],'#5a3a2a',2);
  g.strokeStyle='rgba(40,110,190,.55)';g.lineWidth=1.1;for(const x of[-21,17]){g.beginPath();g.arc(x,6,3,0,TAU);g.stroke();g.beginPath();g.moveTo(x-5,6);g.lineTo(x+5,6);g.moveTo(x,1);g.lineTo(x,11);g.stroke();} // роспись
  shine(g,-18,-10,6,1.6,.4);});
// блюда «узелка»: щи, каша, медовик (пирожок — общий ключ pie из art.js)
art('m_shchi',28,g=>{ell(g,0,8,11,3,'rgba(0,0,0,.15)',{ol:false,flat:true});
  shp(g,'#d8382e',{hl:.35},[-11,-2,11,8],()=>{g.moveTo(-11,-1);g.quadraticCurveTo(-10,8,0,8);g.quadraticCurveTo(10,8,11,-1);g.closePath();});
  ln(g,[-9,3,9,3],'#f4efe2',1);ell(g,0,-1,11,3.2,'#e8a83a',{hl:.4,lw:.7});for(const [x,y] of[[-4,-1.5],[2,-.5],[5,-2]])ell(g,x,y,1.8,1,'#7ac84a',{ol:false});
  ln(g,[5,-2,12,-10],'#a8733d',1.8);ell(g,12.5,-10.5,2,1.3,'#a8733d',{rot:-.8,lw:.5});g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.8;for(const x of[-4,0]){g.beginPath();g.moveTo(x,-5);g.quadraticCurveTo(x-2,-8,x,-11);g.stroke();}});
art('m_kasha',28,g=>{ell(g,0,9,11,3,'rgba(0,0,0,.15)',{ol:false,flat:true});
  shp(g,'#7a5a3a',{hl:.3},[-10,-4,10,9],()=>{g.moveTo(-9,-3);g.quadraticCurveTo(-12,6,-6,9);g.lineTo(6,9);g.quadraticCurveTo(12,6,9,-3);g.closePath();});
  ell(g,0,-3,9.5,3,'#e8c86a',{hl:.5,lw:.7});ell(g,0,-4.5,4,2,'#f5e08a',{ol:false});ell(g,1,-5,1.6,1,'#ffd04a',{ol:false}); // масло
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.8;for(const x of[-3,3]){g.beginPath();g.moveTo(x,-7);g.quadraticCurveTo(x-2,-10,x,-13);g.stroke();}});
art('m_medovik',28,g=>{ell(g,0,8,11,3,'rgba(0,0,0,.15)',{ol:false,flat:true});
  shp(g,'#d8903a',{hl:.4},[-10,-6,10,7],()=>{g.moveTo(-10,7);g.lineTo(-10,-2);g.lineTo(10,-6);g.lineTo(10,7);g.closePath();});
  for(const y of[-1,3])ln(g,[-10,y+2,10,y-2],'#fff0c8',1.3);
  shp(g,'#f5c860',{hl:.6,lw:.6},[-10,-9,10,-2],()=>{g.moveTo(-10,-2);g.lineTo(10,-6);g.lineTo(9,-8);g.lineTo(-9,-4);g.closePath();});
  ell(g,4,-8,2,1.6,'#ffb52a',{hl:.7,lw:.5});shine(g,-6,1,2,1,.4);});
// узелок в дорогу: красный платок в горошек, узел сверху
art('m_bag',32,g=>{ell(g,0,11,11,3,'rgba(0,0,0,.16)',{ol:false,flat:true});
  shp(g,'#d8382e',{hl:.4},[-12,-4,12,11],()=>{g.moveTo(-10,-3);g.quadraticCurveTo(-14,8,-6,11);g.lineTo(6,11);g.quadraticCurveTo(14,8,10,-3);g.quadraticCurveTo(0,-1,-10,-3);});
  for(const s of[-1,1])shp(g,'#d8382e',{hl:.45,lw:.8},[-9,-13,9,-2],()=>{g.moveTo(0,-3);g.quadraticCurveTo(s*9,-6,s*7,-12);g.quadraticCurveTo(s*3,-8,0,-3);});
  ell(g,0,-3,3,2.4,'#b82a22',{lw:.7});g.fillStyle='rgba(255,255,255,.85)';for(const [x,y] of[[-6,2],[0,4],[6,2],[-3,8],[3,8],[-8,7],[8,7],[-5,-8],[5,-8]]){g.beginPath();g.arc(x,y,1,0,TAU);g.fill();}
  shine(g,-5,0,2.5,1.2,.4);});
