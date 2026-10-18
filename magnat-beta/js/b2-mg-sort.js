/* b2-mg-sort.js — MG2: «📦 Ночная сортировка» (договор — шапка js/b2-mg-core.js; опись — js/b2-mg2.js, id 'sort').
   Подработка «Склад маркетплейса: ночная смена» и «Встать за прилавок» в своём ПВЗ. 40 с: посылки едут по ленте; нижнюю — в ячейку
   с тем же номером и цветом: ◀ 1 · ▼ 2 · 3 ▶ (смахнуть, нажать ячейку или кнопку). Не та ячейка — минус 2 с, уехала — минус 1 с.
   «НЕГАБАРИТ» (ковёр 6 м) — не трогать, он сам уедет. Темп растёт. */
(function(root){'use strict';
if(!root.MG)return;
const COL=['#d84343','#2e9d4f','#3f63e0'],BX=[62,180,298],BY=455,EXIT=402;
const NM=[['Кроссовки 46-го','Size 46 sneakers'],['Чайник «Как у мамы»','A kettle “like mum’s”'],['Носки ×12','Socks ×12'],['Подставка для подставок','A stand for stands'],
  ['Кот-копилка','A cat piggy bank'],['Удочка складная','A folding rod'],['Гантели. Тяжело','Dumbbells. Heavy'],['ХРУПКОЕ. Гремит','FRAGILE. Rattles'],['Шуба летом','A fur coat in summer'],['Книга «Как не опаздывать»','Book “How not to be late”']];
const WR=[['«Не та ячейка! Кто-то получит гантели вместо носков»','“Wrong cell! Someone will get dumbbells instead of socks”'],['«Дзынь… Надеюсь, это было не хрупкое»','“Clink… I hope that wasn’t fragile”']];
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null;
  const R=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
  function add(y){const big=S.t>8&&Math.random()<.1&&!s.p.some(p=>p.big);s.p.push({y,k:Math.floor(Math.random()*3),nm:pick(NM),big,fly:0});}
  function front(){return s.p.filter(p=>!p.fly).sort((a,b)=>b.y-a.y)[0]||null;}
  function put(k){const p=front();if(!p||p.y<40)return;if(p.big){p.fly=1;p.to=k;p.bad=1;sh.pen(2);sh.snd('no');s.msg={t:.9,a:L('Негабарит не лезет! Пропускайте','Oversize won’t fit! Let it pass'),c:'#c62828'};return;}
    p.fly=1;p.to=k;if(k===p.k){sh.add(1);sh.snd('coin');s.ok++;s.hit[k]=.3;if(s.ok%6===0&&!S.demo)sh.say(L('«Темп! Ночь длинная, а посылок — ещё длиннее»','“Faster! The night is long, the parcels are longer”'));}
    else{p.bad=1;sh.pen(2);sh.snd('no');s.msg={t:.9,a:L('Не та ячейка','Wrong cell')+(S.warm||S.demo?'':L(' −2 с',' −2 s')),c:'#c62828'};if(!S.demo)sh.say(T(pick(WR)));}}
  return {
    reset(demo){s={p:[],v:46,sp:0,ok:0,msg:null,hit:[0,0,0],fg:{x:180,y:300,down:0,cd:.6},sw:null};add(170);add(80);},
    step(dt){if(s.msg){s.msg.t-=dt;if(s.msg.t<=0)s.msg=null;}for(let i=0;i<3;i++)s.hit[i]=Math.max(0,s.hit[i]-dt);
      s.v=46+Math.min(60,S.t*1.7);
      for(const p of s.p){if(p.fly){p.fly+=dt*3;continue;}p.y+=s.v*dt;}
      for(const p of s.p)if(!p.fly&&p.y>EXIT){p.fly=1;p.to=-1;if(p.big){sh.fx(180,EXIT-30,L('Ковёр уехал в негабарит','The rug went to oversize'),'#0a7a3a');}
        else{sh.pen(1);sh.snd('no');s.msg={t:.8,a:L('Посылка уехала','A parcel got away')+(S.warm||S.demo?'':L(' −1 с',' −1 s')),c:'#c86b3c'};}}
      s.p=s.p.filter(p=>p.fly<1);
      const top=Math.min(...s.p.filter(p=>!p.fly).map(p=>p.y),999);if(top>78)add(top-R(84,120));
      if(S.demo){const f=s.fg,p=front();f.cd-=dt;if(f.down)f.down=Math.max(0,f.down-dt);
        if(p&&!p.big&&p.y>230&&f.cd<=0){f.x=BX[p.k];f.y=BY;f.down=.25;f.cd=.7;put(p.k);}else if(!f.down){f.x+=(180-f.x)*Math.min(1,dt*3);f.y+=(300-f.y)*Math.min(1,dt*3);}}},
    draw(c){c.fillStyle='#1f2a3c';c.fillRect(0,0,360,520);c.fillStyle='#2b3a52';for(let x=0;x<360;x+=60)c.fillRect(x,0,2,400);
      c.fillStyle='#fff';c.font='bold 15px sans-serif';c.textAlign='center';c.textBaseline='middle';
      c.fillStyle='#3c4656';c.fillRect(110,24,140,EXIT-14);c.fillStyle='#4d586a';const o=(S.t*s.v)%24;for(let y=24-24+o;y<EXIT+10;y+=24)c.fillRect(110,y,140,3);
      
      for(const p of s.p){let x=180,y=p.y,a=1;if(p.fly){const tx=p.to<0?180:BX[p.to],ty=p.to<0?560:BY;x+=(tx-180)*p.fly;y+=(ty-p.y)*p.fly;a=1-p.fly*.5;}
        c.globalAlpha=a;if(p===front()){c.strokeStyle='#ffd54f';c.lineWidth=4;sh.rr(c,180-(p.big?64:46),p.y-(p.big?24:32),p.big?128:92,p.big?48:64,9);c.stroke();}const w=p.big?120:84,h=p.big?40:56;c.fillStyle=p.big?'#8a6d4e':'#c8995e';sh.rr(c,x-w/2,y-h/2,w,h,6);c.fill();c.fillStyle='#e5c08a';c.fillRect(x-4,y-h/2,8,h);
        if(p.big){c.fillStyle='#fff';c.font='bold 14px sans-serif';c.fillText(L('НЕГАБАРИТ','OVERSIZE'),x,y-6);c.font='12px sans-serif';c.fillText(L('ковёр 6 м — не трогать','rug 6 m — leave it'),x,y+10);}
        else{c.fillStyle=COL[p.k];c.beginPath();c.arc(x+22,y-6,15,0,7);c.fill();c.fillStyle='#fff';c.font='bold 20px sans-serif';c.fillText(String(p.k+1),x+22,y-5);
          c.fillStyle='#fff';c.fillRect(x-38,y-16,40,22);c.fillStyle='#1d2733';c.font='10px sans-serif';c.fillText('№'+(1e3+(p.y*7|0)%9e3),x-18,y-5);}
        c.globalAlpha=1;}
      const f=front();if(f&&!f.big){c.fillStyle='#fff';c.font='14px sans-serif';const t=T(f.nm);c.fillText(t,180,EXIT+12>500?500:EXIT+10);}
      for(let i=0;i<3;i++){const x=BX[i];c.fillStyle=s.hit[i]?'#fff':COL[i];sh.rr(c,x-52,BY-26,104,64,12);c.fill();c.fillStyle=s.hit[i]?COL[i]:'#fff';c.font='bold 30px sans-serif';
        c.fillText(String(i+1),x,BY+2);c.font='bold 14px sans-serif';c.fillText(['◀','▼','▶'][i],x,BY+28);}
      if(s.msg){c.globalAlpha=Math.min(1,s.msg.t*2);c.fillStyle='#fff';sh.rr(c,20,236,320,42,12);c.fill();c.fillStyle=s.msg.c;c.font='bold 17px sans-serif';c.fillText(s.msg.a,180,257);c.globalAlpha=1;}},
    down(x,y){s.sw={x,y};},
    up(x,y){const w=s.sw;s.sw=null;if(!w)return;const dx=x-w.x,dy=y-w.y;
      if(Math.hypot(dx,dy)<24){if(y>BY-40)put(x<121?0:x<239?1:2);return;}put(Math.abs(dx)>Math.abs(dy)?(dx<0?0:2):1);},
    key(k,up){if(up)return;const i={ArrowLeft:0,ArrowDown:1,ArrowRight:2,'1':0,'2':1,'3':2}[k];if(i!=null)put(i);},
    peek(){return s;},ai(){const p=front();if(p&&!p.big&&p.y>120)put(p.k);},
    finger(){return s&&s.fg?{x:s.fg.x,y:s.fg.y,down:s.fg.down>0}:null;}};}
MG.game('sort',{hero:{n:['Склад «Всё рядом»','“All Nearby” warehouse'],a:'📦',c:'#3f63e0',l:['','']},
  how:['Нижнюю посылку — <b>в ячейку с тем же номером</b>: ◀ 1 · ▼ 2 · 3 ▶ (смахните, нажмите ячейку или кнопку). <b>НЕГАБАРИТ</b> не трогайте.','Put the bottom parcel <b>into the cell with the same number</b>: ◀ 1 · ▼ 2 · 3 ▶ (swipe, tap the cell or a button). Leave <b>OVERSIZE</b> alone.'],
  go:['«Ночная смена! Номер на наклейке — номер ячейки»','“Night shift! The sticker number is the cell number”'],
  hand:'swipe',dur:40,demoT:7,make,btns:[['◀ 1','ArrowLeft'],['▼ 2','ArrowDown'],['3 ▶','ArrowRight']]});
})(typeof window!=='undefined'?window:globalThis);
