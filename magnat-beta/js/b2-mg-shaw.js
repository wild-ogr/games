/* b2-mg-shaw.js — MG1: «🥙 Шаурма на скорость» (договор — шапка js/b2-mg-core.js; опись — js/b2-mg1.js, id 'shaw').
   «Встать за прилавок» в шаурме / столовой / фудтраке. 45 с: сверху заказ, жми начинки ПО ПОРЯДКУ — шаурма заворачивается сама.
   Ошиблся — заказ заново (в разминке — нет). Заказы растут: 3 → 4 → 5 начинок. ПК: клавиши 1–8. */
(function(root){'use strict';
if(!root.MG)return;
// начинки: значок (эмодзи не новее 11) или рисунок, подпись ru/en, цвет кнопки
const ING=[['🍗','курица','chicken','#fbe3cf'],['🥗','капуста','cabbage','#e3f3dc'],['🍅','помидор','tomato','#fde0dc'],['🥒','огурец','cucumber','#e3f3dc'],
  ['🧀','сыр','cheese','#fff3c4'],['','лук','onion','#efe3f5'],['🌶','острый','hot','#fde0dc'],['','соус','sauce','#eef1f4']];
const LINES=[['«Как в прошлый раз»','“Same as last time”'],['«Без лука, но с луком»','“No onion, but with onion”'],['«Сырную. Можно без сыра?»','“The cheesy one. Without cheese?”'],
  ['«Побыстрее, я на обеде!»','“Quick, I’m on my lunch break!”'],['«Двойную, я с ночной смены»','“A double, I’ve done a night shift”'],['«Как Боре»','“Same as Boris had”'],
  ['«Острую, но чтобы не острую»','“Spicy, but not spicy”'],['«Мне для мамы. Она проверит»','“It’s for my mum. She’ll check”'],['«А в Москве дороже?»','“Is it pricier in Moscow?”'],
  ['«Я на диете. Двойной соус»','“I’m on a diet. Double sauce”']];
const OK=[['«Во! Руки помнят»','“See? The hands remember”'],['«Следующий!»','“Next!”'],['«Так держать, хозяин»','“Keep it up, boss”'],['«Очередь тает!»','“The queue is melting!”'],
  ['«Боря так не умеет»','“Boris can’t do that”']];
const FACES=['#f2c9a5','#e0ac85','#f5d6b8','#c98e66'],SHIRT=['#3f63e0','#2e7d32','#9c4fb0','#c86b3c','#5a6675'];
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null;
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const BT=[];for(let i=0;i<8;i++)BT.push({i,x:12+(i%4)*86,y:322+Math.floor(i/4)*98,w:78,h:90,hl:0});
  function order(){const n=Math.min(5,3+Math.floor(s.n/4)),o=[];while(o.length<n){const k=Math.floor(Math.random()*8);if(o.indexOf(k)<0)o.push(k);}
    s.o=o;s.k=0;s.wrap=0;s.line=pick(LINES);s.face=pick(FACES);s.shirt=pick(SHIRT);s.in=0;}
  function tap(i){if(!s||s.wrap>0)return;const b=BT[i];if(!b)return;b.hl=1;
    if(i===s.o[s.k]){s.k++;sh.snd('tap');if(s.k>=s.o.length){s.n++;sh.add(1);sh.snd('coin');s.wrap=.55;
        sh.fx(180,200,pick([L('С собой!','To go!'),L('Готово! +1','Done! +1'),L('Приятного!','Enjoy!')]),'#0a7a3a');if(s.n%3===0&&!S.demo)sh.say(T(pick(OK)));}}
    else{s.shake=.35;sh.snd('no');const w=ING[s.o[s.k]];
      if(S.warm||S.demo)sh.fx(180,200,L('Нужно: ','Need: ')+L(w[1],w[2]),'#c62828');
      else{s.k=0;sh.fx(180,200,L('Не то! Заказ заново','Wrong! Start the order again'),'#c62828');sh.say(L('«Не та начинка. Нужно было: <b>'+w[1]+'</b>. Собираем заново!»','“Wrong filling. It was: <b>'+w[2]+'</b>. From the top!”'));}}}
  function icon(c,i,x,y,big){const g=ING[i];c.textAlign='center';c.textBaseline='middle';
    if(g[0]){c.font=(big?34:26)+'px sans-serif';c.fillText(g[0],x,y);return;}
    const r=big?15:11;
    if(i===5){c.strokeStyle='#9c4fb0';c.lineWidth=big?4:3;c.beginPath();c.arc(x,y,r,0,7);c.stroke();c.beginPath();c.arc(x,y,r*.55,0,7);c.stroke();}
    else{c.fillStyle='#fff';c.strokeStyle='#b0b8c4';c.lineWidth=2;c.beginPath();c.moveTo(x,y-r*1.3);c.quadraticCurveTo(x+r,y,x,y+r);c.quadraticCurveTo(x-r,y,x,y-r*1.3);c.fill();c.stroke();}}
  return {
    reset(demo){s={n:0,shake:0,fg:{x:180,y:470,down:0,cd:.9}};order();},
    step(dt){if(s.shake>0)s.shake-=dt;s.in=Math.min(1,s.in+dt*4);for(const b of BT)if(b.hl>0)b.hl=Math.max(0,b.hl-dt*3);
      if(s.wrap>0){s.wrap-=dt;if(s.wrap<=0)order();}
      if(S.demo){const f=s.fg;f.cd-=dt;if(f.down)f.down=Math.max(0,f.down-dt);const b=BT[s.o[s.k]];
        if(b&&!s.wrap){const tx=b.x+b.w/2,ty=b.y+b.h/2;f.x+=(tx-f.x)*Math.min(1,dt*7);f.y+=(ty-f.y)*Math.min(1,dt*7);
          if(f.cd<=0&&Math.hypot(f.x-tx,f.y-ty)<10){tap(b.i);f.down=.22;f.cd=.6;}}}},
    draw(c){c.fillStyle='#f4ead9';c.fillRect(0,0,360,520);
      // вывеска и окно
      c.fillStyle='#c0392b';sh.rr(c,96,4,168,30,8);c.fill();c.fillStyle='#fff';c.font='bold 17px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('ШАУРМА 24/7','SHAWARMA 24/7'),180,20);
      const sx=s.shake>0?Math.sin(s.shake*60)*6:0;
      // покупатель и заказ
      c.fillStyle='#fff';sh.rr(c,10+sx,40,340,132,16);c.fill();
      const px=40+sx,py=96-(1-s.in)*20;c.globalAlpha=s.in;c.fillStyle=s.shirt;sh.rr(c,px-20,py+8,40,44,12);c.fill();c.fillStyle=s.face;c.beginPath();c.arc(px,py-6,17,0,7);c.fill();
      c.fillStyle='#1d2733';c.beginPath();c.arc(px-6,py-8,2,0,7);c.arc(px+6,py-8,2,0,7);c.fill();c.globalAlpha=1;
      c.fillStyle='#1d2733';c.font='bold 16px sans-serif';c.textAlign='left';c.fillText(T(s.line),74+sx,60);
      const n=s.o.length,w=56,x0=Math.max(72,212-n*w/2)+sx;
      s.o.forEach((k,i)=>{const x=x0+i*w;c.fillStyle=i<s.k?'#d7f0da':i===s.k?'#fff6c9':'#eef1f4';sh.rr(c,x+2,78,w-4,62,10);c.fill();
        if(i===s.k&&!s.wrap){c.strokeStyle='#e0a100';c.lineWidth=3;sh.rr(c,x+2,78,w-4,62,10);c.stroke();}
        c.fillStyle='#1d2733';icon(c,k,x+w/2,100,false);c.font='13px sans-serif';c.fillStyle='#4f5d72';c.fillText(L(ING[k][1],ING[k][2]),x+w/2,128);
        if(i<s.k){c.fillStyle='#2e7d32';c.font='bold 16px sans-serif';c.fillText('✓',x+w-10,86);}});
      c.textAlign='left';c.font='14px sans-serif';c.fillStyle='#4f5d72';c.fillText(s.wrap>0?L('Заворачиваю!','Wrapping!'):L('Жмите по порядку слева направо →','Tap in order, left to right →'),74+sx,158);
      // прилавок и лаваш
      c.fillStyle='#b8865b';c.fillRect(0,300,360,220);c.fillStyle='#a07048';c.fillRect(0,296,360,8);
      const wr=s.wrap>0?1-s.wrap/.55:0;c.fillStyle='#f3d9a4';c.beginPath();c.ellipse(180,238,130-80*wr,46,0,0,7);c.fill();c.strokeStyle='#d9b878';c.lineWidth=2;c.stroke();
      if(!wr)for(let i=0;i<s.k;i++){c.fillStyle='#1d2733';icon(c,s.o[i],108+i*36,238,false);}
      else{c.fillStyle='#e8c483';sh.rr(c,180-50*(1-wr)-26,212,52+100*(1-wr),52,20);c.fill();}
      // кнопки начинок
      for(const b of BT){c.fillStyle=b.hl>0?'#ffe9a8':ING[b.i][3];sh.rr(c,b.x,b.y,b.w,b.h,14);c.fill();c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=2;c.stroke();
        c.fillStyle='#1d2733';icon(c,b.i,b.x+b.w/2,b.y+36,true);c.font='bold 15px sans-serif';c.fillStyle='#1d2733';c.fillText(L(ING[b.i][1],ING[b.i][2]),b.x+b.w/2,b.y+74);
        if(S.pc){c.font='bold 12px sans-serif';c.fillStyle='#8a94a3';c.fillText(String(b.i+1),b.x+12,b.y+12);}}},
    down(x,y){const b=BT.find(b=>x>=b.x-4&&x<=b.x+b.w+4&&y>=b.y-4&&y<=b.y+b.h+4);if(b)tap(b.i);},
    key(k,up){if(up)return;const n=parseInt(k,10);if(n>=1&&n<=8)tap(n-1);},
    peek(){return s;},tap,
    finger(){return s&&s.fg?{x:s.fg.x,y:s.fg.y,down:s.fg.down>0}:null;}};}
MG.game('shaw',{hero:{n:['Михалыч, повар','Mikhalych, the cook'],a:'М',c:'#5a6675',l:['','']},
  how:['Сверху — заказ. Жмите начинки <b>по порядку, слева направо</b>. Шаурма завернётся сама. Ошибка — заказ заново.','The order is at the top. Tap the fillings <b>in order, left to right</b>. It wraps itself. A mistake — start the order again.'],
  go:['«Очередь до остановки! Читай заказ — и по порядку»','“The queue reaches the bus stop! Read the order — and in order”'],
  hand:'tap',dur:45,demoT:7,make});
})(typeof window!=='undefined'?window:globalThis);
