'use strict';
/* ================= Графика: гладкие «мультяшные» спрайты (градиенты, мягкий контур, блики) =================
   art(key,size,fn) — регистрирует рисунок; fn рисует в мировых единицах, центр (0,0).
   buildSprites(k) — отрисовывает всё в холсты с плотностью k (= зум × devicePixelRatio), поэтому картинка чёткая. */
const ART={},SPR={};let SPR_K=1;
function art(key,size,fn){ART[key]={size,fn};}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
// перекраска готового рисунка (смена цвета с сохранением объёма)
function artTint(key,base,col){ART[key]={size:ART[base].size,base,tint:col};}
function tintCanvas(c,col){const t=mkCanvas(c.width,c.height),g=t.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='color';g.fillStyle=col;g.fillRect(0,0,t.width,t.height);
  g.globalCompositeOperation='destination-in';g.drawImage(c,0,0);return t;}
function drawArt(key,px){const a=ART[key],k=px/a.size,c=mkCanvas(px,px),g=c.getContext('2d');
  if(a.tint)return tintCanvas(drawArt(a.base,px),a.tint);g.setTransform(k,0,0,k,px/2,px/2);g.lineJoin='round';g.lineCap='round';a.fn(g);return c;}
// спрайты рисуются лениво — при первом показе (быстрый старт; иконки меню hp_* и прочее ненужное в бою не лежат в памяти);
// «вспышка» при попадании (f) — тоже при первом попадании по этому виду
function buildSprites(k){SPR_K=k;for(const key in SPR)delete SPR[key];}
function spr(key){let s=SPR[key];if(s)return s;const a=ART[key];if(!a)return null;return SPR[key]={c:drawArt(key,Math.ceil(a.size*SPR_K)),f:null,s:a.size};}
function sprF(s){if(!s.f){const c=s.c,f=mkCanvas(c.width,c.height),fg=f.getContext('2d');fg.drawImage(c,0,0);fg.globalCompositeOperation='source-atop';fg.fillStyle='rgba(255,255,255,.55)';fg.fillRect(0,0,f.width,f.height);s.f=f;}return s.f;}
const ICONS={};
function iconURL(key,px){px=px||96;const id=key+'@'+px;if(ICONS[id])return ICONS[id];const a=ART[key];if(!a)return '';
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
for(const id in HERO_ART){for(const f of[0,1])art('h_'+id+'_'+f,80,g=>drawHero(g,HERO_ART[id],f));art('hp_'+id,66,g=>{g.translate(0,3);drawHero(g,HERO_ART[id],0);});}

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
/* ---------- находки на поле (v13): пенёк и колода ломаются, внутри трава/каравай/горшок; золотой сундук — с босса ---------- */
artTint('chest_g','chest','#ffc21a');
art('pen',40,g=>{glow(g,0,0,20,'#9aff6a','rgba(255,255,255,.6)');ell(g,2,9,14,6,'rgba(0,0,0,.18)',{ol:false,flat:true});
  shp(g,'#7a5230',{},[-12,-6,12,10],()=>{g.moveTo(-12,-2);g.lineTo(-13,8);g.quadraticCurveTo(0,13,13,8);g.lineTo(12,-2);g.closePath();});
  ell(g,0,-3,12,6,'#d8b27a');g.strokeStyle='rgba(120,70,30,.6)';g.lineWidth=.9;for(const r of[3,6.5,9]){g.beginPath();g.ellipse(0,-3,r,r*.5,0,0,TAU);g.stroke();}
  ln(g,[-9,-9,-12,-15],'#6a8a2a',1.6);ell(g,-12,-15,2.2,1.4,'#8ad04a',{ol:false,rot:-.6});ln(g,[-2,1,3,-4,6,0],'#3a2410',1.2);});
art('kol',40,g=>{glow(g,0,0,20,'#ffd84a','rgba(255,255,255,.6)');ell(g,2,10,14,5,'rgba(0,0,0,.18)',{ol:false,flat:true});
  rrect(g,-12,-7,24,17,3);g.fillStyle=grad(g,0,2,14,'#8a5a2e');g.fill();outline(g,'#8a5a2e',1.3);
  for(const y of[-2,4])ln(g,[-12,y,12,y],'rgba(60,30,10,.55)',1);for(const x of[-8,8]){rrect(g,x-1.6,-7,3.2,17,1);g.fillStyle='#7a7f8a';g.fill();}
  rrect(g,-3,-5,6,5,1.2);g.fillStyle='#c9ced8';g.fill();ln(g,[-11,-6,11,-6],'rgba(255,230,180,.35)',1);});
// Разрыв-трава (красный папоротник-цвет), Сон-трава (сиреневые колокольчики), каравай, горшок золота
art('f_rtr',28,g=>{glow(g,0,-2,13,'#ff6a4a');ln(g,[0,11,0,-2],'#3f8a2a',1.6);for(const s of[-1,1]){shp(g,'#4ab83a',{ol:false},[-9,-2,9,10],()=>{g.moveTo(0,8);g.quadraticCurveTo(s*9,6,s*9,-1);g.quadraticCurveTo(s*4,3,0,8);});}
  for(let i=0;i<5;i++){const a=i/5*TAU-Math.PI/2;ell(g,Math.cos(a)*4.2,-4+Math.sin(a)*4.2,3.4,2.2,'#ff4a3a',{rot:a,hl:.6,lw:.6});}ell(g,0,-4,2.2,2.2,'#ffe14a',{lw:.5});});
art('f_str',28,g=>{glow(g,0,-2,13,'#a88aff');ln(g,[0,11,0,-6],'#3f8a5a',1.6);ln(g,[0,2,-6,-3],'#3f8a5a',1.2);ln(g,[0,0,6,-5],'#3f8a5a',1.2);
  for(const [x,y] of[[0,-7],[-6,-3],[6,-5]]){shp(g,'#8a6aff',{hl:.6,lw:.6},[x-3.4,y-3,x+3.4,y+4],()=>{g.moveTo(x-3.4,y+3);g.quadraticCurveTo(x-3.6,y-3.4,x,y-3.4);g.quadraticCurveTo(x+3.6,y-3.4,x+3.4,y+3);g.quadraticCurveTo(x,y+1.6,x-3.4,y+3);});}
  g.fillStyle='#fff';g.font='900 6px sans-serif';g.textAlign='center';g.fillText('z',8,-10);});
art('loaf',30,g=>{glow(g,0,0,14,'#ffd88a');ell(g,1,8,12,3.5,'rgba(0,0,0,.18)',{ol:false,flat:true});ell(g,0,1,12,8.5,'#d88a3a',{hl:.55});
  g.strokeStyle='rgba(120,60,20,.55)';g.lineWidth=1;for(const x of[-5,0,5]){g.beginPath();g.moveTo(x-2,-4);g.quadraticCurveTo(x,0,x+2,5);g.stroke();}
  ell(g,0,-4,3,1.8,'#f4f1ea',{ol:false});ell(g,0,-5,1.4,.9,'#ffffff',{ol:false});shine(g,-5,-3,3,1.5,.45);});
art('pot',30,g=>{glow(g,0,-2,15,'#ffd84a');for(const [x,y] of[[-4,-8],[1,-10],[5,-7],[-1,-6]])ell(g,x,y,3,3,'#f5c33a',{hl:.7,lw:.5});
  shp(g,'#5a4a6a',{},[-11,-6,11,11],()=>{g.moveTo(-9,-5);g.quadraticCurveTo(-13,4,-7,10);g.lineTo(7,10);g.quadraticCurveTo(13,4,9,-5);g.closePath();});
  rrect(g,-10,-7,20,3.5,1.5);g.fillStyle='#7a6a8a';g.fill();shine(g,-5,0,2,4,.3);});
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

/* ================= иконки умений ================= */
art('i_sword',40,g=>{g.rotate(-.78);ln(g,[0,-17,0,8],'#dce4ee',5);ln(g,[0,-17,0,8],'#ffffff',1.4);poly(g,[-2.5,-17,2.5,-17,0,-21],'#dce4ee');
  rrect(g,-8,8,16,3.4,1.6);g.fillStyle='#e6b53a';g.fill();ln(g,[0,12,0,18],'#7a4a22',3.4);ell(g,0,19.5,2.6,2.6,'#e6b53a');});
art('i_bow',40,g=>{g.beginPath();g.arc(-6,0,17,-1.15,1.15);g.lineWidth=3.4;g.strokeStyle='#8a5a2e';g.stroke();ln(g,[1.2,-15.5,1.2,15.5],'#f0e6d0',1);
  g.save();g.translate(4,0);ART.arrow.fn(g);g.restore();});
art('i_fire',40,g=>{glow(g,0,2,19,'#ff8a1a');shp(g,'#ff5a1a',{hl:.7},[-9,-17,9,14],()=>{g.moveTo(0,14);g.quadraticCurveTo(-11,6,-6,-6);g.quadraticCurveTo(-4,0,-1,-2);
    g.quadraticCurveTo(-4,-12,3,-17);g.quadraticCurveTo(2,-8,7,-4);g.quadraticCurveTo(12,8,0,14);});ell(g,0,6,4,5,'#ffe56a',{ol:false});});
art('i_gusli',40,g=>{shp(g,'#c8843a',{},[-16,-10,16,12],()=>{g.moveTo(-16,10);g.lineTo(16,10);g.lineTo(12,-6);g.quadraticCurveTo(0,-14,-12,-8);g.closePath();});
  for(let i=0;i<5;i++)ln(g,[-11+i*5,8,-9+i*5,-6+Math.abs(i-2)],'#fff3c8',.8);ell(g,0,3,3,3,'#5a2a0a',{ol:false,flat:true});
  g.strokeStyle='#ffd84a';g.lineWidth=1.4;for(const r of[20,16]){g.beginPath();g.arc(0,0,r,-.9,-.3);g.stroke();g.beginPath();g.arc(0,0,r,Math.PI+.3,Math.PI+.9);g.stroke();}});
art('i_perun',40,g=>{glow(g,0,0,19,'#8ad8ff');poly(g,[3,-18,-8,2,0,2,-4,18,9,-4,1,-4,6,-18],'#fff36a',{hl:.7,olc:'#c8a000'});});
art('i_water',40,g=>{g.save();g.scale(1.5,1.5);ART.flask.fn(g);g.restore();});
art('i_kolo',40,g=>{g.save();g.scale(1.15,1.15);ART.kolo.fn(g);g.restore();});
art('i_axe',40,g=>{g.save();g.rotate(.3);ART.axe.fn(g);g.restore();});
art('i_mace',40,g=>{ln(g,[-12,14,4,-2],'#7a4a22',3);g.save();g.translate(5,-4);g.scale(.8,.8);ART.mace.fn(g);g.restore();});
art('p_apple',40,g=>{ell(g,0,3,12,11,'#e0332a',{hl:.55});ln(g,[0,-7,2,-14],'#6a4020',2);shp(g,'#4fb04a',{},[2,-16,12,-8],()=>{g.moveTo(2,-11);g.quadraticCurveTo(8,-18,12,-12);g.quadraticCurveTo(7,-8,2,-11);});shine(g,-5,-2,3.5,2,.55);});
art('p_mail',40,g=>{shp(g,'#aab4c2',{},[-14,-14,14,16],()=>{g.moveTo(-8,-14);g.lineTo(8,-14);g.lineTo(14,-8);g.lineTo(12,16);g.lineTo(-12,16);g.lineTo(-14,-8);g.closePath();});
  g.strokeStyle='rgba(60,70,90,.55)';g.lineWidth=.9;for(let y=-10;y<15;y+=3.4)for(let x=-11;x<12;x+=3.4){g.beginPath();g.arc(x+(Math.round(y/3.4)%2?1.7:0),y,1.5,0,Math.PI);g.stroke();}});
art('p_boots',40,g=>{shp(g,'#c0392b',{},[-10,-16,16,14],()=>{g.moveTo(-8,-16);g.lineTo(4,-16);g.lineTo(4,4);g.quadraticCurveTo(16,4,16,12);g.lineTo(-10,14);g.closePath();});
  ln(g,[-8,-12,4,-12],'#e6b53a',2);for(const y of[2,8])ln(g,[-16,y,-11,y],'rgba(255,255,255,.7)',1.6);});
art('p_ball',40,g=>{g.save();g.scale(1.5,1.5);ART.yarn.fn(g);g.restore();});
art('p_ring',40,g=>{g.beginPath();g.ellipse(0,5,11,9,0,0,TAU);g.lineWidth=4.4;g.strokeStyle='#e6b53a';g.stroke();g.lineWidth=1.2;g.strokeStyle='#fff0a8';g.stroke();
  poly(g,[-6,-6,6,-6,9,-10,0,-17,-9,-10],'#e0336a',{hl:.7});});
art('p_livew',40,g=>{g.save();g.scale(1.5,1.5);ART.flaskB.fn(g);g.restore();});
art('p_cloth',40,g=>{poly(g,[-16,-6,16,-10,14,12,-14,14],'#f4efe2',{hl:.2});g.strokeStyle='#d8313d';g.lineWidth=1.6;g.beginPath();g.moveTo(-13,-2);g.lineTo(13,-6);g.moveTo(-12,10);g.lineTo(12,8);g.stroke();
  ell(g,-3,2,5,3.4,'#d8903a');ell(g,6,1,3.4,3,'#e0332a');});
art('p_comb',40,g=>{rrect(g,-15,-10,30,8,3);g.fillStyle=grad(g,0,-6,15,'#e6b53a');g.fill();outline(g,'#e6b53a',1);for(let x=-13;x<=13;x+=3.3)ln(g,[x,-2,x,12],'#d8a830',2);});
art('p_amulet',40,g=>{ln(g,[-10,-16,0,-6,10,-16],'#8a5a2e',1.4);ell(g,0,4,11,11,'#e6b53a',{hl:.6});ell(g,0,4,6,6,'#2f9aef');
  g.strokeStyle='#fff3b8';g.lineWidth=1;for(let i=0;i<8;i++){const a=i/8*TAU;g.beginPath();g.moveTo(Math.cos(a)*7,4+Math.sin(a)*7);g.lineTo(Math.cos(a)*10,4+Math.sin(a)*10);g.stroke();}});
art('p_quiver',40,g=>{g.rotate(.35);rrect(g,-7,-8,14,24,4);g.fillStyle=grad(g,0,4,12,'#8a5a2e');g.fill();outline(g,'#8a5a2e',1.2);
  for(const x of[-4,0,4]){ln(g,[x,-8,x,-16],'#8a5a2e',1.2);poly(g,[x,-20,x-2,-15,x+2,-15],'#e8433a',{ol:false,flat:true});}});
art('p_coin',40,g=>{g.save();g.scale(2,2);ART.coin.fn(g);g.restore();});

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

/* ================= значки эволюций: оружие в золотом сиянии ================= */
for(const id of['sword','bow','mace','fire','gusli','perun','kolo','axe','water']){const ik={sword:'i_sword',bow:'i_bow',mace:'i_mace',fire:'i_fire',gusli:'i_gusli',perun:'i_perun',kolo:'i_kolo',axe:'i_axe',water:'i_water'}[id];
  art('e_'+id,48,g=>{glow(g,0,0,24,'#ffd84a','#fff8d0');g.strokeStyle='#ffd84a';g.lineWidth=1.6;for(let i=0;i<10;i++){const a=i/10*TAU;g.beginPath();g.moveTo(Math.cos(a)*16,Math.sin(a)*16);g.lineTo(Math.cos(a)*22,Math.sin(a)*22);g.stroke();}
    g.save();g.scale(1.05,1.05);ART[ik].fn(g);g.restore();});}
