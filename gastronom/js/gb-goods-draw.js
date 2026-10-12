'use strict';
/* ================= gb-goods-draw — рисунки местных товаров id 23–62 (поток GOODS) =================
   Кодом, в стиле GOOD_DRAW игры (тёплый 2.5D, тень-эллипс, блик, контур): f(g, cx, by, u) — cx центр, by низ, u = размер/100.
   Пишет только НОВЫЕ id: GOOD_DRAW[id] и GOODS[id]={n,a} (для askLine/gName); старые 1–22 и RARE не трогает.
   Данные — js/gb-goods-data.js (GBG). Генератор v1 новых id не видит (GOOD_ORDER не трогаем).
*/
(function(){
  if(typeof GOOD_DRAW==='undefined'||typeof GOODS==='undefined'||typeof GBG==='undefined')return;
  var P=Math.PI;
  function st(g,c,w){g.strokeStyle=c;g.lineWidth=w;g.stroke();}
  function line(g,pts,c,w){g.beginPath();g.moveTo(pts[0],pts[1]);for(var i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.strokeStyle=c;g.lineWidth=w;g.stroke();}
  // рыбка: (x,y) — центр, len — длина, ang — поворот, c1/c2 — спина/брюхо
  function fish(g,x,y,len,ht,ang,c1,c2,u){g.save();g.translate(x,y);g.rotate(ang);
    poly(g,[len*.42,0,len*.62,-ht*.55,len*.58,0,len*.62,ht*.55],c1);
    ell(g,0,0,len*.48,ht*.5,lin(g,0,-ht*.5,0,ht*.5,[c1,c2]));
    g.beginPath();g.ellipse(0,0,len*.48,ht*.5,0,0,P*2);st(g,'rgba(60,40,20,.45)',1.2*u);
    ell(g,-len*.32,-ht*.1,ht*.11,ht*.11,'#2a1a0a');ell(g,-len*.1,-ht*.22,len*.18,ht*.08,'rgba(255,255,255,.35)');
    g.restore();}
  // кулёк из обёрточной бумаги (конус), сверху — горка: fill(cx, topY, r)
  function cone(g,cx,by,w,h,paper,fill,u){var top=by-h;fill(cx,top+4*u,w*.5);
    poly(g,[cx-w/2,top,cx+w/2,top,cx+w*.06,by,cx-w*.06,by],lin(g,cx-w/2,0,cx+w/2,0,[shade(paper,-.15),paper,shade(paper,.15),shade(paper,-.25)]));
    poly(g,[cx-w/2,top,cx+w/2,top,cx+w*.06,by,cx-w*.06,by]);st(g,'rgba(70,45,20,.45)',1.3*u);
    line(g,[cx-w*.38,top+h*.12,cx+w*.1,top+h*.75],'rgba(80,55,25,.35)',1.2*u);}
  // тарелка/поднос 2.5D: эллипс с бортом
  function plate(g,cx,y,rx,ry,c1,rim,u){ell(g,cx,y+ry*.25,rx,ry,shade(c1,-.25));ell(g,cx,y,rx,ry,c1);ell(g,cx,y,rx*.78,ry*.7,shade(c1,-.08));
    if(rim){g.beginPath();g.ellipse(cx,y,rx*.92,ry*.88,0,0,P*2);st(g,rim,2*u);}}
  // банка стеклянная с жидкостью и крышкой
  function jar(g,cx,by,w,h,liq,lvl,lid,u){bottle(g,cx,by,w,h,w*.84,5*u,5*u,liq,lvl);
    rrect(g,cx-w*.45,by-h-3*u,w*.9,9*u,3*u);g.fillStyle=lin(g,cx-w*.45,0,cx+w*.45,0,[shade(lid,-.3),shade(lid,.35),shade(lid,-.3)]);g.fill();}
  function seeds(g,cx,cy,rx,ry,n,c,s,u,seed){var k=seed||7;for(var i=0;i<n;i++){k=(k*9301+49297)%233280;var a=k/233280;k=(k*9301+49297)%233280;var b=k/233280;
    ell(g,cx+(a*2-1)*rx,cy+(b*2-1)*ry,s*u,s*.55*u,c);}}

  var D={
  // 23 Пастила — длинная низкая коробка, розово-белая, в окошке — бруски пастилы
  23:function(g,cx,by,u){shadowE(g,cx,by,40*u,u);box3(g,cx,by,78*u,32*u,30*u,'#f4b8c8',function(x,y,w,h){
      g.fillStyle='#fffaf5';rrect(g,x+w*.08,y+h*.2,w*.84,h*.6,h*.12);g.fill();
      for(var k=0;k<4;k++){rrect(g,x+w*(.13+k*.2),y+h*.3,w*.16,h*.4,h*.06);g.fillStyle=lin(g,0,y+h*.3,0,y+h*.7,['#fde4ea','#f2a7bb']);g.fill();}
      g.fillStyle='#c2185b';g.fillRect(x,y,w,h*.1);g.fillRect(x,y+h*.9,w,h*.1);},'#fbd3de');},
  // 24 Печатный пряник — толстая плитка мёдового цвета, на верху — рамка-узор
  24:function(g,cx,by,u){shadowE(g,cx,by,42*u,u);var b=box3(g,cx,by,72*u,16*u,46*u,'#a8581d',function(x,y,w,h){g.fillStyle='rgba(255,220,160,.25)';g.fillRect(x,y,w,h*.3);},'#c97a33');
      var dx=46*u*.62,dy=46*u*.44,x=b.x,y=b.y;
      g.save();g.beginPath();g.moveTo(x+6*u,y-3*u);g.lineTo(x+dx-2*u,y-dy+3*u);g.lineTo(x+b.w+dx-8*u,y-dy+3*u);g.lineTo(x+b.w-4*u,y-3*u);g.closePath();
      st(g,'#f3c98a',2.4*u);g.restore();
      ell(g,x+b.w/2+dx/2,y-dy/2,14*u,6*u,'#8a4512');ell(g,x+b.w/2+dx/2,y-dy/2,8*u,3.2*u,'#f3c98a');
      for(var k=0;k<3;k++){ell(g,x+14*u+k*7*u+dx*.12,y-6*u-k*2*u,2*u,1.2*u,'#f3c98a');ell(g,x+b.w-12*u-k*7*u+dx*.85,y-dy+6*u+k*2*u,2*u,1.2*u,'#f3c98a');}},
  // 25 Квас — пузатая бутылка тёмного стекла с квасом, жёлтая этикетка с колоском
  25:function(g,cx,by,u){shadowE(g,cx,by,26*u,u);bottle(g,cx,by,50*u,88*u,18*u,22*u,16*u,'#4a2508',76*u);
      g.fillStyle='rgba(90,45,10,.35)';rrect(g,cx-25*u,by-62*u,50*u,62*u,10*u);g.fill();
      rrect(g,cx-19*u,by-46*u,38*u,26*u,4*u);g.fillStyle='#f5cf3a';g.fill();g.strokeStyle='#b2261c';g.lineWidth=1.6*u;g.stroke();
      line(g,[cx,by-24*u,cx,by-42*u],'#8a5a12',2*u);for(var k=0;k<3;k++){ell(g,cx-3*u,by-28*u-k*5*u,2.4*u,1.5*u,'#8a5a12');ell(g,cx+3*u,by-30*u-k*5*u,2.4*u,1.5*u,'#8a5a12');}
      rrect(g,cx-10*u,by-93*u,20*u,7*u,2*u);g.fillStyle='#e0b53a';g.fill();},
  // 26 Вобла — две сушёные рыбки висят на бечёвке головой вниз
  26:function(g,cx,by,u){shadowE(g,cx,by,30*u,u);line(g,[cx-22*u,by-92*u,cx,by-82*u,cx+22*u,by-92*u],'#8d6e4a',2*u);
      fish(g,cx-12*u,by-46*u,78*u,26*u,P/2+.12,'#9aa0a0','#e3d8b8',u);fish(g,cx+13*u,by-44*u,74*u,24*u,P/2-.1,'#a9a493','#efe2c0',u);
      g.fillStyle='rgba(255,255,255,.5)';for(var k=0;k<5;k++){ell(g,cx-12*u+(k%2)*3*u,by-62*u+k*8*u,1.4*u,1.4*u);g.fill();}},
  // 27 Буженина — запечённый кусок в коричневой корочке, перевязан бечёвкой, спереди розовый срез с белой каймой, на доске
  27:function(g,cx,by,u){shadowE(g,cx,by,42*u,u);
      rrect(g,cx-46*u,by-10*u,92*u,10*u,3*u);g.fillStyle=lin(g,0,by-10*u,0,by,['#d9a866','#a8743a']);g.fill();
      var y0=by-10*u;g.beginPath();g.moveTo(cx-40*u,y0);g.quadraticCurveTo(cx-44*u,y0-44*u,cx-2*u,y0-48*u);g.quadraticCurveTo(cx+40*u,y0-46*u,cx+38*u,y0);g.closePath();
      g.fillStyle=lin(g,cx-40*u,y0-48*u,cx+40*u,y0,['#c47a3a','#8a4a1c','#5e2e10']);g.fill();st(g,'rgba(50,25,8,.6)',1.5*u);
      g.save();g.clip();g.strokeStyle='rgba(240,225,190,.9)';g.lineWidth=2*u;for(var k=-1;k<=1;k++){g.beginPath();g.moveTo(cx+k*22*u-6*u,y0-50*u);g.quadraticCurveTo(cx+k*22*u+4*u,y0-24*u,cx+k*22*u-2*u,y0+2*u);g.stroke();}g.restore();
      ell(g,cx-14*u,y0-34*u,12*u,5*u,'rgba(255,220,160,.35)');
      ell(g,cx+30*u,y0-18*u,16*u,18*u,'#f6efe4');ell(g,cx+30*u,y0-18*u,12.5*u,14.5*u,lin(g,cx+18*u,0,cx+42*u,0,['#e9a0a0','#f4c2bc','#d98680']));
      g.beginPath();g.ellipse(cx+30*u,y0-18*u,16*u,18*u,0,0,P*2);st(g,'rgba(110,50,30,.6)',1.4*u);
      line(g,[cx+24*u,y0-26*u,cx+34*u,y0-12*u],'rgba(255,240,235,.8)',1.2*u);},
  // 28 Вареники — тарелка с полумесяцами и сметаной
  28:function(g,cx,by,u){shadowE(g,cx,by,44*u,u);g.beginPath();g.moveTo(cx-44*u,by-24*u);g.quadraticCurveTo(cx-40*u,by-2*u,cx-14*u,by-2*u);g.lineTo(cx+14*u,by-2*u);g.quadraticCurveTo(cx+40*u,by-2*u,cx+44*u,by-24*u);g.closePath();g.fillStyle=lin(g,cx-44*u,0,cx+44*u,0,['#d8dde2','#ffffff','#c9d0d6']);g.fill();line(g,[cx-36*u,by-12*u,cx+36*u,by-12*u],'#3a78c2',2.4*u);
      var V=[[-24,-26],[0,-28],[24,-26],[-12,-38],[12,-38],[0,-48]];
      for(var k=0;k<V.length;k++){var x=cx+V[k][0]*u,y=by+V[k][1]*u;g.beginPath();g.moveTo(x-16*u,y);g.quadraticCurveTo(x,y-22*u,x+16*u,y);g.quadraticCurveTo(x,y+5*u,x-16*u,y);
        g.fillStyle=lin(g,0,y-12*u,0,y+2*u,['#fffdf4','#eadcbc']);g.fill();st(g,'rgba(140,110,60,.55)',1.2*u);
        for(var j=-2;j<=2;j++)ell(g,x+j*5*u,y-7*u+Math.abs(j)*1.6*u,1.4*u,1*u,'rgba(170,140,90,.6)');}
      ell(g,cx+4*u,by-58*u,9*u,5*u,'#fffefa');ell(g,cx+2*u,by-60*u,3*u,1.6*u,'#fff');},
  // 29 Ряженка — бутылка с карамельной ряженкой, крышка из золотистой фольги
  29:function(g,cx,by,u){shadowE(g,cx,by,24*u,u);bottle(g,cx,by,44*u,74*u,30*u,10*u,12*u,'#e3a96c',64*u);
      rrect(g,cx-17*u,by-81*u,34*u,10*u,4*u);g.fillStyle=lin(g,cx-17*u,0,cx+17*u,0,['#9c5a14','#f6d77a','#9c5a14']);g.fill();
      g.strokeStyle='rgba(110,60,10,.5)';g.lineWidth=1.1*u;for(var k=-2;k<=2;k++){g.beginPath();g.moveTo(cx+k*6*u,by-80*u);g.lineTo(cx+k*6*u-2*u,by-72*u);g.stroke();}
      rrect(g,cx-14*u,by-40*u,28*u,16*u,3*u);g.fillStyle='#b5651d';g.fill();g.fillStyle='#fff3dc';g.fillRect(cx-10*u,by-34*u,20*u,3*u);},
  // 30 Капуста — два крупных кочана (на 2 места): бледно-зелёные, с жилками и отогнутыми листьями
  30:function(g,cx,by,u){shadowE(g,cx,by,44*u,u);
      function head(x,y,r){ell(g,x,y,r,r*.92,lin(g,x-r,y-r,x+r,y+r,['#d9f0b0','#a8d47a','#6fa448']));
        g.beginPath();g.ellipse(x,y,r,r*.92,0,0,P*2);st(g,'rgba(50,90,30,.6)',1.4*u);
        ell(g,x,y-r*.1,r*.6,r*.55,'rgba(235,250,205,.75)');g.strokeStyle='rgba(245,255,230,.6)';g.lineWidth=.9*u;for(var k=-1;k<=1;k++){g.beginPath();g.moveTo(x+k*2*u,y+r*.8);g.quadraticCurveTo(x+k*r*.3,y+r*.1,x+k*r*.45,y-r*.35);g.stroke();}
        g.beginPath();g.moveTo(x-r*1.05,y+r*.1);g.quadraticCurveTo(x-r*1.25,y-r*.6,x-r*.55,y-r*.75);g.quadraticCurveTo(x-r*.7,y-r*.1,x-r*.4,y+r*.75);g.closePath();g.fillStyle='rgba(120,175,80,.9)';g.fill();st(g,'rgba(50,90,30,.55)',1.1*u);
        g.beginPath();g.moveTo(x+r*1.05,y+r*.1);g.quadraticCurveTo(x+r*1.25,y-r*.6,x+r*.55,y-r*.75);g.quadraticCurveTo(x+r*.7,y-r*.1,x+r*.4,y+r*.75);g.closePath();g.fillStyle='rgba(110,165,70,.9)';g.fill();st(g,'rgba(50,90,30,.55)',1.1*u);
        ell(g,x-r*.3,y-r*.45,r*.28,r*.14,'rgba(255,255,255,.4)');}
      head(cx+18*u,by-34*u,26*u);head(cx-16*u,by-30*u,29*u);},
  // 31 Берёзовый сок — трёхлитровая банка, бледный сок, этикетка с берёзой
  31:function(g,cx,by,u){shadowE(g,cx,by,30*u,u);jar(g,cx,by,58*u,90*u,'rgba(236,236,178,.85)',80*u,'#c9cfd3',u);
      rrect(g,cx-22*u,by-58*u,44*u,34*u,4*u);g.fillStyle='#e8f2d4';g.fill();g.strokeStyle='#4f8a2e';g.lineWidth=1.5*u;g.stroke();
      g.fillStyle='#f8f8f2';g.fillRect(cx-5*u,by-56*u,8*u,30*u);g.fillStyle='#222';g.fillRect(cx-5*u,by-50*u,4*u,1.8*u);g.fillRect(cx-1*u,by-42*u,4*u,1.8*u);g.fillRect(cx-5*u,by-34*u,3*u,1.8*u);
      ell(g,cx+10*u,by-50*u,8*u,6*u,'#7cc04a');ell(g,cx-12*u,by-46*u,7*u,5*u,'#8fd05a');},
  // 32 Творог — пачка в пергаменте с синей клеткой, загнутые уголки
  32:function(g,cx,by,u){shadowE(g,cx,by,34*u,u);box3(g,cx,by,56*u,34*u,26*u,'#f4f7fb',function(x,y,w,h){g.strokeStyle='rgba(47,95,175,.75)';g.lineWidth=2*u;
      for(var k=-3;k<=6;k++){g.beginPath();g.moveTo(x+k*12*u,y);g.lineTo(x+k*12*u+h,y+h);g.stroke();}
      rrect(g,x+w*.2,y+h*.3,w*.6,h*.4,3*u);g.fillStyle='#2f5faf';g.fill();g.fillStyle='#fff';g.fillRect(x+w*.28,y+h*.46,w*.44,h*.08);},'#e6edf6');
      poly(g,[cx-24*u,by-38*u,cx-10*u,by-46*u,cx-6*u,by-38*u],'#ffffff');poly(g,[cx+10*u,by-38*u,cx+24*u,by-48*u,cx+26*u,by-38*u],'#ffffff');},
  // 33 Копчёная салака — золотые рыбки рядком в деревянном ящичке
  33:function(g,cx,by,u){shadowE(g,cx,by,44*u,u);
      for(var k=0;k<5;k++)fish(g,cx-26*u+k*13*u,by-26*u,46*u,16*u,-P/2+.35,'#b8661a','#f2b24a',u);
      box3(g,cx,by,84*u,18*u,22*u,'#d9b07a',function(x,y,w,h){g.strokeStyle='rgba(120,80,30,.45)';g.lineWidth=1.2*u;for(var k=1;k<3;k++){g.beginPath();g.moveTo(x,y+h*k/3);g.lineTo(x+w,y+h*k/3);g.stroke();}},'#e8c899');},
  // 34 Сыр с тмином — круг в оранжевой корке, вырезан клин, в срезе — тмин
  34:function(g,cx,by,u){shadowE(g,cx,by,42*u,u);var h=30*u,rx=40*u,ry=13*u,cy=by-6*u;
      g.beginPath();g.moveTo(cx-rx,cy-h);g.lineTo(cx-rx,cy);g.ellipse(cx,cy,rx,ry,0,P,0,true);g.lineTo(cx+rx,cy-h);g.closePath();g.fillStyle=lin(g,cx-rx,0,cx+rx,0,['#a84f12','#f08a2c','#c4621a']);g.fill();
      ell(g,cx,cy-h,rx,ry,'#f3e3a6');
      poly(g,[cx,cy-h,cx+rx*.95,cy-h+ry*.3,cx+rx*.35,cy-h+ry*.95],'#e7cf86');
      poly(g,[cx,cy-h,cx+rx*.95,cy-h+ry*.3,cx+rx*.95,cy+ry*.3,cx,cy],'#f2dc94');poly(g,[cx,cy-h,cx+rx*.35,cy-h+ry*.95,cx+rx*.35,cy+ry*.95,cx,cy],'#e6c97a');
      seeds(g,cx+rx*.45,cy-h*.45,rx*.32,h*.32,10,'#5a3a1a',1.6,u,5);seeds(g,cx-rx*.25,cy-h,rx*.5,ry*.5,8,'#7a5528',1.4,u,9);},
  // 35 Кама — бумажный пакет с загнутым верхом, синяя печать «колос»
  35:function(g,cx,by,u){shadowE(g,cx,by,30*u,u);box3(g,cx,by,48*u,66*u,18*u,'#d9c49a',function(x,y,w,h){g.fillStyle='#2b5ba8';g.fillRect(x,y+h*.24,w,h*.06);
      ell(g,x+w/2,y+h*.56,w*.3,h*.2,'#2b5ba8');ell(g,x+w/2,y+h*.56,w*.24,h*.15,'#f1e6c8');line(g,[x+w/2,y+h*.7,x+w/2,y+h*.44],'#b07a20',w*.05);
      for(var k=0;k<3;k++){ell(g,x+w*.44,y+h*(.48+k*.06),w*.05,h*.022,'#b07a20');ell(g,x+w*.56,y+h*(.5+k*.06),w*.05,h*.022,'#b07a20');}},'#c9b283');
      poly(g,[cx-29*u,by-66*u,cx-24*u,by-74*u,cx+19*u,by-74*u,cx+14*u,by-66*u],'#e6d4ac');line(g,[cx-24*u,by-70*u,cx+18*u,by-70*u],'rgba(120,90,40,.5)',1.2*u);},
  // 36 Сырок глазированный — два сырка в шоколаде и один в серебристой обёртке
  36:function(g,cx,by,u){shadowE(g,cx,by,38*u,u);
      function bar(x,y,c1,c2){rrect(g,x-23*u,y-20*u,46*u,21*u,9*u);g.fillStyle=lin(g,0,y-20*u,0,y+1*u,[c1,c2]);g.fill();g.strokeStyle='rgba(30,15,5,.45)';g.lineWidth=1.2*u;g.stroke();
        rrect(g,x-16*u,y-17*u,26*u,4*u,2*u);g.fillStyle='rgba(255,255,255,.45)';g.fill();}
      bar(cx-22*u,by-2*u,'#6b3d1f','#3a1e0c');bar(cx+22*u,by-2*u,'#6b3d1f','#3a1e0c');
      bar(cx,by-23*u,'#e3eaf2','#9fb2c6');g.fillStyle='#d6362b';g.fillRect(cx-5*u,by-43*u,10*u,21*u);ell(g,cx,by-33*u,7*u,6*u,'#ffffff');ell(g,cx,by-33*u,3.6*u,3*u,'#d6362b');},
  // 37 Шакотис — высокий «ёжик»-ёлочка из теста с золотыми шипами
  37:function(g,cx,by,u){shadowE(g,cx,by,30*u,u);plate(g,cx,by-6*u,32*u,9*u,'#fdfdfb','#9fb7c9',u);
      g.beginPath();g.moveTo(cx-24*u,by-8*u);g.quadraticCurveTo(cx-10*u,by-60*u,cx-4*u,by-94*u);g.lineTo(cx+4*u,by-94*u);g.quadraticCurveTo(cx+10*u,by-60*u,cx+24*u,by-8*u);g.closePath();
      g.fillStyle=lin(g,cx-24*u,0,cx+24*u,0,['#b8781e','#f2c552','#c98a24']);g.fill();
      for(var r=0;r<7;r++){var y=by-16*u-r*11*u,w=22*u-r*2.6*u;for(var s=-1;s<=1;s+=2){poly(g,[cx+s*w*.7,y-4*u,cx+s*(w+9*u),y-9*u+r*.3*u,cx+s*w*.75,y+3*u],'#e8b13c');
        poly(g,[cx+s*w*.7,y-4*u,cx+s*(w+9*u),y-9*u+r*.3*u,cx+s*w*.75,y+3*u]);st(g,'rgba(120,70,10,.45)',1*u);}
        ell(g,cx+(r%2?5:-5)*u,y-2*u,3*u,2*u,'#fff2b8');}},
  // 38 Сметана — широкая низкая банка, белая, серебряная крышка-фольга, ложка сметаны сверху
  38:function(g,cx,by,u){shadowE(g,cx,by,32*u,u);bottle(g,cx,by,60*u,50*u,52*u,4*u,4*u,'#fbfaf3',46*u);
      ell(g,cx,by-52*u,27*u,7*u,lin(g,cx-27*u,0,cx+27*u,0,['#9aa4ad','#eef2f5','#9aa4ad']));g.beginPath();g.ellipse(cx,by-52*u,27*u,7*u,0,0,P*2);st(g,'rgba(70,80,90,.5)',1.2*u);
      g.fillStyle='#3a78c2';rrect(g,cx-26*u,by-30*u,52*u,10*u,2*u);g.fill();g.fillStyle='#fff';g.fillRect(cx-16*u,by-26*u,32*u,2.4*u);
      ell(g,cx-6*u,by-57*u,10*u,5*u,'#fffef8');ell(g,cx-8*u,by-59*u,3*u,1.6*u,'#ffffff');},
  // 39 Минеральная вода — высокая бутылка зелёного стекла, этикетка с горами
  39:function(g,cx,by,u){shadowE(g,cx,by,20*u,u);bottle(g,cx,by,32*u,98*u,12*u,26*u,22*u,'rgba(40,140,70,.9)',90*u);
      g.fillStyle='rgba(20,110,50,.45)';rrect(g,cx-16*u,by-70*u,32*u,70*u,8*u);g.fill();
      rrect(g,cx-15*u,by-50*u,30*u,24*u,3*u);g.fillStyle='#eaf4fb';g.fill();poly(g,[cx-13*u,by-30*u,cx-4*u,by-44*u,cx+2*u,by-36*u,cx+7*u,by-42*u,cx+13*u,by-30*u],'#3a78c2');
      poly(g,[cx-6*u,by-41*u,cx-4*u,by-44*u,cx-2*u,by-41*u],'#fff');
      rrect(g,cx-7*u,by-104*u,14*u,7*u,2*u);g.fillStyle=lin(g,cx-7*u,0,cx+7*u,0,['#8b949a','#e6e9eb','#8b949a']);g.fill();},
  // 40 Сулугуни — два белых плоских круга сыра, глянец, синий ценник
  40:function(g,cx,by,u){shadowE(g,cx,by,40*u,u);
      function disc(x,y,rx,ry,h){g.beginPath();g.moveTo(x-rx,y-h);g.lineTo(x-rx,y);g.ellipse(x,y,rx,ry,0,P,0,true);g.lineTo(x+rx,y-h);g.closePath();g.fillStyle=lin(g,x-rx,0,x+rx,0,['#d8d2bf','#fffdf3','#e3dcc6']);g.fill();
        ell(g,x,y-h,rx,ry,lin(g,x-rx,y-h-ry,x+rx,y-h+ry,['#fffef8','#f6f0dc']));g.beginPath();g.ellipse(x,y-h,rx,ry,0,0,P*2);st(g,'rgba(140,125,90,.5)',1.2*u);
        ell(g,x-rx*.35,y-h-ry*.25,rx*.25,ry*.25,'rgba(255,255,255,.95)');}
      disc(cx-4*u,by-4*u,40*u,14*u,22*u);disc(cx+5*u,by-28*u,31*u,11*u,20*u);
      for(var k=0;k<3;k++){g.beginPath();g.ellipse(cx+5*u,by-48*u,22*u-k*6*u,7*u-k*2*u,0,0,P*2);st(g,'rgba(190,175,140,.35)',1*u);}
      rrect(g,cx-32*u,by-24*u,16*u,11*u,2*u);g.fillStyle='#2f6db3';g.fill();},
  // 41 Чурчхела — три «колбаски» с орехами висят на палочке: бордовая, янтарная, бордовая
  41:function(g,cx,by,u){shadowE(g,cx,by,30*u,u);line(g,[cx-30*u,by-90*u,cx+30*u,by-90*u],'#8a5a2b',4*u);
      var C=[['#7a1830','#b0304a'],['#c9822a','#f0b65a'],['#5e1530','#94284c']];
      for(var k=0;k<3;k++){var x=cx+(k-1)*20*u,len=(k===1?76:68)*u;line(g,[x,by-90*u,x,by-84*u],'#8a5a2b',1.5*u);
        for(var j=0;j<7;j++){var y=by-84*u+j*len/7+5*u,r=(j%2?7.2:8)*u;ell(g,x+(j%2?1:-1)*u,y,r,len/12,lin(g,x-r,0,x+r,0,[C[k][0],C[k][1],C[k][0]]));}
        g.beginPath();g.ellipse(x,by-84*u+len/2+3*u,8*u,len/2+2*u,0,0,P*2);st(g,'rgba(40,10,10,.35)',1*u);ell(g,x-3*u,by-74*u,1.6*u,6*u,'rgba(255,255,255,.4)');}},
  // 42 Хачапури — лодочка с сыром и желтком
  42:function(g,cx,by,u){shadowE(g,cx,by,44*u,u);
      g.beginPath();g.moveTo(cx-46*u,by-22*u);g.quadraticCurveTo(cx-20*u,by+2*u,cx,by-2*u);g.quadraticCurveTo(cx+20*u,by+2*u,cx+46*u,by-22*u);g.quadraticCurveTo(cx+20*u,by-40*u,cx,by-38*u);g.quadraticCurveTo(cx-20*u,by-40*u,cx-46*u,by-22*u);g.closePath();
      g.fillStyle=lin(g,0,by-40*u,0,by,['#e7a24a','#b8651e']);g.fill();st(g,'rgba(110,55,10,.5)',1.4*u);
      ell(g,cx,by-22*u,30*u,9*u,'#f8e27a');seeds(g,cx,by-22*u,22*u,5*u,8,'#f0c440',3,u,4);
      ell(g,cx+2*u,by-24*u,9*u,7*u,'#fff8e8');ell(g,cx+2*u,by-25*u,5.5*u,4.5*u,'#f39c12');ell(g,cx,by-27*u,1.8*u,1.2*u,'#fff4c0');
      ell(g,cx-30*u,by-28*u,6*u,2*u,'rgba(255,240,200,.5)');},
  // 43 Лаваш — стопка сложенных тонких листов, светлый с подпалинами
  43:function(g,cx,by,u){shadowE(g,cx,by,42*u,u);
      for(var k=0;k<4;k++){var y=by-6*u-k*9*u,x=cx+(k%2?3:-3)*u;
        g.beginPath();g.moveTo(x-40*u,y);g.quadraticCurveTo(x-44*u,y-5*u,x-38*u,y-10*u);g.lineTo(x+38*u,y-10*u);g.quadraticCurveTo(x+44*u,y-5*u,x+40*u,y);g.closePath();
        g.fillStyle=lin(g,0,y-10*u,0,y,['#fbeccb','#e8cf9c']);g.fill();st(g,'rgba(140,100,50,.45)',1.1*u);}
      seeds(g,cx,by-38*u,30*u,2.5*u,9,'rgba(170,110,40,.7)',2.2,u,2);seeds(g,cx,by-20*u,32*u,2*u,6,'rgba(170,110,40,.6)',2,u,8);},
  // 44 Курага — горка оранжевой кураги на белом блюдце (на развес)
  44:function(g,cx,by,u){shadowE(g,cx,by,42*u,u);plate(g,cx,by-8*u,44*u,12*u,'#ffffff','#d0a24a',u);
      var A=[[-26,-14],[-10,-12],[8,-13],[24,-12],[-18,-24],[0,-25],[17,-23],[-8,-35],[9,-35],[0,-44]];
      for(var i=0;i<A.length;i++){var x=cx+A[i][0]*u,y=by+A[i][1]*u;ell(g,x,y,10*u,7.5*u,lin(g,x-10*u,y-8*u,x+10*u,y+8*u,['#ffb84a','#f08a12','#c45e05']));
        g.beginPath();g.moveTo(x-4*u,y-2*u);g.quadraticCurveTo(x,y+3*u,x+5*u,y-1*u);st(g,'rgba(140,60,0,.55)',1.1*u);}},
  // 45 Бастурма — тёмно-красный пласт в перечной корке, отрезаны ломтики
  45:function(g,cx,by,u){shadowE(g,cx,by,42*u,u);poly(g,[cx-44*u,by-2*u,cx+42*u,by-2*u,cx+46*u,by-10*u,cx-38*u,by-12*u],'#efe2c4');
      box3(g,cx-8*u,by-4*u,56*u,16*u,26*u,'#8e2a1c',function(x,y,w,h){seeds(g,x+w/2,y+h/2,w*.45,h*.35,12,'#5a1408',1.6,u,6);},'#a63a22');
      seeds(g,cx-4*u,by-29*u,22*u,4*u,14,'#6a1c0e',1.7,u,2);
      for(var k=0;k<3;k++){var x=cx+26*u+k*7*u,y=by-6*u;g.save();g.translate(x,y);g.rotate(-.35);rrect(g,-4*u,-20*u,7*u,20*u,2*u);g.fillStyle=lin(g,-4*u,0,3*u,0,['#c0392b','#e0675a']);g.fill();
        g.strokeStyle='#7a1e10';g.lineWidth=1.4*u;g.stroke();g.restore();}},
  // 46 Пахлава — ромбики на подносе, слои и орех сверху
  46:function(g,cx,by,u){shadowE(g,cx,by,44*u,u);plate(g,cx,by-6*u,46*u,12*u,'#d9dde0','#9aa3a8',u);
      var R=[[-22,-10],[0,-12],[22,-10],[-11,-24],[11,-24]];
      for(var i=0;i<R.length;i++){var x=cx+R[i][0]*u,y=by+R[i][1]*u;
        poly(g,[x-12*u,y,x,y+5*u,x+12*u,y,x+12*u,y-8*u,x,y-3*u,x-12*u,y-8*u],'#a8601a');
        poly(g,[x-12*u,y-8*u,x,y-14*u,x+12*u,y-8*u,x,y-3*u],lin(g,0,y-14*u,0,y-3*u,['#f6c45a','#d98a22']));
        line(g,[x-12*u,y-4*u,x,y+1*u,x+12*u,y-4*u],'#f2c35a',1.2*u);ell(g,x,y-9*u,3.2*u,2.2*u,'#6b8f2a');}},
  // 47 Гранатовый сок — стройная бутылка с тёмно-вишнёвым соком, на этикетке — гранат с «короной»
  47:function(g,cx,by,u){shadowE(g,cx,by,22*u,u);bottle(g,cx,by,36*u,96*u,13*u,24*u,18*u,'#6e0f24',82*u);
      rrect(g,cx-16*u,by-50*u,32*u,30*u,4*u);g.fillStyle='#fff6e6';g.fill();g.strokeStyle='#d4a017';g.lineWidth=1.5*u;g.stroke();
      ell(g,cx,by-34*u,10*u,9*u,'#c0172f');poly(g,[cx-4*u,by-42*u,cx-2*u,by-47*u,cx,by-43*u,cx+2*u,by-47*u,cx+4*u,by-42*u],'#c0172f');ell(g,cx-3*u,by-37*u,2.5*u,2*u,'rgba(255,255,255,.6)');
      rrect(g,cx-8*u,by-102*u,16*u,7*u,2*u);g.fillStyle='#d4a017';g.fill();},
  // 48 Фундук — холщовый мешочек, из него — орехи в «шапочках»
  48:function(g,cx,by,u){shadowE(g,cx,by,40*u,u);
      g.beginPath();g.moveTo(cx-34*u,by-36*u);g.quadraticCurveTo(cx-42*u,by-14*u,cx-30*u,by-2*u);g.lineTo(cx+12*u,by-2*u);g.quadraticCurveTo(cx+20*u,by-16*u,cx+10*u,by-36*u);g.closePath();
      g.fillStyle=lin(g,cx-40*u,0,cx+18*u,0,['#c9b48a','#efe2c2','#bfa77a']);g.fill();st(g,'rgba(90,70,30,.5)',1.3*u);line(g,[cx-30*u,by-30*u,cx+8*u,by-30*u],'#8a5a2b',2*u);
      var N=[[-24,-40],[-10,-42],[4,-39],[-17,-50],[-3,-51],[22,-8],[34,-10],[28,-18],[-34,-6]];
      for(var i=0;i<N.length;i++){var x=cx+N[i][0]*u,y=by+N[i][1]*u;ell(g,x,y,7*u,7.5*u,lin(g,x-7*u,y-7*u,x+7*u,y+7*u,['#c98a4a','#8a4f1e','#5e3210']));
        ell(g,x,y-5*u,6*u,3*u,'#e8cf9a');ell(g,x-2.5*u,y,1.8*u,2.5*u,'rgba(255,255,255,.35)');}},
  // 49 Набор для плова — прозрачный пакет: рис, морковь соломкой, головка чеснока, перевязан
  49:function(g,cx,by,u){shadowE(g,cx,by,36*u,u);
      g.beginPath();g.moveTo(cx-10*u,by-72*u);g.lineTo(cx-34*u,by-44*u);g.quadraticCurveTo(cx-40*u,by-4*u,cx-30*u,by-2*u);g.lineTo(cx+30*u,by-2*u);g.quadraticCurveTo(cx+40*u,by-4*u,cx+34*u,by-44*u);g.lineTo(cx+10*u,by-72*u);g.closePath();
      g.fillStyle='rgba(225,240,248,.55)';g.fill();
      g.save();g.clip();g.fillStyle='#f7f2e2';g.fillRect(cx-42*u,by-26*u,84*u,26*u);seeds(g,cx,by-13*u,32*u,11*u,30,'#ffffff',2.2,u,1);seeds(g,cx,by-13*u,32*u,11*u,16,'#e4dcc0',1.6,u,4);
      for(var k=0;k<8;k++){g.save();g.translate(cx-26*u+k*7*u,by-36*u+(k%3)*2*u);g.rotate(-.5+(k%4)*.3);g.fillStyle=k%2?'#f07d12':'#e86a0a';g.fillRect(-1.6*u,-9*u,3.2*u,18*u);g.restore();}
      ell(g,cx+12*u,by-52*u,9*u,8*u,'#f6efe2');line(g,[cx+12*u,by-60*u,cx+12*u,by-46*u],'rgba(170,150,120,.7)',1*u);g.restore();
      g.beginPath();g.moveTo(cx-10*u,by-72*u);g.lineTo(cx-34*u,by-44*u);g.quadraticCurveTo(cx-40*u,by-4*u,cx-30*u,by-2*u);g.lineTo(cx+30*u,by-2*u);g.quadraticCurveTo(cx+40*u,by-4*u,cx+34*u,by-44*u);g.lineTo(cx+10*u,by-72*u);g.closePath();
      st(g,'rgba(90,120,140,.6)',1.4*u);rrect(g,cx-14*u,by-78*u,28*u,8*u,3*u);g.fillStyle='#d6402f';g.fill();
      g.fillStyle='rgba(255,255,255,.6)';g.fillRect(cx-28*u,by-46*u,4*u,30*u);},
  // 50 Лепёшка — круглая, румяный толстый край, в серёдке — узор-штамп и кунжут
  50:function(g,cx,by,u){shadowE(g,cx,by,44*u,u);ell(g,cx,by-10*u,44*u,15*u,'#8a4a14');ell(g,cx,by-16*u,44*u,15*u,'#d08a3a');var cy=by-30*u;
      ell(g,cx,cy+8*u,45*u,16*u,'#9a5418');ell(g,cx,cy,44*u,15*u,lin(g,cx-44*u,cy-15*u,cx+44*u,cy+15*u,['#f0b25a','#c87628','#a85d1c']));
      ell(g,cx,cy,28*u,9*u,'#e8b46a');ell(g,cx,cy,22*u,7*u,'#f1c98a');
      for(var k=0;k<12;k++){var a=k/12*P*2;ell(g,cx+Math.cos(a)*15*u,cy+Math.sin(a)*4.8*u,1.4*u,1*u,'#9a5418');}
      for(var k2=0;k2<6;k2++){var a2=k2/6*P*2;ell(g,cx+Math.cos(a2)*7*u,cy+Math.sin(a2)*2.2*u,1.2*u,.9*u,'#9a5418');}
      seeds(g,cx,cy-8*u,34*u,3.5*u,12,'#fff6dc',1.6,u,11);ell(g,cx-22*u,cy-8*u,10*u,2.4*u,'rgba(255,240,200,.45)');},
  // 51 Изюм — тёмный изюм в кульке из серой обёрточной бумаги (на развес)
  51:function(g,cx,by,u){shadowE(g,cx,by,20*u,u);cone(g,cx,by,56*u,74*u,'#b9b3a6',function(x,y,r){
      for(var i=0;i<16;i++){var a=i*2.39,rr=(i%5)*r*.18;ell(g,x+Math.cos(a)*rr*1.6-r*.05,y-6*u-Math.abs(Math.sin(a))*rr*.6-(i>10?6*u:0),4.6*u,3.4*u,i%3?'#4a1e28':'#6b2d3a');
        ell(g,x+Math.cos(a)*rr*1.6-r*.05-1.2*u,y-7.2*u-Math.abs(Math.sin(a))*rr*.6-(i>10?6*u:0),1.2*u,.8*u,'rgba(255,220,220,.35)');}},u);},
  // 52 Яблоки «Апорт» — три крупных красно-зелёных яблока с листиком
  52:function(g,cx,by,u){shadowE(g,cx,by,42*u,u);
      function apple(x,y,r){g.beginPath();g.moveTo(x,y-r*.75);g.bezierCurveTo(x+r*1.2,y-r*1.3,x+r*1.3,y+r*.6,x,y+r*.9);g.bezierCurveTo(x-r*1.3,y+r*.6,x-r*1.2,y-r*1.3,x,y-r*.75);g.closePath();
        g.fillStyle=lin(g,x-r,y-r,x+r,y+r,['#f26b4f','#c8201c','#8e1414']);g.fill();
        g.save();g.clip();ell(g,x+r*.55,y+r*.25,r*.45,r*.55,'rgba(170,200,60,.55)');g.restore();st(g,'rgba(90,10,10,.45)',1.2*u);
        ell(g,x-r*.4,y-r*.25,r*.18,r*.28,'rgba(255,255,255,.6)');line(g,[x,y-r*.7,x+2*u,y-r*1.05],'#5d3a1a',2*u);}
      apple(cx-20*u,by-17*u,19*u);apple(cx+20*u,by-17*u,19*u);apple(cx,by-45*u,19*u);
      g.beginPath();g.ellipse(cx+9*u,by-67*u,8*u,3.5*u,-.5,0,P*2);g.fillStyle='#4f9a2e';g.fill();},
  // 53 Баурсаки — горка пышных золотых кубиков на деревянном блюде
  53:function(g,cx,by,u){shadowE(g,cx,by,42*u,u);plate(g,cx,by-7*u,44*u,11*u,'#b07a43',null,u);
      var B=[[-24,-14],[-6,-15],[13,-14],[28,-12],[-15,-27],[4,-28],[21,-25],[-5,-40],[12,-39]];
      for(var i=0;i<B.length;i++){var x=cx+B[i][0]*u,y=by+B[i][1]*u;rrect(g,x-10*u,y-9*u,20*u,17*u,7*u);g.fillStyle=lin(g,x-10*u,y-9*u,x+10*u,y+8*u,['#f8d488','#e0a040','#b8701e']);g.fill();
        st(g,'rgba(120,70,15,.45)',1.1*u);ell(g,x-3*u,y-4*u,3.5*u,2*u,'rgba(255,250,220,.6)');}},
  // 54 Мёд — банка янтарного мёда, крышка — тряпица в красную клетку с бечёвкой, на этикетке соты
  54:function(g,cx,by,u){shadowE(g,cx,by,30*u,u);bottle(g,cx,by,54*u,64*u,46*u,5*u,5*u,'#e8961a',58*u);
      g.fillStyle='rgba(255,200,80,.35)';g.fillRect(cx-20*u,by-50*u,6*u,40*u);
      poly(g,[cx-29*u,by-60*u,cx-24*u,by-72*u,cx+24*u,by-72*u,cx+29*u,by-60*u,cx+20*u,by-55*u,cx-20*u,by-55*u],'#f4f4f0');
      g.save();poly(g,[cx-29*u,by-60*u,cx-24*u,by-72*u,cx+24*u,by-72*u,cx+29*u,by-60*u,cx+20*u,by-55*u,cx-20*u,by-55*u]);g.clip();g.fillStyle='rgba(200,40,40,.8)';
      for(var k=-4;k<=4;k++){g.fillRect(cx+k*7*u-1.6*u,by-74*u,3.2*u,22*u);}for(var j=0;j<3;j++)g.fillRect(cx-30*u,by-70*u+j*6*u,60*u,2.6*u);g.restore();
      line(g,[cx-24*u,by-59*u,cx+24*u,by-59*u],'#8a5a2b',2*u);
      rrect(g,cx-15*u,by-40*u,30*u,22*u,3*u);g.fillStyle='#fff3c8';g.fill();
      for(var h=0;h<3;h++){var hx=cx-8*u+h*8*u,hy=by-29*u+(h%2?-3*u:2*u);poly(g,[hx-4*u,hy,hx-2*u,hy-3.4*u,hx+2*u,hy-3.4*u,hx+4*u,hy,hx+2*u,hy+3.4*u,hx-2*u,hy+3.4*u],'#e8961a');}},
  // 55 Курт — белые шарики в синей пиале с узором
  55:function(g,cx,by,u){shadowE(g,cx,by,36*u,u);
      var K=[[-20,-30],[-7,-32],[7,-32],[20,-30],[-13,-40],[0,-42],[13,-40],[-6,-50],[7,-50]];
      for(var i=0;i<K.length;i++){var x=cx+K[i][0]*u,y=by+K[i][1]*u;ell(g,x,y,8*u,7.5*u,lin(g,x-8*u,y-8*u,x+8*u,y+8*u,['#ffffff','#efe9d8','#cfc6ad']));ell(g,x-2.5*u,y-2.5*u,2*u,1.5*u,'#ffffff');}
      g.beginPath();g.moveTo(cx-36*u,by-30*u);g.quadraticCurveTo(cx-32*u,by-2*u,cx-12*u,by-2*u);g.lineTo(cx+12*u,by-2*u);g.quadraticCurveTo(cx+32*u,by-2*u,cx+36*u,by-30*u);g.closePath();
      g.fillStyle=lin(g,cx-36*u,0,cx+36*u,0,['#1f4f9a','#3f7fd0','#1a428a']);g.fill();
      ell(g,cx,by-30*u,36*u,6*u,'rgba(255,255,255,.0)');line(g,[cx-35*u,by-30*u,cx+35*u,by-30*u],'#e8eef8',2.2*u);
      for(var k=-2;k<=2;k++){ell(g,cx+k*13*u,by-16*u,4*u,4*u,'#ffffff');ell(g,cx+k*13*u,by-16*u,2*u,2*u,'#d4a017');}},
  // 56 Самса — три румяных треугольника с кунжутом
  56:function(g,cx,by,u){shadowE(g,cx,by,42*u,u);
      function sam(x,y,s,f){poly(g,[x-s,y,x+s,y,x,y-s*1.25],lin(g,0,y-s*1.25,0,y,['#f2c060','#c97a28']));poly(g,[x-s,y,x+s,y,x,y-s*1.25]);st(g,'rgba(110,55,10,.55)',1.3*u);
        poly(g,[x+s,y,x+s+s*.3*f,y-s*.25,x+s*.15*f,y-s*1.3,x,y-s*1.25],'#b8691e');seeds(g,x,y-s*.45,s*.4,s*.25,6,'#fff4d6',1.5,u,x|0);}
      sam(cx-20*u,by-2*u,20*u,1);sam(cx+20*u,by-2*u,20*u,1);sam(cx,by-26*u,19*u,1);},
  // 57 Нават — гроздь янтарных кристаллов сахара на ниточках
  57:function(g,cx,by,u){shadowE(g,cx,by,30*u,u);plate(g,cx,by-6*u,32*u,9*u,'#ffffff','#2f6db3',u);
      var C=[[-14,-14,13],[4,-18,15],[18,-12,11],[-6,-34,13],[10,-38,12],[0,-56,11]];
      for(var i=0;i<C.length;i++){var x=cx+C[i][0]*u,y=by+C[i][1]*u,r=C[i][2]*u;
        poly(g,[x,y-r,x+r*.85,y-r*.35,x+r*.7,y+r*.6,x,y+r*.9,x-r*.7,y+r*.6,x-r*.85,y-r*.35],lin(g,x-r,y-r,x+r,y+r,['#ffe7a0','#f0a830','#c87a10']));
        poly(g,[x,y-r,x+r*.85,y-r*.35,x,y+r*.05,x-r*.85,y-r*.35],'rgba(255,248,210,.55)');poly(g,[x,y-r,x+r*.85,y-r*.35,x+r*.7,y+r*.6,x,y+r*.9,x-r*.7,y+r*.6,x-r*.85,y-r*.35]);st(g,'rgba(130,70,0,.5)',1*u);}
      line(g,[cx,by-66*u,cx,by-82*u],'#8a5a2b',1.5*u);},
  // 58 Дыня — жёлтая продолговатая с сеточкой и хвостиком
  58:function(g,cx,by,u){shadowE(g,cx,by,44*u,u);var cy=by-24*u;
      ell(g,cx,cy,44*u,23*u,lin(g,cx-44*u,cy-23*u,cx+44*u,cy+23*u,['#fbe27a','#f0c234','#c99412']));
      g.save();ell(g,cx,cy,44*u,23*u);g.clip();g.strokeStyle='rgba(160,120,30,.55)';g.lineWidth=1.1*u;
      for(var k=-6;k<=6;k++){g.beginPath();g.moveTo(cx+k*9*u-14*u,cy-26*u);g.quadraticCurveTo(cx+k*9*u,cy,cx+k*9*u+14*u,cy+26*u);g.stroke();g.beginPath();g.moveTo(cx+k*9*u+14*u,cy-26*u);g.quadraticCurveTo(cx+k*9*u,cy,cx+k*9*u-14*u,cy+26*u);g.stroke();}
      g.restore();g.beginPath();g.ellipse(cx,cy,44*u,23*u,0,0,P*2);st(g,'rgba(120,85,10,.5)',1.4*u);
      ell(g,cx-16*u,cy-10*u,14*u,5*u,'rgba(255,255,255,.4)');line(g,[cx+42*u,cy-4*u,cx+50*u,cy-10*u],'#6b8f2a',3*u);},
  // 59 Халва — отломленный кусок песочного цвета с волокнистым изломом, на бумаге
  59:function(g,cx,by,u){shadowE(g,cx,by,40*u,u);poly(g,[cx-44*u,by-2*u,cx+40*u,by-2*u,cx+46*u,by-10*u,cx-38*u,by-12*u],'#f3efe4');
      var b=box3(g,cx-6*u,by-4*u,58*u,28*u,30*u,'#cdb084',function(x,y,w,h){g.strokeStyle='rgba(120,90,50,.35)';g.lineWidth=1*u;for(var k=0;k<6;k++){g.beginPath();g.moveTo(x,y+h*(.15+k*.14));g.quadraticCurveTo(x+w*.5,y+h*(.1+k*.15),x+w,y+h*(.18+k*.13));g.stroke();}},'#dcc39a');
      poly(g,[b.x+b.w,b.y+b.h,b.x+b.w+8*u,b.y+b.h-6*u,b.x+b.w+12*u,b.y+b.h*.55,b.x+b.w+16*u,b.y+2*u,b.x+b.w+18.6*u,b.y-13*u,b.x+b.w,b.y],'#b8956a');
      seeds(g,b.x+b.w+9*u,b.y+b.h*.45,4*u,b.h*.4,8,'#e8d4ae',1.6,u,3);
      ell(g,cx+36*u,by-10*u,8*u,5*u,'#cdb084');ell(g,cx+34*u,by-12*u,3*u,1.6*u,'#e8d6b4');},
  // 60 Виноград — гроздь тёмно-синего винограда с листом
  60:function(g,cx,by,u){shadowE(g,cx,by,28*u,u);
      g.beginPath();g.moveTo(cx-4*u,by-82*u);g.bezierCurveTo(cx-30*u,by-96*u,cx-34*u,by-70*u,cx-22*u,by-70*u);g.bezierCurveTo(cx-30*u,by-60*u,cx-6*u,by-62*u,cx-4*u,by-82*u);g.fillStyle='#5e9a2e';g.fill();
      line(g,[cx,by-74*u,cx+4*u,by-88*u],'#6b4a24',3*u);
      var R=[[-24,-64],[-8,-66],[8,-66],[24,-64],[-16,-50],[0,-52],[16,-50],[-24,-38],[-8,-38],[8,-38],[24,-37],[-14,-25],[2,-25],[16,-24],[-6,-12],[8,-12],[0,-0]];
      for(var i=0;i<R.length;i++){var x=cx+R[i][0]*u,y=by+R[i][1]*u-8*u;ell(g,x,y,8.5*u,8.5*u,lin(g,x-8*u,y-8*u,x+8*u,y+8*u,['#8b6bc0','#4b2c7a','#2a1450']));ell(g,x-3*u,y-3*u,2.2*u,1.6*u,'rgba(255,255,255,.5)');}},
  // 61 Брынза — белый крошащийся брус в эмалированной ванночке с рассолом
  61:function(g,cx,by,u){shadowE(g,cx,by,42*u,u);
      box3(g,cx,by,80*u,16*u,30*u,'#e9eef2',function(x,y,w,h){g.fillStyle='#3a78c2';g.fillRect(x,y,w,h*.18);},'#c8dbe8');
      box3(g,cx-2*u,by-10*u,58*u,24*u,22*u,'#fbfbf6',function(x,y,w,h){seeds(g,x+w/2,y+h/2,w*.42,h*.36,10,'#e2e2d6',2.2,u,7);},'#ffffff');
      seeds(g,cx+4*u,by-40*u,20*u,3.5*u,7,'#e4e4d8',2,u,13);g.fillStyle='rgba(170,210,235,.6)';g.fillRect(cx-34*u,by-18*u,8*u,6*u);
      poly(g,[cx+24*u,by-14*u,cx+31*u,by-18*u,cx+34*u,by-12*u,cx+27*u,by-9*u],'#fbfbf6');},
  // 62 Яблочный сок — литровая банка янтарного сока, красная крышка, зелёная этикетка с красным яблоком
  62:function(g,cx,by,u){shadowE(g,cx,by,28*u,u);jar(g,cx,by,50*u,70*u,'#f0b43a',62*u,'#d6402f',u);
      rrect(g,cx-21*u,by-48*u,42*u,30*u,5*u);g.fillStyle='#3f8f3a';g.fill();g.strokeStyle='#f6e7a0';g.lineWidth=1.4*u;g.stroke();
      g.beginPath();g.arc(cx-4*u,by-32*u,8*u,0,P*2);g.arc(cx+4*u,by-32*u,8*u,0,P*2);g.fillStyle='#d6402f';g.fill();ell(g,cx-6*u,by-35*u,2.4*u,1.6*u,'rgba(255,255,255,.6)');
      line(g,[cx,by-39*u,cx+2*u,by-45*u],'#6b4a24',1.6*u);ell(g,cx+7*u,by-44*u,4.5*u,2*u,'#bfe08a');}
  };
  for(var i=0;i<GBG.length;i++){var g=GBG[i];
    if(!GOODS[g.id])GOODS[g.id]={n:g.n,a:g.a};
    if(D[g.id]&&!GOOD_DRAW[g.id])GOOD_DRAW[g.id]=D[g.id];}
  window.GBGD={v:1,has:function(id){return !!D[id];},h:{st:st,line:line,fish:fish,cone:cone,plate:plate,jar:jar,seeds:seeds}};
})();
