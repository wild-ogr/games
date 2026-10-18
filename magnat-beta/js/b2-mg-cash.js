/* b2-mg-cash.js — MG1: «💵 Пересчитай кассу» (договор — шапка js/b2-mg-core.js; опись — js/b2-mg1.js, id 'cash').
   Дело хозяина «Проверка точки» и «Встать за прилавок» в ларьке/магазине. 30 с: настоящую купюру (СЕРЕБРЯНАЯ ПОЛОСА) — вправо, в кассу;
   фальшивку — влево. Фальшивка: нет полосы, «Банк приколов», 3000 ₽. Памятка — всегда сверху; ошибка — минус 5 с и объяснение, что не так.
   Первые купюры идут по порядку — показать каждый вид. Палец: смахнуть; кнопки снизу; ПК — ← и →. */
(function(root){'use strict';
if(!root.MG)return;
const DEN=[100,500,1000,2000,5000],COL={100:'#a88f5e',500:'#8d63a8',1000:'#3f8f7f',2000:'#3f63b4',5000:'#b5563a',3000:'#6d7f3a'};
// порядок первых купюр: '' — настоящая, иначе вид подделки
const ORD=['','strip','','bank','','','3000'];
const WHY={strip:['нет серебряной полосы','no silver strip'],bank:['написано «Банк приколов»','it says “Joke Bank”'],'3000':['купюр в 3000 ₽ не бывает','there’s no 3000 ₽ note'],ok:['полоса на месте — настоящая','the strip is there — it’s real']};
const PRAISE=[['«Сходится! Люблю, когда сходится»','“It adds up! I love it when it adds up”'],['«Глаз — алмаз»','“Eagle eye”'],['«Касса любит счёт»','“The till loves counting”'],
  ['«Банк приколов к нам больше не ходит»','“The Joke Bank doesn’t come round any more”']];
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null;
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  function next(){const i=s.k++;let ft=i<ORD.length?ORD[i]:(Math.random()<.3?pick(['strip','bank','3000']):'');let d=pick(DEN);if(ft==='3000')d=3000;s.b={d,ft,x:0,y:0};}
  function dec(dir){if(!s||!s.b||s.fly)return;const b=s.b,fake=!!b.ft,ok=(dir>0)!==fake;s.fly={b,dir,t:0};
    if(ok){if(dir>0){sh.add(b.d);sh.snd('coin');sh.fx(dir>0?300:60,330,'+'+b.d.toLocaleString('ru-RU')+' ₽','#0a7a3a');}
      else{sh.snd('tap');sh.fx(70,330,L('Верно, фальшивка!','Right, a fake!'),'#0a7a3a');s.caught++;}
      s.run++;if(s.run%6===0&&!S.demo)sh.say(T(pick(PRAISE)));}
    else{sh.pen(5);sh.snd('no');s.run=0;const w=T(WHY[b.ft||'ok']);
      s.err={t:2.2,a:fake?L('Это была фальшивка!','That was a fake!'):L('Настоящая была!','It was real!'),b:w};
      if(!S.demo)sh.say(L('«'+(fake?'Это фальшивка: ':'Купюра настоящая: ')+w+'»'+(S.warm?'':' Минус 5 секунд.'),'“'+(fake?'That’s a fake: ':'It’s real: ')+w+'”'+(S.warm?'':' Minus 5 seconds.')));}
    next();}
  function bill(c,b,ox,oy,sc){const w=230*sc,h=118*sc,x=180-w/2+ox,y=172+oy;c.save();c.translate(x,y);c.scale(sc,sc);
    c.fillStyle='rgba(0,0,0,.18)';sh.rr(c,4,6,230,118,10);c.fill();
    c.fillStyle=COL[b.d]||'#7b8794';sh.rr(c,0,0,230,118,10);c.fill();
    c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=3;sh.rr(c,6,6,218,106,7);c.stroke();
    c.fillStyle='rgba(255,255,255,.22)';c.beginPath();c.arc(48,70,28,0,7);c.fill();
    if(b.ft!=='strip'){const g=c.createLinearGradient(96,0,120,0);g.addColorStop(0,'#c9ced6');g.addColorStop(.5,'#ffffff');g.addColorStop(1,'#9aa3ae');c.fillStyle=g;c.fillRect(96,0,24,118);
      c.fillStyle='rgba(60,70,80,.55)';for(let i=0;i<5;i++){c.beginPath();c.arc(108,14+i*23,4,0,7);c.fill();}}
    c.fillStyle='#fff';c.font='bold 34px sans-serif';c.textAlign='right';c.textBaseline='alphabetic';c.fillText(String(b.d),220,44);
    c.font='bold 12px sans-serif';c.textAlign='left';c.fillText(L('БИЛЕТ БАНКА','BANK NOTE'),12,22);c.font='bold 13px sans-serif';c.fillText('₽',196,100);
    if(b.ft==='bank'){c.save();c.translate(115,66);c.rotate(-.16);c.fillStyle='rgba(255,255,255,.93)';c.fillRect(-112,-18,224,36);c.fillStyle='#c62828';c.font='bold 21px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(L('БАНК ПРИКОЛОВ','JOKE BANK'),0,1);c.restore();}
    c.restore();}
  return {
    reset(demo){s={k:0,b:null,fly:null,sx:null,run:0,caught:0,err:null,fg:{x:180,y:240,down:0,ph:0,cd:1.1}};next();},
    step(dt){if(s.fly){s.fly.t+=dt;if(s.fly.t>.25)s.fly=null;}if(s.err){s.err.t-=dt;if(s.err.t<=0)s.err=null;}
      if(s.b&&s.sx==null&&s.b.x)s.b.x*=Math.max(0,1-dt*12);
      if(S.demo&&s.b){const f=s.fg;f.cd-=dt;if(f.down)f.down=Math.max(0,f.down-dt);
        if(f.cd>0){f.x+=(180-f.x)*Math.min(1,dt*6);f.y+=(235-f.y)*Math.min(1,dt*6);}
        else{const dir=s.b.ft?-1:1;f.down=.1;f.x+=dir*dt*520;s.b.x=f.x-180;if(Math.abs(f.x-180)>110){dec(dir);f.cd=1.1;f.down=0;}}}},
    draw(c){c.fillStyle='#e7ecf1';c.fillRect(0,0,360,520);
      // зоны по бокам
      c.fillStyle='rgba(198,40,40,.13)';c.fillRect(0,150,44,300);c.fillStyle='rgba(46,125,50,.15)';c.fillRect(316,150,44,300);
      c.font='bold 15px sans-serif';c.textAlign='center';c.textBaseline='middle';
      c.fillStyle='#c62828';c.save();c.translate(22,318);c.rotate(-Math.PI/2);c.fillText(L('ФАЛЬШИВКА','FAKE'),0,0);c.restore();
      c.fillStyle='#0a7a3a';c.save();c.translate(338,318);c.rotate(Math.PI/2);c.fillText(L('В КАССУ','TILL'),0,0);c.restore();
      c.font='bold 30px sans-serif';c.fillStyle='#c62828';c.fillText('←',22,180);c.fillStyle='#0a7a3a';c.fillText('→',338,180);c.font='bold 15px sans-serif';
      // памятка
      c.fillStyle='#fff';sh.rr(c,8,6,344,136,12);c.fill();c.strokeStyle='#d5dbe2';c.lineWidth=1.5;c.stroke();
      const g=c.createLinearGradient(20,0,36,0);g.addColorStop(0,'#c9ced6');g.addColorStop(.5,'#fff');g.addColorStop(1,'#9aa3ae');c.fillStyle=g;c.fillRect(20,16,16,30);c.strokeStyle='#9aa3ae';c.strokeRect(20,16,16,30);
      c.textAlign='left';c.fillStyle='#0a7a3a';c.font='bold 16px sans-serif';c.fillText(L('Настоящая — с серебряной полосой','Real — with a silver strip'),44,31);
      c.fillStyle='#c62828';c.font='bold 16px sans-serif';c.fillText(L('✗ Фальшивка, если:','✗ It’s a fake if:'),16,62);c.font='16px sans-serif';
      c.fillText(L('• нет серебряной полосы','• no silver strip'),26,86);c.fillText(L('• написано «Банк приколов»','• it says “Joke Bank”'),26,108);c.fillText(L('• купюра 3000 ₽ (таких нет!)','• a 3000 ₽ note (there’s no such thing!)'),26,130);
      // купюры
      if(s.fly){const p=Math.min(1,s.fly.t/.25);bill(c,s.fly.b,s.fly.dir*(60+p*260),p*30,1-p*.4);}
      if(s.b&&(!s.fly||s.fly.t>.08))bill(c,s.b,s.b.x,0,1);
      // касса
      c.textAlign='center';c.fillStyle='#1d2733';c.font='bold 21px sans-serif';c.fillText(L('В кассе: ','In the till: ')+Math.round(S.score).toLocaleString('ru-RU')+' ₽',180,322);
      if(s.caught){c.font='15px sans-serif';c.fillStyle='#4f5d72';c.fillText(L('Поймано фальшивок: ','Fakes caught: ')+s.caught,180,346);}
      if(s.err){c.globalAlpha=Math.min(1,s.err.t*2);c.fillStyle='#fff3f3';sh.rr(c,24,362,312,64,12);c.fill();c.strokeStyle='#c62828';c.lineWidth=2;c.stroke();
        c.fillStyle='#c62828';c.font='bold 18px sans-serif';c.fillText(s.err.a+(S.warm||S.demo?'':L(' −5 с',' −5 s')),180,383);c.font='16px sans-serif';c.fillStyle='#1d2733';c.fillText(s.err.b,180,408);c.globalAlpha=1;}
      c.fillStyle='#4f5d72';c.font='15px sans-serif';c.fillText(L('Смахните купюру пальцем или жмите кнопки','Swipe the note or use the buttons'),180,450);},
    down(x,y){s.sx=x;s.sy=y;},
    move(x,y){if(s.sx!=null&&s.b)s.b.x=Math.max(-110,Math.min(110,x-s.sx));},
    up(x,y){if(s.sx==null)return;const dx=x-s.sx;s.sx=null;if(Math.abs(dx)>35)dec(dx>0?1:-1);else if(x<60)dec(-1);else if(x>300)dec(1);},
    key(k,up){if(up)return;if(k==='ArrowRight'||k==='d'||k==='в')dec(1);else if(k==='ArrowLeft'||k==='a'||k==='ф')dec(-1);},
    peek(){return s;},dec,
    finger(){return s&&s.fg?{x:s.fg.x,y:s.fg.y,down:s.fg.down>0}:null;}};}
MG.game('cash',{hero:{n:['Людмила Санна','Lyudmila Sanna'],a:'ЛС',c:'#667085',l:['','']},
  how:['Купюру с <b>серебряной полосой</b> — <b>вправо, в кассу</b>. Фальшивку — <b>влево</b>. Памятка — сверху. Ошибка — минус 5 с.','A note with a <b>silver strip</b> goes <b>right, into the till</b>. A fake goes <b>left</b>. The cheat sheet is at the top. A mistake costs 5 s.'],
  go:['«Касса любит счёт. А я люблю, когда сходится»','“The till loves counting. And I love it when it adds up”'],
  hand:'swipe',dur:30,demoT:8,make,btns:[['← '+(typeof L==='function'?L('Фальшивка','Fake'):'Фальшивка'),'ArrowLeft'],[(typeof L==='function'?L('В кассу','Till'):'В кассу')+' →','ArrowRight']]});
})(typeof window!=='undefined'?window:globalThis);
