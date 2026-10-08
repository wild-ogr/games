'use strict';
/* BGA (08.10) — забава №9 «Сбор трав для зелья» (id 'travy'). Набор — js/zab-akit.js (ZBA).
   Солнечная поляна знахарки: 9 кочек (3×3), на них вырастают травы и через пару секунд вянут. Рецепт дня — 3 травы по 3 штуки:
   коснись нужной — летит в котёл знахарки (+10 и серия); не та трава — «не то» (−3, серия сброшена); белена — ядовита (−15).
   Рецепт собран — зелье сварено (+25), знахарка даёт следующий. 45 с. Тренировка — без силы на бой.
   Итог: «Травяной взвар» — сила по таблице ядра ZAB_RW[9].buf ({regen:.03/.04/.05} — ZFIN — восстановление здоровья на 1 поход главы).
   Спокойный режим: травы стоят дольше, без вспышек. ПК: клавиши 1–9 — кочки (как цифры на клавиатуре: верхний ряд 1 2 3), мышь — всегда. */
(function(){
const Z=window.ZBA;if(!Z)return;
const zabN=typeof window.zabN==='function'?window.zabN:(ru,en)=>({ru,en});   // имя для ZAB_REG (zabN ядра; в f0851ac его ещё нет)
const {put,text,glowAt,rr,sparks,puff,num,tn,nz,snd,TAU}=Z;const cl=Z.cl;

/* ---------- травы ---------- */
const HB={zver:{n:()=>L('Зверобой','St John’s wort'),c:'#ffd23a'},myata:{n:()=>L('Мята','Mint'),c:'#6ad86a'},rom:{n:()=>L('Ромашка','Chamomile'),c:'#ffffff'},
  vas:{n:()=>L('Василёк','Cornflower'),c:'#5a8aff'},pod:{n:()=>L('Подорожник','Plantain'),c:'#4aa83a'},bel:{n:()=>L('Белена','Henbane'),c:'#a05ad0',bad:1}};
const GOOD=['zver','myata','rom','vas','pod'];
function hbName(id){const h=HB[id];return h?h.n():id;}
function stem(g,pts,w,col){g.strokeStyle=col||'#3a8a2a';g.lineWidth=w||1.8;g.lineCap='round';g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=4)g.quadraticCurveTo(pts[i],pts[i+1],pts[i+2],pts[i+3]);g.stroke();}
function leaf(g,x,y,len,wd,ang,col){g.save();g.translate(x,y);g.rotate(ang);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.5,-wd,len,0);g.quadraticCurveTo(len*.5,wd,0,0);g.closePath();
  const gr=g.createLinearGradient(0,-wd,0,wd);gr.addColorStop(0,shade(col,.25));gr.addColorStop(1,shade(col,-.25));g.fillStyle=gr;g.fill();g.lineWidth=.7;g.strokeStyle=shade(col,-.5);g.stroke();
  g.strokeStyle=shade(col,-.35);g.lineWidth=.5;g.beginPath();g.moveTo(1,0);g.lineTo(len*.85,0);g.stroke();g.restore();}
function flower5(g,x,y,r,col,cen){for(let i=0;i<5;i++){const a=i*TAU/5;ell(g,x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62,r*.48,r*.36,col,{rot:a,lw:.5});}ell(g,x,y,r*.3,r*.3,cen||'#e08a10',{lw:.5});}
art('zba_h_zver',48,g=>{stem(g,[0,22,1,8,-1,-4]);stem(g,[0,6,-6,0,-9,-8],1.4);stem(g,[0,4,6,-2,8,-10],1.4);for(const [x,y,a] of[[0,14,-2.6],[0,12,-.5],[-1,2,-2.4],[0,0,-.7]])leaf(g,x,y,9,3,a,'#5aa83a');
  for(const [x,y,r] of[[-9,-10,5],[8,-12,5],[-1,-7,5.5],[-4,-15,4.6],[4,-17,4.4]])flower5(g,x,y,r,'#ffd23a','#e07a10');});
art('zba_h_myata',48,g=>{stem(g,[0,22,0,6,0,-14],2.2,'#4a9a3a');for(const [y,s] of[[14,1],[6,.9],[-2,.8],[-9,.65]]){leaf(g,0,y,13*s,5.2*s,-.35,'#6ad86a');leaf(g,0,y,13*s,5.2*s,Math.PI+.35,'#6ad86a');}
  for(let i=0;i<5;i++)ell(g,0,-15-i*2.4,2.4-i*.25,1.6,'#c8a0e8',{lw:.4});});
art('zba_h_rom',48,g=>{stem(g,[0,22,-2,6,-6,-10]);stem(g,[0,20,4,6,8,-4]);leaf(g,-1,14,10,2.5,-2.4,'#5aa83a');leaf(g,1,10,9,2.2,-.6,'#5aa83a');
  for(const [x,y,r] of[[-6,-11,9],[8,-5,7.5]]){for(let i=0;i<12;i++){const a=i*TAU/12;ell(g,x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,r*.42,r*.16,'#ffffff',{rot:a,lw:.4,olc:'#a0a0b0'});}ell(g,x,y,r*.34,r*.34,'#ffcf1a',{lw:.6});}});
art('zba_h_vas',48,g=>{stem(g,[0,22,0,6,-4,-8]);stem(g,[0,10,5,2,7,-6],1.5);leaf(g,0,16,11,1.8,-2.2,'#7ab05a');leaf(g,0,12,11,1.8,-.9,'#7ab05a');
  for(const [x,y,r] of[[-4,-11,8],[7,-9,6.5]]){ell(g,x,y+r*.55,r*.32,r*.38,'#5a8a4a',{lw:.5});for(let i=0;i<9;i++){const a=-Math.PI+i*Math.PI/8;g.save();g.translate(x,y);g.rotate(a+Math.PI/2);g.beginPath();g.moveTo(-r*.13,0);g.lineTo(-r*.24,-r*.9);g.lineTo(-r*.08,-r*.72);g.lineTo(0,-r*.98);g.lineTo(r*.08,-r*.72);g.lineTo(r*.24,-r*.9);g.lineTo(r*.13,0);g.closePath();
    const gr=g.createLinearGradient(0,0,0,-r);gr.addColorStop(0,'#2a4ad8');gr.addColorStop(1,'#7aa8ff');g.fillStyle=gr;g.fill();g.lineWidth=.4;g.strokeStyle='#1a2a8a';g.stroke();g.restore();}ell(g,x,y,r*.22,r*.22,'#3a2a8a',{lw:.4});}});
art('zba_h_pod',48,g=>{for(const [a,s] of[[-2.5,1],[-.65,1],[-1.9,.85],[-1.2,.9],[-3,.75],[-.15,.75]]){g.save();g.translate(0,18);g.rotate(a);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(8*s,-7*s,20*s,-6*s,22*s,0);g.bezierCurveTo(20*s,6*s,8*s,7*s,0,0);g.closePath();
    const gr=g.createLinearGradient(0,-6,0,6);gr.addColorStop(0,'#7ac85a');gr.addColorStop(1,'#3a7a2a');g.fillStyle=gr;g.fill();g.lineWidth=.7;g.strokeStyle='#24501a';g.stroke();g.strokeStyle='rgba(220,255,200,.55)';g.lineWidth=.5;
    for(const q of[-2.5,0,2.5]){g.beginPath();g.moveTo(2,0);g.quadraticCurveTo(11*s,q*s*1.3,20*s,q*.3);g.stroke();}g.restore();}
  stem(g,[0,16,0,0,1,-12],1.6,'#5a7a3a');for(let i=0;i<7;i++)ell(g,1,-14+i*2.2,1.8,1.3,'#8a7a4a',{lw:.3});});
art('zba_h_bel',48,g=>{stem(g,[0,22,1,6,-1,-8],2.2,'#6a8a5a');for(const [x,y,a] of[[0,16,-2.7],[0,14,-.45],[0,6,-2.5],[0,4,-.6]]){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(0,0);
    for(let i=0;i<=6;i++){const q=i/6;g.lineTo(13*q,-(4.5*Math.sin(q*Math.PI))-(i%2?1.6:0));}for(let i=6;i>=0;i--){const q=i/6;g.lineTo(13*q,4.5*Math.sin(q*Math.PI)+(i%2?1.6:0));}g.closePath();g.fillStyle='#8aa078';g.fill();g.lineWidth=.6;g.strokeStyle='#3a4a2a';g.stroke();g.restore();}
  for(const [x,y,r,a] of[[-6,-10,7,-.4],[6,-8,6.5,.5],[0,-17,6,0]]){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(-r*.5,r*.4);g.quadraticCurveTo(-r*1.05,-r*.4,-r*.8,-r*.9);g.quadraticCurveTo(0,-r*.55,r*.8,-r*.9);g.quadraticCurveTo(r*1.05,-r*.4,r*.5,r*.4);g.closePath();
    g.fillStyle='#e8dca0';g.fill();g.lineWidth=.6;g.strokeStyle='#6a4a6a';g.stroke();g.strokeStyle='rgba(110,40,120,.75)';g.lineWidth=.5;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*r*.12,-r*.1);g.lineTo(i*r*.32,-r*.75);g.stroke();}
    ell(g,0,-r*.3,r*.3,r*.28,'#4a1a5a',{lw:.4});g.restore();}});
art('zba_kotel',48,g=>{g.strokeStyle='#3a2a1a';g.lineWidth=2;g.beginPath();g.moveTo(-14,22);g.lineTo(0,-16);g.lineTo(14,22);g.stroke();
  ell(g,0,8,16,13,'#3a3a44',{hl:.35});ell(g,0,-2,14,3.6,'#5a6a4a',{lw:1});g.fillStyle='rgba(160,255,140,.6)';g.beginPath();g.ellipse(-3,-2.5,6,1.4,0,0,TAU);g.fill();
  for(const [x,y,r] of[[-4,-8,3],[3,-11,2.4],[0,-15,1.8]])ell(g,x,y,r,r,'rgba(200,255,190,.7)',{ol:false,flat:true});});

/* ---------- игра ---------- */
const G={id:'travy',noCombo:true,hudIcon:'zba_h_zver',barCol:['#c8ff7a','#4ab83a'],
  dur:o=>45,
  title:()=>L('Сбор трав для зелья','Herbs for a Potion'),
  rules:(o,st)=>[['zba_h_rom',L('Собери травы по рецепту знахарки — он вверху экрана.','Gather the herbs from the herbalist’s recipe at the top.')],
    ['zba_h_zver',st&&st.pc?L('Щёлкни по траве или жми цифру её кочки 1–9. Трава скоро вянет!','Click a herb or press its patch number 1–9. Herbs wilt fast!'):L('Коснись нужной травы, пока она не завяла.','Tap the right herb before it wilts.')],
    ['zba_h_bel',L('Белену не рви — она ядовита!','Never pick henbane — it’s poisonous!')]],
  tiers:o=>{const c=o.calm?.8:1;return [Math.round(180*c),Math.round(420*c),Math.round(650*c)];},
  tipY:st=>st.H-st.hz-26*st.k,
  pcHint:st=>[['1','…','9'],L('— кочки, как на клавиатуре','— patches, like the keyboard')],
  endTitle:(st,t)=>t>=3?L('Взвар на славу!','A splendid brew!'):t>=2?L('Добрый взвар','A good brew'):t>=1?L('Взвар сварен','The brew is ready'):L('Корзинка пуста…','The basket is empty…'),
  endLine:st=>L('Трав ','Herbs ')+st.got+' · '+L('зелий ','potions ')+st.pots+(st.bad?' · '+L('белена ','henbane ')+st.bad:''),
  endBadge(st,g,x,y,a,t){const k=st.k,w=Math.min(st.W-30,330*k),h=58*k;g.save();g.globalAlpha*=a;g.translate(x,y);
    Z.pill(g,-w/2,-h/2,w,h);put(g,'zba_kotel',-w/2+h*.62,0,h*.86);const v=Math.round(trRw(t)*100);
    text(g,st.o.train?L('Тренировка — без взвара','Practice — no brew'):v?L('Травяной взвар: +'+v+' % лечения','Herbal brew: +'+v+'% healing'):L('Без взвара — трав мало','No brew — too few herbs'),-w/2+h*1.2,-h*.13,16*k,{al:'left',c:'#d8ffb0',mw:w-h*1.4});
    text(g,L('на 1 следующий поход главы','for your next chapter run'),-w/2+h*1.2,h*.24,12.5*k,{al:'left',c:'#fff3c4',mw:w-h*1.4});g.restore();},
  extra(st,t){return {got:st.got|0,pots:st.pots|0,bad:st.bad|0};},   // сила — по ZAB_RW[9].buf ядра (regen)
  init(st,keep){trLayout(st);if(!keep){trNew(st);}else{for(const k of['pa','hb','rec','got','pots','bad','sp','fly','lab','bub','shake','tint','spT','nextId','recN','kot'])st[k]=keep[k];trPos(st);}st.bg=null;},
  onStart(st){trNew(st);},
  down(st,x,y){const i=trHit(st,x,y);if(i>=0)trTap(st,i);},
  move(st,x,y){st.hov=trHit(st,x,y);},
  key(st,kk){if(/^[1-9]$/.test(kk)){trTap(st,+kk-1);return true;}return false;},
  cursor:st=>st.hov>=0?'pointer':'default',
  step(st,dt){trStep(st,dt);},
  idle(st,dt){trAmb(st,dt);},
  bot(st,dt,sk){trBot(st,dt,sk);},
  hudExtra(st,g,y){trRecipe(st,g,y);},
  draw(st,g,UI){trDraw(st,g,UI);}};

function trRw(t){try{const b=ZAB_RW[9].buf[t];return b&&b.regen||0;}catch(e){return [0,.05,.08,.10][t]||0;}}
function trLayout(st){const W=st.W,H=st.H,k=st.k,wide=W>H*1.15;st.wide=wide;const SW=wide?Math.min(W,H*1.5):W,ox=(W-SW)/2;st.ox=ox;st.SW=SW;
  st.hz=H*(wide?.3:.29);
  const ys=wide?[.42,.58,.76]:[.45,.6,.755],xs=wide?[[.33,.5,.67],[.31,.5,.69],[.29,.5,.71]]:[[.22,.5,.78],[.18,.5,.82],[.15,.5,.85]],sc=[.82,.92,1.04];
  st.pr=Math.max(40*k,Math.min(wide?H*.085:W*.12,62*k*1.1));st.pts0=[];
  for(let r=0;r<3;r++)for(let c=0;c<3;c++)st.pts0.push({x:ox+SW*xs[r][c],y:H*ys[r],s:sc[r],r,c});
  st.bx=wide?ox+SW*.1:W*.17;st.by=H*(wide?.86:.885);st.bs=wide?H*.3:Math.min(W*.36,H*.17);
  st.kx=wide?ox+SW*.2:W*.43;st.ky=H*(wide?.88:.9);st.ks=st.bs*.62;}
function trPos(st){for(let i=0;i<9;i++){const p=st.pts0[i];if(st.pa&&st.pa[i])Object.assign(st.pa[i],{x:p.x,y:p.y,s:p.s});}}
function trNew(st){st.pa=st.pts0.map((p,i)=>Object.assign({i,h:null},p));st.got=0;st.pots=0;st.bad=0;st.fly=[];st.lab=[];st.bub=null;st.shake=0;st.tint=0;st.spT=.5;st.recN=0;st.kot=0;st.hov=-1;trRec(st);}
function trRec(st){const r=Z.rnd(((st.o.seed||1)^0x7e1b)+st.recN*977),a=GOOD.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  st.rec=a.slice(0,3).map(id=>({id,n:0,need:3,fl:0}));st.recN++;st.recT=0;}
function trNeed(st,id){const q=st.rec.find(x=>x.id===id);return q&&q.n<q.need?q:null;}
function trLife(st){const t=st.t/st.dur;return (st.calm?3.1:2.4)-(st.calm?.5:.9)*t;}
function trSpawn(st){const free=st.pa.filter(p=>!p.h);if(!free.length)return;const p=free[Math.floor(st.rnd()*free.length)];
  const bads=st.pa.filter(q=>q.h&&q.h.id==='bel'&&!q.h.gone).length,need=st.rec.filter(q=>q.n<q.need).map(q=>q.id),other=GOOD.filter(id=>!need.includes(id));
  const r=st.rnd();let id;if(r<.56&&need.length)id=need[Math.floor(st.rnd()*need.length)];else if(r<.8||bads>=2)id=other.length?other[Math.floor(st.rnd()*other.length)]:need[0];else id='bel';
  p.h={id,t:0,life:trLife(st)*(.85+st.rnd()*.3),gone:0,sh:0,ph:st.rnd()*6,uid:(st.nextId=(st.nextId|0)+1)};}
function trTap(st,i){const p=st.pa[i];if(!p)return;const h=p.h;if(!h||h.gone){if(st.live)tn(300,.05,'triangle',.03);return;}
  const k=st.k;
  if(h.id==='bel'){st.bad++;st.score=Math.max(0,st.score-15);st.combo=0;h.gone=1;h.bad=1;st.shake=st.calm?0:.3;st.tint=st.calm?0:.6;
    puff(st,p.x,p.y-st.pr*.5,st.pr*.9,'#b07ad8');st.lab.push({x:p.x,y:p.y-st.pr*1.1,s:L('Ядовита!','Poison!'),c:'#e0b0ff',t:0});num(st,p.x,p.y-st.pr*.6,'−15','#e0a0ff');
    st.bub={s:L('Ой! Белена — брось её!','Oh! Henbane — drop it!'),t:0};if(st.live){tn(180,.3,'sawtooth',.06,90);nz(.25,.1,500,.8);}return;}
  const q=trNeed(st,h.id);
  if(!q){st.combo=0;st.score=Math.max(0,st.score-3);h.sh=.4;st.lab.push({x:p.x,y:p.y-st.pr*1.1,s:st.rec.some(x=>x.id===h.id)?L('Хватит этой','Enough of it'):L('Не то','Wrong herb'),c:'#e8e0d0',t:0});
    if(st.live)tn(240,.12,'triangle',.05,180);return;}
  q.n++;q.fl=1;st.got++;st.combo++;st.best=Math.max(st.best,st.combo);const add=10+Math.min(st.combo,10);st.score+=add;h.gone=1;h.pick=1;
  num(st,p.x,p.y-st.pr*.7,'+'+add,'#e8ffc0');sparks(st,p.x,p.y-st.pr*.3,st.calm?4:10,HB[h.id].c,150,{gr:120});
  st.fly.push({id:h.id,x0:p.x,y0:p.y-st.pr*.3,t:0,d:.6,s:p.s});if(st.live){tn(660+Math.min(st.combo,10)*40,.09,'triangle',.07);tn(990+Math.min(st.combo,10)*50,.08,'sine',.04,0,.05);}
  if(st.rec.every(x=>x.n>=x.need)){st.pots++;st.score+=25;st.potT=1.4;st.kot=1;num(st,st.kx,st.ky-st.ks*.8,'+25 '+L('зелье!','potion!'),'#ffe27a',true);
    st.bub={s:[L('Славное зелье! Ещё рецепт…','A fine potion! Another recipe…'),L('Ай да помощник! Дальше…','What a helper! Next…')][st.pots%2],t:0};
    sparks(st,st.kx,st.ky-st.ks*.6,st.calm?8:24,'#b0ff9a',220,{gr:-40,a0:-Math.PI/2,spr:1.6,dur:.9});if(st.live)snd('level');st.recWait=.9;}}
function trAmb(st,dt){st.shake=Math.max(0,st.shake-dt);st.tint=Math.max(0,st.tint-dt*1.5);st.kot=Math.max(0,st.kot-dt*.8);
  for(const l of st.lab)l.t+=dt;st.lab=st.lab.filter(l=>l.t<.9);if(st.bub){st.bub.t+=dt;if(st.bub.t>2.2)st.bub=null;}
  for(const f of st.fly)f.t+=dt;st.fly=st.fly.filter(f=>f.t<f.d);if(st.rec)for(const q of st.rec)q.fl=Math.max(0,q.fl-dt*2);
  for(const p of st.pa||[]){const h=p.h;if(!h)continue;h.t+=dt;h.sh=Math.max(0,h.sh-dt*2);if(h.gone){h.gone+=dt;if(h.gone>1.35)p.h=null;}}}
function trStep(st,dt){trAmb(st,dt);
  if(st.recWait>0){st.recWait-=dt;if(st.recWait<=0){trRec(st);for(const p of st.pa)if(p.h&&!p.h.gone)p.h.t=Math.max(p.h.t,p.h.life-.3);}}
  for(const p of st.pa){const h=p.h;if(h&&!h.gone&&h.t>h.life){h.gone=1;h.wilt=1;}}
  st.spT-=dt;if(st.spT<=0&&!(st.recWait>0)){trSpawn(st);const q=st.t/st.dur;st.spT=(st.calm?1.0:.78)-(st.calm?.2:.3)*q+st.rnd()*.15;if(st.rnd()<.25+q*.25)trSpawn(st);}}
function trHit(st,x,y){let bi=-1,bd=1e9;for(const p of st.pa||[]){const d=Math.hypot(x-p.x,(y-(p.y-st.pr*.45*p.s))*.8);if(d<st.pr*1.05*p.s+8*st.k&&d<bd){bd=d;bi=p.i;}}return bi;}
/* бот: замечает траву через «реакцию», рвёт нужную; плохой иногда ошибается */
function trBot(st,dt,sk){const P={good:{r:.38,e:.01,m:.05},avg:{r:.6,e:.05,m:.18},bad:{r:.85,e:.12,m:.35}}[sk]||{r:.6,e:.05,m:.18};
  for(const p of st.pa){const h=p.h;if(!h||h.gone)continue;if(h.bt==null){h.bt=P.r*(.7+st.rnd()*.6);h.miss=st.rnd()<P.m;h.err=st.rnd()<P.e;}
    if(h.t>=h.bt&&!h.done){h.done=1;const want=h.id!=='bel'&&trNeed(st,h.id);if((want&&!h.miss)||(!want&&h.err))trTap(st,p.i);}}}

/* ---------- рисование ---------- */
function trBg(st){const W=st.W,H=st.H,k=st.k,dpr=Z.K.dpr||1,c=Z.canvas(W*dpr,H*dpr),g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const r=Z.rnd(909),hz=st.hz;
  let gr=g.createLinearGradient(0,0,0,hz);gr.addColorStop(0,'#5ab0e8');gr.addColorStop(.7,'#bfe6f4');gr.addColorStop(1,'#fff2c8');g.fillStyle=gr;g.fillRect(0,0,W,hz+2);
  // солнце и облака
  const sx=st.ox+st.SW*.82,sy=hz*.32;glowAt(g,'#fff2a0',sx,sy,90*k,.9);g.fillStyle='#fff8d0';g.beginPath();g.arc(sx,sy,22*k,0,TAU);g.fill();
  for(let i=0;i<4;i++){const cx=r()*W,cy=hz*(.2+r()*.35),s=(24+r()*20)*k;g.fillStyle='rgba(255,255,255,.85)';for(const [dx,dy,rr0] of[[0,0,1],[.9,.15,.75],[-.85,.2,.7],[.4,-.35,.7]]){g.beginPath();g.arc(cx+dx*s,cy+dy*s,rr0*s,0,TAU);g.fill();}}
  // дальний лес
  for(const [y,col,h0] of[[hz-6*k,'#5a9a6a',38],[hz+4*k,'#3a7a4a',30]]){g.fillStyle=col;for(let x=-20;x<W+20;x+=(14+r()*12)*k){const h=(h0+r()*26)*k;g.beginPath();g.moveTo(x-11*k,y+6*k);g.lineTo(x,y-h);g.lineTo(x+11*k,y+6*k);g.fill();}}
  // изба знахарки вдали
  const ix=st.ox+st.SW*(st.wide?.84:.8),iy=hz+8*k,iw=58*k;g.fillStyle='#7a4a24';g.fillRect(ix-iw/2,iy-iw*.55,iw,iw*.55);g.fillStyle='#4a6a2a';g.beginPath();g.moveTo(ix-iw*.65,iy-iw*.5);g.lineTo(ix,iy-iw*1.05);g.lineTo(ix+iw*.65,iy-iw*.5);g.fill();
  g.fillStyle='#ffd870';g.fillRect(ix-iw*.12,iy-iw*.4,iw*.24,iw*.2);g.strokeStyle='#4a2a10';g.lineWidth=1.5;g.strokeRect(ix-iw*.12,iy-iw*.4,iw*.24,iw*.2);
  g.fillStyle='#5a3a2a';g.fillRect(ix+iw*.2,iy-iw*.95,iw*.12,iw*.3);
  // луг
  gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,'#9ad85a');gr.addColorStop(.45,'#6ab83a');gr.addColorStop(1,'#3a8a2a');g.fillStyle=gr;g.fillRect(0,hz,W,H-hz);
  g.fillStyle='rgba(255,255,200,.18)';g.beginPath();g.ellipse(W/2,hz+(H-hz)*.45,W*.6,(H-hz)*.3,0,0,TAU);g.fill();
  // травинки и цветочки по лугу
  for(let i=0;i<Math.round(W*H/2600);i++){const x=r()*W,y=hz+10*k+r()*(H-hz),s=(.5+(y-hz)/(H-hz))*k;g.strokeStyle=r()<.5?'rgba(40,110,30,.55)':'rgba(170,230,110,.55)';g.lineWidth=1.3*s;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+3*s,y-6*s,x+(r()-.5)*6*s,y-11*s);g.stroke();
    if(r()<.08){g.fillStyle=['#fff','#ffe066','#ff9ad0','#a0c8ff'][Math.floor(r()*4)];g.beginPath();g.arc(x,y-11*s,2.2*s,0,TAU);g.fill();}}
  // кусты, пни, грибы по краям
  const D=[['d_bush',.06,.36,70],['d_pine',.95,.33,80],['d_stump',.92,.62,52],['d_shroom',.07,.66,40],['d_bush',.97,.8,64]];
  for(const [key,x,y,s] of D){if(st.wide&&x>.5&&x<.9)continue;put(g,key,st.wide?st.ox+st.SW*x:W*x,H*y,s*k*(st.wide?1.2:1));}
  return c;}
function trPatch(st,g,p,hov){const k=st.k,R=st.pr*p.s;g.save();g.fillStyle='rgba(30,60,20,.35)';g.beginPath();g.ellipse(p.x,p.y+R*.08,R*1.02,R*.34,0,0,TAU);g.fill();
  const gr=g.createRadialGradient(p.x,p.y-R*.2,R*.1,p.x,p.y,R);gr.addColorStop(0,'#6a4a2a');gr.addColorStop(1,'#3a2a14');g.fillStyle=gr;g.beginPath();g.ellipse(p.x,p.y,R*.86,R*.27,0,0,TAU);g.fill();
  if(hov){g.lineWidth=3*k;g.strokeStyle='rgba(255,240,170,.9)';g.beginPath();g.ellipse(p.x,p.y,R*.98,R*.33,0,0,TAU);g.stroke();}
  // травинки вокруг кочки
  g.strokeStyle='#4a9a2a';g.lineWidth=2*k*p.s;for(let i=0;i<9;i++){const a=i/8,x=p.x-R*.9+a*R*1.8,y=p.y+Math.sin(a*Math.PI)*R*.2;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+(a-.5)*8*k,y-R*.25,x+(a-.5)*14*k,y-R*(.32+.12*Math.sin(i*2.1)));g.stroke();}
  if(st.pc){Z.keycap(g,p.x+R*.82,p.y+R*.12,String(p.i+1),20*k*Math.max(.9,p.s));}
  g.restore();}
function trHerb(st,g,p){const h=p.h;if(!h)return;const k=st.k,R=st.pr*p.s,sz=R*2.05;let gs=1,a=1,dy=0,rot=Math.sin(st.t*2.2+h.ph)*.06;
  const grow=Math.min(1,h.t/.28);gs=st.calm?Z.ease(grow):Z.back(grow);
  if(h.gone){if(h.pick){a=0;}else if(h.bad){a=Math.max(0,1-h.gone/.5);gs*=1+h.gone*.6;}else{const q=Math.min(1,h.gone/.6);gs*=1-q*.5;a=1-q;rot+=q*.6;dy=q*R*.2;}}
  if(h.sh>0)rot+=Math.sin(h.sh*40)*.15;
  const left=h.life-h.t,warn=!h.gone&&left<.6;if(warn)a*=.65+.35*Math.abs(Math.sin(st.t*14));
  if(a<=0)return;g.save();g.globalAlpha=a;if(h.id==='bel'&&!h.gone)glowAt(g,'#9040c0',p.x,p.y-sz*.4,sz*.55,.35+.15*Math.sin(st.t*4+h.ph));
  g.translate(p.x,p.y+dy);g.rotate(rot);g.scale(gs,gs);put(g,'zba_h_'+h.id,0,-sz*.46,sz);
  // таймер увядания — тонкая дуга под травой
  if(!h.gone&&h.t>.28){const q=Math.max(0,left/h.life);g.lineWidth=3.5*k;g.strokeStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(0,-sz*.46,sz*.54,-Math.PI/2,-Math.PI/2+TAU);g.stroke();
    g.strokeStyle=q<.3?'#ff8a5a':'rgba(255,255,220,.85)';g.beginPath();g.arc(0,-sz*.46,sz*.54,-Math.PI/2,-Math.PI/2+TAU*q);g.stroke();}
  g.restore();}
function trRecipe(st,g,y){const k=st.k,W=st.W,w=Math.min(W-24*k,380*k),h=62*k,x=W/2-w/2;if(!st.rec)return;
  g.save();g.fillStyle='rgba(20,10,4,.3)';rr(g,x+2,y+4,w,h,12*k);g.fill();const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#fff6dc');gr.addColorStop(1,'#efd6a0');g.fillStyle=gr;rr(g,x,y,w,h,12*k);g.fill();
  g.lineWidth=2*k;g.strokeStyle='#a87a3a';g.stroke();for(const sx of[x,x+w]){g.fillStyle='#c89a5a';rr(g,sx-6*k,y-4*k,12*k,h+8*k,6*k);g.fill();g.strokeStyle='#7a4a1a';g.stroke();}
  const cw=(w-20*k)/3;st.rec.forEach((q,i)=>{const cx=x+10*k+cw*(i+.5),full=q.n>=q.need,s=1+q.fl*.25;g.save();g.translate(cx-cw*.2,y+h*.48);g.scale(s,s);if(full)glowAt(g,'#b0ff7a',0,0,h*.55,.6);put(g,'zba_h_'+q.id,0,0,h*.82);g.restore();
    text(g,full?'✓':q.n+'/'+q.need,cx+cw*.2,y+h*.4,(full?24:19)*k,{c:full?'#4ab83a':'#3b2412',st:false,sh:false,w:900});
    text(g,hbName(q.id),cx+cw*.2,y+h*.78,10.5*k,{c:'#6a4a2a',st:false,sh:false,w:700,mw:cw*.55});});
  if(st.recWait>0){g.globalAlpha=Math.min(1,st.recWait*2);g.fillStyle='rgba(120,200,80,.85)';rr(g,x,y,w,h,12*k);g.fill();text(g,L('Зелье готово!','Potion ready!'),W/2,y+h/2,24*k,{c:'#fff',stc:'#2a6a1a'});}
  g.restore();}
function trBabka(st,g){const k=st.k,bs=st.bs,x=st.bx,y=st.by,bob=st.calm?0:Math.sin(st.t*2)*1.5*k,sh=st.shake>0?Math.sin(st.shake*50)*4*k:0;
  g.fillStyle='rgba(20,50,10,.35)';g.beginPath();g.ellipse(x,y+bs*.36,bs*.33,bs*.07,0,0,TAU);g.fill();put(g,'m_babka',x+sh,y+bob,bs);
  // котёл на треноге с огоньком
  const kx=st.kx,ky=st.ky,ks=st.ks;glowAt(g,'#ffa040',kx,ky+ks*.42,ks*.5,.6+.2*Math.sin(st.t*9));
  for(let i=0;i<3;i++){g.fillStyle=i%2?'#ffd040':'#ff7a20';g.beginPath();const fx=kx+(i-1)*ks*.12,fh=ks*(.2+.06*Math.sin(st.t*10+i*2));g.moveTo(fx-ks*.07,ky+ks*.46);g.quadraticCurveTo(fx,ky+ks*.46-fh*1.3,fx+ks*.07,ky+ks*.46);g.fill();}
  const s=1+st.kot*.12;put(g,'zba_kotel',kx,ky,ks*s);
  if(st.potT>0||st.kot>0){for(let i=0;i<3;i++){const q=(st.t*1.2+i/3)%1;g.fillStyle='rgba(180,255,160,'+(.5*(1-q))+')';g.beginPath();g.arc(kx+Math.sin(q*6+i)*ks*.15,ky-ks*.3-q*ks*.9,ks*.12*(1+q),0,TAU);g.fill();}}
  // реплика знахарки
  if(st.bub){const q=st.bub.t,a=Math.min(1,q/.15,(2.2-q)/.3);g.save();g.globalAlpha=Math.max(0,a);g.font=Z.font(15*k,800);const tw=Math.min(st.W*.6,g.measureText(st.bub.s).width+24*k),th=34*k,bx=Math.min(st.W-tw-8*k,x+bs*.05),by=y-bs*.7-th;
    g.fillStyle='#fffaf0';rr(g,bx,by,tw,th,12*k);g.fill();g.strokeStyle='#5a3a1a';g.lineWidth=2*k;g.stroke();g.beginPath();g.moveTo(bx+20*k,by+th);g.lineTo(bx+16*k,by+th+12*k);g.lineTo(bx+32*k,by+th);g.closePath();g.fillStyle='#fffaf0';g.fill();
    text(g,st.bub.s,bx+tw/2,by+th/2+1,15*k,{c:'#3b2412',st:false,sh:false,mw:tw-16*k});g.restore();}}
function trDraw(st,g,UI){const W=st.W,H=st.H,k=st.k;if(!st.bg)st.bg=trBg(st);g.save();if(st.shake>0&&!st.calm){const s=st.shake*8*k;g.translate((st.fr()-.5)*s,(st.fr()-.5)*s);}
  g.drawImage(st.bg,0,0,W,H);
  // солнечные пятна
  for(let i=0;i<3;i++){glowAt(g,'#fff6c0',W*(.2+i*.3)+Math.sin(st.t*.3+i)*20*k,H*(.45+i*.12),90*k,.12);}
  const pts=st.pa||[];for(const p of pts)trPatch(st,g,p,UI.ph==='play'&&st.hov===p.i);
  for(const p of pts.slice().sort((a,b)=>a.y-b.y))trHerb(st,g,p);
  for(const l of st.lab||[]){const q=l.t/.9;g.save();g.globalAlpha=q>.6?1-(q-.6)/.4:1;text(g,l.s,l.x,l.y-q*22*k,19*k,{c:l.c,w:900});g.restore();}
  trBabka(st,g);
  // трава летит в котёл
  for(const f of st.fly||[]){const q=Z.ease(f.t/f.d),x=f.x0+(st.kx-f.x0)*q,y=f.y0+(st.ky-st.ks*.3-f.y0)*q-Math.sin(q*Math.PI)*H*.12;put(g,'zba_h_'+f.id,x,y,st.pr*1.2*f.s*(1-q*.5),{rot:q*4});}
  if(st.tint>0){g.fillStyle='rgba(120,40,160,'+(st.tint*.22)+')';g.fillRect(0,0,W,H);}
  g.restore();
  if(UI.ph==='play'&&st.t<1.6){g.save();g.globalAlpha=Math.min(1,(1.6-st.t)*2);text(g,L('Рви траву по рецепту!','Pick herbs from the recipe!'),W/2,st.hz-26*k,22*k,{c:'#fff3c4',mw:W-30});g.restore();}}

Z.reg(G,{num:9,n:zabN('Сбор трав для зелья','Herbs for a Potion'),icon:'zba_h_rom',kind:'daily',en:true});
})();
