/* Рыбалка с Петровичем — рисунки для мини-игр (RB:MG0, 08.10.2026): Петрович, кот Васька, дед Митяй, небо, деревья, стол, костёр.
   Всё кодом на Canvas (без картинок). window.MG_ART = {petr, cat, mit, sky, tod, cloud, appleTree, birch, grass, table, fire, smoke, bench, fence, glow, star, rnd}.
   Координаты персонажа: (x, y) — середина под ногами, s — рост в пикселях. Опции — время t (с) и поза.
   petr(g,x,y,s,t,{pose:'stand'|'sit', arm:'rest'|'talk'|'laugh'|'point'|'tea'|'wave'|'shrug', face:'smile'|'talk'|'laugh'|'sly'|'wow', look:-1..1, night})
   cat(g,x,y,s,t,{pose:'sit'|'loaf'|'sleep'|'alert', look:-1..1, night})
   mit(g,x,y,s,t,{bust:true — только голова и плечи (выглядывает из-за забора), face, arm:'rest'|'point'})
   Цвета Петровича и кота — как в сцене рыбалки (drawPetr/a1Cat), только крупнее и подробнее. */
(function(){
'use strict';
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

/* ======================= ПЕТРОВИЧ ======================= */
function petr(g,x,y,s,t,o){o=o||{};var k=s/100,sit=o.pose==='sit',N=!!o.night,arm=o.arm||'rest',face=o.face||'smile',lk=lim(o.look||0,-1,1);
  var C={coat:shade(N,'#4a5d72'),coatD:shade(N,'#34445a'),coatL:shade(N,'#6a7f96'),pants:shade(N,'#2c3846'),boot:shade(N,'#1d2126'),skin:shade(N,'#e8b48c',.35),skinD:shade(N,'#c98d68',.35),
    cap:shade(N,'#5a4a3a'),capD:shade(N,'#3e3228'),hair:shade(N,'#c9c9c4',.3),must:shade(N,'#d8d8d2',.3),nose:shade(N,'#e0907a',.35),vest:shade(N,'#f4f4f4',.3),vestB:shade(N,'#3b6fb5',.3)};
  var br=Math.sin(t*1.6)*.8,laugh=face==='laugh'?Math.abs(Math.sin(t*14))*1.6:0;
  g.save();g.translate(x,y);g.scale(k,k);
  // тень
  g.fillStyle='rgba(0,0,0,.22)';el(g,0,0,sit?30:24,5);g.fill();
  var by=sit?16:0; // опускаем корпус, если сидит
  // ноги
  if(sit){g.fillStyle=C.pants;rr(g,-17,-24,15,10,4);g.fill();rr(g,2,-24,15,10,4);g.fill(); // бёдра (к нам)
    rr(g,-15,-16,11,14,3);g.fill();rr(g,4,-16,11,14,3);g.fill();
    g.fillStyle=C.boot;rr(g,-17,-5,15,6,3);g.fill();rr(g,2,-5,15,6,3);g.fill();}
  else{g.fillStyle=C.pants;rr(g,-13,-42,12,38,4);g.fill();rr(g,1,-42,12,38,4);g.fill();
    g.fillStyle=C.boot;rr(g,-15,-8,15,8,3);g.fill();rr(g,0,-8,15,8,3);g.fill();g.fillStyle='rgba(255,255,255,.12)';rr(g,-13,-7,6,2,1);g.fill();rr(g,2,-7,6,2,1);g.fill();}
  g.translate(0,by+laugh*.3);
  // ватник
  g.fillStyle=lg(g,-20,0,20,0,[0,C.coatD,.35,C.coat,.7,C.coat,1,C.coatD]);
  g.beginPath();g.moveTo(-20,-38);g.quadraticCurveTo(-22,-58,-19,-70+br*.3);g.quadraticCurveTo(-12,-76,0,-76);g.quadraticCurveTo(12,-76,19,-70+br*.3);g.quadraticCurveTo(22,-58,20,-38);g.quadraticCurveTo(0,-34,-20,-38);g.fill();
  g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=.9;for(var i=0;i<5;i++){var yy=-44-i*6;g.beginPath();g.moveTo(-19.5,yy);g.quadraticCurveTo(0,yy+2.2,19.5,yy);g.stroke();}
  g.strokeStyle=C.coatD;g.lineWidth=1.4;g.beginPath();g.moveTo(1,-75);g.lineTo(1,-37);g.stroke();
  g.fillStyle=shade(N,'#262a2e');for(var b=0;b<3;b++){el(g,3.5,-64+b*9,1.4,1.4);g.fill();}
  // тельняшка в вороте
  g.save();g.beginPath();g.moveTo(-7,-76);g.lineTo(7,-76);g.lineTo(1,-63);g.closePath();g.clip();g.fillStyle=C.vest;g.fillRect(-8,-78,16,16);g.fillStyle=C.vestB;for(var v=0;v<4;v++)g.fillRect(-8,-76+v*3.4,16,1.5);g.restore();
  g.fillStyle=C.coatL;g.beginPath();g.moveTo(-9,-77);g.lineTo(-1,-64);g.lineTo(-3,-77);g.fill();g.beginPath();g.moveTo(9,-77);g.lineTo(2,-64);g.lineTo(4,-77);g.fill();
  // руки
  drawArms(g,arm,t,C,laugh,o);
  // голова
  var hy=-87+br*.4-laugh*.4,tilt=face==='laugh'?Math.sin(t*7)*.04:lk*.05;g.save();g.translate(lk*2,hy);g.rotate(tilt);
  g.fillStyle=C.skinD;el(g,-12.3,1,3,4);g.fill();el(g,12.3,1,3,4);g.fill(); // уши
  g.fillStyle=rg(g,-3,-3,2,16,[0,mix(C.skin,'#fff',.12),1,C.skin]);el(g,0,0,12,13.5);g.fill();
  g.fillStyle='rgba(230,110,90,.22)';el(g,-7.5,4,3.6,2.4);g.fill();el(g,7.5,4,3.6,2.4);g.fill(); // румянец
  // глаза
  var bl=o.blink?1:blink(t,0),ex=lk*1.6;
  if(face==='laugh'||face==='smile'&&bl<.5&&false){}
  g.strokeStyle=shade(N,'#2a211b');g.fillStyle=shade(N,'#2a211b');g.lineWidth=1.4;g.lineCap='round';
  if(face==='laugh'){g.beginPath();g.arc(-5,-1,2.6,PI*1.1,PI*1.9);g.stroke();g.beginPath();g.arc(5,-1,2.6,PI*1.1,PI*1.9);g.stroke();}
  else if(bl>.5){g.beginPath();g.moveTo(-7,-1);g.lineTo(-3,-1);g.moveTo(3,-1);g.lineTo(7,-1);g.stroke();}
  else{var wy=face==='wow'?1.25:1;g.fillStyle='#fff';el(g,-5,-1.5,2.6,2.8*wy);g.fill();el(g,5,-1.5,2.6,2.8*wy);g.fill();
    g.fillStyle=shade(N,'#3a2a1e');el(g,-5+ex,-1.2,1.5,1.7);g.fill();el(g,5+ex,-1.2,1.5,1.7);g.fill();g.fillStyle='rgba(255,255,255,.9)';el(g,-4.4+ex,-1.9,.5,.5);g.fill();el(g,5.6+ex,-1.9,.5,.5);g.fill();
    if(face==='sly'){g.fillStyle=C.skin;g.fillRect(-8,-5.2,6,2.6);g.fillRect(2,-5.2,6,2.6);}}
  // брови
  g.strokeStyle=C.hair;g.lineWidth=2.2;var bu=face==='wow'?-2:face==='sly'?.6:0;
  g.beginPath();g.moveTo(-8.5,-5.5+bu);g.quadraticCurveTo(-5,-7.5+bu,-2,-5.6+bu);g.stroke();g.beginPath();g.moveTo(2,-5.6+(face==='sly'?-1.5:bu));g.quadraticCurveTo(5,-7.5+bu,8.5,-5.5+bu);g.stroke();
  // нос
  g.fillStyle=rg(g,.4,2.6,.5,5,[0,mix(C.nose,'#fff',.25),1,C.nose]);el(g,.6,3.2,3.3,3.9);g.fill();
  // рот
  var talk=face==='talk'?Math.abs(Math.sin(t*11))*.8+.2:0;
  if(face==='laugh'||face==='wow'||talk>0){var mo=face==='laugh'?3.4+laugh*.4:face==='wow'?3:1.2+talk*2;g.fillStyle=shade(N,'#7a2e2a');el(g,.5,9.5,3.8,mo);g.fill();g.fillStyle='#e9e3da';g.fillRect(-2.6,9.5-mo,6.2,Math.min(1.4,mo*.5));}
  else{g.strokeStyle=shade(N,'#7a2e2a');g.lineWidth=1.3;g.beginPath();g.arc(.5,7.5,3.6,PI*.2,PI*.8);g.stroke();}
  // усы
  g.fillStyle=lg(g,0,4,0,10,[0,mix(C.must,'#fff',.2),1,C.must]);
  g.beginPath();g.moveTo(.6,5.4);g.bezierCurveTo(-3,4.2,-8,5.2,-9.5,9.4);g.bezierCurveTo(-6,8.4,-3,8.6,.6,7.6);g.bezierCurveTo(4,8.6,7,8.4,10.5,9.4);g.bezierCurveTo(9,5.2,4,4.2,.6,5.4);g.fill();
  // щетина-седина у висков
  g.fillStyle=C.hair;el(g,-11.2,-4,2,3.5,.3);g.fill();el(g,11.2,-4,2,3.5,-.3);g.fill();
  // кепка-восьмиклинка
  g.fillStyle=lg(g,0,-18,0,-6,[0,mix(C.cap,'#fff',.12),1,C.cap]);g.beginPath();g.moveTo(-13.5,-6.5);g.bezierCurveTo(-15,-17,-6,-20.5,1,-20.5);g.bezierCurveTo(9,-20.5,16,-16,14,-6.5);g.quadraticCurveTo(0,-9.5,-13.5,-6.5);g.fill();
  g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=.8;g.beginPath();g.moveTo(1,-20.5);g.quadraticCurveTo(-5,-13,-8,-7.6);g.moveTo(1,-20.5);g.quadraticCurveTo(7,-13,9,-7.6);g.moveTo(1,-20.5);g.lineTo(1,-8.4);g.stroke();
  g.fillStyle=C.capD;g.beginPath();g.moveTo(-12,-7);g.quadraticCurveTo(lk*3,-1.5,13,-7);g.quadraticCurveTo(lk*3,-4.8,-12,-7);g.fill();
  g.fillStyle=C.capD;el(g,1,-20.6,1.6,1);g.fill();
  g.restore();
  if(arm==='tea'&&!N)steam(g,15,-58,t);
  g.restore();}
function limb(g,x0,y0,x1,y1,x2,y2,w,col,hand){g.strokeStyle=col;g.lineCap='round';g.lineJoin='round';g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(x1,y1,x2,y2);g.stroke();
  g.fillStyle=hand;el(g,x2,y2,4.4,4.6);g.fill();}
function drawArms(g,arm,t,C,laugh,o){var w=9.5,L0=[-18,-68],R0=[18,-68];o=o||{};
  /* RB:MGC (перенесено при сведении 08.10): позы для верши/фото — тянет верёвку, держит рыбу, руки вверх, держит вершу */
  if(arm==='pull'){var pk=Math.sin(t*5)*1.5;limb(g,L0[0],L0[1],-30,-58,-36,-50+pk,w,C.coat,C.skin);limb(g,R0[0],R0[1],-6,-56,-24,-48-pk,w,C.coat,C.skin);return;}
  if(arm==='fish'){var sp=o.span||30;limb(g,L0[0],L0[1],-sp*.8,-60,-sp,-54,w,C.coat,C.skin);limb(g,R0[0],R0[1],sp*.8,-60,sp,-55,w,C.coat,C.skin);return;}
  if(arm==='up'){var u2=Math.sin(t*8)*3;limb(g,L0[0],L0[1],-30,-80,-30,-100+u2,w,C.coat,C.skin);limb(g,R0[0],R0[1],30,-80,30,-100-u2,w,C.coat,C.skin);return;}
  if(arm==='hold'){limb(g,L0[0],L0[1],-26,-52,-12,-44,w,C.coat,C.skin);limb(g,R0[0],R0[1],26,-52,12,-44,w,C.coat,C.skin);return;}
  // левая (от нас справа) — по позе; правая — обычно опущена
  var L=[-18,-68],Rr=[18,-68];
  if(arm==='laugh'){limb(g,L[0],L[1],-24,-50,-8,-44+laugh,w,C.coat,C.skin);limb(g,Rr[0],Rr[1],24,-50,8,-44+laugh,w,C.coat,C.skin);return;}
  if(arm==='shrug'){limb(g,L[0],L[1],-30,-58,-28,-72,w,C.coat,C.skin);limb(g,Rr[0],Rr[1],30,-58,28,-72,w,C.coat,C.skin);return;}
  limb(g,L[0],L[1],-25,-52,-21,-38,w,C.coat,C.skin);
  if(arm==='talk'){var a=Math.sin(t*3.2)*6;limb(g,Rr[0],Rr[1],32,-62,28+a*.5,-82+a,w,C.coat,C.skin);g.fillStyle=C.skin;el(g,30+a*.5,-87+a,1.6,3.2,.3);g.fill();}
  else if(arm==='point'){limb(g,Rr[0],Rr[1],30,-70,40,-78,w,C.coat,C.skin);g.strokeStyle=C.skin;g.lineWidth=2.6;g.beginPath();g.moveTo(42,-79);g.lineTo(47,-82);g.stroke();}
  else if(arm==='wave'){var b=Math.sin(t*9)*8;limb(g,Rr[0],Rr[1],30,-78,30+b,-96,w,C.coat,C.skin);}
  else if(arm==='tea'){limb(g,Rr[0],Rr[1],26,-50,14,-52,w,C.coat,C.skin);g.fillStyle=shade(false,'#c0392b');rr(g,10,-62,10,11,2);g.fill();g.strokeStyle='#c0392b';g.lineWidth=1.8;g.beginPath();g.arc(20,-57,3,-PI/2,PI/2);g.stroke();g.fillStyle='#f6f1e7';el(g,15,-62,5,1.4);g.fill();g.fillStyle=C.skin;el(g,13,-52,4.4,4.6);g.fill();}
  else limb(g,Rr[0],Rr[1],25,-52,21,-38,w,C.coat,C.skin);}
function steam(g,x,y,t){g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.5;g.lineCap='round';for(var i=0;i<2;i++){var p=(t*.6+i*.5)%1;g.globalAlpha=1-p;g.beginPath();g.moveTo(x+i*3,y-p*14);g.bezierCurveTo(x+i*3+3,y-p*14-3,x+i*3-3,y-p*14-6,x+i*3,y-p*14-9);g.stroke();}g.globalAlpha=1;}

/* ======================= КОТ ВАСЬКА ======================= */
function cat(g,x,y,s,t,o){o=o||{};var k=s/100,N=!!o.night,p=o.pose||'sit',lk=lim(o.look||0,-1,1);
  var C={f:shade(N,'#ec9440',.4),fd:shade(N,'#c26a24',.4),fl:shade(N,'#f8b968',.4),w:shade(N,'#fff6ea',.35),st:shade(N,'#b35a1c',.4),pk:shade(N,'#f29a9a',.3),eye:N?'#c8ff7a':'#7cc04a'};
  g.save();g.translate(x,y);g.scale(k,k);
  g.fillStyle='rgba(0,0,0,.2)';el(g,0,0,p==='sit'||p==='alert'?26:40,5);g.fill();
  if(p==='sleep'||p==='loaf'){catLie(g,t,C,p==='sleep',N);g.restore();return;}
  // хвост
  var sw=Math.sin(t*2.2)*8;g.strokeStyle=C.f;g.lineCap='round';g.lineWidth=8;g.beginPath();g.moveTo(14,-6);g.bezierCurveTo(40,-2,38+sw*.4,-30,30+sw,-46);g.stroke();
  g.strokeStyle=C.st;g.lineWidth=8;g.setLineDash([3,6]);g.beginPath();g.moveTo(14,-6);g.bezierCurveTo(40,-2,38+sw*.4,-30,30+sw,-46);g.stroke();g.setLineDash([]);
  // тело
  g.fillStyle=lg(g,-24,0,24,0,[0,C.fd,.3,C.f,.7,C.f,1,C.fd]);g.beginPath();g.moveTo(-20,-2);g.bezierCurveTo(-30,-30,-18,-58,0,-58);g.bezierCurveTo(18,-58,30,-30,20,-2);g.quadraticCurveTo(0,2,-20,-2);g.fill();
  g.fillStyle=C.w;g.beginPath();g.moveTo(-10,-50);g.quadraticCurveTo(0,-36,10,-50);g.quadraticCurveTo(14,-24,0,-12);g.quadraticCurveTo(-14,-24,-10,-50);g.fill();
  g.strokeStyle=C.st;g.lineWidth=2.6;g.lineCap='round';for(var i=0;i<3;i++){g.beginPath();g.moveTo(-22+i*1.5,-34+i*9);g.quadraticCurveTo(-16,-32+i*9,-13,-36+i*9);g.stroke();g.beginPath();g.moveTo(22-i*1.5,-34+i*9);g.quadraticCurveTo(16,-32+i*9,13,-36+i*9);g.stroke();}
  // лапы
  g.fillStyle=C.f;rr(g,-11,-26,9,26,4.5);g.fill();rr(g,2,-26,9,26,4.5);g.fill();g.fillStyle=C.w;el(g,-6.5,-2.5,5.5,3.2);g.fill();el(g,6.5,-2.5,5.5,3.2);g.fill();
  g.strokeStyle=C.fd;g.lineWidth=.8;for(var j=-1;j<=1;j++){g.beginPath();g.moveTo(-6.5+j*2,-3.5);g.lineTo(-6.5+j*2,-1);g.moveTo(6.5+j*2,-3.5);g.lineTo(6.5+j*2,-1);g.stroke();}
  // голова
  var hy=-70+Math.sin(t*1.4)*.6,tl=p==='alert'?0:Math.sin(t*.7)*.05+lk*.08;g.save();g.translate(lk*3,hy);g.rotate(tl);
  var ear=p==='alert'?-3:Math.sin(t*.9)>.96?2:0;
  g.fillStyle=C.f;g.beginPath();g.moveTo(-19,-6);g.lineTo(-19,-29+ear);g.lineTo(-5,-16);g.fill();g.beginPath();g.moveTo(19,-6);g.lineTo(19,-29);g.lineTo(5,-16);g.fill();
  g.fillStyle=C.pk;g.beginPath();g.moveTo(-17,-10);g.lineTo(-17,-24+ear);g.lineTo(-8,-15);g.fill();g.beginPath();g.moveTo(17,-10);g.lineTo(17,-24);g.lineTo(8,-15);g.fill();
  g.fillStyle=rg(g,-4,-6,2,24,[0,C.fl,1,C.f]);el(g,0,0,22,18.5);g.fill();
  g.strokeStyle=C.st;g.lineWidth=2.4;g.beginPath();g.moveTo(0,-18);g.lineTo(0,-11);g.moveTo(-5,-17);g.lineTo(-4,-11.5);g.moveTo(5,-17);g.lineTo(4,-11.5);g.stroke();
  g.beginPath();g.moveTo(-22,0);g.lineTo(-16,1);g.moveTo(-22,4);g.lineTo(-16,4);g.moveTo(22,0);g.lineTo(16,1);g.moveTo(22,4);g.lineTo(16,4);g.stroke();
  g.fillStyle=C.w;el(g,-5,6.5,6.5,5);g.fill();el(g,5,6.5,6.5,5);g.fill();el(g,0,10,4,3);g.fill();
  // глаза
  var bl=blink(t,1.7),ex=lk*1.5,wide=p==='alert'?1.2:1;
  if(bl>.5){g.strokeStyle=shade(N,'#5a3010');g.lineWidth=1.6;g.beginPath();g.arc(-8,-3,4,PI*.15,PI*.85);g.stroke();g.beginPath();g.arc(8,-3,4,PI*.15,PI*.85);g.stroke();}
  else{g.fillStyle=C.eye;el(g,-8,-3,5,5.4*wide);g.fill();el(g,8,-3,5,5.4*wide);g.fill();g.fillStyle='#1d1a12';el(g,-8+ex,-3,1.5*(N?2:1),4.4*wide);g.fill();el(g,8+ex,-3,1.5*(N?2:1),4.4*wide);g.fill();
    g.fillStyle='rgba(255,255,255,.9)';el(g,-6.6+ex,-5,1.2,1.2);g.fill();el(g,9.4+ex,-5,1.2,1.2);g.fill();
    g.strokeStyle=shade(N,'#7a4210');g.lineWidth=1;el(g,-8,-3,5,5.4*wide);g.stroke();el(g,8,-3,5,5.4*wide);g.stroke();}
  g.fillStyle=C.pk;g.beginPath();g.moveTo(-2.6,3.4);g.lineTo(2.6,3.4);g.lineTo(0,6.2);g.fill();
  g.strokeStyle=shade(N,'#6a3a1a');g.lineWidth=1.1;g.beginPath();g.moveTo(0,6.2);g.lineTo(0,8);g.arc(-2.2,8,2.2,0,PI*.9);g.moveTo(0,8);g.arc(2.2,8,2.2,PI,PI*.1,true);g.stroke();
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.7;for(var w=0;w<3;w++){g.beginPath();g.moveTo(-9,7+w*1.6);g.lineTo(-25,4+w*3.4);g.moveTo(9,7+w*1.6);g.lineTo(25,4+w*3.4);g.stroke();}
  g.restore();g.restore();}
function catLie(g,t,C,sleep,N){var br=Math.sin(t*(sleep?1.3:2))*1;
  var sw=Math.sin(t*1.4)*5;g.strokeStyle=C.f;g.lineCap='round';g.lineWidth=8;g.beginPath();g.moveTo(30,-8);g.bezierCurveTo(48,-6,44+sw,6,20,3);g.stroke();
  g.fillStyle=lg(g,0,-34,0,0,[0,C.f,1,C.fd]);el(g,4,-15-br*.3,34,16+br*.5);g.fill();
  g.strokeStyle=C.st;g.lineWidth=2.6;for(var i=0;i<4;i++){g.beginPath();g.moveTo(-6+i*10,-30);g.quadraticCurveTo(-3+i*10,-22,-6+i*10,-16);g.stroke();}
  g.fillStyle=C.w;el(g,-14,-2,7,3.5);g.fill();el(g,-1,-2,7,3.5);g.fill();
  g.save();g.translate(-24,-26+(sleep?6:0));g.rotate(sleep?-.25:0);
  g.fillStyle=C.f;g.beginPath();g.moveTo(-15,-4);g.lineTo(-14,-22);g.lineTo(-3,-12);g.fill();g.beginPath();g.moveTo(15,-4);g.lineTo(14,-22);g.lineTo(3,-12);g.fill();
  g.fillStyle=C.pk;g.beginPath();g.moveTo(-13,-7);g.lineTo(-12.5,-18);g.lineTo(-6,-11);g.fill();g.beginPath();g.moveTo(13,-7);g.lineTo(12.5,-18);g.lineTo(6,-11);g.fill();
  g.fillStyle=C.fl;el(g,0,0,17,14);g.fill();g.fillStyle=C.w;el(g,-4,5,5,3.8);g.fill();el(g,4,5,5,3.8);g.fill();
  g.strokeStyle=shade(N,'#5a3010');g.lineWidth=1.4;if(sleep||blink(t,.4)>.5){g.beginPath();g.arc(-6,-2,3,PI*.15,PI*.85);g.stroke();g.beginPath();g.arc(6,-2,3,PI*.15,PI*.85);g.stroke();}
  else{g.fillStyle=C.eye;el(g,-6,-2,3.8,4);g.fill();el(g,6,-2,3.8,4);g.fill();g.fillStyle='#1d1a12';el(g,-6,-2,1.2,3.4);g.fill();el(g,6,-2,1.2,3.4);g.fill();}
  g.fillStyle=C.pk;g.beginPath();g.moveTo(-2,2.4);g.lineTo(2,2.4);g.lineTo(0,4.4);g.fill();g.restore();
  if(sleep){g.fillStyle='rgba(255,255,255,.85)';g.font='700 12px sans-serif';g.textAlign='center';var z=(t*.45)%1;g.globalAlpha=1-z;g.fillText('z',-18+z*10,-46-z*18);g.font='700 9px sans-serif';var z2=(t*.45+.5)%1;g.globalAlpha=1-z2;g.fillText('z',-18+z2*10,-46-z2*18);g.globalAlpha=1;}}

/* ======================= ДЕД МИТЯЙ ======================= */
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

/* ======================= ПРИРОДА И ВЕЩИ ======================= */
var TODP={morning:{s0:'#86b6e2',s1:'#ffe0b6',sun:'#fff1c4',amb:'#ffd9a8',dark:0},day:{s0:'#5ea8e0',s1:'#cfeaf5',sun:'#fffbe6',amb:'#ffffff',dark:0},
  evening:{s0:'#3f5c94',s1:'#ffac78',sun:'#ffcf8a',amb:'#ffb27a',dark:.18},night:{s0:'#091330',s1:'#28385e',sun:'#e8eefc',amb:'#7f95c8',dark:.55}};
var TOD_Q=(location.search.match(/[?&]tod=(morning|day|evening|night)/)||[])[1];
function tod(h){if(TOD_Q&&h==null)return TOD_Q;if(h==null){try{h=hourNow();}catch(e){h=new Date().getHours();}}return h>=5&&h<10?'morning':h>=10&&h<18?'day':h>=18&&h<22?'evening':'night';}
function sky(g,W,H,hz,td,t){var P=TODP[td]||TODP.day;g.fillStyle=lg(g,0,0,0,hz,[0,P.s0,1,P.s1]);g.fillRect(0,0,W,hz+2);
  var u=Math.min(W,H)/100;
  if(td==='night'){var R=rnd(7);for(var i=0;i<90;i++){var x=R()*W,y=R()*hz*.85,a=.35+.65*Math.abs(Math.sin(t*.8+i));g.fillStyle='rgba(255,255,255,'+(a*.8)+')';g.fillRect(x,y,R()<.15?2:1.2,R()<.15?2:1.2);}
    var mx=W*.8,my=hz*.25;g.fillStyle=rg(g,mx,my,u*2,u*14,[0,'rgba(220,230,255,.35)',1,'rgba(220,230,255,0)']);g.fillRect(mx-u*14,my-u*14,u*28,u*28);g.fillStyle='#eef2ff';el(g,mx,my,u*4.2,u*4.2);g.fill();g.fillStyle=P.s0;el(g,mx+u*1.8,my-u*1,u*3.6,u*3.6);g.fill();}
  else{var sx=td==='morning'?W*.18:td==='evening'?W*.84:W*.72,sy=td==='day'?hz*.22:hz*.62;g.fillStyle=rg(g,sx,sy,u*2,u*26,[0,'rgba(255,245,210,.75)',.35,'rgba(255,230,170,.25)',1,'rgba(255,230,170,0)']);g.fillRect(sx-u*26,sy-u*26,u*52,u*52);g.fillStyle=P.sun;el(g,sx,sy,u*4.4,u*4.4);g.fill();}}
function cloud(g,x,y,w,a,col){g.fillStyle=col||'rgba(255,255,255,'+a+')';var h=w*.28;el(g,x,y,w*.5,h*.6);g.fill();el(g,x-w*.22,y-h*.2,w*.24,h*.62);g.fill();el(g,x+w*.12,y-h*.45,w*.26,h*.8);g.fill();el(g,x+w*.33,y-h*.05,w*.2,h*.5);g.fill();}
function appleTree(g,x,y,s,t,o){o=o||{};var N=!!o.night,k=s/100,R=rnd(o.seed||3);g.save();g.translate(x,y);g.scale(k,k);
  g.fillStyle='rgba(0,0,0,.18)';el(g,0,0,38,7);g.fill();
  g.fillStyle=lg(g,-6,0,6,0,[0,shade(N,'#5a3e28'),.5,shade(N,'#7a5636'),1,shade(N,'#4a3220')]);g.beginPath();g.moveTo(-6,0);g.quadraticCurveTo(-4,-30,-8,-52);g.lineTo(-2,-54);g.quadraticCurveTo(2,-40,4,-56);g.lineTo(9,-54);g.quadraticCurveTo(5,-30,6,0);g.fill();
  var sw=Math.sin(t*.9)*1.2,cols=[shade(N,'#3f7a32'),shade(N,'#4f9440'),shade(N,'#5fa84c'),shade(N,'#77bd5c')];
  var blobs=[[-26,-62,22],[22,-64,22],[0,-82,26],[-14,-92,20],[16,-90,20],[-30,-80,16],[30,-80,16],[0,-62,22]];
  for(var c=0;c<4;c++)for(var i=0;i<blobs.length;i++){var b=blobs[i],d=c*2.2;g.fillStyle=cols[c];el(g,b[0]+sw*(c*.3)-d*.6,b[1]-d,b[2]-d*1.6,(b[2]-d*1.6)*.86);g.fill();}
  if(!o.noApples){var Ra=rnd(11);for(var a=0;a<16;a++){var ax=(Ra()-.5)*64,ay=-60-Ra()*42;g.fillStyle=shade(N,Ra()<.7?'#d8392b':'#e8b52f');el(g,ax+sw*.5,ay,3.2,3.2);g.fill();g.fillStyle='rgba(255,255,255,.5)';el(g,ax-1+sw*.5,ay-1.2,1,1);g.fill();}}
  g.restore();}
function birch(g,x,y,s,t,N){var k=s/100;g.save();g.translate(x,y);g.scale(k,k);g.fillStyle=shade(N,'#f2efe6');g.fillRect(-2.5,-70,5,70);g.fillStyle=shade(N,'#3a3a36');for(var i=0;i<7;i++)g.fillRect(-2.5+(i%2)*2,-64+i*9,2.5+(i%3),1.6);
  var sw=Math.sin(t*1.1)*1.5;for(var j=0;j<9;j++){g.fillStyle=shade(N,j%2?'#7fb24e':'#9cc75e');el(g,(j%3-1)*11+sw,-70-(j/3|0)*12+((j*7)%5),12,10);g.fill();}g.restore();}
function grass(g,x,y,w,h,t,col,n,seed){var R=rnd(seed||5);g.strokeStyle=col;g.lineCap='round';g.lineWidth=Math.max(1,h*.08);for(var i=0;i<n;i++){var gx=x+R()*w,gh=h*(.5+R()*.5),sw=Math.sin(t*1.3+i)*gh*.15;g.beginPath();g.moveTo(gx,y);g.quadraticCurveTo(gx,y-gh*.6,gx+sw+gh*.15,y-gh);g.stroke();}}
function table(g,x,y,w,t,o){o=o||{};var N=!!o.night,h=w*.36;g.save();g.translate(x,y);
  g.fillStyle='rgba(0,0,0,.2)';el(g,0,0,w*.58,h*.16);g.fill();
  g.fillStyle=shade(N,'#6a4a2e');g.fillRect(-w*.42,-h*.9,w*.06,h*.9);g.fillRect(w*.36,-h*.9,w*.06,h*.9);
  g.fillStyle=shade(N,'#5a3e26');g.fillRect(-w*.3,-h*.82,w*.05,h*.72);g.fillRect(w*.25,-h*.82,w*.05,h*.72);
  // скатерть в клетку
  g.fillStyle=shade(N,'#f4efe2');g.beginPath();g.moveTo(-w*.5,-h);g.lineTo(w*.5,-h);g.lineTo(w*.54,-h*.62);g.lineTo(-w*.54,-h*.62);g.closePath();g.fill();
  g.save();g.clip();g.fillStyle=shade(N,'rgba(200,60,50,.5)'.indexOf('rgba')===0?'#d9675c':'#d9675c');g.globalAlpha=.45;for(var i=-6;i<=6;i++){g.fillRect(i*w*.08-w*.02,-h*1.1,w*.035,h*.6);}g.fillRect(-w*.6,-h*.9,w*1.2,h*.06);g.fillRect(-w*.6,-h*.74,w*1.2,h*.06);g.globalAlpha=1;g.restore();
  g.fillStyle=shade(N,'#ece4d0');g.beginPath();g.moveTo(-w*.5,-h);g.lineTo(w*.5,-h);g.lineTo(w*.5,-h*1.04);g.lineTo(-w*.5,-h*1.04);g.fill();
  g.restore();}
function bench(g,x,y,w,N){var h=w*.22;g.save();g.translate(x,y);g.fillStyle='rgba(0,0,0,.18)';el(g,0,0,w*.55,h*.25);g.fill();
  g.fillStyle=shade(N,'#5a3e26');g.fillRect(-w*.42,-h,w*.06,h);g.fillRect(w*.36,-h,w*.06,h);g.fillStyle=lg(g,0,-h*1.2,0,-h*.9,[0,shade(N,'#a37a4c'),1,shade(N,'#7a5634')]);rr(g,-w*.5,-h*1.22,w,h*.3,h*.08);g.fill();g.restore();}
function fire(g,x,y,s,t,o){o=o||{};var k=.85+.15*Math.sin(t*9)+.08*Math.sin(t*23),calm=!!o.calm;
  if(!o.noGlow){g.fillStyle=rg(g,x,y-s*.3,1,s*2.6*k,[0,'rgba(255,170,70,'+(o.night?.5:.28)+')',1,'rgba(255,170,70,0)']);g.fillRect(x-s*3,y-s*3.2,s*6,s*6);}
  // камни
  for(var i=0;i<7;i++){var a=PI+i/6*PI;g.fillStyle=i%2?'#7d7f80':'#93959a';el(g,x+Math.cos(a)*s*.9,y+Math.sin(a)*s*.16+s*.05,s*.22,s*.15);g.fill();}
  g.fillStyle='#4a3020';g.save();g.translate(x,y);g.rotate(.32);g.fillRect(-s*.7,-s*.08,s*1.4,s*.16);g.rotate(-.64);g.fillRect(-s*.7,-s*.08,s*1.4,s*.16);g.restore();
  var L=[['#ff6a1a',1],['#ffb02e',.7],['#fff1a8',.38]];for(var j=0;j<3;j++){var c=L[j][0],sz=L[j][1];g.fillStyle=c;g.beginPath();g.moveTo(x-s*.5*sz,y);g.quadraticCurveTo(x-s*.45*sz,y-s*.75*sz*k,x+Math.sin(t*7+j)*s*.1,y-s*1.35*sz*k);g.quadraticCurveTo(x+s*.45*sz,y-s*.75*sz*k,x+s*.5*sz,y);g.fill();}
  if(!calm){for(var p=0;p<5;p++){var q=(t*.9+p*.21)%1;g.fillStyle='rgba(255,200,90,'+(1-q)+')';el(g,x+Math.sin(p*3+t*2)*s*.4*q,y-s*(.8+q*1.8),s*.04,s*.04);g.fill();}}}
function smoke(g,x,y,s,t,a){for(var i=0;i<6;i++){var q=(t*.18+i/6)%1;g.fillStyle='rgba(235,235,240,'+((1-q)*(a||.35))+')';el(g,x+Math.sin(q*5+i)*s*.3+q*s*.6,y-q*s*3,s*(.25+q*.5),s*(.22+q*.45));g.fill();}}
function fence(g,x0,x1,y,h,N,gap){g.save();var w=h*.17;for(var x=x0;x<x1;x+=w*1.25){if(gap&&x>gap[0]&&x<gap[1])continue;g.fillStyle=shade(N,(x/w|0)%2?'#9b7a52':'#a8865c');g.beginPath();g.moveTo(x,y);g.lineTo(x,y-h*.92);g.lineTo(x+w/2,y-h);g.lineTo(x+w,y-h*.92);g.lineTo(x+w,y);g.fill();g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x+w*.75,y-h*.92,w*.25,h*.92);}
  g.fillStyle=shade(N,'#7a5c3c');g.fillRect(x0,y-h*.78,x1-x0,h*.07);g.fillRect(x0,y-h*.3,x1-x0,h*.07);g.restore();}
function glow(g,x,y,r,col,a){g.fillStyle=rg(g,x,y,0,r,[0,'rgba('+col+','+a+')',1,'rgba('+col+',0)']);g.fillRect(x-r,y-r,r*2,r*2);}

window.MG_ART={petr:petr,cat:cat,mit:mit,sky:sky,tod:tod,TOD:TODP,cloud:cloud,appleTree:appleTree,birch:birch,grass:grass,table:table,bench:bench,fire:fire,smoke:smoke,fence:fence,glow:glow,
  rnd:rnd,el:el,rr:rr,lg:lg,rg:rg,mix:mix,shade:shade,steam:steam,
  fish:function(g,id,x,y,L,rot){try{var f=FISH[id];if(!f)return;g.save();g.translate(x,y);if(rot)g.rotate(rot);drawFish(g,f.lk,0,0,L);g.restore();}catch(e){}}};
})();
