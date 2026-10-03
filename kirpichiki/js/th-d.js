/* K1: тема Д «Игрушечный двор» (id d) — всё из пластилина (макет release-f/kirp-look/e-clay.html).
   Кирпичик — матовая пухлая «подушечка»: свет слева-сверху, толстый низ, зерно и след пальца; старый кирпич — серый пластилин с трещиной и листиками.
   Поле — пластилиновая доска с толщиной и ямками; двор-диорама (дома-кубики, деревья-«леденцы», кот на лавочке, качалка-уточка) днём, вечером и ночью.
   «Чисто!» — кирпичик расплющивается, подпрыгивает и исчезает; разлетаются пластилиновые шарики (картинки в кэше); объёмные буквы — в кэше по тексту и размеру.
   Интерфейс — кнопки и окна «пластилин» в пастели (CSS ниже, только html.lk.th-d). Всё рисуется один раз в кэш; на кадр — только drawImage и простые заливки. */
(function(){
'use strict';
var W=window,DOC=document;
function DPR(){return Math.min(2,W.devicePixelRatio||1);}
function clamp(x){return x<0?0:x>1?1:x;}
function hex2(h){var n=parseInt(h.slice(1),16);return [n>>16,n>>8&255,n&255];}
function mixHex(h,k){var c=hex2(h);function f(v){return Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));}return '#'+c.map(function(v){return ('0'+f(v).toString(16)).slice(-2);}).join('');}
function RR(g,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function R0(s){s=s|0;return function(){s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function canvas(w,h){var c=DOC.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
function tod(){var h=new Date().getHours();return h>=6&&h<18?'day':h>=18&&h<22?'eve':'night';}

/* ---------- палитра: томат, абрикос, масло, горошек, бирюза, василёк, лаванда, розовый ---------- */
var PAL=['#f26b5b','#f7a543','#f2c73a','#8cc65a','#3fb5a5','#5b8fe8','#a383e0','#f285ad'],OLD='#b9ab9e';
function colOf(col){return col===20?OLD:PAL[((col|0)-1+80)%8];}

/* зерно пластилина и следы пальцев (одна текстура 64×64) */
var GRN=null;
function grain(){if(GRN)return GRN;var c=canvas(64,64),g=c.getContext('2d'),R=R0(77),i;
  for(i=0;i<170;i++){g.fillStyle=R()<.5?'rgba(255,255,255,.14)':'rgba(70,30,20,.08)';g.beginPath();g.arc(R()*64,R()*64,.5+R()*.9,0,7);g.fill();}
  g.strokeStyle='rgba(70,30,20,.07)';g.lineWidth=1;for(i=0;i<5;i++){g.beginPath();g.arc(20+R()*24,20+R()*24,6+i*3.5,R()*3,R()*3+2.4);g.stroke();}
  return GRN=c;}
/* отпечаток пальца: дуги-«бороздки» (свет над тенью — выдавлено вглубь) */
function thumb(g,cx,cy,s,a0){g.save();g.lineCap='round';g.lineWidth=Math.max(.7,s*.016);
  for(var i=0;i<3;i++){var r=s*(.07+i*.05);g.strokeStyle='rgba(255,255,255,.11)';g.beginPath();g.arc(cx-s*.008,cy-s*.012,r,a0,a0+2.3);g.stroke();
    g.strokeStyle='rgba(80,30,20,.065)';g.beginPath();g.arc(cx,cy,r,a0,a0+2.3);g.stroke();}
  g.restore();}

/* пластилиновая «подушечка» (рисуется один раз в кэш) */
function clay(g,x,y,s,c,seed){var m=s*.05,w=s-2*m,r=s*.34,gr;
  g.fillStyle='rgba(110,50,40,.22)';RR(g,x+m+s*.02,y+m+s*.07,w-s*.02,w-s*.02,r);g.fill();
  g.fillStyle=mixHex(c,-.25);RR(g,x+m,y+m+s*.045,w,w-s*.045,r);g.fill();
  gr=g.createRadialGradient(x+s*.34,y+s*.28,s*.04,x+s*.5,y+s*.5,s*.68);gr.addColorStop(0,mixHex(c,.42));gr.addColorStop(.45,c);gr.addColorStop(1,mixHex(c,-.16));
  g.fillStyle=gr;RR(g,x+m,y+m,w,w-s*.04,r);g.fill();
  g.save();RR(g,x+m,y+m,w,w-s*.04,r);g.clip();g.globalAlpha=.55;g.drawImage(grain(),x,y,s,s);g.globalAlpha=1;
  thumb(g,x+s*(.58+(seed%3)*.04),y+s*(.6+(seed%2)*.05),s,(seed*1.3)%6);g.restore();
  gr=g.createLinearGradient(0,y+m,0,y+m+w);gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(.25,'rgba(255,255,255,0)');gr.addColorStop(.8,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(60,20,10,.16)');
  g.fillStyle=gr;RR(g,x+m,y+m,w,w-s*.04,r);g.fill();
  gr=g.createRadialGradient(x+s*.32,y+s*.26,0,x+s*.32,y+s*.26,s*.3);gr.addColorStop(0,'rgba(255,255,255,.42)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.beginPath();g.arc(x+s*.32,y+s*.26,s*.3,0,7);g.fill();}
function oldBrick(g,x,y,s){clay(g,x,y,s,OLD,4);
  g.strokeStyle='rgba(80,60,50,.5)';g.lineWidth=Math.max(1.2,s*.05);g.lineCap='round';g.lineJoin='round';g.beginPath();
  g.moveTo(x+s*.3,y+s*.24);g.lineTo(x+s*.46,y+s*.44);g.lineTo(x+s*.38,y+s*.66);g.moveTo(x+s*.46,y+s*.44);g.lineTo(x+s*.72,y+s*.5);g.stroke();
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=Math.max(.8,s*.02);g.beginPath();g.moveTo(x+s*.32,y+s*.27);g.lineTo(x+s*.48,y+s*.47);g.stroke();
  // листики-пластилинки
  function leaf(cx,cy,a,c){g.save();g.translate(cx,cy);g.rotate(a);g.fillStyle=mixHex(c,-.25);g.beginPath();g.ellipse(0,s*.012,s*.085,s*.04,0,0,7);g.fill();g.fillStyle=c;g.beginPath();g.ellipse(0,0,s*.085,s*.04,0,0,7);g.fill();
    g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(-s*.02,-s*.012,s*.04,s*.014,0,0,7);g.fill();g.restore();}
  leaf(x+s*.66,y+s*.76,-.5,'#8cc65a');leaf(x+s*.79,y+s*.7,.7,'#76b84a');}

/* шарики (кэш по цвету и радиусу) */
var BALL={},BALLN=0;
function ball(c,z){var d=DPR(),k=c+'|'+z+'|'+d,b=BALL[k];if(b)return b;if(BALLN>160){BALL={};BALLN=0;}
  var n=z*2+4;b=canvas(n*d,n*d);var g=b.getContext('2d');g.scale(d,d);var o=z+1;
  g.fillStyle='rgba(110,50,40,.22)';g.beginPath();g.ellipse(o+z*.12,o+z*.62,z*.9,z*.42,0,0,7);g.fill();
  var gr=g.createRadialGradient(o-z*.4,o-z*.45,z*.1,o,o,z*1.05);gr.addColorStop(0,mixHex(c,.45));gr.addColorStop(.6,c);gr.addColorStop(1,mixHex(c,-.22));
  g.fillStyle=gr;g.beginPath();g.arc(o,o,z,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(o-z*.38,o-z*.4,z*.22,0,7);g.fill();
  b.o=o;b.n=n;BALL[k]=b;BALLN++;return b;}

/* объёмные пластилиновые буквы — в кэш по тексту/размеру/виду (без кэша макет тормозил) */
var TXC={clean:['#ffd9a0','#ff9a5a','#f06a45','#cf5a3e','#b8452f'],gold:['#fff1a8','#ffc93a','#f0a020','#d08418','#a8650c'],
  combo:['#ffc6dc','#f285ad','#e0567f','#c4476c','#9c3456'],rec:['#fff1a8','#ffc93a','#f0a020','#d08418','#a8650c'],pts:['#e2f7b8','#9fd86a','#6fbf45','#4f9a30','#3a7f24']};
var TX={},TXN=0;
function fontOk(){try{return !DOC.fonts||!DOC.fonts.check||DOC.fonts.check('800 20px KF');}catch(e){return true;}}
function drawWord(q,t,size,kind){var C=TXC[kind]||TXC.combo,D=size*(kind==='pts'?.1:.13),n=Math.max(4,Math.round(D)),i;
  q.font='800 '+size+'px KF,-apple-system,Roboto,sans-serif';q.textAlign='center';q.textBaseline='middle';q.lineJoin='round';
  q.fillStyle='rgba(110,40,30,.26)';q.fillText(t,size*.05,D+size*.12);
  q.strokeStyle='#fff7ec';q.lineWidth=size*.15;q.strokeText(t,0,D);q.strokeText(t,0,0);
  for(i=n;i>0;i--){q.fillStyle=i>n*.5?C[4]:C[3];q.fillText(t,0,i*D/n);}
  var gr=q.createLinearGradient(0,-size*.45,0,size*.4);gr.addColorStop(0,C[0]);gr.addColorStop(.5,C[1]);gr.addColorStop(1,C[2]);q.fillStyle=gr;q.fillText(t,0,0);
  q.save();q.globalAlpha=.35;q.fillStyle='#fff';q.beginPath();q.rect(-size*8,-size*.62,size*16,size*.36);q.clip();q.fillText(t,0,0);q.restore();}
function wordSpr(t,size,kind){var d=DPR(),key=t+'|'+size+'|'+kind+'|'+d,c=TX[key];if(c)return c;
  var m=canvas(4,4).getContext('2d');m.font='800 '+size+'px KF,-apple-system,Roboto,sans-serif';var w=m.measureText(t).width+size*.6,h=size*1.8;
  c=canvas(w*d,h*d);var q=c.getContext('2d');q.scale(d,d);q.translate(w/2,h*.4);drawWord(q,t,size,kind);c.w=w;c.h=h;c.oy=h*.4;
  if(fontOk()){if(TXN>90){TX={};TXN=0;}TX[key]=c;TXN++;}return c;}

/* ---------- двор-диорама: tod = day | eve | night (кэш) ---------- */
var YC={};
var YT={
 day:{sky:['#a9d8f5','#d9ecf4','#ffe6d6'],hill:['#cfe7c0','#bfe0ac'],gr:['#b8e48a','#8acb62'],pv:['#f5e3cb','#ead1b0'],pv2:'#f9ead6',pvs:'#d9b88e',cl:['#ffffff','#f4f1f8','#dcd6e8'],win:'#9fd0f0',lit:.2},
 eve:{sky:['#8d9fd9','#f0b6b4','#ffd7ae'],hill:['#d7cfae','#c3c596'],gr:['#a8d27e','#7fb85a'],pv:['#f3dcc4','#e4c6a6'],pv2:'#f7e3cc',pvs:'#cfa886',cl:['#fff3ea','#ffd9cc','#e8b8b4'],win:'#c9b6e0',lit:.45},
 night:{sky:['#26305e','#454a86','#6f6596'],hill:['#3f5866','#365060'],gr:['#5d8a62','#4a7552'],pv:['#a497aa','#8b7f98'],pv2:'#b2a6b8',pvs:'#7c708a',cl:['#7a7fae','#5f6596','#4b5084'],win:'#3c4878',lit:.55}};
function yard(t){if(!YT[t])t='day';if(YC[t])return YC[t];var P=YT[t],R=R0(31),night=t==='night',eve=t==='eve',lit=[];
 function g(id,a,b,c){return '<radialGradient id="'+id+'" cx=".3" cy=".25" r=".95"><stop offset="0" stop-color="'+a+'"/><stop offset=".6" stop-color="'+b+'"/><stop offset="1" stop-color="'+c+'"/></radialGradient>';}
 function lg(id,a,b){return '<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient>';}
 var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice"><defs>'+
 '<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+P.sky[0]+'"/><stop offset=".5" stop-color="'+P.sky[1]+'"/><stop offset=".8" stop-color="'+P.sky[2]+'"/></linearGradient>'+
 (night?g('tr','#8fbf86','#4f8a5a','#2f5a44')+g('tr2','#86b890','#467e5c','#2a5240'):g('tr','#c4eb8e','#7cc35a','#4f9a40')+g('tr2','#b3e3a0','#68b65a','#3f8a46'))+g('cl',P.cl[0],P.cl[1],P.cl[2])+
 (night?g('sun','#fffbe8','#fff0c0','#e8d49a'):eve?g('sun','#fff0c8','#ffc07a','#f59a5a'):g('sun','#fff7d0','#ffe08a','#ffc95a'))+
 lg('hA','#ffd9c4','#f4b49a')+lg('hB','#d8eedf','#a8d4bb')+lg('hC','#fff0c4','#f2d48a')+lg('rf','#f58a76','#d9604e')+lg('rf2','#7fb0e8','#5a8ad0')+
 '<radialGradient id="lmp"><stop offset="0" stop-color="#fff3c0" stop-opacity=".85"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+P.gr[0]+'"/><stop offset="1" stop-color="'+P.gr[1]+'"/></linearGradient>'+
 '<linearGradient id="pv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+P.pv[0]+'"/><stop offset="1" stop-color="'+P.pv[1]+'"/></linearGradient>'+
 '</defs><rect width="1200" height="800" fill="url(#sk)"/>';
 var i,x,y,r;
 if(night){for(i=0;i<46;i++){x=R()*1200;y=R()*330;r=1.5+R()*2.6;s+='<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="'+r.toFixed(1)+'" fill="'+(R()<.3?'#ffe8a0':'#fff')+'" opacity="'+(.55+R()*.45).toFixed(2)+'"/>';}
   s+='<circle cx="900" cy="130" r="80" fill="#fff6d0" opacity=".12"/><circle cx="900" cy="130" r="46" fill="url(#sun)"/><circle cx="886" cy="120" r="8" fill="#e6d49a" opacity=".7"/><circle cx="914" cy="146" r="6" fill="#e6d49a" opacity=".6"/><circle cx="906" cy="112" r="4" fill="#e6d49a" opacity=".6"/>';}
 else{var sx=eve?960:880,sy=eve?330:120;s+='<circle cx="'+sx+'" cy="'+sy+'" r="'+(eve?90:70)+'" fill="'+(eve?'#ffd8a8':'#fff3c4')+'" opacity=".6"/><circle cx="'+sx+'" cy="'+sy+'" r="'+(eve?56:48)+'" fill="url(#sun)"/>';}
 function cloud(x,y,k){return '<ellipse cx="'+x+'" cy="'+(y+26*k)+'" rx="'+80*k+'" ry="'+10*k+'" fill="#9fb8d0" opacity=".25"/><circle cx="'+(x-40*k)+'" cy="'+y+'" r="'+28*k+'" fill="url(#cl)"/><circle cx="'+x+'" cy="'+(y-14*k)+'" r="'+40*k+'" fill="url(#cl)"/><circle cx="'+(x+42*k)+'" cy="'+y+'" r="'+30*k+'" fill="url(#cl)"/><rect x="'+(x-68*k)+'" y="'+y+'" width="'+136*k+'" height="'+28*k+'" rx="'+14*k+'" fill="url(#cl)"/>';}
 s+='<g opacity="'+(night?.55:1)+'">'+cloud(230,130,1.1)+cloud(620,80,.8)+cloud(1070,190,1)+'</g>';
 s+='<path d="M0 470q150-90 300-20t300-10 300 0 300-30V600H0z" fill="'+P.hill[0]+'"/><path d="M0 500q200-60 400 0t400-10 400 10V600H0z" fill="'+P.hill[1]+'"/>';
 function house(x,y,w,h,wid,roof,cols,rows){var t='<ellipse cx="'+(x+w/2)+'" cy="'+(y+h+6)+'" rx="'+(w*.55)+'" ry="16" fill="#5a7a40" opacity=".22"/><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="26" fill="url(#'+wid+')"/>'+
   '<rect x="'+(x-10)+'" y="'+(y-26)+'" width="'+(w+20)+'" height="42" rx="21" fill="url(#'+roof+')"/><rect x="'+(x+10)+'" y="'+(y-20)+'" width="'+(w*.5)+'" height="10" rx="5" fill="#fff" opacity=".35"/>';
   var cw=(w-40)/cols;for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var wx=x+20+c*cw+cw*.18,wy=y+30+r*52,ww=cw*.64,on=R()<P.lit,lc=R()<.5?'#ffe08a':'#ffd06a';
     t+='<rect x="'+wx.toFixed(1)+'" y="'+wy+'" width="'+ww.toFixed(1)+'" height="34" rx="12" fill="#fff"/><rect x="'+(wx+4).toFixed(1)+'" y="'+(wy+4)+'" width="'+(ww-8).toFixed(1)+'" height="26" rx="9" fill="'+(on?lc:P.win)+'"/>'+(on?'':'<circle cx="'+(wx+10).toFixed(1)+'" cy="'+(wy+11)+'" r="3.5" fill="#fff" opacity=".7"/>');
     if(on&&night)lit.push([wx+4,wy+4,ww-8,lc]);
     if(R()<.3)t+='<rect x="'+(wx-3).toFixed(1)+'" y="'+(wy+34)+'" width="'+(ww+6).toFixed(1)+'" height="9" rx="4.5" fill="#c47f54"/><circle cx="'+(wx+8).toFixed(1)+'" cy="'+(wy+33)+'" r="5" fill="#f26b5b"/><circle cx="'+(wx+ww/2).toFixed(1)+'" cy="'+(wy+32)+'" r="5" fill="#f6cf4a"/><circle cx="'+(wx+ww-8).toFixed(1)+'" cy="'+(wy+33)+'" r="5" fill="#f285ad"/>';}
   return t;}
 s+=house(10,330,420,250,'hA','rf',5,4)+house(770,320,420,260,'hB','rf2',5,4)+house(470,410,240,170,'hC','rf',3,2);
 [[120,'#5b8fe8'],[320,'#43b8a8'],[880,'#f26b5b'],[1080,'#a383e0']].forEach(function(q){var x=q[0];s+='<rect x="'+(x-30)+'" y="520" width="60" height="64" rx="18" fill="'+q[1]+'"/><rect x="'+(x-38)+'" y="508" width="76" height="18" rx="9" fill="#fff"/><circle cx="'+(x+14)+'" cy="556" r="3.5" fill="#fff"/>';
   if(night||eve)lit.push(['lamp',x,500]);});
 s+='<path d="M-20 585q620-24 1240 0v60H-20z" fill="url(#gr)"/>';
 s+='<rect x="-20" y="640" width="1240" height="190" fill="url(#pv)"/><path d="M-20 640q620 12 1240 0" stroke="#fff" stroke-width="6" opacity="'+(night?.25:.55)+'" fill="none"/>';
 for(i=0;i<26;i++){x=R()*1200;y=665+R()*120;r=12+R()*20;s+='<ellipse cx="'+x.toFixed(0)+'" cy="'+(y+4).toFixed(0)+'" rx="'+r.toFixed(0)+'" ry="'+(r*.42).toFixed(0)+'" fill="'+P.pvs+'" opacity=".55"/><ellipse cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" rx="'+r.toFixed(0)+'" ry="'+(r*.4).toFixed(0)+'" fill="'+P.pv2+'"/>';}
 function tree(x,y,k,gid){return '<ellipse cx="'+x+'" cy="'+(y+6)+'" rx="'+46*k+'" ry="'+12*k+'" fill="#3f6a30" opacity=".25"/><rect x="'+(x-9*k)+'" y="'+(y-80*k)+'" width="'+18*k+'" height="'+86*k+'" rx="'+9*k+'" fill="#b07a52"/><circle cx="'+x+'" cy="'+(y-130*k)+'" r="'+78*k+'" fill="url(#'+gid+')"/><ellipse cx="'+(x-26*k)+'" cy="'+(y-168*k)+'" rx="'+22*k+'" ry="'+12*k+'" fill="#fff" opacity=".28" transform="rotate(-30 '+(x-26*k)+' '+(y-168*k)+')"/>';}
 s+=tree(60,600,1.05,'tr')+tree(560,598,.9,'tr2')+tree(690,600,.75,'tr')+tree(1150,600,1.05,'tr2');
 [[250,1],[420,.8],[820,.9],[980,1.1]].forEach(function(q){var x=q[0],k=q[1];s+='<ellipse cx="'+x+'" cy="604" rx="'+40*k+'" ry="'+9*k+'" fill="#3f6a30" opacity=".22"/><circle cx="'+(x-22*k)+'" cy="585" r="'+22*k+'" fill="url(#tr2)"/><circle cx="'+(x+18*k)+'" cy="583" r="'+24*k+'" fill="url(#tr)"/><circle cx="'+x+'" cy="570" r="'+26*k+'" fill="url(#tr)"/>';});
 // горка, качалка-уточка на пружинке, кот на лавочке
 s+='<g transform="translate(905 640)"><ellipse cx="0" cy="40" rx="70" ry="10" fill="#9a7a50" opacity=".25"/><rect x="-40" y="-70" width="16" height="110" rx="8" fill="#5b8fe8"/><rect x="-10" y="-70" width="16" height="110" rx="8" fill="#5b8fe8"/><path d="M-30-60h40v14h-40z" fill="#f6cf4a"/><path d="M6-60q60 40 60 96" stroke="#f26b5b" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M10-56q50 34 52 86" stroke="#ffb0a4" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/></g>';
 s+='<g transform="translate(300 700)"><ellipse cx="0" cy="34" rx="44" ry="8" fill="#9a7a50" opacity=".25"/><path d="M0 34v-30" stroke="#8a8a9a" stroke-width="5" stroke-dasharray="4 3"/><ellipse cx="2" cy="-8" rx="38" ry="18" fill="#f6cf4a"/><path d="M36-14q14-4 10 10z" fill="#f6cf4a"/><circle cx="-24" cy="-28" r="14" fill="#f6cf4a"/><path d="M-38-28l-14 4 14 5z" fill="#f7a543"/><circle cx="-27" cy="-32" r="3" fill="#4a2f3a"/><ellipse cx="6" cy="-14" rx="18" ry="7" fill="#fff" opacity=".35"/><ellipse cx="4" cy="-4" rx="16" ry="7" fill="#e8b830"/></g>';
 s+='<g transform="translate(150 690)"><ellipse cx="0" cy="40" rx="66" ry="9" fill="#9a7a50" opacity=".25"/><rect x="-60" y="0" width="120" height="16" rx="8" fill="#e0a070"/><rect x="-60" y="-22" width="120" height="14" rx="7" fill="#eab084"/><rect x="-50" y="14" width="10" height="24" rx="5" fill="#7d6a64"/><rect x="40" y="14" width="10" height="24" rx="5" fill="#7d6a64"/><ellipse cx="18" cy="-6" rx="24" ry="14" fill="#f7a543"/><circle cx="36" cy="-16" r="12" fill="#f7a543"/><path d="M30-26l2-9 6 6zM40-27l4-8 3 9z" fill="#f7a543"/><path d="M-6-4q-14-6-10-20" stroke="#f7a543" stroke-width="6" fill="none" stroke-linecap="round"/>'+
   (night?'<path d="M31-17q3 2 6 0M39-17q3 2 6 0" stroke="#4a2f3a" stroke-width="1.8" fill="none" stroke-linecap="round"/>':'<circle cx="33" cy="-17" r="1.8" fill="#4a2f3a"/><circle cx="41" cy="-17" r="1.8" fill="#4a2f3a"/>')+'</g>';
 // вечер — тёплый свет; ночь — затемнение, потом поверх светящиеся окна и фонари
 if(eve)s+='<rect width="1200" height="800" fill="#ff9a6a" opacity=".08"/>';
 if(night){s+='<rect y="300" width="1200" height="500" fill="#1d2550" opacity=".3"/>';
   lit.forEach(function(q){if(q[0]==='lamp')return;s+='<rect x="'+q[0].toFixed(1)+'" y="'+q[1]+'" width="'+q[2].toFixed(1)+'" height="26" rx="9" fill="'+q[3]+'"/>';});}
 if(night||eve){lit.forEach(function(q){if(q[0]!=='lamp')return;s+='<circle cx="'+q[1]+'" cy="'+(q[2]+20)+'" r="'+(night?60:44)+'" fill="url(#lmp)" opacity="'+(night?.85:.6)+'"/><circle cx="'+q[1]+'" cy="'+q[2]+'" r="6" fill="#fff3c0"/>';});
   [[460,640],[1000,640]].forEach(function(q){s+='<rect x="'+(q[0]-5)+'" y="'+(q[1]-140)+'" width="10" height="140" rx="5" fill="#6a6f8f"/><circle cx="'+q[0]+'" cy="'+(q[1]-146)+'" r="14" fill="#fff3c0"/><circle cx="'+q[0]+'" cy="'+(q[1]-130)+'" r="'+(night?120:80)+'" fill="url(#lmp)" opacity="'+(night?.8:.5)+'"/>';});}
 return YC[t]=s+'</svg>';}

/* ---------- набор темы ---------- */
var KIT={
 id:'d',pal:PAL,frK:.36,
 brick:function(g,x,y,s,col){if(col===20)return oldBrick(g,x,y,s);clay(g,x,y,s,colOf(col),col|0);},
 // доска: (0,0) — левый верх рамки; толщина снизу, тёплое зерно, светлая кромка
 board:function(g,B,cs,fr,Bh){var S=B+2*fr,H=(Bh||B)+2*fr,rad=Math.min(S,H)*.08,th=Math.max(5,S*.028),gr;
   g.fillStyle='rgba(110,50,40,.22)';RR(g,S*.01,th*1.6,S*.98,H,rad);g.fill();
   g.fillStyle='#dcb48a';RR(g,0,th,S,H,rad);g.fill();
   gr=g.createRadialGradient(S*.3,H*.22,S*.05,S*.5,H*.5,Math.max(S,H)*.8);gr.addColorStop(0,'#fff6e8');gr.addColorStop(.6,'#f6e2c6');gr.addColorStop(1,'#ecd0aa');g.fillStyle=gr;RR(g,0,0,S,H,rad);g.fill();
   g.save();RR(g,0,0,S,H,rad);g.clip();g.globalAlpha=.3;var gn=grain();for(var i=0;i<Math.ceil(S/64)+1;i++)for(var j=0;j<Math.ceil(H/64)+1;j++)g.drawImage(gn,i*64,j*64);g.globalAlpha=1;
   g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=Math.max(2,S*.008);RR(g,2,2,S-4,H-4,rad);g.stroke();g.restore();},
 // ямка в доске: тень сверху-слева, свет снизу-справа
 empty:function(g,x,y,cs){var m=cs*.08,w=cs-2*m,gr;
   gr=g.createLinearGradient(x,y,x+w,y+w);gr.addColorStop(0,'rgba(150,95,55,.34)');gr.addColorStop(1,'rgba(150,95,55,.06)');g.fillStyle=gr;RR(g,x+m,y+m,w,w,cs*.32);g.fill();
   gr=g.createRadialGradient(x+cs*.58,y+cs*.62,cs*.05,x+cs*.5,y+cs*.55,cs*.42);gr.addColorStop(0,'rgba(255,248,236,.95)');gr.addColorStop(1,'rgba(246,226,198,.2)');g.fillStyle=gr;RR(g,x+m+cs*.035,y+m+cs*.045,w-cs*.05,w-cs*.06,cs*.3);g.fill();},
 // жетон предмета: пластилиновая лепёшка
 item:function(g,k,x,y,s){var cx=x+s*.5,cy=y+s*.46,r=s*.3,gr;g.fillStyle='rgba(110,50,40,.25)';g.beginPath();g.arc(cx,cy+s*.04,r,0,7);g.fill();
   gr=g.createRadialGradient(cx-r*.4,cy-r*.45,r*.1,cx,cy,r*1.1);gr.addColorStop(0,'#fffdf8');gr.addColorStop(1,'#ecdcc8');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
   var im=typeof ITEM_IMG!=='undefined'&&ITEM_IMG[k];if(im&&im.complete&&im.naturalWidth)g.drawImage(im,cx-r*.82,cy-r*.82,r*1.64,r*1.64);},
 // лоток: пластилиновая дощечка
 tray:function(g,x,y,w,h){var r=Math.min(30,h*.25),gr;g.fillStyle='rgba(120,60,50,.16)';RR(g,x+2,y+12,w-4,h-4,r);g.fill();
   g.fillStyle='rgba(226,194,160,.92)';RR(g,x,y+6,w,h-6,r);g.fill();
   gr=g.createLinearGradient(x,y,x+w*.3,y+h);gr.addColorStop(0,'rgba(255,250,242,.9)');gr.addColorStop(1,'rgba(246,227,204,.86)');g.fillStyle=gr;RR(g,x,y,w,h-6,r);g.fill();
   g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;RR(g,x+2,y+2,w-4,h-10,r-2);g.stroke();},
 traySel:'rgba(255,190,130,.45)',
 // сбор клетки: расплющился (как под пальцем) → подпрыгнул → исчез; вмятина на месте
 fx:function(g,x,y,cs,col,it,e,draw){var k=clamp(e/.85);
   if(e<.5){g.fillStyle='rgba(150,95,55,'+(.22*(1-e/.5)).toFixed(3)+')';g.beginPath();g.ellipse(x+cs/2,y+cs*.86,cs*.42,cs*.1,0,0,7);g.fill();}
   if(k>=1)return;var q=.4,sq=k<q?Math.sin(k/q*Math.PI/2):1,sy=1-.42*sq+(k>q?.95*(k-q):0),sx=1+.3*sq-(k>q?.5*(k-q):0),jump=k>q?-cs*.9*Math.sin((k-q)/(1-q)*Math.PI):0;
   g.save();g.globalAlpha=k>.6?1-(k-.6)/.4:1;g.translate(x+cs/2,y+cs*.95+jump);g.scale(sx,sy);draw(-cs/2,-cs*.95);g.restore();},
 fxMs:650,
 partCol:colOf,partN:5,
 // частицы: пластилиновые шарики (картинки из кэша); «искра» — шарик-масло
 part:function(g,p,x,y){var z=Math.max(2,Math.round(p.s*(p.t===1?.85:1.15))),b=ball(p.t===1?'#f6cf4a':p.c,z);g.drawImage(b,x-b.o,y-b.o,b.n,b.n);},
 text:function(g,t,size,kind){var c=wordSpr(String(t),Math.round(size),kind);g.drawImage(c,-c.w/2,-c.oy,c.w,c.h);},
 conf:PAL,
 comboCol:['#ffd36a','#f7a543','#fff4dc','#f26b5b','#e0567f'],
 yard:yard,
 map:{bg:'#b6df8e',stripe:'',edge:'#d2a676',path:'#f3dcbc',mid:'#fff6e6',crown:['#c4eb8e','#7cc35a','#4f9a40'],ink:'#4a2f3a',ink2:'#7a5a64',done:'#f6e3cc',doneTx:'#8a5a3a',cur:['#ffc0a8','#f2785e','#d9533e'],lockTx:'#8a7a6e',flower:'#f7a543',ring:'#f29b7e'},
 // карта — общая дорожка, но «колбаской» с толщиной и пятнами газона
 mapHtml:function(){var f=KIT.mapHtml,m;KIT.mapHtml=null;try{m=LK.mapHtml();}finally{KIT.mapHtml=f;}
   var s=m.svg,H=+((s.match(/viewBox="0 0 \d+ (\d+)"/)||[])[1]||2000),R=R0(12),b='';
   for(var i=0;i<H/40;i++){var x=R()*400,y=R()*H,r=30+R()*60;b+='<ellipse cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" rx="'+r.toFixed(0)+'" ry="'+(r*.5).toFixed(0)+'" fill="'+(R()<.5?'#c4e89c':'#a8d67e')+'" opacity=".7"/>';}
   s=s.replace(/(<rect width="400" height="\d+" fill="#b6df8e"\/>)/,'$1'+b);
   s=s.replace(/<path d="([^"]+)" stroke="#d2a676" stroke-width="58" fill="none" stroke-linecap="round" opacity="\.6"\/>/,function(_,d){
     return '<path d="'+d+'" stroke="#6c9a48" stroke-width="54" fill="none" stroke-linecap="round" opacity=".35" transform="translate(4 10)"/><path d="'+d+'" stroke="#d2a676" stroke-width="48" fill="none" stroke-linecap="round" transform="translate(0 7)"/>';});
   s=s.replace(/<circle cx="([\d.]+)" cy="([\d.]+)" r="22" fill="rgba\(255,255,255,\.3\)" stroke="#fff" stroke-width="3" stroke-dasharray="5 5"\/>/g,function(_,x,y){
     return '<circle cx="'+x+'" cy="'+(+y+4)+'" r="22" fill="#c9bdaf" opacity=".8"/><circle cx="'+x+'" cy="'+y+'" r="22" fill="url(#dlk)" opacity=".85"/>';});
   s=s.replace('</defs>','<radialGradient id="dlk" cx=".32" cy=".28" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f1ece6"/><stop offset="1" stop-color="#e0d6cc"/></radialGradient></defs>');
   var fl='',FC=['#f26b5b','#f2c73a','#ffffff','#a383e0','#f285ad'];for(i=0;i<H/45;i++){var fx=R()*400,fy=R()*H,c=FC[i%5];fl+='<circle cx="'+fx.toFixed(0)+'" cy="'+(fy+3).toFixed(0)+'" r="6" fill="#5f9a38" opacity=".35"/>';
     for(var k=0;k<5;k++)fl+='<circle cx="'+(fx+Math.cos(k*1.256)*5).toFixed(1)+'" cy="'+(fy+Math.sin(k*1.256)*5).toFixed(1)+'" r="3.6" fill="'+c+'"/>';fl+='<circle cx="'+fx.toFixed(0)+'" cy="'+fy.toFixed(0)+'" r="2.6" fill="#f7a543"/>';}
   s=s.replace(/(<path d="[^"]+" stroke="#6c9a48")/,fl+'$1');
   s=s.replace(/stroke="#fff6e6" stroke-width="20" fill="none" stroke-linecap="round" opacity="\.7"/,'stroke="#fff6e6" stroke-width="10" fill="none" stroke-linecap="round" opacity=".75" transform="translate(-8 -6)"');
   return {svg:s,tot:m.tot,y:m.y};},
 prev:{bg2:'#b8e48a'}
};
// цвет вокруг двора — по времени суток
try{Object.defineProperty(KIT,'bgc',{enumerable:true,get:function(){var t=tod();return t==='night'?'#26305e':t==='eve'?'#8d9fd9':'#a9d8f5';}});}catch(e){KIT.bgc='#a9d8f5';}

/* ---------- CSS темы: пластилин в пастели ---------- */
var P='html.lk.th-d ';
function CL(c1,c2,cb,r){return 'background:linear-gradient(160deg,'+c1+','+c2+');box-shadow:0 6px 0 '+cb+',0 12px 18px rgba(120,60,50,.2),inset 3px 4px 6px rgba(255,255,255,.8),inset -3px -5px 8px rgba(160,100,70,.14)'+(r?';border-radius:'+r:'');}
function CLA(cb){return 'transform:translateY(4px);box-shadow:0 2px 0 '+cb+',0 4px 8px rgba(120,60,50,.2),inset 3px 4px 6px rgba(255,255,255,.7),inset -3px -5px 8px rgba(160,100,70,.14)';}
var EXW='color:#fff;text-shadow:0 1px 0 #e0866f,0 2px 0 #d57a64,0 3px 0 #c96e5a,0 4px 0 #bd6250,0 7px 8px rgba(120,50,40,.3)';
var CRM=CL('#fff7ec','#f6e3cc','#e2c2a0'),CARD=CL('#fffaf2','#f7e6d0','#e2c2a0');
var SH2=',0 12px 18px rgba(120,60,50,.2),inset 3px 4px 6px rgba(255,255,255,.8),inset -3px -5px 8px rgba(160,100,70,.14)';
var css=[
'html.lk.th-d{--ink:#4a2f3a;--ink2:#7a5a64;--muted:#7a5a64;--card:#fffaf2;--card2:#f8ecdc;--line:#ecd6bd;--glass:rgba(255,248,238,.95);--glass2:rgba(255,248,238,.85);'+
' --acc1:#ffa98e;--acc:#f2785e;--acc2:#d9533e;--good1:#a6e070;--good:#76c04a;--good2:#4f9a30;--blue1:#a9cdf8;--blue:#6a9be8;--blue2:#4a78c8;'+
' --gold:#f0a020;--gold2:#d98a1a;--red:#e0664f;--mint:#eef8e2;--mintL:#cfe8b6;--sh:rgba(120,60,50,.2);--dim:rgba(90,45,55,.45);--r:24px}',
/* кнопки */
P+'.btn{'+CRM+';border-radius:26px;color:var(--ink);font-weight:800}',
P+'.btn:active{'+CLA('#e2c2a0')+'}',
P+'.btn.green{color:#fff;background:linear-gradient(160deg,#a6e070,#5fae3c);box-shadow:0 7px 0 #3f8a2a,0 14px 20px rgba(60,120,30,.3),inset 3px 4px 6px rgba(255,255,255,.5),inset -3px -5px 8px rgba(30,80,10,.2);text-shadow:0 1px 0 #4f9a30,0 2px 0 #46902a,0 3px 0 #3f8a2a,0 5px 6px rgba(20,60,10,.3)}',
P+'.btn.green:active{transform:translateY(4px);box-shadow:0 3px 0 #3f8a2a,0 6px 10px rgba(60,120,30,.3),inset 3px 4px 6px rgba(255,255,255,.45)}',
P+'.btn.accent{color:#fff;background:linear-gradient(160deg,#ffa98e,#f06a55);box-shadow:0 7px 0 #c64a3a,0 14px 20px rgba(120,40,30,.3),inset 3px 4px 6px rgba(255,255,255,.45),inset -3px -5px 8px rgba(120,30,20,.18);text-shadow:0 1px 0 #d55a46,0 2px 0 #c95040,0 3px 0 #bd4838,0 5px 6px rgba(90,20,10,.3)}',
P+'.btn.accent:active{transform:translateY(4px);box-shadow:0 3px 0 #c64a3a,0 6px 10px rgba(120,40,30,.3),inset 3px 4px 6px rgba(255,255,255,.4)}',
P+'.btn.blue{color:#fff;background:linear-gradient(160deg,#9cc6f8,#5b8fe8);box-shadow:0 7px 0 #3f6fc0,0 14px 20px rgba(40,70,140,.3),inset 3px 4px 6px rgba(255,255,255,.45),inset -3px -5px 8px rgba(20,40,110,.18);text-shadow:0 1px 0 #4f80d6,0 2px 0 #4676cc,0 3px 0 #3f6fc0,0 5px 6px rgba(20,40,90,.3)}',
P+'.btn.blue:active{transform:translateY(4px);box-shadow:0 3px 0 #3f6fc0,0 6px 10px rgba(40,70,140,.3),inset 3px 4px 6px rgba(255,255,255,.4)}',
P+'#bPlay{text-shadow:0 1px 0 #4f9a30,0 2px 0 #46902a,0 3px 0 #3f8a2a,0 5px 6px rgba(20,60,10,.3);background:linear-gradient(160deg,#a6e070,#5fae3c);box-shadow:0 8px 0 #3f8a2a,0 16px 22px rgba(60,120,30,.3),inset 3px 4px 6px rgba(255,255,255,.5),inset -3px -5px 8px rgba(30,80,10,.2)}',
P+'#bDaily{background:linear-gradient(160deg,#ffcf86,#f7a543);box-shadow:0 8px 0 #c97a22,0 16px 22px rgba(150,80,20,.3),inset 3px 4px 6px rgba(255,255,255,.5),inset -3px -5px 8px rgba(130,60,10,.18);text-shadow:0 1px 0 #e08a2a,0 2px 0 #d6822a,0 3px 0 #c97a22,0 5px 6px rgba(100,50,10,.3)}',
P+'.big{border-radius:32px;margin-bottom:6px}',
P+'.big .ic{background:rgba(255,255,255,.3);box-shadow:inset 2px 3px 4px rgba(255,255,255,.55),inset -2px -3px 4px rgba(0,0,0,.08)}',
P+'.icon{'+CRM+';border-radius:20px;width:52px;height:52px}',
P+'.gh .icon{width:52px;height:52px}',
P+'.icon:active{'+CLA('#e2c2a0')+'}',
P+'.pill{'+CRM+';border-radius:23px}',
/* шапки и заголовки: объёмные белые буквы */
P+'.gt>div:first-child{'+EXW+'}',
P+'.gh .sub{color:var(--ink2);text-shadow:0 0 6px #fff7ec,0 0 3px #fff7ec}',
P+'.logo{'+EXW+';font-size:26px}',
'@media (max-width:430px){'+P+'.logo{font-size:22px}}','@media (max-width:370px){'+P+'.logo{font-size:18px}}',
P+'.logo small{color:#f06a55;text-shadow:0 1px 0 #fff7ec,0 0 8px #fff7ec}',
P+'#scr-map .gh{background:linear-gradient(180deg,rgba(169,216,245,.97),rgba(200,230,245,.92));box-shadow:0 6px 0 rgba(140,190,220,.5),0 10px 18px rgba(80,60,60,.12)}',
/* меню */
P+'.hsay{'+CL('#fffaf3','#fdf0e1','#e8cfb2')+';border-radius:22px}',
P+'.hsay b{color:#e0664f}',
P+'.hface,'+P+'.hav,'+P+'.card .av{background:linear-gradient(160deg,#ffc9a8,#f29b7e);box-shadow:0 6px 0 #d27a60,0 12px 18px rgba(120,60,50,.25),inset 3px 4px 6px rgba(255,255,255,.7),inset -3px -4px 6px rgba(140,60,40,.2)}',
P+'.hface svg,'+P+'.hav svg,'+P+'.card .av svg{border-color:#fff8ee;box-shadow:inset 0 3px 6px rgba(0,0,0,.2)}',
P+'.nrow .btn{'+CRM+';border-radius:24px}',
P+'.nrow .btn:active{'+CLA('#e2c2a0')+'}',
P+'.today,'+P+'.kcard{'+CARD+';border-radius:28px;padding-bottom:8px}',
P+'.trow{background:linear-gradient(160deg,#fffdf8,#f9eedf);border-radius:20px;box-shadow:0 4px 0 #ead2b6,inset 2px 3px 4px rgba(255,255,255,.9),inset -2px -3px 5px rgba(160,100,70,.1);margin-bottom:10px}',
P+'.trow .ic{background:radial-gradient(circle at 35% 30%,#ffffff,#f1e3cf);box-shadow:0 3px 0 #e2c8a8}',
P+'.trow.hot{background:linear-gradient(160deg,#fff6cf,#ffe28a);box-shadow:0 4px 0 #e0b852,inset 2px 3px 4px rgba(255,255,255,.8)}',
P+'.trow.hot .ic{background:radial-gradient(circle at 35% 30%,#fffbe6,#ffd76a);box-shadow:0 3px 0 #d8aa40}',
P+'.trow i{color:var(--good2)}',
P+'.btn .dot{background:#f06a55}',
/* игра */
P+'.chip{'+CRM+';border-radius:23px}',
P+'.chip img,'+P+'.chip lk-i{background:#fff1e0}',
P+'.chip.ok{background:linear-gradient(160deg,#eaf8d6,#c9eaa6);color:#2f6a1e;box-shadow:0 5px 0 #9fcb7a,0 10px 14px rgba(60,120,30,.18),inset 3px 4px 6px rgba(255,255,255,.7)}',
P+'.scl{color:var(--ink);text-shadow:0 1px 0 #fff7ec,0 0 10px #fff7ec,0 0 4px #fff7ec}',
P+'.movesl{color:var(--ink2);text-shadow:0 0 6px #fff7ec,0 0 3px #fff7ec,0 0 2px #fff7ec}',
P+'.bub{'+CL('#fffaf3','#fdf0e1','#e8cfb2')+';border-radius:22px}',
P+'.bub::before{border-right-color:#fff8ee}',
P+'.tip,'+P+'.gban{'+CARD+';border-radius:24px}',
P+'.boost button{'+CRM+';border-radius:24px}',
P+'.boost button[data-b=hint]{background:linear-gradient(160deg,#fff6cf,#ffe28a);box-shadow:0 6px 0 #e0b852'+SH2+'}',
P+'.boost button[data-b=rot]{background:linear-gradient(160deg,#e6f1ff,#bcd6ff);box-shadow:0 6px 0 #8eaee6'+SH2+'}',
P+'.boost button[data-b=new]{background:linear-gradient(160deg,#ffe9f1,#ffc4d9);box-shadow:0 6px 0 #e597b4'+SH2+'}',
P+'.boost button[data-b=bomb]{background:linear-gradient(160deg,#f0eaff,#d4c6f6);box-shadow:0 6px 0 #a998d6'+SH2+'}',
P+'.boost button:active{transform:translateY(4px)}',
P+'.boost button lk-i{background:rgba(255,255,255,.45)!important;box-shadow:inset 2px 2px 3px rgba(255,255,255,.6)}',
P+'.boost button i{background:linear-gradient(160deg,#ffa36b,#f0663f);box-shadow:0 3px 0 #c04a28,inset 2px 2px 3px rgba(255,255,255,.5)}',
P+'.boost button i.free{background:linear-gradient(160deg,#9fd86a,#5fae3c);box-shadow:0 3px 0 #3f8a2a,inset 2px 2px 3px rgba(255,255,255,.5)}',
P+'.boost button.on{box-shadow:0 0 0 4px #f6c43a,0 6px 0 #e0b852,0 12px 18px rgba(120,60,50,.2)}',
/* магазин и карточки */
P+'.it{'+CARD+';border-radius:24px}',
P+'.it.on{box-shadow:0 0 0 3px var(--good),0 6px 0 #e2c2a0,0 12px 18px rgba(120,60,50,.2)}',
P+'.shop-pay{'+CARD+';border-radius:24px}',
P+'.thc{'+CARD+';border-radius:22px}',
P+'.thc.cur{box-shadow:0 0 0 3px var(--good),0 6px 0 #e2c2a0,0 12px 18px rgba(120,60,50,.2)}',
/* окна: пластилиновая карточка; заголовок победы — объёмная лента */
P+'.card{background:linear-gradient(160deg,#fffaf2,#f7e6d0);border-radius:36px;box-shadow:0 10px 0 #e2c2a0,0 30px 50px rgba(80,30,30,.42),inset 4px 5px 8px rgba(255,255,255,.9),inset -4px -6px 10px rgba(160,100,70,.14)}',
P+'.card.hasav:before{background:linear-gradient(180deg,#ffe0cc 0%,#fff1e4 60%,rgba(255,250,242,0) 100%)}',
P+'.card.win h2{font-size:24px;display:block;margin:6px 2px 12px;padding:9px 14px 11px;border-radius:28px;background:linear-gradient(160deg,#ff9a7e,#f06a55);'+
  'box-shadow:0 7px 0 #c64a3a,0 12px 16px rgba(120,40,30,.28),inset 3px 4px 6px rgba(255,255,255,.45),inset -3px -5px 8px rgba(120,30,20,.18);color:#fff;'+
  'text-shadow:0 1px 0 #d55a46,0 2px 0 #c95040,0 3px 0 #bd4838,0 5px 6px rgba(90,20,10,.35)}',
P+'.big-stars .e{color:#ead2b6}',
P+'.coins-won{color:#e08a20!important;text-shadow:0 2px 0 #f6d6a8}',
P+'.quote{background:linear-gradient(160deg,#fff4e6,#fde8d2);box-shadow:0 4px 0 #ecd0b0,inset 2px 3px 4px rgba(255,255,255,.8);border-radius:20px}',
P+'.goal.tipl,'+P+'.plq.ok{background:linear-gradient(160deg,#f3fbe6,#dcf0c4);box-shadow:0 4px 0 #b6d697,inset 2px 3px 4px rgba(255,255,255,.8);color:#2f6a1e!important;border-radius:20px}',
P+'.goal.tmrw,'+P+'.plq.info{background:linear-gradient(160deg,#eef5ff,#d6e6fb);box-shadow:0 4px 0 #a9c4e8,inset 2px 3px 4px rgba(255,255,255,.8);color:#2a4f7a!important;border-radius:20px}',
P+'.plq{background:linear-gradient(160deg,#fffaf3,#f6e8d6);box-shadow:0 4px 0 #e6ccae,inset 2px 3px 4px rgba(255,255,255,.8);border-radius:20px}',
P+'.plq.gold{background:linear-gradient(160deg,#fff7d6,#ffe6a0);box-shadow:0 4px 0 #e6c060,inset 2px 3px 4px rgba(255,255,255,.8);color:#6e4300!important}',
P+'.plq.warn{background:linear-gradient(160deg,#ffeef0,#ffd6dc);box-shadow:0 4px 0 #eeb0ba,inset 2px 3px 4px rgba(255,255,255,.8);color:#9c2a3a!important}',
P+'.rec{background:linear-gradient(160deg,#ffe9a0,#f6c43a);box-shadow:0 4px 0 #d39a20,inset 2px 2px 3px rgba(255,255,255,.6);color:#5a3a00}',
P+'.aw{background:linear-gradient(160deg,#fff7d6,#ffe6a0);box-shadow:0 4px 0 #e6c060,inset 2px 3px 4px rgba(255,255,255,.8);color:#6b4500}',
P+'.aw.new{background:linear-gradient(160deg,#f3fbe6,#dcf0c4);box-shadow:0 4px 0 #b6d697,inset 2px 3px 4px rgba(255,255,255,.8);color:#2f6a1e}',
P+'.chbar{background:#ead2b6;box-shadow:inset 0 2px 3px rgba(120,70,40,.25)}',
P+'.chbar i{background:linear-gradient(180deg,#b5e07e,#76b84a);box-shadow:inset 0 2px 0 rgba(255,255,255,.5)}',
P+'.chbar span{color:var(--ink)}',
P+'.set{background:linear-gradient(160deg,#fffdf8,#f9eedf);box-shadow:0 4px 0 #ead2b6,inset 2px 3px 4px rgba(255,255,255,.9),inset -2px -3px 5px rgba(160,100,70,.1);margin-top:10px}',
P+'.set:active{transform:translateY(3px);box-shadow:0 1px 0 #ead2b6,inset 2px 3px 4px rgba(255,255,255,.9)}',
P+'.set i{background:linear-gradient(160deg,#9fd86a,#5fae3c);box-shadow:0 3px 0 #3f8a2a,inset 2px 2px 3px rgba(255,255,255,.5)}',
P+'.set i.off{background:#ead9c6;color:var(--ink2);box-shadow:inset 0 2px 3px rgba(120,70,40,.2)}',
P+'.set i.go{background:transparent;box-shadow:none;color:var(--good2)}',
P+'.sd{background:linear-gradient(160deg,#fffdf8,#f9eedf);box-shadow:0 4px 0 #ead2b6,inset 2px 3px 4px rgba(255,255,255,.9)}',
P+'.sd.done{background:linear-gradient(160deg,#f3fbe6,#d4eeb8);box-shadow:0 4px 0 #a9d08a;color:#2f6a1e}',
P+'.sd.d7{background:linear-gradient(160deg,#fff7d6,#ffe28a);box-shadow:0 4px 0 #e0b852}',
P+'.sd.today,'+P+'.sd.d7.today{background:linear-gradient(160deg,#ffa98e,#f06a55);box-shadow:0 5px 0 #c64a3a,inset 2px 3px 4px rgba(255,255,255,.45);color:#fff}',
P+'.tabs2 button{background:#f3e3cf;color:var(--ink2);box-shadow:inset 0 2px 3px rgba(120,70,40,.18)}',
P+'.tabs2 button.on{background:linear-gradient(160deg,#fffaf2,#f7e6d0);color:var(--ink);box-shadow:0 0 0 2px var(--good),0 4px 0 #e2c2a0}',
P+'.rk{background:#f8ecdc}',
P+'.rk.cur{background:linear-gradient(160deg,#fff7d6,#ffe6a0);box-shadow:inset 0 0 0 2px #f6c43a}',
P+'.lbr.me{background:#ffeccc}',
P+'.pan{background:linear-gradient(160deg,#fffdf8,#f9eedf);box-shadow:0 4px 0 #ead2b6,inset 2px 3px 4px rgba(255,255,255,.9)}',
P+'.week .wd{background:#f3e3cf;color:var(--ink2)}',
P+'.week .wd.done{background:linear-gradient(160deg,#eaf8d6,#c9eaa6);color:#2f6a1e}',
P+'.card .soc-o{background:#fff1e0}',
P+'.toast{background:rgba(74,47,58,.95);border-radius:22px;box-shadow:0 6px 0 rgba(40,20,30,.5),0 12px 22px rgba(0,0,0,.25)}',
'@media (min-width:600px) and (max-height:760px){'+P+'.card.win h2{margin:4px 2px 8px;padding:6px 12px 8px}}'
].join('\n');
KIT.css=css;
LK.reg('d',KIT);
})();
