'use strict';
/* BGC: забава №14 «Утка, заяц, яйцо» (Забава недели). Основа — «Кощеева игла» Тридевятой обороны (mg-igla.js), переделано под Богатыря.
   «Игла — в яйце, яйцо — в утке, утка — в зайце, заяц — в сундуке…» 5 раундов: заяц → утка → яйцо → игла → смерть Кощеева.
   Предмет прыгает в средний сундук, сундуки медленно меняются местами (1-й раунд — 3 перестановки по 0,75 с, 5-й — 7 по 0,5 с;
   спокойный режим ×1,5 медленнее) — укажи сундук. Ставок нет, всё видно. Ступени: 3/5 — 1, 4/5 — 2, 5/5 — 3.
   «Помедленнее» (ролик, раз за игру, только после промаха) — оставшиеся раунды ×1,6 медленнее.
   5 побед подряд (4–5 из 5, без тренировок) → украшение Терема «Сундук Кощея» (счёт — в host.store().w).
   ПК: 1 2 3 или ← ↓ → (сундук слева/посередине/справа), мышь; Enter/пробел — «Начать». */
(function(){
art('zbc_zayac',40,g=>{ell(g,-8,-12,3,9,'#d8c8b8',{rot:-.25});ell(g,-2,-13,3,9.5,'#d8c8b8',{rot:.15});ell(g,-8,-12,1.4,6,'#f4b8c0',{rot:-.25,ol:false,flat:true});ell(g,-2,-13,1.4,6.5,'#f4b8c0',{rot:.15,ol:false,flat:true});
  ell(g,3,8,12,9,'#c8b8a8',{hl:.4});ell(g,14,10,3.4,3.4,'#fff',{lw:.6});ell(g,-5,0,8,7.5,'#d8c8b8',{hl:.45});ell(g,-10,2,2,1.5,'#f48aa0',{lw:.4});
  eye(g,-6,-2,2,{px:-.5});for(const x of[-3,6])ell(g,x,16,4,2.2,'#e8dcd0',{lw:.5});ln(g,[-11,3,-16,1],'rgba(60,40,30,.5)',.5);ln(g,[-11,4,-16,5],'rgba(60,40,30,.5)',.5);});
art('zbc_utka',40,g=>{ell(g,2,6,13,9,'#e8e0d0',{hl:.4});shp(g,'#d8d0c0',{},[-2,0,12,10],()=>{g.moveTo(-1,4);g.quadraticCurveTo(6,-1,12,4);g.quadraticCurveTo(7,10,-1,8);g.closePath();});
  ell(g,-8,-6,7,6.5,'#3a8a4a',{hl:.5});ell(g,-8,1,4,2,'#f4f0e0',{lw:.4});poly(g,[-14,-6,-21,-4,-14,-2],'#f2a83a',{lw:.6});eye(g,-9,-8,1.7,{px:-.4});
  ln(g,[13,4,17,1],'#8a8070',1.2);for(const x of[-2,6])ln(g,[x,14,x,18],'#f2a83a',1.6);});
art('zbc_igla',40,g=>{glow(g,0,0,16,'#ffe9a0');g.save();g.rotate(-.75);rrect(g,-1.6,-17,3.2,32,1.6);g.fillStyle=grad(g,0,0,10,'#d8e2f0',.6,-.3);g.fill();outline(g,'#c8d2e0',.8);
  poly(g,[-1.6,15,1.6,15,0,20],'#e8f0ff',{lw:.5});ell(g,0,-13,.8,2.6,'#2a2438',{ol:false,flat:true});g.restore();shine(g,-3,-4,1.5,4,.6);});
art('zbc_smert',40,g=>{glow(g,0,0,20,'#5cff9a','#e8fff0');g.save();g.rotate(-.75);rrect(g,-1.8,-18,3.6,34,1.8);g.fillStyle=grad(g,0,0,10,'#9affc0',.6,-.3);g.fill();outline(g,'#5ae08a',.9);
  poly(g,[-1.8,16,1.8,16,0,21],'#c8ffe0',{lw:.5});ell(g,0,-14,.9,2.8,'#1a3a24',{ol:false,flat:true});g.restore();
  for(const [x,y] of[[-9,-8],[8,9],[10,-10],[-8,10]]){ell(g,x,y,1.2,1.2,'#e8fff0',{ol:false,flat:true});}});
art('zbc_i14',40,g=>{// значок: сундук и яйцо с иглой
  rrect(g,-15,0,30,15,3);g.fillStyle=grad(g,0,7,16,'#8a4a22');g.fill();outline(g,'#8a4a22',1);for(const x of[-9,9]){rrect(g,x-2,0,4,15,1);g.fillStyle='#c89a3a';g.fill();}
  shp(g,'#a0582a',{hl:.45},[-16,-6,16,1],()=>{g.moveTo(-16,1);g.quadraticCurveTo(-16,-7,0,-7);g.quadraticCurveTo(16,-7,16,1);g.closePath();});
  g.save();g.translate(4,-12);g.scale(.62,.62);ART.egg.fn(g);g.restore();rrect(g,-2.5,-2,5,5,1);g.fillStyle='#f2c84a';g.fill();});
const kchestArt=g=>{// украшение Терема «Сундук Кощея»: кованый сундук с зелёным огоньком
  ell(g,0,18,24,5,'rgba(0,0,0,.2)',{ol:false,flat:true});rrect(g,-22,-2,44,20,3);g.fillStyle=grad(g,0,8,24,'#3a2a4a',.35,-.4);g.fill();outline(g,'#3a2a4a',1.4);
  for(const x of[-15,15]){rrect(g,x-3,-2,6,20,1.5);g.fillStyle=grad(g,x,8,8,'#c89a3a',.6);g.fill();outline(g,'#c89a3a',.8);}
  shp(g,'#4a3a5a',{hl:.45},[-23,-14,23,-1],()=>{g.moveTo(-23,-1);g.quadraticCurveTo(-23,-15,0,-15);g.quadraticCurveTo(23,-15,23,-1);g.closePath();});
  rrect(g,-4,-6,8,9,2);g.fillStyle=grad(g,0,-2,5,'#f2c84a',.6);g.fill();outline(g,'#f2c84a',.8);glow(g,0,-22,9,'#5cff9a');ell(g,0,-22,2.5,2.5,'#e8fff0',{ol:false,flat:true});};
if(typeof ZAB_DECO==='function')ZAB_DECO('zbc_kchest',{n:['Сундук Кощея','Koschei’s Chest'],art:kchestArt,at:[.8,.86,1]}); // i18n:ru — пара ru/en по договору ядра

const ITEMS=['zbc_zayac','zbc_utka','egg','zbc_igla','zbc_smert'];
const IT_N=()=>[L('заяц','the hare'),L('утка','the duck'),L('яйцо','the egg'),L('игла','the needle'),L('смерть Кощеева','Koschei’s death')];
const IT_W=()=>[L('Где заяц?','Where is the hare?'),L('Где утка?','Where is the duck?'),L('Где яйцо?','Where is the egg?'),L('Где игла?','Where is the needle?'),L('Где смерть Кощеева?','Where is Koschei’s death?')];
const SWAPS=[3,4,5,6,7],SDUR=[.75,.67,.6,.55,.5],WIN_N=5;
function igTier(s){return s>=5?3:s>=4?2:s>=3?1:0;}
function run(host,o){const cv=ZABK.canvas(host),g=cv.getContext('2d'),R=o.rnd,calm=o.calm,T=ZABK.text,pc=zabPC();let K=calm?1.5:1;
  let W=0,H=0,D=1,land=false,cs=80,ty=0,slotX=[],kx=0,ky=0,ks=0,bg=null,cx0=0;
  const ch=[0,1,2].map(i=>({slot:i,x:0,y:0,lid:0,glow:0,shk:0,prize:false})),P=[],pops=[];
  const st={r:0,score:0,ph:'intro',t:0,sw:[],swi:0,laugh:0,wink:0,res:[],slow:0,miss:0};
  function layout(){W=cv.W;H=cv.H;D=cv.D;land=W>H*1.08;
    cs=Math.min(land?W*.15:W*.26,H*(land?.22:.15),180);ty=land?H*.68:H*.7;cx0=land?W*.58:W/2;const gap=cs*1.25;slotX=[cx0-gap,cx0,cx0+gap];
    ks=land?Math.min(H*.55,W*.26):Math.min(H*.3,W*.62);kx=land?W*.17:W*.66;ky=land?H*.55:H*.41;bg=null;for(const c of ch){c.x=slotX[c.slot];c.y=ty;}}
  layout();host.onResize(layout);
  function mkBg(){const c=mkCanvas(W*D,H*D),b=c.getContext('2d');b.setTransform(D,0,0,D,0,0);b.lineJoin='round';
    // подземелье Кощея: камень с лиловым отсветом
    let q=b.createLinearGradient(0,0,0,H);q.addColorStop(0,'#1e1430');q.addColorStop(.6,'#2e2040');q.addColorStop(1,'#140e1e');b.fillStyle=q;b.fillRect(0,0,W,H);
    const r=mulberry(12),bh=Math.max(22,H/24),bw2=bh*2.2;for(let y=0,row=0;y<ty;y+=bh,row++)for(let x=(row%2?-bw2/2:0);x<W;x+=bw2){const l=r()*.08;
      b.fillStyle='rgba('+(70+l*300|0)+','+(56+l*200|0)+','+(96+l*300|0)+',.35)';rrect(b,x+2,y+2,bw2-4,bh-4,4);b.fill();b.strokeStyle='rgba(10,6,16,.5)';b.lineWidth=1.5;b.stroke();}
    // арка-окно с луной
    const wx=land?W*.86:W*.2,wy=land?H*.1:H*.19,ww=land?W*.11:W*.26,wh=ww*1.3;b.save();b.beginPath();b.moveTo(wx-ww/2,wy+wh);b.lineTo(wx-ww/2,wy+ww/2);b.arc(wx,wy+ww/2,ww/2,Math.PI,0);b.lineTo(wx+ww/2,wy+wh);b.closePath();
    q=b.createLinearGradient(0,wy,0,wy+wh);q.addColorStop(0,'#1a2a6a');q.addColorStop(1,'#4a3a8a');b.fillStyle=q;b.fill();b.clip();b.fillStyle='#fff6d8';b.beginPath();b.arc(wx+ww*.15,wy+ww*.45,ww*.18,0,TAU);b.fill();
    b.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<10;i++){b.beginPath();b.arc(wx-ww/2+r()*ww,wy+r()*wh,.8+r(),0,TAU);b.fill();}b.restore();
    b.strokeStyle='#4a3a5a';b.lineWidth=Math.max(5,ww*.08);b.beginPath();b.moveTo(wx-ww/2,wy+wh);b.lineTo(wx-ww/2,wy+ww/2);b.arc(wx,wy+ww/2,ww/2,Math.PI,0);b.lineTo(wx+ww/2,wy+wh);b.stroke();
    b.strokeStyle='#2a2030';b.lineWidth=Math.max(2,ww*.035);for(let i=1;i<4;i++){const x=wx-ww/2+ww*i/4;b.beginPath();b.moveTo(x,wy);b.lineTo(x,wy+wh);b.stroke();}
    // цепи на стене
    for(const fx of land?[.36,.97]:[.04,.96]){const x=W*fx;for(let y=0;y<ty*.55;y+=12){b.strokeStyle='#6a6478';b.lineWidth=2.4;b.beginPath();b.ellipse(x,y,3.5,6,(y/12)%2?0:Math.PI/2,0,TAU);b.stroke();}}
    // резной пояс
    b.fillStyle='#4a1a2a';b.fillRect(0,ty-cs*1.3,W,cs*.12);b.fillStyle='#c89a3a';for(let x=cs*.1;x<W;x+=cs*.3){b.beginPath();b.moveTo(x,ty-cs*1.3);b.lineTo(x+cs*.075,ty-cs*1.24);b.lineTo(x,ty-cs*1.18);b.lineTo(x-cs*.075,ty-cs*1.24);b.closePath();b.fill();}
    // стол и ковёр
    const tt=ty+cs*.36;q=b.createLinearGradient(0,tt,0,H);q.addColorStop(0,'#6a4024');q.addColorStop(.08,'#4a2a14');q.addColorStop(1,'#1e120a');b.fillStyle=q;b.fillRect(0,tt,W,H-tt);
    b.fillStyle='#8a5a30';b.fillRect(0,tt,W,Math.max(4,cs*.06));
    const kw=Math.min(W*.92,cs*4.6);q=b.createLinearGradient(0,tt+cs*.18,0,H);q.addColorStop(0,'#7a1a2a');q.addColorStop(1,'#4a0a16');b.fillStyle=q;b.fillRect(cx0-kw/2,tt+cs*.14,kw,H);
    b.strokeStyle='#e6b53a';b.lineWidth=2;b.strokeRect(cx0-kw/2+6,tt+cs*.2,kw-12,H);b.fillStyle='#e6b53a';for(let x=cx0-kw/2+14;x<cx0+kw/2-10;x+=16){b.beginPath();b.arc(x,tt+cs*.28,2.2,0,TAU);b.fill();}
    b.strokeStyle='rgba(230,181,58,.5)';b.lineWidth=2;const y0=tt+cs*1.25;for(let row=0;y0+row*cs*.9<H;row++){const y=y0+row*cs*.9;for(let i=-3;i<=3;i++){const x=cx0+i*cs*.9+(row%2?cs*.45:0);if(Math.abs(x-cx0)>kw/2-cs*.3)continue;
      b.beginPath();b.moveTo(x,y-cs*.3);b.lineTo(x+cs*.3,y);b.lineTo(x,y+cs*.3);b.lineTo(x-cs*.3,y);b.closePath();b.stroke();}}
    bg=c;}
  function chest(c,item){const s=cs,x=c.x+(c.shk>0?Math.sin(c.shk*50)*s*.03:0),y=c.y;g.save();g.translate(x,y);
    g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(0,s*.36,s*.52,s*.1,0,0,TAU);g.fill();
    if(c.glow>0){g.globalAlpha=Math.min(1,c.glow);g.drawImage(glowSpr('#ffe27a'),-s*.9,-s*.9,s*1.8,s*1.6);g.globalAlpha=1;}
    rrect(g,-s*.46,-s*.08,s*.92,s*.44,s*.05);g.fillStyle=grad(g,0,s*.1,s*.5,'#8a4a22');g.fill();outline(g,'#8a4a22',2);
    for(const bx of[-.32,.32]){rrect(g,s*bx-s*.045,-s*.08,s*.09,s*.44,2);g.fillStyle=grad(g,s*bx,s*.1,s*.2,'#c89a3a',.6);g.fill();outline(g,'#c89a3a',1);}
    for(const yy of[0,.26])ln(g,[-s*.44,s*yy,s*.44,s*yy],'rgba(40,20,10,.35)',1);
    if(item&&c.lid>.3){const k=Math.min(1,(c.lid-.3)/.5);g.save();g.beginPath();g.rect(-s*.6,-s*1.4,s*1.2,s*1.36);g.clip();ZABK.put(g,item.key,0,-s*.05-k*s*.5*item.up,s*.6,D,{});g.restore();}
    const a=c.lid*1.9;g.save();g.translate(0,-s*.08);g.scale(1,Math.cos(Math.min(a,1.55)));g.translate(0,s*.08);
    if(a<1.57){shp(g,'#a0582a',{hl:.45},[-s*.48,-s*.36,s*.48,-s*.06],()=>{g.moveTo(-s*.48,-s*.06);g.quadraticCurveTo(-s*.48,-s*.36,0,-s*.37);g.quadraticCurveTo(s*.48,-s*.36,s*.48,-s*.06);g.closePath();});
      for(const bx of[-.32,.32]){g.beginPath();g.moveTo(s*bx-s*.045,-s*.06);g.lineTo(s*bx-s*.045,-s*.3);g.lineTo(s*bx+s*.045,-s*.3);g.lineTo(s*bx+s*.045,-s*.06);g.fillStyle='#c89a3a';g.fill();}
      rrect(g,-s*.07,-s*.12,s*.14,s*.14,s*.03);g.fillStyle=grad(g,0,-s*.05,s*.1,'#f2c84a',.6);g.fill();outline(g,'#f2c84a',1);ell(g,0,-s*.04,s*.018,s*.03,'#3a2410',{ol:false,flat:true});
      shine(g,-s*.22,-s*.26,s*.1,s*.03,.35);}
    g.restore();if(c.lid>=.8){shp(g,'#5a2a14',{},[-s*.48,-s*.2,s*.48,-s*.06],()=>{g.moveTo(-s*.48,-s*.08);g.quadraticCurveTo(0,-s*.2,s*.48,-s*.08);g.closePath();});}
    g.restore();}
  function startRound(){st.ph='show';st.t=0;for(const c of ch){c.lid=0;c.glow=0;}
    const n=SWAPS[st.r]+Math.min(2,Math.floor((o.lvl||0)/8)),sw=[];let last=-1;for(let i=0;i<n;i++){let a,b;do{a=Math.floor(R()*3);b=(a+1+Math.floor(R()*2))%3;}while(a+b*3===last);last=a+b*3;sw.push([a,b]);}
    st.sw=sw;st.swi=0;st.dur=SDUR[st.r]*K;}
  const slotOf=i=>ch.find(c=>c.slot===i);
  function start(){if(st.ph!=='intro')return;st.ph='pre';st.t=0;try{host.snd.click();}catch(_){}}
  const btnGo={x:0,y:0,w:0,h:0,t:L('Начать','Start')};
  ZABK.tap(cv,host,(x,y,e)=>{e.preventDefault();if(st.ph==='intro'){start();return;}if(st.ph!=='pick')return;
    for(let i=0;i<3;i++){const c=ch[i];if(Math.abs(x-c.x)<cs*.6&&y>c.y-cs*.7&&y<c.y+cs*.55){choose(i);return;}}});
  if(pc)cv.style.cursor='pointer';
  zabKeys(host,k=>{if(st.ph==='intro'){if(k==='Enter'||k===' '){start();return true;}return false;}
    if(st.ph!=='pick')return false;const m={'1':0,'2':1,'3':2,ArrowLeft:0,ArrowDown:1,ArrowUp:1,ArrowRight:2}[k];if(m==null)return false;const i=ch.findIndex(c=>c.slot===m);if(i>=0)choose(i);return true;});
  function choose(i){st.pick=i;st.ph='open';st.t=0;st.said=0;const ok=ch[i].prize;try{host.snd.click();}catch(_){}st.res.push(ok?1:0);if(ok)st.score++;else st.miss++;}
  // «Помедленнее» за ролик: только после промаха, раз за игру, не в тренировке
  let sb=null;function slowBtn(on){if(on&&!sb&&!st.slow&&st.miss>0&&st.r<4&&!o.train&&host.adOk()){sb=document.createElement('button');sb.className='btn ad';
      sb.style.cssText='position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 14px);width:auto;max-width:92%;z-index:3';
      sb.textContent=L('🎬 Помедленнее за рекламу','🎬 Slower for an ad');host.el.appendChild(sb);try{host.offer&&host.offer();}catch(_){}
      sb.onclick=()=>{sb.disabled=true;host.hold=true;host.ad('slow').then(ok=>{host.hold=false;sb.disabled=false;if(ok){st.slow=1;K*=1.6;sb.remove();sb=null;pops.push({x:cx0,y:ty-cs*1.1,s:L('Кощей зевает — медленнее!','Koschei yawns — slower!'),t:0,c:'#9adcff'});}});};}
    if(sb)sb.style.display=on&&!st.slow?'':'none';}
  function step(dt){st.t+=dt;if(st.laugh>0)st.laugh-=dt;st.wink+=dt;for(const c of ch){if(c.shk>0)c.shk-=dt;if(c.glow>0&&st.ph!=='pick')c.glow=Math.max(0,c.glow-dt*1.5);}
    for(const q of pops)q.t+=dt;for(let i=pops.length-1;i>=0;i--)if(pops[i].t>1.3)pops.splice(i,1);
    if(st.ph==='intro')return;
    if(st.ph==='pre'){if(st.t>1.2){for(const c of ch)c.prize=c.slot===1;startRound();}return;}
    if(st.ph==='show'){slowBtn(false);const c=slotOf(1),t=st.t/K;c.lid=t<.35?t/.35:t<1.1?1:Math.max(0,1-(t-1.1)/.25);st.itemUp=t<.35?0:t<.75?(t-.35)/.4:Math.max(0,1-(t-.75)/.35);
      if(t>=1.45){st.ph='shuffle';st.t=0;st.swi=0;}return;}
    if(st.ph==='shuffle'){const d=st.dur,i=Math.floor(st.t/d);if(i>=st.sw.length){if(st.swi<st.sw.length){const [a,b]=st.sw[st.swi],A=slotOf(a),B=slotOf(b);A.slot=b;B.slot=a;st.swi=st.sw.length;}for(const c of ch){c.x=slotX[c.slot];c.y=ty;}st.ph='pick';st.t=0;slowBtn(true);return;}
      if(i!==st.swi){const [a,b]=st.sw[st.swi],A=slotOf(a),B=slotOf(b);A.slot=b;B.slot=a;st.swi=i;try{host.snd.tick();}catch(_){}}
      const [a,b]=st.sw[i],A=slotOf(a),B=slotOf(b),k=ZABK.ease.inout((st.t-i*d)/d),dx=slotX[b]-slotX[a],arc=cs*.42*Math.sin(k*Math.PI);
      for(const c of ch){c.x=slotX[c.slot];c.y=ty;}A.x=slotX[a]+dx*k;A.y=ty-arc;B.x=slotX[b]-dx*k;B.y=ty+arc*.35;return;}
    if(st.ph==='pick')return;
    if(st.ph==='open'){slowBtn(false);const c=ch[st.pick],t=st.t;c.lid=Math.min(1,t/.3);
      if(t>.3&&!st.said){st.said=1;if(c.prize){pops.push({x:c.x,y:c.y-cs*.95,s:L('Нашёл!','Found it!'),t:0,c:'#ffe27a'});ZABK.burst(P,c.x,c.y-cs*.4,{n:calm?6:22,col:'#ffe27a',sp:260,k:'star',s:6});try{host.snd.gem();}catch(_){}}
        else{st.laugh=1.6;pops.push({x:kx,y:ky-ks*.62,s:L('Ха-ха-ха!','Ha-ha-ha!'),t:0,c:'#c8ffb0'});c.shk=.3;try{host.snd.lose();}catch(_){}}}
      if(!c.prize&&t>.7){const pc2=ch.find(x=>x.prize);pc2.lid=Math.min(1,(t-.7)/.3);pc2.glow=1;}
      if(t>(calm?2.5:2)){for(const x of ch)x.lid=0;st.r++;if(st.r>=5){st.ph='end';st.t=0;try{st.score>=5?host.snd.win():st.score>=3?host.snd.level():host.snd.lose();}catch(_){}}else{st.ph='close';st.t=0;}}return;}
    if(st.ph==='close'){if(st.t>.35){for(const c of ch)c.prize=c.slot===1;startRound();}return;}
    if(st.ph==='end'&&st.t>2.4&&!st.sent){st.sent=1;finish();}}
  function finish(){const tier=igTier(st.score),ex={msg:L('Угадано '+st.score+' из 5','Found '+st.score+' of 5')};
    if(!o.train){try{const s=host.store();s.w=tier>=2?(s.w|0)+1:0;const z=typeof ZB==='function'?ZB():null;
      if(s.w>=WIN_N&&!(z&&z.u&&z.u.zbc_kchest)){ex.deco='zbc_kchest';s.w=0;}else if(tier>=2)ex.msg+=L(' · побед подряд: '+s.w+' из '+WIN_N,' · wins in a row: '+s.w+' of '+WIN_N);host.touch();}catch(e){}}
    host.done({score:st.score,tier,extra:ex});}
  function draw(){g.setTransform(D,0,0,D,0,0);g.lineJoin='round';g.lineCap='round';if(!bg)mkBg();g.drawImage(bg,0,0,W,H);
    for(const [fx,fy] of(land?[[.36,.5],[.96,.5]]:[[.07,.5],[.93,.5]])){const x=W*fx,y=ty-cs*.05,fl=1+(calm?0:Math.sin(st.wink*9+fx*10)*.08);g.globalAlpha=.75;g.drawImage(glowSpr('#ffb43a'),x-cs*.75*fl,y-cs*1.1*fl,cs*1.5*fl,cs*1.5*fl);g.globalAlpha=1;
      rrect(g,x-cs*.05,y-cs*.3,cs*.1,cs*.34,3);g.fillStyle='#f4ecd8';g.fill();outline(g,'#f4ecd8',1);ell(g,x,y-cs*.36,cs*.035*fl,cs*.07*fl,'#ffd24a',{ol:false,flat:true});ell(g,x,y+cs*.05,cs*.12,cs*.04,'#c89a3a',{lw:1});}
    const lb=st.laugh>0?Math.sin(st.laugh*30)*ks*.02:0,br=calm?0:Math.sin(st.wink*2)*.015;
    g.globalAlpha=.55;g.drawImage(glowSpr('#5cff9a'),kx-ks*.6,ky-ks*.7,ks*1.2,ks*1.2);g.globalAlpha=1;
    ZABK.put(g,'kosh',kx+lb,ky,ks,D,{sy:1+br,sx:1-br*.5,rot:st.laugh>0?Math.sin(st.laugh*18)*.06:0});
    const order=ch.slice().sort((a,b)=>a.y-b.y);for(const c of order){const item=c.prize&&(st.ph==='show'||st.ph==='open'||st.ph==='end')?{key:ITEMS[Math.min(4,st.r)],up:st.ph==='show'?(st.itemUp||0)+.4:1}:null;chest(c,item);}
    if(pc&&st.ph==='pick')for(let i=0;i<3;i++)zabKeycap(g,slotX[i],ty+cs*.56,String(i+1),Math.max(24,Math.min(32,cs*.22)));
    ZABK.parts(g,P,lastDt);
    for(const q of pops){const k=q.t/1.3;g.globalAlpha=1-Math.max(0,k-.6)*2.5;T(g,q.s,q.x,q.y-k*30,Math.min(32,cs*.26),{col:q.c,mw:W-20});}g.globalAlpha=1;
    if(st.ph==='intro')intro();else hud();}
  function hud(){const fs=Math.min(19,W*.045),top=10;
    const parts=[L('Игла — в яйце,','The needle’s in the egg,'),L('яйцо — в утке,','the egg’s in the duck,'),L('утка — в зайце,','the duck’s in the hare,'),L('заяц — в сундуке…','the hare’s in the chest…')];
    const bw=Math.min(W-84,560),bx=land?cx0-bw/2:12,bh=land?50:84;rrect(g,bx,top,bw,bh,16);g.fillStyle='rgba(253,240,207,.95)';g.fill();g.strokeStyle='#3b2412';g.lineWidth=2.5;g.stroke();
    const lines=land?[parts.join(' ')]:[parts[0]+' '+parts[1],parts[2]+' '+parts[3]];const f2=land?Math.min(fs,bw/36):fs;lines.forEach((l,i)=>T(g,l,bx+bw/2,top+bh/(lines.length+1)*(i+1),f2,{ol:false,col:'#5a2a14',w:700,mw:bw-20}));
    const ry=top+bh+30,rs=Math.min(42,W*.095);for(let i=0;i<5;i++){const x=(land?cx0:W/2)+(i-2)*rs*1.25;g.globalAlpha=i<=st.r||st.ph==='end'?1:.4;
      rrect(g,x-rs/2,ry-rs/2,rs,rs,rs*.3);g.fillStyle=st.res[i]===1?'#eaf7d8':st.res[i]===0?'#ffe6dc':'#fdf0cf';g.fill();g.strokeStyle=i===st.r&&st.ph!=='end'?'#e8433a':'#6a4222';g.lineWidth=i===st.r?3:2;g.stroke();
      ZABK.put(g,ITEMS[i],x,ry,rs*.76,D,{});g.globalAlpha=1;}
    let s='';if(st.ph==='pre')s=L('Кощей прячет свою смерть. Следи за сундуком!','Koschei hides his death. Watch the chest!');else if(st.ph==='show')s=L('Смотри: ','Look: ')+IT_N()[st.r]+L(' — в сундук!',' goes into the chest!');
    else if(st.ph==='shuffle')s=L('Следи…','Watch…');else if(st.ph==='pick')s=IT_W()[st.r]+(pc?L(' Щёлкни сундук или жми 1 2 3',' Click a chest or press 1 2 3'):L(' Тапни сундук',' Tap a chest'));else if(st.ph==='end')s=st.score>=5?L('Нашёл смерть Кощееву — 5 из 5!','You found Koschei’s death — 5 of 5!'):L('Угадано '+st.score+' из 5','Found '+st.score+' of 5');
    if(s){const by=ty+cs*(pc&&st.ph==='pick'?1.05:.95),f3=Math.min(22,W*.05);g.font=ZABK.font(f3,800);const tw=Math.min(W-20,g.measureText(s).width+40);rrect(g,(land?cx0:W/2)-tw/2,by-24,tw,48,18);g.fillStyle='rgba(30,16,40,.85)';g.fill();g.strokeStyle='#e6b53a';g.lineWidth=2;g.stroke();
      T(g,s,land?cx0:W/2,by,f3,{col:st.ph==='pick'?'#ffe27a':'#fff6dc',mw:tw-24});}}
  function intro(){g.fillStyle='rgba(10,6,20,.55)';g.fillRect(0,0,W,H);const pw=Math.min(W-28,460);
    const lines=[[L('Кощей прячет свою смерть: заяц, утка, яйцо, игла.','Koschei hides his death: hare, duck, egg, needle.'),0],[L('Предмет ложится в сундук, сундуки меняются местами.','The item goes into a chest, the chests swap places.'),0],
      [pc?L('Следи глазами и щёлкни сундук или жми','Follow it and click the chest or press'):L('Следи глазами и тапни нужный сундук.','Follow it with your eyes and tap the chest.'),pc?1:0],[L('5 раундов, без спешки — всё видно.','5 rounds, no rush — everything is in sight.'),0]];
    const fs=Math.min(19,pw*.045),wl=lines.map(l=>ZABK.wrap(g,l[0],fs,pw-(l[1]?150:50),700)),lh=fs*1.3,ph=86+wl.reduce((a,b)=>a+b.length,0)*lh+lines.length*8+110,px0=W/2-pw/2,py0=Math.max(70,H/2-ph/2);
    rrect(g,px0,py0,pw,ph,20);const q=g.createLinearGradient(0,py0,0,py0+ph);q.addColorStop(0,'#fdf0cf');q.addColorStop(1,'#ecd39c');g.fillStyle=q;g.fill();g.strokeStyle='#6e431f';g.lineWidth=4;g.stroke();
    rrect(g,px0+pw*.12,py0-18,pw*.76,44,12);g.fillStyle='#b8322a';g.fill();g.strokeStyle='#5a1410';g.lineWidth=3;g.stroke();T(g,L('Утка, заяц, яйцо','Duck, Hare, Egg'),W/2,py0+4,Math.min(24,pw*.058),{mw:pw*.7});
    let y=py0+48;['zbc_zayac','zbc_utka','egg','zbc_igla'].forEach((k,i)=>ZABK.put(g,k,px0+pw*(.2+i*.2),y+6,44,D,{}));y+=46;
    wl.forEach((ls,i)=>{g.fillStyle='#b8322a';g.beginPath();g.arc(px0+26,y+lh*.5,4,0,TAU);g.fill();ls.forEach(l=>{T(g,l,px0+38,y+lh*.5,fs,{ol:false,col:'#3b2412',w:700,al:'left'});y+=lh;});
      if(lines[i][1]){for(let j=0;j<3;j++)zabKeycap(g,px0+pw-96+j*32,y-lh*.5,String(j+1),fs*1.3);}y+=8;});
    btnGo.w=Math.min(240,pw*.62);btnGo.h=58;btnGo.x=W/2-btnGo.w/2;btnGo.y=py0+ph-btnGo.h-(pc?42:22);ZABK.btn(g,btnGo,24);
    if(pc){zabKeycap(g,W/2-62,py0+ph-22,'Enter',22);T(g,L('или','or'),W/2-12,py0+ph-22,14,{ol:false,col:'#6a4a2a',w:700});zabKeycap(g,W/2+44,py0+ph-22,L('пробел','space'),22);}}
  let lastDt=0;ZABK.loop(host,dt=>{lastDt=dt;if(dt>0)step(dt);draw();});
  window.__zbc={st:()=>st,start,auto:()=>{if(st.ph==='pick'){const i=ch.findIndex(c=>c.prize);choose(R()<.75?i:(i+1)%3);}}};host.onQuit(()=>{delete window.__zbc;if(sb)sb.remove();});}
function sim(o,k){const R=mulberry(o.seed^0x51ed);let s=0;for(let r=0;r<5;r++)if(R()<Math.min(.98,.42+k*.6-r*.05))s++;return {score:s,tier:igTier(s)};}
ZAB_REG({id:'igla',num:14,n:zabN('Утка, заяц, яйцо','Duck, Hare, Egg'),icon:'zbc_i14',kind:'week',run,sim});
})();
