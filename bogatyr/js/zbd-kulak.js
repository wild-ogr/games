'use strict';
/* BGD: забава №6 «Кулачный бой на Масленицу» (id 'kulak'). «Стенка на стенку»: из чужой стенки по одному выходят бойцы.
   Соперник замахивается — над его рукавицей крупная стрелка слева или справа: прикройся ТОЙ ЖЕ стороной (← / → или тап по своей стороне),
   отбил — он раскрылся: бей (пробел / ↑ / тап по сопернику). Пропустил удар — минус блин (их 3). 60 секунд.
   Хитрецы с 3-го бойца: замах-обманка (стрелка перепрыгивает), с 4-го — двойной замах. Спокойный режим: замахи медленнее ×1,35, без тряски.
   Счёт = удары + 3 за каждого сбитого с ног. Ступени: 5 / 12 / 20 (бот: zbBot('kulak')).
   Итог: host.done({score,tier,extra:{down,hits,buf?}}) — buf {hp:.05|.07} (блины; ZFIN — потолок 7 %) на 1 следующий поход главы (рамки — у ядра, ZAB_RW[6]).
   3-я ступень впервые — облик «Кушак кулачного бойца» всем богатырям (выдаёт ядро: ZAB_RW[6].skin → zabSkinGive, строка в итогах; ZFIN). Облики kushak — ниже. */
(function(){
const K=zbdK,TAU=Math.PI*2;
/* ---------- облик «Кушак кулачного бойца»: льняная рубаха, красный кушак (для всех 9 богатырей; выдаёт оболочка: S.skins[герой+'@kushak']=1) ---------- */
try{if(typeof SKINS!=='undefined'&&typeof HERO_ART!=='undefined'&&!SKINS.some(s=>s.id==='kushak')){
  const P={body:'#f3ead6',belt:'#d8262e',cloak:'#a8322a',boots:'#3a2a1a',fur:'#7a5230',cap:'#c8392f',kok:'#d8262e',rim:'#d8262e'};
  for(const h in HERO_ART){const pal={};for(const k in P)if(typeof HERO_ART[h][k]==='string'&&HERO_ART[h][k][0]==='#')pal[k]=P[k];
    SKINS.push({id:'kushak',hero:h,pal,zab:1,get name(){return L('Кушак кулачного бойца','Fist-Fighter’s Sash');},get src(){return L('забава «Кулачный бой на Масленицу»','“Shrovetide Fist Fight” game');}});
    const hh=Object.assign({},HERO_ART[h],pal),k=h+'@kushak';for(const f of[0,1])art('h_'+k+'_'+f,80,g=>drawHero(g,hh,f));art('hp_'+k,66,g=>{g.translate(0,3);drawHero(g,hh,0);});}}}catch(e){console.error(e);}

const TIER=[5,12,20];
function tierOf(s){return s>=TIER[2]?3:s>=TIER[1]?2:s>=TIER[0]?1:0;}
const DUR=60;
/* бойцы чужой стенки */
const FOES=[
  {n:()=>[L('Ерёма-кожевник','Yerema the Tanner')],shirt:'#c8392f',pants:'#4a5a7a',hat:'ush',hatC:'#6a4a2e',beard:'#6a3a1a',bs:1,hp:3,sz:.94},
  {n:()=>[L('Фома-пекарь','Foma the Baker')],shirt:'#f2ead8',emb:'#c8392f',pants:'#6a6a6a',hat:'kolp',hatC:'#e6b53a',beard:null,hair:'#d8963a',hp:3,sz:.92},
  {n:()=>[L('Кузьма-кузнец','Kuzma the Smith')],shirt:'#2f6ad8',pants:'#3a3a4a',hat:'none',hair:'#2a1a12',beard:'#2a1a12',bs:2,hp:4,sz:1.02,feint:.3},
  {n:()=>[L('Прохор-мельник','Prokhor the Miller')],shirt:'#3a8a4a',pants:'#5a4a3a',hat:'ush',hatC:'#e8e0d0',beard:'#c8b090',bs:2,hp:4,sz:1,feint:.3,dbl:.3},
  {n:()=>[L('Савва-плотник','Savva the Carpenter')],shirt:'#e6b53a',emb:'#2f6ad8',pants:'#4a3a2a',hat:'kolp',hatC:'#c8392f',beard:'#8a5a2a',bs:1,hp:5,sz:1.04,feint:.35,dbl:.3},
  {n:()=>[L('Силач Потап','Potap the Strongman')],shirt:'#7a2a8a',pants:'#2a2a3a',hat:'ush',hatC:'#2a1a12',beard:'#3a2014',bs:3,hp:6,sz:1.12,feint:.4,dbl:.4}];
function foeDef(i){const b=FOES[Math.min(i,FOES.length-1)],x=Object.assign({},b);if(i>=FOES.length){x.hp=b.hp+(i-FOES.length+1);const k=i-FOES.length+2;x.n=()=>[b.n()[0]+' '+k];}return x;}
function windT(i,lvl,calm){return Math.max(.48,.95-i*.07-Math.min(.08,(lvl||0)*.008))*(calm?1.35:1);}

function run(host,o){
  const cv=K.canvas(host),g=cv.getContext('2d'),R=K.rnd((o.seed>>>0)^0x6b75),calm=!!o.calm,isPC=K.pc();
  let W=0,H=0,D=1,land=false,hz=0,fy=0,fh=0,cx=0,bg=null,mw=0;
  function layout(){W=cv.W;H=cv.H;D=cv.D;land=W>H*1.05;
    hz=land?H*.52:H*.47;fy=land?H*.95:H*.85;fh=land?Math.min(H*.68,W*.42):Math.min(H*.48,W*.92);cx=W/2;mw=land?Math.min(H*.125,W*.08):Math.min(W*.2,H*.11);bg=null;}
  layout();cv.onfit=layout;
  /* ---------- состояние ---------- */
  const st={ph:'how',t:0,time:DUR,score:0,hits:0,down:0,hp:3,rise:0,shake:0,flash:0,hint:0,combo:0,cheer:0,over:0,sent:0,howT:0,ko:0};
  const P=[],pops=[],snow=[];for(let i=0;i<46;i++)snow.push({x:R(),y:R(),s:.6+R()*1.6,v:.02+R()*.04,w:R()*TAU});
  const pl={g:0,gT:0,hold:{l:0,r:0},sT:0,sSide:1,hitT:0};
  let foe=null,fi=0;
  function newFoe(){const d=foeDef(fi);foe={d,i:fi,hp:d.hp,st:'enter',t:0,dur:1.1,side:0,feint:0,fl:0,dbl:0,pose:pose0(),z:.42,label:2.4,blinkT:2};fi++;}
  function pose0(){return {rot:0,bx:0,mL:{x:-13,y:-70,s:1},mR:{x:13,y:-70,s:1},head:0,sq:1,eyes:'n',fall:0};}
  /* ---------- позы (цели), к ним — плавно ---------- */
  function target(f,T){const p=pose0(),s=f.side,ph=f.st,bob=calm?0:Math.sin(T*6)*1.4;
    p.mL.y+=bob;p.mR.y+=bob*.8;
    if(ph==='wind'){const k=Math.min(1,f.t/(f.dur*.6)),m=s<0?p.mL:p.mR;m.x=s*(26+14*k);m.y=-80-16*k;m.s=1.05;p.rot=-s*.1*k;p.bx=-s*3*k;p.eyes='a';
      const o2=s<0?p.mR:p.mL;o2.x=-s*10;o2.y=-72;}
    else if(ph==='strike'){const m=s<0?p.mL:p.mR;m.x=s*6;m.y=-64;m.s=2.2;p.rot=s*.12;p.bx=s*5;p.eyes='a';}
    else if(ph==='open'){p.mL={x:-32,y:-46,s:.95};p.mR={x:32,y:-48,s:.95};p.head=Math.sin(T*5)*.12;p.eyes='d';p.rot=Math.sin(T*3)*.04;}
    else if(ph==='hurt'){p.mL={x:-36,y:-86,s:1};p.mR={x:34,y:-80,s:1};p.head=f.hd||.3;p.rot=(f.hd||.3)*.5;p.eyes='x';p.bx=(f.hd||.3)*10;}
    else if(ph==='blockd'){p.mL={x:-28,y:-60,s:1};p.mR={x:28,y:-62,s:1};p.rot=-s*.08;p.eyes='s';}
    else if(ph==='parry'){p.mL={x:-8,y:-74,s:1.08};p.mR={x:8,y:-74,s:1.08};p.eyes='a';}
    else if(ph==='down'){p.mL={x:-40,y:-92,s:.9};p.mR={x:40,y:-92,s:.9};p.eyes='x';p.fall=Math.min(1,f.t/.55);}
    else if(ph==='enter'){const w=Math.sin(f.t*12)*3;p.mL.y+=w;p.mR.y-=w;}
    else if(ph==='cheer'){p.mL={x:-24,y:-100,s:1};p.mR={x:24,y:-100,s:1};p.eyes='h';}
    return p;}
  function ease(f,dt){const t=target(f,st.t),p=f.pose,k=1-Math.exp(-dt*(f.st==='strike'?30:f.st==='hurt'?22:13));
    const lr=(a,b)=>a+(b-a)*k;p.rot=lr(p.rot,t.rot);p.bx=lr(p.bx,t.bx);p.head=lr(p.head,t.head);p.fall=t.fall;p.eyes=t.eyes;
    for(const m of['mL','mR']){p[m].x=lr(p[m].x,t[m].x);p[m].y=lr(p[m].y,t[m].y);p[m].s=lr(p[m].s,t[m].s);}}
  /* ---------- рисунок бойца (ноги в (0,0), рост ~100 ед.) ---------- */
  function fighter(f,x,y,sc){const d=f.d,p=f.pose;g.save();g.translate(x,y);const s=sc*d.sz;g.scale(s,s);g.lineJoin='round';g.lineCap='round';
    // тень
    g.fillStyle='rgba(40,50,80,.28)';g.beginPath();g.ellipse(0,1,30,6,0,0,TAU);g.fill();
    if(p.fall>0){g.translate(0,-p.fall*8);g.scale(1+p.fall*.08,1-p.fall*.55);}
    g.translate(p.bx,0);
    // ноги: порты в полоску, онучи и лапти
    for(const sd of[-1,1]){const hx=sd*9,fx=sd*14;
      shp(g,d.pants,{lw:1.4},[hx-8,-46,fx+8,-8],()=>{g.moveTo(hx-8*sd,-46);g.lineTo(hx+9*sd,-46);g.quadraticCurveTo(fx+9*sd,-24,fx+6*sd,-12);g.lineTo(fx-7*sd,-12);g.quadraticCurveTo(hx-9*sd,-26,hx-8*sd,-46);g.closePath();});
      g.save();g.globalAlpha=.25;g.strokeStyle='#fff';g.lineWidth=1.2;for(let i=0;i<3;i++){g.beginPath();g.moveTo(hx+sd*(i*4-4),-44);g.lineTo(fx+sd*(i*4-5),-14);g.stroke();}g.restore();
      ell(g,fx,-8,6.5,7,'#efe6d2',{lw:1.1});for(let i=0;i<3;i++)ln(g,[fx-6,-12+i*3,fx+6,-9+i*3],'#8a6a3a',.9);
      ell(g,fx+sd*2,-1.5,9,4.6,'#c8a060',{lw:1.2});for(let i=-1;i<=1;i++)ln(g,[fx+sd*2+i*3-3,-4,fx+sd*2+i*3+3,1],'rgba(90,60,20,.6)',.8);}
    g.save();g.rotate(p.rot);
    // рукав дальней (замахнувшейся) руки — за туловищем
    const back=f.st==='wind'?(f.side<0?'mL':'mR'):null;if(back)arm(d,p,back);
    // рубаха-косоворотка
    shp(g,d.shirt,{hl:.3,lw:1.6},[-24,-78,24,-36],()=>{g.moveTo(-17,-76);g.quadraticCurveTo(0,-80,17,-76);g.quadraticCurveTo(24,-60,25,-38);g.quadraticCurveTo(0,-33,-25,-38);g.quadraticCurveTo(-24,-60,-17,-76);g.closePath();});
    // вышивка ворота и подола
    const emb=d.emb||'#f2d060';g.strokeStyle=emb;g.lineWidth=2.2;g.beginPath();g.moveTo(-5,-77);g.lineTo(-5,-62);g.stroke();
    g.fillStyle=emb;for(let i=-22;i<=22;i+=5){g.beginPath();g.moveTo(i,-40);g.lineTo(i+2.5,-37.5);g.lineTo(i,-35.5);g.lineTo(i-2.5,-37.5);g.closePath();g.fill();}
    for(let i=0;i<4;i++){g.beginPath();g.arc(-5,-74+i*3.6,1,0,TAU);g.fillStyle='#fff6d0';g.fill();}
    // кушак с кистями
    rrect(g,-24,-53,48,7,3);g.fillStyle=grad(g,0,-50,24,'#d8262e',.3);g.fill();outline(g,'#d8262e',1.2);
    ell(g,14,-49.5,4,3.5,'#d8262e',{lw:1});for(const dx of[11,16])ln(g,[dx,-47,dx+1.5,-35],'#d8262e',2.4);for(const dx of[11,16])ln(g,[dx+1,-37,dx+2,-33],'#f2d060',2.2);
    // голова
    g.save();g.translate(0,-87);g.rotate(p.head);head(d,p,f);g.restore();
    // руки
    for(const m of['mL','mR'])if(m!==back)arm(d,p,m);
    g.restore();g.restore();}
  function arm(d,p,m){const sd=m==='mL'?-1:1,sx=sd*17,sy=-72,M=p[m],ex=(sx+M.x)/2+sd*10,ey=(sy+M.y)/2+8;
    g.lineCap='round';g.strokeStyle=shade(d.shirt,-.55);g.lineWidth=12.5;g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(ex,ey,M.x,M.y);g.stroke();
    g.strokeStyle=d.shirt;g.lineWidth=10;g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(ex,ey,M.x,M.y);g.stroke();
    g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=3;g.beginPath();g.moveTo(sx,sy-2);g.quadraticCurveTo(ex,ey-3,M.x,M.y-3);g.stroke();
    mitt(M.x,M.y,M.s,sd,'#b8402a','#f2ead8');}
  // рукавица: вязаная, с узором и отворотом
  function mitt(x,y,s,sd,c,cuff){g.save();g.translate(x,y);g.scale(s,s);
    ell(g,0,4,6.6,3.2,cuff,{lw:1});
    ell(g,0,-3,8.4,8,c,{hl:.35,lw:1.3});ell(g,-sd*7,0,3.4,4.2,c,{rot:-sd*.5,lw:1});
    g.strokeStyle='rgba(255,236,190,.75)';g.lineWidth=1.3;g.beginPath();g.moveTo(-5,-3);g.lineTo(0,-7);g.lineTo(5,-3);g.lineTo(0,1);g.closePath();g.stroke();shine(g,-2.5,-7,3,1.6,.35);g.restore();}
  function head(d,p,f){
    // шея
    ell(g,0,10,6,4,'#eebc94',{ol:false});
    if(d.hat==='none'||d.hat==='kolp'){ell(g,0,-4,12.5,11.5,d.hair||'#3a2416',{lw:1.4});}
    // лицо
    ell(g,0,0,11.5,12,'#f2c49c',{hl:.3,lw:1.4});
    // уши
    for(const sd of[-1,1])ell(g,sd*11.5,1,2.6,3.4,'#eab08a',{lw:.9});
    // щёки с морозу
    for(const sd of[-1,1]){g.fillStyle='rgba(240,90,80,.38)';g.beginPath();g.arc(sd*6.5,4,3.2,0,TAU);g.fill();}
    // глаза
    const ey=-2;
    if(p.eyes==='x'){for(const sd of[-1,1]){ln(g,[sd*4.5-2,ey-2,sd*4.5+2,ey+2],'#2a1810',1.5);ln(g,[sd*4.5-2,ey+2,sd*4.5+2,ey-2],'#2a1810',1.5);}}
    else if(p.eyes==='d'){for(const sd of[-1,1]){g.strokeStyle='#2a1810';g.lineWidth=1.1;g.beginPath();for(let a=0;a<10;a+=.3)g.lineTo(sd*4.5+Math.cos(a+st.t*8)*a*.27,ey+Math.sin(a+st.t*8)*a*.27);g.stroke();}}
    else if(p.eyes==='h'){for(const sd of[-1,1]){g.strokeStyle='#2a1810';g.lineWidth=1.4;g.beginPath();g.arc(sd*4.5,ey+1,2.4,Math.PI*1.1,Math.PI*1.9);g.stroke();}}
    else{const bl=f.blinkT<.12;for(const sd of[-1,1]){if(bl){ln(g,[sd*4.5-2.2,ey,sd*4.5+2.2,ey],'#2a1810',1.3);continue;}eye(g,sd*4.5,ey,2.6,{px:-sd*.2,angry:p.eyes==='a',flipB:sd>0,brow:shade(d.beard||d.hair||'#3a2416',-.2)});}
      if(p.eyes!=='a')for(const sd of[-1,1])ln(g,[sd*4.5-2.6,ey-4.6,sd*4.5+2.6,ey-5.2+(sd<0?.8:0)],shade(d.beard||d.hair||'#3a2416',-.2),1.4);}
    // нос картошкой
    ell(g,0,2.5,2.6,2.3,'#eaa080',{lw:.8});shine(g,-.8,1.6,1,.6,.5);
    // борода и усы
    if(d.beard){const b=d.bs||1;shp(g,d.beard,{lw:1.2},[-11,3,11,12+b*5],()=>{g.moveTo(-10.5,2);g.quadraticCurveTo(-11,10+b*3,0,13+b*5);g.quadraticCurveTo(11,10+b*3,10.5,2);g.quadraticCurveTo(6,7,0,7);g.quadraticCurveTo(-6,7,-10.5,2);g.closePath();});
      for(const sd of[-1,1])ell(g,sd*3.6,5.4,4.4,1.8,shade(d.beard,-.1),{rot:sd*.25,lw:.8});}
    // рот
    if(p.eyes==='a'){g.fillStyle='#5a1a14';g.beginPath();g.ellipse(0,8.4,2.6,1.3,0,0,TAU);g.fill();}
    else if(p.eyes==='x'||p.eyes==='d'){g.fillStyle='#5a1a14';g.beginPath();g.ellipse(0,8.6,2,2.4,0,0,TAU);g.fill();}
    else if(!d.beard)mouth(g,0,7.6,3.2,'#7a2a1a',1);
    // шапка
    if(d.hat==='ush'){ell(g,0,-12,13.5,8,d.hatC,{hl:.35,lw:1.3});rrect(g,-13.5,-12,27,6,3);g.fillStyle=grad(g,0,-6,13,shade(d.hatC,.25),.3);g.fill();outline(g,d.hatC,1.1);
      for(const sd of[-1,1]){ell(g,sd*11.8,3,3.4,7.5,shade(d.hatC,.15),{lw:1});ln(g,[sd*11.8,10,sd*11,16],shade(d.hatC,-.3),.9);}}
    else if(d.hat==='kolp'){shp(g,d.hatC,{hl:.35,lw:1.3},[-12,-30,14,-6],()=>{g.moveTo(-12,-7);g.quadraticCurveTo(-8,-24,6,-28);g.quadraticCurveTo(16,-26,14,-16);g.quadraticCurveTo(10,-12,12,-7);g.closePath();});
      ell(g,14,-17,3.2,3.2,'#f2ead8',{lw:.9});rrect(g,-13,-10,26,5,2.5);g.fillStyle='#f2ead8';g.fill();outline(g,'#f2ead8',1);}
    else{g.save();g.beginPath();g.ellipse(0,-6,12.5,8,0,Math.PI,TAU);g.fillStyle=d.hair||'#3a2416';g.fill();g.restore();ln(g,[-11,-5,11,-5],shade(d.hair||'#3a2416',-.3),1);}}
  /* ---------- фон: Масленица — солнце, снег, балаганы, столб с сапогами, чучело, гирлянда флажков ---------- */
  function mkBg(){const c=document.createElement('canvas');c.width=Math.ceil(W*D);c.height=Math.ceil(H*D);const b=c.getContext('2d');b.setTransform(D,0,0,D,0,0);b.lineJoin='round';b.lineCap='round';
    const R2=K.rnd(77);let q=b.createLinearGradient(0,0,0,hz);q.addColorStop(0,'#5fa8e6');q.addColorStop(.6,'#a8d4f4');q.addColorStop(1,'#fde9c8');b.fillStyle=q;b.fillRect(0,0,W,hz+2);
    // солнце-блин
    const sx=land?W*.8:W*.78,sy=land?H*.17:H*.17,sr=Math.min(W,H)*(land?.07:.085);b.drawImage(K.glow('rgba(255,224,130,.9)'),sx-sr*4,sy-sr*4,sr*8,sr*8);
    b.save();b.translate(sx,sy);for(let i=0;i<16;i++){b.rotate(TAU/16);b.fillStyle=i%2?'rgba(255,214,90,.55)':'rgba(255,240,170,.45)';b.beginPath();b.moveTo(-sr*.18,-sr*1.08);b.lineTo(0,-sr*(i%2?1.55:1.75));b.lineTo(sr*.18,-sr*1.08);b.closePath();b.fill();}b.restore();
    q=b.createRadialGradient(sx-sr*.3,sy-sr*.3,sr*.1,sx,sy,sr);q.addColorStop(0,'#fff6c0');q.addColorStop(.7,'#ffd24a');q.addColorStop(1,'#f2a82a');b.fillStyle=q;b.beginPath();b.arc(sx,sy,sr,0,TAU);b.fill();b.strokeStyle='#d8862a';b.lineWidth=2;b.stroke();
    b.fillStyle='rgba(180,90,20,.75)';for(const dx of[-.32,.32]){b.beginPath();b.arc(sx+dx*sr,sy-sr*.12,sr*.08,0,TAU);b.fill();}b.strokeStyle='rgba(180,90,20,.75)';b.lineWidth=Math.max(1.5,sr*.07);b.beginPath();b.arc(sx,sy+sr*.05,sr*.38,.3,Math.PI-.3);b.stroke();
    b.fillStyle='rgba(255,120,90,.3)';for(const dx of[-.55,.55]){b.beginPath();b.arc(sx+dx*sr,sy+sr*.18,sr*.16,0,TAU);b.fill();}
    // облака
    for(let i=0;i<4;i++){const x=R2()*W,y=hz*(.12+R2()*.45),s=Math.min(W,H)*(.05+R2()*.04);b.fillStyle='rgba(255,255,255,.85)';for(let j=0;j<5;j++){b.beginPath();b.ellipse(x+(j-2)*s*.8,y-(j%2)*s*.35,s*.9,s*.6,0,0,TAU);b.fill();}}
    // дальние холмы и лес
    b.fillStyle='#c8daf0';b.beginPath();b.moveTo(0,hz);for(let x=0;x<=W;x+=W/12)b.lineTo(x,hz-H*.06-Math.sin(x/W*7+1)*H*.02);b.lineTo(W,hz);b.fill();
    b.fillStyle='#7a92b0';for(let x=-10;x<W+10;x+=Math.max(9,W/50)){const h=H*(.035+R2()*.03);b.beginPath();b.moveTo(x-h*.3,hz-H*.03);b.lineTo(x,hz-H*.03-h);b.lineTo(x+h*.3,hz-H*.03);b.fill();}
    // деревня: избы со снегом
    const izb=(x,y,s,c)=>{b.fillStyle=c;b.fillRect(x-s,y-s*1.1,s*2,s*1.1);b.fillStyle='#fff';b.beginPath();b.moveTo(x-s*1.3,y-s*1.05);b.lineTo(x,y-s*2.1);b.lineTo(x+s*1.3,y-s*1.05);b.closePath();b.fill();
      b.strokeStyle='rgba(90,110,140,.6)';b.lineWidth=1;b.stroke();b.fillStyle='#ffd77a';b.fillRect(x-s*.3,y-s*.8,s*.6,s*.45);b.fillStyle='rgba(255,255,255,.7)';b.beginPath();b.arc(x+s*.6,y-s*2.4,s*.25,0,TAU);b.arc(x+s*.75,y-s*2.8,s*.32,0,TAU);b.fill();};
    const iz=Math.min(W,H)*.022;for(let i=0;i<7;i++)izb(W*(.06+i*.15)+R2()*W*.04,hz-H*.03,iz*(.8+R2()*.4),i%2?'#8a5a3a':'#7a4a2e');
    // терем с маковкой (слева вдали)
    {const x=land?W*.2:W*.16,y=hz-H*.03,s=iz*1.6;b.fillStyle='#a0663a';b.fillRect(x-s,y-s*2.6,s*2,s*2.6);b.fillStyle='#fff';b.beginPath();b.moveTo(x-s*1.25,y-s*2.5);b.lineTo(x,y-s*3.6);b.lineTo(x+s*1.25,y-s*2.5);b.fill();
      b.fillStyle='#e6b53a';b.beginPath();b.ellipse(x,y-s*3.9,s*.45,s*.55,0,0,TAU);b.fill();b.fillRect(x-1,y-s*4.9,2,s*.6);b.fillStyle='#ffd77a';for(const dx of[-.5,.5])b.fillRect(x+dx*s-s*.2,y-s*1.9,s*.4,s*.5);}
    // снежное поле
    q=b.createLinearGradient(0,hz,0,H);q.addColorStop(0,'#eef4fc');q.addColorStop(.5,'#dfe9f6');q.addColorStop(1,'#c8d6ea');b.fillStyle=q;b.fillRect(0,hz-H*.03,W,H);
    b.fillStyle='rgba(255,255,255,.9)';b.beginPath();b.moveTo(0,hz-H*.025);for(let x=0;x<=W;x+=W/10)b.lineTo(x,hz-H*.03+Math.sin(x*.05)*3);b.lineTo(W,hz+4);b.lineTo(0,hz+4);b.fill();
    // утоптанный круг и следы
    b.fillStyle='rgba(150,170,200,.28)';b.beginPath();b.ellipse(cx,fy-fh*.02,Math.min(W*.48,fh*.9),fh*.12,0,0,TAU);b.fill();
    for(let i=0;i<40;i++){const x=R2()*W,y=hz+(H-hz)*R2(),s=2+((y-hz)/(H-hz))*5;b.fillStyle='rgba(120,140,175,.22)';b.beginPath();b.ellipse(x,y,s,s*.45,0,0,TAU);b.fill();}
    // балаганы
    const bal=(x,y,s,c1)=>{b.fillStyle='#8a5a3a';b.fillRect(x-s,y-s*1.2,s*2,s*1.2);for(let i=0;i<6;i++){b.fillStyle=i%2?c1:'#fff4e0';b.beginPath();b.moveTo(x-s*1.15+i*s*.383,y-s*1.2);b.lineTo(x-s*1.15+(i+1)*s*.383,y-s*1.2);b.lineTo(x,y-s*2.2);b.closePath();b.fill();}
      b.fillStyle=c1;for(let i=0;i<5;i++){b.beginPath();b.arc(x-s+i*s*.5+s*.25,y-s*1.2,s*.25,0,Math.PI);b.fill();}b.fillStyle='#e6b53a';b.beginPath();b.arc(x,y-s*2.25,s*.12,0,TAU);b.fill();
      b.fillStyle='#ffe7b0';b.fillRect(x-s*.55,y-s*.9,s*1.1,s*.35);b.fillStyle='#c8392f';b.font='800 '+Math.round(s*.28)+'px BgF,system-ui';b.textAlign='center';b.textBaseline='middle';b.fillText(L('БЛИНЫ','PANCAKES'),x,y-s*.72);};
    const bs=Math.min(W,H)*(land?.06:.07);bal(land?W*.08:W*.1,hz+bs*.2,bs,'#c8392f');bal(land?W*.92:W*.9,hz+bs*.2,bs,'#2f6ad8');
    // столб с сапогами
    {const x=land?W*.74:W*.7,y=hz+2,h=hz*(land?.72:.62);q=b.createLinearGradient(x-4,0,x+4,0);q.addColorStop(0,'#c89a5a');q.addColorStop(1,'#8a5a2a');b.fillStyle=q;b.fillRect(x-3,y-h,6,h);
      b.strokeStyle='#e6b53a';b.lineWidth=2;b.beginPath();b.arc(x,y-h+6,8,0,TAU);b.stroke();b.fillStyle='#c8392f';for(const dx of[-6,6]){b.beginPath();b.moveTo(x+dx-2,y-h+12);b.lineTo(x+dx+2,y-h+12);b.lineTo(x+dx+2,y-h+24);b.lineTo(x+dx+(dx<0?-5:5),y-h+26);b.lineTo(x+dx-2,y-h+24);b.closePath();b.fill();}}
    // чучело Масленицы
    {const x=land?W*.3:W*.27,y=hz+2,h=hz*.42;b.fillStyle='#8a5a2a';b.fillRect(x-2,y-h,4,h);b.fillRect(x-h*.25,y-h*.75,h*.5,3);
      b.fillStyle='#e8c060';b.beginPath();b.arc(x,y-h*.92,h*.09,0,TAU);b.fill();b.fillStyle='#c8392f';b.beginPath();b.moveTo(x-h*.11,y-h*.97);b.quadraticCurveTo(x,y-h*1.08,x+h*.11,y-h*.97);b.lineTo(x+h*.13,y-h*.88);b.lineTo(x-h*.13,y-h*.88);b.fill();
      b.fillStyle='#f2c03a';b.beginPath();b.moveTo(x-h*.08,y-h*.82);b.lineTo(x+h*.08,y-h*.82);b.lineTo(x+h*.18,y-h*.45);b.lineTo(x-h*.18,y-h*.45);b.closePath();b.fill();b.fillStyle='#c8392f';b.fillRect(x-h*.18,y-h*.52,h*.36,h*.05);
      b.strokeStyle='#e8c060';b.lineWidth=2;for(const dx of[-1,1]){b.beginPath();b.moveTo(x+dx*h*.24,y-h*.75);b.lineTo(x+dx*h*.3,y-h*.7);b.stroke();}}
    // гирлянда флажков через всё небо
    {const y0=land?H*.08:H*.13,sag=land?H*.07:H*.05,cols=['#c8392f','#f2c03a','#2f6ad8','#3a9a4a','#f2ead8'];b.strokeStyle='rgba(80,50,30,.8)';b.lineWidth=1.5;b.beginPath();
      for(let x=0;x<=W;x+=4){const t=x/W,y=y0+Math.sin(t*Math.PI)*sag;x?b.lineTo(x,y):b.moveTo(x,y);}b.stroke();const fs=Math.max(12,Math.min(22,W*.034));
      for(let x=fs*.6,i=0;x<W;x+=fs*1.25,i++){const t=x/W,y=y0+Math.sin(t*Math.PI)*sag;b.fillStyle=cols[i%cols.length];b.beginPath();b.moveTo(x-fs*.5,y);b.lineTo(x+fs*.5,y);b.lineTo(x,y+fs*1.05);b.closePath();b.fill();b.strokeStyle='rgba(60,30,10,.4)';b.lineWidth=1;b.stroke();}}
    bg=c;}
  /* ---------- стенка зрителей (чужая — за соперником, своя — по краям) ---------- */
  const crowd=[];{const n=13;for(let i=0;i<n;i++)crowd.push({x:(i+.5)/n,ph:R()*TAU,c:['#c8392f','#2f6ad8','#e6b53a','#3a8a4a','#7a2a8a','#f2ead8'][Math.floor(R()*6)],h:['#6a4a2e','#2a1a12','#e8e0d0','#c8392f'][Math.floor(R()*4)],s:.85+R()*.3});}
  function man(x,y,s,c,hc,arms,ph){g.save();g.translate(x,y);g.scale(s,s);
    g.fillStyle=shade(c,-.25);g.beginPath();g.moveTo(-9,0);g.quadraticCurveTo(-11,-20,-7,-26);g.lineTo(7,-26);g.quadraticCurveTo(11,-20,9,0);g.closePath();g.fill();
    g.fillStyle='rgba(30,20,10,.35)';g.fillRect(-9,-12,18,2.5);
    const a=arms?-1:1;g.strokeStyle=shade(c,-.25);g.lineWidth=4.5;for(const sd of[-1,1]){g.beginPath();g.moveTo(sd*7,-24);g.lineTo(sd*(arms?11:10),arms?-38-Math.sin(ph*9)*3:-12);g.stroke();
      g.fillStyle='#b8402a';g.beginPath();g.arc(sd*(arms?11:10),arms?-39-Math.sin(ph*9)*3:-11,2.8,0,TAU);g.fill();}
    g.fillStyle='#f0c09a';g.beginPath();g.arc(0,-31,5.2,0,TAU);g.fill();g.fillStyle=hc;g.beginPath();g.ellipse(0,-34.5,6,3.6,0,Math.PI,TAU);g.fill();g.fillRect(-6,-35,12,2.6);g.restore();}
  function drawCrowd(T){const s=Math.min(W,H)*(land?.0021:.0024),ch=st.cheer>0;
    for(const m of crowd){const x=m.x*W,bob=calm?0:Math.sin(T*3+m.ph)*(ch?3:1);man(x,hz+H*.012+bob,s*m.s*14/10*1.0,m.c,m.h,ch&&Math.sin(m.ph*5)>-.3,T+m.ph);}}
  function sideFolk(T){// ближние зрители по краям (своя стенка)
    const s=Math.min(W,H)*(land?.0062:.0058),ch=st.cheer>0;
    const L1=land?[[.03,.9],[.1,.97],[.9,.97],[.97,.9]]:[[-.02,.66],[1.02,.66]];
    for(const [px,py] of L1){const bob=calm?0:Math.sin(T*2.4+px*9)*(ch?4:1.5);man(px*W,py*H+bob,s*(land?1:1.15)*10/10,px<.5?'#c8392f':'#2f6ad8','#6a4a2e',ch,T+px);}}
  /* ---------- свои рукавицы (вид из глаз) ---------- */
  function myHands(T){const hp=K.heroPal(),sleeve=hp.body||'#c8392f',y0=H-mw*.15;
    for(const sd of[-1,1]){const gu=pl.g===sd&&pl.gT>0,sk=pl.sT>0&&pl.sSide===sd,k=sk?Math.sin(Math.min(1,(.24-pl.sT)/.24)*Math.PI):0;
      let x=cx+sd*(land?fh*.62:W*.37),y=y0,s=1,rot=sd*.35;
      if(gu){x=cx+sd*(land?fh*.3:W*.2);y=y0-mw*1.25;s=1.12;rot=sd*.15;}
      if(sk){x=x+(cx+sd*mw*.2-x)*k;y=y-(fy-fh*.62-y)*-k*.9;s=1-.45*k;rot=sd*.1;}
      const bob=calm||gu||sk?0:Math.sin(T*5+sd)*mw*.04;
      g.save();g.translate(x,y+bob);g.rotate(rot);
      // рукав
      g.strokeStyle=shade(sleeve,-.5);g.lineWidth=mw*.78;g.lineCap='round';g.beginPath();g.moveTo(sd*mw*.25,mw*1.6);g.lineTo(0,mw*.3);g.stroke();
      g.strokeStyle=sleeve;g.lineWidth=mw*.68;g.beginPath();g.moveTo(sd*mw*.25,mw*1.6);g.lineTo(0,mw*.3);g.stroke();
      g.scale(mw/20,mw/20);mitt(0,0,1.5,-sd,'#c8392f','#fff4e0');g.restore();
      if(gu){g.globalAlpha=.55;g.drawImage(K.glow('rgba(255,230,140,.8)'),x-mw*1.3,y-mw*1.3,mw*2.6,mw*2.6);g.globalAlpha=1;}}}
  /* ---------- стрелка замаха ---------- */
  function swingArrow(f,T){if(f.st!=='wind')return;const s=f.side,A=fh*.26,x=Math.max(A*.95,Math.min(W-A*.95,cx+s*fh*(land?.42:.4))),y=fy-fh*.72,k=Math.min(1,f.t/.12),pul=calm?1:1+Math.sin(T*14)*.06;
    g.save();g.translate(x,y);g.scale(s*k*pul,k*pul);
    g.drawImage(K.glow('rgba(255,120,40,.75)'),-A*1.2,-A*1.2,A*2.4,A*2.4);
    // дуга: снаружи-сверху → к середине
    const r=A*.78,a0=-1.9,a1=-.35;g.lineCap='butt';
    g.strokeStyle='rgba(60,14,4,.9)';g.lineWidth=A*.36;g.beginPath();g.arc(-A*.55,A*.25,r,a0,a1);g.stroke();
    const gr=g.createLinearGradient(-A,0,A,0);gr.addColorStop(0,'#ffe27a');gr.addColorStop(1,'#ff5a1f');g.strokeStyle=gr;g.lineWidth=A*.24;g.beginPath();g.arc(-A*.55,A*.25,r,a0,a1);g.stroke();
    const ex=-A*.55+Math.cos(a1)*r,ey=A*.25+Math.sin(a1)*r,ta=a1+Math.PI/2;
    g.save();g.translate(ex,ey);g.rotate(ta);g.beginPath();g.moveTo(-A*.34,-A*.08);g.lineTo(A*.34,-A*.08);g.lineTo(0,A*.42);g.closePath();g.fillStyle='#ff5a1f';g.fill();g.lineWidth=A*.06;g.strokeStyle='rgba(60,14,4,.9)';g.stroke();g.restore();
    g.restore();
    const lbl=isPC?(s<0?'←':'→'):'';const ly=y+A*.85;
    if(isPC)K.keycap(g,x,ly,lbl,Math.max(30,A*.42),(pl.g===s&&pl.gT>0));
    K.text(g,L('Прикройся!','Block!'),x,ly+(isPC?A*.48:0),Math.max(15,Math.min(24,A*.2)),{col:'#fff3a0',mw:W*.4});}
  /* ---------- HUD ---------- */
  function blin(x,y,r,on){g.save();g.globalAlpha*=on?1:.3;const q=g.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);q.addColorStop(0,'#ffe9a8');q.addColorStop(.7,'#f2b84a');q.addColorStop(1,'#c8782a');
    g.fillStyle=q;g.beginPath();g.ellipse(x,y,r,r*.82,0,0,TAU);g.fill();g.strokeStyle='#8a4a14';g.lineWidth=Math.max(1.5,r*.12);g.stroke();
    g.fillStyle='rgba(160,80,20,.45)';for(const [dx,dy] of[[-.35,-.1],[.25,-.3],[.1,.3],[-.1,.05],[.4,.15]]){g.beginPath();g.arc(x+dx*r,y+dy*r,r*.1,0,TAU);g.fill();}
    if(on){g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(x-r*.35,y-r*.35,r*.25,r*.12,-.5,0,TAU);g.fill();}g.restore();}
  function hud(){const top=8,px=Math.min(22,W*.052);
    // таймер-свиток
    const tw=Math.min(150,W*.34),th=46,tx=land?W/2-tw/2:12;K.rr(g,tx,top,tw,th,14);g.fillStyle='rgba(253,240,207,.95)';g.fill();g.strokeStyle='#6a3a14';g.lineWidth=2.5;g.stroke();
    const sec=Math.ceil(Math.max(0,st.time));K.text(g,'0:'+(sec<10?'0':'')+sec,tx+tw/2,top+th/2+1,px*1.2,{ol:false,col:sec<=10?'#c8261e':'#3a2410'});
    // очки
    const sx=land?12:tx+tw+10,sw=Math.min(170,W*.36);K.rr(g,sx,top,sw,th,14);g.fillStyle='rgba(40,20,10,.62)';g.fill();g.strokeStyle='#e6b53a';g.lineWidth=2;g.stroke();
    K.text(g,L('Очки ','Score ')+st.score,sx+sw/2,top+th/2+1,px,{col:'#ffe27a',mw:sw-14});
    // блины-жизни
    const br=Math.min(17,W*.04),bx=land?W-200:12,by=top+th+br+10;for(let i=0;i<3;i++)blin(land?W-90-i*br*2.4:bx+br+i*br*2.4,land?top+th/2:by,br,i<st.hp);
    // сбитые с ног
    if(st.down>0){const y=land?top+th+26:by,x0=land?W-80:bx+br*8;K.text(g,L('Сбито: ','Down: ')+st.down,land?W-80:x0+8,y,px*.8,{al:land?'right':'left',col:'#fff6dc'});}
    if(foe&&foe.label>0&&foe.st!=='down'){const a=Math.min(1,foe.label*2);g.globalAlpha=a;const ny=land?H*.3:by+br+28;K.text(g,foe.d.n()[0],W/2,ny,Math.min(26,W*.06),{grad:['#fff6dc','#ffd24a'],mw:W*.9});
      K.text(g,foe.i<FOES.length-1?L('выходит из стенки','steps out of the wall'):L('главный силач стенки!','the wall’s champion!'),W/2,ny+Math.min(24,W*.055),Math.min(16,W*.04),{col:'#fff',mw:W*.9});g.globalAlpha=1;}
    // подсказка управления в первые секунды
    if(st.hint>0&&st.ph==='fight'){const a=Math.min(1,st.hint);g.globalAlpha=a;const y=land?92:Math.max(140,hz-H*.2);const fs=Math.min(17,W*.042);
      const s=isPC?L('прикрыться        бить','block              hit'):L('Тапни сторону стрелки — прикройся, потом тапни соперника — бей','Tap the arrow’s side to block, then tap your foe to hit');
      if(isPC){K.hintBar(g,W,y,[{k:'←'},{k:'→'},{t:L('прикрыться','block')+'   '},{k:L('Пробел','Space')},{t:L('бить','hit')}],fs);}
      else{const lines=K.wrap(g,s,fs,W-60,800);const h=lines.length*fs*1.25+18;K.rr(g,20,y-h/2,W-40,h,16);g.fillStyle='rgba(30,16,8,.72)';g.fill();lines.forEach((l,i)=>K.text(g,l,W/2,y-h/2+9+fs*.62+i*fs*1.25,fs,{col:'#fff6dc'}));}
      g.globalAlpha=1;}}
  /* ---------- логика боя ---------- */
  function say(s,x,y,col,px){pops.push({s,x,y,c:col||'#fff6dc',t:0,px:px||Math.min(34,W*.08)});}
  function guard(side){if(st.ph!=='fight')return;pl.g=side;let gt=calm?.75:.55;
    // прикрылся во время замаха — держим до удара (ранний ответ не наказываем)
    if(foe&&foe.st==='wind')gt=Math.min(2,Math.max(gt,foe.dur-foe.t+.3));pl.gT=gt;K.snd(host,'click');}
  function strike(){if(st.ph!=='fight'||pl.sT>0||!foe)return;pl.sT=.24;pl.sSide=pl.sSide>0?-1:1;K.snd(host,'swing');
    if(foe.st==='open'){foe.hp--;st.hits++;st.combo++;const bonus=0;st.score+=1+bonus;foe.st='hurt';foe.t=0;foe.hd=(R()<.5?-1:1)*(.25+R()*.15);
      const hx=cx+foe.pose.bx*fs(),hy=fy-fh*.8;K.burst(P,hx,hy,{n:calm?6:16,col:['#fff3a0','#ffd24a','#fff'],sp:300,k:'star',s:7,g:200,d:.7});K.snd(host,'hit');K.snd(host,'crit');
      say([L('Бац!','Bam!'),L('Хрясь!','Whack!'),L('Ух!','Oof!'),L('Получай!','Take that!')][Math.floor(R()*4)],hx+(R()-.5)*fh*.3,hy-fh*.12,'#ffe27a');if(!calm)st.shake=.18;
      if(st.combo>=3&&st.combo%3===0){say(L('Раззудись плечо!','Swing away!'),W/2,fy-fh*1.02,'#9aff7a',Math.min(30,W*.07));K.snd(host,'combo');}}
    else if(foe.st==='idle'||foe.st==='wind'){if(foe.st==='idle'){foe.st='parry';foe.t=0;}say(L('Отбил!','Blocked!'),cx,fy-fh*.95,'#cfe6ff',Math.min(24,W*.055));K.snd(host,'shoot');}}
  function fs(){return fh/100*foe.d.sz*foe.z;}
  function foeStep(dt){const f=foe;if(!f)return;f.t+=dt;f.label-=dt;f.blinkT-=dt;if(f.blinkT<0)f.blinkT=2+R()*2;
    if(f.st==='enter'){f.z=Math.min(1,.42+.58*K.ease(f.t/f.dur));if(f.t>=f.dur){f.z=1;f.st='idle';f.t=0;f.dur=.5+R()*.5;}}
    else if(f.st==='idle'||f.st==='parry'){if(f.st==='parry'&&f.t>.35){f.st='idle';f.t=0;f.dur=.25;}
      else if(f.st==='idle'&&f.t>=f.dur){f.st='wind';f.t=0;f.side=R()<.5?-1:1;f.dur=windT(f.i,o.lvl,calm)*(f.dbl===2?.75:1);f.feint=f.dbl!==2&&R()<(f.d.feint||0)?1:0;f.fl=0;K.snd(host,'swing');}}
    else if(f.st==='wind'){if(f.feint&&!f.fl&&f.t>f.dur*.45){f.fl=1;f.side=-f.side;f.t=f.dur*.3;say(L('Хитрит!','A feint!'),cx,fy-fh*1.0,'#ffb0a0',Math.min(22,W*.05));}
      if(f.t>=f.dur){f.st='strike';f.t=0;}}
    else if(f.st==='strike'){if(f.t>=.12&&!f.hitDone){f.hitDone=1;const ok=pl.g===f.side&&pl.gT>0;
        if(ok){K.snd(host,'hit');K.burst(P,cx+f.side*W*.18,H-mw*1.6,{n:calm?5:12,col:['#fff','#dfe9f6'],sp:220,s:4,g:300});say(L('Прикрылся!','Blocked!'),cx+f.side*W*.18,H-mw*2.5,'#bff3ff',Math.min(26,W*.06));
          if(f.dbl===0&&R()<(f.d.dbl||0)){f.dbl=1;}
          if(f.dbl===1){f.dbl=2;f.st='idle';f.t=0;f.dur=.12;say(L('Ещё замах!','Another swing!'),cx,fy-fh*1.0,'#ffb0a0',Math.min(22,W*.05));}
          else{f.dbl=0;f.st='blockd';f.t=0;}}
        else{f.dbl=0;st.hp--;st.combo=0;K.snd(host,'hurt');if(!calm){st.shake=.35;st.flash=.5;}else st.flash=.35;say(L('Ох!','Ouch!'),cx,H*.55,'#ffb0a0');
          K.burst(P,cx,H*.5,{n:calm?6:14,col:['#ffe27a','#fff'],sp:260,k:'star',s:6,g:0,d:.5});if(st.hp<=0){st.ph='ko';st.t=0;st.ko=1;}}}
      if(f.t>=.32){f.hitDone=0;if(f.st==='strike'){f.st='idle';f.t=0;f.dur=.45+R()*.35;}}}
    else if(f.st==='blockd'){if(f.t>.18){f.st='open';f.t=0;f.dur=calm?1.3:.95;}}
    else if(f.st==='open'){if(f.t>=f.dur){f.st='idle';f.t=0;f.dur=.35+R()*.3;}}
    else if(f.st==='hurt'){if(f.t>.38){if(f.hp<=0){f.st='down';f.t=0;st.down++;st.score+=3;st.cheer=1.6;K.snd(host,'boom');K.snd(host,'level');
          K.burst(P,cx,fy-fh*.1,{n:calm?8:26,col:['#fff','#e8f0fa'],sp:340,s:6,g:500,a0:-Math.PI,arc:Math.PI});say(L('Сбит с ног!','Knocked down!'),W/2,fy-fh*1.05,'#ffe27a',Math.min(36,W*.085));}
        else{f.st='idle';f.t=0;f.dur=.4+R()*.35;}}}
    else if(f.st==='down'){if(f.t>1.5)newFoe();}
    ease(f,dt);}
  /* ---------- «Подняться» за рекламу (раз за игру) ---------- */
  let koBox=null,usedRise=0;
  function koOffer(){if(koBox)return;const can=!o.train&&!usedRise&&host.adOk&&host.adOk()&&st.time>3;if(!can){finish();return;}
    koBox=document.createElement('div');koBox.style.cssText='position:absolute;left:0;right:0;bottom:calc(var(--sb,0px) + 18px);display:flex;flex-direction:column;align-items:center;gap:10px;z-index:3;padding:0 16px';
    koBox.innerHTML='<button class="btn ad" data-k="ad" style="width:auto;max-width:100%;min-height:52px">'+L('🎬 Подняться за рекламу','🎬 Get up for an ad')+'</button><button class="btn ghost" data-k="end" style="width:auto;min-height:46px">'+L('Закончить бой','End the fight')+'</button>';
    host.el.appendChild(koBox);host.hold=true;try{host.offer&&host.offer();}catch(_){}
    koBox.querySelector('[data-k=ad]').onclick=e=>{e.stopPropagation();const b=e.currentTarget;b.disabled=true;host.ad('rise').then(ok=>{b.disabled=false;if(!koBox)return;if(ok){usedRise=1;koBox.remove();koBox=null;host.hold=false;st.hp=2;st.ph='fight';st.ko=0;say(L('Поднялся!','Back up!'),W/2,H*.5,'#9aff7a');K.snd(host,'heal');}});};
    koBox.querySelector('[data-k=end]').onclick=e=>{e.stopPropagation();koBox.remove();koBox=null;host.hold=false;finish();};}
  function finish(){if(st.ph==='end')return;st.ph='end';st.t=0;st.over=1;K.snd(host,st.score>=TIER[0]?'win':'lose');}
  /* ---------- ввод ---------- */
  let howBtn=null;
  function begin(){if(st.ph!=='how')return;st.ph='fight';st.t=0;st.hint=6;newFoe();K.snd(host,'whistle');}
  cv.addEventListener('pointerdown',e=>{e.preventDefault();if(host.paused)return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    if(st.ph==='how'){begin();return;}
    if(st.ph!=='fight')return;
    const third=land?Math.min(W/3,cx-fh*.25):W/3;
    if(x<third)guard(-1);else if(x>W-third)guard(1);else strike();});
  K.keys(host,(k,e,down)=>{const c=e.code||'',left=k==='ArrowLeft'||c==='KeyA',right=k==='ArrowRight'||c==='KeyD';
    if(!down){if(left)pl.hold.l=0;if(right)pl.hold.r=0;return false;}
    if(st.ph==='how'){if(k==='Enter'||k===' '){begin();return true;}return false;}
    if(left){pl.hold.l=1;guard(-1);return true;}
    if(right){pl.hold.r=1;guard(1);return true;}
    if(k===' '||k==='ArrowUp'||c==='KeyW'||k==='Enter'){strike();return true;}return false;});
  /* ---------- шаг ---------- */
  function step(dt){st.t+=dt;if(st.shake>0)st.shake-=dt;if(st.flash>0)st.flash-=dt;if(st.cheer>0)st.cheer-=dt;
    for(const q of pops)q.t+=dt;for(let i=pops.length-1;i>=0;i--)if(pops[i].t>1.1)pops.splice(i,1);
    for(const s of snow){s.y+=s.v*dt;s.x+=Math.sin(st.t+s.w)*.01*dt;if(s.y>1)s.y-=1;}
    if(st.ph==='how'){st.howT+=dt;return;}
    if(st.ph==='fight'){st.time-=dt;if(st.hint>0)st.hint-=dt;
      if(pl.gT>0){const held=pl.g<0?pl.hold.l:pl.hold.r;if(!held)pl.gT-=dt;}if(pl.sT>0)pl.sT-=dt;
      foeStep(dt);if(st.time<=0){st.time=0;finish();}}
    else if(st.ph==='ko'){if(foe){foe.t+=dt;if(foe.st!=='down'){foe.st='cheer';}ease(foe,dt);}if(st.t>1.1)koOffer();}
    else if(st.ph==='end'){if(foe&&foe.st!=='down'){foe.st=st.hp>0?'idle':'cheer';ease(foe,dt);}
      if(st.t>2.2&&!st.sent){st.sent=1;const tier=tierOf(st.score),ex={down:st.down,hits:st.hits,lbl:L('очков','points')};
        if(!o.train&&tier>=2)ex.buf={hp:tier>=3?.10:.05};host.done({score:st.score,tier,extra:ex});}}}
  /* ---------- кадр ---------- */
  let lastDt=0;
  function draw(T){g.setTransform(D,0,0,D,0,0);if(!bg)mkBg();
    let ox=0,oy=0;if(st.shake>0&&!calm){ox=(Math.random()-.5)*14*st.shake/.35;oy=(Math.random()-.5)*10*st.shake/.35;}
    g.save();g.translate(ox,oy);g.drawImage(bg,0,0,W,H);
    // летящий снег (дальний)
    g.fillStyle='rgba(255,255,255,.85)';for(const s of snow){if(s.s>1.4)continue;g.beginPath();g.arc(s.x*W,s.y*H,s.s,0,TAU);g.fill();}
    drawCrowd(T);
    if(foe){const sc=fh/100*foe.z,y=hz+(fy-hz)*((foe.z-.42)/.58);fighter(foe,cx,y,sc);
      // «бей!» — мишень на раскрытом
      if(foe.st==='open'){const k=1-foe.t/foe.dur,tx=cx+foe.pose.bx*fs(),ty=fy-fh*.6*foe.d.sz,r=fh*.13*(1+(calm?0:Math.sin(T*16)*.06));g.save();g.globalAlpha=.85;g.drawImage(K.glow('rgba(255,236,120,.85)'),tx-r*2,ty-r*2,r*4,r*4);
        g.strokeStyle='#ffef8a';g.lineWidth=4;g.beginPath();g.arc(tx,ty,r,-Math.PI/2,-Math.PI/2+TAU*k);g.stroke();g.restore();
        K.text(g,L('БЕЙ!','HIT!'),tx,ty,Math.min(46,fh*.12),{grad:['#fff6a0','#ff8a2a']});if(isPC)K.keycap(g,tx,ty+fh*.11,L('Пробел','Space'),Math.max(26,fh*.06));}
      swingArrow(foe,T);}
    sideFolk(T);
    myHands(T);
    K.parts(g,P,lastDt);
    for(const q of pops){const k=q.t/1.1;g.globalAlpha=1-Math.max(0,k-.6)*2.5;K.text(g,q.s,q.x,q.y-k*34,q.px*(q.t<.12?.7+q.t*2.5:1),{col:q.c,mw:W*.9});}g.globalAlpha=1;
    // ближний снег
    g.fillStyle='rgba(255,255,255,.95)';for(const s of snow){if(s.s<=1.4)continue;g.beginPath();g.arc(s.x*W,s.y*H,s.s*1.6,0,TAU);g.fill();}
    g.restore();
    // удар по нам: красные края (в спокойном — мягче)
    if(st.flash>0){const a=Math.min(1,st.flash/.5)*(calm?.35:.6),q=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);q.addColorStop(0,'rgba(200,30,20,0)');q.addColorStop(1,'rgba(200,30,20,'+a+')');g.fillStyle=q;g.fillRect(0,0,W,H);}
    hud();
    if(st.ph==='how'){g.fillStyle='rgba(20,12,6,.45)';g.fillRect(0,0,W,H);
      const rows=[{keys:['←','→'],txt:L('Соперник замахнулся — крупная стрелка слева или справа. Прикройся той же стороной.','Your foe winds up — a big arrow on the left or right. Block on that same side.'),tap:L('Стрелка слева — тапни левую сторону экрана, справа — правую. Так прикроешься.','Arrow on the left — tap the left side; on the right — the right side. That’s a block.'),icon:iconSide},
        {keys:[L('Пробел','Space')],txt:L('Отбил — соперник раскрылся: жми пробел и бей!','Blocked — he’s open: press Space and hit!'),tap:L('Отбил — соперник раскрылся: тапни по нему и бей!','Blocked — he’s open: tap him to hit!'),icon:iconFist},
        {txt:L('Пропустишь удар — минус блин. Сбивай бойцов чужой стенки за 60 секунд!','Miss a block — lose a pancake. Knock down the other wall in 60 seconds!'),icon:(g2,x,y,s)=>blin(x,y,s*.42,1)}];
      howBtn=K.howto(g,W,H,L('Кулачный бой на Масленицу','Shrovetide Fist Fight'),rows,isPC,st.howT);}
    if(st.ph==='end'||st.ph==='ko'){g.fillStyle='rgba(20,12,6,'+Math.min(.4,st.t*.4)+')';g.fillRect(0,0,W,H);
      K.banner(g,W,H*.4,st.ph==='ko'?L('Сбили с ног!','You’re down!'):st.hp>0&&st.time<=0?L('Время!','Time!'):L('Бой окончен','Fight over'),Math.min(56,W*.12),st.t);
      if(st.t>.5)K.banner(g,W,H*.4+Math.min(60,W*.13),L('Очки: ','Score: ')+st.score,Math.min(36,W*.08),st.t-.5,['#ffffff','#ffe27a']);}}
  function iconSide(g2,x,y,s){g2.save();g2.fillStyle='#c8392f';g2.beginPath();g2.moveTo(x-s*.5,y);g2.lineTo(x-s*.05,y-s*.38);g2.lineTo(x-s*.05,y+s*.38);g2.closePath();g2.fill();g2.beginPath();g2.moveTo(x+s*.5,y);g2.lineTo(x+s*.05,y-s*.38);g2.lineTo(x+s*.05,y+s*.38);g2.closePath();g2.fill();g2.restore();}
  function iconFist(g2,x,y,s){g2.save();g2.translate(x,y);g2.scale(s/26,s/26);mitt(0,0,1.2,1,'#c8392f','#fff4e0');g2.restore();}
  K.loop(host,(dt,T)=>{lastDt=dt;if(dt>0)step(dt);draw(T);});
  // автоигра для проверок: window.__zbdAuto(k) — играет «как человек» с меткостью k
  window.__zbdAuto=k=>{k=k==null?.85:k;const id=setInterval(()=>{if(!cv.isConnected){clearInterval(id);return;}if(st.ph==='how')begin();if(st.ph!=='fight'||!foe)return;
      if(foe.st==='wind'&&foe.t>foe.dur*(foe.feint&&!foe.fl?.9:.55)&&!(pl.g===foe.side&&pl.gT>0)){guard(Math.random()<k?foe.side:-foe.side);}
      if(foe.st==='open'&&foe.t>.25&&Math.random()<k)strike();},60);return id;};
  window.__zbdSt=()=>({ph:st.ph,score:st.score,hp:st.hp,time:+st.time.toFixed(1),down:st.down,hits:st.hits,foe:foe&&foe.st,side:foe&&foe.side,ft:foe&&+(foe.t/foe.dur).toFixed(2),fl:foe&&foe.feint&&!foe.fl?1:0,g:pl.g,gT:+pl.gT.toFixed(2)});
}
/* бот: средний счёт за 60 с при меткости k */
function sim(o,k){const R=K.rnd((o.seed>>>0)^0x51ed),calm=!!o.calm;let t=0,score=0,hp=3,i=0;
  while(t<DUR&&hp>0){const d=foeDef(i);let fhp=d.hp;t+=1.1;
    while(fhp>0&&t<DUR&&hp>0){t+=.5+R()*.5;const tw=windT(i,o.lvl,calm),feint=R()<(d.feint||0),pb=Math.max(.05,Math.min(.97,.25+k*.75-(.95-tw)*.6-(feint?.2:0)));t+=tw*(feint?1.3:1)+.32;
      if(R()<pb){if(R()<(d.dbl||0)){t+=tw*.75+.45;if(R()>=pb){hp--;continue;}}t+=.18+(.25+(1-k)*.4);if(R()<.55+k*.45){fhp--;score++;t+=.38;}else t+=.6;}else hp--;}
    if(fhp<=0){score+=3;t+=1.5;i++;}
    }
  return {score,tier:tierOf(score)};}
/* облик «Кушак» за 3★ выдаёт ядро (ZAB_RW[6].skin → zabSkinGive), повтор — 2 трофея (ZAB_RW[6].skinRep) — ZFIN */
const REG={id:'kulak',num:6,icon:'zbd_i6',kind:'fest',en:true,open:()=>true,run,sim,tiers:TIER};
if(typeof art==='function')art('zbd_i6',48,g=>{for(let i=0;i<8;i++){const a=i/8*TAU;ln(g,[12+7*Math.cos(a),-12+7*Math.sin(a),12+10.5*Math.cos(a),-12+10.5*Math.sin(a)],'#ffb82a',1.8);}ell(g,12,-12,5.5,5.5,'#ffd24a',{hl:.5});
  ell(g,-2,4,14,13,'#c8392f',{hl:.35});ell(g,-14,7,5,6.5,'#c8392f',{rot:.5});rrect(g,-12,14,21,7,3.5);g.fillStyle='#f4ecd8';g.fill();outline(g,'#f4ecd8',1);
  g.strokeStyle='rgba(255,236,190,.85)';g.lineWidth=1.6;g.beginPath();g.moveTo(-9,4);g.lineTo(-2,-3);g.lineTo(5,4);g.lineTo(-2,11);g.closePath();g.stroke();shine(g,-7,-4,4.5,2.2,.4);});
if(typeof ZAB_REG==='function')ZAB_REG(REG);else(window.__zbdPend=window.__zbdPend||[]).push(REG);
})();
