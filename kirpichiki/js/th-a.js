/* K1 · тема А «Глянцевый двор» (id a; покупка look_glossy). Перенос макета release-f/kirp-look/a-glossy.html.
   Кирпичики-«леденцы» с фаской, бликом и искрой; поле — светлый ореховый стол с волокнами, лунками и латунными шурупами;
   двор — хрущёвки с бельём, качели, песочница, классики мелом; вечер (окна зажигаются, фонари) и ночь (звёзды, месяц).
   Сбор клетки: золотая вспышка → кирпичик раздувается и лопается → треугольные осколки своего цвета + золотые звёздочки,
   «Чисто!» — золотом с тёмной обводкой. Карта — асфальтовая дорожка через двор, вывески глав цветом по состоянию.
   Кирпичики, предметы, поле — один раз в кэш (look.js); в кадре — только fx и частицы (без filter/shadowBlur). */
(function(){
'use strict';
if(!window.LK)return;
var RR=LK.RR,mix=LK.mixHex,R0=LK.R0,clamp=LK.clamp;
function T(ru,en){return typeof L==='function'?L(ru,en):ru;}
function esc(t){return String(t).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
function pURI(id,m){return LK.svgUri(portrait(id,m||'happy'));}

var PAL=['#e8553f','#f2b631','#4fae46','#21a99f','#3a8be0','#8a5bd1','#f2782a','#e85d8f'];
function colOf(col){return col===20?'#a4998b':PAL[(col-1)%PAL.length];}

/* ---------- кирпичик-«леденец»: тень, фаска (светлый верх, тёмный низ), выпуклая середина, блик, искра ---------- */
function candy(g,x,y,s,c){var m=s*.05,w=s-2*m,r=s*.2,b=s*.12,gr;
  g.fillStyle='rgba(40,20,10,.35)';RR(g,x+m,y+m+s*.05,w,w,r);g.fill();
  gr=g.createLinearGradient(0,y+m,0,y+m+w);gr.addColorStop(0,mix(c,.45));gr.addColorStop(.5,c);gr.addColorStop(1,mix(c,-.38));g.fillStyle=gr;RR(g,x+m,y+m,w,w,r);g.fill();
  gr=g.createLinearGradient(x+m,0,x+m+w,0);gr.addColorStop(0,'rgba(255,255,255,.18)');gr.addColorStop(.5,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(0,0,0,.14)');g.fillStyle=gr;RR(g,x+m,y+m,w,w,r);g.fill();
  gr=g.createLinearGradient(0,y+m+b,0,y+m+w-b);gr.addColorStop(0,mix(c,.18));gr.addColorStop(1,mix(c,-.1));g.fillStyle=gr;RR(g,x+m+b,y+m+b*.8,w-2*b,w-2*b,r*.6);g.fill();
  gr=g.createLinearGradient(0,y+m+b*.8,0,y+s*.52);gr.addColorStop(0,'rgba(255,255,255,.78)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;RR(g,x+m+b*1.25,y+m+b*1.05,w-2.5*b,s*.26,s*.11);g.fill();
  g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(x+s*.27,y+s*.27,s*.045,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=Math.max(1,s*.025);RR(g,x+m+1,y+m+1,w-2,w-2,r);g.stroke();}
// старый кирпич завала: серый камень с трещиной и мхом
function stone(g,x,y,s){var m=s*.05,w=s-2*m,r=s*.2,b=s*.12,gr,i;
  g.fillStyle='rgba(40,20,10,.35)';RR(g,x+m,y+m+s*.05,w,w,r);g.fill();
  gr=g.createLinearGradient(0,y+m,0,y+m+w);gr.addColorStop(0,'#cfc6b8');gr.addColorStop(.5,'#a4998b');gr.addColorStop(1,'#766c60');g.fillStyle=gr;RR(g,x+m,y+m,w,w,r);g.fill();
  gr=g.createLinearGradient(0,y+m+b,0,y+m+w-b);gr.addColorStop(0,'#b7ad9f');gr.addColorStop(1,'#978c7e');g.fillStyle=gr;RR(g,x+m+b,y+m+b*.8,w-2*b,w-2*b,r*.6);g.fill();
  g.fillStyle='rgba(60,45,30,.18)';for(i=0;i<5;i++){g.beginPath();g.arc(x+s*(.25+((i*37)%50)/100),y+s*(.3+((i*53)%45)/100),s*.03,0,7);g.fill();}
  g.strokeStyle='rgba(60,45,32,.75)';g.lineWidth=Math.max(1,s*.04);g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(x+s*.3,y+s*.2);g.lineTo(x+s*.46,y+s*.45);g.lineTo(x+s*.38,y+s*.74);g.moveTo(x+s*.46,y+s*.45);g.lineTo(x+s*.76,y+s*.56);g.stroke();
  g.fillStyle='#6da54a';g.beginPath();g.ellipse(x+s*.7,y+s*.8,s*.13,s*.055,0,0,7);g.fill();g.fillStyle='#8cc463';g.beginPath();g.ellipse(x+s*.66,y+s*.78,s*.06,s*.03,0,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=Math.max(1,s*.025);RR(g,x+m+1,y+m+1,w-2,w-2,r);g.stroke();}

/* ---------- поле: ореховая рамка с волокнами и шурупами, внутри — светлый стол с волокнами ---------- */
function screw(g,a,b,r){var gr=g.createRadialGradient(a-r*.35,b-r*.4,r*.1,a,b,r);gr.addColorStop(0,'#fff2b8');gr.addColorStop(.5,'#e6c26a');gr.addColorStop(1,'#a87a26');
  g.fillStyle='rgba(50,25,5,.35)';g.beginPath();g.arc(a,b+r*.25,r,0,7);g.fill();g.fillStyle=gr;g.beginPath();g.arc(a,b,r,0,7);g.fill();
  g.strokeStyle='#7a5a18';g.lineWidth=Math.max(1,r*.28);g.lineCap='round';g.beginPath();g.moveTo(a-r*.6,b+r*.25);g.lineTo(a+r*.6,b-r*.25);g.stroke();}
function board(g,B,cs,fr,Bh){var S=B+2*fr,H=(Bh||B)+2*fr,rad=Math.min(S,H)*.06,ip=fr*.62,gr,R=R0(3),i,k,yy;
  g.fillStyle='rgba(50,25,8,.18)';RR(g,-3,8,S+6,H+6,rad+3);g.fill();g.fillStyle='rgba(50,25,8,.28)';RR(g,0,4,S,H+1,rad);g.fill();
  gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#b5733f');gr.addColorStop(1,'#7a4220');g.fillStyle=gr;RR(g,0,0,S,H,rad);g.fill();
  g.save();RR(g,0,0,S,H,rad);g.clip();g.strokeStyle='rgba(60,25,5,.22)';g.lineWidth=1.4;
  for(i=0;i<Math.round(H/9);i++){yy=R()*H;g.beginPath();g.moveTo(0,yy);for(k=0;k<=8;k++)g.lineTo(k*S/8,yy+Math.sin(k*1.3+i)*S*.012);g.stroke();}g.restore();
  g.strokeStyle='rgba(255,220,170,.5)';g.lineWidth=2;RR(g,1.5,1.5,S-3,H-3,rad);g.stroke();
  // стол
  gr=g.createRadialGradient(S/2,H*.42,S*.1,S/2,H/2,Math.max(S,H)*.75);gr.addColorStop(0,'#f3d8ac');gr.addColorStop(1,'#ddb582');g.fillStyle=gr;RR(g,ip,ip,S-2*ip,H-2*ip,rad*.7);g.fill();
  g.save();RR(g,ip,ip,S-2*ip,H-2*ip,rad*.7);g.clip();
  for(i=0;i<Math.round(H/6);i++){yy=ip+R()*(H-2*ip);var amp=2+R()*5,ph=R()*6;g.strokeStyle='rgba(150,92,40,'+(.08+R()*.12).toFixed(2)+')';g.lineWidth=.6+R()*1.4;g.beginPath();g.moveTo(ip,yy);
    for(k=1;k<=12;k++)g.lineTo(ip+k*(S-2*ip)/12,yy+Math.sin(k*.7+ph)*amp);g.stroke();}
  for(i=0;i<3;i++){var kx=ip+R()*(S-2*ip),ky=ip+R()*(H-2*ip);g.strokeStyle='rgba(140,80,35,.18)';g.lineWidth=1.2;for(k=1;k<4;k++){g.beginPath();g.ellipse(kx,ky,cs*.12*k,cs*.05*k,0,0,7);g.stroke();}}
  gr=g.createLinearGradient(0,ip,0,ip+cs*.5);gr.addColorStop(0,'rgba(90,45,15,.22)');gr.addColorStop(1,'rgba(90,45,15,0)');g.fillStyle=gr;g.fillRect(ip,ip,S-2*ip,cs*.5);
  g.restore();
  g.strokeStyle='rgba(90,45,15,.45)';g.lineWidth=3;RR(g,ip,ip+1,S-2*ip,H-2*ip,rad*.7);g.stroke();
  var sr=Math.max(3,fr*.2),so=ip*.5;[[so,so],[S-so,so],[so,H-so],[S-so,H-so]].forEach(function(q){screw(g,q[0],q[1],sr);});
  if(H>S*1.3||S>H*1.3)return;[[S/2,so],[S/2,H-so]].forEach(function(q){screw(g,q[0],q[1],sr*.85);});}
// лунка: неглубокая ямка в столе
function empty(g,x,y,s){var m=s*.06,w=s-2*m,gr;g.fillStyle='#c99d68';RR(g,x+m,y+m,w,w,s*.2);g.fill();
  gr=g.createLinearGradient(0,y+m,0,y+m+w);gr.addColorStop(0,'rgba(70,35,10,.38)');gr.addColorStop(.35,'rgba(70,35,10,0)');gr.addColorStop(1,'rgba(255,240,215,.5)');g.fillStyle=gr;RR(g,x+m,y+m,w,w,s*.2);g.fill();}
// предмет — на сливочном жетоне
function item(g,k,x,y,s){var cx=x+s*.5,cy=y+s*.47,r=s*.33,gr;g.fillStyle='rgba(60,25,5,.3)';g.beginPath();g.arc(cx,cy+s*.03,r,0,7);g.fill();
  gr=g.createRadialGradient(cx-r*.3,cy-r*.4,r*.1,cx,cy,r);gr.addColorStop(0,'#fffdf6');gr.addColorStop(1,'#f3e2c2');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
  g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=Math.max(1,s*.025);g.beginPath();g.arc(cx,cy,r-s*.015,Math.PI*1.05,Math.PI*1.7);g.stroke();
  var im=ITEM_IMG[k];if(im&&im.complete&&im.naturalWidth)g.drawImage(im,cx-r*.82,cy-r*.82,r*1.64,r*1.64);}
// лоток: в книжной — квадраты «мелом» на асфальте и тени; в альбомной — сливочная панель
function tray(g,x,y,w,h,LY){var land=LY&&LY.land,sl=LY&&LY.slots,i;
  if(land){g.fillStyle='rgba(120,70,35,.5)';RR(g,x,y+5,w,h,26);g.fill();var gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'rgba(255,248,236,.9)');gr.addColorStop(1,'rgba(246,231,207,.93)');g.fillStyle=gr;RR(g,x,y,w,h,26);g.fill();
    g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=2;RR(g,x+1,y+1,w-2,h-2,25);g.stroke();
    if(sl)for(i=1;i<sl.length;i++){g.strokeStyle='rgba(167,102,58,.25)';g.lineWidth=2;g.beginPath();g.moveTo(x+18,sl[i].y);g.lineTo(x+w-18,sl[i].y);g.stroke();}return;}
  if(!sl)return;
  for(i=0;i<sl.length;i++){var s=sl[i],cx=s.x+s.w/2,cy=s.y+s.h/2,ww=s.w-16,hh=s.h-12;
    g.fillStyle='rgba(50,40,40,.13)';g.beginPath();g.ellipse(cx,cy+hh*.38,ww*.42,hh*.12,0,0,7);g.fill();
}}

/* ---------- сбор клетки: золотая вспышка → раздулся и лопнул (белая вспышка); осколки и звёзды — частицы ---------- */
function fx(g,x,y,cs,col,it,e,draw){
  if(e<.42){var a=e<.12?e/.12:1-(e-.12)/.3;g.globalAlpha=a*.85;g.fillStyle='#ffe38a';RR(g,x-cs*.1,y-cs*.1,cs*1.2,cs*1.2,cs*.3);g.fill();g.globalAlpha=a*.6;g.fillStyle='#fff8d0';RR(g,x+cs*.12,y+cs*.12,cs*.76,cs*.76,cs*.2);g.fill();g.globalAlpha=1;}
  var k=clamp((e-.12)/.36);if(k<1){var sc=1+.28*Math.sin(k*Math.PI*.8);g.save();g.globalAlpha=1-k*k;g.translate(x+cs/2,y+cs/2);g.scale(sc,sc);draw(-cs/2,-cs/2);
    if(k>0){g.fillStyle='rgba(255,255,255,'+(.8*Math.sin(k*Math.PI)).toFixed(3)+')';RR(g,-cs*.45,-cs*.45,cs*.9,cs*.9,cs*.2);g.fill();}g.restore();}}
// частица: треугольный осколок-леденец с бликом (t 0) или золотая звёздочка (t 1)
function part(g,p,x,y){var z,i;g.save();g.translate(x,y);g.rotate(p.rot);
  if(p.t===1){z=p.s*1.15;g.fillStyle='#ffd23a';g.beginPath();for(i=0;i<8;i++){var r2=i%2?z*.36:z;g.lineTo(Math.cos(i*Math.PI/4)*r2,Math.sin(i*Math.PI/4)*r2);}g.closePath();g.fill();g.fillStyle='#fff6c0';g.beginPath();g.arc(0,0,z*.22,0,7);g.fill();}
  else{z=p.s*1.5;g.fillStyle=p.c;g.beginPath();g.moveTo(-z,-z*.6);g.lineTo(z,-z);g.lineTo(z*.4,z);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(-z,-z*.6);g.lineTo(z,-z);g.lineTo(0,-z*.4);g.closePath();g.fill();}
  g.restore();}
// крупные слова: тёмно-коричневая обводка, белая кайма, золотой (серия — оранжевый) градиент; «+240» — белым
function text(g,t,size,kind){g.font='800 '+size+'px KF,-apple-system,Roboto,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  if(kind==='pts'){g.lineWidth=size*.28;g.strokeStyle='#5a2a08';g.strokeText(t,0,0);g.fillStyle='#fff';g.fillText(t,0,0);return;}
  var C=kind==='combo'?['#ffe0b0','#ff8a1e','#d8400c']:['#fff6b8','#ffc62e','#f07800'];
  g.fillStyle='rgba(90,42,8,.35)';g.fillText(t,0,size*.12);
  g.lineWidth=size*.26;g.strokeStyle='#5a2a08';g.strokeText(t,0,0);g.lineWidth=size*.1;g.strokeStyle='#fff';g.strokeText(t,0,0);
  var gr=g.createLinearGradient(0,-size*.45,0,size*.45);gr.addColorStop(0,C[0]);gr.addColorStop(.5,C[1]);gr.addColorStop(1,C[2]);g.fillStyle=gr;g.fillText(t,0,0);}

/* ---------- двор: хрущёвки с балконами и бельём, подъезды, деревья, газон, асфальт с классиками, песочница, качели, лавочка, фонарь, голуби ---------- */
var YC={};
function yard(tod){if(YC[tod])return YC[tod];var R=R0(11),eve=tod==='eve',night=tod==='night',dk=eve||night,i,x,y;
  var sky=night?['#0d1838','#1d2d5c','#34407a','#4f5688']:eve?['#2c3470','#7b5a9a','#e98a6a','#f8c27a']:['#8ccbed','#bfe3f4','#e8f3f1','#fde7c4'];
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice"><defs>'+
  '<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1">'+sky.map(function(c,j){return '<stop offset="'+(j/3*.7).toFixed(2)+'" stop-color="'+c+'"/>';}).join('')+'</linearGradient>'+
  '<radialGradient id="lamp"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="sun"><stop offset="0" stop-color="#fff6d0" stop-opacity=".9"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(night?'#6f6a86':eve?'#b9a7a8':'#f1e4cc')+'"/><stop offset="1" stop-color="'+(night?'#4f4b66':eve?'#8f7f86':'#e2cfae')+'"/></linearGradient>'+
  '<linearGradient id="wall2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(night?'#655f80':eve?'#a99aa8':'#e8d6c0')+'"/><stop offset="1" stop-color="'+(night?'#47425f':eve?'#7f7488':'#d6c0a2')+'"/></linearGradient>'+
  '<linearGradient id="asf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(night?'#4d4858':eve?'#6d6577':'#bdb7ae')+'"/><stop offset="1" stop-color="'+(night?'#322e3c':eve?'#4f4859':'#a49d94')+'"/></linearGradient>'+
  '</defs><rect width="1200" height="800" fill="url(#sk)"/>';
  if(dk){for(i=0;i<(night?80:40);i++)s+='<circle cx="'+(R()*1200|0)+'" cy="'+(R()*(night?300:200)|0)+'" r="'+(1+R()*1.4).toFixed(1)+'" fill="#fff" opacity="'+(.35+R()*.55).toFixed(2)+'"/>';
    s+=night?'<circle cx="930" cy="110" r="80" fill="#fff8dc" opacity=".08"/><circle cx="930" cy="110" r="36" fill="#fff5d6"/><circle cx="946" cy="99" r="32" fill="'+sky[0]+'"/>':'<circle cx="300" cy="80" r="20" fill="#fff5d6" opacity=".9"/><circle cx="311" cy="72" r="18" fill="'+sky[0]+'"/>';}
  else s+='<circle cx="960" cy="120" r="140" fill="url(#sun)"/><circle cx="960" cy="120" r="44" fill="#fff3c4"/>';
  function cloud(x,y,k,o){return '<g opacity="'+o+'" fill="'+(night?'#5b6894':'#fff')+'"><ellipse cx="'+x+'" cy="'+y+'" rx="'+60*k+'" ry="'+18*k+'"/><ellipse cx="'+(x-25*k)+'" cy="'+(y-10*k)+'" rx="'+30*k+'" ry="'+20*k+'"/><ellipse cx="'+(x+18*k)+'" cy="'+(y-16*k)+'" rx="'+34*k+'" ry="'+24*k+'"/></g>';}
  s+=cloud(220,120,1.2,dk?.25:.95)+cloud(640,70,.9,dk?.2:.9)+cloud(1080,180,1,dk?.2:.85);
  // дальние девятиэтажки
  [[120,150,320],[330,120,290],[560,170,340],[800,140,310],[1010,160,330]].forEach(function(q){var x=q[0],w=q[1],h=q[2];s+='<rect x="'+x+'" y="'+(510-h)+'" width="'+w+'" height="'+h+'" fill="'+(night?'#2c3560':eve?'#4b4a78':'#c7d7e3')+'"/>';
    for(var r=0;r<10;r++)for(var c=0;c<6;c++)if(R()<(dk?.35:.9))s+='<rect x="'+(x+8+c*w/6.3).toFixed(1)+'" y="'+(510-h+12+r*30)+'" width="9" height="12" fill="'+(dk?(R()<(night?.5:.6)?'#ffd27a':(night?'#3a4170':'#5a5a88')):'#b2c6d4')+'"/>';});
  // хрущёвки
  function house(x,y,w,fl,cols,wid){var fh=46,h=fl*fh+18,t='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="url(#'+wid+')"/>',f,c;
    t+='<rect x="'+(x-6)+'" y="'+(y-10)+'" width="'+(w+12)+'" height="12" rx="3" fill="'+(night?'#3f3a52':eve?'#5d4f5f':'#9c8a78')+'"/>';
    for(var a=0;a<3;a++){var ax=x+40+R()*(w-80);t+='<path d="M'+ax.toFixed(0)+' '+(y-10)+'v-34M'+(ax-16).toFixed(0)+' '+(y-34)+'h32M'+(ax-10).toFixed(0)+' '+(y-26)+'h20" stroke="'+(dk?'#2e2944':'#6d6a66')+'" stroke-width="2.4"/>';}
    for(f=0;f<=fl;f++)t+='<path d="M'+x+' '+(y+12+f*fh)+'h'+w+'" stroke="rgba(120,90,60,.18)" stroke-width="2"/>';
    var cw=w/cols;for(c=1;c<cols;c++)t+='<path d="M'+(x+c*cw).toFixed(0)+' '+y+'v'+h+'" stroke="rgba(120,90,60,.12)" stroke-width="2"/>';
    for(f=0;f<fl;f++)for(c=0;c<cols;c++){var wx=x+c*cw+cw*.22,wy=y+20+f*fh,ww=cw*.56,wh=26,lit=night?R()<.42:eve?R()<.55:R()<.08;
      var glass=lit?(R()<.5?'#ffd889':'#ffe6a8'):(night?'#3a3f6e':eve?'#5b5e8c':'#9ec3dc'),frc=night?'#a9a6c0':'#fff';
      if(f>0&&c%3===1){t+='<rect x="'+(wx-6).toFixed(1)+'" y="'+(wy-2)+'" width="'+(ww+12).toFixed(1)+'" height="'+(wh+4)+'" fill="'+glass+'"/><rect x="'+(wx-10).toFixed(1)+'" y="'+(wy+14)+'" width="'+(ww+20).toFixed(1)+'" height="17" fill="'+(night?'#5a5878':eve?'#6f6f8f':'#d9cdb8')+'" stroke="'+(dk?'#4b4b6b':'#a39276')+'" stroke-width="2"/>';
        if(R()<.45){t+='<path d="M'+(wx-8).toFixed(1)+' '+(wy+2)+'h'+(ww+16).toFixed(1)+'" stroke="#888" stroke-width="1"/>';for(var k=0;k<3;k++)t+='<rect x="'+(wx-4+k*ww/3).toFixed(1)+'" y="'+(wy+2)+'" width="'+(ww/4).toFixed(1)+'" height="'+(8+R()*6).toFixed(1)+'" fill="'+['#f28b82','#fff','#8ecae6','#ffd166'][k+(R()*2|0)]+'" opacity="'+(night?.6:1)+'"/>';}}
      else{t+='<rect x="'+wx.toFixed(1)+'" y="'+wy+'" width="'+ww.toFixed(1)+'" height="'+wh+'" fill="'+glass+'" stroke="'+frc+'" stroke-width="3"/><path d="M'+(wx+ww/2).toFixed(1)+' '+wy+'v'+wh+'" stroke="'+frc+'" stroke-width="2"/>';
        if(R()<.35)t+='<rect x="'+(wx+2).toFixed(1)+'" y="'+(wy+2)+'" width="'+(ww*.22).toFixed(1)+'" height="'+(wh-4)+'" fill="'+(lit?'#f6a04d':'#e8b4a0')+'" opacity=".8"/>';
        if(R()<.25&&!dk)t+='<rect x="'+(wx+ww*.6).toFixed(1)+'" y="'+(wy+wh-7)+'" width="10" height="7" fill="#5aa74a"/>';}
      if(lit)t+='<rect x="'+(wx-10).toFixed(1)+'" y="'+(wy-8)+'" width="'+(ww+20).toFixed(1)+'" height="'+(wh+16)+'" fill="#ffd27a" opacity="'+(night?.16:.12)+'"/>';}
    return t;}
  s+=house(-40,262,520,5,8,'wall')+house(720,252,520,5,8,'wall2');
  if(night)s+='<rect x="0" y="240" width="1200" height="300" fill="#0b1430" opacity=".18"/>';
  // подъезды с козырьками (вечером и ночью — лампочки)
  [150,360,860,1060].forEach(function(x){s+='<rect x="'+(x-26)+'" y="446" width="52" height="66" fill="'+(dk?'#3f3a52':'#7b5a44')+'"/><rect x="'+(x-20)+'" y="454" width="18" height="24" fill="'+(dk?'#ffd27a':'#c9b29a')+'" opacity="'+(dk?.7:.5)+'"/><rect x="'+(x-34)+'" y="436" width="68" height="10" fill="'+(dk?'#5a556e':'#a49786')+'"/>'+(dk?'<circle cx="'+x+'" cy="432" r="44" fill="url(#lamp)"/><circle cx="'+x+'" cy="433" r="4" fill="#fff3c0"/>':'');});
  // верёвка с бельём между деревьями
  s+='<path d="M568 420q72 22 142 0" stroke="'+(dk?'#8a86a0':'#777')+'" stroke-width="2" fill="none"/>'+[[584,'#fff',26],[620,'#f28b82',30],[662,'#8ecae6',24],[692,'#ffd166',18]].map(function(q,j){return '<path d="M'+q[0]+' '+(424+(j===1||j===2?6:2))+'h'+q[2]+'v'+(30+j*4)+'q-'+(q[2]/2)+' 6 -'+q[2]+' 0z" fill="'+q[1]+'" opacity="'+(night?.55:dk?.75:1)+'" stroke="rgba(0,0,0,.08)" stroke-width="1.2"/>';}).join('');
  // деревья: три тона листвы
  function tree(x,y,k){var c=night?['#1f3530','#2a463e','#36574c']:eve?['#2f4a45','#3c5d52','#4d7062']:['#4e9a45','#65b552','#86cc66'];
    return '<rect x="'+(x-6*k)+'" y="'+(y-10)+'" width="'+12*k+'" height="'+(545-y+10)+'" fill="'+(dk?'#3a2c2a':'#7a5230')+'"/><circle cx="'+x+'" cy="'+(y-50*k)+'" r="'+62*k+'" fill="'+c[0]+'"/><circle cx="'+(x-34*k)+'" cy="'+(y-28*k)+'" r="'+40*k+'" fill="'+c[1]+'"/><circle cx="'+(x+30*k)+'" cy="'+(y-80*k)+'" r="'+38*k+'" fill="'+c[1]+'"/><circle cx="'+(x-12*k)+'" cy="'+(y-88*k)+'" r="'+26*k+'" fill="'+c[2]+'"/>';}
  s+=tree(60,515,1.1)+tree(555,500,.9)+tree(720,515,1)+tree(1150,515,1.1);
  // газон и асфальт
  s+='<rect x="0" y="508" width="1200" height="38" fill="'+(night?'#26402f':eve?'#3d5a46':'#8cc46a')+'"/>';
  for(i=0;i<50;i++){x=R()*1200;y=515+R()*24;s+='<path d="M'+x.toFixed(0)+' '+y.toFixed(0)+'l3-9 3 9" fill="'+(dk?'#2f4d3a':'#6fae50')+'" opacity=".7"/>';}
  s+='<rect x="0" y="540" width="1200" height="260" fill="url(#asf)"/><rect x="0" y="540" width="1200" height="6" fill="'+(dk?'#5d5868':'#d2ccc2')+'"/>';
  for(i=0;i<30;i++)s+='<ellipse cx="'+(R()*1200).toFixed(0)+'" cy="'+(560+R()*230).toFixed(0)+'" rx="'+(20+R()*40).toFixed(0)+'" ry="'+(5+R()*9).toFixed(0)+'" fill="'+(R()<.5?'#fff':'#000')+'" opacity=".05"/>';
  // классики мелом
  var ch=night?'#c9c4dc':eve?'#d9d4e6':'#fff';
  s+='<g stroke="'+ch+'" stroke-width="3" fill="none" opacity=".85" transform="translate(500 620) skewX(-20)">';for(i=0;i<5;i++)s+='<rect x="'+(i*40)+'" y="20" width="40" height="40"/>';s+='<rect x="80" y="-20" width="40" height="40"/><rect x="80" y="60" width="40" height="40"/></g>';
  s+='<g font-family="KF,sans-serif" font-size="20" font-weight="600" fill="'+ch+'" opacity=".8" transform="translate(500 620) skewX(-20)"><text x="14" y="47">1</text><text x="54" y="47">2</text><text x="94" y="47">3</text><text x="94" y="7">4</text><text x="94" y="87">5</text><text x="134" y="47">6</text><text x="174" y="47">7</text></g>';
  s+='<path d="M760 700q16-10 30-2" stroke="'+ch+'" stroke-width="3" fill="none" opacity=".6"/><circle cx="800" cy="694" r="6" fill="none" stroke="'+ch+'" stroke-width="3" opacity=".6"/>';
  // песочница с ведёрком и совочком
  s+='<rect x="200" y="660" width="150" height="60" rx="6" fill="'+(dk?'#a8925e':'#e9cf8e')+'" stroke="'+(dk?'#6a4a2c':'#9c6b3c')+'" stroke-width="10"/><circle cx="250" cy="682" r="10" fill="#e64b3c"/><path d="M280 700l18-10 6 14z" fill="#3d8fe0"/><rect x="310" y="676" width="16" height="18" rx="3" fill="#f2b631"/>';
  // качели
  s+='<path d="M860 520l40 120M960 520l-40 120M860 520h100" stroke="#c8462f" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M896 520v76M924 520v76" stroke="'+(dk?'#9a98a8':'#777')+'" stroke-width="2"/><rect x="886" y="594" width="48" height="9" rx="3" fill="#f2b631"/>';
  // лавочка
  s+='<rect x="1000" y="664" width="120" height="10" rx="3" fill="#c9854a"/><rect x="1000" y="650" width="120" height="8" rx="3" fill="#b0703a"/><rect x="1008" y="674" width="7" height="22" fill="#555"/><rect x="1105" y="674" width="7" height="22" fill="#555"/>';
  // фонари
  s+='<path d="M120 800V572" stroke="'+(dk?'#2a2838':'#55585e')+'" stroke-width="7"/><path d="M120 572q0-18 22-18" stroke="'+(dk?'#2a2838':'#55585e')+'" stroke-width="6" fill="none"/><rect x="134" y="552" width="22" height="10" rx="3" fill="#ffe9a8"/>'+(dk?'<circle cx="145" cy="572" r="110" fill="url(#lamp)"/><ellipse cx="150" cy="740" rx="120" ry="30" fill="#ffe9a8" opacity=".12"/>':'');
  if(dk)s+='<path d="M1180 800V560" stroke="#2a2838" stroke-width="7"/><path d="M1180 560q0-18-22-18" stroke="#2a2838" stroke-width="6" fill="none"/><rect x="1144" y="540" width="22" height="10" rx="3" fill="#ffe9a8"/><circle cx="1155" cy="560" r="100" fill="url(#lamp)"/>';
  // голуби днём и вечером; ночью — кот на лавочке
  if(!night)[[440,720],[462,732],[760,740]].forEach(function(q){s+='<ellipse cx="'+q[0]+'" cy="'+q[1]+'" rx="10" ry="6" fill="#8a8f9a"/><circle cx="'+(q[0]+8)+'" cy="'+(q[1]-5)+'" r="4" fill="#6e7380"/>';});
  else s+='<g fill="#2a2734"><ellipse cx="1060" cy="652" rx="16" ry="9"/><circle cx="1074" cy="642" r="7"/><path d="M1070 636l2-6 3 5zM1077 636l3-6 1 6z"/></g><circle cx="1076" cy="642" r="1.6" fill="#ffe066"/>';
  return YC[tod]=s+'</svg>';}

/* ---------- карта: асфальтовая дорожка через двор; пройденные — сливочные плитки со звёздами, текущий — оранжевый с соседом ---------- */
var MAPC={bg:'#9fcf7c',stripe:'#a9d687',edge:'#8f897f',path:'#b9b3a8',mid:'#fff',crown:['#86cc66','#65b552','#4e9a45'],ink:'#3b2416',ink2:'#7a5a3a',done:'#fff4dc',doneTx:'#6d3b1c',cur:['#ffb04a','#f2782a','#b4470a'],lockTx:'#6f6457',flower:'#f2b631',ring:'#f0b13a'};
function mapHtml(){var NL=NLV,CH=CHAPTERS.length,Wd=400,R=R0(9),n,s,i,x,y;
  var yOf=[],pts=[];y=120;for(n=NL;n>=1;n--){if(n%10===0&&n<NL)y+=160;yOf[n]=y;y+=64;}var H=y+150;
  for(n=1;n<=NL;n++){i=NL-n;pts[n]=[200+Math.sin(i*.62+.8)*110,yOf[n]];}
  s='<svg class="lkmap" viewBox="0 0 '+Wd+' '+H+'" xmlns="http://www.w3.org/2000/svg"><defs>'+
   '<radialGradient id="acur"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>'+
   '<linearGradient id="awl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e4cc"/><stop offset="1" stop-color="#e2cfae"/></linearGradient>'+
   '<clipPath id="acp0"><circle cx="0" cy="0" r="23"/></clipPath><clipPath id="acps"><circle cx="-124" cy="0" r="24"/></clipPath></defs>';
  s+='<rect width="'+Wd+'" height="'+H+'" fill="'+MAPC.bg+'"/>';
  for(var k=0;k<H/70;k++)s+='<rect x="0" y="'+(k*70)+'" width="'+Wd+'" height="35" fill="'+MAPC.stripe+'" opacity=".6"/>';
  // хрущёвки по краям (кусками) и асфальтовые площадки с классиками
  function facade(x,y,w){var t='<rect x="'+(x+6)+'" y="'+(y+8)+'" width="'+w+'" height="150" fill="#3b2416" opacity=".12"/><rect x="'+x+'" y="'+y+'" width="'+w+'" height="150" fill="url(#awl)"/><rect x="'+(x-4)+'" y="'+(y-8)+'" width="'+(w+8)+'" height="10" rx="3" fill="#9c8a78"/>';
    for(var f=0;f<3;f++)for(var c=0;c<Math.floor(w/34);c++){var wx=x+8+c*34,wy=y+14+f*44,bal=f>0&&c%3===1;
      t+=bal?'<rect x="'+(wx-3)+'" y="'+wy+'" width="28" height="24" fill="#9ec3dc"/><rect x="'+(wx-5)+'" y="'+(wy+14)+'" width="32" height="14" fill="#d9cdb8" stroke="#a39276" stroke-width="1.5"/>'+(R()<.5?'<rect x="'+wx+'" y="'+(wy+2)+'" width="7" height="10" fill="#f28b82"/><rect x="'+(wx+10)+'" y="'+(wy+2)+'" width="7" height="12" fill="#fff"/>':'')
        :'<rect x="'+wx+'" y="'+wy+'" width="22" height="24" fill="#9ec3dc" stroke="#fff" stroke-width="2.5"/><path d="M'+(wx+11)+' '+wy+'v24" stroke="#fff" stroke-width="1.6"/>';}
    return t;}
  function hop(x,y){var t='<g transform="translate('+x+' '+y+') skewX(-18)" stroke="#fff" stroke-width="2.4" fill="none" opacity=".85">';for(var j=0;j<4;j++)t+='<rect x="'+(j*26)+'" y="0" width="26" height="26"/>';return t+'<rect x="52" y="-26" width="26" height="26"/></g>';}
  function tree(x,y,r){return '<circle cx="'+(x+r*.2)+'" cy="'+(y+r*.3)+'" r="'+r+'" fill="#2e5a26" opacity=".2"/><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+MAPC.crown[2]+'"/><circle cx="'+(x-r*.3)+'" cy="'+(y+r*.15)+'" r="'+(r*.62)+'" fill="'+MAPC.crown[1]+'"/><circle cx="'+(x+r*.1)+'" cy="'+(y-r*.35)+'" r="'+(r*.45)+'" fill="'+MAPC.crown[0]+'"/>';}
  for(var z=0;z<H/520;z++){var zy=60+z*520+R()*60,left=z%2===0;
    s+=left?facade(-70,zy,150):facade(320,zy,150);
    var ay=zy+260+R()*60,ax=left?250:20;s+='<rect x="'+ax+'" y="'+ay+'" width="140" height="90" rx="18" fill="#bdb7ae"/><rect x="'+ax+'" y="'+ay+'" width="140" height="90" rx="18" fill="none" stroke="#a49d94" stroke-width="3"/>'+hop(ax+28,ay+46);
    s+=tree(left?380:18,zy+200+R()*40,30+R()*10)+tree(left?20:384,zy+420+R()*40,26+R()*10);}
  for(i=0;i<H/40;i++){x=R()*Wd;y=R()*H;s+='<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="3.2" fill="#fff" opacity=".85"/><circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="1.3" fill="'+MAPC.flower+'"/>';}
  // дорожка
  var d='M'+pts[NL][0].toFixed(1)+' '+(pts[NL][1]-60);for(n=NL;n>=1;n--){var p0=n<NL?pts[n+1]:[pts[NL][0],pts[NL][1]-60],p1=pts[n];d+=' C'+p0[0].toFixed(1)+' '+(p0[1]+26)+' '+p1[0].toFixed(1)+' '+(p1[1]-26)+' '+p1[0].toFixed(1)+' '+p1[1];}d+=' L'+pts[1][0].toFixed(1)+' '+(H+10);
  s+='<path d="'+d+'" stroke="'+MAPC.edge+'" stroke-width="50" fill="none" stroke-linecap="round" opacity=".9"/><path d="'+d+'" stroke="'+MAPC.path+'" stroke-width="42" fill="none" stroke-linecap="round"/><path d="'+d+'" stroke="#fff" stroke-width="3" stroke-dasharray="10 12" fill="none" opacity=".75"/>';
  // места глав и вывески
  var tot=0,nl=nextLevel();
  for(var c=0;c<CH;c++){var a=c*10+1,lock=a>S.unlocked,stc=0,dn=0;for(var q=a;q<a+10;q++){stc+=S.lv[q]||0;if(S.lv[q])dn++;}tot+=stc;
    var mid=(yOf[a+4]+yOf[a+5])/2,px=pts[a+4][0]>200?92:308;
    s+='<g transform="translate('+px+' '+mid+')"'+(lock?' opacity=".6"':'')+'><rect x="-74" y="-54" width="148" height="108" rx="20" fill="#5a2e10" opacity=".25" transform="translate(0 6)"/><rect x="-74" y="-54" width="148" height="108" rx="20" fill="#fff8ec" stroke="#c9a77a" stroke-width="4"/>'+(LK.PLACE[CHAPTERS[c].id]||LK.PLACE.yard)+'</g>';
    var sy=c>0?(yOf[a]+yOf[a-1])/2:yOf[1]+92,C=CHAPTERS[c],cg=S.chest[c]||0,col=lock?'#6f8199':dn>=10?'#3f8a36':'#c85f17',dcol=lock?'#4d5d73':dn>=10?'#2a6324':'#8a3c0a',
      sub=lock?T('откроется после «','opens after “')+chName(c-1)+T('»','”'):'★ '+stc+T(' из 30',' of 30')+(cg<CHEST.length?' · '+T('сундук за ','chest at ')+CHEST[cg][0]+'★':' · '+T('сундуки открыты','chests open'));
    s+='<g transform="translate(200 '+sy+')"><rect x="-162" y="-30" width="324" height="68" rx="24" fill="'+dcol+'"/><rect x="-162" y="-34" width="324" height="68" rx="24" fill="'+col+'"/><rect x="-160.5" y="-32.5" width="321" height="65" rx="23" fill="none" stroke="#fff" stroke-width="3" opacity=".55"/>'+
      '<circle cx="-124" cy="0" r="27" fill="#fff"/><image clip-path="url(#acps)" href="'+pURI(C.host,lock?'norm':'happy')+'" x="-148" y="-24" width="48" height="48"/>'+
      '<text x="-88" y="-5" font-family="KF,sans-serif" font-weight="800" font-size="20" fill="#fff">'+(c+1)+'. '+esc(chName(c))+'</text><text x="-88" y="18" font-family="KF,sans-serif" font-weight="600" font-size="15" fill="#fff">'+esc(sub)+'</text>'+
      (lock?'<g transform="translate(138 0)"><rect x="-10" y="-4" width="20" height="16" rx="4" fill="#fff"/><path d="M-6-4v-5a6 6 0 0 1 12 0v5" stroke="#fff" stroke-width="3.4" fill="none"/></g>':'')+'</g>';}
  // уровни
  var SP=LK.STARP;
  for(n=1;n<=NL;n++){x=pts[n][0];y=pts[n][1];var done=!!S.lv[n],isCur=n===nl&&!S.lv[n],lk=n>S.unlocked,boss=n%10===0;
    s+='<g data-l="'+n+'">';
    if(isCur){s+='<circle cx="'+x+'" cy="'+y+'" r="60" fill="url(#acur)"/><circle cx="'+x+'" cy="'+(y+5)+'" r="33" fill="'+MAPC.cur[2]+'"/><circle cx="'+x+'" cy="'+y+'" r="33" fill="'+MAPC.cur[1]+'"/><circle cx="'+x+'" cy="'+y+'" r="33" fill="none" stroke="#fff" stroke-width="5"/><ellipse cx="'+(x-7)+'" cy="'+(y-16)+'" rx="15" ry="6" fill="#fff" opacity=".35"/><text x="'+x+'" y="'+(y+10)+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="800" font-size="28" fill="#fff">'+n+'</text>'+
      '<g transform="translate('+(x+((n<NL?pts[n+1][0]:200)>x?-60:60))+' '+(y-34)+')"><circle r="28" fill="#5a2e10" opacity=".22" transform="translate(0 4)"/><circle r="28" fill="'+MAPC.ring+'"/><circle r="25" fill="#fff"/><image clip-path="url(#acp0)" href="'+pURI(CHAPTERS[Math.floor((n-1)/10)].host,'happy')+'" x="-23" y="-23" width="46" height="46"/></g>';}
    else if(done){var stv=S.lv[n]||0;s+='<circle cx="'+x+'" cy="'+(y+4)+'" r="25" fill="#c99a52"/><circle cx="'+x+'" cy="'+y+'" r="25" fill="'+MAPC.done+'"/><text x="'+x+'" y="'+(y+7)+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="800" font-size="20" fill="'+MAPC.doneTx+'">'+n+'</text>';
      for(var kk=0;kk<3;kk++)s+='<path transform="translate('+(x-17+kk*17-6.8)+' '+(y+17+(kk===1?3:0))+') scale(.17)" d="'+SP+'" fill="'+(kk<stv?'#ffc62e':'#e3d6c0')+'" stroke="#fff" stroke-width="7"/>';}
    else if(lk)s+='<circle cx="'+x+'" cy="'+y+'" r="22" fill="rgba(255,255,255,.6)" stroke="#fff" stroke-width="3" stroke-dasharray="6 5"/><text x="'+x+'" y="'+(y+7)+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="700" font-size="19" fill="'+MAPC.lockTx+'">'+n+'</text>';
    else s+='<circle cx="'+x+'" cy="'+(y+4)+'" r="25" fill="#c99a52"/><circle cx="'+x+'" cy="'+y+'" r="25" fill="#fff"/><circle cx="'+x+'" cy="'+y+'" r="21" fill="none" stroke="'+MAPC.cur[1]+'" stroke-width="3"/><text x="'+x+'" y="'+(y+7)+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="800" font-size="20" fill="'+MAPC.ink+'">'+n+'</text>';
    if(boss&&!isCur)s+='<g transform="translate('+(x+(x>200?-50:50))+' '+y+')"><rect x="-16" y="-10" width="32" height="22" rx="4" fill="#c8462f" stroke="#7a2614" stroke-width="2"/><rect x="-16" y="-14" width="32" height="9" rx="4" fill="#e2624a"/><rect x="-3" y="-6" width="6" height="8" fill="#ffd84a"/></g>';
    s+='<circle cx="'+x+'" cy="'+y+'" r="30" fill="transparent"/></g>';}
  return {svg:s+'</svg>',tot:tot,y:function(n){return pts[n][1]/H;}};}

/* ---------- превью для «Оформления»: кусочек двора и стол с кирпичиками ---------- */
var PV=['##..#.','#.###.','..#.##','20##..'];
function preview(c,g,w,h){var gr=g.createLinearGradient(0,0,0,h),r,q;gr.addColorStop(0,'#8ccbed');gr.addColorStop(.55,'#e8f3f1');gr.addColorStop(1,'#fde7c4');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='#e9dcc2';g.fillRect(-4,h*.12,w*.26,h*.62);g.fillRect(w*.76,h*.1,w*.3,h*.64);g.fillStyle='#9ec3dc';
  for(r=0;r<4;r++)for(q=0;q<2;q++){g.fillRect(6+q*24,h*.17+r*h*.13,13,h*.07);g.fillRect(w*.8+q*24,h*.15+r*h*.13,13,h*.07);}
  g.fillStyle='#8cc46a';g.fillRect(0,h*.72,w,h*.08);g.fillStyle='#b5afa6';g.fillRect(0,h*.79,w,h*.21);
  var cs=Math.floor((h-30)/4),fr=Math.round(cs*.42),B=cs*6,bx=(w-B)/2,by=(h-cs*4)/2;g.save();g.translate(bx-fr,by-fr);board(g,B,cs,fr,cs*4);g.restore();
  for(r=0;r<4;r++)for(q=0;q<6;q++){var ch=PV[r][q],x=bx+q*cs,y=by+r*cs;if(ch==='.')empty(g,x,y,cs);else if(ch==='2')stone(g,x,y,cs);else{candy(g,x,y,cs,PAL[ch==='0'?6:(r*3+q)%8]);if(ch==='0')item(g,1,x,y,cs);}}}

/* ---------- интерфейс темы: сливки, ореховое дерево, кнопки-«леденцы» с толстым низом ---------- */
var P='html.lk.th-a ',CN='linear-gradient(180deg,#fffdf7,#f3e3c6)';
var CSS=[
'html.lk.th-a{--ink:#3b2416;--ink2:#6e4f33;--muted:#6e4f33;--card:#fff8ec;--card2:#f6e7cf;--line:#ead6b4;--glass:rgba(255,248,236,.95);--glass2:rgba(255,248,236,.85);'+
'--acc1:#ffb04a;--acc:#ea6a15;--acc2:#b4470a;--good1:#7ad35f;--good:#3fa33a;--good2:#2f8f2f;--blue1:#7cc4f4;--blue:#2f8fd8;--blue2:#1f64a8;'+
'--gold:#f3a81b;--gold2:#b86b00;--red:#c2560c;--mint:#fff1d6;--mintL:#ecd3a6;--sh:rgba(60,30,10,.25);--dim:rgba(40,22,10,.55);--bgc:#cfe6f2}',
/* кнопки */
P+'.btn{background:'+CN+';color:var(--ink);box-shadow:0 4px 0 #c9a77a,0 7px 12px rgba(60,30,10,.22),inset 0 2px 0 #fff}',
P+'.btn:active{transform:translateY(3px);box-shadow:0 1px 0 #c9a77a,0 3px 6px rgba(60,30,10,.2),inset 0 2px 0 #fff}',
P+'.btn.green{background:linear-gradient(180deg,#7ad35f,#2f9a2f);box-shadow:0 6px 0 #1f6b22,0 10px 16px rgba(30,80,20,.32),inset 0 2px 0 rgba(255,255,255,.45);text-shadow:0 2px 0 rgba(0,0,0,.25)}',
P+'.btn.accent{background:linear-gradient(180deg,#ffb04a,#ea6a15);box-shadow:0 6px 0 #a8420a,0 10px 16px rgba(160,60,10,.3),inset 0 2px 0 rgba(255,255,255,.45);text-shadow:0 2px 0 rgba(120,40,0,.35)}',
P+'.btn.blue{background:linear-gradient(180deg,#6cb8f0,#2479c4);box-shadow:0 6px 0 #1a5694,0 10px 16px rgba(20,70,140,.3),inset 0 2px 0 rgba(255,255,255,.45);text-shadow:0 2px 0 rgba(10,40,90,.35)}',
P+'.btn.green,'+P+'.btn.accent,'+P+'.btn.blue,'+P+'.big{color:#fff}',
P+'.btn.green:active,'+P+'.btn.accent:active,'+P+'.btn.blue:active{transform:translateY(4px);box-shadow:0 2px 0 rgba(60,30,10,.45),inset 0 2px 0 rgba(255,255,255,.4)}',
P+'.icon{width:52px;height:52px;border-radius:18px;background:'+CN+';color:#a7663a;box-shadow:0 4px 0 #c9a77a,0 7px 12px rgba(60,30,10,.25),inset 0 2px 0 #fff}',
P+'.pill{background:'+CN+';color:var(--ink);box-shadow:0 3px 0 #c9a77a,0 6px 10px rgba(60,30,10,.2),inset 0 2px 0 #fff}',
/* шапки: белые слова с коричневой тенью (как в макете); карта — дощечка */
P+'.gt>div:first-child{color:#fff;text-shadow:0 2px 0 rgba(70,35,10,.6),0 0 10px rgba(70,35,10,.4)}',
P+'.gh .sub{color:#fff;text-shadow:0 1px 0 rgba(70,35,10,.7),0 0 8px rgba(70,35,10,.5)}',
P+'#scr-map .gh{background:linear-gradient(180deg,#b5733f,#8a4c26);box-shadow:0 4px 0 #6d3b1c,0 8px 16px rgba(50,25,8,.3)}',
P+'#scr-map .map-scroll{background:var(--mapbg,#9fcf7c)}',
/* меню */
P+'.logo{color:#fff;text-shadow:0 3px 0 rgba(110,55,20,.75),0 0 12px rgba(70,35,10,.35)}',
P+'.logo small{color:#ffe28a;text-shadow:0 2px 0 rgba(110,55,20,.75)}',
P+'.hface,'+P+'.hav,'+P+'.card .av{background:linear-gradient(135deg,#ffe28a,#f0b13a 55%,#d98a1a);box-shadow:0 0 0 3px #fff,0 8px 16px rgba(60,30,10,.35)}',
P+'.hsay,'+P+'.bub{background:#fff;color:var(--ink);box-shadow:0 4px 0 rgba(201,167,122,.6),0 8px 14px rgba(60,30,10,.18)}',
P+'.hsay b,'+P+'.bub b{color:#c2560c}',
P+'#bPlay{background:linear-gradient(180deg,#7ad35f,#2f9a2f);box-shadow:0 6px 0 #1f6b22,0 12px 18px rgba(30,80,20,.32),inset 0 2px 0 rgba(255,255,255,.45)}',
P+'#bDaily{background:linear-gradient(180deg,#ffb04a,#ea6a15);box-shadow:0 6px 0 #a8420a,0 12px 18px rgba(160,60,10,.3),inset 0 2px 0 rgba(255,255,255,.45)}',
P+'#bEnd{background:linear-gradient(180deg,#6cb8f0,#2479c4);box-shadow:0 6px 0 #1a5694,0 12px 18px rgba(20,70,140,.3),inset 0 2px 0 rgba(255,255,255,.45)}',
P+'.big .ic{background:rgba(255,255,255,.25);box-shadow:inset 0 0 0 2px rgba(255,255,255,.5)}',
P+'.nrow .btn{background:linear-gradient(180deg,#fffdf7,#f1dfc0);box-shadow:0 5px 0 #c9a77a,0 9px 14px rgba(60,30,10,.22),inset 0 2px 0 #fff}',
P+'.nrow .btn small{color:var(--ink)}',
P+'.btn .dot{background:#e8553f}',
P+'.today,'+P+'.kcard{background:linear-gradient(180deg,rgba(255,250,240,.96),rgba(248,234,208,.96));box-shadow:0 5px 0 rgba(167,102,58,.5),0 10px 20px rgba(60,30,10,.22),inset 0 2px 0 #fff}',
P+'.trow{background:#fff;box-shadow:0 3px 0 #e2c89e;color:var(--ink)}',
P+'.trow .ic{background:#fff1d6}',
P+'.trow i{color:#c2560c}',
P+'.trow small{color:var(--ink2)}',
P+'.trow.hot{background:linear-gradient(90deg,#fff1c4,#fff);box-shadow:inset 0 0 0 2px #f0b13a,0 3px 0 #e2c89e}',
P+'.trow.hot .ic{background:#ffe28a}',
/* игра: цель — табличка, помощники — леденцы */
P+'.chip{background:linear-gradient(180deg,#fff6df,#f3dcb2);color:var(--ink);box-shadow:0 3px 0 #a7663a,0 6px 10px rgba(50,25,10,.3),inset 0 2px 0 #fff}',
P+'.chip img,'+P+'.chip lk-i{background:#fff}',
P+'.chip.ok{background:linear-gradient(180deg,#e6f9d2,#bfe9a0);color:#1f5e22;box-shadow:0 3px 0 #2f8f2f,0 6px 10px rgba(30,80,20,.25),inset 0 2px 0 #fff}',
P+'.scl{color:#fff;text-shadow:0 2px 0 rgba(70,35,10,.65),0 0 10px rgba(70,35,10,.4)}',
P+'.scl small{color:#fff}',
P+'.movesl{color:#fff;text-shadow:0 1px 0 rgba(70,35,10,.75),0 0 6px rgba(70,35,10,.6),0 0 2px rgba(70,35,10,.8)}',
P+'.boost button{background:linear-gradient(180deg,#fffdf7,#f1dfc0);color:var(--ink);box-shadow:0 5px 0 #c9a77a,0 9px 14px rgba(60,30,10,.25),inset 0 2px 0 #fff}',
P+'.boost button i{background:linear-gradient(180deg,#ffb04a,#e2620f);box-shadow:0 2px 0 #9c3f06,0 0 0 2px #fff}',
P+'.boost button i.free{background:linear-gradient(180deg,#5cc451,#2a8a2a);box-shadow:0 2px 0 #1e6620,0 0 0 2px #fff}',
P+'.boost button.on{background:#fff3c4;box-shadow:0 0 0 3px #f0b13a,0 5px 0 #c9a77a}',
P+'.tip,'+P+'.gban{background:#fff8ec;box-shadow:0 0 0 3px #f0b13a,0 12px 26px rgba(60,30,10,.3)}',
/* окна */
P+'.card{background:linear-gradient(180deg,#fffaf0,#f8ead0);border-radius:28px;box-shadow:0 0 0 5px #fff,0 0 0 9px #e8b04a,0 22px 40px rgba(40,20,5,.5)}',
P+'.card.hasav:before{background:linear-gradient(180deg,#ffe9b8 0%,#fff3d8 60%,rgba(255,250,240,0) 100%)}',
P+'.card p{color:var(--ink2)}',
/* победа: лента с заголовком сверху, лучи за портретом */
P+'.card.win{display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-orient:vertical;-webkit-flex-direction:column;flex-direction:column}',
P+'.card.win>*{-webkit-flex-shrink:0;flex-shrink:0}',
P+'.card.win h2{-webkit-box-ordinal-group:0;-webkit-order:-1;order:-1;margin:18px -6px 0;padding:10px 12px 12px;border-radius:12px;color:#fff;background:linear-gradient(180deg,#ff8a4a 0,#e8582a 30%,#d94a1c 100%);box-shadow:0 5px 0 #a8380f,0 9px 14px rgba(120,40,10,.3);text-shadow:0 2px 0 #8a2a06;font-size:24px;text-align:center}',
P+'.card.win.hasav .av{margin-top:16px}',
P+'.card.win:after{top:160px}',
P+'.coins-won{color:#b86b00!important}',
P+'.quote{background:#fff;box-shadow:0 3px 0 #e2c89e;color:var(--ink)!important}',
P+'.goal.tipl,'+P+'.plq.ok{background:linear-gradient(90deg,#eaf8dc,#fff);color:#1f5e22!important;box-shadow:inset 0 0 0 1.5px #bfe3a0}',
P+'.plq{background:#fff;box-shadow:0 3px 0 #e2c89e}',
P+'.plq.gold{background:linear-gradient(90deg,#fff1c4,#fff);color:#7a4a00!important;box-shadow:inset 0 0 0 1.5px #f0c35a}',
P+'.aw{background:linear-gradient(180deg,#fffaf0,#ffe9b0);color:#6b4500;box-shadow:inset 0 0 0 1.5px #f0c35a,0 3px 0 #e2c89e}',
P+'.chbar{background:#e3c79c;box-shadow:inset 0 2px 2px rgba(80,40,10,.25)}',
P+'.chbar i{background:linear-gradient(180deg,#9be36a,#3fa33a)}',
P+'.set{background:#fff;box-shadow:0 3px 0 #e2c89e;color:var(--ink)}',
P+'.set i{background:linear-gradient(180deg,#5cc451,#2a8a2a);box-shadow:0 2px 0 #1e6620}',
P+'.set i.off{background:#e7d3b0;color:#6e4f33;box-shadow:none}',
P+'.set i.go{background:transparent;color:#c2560c;box-shadow:none}',
P+'.sd{background:#fff;box-shadow:0 3px 0 #e2c89e}',
P+'.sd.today{background:linear-gradient(180deg,#ffb04a,#ea6a15);box-shadow:0 4px 0 #a8420a}',
P+'.sd.d7{background:linear-gradient(180deg,#fff6d6,#ffe08a)}',
P+'.tabs2 button{background:#f1e2c6;color:var(--ink2)}',
P+'.tabs2 button.on{background:#fff;color:var(--ink);box-shadow:0 0 0 2px #f0b13a,0 3px 0 #e2c89e}',
P+'.it,'+P+'.thc{background:#fff;box-shadow:0 4px 0 #e2c89e,0 8px 16px rgba(60,30,10,.15)}',
P+'.it.on,'+P+'.thc.cur{box-shadow:0 0 0 3px #3fa33a,0 4px 0 #e2c89e}',
P+'.shop-pay{background:rgba(255,248,236,.95);box-shadow:0 5px 0 rgba(167,102,58,.5)}',
P+'.pan{background:#fff;box-shadow:0 3px 0 #e2c89e}',
P+'.rk{background:#fff4dc}',
P+'.rk.cur{background:linear-gradient(90deg,#fff1c4,#fff);box-shadow:inset 0 0 0 2px #f0b13a}',
P+'.lbr.me{background:#fff1c4}',
P+'.week .wd{background:#f1e2c6}',
P+'.toast{background:rgba(59,36,22,.95)}',
P+'.rec{background:linear-gradient(180deg,#ffe28a,#f3a81b);color:#5a3200}'
].join('\n');

LK.reg('a',{
  id:'a',pal:PAL,frK:.42,
  brick:function(g,x,y,s,col){if(col===20)return stone(g,x,y,s);candy(g,x,y,s,colOf(col));},
  board:board,
  empty:function(g,x,y,cs){empty(g,x,y,cs);},
  item:item,tray:tray,traySel:'rgba(255,214,102,.45)',
  fx:fx,fxMs:620,
  part:part,partCol:colOf,partN:6,
  text:text,
  conf:PAL.concat(['#fff']),
  comboCol:['#ff9a1e','#b4470a','#ffe7a0','#9c3006','#e2430c'],
  yard:yard,bgc:'#cfe6f2',
  map:MAPC,mapHtml:mapHtml,
  preview:preview,prev:{bg:'#9fd3ee',bg2:'#bdb7ae'},
  css:CSS
});
})();
