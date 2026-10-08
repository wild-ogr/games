'use strict';
/* ================= Графика (взята из «Богатыря» и дополнена): гладкие «мультяшные» спрайты (градиенты, мягкий контур, блики) =================
   art(key,size,fn) — регистрирует рисунок; fn рисует в мировых единицах, центр (0,0).
   buildSprites(k) — отрисовывает всё в холсты с плотностью k (= зум × devicePixelRatio), поэтому картинка чёткая. */
const ART={},SPR={};let SPR_K=1;
function art(key,size,fn){ART[key]={size,fn};}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
// перекраска готового рисунка (смена цвета с сохранением объёма)
function artTint(key,base,col){ART[key]={size:ART[base].size,base,tint:col};}
function tintCanvas(c,col){const t=mkCanvas(c.width,c.height),g=t.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='color';g.fillStyle=col;g.fillRect(0,0,t.width,t.height);
  g.globalCompositeOperation='destination-in';g.drawImage(c,0,0);return t;}
/* OB:FIX1 (08.10) рисунок может выходить за свой квадрат size (флажок, орёл, колпак мага, крона дуба, перья Соловья) — раньше это срезалось.
   artBox(key) — настоящие границы рисунка в мировых единицах (меряется один раз, объединение с квадратом); drawArtK — холст по этим границам.
   drawArt(key,px) — квадрат px (для <img> и меню): рисунок целиком, если вылезает — чуть мельче и по центру своих границ. */
function artBox(key){const a=artGet(key);if(!a)return null;if(a.bx)return a.bx;if(a.tint||a.skin)return a.bx=artBox(a.base);
  const z=a.size,h=z/2,K=Math.max(1,Math.min(2,100/z)),N=Math.ceil(z*3*K),c=mkCanvas(N,N),g=c.getContext('2d',{willReadFrequently:true});let x0=-h,y0=-h,x1=h,y1=h;
  try{g.setTransform(K,0,0,K,N/2,N/2);g.lineJoin='round';g.lineCap='round';a.fn(g);const d=new Uint32Array(g.getImageData(0,0,N,N).data.buffer),A=i=>(d[i]>>>24)>6;   // альфа — старший байт (little-endian)
    const row=y=>{for(let x=0,o=y*N;x<N;x++)if(A(o+x))return true;return false;},col=(x,ya,yb)=>{for(let y=ya;y<=yb;y++)if(A(y*N+x))return true;return false;};
    let Y0=0;while(Y0<N&&!row(Y0))Y0++;if(Y0<N){let Y1=N-1;while(Y1>Y0&&!row(Y1))Y1--;let X0=0;while(X0<N-1&&!col(X0,Y0,Y1))X0++;let X1=N-1;while(X1>X0&&!col(X1,Y0,Y1))X1--;
      const m=(v,e)=>Math.abs(v)>h+.5?v+e:0;x0=Math.min(x0,m((X0-N/2)/K,-1));y0=Math.min(y0,m((Y0-N/2)/K,-1));x1=Math.max(x1,m((X1+1-N/2)/K,1));y1=Math.max(y1,m((Y1+1-N/2)/K,1));}}catch(e){}   // вылез больше чем на полъединицы — берём с запасом 1
  return a.bx={x0,y0,w:x1-x0,h:y1-y0};}
function drawArtK(key,k,b){const a=artGet(key);if(a.tint)return tintCanvas(drawArtK(a.base,k,b),a.tint);if(a.skin)return skinCanvas(drawArtK(a.base,k,b),a.skin,k);
  const c=mkCanvas(b.w*k,b.h*k),g=c.getContext('2d');g.setTransform(k,0,0,k,-b.x0*k,-b.y0*k);g.lineJoin='round';g.lineCap='round';a.fn(g);return c;}
function artFit(key){const a=artGet(key),b0=artBox(key),b={x0:b0.x0,y0:b0.y0,w:b0.w,h:Math.min(b0.y0+b0.h,a.size/2)-b0.y0},L=Math.max(b.w,b.h);   // низ не расширяем: портреты (тётка, воевода) нарочно по пояс
  return {x0:b.x0+b.w/2-L/2,y0:b.y0+b.h/2-L/2,w:L,h:L};}
function drawArt(key,px){const b=artFit(key);return drawArtK(key,px/b.w,b);}
// нарисовать спрайт (spr) так, чтобы его квадрат size лёг в квадрат sz с центром (x,y) — вылезающие части видны целиком
function sprPut(g,s,x,y,sz,im){const f=sz/s.s,b=s.b;g.drawImage(im||s.c,x+b.x0*f,y+b.y0*f,b.w*f,b.h*f);}
// то же для рисунка без кэша спрайтов (деревня, ориентиры на карте боя): px на единицу = k
function artPut(g,key,x,y,sz,dpr){const a=artGet(key),b=artBox(key),f=sz/a.size,c=drawArtK(key,f*(dpr||1),b);g.drawImage(c,x+b.x0*f,y+b.y0*f,b.w*f,b.h*f);}
/* спрайты боя рисуются лениво, при первом показе (и заранее — для текущего уровня, sprWarm), плотность k ≤ 2,5.
   Иконки меню (ti_*, hp_*, b_* и др.) в боевой набор не попадают — они идут через iconURL.
   Белая «вспышка попадания» — тоже лениво и только у тех, кто её показывает (нечисть). */
function buildSprites(k){SPR_K=k;for(const key in SPR)delete SPR[key];}
function spr(key){let s=SPR[key];if(s)return s;const a=artGet(key);if(!a)return null;const b=artBox(key);return SPR[key]={c:drawArtK(key,SPR_K,b),f:null,s:a.size,b};}   // OB:FIX1 холст по границам рисунка (b)
function sprFlash(s){if(!s.f){const c=s.c,f=mkCanvas(c.width,c.height),fg=f.getContext('2d');fg.drawImage(c,0,0);fg.globalCompositeOperation='source-atop';fg.fillStyle='rgba(255,255,255,.55)';fg.fillRect(0,0,f.width,f.height);s.f=f;}return s.f;}
function sprWarm(keys){for(const k of keys)spr(k);}
// свечение: один раз нарисованный круг-градиент на цвет вместо createRadialGradient на каждую частицу
const GLOW={};
function glowSpr(col){let c=GLOW[col];if(c)return c;c=mkCanvas(64,64);const g=c.getContext('2d'),q=g.createRadialGradient(32,32,0,32,32,32);
  q.addColorStop(0,rgba(col,1));q.addColorStop(1,rgba(col,0));g.fillStyle=q;g.fillRect(0,0,64,64);return GLOW[col]=c;}
const ICONS={};
/* облик заставы: ключ «рисунок~облик» (t_arch_2~winter, ti_mag_4a~gold) регистрируется при первом обращении */
function artGet(key){const a=ART[key];if(a)return a;const i=key.indexOf('~'),b=i>0?ART[key.slice(0,i)]:null;if(!b)return null;
  return ART[key]={size:b.size,base:key.slice(0,i),skin:key.slice(i+1)};}
function iconURL(key,px){px=px||96;const id=key+'@'+px;if(ICONS[id])return ICONS[id];const a=artGet(key);if(!a)return '';
  return ICONS[id]=drawArt(key,px).toDataURL();}

/* ---------- примитивы ---------- */
function grad(g,x,y,r,col,hl,dk){const gr=g.createRadialGradient(x-r*.32,y-r*.42,r*.05,x,y,r*1.08);
  gr.addColorStop(0,shade(col,hl==null?.42:hl));gr.addColorStop(.55,col);gr.addColorStop(1,shade(col,dk==null?-.38:dk));return gr;}
function outline(g,col,w){g.lineWidth=w;g.strokeStyle=shade(col,-.62);g.stroke();}
function ell(g,x,y,rx,ry,col,o){o=o||{};g.beginPath();g.ellipse(x,y,rx,ry,o.rot||0,0,TAU);
  g.fillStyle=o.flat?col:grad(g,x,y,Math.max(rx,ry),col,o.hl,o.dk);g.fill();
  if(o.ol!==false)outline(g,o.olc||col,o.lw||Math.max(.8,Math.min(rx,ry)*.16));}
function poly(g,p,col,o){o=o||{};g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();fillShape(g,p,col,o);}
function fillShape(g,p,col,o){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(let i=0;i<p.length;i+=2){x0=Math.min(x0,p[i]);x1=Math.max(x1,p[i]);y0=Math.min(y0,p[i+1]);y1=Math.max(y1,p[i+1]);}
  const r=Math.max(x1-x0,y1-y0)/2;g.fillStyle=o.flat?col:grad(g,(x0+x1)/2,(y0+y1)/2,r,col,o.hl,o.dk);g.fill();
  if(o.ol!==false)outline(g,o.olc||col,o.lw||Math.max(.8,r*.1));}
function shp(g,col,o,box,draw){o=o||{};g.beginPath();draw();fillShape(g,box,col,o);}
function shine(g,x,y,rx,ry,a){g.beginPath();g.ellipse(x,y,rx,ry,-.5,0,TAU);g.fillStyle='rgba(255,255,255,'+(a==null?.4:a)+')';g.fill();}
function ln(g,p,col,w){g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.lineWidth=w;g.strokeStyle=col;g.stroke();}
function eye(g,x,y,r,o){o=o||{};g.beginPath();g.ellipse(x,y,r*.82,r,0,0,TAU);g.fillStyle=o.white||'#fff';g.fill();g.lineWidth=r*.22;g.strokeStyle='rgba(20,10,10,.6)';g.stroke();
  const px=x+(o.px==null?r*.22:o.px),py=y+(o.py||0);g.beginPath();g.arc(px,py,r*.52,0,TAU);g.fillStyle=o.col||'#1d1b2a';g.fill();
  g.beginPath();g.arc(px+r*.16,py-r*.24,r*.18,0,TAU);g.fillStyle='#fff';g.fill();
  // злая бровь: наклон к переносице (flipB — для правого глаза)
  if(o.angry){const d=o.flipB?-1:1;g.beginPath();g.moveTo(x-r,y-r*(d>0?1.5:1.05));g.lineTo(x+r,y-r*(d>0?1.05:1.5));
    g.lineWidth=r*.42;g.strokeStyle=o.brow||'#2a1a14';g.stroke();}}
function glow(g,x,y,r,col,core){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,core||'#fff');gr.addColorStop(.25,col);gr.addColorStop(1,rgba(col,0));
  g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
function rrect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function mouth(g,x,y,w,col,smile){g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x,y+(smile?w*.9:-w*.5),x+w,y);g.lineWidth=Math.max(.8,w*.35);g.strokeStyle=col||'#3a1a14';g.stroke();}
function fangs(g,x,y,s){g.fillStyle='#fff';for(const d of[-1,1]){g.beginPath();g.moveTo(x+d*s*1.4-s*.5,y);g.lineTo(x+d*s*1.4+s*.5,y);g.lineTo(x+d*s*1.4,y+s*1.4);g.closePath();g.fill();}}

/* ================= богатыри ================= */
const HERO_ART={
  dob:{body:'#c8392f',cloak:'#7d1b2c',skin:'#f4c9a3',beard:'#3b2819',hat:'helm',helm:'#c2ccd8',rim:'#e6b53a',belt:'#5b3a1e',boots:'#4a2c1c'},
  ale:{body:'#2f9a5e',cloak:'#1f5f8a',skin:'#f6cfaa',beard:null,hair:'#e8b64a',hat:'cap',cap:'#2f7d5e',fur:'#8a5a33',belt:'#6b4020',boots:'#5a3a22'},
  ily:{body:'#8a6a44',cloak:'#34479a',skin:'#eec39c',beard:'#7a6552',long:1,hat:'helm',helm:'#e0b13f',rim:'#b8322e',belt:'#4a2e16',boots:'#3b2416',big:1},
  vas:{body:'#2d6fd6',cloak:null,skin:'#f8d4b4',beard:null,hair:'#c86a2a',braid:1,hat:'kokosh',kok:'#d8313d',belt:'#e6b53a',boots:'#8a2a3a'},
  sad:{body:'#b8322e',cloak:'#6a1a5a',skin:'#f4c9a3',beard:'#c8964a',hat:'boyar',cap:'#c0392b',fur:'#5a3a22',belt:'#e6b53a',boots:'#5a2a1a'},
  mik:{body:'#f0ece0',cloak:null,skin:'#eec39c',beard:'#e8c878',long:1,hat:'felt',cap:'#7a5a3a',belt:'#c0392b',boots:'#8a6a3a',big:1},
  vol:{body:'#4a5a7a',cloak:'#6a7080',skin:'#f0c8a0',beard:'#8a6a4a',hat:'wolf',fur:'#8a93a3',belt:'#3a2a1a',boots:'#3a3040'},
  mar:{body:'#8a1a2a',cloak:'#c0392b',skin:'#f8d4b4',beard:null,hair:'#2a1a14',braid:1,hat:'crownhelm',helm:'#c2ccd8',rim:'#e6b53a',kok:'#e6b53a',belt:'#e6b53a',boots:'#3a2a2a'},
  iva:{body:'#d83a2a',cloak:null,skin:'#f6cfaa',beard:null,hair:'#d8963a',messy:1,freckles:1,belt:'#3a6a2a',boots:'#6a4a2a'}
};
function drawHero(g,h,f){
  if(h.big)g.scale(1.12,1.12);
  const st=f?3.5:-3.5;
  if(h.cloak)shp(g,h.cloak,{},[-16,-6,14,22],()=>{g.moveTo(-9,-4);g.quadraticCurveTo(-18,8,-17,21);g.quadraticCurveTo(-4,24,8,20);g.lineTo(6,-4);g.closePath();});
  if(h.braid){for(let i=0;i<4;i++)ell(g,-9-i*.6,-2+i*5.5,3.6-i*.3,3.3,h.hair);ell(g,-11,20,2.6,1.6,h.kok||'#d33');}
  ell(g,-5+st,22,6,3.6,h.boots);ell(g,5-st,22,6,3.6,h.boots);
  if(h.braid){shp(g,h.body,{},[-15,-2,15,22],()=>{g.moveTo(-7,-1);g.lineTo(7,-1);g.quadraticCurveTo(16,14,14,21);g.quadraticCurveTo(0,25,-14,21);g.quadraticCurveTo(-16,14,-7,-1);});
    ln(g,[-10,17,10,17],'#e6b53a',1.6);for(let i=-8;i<=8;i+=4){g.beginPath();g.arc(i,19.5,1,0,TAU);g.fillStyle='#fff3b8';g.fill();}}
  else{ell(g,0,9,13,12.5,h.body);
    g.save();g.beginPath();g.ellipse(0,9,12,11.5,0,0,TAU);g.clip();g.strokeStyle='rgba(255,255,255,.14)';g.lineWidth=.9;
    for(let y=0;y<22;y+=3.4)for(let x=-14;x<14;x+=3.4){g.beginPath();g.arc(x+(y%6.8?1.7:0),y,1.5,0,Math.PI);g.stroke();}g.restore();
    rrect(g,-12,10,24,4,1.5);g.fillStyle=h.belt;g.fill();rrect(g,-2,9.5,4,5,1);g.fillStyle='#f0c24a';g.fill();}
  ell(g,12,10,4.6,4.6,h.skin);ell(g,-12,11,4.4,4.4,h.skin);
  ell(g,1,-9,12,11.5,h.skin);
  if(h.messy){for(const [x,y,rx,ry] of[[-9,-12,5.5,5],[-4,-17,6,5],[3,-18,6.5,5],[9,-14,4.5,4.2],[-11,-6,3.5,4.5]])ell(g,x,y,rx,ry,h.hair,{hl:.35});
    ln(g,[2,-22,5,-27],'#d8b050',1.2);ln(g,[5,-27,7,-24],'#d8b050',1);}
  else if(h.hair&&!h.braid){shp(g,h.hair,{},[-12,-18,8,-4],()=>{g.moveTo(-11,-6);g.quadraticCurveTo(-13,-16,-2,-17);g.quadraticCurveTo(8,-17,9,-12);g.quadraticCurveTo(0,-13,-4,-8);g.closePath();});}
  if(h.braid){shp(g,h.hair,{},[-12,-18,12,-5],()=>{g.moveTo(-11,-5);g.quadraticCurveTo(-12,-17,1,-17);g.quadraticCurveTo(13,-17,12,-8);g.quadraticCurveTo(4,-14,-3,-12);g.quadraticCurveTo(-7,-10,-11,-5);});}
  g.beginPath();g.ellipse(8,-4,2.6,1.6,0,0,TAU);g.fillStyle='rgba(240,110,110,.45)';g.fill();
  if(h.beard){shp(g,h.beard,{},[-9,-6,13,h.long?14:8],()=>{g.moveTo(-7,-6);g.quadraticCurveTo(-8,h.long?12:5,3,h.long?14:8);g.quadraticCurveTo(13,h.long?9:5,13,-5);
      g.quadraticCurveTo(10,-1,6,-2);g.quadraticCurveTo(3,-4,0,-2);g.quadraticCurveTo(-4,-1,-7,-6);});
    shp(g,h.beard,{},[2,-6,14,-1],()=>{g.moveTo(3,-4);g.quadraticCurveTo(8,-7,13,-3);g.quadraticCurveTo(8,-2,3,-4);});}
  else mouth(g,7,-3,2.4,'#9a3a2a',1);
  eye(g,4,-10,2.6);eye(g,10.5,-10,2.4);
  if(h.freckles){g.fillStyle='rgba(180,90,40,.55)';for(const [x,y] of[[6,-5.5],[8,-4.5],[10.5,-5],[3.5,-4.8]]){g.beginPath();g.arc(x,y,.6,0,TAU);g.fill();}}
  ell(g,12.6,-6.5,1.9,1.6,shade(h.skin,-.08).replace('rgb','rgb'),{ol:false,flat:true});
  if(h.hat==='helm'){shp(g,h.helm,{hl:.6},[-12,-26,14,-11],()=>{g.moveTo(-12,-11);g.bezierCurveTo(-12,-25,14,-25,14,-11);g.closePath();});
    rrect(g,-13,-13,27,3.6,1.6);g.fillStyle=grad(g,0,-12,13,h.rim);g.fill();outline(g,h.rim,.8);
    poly(g,[-1,-22,3,-22,1.2,-31],h.helm,{hl:.6});ell(g,1.2,-31.5,1.4,1.4,h.rim);
    shine(g,-4,-19,4,1.8,.45);}
  if(h.hat==='cap'){shp(g,h.cap,{},[-11,-27,13,-12],()=>{g.moveTo(-11,-12);g.bezierCurveTo(-10,-28,12,-27,13,-12);g.closePath();});
    rrect(g,-13,-15,27,5,2.5);g.fillStyle=grad(g,0,-12,13,h.fur);g.fill();outline(g,h.fur,.8);
    poly(g,[8,-24,14,-33,11,-23],'#e8433a');}
  if(h.hat==='boyar'){shp(g,h.cap,{},[-11,-36,13,-13],()=>{g.moveTo(-10,-14);g.lineTo(-11,-30);g.quadraticCurveTo(1,-38,13,-30);g.lineTo(12,-14);g.closePath();});
    rrect(g,-14,-19,29,7,3.5);g.fillStyle=grad(g,0,-15,15,h.fur,.25,-.35);g.fill();outline(g,h.fur,.8);ell(g,1,-31,2,2,'#e6b53a');shine(g,-5,-27,3,5,.25);}
  if(h.hat==='felt'){ell(g,1,-14,17,4,h.cap);shp(g,h.cap,{},[-10,-28,12,-13],()=>{g.moveTo(-10,-14);g.bezierCurveTo(-10,-30,12,-30,12,-14);g.closePath();});rrect(g,-10,-17,22,3,1.2);g.fillStyle='#c0392b';g.fill();shine(g,-4,-23,4,2,.25);}
  if(h.hat==='wolf'){shp(g,h.fur,{},[-15,-26,14,4],()=>{g.moveTo(-14,4);g.quadraticCurveTo(-18,-14,-8,-22);g.quadraticCurveTo(2,-28,10,-22);g.quadraticCurveTo(15,-18,14,-12);g.quadraticCurveTo(4,-17,-3,-13);g.quadraticCurveTo(-9,-6,-10,4);g.closePath();});
    poly(g,[-8,-20,-10,-31,-2,-23],h.fur);poly(g,[3,-23,8,-33,10,-21],h.fur);poly(g,[-7,-21,-8.5,-27,-4,-22],'#e9a8a8',{ol:false});
    ell(g,12,-15,5,3.2,'#a0a8b6');ell(g,16.5,-15.5,1.4,1.2,'#222',{ol:false,flat:true});
    eye(g,5,-19,1.5,{col:'#d9901b',px:.3});}
  if(h.hat==='crownhelm'){shp(g,h.helm,{hl:.6},[-12,-26,14,-11],()=>{g.moveTo(-12,-11);g.bezierCurveTo(-12,-25,14,-25,14,-11);g.closePath();});
    poly(g,[-12,-12,-12,-19,-8,-15,-4,-22,0,-16,4,-24,8,-16,11,-21,14,-12],h.rim,{hl:.6});for(const x of[-4,4]){g.beginPath();g.arc(x,-17,1.3,0,TAU);g.fillStyle='#e0336a';g.fill();}}
  if(h.hat==='kokosh'){shp(g,h.kok,{},[-13,-31,15,-12],()=>{g.moveTo(-13,-12);g.bezierCurveTo(-14,-34,16,-34,15,-12);g.closePath();});
    g.strokeStyle='#f3c647';g.lineWidth=1.4;g.beginPath();g.moveTo(-10,-14);g.bezierCurveTo(-10,-29,12,-29,12,-14);g.stroke();
    for(const [x,y] of[[1,-25],[-5,-21],[7,-21],[-8,-15],[10,-15],[1,-18]]){g.beginPath();g.arc(x,y,1.3,0,TAU);g.fillStyle='#fffbe8';g.fill();}
    shine(g,-5,-26,4,2,.35);}
}
for(const id in HERO_ART)art('hp_'+id,66,g=>{g.translate(0,3);drawHero(g,HERO_ART[id],0);});

/* ================= нечисть ================= */
art('muh',38,g=>{ell(g,0,7,7.5,8.5,'#f4ead2');eye(g,-3,6,2.1,{angry:1,px:0});eye(g,3,6,2.1,{angry:1,flipB:1,px:0});mouth(g,0,11,2,'#6a2a1a');
  shp(g,'#e5382f',{},[-16,-16,16,2],()=>{g.moveTo(-16,1);g.bezierCurveTo(-16,-17,16,-17,16,1);g.quadraticCurveTo(0,5,-16,1);});
  for(const [x,y,r] of[[-7,-6,2.5],[2,-10,2.9],[9,-4,2.1],[-1,-3,1.7],[-11,-1,1.5]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle='#fff6e8';g.fill();}
  shine(g,-7,-10,4.5,2,.35);});
art('wolf',44,g=>{poly(g,[-12,0,-22,-8,-18,3],'#7d8594');
  ell(g,-9,10,2.6,4.2,'#5d6470');ell(g,5,10,2.6,4.2,'#5d6470');
  ell(g,-2,2,14,8.5,'#8a93a3');ell(g,-2,6,9,3.5,'#cfd4de',{ol:false});
  ell(g,-5,11,2.6,4.2,'#6b7280');ell(g,9,11,2.6,4.2,'#6b7280');
  poly(g,[6,-11,8,-21,13,-11],'#7d8594');poly(g,[11,-11,17,-20,17,-8],'#7d8594');poly(g,[12,-12,15.5,-17,15.5,-10],'#e9a8a8',{ol:false});
  ell(g,11,-5,8.5,7.5,'#8a93a3');ell(g,18,-2,5.5,3.8,'#cfd4de');ell(g,22.5,-3.5,1.8,1.5,'#222',{ol:false,flat:true});
  eye(g,12,-8,2.2,{col:'#d9901b',angry:1,flipB:1});fangs(g,19,1.5,.9);shine(g,-6,-2,6,2.6,.25);});
art('lesh',56,g=>{ln(g,[-9,2,-19,-6,-24,-4],'#5a3a22',3.2);ln(g,[-19,-6,-21,-12],'#5a3a22',2);ln(g,[9,2,19,-8,24,-13],'#5a3a22',3.2);ln(g,[19,-8,24,-5],'#5a3a22',2);
  ell(g,-5,21,5,3,'#4a3020');ell(g,5,21,5,3,'#4a3020');
  ell(g,0,6,12.5,15,'#7a5230');
  g.strokeStyle='rgba(40,20,10,.45)';g.lineWidth=1.1;for(const x of[-6,-1,5]){g.beginPath();g.moveTo(x,-4);g.quadraticCurveTo(x+2,6,x-1,17);g.stroke();}
  ell(g,-9,-13,9.5,8,'#3d8a3a');ell(g,9,-13,9.5,8,'#3d8a3a');ell(g,0,-19,12,9,'#4f9e44');shine(g,-4,-22,5,2.4,.3);
  poly(g,[-8,5,8,5,5,19,1,14,-2,19,-5,14],'#78b04e');
  glow(g,-4.5,-2,5,'#ffe66b');glow(g,4.5,-2,5,'#ffe66b');eye(g,-4.5,-2,2.2,{col:'#6a4a00',white:'#fff4a8',px:0});eye(g,4.5,-2,2.2,{col:'#6a4a00',white:'#fff4a8',px:0});});
art('bat',36,g=>{for(const s of[1,-1])shp(g,'#5b3b7a',{},[0,-14,s*17,4],()=>{g.moveTo(0,0);g.quadraticCurveTo(s*10,-14,s*17,-7);g.quadraticCurveTo(s*14,-3,s*16,2);
    g.quadraticCurveTo(s*11,0,s*10,4);g.quadraticCurveTo(s*6,1,0,4);g.closePath();});
  poly(g,[-5,-5,-4,-12,-1,-6],'#6d4a8e');poly(g,[5,-5,4,-12,1,-6],'#6d4a8e');
  ell(g,0,1,6.5,7,'#6d4a8e');eye(g,-2.4,-1,1.8,{col:'#d0203a',px:0});eye(g,2.4,-1,1.8,{col:'#d0203a',px:0});fangs(g,0,3,.8);});
art('kik',42,g=>{ell(g,-4,17,4,2.6,'#3e5a2a');ell(g,4,17,4,2.6,'#3e5a2a');
  ell(g,0,5,12,12,'#7cae5a');
  shp(g,'#2f5a33',{},[-15,-16,15,14],()=>{g.moveTo(-13,12);g.quadraticCurveTo(-17,-6,-8,-13);g.quadraticCurveTo(0,-19,8,-13);g.quadraticCurveTo(17,-6,13,12);
    g.quadraticCurveTo(10,2,8,-4);g.quadraticCurveTo(0,-8,-8,-4);g.quadraticCurveTo(-10,2,-13,12);});
  eye(g,-4,0,3,{col:'#c79a13'});eye(g,4,0,3,{col:'#c79a13'});ell(g,0,4,2,3.4,'#6a9a4a');
  g.beginPath();g.moveTo(-4,9);g.quadraticCurveTo(0,12,4,9);g.lineWidth=1.2;g.strokeStyle='#2a3a1a';g.stroke();
  ell(g,6,-12,3,2,'#e0e36a');});
art('piy',28,g=>{ell(g,-7,1,5,4,'#6a2f3f');ell(g,-1,0,5.5,4.6,'#7a3a4a');ell(g,5.5,-1,5,4.4,'#8a4454');
  g.beginPath();g.arc(9,-1,2,0,TAU);g.fillStyle='#3a1020';g.fill();eye(g,5,-4,1.6,{px:.8});shine(g,-2,-2,3,1.2,.3);});
art('vod',60,g=>{ell(g,-10,22,6,3.5,'#2f7a70');ell(g,10,22,6,3.5,'#2f7a70');
  ell(g,0,6,19,17,'#3f9a8f');ell(g,0,11,12,10,'#a9e0cf',{ol:false});
  ell(g,-8,-11,6,6,'#3f9a8f');ell(g,8,-11,6,6,'#3f9a8f');eye(g,-8,-11,3.6,{px:0,angry:1});eye(g,8,-11,3.6,{px:0,angry:1,flipB:1});
  g.beginPath();g.moveTo(-11,1);g.quadraticCurveTo(0,8,11,1);g.lineWidth=2;g.strokeStyle='#153a36';g.stroke();
  g.strokeStyle='#4f8a2a';g.lineWidth=1.8;for(const x of[-7,-3,1,5,8]){g.beginPath();g.moveTo(x,4);g.quadraticCurveTo(x+3,12,x-1,18);g.stroke();}
  poly(g,[-6,-17,-3,-24,0,-18,3,-25,6,-17],'#e6c43a');shine(g,-10,-2,6,3,.3);});
art('ogon',32,g=>{glow(g,0,0,15,'#6fe3ff','#ffffff');ell(g,0,0,6,6,'#bff4ff',{ol:false});eye(g,-2,-.5,1.4,{px:0,col:'#1a4a6a'});eye(g,2,-.5,1.4,{px:0,col:'#1a4a6a'});});
art('voron',36,g=>{ell(g,-2,2,10,7,'#2a2838');shp(g,'#1e1c2c',{},[-12,-8,8,4],()=>{g.moveTo(-8,0);g.quadraticCurveTo(-4,-10,8,-4);g.quadraticCurveTo(2,2,-8,0);});
  poly(g,[-11,2,-18,-2,-17,5],'#1e1c2c');ell(g,8,-4,6,5.5,'#2a2838');poly(g,[13,-6,20,-3,13,-1],'#f0a020');
  eye(g,9,-6,1.9,{col:'#d0203a',angry:1,flipB:1});ln(g,[-4,9,-5,13],'#f0a020',1.2);ln(g,[1,9,1,13],'#f0a020',1.2);});
art('skel',42,g=>{ln(g,[-4,10,-5,19],'#e8e0cc',2.6);ln(g,[4,10,5,19],'#e8e0cc',2.6);
  ell(g,0,6,8,8,'#3a3342',{ol:false,flat:true});
  g.strokeStyle='#efe8d6';g.lineWidth=1.8;for(let y=1;y<=10;y+=3){g.beginPath();g.moveTo(-7,y);g.quadraticCurveTo(0,y+2,7,y);g.stroke();}ln(g,[0,0,0,12],'#efe8d6',1.8);
  ln(g,[-8,1,-13,8],'#e8e0cc',2.2);ln(g,[8,1,13,6],'#e8e0cc',2.2);ln(g,[13,6,16,-4],'#9aa3b0',1.6);
  ell(g,0,-8,9.5,9,'#f1ebdc');rrect(g,-5,-2,10,5,2);g.fillStyle='#f1ebdc';g.fill();outline(g,'#f1ebdc',.8);
  for(const x of[-2.5,0,2.5])ln(g,[x,-1,x,3],'rgba(60,50,40,.6)',.7);
  ell(g,-3.5,-9,2.8,3.2,'#1a1420',{ol:false,flat:true});ell(g,3.5,-9,2.8,3.2,'#1a1420',{ol:false,flat:true});
  glow(g,-3.5,-9,3,'#ff4a3a');glow(g,3.5,-9,3,'#ff4a3a');shine(g,-3,-14,4,1.6,.4);});
art('upyr',42,g=>{shp(g,'#5a1a36',{},[-14,-6,14,20],()=>{g.moveTo(-6,-6);g.lineTo(6,-6);g.lineTo(15,19);g.quadraticCurveTo(0,23,-15,19);g.closePath();});
  poly(g,[-6,-6,-13,-15,-9,-3],'#8a1f3a');poly(g,[6,-6,13,-15,9,-3],'#8a1f3a');
  ell(g,0,-6,9,9.5,'#b9cbb4');shp(g,'#2a1a2a',{},[-9,-16,9,-8],()=>{g.moveTo(-9,-8);g.quadraticCurveTo(-8,-17,0,-16);g.quadraticCurveTo(8,-17,9,-8);g.quadraticCurveTo(0,-13,0,-9);g.quadraticCurveTo(-3,-12,-9,-8);});
  glow(g,-3.5,-7,4,'#ff3a4a');glow(g,3.5,-7,4,'#ff3a4a');eye(g,-3.5,-7,2,{col:'#b01020',px:0,angry:1});eye(g,3.5,-7,2,{col:'#b01020',px:0,angry:1,flipB:1});
  mouth(g,0,-1,3,'#4a1020',0);fangs(g,0,-1.4,.9);});
art('idol',66,g=>{ln(g,[18,4,26,-16],'#6a4222',4);ell(g,27,-19,7,7,'#6a4222');
  ell(g,-9,26,7,4,'#4a2c1a');ell(g,9,26,7,4,'#4a2c1a');
  ell(g,0,8,22,20,'#8d5a3a');ell(g,0,13,13,11,'#c08a5e',{ol:false});
  ell(g,-19,4,6,6,'#8d5a3a');ell(g,19,4,6,6,'#8d5a3a');
  poly(g,[-9,-19,-15,-30,-5,-22],'#e8dcc0');poly(g,[9,-19,15,-30,5,-22],'#e8dcc0');
  ell(g,0,-14,11,9,'#8d5a3a');eye(g,-4,-15,2.6,{col:'#b32a12',angry:1});eye(g,4,-15,2.6,{col:'#b32a12',angry:1,flipB:1});
  mouth(g,0,-8,5,'#3a1a0a',0);poly(g,[-5,-8,-3,-12,-2,-8],'#fff');poly(g,[5,-8,3,-12,2,-8],'#fff');shine(g,-9,-2,8,3,.2);});
art('prizr',42,g=>{g.globalAlpha=.88;shp(g,'#dfe9ff',{hl:.6,olc:'#8aa0d8'},[-13,-17,13,17],()=>{g.moveTo(-13,14);g.bezierCurveTo(-15,-20,15,-20,13,14);
    g.quadraticCurveTo(10,10,8,16);g.quadraticCurveTo(5,11,2,17);g.quadraticCurveTo(-1,11,-4,17);g.quadraticCurveTo(-7,11,-9,16);g.quadraticCurveTo(-11,11,-13,14);});
  g.globalAlpha=1;ell(g,-4,-4,2.6,3.6,'#23264a',{ol:false,flat:true});ell(g,4,-4,2.6,3.6,'#23264a',{ol:false,flat:true});ell(g,0,4,2.4,3,'#23264a',{ol:false,flat:true});
  shine(g,-6,-11,4,2,.5);});
art('rycar',56,g=>{ell(g,-6,22,6,3.5,'#2a2b3e');ell(g,6,22,6,3.5,'#2a2b3e');
  ell(g,0,7,15,15,'#4b4e6d');ell(g,-14,-1,7,6,'#5b5f82');ell(g,14,-1,7,6,'#5b5f82');
  ln(g,[16,0,24,-18],'#9aa3b0',2.4);poly(g,[21,-14,27,-24,26,-12],'#c9d1dc');
  ell(g,0,-10,10,10,'#5b5f82');poly(g,[-8,-14,-17,-24,-10,-10],'#d8d0bc');poly(g,[8,-14,17,-24,10,-10],'#d8d0bc');
  rrect(g,-7,-11,14,3,1.4);g.fillStyle='#16131e';g.fill();glow(g,-3.5,-9.5,4,'#ff3a3a');glow(g,3.5,-9.5,4,'#ff3a3a');
  shine(g,-6,1,6,2.6,.25);});
art('koldun',44,g=>{ln(g,[12,-18,14,20],'#5a3a22',2.2);glow(g,12,-20,8,'#c77bff');ell(g,12,-20,3,3,'#e8c8ff',{ol:false});
  shp(g,'#4a2a7a',{},[-14,-14,14,21],()=>{g.moveTo(0,-14);g.quadraticCurveTo(10,-12,14,20);g.quadraticCurveTo(0,23,-14,20);g.quadraticCurveTo(-10,-12,0,-14);});
  ell(g,0,-6,7,7,'#161025',{ol:false,flat:true});glow(g,-2.5,-6,3.5,'#b86bff');glow(g,2.5,-6,3.5,'#b86bff');
  ln(g,[-9,8,9,8],'#e6b53a',1.4);});
art('kot',30,g=>{ln(g,[-6,4,-13,-2,-12,-8],'#1c1a24',2.6);ell(g,-1,5,8,5.5,'#26232f');ell(g,-5,9,2,2.6,'#1c1a24');ell(g,4,9,2,2.6,'#1c1a24');
  poly(g,[3,-8,4,-14,8,-9],'#26232f');poly(g,[9,-9,12,-14,12,-7],'#26232f');ell(g,7,-4,6.5,5.5,'#26232f');
  eye(g,5,-5,1.9,{white:'#ffe14a',col:'#101010',px:0});eye(g,9.5,-5,1.7,{white:'#ffe14a',col:'#101010',px:0});});

/* ================= боссы ================= */
art('solo',104,g=>{ // Соловей-Разбойник
  ell(g,-12,42,9,5,'#3a2416');ell(g,12,42,9,5,'#3a2416');
  ell(g,0,16,30,27,'#8a5a2e');ell(g,0,22,20,16,'#b98a52',{ol:false});rrect(g,-29,20,58,6,3);g.fillStyle='#3a2416';g.fill();
  ell(g,-30,12,9,9,'#8a5a2e');ell(g,30,8,9,9,'#8a5a2e');ln(g,[34,6,46,-16],'#5a3a22',5);ell(g,47,-19,7,6,'#5a3a22');
  ell(g,0,-18,19,17,'#e9bb90');
  shp(g,'#231710',{},[-20,-18,20,12],()=>{g.moveTo(-17,-14);g.quadraticCurveTo(-22,8,0,12);g.quadraticCurveTo(22,8,17,-14);g.quadraticCurveTo(10,-6,0,-8);g.quadraticCurveTo(-10,-6,-17,-14);});
  ell(g,-9,-12,5,4,'#f0a0a0',{ol:false});ell(g,9,-12,5,4,'#f0a0a0',{ol:false});
  ell(g,0,-8,4.5,4.5,'#c0392b');ell(g,0,-8,2,2.4,'#3a0a0a',{ol:false,flat:true});
  eye(g,-6,-21,3.6,{angry:1,px:0});eye(g,6,-21,3.6,{angry:1,flipB:1,px:0});
  shp(g,'#3a2a5a',{},[-22,-46,22,-28],()=>{g.moveTo(-22,-28);g.quadraticCurveTo(-18,-46,2,-45);g.quadraticCurveTo(22,-44,22,-28);g.closePath();});
  for(const [x,c] of[[-6,'#e8433a'],[2,'#f5b83a'],[10,'#3ab0e8']])shp(g,c,{},[x-4,-66,x+8,-40],()=>{g.moveTo(x,-42);g.quadraticCurveTo(x-4,-58,x+6,-66);g.quadraticCurveTo(x+8,-52,x+3,-42);g.closePath();});
  shine(g,-8,-28,7,3,.35);});
art('yaga',116,g=>{ // Баба-Яга в ступе
  ln(g,[26,-40,38,48],'#6a4a2a',4);shp(g,'#d8b85a',{},[28,34,50,58],()=>{g.moveTo(33,36);g.lineTo(44,38);g.lineTo(52,58);g.lineTo(28,56);g.closePath();});
  ell(g,0,-8,22,19,'#b8322e');for(const [x,y] of[[-10,-12],[6,-16],[12,-2],[-4,0],[-15,2]]){g.beginPath();g.arc(x,y,2.4,0,TAU);g.fillStyle='#ffe9c8';g.fill();}
  ell(g,24,-6,6,6,'#d9c8a0');
  shp(g,'#c9d0c0',{},[-20,-50,20,-26],()=>{g.moveTo(-18,-28);g.quadraticCurveTo(-24,-48,-2,-50);g.quadraticCurveTo(20,-50,18,-30);g.closePath();});
  ell(g,0,-32,14,13,'#cfd8b0');poly(g,[6,-34,22,-24,8,-26],'#bcc89a');
  eye(g,-5,-37,3,{col:'#3a7a1a',angry:1});eye(g,4,-37,2.8,{col:'#3a7a1a',angry:1,flipB:1});
  g.beginPath();g.moveTo(-6,-26);g.quadraticCurveTo(0,-22,6,-26);g.lineWidth=1.6;g.strokeStyle='#3a1a14';g.stroke();poly(g,[-1,-25,1,-25,0,-21],'#fff6c8',{ol:false});
  shp(g,'#a0341e',{},[-22,-58,22,-38],()=>{g.moveTo(-20,-38);g.quadraticCurveTo(-18,-56,0,-58);g.quadraticCurveTo(18,-56,20,-38);g.quadraticCurveTo(0,-46,-20,-38);});
  // ступа
  shp(g,'#8b5a2b',{},[-30,4,30,54],()=>{g.moveTo(-28,6);g.lineTo(28,6);g.lineTo(22,52);g.quadraticCurveTo(0,57,-22,52);g.closePath();});
  ell(g,0,6,28,7,'#a8733d');ell(g,0,6,22,4.5,'#4a2c14',{ol:false});
  for(const y of[20,38]){rrect(g,-27+y*.1,y,54-y*.2,4,2);g.fillStyle='#5a3a1a';g.fill();}
  shine(g,-14,18,5,10,.18);});
art('gory',148,g=>{ // Змей Горыныч
  ln(g,[-30,30,-58,44,-66,30],'#2f7a3a',9);poly(g,[-66,30,-74,22,-62,24],'#e8433a');
  for(const s of[1,-1])shp(g,'#2a6a35',{},[s*10,-50,s*62,18],()=>{g.moveTo(s*10,0);g.quadraticCurveTo(s*40,-50,s*62,-36);g.quadraticCurveTo(s*52,-22,s*58,-8);
    g.quadraticCurveTo(s*44,-12,s*44,4);g.quadraticCurveTo(s*30,-6,s*14,14);g.closePath();});
  ell(g,-14,40,10,6,'#27603a');ell(g,14,40,10,6,'#27603a');
  ell(g,0,18,32,26,'#3f9a4a');ell(g,0,24,20,17,'#c8e89a',{ol:false});
  for(let y=12;y<38;y+=6)ln(g,[-14+Math.abs(y-24)*.3,y,14-Math.abs(y-24)*.3,y],'rgba(90,130,50,.5)',1.2);
  const head=(x,y,a)=>{ln(g,[x*.25,-2,x*.7,y+12,x,y+4],'#3f9a4a',11);ln(g,[x*.25,-2,x*.7,y+12,x,y+4],'#57b862',6);
    ell(g,x,y,13,11,'#46a652');ell(g,x+(a*9),y+5,8,6,'#57b862');ell(g,x+a*13,y+3,1.4,1.4,'#1a3a1a',{ol:false,flat:true});
    poly(g,[x-7,y-8,x-10,y-18,x-3,y-10],'#e6c43a');poly(g,[x+3,y-10,x+8,y-19,x+8,y-8],'#e6c43a');
    eye(g,x-3,y-3,3,{col:'#d0301a',angry:1,px:a});eye(g,x+4,y-3,3,{col:'#d0301a',angry:1,flipB:1,px:a});
    mouth(g,x+a*6,y+7,4,'#3a0a0a',0);};
  head(-34,-44,-1);head(34,-44,1);head(0,-58,0);shine(g,-12,6,9,4,.25);});
art('kosh',108,g=>{ // Кощей
  ln(g,[30,-44,34,50],'#3a2a1a',3.4);glow(g,30,-48,14,'#5cff9a');ell(g,30,-48,5,5,'#c8ffe0',{ol:false});
  shp(g,'#2a1f3d',{},[-30,-24,30,52],()=>{g.moveTo(-10,-24);g.lineTo(10,-24);g.quadraticCurveTo(30,20,30,50);g.quadraticCurveTo(0,56,-30,50);g.quadraticCurveTo(-30,20,-10,-24);});
  ln(g,[-26,46,26,46],'#e6b53a',2.6);ln(g,[0,-20,0,50],'#e6b53a',2);
  shp(g,'#3b2c55',{},[-26,-30,26,-6],()=>{g.moveTo(-24,-8);g.quadraticCurveTo(-26,-30,0,-30);g.quadraticCurveTo(26,-30,24,-8);g.quadraticCurveTo(0,-18,-24,-8);});
  ln(g,[-20,-6,-30,16,-24,24],'#d8d2c0',3);ln(g,[20,-6,28,-20],'#d8d2c0',3);
  shp(g,'#b8b2a0',{},[-8,-26,8,6],()=>{g.moveTo(-6,-26);g.quadraticCurveTo(-8,-6,0,6);g.quadraticCurveTo(8,-6,6,-26);g.closePath();});
  ell(g,0,-36,12,14,'#e2dccb');ell(g,-4.5,-38,3.6,4,'#101010',{ol:false,flat:true});ell(g,4.5,-38,3.6,4,'#101010',{ol:false,flat:true});
  glow(g,-4.5,-38,5,'#5cff9a');glow(g,4.5,-38,5,'#5cff9a');ln(g,[-5,-27,5,-27],'#3a3020',1.4);for(const x of[-3,0,3])ln(g,[x,-29,x,-25],'#3a3020',.9);
  poly(g,[-12,-46,-14,-62,-6,-52,0,-66,6,-52,14,-62,12,-46],'#e6b53a',{hl:.6});for(const x of[-7,0,7]){g.beginPath();g.arc(x,-49,1.6,0,TAU);g.fillStyle='#48e08a';g.fill();}});
art('egg',38,g=>{glow(g,0,2,19,'#ffd84a');ell(g,0,2,10,13,'#f2c04a',{hl:.6});g.strokeStyle='#a8741a';g.lineWidth=1.2;
  g.beginPath();g.moveTo(-9,0);for(let x=-9;x<=9;x+=3)g.lineTo(x,x%6?3:-1);g.stroke();ln(g,[6,-12,-5,14],'#e8f4ff',1.3);shine(g,-4,-5,3,5,.5);});

/* ================= подбираемое, снаряды ================= */
function gem(g,s,col){poly(g,[0,-s,s*.8,-s*.2,s*.5,s,-s*.5,s,-s*.8,-s*.2],col,{hl:.7,dk:-.3});g.beginPath();g.moveTo(-s*.8,-s*.2);g.lineTo(0,s*.1);g.lineTo(s*.8,-s*.2);g.moveTo(0,s*.1);g.lineTo(0,s);
  g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=s*.12;g.stroke();shine(g,-s*.25,-s*.45,s*.25,s*.12,.7);}
art('gem1',16,g=>{glow(g,0,0,8,'#5ac8ff');gem(g,4.6,'#3aa8f0');});
art('gem2',18,g=>{glow(g,0,0,9,'#6aff8a');gem(g,5.4,'#2fcf6a');});
art('gem3',24,g=>{glow(g,0,0,12,'#ff6ad0');gem(g,7.2,'#e0368a');});
art('coin',18,g=>{ell(g,0,0,6.5,6.5,'#f5c33a',{hl:.6});ell(g,0,0,4,4,'#e0a620',{ol:false});ln(g,[0,-2.4,0,2.4],'#fff0a8',1.2);shine(g,-2,-2.5,2,1,.6);});
art('pie',26,g=>{shp(g,'#d8903a',{hl:.5},[-10,-7,10,6],()=>{g.moveTo(-10,5);g.quadraticCurveTo(-10,-8,0,-8);g.quadraticCurveTo(10,-8,10,5);g.quadraticCurveTo(0,7,-10,5);});
  g.strokeStyle='rgba(110,50,10,.6)';g.lineWidth=1;for(const x of[-5,0,5]){g.beginPath();g.moveTo(x-1.5,-5);g.lineTo(x+1.5,2);g.stroke();}shine(g,-4,-5,3,1.4,.5);});
art('chest',38,g=>{glow(g,0,0,19,'#ffd84a');rrect(g,-13,-4,26,15,2.5);g.fillStyle=grad(g,0,3,14,'#9a5a2a');g.fill();outline(g,'#9a5a2a',1.4);
  shp(g,'#b06a34',{},[-13,-13,13,-3],()=>{g.moveTo(-13,-3);g.quadraticCurveTo(-13,-13,0,-13);g.quadraticCurveTo(13,-13,13,-3);g.closePath();});
  for(const x of[-8,8]){rrect(g,x-2,-13,4,24,1);g.fillStyle='#e6b53a';g.fill();}rrect(g,-3,-5,6,6,1.5);g.fillStyle='#f5d05a';g.fill();outline(g,'#e6b53a',.8);});
art('yarn',24,g=>{ell(g,0,0,8,8,'#e0453a');g.strokeStyle='rgba(255,220,210,.7)';g.lineWidth=1;for(const a of[-.6,0,.6]){g.beginPath();g.ellipse(0,0,7,3.5,a,0,TAU);g.stroke();}
  ln(g,[5,5,10,9,8,11],'#e0453a',1.4);shine(g,-3,-3,2.5,1.2,.5);});
art('bird',44,g=>{ // Жар-птица (дар за рекламу)
  glow(g,0,0,22,'#ffb03a');for(const s of[1,-1])shp(g,'#ff7a1a',{hl:.6},[0,-16,s*20,4],()=>{g.moveTo(0,0);g.quadraticCurveTo(s*10,-18,s*20,-12);g.quadraticCurveTo(s*12,-4,s*16,2);g.quadraticCurveTo(s*6,0,0,4);});
  shp(g,'#ffcf3a',{},[-18,0,-4,18],()=>{g.moveTo(-4,4);g.quadraticCurveTo(-14,8,-18,18);g.quadraticCurveTo(-8,14,-6,8);g.closePath();});
  ell(g,0,2,6,7,'#ffb52a',{hl:.7});ell(g,3,-6,4.5,4,'#ffb52a',{hl:.7});poly(g,[7,-7,11,-5,7,-4],'#e05a1a');eye(g,4,-7,1.4,{px:.5});
  poly(g,[1,-10,0,-16,4,-11],'#ff5a2a');});
art('arrow',34,g=>{ln(g,[-14,0,10,0],'#8a5a2e',1.8);poly(g,[10,-3.2,17,0,10,3.2],'#d8e0ea',{hl:.7});
  poly(g,[-15,0,-11,-4,-8,-4,-11,0],'#e8433a',{ol:false,flat:true});poly(g,[-15,0,-11,4,-8,4,-11,0],'#c0302a',{ol:false,flat:true});});
art('mace',34,g=>{for(let i=0;i<8;i++){const a=i/8*TAU;poly(g,[Math.cos(a-.28)*8,Math.sin(a-.28)*8,Math.cos(a)*14,Math.sin(a)*14,Math.cos(a+.28)*8,Math.sin(a+.28)*8],'#aab4c2',{lw:.7});}
  ell(g,0,0,9,9,'#8e98a8',{hl:.6});shine(g,-3,-3.5,3.4,1.6,.6);});
art('axe',38,g=>{ln(g,[0,15,0,-12],'#7a4a22',3);shp(g,'#c2ccd8',{hl:.7},[0,-15,15,4],()=>{g.moveTo(0,-12);g.quadraticCurveTo(12,-16,15,-6);g.quadraticCurveTo(16,2,13,4);g.quadraticCurveTo(6,-2,0,-2);g.closePath();});
  ln(g,[13,4,15,-6,12,-14],'#f4f8ff',1);});
art('kolo',34,g=>{ell(g,0,0,12,12,'#f2b43a',{hl:.55});shine(g,-5,-6,5,2.6,.5);eye(g,-3.5,-2,2.4,{px:.8});eye(g,4,-2,2.4,{px:.8});
  g.beginPath();g.arc(1,3,4.5,.2,Math.PI-.2);g.lineWidth=1.4;g.strokeStyle='#7a3a12';g.stroke();ell(g,-7,3,2.2,1.4,'#f07a5a',{ol:false,flat:true});ell(g,8,3,2.2,1.4,'#f07a5a',{ol:false,flat:true});});
art('flask',24,g=>{ell(g,0,3,7,7,'#8a3adf',{hl:.6});rrect(g,-2.5,-9,5,6,1);g.fillStyle='#b8a0d8';g.fill();rrect(g,-3,-11,6,3,1);g.fillStyle='#8a5a2e';g.fill();shine(g,-2.5,1,2,3,.5);});
art('flaskB',24,g=>{ell(g,0,3,7,7,'#2f9aef',{hl:.6});rrect(g,-2.5,-9,5,6,1);g.fillStyle='#a8d0ea';g.fill();rrect(g,-3,-11,6,3,1);g.fillStyle='#8a5a2e';g.fill();shine(g,-2.5,1,2,3,.5);});

/* ================= декор (по главам) ================= */
art('d_pine',96,g=>{ell(g,6,10,26,12,'rgba(0,0,0,.18)',{ol:false,flat:true});
  for(const [y,r,c] of[[10,30,'#2f7a4a'],[-2,24,'#378a52'],[-12,17,'#43a05e'],[-20,10,'#52b06a']])ell(g,0,y,r,r*.8,c);shine(g,-8,-20,6,3,.3);});
art('d_oak',104,g=>{ell(g,8,14,30,14,'rgba(0,0,0,.18)',{ol:false,flat:true});
  for(const [x,y,r] of[[-16,4,18],[16,2,19],[0,-12,22],[-6,10,18],[10,12,17]])ell(g,x,y,r,r*.9,'#4a9a3e');ell(g,-4,-6,14,10,'#63b552',{ol:false});shine(g,-10,-18,8,4,.28);});
art('d_bush',46,g=>{ell(g,3,8,16,6,'rgba(0,0,0,.16)',{ol:false,flat:true});ell(g,-7,2,9,8,'#4a9e42');ell(g,7,2,9,8,'#4a9e42');ell(g,0,-4,10,9,'#58b04e');
  for(const [x,y] of[[-5,-2],[4,-6],[8,3]]){g.beginPath();g.arc(x,y,1.6,0,TAU);g.fillStyle='#e8433a';g.fill();}});
art('d_stump',36,g=>{ell(g,2,6,13,6,'rgba(0,0,0,.16)',{ol:false,flat:true});ell(g,0,2,11,9,'#7a5230');ell(g,0,-1,9,6,'#d8b27a');g.strokeStyle='rgba(120,70,30,.6)';g.lineWidth=.8;g.beginPath();g.ellipse(0,-1,5,3.2,0,0,TAU);g.stroke();});
art('d_shroom',28,g=>{for(const [x,y,s] of[[-5,2,1],[5,4,.8]]){ell(g,x,y+3,2.2*s,4*s,'#f4ead2');ell(g,x,y-1,6*s,4*s,'#c8743a');}});
art('d_reeds',46,g=>{for(const [x,h] of[[-8,26],[-3,32],[2,24],[7,30],[11,20]]){ln(g,[x,16,x+2,16-h],'#6a8a3a',1.8);ell(g,x+2,18-h+4,1.8,5,'#6a3a1a');}});
art('d_pond',120,g=>{g.globalAlpha=.9;ell(g,0,0,54,30,'#2e6f7a',{olc:'#3f5a3a',hl:.25});ell(g,-10,-6,30,14,'#4a93a0',{ol:false});g.globalAlpha=1;
  for(const [x,y] of[[20,8],[-24,6],[4,-14]]){ell(g,x,y,6,4,'#5aa04a');}shine(g,-20,-12,14,4,.25);});
art('d_dead',90,g=>{ell(g,6,20,18,7,'rgba(0,0,0,.18)',{ol:false,flat:true});ln(g,[0,20,0,-14],'#4a3a2e',6);ln(g,[0,0,-16,-18,-22,-16],'#4a3a2e',3.4);ln(g,[0,-6,14,-24,20,-22],'#4a3a2e',3.4);ln(g,[-16,-18,-14,-30],'#4a3a2e',2);ln(g,[0,-14,4,-32],'#4a3a2e',3);});
art('d_stone',42,g=>{ell(g,3,6,15,6,'rgba(0,0,0,.18)',{ol:false,flat:true});ell(g,-4,1,11,8,'#8a8a92');ell(g,6,3,8,6,'#9a9aa2');shine(g,-7,-3,4,2,.4);});
art('d_dry',38,g=>{for(let i=0;i<9;i++){const a=-Math.PI/2+(i-4)*.2;ln(g,[0,12,Math.cos(a)*18,12+Math.sin(a)*20],i%2?'#b89a4a':'#a0823a',1.4);}});
art('d_bones',42,g=>{ell(g,-2,0,9,7,'#e8e0cc');ell(g,-5,-1,2.2,2.6,'#3a3030',{ol:false,flat:true});ell(g,1,-1,2.2,2.6,'#3a3030',{ol:false,flat:true});ln(g,[6,6,16,10],'#e8e0cc',2.4);ln(g,[-12,8,-4,12],'#e8e0cc',2.4);});
art('d_crystal',48,g=>{glow(g,0,0,22,'#b86bff');poly(g,[-4,14,-8,-4,-3,-18,2,-4,0,14],'#9a5ae0',{hl:.7});poly(g,[2,14,4,-8,10,-14,12,2,8,14],'#c07aff',{hl:.7});});
art('d_grave',42,g=>{ell(g,2,14,13,5,'rgba(0,0,0,.2)',{ol:false,flat:true});shp(g,'#6a6478',{},[-9,-16,9,14],()=>{g.moveTo(-9,14);g.lineTo(-9,-8);g.quadraticCurveTo(0,-18,9,-8);g.lineTo(9,14);g.closePath();});
  ln(g,[0,-8,0,6],'#3a3448',1.8);ln(g,[-4,-3,4,-3],'#3a3448',1.8);});

/* ================= главы 5–8: новая нечисть ================= */
artTint('wolf_i','wolf','#8ad0ff');artTint('ledyan','prizr','#6ab8ff');artTint('vod_s','vod','#2a5ad8');
artTint('ognev','ogon','#ff6a1a');artTint('skel_f','skel','#ff6a2a');artTint('idol_f','idol','#e0402a');
art('snow',42,g=>{ell(g,0,11,12,10,'#f4f8ff',{hl:.2,dk:-.2});ell(g,0,-4,9,8.5,'#f4f8ff',{hl:.2,dk:-.2});
  for(const y of[6,11,16]){g.beginPath();g.arc(0,y,1.3,0,TAU);g.fillStyle='#2a2a3a';g.fill();}
  ln(g,[-9,4,-18,-4],'#6a4a2a',1.8);ln(g,[9,4,17,-6],'#6a4a2a',1.8);ell(g,19,-8,4,4,'#ffffff');
  poly(g,[1,-3,11,-1,1,0],'#f07a1a');eye(g,-3,-6,1.8,{px:.4,angry:1});eye(g,3.5,-6,1.8,{px:.4,angry:1,flipB:1});
  rrect(g,-8,-18,16,5,1.5);g.fillStyle='#c0392b';g.fill();rrect(g,-5,-24,10,7,1.5);g.fillStyle='#c0392b';g.fill();});
art('shatun',66,g=>{ell(g,-11,26,7,4,'#3a2618');ell(g,11,26,7,4,'#3a2618');
  ell(g,0,8,21,19,'#6a4a32');ell(g,0,13,12,10,'#9a7454',{ol:false});
  ell(g,-19,6,6,7,'#5a3e2a');ell(g,19,6,6,7,'#5a3e2a');for(const x of[-21,-18,18,21])ln(g,[x,12,x,15],'#f4efe2',1.2);
  ell(g,-10,-20,5,5,'#6a4a32');ell(g,10,-20,5,5,'#6a4a32');ell(g,-10,-20,2.4,2.4,'#3a2618',{ol:false,flat:true});ell(g,10,-20,2.4,2.4,'#3a2618',{ol:false,flat:true});
  ell(g,0,-12,12,10,'#6a4a32');ell(g,0,-7,6,4.5,'#b89474');ell(g,0,-9,2.4,1.8,'#1a1010',{ol:false,flat:true});
  eye(g,-5,-15,2.2,{col:'#c02a1a',angry:1});eye(g,5,-15,2.2,{col:'#c02a1a',angry:1,flipB:1});mouth(g,0,-4,3,'#3a1a10',0);fangs(g,0,-4.5,.8);shine(g,-9,0,7,3,.18);});
art('rak',42,g=>{for(const s of[-1,1])for(const y of[4,8,12])ln(g,[s*8,y,s*16,y+4],'#b83a2a',1.8);
  ln(g,[-9,-2,-16,-10],'#c8402e',2.4);ln(g,[9,-2,16,-10],'#c8402e',2.4);
  for(const s of[-1,1]){shp(g,'#e0503a',{},[s*13-6,-20,s*13+6,-8],()=>{g.moveTo(s*14,-9);g.quadraticCurveTo(s*21,-15,s*16,-20);g.lineTo(s*14,-15);g.lineTo(s*11,-19);g.quadraticCurveTo(s*8,-12,s*14,-9);});}
  shp(g,'#c89a5a',{},[-13,-8,13,16],()=>{g.moveTo(-12,14);g.bezierCurveTo(-16,-4,4,-12,13,2);g.quadraticCurveTo(10,14,-12,14);});
  g.strokeStyle='rgba(120,70,30,.6)';g.lineWidth=1;g.beginPath();g.arc(0,5,6,0,TAU*.8);g.stroke();
  ln(g,[-4,-6,-5,-12],'#b83a2a',1.2);ln(g,[3,-6,4,-12],'#b83a2a',1.2);eye(g,-5,-13,2,{px:0});eye(g,4,-13,2,{px:0});});
art('ryba',34,g=>{poly(g,[-11,0,-19,-7,-18,8],'#2a88b8');ell(g,0,0,12,8,'#3aa8d8');ell(g,0,3,8,4,'#bfe8f8',{ol:false});
  poly(g,[-2,-7,3,-13,6,-6],'#2a88b8');g.beginPath();g.moveTo(6,2);g.lineTo(12,2);g.lineWidth=1.4;g.strokeStyle='#123a4a';g.stroke();
  g.fillStyle='#fff';for(const x of[7,9,11]){g.beginPath();g.moveTo(x-.8,2);g.lineTo(x+.8,2);g.lineTo(x,4.2);g.fill();}
  eye(g,6,-2.5,2.2,{col:'#c02a1a',angry:1,flipB:1});shine(g,-3,-4,4,1.6,.4);});
art('rusalka',44,g=>{shp(g,'#2aa888',{},[-10,0,14,20],()=>{g.moveTo(-7,0);g.lineTo(7,0);g.quadraticCurveTo(10,12,4,16);g.lineTo(12,20);g.lineTo(0,18);g.lineTo(-6,21);g.quadraticCurveTo(-10,10,-7,0);});
  g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=.8;for(let y=4;y<15;y+=3.5){g.beginPath();g.arc(0,y,4,0,Math.PI);g.stroke();}
  ell(g,0,-4,7,6,'#f4d0b8');shp(g,'#3ac8a0',{},[-12,-20,12,10],()=>{g.moveTo(-9,-8);g.quadraticCurveTo(-12,-20,0,-20);g.quadraticCurveTo(12,-20,9,-8);g.quadraticCurveTo(12,4,8,10);g.quadraticCurveTo(6,-2,5,-12);g.quadraticCurveTo(0,-15,-5,-12);g.quadraticCurveTo(-6,-2,-8,10);g.quadraticCurveTo(-12,4,-9,-8);});
  ell(g,0,-10,6.5,6,'#f4d0b8');eye(g,-2.5,-10,1.8,{col:'#1a6a5a',px:0});eye(g,2.5,-10,1.8,{col:'#1a6a5a',px:0});mouth(g,0,-6.5,1.6,'#c0405a',1);
  for(const [x,c] of[[-4,'#ffd0e0'],[0,'#fff4c8'],[4,'#ffd0e0']]){g.beginPath();g.arc(x,-17,1.4,0,TAU);g.fillStyle=c;g.fill();}});
art('chert',34,g=>{ln(g,[-6,6,-14,10,-15,4],'#8a1a14',1.6);poly(g,[-15,4,-17,1,-13,2],'#8a1a14');
  ell(g,-3,12,2.4,3,'#3a1010');ell(g,3,12,2.4,3,'#3a1010');ell(g,0,4,7,7.5,'#d0302a');
  ell(g,0,-6,8,7,'#d0302a');poly(g,[-6,-10,-9,-18,-3,-12],'#f4e8c8');poly(g,[6,-10,9,-18,3,-12],'#f4e8c8');
  eye(g,-3,-7,2.1,{col:'#e8b010',angry:1});eye(g,3,-7,2.1,{col:'#e8b010',angry:1,flipB:1});ell(g,0,-3,2.4,1.8,'#f07a6a');
  g.beginPath();g.arc(0,-1.5,3,.2,Math.PI-.2);g.lineWidth=1;g.strokeStyle='#3a0a0a';g.stroke();ln(g,[7,2,12,-4],'#8a5a2e',1.4);poly(g,[10,-6,14,-6,12,-10],'#aab4c2');});

/* ================= боссы глав 5–8 ================= */
art('karach',110,g=>{ // Карачун: ледяной старик-зима
  glow(g,0,0,52,'#bfe6ff');ln(g,[30,-40,34,48],'#9ad8ff',3.4);poly(g,[26,-44,34,-60,42,-44,34,-36],'#dff4ff',{hl:.7});
  shp(g,'#3a6ab8',{},[-30,-20,30,52],()=>{g.moveTo(-12,-20);g.lineTo(12,-20);g.quadraticCurveTo(30,20,30,50);g.quadraticCurveTo(0,56,-30,50);g.quadraticCurveTo(-30,20,-12,-20);});
  for(const x of[-18,0,18]){g.beginPath();g.arc(x,40,3,0,TAU);g.fillStyle='#e8f6ff';g.fill();}ln(g,[-26,46,26,46],'#e8f6ff',3);
  ell(g,0,-30,14,14,'#dfe8f0');shp(g,'#ffffff',{hl:.1,dk:-.15,olc:'#9ab8d0'},[-18,-26,18,20],()=>{g.moveTo(-14,-24);g.quadraticCurveTo(-20,6,0,20);g.quadraticCurveTo(20,6,14,-24);g.quadraticCurveTo(6,-18,0,-20);g.quadraticCurveTo(-6,-18,-14,-24);});
  eye(g,-5,-33,3,{col:'#2a8ad8',angry:1});eye(g,5,-33,3,{col:'#2a8ad8',angry:1,flipB:1});ell(g,0,-27,3,2.6,'#8ab8e0');
  shp(g,'#4a7ac8',{},[-18,-58,18,-36],()=>{g.moveTo(-17,-38);g.quadraticCurveTo(-16,-58,0,-58);g.quadraticCurveTo(16,-58,17,-38);g.closePath();});rrect(g,-18,-41,36,6,3);g.fillStyle='#f4f8ff';g.fill();
  for(const x of[-14,-6,2,10])poly(g,[x,-20,x+4,-20,x+2,-12],'#dff4ff',{ol:false});});
art('morcar',116,g=>{ // Морской царь
  ln(g,[32,-50,36,50],'#e6b53a',3.2);for(const d of[-6,0,6])ln(g,[32+d,-50,32+d,-62],'#e6b53a',2.6);ln(g,[26,-50,38,-50],'#e6b53a',2.6);
  shp(g,'#2a8a8a',{},[-32,0,32,52],()=>{g.moveTo(-26,4);g.lineTo(26,4);g.quadraticCurveTo(34,30,22,50);g.quadraticCurveTo(0,56,-22,50);g.quadraticCurveTo(-34,30,-26,4);});
  g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1;for(let y=12;y<48;y+=6)for(let x=-18;x<=18;x+=7){g.beginPath();g.arc(x+(y%12?3.5:0),y,3.5,0,Math.PI);g.stroke();}
  ell(g,0,-8,24,18,'#3ab0a0');ell(g,-26,-6,7,7,'#3ab0a0');ell(g,26,-8,7,7,'#3ab0a0');
  ell(g,0,-30,13,13,'#8ad0c0');shp(g,'#2a6a8a',{},[-20,-26,20,18],()=>{g.moveTo(-14,-26);g.quadraticCurveTo(-22,8,-4,18);g.lineTo(0,10);g.lineTo(4,18);g.quadraticCurveTo(22,8,14,-26);g.quadraticCurveTo(0,-18,-14,-26);});
  eye(g,-5,-33,3,{col:'#1a4a3a',angry:1});eye(g,5,-33,3,{col:'#1a4a3a',angry:1,flipB:1});
  poly(g,[-14,-40,-12,-56,-6,-46,0,-60,6,-46,12,-56,14,-40],'#e6b53a',{hl:.6});for(const x of[-7,0,7]){g.beginPath();g.arc(x,-43,1.6,0,TAU);g.fillStyle='#ffd0e0';g.fill();}});
art('tugar',164,g=>{ // Змей Тугарин: крылатый огненный змей
  ln(g,[-20,26,-50,40,-62,20,-54,6],'#c0402a',10);poly(g,[-54,6,-62,-2,-48,0],'#ffd84a');
  for(const s of[1,-1])shp(g,'#8a1a14',{},[s*8,-60,s*66,16],()=>{g.moveTo(s*8,-4);g.quadraticCurveTo(s*36,-60,s*66,-44);g.quadraticCurveTo(s*56,-28,s*62,-12);g.quadraticCurveTo(s*48,-16,s*48,2);g.quadraticCurveTo(s*32,-6,s*12,16);g.closePath();});
  ell(g,0,14,26,24,'#d8502a');ell(g,0,20,15,15,'#ffc86a',{ol:false});ell(g,-12,36,8,5,'#8a2a14');ell(g,12,36,8,5,'#8a2a14');
  ln(g,[0,-4,6,-30,2,-46],'#d8502a',14);ln(g,[0,-4,6,-30,2,-46],'#e8683a',8);
  ell(g,4,-52,16,12,'#e0582a');ell(g,14,-48,9,6.5,'#f07a3a');ell(g,19,-50,1.6,1.6,'#3a0a0a',{ol:false,flat:true});
  poly(g,[-6,-60,-12,-74,-1,-63],'#ffd84a');poly(g,[4,-63,8,-78,12,-62],'#ffd84a');
  eye(g,0,-55,3.4,{col:'#ffd84a',angry:1});eye(g,8,-55,3.2,{col:'#ffd84a',angry:1,flipB:1});mouth(g,14,-44,4,'#3a0a0a',0);fangs(g,14,-44.5,1);
  glow(g,24,-44,12,'#ff9a3a');shine(g,-10,6,9,4,.25);});
art('liho',140,g=>{ // Лихо Одноглазое
  ell(g,-16,52,11,6,'#3a2a4a');ell(g,16,52,11,6,'#3a2a4a');
  shp(g,'#5a4a6a',{},[-40,-10,40,54],()=>{g.moveTo(-26,-8);g.lineTo(26,-8);g.quadraticCurveTo(44,26,34,52);g.quadraticCurveTo(0,58,-34,52);g.quadraticCurveTo(-44,26,-26,-8);});
  for(let i=0;i<5;i++)ln(g,[-30+i*15,14+i%2*6,-24+i*15,48],'rgba(30,20,40,.45)',2);
  ln(g,[-32,6,-50,30,-46,44],'#8a7a98',7);ln(g,[32,6,50,24,54,38],'#8a7a98',7);ell(g,-46,46,6,6,'#8a7a98');ell(g,55,40,6,6,'#8a7a98');
  ell(g,0,-26,28,24,'#8a7a98');shp(g,'#2a2230',{},[-30,-54,30,-26],()=>{g.moveTo(-28,-28);g.quadraticCurveTo(-30,-52,-8,-54);g.lineTo(-4,-44);g.lineTo(0,-56);g.lineTo(4,-44);g.lineTo(8,-54);g.quadraticCurveTo(30,-52,28,-28);g.quadraticCurveTo(0,-40,-28,-28);});
  glow(g,0,-28,26,'#ff4a6a');ell(g,0,-28,13,11,'#fff4e8');g.beginPath();g.arc(0,-28,7,0,TAU);g.fillStyle='#c0203a';g.fill();g.beginPath();g.arc(0,-28,3.4,0,TAU);g.fillStyle='#1a0a14';g.fill();
  g.beginPath();g.arc(2.4,-30.5,1.8,0,TAU);g.fillStyle='#fff';g.fill();ln(g,[-15,-40,15,-36],'#2a1a2a',4);
  g.beginPath();g.moveTo(-12,-10);g.quadraticCurveTo(0,-2,12,-10);g.lineWidth=2.4;g.strokeStyle='#2a1020';g.stroke();for(const x of[-7,7])poly(g,[x-2,-8,x+2,-8,x,-3],'#f4efe2',{ol:false});});

/* ================= декор глав 5–8 ================= */
art('d_snowpine',96,g=>{ell(g,6,10,26,12,'rgba(0,0,0,.14)',{ol:false,flat:true});
  for(const [y,r] of[[10,30],[-2,24],[-12,17],[-20,10]]){ell(g,0,y,r,r*.8,'#3a7a6a');ell(g,-r*.15,y-r*.25,r*.75,r*.45,'#f4f8ff',{ol:false,hl:.1,dk:-.1});}});
art('d_icerock',50,g=>{ell(g,3,8,18,6,'rgba(0,0,0,.14)',{ol:false,flat:true});poly(g,[-14,8,-10,-8,-2,-14,8,-6,14,8],'#bfe0f4',{hl:.6});poly(g,[-6,8,-2,-6,4,-2,6,8],'#e8f6ff',{ol:false});});
art('d_iceshard',48,g=>{glow(g,0,0,20,'#bfe6ff');poly(g,[-4,14,-8,-4,-3,-18,2,-4,0,14],'#9ad8ff',{hl:.7});poly(g,[2,14,4,-8,10,-14,12,2,8,14],'#c8ecff',{hl:.7});});
art('d_coral',56,g=>{for(const [x,c] of[[-8,'#ff7a9a'],[6,'#ffb03a']]){ln(g,[x,16,x,-4,x-8,-14],c,4);ln(g,[x,2,x+8,-10],c,4);ln(g,[x,-4,x+3,-18],c,3.4);}
  for(const [x,y] of[[-16,-14],[-5,-18],[14,-10],[9,-18]]){g.beginPath();g.arc(x,y,2.2,0,TAU);g.fillStyle='#fff0f4';g.fill();}});
art('d_shell',32,g=>{shp(g,'#f4d0b8',{hl:.5},[-11,-10,11,8],()=>{g.moveTo(-11,6);g.quadraticCurveTo(-12,-10,0,-10);g.quadraticCurveTo(12,-10,11,6);g.quadraticCurveTo(0,9,-11,6);});
  for(const a of[-.9,-.45,0,.45,.9])ln(g,[0,6,Math.sin(a)*10,6-Math.cos(a)*14],'rgba(180,110,90,.6)',1);});
art('d_weed',46,g=>{for(const [x,h,c] of[[-6,26,'#2a9a6a'],[0,34,'#3ab07a'],[6,24,'#2a9a6a']]){g.beginPath();g.moveTo(x,16);for(let i=1;i<=6;i++)g.lineTo(x+(i%2?4:-4),16-h*i/6);g.lineWidth=3;g.strokeStyle=c;g.stroke();}});
art('d_lava',110,g=>{g.globalAlpha=.95;ell(g,0,0,50,26,'#3a1a14',{ol:false});const q=g.createRadialGradient(0,0,4,0,0,44);q.addColorStop(0,'#fff0a0');q.addColorStop(.35,'#ff9a2a');q.addColorStop(1,'rgba(200,40,10,0)');
  g.fillStyle=q;g.beginPath();g.ellipse(0,0,44,22,0,0,TAU);g.fill();g.globalAlpha=1;for(const [x,y] of[[14,4],[-18,-4],[2,-10]]){g.beginPath();g.arc(x,y,2.6,0,TAU);g.fillStyle='#fff4c0';g.fill();}});
art('d_firerock',48,g=>{ell(g,3,8,17,6,'rgba(0,0,0,.2)',{ol:false,flat:true});ell(g,-3,1,13,9,'#4a2a24');ell(g,8,4,8,6,'#5a3028');
  ln(g,[-10,0,-4,-3,1,2,6,-1],'#ff8a2a',1.6);glow(g,-3,-1,8,'#ff8a2a');});


/* ================= «Тридевятая оборона»: заставы, места, ворота, значки ================= */
const ROOF={1:'#8a5a2e',2:'#c0392b',3:'#2f8a4a',a:'#e6b53a',b:'#b8322e'};
function lv(l,br){return br?(br===1?'a':'b'):l;}
function woodWall(g,x,y,w,h,col){rrect(g,x,y,w,h,2);const gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,shade(col,.25));gr.addColorStop(.5,col);gr.addColorStop(1,shade(col,-.35));
  g.fillStyle=gr;g.fill();outline(g,col,1);g.strokeStyle=rgba('#2a1608',.45);g.lineWidth=.9;for(let yy=y+4;yy<y+h-1;yy+=4.2){g.beginPath();g.moveTo(x+1,yy);g.lineTo(x+w-1,yy);g.stroke();}
  for(let yy=y+2;yy<y+h;yy+=4.2){ell(g,x+.5,yy,1.8,1.9,shade(col,.1),{lw:.5});ell(g,x+w-.5,yy,1.8,1.9,shade(col,-.1),{lw:.5});}}
function stoneBase(g,x,y,w,h,col){rrect(g,x,y,w,h,3);g.fillStyle=grad(g,x+w/2,y+h/2,w/2,col,.3,-.3);g.fill();outline(g,col,1);
  g.strokeStyle=rgba('#1a1a2a',.3);g.lineWidth=.8;for(let r=0;r*4.5<h-1;r++){const yy=y+r*4.5;g.beginPath();g.moveTo(x,yy);g.lineTo(x+w,yy);g.stroke();
    for(let xx=x+(r%2?3:6);xx<x+w-1;xx+=7){g.beginPath();g.moveTo(xx,yy);g.lineTo(xx,yy+4.5);g.stroke();}}}
function archer(g,x,y,cap,s){s=s||1;ln(g,[x+4*s,y-6*s,x+6.5*s,y,x+4*s,y+6*s],'#7a4a22',1.5);ln(g,[x+4*s,y-6*s,x+4*s,y+6*s],'#f0e6d0',.5);
  ell(g,x,y+4*s,4.4*s,3.6*s,cap);ell(g,x,y,3.6*s,3.5*s,'#f4c9a3');eye(g,x+.8*s,y-.2*s,.9*s,{px:.2});
  shp(g,cap,{},[x-4*s,y-7*s,x+4*s,y-1.5*s],()=>{g.moveTo(x-3.8*s,y-1.6*s);g.quadraticCurveTo(x-3*s,y-7.5*s,x+.5*s,y-7*s);g.quadraticCurveTo(x+4*s,y-6*s,x+3.8*s,y-1.6*s);g.closePath();});
  rrect(g,x-4.2*s,y-2.8*s,8.4*s,2*s,1);g.fillStyle='#8a5a33';g.fill();}
function flag(g,x,y,col,h){ln(g,[x,y,x,y-h],'#5a3a22',1.2);shp(g,col,{},[x,y-h,x+9,y-h+6],()=>{g.moveTo(x,y-h);g.quadraticCurveTo(x+5,y-h-1,x+9,y-h+2.5);g.quadraticCurveTo(x+5,y-h+4,x,y-h+6);g.closePath();});}

function drawArch(g,l,br){const k=lv(l,br),w=l>=3?15:l===2?14:12.5,T=l===1?-2:l===2?-6:-10,roof=ROOF[k];
  ell(g,0,14,w+9,7,'rgba(0,0,0,.22)',{ol:false,flat:true});
  if(l>=2)stoneBase(g,-w-2,4,2*w+4,10,br===1?'#d8d0bc':'#9aa0a8');
  woodWall(g,-w,T,2*w,(l>=2?5:13)-T,'#9a6a3a');
  if(l>=2){rrect(g,-3.5,T+6,7,9,3);g.fillStyle='#2a1a10';g.fill();}
  // галерея со стрельцами
  const caps=br===2?['#c0392b','#2f6fd6','#c0392b']:l===1?['#c0392b']:['#c0392b','#2f7d5e'];
  const xs=caps.length===1?[0]:caps.length===2?[-5.5,5.5]:[-8,0,8];
  for(let i=0;i<caps.length;i++)archer(g,xs[i],T-8,caps[i],br===2?.9:1);
  ln(g,[-w-1,T-2,-w-1,T-20],'#6a4222',2.2);ln(g,[w+1,T-2,w+1,T-20],'#6a4222',2.2);
  rrect(g,-w-3,T-4.5,2*w+6,5,1.6);g.fillStyle=grad(g,0,T-2,w,'#b07a44',.3,-.3);g.fill();outline(g,'#b07a44',.8);
  for(let x=-w;x<=w;x+=5)ln(g,[x,T-4,x,T+.5],rgba('#3a2010',.4),.7);
  const rw=w+(br===2?8:6),ry=T-18,peak=T-(br===1?40:34);
  shp(g,roof,{hl:.45},[-rw,peak,rw,ry+3],()=>{g.moveTo(-rw,ry+3);g.quadraticCurveTo(-rw*.35,ry-2,0,peak);g.quadraticCurveTo(rw*.35,ry-2,rw,ry+3);g.quadraticCurveTo(0,ry-1,-rw,ry+3);});
  g.strokeStyle=rgba('#000000',.18);g.lineWidth=.8;for(const f of[-.5,0,.5]){g.beginPath();g.moveTo(rw*f*1.6,ry+1.5);g.lineTo(0,peak+2);g.stroke();}
  shine(g,-rw*.35,ry-4,3,6,.3);
  if(l>=3&&!br)flag(g,0,peak+1,'#e8433a',10);
  if(br===1){ // сокол на шпиле
    ln(g,[0,peak+1,0,peak-4],'#e6b53a',1.4);ell(g,0,peak-8,4,4.5,'#8a5a33');ell(g,1.5,peak-12,3,2.6,'#8a5a33');poly(g,[4,-0+peak-12.5,6.5,peak-11,4,peak-10.5],'#f0a020');
    for(const s of[-1,1])shp(g,'#6a4222',{},[s*1,peak-14,s*11,peak-5],()=>{g.moveTo(s*2,peak-9);g.quadraticCurveTo(s*8,peak-16,s*11,peak-12);g.quadraticCurveTo(s*7,peak-7,s*2,peak-6);g.closePath();});
    eye(g,2.2,peak-12.5,1,{px:.3,col:'#d0901a'});}
  if(br===2){flag(g,-rw+1,ry+3,'#2f6fd6',11);flag(g,rw-1,ry+3,'#e6b53a',11);}
}
function drawPushka(g,l,br){const k=lv(l,br),r=l===1?15:l===2?17:19,top=l===1?-2:l===2?-5:-8;
  const col=br===1?'#e0d8c4':br===2?'#b07a44':l===3?'#a8aeb8':'#9aa0a8';
  ell(g,0,14,r+8,7,'rgba(0,0,0,.22)',{ol:false,flat:true});
  // цилиндр бастиона
  g.beginPath();g.moveTo(-r,top);g.lineTo(-r,9);g.ellipse(0,9,r,r*.42,0,Math.PI,0,true);g.lineTo(r,top);g.closePath();
  const gr=g.createLinearGradient(-r,0,r,0);gr.addColorStop(0,shade(col,.3));gr.addColorStop(.45,col);gr.addColorStop(1,shade(col,-.4));g.fillStyle=gr;g.fill();outline(g,col,1);
  g.save();g.clip();g.strokeStyle=rgba('#1a1a2a',.28);g.lineWidth=.8;
  for(let y=top+4,i=0;y<14;y+=4.5,i++){g.beginPath();g.ellipse(0,y,r,r*.42,0,0,Math.PI);g.stroke();for(let a=.25+(i%2)*.2;a<Math.PI;a+=.45){const x=Math.cos(a)*r;g.beginPath();g.moveTo(x,y+Math.sin(a)*r*.42);g.lineTo(x,y+Math.sin(a)*r*.42+4.5);g.stroke();}}g.restore();
  if(br===2){g.strokeStyle=rgba('#2a1608',.45);g.lineWidth=.9;for(let x=-r+4;x<r;x+=4.5){g.beginPath();g.moveTo(x,top+2);g.lineTo(x,12);g.stroke();}}
  ell(g,0,top,r,r*.42,shade(col,.12),{hl:.2});ell(g,0,top,r-3.5,r*.42-2,shade(col,-.3),{ol:false,flat:true});
  if(l>=2){const n=l>=3?10:8;for(let i=0;i<n;i++){const a=Math.PI+i/(n-1)*Math.PI;const x=Math.cos(a)*(r-1.5),y=top+Math.sin(a)*(r*.42-1);
      rrect(g,x-2.2,y-4,4.4,4.5,1);g.fillStyle=shade(col,.15);g.fill();outline(g,col,.6);}}
  if(l>=3||br){const fc=br===1?'#e6b53a':br===2?'#e8433a':'#e8433a';flag(g,r-2,top+2,fc,14);}
  if(br===1){rrect(g,-r,4,2*r,3,1.4);g.fillStyle='#e6b53a';g.fill();}
  if(br===2){for(const [x,y] of[[-r+4,10],[-r+9,11.5]]){ell(g,x,y,4,2.6,'#d8903a',{hl:.5});}}
}
// ствол пушки — отдельный спрайт, крутится к цели (смотрит вправо)
function drawBarrel(g,l,br){
  if(br===2){ell(g,-3,0,8,8,'#6a4a2a');rrect(g,-4,-6.5,16,13,5);g.fillStyle=grad(g,4,0,9,'#7a7f8a',.4,-.4);g.fill();outline(g,'#7a7f8a',1);ell(g,12,0,3,6,'#2a2228',{ol:false,flat:true});
    ell(g,11,-2,3,2,'#d8903a',{lw:.5});return;}
  const len=br===1?30:l===1?18:l===2?21:24,wd=br===1?7:l===1?4.4:5.2,col=br===1?'#d8a040':l===1?'#5a5f6a':'#b8863a';
  ell(g,-4,0,wd+3,wd+3,'#6a4a2a');
  shp(g,col,{hl:.5},[-4,-wd,len,wd],()=>{g.moveTo(-4,-wd);g.lineTo(len-2,-wd*.8);g.lineTo(len,-wd*.95);g.lineTo(len,wd*.95);g.lineTo(len-2,wd*.8);g.lineTo(-4,wd);g.closePath();});
  ell(g,len,0,1.8,wd*.9,'#1a1418',{ol:false,flat:true});
  for(const x of[4,len-6])ln(g,[x,-wd*.9,x,wd*.9],shade(col,-.3),1.2);
  if(br===1){for(const x of[8,14,20])ln(g,[x,-wd*.85,x,wd*.85],'#fff0a0',.8);ell(g,-6,0,4,4,'#e6b53a');}
  shine(g,len*.4,-wd*.45,len*.3,1,.35);}
function drawIzba(g,l,br){const k=lv(l,br),w=l===1?13:l===2?14.5:16,brew=br===1?'#b86bff':br===2?'#ff9ac8':'#7aff6a';
  ell(g,0,15,w+10,6,'rgba(0,0,0,.22)',{ol:false,flat:true});
  // куриные ножки
  for(const s of[-1,1]){ln(g,[s*5,2,s*6,9,s*4,13],'#e8a040',2.6);ln(g,[s*4,13,s*1,15],'#e8a040',1.4);ln(g,[s*4,13,s*7,15],'#e8a040',1.4);ln(g,[s*4,13,s*4,16],'#e8a040',1.4);
    ell(g,s*5.5,4,3,2.6,'#e8e0cc',{lw:.6});}
  const top=l===1?-12:l===2?-14:-16;
  woodWall(g,-w,top,2*w,top<0?5-top:10,'#8a5a30');
  // окно
  rrect(g,-4,top+4,8,7,1.4);g.fillStyle='#ffd86a';g.fill();glow(g,0,top+7.5,7,'#ffcf5a','#fff6c8');ln(g,[0,top+4,0,top+11],'#5a3a1a',1);ln(g,[-4,top+7.5,4,top+7.5],'#5a3a1a',1);
  for(const s of[-1,1]){rrect(g,s>0?4:-7,top+3.5,3,8,1);g.fillStyle=br===1?'#6a3a9a':'#2f6fd6';g.fill();}
  // крыша
  const rc=br===1?'#5a3a6a':br===2?'#c86a8a':l===3?'#7a4a2a':'#6a4a2a',rw=w+5,peak=top-(l===1?15:17);
  shp(g,rc,{},[-rw,peak,rw,top+2],()=>{g.moveTo(-rw,top+2);g.lineTo(0,peak);g.lineTo(rw,top+2);g.quadraticCurveTo(0,top-1,-rw,top+2);});
  g.strokeStyle=rgba('#000000',.2);g.lineWidth=.8;for(let i=1;i<5;i++){g.beginPath();g.moveTo(-rw+i*2.2,top+1.5-i*.2);g.lineTo(0,peak+i*2.6);g.lineTo(rw-i*2.2,top+1.5-i*.2);g.stroke();}
  if(l>=2){ln(g,[-rw+1,top+2,0,peak+1,rw-1,top+2],'#f4efe2',1.4);}
  if(l>=3||br){ell(g,0,peak-2,2.8,2.6,'#e8e0cc',{lw:.6});ell(g,-1,peak-2.3,.7,.8,'#1a1420',{ol:false,flat:true});ell(g,1,peak-2.3,.7,.8,'#1a1420',{ol:false,flat:true});}
  // труба и котёл
  rrect(g,w-7,peak+5,4,7,1);g.fillStyle='#8a4a3a';g.fill();
  const cx=w+2,cy=9,cr=l===1?6:7.5;
  ln(g,[cx-cr-1,cy+5,cx-cr+2,cy+1],'#3a3a44',1.2);ln(g,[cx+cr+1,cy+5,cx+cr-2,cy+1],'#3a3a44',1.2);
  glow(g,cx,cy+5,5,'#ff8a2a');ell(g,cx,cy,cr,cr*.8,'#2e2a36',{hl:.3});ell(g,cx,cy-cr*.45,cr*.85,cr*.3,brew,{hl:.5,lw:.6});
  glow(g,cx,cy-cr*.5,cr*1.3,brew);for(const [x,y,r] of[[-2,-1,1.2],[2,-2,1],[0,-3.5,.8]]){g.beginPath();g.arc(cx+x,cy-cr*.5+y,r,0,TAU);g.fillStyle='rgba(255,255,255,.7)';g.fill();}
  if(br===1){for(const [x,y,s] of[[-w-3,11,1],[-w+2,13,.8]]){ell(g,x,y+2,1.4*s,2.6*s,'#f4ead2',{lw:.5});shp(g,'#e5382f',{},[x-4*s,y-3*s,x+4*s,y+1],()=>{g.moveTo(x-4*s,y);g.bezierCurveTo(x-4*s,y-4*s,x+4*s,y-4*s,x+4*s,y);g.closePath();});}}
}
function drawMag(g,l,br){const k=lv(l,br),w=l===1?8:l===2?9:10,top=l===1?-14:l===2?-19:-23;
  const rc=br===1?'#e6b53a':br===2?'#3a9a4a':'#3a4aa8',orb=br===2?'#7aff6a':br===1?'#fff36a':'#8ad8ff';
  ell(g,0,14,w+12,6.5,'rgba(0,0,0,.22)',{ol:false,flat:true});
  stoneBase(g,-w-4,6,2*w+8,8,'#8a8aa0');
  rrect(g,-w,top,2*w,20-top-8,2);const gr=g.createLinearGradient(-w,0,w,0);gr.addColorStop(0,'#c8c8dc');gr.addColorStop(.5,'#9a9ab8');gr.addColorStop(1,'#5a5a78');g.fillStyle=gr;g.fill();outline(g,'#9a9ab8',1);
  g.strokeStyle=rgba('#1a1a2a',.25);g.lineWidth=.7;for(let y=top+4;y<12;y+=4.5){g.beginPath();g.moveTo(-w,y);g.lineTo(w,y);g.stroke();}
  rrect(g,-2.6,top+5,5.2,6,2.6);g.fillStyle=orb;g.fill();glow(g,0,top+8,7,orb);
  rrect(g,-3.5,5,7,7,3.5);g.fillStyle='#3a2410';g.fill();
  const rw=w+5,peak=top-(br?30:l===1?20:24);
  shp(g,rc,{hl:.4},[-rw,peak,rw,top+3],()=>{g.moveTo(-rw,top+3);g.quadraticCurveTo(-w*.4,top-6,0,peak);g.quadraticCurveTo(w*.4,top-6,rw,top+3);g.quadraticCurveTo(0,top,-rw,top+3);});
  g.fillStyle=br===1?'#fff6c8':'#ffe66a';for(const [x,y] of[[-5,top-4],[3,top-8],[-1,top-14],[4,top-1],[-6,top+1]]){if(y>peak+4){g.beginPath();g.arc(x*(rw/13),y,1.1,0,TAU);g.fill();}}
  shine(g,-rw*.4,top-3,2.4,5,.3);
  glow(g,0,peak-4,l>=3||br?13:9,orb);ell(g,0,peak-4,3.4,3.4,shade(orb,.5),{ol:false});
  if(l>=3||br===1){g.strokeStyle=rgba(orb,.8);g.lineWidth=1;g.beginPath();g.ellipse(0,peak-4,8,3,-.3,0,TAU);g.stroke();}
  if(br===2){ell(g,0,top+1,5,3.2,'#5ab04a');eye(g,-2,top-1.5,1.4,{px:0});eye(g,2,top-1.5,1.4,{px:0});mouth(g,0,top+1.5,2.4,'#1a3a10',1);}
}
function drawDub(g,l,br){const k=lv(l,br),s=l===1?.82:l===2?.92:1.02,crown=br===1?'#2f6a3a':br===2?'#4a9e42':'#3d8a3a';
  g.save();g.scale(s,s);
  ell(g,0,15,30,7,'rgba(0,0,0,.24)',{ol:false,flat:true});
  // корни
  for(const [a,b,c,d] of[[-5,10,-16,15],[5,10,16,14],[-2,12,-8,17],[3,12,9,17]])ln(g,[a,b,(a+c)/2,(b+d)/2-2,c,d],'#6a4222',2.6);
  shp(g,'#7a5030',{},[-9,-16,9,14],()=>{g.moveTo(-8,13);g.quadraticCurveTo(-6,0,-7,-14);g.lineTo(7,-14);g.quadraticCurveTo(6,0,8,13);g.quadraticCurveTo(0,15,-8,13);});
  g.strokeStyle=rgba('#2a1608',.4);g.lineWidth=.8;for(const x of[-4,4])ln(g,[x,12,x*.6,-6],rgba('#2a1608',.35),.8);
  // лицо
  eye(g,-3.2,0,2.1,{px:0,col:'#3a2410',angry:br===1});eye(g,3.2,0,2.1,{px:0,col:'#3a2410',angry:br===1,flipB:1});
  if(br===1){shp(g,'#8ab070',{},[-7,3,7,12],()=>{g.moveTo(-6,3);g.quadraticCurveTo(-5,11,0,12);g.quadraticCurveTo(5,11,6,3);g.quadraticCurveTo(0,6,-6,3);});}
  else mouth(g,0,5,2.8,'#3a1a08',1);
  if(br===2){ln(g,[-8,-6,-4,-4,0,-3.4,4,-4,8,-6],'#f0c24a',1.6);for(let x=-7;x<=7;x+=2.3){g.beginPath();g.arc(x,-4.6+Math.abs(x)*.12,.9,0,TAU);g.strokeStyle='#c8961a';g.lineWidth=.6;g.stroke();}}
  // крона
  const blobs=[[-14,-16,11,9],[14,-16,11,9],[0,-22,14,11],[-8,-30,11,9],[8,-30,11,9],[0,-35,9,7]];
  for(const [x,y,rx,ry] of blobs)ell(g,x,y,rx,ry,crown,{hl:.35});
  for(const [x,y,rx,ry] of blobs)shine(g,x-rx*.3,y-ry*.4,rx*.35,ry*.18,.18);
  if(l>=2||br){for(const [x,y] of[[-12,-12],[10,-20],[-3,-28],[14,-12],[4,-34]]){ell(g,x,y+1.4,1.8,2.2,br===1?'#e6b53a':'#b87a3a',{lw:.5});ell(g,x,y-.6,2.1,1.2,'#6a4a2a',{lw:.4});}}
  if(br===1){g.fillStyle='rgba(180,255,160,.8)';for(const [x,y] of[[-6,-20],[6,-26],[0,-14]]){glow(g,x,y,5,'#9aff7a');}}
  if(br===2){g.save();g.translate(13,-24);g.scale(.55,.55);ART.kot.fn(g);g.restore();}
  g.restore();}
const TDRAW={arch:drawArch,pushka:drawPushka,izba:drawIzba,mag:drawMag,dub:drawDub};
for(const t in TDRAW){for(const l of[1,2,3])art('t_'+t+'_'+l,86,g=>{g.translate(0,-8);TDRAW[t](g,l,0);});
  art('t_'+t+'_4a',86,g=>{g.translate(0,-8);TDRAW[t](g,3,1);});art('t_'+t+'_4b',86,g=>{g.translate(0,-8);TDRAW[t](g,3,2);});}
for(const t in TDRAW){for(const l of[1,2,3])art('ti_'+t+'_'+l,60,g=>{g.scale(.95,.95);g.translate(0,4);TDRAW[t](g,l,0);if(t==='pushka'){g.translate(0,[0,-9,-12,-15][l]);g.rotate(-.6);g.scale(.8,.8);drawBarrel(g,l,0);}});
  for(const b of[1,2])art('ti_'+t+'_4'+(b===1?'a':'b'),60,g=>{g.scale(.95,.95);g.translate(0,4);TDRAW[t](g,3,b);if(t==='pushka'){g.translate(0,-15);g.rotate(-.6);g.scale(.8,.8);drawBarrel(g,3,b);}});}
for(const l of[1,2,3])art('bar_'+l,70,g=>drawBarrel(g,l,0));art('bar_4a',70,g=>drawBarrel(g,3,1));art('bar_4b',70,g=>drawBarrel(g,3,2));
// перекраска кота (для Лукоморья) не нужна — чёрный кот учёный тоже учёный

// место под заставу
art('spot',48,g=>{ell(g,0,4,19,10,'rgba(0,0,0,.18)',{ol:false,flat:true});ell(g,0,2,18,9,'#8a6a44',{hl:.15,dk:-.2,olc:'#5a4028'});
  ell(g,0,1,14,6.5,'#a07e54',{ol:false,hl:.2});
  for(let i=0;i<9;i++){const a=i/9*TAU;ell(g,Math.cos(a)*17,2+Math.sin(a)*8.5,3,2,'#b8b0a0',{lw:.5});}
  ln(g,[7,1,7,-13],'#6a4222',1.6);shp(g,'#e8433a',{},[7,-13,16,-7],()=>{g.moveTo(7,-13);g.quadraticCurveTo(12,-14,16,-10.5);g.quadraticCurveTo(12,-8,7,-7);g.closePath();});});
// городские ворота в конце дороги
art('gate',150,g=>{ell(g,0,34,70,12,'rgba(0,0,0,.22)',{ol:false,flat:true});
  for(const s of[-1,1]){woodWall(g,s>0?20:-66,-2,46,34,'#9a6a3a');for(let x=(s>0?22:-64);x<(s>0?66:-20);x+=5)poly(g,[x,-2,x+2.5,-8,x+5,-2],'#b07a44',{lw:.6});}
  for(const s of[-1,1]){const x=s*22;woodWall(g,x-9,-22,18,56,'#8a5a30');rrect(g,x-11,-24,22,5,2);g.fillStyle='#b07a44';g.fill();
    shp(g,'#2f8a4a',{hl:.4},[x-13,-50,x+13,-20],()=>{g.moveTo(x-13,-20);g.quadraticCurveTo(x-4,-26,x,-50);g.quadraticCurveTo(x+4,-26,x+13,-20);g.closePath();});
    ell(g,x,-52,1.6,1.6,'#e6b53a');rrect(g,x-3,-14,6,7,2);g.fillStyle='#ffd86a';g.fill();}
  // арка ворот
  shp(g,'#6a4222',{},[-14,-12,14,34],()=>{g.moveTo(-13,34);g.lineTo(-13,-2);g.quadraticCurveTo(0,-16,13,-2);g.lineTo(13,34);g.closePath();});
  shp(g,'#3a2412',{},[-10,-8,10,34],()=>{g.moveTo(-10,34);g.lineTo(-10,0);g.quadraticCurveTo(0,-10,10,0);g.lineTo(10,34);g.closePath();});
  ln(g,[0,-6,0,34],'#5a3a1e',1.2);ell(g,0,-16,5,5,'#e6b53a',{hl:.6});ln(g,[-1.5,-16,1.5,-16],'#8a5a10',.8);});
// значки
art('star',40,g=>{glow(g,0,0,19,'#ffd84a');const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?7:16;p.push(Math.cos(a)*r,Math.sin(a)*r+1);}poly(g,p,'#ffc93a',{hl:.6,lw:1.2});shine(g,-3,-4,3,1.6,.6);});
art('star0',40,g=>{const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?7:16;p.push(Math.cos(a)*r,Math.sin(a)*r+1);}poly(g,p,'#5a5a78',{hl:.2,lw:1.2});});
art('heart',40,g=>{shp(g,'#e8433a',{hl:.55},[-15,-12,15,15],()=>{g.moveTo(0,15);g.bezierCurveTo(-18,2,-16,-14,-6,-12);g.quadraticCurveTo(-2,-11,0,-6);g.quadraticCurveTo(2,-11,6,-12);g.bezierCurveTo(16,-14,18,2,0,15);});shine(g,-7,-6,3.6,2,.5);});
art('ingot',40,g=>{glow(g,0,2,19,'#ffd84a');poly(g,[-15,8,-10,-6,10,-6,15,8],'#f0b43a',{hl:.6,lw:1.2});poly(g,[-10,-6,-7,-12,7,-12,10,-6],'#ffd86a',{hl:.7,lw:1});shine(g,-5,-9,4,1.2,.6);});
art('ball',16,g=>{ell(g,0,0,5,5,'#3a3a44',{hl:.5});shine(g,-1.6,-1.8,1.6,.9,.6);});
art('ballG',22,g=>{glow(g,0,0,10,'#ffd84a');ell(g,0,0,7,7,'#5a4a2a',{hl:.6});shine(g,-2,-2.4,2.4,1.2,.6);});
art('flaskG',24,g=>{ell(g,0,3,7,7,'#3ab04a',{hl:.6});rrect(g,-2.5,-9,5,6,1);g.fillStyle='#b8d8a0';g.fill();rrect(g,-3,-11,6,3,1);g.fillStyle='#8a5a2e';g.fill();shine(g,-2.5,1,2,3,.5);});
art('flaskP',24,g=>{ell(g,0,3,7,7,'#9a4ae0',{hl:.6});rrect(g,-2.5,-9,5,6,1);g.fillStyle='#d0b8e8';g.fill();rrect(g,-3,-11,6,3,1);g.fillStyle='#8a5a2e';g.fill();shine(g,-2.5,1,2,3,.5);});
art('flaskK',24,g=>{ell(g,0,3,7,7,'#ff8ab8',{hl:.6});rrect(g,-2.5,-9,5,6,1);g.fillStyle='#ffe0ec';g.fill();rrect(g,-3,-11,6,3,1);g.fillStyle='#8a5a2e';g.fill();shine(g,-2.5,1,2,3,.5);});
art('frog',30,g=>{ell(g,-6,8,4,2.4,'#3a8a2a');ell(g,6,8,4,2.4,'#3a8a2a');ell(g,0,3,10,8,'#5ab04a');ell(g,0,6,6,3.5,'#c8e89a',{ol:false});
  ell(g,-4.5,-4,3.4,3.4,'#5ab04a');ell(g,4.5,-4,3.4,3.4,'#5ab04a');eye(g,-4.5,-4.5,2.2,{px:0});eye(g,4.5,-4.5,2.2,{px:0});mouth(g,0,1.5,4,'#1a3a10',1);
  poly(g,[-3,-9,-1.5,-13,0,-9.5,1.5,-13,3,-9],'#e6b53a',{lw:.5});});
art('sp_thunder',48,g=>{glow(g,0,0,23,'#8ad8ff');g.save();g.scale(1.25,1.25);poly(g,[3,-18,-8,2,0,2,-4,18,9,-4,1,-4,6,-18],'#fff36a',{hl:.7,olc:'#c8a000'});g.restore();});
art('sp_cat',48,g=>{glow(g,0,0,23,'#c8a0ff');g.beginPath();g.arc(9,-10,6,0,TAU);g.fillStyle='#fff3b0';g.fill();g.beginPath();g.arc(12,-12,5.4,0,TAU);g.fillStyle='rgba(60,40,110,1)';g.globalCompositeOperation='destination-out';g.fill();g.globalCompositeOperation='source-over';
  poly(g,[-12,-6,-10,-17,-3,-9],'#6a6a7a');poly(g,[12,-6,10,-17,3,-9],'#6a6a7a');ell(g,0,2,14,12,'#7a7a8a',{hl:.35});
  for(const s of[-1,1]){g.beginPath();g.moveTo(s*4.5,-1);g.quadraticCurveTo(s*6.5,-3.5,s*8.5,-1);g.lineWidth=1.6;g.strokeStyle='#2a2238';g.stroke();}
  ell(g,0,4,1.8,1.3,'#f09ab0',{ol:false});ln(g,[-3,7,0,8.5,3,7],'#2a2238',1);for(const s of[-1,1]){ln(g,[s*5,5,s*14,3],'#e8e8f0',.6);ln(g,[s*5,6.5,s*14,7.5],'#e8e8f0',.6);}
  g.fillStyle='#fff';g.font='bold 7px sans-serif';g.fillText('z',9,-2);g.font='bold 5px sans-serif';g.fillText('z',13,-6);});
art('skull',40,g=>{glow(g,0,0,19,'#ff5a3a');ell(g,0,-2,11,10,'#f1ebdc');rrect(g,-6,4,12,7,2.5);g.fillStyle='#f1ebdc';g.fill();outline(g,'#f1ebdc',.8);
  ell(g,-4,-2,3,3.4,'#1a1420',{ol:false,flat:true});ell(g,4,-2,3,3.4,'#1a1420',{ol:false,flat:true});poly(g,[0,2,-1.4,5,1.4,5],'#3a2a2a',{ol:false,flat:true});
  for(const x of[-3,0,3])ln(g,[x,6,x,10],'rgba(60,50,40,.6)',.8);});
art('voevoda',66,g=>{g.translate(0,3);drawHero(g,HERO_ART.ily,0);});
art('tetka',66,g=>{g.translate(0,8);g.scale(.62,.62);ART.yaga.fn(g);});
// постройки деревни (значки)
function hut(g,wall,roof,w){woodWall(g,-w,-4,2*w,16,wall);shp(g,roof,{},[-w-4,-20,w+4,-2],()=>{g.moveTo(-w-4,-2);g.lineTo(0,-20);g.lineTo(w+4,-2);g.closePath();});}
art('b_mint',48,g=>{hut(g,'#9a6a3a','#c0392b',13);g.save();g.translate(0,4);g.scale(1.3,1.3);ART.coin.fn(g);g.restore();});
art('b_barn',48,g=>{woodWall(g,-16,-6,32,18,'#a0502a');shp(g,'#6a3a1e',{},[-19,-22,19,-4],()=>{g.moveTo(-19,-4);g.lineTo(-12,-18);g.lineTo(12,-18);g.lineTo(19,-4);g.closePath();});rrect(g,-6,0,12,12,1);g.fillStyle='#f4e8c8';g.fill();ln(g,[-6,0,6,12],'#a0502a',1.4);ln(g,[6,0,-6,12],'#a0502a',1.4);});
art('b_fair',48,g=>{shp(g,'#e8433a',{},[-18,-20,18,8],()=>{g.moveTo(-18,8);g.lineTo(0,-20);g.lineTo(18,8);g.closePath();});for(const x of[-9,0,9])ln(g,[0,-20,x*1.8,8],'#fff0d0',2.2);flag(g,0,-19,'#ffd84a',7);});
art('b_smith',48,g=>{shp(g,'#6a6f7a',{hl:.5},[-16,-8,16,6],()=>{g.moveTo(-16,-8);g.lineTo(12,-8);g.quadraticCurveTo(18,-8,16,-2);g.lineTo(6,-2);g.lineTo(6,6);g.lineTo(-6,6);g.lineTo(-6,-2);g.lineTo(-12,-2);g.closePath();});
  rrect(g,-9,6,18,6,2);g.fillStyle='#4a4f5a';g.fill();ln(g,[4,-20,14,-12],'#7a4a22',2.4);rrect(g,-1,-26,9,6,1.5);g.fillStyle='#8a90a0';g.fill();glow(g,-4,-10,8,'#ffb03a');});
art('b_range',48,g=>{for(const [r,c] of[[16,'#f4efe2'],[12,'#e8433a'],[8,'#f4efe2'],[4,'#e8433a']])ell(g,0,0,r,r,c,{hl:.2,lw:.8});g.save();g.translate(3,-3);g.rotate(-.6);ln(g,[-16,0,8,0],'#8a5a2e',1.8);poly(g,[-17,0,-13,-3.5,-11,0,-13,3.5],'#2f7d5e',{lw:.5});g.restore();});
art('b_herb',48,g=>{hut(g,'#7a5a3a','#5a8a3a',12);for(const [x,c] of[[-15,'#b86bff'],[15,'#ffd84a'],[-10,'#f47aa0']]){ln(g,[x,14,x,6],'#3a7a2a',1.2);ell(g,x,5,2.6,2.6,c,{lw:.5});}});
art('b_wall',48,g=>{for(let x=-18;x<=14;x+=6){rrect(g,x,-10,5.5,24,2);g.fillStyle=grad(g,x+2,0,8,'#9a6a3a');g.fill();outline(g,'#9a6a3a',.7);poly(g,[x,-10,x+2.75,-17,x+5.5,-10],'#b07a44',{lw:.6});}ln(g,[-19,-2,20,-2],'#6a4222',1.6);ln(g,[-19,8,20,8],'#6a4222',1.6);});
art('b_map',48,g=>{rrect(g,-17,-13,34,26,3);g.fillStyle=grad(g,0,0,18,'#f0dca8',.2,-.15);g.fill();outline(g,'#f0dca8',1);g.setLineDash([2,2]);ln(g,[-12,8,-4,0,4,4,12,-8],'#c0392b',1.4);g.setLineDash([]);
  g.beginPath();g.arc(12,-8,2.4,0,TAU);g.fillStyle='#c0392b';g.fill();ln(g,[-14,-9,-10,-5],'#3a7a2a',1.2);ln(g,[-10,-9,-14,-5],'#3a7a2a',1.2);});
art('b_forge',48,g=>{g.save();g.translate(0,4);ART.b_smith.fn(g);g.restore();});
art('b_siege',48,g=>{g.save();g.scale(.36,.36);g.translate(0,-2);ART.gate.fn(g);g.restore();});
art('b_vil',48,g=>{hut(g,'#9a6a3a','#2f8a4a',11);rrect(g,-3,2,6,10,1);g.fillStyle='#3a2412';g.fill();});
art('swords',40,g=>{for(const s of[-1,1]){g.save();g.scale(s,1);g.rotate(-.78);ln(g,[0,-16,0,7],'#e8eef6',4.2);ln(g,[0,-16,0,7],'#ffffff',1.2);poly(g,[-2.1,-16,2.1,-16,0,-20],'#e8eef6',{lw:.6});
  rrect(g,-6.5,7,13,3,1.4);g.fillStyle='#f0c24a';g.fill();ln(g,[0,10.5,0,15.5],'#7a4a22',3);ell(g,0,16.8,2.2,2.2,'#f0c24a',{lw:.5});g.restore();}});

/* ================= облики застав (только внешний вид) =================
   Рисуются поверх готового спрайта по его силуэту: верхние кромки (непрозрачная точка, над которой пусто) — под снег и цветы,
   рамка силуэта — под гирлянду флажков, позолота — перекраска «цветом» с сохранением объёма. */
function skinCanvas(c,skin,k){const W=c.width,H=c.height,g=c.getContext('2d');let d;try{d=g.getImageData(0,0,W,H).data;}catch(e){return c;}
  const A=(x,y)=>d[(y*W+x)*4+3],up=Math.max(2,Math.round(k*2)),R=mulberry(W*31+skin.length*7);
  let x0=W,x1=0,y0=H,y1=0;const edge=[];
  for(let y=up;y<H;y++)for(let x=0;x<W;x++)if(A(x,y)>170){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(A(x,y-up)<40)edge.push([x,y]);}
  if(!edge.length)return c;
  // кромки прорежаем: одна точка на шаг ~1,2 единицы рисунка
  const step=Math.max(1,Math.round(k*1.2)),seen={},E=[];for(const p of edge){const key=Math.floor(p[0]/step)+':'+Math.floor(p[1]/step);if(!seen[key]){seen[key]=1;E.push(p);}}
  g.save();g.setTransform(1,0,0,1,0,0);g.lineJoin='round';g.lineCap='round';   // у холста остался масштаб рисунка — рисуем в пикселях
  if(skin==='winter'){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(170,200,255,.14)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
    const r=1.7*k;g.fillStyle='#a9bcdc';for(const [x,y] of E){g.beginPath();g.arc(x,y+.55*k,r,0,TAU);g.fill();}
    g.fillStyle='#f6f9ff';for(const [x,y] of E){g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
    // сосульки — с нижних краёв шапок на широких кромках
    const ic=E.filter(p=>p[1]>y0+(y1-y0)*.15&&p[1]<y1-(y1-y0)*.2);for(let i=0;i<Math.min(6,ic.length/6);i++){const [x,y]=ic[Math.floor(R()*ic.length)],L=(2.5+R()*3)*k;
      g.beginPath();g.moveTo(x-.9*k,y+r*.6);g.lineTo(x+.9*k,y+r*.6);g.lineTo(x,y+r*.6+L);g.closePath();g.fillStyle='rgba(225,240,255,.95)';g.fill();g.strokeStyle='#a9bcdc';g.lineWidth=.35*k;g.stroke();}
    g.fillStyle='#ffffff';for(let i=0;i<8;i++){g.beginPath();g.arc(x0+R()*(x1-x0),y0+R()*(y1-y0)*.8,.55*k,0,TAU);g.fill();}}
  else if(skin==='spring'){const cols=['#ff8ab8','#fff4f8','#ffd84a','#8ac8ff','#ff9a5a'];
    const F=E.filter((p,i)=>i%3===0);for(const [x,y] of F){const r=(1+R()*.5)*k,c0=cols[Math.floor(R()*cols.length)];
      g.fillStyle='#4a9a3a';g.beginPath();g.ellipse(x+r*1.2,y+r*.3,r*1.1,r*.5,.5,0,TAU);g.fill();
      g.fillStyle=c0;for(let j=0;j<5;j++){const a=j/5*TAU+R();g.beginPath();g.arc(x+Math.cos(a)*r*.75,y-r*.3+Math.sin(a)*r*.75,r*.62,0,TAU);g.fill();}
      g.fillStyle=c0==='#ffd84a'?'#e8702a':'#ffd84a';g.beginPath();g.arc(x,y-r*.3,r*.45,0,TAU);g.fill();}}
  else if(skin==='fair'){const cols=['#e8433a','#ffd84a','#2f6fd6','#3aa04a','#f47ab0'];
    for(const [f,hh] of[[.3,1],[.62,.85]]){const yy=y0+(y1-y0)*f;let a=x1,b=x0;for(const [x,y] of E)if(Math.abs(y-yy)<(y1-y0)*.25){a=Math.min(a,x);b=Math.max(b,x);}
      if(b-a<8*k){a=x0+(x1-x0)*.15;b=x1-(x1-x0)*.15;}a-=1.5*k;b+=1.5*k;const sag=(b-a)*.12,n=Math.max(3,Math.round((b-a)/(4.2*k*hh)));
      const P=t=>[a+(b-a)*t,yy+sag*4*t*(1-t)];g.strokeStyle='#5a3a22';g.lineWidth=.5*k;g.beginPath();for(let i=0;i<=20;i++){const q=P(i/20);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);}g.stroke();
      for(let i=0;i<n;i++){const t0=(i+.15)/n,t1=(i+.85)/n,p0=P(t0),p1=P(t1),m=P((t0+t1)/2);g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.lineTo(m[0],m[1]+3.2*k*hh);g.closePath();
        g.fillStyle=cols[(i+(f>.5?2:0))%cols.length];g.fill();g.strokeStyle='rgba(40,20,10,.5)';g.lineWidth=.3*k;g.stroke();}}}
  else if(skin==='gold'){const t=mkCanvas(W,H),tg=t.getContext('2d');tg.drawImage(c,0,0);tg.globalAlpha=.62;tg.globalCompositeOperation='color';tg.fillStyle='#e8b83a';tg.fillRect(0,0,W,H);
    tg.globalAlpha=1;tg.globalCompositeOperation='destination-in';tg.drawImage(c,0,0);g.clearRect(0,0,W,H);g.drawImage(t,0,0);
    g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,226,140,.1)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
    for(let i=0;i<5;i++){const [x,y]=E[Math.floor(R()*E.length)],r=(1.6+R()*1.4)*k;g.fillStyle='rgba(255,250,210,.95)';
      g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x,y,x+r*.35,y);g.quadraticCurveTo(x,y,x,y+r);g.quadraticCurveTo(x,y,x-r*.35,y);g.quadraticCurveTo(x,y,x,y-r);g.fill();
      g.beginPath();g.moveTo(x-r*.7,y);g.quadraticCurveTo(x,y,x,y-r*.25);g.quadraticCurveTo(x,y,x+r*.7,y);g.quadraticCurveTo(x,y,x,y+r*.25);g.closePath();g.fill();}}
  else if(skin==='night'){ // OB:META1 «Полуночный» — награда праздника hw26: лунная синева, серебро по кромкам, болотные огоньки
    const t=mkCanvas(W,H),tg=t.getContext('2d');tg.drawImage(c,0,0);tg.globalAlpha=.5;tg.globalCompositeOperation='color';tg.fillStyle='#4a4ab8';tg.fillRect(0,0,W,H);
    tg.globalAlpha=1;tg.globalCompositeOperation='destination-in';tg.drawImage(c,0,0);g.clearRect(0,0,W,H);g.drawImage(t,0,0);
    g.globalCompositeOperation='source-atop';g.fillStyle='rgba(20,16,60,.18)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
    g.fillStyle='rgba(220,230,255,.85)';for(const [x,y] of E.filter((p,i)=>i%2===0)){g.beginPath();g.arc(x,y,.75*k,0,TAU);g.fill();}
    for(let i=0;i<5;i++){const [x,y]=E[Math.floor(R()*E.length)],r=(1.3+R()*.8)*k,col=R()<.5?'#9aff8a':'#ffe27a';
      const gr=g.createRadialGradient(x,y-r*1.6,0,x,y-r*1.6,r*2.4);gr.addColorStop(0,col);gr.addColorStop(.35,col+'aa');gr.addColorStop(1,col+'00');g.fillStyle=gr;
      g.beginPath();g.arc(x,y-r*1.6,r*2.4,0,TAU);g.fill();g.fillStyle='#ffffff';g.beginPath();g.arc(x,y-r*1.6,r*.45,0,TAU);g.fill();}
    {const mx=x0+(x1-x0)*.86,my=y0+(y1-y0)*.1,mr=2.6*k;g.save();g.beginPath();g.arc(mx,my,mr,0,TAU);g.clip();   // месяц-серп (без стирания рисунка)
      g.fillStyle='#fff6c8';g.beginPath();g.rect(0,0,W,H);g.arc(mx+mr*.55,my-mr*.25,mr*.85,0,TAU);g.fill('evenodd');g.restore();}}
  else if(skin==='firebird'){ // покупка «Жар-птица» (js/pay.js): огненная перекраска с объёмом + языки пламени и перья на верхних кромках
    const t=mkCanvas(W,H),tg=t.getContext('2d');tg.drawImage(c,0,0);tg.globalAlpha=.48;tg.globalCompositeOperation='color';tg.fillStyle='#e8502a';tg.fillRect(0,0,W,H);
    tg.globalAlpha=1;tg.globalCompositeOperation='destination-in';tg.drawImage(c,0,0);g.clearRect(0,0,W,H);g.drawImage(t,0,0);
    g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,190,70,.14)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
    const F=E.filter((p,i)=>i%4===0);for(const [x,y] of F){const h=(2.4+R()*2.2)*k,w=(1+R()*.5)*k,lean=(R()-.5)*1.4*k;
      g.beginPath();g.moveTo(x-w,y+.3*k);g.quadraticCurveTo(x-w*.8+lean*.5,y-h*.55,x+lean,y-h);g.quadraticCurveTo(x+w*.8+lean*.5,y-h*.55,x+w,y+.3*k);g.closePath();
      g.fillStyle=R()<.5?'#ff8a1e':'#ffc531';g.fill();g.strokeStyle='rgba(150,40,10,.45)';g.lineWidth=.3*k;g.stroke();
      g.beginPath();g.moveTo(x-w*.45,y+.2*k);g.quadraticCurveTo(x+lean*.4,y-h*.5,x+w*.45,y+.2*k);g.closePath();g.fillStyle='#fff2a8';g.fill();}
    for(let i=0;i<6;i++){g.fillStyle='rgba(255,236,150,.95)';g.beginPath();g.arc(x0+R()*(x1-x0),y0+R()*(y1-y0)*.7,.5*k,0,TAU);g.fill();}}
  g.restore();return c;}

/* ================= украшения деревни (значки dc_*; они же — в картинке деревни) ================= */
art('dc_well',48,g=>{ell(g,0,16,15,4,'rgba(0,0,0,.2)',{ol:false,flat:true});
  ln(g,[-10,15,-10,-4],'#6a4222',2.6);ln(g,[-10,-4,16,-18],'#8a5a2e',2);ln(g,[-10,-4,-18,2],'#8a5a2e',2);ln(g,[14,-17,14,-2],'#5a3a22',.8);
  rrect(g,11,-3,6,6,1);g.fillStyle='#8a5a2e';g.fill();outline(g,'#8a5a2e',.6);
  woodWall(g,4,4,20,11,'#9a6a3a');ell(g,14,4,10,2.6,'#3a5a7a',{lw:.7});ell(g,-19,3,2.6,2.6,'#6a6f7a',{lw:.5});});
art('dc_flags',48,g=>{ln(g,[-19,16,-19,-14],'#6a4222',2);ln(g,[19,16,19,-14],'#6a4222',2);
  const cols=['#e8433a','#ffd84a','#2f6fd6','#3aa04a','#f47ab0'];for(const [yy,o] of[[-12,0],[0,2]]){const P=t=>[-19+38*t,yy+8*t*(1-t)*1.6];
    ln(g,[-19,yy,...P(.25),...P(.5),...P(.75),19,yy],'#5a3a22',.8);for(let i=0;i<6;i++){const p0=P((i+.15)/6),p1=P((i+.85)/6),m=P((i+.5)/6);poly(g,[p0[0],p0[1],p1[0],p1[1],m[0],m[1]+6],cols[(i+o)%5],{lw:.4});}}});
art('dc_kot',48,g=>{for(let x=-20;x<=16;x+=6){rrect(g,x,-2,5,18,1.5);g.fillStyle=grad(g,x+2,6,8,'#9a6a3a');g.fill();outline(g,'#9a6a3a',.6);}ln(g,[-21,4,22,4],'#6a4222',1.4);
  g.save();g.translate(1,-9);g.scale(.95,.95);ART.kot.fn(g);g.restore();});
art('dc_swing',48,g=>{ell(g,0,17,17,3.5,'rgba(0,0,0,.2)',{ol:false,flat:true});ln(g,[-16,17,-10,-17,-4,17],'#6a4222',2.4);ln(g,[16,17,10,-17,4,17],'#6a4222',2.4);ln(g,[-11,-15,11,-15],'#8a5a2e',2.6);
  ln(g,[-5,-15,-7,7],'#c8b088',.9);ln(g,[5,-15,3,7],'#c8b088',.9);rrect(g,-9,6,14,3,1);g.fillStyle='#c0392b';g.fill();outline(g,'#c0392b',.6);});
art('dc_carousel',48,g=>{ell(g,0,16,19,4,'rgba(0,0,0,.2)',{ol:false,flat:true});ln(g,[0,15,0,-14],'#8a5a2e',2.4);
  shp(g,'#e8433a',{},[-19,-24,19,-6],()=>{g.moveTo(-19,-8);g.lineTo(0,-24);g.lineTo(19,-8);g.quadraticCurveTo(0,-4,-19,-8);});for(const x of[-12,-4,4,12])ln(g,[0,-24,x*1.55,-7],'#fff0d0',1.4);flag(g,0,-23,'#ffd84a',6);
  const cols=['#ffd84a','#2f6fd6','#3aa04a'];[-13,0,13].forEach((x,i)=>{ln(g,[x,-7,x,6],'#e8e0cc',.8);ell(g,x,7,4.5,3.2,cols[i],{lw:.6});ell(g,x+3,4.5,1.8,1.8,cols[i],{lw:.5});});
  ell(g,0,14,17,3.5,'#b07a44',{lw:.7});});
art('dc_fire',48,g=>{ell(g,0,15,16,4,'rgba(0,0,0,.2)',{ol:false,flat:true});glow(g,0,2,20,'#ff9a3a','#fff6c8');
  for(const [a,b] of[[-12,14],[12,14],[-8,16]])ln(g,[a,b,-a*.1,4],'#6a4222',2.6);
  shp(g,'#ff7a2a',{hl:.5},[-9,-18,9,12],()=>{g.moveTo(-9,12);g.quadraticCurveTo(-11,0,-3,-8);g.quadraticCurveTo(-2,-2,0,-18);g.quadraticCurveTo(4,-6,6,-9);g.quadraticCurveTo(12,2,9,12);g.closePath();});
  shp(g,'#ffd84a',{hl:.5,ol:false},[-5,-8,5,12],()=>{g.moveTo(-5,12);g.quadraticCurveTo(-6,2,0,-8);g.quadraticCurveTo(6,2,5,12);g.closePath();});
  for(const [x,y] of[[-12,-14],[10,-18],[3,-22]]){g.beginPath();g.arc(x,y,1,0,TAU);g.fillStyle='#ffd84a';g.fill();}});

/* картинка «Твоя деревня» над постройками: небо, холм, построенное (крупнее с уровнем) и купленные украшения */
const VIL_POS={mint:[.16,.62],barn:[.31,.5],fair:[.47,.66],smith:[.64,.5],range:[.8,.64],herb:[.92,.46],wall:[.08,.42]};
const DECO_POS={well:[.22,.8],flags:[.5,.2],kot:[.72,.81],swing:[.38,.8],carousel:[.58,.79],fire:[.9,.8]};
/* картинка «твоя деревня»: все 7 построек на своих местах — купленные в цвете (крупнее с уровнем), остальные бледными силуэтами
   (цель видна глазами — аудит 14). an={id,q:0..1} — только что купленная постройка «вырастает» с искрами */
const VIL_GHOST={};
function vilGhost(key,px){const id=key+'@'+px;if(VIL_GHOST[id])return VIL_GHOST[id];const s=drawArt(key,px),c=mkCanvas(px,px),g=c.getContext('2d');
  g.drawImage(s,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgba(255,255,255,.42)';g.fillRect(0,0,px,px);return VIL_GHOST[id]=c;}
function drawVillage(cv,W,H,an){if(typeof visVillage==='function')return visVillage(cv,W,H,an);/* OB:VIS сцена деревни — js/vis.js */const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.height=H+'px';
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.lineJoin='round';g.lineCap='round';
  const sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#8ec9f0');sk.addColorStop(1,'#d8efff');g.fillStyle=sk;g.fillRect(0,0,W,H);
  g.fillStyle='#8fcf6a';g.beginPath();g.moveTo(0,H*.42);g.quadraticCurveTo(W*.3,H*.26,W*.6,H*.4);g.quadraticCurveTo(W*.85,H*.5,W,H*.36);g.lineTo(W,H);g.lineTo(0,H);g.fill();
  g.fillStyle='#6fb44e';g.beginPath();g.moveTo(0,H*.62);g.quadraticCurveTo(W*.5,H*.5,W,H*.64);g.lineTo(W,H);g.lineTo(0,H);g.fill();
  const put=(key,x,y,sz)=>artPut(g,key,x*W,y*H,sz,dpr);   // OB:FIX1 рисунок целиком
  const items=[];for(const b of BLD){const l=S.village[b.id]||0,p=VIL_POS[b.id]||[.5,.5];
    if(!l){const sz=.3*H,c=vilGhost(b.ic,Math.ceil(sz*dpr));items.push([p[1],null,p[0],sz,c]);continue;}
    let sz=(.26+.05*l)*H;if(an&&an.id===b.id){const q=an.q;sz*=q<.5?.4+q*1.5:1.15-.15*Math.min(1,(q-.5)*2);}items.push([p[1],b.ic,p[0],sz]);}
  for(const d of DECO)if(S.deco&&S.deco[d.id]&&d.id!=='flags'){const p=DECO_POS[d.id];items.push([p[1],'dc_'+d.id,p[0],.34*H]);}
  items.sort((a,b)=>a[0]-b[0]);for(const [y,key,x,sz,gh] of items){if(gh)g.drawImage(gh,x*W-sz/2,y*H-sz/2,sz,sz);else put(key,x,y,sz);}
  if(an&&an.id){const p=VIL_POS[an.id]||[.5,.5],cx=p[0]*W,cy=p[1]*H,q=an.q;
    // искры и пыль вокруг новой постройки
    for(let i=0;i<14;i++){const a=i/14*TAU+i,d=(12+q*H*.28)*(.6+(i%3)*.2),al=Math.max(0,1-q*1.1);g.globalAlpha=al;g.fillStyle=i%3?'#ffd84a':'#fff4c0';g.beginPath();g.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.6-q*10,2.4-q*1.4+(i%2),0,TAU);g.fill();}
    g.globalAlpha=Math.max(0,Math.min(1,(1-q)*2.5));if(an.txt){g.font='900 15px system-ui,sans-serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='rgba(40,25,10,.8)';const ty=Math.max(18,cy-H*.24-q*12),hw=g.measureText(an.txt).width/2+8,tx=Math.min(W-hw,Math.max(hw,cx));g.strokeText(an.txt,tx,ty);g.fillStyle='#ffe7a0';g.fillText(an.txt,tx,ty);}
    g.globalAlpha=1;}
  if(S.deco&&S.deco.flags){const cols=['#e8433a','#ffd84a','#2f6fd6','#3aa04a','#f47ab0'],y0=H*.12,n=Math.round(W/22);g.strokeStyle='#5a3a22';g.lineWidth=1;
    const P=t=>[W*t,y0+H*.12*4*t*(1-t)];g.beginPath();for(let i=0;i<=24;i++){const q=P(i/24);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);}g.stroke();
    for(let i=0;i<n;i++){const p0=P((i+.15)/n),p1=P((i+.85)/n),m=P((i+.5)/n);g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.lineTo(m[0],m[1]+9);g.closePath();g.fillStyle=cols[i%5];g.fill();}}
  if(!BLD.some(b=>S.village[b.id])){g.fillStyle='rgba(40,30,20,.6)';g.font='600 14px sans-serif';g.textAlign='center';g.fillText(Lg('Пока пусто — построй первый дом!','Empty for now — build your first house!'),W/2,H*.93);}}
