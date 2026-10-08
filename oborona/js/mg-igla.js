'use strict';
/* OB:MG0 мини-игра №5 «Кощеева игла» (напёрстки). «Игла — в яйце, яйцо — в утке, утка — в зайце, заяц — в сундуке…»
   5 раундов: заяц → утка → яйцо → игла → смерть Кощеева. Предмет прыгает в сундук, сундуки тасуются (1-й раунд — 3 перестановки по 0,7 с,
   5-й — 7 по 0,45 с; спокойный режим ×1,5 медленнее). Тапни сундук. Ошибся — Кощей хохочет, игра идёт дальше. Ступени: 3/5 — 1, 4/5 — 2, 5/5 — 3.
   «Подглядеть» (ролик, раз за игру) — нужный сундук светится. Без реакции — только внимание. */
art('mg_zayac',40,g=>{ell(g,-8,-12,3,9,'#d8c8b8',{rot:-.25});ell(g,-2,-13,3,9.5,'#d8c8b8',{rot:.15});ell(g,-8,-12,1.4,6,'#f4b8c0',{rot:-.25,ol:false,flat:true});ell(g,-2,-13,1.4,6.5,'#f4b8c0',{rot:.15,ol:false,flat:true});
  ell(g,3,8,12,9,'#c8b8a8',{hl:.4});ell(g,14,10,3.4,3.4,'#fff',{lw:.6});ell(g,-5,0,8,7.5,'#d8c8b8',{hl:.45});ell(g,-10,2,2,1.5,'#f48aa0',{lw:.4});
  eye(g,-6,-2,2,{px:-.5});for(const x of[-3,6])ell(g,x,16,4,2.2,'#e8dcd0',{lw:.5});ln(g,[-11,3,-16,1],'rgba(60,40,30,.5)',.5);ln(g,[-11,4,-16,5],'rgba(60,40,30,.5)',.5);});
art('mg_utka',40,g=>{ell(g,2,6,13,9,'#e8e0d0',{hl:.4});shp(g,'#d8d0c0',{},[-2,0,12,10],()=>{g.moveTo(-1,4);g.quadraticCurveTo(6,-1,12,4);g.quadraticCurveTo(7,10,-1,8);g.closePath();});
  ell(g,-8,-6,7,6.5,'#3a8a4a',{hl:.5});ell(g,-8,1,4,2,'#f4f0e0',{lw:.4});poly(g,[-14,-6,-21,-4,-14,-2],'#f2a83a',{lw:.6});eye(g,-9,-8,1.7,{px:-.4});
  ln(g,[13,4,17,1],'#8a8070',1.2);for(const x of[-2,6])ln(g,[x,14,x,18],'#f2a83a',1.6);});

(function(){
const ITEMS=['mg_zayac','mg_utka','egg','trf_needle','trf_needle'];
const IT_N=[['заяц','the hare'],['утка','the duck'],['яйцо','the egg'],['игла','the needle'],['смерть Кощеева','Koschei’s death']];
const IT_W=[['Где заяц?','Where is the hare?'],['Где утка?','Where is the duck?'],['Где яйцо?','Where is the egg?'],['Где игла?','Where is the needle?'],['Где смерть Кощеева?','Where is Koschei’s death?']];
const SWAPS=[3,4,5,6,7],SDUR=[.7,.62,.55,.5,.45];
function igTier(s){return s>=5?3:s>=4?2:s>=3?1:0;}
function run(host,o){const cv=MGK.canvas(host),g=cv.getContext('2d'),R=o.rnd,calm=o.calm,K=calm?1.5:1;
  let W=0,H=0,D=1,land=false,cs=80,ty=0,slotX=[],kx=0,ky=0,ks=0,bg=null;
  const ch=[0,1,2].map(i=>({slot:i,x:0,y:0,lid:0,glow:0,shk:0})),P=[],pops=[];
  const st={r:0,score:0,ph:'intro',t:0,sw:[],swi:0,item:1,pick:-1,peek:0,peekUsed:0,laugh:0,wink:0,over:0,res:[]};
  function layout(){W=cv.W;H=cv.H;D=cv.D;land=W>H*1.08;
    cs=Math.min(land?W*.17:W*.25,H*(land?.24:.15),190);ty=land?H*.66:H*.64;const gap=cs*1.22,cx=land?W*.56:W/2;slotX=[cx-gap,cx,cx+gap];
    ks=land?Math.min(H*.5,W*.24):Math.min(H*.3,W*.6);kx=land?W*.16:W*.62;ky=land?H*.58:H*.36;bg=null;for(const c of ch){c.x=slotX[c.slot];c.y=ty;}}
  layout();host.onResize(layout);
  function mkBg(){const c=mkCanvas(W*D,H*D),b=c.getContext('2d');b.setTransform(D,0,0,D,0,0);
    // стены терема: тёмные доски с лиловым отсветом
    let q=b.createLinearGradient(0,0,0,H);q.addColorStop(0,'#2a1a3a');q.addColorStop(.6,'#3a2440');q.addColorStop(1,'#1e1424');b.fillStyle=q;b.fillRect(0,0,W,H);
    const pw=Math.max(34,W/12);for(let x=0;x<W;x+=pw){q=b.createLinearGradient(x,0,x+pw,0);q.addColorStop(0,'rgba(255,255,255,.04)');q.addColorStop(1,'rgba(0,0,0,.18)');b.fillStyle=q;b.fillRect(x,0,pw-2,ty);b.fillStyle='rgba(0,0,0,.35)';b.fillRect(x+pw-2,0,2,ty);}
    // окно-арка с луной
    const wx=land?W*.82:W*.22,wy=land?H*.12:H*.06,ww=land?W*.12:W*.26,wh=ww*1.3;b.save();b.beginPath();b.moveTo(wx-ww/2,wy+wh);b.lineTo(wx-ww/2,wy+ww/2);b.arc(wx,wy+ww/2,ww/2,Math.PI,0);b.lineTo(wx+ww/2,wy+wh);b.closePath();
    q=b.createLinearGradient(0,wy,0,wy+wh);q.addColorStop(0,'#1a2a6a');q.addColorStop(1,'#4a3a8a');b.fillStyle=q;b.fill();b.clip();b.fillStyle='#fff6d8';b.beginPath();b.arc(wx+ww*.15,wy+ww*.45,ww*.18,0,TAU);b.fill();
    b.fillStyle='rgba(255,255,255,.8)';const r=mulberry(4);for(let i=0;i<10;i++){b.beginPath();b.arc(wx-ww/2+r()*ww,wy+r()*wh,.8+r(),0,TAU);b.fill();}b.restore();
    b.strokeStyle='#6a4a2a';b.lineWidth=Math.max(4,ww*.06);b.beginPath();b.moveTo(wx-ww/2,wy+wh);b.lineTo(wx-ww/2,wy+ww/2);b.arc(wx,wy+ww/2,ww/2,Math.PI,0);b.lineTo(wx+ww/2,wy+wh);b.closePath();b.stroke();
    b.lineWidth=Math.max(2,ww*.03);b.beginPath();b.moveTo(wx,wy);b.lineTo(wx,wy+wh);b.moveTo(wx-ww/2,wy+wh*.55);b.lineTo(wx+ww/2,wy+wh*.55);b.stroke();
    // резной пояс-орнамент
    b.fillStyle='#5a2a2a';b.fillRect(0,ty-cs*1.25,W,cs*.12);b.fillStyle='#c89a3a';for(let x=cs*.1;x<W;x+=cs*.3){b.beginPath();b.moveTo(x,ty-cs*1.25);b.lineTo(x+cs*.075,ty-cs*1.19);b.lineTo(x,ty-cs*1.13);b.lineTo(x-cs*.075,ty-cs*1.19);b.closePath();b.fill();}
    // стол — дубовая столешница с ковром
    const tt=ty+cs*.36;q=b.createLinearGradient(0,tt,0,H);q.addColorStop(0,'#7a4a24');q.addColorStop(.08,'#5a3418');q.addColorStop(1,'#2a1a0c');b.fillStyle=q;b.fillRect(0,tt,W,H-tt);
    b.fillStyle='#9a6234';b.fillRect(0,tt,W,Math.max(4,cs*.06));
    q=b.createLinearGradient(0,tt+cs*.18,0,H);q.addColorStop(0,'#8a1e2a');q.addColorStop(1,'#5a0e1a');b.fillStyle=q;const kw=Math.min(W*.9,cs*4.6);b.fillRect(W*(land?.56:.5)-kw/2,tt+cs*.14,kw,H);
    b.strokeStyle='#e6b53a';b.lineWidth=2;b.strokeRect(W*(land?.56:.5)-kw/2+6,tt+cs*.2,kw-12,H);b.fillStyle='#e6b53a';for(let x=W*(land?.56:.5)-kw/2+14;x<W*(land?.56:.5)+kw/2-10;x+=16){b.beginPath();b.arc(x,tt+cs*.28,2.2,0,TAU);b.fill();}
    // узор ковра: золотые ромбы-обереги
    {const cx=W*(land?.56:.5),y0=tt+cs*1.25;b.strokeStyle='rgba(230,181,58,.55)';b.lineWidth=2;for(let row=0;y0+row*cs*.9<H;row++){const y=y0+row*cs*.9;for(let i=-3;i<=3;i++){const x=cx+i*cs*.9+(row%2?cs*.45:0);if(Math.abs(x-cx)>kw/2-cs*.3)continue;
      b.beginPath();b.moveTo(x,y-cs*.3);b.lineTo(x+cs*.3,y);b.lineTo(x,y+cs*.3);b.lineTo(x-cs*.3,y);b.closePath();b.stroke();b.fillStyle='rgba(230,181,58,.35)';b.beginPath();b.arc(x,y,cs*.06,0,TAU);b.fill();}}}
    bg=c;}
  // сундук: кованый, с крышкой, открывается
  function chest(c,item){const s=cs,x=c.x+(c.shk>0?Math.sin(c.shk*50)*s*.03:0),y=c.y;g.save();g.translate(x,y);
    g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,s*.36,s*.52,s*.1,0,0,TAU);g.fill();
    if(c.glow>0){const sp=glowSpr('#ffe27a');g.globalAlpha=Math.min(1,c.glow);g.drawImage(sp,-s*.9,-s*.9,s*1.8,s*1.6);g.globalAlpha=1;}
    // короб
    rrect(g,-s*.46,-s*.08,s*.92,s*.44,s*.05);g.fillStyle=grad(g,0,s*.1,s*.5,'#8a4a22');g.fill();outline(g,'#8a4a22',2);
    for(const bx of[-.32,.32]){rrect(g,s*bx-s*.045,-s*.08,s*.09,s*.44,2);g.fillStyle=grad(g,s*bx,s*.1,s*.2,'#c89a3a',.6);g.fill();outline(g,'#c89a3a',1);}
    for(const yy of[0,.26])ln(g,[-s*.44,s*yy,s*.44,s*yy],'rgba(40,20,10,.35)',1);
    // предмет внутри при открытой крышке
    if(item&&c.lid>.3){const k=Math.min(1,(c.lid-.3)/.5);g.save();g.beginPath();g.rect(-s*.6,-s*1.4,s*1.2,s*1.36);g.clip();MGK.put(g,item.key,0,-s*.05-k*s*.5*item.up,s*.56,D,{});g.restore();}
    // крышка (поворот вверх-назад)
    const a=c.lid*1.9;g.save();g.translate(0,-s*.08);g.scale(1,Math.cos(Math.min(a,1.55)));g.translate(0,s*.08);
    if(a<1.57){shp(g,'#a0582a',{hl:.45},[-s*.48,-s*.36,s*.48,-s*.06],()=>{g.moveTo(-s*.48,-s*.06);g.quadraticCurveTo(-s*.48,-s*.36,0,-s*.37);g.quadraticCurveTo(s*.48,-s*.36,s*.48,-s*.06);g.closePath();});
      for(const bx of[-.32,.32]){g.beginPath();g.moveTo(s*bx-s*.045,-s*.06);g.lineTo(s*bx-s*.045,-s*.3);g.lineTo(s*bx+s*.045,-s*.3);g.lineTo(s*bx+s*.045,-s*.06);g.fillStyle='#c89a3a';g.fill();}
      rrect(g,-s*.07,-s*.12,s*.14,s*.14,s*.03);g.fillStyle=grad(g,0,-s*.05,s*.1,'#f2c84a',.6);g.fill();outline(g,'#f2c84a',1);ell(g,0,-s*.04,s*.018,s*.03,'#3a2410',{ol:false,flat:true});
      shine(g,-s*.22,-s*.26,s*.1,s*.03,.35);}
    g.restore();if(c.lid>=.8){shp(g,'#5a2a14',{},[-s*.48,-s*.2,s*.48,-s*.06],()=>{g.moveTo(-s*.48,-s*.08);g.quadraticCurveTo(0,-s*.2,s*.48,-s*.08);g.closePath();});}
    g.restore();}
  // фаза: показать предмет → перемешать → выбор → открыть
  function startRound(){st.ph='show';st.t=0;st.item=1;st.pick=-1;for(const c of ch){c.lid=0;c.glow=0;}
    const n=SWAPS[st.r]+Math.min(2,Math.floor((o.lvl||0)/5)),sw=[];let last=-1;for(let i=0;i<n;i++){let a,b;do{a=Math.floor(R()*3);b=(a+1+Math.floor(R()*2))%3;}while(a+b*3===last);last=a+b*3;sw.push([a,b]);}
    st.sw=sw;st.swi=0;st.dur=SDUR[st.r]*K;st.prize=1;}   // приз — в средней ячейке
  const slotOf=i=>ch.find(c=>c.slot===i);
  cv.addEventListener('pointerdown',e=>{e.preventDefault();if(host.paused||st.ph!=='pick')return;const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    for(let i=0;i<3;i++){const c=ch[i];if(Math.abs(x-c.x)<cs*.55&&y>c.y-cs*.6&&y<c.y+cs*.5){choose(i);return;}}});
  const pc=mgPC();   // OB:FINAL ПК: 1 2 3 / ← ↓ → — сундук слева/посередине/справа
  mgKeys(host,k=>{if(st.ph!=='pick')return false;const m={'1':0,'2':1,'3':2,ArrowLeft:0,ArrowDown:1,ArrowUp:1,ArrowRight:2}[k];if(m==null)return false;const i=ch.findIndex(c=>c.slot===m);if(i>=0)choose(i);return true;});
  function choose(i){st.pick=i;st.ph='open';st.t=0;peekBtn(false);const ok=ch[i].prize;try{host.snd.click();}catch(_){}
    st.res.push(ok?1:0);if(ok){st.score++;}}
  function step(dt){st.t+=dt;if(st.laugh>0)st.laugh-=dt;st.wink+=dt;for(const c of ch){if(c.shk>0)c.shk-=dt;if(c.glow>0&&st.ph!=='pick')c.glow=Math.max(0,c.glow-dt*1.5);}
    for(const q of pops)q.t+=dt;for(let i=pops.length-1;i>=0;i--)if(pops[i].t>1.1)pops.splice(i,1);
    if(st.ph==='intro'){if(st.t>1.3){for(const c of ch)c.prize=c.slot===1;startRound();}return;}
    if(st.ph==='show'){const c=slotOf(1),T=st.t/K;c.lid=T<.35?T/.35:T<1.05?1:Math.max(0,1-(T-1.05)/.25);st.itemUp=T<.35?0:T<.75?(T-.35)/.4:Math.max(0,1-(T-.75)/.3);
      if(T>.15&&T<.2)try{host.snd.click();}catch(_){}if(T>=1.35){st.ph='shuffle';st.t=0;st.swi=0;}return;}
    if(st.ph==='shuffle'){const d=st.dur,i=Math.floor(st.t/d);if(i>=st.sw.length){if(st.swi<st.sw.length){const [a,b]=st.sw[st.swi],A=slotOf(a),B=slotOf(b);A.slot=b;B.slot=a;st.swi=st.sw.length;}for(const c of ch){c.x=slotX[c.slot];c.y=ty;}st.ph='pick';st.t=0;peekBtn(true);return;}
      if(i!==st.swi){const [a,b]=st.sw[st.swi],A=slotOf(a),B=slotOf(b);A.slot=b;B.slot=a;st.swi=i;try{host.snd.click();}catch(_){}}
      const [a,b]=st.sw[i],A=slotOf(a),B=slotOf(b),k=MGK.ease.inout((st.t-i*d)/d),dx=slotX[b]-slotX[a],arc=cs*.42*Math.sin(k*Math.PI);
      for(const c of ch){c.x=slotX[c.slot];c.y=ty;}A.x=slotX[a]+dx*k;A.y=ty-arc;B.x=slotX[b]-dx*k;B.y=ty+arc*.35;
      return;}
    if(st.ph==='open'){const c=ch[st.pick],T=st.t;c.lid=Math.min(1,T/.3);
      if(T>.3&&!st.said){st.said=1;if(c.prize){pops.push({x:c.x,y:c.y-cs*.9,s:Lg('Нашёл!','Found it!'),t:0,c:'#ffe27a'});MGK.burst(P,c.x,c.y-cs*.4,{n:calm?6:22,col:'#ffe27a',sp:260,k:'star',s:6});try{host.snd.star(st.r);}catch(_){}}
        else{st.laugh=1.6;pops.push({x:kx,y:ky-ks*.7,s:Lg('Ха-ха-ха!','Ha-ha-ha!'),t:0,c:'#c8ffb0'});c.shk=.3;try{host.snd.frog();}catch(_){}}}
      if(!c.prize&&T>.7){const pc=ch.find(x=>x.prize);pc.lid=Math.min(1,(T-.7)/.3);pc.glow=1;}
      if(T>(calm?2.4:1.9)){st.said=0;for(const x of ch)x.lid=0;st.r++;if(st.r>=5){st.ph='end';st.t=0;try{st.score>=5?host.snd.win():st.score>=3?host.snd.up():host.snd.lose();}catch(_){}}else{st.ph='close';st.t=0;}}return;}
    if(st.ph==='close'){if(st.t>.35){for(const c of ch)c.prize=c.slot===1;startRound();}return;}
    if(st.ph==='end'&&st.t>2.4&&!st.sent){st.sent=1;host.done({score:st.score,tier:igTier(st.score),extra:{lbl:Lg('угадано из 5','found out of 5')}});}}
  // кнопка «Подглядеть» за ролик (раз за игру)
  let pb=null;function peekBtn(on){if(!pb&&on&&!st.peekUsed&&host.adOk()&&!o.train){pb=document.createElement('button');pb.className='btn ad';pb.style.cssText='position:absolute;left:50%;transform:translateX(-50%);bottom:calc(var(--sb,0px) + 14px);width:auto;max-width:90%;z-index:3';
      pb.textContent=Lg('🎬 Подглядеть за рекламу','🎬 Peek for an ad');host.el.appendChild(pb);pb.onclick=()=>{if(st.ph!=='pick')return;pb.disabled=true;host.ad('peek').then(ok=>{pb.disabled=false;if(ok){st.peekUsed=1;pb.style.display='none';const c=ch.find(x=>x.prize);c.glow=3;}});};}
    if(pb)pb.style.display=on&&!st.peekUsed?'':'none';}
  function draw(){g.setTransform(D,0,0,D,0,0);g.lineJoin='round';g.lineCap='round';if(!bg)mkBg();g.drawImage(bg,0,0,W,H);
    // свечи
    for(const [fx,fy] of(land?[[.33,.5],[.92,.5]]:[[.08,.5],[.92,.5]])){const x=W*fx,y=ty-cs*.05,fl=1+(calm?0:Math.sin(st.wink*9+fx*10)*.08);g.globalAlpha=.7;g.drawImage(glowSpr('#ffb43a'),x-cs*.7*fl,y-cs*1.05*fl,cs*1.4*fl,cs*1.4*fl);g.globalAlpha=1;
      rrect(g,x-cs*.05,y-cs*.3,cs*.1,cs*.34,3);g.fillStyle='#f4ecd8';g.fill();outline(g,'#f4ecd8',1);ell(g,x,y-cs*.36,cs*.035*fl,cs*.07*fl,'#ffd24a',{ol:false,flat:true});ell(g,x,y+cs*.05,cs*.12,cs*.04,'#c89a3a',{lw:1});}
    // Кощей: дышит, хохочет
    const lb=st.laugh>0?Math.sin(st.laugh*30)*ks*.02:0,br=calm?0:Math.sin(st.wink*2)*.015;MGK.put(g,'kosh',kx+lb,ky,ks,D,{sy:1+br,sx:1-br*.5,rot:st.laugh>0?Math.sin(st.laugh*18)*.06:0});
    // сундуки (дальний — раньше)
    const order=ch.slice().sort((a,b)=>a.y-b.y);for(const c of order){const item=c.prize&&(st.ph==='show'||st.ph==='open'||st.ph==='end')?{key:ITEMS[Math.min(4,st.r)],up:st.ph==='show'?(st.itemUp||0)+.4:1}:null;chest(c,item);
      if(st.r===4&&item&&c.lid>.5){g.globalAlpha=.8;g.drawImage(glowSpr('#5cff9a'),c.x-cs*.5,c.y-cs*.9,cs,cs);g.globalAlpha=1;}}
    if(pc&&st.ph==='pick')for(let i=0;i<3;i++)mgKeycap(g,slotX[i],ty+cs*.5,String(i+1),Math.max(22,Math.min(32,cs*.22)));
    MGK.parts(g,P,lastDt);
    for(const q of pops){const k=q.t/1.1;g.globalAlpha=1-Math.max(0,k-.6)*2.5;MGK.text(g,q.s,q.x,q.y-k*30,Math.min(34,cs*.28),{col:q.c});}g.globalAlpha=1;
    hud();}
  function hud(){const fs=Math.min(19,W*.045),top=10;
    // строка сказки: пройденное — золотом
    const parts=[Lg('Игла — в яйце,','The needle’s in the egg,'),Lg('яйцо — в утке,','the egg’s in the duck,'),Lg('утка — в зайце,','the duck’s in the hare,'),Lg('заяц — в сундуке…','the hare’s in the chest…')];
    const bw=Math.min(W-(land?80:84),560),bx=land?W*.56-bw/2:12,bh=land?50:84;rrect(g,bx,top,bw,bh,16);g.fillStyle='rgba(253,240,207,.95)';g.fill();g.strokeStyle='#3b2412';g.lineWidth=2.5;g.stroke();
    const lines=land?[parts.join(' ')]:[parts[0]+' '+parts[1],parts[2]+' '+parts[3]];const f2=land?Math.min(fs,bw/38):fs;lines.forEach((l,i)=>MGK.text(g,l,bx+bw/2,top+bh/(lines.length+1)*(i+1),f2,{ol:false,col:'#5a2a14',w:700,mw:bw-20}));
    // раунды
    const ry=top+bh+30,rs=Math.min(40,W*.09);for(let i=0;i<5;i++){const x=(land?W*.56:W/2)+(i-2)*rs*1.25;g.globalAlpha=i<=st.r||st.ph==='end'?1:.35;
      rrect(g,x-rs/2,ry-rs/2,rs,rs,rs*.3);g.fillStyle=st.res[i]===1?'#eaf7d8':st.res[i]===0?'#ffe6dc':'#fdf0cf';g.fill();g.strokeStyle=i===st.r&&st.ph!=='end'?'#e8433a':'#6a4222';g.lineWidth=i===st.r?3:2;g.stroke();
      MGK.put(g,ITEMS[i],x,ry,rs*.72,D,{});g.globalAlpha=1;}
    // подсказка
    let s='';if(st.ph==='intro')s=Lg('Кощей прячет свою смерть. Следи за сундуком!','Koschei hides his death. Watch the chest!');else if(st.ph==='show')s=Lg('Смотри: ','Look: ')+Lg(IT_N[st.r][0],IT_N[st.r][1])+Lg(' — в сундук!',' goes into the chest!');
    else if(st.ph==='shuffle')s=Lg('Следи…','Watch…');else if(st.ph==='pick')s=Lg(IT_W[st.r][0],IT_W[st.r][1])+(pc?Lg(' Щёлкни сундук или жми 1 2 3',' Click a chest or press 1 2 3'):Lg(' Тапни сундук',' Tap a chest'));else if(st.ph==='end')s=st.score>=5?Lg('Нашёл смерть Кощееву — 5 из 5!','You found Koschei’s death — 5 of 5!'):Lg('Угадано '+st.score+' из 5','Found '+st.score+' of 5');
    if(s){const by=ty+cs*.95,f3=Math.min(22,W*.05);g.font=MGK.font(f3,800);const tw=Math.min(W-20,g.measureText(s).width+40);rrect(g,(land?W*.56:W/2)-tw/2,by-24,tw,48,18);g.fillStyle='rgba(30,16,40,.82)';g.fill();g.strokeStyle='#e6b53a';g.lineWidth=2;g.stroke();
      MGK.text(g,s,land?W*.56:W/2,by,f3,{col:st.ph==='pick'?'#ffe27a':'#fff6dc',mw:tw-24});}}
  let lastDt=0;MGK.loop(host,dt=>{lastDt=dt;if(dt>0)step(dt);draw();});
  if(/[?&]mg=/.test(location.search))window.__auto=()=>{if(st.ph==='pick'){const i=ch.findIndex(c=>c.prize);choose(R()<.75?i:(i+1)%3);}};}
function sim(o,k){const R=mulberry(o.seed^0x51ed);let s=0;for(let r=0;r<5;r++)if(R()<Math.min(.98,.4+k*.62-r*.05))s++;return {score:s,tier:igTier(s)};}
MG_REG({id:'igla',num:5,n:{ru:'Кощеева игла',en:'Koschei’s Needle'},icon:'mg_i5',kind:'score',unit:{ru:'угадано из 5',en:'found out of 5'},run,sim});
})();
