/* RB:MGC (08.10.2026) — общий рисунок мини-игр MGC: «Верша на раков», «Ночные раки», «Фото с трофеем».
   Всё кодом на Canvas, в стиле сцены рыбалки (pal/paintSky/paintFar из index.html, если есть).
   MGCA.scene(...)   — фон: небо, дальний берег, вода с отражением, ближний берег/мостки (строится один раз)
   MGCA.petr(...)    — Петрович во весь рост (позы: stand/point/pull/cheer/hold/photo)
   MGCA.cat(...)     — кот Васька сидит (хвост ходит, моргает)
   MGCA.rak(...)     — рак сверху (виды: shir — широкопалый, dlin — длиннопалый, blue — голубой, gold — золотой)
   MGCA.versha(...)  — плетёная верша сбоку; MGCA.lamp(...) — фонарь; MGCA.chip(...) — подпись-плашка
   MGCA.css()        — стили оверлея мини-игр (кнопки — классы игры .btn/.btn.green, шрифт --font) */
(function(){
'use strict';
var A={};
function hx(c){c=c.replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)];}
function mix(a,b,t){var A1=hx(a),B1=hx(b);return '#'+A1.map(function(v,i){var x=Math.round(v+(B1[i]-v)*t);return (x<16?'0':'')+x.toString(16);}).join('');}
function shade(a,k){return '#'+hx(a).map(function(v){var x=Math.max(0,Math.min(255,Math.round(v*k)));return (x<16?'0':'')+x.toString(16);}).join('');}
function rgba(a,al){var c=hx(a);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+al+')';}
function rnd(seed){var s=seed>>>0||1;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function low(){return typeof LOW!=='undefined'&&LOW;}
function dpr(){return typeof lowDp==='function'?lowDp():Math.min(2,window.devicePixelRatio||1);}
function glow(g,x,y,r,rgb,a){if(low()&&typeof glowSp==='function'){glowSp(g,x,y,r,rgb,a);return;}var gr=g.createRadialGradient(x,y,1,x,y,r);gr.addColorStop(0,'rgba('+rgb+','+a+')');gr.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
A.save=function(){try{if(window.MG&&MG.save)MG.save();else if(typeof save==='function')save();}catch(e){}};
/* садок раков — общий для Ухи, бабы Зины, рынка */
A.addRk=function(n){if(typeof S==='undefined'||!(n>0))return;if(!S.mg||typeof S.mg!=='object')S.mg={};S.mg.rk=(+S.mg.rk||0)+n;};
A.hx=hx;A.mix=mix;A.shade=shade;A.rgba=rgba;A.rng=rnd;A.rr=rr;A.glow=glow;A.dpr=dpr;A.low=low;

/* время суток по часам игрока (для сцены): утро 5–10, день 10–18, вечер 18–22, ночь */
A.todNow=function(){var h=new Date(typeof nowMs==='function'?nowMs():Date.now()).getHours();return h>=5&&h<10?'morning':h<18&&h>=10?'day':h>=18&&h<22?'evening':'night';};
/* палитра: из игры (pal), иначе своя упрощённая */
A.pal=function(look,tod,wx){if(typeof pal==='function')return pal(look,tod,wx);
  var SK={morning:['#86b6e6','#ffd0a3'],day:['#4d93d9','#cde9f7'],evening:['#4b4f8f','#ff9e5e'],night:['#0a1330','#2a3a66']}[tod],li={morning:.93,day:1,evening:.74,night:.36}[tod];
  var tint=function(c){var x=shade(c,li);if(tod==='night')x=mix(x,'#1a2a55',.3);return x;};
  return {top:SK[0],bot:SK[1],li:li,tint:tint,far:function(c){return mix(tint(c),SK[1],.28);},water1:mix(tint('#3f8488'),SK[1],.3),water2:shade(tint('#3f8488'),.62),tod:tod,wx:wx,look:look};};

/* геометрия сцены: горизонт, линия ближнего берега/мостков, перспектива воды */
A.geo=function(W,H,o){var land=W>H*1.1,hz=H*(land?.33:.29),shY=H*(o&&o.shY?o.shY:(land?.74:.7));
  return {W:W,H:H,land:land,hz:hz,shY:shY,u:Math.min(W,H)/100,
    /* d — 0 у берега … 1 у горизонта → y и масштаб */
    yAt:function(d){return shY-(shY-hz)*(1-Math.pow(1-d,1.8));},sAt:function(d){return 1-d*.78;}};};

/* ---------- фон сцены: небо, дальний берег, вода, ближний берег / мостки ---------- */
A.scene=function(g,W,H,G0,P,o){o=o||{};var u=G0.u,hz=G0.hz,R=rnd(o.seed||7);
  if(typeof paintSky==='function')paintSky(g,W,H,hz,P,rnd(o.seed||7));else{var sg=g.createLinearGradient(0,0,0,hz);sg.addColorStop(0,P.top);sg.addColorStop(1,P.bot);g.fillStyle=sg;g.fillRect(0,0,W,hz+2);}
  var far=document.createElement('canvas');far.width=Math.max(1,Math.ceil(W));far.height=Math.max(1,Math.ceil(hz));var fg=far.getContext('2d');
  if(typeof paintFar==='function')paintFar(fg,W,H,hz,P,rnd((o.seed||7)+11));
  g.drawImage(far,0,0,W,hz);
  /* вода: глубина к горизонту светлее, к берегу темнее */
  var wg=g.createLinearGradient(0,hz,0,H);wg.addColorStop(0,P.water1);wg.addColorStop(.55,mix(P.water1,P.water2,.6));wg.addColorStop(1,P.water2);g.fillStyle=wg;g.fillRect(0,hz,W,H-hz);
  g.save();g.globalAlpha=.3;g.translate(0,hz*2);g.scale(1,-1);g.drawImage(far,0,hz*.35,W,hz*.65,0,hz-hz*.65*.7,W,hz*.65*.7);g.restore();
  g.fillStyle=rgba(P.bot,.2);g.fillRect(0,hz,W,u*1.2);
  if(P.sun&&P.wx!=='rain'){var cl=P.tod==='night'?'#f4f1dc':'#ffe0a0';g.save();g.translate(P.sun[0],hz);g.scale(1,3.4);var gr=g.createRadialGradient(0,0,1,0,0,u*16);gr.addColorStop(0,rgba(cl,P.tod==='day'?.18:.34));gr.addColorStop(1,rgba(cl,0));g.fillStyle=gr;g.fillRect(-u*16,0,u*32,u*16);g.restore();}
  /* кувшинки (ближе — крупнее, с цветками) */
  for(var i=0;i<12;i++){var d=.04+R()*.6,y=G0.yAt(d),x=R()*W,s=G0.sAt(d)*u*2.4;if(o.avoid&&Math.abs(x-o.avoid.x)<o.avoid.w&&y>o.avoid.y)continue;g.fillStyle=P.tint(i%2?'#3f6d36':'#4b7c3a');g.beginPath();g.ellipse(x,y,s*1.4,s*.45,0,.3,Math.PI*2-.1);g.lineTo(x,y);g.fill();
    g.strokeStyle=rgba('#ffffff',.18);g.lineWidth=1;g.beginPath();g.ellipse(x,y,s*1.4,s*.45,0,3.6,5.6);g.stroke();
    if(i%4===0){g.fillStyle=P.tint('#f6f2ea');for(var j=0;j<5;j++){var a=j/5*Math.PI*2;g.beginPath();g.ellipse(x+Math.cos(a)*s*.25,y-s*.15+Math.sin(a)*s*.1,s*.22,s*.1,a,0,7);g.fill();}g.fillStyle=P.tint('#f2c84a');g.beginPath();g.arc(x,y-s*.17,s*.1,0,7);g.fill();}}
  if(o.shore!==false)A.shore(g,W,H,G0,P,o);};

/* мостки уходят от зрителя в воду; по бокам — вода, слева — край берега с травой */
A.pierBox=function(G0){var W=G0.W,H=G0.H,land=G0.land;return land?{fl:W*.31,fr:W*.6,xl:W*.13,xr:W*.86,yT:G0.shY,yB:H+G0.u}:{fl:W*.27,fr:W*.73,xl:W*.07,xr:W*.93,yT:G0.shY,yB:H+G0.u};};
A.pierEdge=function(pb,y,side){var k=Math.max(0,Math.min(1,(y-pb.yT)/(pb.yB-pb.yT)));return side<0?pb.fl+(pb.xl-pb.fl)*k:pb.fr+(pb.xr-pb.fr)*k;};
A.shore=function(g,W,H,G0,P,o){var u=G0.u,R=rnd((o.seed||7)+3),y0=G0.shY,land=G0.land;
  /* левый берег: песок + трава, уходит за край экрана */
  var bx=land?W*.1:W*.05;
  g.fillStyle=P.tint('#8a7a52');g.beginPath();g.moveTo(-5,G0.yAt(.42));g.quadraticCurveTo(bx*2.2,G0.yAt(.2),bx*1.6,y0);g.quadraticCurveTo(bx*.9,H*.86,-5,H*.98);g.closePath();g.fill();
  var gg=g.createLinearGradient(0,G0.yAt(.4),0,H);gg.addColorStop(0,P.tint('#6c9b43'));gg.addColorStop(1,P.tint('#36601f'));g.fillStyle=gg;
  g.beginPath();g.moveTo(-5,G0.yAt(.45));g.quadraticCurveTo(bx*1.7,G0.yAt(.22),bx*1.2,y0);g.quadraticCurveTo(bx*.6,H*.86,-5,H*.96);g.closePath();g.fill();
  /* правый дальний мысок с кустами */
  g.fillStyle=P.tint('#5e8a3a');g.beginPath();g.moveTo(W+5,G0.yAt(.62));g.quadraticCurveTo(W*.86,G0.yAt(.58),W*.82,G0.yAt(.5));g.quadraticCurveTo(W*.9,G0.yAt(.46),W+5,G0.yAt(.47));g.fill();
  for(var i=0;i<6;i++){var cx=W*(.86+R()*.14),cy=G0.yAt(.53+R()*.06),r=u*(1.5+R()*2.2);g.fillStyle=P.tint(i%2?'#3f6a32':'#4c7a38');g.beginPath();g.arc(cx,cy-r*.6,r,0,7);g.fill();}
  /* тёмная полоса воды у мостков (тень) */
  if(o.pier){var pb=A.pierBox(G0);g.fillStyle='rgba(5,20,28,.18)';g.beginPath();g.moveTo(pb.fl-u*2,pb.yT);g.lineTo(pb.fr+u*2,pb.yT);g.lineTo(pb.xr+u*4,H);g.lineTo(pb.xl-u*4,H);g.fill();A.pier(g,W,H,G0,P,o);}};

/* мостки: поперечные доски в перспективе, сваи, торец над водой */
A.pier=function(g,W,H,G0,P,o){var u=G0.u,pb=A.pierBox(G0),yT=pb.yT,yB=pb.yB;
  g.save();
  /* сваи у дальнего конца и по бокам */
  var piles=[[pb.fl,yT],[pb.fr,yT],[A.pierEdge(pb,yT+(yB-yT)*.35,-1),yT+(yB-yT)*.35],[A.pierEdge(pb,yT+(yB-yT)*.35,1),yT+(yB-yT)*.35]];
  for(var i=0;i<piles.length;i++){var px=piles[i][0],py=piles[i][1],pw=u*(i<2?1.3:2),ph=u*(i<2?4:7),sd=px<W/2?-1:1;px+=sd*pw*.2;
    var pg=g.createLinearGradient(px-pw,0,px+pw,0);pg.addColorStop(0,P.tint('#3e2c1c'));pg.addColorStop(.5,P.tint('#6a4c2e'));pg.addColorStop(1,P.tint('#3a281a'));
    g.fillStyle=pg;g.fillRect(px-pw*.5,py-u*.5,pw,ph);g.fillStyle='rgba(8,24,30,.3)';g.beginPath();g.ellipse(px,py+ph,pw*1.3,pw*.35,0,0,7);g.fill();
    g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=1;g.beginPath();g.ellipse(px,py+ph,pw*1.1,pw*.3,0,0,7);g.stroke();}
  /* продольные балки по краям (видны сбоку) */
  for(var sd=-1;sd<=1;sd+=2){g.fillStyle=P.tint('#4a3420');g.beginPath();g.moveTo(sd<0?pb.fl:pb.fr,yT);g.lineTo(sd<0?pb.xl:pb.xr,yB);g.lineTo((sd<0?pb.xl:pb.xr)+sd*u*.2,yB+u*2.4);g.lineTo((sd<0?pb.fl:pb.fr)+sd*u*.1,yT+u*.9);g.fill();}
  /* настил */
  var n=13;for(i=0;i<n;i++){var t0=i/n,t1=(i+1)/n,e=function(t){return Math.pow(t,1.35);},ya=yT+(yB-yT)*e(t0),yb=yT+(yB-yT)*e(t1)-Math.max(1,u*.22*(.4+t1)),
      xa0=A.pierEdge(pb,ya,-1),xa1=A.pierEdge(pb,ya,1),xb0=A.pierEdge(pb,yb,-1),xb1=A.pierEdge(pb,yb,1),cc=['#a67e50','#9a7448','#ad8656','#987046'][i%4];
    var bg=g.createLinearGradient(0,ya,0,yb);bg.addColorStop(0,P.tint(mix(cc,'#ffffff',.1)));bg.addColorStop(1,P.tint(shade(cc,.8)));g.fillStyle=bg;
    g.beginPath();g.moveTo(xa0,ya);g.lineTo(xa1,ya);g.lineTo(xb1,yb);g.lineTo(xb0,yb);g.closePath();g.fill();
    g.fillStyle=P.tint('#3e2a18');g.fillRect(xb0,yb,xb1-xb0,Math.max(1,u*.22*(.4+t1)));
    var hh=yb-ya,rk=rnd(i*31+5);g.strokeStyle=rgba('#4a3420',.28);g.lineWidth=Math.max(.6,hh*.05);
    for(var j=0;j<2;j++){var sx=xa0+(xa1-xa0)*(.15+rk()*.5),ln=(xa1-xa0)*(.2+rk()*.25),sy=ya+hh*(.3+j*.35);g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(sx+ln*.5,sy+hh*.12,sx+ln,sy);g.stroke();}
    g.fillStyle=rgba('#2a2018',.6);var ny=(ya+yb)/2,nr=Math.max(.8,hh*.07);g.beginPath();g.arc(xa0+(xa1-xa0)*.06,ny,nr,0,7);g.arc(xa1-(xa1-xa0)*.06,ny,nr,0,7);g.fill();}
  g.restore();
  return pb;};

/* ---------- живая вода: блики (строятся один раз) ---------- */
A.shim=function(G0,seed){var R=rnd(seed||5),a=[],n=low()?45:90;for(var i=0;i<n;i++){var t=Math.pow(R(),1.5);a.push({x:R()*G0.W,d:t,ph:R()*7,s:.6+R()*1.4,l:G0.u*(1.5+(1-t)*6)*(.6+R()*.8),dark:R()<.35});}return a;};
A.drawShim=function(g,G0,S,t,P){var night=P.tod==='night';g.lineCap='round';
  for(var i=0;i<S.length;i++){var s=S[i],y=G0.yAt(s.d),k=.5+.5*Math.sin(t*s.s+s.ph);if(y>G0.shY)continue;
    g.strokeStyle=s.dark?'rgba(10,30,40,'+(.12*k)+')':(night?'rgba(200,215,255,':'rgba(255,255,255,')+(.08+.22*k)+')';g.lineWidth=Math.max(1,G0.u*.25*(1-s.d*.6));
    var x=(s.x+t*G0.u*(.6+s.s)*.5)%(G0.W+40)-20;g.beginPath();g.moveTo(x,y);g.lineTo(x+s.l*(.7+.3*k),y);g.stroke();}};
/* круги на воде: {x,y,t0,s} */
A.ripple=function(g,r,t){var a=(t-r.t0);if(a<0||a>1.6)return false;var k=a/1.6;g.strokeStyle='rgba(255,255,255,'+(.55*(1-k))+')';g.lineWidth=Math.max(1,r.s*.06);
  for(var j=0;j<2;j++){var kk=Math.max(0,k-j*.18);g.beginPath();g.ellipse(r.x,r.y,r.s*(.3+kk*1.6),r.s*(.1+kk*.5),0,0,7);g.stroke();}return true;};

/* ---------- камыш (кустик) ---------- */
A.reeds=function(g,x,y,s,t,P,seed,n){var R=rnd(seed||3);n=n||9;g.lineCap='round';
  for(var i=0;i<n;i++){var bx=x+(R()-.5)*s*.8,h=s*(.7+R()*.6),sw=Math.sin(t*(.8+R()*.5)+i)*s*.05;
    g.strokeStyle=P.tint(i%3?'#4d6a2a':'#5d7a32');g.lineWidth=Math.max(1,s*.035);g.beginPath();g.moveTo(bx,y);g.quadraticCurveTo(bx,y-h*.6,bx+sw,y-h);g.stroke();
    if(i%2===0){g.fillStyle=P.tint('#6a4a2a');g.beginPath();g.ellipse(bx+sw*.96,y-h*.9,s*.04,s*.13,0,0,7);g.fill();}}
  /* листья-ленты */
  for(i=0;i<5;i++){var lx=x+(R()-.5)*s*.6,lh=s*(.5+R()*.4),dir=R()<.5?-1:1;g.strokeStyle=P.tint('#5f8a34');g.lineWidth=Math.max(1,s*.05);g.beginPath();g.moveTo(lx,y);g.quadraticCurveTo(lx+dir*s*.1,y-lh*.7,lx+dir*s*.28+Math.sin(t+i)*s*.03,y-lh);g.stroke();}};
/* коряга: тёмные ветки из воды */
A.snag=function(g,x,y,s,P){g.lineCap='round';g.strokeStyle=P.tint('#3a2c20');
  var br=[[0,0,-.35,-.75,.09],[0,0,.25,-.55,.08],[-.18,-.4,-.55,-.62,.05],[.12,-.3,.42,-.85,.05],[.25,-.55,.4,-.62,.035],[-.35,-.75,-.32,-.95,.03]];
  for(var i=0;i<br.length;i++){var b=br[i];g.lineWidth=Math.max(1,s*b[4]);g.beginPath();g.moveTo(x+b[0]*s,y+b[1]*s);g.quadraticCurveTo(x+(b[0]+b[2])*s*.5+s*.05,y+(b[1]+b[3])*s*.5,x+b[2]*s,y+b[3]*s);g.stroke();}
  g.strokeStyle=rgba('#ffffff',.18);g.lineWidth=Math.max(1,s*.025);g.beginPath();g.moveTo(x-s*.05,y-s*.05);g.quadraticCurveTo(x-s*.15,y-s*.4,x-s*.33,y-s*.7);g.stroke();
  g.fillStyle=P.tint('#2e2418');g.beginPath();g.ellipse(x,y+s*.02,s*.38,s*.07,0,0,7);g.fill();
  g.fillStyle=P.tint('#4f6e2e');g.beginPath();g.ellipse(x+s*.3,y-s*.6,s*.06,s*.03,.4,0,7);g.ellipse(x-s*.4,y-s*.66,s*.05,s*.025,-.3,0,7);g.fill();};
/* яма: тёмное пятно глубины с медленными кругами */
A.pit=function(g,x,y,s,t,P){var gr=g.createRadialGradient(x,y,1,x,y,s);gr.addColorStop(0,'rgba(5,20,30,.55)');gr.addColorStop(.7,'rgba(5,20,30,.25)');gr.addColorStop(1,'rgba(5,20,30,0)');
  g.save();g.translate(x,y);g.scale(1,.32);g.translate(-x,-y);g.fillStyle=gr;g.fillRect(x-s,y-s,s*2,s*2);
  for(var j=0;j<3;j++){var k=((t*.25+j/3)%1);g.strokeStyle='rgba(200,230,240,'+(.22*(1-k))+')';g.lineWidth=Math.max(1,s*.02)*3;g.beginPath();g.arc(x,y,s*(.2+k*.75),0,7);g.stroke();}
  g.restore();};

/* ---------- буёк верши (красно-белый) ---------- */
A.buoy=function(g,x,y,s,t){var b=Math.sin(t*1.8)*s*.06;y+=b;
  g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(x,y+s*.35,s*.5,s*.12,0,0,7);g.fill();
  g.fillStyle='#f2ede2';g.beginPath();g.arc(x,y,s*.38,Math.PI,0);g.lineTo(x+s*.38,y+s*.25);g.quadraticCurveTo(x,y+s*.42,x-s*.38,y+s*.25);g.fill();
  g.fillStyle='#d8352a';g.beginPath();g.arc(x,y-s*.02,s*.38,Math.PI*1.12,Math.PI*1.88);g.lineTo(x,y-s*.02);g.fill();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(x-s*.14,y-s*.2,s*.08,s*.05,-.5,0,7);g.fill();
  g.strokeStyle='#3a3a3a';g.lineWidth=Math.max(1,s*.05);g.beginPath();g.moveTo(x,y-s*.38);g.lineTo(x,y-s*.62);g.stroke();
  g.fillStyle='#d8352a';g.beginPath();g.moveTo(x,y-s*.62);g.lineTo(x+s*.26,y-s*.54);g.lineTo(x,y-s*.46);g.fill();};

/* ---------- верша: плетёный цилиндр с воронкой (горловина слева), конец перевязан справа ----------
   wet 0..1 — мокрая (темнее, капли); sub 0..1 — под водой (синеватая, прозрачнее); n — сколько раков видно внутри */
A.versha=function(g,x,y,L,o){o=o||{};var h=L*.42,x0=x-L*.5,x1=x+L*.5,P=o.P,tn=P?P.tint:function(c){return c;},wet=o.wet||0,sub=o.sub||0,t=o.t||0;
  g.save();if(o.rot){g.translate(x,y);g.rotate(o.rot);g.translate(-x,-y);}
  if(sub>0)g.globalAlpha=1-sub*.55;
  var wc=tn(mix('#c49a58','#5a4426',wet*.5)),dk=tn(mix('#7a5a2e','#3a2a16',wet*.5));
  /* тень */
  if(!sub){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y+h*.58,L*.55,h*.14,0,0,7);g.fill();}
  /* задняя стенка (видна сквозь прутья) */
  g.fillStyle=rgba(shade(wc,.45),.55);rr(g,x0+L*.06,y-h*.5,L*.84,h,h*.5);g.fill();
  /* раки внутри */
  if(o.inside)o.inside(g,x0+L*.15,y-h*.35,L*.7,h*.7);
  /* продольные прутья */
  g.lineCap='round';g.strokeStyle=wc;g.lineWidth=Math.max(1,L*.012);
  for(var i=0;i<=8;i++){var k=i/8,yy=y-h*.5+h*k,bend=Math.sin(k*Math.PI)*h*.04;g.beginPath();g.moveTo(x0+L*.1,yy);g.quadraticCurveTo(x,yy-bend,x1-L*.08,y-h*.5*.35+(yy-(y-h*.5))*.35);g.stroke();}
  /* обручи */
  for(i=0;i<5;i++){var hx0=x0+L*(.1+i*.19),sc=i===4?.55:1;g.strokeStyle=dk;g.lineWidth=Math.max(1.5,L*.026);g.beginPath();g.ellipse(hx0,y,h*.12*sc,h*.5*sc,0,0,7);g.stroke();
    g.strokeStyle=rgba('#ffffff',.25);g.lineWidth=Math.max(1,L*.008);g.beginPath();g.ellipse(hx0-L*.004,y,h*.12*sc,h*.5*sc,0,Math.PI*.6,Math.PI*1.3);g.stroke();}
  /* плетение поперёк (зигзаг) */
  g.strokeStyle=rgba(wc,.8);g.lineWidth=Math.max(1,L*.008);
  for(i=0;i<14;i++){var px=x0+L*(.14+i*.056),ph=h*.5*(1-Math.max(0,(px-(x1-L*.25))/(L*.25))*.45);g.beginPath();for(var j=0;j<=6;j++){var py=y-ph+ph*2*j/6;g[j?'lineTo':'moveTo'](px+(j%2?L*.012:0),py);}g.stroke();}
  /* хвост — перевязанный конец */
  g.fillStyle=dk;g.beginPath();g.moveTo(x1-L*.1,y-h*.28);g.quadraticCurveTo(x1+L*.02,y,x1-L*.1,y+h*.28);g.fill();
  g.strokeStyle=tn('#c9b48a');g.lineWidth=Math.max(1.5,L*.018);g.beginPath();g.moveTo(x1-L*.06,y-h*.2);g.lineTo(x1-L*.06,y+h*.2);g.stroke();
  g.beginPath();g.moveTo(x1-L*.05,y);g.quadraticCurveTo(x1+L*.06,y-h*.1,x1+L*.1,y+h*.15);g.stroke();
  /* горловина-воронка */
  var mg=g.createRadialGradient(x0+L*.04,y,1,x0+L*.04,y,h*.5);mg.addColorStop(0,'rgba(10,8,4,.85)');mg.addColorStop(.55,'rgba(25,18,8,.6)');mg.addColorStop(1,rgba(dk,.9));
  g.fillStyle=mg;g.beginPath();g.ellipse(x0+L*.05,y,h*.16,h*.5,0,0,7);g.fill();
  g.strokeStyle=dk;g.lineWidth=Math.max(2,L*.03);g.beginPath();g.ellipse(x0+L*.05,y,h*.16,h*.5,0,0,7);g.stroke();
  g.strokeStyle=rgba(wc,.9);g.lineWidth=Math.max(1,L*.008);for(i=0;i<10;i++){var a=i/10*Math.PI*2;g.beginPath();g.moveTo(x0+L*.05+Math.cos(a)*h*.16,y+Math.sin(a)*h*.5);g.lineTo(x0+L*.13+Math.cos(a)*h*.05,y+Math.sin(a)*h*.17);g.stroke();}
  /* мокрый блеск и капли */
  if(wet>0){g.strokeStyle='rgba(220,240,255,'+(.35*wet)+')';g.lineWidth=Math.max(1,L*.01);g.beginPath();g.moveTo(x0+L*.15,y-h*.42);g.quadraticCurveTo(x,y-h*.5,x1-L*.15,y-h*.3);g.stroke();
    g.fillStyle='rgba(210,235,250,'+(.8*wet)+')';for(i=0;i<7;i++){var dx=x0+L*(.12+i*.12),dy=y+h*.5+((t*1.6+i*.37)%1)*h*.6;g.beginPath();g.ellipse(dx,dy,L*.006+1,L*.012+1.5,0,0,7);g.fill();}}
  g.restore();
  return {mx:x0+L*.05,my:y,mh:h*.5};};

/* ---------- рак сверху. Голова — в сторону +x. L — длина от клешней до хвоста.
   o: {k:'shir'|'dlin'|'blue'|'gold', t:время (ножки), walk:0..1, curl:0..1 — хвост поджат, claw:0..1 — раскрыть клешни, P} */
A.RAK={shir:{b:'#5a4a2a',h:'#8a7445',c:'#4a3c22',n:'Широкопалый рак',w:1},dlin:{b:'#6e5e34',h:'#a08a52',c:'#5e5030',n:'Длиннопалый рак',w:.72},blue:{b:'#2f557a',h:'#6a9ac8',c:'#264a6a',n:'Голубой рак',w:1},gold:{b:'#b8862a',h:'#f2cf6a',c:'#9a6c18',n:'Золотистый рак',w:1}};
A.rak=function(g,x,y,L,ang,o){o=o||{};var K=A.RAK[o.k]||A.RAK.shir,P=o.P,tn=P?P.tint:function(c){return c;},t=o.t||0,wk=o.walk||0,cw=K.w;
  var base=tn(K.b),hi=tn(K.h),cl=tn(K.c);
  g.save();g.translate(x,y);g.rotate(ang||0);var s=L;
  /* тень */
  if(!o.noShadow){g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(-s*.02,s*.05,s*.42,s*.13,0,0,7);g.fill();}
  g.lineCap='round';g.lineJoin='round';
  /* усики */
  g.strokeStyle=shade(base,.8);g.lineWidth=Math.max(.8,s*.012);
  for(var sd=-1;sd<=1;sd+=2){var aw=Math.sin(t*3+sd)*s*.04;g.beginPath();g.moveTo(s*.22,sd*s*.03);g.quadraticCurveTo(s*.5,sd*s*.1+aw,s*.62,sd*s*.32+aw*2);g.quadraticCurveTo(s*.66,sd*s*.4,s*.6,sd*s*.48+aw);g.stroke();
    g.beginPath();g.moveTo(s*.22,sd*s*.015);g.lineTo(s*.32,sd*s*.06+aw*.4);g.stroke();}
  /* ножки: 4 пары, шагают */
  g.strokeStyle=shade(base,.85);g.lineWidth=Math.max(1,s*.022);
  for(var i=0;i<4;i++)for(sd=-1;sd<=1;sd+=2){var ph=Math.sin(t*12*wk+i*1.6+(sd>0?Math.PI:0))*wk,lx=s*(.12-i*.06),ex=lx+s*(.03-i*.03)+ph*s*.05,ey=sd*s*(.22+i*.01);
    g.beginPath();g.moveTo(lx,sd*s*.06);g.lineTo(lx+s*.02+ph*s*.02,sd*s*.17);g.lineTo(ex,ey);g.stroke();}
  /* клешни: плечо + клешня */
  var op=o.claw||0;
  for(sd=-1;sd<=1;sd+=2){var sw=Math.sin(t*2+sd*.7)*.05;g.save();g.translate(s*.16,sd*s*.05);g.rotate(sd*(.55+sw));
    g.fillStyle=base;g.beginPath();g.ellipse(s*.09,0,s*.1,s*.036,0,0,7);g.fill();g.fillStyle=rgba('#ffffff',.15);g.beginPath();g.ellipse(s*.09,-s*.012,s*.07,s*.01,0,0,7);g.fill();
    g.translate(s*.18,0);g.rotate(-sd*(.55+sw)*.95);
    var cL=s*.32,cWd=s*.1*cw;
    var cg=g.createLinearGradient(0,-cWd,0,cWd);cg.addColorStop(0,hi);cg.addColorStop(.5,base);cg.addColorStop(1,cl);g.fillStyle=cg;
    g.beginPath();g.moveTo(-s*.02,0);g.quadraticCurveTo(cL*.25,-cWd*1.15,cL*.55,-cWd*.8);g.quadraticCurveTo(cL*.95,-cWd*.55,cL*1.08,-cWd*.1-op*cWd*.4);
    g.quadraticCurveTo(cL*.8,-cWd*.05,cL*.55,cWd*.1);g.quadraticCurveTo(cL*.85,cWd*.25+op*cWd*.5,cL*.98,cWd*.55+op*cWd*.7);g.quadraticCurveTo(cL*.6,cWd*.9,cL*.3,cWd*.85);g.quadraticCurveTo(cL*.05,cWd*.7,-s*.02,0);g.fill();
    g.strokeStyle=rgba('#000000',.3);g.lineWidth=Math.max(.6,s*.006);g.stroke();
    /* бугорки */
    g.fillStyle=rgba('#ffffff',.18);for(var j=0;j<4;j++){g.beginPath();g.arc(cL*(.2+j*.13),-cWd*(.45-j*.05),s*.008+.5,0,7);g.fill();}
    g.restore();}
  /* хвост (брюшко): 6 сегментов + веер */
  var curl=o.curl||0,tl=s*.42*(1-curl*.45);
  for(i=5;i>=0;i--){var sx=-s*.06-tl*(i+.5)/6.4,wd=s*(.13-i*.009);var sg2=g.createLinearGradient(0,-wd,0,wd);sg2.addColorStop(0,cl);sg2.addColorStop(.35,hi);sg2.addColorStop(.6,base);sg2.addColorStop(1,cl);
    g.fillStyle=sg2;rr(g,sx-tl/12,-wd,tl/6.4+s*.01,wd*2,wd*.6);g.fill();g.strokeStyle=rgba('#000000',.28);g.lineWidth=Math.max(.6,s*.006);g.stroke();}
  var fx=-s*.06-tl*1.0;g.fillStyle=base;
  for(j=-2;j<=2;j++){g.save();g.translate(fx,0);g.rotate(Math.PI+j*.33);g.beginPath();g.ellipse(s*.06,0,s*.07,s*.036,0,0,7);g.fill();g.strokeStyle=rgba('#000000',.25);g.stroke();g.restore();}
  /* панцирь */
  var bg=g.createRadialGradient(s*.08,-s*.04,s*.01,s*.06,0,s*.2);bg.addColorStop(0,hi);bg.addColorStop(.6,base);bg.addColorStop(1,cl);g.fillStyle=bg;
  g.beginPath();g.moveTo(s*.31,0);g.quadraticCurveTo(s*.27,-s*.06,s*.2,-s*.09);g.quadraticCurveTo(s*.05,-s*.16,-s*.09,-s*.13);g.quadraticCurveTo(-s*.14,0,-s*.09,s*.13);g.quadraticCurveTo(s*.05,s*.16,s*.2,s*.09);g.quadraticCurveTo(s*.27,s*.06,s*.31,0);g.fill();
  g.strokeStyle=rgba('#000000',.3);g.lineWidth=Math.max(.7,s*.007);g.stroke();
  /* борозда и блик */
  g.strokeStyle=rgba('#000000',.25);g.beginPath();g.moveTo(s*.06,-s*.08);g.quadraticCurveTo(s*.02,0,s*.06,s*.08);g.stroke();
  g.fillStyle=rgba('#ffffff',.22);g.beginPath();g.ellipse(s*.1,-s*.04,s*.07,s*.02,-.15,0,7);g.fill();
  /* глаза */
  g.fillStyle=shade(base,.7);g.beginPath();g.arc(s*.26,-s*.045,s*.02+.6,0,7);g.arc(s*.26,s*.045,s*.02+.6,0,7);g.fill();g.fillStyle='#111';g.beginPath();g.arc(s*.27,-s*.048,s*.013+.5,0,7);g.arc(s*.27,s*.048,s*.013+.5,0,7);g.fill();
  if(o.k==='gold'){g.globalCompositeOperation='lighter';glow(g,0,0,s*.6,'255,220,120',.25);g.globalCompositeOperation='source-over';}
  g.restore();};

/* ---------- Петрович во весь рост: рисунок MG0 (js/mg-art.js, MG_ART.petr; позы pull/fish/up/hold и o.blink перенесены туда при сведении 08.10) ---------- */
/* x — середина ступней, y — земля, h — рост. o.pose: stand | point | pull | cheer | hold | fish; o.dir 1/-1; o.blink; o.span (px — полуразмах рук для рыбы) */
A.petr=function(g,x,y,h,o){o=o||{};var P=o.P,s=h*.93,k=s/100,night=!!(P&&P.tod==='night'),pose=o.pose||'stand';
  var arm={stand:'rest',point:'point',pull:'pull',cheer:'up',hold:'hold',fish:'fish',photo:'hold'}[pose]||'rest';
  var face=pose==='cheer'?'laugh':o.wow?'wow':'smile';
  g.save();g.translate(x,y);g.scale(o.dir||1,1);
  MG_ART.petr(g,0,0,s,o.t||0,{arm:arm,face:face,night:night,blink:!!o.blink,span:o.span?o.span/k:30,look:pose==='pull'?-.6:0});
  g.restore();};

/* ---------- кот Васька, сидит боком (смотрит вправо, если dir=1) ---------- */
A.cat=function(g,x,y,s,o){o=o||{};if(window.MG_ART&&MG_ART.cat){try{MG_ART.cat(g,x,y,s*1.35,o.t||0,{pose:o.pose||'sit',look:o.dir<0?-.5:.5,night:!!(o.P&&o.P.tod==='night')});return;}catch(e){}}
  var P=o.P,tn=P?P.tint:function(c){return c;},t=o.t||0,dir=o.dir||1,col=tn('#e08a3a'),dk=tn('#b8621f'),lt=tn('#f6c48a');
  g.save();g.translate(x,y);g.scale(dir,1);
  g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(0,0,s*.5,s*.08,0,0,7);g.fill();
  /* хвост */
  var tw=Math.sin(t*1.7)*s*.12;g.strokeStyle=col;g.lineWidth=s*.11;g.lineCap='round';g.beginPath();g.moveTo(-s*.3,-s*.08);g.quadraticCurveTo(-s*.7,-s*.05,-s*.62+tw*.3,-s*.4+tw);g.stroke();
  g.strokeStyle=dk;g.lineWidth=s*.11;g.setLineDash([s*.06,s*.08]);g.beginPath();g.moveTo(-s*.4,-s*.07);g.quadraticCurveTo(-s*.7,-s*.05,-s*.62+tw*.3,-s*.4+tw);g.stroke();g.setLineDash([]);
  /* тело */
  var bg=g.createRadialGradient(-s*.05,-s*.4,s*.05,0,-s*.3,s*.5);bg.addColorStop(0,lt);bg.addColorStop(.5,col);bg.addColorStop(1,dk);g.fillStyle=bg;
  g.beginPath();g.ellipse(-s*.05,-s*.27,s*.32,s*.3,0,0,7);g.fill();
  g.beginPath();g.ellipse(s*.12,-s*.36,s*.16,s*.26,-.2,0,7);g.fill();
  /* полоски */
  g.strokeStyle=rgba(dk,.8);g.lineWidth=s*.04;for(var i=0;i<3;i++){g.beginPath();g.arc(-s*.1+i*s*.09,-s*.32,s*.24,-2.3,-1.6);g.stroke();}
  /* лапки */
  g.fillStyle=lt;g.beginPath();g.ellipse(s*.18,-s*.04,s*.08,s*.05,0,0,7);g.ellipse(s*.05,-s*.03,s*.08,s*.05,0,0,7);g.fill();
  /* голова */
  var hy=-s*.66,hx=s*.2;g.fillStyle=col;g.beginPath();g.ellipse(hx,hy,s*.2,s*.17,0,0,7);g.fill();
  g.beginPath();g.moveTo(hx-s*.16,hy-s*.08);g.lineTo(hx-s*.13,hy-s*.3);g.lineTo(hx-s*.02,hy-s*.14);g.fill();g.beginPath();g.moveTo(hx+s*.04,hy-s*.15);g.lineTo(hx+s*.14,hy-s*.3);g.lineTo(hx+s*.18,hy-s*.06);g.fill();
  g.fillStyle=tn('#f2a6a0');g.beginPath();g.moveTo(hx-s*.13,hy-s*.12);g.lineTo(hx-s*.12,hy-s*.24);g.lineTo(hx-s*.06,hy-s*.14);g.fill();
  g.fillStyle=lt;g.beginPath();g.ellipse(hx+s*.07,hy+s*.06,s*.1,s*.07,0,0,7);g.fill();
  var night=P&&P.tod==='night',bl=(t%5)<.14;
  if(bl){g.strokeStyle='#2a1a0a';g.lineWidth=s*.02;g.beginPath();g.moveTo(hx-s*.06,hy-s*.02);g.lineTo(hx+s*.0,hy-s*.02);g.moveTo(hx+s*.07,hy-s*.02);g.lineTo(hx+s*.13,hy-s*.02);g.stroke();}
  else{g.fillStyle=night?'#c8f060':'#7aa22a';g.beginPath();g.ellipse(hx-s*.03,hy-s*.02,s*.035,s*.045,0,0,7);g.ellipse(hx+s*.1,hy-s*.02,s*.035,s*.045,0,0,7);g.fill();
    g.fillStyle='#111';g.beginPath();g.ellipse(hx-s*.025,hy-s*.02,s*.012,s*.035,0,0,7);g.ellipse(hx+s*.105,hy-s*.02,s*.012,s*.035,0,0,7);g.fill();}
  g.fillStyle='#d86a6a';g.beginPath();g.moveTo(hx+s*.05,hy+s*.04);g.lineTo(hx+s*.09,hy+s*.04);g.lineTo(hx+s*.07,hy+s*.065);g.fill();
  g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=Math.max(.6,s*.008);g.beginPath();for(i=0;i<3;i++){g.moveTo(hx+s*.12,hy+s*.06+i*s*.015);g.lineTo(hx+s*.3,hy+s*.03+i*s*.03);}g.stroke();
  g.restore();};

/* ---------- фонарь «летучая мышь» (висит/стоит), свет — отдельно glowLamp ---------- */
A.lamp=function(g,x,y,s,t,glowOn,lit){if(lit===undefined)lit=glowOn;var k=.92+.08*Math.sin(t*7)+.04*Math.sin(t*17);
  if(glowOn){g.save();g.globalCompositeOperation='lighter';glow(g,x,y-s*.5,s*7*k,'255,200,110',.32);glow(g,x,y-s*.5,s*2.2*k,'255,220,150',.5);g.restore();}
  g.fillStyle='#2a2a2a';g.fillRect(x-s*.42,y-s*.08,s*.84,s*.12);
  var gl=g.createLinearGradient(x-s*.3,0,x+s*.3,0);gl.addColorStop(0,lit?'#ffcf6a':'#8a9aa2');gl.addColorStop(.5,lit?'#fff2c0':'#c6d2d8');gl.addColorStop(1,lit?'#ffb84a':'#7a8a92');
  g.fillStyle=gl;g.beginPath();g.ellipse(x,y-s*.5,s*.3,s*.42,0,0,7);g.fill();
  if(lit){g.fillStyle='#fff8d8';g.beginPath();g.ellipse(x,y-s*.45,s*.06,s*.14*k,0,0,7);g.fill();}
  g.strokeStyle='#2a2a2a';g.lineWidth=Math.max(1,s*.06);g.beginPath();g.moveTo(x-s*.3,y-s*.5);g.lineTo(x+s*.3,y-s*.5);g.moveTo(x,y-s*.92);g.lineTo(x,y-s*.08);g.stroke();
  g.fillStyle='#b8352a';g.beginPath();g.moveTo(x-s*.36,y-s*.88);g.quadraticCurveTo(x,y-s*1.08,x+s*.36,y-s*.88);g.lineTo(x+s*.3,y-s*.82);g.lineTo(x-s*.3,y-s*.82);g.fill();
  g.strokeStyle='#2a2a2a';g.lineWidth=Math.max(1,s*.05);g.beginPath();g.arc(x,y-s*1.1,s*.2,Math.PI*1.1,Math.PI*1.9);g.stroke();};

/* ---------- светлячки / мошкара (ночь — светлячки) ---------- */
A.flies=function(n,W,y0,y1,seed){var R=rnd(seed||9),a=[];for(var i=0;i<n;i++)a.push({x:R()*W,y:y0+R()*(y1-y0),ph:R()*7,s:.5+R()});return a;};
A.drawFlies=function(g,F,t,u,night){for(var i=0;i<F.length;i++){var f=F[i],x=f.x+Math.sin(t*.6*f.s+f.ph)*u*4,y=f.y+Math.cos(t*.8*f.s+f.ph)*u*2,a=.5+.5*Math.sin(t*3*f.s+f.ph);
  if(night){glow(g,x,y,u*1.6,'210,255,140',.5*a);g.fillStyle='rgba(235,255,180,'+(.6+.4*a)+')';g.beginPath();g.arc(x,y,u*.25,0,7);g.fill();}
  else{g.fillStyle='rgba(30,30,20,'+(.35*a)+')';g.fillRect(x,y,1.5,1.5);}}};

/* ---------- плашка-подпись на холсте ---------- */
A.chip=function(g,x,y,txt,o){o=o||{};var fs=o.fs||17;g.font='600 '+fs+'px '+(A.font||'sans-serif');var w=g.measureText(txt).width+fs*1.3,h=fs*1.75;
  g.fillStyle=o.bg||'rgba(16,36,44,.62)';rr(g,x-w/2,y-h/2,w,h,h/2);g.fill();if(o.ring){g.strokeStyle=o.ring;g.lineWidth=2;g.stroke();}
  g.fillStyle=o.col||'#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,x,y+1);return {w:w,h:h};};
/* звёздочка */
A.star=function(g,x,y,r,fill,stroke){g.beginPath();for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*.45:r;g[i?'lineTo':'moveTo'](x+Math.cos(a)*rr2,y+Math.sin(a)*rr2);}g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=Math.max(1,r*.12);g.stroke();}};

/* шрифт игры (Golos Text через --font) */
A.fontOf=function(el){try{var f=getComputedStyle(el||document.body).fontFamily;if(f)A.font=f;}catch(e){}return A.font;};

/* ---------- стили оверлея ---------- */
A.css=function(){if(document.getElementById('mgc-css'))return;var s=document.createElement('style');s.id='mgc-css';s.textContent=[
 '.mgc{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:none;font-family:var(--font,inherit);color:#fff}',
 '.mgc>canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}',
 '.mgc .mgc-top{position:absolute;left:0;right:0;top:0;padding:calc(66px + env(safe-area-inset-top,0px)) 16px 0 16px;display:flex;flex-direction:column;align-items:flex-start;pointer-events:none}',
 '.mgc .mgc-ttl{font-size:24px;font-weight:600;text-shadow:0 2px 6px rgba(0,0,0,.55);line-height:1.15}',
 '.mgc .mgc-sub{font-size:17px;opacity:.95;text-shadow:0 1px 4px rgba(0,0,0,.6);margin-top:2px}',
 '.mgc.cnt-on .mgc-say{max-width:calc(100% - 156px)}',
 '.mgc .mgc-cnt{position:absolute;right:16px;top:calc(10px + env(safe-area-inset-top,0px));min-width:88px;height:52px;padding:0 14px;border-radius:26px;background:rgba(14,30,38,.62);display:flex;align-items:center;justify-content:center;gap:8px;font-size:24px;font-weight:600;box-shadow:0 4px 14px rgba(0,0,0,.25);pointer-events:none}',
 '.mgc .mgc-cnt canvas{position:static;width:34px;height:34px}',
 '.mgc .mgc-cnt.pop{animation:mgcPop .35s}',
 '@keyframes mgcPop{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}',
 '.mgc .mgc-say{position:absolute;left:16px;top:calc(140px + env(safe-area-inset-top,0px));max-width:min(calc(100% - 32px),460px);padding:10px 16px 10px 10px;border-radius:20px;display:flex;align-items:center;gap:10px;background:var(--say,rgba(255,252,240,.96));color:var(--tx,#2a2a2a);font-size:18px;line-height:1.3;box-shadow:0 6px 20px rgba(0,0,0,.25);pointer-events:none;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s}',
 '.mgc .mgc-say.on{opacity:1;transform:none}',
 '.mgc .mgc-say b{font-weight:600}',
 '.mgc .mgc-say .av{flex:0 0 52px;width:52px;height:52px;border-radius:26px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,.25)}.mgc .mgc-say .av svg{width:52px;height:52px;display:block}',
 '.mgc svg.ic{width:26px;height:26px;flex:0 0 auto}.mgc .mgc-hold svg.ic{width:28px;height:28px;vertical-align:-6px}',
 '.mgc .mgc-bot{position:absolute;left:0;right:0;bottom:0;padding:0 16px calc(16px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none}',
 '.mgc .mgc-bot>*{pointer-events:auto}',
 '.mgc .mgc-bot .btn{min-height:64px;min-width:min(86vw,360px);font-size:20px;margin:0;display:flex;align-items:center;justify-content:center;gap:8px}',
 '.mgc .mgc-bot .btn.sm{min-height:56px;font-size:18px}',
 '.mgc .mgc-hold{width:min(86vw,360px);height:72px;border-radius:36px;position:relative;overflow:hidden;background:rgba(14,30,38,.62);box-shadow:0 6px 18px rgba(0,0,0,.3),inset 0 0 0 2px rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:600;touch-action:none}',
 '.mgc .mgc-hold i{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,var(--acc1,#2fae6a),var(--acc2,#1d8a50))}',
 '.mgc .mgc-hold span{position:relative}',
 '.mgc .mgc-hold.on{box-shadow:0 2px 8px rgba(0,0,0,.3),inset 0 0 0 3px rgba(255,255,255,.7)}',
 '.mgc .mgc-fin{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) scale(.9);width:min(88vw,400px);padding:22px 18px 18px;border-radius:24px;background:var(--modal,rgba(255,252,244,.97));color:var(--tx,#24303a);text-align:center;box-shadow:0 18px 48px rgba(0,0,0,.4);opacity:0;transition:opacity .3s,transform .3s;pointer-events:none}',
 '.mgc .mgc-fin.on{opacity:1;transform:translate(-50%,-50%) scale(1);pointer-events:auto}',
 '.mgc .mgc-fin h2{margin:4px 0 6px;font-size:26px;font-weight:600}',
 '.mgc .mgc-fin p{margin:6px 0;font-size:18px;line-height:1.35}',
 '.mgc .mgc-fin .stars{display:flex;justify-content:center;gap:8px;margin:2px 0 6px}',
 '.mgc .mgc-fin .stars canvas{position:static;width:52px;height:52px}',
 '.mgc .mgc-fin .big{font-size:44px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:10px}',
 '.mgc .mgc-fin .big canvas{position:static;width:64px;height:64px}',
 '.mgc .mgc-fin .rec{display:inline-block;padding:4px 12px;border-radius:12px;background:var(--gold,#f2c24a);color:#3a2a00;font-weight:600;font-size:17px}',
 '.mgc .mgc-fin .btn{min-height:60px;width:100%;font-size:20px;margin:12px 0 0}',
 '.mgc .mgc-fin .row2{display:flex;gap:10px}.mgc .mgc-fin .row2 .btn{flex:1 1 0;min-width:0}',
 '.mgc .mgc-hint{position:absolute;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:20px;background:rgba(14,30,38,.66);font-size:18px;white-space:nowrap;pointer-events:none;transition:opacity .3s}',
 '.mgc.fin-on .mgc-top,.mgc.fin-on .mgc-cnt{opacity:0}',
 '.mgc .mgc-top{transition:opacity .25s}',
 '@media (max-height:700px){.mgc .mgc-top{padding-top:calc(62px + env(safe-area-inset-top,0px))}.mgc .mgc-ttl{font-size:22px}.mgc .mgc-say{top:calc(122px + env(safe-area-inset-top,0px));font-size:17px;padding:8px 12px 8px 8px}.mgc .mgc-say .av,.mgc .mgc-say .av svg{width:40px;height:40px;flex-basis:40px}.mgc .mgc-fin{padding:16px 14px 14px}.mgc .mgc-fin h2{font-size:23px}.mgc .mgc-fin .big{font-size:38px}.mgc .mgc-fin .big canvas{width:52px;height:52px}.mgc .mgc-fin .stars canvas{width:44px;height:44px}.mgc .mgc-fin .btn{min-height:56px}}',
 '@media (min-width:900px){.mgc .mgc-say{top:calc(146px + env(safe-area-inset-top,0px))}.mgc .mgc-ttl{font-size:28px}.mgc .mgc-say{font-size:19px}}'
].join('\n');document.head.appendChild(s);};

/* маленький холст-значок (рак/звезда) для DOM */
A.icon=function(kind,px,o){var c=document.createElement('canvas'),d=Math.min(2,window.devicePixelRatio||1)*1.5;c.width=c.height=Math.round(px*d);var g=c.getContext('2d');g.scale(d,d);
  if(kind==='rak')A.rak(g,px*.55,px*.5,px*.95,-Math.PI/2,{k:o&&o.k||'shir',noShadow:1});
  else if(kind==='star')A.star(g,px/2,px/2,px*.46,o&&o.off?'rgba(150,150,150,.35)':'#f6c142',o&&o.off?null:'#b8860b');
  return c;};

window.MGCA=A;
})();
