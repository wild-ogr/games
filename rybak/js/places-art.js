/* Рыбалка с Петровичем — ПЕЙЗАЖИ НОВЫХ МЕСТ (NORTH, 08.10.2026). Журнал: hobby-analytics/release-i/rybak-boost/logs/NORTH.md
   Дальний берег мест, которых нет в switch paintFar (index.html): paintFar зовёт FAR_ART[look](g,W,H,hz,P,R,u,f,lit) в ветке default.
   Грузится в <head> после js/places.js; помощники (treeLine, pine, birch, house, church, mountains, mixH, rgba) берутся из игры в момент рисования.
   Стиль — как у старых мест: силуэты слоями, цвета через f() (свет времени суток и дымка), без анимации (фон строится один раз).
   Старые WebView: без ?. и ??, без inset. LOW (слабый телефон) не нужен: рисуется один раз на рыбалку. */
(function(){
'use strict';
// луковка купола: x — центр, yb — низ, w — ширина
function onion(g,x,yb,w,col){g.fillStyle=col;g.beginPath();g.moveTo(x-w*.5,yb);g.bezierCurveTo(x-w*.75,yb-w*.7,x-w*.08,yb-w*.95,x,yb-w*1.35);g.bezierCurveTo(x+w*.08,yb-w*.95,x+w*.75,yb-w*.7,x+w*.5,yb);g.closePath();g.fill();
  g.fillRect(x-w*.04,yb-w*1.7,w*.08,w*.4);g.fillRect(x-w*.18,yb-w*1.58,w*.36,w*.07);}
// барабан под луковкой
function drum(g,x,yb,w,h,wall,dome){g.fillStyle=wall;g.fillRect(x-w/2,yb-h,w,h);onion(g,x,yb-h,w*1.05,dome);}
// бревенчатые полоски на срубе
function logs(g,x,y,w,h,col,step){g.fillStyle=col;for(let yy=y+step*.5;yy<y+h;yy+=step)g.fillRect(x,yy,w,Math.max(.6,step*.18));}
// стог сена
function stack(g,x,yb,s,col,sh){g.fillStyle=col;g.beginPath();g.moveTo(x-s*.55,yb);g.quadraticCurveTo(x-s*.6,yb-s*.9,x,yb-s*1.15);g.quadraticCurveTo(x+s*.6,yb-s*.9,x+s*.55,yb);g.closePath();g.fill();
  g.fillStyle=sh;g.beginPath();g.moveTo(x+s*.05,yb-s*1.12);g.quadraticCurveTo(x+s*.6,yb-s*.9,x+s*.55,yb);g.lineTo(x+s*.15,yb);g.quadraticCurveTo(x+s*.3,yb-s*.6,x+s*.05,yb-s*1.12);g.fill();
  g.fillRect(x-s*.02,yb-s*1.35,s*.04,s*.25);}
// лодка-силуэт на воде у дальнего берега
function boat(g,x,y,s,col){g.fillStyle=col;g.beginPath();g.moveTo(x-s,y-s*.18);g.lineTo(x+s,y-s*.18);g.quadraticCurveTo(x+s*.7,y+s*.12,x+s*.4,y+s*.14);g.lineTo(x-s*.55,y+s*.14);g.quadraticCurveTo(x-s*.85,y+s*.1,x-s,y-s*.18);g.fill();}
// мягкие холмы (сопки, крутой берег)
function hills(g,W,yb,amp,base,col,R,n){g.fillStyle=col;g.beginPath();g.moveTo(-5,yb);const pts=[];for(let i=0;i<=n;i++)pts.push([W*i/n+(R()-.5)*W/n*.4,yb-base-amp*R()]);
  for(let i=0;i<pts.length;i++){const p=pts[i];if(!i){g.lineTo(-5,p[1]);continue;}const q=pts[i-1];g.quadraticCurveTo(q[0]+(p[0]-q[0])*.5,Math.min(p[1],q[1])-amp*.25,p[0],p[1]);}
  g.lineTo(W+5,pts[pts.length-1][1]);g.lineTo(W+5,yb);g.closePath();g.fill();}
// камыш полосой у дальнего уреза
function reeds(g,x0,x1,yb,h,col,R){g.strokeStyle=col;g.lineWidth=Math.max(.6,h*.06);g.beginPath();for(let x=x0;x<x1;x+=h*.18*(.6+R())){const hh=h*(.55+R()*.6),b=(R()-.5)*h*.25;g.moveTo(x,yb);g.quadraticCurveTo(x+b*.3,yb-hh*.6,x+b,yb-hh);}g.stroke();}
// северное сияние (вечер и ночь): полупрозрачные ленты в небе за берегом
function aurora(g,W,hz,u,R,tod){if(tod!=='night'&&tod!=='evening')return;const a=tod==='night'?1:.4;g.save();
  for(let k=0;k<3;k++){const y0=hz*(.3+k*.13),amp=u*(2.5+R()*3.5),ph=R()*6,len=u*(9+k*4),c=k===1?'130,215,255':'90,255,170';
    for(let x=-u;x<=W+u;x+=u*.55){const cy=y0+Math.sin(x/W*5+ph)*amp+Math.sin(x/W*13+ph*2)*amp*.3,l=len*(.65+.35*Math.sin(x/W*9+ph*1.7)),al=.2*a*(.55+.45*Math.sin(x/W*17+ph));
      const gr=g.createLinearGradient(0,cy-l,0,cy+u*1.2);gr.addColorStop(0,'rgba('+c+',0)');gr.addColorStop(.75,'rgba('+c+','+al.toFixed(3)+')');gr.addColorStop(1,'rgba('+c+',0)');
      g.fillStyle=gr;g.fillRect(x,cy-l,u*.62,l+u*1.2);}}
  g.restore();}
const FAR_ART={
  // ОКА (Рязанская): высокий правый берег с белой церковью и колокольней (как в Константинове), заливные луга, стога, берёзовые колки
  oka:function(g,W,H,hz,P,R,u,f,lit){
    // дальний лес дымкой
    treeLine(g,W,hz-u*5.5,u*2.2,u*3.2,f('#5f8a68'),R);
    // высокий крутой берег справа
    g.fillStyle=f('#6f9a4e');g.beginPath();g.moveTo(W*.38,hz);g.bezierCurveTo(W*.46,hz-u*7,W*.56,hz-u*8.5,W*.7,hz-u*8.8);g.lineTo(W+5,hz-u*9.2);g.lineTo(W+5,hz);g.closePath();g.fill();
    {const cg=g.createLinearGradient(0,hz-u*8.6,0,hz);cg.addColorStop(0,f('#d8b47a'));cg.addColorStop(1,f('#a87e4c'));g.fillStyle=cg; // обрыв (песок и глина)
     g.beginPath();g.moveTo(W*.5,hz);g.lineTo(W*.56,hz-u*7.6);g.lineTo(W*.66,hz-u*8.6);g.lineTo(W*.98,hz-u*8.8);g.lineTo(W+5,hz-u*8.9);g.lineTo(W+5,hz-u*2.4);g.quadraticCurveTo(W*.8,hz-u*3.4,W*.64,hz);g.closePath();g.fill();
     g.strokeStyle=rgba(f('#7a5a36'),.45);g.lineWidth=Math.max(.6,u*.14);g.beginPath();for(let i=0;i<18;i++){const x=W*(.56+R()*.42),y=hz-u*(7.6+R()*.9);g.moveTo(x,y);g.lineTo(x+(R()-.5)*u,y+u*(2+R()*3));}g.stroke();
     g.fillStyle=f('#5f8a46');g.beginPath();g.moveTo(W*.55,hz-u*7.5);for(let x=W*.55;x<=W+5;x+=u*1.1)g.lineTo(x,hz-u*(8.9+R()*.6));g.lineTo(W+5,hz-u*8.4);g.lineTo(W*.56,hz-u*7.2);g.closePath();g.fill();}
    treeLine(g,W,hz-u*9.6,u*1.6,u*2.2,f('#477a43'),R);
    // церковь и колокольня на круче
    const cx=W*.8,cy=hz-u*9.3;church(g,cx,cy,u*4.6,f('#f4f1e8'),f('#e0b030'));
    g.fillStyle=f('#f4f1e8');g.fillRect(cx-u*7.4,cy-u*7.2,u*2.4,u*7.2);g.fillRect(cx-u*7.1,cy-u*9,u*1.8,u*1.9);
    g.fillStyle=f('#5a8a6a');g.beginPath();g.moveTo(cx-u*7.35,cy-u*9);g.lineTo(cx-u*6.2,cy-u*12.4);g.lineTo(cx-u*5.05,cy-u*9);g.closePath();g.fill();
    g.fillStyle=f('#e0b030');g.fillRect(cx-u*6.25,cy-u*13.4,u*.12,u*1.1);g.fillStyle=lit?'#ffd66b':f('#8a8a7a');g.fillRect(cx-u*6.6,cy-u*6,u*.8,u*1.2);
    for(let i=0;i<5;i++)birch(g,W*(.9+i*.025),cy+u*.4,u*(5+R()*2),f('#eeeae0'),f(i%2?'#6f9a45':'#86ad52'),R);
    // заливной луг слева: полоса травы, стога, берёзовые колки
    g.fillStyle=f('#9cbf62');g.beginPath();g.moveTo(-5,hz);g.lineTo(-5,hz-u*2.6);g.quadraticCurveTo(W*.2,hz-u*3.4,W*.42,hz-u*1.2);g.lineTo(W*.46,hz);g.closePath();g.fill();
    g.fillStyle=f('#d8c070');g.fillRect(0,hz-u*2.2,W*.36,u*.35);
    for(let i=0;i<3;i++){const x=W*(.06+i*.1);for(let j=0;j<3;j++)birch(g,x+j*u*1.4+R()*u,hz-u*2.2,u*(4.5+R()*2.5),f('#eeeae0'),f(j%2?'#7aa34d':'#6f9a45'),R);}
    stack(g,W*.17,hz-u*1.1,u*2.2,f('#c8a050'),f('#a07a38'));stack(g,W*.25,hz-u*.9,u*1.8,f('#c8a050'),f('#a07a38'));stack(g,W*.33,hz-u*.6,u*1.5,f('#c8a050'),f('#a07a38'));
    g.fillStyle=f('#86ad52');g.fillRect(0,hz-u*.7,W,u*.8);},
  // ЧУДСКОЕ: огромное плоское озеро — дальний берег ниткой, остров с белой церковкой, рыбацкие лодки, сети на кольях, камыш
  chud:function(g,W,H,hz,P,R,u,f,lit){
    treeLine(g,W,hz-u*.4,u*1,u*1.6,f('#4f7656'),R);g.fillStyle=f('#5f855e');g.fillRect(0,hz-u*.6,W,u*.7);
    // остров с церковкой и избами (как Талабские острова)
    g.fillStyle=f('#5c8458');g.beginPath();g.ellipse(W*.66,hz,u*13,u*2.6,0,Math.PI,0);g.fill();
    for(let i=0;i<9;i++)pine(g,W*.57+R()*u*18,hz-u*1.4,u*(3.5+R()*3),f(i%2?'#2f5236':'#3a6040'));
    house(g,W*.62,hz-u*1.6,u*3,u*2,f('#8a6a48'),f('#6a5a4a'),lit);house(g,W*.71,hz-u*1.7,u*2.6,u*1.8,f('#94744e'),f('#7a4a3a'),lit);
    church(g,W*.665,hz-u*2,u*2.8,f('#f2eee4'),f('#7a9aa8'));
    // мостки и сети на кольях у деревни
    g.fillStyle=f('#6a5238');g.fillRect(W*.08,hz-u*.9,W*.2,u*.35);g.strokeStyle=f('#4a3a2a');g.lineWidth=Math.max(.8,u*.22);g.beginPath();for(let i=0;i<6;i++){const x=W*.09+i*u*3;g.moveTo(x,hz);g.lineTo(x,hz-u*3.6);}g.stroke();
    g.strokeStyle=rgba(f('#3a3226'),.6);g.lineWidth=Math.max(.5,u*.1);g.beginPath();for(let i=0;i<5;i++){const x=W*.09+i*u*3;for(let k=0;k<5;k++){const y=hz-u*(3.3-k*.55);g.moveTo(x,y);g.quadraticCurveTo(x+u*1.5,y+u*.5,x+u*3,y);}
      for(let k=1;k<6;k++){g.moveTo(x+k*u*.5,hz-u*3.3);g.lineTo(x+k*u*.5,hz-u*1.1);}}g.stroke();
    // лодки рыбаков у дальнего берега, на одной — парус
    boat(g,W*.4,hz-u*.35,u*1.6,f('#3a3a34'));boat(g,W*.9,hz-u*.3,u*1.1,f('#3a3a34'));
    g.fillStyle=f('#3a3a34');g.fillRect(W*.4-u*.1,hz-u*4.2,u*.2,u*3.9);g.fillStyle=f('#e8e2d0');g.beginPath();g.moveTo(W*.4+u*.15,hz-u*4);g.lineTo(W*.4+u*2.2,hz-u*.9);g.lineTo(W*.4+u*.15,hz-u*.9);g.closePath();g.fill();
    reeds(g,-5,W*.06,hz,u*2.6,f('#7a8a4a'),R);reeds(g,W*.3,W*.36,hz,u*2,f('#7a8a4a'),R);reeds(g,W*.8,W+5,hz,u*2.2,f('#7a8a4a'),R);},
  // ОНЕЖСКОЕ: остров Кижи — многоглавая деревянная церковь (пирамида куполов), колокольня, ельник, скалистые луды
  onego:function(g,W,H,hz,P,R,u,f,lit){
    treeLine(g,W,hz-u*1.2,u*1.8,u*2.6,f('#3e6448'),R);
    for(let i=0;i<14;i++)pine(g,R()*W*.45,hz-u*1,u*(5+R()*5),f(i%2?'#26492e':'#2e5536'));
    // остров
    g.fillStyle=f('#6f8a52');g.beginPath();g.ellipse(W*.66,hz,u*20,u*3.4,0,Math.PI,0);g.fill();g.fillStyle=f('#8a9a5a');g.fillRect(W*.66-u*16,hz-u*1.2,u*32,u*.4);
    // Преображенская церковь: ярусы-срубы и луковки (серебристый осиновый лемех)
    const x=W*.62,yb=hz-u*2,s=u*1.15,wall=f('#8a6a46'),wd=f('#6a5036'),dm=f('#c9ccc8');
    const tiers=[[9,5.5],[6.4,4],[4.4,3.4],[2.8,3],[1.6,2.6]];let y=yb;
    for(let t=0;t<tiers.length;t++){const w=tiers[t][0]*s,h=tiers[t][1]*s;g.fillStyle=wall;g.fillRect(x-w/2,y-h,w,h);logs(g,x-w/2,y-h,w,h,wd,s*.7);
      g.fillStyle=f('#7a6a5a');g.beginPath();g.moveTo(x-w*.62,y-h);g.lineTo(x,y-h-s*1.1);g.lineTo(x+w*.62,y-h);g.closePath();g.fill();
      const ny=y-h-s*.2;if(t<tiers.length-1){for(const k of [-.5,.5])drum(g,x+k*w*.9,ny+s*.4,s*1.1,s*1.1,wall,dm);if(t<2)for(const k of [-.25,.25])drum(g,x+k*w*.9,ny+s*.1,s*.9,s*.8,wall,dm);}
      y=y-h;}
    drum(g,x,y-s*.6,s*2,s*1.6,wall,dm);
    // Покровская церковь и шатровая колокольня рядом
    const x2=W*.76;g.fillStyle=wall;g.fillRect(x2-s*3.2,yb-s*5,s*6.4,s*5);logs(g,x2-s*3.2,yb-s*5,s*6.4,s*5,wd,s*.7);
    g.fillStyle=f('#7a6a5a');g.beginPath();g.moveTo(x2-s*3.6,yb-s*5);g.lineTo(x2,yb-s*7);g.lineTo(x2+s*3.6,yb-s*5);g.fill();
    for(const k of [-2,-1,0,1,2])drum(g,x2+k*s*1.1,yb-s*(k===0?7.2:6.3-Math.abs(k)*.3),s*.85,s*.8,wall,dm);
    const x3=W*.53;g.fillStyle=wall;g.fillRect(x3-s*1.3,yb-s*6,s*2.6,s*6);logs(g,x3-s*1.3,yb-s*6,s*2.6,s*6,wd,s*.7);
    g.fillStyle=dm;g.beginPath();g.moveTo(x3-s*1.5,yb-s*6);g.lineTo(x3,yb-s*10.5);g.lineTo(x3+s*1.5,yb-s*6);g.fill();onion(g,x3,yb-s*10.4,s*.7,dm);
    if(lit){g.fillStyle='#ffd66b';g.fillRect(x2-s*.4,yb-s*2.6,s*.8,s*1);}
    // ели на острове и луды-валуны у воды
    for(let i=0;i<7;i++)pine(g,W*(.48+R()*.4),hz-u*1.2,u*(3+R()*2.5),f(i%2?'#2e4f34':'#36593c'));
    g.fillStyle=f('#8a8e90');for(let i=0;i<6;i++){g.beginPath();g.ellipse(W*(.45+R()*.45),hz-u*.1,u*(1+R()*1.6),u*(.6+R()*.6),0,Math.PI,0);g.fill();}
    reeds(g,W*.02,W*.2,hz+u*.3,u*2,f('#6f7f48'),R);},
  // ВАРЗУГА (Кольский): сопки с редколесьем, валуны и пороги, шатровая Успенская церковь, северное сияние вечером и ночью
  varzuga:function(g,W,H,hz,P,R,u,f,lit){
    aurora(g,W,hz,u,R,P.tod);
    hills(g,W,hz,u*5,u*6,f('#6e7c86'),R,5);hills(g,W,hz,u*3,u*3.5,f('#5d6e62'),R,7);
    for(let i=0;i<16;i++){const x=R()*W;if(R()<.5)pine(g,x,hz-u*1.5,u*(3+R()*3),f(i%2?'#2c4632':'#344f38'));else birch(g,x,hz-u*1.3,u*(3+R()*2.5),f('#e6e2d8'),f(i%3?'#b8a040':'#8aa048'),R);}
    g.fillStyle=f('#6b7a4a');g.fillRect(0,hz-u*1.6,W,u*1.7);
    // Успенская церковь (шатёр) и изба на берегу
    const x=W*.3,yb=hz-u*1.6,s=u*1.1,wall=f('#7a5e40'),wd=f('#5a4430');
    g.fillStyle=wall;g.fillRect(x-s*2.4,yb-s*4.2,s*4.8,s*4.2);logs(g,x-s*2.4,yb-s*4.2,s*4.8,s*4.2,wd,s*.7);g.fillRect(x+s*2.4,yb-s*2.6,s*3,s*2.6);logs(g,x+s*2.4,yb-s*2.6,s*3,s*2.6,wd,s*.7);
    g.fillStyle=f('#5a5048');g.beginPath();g.moveTo(x+s*2.2,yb-s*2.6);g.lineTo(x+s*3.9,yb-s*3.8);g.lineTo(x+s*5.6,yb-s*2.6);g.fill();
    g.fillStyle=wall;g.fillRect(x-s*1.6,yb-s*5.6,s*3.2,s*1.4);
    g.fillStyle=f('#8a8278');g.beginPath();g.moveTo(x-s*1.8,yb-s*5.6);g.lineTo(x,yb-s*11.5);g.lineTo(x+s*1.8,yb-s*5.6);g.closePath();g.fill();
    g.strokeStyle=rgba(f('#4a4440'),.5);g.lineWidth=Math.max(.5,u*.08);g.beginPath();for(let k=1;k<4;k++){g.moveTo(x,yb-s*11.5);g.lineTo(x-s*1.8+k*s*.9,yb-s*5.6);}g.stroke();
    onion(g,x,yb-s*11.4,s*.8,f('#8aa0a8'));if(lit){g.fillStyle='#ffd66b';g.fillRect(x+s*3.5,yb-s*1.8,s*.8,s*.8);}
    house(g,W*.62,hz-u*1.4,u*3.2,u*2.2,f('#7a5e40'),f('#5a5048'),lit);
    // пороги: белые гребни и валуны поперёк реки у дальнего берега
    g.fillStyle=f('#5f6a70');g.fillRect(0,hz-u*.9,W,u*.9);
    g.fillStyle=f('#7d8488');for(let i=0;i<12;i++){g.beginPath();g.ellipse(W*(.02+i*.085)+R()*u*3,hz,u*(1.1+R()*1.6),u*(.8+R()*.7),0,Math.PI,0);g.fill();}
    g.fillStyle=f('#9aa2a6');for(let i=0;i<12;i++){g.beginPath();g.ellipse(W*(.04+i*.085)+R()*u*2,hz-u*.2,u*(.5+R()*.6),u*(.35+R()*.3),0,Math.PI,0);g.fill();}
    g.strokeStyle=rgba('#ffffff',P.tod==='night'?.35:.75);g.lineWidth=Math.max(.6,u*.3);g.beginPath();for(let i=0;i<22;i++){const x0=R()*W,l=u*(1.5+R()*3.5),y=hz-u*(.1+R()*.5);g.moveTo(x0,y);g.quadraticCurveTo(x0+l*.5,y-u*.45,x0+l,y);}g.stroke();}
,
  // БЕЛОЕ МОРЕ (Соловки): кремль из валунов с круглыми башнями под деревянными шатрами, соборы с главами, низкий лес, парусник
  solovki:function(g,W,H,hz,P,R,u,f,lit){
    treeLine(g,W,hz-u*1.2,u*1.6,u*2.4,f('#41654a'),R);for(let i=0;i<10;i++)pine(g,R()*W,hz-u*1,u*(3+R()*3),f(i%2?'#2c4a33':'#35573c'));
    g.fillStyle=f('#7d8a5a');g.fillRect(0,hz-u*1.4,W,u*1.5);
    const x0=W*.42,x1=W*.92,wy=hz-u*1.4,wh=u*3.4,stone=f('#8c8a80'),dk=f('#6c6a62'),roof=f('#5a4636');
    // соборы за стеной: Преображенский (пять тёмных глав) и колокольня
    const cx=W*.64;g.fillStyle=f('#ece8de');g.fillRect(cx-u*3.2,wy-u*8,u*6.4,u*8);g.fillStyle=f('#d8d2c4');g.fillRect(cx-u*3.2,wy-u*8,u*1.1,u*8);
    for(const [dx,dy,w] of [[0,-10.4,1.8],[-2.2,-9.2,1.2],[2.2,-9.2,1.2]]){g.fillStyle=f('#ece8de');g.fillRect(cx+dx*u-w*u*.35,wy+dy*u+u*1.2,w*u*.7,u*1.2);
      g.fillStyle=f('#3a3e44');g.beginPath();g.moveTo(cx+dx*u-w*u*.5,wy+dy*u+u*1.2);g.bezierCurveTo(cx+dx*u-w*u*.75,wy+dy*u-w*u*.3,cx+dx*u-w*u*.1,wy+dy*u-w*u*.6,cx+dx*u,wy+dy*u-w*u*.95);g.bezierCurveTo(cx+dx*u+w*u*.1,wy+dy*u-w*u*.6,cx+dx*u+w*u*.75,wy+dy*u-w*u*.3,cx+dx*u+w*u*.5,wy+dy*u+u*1.2);g.fill();}
    const bx=W*.78;g.fillStyle=f('#ece8de');g.fillRect(bx-u*1.1,wy-u*9.5,u*2.2,u*9.5);g.fillStyle=f('#46505a');g.beginPath();g.moveTo(bx-u*1.3,wy-u*9.5);g.lineTo(bx,wy-u*13);g.lineTo(bx+u*1.3,wy-u*9.5);g.fill();
    g.fillStyle=f('#c8a040');g.fillRect(bx-u*.06,wy-u*14,u*.12,u*1.1);if(lit){g.fillStyle='#ffd66b';g.fillRect(bx-u*.35,wy-u*7.5,u*.7,u*1);}
    // стена из валунов
    g.fillStyle=stone;g.fillRect(x0,wy-wh,x1-x0,wh);const PR=rng(77);for(let yy=wy-wh+u*.4;yy<wy;yy+=u*.85)for(let xx=x0+(PR()*u);xx<x1;xx+=u*(1+PR()*.9)){g.fillStyle=PR()<.5?dk:f('#9c9a90');g.beginPath();g.ellipse(xx,yy,u*(.4+PR()*.3),u*.33,0,0,7);g.fill();}
    // круглые башни с шатрами
    for(const tx of [x0,W*.58,W*.74,x1]){const tw=u*2.6,th=wh*1.45;g.fillStyle=stone;g.fillRect(tx-tw/2,wy-th,tw,th);g.fillStyle=dk;g.fillRect(tx-tw/2,wy-th,tw*.22,th);
      g.fillStyle=roof;g.beginPath();g.moveTo(tx-tw*.62,wy-th);g.lineTo(tx,wy-th-u*3.6);g.lineTo(tx+tw*.62,wy-th);g.closePath();g.fill();g.fillStyle=f('#2a2a28');g.fillRect(tx-u*.25,wy-th*.6,u*.5,u*.7);}
    // валуны на литорали и парусник
    g.fillStyle=f('#7d8488');for(let i=0;i<10;i++){g.beginPath();g.ellipse(R()*W,hz,u*(.8+R()*1.4),u*(.5+R()*.4),0,Math.PI,0);g.fill();}
    const sx=W*.2,sy=hz-u*.2;g.fillStyle=f('#3a342c');g.beginPath();g.moveTo(sx-u*3,sy-u*.8);g.lineTo(sx+u*3,sy-u*.8);g.lineTo(sx+u*2.2,sy);g.lineTo(sx-u*2.4,sy);g.closePath();g.fill();
    g.fillRect(sx-u*.1,sy-u*7,u*.2,u*6.3);g.fillStyle=f('#efe6d0');g.beginPath();g.moveTo(sx+u*.2,sy-u*6.8);g.quadraticCurveTo(sx+u*2.6,sy-u*4,sx+u*2.2,sy-u*1.2);g.lineTo(sx+u*.2,sy-u*1.2);g.closePath();g.fill();
    g.beginPath();g.moveTo(sx-u*.2,sy-u*6);g.quadraticCurveTo(sx-u*2,sy-u*3.5,sx-u*1.8,sy-u*1.4);g.lineTo(sx-u*.2,sy-u*1.4);g.closePath();g.fill();},
  // БАРЕНЦЕВО МОРЕ (Териберка): голые сопки и скалы, ржавые шхуны на камнях, домики, кит фонтанит; ночью — сияние
  teriberka:function(g,W,H,hz,P,R,u,f,lit){
    aurora(g,W,hz,u,R,P.tod);
    hills(g,W,hz,u*7,u*5,f('#7a8088'),R,6);hills(g,W,hz,u*4,u*2.5,f('#646c66'),R,9);
    g.fillStyle=rgba(f('#8a8a6a'),.45);for(let i=0;i<10;i++){const x=R()*W,y=hz-u*(1+R()*2.2);g.beginPath();g.moveTo(x-u*2,y+u*.3);g.quadraticCurveTo(x,y-u*.5,x+u*2.2,y+u*.3);g.closePath();g.fill();} // мох по склонам
    // скала-мыс справа
    g.fillStyle=f('#545a5e');g.beginPath();g.moveTo(W*.78,hz);g.lineTo(W*.82,hz-u*9);g.lineTo(W*.87,hz-u*11);g.lineTo(W*.93,hz-u*8);g.lineTo(W+5,hz-u*9.5);g.lineTo(W+5,hz);g.closePath();g.fill();
    g.strokeStyle=rgba(f('#3a3e42'),.6);g.lineWidth=Math.max(.6,u*.2);g.beginPath();for(let i=0;i<7;i++){const x=W*(.8+i*.03);g.moveTo(x,hz-u*(8+R()*2));g.lineTo(x+u*(R()-.5),hz-u*R());}g.stroke();
    // посёлок
    for(let i=0;i<5;i++)house(g,W*(.3+i*.06),hz-u*1.6,u*(2.2+R()*.8),u*(1.6+R()*.4),f(['#8a4a3a','#4a6a8a','#c8a050','#6a7a5a','#8a8a8a'][i]),f('#4a4a48'),lit&&i%2===0);
    // ржавая шхуна на камнях
    const sx=W*.14,sy=hz-u*.6;g.save();g.translate(sx,sy);g.rotate(-.12);g.fillStyle=f('#7a4a32');g.beginPath();g.moveTo(-u*4.5,-u*1.6);g.lineTo(u*4.5,-u*2);g.lineTo(u*3.4,u*.6);g.lineTo(-u*3.8,u*.6);g.closePath();g.fill();
    g.fillStyle=f('#5a3a2a');g.fillRect(-u*1.2,-u*3.4,u*2.4,u*1.6);g.fillRect(-u*.1,-u*7,u*.25,u*3.6);g.restore();
    g.fillStyle=f('#6d7478');for(let i=0;i<8;i++){g.beginPath();g.ellipse(W*(.05+R()*.3),hz,u*(.8+R()*1.2),u*(.5+R()*.4),0,Math.PI,0);g.fill();}
    // кит: спина и фонтан у горизонта
    const kx=W*.6,ky=hz-u*.1;g.fillStyle=f('#2e3640');g.beginPath();g.ellipse(kx,ky,u*3.2,u*.9,0,Math.PI,0);g.fill();g.beginPath();g.moveTo(kx+u*1.6,ky-u*.6);g.lineTo(kx+u*2.2,ky-u*1.4);g.lineTo(kx+u*2.5,ky-u*.4);g.fill();
    g.fillStyle=rgba('#ffffff',.6);for(let i=0;i<6;i++){g.beginPath();g.arc(kx-u*1.6+(R()-.5)*u*.8,ky-u*(1.6+i*.7),u*(.35+i*.12),0,7);g.fill();}}
};
window.FAR_ART=FAR_ART;
})();
/* НОВЫЕ ФОРМЫ РЫБ (NORTH): drawFish(g,lk,x,y,L,sil) отдаёт сюда формы из FISH_ART. (x,y) — центр, L — длина, смотрит влево, sil — силуэт (ещё не пойман).
   flat — камбала/палтус: плоская, видим «верхний» бок с двумя глазами, бахрома плавников по краю; cod — тресковые: обычное тело + усик на подбородке,
   три спинных плавника и светлая боковая линия. */
(function(){
'use strict';
function flat(g,lk,x,y,L,sil){const h=L*.25,n=x-L/2,xt=x+L*.3,xe=x+L/2,fin=sil?'#253036':lk[4];g.save();g.lineJoin='round';
  // хвост веером
  g.beginPath();g.moveTo(xt,y-h*.18);g.quadraticCurveTo(xe-L*.04,y-h*.75,xe+L*.02,y-h*.62);g.quadraticCurveTo(xe-L*.04,y,xe+L*.02,y+h*.62);g.quadraticCurveTo(xe-L*.04,y+h*.75,xt,y+h*.18);g.closePath();g.fillStyle=fin;g.fill();
  // бахрома плавников (спинной и анальный — вдоль всего края)
  const edge=new Path2D();edge.moveTo(n+L*.1,y-h*.5);edge.bezierCurveTo(n+L*.25,y-h*1.28,x+L*.2,y-h*1.22,xt+L*.02,y-h*.22);edge.lineTo(xt+L*.02,y+h*.22);edge.bezierCurveTo(x+L*.2,y+h*1.22,n+L*.25,y+h*1.28,n+L*.12,y+h*.55);edge.closePath();
  g.fillStyle=fin;g.globalAlpha=sil?1:.85;g.fill(edge);g.globalAlpha=1;
  if(!sil){g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=Math.max(.5,L*.004);g.beginPath();for(let i=0;i<22;i++){const t=i/21,xx=n+L*.16+(xt-n-L*.16)*t,yy=Math.sin(t*Math.PI)*h*.18;g.moveTo(xx,y-h*(.82+yy/h*.6));g.lineTo(xx+L*.01,y-h*(1.02+yy/h*.8));g.moveTo(xx,y+h*(.82+yy/h*.6));g.lineTo(xx+L*.01,y+h*(1.02+yy/h*.8));}g.stroke();}
  // тело: широкий овал
  const body=new Path2D();body.moveTo(n,y-h*.05);body.bezierCurveTo(n+L*.04,y-h*.75,n+L*.3,y-h*1.02,x+L*.02,y-h*.95);body.bezierCurveTo(x+L*.2,y-h*.85,xt,y-h*.4,xt+L*.03,y);
  body.bezierCurveTo(xt,y+h*.4,x+L*.2,y+h*.85,x+L*.02,y+h*.95);body.bezierCurveTo(n+L*.3,y+h*1.02,n+L*.04,y+h*.75,n,y+h*.08);body.closePath();
  if(sil){g.fillStyle='#2c373d';g.fill(body);g.restore();return;}
  const gr=g.createLinearGradient(n,y-h,xt,y+h);gr.addColorStop(0,lk[2]);gr.addColorStop(1,lk[1]);g.fillStyle=gr;g.fill(body);
  g.save();g.clip(body);const PR=rng(Math.round(L*7)+11);
  g.fillStyle=lk[5]==='mottle'?'rgba(30,25,15,.22)':'rgba(255,255,255,.06)';for(let i=0;i<(lk[5]==='mottle'?16:6);i++){g.beginPath();g.ellipse(n+L*.15+PR()*L*.6,y-h*.8+PR()*h*1.6,L*.035,h*.12,PR()*3,0,7);g.fill();}
  if(lk[2]==='#8a7a5a'||lk[5]==='mottle'){g.fillStyle='rgba(230,120,40,.55)';for(let i=0;i<7;i++){g.beginPath();g.arc(n+L*.2+PR()*L*.5,y-h*.6+PR()*h*1.2,L*.012,0,7);g.fill();}} // оранжевые крапинки камбалы
  const hl=g.createLinearGradient(0,y-h,0,y);hl.addColorStop(0,'rgba(255,255,255,0)');hl.addColorStop(.6,'rgba(255,255,255,.18)');hl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=hl;g.fillRect(n,y-h,L,h);
  g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=Math.max(.7,L*.004);g.beginPath();g.moveTo(n+L*.2,y-h*.25);g.bezierCurveTo(n+L*.3,y-h*.55,x,y-h*.1,xt,y);g.stroke();
  g.restore();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=Math.max(.8,L*.006);g.stroke(body);
  // оба глаза на одном боку и рот
  const er=Math.max(1.2,L*.02);for(const [ex,ey] of [[n+L*.1,y-h*.38],[n+L*.15,y-h*.62]]){g.fillStyle='#f4efe0';g.beginPath();g.arc(ex,ey,er,0,7);g.fill();g.fillStyle='#111';g.beginPath();g.arc(ex-er*.15,ey,er*.6,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ex-er*.35,ey-er*.3,er*.22,0,7);g.fill();}
  g.strokeStyle='rgba(0,0,0,.45)';g.beginPath();g.moveTo(n+L*.01,y-h*.02);g.quadraticCurveTo(n+L*.035,y+h*.1,n+L*.06,y+h*.02);g.stroke();
  g.restore();}
function cod(g,lk,x,y,L,sil){const k=lk.slice();k[0]='std';drawFish(g,k,x,y,L,sil);if(sil)return;const h=.27*L/2,n=x-L/2;g.save();
  // ещё два спинных плавника за первым и светлая боковая линия
  g.fillStyle=lk[4];g.globalAlpha=.85;for(const [a,b] of [[.18,.3],[.32,.44]]){g.beginPath();g.moveTo(n+L*(a+.5)-L*.5,y-h*.92);g.quadraticCurveTo(n+L*((a+b)/2+.5)-L*.5,y-h*1.45,n+L*(b+.5)-L*.5,y-h*.8);g.closePath();g.fill();}g.globalAlpha=1;
  g.strokeStyle='rgba(255,255,240,.55)';g.lineWidth=Math.max(.8,L*.006);g.beginPath();g.moveTo(n+L*.22,y-h*.5);g.bezierCurveTo(x-L*.1,y-h*.75,x+L*.05,y-h*.1,x+L*.3,y);g.stroke();
  // усик на подбородке
  g.strokeStyle='rgba(60,50,30,.8)';g.lineWidth=Math.max(.8,L*.005);g.beginPath();g.moveTo(n+L*.06,y+h*.32);g.quadraticCurveTo(n+L*.05,y+h*.7,n+L*.08,y+h*.85);g.stroke();
  g.restore();}
window.FISH_ART={flat,cod};
})();
