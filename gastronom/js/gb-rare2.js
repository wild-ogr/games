'use strict';
/* ================= gb-rare2 — карточки «Дефицита» 11–60: рисунки и подписи (поток GOODS) =================
   Список карточек альбома, правила выдачи и экран — META (gb-album.js); здесь только КАК карточка выглядит и как называется.
   GBR2.list  — [{k, id, n, c, dep, rep}]: k — номер карточки в альбоме (0-based: 10…59 = карточки 11–60),
                id — тип на полке (210…255 = RARE0+k для k 10…55; у k 56…59 id 0 — на полку не ставятся, только в альбоме),
                n — название, c — подпись-шутка (тексты потом вычитывает TEXT/владелец), dep — отдел (id ART), rep — республика (GBU.REPS) или −1.
   GBR2.get(k) → карточка;  GBR2.byId(id) → карточка по типу на полке;  GBR2.draw(g, k, cx, by, s) — рисунок (как drawGood);
   GOOD_DRAW[210…255] ставятся сами (для полки и cardCanvas). Старые 200–209 и RARE не трогаем.
   GBR2.install() — по желанию META: дописать RARE[k] = {n, c} для k ≥ 10 (тогда gName(t)/RARE[t-RARE0] работают для 210+).
   Сам не зовётся: старый альбом перебирает весь RARE (сломал бы счёт «из 10»). Золотая карточка — рамка поверх (GBR2.gold).
*/
(function(){
  if(typeof GOOD_DRAW==='undefined'||typeof RARE0==='undefined')return;
  var H=(window.GBGD&&GBGD.h)||null;if(!H)return;
  var P=Math.PI,line=H.line,st=H.st,fish=H.fish,plate=H.plate,jar=H.jar,seeds=H.seeds,cone=H.cone;
  // ---- общие заготовки
  function tin(g,cx,by,w,h,body,band,u,lid){can(g,cx,by,w,h,body,function(x,y,W,Hh){if(band){g.fillStyle=band;g.fillRect(x,y+Hh*.35,W,Hh*.3);}},lid);}
  function ribbon(g,cx,y,u,c){poly(g,[cx-2*u,y,cx-14*u,y-9*u,cx-12*u,y+5*u],c);poly(g,[cx+2*u,y,cx+14*u,y-9*u,cx+12*u,y+5*u],c);ell(g,cx,y,3.5*u,3.5*u,shade(c,-.2));}
  function cake(g,cx,by,u,c1,c2,top){shadowE(g,cx,by,42*u,u);var h=30*u,rx=40*u,ry=12*u,cy=by-4*u;
    g.beginPath();g.moveTo(cx-rx,cy-h);g.lineTo(cx-rx,cy);g.ellipse(cx,cy,rx,ry,0,P,0,true);g.lineTo(cx+rx,cy-h);g.closePath();g.fillStyle=lin(g,cx-rx,0,cx+rx,0,[shade(c1,-.2),c1,shade(c1,-.3)]);g.fill();
    ell(g,cx,cy-h,rx,ry,c2);if(top)top(cx,cy-h,rx,ry);}
  function bottleL(g,cx,by,u,liq,cap,lab){bottle(g,cx,by,34*u,94*u,13*u,22*u,18*u,liq,80*u);rrect(g,cx-8*u,by-100*u,16*u,7*u,2*u);g.fillStyle=cap;g.fill();
    rrect(g,cx-15*u,by-48*u,30*u,26*u,3*u);g.fillStyle=lab||'#fff6e6';g.fill();}
  function choc(g,x,y,w,h,u,c,foil){rrect(g,x-w/2,y-h,w,h,3*u);g.fillStyle=c;g.fill();if(foil){g.fillStyle=foil;g.fillRect(x-w/2,y-h*.62,w,h*.3);}g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=u;rrect(g,x-w/2,y-h,w,h,3*u);g.stroke();}
  var C=[
  // ---------- Бакалея
  ['Индийский чай','bakaleya',-1,'Жёлтая пачка — как пропуск в хорошую жизнь. Заваривали по праздникам, ложечку на чайник.',
   function(g,cx,by,u){shadowE(g,cx,by,30*u,u);box3(g,cx,by,44*u,64*u,16*u,'#f2c230',function(x,y,w,h){g.fillStyle='#b8322a';g.fillRect(x,y+h*.1,w,h*.12);ell(g,x+w*.5,y+h*.58,w*.3,h*.18,'#7a5a3a');ell(g,x+w*.3,y+h*.48,w*.1,h*.1,'#7a5a3a');
     line(g,[x+w*.22,y+h*.52,x+w*.16,y+h*.72],'#7a5a3a',w*.05);for(var k=0;k<4;k++)g.fillRect(x+w*(.28+k*.12),y+h*.68,w*.06,h*.14);},'#f6d662');}],
  ['Кофе в зёрнах','bakaleya',-1,'Мололи на ручной мельнице, и весь подъезд знал: у Петровых гости.',
   function(g,cx,by,u){shadowE(g,cx,by,34*u,u);box3(g,cx,by,50*u,56*u,16*u,'#5a3420',function(x,y,w,h){g.fillStyle='#e0b050';g.fillRect(x,y+h*.3,w,h*.36);},'#6e4430');
     for(var k=0;k<6;k++){var x=cx-26*u+k*10*u,y=by-4*u-(k%2)*3*u;ell(g,x+30*u*(k>3?1:0),y,5*u,3.6*u,'#4a2510');line(g,[x-2*u+30*u*(k>3?1:0),y,x+2*u+30*u*(k>3?1:0),y],'#c8925a',.9*u);}}],
  ['Какао-порошок','bakaleya',-1,'Банку прятали на верхнюю полку. Внуки находили всё равно.',
   function(g,cx,by,u){shadowE(g,cx,by,28*u,u);can(g,cx,by,50*u,62*u,'#7a3e1e',function(x,y,w,h){g.fillStyle='#f3e2c0';g.fillRect(x,y+h*.3,w,h*.4);ell(g,x+w*.5,y+h*.5,w*.16,h*.14,'#7a3e1e');ell(g,x+w*.5,y+h*.46,w*.1,h*.05,'#c8925a');},'#d4a93c');}],
  ['Рис для плова','bakaleya',11,'Привезла из Ташкента! Длинный, рассыпчатый — Валя теперь плов варит «как на Чорсу».',
   function(g,cx,by,u){shadowE(g,cx,by,32*u,u);g.beginPath();g.moveTo(cx-30*u,by-60*u);g.lineTo(cx+30*u,by-60*u);g.quadraticCurveTo(cx+38*u,by-30*u,cx+32*u,by-2*u);g.lineTo(cx-32*u,by-2*u);g.quadraticCurveTo(cx-38*u,by-30*u,cx-30*u,by-60*u);g.closePath();
     g.fillStyle=lin(g,cx-34*u,0,cx+34*u,0,['#d8c7a0','#f3ead2','#cdb98e']);g.fill();st(g,'rgba(90,70,30,.5)',1.3*u);seeds(g,cx,by-64*u,24*u,5*u,24,'#ffffff',2.4,u,3);
     rrect(g,cx-18*u,by-40*u,36*u,22*u,3*u);g.fillStyle='#00796b';g.fill();ell(g,cx,by-29*u,8*u,6*u,'#f2c94c');}],
  ['Ванильный сахар','bakaleya',-1,'Крошечный пакетик на целый пирог. Пахло так, что соседи стучались «за солью».',
   function(g,cx,by,u){shadowE(g,cx,by,34*u,u);for(var k=0;k<3;k++){var x=cx+(k-1)*22*u,y=by-k%2*6*u;box3(g,x,y,24*u,40*u,6*u,'#fbf3dc',function(X,Y,w,h){ell(g,X+w/2,Y+h*.5,w*.3,h*.2,'#f2c94c');line(g,[X+w*.3,Y+h*.8,X+w*.7,Y+h*.2],'#5a3420',w*.08);},'#fff8e6');}}],
  // ---------- Хлебный
  ['Рижский хлеб','hleb',3,'Привезла из Риги кирпичик с тмином. В поезде всё купе нюхало.',
   function(g,cx,by,u){shadowE(g,cx,by,40*u,u);box3(g,cx,by,72*u,34*u,26*u,'#3a1e10',function(x,y,w,h){rrect(g,x+w*.25,y+h*.3,w*.5,h*.36,3*u);g.fillStyle='#f3e6c8';g.fill();g.fillStyle='#8e2436';g.fillRect(x+w*.3,y+h*.42,w*.4,h*.1);},'#5a3018');
     seeds(g,cx+4*u,by-40*u,26*u,4*u,16,'#c8a46a',1.4,u,6);}],
  ['Калач','hleb',0,'С ручкой, чтобы нести. Ручку Валя отдаёт Пломбиру — он не против.',
   function(g,cx,by,u){shadowE(g,cx,by,40*u,u);var cy=by-24*u;g.beginPath();g.ellipse(cx,cy,38*u,22*u,0,0,P*2);g.ellipse(cx+4*u,cy-6*u,16*u,9*u,0,0,P*2,true);
     g.fillStyle=lin(g,cx-38*u,cy-22*u,cx+38*u,cy+22*u,['#f6cf7a','#d68a2c','#a85d1c']);g.fill('evenodd');st(g,'rgba(110,55,10,.5)',1.4*u);
     g.beginPath();g.arc(cx-30*u,cy-10*u,12*u,P*.6,P*1.6);st(g,'#c9782a',7*u);ell(g,cx-14*u,cy-14*u,8*u,3*u,'rgba(255,240,200,.5)');}],
  ['Бублики с маком','hleb',-1,'Связкой на бечёвке — и на шею, как бусы. Самые модные бусы района.',
   function(g,cx,by,u){shadowE(g,cx,by,34*u,u);line(g,[cx,by-92*u,cx,by-8*u],'#8d6e4a',1.6*u);
     for(var k=0;k<5;k++){var y=by-80*u+k*16*u,x=cx+(k%2?6:-6)*u;g.beginPath();g.ellipse(x,y,16*u,9*u,0,0,P*2);g.ellipse(x,y,6*u,3*u,0,0,P*2,true);g.fillStyle=lin(g,0,y-9*u,0,y+9*u,['#f3c06a','#b8701e']);g.fill('evenodd');seeds(g,x,y-4*u,12*u,3*u,6,'#2a2a35',1.1,u,k+2);}}],
  ['Кекс «Столичный»','hleb',0,'С изюмом и сахарной пудрой. Пудру сдували на скатерть, скатерть — в стирку.',
   function(g,cx,by,u){shadowE(g,cx,by,40*u,u);g.beginPath();g.moveTo(cx-38*u,by-2*u);g.lineTo(cx-34*u,by-30*u);g.quadraticCurveTo(cx,by-54*u,cx+34*u,by-30*u);g.lineTo(cx+38*u,by-2*u);g.closePath();
     g.fillStyle=lin(g,0,by-50*u,0,by,['#d89a4a','#a8601e']);g.fill();st(g,'rgba(100,50,10,.5)',1.3*u);g.beginPath();g.moveTo(cx-34*u,by-30*u);g.quadraticCurveTo(cx,by-54*u,cx+34*u,by-30*u);g.quadraticCurveTo(cx,by-40*u,cx-34*u,by-30*u);g.fillStyle='#fffaf0';g.fill();
     seeds(g,cx,by-16*u,28*u,9*u,9,'#4a1e28',2.4,u,4);}],
  ['Каравай','hleb',-1,'Пышный, с колосками из теста. Встречали им ревизора — помогло!',
   function(g,cx,by,u){shadowE(g,cx,by,44*u,u);poly(g,[cx-46*u,by-2*u,cx+46*u,by-2*u,cx+40*u,by-12*u,cx-40*u,by-12*u],'#fbfbf5');g.fillStyle='#c0392b';g.fillRect(cx-46*u,by-5*u,92*u,2.4*u);
     ell(g,cx,by-26*u,40*u,24*u,lin(g,cx-40*u,by-50*u,cx+40*u,by,['#f6c36a','#c8782a','#9a5418']));for(var k=0;k<6;k++){var a=k/6*P*2;ell(g,cx+Math.cos(a)*24*u,by-30*u+Math.sin(a)*8*u,5*u,3*u,'#f8d898');}
     ell(g,cx,by-42*u,9*u,5*u,'#e8e8e0');ell(g,cx,by-44*u,6*u,2*u,'#ffffff');}],
  // ---------- Молочный
  ['Сливки в бутылочке','moloko',-1,'Маленькая бутылочка с золотой крышкой. В кофе — на два раза, если не жадничать.',
   function(g,cx,by,u){shadowE(g,cx,by,24*u,u);bottle(g,cx,by,34*u,60*u,24*u,8*u,10*u,'#fff4dc',52*u);rrect(g,cx-14*u,by-66*u,28*u,9*u,3*u);g.fillStyle=lin(g,cx-14*u,0,cx+14*u,0,['#9c7a14','#f6e07a','#9c7a14']);g.fill();}],
  ['Масло сливочное','moloko',0,'С орешковым привкусом. Резали тонко-тонко — и всё равно кончалось.',
   function(g,cx,by,u){shadowE(g,cx,by,38*u,u);box3(g,cx,by,64*u,26*u,24*u,'#f8e8a0',function(x,y,w,h){g.fillStyle='#2e7d32';g.fillRect(x,y+h*.3,w,h*.4);ell(g,x+w*.5,y+h*.5,w*.12,h*.16,'#f8e8a0');},'#fbf0b8');
     poly(g,[cx+20*u,by-26*u,cx+36*u,by-38*u,cx+38*u,by-26*u],'#f6e07a');}],
  ['Сгущённые сливки','moloko',-1,'Как сгущёнка, только «для начальства». Банку открывали двумя дырками.',
   function(g,cx,by,u){shadowE(g,cx,by,30*u,u);can(g,cx,by,58*u,50*u,'#e8eef6',function(x,y,w,h){g.fillStyle='#c0392b';g.fillRect(x,y+h*.26,w,h*.12);g.fillRect(x,y+h*.66,w,h*.12);ell(g,x+w*.5,y+h*.52,w*.12,h*.12,'#3a78c2');});
     ell(g,cx-8*u,by-50*u,2.6*u,1.4*u,'#555');ell(g,cx+10*u,by-50*u,2.6*u,1.4*u,'#555');}],
  ['Фруктовый йогурт','moloko',5,'Привезла из Таллина баночку. Ели всей семьёй, по ложке, с закрытыми глазами.',
   function(g,cx,by,u){shadowE(g,cx,by,32*u,u);for(var k=0;k<2;k++){var x=cx+(k?18:-18)*u;poly(g,[x-15*u,by-50*u,x+15*u,by-50*u,x+12*u,by-2*u,x-12*u,by-2*u],lin(g,x-15*u,0,x+15*u,0,['#e8e8e0','#ffffff','#d8d8d0']));
     g.fillStyle=k?'#e8435a':'#f39c12';g.fillRect(x-14*u,by-34*u,28*u,14*u);ell(g,x,by-27*u,5*u,5*u,k?'#ffd0d8':'#ffe7b0');ell(g,x,by-50*u,15*u,4*u,'#c9cfd3');}}],
  ['Творожная масса','moloko',-1,'С изюмом, в пачке-брикете. Дети выковыривали изюм, взрослые — ругались.',
   function(g,cx,by,u){shadowE(g,cx,by,34*u,u);box3(g,cx,by,58*u,30*u,24*u,'#fdf6e8',function(x,y,w,h){g.fillStyle='#ad1457';g.fillRect(x,y,w,h*.22);seeds(g,x+w/2,y+h*.62,w*.38,h*.22,7,'#4a1e28',2,u,5);},'#fffaf0');}],
  // ---------- Гастрономия
  ['Сыр «Российский»','gastro',-1,'Красная корка, мелкие глазки. Отрезали «вот столечко» — и спорили до хрипоты.',
   function(g,cx,by,u){shadowE(g,cx,by,40*u,u);box3(g,cx,by,70*u,32*u,28*u,'#f4cf54',function(x,y,w,h){g.fillStyle='#c0392b';g.fillRect(x,y,w,h*.12);g.fillRect(x,y+h*.88,w,h*.12);seeds(g,x+w/2,y+h*.5,w*.4,h*.28,7,'#e2b034',2.6,u,8);},'#f8dc70');}],
  ['Ветчина в банке','gastro',-1,'Банка-«ключик»: накручиваешь полоску жести — и праздник открыт.',
   function(g,cx,by,u){shadowE(g,cx,by,40*u,u);box3(g,cx,by,66*u,40*u,26*u,'#c9cfd3',function(x,y,w,h){g.fillStyle='#d6402f';g.fillRect(x,y+h*.22,w,h*.56);rrect(g,x+w*.3,y+h*.32,w*.4,h*.36,4*u);g.fillStyle='#f4a7b9';g.fill();},'#dfe4e7');
     line(g,[cx+24*u,by-52*u,cx+34*u,by-58*u],'#8b949a',3*u);ell(g,cx+36*u,by-59*u,4*u,3*u,'#8b949a');}],
  ['Копчёная колбаса','gastro',-1,'Твёрдая, как палка, — и ценная, как палка-выручалочка. Нарезали к Новому году.',
   function(g,cx,by,u){shadowE(g,cx,by,42*u,u);g.save();g.translate(cx,by-22*u);g.rotate(-.25);capsule(g,0,0,86*u,18*u,'#9a3a2a','#5a1a10');seeds(g,0,0,36*u,6*u,14,'#f0d8d0',1.3,u,2);
     line(g,[-44*u,0,-50*u,-6*u],'#d9c9a0',2*u);g.restore();g.save();g.translate(cx+22*u,by-6*u);ell(g,0,0,10*u,7*u,'#c0504a');seeds(g,0,0,7*u,5*u,6,'#f8e0d8',1.2,u,9);g.restore();}],
  ['Карбонад','gastro',-1,'Розовый, с жирком по краю. Валя его не продаёт — только «показывает».',
   function(g,cx,by,u){shadowE(g,cx,by,40*u,u);var cy=by-20*u;ell(g,cx,cy+6*u,38*u,16*u,'#a8503a');ell(g,cx,cy,38*u,16*u,'#fbf3ea');ell(g,cx+2*u,cy+1*u,32*u,12*u,lin(g,cx-30*u,cy,cx+30*u,cy,['#e88a8a','#d0605a']));
     g.beginPath();g.moveTo(cx-20*u,cy-4*u);g.quadraticCurveTo(cx,cy+6*u,cx+18*u,cy-6*u);st(g,'rgba(255,240,230,.6)',1.6*u);}],
  ['Сосиски молочные','gastro',-1,'Связка за 2-20! В очереди за ними знакомились, а потом и женились.',
   function(g,cx,by,u){shadowE(g,cx,by,42*u,u);for(var k=0;k<4;k++){var x=cx-30*u+k*20*u,y=by-14*u-(k%2)*6*u;g.save();g.translate(x,y);g.rotate(.35-k*.22);capsule(g,0,0,14*u,46*u,'#f4b0a0','#d88070');g.restore();}
     line(g,[cx-30*u,by-38*u,cx+30*u,by-40*u],'#e8dcc0',2*u);}],
  // ---------- Кондитерский
  ['Торт-суфле','konditer',0,'Нежный, с шоколадной глазурью. Очередь стояла с шести утра — с термосами.',
   function(g,cx,by,u){cake(g,cx,by,u,'#fbf3e0','#4a2510',function(x,y,rx,ry){g.beginPath();for(var k=0;k<5;k++){g.moveTo(x-rx*.7+k*rx*.35,y-ry*.3);g.quadraticCurveTo(x-rx*.55+k*rx*.35,y+ry*.4,x-rx*.4+k*rx*.35,y-ry*.3);}st(g,'#c8925a',1.6*u);});}],
  ['Шоколад с орехами','konditer',-1,'Плитка в фольге — разворачивали так, чтобы фольгу потом разгладить ногтем.',
   function(g,cx,by,u){shadowE(g,cx,by,36*u,u);g.save();g.translate(cx,by-24*u);g.rotate(-.12);rrect(g,-36*u,-20*u,72*u,40*u,3*u);g.fillStyle='#3a1e0c';g.fill();
     g.fillStyle='#d8dde2';g.fillRect(-36*u,-20*u,30*u,40*u);g.fillStyle='#b8322a';g.fillRect(-6*u,-20*u,42*u,40*u);ell(g,16*u,0,10*u,7*u,'#f2c94c');
     for(var k=0;k<3;k++)ell(g,-26*u+k*8*u,(k-1)*10*u,4*u,3*u,'#7a4a20');g.restore();}],
  ['Зефир в шоколаде','konditer',-1,'Коробка на шесть штук, а желающих — десять. Делили ножом, по-честному.',
   function(g,cx,by,u){shadowE(g,cx,by,42*u,u);box3(g,cx,by,80*u,16*u,30*u,'#f6e7c8',null,'#fff4dc');
     for(var k=0;k<3;k++){var x=cx-24*u+k*24*u,y=by-22*u;ell(g,x,y,11*u,9*u,lin(g,x-11*u,y-9*u,x+11*u,y+9*u,['#7a4a2a','#3a1e0c']));g.beginPath();g.ellipse(x,y-2*u,7*u,4*u,0,P,0);st(g,'rgba(255,255,255,.35)',1.4*u);}}],
  ['Мармелад «дольки»','konditer',-1,'Апельсиновые, лимонные, вишнёвые. Вишнёвые всегда съедал кто-то другой.',
   function(g,cx,by,u){shadowE(g,cx,by,40*u,u);var Cc=['#f39c12','#f4d03f','#c0392b','#27ae60','#f39c12','#e74c3c'];
     for(var k=0;k<6;k++){var x=cx-30*u+(k%3)*30*u,y=by-6*u-Math.floor(k/3)*18*u,c=Cc[k];g.beginPath();g.arc(x,y,13*u,P,0);g.closePath();g.fillStyle=c;g.fill();g.beginPath();g.arc(x,y,13*u,P,0);st(g,'rgba(255,255,255,.7)',2*u);
       seeds(g,x,y-5*u,7*u,3*u,5,'rgba(255,255,255,.8)',1.2,u,k);}}],
  ['Вафельный торт','konditer',-1,'Хрустел на всю кухню. Крошки собирали ладошкой — и в рот.',
   function(g,cx,by,u){shadowE(g,cx,by,40*u,u);cake(g,cx,by,u,'#e0b060','#e8c070',function(x,y,rx,ry){g.save();ell(g,x,y,rx,ry);g.clip();g.strokeStyle='rgba(160,100,30,.6)';g.lineWidth=1.3*u;for(var k=-6;k<=6;k++){g.beginPath();g.moveTo(x+k*8*u-14*u,y-ry);g.lineTo(x+k*8*u+14*u,y+ry);g.stroke();g.beginPath();g.moveTo(x+k*8*u+14*u,y-ry);g.lineTo(x+k*8*u-14*u,y+ry);g.stroke();}g.restore();});
     g.fillStyle='rgba(110,60,20,.55)';for(var j=0;j<3;j++)g.fillRect(cx-40*u,by-28*u+j*9*u,80*u,2*u);}],
  // ---------- Овощной
  ['Лимоны','ovoshi',7,'Привезла из Батуми целую сетку. К чаю — по кружочку, с сахаром.',
   function(g,cx,by,u){shadowE(g,cx,by,38*u,u);var L3=[[-18,-16],[18,-16],[0,-40]];for(var k=0;k<3;k++){var x=cx+L3[k][0]*u,y=by+L3[k][1]*u;ell(g,x,y,18*u,14*u,lin(g,x-18*u,y-14*u,x+18*u,y+14*u,['#fff27a','#f4d03f','#c9a012']));
     ell(g,x+18*u,y,3*u,2.4*u,'#e0b820');ell(g,x-6*u,y-5*u,5*u,2.6*u,'rgba(255,255,255,.55)');}ell(g,cx+6*u,by-56*u,7*u,3*u,'#4f9a2e');}],
  ['Ананас','ovoshi',-1,'Настоящий, с хохолком! Неделю стоял на серванте — для красоты.',
   function(g,cx,by,u){shadowE(g,cx,by,28*u,u);for(var k=-2;k<=2;k++)poly(g,[cx+k*5*u,by-50*u,cx+k*12*u,by-92*u+Math.abs(k)*8*u,cx+k*5*u+5*u,by-50*u],k%2?'#3f8f3a':'#5aae4a');
     ell(g,cx,by-27*u,24*u,27*u,lin(g,cx-24*u,0,cx+24*u,0,['#a8701e','#e8b03c','#9a6014']));g.save();ell(g,cx,by-27*u,24*u,27*u);g.clip();g.strokeStyle='rgba(110,70,10,.6)';g.lineWidth=1.3*u;
     for(var j=-5;j<=5;j++){g.beginPath();g.moveTo(cx+j*9*u-20*u,by-56*u);g.lineTo(cx+j*9*u+20*u,by);g.stroke();g.beginPath();g.moveTo(cx+j*9*u+20*u,by-56*u);g.lineTo(cx+j*9*u-20*u,by);g.stroke();}g.restore();}],
  ['Хурма','ovoshi',11,'Привезла из Самарканда. Терпкую дозаривали в морозилке — Валин секрет.',
   function(g,cx,by,u){shadowE(g,cx,by,40*u,u);var Q=[[-18,-14],[18,-14],[0,-36]];for(var k=0;k<3;k++){var x=cx+Q[k][0]*u,y=by+Q[k][1]*u;ell(g,x,y,18*u,14*u,lin(g,x-18*u,y-14*u,x+18*u,y+14*u,['#ffab40','#f57c00','#bf4a00']));
     poly(g,[x-8*u,y-12*u,x,y-16*u,x+8*u,y-12*u,x+4*u,y-9*u,x-4*u,y-9*u],'#6b5a2a');ell(g,x-6*u,y-3*u,4*u,2.4*u,'rgba(255,255,255,.45)');}}],
  ['Гранат','ovoshi',9,'Привезла из Баку. Чистили над тазиком, а брызги всё равно на потолке.',
   function(g,cx,by,u){shadowE(g,cx,by,36*u,u);ell(g,cx-10*u,by-26*u,24*u,24*u,lin(g,cx-34*u,by-50*u,cx+14*u,by,['#e8435a','#b0172f','#6e0f1e']));
     poly(g,[cx-16*u,by-50*u,cx-14*u,by-58*u,cx-10*u,by-52*u,cx-6*u,by-58*u,cx-4*u,by-50*u],'#9a1428');ell(g,cx-18*u,by-34*u,5*u,4*u,'rgba(255,255,255,.4)');
     ell(g,cx+22*u,by-14*u,16*u,13*u,'#8e1a2a');ell(g,cx+22*u,by-15*u,13*u,10*u,'#f6e0c0');seeds(g,cx+22*u,by-15*u,9*u,6*u,14,'#d0203a',2.4,u,4);}],
  ['Кокос','ovoshi',-1,'Пилили ножовкой всей семьёй. Молока — полстакана, впечатлений — на год.',
   function(g,cx,by,u){shadowE(g,cx,by,36*u,u);ell(g,cx,by-30*u,30*u,28*u,lin(g,cx-30*u,by-58*u,cx+30*u,by,['#9a6a3a','#6a4020','#3a2010']));g.save();ell(g,cx,by-30*u,30*u,28*u);g.clip();g.strokeStyle='rgba(200,160,110,.45)';g.lineWidth=1.2*u;
     for(var k=0;k<12;k++){g.beginPath();g.moveTo(cx-30*u+k*5*u,by-60*u);g.lineTo(cx-34*u+k*6*u,by);g.stroke();}g.restore();for(var j=0;j<3;j++)ell(g,cx-8*u+j*8*u,by-46*u+(j%2)*3*u,3*u,3*u,'#2a1408');}],
  // ---------- Соки-воды
  ['Зелёный лимонад','soki',7,'Привезла из Тбилиси. Зелёный, как ёлка, — дети думали, что он волшебный.',
   function(g,cx,by,u){shadowE(g,cx,by,22*u,u);bottleL(g,cx,by,u,'#2ec24a','#c0392b','#f3f8e8');for(var k=0;k<3;k++)ell(g,cx-6*u+k*6*u,by-34*u+(k%2)*3*u,4*u,7*u,'#2e8b3a');}],
  ['Ананасовый сок','soki',-1,'Банка с картинкой «как на юге». Пили из гранёных стаканов, смакуя.',
   function(g,cx,by,u){shadowE(g,cx,by,30*u,u);can(g,cx,by,56*u,72*u,'#f6e7a0',function(x,y,w,h){g.fillStyle='#2e7d32';g.fillRect(x,y,w,h*.16);ell(g,x+w*.5,y+h*.55,w*.18,h*.2,'#e8b03c');
     for(var k=-1;k<=1;k++)poly(g,[x+w*.5+k*w*.04,y+h*.38,x+w*.5+k*w*.12,y+h*.2,x+w*.5+k*w*.04+w*.04,y+h*.38],'#3f8f3a');},'#d4a93c');}],
  ['Виноградный сок','soki',6,'Привезла из Кишинёва трёхлитровую банку. Дотащила — сама удивилась.',
   function(g,cx,by,u){shadowE(g,cx,by,30*u,u);jar(g,cx,by,58*u,90*u,'#5a1a4a',80*u,'#c9cfd3',u);rrect(g,cx-20*u,by-56*u,40*u,30*u,4*u);g.fillStyle='#f6eedc';g.fill();
     for(var k=0;k<6;k++)ell(g,cx-6*u+(k%3)*6*u,by-48*u+Math.floor(k/3)*6*u,3.4*u,3.4*u,'#6a1b9a');}],
  ['Апельсиновый сок','soki',-1,'Пакет с трубочкой — диковина! Трубочку потом мыли и берегли.',
   function(g,cx,by,u){shadowE(g,cx,by,26*u,u);box3(g,cx,by,40*u,72*u,20*u,'#f57c00',function(x,y,w,h){g.fillStyle='#fff';g.fillRect(x,y+h*.6,w,h*.16);ell(g,x+w*.5,y+h*.36,w*.28,w*.28,'#ffb347');ell(g,x+w*.5,y+h*.36,w*.2,w*.2,'#ffd27a');},'#ff9a30');
     line(g,[cx+6*u,by-80*u,cx+12*u,by-98*u],'#e74c3c',3*u);}],
  ['Морс брусничный','soki',2,'Привезла из Минска. Кислый так, что Пломбир чихнул — от одного запаха.',
   function(g,cx,by,u){shadowE(g,cx,by,24*u,u);bottleL(g,cx,by,u,'#b0172f','#9aa3a8','#fdf2f2');seeds(g,cx,by-34*u,8*u,6*u,7,'#c0172f',3,u,3);ell(g,cx+6*u,by-42*u,4*u,2*u,'#3f8f3a');}],
  // ---------- Рыбный
  ['Икра чёрная','ryba',-1,'Баночка меньше спичечного коробка. Ели ложечкой для горчицы — чтобы растянуть.',
   function(g,cx,by,u){shadowE(g,cx,by,34*u,u);can(g,cx,by,64*u,22*u,'#1f3a5a',function(x,y,w,h){g.fillStyle='#d4a017';g.fillRect(x,y+h*.4,w,h*.2);},'#c9cfd3');
     ell(g,cx,by-22*u,24*u,6*u,'#1a1a22');seeds(g,cx,by-23*u,20*u,4*u,26,'#3a3a48',1.6,u,5);}],
  ['Печень трески','ryba',0,'Мурманская баночка. Бутерброды с ней ели стоя — от уважения.',
   function(g,cx,by,u){shadowE(g,cx,by,30*u,u);can(g,cx,by,58*u,30*u,'#e8eef6',function(x,y,w,h){g.fillStyle='#1f5f99';g.fillRect(x,y+h*.2,w,h*.6);g.fillStyle='#fff';g.fillRect(x+w*.1,y+h*.44,w*.8,h*.12);});
     fish(g,cx,by-16*u,30*u,10*u,0,'#d8dde2','#ffffff',u);}],
  ['Осетрина','ryba',9,'Привезла из Баку балык — завёрнутый в три газеты. Пахло на весь плацкарт.',
   function(g,cx,by,u){shadowE(g,cx,by,44*u,u);poly(g,[cx-44*u,by-2*u,cx+42*u,by-2*u,cx+46*u,by-10*u,cx-38*u,by-12*u],'#e8e0c8');
     fish(g,cx,by-22*u,92*u,24*u,0,'#c08a4a','#f0d29a',u);for(var k=0;k<6;k++)poly(g,[cx-24*u+k*10*u,by-34*u,cx-20*u+k*10*u,by-38*u,cx-16*u+k*10*u,by-34*u],'#8a5a2a');}],
  ['Кета копчёная','ryba',0,'Красная рыба с Камчатки. Валя достала по знакомству — и никому не скажет как.',
   function(g,cx,by,u){shadowE(g,cx,by,42*u,u);for(var k=0;k<3;k++){g.save();g.translate(cx-22*u+k*22*u,by-14*u-(k%2)*8*u);g.rotate(-.2);rrect(g,-12*u,-14*u,24*u,24*u,4*u);
     g.fillStyle=lin(g,0,-14*u,0,10*u,['#ff8a5a','#e85a2a']);g.fill();g.strokeStyle='rgba(255,230,210,.8)';g.lineWidth=1.4*u;for(var j=-1;j<=1;j++){g.beginPath();g.moveTo(-10*u,j*6*u);g.lineTo(10*u,j*6*u-4*u);g.stroke();}g.restore();}}],
  ['Креветки','ryba',-1,'Варёные, розовые, «как в кино». Половина гостей не знала, как их чистить.',
   function(g,cx,by,u){shadowE(g,cx,by,40*u,u);plate(g,cx,by-8*u,44*u,12*u,'#ffffff','#3a78c2',u);
     for(var k=0;k<4;k++){var x=cx-24*u+k*16*u,y=by-22*u-(k%2)*6*u;g.beginPath();g.arc(x,y,9*u,P*.2,P*1.6);st(g,'#f07a5a',7*u);g.beginPath();g.arc(x,y,9*u,P*.2,P*1.6);st(g,'rgba(255,220,200,.6)',1.4*u);ell(g,x+8*u,y-4*u,1.5*u,1.5*u,'#2a1a10');}}],
  // ---------- Приём стеклотары
  ['Сифон','steklo',-1,'Баллончик — и газировка дома! Шипело так, что кот уходил в другую комнату.',
   function(g,cx,by,u){shadowE(g,cx,by,26*u,u);bottle(g,cx,by,44*u,74*u,24*u,6*u,10*u,'rgba(180,220,235,.7)',60*u);g.fillStyle='rgba(60,110,160,.35)';
     for(var k=0;k<5;k++)g.fillRect(cx-22*u,by-66*u+k*13*u,44*u,3*u);rrect(g,cx-12*u,by-92*u,24*u,16*u,4*u);g.fillStyle=lin(g,cx-12*u,0,cx+12*u,0,['#8b949a','#e6e9eb','#8b949a']);g.fill();
     line(g,[cx+10*u,by-88*u,cx+24*u,by-84*u],'#8b949a',4*u);line(g,[cx-10*u,by-90*u,cx-20*u,by-96*u],'#3a3a3a',3*u);}],
  ['Бидон','steklo',-1,'С бидоном — за молоком к бочке. Крышку по дороге теряли все.',
   function(g,cx,by,u){shadowE(g,cx,by,30*u,u);can(g,cx,by,50*u,56*u,'#6fa8dc',null,'#a8c8e8');rrect(g,cx-16*u,by-74*u,32*u,18*u,4*u);g.fillStyle='#6fa8dc';g.fill();
     ell(g,cx,by-74*u,17*u,5*u,'#a8c8e8');g.beginPath();g.arc(cx,by-80*u,16*u,P,0);st(g,'#555',2.4*u);ell(g,cx-10*u,by-30*u,4*u,12*u,'rgba(255,255,255,.35)');}],
  ['Крышки для закаток','steklo',-1,'Самый дефицит лета! За пачку крышек отдавали ведро огурцов.',
   function(g,cx,by,u){shadowE(g,cx,by,38*u,u);for(var k=0;k<5;k++){var y=by-6*u-k*7*u,x=cx+(k%2?3:-3)*u;ell(g,x,y+3*u,30*u,8*u,'#8b949a');ell(g,x,y,30*u,8*u,lin(g,x-30*u,0,x+30*u,0,['#9aa3a8','#eef2f5','#9aa3a8']));
     g.beginPath();g.ellipse(x,y,22*u,5.5*u,0,0,P*2);st(g,'rgba(70,80,90,.45)',1.1*u);}}],
  ['Трёхлитровая банка','steklo',-1,'Пустая — а ценнее полной. Сдавали за 40 копеек, но кто ж такую сдаст!',
   function(g,cx,by,u){shadowE(g,cx,by,30*u,u);jar(g,cx,by,58*u,90*u,'rgba(200,230,240,.25)',4*u,'#e8e4d8',u);g.fillStyle='rgba(255,255,255,.7)';g.fillRect(cx+12*u,by-70*u,4*u,52*u);}],
  ['Авоська','steklo',-1,'Сеточка «на авось» — всегда в кармане. Вдруг что выбросят!',
   function(g,cx,by,u){shadowE(g,cx,by,34*u,u);g.beginPath();g.arc(cx,by-74*u,12*u,P,0);st(g,'#8a5a2b',3*u);
     ell(g,cx-10*u,by-16*u,13*u,13*u,'#f57c00');ell(g,cx+12*u,by-18*u,13*u,13*u,'#e8435a');ell(g,cx,by-38*u,12*u,12*u,'#f4d03f');
     function bag(){g.beginPath();g.moveTo(cx-12*u,by-74*u);g.quadraticCurveTo(cx-40*u,by-30*u,cx-20*u,by-2*u);g.lineTo(cx+20*u,by-2*u);g.quadraticCurveTo(cx+40*u,by-30*u,cx+12*u,by-74*u);g.closePath();}
     bag();st(g,'rgba(40,100,40,.9)',2*u);bag();g.save();g.clip();g.strokeStyle='rgba(60,120,60,.85)';g.lineWidth=1.3*u;for(var k=-8;k<=8;k++){g.beginPath();g.moveTo(cx+k*7*u-30*u,by-80*u);g.lineTo(cx+k*7*u+30*u,by);g.stroke();g.beginPath();g.moveTo(cx+k*7*u+30*u,by-80*u);g.lineTo(cx+k*7*u-30*u,by);g.stroke();}g.restore();}],
  // ---------- Стол заказов (k 56…59 — без места на полке, только в альбоме)
  ['Праздничный заказ','zakaz',-1,'Коробка с бечёвкой: гречка, сгущёнка, шпроты и сюрприз. Сюрпризом всегда был майонез.',
   function(g,cx,by,u){shadowE(g,cx,by,42*u,u);box3(g,cx,by,72*u,40*u,30*u,'#c9a26b',function(x,y,w,h){g.fillStyle='rgba(120,80,30,.3)';g.fillRect(x+w*.47,y,w*.06,h);},'#dcb884');line(g,[cx-40*u,by-34*u,cx+26*u,by-34*u],'#d6402f',2*u);ribbon(g,cx-4*u,by-54*u,u,'#d6402f');}],
  ['Чай в жестянке','zakaz',-1,'Подарочная банка с драконами. Чай кончился за месяц, а банка живёт сорок лет.',
   function(g,cx,by,u){shadowE(g,cx,by,30*u,u);box3(g,cx,by,46*u,66*u,20*u,'#b8322a',function(x,y,w,h){g.fillStyle='#e1b12c';g.fillRect(x,y+h*.08,w,h*.06);g.fillRect(x,y+h*.86,w,h*.06);ell(g,x+w*.5,y+h*.5,w*.3,h*.2,'#e1b12c');ell(g,x+w*.5,y+h*.5,w*.22,h*.14,'#1f6f4a');},'#d4a017');}],
  ['Сладкий подарок','zakaz',-1,'Пакет с ёлки: мандарин, конфета с медведем и вафелька. Счастье в целлофане.',
   function(g,cx,by,u){shadowE(g,cx,by,34*u,u);g.beginPath();g.moveTo(cx-8*u,by-74*u);g.lineTo(cx-30*u,by-44*u);g.quadraticCurveTo(cx-36*u,by-4*u,cx-26*u,by-2*u);g.lineTo(cx+26*u,by-2*u);g.quadraticCurveTo(cx+36*u,by-4*u,cx+30*u,by-44*u);g.lineTo(cx+8*u,by-74*u);g.closePath();
     g.fillStyle='rgba(225,240,248,.5)';g.fill();ell(g,cx-10*u,by-16*u,12*u,11*u,'#f57c00');choc(g,cx+12*u,by-4*u,18*u,26*u,u,'#3a78c2','#f4d03f');ell(g,cx-2*u,by-38*u,9*u,7*u,'#d6402f');st(g,'rgba(90,120,140,.5)',1.2*u);ribbon(g,cx,by-72*u,u,'#c2185b');}],
  ['Корзинка фруктов','zakaz',-1,'Плетёная, с бантом — несли в больницу. Больной выздоравливал от одного вида.',
   function(g,cx,by,u){shadowE(g,cx,by,42*u,u);ell(g,cx-16*u,by-34*u,12*u,11*u,'#e8435a');ell(g,cx+4*u,by-38*u,12*u,11*u,'#f57c00');ell(g,cx+20*u,by-32*u,11*u,10*u,'#f4d03f');
     g.beginPath();g.arc(cx,by-30*u,30*u,P,0);st(g,'#a8701e',4*u);g.beginPath();g.moveTo(cx-38*u,by-30*u);g.lineTo(cx+38*u,by-30*u);g.lineTo(cx+30*u,by-2*u);g.lineTo(cx-30*u,by-2*u);g.closePath();
     g.fillStyle=lin(g,0,by-30*u,0,by,['#d9a85a','#a8701e']);g.fill();g.strokeStyle='rgba(110,60,10,.5)';g.lineWidth=1.3*u;for(var k=-5;k<=5;k++){g.beginPath();g.moveTo(cx+k*7*u,by-30*u);g.lineTo(cx+k*6*u,by-2*u);g.stroke();}ribbon(g,cx-30*u,by-46*u,u,'#c2185b');}],
  ['Набор специй','zakaz',9,'Привезла из Баку шесть мешочков. Какой из них шафран — до сих пор спорим.',
   function(g,cx,by,u){shadowE(g,cx,by,42*u,u);var Cc=['#d4a017','#c0392b','#7a4a20','#e67e22','#6b8f2a','#8e2436'];
     for(var k=0;k<6;k++){var x=cx-30*u+(k%3)*30*u,y=by-2*u-Math.floor(k/3)*28*u;g.beginPath();g.moveTo(x-12*u,y);g.quadraticCurveTo(x-14*u,y-16*u,x-6*u,y-22*u);g.lineTo(x+6*u,y-22*u);g.quadraticCurveTo(x+14*u,y-16*u,x+12*u,y);g.closePath();g.fillStyle='#efe2c2';g.fill();st(g,'rgba(90,70,30,.5)',1*u);
       ell(g,x,y-22*u,6*u,3*u,Cc[k]);line(g,[x-7*u,y-18*u,x+7*u,y-18*u],'#8a5a2b',1.4*u);}}]
  ];
  var L=[],BY={};
  for(var i=0;i<C.length;i++){var k=10+i,id=k<=55?RARE0+k:0,c=C[i];
    var o={k:k,id:id,n:c[0],dep:c[1],rep:c[2],c:c[3],en:'',ce:'',f:c[4]};L.push(o);if(id){BY[id]=o;if(!GOOD_DRAW[id])GOOD_DRAW[id]=c[4];}}
  function gold(g,w,h,u){g.save();g.lineWidth=Math.max(2,4*u);g.strokeStyle=lin(g,0,0,w,h,['#fff2a8','#d4a017','#fff2a8','#b8860b']);rrect(g,2,2,w-4,h-4,8*u);g.stroke();g.restore();}
  window.GBR2={v:1,list:L,count:L.length,
    get:function(k){return L[k-10]||null;},byId:function(id){return BY[id]||null;},
    draw:function(g,k,cx,by,s){var o=L[k-10];if(!o)return;var u=s/100;g.save();g.lineJoin='round';g.lineCap='round';o.f(g,cx,by,u);g.restore();},
    gold:gold,
    install:function(){if(typeof RARE==='undefined')return;for(var i=0;i<L.length;i++){var o=L[i];if(!RARE[o.k])RARE[o.k]={n:o.n,c:o.c};}}};
})();
