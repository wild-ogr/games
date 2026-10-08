'use strict';
/* OB:CH — рисунки темы перенесены из «Богатыря» как есть (~/Projects/bogatyr/js/th/luk-art.js): тот же art()/artTint() */
/* рисунки темы luk «Лукоморье» (T-luk/ART-luk, A37/A14): только art()/artTint() из js/art.js; помощники — внутри (function(){…})() */
(function(){
function over(g,col,a){g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(-80,-80,160,160);g.restore();}
/* золотая цепь: звенья по ломаной p */
function chain(g,p,s){for(let i=0;i+3<p.length;i+=2){const n=Math.max(2,Math.round(Math.hypot(p[i+2]-p[i],p[i+3]-p[i+1])/(s*2.2)));
  for(let j=0;j<n;j++){const q=j/n,x=p[i]+(p[i+2]-p[i])*q,y=p[i+1]+(p[i+3]-p[i+1])*q;ell(g,x,y,s,s*.62,'#f2c23a',{rot:Math.atan2(p[i+3]-p[i+1],p[i+2]-p[i])+(j%2?1.57:0),lw:.6,olc:'#7a5a10'});}}}
/* кошачья голова (полосатая) */
function cat(g,x,y,s,col){poly(g,[x-7*s,y-3*s,x-6*s,y-12*s,x-1*s,y-6*s],col);poly(g,[x+7*s,y-3*s,x+6*s,y-12*s,x+1*s,y-6*s],col);
  ell(g,x,y,8*s,7*s,col);for(const d of[-3,0,3])ln(g,[x+d*s,y-7*s,x+d*s*.7,y-4*s],'#5a4a3a',.9*s);
  ell(g,x,y+3*s,4*s,2.6*s,'#f4ead2',{ol:false});ell(g,x,y+1.4*s,1.3*s,.9*s,'#e07a8a',{ol:false,flat:1});
  for(const d of[-1,1])ln(g,[x+d*3*s,y+3*s,x+d*10*s,y+2*s],'#fff',.5*s);}
/* Невиданный зверь: синий, в рыжих пятнах, с рожком и лапищами */
art('luk_zver',50,g=>{for(const x of[-10,-3,5,12])ell(g,x,15,3.6,4.6,'#2e3f7a');
  ln(g,[-15,4,-21,-2,-19,-9],'#3a56a8',3.4);ell(g,-19,-10,2.6,2.6,'#ff8a3a');
  ell(g,0,5,16,11,'#3a56a8');for(const [x,y,r] of[[-7,2,3],[2,8,2.4],[6,0,2],[-2,-1,1.6]])ell(g,x,y,r,r*.8,'#ff9a3a',{ol:false});
  ell(g,13,-6,9,8,'#4a68c0');poly(g,[11,-13,14,-23,17,-12],'#ffd84a');
  eye(g,10,-7,2.4,{px:.6,angry:1});eye(g,16,-7,2,{px:.6,angry:1,flipB:1});ln(g,[12,-1,19,-2],'#1a1a3a',1.2);fangs(g,15,-1.6,1);shine(g,-6,-1,6,2.4,.3);});
/* Русалка на ветвях: русалка сидит на ветке дуба */
art('luk_rus',48,g=>{ln(g,[-22,17,22,13],'#6a4a2a',4.4);for(const [x,y] of[[-17,13],[16,9],[-6,18]])ell(g,x,y,4.6,2.6,'#4a9a3e',{rot:.4});
  g.save();g.scale(.95,.95);ART.rusalka.fn(g);g.restore();for(const x of[-14,12])ell(g,x,15,2.4,2.2,'#f4e2c0',{lw:.5});});
/* Цепной кот: серый полосатый, на золотой цепи */
art('luk_kot',38,g=>{ln(g,[-6,6,-14,0,-13,-7],'#7a7a8a',3);ell(g,-1,6,9,6,'#9a9aa8');for(const x of[-5,-1,3])ln(g,[x,1,x+1,5],'#5a5a6a',1.2);
  ell(g,-5,11,2.2,2.6,'#7a7a8a');ell(g,4,11,2.2,2.6,'#7a7a8a');cat(g,8,-4,.8,'#9a9aa8');
  eye(g,6,-5,1.7,{white:'#ffe14a',px:0});eye(g,10,-5,1.6,{white:'#ffe14a',px:0});chain(g,[4,2,-4,13,-16,15],1.6);});
/* Кот учёный (босс гл.1): большой рыжий кот в очках, на задних лапах, с книгой и цепью */
art('luk_uch',92,g=>{ell(g,0,34,22,6,'rgba(0,0,0,.18)',{ol:false,flat:1});
  ln(g,[14,22,30,14,32,-2,26,-8],'#c8742a',5);ln(g,[30,10,32,0],'#8a4a1a',2);
  ell(g,-7,31,6,3.6,'#b8641e');ell(g,7,31,6,3.6,'#b8641e');
  ell(g,0,12,17,20,'#e08a3a');ell(g,0,15,10,14,'#f8e4c0',{ol:false});for(const y of[0,8,16])ln(g,[-15,y,-11,y+2],'#9a4a14',1.6),ln(g,[15,y,11,y+2],'#9a4a14',1.6);
  chain(g,[-12,-2,0,4,12,-2],1.8);
  shp(g,'#2a6aa8',{},[-15,6,15,22],()=>{g.moveTo(-15,8);g.lineTo(0,12);g.lineTo(15,8);g.lineTo(15,20);g.lineTo(0,23);g.lineTo(-15,20);g.closePath();});
  ln(g,[0,12,0,23],'#1a3a6a',1.4);for(const y of[13,16,19])ln(g,[-12,y-2,-3,y],'#fff6dc',.8),ln(g,[3,y,12,y-2],'#fff6dc',.8);
  ell(g,-14,13,3.4,3,'#e08a3a');ell(g,14,13,3.4,3,'#e08a3a');
  cat(g,0,-14,1.6,'#e08a3a');for(const x of[-5,5]){g.beginPath();g.arc(x,-16,3.6,0,TAU);g.fillStyle='rgba(220,240,255,.35)';g.fill();g.lineWidth=1.2;g.strokeStyle='#5a3a1e';g.stroke();}
  ln(g,[-1.4,-16,1.4,-16],'#5a3a1e',1.2);eye(g,-5,-16,2,{white:'#c8f070',px:0});eye(g,5,-16,2,{white:'#c8f070',px:0});
  shp(g,'#3a3a5a',{},[-12,-36,12,-24],()=>{g.moveTo(-11,-25);g.lineTo(0,-30);g.lineTo(11,-25);g.lineTo(0,-21);g.closePath();});ln(g,[9,-25,11,-18],'#ffd84a',1.2);shine(g,-6,6,5,2.4,.3);});
/* Книжка-сказка (её бьют, пока Кот учёный рассказывает) */
art('luk_kniga',40,g=>{glow(g,0,-2,18,'rgba(255,220,120,.45)','rgba(255,250,220,.7)');
  shp(g,'#b8322e',{},[-16,-8,16,12],()=>{g.moveTo(-16,-6);g.quadraticCurveTo(-8,-10,0,-6);g.quadraticCurveTo(8,-10,16,-6);g.lineTo(16,10);g.quadraticCurveTo(8,6,0,11);g.quadraticCurveTo(-8,6,-16,10);g.closePath();});
  shp(g,'#fff6dc',{lw:.6},[-14,-8,14,8],()=>{g.moveTo(-14,-6);g.quadraticCurveTo(-7,-9,0,-5);g.lineTo(0,9);g.quadraticCurveTo(-7,5,-14,8);g.closePath();g.moveTo(14,-6);g.quadraticCurveTo(7,-9,0,-5);g.lineTo(0,9);g.quadraticCurveTo(7,5,14,8);g.closePath();});
  for(const y of[-3,0,3])ln(g,[-11,y,-3,y+1],'#8a7a5a',.7),ln(g,[3,y+1,11,y],'#8a7a5a',.7);ell(g,0,-12,2.4,2.4,'#ffd84a',{lw:.5});});
/* Ступа-самоходка: ступа с пестом, глазастая */
art('luk_stupa',46,g=>{ln(g,[8,-20,-6,8],'#c8a070',3.4);ell(g,9,-21,3,2.6,'#c8a070');
  shp(g,'#8a5a32',{},[-14,-10,14,18],()=>{g.moveTo(-14,-10);g.lineTo(14,-10);g.lineTo(10,16);g.quadraticCurveTo(0,20,-10,16);g.closePath();});
  ell(g,0,-10,14,3.6,'#5a3a1e');for(const y of[-3,6])ln(g,[-12,y,12,y],'#5a3a1e',1.2);
  eye(g,-5,2,2.6,{angry:1,px:1});eye(g,5,2,2.6,{angry:1,flipB:1,px:1});mouth(g,0,10,3,'#3a1a10');shine(g,-8,-4,3,5,.25);
  for(const x of[-9,9])ell(g,x,20,3.4,1.6,'rgba(120,100,70,.4)',{ol:false,flat:1});});
/* Колдун-носильщик: колдун с мешком за спиной */
art('luk_nosil',48,g=>{ell(g,-12,0,10,12,'#a8885a');ln(g,[-14,-12,-10,-14,-6,-11],'#6a5030',1.6);ln(g,[-6,-6,6,2],'#6a5030',1.6);
  ART.koldun.fn(g);over(g,'#3a6aa8',.18);});
/* Колдун-похититель (босс гл.2): большой колдун с бородой и арканом */
art('luk_kold',96,g=>{g.save();g.scale(1.9,1.9);ART.koldun.fn(g);g.restore();over(g,'#2a2a6a',.18);
  shp(g,'#d8d8e0',{},[-9,-4,9,26],()=>{g.moveTo(-9,-4);g.quadraticCurveTo(-8,16,0,26);g.quadraticCurveTo(8,16,9,-4);g.quadraticCurveTo(0,2,-9,-4);});
  g.beginPath();g.ellipse(-30,8,9,13,.3,0,TAU);g.lineWidth=2.4;g.strokeStyle='#c8a060';g.stroke();ln(g,[-24,0,-14,14],'#c8a060',2.4);});
/* Морок (вожак, морочит копиями) */
artTint('luk_morok','prizr','#9a7aff');
/* Морской витязь: в золотой чешуе, шлем-шишак, круглый щит */
art('luk_vit',56,g=>{ell(g,-6,22,6,3.4,'#5a3a22');ell(g,6,22,6,3.4,'#5a3a22');
  ell(g,0,7,14,15,'#e0b13f');for(const y of[0,6,12])for(const x of[-8,-2,4])g.beginPath(),g.arc(x+(y%12?3:0),y,3,0,Math.PI),g.strokeStyle='#9a7010',g.lineWidth=.9,g.stroke();
  ln(g,[13,4,22,-22],'#9aa3b0',2.4);poly(g,[19,-20,22,-30,25,-19],'#e6eef6');
  ell(g,-14,8,9,10,'#2a7ab0');ell(g,-14,8,3,3.4,'#ffd84a');
  ell(g,0,-10,8,8,'#f4c9a3');ell(g,0,-5,7,4,'#8a5a2a',{ol:false});eye(g,-3,-11,1.6,{px:0});eye(g,3,-11,1.6,{px:0});
  shp(g,'#c2ccd8',{},[-9,-26,9,-12],()=>{g.moveTo(-9,-12);g.quadraticCurveTo(-8,-22,0,-26);g.quadraticCurveTo(8,-22,9,-12);g.closePath();});ln(g,[-9,-13,9,-13],'#e6b53a',2);
  for(const [x,y] of[[-20,-6],[18,12]])ell(g,x,y,1.6,2.4,'#8ad0ff',{ol:false});shine(g,-5,2,5,2.4,.3);});
/* Карла (свита Черномора): маленький бородач в красном колпаке */
art('luk_karla',30,g=>{ell(g,-3,11,3,1.8,'#5a3a22');ell(g,3,11,3,1.8,'#5a3a22');ell(g,0,4,7,7,'#6a4aa8');
  ell(g,0,-4,5.4,5,'#f4c9a3');shp(g,'#e8e0d0',{},[-5,-3,5,9],()=>{g.moveTo(-5,-3);g.quadraticCurveTo(-3,6,0,9);g.quadraticCurveTo(3,6,5,-3);g.quadraticCurveTo(0,0,-5,-3);});
  eye(g,-2,-5,1.2,{angry:1,px:0});eye(g,2,-5,1.2,{angry:1,flipB:1,px:0});poly(g,[-6,-7,6,-7,3,-15,-1,-13],'#d8313d');});
/* Черномор (главный босс): крошечный старичок, борода-коса до земли, высокая шапка-невидимка */
art('luk_chern',112,g=>{ell(g,0,40,30,7,'rgba(0,0,0,.18)',{ol:false,flat:1});
  ell(g,-8,30,6,3.6,'#6a1a2a');ell(g,8,30,6,3.6,'#6a1a2a');
  shp(g,'#8a1a5a',{},[-17,-6,17,30],()=>{g.moveTo(-8,-6);g.lineTo(8,-6);g.quadraticCurveTo(16,14,17,30);g.lineTo(-17,30);g.quadraticCurveTo(-16,14,-8,-6);});
  for(const x of[-10,0,10])ell(g,x,22,2,2,'#ffd84a',{lw:.4});
  const bp=[0,-6,-4,10,2,24,14,32,30,33,42,30,50,34];ln(g,bp,'#6a6e80',11);ln(g,bp,'#eceef4',8);
  for(let i=2;i<bp.length-2;i+=2)ln(g,[bp[i]-3,bp[i+1]-2,bp[i]+3,bp[i+1]+2],'#a8acc0',1.4);
  shp(g,'#eceef4',{},[-11,-10,11,12],()=>{g.moveTo(-10,-10);g.quadraticCurveTo(-9,6,0,12);g.quadraticCurveTo(9,6,10,-10);g.closePath();});
  ell(g,0,-14,9,8.6,'#f4c9a3');ell(g,-8,-12,3,2.4,'#f4c9a3');ell(g,8,-12,3,2.4,'#f4c9a3');
  eye(g,-3.4,-15,2,{angry:1,px:0});eye(g,3.4,-15,2,{angry:1,flipB:1,px:0});ell(g,0,-11,2.6,2,'#e8a080');
  ln(g,[-7,-8,-1,-6],'#eceef4',3);ln(g,[7,-8,1,-6],'#eceef4',3);
  shp(g,'#3a2a8a',{},[-12,-50,12,-20],()=>{g.moveTo(-12,-21);g.quadraticCurveTo(-6,-40,4,-50);g.quadraticCurveTo(4,-36,12,-21);g.closePath();});
  ell(g,0,-21,13,3.2,'#e6b53a');for(const [x,y] of[[-3,-31],[3,-38],[5,-27]])ell(g,x,y,1.6,1.6,'#ffe88a',{ol:false});shine(g,-6,-30,2.4,5,.3);});
/* декор: золотой дуб с цепью, пенная волна, цепь в песке, следы невиданных зверей */
art('luk_dub',120,g=>{ell(g,8,44,34,10,'rgba(0,0,0,.18)',{ol:false,flat:1});
  shp(g,'#7a5230',{},[-10,-4,10,46],()=>{g.moveTo(-8,-4);g.quadraticCurveTo(-6,30,-14,46);g.lineTo(14,46);g.quadraticCurveTo(6,30,8,-4);g.closePath();});
  for(const [x,y,r] of[[-24,-10,20],[24,-12,21],[0,-30,24],[-10,-2,18],[12,0,18]])ell(g,x,y,r,r*.88,'#4a9a3e');ell(g,-6,-22,15,10,'#63b552',{ol:false});
  for(const [x,y] of[[-18,-16],[8,-34],[20,-6],[-4,-6],[26,-22]])ell(g,x,y,2.2,2.8,'#e6b53a',{lw:.5});
  chain(g,[-12,28,0,34,12,28],1.8);chain(g,[-11,18,0,22,11,18],1.8);shine(g,-12,-36,9,4,.28);});
art('luk_volna',72,g=>{shp(g,'#5ab0d8',{ol:false},[-34,-6,34,12],()=>{g.moveTo(-34,12);g.quadraticCurveTo(-20,-6,-4,2);g.quadraticCurveTo(10,-8,22,0);g.quadraticCurveTo(30,4,34,12);g.closePath();});
  for(const [x,y,r] of[[-20,2,5],[-12,-1,4],[-4,2,4.4],[8,-2,5],[18,0,4],[26,4,3.4]])ell(g,x,y,r,r*.7,'#ffffff',{lw:.6,olc:'#8ac8e8'});
  for(const x of[-26,-6,14])ln(g,[x,9,x+8,8],'rgba(255,255,255,.7)',1.2);});
art('luk_cep',44,g=>{ell(g,1,4,16,6,'rgba(0,0,0,.14)',{ol:false,flat:1});chain(g,[-14,2,-6,-4,4,-2,8,6,-2,8,-10,4,0,0,12,-6,16,-2],2.4);});
art('luk_sled',40,g=>{for(const [x,y,a] of[[-9,8,.3],[4,-2,.2],[-4,-12,.4],[10,-16,.3]]){g.save();g.translate(x,y);g.rotate(a);
  ell(g,0,0,3.6,4.4,'rgba(110,90,50,.45)',{ol:false,flat:1});for(const d of[-3,0,3])ell(g,d,-6,1.4,2,'rgba(110,90,50,.45)',{ol:false,flat:1});g.restore();}});
})();
