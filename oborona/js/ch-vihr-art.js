'use strict';
/* OB:CH — рисунки темы перенесены из «Богатыря» как есть (~/Projects/bogatyr/js/th/vihr-art.js): тот же art()/artTint() */
/* рисунки темы vihr «Царство Вихря» (T-vihr/A39 + ART-vihr/A15): только art()/artTint() из js/art.js; помощники — внутри (function(){…})().
   Боссы — только art() (карта рисует ART[босс].fn — у artTint нет fn). Гусь `gus` — из bol-art.js; нет его (Болото не в сборке) — основа «нетопырь». */
(function(){
const B=ART.gus?'gus':'bat';
function over(g,col,a){g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(-90,-90,180,180);g.restore();}
// пушистое облачко из кругов: [[x,y,r],…]
function puff(g,p,col,o){for(const [x,y,r] of p)ell(g,x,y,r,r*.9,col,o);for(const [x,y,r] of p)ell(g,x-r*.2,y-r*.25,r*.55,r*.45,'rgba(255,255,255,.45)',{ol:false,flat:true});}
// молния-зигзаг
function bolt(g,x,y,s,col){poly(g,[x,y,x+4*s,y,x+1*s,y+6*s,x+5*s,y+6*s,x-2*s,y+16*s,x,y+9*s,x-4*s,y+9*s],col||'#ffd84a',{lw:.8,olc:'#a06a00'});}
// смерч: стопка овалов сверху вниз
function funnel(g,y0,y1,w0,w1,col,n){for(let i=0;i<n;i++){const k=i/(n-1),y=y0+(y1-y0)*k,w=w0+(w1-w0)*k;ell(g,(i%2?1:-1)*w*.12,y,w,w*.32+1.5,col,{lw:.9});}}

// Гусь-лебедь Вихря: небесно-голубой
artTint('vihr_gus',B,'#8fb0ff');
// Облачный барашек: шерсть-облако, тёмная мордочка, рожки-завитки
art('vihr_baran',40,g=>{for(const x of[-7,-2,3,8])ln(g,[x,8,x,15],'#5a5a6a',2.2);
  puff(g,[[-9,2,7],[-3,-3,8],[5,-2,8],[9,4,6],[0,5,8]],'#f4f6ff',{lw:1});
  ell(g,13,-3,5.5,6.5,'#5a5a72');for(const s of[-1,1]){g.beginPath();g.arc(13+s*4,-8,3,0,TAU*.8);g.lineWidth=2;g.strokeStyle='#c9a46a';g.stroke();}
  eye(g,11.5,-4,1.5,{px:.4});eye(g,15.5,-4,1.5,{px:.4});ell(g,14,1,1.6,1,'#f2a6c4',{ol:false,flat:true});});
// Ветреник: дух-сквозняк, щёки надул, дует
art('vihr_vetr',42,g=>{for(const [y,w] of[[10,9],[15,6],[19,3.5]])ell(g,-4+w*.3,y,w,2.6,'#bfe6f4',{lw:.8});
  ell(g,-2,-1,12,11,'#cfeefa');ell(g,-8,1,4.5,4,'#ffc0d0',{ol:false});ell(g,4,1,4.5,4,'#ffc0d0',{ol:false});
  eye(g,-6,-5,1.9,{px:.6,angry:1});eye(g,1,-5,1.9,{px:.6,angry:1,flipB:1});ell(g,9,1,2.6,2.2,'#4a6a8a');
  for(const [y,l] of[[-3,10],[1,13],[5,9]])ln(g,[13,y,13+l,y-1],'#e8f6ff',1.6);
  ln(g,[-14,-12,-8,-15,-2,-12],'#9ad0e8',1.4);shine(g,-6,-8,4,2,.5);});
// Грозовая тучка: сердитая туча с молнией
art('vihr_tuchka',44,g=>{bolt(g,0,6,1);puff(g,[[-10,0,7],[-3,-6,9],[6,-4,8],[11,2,6],[0,3,9]],'#6a7290',{lw:1.1});
  eye(g,-4,-3,2.1,{px:0,angry:1,brow:'#22263a'});eye(g,4,-3,2.1,{px:0,angry:1,flipB:1,brow:'#22263a'});mouth(g,0,3,3,'#22263a');});
// Птица Сирин: птица с девичьим личиком и венчиком, поёт
art('vihr_sirin',46,g=>{ln(g,[-3,12,-4,18],'#e0a43a',1.6);ln(g,[3,12,4,18],'#e0a43a',1.6);
  for(const [x,c] of[[-12,'#8a4ad0'],[-9,'#f0b84a'],[-6,'#4a8ad0']])poly(g,[-6,8,x-6,16,x,6],c,{lw:.7});
  for(const s of[-1,1])shp(g,'#7a4ac0',{},[s*4,-6,s*20,10],()=>{g.moveTo(s*4,0);g.quadraticCurveTo(s*18,-8,s*20,4);g.quadraticCurveTo(s*12,6,s*4,8);g.closePath();});
  ell(g,0,4,8,9,'#9a62e0');ell(g,0,7,5,5,'#f0c060',{ol:false});
  ell(g,0,-8,6.5,6.5,'#f6d2b0');shp(g,'#5a3a2a',{},[-7,-15,7,-6],()=>{g.moveTo(-7,-6);g.quadraticCurveTo(-8,-15,0,-15);g.quadraticCurveTo(8,-15,7,-6);g.quadraticCurveTo(0,-12,-7,-6);});
  poly(g,[-6,-13,-4,-19,-1,-15,0,-20,1,-15,4,-19,6,-13],'#ffd84a',{lw:.7});
  ln(g,[-4,-8,-1.5,-8.5],'#3a2a2a',1);ln(g,[1.5,-8.5,4,-8],'#3a2a2a',1);ell(g,0,-4.5,1.4,1.7,'#c04060',{ol:false,flat:true});
  for(const [x,y] of[[9,-14],[12,-10]]){ell(g,x,y,1.4,1.1,'#4a2a6a',{ol:false,flat:true});ln(g,[x+1.2,y,x+1.2,y-4.5],'#4a2a6a',.8);}});
// Вихрёнок: маленький смерч с глазками
art('vihr_vihrenok',34,g=>{funnel(g,-8,11,11,2.5,'#c8d4ec',6);eye(g,-3,-6,1.8,{px:.3});eye(g,3,-6,1.8,{px:.3});
  ln(g,[-10,-11,-4,-13,3,-12],'#ffffff',1.2);shine(g,-5,-10,3,1.4,.5);});

// Вожак гусей-лебедей: большой гусь, золотой хохолок и венчик
art('vihr_vozhak',96,g=>{g.save();g.scale(2,2);ART[B].fn(g);g.restore();over(g,'#6a8cff',.25);
  for(const a of[-.5,-.15,.2])ell(g,22+Math.cos(a-1.6)*6,-33+Math.sin(a-1.6)*6,1.8,5,'#ffd84a',{rot:a,lw:.6});
  poly(g,[14,-29,16,-34,19,-30,22,-36,25,-30,28,-34,29,-28],'#ffc94a',{lw:.8});
  for(const [x,y] of[[-16,4],[-8,10],[-22,-2]])ell(g,x,y,3,1.4,'#ffd84a',{rot:.4,ol:false});});
// Гром-баба: туча-баба, седые клубы, косы-молнии
art('vihr_grom',104,g=>{for(const s of[-1,1]){g.save();g.translate(s*15,8);g.rotate(s*.25);bolt(g,0,0,1.4);g.restore();}
  puff(g,[[-26,4,14],[-14,-10,16],[14,-10,16],[26,4,14],[0,12,18],[-14,16,12],[14,16,12]],'#5a6688',{lw:1.4});
  puff(g,[[-12,-24,9],[0,-30,10],[12,-24,9]],'#e8ecf6',{lw:1});
  ell(g,0,-6,17,16,'#c4cee6');ell(g,-10,-1,4.4,3,'#f2a6c4',{ol:false});ell(g,10,-1,4.4,3,'#f2a6c4',{ol:false});
  eye(g,-6.5,-10,3.8,{px:0,angry:1,col:'#2a3a8a'});eye(g,6.5,-10,3.8,{px:0,angry:1,flipB:1,col:'#2a3a8a'});
  shp(g,'#3a2a3a',{},[-6,-1,6,7],()=>{g.moveTo(-6,0);g.quadraticCurveTo(0,9,6,0);g.closePath();});});
// Вихорь: тело-смерч, лицо в раструбе, борода уходит в вихрь
art('vihr_vihor',120,g=>{funnel(g,-6,48,34,6,'#9aa4c8',9);
  for(const y of[2,16,30])ln(g,[-20+y*.3,y,0,y+5,20-y*.3,y],'rgba(255,255,255,.55)',1.6);
  ell(g,0,-26,36,13,'#b8c0dc',{lw:1.4});ell(g,0,-22,15,14,'#e6d6c8');
  shp(g,'#eef0f8',{},[-14,-16,14,20],()=>{g.moveTo(-13,-18);g.quadraticCurveTo(-14,4,-2,20);g.quadraticCurveTo(0,10,4,18);g.quadraticCurveTo(14,2,13,-18);g.quadraticCurveTo(0,-10,-13,-18);});
  for(const s of[-1,1])ell(g,s*6,-25,6.5,2.8,'#eef0f8',{rot:-s*.25,lw:.8});
  eye(g,-5.5,-23,3,{px:0,angry:1,col:'#4a2a8a',brow:'#c8ccdc'});eye(g,5.5,-23,3,{px:0,angry:1,flipB:1,col:'#4a2a8a',brow:'#c8ccdc'});
  ell(g,0,-12,3,2.2,'#4a2a3a',{ol:false});for(const a of[-.9,-.3,.3,.9])ln(g,[Math.sin(a)*30,-34,Math.sin(a)*44,-46],'#cfd6ec',2.4);
  poly(g,[-12,-36,-9,-46,-4,-39,0,-49,4,-39,9,-46,12,-36],'#ffd84a',{lw:1});ell(g,0,-42,2,2,'#4ad0ff',{lw:.6});});

// декор: облачко, небесный мосток, теремок на туче, радуга, ветряная мельница
art('vihr_d_oblak',70,g=>{puff(g,[[-16,4,11],[-4,-4,14],[12,0,12],[22,6,8],[2,8,12]],'#fff6fa',{ol:false});});
art('vihr_d_most',80,g=>{puff(g,[[-30,8,9],[30,8,9]],'#fff6fa',{ol:false});ln(g,[-30,-6,0,-1,30,-6],'#8a5a32',1.4);
  for(let x=-24;x<=24;x+=8)shp(g,'#c08a50',{lw:.8},[x-3.5,-2,x+3.5,4],()=>{rrect(g,x-3.5,-2+Math.abs(x)*-.12,7,6,1.2);});
  for(const x of[-28,28])ln(g,[x,6,x,-10],'#7a4a26',2.4);});
art('vihr_d_terem',90,g=>{puff(g,[[-20,22,11],[-6,26,13],[10,25,12],[22,20,9]],'#fff0f4',{ol:false});
  shp(g,'#c86a4a',{},[-12,-6,12,20],()=>{rrect(g,-12,-6,24,26,2);});for(const y of[0,7,14])ln(g,[-11,y,11,y],'#8a3a2a',.9);
  poly(g,[-16,-5,0,-26,16,-5],'#3a7ac8');poly(g,[-2,-26,0,-34,2,-26],'#ffd84a',{lw:.6});
  shp(g,'#ffe08a',{flat:1,olc:'#6a2a1a',lw:1.2},[-5,1,5,10],()=>{rrect(g,-5,1,10,9,4);});});
art('vihr_d_raduga',96,g=>{for(const [r,c] of[[34,'#ff7a7a'],[30,'#ffb84a'],[26,'#ffe66a'],[22,'#7ad07a'],[18,'#7ab0ff'],[14,'#b07aff']]){g.beginPath();g.arc(0,12,r,Math.PI,0);g.lineWidth=4.2;g.strokeStyle=c;g.globalAlpha=.75;g.stroke();}
  g.globalAlpha=1;puff(g,[[-28,12,9],[-18,16,7],[28,12,9],[18,16,7]],'#ffffff',{ol:false});});
art('vihr_d_mel',90,g=>{ell(g,4,30,18,6,'rgba(0,0,0,.12)',{ol:false,flat:true});
  poly(g,[-10,30,-7,-6,7,-6,10,30],'#b08050');poly(g,[-12,-5,0,-18,12,-5],'#7a4a2a');shp(g,'#5a3a1e',{flat:1},[-3,14,3,30],()=>{rrect(g,-3,18,6,12,2.5);});
  for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;g.save();g.translate(0,-10);g.rotate(a);shp(g,'#f4ead2',{lw:.8},[3,-4,30,4],()=>{rrect(g,6,-4,24,8,1);});ln(g,[0,0,30,0],'#6a4a2a',1.6);g.restore();}
  ell(g,0,-10,2.6,2.6,'#5a3a1e');});
})();
