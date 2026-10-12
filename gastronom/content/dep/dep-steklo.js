/* Приём стеклотары (ART): окошко приёма, ящики с бутылками, табличка «Тары нет» (вид 1); образцовый — ровные штабеля, доска с ценами, счёты */
(function(){if(!window.GBART)return;
var BC=['#2e7d32','#6d4c41','#cfe3e8','#2e7d32','#8d6e63','#d8eef2'];
function bottle(g,H,cx,by,s,c,milk){var u=s/100,bw=milk?22*u:18*u,bh=milk?46*u:60*u;
 H.R(g,cx-bw/2,by-bh,bw,bh,bw*.35,c);H.R(g,cx-bw*.22,by-bh-(milk?6:18)*u,bw*.44,(milk?8:20)*u,bw*.15,c);
 if(milk)H.E(g,cx,by-bh-6*u,bw*.26,bw*.12,'#c0c6c8');else H.E(g,cx,by-bh-18*u,bw*.25,bw*.1,H.sh(c,-.3));
 g.fillStyle='rgba(255,255,255,.35)';g.fillRect(cx-bw*.32,by-bh*.85,bw*.14,bh*.6);}
function crate(g,H,x,by,w,h,u,n,seed){ // ящик: бутылки торчат горлышками
 for(var i=0;i<n;i++){var c=BC[(i+seed)%BC.length];bottle(g,H,x+w*(i+.5)/n,by-h*.45,Math.min(w/n*2.4,h*1.6),c,c==='#cfe3e8'||c==='#d8eef2');}
 g.fillStyle=H.V(g,by-h,by,['#c79a5b','#9b7040']);g.fillRect(x,by-h,w,h);g.fillStyle='rgba(70,40,15,.35)';g.fillRect(x,by-h*.55,w,Math.max(1,h*.1));
 g.strokeStyle='rgba(70,40,15,.45)';g.lineWidth=Math.max(.8,u*.8);g.strokeRect(x,by-h,w,h);H.R(g,x+w*.4,by-h*.82,w*.2,h*.2,h*.1,'#5b3a1a');}
GBART.reg('steklo',{draw:function(g,x,y,w,h,lv,t,o){var H=o.H,u=o.u,full=o.full||lv>=2,ch=h*.26,cy=y+h-ch,top=o.top||0;
 // окошко приёма
 var wx=x+w*.22,ww=w*.56,wy=y+top+h*.03,wh=h*.34;H.R(g,wx-3*u,wy-3*u,ww+6*u,wh+6*u,3*u,'#8a5229');H.R(g,wx,wy,ww,wh,2*u,H.V(g,wy,wy+wh,['#3b4a50','#22302f']));
 g.fillStyle='rgba(255,230,160,.25)';g.fillRect(wx,wy+wh*.7,ww,wh*.3);
 var ph=Math.max(9,h*.09);H.R(g,wx+ww*.06,wy+wh*.12,ww*.88,ph,2,'#fffbe9');H.txt(g,H.L('ПРИЁМ ПОСУДЫ','BOTTLES'),wx+ww/2,wy+wh*.12+ph*.55,ph*.62,'#2d2016',ww*.82);
 if(lv===1&&!full){ // «Тары нет» — классика
  g.save();g.translate(wx+ww/2,wy+wh*.62);g.rotate(-.08);H.R(g,-ww*.36,-ph*.6,ww*.72,ph*1.2,2,'#fff');g.strokeStyle='#c62828';g.lineWidth=Math.max(1,u);g.stroke();
  H.txt(g,H.L('ТАРЫ НЕТ','NO CRATES'),0,ph*.05,ph*.7,'#c62828',ww*.66);g.restore();}
 else{H.txt(g,lv>=2?H.L('0-12 · 0-20','12¢ · 20¢'):H.L('ПРИНИМАЕМ','OPEN'),wx+ww/2,wy+wh*.62,ph*.75,'#ffe08a',ww*.8);}
 // ящики у стены
 var cw=w*.3,chh=h*.12,base=cy-1;
 crate(g,H,x+w*.02,base,cw,chh,u,4,0);if(full)crate(g,H,x+w*.02,base-chh*1.05,cw,chh,u,4,2);
 crate(g,H,x+w*.68,base,cw,chh,u,4,1);if(full)crate(g,H,x+w*.68,base-chh*1.05,cw,chh,u,4,3);
 if(lv>=2){crate(g,H,x+w*.02,base-chh*2.1,cw,chh,u,4,4);crate(g,H,x+w*.68,base-chh*2.1,cw,chh,u,4,5);}
 H.counter(g,x,cy,w,ch,o.lux?3:lv,o.col,u);
 if(lv>=2){ // счёты на прилавке
  var sx=x+w*.5,sw=Math.min(w*.4,ch*2),sh2=sw*.42,sy=cy+ch*.06-sh2;H.R(g,sx-sw/2,sy,sw,sh2,2*u,'#8a5229');H.R(g,sx-sw*.44,sy+sh2*.12,sw*.88,sh2*.76,1,'#f3e6c8');
  for(var r=0;r<4;r++){var ry=sy+sh2*(.24+r*.18);g.strokeStyle='#6d4c41';g.lineWidth=Math.max(.6,u*.6);g.beginPath();g.moveTo(sx-sw*.44,ry);g.lineTo(sx+sw*.44,ry);g.stroke();
   for(var k=0;k<6;k++){var kx=sx-sw*.4+k*sw*.07+(k>=(r*2+1)%5?sw*.28:0);H.E(g,kx,ry,sw*.03,sh2*.07,k%2?'#3e2a1f':'#e8dcc0');}}}
 else{bottle(g,H,x+w*.42,cy+ch*.08,Math.min(w*.3,ch*1.4),'#2e7d32');bottle(g,H,x+w*.56,cy+ch*.08,Math.min(w*.3,ch*1.4),'#cfe3e8',1);}
}});})();
