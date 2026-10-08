'use strict';
/* OB:MGA №8 «Набор ополчения» (kind 'buff'). Из ворот идут охотники в ополчение: смахни стрельца влево (к стрельцам), пушкаря вправо (к пушкарям),
   знахаря вниз (к избе Яги); волка в кафтане (серая морда, хвост из-под кафтана) — вверх, обратно за ворота. Можно и нажать на указатель.
   Ошибка — без наказания (только время и серия), волк в войске — −2. 45 с (спокойный режим 60 с).
   Итог: host.done({score, tier, extra:{buf:{k:'opol', coinK}, alt:{trf:2}}}) — coinK = доля стартовых монет следующего боя кампании (0,02/0,035/0,05 по ступени; было 0,04/0,07/0,10 — бот MGA: +10 % монет поднимает «стену без прокачки» на 18 п.);
   «или 2 трофея — на выбор» (alt) решает оболочка MG0. Эффект на бой (S.mgBuf) применяет оболочка. */
const OPOL={T:45,TIERS:[7,17,30],COIN:[0,.01,.015,.02]};   // OB:FINAL было 2/3,5/5 %: «живой игрок» с дневными бафами брал с 1-й попытки на +2…10 п. больше (FINAL.md) — урезано до 1/1,5/2 %
const OPOL_LOOK={
  strel:{body:'#c8392f',cloak:null,skin:'#f4c9a3',beard:'#6a4a2a',hat:'boyar',cap:'#b8322e',fur:'#5a3a22',belt:'#e6b53a',boots:'#4a2c1c'},
  push:{body:'#35588a',cloak:null,skin:'#eec39c',beard:'#3b2819',hat:'helm',helm:'#8a90a0',rim:'#c0392b',belt:'#3a2a1a',boots:'#2a2a30'},
  znah:{body:'#4a8a4a',cloak:'#2f5a3a',skin:'#eec39c',beard:'#ece6d6',long:1,hat:'felt',cap:'#6a5a3a',belt:'#c0a050',boots:'#5a3a22'}};
function opolProp(g,ty){
  if(ty==='strel'){g.save();g.lineCap='round';g.beginPath();g.moveTo(15,-10);g.quadraticCurveTo(27,9,15,28);g.lineWidth=2.8;g.strokeStyle='#7a4a22';g.stroke();g.lineWidth=.9;g.strokeStyle='#f0e6d0';g.beginPath();g.moveTo(15,-10);g.lineTo(15,28);g.stroke();g.restore();}
  if(ty==='push'){ell(g,-14,15,7.5,7.5,'#3a3a44',{hl:.5});shine(g,-16.5,12,2.4,1.4,.6);g.beginPath();g.ellipse(9,-3,2.2,1.4,.3,0,TAU);g.fillStyle='rgba(40,30,30,.35)';g.fill();
    ln(g,[18,-26,18,26],'#8a5a2e',2.4);ell(g,18,-27,3.2,4.2,'#3a2a1a');}
  if(ty==='znah'){g.save();g.translate(15,14);ln(g,[-6,-6,0,-12,6,-6],'#8a5a2e',1.6);ell(g,0,2,8,6,'#b88a4a',{hl:.3});g.strokeStyle='rgba(90,60,20,.6)';g.lineWidth=.8;for(const y of[-1,2,5]){g.beginPath();g.moveTo(-7,y);g.lineTo(7,y);g.stroke();}
    for(const [x,y,c] of[[-4,-4,'#3a9a3a'],[0,-6,'#4ab04a'],[4,-4,'#3a9a3a'],[-2,-5,'#ffd84a'],[3,-6,'#e8433a']])ell(g,x,y,c==='#3a9a3a'||c==='#4ab04a'?2.6:1.5,c==='#3a9a3a'||c==='#4ab04a'?3.6:1.5,c,{lw:.4});g.restore();}}
function opolQuiver(g){g.save();g.translate(-13,-2);g.rotate(-.35);rrect(g,-4,-10,8,20,2);g.fillStyle='#8a5a2e';g.fill();outline(g,'#8a5a2e',.8);for(const x of[-2,1,3])poly(g,[x-1.6,-10,x+1.6,-10,x,-16],'#e8433a',{lw:.4});g.restore();}
function opolWolfTail(g){shp(g,'#8a93a3',{hl:.25},[-30,-6,-6,22],()=>{g.moveTo(-8,18);g.quadraticCurveTo(-24,20,-28,6);g.quadraticCurveTo(-30,-4,-22,-6);g.quadraticCurveTo(-24,4,-18,10);g.quadraticCurveTo(-12,14,-6,12);g.closePath();});
  shp(g,'#eef0f4',{},[-30,-7,-20,2],()=>{g.moveTo(-28,4);g.quadraticCurveTo(-30,-4,-22,-6);g.quadraticCurveTo(-25,-1,-24,3);g.closePath();});}
for(const ty in OPOL_LOOK){
  art('mga_'+ty,70,g=>{g.translate(0,2);if(ty==='strel')opolQuiver(g);drawHero(g,OPOL_LOOK[ty],0);opolProp(g,ty);});
}
/* OB:MGA волк, переодетый в наряд ty, с ОДНОЙ приметой: tail хвост из-под кафтана, ears уши из-под шапки, paws лапы с когтями, fangs клыки в улыбке, claws след когтей на кафтане.
   k — крупность приметы: 1 (начало смотра) / .55 (к концу — хитрее). Ключ рисунка: mga_w_<наряд>_<примета>_<1|s> */
const OPOL_TELLS=['tail','ears','paws','fangs','claws'];
function opolTell(g,tell,k,ty){const G='#8a93a3';
  if(tell==='ears'){const top=ty==='strel'?-30:ty==='push'?-20:-22;for(const sd of[-1,1]){const x=sd*11+1;g.save();g.translate(x,top);g.scale(k,k);poly(g,[-4*sd,6,8*sd,-11,6*sd,7],G);poly(g,[-1*sd,4,6*sd,-7,4*sd,5],'#e9a8a8',{ol:false});g.restore();}}
  if(tell==='paws'){for(const [x,y] of[[12,10],[-12,11],[-5,23],[5,23]]){g.save();g.translate(x,y);g.scale(k,k);ell(g,0,0,5.2,4.6,G,{hl:.3});for(const d of[-2.6,0,2.6])poly(g,[d-.9,3,d+.9,3,d,6.5],'#f4f0e6',{lw:.4});g.restore();}}
  if(tell==='fangs'){g.save();g.translate(7,-3.5);g.scale(k,k);g.beginPath();g.moveTo(-5,0);g.quadraticCurveTo(0,4.5,5,0);g.closePath();g.fillStyle='#5a1a1a';g.fill();g.lineWidth=.9;g.strokeStyle='#2a0a0a';g.stroke();
    for(const d of[-3,3])poly(g,[d-1.4,.2,d+1.4,.2,d,4],'#fff',{lw:.4});g.restore();eye(g,4,-10,2.2*Math.max(.8,k),{col:'#e0a020',px:.3});eye(g,10.5,-10,2*Math.max(.8,k),{col:'#e0a020',px:.3});}
  if(tell==='claws'){g.save();g.translate(-3,6);g.scale(k,k);for(const d of[-3.5,0,3.5]){g.beginPath();g.moveTo(d-3,-7);g.quadraticCurveTo(d,0,d+2,7);g.lineWidth=2.2;g.strokeStyle='#3a1010';g.stroke();g.lineWidth=.8;g.strokeStyle='#f0d0b0';g.stroke();}g.restore();
    g.save();g.translate(0,-1);g.scale(k,k);for(const d of[-5,-1,3,7])poly(g,[d-2,0,d+2,0,d,-4],G,{lw:.4});g.restore();}}
for(const ty in OPOL_LOOK)for(const tell of OPOL_TELLS)for(const kk of['1','s']){const k=kk==='1'?1:.55;
  art('mga_w_'+ty+'_'+tell+'_'+kk,70,g=>{g.translate(0,2);if(tell==='tail'){g.save();g.translate(-8,16);g.scale(k,k);g.translate(8,-16);opolWolfTail(g);g.restore();}
    if(ty==='strel')opolQuiver(g);drawHero(g,OPOL_LOOK[ty],0);opolProp(g,ty);opolTell(g,tell,k,ty);});}
art('mga_hen',40,g=>{ell(g,-2,4,11,9,'#fbf6ec',{hl:.3});poly(g,[-12,0,-18,-8,-14,4],'#fbf6ec');ell(g,7,-6,5.5,5.5,'#fbf6ec');poly(g,[11,-7,16,-5,11,-4],'#f0b030',{lw:.5});
  for(const x of[4,7,10])ell(g,x,-12,1.8,2.4,'#e8433a',{lw:.4});ell(g,10,-3,1.4,2.2,'#e8433a',{lw:.4});eye(g,8,-7,1.3,{px:.2});ln(g,[-3,12,-4,17],'#e0a020',1.2);ln(g,[2,12,3,17],'#e0a020',1.2);});
function opolPlan(o,n){const r=mulberry((o.seed>>>0)^0x0b01),lv=o.lvl||0,pw=.42+Math.min(.04,lv*.005),T=['strel','push','znah'],out=[];let last='',tl=-1;
  for(let i=0;i<n;i++){let ty;if(i>1&&r()<pw&&last!=='wolf')ty='wolf';else{do{ty=T[Math.floor(r()*3)];}while(ty===last&&r()<.6);}
    let tell=null;if(ty==='wolf'){let j;do{j=Math.floor(r()*OPOL_TELLS.length);}while(j===tl);tl=j;tell=OPOL_TELLS[j];}
    out.push({ty,as:ty==='wolf'?T[Math.floor(r()*3)]:ty,tell});last=ty;}return out;}
function opolPc(k){const v=Math.round(k*1000)/10;return LANG==='en'?String(v):String(v).replace('.',',');}
function opolTier(s){return s>=OPOL.TIERS[2]?3:s>=OPOL.TIERS[1]?2:s>=OPOL.TIERS[0]?1:0;}
const OPOL_DIR={strel:'L',push:'R',znah:'D',wolf:'U'};
MG_REG({id:'opol',n:{ru:'Набор ополчения',en:'Raise the Militia'},icon:'mga_strel',kind:'buff',
  open:()=>{try{return chaptersDone()>=3;}catch(e){return false;}},
  bot(o){o=o||{};const q=mgakSkill(o),T=OPOL.T*(o.calm?1.35:1),P=opolPlan({seed:o.seed||1,lvl:o.lvl||0},200);let t=0,s=0,c=0;
    for(const p of P){t+=.45+(2.6-2*q)*(.8+Math.random()*.4)+(p.ty==='wolf'?.6-.4*q:0);if(t>T)break;const late=t>T*.5,ok=Math.random()<(p.ty==='wolf'?(late?.45+.5*q:.6+.38*q):.6+.39*q);
      if(ok){s+=p.ty==='wolf'?2:1;c++;if(c%5===0)s++;}else{c=0;if(p.ty==='wolf')s=Math.max(0,s-2);}}
    return {score:s,tier:opolTier(s),coinK:OPOL.COIN[opolTier(s)]};},
  run(host,o){
    const st=mgakStage(host,o),T=OPOL.T*mgakCalmK(o),Q=opolPlan(o,400);
    const G2={ph:'intro',left:T,score:0,combo:0,best:0,qi:0,cur:null,leaving:[],cnt:{strel:0,push:0,znah:0,wolf:0},panic:0,thief:null,thefts:0,seenTell:{},flash:{},shown:0,end:false,tip:3,swipe:null,wolfT:0};
    let L={},bg=null;
    st.onFit=function(){const W=st.W,H=st.H,u=st.u,wide=st.wide;
      const gateY=wide?H*.3:H*.27,cy=wide?H*.6:H*.53,side=wide?Math.min(W*.3,330*u):W*.33;
      L={W,H,u,wide,gateX:W/2,gateY,cx:W/2,cy,rs:(wide?150:132)*u,
        D:{L:{x:W/2-side,y:cy+(wide?10:30)*u},R:{x:W/2+side,y:cy+(wide?10:30)*u},D:{x:W/2,y:wide?H*.86:H*.83},U:{x:W/2,y:gateY+10*u}}};
      if(!wide){L.D.L.x=Math.max(64*u,L.D.L.x);L.D.R.x=Math.min(W-64*u,L.D.R.x);}
      const dpr=st.dpr;bg=mkCanvas(W*dpr,H*dpr);const g=bg.getContext('2d');g.scale(dpr,dpr);
      mgakSky(g,W,gateY+40*u,['#4a8ad8','#9ccff2','#e8f4e0']);g.drawImage(fxCloud(),W*.1,H*.07,120*u,74*u);g.globalAlpha=.85;g.drawImage(fxCloud(),W*.62,H*.04,90*u,56*u);g.globalAlpha=1;
      mgakHills(g,W,gateY-40*u,30*u,'#7aa0c0',4,'#a8c4dc');mgakForest(g,W,gateY-18*u,56*u,'#3f6e5a',8,'#56876c');
      // земля площади
      const gy=gateY+18*u,dg=g.createLinearGradient(0,gy,0,H);dg.addColorStop(0,'#8fb850');dg.addColorStop(.35,'#7aa844');dg.addColorStop(1,'#5f8a32');g.fillStyle=dg;g.fillRect(0,gy,W,H-gy);
      // утоптанная площадь и дорога от ворот
      g.fillStyle='rgba(196,160,104,.85)';g.beginPath();g.moveTo(W/2-26*u,gy);g.quadraticCurveTo(W/2-60*u,cy-60*u,W/2-L.rs*1.1,cy);g.lineTo(W/2+L.rs*1.1,cy);g.quadraticCurveTo(W/2+60*u,cy-60*u,W/2+26*u,gy);g.closePath();g.fill();
      g.beginPath();g.ellipse(W/2,cy+20*u,Math.min(W*.46,L.rs*2.2),L.rs*.62,0,0,TAU);g.fill();
      g.fillStyle='rgba(150,112,62,.35)';g.beginPath();g.ellipse(W/2,cy+20*u,Math.min(W*.4,L.rs*1.9),L.rs*.5,0,0,TAU);g.fill();
      g.fillStyle='rgba(196,160,104,.85)';g.beginPath();g.moveTo(W/2-30*u,cy+40*u);g.lineTo(W/2-46*u,H);g.lineTo(W/2+46*u,H);g.lineTo(W/2+30*u,cy+40*u);g.closePath();g.fill();
      mgakGrassTufts(g,0,W,gy+12*u,H,'rgba(40,80,20,.45)',13,Math.round(W/7));
      // частокол с воротами
      const sw=Math.max(28,Math.min(40,W/14)),sh=86*u;for(let x=sw/2-4;x<W+sw;x+=sw*1.02){if(Math.abs(x-W/2)<74*u)continue;chastStake(g,x,gy,sw,sh*(.94+((x*7|0)%5)*.015),(x|0)%5);}
      mgakPut(g,'gate',W/2,gy-58*u,(wide?250:230)*u,dpr);
      // дворы: стрельцы (слева), пушкари (справа), изба Яги (внизу)
      const yd=(k,key,sz,dx,dy)=>{const d=L.D[k];mgakPut(g,key,d.x+dx,d.y+dy,sz*(wide?1.3:1),dpr);};
      yd('L','t_arch_2',112*u,wide?-70*u:-4*u,-110*u);yd('R','ti_pushka_2',100*u,wide?70*u:4*u,-110*u);
      mgakPut(g,'b_range',L.D.L.x+(wide?40:24)*u,L.D.L.y-150*u,44*u,dpr);
      for(const [dx,dy] of[[-14,0],[0,0],[14,0],[-7,-11],[7,-11],[0,-22]])mgakPut(g,'ball',L.D.R.x+(wide?-40:-24)*u+dx*u,L.D.R.y-140*u+dy*u,18*u,dpr);
      const izX=wide?L.D.D.x+170*u:L.D.D.x+(W/2>170*u?120*u:96*u),izY=L.D.D.y-14*u;yd('D','t_izba_2',104*u,izX-L.D.D.x,-14*u);};
    st.fit();
    const DIRS=['L','R','D','U'],NAME={L:Lg('Стрельцы','Archers'),R:Lg('Пушкари','Gunners'),D:Lg('К Яге','To Yaga'),U:Lg('Волка — вон!','Wolf out!')};
    const ICON={L:'ti_arch_2',R:'ti_pushka_2',D:'ti_izba_2',U:'wolf'};
    const wkey=(p,late)=>'mga_w_'+p.as+'_'+p.tell+'_'+(late?'s':'1');
    const next=()=>{const p=Q[G2.qi++%Q.length],late=G2.left<T*.5;G2.cur={ty:p.ty,as:p.as,tell:p.tell,late,blink:G2.left<T*.3,key:p.ty==='wolf'?wkey(p,late):'mga_'+p.ty,t:0,st:'in',shake:0,ph:Math.random()*6};};
    const signBox=k=>{const d=L.D[k],u=L.u,w=(k==='U'?132:116)*u,h=58*u;return k==='U'?{x:d.x-w/2+(L.wide?190:118)*u,y:d.y-h/2-(L.wide?40:52)*u,w,h}:k==='D'?{x:d.x-w/2-(L.wide?0:0),y:d.y-h/2+6*u,w,h}:{x:d.x-w/2,y:d.y-h/2+10*u,w,h};};
    function send(dir){const c=G2.cur;if(!c||c.st!=='ready'||G2.ph!=='play')return;const want=OPOL_DIR[c.ty],u=L.u;
      if(dir===want){c.st='go';c.dir=dir;c.t=0;G2.combo++;G2.best=Math.max(G2.best,G2.combo);let add=c.ty==='wolf'?2:1;if(G2.combo%5===0){add++;mgakPop(st,Lg('Серия ×','Streak ×')+G2.combo+'!',L.cx,L.cy-L.rs*1.3,26*u,'#ffe066');}
        G2.score+=add;G2.leaving.push(c);G2.cur=null;G2.flash[dir]={t:.5,ok:1};
        if(c.ty==='wolf'){try{SND.whistle();}catch(e){}st.shake=5;mgakPuff(st,L.cx,L.cy,90*u,6);mgakPop(st,Lg('Ату его! +2','Get out! +2'),L.cx,L.cy-L.rs,26*u,'#ffe066');
          for(let i=0;i<4;i++)st.parts.push({k:'chip',x:L.cx,y:L.cy,vx:(Math.random()-.5)*300,vy:-200-Math.random()*150,t:0,dur:1,s:14,rot:0,vr:8,col:OPOL_LOOK[c.as].body,gr:600});}
        else{try{SND.coin();}catch(e){}mgakBurst(st,'spark',L.cx,L.cy-20*u,7,{col:'#ffe066',v:160,gr:0,s:7});}
        setTimeout(()=>{if(st.alive&&G2.ph==='play'&&!G2.cur)next();},c.ty==='wolf'?160:90);}
      else{G2.combo=0;G2.flash[dir]={t:.5,ok:0};c.shake=.45;try{SND.sell();}catch(e){}
        if(c.ty==='wolf'){G2.score=Math.max(0,G2.score-2);c.st='go';c.dir=dir;c.t=0;c.bad=1;G2.leaving.push(c);G2.cur=null;st.shake=10;mgakPuff(st,L.D[dir].x,L.D[dir].y-60*u,80*u,6);
          mgakPop(st,Lg('Волк пробрался! −2','A wolf got in! −2'),L.cx,L.cy-L.rs*1.2,24*u,'#ff8a7a');G2.panic=2.2;
          const d0=L.D[dir];G2.thief={t:0,x0:d0.x,y0:d0.y-40*u,vx:(d0.x<L.W/2?1:-1)};
          G2.vsay=[Lg('Ох, батюшки! Курицу унёс!','Good grief! He took a hen!'),Lg('Держи вора! Это ж волк был!','Stop, thief! That was a wolf!'),Lg('Проморгали серого!','The grey one slipped by!')][G2.thefts++%3];setTimeout(()=>{if(st.alive&&G2.ph==='play'&&!G2.cur)next();},300);}
        else mgakPop(st,c.ty==='strel'?Lg('Я ж стрелец!','I’m an archer!'):c.ty==='push'?Lg('Я ж пушкарь!','I’m a gunner!'):Lg('Я ж знахарь!','I’m a healer!'),L.cx,L.cy-L.rs*1.15,21*u,'#fff');}}
    st.down=p=>{if(G2.ph!=='play')return;G2.swipe={x:p.x,y:p.y,t:st.t};};
    // ПК: стрелки ← → ↑ ↓ — как смахивание
    st.key=k=>{const d={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D'}[k];if(!d||G2.ph!=='play')return false;G2.kbd=1;send(d);return true;};
    st.move=p=>{const s=G2.swipe;if(!s||!G2.cur)return;const dx=p.x-s.x,dy=p.y-s.y;G2.cur.dx=Math.max(-60,Math.min(60,dx*.5));G2.cur.dy=Math.max(-60,Math.min(60,dy*.5));};
    st.up=p=>{const s=G2.swipe;G2.swipe=null;if(G2.cur){G2.cur.dx=0;G2.cur.dy=0;}if(!s||G2.ph!=='play')return;const dx=p.x-s.x,dy=p.y-s.y,d=Math.hypot(dx,dy);
      if(d>34){send(Math.abs(dx)>Math.abs(dy)?(dx<0?'L':'R'):(dy<0?'U':'D'));return;}
      for(const k of DIRS){const b=signBox(k);if(p.x>=b.x-8&&p.x<=b.x+b.w+8&&p.y>=b.y-8&&p.y<=b.y+b.h+8){send(k);return;}}};
    function finish(){if(G2.end)return;G2.end=true;G2.ph='end';const tier=opolTier(G2.score),k=OPOL.COIN[tier];
      mgakFinale(st,{good:tier>=2,title:tier>=3?Lg('Славное ополчение!','A mighty militia!'):tier?Lg('Ополчение собрано!','Militia assembled!'):Lg('Маловато охотников…','Too few volunteers…'),
        sub:Lg('Ополченцев: ','Recruits: ')+G2.score+(k?'\n'+(o.train?Lg('Тренировка: ','Practice: '):'')+Lg('+'+opolPc(k)+' % монет на старте следующего боя','+'+opolPc(k)+'% starting coins in your next battle'):''),
        ico:k?(g,x,y,s,t)=>{for(let i=0;i<tier;i++)mgakPut(g,'coin',x+(i-(tier-1)/2)*s*.75,y+Math.sin(t*4+i)*3,s*.9,st.dpr);}:null,
        dur:2.8,then:()=>host.done({score:G2.score,tier,extra:o.train?{}:{buf:{k:'opol',coinK:k},alt:{trf:2}}})});}
    st.update=function(dt){if(G2.ph==='play'){G2.left-=dt;if(G2.left<=0){G2.left=0;finish();}}
      const c=G2.cur;if(c){c.t+=dt;if(c.st==='in'&&c.t>=.32){c.st='ready';c.t=0;}if(c.shake>0)c.shake-=dt;}
      for(let i=G2.leaving.length-1;i>=0;i--){const a=G2.leaving[i];a.t+=dt;if(a.t>=.55){G2.leaving.splice(i,1);if(!a.bad&&a.ty!=='wolf')G2.cnt[a.ty]++;if(!a.bad&&a.ty!=='wolf'){const d=L.D[a.dir];mgakPuff(st,d.x,d.y-30*L.u,40*L.u,3);}}}
      if(G2.panic>0)G2.panic-=dt;if(G2.thief){const th=G2.thief;th.t+=dt;if(Math.random()<.3)st.parts.push({k:'chip',x:th.x||th.x0,y:(th.y||th.y0)-10,vx:(Math.random()-.5)*80,vy:-60,t:0,dur:1.2,s:9,rot:0,vr:6,col:'#fbf6ec',gr:120});if(th.t>2.4)G2.thief=null;}
      for(const k in G2.flash){G2.flash[k].t-=dt;if(G2.flash[k].t<=0)delete G2.flash[k];}};
    /* рисование */
    function drawSign(g,k){const b=signBox(k),u=L.u,f=G2.flash[k],pul=G2.tip>0&&G2.cur&&OPOL_DIR[G2.cur.ty]===k?1+Math.sin(st.t*6)*.05:1;g.save();g.translate(b.x+b.w/2,b.y+b.h/2);g.scale(pul,pul);
      if(f){g.rotate(f.ok?0:Math.sin(f.t*40)*.06);}
      ln(g,[-b.w*.3,b.h*.4,-b.w*.3,b.h*.9],'#5a3a1e',5*u);ln(g,[b.w*.3,b.h*.4,b.w*.3,b.h*.9],'#5a3a1e',5*u);
      const gr=g.createLinearGradient(0,-b.h/2,0,b.h/2);gr.addColorStop(0,f?(f.ok?'#c8f08a':'#ff9a8a'):'#d8a868');gr.addColorStop(1,f?(f.ok?'#7ac03a':'#d04a3a'):'#a8703c');g.fillStyle=gr;mgakRR(g,-b.w/2,-b.h/2,b.w,b.h,10*u);g.fill();g.lineWidth=3;g.strokeStyle='#3a2410';g.stroke();
      g.strokeStyle='rgba(60,30,10,.35)';g.lineWidth=1;for(const y of[-.18,.18]){g.beginPath();g.moveTo(-b.w/2+8,b.h*y);g.lineTo(b.w/2-8,b.h*y);g.stroke();}
      const arr={L:'←',R:'→',D:'↓',U:'↑'}[k];mgakPut(g,ICON[k],-b.w/2+24*u,0,(k==='U'?40:44)*u,st.dpr);
      mgakTxt(g,NAME[k],10*u,-7*u,15*u,'#fff8e0',{mw:b.w-54*u,lw:3.5});if(st.pc)mgakKey(g,10*u,13*u,22*u,k,!!f);else mgakTxt(g,arr,10*u,13*u,18*u,'#fff8e0',{lw:3.5});g.restore();
      if(k!=='U'){const n=G2.cnt[{L:'strel',R:'push',D:'znah'}[k]];if(n){const d=L.D[k];mgakTxt(g,'×'+n,b.x+b.w-4*u,b.y-4*u,18*u,'#ffe066',{lw:4,al:'right'});}}}
    function drawCrowd(g,k,ty){const n=Math.min(G2.cnt[ty],9),d=L.D[k],u=L.u;if(!n)return;const base=k==='D'?{x:d.x+(L.wide?-150:-110)*u,y:d.y-24*u}:{x:d.x+(k==='L'?(L.wide?40:30):(L.wide?-40:-30))*u,y:d.y-56*u};
      for(let i=n-1;i>=0;i--){const col=i%3,row=Math.floor(i/3),x=base.x+(col-1)*20*u*(k==='R'?-1:1)+row*6*u,y=base.y-row*12*u;mgakPut(g,'mga_'+ty,x,y+Math.sin(st.t*3+i)*1*u,36*u,st.dpr,{flip:k==='R'});}}
    function drawQueue(g){const u=L.u;for(let i=2;i>=0;i--){const p=Q[(G2.qi+i)%Q.length],q=(i+1)/3,x=L.gateX+(i%2?10:-10)*u,y=L.gateY+30*u+(1-q)*(L.cy-L.gateY-70*u)*.6,s=(64-i*10)*u;
        g.globalAlpha=.9;mgakPut(g,p.ty==='wolf'?wkey(p,G2.left<T*.5):'mga_'+p.ty,x,y+Math.abs(Math.sin(st.t*5+i))*-3*u,s,st.dpr);g.globalAlpha=1;}}
    function drawCur(g){const c=G2.cur,u=L.u;if(!c)return;let x=L.cx,y=L.cy,s=L.rs,a=1;
      if(c.st==='in'){const q=Math.min(1,c.t/.32),e=1-Math.pow(1-q,2);y=L.gateY+60*u+(L.cy-(L.gateY+60*u))*e;s=L.rs*(.5+.5*e);}
      x+=c.dx||0;y+=c.dy||0;if(c.shake>0)x+=Math.sin(c.shake*50)*6*u;const bob=Math.abs(Math.sin(st.t*3))*3*u;
      g.fillStyle='rgba(30,20,10,.3)';g.beginPath();g.ellipse(x,y+s*.46,s*.34,s*.08,0,0,TAU);g.fill();
      if(c.st==='ready'&&G2.tip>0){const want=OPOL_DIR[c.ty];g.save();g.globalAlpha=.5+.3*Math.sin(st.t*5);const off=s*.75,dd={L:[-1,0],R:[1,0],D:[0,1],U:[0,-1]}[want];
        mgakTxt(g,{L:'⟵',R:'⟶',D:'↓',U:'↑'}[want],x+dd[0]*off,y+dd[1]*off*.8-10*u,44*u,'#fff36a',{lw:5});g.restore();}
      const hide=c.ty==='wolf'&&c.blink&&Math.sin(st.t*2.6+c.ph)<-.25;mgakPut(g,hide?'mga_'+c.as:c.key,x,y-bob,s,st.dpr);}
    function drawLeaving(g){const u=L.u;for(const c of G2.leaving){const q=Math.min(1,c.t/.55),d=L.D[c.dir];let tx=d.x,ty=d.y-40*u;if(c.dir==='U'){tx=L.gateX;ty=L.gateY+20*u;}
      const x=L.cx+(tx-L.cx)*q,y=L.cy+(ty-L.cy)*q-Math.sin(q*Math.PI)*60*u,s=L.rs*(1-q*.62);
      if(c.ty==='wolf'&&!c.bad){mgakPut(g,'wolf',x,y,s*.8,st.dpr,{flip:false,rot:q*6});continue;}
      if(c.bad){mgakPut(g,'wolf',x,y,s*.8,st.dpr,{flip:c.dir==='L'});continue;}mgakPut(g,c.key,x,y,s,st.dpr,{flip:c.dir==='L'});}}
    function drawThief(g){const th=G2.thief;if(!th)return;const u=L.u,q=th.t/2.4,x=th.x0+th.vx*q*L.W*1.15,y=th.y0+Math.abs(Math.sin(th.t*16))*-10*u+q*60*u;th.x=x;th.y=y;
      mgakPut(g,'wolf',x,y,74*u,st.dpr,{flip:th.vx<0});mgakPut(g,'mga_hen',x+th.vx*30*u,y-6*u,34*u,st.dpr,{flip:th.vx<0,rot:Math.sin(th.t*20)*.3});
      if(th.t<1.2)mgakTxt(g,Lg('Ко-ко-ко!','Cluck!'),x+th.vx*30*u,y-36*u,16*u,'#fff',{lw:4});}
    function drawHUD(g){const u=Math.min(L.u,1.25),W=L.W,top=st.top,bw=Math.min(W-150,330*u),bx=14,by=top+6;mgakPanel(g,bx-6,by-6,bw+12,94*u,{r:16});
      const f=G2.left/T,sec=Math.ceil(G2.left);mgakBar(g,bx+4,by+4,bw-8,26*u,f,f<.2?'#e8433a':'#5fae3a',Lg('Смотр ','Muster ')+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'));
      const hy=by+52*u,tier=opolTier(G2.score);mgakPut(g,'mga_strel',bx+20*u,hy,30*u,st.dpr);mgakTxt(g,String(G2.score),bx+40*u,hy,22*u,'#fff3c8',{al:'left',lw:4});
      const nxt=OPOL.TIERS[Math.min(2,tier)],pc=opolPc(OPOL.COIN[tier]);mgakPut(g,'coin',bx+bw-90*u,hy,26*u,st.dpr);mgakTxt(g,'+'+pc+' %',bx+bw-74*u,hy,18*u,OPOL.COIN[tier]?'#ffe066':'#e8dcc0',{al:'left',lw:4});
      if(tier<3){const prv=tier?OPOL.TIERS[tier-1]:0;mgakBar(g,bx+70*u,hy-6*u,bw-176*u,12*u,(G2.score-prv)/(nxt-prv),'#f0c040');}
      if(G2.combo>=2)mgakTxt(g,Lg('серия ','streak ')+G2.combo,W/2,by+108*u,18*u,'#ffe066',{lw:4});}
    function drawVoevoda(g){const u=L.u,x=L.wide?L.W/2-L.rs*1.9:L.W*.2,y=L.wide?L.D.D.y-10*u:L.cy+L.rs*1.32,s=(L.wide?96:84)*u;G2.vx=x;G2.vy=y-s*.6;
      g.fillStyle='rgba(30,20,10,.28)';g.beginPath();g.ellipse(x,y+s*.42,s*.3,s*.07,0,0,TAU);g.fill();
      if(G2.panic>0){const j=Math.abs(Math.sin(st.t*14))*8*u;mgakPut(g,'voevoda',x+Math.sin(st.t*30)*3*u,y-j,s,st.dpr);
        for(const sd of[-1,1]){g.save();g.translate(x+sd*s*.3,y-s*.42-j);g.rotate(sd*.5);ell(g,0,0,7*u,7*u,'#f4c9a3',{lw:1.5});g.restore();}
        mgakTxt(g,'!!',x+s*.36,y-s*.62-j,26*u,'#ff6a4a',{lw:4});return;}
      mgakPut(g,'voevoda',x,y,s,st.dpr);}
    function bubble(g,x,y,txt,px,right){const u=L.u;g.font='700 '+Math.round(px)+'px '+MGAK.F;const lines=mgakWrap(g,txt,px,Math.min(250*u,L.W*.6),700),tw=Math.max(...lines.map(l=>g.measureText(l).width))+24*u,th=lines.length*px*1.25+16*u;
      let bx=Math.max(8,Math.min(L.W-tw-8,x-(right?tw*.15:tw*.85))),by=y-th;g.save();g.fillStyle='rgba(30,16,4,.25)';mgakRR(g,bx+2,by+4,tw,th,14*u);g.fill();g.fillStyle='#fffaf0';mgakRR(g,bx,by,tw,th,14*u);g.fill();g.strokeStyle='#3a2410';g.lineWidth=2;g.stroke();
      g.beginPath();g.moveTo(x-8*u,by+th-1);g.lineTo(x,by+th+14*u);g.lineTo(x+8*u,by+th-1);g.closePath();g.fill();g.stroke();g.fillStyle='#fffaf0';g.fillRect(x-7*u,by+th-3,14*u,4);g.restore();
      lines.forEach((l,i)=>mgakTxt(g,l,bx+tw/2,by+8*u+px*.62+i*px*1.25,px,'#3a2410',{ol:false,w:700}));}
    st.draw=function(g){if(bg)g.drawImage(bg,0,0,L.W,L.H);drawVoevoda(g);drawCrowd(g,'L','strel');drawCrowd(g,'R','push');drawCrowd(g,'D','znah');
      if(G2.ph==='play'||G2.ph==='intro')drawQueue(g);for(const k of DIRS)drawSign(g,k);drawLeaving(g);drawCur(g);drawThief(g);drawHUD(g);
      if(G2.panic>0&&G2.vsay){bubble(g,G2.vx+8*L.u,G2.vy,G2.vsay,Math.min(16*L.u,19),1);}
      else if(G2.ph==='play'&&G2.cur&&G2.cur.st==='ready'&&G2.cur.ty==='wolf'&&!G2.seenTell[G2.cur.tell]){const T2={tail:Lg('Глянь — хвост из-под кафтана! Это волк — гони вверх'+(st.pc?' (↑)':'')+'!','Look — a tail under the kaftan! A wolf — swipe up'+(st.pc?' (↑)':'')+'!'),
          ears:Lg('Уши из-под шапки торчат! Волк — гони вверх'+(st.pc?' (↑)':'')+'!','Ears poking out of the hat! A wolf — swipe up'+(st.pc?' (↑)':'')+'!'),paws:Lg('Лапы-то с когтями! Волк — гони вверх'+(st.pc?' (↑)':'')+'!','Clawed paws! A wolf — swipe up'+(st.pc?' (↑)':'')+'!'),
          fangs:Lg('Улыбка-то с клыками! Волк — гони вверх'+(st.pc?' (↑)':'')+'!','A grin with fangs! A wolf — swipe up'+(st.pc?' (↑)':'')+'!'),claws:Lg('Кафтан когтями подран! Волк — гони вверх'+(st.pc?' (↑)':'')+'!','Claw marks on the kaftan! A wolf — swipe up'+(st.pc?' (↑)':'')+'!')};
        bubble(g,G2.vx+8*L.u,G2.vy,T2[G2.cur.tell],Math.min(16*L.u,19),1);}
      else if(G2.ph==='play'&&G2.tip>0&&G2.cur&&G2.cur.st==='ready'&&G2.cur.ty!=='wolf'){const u=L.u,c=G2.cur,t=c.ty==='wolf'?Lg('Глянь — хвост! Это волк! Гони вверх, за ворота!','Look — a tail! It’s a wolf! Swipe up, out the gate!'):st.pc&&!G2.kbd?Lg('Жми стрелки ← → ↓ ↑ — куда отправить! ','Press the arrow keys ← → ↓ ↑ to send them! ')+(c.ty==='strel'?Lg('Стрельца — ←','Archer — ←'):c.ty==='push'?Lg('Пушкаря — →','Gunner — →'):Lg('Знахаря — ↓','Healer — ↓')):c.ty==='strel'?Lg('Стрельца — влево, к стрельцам!','Archer — left, to the archers!'):c.ty==='push'?Lg('Пушкаря — вправо, к пушкарям!','Gunner — right, to the gunners!'):Lg('Знахаря — вниз, к избе Яги!','Healer — down, to Yaga’s hut!');
        bubble(g,G2.vx+8*u,G2.vy,t,Math.min(16*u,19),1);}};
    // подсказки — на первых трёх ополченцах и на первом волке
    const _send=send;send=function(d){const c=G2.cur;_send(d);if(c&&!G2.cur&&G2.tip>0&&c.ty!=='wolf')G2.tip--;if(c&&!G2.cur&&c.ty==='wolf')G2.seenTell[c.tell]=1;};
    const intro={t0:0,title:Lg('Набор ополчения','Raise the Militia'),text:st.pc?Lg('Охотники идут в ополчение! Жми стрелки ← → ↓ ↑ — куда отправить: стрельца ←, пушкаря →, знахаря ↓ к избе Яги. Волк в кафтане — ↑, за ворота! Ищи приметы: хвост, уши из-под шапки, лапы, клыки, след когтей. Мышью тоже можно — смахни или нажми указатель.','Volunteers are coming! Press the arrow keys ← → ↓ ↑ to send them: archers ←, gunners →, healers ↓ to Yaga’s hut. A wolf in a kaftan — ↑, out the gate! Look for tells: a tail, ears under the hat, paws, fangs, claw marks. The mouse works too — drag or click a sign.'):Lg('Охотники идут в ополчение! Смахни стрельца влево, пушкаря вправо, знахаря вниз — к избе Яги. Волк в кафтане — вверх, за ворота! Ищи приметы: хвост, уши из-под шапки, лапы, клыки, след когтей. Можно и нажать на указатель.','Volunteers are coming! Swipe archers left, gunners right, healers down to Yaga’s hut. A wolf in a kaftan — swipe up, out the gate! Look for tells: a tail, ears under the hat, paws, fangs, claw marks. You can also tap the signs.'),
      pic:(g,x,y,s)=>{mgakPut(g,'mga_strel',x-s*.75,y+s*.05,s*.62,st.dpr);mgakPut(g,'mga_push',x-s*.25,y+s*.05,s*.62,st.dpr);mgakPut(g,'mga_znah',x+s*.25,y+s*.05,s*.62,st.dpr);mgakPut(g,'mga_w_strel_tail_1',x+s*.78,y+s*.05,s*.62,st.dpr);
        mgakTxt(g,'?',x+s*.78,y-s*.42,s*.26,'#ffe066',{lw:5});},
      onGo:()=>{G2.ph='play';next();}};
    if(/[?&]mgdbg/.test(location.search)){window.__mga=G2;window.__mgs=st;window.__mgL=()=>L;}   // стенд: состояние игры для проверок
    st.over=function(g){if(G2.ph==='intro')mgakIntro(g,st,intro);mgakFinDraw(g,st);};
  }});
