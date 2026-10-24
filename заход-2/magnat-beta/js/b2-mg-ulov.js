/* b2-mg-ulov.js — MG2: «🐟 Улов» — игра края Сахалин (sah; формат KRAI). Договор — шапка js/b2-mg-core.js; опись — js/b2-mg2.js, id 'ulov'.
   40 с: сейнер ходит вдоль берега сам; нажмите — сеть падает прямо вниз и берёт первую, кого заденет. Горбуша 2 кг, кета 4 кг, краб 3 кг;
   медуза — «обжёгся», минус 2 с; сапог — 0 кг и смех на палубе. Рекорд — килограммы. */
(function(root){'use strict';
if(!root.MG)return;
const BY=96,SEA=130,BOT=486;
const K={gor:[2,'#c99aa4',40,['Горбуша','Pink salmon']],keta:[4,'#9fb3c8',52,['Кета','Chum salmon']],crab:[3,'#d0503a',36,['Краб','Crab']],jel:[0,'rgba(240,150,200,.85)',32,['Медуза','Jellyfish']],boot:[0,'#6b4a2e',26,['Сапог','A boot']]};
const BOOT=[['«Сапог 42-го. Второй завтра поймаем»','“A size 42 boot. We’ll catch the other one tomorrow”'],['«Сапог! Капитан его искал с 2019-го»','“A boot! The captain’s been looking for it since 2019”']];
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null;
  const R=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
  function spawn(){const r=Math.random(),k=r<.42?'gor':r<.6?'keta':r<.72?'crab':r<.9?'jel':'boot',d=Math.random()<.5?1:-1;
    const y=k==='crab'?R(456,470):k==='jel'?R(170,330):k==='boot'?R(380,440):R(170,420);
    s.f.push({k,x:d>0?-30:390,y,vx:d*(k==='crab'?R(18,28):k==='jel'?R(20,32):k==='keta'?R(70,100):R(45,75))*(1+Math.min(.6,S.t/50)),ph:Math.random()*6});}
  function cast(){if(s.n)return;s.n={x:s.bx,y:BY+20,dn:1,got:null};sh.snd('tap');}
  function grab(f){const k=K[f.k];s.n.got=f;s.n.dn=0;f.got=1;
    if(f.k==='jel'){sh.pen(2);sh.snd('no');s.msg={t:1,a:L('Медуза! Обжёгся','Jellyfish! Ouch')+(S.warm||S.demo?'':L(' −2 с',' −2 s')),c:'#c62828'};if(!S.demo)sh.say(L('«Медузу — обратно. Она не на продажу»','“The jellyfish goes back. Not for sale”'));}
    else if(f.k==='boot'){sh.snd('no');s.msg={t:1,a:L('Сапог. 0 кг','A boot. 0 kg'),c:'#c86b3c'};if(!S.demo)sh.say(T(pick(BOOT)));}
    else{sh.add(k[0]);sh.snd('coin');sh.fx(f.x,f.y-24,L(k[3][0],k[3][1])+' +'+k[0]+L(' кг',' kg'),'#0a7a3a');}}
  function plan(){if(s.n)return false;const t0=s.bx;for(const f of s.f.slice().sort((a,b)=>a.y-b.y)){if(f.got)continue;const tt=(f.y-BY-20)/560,fx=f.x+f.vx*tt;
      if(Math.abs(fx-t0)<K[f.k][2]*.6)return !(f.k==='jel'||f.k==='boot');}return false;}
  return {
    reset(demo){s={f:[],bx:180,bv:70,sp:0,n:null,msg:null,fg:{down:0}};for(let i=0;i<4;i++){spawn();s.f[i].x=R(40,320);}},
    step(dt){if(s.msg){s.msg.t-=dt;if(s.msg.t<=0)s.msg=null;}s.fg.down=Math.max(0,s.fg.down-dt);
      s.bx+=s.bv*dt;if(s.bx<40||s.bx>320){s.bv*=-1;s.bx=Math.max(40,Math.min(320,s.bx));}
      s.sp-=dt;if(s.sp<=0){s.sp=R(.45,.8);if(s.f.length<9)spawn();}
      for(const f of s.f){if(!f.got){f.x+=f.vx*dt;f.ph+=dt*6;}}
      const n=s.n;if(n){if(n.dn){n.y+=560*dt;const f=s.f.find(f=>!f.got&&Math.abs(f.x-n.x)<K[f.k][2]*.7+10&&Math.abs(f.y-n.y)<16);if(f)grab(f);else if(n.y>=BOT){n.dn=0;}}
        else{n.y-=720*dt;if(n.got){n.got.y=n.y+10;n.got.x=n.x;}if(n.y<=BY+20){if(n.got)n.got.gone=1;s.n=null;}}}
      s.f=s.f.filter(f=>!f.gone&&f.x>-50&&f.x<410);
      if(S.demo&&plan()){s.fg.down=.3;cast();}},
    draw(c){c.fillStyle='#d6ecf7';c.fillRect(0,0,360,SEA);const g=c.createLinearGradient(0,SEA,0,520);g.addColorStop(0,'#3d86b8');g.addColorStop(1,'#123a5c');c.fillStyle=g;c.fillRect(0,SEA,360,520-SEA);
      c.fillStyle='#5f7d4a';c.beginPath();c.moveTo(0,SEA);c.lineTo(0,60);c.lineTo(50,80);c.lineTo(90,SEA);c.fill();
      c.fillStyle='#c2b280';c.fillRect(0,496,360,24);
      c.fillStyle='#1d4f7a';c.font='bold 14px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('САХАЛИН · ПУТИНА','SAKHALIN · FISHING SEASON'),220,16);
      // сейнер
      const x=s.bx;c.fillStyle='#b03a2e';c.beginPath();c.moveTo(x-50,BY);c.lineTo(x+50,BY);c.lineTo(x+38,SEA+4);c.lineTo(x-38,SEA+4);c.fill();
      c.fillStyle='#f4f6f8';c.fillRect(x-20,BY-28,30,28);c.fillStyle='#bfe3ff';c.fillRect(x-16,BY-22,10,8);c.strokeStyle='#4f5d72';c.lineWidth=3;c.beginPath();c.moveTo(x+18,BY);c.lineTo(x+18,BY-40);c.lineTo(x,BY+18);c.stroke();
      for(const f of s.f){const k=K[f.k],w=k[2],y=f.y+Math.sin(f.ph)*2,dr=f.vx>=0?1:-1;c.fillStyle=k[1];
        if(f.k==='jel'){c.beginPath();c.arc(f.x,y,w/2,Math.PI,0);c.fill();c.strokeStyle=k[1];c.lineWidth=2;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(f.x+i*4,y);c.lineTo(f.x+i*4+Math.sin(f.ph+i)*3,y+16);c.stroke();}}
        else if(f.k==='crab'){c.beginPath();c.ellipse(f.x,y,w/2,9,0,0,7);c.fill();c.fillRect(f.x-w/2-6,y-8,6,4);c.fillRect(f.x+w/2,y-8,6,4);}
        else if(f.k==='boot'){c.fillRect(f.x-6,y-14,12,20);c.fillRect(f.x-6,y+2,18,8);}
        else{c.beginPath();c.ellipse(f.x,y,w/2,w/5,0,0,7);c.fill();c.beginPath();c.moveTo(f.x-dr*w/2,y);c.lineTo(f.x-dr*(w/2+10),y-7);c.lineTo(f.x-dr*(w/2+10),y+7);c.fill();
          c.fillStyle='#1d2733';c.beginPath();c.arc(f.x+dr*w/3,y-2,2,0,7);c.fill();}}
      const n=s.n;if(n){c.strokeStyle='#e9edf2';c.lineWidth=2;c.beginPath();c.moveTo(s.bx,BY+18);c.lineTo(n.x,n.y-14);c.stroke();
        c.strokeStyle='#f4d35e';c.lineWidth=3;c.beginPath();c.moveTo(n.x-18,n.y-14);c.lineTo(n.x+18,n.y-14);c.lineTo(n.x+10,n.y+10);c.lineTo(n.x-10,n.y+10);c.closePath();c.stroke();}
      else{c.strokeStyle='rgba(255,255,255,.35)';c.setLineDash([6,8]);c.lineWidth=2;c.beginPath();c.moveTo(s.bx,SEA+8);c.lineTo(s.bx,BOT);c.stroke();c.setLineDash([]);}
      if(s.msg){c.globalAlpha=Math.min(1,s.msg.t*2);c.fillStyle='#fff';sh.rr(c,30,40,300,40,12);c.fill();c.fillStyle=s.msg.c;c.font='bold 17px sans-serif';c.fillText(s.msg.a,180,60);c.globalAlpha=1;}},
    down(){cast();},key(k,up){if(!up&&(k===' '||k==='ArrowDown'))cast();},
    peek(){return s;},ai(){if(plan())cast();},
    finger(){return s?{x:s.bx,y:BY-10,down:s.fg.down>0}:null;}};}
MG.game('ulov',{hero:{n:['Капитан Николаич','Captain Nikolaich'],a:'🐟',c:'#2f6fb5',l:['','']},
  how:['Сейнер ходит сам. <b>Нажмите</b> — сеть падает прямо вниз (по пунктиру). Кета 4 кг, краб 3, горбуша 2. <b>Медузу не берите</b>: минус 2 с.','The boat moves by itself. <b>Tap</b> — the net drops straight down (dotted line). Chum 4 kg, crab 3, pink salmon 2. <b>Avoid jellyfish</b>: minus 2 s.'],
  go:['«Путина! Рыба идёт — сеть за борт!»','“Fishing season! The fish are running — net overboard!”'],
  hand:'tap',dur:40,demoT:8,make,btns:[[(typeof L==='function'?L('🐟 Сеть! (пробел)','🐟 Net! (space)'):'🐟 Сеть!'),' ']]});
})(typeof window!=='undefined'?window:globalThis);
