'use strict';
/* BGA (08.10) — забава №1 «Кузнецова наковальня» ⭐ (id 'nakoval'). Набор — js/zab-akit.js (ZBA).
   Движок ритма — из «Колокольного набата» Обороны (mg-nabat.js): ноты по зерну дня, окна попадания, сходящееся кольцо, бот с разбросом — переименовано под zba.
   Кузница в полумраке, горн светится; Микула за наковальней с молотом; на раскалённой заготовке — золотая метка, к ней сжимается кольцо (2,2× → 1× за 1,1 с, на 3-й — 0,9 с).
   Удар: «Точно» ±120 мс — 3 очка, «Хорошо» ±250 мс — 1, иначе «мимо». 3 заготовки × 3 удара, максимум 27.
   Итог: ≥ 20 — «Булатный» (+8 % урона выбранному оружию на 1 поход главы), 12–19 — «Добрый» (+5 %), < 12 — «Сырой» (+3 %). Тренировка — без закалки.
   Сила — по таблице ядра ZAB_RW[1].buf ({might:.03/.05/.08}); игра её не передаёт (extra — только grade/w/счёт). Закаляется оружие богатыря (рисунок в итоге).
   Спокойный режим: кольцо медленнее, окна шире, без тряски. ПК: Пробел / Enter / ↓ — удар. */
(function(){
const Z=window.ZBA;if(!Z)return;
const zabN=typeof window.zabN==='function'?window.zabN:(ru,en)=>({ru,en});   // имя для ZAB_REG (zabN ядра; в f0851ac его ещё нет)
const {put,text,glowAt,rr,sparks,puff,num,tn,nz,snd,vib,TAU}=Z;
const cl=Z.cl;

/* ---------- рисунки (ключи zba_*) ---------- */
// кузнец: Микула в кожаном фартуке (облик Микулы из art.js + фартук поверх)
art('zba_smith',80,g=>{const h=Object.assign({},HERO_ART.mik,{body:'#d8cfbc'});g.save();drawHero(g,h,0);g.restore();
  g.save();g.scale(1.12,1.12);const gr=g.createLinearGradient(0,12,0,23);gr.addColorStop(0,'#8a5a32');gr.addColorStop(1,'#5a3418');g.fillStyle=gr;
  g.beginPath();g.moveTo(-8.5,12.5);g.lineTo(8.5,12.5);g.quadraticCurveTo(10,18,9,22);g.quadraticCurveTo(0,24.5,-9,22);g.quadraticCurveTo(-10,18,-8.5,12.5);g.closePath();g.fill();
  g.lineWidth=.9;g.strokeStyle='#3a200c';g.stroke();g.strokeStyle='rgba(255,220,170,.35)';g.lineWidth=.6;g.setLineDash([1.2,1.2]);g.beginPath();g.moveTo(-7.5,14);g.lineTo(7.5,14);g.quadraticCurveTo(8.6,18,8,21);g.stroke();g.setLineDash([]);
  g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(-4,16,2,4,-.2,0,TAU);g.fill();g.restore();});
art('zba_hammer',48,g=>{g.rotate(-.7);rrect(g,-2.2,-4,4.4,26,2);const gh=g.createLinearGradient(-2.2,0,2.2,0);gh.addColorStop(0,'#5a3418');gh.addColorStop(.5,'#b07a40');gh.addColorStop(1,'#5a3418');g.fillStyle=gh;g.fill();g.lineWidth=1;g.strokeStyle='#2e1a0a';g.stroke();
  rrect(g,-11,-14,22,11,2.5);const gs=g.createLinearGradient(0,-14,0,-3);gs.addColorStop(0,'#e8eef6');gs.addColorStop(.45,'#8a96a8');gs.addColorStop(1,'#3a4250');g.fillStyle=gs;g.fill();g.lineWidth=1.2;g.strokeStyle='#1e232c';g.stroke();
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(-9,-12.5,16,2);});
art('zba_ring',48,g=>{g.lineWidth=3;g.strokeStyle='#ffd23a';g.beginPath();g.arc(0,0,10,0,TAU);g.stroke();g.lineWidth=2.4;g.strokeStyle='#fff';g.beginPath();g.arc(0,0,18,0,TAU);g.stroke();
  g.fillStyle='#ff8a1e';rrect(g,-14,-3,28,6,3);g.fill();g.fillStyle='#ffe07a';rrect(g,-10,-1.5,20,2.5,1.2);g.fill();});
art('zba_blade',48,g=>{g.rotate(-.75);const gs=g.createLinearGradient(-4,0,4,0);gs.addColorStop(0,'#9aa6b8');gs.addColorStop(.5,'#ffffff');gs.addColorStop(1,'#7a8698');g.fillStyle=gs;
  g.beginPath();g.moveTo(-3.6,8);g.lineTo(-3.2,-15);g.lineTo(0,-21);g.lineTo(3.2,-15);g.lineTo(3.6,8);g.closePath();g.fill();g.lineWidth=1;g.strokeStyle='#3a4250';g.stroke();
  g.strokeStyle='rgba(90,110,140,.6)';g.beginPath();g.moveTo(0,-17);g.lineTo(0,7);g.stroke();
  rrect(g,-8,8,16,3.4,1.5);g.fillStyle='#e6b53a';g.fill();g.strokeStyle='#7a5a10';g.stroke();rrect(g,-2,11,4,9,1.5);g.fillStyle='#6a3a1a';g.fill();g.stroke();ell(g,0,21.5,2.6,2.6,'#e6b53a',{lw:.8});});
art('zba_anvil_i',48,g=>{zbaAnvilShape(g,0,4,40,16);const gr=g.createLinearGradient(0,-4,0,20);gr.addColorStop(0,'#7a8698');gr.addColorStop(1,'#262c36');g.fillStyle=gr;g.fill();g.lineWidth=1.3;g.strokeStyle='#14181e';g.stroke();
  g.fillStyle='#ff9a2a';rrect(g,-8,-6.5,18,5,2.5);g.fill();g.fillStyle='#fff0a0';rrect(g,-4,-5.6,10,2,1);g.fill();});
/* силуэт наковальни: центр лица (x,y) — верх рабочей поверхности, w — длина с рогом, h — высота */
function zbaAnvilShape(g,x,y,w,h){const x0=x-w/2,R=x+w/2,f=h*.26;g.beginPath();
  g.moveTo(x0,y+f*.35);g.quadraticCurveTo(x0+w*.12,y-f*.05,x0+w*.3,y);g.lineTo(R-w*.04,y);g.lineTo(R,y+f*.2);g.lineTo(R-w*.02,y+f);g.lineTo(R-w*.14,y+f*1.05);
  g.quadraticCurveTo(R-w*.24,y+f*1.4,R-w*.26,y+h*.62);g.lineTo(R-w*.12,y+h*.82);g.lineTo(R-w*.1,y+h);g.lineTo(x0+w*.3,y+h);g.lineTo(x0+w*.32,y+h*.82);g.lineTo(x0+w*.46,y+h*.62);
  g.quadraticCurveTo(x0+w*.44,y+f*1.4,x0+w*.3,y+f*1.05);g.quadraticCurveTo(x0+w*.12,y+f*.9,x0,y+f*.35);g.closePath();}

const BUF=[.03,.03,.05,.08];

/* оружие богатыря — его закаляет Микула (рисунок и имя в итоге; сила — «+% урона» ядра, might) */
function zbaWeapons(){const out=[];try{const h=typeof HERO_BY!=='undefined'&&HERO_BY[S.hero]||null;if(h&&WEAPONS[h.weapon])out.push(h.weapon);
  const sel=S.wpn&&Array.isArray(S.wpn.sel)?S.wpn.sel:[];for(const id of sel)if(WEAPONS[id]&&out.indexOf(id)<0&&out.length<3)out.push(id);
  if(!out.length)out.push('sword');}catch(e){out.push('sword');}return out;}
function zbaWIcon(id){const w=typeof WEAPONS!=='undefined'&&WEAPONS[id];const k=w&&(w.icon||id);return k&&ART[k]?k:ART[id]?id:'i_sword';}
function zbaWName(id){try{const w=WEAPONS[id];if(!w)return id;if(typeof wpnName==='function')try{const n=wpnName(id);if(n)return n;}catch(e){}return w.name||id;}catch(e){return id;}}

const G={id:'nakoval',hudIcon:'zba_hammer',minTier:1,noCombo:true,
  dur:o=>40,
  title:()=>L('Кузнецова наковальня','The Smith’s Anvil'),
  rules:(o,st)=>[['zba_ring',L('Кольцо сжимается к золотой метке на раскалённой заготовке.','A ring shrinks toward the golden mark on the red‑hot billet.')],
    ['zba_hammer',st&&st.pc?L('Жми Пробел (или щёлкни), когда кольцо ляжет на метку.','Press Space (or click) when the ring meets the mark.'):L('Коснись экрана, когда кольцо ляжет на метку.','Tap the screen when the ring meets the mark.')],
    ['zba_blade',L('3 заготовки по 3 удара. 20 очков и больше — булатный клинок!','3 billets, 3 strikes each. 20+ points — a Damascus blade!')]],
  tiers:o=>[0,12,20],
  endTitle:(st,t)=>t>=3?L('Булатный клинок!','Damascus blade!'):t>=2?L('Добрый клинок','A fine blade'):L('Сырой клинок','A raw blade'),
  endLine:st=>L('Точно ','Perfect ')+st.cnt[0]+' · '+L('хорошо ','good ')+st.cnt[1]+' · '+L('мимо ','missed ')+st.miss,
  endBadge(st,g,x,y,a,t){const k=st.k,id=zbaWSel(st),w=Math.min(st.W-30,330*k),h=58*k;g.save();g.globalAlpha*=a;g.translate(x,y);g.scale(.8+.2*Z.back(a),.8+.2*Z.back(a));
    Z.pill(g,-w/2,-h/2,w,h);put(g,zbaWIcon(id),-w/2+h*.62,0,h*.86);
    const v=zbaRw(t),s=st.o.train?L('Тренировка — без закалки','Practice — no tempering'):'+'+Math.round(v*100)+L(' % урона — закалка','% damage — tempered');
    text(g,s,-w/2+h*1.2,-h*.13,17*k,{al:'left',c:'#ffe27a',mw:w-h*1.4});text(g,st.o.train?L('рекорд считаем','score still counts'):zbaWName(id)+L(' · 1 следующий поход главы',' · your next chapter run'),-w/2+h*1.2,h*.24,12.5*k,{al:'left',c:'#fff3c4',mw:w-h*1.4});g.restore();},
  extra(st,t){t=t||1;return {grade:['raw','raw','good','bulat'][t],w:zbaWSel(st),perf:st.cnt[0]|0,good:st.cnt[1]|0,miss:st.miss|0};},   // сила — по ZAB_RW[1].buf ядра (might)
  init(st,keep){zbaLayout(st);if(!keep){st.notes=zbaSong(st);st.cnt=[0,0];st.miss=0;st.bl=[0,0,0];st.lab=[];st.hm=1;st.hmT=1;st.sw=0;st.shake=0;st.emb=[];st.steam=[];}
    else{for(const k of['notes','cnt','miss','bl','lab','hm','hmT','sw','shake','emb','steam','ws','pickSel'])st[k]=keep[k];if(!st.emb)st.emb=[];}
    st.bg=null;},
  onStart(st){st.notes=zbaSong(st);st.cnt=[0,0];st.miss=0;st.bl=[0,0,0];st.lab=[];},
  down(st){zbaTap(st);},
  key(st,kk){if(kk===' '||kk==='Enter'||kk==='ArrowDown'||kk==='ArrowUp'||kk==='j'||kk==='f'||kk==='о'||kk==='а'){zbaTap(st);return true;}return false;}, // i18n:ru — русская раскладка клавиш (о/а = j/f), не текст
  cursor:()=>'pointer',
  step(st,dt){zbaStep(st,dt);},
  idle(st,dt){zbaAmb(st,dt);},
  bot(st,dt,sk){zbaBot(st,dt,sk);},
  hudBar(st,g,bx,top,bw,h){zbaHudBar(st,g,bx,top,bw,h);},
  draw(st,g,UI){zbaDraw(st,g,UI);}};
function o_train(st){return !!(st&&st.o&&st.o.train);}
function zbaWSel(st){const ws=st.ws||(st.ws=zbaWeapons());return ws[0];}
/* сила закалки по ступени — из таблицы ядра ZAB_RW[1].buf (might), без ядра — запасные числа */
function zbaRw(t){try{const b=ZAB_RW[1].buf[t];if(b&&b.might!=null)return b.might;}catch(e){}return BUF[t]||0;}

/* ---------- раскладка ---------- */
function zbaLayout(st){const W=st.W,H=st.H,k=st.k,wide=W>H*1.15;st.wide=wide;
  const SW=wide?Math.min(W,H*1.5):W,ox=(W-SW)/2;st.ox=ox;st.SW=SW;
  st.floorY=H*(wide?.66:.66);st.gnd=H*(wide?.79:.765);
  const aw=wide?Math.min(H*.48,SW*.34):Math.min(W*.6,H*.32);st.aw=aw;st.ah=aw*.42;
  st.ax=wide?ox+SW*.43:W*.4;st.ay=H*(wide?.58:.6);
  st.bw=aw*.5;st.bh=Math.max(11*k,aw*.075);st.sx=st.ax-aw*.08;st.sy=st.ay-st.bh*.55;
  st.R0=Math.max(34*k,Math.min(64*k,aw*.2));
  const sz=wide?Math.min(SW*.3,H*.44):Math.min(W*.66,H*.37),u=sz/80;st.msz=sz;st.mu=u;
  st.mx=wide?st.ax+aw*.78:W*.775;st.my=st.gnd-H*.025-28*u;st.hx=st.mx-13.4*u;st.hy=st.my+11.2*u;
  st.Lh=Math.hypot(st.sx-st.hx,st.sy-st.hy);st.ths=Math.atan2(st.sy-st.hy,st.sx-st.hx);st.thr=st.ths+1.95;
  st.zoneH=Math.max(70*k,H*(wide?.12:.11));st.zoneY=H-st.zoneH-Math.max(10*k,H*.022);
  st.gx=ox+SW*(wide?.12:.12);st.gy=st.floorY;st.gw=SW*(wide?.24:.4);
  st.barX=wide?Math.min(W-40*k,st.mx+sz*.5):ox+SW*.87;st.barY=st.gnd+H*.025;
  st.rackX=ox+SW*(wide?.74:.8);st.rackY=H*(wide?.16:.17);st.winX=ox+SW*(wide?.5:.4);st.toolX=ox+SW*(wide?.28:.56);}

/* ---------- ноты: 3 заготовки × 3 удара по зерну дня ---------- */
function zbaLead(st,b){return st.calm?(b===2?1.25:1.45):(b===2?.9:1.1);}
function zbaWin(st){return st.calm?[.16,.32]:[.12,.25];}
function zbaSong(st){const r=Z.rnd((st.o.seed||1)^0xa11e),out=[];let t=1.1;st.bt=[];
  for(let b=0;b<3;b++){const lead=zbaLead(st,b);st.bt.push({app:t-1.1});
    for(let i=0;i<3;i++){const nt=t+lead;out.push({t:nt,b,i,lead,st:'wait'});t=nt+.42+r()*.28;}
    st.bt[b].end=out[out.length-1].t+zbaWin(st)[1]+.15;t=st.bt[b].end+2.1;}
  st.dur=out[out.length-1].t+1.3;return out;}
function zbaCur(st){for(const n of st.notes)if(n.st==='wait')return n;return null;}
function zbaBil(st){if(!st.bt)return 0;for(let b=0;b<3;b++)if(st.t<st.bt[b].end+1.05)return b;return 2;}
function zbaTap(st){const W=zbaWin(st),now=st.t;st.sw=1;st.hmT=0;
  const n=zbaCur(st);if(!n||now<n.t-n.lead){zbaClank(st,.25);return;}   // кольца нет — просто взмах
  const d=now-n.t,ad=Math.abs(d);
  if(ad>W[1]){n.st='miss';st.miss++;st.combo=0;zbaLab(st,d<0?L('Рано!','Early!'):L('Поздно','Late'),'#d8d0e0');zbaClank(st,.35);st.heatK=(st.heatK||0)+.1;return;}
  const gr=ad<=W[0]?0:1,pts=gr?1:3;n.st='hit';n.g=gr;st.cnt[gr]++;st.combo++;st.best=Math.max(st.best,st.combo);st.score+=pts;st.bl[n.b]+=pts;
  zbaLab(st,gr?L('Хорошо','Good'):L('Точно!','Perfect!'),gr?'#bfffb0':'#ffe27a');num(st,st.sx,st.sy-st.R0*1.1,'+'+pts,gr?'#d8ffc8':'#fff2a8',!gr);
  const n0=st.calm?(gr?6:10):(gr?12:26);sparks(st,st.sx,st.sy,n0,gr?'#ffcf6a':'#ffe9a0',gr?220:380,{gr:520,k:'spark',a0:-Math.PI/2,spr:Math.PI*1.6,dur:.6});
  if(!gr){sparks(st,st.sx,st.sy,st.calm?3:8,'#ffffff',160,{gr:300,a0:-Math.PI/2,spr:2.4,dur:.4});if(!st.calm)st.shake=.22;}
  st.flash=gr?.5:1;st.heatK=Math.max(0,(st.heatK||0)-.15);zbaClank(st,gr?.75:1);if(st.live&&!gr)vib(25);}
function zbaLab(st,s,c){st.lab.push({x:st.sx,y:st.sy-st.R0*1.75,s,c,t:0});}
function zbaClank(st,f){if(!st.live)return;const v=.085*f;tn(1650*(.9+f*.15),.32*f+.05,'triangle',v);tn(2480,.22*f,'sine',v*.5);tn(3900,.12,'sine',v*.25);nz(.05,.12*f,3200,1.2);if(f<.5)nz(.08,.1,600,.8);}
function zbaHiss(st){if(!st.live)return;nz(.9,.09,3800,.4);nz(.5,.05,1500,.6);}
function zbaWhoosh(st){if(!st.live)return;nz(.5,.07,700,.5);tn(140,.4,'sine',.04,90);}
function zbaAmb(st,dt){st.flash=Math.max(0,(st.flash||0)-dt*4);st.shake=Math.max(0,(st.shake||0)-dt);
  // молот: опускается при ударе (sw), потом поднимается
  if(st.sw>0){st.sw=Math.max(0,st.sw-dt*3.2);}
  st.hmT=Math.min(1,st.hmT+dt*(st.sw>0?0:2.8));st.hm=st.sw>.7?0:st.hm+(st.hmT-st.hm)*Math.min(1,dt*14);
  for(const l of st.lab)l.t+=dt;st.lab=st.lab.filter(l=>l.t<.9);
  // искры из горна и пар из кадки
  if(!st.calm||st.fr()<.4){st.embT=(st.embT||0)-dt;if(st.embT<=0&&st.emb.length<(st.lite?12:30)){st.embT=.08+st.fr()*.12;st.emb.push({x:st.gx+(st.fr()-.5)*st.gw*.4,y:st.gy-st.gw*.42,vx:(st.fr()-.5)*20,vy:-40-st.fr()*50,t:0,d:1.4+st.fr()*1.4,s:1+st.fr()*1.6});}}
  for(const e of st.emb){e.t+=dt;e.x+=e.vx*dt+Math.sin(e.t*5+e.s)*12*dt;e.y+=e.vy*dt*st.k;}st.emb=st.emb.filter(e=>e.t<e.d);
  for(const s of st.steam){s.t+=dt;s.y-=(30+s.v)*dt*st.k;s.x+=Math.sin(s.t*2+s.ph)*14*dt;}st.steam=st.steam.filter(s=>s.t<s.d);}
function zbaStep(st,dt){zbaAmb(st,dt);const W=zbaWin(st);
  for(const n of st.notes)if(n.st==='wait'&&st.t>n.t+W[1]){n.st='miss';st.miss++;st.combo=0;zbaLab(st,L('Мимо','Miss'),'#d8d0e0');}
  // смена заготовок: закалка в кадке и новая из горна
  const b=zbaBil(st);if(st.bq!==b){if(st.bq!=null&&st.live)zbaWhoosh(st);st.bq=b;}
  for(let i=0;i<3;i++){const B=st.bt[i];if(!B.q&&st.t>B.end+.75){B.q=1;zbaHiss(st);for(let j=0;j<(st.calm?4:9);j++)st.steam.push({x:st.barX+(st.fr()-.5)*st.aw*.3,y:st.barY-st.aw*.36,t:0,d:1.2+st.fr(),v:st.fr()*40,ph:st.fr()*6,r:(16+st.fr()*20)*st.k});}}
  const n=zbaCur(st);if(n&&st.t>n.t-n.lead-.25&&st.sw<=0)st.hmT=1;
  if(!st.notes.some(x=>x.st==='wait')&&st.t>st.bt[2].end+1.1)st.over=true;}
/* бот: бьёт по кольцу с разбросом; плохой иногда пропускает */
function zbaBot(st,dt,sk){const P={good:{s:.06,p:.01},avg:{s:.12,p:.05},bad:{s:.2,p:.14}}[sk]||{s:.12,p:.05};
  for(const n of st.notes){if(n.bs!=null||n.st!=='wait')continue;if(n.t-st.t>.6)break;let z=0;for(let i=0;i<6;i++)z+=st.rnd();z=(z-3)/Math.sqrt(.5);n.bs=st.rnd()<P.p?-1:n.t+z*P.s;}
  for(const n of st.notes){if(n.st==='wait'&&n.bs>0&&st.t>=n.bs){n.bs=0;zbaTap(st);}}}

/* ---------- рисование ---------- */
function zbaBg(st){const W=st.W,H=st.H,k=st.k,dpr=Z.K.dpr||1,c=Z.canvas(W*dpr,H*dpr),g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const r=Z.rnd(777),fy=st.floorY;
  // бревенчатая стена
  let gr=g.createLinearGradient(0,0,0,fy);gr.addColorStop(0,'#1a0f0a');gr.addColorStop(1,'#3a2214');g.fillStyle=gr;g.fillRect(0,0,W,fy);
  const lh=Math.max(26*k,H*.045);for(let y=fy-lh;y>-lh;y-=lh){const lg=g.createLinearGradient(0,y,0,y+lh);lg.addColorStop(0,'#4a2c18');lg.addColorStop(.5,'#6a4024');lg.addColorStop(1,'#2e1a0e');g.fillStyle=lg;rr(g,-10,y+1,W+20,lh-2,lh*.45);g.fill();
    g.strokeStyle='rgba(20,10,4,.45)';g.lineWidth=1;for(let i=0;i<3;i++){const x=r()*W;g.beginPath();g.moveTo(x,y+lh*.35);g.quadraticCurveTo(x+30*k,y+lh*.5,x+60*k,y+lh*.4);g.stroke();}}
  // окошко с ночным небом
  const wx=st.winX-Math.max(56*k,st.SW*(st.wide?.1:.16))/2,wy=H*(st.wide?.1:.09),ww=Math.max(56*k,st.SW*(st.wide?.1:.16)),wh=ww*1.05;
  gr=g.createLinearGradient(0,wy,0,wy+wh);gr.addColorStop(0,'#0e1838');gr.addColorStop(1,'#3a3a7a');g.fillStyle=gr;rr(g,wx,wy,ww,wh,ww*.5);g.fill();
  g.fillStyle='#fff4c8';g.beginPath();g.arc(wx+ww*.68,wy+wh*.32,ww*.13,0,TAU);g.fill();g.fillStyle='#0e1838';g.beginPath();g.arc(wx+ww*.74,wy+wh*.28,ww*.11,0,TAU);g.fill();
  for(let i=0;i<6;i++){g.fillStyle='rgba(255,255,240,.8)';g.beginPath();g.arc(wx+ww*(.15+r()*.7),wy+wh*(.2+r()*.6),.8+r(),0,TAU);g.fill();}
  g.strokeStyle='#2a160a';g.lineWidth=5*k;rr(g,wx,wy,ww,wh,ww*.5);g.stroke();g.lineWidth=3*k;g.beginPath();g.moveTo(wx+ww/2,wy);g.lineTo(wx+ww/2,wy+wh);g.moveTo(wx,wy+wh*.55);g.lineTo(wx+ww,wy+wh*.55);g.stroke();
  // инструмент на стене: клещи и подковы
  const tx=st.toolX,ty=H*(st.wide?.2:.27);
  g.strokeStyle='#2a2e36';g.lineWidth=4*k;g.lineCap='round';for(let i=0;i<2;i++){const x=tx+i*26*k;g.beginPath();g.moveTo(x,ty);g.lineTo(x+8*k,ty+70*k);g.moveTo(x+12*k,ty);g.lineTo(x+4*k,ty+70*k);g.stroke();}
  for(let i=0;i<3;i++){const x=tx+(st.wide?80:68)*k+i*24*k,y=ty+8*k+(i%2)*10*k;g.strokeStyle='#5a6270';g.lineWidth=5*k;g.beginPath();g.arc(x,y,9*k,Math.PI*.15,Math.PI*.85,true);g.stroke();g.fillStyle='#3a2410';g.beginPath();g.arc(x,y-11*k,2.5*k,0,TAU);g.fill();}
  // пол: утоптанная земля и доски
  gr=g.createLinearGradient(0,fy,0,H);gr.addColorStop(0,'#3a2414');gr.addColorStop(1,'#140c06');g.fillStyle=gr;g.fillRect(0,fy,W,H-fy);
  g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1.5;for(let i=0;i<9;i++){const y=fy+(H-fy)*Math.pow(i/9,1.6);g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,fy-3*k,W,6*k);
  // горн: каменная печь с колпаком
  const fx=st.gx,fw=st.gw,fh=fw*.62;
  {const pw=fw*.26,py=fy-fh*1.42;let pg=g.createLinearGradient(fx-pw/2,0,fx+pw/2,0);pg.addColorStop(0,'#4a2a1a');pg.addColorStop(.5,'#8a4a30');pg.addColorStop(1,'#3a2012');g.fillStyle=pg;g.fillRect(fx-pw/2,0,pw,py);g.strokeStyle='rgba(30,12,6,.55)';g.lineWidth=1;const bh=Math.max(9*k,pw*.22);for(let y=py-bh,i=0;y>-bh;y-=bh,i++){g.beginPath();g.moveTo(fx-pw/2,y);g.lineTo(fx+pw/2,y);g.stroke();for(let x=fx-pw/2+(i%2?pw/4:0);x<fx+pw/2;x+=pw/2){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+bh);g.stroke();}}g.fillStyle='rgba(0,0,0,.25)';g.fillRect(fx+pw*.2,0,pw*.3,py);}
  gr=g.createLinearGradient(fx-fw*.4,0,fx+fw*.4,0);gr.addColorStop(0,'#3a3430');gr.addColorStop(.5,'#5a524a');gr.addColorStop(1,'#2e2824');g.fillStyle=gr;
  g.beginPath();g.moveTo(fx-fw*.46,fy-fh*1.02);g.lineTo(fx-fw*.18,fy-fh*1.45);g.lineTo(fx+fw*.18,fy-fh*1.45);g.lineTo(fx+fw*.46,fy-fh*1.02);g.closePath();g.fill();g.strokeStyle='#1a1410';g.lineWidth=2;g.stroke();
  for(let y=fy-fh;y<fy;y+=fh/5)for(let x=fx-fw*.5+((y/(fh/5))%2?fw*.08:0);x<fx+fw*.5-2;x+=fw*.16){const sw=fw*.155,sh=fh/5-2;const sg=g.createLinearGradient(0,y,0,y+sh);const v=r()*.15;sg.addColorStop(0,shade('#7a6a5a',v));sg.addColorStop(1,shade('#4a3e34',-v));g.fillStyle=sg;rr(g,x+1,y+1,Math.min(sw,fx+fw*.5-x-1),sh,3*k);g.fill();}
  // устье горна
  g.fillStyle='#120804';g.beginPath();g.moveTo(fx-fw*.3,fy-fh*.12);g.lineTo(fx-fw*.3,fy-fh*.52);g.quadraticCurveTo(fx,fy-fh*.95,fx+fw*.3,fy-fh*.52);g.lineTo(fx+fw*.3,fy-fh*.12);g.closePath();g.fill();
  // стойка для клинков (3 крюка — счёт заготовок)
  const rx=st.rackX,ry=st.rackY,rw=Math.max(110*k,st.SW*(st.wide?.14:.24));g.fillStyle='#5a3418';rr(g,rx-rw/2,ry-8*k,rw,14*k,5*k);g.fill();g.strokeStyle='#2e1a0a';g.lineWidth=1.5;g.stroke();
  for(let i=0;i<3;i++){const x=rx+(i-1)*rw*.32;g.fillStyle='#2a2e36';g.beginPath();g.arc(x,ry+8*k,3*k,0,TAU);g.fill();}
  // виньетка
  gr=g.createRadialGradient(W/2,H*.55,Math.min(W,H)*.3,W/2,H*.55,Math.max(W,H)*.8);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  return c;}
function zbaBarrel(st,g){const k=st.k,bx=st.barX,by=st.barY,bw2=st.aw*.42,bh2=bw2*.8;
  let gr=g.createLinearGradient(bx-bw2/2,0,bx+bw2/2,0);gr.addColorStop(0,'#4a2c14');gr.addColorStop(.45,'#9a6a38');gr.addColorStop(1,'#3a200c');g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(bx,by,bw2*.55,bw2*.1,0,0,TAU);g.fill();g.fillStyle=gr;
  g.beginPath();g.moveTo(bx-bw2/2,by-bh2);g.lineTo(bx+bw2/2,by-bh2);g.lineTo(bx+bw2*.42,by);g.lineTo(bx-bw2*.42,by);g.closePath();g.fill();g.strokeStyle='#24140a';g.lineWidth=1.5;g.stroke();
  g.strokeStyle='rgba(30,14,4,.4)';g.lineWidth=1;for(let i=1;i<5;i++){const q=i/5;g.beginPath();g.moveTo(bx-bw2/2+bw2*q,by-bh2);g.lineTo(bx-bw2*.42+bw2*.84*q,by);g.stroke();}
  for(const q of[.18,.8]){g.strokeStyle='#2a2e36';g.lineWidth=4*k;g.beginPath();g.moveTo(bx-bw2*(.5-.08*q),by-bh2+bh2*q);g.lineTo(bx+bw2*(.5-.08*q),by-bh2+bh2*q);g.stroke();}
  g.fillStyle='#16303e';g.beginPath();g.ellipse(bx,by-bh2,bw2*.5,bw2*.12,0,0,TAU);g.fill();g.strokeStyle='#5a3418';g.lineWidth=3*k;g.stroke();
  g.fillStyle='rgba(160,210,230,.35)';g.beginPath();g.ellipse(bx-bw2*.12,by-bh2-1,bw2*.22,bw2*.04,0,0,TAU);g.fill();}
function zbaHeatCol(h){const C=[[60,62,70],[120,40,30],[200,60,20],[255,140,30],[255,220,120],[255,250,220]];h=cl(h,0,1)*(C.length-1);const i=Math.min(C.length-2,Math.floor(h)),f=h-i,a=C[i],b=C[i+1];
  return 'rgb('+Math.round(a[0]+(b[0]-a[0])*f)+','+Math.round(a[1]+(b[1]-a[1])*f)+','+Math.round(a[2]+(b[2]-a[2])*f)+')';}
/* заготовка: stage 0..3 — сколько ударов (вытягивается в клинок), heat 0..1 */
function zbaBillet(st,g,x,y,stage,heat,rot,sc){const k=st.k,w=st.bw*(1+stage*.12)*(sc||1),h=st.bh*(1-stage*.14)*(sc||1),tip=stage/3;g.save();g.translate(x,y);if(rot)g.rotate(rot);
  if(heat>.35)glowAt(g,heat>.7?'#ffd860':'#ff7a2a',0,0,w*.75,.55*heat+.1*(st.flash||0));
  g.beginPath();g.moveTo(-w/2+h*.4,-h/2);g.lineTo(w/2-h*.3-w*.18*tip,-h/2);g.quadraticCurveTo(w/2,-h/2+h*tip*.5,w/2+w*.08*tip,h*(.2*tip));g.quadraticCurveTo(w/2-w*.1*tip,h/2,w/2-h*.3-w*.2*tip,h/2);g.lineTo(-w/2+h*.4,h/2);g.quadraticCurveTo(-w/2,h/2,-w/2,0);g.quadraticCurveTo(-w/2,-h/2,-w/2+h*.4,-h/2);g.closePath();
  const gr=g.createLinearGradient(0,-h/2,0,h/2);gr.addColorStop(0,zbaHeatCol(heat+.12));gr.addColorStop(.5,zbaHeatCol(heat));gr.addColorStop(1,zbaHeatCol(heat-.25));g.fillStyle=gr;g.fill();
  g.lineWidth=Math.max(1,1.2*k);g.strokeStyle=heat>.5?'rgba(120,30,10,.6)':'#1e232c';g.stroke();
  if(heat<.45){g.fillStyle='rgba(255,255,255,'+(.25+(.45-heat))+')';g.fillRect(-w/2+h*.5,-h*.3,w*.7,h*.16);}
  // черен у заготовки (хвостовик)
  g.fillStyle='#2a2e36';rr(g,-w/2-w*.22,-h*.18,w*.24,h*.36,h*.15);g.fill();g.restore();}
function zbaAnvil(st,g){const k=st.k,ax=st.ax,ay=st.ay,aw=st.aw,ah=st.ah;
  // колода
  const sw=aw*.42,sy=ay+ah*.95,sh=st.gnd-sy;let gr=g.createLinearGradient(ax-sw/2,0,ax+sw/2,0);gr.addColorStop(0,'#3a200c');gr.addColorStop(.4,'#8a5a2a');gr.addColorStop(1,'#2e1a0a');g.fillStyle=gr;
  g.beginPath();g.moveTo(ax-sw/2,sy);g.lineTo(ax+sw/2,sy);g.lineTo(ax+sw*.56,sy+sh);g.lineTo(ax-sw*.56,sy+sh);g.closePath();g.fill();g.strokeStyle='#1e1006';g.lineWidth=1.5;g.stroke();
  g.fillStyle='#b08048';g.beginPath();g.ellipse(ax,sy,sw/2,sw*.1,0,0,TAU);g.fill();g.strokeStyle='#5a3418';g.stroke();
  for(const q of[.3,.75]){g.strokeStyle='#2a2e36';g.lineWidth=4*k;g.beginPath();g.moveTo(ax-sw*(.5+.06*q),sy+sh*q);g.lineTo(ax+sw*(.5+.06*q),sy+sh*q);g.stroke();}
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(ax,st.gnd,sw*.75,sw*.12,0,0,TAU);g.fill();
  // наковальня
  zbaAnvilShape(g,ax,ay,aw,ah);gr=g.createLinearGradient(0,ay,0,ay+ah);gr.addColorStop(0,'#6a7484');gr.addColorStop(.25,'#3a414e');gr.addColorStop(1,'#1a1e26');g.fillStyle=gr;g.fill();g.lineWidth=2*k;g.strokeStyle='#0c0e12';g.stroke();
  g.save();zbaAnvilShape(g,ax,ay,aw,ah);g.clip();gr=g.createLinearGradient(0,ay-2,0,ay+ah*.12);gr.addColorStop(0,'#d8e0ea');gr.addColorStop(1,'rgba(160,170,190,0)');g.fillStyle=gr;g.fillRect(ax-aw/2,ay-2,aw,ah*.12);
  glowAt(g,'#ff8a2a',st.sx,ay,aw*.35,.45+.3*(st.flash||0));g.restore();}
function zbaSmith(st,g,UI){const k=st.k,sz=st.msz,bob=st.calm?0:Math.sin(st.t*2.2)*1.2*k,lean=st.sw>0?st.sw:0;
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(st.mx,st.my+29*st.mu,sz*.24,sz*.05,0,0,TAU);g.fill();
  put(g,'zba_smith',st.mx-lean*6*k,st.my+bob+lean*4*k,sz,{fx:-1,rot:-lean*.08,sy:1-lean*.03});}
function zbaHammer(st,g){const k=st.k,hm=st.hm,th=st.ths+(st.thr-st.ths)*Z.ease(hm),L1=st.Lh,lean=st.sw>0?st.sw:0,hx=st.hx-lean*6*k,hy=st.hy+lean*4*k+(st.calm?0:Math.sin(st.t*2.2)*1.2*k);
  g.save();g.translate(hx,hy);g.rotate(th);
  const hw=Math.max(6*k,st.Lh*.055);let gr=g.createLinearGradient(0,-hw,0,hw);gr.addColorStop(0,'#5a3418');gr.addColorStop(.5,'#c08a4a');gr.addColorStop(1,'#4a2a12');g.fillStyle=gr;rr(g,-st.Lh*.1,-hw/2,L1*1.02,hw,hw/2);g.fill();g.strokeStyle='#2e1a0a';g.lineWidth=1.2;g.stroke();
  const bl=Math.max(40*k,st.Lh*.4),bt=bl*.48;g.translate(L1-bt*.1,0);gr=g.createLinearGradient(-bt/2,0,bt/2,0);gr.addColorStop(0,'#e8eef6');gr.addColorStop(.4,'#8a96a8');gr.addColorStop(1,'#2e3440');g.fillStyle=gr;
  rr(g,-bt/2,-bl/2,bt,bl,bt*.22);g.fill();g.lineWidth=1.8;g.strokeStyle='#14181e';g.stroke();g.fillStyle='rgba(255,255,255,.45)';g.fillRect(-bt*.32,-bl*.42,bt*.16,bl*.84);
  g.fillStyle='#4a5260';rr(g,-bt*.62,-bl*.12,bt*.14,bl*.24,2);g.fill();
  if(st.flash>0)glowAt(g,'#ffd860',0,0,bl*.9,st.flash*.6);
  g.restore();
  const fr=4.6*st.mu;ell(g,hx,hy,fr,fr,'#eec39c',{lw:1.2});ell(g,hx+Math.cos(th)*fr*1.5,hy+Math.sin(th)*fr*1.5,fr*.9,fr*.9,'#eec39c',{lw:1.2});}
function zbaRing(st,g,UI){const k=st.k,R0=st.R0,x=st.sx,y=st.sy;
  // золотая метка
  const n=zbaCur(st),act=UI.ph==='play'&&n&&st.t>=n.t-n.lead;const pul=act?Math.max(0,1-Math.abs(st.t-n.t)/.3):0;
  g.save();glowAt(g,'#ffd23a',x,y,R0*1.5,.25+.45*pul);g.lineWidth=5*k;g.strokeStyle='rgba(40,20,4,.5)';g.beginPath();g.arc(x,y,R0,0,TAU);g.stroke();
  g.lineWidth=3.4*k;g.strokeStyle='#ffd23a';g.beginPath();g.arc(x,y,R0,0,TAU);g.stroke();
  for(let i=0;i<4;i++){const a=i*Math.PI/2+st.t*.4;g.fillStyle='#ffe27a';g.beginPath();g.moveTo(x+Math.cos(a)*(R0-7*k),y+Math.sin(a)*(R0-7*k));g.lineTo(x+Math.cos(a+.09)*(R0+5*k),y+Math.sin(a+.09)*(R0+5*k));g.lineTo(x+Math.cos(a-.09)*(R0+5*k),y+Math.sin(a-.09)*(R0+5*k));g.closePath();g.fill();}
  g.restore();
  if(!act)return;const dtn=n.t-st.t,q=Math.max(0,dtn/n.lead),R=R0*(1+1.2*q),a=dtn<0?Math.max(0,1+dtn/.25):Math.min(1,(n.lead-dtn)/.2),near=1-Math.min(1,Math.abs(dtn)/.25);
  g.save();g.globalAlpha=a;g.lineWidth=(9-q*3)*k;g.strokeStyle='rgba(20,10,4,.5)';g.beginPath();g.arc(x,y,R,0,TAU);g.stroke();
  g.lineWidth=(5.5-q*2)*k;g.strokeStyle=near>0?'rgb(255,'+Math.round(255-near*30)+','+Math.round(255-near*200)+')':'#ffffff';g.beginPath();g.arc(x,y,R,0,TAU);g.stroke();
  if(near>0)glowAt(g,'#ffe9a0',x,y,R*1.25,near*.5);g.restore();}
function zbaZone(st,g,UI){const k=st.k,W=st.W,y=st.zoneY,h=st.zoneH,w=Math.min(W-24*k,460*k),x=W/2-w/2;const n=zbaCur(st),near=UI.ph==='play'&&n?Math.max(0,1-Math.abs(st.t-n.t)/.5):0;
  g.save();g.fillStyle='rgba(10,6,2,.45)';rr(g,x+2,y+5,w,h,h*.3);g.fill();const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'rgba(140,70,20,.85)');gr.addColorStop(1,'rgba(80,36,10,.9)');g.fillStyle=gr;rr(g,x,y,w,h,h*.3);g.fill();
  g.lineWidth=2.5*k;g.strokeStyle='rgba(255,210,140,'+(.45+near*.5)+')';rr(g,x+2,y+2,w-4,h-4,h*.28);g.stroke();
  if(near>0)glowAt(g,'#ff9a2a',W/2,y+h/2,w*.4,near*.35);
  const s=1+(st.calm?0:near*.08)+(st.sw>.7?.05:0);g.translate(W/2,y+h/2);g.scale(s,s);if(st.pc)Z.keycap(g,-h*1.05,2,L('Пробел','Space'),Math.min(34*k,h*.42));else put(g,'zba_hammer',-h*.95,0,h*.72);text(g,L('БЕЙ!','STRIKE!'),h*.25,2,h*.46,{c:'#ffe27a',stc:'#5a2a04',lw:h*.09,w:900});g.restore();}
function zbaHudBar(st,g,bx,top,bw,h){const k=st.k;Z.pill(g,bx,top,bw,h);const b=zbaBil(st);
  const cw=bw/3;for(let i=0;i<3;i++){const x=bx+cw*(i+.5),done=st.bt&&st.t>st.bt[i].end,cur=i===b&&!done&&st.t>0;g.save();
    if(i)g.fillStyle='rgba(255,233,184,.25)',g.fillRect(bx+cw*i,top+h*.22,1.5,h*.56);
    zbaBillet(st,g,x-cw*.2,top+h/2,done?3:0,done?.12:cur?.9:.3,0,Math.min(cw*.32,h*.9)/st.bw);
    const ns=st.notes?st.notes.filter(n=>n.b===i):[];for(let j=0;j<3;j++){const n=ns[j],px=x+cw*.12+j*Math.min(11*k,cw*.11),py=top+h/2,r=Math.min(4.2*k,cw*.045);
      g.beginPath();g.arc(px,py,r,0,TAU);g.fillStyle=!n||n.st==='wait'?'rgba(255,255,255,.18)':n.st==='miss'?'#7a6a6a':n.g?'#8ad86a':'#ffd23a';g.fill();g.lineWidth=1;g.strokeStyle='rgba(0,0,0,.4)';g.stroke();}
    g.restore();}}
function zbaDraw(st,g,UI){const W=st.W,H=st.H,k=st.k;if(!st.bg)st.bg=zbaBg(st);
  g.save();if(st.shake>0&&!st.calm){const s=st.shake*10*k;g.translate((st.fr()-.5)*s,(st.fr()-.5)*s);}
  g.drawImage(st.bg,0,0,W,H);
  // огонь горна
  const fx=st.gx,fw=st.gw,fh=fw*.62,fy=st.floorY,fl=.8+.2*Math.sin(st.t*7)+.1*Math.sin(st.t*13.3);
  g.save();g.beginPath();g.moveTo(fx-fw*.3,fy-fh*.12);g.lineTo(fx-fw*.3,fy-fh*.52);g.quadraticCurveTo(fx,fy-fh*.95,fx+fw*.3,fy-fh*.52);g.lineTo(fx+fw*.3,fy-fh*.12);g.closePath();g.clip();
  let gr=g.createRadialGradient(fx,fy-fh*.15,2,fx,fy-fh*.3,fw*.4);gr.addColorStop(0,'#fff0a0');gr.addColorStop(.35,'#ff9a2a');gr.addColorStop(1,'#5a1004');g.fillStyle=gr;g.fillRect(fx-fw*.3,fy-fh,fw*.6,fh);
  for(let i=0;i<5;i++){const x=fx+(i-2)*fw*.11,h=fh*(.32+.12*Math.sin(st.t*(5+i)+i*2))*fl;g.fillStyle=i%2?'rgba(255,200,80,.85)':'rgba(255,120,30,.8)';g.beginPath();g.moveTo(x-fw*.07,fy-fh*.12);g.quadraticCurveTo(x-fw*.04,fy-fh*.12-h*.6,x+Math.sin(st.t*4+i)*fw*.02,fy-fh*.12-h);g.quadraticCurveTo(x+fw*.04,fy-fh*.12-h*.6,x+fw*.07,fy-fh*.12);g.fill();}
  g.fillStyle='#2a0c04';for(let i=0;i<7;i++){g.beginPath();g.arc(fx+(i-3)*fw*.08,fy-fh*.12,fw*.045,0,TAU);g.fill();}
  for(let i=0;i<7;i++){g.fillStyle='rgba(255,'+(120+((i*53)%80))+',40,'+(.5+.4*Math.sin(st.t*3+i))+')';g.beginPath();g.arc(fx+(i-3)*fw*.08,fy-fh*.13,fw*.03,0,TAU);g.fill();}
  g.restore();
  glowAt(g,'#ff7a2a',fx,fy-fh*.35,fw*1.4*fl,.5);glowAt(g,'#ffb040',st.ax,st.ay,st.aw*1.1,.25+.15*fl);
  // искры горна
  g.save();g.globalCompositeOperation='lighter';for(const e of st.emb){const a=1-e.t/e.d;g.fillStyle='rgba(255,'+Math.round(150+a*90)+',60,'+a+')';g.beginPath();g.arc(e.x,e.y,e.s*k,0,TAU);g.fill();}g.restore();
  // стойка: готовые клинки
  if(st.bt){const rw=Math.max(110*k,st.SW*(st.wide?.14:.24));for(let i=0;i<3;i++){const B=st.bt[i];if(!B.q)continue;const x=st.rackX+(i-1)*rw*.32,y=st.rackY+8*k,p=st.bl[i],q=p>=7?3:p>=4?2:1,sz=Math.max(44*k,rw*.36);
    if(q===3)glowAt(g,'#bfe0ff',x,y+sz*.4,sz*.55,.5+.2*Math.sin(st.t*3+i));put(g,'zba_blade',x,y+sz*.42,sz,{rot:.75+Math.PI,a:q===1?.75:1});
    text(g,q===3?'★':q===2?'✓':'·',x,y+sz*.98,14*k,{c:q===3?'#ffe27a':'#fff3c4'});}}
  // Микула за наковальней, молот
  zbaSmith(st,g,UI);
  zbaAnvil(st,g);zbaBarrel(st,g);
  // кадка: пар
  for(const s of st.steam){const a=Math.max(0,1-s.t/s.d)*.55;g.fillStyle='rgba(230,236,245,'+a+')';g.beginPath();g.arc(s.x,s.y,s.r*(1+s.t*.8),0,TAU);g.fill();}
  // заготовка на наковальне / летит в кадку / новая из горна
  if(st.bt){const b=zbaBil(st),B=st.bt[b],stage=st.notes.filter(n=>n.b===b&&n.st==='hit').length;
    if(UI.ph!=='play'&&UI.ph!=='end'){zbaBillet(st,g,st.sx,st.sy,0,.9,0);}
    else if(st.t<B.end){const age=st.t-B.app,heat=cl(1-age/14-(st.heatK||0),.45,1);
      const inQ=b>0?cl((st.t-B.app)/1.0,0,1):1;if(inQ<1){const p=Z.ease(inQ);const x=st.gx+(st.sx-st.gx)*p,y=st.gy-st.gw*.3+(st.sy-st.gy+st.gw*.3)*p-Math.sin(p*Math.PI)*st.H*.08;zbaBillet(st,g,x,y,0,1,(1-p)*.5);}
      else zbaBillet(st,g,st.sx,st.sy,stage,heat,0);}
    else{const p=cl((st.t-B.end)/.75,0,1),e=Z.ease(p),x=st.sx+(st.barX-st.sx)*e,y=st.sy+(st.barY-st.aw*.4-st.sy)*e-Math.sin(e*Math.PI)*st.H*.1;
      if(p<1)zbaBillet(st,g,x,y,3,.55-.3*e,-e*1.2);
      const nb=st.bt[b+1];if(nb&&st.t>nb.app){const q=cl((st.t-nb.app)/1.0,0,1),pe=Z.ease(q);zbaBillet(st,g,st.gx+(st.sx-st.gx)*pe,st.gy-st.gw*.3+(st.sy-st.gy+st.gw*.3)*pe-Math.sin(pe*Math.PI)*st.H*.08,0,1,(1-pe)*.5);}}}
  zbaHammer(st,g);
  zbaRing(st,g,UI);
  for(const l of st.lab){const q=l.t/.9,s=st.calm?1:Z.back(Math.min(1,l.t/.18));g.save();g.globalAlpha=q>.6?1-(q-.6)/.4:1;g.translate(l.x,l.y-q*26*k);g.scale(s,s);text(g,l.s,0,0,26*k,{c:l.c,w:900});g.restore();}
  g.restore();
  if(UI.ph==='play'||UI.ph==='go')zbaZone(st,g,UI);
  if(UI.ph==='play'&&st.t<1.4){g.save();g.globalAlpha=Math.min(1,(1.4-st.t)*2);text(g,L('Жди кольцо — и бей!','Wait for the ring — then strike!'),W/2,st.ay-st.R0*2.6,22*k,{c:'#fff3c4',mw:W-30});g.restore();}}

Z.reg(G,{num:1,n:zabN('Кузнецова наковальня','The Smith’s Anvil'),icon:'zba_anvil_i',kind:'daily',en:true,
  open:()=>{try{const f=S.forge||{};for(const i in f)if(f[i]>0)return true;return false;}catch(e){return false;}}});
})();
