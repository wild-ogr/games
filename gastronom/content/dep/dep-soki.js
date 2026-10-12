/* Соки-воды (ART): стеклянные конусы с соками и краниками, гранёные стаканы, солонка с ложечкой у томатного; образцовый — автомат газированной воды */
(function(){if(!window.GBART)return;var PI=Math.PI;
var JC=['#d63a2b','#f2b632','#7b3f8c','#f0e6c0'];
function cone(g,H,cx,top,w,hh,c,t,u){ // конус вершиной вниз на стойке
 H.P(g,[cx-w/2,top,cx+w/2,top,cx+w*.06,top+hh,cx-w*.06,top+hh],'rgba(225,240,245,.55)');
 var lvl=.18+.04*Math.sin(t*.5+cx);H.P(g,[cx-w/2*(1-lvl),top+hh*lvl,cx+w/2*(1-lvl),top+hh*lvl,cx+w*.06,top+hh,cx-w*.06,top+hh],c);
 g.fillStyle='rgba(255,255,255,.55)';for(var k=0;k<3;k++){var by=top+hh*(.9-((t*.35+k*.33)%1)*.65);H.E(g,cx+(k-1)*w*.08,by,Math.max(.8,w*.025),Math.max(.8,w*.025));g.fill();}
 g.fillStyle='rgba(255,255,255,.45)';H.P(g,[cx-w*.38,top+hh*.06,cx-w*.3,top+hh*.06,cx-w*.03,top+hh*.85]);g.fill();
 g.strokeStyle='rgba(120,150,160,.8)';g.lineWidth=Math.max(.8,u*.8);H.P(g,[cx-w/2,top,cx+w/2,top,cx+w*.06,top+hh,cx-w*.06,top+hh]);g.stroke();
 g.fillStyle='#b0b8bc';g.fillRect(cx-w*.07,top+hh,w*.14,hh*.08);g.fillRect(cx-w*.02,top+hh*1.08,w*.04,hh*.06);H.E(g,cx+w*.1,top+hh*1.04,w*.06,hh*.025,'#8a949a');}
function glass(g,H,cx,by,s,c){var u=s/100;H.P(g,[cx-12*u,by-30*u,cx+12*u,by-30*u,cx+10*u,by,cx-10*u,by],'rgba(225,240,245,.7)');if(c)H.P(g,[cx-11*u,by-18*u,cx+11*u,by-18*u,cx+10*u,by,cx-10*u,by],c);
 g.strokeStyle='rgba(140,170,180,.9)';g.lineWidth=Math.max(.6,u);for(var k=-1;k<=1;k++){g.beginPath();g.moveTo(cx+k*7*u,by-30*u);g.lineTo(cx+k*6*u,by);g.stroke();}}
function automat(g,H,x,by,w,hh,t,u){var y=by-hh;H.R(g,x,y,w,hh,w*.08,H.Hz(g,x,x+w,['#b71c1c','#e53935','#c62828']));
 H.R(g,x+w*.1,y+hh*.06,w*.8,hh*.16,w*.04,'#fffbe9');H.txt(g,H.L('ГАЗИРОВАННАЯ','SODA'),x+w/2,y+hh*.1,hh*.05,'#c62828',w*.72);H.txt(g,H.L('ВОДА','WATER'),x+w/2,y+hh*.17,hh*.05,'#c62828',w*.72);
 H.R(g,x+w*.2,y+hh*.3,w*.6,hh*.36,w*.04,'#26302f');var on=.5+.5*Math.sin(t*2.4);g.fillStyle='rgba(255,236,170,'+(.15+on*.15).toFixed(2)+')';g.fillRect(x+w*.2,y+hh*.3,w*.6,hh*.36);
 glass(g,H,x+w/2,y+hh*.62,w*.7,'rgba(220,240,250,.8)');g.fillStyle='#ffe08a';H.R(g,x+w*.72,y+hh*.72,w*.1,hh*.05,1);g.fill();
 g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+w*.3,y+hh*.74,w*.3,hh*.03);H.txt(g,H.L('3 коп.','3 kop.'),x+w*.45,y+hh*.84,hh*.06,'#fff6df',w*.5);}
GBART.reg('soki',{draw:function(g,x,y,w,h,lv,t,o){var H=o.H,u=o.u,full=o.full||lv>=2,ch=h*.27,cy=y+h-ch,top=o.top||0;
 var n=full?3:2,cw=lv>=2?w*.17:w*.2,ct=y+top+h*.06,chh=h*.36,area=lv>=2?w*.62:w*.9,ax=x+w*.04;
 g.fillStyle='#8a5229';g.fillRect(ax,ct-2*u,area,Math.max(2,3*u));
 for(var i=0;i<n;i++)cone(g,H,ax+area*(i+.5)/n,ct,cw,chh,JC[i],t,u);
 H.counter(g,x,cy,w,ch,o.lux?3:lv,o.col,u);
 var gs=Math.min(w*.18,ch*.9);for(var k=0;k<(full?3:2);k++)glass(g,H,ax+area*(k+.5)/n,cy+ch*.06,gs,k===0?JC[0]:k===1?JC[1]:'');
 // солонка с ложечкой у томатного
 var sx=ax+area*(.5/n)+gs*.38;H.E(g,sx,cy+ch*.04,gs*.12,gs*.05,'#fff');H.E(g,sx,cy+ch*.02,gs*.11,gs*.04,'#f0f0f0');g.strokeStyle='#9aa3a8';g.lineWidth=Math.max(.6,u*.8);g.beginPath();g.moveTo(sx,cy+ch*.02);g.lineTo(sx+gs*.12,cy-gs*.12);g.stroke();
 if(lv>=2)automat(g,H,x+w*.7,cy+ch*.9,w*.27,h*.72,t,u);
 else H.row(g,full?[18,7]:[18],x+w*(full?.62:.72),cy+ch*.06,w*(full?.34:.2),w*.17);
}});})();
