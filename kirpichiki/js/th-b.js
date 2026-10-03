/* K1: тема Б «Тёплая открытка» (макет kirp-look/b-postcard.html).
   Акварель и тетрадь: поле — тетрадный лист в клетку со скотчем и красной линией полей, кирпичики — акварельные мазки с карандашным контуром,
   «Чисто!» — красный штамп учителя «ОТЛИЧНО!» и «5» в кружке, кнопки — «бумажки» с карандашной рамкой, цифры помощников — в кружке красной ручкой,
   карта — план двора от руки на бумаге в клетку, маршрут — красный пунктир (свой mapHtml).
   Зерно бумаги — ОДИН маленький холст 96×96 (узор): в кэш кирпичиков/поля, в двор (SVG) и в окна (CSS). На каждый кадр — только эффекты и частицы. */
(function(){
'use strict';
var DOC=document,LKx=window.LK,RR=LKx.RR,mixHex=LKx.mixHex,rgba=LKx.rgba,R0=LKx.R0,ease=LKx.ease,clamp=LKx.clamp,svgUri=LKx.svgUri;
function T(ru,en){return typeof L==='function'?L(ru,en):ru;}
function DPR(){return Math.min(2,window.devicePixelRatio||1);}
function esc(t){return String(t).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
var INK='#3d322c',RED='#c8283a',BLUE='#2f5f9e',PAPER='#f6eedf';
// акварель: оранжевый, охра, травяной, бирюза, синий, сирень, малиновый, розовый
var PALB=['#e07b3c','#e3b13b','#7fae6a','#4f9e9a','#5f8ed6','#9d7cc6','#b83a4b','#d97a95'];
function colOf(col){return col===20?'#b8b0a4':PALB[(col-1)%PALB.length];}

/* ---- зерно бумаги: один раз 96×96 шума, дальше только узором ---- */
var GR=(function(){var c=DOC.createElement('canvas');c.width=c.height=96;var g=c.getContext('2d'),R=R0(77),d=g.createImageData(96,96);
  for(var i=0;i<d.data.length;i+=4){var v=R();d.data[i]=d.data[i+1]=d.data[i+2]=v<.5?60:255;d.data[i+3]=(Math.abs(v-.5)*36)|0;}g.putImageData(d,0,0);return c;})();
var GRU='';try{GRU=GR.toDataURL('image/png');}catch(e){}
function grain(g,x,y,w,h,a){try{g.save();g.globalAlpha=a;g.fillStyle=g.createPattern(GR,'repeat');g.fillRect(x,y,w,h);g.restore();}catch(e){}}

/* ---- неровный контур «от руки»: 4 стороны по 5 точек, сглажено ---- */
function wob(g,x,y,w,h,R,a,r){var P=[],n=5,i;
  for(i=0;i<n;i++)P.push([x+r+(w-2*r)*i/(n-1),y]);for(i=0;i<n;i++)P.push([x+w,y+r+(h-2*r)*i/(n-1)]);
  for(i=0;i<n;i++)P.push([x+w-r-(w-2*r)*i/(n-1),y+h]);for(i=0;i<n;i++)P.push([x,y+h-r-(h-2*r)*i/(n-1)]);
  for(i=0;i<P.length;i++){P[i][0]+=(R()-.5)*a;P[i][1]+=(R()-.5)*a;}
  var m=P.length,l=P[m-1];g.beginPath();g.moveTo((l[0]+P[0][0])/2,(l[1]+P[0][1])/2);
  for(i=0;i<m;i++){var p=P[i],q=P[(i+1)%m];g.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);}g.closePath();}
// то же для SVG (карта, двор)
function wrect(x,y,w,h,R,a){var P=[],i;for(i=0;i<=4;i++)P.push([x+w*i/4,y]);for(i=1;i<=4;i++)P.push([x+w,y+h*i/4]);for(i=1;i<=4;i++)P.push([x+w-w*i/4,y+h]);for(i=1;i<4;i++)P.push([x,y+h-h*i/4]);
  return P.map(function(p,i){return (i?'L':'M')+(p[0]+(R()-.5)*a).toFixed(1)+' '+(p[1]+(R()-.5)*a).toFixed(1);}).join('')+'Z';}

/* ---- кирпичик: акварельный мазок, тёмный край пигмента, зернистость, карандашный контур и штрих ---- */
function brickB(g,x,y,s,col){var old=col===20,c=colOf(col),R=R0(col*13+5),m=s*.08,w=s-2*m,gr,i;
  g.save();wob(g,x+m,y+m,w,w,R,s*.05,s*.12);g.fillStyle=rgba(c,.86);g.fill();g.clip();
  gr=g.createRadialGradient(x+s*.38,y+s*.36,s*.05,x+s*.5,y+s*.5,s*.62);gr.addColorStop(0,'rgba(255,255,255,.45)');gr.addColorStop(.55,'rgba(255,255,255,0)');gr.addColorStop(1,rgba(mixHex(c,-.3),.25));g.fillStyle=gr;g.fillRect(x,y,s,s);
  g.fillStyle=mixHex(c,-.35);g.globalAlpha=.25;for(i=0;i<9;i++){g.beginPath();g.arc(x+m+R()*w,y+m+R()*w,s*(.01+R()*.018),0,7);g.fill();}g.globalAlpha=1;
  grain(g,x,y,s,s,.7);g.restore();
  wob(g,x+m,y+m,w,w,R0(col*13+5),s*.05,s*.12);g.strokeStyle=mixHex(c,-.25);g.globalAlpha=.55;g.lineWidth=s*.07;g.stroke();g.globalAlpha=1;
  wob(g,x+m+1,y+m+.5,w-1,w-1,R0(col*7+1),s*.035,s*.1);g.strokeStyle='rgba(61,50,44,.78)';g.lineWidth=Math.max(1,s*.024);g.stroke();
  g.strokeStyle='rgba(61,50,44,.35)';g.lineWidth=Math.max(1,s*.02);g.lineCap='round';g.beginPath();for(i=0;i<4;i++){g.moveTo(x+s*(.58+i*.08),y+s*.86);g.lineTo(x+s*.86,y+s*(.58+i*.08));}g.stroke();
  if(old){g.strokeStyle='rgba(61,50,44,.5)';g.lineWidth=Math.max(1,s*.022);g.beginPath();for(i=0;i<7;i++){g.moveTo(x+s*(.15+i*.1),y+s*.15);g.lineTo(x+s*.15,y+s*(.15+i*.1));}g.stroke();}
  g.lineCap='butt';}

/* ---- поле: тетрадный лист в клетку (мелкая клетка — полклетки), красная линия полей, зерно, два кусочка скотча ---- */
function boardB(g,B,cs,fr,Bh){var S=B+2*fr,H=(Bh||B)+2*fr,q=cs/2,v,i,rows=Math.round((Bh||B)/cs),cols=Math.round(B/cs);
  g.save();g.fillStyle='rgba(61,50,44,.22)';g.fillRect(6,8,S,H);
  g.fillStyle='#fdfbf3';g.fillRect(0,0,S,H);
  g.strokeStyle='rgba(120,160,205,.42)';g.lineWidth=1;g.beginPath();
  for(v=fr%q;v<S;v+=q){g.moveTo(v,0);g.lineTo(v,H);}for(v=fr%q;v<H;v+=q){g.moveTo(0,v);g.lineTo(S,v);}g.stroke();
  g.strokeStyle='rgba(80,120,175,.6)';g.lineWidth=1.4;g.beginPath();
  for(i=0;i<=cols;i++){g.moveTo(fr+i*cs,fr);g.lineTo(fr+i*cs,fr+rows*cs);}for(i=0;i<=rows;i++){g.moveTo(fr,fr+i*cs);g.lineTo(fr+cols*cs,fr+i*cs);}g.stroke();
  g.strokeStyle='rgba(200,40,58,.6)';g.lineWidth=1.8;g.beginPath();g.moveTo(fr*.5,0);g.lineTo(fr*.5,H);g.stroke();
  grain(g,0,0,S,H,.65);
  [[S*.13,-.15],[S*.87,.12]].forEach(function(t){g.save();g.translate(t[0],1);g.rotate(t[1]);var tw=Math.max(30,S*.17);g.fillStyle='rgba(240,214,140,.72)';g.fillRect(-tw/2,-9,tw,22);
    g.strokeStyle='rgba(160,130,60,.35)';g.lineWidth=1;g.strokeRect(-tw/2,-9,tw,22);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(-tw/2,-9,tw,6);g.restore();});
  g.restore();}

/* ---- предмет: бумажный кружок с карандашной обводкой ---- */
function itemB(g,k,x,y,s){var cx=x+s*.5,cy=y+s*.48,r=s*.31;g.fillStyle='rgba(255,252,240,.94)';g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
  g.strokeStyle='rgba(61,50,44,.65)';g.lineWidth=Math.max(1,s*.024);g.beginPath();g.arc(cx+.5,cy,r-.5,.25,6.6);g.stroke();
  var im=typeof ITEM_IMG!=='undefined'&&ITEM_IMG[k];if(im&&im.complete&&im.naturalWidth)g.drawImage(im,cx-r*.8,cy-r*.8,r*1.6,r*1.6);}

/* ---- лоток: листок в линейку с карандашной рамкой и жёсткой тенью ---- */
function trayB(g,x,y,w,h){g.save();g.fillStyle='rgba(61,50,44,.16)';g.fillRect(x+4,y+5,w,h);
  wob(g,x,y,w,h,R0(9),4,6);g.fillStyle='rgba(255,253,246,.9)';g.fill();g.save();g.clip();
  g.strokeStyle='rgba(120,160,205,.28)';g.lineWidth=1;g.beginPath();for(var v=y+26;v<y+h;v+=26){g.moveTo(x,v);g.lineTo(x+w,v);}g.stroke();
  grain(g,x,y,w,h,.6);g.restore();
  wob(g,x,y,w,h,R0(9),4,6);g.strokeStyle='rgba(61,50,44,.7)';g.lineWidth=2;g.stroke();g.restore();}

/* ---- сбор клетки: мазок тает, акварель расплывается по бумаге, вылетают листочки (≤ 6 фигур на клетку) ---- */
function fxB(g,x,y,cs,col,it,e,draw){var c=colOf(col),h=(((x*7.13+y*3.71)|0)%997)/997,i;
  var k=clamp((e-.08)/.32);if(k<1){g.save();g.globalAlpha=1-k;draw(x,y);g.restore();}
  var cx=x+cs/2,cy=y+cs/2;
  if(e>.06&&e<.96){var b=ease(clamp((e-.06)/.5)),fa=1-clamp((e-.5)/.46);g.fillStyle=c;g.globalAlpha=.26*fa;
    for(i=0;i<3;i++){var a=h*6.28+i*2.1,rr=cs*(.3+.22*((h*(i+3)*7)%1))*b;g.beginPath();g.ellipse(cx+Math.cos(a)*cs*.3*b,cy+Math.sin(a)*cs*.24*b,rr,rr*.8,a,0,7);g.fill();}g.globalAlpha=1;}
  var p=clamp((e-.18)/.7);if(p>0&&p<1){g.lineWidth=1;g.strokeStyle=INK;
    for(i=0;i<2;i++){var a2=h*9+i*3.1-1.57,v=.55+((h*(i+5)*13)%1)*.6,px=cx+Math.cos(a2)*cs*(.4+v*.6)*ease(p),py=cy-cs*.9*Math.sin(p*Math.PI)*v+cs*1.3*p*p,sz=cs*(.11+.04*i);
      g.save();g.globalAlpha=1-p;g.translate(px,py);g.rotate((i?2.2:-1.8)*p+a2);g.fillStyle=i?'#8cbf6a':c;g.beginPath();g.ellipse(0,0,sz,sz*.5,0,0,7);g.fill();g.beginPath();g.moveTo(-sz*.9,0);g.lineTo(sz*.9,0);g.stroke();g.restore();}}}

/* ---- частицы: капля акварели или красная «галочка» ручкой ---- */
function partB(g,p,x,y,a){if(p.t===1){g.save();g.translate(x,y);g.rotate(p.rot*.3-.2);g.strokeStyle=RED;g.lineWidth=Math.max(1.5,p.s*.32);g.lineCap='round';g.lineJoin='round';
    g.beginPath();g.moveTo(-p.s*.7,-p.s*.05);g.lineTo(-p.s*.15,p.s*.5);g.lineTo(p.s*.85,-p.s*.7);g.stroke();g.restore();return;}
  g.fillStyle=p.c;g.beginPath();g.ellipse(x,y,p.s*1.1,p.s*.85,p.rot,0,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(x-p.s*.3,y-p.s*.25,p.s*.3,0,7);g.fill();}

/* ---- крупные слова: штамп учителя, красная ручка; рисуются один раз в кэш ---- */
var TXC={},TXN=0;
function fontOk(){try{return !DOC.fonts||!DOC.fonts.check||DOC.fonts.check('800 20px KF','Чисто');}catch(e){return true;}}
function boardW(){try{return LY&&LY.B?LY.B:0;}catch(e){return 0;}}
function stamp(g,lbl,fs,ink,five,seed){g.font='800 '+fs+'px KF,-apple-system,Roboto,sans-serif';g.textAlign='center';g.textBaseline='middle';
  var tw=g.measureText(lbl).width,bw=tw+fs*.76,bh=fs*1.44;
  g.save();g.rotate(-.12);g.strokeStyle=ink;g.fillStyle=ink;g.lineWidth=fs*.09;RR(g,-bw/2,-bh/2,bw,bh,fs*.22);g.stroke();
  g.lineWidth=fs*.035;RR(g,-bw/2+fs*.13,-bh/2+fs*.13,bw-fs*.26,bh-fs*.26,fs*.14);g.stroke();g.fillText(lbl,0,fs*.05);
  g.globalCompositeOperation='destination-out';var R=R0(seed);for(var i=0;i<70;i++){g.beginPath();g.arc((R()-.5)*bw,(R()-.5)*bh,fs*(.012+R()*.03),0,7);g.fill();}g.restore();
  if(five){g.save();g.translate(bw/2+fs*.62,-fs*.62);g.rotate(-.2);g.strokeStyle=ink;g.lineWidth=fs*.08;g.lineCap='round';g.beginPath();g.ellipse(0,0,fs*.6,fs*.54,0,0,6.05);g.stroke();
    g.font='italic 800 '+Math.round(fs*.9)+'px KF,-apple-system,Roboto,sans-serif';g.fillStyle=ink;g.fillText('5',0,fs*.04);g.restore();}}
function pen(g,t,fs,kind){g.font='italic 800 '+fs+'px KF,-apple-system,Roboto,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  var tw=g.measureText(t).width;g.save();g.rotate(kind==='pts'?-.04:-.06);
  g.lineWidth=fs*(kind==='pts'?.24:.2);g.strokeStyle='#fffdf6';g.strokeText(t,0,0);g.fillStyle=RED;g.fillText(t,0,0);
  if(kind!=='pts'){g.lineCap='round';g.lineWidth=Math.max(2,fs*.09);g.strokeStyle='#fffdf6';var y1=fs*.62;
    g.beginPath();g.moveTo(-tw*.48,y1);g.quadraticCurveTo(0,y1-fs*.16,tw*.5,y1+fs*.02);g.stroke();g.strokeStyle=RED;g.lineWidth=Math.max(1.5,fs*.065);g.stroke();
    if(kind==='combo'){g.beginPath();g.moveTo(-tw*.38,y1+fs*.2);g.quadraticCurveTo(0,y1+fs*.08,tw*.32,y1+fs*.2);g.stroke();}}
  g.restore();}
function mkTxt(t,size,kind){var d=DPR(),c=DOC.createElement('canvas'),g=c.getContext('2d'),fs,lbl=t,five=0,ink=RED,st=kind==='clean'||kind==='rec';
  if(kind==='clean'){lbl=T('ОТЛИЧНО!','EXCELLENT!');five=1;fs=size*.8;}else if(kind==='rec'){ink=BLUE;fs=size*.72;}else fs=size*(kind==='pts'?1:.92);
  // штамп не шире поля
  g.font='800 '+fs+'px KF,-apple-system,Roboto,sans-serif';var tw=g.measureText(lbl).width,bwid=st?tw+fs*.76+(five?fs*1.3:0):tw*1.05,mw=boardW()*.96;
  if(mw&&bwid>mw){fs*=mw/bwid;g.font='800 '+fs+'px KF,-apple-system,Roboto,sans-serif';tw=g.measureText(lbl).width;bwid=st?tw+fs*.76+(five?fs*1.3:0):tw*1.05;}
  var w=Math.ceil(bwid+fs*1.2),h=Math.ceil(fs*(five?3:2.6));c.width=Math.ceil(w*d);c.height=Math.ceil(h*d);g=c.getContext('2d');g.scale(d,d);
  var ox=w/2-(five?fs*.62:0),oy=h/2+(five?fs*.25:0);g.translate(ox,oy);
  if(st)stamp(g,lbl,fs,ink,five,(t.length*31+(size|0))|0);else pen(g,t,fs,kind);
  return {cv:c,w:w,h:h,ox:ox,oy:oy};}
function textB(g,t,size,kind){var key=kind+'|'+t+'|'+size+'|'+DPR()+'|'+boardW(),c=TXC[key];
  if(!c){c=mkTxt(t,size,kind);if(fontOk()){if(++TXN>60){TXC={};TXN=1;}TXC[key]=c;}}
  g.drawImage(c.cv,-c.ox,-c.oy,c.w,c.h);}

/* ---- двор акварелью: размывы неба, дома тушью, липы, качели, лавочка, песочница, кошка; день / вечер / ночь ---- */
var YC={};
function wash(cx,cy,rx,ry,c,o){return '<ellipse cx="'+(+cx).toFixed(0)+'" cy="'+(+cy).toFixed(0)+'" rx="'+(+rx).toFixed(0)+'" ry="'+(+ry).toFixed(0)+'" fill="'+c+'" opacity="'+(+o).toFixed(2)+'"/>';}
function yardB(tod){if(YC[tod])return YC[tod];var R=R0(21),ni=tod==='night',ev=tod==='eve',i;
  var paper=ni?'#e2e1ea':ev?'#f7e7d6':PAPER;
  var s='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">'+
    (GRU?'<defs><pattern id="gr" width="96" height="96" patternUnits="userSpaceOnUse"><image xlink:href="'+GRU+'" width="96" height="96"/></pattern></defs>':'')+'<rect width="1200" height="800" fill="'+paper+'"/>';
  var sk=ni?['#5a6c9c','#7a86b4']:ev?['#eaa483','#c9a7c9']:['#a9cbe6','#9cc2e2'];
  for(i=0;i<14;i++)s+=wash(R()*1200,40+R()*220,120+R()*160,40+R()*50,sk[i%2],(ni?.26:.18)+R()*.12);
  if(ni){s+=wash(900,120,70,70,'#fff3c8',.35)+'<circle cx="900" cy="120" r="34" fill="#fff6d8" stroke="'+INK+'" stroke-width="2"/><path d="M886 104a20 20 0 0 0 4 30" stroke="'+INK+'" stroke-width="1.4" fill="none" opacity=".5"/>';
    for(i=0;i<22;i++){var sx=R()*1200,sy=20+R()*260,z=4+R()*4;s+='<path d="M'+(sx-z).toFixed(0)+' '+sy.toFixed(0)+'h'+(2*z).toFixed(0)+'M'+sx.toFixed(0)+' '+(sy-z).toFixed(0)+'v'+(2*z).toFixed(0)+'" stroke="#e8b23f" stroke-width="2" stroke-linecap="round"/>';}}
  else if(ev)s+=wash(980,330,110,80,'#f0a35a',.35)+wash(980,330,52,52,'#f6c86a',.75);
  else s+=wash(950,130,60,60,'#f6c86a',.45)+wash(950,130,40,40,'#f9dc8e',.6);
  var lit=ni?.5:ev?.35:.15,unlit=ni?'#8592b8':'#bcd6ee';
  function house(x,y,w,h,c,cols,rows){var t='<path d="'+wrect(x,y,w,h,R,3)+'" fill="'+c+'" opacity=".88"/><path d="'+wrect(x,y,w,h,R,3)+'" fill="none" stroke="'+INK+'" stroke-width="2.2" stroke-linejoin="round" opacity=".85"/>';
    t+='<path d="'+wrect(x-8,y-12,w+16,12,R,2)+'" fill="'+(ni?'#8d7f86':'#b98f7a')+'" stroke="'+INK+'" stroke-width="2"/>';
    var cw=w/cols;for(var r=0;r<rows;r++)for(var q=0;q<cols;q++){var wx=x+q*cw+cw*.25,wy=y+18+r*(h-30)/rows,ww=cw*.5,wh=(h-30)/rows*.55;
      t+='<path d="'+wrect(wx,wy,ww,wh,R,2)+'" fill="'+(R()<lit?'#f6d88e':unlit)+'" stroke="'+INK+'" stroke-width="1.6"/><path d="M'+(wx+ww/2).toFixed(1)+' '+wy.toFixed(1)+'v'+wh.toFixed(1)+'" stroke="'+INK+'" stroke-width="1.2"/>';
      if(R()<.2)t+='<path d="M'+(wx-4).toFixed(1)+' '+(wy+wh).toFixed(1)+'h'+(ww+8).toFixed(1)+'" stroke="'+INK+'" stroke-width="2"/><circle cx="'+(wx+6).toFixed(1)+'" cy="'+(wy+wh-5).toFixed(1)+'" r="5" fill="#e2604c" opacity=".8"/>';}
    return t;}
  var hc=ni?['#c3bccb','#bdb3c6','#b6bdc0']:ev?['#f0d2b8','#ebc6bd','#e2d9c2']:['#efd9c0','#e8cfc4','#dfe3cf'];
  s+=house(-30,320,500,250,hc[0],8,5)+house(730,300,500,270,hc[1],8,5)+house(470,380,260,190,hc[2],4,3);
  function tree(x,y,k){var t='<path d="M'+x+' '+(y+10)+'q'+(-4*k)+' '+(-50*k)+' 0 '+(-90*k)+'" stroke="#6b4a36" stroke-width="'+(9*k)+'" fill="none" stroke-linecap="round"/>',gc=ni?['#6f8f7a','#7f9c86','#5d7d6a']:['#8cbf6a','#a7cf7c','#6fa65a'];
    for(var j=0;j<6;j++)t+=wash(x+(R()-.5)*90*k,y-110*k+(R()-.5)*70*k,(40+R()*30)*k,(34+R()*20)*k,gc[j%3],.55);
    t+='<path d="M'+(x-60*k)+' '+(y-110*k)+'q30 -70 60 -60q40 -10 60 50q10 50 -50 60q-60 10 -70 -50z" fill="none" stroke="'+INK+'" stroke-width="1.8" opacity=".6"/>';return t;}
  s+=tree(70,560,1.1)+tree(640,560,.9)+tree(1140,560,1.2);
  if(ni||ev)[[330,600],[790,600]].forEach(function(q){s+=wash(q[0],q[1]-140,90,90,'#f6d88e',ni?.45:.3)+'<path d="M'+q[0]+' '+q[1]+'v-140" stroke="'+INK+'" stroke-width="4" stroke-linecap="round"/><path d="'+wrect(q[0]-10,q[1]-158,20,16,R,1.5)+'" fill="#fff3c0" stroke="'+INK+'" stroke-width="2"/>';});
  s+='<path d="M0 575C300 560 900 590 1200 570V800H0z" fill="'+(ni?'#8fae8a':'#a7cf7c')+'" opacity=".55"/><path d="M0 610C400 600 800 620 1200 605V800H0z" fill="'+(ni?'#c4c0c8':ev?'#e2d3c2':'#d8d0c2')+'"/>';
  s+='<path d="M0 610C400 600 800 620 1200 605" stroke="'+INK+'" stroke-width="2" fill="none" opacity=".5"/>';
  s+='<path d="M860 560l36 100M960 560l-36 100M856 560h108" stroke="'+INK+'" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M896 560v70M924 560v70" stroke="'+INK+'" stroke-width="1.6"/><path d="'+wrect(884,628,52,8,R,1.5)+'" fill="#e8b23f" stroke="'+INK+'" stroke-width="2"/>';
  s+='<path d="'+wrect(1000,666,120,9,R,2)+'" fill="#c98f5a" stroke="'+INK+'" stroke-width="2"/><path d="'+wrect(1000,682,120,9,R,2)+'" fill="#c98f5a" stroke="'+INK+'" stroke-width="2"/><path d="M1010 691v22M1110 691v22" stroke="'+INK+'" stroke-width="3"/>';
  s+='<g transform="translate(1040 652)"><ellipse cx="0" cy="0" rx="16" ry="10" fill="#e8a25a" stroke="'+INK+'" stroke-width="1.8"/><circle cx="14" cy="-8" r="8" fill="#e8a25a" stroke="'+INK+'" stroke-width="1.8"/><path d="M9-14l2-6 4 4M17-15l3-5 1 6" fill="#e8a25a" stroke="'+INK+'" stroke-width="1.5"/><path d="M-16 0q-10-4-8-14" stroke="'+INK+'" stroke-width="2" fill="none"/></g>';
  s+='<g transform="translate(150 690)"><path d="'+wrect(-60,-14,120,30,R,2.5)+'" fill="#e8cf9a" stroke="'+INK+'" stroke-width="2"/><path d="M-30-2l12-6 10 7M14 4l8-8 10 6" stroke="'+INK+'" stroke-width="1.4" fill="none"/><path d="'+wrect(30,-34,14,16,R,1.5)+'" fill="#5f8ed6" stroke="'+INK+'" stroke-width="1.6"/></g>';
  for(i=0;i<10;i++)s+='<ellipse cx="'+(R()*1200).toFixed(0)+'" cy="'+(640+R()*150).toFixed(0)+'" rx="7" ry="3.5" fill="'+['#e8b23f','#e2604c','#c98f5a'][i%3]+'" opacity=".7"/>';
  if(ni)s+='<rect width="1200" height="800" fill="#3b4a78" opacity=".1"/>';
  if(GRU)s+='<rect width="1200" height="800" fill="url(#gr)"/>';
  return YC[tod]=s+'</svg>';}
function todNow(){var h=new Date().getHours();return h>=6&&h<18?'day':h>=18&&h<22?'eve':'night';}

/* ---- карта: план двора от руки на бумаге в клетку, маршрут — красный пунктир ---- */
var CHC=['#efd9c0','#e3e8d6','#f2d0c0','#c9d6e0','#e3e8d6','#dfe9c8','#f3dcc0','#e6dccb','#d6e6cf','#f0d6e0'];
var STARP='M40 7c2 0 3 1 4 3l8 16 18 3c4 1 5 5 2 8l-13 12 3 18c1 4-3 6-6 5l-16-9-16 9c-3 2-7-1-6-5l3-18-13-12c-3-3-2-7 2-8l18-3 8-16c1-2 2-3 4-3z';
function pU(id,m){try{return svgUri(portrait(id,m||'happy'));}catch(e){return '';}}
function mapB(){var NL=NLV,CH=CHAPTERS.length,Wd=400,R=R0(31),n,i,ch,a,lock;
  var yOf=[],y=150,pts=[];for(n=NL;n>=1;n--){if(n%10===0&&n<NL)y+=150;yOf[n]=y;y+=60;}var H=y+140;
  for(n=1;n<=NL;n++){i=NL-n;pts[n]=[200+Math.sin(i*.62+.8)*95,yOf[n]];}
  var ink='stroke="'+INK+'" stroke-width="2" stroke-linejoin="round"',F='font-family="KF,sans-serif"';
  var s='<svg class="lkmap" viewBox="0 0 '+Wd+' '+H+'" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="bgp" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#c9d8e8" stroke-width="1"/></pattern>'+
    '<clipPath id="bov"><ellipse cx="0" cy="0" rx="22" ry="25"/></clipPath></defs><rect width="'+Wd+'" height="'+H+'" fill="#fbf6ea"/><rect width="'+Wd+'" height="'+H+'" fill="url(#bgp)"/>'+
    '<path d="M30 0V'+H+'" stroke="'+RED+'" stroke-width="1.6" opacity=".55"/>';
  s+='<g transform="translate(78 70)"><circle r="28" fill="#fffdf6" '+ink+'/><path d="M0-34v68M-34 0h68" stroke="'+INK+'" stroke-width="1.2"/><path d="M0-28l6 20-6 4-6-4z" fill="'+RED+'"/><text y="-38" text-anchor="middle" '+F+' font-size="15" font-weight="800" fill="'+INK+'">'+T('С','N')+'</text></g>';
  // дома глав (вид сверху: крыша со штриховкой) и деревья по краям
  function bld(x,y,w,h,c,o){var t='<g opacity="'+(o||1)+'"><path d="'+wrect(x,y,w,h,R,3)+'" fill="'+c+'" '+ink+'/>';for(var k=0;k<Math.floor(w/13);k++)t+='<path d="M'+(x+9+k*13)+' '+(y+5)+'l-6 '+(h-10)+'" stroke="'+INK+'" stroke-width=".8" opacity=".35"/>';return t+'</g>';}
  for(ch=0;ch<CH;ch++){a=ch*10+1;var mid=(yOf[a+4]+yOf[a+5])/2,left=pts[a+4][0]>200;lock=a>S.unlocked;
    s+=bld(left?6:326,mid-70,68,140,CHC[ch%CHC.length],lock?.55:1);
    for(var t2=0;t2<3;t2++){var tx=left?354+R()*30:16+R()*34,ty=mid-150+R()*300;s+='<circle cx="'+tx.toFixed(0)+'" cy="'+ty.toFixed(0)+'" r="'+(12+R()*8).toFixed(0)+'" fill="#a7cf7c" opacity=".75" stroke="'+INK+'" stroke-width="1.4"/>';}}
  // маршрут
  var d='M'+pts[NL][0].toFixed(1)+' '+(pts[NL][1]-70);for(n=NL;n>=1;n--){var p0=n<NL?pts[n+1]:[pts[NL][0],pts[NL][1]-70],p1=pts[n];d+=' C'+p0[0].toFixed(1)+' '+(p0[1]+24)+' '+p1[0].toFixed(1)+' '+(p1[1]-24)+' '+p1[0].toFixed(1)+' '+p1[1];}d+=' L'+pts[1][0].toFixed(1)+' '+(H+10);
  s+='<path d="'+d+'" stroke="'+RED+'" stroke-width="2.8" stroke-dasharray="3 8" stroke-linecap="round" fill="none"/>';
  // вывески глав
  var tot=0,nl=nextLevel(),here='';
  for(ch=0;ch<CH;ch++){a=ch*10+1;lock=a>S.unlocked;var stc=0;for(var q=a;q<a+10;q++)stc+=S.lv[q]||0;tot+=stc;
    var sy=ch>0?(yOf[a]+yOf[a-1])/2:yOf[1]+96,C=CHAPTERS[ch],cg=(S.chest&&S.chest[ch])||0,
      sub=lock?T('откроется после «','opens after “')+chName(ch-1)+T('»','”'):'★ '+stc+T(' из 30',' of 30')+(cg<CHEST.length?' · '+T('сундук за ','chest at ')+CHEST[cg][0]:' · '+T('сундуки открыты','chests open'));
    s+='<g transform="translate(200 '+sy.toFixed(0)+') rotate('+(ch%2?1.5:-1.5)+')"'+(lock?' opacity=".7"':'')+'><path d="'+wrect(-162,-32,324,64,R,2.5)+'" fill="#fffdf6" '+ink+'/>'+
      '<g transform="translate(-130 0)"><ellipse rx="24" ry="27" fill="#fffaf0" stroke="#8a6a4a" stroke-width="2"/><image clip-path="url(#bov)" href="'+pU(C.host,lock?'norm':'happy')+'" x="-26" y="-26" width="52" height="52"/></g>'+
      '<text x="-96" y="-4" '+F+' font-weight="800" font-size="20" fill="'+INK+'">'+(ch+1)+'. '+esc(chName(ch))+'</text><text x="-96" y="19" '+F+' font-style="italic" font-weight="600" font-size="15" fill="#5e4e43">'+esc(sub)+'</text>'+
      (lock?'<g transform="translate(140 0)"><path d="'+wrect(-9,-3,18,15,R,1.2)+'" fill="#d8cbb8" stroke="'+INK+'" stroke-width="1.6"/><path d="M-5-3v-5a5 5 0 0 1 10 0v5" stroke="'+INK+'" stroke-width="1.8" fill="none"/></g>':'')+'</g>';}
  // уровни: пройден — галочка красной ручкой и звёзды, текущий — акварельное пятно, «ты здесь!» и сосед
  for(n=1;n<=NL;n++){var x=pts[n][0],y2=pts[n][1],done=!!S.lv[n],cur=n===nl&&!S.lv[n],lk=n>S.unlocked,boss=n%10===0;x=+x.toFixed(1);
    s+='<g data-l="'+n+'">';
    if(cur){var side=x>200?1:-1,px2=Math.max(32,Math.min(368,x+side*64));s+='<ellipse cx="'+x+'" cy="'+y2+'" rx="38" ry="34" fill="#e8a25a" opacity=".45"/><circle cx="'+x+'" cy="'+y2+'" r="29" fill="#e07a5a" opacity=".92"/><path d="M'+(x-31)+' '+(y2+3)+'a31 30 0 1 1 6 19" fill="none" stroke="'+INK+'" stroke-width="2.6"/><text x="'+x+'" y="'+(y2+9)+'" text-anchor="middle" '+F+' font-weight="800" font-size="26" fill="#fff">'+n+'</text>'+
      '<g transform="translate('+px2+' '+(y2-24)+') rotate('+(side*-6)+')"><ellipse rx="24" ry="27" fill="#fffaf0" stroke="#8a6a4a" stroke-width="2.4"/><image clip-path="url(#bov)" href="'+pU(CHAPTERS[Math.floor((n-1)/10)].host,'happy')+'" x="-24" y="-24" width="48" height="48"/></g>'+
      '';var tX=side>0?Math.min(394,px2+30):Math.max(6,px2-30);here='<text x="'+tX+'" y="'+(y2+40)+'" text-anchor="'+(side>0?'end':'start')+'" '+F+' font-style="italic" font-weight="800" font-size="17" fill="'+RED+'" stroke="#fbf6ea" stroke-width="4" paint-order="stroke" transform="rotate(-6 '+tX+' '+(y2+40)+')">'+esc(T('ты здесь!','you are here!'))+'</text>';}
    else if(lk)s+='<circle cx="'+x+'" cy="'+y2+'" r="22" fill="rgba(255,253,246,.65)"/><path d="M'+(x-23)+' '+(y2+2)+'a23 22 0 1 1 5 15" fill="none" stroke="#a89a8c" stroke-width="2"/><text x="'+x+'" y="'+(y2+7)+'" text-anchor="middle" '+F+' font-weight="800" font-size="19" fill="#8a7c6e">'+n+'</text>';
    else{s+='<circle cx="'+x+'" cy="'+y2+'" r="23" fill="#fffdf6"/><path d="M'+(x-24)+' '+(y2+2)+'a24 23 0 1 1 5 15" fill="none" stroke="'+INK+'" stroke-width="2"/><text x="'+x+'" y="'+(y2+7)+'" text-anchor="middle" '+F+' font-weight="800" font-size="20" fill="'+INK+'">'+n+'</text>';
      if(done){var sv=S.lv[n]||0;s+='<path d="M'+(x+13)+' '+(y2-25)+'l6 7 12-15" stroke="'+RED+'" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
        for(var kk=0;kk<3;kk++)s+='<path transform="translate('+(x-17+kk*12-6)+' '+(y2+19+(kk===1?2:0))+') scale(.15)" d="'+STARP+'" fill="'+(kk<sv?'#f2c14e':'#e9e0d0')+'" stroke="'+INK+'" stroke-width="6"/>';}}
    if(boss&&!cur)s+='<g transform="translate('+(x+(x>200?-48:48))+' '+(y2+4)+')"><path d="'+wrect(-15,-10,30,20,R,2)+'" fill="#d9694a" '+ink+'/><path d="M-15-4h30" stroke="'+INK+'" stroke-width="1.6"/><rect x="-3" y="-6" width="6" height="7" fill="#f2c14e" stroke="'+INK+'" stroke-width="1"/></g>';
    s+='<circle cx="'+x+'" cy="'+y2+'" r="31" fill="transparent"/></g>';}
  return {svg:s+here+'</svg>',tot:tot,y:function(n){return pts[n][1]/H;}};}

/* ---- CSS темы: бумага, карандаш, красная ручка ---- */
var GRC=GRU?' url('+GRU+')':'',P='html.lk.th-b ';
var CSS=[
P.trim()+'{--ink:#3d322c;--ink2:#5e4e43;--muted:#5e4e43;--card:#fbf5e8;--card2:#f6eedf;--line:#d9cbb3;--glass:#fffaf0;--glass2:rgba(255,250,240,.92);'+
 '--acc1:#e88a6a;--acc:#d9694a;--acc2:#a8442c;--good1:#8cbf6a;--good:#5e9e4a;--good2:#3f7a33;--blue1:#8fb3dd;--blue:#4f7fb8;--blue2:#36608f;'+
 '--gold:#c98a2a;--gold2:#a86d14;--red:#c8283a;--mint:#eef3df;--mintL:#cfdcb0;--sh:rgba(61,50,44,.22);--dim:rgba(61,50,44,.5);--bgc:#f6eedf;--r:14px}',
// кнопки-«бумажки»: карандашная рамка, неровные углы, жёсткая тень
P+'.btn{background:#fffaf0;color:var(--ink);border:2px solid #3d322c;border-radius:14px 18px 13px 19px;box-shadow:3px 4px 0 rgba(61,50,44,.25);font-weight:700}',
P+'.btn:active{-webkit-transform:translate(2px,2px);transform:translate(2px,2px);box-shadow:1px 1px 0 rgba(61,50,44,.25)}',
P+'.btn.green{color:#fff;background:#5e9e4a;border-color:#2c4a22;box-shadow:4px 5px 0 rgba(44,74,34,.35),inset 0 -6px 0 rgba(0,0,0,.12);text-shadow:0 1px 0 rgba(0,0,0,.3)}',
P+'.btn.accent{color:#fff;background:#d9694a;border-color:#6e2a1a;box-shadow:4px 5px 0 rgba(110,42,26,.32),inset 0 -6px 0 rgba(0,0,0,.12);text-shadow:0 1px 0 rgba(0,0,0,.3)}',
P+'.btn.blue{color:#fff;background:#4f7fb8;border-color:#23406a;box-shadow:4px 5px 0 rgba(35,64,106,.32),inset 0 -6px 0 rgba(0,0,0,.12);text-shadow:0 1px 0 rgba(0,0,0,.3)}',
P+'.row .btn,'+P+'.row .btn.green,'+P+'.helpers .btn,'+P+'.thc .btn,'+P+'.it .btn{border-radius:14px 18px 13px 19px}',
P+'.btn.green:active,'+P+'.btn.accent:active,'+P+'.btn.blue:active{box-shadow:1px 1px 0 rgba(61,50,44,.3),inset 0 -3px 0 rgba(0,0,0,.12)}',
P+'.btn[disabled]{opacity:.55;box-shadow:none}',
P+'.icon{background:#fffaf0;border:2px solid #3d322c;border-radius:14px 16px 13px 17px;box-shadow:3px 3px 0 rgba(61,50,44,.25);color:var(--ink)}',
P+'.pill{background:#fffaf0;border:2px solid #3d322c;box-shadow:3px 3px 0 rgba(61,50,44,.25);color:var(--ink)}',
// шапки, меню
P+'.gt>div:first-child{text-shadow:0 0 6px #f6eedf,0 0 12px #f6eedf,0 1px 0 #fffaf0}',
P+'.gh .sub{font-style:italic;color:var(--ink2);text-shadow:0 0 6px #f6eedf,0 0 4px #f6eedf}',
P+'#scr-map .map-scroll{background-color:#fbf6ea;background-image:linear-gradient(#c9d8e8 1px,transparent 1px),linear-gradient(90deg,#c9d8e8 1px,transparent 1px);background-size:20px 20px}',
P+'#scr-map .gh{background:rgba(246,238,223,.97);box-shadow:0 2px 0 rgba(61,50,44,.18)}',
P+'.logo{color:var(--ink);text-shadow:0 0 8px #f6eedf,0 2px 0 #fffaf0}',
P+'.logo small{color:var(--red);font-style:italic}',
P+'.hsay,'+P+'.bub{background:#fffdf6;color:var(--ink);border:2px solid #3d322c;border-radius:4px 18px 16px 18px;box-shadow:3px 3px 0 rgba(61,50,44,.18);font-weight:500}',
P+'.hsay b,'+P+'.bub b{color:var(--red)}',
P+'.bub::before{border-right-color:#3d322c}',P+'#app.land .bub::before{border-right-color:transparent;border-bottom-color:#3d322c}',
// портреты соседей — овал в рамке (как фото на открытке)
P+'.hface,'+P+'.hav{background:#fffaf0;padding:0;border:3px solid #fffaf0;box-shadow:0 0 0 2px #8a6a4a,3px 4px 0 2px rgba(61,50,44,.2);-webkit-transform:rotate(-3deg);transform:rotate(-3deg);overflow:hidden}',
P+'.hface svg,'+P+'.hav svg{border:0;border-radius:50%}',
P+'.big{border-radius:14px 20px 13px 19px;border:2.5px solid #3d322c}',
P+'.big .ic{background:rgba(255,253,246,.3);box-shadow:none;border:2px solid rgba(255,253,246,.7)}',
P+'#bPlay,'+P+'#bEnd,'+P+'#bDaily{color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.35)}',
P+'#bPlay{background:#5e9e4a;border-color:#2c4a22;box-shadow:4px 5px 0 rgba(44,74,34,.35),inset 0 -6px 0 rgba(0,0,0,.12)}',
P+'#bEnd{background:#4f7fb8;border-color:#23406a;box-shadow:4px 5px 0 rgba(35,64,106,.32),inset 0 -6px 0 rgba(0,0,0,.12)}',
P+'#bDaily{background:#c98320;border-color:#6b4710;box-shadow:4px 5px 0 rgba(107,71,16,.32),inset 0 -6px 0 rgba(0,0,0,.12)}',
P+'.nrow .btn{border-radius:12px 16px 12px 15px;box-shadow:3px 4px 0 rgba(61,50,44,.22)}',
P+'.nrow .btn:nth-child(odd){-webkit-transform:rotate(-1.2deg);transform:rotate(-1.2deg)}',P+'.nrow .btn:nth-child(even){-webkit-transform:rotate(1deg);transform:rotate(1deg)}',
P+'.btn .dot{background:var(--red);box-shadow:0 0 0 2.5px #fffaf0}',
// карточки — тетрадный лист
P+'.today,'+P+'.kcard{background:#fffdf6'+GRC+';border:2px solid #3d322c;border-radius:6px;box-shadow:4px 5px 0 rgba(61,50,44,.18)}',
P+'.trow{background:#fffdf6;border:1.5px solid rgba(61,50,44,.6);border-radius:10px 14px 10px 13px;box-shadow:2px 2px 0 rgba(61,50,44,.12)}',
P+'.trow .ic{background:#f3e3c3;box-shadow:inset 0 0 0 1.5px rgba(61,50,44,.45)}',
P+'.trow i{color:var(--red)}',
P+'.trow.hot{background:#fff3b8;border-color:#3d322c;box-shadow:2px 3px 0 rgba(61,50,44,.18)}',P+'.trow.hot .ic{background:#ffe68a}',
// игра: цели — жёлтые стикеры с булавкой, помощники — бумажки с ценой в кружке красной ручкой
P+'.chip{background:#ffe98a;border-radius:2px;box-shadow:2px 4px 6px rgba(60,40,10,.25);-webkit-transform:rotate(-2deg);transform:rotate(-2deg);position:relative;padding-left:7px}',
P+'.chip:before{content:"";position:absolute;left:50%;top:-7px;width:13px;height:13px;margin-left:-6px;border-radius:50%;background:#c8283a;box-shadow:inset -2px -2px 0 rgba(0,0,0,.2),1px 2px 2px rgba(0,0,0,.3)}',
P+'.chip:nth-child(even){-webkit-transform:rotate(1.5deg);transform:rotate(1.5deg)}',
P+'.chip img,'+P+'.chip lk-i{background:transparent}',
P+'.chip.ok{background:#cfe8b0;color:#24561c;box-shadow:2px 4px 6px rgba(60,40,10,.25)}',
P+'.scl{color:var(--ink);text-shadow:0 0 6px #fffaf0,0 0 12px #fffaf0}',
P+'.movesl{color:var(--ink2);font-style:italic;text-shadow:0 0 6px #fffaf0,0 0 3px #fffaf0}',
P+'.boost button{background:#fffaf0;border:2px solid #3d322c;border-radius:12px 16px 12px 15px;box-shadow:3px 4px 0 rgba(61,50,44,.22)}',
P+'.boost button:nth-child(odd){-webkit-transform:rotate(-1.2deg);transform:rotate(-1.2deg)}',P+'.boost button:nth-child(even){-webkit-transform:rotate(1deg);transform:rotate(1deg)}',
P+'.boost button[data-b=hint] lk-i{background:#fff0b8}',P+'.boost button[data-b=rot] lk-i{background:#d6e4f2}',P+'.boost button[data-b=new] lk-i{background:#f6dcd4}',P+'.boost button[data-b=bomb] lk-i{background:#e4dfd6}',
P+'.boost button i{background:#fffdf6;color:var(--red);border:2.5px solid var(--red);border-radius:50%;min-width:34px;height:34px;line-height:29px;padding:0 4px;font-style:italic;font-weight:800;font-size:17px;box-shadow:none;-webkit-transform:rotate(-8deg);transform:rotate(-8deg);top:-12px;right:-6px}',
P+'.boost button i.free{background:#fffdf6;color:#2f6a26;border-color:#3f7a33;box-shadow:none}',
P+'.boost button.on{background:#fff3b8;box-shadow:0 0 0 3px #e3a83b,3px 4px 0 rgba(61,50,44,.22)}',
P+'.tip,'+P+'.gban{background:#fffdf6;border:2px solid #3d322c;border-radius:6px;box-shadow:4px 5px 0 rgba(61,50,44,.22)}',
P+'.gban{background:#ffe98a}',
// окно — открытка: бумага, красная пунктирная рамка, портрет — почтовая марка
P+'.modal,'+P+'.ad{background:var(--dim)}',
P+'.card{background:#fbf5e8'+GRC+';border-radius:6px;box-shadow:0 18px 36px rgba(30,20,10,.45);color:var(--ink)}',
P+'.card:before,'+P+'.card.hasav:before{content:"";position:absolute;left:8px;top:8px;right:8px;bottom:8px;height:auto;border:2px dashed rgba(200,40,58,.38);border-radius:4px;background:none;pointer-events:none;z-index:0}',
P+'.card.win:after{-webkit-animation:none;animation:none;-webkit-mask:none;mask:none;width:320px;height:200px;margin:-100px 0 0 -160px;top:150px;border-radius:50%;background:radial-gradient(ellipse,rgba(246,200,106,.38) 0,rgba(246,200,106,0) 65%)}',
P+'.card>*{position:relative;z-index:1}',
P+'.card h2{color:var(--ink)}',
P+'.card p{color:var(--ink2);font-weight:500}',P+'.card p b{color:var(--ink)}',
P+'.card .av{width:108px;height:120px;padding:8px 8px 14px;border-radius:2px;background:#fffdf6;border:5px dashed #c9b9a0;box-shadow:2px 3px 6px rgba(61,50,44,.25);-webkit-transform:rotate(3deg);transform:rotate(3deg)}',
P+'.card .av svg{border:0;border-radius:2px;background:#dce8f2}',
P+'.big-stars .e{color:#d8cbb3}',
P+'.big-stars>span{position:relative}',
P+'.big-stars>.st:nth-child(3):after,'+P+'.big-stars>.st:nth-child(2)+.e:after,'+P+'.big-stars>.st:first-child+.e+.e:after{position:absolute;left:100%;top:50%;margin:-26px 0 0 2px;width:46px;height:46px;line-height:41px;border:3px solid #c8283a;border-radius:50%;color:#c8283a;font:italic 800 30px KF,sans-serif;text-align:center;letter-spacing:0;text-shadow:none;-webkit-transform:rotate(-10deg);transform:rotate(-10deg);box-sizing:border-box}',
P+'.big-stars>.st:nth-child(3):after{content:"5"}',P+'.big-stars>.st:nth-child(2)+.e:after{content:"4"}',P+'.big-stars>.st:first-child+.e+.e:after{content:"3"}',
P+'.coins-won{color:var(--ink)!important}',
P+'.quote{background:#fffdf6;border:1.5px solid rgba(61,50,44,.5);border-radius:4px 14px 12px 14px;font-style:italic;box-shadow:none}',
P+'.plq{background:#fffdf6;border-left:5px solid #c9b9a0;border-radius:4px;box-shadow:none}',
P+'.goal.tipl,'+P+'.plq.ok{background:#eef3df;border-left:5px solid #5e9e4a;border-radius:4px;color:#24561c!important;box-shadow:none}',
P+'.goal.tmrw,'+P+'.plq.info{background:#e6eef8;border-left:5px solid #4f7fb8;border-radius:4px;color:#23406a!important;box-shadow:none}',
P+'.plq.gold{background:#fff3b8;border-left:5px solid #d99a2b;color:#6b4710!important;box-shadow:none}',
P+'.plq.warn{background:#fbe4e0;border-left:5px solid #c8283a;color:#8e1424!important;box-shadow:none}',
P+'.rec{background:#fffdf6;color:#2f5f9e;border:2.5px solid #2f5f9e;border-radius:6px;box-shadow:none;-webkit-transform:rotate(-3deg);transform:rotate(-3deg);display:inline-block}',
P+'.aw{background:#fffdf6;color:var(--ink);border:1.5px dashed rgba(61,50,44,.55);border-radius:6px;box-shadow:none}',
P+'.aw.new{background:#eef3df;color:#24561c;border-color:#5e9e4a}',
P+'.chbar{background:#f3ead6;border-radius:6px;box-shadow:0 0 0 2px #3d322c}',P+'.chbar i{background:#8cbf6a;border-radius:3px}',
P+'.set{background:#fffdf6;border:1.5px solid rgba(61,50,44,.6);border-radius:10px 14px 10px 13px;box-shadow:2px 2px 0 rgba(61,50,44,.12)}',
P+'.set i{background:#fffdf6;color:#2f6a26;border:2.5px solid #3f7a33;box-shadow:none;font-style:italic;border-radius:999px}',
P+'.set i.off{background:#fffdf6;color:#6e5f54;border-color:#b7a998}',
P+'.set i.go{border:0;color:var(--red);background:transparent}',
P+'.tabs2 button{background:#f3ead6;color:var(--ink2);border:1.5px solid rgba(61,50,44,.35)}',P+'.tabs2 button.on{background:#fff3b8;color:var(--ink);border:2px solid #3d322c;box-shadow:2px 3px 0 rgba(61,50,44,.2)}',
P+'.sd{background:#fffdf6;border:1.5px solid rgba(61,50,44,.45);box-shadow:none}',
P+'.sd.done{background:#eef3df;color:#24561c}',P+'.sd.today{background:#d9694a;color:#fff;border-color:#6e2a1a;box-shadow:3px 3px 0 rgba(110,42,26,.3)}',P+'.sd.d7{background:#fff3b8}',P+'.sd.d7.today{background:#d9694a}',
P+'.lbr.me,'+P+'.rk.cur{background:#fff3b8}',P+'.rk{background:#fffdf6}',
P+'.pan{background:#fffdf6;border:1.5px solid rgba(61,50,44,.45)}',
P+'.week .wd{background:#f3ead6}',P+'.week .wd.done{background:#eef3df;color:#24561c}',P+'.week .wd.today{box-shadow:inset 0 0 0 2px var(--red)}',
P+'.toast{background:rgba(61,50,44,.95);color:#fffaf0;border-radius:6px}',
P+'.it,'+P+'.thc{background:#fffdf6;border:2px solid #3d322c;border-radius:8px;box-shadow:3px 4px 0 rgba(61,50,44,.18)}',
P+'.it.on,'+P+'.thc.cur{box-shadow:0 0 0 3px #5e9e4a,3px 4px 0 rgba(61,50,44,.18)}',
P+'.it canvas,'+P+'.thc canvas{border-radius:3px}',
P+'.thc .lock{background:#fffdf6;border:1.5px solid #3d322c}',
P+'.shop-pay{background:#fffdf6;border:2px solid #3d322c;border-radius:6px;box-shadow:3px 4px 0 rgba(61,50,44,.18)}',
P+'.card .soc-o{background:#eef3df}'
].join('\n');

LKx.reg('b',{
  id:'b',pal:PALB,frK:.36,
  brick:brickB,board:boardB,empty:function(){},item:itemB,tray:trayB,traySel:'rgba(240,200,70,.38)',
  fx:fxB,fxMs:650,
  partCol:colOf,part:partB,partN:4,
  text:textB,
  conf:PALB.concat(['#c8283a','#f2c14e']),
  comboCol:['#c8283a','#c8283a','#c8283a','#8e1424','#c8283a'],
  yard:yardB,
  get bgc(){var t=todNow();return t==='night'?'#e2e1ea':t==='eve'?'#f7e7d6':PAPER;},
  map:{bg:'#fbf6ea',stripe:'',edge:'#c9d8e8',path:'#fffdf6',mid:'#fbf6ea',crown:['#cfe3b4','#a7cf7c','#6fa65a'],ink:INK,ink2:'#5e4e43',done:'#fffdf6',doneTx:INK,cur:['#f0a07a','#e07a5a','#c25a3a'],lockTx:'#8a7c6e',flower:'#e8b23f',ring:'#8a6a4a'},
  mapHtml:mapB,
  prev:{bg2:'#ede2cc'},
  css:CSS
});
})();
