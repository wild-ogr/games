/* Бакалея (ART): полки с крупой, сахаром, чаем; на прилавке мешок с совком; образцовый — стена ящиков с надписями, чашечные весы, банка с карамелью */
(function(){if(!window.GBART)return;
GBART.reg('bakaleya',{draw:function(g,x,y,w,h,lv,t,o){var H=o.H,u=o.u,full=o.full||lv>=2,ch=h*.27,cy=y+h-ch;
 if(lv>=2){ // стена ящиков
  var cols=4,rows=2,dw=w*.9/cols,dh=h*.2,dx=x+w*.05,dy=y+o.top,lab=['ГРЕЧКА','РИС','ПШЕНО','МАННА','САХАР','СОЛЬ','ГОРОХ','ЧАЙ'];
  g.font='800 10px sans-serif';var lw=g.measureText('ГРЕЧКА').width,lab1=dh*.26*Math.min(1,dw*.66/(lw/10*dh*.26))>=4.5; // надписи — все или ни одной
  for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var bx=dx+c*dw,by=dy+r*dh;H.R(g,bx+1,by+1,dw-2,dh-2,2,o.lux?'#efe3cf':'#c08a54');
   g.strokeStyle=o.lux?'#c9a14a':'rgba(70,40,15,.45)';g.lineWidth=Math.max(.8,u);g.stroke();
   H.R(g,bx+dw*.15,by+dh*.18,dw*.7,dh*.36,1,'#fffbe9');if(lab1)H.txt(g,lab[r*cols+c],bx+dw/2,by+dh*.37,dh*.26,'#5b3a1a',dw*.66);
   H.E(g,bx+dw/2,by+dh*.76,dw*.12,dh*.08,'#d6a43a');}
  H.shelf(g,x+w*.04,y+h*.6,w*.92,u);H.row(g,[14,21,13,4,1],x+w*.06,y+h*.6,w*.88,w*.2);}
 else{ // две полки
  H.shelf(g,x+w*.04,y+h*.32,w*.92,u);H.shelf(g,x+w*.04,y+h*.6,w*.92,u);
  H.row(g,full?[14,21,13,14]:[14,21],x+w*.06+(full?0:w*.22),y+h*.32,full?w*.88:w*.44,w*.22);
  H.row(g,full?[15,4,1,15]:[4,15,1],x+w*.06+(full?0:w*.11),y+h*.6,full?w*.88:w*.66,w*.22);}
 H.counter(g,x,cy,w,ch,o.lux?3:lv,o.col,u);
 // мешок с крупой и совок
 var ss=Math.min(w*.3,ch*1.5);H.sack(g,x+w*.2,cy+ch*.12,ss,'#d8c49a','#e9d8a8');
 g.fillStyle='#b9c2c6';g.save();g.translate(x+w*.25,cy-ss*.62);g.rotate(-.5);H.R(g,-ss*.12,-ss*.06,ss*.24,ss*.12,ss*.04,'#b9c2c6');g.fillStyle='#8a5229';g.fillRect(ss*.11,-ss*.025,ss*.16,ss*.05);g.restore();
 if(lv>=2){ // чашечные весы и банка с карамелью
  var sx=x+w*.7,sw=Math.min(w*.32,ch*1.6),su=sw/100,sb=cy+ch*.1;H.R(g,sx-30*su,sb-16*su,60*su,16*su,4*su,H.V(g,sb-16*su,sb,['#fbfbf8','#cfcabd']));
  H.E(g,sx-22*su,sb-24*su,18*su,4*su,'#d9a441');H.E(g,sx+22*su,sb-22*su,18*su,4*su,'#d9a441');g.fillStyle='#8a8476';g.fillRect(sx-2*su,sb-28*su,4*su,12*su);
  H.E(g,sx+22*su,sb-28*su,5*su,6*su,'#6f6a60');
  var jx=x+w*.47,jw=Math.min(w*.16,ch*.8);H.R(g,jx-jw/2,cy-jw*1.1+ch*.08,jw,jw*1.1,jw*.2,'rgba(220,240,250,.75)');H.E(g,jx,cy-jw*1.1+ch*.08,jw*.42,jw*.1,'#c62828');
  var cc=['#e53935','#fdd835','#43a047','#1e88e5'];for(var k=0;k<7;k++)H.E(g,jx-jw*.28+(k%3)*jw*.28,cy+ch*.02-(k/3|0)*jw*.24,jw*.12,jw*.09,cc[k%4]);}
 else{H.price(g,x+w*.68,cy+ch*.02,Math.min(w*.3,ch*1.4),'0-48');}
}});})();
