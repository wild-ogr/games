'use strict';
/* BGA (08.10) — забава №10 «Гадание у колодца» (Святки, id 'gadanie', kind 'fest'). Набор — js/zab-akit.js (ZBA).
   Зимняя ночь, деревня в снегу, сруб колодца; в чёрной воде по кругу шесть знаков. Бабушка со свечой: «Смотри…» — знаки загораются по порядку,
   потом повтори порядок касаниями (память, 3 → 4 → 5 → 6 знаков). Ошибка — гаснет свеча (их 3), тот же круг заново с новым порядком.
   Очки: круг из N знаков — N×10; без единой ошибки — +20. Ступени: 30 / 70 / 150 (то есть дойти до 6 знаков — высшая).
   В конце бабушка «предсказывает» день. Сила — по таблице ядра ZAB_RW[10].buf ({tro:1} — в 1 следующем походе главы вожаки дают +1 трофей).
   Без звука играется так же (знаки светятся), со звуком у каждого знака своя нота. Спокойный режим: знаки горят дольше.
   ПК: клавиши 1–6 (номера у знаков, по часовой стрелке от левого), мышь — всегда. Праздничная: open() — Святки 25.12–19.01 (на маке ?zbafest=1). */
(function(){
const Z=window.ZBA;if(!Z)return;
const zabN=typeof window.zabN==='function'?window.zabN:(ru,en)=>({ru,en});   // имя для ZAB_REG (zabN ядра; в f0851ac его ещё нет)
const {put,text,glowAt,rr,sparks,puff,num,tn,nz,snd,TAU}=Z;const cl=Z.cl;

/* ---------- знаки: солнце, месяц, звезда, колос, птица, огонь ---------- */
const RN=[{c:'#ffc83a',f:523},{c:'#bcd8ff',f:587},{c:'#9af0ff',f:659},{c:'#d8f07a',f:784},{c:'#ff9ad0',f:880},{c:'#ff8a4a',f:1047}];
function rune(g,i,r,col){g.save();g.strokeStyle=col;g.fillStyle=col;g.lineWidth=r*.13;g.lineCap='round';g.lineJoin='round';
  if(i===0){g.beginPath();g.arc(0,0,r*.36,0,TAU);g.stroke();for(let j=0;j<8;j++){const a=j*TAU/8;g.beginPath();g.moveTo(Math.cos(a)*r*.55,Math.sin(a)*r*.55);g.lineTo(Math.cos(a)*r*.82,Math.sin(a)*r*.82);g.stroke();}g.beginPath();g.arc(0,0,r*.12,0,TAU);g.fill();}
  else if(i===1){g.beginPath();g.arc(0,0,r*.68,Math.PI*.35,Math.PI*1.65);g.quadraticCurveTo(-r*.05,0,Math.cos(Math.PI*.35)*r*.68,Math.sin(Math.PI*.35)*r*.68);g.closePath();g.fill();}
  else if(i===2){g.beginPath();for(let j=0;j<16;j++){const a=-Math.PI/2+j*Math.PI/8,q=j%2?r*.3:r*.8;g.lineTo(Math.cos(a)*q,Math.sin(a)*q);}g.closePath();g.fill();}
  else if(i===3){g.beginPath();g.moveTo(0,r*.8);g.lineTo(0,-r*.75);g.stroke();for(let j=0;j<4;j++){const y=r*.35-j*r*.32;for(const d of[-1,1]){g.beginPath();g.ellipse(d*r*.2,y-r*.1,r*.13,r*.24,d*.5,0,TAU);g.fill();}}}
  else if(i===4){g.beginPath();g.moveTo(-r*.8,-r*.2);g.quadraticCurveTo(-r*.35,-r*.6,0,-r*.05);g.quadraticCurveTo(r*.35,-r*.6,r*.8,-r*.2);g.stroke();g.beginPath();g.moveTo(-r*.25,r*.15);g.quadraticCurveTo(0,r*.35,r*.25,r*.15);g.lineTo(0,r*.75);g.closePath();g.fill();}
  else{g.beginPath();g.moveTo(0,-r*.82);g.bezierCurveTo(r*.6,-r*.25,r*.58,r*.5,0,r*.72);g.bezierCurveTo(-r*.58,r*.5,-r*.6,-r*.25,0,-r*.82);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.moveTo(0,-r*.2);g.bezierCurveTo(r*.25,r*.1,r*.22,r*.45,0,r*.5);g.bezierCurveTo(-r*.22,r*.45,-r*.25,r*.1,0,-r*.2);g.fill();}
  g.restore();}
for(let i=0;i<6;i++)art('zba_rune'+i,48,g=>{ell(g,0,0,20,20,'#1a2a5a',{hl:.3});rune(g,i,17,RN[i].c);});
art('zba_candle',48,g=>{ell(g,0,18,10,3.4,'#7a5a3a',{lw:.8});rrect(g,-5,-6,10,24,2.5);const gr=g.createLinearGradient(-5,0,5,0);gr.addColorStop(0,'#e8d8b0');gr.addColorStop(.5,'#fff8e0');gr.addColorStop(1,'#c8b890');g.fillStyle=gr;g.fill();g.lineWidth=.8;g.strokeStyle='#8a7a5a';g.stroke();
  g.strokeStyle='#2a1a0a';g.lineWidth=1;g.beginPath();g.moveTo(0,-6);g.lineTo(0,-9);g.stroke();g.fillStyle='#ffb030';g.beginPath();g.moveTo(0,-20);g.quadraticCurveTo(4.5,-12,0,-8);g.quadraticCurveTo(-4.5,-12,0,-20);g.fill();g.fillStyle='#fff6c0';g.beginPath();g.ellipse(0,-11.5,1.6,2.8,0,0,TAU);g.fill();});
art('zba_well_i',48,g=>{ell(g,0,2,18,8,'#0e1838',{lw:1.2,olc:'#5a3a1a'});rune(g,2,8,'#9af0ff');for(let i=0;i<3;i++){rrect(g,-21,8+i*5,42,5,2.5);g.fillStyle=i%2?'#8a5a2a':'#a8743c';g.fill();g.lineWidth=.8;g.strokeStyle='#3a200c';g.stroke();}
  g.fillStyle='#f4f8ff';rrect(g,-22,6,44,3.4,1.7);g.fill();});

const PRED=[
  ()=>L('Ждёт тебя дальняя дорога и полный сундук!','A long road and a full chest await you!'),
  ()=>L('Нечисть задрожит от одного твоего имени.','Monsters will tremble at your very name.'),
  ()=>L('Кот Баюн нынче споёт тебе на ночь.','Tonight the Cat Bayun will sing you to sleep.'),
  ()=>L('Жар-птица обронит перо у твоего порога.','The Firebird will drop a feather on your doorstep.'),
  ()=>L('Кузнец скуёт тебе удачу на славу!','The smith will forge you a fine fortune!'),
  ()=>L('Вожаки нечисти растеряют свои трофеи.','Monster leaders will drop their trophies.'),
  ()=>L('Будет пир, и мёд, и добрая слава.','There will be a feast, honey and good fame.'),
  ()=>L('Баба-Яга сегодня добрая — лови момент!','Baba Yaga is kind today — seize the moment!'),
  ()=>L('Колобок укатится — а ты догонишь!','The bun will roll away — but you’ll catch it!'),
  ()=>L('Снег скрипит к счастью: поход будет лёгким.','Creaking snow brings luck: an easy run ahead.')];

const G={id:'gadanie',hudIcon:'zba_rune2',minTier:0,noCombo:true,
  dur:o=>120,
  title:()=>L('Гадание у колодца','Fortune at the Well'),
  rules:(o,st)=>[['zba_rune0',L('Смотри: в воде загораются знаки — один за другим.','Watch: signs light up in the water, one after another.')],
    ['zba_rune4',st&&st.pc?L('Повтори порядок: щёлкни по знакам или жми их цифры 1–6.','Repeat the order: click the signs or press their numbers 1–6.'):L('Повтори порядок касаниями.','Repeat the order by tapping.')],
    ['zba_candle',L('Ошибся — гаснет свеча (их три). Дойди до 6 знаков!','A mistake puts out a candle (there are 3). Reach 6 signs!')]],
  tiers:o=>[30,70,150],
  pcHint:st=>[['1','…','6'],L('— знаки по кругу','— signs around the ring')],
  tipY:st=>st.H-Math.max(130*st.k,st.wy-st.wb-st.wa*.4),
  endTitle:(st,t)=>t>=3?L('Сбудется всё!','It will all come true!'):t>=1?L('Вода показала…','The water has spoken…'):L('Вода промолчала…','The water stayed silent…'),
  endLine:st=>L('Знаков: до ','Signs: up to ')+st.maxL+' · '+L('свечей ','candles ')+st.lives+'/3',
  endBadge(st,g,x,y,a,t){const k=st.k,w=Math.min(st.W-24,360*k),p=PRED[st.pred|0]();g.save();g.globalAlpha*=a;const lines=Z.wrap(g,'«'+p+'»',w-80*k,15*k,700),h=Math.max(66*k,lines.length*19*k+(wlRw(t)&&!st.o.train?40:24)*k);g.translate(x,y+h/2-30*k);
    Z.pill(g,-w/2,-h/2,w,h);put(g,'m_babka',-w/2+34*k,0,58*k);g.font=Z.font(15*k,700);g.fillStyle='#fff3c4';g.textAlign='left';g.textBaseline='middle';
    lines.forEach((s,i)=>g.fillText(s,-w/2+68*k,-h/2+16*k+i*19*k));
    if(!st.o.train&&wlRw(t))text(g,L('Вожаки дадут +1 трофей · 1 поход','Leaders drop +1 trophy · 1 run'),-w/2+68*k,h/2-14*k,12.5*k,{al:'left',c:'#bfe8ff',mw:w-80*k});g.restore();},
  extra(st,t){return {maxL:st.maxL|0,lives:st.lives|0,pred:st.pred|0};},   // сила — по ZAB_RW[10].buf ядра (tro)
  init(st,keep){wlLayout(st);if(!keep){wlNew(st);}else{for(const k of['L','seq','si','ph2','pT','inp','lit','rip','lives','maxL','miss','clean','snow','bub','pred','dark','rnd2','okN'])st[k]=keep[k];}st.bg=null;if(!st.snow)wlSnow(st);},
  onStart(st){wlNew(st);wlRound(st);},
  down(st,x,y){const i=wlHit(st,x,y);if(i>=0)wlTap(st,i);},
  move(st,x,y){st.hov=wlHit(st,x,y);},
  key(st,kk){if(/^[1-6]$/.test(kk)){wlTap(st,+kk-1);return true;}return false;},
  cursor:st=>st.hov>=0&&st.ph2==='inp'?'pointer':'default',
  step(st,dt){wlStep(st,dt);},
  idle(st,dt){wlAmb(st,dt);},
  bot(st,dt,sk){wlBot(st,dt,sk);},
  hudBar(st,g,bx,top,bw,h){wlHud(st,g,bx,top,bw,h);},
  draw(st,g,UI){wlDraw(st,g,UI);}};

function wlRw(t){try{const b=ZAB_RW[10].buf[t];return b&&b.tro||0;}catch(e){return t>=1?1:0;}}
function wlLayout(st){const W=st.W,H=st.H,k=st.k,wide=W>H*1.15;st.wide=wide;const SW=wide?Math.min(W,H*1.5):W,ox=(W-SW)/2;st.ox=ox;st.SW=SW;
  st.hz=H*(wide?.42:.4);st.wx=W/2;st.wy=H*(wide?.52:.55);st.wa=wide?Math.min(H*.33,SW*.27):Math.min(W*.45,H*.24);st.wb=st.wa*.5;
  st.rr=Math.max(26*k,Math.min(st.wa*.22,44*k));st.pos=[];const A=[Math.PI,Math.PI*1.32,Math.PI*1.68,0,Math.PI*.32,Math.PI*.68];   // по часовой от левого
  for(let i=0;i<6;i++)st.pos.push({x:st.wx+Math.cos(A[i])*st.wa*.64,y:st.wy+Math.sin(A[i])*st.wb*.52,a:A[i]});
  st.bx=wide?ox+SW*.12:W*.2;st.by=H*(wide?.8:.87);st.bs=wide?H*.26:Math.min(W*.34,H*.16);
  st.cx=wide?ox+SW*.86:W*.8;st.cy=H*(wide?.84:.9);}
function wlSnow(st){st.snow=[];for(let i=0;i<(st.lite?30:70);i++)st.snow.push({x:st.fr()*st.W,y:st.fr()*st.H,v:20+st.fr()*40,s:.8+st.fr()*2,ph:st.fr()*6});}
function wlNew(st){st.L=3;st.seq=[];st.si=0;st.ph2='pre';st.pT=0;st.inp=[];st.lit=[0,0,0,0,0,0];st.rip=[];st.lives=3;st.maxL=0;st.miss=0;st.clean=1;st.bub=null;st.dark=0;st.okN=0;st.hov=-1;
  st.rnd2=Z.rnd(((st.o.seed||1)^0x5e11)>>>0);st.pred=Math.floor(Z.rnd(((st.o.seed||1)^0x9e3)>>>0)()*PRED.length);if(!st.snow)wlSnow(st);}
function wlRound(st){const r=st.rnd2,s=[];for(let i=0;i<st.L;i++){let x;do{x=Math.floor(r()*6);}while(s.length&&x===s[s.length-1]);s.push(x);}st.seq=s;st.si=0;st.inp=[];st.ph2='pre';st.pT=0;
  st.bub={s:L('Смотри в воду…','Look into the water…'),t:0};}
function wlOn(st){return st.calm?.75:.55;}function wlGap(st){return st.calm?.3:.2;}
function wlLight(st,i,f){st.lit[i]=Math.max(st.lit[i],f||1);st.rip.push({x:st.pos[i].x,y:st.pos[i].y,t:0,c:RN[i].c});if(st.live){tn(RN[i].f,.5,'sine',.07);tn(RN[i].f*2,.3,'sine',.025);}}
function wlTap(st,i){if(st.ph2!=='inp'){if(st.ph2==='show'&&st.live&&!st.bubW){st.bub={s:L('Не спеши — сперва смотри!','Easy — watch first!'),t:0};st.bubW=1;}return;}
  const want=st.seq[st.inp.length];wlLight(st,i,1);st.inp.push(i);
  if(i!==want){st.lives--;st.miss++;st.clean=0;st.dark=1;st.ph2='res';st.pT=0;st.ok=0;st.bub={s:st.lives>0?L('Ой, не тот знак… Ещё разок!','Oops, wrong sign… Once more!'):L('Свечи погасли…','The candles went out…'),t:0};
    if(st.live){tn(200,.4,'triangle',.07,120);nz(.3,.06,800,.6);}puff(st,st.pos[i].x,st.pos[i].y,st.rr*1.2,'rgba(80,90,140,.9)');return;}
  if(st.inp.length===st.seq.length){const add=st.L*10;st.score+=add;st.maxL=Math.max(st.maxL,st.L);st.okN++;num(st,st.wx,st.wy-st.wb*1.1,'+'+add,'#bfe8ff',true);
    sparks(st,st.wx,st.wy,st.calm?8:24,'#bfe8ff',220,{gr:-30,a0:-Math.PI/2,spr:2.2,dur:.9});st.ph2='res';st.pT=0;st.ok=1;
    st.bub={s:st.L>=6?L('Всё вижу! Слушай…','I see it all! Listen…'):[L('Верно! Дальше — больше знаков.','Right! Next — more signs.'),L('Ай, глазастый! Ещё…','Sharp eyes! More…')][st.okN%2],t:0};if(st.live)snd('combo');}}
function wlAmb(st,dt){for(let i=0;i<6;i++)st.lit[i]=Math.max(0,st.lit[i]-dt*2.2);for(const r of st.rip)r.t+=dt;st.rip=st.rip.filter(r=>r.t<1.2);st.dark=Math.max(0,st.dark-dt*.8);
  if(st.bub){st.bub.t+=dt;}for(const s of st.snow||[]){s.y+=s.v*dt*st.k;s.x+=Math.sin(st.t*.8+s.ph)*10*dt;if(s.y>st.H+4){s.y=-4;s.x=st.fr()*st.W;}}}
function wlStep(st,dt){wlAmb(st,dt);st.pT+=dt;const on=wlOn(st),gap=wlGap(st);
  if(st.ph2==='pre'&&st.pT>.9){st.ph2='show';st.pT=0;st.si=-1;st.bubW=0;}
  if(st.ph2==='show'){const per=on+gap,i=Math.floor(st.pT/per);
    if(i<st.seq.length&&st.pT-i*per<on){if(st.si!==i){st.si=i;wlLight(st,st.seq[i],1);}st.lit[st.seq[i]]=1;}
    if(st.pT>st.seq.length*per+.1){st.ph2='inp';st.pT=0;st.bub={s:L('Теперь повтори!','Now repeat it!'),t:0};}}
  if(st.ph2==='res'&&st.pT>1.2){if(st.lives<=0){st.over=true;return;}
    if(st.ok){if(st.L>=6){if(st.clean)st.score+=20;st.over=true;return;}st.L++;}wlRound(st);}}
/* бот: смотрит и повторяет; ошибается чаще на длинных порядках */
function wlBot(st,dt,sk){if(st.ph2!=='inp')return;const P={good:{e:.006,d:.32},avg:{e:.03,d:.45},bad:{e:.075,d:.6}}[sk]||{e:.03,d:.45};
  st.bT=(st.bT||0)+dt;if(st.bT<P.d)return;st.bT=0;const want=st.seq[st.inp.length];const err=st.rnd()<P.e*(st.L-1);wlTap(st,err?(want+1+Math.floor(st.rnd()*5))%6:want);}
function wlHit(st,x,y){let bi=-1,bd=1e9;st.pos.forEach((p,i)=>{const d=Math.hypot(x-p.x,y-p.y);if(d<st.rr*1.35+6*st.k&&d<bd){bd=d;bi=i;}});return bi;}

/* ---------- рисование ---------- */
function wlBg(st){const W=st.W,H=st.H,k=st.k,dpr=Z.K.dpr||1,c=Z.canvas(W*dpr,H*dpr),g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const r=Z.rnd(1225),hz=st.hz;
  let gr=g.createLinearGradient(0,0,0,hz);gr.addColorStop(0,'#060a24');gr.addColorStop(.6,'#142a5a');gr.addColorStop(1,'#2a4a7a');g.fillStyle=gr;g.fillRect(0,0,W,hz+2);
  // сполохи и звёзды
  g.save();g.globalAlpha=.18;for(let i=0;i<3;i++){const y=hz*(.25+i*.12);gr=g.createLinearGradient(0,y-30*k,0,y+30*k);gr.addColorStop(0,'rgba(90,255,180,0)');gr.addColorStop(.5,i%2?'rgba(140,120,255,1)':'rgba(90,255,180,1)');gr.addColorStop(1,'rgba(90,255,180,0)');g.fillStyle=gr;
    g.beginPath();g.moveTo(0,y);for(let x=0;x<=W;x+=20)g.lineTo(x,y+Math.sin(x*.01+i*2)*18*k);g.lineTo(W,y+40*k);g.lineTo(0,y+40*k);g.fill();}g.restore();
  for(let i=0;i<110;i++){const x=r()*W,y=r()*hz*.95,s=.5+r()*1.4;g.fillStyle='rgba(255,255,250,'+(.3+r()*.7)+')';g.beginPath();g.arc(x,y,s,0,TAU);g.fill();}
  const mx=st.ox+st.SW*.84,my=hz*.22,mr=24*k;glowAt(g,'#e8f0ff',mx,my,mr*4,.6);g.fillStyle='#f4f6ff';g.beginPath();g.arc(mx,my,mr,0,TAU);g.fill();g.fillStyle='rgba(180,190,220,.5)';for(const [dx,dy,rr0] of[[-.3,-.2,.22],[.25,.3,.16],[.1,-.45,.12]]){g.beginPath();g.arc(mx+dx*mr,my+dy*mr,rr0*mr,0,TAU);g.fill();}
  // избы в снегу с тёплыми окнами
  const n=Math.max(4,Math.round(st.SW/120));for(let i=0;i<n;i++){const x=st.ox+st.SW*(i+.5)/n+(r()-.5)*30*k,s=(.8+r()*.4)*k,w=70*s,h=40*s,y=hz+6*k;
    g.fillStyle='#3a2a2a';g.fillRect(x-w/2,y-h,w,h);g.fillStyle='#4a3434';for(let j=0;j<4;j++)g.fillRect(x-w/2,y-h+j*h/4,w,1.5);
    g.fillStyle='#e8f0ff';g.beginPath();g.moveTo(x-w*.66,y-h+2);g.lineTo(x,y-h-34*s);g.lineTo(x+w*.66,y-h+2);g.closePath();g.fill();g.fillStyle='#c8d4ec';g.beginPath();g.moveTo(x,y-h-34*s);g.lineTo(x+w*.66,y-h+2);g.lineTo(x+w*.3,y-h+2);g.closePath();g.fill();
    g.fillStyle='#ffc860';g.fillRect(x-9*s,y-h*.7,18*s,14*s);glowAt(g,'#ffb040',x,y-h*.6,26*s,.6);g.strokeStyle='#3a2410';g.lineWidth=2*s;g.strokeRect(x-9*s,y-h*.7,18*s,14*s);g.beginPath();g.moveTo(x,y-h*.7);g.lineTo(x,y-h*.7+14*s);g.stroke();
    if(r()<.6){g.fillStyle='#4a3a3a';g.fillRect(x+w*.2,y-h-28*s,8*s,16*s);g.fillStyle='rgba(220,230,255,.25)';for(let j=0;j<3;j++){g.beginPath();g.arc(x+w*.24+j*6*s,y-h-36*s-j*12*s,(5+j*3)*s,0,TAU);g.fill();}}}
  // ели
  for(let i=0;i<Math.round(W/70);i++){const x=r()*W,y=hz+(r()*.03)*H,s=(1+r()*.8)*k;g.fillStyle='#16303a';for(let j=0;j<3;j++){g.beginPath();g.moveTo(x-(16-j*4)*s,y-j*12*s);g.lineTo(x,y-(26+j*12)*s);g.lineTo(x+(16-j*4)*s,y-j*12*s);g.fill();}
    g.fillStyle='rgba(240,246,255,.85)';for(let j=0;j<3;j++){g.beginPath();g.moveTo(x-(8-j*2)*s,y-(10+j*12)*s);g.lineTo(x,y-(26+j*12)*s);g.lineTo(x+(8-j*2)*s,y-(10+j*12)*s);g.fill();}}
  // снег
  gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,'#c8d8f0');gr.addColorStop(.5,'#9ab0d8');gr.addColorStop(1,'#5a6a9a');g.fillStyle=gr;g.fillRect(0,hz+6*k,W,H-hz);
  g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<5;i++){g.beginPath();g.ellipse(r()*W,hz+(H-hz)*(.2+r()*.7),(60+r()*90)*k,(10+r()*12)*k,0,0,TAU);g.fill();}
  for(let i=0;i<80;i++){g.fillStyle='rgba(255,255,255,'+(.4+r()*.6)+')';g.beginPath();g.arc(r()*W,hz+r()*(H-hz),.6+r(),0,TAU);g.fill();}
  // журавль колодца
  const jx=st.wx+st.wa*1.08,jy=st.wy+st.wb*.4;g.strokeStyle='#4a2a14';g.lineWidth=7*k;g.lineCap='round';g.beginPath();g.moveTo(jx,jy+st.wb);g.lineTo(jx,jy-st.wa*.75);g.stroke();
  g.lineWidth=5*k;g.beginPath();g.moveTo(jx-st.wa*1.1,jy-st.wa*1.25);g.lineTo(jx+st.wa*.45,jy-st.wa*.45);g.stroke();g.lineWidth=2*k;g.strokeStyle='#2a1a0a';g.beginPath();g.moveTo(jx-st.wa*1.05,jy-st.wa*1.22);g.lineTo(jx-st.wa*1.05,jy-st.wa*.55);g.stroke();
  g.fillStyle='#6a4a2a';rr(g,jx-st.wa*1.12,jy-st.wa*.58,st.wa*.14,st.wa*.12,3*k);g.fill();g.fillStyle='#f4f8ff';g.fillRect(jx-st.wa*1.12,jy-st.wa*.6,st.wa*.14,3*k);
  g.fillStyle='rgba(240,246,255,.9)';g.beginPath();g.ellipse(jx,jy-st.wa*.76,8*k,3*k,0,0,TAU);g.fill();
  return c;}
function wlLog(st,g,x,y,w,h,snow){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#a8743c');gr.addColorStop(.5,'#7a4a20');gr.addColorStop(1,'#4a2a10');g.fillStyle=gr;rr(g,x,y,w,h,h/2);g.fill();g.strokeStyle='#2e1a0a';g.lineWidth=1.5;g.stroke();
  for(const ex of[x+h*.5,x+w-h*.5]){g.fillStyle='#c89a5a';g.beginPath();g.ellipse(ex,y+h/2,h*.42,h*.46,0,0,TAU);g.fill();g.strokeStyle='#7a4a20';g.lineWidth=1;g.beginPath();g.ellipse(ex,y+h/2,h*.22,h*.24,0,0,TAU);g.stroke();}
  if(snow){g.fillStyle='#f4f8ff';g.beginPath();g.moveTo(x+h*.2,y+h*.1);g.quadraticCurveTo(x+w*.25,y-h*.55,x+w*.5,y-h*.25);g.quadraticCurveTo(x+w*.75,y-h*.6,x+w-h*.2,y+h*.1);g.closePath();g.fill();}}
function wlWell(st,g,front){const k=st.k,x=st.wx,y=st.wy,a=st.wa,b=st.wb,lh=Math.max(14*k,a*.17),w=a*2.3;
  if(!front){for(let i=0;i<2;i++)wlLog(st,g,x-w/2+lh*.3,y-b*.55-lh*(1+i*.95),w-lh*.6,lh,i===1);return;}
  for(let i=0;i<3;i++)wlLog(st,g,x-w/2,y+b*1.02+i*lh*.95,w,lh,i===0);
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+b*1.02+lh*3,w*.55,lh*.5,0,0,TAU);g.fill();}
function wlWater(st,g,UI){const k=st.k,x=st.wx,y=st.wy,a=st.wa,b=st.wb;g.save();g.beginPath();g.ellipse(x,y,a,b,0,0,TAU);g.clip();
  let gr=g.createRadialGradient(x,y-b*.2,a*.1,x,y,a);gr.addColorStop(0,'#1a3070');gr.addColorStop(1,'#040818');g.fillStyle=gr;g.fillRect(x-a,y-b,a*2,b*2);
  // отражение месяца и звёзд
  glowAt(g,'#c8d8ff',x+a*.12,y+b*.05,a*.3,.3);g.fillStyle='rgba(230,236,255,.45)';g.beginPath();g.ellipse(x+a*.12,y+b*.05,a*.07,b*.06,0,0,TAU);g.fill();
  for(const r of st.rip){const q=r.t/1.2;g.strokeStyle=r.c;g.globalAlpha=(1-q)*.7;g.lineWidth=2.5*k;g.beginPath();g.ellipse(r.x,r.y,st.rr*(1+q*2.4),st.rr*.5*(1+q*2.4),0,0,TAU);g.stroke();}g.globalAlpha=1;
  // знаки
  for(let i=0;i<6;i++){const p=st.pos[i],l=st.lit[i],R=st.rr,wob=Math.sin(st.t*1.5+i)*2*k;
    if(l>0){glowAt(g,RN[i].c,p.x,p.y,R*2.4,l*.9);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=l*.4;g.fillStyle=RN[i].c;g.beginPath();g.ellipse(p.x,p.y,R*1.1,R*.6,0,0,TAU);g.fill();g.restore();}
    g.save();g.translate(p.x,p.y+wob);g.scale(1,.82);g.globalAlpha=.32+.68*l;rune(g,i,R*(1+l*.15),l>.05?'#ffffff':RN[i].c);if(l>.05){g.globalAlpha=l;rune(g,i,R*1.05,RN[i].c);}g.restore();
    if(st.hov===i&&UI.ph==='play'&&st.ph2==='inp'){g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=2*k;g.beginPath();g.ellipse(p.x,p.y,R*1.2,R*.75,0,0,TAU);g.stroke();}}
  if(st.dark>0){g.fillStyle='rgba(0,0,10,'+st.dark*.45+')';g.fillRect(x-a,y-b,a*2,b*2);}
  g.restore();
  g.lineWidth=5*k;g.strokeStyle='#3a2410';g.beginPath();g.ellipse(x,y,a,b,0,0,TAU);g.stroke();
  if(st.pc&&UI.ph!=='intro')for(let i=0;i<6;i++){const p=st.pos[i];const side=Math.abs(Math.cos(p.a))>.9?Math.sign(Math.cos(p.a)):Math.sign(Math.cos(p.a));Z.keycap(g,p.x+side*st.rr*1.45,p.y+Math.sin(p.a)*st.rr*.15,String(i+1),20*k);}}
function wlBabka(st,g){const k=st.k,bs=st.bs,x=st.bx,y=st.by,bob=st.calm?0:Math.sin(st.t*1.8)*1.5*k;glowAt(g,'#ffb040',x+bs*.32,y-bs*.12,bs*.7,.45+.1*Math.sin(st.t*11));
  g.fillStyle='rgba(20,30,60,.35)';g.beginPath();g.ellipse(x,y+bs*.36,bs*.33,bs*.07,0,0,TAU);g.fill();put(g,'m_babka',x,y+bob,bs);put(g,'zba_candle',x+bs*.32,y-bs*.02+bob,bs*.5,{rot:Math.sin(st.t*3)*.03});
  // свечи-жизни
  for(let i=0;i<3;i++){const cx=st.cx+(i-1)*bs*.32,on=i<st.lives;if(on)glowAt(g,'#ffb040',cx,st.cy-bs*.2,bs*.35,.5+.15*Math.sin(st.t*9+i));put(g,'zba_candle',cx,st.cy,bs*.42,{a:on?1:.55});
    if(!on){g.fillStyle='#2a2a3a';g.beginPath();g.ellipse(cx,st.cy-bs*.17,bs*.04,bs*.06,0,0,TAU);g.fill();g.fillStyle='rgba(200,210,230,.4)';g.beginPath();g.arc(cx+Math.sin(st.t*2+i)*3*k,st.cy-bs*.3-((st.t*20+i*9)%30)*k,4*k,0,TAU);g.fill();}}
  if(st.bub){const q=st.bub.t,a=Math.min(1,q/.15,st.over?1:(2.6-q)/.3);if(a>0){g.save();g.globalAlpha=a;g.font=Z.font(15*k,800);const tw=Math.min(st.W*.66,g.measureText(st.bub.s).width+24*k),th=34*k,bx=Math.min(st.W-tw-8*k,Math.max(8*k,x-bs*.1)),by=y-bs*.62-th;
    g.fillStyle='#fffaf0';rr(g,bx,by,tw,th,12*k);g.fill();g.strokeStyle='#3a2a5a';g.lineWidth=2*k;g.stroke();g.beginPath();g.moveTo(Math.max(bx+12*k,x-6*k),by+th);g.lineTo(Math.max(bx+8*k,x-10*k),by+th+12*k);g.lineTo(Math.max(bx+24*k,x+8*k),by+th);g.closePath();g.fillStyle='#fffaf0';g.fill();
    text(g,st.bub.s,bx+tw/2,by+th/2+1,15*k,{c:'#2a1a3a',st:false,sh:false,mw:tw-16*k});g.restore();}}}
function wlHud(st,g,bx,top,bw,h){const k=st.k;Z.pill(g,bx,top,bw,h);const L4=[3,4,5,6],cw=bw/4;
  L4.forEach((n,i)=>{const x=bx+cw*(i+.5),done=st.maxL>=n,cur=st.L===n&&!done;g.save();if(cur)glowAt(g,'#bfe8ff',x,top+h/2,h*.6,.5+.2*Math.sin(st.t*4));
    g.beginPath();g.arc(x,top+h/2,h*.3,0,TAU);g.fillStyle=done?'#7ac8ff':cur?'rgba(150,200,255,.35)':'rgba(255,255,255,.12)';g.fill();g.lineWidth=2;g.strokeStyle=done||cur?'#e8f4ff':'rgba(255,255,255,.3)';g.stroke();
    text(g,String(n),x,top+h*.53,h*.34,{c:done?'#0e1838':'#fff3c4',st:!done,sh:false});g.restore();});}
function wlDraw(st,g,UI){const W=st.W,H=st.H,k=st.k;if(!st.bg)st.bg=wlBg(st);g.drawImage(st.bg,0,0,W,H);
  wlWell(st,g,false);wlWater(st,g,UI);wlWell(st,g,true);
  wlBabka(st,g);
  // снегопад
  g.fillStyle='rgba(255,255,255,.85)';for(const s of st.snow||[]){g.beginPath();g.arc(s.x,s.y,s.s*k,0,TAU);g.fill();}
  if(UI.ph==='play'){const t=st.ph2==='show'||st.ph2==='pre'?L('Смотри…','Watch…'):st.ph2==='inp'?L('Повтори: ','Repeat: ')+st.inp.length+' / '+st.seq.length:'';
    if(t)text(g,t,W/2,Math.max(84*k,st.wy-st.wb-st.wa*.78),22*k,{c:st.ph2==='inp'?'#ffe27a':'#d8e8ff',mw:W-30});}}

Z.reg(G,{num:10,n:zabN('Гадание у колодца','Fortune at the Well'),icon:'zba_well_i',kind:'fest',en:true,
  open:()=>{try{if(/[?&]zbafest=1/.test(location.search))return true;const d=new Date(typeof dayMs==='function'?dayMs():Date.now()),m=d.getMonth()+1,dd=d.getDate();return (m===12&&dd>=25)||(m===1&&dd<=19);}catch(e){return false;}}});
})();
