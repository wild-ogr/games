/* b2-mg-blast.js — MG2: «💥 Подрыв по команде» (договор — шапка js/b2-mg-core.js; опись — js/b2-mg2.js, id 'blast'). Карьер (глава 4) и «Недра».
   40 с: Михалыч считает «три… два… один…», бегунок бежит к нулю — жмите «Взрыв!», когда он в зелёной зоне. Точнее — больше тонн породы.
   Если в зоне коза, собака или Борис с шашлыком — шкала красная, ЖДАТЬ (нажали — минус 3 с). Рано/поздно/проспали — минус 2 с. Темп растёт. */
(function(root){'use strict';
if(!root.MG)return;
const X0=30,X1=330,ZX=290,BY=392;
const WHO=[['коза','a goat','#e8e2d6'],['собака','a dog','#a0703c'],['Борис с шашлыком','Boris with a kebab','#b03a2e'],['грибник','a mushroom picker','#5d7a3a']];
const EARLY=[['«Рано! Самосвал ещё не отъехал»','“Too early! The truck hasn’t left yet”'],['«Рано! Я ещё каску не надел»','“Too early! I haven’t got my helmet on”']];
const LATE=[['«Поздно! Порода заскучала»','“Too late! The rock got bored”'],['«Поздно! Михалыч уже чай налил»','“Too late! Mikhalych already poured his tea”']];
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null;
  const R=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
  function cyc(){s.x=X0;s.v=(X1-X0)/Math.max(1.15,2.3-s.n*.09);s.zw=Math.max(16,30-s.n*1.1);s.who=null;
    if(s.n>0&&Math.random()<.22){const w=pick(WHO);s.who={w,t:R(1.4,2.2),x:-20};}s.pause=0;}
  function boom(q){const t=q===3?120:q===2?80:40;sh.add(t);sh.snd('coin');s.n++;s.bm=1;s.msg={t:.9,a:(q===3?L('Идеально! ','Perfect! '):q===2?L('Хорошо! ','Good! '):L('Сойдёт. ','Will do. '))+'+'+t+L(' т',' t'),c:'#0a7a3a'};
    s.pause=1;for(let i=0;i<14;i++)s.rk.push({x:R(180,320),y:R(150,230),vx:R(-90,90),vy:R(-220,-60),a:1});
    if(q===3&&!S.demo&&Math.random()<.5)sh.say(L('«Как по нотам! Красота»','“Like clockwork! Beautiful”'));}
  function miss(txt,p){sh.pen(p);sh.snd('no');s.msg={t:1,a:L('Мимо','Miss')+(S.warm||S.demo?'':' −'+p+L(' с',' s')),c:'#c62828'};if(!S.demo)sh.say(T(txt));s.pause=.8;s.n=Math.max(0,s.n-1);}
  function fire(){if(!s||s.pause>0)return;if(s.who&&s.who.t>0){sh.pen(3);sh.snd('no');s.msg={t:1.1,a:L('СТОП! Там ','STOP! There’s ')+L(s.who.w[0],s.who.w[1])+(S.warm||S.demo?'':L(' −3 с',' −3 s')),c:'#c62828'};
      if(!S.demo)sh.say(L('«Отставить! Сначала все уходят, потом бабах»','“Hold it! First everyone leaves, then boom”'));s.pause=.6;return;}
    const d=Math.abs(s.x-ZX);if(d<=s.zw*.25)boom(3);else if(d<=s.zw*.6)boom(2);else if(d<=s.zw)boom(1);else if(s.x<ZX)miss(pick(EARLY),2);else miss(pick(LATE),2);}
  return {
    reset(demo){s={n:0,rk:[],msg:null,bm:0,fg:{down:0}};cyc();},
    step(dt){if(s.msg){s.msg.t-=dt;if(s.msg.t<=0)s.msg=null;}s.bm=Math.max(0,s.bm-dt*1.2);s.fg.down=Math.max(0,s.fg.down-dt);
      for(const r of s.rk){r.x+=r.vx*dt;r.y+=r.vy*dt;r.vy+=400*dt;r.a-=dt*.8;}s.rk=s.rk.filter(r=>r.a>0&&r.y<380);
      if(s.pause>0){s.pause-=dt;if(s.pause<=0)cyc();return;}
      if(s.who){s.who.x+=60*dt;if(s.who.t>0){s.who.t-=dt;return;}}
      s.x+=s.v*dt;if(s.x>X1){miss([['«Проспали! Михалыч сам нажал»','“Overslept! Mikhalych pressed it himself”']],2);}
      if(S.demo&&Math.abs(s.x-ZX)<4){s.fg.down=.3;fire();}},
    draw(c){c.fillStyle='#cfe3f2';c.fillRect(0,0,360,520);
      // уступы карьера
      c.fillStyle='#b9a58a';c.beginPath();c.moveTo(0,330);c.lineTo(0,250);c.lineTo(90,250);c.lineTo(110,200);c.lineTo(200,200);c.lineTo(220,140);c.lineTo(360,140);c.lineTo(360,330);c.fill();
      c.fillStyle='#a28c70';c.beginPath();c.moveTo(220,140);c.lineTo(360,140);c.lineTo(360,330);c.lineTo(200,330);c.fill();
      for(let i=0;i<4;i++){const x=240+i*30;c.fillStyle='#d84343';c.fillRect(x,150,6,22);c.strokeStyle='#1d2733';c.lineWidth=1;c.beginPath();c.moveTo(x+3,150);c.quadraticCurveTo(x-20,120,150,330);c.stroke();}
      c.fillStyle='#e0a83a';sh.rr(c,24,276,72,40,6);c.fill();c.fillStyle='#1d2733';c.fillRect(30,316,12,10);c.fillRect(76,316,12,10);c.fillStyle='#fff';c.font='bold 11px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('САМОСВАЛ','TRUCK'),60,296);
      if(s.bm>0){c.globalAlpha=s.bm*.8;c.fillStyle='#e8e0d0';for(let i=0;i<6;i++){c.beginPath();c.arc(260+i*14-35,150-s.bm*30+(i%2)*14,30+(1-s.bm)*40,0,7);c.fill();}c.globalAlpha=1;}
      c.fillStyle='#8a7a66';for(const r of s.rk){c.globalAlpha=Math.max(0,r.a);c.fillRect(r.x,r.y,9,7);}c.globalAlpha=1;
      if(s.who){const x=150+Math.min(60,s.who.x*.6),y=186;c.fillStyle=s.who.w[2];sh.rr(c,x-14,y,28,16,6);c.fill();c.beginPath();c.arc(x+16,y-2,8,0,7);c.fill();c.fillStyle='#1d2733';c.font='bold 14px sans-serif';c.fillText(L(s.who.w[0],s.who.w[1]),x,y-20);}
      // пульт и шкала
      c.fillStyle='#3c4656';c.fillRect(0,330,360,190);const red=s.who&&s.who.t>0;
      c.fillStyle='#fff';c.font='bold 16px sans-serif';c.fillText(red?L('СТОП! В зоне — ','STOP! In the zone: ')+L(s.who.w[0],s.who.w[1]):L('Жмите, когда бегунок в зелёном','Press when the marker is in the green'),180,352);
      c.fillStyle=red?'#c62828':'#dfe5ec';sh.rr(c,X0,BY-14,X1-X0,28,14);c.fill();
      if(!red){c.fillStyle='#2ecc71';c.fillRect(ZX-s.zw,BY-14,s.zw*2,28);c.fillStyle='#0a7a3a';c.fillRect(ZX-s.zw*.25,BY-14,s.zw*.5,28);}
      c.fillStyle='#1d2733';c.font='bold 18px sans-serif';['3','2','1','0'].forEach((t,i)=>c.fillText(t,X0+30+i*((ZX-X0-30)/3),BY+34));
      if(!red&&s.pause<=0){c.fillStyle='#fff';c.beginPath();c.moveTo(s.x,BY+18);c.lineTo(s.x-9,BY+30);c.lineTo(s.x+9,BY+30);c.fill();c.fillStyle='#1d2733';c.fillRect(s.x-3,BY-20,6,40);}
      c.fillStyle=red?'#7d8590':'#c62828';sh.rr(c,90,438,180,58,29);c.fill();c.fillStyle='#fff';c.font='bold 22px sans-serif';c.fillText(red?L('Ждём…','Wait…'):L('ВЗРЫВ!','BLAST!'),180,467);
      if(s.msg){c.globalAlpha=Math.min(1,s.msg.t*2);c.fillStyle='#fff';sh.rr(c,20,40,320,42,12);c.fill();c.fillStyle=s.msg.c;c.font='bold 17px sans-serif';c.fillText(s.msg.a,180,61);c.globalAlpha=1;}},
    down(){fire();},
    key(k,up){if(!up&&(k===' '||k==='ArrowDown'||k==='ArrowUp'))fire();},
    peek(){return s;},ai(){if(s.pause<=0&&!(s.who&&s.who.t>0)&&Math.abs(s.x-ZX)<=s.zw*.2)fire();},
    finger(){return s?{x:180,y:467,down:s.fg.down>0}:null;}};}
MG.game('blast',{hero:{n:['Михалыч, взрывник','Mikhalych, blaster'],a:'💥',c:'#c86b3c',l:['','']},
  how:['Бегунок бежит к нулю — жмите <b>«Взрыв!», когда он в зелёном</b>. Кто-то в зоне (шкала красная) — <b>ждите</b>.','The marker runs to zero — press <b>“Blast!” when it’s in the green</b>. Someone in the zone (red bar) — <b>wait</b>.'],
  go:['«Каски надели? Считаю: три… два… один…»','“Helmets on? Counting: three… two… one…”'],
  hand:'tap',dur:40,demoT:7,make,btns:[[(typeof L==='function'?L('💥 Взрыв! (пробел)','💥 Blast! (space)'):'💥 Взрыв!'),' ']]});
})(typeof window!=='undefined'?window:globalThis);
