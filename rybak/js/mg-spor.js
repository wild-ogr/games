/* RB:MGD — мини-игра №14 «Петрович на спор» (00-plan §5, 09-minigames №14).
   Во дворе за столом Петрович предлагает три пари на СЛЕДУЮЩУЮ рыбалку (лёгкое/среднее/трудное → ступень 1/2/3).
   Игрок ничего не ставит (без азарта): выиграл — Петрович платит по таблице оболочки, проиграл — просто посмеётся.
   Итог считает обёртка finish() (не турнир, не «Рыбалка дня»), забирают итог во Дворе — второй запуск игры.
   Сохранение: S.mg.spor = {d: день пари, b: {k:'n'|'sp'|'kg', id, n, x, tier}, st: 'open'|'won'|'lost', c: сколько уловили (для фразы)}. */
(function(){
'use strict';
var A=window.MGDA,Lx=A.L;
function st(){try{if(!S.mg||typeof S.mg!=='object')S.mg={};var m=S.mg.spor;if(!m||typeof m!=='object')return null;if(m.st==='done')return m;
  if(!m.b||typeof m.b!=='object'||['open','won','lost'].indexOf(m.st)<0)return null;var t=+m.b.tier;if(!(t>=1&&t<=3))return null;return m;}catch(e){return null;}}
function today(){try{return dayKey(0);}catch(e){return 0;}}
function save_(){try{save();}catch(e){}}
function fishName(id){try{var f=FISH[id];return Lx(f.n,f.en);}catch(e){return id;}}
function kgS(x){return String(Math.round(x*10)/10).replace('.',',')+' '+Lx('кг','kg');}
function gS(x){return x<1?Math.round(x*1000)+' '+Lx('г','g'):kgS(x);}
/* три пари дня: из рыб самого дальнего открытого места (одинаково у всех с тем же местом) */
function bets(o){var R=A.rng((o.seed||1)*31+7),pi=0;try{pi=topPlace();}catch(e){}
  var P=null;try{P=PLACES[pi];}catch(e){}var ids=(P&&P.fish||['karas','okun','plotva']).filter(function(id){var f=FISH[id];return f&&!f.leg&&f.r>=4;});
  if(!ids.length)ids=['karas'];
  // знакомые игроку — первыми (честнее)
  var known=ids.filter(function(id){try{return S.alb[id]&&S.alb[id].n>0;}catch(e){return false;}});var pool=known.length>=2?known:ids;
  var sp=pool[Math.floor(R()*pool.length)],kgId=pool[Math.floor(R()*pool.length)];if(pool.length>1)while(kgId===sp)kgId=pool[Math.floor(R()*pool.length)];
  var f=FISH[kgId],x=Math.max(.1,Math.round((f.w[0]+(f.w[1]-f.w[0])*(o.calm?.22:.3))*10)/10);
  var n=o.calm?2:3;
  return [{k:'n',n:n,tier:1},{k:'sp',id:sp,tier:2},{k:'kg',id:kgId,x:x,tier:3}];}
function betTitle(b){if(b.k==='n')return b.n+' '+Lx(b.n<5?'рыбы за одну рыбалку':'рыб за одну рыбалку',' fish in one trip');if(b.k==='sp')return fishName(b.id);return fishName(b.id)+' '+Lx('от','over')+' '+gS(b.x);}
function betSub(b){if(b.k==='n')return Lx('Спорим, не наловишь!','Bet you won’t!');if(b.k==='sp')return Lx('Спорим, не поймаешь!','Bet you won’t catch it!');return Lx('Спорим, не вытащишь!','Bet you can’t land it!');}
function check(b,fish){if(!b)return false;if(b.k==='n')return fish.length>=b.n;if(b.k==='sp')return fish.some(function(c){return c.id===b.id;});return fish.some(function(c){return c.id===b.id&&c.w>=b.x-1e-9;});}
/* итог пари — в конце следующей рыбалки */
function hook(){if(typeof finish!=='function'||finish.__mgdSpor)return;var f0=finish;
  finish=function(){var m=st(),was=false;try{was=!!(G&&!G.over);}catch(e){}
    if(was&&m&&m.st==='open'&&!G.tourn){try{var fish=G.catch.filter(function(c){return c.id&&!c.lost;});m.st=check(m.b,fish)?'won':'lost';m.c=fish.length;}catch(e){}}
    var r=f0.apply(this,arguments);
    if(was&&m&&m.st!=='open'&&!m.told){m.told=1;save_();setTimeout(function(){try{toast(m.st==='won'?Lx('Спор с Петровичем выигран! Забери выигрыш во Дворе','You won the bet with Petrovich! Collect it in the Yard'):Lx('Спор с Петровичем: в этот раз не вышло. Загляни во Двор','Bet with Petrovich: no luck this time'));}catch(e){}},1600);}
    return r;};finish.__mgdSpor=1;}
var LINES={hi:[Lx('Ну что, рыбак, поспорим? Ты ничего не ставишь: выиграешь — плачу я, проиграешь — посмеёмся.','Shall we bet? You stake nothing: win — I pay, lose — we laugh.'),
  Lx('Чай налит, кот сыт. Самое время поспорить! Выбирай, что не поймаешь.','Tea’s poured, cat’s fed. Time for a bet!'),
  Lx('Спорим на интерес? Ты рискуешь только моей ухмылкой.','A friendly bet? You only risk my grin.')],
  deal:[Lx('По рукам! Итог посмотрим после следующей рыбалки.','Deal! We’ll see after your next trip.'),Lx('Уговор! Вернёшься с рыбалки — сочтёмся.','Deal! Come back after fishing.')],
  wait:[Lx('Спор в силе! Езжай рыбачить — посмотрим, кто кого.','The bet is on! Go fishing.')],
  won:[Lx('Ну ты даёшь! Уговор дороже денег — держи.','Well I never! A deal is a deal — here.'),Lx('Эх, проспорил я. Кот Васька свидетель — плачу!','I lost! Vaska is my witness — paying up!')],
  lost:[Lx('Ха! Говорил же — не поймаешь! Не горюй, завтра новый спор.','Ha! Told you! Don’t worry — new bet tomorrow.'),Lx('Ну, в этот раз моя взяла. Ничего, отыграешься!','My win this time. You’ll get even!')]};
function pick(a,R){return a[Math.floor((R?R():Math.random())*a.length)];}
var CSS='.mgd-cards{position:absolute;left:0;right:0;bottom:0;padding:0 14px calc(14px + env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:center}'+
'.mgd-card{position:relative;display:flex;align-items:center;width:100%;max-width:520px;min-height:76px;margin-top:10px;padding:8px 14px 8px 8px;border:0;border-radius:16px;background:linear-gradient(180deg,#fffaf0,#f1e2c2);color:#3a2a14;box-shadow:0 8px 20px rgba(0,0,0,.35),inset 0 -2px 0 rgba(150,110,50,.25);font:600 19px/1.2 var(--font,LkGolos,sans-serif);text-align:left;cursor:pointer;transition:transform .15s,opacity .3s}'+
'.mgd-card:active{transform:scale(.97)}.mgd-card:nth-child(1){transform:rotate(-.6deg)}.mgd-card:nth-child(3){transform:rotate(.5deg)}'+
'.mgd .mgd-card canvas{position:static;width:74px;height:56px;flex:none;margin-right:10px}.mgd-card .tx{flex:1}.mgd-card small{display:block;font-weight:400;font-size:17px;color:#6a5032}'+
'.mgd-card .rw{flex:none;text-align:right;margin-left:8px;font-size:18px;color:#7a4a0a}.mgd-card .rw i{display:block;font-style:normal;color:#e8a012;font-size:17px;letter-spacing:1px}'+
'.mgd-card .coin{width:20px;height:20px;vertical-align:-4px}'+
'.mgd-card.gone{opacity:0;transform:translateY(30px)}'+
'html.mg-pc .mgd-card:hover{filter:brightness(1.06);box-shadow:0 10px 26px rgba(0,0,0,.45),0 0 0 3px rgba(255,210,122,.85)}.mgd-card .mg-k{margin:0 8px 0 0}'+
'@media (min-aspect-ratio:11/10){.mgd-cards{flex-direction:row;justify-content:center;align-items:stretch}.mgd-card{max-width:330px;margin:0 8px;flex-direction:column;text-align:center;padding:12px}.mgd .mgd-card canvas{margin:0 0 6px;width:110px;height:72px}.mgd-card .rw{margin:8px 0 0;text-align:center}}';
function css(){if(document.getElementById('mgd-spor-css'))return;var s=document.createElement('style');s.id='mgd-spor-css';s.textContent=CSS;document.head.appendChild(s);}
/* награда спора — своя (в MG_RW.spor монет нет): доля Р по ступени пари, оболочка режет дневным потолком */
var SPOR_C=[0,.2,.35,.5];
function rwCoins(o,tier){return Math.round((SPOR_C[tier]||0)*(o.R||30));}
function cardArt(cv,b){var d=2,w=cv.width=(cv.clientWidth||74)*d,h=cv.height=(cv.clientHeight||56)*d,g=cv.getContext('2d');g.scale(d,d);var W=w/d,H=h/d;
  if(b.k==='n'){var ids=['karas','okun','plotva'];for(var i=0;i<3;i++){g.save();g.translate(W*.5+(i-1)*W*.12,H*.3+i*H*.2);g.rotate(-.15+i*.12);try{drawFish(g,FISH[ids[i]].lk,0,0,W*.6);}catch(e){}g.restore();}}
  else{g.save();g.translate(W/2,H/2);g.rotate(-.12);try{drawFish(g,FISH[b.id].lk,0,0,W*.9);}catch(e){}g.restore();}}

function run(host,o){if(o.bot){var br=bot({bad:0,mid:.5,good:1}[o.bot]||0,o);host.done({score:br.score,tier:br.tier,extra:{c:SPOR_C[br.tier]}});return;}
  css();var Sx=A.stage(host,o),g=Sx.g,R=A.rng((o.seed||1)*7+3),m=st();
  var mode=o.train&&m&&(m.st==='won'||m.st==='lost')?'later':o.train||!m||m.st==='done'&&m.d!==today()?'offer':m.st==='done'?'rest':m.st==='open'?'wait':m.st==='won'?'won':'lost';
  var bg=null,lay={},petr={mood:'sly',pose:'rest',talk:0,armK:0},hs={k:0,on:false},coinsOn=0,cat={lx:0};
  var bl=bets(o),chosen=null,ended=false;
  Sx.resize=function(W,H){bg=null;layout();if(Sx.say&&!Sx.say.classList.contains('hid')&&lastSay)Sx.speak(lastSay[0],lastSay[1],lay.hx,lay.headTop);};
  function layout(){var W=Sx.W,H=Sx.H,wide=W>H*1.1;lay.wide=wide;lay.ty=wide?H*.6:H*.55;lay.s=wide?Math.min(H*.36,W*.25):Math.min(H*.28,W*.6);lay.px=W*.5;lay.tx=wide?W*.18:W*.02;lay.tw=wide?W*.64:W*.96;
    lay.hx=lay.px;lay.headTop=lay.ty-lay.s*.98;}
  layout();
  function bake(){var c=document.createElement('canvas'),d=Sx.d;c.width=Math.round(Sx.W*d);c.height=Math.round(Sx.H*d);var q=c.getContext('2d');q.scale(d,d);A.yard(q,Sx.W,Sx.H);bg=c;}
  var lastSay=null;function speak(t){lastSay=[Lx('Петрович','Petrovich'),t];petr.talk=MGDA.talkT(t);Sx.speak(lastSay[0],t,lay.hx,lay.headTop);}
  // заголовок
  var top=Sx.el('div','mgd-top');var ttl=Sx.el('div','mgd-ttl',Lx('Спор с Петровичем','A bet with Petrovich'),top);
  A.leaves(Sx,6);
  Sx.frame=function(dt,t){var W=Sx.W,H=Sx.H;if(!bg)bake();g.drawImage(bg,0,0,W,H);A.leafTick(Sx);
    if(petr.talk>0)petr.talk-=dt;
    // кот на краю стола
    var cs=lay.s*.42;A.cat(g,lay.wide?lay.tx+lay.tw*.9:W*.86,lay.ty+cs*.05,cs,t,{lx:Math.sin(t*.7)});
    // Петрович
    if(hs.on){hs.k=Math.min(1,hs.k+dt*2.2);}
    var shakeY=hs.on&&hs.k>=1?Math.sin(t*16)*lay.s*.02:0;
    var rh=hs.on?{x:lay.px+lay.s*.12,y:lay.ty+lay.s*(.06+.22*A.ease(hs.k))+shakeY}:null;
    var po={mood:petr.mood,talk:petr.talk>0,pose:petr.pose,rhand:rh,lx:Math.sin(t*.5)*.6,noArms:true};A.petr(g,lay.px,lay.ty,lay.s,t,po);
    // стол и вещи, потом руки на столе
    A.table(g,lay.tx,lay.ty,lay.tw,H-lay.ty+lay.s*.2,{seed:3});po.noArms=false;po.armsOnly=true;A.petr(g,lay.px,lay.ty,lay.s,t,po);
    things(g,t);
    if(coinsOn>0){for(var i=0;i<Math.min(12,Math.floor(coinsOn));i++){A.coin(g,lay.px-lay.s*.25+(i%4)*lay.s*.06+(i>7?lay.s*.03:0),lay.ty+lay.s*.12-Math.floor(i/4)*lay.s*.035,lay.s*.04,.3);}}
    // рука игрока снизу (рукопожатие)
    if(hs.on){var k=A.ease(hs.k),hx=lay.px+lay.s*.14,hy=lay.ty+lay.s*.3+shakeY,bx=lay.px+lay.s*.55,by=H+20;var px=bx+(hx-bx)*k,py=by+(hy-by)*k;
      g.strokeStyle='#3f6b4a';g.lineWidth=lay.s*.16;g.lineCap='round';g.beginPath();g.moveTo(bx,by);g.lineTo(px+lay.s*.05,py+lay.s*.05);g.stroke();
      g.fillStyle='#ecc09a';A.ell(g,px,py,lay.s*.07,lay.s*.055,-.4);g.fill();}};
  function things(g,t){var s=lay.s,y=lay.ty+s*.02,x=lay.px;
    // чайник
    var kx=lay.wide?x-s*.75:x-s*.62,ky=y+s*.05;g.fillStyle='rgba(0,0,0,.2)';A.ell(g,kx,ky+s*.02,s*.15,s*.03);g.fill();var kg=g.createRadialGradient(kx-s*.05,ky-s*.12,s*.02,kx,ky-s*.08,s*.18);kg.addColorStop(0,'#ff8a7a');kg.addColorStop(1,'#b8291e');g.fillStyle=kg;A.ell(g,kx,ky-s*.08,s*.13,s*.1);g.fill();
    g.fillStyle='#fff';[[-.06,-.1],[.04,-.12],[-.01,-.04],[.07,-.05],[-.08,-.03]].forEach(function(p){A.ell(g,kx+p[0]*s,ky+p[1]*s,s*.012,s*.012);g.fill();});
    g.strokeStyle='#b8291e';g.lineWidth=s*.025;g.beginPath();g.moveTo(kx+s*.11,ky-s*.08);g.quadraticCurveTo(kx+s*.2,ky-s*.12,kx+s*.21,ky-s*.18);g.stroke();g.beginPath();g.arc(kx,ky-s*.17,s*.07,Math.PI,0);g.stroke();
    // пар
    if(!Sx.calm){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;for(var i=0;i<2;i++){var ph=(t*.6+i*.5)%1;g.globalAlpha=1-ph;g.beginPath();g.moveTo(kx+s*.21,ky-s*.2-ph*s*.2);g.quadraticCurveTo(kx+s*.25+Math.sin(t*3+i)*s*.03,ky-s*.25-ph*s*.2,kx+s*.21,ky-s*.3-ph*s*.2);g.stroke();}g.globalAlpha=1;}
    // кружки
    [[x+s*.5,y+s*.08],[x-s*.36,y+s*.1]].forEach(function(p,j){g.fillStyle='rgba(0,0,0,.2)';A.ell(g,p[0]+3,p[1]+s*.01,s*.07,s*.02);g.fill();g.fillStyle=j?'#f2f0ea':'#3f7fb6';A.rr(g,p[0]-s*.055,p[1]-s*.1,s*.11,s*.1,s*.02);g.fill();g.fillStyle='#6b3a1a';A.ell(g,p[0],p[1]-s*.1,s*.05,s*.012);g.fill();g.strokeStyle=j?'#f2f0ea':'#3f7fb6';g.lineWidth=s*.018;g.beginPath();g.arc(p[0]+s*.065,p[1]-s*.05,s*.03,-1.4,1.4);g.stroke();});
    // блюдце с яблоками
    var ax=lay.wide?x+s*.8:x+s*.62,ay=y+s*.1;g.fillStyle='#f4f0e6';A.ell(g,ax,ay,s*.14,s*.04);g.fill();[[-.05,-.03,'#e8472f'],[.05,-.035,'#f0a030'],[0,-.06,'#d93a2a']].forEach(function(p){var r=s*.045,ag=g.createRadialGradient(ax+p[0]*s-r*.3,ay+p[1]*s-r*.3,1,ax+p[0]*s,ay+p[1]*s,r);ag.addColorStop(0,'#ffe9a0');ag.addColorStop(.5,p[2]);ag.addColorStop(1,'#8a2010');g.fillStyle=ag;A.ell(g,ax+p[0]*s,ay+p[1]*s,r,r);g.fill();});}

  var cardsBox=null;
  function showCards(){cardsBox=Sx.el('div','mgd-cards');bl.forEach(function(b){var c=document.createElement('button');c.type='button';c.className='mgd-card';var cv=document.createElement('canvas');c.appendChild(cv);
    var tx=document.createElement('div');tx.className='tx';tx.innerHTML=Sx.kc(String(bl.indexOf(b)+1))+betTitle(b)+'<small>'+betSub(b)+'</small>';c.appendChild(tx);
    var rw=document.createElement('div');rw.className='rw';var n=rwCoins(o,b.tier);rw.innerHTML='<i>'+['','★','★★','★★★'][b.tier]+'</i>'+(o.train?Lx('понарошку','for fun'):'+'+n+' '+A.coinSvg());c.appendChild(rw);
    c.onclick=function(){if(chosen)return;A.snd('tap');choose(b,c);};cardsBox.appendChild(c);Sx.later(function(){cardArt(cv,b);},0);});
    // RB:MGPC плашка клавиш над карточками
    Sx.kbd(Lx('Щёлкни по пари. Клавиши: '+Sx.kc('1')+Sx.kc('2')+Sx.kc('3')+' или '+Sx.kc('←')+Sx.kc('→')+' — выбрать, '+Sx.kc('Enter')+' — по рукам','Click a bet. Keys: '+Sx.kc('1')+Sx.kc('2')+Sx.kc('3')+' or '+Sx.kc('←')+Sx.kc('→')+' — select, '+Sx.kc('Enter')+' — shake on it'),8,cardsBox.offsetHeight+14);}
  // RB:MGPC клавиши: 1/2/3 или стрелки — выбрать пари (пунктир), Enter/пробел — по рукам; кнопки после — Enter (data-enter)
  Sx.nav(function(){return cardsBox&&!chosen?Array.prototype.slice.call(cardsBox.children):[];},{sel:true});host.amb('yard','day');
  function choose(b,el){chosen=b;Array.prototype.forEach.call(cardsBox.children,function(c){if(c!==el)c.classList.add('gone');});
    Sx.later(function(){el.classList.add('gone');},350);
    petr.pose='shake';petr.mood='smile';hs.on=true;hs.k=0;
    Sx.later(function(){A.snd('hook');A.burst(Sx,lay.px+lay.s*.14,lay.ty+lay.s*.3,22,['#ffd27a','#fff','#ff8f4f']);Sx.fx.push({k:'txt',s:Lx('По рукам!','Deal!'),x:Sx.W/2,y:lay.ty-lay.s*.1,t:0,life:1.6,px:Math.round(Math.min(44,Sx.W*.1))});speak(pick(LINES.deal,R));},Sx.calm?100:500);
    if(!o.train){try{S.mg.spor={d:today(),b:b,st:'open'};save_();}catch(e){}}
    Sx.later(function(){hs.on=false;petr.pose='rest';var bar=Sx.el('div','mgd-bar');var row=Sx.el('div','mgd-row',null,bar);
      Sx.btn('pri',A.icon('rod')+Lx('Пойду ловить!','Off to fish!'),function(){ended=true;host.quit();},row,'Enter');},Sx.calm?700:1900);}
  function finish_(r){if(ended)return;ended=true;host.done(r);}
  function settle(){var won=m.st==='won',b=m.b;petr.mood=won?'wow':'laugh';petr.pose=won?'scratch':'rest';
    speak(won?pick(LINES.won,R):pick(LINES.lost,R));
    if(won){Sx.later(function(){petr.mood='smile';petr.pose='hold';var n=0;(function tick(){coinsOn+=1;A.snd('coin');if(++n<Math.min(12,2+b.tier*3))Sx.later(tick,Sx.calm?20:120);})();},900);}
    var tier=won?b.tier:0;try{S.mg.spor={d:m.d,st:'done'};save_();}catch(e){}
    Sx.later(function(){Sx.hush();var c=rwCoins(o,tier);
      finish_({score:0,tier:tier,rec:false,title:won?Lx('Спор выигран!','Bet won!'):Lx('Петрович выиграл','Petrovich won'),
        scoreTxt:Lx('Пари','Bet')+': <b>'+betTitle(b)+'</b>',
        extra:{c:won?SPOR_C[tier]:0,line:won?Lx('Петрович проспорил и платит по уговору.','Petrovich lost and pays as agreed.'):Lx('Не беда — ты ничего не терял. Завтра новый спор!','No loss — new bet tomorrow!')}});},Sx.calm?600:2600);}
  // старт по режиму
  Sx.later(function(){
    if(mode==='offer'){petr.mood='sly';speak(pick(LINES.hi,R));showCards();}
    else if(mode==='wait'){petr.mood='sly';petr.pose='point';speak(pick(LINES.wait,R)+'<br><span style="color:var(--gold,#ffd27a)">'+betTitle(m.b)+'</span>');var bar=Sx.el('div','mgd-bar');var row=Sx.el('div','mgd-row',null,bar);Sx.btn('pri',A.icon('rod')+Lx('На рыбалку','Go fishing'),function(){host.quit();},row,'Enter');}
    else if(mode==='later'){petr.mood='smile';speak(Lx('Итог спора посчитаем завтра — на сегодня ты своё во дворе уже получил.','We’ll settle the bet tomorrow.'));var bar3=Sx.el('div','mgd-bar');var row3=Sx.el('div','mgd-row',null,bar3);Sx.btn('',Lx('Ладно','OK'),function(){host.quit();},row3,'Enter');}
    else if(mode==='rest'){petr.mood='smile';petr.pose='cross';speak(Lx('На сегодня поспорили — хватит! Приходи завтра, новое пари придумаю.','Enough bets for today! Come back tomorrow.'));var bar2=Sx.el('div','mgd-bar');var row2=Sx.el('div','mgd-row',null,bar2);Sx.btn('',Lx('Ладно','OK'),function(){host.quit();},row2,'Enter');}
    else settle();},Sx.calm?50:450);
  run.stopFn=function(){Sx.stop();};}
function stop(){if(run.stopFn)run.stopFn();}
/* авто-игрок: плохой — выбирает лёгкое и проигрывает, средний — среднее и выигрывает, хороший — трудное и выигрывает */
function bot(skill,o){var b=bets(o),pick=skill<.34?b[0]:skill<.67?b[1]:b[2];var R=A.rng((o.seed||1)+Math.round(skill*100)),pWin=[0,.75,.5,.3][pick.tier]+skill*.25;var won=skill<.34?false:R()<pWin||skill>=.67;
  return {score:won?1:0,tier:won?pick.tier:0,bet:pick.k};}
/* «Дело» во дворе: есть ли что делать (новое пари или готовый итог) */
function badge(){var m=st();return !m||m.st==='won'||m.st==='lost'||m.st==='done'&&m.d!==today();}
hook();
MG_REG({id:'spor',n:{ru:'Спор с Петровичем',en:'A bet with Petrovich'},icon:'medal',kind:'event',ready:badge,run:run,stop:stop,
  _t:{bets:bets,check:check,betTitle:betTitle}});
})();
