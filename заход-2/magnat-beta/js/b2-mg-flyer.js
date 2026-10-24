/* b2-mg-flyer.js — MGCORE: «📄 Листовки у метро» — образец игры на оболочке (договор — шапка js/b2-mg-core.js; опись — там же, MG.add id 'flyer').
   Подработка «Промоутер» главы 1 (со 2-го заказа) и дело хозяина «Листовки своими руками». 30 с: тапай по тем, кто смотрит на вас (рука поднята);
   тот, кто в телефоне или бежит, — минус 1 с; бабушка берёт три «для внуков»; голубь берёт листовку, но не считается. Темп растёт. */
(function(root){'use strict';
if(!root.MG)return;
const LANES=[150,240,330,420];
function make(sh){const S=sh.S,L=sh.L;let s=null;
  const R=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
  function spawn(){const lane=pick(LANES),dir=Math.random()<.5?1:-1,x=Math.random(),hard=Math.min(1,S.t/30);
    const k=x<.42?'look':x<.5?'gran':x<.72?'phone':x<.84?'run':x<.92?'scoot':'bird';
    const v=k==='run'?R(150,190):k==='scoot'?R(190,230):k==='bird'?60:k==='gran'?R(38,50):R(55,95)*(1+.35*hard);
    s.p.push({x:dir>0?-30:390,y:lane,dir,k,v,ph:Math.random()*6,got:0});}
  function hit(p){if(p.k==='look'||p.k==='gran'){p.got=1;p.v*=.6;const n=p.k==='gran'?3:1;sh.add(n);sh.snd('coin');
      sh.fx(p.x,p.y-40,p.k==='gran'?L('Три — для внуков!','Three — for the grandkids!'):pick([L('Спасибо!','Thanks!'),'+1',L('О, скидка!','Oh, a discount!'),L('Возьму','I’ll take one')]),'#0a7a3a');}
    else if(p.k==='bird'){p.got=1;sh.fx(p.x,p.y-16,L('Голубь взял. Не считается','A pigeon took it. Doesn’t count'),'#4f5d72');}
    else{p.got=2;sh.pen(1);sh.snd('no');sh.fx(p.x,p.y-40,p.k==='phone'?L('Не мешайте!','Don’t bother me!'):p.k==='scoot'?L('С дороги!','Out of the way!'):L('Опаздываю!','I’m late!'),'#c62828');}}
  return {
    reset(demo){s={p:[],sp:.2,fg:{x:180,y:470,down:0,tx:180,ty:470,cd:1},n:0};},
    step(dt){s.sp-=dt;if(s.sp<=0){const hard=Math.min(1,S.t/30);s.sp=R(.42,.85)*(1-.35*hard);spawn();}
      for(const p of s.p){p.x+=p.dir*p.v*dt;p.ph+=dt*8;}s.p=s.p.filter(p=>p.x>-50&&p.x<410);
      if(S.demo){const f=s.fg;f.cd-=dt;if(f.down)f.down=Math.max(0,f.down-dt);
        if(!f.tg||f.tg.got||f.tg.x<20||f.tg.x>340)f.tg=s.p.filter(p=>!p.got&&(p.k==='look'||p.k==='gran')&&p.x>60&&p.x<300).sort((a,b)=>Math.abs(a.x-180)-Math.abs(b.x-180))[0]||null;
        if(f.tg){f.tx=f.tg.x;f.ty=f.tg.y+5;}f.x+=(f.tx-f.x)*Math.min(1,dt*6);f.y+=(f.ty-f.y)*Math.min(1,dt*6);
        if(f.tg&&f.cd<=0&&Math.hypot(f.x-f.tx,f.y-f.ty)<14){hit(f.tg);f.down=.25;f.cd=.7;f.tg=null;}}},
    draw(c){c.fillStyle='#dfe5ec';c.fillRect(0,0,360,520);c.fillStyle='#c9d1db';for(const y of [195,285,375,465])c.fillRect(0,y,360,3);
      c.fillStyle='#b03a2e';sh.rr(c,120,8,120,40,10);c.fill();c.fillStyle='#fff';c.font='bold 18px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('М  МЕТРО','M  METRO'),180,29);
      for(const p of s.p){const b=Math.sin(p.ph)*2,x=p.x,y=p.y;
        if(p.k==='bird'){c.fillStyle='#7d8590';c.beginPath();c.ellipse(x,y+20,12,8,0,0,7);c.fill();c.beginPath();c.arc(x+p.dir*10,y+12,5,0,7);c.fill();if(p.got){c.fillStyle='#fff';c.fillRect(x-4,y+6,10,7);}continue;}
        const col=p.got===1?'#9db8a0':p.k==='look'?'#3f63e0':p.k==='gran'?'#9c4fb0':p.k==='phone'?'#8b93a1':'#c86b3c';
        c.fillStyle=col;sh.rr(c,x-14,y-6+b,28,44,10);c.fill();
        c.fillStyle='#f2c9a5';c.beginPath();c.arc(x,y-18+b+(p.k==='phone'?4:0),12,0,7);c.fill();
        if(p.k==='gran'){c.fillStyle='#e8e2d6';c.beginPath();c.arc(x,y-24+b,12,Math.PI,0);c.fill();}
        if((p.k==='look'||p.k==='gran')&&!p.got){c.fillStyle='#1d2733';c.beginPath();c.arc(x-4,y-19+b,1.8,0,7);c.arc(x+4,y-19+b,1.8,0,7);c.fill();
          c.strokeStyle='#f2c9a5';c.lineWidth=6;c.beginPath();c.moveTo(x+12,y+b);c.lineTo(x+20,y-22+b);c.stroke();}
        if(p.k==='phone'){c.fillStyle='#2b3445';c.fillRect(x-6,y-2+b,12,16);c.fillStyle='#9ff';c.fillRect(x-4,y+b,8,11);}
        if(p.k==='run'||p.k==='scoot'){c.strokeStyle='#c86b3c';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(x-p.dir*(22+i*6),y+i*10);c.lineTo(x-p.dir*(34+i*6),y+i*10);c.stroke();}}
        if(p.k==='scoot'){c.strokeStyle='#2b3445';c.lineWidth=3;c.beginPath();c.moveTo(x-16,y+46);c.lineTo(x+16,y+46);c.moveTo(x+p.dir*14,y+46);c.lineTo(x+p.dir*10,y+4);c.stroke();}
        if(p.got===1){c.fillStyle='#fff';c.fillRect(x+8,y+4+b,12,16);}}},
    down(x,y){let best=null,bd=42;for(const p of s.p){if(p.got)continue;const d=Math.hypot(p.x-x,p.y+8-y);if(d<bd){bd=d;best=p;}}if(best)hit(best);},
    key(){},peek(){return s;},
    finger(){return s&&s.fg?{x:s.fg.x,y:s.fg.y,down:s.fg.down>0}:null;}};}
MG.game('flyer',{hero:{n:['Агентство «Листок»','Leaflet Agency'],a:'📄',c:'#e07b39',l:['','']},
  how:['Давайте листовку тем, кто <b>смотрит на вас</b> (рука поднята). Кто в телефоне или бежит — не трогайте: минус 1 с.','Hand a flyer to people <b>looking at you</b> (hand raised). Leave those on the phone or running: minus 1 s.'],
  go:['Пачку раздать до конца смены! Кто смотрит — тому и давайте.','Hand out the whole stack! Whoever looks at you gets one.'],
  hand:'tap',dur:30,demoT:6,make});
})(typeof window!=='undefined'?window:globalThis);
