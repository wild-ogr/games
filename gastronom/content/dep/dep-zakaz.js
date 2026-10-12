/* Стол заказов (ART): полки со свёртками в обёрточной бумаге (бечёвка, номер заказа), телефон, книга заказов; образцовый — праздничные наборы с бантами */
(function(){if(!window.GBART)return;var PI=Math.PI;
function parcel(g,H,cx,by,s,num,u){var w=s*.8,h=s*.5;H.R(g,cx-w/2,by-h,w,h,s*.04,H.V(g,by-h,by,['#d9b98a','#bf9a68']));
 g.strokeStyle='#8a6a3a';g.lineWidth=Math.max(.7,s*.025);g.beginPath();g.moveTo(cx-w/2,by-h*.5);g.lineTo(cx+w/2,by-h*.5);g.moveTo(cx,by-h);g.lineTo(cx,by);g.stroke();
 if(num){H.R(g,cx+w*.08,by-h*.92,w*.36,h*.34,1,'#fffbe9');H.txt(g,num,cx+w*.26,by-h*.75,h*.24,'#2d2016',w*.32);}}
function gift(g,H,cx,by,s,c,u){var w=s*.7,h=s*.55;H.R(g,cx-w/2,by-h,w,h,s*.03,c);g.fillStyle='#f6d77a';g.fillRect(cx-s*.05,by-h,s*.1,h);g.fillRect(cx-w/2,by-h*.6,w,s*.08);
 H.E(g,cx-s*.1,by-h-s*.05,s*.11,s*.06,'#f6d77a');H.E(g,cx+s*.1,by-h-s*.05,s*.11,s*.06,'#f6d77a');H.E(g,cx,by-h-s*.03,s*.04,s*.04,'#d6a43a');}
function phone(g,H,cx,by,s){var u=s/100;H.P(g,[cx-30*u,by,cx+30*u,by,cx+22*u,by-28*u,cx-22*u,by-28*u],'#2b2b2b');H.E(g,cx,by-14*u,13*u,10*u,'#efe6d2');H.E(g,cx,by-14*u,4*u,3*u,'#2b2b2b');
 H.R(g,cx-34*u,by-40*u,68*u,12*u,6*u,'#1d1d1d');g.strokeStyle='#1d1d1d';g.lineWidth=2*u;g.beginPath();g.moveTo(cx+30*u,by-6*u);g.bezierCurveTo(cx+48*u,by,cx+42*u,by+8*u,cx+56*u,by+4*u);g.stroke();}
function book(g,H,cx,by,s){var u=s/100;H.P(g,[cx-40*u,by,cx,by-6*u,cx,by-26*u,cx-38*u,by-22*u],'#fbf7ec');H.P(g,[cx+40*u,by,cx,by-6*u,cx,by-26*u,cx+38*u,by-22*u],'#f3eddc');
 g.strokeStyle='rgba(80,60,40,.45)';g.lineWidth=Math.max(.6,u);for(var k=0;k<3;k++){g.beginPath();g.moveTo(cx-32*u,by-18*u+k*5*u);g.lineTo(cx-6*u,by-22*u+k*5*u);g.moveTo(cx+6*u,by-22*u+k*5*u);g.lineTo(cx+32*u,by-18*u+k*5*u);g.stroke();}
 g.strokeStyle='#c62828';g.lineWidth=1.6*u;g.beginPath();g.moveTo(cx+18*u,by-30*u);g.lineTo(cx+34*u,by-6*u);g.stroke();}
GBART.reg('zakaz',{draw:function(g,x,y,w,h,lv,t,o){var H=o.H,u=o.u,full=o.full||lv>=2,ch=h*.27,cy=y+h-ch,top=o.top||0;
 var s1=y+top+h*.24,s2=y+top+h*(lv>=2?.47:.5);H.shelf(g,x+w*.04,s1,w*.92,u);H.shelf(g,x+w*.04,s2,w*.92,u);
 var ps=Math.min(w*.26,h*.32),cols=['#c62828','#1f5f99','#2e7d32','#6a1b9a'];
 if(lv>=2){for(var i=0;i<3;i++)gift(g,H,x+w*(.2+i*.3),s1,ps,cols[i],u);for(var j=0;j<3;j++)parcel(g,H,x+w*(.2+j*.3),s2,ps,'№'+(12+j*7),u);}
 else{var n1=full?3:2;for(var a=0;a<n1;a++)parcel(g,H,x+w*((a+.5)/n1*.8+.1),s1,ps,'№'+(3+a*5),u);
  H.row(g,full?[1,13,4]:[1,13],x+w*.1+(full?0:w*.15),s2,full?w*.8:w*.5,w*.22);}
 H.counter(g,x,cy,w,ch,o.lux?3:lv,o.col,u);
 var ss=Math.min(w*.3,ch*1.4);book(g,H,x+w*.3,cy+ch*.06,ss);phone(g,H,x+w*.72,cy+ch*.06,ss*.9);
 if(lv>=2){var ph=Math.max(8,h*.07);H.R(g,x+w*.2,y+top+h*.005,w*.6,ph,2,'#fffbe9');H.txt(g,H.L('ЗАКАЗЫ К ПРАЗДНИКУ','HOLIDAY ORDERS'),x+w/2,y+top+h*.005+ph*.55,ph*.62,'#6a1b9a',w*.56);}
}});})();
