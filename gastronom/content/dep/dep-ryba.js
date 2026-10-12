/* Рыба (ART): пирамиды консервов, вобла на верёвке; образцовый — аквариум с живой рыбой и табличка «Четверг — рыбный день» */
(function(){if(!window.GBART)return;var PI=Math.PI;
function fish(g,H,cx,cy,l,c,dir,u){g.save();g.translate(cx,cy);g.scale(dir,1);H.E(g,0,0,l*.42,l*.16,c);H.P(g,[l*.36,0,l*.58,-l*.14,l*.58,l*.14],H.sh(c,-.15));
 H.E(g,-l*.26,-l*.03,l*.04,l*.04,'#1d1408');g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=Math.max(.6,l*.03);g.beginPath();g.moveTo(-l*.15,-l*.12);g.quadraticCurveTo(0,-l*.03,-l*.15,l*.12);g.stroke();g.restore();}
function vobla(g,H,x0,x1,y,n,u){g.strokeStyle='#8a6a3a';g.lineWidth=Math.max(.8,u*.8);g.beginPath();g.moveTo(x0,y);g.quadraticCurveTo((x0+x1)/2,y+n*2*u,x1,y);g.stroke();
 for(var k=0;k<n;k++){var tt=(k+.5)/n,xx=x0+(x1-x0)*tt,yy=y+4*tt*(1-tt)*n*u;g.save();g.translate(xx,yy);g.rotate(PI/2);fish(g,H,(x1-x0)/n*.55,0,(x1-x0)/n*1.1,'#b39a6a',1,u);g.restore();}}
function pyramid(g,H,ids,cx,by,s){var rows=ids.length;for(var r=0;r<rows;r++){var n=rows-r;for(var k=0;k<n;k++)H.good(g,ids[r],cx+(k-(n-1)/2)*s*.82,by-r*s*.32,s);}}
GBART.reg('ryba',{draw:function(g,x,y,w,h,lv,t,o){var H=o.H,u=o.u,full=o.full||lv>=2,ch=h*.27,cy=y+h-ch,top=o.top||0;
 if(lv>=2){ // аквариум
  var ax=x+w*.08,aw=w*.84,ay=y+top+h*.02,ah=h*.34;H.R(g,ax-2*u,ay-2*u,aw+4*u,ah+4*u,3*u,'#5d4a3a');H.R(g,ax,ay,aw,ah,2*u,H.V(g,ay,ay+ah,['#9fd3e0','#4f9fb5','#2f7f94']));
  g.fillStyle='#d9c79a';g.fillRect(ax,ay+ah*.86,aw,ah*.14);g.strokeStyle='#3f8f4a';g.lineWidth=Math.max(1,1.6*u);
  for(var p=0;p<3;p++){var px=ax+aw*(.15+p*.33);g.beginPath();g.moveTo(px,ay+ah*.9);g.quadraticCurveTo(px+Math.sin(t+p)*4*u,ay+ah*.6,px+Math.sin(t*1.3+p)*3*u,ay+ah*.4);g.stroke();}
  var fc=['#c9d3d6','#e0b84a','#b8c4c8'];for(var f=0;f<3;f++){var ph=t*.35+f*.37,dir=Math.cos(ph*PI*2)>0?1:-1,fx=ax+aw*(.5+.38*Math.sin(ph*PI*2)),fy=ay+ah*(.28+f*.2)+Math.sin(t*1.5+f)*2*u;
   fish(g,H,fx,fy,Math.min(aw*.2,ah*.45),fc[f],-dir,u);}
  g.fillStyle='rgba(255,255,255,.6)';for(var b=0;b<4;b++){var bt=(t*.5+b*.25)%1;H.E(g,ax+aw*.82,ay+ah*(.85-bt*.75),Math.max(.8,1.4*u),Math.max(.8,1.4*u));g.fill();}
  g.fillStyle='rgba(255,255,255,.25)';g.fillRect(ax,ay,aw,ah*.08);
  var ph2=Math.max(8,h*.07);H.R(g,x+w*.18,ay+ah+3*u,w*.64,ph2,2,'#fffbe9');H.txt(g,H.L('ЧЕТВЕРГ — РЫБНЫЙ ДЕНЬ','THURSDAY: FISH DAY'),x+w/2,ay+ah+3*u+ph2*.55,ph2*.62,'#00695c',w*.6);}
 else{vobla(g,H,x+w*.08,x+w*.92,y+top+h*.06,full?5:3,u);
  var s1=y+top+h*.52;H.shelf(g,x+w*.04,s1,w*.92,u);
  if(full){pyramid(g,H,[2,2],x+w*.3,s1,Math.min(w*.2,h*.2));pyramid(g,H,[3,3],x+w*.72,s1,Math.min(w*.2,h*.2));}
  else H.row(g,[2,3],x+w*.25,s1,w*.5,w*.22);}
 H.counter(g,x,cy,w,ch,o.lux?3:lv,o.col,u);
 if(lv>=2){var ls=Math.min(w*.16,ch*.8);pyramid(g,H,[2,2],x+w*.2,cy+ch*.06,ls);pyramid(g,H,[3,3],x+w*.8,cy+ch*.06,ls);fish(g,H,x+w*.5,cy-ch*.06,Math.min(w*.26,ch),'#b8c4c8',1,u);}
 else{fish(g,H,x+w*.35,cy-ch*.12,Math.min(w*.3,ch*1.2),'#b8c4c8',1,u);H.price(g,x+w*.72,cy+ch*.02,Math.min(w*.3,ch*1.4),'0-90');}
}});})();
