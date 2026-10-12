/* Овощи-фрукты (ART): ящики с картошкой, морковью, капустой, яблоками, лук в сетке, банки кабачковой икры; образцовый — ровные лотки с ценниками, арбуз, связка лука */
(function(){if(!window.GBART)return;var PI=Math.PI;
function crate(g,H,x,by,w,h,u){g.fillStyle=H.V(g,by-h,by,['#c79a5b','#9b7040']);g.fillRect(x,by-h,w,h);g.fillStyle='rgba(70,40,15,.35)';g.fillRect(x,by-h*.5,w,Math.max(1,h*.08));
 g.strokeStyle='rgba(70,40,15,.45)';g.lineWidth=Math.max(.8,u*.8);g.strokeRect(x,by-h,w,h);}
function pile(g,H,kind,x,by,w,r,u){var n=Math.max(3,Math.round(w/(r*1.7))),k;
 for(var row=0;row<2;row++)for(k=0;k<n-row;k++){var cx=x+r+(k+row*.5)*(w-2*r)/Math.max(1,n-1),cy=by-r*.6-row*r*1.1;
  if(kind==='pot'){H.E(g,cx,cy,r,r*.8,(k+row)%2?'#b08050':'#c49462');g.fillStyle='rgba(90,60,30,.5)';H.E(g,cx-r*.3,cy-r*.2,r*.1,r*.08);g.fill();}
  else if(kind==='apple'){H.E(g,cx,cy,r,r*.92,(k+row)%3?'#d93a2b':'#e8b33a');H.E(g,cx-r*.35,cy-r*.35,r*.25,r*.18,'rgba(255,255,255,.5)');g.strokeStyle='#5d3a1f';g.lineWidth=Math.max(.6,r*.15);g.beginPath();g.moveTo(cx,cy-r*.8);g.lineTo(cx+r*.15,cy-r*1.15);g.stroke();}
  else if(kind==='cab'){H.E(g,cx,cy-r*.1,r*1.15,r,'#8bc34a');H.E(g,cx,cy-r*.1,r*.7,r*.62,'#c5e1a5');g.strokeStyle='rgba(60,110,30,.6)';g.lineWidth=Math.max(.6,r*.1);g.beginPath();g.arc(cx-r*.5,cy,r*.8,-1,.6);g.stroke();}
  else if(kind==='car'){g.save();g.translate(cx,cy);g.rotate(-.5+k*.2);H.P(g,[-r*.32,-r*1.2,r*.32,-r*1.2,0,r*.9],'#ef7d1a');g.fillStyle='#4caf50';H.P(g,[-r*.25,-r*1.2,-r*.5,-r*1.8,0,-r*1.3,r*.45,-r*1.8,r*.25,-r*1.2]);g.fill();g.restore();}}}
function net(g,H,cx,y0,s,u){var r=s*.16;g.strokeStyle='#8a6a3a';g.lineWidth=Math.max(.8,u*.8);g.beginPath();g.moveTo(cx,y0);g.lineTo(cx,y0+s*.2);g.stroke();
 for(var k=0;k<5;k++)H.E(g,cx+((k%2)-.5)*r*1.2,y0+s*.3+k*r*.9,r,r*.85,k%2?'#d9a441':'#c98a2c');
 g.strokeStyle='rgba(200,40,40,.75)';g.lineWidth=Math.max(.6,u*.6);for(var j=0;j<4;j++){g.beginPath();g.moveTo(cx-r*1.4,y0+s*.24+j*r*1.1);g.lineTo(cx+r*1.4,y0+s*.24+j*r*1.1+r);g.moveTo(cx+r*1.4,y0+s*.24+j*r*1.1);g.lineTo(cx-r*1.4,y0+s*.24+j*r*1.1+r);g.stroke();}}
function melon(g,H,cx,by,r){H.E(g,cx,by-r*.9,r*1.2,r*.95,'#3d8b37');g.strokeStyle='#1f5a1c';g.lineWidth=r*.18;for(var k=-2;k<=2;k++){g.beginPath();g.ellipse(cx+k*r*.35,by-r*.9,r*.12,r*.9,0,0,PI*2);g.stroke();}H.E(g,cx-r*.4,by-r*1.3,r*.25,r*.14,'rgba(255,255,255,.35)');}
GBART.reg('ovoshi',{draw:function(g,x,y,w,h,lv,t,o){var H=o.H,u=o.u,full=o.full||lv>=2,ch=h*.25,cy=y+h-ch,top=o.top||0;
 var s1=y+top+h*.22;H.shelf(g,x+w*.04,s1,w*.92,u);H.row(g,full?[22,22,22,22]:[22,22],x+w*.06+(full?0:w*.22),s1,full?w*.88:w*.44,w*.18);
 if(lv>=2){net(g,H,x+w*.9,y+top,Math.min(w*.3,h*.3),u);}
 // ящики в два яруса (лотками)
 var cw=w*(full?.29:.36),chh=h*.11,b1=y+h*.62,b2=cy-1,r=Math.max(3,Math.min(cw,h)*.09);
 var top3=full?['apple','car','cab']:['apple','pot'],low=full?['pot','cab','pot']:['pot','car'];
 for(var i=0;i<top3.length;i++){var cx0=x+w*.04+i*(cw+w*.02);pile(g,H,top3[i],cx0+cw*.04,b1-chh*.8,cw*.92,r,u);crate(g,H,cx0,b1,cw,chh,u);
  if(lv>=2)H.price(g,cx0+cw/2,b1-chh*.15,Math.min(cw*.7,chh*3),['0-15','0-30','0-12'][i]);}
 for(var j=0;j<low.length;j++){var cx1=x+w*.04+j*(cw+w*.02);pile(g,H,low[j],cx1+cw*.04,b2-chh*.8,cw*.92,r,u);crate(g,H,cx1,b2,cw,chh,u);}
 if(!full){g.save();g.translate(x+w*.88,b2);g.rotate(.12);crate(g,H,-cw*.4,0,cw*.8,chh*.9,u);g.restore();}
 H.counter(g,x,cy,w,ch,o.lux?3:lv,o.col,u);
 if(lv>=2)melon(g,H,x+w*.5,cy+ch*.08,Math.min(w*.1,ch*.5));
}});})();
