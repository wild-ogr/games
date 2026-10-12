/* Гастрономия (ART): колбасы на перекладине, головки сыра, докторская; образцовый — стеклянная витрина с нарезкой, колбасорезка */
(function(){if(!window.GBART)return;
var SC=[['#b3424a','#8e2a33'],['#d98a8f','#b86a70'],['#7a3b2a','#5a2a1c'],['#c2554a','#9a3a32'],['#8e4a3a','#6b3326']];
function hang(g,H,cx,y0,len,th,c,u){g.strokeStyle='#e8dcc0';g.lineWidth=Math.max(.8,u*.8);g.beginPath();g.moveTo(cx,y0);g.lineTo(cx,y0+th*.6);g.stroke();
 H.R(g,cx-th/2,y0+th*.5,th,len,th/2,H.Hz(g,cx-th/2,cx+th/2,[c[1],c[0],c[1]]));g.fillStyle='rgba(255,255,255,.4)';for(var k=1;k<5;k++)H.E(g,cx+(k%2?-1:1)*th*.15,y0+th*.5+len*k/5,th*.08,th*.06);g.fill();
 g.strokeStyle='#e8dcc0';g.beginPath();g.moveTo(cx-th/2,y0+th*.9);g.lineTo(cx+th/2,y0+th*.9);g.stroke();}
function cheese(g,H,cx,by,s){var u=s/100;H.E(g,cx,by-14*u,40*u,14*u,'#e9b949');g.fillStyle='#e9b949';g.fillRect(cx-40*u,by-28*u,80*u,14*u);H.E(g,cx,by-28*u,40*u,14*u,'#f6d77a');
 H.P(g,[cx,by-28*u,cx+40*u,by-28*u,cx+30*u,by-37*u],'#f9e6a0');g.fillStyle='rgba(200,150,40,.6)';H.E(g,cx-12*u,by-28*u,4*u,2*u);g.fill();H.E(g,cx+8*u,by-24*u,3*u,1.6*u);g.fill();}
function slicer(g,H,cx,by,s){var u=s/100;H.R(g,cx-30*u,by-12*u,60*u,12*u,3*u,'#c62828');H.E(g,cx+6*u,by-34*u,24*u,24*u,H.Hz(g,cx-18*u,cx+30*u,['#9aa3a8','#eef2f3','#9aa3a8']));
 H.E(g,cx+6*u,by-34*u,6*u,6*u,'#6f7a80');H.R(g,cx-26*u,by-22*u,22*u,10*u,2*u,'#b0b8bc');}
GBART.reg('gastro',{draw:function(g,x,y,w,h,lv,t,o){var H=o.H,u=o.u,full=o.full||lv>=2,ch=h*.28,cy=y+h-ch,top=o.top||0;
 // перекладина с колбасами
 var ry=y+top+h*.05;g.fillStyle='#8a5229';g.fillRect(x+w*.06,ry,w*.88,Math.max(2,3*u));
 var n=full?6:3,th=Math.max(4,w*.06);for(var i=0;i<n;i++){var cx=x+w*(.12+i*(.76/(n-1||1)));hang(g,H,cx,ry,h*(.16+((i*7)%3)*.04),th,SC[i%SC.length],u);}
 // полка с сыром и докторской
 var s2=y+top+h*.52;H.shelf(g,x+w*.04,s2,w*.92,u);
 if(full){cheese(g,H,x+w*.22,s2,Math.min(w*.3,h*.3));H.row(g,[9,9],x+w*.42,s2,w*.3,w*.22);cheese(g,H,x+w*.8,s2,Math.min(w*.26,h*.26));}
 else{cheese(g,H,x+w*.35,s2,Math.min(w*.28,h*.28));H.row(g,[9],x+w*.55,s2,w*.2,w*.22);}
 H.counter(g,x,cy,w,ch,o.lux?3:lv,o.col,u);
 if(lv>=2){var vx=x+w*.06,vw=w*.6,vh=ch*.9,vy=cy-vh*.5;H.R(g,vx,vy,vw,vh,3*u,H.V(g,vy,vy+vh,['#f3f7f8','#d4e2e6']));
  H.row(g,[9,10,9],vx+vw*.06,vy+vh*.85,vw*.88,vh*.8);g.fillStyle='rgba(255,255,255,.55)';H.P(g,[vx+vw*.15,vy+vh,vx+vw*.3,vy,vx+vw*.38,vy,vx+vw*.23,vy+vh]);g.fill();
  g.strokeStyle='#a9bcc2';g.lineWidth=Math.max(1,u);H.R(g,vx,vy,vw,vh,3*u);g.stroke();
  slicer(g,H,x+w*.82,cy+ch*.06,Math.min(w*.3,ch*1.3));}
 else{H.price(g,x+w*.3,cy+ch*.02,Math.min(w*.3,ch*1.4),'2-20');H.price(g,x+w*.7,cy+ch*.02,Math.min(w*.3,ch*1.4),'3-10');}
}});})();
