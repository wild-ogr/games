'use strict';
/* ================= «Мама с малышом — без очереди» (поток ART, решение владельца 10.10 вечер) =================
   Ветерана с медалями из игры убрали. Вместо него — покупательница «Мама с малышом»: тот же размер и место, что у всех
   покупателей drawPerson (cx, by — низ плеч, h — до макушки), стиль тот же (плечи, голова, лицо — тем же кодом), без медалей.
   Облик: молодая мама, русые волосы в пучке, вязаная кофта бирюзового цвета; на левой руке малыш в голубом одеяльце
   и вязаной шапочке с помпоном (моргает, чуть покачивается).
   ДОГОВОР: drawPerson(g, 'mama', cx, by, h, mood, tk, talk) — как любой покупатель. kind 'veteran' тоже рисуется мамой
   (правило «без очереди» и тексты переводят на 'mama' OBST/TEXT; до них медалей на экране уже нет).
   GBMAMA.draw(…) — то же напрямую. Флаг GB.flag('mama') выключен → старый рисунок игры (ветеран). */
(function(){
if(typeof drawPerson!=='function')return;
var orig=drawPerson,PI=Math.PI;
function on(){try{return !window.GB||GB.flag('mama');}catch(e){return true;}}
function draw(g,cx,by,h,mood,tk,talk){var u=h/100,bob=Math.sin(tk*2+cx*.01)*1.2*u;by+=bob;var hx=cx,hy=by-60*u,C='#2a9d8f',HAIR='#9a6b43';
 g.save();g.lineCap='round';g.lineJoin='round';
 // волосы сзади (пучок) — до плеч, чтобы читался силуэт
 ell(g,hx+2*u,hy-20*u,10*u,9*u,shade(HAIR,-.1));
 // плечи: вязаная кофта
 g.beginPath();g.moveTo(cx-38*u,by+12*u);g.lineTo(cx-36*u,by-20*u);g.quadraticCurveTo(cx-34*u,by-36*u,cx-14*u,by-38*u);g.lineTo(cx+14*u,by-38*u);g.quadraticCurveTo(cx+34*u,by-36*u,cx+36*u,by-20*u);g.lineTo(cx+38*u,by+12*u);g.closePath();
 g.fillStyle=lin(g,cx-38*u,0,cx+38*u,0,[shade(C,-.18),C,shade(C,-.08),shade(C,-.28)]);g.fill();
 // ворот блузки и вязка (резинка по вороту, пуговки)
 poly(g,[cx-11*u,by-38*u,cx,by-27*u,cx+11*u,by-38*u],'#fdf3e7');
 g.strokeStyle=shade(C,-.25);g.lineWidth=1.2*u;g.beginPath();g.moveTo(cx+4*u,by-30*u);g.lineTo(cx+8*u,by+12*u);g.stroke();
 for(var k=0;k<3;k++)ell(g,cx+7*u+k*.4*u,by-20*u+k*11*u,1.7*u,1.7*u,'#f4e3c8');
 // малыш на левой руке (слева от зрителя): одеяльце, лицо, шапочка с помпоном
 var bx=cx-19*u,byy=by-19*u,bb=Math.sin(tk*1.6+cx*.02)*.8*u;
 g.save();g.translate(bx,byy+bb);g.rotate(-.18);
 ell(g,2*u,6*u,15*u,13*u,lin(g,-15*u,0,15*u,0,['#7fb3e0','#a9d0f2','#6d9fcc']));
 g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.1*u;g.beginPath();g.moveTo(-11*u,2*u);g.quadraticCurveTo(2*u,10*u,14*u,1*u);g.stroke();
 ell(g,-1*u,-7*u,8.5*u,8*u,lin(g,-8*u,0,8*u,0,[shade(SKIN,-.06),'#f6d6bb',shade(SKIN,-.1)]));
 // шапочка
 g.beginPath();g.moveTo(-9.5*u,-7*u);g.quadraticCurveTo(-9*u,-17*u,-1*u,-17*u);g.quadraticCurveTo(8*u,-17*u,8*u,-7*u);g.quadraticCurveTo(-1*u,-11*u,-9.5*u,-7*u);g.fillStyle='#f28da0';g.fill();
 g.fillStyle='#e8768c';g.fillRect(-9*u,-9*u,17*u,2.2*u);ell(g,-1*u,-18.5*u,3*u,3*u,'#fff4f6');
 // личико: глазки (спит или смотрит), щёчки, ротик
 var bblink=(tk*.7+.3)%4.3<.25;g.strokeStyle='#2b1d14';g.lineWidth=1.1*u;
 if(bblink||mood>0){for(var s=-1;s<=1;s+=2){g.beginPath();g.arc(-1*u+s*3.2*u,-6.5*u,1.4*u,PI*1.1,PI*1.9);g.stroke();}}
 else{ell(g,-4.2*u,-6.5*u,1.1*u,1.3*u,'#2b1d14');ell(g,2.2*u,-6.5*u,1.1*u,1.3*u,'#2b1d14');}
 ell(g,-6*u,-3.5*u,2*u,1.4*u,'rgba(240,110,110,.4)');ell(g,4*u,-3.5*u,2*u,1.4*u,'rgba(240,110,110,.4)');
 ell(g,-1*u,-2.6*u,1.3*u,1*u,'#d9746a');
 g.restore();
 // рука мамы, обнимающая малыша
 g.beginPath();g.moveTo(cx-34*u,by+2*u);g.quadraticCurveTo(cx-24*u,by-7*u,cx-6*u,by-11*u);g.lineWidth=7*u;g.strokeStyle=shade(C,-.12);g.stroke();
 ell(g,cx-5*u,by-11.5*u,4*u,3.4*u,SKIN);
 // шея
 g.fillStyle=shade(SKIN,-.12);g.fillRect(hx-6*u,hy+12*u,12*u,12*u);
 // голова, уши
 ell(g,hx,hy,17*u,19*u,lin(g,hx-17*u,0,hx+17*u,0,[shade(SKIN,-.1),SKIN,shade(SKIN,-.14)]));
 ell(g,hx-17*u,hy+1*u,3*u,4.5*u,shade(SKIN,-.1));ell(g,hx+17*u,hy+1*u,3*u,4.5*u,shade(SKIN,-.1));
 // причёска: гладко назад, пробор, чёлка на бок, пучок на макушке, серёжки-гвоздики
 g.beginPath();g.moveTo(hx-18*u,hy+2*u);g.quadraticCurveTo(hx-20*u,hy-24*u,hx,hy-23*u);g.quadraticCurveTo(hx+20*u,hy-24*u,hx+18*u,hy+2*u);
 g.quadraticCurveTo(hx+15*u,hy-8*u,hx+6*u,hy-11*u);g.quadraticCurveTo(hx-6*u,hy-14*u,hx-14*u,hy-6*u);g.quadraticCurveTo(hx-16*u,hy-2*u,hx-18*u,hy+2*u);g.fillStyle=HAIR;g.fill();
 g.strokeStyle=shade(HAIR,.18);g.lineWidth=1.1*u;g.beginPath();g.moveTo(hx-8*u,hy-18*u);g.quadraticCurveTo(hx+2*u,hy-20*u,hx+10*u,hy-14*u);g.stroke();
 ell(g,hx+3*u,hy-26*u,8*u,6*u,HAIR);ell(g,hx+1*u,hy-28*u,3*u,2*u,shade(HAIR,.2));
 ell(g,hx-17*u,hy+6*u,1.6*u,1.6*u,'#e8eef2');ell(g,hx+17*u,hy+6*u,1.6*u,1.6*u,'#e8eef2');
 // лицо — как у покупателей drawPerson
 var blink=(tk+cx*.013)%3.7<.12,ey=hy-1*u;g.fillStyle='#2b1d14';g.strokeStyle='#2b1d14';g.lineWidth=1.8*u;
 if(mood>0){for(var a=-1;a<=1;a+=2){g.beginPath();g.arc(hx+a*6.5*u,ey+1.5*u,3*u,PI*1.15,PI*1.85);g.stroke();}}
 else if(blink){for(var b=-1;b<=1;b+=2){g.beginPath();g.moveTo(hx+b*6.5*u-2.5*u,ey);g.lineTo(hx+b*6.5*u+2.5*u,ey);g.stroke();}}
 else{ell(g,hx-6.5*u,ey,2.3*u,2.6*u,'#2b1d14');ell(g,hx+6.5*u,ey,2.3*u,2.6*u,'#2b1d14');ell(g,hx-5.8*u,ey-.9*u,.8*u,.8*u,'#fff');ell(g,hx+7.2*u,ey-.9*u,.8*u,.8*u,'#fff');
  g.lineWidth=1.2*u;for(var e=-1;e<=1;e+=2){g.beginPath();g.moveTo(hx+e*8.6*u,ey-1.6*u);g.lineTo(hx+e*9.8*u,ey-2.8*u);g.stroke();}} // реснички
 if(mood<0){g.lineWidth=2*u;for(var c2=-1;c2<=1;c2+=2){g.beginPath();g.moveTo(hx+c2*10*u,ey-7*u);g.lineTo(hx+c2*3*u,ey-4.5*u);g.stroke();}}
 else{g.lineWidth=1.4*u;g.strokeStyle='rgba(90,60,40,.7)';for(var d=-1;d<=1;d+=2){g.beginPath();g.moveTo(hx+d*9.5*u,ey-6.5*u);g.quadraticCurveTo(hx+d*7*u,ey-8*u,hx+d*4*u,ey-7*u);g.stroke();}}
 ell(g,hx-10*u,hy+6*u,4*u,2.6*u,'rgba(230,110,100,.4)');ell(g,hx+10*u,hy+6*u,4*u,2.6*u,'rgba(230,110,100,.4)');
 g.strokeStyle=shade(SKIN,-.3);g.lineWidth=1.4*u;g.beginPath();g.moveTo(hx,hy+1*u);g.quadraticCurveTo(hx+2.5*u,hy+5*u,hx-.5*u,hy+6*u);g.stroke();
 var my=hy+11*u;g.lineWidth=2*u;g.strokeStyle='#c2524a';
 if(talk>0&&Math.sin(tk*18)>0){ell(g,hx,my,4*u,3*u,'#7a2a20');}
 else if(mood>0){g.beginPath();g.arc(hx,my-3*u,6*u,PI*.15,PI*.85);g.stroke();}
 else if(mood<0){g.beginPath();g.arc(hx,my+4*u,5*u,PI*1.2,PI*1.8);g.stroke();}
 else{g.beginPath();g.moveTo(hx-4*u,my);g.quadraticCurveTo(hx,my+2.5*u,hx+4*u,my);g.stroke();}
 g.restore();}
window.drawPerson=function(g,kind,cx,by,h,mood,tk,talk){
 if((kind==='mama'||kind==='veteran')&&on()){try{return draw(g,cx,by,h,mood,tk,talk);}catch(e){}}
 return orig.apply(this,arguments);};
window.GBMAMA={v:1,draw:function(g,cx,by,h,mood,tk,talk){return draw(g,cx,by,h,mood||0,tk||0,talk||0);}};
})();
