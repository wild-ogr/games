/* Кондитерский (ART): коробки тортов с бантом, ириски, пряники; образцовый — торт на подставке с розочками, этажерка с пирожными, банка конфет */
(function(){if(!window.GBART)return;
function box(g,H,cx,by,s,c){var u=s/100;H.R(g,cx-34*u,by-30*u,68*u,30*u,3*u,H.sh(c,.78));g.strokeStyle=H.sh(c,.35);g.lineWidth=Math.max(.6,u);g.stroke();H.P(g,[cx-34*u,by-30*u,cx+34*u,by-30*u,cx+28*u,by-36*u,cx-28*u,by-36*u],H.sh(c,.62));
 g.fillStyle=c;g.fillRect(cx-4*u,by-36*u,8*u,36*u);g.fillRect(cx-34*u,by-18*u,68*u,6*u);H.E(g,cx-8*u,by-40*u,8*u,5*u,c);H.E(g,cx+8*u,by-40*u,8*u,5*u,c);H.E(g,cx,by-38*u,3*u,3*u,H.sh(c,-.2));}
function cake(g,H,cx,by,s){var u=s/100;H.E(g,cx,by,40*u,6*u,'#e9eef0');g.fillStyle='#d9e0e3';g.fillRect(cx-4*u,by-2*u,8*u,4*u);
 var b=by-4*u;g.fillStyle='#7a4a2a';g.fillRect(cx-32*u,b-30*u,64*u,30*u);H.E(g,cx,b,32*u,6*u,'#7a4a2a');g.fillStyle='#f6e7c8';g.fillRect(cx-32*u,b-18*u,64*u,6*u);
 H.E(g,cx,b-30*u,32*u,7*u,'#fbe9f0');g.fillStyle='#fbe9f0';for(var k=0;k<7;k++)H.E(g,cx-27*u+k*9*u,b-24*u,4.5*u,5*u),g.fill();
 for(var r=0;r<3;r++){var rx=cx+(r-1)*16*u;H.E(g,rx,b-34*u,6*u,5*u,'#e05a8a');H.E(g,rx,b-35*u,3*u,2.5*u,'#f48fb1');H.E(g,rx+6*u,b-32*u,4*u,2*u,'#4caf50');}}
function pastry(g,H,cx,by,s,k){var u=s/100;if(k%2){H.R(g,cx-20*u,by-12*u,40*u,12*u,6*u,'#d9a05b');H.R(g,cx-20*u,by-15*u,40*u,6*u,3*u,'#5d3a1f');}
 else{H.P(g,[cx-16*u,by-14*u,cx+16*u,by-14*u,cx+10*u,by,cx-10*u,by],'#e0b06a');H.E(g,cx,by-16*u,14*u,7*u,'#fff4f6');H.E(g,cx,by-20*u,4*u,4*u,'#e53935');}}
GBART.reg('konditer',{draw:function(g,x,y,w,h,lv,t,o){var H=o.H,u=o.u,full=o.full||lv>=2,ch=h*.27,cy=y+h-ch,top=o.top||0;
 var s1=y+top+h*.24,s2=y+top+h*(lv>=2?.47:.5);H.shelf(g,x+w*.04,s1,w*.92,u);H.shelf(g,x+w*.04,s2,w*.92,u);
 var bs=Math.min(w*.26,h*.3),cols=['#e05a8a','#3f8fe0','#e9b949','#4caf50'];
 var nb=full?3:2;for(var i=0;i<nb;i++)box(g,H,x+w*((i+.5)/nb*.84+.08),s1,bs,cols[i]);
 H.row(g,full?[12,20,12,20]:[12,20],x+w*.06+(full?0:w*.2),s2,full?w*.88:w*.48,w*.22);
 H.counter(g,x,cy,w,ch,o.lux?3:lv,o.col,u);
 if(lv>=2){cake(g,H,x+w*.24,cy+ch*.04,Math.min(w*.38,ch*1.8));
  // этажерка с пирожными
  var ex=x+w*.68,es=Math.min(w*.36,ch*1.9),eu=es/100;g.strokeStyle='#c9a14a';g.lineWidth=Math.max(1,2*eu);g.beginPath();g.moveTo(ex,cy+ch*.04);g.lineTo(ex,cy-es*.62);g.stroke();
  for(var tt=0;tt<2;tt++){var ty=cy+ch*.02-tt*es*.3,tw=es*(.46-tt*.12);H.E(g,ex,ty,tw,eu*4,'#f4f6f7');g.strokeStyle='#c9a14a';g.lineWidth=Math.max(.6,eu);H.E(g,ex,ty,tw,eu*4);g.stroke();
   for(var p=0;p<3-tt;p++)pastry(g,H,ex-tw*.6+p*tw*.6/(1-tt*.5),ty-eu*2,es*.32,p+tt);}}
 else{box(g,H,x+w*.26,cy+ch*.04,Math.min(w*.28,ch*1.3),'#e05a8a');H.price(g,x+w*.7,cy+ch*.02,Math.min(w*.3,ch*1.4),'3-40');}
}});})();
