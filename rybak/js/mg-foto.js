/* RB:MGC (08.10.2026) — мини-игра №11 «Фото с трофеем» (+ «Поделиться» в VK/ОК).
   После трофея, рекорда или легенды: Петрович держит рыбу, ты — с телефоном. Рыба иногда дёргается, Петрович моргает.
   Жми «Снимаю!», когда оба спокойны (окна спокойствия ≥ 1 с, в спокойном режиме ≥ 1,6 с). Три кадра, в альбом идёт лучший.
   Рыбы Красной книги (rarOf(id)==='redbook' из реестра NORTH js/places.js, или o.fish.rb): «сфотографировался и отпустил» — красная карточка, после фото рыба уходит в воду.
   Вход: o.fish = {id, w (кг), pi (место), k:'tr'|'rec'|'leg'|'new'|'rb', tod, wx}. Без него (стенд) — щука 4,2 кг с Речки.
   Сохранение: фото — в общий альбом S.ph (a1PhAdd из index.html, тот же формат), счётчики — S.mg.foto = {n, best, rb:{id:1}}.
   Награда: host.done({score: качество 0..3, tier, extra:{ph, id, rb, share}}). Делиться — без наград (правила VK). */
(function(){
'use strict';
var ID='foto',A=window.MGCA,PEND=null;/* ждущее фото: {id,w,pi,k,rb} — ставит mgcFoto() из карточки улова */
function L2(ru,en){return typeof L==='function'?L(ru,en):ru;}
function kc(k){return window.MG&&MG.kc?MG.kc(k):'';} /* RB:MGPC значок клавиши (виден только на ПК) */
function snd(k){try{if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(e){}}
function vib(ms){try{if(typeof buzz==='function')buzz(ms);}catch(e){}}
function st(){if(typeof S==='undefined')return {rb:{}};if(!S.mg||typeof S.mg!=='object')S.mg={};var m=S.mg[ID];if(!m||typeof m!=='object')m=S.mg[ID]={};if(!m.rb||typeof m.rb!=='object')m.rb={};return m;}
function fishOf2(id){return typeof fishOf==='function'?fishOf(id):(typeof FISH!=='undefined'&&FISH[id])||null;}
function nameOf(o){return o?(typeof nm==='function'?nm(o):o.n):'';}
function kg(w){return typeof kgTxt==='function'?kgTxt(w):(w.toFixed(2)+' кг');}
/* Красная книга — по реестру NORTH (js/places.js: rarOf(id)==='redbook', поле rel:1 — отпускать) */
function isRb(f,id){var F=fishOf2(id);try{if(typeof rarOf==='function'&&(rarOf(id)==='rb'||rarOf(id)==='redbook'))return true;}catch(e){}return !!(f.rb||f.k==='rb'||F&&(F.rar==='redbook'||F.rar==='rb'));}
function rbColor(){try{if(typeof RAR!=='undefined'&&(RAR.rb||RAR.redbook))return (RAR.rb||RAR.redbook).c;}catch(e){}return '#c62828';}
/* можно ли сейчас поделиться и как: VK (не ОК) — история с картинкой; ОК/VK — ссылкой через SOC */
function shareWay(){if(typeof PLAT==='undefined'||PLAT!=='vk')return '';if(typeof a1StoryOk==='function'&&a1StoryOk())return 'story';if(typeof SOC!=='undefined'&&SOC.share&&(typeof OK==='undefined'||!OK||typeof OK_LINK!=='undefined'&&OK_LINK))return 'link';return '';}

function needArt(cb){if(window.MGCA){A=window.MGCA;cb();return true;}var s=document.createElement('script');s.src='js/mg-mgc-art.js';s.onload=function(){A=window.MGCA;cb();};document.head.appendChild(s);return false;}
function run(host,o){
  if(!window.MGCA){needArt(function(){run(host,o);});return;}A=window.MGCA;
  o=o||{};A.css();var m=st(),q=new URLSearchParams(location.search),bot=o.bot||'',calm=!!o.calm;
  var f=o.fish||PEND||{id:q.get('fish')||'shuka',w:+(q.get('w')||4.2),pi:+(q.get('p')||1),k:q.get('k')||'tr'};
  var F=fishOf2(f.id)||(typeof FISH!=='undefined'?FISH.shuka:null),rb=isRb(f,f.id)||q.get('rb')==='1',place=typeof PLACES!=='undefined'?PLACES[f.pi||0]:null;
  var tod=f.tod||o.tod||q.get('tod')||(A.todNow()==='night'?'evening':A.todNow()),wx=f.wx||'sun',look=place?place.look:'birch';
  var root=document.createElement('div');root.className='mgc mgc-foto';host.el.appendChild(root);
  var cv=document.createElement('canvas');root.appendChild(cv);var g=cv.getContext('2d');
  root.insertAdjacentHTML('beforeend','<div class="mgc-top"><div class="mgc-ttl"></div><div class="mgc-sub"></div></div><div class="mgc-say"></div><div class="mgc-bot"></div><div class="mgc-fin"></div>');
  var $=function(s){return root.querySelector(s);},ttl=$('.mgc-ttl'),sub=$('.mgc-sub'),sayEl=$('.mgc-say'),botEl=$('.mgc-bot'),fin=$('.mgc-fin');A.fontOf(root);
  var W,H,G0,P,BG,T=0,last=0,raf=0,dead=false,ph='aim',phT=0,sayT=0,flash=0,parts=[],FL=null;
  var shots=[],SHOTS=3,best=null,tw={on:0,t:0,next:1.6},bl={on:0,t:0,next:2.4},cat={look:0};
  function say(txt,ms){sayEl.innerHTML=(window.LOOK&&LOOK.av?'<div class="av">'+LOOK.av('petr')+'</div>':'')+'<div><b>'+L2('Петрович','Petrovich')+':</b> '+txt+'</div>';sayEl.classList.add('on');sayT=(ms||3600)/1000;}
  function ic(k){return window.LOOK?LOOK.I(k):'';}
  function resize(){var r=root.getBoundingClientRect();W=Math.max(200,r.width);H=Math.max(200,r.height);var d=A.dpr();cv.width=Math.round(W*d);cv.height=Math.round(H*d);g.setTransform(d,0,0,d,0,0);
    G0=A.geo(W,H,{shY:W>H*1.1?.66:.6});P=A.pal(look,tod,wx);
    BG=document.createElement('canvas');BG.width=cv.width;BG.height=cv.height;var b=BG.getContext('2d');b.scale(d,d);A.scene(b,W,H,G0,P,{seed:(f.pi||0)*131+7,shore:false});ground(b);
    FL=tod==='evening'?A.flies(8,W,G0.hz,G0.shY,7):null;}
  /* берег во всю ширину: трава, песок у воды, кусты камыша по краям */
  function ground(b){var u=G0.u,y0=G0.shY,R=A.rng(77);
    b.fillStyle=P.tint('#8a7a52');b.beginPath();b.moveTo(-5,y0+u*1.4);for(var x=0;x<=W+10;x+=W/14)b.lineTo(x,y0-u*.2+Math.sin(x*.04+1)*u*.8);b.lineTo(W+5,H);b.lineTo(-5,H);b.fill();
    var gg=b.createLinearGradient(0,y0,0,H);gg.addColorStop(0,P.tint('#6c9b43'));gg.addColorStop(1,P.tint('#36601f'));b.fillStyle=gg;
    b.beginPath();b.moveTo(-5,y0+u*3);for(x=0;x<=W+10;x+=W/18)b.lineTo(x,y0+u*2.2+Math.sin(x*.06+2)*u*1.2);b.lineTo(W+5,H);b.lineTo(-5,H);b.fill();
    b.strokeStyle=P.tint('#86b050');b.lineWidth=Math.max(1,u*.32);b.beginPath();for(var i=0;i<200;i++){var xx=R()*W,yy=y0+u*3+R()*(H-y0);b.moveTo(xx,yy);b.lineTo(xx+(R()-.5)*u*2,yy-u*(1.2+R()*2.4));}b.stroke();
    /* ромашки */
    for(i=0;i<16;i++){var cx=R()*W,cy=y0+u*4+R()*(H-y0-u*4),r=u*(.5+R()*.4);b.fillStyle=P.tint('#f6f2ea');for(var j=0;j<6;j++){var a=j/6*Math.PI*2;b.beginPath();b.ellipse(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.6,r*.6,r*.3,a,0,7);b.fill();}b.fillStyle=P.tint('#f2c84a');b.beginPath();b.arc(cx,cy,r*.45,0,7);b.fill();}}
  function petrBox(){var land=G0.land;return {x:W*.5,y:H*(land?.97:.9),h:H*(land?.62:.5)};}
  function fishLen(pb){var w=f.w||1;return Math.min(W*.86,Math.max(pb.h*.42,pb.h*(.4+.22*Math.log10(1+w*2))));}
  /* кадр видоискателя */
  function frameR(){var pb=petrBox(),fw=Math.min(W*.92,Math.max(fishLen(pb)*1.25,pb.h*.9)),top=pb.y-pb.h*1.12,bot2=pb.y-pb.h*.28;return {x:W/2-fw/2,y:top,w:fw,h:bot2-top};}
  function calmNow(){return !tw.on&&!bl.on;}

  function upd(dt){T+=dt;phT+=dt;if(sayT>0){sayT-=dt;if(sayT<=0)sayEl.classList.remove('on');}if(flash>0)flash=Math.max(0,flash-dt*2.2);
    if(ph==='aim'){var k=calm?1.6:1;
      if(tw.on){tw.t+=dt;if(tw.t>.6){tw.on=0;tw.next=(1.2+Math.random()*1.4)*k;}}else{tw.next-=dt;if(tw.next<=0&&!bl.on){tw.on=1;tw.t=0;snd('splash');for(var i=0;i<8;i++)parts.push({x:W/2+(Math.random()-.5)*fishLen(petrBox())*.8,y:fishY(),vx:(Math.random()-.5)*G0.u*20,vy:-G0.u*(4+Math.random()*10),t:0,life:.6});}}
      if(bl.on){bl.t+=dt;if(bl.t>.45){bl.on=0;bl.next=(1.6+Math.random()*2)*k;}}else{bl.next-=dt;if(bl.next<=0&&!tw.on&&tw.next>.5){bl.on=1;bl.t=0;}}
      if(botQ){botT-=dt;if(botT<=0){if(botW==null)botW=Math.random()<botQ;if(botW?calmNow():(tw.on&&tw.t>.15&&tw.t<.45||bl.on)){shoot();botW=null;botT=.9+Math.random()*.6;}else botT=.1;}}}
    for(var j=parts.length-1;j>=0;j--){var p=parts[j];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=G0.u*60*dt;if(p.t>p.life)parts.splice(j,1);}
    if(ph==='release'){if(phT>2.2)showFin();}}
  var botW=null,botQ=bot==='good'?1:bot==='mid'?.6:bot==='bad'?.15:0,botT=1.2;
  function fishY(){var pb=petrBox();return pb.y-pb.h*.5;}
  function drawScene(gg,noUi){var u=G0.u,pb=petrBox();gg.drawImage(BG,0,0,W,H);
    if(!noUi&&SH)A.drawShim(gg,G0,SH,T,P);
    /* кот Васька смотрит на рыбу */
    A.cat(gg,W*(G0.land?.32:.16),pb.y-u*.5,u*(G0.land?9:10),{P:P,t:T,dir:1});
    var L=fishLen(pb),fy=fishY(),released=ph==='release'||ph==='fin'&&rb;
    if(!released){A.petr(gg,pb.x,pb.y,pb.h,{P:{tod:'day'}/* вспышка телефона: лицо светлое и ночью */,t:T,pose:'fish',span:L*.33,hy:0,dir:1,blink:bl.on,smile:!bl.on});
      gg.save();var j=tw.on?Math.sin(tw.t*40)*.12:0;gg.translate(pb.x+(tw.on?Math.sin(tw.t*55)*u*.6:0),fy+(tw.on?Math.cos(tw.t*47)*u*.5:0));gg.rotate(j);
      if(F&&typeof drawFish==='function')drawFish(gg,F.lk,0,0,L);gg.restore();
      /* кулаки поверх рыбы */
      gg.fillStyle=tod==='night'?'#b08a72':'#e8b48c';gg.beginPath();gg.ellipse(pb.x-L*.33,fy-pb.h*.005,pb.h*.042,pb.h*.044,0,0,7);gg.ellipse(pb.x+L*.33,fy,pb.h*.042,pb.h*.044,0,0,7);gg.fill();}
    else{A.petr(gg,pb.x,pb.y,pb.h,{P:{tod:'day'},t:T,pose:'cheer',dir:1,smile:1});var k=Math.min(1,phT/1.4),rx=pb.x+(W*.62-pb.x)*k,ry=fy+(G0.shY-u*2-fy)*k-Math.sin(k*Math.PI)*H*.12;
      if(k<1&&F){gg.save();gg.translate(rx,ry);gg.rotate(k*1.2);gg.globalAlpha=1-k*.6;drawFish(gg,F.lk,0,0,L*(1-k*.5));gg.restore();}}
    parts.forEach(function(p){var a=1-p.t/p.life;gg.fillStyle='rgba(215,238,250,'+(.85*a)+')';gg.beginPath();gg.ellipse(p.x,p.y,u*.35,u*.6,0,0,7);gg.fill();});
    if(FL)A.drawFlies(gg,FL,T,u,false);}
  var SH=null;
  function draw(){drawScene(g);var u=G0.u,fr=frameR();
    if(ph==='aim'){/* видоискатель: затемнение вне кадра, уголки, фокус */
      g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,0,W,fr.y);g.fillRect(0,fr.y+fr.h,W,H-fr.y-fr.h);g.fillRect(0,fr.y,fr.x,fr.h);g.fillRect(fr.x+fr.w,fr.y,W-fr.x-fr.w,fr.h);
      var ok=calmNow(),c=ok?'rgba(120,255,150,.95)':'rgba(255,255,255,.9)',cl=Math.min(fr.w,fr.h)*.12;g.strokeStyle=c;g.lineWidth=Math.max(3,u*.8);g.lineCap='round';
      [[fr.x,fr.y,1,1],[fr.x+fr.w,fr.y,-1,1],[fr.x,fr.y+fr.h,1,-1],[fr.x+fr.w,fr.y+fr.h,-1,-1]].forEach(function(p){g.beginPath();g.moveTo(p[0],p[1]+p[3]*cl);g.lineTo(p[0],p[1]);g.lineTo(p[0]+p[2]*cl,p[1]);g.stroke();});
      g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=1;g.beginPath();for(var i=1;i<3;i++){g.moveTo(fr.x+fr.w*i/3,fr.y);g.lineTo(fr.x+fr.w*i/3,fr.y+fr.h);g.moveTo(fr.x,fr.y+fr.h*i/3);g.lineTo(fr.x+fr.w,fr.y+fr.h*i/3);}g.stroke();
      /* «рамка фокуса» на лице */
      var pb=petrBox(),fx=pb.x+pb.h*.02,fy2=pb.y-pb.h*.89,fs=pb.h*.12;g.strokeStyle=ok?'rgba(120,255,150,.9)':'rgba(255,214,90,.9)';g.lineWidth=2;g.strokeRect(fx-fs,fy2-fs,fs*2,fs*2);
      A.chip(g,fr.x+fr.w/2,fr.y+fr.h+u*5,(ok?L2('Замерли — снимай!','Still — shoot!'):tw.on?L2('Рыба бьётся…','The fish is flapping…'):L2('Моргнул…','Blinked…')),{bg:ok?'rgba(30,120,60,.8)':'rgba(16,36,44,.66)',fs:Math.round(Math.max(16,Math.min(20,u*4.4)))});
      /* кадры */
      for(i=0;i<SHOTS;i++){var x=fr.x+fr.w-u*2-(SHOTS-1-i)*u*5,y=fr.y-u*3.5;g.fillStyle=i<shots.length?'rgba(255,255,255,.35)':'rgba(255,255,255,.95)';A.rr(g,x-u*1.8,y-u*1.3,u*3.6,u*2.6,u*.5);g.fill();}}
    if(flash>0){g.fillStyle='rgba(255,255,255,'+flash+')';g.fillRect(0,0,W,H);}}

  /* снимок: копия кадра + оценка */
  function shoot(){if(ph!=='aim'||shots.length>=SHOTS)return;var q=tw.on?(tw.t<.12||tw.t>.5?2:1):bl.on?1:3,why=tw.on?(q===2?'edge':'blur'):bl.on?'blink':'';
    var fr=frameR(),d=A.dpr(),pc=document.createElement('canvas');pc.width=Math.round(fr.w*d);pc.height=Math.round(fr.h*d);var pg=pc.getContext('2d');pg.scale(d,d);pg.translate(-fr.x,-fr.y);
    var hasF='filter' in pg;if(q<3&&tw.on&&hasF)pg.filter='blur('+(q===1?3:1.2)+'px)';drawScene(pg,true);pg.filter='none';
    var sh={q:q,why:why,c:pc};shots.push(sh);if(!best||q>best.q)best=sh;flash=.9;snd('click');snd('tap');vib(25);
    say(q===3?L2('Во! Красота, хоть в газету!','Perfect! Front page material!'):why==='blink'?L2('Ой, я моргнул! Давай ещё разок.','Oops, I blinked! Once more.'):why==='blur'?L2('Смазалось — рыба дёрнулась. Ещё!','Blurry — the fish flapped. Again!'):L2('Почти! Чуть-чуть дрогнула.','Almost! A tiny wobble.'),2600);
    upBtn();if(q===3||shots.length>=SHOTS){ph='shot';setTimeout(function(){if(!dead)done1();},900);}}
  function upBtn(){var b=root.querySelector('#ftShot');if(b)b.innerHTML=ic('camera')+' '+L2('Снимаю!','Shoot!')+' <span style="opacity:.75;font-size:17px">'+(SHOTS-shots.length)+'/'+SHOTS+'</span>'+kc(L2('Пробел','Space'));}
  function done1(){if(rb){ph='release';phT=0;bar();say(L2('Красная книга — сфотографировали, и ступай с миром. Плыви, красавица!','Red Book fish — photo taken, now off you go!'),3400);snd('splash');}else showFin();}
  function bar(){botEl.innerHTML='';}
  var phIdx=-1,shared=0;
  function showFin(){if(ph==='fin')return;ph='fin';var q=best?best.q:0,tier=q;
    var res=function(){stop();fin.classList.remove('on');root.classList.remove('fin-on');sayEl.classList.remove('on');if(!o.train&&!bot)PEND=null;host.done({score:q,tier:tier,rec:false,scoreTxt:L2('Кадр','Shot')+': <b>'+['—',L2('смазан','blurry'),L2('неплохо','good'),L2('отлично','perfect')][q]+'</b>',extra:{ph:phIdx,id:f.id,w:f.w,rb:rb?1:0,share:shared,line:rb?L2('Красная книга: сфотографировал и отпустил','Red Book: photographed & released'):L2('Фото — в альбоме','Saved to the album')}});};
    if(bot){setTimeout(res,100);return;}
    if(!o.train&&!bot){m.n=(m.n||0)+1;m.best=Math.max(m.best||0,q);if(rb)m.rb[f.id]=1;
      if(typeof a1PhAdd==='function'&&typeof dayNum==='function')try{phIdx=a1PhAdd({id:f.id,w:f.w,pi:f.pi||0,tod:tod,wx:wx,d:dayNum(),k:rb?'rb':(f.k||'tr')});}catch(e){}A.save();}
    var card=makeCard(best?best.c:null,q);card.style.cssText='width:100%;height:auto;border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.3);transform:rotate(-1.5deg);margin:4px 0 6px';
    var way=o.train?'':shareWay();
    fin.innerHTML='<h2>'+(rb?L2('Красная книга','Red Book'):o.train?L2('Тренировка','Practice'):L2('Фото на память','A photo to remember'))+'</h2><div class="stars"></div><div class="ph"></div>'+
      (rb?'<p>'+L2('Сфотографировал и отпустил. Награда — полная, запись — в альбоме.','Photographed and released. Full reward, saved to the album.')+'</p>':'<p style="opacity:.85">'+(o.train?L2('В тренировке фото в альбом не идёт.','Practice photos are not saved.'):L2('Фото — в альбоме, «Стенгазета двора».','Saved to the album.'))+'</p>')+
      '<div class="'+(way?'row2':'')+'">'+(way?'<button class="btn" id="ftShare">'+ic('users')+' '+L2('Поделиться','Share')+'</button>':'')+'<button class="btn green" id="ftOk" data-enter>'+L2('Готово','Done')+kc('Enter')+'</button></div>';
    var stw=fin.querySelector('.stars');for(var i=0;i<3;i++)stw.appendChild(A.icon('star',44,{off:i>=tier}));fin.querySelector('.ph').appendChild(card);
    fin.style.top='50%';fin.style.maxHeight=(H-24)+'px';fin.style.overflow='auto';fin.style.padding='14px 16px 16px';card.style.maxHeight=Math.round(H*(G0.land?.5:.48))+'px';card.style.width='auto';card.style.maxWidth='100%';card.style.display='block';card.style.margin='4px auto 8px';
    bar();fin.classList.add('on');root.classList.add('fin-on');sayEl.classList.remove('on');if(q===3)snd('trophy');
    fin.querySelector('#ftOk').onclick=function(){snd('coin');res();};
    var sb=fin.querySelector('#ftShare');if(sb)sb.onclick=function(){snd('tap');share(card,way);};}
  /* карточка-«полароид»: снимок, имя рыбы, вес, место, дата; Красная книга — красная лента */
  function makeCard(src,q){var CW=720,CH=900,c=document.createElement('canvas');c.width=CW;c.height=CH;var x=c.getContext('2d'),m2=36,ph2=CH-m2-170;
    x.fillStyle=rb?'#fff5f2':'#fbf8f1';x.fillRect(0,0,CW,CH);x.fillStyle='rgba(0,0,0,.06)';x.fillRect(0,CH-8,CW,8);
    x.fillStyle='#1a2a30';x.fillRect(m2,m2,CW-m2*2,ph2);
    if(src){var sw=src.width,sh=src.height,k=Math.max((CW-m2*2)/sw,ph2/sh),dw=sw*k,dh=sh*k;x.save();x.beginPath();x.rect(m2,m2,CW-m2*2,ph2);x.clip();x.drawImage(src,m2+(CW-m2*2-dw)/2,m2+(ph2-dh)/2,dw,dh);x.restore();}
    /* виньетка и блик */
    var vg=x.createRadialGradient(CW/2,m2+ph2/2,ph2*.3,CW/2,m2+ph2/2,ph2*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.25)');x.fillStyle=vg;x.fillRect(m2,m2,CW-m2*2,ph2);
    var fnt=(A.font||'sans-serif');
    if(rb){x.save();x.translate(CW-m2-6,m2+6);x.rotate(Math.PI/4);x.fillStyle=rbColor();x.fillRect(-180,40,360,56);x.fillStyle='#fff';x.font='600 30px '+fnt;x.textAlign='center';x.textBaseline='middle';x.fillText(L2('КРАСНАЯ КНИГА','RED BOOK'),0,69);x.restore();}
    else{var tag={leg:L2('ЛЕГЕНДА','LEGEND'),tr:L2('ТРОФЕЙ','TROPHY'),rec:L2('РЕКОРД','RECORD'),new:L2('НОВАЯ РЫБА','NEW FISH')}[f.k||'tr'];if(tag){x.font='600 30px '+fnt;var tw2=x.measureText(tag).width;x.fillStyle=f.k==='leg'?'#8a5a00':'#c0392b';A.rr(x,m2+18,m2+18,tw2+36,52,12);x.fill();x.fillStyle='#fff';x.textBaseline='middle';x.textAlign='left';x.fillText(tag,m2+36,m2+45);}}
    x.textAlign='left';x.textBaseline='alphabetic';x.fillStyle=rb?'#8a1c1c':'#2a3338';x.font='600 46px '+fnt;x.fillText(nameOf(F)+' · '+kg(f.w||0),m2+8,ph2+m2+70);
    x.fillStyle='#5a6468';x.font='400 30px '+fnt;var dt=new Date(typeof nowMs==='function'?nowMs():Date.now());x.fillText((place?nameOf(place):'')+' · '+dt.getDate()+'.'+('0'+(dt.getMonth()+1)).slice(-2)+'.'+dt.getFullYear(),m2+8,ph2+m2+116);
    x.textAlign='right';x.fillStyle=rb?rbColor():'#9aa2a6';x.font='600 26px '+fnt;x.fillText(rb?L2('Сфотографировал и отпустил','Photographed & released'):(typeof GAME_NAME!=='undefined'?GAME_NAME:''),CW-m2-8,ph2+m2+152);
    for(var i=0;i<3;i++)A.star(x,m2+24+i*40,ph2+m2+146,15,i<q?'#f6c142':'rgba(150,150,150,.35)',i<q?'#b8860b':null);
    return c;}
  function share(card,way){if(way==='story'){var blob='';try{blob=card.toDataURL('image/jpeg',.88);}catch(e){}if(!blob)return;var app=(location.search.match(/[?&]vk_app_id=(\d+)/)||[])[1]||'54794412';
      try{if(typeof STAT!=='undefined')STAT.ev('mg',{id:ID,a:'story'});}catch(e){}
      (typeof vkSend==='function'?vkSend('VKWebAppShowStoryBox',{background_type:'image',blob:blob,attachment:{text:'go_to',type:'url',url:'https://vk.com/app'+app}},180000):Promise.reject()).then(function(r){if(r&&r.result){shared=1;if(typeof toast==='function')toast(L2('История опубликована','Story posted'),2200);}}).catch(function(){});}
    else if(way==='link'){try{if(typeof STAT!=='undefined')STAT.ev('mg',{id:ID,a:'share'});}catch(e){}SOC.share().then(function(ok){if(ok)shared=1;});}}
  function stop(){dead=true;cancelAnimationFrame(raf);removeEventListener('resize',resize);}
  host.onquit=stop;
  function frame(ts){if(dead)return;if(!root.isConnected){stop();return;}var dt=Math.min(.05,(ts-last)/1000||.016);last=ts;if(host.paused)dt=0;upd(dt);draw();raf=requestAnimationFrame(frame);} /* RB:MGPC пауза оболочки — рыба и Петрович замирают */
  addEventListener('resize',resize);resize();SH=A.shim(G0,9);
  ttl.textContent=rb?L2('Красная книга: фото','Red Book: photo'):L2('Фото с трофеем','Trophy photo');sub.textContent=nameOf(F)+' · '+kg(f.w||0);
  var b=document.createElement('button');b.className='btn green';b.id='ftShot';b.onclick=function(e){e.stopPropagation();shoot();};botEl.appendChild(b);upBtn();
  cv.addEventListener('pointerdown',function(e){if(e.button>0)return;shoot();});
  cv.style.cursor='pointer';
  /* RB:MGPC клавиши: пробел/Enter — снимок. Первые 0,6 с клавиши глотаем: фото открывается из карточки улова по Enter
     (#cNext жмёт основная игра на document), и тот же keydown доходит до оболочки (window) уже при открытом фото — без защиты сразу «щёлк». */
  var t0k=Date.now();
  host.keys(function(k){if(k!==' '&&k!=='Enter')return false;if(Date.now()-t0k<600)return true;
    if(ph==='aim'){shoot();return true;}return ph!=='fin';});
  host.amb('water',tod); /* RB:MGPC звуки по нарисованному времени суток */
  say(rb?L2('Это ж из Красной книги! Снимай скорее — и отпустим.','A Red Book fish! Quick photo — then we let it go.')+(host.pc?' '+L2('Пробел или щелчок — снимок.','Space or click — shoot.'):''):(host.pc?L2('Жми пробел или щёлкай, пока рыба не дёргается! И чтоб я не моргнул.','Press Space or click while the fish is still — and don\'t catch me blinking.'):L2('Снимай, пока не дёргается! И чтоб я не моргнул.','Shoot while it\'s still — and don\'t catch me blinking.')),4200);
  window.__mgc={get ph(){return ph;},shoot:shoot,get shots(){return shots;},calmNow:calmNow};
  raf=requestAnimationFrame(function(ts){last=ts;frame(ts);});}

function sim(q,seed){var R=(window.MGCA||{rng:function(){return Math.random;}}).rng(seed||Math.floor(Math.random()*1e9)),p=q==='good'?.92:q==='mid'?.55:.2,best=0;for(var i=0;i<3;i++){var r=R(),v=r<p?3:r<p+(1-p)*.4?2:1;best=Math.max(best,v);if(best===3)break;}return {score:best,tier:best};}

var DEF={id:ID,n:{ru:'Фото с трофеем',en:'Trophy photo'},icon:'camera',kind:'event',
  open:function(){return typeof S!=='undefined'&&!!(S.open&&S.open[1]);},
  run:run,sim:sim,ready:function(){return !!PEND;}};
(window.MG_REG?window.MG_REG:function(d){(window.MG_PEND=window.MG_PEND||[]).push(d);})(DEF);
/* для NORTH/UX: запустить фото прямо из итогов улова (без «Двора»). p = {id,w,pi,k,rb}. cb(res) — после «Готово» */
window.mgcFoto=function(p,cb){PEND=p||null;if(window.MG&&MG.play)return MG.play(ID,{cb:cb});return false;};
})();
