'use strict';
/* OB:MGA №2 «Починка частокола» (kind 'buff'). После поражения: веди бревно от кучи к дыре в частоколе, пока нечисть греется у костра.
   Каждая закрытая дыра — +½ жизни ворот, вверх до +2 (округление вверх: и одна дыра что-то даёт). Широкая дыра — 2 бревна.
   Итог: host.done({score: закрыто дыр, tier, extra:{buf:{k:'chast', lives}}}); «Позвать плотников» (ролик) — сразу +3 ❤ без игры.
   Эффект на бой (S.mgBuf) применяет оболочка MG0: +lives жизней ворот в следующем бою кампании (Обычный/⚔/🔥, не осада/неделя/турнир/Застава дня). */
const CHAST={T:32,LIVES:2,AD_LIVES:3};
function chastPlan(o){const r=mulberry((o.seed>>>0)^0x51ca),lv=o.lvl||0,n=lv>=8?7:lv>=4?6:5,dbl=lv>=8?3:lv>=4?2:1,H=[];for(let i=0;i<n;i++)H.push({w:i<dbl?2:1});
  for(let i=H.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[H[i],H[j]]=[H[j],H[i]];}return H;}
function chastLives(closed){return Math.min(CHAST.LIVES,Math.ceil(closed*.5));}
function chastTier(closed,n){return closed>=n?3:chastLives(closed)>=2?2:closed>0?1:0;}
/* бревно-кол стоймя: низ (x,yb), ширина w, высота h */
function chastStake(g,x,yb,w,h,v){const top=yb-h,tip=w*.75;g.save();
  g.fillStyle='rgba(30,16,4,.28)';g.beginPath();g.ellipse(x+w*.15,yb,w*.7,w*.2,0,0,TAU);g.fill();
  g.beginPath();g.moveTo(x-w/2,yb);g.lineTo(x-w/2,top+tip);g.lineTo(x,top);g.lineTo(x+w/2,top+tip);g.lineTo(x+w/2,yb);g.closePath();
  const gr=g.createLinearGradient(x-w/2,0,x+w/2,0);gr.addColorStop(0,'#6a4020');gr.addColorStop(.3,v%2?'#b07a44':'#a8703c');gr.addColorStop(.62,'#8a5a2e');gr.addColorStop(1,'#4e2e14');g.fillStyle=gr;g.fill();
  g.save();g.clip();g.strokeStyle='rgba(50,26,8,.45)';g.lineWidth=1.1;for(let i=0;i<3;i++){const xx=x-w*.3+i*w*.28+((v*7+i*3)%5-2)*.6;g.beginPath();g.moveTo(xx,yb);g.bezierCurveTo(xx+1.5,yb-h*.4,xx-1.5,yb-h*.6,xx+.5,top+tip+4);g.stroke();}
  g.fillStyle='rgba(255,230,180,.16)';g.fillRect(x-w*.32,top,w*.16,h);
  const ky=yb-h*(.35+((v*13)%5)*.08);g.beginPath();g.ellipse(x+w*.08,ky,w*.14,w*.2,0,0,TAU);g.fillStyle='#5a3418';g.fill();g.strokeStyle='#3a2410';g.lineWidth=1;g.stroke();
  g.beginPath();g.moveTo(x,top);g.lineTo(x+w/2,top+tip);g.lineTo(x+w*.1,top+tip*.9);g.closePath();g.fillStyle='#e0b47a';g.fill();g.restore();
  g.beginPath();g.moveTo(x-w/2,yb);g.lineTo(x-w/2,top+tip);g.lineTo(x,top);g.lineTo(x+w/2,top+tip);g.lineTo(x+w/2,yb);g.lineWidth=2;g.strokeStyle='#3a2410';g.stroke();g.restore();}
/* обломок (пенёк кола) в дыре */
function chastStump(g,x,yb,w,h){g.save();g.beginPath();g.moveTo(x-w/2,yb);g.lineTo(x-w/2,yb-h);g.lineTo(x-w*.2,yb-h*1.25);g.lineTo(x,yb-h*.85);g.lineTo(x+w*.25,yb-h*1.4);g.lineTo(x+w/2,yb-h*.95);g.lineTo(x+w/2,yb);g.closePath();
  const gr=g.createLinearGradient(x-w/2,0,x+w/2,0);gr.addColorStop(0,'#5a3418');gr.addColorStop(.4,'#9a6434');gr.addColorStop(1,'#4a2a12');g.fillStyle=gr;g.fill();g.lineWidth=2;g.strokeStyle='#3a2410';g.stroke();
  g.fillStyle='#e8c08a';g.beginPath();g.moveTo(x-w*.2,yb-h*1.25);g.lineTo(x,yb-h*.85);g.lineTo(x+w*.25,yb-h*1.4);g.lineTo(x+w*.15,yb-h*1.05);g.closePath();g.fill();g.restore();}
/* бревно торцом к нам (поленница): центр торца (x,y), радиус r */
function chastLogEnd(g,x,y,r,v){g.save();const dx=-r*1.5,dy=-r*.75;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+dx,y-r+dy);g.arc(x+dx,y+dy,r,-Math.PI/2,Math.PI/2,true);g.lineTo(x,y+r);g.closePath();
  const gr=g.createLinearGradient(0,y-r+dy,0,y+r);gr.addColorStop(0,'#b07a44');gr.addColorStop(1,'#4e2e14');g.fillStyle=gr;g.fill();g.lineWidth=2;g.strokeStyle='#3a2410';g.stroke();
  g.beginPath();g.arc(x,y,r,0,TAU);const fg=g.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);fg.addColorStop(0,'#f4d8a4');fg.addColorStop(1,'#d8a868');g.fillStyle=fg;g.fill();g.lineWidth=2.4;g.strokeStyle='#5a3418';g.stroke();
  g.strokeStyle='rgba(150,95,45,.75)';g.lineWidth=1;for(const k of[.35,.62,.85]){g.beginPath();g.arc(x+(v%3-1)*.6,y,r*k,0,TAU);g.stroke();}
  g.beginPath();g.moveTo(x,y);g.lineTo(x+r*.7,y-r*.5);g.strokeStyle='rgba(90,52,24,.5)';g.stroke();g.restore();}
MG_REG({id:'chast',n:{ru:'Починка частокола',en:'Mend the Palisade'},icon:'b_wall',kind:'buff',
  open:()=>{try{return !!S.stars['0-5'];}catch(e){return false;}},
  bot(o){o=o||{};const q=mgakSkill(o),H=chastPlan({seed:o.seed||1,lvl:o.lvl||0}),T=CHAST.T*(o.calm?1.35:1);let t=0,closed=0;
    for(const h of H){t+=h.w*(5.5-4.2*q)*(.8+Math.random()*.4);if(t>T)break;closed++;}return {score:closed,tier:chastTier(closed,H.length),lives:chastLives(closed)};},
  run(host,o){
    const st=mgakStage(host,o),H=chastPlan(o),T=CHAST.T*mgakCalmK(o),need=H.reduce((a,h)=>a+h.w,0);
    const G2={ph:'intro',t:0,left:T,closed:0,placed:0,pile:need+2,hold:null,anim:[],hint:1,end:false,hearts:0,heartsShown:0,fireT:0,introT:0};
    const lvl=o.lvl||0,FOES=lvl>=6?['lesh','upyr','wolf','skel']:lvl>=3?['upyr','wolf','muh','lesh']:['upyr','wolf','muh'];
    let L={},bg=null,fg=null;
    /* раскладка: частокол поперёк экрана, костёр нечисти за ним, куча брёвен внизу слева */
    st.onFit=function(){const W=st.W,Hh=st.H,u=st.u,wide=st.wide;
      const yb=wide?Hh*.72:Hh*.64,sh=(wide?168:150)*u,sw=Math.max(30,Math.min(46,W/(wide?26:11.5))),gap=sw*1.04;
      const n=Math.floor((W+sw)/gap)+1,x0=(W-(n-1)*gap)/2;const slots=[];for(let i=0;i<n;i++)slots.push(x0+i*gap);
      // дыры — равномерно по частоколу, не у самых краёв
      const span=n-2,holes=[],free=span-H.reduce((a,h)=>a+h.w,0),gp=Math.max(1,Math.floor(free/(H.length+1)));let pos=1+Math.max(0,Math.floor((free-gp*(H.length-1))/2));
      placed.clear();for(let k=0;k<H.length;k++){const h=H[k],ids=[];for(let j=0;j<h.w;j++)ids.push(Math.min(n-2,pos+j));const old=G2.holes&&G2.holes[k],hh={ids,w:h.w,fill:old?old.fill:0,done:old?old.done:false,glowT:0};for(let j=0;j<(old?old.put:0);j++)placed.add(ids[j]);hh.put=old?old.put:0;holes.push(hh);pos+=h.w+gp;}
      G2.holes=holes;
      const fireX=wide?W*.5:W*.54,fireY=wide?Hh*.35:Hh*.37;
      const pileX=wide?Math.max(130*u,W*.2):W*.36,pileY=wide?Hh*.9:Hh*.87;
      L={W,H:Hh,u,yb,sh,sw,gap,slots,n,fireX,fireY,pileX,pileY,pileW:Math.min(170*u,W*.42),logD:15*u,wide};
      // фон (небо, холмы, лес, поляна) — один раз
      const dpr=st.dpr;bg=mkCanvas(W*dpr,Hh*dpr);const g=bg.getContext('2d');g.scale(dpr,dpr);
      mgakSky(g,W,yb,['#3d7fd0','#8cc4ef','#ffe2b0','#ffc890']);
      const sx=wide?W*.8:W*.78,sy=Hh*.12;const sg=g.createRadialGradient(sx,sy,0,sx,sy,110*u);sg.addColorStop(0,'rgba(255,248,210,1)');sg.addColorStop(.18,'rgba(255,236,170,.95)');sg.addColorStop(1,'rgba(255,210,140,0)');g.fillStyle=sg;g.fillRect(sx-120*u,sy-120*u,240*u,240*u);
      g.drawImage(fxCloud(),W*.08,Hh*.06,110*u,70*u);g.globalAlpha=.8;g.drawImage(fxCloud(),W*.5,Hh*.03,80*u,50*u);g.globalAlpha=1;
      const hor=fireY-34*u;
      mgakHills(g,W,hor-30*u,40*u,'#6f9ab8',7,'#9bbcd4');mgakForest(g,W,hor-6*u,64*u,'#3f6e5a',3,'#56876c');mgakHills(g,W,hor+6*u,14*u,'#4f8a3e',11,'#78b04e');
      mgakForest(g,W,hor+8*u,52*u,'#2d5a34',5,'#3f7a44');
      const mg=g.createLinearGradient(0,hor,0,yb);mg.addColorStop(0,'#7cbf4e');mg.addColorStop(1,'#5a9a38');g.fillStyle=mg;g.fillRect(0,hor+12*u,W,yb-hor);
      mgakGrassTufts(g,0,W,hor+20*u,yb-sh*.2,'rgba(40,90,30,.5)',9,Math.round(W/9));
      // тропа к лесу
      g.fillStyle='rgba(190,150,90,.55)';g.beginPath();g.moveTo(W*.46,yb);g.quadraticCurveTo(W*.5,hor+60*u,fireX-10*u,hor+26*u);g.lineTo(fireX+14*u,hor+26*u);g.quadraticCurveTo(W*.6,hor+60*u,W*.62,yb);g.closePath();g.fill();
      // передний план: двор у частокола
      fg=mkCanvas(W*dpr,Hh*dpr);const f=fg.getContext('2d');f.scale(dpr,dpr);const yg=yb-6*u;
      const dg=f.createLinearGradient(0,yg,0,Hh);dg.addColorStop(0,'#a07a4a');dg.addColorStop(.25,'#8fb048');dg.addColorStop(1,'#5f8a2e');f.fillStyle=dg;f.fillRect(0,yg,W,Hh-yg);
      f.fillStyle='rgba(60,36,14,.35)';f.fillRect(0,yg,W,5*u);
      mgakGrassTufts(f,0,W,yg+24*u,Hh,'rgba(40,80,20,.55)',21,Math.round(W/6));
      for(let i=0;i<6;i++){const r=mulberry(31+i);mgakPut(f,'d_shroom',W*(.08+r()*.84),yg+40*u+r()*(Hh-yg-60*u),22*u,dpr,{a:.95});}
      // колода с топором и щепа
      const kx=wide?W*.8:W*.8,ky=wide?Hh*.9:Hh*.9;f.fillStyle='rgba(30,16,4,.3)';f.beginPath();f.ellipse(kx,ky+8*u,40*u,10*u,0,0,TAU);f.fill();
      f.save();const kg=f.createLinearGradient(kx-30*u,0,kx+30*u,0);kg.addColorStop(0,'#5a3418');kg.addColorStop(.4,'#9a6434');kg.addColorStop(1,'#4a2a12');f.fillStyle=kg;mgakRR(f,kx-30*u,ky-30*u,60*u,38*u,6*u);f.fill();f.lineWidth=2;f.strokeStyle='#3a2410';f.stroke();
      f.beginPath();f.ellipse(kx,ky-30*u,30*u,9*u,0,0,TAU);f.fillStyle='#e8c890';f.fill();f.stroke();f.strokeStyle='rgba(150,95,45,.7)';f.lineWidth=1;for(const k of[.4,.7]){f.beginPath();f.ellipse(kx,ky-30*u,30*u*k,9*u*k,0,0,TAU);f.stroke();}f.restore();
      mgakPut(f,'axe',kx+6*u,ky-52*u,54*u,dpr,{rot:.5});
      for(let i=0;i<9;i++){const r=mulberry(77+i);f.save();f.translate(kx+(r()-.5)*120*u,ky+4*u+r()*20*u);f.rotate(r()*3);f.fillStyle=r()<.5?'#e0b47a':'#c8945a';f.fillRect(-5*u,-2*u,10*u,4*u);f.restore();}};
    const placed=new Set();   // слоты, где уже стоит новое бревно
    st.fit();
    const holeX=h=>(L.slots[h.ids[0]]+L.slots[h.ids[h.ids.length-1]])/2;
    const slotFree=h=>h.ids[h.fill];
    /* касания */
    const nearHole=(x,y)=>{let best=null,bd=1e9;for(const h of G2.holes){if(h.done||h.fill>=h.w)continue;const dx=Math.abs(x-holeX(h)),dy=y>L.yb-L.sh-80*L.u&&y<L.yb+60*L.u?0:Math.abs(y-(L.yb-L.sh/2));const d=dx+dy*.6;if(d<bd){bd=d;best=h;}}
      return best&&bd<Math.max(90*L.u,L.gap*2.2)?best:null;};
    const onPile=p=>{const r=Math.min(L.pileW/8.6,17*L.u);return Math.abs(p.x-(L.pileX-r*.5))<r*5+24&&p.y>L.pileY-r*7.5&&p.y<L.pileY+r*2.4;};
    st.down=p=>{if(G2.ph!=='play'||G2.hold||G2.pile<=0)return;if(onPile(p)){G2.hold={x:p.x,y:p.y,px:p.x,vx:0,t:0,id:p.id};G2.pile--;G2.hint=0;try{SND.click();}catch(e){}mgakBurst(st,'chip',p.x,p.y,5,{col:'#c89058',v:120,s:7});}};
    st.move=p=>{const h=G2.hold;if(!h)return;h.vx=h.vx*.6+(p.x-h.x)*.4;h.x=p.x;h.y=p.y;};
    st.up=p=>{const h=G2.hold;if(!h)return;G2.hold=null;const t=nearHole(h.x,h.y-L.sh*.3);
      if(t){const i=slotFree(t);t.fill++;const tx=L.slots[i];G2.anim.push({x0:h.x,y0:h.y-L.sh*.35,x:tx,t:0,dur:.28,hole:t,slot:i});}
      else{G2.pile++;G2.anim.push({back:1,x0:h.x,y0:h.y,t:0,dur:.35});}};
    const land=a=>{placed.add(a.slot);a.hole.put=(a.hole.put||0)+1;G2.placed++;st.shake=6;try{SND.build();}catch(e){}const x=a.x,y=L.yb;mgakPuff(st,x,y-4,46*L.u,5);mgakBurst(st,'chip',x,y-L.sh*.6,8,{col:'#d8a060',v:220,s:8,up:120});
      G2.jumpT=.4;const SAY=[Lg('Ладно!','Nice!'),Lg('Крепко!','Solid!'),Lg('Живей!','Faster!'),Lg('Так её!','That’s it!')];G2.say=SAY[G2.placed%SAY.length];G2.sayT=1.2;
      const h=a.hole;if(!h.done&&h.put>=h.w){h.done=true;h.glowT=1;G2.closed++;mgakBurst(st,'spark',holeX(h),L.yb-L.sh*.55,14,{col:'#ffe066',v:260,gr:0,s:9});
        mgakPop(st,Lg('Залатано!','Patched!'),holeX(h),L.yb-L.sh-20*L.u,24*L.u,'#ffe066');const hv=chastLives(G2.closed);
        if(hv>G2.hearts){G2.hearts=hv;mgakFly(st,'heart',holeX(h),L.yb-L.sh*.5,G2.hx||60,G2.hy||80,34*L.u,()=>{G2.heartsShown=G2.hearts;try{SND.star(G2.hearts-1);}catch(e){}});}
        if(G2.holes.every(z=>z.done))finish(true);}};
    function finish(all){if(G2.end)return;G2.end=true;G2.ph='end';G2.hold=null;const lives=chastLives(G2.closed),tier=chastTier(G2.closed,G2.holes.length);G2.stand=1;
      mgakFinale(st,{good:tier>=2,title:all?Lg('Частокол как новый!','Good as new!'):G2.closed?Lg('Пошли! Что успел — то успел','Here they come!'):Lg('Пошли!','Here they come!'),
        sub:lives?(o.train?Lg('Тренировка: ','Practice: '):'')+Lg('+'+lives+' '+plw(lives,'жизнь','жизни','жизней','life','lives')+' ворот в следующем бою','+'+lives+' gate '+plw(lives,'жизнь','жизни','жизней','life','lives')+' in your next battle'):Lg('Ни одной дыры не залатано — в другой раз!','No holes patched — next time!'),
        ico:lives?(g,x,y,s,t)=>{for(let i=0;i<lives;i++)mgakPut(g,'heart',x+(i-(lives-1)/2)*s*.9,y+Math.sin(t*4+i)*3,s,st.dpr);}:null,
        dur:2.8,then:()=>host.done({score:G2.closed,tier,extra:o.train?{}:{buf:{k:'chast',lives}}})});}
    st.update=function(dt){G2.fireT+=dt;if(G2.ph==='play'){G2.left-=dt;if(G2.left<=0){G2.left=0;finish(false);}}
      if(G2.hold)G2.hold.t+=dt;if(G2.jumpT>0)G2.jumpT-=dt;if(G2.sayT>0)G2.sayT-=dt;for(let i=G2.anim.length-1;i>=0;i--){const a=G2.anim[i];a.t+=dt;if(a.t>=a.dur){G2.anim.splice(i,1);if(!a.back)land(a);}}
      for(const h of G2.holes)if(h.glowT>0)h.glowT-=dt*.8;};
    /* рисование */
    const flame=mgakFlame;
    function drawCamp(g){const u=L.u,fx=L.fireX,fy=L.fireY,t=G2.fireT;
      // поленья костра
      g.save();g.fillStyle='rgba(30,20,10,.3)';g.beginPath();g.ellipse(fx,fy+4*u,30*u,8*u,0,0,TAU);g.fill();chastLogH(g,fx-6*u,fy+2*u,40*u,10*u);g.save();g.translate(fx+4*u,fy);g.rotate(-.5);chastLogH(g,0,0,36*u,9*u);g.restore();g.restore();
      flame(g,fx,fy,19*u,t);
      // дым и искры
      if(!st.calm&&Math.random()<.18)st.parts.push({k:'dot',x:fx+(Math.random()-.5)*10*u,y:fy-14*u,vx:(Math.random()-.5)*20,vy:-70-Math.random()*50,t:0,dur:1+Math.random()*.6,s:2*u,col:'#ffd27a',gr:0});
      g.globalAlpha=.35;for(let i=0;i<3;i++){const q=((t*.25+i/3)%1),s=(26+q*50)*u;g.drawImage(fxCloud(),fx-s/2+Math.sin(t+i)*8*u+q*30*u,fy-30*u-q*120*u-s/2,s,s);}g.globalAlpha=1;
      // нечисть вокруг костра
      const N=FOES.length,stand=G2.stand||(G2.ph==='play'&&G2.left<T*.25)?1:0;
      for(let i=0;i<N;i++){const side=i%2?1:-1,rk=Math.floor(i/2),x=fx+side*(56+rk*42)*u,y=fy+(rk?-12:6)*u,sz=(rk?50:60)*u;
        const walk=G2.end?Math.min(1,(st.t-(st.fin?st.fin.t0:st.t))*.5):0,bob=Math.abs(Math.sin(t*(stand?6:2.2)+i))*(stand?5:2)*u;
        const yy=y-bob+walk*80*u,xx=x+(fx-x)*walk*.2;g.fillStyle='rgba(20,30,10,.3)';g.beginPath();g.ellipse(xx,y+sz*.36+walk*80*u,sz*.36,sz*.1,0,0,TAU);g.fill();
        mgakPut(g,FOES[i],xx,yy,sz*(1+walk*.4),st.dpr,{flip:side<0});
        if(stand&&!G2.end&&Math.sin(t*2+i*2)>.3&&i<2){mgakTxt(g,'!',xx+side*-4*u,yy-sz*.75,22*u,'#ffe066',{lw:4});}}
      // реплика
      if(G2.ph==='play'){const say=G2.left<T*.25?Lg('Скоро пойдём!','Almost time!'):Lg('Ух, тепло!','Nice and warm!'),ph=(t%7)/7;if(ph<.45||G2.left<T*.25){const bx=fx+52*u,by=fy-58*u;g.save();g.globalAlpha=.94;g.fillStyle='#fff';const tw=Math.max(80*u,say.length*8.4*u);mgakRR(g,bx-tw/2,by-15*u,tw,30*u,14*u);g.fill();g.beginPath();g.moveTo(bx-10*u,by+13*u);g.lineTo(bx-20*u,by+26*u);g.lineTo(bx,by+14*u);g.fill();g.restore();mgakTxt(g,say,bx,by,14*u,'#3a2410',{ol:false,mw:tw-10});}}}
    function drawFence(g){const {yb,sh,sw,slots}=L,u=L.u,open=new Set();for(const h of G2.holes)for(const i of h.ids)open.add(i);
      // поперечины
      for(const k of[.3,.72]){const y=yb-sh*k;g.fillStyle='#6a4020';mgakRR(g,-10,y-6*u,L.W+20,12*u,5*u);g.fill();g.fillStyle='rgba(255,220,160,.25)';g.fillRect(-10,y-5*u,L.W+20,3*u);g.strokeStyle='#3a2410';g.lineWidth=2;g.stroke();}
      for(let i=0;i<slots.length;i++){const x=slots[i];if(open.has(i)&&!placed.has(i)){continue;}const hh=sh*(.93+((i*37)%7)*.012);chastStake(g,x,yb,sw,hh,i);
        if(!open.has(i)||placed.has(i)){g.fillStyle='#4a2c14';for(const k of[.3,.72]){g.beginPath();g.arc(x,yb-sh*k,2.4*u,0,TAU);g.fill();}}}
      // дыры: обломки + подсветка места
      const tgt=G2.hold?nearHole(G2.hold.x,G2.hold.y-L.sh*.3):null;
      for(const h of G2.holes){for(const i of h.ids){if(placed.has(i))continue;chastStump(g,slots[i],yb,sw,sh*.18);}
        if(h.done){if(h.glowT>0){g.save();g.globalAlpha=h.glowT;g.globalCompositeOperation='lighter';const gx=holeX(h),gg=g.createRadialGradient(gx,yb-sh*.5,0,gx,yb-sh*.5,sh*.7);gg.addColorStop(0,'rgba(255,230,120,.8)');gg.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=gg;g.fillRect(gx-sh,yb-sh*1.2,sh*2,sh*1.4);g.restore();}continue;}
        if(G2.ph!=='play'||h.fill>=h.w)continue;const i=slotFree(h);const x=slots[i],on=tgt===h,pul=.5+.5*Math.sin(st.t*5);
        g.save();g.globalAlpha=on?.95:.45+.3*pul;g.setLineDash([7*u,6*u]);g.lineWidth=3;g.strokeStyle=on?'#fff36a':'#ffe0a0';g.beginPath();g.moveTo(x-sw/2,yb-4);g.lineTo(x-sw/2,yb-sh*.93+sw*.75);g.lineTo(x,yb-sh*.93);g.lineTo(x+sw/2,yb-sh*.93+sw*.75);g.lineTo(x+sw/2,yb-4);g.stroke();g.setLineDash([]);
        if(on){g.globalCompositeOperation='lighter';const gg=g.createRadialGradient(x,yb-sh*.5,0,x,yb-sh*.5,sh*.6);gg.addColorStop(0,'rgba(255,240,140,.55)');gg.addColorStop(1,'rgba(255,220,100,0)');g.fillStyle=gg;g.fillRect(x-sh*.6,yb-sh*1.1,sh*1.2,sh*1.2);}g.restore();
        // стрелка над дырой
        const ay=yb-sh-18*u-Math.abs(Math.sin(st.t*4+h.ids[0]))*8*u;g.fillStyle=on?'#fff36a':'#ffd84a';g.strokeStyle='#5a3410';g.lineWidth=2.5;g.beginPath();g.moveTo(x-11*u,ay-12*u);g.lineTo(x+11*u,ay-12*u);g.lineTo(x,ay+2*u);g.closePath();g.fill();g.stroke();
        if(h.w>1){mgakTxt(g,h.fill+'/'+h.w,holeX(h),ay-24*u,15*u,'#fff',{lw:4});}}}
    function drawPile(g){const u=L.u,x=L.pileX,y=L.pileY,r=Math.min(L.pileW/8.6,17*u),d=r;const n=Math.min(G2.pile,10),rows=[4,3,2,1];
      g.fillStyle='rgba(30,16,4,.32)';g.beginPath();g.ellipse(x-r,y+r*.9,r*5.2,r*1.1,0,0,TAU);g.fill();let k=0;const P=[];
      for(let ri=0;ri<rows.length;ri++)for(let j=0;j<rows[ri];j++)P.push([x+(j-(rows[ri]-1)/2)*r*2.04,y-ri*r*1.76]);
      for(let i=0;i<n;i++)chastLogEnd(g,P[i][0],P[i][1],r,i);
      // подпись
      if(G2.ph==='play'){const pul=1+Math.sin(st.t*4)*.05;mgakTxt(g,Lg('Брёвна: ','Logs: ')+G2.pile,x,y+r*2.3,17*u*pul,'#fff3c8',{lw:4});}}
    function drawMik(g){const u=L.u,x=L.pileX+Math.min(L.pileW*.62,96*u)+(L.wide?20*u:0),y=L.pileY-8*u,j=G2.jumpT>0?Math.sin(G2.jumpT/.4*Math.PI)*14*u:0,b=Math.sin(st.t*2.4)*1.5*u;
      g.fillStyle='rgba(30,16,4,.3)';g.beginPath();g.ellipse(x,y+30*u,26*u,7*u,0,0,TAU);g.fill();mgakPut(g,'hp_mik',x,y-j+b,88*u,st.dpr,{flip:true});
      if(G2.sayT>0&&G2.say){const bx=x-6*u,by=y-70*u-j;g.save();g.globalAlpha=Math.min(1,G2.sayT*3);g.fillStyle='#fff';const tw=Math.max(70*u,G2.say.length*8.6*u);mgakRR(g,bx-tw/2,by-15*u,tw,30*u,14*u);g.fill();g.strokeStyle='rgba(58,36,16,.5)';g.lineWidth=1.5;g.stroke();g.beginPath();g.moveTo(bx,by+14*u);g.lineTo(bx+8*u,by+26*u);g.lineTo(bx+12*u,by+13*u);g.fill();g.restore();mgakTxt(g,G2.say,bx,by,14.5*u,'#3a2410',{ol:false,mw:tw-10});}}
    function drawHeld(g){const h=G2.hold;if(!h)return;const k=Math.min(1,h.t/.18),u=L.u,tilt=Math.max(-.35,Math.min(.35,h.vx*.02));g.save();g.translate(h.x,h.y-L.sh*.3*k);g.rotate(tilt+(1-k)*Math.PI/2);
      g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=12;g.shadowOffsetY=10;chastStake(g,0,L.sh*.45,L.sw,L.sh*.9,3);g.restore();
}
    function drawAnims(g){for(const a of G2.anim){const q=Math.min(1,a.t/a.dur),e=q*q;if(a.back){const x=a.x0+(L.pileX-a.x0)*e,y=a.y0+(L.pileY-a.y0)*e;g.save();g.translate(x,y);g.rotate(q*Math.PI/2);chastStake(g,0,L.sh*.45,L.sw,L.sh*.9,2);g.restore();continue;}
      const x=a.x0+(a.x-a.x0)*e,yb=a.y0+L.sh*.45+(L.yb-(a.y0+L.sh*.45))*e;chastStake(g,x,yb,L.sw,L.sh*.93,a.slot);}}
    function drawHUD(g){const u=Math.min(L.u,1.25),W=L.W,top=st.top;const bw=Math.min(W-150,330*u),bx=14,by=top+6;
      mgakPanel(g,bx-6,by-6,bw+12,(G2.ph==='play'?94:94)*u,{r:16});
      const f=G2.left/T,col=f<.25?'#e8433a':f<.5?'#f0a030':'#5fae3a',sec=Math.ceil(G2.left);mgakBar(g,bx+4,by+4,bw-8,26*u,f,col,(f<.25?Lg('Скоро пойдут! ','Coming soon! '):Lg('Нечисть греется ','Warming up '))+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'));
      // сердечки награды
      const hy=by+52*u;mgakTxt(g,Lg('В бой:','Next battle:'),bx+8,hy,16*u,MGAK.ink,{al:'left',ol:false});g.font='800 '+Math.round(16*u)+'px '+MGAK.F;const lx=bx+14+g.measureText(Lg('В бой:','Next battle:')).width;
      for(let i=0;i<CHAST.LIVES;i++){const x=lx+18*u+i*34*u;G2.hx=x;G2.hy=hy;mgakPut(g,i<G2.heartsShown?'heart':'heart',x,hy,30*u,st.dpr,{a:i<G2.heartsShown?1:.25});}
      mgakTxt(g,G2.closed+'/'+G2.holes.length,bx+bw-8,hy,18*u,'#fff3c8',{al:'right',lw:4});}
    function drawHint(g){if(!G2.hint||G2.ph!=='play'||G2.hold||G2.anim.length)return;const h=G2.holes.find(z=>z.fill<z.w);if(!h)return;const q=(st.t%2.2)/2.2,e=q<.15?0:q>.8?1:(q-.15)/.65,u=L.u;
      const x0=L.pileX,y0=L.pileY-10*u,x1=L.slots[slotFree(h)],y1=L.yb-L.sh*.3,x=x0+(x1-x0)*e,y=y0+(y1-y0)*e-Math.sin(e*Math.PI)*60*u;g.save();g.globalAlpha=q>.9?1-(q-.9)/.1:1;
      g.globalAlpha*=.55;g.save();g.translate(x,y-L.sh*.3*e);g.rotate((1-e)*Math.PI/2);chastStake(g,0,L.sh*.45,L.sw,L.sh*.9,4);g.restore();g.globalAlpha=q>.9?1-(q-.9)/.1:1;
      mgakHand(g,x,y,u);g.restore();
      mgakTxt(g,(st.pc?Lg('Тяни бревно мышкой к дыре','Drag a log to a gap with the mouse'):Lg('Тяни бревно к дыре','Drag a log to a gap')),L.W/2,L.pileY-Math.min(L.pileW/8.6,17*L.u)*8.5,20*Math.min(L.u,1.2),'#fff',{lw:5});}
    st.draw=function(g){if(bg)g.drawImage(bg,0,0,L.W,L.H);drawCamp(g);drawFence(g);      if(fg){const y0=L.yb-6*L.u;g.drawImage(fg,0,y0*st.dpr,L.W*st.dpr,(L.H-y0)*st.dpr,0,y0,L.W,L.H-y0);}
      drawPile(g);drawMik(g);drawAnims(g);drawHeld(g);drawHint(g);drawHUD(g);};
    const intro={t0:0,title:Lg('Починка частокола','Mend the Palisade'),text:Lg('Нечисть прорвала частокол и греется у костра. Тяни брёвна из кучи к дырам, пока не пошли! Каждая дыра — пол-жизни ворот в следующем бою (до +2).','The monsters broke through and are warming up by the fire. Drag logs from the pile into the gaps before they come back! Each gap patched = half a gate life in your next battle (up to +2).'),
      pic:(g,x,y,s)=>{for(let i=-2;i<=2;i++){if(i===0)continue;chastStake(g,x+i*s*.22,y+s*.45,s*.2,s*.85,i+3);}chastStump(g,x,y+s*.45,s*.2,s*.16);g.save();g.globalAlpha=.85;g.setLineDash([5,4]);g.strokeStyle='#e8a020';g.lineWidth=3;g.strokeRect(x-s*.1,y-s*.35,s*.2,s*.78);g.restore();mgakPut(g,'heart',x+s*.55,y-s*.25,s*.36,st.dpr);},
      onGo:()=>{G2.ph='play';},
      ad:(!o.train&&host.adOk&&host.adOk())?{label:Lg('Плотники за рекламу: +3','Carpenters for an ad: +3'),fn:()=>{host.ad('plot').then(ok=>{if(!ok||G2.end)return;G2.end=true;G2.ph='end';
        mgakFinale(st,{good:1,title:Lg('Плотники всё починили!','The carpenters fixed it!'),sub:Lg('+3 жизни ворот в следующем бою','+3 gate lives in your next battle'),ico:(g,x,y,s,t)=>{for(let i=0;i<3;i++)mgakPut(g,'heart',x+(i-1)*s*.9,y+Math.sin(t*4+i)*3,s,st.dpr);},
          then:()=>host.done({score:0,tier:3,extra:{buf:{k:'chast',lives:CHAST.AD_LIVES},ad:'plot'}})});});}}:null};
    if(/[?&]mgdbg/.test(location.search)){window.__mga=G2;window.__mgs=st;window.__mgL=()=>L;}   // стенд: состояние игры для проверок
    st.over=function(g){if(G2.ph==='intro')mgakIntro(g,st,intro);mgakFinDraw(g,st);};
  }});
