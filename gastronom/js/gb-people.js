'use strict';
/* ================= GBP — гости «Гастронома» обликом из родных игр (поток ART, 10.10.2026) =================
   Правило владельца 09.10: один герой = один облик во всех играх (реестр ~/Brain/hobby/characters.md). Новых героев не рисуем.
   Откуда взят каждый (код рисования перенесён как есть, здесь — только рамка 200×220 и настроения):
     valya, revizor — РОДНЫЕ: drawPerson(g,'valya'|'revizor',…) из index.html (тот же код, вызов напрямую; бусы/значок Вали — как в игре);
     zina     — «Баба Зина» (slovo js/text.js zinaSVG; сборка-образец viktorina js/look-zina.js ZINA_ART);
     mityai   — «Рыбалка с Петровичем» (rybak js/mg-art.js mit(); образец viktorina js/look-kin.js);
     mihalych, kolya, valerka — «Дворовая викторина» (viktorina js/look.js NEW.* + bustInner, без контура темы);
     tolik    — «Покер» (holdem index.html LOOK.tolik + headSvg);
     galya, semyon — «Баба Зина», соседки по подъезду (slovo js/sosedki.js SOS_FACE_RAW: «Галя с третьего», «Дед Семён»);
     mama     — «Мама с малышом» (покупательница «без очереди» вместо ветерана, решение владельца 10.10): drawPerson 'mama' из js/gb-mama.js; не в GBP.ids (не гость).
     plombir  — наш кот из обстановки (index.html drawCat, предмет DECOR 'cat') — рисунок в js/gb-plombir.js (PLOMBIR).
   ДОГОВОР:
     GBP.ids                    — список id;  GBP.name(id) — имя (L('рус','eng'));
     GBP.bust(id, mood)         — svg-строка по пояс, viewBox 0 0 200 220, без фона; mood: norm|happy|sad|wow (иное → norm);
     GBP.face(id, cls)          — svg-строка «голова» для значка (класс 'gbp-face'+cls);
     GBP.say(id, text, o)       — html: герой + облачко (o.mood, o.side:'r' — герой справа, o.cls); текст — уже готовый html;
     GBP.img(id, mood, cb)      — Image для холста (мини-игры): вернёт картинку, когда загружена (иначе null и cb(img) позже);
     GBP.draw(g, id, mood, x, y, w, h) — нарисовать в холст в прямоугольник (если картинка готова; вернёт true/false).
   Флаг: GB.flag('art') — выключен → GBP всё равно отдаёт рисунки (это облик, а не новинка); выключение — на стороне потребителя. */
(function(){
var N=0;
function Lx(ru,en){try{return L(ru,en);}catch(e){return ru;}}
var NAMES={valya:['Тётя Валя','Aunt Valya'],zina:['Баба Зина','Granny Zina'],mihalych:['Михалыч','Mikhalych'],kolya:['Дядя Коля','Uncle Kolya'],
 tolik:['Толик','Tolik'],mityai:['Дед Митяй','Grandpa Mityai'],galya:['Галя с третьего','Galya from the 3rd floor'],semyon:['Дед Семён','Grandpa Semyon'],
 valerka:['Валерка','Valerka'],revizor:['Ревизор','The Inspector'],plombir:['Пломбир','Plombir'],mama:['Мама с малышом','Mom with a baby']};
var IDS=['valya','zina','mihalych','kolya','tolik','mityai','galya','semyon','valerka','revizor','plombir'];
function md(m){return m==='happy'||m==='sad'||m==='wow'?m:'norm';}

/* ---------- холст → картинка внутри svg (Валя, Ревизор — родной drawPerson; Митяй — mit из «Рыбалки»; Пломбир) ---------- */
var URL={};
function canv(){var c=document.createElement('canvas');c.width=400;c.height=440;return c;}
function decKey(){try{return (hasDecor('beads')?'b':'')+(hasDecor('q_badge')?'q':'');}catch(e){return '';}}
// грусть поверх drawPerson (в «Гастрономе» mood<0 — сердитая): брови домиком, уголки рта вниз — в его же цветах (как viktorina look-kin)
function sadOver(g,u,tk,lip){var hy=262+Math.sin(tk*2+100*.01)*1.2*u-60*u,ey=hy-u,my=hy+11*u;g.save();g.lineCap='round';g.strokeStyle=SKIN;g.lineWidth=3.4*u;
 g.beginPath();g.moveTo(100-4.5*u,my);g.quadraticCurveTo(100,my+2.5*u,100+4.5*u,my);g.stroke();
 g.beginPath();g.moveTo(100-9.5*u,ey-6.5*u);g.lineTo(100-4*u,ey-7*u);g.moveTo(100+9.5*u,ey-6.5*u);g.lineTo(100+4*u,ey-7*u);g.stroke();
 g.strokeStyle='rgba(60,40,30,.6)';g.lineWidth=1.4*u;g.beginPath();g.moveTo(100-10*u,ey-5.5*u);g.lineTo(100-4*u,ey-8*u);g.moveTo(100+10*u,ey-5.5*u);g.lineTo(100+4*u,ey-8*u);g.stroke();
 g.strokeStyle=lip;g.lineWidth=2*u;g.beginPath();g.arc(100,my+4*u,5*u,Math.PI*1.2,Math.PI*1.8);g.stroke();g.restore();}
function rasterKey(id,m){return id+':'+m+(id==='valya'?':'+decKey():'');}
function raster(id,m){var k=rasterKey(id,m);if(URL[k])return URL[k];var c=canv(),g=c.getContext('2d');if(!g)return '';g.scale(2,2);
 try{
  if(id==='valya'||id==='revizor'||id==='mama'){var u=2.7,tk=.05;drawPerson(g,id,100,262,u*100,m==='happy'?1:0,tk,m==='wow'?1:0);
   if(m==='sad')sadOver(g,u,tk,id==='valya'?'#c0392b':id==='mama'?'#c2524a':'#7a3b2e');}
  else if(id==='mityai'){var x=100,y=100+86*3.6;RY.mit(g,x,y,360,0,{bust:true,face:m==='happy'?'smile':'norm'});
   if(m==='sad'||m==='wow'){g.save();g.translate(x,y);g.scale(3.6,3.6);g.translate(0,-86);g.lineCap='round';
    g.strokeStyle='#e6b892';g.lineWidth=3.2;g.beginPath();g.moveTo(-8,-6);g.quadraticCurveTo(-5,-7.6,-2,-6);g.moveTo(2,-6);g.quadraticCurveTo(5,-7.6,8,-6);g.stroke();
    g.strokeStyle='#f1f1ec';g.lineWidth=2;g.beginPath();
    if(m==='sad'){g.moveTo(-8,-5.6);g.lineTo(-2.2,-8);g.moveTo(8,-5.6);g.lineTo(2.2,-8);}
    else{g.moveTo(-8,-8);g.quadraticCurveTo(-5,-10,-2,-8.4);g.moveTo(2,-8.4);g.quadraticCurveTo(5,-10,8,-8);}
    g.stroke();if(m==='wow'){g.fillStyle='#6b2a22';RY.el(g,.4,10.4,1.9,2.4);g.fill();}g.restore();}}
  else if(id==='plombir'){if(!window.PLOMBIR)return '';PLOMBIR.bust(g,m);}
 }catch(e){try{console.error('[GBP] '+id,e);}catch(x){}return '';}
 try{return URL[k]=c.toDataURL('image/png');}catch(e){return '';}}
function imgTag(id,m){var u=raster(id,m);return u?'<image href="'+u+'" x="0" y="0" width="200" height="220"/>':'';}

/* ---------- дед Митяй — «Рыбалка» (rybak js/mg-art.js mit, как есть) ---------- */
var RY=(function(){
var PI=Math.PI;
function el(g,x,y,rx,ry,r){g.beginPath();g.ellipse(x,y,Math.abs(rx),Math.abs(ry),r||0,0,PI*2);}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath();}
function lg(g,x0,y0,x1,y1,st){var gr=g.createLinearGradient(x0,y0,x1,y1);for(var i=0;i<st.length;i+=2)gr.addColorStop(st[i],st[i+1]);return gr;}
function rg(g,x,y,r0,r1,st){var gr=g.createRadialGradient(x,y,r0,x,y,r1);for(var i=0;i<st.length;i+=2)gr.addColorStop(st[i],st[i+1]);return gr;}
function blink(t,ph){var c=(t+ph)%4.3;return c<.12?1-Math.abs(c-.06)/.06:0;}
function shade(night,c,k){return night?mix(c,'#1b2440',k||.45):c;}
function hx(c){c=c.replace('#','');if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];var n=parseInt(c,16);return [n>>16&255,n>>8&255,n&255];}
function mix(a,b,k){var x=hx(a),y=hx(b);return 'rgb('+Math.round(x[0]+(y[0]-x[0])*k)+','+Math.round(x[1]+(y[1]-x[1])*k)+','+Math.round(x[2]+(y[2]-x[2])*k)+')';}
function mit(g,x,y,s,t,o){o=o||{};var k=s/100,N=!!o.night,face=o.face||'smile';
  var C={shirt:shade(N,'#7b8c5a'),shirtD:shade(N,'#5d6b42'),skin:shade(N,'#e6b892',.35),skinD:shade(N,'#c99572',.35),beard:shade(N,'#f1f1ec',.3),cap:shade(N,'#3d4752'),capD:shade(N,'#28303a'),pants:shade(N,'#4b4036'),boot:shade(N,'#2a2420')};
  g.save();g.translate(x,y);g.scale(k,k);
  if(!o.bust){g.fillStyle='rgba(0,0,0,.2)';el(g,0,0,22,4.5);g.fill();
    g.fillStyle=C.pants;rr(g,-11,-40,10,36,4);g.fill();rr(g,1,-40,10,36,4);g.fill();g.fillStyle=C.boot;rr(g,-13,-7,13,7,3);g.fill();rr(g,0,-7,13,7,3);g.fill();
    g.strokeStyle=shade(N,'#8a6a42');g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(-26,0);g.lineTo(-22,-56);g.stroke();g.beginPath();g.arc(-19,-56,3.4,PI,PI*1.9);g.stroke();}
  var br=Math.sin(t*1.5)*.6;
  g.fillStyle=lg(g,-18,0,18,0,[0,C.shirtD,.4,C.shirt,1,C.shirtD]);g.beginPath();g.moveTo(-17,-36);g.quadraticCurveTo(-20,-58,-16,-70+br);g.quadraticCurveTo(0,-76,16,-70+br);g.quadraticCurveTo(20,-58,17,-36);g.quadraticCurveTo(0,-32,-17,-36);g.fill();
  g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=1;g.beginPath();g.moveTo(-17,-44);g.quadraticCurveTo(0,-41,17,-44);g.stroke();
  g.strokeStyle=shade(N,'#b8402e');g.lineWidth=2.2;g.beginPath();g.moveTo(-17,-43);g.quadraticCurveTo(0,-40,17,-43);g.stroke();
  if(!o.bust){g.strokeStyle=C.shirt;g.lineWidth=8.5;g.lineCap='round';g.beginPath();g.moveTo(-15,-66);g.quadraticCurveTo(-24,-60,-22,-52);g.stroke();g.fillStyle=C.skin;el(g,-22,-54,4,4.2);g.fill();
    if(o.arm==='point'){g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(28,-72,36,-80);g.stroke();g.fillStyle=C.skin;el(g,37,-81,4,4.2);g.fill();}
    else{g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(22,-54,19,-42);g.stroke();g.fillStyle=C.skin;el(g,19,-41,4,4.2);g.fill();}}
  else if(o.arm==='point'){g.strokeStyle=C.shirt;g.lineWidth=8.5;g.lineCap='round';g.beginPath();g.moveTo(15,-66);g.quadraticCurveTo(26,-74,30,-84);g.stroke();g.fillStyle=C.skin;el(g,31,-86,4,4.4);g.fill();g.strokeStyle=C.skin;g.lineWidth=2.4;g.beginPath();g.moveTo(32,-89);g.lineTo(34,-95);g.stroke();}
  g.save();g.translate(0,-86+br*.3);g.rotate(Math.sin(t*.8)*.03);
  g.fillStyle=C.skinD;el(g,-11.6,0,2.8,3.8);g.fill();el(g,11.6,0,2.8,3.8);g.fill();
  g.fillStyle=rg(g,-3,-3,2,15,[0,mix(C.skin,'#fff',.12),1,C.skin]);el(g,0,0,11.5,13);g.fill();
  g.fillStyle=lg(g,0,2,0,26,[0,C.beard,1,mix(C.beard,'#b9b9b0',.5)]);g.beginPath();g.moveTo(-11,1);g.bezierCurveTo(-13,14,-7,26,0,28);g.bezierCurveTo(7,26,13,14,11,1);g.bezierCurveTo(6,8,-6,8,-11,1);g.fill();
  g.strokeStyle='rgba(150,150,140,.5)';g.lineWidth=.7;for(var i=-2;i<=2;i++){g.beginPath();g.moveTo(i*3,10);g.quadraticCurveTo(i*3.4,18,i*2,25);g.stroke();}
  g.fillStyle=C.beard;g.beginPath();g.moveTo(.4,4.5);g.bezierCurveTo(-4,3.6,-8,5,-8.5,8.2);g.bezierCurveTo(-5,7.4,-2,7.6,.4,7);g.bezierCurveTo(3,7.6,6,7.4,9,8.2);g.bezierCurveTo(8,5,4,3.6,.4,4.5);g.fill();
  g.fillStyle=shade(N,'#e09484',.35);el(g,.4,2.6,2.8,3.2);g.fill();
  var bl=blink(t,2.4);g.strokeStyle=shade(N,'#2a211b');g.lineWidth=1.3;g.lineCap='round';
  if(bl>.5||face==='smile'){g.beginPath();g.arc(-4.6,-1.5,2.2,PI*1.15,PI*1.85);g.stroke();g.beginPath();g.arc(4.6,-1.5,2.2,PI*1.15,PI*1.85);g.stroke();}
  else{g.fillStyle=shade(N,'#2a211b');el(g,-4.6,-1.6,1.4,1.7);g.fill();el(g,4.6,-1.6,1.4,1.7);g.fill();}
  g.strokeStyle=shade(N,'#8a7a5a');g.lineWidth=1;el(g,-4.6,-1.6,3.6,3.2);g.stroke();el(g,4.6,-1.6,3.6,3.2);g.stroke();g.beginPath();g.moveTo(-1,-1.8);g.lineTo(1,-1.8);g.stroke();
  g.strokeStyle=C.beard;g.lineWidth=2;g.beginPath();g.moveTo(-8,-6);g.quadraticCurveTo(-5,-7.6,-2,-6);g.moveTo(2,-6);g.quadraticCurveTo(5,-7.6,8,-6);g.stroke();
  g.fillStyle=lg(g,0,-19,0,-6,[0,mix(C.cap,'#fff',.1),1,C.cap]);g.beginPath();g.moveTo(-12.5,-6.5);g.lineTo(-13.5,-15);g.quadraticCurveTo(0,-21,13.5,-15);g.lineTo(12.5,-6.5);g.quadraticCurveTo(0,-9,-12.5,-6.5);g.fill();
  g.fillStyle=C.capD;g.beginPath();g.moveTo(-11.5,-7);g.quadraticCurveTo(-2,-1,9,-6.6);g.quadraticCurveTo(-1,-4.6,-11.5,-7);g.fill();g.fillStyle=shade(N,'#1f252c');g.fillRect(-12.8,-9.4,25.6,2);
  g.restore();g.restore();}
return {mit:mit,el:el};
})();

/* ---------- баба Зина — «Баба Зина» (slovo zinaSVG; рамка и настроения — как viktorina look-zina.js) ---------- */
function zina(m){var u='gz'+(++N),B='#8d8f99';
 var eyes=m==='happy'
  ?'<path d="M75 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M109 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.2" fill="none" stroke-linecap="round"/>'
  :m==='wow'
  ?'<circle cx="83" cy="95" r="5.2" fill="#3a2a22"/><circle cx="117" cy="95" r="5.2" fill="#3a2a22"/><circle cx="84.5" cy="93.5" r="1.6" fill="#fff"/><circle cx="118.5" cy="93.5" r="1.6" fill="#fff"/>'
  :'<ellipse cx="83" cy="'+(m==='sad'?97:96)+'" rx="4" ry="'+(m==='sad'?3.8:4.6)+'" fill="#3a2a22"/><ellipse cx="117" cy="'+(m==='sad'?97:96)+'" rx="4" ry="'+(m==='sad'?3.8:4.6)+'" fill="#3a2a22"/><circle cx="84.3" cy="94.4" r="1.3" fill="#fff"/><circle cx="118.3" cy="94.4" r="1.3" fill="#fff"/>';
 var brows=m==='wow'
  ?'<path d="M72 78 q10 -7 20 -1" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M108 77 q10 -6 20 1" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='sad'
  ?'<path d="M72 85 q10 -1 20 -8" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M128 85 q-10 -1 -20 -8" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :'<path d="M72 83 q10 -5 20 0" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M108 83 q10 -5 20 0" stroke="'+B+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
 var mouth=m==='wow'
  ?'<ellipse cx="100" cy="126" rx="7" ry="8" fill="#b83b44"/><ellipse cx="100" cy="129" rx="4" ry="3.5" fill="#e0707a"/>'
  :m==='sad'?'<path d="M88 128 q12 -9 24 0" stroke="#b83b44" stroke-width="4.2" fill="none" stroke-linecap="round"/>'
  :m==='happy'?'<path d="M84 119 q16 19 32 0 q-16 6 -32 0z" fill="#b83b44"/><path d="M89 123 q11 6 22 0" fill="#fff" opacity=".9"/>'
  :'<path d="M86 121 q14 13 28 0" stroke="#b83b44" stroke-width="4.2" fill="none" stroke-linecap="round"/>';
 var beads='';for(var i=0;i<9;i++){var a=Math.PI*(.15+.7*i/8);beads+='<circle cx="'+(100-Math.cos(a)*30).toFixed(1)+'" cy="'+(150+Math.sin(a)*14).toFixed(1)+'" r="4.2"/>';}
 return '<defs><radialGradient id="zf'+u+'" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe2cc"/><stop offset="1" stop-color="#f2bf9b"/></radialGradient>'+
  '<linearGradient id="zh'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0f5"/><stop offset="1" stop-color="#b9bfcc"/></linearGradient>'+
  '<linearGradient id="zc'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a64b8"/><stop offset="1" stop-color="#6f3f8c"/></linearGradient></defs>'+
  '<path d="M28 200 q4 -46 44 -54 h56 q40 8 44 54z" fill="url(#zc'+u+')"/>'+
  '<path d="M84 146 l16 22 l16 -22z" fill="#fff"/><path d="M84 146 l-8 12 l14 8z M116 146 l8 12 l-14 8z" fill="#f4f1fa"/>'+
  '<g fill="#fff8e6" stroke="#e8d9b0" stroke-width="1">'+beads+'</g>'+
  '<path d="M40 188 q10 -20 26 -26 M160 188 q-10 -20 -26 -26" stroke="#5c3375" stroke-width="3" fill="none" opacity=".5"/>'+
  '<rect x="88" y="128" width="24" height="22" rx="8" fill="#eab28f"/>'+
  '<circle cx="100" cy="30" r="22" fill="url(#zh'+u+')"/><path d="M84 26 q16 -12 32 0" stroke="#a8afbf" stroke-width="2.5" fill="none"/>'+
  '<circle cx="53" cy="104" r="8" fill="#f2bf9b"/><circle cx="147" cy="104" r="8" fill="#f2bf9b"/>'+
  '<ellipse cx="100" cy="98" rx="47" ry="50" fill="url(#zf'+u+')"/>'+
  '<path d="M52 92 q-4 -46 48 -50 q52 4 48 50 q-6 -26 -22 -32 q-10 14 -52 12 q-16 4 -22 20z" fill="url(#zh'+u+')"/>'+
  '<path d="M60 70 q10 -14 24 -16 M140 70 q-10 -14 -24 -16 M76 56 q12 -8 26 -6" stroke="#a8afbf" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
  '<circle cx="52" cy="115" r="3.5" fill="#f5b72d"/><circle cx="148" cy="115" r="3.5" fill="#f5b72d"/>'+
  '<ellipse cx="70" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".45"/><ellipse cx="130" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".45"/>'+
  brows+eyes+
  '<g fill="rgba(200,225,255,.28)" stroke="#6d4b3d" stroke-width="3"><circle cx="83" cy="96" r="14"/><circle cx="117" cy="96" r="14"/></g>'+
  '<path d="M97 95 q3 -3 6 0" stroke="#6d4b3d" stroke-width="3" fill="none"/><path d="M69 94 l-14 -5 M131 94 l14 -5" stroke="#6d4b3d" stroke-width="3"/>'+
  '<path d="M100 100 q-5 12 -1 15 q4 2 7 -1" stroke="#d99a78" stroke-width="3" fill="none" stroke-linecap="round"/>'+mouth+
  '<path d="M66 132 q6 4 10 2 M134 132 q-6 4 -10 2" stroke="#e0a585" stroke-width="2" fill="none" opacity=".7"/>';}

/* ---------- Михалыч, дядя Коля, Валерка — «Дворовая викторина» (viktorina js/look.js NEW + bustInner; контур темы не нужен) ---------- */
var NEW={
 mihalych:function(s){return{old:1,body:'#5d6b7c',brow:'#9a9a9a',
  back:'<g transform="rotate(14 172 120)"><rect x="168" y="34" width="8" height="190" rx="4" fill="#b98a55" '+s+'/><path d="M152 6 h40 l-6 44 h-28z" fill="#e2b25c" '+s+'/><path d="M160 12 v32 M168 10 v36 M176 10 v36 M184 12 v32" stroke="#b98533" stroke-width="2.4"/><rect x="154" y="44" width="36" height="9" rx="3" fill="#c0392b" '+s+'/></g>',
  bodyX:'<path d="M56 158 l24 -6 l20 30 l20 -30 l24 6 q30 8 38 34 v28 H18 v-28 q8 -26 38 -34z" fill="#ff8a1f" '+s+'/><path d="M20 196 h160" stroke="#f4f6f4" stroke-width="12"/><path d="M20 196 h160" stroke="#c9d2cf" stroke-width="2" stroke-dasharray="3 5"/><path d="M80 152 l20 30 l20 -30" fill="#39485a" '+s+'/>',
  hat:'<path d="M46 80 q-2 -52 54 -54 q56 2 54 54 q-54 -16 -108 0z" fill="#6f5136" '+s+'/><path d="M42 82 q58 -22 116 0 v14 q-58 -20 -116 0z" fill="#9b7650" '+s+'/><path d="M42 84 q-12 30 0 52 q10 -4 13 -18 q-5 -16 -3 -32z M158 84 q12 30 0 52 q-10 -4 -13 -18 q5 -16 3 -32z" fill="#9b7650" '+s+'/><path d="M92 28 q8 -8 16 0" stroke="#4d3722" stroke-width="3" fill="none" stroke-linecap="round"/>',
  under:'<path d="M70 128 q14 -10 30 -3 q16 -7 30 3 q-6 14 -30 9 q-24 5 -30 -9z" fill="#c9cdd2" '+s+'/>'};},
 kolya:function(s){ // Коля ≠ Толик «Карбюратор»: очки в чёрной оправе, вязаная жилетка с карандашом, кляссер с марками (решение владельца 09.10)
  var al='<g transform="rotate(-9 50 200)"><rect x="16" y="168" width="70" height="58" rx="5" fill="#2e6b4a" '+s+'/><rect x="22" y="174" width="58" height="46" rx="2" fill="#1f4f36"/>'+
   '<g stroke="#fff" stroke-width="1.6" stroke-dasharray="2 1.6"><rect x="26" y="178" width="14" height="17" fill="#e5484d"/><rect x="44" y="178" width="14" height="17" fill="#3f8fe0"/><rect x="62" y="178" width="14" height="17" fill="#ffcf40"/>'+
   '<rect x="26" y="200" width="14" height="17" fill="#2fa84f"/><rect x="44" y="200" width="14" height="17" fill="#ff8a1f"/></g><path d="M51 205 l4 -5 l4 5 z" fill="#fff"/><circle cx="33" cy="186" r="3" fill="#fff" opacity=".8"/></g>';
  return{body:'#7fa8d6',brow:'#5b3a29',
  hat:'<path d="M48 78 q2 -50 54 -52 q50 2 52 44 q-52 -10 -106 8z" fill="#6b5b4a" '+s+'/><path d="M48 78 q52 -18 106 -8 q18 4 24 14 q-64 -12 -130 -6z" fill="#51443a" '+s+'/>',
  bodyX:'<path d="M80 152 l20 20 l20 -20" fill="#e3e9f0" '+s+'/><path d="M40 166 q22 -12 44 -10 l16 28 l16 -28 q22 -2 44 10 l8 54 H32z" fill="#8a6a45" '+s+'/>'+
   '<g fill="#6f5434"><circle cx="100" cy="196" r="3.4"/><circle cx="100" cy="210" r="3.4"/></g><path d="M52 176 q20 -6 36 -2 M112 174 q16 -4 36 2" stroke="#a7865d" stroke-width="2.4" fill="none"/>'+
   '<rect x="132" y="170" width="20" height="14" rx="2" fill="#6f5434"/><path d="M138 172 v-16" stroke="#ffcf40" stroke-width="4" stroke-linecap="round"/><path d="M138 156 v-3" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>'+al,
  glasses:'<g fill="rgba(210,230,255,.3)" stroke="#222" stroke-width="3.6"><rect x="65" y="92" width="32" height="22" rx="6"/><rect x="103" y="92" width="32" height="22" rx="6"/></g><path d="M97 101 h6 M65 99 l-15 -4 M135 99 l15 -4" stroke="#222" stroke-width="3.6" fill="none"/>',
  under:'<path d="M72 128 q14 -9 28 -2 q14 -7 28 2 q-7 12 -28 7 q-21 5 -28 -7z" fill="#5b3a29" '+s+'/>'};},
 valerka:function(s){return{body:'#2f9e44',brow:'#6b4420',skin:'#f6cfae',
  hair:'<path d="M52 96 q-6 -44 46 -50 q52 2 52 48 q-10 -22 -26 -20 q-10 -12 -24 -6 q-14 -10 -30 2 q-12 4 -18 26z" fill="#8a5a2b" '+s+'/>',
  hat:'<path d="M50 76 q2 -44 50 -46 q48 2 50 46 q-50 -14 -100 0z" fill="#1c6fb8" '+s+'/><path d="M100 64 q38 -6 68 10 q-4 9 -18 9 q-24 -9 -50 -7z" fill="#155a96" '+s+'/>',
  bodyX:'<path d="M80 152 l20 22 l20 -22" fill="#fff" '+s+'/>',
  face:'<g fill="#d9905b" opacity=".7"><circle cx="68" cy="116" r="2"/><circle cx="76" cy="121" r="2"/><circle cx="62" cy="122" r="2"/><circle cx="132" cy="116" r="2"/><circle cx="124" cy="121" r="2"/><circle cx="138" cy="122" r="2"/></g>'};}
};
function bustInner(id,m){var o=NEW[id](''),st='';
 var sk=o.skin||'#eebf99',sk2=o.skin2||'#dba27c',brow=o.brow||'#8c8c8c';
 var eyes=m==='happy'?'<path d="M72 104 q9 -9 18 0 M110 104 q9 -9 18 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<circle cx="81" cy="103" r="6.4" fill="#3a2a22"/><circle cx="119" cy="103" r="6.4" fill="#3a2a22"/><circle cx="83" cy="101" r="1.8" fill="#fff"/><circle cx="121" cy="101" r="1.8" fill="#fff"/>'
  :'<ellipse cx="81" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><ellipse cx="119" cy="103" rx="4.2" ry="'+(m==='sad'?4:5)+'" fill="#3a2a22"/><circle cx="82.5" cy="101.5" r="1.4" fill="#fff"/><circle cx="120.5" cy="101.5" r="1.4" fill="#fff"/>';
 var brows=m==='sad'?'<path d="M68 90 q10 -5 22 2 M132 90 q-10 -5 -22 2" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>'
  :m==='happy'||m==='wow'?'<path d="M67 86 q11 -9 23 -3 M133 86 q-11 -9 -23 -3" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>'
  :'<path d="M68 90 q11 -6 22 -2 M132 90 q-11 -6 -22 -2" stroke="'+brow+'" stroke-width="6" fill="none" stroke-linecap="round"/>';
 var mouth=m==='happy'?'<path d="M82 132 q18 20 36 0 q-18 5 -36 0z" fill="#8f2f35"/><path d="M87 134.5 q13 5 26 0 l-2 3 q-11 4 -22 0z" fill="#fff"/>'
  :m==='sad'?'<path d="M88 140 q12 -9 24 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<ellipse cx="100" cy="137" rx="8" ry="9" fill="#8f2f35"/>'
  :'<path d="M86 133 q14 11 28 0" stroke="#8f2f35" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
 return (o.back||'')+'<path d="M10 220 q2 -52 46 -62 l24 -6 h40 l24 6 q44 10 46 62z" fill="'+o.body+'" '+st+'/>'+(o.bodyX||'')+
  '<path d="M84 138 h32 v20 q-16 12 -32 0z" fill="'+sk2+'"/>'+
  '<ellipse cx="50" cy="110" rx="9" ry="12" fill="'+sk+'"/><ellipse cx="150" cy="110" rx="9" ry="12" fill="'+sk+'"/>'+
  '<path d="M52 92 q0 -48 48 -48 q48 0 48 48 q0 30 -14 46 q-14 16 -34 16 q-20 0 -34 -16 q-14 -16 -14 -46z" fill="'+sk+'"/>'+(o.hair||'')+
  '<ellipse cx="68" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/><ellipse cx="132" cy="122" rx="11" ry="7" fill="#f08a80" opacity=".38"/>'+
  (o.old?'<path d="M64 112 q5 3 10 2 M136 112 q-5 3 -10 2 M80 76 q20 -5 40 0" stroke="'+sk2+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>':'')+
  brows+eyes+(o.glasses||'')+'<path d="M100 104 q-9 18 -3 22 q5 3 11 -1 q3 -3 -1 -8" fill="'+sk2+'" opacity=".9"/>'+(o.under||'')+mouth+(o.face||'')+(o.hat||'');}

/* ---------- Толик «Карбюратор» — «Покер» (holdem LOOK.tolik + headSvg, без фона) ---------- */
function tolik(m){var u='gt'+(++N),sk='#f5c9a8',sk2='#e9ae88',c='#b83b44',b='#5b3a29';
 var eyes=m==='happy'?'<path d="M75 96 q8 -8 16 0 M109 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<circle cx="83" cy="95" r="5.4" fill="#3a2a22"/><circle cx="117" cy="95" r="5.4" fill="#3a2a22"/><circle cx="84.5" cy="93.5" r="1.6" fill="#fff"/><circle cx="118.5" cy="93.5" r="1.6" fill="#fff"/>'
  :'<ellipse cx="83" cy="96" rx="4" ry="4.6" fill="#3a2a22"/><ellipse cx="117" cy="96" rx="4" ry="4.6" fill="#3a2a22"/><circle cx="84.3" cy="94.4" r="1.3" fill="#fff"/><circle cx="118.3" cy="94.4" r="1.3" fill="#fff"/>';
 var brows=m==='sad'?'<path d="M72 80 q10 -2 18 5 M128 80 q-10 -2 -18 5" stroke="'+b+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<path d="M72 77 q10 -7 20 -1 M108 76 q10 -6 20 1" stroke="'+b+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
  :'<path d="M72 83 q10 -5 20 0 M108 83 q10 -5 20 0" stroke="'+b+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
 var mouth=m==='wow'?'<ellipse cx="100" cy="127" rx="7" ry="8" fill="'+c+'"/>'
  :m==='sad'?'<path d="M88 130 q12 -9 24 0" stroke="'+c+'" stroke-width="4" fill="none" stroke-linecap="round"/>'
  :m==='happy'?'<path d="M84 119 q16 19 32 0 q-16 6 -32 0z" fill="'+c+'"/><path d="M89 123 q11 6 22 0" fill="#fff" opacity=".9"/>'
  :'<path d="M86 121 q14 13 28 0" stroke="'+c+'" stroke-width="4.2" fill="none" stroke-linecap="round"/>';
 return '<defs><radialGradient id="f'+u+'" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe2cc"/><stop offset="1" stop-color="'+sk+'"/></radialGradient></defs>'+
  '<path d="M28 200 q4 -46 44 -54 h56 q40 8 44 54z" fill="#2c5aa0"/><path d="M72 150 v50 M128 150 v50" stroke="#1d3f73" stroke-width="8"/><circle cx="72" cy="172" r="4" fill="#f5b72d"/><circle cx="128" cy="172" r="4" fill="#f5b72d"/>'+
  '<rect x="88" y="128" width="24" height="22" rx="8" fill="'+sk2+'"/>'+
  '<circle cx="53" cy="104" r="8" fill="'+sk+'"/><circle cx="147" cy="104" r="8" fill="'+sk+'"/>'+
  '<ellipse cx="100" cy="98" rx="47" ry="50" fill="url(#f'+u+')"/>'+
  '<ellipse cx="70" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".4"/><ellipse cx="130" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".4"/>'+
  brows+eyes+'<path d="M100 100 q-5 12 -1 15 q4 2 7 -1" stroke="'+sk2+'" stroke-width="3" fill="none" stroke-linecap="round"/>'+mouth+
  '<path d="M76 116 q12 -8 24 -2 q12 -6 24 2 q-6 10 -24 6 q-18 4 -24 -6z" fill="#5b3a29"/><path d="M60 104 l8 2" stroke="#555" stroke-width="3" opacity=".5"/>'+
  '<path d="M50 74 q4 -44 52 -46 q46 2 50 40 q-50 -8 -102 6z" fill="#6b6f76"/><path d="M50 74 q50 -14 102 -6 q18 4 22 12 q-62 -10 -124 -6z" fill="#565a61"/><circle cx="102" cy="30" r="4" fill="#565a61"/>';}

/* ---------- Галя с третьего и дед Семён — «Баба Зина», соседки (slovo js/sosedki.js, лицо 100×100 → по пояс) ---------- */
var SK='#f6c9a8',BL='#f58f8f',EY='#3a2a22',MO='#b83b44';
function sFace(sk){return '<ellipse cx="50" cy="56" rx="25" ry="27" fill="'+sk+'"/><circle cx="25" cy="58" r="5" fill="'+sk+'"/><circle cx="75" cy="58" r="5" fill="'+sk+'"/>'+
 '<ellipse cx="37" cy="66" rx="5.5" ry="3.5" fill="'+BL+'" opacity=".5"/><ellipse cx="63" cy="66" rx="5.5" ry="3.5" fill="'+BL+'" opacity=".5"/>';}
function sEyes(t){return t==='happy'?'<path d="M37 56 q4 -4 8 0 M55 56 q4 -4 8 0" stroke="'+EY+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
 :t==='wow'?'<circle cx="41" cy="55.5" r="3.6" fill="'+EY+'"/><circle cx="59" cy="55.5" r="3.6" fill="'+EY+'"/><circle cx="42" cy="54.5" r="1.1" fill="#fff"/><circle cx="60" cy="54.5" r="1.1" fill="#fff"/>'
 :'<circle cx="41" cy="56" r="'+(t==='sad'?2.5:2.8)+'" fill="'+EY+'"/><circle cx="59" cy="56" r="'+(t==='sad'?2.5:2.8)+'" fill="'+EY+'"/><circle cx="41.8" cy="55.2" r=".9" fill="#fff"/><circle cx="59.8" cy="55.2" r=".9" fill="#fff"/>';}
function sMouth(t){return t==='open'?'<path d="M42 70 q8 10 16 0 q-8 3 -16 0z" fill="'+MO+'"/>'
 :t==='laugh'?'<path d="M40 69 q10 13 20 0 q-10 3 -20 0z" fill="'+MO+'"/><path d="M43 70.5 q7 3 14 0 l-1 2 q-6 2 -12 0z" fill="#fff"/>'
 :t==='sad'?'<path d="M44 73 q6 -5 12 0" stroke="'+MO+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
 :t==='o'?'<ellipse cx="50" cy="71" rx="3.6" ry="4.4" fill="'+MO+'"/>'
 :'<path d="M43 70 q7 7 14 0" stroke="'+MO+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>';}
function sBody(c,c2){return '<path d="M8 116 q2 -34 28 -40 h28 q26 6 28 40z" fill="'+c+'"/>'+(c2?'<path d="M43 76 l7 9 l7 -9z" fill="'+c2+'"/>':'');}
function galya(m){var br=m==='sad'?'<path d="M35 51 q6 0 11 -4 M65 51 q-6 0 -11 -4" stroke="#a24a1c" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<path d="M35 46 q6 -4 11 -1 M54 45 q6 -3 11 1" stroke="#a24a1c" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
  :'<path d="M35 49 q6 -3 11 0 M54 49 q6 -3 11 0" stroke="#a24a1c" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
 return '<g transform="matrix(2 0 0 2 0 -12)">'+sBody('#e86a9a')+'<path d="M36 80 q14 6 28 0" stroke="#c94f80" stroke-width="2" fill="none"/>'+sFace(SK)+
  '<path d="M24 58 q-4 -32 26 -34 q30 2 26 34 q-3 -14 -12 -16 q-10 6 -28 2 q-9 4 -12 14z" fill="#d9662b"/>'+
  '<g fill="#7ec3f0" stroke="#3d8cc4" stroke-width="1.5"><rect x="30" y="20" width="10" height="16" rx="5"/><rect x="45" y="17" width="10" height="16" rx="5"/><rect x="60" y="20" width="10" height="16" rx="5"/></g>'+
  '<circle cx="24" cy="66" r="4.5" fill="#f5b72d"/><circle cx="76" cy="66" r="4.5" fill="#f5b72d"/>'+
  sEyes(m==='norm'||m==='happy'?'happy':m)+br+sMouth(m==='happy'?'laugh':m==='sad'?'sad':m==='wow'?'o':'open')+'</g>';}
function semyon(m){var br=m==='sad'?'<path d="M36 51 l9 -2.5 M64 51 l-9 -2.5" stroke="#c9ccd4" stroke-width="3" stroke-linecap="round"/>'
  :m==='wow'||m==='happy'?'<path d="M36 47 q4 -2 9 0 M64 47 q-4 -2 -9 0" stroke="#c9ccd4" stroke-width="3" fill="none" stroke-linecap="round"/>'
  :'<path d="M36 50 l9 1 M64 50 l-9 1" stroke="#c9ccd4" stroke-width="3" stroke-linecap="round"/>';
 var mo=m==='happy'?'<path d="M42 72 q8 7 16 0" stroke="'+MO+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
  :m==='sad'?'<path d="M44 75 q6 -4 12 0" stroke="'+MO+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
  :m==='wow'?'<ellipse cx="50" cy="74" rx="3.2" ry="3.8" fill="'+MO+'"/>':'';
 return '<g transform="matrix(2 0 0 2 0 -12)">'+sBody('#6b7b5a','#e9e2cf')+'<path d="M50 85 v31" stroke="#56653f" stroke-width="1.6"/><circle cx="53" cy="96" r="1.6" fill="#56653f"/><circle cx="53" cy="107" r="1.6" fill="#56653f"/>'+sFace('#efbf9c')+
  '<path d="M25 50 q0 -8 5 -12 M75 50 q0 -8 -5 -12" stroke="#d6d8de" stroke-width="7" stroke-linecap="round"/>'+
  '<path d="M22 44 q4 -22 28 -22 q24 0 28 22z" fill="#5b5f6b"/><path d="M20 44 h44 q16 0 18 6 h-62z" fill="#474b56"/>'+
  '<path d="M78 40 l10 -16" stroke="#f5b72d" stroke-width="4" stroke-linecap="round"/><path d="M88 24 l2 -4" stroke="#3a2a22" stroke-width="3" stroke-linecap="round"/>'+
  sEyes(m)+br+mo+'<path d="M36 69 q7 -6 14 -2 q7 -4 14 2 q-7 4 -14 0 q-7 4 -14 0z" fill="#e3e5ea"/>'+'<circle cx="50" cy="62" r="4" fill="#e09a7a"/></g>';}

/* ---------- сборка ---------- */
// у рисунков 200×200 голова чуть ниже/мельче — растягиваем, как Зину в Викторине (matrix 1.1)
var BIG='<g transform="matrix(1.1 0 0 1.1 -10 0)">';
function inner(id,m){
 if(id==='zina')return BIG+zina(m)+'</g>';
 if(id==='tolik')return BIG+tolik(m)+'</g>';
 if(NEW[id])return bustInner(id,m);
 if(id==='galya')return galya(m);
 if(id==='semyon')return semyon(m);
 return imgTag(id,m);}
// голова в значке: окно viewBox по месту головы
var FV={zina:'30 2 140 152',tolik:'30 2 140 152',galya:'28 14 144 150',semyon:'26 14 148 150',plombir:'20 30 160 150'};
function bust(id,m){m=md(m);if(!NAMES[id])id='valya';
 return '<svg class="gbp-bust" viewBox="0 0 200 220" preserveAspectRatio="xMidYMax meet" data-p="'+id+'/'+m+'" aria-hidden="true" focusable="false">'+inner(id,m)+'</svg>';}
function face(id,cls){if(!NAMES[id])id='valya';
 return '<svg class="gbp-face'+(cls?' '+cls:'')+'" viewBox="'+(FV[id]||'34 6 132 150')+'" aria-hidden="true" focusable="false">'+inner(id,'norm')+'</svg>';}
var CSS=false;
function css(){if(CSS)return;CSS=true;try{var st=document.createElement('style');st.textContent=
 '.gbp-say{display:flex;align-items:flex-end;gap:8px;text-align:left;margin:4px 0}.gbp-say.r{flex-direction:row-reverse}'+
 '.gbp-say .gbp-av{flex:none;width:72px;height:79px}.gbp-say .gbp-av svg{width:100%;height:100%;display:block}'+
 '.gbp-say .gbp-bub{position:relative;flex:1;min-width:0;background:#fffdf5;color:#3a2a1a;border-radius:14px;padding:8px 12px;font-size:16px;line-height:1.3;box-shadow:0 2px 0 rgba(90,60,30,.18);margin-bottom:14px}'+
 '.gbp-say .gbp-bub:before{content:"";position:absolute;left:-8px;bottom:10px;border:8px solid transparent;border-right-color:#fffdf5;border-left:0}'+
 '.gbp-say.r .gbp-bub:before{left:auto;right:-8px;border-right:0;border-left:8px solid #fffdf5}'+
 '.gbp-say .gbp-n{display:block;font-weight:800;font-size:13px;color:#8a4b1f;margin-bottom:2px}'+
 '.gbp-face{width:1.6em;height:1.6em;vertical-align:middle;display:inline-block}';
 (document.head||document.documentElement).appendChild(st);}catch(e){}}
function say(id,text,o){o=o||{};css();
 return '<div class="gbp-say'+(o.side==='r'?' r':'')+(o.cls?' '+o.cls:'')+'"><div class="gbp-av">'+bust(id,o.mood)+'</div>'+
  '<div class="gbp-bub">'+(o.noName?'':'<b class="gbp-n">'+name(id)+'</b>')+(text||'')+'</div></div>';}
function name(id){var n=NAMES[id];return n?Lx(n[0],n[1]):'';}
var IMG={};
function img(id,m,cb){m=md(m);var k=id+':'+m+(id==='valya'?':'+decKey():''),o=IMG[k];
 if(o){if(o.ok)return o.im;if(cb)o.cb.push(cb);return null;}
 o=IMG[k]={im:new Image(),ok:false,cb:cb?[cb]:[]};
 o.im.onload=function(){o.ok=true;var L=o.cb;o.cb=[];for(var i=0;i<L.length;i++)try{L[i](o.im);}catch(e){}};
 var s=bust(id,m).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="400" height="440" ');
 o.im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);return null;}
function draw(g,id,m,x,y,w,h){var im=img(id,m);if(!im)return false;var k=Math.min(w/200,h/220),dw=200*k,dh=220*k;g.drawImage(im,x+(w-dw)/2,y+h-dh,dw,dh);return true;}
window.GBP={v:1,ids:IDS,name:name,bust:bust,face:face,say:say,img:img,draw:draw,_raster:raster};
})();
