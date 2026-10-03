/* K1: тема Е «Двор-мозаика» (макет release-f/kirp-look/f-mosaic.html).
   Кирпичики — глазурованные изразцы с росписью (свой узор на каждый из 8 цветов), поле — терраццо с золотой линией,
   на торце дома — советская мозаика из смальты (солнце, голубь, волны), под лотком — мозаичная розетка на мостовой;
   карта — плиточная дорожка с кобальтовым бордюром, уровни — «гжельские» тарелки, места глав — мозаичные панно;
   окна — синий изразцовый верх с волной и медальон соседа из плиточек. Интерфейс спокойный: сливки, тушь, кобальт, терракота.
   Кирпичики и поле рисуются один раз в кэш (look.js), на кадр — только переворот плитки, кольцо и частицы. */
(function(){
'use strict';
var RR=LK.RR,mixHex=LK.mixHex,R0=LK.R0,clamp=LK.clamp,ease=LK.ease,svgUri=LK.svgUri;
function T(ru,en){return typeof L==='function'?L(ru,en):ru;}
function esc(t){return String(t).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
function pURI(id,m){try{return svgUri(portrait(id,m||'happy'));}catch(e){return '';}}
function tod(){var h=new Date().getHours();return h>=6&&h<18?'day':h>=18&&h<22?'eve':'night';}
var INK='#1e2a44',COB='#2c62c4',COB2='#1d4796',TERRA='#d6573a',GOLD='#c99a2e',GOLDL='#d9ab3c',PAPER='#fffdf9';
// терракота, шафран, олива, бирюза, кобальт, слива, апельсин, роза
var PAL=['#d6573a','#e9a72c','#5fa13e','#13a3a0','#2c62c4','#8a4b9c','#ec8a3a','#d9507a'];

/* ---------- роспись изразца: 8 узоров (цветок, солнышко, листок, волна, звезда, ромб, круг с точками, сердечко) ---------- */
function motif(g,k,cx,cy,s,col){var z=s*.22,i,a,r;g.save();g.translate(cx,cy);g.fillStyle=col;g.strokeStyle=col;g.lineWidth=Math.max(1,s*.045);g.lineCap='round';g.lineJoin='round';
 switch(k%8){
  case 0:for(i=0;i<4;i++){g.save();g.rotate(i*Math.PI/2);g.beginPath();g.ellipse(0,-z*.62,z*.3,z*.55,0,0,7);g.fill();g.restore();}g.beginPath();g.arc(0,0,z*.2,0,7);g.fill();break;
  case 1:g.beginPath();g.arc(0,0,z*.42,0,7);g.fill();for(i=0;i<8;i++){a=i*Math.PI/4;g.beginPath();g.arc(Math.cos(a)*z*.85,Math.sin(a)*z*.85,z*.12,0,7);g.fill();}break;
  case 2:g.beginPath();g.moveTo(0,-z);g.quadraticCurveTo(z*.9,0,0,z);g.quadraticCurveTo(-z*.9,0,0,-z);g.fill();g.strokeStyle='rgba(0,0,0,.14)';g.beginPath();g.moveTo(0,-z*.8);g.lineTo(0,z*.8);g.stroke();break;
  case 3:for(var j=-1;j<=1;j++){g.beginPath();for(i=0;i<=8;i++){var x=-z+i*z/4,y=j*z*.6+Math.sin(i*Math.PI/2)*z*.18;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();}break;
  case 4:g.beginPath();for(i=0;i<16;i++){r=i%2?z*.42:z;a=i*Math.PI/8-Math.PI/2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();break;
  case 5:g.beginPath();g.moveTo(0,-z);g.lineTo(z*.7,0);g.lineTo(0,z);g.lineTo(-z*.7,0);g.closePath();g.stroke();g.beginPath();g.arc(0,0,z*.22,0,7);g.fill();break;
  case 6:g.beginPath();g.arc(0,0,z*.75,0,7);g.stroke();for(i=0;i<4;i++){a=i*Math.PI/2+Math.PI/4;g.beginPath();g.arc(Math.cos(a)*z*.36,Math.sin(a)*z*.36,z*.13,0,7);g.fill();}break;
  case 7:g.beginPath();g.moveTo(0,z*.75);g.bezierCurveTo(-z*1.1,-z*.05,-z*.45,-z*.95,0,-z*.32);g.bezierCurveTo(z*.45,-z*.95,z*1.1,-z*.05,0,z*.75);g.fill();break;}
 g.restore();}
/* изразец: глазурь гуще у краёв, фаска, роспись, отражение окна (две косые полосы), светлая кромка сверху и слева */
function tile(g,x,y,s,c,k){var m=s*.045,w=s-2*m,r=s*.1,gr;
  g.fillStyle='rgba(60,40,20,.28)';RR(g,x+m,y+m+s*.035,w,w,r);g.fill();
  g.fillStyle=mixHex(c,-.3);RR(g,x+m,y+m,w,w,r);g.fill();
  gr=g.createRadialGradient(x+s*.42,y+s*.4,s*.05,x+s*.5,y+s*.5,s*.62);gr.addColorStop(0,mixHex(c,.2));gr.addColorStop(.6,c);gr.addColorStop(1,mixHex(c,-.22));g.fillStyle=gr;RR(g,x+m+s*.02,y+m+s*.015,w-s*.04,w-s*.04,r*.9);g.fill();
  motif(g,k,x+s*.5,y+s*.5,s,'rgba(255,250,238,.66)');
  g.save();RR(g,x+m,y+m,w,w,r);g.clip();g.fillStyle='rgba(255,255,255,.26)';g.beginPath();g.moveTo(x+s*.52,y);g.lineTo(x+s*.8,y);g.lineTo(x+s*.38,y+s);g.lineTo(x+s*.1,y+s);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(x+s*.86,y);g.lineTo(x+s*.94,y);g.lineTo(x+s*.52,y+s);g.lineTo(x+s*.44,y+s);g.closePath();g.fill();g.restore();
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=Math.max(1,s*.025);g.beginPath();g.moveTo(x+m+r,y+m+1);g.lineTo(x+s-m-r,y+m+1);g.stroke();
  g.strokeStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(x+m+1,y+m+r);g.lineTo(x+m+1,y+s-m-r);g.stroke();}
/* старый кирпич завала — бетонная плитка с крошкой и трещиной */
function concrete(g,x,y,s){var m=s*.045,w=s-2*m,gr,R=R0(5),i;
  g.fillStyle='rgba(60,40,20,.25)';RR(g,x+m,y+m+s*.035,w,w,s*.08);g.fill();
  gr=g.createLinearGradient(x,y,x+s,y+s);gr.addColorStop(0,'#d3cbbe');gr.addColorStop(1,'#a9a092');g.fillStyle=gr;RR(g,x+m,y+m,w,w,s*.08);g.fill();
  for(i=0;i<26;i++){g.fillStyle=R()<.5?'rgba(255,255,255,.4)':'rgba(60,50,40,.28)';g.fillRect(x+m+R()*w*.94,y+m+R()*w*.94,s*.035,s*.035);}
  g.strokeStyle='rgba(60,50,40,.62)';g.lineWidth=Math.max(1,s*.032);g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(x+s*.25,y+s*.2);g.lineTo(x+s*.44,y+s*.46);g.lineTo(x+s*.36,y+s*.78);g.moveTo(x+s*.44,y+s*.46);g.lineTo(x+s*.8,y+s*.55);g.stroke();
  g.fillStyle='rgba(255,255,255,.35)';RR(g,x+m+s*.1,y+m+s*.05,w-s*.2,s*.06,s*.03);g.fill();}

/* ---------- двор: торец дома со смальтовой мозаикой; day | eve | night ---------- */
var YC={};
function yardE(tod){if(YC[tod])return YC[tod];var R=R0(41),night=tod==='night',eve=tod==='eve',lit=[],i,x,y;
 var sky=night?['#16213d','#2a3960','#4a527a']:eve?['#9db2d8','#f0c7ae','#f8e2c8']:['#cfe4ef','#eef0e8','#f6eee2'];
 var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice"><defs>'+
 '<linearGradient id="esk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sky[0]+'"/><stop offset=".55" stop-color="'+sky[1]+'"/><stop offset=".8" stop-color="'+sky[2]+'"/></linearGradient>'+
 '<linearGradient id="ewl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#efe6d6"/><stop offset="1" stop-color="#e3d6c1"/></linearGradient>'+
 '<linearGradient id="ewl2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9cbb4"/><stop offset="1" stop-color="#cdbda4"/></linearGradient>'+
 '<linearGradient id="egd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece2d2"/><stop offset="1" stop-color="#e2d4bf"/></linearGradient>'+
 '<radialGradient id="elmp"><stop offset="0" stop-color="#fff1c4" stop-opacity=".85"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>'+
 '</defs><rect width="1200" height="800" fill="url(#esk)"/>';
 if(night){for(i=0;i<60;i++)s+='<circle cx="'+(R()*1200).toFixed(0)+'" cy="'+(R()*300).toFixed(0)+'" r="'+(.8+R()*1.6).toFixed(1)+'" fill="#fff" opacity="'+(.35+R()*.6).toFixed(2)+'"/>';
   s+='<circle cx="1010" cy="110" r="40" fill="#fbf1d0"/><circle cx="1026" cy="98" r="36" fill="#2a3960"/>';}
 else s+='<circle cx="'+(eve?980:1010)+'" cy="'+(eve?300:110)+'" r="44" fill="'+(eve?'#f9c58a':'#fbe7b6')+'" opacity=".95"/>';
 // дальний план — бледные силуэты
 [[40,170,300],[560,150,270],[1000,170,290]].forEach(function(q){s+='<rect x="'+q[0]+'" y="'+(560-q[2])+'" width="'+q[1]+'" height="'+q[2]+'" fill="'+(night?'#36446c':eve?'#d8c8cc':'#dfe6e6')+'"/>';});
 // главный дом: торец с мозаикой (центр сцены — видно и на телефоне)
 var mx=430,my=200,mw=340,mh=360,cell=12,cols=mw/cell|0,rows=mh/cell|0,r,c;
 s+='<rect x="'+(mx-20)+'" y="'+(my-20)+'" width="'+(mw+40)+'" height="'+(mh+400)+'" fill="url(#ewl)"/><rect x="'+(mx-26)+'" y="'+(my-32)+'" width="'+(mw+52)+'" height="14" fill="#cbbba3"/>';
 s+='<rect x="'+(mx-4)+'" y="'+(my-4)+'" width="'+(cols*cell+8)+'" height="'+(rows*cell+8)+'" fill="#f7f1e6"/>';
 for(r=0;r<rows;r++)for(c=0;c<cols;c++){x=c*cell+cell/2;y=r*cell+cell/2;var dx=x-110,dy=y-110,d=Math.sqrt(dx*dx+dy*dy),a=Math.atan2(dy,dx),col,
   bx=x-215,by=y-200,body=(bx*bx)/(70*70)+(by*by)/(34*34)<1,wing=x>170&&x<300&&y<200&&y>110&&(y-110)>((300-x)*.4),head=Math.sqrt((x-290)*(x-290)+(y-178)*(y-178))<20;
   if(d<46)col=R()<.5?'#f2b632':'#efa424';else if(d<56)col='#f7d27a';else if(d<96&&Math.abs(((a/(Math.PI/8))%2+2)%2-1)<.42)col=R()<.5?'#f2c654':'#ebb03a';
   else if(head||body)col=R()<.6?'#ffffff':'#ecebe6';else if(wing)col=R()<.6?'#f4f4f0':'#dcdcd6';
   else if(y>290){var wv=Math.sin(x/38+(y>320?1.6:0))*8;col=(y+wv)%28<14?(R()<.5?'#2c62c4':'#2a58b0'):(R()<.5?'#13a3a0':'#1b9a96');}
   else if(y>270)col='#f7f1e6';
   else col=['#8fbfe0','#9bc8e6','#86b6da','#a6cfe8'][R()*4|0];
   s+='<rect x="'+(mx+c*cell+1)+'" y="'+(my+r*cell+1)+'" width="'+(cell-2)+'" height="'+(cell-2)+'" rx="1.5" fill="'+col+'"/>';}
 s+='<circle cx="'+(mx+284)+'" cy="'+(my+174)+'" r="3" fill="'+INK+'"/><path d="M'+(mx+306)+' '+(my+176)+'l14 4-14 4z" fill="#e9a72c"/>';
 // боковые корпуса — тёплый светлый кирпич, белые рамы
 function block(x,y,w,fl,cols){var t='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+(fl*50+30)+'" fill="url(#ewl2)"/>',cw=w/cols,f,c,lp=night?.45:eve?.28:0;
   for(f=0;f<fl;f++)for(c=0;c<cols;c++){var wx=x+c*cw+cw*.22,wy=y+18+f*50,ww=cw*.56,on=R()<lp,warm=R()<.15;
     t+='<rect x="'+wx.toFixed(1)+'" y="'+wy+'" width="'+ww.toFixed(1)+'" height="30" fill="#fdfaf4"/><rect x="'+(wx+3).toFixed(1)+'" y="'+(wy+3)+'" width="'+(ww-6).toFixed(1)+'" height="24" fill="'+(warm?'#f4dca4':'#b7cfdc')+'"/><rect x="'+(wx+3).toFixed(1)+'" y="'+(wy+3)+'" width="'+(ww-6).toFixed(1)+'" height="6" fill="#000" opacity=".06"/>';
     if(on)lit.push([wx+3,wy+3,ww-6]);}
   return t;}
 s+=block(-20,300,420,5,6)+block(800,290,420,5,6);
 [[180,COB],[1000,TERRA]].forEach(function(q){s+='<rect x="'+(q[0]-30)+'" y="512" width="60" height="70" fill="'+q[1]+'"/><rect x="'+(q[0]-40)+'" y="502" width="80" height="10" fill="#fdfaf4"/><rect x="'+(q[0]-40)+'" y="512" width="80" height="12" fill="#000" opacity=".08"/>';});
 // геометричные деревья: круги и полукруги в шалфейных тонах, длинные мягкие тени
 function tree(x,y,k,c1,c2){return '<path d="M'+x+' '+(y+4)+'l'+(160*k)+' '+(30*k)+'h-'+(70*k)+'z" fill="#a89577" opacity=".14"/><rect x="'+(x-4*k)+'" y="'+(y-70*k)+'" width="'+8*k+'" height="'+(74*k)+'" fill="#8a7a64"/><circle cx="'+x+'" cy="'+(y-110*k)+'" r="'+60*k+'" fill="'+c1+'"/><path d="M'+x+' '+(y-170*k)+'a'+60*k+' '+60*k+' 0 0 1 0 '+120*k+'z" fill="'+c2+'"/>';}
 s+=tree(70,590,1.1,'#9cbc8a','#86a876')+tree(380,600,.9,'#a7c497','#8fb07e')+tree(820,600,.95,'#9cbc8a','#86a876')+tree(1150,590,1.1,'#a7c497','#8fb07e');
 [260,300,900,940,980].forEach(function(x){s+='<ellipse cx="'+x+'" cy="584" rx="30" ry="20" fill="#9cbc8a"/><ellipse cx="'+x+'" cy="584" rx="30" ry="20" fill="#86a876" opacity=".5" transform="translate(10 4)"/>';});
 // мостовая: крупная плитка в перспективе
 s+='<rect x="0" y="590" width="1200" height="210" fill="url(#egd)"/>';
 for(i=0;i<6;i++){y=590+i*i*7+i*14;s+='<path d="M0 '+y+'h1200" stroke="#d3c4ad" stroke-width="2"/>';}
 for(i=-14;i<=14;i++)s+='<path d="M'+(600+i*46)+' 590L'+(600+i*150)+' 800" stroke="#d3c4ad" stroke-width="2"/>';
 // мозаичная розетка на мостовой — видна под лотком
 (function(){var cx=600,cy=736,K=.3,r0=0,rings=[[30,'#e9a72c','#f2b632'],[52,PAPER,'#f3ebde'],[74,TERRA,'#c94f33'],[96,PAPER,'#f3ebde'],[120,COB,'#2a58b0'],[146,'#13a3a0','#1b9a96'],[170,PAPER,'#efe6d7'],[200,COB,'#2a58b0'],[214,GOLDL,GOLDL]];
  function P(rr,a){return (cx+Math.cos(a)*rr*1.4).toFixed(1)+' '+(cy+Math.sin(a)*rr*K*1.4).toFixed(1);}
  s+='<g opacity=".42"><ellipse cx="'+cx+'" cy="'+(cy+6)+'" rx="300" ry="'+(300*K+8)+'" fill="#000" opacity=".05"/>';
  rings.forEach(function(q){var r=q[0],n=Math.max(8,Math.round(r*.32));for(var j=0;j<n;j++){var a0=j/n*6.283,a1=(j+1)/n*6.283-.035,rm=r0+1.5;
    s+='<path d="M'+P(rm,a0)+'L'+P(r,a0)+'L'+P(r,a1)+'L'+P(rm,a1)+'z" fill="'+(j%2?q[1]:q[2])+'"/>';}r0=r;});s+='</g>';})();
 // лавочка — тонкая графика
 s+='<g transform="translate(1000 640)" stroke="'+INK+'" stroke-width="4" stroke-linecap="round" fill="none"><path d="M-50 0h100M-50-14h100M-42 0v26M42 0v26"/></g><rect x="944" y="626" width="112" height="8" rx="3" fill="'+TERRA+'"/>';
 // вечер и ночь: тень на всё, потом окна и фонари (мозаику подсвечивает прожектор)
 if(eve||night){s+='<rect width="1200" height="800" fill="'+(night?'#0f1a38':'#ff9a6a')+'" opacity="'+(night?.5:.12)+'"/>';
   if(night)s+='<ellipse cx="600" cy="380" rx="230" ry="220" fill="url(#elmp)" opacity=".38"/>';
   lit.forEach(function(q){s+='<rect x="'+q[0].toFixed(1)+'" y="'+q[1]+'" width="'+q[2].toFixed(1)+'" height="24" fill="'+(R()<.5?'#ffd98a':'#ffe9b0')+'"/>';});
   [[300,620],[900,615]].forEach(function(q){s+='<rect x="'+(q[0]-3)+'" y="'+(q[1]-150)+'" width="6" height="150" fill="'+INK+'"/><rect x="'+(q[0]-12)+'" y="'+(q[1]-160)+'" width="24" height="12" rx="3" fill="'+INK+'"/><circle cx="'+q[0]+'" cy="'+(q[1]-146)+'" r="7" fill="#fff3c0"/><circle cx="'+q[0]+'" cy="'+(q[1]-140)+'" r="'+(night?120:80)+'" fill="url(#elmp)"/>';});}
 return YC[tod]=s+'</svg>';}

/* ---------- карта: дорожка из плитки с кобальтовым бордюром, уровни — «гжельские» тарелки, места глав — мозаичные панно ---------- */
function plate(x,y,r,n,kind){var s,i,k,c,cur=kind==='cur';
 if(kind==='lock')return '<circle cx="'+x+'" cy="'+(y+2)+'" r="'+r+'" fill="#d9ccb8"/><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#efe5d4"/><circle cx="'+x+'" cy="'+y+'" r="'+(r-5)+'" fill="none" stroke="#d9ccb8" stroke-width="1.5"/><text x="'+x+'" y="'+(y+7)+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="700" font-size="19" fill="#8f806a">'+n+'</text>';
 s='<circle cx="'+x+'" cy="'+(y+3)+'" r="'+r+'" fill="rgba(60,40,20,.18)"/><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+PAPER+'"/>';
 if(kind==='open')return s+'<circle cx="'+x+'" cy="'+y+'" r="'+(r-4)+'" fill="none" stroke="'+COB+'" stroke-width="2.5"/><text x="'+x+'" y="'+(y+7)+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="800" font-size="20" fill="'+INK+'">'+n+'</text>';
 c=cur?TERRA:COB;k=cur?14:12;
 for(i=0;i<k;i++){var a=i/k*Math.PI*2,ex=(x+Math.cos(a)*(r-6)).toFixed(1),ey=(y+Math.sin(a)*(r-6)).toFixed(1);s+='<ellipse cx="'+ex+'" cy="'+ey+'" rx="'+(cur?4.2:3.2)+'" ry="'+(cur?2.4:1.9)+'" transform="rotate('+(a*180/Math.PI+90).toFixed(0)+' '+ex+' '+ey+')" fill="'+c+'"/>';}
 s+='<circle cx="'+x+'" cy="'+y+'" r="'+(r-11)+'" fill="none" stroke="'+c+'" stroke-width="1.5"/>';
 if(cur)s+='<circle cx="'+x+'" cy="'+y+'" r="'+(r+5)+'" fill="none" stroke="'+GOLD+'" stroke-width="2.5"/>';
 return s+'<text x="'+x+'" y="'+(y+(cur?10:7))+'" text-anchor="middle" font-family="KF,sans-serif" font-weight="800" font-size="'+(cur?28:20)+'" fill="'+(cur?TERRA:INK)+'">'+n+'</text>';}
// панно 16×12 смальтин; fn(i,j,R) → цвет
function panel(w,h,fn,seed){var R=R0(seed),c=8,s='<rect x="-6" y="-2" width="'+(w+12)+'" height="'+(h+12)+'" rx="7" fill="rgba(60,40,20,.14)"/><rect x="-6" y="-6" width="'+(w+12)+'" height="'+(h+12)+'" rx="7" fill="'+PAPER+'"/><rect x="-3" y="-3" width="'+(w+6)+'" height="'+(h+6)+'" rx="4" fill="none" stroke="'+GOLDL+'" stroke-width="1.2"/>';
 for(var j=0;j<h/c;j++)for(var i=0;i<w/c;i++)s+='<rect x="'+(i*c+.8)+'" y="'+(j*c+.8)+'" width="'+(c-1.6)+'" height="'+(c-1.6)+'" rx="1" fill="'+fn(i,j,R)+'"/>';return s;}
function skyC(R){return R()<.5?'#a6cfe8':'#9bc8e6';}
function sandC(R){return R()<.5?'#f3e1c4':'#efd9b8';}
function grassC(R){return R()<.5?'#9cbc8a':'#86a876';}
function leafC(R){return R()<.5?'#5fa13e':'#6fb04a';}
function dist(i,j,a,b){return Math.sqrt((i-a)*(i-a)+(j-b)*(j-b));}
var PAN={
 yard:function(i,j,R){if(dist(i,j,12.5,2.5)<1.8)return R()<.5?'#f2b632':'#efa424';if(j<7)return dist(i,j,3.5,3.5)<2.4?leafC(R):skyC(R);
   if(i===3&&j<10)return '#8a7a64';if(j>=9&&i>=8&&i<=13)return R()<.5?'#f2d9a8':'#ecd09a';if(j===8&&(i===8||i===13))return TERRA;return grassC(R);},
 hall:function(i,j,R){if(j<2||i<2||i>13)return skyC(R);if(j===2)return '#cbbba3';if(i>=6&&i<=9&&j>=7)return j===7?'#e6ddcf':'#13a3a0';if((i===3||i===4||i===11||i===12)&&(j===4||j===5||j===8||j===9))return '#8fbfe0';return R()<.5?'#e3a088':'#d98f75';},
 shop:function(i,j,R){if(j<2)return skyC(R);if(j<4)return i%2?PAPER:'#13a3a0';if(j>=5&&j<10&&i>=2&&i<8)return (j===7&&i>2&&i<7)?['#d6573a','#e9a72c','#5fa13e','#d6573a'][i%4]:'#bfe0f0';if(i>=10&&i<13&&j>=5)return '#e9a72c';return R()<.5?'#f6ead6':'#f1e2ca';},
 garage:function(i,j,R){if(j<3)return skyC(R);if(j===3)return '#6b7186';var g=(i/5|0);if(i%5===0)return '#d9d2c6';if(g===2&&j>=8)return j===8?'#ffd2c4':'#d6573a';return ['#13a3a0','#e9a72c','#8a4b9c','#2c62c4'][g%4];},
 school:function(i,j,R){if(j<3)return skyC(R);if(j<5&&i>3&&i<12&&(j===3?i>5&&i<10:1))return '#d6573a';if(j>=5){if((i===3||i===6||i===9||i===12)&&j>6&&j<9)return '#2c62c4';if(i>=7&&i<=8&&j>=8)return INK;return sandC(R);}return skyC(R);},
 dacha:function(i,j,R){if(j>=1&&j<5&&i<11&&Math.abs(i-5.5)<=j-.5)return '#d6573a';if(j<5)return dist(i,j,13,2)<2?leafC(R):skyC(R);
   if(j<9&&i>=1&&i<=10){if(i>=3&&i<=4&&j>=6&&j<=7)return '#8fbfe0';if(i>=7&&i<=8&&j>=6)return '#a8744a';return R()<.5?'#f6dca4':'#f0d192';}if(j>=9)return (i+j)%3?'#6fb04a':'#e9a72c';return i===13?'#8a7a64':grassC(R);},
 market:function(i,j,R){if(j<2)return skyC(R);if(j<4)return (i>>1)%2?PAPER:TERRA;if(j===4)return i%2?PAPER:TERRA;if(j>=8)return R()<.5?'#c98f5a':'#b98250';if(j>=6)return ['#5fa13e','#e9a72c','#d6573a','#8a4b9c','#ec8a3a'][(i>>1)%5];return sandC(R);},
 build:function(i,j,R){if(i===2&&j>=1)return '#e9a72c';if(j===1&&i>=2&&i<=12)return '#e9a72c';if(i===11&&j>=2&&j<=4)return '#6b7186';if(i>=10&&i<=12&&j===5)return TERRA;
   if(j>=6&&i>=5&&i<=13){if((i===6||i===9||i===12)&&(j===7||j===9))return '#8fbfe0';return R()<.5?'#e3a088':'#d98f75';}if(j>=10)return sandC(R);return skyC(R);},
 park:function(i,j,R){if(dist(i,j,3.5,3.5)<3)return leafC(R);if(i===3&&j>=6&&j<10)return '#8a7a64';
   if(j>=8&&i>=7&&i<=14)return R()<.5?'#2c62c4':'#13a3a0';if(i===10&&j>=4&&j<8)return '#d9d2c6';if(j===4&&(i===9||i===11))return '#8fbfe0';if(j>=10)return grassC(R);return skyC(R);},
 fest:function(i,j,R){if(j===1+Math.round(Math.sin(i/15*Math.PI)*1.2))return PAL[i%8];if(j<4)return skyC(R);
   if(dist(i,j,4,5)<2)return TERRA;if(dist(i,j,11,5.5)<2)return COB;if((i===4&&j>6&&j<11)||(i===11&&j>7&&j<11))return '#8a7a64';if(j>=10)return grassC(R);return skyC(R);}
};
var PANC={};
function mapHtml(){var NL=NLV,CH=CHAPTERS.length,Wd=400,R=R0(13),n,i,x,y;
  var yOf=[],yy=120,pts=[];for(n=NL;n>=1;n--){if(n%10===0&&n<NL)yy+=160;yOf[n]=yy;yy+=64;}var H=yy+150;
  for(n=1;n<=NL;n++)pts[n]=[200+Math.sin((NL-n)*.62+.8)*108,yOf[n]];
  var s='<svg class="lkmap" viewBox="0 0 '+Wd+' '+H+'" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="ecp0"><circle cx="0" cy="0" r="21"/></clipPath><clipPath id="ecps"><circle cx="-116" cy="0" r="21"/></clipPath></defs>';
  s+='<rect width="'+Wd+'" height="'+H+'" fill="#f3ece1"/>';
  // терраццо: каменная крошка по всему фону
  var chips=['#d6573a','#2c62c4','#c9b8a0','#a99a84','#e9a72c'];for(i=0;i<H*.32;i++)s+='<circle cx="'+(R()*Wd).toFixed(0)+'" cy="'+(R()*H).toFixed(0)+'" r="'+(.8+R()*1.6).toFixed(1)+'" fill="'+chips[(R()*R()*5)|0]+'" opacity=".35"/>';
  var d='M'+pts[NL][0].toFixed(1)+' '+(pts[NL][1]-60);for(n=NL;n>=1;n--){var p0=n<NL?pts[n+1]:[pts[NL][0],pts[NL][1]-60],p1=pts[n];d+=' C'+p0[0].toFixed(1)+' '+(p0[1]+26)+' '+p1[0].toFixed(1)+' '+(p1[1]-26)+' '+p1[0].toFixed(1)+' '+p1[1];}d+=' L'+pts[1][0].toFixed(1)+' '+(H+10);
  s+='<path d="'+d+'" stroke="'+COB+'" stroke-width="54" fill="none" stroke-linecap="round"/><path d="'+d+'" stroke="'+PAPER+'" stroke-width="50" fill="none" stroke-linecap="round" stroke-dasharray="7 3"/><path d="'+d+'" stroke="#efe5d4" stroke-width="40" fill="none" stroke-linecap="round"/><path d="'+d+'" stroke="#e6d9c4" stroke-width="8" fill="none" stroke-dasharray="8 9"/>';
  function tr(x,y,k){return '<ellipse cx="'+(x+14*k)+'" cy="'+(y+30*k)+'" rx="'+40*k+'" ry="'+8*k+'" fill="#a89577" opacity=".18"/><rect x="'+(x-3*k)+'" y="'+y+'" width="'+6*k+'" height="'+30*k+'" fill="#8a7a64"/><circle cx="'+x+'" cy="'+(y-12*k)+'" r="'+30*k+'" fill="#9cbc8a"/><path d="M'+x+' '+(y-42*k)+'a'+30*k+' '+30*k+' 0 0 1 0 '+60*k+'z" fill="#86a876"/>';}
  var pans=[];for(var c0=0;c0<CH;c0++){var a0=c0*10+1;pans.push([(yOf[a0+4]+yOf[a0+5])/2,(pts[a0+4][0]+pts[a0+5][0])/2>200?0:1]);}
  for(var t=0;t<H/280;t++){var side=t%2,ty=140+t*280+R()*80,tk=.9+R()*.25,tx=side?362+R()*20:26+R()*16,ok=true;for(var pi=0;pi<pans.length;pi++)if(pans[pi][1]===side&&Math.abs(pans[pi][0]-ty)<130)ok=false;if(ok)s+=tr(tx,ty,tk);}
  // места глав (мозаичные панно) и вывески с хозяином
  var tot=0,nl=nextLevel(),med='';
  for(var ch=0;ch<CH;ch++){var a=ch*10+1,lock=a>S.unlocked,stc=0,C=CHAPTERS[ch];for(var q=a;q<a+10;q++)stc+=S.lv[q]||0;tot+=stc;
    var mid=(yOf[a+4]+yOf[a+5])/2,px=(pts[a+4][0]+pts[a+5][0])/2>200?76:324,pid=PAN[C.id]?C.id:'yard';
    if(!PANC[pid])PANC[pid]=panel(128,96,PAN[pid],ch+3);
    s+='<g transform="translate('+(px-64)+' '+(mid-48)+')"'+(lock?' opacity=".55"':'')+'>'+PANC[pid]+'</g>';
    var sy=ch>0?(yOf[a]+yOf[a-1])/2:yOf[1]+92,cg=S.chest[ch]||0,
      sub=lock?T('откроется после «','opens after “')+chName(ch-1)+T('»','”'):'★ '+stc+T(' из 30',' of 30')+(cg<CHEST.length?' · '+T('сундук за ','chest at ')+CHEST[cg][0]+'★':' · '+T('сундуки открыты','chests open'));
    s+='<g transform="translate(200 '+sy+')"'+(lock?' opacity=".85"':'')+'><rect x="-160" y="-29" width="320" height="66" rx="16" fill="rgba(60,40,20,.12)"/><rect x="-160" y="-33" width="320" height="66" rx="16" fill="'+PAPER+'"/><rect x="-154" y="-27" width="308" height="54" rx="11" fill="none" stroke="'+(lock?'#d9ccb8':COB)+'" stroke-width="1.5" stroke-dasharray="'+(lock?'0':'6 3')+'"/>'+
      '<circle cx="-116" cy="0" r="24" fill="'+(lock?'#d9ccb8':COB)+'"/><image clip-path="url(#ecps)" href="'+pURI(C.host,lock?'norm':'happy')+'" x="-137" y="-21" width="42" height="42"/>'+
      '<text x="-82" y="-4" font-family="KF,sans-serif" font-weight="800" font-size="20" fill="'+INK+'">'+(ch+1)+'. '+esc(chName(ch))+'</text><text x="-82" y="18" font-family="KF,sans-serif" font-weight="600" font-size="15" fill="#5d6478">'+esc(sub)+'</text></g>';}
  for(n=1;n<=NL;n++){x=+pts[n][0].toFixed(1);y=pts[n][1];var done=!!S.lv[n],isCur=n===nl&&!S.lv[n],lk=n>S.unlocked,boss=n%10===0;
    s+='<g data-l="'+n+'">';
    if(isCur){var nx=n<NL?pts[n+1][0]:x,mxp=nx>x+8?x-60:nx<x-8?x+60:(x>200?x-60:x+60);s+=plate(x,y,36,n,'cur');med='<g transform="translate('+mxp.toFixed(1)+' '+(y-40)+')"><circle r="27" fill="'+PAPER+'"/><circle r="24" fill="'+TERRA+'"/><circle r="21.5" fill="#fff"/><image clip-path="url(#ecp0)" href="'+pURI(CHAPTERS[Math.floor((n-1)/10)].host,'happy')+'" x="-21" y="-21" width="42" height="42"/></g>';}
    else if(done){var st=S.lv[n]||0;s+=plate(x,y,25,n,'done');for(var kk=0;kk<3;kk++){var sx=x-19+kk*14,sy2=y-37+(kk===1?-3:0);s+='<rect x="'+sx.toFixed(1)+'" y="'+sy2+'" width="9" height="9" rx="1.5" transform="rotate(45 '+(sx+4.5).toFixed(1)+' '+(sy2+4.5)+')" fill="'+(kk<st?GOLDL:'#e3d6c1')+'"/>';}}
    else if(lk)s+=plate(x,y,22,n,'lock');
    else s+=plate(x,y,25,n,'open');
    if(boss&&!isCur){var gx=x+(x>200?-58:58);s+='<g transform="translate('+gx.toFixed(1)+' '+y+')"><rect x="-18" y="-12" width="36" height="28" rx="4" fill="'+COB2+'"/><rect x="-18" y="-16" width="36" height="28" rx="4" fill="'+COB+'"/><rect x="-18" y="-16" width="36" height="9" rx="4" fill="#3a74d6"/><rect x="-4" y="-9" width="8" height="10" rx="1" fill="'+GOLDL+'"/><path d="M-14-2h28" stroke="'+PAPER+'" stroke-width="1.2" stroke-dasharray="2 2"/></g>';}
    s+='<circle cx="'+x+'" cy="'+y+'" r="30" fill="transparent"/></g>';}
  return {svg:s+med+'</svg>',tot:tot,y:function(n){return pts[n][1]/H;}};}

/* ---------- огонёк серии: кобальтовая плитка-ромб с «×N», под ней три плашки — сколько ходов серия ещё живёт ---------- */
function comboE(n,left){var d='';for(var i=0;i<3;i++)d+='<rect x="'+(19+i*12)+'" y="71" width="9" height="6" rx="2" fill="'+(i<left?TERRA:'#e6ddcf')+'" stroke="#fffdf9" stroke-width="1.2"/>';
 return '<svg viewBox="0 0 70 80"><g transform="translate(35 35) rotate(45)"><rect x="-23" y="-23" width="46" height="46" rx="8" fill="'+COB2+'" opacity=".28" transform="translate(2 3)"/><rect x="-23" y="-23" width="46" height="46" rx="8" fill="'+PAPER+'"/><rect x="-20.5" y="-20.5" width="41" height="41" rx="6.5" fill="'+COB+'"/><rect x="-15" y="-15" width="30" height="30" rx="4" fill="none" stroke="#fff" stroke-width="1.5" opacity=".55"/><path d="M-18-10l8-8" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/></g>'+
  '<text x="35" y="43" text-anchor="middle" font-family="KF,sans-serif" font-weight="800" font-size="22" fill="#fff">×'+n+'</text>'+d+'</svg>';}

/* ---------- CSS: спокойный интерфейс — сливки, тушь, тонкие линии, кобальт (главная кнопка), терракота (траты) ---------- */
function cu(svg){return 'url("data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)+'")';}
var NS='xmlns="http://www.w3.org/2000/svg"';
var ORN=cu('<svg '+NS+' width="44" height="44" viewBox="0 0 44 44"><g fill="#fffdf9" opacity=".24">'+[[22,22],[0,0],[44,0],[0,44],[44,44]].map(function(p){return '<g transform="translate('+p[0]+' '+p[1]+')"><path d="M0-14q8 14 0 28q-8-14 0-28zM-14 0q14 8 28 0q-14-8-28 0z"/><circle r="3"/></g>';}).join('')+'</g></svg>');
var WAVE=cu('<svg '+NS+' width="40" height="22" viewBox="0 0 40 22"><path d="M0 22V12q10-16 20 0q10-16 20 0V22z" fill="#fffdf9"/><path d="M0 12q10-16 20 0q10-16 20 0" stroke="#d9ab3c" stroke-width="2" fill="none"/></svg>');
var TILES=cu('<svg '+NS+' width="24" height="12" viewBox="0 0 24 12"><rect x=".7" y=".7" width="10.6" height="10.6" rx="1.5" fill="#2c62c4"/><rect x="12.7" y=".7" width="10.6" height="10.6" rx="1.5" fill="#13a3a0"/></svg>');
// кольцо из плиточек (медальон соседа)
var RING='repeating-conic-gradient(from 3deg,#2c62c4 0 19deg,#fffdf9 19deg 22.5deg,#e9a72c 22.5deg 41.5deg,#fffdf9 41.5deg 45deg,#13a3a0 45deg 64deg,#fffdf9 64deg 67.5deg,#d6573a 67.5deg 86.5deg,#fffdf9 86.5deg 90deg)';
var P='html.lk.th-e ',N='html.lk.th-e.tod-night ';
var CSS=[
P+'{--ink:#1e2a44;--ink2:#565d72;--muted:#565d72;--card:#fffdf9;--card2:#f7f1e6;--line:#e6ddcf;--glass:rgba(255,253,249,.95);--glass2:rgba(255,253,249,.85);',
' --acc1:#e57858;--acc:#d6573a;--acc2:#b6442a;--good1:#4a82e0;--good:#2c62c4;--good2:#1d4796;--blue1:#2fb3af;--blue:#13a3a0;--blue2:#0c7d7a;',
' --gold:#c99a2e;--gold2:#a77a17;--red:#d6573a;--mint:#f7f1e6;--mintL:#e6ddcf;--sh:rgba(60,40,20,.12);--dim:rgba(30,42,68,.52);--r:18px}',
P+'.btn{background:#fffdf9;border-radius:18px;box-shadow:inset 0 0 0 1.5px var(--line),0 4px 12px rgba(60,40,20,.10)}',
P+'.btn:active{box-shadow:inset 0 0 0 1.5px var(--line),0 1px 4px rgba(60,40,20,.10)}',
P+'.btn.green,'+P+'.btn.accent,'+P+'.btn.blue{text-shadow:none;letter-spacing:.2px}',
P+'.btn.green{background:linear-gradient(180deg,#3a74d6,#2556b0);box-shadow:0 8px 18px rgba(44,98,196,.34),inset 0 1.5px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(10,30,80,.25)}',
P+'.btn.accent{background:linear-gradient(180deg,#df6a4c,#c44b2f);box-shadow:0 8px 18px rgba(214,87,58,.3),inset 0 1.5px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(90,25,10,.22)}',
P+'.btn.blue{background:linear-gradient(180deg,#1aa9a5,#0e8784);box-shadow:0 8px 18px rgba(19,163,160,.3),inset 0 1.5px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(5,60,60,.25)}',
P+'.btn.green:active,'+P+'.btn.accent:active,'+P+'.btn.blue:active{box-shadow:0 3px 8px rgba(0,0,0,.14),inset 0 1.5px 0 rgba(255,255,255,.3)}',
P+'.icon{border-radius:16px;background:#fffdf9;box-shadow:inset 0 0 0 1.5px var(--line),0 4px 12px rgba(60,40,20,.10)}',
P+'.pill{background:#fffdf9;border-radius:22px;box-shadow:inset 0 0 0 1.5px var(--line),0 4px 12px rgba(60,40,20,.10)}',
P+'.gt>div:first-child{text-shadow:0 1px 0 rgba(255,253,249,.9),0 0 12px rgba(255,253,249,.95)}',
P+'.gh .sub{color:var(--acc2);font-weight:700;letter-spacing:.3px;text-shadow:0 0 8px #fffdf9,0 0 4px #fffdf9,0 0 2px #fffdf9}',
P+'#scr-map .gh{background:linear-gradient(180deg,rgba(243,236,225,.98),rgba(243,236,225,.9));box-shadow:0 1.5px 0 var(--line),0 6px 16px rgba(60,40,20,.08)}',
// меню
P+'.logo{text-shadow:0 2px 0 rgba(255,253,249,.95),0 0 14px rgba(255,253,249,.95)}',
P+'.logo small{color:var(--acc)}',
P+'.big{border-radius:22px}',
P+'.big .ic{border-radius:14px;background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.5)}',
P+'#bPlay{background:linear-gradient(180deg,#3a74d6,#2556b0);box-shadow:0 10px 22px rgba(44,98,196,.36),inset 0 1.5px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(10,30,80,.25)}',
P+'#bDaily{background:linear-gradient(180deg,#df6a4c,#c44b2f);box-shadow:0 10px 22px rgba(214,87,58,.32),inset 0 1.5px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(90,25,10,.22)}',
P+'.nrow .btn{border-radius:20px;box-shadow:inset 0 0 0 1.5px var(--line),0 6px 14px rgba(60,40,20,.10)}',
P+'.btn .dot{background:var(--acc);box-shadow:0 0 0 2.5px #fffdf9}',
P+'.hsay{background:#fffdf9;border-radius:18px;box-shadow:inset 0 0 0 1.5px var(--line),0 6px 16px rgba(60,40,20,.10)}',
P+'.hsay b{color:var(--acc2);letter-spacing:.5px}',
P+'.hface,'+P+'.hav,'+P+'.card .av{background:#2c62c4;background:'+RING+';box-shadow:0 0 0 3px #fffdf9,0 6px 16px rgba(60,40,20,.18)}',
P+'.hface svg,'+P+'.hav svg,'+P+'.card .av svg{border-color:#fffdf9}',
P+'.hav{padding:5px}',
P+'.today,'+P+'.kcard{background:var(--glass);border-radius:22px;box-shadow:inset 0 0 0 1.5px var(--line),0 8px 20px rgba(60,40,20,.10)}',
P+'.today h3:before,'+P+'.kcard h3:before{content:"";display:inline-block;width:10px;height:10px;margin:0 10px 2px 3px;background:var(--acc);border-radius:2px;-webkit-transform:rotate(45deg);transform:rotate(45deg)}',
P+'.trow{background:#fffdf9;border-radius:16px;box-shadow:inset 0 0 0 1.5px var(--line)}',
P+'.trow .ic{border-radius:12px;background:var(--card2)}',
P+'.trow i{color:var(--good)}',
P+'.trow.hot{background:linear-gradient(90deg,#fbf1d9,#fffdf9);box-shadow:inset 0 0 0 1.5px #e3c47a,0 4px 10px rgba(201,154,46,.14)}',
P+'.trow.hot .ic{background:#f6e2b0}',
// игра
P+'.chip{background:#fffdf9;border-radius:16px;box-shadow:inset 0 0 0 1.5px var(--line),0 4px 12px rgba(60,40,20,.10)}',
P+'.chip img,'+P+'.chip lk-i{background:var(--card2);border-radius:10px}',
P+'.chip.ok{background:linear-gradient(180deg,#e9f0fc,#d6e3f8);color:#1d4796;box-shadow:inset 0 0 0 1.5px #b9cdf0}',
P+'.scl{text-shadow:0 1px 0 #fffdf9,0 0 12px #fffdf9,0 0 4px #fffdf9}',
P+'.movesl{color:var(--ink2);text-shadow:0 0 6px #fffdf9,0 0 3px #fffdf9,0 0 2px #fffdf9}',
P+'.bub{background:#fffdf9;border-radius:18px;box-shadow:inset 0 0 0 1.5px var(--line),0 6px 16px rgba(60,40,20,.10)}',
P+'.bub::before{border-right-color:#fffdf9}',
P+'.tip,'+P+'.gban{background:#fffdf9;box-shadow:inset 0 0 0 1.5px var(--line),0 12px 28px rgba(30,42,68,.22)}',
P+'.boost button{background:#fffdf9;border-radius:20px;box-shadow:inset 0 0 0 1.5px var(--line),0 6px 14px rgba(60,40,20,.12)}',
P+'.boost button lk-i{border-radius:12px}',
P+'.boost button[data-b=hint] lk-i{background:#fbecc0}'+P+'.boost button[data-b=rot] lk-i{background:#dce7f8}'+P+'.boost button[data-b=new] lk-i{background:#f6e2da}'+P+'.boost button[data-b=bomb] lk-i{background:#e8e6ee}',
P+'.boost button i{background:var(--acc);box-shadow:0 0 0 2.5px #fffdf9;border-radius:13px}',
P+'.boost button i.free{background:var(--ink);box-shadow:0 0 0 2.5px #fffdf9}',
P+'.boost button.on{background:#f4f7fd;box-shadow:0 0 0 3px var(--good),0 6px 14px rgba(60,40,20,.12)}',
// карта, сетки
P+'.it,'+P+'.thc{background:#fffdf9;border-radius:20px;box-shadow:inset 0 0 0 1.5px var(--line),0 6px 14px rgba(60,40,20,.10)}',
P+'.it.on,'+P+'.thc.cur{box-shadow:0 0 0 3px var(--good),0 6px 14px rgba(60,40,20,.10)}',
P+'.it canvas,'+P+'.thc canvas{border-radius:14px}',
P+'.shop-pay{background:var(--glass);box-shadow:inset 0 0 0 1.5px var(--line)}',
// окна: синий изразцовый верх с волной и золотой каймой, медальон соседа из плиточек
P+'.card{background:#fffdf9;border-radius:30px;box-shadow:0 30px 60px rgba(20,25,45,.45)}',
P+'.card.hasav:before{height:150px;background:'+WAVE+' repeat-x 0 100%/40px 22px,'+ORN+' repeat 0 0/44px 44px,#2c62c4;background-color:#2c62c4}',
P+'.card.hasav .av{margin-top:30px}',
P+'.card:not(.hasav){background:'+TILES+' repeat-x 0 0/24px 12px,#fffdf9;padding-top:26px}',
P+'.card.win:after{display:none;-webkit-animation:none;animation:none}',
P+'.card h2{color:var(--ink)}',
P+'.coins-won{color:var(--ink)!important}',
P+'.quote{background:var(--card2);box-shadow:inset 0 0 0 1.5px var(--line);border-radius:16px}',
P+'.plq{background:var(--card2);border-radius:16px}',
P+'.plq.ok,'+P+'.goal.tipl{background:linear-gradient(90deg,#e9f0fc,#fffdf9);color:#1d4796!important;box-shadow:inset 0 0 0 1.5px #c9d8f3}',
P+'.plq.info,'+P+'.goal.tmrw{background:linear-gradient(90deg,#e3f4f3,#fffdf9);color:#0c6664!important;box-shadow:inset 0 0 0 1.5px #bfe3e1}',
P+'.plq.gold{background:linear-gradient(90deg,#fbf1d9,#fffdf9);color:#6e4f0a!important;box-shadow:inset 0 0 0 1.5px #e3c47a}',
P+'.plq.warn{background:linear-gradient(90deg,#fbe6df,#fffdf9);color:#9a3420!important;box-shadow:inset 0 0 0 1.5px #efc0b2}',
P+'.aw{background:linear-gradient(180deg,#fffdf9,#f8ecd0);color:#6e4f0a;box-shadow:inset 0 0 0 1.5px #e3c47a}',
P+'.aw.new{background:linear-gradient(180deg,#f4f7fd,#dce7f8);color:#1d4796;box-shadow:inset 0 0 0 1.5px #c9d8f3}',
P+'.chbar{background:#efe7da;box-shadow:inset 0 1px 2px rgba(60,40,20,.12)}',
P+'.chbar i{background:linear-gradient(90deg,#b9cff3,#8fb2ec)}',
P+'.chbar span{color:var(--ink);text-shadow:none}',
P+'.set{background:#fffdf9;border-radius:16px;box-shadow:inset 0 0 0 1.5px var(--line)}',
P+'.set i{background:var(--good);box-shadow:none}',
P+'.set i.off{background:#e9e1d3;color:var(--ink2)}',
P+'.set i.go{background:transparent;color:var(--good)}',
P+'.sd{background:#fffdf9;border-radius:14px}',
P+'.sd.done{background:linear-gradient(180deg,#f4f7fd,#dce7f8);color:#1d4796}',
P+'.sd.done::after{color:#2c62c4}',
P+'.sd.d7{background:linear-gradient(180deg,#fbf1d9,#f3dea6)}',
P+'.sd.today,'+P+'.sd.d7.today{background:linear-gradient(180deg,#df6a4c,#c44b2f);color:#fff;box-shadow:0 6px 14px rgba(214,87,58,.3)}',
P+'.sd.today small{color:#fff}',
P+'.tabs2 button{background:#f1e9dc;border-radius:14px}',
P+'.tabs2 button.on{background:#fffdf9;box-shadow:0 0 0 2px var(--good),0 4px 10px var(--sh)}',
P+'.rk{background:var(--card2)}'+P+'.rk.cur{background:linear-gradient(90deg,#fbf1d9,#fffdf9);box-shadow:inset 0 0 0 1.5px #e3c47a}'+P+'.rk.done{color:#1d4796}',
P+'.lbr.me{background:#fbf1d9}',
P+'.pan{background:#fffdf9}',
P+'.week .wd{background:#f1e9dc}'+P+'.week .wd.done{background:linear-gradient(180deg,#f4f7fd,#dce7f8);color:#1d4796}',
P+'.rec{background:linear-gradient(180deg,#f2d27a,#d9ab3c);color:#4d3505}',
P+'.toast{background:rgba(30,42,68,.95);border-radius:16px}',
P+'.card .soc-o{background:var(--card2)}',
// ночь (класс tod-night ставит LK.yard): светлые подписи на тёмном небе
N+'#scr-game .gt>div:first-child,'+N+'#scr-shop .gt>div:first-child,'+N+'.logo{color:#fffdf9;text-shadow:0 1px 2px rgba(10,16,35,.85),0 0 12px rgba(10,16,35,.7)}',
N+'#scr-game .gh .sub,'+N+'#scr-shop .gh .sub,'+N+'.logo small{color:#ffc4ae;text-shadow:0 1px 2px rgba(10,16,35,.9),0 0 8px rgba(10,16,35,.7)}',
N+'.movesl,'+N+'.scl,'+N+'.scl small{color:#f1ece2;text-shadow:0 1px 2px rgba(10,16,35,.9),0 0 8px rgba(10,16,35,.75)}'
].join('\n');

/* ---------- набор рисования ---------- */
var K={
 id:'e',pal:PAL,frK:.4,
 brick:function(g,x,y,s,col){if(col===20)return concrete(g,x,y,s);var k=(col-1)%8;tile(g,x,y,s,PAL[k],k);},
 // поле: терраццо (светлая каменная крошка) с тонкой золотой линией; (0,0) — левый верх рамки
 board:function(g,B,cs,fr,Bh){var S=B+2*fr,H=(Bh||B)+2*fr,rad=Math.min(S,H)*.06,R=R0(19),i,k,chips=['#d6573a','#2c62c4','#c9b8a0','#8a7f72','#e9a72c','#13a3a0','#bfb3a3','#f0e2cc'];
   g.save();g.shadowColor='rgba(70,50,30,.22)';g.shadowBlur=26;g.shadowOffsetY=14;g.fillStyle='#f6f0e5';RR(g,0,0,S,H,rad);g.fill();g.restore();
   g.fillStyle='rgba(70,50,30,.10)';RR(g,0,2,S,H,rad);g.fill();
   g.fillStyle='#f6f0e5';RR(g,0,0,S,H,rad);g.fill();
   g.save();RR(g,0,0,S,H,rad);g.clip();var n=S*H/105;for(i=0;i<n;i++){var cx=R()*S,cy=R()*H,z=.7+R()*R()*S*.011;g.fillStyle=chips[(R()*R()*8)|0];g.globalAlpha=.4+R()*.38;g.beginPath();for(k=0;k<5;k++){var a=k/5*6.283+R(),r2=z*(.6+R()*.5);g.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);}g.fill();}g.restore();g.globalAlpha=1;
   g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.5;RR(g,.75,.75,S-1.5,H-1.5,rad);g.stroke();
   g.strokeStyle=GOLD;g.lineWidth=Math.max(1.4,fr*.08);RR(g,fr*.45,fr*.45,S-fr*.9,H-fr*.9,rad*.6);g.stroke();},
 // пустая клетка — неглазурованная плитка с золотым кружком
 empty:function(g,x,y,cs,r,c){var m=cs*.045,w=cs-2*m;g.fillStyle='rgba(120,95,65,.22)';RR(g,x+m,y+m,w,w,cs*.1);g.fill();
   g.fillStyle=((r+c)%2)?'#efe6d7':'#f3ebde';RR(g,x+m+cs*.015,y+m+cs*.03,w-cs*.03,w-cs*.035,cs*.09);g.fill();
   g.strokeStyle='rgba(201,154,46,.22)';g.lineWidth=1;g.beginPath();g.arc(x+cs/2,y+cs/2,cs*.16,0,7);g.stroke();},
 // предмет — на сливочном жетоне с золотым ободком
 item:function(g,k,x,y,s){var cx=x+s*.5,cy=y+s*.5,r=s*.3;g.fillStyle='rgba(30,40,70,.25)';g.beginPath();g.arc(cx,cy+s*.025,r,0,7);g.fill();g.fillStyle=PAPER;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
   g.strokeStyle=GOLD;g.lineWidth=Math.max(1,s*.025);g.beginPath();g.arc(cx,cy,r-s*.035,0,7);g.stroke();
   var im=ITEM_IMG[k];if(im&&im.complete&&im.naturalWidth)g.drawImage(im,cx-r*.78,cy-r*.8,r*1.56,r*1.56);},
 // лоток: лёгкая сливочная подложка с золотой линией и золотые овалы под фигурами
 tray:function(g,x,y,w,h,LY){g.fillStyle='rgba(255,253,249,.5)';RR(g,x,y,w,h,22);g.fill();g.strokeStyle='rgba(201,154,46,.5)';g.lineWidth=1.2;RR(g,x+4.5,y+4.5,w-9,h-9,18);g.stroke();
   var sl=LY&&LY.slots;if(sl)for(var i=0;i<sl.length;i++){var q=sl[i],cx=q.x+q.w/2,cy=q.y+q.h*.78;g.strokeStyle='rgba(201,154,46,.4)';g.lineWidth=1.4;g.beginPath();g.ellipse(cx,cy,q.w*.36,Math.max(5,q.h*.07),0,0,7);g.stroke();}},
 traySel:'rgba(44,98,196,.14)',
 // сбор клетки: плитка переворачивается (светлая изнанка с золотой рамкой), потом раскалывается — осколки глазури и золотые чешуйки (частицы), золотое кольцо
 fx:function(g,x,y,cs,col,it,e,draw){var k=clamp(e/.4),cx=x+cs/2,cy=y+cs/2;
   if(k<1){var sy=Math.cos(k*Math.PI*.95);g.save();g.translate(cx,cy);g.scale(1+.08*Math.sin(k*Math.PI),Math.abs(sy)+.001);
     if(sy>0)draw(-cs/2,-cs/2);else{g.fillStyle='#f3e7d2';RR(g,-cs*.45,-cs*.45,cs*.9,cs*.9,cs*.1);g.fill();g.strokeStyle=GOLD;g.lineWidth=1.5;RR(g,-cs*.36,-cs*.36,cs*.72,cs*.72,cs*.06);g.stroke();}
     g.restore();}
   else if(e<.55){g.globalAlpha=1-(e-.4)/.15;g.fillStyle='#f3e7d2';RR(g,x+cs*.05,y+cs*.05,cs*.9,cs*.9,cs*.1);g.fill();g.globalAlpha=1;}
   var p=clamp((e-.38)/.62);if(p>0&&p<1){g.globalAlpha=(1-p)*.7;g.strokeStyle=GOLDL;g.lineWidth=Math.max(1,cs*.045*(1-p));g.beginPath();g.arc(cx,cy,cs*(.28+.32*ease(p)),0,7);g.stroke();g.globalAlpha=1;}},
 fxMs:640,
 partCol:function(col){return col===20?'#b9b1a2':PAL[(col-1)%8];},
 partN:5,
 // осколок глазури со светлой кромкой (t 0) или золотая чешуйка-ромб (t 1)
 part:function(g,p,x,y,a){var z=p.s*1.5;g.save();g.translate(x,y);g.rotate(p.rot);
   if(p.t===1){z=p.s*1.2;g.fillStyle=GOLDL;g.beginPath();g.moveTo(0,-z);g.lineTo(z*.35,0);g.lineTo(0,z);g.lineTo(-z*.35,0);g.closePath();g.fill();g.fillStyle='#fff3c8';g.beginPath();g.moveTo(0,-z);g.lineTo(z*.35,0);g.lineTo(0,0);g.closePath();g.fill();}
   else{g.fillStyle=p.c;g.beginPath();g.moveTo(-z,-z*.5);g.lineTo(z*.8,-z*.8);g.lineTo(z*.5,z*.6);g.lineTo(-z*.6,z*.4);g.closePath();g.fill();g.strokeStyle='rgba(255,250,238,.9)';g.lineWidth=1.2;g.beginPath();g.moveTo(-z,-z*.5);g.lineTo(z*.8,-z*.8);g.stroke();}
   g.restore();},
 // крупные слова: сливочная кайма, кобальт (Чисто!) / золото / терракота, золотой росчерк под «Чисто!»
 text:function(g,t,size,kind){g.font='800 '+size+'px KF,-apple-system,Roboto,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
   var C={clean:['#3a74d6','#1d4796'],gold:['#e9bf55','#a77a17'],combo:['#e57858','#b6442a'],rec:['#e9bf55','#a77a17'],pts:['#e06a4c','#c44b2f']}[kind]||['#e57858','#b6442a'];
   if(kind!=='pts'){g.fillStyle='rgba(30,42,68,.22)';g.fillText(t,0,size*.1);}
   g.lineWidth=size*(kind==='pts'?.28:.22);g.strokeStyle=PAPER;g.strokeText(t,0,0);
   var gr=g.createLinearGradient(0,-size*.45,0,size*.45);gr.addColorStop(0,C[0]);gr.addColorStop(1,C[1]);g.fillStyle=gr;g.fillText(t,0,0);
   if(kind==='clean'||kind==='gold'||kind==='rec'){var w=Math.min(g.measureText(t).width*.55,size*3);g.lineCap='round';
     g.strokeStyle=PAPER;g.lineWidth=size*.2;g.beginPath();g.moveTo(-w,size*.55);g.quadraticCurveTo(0,size*.3,w,size*.5);g.stroke();
     g.strokeStyle=GOLDL;g.lineWidth=size*.09;g.beginPath();g.moveTo(-w,size*.55);g.quadraticCurveTo(0,size*.3,w,size*.5);g.stroke();}},
 conf:[PAL[0],PAL[1],PAL[3],PAL[4],PAL[5],GOLDL,PAL[6],PAL[7]],
 comboCol:[COB,COB2,PAPER,COB2,TERRA],
 yard:function(t){return yardE(t);},
 comboSvg:comboE,
 get bgc(){var t=tod();return t==='night'?'#1f2b4a':t==='eve'?'#ecd2bf':'#e3ece8';},
 map:{bg:'#f3ece1',stripe:'',edge:COB,path:'#efe5d4',mid:PAPER,crown:['#a7c497','#9cbc8a','#86a876'],ink:INK,ink2:'#5d6478',done:'#e9f0fc',doneTx:COB,cur:['#e57858',TERRA,'#b6442a'],lockTx:'#8f806a',flower:GOLDL,ring:COB},
 mapHtml:mapHtml,
 prev:{bg:'#f3ead8',bg2:'#e6d8c0'},
 css:CSS
};
LK.reg('e',K);
})();
