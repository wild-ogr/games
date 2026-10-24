/* Общий облик серии (решение владельца 24.10): «Петрович» в Дураке и Козле — рыбак Петрович из «Рыбалки с Петровичем».
   Родной рисунок — ~/Projects/rybak, js/mg-art.js petr() (коммит 3329b73): код рисования перенесён БЕЗ ИЗМЕНЕНИЙ (Canvas),
   здесь только рамка, как у Вали/Митяя в viktorina/js/look-kin.js: рисуем в холст 400×440 по пояс, отдаём картинкой внутри SVG.
   Настроения дворовых игр norm|happy|sad|wow: norm — родное face:'smile', happy — 'laugh', wow — 'wow' (всё есть в Рыбалке);
   sad дорисован поверх обычного в его же цветах (брови домиком, уголки рта вниз).
   PETR_ART.head(m,bg) — 200×200 с фоном (portrait), PETR_ART.bust(m) — 200×220, PETR_ART.draw(m) — dataURL. Файл одинаковый в Дураке и Козле. */
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

var URL={},MF={norm:'smile',happy:'laugh',wow:'wow',sad:'smile'},K=3.4,HY=92;
function draw(m){m=MF[m]?m:'norm';if(URL[m])return URL[m];var c=document.createElement('canvas');c.width=400;c.height=440;var g=c.getContext('2d');if(!g)return '';g.scale(2,2);
 var x=100,y=HY+87*K;petr(g,x,y,K*100,0,{face:MF[m],arm:'rest',blink:false});
 if(m==='sad'){var C={skin:'#e8b48c',hair:'#c9c9c4',lip:'#7a2e2a'};g.save();g.translate(x,y);g.scale(K,K);g.translate(0,-87);g.lineCap='round';
  var sk=rg(g,-3,-3,2,16,[0,mix(C.skin,'#fff',.12),1,C.skin]); // градиент лица — им прячем прежнюю улыбку
  g.strokeStyle=C.hair;g.lineWidth=1.8;g.beginPath();g.moveTo(-8.4,-4.3);g.quadraticCurveTo(-5.4,-4.6,-2.6,-5.9);g.moveTo(8.4,-4.3);g.quadraticCurveTo(5.4,-4.6,2.6,-5.9);g.stroke(); // брови домиком — под козырьком кепки
  g.fillStyle=sk;el(g,.5,10.4,4.4,1.5);g.fill(); // улыбка из-под усов — убрать
  g.strokeStyle=C.lip;g.lineWidth=1.3;g.beginPath();g.arc(.5,13.2,3.2,PI*1.2,PI*1.8);g.stroke();g.restore();}
 try{return URL[m]=c.toDataURL('image/png');}catch(e){return '';}}
function img(m,y){return '<image href="'+draw(m)+'" x="0" y="'+(y||0)+'" width="200" height="220"/>';}
function bust(m){return '<svg viewBox="0 0 200 220" class="bust" data-pv="petrovich/'+(m||'norm')+'" preserveAspectRatio="xMidYMax meet" aria-hidden="true">'+img(m)+'</svg>';}
function head(m,bg){return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="overflow:hidden" data-pv="petrovich/'+(m||'norm')+'"><rect width="200" height="200" fill="'+(bg||'#e3eef3')+'"/>'+img(m,-8)+'</svg>';}
window.PETR_ART={head:head,bust:bust,draw:draw};
})();
