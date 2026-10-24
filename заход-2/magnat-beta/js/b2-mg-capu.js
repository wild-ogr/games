/* b2-mg-capu.js — MG1: «☕ Капучино до черты» (договор — шапка js/b2-mg-core.js; опись — js/b2-mg1.js, id 'capu').
   «Встать за прилавок» в «Кофе с собой», пекарне, у кофейного автомата. 40 с: ДЕРЖИТЕ — льётся молоко с пенкой; отпустите у черты.
   В черту — +1 стакан; недолив — гость ворчит, стакан не считается; через край — минус 2 с. Стаканы разные, струя то быстрее, то медленнее. */
(function(root){'use strict';
if(!root.MG)return;
const SIZES=[['S','S',150,.55],['M','M',180,.62],['L','L',210,.7]];   // буква, высота стакана, где черта (доля)
const ASK=[['«Мне овсяное, но чтобы как коровье»','“Oat milk, but so it tastes like cow’s”'],['«Капучино без пенки. И без кофе. Шучу»','“A cappuccino, no foam. And no coffee. Joking”'],
  ['«Как в Италии, но за 150 ₽»','“Like in Italy, but for 150 ₽”'],['«Большой, но маленький»','“A large one, but small”'],['«С собой. Но выпью тут»','“To go. But I’ll drink it here”'],
  ['«Мне как вчера, только сегодня»','“Same as yesterday, but today”'],['«Побольше пенки, поменьше пенки»','“More foam, less foam”'],['«Я Борин друг. Скидку?»','“I’m Boris’s friend. Discount?”']];
const UNDER=[['Гость: «А где пенка?»','Guest: “Where’s the foam?”'],['Гость: «Недолив! Я всё вижу»','Guest: “Short pour! I can see it”']];
const OKS=[['«Ровно в черту!»','“Right on the line!”'],['«Как в кофейне!»','“Just like a café!”'],['«Я так тоже хочу научиться»','“I want to learn that too”'],['«Гость доволен. Почти»','“The guest is happy. Almost”']];
let cur=null;
if(typeof window!=='undefined')['pointerup','pointercancel'].forEach(t=>window.addEventListener(t,()=>{if(cur&&cur.held())cur.up();}));
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null;
  const R=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
  function cup(){const z=pick(SIZES);s.c={z,h:z[2],line:z[3],lv:.2,sp:R(.28,.5)*(1+Math.min(.5,s.n*.04)),hold:false,ask:pick(ASK),out:0,res:''};
    s.tol=Math.max(.035,.06-s.n*.002);}
  function stop(){const c=s.c;if(!c||c.out)return;c.hold=false;
    const d=c.lv-c.line;let msg,col;
    if(c.lv<.25)return;
    if(Math.abs(d)<=s.tol){sh.add(1);s.n++;sh.snd('coin');c.res='ok';msg=Math.abs(d)<s.tol*.35?L('Идеально!','Perfect!'):L('В черту! +1','On the line! +1');col='#0a7a3a';
      if(s.n%3===0&&!S.demo)sh.say(T(pick(OKS)));}
    else if(d<0){sh.snd('no');c.res='under';msg=T(pick(UNDER));col='#c62828';if(!S.demo)sh.say(L('«Недолив. До черты — ещё чуть-чуть»','“Short pour. A little more to the line”'));}
    else{c.res='over';msg=L('Многовато — не в черту','A bit much — not on the line');col='#c86b3c';sh.snd('no');}
    s.msg={t:.9,a:msg,c:col};c.out=.9;}
  function spill(){const c=s.c;c.hold=false;c.res='spill';c.out=.9;sh.snd('no');sh.pen(2);s.msg={t:.9,a:L('Через край!','Overflow!')+(S.warm||S.demo?'':L(' −2 с',' −2 s')),c:'#c62828'};
    if(!S.demo)sh.say(L('«Ой! Тряпку!.. Отпускайте у черты»','“Oops! A cloth!.. Let go at the line”'));}
  return {
    reset(demo){s={n:0,msg:null,q:4,fg:{cd:.7,down:0}};cup();},
    step(dt){if(s.msg){s.msg.t-=dt;if(s.msg.t<=0)s.msg=null;}const c=s.c;
      if(c.out){c.out-=dt;if(c.out<=0){c.out=0;cup();}return;}
      if(S.demo){const f=s.fg;f.cd-=dt;if(!c.hold&&f.cd<=0)c.hold=true;if(c.hold&&c.lv>=c.line-.012){stop();f.cd=.7;}f.down=c.hold?1:0;}
      if(c.hold){c.lv+=c.sp*dt;if(c.lv>=1.02)spill();}},
    draw(c){c.fillStyle='#f3e9dc';c.fillRect(0,0,360,520);
      // доска меню и очередь
      c.fillStyle='#3b3029';sh.rr(c,10,8,340,58,10);c.fill();c.fillStyle='#f3e9dc';c.font='bold 16px sans-serif';c.textAlign='left';c.textBaseline='middle';
      c.fillText(L('☕ КОФЕ С СОБОЙ','☕ COFFEE TO GO'),22,26);c.font='14px sans-serif';c.fillText(L('капучино S 150 · M 180 · L 210 ₽','cappuccino S 150 · M 180 · L 210 ₽'),22,48);
      for(let i=0;i<4;i++){const x=332-i*28,y=96;c.fillStyle=['#3f63e0','#9c4fb0','#2e7d32','#c86b3c'][i];sh.rr(c,x-10,y,20,30,7);c.fill();c.fillStyle='#f2c9a5';c.beginPath();c.arc(x,y-8,9,0,7);c.fill();}
      c.fillStyle='#4f5d72';c.font='13px sans-serif';c.textAlign='right';c.fillText(L('очередь ждёт','the queue waits'),340,140);
      // заказ
      const k=s.c;c.fillStyle='#fff';sh.rr(c,10,76,200,72,12);c.fill();c.fillStyle='#1d2733';c.textAlign='left';c.font='bold 18px sans-serif';c.fillText(L('Капучино ','Cappuccino ')+k.z[0],22,96);
      c.font='14px sans-serif';c.fillStyle='#4f5d72';const a=T(k.ask);const cut=a.length>26?a.lastIndexOf(' ',26):-1;
      if(cut>0){c.fillText(a.slice(0,cut),22,118);c.fillText(a.slice(cut+1),22,136);}else c.fillText(a,22,118);
      // кофемашина
      c.fillStyle='#8a9099';sh.rr(c,110,158,140,56,10);c.fill();c.fillStyle='#5a6070';c.fillRect(170,214,20,16);c.fillStyle='#fff';c.font='bold 15px sans-serif';c.textAlign='center';c.fillText(L('ЭСПРЕССО','ESPRESSO'),180,186);
      if(k.hold&&!k.out){c.fillStyle='#fffaf0';c.fillRect(176,230,8,Math.max(0,430-230-k.h*Math.min(1,k.lv)));}
      // стакан
      const H=k.h,W2=56,bx=180,by=430,top=by-H,sl=10;
      c.save();c.beginPath();c.moveTo(bx-W2,top);c.lineTo(bx+W2,top);c.lineTo(bx+W2-sl,by);c.lineTo(bx-W2+sl,by);c.closePath();c.fillStyle='rgba(255,255,255,.75)';c.fill();c.clip();
      const lv=Math.min(1.05,k.lv),fy=by-H*lv;
      if(lv<=.201){c.fillStyle='#6b3f1d';c.fillRect(bx-W2,fy,W2*2,H);}
      else{c.fillStyle='#c99a6b';c.fillRect(bx-W2,fy+10,W2*2,H);c.fillStyle='#fffaf0';c.fillRect(bx-W2,fy,W2*2,14);}
      c.restore();c.strokeStyle='#4f5d72';c.lineWidth=3;c.beginPath();c.moveTo(bx-W2,top);c.lineTo(bx-W2+sl,by);c.lineTo(bx+W2-sl,by);c.lineTo(bx+W2,top);c.stroke();
      if(k.res==='spill'){c.fillStyle='#fffaf0';c.beginPath();c.ellipse(bx,by+6,90,10,0,0,7);c.fill();}
      // черта
      const ly=by-H*k.line;c.strokeStyle='#c62828';c.lineWidth=3;c.setLineDash([8,6]);c.beginPath();c.moveTo(bx-W2-24,ly);c.lineTo(bx+W2+24,ly);c.stroke();c.setLineDash([]);
      c.fillStyle='#c62828';c.font='bold 14px sans-serif';c.textAlign='left';c.fillText(L('черта','line'),bx+W2+28,ly);
      c.fillStyle='rgba(46,125,50,.18)';const tp=H*s.tol;c.fillRect(bx-W2-24,ly-tp,16,tp*2);c.fillRect(bx+W2+8,ly-tp,16,tp*2);
      // стойка, счёт, подсказка
      c.fillStyle='#b8865b';c.fillRect(0,432,360,88);c.fillStyle='#a07048';c.fillRect(0,430,360,6);
      c.textAlign='center';
      if(s.msg){c.globalAlpha=Math.min(1,s.msg.t*2);c.fillStyle='#fff';sh.rr(c,30,236,300,40,12);c.fill();c.fillStyle=s.msg.c;c.font='bold 18px sans-serif';c.fillText(s.msg.a,180,256);c.globalAlpha=1;}
      const on=k.hold;c.fillStyle=on?'#2e7d32':'#fff';sh.rr(c,20,448,320,56,28);c.fill();c.fillStyle=on?'#fff':'#1d2733';c.font='bold 18px sans-serif';
      c.fillText(k.out?L('Следующий гость…','Next guest…'):on?L('Льётся… отпустите у черты!','Pouring… let go at the line!'):L('Нажмите и держите палец','Press and hold'),180,476);},
    down(){const k=s&&s.c;if(!k||k.out||k.lv>0&&!k.hold&&k.res)return;k.hold=true;cur=this;},
    up(){if(s&&s.c&&s.c.hold&&!S.demo)stop();},
    held(){return !!(s&&s.c&&s.c.hold&&!S.demo&&S.st==='play');},
    key(k,up){if(k!==' '&&k!=='ArrowDown')return;if(up)this.up();else if(!(s.c&&s.c.hold))this.down();},
    peek(){return s;},
    finger(){return s&&s.fg?{x:180,y:470,down:s.fg.down>0}:null;}};}
MG.game('capu',{hero:{n:['Даша, бариста-стажёр','Dasha, trainee barista'],a:'☕',c:'#8b5a2b',l:['','']},
  how:['<b>Держите палец</b> — льётся молоко. <b>Отпустите у красной черты</b>. Через край — минус 2 с, недолив не считается.','<b>Hold your finger</b> — the milk pours. <b>Let go at the red line</b>. Overflow costs 2 s, a short pour doesn’t count.'],
  go:['«Очередь до двери! Держим — и отпускаем у черты»','“The queue reaches the door! Hold — and let go at the line”'],
  hand:'hold',dur:40,demoT:8,make,btns:[[(typeof L==='function'?L('✋ Наливать (пробел)','✋ Pour (space)'):'✋ Наливать'),' ']]});
})(typeof window!=='undefined'?window:globalThis);
