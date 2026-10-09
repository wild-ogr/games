/* Рыбалка с Петровичем — «Двор Петровича» (RB:MG0, 08.10.2026): сцена двора с игрушками-станциями, «Дело дня», Книга двора, тренировка.
   Вход — MG_DVOR.open() (плитка «Двор» на главном экране — гнездо UX mapSlots: MG.tile()), выход — на карту (openMap).
   Сцена рисуется кодом (js/mg-art.js): небо по времени суток, изба с резными наличниками, забор с калиткой, яблоня и стол, костёр с котелком,
   пруд с мостками, бочка и грядка; Петрович и кот Васька живые. Облики двора из Книги (подсолнухи, наличники, фонарики, беседка, банька) — добавляются в сцену.
   Станции — DOM-кнопки поверх холста (крупные, ≥64 px): только зарегистрированные игры; закрытые — с замком и подсказкой, где откроется. */
(function(){
'use strict';
var A=window.MG_ART,M=window.MG,MG=M,PI=Math.PI;
if(!A||!M)return;
var el=A.el,rr=A.rr,lg=A.lg,rg=A.rg;
function L2(a){return typeof LANG!=='undefined'&&LANG==='en'&&a[1]?a[1]:a[0];}
var DAYS=[['воскресенье','Sunday'],['понедельник','Monday'],['вторник','Tuesday'],['среда','Wednesday'],['четверг','Thursday'],['пятница','Friday'],['суббота','Saturday']];

/* ---------- значки игр (24×24, в стиле IG js/look.js: линия + заливка .d) ---------- */
var IC=M.IC;
IC.baiki='<path class="d" d="M4 5.5h16a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5h-8l-4.5 3.5V16.5H4A1.5 1.5 0 012.5 15V7A1.5 1.5 0 014 5.5z"/><path d="M10 9.2a2 2 0 113 1.7c-.7.4-1 .8-1 1.6M12 14.2v.2"/>';
IC.nazh='<path class="d" d="M6 8h12l-1.2 11.5a1.5 1.5 0 01-1.5 1.3H8.7a1.5 1.5 0 01-1.5-1.3z"/><path d="M5 8h14M9 5.5h6M9 12.5c1.5-1.4 2.7 1.4 4.2 0s2.4.9 2.4.9"/>';
IC.uha='<path class="d" d="M4.5 11h15v2.5a6 6 0 01-6 6h-3a6 6 0 01-6-6z"/><path d="M3 11h18M9 7.5c0-1.4 1-1.4 1-2.8M13.5 7.5c0-1.4 1-1.4 1-2.8"/>';
IC.versha='<path class="d" d="M3.5 12c0-4 3.5-6.5 8.5-6.5s8.5 2.5 8.5 6.5-3.5 6.5-8.5 6.5S3.5 16 3.5 12z"/><path d="M8 6v12M12 5.5v13M16 6v12M3.5 12h17"/>';
IC.chist='<path class="d" d="M3 12c3-4 8-5 12-2l4-3v10l-4-3c-4 3-9 2-12-2z"/><circle cx="7.5" cy="11.2" r=".9"/><path d="M14 4l2 2M17 3.5v2.5M19.5 5l-1.7 1.7"/>';
IC.boroda='<path d="M4 6c4 0 4 4 8 4s3-4 6-4M5 18c2-6 6-1 8-5s5-3 6 1"/><path class="d" d="M9 13.5a3 2.2 0 106 0 3 2.2 0 10-6 0z"/>';
IC.prik='<path class="d" d="M5 9h14l-1.6 10a1.5 1.5 0 01-1.5 1.3H8.1a1.5 1.5 0 01-1.5-1.3z"/><path d="M4 9h16M8 9c0-3 2-5 4-5s4 2 4 5"/><circle cx="10" cy="14" r=".8"/><circle cx="13.5" cy="15.5" r=".8"/><circle cx="12" cy="12.5" r=".8"/>';
IC.rynok='<path d="M12 4v15M6 19h12M4 8h16"/><path class="d" d="M4 8l-2.2 5.5h4.4zM20 8l-2.2 5.5h4.4z"/>';
IC.lunka='<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path class="d" d="M9.5 12a2.5 2.5 0 105 0 2.5 2.5 0 10-5 0z"/>';
IC.raki='<path class="d" d="M9 9h6v7a3 3 0 01-6 0z"/><path d="M9 11l-4-2-1-4 3 1M15 11l4-2 1-4-3 1M9 14H5.5M15 14h3.5M10 19l-1 2.5M14 19l1 2.5M10.5 9V6M13.5 9V6"/>';
IC.foto='<rect class="d" x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7l1.6-2.5h3.8L15.5 7"/><circle cx="12" cy="13.5" r="3.6"/>';
IC.griby='<path class="d" d="M3.5 11.5a8.5 6 0 0117 0z"/><path d="M9.5 11.5v6.5a2.5 2.5 0 005 0v-6.5"/><circle cx="9" cy="8" r=".9"/><circle cx="14.5" cy="7.5" r=".9"/>';
IC.domino='<rect class="d" x="7" y="2.5" width="10" height="19" rx="2"/><path d="M7 12h10"/><circle cx="12" cy="7.2" r="1"/><circle cx="10" cy="15" r="1"/><circle cx="14" cy="18.5" r="1"/><circle cx="12" cy="16.8" r="1"/>';
IC.spor='<path class="d" d="M4 13l4-4 3 1 3-3 6 6-5 5z"/><path d="M8 9l3 3M11 10l3 3M14 7l3 3"/>';
IC.lock='<rect class="d" x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 018 0v2.5"/>';
IC.check='<path d="M5 12.5l4.5 4.5L19 7.5"/>';
IC.book='<path class="d" d="M4 5.5c3-1.5 5.5-1.5 8 .5v14c-2.5-2-5-2-8-.5zM20 5.5c-3-1.5-5.5-1.5-8 .5v14c2.5-2 5-2 8-.5z"/>';
IC.train='<circle class="d" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>';
IC.back='<path d="M15 5l-7 7 7 7"/>';
IC.star='<path class="d" d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8l-5.5 2.9 1.2-6.1L3.2 9.4l6.1-.8z"/>';
IC.ad='<rect class="d" x="3" y="5" width="18" height="12.5" rx="2"/><path d="M10 8.5v5.5l4.5-2.75z M8 20.5h8"/>';
IC.gift='<rect class="d" x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-1.5-4-6-4-5-1s5 1 5 1c1.5-4 6-4 5-1s-5 1-5 1"/>';
IC.close='<path d="M6 6l12 12M18 6L6 18"/>';
var SHORT={baiki:['Байки','Tales'],nazh:['Наживка','Bait'],uha:['Уха','Fish soup'],versha:['Верша','Trap'],chist:['Чистка','Cleaning'],boroda:['«Борода»','Tangle'],prik:['Прикормка','Groundbait'],
  rynok:['Рынок','Market'],lunka:['Лунка','Ice hole'],raki:['Ночные раки','Crayfish'],foto:['Фото','Photo'],griby:['Грибы','Mushrooms'],domino:['Домино','Dominoes'],spor:['Спор','Bet']};
function icn(k,cls){return '<svg class="ic '+(cls||'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(IC[k]||'')+'</svg>';}

/* ---------- раскладка сцены: [x доля ширины сцены, d глубина 0 (горизонт)…1 (низ сцены)] ---------- */
/* MERGE 08.10: узкий ПК (ширина < 1100, панель справа) — станции сеткой в видимой части: x — доля видимой ширины, y — глубина двора; Петрович (Байки) — на своём месте */
var POS_N={chist:[.04,.04],spor:[.27,.04],rynok:[.5,.04],domino:[.73,.04],uha:[.95,.04],nazh:[.04,.48],griby:[.6,.48],boroda:[.86,.48],prik:[.06,.84],raki:[.47,.84],foto:[.73,.84],versha:[.95,.84]};
var POS={
 p:{house:[.27,.1],banya:[.9,.02],gate:[.7,.1],birch:[.5,.02],tree:[.8,.42],table:[.66,.5],petr:[.47,.52],fire:[.36,.72],pond:[.2,.93],barrel:[.86,.84],bed:[.68,.9],cat:[.36,.24],basket:[.07,.3],well:[.1,.5],wood:[.5,.13],hen:[.66,.68],bush:[[.56,.97],[.97,.58],[.03,.66]],
    st:{baiki:'petr',domino:[.68,.46],uha:[.36,.62],chist:[.25,.2],rynok:[.66,.06],spor:[.88,.14],nazh:[.88,.72],prik:[.66,.82],versha:[.15,.82],raki:[.3,.9],foto:[.5,.94],boroda:[.93,.44]/*MERGE: не под «Спором»*/,griby:[.1,.35]/*MERGE: не налезает на «Чистку»*/,lunka:[.2,.96]}},
 l:{house:[.12,.12],banya:[.4,.02],gate:[.56,.07],birch:[.3,.02],tree:[.42,.38],table:[.35,.5],petr:[.21,.58],fire:[.54,.66],pond:[.84,.8],barrel:[.05,.74],bed:[.17,.9],cat:[.2,.26],basket:[.6,.35],well:[.75,.44],wood:[.93,.46],hen:[.78,.6],bush:[[.45,.9],[.63,.97],[.3,.76],[.99,.55],[.6,.4]],
    st:{baiki:'petr',domino:[.35,.44],uha:[.54,.56],chist:[.07,.34]/*MERGE: не налезает на Байки*/,rynok:[.56,.04],spor:[.42,.05],nazh:[.05,.62],prik:[.17,.82],versha:[.95,.7],raki:[.74,.76],foto:[.86,.97],boroda:[.55,.27]/*MERGE: Спор и «Борода» не друг на друге*/,griby:[.6,.3],lunka:[.8,.9]}}};

var D=null; // состояние открытого двора
function css(){M.css();if(document.getElementById('mgDvCss'))return;var s=document.createElement('style');s.id='mgDvCss';s.textContent=DV_CSS;document.head.appendChild(s);}
function open(){css();if(D)close(true);try{hideModal();}catch(e){}
  var app=document.getElementById('app')||document.body,lay=document.createElement('div');lay.className='mg-dv';
  lay.innerHTML='<canvas class="mg-dvc"></canvas><div class="mg-stns"></div>'+
   '<div class="mg-dtop"><button class="mg-x mg-back" type="button" aria-label="'+L('Назад','Back')+'">'+icn('back')+'</button><div class="mg-ttl"><div class="mg-tn">'+L('Двор Петровича','Petrovich\'s yard')+'</div>'+
   '<button class="mg-lvb" type="button"><span class="mg-lvn"></span><span class="mg-lvbar"><i></i></span></button></div><button class="mg-x mg-bk" type="button" aria-label="'+L('Книга двора','Yard book')+'">'+icn('book')+'</button></div>'+
   '<div class="mg-pnl"></div><div class="mg-bub"></div>';
  app.appendChild(lay);
  D={lay:lay,c:lay.querySelector('.mg-dvc'),t:0,raf:0,bg:null,key:'',td:A.tod(),flies:[],bub:0};
  D.g=D.c.getContext('2d');
  lay.querySelector('.mg-back').onclick=function(){close();};
  lay.querySelector('.mg-bk').onclick=openBook;lay.querySelector('.mg-lvb').onclick=openBook;
  D.c.addEventListener('pointerdown',onTap);
  fit();render();loop();
  try{STAT.screen&&STAT.screen('dvor');STAT.ev('mg',{a:'dvor',n:M.todo()});}catch(e){}
  setTimeout(greet,500);setTimeout(dvKbdHint,900);}
function close(silent){if(!D)return;cancelAnimationFrame(D.raf);if(D.lay.parentNode)D.lay.parentNode.removeChild(D.lay);D=null;if(!silent)try{openMap();}catch(e){}}
function fit(){if(!D)return;var c=D.c,w=D.lay.clientWidth||360,h=D.lay.clientHeight||640,dpr=Math.min(2,window.devicePixelRatio||1);try{if(typeof LOW!=='undefined'&&LOW)dpr=Math.min(dpr,1.25);}catch(e){}
  c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);D.g.setTransform(dpr,0,0,dpr,0,0);D.W=w;D.H=h;D.dpr=dpr;
  var port=w/h<1.05;D.port=port;D.lay.classList.toggle('port',port);D.lay.classList.toggle('land',!port);D.lay.classList.toggle('sm',port&&(w<380||h<760)); /*RB:MGPC маленький телефон — станции компактнее*/
  var panH=port?Math.min(250,h*.32):0,panW=port?0:Math.min(380,w*.32);
  D.sx=0;D.sw=port?w:Math.max(320,w-panW-28); /*RB:MGPC широкий ПК: сцена и станции — левее панели (раньше Верша/Раки/Фото уходили под панель и не нажимались)*/D.panW=panW;D.hz=port?h*.25:h*.36;D.gb=h-panH+(port?10:0);D.u=Math.min(D.sw/.8,(D.gb-D.hz)*1.25)/100;
  D.u*=1.25;D.P=POS[port?'p':'l'];D.bg=null;}
function at(p){var d=p[1];return {x:D.sx+p[0]*D.sw,y:D.hz+d*(D.gb-D.hz),k:.55+.6*d};}
function onResize(){if(!D)return;fit();render();ui();}
window.addEventListener('resize',function(){clearTimeout(onResize._t);onResize._t=setTimeout(onResize,80);});

/* ---------- статичный фон: небо, лес, изба, забор, земля, пруд, грядка ---------- */
function skins(){var m=M.day();return m.sku||{base:1};}
function buildBg(){var W=D.W,H=D.H,c=document.createElement('canvas');c.width=Math.round(W*D.dpr);c.height=Math.round(H*D.dpr);var g=c.getContext('2d');g.setTransform(D.dpr,0,0,D.dpr,0,0);
  var u=D.u,hz=D.hz,td=D.td,sk=skins(),R=A.rnd(17);
  A.sky(g,W,H,hz,td,0);
  // дальний лес и крыши соседей
  g.fillStyle='#5f8a6a';g.beginPath();g.moveTo(0,hz);for(var x=0;x<=W;x+=u*2.2){g.lineTo(x,hz-u*(5+Math.sin(x*.05)*1.5+R()*3));}g.lineTo(W,hz);g.fill();
  g.fillStyle='#4a7558';g.beginPath();g.moveTo(0,hz);for(var x2=0;x2<=W;x2+=u*3){var hh=u*(3+R()*4);g.lineTo(x2,hz-hh*.4);g.lineTo(x2+u*1.5,hz-hh-u*3);g.lineTo(x2+u*3,hz-hh*.4);}g.lineTo(W,hz);g.fill();
  for(var r=0;r<3;r++){var rx=D.sw*(.55+r*.17),rw=u*7;g.fillStyle=['#8a5a4a','#6d7f8c','#9a6a3a'][r];g.beginPath();g.moveTo(rx-rw,hz-u*1);g.lineTo(rx,hz-u*5.5);g.lineTo(rx+rw,hz-u*1);g.fill();g.fillStyle='#d9cbb0';g.fillRect(rx-rw*.7,hz-u*1.2,rw*1.4,u*1.4);}
  // земля
  g.fillStyle=lg(g,0,hz,0,H,[0,'#8fbf5f',.5,'#78ad4c',1,'#5f9440']);g.fillRect(0,hz,W,H-hz);
  // тропинка от калитки к избе и к костру
  var gt=at(D.P.gate),hs=at(D.P.house),fr=at(D.P.fire);g.strokeStyle='rgba(222,200,150,.75)';g.lineCap='round';g.lineWidth=u*3.2;g.beginPath();g.moveTo(gt.x,gt.y);g.quadraticCurveTo((gt.x+hs.x)/2,hs.y+u*6,hs.x+u*5,hs.y+u*1);g.stroke();
  g.lineWidth=u*2.6;g.beginPath();g.moveTo((gt.x+hs.x)/2,hs.y+u*4);g.quadraticCurveTo(fr.x,fr.y-u*10,fr.x,fr.y);g.stroke();
  // травинки и цветы
  for(var i=0;i<180;i++){var gx=R()*W,gy=hz+R()*(H-hz),k=.4+(gy-hz)/(H-hz);g.fillStyle=R()<.5?'rgba(60,110,40,.35)':'rgba(150,200,90,.35)';el(g,gx,gy,u*.9*k,u*.35*k);g.fill();}
  for(var f=0;f<46;f++){var fx=R()*W,fy=hz+u*3+R()*(H-hz),kk=.4+(fy-hz)/(H-hz);g.fillStyle=['#fff','#ffd84a','#e86a8a','#9fb8ff'][f%4];el(g,fx,fy,u*.45*kk,u*.45*kk);g.fill();}
  // забор с калиткой (за избой — от края до края)
  var fy0=hz+u*2.2;A.fence(g,-5,W+5,fy0+u*5,u*7,false,[gt.x-u*4,gt.x+u*4]);
  // калитка
  g.fillStyle='#8a6a44';rr(g,gt.x-u*3.6,fy0-u*1.5,u*7.2,u*6.5,u*.5);g.fill();g.strokeStyle='#6a4e30';g.lineWidth=u*.5;g.beginPath();g.moveTo(gt.x-u*3.6,fy0-u*1.5);g.lineTo(gt.x+u*3.6,fy0+u*5);g.stroke();
  for(var pp=0;pp<2;pp++){g.fillStyle='#6a4e30';g.fillRect(gt.x+(pp?u*3.6:-u*4.8),fy0-u*3,u*1.2,u*8.2);}
  if(sk.sun)sunflowers(g,u,fy0+u*5,W,R);
  if(sk.banya)banya(g,at(D.P.banya),u);
  // берёза у забора
  var bz=at(D.P.birch);
  // изба
  house(g,hs,u,sk,td);
  // лавка у калитки
  A.bench(g,gt.x+u*7,gt.y+u*5,u*9);
  // грядка и бочка
  bed(g,at(D.P.bed),u);barrel(g,at(D.P.barrel),u);
  // пруд с мостками
  pond(g,at(D.P.pond),u,W,H);
  // стол под яблоней
  var tb=at(D.P.table);if(sk.vine)arbour(g,tb,u);A.table(g,tb.x,tb.y,u*16*tb.k);
  (D.P.bush||[]).forEach(function(b,i){bush(g,at(b),u,i);});
  well(g,at(D.P.well),u);woodpile(g,at(D.P.wood),u);
  // корзина у забора (грибы)
  var bs=at(D.P.basket);basket(g,bs,u);
  D.bz=bz;return c;}
function house(g,p,u,sk,td){var k=p.k,w=u*30*k,h=u*16*k,x=p.x-w/2,y=p.y;
  g.fillStyle='rgba(0,0,0,.18)';el(g,p.x,y,w*.6,u*1.6*k);g.fill();
  // сруб
  g.fillStyle=lg(g,0,y-h,0,y,[0,'#b07a46',1,'#8a5a32']);g.fillRect(x,y-h,w,h);
  g.strokeStyle='rgba(70,40,20,.45)';g.lineWidth=Math.max(1,u*.25*k);for(var i=1;i<9;i++){var yy=y-h+i*h/9;g.beginPath();g.moveTo(x,yy);g.lineTo(x+w,yy);g.stroke();}
  g.fillStyle='#7a4e2a';for(var j=0;j<9;j++){el(g,x,y-h+j*h/9+h/18,u*.9*k,h/18);g.fill();el(g,x+w,y-h+j*h/9+h/18,u*.9*k,h/18);g.fill();}
  // крыша
  g.fillStyle=lg(g,0,y-h-u*14*k,0,y-h,[0,'#5d7f7a',1,'#3f5f5c']);g.beginPath();g.moveTo(x-u*2.5*k,y-h+u*.5);g.lineTo(p.x,y-h-u*13*k);g.lineTo(x+w+u*2.5*k,y-h+u*.5);g.closePath();g.fill();
  g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=u*.3*k;for(var r=1;r<7;r++){var q=r/7;g.beginPath();g.moveTo(x-u*2.5*k+q*(p.x-x+u*2.5*k),y-h+u*.5-q*(u*13.5*k));g.lineTo(x+w+u*2.5*k-q*(x+w+u*2.5*k-p.x),y-h+u*.5-q*(u*13.5*k));g.stroke();}
  // фронтон с окошком
  g.fillStyle='#c48a52';g.beginPath();g.moveTo(x+u*1*k,y-h);g.lineTo(p.x,y-h-u*11*k);g.lineTo(x+w-u*1*k,y-h);g.fill();
  g.strokeStyle='rgba(70,40,20,.35)';for(var v=1;v<8;v++){g.beginPath();g.moveTo(x+v*w/8,y-h);g.lineTo(x+v*w/8,y-h-Math.max(0,(1-Math.abs(v/8-.5)*2))*u*11*k);g.stroke();}
  win(g,p.x,y-h-u*4.5*k,u*3.2*k,u*3.6*k,sk,td,true);
  // труба
  g.fillStyle='#8a4a3a';g.fillRect(p.x+w*.22,y-h-u*12*k,u*2.6*k,u*6*k);g.fillStyle='#6a3a2a';g.fillRect(p.x+w*.22-u*.3*k,y-h-u*12.6*k,u*3.2*k,u*1*k);
  D.chim={x:p.x+w*.22+u*1.3*k,y:y-h-u*12.6*k,s:u*3*k};
  // окна с наличниками
  win(g,x+w*.22,y-h*.55,u*5*k,u*6*k,sk,td);win(g,x+w*.58,y-h*.55,u*5*k,u*6*k,sk,td);
  // крыльцо
  var px=x+w*.86,pw=u*7*k;g.fillStyle='#9a6a3e';g.fillRect(px-pw/2,y-h*.62,pw,h*.62);g.fillStyle='#5a3a22';g.fillRect(px-pw*.32,y-h*.58,pw*.64,h*.58);
  g.fillStyle='#c79a62';for(var s=0;s<3;s++){g.fillRect(px-pw*.7+s*u*.4*k,y-s*u*1.2*k-u*1.2*k,pw*1.4-s*u*.8*k,u*1.2*k);}
  g.fillStyle='#4d6f6c';g.beginPath();g.moveTo(px-pw*.8,y-h*.62);g.lineTo(px,y-h*.95);g.lineTo(px+pw*.8,y-h*.62);g.fill();
  D.porch={x:px,y:y-u*3.8*k,k:k};
  if(sk.lights)D.lightsA={x:x+w*.95,y:y-h*.8};}
function win(g,cx,cy,w,h,sk,td,small){var lit=td==='night'||td==='evening';
  g.fillStyle=lit?rg(g,cx,cy,1,w,[0,'#ffe9a8',1,'#f2b04a']):lg(g,cx-w/2,cy-h/2,cx+w/2,cy+h/2,[0,'#bfe3f2',.5,'#7fb6d0',1,'#5e94b0']);g.fillRect(cx-w/2,cy-h/2,w,h);
  g.strokeStyle='#f6f1e6';g.lineWidth=Math.max(1,w*.09);g.strokeRect(cx-w/2,cy-h/2,w,h);g.beginPath();g.moveTo(cx,cy-h/2);g.lineTo(cx,cy+h/2);g.moveTo(cx-w/2,cy-h*.1);g.lineTo(cx+w/2,cy-h*.1);g.stroke();
  if(small)return;
  // наличник: верх-кокошник и низ
  var lace=!!sk.lace;g.fillStyle='#f6f1e6';g.beginPath();g.moveTo(cx-w*.75,cy-h*.55);g.quadraticCurveTo(cx,cy-h*(lace?1.05:.85),cx+w*.75,cy-h*.55);g.lineTo(cx+w*.75,cy-h*.5);g.lineTo(cx-w*.75,cy-h*.5);g.fill();
  g.fillRect(cx-w*.7,cy+h*.5,w*1.4,h*.12);
  if(lace){g.fillStyle='#3b6fb5';for(var i=-2;i<=2;i++){el(g,cx+i*w*.24,cy-h*.62,w*.06,w*.06);g.fill();}g.fillStyle='#f6f1e6';for(var j=-3;j<=3;j++){g.beginPath();g.moveTo(cx+j*w*.2-w*.08,cy+h*.62);g.lineTo(cx+j*w*.2,cy+h*.8);g.lineTo(cx+j*w*.2+w*.08,cy+h*.62);g.fill();}
    g.fillStyle='#3b6fb5';g.fillRect(cx-w*.62,cy-h*.5,w*.12,h);g.fillRect(cx+w*.5,cy-h*.5,w*.12,h);}
  else{g.fillStyle='#4f7fae';g.fillRect(cx-w*.68,cy-h*.5,w*.16,h);g.fillRect(cx+w*.52,cy-h*.5,w*.16,h);}}
function bed(g,p,u){var k=p.k,w=u*18*k;g.fillStyle='#6a4a30';rr(g,p.x-w/2,p.y-u*2*k,w,u*3.6*k,u*1.6*k);g.fill();g.fillStyle='#7d5838';rr(g,p.x-w/2+u*.5,p.y-u*2.3*k,w-u,u*2.4*k,u*1.2*k);g.fill();
  for(var i=0;i<7;i++){var x=p.x-w/2+u*1.6*k+i*(w-u*3.2*k)/6;g.fillStyle='#5aa040';el(g,x-u*.6*k,p.y-u*2.8*k,u*.9*k,u*.5*k,-.5);g.fill();el(g,x+u*.6*k,p.y-u*2.8*k,u*.9*k,u*.5*k,.5);g.fill();g.fillStyle='#7cc054';el(g,x,p.y-u*3.4*k,u*.5*k,u*.9*k);g.fill();}}
function barrel(g,p,u){var k=p.k,w=u*7*k,h=u*9*k;g.fillStyle='rgba(0,0,0,.2)';el(g,p.x,p.y,w*.7,u*1.1*k);g.fill();
  g.fillStyle=lg(g,p.x-w/2,0,p.x+w/2,0,[0,'#6a4426',.4,'#a06a3c',1,'#5a3a20']);g.beginPath();g.moveTo(p.x-w*.44,p.y);g.quadraticCurveTo(p.x-w*.56,p.y-h/2,p.x-w*.44,p.y-h);g.lineTo(p.x+w*.44,p.y-h);g.quadraticCurveTo(p.x+w*.56,p.y-h/2,p.x+w*.44,p.y);g.closePath();g.fill();
  g.strokeStyle='#3a3a3a';g.lineWidth=u*.5*k;for(var i=0;i<3;i++){var yy=p.y-h*(.15+i*.35);g.beginPath();g.moveTo(p.x-w*.5,yy);g.quadraticCurveTo(p.x,yy+u*.8*k,p.x+w*.5,yy);g.stroke();}
  g.fillStyle='#3d6e88';el(g,p.x,p.y-h,w*.44,u*1*k);g.fill();g.fillStyle='rgba(255,255,255,.35)';el(g,p.x-w*.1,p.y-h,w*.18,u*.3*k);g.fill();
  // ведро и лейка рядом
  g.fillStyle='#9aa4ab';g.beginPath();g.moveTo(p.x-w*1.1,p.y-u*3.4*k);g.lineTo(p.x-w*.6,p.y-u*3.4*k);g.lineTo(p.x-w*.66,p.y);g.lineTo(p.x-w*1.04,p.y);g.fill();g.fillStyle='#6c767d';el(g,p.x-w*.85,p.y-u*3.4*k,w*.25,u*.5*k);g.fill();}
function pond(g,p,u,W,H){var k=p.k,rx=Math.min(D.sw*.3,u*22),ry=rx*.32,cx=p.x,cy=p.y;
  g.fillStyle='#6a8a4a';el(g,cx,cy,rx+u*1.4,ry+u*1);g.fill();
  g.fillStyle=lg(g,0,cy-ry,0,cy+ry,[0,'#4a8fb0',1,'#2f6a8a']);el(g,cx,cy,rx,ry);g.fill();
  g.fillStyle='rgba(255,255,255,.12)';el(g,cx-rx*.2,cy-ry*.4,rx*.5,ry*.18);g.fill();
  // кувшинки
  for(var i=0;i<4;i++){var lx=cx+(i-1.5)*rx*.38,ly=cy+((i*37)%7-3)*ry*.1;g.fillStyle='#4f9a48';el(g,lx,ly,u*1.6,u*.7);g.fill();if(i%2){g.fillStyle='#fff';el(g,lx+u*.4,ly-u*.3,u*.5,u*.4);g.fill();}}
  // камыш
  g.strokeStyle='#4d6a2a';g.lineWidth=Math.max(1,u*.3);for(var r=0;r<12;r++){var rxp=cx+rx*(r<6?-1:1)*(.75+r%3*.08),ryp=cy-ry*.3+r%4*u*.6;g.beginPath();g.moveTo(rxp,ryp);g.quadraticCurveTo(rxp,ryp-u*4,rxp+u*.6,ryp-u*6.5);g.stroke();if(r%2){g.fillStyle='#6a4a2a';el(g,rxp+u*.5,ryp-u*5.6,u*.45,u*1.4);g.fill();}}
  // мостки
  var mx=cx+rx*.18,my=cy-ry*.9;g.fillStyle='#a37a4c';g.beginPath();g.moveTo(mx-u*2.2,my);g.lineTo(mx+u*2.2,my);g.lineTo(mx+u*3,cy+ry*.4);g.lineTo(mx-u*3,cy+ry*.4);g.closePath();g.fill();
  g.strokeStyle='rgba(60,35,15,.5)';g.lineWidth=Math.max(1,u*.2);for(var b=1;b<8;b++){var yy=my+(cy+ry*.4-my)*b/8,ww=u*(2.2+.8*b/8);g.beginPath();g.moveTo(mx-ww,yy);g.lineTo(mx+ww,yy);g.stroke();}
  g.fillStyle='#5a3e26';g.fillRect(mx-u*3.2,cy+ry*.4,u*.8,u*2.6);g.fillRect(mx+u*2.4,cy+ry*.4,u*.8,u*2.6);
  // лодка у берега
  var bx=cx-rx*.55,by=cy+ry*.25;g.fillStyle='#7a4e2e';g.beginPath();g.moveTo(bx-u*5,by-u*.6);g.quadraticCurveTo(bx,by+u*2.4,bx+u*5,by-u*.6);g.lineTo(bx+u*4.4,by-u*1.4);g.lineTo(bx-u*4.4,by-u*1.4);g.closePath();g.fill();
  g.fillStyle='#a8744a';g.fillRect(bx-u*4.2,by-u*1.6,u*8.4,u*.5);
  D.water={x:cx,y:cy,rx:rx,ry:ry};D.pier={x:mx,y:cy+ry*.3};}
function sunflowers(g,u,y,W,R){for(var i=0;i<9;i++){var x=W*(.05+i*.11)+R()*u*2,h=u*(7+R()*3);g.strokeStyle='#4f8a3a';g.lineWidth=u*.45;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-h);g.stroke();
  g.fillStyle='#5fa048';el(g,x-u*1,y-h*.5,u*1.2,u*.5,-.5);g.fill();g.fillStyle='#ffc61a';for(var p=0;p<10;p++){var a=p/10*PI*2;el(g,x+Math.cos(a)*u*1.3,y-h+Math.sin(a)*u*1.3,u*.8,u*.35,a);g.fill();}g.fillStyle='#5a3a1a';el(g,x,y-h,u*.9,u*.9);g.fill();}}
function banya(g,p,u){var k=p.k,w=u*12*k,h=u*7*k;g.fillStyle='#8a5a32';g.fillRect(p.x-w/2,p.y-h,w,h);g.fillStyle='#5d4a3a';g.beginPath();g.moveTo(p.x-w*.6,p.y-h);g.lineTo(p.x,p.y-h-u*5*k);g.lineTo(p.x+w*.6,p.y-h);g.fill();
  g.fillStyle='#3a2a1a';g.fillRect(p.x-w*.15,p.y-h*.75,w*.3,h*.75);g.fillStyle='#6a6a6a';g.fillRect(p.x+w*.2,p.y-h-u*5*k,u*1.4*k,u*3*k);D.banya={x:p.x+w*.2+u*.7*k,y:p.y-h-u*5*k,s:u*2*k};}
function arbour(g,p,u){var k=p.k,w=u*22*k,h=u*16*k;g.strokeStyle='#8a6a44';g.lineWidth=u*.7*k;g.beginPath();g.moveTo(p.x-w/2,p.y);g.lineTo(p.x-w/2,p.y-h);g.lineTo(p.x+w/2,p.y-h);g.lineTo(p.x+w/2,p.y);g.stroke();
  g.lineWidth=u*.3*k;for(var i=1;i<6;i++){g.beginPath();g.moveTo(p.x-w/2+i*w/6,p.y-h);g.lineTo(p.x-w/2+i*w/6,p.y-h-u*1.5*k);g.stroke();}
  for(var j=0;j<26;j++){g.fillStyle=j%3?'#5f9a3c':'#77b04e';el(g,p.x-w/2+(j%13)*w/12,p.y-h-u*(j<13?.6:1.4)*k,u*1.6*k,u*1.1*k);g.fill();}
  g.fillStyle='#6a3a8a';for(var b=0;b<5;b++){el(g,p.x-w*.4+b*w*.2,p.y-h+u*1.2*k,u*.7*k,u*1.2*k);g.fill();}}
function basket(g,p,u){var k=p.k;g.fillStyle='#b8874a';g.beginPath();g.moveTo(p.x-u*3*k,p.y-u*2.6*k);g.lineTo(p.x+u*3*k,p.y-u*2.6*k);g.lineTo(p.x+u*2.3*k,p.y);g.lineTo(p.x-u*2.3*k,p.y);g.fill();
  g.strokeStyle='#8a6030';g.lineWidth=u*.3*k;g.beginPath();g.arc(p.x,p.y-u*2.6*k,u*2.6*k,PI,0);g.stroke();
  if(M.isOpen('griby')||true){g.fillStyle='#b5562a';el(g,p.x-u*1*k,p.y-u*3*k,u*1.3*k,u*.8*k);g.fill();g.fillStyle='#8a4a22';el(g,p.x+u*1.2*k,p.y-u*2.9*k,u*1.1*k,u*.7*k);g.fill();}}

function well(g,p,u){var k=p.k,w=u*8*k,h=u*5*k;g.fillStyle='rgba(0,0,0,.2)';el(g,p.x,p.y,w*.7,u*1.2*k);g.fill();
  g.fillStyle=lg(g,p.x-w/2,0,p.x+w/2,0,[0,'#7a5232',.5,'#a87648',1,'#6a4428']);g.fillRect(p.x-w/2,p.y-h,w,h);g.strokeStyle='rgba(60,35,15,.5)';g.lineWidth=Math.max(1,u*.2*k);for(var i=1;i<4;i++){g.beginPath();g.moveTo(p.x-w/2,p.y-h+i*h/4);g.lineTo(p.x+w/2,p.y-h+i*h/4);g.stroke();}
  g.fillStyle='#24323a';el(g,p.x,p.y-h,w*.5,u*1*k);g.fill();
  g.fillStyle='#6a4428';g.fillRect(p.x-w*.46,p.y-h-u*7*k,u*.8*k,u*7*k);g.fillRect(p.x+w*.46-u*.8*k,p.y-h-u*7*k,u*.8*k,u*7*k);
  g.fillStyle='#5d6f6a';g.beginPath();g.moveTo(p.x-w*.7,p.y-h-u*6.5*k);g.lineTo(p.x,p.y-h-u*10*k);g.lineTo(p.x+w*.7,p.y-h-u*6.5*k);g.fill();
  g.fillStyle='#8a6a44';g.fillRect(p.x-w*.42,p.y-h-u*5*k,w*.84,u*1*k);g.strokeStyle='#8a8a8a';g.lineWidth=Math.max(1,u*.15);g.beginPath();g.moveTo(p.x,p.y-h-u*4.2*k);g.lineTo(p.x,p.y-h-u*1.6*k);g.stroke();
  g.fillStyle='#9aa4ab';g.fillRect(p.x-u*.9*k,p.y-h-u*1.8*k,u*1.8*k,u*1.6*k);}
function bush(g,p,u,i){var k=p.k,R=A.rnd(31+i),w=u*7*k;g.fillStyle='rgba(0,0,0,.16)';el(g,p.x,p.y,w*.8,u*1.2*k);g.fill();
  var cs=['#3f7a32','#4f9440','#5fa84c'];for(var c=0;c<3;c++)for(var j=0;j<6;j++){g.fillStyle=cs[c];el(g,p.x+(R()-.5)*w*1.1,p.y-u*2*k-R()*u*3*k-c*u*.6*k,u*(2.2-c*.4)*k,u*(1.9-c*.3)*k);g.fill();}
  var bc=i%2?'#d8392b':'#f2f2f2';for(var b=0;b<9;b++){g.fillStyle=i%3===2?'#7a3ab0':bc;el(g,p.x+(R()-.5)*w,p.y-u*1.5*k-R()*u*4*k,u*.45*k,u*.45*k);g.fill();}}
function woodpile(g,p,u){var k=p.k,r=u*1.1*k;for(var row=0;row<4;row++)for(var i=0;i<7-row;i++){var x=p.x-u*6*k+row*r+i*r*2,y=p.y-r-row*r*1.75;g.fillStyle='#b98a56';el(g,x,y,r,r*.95);g.fill();g.strokeStyle='#8a5e34';g.lineWidth=Math.max(1,r*.18);el(g,x,y,r*.55,r*.5);g.stroke();}}
function hens(g,t,u,calm){var p=at(D.P.hen),k=p.k;for(var i=0;i<3;i++){var ph=t*.35+i*2.1,x=p.x+Math.sin(ph)*u*8*k+(i-1)*u*6*k,y=p.y+Math.cos(ph*1.3)*u*2*k+i*u*1.5*k,dir=Math.cos(ph)>0?1:-1,peck=calm?0:Math.max(0,Math.sin(t*3+i*2))>.85?1:0;
  g.save();g.translate(x,y);g.scale(dir*u*.28*k,u*.28*k);g.fillStyle='rgba(0,0,0,.18)';el(g,0,0,7,1.6);g.fill();
  g.strokeStyle='#e0a030';g.lineWidth=1;g.beginPath();g.moveTo(-1.5,0);g.lineTo(-1.5,-3.5);g.moveTo(1.5,0);g.lineTo(1.5,-3.5);g.stroke();
  g.fillStyle=i===1?'#b8682e':'#fbf6ec';el(g,0,-7,7,5);g.fill();g.beginPath();g.moveTo(-6,-8);g.lineTo(-10,-14);g.lineTo(-4,-11);g.fill();
  g.save();g.translate(5,-11);g.rotate(peck?1.1:0);g.fillStyle=i===1?'#b8682e':'#fbf6ec';el(g,0,-2,3,3.2);g.fill();g.fillStyle='#e23b2b';el(g,0,-5.2,1.6,1.4);g.fill();el(g,2.6,-.6,.9,1.3);g.fill();
  g.fillStyle='#f0b030';g.beginPath();g.moveTo(2.6,-2.6);g.lineTo(5,-2);g.lineTo(2.6,-1.2);g.fill();g.fillStyle='#222';el(g,1.2,-2.8,.6,.6);g.fill();g.restore();g.restore();}}
/* ---------- кадр ---------- */
function render(){if(!D)return;var g=D.g,W=D.W,H=D.H,t=D.t,u=D.u,td=D.td,calm=calmOn(),sk=skins();
  if(!D.bg)D.bg=buildBg();g.drawImage(D.bg,0,0,W,H);
  // облака
  if(td!=='night'){for(var i=0;i<4;i++){var cw=u*(16+i*4),cx=((i*W*.31+t*u*(.4+i*.12))%(W+cw*2))-cw;A.cloud(g,cx,D.hz*(.18+i*.13),cw,.75);}}
  else{for(var i2=0;i2<2;i2++){var cw2=u*22,cx2=((i2*W*.5+t*u*.3)%(W+cw2*2))-cw2;A.cloud(g,cx2,D.hz*(.3+i2*.2),cw2,.08);}}
  // вода: блики
  if(D.water){var w=D.water;g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=Math.max(1,u*.25);for(var r=0;r<5;r++){var q=(t*.15+r/5)%1,yy=w.y-w.ry*.6+r*w.ry*.25,xx=w.x+Math.sin(t*.6+r*2)*w.rx*.4;g.globalAlpha=Math.sin(q*PI)*.8;g.beginPath();g.moveTo(xx-u*2,yy);g.lineTo(xx+u*2,yy);g.stroke();}g.globalAlpha=1;}
  // дым из трубы и бани
  if(D.chim&&(td!=='day'||t%20<12))A.smoke(g,D.chim.x,D.chim.y,D.chim.s,t,.3);
  if(D.banya&&sk.banya)A.smoke(g,D.banya.x,D.banya.y,D.banya.s,t+3,.45);
  // берёза
  if(D.bz)A.birch(g,D.bz.x,D.bz.y,u*14*D.bz.k,t,false);
  // кот на крыльце
  var cp=D.porch?D.porch:at(D.P.cat),catPose=td==='night'?'sleep':(Math.floor(t/9)%3===2?'sit':'loaf');
  A.cat(g,cp.x,cp.y,u*(catPose==='sit'?8:6)*cp.k,t,{pose:catPose,look:Math.sin(t*.3)});
  hens(g,t,u,calm);
  // костёр с котелком
  var fr=at(D.P.fire),fs=u*3.4*fr.k;tripod(g,fr,fs,t,calm);
  // Петрович
  var pt=at(D.P.petr);var pose=D.petrPose&&D.petrPose.until>t?D.petrPose:{arm:'tea',face:'smile'};
  A.petr(g,pt.x,pt.y,u*24*pt.k,t,{arm:pose.arm,face:pose.face,look:pose.look||.3});
  // яблоня поверх (передний план относительно стола)
  var tr=at(D.P.tree);A.appleTree(g,tr.x,tr.y,u*30*tr.k,calm?0:t,{});
  // фонарики
  if(sk.lights&&D.lightsA){lights(g,D.lightsA,{x:tr.x-u*6,y:tr.y-u*24*tr.k},u,t,td);}
  // бабочки днём, светлячки ночью
  if(!calm)life(g,W,H,u,t,td);
  // время суток
  var P=A.TOD[td];if(P.dark){g.fillStyle=td==='night'?'rgba(10,18,48,'+P.dark+')':'rgba(120,60,40,'+P.dark+')';g.fillRect(0,0,W,H);}
  if(td==='night'||td==='evening'){A.glow(g,fr.x,fr.y-fs*.3,fs*(td==='night'?9:6)*(.9+.1*Math.sin(t*9)),'255,170,70',td==='night'?.45:.3);
    if(D.porch)A.glow(g,D.porch.x,D.porch.y-u*8*D.porch.k,u*7,'255,220,140',.35);
    if(sk.lights&&D.lightsA)lights(g,D.lightsA,{x:tr.x-u*6,y:tr.y-u*24*tr.k},u,t,td,true);
    if(td==='night'&&!calm)for(var f=0;f<14;f++){var fx=(Math.sin(t*.3+f*1.7)*.5+.5)*W,fy=D.hz+(Math.cos(t*.23+f*2.1)*.5+.5)*(D.gb-D.hz)*.9,a=.5+.5*Math.sin(t*3+f);A.glow(g,fx,fy,u*1.6,'220,255,140',a*.9);}}
  // костёр поверх затемнения (светится)
  A.fire(g,fr.x,fr.y,fs,t,{night:td==='night',noGlow:true,calm:calm});}
function tripod(g,p,s,t,calm){g.strokeStyle='#4a3424';g.lineWidth=s*.12;g.lineCap='round';var top={x:p.x,y:p.y-s*2.6};
  g.beginPath();g.moveTo(p.x-s*1.1,p.y+s*.1);g.lineTo(top.x,top.y);g.moveTo(p.x+s*1.1,p.y+s*.1);g.lineTo(top.x,top.y);g.moveTo(p.x+s*.2,p.y-s*.2);g.lineTo(top.x,top.y);g.stroke();
  g.strokeStyle='#2a2a2a';g.lineWidth=s*.05;g.beginPath();g.moveTo(top.x,top.y);g.lineTo(top.x,p.y-s*1.75);g.stroke();
  g.fillStyle=lg(g,p.x-s*.6,0,p.x+s*.6,0,[0,'#1f2326',.5,'#4a5258',1,'#1f2326']);g.beginPath();g.moveTo(p.x-s*.62,p.y-s*1.6);g.quadraticCurveTo(p.x-s*.7,p.y-s*.9,p.x,p.y-s*.85);g.quadraticCurveTo(p.x+s*.7,p.y-s*.9,p.x+s*.62,p.y-s*1.6);g.closePath();g.fill();
  g.fillStyle='#c8a050';el(g,p.x,p.y-s*1.6,s*.6,s*.14);g.fill();
  if(!calm)A.smoke(g,p.x,p.y-s*1.7,s*.6,t,.4);}
function lights(g,a,b,u,t,td,glowOnly){var n=9;for(var i=0;i<=n;i++){var q=i/n,x=a.x+(b.x-a.x)*q,y=a.y+(b.y-a.y)*q+Math.sin(q*PI)*u*3;
  if(!glowOnly){if(i<n){var q2=(i+1)/n,x2=a.x+(b.x-a.x)*q2,y2=a.y+(b.y-a.y)*q2+Math.sin(q2*PI)*u*3;g.strokeStyle='#3a3a3a';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();}
    g.fillStyle=['#ffd24a','#ff7a5a','#7ad0ff','#9cff7a'][i%4];el(g,x,y+u*.6,u*.5,u*.7);g.fill();}
  else A.glow(g,x,y+u*.6,u*2.2,'255,220,140',.55+.25*Math.sin(t*2+i));}}
function life(g,W,H,u,t,td){if(td==='night')return;for(var i=0;i<3;i++){var x=((t*u*2.2*(1+i*.3)+i*W*.4)%(W+40))-20,y=D.hz+(D.gb-D.hz)*(.3+i*.2)+Math.sin(t*2+i)*u*3,fl=Math.abs(Math.sin(t*14+i));
  g.fillStyle=['#fff7a8','#ffffff','#ffb05a'][i];el(g,x-u*.5*fl,y,u*.55*fl+.5,u*.75);g.fill();el(g,x+u*.5*fl,y,u*.55*fl+.5,u*.75);g.fill();}}
function calmOn(){try{return calm();}catch(e){return false;}}
function loop(){var last=0;function st(ts){if(!D)return;var dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;
  if(!document.hidden&&!M.cur){D.t+=dt;var lowSkip=false;try{lowSkip=typeof LOW!=='undefined'&&LOW&&(D.fr=(D.fr||0)+1)%2;}catch(e){}if(!lowSkip)render();}
  D.raf=requestAnimationFrame(st);}D.raf=requestAnimationFrame(st);ui();}
function onTap(e){if(!D)return;var r=D.c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;var pt=at(D.P.petr),s=D.u*24*pt.k;
  if(Math.abs(x-pt.x)<s*.3&&y<pt.y&&y>pt.y-s){petrTalk();return;}
  var cp=D.porch||at(D.P.cat);if(Math.abs(x-cp.x)<D.u*6&&Math.abs(y-cp.y+D.u*3)<D.u*5){try{SND.meow();}catch(x2){}bubble(L('Васька','Vaska'),pickS(CAT_SAY));}}
var CAT_SAY=[['Мр-р. (Васька намекает, что рыбу чистить пора.)'],['Мяу! (Это значит: «А мне?»)'],['Васька притворился спящим. Но одним глазом следит за ведром.']];
var PETR_SAY=[['Заходи, внучок! Чай горячий, байки свежие.'],['Хорошая уха — это когда рыба, костёр и не торопишься.'],['Васька опять у крыльца караулит. Знает, кто сегодня с уловом.'],['Митяй вчера хвастал — говорит, леща на кило поймал. Врёт, поди. Или нет?'],['Дел во дворе на всех хватит. Выбирай, что по душе.']];
function pickS(a){var x=a[Math.floor(Math.random()*a.length)];return L2(x);}
function petrTalk(){D.petrPose={arm:'talk',face:'talk',until:D.t+2.4};bubble(L('Петрович','Petrovich'),pickS(PETR_SAY));try{SND.tap();}catch(e){}}
function bubble(who,txt){if(!D)return;var b=D.lay.querySelector('.mg-bub');if(D.port){var ph=D.lay.querySelector('.mg-pnl').offsetHeight;b.style.top='auto';b.style.bottom=(ph+22)+'px';}else{b.style.top='';b.style.bottom='';}b.innerHTML='<b>'+who+'</b><span></span>';b.querySelector('span').textContent=txt;b.classList.add('on');clearTimeout(D.bub);D.bub=setTimeout(function(){if(D)b.classList.remove('on');},4200);}
function greet(){if(!D)return;var d=M.deloState(),ds=DAYS[M.wday(M.dKey())],txt;
  if(M.leftToday('baiki')>0)txt=L('Заходи, внучок! Байки свежие готовы — проверим, отличишь ли правду от вранья?','Come in! Fresh tales today — can you tell truth from fibs?');
  else if(d&&!d.n)txt=L('Сегодня '+ds[0]+' — дело дня: ','Today is '+ds[1]+' — task: ')+L2(MG.by[d.id].n)+'.';
  else txt=pickS(PETR_SAY);
  D.petrPose={arm:'wave',face:'talk',until:D.t+2.2};bubble(L('Петрович','Petrovich'),txt);}

/* ---------- интерфейс: станции, панель «Дело дня», уровень ---------- */
function ui(){if(!D)return;var m=M.day(),lv=M.lvlOf(m.pt||0),p0=M.lvlPts(lv),p1=M.lvlPts(lv+1);
  D.lay.querySelector('.mg-lvn').innerHTML=icn('star')+' '+L('Знаток двора','Yard expert')+' · '+lv;D.lay.querySelector('.mg-lvbar i').style.width=Math.round(100*((m.pt||0)-p0)/Math.max(1,p1-p0))+'%';
  // станции
  var box=D.lay.querySelector('.mg-stns'),h='',dl=M.deloState();
  for(var i=0;i<MG.list.length;i++){var id=MG.list[i].id;if(!MG.reg[id])continue;var p=D.P.st[id];if(!p)continue;var q=p==='petr'?petrTop():at(p),op=M.isOpen(id);if(!D.port&&D.W<1100&&p!=='petr'&&POS_N[id]){var n=POS_N[id],a0=at([0,n[1]]);q={x:16+n[0]*(D.W-D.panW-40),y:a0.y,k:a0.k};} /*MERGE: узкий ПК (VK 800×600) — своя раскладка станций слева от панели*/
    var meta=MG.by[id];if(meta.season&&!op)continue; // сезонная вне сезона — не показываем
    var left=op&&M.leftToday(id)>0,isD=dl&&dl.id===id,dd=isD&&!dl.n,cls='mg-stn'+(op?'':' lock')+(left||dd?' hot':'')+(isD?' delo':'');
    h+='<button type="button" class="'+cls+'" data-id="'+id+'" style="left:'+Math.round(Math.max(40,Math.min(D.W-40,q.x)))+'px;top:'+Math.round(q.y)+'px"><span class="mg-sb">'+icn(op?(REGIC(id)):'lock')+(left||dd?'<i class="mg-dot"></i>':'')+(op&&!left&&!dd?'<i class="mg-ok">'+icn('check')+'</i>':'')+'</span>'+
      '<span class="mg-sl">'+(isD&&op?'<em>'+L('Дело дня','Task')+'</em>':'')+L2(SHORT[id])+'</span></button>';}
  box.innerHTML=h;box.onclick=function(e){var b=e.target.closest&&e.target.closest('.mg-stn');if(!b)return;try{SND.tap();}catch(x){}stationCard(b.getAttribute('data-id'));};
  panel();relax(box);}
/* RB:MGPC станции не налезают друг на друга и не уходят за край/под панели (любой экран и язык): раздвигаем по меньшему перекрытию и держим в видимой части */
function relax(box){if(!D)return;var bs=[].slice.call(box.querySelectorAll('.mg-stn'));if(!bs.length)return;
  var W=D.W,H=D.H,top=D.port?96:96,tp=D.lay.querySelector('.mg-dtop');if(tp)top=Math.max(top,tp.offsetHeight+6);
  var pn=D.lay.querySelector('.mg-pnl'),right=W-6,bottom=H-6;if(D.port){if(pn&&pn.offsetHeight)bottom=H-pn.offsetHeight-16;}else right=W-(D.panW||0)-22;
  var it=bs.map(function(b){return {b:b,x:parseFloat(b.style.left)||0,y:parseFloat(b.style.top)||0,w:b.offsetWidth+8,h:b.offsetHeight+6};});
  function clamp(q){q.x=Math.max(6+q.w/2,Math.min(right-q.w/2,q.x));q.y=Math.max(top+q.h,Math.min(bottom,q.y));}
  it.forEach(clamp);
  function push(q,k,d){var o=q[k];q[k]+=d;clamp(q);return Math.abs(d)-Math.abs(q[k]-o);} // сдвиг с учётом краёв; вернёт, сколько не удалось
  for(var n=0;n<400;n++){var moved=false;
    for(var i=0;i<it.length;i++)for(var j=i+1;j<it.length;j++){var a=it[i],c=it[j];
      var ox=Math.min(a.x+a.w/2,c.x+c.w/2)-Math.max(a.x-a.w/2,c.x-c.w/2),oy=Math.min(a.y,c.y)-Math.max(a.y-a.h,c.y-c.h);if(ox<=0||oy<=0)continue;moved=true;
      var ax=ox<oy*1.4,k=ax?'x':'y',need=(ax?ox:oy)+1,sg=(ax?a.x<=c.x:a.y<=c.y)?-1:1,left=push(a,k,sg*need/2);left=push(c,k,-sg*(need-left));if(left>.5)push(a,k,sg*left);
      if(left>.5){k=ax?'y':'x';need=(ax?oy:ox)+1;sg=(ax?a.y<=c.y:a.x<=c.x)?-1:1;left=push(a,k,sg*need/2);left=push(c,k,-sg*(need-left));if(left>.5)push(a,k,sg*left);}}
    if(!moved)break;}
  // не разошлись (узкий телефон) — ровная сетка в видимой части, порядок — как в сцене (сверху вниз, слева направо)
  var bad=false;for(var i2=0;i2<it.length&&!bad;i2++)for(var j2=i2+1;j2<it.length;j2++){var p1=it[i2],p2=it[j2];if(Math.min(p1.x+p1.w/2,p2.x+p2.w/2)-Math.max(p1.x-p1.w/2,p2.x-p2.w/2)>12&&Math.min(p1.y,p2.y)-Math.max(p1.y-p1.h,p2.y-p2.h)>12){bad=true;break;}}
  if(bad&&D.port){var cols=Math.max(3,Math.min(5,Math.floor((right-6)/74))),rows=Math.ceil(it.length/cols),cw=(right-6)/cols,rh=(bottom-top)/rows,srt=it.slice().sort(function(a,c){return a.y-c.y;});
    for(var r=0;r<rows;r++){var row=srt.slice(r*cols,r*cols+cols).sort(function(a,c){return a.x-c.x;}),off=(cols-row.length)*cw/2;
      row.forEach(function(q,ci){q.x=6+off+(ci+.5)*cw;q.y=top+(r+1)*rh-Math.max(0,(rh-q.h)/2);});}}
  it.forEach(function(q){q.b.style.left=Math.round(q.x)+'px';q.b.style.top=Math.round(q.y)+'px';});}
function petrTop(){var pt=at(D.P.petr);return {x:pt.x,y:pt.y-D.u*24*pt.k*1.04};}
function REGIC(id){var g=MG.reg[id];return g&&g.icon&&IC[g.icon]?g.icon:id;}
function panel(){var pn=D.lay.querySelector('.mg-pnl'),d=M.deloState(),ds=DAYS[M.wday(M.dKey())],h='';
  if(d){var g=MG.reg[d.id],can=M.isOpen(d.id),st,btn;
    if(!d.n){st=L('Один заход с наградой','One rewarded run');btn='<button class="mg-btn" data-a="delo">'+L('Играть','Play')+'</button>';}
    else if(!d.ad&&adOkS()){st=L('Сделано! Ещё заход за ролик — половина награды','Done! One more run for an ad — half reward');btn='<button class="mg-btn sec" data-a="deload">'+icn('ad')+' '+L('Ещё заход','One more')+'</button>';}
    else{st=L('Сделано! Завтра — новое дело','Done! New task tomorrow');btn='<span class="mg-done">'+icn('check')+'</span>';}
    h+='<div class="mg-delo"><div class="mg-di">'+icn(REGIC(d.id))+'</div><div class="mg-dt"><div class="mg-dk">'+L('Дело дня','Task of the day')+' · '+L2(ds)+'</div><div class="mg-dn">'+L2(MG.by[d.id].n)+'</div><div class="mg-ds">'+st+'</div></div>'+btn+'</div>';}
  else{var fid='';for(var i=0;i<MG.list.length;i++){var x=MG.list[i].id;if(MG.reg[x]&&M.leftToday(x)>0){fid=x;break;}}
    if(fid)h+='<div class="mg-delo"><div class="mg-di">'+icn(REGIC(fid))+'</div><div class="mg-dt"><div class="mg-dk">'+L2(ds).charAt(0).toUpperCase()+L2(ds).slice(1)+'</div><div class="mg-dn">'+L2(MG.by[fid].n)+'</div><div class="mg-ds">'+L('Можно сыграть с наградой','Rewarded run ready')+'</div></div><button class="mg-btn" data-id="'+fid+'" data-a="pl">'+L('Играть','Play')+'</button></div>';
    else h+='<div class="mg-delo none"><div class="mg-di">'+icn('check')+'</div><div class="mg-dt"><div class="mg-dn">'+L('На сегодня всё сделано','All done for today')+'</div><div class="mg-ds">'+L('Новые дела во дворе открываются на новых местах','New activities open at new places')+'</div></div></div>';}
  var n=M.todo();
  h+='<div class="mg-prow"><button class="mg-btn sec" data-a="book">'+icn('book')+' '+L('Книга двора','Yard book')+'</button><button class="mg-btn sec" data-a="train">'+icn('train')+' '+L('Тренировка','Practice')+'</button></div>';
  if(D.port)h+='';else h='<div class="mg-ph">'+L('Сегодня во дворе','Today in the yard')+(n?' · <b>'+n+' '+plural2(n)+'</b>':'')+'</div>'+h+todayList();
  pn.innerHTML=h;
  try{if(h.indexOf('data-a="deload"')>=0)STAT.offer('mg_delo');}catch(e){} /*MERGE STAT: кнопка «Ещё заход» за ролик показана*/
  pn.onclick=function(e){var b=e.target.closest&&e.target.closest('[data-a],[data-id]');if(!b)return;var a=b.getAttribute('data-a');try{SND.tap();}catch(x){}
    if(a==='pl'){playG(b.getAttribute('data-id'));return;}if(b.getAttribute('data-id')){stationCard(b.getAttribute('data-id'));return;}
    if(a==='delo')playG(d.id,{delo:true});else if(a==='deload'){M.play&&adDelo(d.id);}else if(a==='book')openBook();else if(a==='train')openTrain();};}
/* ---------- RB:MGPC Двор на ПК: мышь — наведение/щелчок по станциям; ← → ↑ ↓ — по станциям, Enter/пробел — открыть, Esc — закрыть окно или назад ---------- */
var kbdShown=false;
function dvKbdHint(){if(!D||kbdShown||!(M.pc&&M.pc()))return;kbdShown=true;var b=document.createElement('div');b.className='mg-kh top';
  b.innerHTML=L('Мышью — выбери дело во дворе. Или клавишами: ','Click a yard activity. Or use keys: ')+M.kc('←')+M.kc('→')+L(' — выбрать, ',' — choose, ')+M.kc('Enter')+L(' — открыть, ',' — open, ')+M.kc('Esc')+L(' — назад',' — back');
  D.lay.appendChild(b);setTimeout(function(){b.classList.add('on');},400);setTimeout(function(){b.classList.remove('on');},7400);setTimeout(function(){if(b.parentNode)b.parentNode.removeChild(b);},8000);}
function dvStations(){if(!D)return [];return [].slice.call(D.lay.querySelectorAll('.mg-stn')).sort(function(a,b){var ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return (Math.abs(ra.top-rb.top)<40?0:ra.top-rb.top)||ra.left-rb.left;});}
function dvMove(k){var l=dvStations();if(!l.length)return;var cur=document.activeElement,i=l.indexOf(cur);
  if(i<0){l[0].focus();return;}var r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,best=null,bd=1e9;
  for(var j=0;j<l.length;j++){if(j===i)continue;var q=l[j].getBoundingClientRect(),dx=q.left+q.width/2-cx,dy=q.top+q.height/2-cy,ok=k==='ArrowRight'?dx>8:k==='ArrowLeft'?dx<-8:k==='ArrowDown'?dy>8:dy<-8;if(!ok)continue;
    var d=(k==='ArrowRight'||k==='ArrowLeft')?Math.abs(dx)+Math.abs(dy)*2.2:Math.abs(dy)+Math.abs(dx)*2.2;if(d<bd){bd=d;best=l[j];}}
  if(!best)best=l[(i+(k==='ArrowRight'||k==='ArrowDown'?1:l.length-1))%l.length];best.focus();}
window.addEventListener('keydown',function(e){if(!D||M.cur||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;var ad=document.getElementById('ad');if(ad&&ad.classList.contains('on'))return;
  var k=e.key,ent=k==='Enter'||k===' ',sh=D.lay.querySelector('.mg-sheet'),ae=document.activeElement,inLay=ae&&ae.tagName==='BUTTON'&&(sh?sh.contains(ae):D.lay.contains(ae));
  if(k==='Escape'){e.preventDefault();if(e.repeat)return;if(sh){sh.parentNode.removeChild(sh);return;}try{SND.tap();}catch(x){}close();return;}
  if(ent){if(e.repeat){e.preventDefault();return;}if(inLay)return; // кнопка в фокусе — браузер нажмёт сам
    var b=sh?sh.querySelector('.mg-btn:not(.sec)')||sh.querySelector('.mg-btn'):D.lay.querySelector('.mg-pnl .mg-btn:not(.sec)');if(b){e.preventDefault();b.click();}return;}
  if(/^Arrow/.test(k)){e.preventDefault();if(sh){var bs=[].slice.call(sh.querySelectorAll('button')),ix=bs.indexOf(ae);if(bs.length)bs[(ix+(k==='ArrowRight'||k==='ArrowDown'?1:bs.length-1+(ix<0?1:0)))%bs.length].focus();return;}dvMove(k);}});
function plural2(n){try{return pl(n,'дело','дела','дел','task','tasks');}catch(e){return L('дел','tasks');}}
function todayList(){var h='<div class="mg-tl">',n=0,dl=M.deloState();for(var i=0;i<MG.list.length&&n<3;i++){var id=MG.list[i].id;if(!MG.reg[id]||!M.isOpen(id)||dl&&dl.id===id)continue;if(!(M.leftToday(id)>0))continue;n++;
  h+='<button type="button" class="mg-tli hot" data-id="'+id+'">'+icn(REGIC(id))+'<span>'+L2(MG.by[id].n)+'</span><small>'+L('можно сыграть','ready')+'</small></button>';}
  return n?h+'</div>':'';}
function adOkS(){try{return adOk();}catch(e){return false;}}
function adDelo(id){var C={id:id};try{if(adHold('mg_delo'))return;}catch(e){}try{STAT.place&&STAT.place('mg_delo');}catch(e){}
  showRewarded(function(){playG(id,{delo:true,adRun:true});},null,function(){return L('ещё заход открыт — загляни во двор','extra run unlocked');});}
function playG(id,o){M.play(id,o||{});}
function stationCard(id){var g=MG.reg[id],meta=MG.by[id],op=M.isOpen(id),left=M.leftToday(id),m=M.day(),dl=M.deloState(),isD=dl&&dl.id===id&&!dl.n;
  var desc=g.d?L(g.d.ru||g.d[0],g.d.en||g.d[1]):'';
  var st=!op?M.openHint(id):isD?L('Сегодня это — Дело дня!','This is today\'s task!'):left?L('Сегодня: заходов с наградой — ','Rewarded runs today: ')+left:g.kind==='delo'?L('Бывает Делом дня. Сейчас — тренировка ради рекорда.','Comes as a daily task. Now — practice for the record.'):L('На сегодня сыграно — завтра снова. Тренировка — когда угодно.','Done for today. Practice any time.');
  var h='<div class="mg-card"><div class="mg-ci">'+icn(op?REGIC(id):'lock')+'</div><div class="mg-h">'+L2(meta.n)+'</div>'+(desc?'<p>'+desc+'</p>':'')+'<div class="mg-cs'+(op&&(left||isD)?' hot':'')+'">'+st+'</div>'+
    (m.rec[id]?'<div class="mg-cr">'+icn('star')+' '+L('Рекорд','Record')+': <b>'+m.rec[id]+'</b></div>':'')+'<div class="mg-row">';
  if(op){if(isD)h+='<button class="mg-btn" data-a="delo">'+L('Играть','Play')+'</button>';else if(left)h+='<button class="mg-btn" data-a="play">'+L('Играть','Play')+'</button>';
    h+='<button class="mg-btn sec" data-a="train">'+icn('train')+' '+L('Тренировка','Practice')+'</button>';}
  h+='<button class="mg-btn sec" data-a="x">'+L('Закрыть','Close')+'</button></div></div>';
  sheet(h,function(a){if(a==='play')playG(id);else if(a==='delo')playG(id,{delo:true});else if(a==='train')playG(id,{train:true});});}
function sheet(html,cb){var s=document.createElement('div');s.className='mg-sheet';s.innerHTML=html;D.lay.appendChild(s);
  var cd=s.querySelector('.mg-card');if(cd)cd.insertAdjacentHTML('afterbegin','<button type="button" class="mg-cx" data-a="x" aria-label="'+L('Закрыть','Close')+'">'+icn('close')+'</button>'); /*RB:MGPC крестик всегда виден (длинная Книга — «Закрыть» внизу за прокруткой)*/
  s.onclick=function(e){var b=e.target.closest&&e.target.closest('[data-a]');if(e.target===s){s.parentNode.removeChild(s);return;}if(!b)return;var a=b.getAttribute('data-a');s.parentNode.removeChild(s);if(a!=='x'&&cb)cb(a);};return s;}
function openTrain(){var h='<div class="mg-card wide"><div class="mg-h">'+L('Тренировка','Practice')+'</div><p>'+L('Любая открытая игра — сколько хочешь, без наград. Только ради рекорда.','Any open game, as often as you like. No rewards — just records.')+'</p><div class="mg-tg">';
  var m=M.day(),any=false;for(var i=0;i<MG.list.length;i++){var id=MG.list[i].id;if(!MG.reg[id]||!M.isOpen(id))continue;any=true;h+='<button type="button" class="mg-tgi" data-a="t:'+id+'">'+icn(REGIC(id))+'<b>'+L2(MG.by[id].n)+'</b><small>'+(m.rec[id]?L('рекорд ','record ')+m.rec[id]:L('без рекорда','no record yet'))+'</small></button>';}
  if(!any)h+='<p>'+L('Пока нечего — игры откроются по ходу рыбалки.','Nothing yet.')+'</p>';
  h+='</div><div class="mg-row"><button class="mg-btn sec" data-a="x">'+L('Закрыть','Close')+'</button></div></div>';
  sheet(h,function(a){if(a.indexOf('t:')===0)playG(a.slice(2),{train:true});});}
function openBook(){var m=M.day(),lv=M.lvlOf(m.pt||0),p0=M.lvlPts(lv),p1=M.lvlPts(lv+1),G=M.BOOK_GIFT,SK=M.SKINS;
  try{STAT.ev('mg',{a:'book',lv:lv});}catch(e){} /*MERGE STAT: Книга двора открыта*/
  var h='<div class="mg-card wide book"><div class="mg-ci">'+icn('book')+'</div><div class="mg-h">'+L('Книга двора','Yard book')+'</div>'+
    '<div class="mg-blv">'+L('Знаток двора','Yard expert')+': <b>'+lv+'</b> '+L('уровень','level')+'<div class="mg-bbar"><i style="width:'+Math.round(100*((m.pt||0)-p0)/Math.max(1,p1-p0))+'%"></i></div><small>'+(m.pt||0)+' / '+p1+' '+L('очков до уровня','points to level')+' '+(lv+1)+'</small></div>'+
    '<div class="mg-bh">'+L('Подарки знатоку','Expert gifts')+'</div><div class="mg-gifts">';
  for(var k in G){var got=lv>=+k,gi=G[k],dn=gi.dec&&typeof DEC!=='undefined'&&DEC[gi.dec]?L(DEC[gi.dec].n,DEC[gi.dec].en):'';h+='<div class="mg-gift'+(got?' got':'')+'"><span class="mg-gl">'+k+'</span>'+icn(got?'check':'gift')+'<small>'+dn+(gi.sk?'<br>'+L2(SK[gi.sk]):'')+'</small></div>';}
  h+='</div><div class="mg-bh">'+L('Рекорды','Records')+'</div><div class="mg-recs">';var any=false;
  for(var i=0;i<MG.list.length;i++){var id=MG.list[i].id;if(!MG.reg[id])continue;var op=M.isOpen(id);any=true;
    h+='<div class="mg-ri'+(op?'':' lock')+'">'+icn(op?REGIC(id):'lock')+'<span>'+L2(MG.by[id].n)+'</span><b>'+(op?(m.rec[id]||'—'):'')+'</b><small>'+(op?L('сыграно ','played ')+(m.cnt[id]||0):M.openHint(id))+'</small></div>';
    var gb=MG.reg[id].book;if(op&&gb)try{h+='<div class="mg-rx">'+gb()+'</div>';}catch(e){}}
  if(!any)h+='<p>—</p>';
  h+='</div><div class="mg-row"><button class="mg-btn" data-a="x">'+L('Закрыть','Close')+'</button></div></div>';
  sheet(h);}

/* ---------- вход с главного экрана (гнездо UX mapSlots) и 4-е задание дня (dailySlots) ---------- */
// MG.tile() → null (Двор закрыт) | {n: «N дел», t: подпись, open()}
function tile(){if(!M.dvorOpen())return null;var n=M.todo();return {n:n,t:L('Двор','Yard')+(n?' · '+n+' '+plural2(n):''),open:open};}
// MG.dailySlot() → null | {t: текст задания, done: bool, go()} — «Дело дня» как 4-е необязательное задание дня
function dailySlot(){if(!M.dvorOpen())return null;var d=M.deloState();if(!d)return null;return {t:L('Дело дня во дворе: ','Yard task: ')+L2(MG.by[d.id].n),done:!!d.n,go:function(){open();}};}
MG.tile=tile;MG.dailySlot=dailySlot;
// кольцо «Двор» на главном экране UX: {n, sub, p 0..1 — доля сделанного сегодня, dot, open}; null — Двор ещё закрыт
window.uiDvor=function(){if(!M.dvorOpen())return null;var n=M.todo(),m=M.day(),dn=0,d=M.deloState();for(var id in MG.reg)if(m.p[id])dn++;if(d&&d.n)dn++;
  return {n:L('Двор','Yard'),sub:n?n+' '+plural2(n):L('всё сделано','all done'),p:dn+n?dn/(dn+n):1,dot:n>0,open:open};};
// гнёзда UX (cherry-pick 914eee8): плитка «Двор» на главном экране и строка «Дело дня» в «Целях» (вкладка «День»)

function tileArt(){return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 24L24 9l18 15" fill="#5d7f7a"/><path d="M10 22h28v18H10z" fill="#b07a46"/><path d="M10 26h28M10 30h28M10 34h28" stroke="#7a4e2a" stroke-width="1"/><rect x="15" y="27" width="7" height="7" fill="#bfe3f2" stroke="#f6f1e6" stroke-width="1.5"/><rect x="27" y="29" width="6" height="11" fill="#5a3a22"/><circle cx="40" cy="36" r="5" fill="#ec9440"/><path d="M36.5 32.5l1-4 2.5 3zM43.5 32.5l-1-4-2.5 3z" fill="#ec9440"/></svg>';}

// после игры — обратно во двор (оболочка зовёт MG_DVOR.open)
window.MG_DVOR={open:function(){if(D){ui();return;}open();},close:close,get on(){return !!D;},refresh:function(){if(D){D.bg=null;ui();}}};

var DV_CSS='.mg-dv{position:absolute;left:0;top:0;width:100%;height:100%;z-index:29;overflow:hidden;background:#8fbf5f;font-family:var(--font,system-ui,sans-serif);color:#fff;-webkit-user-select:none;user-select:none}'+
'.mg-dvc{position:absolute;left:0;top:0;width:100%;height:100%;display:block}'+
'.mg-dtop{position:absolute;left:0;right:0;top:0;display:flex;align-items:flex-start;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 0;z-index:4;pointer-events:none}.mg-dtop>*{pointer-events:auto}'+
'.mg-dv .mg-x{width:52px;height:52px;flex:none}.mg-ttl{flex:1;margin:0 10px;text-align:center}.mg-tn{font-size:24px;font-weight:700;text-shadow:0 2px 6px rgba(0,0,0,.55),0 0 2px rgba(0,0,0,.6);letter-spacing:.2px}'+
'.mg-lvb{margin-top:4px;min-height:40px;max-width:100%;box-sizing:border-box;display:inline-flex;white-space:nowrap;align-items:center;gap:8px;padding:5px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.25);background:rgba(16,26,36,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;font:600 16px var(--font,system-ui);cursor:pointer}'+
'.mg-lvb .ic{width:18px;height:18px;vertical-align:-3px;color:#ffd27a}.mg-lvbar{display:inline-block;width:64px;height:8px;border-radius:5px;background:rgba(255,255,255,.2);overflow:hidden}.mg-lvbar i{display:block;height:100%;background:linear-gradient(90deg,#ffd27a,#ff9a52);border-radius:5px}'+
'.mg-stns{position:absolute;left:0;top:0;width:100%;height:100%;z-index:2;pointer-events:none}'+
'.mg-cx{position:sticky;top:-10px;float:right;margin:-12px -8px 0 8px;z-index:3;width:44px;height:44px;border-radius:14px;border:1px solid rgba(255,255,255,.25);background:rgba(16,26,36,.7);color:#fff;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer}.mg-cx .ic{width:22px;height:22px}.mg-cx .ic path{stroke:currentColor;stroke-width:2.2;fill:none;stroke-linecap:round}'+
'.mg-dv.port .mg-sl{white-space:normal;text-align:center;max-width:90px}'+
'.mg-dv.sm .mg-tn{font-size:20px}.mg-dv.sm .mg-ttl{min-width:0;margin:0 6px}.mg-dv.sm .mg-lvb{font-size:14px;padding:4px 10px}.mg-dv.sm .mg-lvbar{width:40px}.mg-dv.sm .mg-delo{padding:10px;gap:10px;border-radius:18px}.mg-dv.sm .mg-di{width:44px;height:44px;border-radius:14px}.mg-dv.sm .mg-di .ic{width:27px;height:27px}.mg-dv.sm .mg-dn{font-size:17px}.mg-dv.sm .mg-dk{font-size:13px}.mg-dv.sm .mg-ds{display:none}.mg-dv.sm .mg-prow{margin-top:8px}.mg-dv.sm .mg-prow .mg-btn{min-height:46px;font-size:15px}.mg-dv.sm .mg-delo .mg-btn{min-height:48px;padding:0 14px;font-size:17px}'+
'.mg-dv.sm .mg-stn{min-width:52px}.mg-dv.sm .mg-sb{width:44px;height:44px}.mg-dv.sm .mg-sb .ic{width:25px;height:25px}.mg-dv.sm .mg-sl{font-size:14px;padding:2px 7px;margin-top:3px;white-space:normal;text-align:center;max-width:76px}.mg-dv.sm .mg-sl em{font-size:11px;white-space:nowrap}.mg-dv.sm .mg-dot{width:13px;height:13px}.mg-dv.sm .mg-ok{width:18px;height:18px}'+
'.mg-stn:focus{outline:none}.mg-stn:focus-visible .mg-sb,html.mg-pc .mg-stn:hover .mg-sb{transform:scale(1.1);box-shadow:0 0 0 4px rgba(255,255,255,.9),0 8px 20px rgba(0,0,0,.4)}.mg-stn .mg-sb{transition:transform .15s,box-shadow .15s}html.mg-pc .mg-stn:hover .mg-sl,.mg-stn:focus-visible .mg-sl{background:rgba(16,26,36,.85)}'+ /*RB:MGPC наведение мышью и выбор стрелками*/
'.mg-stn{position:absolute;transform:translate(-50%,-100%);pointer-events:auto;border:0;background:none;padding:0;display:flex;flex-direction:column;align-items:center;cursor:pointer;color:#fff;font-family:inherit;min-width:64px;animation:mgBob 3s ease-in-out infinite}'+
'.mg-stn:nth-child(2n){animation-delay:-1.4s}@keyframes mgBob{50%{transform:translate(-50%,calc(-100% - 4px))}}'+
'.mg-sb{position:relative;width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.95),rgba(255,244,222,.92) 60%,rgba(230,205,160,.95));border:2.5px solid #fff;box-shadow:0 6px 14px rgba(0,0,0,.35),0 0 0 3px rgba(122,78,40,.35);color:#7a4a20}'+
'.mg-sb .ic{width:30px;height:30px;--icc:#7a4a20}.mg-sb .ic path,.mg-sb .ic circle,.mg-sb .ic rect{stroke:#7a4a20;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}.mg-sb .ic .d{fill:rgba(255,178,90,.55)}'+
'.mg-stn.hot .mg-sb{background:radial-gradient(circle at 35% 30%,#fffbe8,#ffe08a 60%,#ffb44a);box-shadow:0 6px 16px rgba(0,0,0,.35),0 0 0 3px rgba(255,180,60,.6),0 0 22px rgba(255,200,80,.8);animation:mgGlow 1.6s ease-in-out infinite}'+
'@keyframes mgGlow{50%{box-shadow:0 6px 16px rgba(0,0,0,.35),0 0 0 5px rgba(255,180,60,.45),0 0 34px rgba(255,210,90,.95)}}'+
'.mg-stn.lock .mg-sb{background:radial-gradient(circle at 35% 30%,#e6e9ec,#b9c0c6);border-color:rgba(255,255,255,.7);opacity:.85}.mg-stn.lock .mg-sb .ic path,.mg-stn.lock .mg-sb .ic rect{stroke:#5d666e}.mg-stn.lock .mg-sb .ic .d{fill:rgba(93,102,110,.25)}.mg-stn.lock .mg-sl{opacity:.8}'+
'.mg-dot{position:absolute;right:-2px;top:-2px;width:16px;height:16px;border-radius:50%;background:#ff4d3a;border:2.5px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3)}'+
'.mg-ok{position:absolute;right:-4px;bottom:-4px;width:22px;height:22px;border-radius:50%;background:#3cbf7a;border:2px solid #fff;display:flex;align-items:center;justify-content:center}.mg-ok .ic{width:14px;height:14px}.mg-ok .ic path{stroke:#fff;stroke-width:3}'+
'.mg-sl{margin-top:5px;padding:3px 10px;border-radius:11px;background:rgba(20,30,40,.72);font-size:16px;font-weight:600;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;line-height:1.15}'+
'.mg-sl em{font-style:normal;font-size:13px;color:#3b1c00;background:linear-gradient(#ffd98a,#ffa552);border-radius:7px;padding:0 6px;margin:-1px 0 2px;text-shadow:none}.mg-stn.delo .mg-sb{border-color:#ffd27a}'+
'.mg-pnl{position:absolute;z-index:5;box-sizing:border-box}'+
'.mg-dv.port .mg-pnl{left:10px;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px)}.mg-dv.land .mg-pnl{right:12px;top:84px;bottom:12px;width:33%;width:min(360px,33%);overflow:auto;padding-right:2px}.mg-dv.land .mg-pnl{pointer-events:none}.mg-dv.land .mg-pnl>*{pointer-events:auto}'+
'.mg-delo{display:flex;align-items:center;gap:12px;padding:14px;border-radius:22px;background:rgba(18,30,42,.8);-webkit-backdrop-filter:saturate(160%) blur(18px);backdrop-filter:saturate(160%) blur(18px);border:1px solid rgba(255,210,122,.45);box-shadow:0 10px 30px rgba(0,0,0,.35)}'+
'.mg-di{flex:none;width:58px;height:58px;border-radius:18px;background:linear-gradient(160deg,#ffe2a0,#ff9f52);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.6)}.mg-di .ic{width:34px;height:34px}.mg-di .ic path,.mg-di .ic circle,.mg-di .ic rect{stroke:#5a2e08;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}.mg-di .ic .d{fill:rgba(255,255,255,.55)}'+
'.mg-dt{flex:1;min-width:0}.mg-dk{font-size:15px;color:#ffd27a;font-weight:600}.mg-dn{font-size:20px;font-weight:700;line-height:1.2;margin:1px 0}.mg-ds{font-size:15px;color:rgba(255,255,255,.8);line-height:1.25}'+
'.mg-delo .mg-btn{min-width:0;padding:0 18px;flex:none}.mg-done{flex:none;width:48px;height:48px;border-radius:50%;background:#3cbf7a;display:flex;align-items:center;justify-content:center}.mg-done .ic{width:26px;height:26px}.mg-done .ic path{stroke:#fff;stroke-width:3;fill:none}'+
'.mg-prow{display:flex;gap:10px;margin-top:10px}.mg-prow .mg-btn{flex:1;min-width:0;min-height:52px;font-size:17px;padding:0 10px;background:rgba(18,30,42,.72);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}.mg-prow .mg-btn .ic{width:22px;height:22px}'+
'.mg-btn .ic path,.mg-btn .ic circle,.mg-btn .ic rect{stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}.mg-btn .ic .d{fill:rgba(255,255,255,.18)}'+
'.mg-ph{font-size:17px;font-weight:600;margin:2px 4px 10px;text-shadow:0 1px 3px rgba(0,0,0,.6)}.mg-ph b{color:#ffd27a}'+
'.mg-tl{margin-top:12px;display:flex;flex-direction:column;gap:8px}.mg-tli{display:grid;grid-template-columns:40px 1fr;grid-template-rows:auto auto;align-items:center;text-align:left;padding:10px 12px;border-radius:16px;border:1px solid rgba(255,255,255,.18);background:rgba(18,30,42,.66);color:#fff;font:600 17px var(--font,system-ui);cursor:pointer;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}'+
'.mg-tli .ic{grid-row:1/3;width:30px;height:30px}.mg-tli .ic path,.mg-tli .ic circle,.mg-tli .ic rect{stroke:#ffd27a;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}.mg-tli small{font-weight:400;font-size:15px;color:rgba(255,255,255,.7)}.mg-tli.hot{border-color:rgba(255,200,90,.7);box-shadow:0 0 0 1px rgba(255,200,90,.35)}.mg-tli.hot small{color:#ffd27a}'+
'.mg-bub{position:absolute;z-index:6;left:50%;top:calc(env(safe-area-inset-top,0px) + 112px);transform:translate(-50%,-8px);width:88%;width:min(88%,440px);box-sizing:border-box;padding:12px 16px;border-radius:18px;background:rgba(255,252,244,.96);color:#3a2a1a;font-size:18px;line-height:1.35;box-shadow:0 8px 24px rgba(0,0,0,.3);opacity:0;transition:.35s;pointer-events:none}'+
'.mg-bub.on{opacity:1;transform:translate(-50%,0)}.mg-dv.port .mg-bub:after{content:"";position:absolute;left:46%;top:-14px;border:14px solid transparent;border-top:0;border-bottom-color:rgba(255,252,244,.96)}.mg-bub b{display:block;font-size:15px;color:#b0601a;margin-bottom:2px}.mg-dv.land .mg-bub{left:34%}'+
'.mg-sheet{position:absolute;left:0;top:0;width:100%;height:100%;z-index:8;display:flex;align-items:center;justify-content:center;background:rgba(6,12,18,.45);animation:mgIn .25s}'+
'.mg-card{position:relative;width:calc(100% - 32px);max-width:420px;max-height:calc(100% - 40px);overflow:auto;box-sizing:border-box;padding:22px 18px 18px;border-radius:24px;background:rgba(20,32,44,.94);border:1px solid rgba(255,255,255,.2);box-shadow:0 16px 40px rgba(0,0,0,.45);text-align:center;animation:mgPop .35s cubic-bezier(.2,1.4,.4,1)}'+
'.mg-card.wide{max-width:560px}.mg-card p{font-size:17px;line-height:1.4;color:rgba(255,255,255,.86);margin:6px 0 10px}'+
'.mg-ci{width:72px;height:72px;margin:0 auto 4px;border-radius:22px;background:linear-gradient(160deg,#ffe2a0,#ff9f52);display:flex;align-items:center;justify-content:center}.mg-ci .ic{width:44px;height:44px}.mg-ci .ic path,.mg-ci .ic circle,.mg-ci .ic rect{stroke:#5a2e08;stroke-width:1.7;fill:none;stroke-linecap:round;stroke-linejoin:round}.mg-ci .ic .d{fill:rgba(255,255,255,.55)}'+
'.mg-cs{font-size:17px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.08);margin:8px 0}.mg-cs.hot{background:rgba(255,200,90,.18);color:#ffe2a0;font-weight:600}.mg-cr{font-size:17px;margin:6px 0}.mg-cr .ic{width:18px;height:18px;vertical-align:-3px}.mg-cr .ic path{stroke:#ffd27a;fill:rgba(255,210,122,.4)}'+
'.mg-tg{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:8px}.mg-tgi{display:flex;flex-direction:column;align-items:center;gap:4px;padding:14px 8px;border-radius:18px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:600 17px var(--font,system-ui);cursor:pointer;min-height:110px}'+
'.mg-tgi .ic{width:36px;height:36px}.mg-tgi .ic path,.mg-tgi .ic circle,.mg-tgi .ic rect{stroke:#ffd27a;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}.mg-tgi small{font-weight:400;font-size:15px;color:rgba(255,255,255,.7)}'+
'.mg-blv{font-size:18px;margin:6px 0 4px}.mg-blv b{font-size:24px;color:#ffd27a}.mg-blv small{font-size:15px;color:rgba(255,255,255,.7)}.mg-bbar{height:12px;border-radius:7px;background:rgba(255,255,255,.15);margin:8px 0 4px;overflow:hidden}.mg-bbar i{display:block;height:100%;background:linear-gradient(90deg,#ffd27a,#ff9a52)}'+
'.mg-bh{font-size:17px;font-weight:700;color:#ffd27a;text-align:left;margin:14px 2px 8px}.mg-gifts{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}.mg-gift{flex:1 0 92px;position:relative;padding:20px 6px 10px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)}'+
'.mg-gift .ic{width:30px;height:30px}.mg-gift .ic path,.mg-gift .ic rect{stroke:rgba(255,255,255,.6);stroke-width:1.8;fill:none}.mg-gift.got{background:rgba(60,191,122,.18);border-color:rgba(107,227,176,.5)}.mg-gift.got .ic path{stroke:#6be3b0;stroke-width:3}.mg-gift small em{display:block;font-style:normal;color:#ffd27a;margin-top:4px}.mg-gift small{display:block;font-size:14px;line-height:1.25;color:rgba(255,255,255,.8);margin-top:4px}'+
'.mg-gl{position:absolute;left:50%;top:-10px;transform:translateX(-50%);min-width:26px;height:26px;border-radius:13px;background:linear-gradient(#ffd98a,#ffa552);color:#3b1c00;font-weight:700;font-size:15px;line-height:26px}'+
'.mg-recs{display:flex;flex-direction:column;gap:6px}.mg-ri{display:grid;grid-template-columns:36px 1fr auto;grid-template-rows:auto auto;align-items:center;text-align:left;padding:8px 12px;border-radius:14px;background:rgba(255,255,255,.07);font-size:17px}'+
'.mg-ri .ic{grid-row:1/3;width:28px;height:28px}.mg-ri .ic path,.mg-ri .ic circle,.mg-ri .ic rect{stroke:#ffd27a;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}.mg-ri b{color:#ffd27a;font-size:19px}.mg-ri small{grid-column:2/4;font-size:14px;color:rgba(255,255,255,.65)}.mg-ri.lock{opacity:.6}.mg-ri.lock .ic path,.mg-ri.lock .ic rect{stroke:#aab}'+
'.mg-rx{font-size:15px;text-align:left;padding:0 6px}'+
'.mg-dv.land .mg-delo{flex-wrap:wrap}.mg-dv.land .mg-delo .mg-btn,.mg-dv.land .mg-delo .mg-done{flex:1 1 100%;margin-top:4px}.mg-dv.land .mg-delo .mg-done{border-radius:16px;height:44px}'+
'@media (max-width:900px){.mg-dv.land .mg-prow{flex-direction:column}}'+
'.mg-dv.port .mg-sb{width:48px;height:48px}.mg-dv.port .mg-sb .ic{width:26px;height:26px}.mg-dv.port .mg-sl{font-size:15px;padding:2px 8px}'+
'@media (max-height:700px){.mg-dv.port .mg-delo{padding:10px}.mg-dv.port .mg-di{width:48px;height:48px}.mg-dv.port .mg-dn{font-size:18px}.mg-tn{font-size:21px}.mg-sb{width:48px;height:48px}.mg-sb .ic{width:26px;height:26px}.mg-sl{font-size:15px}}'+
'.mg-tile{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 14px 8px 10px;border-radius:18px;border:1px solid var(--pnB,rgba(255,255,255,.2));background:var(--pn2,rgba(16,26,36,.6));-webkit-backdrop-filter:var(--blur,blur(14px));backdrop-filter:var(--blur,blur(14px));color:var(--tx,#fff);font:inherit;text-align:left;cursor:pointer;box-sizing:border-box}'+
'.mg-tile.hot{border-color:rgba(255,207,122,.6);box-shadow:0 0 0 1px rgba(255,207,122,.3),0 6px 18px rgba(0,0,0,.2)}.mg-tic{flex:none;width:48px;height:48px;border-radius:14px;background:linear-gradient(160deg,#cfe9b0,#8fbf5f);display:flex;align-items:center;justify-content:center}.mg-tic svg{width:40px;height:40px}'+
'.mg-tt{flex:1;min-width:0;display:flex;flex-direction:column}.mg-tt b{font-size:18px}.mg-tt small{font-size:17px;color:var(--tx2,rgba(255,255,255,.8));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.mg-tile .mg-tn{flex:none;font-style:normal;min-width:30px;height:30px;padding:0 8px;box-sizing:border-box;border-radius:15px;background:var(--dot,#ff8f4f);color:#fff;font-weight:700;font-size:17px;line-height:30px;text-align:center}'+
'.mg-dsl{display:flex;align-items:center;gap:10px;justify-content:space-between;padding:8px 10px;border-radius:14px;background:var(--in,rgba(255,255,255,.08));border:1px dashed var(--inB,rgba(255,255,255,.25));text-align:left;font-size:17px}.mg-dsl small{display:block;font-size:17px;color:var(--tx3,rgba(255,255,255,.65))}.mg-dsl .btn{flex:none;margin:0}.mg-dsl.done{opacity:.8}'+
'body.calm .mg-stn,body.calm .mg-stn.hot .mg-sb{animation:none}';
function regSlots(){try{if(typeof slotAdd==='function'&&typeof mapSlots!=='undefined'){
  /* MERGE 08.10: плитка 'mg_dvor' в mapSlots убрана — вход во Двор только кольцом uiDvor на главном экране (решение UX/главного) */
  slotAdd(dailySlots,{id:'mg_delo',pri:40,when:function(){return !!dailySlot();},
    html:function(){css();var d=dailySlot();return '<div class="mg-dsl'+(d.done?' done':'')+'"><span>'+(d.done?'✓ ':'')+d.t+'<small>'+L('необязательное задание','optional task')+'</small></span>'+(d.done?'':'<button type="button" class="btn" data-a="go">'+L('Во двор','To the yard')+'</button>')+'</div>';},
    bind:function(e){var b=e.querySelector('[data-a=go]');if(b)b.onclick=function(){try{hideModal();}catch(x){}open();};}});
  try{if(typeof slotsFill==='function'&&document.getElementById('mapSlotsB'))slotsFill(document.getElementById('mapSlotsB'),mapSlots,{},SLOT_MAX.map);}catch(e){}}}catch(e){}}
regSlots();
})();
