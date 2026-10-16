/* bb2 LAND — рисунки 12-й земли «Долгая ночь» (тема zima). Только art() из js/art.js; помощники — внутри функции.
   Набор догрузки 'land' (грузится раньше js/bb2-land-data.js). Все рисунки — готовые спрайты (рисуются один раз при первом показе). */
(function(){
// снег на плечах/шапке: белая шапочка-облачко
function cap(g,x,y,w){ell(g,x,y,w,w*.36,'#f4f8ff',{hl:.15,dk:-.12,lw:.7});}
// звёздочка-снежинка
function star(g,x,y,r,col,n){g.beginPath();n=n||5;for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,q=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}g.closePath();g.fillStyle=col;g.fill();
  g.lineWidth=Math.max(.6,r*.14);g.strokeStyle='rgba(120,80,0,.55)';g.stroke();}
function flake(g,x,y,r,col,w){for(let i=0;i<3;i++){const a=i*Math.PI/3;ln(g,[x-Math.cos(a)*r,y-Math.sin(a)*r,x+Math.cos(a)*r,y+Math.sin(a)*r],col,w||1.2);}}

// Шуликун: святочный бесёнок — голова клином, конские копытца, сковородка с угольками
art('zim_shul',42,g=>{
  ln(g,[-4,8,-5,17],'#2a1a14',2.4);ln(g,[4,8,5,17],'#2a1a14',2.4);ell(g,-5.5,17.5,2.6,1.6,'#141010');ell(g,5.5,17.5,2.6,1.6,'#141010');
  ln(g,[6,6,14,9,16,3],'#3a2418',1.6);poly(g,[16,3,18,0,14,1],'#3a2418');
  ell(g,0,4,8,7.5,'#5a3a2a');
  poly(g,[-7,-3,0,-21,7,-3],'#5a3a2a',{hl:.35});ell(g,0,-5,7.5,6,'#6a4632');
  eye(g,-3,-6,2.2,{white:'#ffe8a0',col:'#c03010',px:.3,angry:1,brow:'#1a0a08'});eye(g,3,-6,2.2,{white:'#ffe8a0',col:'#c03010',px:.3,angry:1,flipB:1,brow:'#1a0a08'});
  ln(g,[-3,-1,0,1,3,-1],'#1a0a08',1.2);fangs(g,0,-.6,.8);
  ln(g,[-6,3,-13,0],'#5a3a2a',2.4);ln(g,[-13,0,-20,-2],'#3a3a44',2.2);
  ell(g,-15,-4,7,3.2,'#2a2a34',{lw:.9});for(const [x,y] of[[-18,-5],[-15,-6],[-12,-5],[-16,-3.5]])ell(g,x,y,1.8,1.4,'#ff7a2a',{ol:false,hl:.8});
  glow(g,-15,-6,8,'rgba(255,140,40,.55)','rgba(255,220,120,.7)');});

// Злыдень: крошечный серый горемыка-вредитель, уши-лопухи, мешок бед за спиной
art('zim_zlyd',30,g=>{
  ell(g,7,0,6,7,'#8a7a5a',{lw:.8});ln(g,[5,-6,9,-8],'#5a4a2a',1.2);
  ell(g,0,4,6.5,7,'#7a8070');ln(g,[-3,10,-3,13],'#4a4e44',1.8);ln(g,[3,10,3,13],'#4a4e44',1.8);
  for(const s of[-1,1])poly(g,[s*5,-6,s*13,-10,s*7,-2],'#8a9080',{lw:.7});
  ell(g,0,-4,6.5,5.8,'#8a9080');eye(g,-2.4,-5,1.9,{col:'#3a2a10',px:.2,angry:1,brow:'#2a2a20'});eye(g,2.4,-5,1.9,{col:'#3a2a10',px:.2,angry:1,flipB:1,brow:'#2a2a20'});
  mouth(g,0,-.2,2.4,'#2a2018');cap(g,0,-9.5,5);});

// Обдериха: банная хозяйка — космы до пят, веник, пар клубами
art('zim_obder',48,g=>{
  for(const [x,y,r] of[[-14,14,6],[13,13,7],[0,18,6]])ell(g,x,y,r,r*.7,'rgba(240,244,255,.75)',{ol:false,flat:true});
  shp(g,'#c8c0b0',{hl:.2},[-12,-6,12,18],()=>{g.moveTo(-8,-4);g.quadraticCurveTo(-14,10,-11,18);g.lineTo(11,18);g.quadraticCurveTo(14,10,8,-4);g.closePath();});
  ell(g,0,-9,7,7.5,'#e8d0c0');
  shp(g,'#4a4038',{},[-13,-19,13,16],()=>{g.moveTo(-7,-15);g.quadraticCurveTo(0,-21,7,-15);g.quadraticCurveTo(14,0,12,16);g.lineTo(8,16);g.quadraticCurveTo(9,0,6,-9);
    g.quadraticCurveTo(0,-13,-6,-9);g.quadraticCurveTo(-9,0,-8,16);g.lineTo(-12,16);g.quadraticCurveTo(-14,0,-7,-15);});
  eye(g,-2.6,-9,2,{white:'#f4f0e0',col:'#2a6a5a',px:0});eye(g,2.6,-9,2,{white:'#f4f0e0',col:'#2a6a5a',px:0});mouth(g,0,-4.5,2.2,'#6a2a2a');
  ln(g,[10,4,18,-10],'#8a6a3a',2);for(const a of[-.5,-.2,.1,.4])ln(g,[18,-10,18+Math.cos(a-1.9)*9,-10+Math.sin(a-1.9)*9],'#5a8a3a',2.2);
  for(const [x,y] of[[-6,-20],[2,-23],[8,-19]])ell(g,x,y,3.4,2.4,'rgba(255,255,255,.7)',{ol:false,flat:true});});

// Зеркальный морок: гадальное зеркальце со свечками, в стекле — чужое лицо
art('zim_zerk',42,g=>{
  for(const s of[-1,1]){ln(g,[s*13,6,s*13,14],'#f0e0c0',3.4);glow(g,s*13,3,6,'rgba(255,200,90,.6)','#fff6c0');ell(g,s*13,3,1.6,2.8,'#ffd84a',{ol:false,flat:true});}
  ln(g,[0,10,0,18],'#a07a3a',3);ell(g,0,-2,10.5,13,'#c9a04a',{lw:1});ell(g,0,-2,8,10.5,'#9ab4d8',{hl:.7,lw:.8});
  ell(g,0,-1,4.6,5.6,'rgba(230,240,255,.85)',{ol:false,flat:true});eye(g,-1.8,-2,1.4,{col:'#3a2a6a',px:0});eye(g,1.8,-2,1.4,{col:'#3a2a6a',px:0});
  mouth(g,0,1.6,1.6,'#5a4a8a',1);shine(g,-4,-7,2.4,4,.6);});

// Соломенное чучелко Марены: солома, лоскутный сарафан, ледяной венец
art('zim_chuch',46,g=>{
  ln(g,[0,4,0,20],'#8a6a3a',2.6);ln(g,[-16,-2,16,-2],'#8a6a3a',2.4);
  for(const s of[-1,1])for(const d of[-2,0,2])ln(g,[s*16,-2,s*20,-2+d*1.6],'#e8c86a',1.3);
  shp(g,'#c04a4a',{hl:.25},[-10,-4,10,14],()=>{g.moveTo(-5,-4);g.lineTo(5,-4);g.lineTo(10,14);g.lineTo(-10,14);g.closePath();});
  for(const [x,y,c] of[[-4,4,'#4a7ac0'],[3,8,'#e8c84a'],[-2,11,'#4aa06a']])poly(g,[x-2.4,y-2.4,x+2.4,y-2.4,x+2.4,y+2.4,x-2.4,y+2.4],c,{lw:.5});
  for(const d of[-6,-3,0,3,6])ln(g,[d,14,d*1.3,19],'#e8c86a',1.3);
  ell(g,0,-10,6.5,7,'#ecd27a',{lw:.8});for(const d of[-4,0,4])ln(g,[d,-16,d*1.2,-8],'rgba(160,120,40,.5)',.8);
  eye(g,-2.4,-10,1.6,{white:'#fff',col:'#2a4a8a',px:0});eye(g,2.4,-10,1.6,{white:'#fff',col:'#2a4a8a',px:0});mouth(g,0,-6.3,1.8,'#8a3a2a',1);
  for(const x of[-5,-2.5,0,2.5,5])poly(g,[x-1.3,-16,x+1.3,-16,x,-16-(x===0?7:4.5)],'#bfe6ff',{hl:.7,lw:.5});});

// Чёрт-месяцекрад (босс главы 1, мини-босс главы 3): чёрный чёрт с пятачком, месяц под мышкой
art('zim_chert',104,g=>{
  ln(g,[16,22,34,30,40,16,36,8],'#1a1418',4);poly(g,[36,8,40,2,32,4],'#1a1418');
  ln(g,[-9,28,-11,46],'#1a1418',6);ln(g,[9,28,11,46],'#1a1418',6);ell(g,-12,47,6,3.4,'#0a0808');ell(g,12,47,6,3.4,'#0a0808');
  ell(g,0,14,22,20,'#2a2228');ell(g,0,18,12,12,'#3a3038',{ol:false});
  ell(g,0,-14,20,18,'#2a2228');for(const s of[-1,1])poly(g,[s*12,-26,s*22,-46,s*18,-24],'#d8c8a0',{hl:.4});
  for(const s of[-1,1])ell(g,s*20,-14,5,7,'#2a2228',{rot:s*.4});
  eye(g,-8,-18,5,{white:'#fff4c0',col:'#d03010',px:1,angry:1,brow:'#0a0608'});eye(g,8,-18,5,{white:'#fff4c0',col:'#d03010',px:1,angry:1,flipB:1,brow:'#0a0608'});
  ell(g,0,-8,7,5,'#e88a9a');ell(g,-2.4,-8,1.4,1.8,'#5a1a2a',{ol:false,flat:true});ell(g,2.4,-8,1.4,1.8,'#5a1a2a',{ol:false,flat:true});
  mouth(g,0,-1,7,'#0a0608',1);fangs(g,0,-.4,1.6);
  for(const [x,y] of[[-8,-31],[0,-33],[8,-31]])ln(g,[x,y,x+1,y-5],'#1a1418',2);
  ln(g,[-18,8,-30,16],'#2a2228',7);
  glow(g,-36,14,26,'rgba(255,236,150,.55)','#fffbe0');
  shp(g,'#ffe680',{hl:.5},[-50,-6,-22,34],()=>{g.arc(-36,14,18,-Math.PI*.5,Math.PI*.5,true);g.quadraticCurveTo(-46,14,-36,-4);});
  eye(g,-46,10,2.4,{col:'#6a5a10',px:0});mouth(g,-46,17,2.4,'#8a6a10',1);
  for(const [x,y] of[[22,-30],[-24,-34],[30,-6]])star(g,x,y,3.6,'#ffe680');});

// Банник (босс главы 2): дед-банник — мокрая борода, веник, ковш, весь красный с пару
art('zim_bannik',108,g=>{
  for(const [x,y,r] of[[-34,40,14],[30,42,16],[0,46,13],[-40,10,10],[42,6,11]])ell(g,x,y,r,r*.7,'rgba(240,244,255,.7)',{ol:false,flat:true});
  ell(g,0,24,26,22,'#d86a4a');ln(g,[-26,28,26,28],'#f4f0e0',6);
  ell(g,-10,46,7,4,'#b85a3a');ell(g,10,46,7,4,'#b85a3a');
  ell(g,0,-10,20,19,'#e8806a');
  shp(g,'#e8e4dc',{hl:.25},[-22,-6,22,40],()=>{g.moveTo(-18,-6);g.quadraticCurveTo(-24,20,-10,38);g.lineTo(-4,30);g.lineTo(0,40);g.lineTo(4,30);g.lineTo(10,38);g.quadraticCurveTo(24,20,18,-6);g.quadraticCurveTo(0,4,-18,-6);});
  for(const d of[-8,0,8])ln(g,[d,6,d*1.1,30],'rgba(150,170,200,.55)',1.4);
  shp(g,'#e8e4dc',{},[-22,-34,22,-14],()=>{g.moveTo(-20,-16);g.quadraticCurveTo(-22,-32,0,-33);g.quadraticCurveTo(22,-32,20,-16);g.quadraticCurveTo(10,-24,0,-22);g.quadraticCurveTo(-10,-24,-20,-16);});
  eye(g,-7,-12,4,{col:'#2a2a3a',px:.6,angry:1,brow:'#c8c4bc'});eye(g,7,-12,4,{col:'#2a2a3a',px:.6,angry:1,flipB:1,brow:'#c8c4bc'});
  ell(g,0,-4,4.6,4,'#d0503a');
  ln(g,[22,14,40,-8],'#8a6a3a',4);for(const a of[-.6,-.3,0,.3,.6])ln(g,[40,-8,40+Math.cos(a-1.5)*18,-8+Math.sin(a-1.5)*18],'#4a8a3a',4.4);
  for(const [x,y] of[[36,-22],[44,-20],[40,-28]])ell(g,x,y,3,2.2,'#6aaa4a',{lw:.6});
  ln(g,[-22,14,-36,4],'#e8806a',6);ell(g,-40,0,9,6,'#a07a3a',{lw:1.2});ln(g,[-40,0,-50,-6],'#8a6a3a',3);
  for(const [x,y] of[[-10,-40],[2,-44],[12,-40]])ell(g,x,y,5,3.4,'rgba(255,255,255,.75)',{ol:false,flat:true});});

// Марена (босс главы 3): Зима-Морена — белое лицо, чёрные косы, венец из сосулек и месяца, держит клетку-фонарь с солнцем-Колядой
art('zim_marena',120,g=>{
  shp(g,'#2a3a7a',{hl:.25},[-34,-10,34,56],()=>{g.moveTo(-14,-8);g.quadraticCurveTo(-30,24,-34,56);g.lineTo(34,56);g.quadraticCurveTo(30,24,14,-8);g.closePath();});
  for(const [x,y] of[[-18,30],[10,40],[22,20],[-6,48],[-24,48],[2,22]])flake(g,x,y,3.4,'rgba(220,236,255,.9)',1.2);
  shp(g,'#e8f2ff',{hl:.3},[-14,-8,14,10],()=>{g.moveTo(-14,-8);g.lineTo(14,-8);g.lineTo(8,10);g.lineTo(-8,10);g.closePath();});
  for(const s of[-1,1])shp(g,'#14141e',{},[-24,-40,24,40],()=>{g.moveTo(s*10,-36);g.quadraticCurveTo(s*26,-10,s*20,40);g.lineTo(s*15,40);g.quadraticCurveTo(s*18,-10,s*6,-30);g.closePath();});
  ell(g,0,-26,13,15,'#f0f4fa',{hl:.2});
  eye(g,-5,-27,3.2,{white:'#fff',col:'#3a7ad8',px:0});eye(g,5,-27,3.2,{white:'#fff',col:'#3a7ad8',px:0});
  ln(g,[-9,-32,-2,-31],'#14141e',1.4);ln(g,[2,-31,9,-32],'#14141e',1.4);mouth(g,0,-19,3.2,'#4a6ab0');
  ell(g,-6,-22,2.4,1.4,'rgba(150,190,255,.45)',{ol:false,flat:true});ell(g,6,-22,2.4,1.4,'rgba(150,190,255,.45)',{ol:false,flat:true});
  for(const x of[-11,-6,0,6,11])poly(g,[x-2.4,-40,x+2.4,-40,x,-40-(x===0?14:x*x>40?7:10)],'#bfe6ff',{hl:.7,lw:.7});
  shp(g,'#e8f0ff',{hl:.5},[-8,-62,8,-48],()=>{g.arc(0,-55,7,Math.PI*.2,Math.PI*1.8);g.quadraticCurveTo(-3,-55,5,-51);});
  ln(g,[16,0,32,10],'#2a3a7a',6);ln(g,[34,0,34,8],'#8aa0c0',1.6);
  glow(g,34,20,22,'rgba(255,200,80,.6)','#fff4b0');
  rrect(g,25,9,18,22,4);g.fillStyle='rgba(180,220,255,.35)';g.fill();g.lineWidth=1.6;g.strokeStyle='#8aa0c0';g.stroke();
  for(const x of[29,34,39])ln(g,[x,9,x,31],'#8aa0c0',1.2);
  ell(g,34,20,5.4,5.4,'#ffd84a',{hl:.7,lw:.8});eye(g,32.4,19.4,1.2,{col:'#8a4a10',px:0});eye(g,35.6,19.4,1.2,{col:'#8a4a10',px:0});
  ln(g,[-16,0,-30,16],'#2a3a7a',6);ell(g,-31,18,3.6,3.6,'#f0f4fa',{lw:.7});});

// декор: изба с огоньком в окне, колядная звезда на шесте, сугроб с плетнём
art('zim_d_izba',96,g=>{ell(g,4,26,40,10,'rgba(0,0,0,.14)',{ol:false,flat:true});
  poly(g,[-30,26,-30,-4,30,-4,30,26],'#7a5034',{hl:.25});for(const y of[2,9,16,23])ln(g,[-30,y,30,y],'rgba(40,20,10,.45)',1.4);
  poly(g,[-38,-2,0,-30,38,-2],'#f4f8ff',{hl:.15,dk:-.15});poly(g,[-34,-4,0,-26,34,-4],'#5a3a24',{ol:false});
  poly(g,[-36,-2,0,-29,36,-2,32,1,0,-24,-32,1],'#f4f8ff',{ol:false});
  rrect(g,-9,2,18,14,2);g.fillStyle='#ffd27a';g.fill();g.lineWidth=2;g.strokeStyle='#4a2a14';g.stroke();ln(g,[0,2,0,16],'#4a2a14',1.6);ln(g,[-9,9,9,9],'#4a2a14',1.6);
  glow(g,0,9,18,'rgba(255,200,90,.35)','rgba(255,240,180,.5)');ln(g,[18,-14,18,-26],'#5a4030',5);ell(g,18,-28,4,2,'#f4f8ff',{ol:false});});
art('zim_d_zvezda',70,g=>{ell(g,0,30,10,3,'rgba(0,0,0,.15)',{ol:false,flat:true});ln(g,[0,30,0,-6],'#8a6a3a',3);
  glow(g,0,-16,20,'rgba(255,214,90,.4)','rgba(255,250,210,.6)');star(g,0,-16,13,'#ffd84a',8);ell(g,0,-16,5,5,'#e84a3a',{lw:.8});
  for(const [x,c] of[[-6,'#e84a3a'],[6,'#4a7ac0']])ln(g,[0,-5,x,10],c,1.6);});
art('zim_d_sugrob',64,g=>{ell(g,0,10,28,10,'#f4f8ff',{hl:.15,dk:-.15});
  for(const x of[-18,-9,0,9,18]){ln(g,[x,10,x,-6],'#7a5a3a',2.6);ell(g,x,-7,2.6,1.4,'#f4f8ff',{ol:false});}
  ln(g,[-20,-1,20,-2],'#6a4a2a',1.6);ln(g,[-20,4,20,3],'#6a4a2a',1.6);ell(g,-6,13,18,6,'#eef4ff',{ol:false,hl:.1});});
})();
