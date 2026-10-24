/* b2-mg-torg.js — MG1: «🤝 Торг с поставщиком» (договор — шапка js/b2-mg-core.js; опись — js/b2-mg1.js, id 'torg').
   Дело хозяина «Переговоры с поставщиком». 5 сделок по 100 000 ₽: ДЕРЖИТЕ палец (или пробел) — цена ползёт вниз всё быстрее;
   отпустите до красной зоны. Заехали в красную — Геннадий Палыч обиделся: сделка по полной цене (в разминке — нет).
   Красная зона каждый раз в новом месте, разгон разный — заученный ритм не поможет. Рекорд — сумма скидок. */
(function(root){'use strict';
if(!root.MG)return;
const GOODS=[['Мука, 40 мешков','Flour, 40 sacks','🌾'],['Кофе в зёрнах','Coffee beans','☕'],['Курица, 200 кг','Chicken, 200 kg','🍗'],['Стаканчики, 10 000 шт.','Cups, 10,000 pcs','🥤'],
  ['Лаваш, 3 000 листов','Flatbread, 3,000 sheets','🌯'],['Сахар, тонна','Sugar, one tonne','🍬'],['Овощи на неделю','Veg for a week','🥒']];
const CALM=[['«Товар — огонь! Берите, пока даю»','“Top goods! Take them while I’m offering”'],['«Себе в убыток отдаю!»','“I’m selling at a loss!”'],['«Для вас — как для родного»','“For you — like for family”']];
const WORRY=[['«Ну… себе в убыток…»','“Well… at a loss…”'],['«Жена не поймёт…»','“My wife won’t understand…”'],['«Вы меня без ножа режете!»','“You’re killing me here!”']];
const STRICT=[['«Ещё рубль — и я ухожу!»','“One more rouble and I walk!”'],['«Всё! Предел!»','“That’s it! The limit!”']];
const P0=100,LO=55;
let cur=null;   // отпускание пальца за пределами поля (core слушает только canvas)
if(typeof window!=='undefined')['pointerup','pointercancel'].forEach(t=>window.addEventListener(t,()=>{if(cur&&cur.held())cur.up();}));
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null;
  const R=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
  function round(){s.p=P0;s.v=0;s.hold=false;s.red=R(70,86);s.acc=R(9,22)+s.r*3.5;s.wait=0;s.g=GOODS[(s.g0+s.r)%GOODS.length];s.cl=pick(CALM);s.wl=pick(WORRY);s.sl=pick(STRICT);
    s.loss=(s.loss|0)+1;if(!S.demo&&s.r>0)sh.say(L('«Себе в убыток!» (уже '+s.loss+'-й раз за утро)','“At a loss!” (time no. '+s.loss+' this morning)'));}
  function done(bust){s.hold=false;let won=0;
    if(bust&&!S.warm&&!S.demo){s.fx={t:1.6,a:L('Обиделся! По полной цене','Offended! Full price'),c:'#c62828'};sh.snd('no');s.bust++;}
    else{if(bust)s.p=s.red+.5;won=Math.round((P0-s.p)*1000/100)*100;sh.add(won);sh.snd('coin');
      const near=s.p-s.red<3;s.fx={t:1.6,a:L('Скидка ','Discount ')+won.toLocaleString('ru-RU')+' ₽'+(near?L(' — на грани!',' — on the edge!'):''),c:'#0a7a3a'};}
    s.res.push(won);s.wait=1.5;}
  return {
    reset(demo){s={r:0,res:[],bust:0,g0:Math.floor(Math.random()*GOODS.length),loss:0,fx:null,fg:{x:180,y:440,down:0,cd:.8}};round();},
    step(dt){if(s.fx){s.fx.t-=dt;if(s.fx.t<=0)s.fx=null;}
      if(s.wait>0){s.wait-=dt;if(s.wait<=0){s.r++;if(s.r>=5){s.r=4;s.over=1;sh.end();if(S.demo){s.r=0;s.res=[];s.over=0;round();}return;}round();}return;}
      if(S.demo){const f=s.fg;f.cd-=dt;if(!s.hold&&f.cd<=0){s.hold=true;s.v=0;}if(s.hold&&s.p<=s.red+4){s.hold=false;done(false);f.cd=.8;}f.down=s.hold?1:0;}
      if(s.hold){s.v+=dt*s.acc;s.p-=s.v*dt;if(s.p<=s.red){s.p=s.red;done(true);}}},
    draw(c){c.fillStyle='#eef1f4';c.fillRect(0,0,360,520);
      const m=s.p>s.red+12?0:s.p>s.red+5?1:2;
      // поставщик
      const sk=m===2?Math.sin(Date.now()/40)*2:0;
      c.fillStyle='#fff';sh.rr(c,10,6,340,30,10);c.fill();c.fillStyle='#1d2733';c.font='bold 16px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(s.g[2]+' '+T(s.g)+' · 100 000 ₽',180,22);
      c.save();c.translate(sk,30);
      c.fillStyle='#8e6b3a';sh.rr(c,128,58,104,78,30);c.fill();c.fillStyle=m===2?'#f0b0a0':'#f2c9a5';c.beginPath();c.arc(180,50,32,0,7);c.fill();
      c.fillStyle='#5b3d1e';c.beginPath();c.arc(180,40,30,Math.PI*1.1,Math.PI*1.9);c.fill();
      c.fillStyle='#1d2733';c.beginPath();c.arc(169,50,3,0,7);c.arc(191,50,3,0,7);c.fill();
      c.strokeStyle='#1d2733';c.lineWidth=2;c.beginPath();if(m>0){c.moveTo(162,40);c.lineTo(174,44);c.moveTo(198,40);c.lineTo(186,44);}c.stroke();
      c.strokeStyle='#8a3b32';c.lineWidth=3;c.beginPath();if(m===0)c.arc(180,60,9,.2,Math.PI-.2);else if(m===1){c.moveTo(171,66);c.lineTo(189,66);}else c.arc(180,74,9,Math.PI+.3,-.3);c.stroke();
      if(m===2){c.fillStyle='#5aa9e6';c.beginPath();c.arc(212,38,4,0,7);c.fill();}
      c.restore();
      // реплика
      c.fillStyle='#fff';sh.rr(c,14,168,332,44,12);c.fill();c.fillStyle=m===2?'#c62828':'#1d2733';c.font=(m===2?'bold ':'')+'16px sans-serif';c.textAlign='center';
      c.fillText(T(m===0?s.cl:m===1?s.wl:s.sl),180,190);
      // шкала цены
      const x0=24,x1=336,X=p=>x0+(P0-p)/(P0-LO)*(x1-x0),xr=X(s.red);
      c.fillStyle='#e3f2e5';c.fillRect(x0,226,xr-x0,46);c.fillStyle='#ffd0d0';c.fillRect(xr,226,x1-xr,46);
      c.fillStyle='#c62828';for(let x=xr+6;x<x1;x+=14){c.fillRect(x,226,5,46);}c.fillStyle='rgba(255,208,208,.6)';c.fillRect(xr,226,x1-xr,46);
      c.strokeStyle='#4f5d72';c.lineWidth=1.5;c.strokeRect(x0,226,x1-x0,46);
      c.fillStyle='#0a7a3a';c.font='bold 14px sans-serif';c.fillText(L('торгуемся','haggling'),(x0+xr)/2,249);
      c.fillStyle='#fff';c.fillRect((xr+x1)/2-42,238,84,22);c.fillStyle='#c62828';c.fillText(L('обидится','offended'),(xr+x1)/2,249);
      const xp=X(s.p);c.fillStyle='#1d2733';c.fillRect(xp-3,214,6,70);c.beginPath();c.moveTo(xp-9,212);c.lineTo(xp+9,212);c.lineTo(xp,222);c.fill();
      c.font='13px sans-serif';c.fillStyle='#4f5d72';c.fillText('100 000 ₽',x0+34,292);c.fillText(L('дешевле →','cheaper →'),x1-36,292);
      c.font='bold 26px sans-serif';c.fillStyle='#1d2733';c.fillText(Math.round(s.p*1000).toLocaleString('ru-RU')+' ₽',180,328);
      c.font='15px sans-serif';c.fillStyle='#4f5d72';c.fillText(L('Сделка ','Deal ')+(s.r+1)+L(' из 5 · скидка сейчас ',' of 5 · discount now ')+Math.round((P0-s.p)*1000).toLocaleString('ru-RU')+' ₽',180,354);
      for(let i=0;i<5;i++){c.fillStyle=i<s.res.length?(s.res[i]>0?'#2e7d32':'#c62828'):i===s.r?'#e0a100':'#d5dbe2';c.beginPath();c.arc(132+i*24,380,8,0,7);c.fill();}
      if(s.fx){c.globalAlpha=Math.min(1,s.fx.t*2);c.fillStyle=s.fx.c;c.font='bold 21px sans-serif';c.fillText(s.fx.a,180,412);c.globalAlpha=1;}
      // кнопка-подсказка «держите»
      const on=s.hold;c.fillStyle=on?'#2e7d32':'#fff';sh.rr(c,20,440,320,60,30);c.fill();c.strokeStyle=on?'#2e7d32':'#9aa3ae';c.lineWidth=2;c.stroke();
      c.fillStyle=on?'#fff':'#1d2733';c.font='bold 18px sans-serif';
      c.fillText(s.wait>0?L('Следующая сделка…','Next deal…'):on?L('Держу… отпустите вовремя!','Holding… let go in time!'):L('Нажмите и держите палец','Press and hold'),180,468);},
    down(){if(!s||s.wait>0||s.over)return;s.hold=true;s.v=0;cur=this;},
    up(){if(s&&s.hold&&!S.demo)done(false);},
    held(){return !!(s&&s.hold&&!S.demo&&S.st==='play');},
    key(k,up){if(k!==' '&&k!=='Enter'&&k!=='ArrowDown')return;if(up)this.up();else if(!s.hold)this.down();},
    peek(){return s;},
    finger(){return s&&s.fg?{x:180,y:462,down:s.fg.down>0}:null;}};}
MG.game('torg',{hero:{n:['Геннадий Палыч, поставщик','Gennady, the supplier'],a:'ГП',c:'#8e6b3a',l:['','']},
  how:['<b>Держите палец</b> — цена ползёт вниз. <b>Отпустите до красной зоны</b>, иначе поставщик обидится. 5 сделок по 100 000 ₽.','<b>Hold your finger</b> — the price creeps down. <b>Let go before the red zone</b>, or the supplier takes offence. 5 deals of 100,000 ₽.'],
  go:['«Себе в убыток отдаю!» (уже в третий раз за утро)','“I’m selling at a loss!” (third time this morning)'],
  hand:'hold',dur:0,demoT:12,make,btns:[[(typeof L==='function'?L('✋ Держать (пробел)','✋ Hold (space)'):'✋ Держать'),' ']]});
})(typeof window!=='undefined'?window:globalThis);
