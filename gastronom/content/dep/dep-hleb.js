/* Хлебный (ART): наклонные лотки с буханками и батонами, вилка-пробник на верёвочке; образцовый — связки баранок, пряники, корзина с бубликами */
(function(){if(!window.GBART)return;
function ring(g,H,cx,cy,r,u){g.strokeStyle='#c98a3c';g.lineWidth=r*.55;g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.stroke();
 g.strokeStyle='rgba(255,235,190,.6)';g.lineWidth=r*.16;g.beginPath();g.arc(cx-r*.1,cy-r*.1,r,3.6,5.2);g.stroke();
 g.fillStyle='#fff6e0';for(var k=0;k<5;k++){var a=k*1.26+.4;H.E(g,cx+Math.cos(a)*r,cy+Math.sin(a)*r,r*.08,r*.05);g.fill();}}
function tray(g,H,x,y,w,h,u){ // наклонный лоток: (x,y) — верхний левый угол, глубина h
 H.P(g,[x,y,x+w,y,x+w-h*.25,y+h,x+h*.25,y+h],'#b8784a');H.P(g,[x+h*.25,y+h,x+w-h*.25,y+h,x+w-h*.25,y+h+Math.max(2,3*u),x+h*.25,y+h+Math.max(2,3*u)],'#8a5229');}
GBART.reg('hleb',{draw:function(g,x,y,w,h,lv,t,o){var H=o.H,u=o.u,full=o.full||lv>=2,ch=h*.25,cy=y+h-ch,top=o.top||0;
 var t1=y+top+h*.06,t2=y+top+(lv>=2?h*.27:h*.3);
 tray(g,H,x+w*.04,t1+h*.12,w*.92,h*.07,u);tray(g,H,x+w*.04,t2+h*.14,w*.92,h*.07,u);
 H.row(g,full?[17,17,17,17]:[17,17],x+w*.08+(full?0:w*.2),t1+h*.16,full?w*.84:w*.42,w*.22);
 H.row(g,full?[8,8,8]:[8,8],x+w*.08+(full?0:w*.16),t2+h*.18,full?w*.84:w*.5,w*.28);
 if(lv>=2){ // связки баранок по бокам и пряники
  for(var s=0;s<2;s++){var bx=x+(s?w*.93:w*.07);g.strokeStyle='#8a6a3a';g.lineWidth=Math.max(1,u);g.beginPath();g.moveTo(bx,y+top);g.lineTo(bx,y+h*.62);g.stroke();
   for(var k=0;k<4;k++)ring(g,H,bx+(k%2?2:-2)*u,y+top+h*.08+k*h*.1,Math.max(3,w*.045),u);}
  H.shelf(g,x+w*.12,y+h*.67,w*.76,u);H.row(g,[20,20,20],x+w*.16,y+h*.67,w*.68,w*.2);}
 else{ // вилка-пробник на верёвочке
  var fx=x+w*.86,fy=y+h*.5;g.strokeStyle='#8a6a3a';g.lineWidth=Math.max(1,u*.8);g.beginPath();g.moveTo(fx,y+top);g.lineTo(fx,fy);g.stroke();
  g.strokeStyle='#9aa3a8';g.lineWidth=Math.max(1.2,1.6*u);g.beginPath();g.moveTo(fx,fy);g.lineTo(fx,fy+h*.08);for(var j=-1;j<=1;j++){g.moveTo(fx+j*2.5*u,fy+h*.08);g.lineTo(fx+j*2.5*u,fy+h*.13);}g.stroke();}
 H.counter(g,x,cy,w,ch,o.lux?3:lv,o.col,u);
 if(lv>=2){ // корзина с бубликами
  var kx=x+w*.3,kw=Math.min(w*.3,ch*1.5),ky=cy+ch*.1;H.P(g,[kx-kw/2,ky-kw*.36,kx+kw/2,ky-kw*.36,kx+kw*.4,ky,kx-kw*.4,ky],H.V(g,ky-kw*.36,ky,['#c9944f','#9b6a32']));
  g.strokeStyle='rgba(90,55,20,.5)';g.lineWidth=Math.max(.8,u*.8);for(var q=1;q<4;q++){g.beginPath();g.moveTo(kx-kw*.48+q*kw*.02,ky-kw*.36+q*kw*.09);g.lineTo(kx+kw*.48-q*kw*.02,ky-kw*.36+q*kw*.09);g.stroke();}
  for(var b=0;b<3;b++)ring(g,H,kx-kw*.25+b*kw*.25,ky-kw*.42,kw*.12,u);
  H.price(g,x+w*.72,cy+ch*.02,Math.min(w*.3,ch*1.4),'0-22');}
 else{H.price(g,x+w*.3,cy+ch*.02,Math.min(w*.3,ch*1.4),'0-16');}
}});})();
