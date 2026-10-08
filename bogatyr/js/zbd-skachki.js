'use strict';
/* BGD: забава №8 «Скачки на Сивке-Бурке» (id 'skachki'). Богатырь скачет полем 60 секунд: прыжок (тап / пробел / ↑) через плетни и лужи,
   собирай золотые подковы. 12 подков — «Сивка-Бурка, вещая каурка!»: конь взлетает на 4 с (пламя из ноздрей, дым из ушей, подковы сами летят).
   Задел плетень или плюхнулся в лужу — минус сила (их 3), конь спотыкается. Сил не осталось — «Продолжить с места падения» (ролик, раз за игру).
   Счёт = подковы (+1 за каждое чистое препятствие). Ступени: 25 / 55 / 95 (бот: zbBot('skachki')). Трасса — из зерна дня (одинакова у всех в день).
   Спокойный режим: скорость ×0,82, без тряски. Итог: host.done({score,tier,extra:{shoes,clean,msg}}); подковы копятся в host.store().shoes (на облик коня — позже).
   Рисунок коня — код: 4 ноги по 2 сустава (обратная кинематика), галоп по фазам, грива и хвост волнами, сбруя, чепрак; на коне — богатырь игрока. */
(function(){
const K=zbdK,TAU=Math.PI*2;
const TIER=[25,55,95];
function tierOf(s){return s>=TIER[2]?3:s>=TIER[1]?2:s>=TIER[0]?1:0;}
const DUR=60,JT=.8,JH=.74,MAGIC_N=12,MAGIC_T=4;
const V0=3.0,V1=1.7;   // скорость (высот коня в секунду): V0 + V1·t/60
function vAt(t,calm){return (V0+V1*Math.min(1,t/DUR))*(calm?.82:1);}
function tAtX(x,calm){const k=calm?.82:1,a=V0*k,b=V1/DUR*k;return (-a+Math.sqrt(a*a+2*b*x))/b;}
/* трасса из зерна: препятствия {k:'fence'|'puddle',x,w}, подковы {x,a} (a — высота над землёй в высотах коня) */
function course(seed,lvl,calm){const R=K.rnd((seed>>>0)^0x5c41),ob=[],sh=[];let x=7;
  while(x<300){const t=tAtX(x,calm),v=vAt(t,calm),A=v*JT;
    const late=t>22,kind=R()<(late?.36:.3)?'puddle':'fence',w=kind==='fence'?.42:.95+R()*.35*(late?1:.6);
    ob.push({k:kind,x,w});
    // дуга подков над препятствием — по идеальному прыжку
    if(R()<.5){for(let i=0;i<5;i++){const u=.1+i*.2;sh.push({x:x-A/2+u*A,a:JH*(1-Math.pow(2*u-1,2))+.42,arc:1});}}
    // двойное: плетень сразу за приземлением
    let nx=x+w/2+A+1.1;
    if(late&&R()<.22+Math.min(.12,(lvl||0)*.01)){const x2=nx+.6;ob.push({k:'fence',x:x2,w:.42});if(R()<.5)for(let i=0;i<3;i++){const u=.3+i*.2;sh.push({x:x2-A/2+u*A,a:JH*(1-Math.pow(2*u-1,2))+.42,arc:1});}nx=x2+.2+A+1.1;}
    const gap=v*(.75+R()*.75);
    // ряд подков по земле между препятствиями
    if(R()<.45){const n=3+Math.floor(R()*2),x0=nx+.4;for(let i=0;i<n;i++)sh.push({x:x0+i*.42,a:.38,line:1});nx=x0+n*.42;}
    x=nx+gap;}
  sh.sort((a,b)=>a.x-b.x);return {ob,sh};}

function run(host,o){
  const cv=K.canvas(host),g=cv.getContext('2d'),calm=!!o.calm,isPC=K.pc(),R=K.rnd((o.seed>>>0)^0x77);
  const C=course(o.seed,o.lvl,calm);
  let W=0,H=0,D=1,land=false,gy=0,hs=0,hx=0,lay=null;
  function layout(){W=cv.W;H=cv.H;D=cv.D;land=W>H*1.05;gy=land?H*.8:H*.61;hs=land?Math.min(H*.3,W*.2):Math.min(W*.42,H*.21);hx=land?W*.3:W*.36;lay=null;}
  layout();cv.onfit=layout;
  const st={ph:'how',t:0,howT:0,time:DUR,el:0,pos:0,v:0,phi:0,alt:0,vy:0,air:0,buf:0,coy:0,hp:3,inv:0,stum:0,sm:1,score:0,shoes:0,clean:0,magic:0,mag:0,shake:0,flash:0,hint:0,sent:0,fall:0,fin:0,dust:0,cheer:0};
  const P=[],pops=[],FX=[];
  const PAL=K.heroPal();
  /* ---------- слои фона (плитки) ---------- */
  function tile(w,h,fn){const c=document.createElement('canvas');c.width=Math.ceil(w*D);c.height=Math.ceil(h*D);const b=c.getContext('2d');b.setTransform(D,0,0,D,0,0);b.lineJoin='round';b.lineCap='round';fn(b,w,h);c.TW=w;c.TH=h;return c;}
  function mkLayers(){const L2={},Tw=Math.ceil(Math.max(W,H)*1.6),RR=K.rnd(9);
    // небо
    L2.sky=tile(W,gy,(b,w,h)=>{let q=b.createLinearGradient(0,0,0,h);q.addColorStop(0,'#3d8fdc');q.addColorStop(.55,'#8cc8f2');q.addColorStop(1,'#fff0c8');b.fillStyle=q;b.fillRect(0,0,w,h);
      const sx=w*(land?.82:.8),sy=h*(land?.22:.2),sr=Math.min(W,H)*.06;b.drawImage(K.glow('rgba(255,236,170,.9)'),sx-sr*5,sy-sr*5,sr*10,sr*10);b.fillStyle='#fff8d8';b.beginPath();b.arc(sx,sy,sr,0,TAU);b.fill();});
    // дальние холмы с белокаменным кремлём
    const fh=gy*(land?.3:.26);L2.far=tile(Tw,fh,(b,w,h)=>{const hill=(c,amp,base,f,ph)=>{b.fillStyle=c;b.beginPath();b.moveTo(0,h);for(let x=0;x<=w;x+=8)b.lineTo(x,h-base-amp*(.5+.5*Math.sin(x/w*TAU*f+ph)));b.lineTo(w,h);b.fill();};
      hill('#a9c6e4',h*.25,h*.35,2,0);
      // кремль: стена, башни, золотые маковки
      const kx=w*.62,ky=h-h*.62,s=h*.16;b.fillStyle='#eef2f8';b.fillRect(kx-s*3,ky-s*.9,s*6,s*1.2);for(let i=-3;i<=3;i+=1.5){b.fillRect(kx+i*s-s*.3,ky-s*1.6,s*.6,s*1.9);b.fillStyle='#c84a3a';b.beginPath();b.moveTo(kx+i*s-s*.38,ky-s*1.6);b.lineTo(kx+i*s,ky-s*2.3);b.lineTo(kx+i*s+s*.38,ky-s*1.6);b.fill();b.fillStyle='#eef2f8';}
      b.fillRect(kx-s*.55,ky-s*2.6,s*1.1,s*2.2);for(const [dx,dy,r] of[[0,-3.1,.42],[-.9,-2.2,.3],[.9,-2.2,.3]]){b.fillStyle='#f2c03a';b.beginPath();b.ellipse(kx+dx*s,ky+dy*s,r*s,r*s*1.15,0,0,TAU);b.fill();b.beginPath();b.moveTo(kx+dx*s-r*s*.4,ky+dy*s-r*s*.8);b.lineTo(kx+dx*s,ky+dy*s-r*s*2);b.lineTo(kx+dx*s+r*s*.4,ky+dy*s-r*s*.8);b.fill();
        if(dx){b.fillStyle='#eef2f8';b.fillRect(kx+dx*s-r*s*.6,ky+dy*s+r*s*.6,r*s*1.2,s*1.4);}}
      b.fillStyle='rgba(120,150,190,.35)';b.fillRect(kx-s*3,ky+s*.25,s*6,s*.08);
      hill('#8fb5d9',h*.2,h*.12,3,1.3);});
    // средний план: зелёные холмы, берёзы, стога, мельница
    const mh=gy*(land?.32:.28);L2.mid=tile(Tw,mh,(b,w,h)=>{b.fillStyle='#7cb85a';b.beginPath();b.moveTo(0,h);for(let x=0;x<=w;x+=8)b.lineTo(x,h*.45-h*.14*Math.sin(x/w*TAU*2+.5)-h*.06*Math.sin(x/w*TAU*5));b.lineTo(w,h);b.fill();
      const birch=(x,y,s)=>{b.fillStyle='#f4f0e8';b.fillRect(x-s*.06,y-s,s*.12,s);b.fillStyle='#2a2a2a';for(let i=0;i<5;i++)b.fillRect(x-s*.06+(i%2)*s*.05,y-s*.9+i*s*.18,s*.06,s*.03);
        for(const [dx,dy,r] of[[0,-1.15,.32],[-.22,-.95,.26],[.22,-.98,.27],[0,-.8,.25]]){b.fillStyle=dy<-1?'#8fd060':'#6aae46';b.beginPath();b.arc(x+dx*s,y+dy*s,r*s,0,TAU);b.fill();}};
      const stog=(x,y,s)=>{const q=b.createLinearGradient(x-s,0,x+s,0);q.addColorStop(0,'#f2d27a');q.addColorStop(1,'#c89a3a');b.fillStyle=q;b.beginPath();b.moveTo(x-s*.7,y);b.quadraticCurveTo(x-s*.75,y-s*1.1,x,y-s*1.35);b.quadraticCurveTo(x+s*.75,y-s*1.1,x+s*.7,y);b.fill();b.fillStyle='#8a5a2a';b.fillRect(x-1.5,y-s*1.6,3,s*.35);};
      const mill=(x,y,s)=>{b.fillStyle='#9a6a3a';b.beginPath();b.moveTo(x-s*.35,y);b.lineTo(x-s*.25,y-s*1.2);b.lineTo(x+s*.25,y-s*1.2);b.lineTo(x+s*.35,y);b.fill();b.fillStyle='#6a3a1a';b.beginPath();b.moveTo(x-s*.32,y-s*1.2);b.lineTo(x,y-s*1.55);b.lineTo(x+s*.32,y-s*1.2);b.fill();
        b.strokeStyle='#f4ead0';b.lineWidth=Math.max(2,s*.06);for(let i=0;i<4;i++){const a=i*TAU/4+.4;b.beginPath();b.moveTo(x,y-s*1.25);b.lineTo(x+Math.cos(a)*s*.9,y-s*1.25+Math.sin(a)*s*.9);b.stroke();}};
      for(let i=0;i<9;i++){const x=RR()*w,y=h*.5+RR()*h*.08;birch(x,y,h*(.3+RR()*.12));}
      for(let i=0;i<5;i++){const x=RR()*w;stog(x,h*.62+RR()*h*.1,h*(.12+RR()*.05));}
      mill(w*.3,h*.5,h*.3);
      for(let i=0;i<40;i++){b.fillStyle=['#ffe27a','#fff','#f48ab0'][i%3];b.beginPath();b.arc(RR()*w,h*.65+RR()*h*.35,1.4,0,TAU);b.fill();}});
    // ближняя кромка поля: кусты и пшеница
    const nh=hs*.55;L2.near=tile(Tw,nh,(b,w,h)=>{for(let x=0;x<w;x+=3){const hh=h*(.35+.25*Math.sin(x*.07)+.15*Math.sin(x*.21));b.strokeStyle=x%2?'#d8b84a':'#c8a034';b.lineWidth=2;b.beginPath();b.moveTo(x,h);b.quadraticCurveTo(x+2,h-hh*.6,x+4,h-hh);b.stroke();
        if(x%9===0){b.fillStyle='#e8c860';b.beginPath();b.ellipse(x+4,h-hh,1.6,4,.3,0,TAU);b.fill();}}
      for(let i=0;i<14;i++){const x=RR()*w;b.fillStyle='#3a7ad8';b.beginPath();b.arc(x,h*(.5+RR()*.3),2.6,0,TAU);b.fill();b.fillStyle='#fff';b.beginPath();b.arc(x+9,h*(.55+RR()*.3),2.4,0,TAU);b.fill();}});
    // дорога (полоса бега)
    const rh=Math.max(14,hs*.24);L2.road=tile(Tw,rh,(b,w,h)=>{let q=b.createLinearGradient(0,0,0,h);q.addColorStop(0,'#c8a06a');q.addColorStop(1,'#a07848');b.fillStyle=q;b.fillRect(0,0,w,h);
      b.strokeStyle='rgba(110,70,30,.35)';b.lineWidth=2;for(const yy of[.3,.7]){b.beginPath();for(let x=0;x<=w;x+=10)b.lineTo(x,h*yy+Math.sin(x*.05)*1.5);b.stroke();}
      for(let i=0;i<60;i++){b.fillStyle=RR()<.5?'rgba(90,60,30,.35)':'rgba(240,220,180,.4)';b.beginPath();b.ellipse(RR()*w,RR()*h,1.5+RR()*2.5,1+RR()*1.2,0,0,TAU);b.fill();}});
    // передний план: луг с ромашками и васильками
    const fh2=H-gy-rh+4;L2.front=tile(Tw,fh2,(b,w,h)=>{let q=b.createLinearGradient(0,0,0,h);q.addColorStop(0,'#5aa03e');q.addColorStop(1,'#2e6a2a');b.fillStyle=q;b.fillRect(0,0,w,h);
      for(let i=0;i<Math.min(900,w*h/120);i++){const x=RR()*w,y=RR()*h,l=6+y/h*16;b.strokeStyle=RR()<.5?'#6ab84a':'#3e8a32';b.lineWidth=1.6;b.beginPath();b.moveTo(x,y);b.quadraticCurveTo(x+3,y-l*.6,x+(RR()-.5)*8,y-l);b.stroke();}
      for(let i=0;i<w*h/2600;i++){const x=RR()*w,y=h*.15+RR()*h*.85,s=3+y/h*6;if(RR()<.6){b.fillStyle='#fff';for(let j=0;j<8;j++){const a=j/8*TAU;b.beginPath();b.ellipse(x+Math.cos(a)*s*.6,y+Math.sin(a)*s*.6,s*.45,s*.2,a,0,TAU);b.fill();}b.fillStyle='#f2c03a';b.beginPath();b.arc(x,y,s*.3,0,TAU);b.fill();}
        else{b.fillStyle='#4a7ae0';for(let j=0;j<6;j++){const a=j/6*TAU;b.beginPath();b.arc(x+Math.cos(a)*s*.35,y+Math.sin(a)*s*.35,s*.3,0,TAU);b.fill();}b.fillStyle='#2a3a9a';b.beginPath();b.arc(x,y,s*.2,0,TAU);b.fill();}}});
    L2.rh=rh;lay=L2;}
  function strip(c,y,par){const off=((st.pos*hs*par)%c.TW+c.TW)%c.TW;for(let x=-off;x<W;x+=c.TW)g.drawImage(c,x,y,c.TW,c.TH);}
  /* ---------- конь (ед. = hs/100, начало — земля под серединой, нос вправо) ---------- */
  const COAT='#9c7c62',COAT2='#6e5442',LOW='#5e4636',MANE='#f6e8c0',MANE2='#d8a83a';
  function ik(jx,jy,tx,ty,L1,L2,sign){let dx=tx-jx,dy=ty-jy,d=Math.hypot(dx,dy);const mx=L1+L2-.01;if(d>mx){dx*=mx/d;dy*=mx/d;d=mx;tx=jx+dx;ty=jy+dy;}
    const base=Math.atan2(dy,dx),a=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));const an=base+sign*a;return {kx:jx+Math.cos(an)*L1,ky:jy+Math.sin(an)*L1,tx,ty};}
  function seg(x1,y1,x2,y2,w1,w2,col,ol){const a=Math.atan2(y2-y1,x2-x1),nx=-Math.sin(a),ny=Math.cos(a);g.beginPath();g.moveTo(x1+nx*w1,y1+ny*w1);g.lineTo(x2+nx*w2,y2+ny*w2);g.arc(x2,y2,w2,a+Math.PI/2,a-Math.PI/2,true);g.lineTo(x1-nx*w1,y1-ny*w1);g.arc(x1,y1,w1,a-Math.PI/2,a+Math.PI/2,true);g.closePath();g.fillStyle=col;g.fill();if(ol!==false){g.lineWidth=1.3;g.strokeStyle='rgba(40,24,14,.7)';g.stroke();}}
  function legPos(fore,off,air,ph){const p=((st.phi+off)%1+1)%1,A=fore?16:14,lift=fore?22:16,sF=.42;let x,y;
    if(p<sF){const s=p/sF;x=A-2*A*s;y=0;}else{const s=(p-sF)/(1-sF);x=-A+2*A*(.5-.5*Math.cos(Math.PI*s));y=-lift*Math.sin(Math.PI*s);}
    const tx=fore?10:-34,ty=fore?-30:-14;x+=(tx-x)*air;y+=(ty-y)*air;
    if(ph==='fall'){x=fore?20:-20;y=0;}
    return {x,y};}
  // нога: два сустава, бабка со щёткой, копыто
  function leg(fore,far,off,air,ph,bodyY,pitch){const jx0=fore?20:-25,jy0=fore?-56:-62,ca=Math.cos(pitch),sa=Math.sin(pitch),jx=jx0*ca-jy0*sa,jy=jx0*sa+jy0*ca+bodyY;
    const p=legPos(fore,off,air,ph),L1=fore?27:30,L2=fore?29:30,T=ik(jx,jy,jx0*.95+p.x,p.y,L1,L2,fore?-1:1);
    const col=far?COAT2:COAT,low=far?'#4a3628':LOW;
    seg(jx,jy,T.kx,T.ky,fore?8:11,4.6,col);seg(T.kx,T.ky,T.tx,T.ty-3.5,4.6,3.3,low);
    if(!fore&&!far){g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(T.kx,T.ky,3.6,0,TAU);g.fill();}
    const a=Math.atan2(T.ty-T.ky,T.tx-T.kx);g.save();g.translate(T.tx,T.ty-3.5);g.rotate(a-Math.PI/2);
    g.fillStyle=far?'#cdbb98':'#f2e6c6';g.beginPath();g.moveTo(-5.6,-3);g.quadraticCurveTo(-7,2,-4.6,3);g.lineTo(4.6,3);g.quadraticCurveTo(7,2,5.6,-3);g.quadraticCurveTo(0,-6,-5.6,-3);g.fill();g.strokeStyle='rgba(60,40,20,.45)';g.lineWidth=.8;g.stroke();
    g.fillStyle=far?'#2a2018':'#3a2c20';g.beginPath();g.moveTo(-4.4,2.4);g.lineTo(4.4,2.4);g.lineTo(5.4,7);g.lineTo(-5.4,7);g.closePath();g.fill();
    g.fillStyle=st.magic>0?'rgba(255,220,90,.95)':'rgba(200,200,210,.7)';g.fillRect(-5.4,6,10.8,1.5);g.restore();
    if(!far&&air<=0&&p.y>-1&&Math.random()<.02&&!calm)st.dust=1;
    return T;}
  function horse(x,y,s){const air=Math.min(1,st.air),ph=st.ph;
    const bob=ph==='fall'?10:air>.5?0:-Math.cos(TAU*(st.phi-.1))*2.6,pitch=ph==='fall'?.26:st.stum>0?Math.sin(st.stum*9)*.1:(air>.3?-st.vy*.05:Math.sin(TAU*st.phi)*.04);
    g.save();g.translate(x,y);g.scale(s/100,s/100);g.lineJoin='round';g.lineCap='round';
    const sh=Math.max(.25,1-st.alt/(hs*1.2));g.fillStyle='rgba(40,30,20,'+(.3*sh)+')';g.beginPath();g.ellipse(0,st.alt*100/s,46*sh,7*sh,0,0,TAU);g.fill();
    if(st.magic>0){g.globalAlpha=.7;g.drawImage(K.glow('rgba(255,210,90,.8)'),-100,-160,200,200);g.globalAlpha=1;}
    const pc=Math.max(-.3,Math.min(.3,pitch));
    g.save();g.rotate(pc);g.translate(0,bob);tail();g.restore();
    leg(1,1,.58,air,ph,bob,pc);leg(0,1,.1,air,ph,bob,pc);
    g.save();g.rotate(pc);g.translate(0,bob);body();g.restore();
    leg(0,0,0,air,ph,bob,pc);leg(1,0,.5,air,ph,bob,pc);
    g.save();g.rotate(pc);g.translate(0,bob);
    // мышцы плеча и бедра — мягкой тенью, без контура
    for(const [mx,my,rx,ry] of[[19,-62,11,14],[-25,-66,15,16]]){const q=g.createRadialGradient(mx-rx*.3,my-ry*.4,1,mx,my,Math.max(rx,ry));q.addColorStop(0,shade(COAT,.22));q.addColorStop(.7,rgba(COAT,.9));q.addColorStop(1,rgba(COAT,0));g.fillStyle=q;g.beginPath();g.ellipse(mx,my,rx,ry,0,0,TAU);g.fill();}
    dapple(-24,-68,13);dapple(-6,-66,12);
    saddle();rider();neckHead();
    g.restore();g.restore();}
  function dapple(cx,cy,r){g.save();g.globalAlpha=.3;g.fillStyle='#e8dccc';const RR=K.rnd(Math.round(cx*7+cy*3+99));for(let i=0;i<8;i++){const a=RR()*TAU,d=RR()*r*.75;g.beginPath();g.ellipse(cx+Math.cos(a)*d,cy+Math.sin(a)*d,1.6+RR()*2.4,1.3+RR()*1.8,RR()*3,0,TAU);g.fill();}g.restore();}
  // туловище: холка, спина, круп, брюхо, грудь
  function body(){shp(g,COAT,{hl:.26,lw:1.6},[-42,-84,36,-46],()=>{g.moveTo(14,-79);g.quadraticCurveTo(-4,-74,-22,-81);g.bezierCurveTo(-34,-84,-44,-74,-40,-60);g.quadraticCurveTo(-38,-50,-30,-49);
      g.quadraticCurveTo(-4,-44,20,-48);g.bezierCurveTo(30,-50,36,-58,33,-68);g.quadraticCurveTo(26,-80,14,-79);g.closePath();});
    g.save();g.globalAlpha=.32;g.fillStyle='#f0e2cc';g.beginPath();g.ellipse(-4,-50,20,3.6,0,0,TAU);g.fill();g.restore();shine(g,-8,-76,15,3,.22);}
  function tail(){const T=st.t,sp=st.air>.5?1.4:1;for(let i=0;i<7;i++){const ph=i*.5,w=6.5-i*.6;g.strokeStyle=i%2?MANE2:MANE;g.lineWidth=w;g.beginPath();g.moveTo(-38,-74);
      const x1=-52-i*1.4,y1=-72+Math.sin(T*9*sp+ph)*4,x2=-68-i*2.2,y2=-60+i*2.6+Math.sin(T*9*sp+ph+1.2)*6*sp;g.bezierCurveTo(-46,-80,x1,y1,x2,y2);g.stroke();}
    if(st.magic>0){g.fillStyle='rgba(255,230,120,.85)';for(let i=0;i<4;i++){g.beginPath();g.arc(-68-i*3,-56+Math.sin(st.t*12+i)*6,1.6,0,TAU);g.fill();}}}
  // шея и голова одним контуром; кивок вокруг основания шеи
  function neckHead(){const T=st.t,nod=st.air>.5?-.08:Math.sin(TAU*st.phi+1)*.07,mg=st.magic>0;
    g.save();g.translate(24,-70);g.rotate(nod);g.translate(-24,70);
    shp(g,COAT,{hl:.3,lw:1.6},[10,-114,70,-58],()=>{g.moveTo(12,-78);g.quadraticCurveTo(24,-98,40,-110);g.quadraticCurveTo(46,-113,50,-110);
      g.bezierCurveTo(56,-104,64,-96,68,-89);g.quadraticCurveTo(71,-83,66,-80);g.quadraticCurveTo(60,-78,55,-82);g.quadraticCurveTo(50,-88,44,-90);
      g.quadraticCurveTo(38,-84,36,-74);g.quadraticCurveTo(34,-64,30,-58);g.quadraticCurveTo(22,-62,12,-78);g.closePath();});
    // морда светлее, ноздря, рот
    g.save();g.globalAlpha=.55;g.fillStyle='#c8b098';g.beginPath();g.ellipse(64,-85,5.5,4.5,.6,0,TAU);g.fill();g.restore();
    g.fillStyle='#2a1810';g.beginPath();g.ellipse(65.5,-87.5,1.7,1.1,.7,0,TAU);g.fill();ln(g,[60,-81.5,64,-81],'rgba(40,20,10,.6)',.9);
    // глаз с бликом и ресницами
    g.fillStyle='#1d140e';g.beginPath();g.ellipse(50.5,-101,2.6,2.2,.5,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(51.4,-101.9,.9,0,TAU);g.fill();ln(g,[47.6,-103.4,52.6,-104.6],'rgba(30,20,10,.85)',1);
    if(mg){g.globalAlpha=.9;g.drawImage(K.glow('rgba(255,230,120,.9)'),44,-107,13,13);g.globalAlpha=1;}
    // уши
    for(const [dx,c] of[[-3,COAT2],[1,COAT]]){shp(g,c,{lw:1},[38,-124,48,-108],()=>{g.moveTo(41+dx,-109);g.quadraticCurveTo(39+dx,-118,43+dx,-124);g.quadraticCurveTo(48+dx,-116,46+dx,-108);g.closePath();});}
    // грива волнами по гребню и чёлка
    for(let i=0;i<8;i++){const u=i/7,bx=14+u*28,by=-80-u*30,w=Math.sin(T*10+i*.9)*(3+u*2)*(st.air>.5?1.3:1);g.strokeStyle=i%2?MANE2:MANE;g.lineWidth=6-u*1.8;g.beginPath();g.moveTo(bx+3,by+1);g.quadraticCurveTo(bx-8,by+3+w*.4,bx-16-u*4,by+9+w);g.stroke();}
    g.strokeStyle=MANE;g.lineWidth=3.5;g.beginPath();g.moveTo(44,-111);g.quadraticCurveTo(48,-106+Math.sin(T*10)*1.5,50,-104);g.stroke();
    // уздечка с золотыми бляшками и кистью
    g.strokeStyle='#c8261e';g.lineWidth=2.2;g.beginPath();g.moveTo(45,-109);g.lineTo(52,-90);g.moveTo(47,-100);g.lineTo(64,-92);g.moveTo(52,-90);g.lineTo(61,-83);g.stroke();
    for(const [px,py] of[[47,-100],[55,-97],[63,-92],[52,-90]]){g.fillStyle='#f2c03a';g.beginPath();g.arc(px,py,1.6,0,TAU);g.fill();}
    ln(g,[52,-90,51,-84],'#f2c03a',1.6);ell(g,51,-83,1.8,2.6,'#c8261e',{lw:.5});
    g.restore();}
  // чепрак (синий с золотым узором, кисти), седло
  function saddle(){shp(g,'#2a5aa8',{hl:.25,lw:1.3},[-20,-84,14,-58],()=>{g.moveTo(-18,-82);g.lineTo(10,-81);g.quadraticCurveTo(14,-70,11,-60);g.lineTo(-17,-60);g.quadraticCurveTo(-21,-70,-18,-82);g.closePath();});
    g.strokeStyle='#f2c03a';g.lineWidth=1.6;g.beginPath();g.moveTo(-15,-63);g.lineTo(9,-63);g.stroke();g.fillStyle='#f2c03a';for(let x=-13;x<=7;x+=5){g.beginPath();g.moveTo(x,-72);g.lineTo(x+2.5,-69);g.lineTo(x,-66);g.lineTo(x-2.5,-69);g.closePath();g.fill();}
    for(let x=-15;x<=9;x+=6)ln(g,[x,-60,x+.5,-55],'#d8262e',1.8);
    ell(g,-3,-81,13,4.4,'#6a3a1a',{hl:.35,lw:1.2});ell(g,-15,-84,3.2,4.4,'#6a3a1a',{lw:1});ell(g,8,-83,2.6,3.6,'#6a3a1a',{lw:1});}
  // богатырь игрока верхом (рисунок из art.js), нога в стремени
  function rider(){const k=K.heroKey().replace(/^hp_/,'h_')+'_0',key=typeof ART!=='undefined'&&ART[k]?k:K.heroKey(),sz=84,s=K.spr(key,sz*hs/100,D);
    const boots=PAL.boots||'#4a2c1c',body=PAL.body||'#c8392f',by=-104+(st.air>.5?-2:Math.cos(TAU*st.phi)*1.8);
    if(s){g.save();g.beginPath();g.rect(-50,by-50,100,50+11*sz/80);g.clip();g.drawImage(s,-sz/2+2,by-sz/2,sz,sz);g.restore();}
    seg(-3,-86,7,-74,5.5,4.2,shade(body,-.2));seg(7,-74,5,-64,4.2,3.6,shade(body,-.2));ell(g,8,-61,6.4,3.8,boots,{lw:1});ln(g,[0,-82,5,-60],'#8a6a3a',1);
    g.strokeStyle='#8a2a1a';g.lineWidth=1.4;g.beginPath();g.moveTo(12,by+8);g.quadraticCurveTo(34,by+18,51,-89);g.stroke();}
  /* ---------- препятствия и подковы ---------- */
  function fence(x,w,hit){const s=hs/100,fw=w*hs,fh=hs*.38,y=gy+lay.rh*.55;g.save();g.translate(x,y);
    g.fillStyle='rgba(40,30,20,.25)';g.beginPath();g.ellipse(0,2,fw*.7,fh*.08,0,0,TAU);g.fill();
    if(hit)g.rotate(.18);
    const stakes=[-fw/2,0,fw/2];for(const sx of stakes){seg(sx,4,sx+(hit?2:0),-fh-6*s,3.2*s,2.6*s,'#8a5a2e');}
    for(let r=0;r<5;r++){const yy=-fh*.12-r*fh*.19;g.strokeStyle=r%2?'#a8783e':'#c08a4a';g.lineWidth=fh*.12;g.beginPath();for(let i=0;i<=12;i++){const xx=-fw/2-4*s+i*(fw+8*s)/12;g.lineTo(xx,yy+Math.sin(i*Math.PI/2+r)*fh*.04);}g.stroke();
      g.strokeStyle='rgba(60,30,10,.5)';g.lineWidth=1;g.stroke();}
    // кринка на колу
    ell(g,stakes[2],-fh-9*s,6*s,6.5*s,'#c86a3a',{hl:.4,lw:1});rrect(g,stakes[2]-4*s,-fh-16*s,8*s,3*s,1);g.fillStyle='#a84a2a';g.fill();
    g.restore();}
  function puddle(x,w,hit){const pw=w*hs,y=gy+lay.rh*.6,ry=Math.max(6,hs*.075);g.save();
    g.fillStyle='#6a4a2a';g.beginPath();g.ellipse(x,y,pw/2+5,ry+4,0,0,TAU);g.fill();
    const q=g.createLinearGradient(0,y-ry,0,y+ry);q.addColorStop(0,'#8cc8f2');q.addColorStop(1,'#3a78b8');g.fillStyle=q;g.beginPath();g.ellipse(x,y,pw/2,ry,0,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(x-pw*.15,y-ry*.3,pw*.18,ry*.18,0,0,TAU);g.fill();
    if(!calm){g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1.2;const k=(st.t*1.5)%1;g.beginPath();g.ellipse(x+pw*.12,y,pw*.12*k+3,ry*.4*k+1,0,0,TAU);g.stroke();}
    // камыш
    for(const dx of[-.5,.47]){const rx=x+dx*pw;for(let i=0;i<3;i++){ln(g,[rx+i*3,y,rx+i*3+2,y-hs*(.18+i*.04)],'#4a8a3a',2);}ell(g,rx+5,y-hs*.2,1.8,5,'#6a3a1a',{lw:.5});}
    if(hit){g.fillStyle='rgba(90,60,30,.4)';g.beginPath();g.ellipse(x,y,pw*.4,ry*.6,0,0,TAU);g.fill();}g.restore();}
  function shoe(x,y,r,t,gl){g.save();g.translate(x,y);const sc=calm?1:Math.abs(Math.cos(t*2.4))*.65+.35;
    if(gl){g.globalAlpha=.6;g.drawImage(K.glow('rgba(255,220,90,.75)'),-r*2.2,-r*2.2,r*4.4,r*4.4);g.globalAlpha=1;}
    g.scale(sc,1);g.lineCap='round';g.strokeStyle='#6a3a08';g.lineWidth=r*.62;g.beginPath();g.arc(0,-r*.05,r*.72,Math.PI*.85,Math.PI*2.15);g.stroke();
    const q=g.createLinearGradient(-r,-r,r,r);q.addColorStop(0,'#fff3a0');q.addColorStop(.5,'#f2c03a');q.addColorStop(1,'#c8861a');g.strokeStyle=q;g.lineWidth=r*.42;g.beginPath();g.arc(0,-r*.05,r*.72,Math.PI*.85,Math.PI*2.15);g.stroke();
    g.fillStyle='#8a5a10';for(const a of[1.05,1.3,1.7,1.95]){g.beginPath();g.arc(Math.cos(a*Math.PI)*r*.72,-r*.05+Math.sin(a*Math.PI)*r*.72,r*.07,0,TAU);g.fill();}g.restore();}
  /* ---------- логика ---------- */
  function say(s,x,y,col,px){pops.push({s,x,y,c:col||'#fff6dc',t:0,px:px||Math.min(30,W*.07)});}
  function jump(){if(st.ph!=='run')return;if(st.air<=0||st.coy>0){doJump();}else st.buf=.14;}
  function doJump(){const T=JT,v0=4*JH/T;st.vy=v0;st.g=8*JH/(T*T);st.air=.001;st.coy=0;st.buf=0;K.snd(host,'swing');
    K.burst(P,hx,gy+lay.rh*.4,{n:calm?3:8,col:['#d8b888','#c8a070'],sp:120,g:200,k:'puff',s:6,a0:Math.PI,arc:Math.PI*.6,d:.5});}
  function crash(kind){if(st.inv>0||st.magic>0)return;st.hp--;st.inv=1.6;st.stum=.8;st.sm=.45;K.snd(host,'hurt');if(!calm){st.shake=.35;}st.flash=.45;
    if(kind==='fence'){K.snd(host,'crack');K.burst(P,hx+hs*.35,gy-hs*.2,{n:calm?6:16,col:['#a8783e','#c08a4a','#8a5a2e'],sp:280,k:'chip',s:5,g:600,d:.8});say(L('Тпру!','Whoa!'),hx,gy-hs*1.35,'#ffb0a0');}
    else{K.burst(P,hx,gy+lay.rh*.4,{n:calm?8:22,col:['#8cc8f2','#c8e6ff','#6a4a2a'],sp:300,g:700,s:4,a0:-Math.PI,arc:Math.PI,d:.7});say(L('Плюх!','Splash!'),hx,gy-hs*1.35,'#bfe6ff');}
    if(st.hp<=0){st.ph='fall';st.t=0;K.snd(host,'lose');}}
  function addShoe(x,y,n){st.shoes+=n;st.score+=n;if(st.magic<=0)st.mag=Math.min(MAGIC_N,st.mag+n);K.snd(host,'coin');K.burst(P,x,y,{n:calm?3:7,col:['#fff3a0','#ffd24a'],sp:160,k:'star',s:4,g:0,d:.4});}
  function step(dt){st.t+=dt;for(const q of pops)q.t+=dt;for(let i=pops.length-1;i>=0;i--)if(pops[i].t>1.2)pops.splice(i,1);if(st.shake>0)st.shake-=dt;if(st.flash>0)st.flash-=dt;if(st.cheer>0)st.cheer-=dt;
    if(st.ph==='how'){st.howT+=dt;st.phi=(st.phi+dt*.9)%1;return;}
    if(st.ph==='fall'){st.v*=Math.pow(.05,dt);st.pos+=st.v*dt;if(st.t>1.3)fallOffer();return;}
    if(st.ph==='end'){st.v*=Math.pow(.25,dt);st.pos+=st.v*dt;st.phi=(st.phi+st.v*dt/1.15)%1;
      if(st.t>2.4&&!st.sent){st.sent=1;let tot=0;if(!o.train&&host.store){try{const sv=host.store();sv.shoes=(sv.shoes|0)+st.shoes;tot=sv.shoes;host.touch();}catch(e){}}
        host.done({score:st.score,tier:tierOf(st.score),extra:{shoes:st.shoes,clean:st.clean,msg:tot?L('Подков в конюшне: ','Horseshoes in the stable: ')+tot:''}});}return;}
    if(st.ph!=='run')return;
    st.el+=dt;st.time-=dt;if(st.hint>0)st.hint-=dt;if(st.inv>0)st.inv-=dt;if(st.stum>0)st.stum-=dt;st.sm=Math.min(1,st.sm+dt*.5);
    st.v=vAt(st.el,calm)*st.sm*(st.magic>0?1.2:1);st.pos+=st.v*dt;st.phi=(st.phi+st.v*dt/1.15*(st.air>0?.25:1))%1;
    // прыжок / полёт
    if(st.magic>0){st.magic-=dt;const tgt=st.magic>.6?hs*.95:0;st.alt+=(tgt-st.alt)*Math.min(1,dt*3);st.air=st.alt>4?1:0;st.vy=0;
      if(!calm&&Math.random()<dt*30)FX.push({k:'fire',t:0});
      if(st.magic<=0){st.magic=0;st.alt=0;st.air=0;}}
    else if(st.air>0){st.vy-=st.g*dt;st.alt+=st.vy*hs*dt;st.air=Math.min(1,st.air+dt*6);if(st.alt<=0){st.alt=0;st.air=0;st.vy=0;K.snd(host,'hit');st.dust=1;
        if(st.buf>0)doJump();}}
    if(st.buf>0)st.buf-=dt;
    if(st.mag>=MAGIC_N&&st.magic<=0&&st.air<=0){st.mag=0;st.magic=MAGIC_T;st.cheer=2.6;K.snd(host,'level');K.snd(host,'whistle');}
    // препятствия
    const B=-.36,F=.44;
    for(const ob of C.ob){const dx=ob.x-st.pos;if(dx>4||ob.done)continue;
      if(ob.k==='fence'){if(!ob.hit&&dx-ob.w/2<F&&dx+ob.w/2>B&&st.alt<hs*.33&&st.magic<=0&&st.inv<=0){ob.hit=1;crash('fence');}}
      else{const m=ob.w*.36;if(!ob.hit&&Math.abs(dx)<m+.12&&st.alt<2&&st.magic<=0&&st.inv<=0){ob.hit=1;crash('puddle');}}
      if(dx+ob.w/2<B-.1){ob.done=1;if(!ob.hit){st.clean++;st.score++;say(L('Чисто! +1','Clean! +1'),hx+hs*.3,gy-hs*1.5-st.alt,'#c8ffb0',Math.min(22,W*.052));}}}
    // подковы
    const mx=st.pos+.22,my=st.alt/hs+.5;
    for(const s of C.sh){if(s.got)continue;let dx=s.x-mx;if(dx>5)break;if(dx<-1){s.got=2;continue;}
      if(st.magic>0&&dx<3){s.mx=(s.mx||0)+dt*2.5;}
      const sy=s.a-(s.mx?Math.min(1,s.mx)*(s.a-my):0),sx=s.x-(s.mx?Math.min(1,s.mx)*dx:0);
      if(Math.abs(sx-mx)<.3&&Math.abs(sy-my)<.42){s.got=1;addShoe(hx+(sx-st.pos)*hs,gy-sy*hs,1);}}
    // пыль из-под копыт
    if(st.air<=0&&st.magic<=0&&Math.random()<dt*(calm?5:14))K.burst(P,hx-hs*.25,gy+lay.rh*.3,{n:1,col:'rgba(200,170,120,.8)',sp:40,vx:-st.v*hs*.3,g:-20,k:'puff',s:hs*.05,a0:Math.PI,arc:.6,d:.7});
    if(st.time<=0){st.time=0;st.ph='end';st.t=0;st.fin=1;K.snd(host,st.score>=TIER[0]?'win':'lose');st.cheer=2;}}
  /* ---------- «Продолжить с места падения» ---------- */
  let fb=null,usedAd=0;
  function fallOffer(){if(fb)return;const can=!o.train&&!usedAd&&host.adOk&&host.adOk()&&st.time>3;if(!can){toEnd();return;}
    fb=document.createElement('div');fb.style.cssText='position:absolute;left:0;right:0;bottom:calc(var(--sb,0px) + 18px);display:flex;flex-direction:column;align-items:center;gap:10px;z-index:3;padding:0 16px';
    fb.innerHTML='<button class="btn ad" data-k="ad" style="width:auto;max-width:100%;min-height:52px">'+L('🎬 Продолжить с места падения — реклама','🎬 Continue from the fall — watch an ad')+'</button><button class="btn ghost" data-k="end" style="width:auto;min-height:46px">'+L('Закончить скачки','Finish the race')+'</button>';
    host.el.appendChild(fb);host.hold=true;try{host.offer&&host.offer();}catch(_){}
    fb.querySelector('[data-k=ad]').onclick=e=>{e.stopPropagation();const b=e.currentTarget;b.disabled=true;host.ad('cont').then(ok=>{b.disabled=false;if(!fb)return;if(ok){usedAd=1;fb.remove();fb=null;host.hold=false;st.hp=2;st.inv=2;st.sm=.5;st.ph='run';say(L('Сивка, вперёд!','Go, Sivka!'),W/2,gy-hs*1.5,'#9aff7a');K.snd(host,'heal');}});};
    fb.querySelector('[data-k=end]').onclick=e=>{e.stopPropagation();fb.remove();fb=null;host.hold=false;toEnd();};}
  function toEnd(){st.ph='end';st.t=0;}
  /* ---------- ввод ---------- */
  function begin(){if(st.ph!=='how')return;st.ph='run';st.t=0;st.hint=6;K.snd(host,'whistle');say(L('Но-о, Сивка!','Giddy-up, Sivka!'),W/2,gy-hs*1.5,'#ffe27a',Math.min(32,W*.075));}
  cv.addEventListener('pointerdown',e=>{e.preventDefault();if(host.paused)return;if(st.ph==='how'){begin();return;}jump();});
  K.keys(host,(k,e,down)=>{if(!down)return false;if(st.ph==='how'){if(k==='Enter'||k===' '){begin();return true;}return false;}
    if(k===' '||k==='ArrowUp'||e.code==='KeyW'||k==='Enter'){jump();return true;}return false;});
  /* ---------- кадр ---------- */
  let lastDt=0;
  function draw(T){g.setTransform(D,0,0,D,0,0);if(!lay)mkLayers();
    let ox=0,oy=0;if(st.shake>0&&!calm){ox=(Math.random()-.5)*12*st.shake/.35;oy=(Math.random()-.5)*8*st.shake/.35;}
    g.save();g.translate(ox,oy);
    g.drawImage(lay.sky,0,0,W,gy);
    // облака плывут
    g.fillStyle='rgba(255,255,255,.88)';for(let i=0;i<4;i++){const cw=Math.min(W,H)*.09,x=((i*W*.37-st.pos*hs*.03-T*6)%(W+cw*4)+W+cw*4)%(W+cw*4)-cw*2,y=gy*(.12+i*.09);for(let j=0;j<4;j++){g.beginPath();g.ellipse(x+(j-1.5)*cw*.7,y-(j%2)*cw*.3,cw*.7,cw*.45,0,0,TAU);g.fill();}}
    strip(lay.far,gy-lay.far.TH-(land?hs*.12:hs*.1),.06);
    strip(lay.mid,gy-lay.mid.TH+2,.22);
    strip(lay.near,gy-lay.near.TH+lay.rh*.15,.6);
    strip(lay.road,gy,1);
    // финишные столбы
    if(st.time<4&&st.ph!=='how'){const fx=hx+(st.time*st.v*.9+.8)*hs;finish(fx);}
    // препятствия
    for(const ob of C.ob){const dx=ob.x-st.pos;if(dx<-3||dx>(W-hx)/hs+2)continue;const x=hx+dx*hs;if(ob.k==='fence')fence(x,ob.w,ob.hit);else puddle(x,ob.w,ob.hit);}
    // подковы
    const mx=st.pos+.22,my=st.alt/hs+.5,rS=Math.max(9,hs*.085);
    for(const s of C.sh){if(s.got)continue;const dx0=s.x-st.pos;if(dx0<-2)continue;if(dx0>(W-hx)/hs+1)break;const k=s.mx?Math.min(1,s.mx):0,sx=s.x-k*(s.x-mx),sy=s.a-k*(s.a-my);shoe(hx+(sx-st.pos)*hs,gy-sy*hs,rS,T+s.x,s.arc);}
    // конь
    const blink=st.inv>0&&st.magic<=0&&st.ph==='run'?(calm?.55:(Math.sin(st.t*30)>0?.45:1)):1;g.globalAlpha=blink;horse(hx,gy-st.alt+lay.rh*.45,hs);g.globalAlpha=1;
    // волшебство: пламя из ноздрей, дым из ушей
    if(st.magic>0){const nx=hx+hs*.58,ny=gy-st.alt+lay.rh*.45-hs*.82;if(Math.random()<.7)K.burst(P,nx,ny,{n:1,col:['#ffd24a','#ff8a2a','#fff3a0'][Math.floor(Math.random()*3)],sp:120,vx:hs*.8,g:-40,s:hs*.045,a0:-.3,arc:.6,d:.35});
      if(Math.random()<.35)K.burst(P,hx+hs*.38,ny-hs*.28,{n:1,col:'rgba(220,220,230,.7)',sp:40,g:-80,k:'puff',s:hs*.05,a0:-Math.PI*.6,arc:.4,d:.9});
      if(Math.random()<.5)K.burst(P,hx-hs*.3,ny+hs*.4,{n:1,col:'#fff3a0',sp:30,vx:-hs*2,g:0,k:'star',s:hs*.03,d:.6});}
    K.parts(g,P,lastDt);
    // передний луг
    strip(lay.front,gy+lay.rh-2,1.35);
    for(const q of pops){const k=q.t/1.2;g.globalAlpha=1-Math.max(0,k-.6)*2.5;K.text(g,q.s,q.x,q.y-k*30,q.px*(q.t<.12?.7+q.t*2.5:1),{col:q.c,mw:W*.9});}g.globalAlpha=1;
    g.restore();
    if(st.flash>0&&!calm){const a=Math.min(1,st.flash/.45)*.45,q=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);q.addColorStop(0,'rgba(200,30,20,0)');q.addColorStop(1,'rgba(200,30,20,'+a+')');g.fillStyle=q;g.fillRect(0,0,W,H);}
    if(st.magic>0){const a=Math.min(1,st.magic,(MAGIC_T-st.magic)*3)*.22;const q=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.75);q.addColorStop(0,'rgba(255,220,90,0)');q.addColorStop(1,'rgba(255,200,60,'+a+')');g.fillStyle=q;g.fillRect(0,0,W,H);}
    hud(T);
    if(st.magic>MAGIC_T-2.2){const t2=MAGIC_T-st.magic;K.banner(g,W,land?H*.2:gy+(H-gy)*.3,L('Сивка-Бурка, вещая каурка!','Sivka-Burka, magic steed!'),Math.min(38,W*.075),t2);
      if(t2>.4)K.banner(g,W,(land?H*.2:gy+(H-gy)*.3)+Math.min(40,W*.085),L('Встань передо мной, как лист перед травой!','Stand before me like a leaf before grass!'),Math.min(20,W*.045),t2-.4,['#ffffff','#ffe9a8']);}
    if(st.ph==='how'){g.fillStyle='rgba(20,12,6,.45)';g.fillRect(0,0,W,H);
      const rows=[{keys:[L('Пробел','Space'),'↑'],txt:L('Прыжок через плетень или лужу. Мышью — щелчок где угодно.','Jump over fences and puddles. With a mouse — click anywhere.'),tap:L('Тапни по экрану — конь прыгнет через плетень или лужу.','Tap the screen — the horse jumps a fence or puddle.'),icon:iconTap},
        {txt:L('Собирай золотые подковы. 12 подков — «Сивка-Бурка, вещая каурка!»: конь взлетит.','Collect golden horseshoes. 8 of them — “Sivka-Burka, magic steed!”: your horse flies.'),icon:(g2,x,y,s)=>shoe(x,y,s*.42,0,0)},
        {txt:L('Задел плетень или плюхнулся в лужу — минус сила. Скачи 60 секунд!','Hit a fence or splash in a puddle — lose strength. Ride for 60 seconds!'),icon:(g2,x,y,s)=>heart(x,y,s*.36,1)}];
      K.howto(g,W,H,L('Скачки на Сивке-Бурке','Sivka-Burka Race'),rows,isPC,st.howT);}
    if(st.ph==='end'||st.ph==='fall'){g.fillStyle='rgba(20,12,6,'+Math.min(.4,st.t*.4)+')';g.fillRect(0,0,W,H);
      K.banner(g,W,H*.36,st.ph==='fall'?L('Конь упал!','Your horse fell!'):st.fin?L('Финиш!','Finish!'):L('Скачки окончены','Race over'),Math.min(56,W*.12),st.t);
      if(st.t>.5)K.banner(g,W,H*.36+Math.min(60,W*.13),L('Подков: ','Horseshoes: ')+st.score,Math.min(36,W*.08),st.t-.5,['#ffffff','#ffe27a']);}}
  function finish(x){const y=gy+lay.rh*.5,h=hs*1.5;for(const dx of[-hs*.15,hs*.15]){seg(x+dx,y,x+dx,y-h,3,2.5,'#f4ead0');}
    g.fillStyle='#c8261e';for(let i=0;i<6;i++){g.fillStyle=i%2?'#fff':'#c8261e';g.fillRect(x-hs*.15+i*hs*.05,y-h,hs*.05,hs*.12);}
    K.text(g,L('ФИНИШ','FINISH'),x,y-h-hs*.12,Math.min(22,hs*.16),{col:'#ffe27a'});}
  function heart(x,y,r,on){g.save();g.globalAlpha*=on?1:.28;g.translate(x,y);g.beginPath();g.moveTo(0,r*.9);g.bezierCurveTo(-r*1.3,r*.1,-r*1.1,-r*.9,0,-r*.35);g.bezierCurveTo(r*1.1,-r*.9,r*1.3,r*.1,0,r*.9);g.closePath();
    const q=g.createRadialGradient(-r*.3,-r*.4,r*.1,0,0,r*1.2);q.addColorStop(0,'#ff9a8a');q.addColorStop(1,'#c8261e');g.fillStyle=q;g.fill();g.strokeStyle='#5a1008';g.lineWidth=Math.max(1.5,r*.14);g.stroke();
    g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-r*.4,-r*.3,r*.22,r*.12,-.6,0,TAU);g.fill();g.restore();}
  function iconTap(g2,x,y,s){g2.save();g2.fillStyle='#c8392f';g2.beginPath();g2.arc(x,y,s*.18,0,TAU);g2.fill();g2.strokeStyle='#c8392f';g2.lineWidth=2;for(const r of[.3,.45]){g2.beginPath();g2.arc(x,y,s*r,0,TAU);g2.stroke();}g2.restore();}
  function hud(T){const top=8,px=Math.min(22,W*.052),th=46;
    // таймер
    const tw=Math.min(130,W*.3),tx=W/2-tw/2;K.rr(g,tx,top,tw,th,14);g.fillStyle='rgba(253,240,207,.95)';g.fill();g.strokeStyle='#6a3a14';g.lineWidth=2.5;g.stroke();
    const sec=Math.ceil(Math.max(0,st.time));K.text(g,'0:'+(sec<10?'0':'')+sec,W/2,top+th/2+1,px*1.2,{ol:false,col:sec<=10?'#c8261e':'#3a2410'});
    // подковы
    const sw=Math.min(122,W*.29);K.rr(g,10,top,sw,th,14);g.fillStyle='rgba(40,20,10,.62)';g.fill();g.strokeStyle='#e6b53a';g.lineWidth=2;g.stroke();shoe(10+24,top+th/2+2,13,0,0);K.text(g,String(st.score),10+44,top+th/2+1,px*1.15,{al:'left',col:'#ffe27a'});
    // силы
    
    // шкала «вещей каурки»
    const bw=land?Math.min(240,W*.3):Math.min(W*.58,300),bx=10,by=top+th+10,bh=16;
    const hr=Math.min(14,W*.034);for(let i=0;i<3;i++)heart(land?W-74-hr-i*hr*2.5:W-16-hr-i*hr*2.5,land?top+th/2:by+bh/2+2,hr,i<st.hp);K.rr(g,bx,by,bw,bh,8);g.fillStyle='rgba(40,20,10,.55)';g.fill();
    const f=st.magic>0?st.magic/MAGIC_T:st.mag/MAGIC_N;if(f>0){K.rr(g,bx+2,by+2,Math.max(10,(bw-4)*f),bh-4,6);const q=g.createLinearGradient(bx,0,bx+bw,0);q.addColorStop(0,'#ffe27a');q.addColorStop(1,'#ff8a2a');g.fillStyle=q;g.fill();}
    g.strokeStyle=st.magic>0?'#fff3a0':'#e6b53a';g.lineWidth=2;K.rr(g,bx,by,bw,bh,8);g.stroke();K.text(g,st.magic>0?L('Летим!','Flying!'):L('Вещая каурка ','Magic steed ')+st.mag+'/'+MAGIC_N,bx+bw/2,by+bh/2+1,11.5,{col:'#fff6dc',lw:3});
    if(st.hint>0&&st.ph==='run'){g.globalAlpha=Math.min(1,st.hint);const y=land?by+bh+34:gy+lay.rh+(H-gy-lay.rh)*.45,fs=Math.min(17,W*.042);
      if(isPC)K.hintBar(g,W,y,[{k:L('Пробел','Space')},{t:L('или','or')},{k:'↑'},{t:L('— прыжок','— jump')}],fs);
      else K.hintBar(g,W,y,[{t:L('Тапни по экрану — прыжок','Tap the screen to jump')}],fs);g.globalAlpha=1;}}
  K.loop(host,(dt,T)=>{lastDt=dt;if(dt>0)step(dt);draw(T);});
  // автоигра для проверок
  window.__zbdAuto=k=>{k=k==null?.9:k;const seen=new Set();const id=setInterval(()=>{if(!cv.isConnected){clearInterval(id);return;}if(st.ph==='how')begin();if(st.ph!=='run'||st.air>0||st.magic>0)return;
      const A=st.v*JT;for(const ob of C.ob){const dx=ob.x-st.pos;if(dx<0||ob.done)continue;if(dx<A*.5+.1&&!seen.has(ob)){seen.add(ob);if(Math.random()<k)jump();}break;}},30);return id;};
  window.__zbdSt=()=>{const nx=C.ob.find(b=>!b.done&&b.x-st.pos>0);return {ph:st.ph,score:st.score,hp:st.hp,time:+st.time.toFixed(1),pos:+st.pos.toFixed(1),clean:st.clean,magic:+st.magic.toFixed(1),air:st.air>0?1:0,nx:nx?+(nx.x-st.pos).toFixed(2):99,A:+(st.v*JT).toFixed(2)};};
}
/* бот: подковы за 60 с при меткости k (та же трасса из зерна) */
function sim(o,k){const calm=!!o.calm,C=course(o.seed,o.lvl,calm),R=K.rnd((o.seed>>>0)^0x99);let hp=3,score=0,mag=0,t=0,pos=0,magic=0;
  const items=C.ob.map(x=>({o:1,x:x.x,v:x})).concat(C.sh.map(s=>({o:0,x:s.x,v:s}))).sort((a,b)=>a.x-b.x);
  for(const it of items){while(pos<it.x){const v=vAt(t,calm)*(magic>0?1.2:1);t+=.05;pos+=v*.05;if(magic>0)magic-=.05;if(t>=DUR)break;}if(t>=DUR||hp<=0)break;
    if(it.o){if(magic>0){score++;continue;}const pc=Math.max(.2,Math.min(.99,.35+k*.66-Math.min(.12,t/DUR*.15)));if(R()<pc)score++;else{hp--;t+=.9;}}
    else{const p=magic>0?1:it.v.arc?(.45+k*.5):(.8+k*.18);if(R()<p){score++;mag++;if(mag>=MAGIC_N){mag=0;magic=MAGIC_T;}}}}
  return {score,tier:tierOf(score)};}
const REG={id:'skachki',num:8,icon:'zbd_i8',kind:'week',en:true,open:()=>true,run,sim,tiers:TIER};
if(typeof art==='function')art('zbd_i8',48,g=>{g.lineCap='round';g.strokeStyle='#6a3a08';g.lineWidth=9;g.beginPath();g.arc(0,-2,13,Math.PI*.85,Math.PI*2.15);g.stroke();
  const q=g.createLinearGradient(-14,-14,14,14);q.addColorStop(0,'#fff3a0');q.addColorStop(.5,'#f2c03a');q.addColorStop(1,'#c8861a');g.strokeStyle=q;g.lineWidth=6;g.beginPath();g.arc(0,-2,13,Math.PI*.85,Math.PI*2.15);g.stroke();
  g.fillStyle='#8a5a10';for(const a of[1.05,1.3,1.7,1.95]){g.beginPath();g.arc(Math.cos(a*Math.PI)*13,-2+Math.sin(a*Math.PI)*13,1.3,0,TAU);g.fill();}
  for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.5;ln(g,[Math.cos(a)*17,-2+Math.sin(a)*17,Math.cos(a)*21,-2+Math.sin(a)*21],'#ffd24a',2);}});
if(typeof ZAB_REG==='function')ZAB_REG(REG);else(window.__zbdPend=window.__zbdPend||[]).push(REG);
})();
