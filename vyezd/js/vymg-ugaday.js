'use strict';
/* vy-mgc · мини-игра №13 «Угадай машину» (ведущий — Михалыч). Договор — шапка js/vymg-core.js; набор — js/vymg-mgckit.js (VYC); машины — VYCARS (js/art-cars.js, ART).
   Вечер, у гаражей горит фонарь — во дворе стоит машина, видно только силуэт. 4 варианта названия; потом «А какого года?» — год колёсиком.
   6 машин (сначала обычные, к концу редкие и легенды). Очки за машину: название — 2, год ±2 — ещё 1. Всего до 18; ступени 7/11/15. Без таймера.
   Варианты никогда не совпадают силуэтом (Копейка/Шестёрка/Москвич — одна форма: в вариантах только одна из них). ПК: 1–4 — вариант, ←/→ ±1 год, ↑/↓ ±5, Enter. */
(function(){if(typeof VYMG_REG!=='function'||!window.VYC)return;
var K=window.VYC,ID='ugaday',N=6,CUT=[7,11,15],Y0=1940,Y1=2000,YSTART=1970;
/* короткие байки Михалыча про каждую машину */
var FACT={
 kopeyka:'Первая «Лада» — родственница итальянского «Фиата», но крепче: для наших дорог.',
 shesterka:'Самая долгая «классика»: выпускали почти тридцать лет!',
 devyatka:'«Девятка» — мечта парней девяностых: тонировка и магнитофон.',
 moskvich:'Москвич-412 доехал в ралли Лондон — Сидней. Вот это машина!',
 zapor:'«Ушастый»: уши — это воздухозаборники, охлаждают мотор сзади.',
 gorbaty:'Мотор сзади, багажник спереди — как у «Жука». Ласково — «Горбатый».',
 oka:'Чуть длиннее трёх метров. Зато паркуется где угодно!',
 niva:'Один из первых в мире кроссоверов — её покупали даже в Японии.',
 volga:'Машина начальства. Чёрная — значит, едет кто-то важный.',
 taxi:'Шашечки на двери и зелёный огонёк — «свободно»!',
 buhanka:'Похожа на батон — отсюда «Буханка». Проедет по любой грязи.',
 raf:'Микроавтобус из Риги: маршрутное такси нашего детства.',
 gazel:'Не совсем советская, но своя: маршрутка девяностых.',
 kabluk:'«Каблучок» — Москвич с будкой: возил хлеб и почту.',
 gazon:'ГАЗ-53 — «Газон»: самый массовый грузовик Союза.',
 hleb:'Хлебовоз: открыл дверцу — и весь двор пахнет батонами.',
 moloko:'Молоко в цистерне — бидоны несли всем подъездом.',
 paz:'ПАЗик — со смешным капотом спереди. Возил в школу и на дачу.',
 laz:'«Львов» — автобус с «короной» на крыше для света в салоне.',
 liaz:'«Скотовоз» — так его звали за давку в час пик.',
 ikarus:'Венгерская «гармошка» — гнётся посередине на поворотах.',
 trolley:'Рога соскочили — водитель выходит и ставит их на провод.',
 skoraya:'РАФ с красным крестом — «Скорая» нашего детства.',
 tabletka:'«Таблетка» — санитарный УАЗ, проедет к любой деревне.',
 bobik:'«Бобик» — милицейский УАЗ. Видишь — сразу ведёшь себя хорошо.',
 pozhar:'Пожарная на ЗИЛе — с лестницей, до пятого этажа достанет.',
 polivalka:'Поливалка — летом за ней бегали все дворовые пацаны.',
 musorovoz:'Мусоровоз гремит рано утром — будильник всего двора.',
 morozh:'Пломбир за 48 копеек — вот что возила эта машина!',
 samosval:'Самосвал: кузов поднимает — и куча песка готова.',
 kamaz:'КамАЗ — кабина над мотором. На ралли «Дакар» он чемпион!',
 gaz66:'«Шишига» — вездеход армии и геологов, ходит по бездорожью.',
 kran:'Автокран на ЗИЛе — ставил плиты, когда строили наш дом.',
 belarus:'Трактор «Беларус» — колёса задние огромные, передние маленькие.',
 trekol:'Шины-пузыри: этот вездеход даже плавать умеет.',
 pobeda:'Назвали в честь Победы. Крыша покатая — «фастбэк».',
 volga21:'На капоте — хромированный олень. Мечта каждого двора.',
 zim:'ЗИМ — шестиместный, для министров и докторов наук.',
 chaika:'Для министров и свадеб. С «плавниками» сзади — по моде тех лет.',
 zil:'ЗИЛ-114 — машина вождей. Собирали почти вручную.'};
var FACT_EN={
 kopeyka:'The first Lada — a cousin of the Italian Fiat, only tougher: built for our roads.',
 shesterka:'The longest-lived classic: made for almost thirty years!',
 devyatka:'The Devyatka — every 90s lad’s dream: tinted windows and a tape deck.',
 moskvich:'The Moskvich-412 made it through the London–Sydney rally. What a car!',
 zapor:'“Big Ears”: the ears are air scoops cooling the rear engine.',
 gorbaty:'Engine in the back, boot in the front — like a Beetle. Lovingly called “Humpy”.',
 oka:'Barely longer than three metres. Parks anywhere!',
 niva:'One of the world’s first crossovers — even sold in Japan.',
 volga:'The boss’s car. A black one means someone important is coming.',
 taxi:'Checkers on the door and a green light — “free”!',
 buhanka:'Shaped like a loaf of bread — hence “Bukhanka”. Goes through any mud.',
 raf:'A minibus from Riga: the shared taxi of our childhood.',
 gazel:'Not quite Soviet, but one of ours: the 90s minibus.',
 kabluk:'The “Kabluchok” — a Moskvich with a box: carried bread and mail.',
 gazon:'The GAZ-53 “Gazon”: the most common truck in the USSR.',
 hleb:'The bread van: open the door — and the whole yard smells of loaves.',
 moloko:'Milk in a tank — the whole block came out with cans.',
 paz:'The PAZik — with a funny bonnet in front. To school and to the dacha.',
 laz:'The “Lviv” — a bus with a “crown” on the roof to light the cabin.',
 liaz:'Nicknamed the “cattle truck” for the rush-hour crush.',
 ikarus:'The Hungarian “accordion” — it bends in the middle on turns.',
 trolley:'The poles jumped off — the driver gets out and puts them back on the wire.',
 skoraya:'A RAF with a red cross — the ambulance of our childhood.',
 tabletka:'The “Pill” — a UAZ ambulance that reaches any village.',
 bobik:'The “Bobik” — a police UAZ. See it and you behave at once.',
 pozhar:'A ZIL fire engine — its ladder reaches the fifth floor.',
 polivalka:'The street sprinkler — in summer every kid in the yard chased it.',
 musorovoz:'The bin lorry rattles early in the morning — the yard’s alarm clock.',
 morozh:'Ice cream for 48 kopecks — that’s what this van carried!',
 samosval:'A dump truck: up goes the body — and there’s your pile of sand.',
 kamaz:'The KAMAZ — cab over the engine. A Dakar rally champion!',
 gaz66:'The “Shishiga” — an off-roader for the army and geologists.',
 kran:'A truck crane on a ZIL — it set the slabs when our block was built.',
 belarus:'The “Belarus” tractor — huge rear wheels, tiny front ones.',
 trekol:'Balloon tyres: this all-terrain vehicle can even swim.',
 pobeda:'Named after the Victory. A sloping “fastback” roof.',
 volga21:'A chrome deer on the bonnet. Every yard’s dream.',
 zim:'The ZIM — six seats, for ministers and professors.',
 chaika:'For ministers and weddings. With tail “fins”, as was the fashion.',
 zil:'The ZIL-114 — the leaders’ car. Assembled almost by hand.'};
/* «одна форма» — варианты с одинаковым силуэтом не ставим вместе */
var SAME={shesterka:'sedan',moskvich:'sedan',kopeyka:'sedan',morozh:'raf',raf:'raf',volga:'gaz24',taxi:'gaz24'}; /* vy-merge: Волга и Такси — один кузов ГАЗ-24, в один вопрос не ставим (решение владельца после ART2) */
function key(c){return SAME[c.id]||(c.s+'|'+(c.cargo||'')+'|'+(c.cab||'')+'|'+(/taxi|skoraya|tabletka|bobik/.test(c.id)?c.id:''));}
function cars(){return window.VYCARS&&VYCARS.list&&VYCARS.list.length?VYCARS.list:[];}
function pickRounds(R){var L=cars(),com=K.shuffle(L.filter(function(c){return c.rar==='common';}),R),rare=K.shuffle(L.filter(function(c){return c.rar!=='common';}),R);
  var seq=com.slice(0,4).concat(rare.slice(0,2)),out=[],seenK={};
  // разные силуэты по всему заходу (чтобы не было двух седанов подряд)
  var pool=com.concat(rare);for(var i=0;i<seq.length;i++){var c=seq[i];if(seenK[key(c)]){c=null;for(var j=0;j<pool.length;j++){var p=pool[j];if(!seenK[key(p)]&&out.indexOf(p)<0&&(i<4?p.rar==='common':p.rar!=='common')){c=p;break;}}}
    if(c){seenK[key(c)]=1;out.push(c);}}
  return out.slice(0,N).map(function(c){return {c:c,opts:opts(c,L,R)};});}
function opts(c,L,R){var ks={},res=[c];ks[key(c)]=1;
  var same=K.shuffle(L.filter(function(x){return x.ser===c.ser;}),R),any=K.shuffle(L,R);
  [same,any].forEach(function(src,si){for(var i=0;i<src.length&&res.length<(si?4:3);i++){var x=src[i];if(ks[key(x)]||res.indexOf(x)>=0)continue;ks[key(x)]=1;res.push(x);}});
  return K.shuffle(res,R);}
function ypts(d){return Math.abs(d)<=2?1:0;}
var T=K.L;
var SAY={start:function(){return T('Фонарь у гаражей светит еле-еле — видно только силуэт. Что за машина?','The lamp by the garages is dim — only a silhouette shows. What car is it?');},
 ok:function(){return [T('Точно! Глаз намётанный.','Right! A sharp eye.'),T('Она самая! Узнал.','That’s the one! Spot on.'),T('Верно! Как в журнале «За рулём».','Correct! Straight out of a car magazine.')];},
 no:function(){return [T('Нет, это ','No, that’s the '),T('Э, нет — это ','Nope — it’s the ')];},
 year:function(){return T('А какого она года? Крути колёсико.','And what year is it from? Spin the wheel.');},
 y1:function(){return [T('Год в точку! Ну ты знаток.','Spot-on year! You’re an expert.'),T('Почти день в день!','Almost to the day!')];},
 y0:function(y){return T('Мимо по году — '+y+'-й. Не беда.','Wrong year — it’s '+y+'. No matter.');},
 next:function(){return T('Следующая подъезжает… Что за машина?','The next one’s pulling up… What car is it?');}};
function fact(id){return T(FACT[id]||'',FACT_EN[id]||'');}

function run(host,o){var R=o.rnd||Math.random,calm=K.calm(o);var rs=pickRounds(R);
  var f=K.frame(host,o,{who:'mihalych'}),C=K.canvas(f.main),ctx=C.ctx;
  var st={i:0,ph:'ask',res:[],score:0,y:YSTART,pick:null,rev:0,t:0,fin:false,rs:rs,carX:0};window.__vyc_ugaday=st;
  if(!rs.length){f.say(T('Машины ещё не приехали — загляни позже.','The cars haven’t arrived yet — come back later.'),'sad');setTimeout(function(){host.quit&&host.quit();},1500);return;}
  var sil={};// силуэты (кэш по id)
  function img(id){return window.VYCARS&&VYCARS.img?VYCARS.img(id,{view:'side',state:'new'}):null;}
  function silOf(id,w,h){var k=id+'|'+w+'|'+h;if(sil[k])return sil[k];var im=img(id);if(!im||!im.complete||!im.naturalWidth)return null;
    var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.drawImage(im,0,0,w,h);x.globalCompositeOperation='source-in';x.fillStyle='#1b2230';x.fillRect(0,0,w,h);sil[k]=c;return c;}
  if(window.VYCARS&&VYCARS.onload)VYCARS.onload(function(){});
  rs.forEach(function(r){img(r.c.id);});
  /* ---- шаги ---- */
  function ask(){st.ph='ask';st.pick=null;st.rev=0;st.y=YSTART;st.carX=calm?0:-1;var r=rs[st.i];
    f.prog(N,st.i,st.res);if(host.top)host.top(T('Машина ','Car ')+(st.i+1)+T(' из ',' of ')+N);
    f.say(st.i?SAY.next():SAY.start(),'norm');
    f.foot.innerHTML='';var g=document.createElement('div');g.className='vyc-opts';
    r.opts.forEach(function(c,k){var b=K.btn(K.carName(c)+K.kc(String(k+1),host),'',function(){answer(k);});b.setAttribute('data-k',k);g.appendChild(b);});f.foot.appendChild(g);}
  function answer(k){if(st.ph!=='ask'||host.paused)return;var r=rs[st.i],c=r.opts[k],ok=c===r.c;st.pick=k;st.ph='rev';st.rev=0;
    var bs=f.foot.querySelectorAll('.vyc-b');bs.forEach(function(b,j){b.disabled=true;b.style.opacity='1';if(r.opts[j]===r.c)b.classList.add('ok');else if(j===k)b.classList.add('no');});
    var p=ok?2:0;st.res[st.i]=p;st.score+=p;K.snd(host,ok?'right':'wrong');K.buzz(ok?15:30);
    f.say(ok?K.pick(SAY.ok(),R)+' <b>'+K.carName(r.c,1)+'</b>.':K.pick(SAY.no(),R)+'<b>'+K.carName(r.c,1)+'</b>.',ok?'happy':'sad');
    setTimeout(function(){if(st.fin)return;yearStep();},calm?500:1100);}
  function yearStep(){st.ph='year';f.say(SAY.year(),'norm');f.foot.innerHTML='';
    var w=document.createElement('div');w.style.cssText='display:flex;gap:6px;align-items:center;justify-content:center;width:100%';
    var m5=K.btn('−5'+K.kc('↓',host),'',function(){add(-5);}),m1=K.btn('−1'+K.kc('←',host),'',function(){add(-1);}),p1=K.btn('+1'+K.kc('→',host),'',function(){add(1);}),p5=K.btn('+5'+K.kc('↑',host),'',function(){add(5);});
    var yv=document.createElement('div');yv.className='vyc-yr';yv.style.cssText='flex:1;max-width:150px;min-height:56px;display:flex;align-items:center;justify-content:center;background:#fffdf7;border-radius:16px;font:800 30px/1 Rubik,sans-serif;box-shadow:inset 0 2px 6px rgba(0,0,0,.15);cursor:ew-resize;touch-action:none';
    var go=K.btn(T('Вот этого!','This one!')+K.kc('Enter',host),'acc',yearAns);
    [m5,m1,yv,p1,p5].forEach(function(e){w.appendChild(e);});m5.style.minWidth=m1.style.minWidth=p1.style.minWidth=p5.style.minWidth='48px';m5.style.padding=m1.style.padding=p1.style.padding=p5.style.padding='8px 6px';
    var col=document.createElement('div');col.style.cssText='display:flex;flex-direction:column;gap:8px;width:100%;max-width:520px;align-items:stretch';col.appendChild(w);col.appendChild(go);f.foot.appendChild(col);
    st.yv=yv;showY();
    // тянуть пальцем/мышью по году — колёсико
    var sx=null,sy0=0;yv.addEventListener('pointerdown',function(e){sx=e.clientX;sy0=st.y;try{yv.setPointerCapture(e.pointerId);}catch(x){}});
    yv.addEventListener('pointermove',function(e){if(sx==null||st.ph!=='year')return;var ny=Math.max(Y0,Math.min(Y1,sy0+Math.round((e.clientX-sx)/14)));if(ny!==st.y){st.y=ny;showY();K.snd(host,'tap');}});
    yv.addEventListener('pointerup',function(){sx=null;});yv.addEventListener('pointercancel',function(){sx=null;});
    yv.addEventListener('wheel',function(e){e.preventDefault();add(e.deltaY>0?-1:1);},{passive:false});}
  function add(d){if(st.ph!=='year')return;var ny=Math.max(Y0,Math.min(Y1,st.y+d));if(ny===st.y)return;st.y=ny;showY();K.snd(host,'tap');}
  function showY(){if(st.yv)st.yv.textContent=st.y;}
  function yearAns(){if(st.ph!=='year'||host.paused)return;var r=rs[st.i],d=st.y-r.c.yr,p=ypts(d);st.res[st.i]+=p;st.score+=p;st.ph='done';
    K.snd(host,p?'coin':'tap');f.prog(N,-1,st.res.map(function(x){return Math.min(3,x);}));
    f.say((p?K.pick(SAY.y1(),R):SAY.y0(r.c.yr))+' <i>'+fact(r.c.id)+'</i>',p?'happy':'norm');
    f.foot.innerHTML='';var last=st.i>=N-1||st.i>=rs.length-1;
    var info=document.createElement('div');info.style.cssText='width:100%;text-align:center;font:600 15px/1.3 Rubik,sans-serif;margin-bottom:6px';
    info.innerHTML='<b style="font-size:20px">'+r.c.yr+'</b> · '+T('ты','you')+': '+st.y+(p?' ✓':'');
    var col=document.createElement('div');col.style.cssText='display:flex;flex-direction:column;gap:6px;width:100%;max-width:520px';col.appendChild(info);
    col.appendChild(K.btn((last?T('Итоги','Results'):T('Следующая машина','Next car'))+K.kc('Enter',host),'grn',next));f.foot.appendChild(col);}
  function next(){if(st.ph!=='done'||host.paused)return;if(st.i>=N-1||st.i>=rs.length-1){finish();return;}st.i++;ask();}
  function finish(){if(st.fin)return;st.fin=true;var nm=st.res.filter(function(x){return x>=2;}).length,yr=st.res.filter(function(x){return x%2===1;}).length;
    host.done({score:st.score,tier:K.tier(st.score,CUT),label:T('Узнал '+nm+' из '+rs.length+' · год угадал: '+yr,'Named '+nm+' of '+rs.length+' · right year: '+yr),extra:{max:rs.length*3}});}
  K.keys(host,function(k,e,d){if(!d)return false;
    if(st.ph==='ask'){if(/^[1-4]$/.test(k)){answer(+k-1);return true;}return K.optKeys(f.foot,k);}
    if(st.ph==='year'){var dr=K.dir(k);if(dr){add(dr==='L'?-1:dr==='R'?1:dr==='D'?-5:5);return true;}if(k==='Enter'||k===' '){yearAns();return true;}}
    if(st.ph==='done'&&(k==='Enter'||k===' ')){next();return true;}return false;});
  /* ---- сцена: вечер у гаражей, фонарь, машина ---- */
  var A=window.VYMG&&VYMG.art;
  function draw(dt,t){if(C.w!==f.main.clientWidth||C.h!==f.main.clientHeight)C.fit();var c=ctx,W=C.w,H=C.h,r=rs[st.i];st.t=t;
    if(st.ph!=='ask')st.rev=Math.min(1,st.rev+dt*(calm?4:1.6));if(st.carX<0)st.carX=Math.min(0,st.carX+dt*1.6);
    var gy=H*.80;
    // небо
    var g=c.createLinearGradient(0,0,0,gy);g.addColorStop(0,'#283a6b');g.addColorStop(.7,'#7a6aa8');g.addColorStop(1,'#e0a07e');c.fillStyle=g;c.fillRect(0,0,W,gy);
    // звёзды
    c.fillStyle='rgba(255,255,255,.7)';for(var i=0;i<22;i++){var sx=((i*.6180339+.11)%1)*W,sy=((i*.3819+.07)%1)*gy*.45,tw=calm?1:.6+.4*Math.sin(t*2+i);c.globalAlpha=tw;c.fillRect(sx,sy,1.6,1.6);}c.globalAlpha=1;
    // гаражи-ракушки и пятиэтажка вдали
    if(A&&A.house){try{A.house(c,W*.08,gy-H*.05,W*.38,H*.42,{fl:5,lit:.35,seed:3,col:'#3d4566'});A.house(c,W*.58,gy-H*.04,W*.36,H*.36,{fl:5,lit:.3,seed:8,col:'#394060'});}catch(e){}}
    else{c.fillStyle='#363e60';c.fillRect(W*.08,gy-H*.47,W*.38,H*.42);c.fillRect(W*.58,gy-H*.40,W*.36,H*.36);
      c.fillStyle='rgba(255,214,110,.75)';for(var fx=0;fx<6;fx++)for(var fy=0;fy<5;fy++)if((fx*7+fy*3)%4===0){c.fillRect(W*.1+fx*W*.058,gy-H*.44+fy*H*.075,W*.025,H*.035);}}
    // гаражи
    c.fillStyle='#4b5470';for(var gi=0;gi<5;gi++){var gx=gi*W*.2;c.fillRect(gx+2,gy-H*.16,W*.2-4,H*.16);c.fillStyle='#596384';c.fillRect(gx+W*.03,gy-H*.13,W*.14,H*.13);c.fillStyle='#4b5470';}
    // земля
    c.fillStyle='#3b3f4a';c.fillRect(0,gy,W,H-gy);c.fillStyle='#4a4f5c';c.fillRect(0,gy,W,3);
    // фонарь и пятно света
    var lx=W*.5,on=st.ph==='ask'?.35:.35+.65*st.rev;
    c.strokeStyle='#22283a';c.lineWidth=4;c.beginPath();c.moveTo(lx+W*.3,gy);c.lineTo(lx+W*.3,H*.08);c.quadraticCurveTo(lx+W*.3,H*.04,lx+W*.24,H*.05);c.stroke();
    var cg=c.createRadialGradient(lx,gy,4,lx,gy,W*.55);cg.addColorStop(0,'rgba(255,236,170,'+(.55*on)+')');cg.addColorStop(1,'rgba(255,236,170,0)');
    c.fillStyle=cg;c.beginPath();c.moveTo(lx+W*.24,H*.06);c.lineTo(lx-W*.45,gy+8);c.lineTo(lx+W*.5,gy+8);c.closePath();c.fill();
    c.fillStyle='rgba(255,240,190,'+(.6+.4*on)+')';c.beginPath();c.arc(lx+W*.24,H*.065,5,0,7);c.fill();
    // машина
    var cw=Math.min(W*.86,560),ch=cw*130/300,cx=(W-cw)/2+st.carX*W,cy=gy-ch*122/130+4;
    var im=img(r.c.id),sh=silOf(r.c.id,Math.round(cw*C.dpr),Math.round(ch*C.dpr));
    c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx+cw/2,gy+3,cw*.44,6,0,0,7);c.fill();
    if(sh){c.globalAlpha=1-(st.ph==='ask'?0:st.rev);c.drawImage(sh,cx,cy,cw,ch);c.globalAlpha=1;}
    if(st.ph!=='ask'&&im&&im.complete){c.globalAlpha=st.rev;c.drawImage(im,cx,cy,cw,ch);c.globalAlpha=1;}
    if(!sh&&st.ph==='ask'){c.fillStyle='rgba(255,255,255,.6)';c.font='600 15px Rubik,sans-serif';c.textAlign='center';c.fillText('…',W/2,gy-20);c.textAlign='left';}
    // табличка с названием после ответа
    if(st.ph!=='ask'&&st.rev>.3){c.globalAlpha=Math.min(1,(st.rev-.3)/.4);var tx=K.carName(r.c,1),fs=Math.max(14,Math.min(20,W/24));c.font='700 '+fs+'px Rubik,sans-serif';
      var tw=c.measureText(tx).width+24,ty=gy+(H-gy)/2-fs*.8;K.rr(c,(W-tw)/2,ty,tw,fs*1.6,10);c.fillStyle='#fffdf7';c.fill();c.fillStyle='#2d3436';c.textAlign='center';c.textBaseline='middle';
      c.fillText(tx,W/2,ty+fs*.8);c.textAlign='left';c.textBaseline='alphabetic';c.globalAlpha=1;}}
  K.loop(host,draw);
  f.say(SAY.start(),'norm');
  K.intro(host,{who:'mihalych',text:T('Я в молодости все машины на слух узнавал! А ты по силуэту узнаешь? Шесть машин — и угадай год выпуска.','In my day I knew every car by its engine sound! Can you tell them by silhouette? Six cars — and guess the year.'),
    hint:K.pc(host)?T('1–4 или стрелки + Enter — вариант · год: ←/→ — на 1, ↑/↓ — на 5 · Enter — ответ и дальше','1–4 or arrows + Enter — answer · year: ←/→ — by 1, ↑/↓ — by 5 · Enter — confirm and next'):T('Нажми на название, потом подкрути год','Tap the name, then dial the year'),btn:T('Включить фонарь','Switch on the lamp')},ask);
  st.api={answer:answer,yearAns:yearAns,next:next,add:add};}
/* бот: k — умение; название узнаёт с вероятностью 0,35+0,6k, год ±2 — 0,15+0,5k */
function sim(o,k){var R=o.rnd||Math.random,s=0;k=k==null?.6:k;for(var i=0;i<N;i++){if(R()<.35+.6*k)s+=2;if(R()<.15+.5*k)s+=1;}return {score:s,tier:K.tier(s,CUT)};}
VYMG_REG({id:ID,n:K.L('Угадай машину','Guess the Car'),a:K.L('По силуэту — что за машина?','What car is that silhouette?'),run:run,sim:sim});
})();
