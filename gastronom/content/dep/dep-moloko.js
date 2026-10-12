/* Молочный (ART): полки с молоком, кефиром, маслом, яйцами; треугольные пакеты, бидон; образцовый — холодильная витрина, сметана на развес с черпаком */
(function(){if(!window.GBART)return;
function pyr(g,H,cx,by,s){var u=s/100;H.P(g,[cx-26*u,by,cx+8*u,by,cx-4*u,by-52*u],'#f6f8fa');H.P(g,[cx+8*u,by,cx+26*u,by-6*u,cx-4*u,by-52*u],'#c9d6e2');
 g.fillStyle='#1f5f99';H.P(g,[cx-19*u,by-14*u,cx+5*u,by-14*u,cx+2*u,by-22*u,cx-15*u,by-22*u]);g.fill();g.fillStyle='#174a78';H.P(g,[cx+5*u,by-14*u,cx+20*u,by-18*u,cx+16*u,by-26*u,cx+2*u,by-22*u]);g.fill();
 g.fillStyle='rgba(0,0,0,.18)';H.E(g,cx,by,24*u,3*u);g.fill();}
function churn(g,H,cx,by,s){var u=s/100;H.R(g,cx-22*u,by-56*u,44*u,56*u,10*u,H.Hz(g,cx-22*u,cx+22*u,['#8f9aa0','#e3e8ea','#b5bec2','#8f9aa0']));
 H.P(g,[cx-22*u,by-52*u,cx+22*u,by-52*u,cx+12*u,by-70*u,cx-12*u,by-70*u],'#c9d1d4');H.R(g,cx-13*u,by-80*u,26*u,11*u,3*u,'#b5bec2');
 g.strokeStyle='#6f7a80';g.lineWidth=2.4*u;g.beginPath();g.arc(cx,by-80*u,12*u,Math.PI,0);g.stroke();g.fillStyle='#6f7a80';g.fillRect(cx-22*u,by-30*u,44*u,3*u);}
GBART.reg('moloko',{draw:function(g,x,y,w,h,lv,t,o){var H=o.H,u=o.u,full=o.full||lv>=2,ch=h*.27,cy=y+h-ch,top=o.top||0;
 var s1=y+top+h*.24,s2=y+top+h*(lv>=2?.47:.5);H.shelf(g,x+w*.04,s1,w*.92,u);H.shelf(g,x+w*.04,s2,w*.92,u);
 H.row(g,full?[5,5,6,6,5]:[5,6,5],x+w*.06+(full?0:w*.14),s1,full?w*.88:w*.6,w*.2);
 if(full){H.row(g,[19,16],x+w*.06,s2,w*.44,w*.22);for(var k=0;k<3;k++)pyr(g,H,x+w*(.58+k*.13),s2,Math.min(w*.2,h*.22));}
 else{for(var k2=0;k2<2;k2++)pyr(g,H,x+w*(.3+k2*.2),s2,Math.min(w*.2,h*.22));}
 H.counter(g,x,cy,w,ch,o.lux?3:lv,o.col,u);
 if(lv>=2){ // холодильная витрина
  var vx=x+w*.36,vw=w*.6,vh=ch*.95,vy=cy-vh*.55;H.R(g,vx,vy,vw,vh,3*u,H.V(g,vy,vy+vh,['#e8f4f7','#bcd9e0']));
  H.row(g,[19,10,16],vx+vw*.05,vy+vh*.82,vw*.9,vh*.75);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(vx,vy,vw,vh*.5);
  g.fillStyle='rgba(255,255,255,.6)';H.P(g,[vx+vw*.1,vy+vh,vx+vw*.25,vy,vx+vw*.33,vy,vx+vw*.18,vy+vh]);g.fill();
  g.strokeStyle='#9fb8c0';g.lineWidth=Math.max(1,u);H.R(g,vx,vy,vw,vh,3*u);g.stroke();
  churn(g,H,x+w*.17,cy+ch*.1,Math.min(w*.3,ch*1.5));
  // черпак на бидоне
  g.strokeStyle='#8f9aa0';g.lineWidth=Math.max(1.2,1.6*u);g.beginPath();g.moveTo(x+w*.17,cy-ch*.9);g.lineTo(x+w*.27,cy-ch*1.35);g.stroke();}
 else{churn(g,H,x+w*.2,cy+ch*.1,Math.min(w*.3,ch*1.5));H.price(g,x+w*.68,cy+ch*.02,Math.min(w*.3,ch*1.4),'0-28');}
}});})();
