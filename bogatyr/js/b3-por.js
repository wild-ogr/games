/* b3-por.js — Богатырь 3.0, П1 «Порог» (07.11). Журнал и описание: hobby-analytics/release-i/boost3-bogatyr/REVIEW-1107/П1-ПОРОГ.md. ≤7 КБ сжатых, без ?. ?? .finally.
   Флаг b3por, только новичку: 1-й поход (избы, Яга, Марья 0–19 с, приезд богатыря, кольцо и дар ~30 с), гл.1–3 подряд — B3P.quiet()/next()/go(). STAT b3 a:'por'. */
(function(){if(typeof B3==='undefined'||typeof BB2!=='object')return;var B=BB2,N=window.B3P={},PN=function(){return performance.now();};
  function on(){return B3.on('por');}
  function sv(){return B.s('b3p');}
  B.save('b3p',{fix:function(o){var r={};if(o.q)r.q=1;if(o.v)r.v=1;if(o.n>0)r.n=Math.min(9,o.n|0);if(Array.isArray(o.h))r.h=o.h.filter(function(x){return typeof x==='string';}).slice(0,6).map(function(x){return x.slice(0,40);});return r;},
    merge:function(a,b){var r=B.mx(a,b);r.h=(a.h||[]).concat((b.h||[]).filter(function(x){return (a.h||[]).indexOf(x)<0;})).slice(0,6);return r;}});
  /* запасные строки (основной банк — П5 b3-txt.js) */
  B3.bank('por.yaga0',{ru:["Веди пальцем — бей! Деревню жгут!", "Деревню жгут! Пальцем веди. Остальное — его забота."],en:["Drag your finger — fight! The village is burning!", "The village is on fire! Steer with your finger. He does the rest."]});
  B3.bank('por.yaga0pc',{ru:['Веди мышью — бей! Деревню жгут!','Зажми мышь и веди! Деревню жгут!'],en:['Hold the mouse and drag — fight! The village is burning!','Drag with the mouse! The village is on fire!']});
  B3.bank('por.marya',{ru:["Ухватом по рогам! Иван, держи ворота!", "Кто к нам без стука? Сейчас постучу."],en:["Oven fork to the horns! Ivan, hold the gate!", "Who barged in without knocking? I'll do the knocking."]});
  B3.bank('por.ilya',{ru:["Где ж ты был, окаянный?!\nКоня подковывал!", "Ты откуда такой нарядный?\nС печи. Прямо в бой. Без завтрака!"],en:["Where on earth have you been?!\nShoeing my horse!", "Where did you spring from?\nThe stove. Straight to battle. No breakfast!"]});
  B3.bank('por.scary',{ru:["Окружили! Жми дар — для того и копил!", "Обступили! Дар! Скорей, а то я жалеть начну."],en:["Surrounded! Hit your gift — that's what it's for!", "Closing in! The gift! Quick, before I start feeling sorry."]});
  B3.bank('por.saved',{ru:["Вот так! Даже я испугалась. А я профессионал.", "Отбился! Я аж в ступе подпрыгнула."],en:["That's it! Even I got scared. And I'm a professional.", "Fought them off! I nearly jumped out of my mortar."]});
  B3.bank('por.village',{ru:["Это деревня. Ты её спас — теперь она твоя. С протечками.", "Вот и деревня. Избы стоят, Марья цела. Мне даже скучно."],en:["This is the village. You saved it — now it's yours. Leaky roof included.", "Here's the village. Huts standing, Marya fine. I'm almost bored."]});
  /* ---------- главы 1–3 подряд ---------- */
  function done(i){try{return !!S.done[ORD[i]];}catch(e){return false;}}
  N.quiet=function(){return on()&&!!sv().q&&!done(2)&&B3.age()<1;};
  N.next=function(){if(!N.quiet()||!done(0)||!B.win)return -1;return done(1)?3:2;};
  N.go=function(){var n=N.next(),c=n>0?ORD[n-1]:-1,f;if(c<0)return false;f=function(){B.go(c);};B3.stat('por',{s:'next',c:n});
    try{SND.click();}catch(e){}toMenu('Map');mapSel=c;if(B3.lz&&B3.lz())B.need('b3x').then(f,f);else setTimeout(f,60);return true;};
  B.hook('modal',function(k,m){if(k!=='result')return;m.classList.remove('b3q');var n=N.next(),b,x;if(n<0||typeof G==='undefined'||!G||!G.win)return;
    x=[].slice.call(m.querySelectorAll('.unlock b,.tutbox b')).map(function(e){return e.textContent.replace(/[^\wА-Яа-яЁё «»!-]/g,'').trim().slice(0,40);}).filter(function(t){return t&&!/глав|chapter/i.test(t);});
    var s=sv(),h=s.h||[];x.forEach(function(t){if(h.indexOf(t)<0)h.push(t);});s.h=h.slice(-6);
    m.classList.add('b3q');b=m.querySelector('.btns');if(!b||m.querySelector('#b3pNext'))return;
    b.insertAdjacentHTML('afterbegin','<button class="btn big gold" id="b3pNext">'+L('Дальше: глава ','Next: chapter ')+n+' ➜</button>');m.querySelector('#b3pNext').onclick=function(){var r=m.querySelector('#b3pNext');if(r)r.disabled=true;N.go();};});
  B.hook('end',function(g,w){var s=sv(),p;if(!on()||!s.q||!w||g.endless||g.daily||g.weekly||g.dif!=='n')return;p=chPos(g.chi);if(p>=1&&p<=3&&p>(s.n|0)){s.n=p;B3.stat('por',{s:'row',n:p});}});
  /* гл.2–3 подряд: главарь чуть раньше лесенки LAD (78→68, 90→78 с; гл.3 здоровье главаря ×0,75) — по часам ≤2,5 мин с окнами уровня */
  B.hook('run',function(g){if(g.lovMeet&&N.quiet())g.lovMeet.d=1; /* П6: «Встреча на дороге» (пауза-игра в бою) — не в тихих главах 1–3 */
    var k=g.short&&g.nvL&&N.quiet()&&[0,0,68,78][g.nvL];if(k&&g.short.boss>k){g.short.boss=k;g.ev.forEach(function(e){if(e.k==='boss')e.t=g.t0+k;});if(g.nvL>2)g.short.bossHp*=.75;}},60);
  /* в «тихие» главы — без окон вне похода: «Дела на сегодня»/утро, лига, «Завтра» */
  B.hook('morning',function(){if(N.quiet())return true;},1);
  B.hook('menu',function(){var s=sv();if(!on()||!s.q||s.v||!done(2))return;s.v=1;try{save();}catch(e){}setTimeout(vil,700);});
  function vil(){try{if(curTab!=='Village')openTab('Village');}catch(e){}var d=document.createElement('div'),h=sv().h||[],t=B3.say('por.village');d.id='b3pY';
    d.innerHTML='<img src="'+iconURL('yaga',96)+'" alt=""><div><b>'+L('Баба-Яга','Baba Yaga')+'</b>'+t+(h.length?'<small>'+L('Новое: ','New: ')+h.slice(0,3).join(' · ')+'</small>':'')+'</div>';
    d.onclick=function(){d.remove();};document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.remove();},12000);B3.stat('por',{s:'vil',h:h.length});sv().h=[];}
  try{var cs=document.createElement('style');cs.textContent='#mBody.b3q:not(.b3w)>*:not(h3):not(.sub):not(.rstars):not(.stats):not(.goldrow):not(.btns):not(.confetti){display:none!important}#mBody.b3q:not(.b3w)>.sub~.sub,#mBody.b3q:not(.b3w) .btns>.btn:not(#b3pNext):not(#rX2){display:none!important}#b3pNext{font-size:20px;min-height:56px}'+
    '#b3pY{position:fixed;left:12px;right:12px;bottom:calc(84px + var(--sb,0px));z-index:60;display:flex;gap:10px;align-items:center;background:#fff6dc;color:#3a2412;border:2px solid #e6b85a;border-radius:16px;padding:8px 12px;font:600 16px/1.3 system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.35);max-width:520px;margin:0 auto}#b3pY img{width:64px;height:64px}#b3pY b{display:block;color:#a3261c}#b3pY small{display:block;font-size:16px;opacity:.85;margin-top:2px}';document.head.appendChild(cs);}catch(e){}

  /* ---------- первый поход: сцена ---------- */
  var T={ily:19,sc:30,wait:2};
  /* 1-й поход стартует до этого тега и до nv1 — init и в run, и в первых кадрах */
  function init(g){if(g.b3p||g.b3n)return;if(!on()||!g.first||B3.old()||g.t>3){g.b3n=1;return;}if(!g.nv||!g.nv.first)return;sv().q=1;
    var H=g.hero,w=VIEW.ww,h=VIEW.wh;g.b3p={k0:g.hkey,ph:0,y:{t:.4,s:B3.say((window.NV&&NV.pc||VIEW.W>=VIEW.H*1.2)&&B3.has('por.yaga0pc')?'por.yaga0pc':'por.yaga0'),d:5.5},hut:[[-w+18,-50],[-w-6,h*.55],[w-14,20],[w+8,-h*.5+130]].map(function(q){return [H.x+q[0],H.y+q[1]];}),m1:2.6};
    g.hkey='mar';try{spr('h_mar_0');spr('h_mar_1');}catch(e){}if(g.um)g.um.hd=1;B3.stat('por',{s:'show'});}
  B.hook('run',init,70);
  function mentorOff(){var r=B.rp,q=r&&r.gh&&r.gh();if(q&&q.o&&q.o.src==='mentor')r.gh0();}
  function bob(H,g){return H.moving?Math.abs(Math.sin(H.step*Math.PI))*2:Math.sin(g.t*3)*.6;}
  B.hook('frame',function(dt,g){init(g);var P=g.b3p,H=g.hero,i,e,a,u=g.um,s;if(!P||g.over)return;mentorOff();
    if(P.ph<2&&u)u.hd=1;
    if(P.m1&&g.t>=P.m1){heroSay(B3.say('por.marya'));P.m1=g.t<8?11:0;}
    if(!P.ph&&g.t>=T.ily){P.ph=1;P.r={x:H.x-VIEW.ww-60,t:0};B3.stat('por',{s:'ily'});}
    if(P.ph===1){P.r.t+=dt;P.r.x+=(H.x-44-P.r.x)*Math.min(1,dt*3.2)+260*dt*(P.r.x<H.x-60?1:0);if(Math.random()<.5)burst(P.r.x,H.y+20,'#b89b72',1,60);
      if(P.r.x>=H.x-62||P.r.t>2){P.ph=2;g.hkey=P.k0;var q=B3.say('por.ilya').split('\n');P.m={x:H.x-30,y:H.y,t:0,s:q[0]};g.bub.length=0;P.ir=q[1]||'';H.flip=-1;P.r.x=H.x-62;P.r.g=0;g.shake=6;try{SND.boom();}catch(x){}}}
    if(P.m){P.m.t+=dt;if(P.ir&&P.m.t>2.2){heroSay(P.ir);P.ir='';}if(P.m.t>2.6){a=P.hut[0];P.m.x+=(a[0]-P.m.x)*dt*.4;P.m.y+=(a[1]-P.m.y)*dt*.4;}if(P.m.t>7)P.m=null;}
    if(P.r&&P.ph===2){P.r.g+=dt;if(P.r.g>2)P.r=null;}
    /* страшный момент */
    if(P.ph===2&&g.t>=T.sc&&!(g.boss&&!g.boss.dead)){P.ph=3;P.c0=PN();P.d0=g.q.dars;P.hp=H.hp;P.y={t:g.t,s:B3.say('por.scary'),d:4};var ty=g.ch.en[0];P.ring=[];
      for(i=0;i<14;i++){a=i/14*6.283;e=mkEnemy(ty,H.x+Math.cos(a)*120,H.y+Math.sin(a)*120);if(e)P.ring.push(e);}
      g.slowT=Math.max(g.slowT||0,1.6);if(u&&u.sl[0]){s=u.sl[0];s.t=s.cd;s.rdy=1;s.rT=-99;u.hd=0;u.hint=PN()-(B.n('um.hintWait',4)-T.wait)*1000;u.hy=null;}}
    if(P.ph===3){H.hp=Math.max(g.st.maxHp*.37,H.hp-g.st.maxHp*1.5*dt);if(H.hp<P.hp-1){H.hurtT=.1;P.hp=H.hp;}
      if(!u&&(PN()-P.c0)/1000>T.wait)g.darT=Math.min(g.darT,0);
      if(g.q.dars>P.d0||(PN()-P.c0)/1000>T.wait+3){P.ph=4;g.slowT=0;for(i=0;i<g.en.length;i++){e=g.en[i];if(e.dead||e.boss||e.prop)continue;a=Math.hypot(e.x-H.x,e.y-H.y);if(a<300)hitEnemy(e,e.hp+1,(e.x-H.x)/(a||1)*600,(e.y-H.y)/(a||1)*600);}
        g.fx.push({k:'wave',own:1,x:H.x,y:H.y,t:0,dur:.8,r1:320,col:'#ffd84a'});g.shake=12;H.inv=Math.max(H.inv,1.5);P.heal=g.st.maxHp*.8;P.y={t:g.t,s:B3.say('por.saved'),d:4};
        B3.stat('por',{s:'scary',h:P.self?1:0,t:Math.round(g.t),w:Math.round((PN()-P.c0)/100)/10});}}
    if(P.heal){H.hp=Math.min(P.heal,H.hp+g.st.maxHp*.4*dt);if(H.hp>=P.heal)P.heal=0;}});
  B.hook('say',function(t,g){var P=g&&g.b3p;if(P&&(P.m&&P.m.t<2.2||P.y&&g.t-P.y.t<P.y.d&&P.ph>2))return false;},5);
  B.hook('um',function(id,o,g){var P=g&&g.b3p;if(P&&P.ph===3&&o&&!o.auto)P.self=1;});
  B.hook('dar',function(g){var P=g.b3p;if(P&&!g.um&&(P.ph===3&&(PN()-P.c0)/1000<T.wait||P.ph===2&&g.t>T.sc-4))return true;},5);
  B.hook('hurt',function(d,src,g){var P=g&&g.b3p;if(P&&P.ph===3)return false;},15);
  B.hook('down',function(g){var P=g.b3p;if(P&&P.ph===3){g.hero.hp=g.st.maxHp*.37;return true;}},5);
  /* ---------- рисование ---------- */
  function wt(c){var b=VIEW.B;c.setTransform(b,0,0,b,-VIEW.cx*b+cv.width/2,-VIEW.cy*b+cv.height/2);}
  function hut(c,x,y,t,k){var i,f;c.fillStyle='#6b4326';c.fillRect(x-30,y-22,60,36);c.strokeStyle='#4a2c16';c.lineWidth=2;for(i=-14;i<14;i+=8){c.beginPath();c.moveTo(x-30,y+i);c.lineTo(x+30,y+i);c.stroke();}
    c.fillStyle='#3d2614';c.beginPath();c.moveTo(x-38,y-20);c.lineTo(x,y-50);c.lineTo(x+38,y-20);c.fill();c.fillStyle='#ffb02e';c.fillRect(x-8,y-10,16,12);
    c.globalCompositeOperation='lighter';for(i=0;i<4;i++){f=Math.sin(t*9+i*2+k)*.5+1;c.fillStyle=i%2?'rgba(255,90,20,.75)':'rgba(255,200,60,.8)';c.beginPath();c.moveTo(x-26+i*16,y-26);c.quadraticCurveTo(x-30+i*16,y-50-20*f,x-18+i*16+3*Math.sin(t*7+i),y-62-24*f);c.quadraticCurveTo(x-10+i*16,y-46,x-14+i*16,y-24);c.fill();}
    c.globalCompositeOperation='source-over';for(i=0;i<3;i++){f=(t*.35+i/3+k)%1;c.fillStyle='rgba(70,70,80,'+(.35*(1-f))+')';c.beginPath();c.arc(x+8*Math.sin(f*6+k),y-70-f*90,10+f*22,0,7);c.fill();}}
  function mar(c,x,y,fl){c.save();c.translate(x,y);c.scale(fl,1);c.strokeStyle='#7a4a22';c.lineWidth=3.2;c.lineCap='round';c.beginPath();c.moveTo(4,20);c.lineTo(20,-30);c.stroke();
    c.lineWidth=2.6;c.strokeStyle='#5d5d66';c.beginPath();c.arc(21,-36,7,Math.PI*.15,Math.PI*1.05,true);c.stroke();
    c.fillStyle='#d6302a';c.beginPath();c.moveTo(-14,-9);c.bezierCurveTo(-15,-31,16,-31,15,-9);c.quadraticCurveTo(0,-15,-14,-9);c.fill();c.beginPath();c.moveTo(-12,-11);c.lineTo(-20,-2);c.lineTo(-9,-6);c.fill();
    c.fillStyle='#fff';[[-6,-21],[2,-24],[9,-19],[-2,-15],[6,-14]].forEach(function(q){c.beginPath();c.arc(q[0],q[1],1.6,0,7);c.fill();});c.restore();}
  function horse(c,x,y,t,fl){var i,l;c.save();c.translate(x,y);c.scale(fl,1);c.strokeStyle='#5a3418';c.lineWidth=4;c.lineCap='round';for(i=0;i<4;i++){l=Math.sin(t*16+i*1.6)*8;c.beginPath();c.moveTo(-14+i*9,14);c.lineTo(-14+i*9+l,32);c.stroke();}
    c.fillStyle='#8a5428';c.beginPath();c.ellipse(0,10,24,11,0,0,7);c.fill();c.beginPath();c.moveTo(14,6);c.lineTo(26,-14);c.lineTo(36,-10);c.lineTo(22,12);c.fill();c.fillStyle='#3a2210';c.beginPath();c.moveTo(-22,6);c.quadraticCurveTo(-36,8,-34,24);c.lineTo(-24,10);c.fill();c.restore();}
  B.hook('draw',function(c,g){var P=g.b3p,H=g.hero,t=g.t,i,q;if(!P)return;
    for(i=0;i<P.hut.length;i++){q=P.hut[i];if(Math.abs(q[0]-VIEW.cx)<VIEW.ww+80&&Math.abs(q[1]-VIEW.cy)<VIEW.wh+120)hut(c,q[0],q[1],t,i);}
    if(g.hkey==='mar')mar(c,H.x,H.y-bob(H,g),H.flip||1);
    q=P.m;if(q){c.globalAlpha=Math.max(0,Math.min(1,(7-q.t)/2));drawSpr('h_mar_'+(q.t>2.6?Math.floor(t*6)&1:0),q.x,q.y,1,1);wt(c);mar(c,q.x,q.y,1);c.globalAlpha=1;}
    q=P.r;if(q){c.globalAlpha=P.ph===2?Math.max(0,1-q.g/2):1;var x=q.x+(P.ph===2?q.g*220:0);horse(c,x,H.y+6,t,1);if(P.ph===1)drawSpr('h_'+P.k0+'_'+(Math.floor(t*8)&1),x,H.y-18,1,1);wt(c);c.globalAlpha=1;}});
  function bub(c,x,y,s,f,tail){c.font='700 16px '+f;var w=Math.min(c.measureText(s).width,VIEW.W*.62),ln=[],cur='',ws=s.split(' '),i,h;
    for(i=0;i<ws.length;i++){if(cur&&c.measureText(cur+' '+ws[i]).width>w){ln.push(cur);cur=ws[i];}else cur=cur?cur+' '+ws[i]:ws[i];}ln.push(cur);h=ln.length*20+12;w+=20;x=Math.max(6,Math.min(VIEW.W-w-6,x-w/2));y-=h;
    c.fillStyle='rgba(255,250,236,.96)';c.strokeStyle='#3a2412';c.lineWidth=2;c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,10);else c.rect(x,y,w,h);c.fill();c.stroke();
    if(tail){c.beginPath();c.moveTo(tail-7,y+h-1);c.lineTo(tail+4,y+h+10);c.lineTo(tail+7,y+h-1);c.fill();}
    c.fillStyle='#3a2412';c.textAlign='center';c.textBaseline='middle';for(i=0;i<ln.length;i++)c.fillText(ln[i],x+w/2,y+16+i*20);}
  B.hook('drawTop',function(c,g){var P=g.b3p,y=P&&P.y,W=VIEW.W,Hh=VIEW.H,f=typeof CVL!=='undefined'&&CVL.font||'sans-serif',k,x,yy,im,q;if(!P||g.over)return;
    q=P.m;if(q&&q.t<2.4){x=W/2+(q.x-VIEW.cx)*VIEW.zoom;yy=Hh/2+(q.y-VIEW.cy)*VIEW.zoom-46*VIEW.zoom;bub(c,x,yy,q.s,f,x);}
    if(!y)return;k=g.t-y.t;if(k>y.d){P.y=null;return;}k=Math.min(1,k*3,(y.d-k)*3);x=W-40+(1-k)*90;yy=W>Hh*1.2?Hh-130:Hh-200;im=spr('yaga');c.globalAlpha=k;c.fillStyle='rgba(255,246,220,.85)';c.beginPath();c.arc(x,yy,40,0,7);c.fill();
    if(im)c.drawImage(im.c,x-40,yy-44,80,80);bub(c,x-40,yy-42,y.s,f,0);c.globalAlpha=1;});
})();
