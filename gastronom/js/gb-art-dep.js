'use strict';
/* ================= GBART — отделы гастронома кодом (поток ART, 10.10.2026) =================
   10 отделов × 4 вида. Рамка отдела (стена, вывеска, леса, «образцовая» отделка, «Ремонт отдела» — мрамор, зеркала, лепнина
   «как в Елисеевском») — здесь; начинка каждого отдела (прилавок, товар, оборудование) — в content/dep/dep-<id>.js, грузится
   лениво (GB.load) только для видимых отделов. Нет файла / не загрузился → отдел «в лесах» (вид 0) рисуется всё равно,
   для видов 1–3 dep() вернёт false — у вызывающего своя плашка; игра живёт.
   ДОГОВОР:
     GBART.ids — ['bakaleya','hleb','steklo','moloko','gastro','konditer','ovoshi','soki','ryba','zakaz'] (порядок открытия по разрядам);
     GBART.name(id) — вывеска (L('рус','eng')); GBART.col(id) — цвет отдела;
     GBART.dep(id, lv, ctx) → true|false — нарисовать в холст. lv: 0 пусто/«в лесах», 1 работает, 2 образцовый, 3 «Ремонт отдела» (за голоса,
        только вид). ctx = {g, x, y, w, h, tk (сек, для живого: лампы, газировка, рыбки; без tk — неподвижно), note ('7/10' — на табличке
        лесов вместо «РЕМОНТ»), full (1 — полки полнее: ур.2 отдела у META), season ('ny'|'night' — ёлочная гирлянда / тыквы «Ночной смены»)}.
        Пропорции: ширина от 85 px, w:h от 0,7 до 1,6 (вывеска сверху ≈ 17 % высоты; шире 1,3 внутри — начинка по центру, прилавок на всю ширину).
     GBART.lvOf(metaLv, lux) — уровень отдела у META (0–3) → вид: 0→0, 1→1, 2→1 (full), 3→2; lux (куплен «Ремонт отдела») → 3.
        Возвращает {lv, full}.
     GBART.canvas(id, lv, w, h, o) — готовый холст (кэш; o = {dpr, note, full, season}); null, пока начинка не загружена (грузит сама).
     GBART.url(id, lv, w, h, o) — то же картинкой data:URL ('' пока нет) — для html (Касса, «Торг», Книга).
     GBART.load(id) → Promise; GBART.loaded(id) → bool. Загрузилась начинка → событие GB.emit('artdep', id) (VIEW перерисует зал).
     GBART.reg(id, {draw(g, x, y, w, h, lv, t, o)}) — так регистрирует себя content/dep/dep-<id>.js (рисует внутри проёма).
     GBART.plaque(g, x, y, w, h) — табличка «Ударник торговли» (≈1,7:1 по центру прямоугольника) для зала: VIEW по PAY.own('starter').
   Флаг GB.flag('art') выключен → dep() всегда false (у VIEW — плашки). */
(function(){
var IDS=['bakaleya','hleb','steklo','moloko','gastro','konditer','ovoshi','soki','ryba','zakaz'];
var INFO={
 bakaleya:{n:['БАКАЛЕЯ','GROCERY'],c:'#2e7d32'},
 hleb:{n:['ХЛЕБ','BREAD'],c:'#a0522d'},
 steklo:{n:['ПРИЁМ ПОСУДЫ','BOTTLE RETURN'],c:'#3f7f6b'},
 moloko:{n:['МОЛОКО','DAIRY'],c:'#1f5f99'},
 gastro:{n:['ГАСТРОНОМИЯ','DELI'],c:'#8e2430'},
 konditer:{n:['КОНДИТЕРСКИЙ','SWEETS'],c:'#c2185b'},
 ovoshi:{n:['ОВОЩИ-ФРУКТЫ','FRUIT & VEG'],c:'#558b2f'},
 soki:{n:['СОКИ-ВОДЫ','JUICE & SODA'],c:'#e65100'},
 ryba:{n:['РЫБА','FISH'],c:'#00796b'},
 zakaz:{n:['СТОЛ ЗАКАЗОВ','ORDERS DESK'],c:'#6a1b9a'}};
var DEF={},LOAD={},PI=Math.PI,AMAX=1.3;
function Lx(ru,en){try{return L(ru,en);}catch(e){return ru;}}
function on(){try{return !window.GB||GB.flag('art');}catch(e){return true;}}
function fnt(){try{return FNT;}catch(e){return '-apple-system,Segoe UI,Roboto,sans-serif';}}
/* помощники (свои, чтобы начинка не зависела от имён игры; товары — drawGood игры) */
var H={
 L:Lx,
 E:function(g,x,y,rx,ry,f){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,PI*2);if(f){g.fillStyle=f;g.fill();}},
 P:function(g,p,f){g.beginPath();g.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();if(f){g.fillStyle=f;g.fill();}},
 R:function(g,x,y,w,h,r,f){g.beginPath();r=Math.max(0,Math.min(r||0,w/2,h/2));g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();if(f){g.fillStyle=f;g.fill();}},
 V:function(g,y0,y1,st){var gr=g.createLinearGradient(0,y0,0,y1);for(var i=0;i<st.length;i++)gr.addColorStop(i/(st.length-1),st[i]);return gr;},
 Hz:function(g,x0,x1,st){var gr=g.createLinearGradient(x0,0,x1,0);for(var i=0;i<st.length;i++)gr.addColorStop(i/(st.length-1),st[i]);return gr;},
 sh:function(hex,p){var n=parseInt(hex.slice(1),16),r=n>>16,gg=n>>8&255,b=n&255,t=p<0?0:255,q=Math.abs(p);return 'rgb('+Math.round((t-r)*q+r)+','+Math.round((t-gg)*q+gg)+','+Math.round((t-b)*q+b)+')';},
 good:function(g,t,cx,by,s){try{drawGood(g,t,cx,by,s);}catch(e){}},
 txt:function(g,s,x,y,size,col,w){g.font='800 '+Math.max(5,Math.round(size))+'px '+fnt();g.textAlign='center';g.textBaseline='middle';
  if(w){var tw=g.measureText(s).width;if(tw>w){var fs=size*w/tw;if(fs<4.5)return;g.font='800 '+Math.max(5,Math.round(fs))+'px '+fnt();}}else if(size<4.5)return;g.fillStyle=col;g.fillText(s,x,y);}, // мельче 4,5 px — не рисуем (не прочесть, наезжает)
 // полка с кронштейнами: (x, y) — левый край верха доски, w — длина
 shelf:function(g,x,y,w,u,col){g.fillStyle=col||'#b8784a';g.fillRect(x,y,w,Math.max(2,3*u));g.fillStyle='rgba(60,30,10,.25)';g.fillRect(x,y+Math.max(2,3*u),w,Math.max(1,1.5*u));},
 // ряд товаров игры на полке: ids — номера GOODS, (x, by) — левый край и низ, w — длина, smax — потолок размера
 row:function(g,ids,x,by,w,smax){var n=ids.length;if(!n)return;var s=Math.min(smax||1e9,w/n*.92);for(var i=0;i<n;i++)H.good(g,ids[i],x+w*(i+.5)/n,by,s);},
 // мешок (крупа, сахар, картошка): (cx, by) — низ, s — ширина
 sack:function(g,cx,by,s,col,fill){var u=s/100;H.P(g,[cx-40*u,by,cx+40*u,by,cx+46*u,by-40*u,cx+30*u,by-80*u,cx-30*u,by-80*u,cx-46*u,by-40*u],H.V(g,by-80*u,by,[H.sh(col,.15),col,H.sh(col,-.2)]));
  if(fill){H.E(g,cx,by-80*u,30*u,8*u,fill);}else{H.P(g,[cx-30*u,by-80*u,cx+30*u,by-80*u,cx+18*u,by-92*u,cx-18*u,by-92*u],H.sh(col,-.1));}
  g.strokeStyle='rgba(90,60,30,.35)';g.lineWidth=Math.max(.8,1.4*u);g.beginPath();g.moveTo(cx-30*u,by-60*u);g.quadraticCurveTo(cx-10*u,by-50*u,cx-24*u,by-20*u);g.moveTo(cx+28*u,by-56*u);g.quadraticCurveTo(cx+14*u,by-40*u,cx+26*u,by-12*u);g.stroke();},
 // ценник на прилавке
 price:function(g,cx,by,s,txt){var u=s/100;H.R(g,cx-30*u,by-22*u,60*u,22*u,3*u,'#fffdf2');g.strokeStyle='#c62828';g.lineWidth=Math.max(.6,1.2*u);g.stroke();H.txt(g,txt,cx,by-11*u,13*u,'#2d2016',56*u);},
 // прилавок отдела (x, y — верх, w, h); lv2+ — со стеклом и лентой цвета отдела
 counter:function(g,x,y,w,h,lv,col,u){g.fillStyle=H.V(g,y,y+h,lv>=3?['#f4efe6','#d9d1c2','#bdb3a2']:['#a86b3b','#7b4a26']);g.fillRect(x,y,w,h);
  g.fillStyle=lv>=3?'#c9a14a':'#c98d56';g.fillRect(x,y,w,Math.max(2,h*.14));
  if(lv>=3){g.strokeStyle='rgba(150,140,120,.35)';g.lineWidth=Math.max(.6,u*.6);g.beginPath();for(var k=0;k<3;k++){var yy=y+h*(.3+k*.22);g.moveTo(x,yy);g.bezierCurveTo(x+w*.3,yy-h*.1,x+w*.6,yy+h*.12,x+w,yy-h*.05);}g.stroke();}
  else{g.strokeStyle='rgba(60,30,10,.3)';g.lineWidth=Math.max(1,u);var n=Math.max(1,Math.round(w/(40*u)));for(var i=0;i<n;i++)g.strokeRect(x+w*(i+.12)/n,y+h*.32,w*.76/n,h*.5);}
  if(lv>=2){g.fillStyle=col;g.fillRect(x,y+h*.14,w,Math.max(2,h*.1));}}
};
/* ---- рамка ---- */
function sign(g,x,y,w,h,txt,lv,col){var r=h*.22;
 if(lv>=3){H.R(g,x-2,y-2,w+4,h+4,r+2,H.Hz(g,x,x+w,['#8a5a1a','#f2cf6a','#fff2bf','#d6a43a','#8a5a1a']));H.R(g,x+h*.08,y+h*.08,w-h*.16,h-h*.16,r,'#5b1420');}
 else{H.R(g,x,y,w,h,r,lv?col:'#9e9488');if(lv>=2){g.strokeStyle='#e9b949';g.lineWidth=Math.max(1.5,h*.09);g.stroke();}}
 var stars=lv>=2&&w>=h*9,fs=h*.6;H.txt(g,txt,x+w/2,y+h*.54,fs,lv>=3?'#f6d77a':'#fff6df',w-h*(stars?1.75:.5));
 if(stars){var st=function(cx){g.beginPath();for(var k=0;k<10;k++){var a=-PI/2+k*PI/5,rr=k%2?h*.12:h*.27;g.lineTo(cx+Math.cos(a)*rr,y+h/2+Math.sin(a)*rr);}g.closePath();g.fillStyle='#f6d77a';g.fill();};st(x+h*.42);st(x+w-h*.42);}}
function wall(g,x,y,w,h,lv,col,u){
 if(lv>=3){ // зеркальная стена в мраморной раме
  g.fillStyle=H.V(g,y,y+h,['#e9eef2','#c9d4dc','#e4eaee']);g.fillRect(x,y,w,h);g.fillStyle='rgba(255,255,255,.45)';
  for(var k=0;k<3;k++){var xx=x+w*(.15+k*.33);H.P(g,[xx,y+h,xx+h*.25,y,xx+h*.25+w*.06,y,xx+w*.06,y+h]);}
  g.strokeStyle='rgba(150,120,60,.5)';g.lineWidth=Math.max(1,u);for(var j=1;j<3;j++){g.beginPath();g.moveTo(x+w*j/3,y);g.lineTo(x+w*j/3,y+h);g.stroke();}return;}
 g.fillStyle=lv?'#f5e7cc':'#ddd0b8';g.fillRect(x,y,w,h);
 if(lv>=2){var ts=Math.max(6,Math.min(w,h)/7),y0=y+h*.5;for(var yy=y0,r=0;yy<y+h;yy+=ts,r++)for(var xx2=x,c=0;xx2<x+w;xx2+=ts,c++){g.fillStyle=(r+c)%2?'#e6efe9':'#fdfcf7';g.fillRect(xx2,yy,Math.min(ts,x+w-xx2),Math.min(ts,y+h-yy));}
  g.fillStyle=col;g.fillRect(x,y0-Math.max(2,ts*.3),w,Math.max(2,ts*.3));}
 else if(lv===1){g.fillStyle='rgba(120,90,50,.08)';g.fillRect(x,y+h*.55,w,h*.45);g.fillStyle='rgba(120,90,50,.18)';g.fillRect(x,y+h*.55,w,Math.max(1,u));}}
function frameWood(g,x,y,w,h,lv,u){var fw=Math.max(3,w*.045);
 if(lv>=3){ // мраморные пилястры и лепнина
  for(var s=0;s<2;s++){var px=s?x+w-fw*1.5:x;g.fillStyle=H.Hz(g,px,px+fw*1.5,['#d8d2c6','#f7f4ee','#e7e2d8','#c9c1b2']);g.fillRect(px,y,fw*1.5,h);
   g.strokeStyle='rgba(120,110,95,.35)';g.lineWidth=Math.max(.6,u*.5);g.beginPath();g.moveTo(px+fw*.3,y+h*.1);g.bezierCurveTo(px+fw*1.2,y+h*.3,px,y+h*.5,px+fw,y+h*.8);g.stroke();
   g.fillStyle='#d6a43a';g.fillRect(px-1,y+h-fw*.8,fw*1.5+2,fw*.8);g.fillRect(px-1,y,fw*1.5+2,fw*.6);}
  return;}
 g.fillStyle=lv?'#8a5229':'#9a8a72';g.fillRect(x,y,fw,h);g.fillRect(x+w-fw,y,fw,h);g.fillStyle='rgba(255,255,255,.15)';g.fillRect(x+fw*.2,y,fw*.25,h);g.fillRect(x+w-fw*.8,y,fw*.25,h);}
function stucco(g,x,y,w,h,u){ // лепной карниз с ракушками над вывеской
 g.fillStyle=H.V(g,y,y+h,['#fff8e3','#e8dcc0']);g.fillRect(x,y,w,h);g.fillStyle='#d6a43a';g.fillRect(x,y+h-Math.max(1.5,h*.14),w,Math.max(1.5,h*.14));
 var n=Math.max(3,Math.round(w/(h*1.3)));for(var i=0;i<n;i++){var cx=x+w*(i+.5)/n,r=Math.min(h*.42,w/n*.42);
  g.beginPath();g.arc(cx,y+h*.62,r,PI,0);g.closePath();g.fillStyle=i%2?'#efe2c4':'#f6edd6';g.fill();g.strokeStyle='rgba(170,130,60,.6)';g.lineWidth=Math.max(.6,u*.5);
  for(var k=-2;k<=2;k++){g.beginPath();g.moveTo(cx,y+h*.62);g.lineTo(cx+Math.sin(k*.6)*r,y+h*.62-Math.cos(k*.6)*r);g.stroke();}}}
function chandelier(g,cx,y,s,t){g.strokeStyle='#b8862b';g.lineWidth=Math.max(1,s*.04);g.beginPath();g.moveTo(cx,y);g.lineTo(cx,y+s*.3);g.stroke();
 H.E(g,cx,y+s*.42,s*.42,s*.1,'#d6a43a');for(var k=-2;k<=2;k++){var x=cx+k*s*.18,yy=y+s*.42;H.E(g,x,yy+s*.14,s*.05,s*.12,'rgba(230,245,255,.9)');
  var gl=.55+.25*Math.sin(t*2+k);g.fillStyle='rgba(255,236,170,'+gl.toFixed(2)+')';H.E(g,x,yy-s*.06,s*.05,s*.07);g.fill();}}
function lamps(g,x,w,y,u,t){for(var k=0;k<2;k++){var cx=x+w*(.28+k*.44),r=Math.max(4,7*u);g.strokeStyle='#4a3a2a';g.lineWidth=1;g.beginPath();g.moveTo(cx,y);g.lineTo(cx,y+r*.8);g.stroke();
  var gr=g.createRadialGradient(cx,y+r*1.4,0,cx,y+r*1.4,r*4);gr.addColorStop(0,'rgba(255,230,160,.35)');gr.addColorStop(1,'rgba(255,230,160,0)');g.fillStyle=gr;g.fillRect(cx-r*4,y,r*8,r*6);
  g.beginPath();g.moveTo(cx-r,y+r*1.5);g.quadraticCurveTo(cx-r,y+r*.7,cx,y+r*.7);g.quadraticCurveTo(cx+r,y+r*.7,cx+r,y+r*1.5);g.closePath();g.fillStyle='#fffaf0';g.fill();H.E(g,cx,y+r*1.5,r,r*.2,'#fff1b8');}}
function scaffold(g,x,y,w,h,u,note){ // леса, плёнка, табличка, ведро краски
 g.fillStyle='rgba(200,215,220,.55)';g.fillRect(x+w*.05,y+h*.04,w*.9,h*.8);g.strokeStyle='rgba(150,165,170,.6)';g.lineWidth=Math.max(1,u);
 for(var k=1;k<5;k++){g.beginPath();g.moveTo(x+w*.05+w*.9*k/5,y+h*.04);g.quadraticCurveTo(x+w*.07+w*.9*k/5,y+h*.5,x+w*.04+w*.9*k/5,y+h*.84);g.stroke();}
 g.strokeStyle='#a07d4e';g.lineWidth=Math.max(2,4*u);g.lineCap='round';
 for(var i=0;i<3;i++){var xx=x+w*(.12+i*.38);g.beginPath();g.moveTo(xx,y+h*.02);g.lineTo(xx,y+h*.96);g.stroke();}
 g.beginPath();g.moveTo(x+w*.08,y+h*.33);g.lineTo(x+w*.92,y+h*.33);g.moveTo(x+w*.08,y+h*.66);g.lineTo(x+w*.92,y+h*.66);g.stroke();
 g.strokeStyle='rgba(160,125,78,.75)';g.lineWidth=Math.max(1.5,2.5*u);g.beginPath();g.moveTo(x+w*.12,y+h*.33);g.lineTo(x+w*.5,y+h*.66);g.moveTo(x+w*.88,y+h*.33);g.lineTo(x+w*.5,y+h*.66);g.stroke();
 g.fillStyle='#c79a5b';g.fillRect(x+w*.06,y+h*.66-3*u,w*.88,Math.max(3,5*u));
 var pw=w*.7,ph=Math.max(12,h*.2),px=x+(w-pw)/2,py=y+h*.4;H.R(g,px,py,pw,ph,ph*.18,'#fffbe9');g.strokeStyle='#c62828';g.lineWidth=Math.max(1.5,2*u);g.stroke();
 H.txt(g,note||Lx('РЕМОНТ','RENOVATION'),px+pw/2,py+ph*.54,ph*.62,'#c62828',pw*.9);
 // ведро краски и кисть
 var bx=x+w*.78,by=y+h*.97,bs=Math.max(6,w*.11);H.P(g,[bx-bs*.5,by-bs,bx+bs*.5,by-bs,bx+bs*.42,by,bx-bs*.42,by],'#8fa3ad');H.E(g,bx,by-bs,bs*.5,bs*.14,'#5aa0d8');
 g.strokeStyle='#5d6b72';g.lineWidth=Math.max(1,u*.8);g.beginPath();g.arc(bx,by-bs,bs*.5,PI,0);g.stroke();
 g.strokeStyle='#8a5229';g.lineWidth=Math.max(1.5,2*u);g.beginPath();g.moveTo(bx-bs*.2,by-bs*1.05);g.lineTo(bx-bs*.6,by-bs*1.8);g.stroke();g.lineCap='butt';}
function season(g,x,y,w,h,sh,u,s,t){
 if(s==='ny'){var n=Math.max(3,Math.round(w/(14*u))),sag=Math.max(3,sh*.3),cols=['#e0352b','#f5c93a','#2f7fd8','#3fb26a'];
  var y0=y+sh*.92;g.strokeStyle='#2c8a4a';g.lineWidth=Math.max(1.5,2.4*u);g.beginPath();g.moveTo(x,y0);g.quadraticCurveTo(x+w/2,y0+sag*2,x+w,y0);g.stroke();
  for(var j=1;j<n;j++){var tt=j/n,xx=x+tt*w,yy=y0+4*tt*(1-tt)*sag;var on=Math.sin(t*3+j)>-.3;H.E(g,xx,yy+2.4*u,Math.max(1.5,2.2*u),Math.max(2,3*u),on?cols[j%4]:H.sh(cols[j%4],-.35));}}
 else if(s==='night'){var ps=Math.max(8,w*.16),px=x+w-ps*.7,py=y+h-ps*.1;H.E(g,px,py-ps*.42,ps*.55,ps*.42,H.V(g,py-ps*.84,py,['#ffa53a','#e8731a']));
  g.strokeStyle='rgba(150,70,10,.6)';g.lineWidth=Math.max(.8,u*.8);for(var k=-1;k<=1;k+=2){g.beginPath();g.ellipse(px+k*ps*.18,py-ps*.42,ps*.2,ps*.4,0,0,PI*2);g.stroke();}
  g.fillStyle='#4a7a2a';g.fillRect(px-ps*.05,py-ps*.98,ps*.1,ps*.16);var gl=.7+.3*Math.sin(t*5);g.fillStyle='rgba(60,25,0,'+gl.toFixed(2)+')';
  H.P(g,[px-ps*.28,py-ps*.5,px-ps*.12,py-ps*.5,px-ps*.2,py-ps*.62]);g.fill();H.P(g,[px+ps*.12,py-ps*.5,px+ps*.28,py-ps*.5,px+ps*.2,py-ps*.62]);g.fill();
  g.fillRect(px-ps*.22,py-ps*.3,ps*.44,ps*.07);
  // паутинка в углу
  var cw=Math.max(10,w*.16),cx=x+Math.max(3,w*.045);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=Math.max(.6,u*.5);g.beginPath();
  for(var a=0;a<=4;a++){var an=a/4*PI/2;g.moveTo(cx,y+sh);g.lineTo(cx+Math.cos(an)*cw,y+sh+Math.sin(an)*cw);}
  for(var r=1;r<=3;r++){var rr=cw*r/3.3;g.moveTo(cx+rr,y+sh);for(var b=1;b<=4;b++){var an2=b/4*PI/2;g.lineTo(cx+Math.cos(an2)*rr,y+sh+Math.sin(an2)*rr);}}g.stroke();}}
/* ---- отдел целиком ---- */
function paint(id,lv,c){var g=c.g,x=c.x,y=c.y,w=c.w,h=c.h,t=c.tk||0,inf=INFO[id],u=Math.min(w,h*1.1)/100;
 var sh=Math.max(11,Math.min(h*.17,w*.2)),top=y+sh*.55,lux=lv>=3;g.save();g.lineJoin='round';
 // тень и проём
 g.fillStyle='rgba(60,30,10,.18)';g.fillRect(x+2,top+3,w,h-(top-y));
 var ix=x+Math.max(3,w*.045)*(lux?1.5:1),iw=w-2*(ix-x),iy=top,ih=y+h-top;
 wall(g,x,top,w,ih,lv,inf.c,u);
 if(lux){stucco(g,x,top,w,Math.max(6,sh*.55),u);iy=top+Math.max(6,sh*.55);ih=y+h-iy;}
 if(lv===0)scaffold(g,ix,iy,iw,ih,u,c.note);
 else{var d=DEF[id];g.save();g.beginPath();g.rect(ix,iy,iw,ih);g.clip();
  // широкий низкий проём (телефон: 88×57, w:h 1,53): начинка — по центру в пропорции не шире AMAX, прилавок — на всю ширину
  var vw=Math.min(iw,ih*AMAX),vx=ix+(iw-vw)/2,cnt=H.counter;
  if(vw<iw)H.counter=function(g2,x2,y2,w2,h2,l2,c2,u2){return cnt(g2,ix,y2,iw,h2,l2,c2,u2);};
  try{d.draw(g,vx,iy,vw,ih,Math.min(lv,3),t,{full:c.full,u:u,col:inf.c,H:H,lux:lux,top:lv>=2?ih*.15:0});}finally{H.counter=cnt;}
  if(lux)chandelier(g,x+w/2,iy,Math.min(iw*.3,ih*.24),t);else if(lv>=2)lamps(g,ix,iw,iy,u,t);g.restore();}
 frameWood(g,x,top,w,y+h-top,lv,u);
 sign(g,x+w*.05,y,w*.9,sh,Lx(inf.n[0],inf.n[1]),lv,inf.c);
 if(c.season)season(g,x+w*.05,y,w*.9,h,sh,u,c.season,t);
 g.restore();return true;}
function load(id){if(DEF[id])return Promise.resolve();if(LOAD[id])return LOAD[id];
 if(!window.GB||!GB.load)return Promise.reject(new Error('GB.load'));
 LOAD[id]=GB.load('content/dep/dep-'+id+'.js').then(function(){if(!DEF[id])throw new Error('dep '+id);},function(e){LOAD[id]=null;throw e;});
 LOAD[id].catch(function(){});return LOAD[id];}
function dep(id,lv,ctx){if(!on()||!INFO[id]||!ctx||!ctx.g)return false;lv=Math.max(0,Math.min(3,lv|0));
 if(lv>0&&!DEF[id]){load(id);return false;}
 try{return paint(id,lv,ctx);}catch(e){try{console.error('[GBART] '+id,e);}catch(x){}return false;}}
var CV={};
function key(id,lv,w,h,o){return [id,lv,Math.round(w),Math.round(h),o.dpr||1,o.note||'',o.full?1:0,o.season||'',(function(){try{return LANG;}catch(e){return '';}})()].join('|');}
function canvas(id,lv,w,h,o){o=o||{};if(!on()||!INFO[id])return null;var k=key(id,lv,w,h,o);if(CV[k])return CV[k];if(lv>0&&!DEF[id]){load(id);return null;}
 var d=o.dpr||1,c=document.createElement('canvas');c.width=Math.ceil(w*d);c.height=Math.ceil(h*d);var g=c.getContext('2d');if(!g)return null;g.setTransform(d,0,0,d,0,0);
 if(!dep(id,lv,{g:g,x:0,y:0,w:w,h:h,note:o.note,full:o.full,season:o.season}))return null;return CV[k]=c;}
function url(id,lv,w,h,o){var c=canvas(id,lv,w,h,o);if(!c)return '';try{return c.toDataURL('image/png');}catch(e){return '';}}
function reg(id,def){if(!INFO[id]||!def||!def.draw)return;DEF[id]=def;for(var k in CV)if(k.indexOf(id+'|')===0)delete CV[k];
 try{if(window.GB&&GB.emit)GB.emit('artdep',id);}catch(e){}}
/* табличка «Ударник торговли» (куплена Авоська новичка — VIEW вешает в зал по PAY.own('starter')): латунная рамка, красное
   поле, золотые буквы, веточки лавра; (x, y, w, h) — любой прямоугольник, рисуется по центру с пропорцией ≈ 1,7:1 */
function plaque(g,x,y,w,h){if(!g)return false;var pw=Math.min(w,h*1.7),ph=pw/1.7,px=x+(w-pw)/2,py=y+(h-ph)/2,u=pw/100;
 g.save();g.fillStyle='rgba(40,20,10,.25)';H.R(g,px+1.5*u,py+2.5*u,pw,ph,5*u,'rgba(40,20,10,.25)');
 H.R(g,px,py,pw,ph,5*u,H.V(g,py,py+ph,['#f3d27a','#b8862b','#e8c25e','#8a6118']));
 H.R(g,px+4*u,py+4*u,pw-8*u,ph-8*u,3*u,H.V(g,py,py+ph,['#c62828','#9c1c1c','#7f1414']));
 g.strokeStyle='rgba(255,215,120,.7)';g.lineWidth=Math.max(.6,.8*u);H.R(g,px+6.5*u,py+6.5*u,pw-13*u,ph-13*u,2*u);g.stroke();
 for(var i=0;i<4;i++){var sx=px+(i%2?pw-3*u:3*u),sy=py+(i<2?3*u:ph-3*u);H.E(g,sx,sy,1.4*u,1.4*u,'#6b4a12');}
 function leaf(cx,cy,dir){g.fillStyle='#f0c75a';for(var k=0;k<5;k++){var a=-PI/2+dir*(.35+k*.32),r=9*u;var lx=cx+Math.cos(a)*r*dir*.0+dir*k*1.6*u,ly=cy+k*3.2*u;
  g.save();g.translate(lx,ly);g.rotate(dir*(.9-k*.12));g.beginPath();g.ellipse(0,0,3.4*u,1.4*u,0,0,PI*2);g.fill();g.restore();}
  g.strokeStyle='#f0c75a';g.lineWidth=Math.max(.6,.7*u);g.beginPath();g.moveTo(cx,cy-1*u);g.quadraticCurveTo(cx+dir*3*u,cy+8*u,cx+dir*7*u,cy+15*u);g.stroke();}
 leaf(px+14*u,py+ph*.3,1);leaf(px+pw-14*u,py+ph*.3,-1);
 H.txt(g,Lx('УДАРНИК','MODEL'),px+pw/2,py+ph*.38,15*u,'#ffe08a',pw*.56);
 H.txt(g,Lx('ТОРГОВЛИ','WORKER'),px+pw/2,py+ph*.66,11*u,'#ffe08a',pw*.56);
 g.restore();return true;}
function lvOf(m,lux){m=m|0;if(lux&&m>0)return {lv:3,full:1};return m<=0?{lv:0,full:0}:m===1?{lv:1,full:0}:m===2?{lv:1,full:1}:{lv:2,full:1};}
window.GBART={v:1,ids:IDS,name:function(id){var i=INFO[id];return i?Lx(i.n[0],i.n[1]):'';},col:function(id){return INFO[id]?INFO[id].c:'#888';},
 dep:dep,canvas:canvas,url:url,load:load,loaded:function(id){return !!DEF[id];},reg:reg,lvOf:lvOf,plaque:plaque,H:H};
})();
