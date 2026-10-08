'use strict';
/* OB:CH — рисунки темы «Медной горы царство» перенесены из «Богатыря» как есть (~/Projects/bogatyr/js/th/med-art.js, T-med, коммит cb43225): тот же art()/artTint() */
/* рисунки темы med «Медной горы царство» (T-med, A34): только art()/artTint() из js/art.js; помощники — внутри (function(){…})(). Все смотрят вправо */
(function(){
const MAL='#2f9a62',MALD='#1f6a46',CU='#d8843a',CUL='#f0b070';
// малахитовые прожилки (волнистые полосы) поверх уже нарисованной формы
function veins(g,x,y,w,n,col,gp){gp=gp||4;g.save();g.globalCompositeOperation='source-atop';g.strokeStyle=col||MALD;g.lineWidth=1.3;
  for(let i=0;i<n;i++){const yy=y+i*gp;g.beginPath();g.moveTo(x-w,yy);g.bezierCurveTo(x-w/3,yy-4,x+w/3,yy+4,x+w,yy-1);g.stroke();}g.restore();}
function gm(g,x,y,s,col){g.save();g.translate(x,y);glow(g,0,0,s*2,col);gem(g,s,col);g.restore();}
// Ящерка-самоцветка: зелёная ящерка с самоцветами на спине
art('med_yash',38,g=>{ln(g,[-6,3,-13,6,-17,2,-15,-3],'#2a7a4a',3.2);
  for(const [x,s] of[[-5,1],[5,1]]){ln(g,[x,4,x-3,10],'#2a7a4a',2.2);ln(g,[x+2,4,x+4,10],'#2a7a4a',2.2);}
  ell(g,0,2,9,5,'#3fbf7f');ell(g,10,-1,5.5,4,'#3fbf7f');ell(g,1,4,6,2,'#9ae0b0',{ol:false});
  eye(g,11.5,-2.5,1.7,{white:'#ffe14a',col:'#1a2a10',px:.4});gm(g,-3,-2.6,1.8,'#7ae0ff');gm(g,2.5,-3,1.6,'#ff6a8a');shine(g,-2,-1,4,1.4,.35);});
// Каменный глыбник: валун с малахитовыми жилами и кулаками-камнями
art('med_glyb',48,g=>{ell(g,-14,8,6,5,'#6a7068');ell(g,15,7,6,5,'#6a7068');
  poly(g,[-14,-6,-8,-16,6,-17,15,-7,15,10,6,17,-9,17,-15,9],'#7a8078',{hl:.35});veins(g,0,-9,15,3,'#3a9a6a',7);
  ell(g,-6,9,2.2,1.6,CU,{ol:false});ell(g,7,12,1.8,1.3,CUL,{ol:false});
  ell(g,-4.5,-6,2.8,2,'#1a1a14',{ol:false,flat:true});ell(g,4.5,-6,2.8,2,'#1a1a14',{ol:false,flat:true});glow(g,-4.5,-6,4,'#ffa040');glow(g,4.5,-6,4,'#ffa040');
  ln(g,[-8,-10,-2,-8],'#3a3a34',2);ln(g,[8,-10,2,-8],'#3a3a34',2);ln(g,[-4,1,4,1],'#3a3a34',1.6);shine(g,-7,-12,5,2,.3);});
// Чудь белоглазая: маленький рудокоп в капюшоне, глаза-фонарики, кирка
function chud(g){ln(g,[6,4,15,-12],'#6a4422',2.2);poly(g,[9,-15,15,-12,21,-15,15,-11],CU,{lw:.8});
  ell(g,-4,15,3.5,2,'#3a2a1a');ell(g,4,15,3.5,2,'#3a2a1a');
  shp(g,'#6a5a46',{},[-11,-14,11,15],()=>{g.moveTo(0,-14);g.quadraticCurveTo(11,-12,11,14);g.quadraticCurveTo(0,17,-11,14);g.quadraticCurveTo(-11,-12,0,-14);});
  ell(g,0,-4,6.5,6,'#d8d2c0');ell(g,8,3,3,3,'#d8d2c0');
  for(const x of[-2.5,2.5]){glow(g,x,-5,4,'#e8fff8');ell(g,x,-5,1.8,2,'#ffffff',{ol:false,flat:true});}
  ln(g,[-6,-11,0,-14,6,-11],'#4a3e30',1.4);}
art('med_chud',42,chud);
// Медная змейка: изгиб буквой S
art('med_zmei',32,g=>{g.lineCap='round';ln(g,[-14,6,-8,1,-2,6,4,2,9,-3],'#6a3a14',6.4);ln(g,[-14,6,-8,1,-2,6,4,2,9,-3],CU,4.6);ln(g,[-12,5,-8,2.5,-2,5],CUL,1.2);
  ell(g,11,-4,4.6,3.6,CU);ln(g,[15,-4,18,-4,19,-5.5],'#e03a3a',.9);eye(g,12,-5.4,1.4,{white:'#ffe14a',px:.3});});
// Рудничный упырь — перекраска упыря в зелень
artTint('med_upyr','upyr','#4a8a6a');
// Самоцветный жук: панцирь-самоцвет
art('med_zhuk',32,g=>{for(const y of[-4,1,6]){ln(g,[-3,y,-10,y+3],'#1a1a24',1.6);ln(g,[3,y,10,y+3],'#1a1a24',1.6);}
  ell(g,0,-9,4.5,3.6,'#2a2a3a');ln(g,[-2,-11,-5,-15],'#2a2a3a',1);ln(g,[2,-11,5,-15],'#2a2a3a',1);
  ell(g,0,2,8,9.5,'#3a2a5a');poly(g,[0,-6,7,0,4,9,-4,9,-7,0],'#4ad0c8',{hl:.8});ln(g,[0,-6,0,9],'rgba(255,255,255,.5)',1);
  eye(g,-2,-10,1.2,{px:0});eye(g,2,-10,1.2,{px:0});shine(g,-3,-1,2.5,1.2,.6);});
// Чудь-старшина: большой чудь с бородой и медной каской-фонарём
art('med_chst',86,g=>{g.save();g.scale(1.9,1.9);chud(g);g.restore();
  shp(g,'#eeeae0',{},[-10,0,10,22],()=>{g.moveTo(-10,0);g.quadraticCurveTo(-8,16,0,22);g.quadraticCurveTo(8,16,10,0);g.quadraticCurveTo(0,6,-10,0);});
  shp(g,CU,{},[-14,-31,14,-18],()=>{g.moveTo(-14,-18);g.quadraticCurveTo(-13,-31,0,-31);g.quadraticCurveTo(13,-31,14,-18);g.closePath();});
  glow(g,0,-27,10,'#ffe48a');ell(g,0,-27,3,3,'#fff6c8',{ol:false});});
// Великий Полоз: голова в золотой короне над кольцом тела
art('med_poloz',104,g=>{ell(g,-6,26,30,14,'#a8661e');ell(g,-6,24,22,8,'#c88a3a',{ol:false});veins(g,-6,20,30,3,'#7a4a12');
  shp(g,'#c88a3a',{},[-14,-30,12,26],()=>{g.moveTo(-14,26);g.quadraticCurveTo(-18,-2,-2,-18);g.lineTo(12,-12);g.quadraticCurveTo(0,0,8,26);g.closePath();});
  shp(g,'#f0d8a0',{ol:false},[-6,-14,4,26],()=>{g.moveTo(-6,26);g.quadraticCurveTo(-10,0,2,-14);g.lineTo(5,-11);g.quadraticCurveTo(-4,4,2,26);g.closePath();});
  ell(g,8,-24,20,13,'#d8963a',{rot:.15});ell(g,22,-19,9,6,'#d8963a',{rot:.3});ln(g,[24,-15,34,-14,36,-17],'#e03a3a',1.4);
  mouth(g,22,-16,7,'#4a1a0a',0);fangs(g,23,-16,1.4);
  eye(g,10,-29,3.4,{white:'#ffe14a',col:'#1a1a0a',px:1.2,angry:1,flipB:1});
  poly(g,[-6,-34,-8,-46,-2,-39,3,-49,8,-39,14,-45,13,-33],'#ffd84a',{hl:.6});for(const x of[-2,3,9])gm(g,x,-38,1.8,'#3fdf8f');shine(g,2,-30,7,2.6,.35);});
// хвост Полоза — звено
art('med_hvost',52,g=>{ell(g,0,0,20,17,'#c88a3a');ell(g,0,4,13,9,'#f0d8a0',{ol:false});veins(g,0,-9,20,3,'#8a5a1a',6);
  for(const x of[-9,0,9])poly(g,[x-3,-14,x,-20,x+3,-14],MAL,{lw:.6});shine(g,-6,-7,6,2.4,.35);});
// Хозяйка Медной горы: малахитовое платье, коса, кокошник с самоцветами
art('med_hoz',112,g=>{
  shp(g,MAL,{},[-30,-18,30,50],()=>{g.moveTo(-9,-18);g.lineTo(9,-18);g.quadraticCurveTo(20,14,30,48);g.quadraticCurveTo(0,54,-30,48);g.quadraticCurveTo(-20,14,-9,-18);});
  veins(g,0,-10,30,7,MALD,8.5);ln(g,[-28,44,28,44],CU,2.2);ln(g,[0,-18,0,48],'rgba(240,176,112,.7)',1.6);
  ln(g,[-9,-36,-17,-10,-15,16,-19,34],'#3a2414',6.4);ln(g,[-9,-36,-17,-10,-15,16,-19,34],'#5a3a20',4.2);
  for(const y of[-14,0,14])ln(g,[-19,y,-13,y+3],'#2a180c',1.4);poly(g,[-19,34,-24,42,-14,40],'#e04a5a');
  ln(g,[8,-14,18,4,24,0],MAL,6.4);ln(g,[-8,-14,-16,4],MAL,6.4);ell(g,24,0,3.2,3,'#f2d2b4');ell(g,-16,5,3.2,3,'#f2d2b4');
  ell(g,0,-28,10,11.5,'#f2d2b4');eye(g,-3.6,-29,2.2,{col:'#1a7a4a',px:.2});eye(g,3.6,-29,2.2,{col:'#1a7a4a',px:.2});mouth(g,0,-22,2.6,'#b0404a',1);
  ell(g,-6,-25,2,1.2,'rgba(240,120,120,.4)',{ol:false,flat:true});ell(g,6,-25,2,1.2,'rgba(240,120,120,.4)',{ol:false,flat:true});
  shp(g,MAL,{},[-14,-54,14,-36],()=>{g.moveTo(-13,-36);g.quadraticCurveTo(-15,-52,0,-54);g.quadraticCurveTo(15,-52,13,-36);g.quadraticCurveTo(0,-41,-13,-36);});
  ln(g,[-13,-37,0,-42,13,-37],CUL,1.6);gm(g,0,-47,3.2,'#ff5a7a');gm(g,-7,-43,2,'#7ae0ff');gm(g,7,-43,2,'#7ae0ff');gm(g,0,-6,2.4,'#3fdf8f');shine(g,-12,10,6,3,.25);});
// Каменный цветок (фаза Хозяйки)
art('med_cvet',64,g=>{ln(g,[0,26,0,6],MALD,3);ell(g,-7,18,6,2.6,MAL,{rot:-.5});ell(g,7,16,6,2.6,MAL,{rot:.5});
  for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.45;ell(g,Math.cos(a)*12,Math.sin(a)*12+2,5,11,i%2?'#3fbf7f':'#2f9a62',{rot:a+Math.PI/2});}
  veins(g,0,-12,20,3,'#1f6a46',7);gm(g,0,0,4.4,'#ffe48a');});
// декор: малахит, медная руда, кристаллы, сталагмит, крепь с фонарём
art('med_d1',44,g=>{ell(g,3,8,16,6,'rgba(0,0,0,.2)',{ol:false,flat:true});poly(g,[-15,8,-11,-6,-1,-11,10,-7,15,8],MAL,{hl:.5});veins(g,0,-7,15,4,MALD);shine(g,-6,-5,4,1.6,.4);});
art('med_d2',42,g=>{ell(g,3,7,15,6,'rgba(0,0,0,.2)',{ol:false,flat:true});ell(g,-2,1,12,9,'#5a5a5e');ell(g,7,4,8,6,'#66666a');
  for(const [x,y,s] of[[-5,-1,2.6],[2,3,2],[8,2,1.8],[-1,-5,1.5]])ell(g,x,y,s,s*.8,CU,{hl:.8});shine(g,-6,-4,4,1.6,.3);});
art('med_d3',48,g=>{glow(g,0,2,22,'#3fdf8f');poly(g,[-4,14,-9,-2,-4,-17,1,-3,0,14],'#2fbf7f',{hl:.7});poly(g,[2,14,4,-7,10,-13,12,3,8,14],'#5ae0a8',{hl:.7});poly(g,[-12,14,-15,4,-9,6],'#7ae0ff',{hl:.7});});
art('med_d4',44,g=>{ell(g,0,16,11,4,'rgba(0,0,0,.2)',{ol:false,flat:true});poly(g,[-9,16,-3,-18,0,-20,4,-12,9,16],'#6a5e50',{hl:.4});ln(g,[-3,6,3,4],CU,1.4);poly(g,[8,16,12,2,15,16],'#5a5044');});
art('med_d5',52,g=>{ln(g,[-14,20,-14,-14],'#5a3a1e',4.4);ln(g,[14,20,14,-14],'#5a3a1e',4.4);ln(g,[-18,-14,18,-14],'#6a4422',5);
  ln(g,[4,-14,4,-6],'#2a2a2a',1);glow(g,4,-1,10,'#ffc84a');ell(g,4,-1,3,4,'#ffe48a',{lw:.8});});
})();
