/* b2-mg-paseka.js — MG2: «🍯 Пасека» — игра края Алтай (alt; формат KRAI). Договор — шапка js/b2-mg-core.js; опись — js/b2-mg2.js, id 'paseka'.
   40 с: мёд капает с сот — ведите банку пальцем (или ◀ ▶) и ловите: капля 20 г, кусок сот 100 г. Пчела в банку — «ужалила», минус 2 с.
   Иногда заходит медведь — Михаил Топтыгин собственной персоной: не подставляйте ему банку (минус 2 с и «делиться надо!»). Рекорд — граммы мёда. */
(function(root){'use strict';
if(!root.MG)return;
const JY=440,JW=64;
function make(sh){const S=sh.S,L=sh.L;let s=null;
  const R=(a,b)=>a+Math.random()*(b-a);
  function drop(){const r=Math.random(),k=r<.7?'d':r<.82?'c':'b';s.o.push({k,x:R(30,330),y:k==='b'?40:70,vy:k==='b'?R(110,150):k==='c'?R(150,190):R(170,230)*(1+Math.min(.5,S.t/60)),ph:Math.random()*6,a:R(30,60)});}
  function hurt(t,say){if(s.inv>0)return;s.inv=1;sh.pen(2);sh.snd('no');s.msg={t:1,a:t+(S.warm||S.demo?'':L(' −2 с',' −2 s')),c:'#c62828'};if(!S.demo)sh.say(say);}
  return {
    reset(demo){s={o:[],x:180,tx:180,dir:0,sp:.3,inv:0,bear:null,bt:R(8,12),msg:null,fg:{down:0}};},
    step(dt){if(s.msg){s.msg.t-=dt;if(s.msg.t<=0)s.msg=null;}s.inv=Math.max(0,s.inv-dt);s.fg.down=Math.max(0,s.fg.down-dt);
      if(s.dir)s.tx=Math.max(40,Math.min(320,s.tx+s.dir*360*dt));s.x+=Math.max(-900*dt,Math.min(900*dt,s.tx-s.x));
      s.sp-=dt;if(s.sp<=0){s.sp=R(.28,.5)*Math.max(.6,1-S.t/80);drop();}
      s.bt-=dt;if(s.bt<=0&&!s.bear){const d=Math.random()<.5?1:-1;s.bear={x:d>0?-50:410,v:d*R(55,75)};s.bt=R(9,13);if(!S.demo)sh.say(L('«Михаил Топтыгин пришёл за мёдом. Как всегда без спроса»','“Mikhail Toptygin came for the honey. Uninvited, as always”'));}
      if(s.bear){s.bear.x+=s.bear.v*dt;if(s.bear.x<-70||s.bear.x>430)s.bear=null;else if(Math.abs(s.bear.x-s.x)<JW/2+30)hurt(L('Медведь!','The bear!'),L('«Топтыгин: — Делиться надо!»','“Toptygin: — You should share!”'));}
      for(const o of s.o){o.y+=o.vy*dt;if(o.k==='b'){o.ph+=dt*4;o.x+=Math.cos(o.ph)*o.a*dt*2;}
        if(!o.got&&o.y>JY-24&&o.y<JY+10&&Math.abs(o.x-s.x)<JW/2+(o.k==='b'?4:6)){o.got=1;
          if(o.k==='b')hurt(L('Ужалила!','Stung!'),L('«Пчела — существо нервное. Не машите банкой»','“Bees are nervous. Don’t wave the jar”'));
          else{const g=o.k==='c'?100:20;sh.add(g);sh.snd('coin');if(o.k==='c')sh.fx(o.x,JY-50,L('Соты! +100 г','Honeycomb! +100 g'),'#b8860b');}}}
      s.o=s.o.filter(o=>!o.got&&o.y<540);
      if(S.demo){this.ai();s.fg.down=1;}},
    draw(c){c.fillStyle='#e8f4d8';c.fillRect(0,0,360,520);c.fillStyle='#8fbf5a';c.fillRect(0,470,360,50);
      c.fillStyle='#7a9c4a';c.beginPath();c.moveTo(0,200);c.lineTo(80,120);c.lineTo(150,190);c.lineTo(240,100);c.lineTo(360,190);c.lineTo(360,260);c.lineTo(0,260);c.fill();
      c.fillStyle='#fff';c.beginPath();c.moveTo(240,100);c.lineTo(222,118);c.lineTo(258,118);c.fill();
      // соты сверху
      for(let i=0;i<7;i++){const x=26+i*51;c.fillStyle='#e0a83a';c.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;c.lineTo(x+22*Math.cos(a),40+22*Math.sin(a));}c.fill();c.fillStyle='#f6c85f';c.beginPath();c.arc(x,40,9,0,7);c.fill();}
      c.fillStyle='#1d2733';c.font='bold 14px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('АЛТАЙ · ПАСЕКА','ALTAI · APIARY'),180,80);
      for(const o of s.o){if(o.k==='d'){c.fillStyle='#e8a317';c.beginPath();c.arc(o.x,o.y,8,0,Math.PI);c.lineTo(o.x,o.y-16);c.fill();}
        else if(o.k==='c'){c.fillStyle='#f0b429';c.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;c.lineTo(o.x+16*Math.cos(a),o.y+16*Math.sin(a));}c.fill();c.strokeStyle='#b8860b';c.lineWidth=2;c.stroke();}
        else{c.save();c.translate(o.x,o.y);c.scale(1.4,1.4);c.translate(-o.x,-o.y);c.fillStyle='#f6c85f';c.beginPath();c.ellipse(o.x,o.y,12,8,0,0,7);c.fill();c.fillStyle='#1d2733';c.fillRect(o.x-4,o.y-8,3,16);c.fillRect(o.x+3,o.y-8,3,16);
          c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.ellipse(o.x-3,o.y-11,7,4,0,0,7);c.ellipse(o.x+5,o.y-11,7,4,0,0,7);c.fill();c.restore();}}
      const b=s.bear;if(b){const x=b.x,y=446,d=b.v>0?1:-1;c.fillStyle='#6b4a2e';c.beginPath();c.ellipse(x,y,36,24,0,0,7);c.fill();c.beginPath();c.arc(x+d*32,y-18,16,0,7);c.fill();
        c.beginPath();c.arc(x+d*24,y-32,6,0,7);c.arc(x+d*40,y-32,6,0,7);c.fill();c.fillStyle='#1d2733';c.beginPath();c.arc(x+d*38,y-20,2.5,0,7);c.fill();
        c.fillStyle='#1d2733';c.font='bold 13px sans-serif';c.fillText(L('М. Топтыгин','M. Toptygin'),x,y-58);}
      // банка
      const x=s.x;if(!(s.inv>0&&Math.floor(s.inv*10)%2)){c.fillStyle='rgba(255,255,255,.75)';sh.rr(c,x-JW/2,JY-20,JW,58,10);c.fill();c.strokeStyle='#4f5d72';c.lineWidth=3;c.stroke();
        const h=Math.min(48,4+S.score/40);c.fillStyle='#e8a317';c.fillRect(x-JW/2+5,JY+34-h,JW-10,h);}
      if(s.msg){c.globalAlpha=Math.min(1,s.msg.t*2);c.fillStyle='#fff';sh.rr(c,30,250,300,42,12);c.fill();c.fillStyle=s.msg.c;c.font='bold 18px sans-serif';c.fillText(s.msg.a,180,271);c.globalAlpha=1;}},
    down(x){s.tx=Math.max(40,Math.min(320,x));},move(x){s.tx=Math.max(40,Math.min(320,x));},
    key(k,up){if(k!=='ArrowLeft'&&k!=='ArrowRight')return;const d=k==='ArrowLeft'?-1:1;if(up){if(s.dir===d)s.dir=0;}else s.dir=d;},
    peek(){return s;},
    ai(){const ok=x=>!s.o.some(o=>o.k==='b'&&o.y>JY-150&&o.y<JY&&Math.abs(o.x-x)<JW/2+16)&&!(s.bear&&Math.abs(s.bear.x+s.bear.v*.6-x)<JW/2+50);
      let best=null,bv=-1;for(const o of s.o){if(o.k==='b'||o.got||o.y>JY)continue;const t=(JY-o.y)/o.vy;if(t>1.6)continue;const dist=Math.abs(o.x-s.x);if(dist>900*t+30)continue;
        const v=(o.k==='c'?100:20)/(t+.3);if(v>bv&&ok(o.x)){bv=v;best=o;}}
      if(best)s.tx=best.x;else if(!ok(s.x)){for(const d of [80,-80,160,-160]){const x=Math.max(40,Math.min(320,s.x+d));if(ok(x)){s.tx=x;break;}}}},
    finger(){return s?{x:s.x,y:JY+50,down:true}:null;}};}
MG.game('paseka',{hero:{n:['Пасечник дед Егор','Beekeeper Grandpa Yegor'],a:'🍯',c:'#b8860b',l:['','']},
  how:['<b>Ведите банку пальцем</b> (или ◀ ▶) и ловите мёд: капля 20 г, соты 100 г. <b>Пчёл и медведя</b> не ловите — минус 2 с.','<b>Move the jar with your finger</b> (or ◀ ▶) and catch the honey: a drop is 20 g, honeycomb 100 g. <b>Avoid bees and the bear</b> — minus 2 s.'],
  go:['«Мёд в этом году — как никогда. Подставляй банку!»','“The honey this year is better than ever. Hold out the jar!”'],
  hand:'tap',dur:40,demoT:8,make,btns:[['◀ '+(typeof L==='function'?L('Влево','Left'):'Влево'),'ArrowLeft'],[(typeof L==='function'?L('Вправо','Right'):'Вправо')+' ▶','ArrowRight']]});
})(typeof window!=='undefined'?window:globalThis);
