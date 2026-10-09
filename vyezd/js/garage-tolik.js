/* Выезд со двора — ГАРАЖ ТОЛИКА «КАРБЮРАТОРА»: реставрация ржавых машин Автоальбома и барахолка (поток YARD, 10.10.2026). Журнал: logs/YARD.md; 04 §2.3.
   Толик — тот же, что в «Покере на спички» (holdem LOOK.tolik, headSvg): синий комбинезон, серая кепка, усы; манера — осторожный, «по-соседски», «без резких движений».
   Если ART даст общий рисунок (window.ARTP.face('tolik') / VYPEOPLE.svg('tolik')) — берём его; иначе — перенос headSvg + LOOK.tolik из Покера.
   Реставрация — 3 шага (кузов → мотор → покраска), за каждый шаг монеты + детали 🔩, шаг идёт по часам (Толик работает и без тебя — повод зайти).
   Гаражи (объект «Гаражи Толика» в «Моём дворе»): 1-й ур. — открывает ремонт (1 место), 2-й — второе место, 3-й — быстрее на четверть.
   Цены (04 §2.3): обычная 300 💰 + 25 🔩, редкая 600 + 60, легенда 1200 + 120 — на 3 шага (35/35/30 %). Время шага: 1/2/3 ч, 4/2/6 ч… (RT).
   Ускорить за ролик/голоса — нельзя (решение 04 §4.2: прогресс не продаём). Барахолка (с района «Микрорайон»): редкие ржавые машины за монеты.
   Сохранение: S.albJ [{id, s: шаг 0..2, e: когда готово}]. Наружу: window.TOLIK: say(html), face(m), job(id), jobs(), cost(id), start(id), take(id). */
(function(){
'use strict';
var MY=window.MY,ALB=window.ALB;if(!MY||!ALB)return;
var esc=MY.esc,Q=MY.Q;
var L=function(r,e){try{return LANG==='en'?e:r;}catch(x){return r;}};
var COST=[[300,25],[600,60],[1200,120]],PART=[.35,.35,.3],RT=[[1,2,3],[2,4,6],[4,8,12]];
var STEP=[['Кузов','Body'],['Мотор','Engine'],['Покраска','Paint']];

/* ---------- облик Толика (порт из Покера: headSvg + LOOK.tolik) ---------- */
var TL={bg:'#e3e9f2',body:'#2c5aa0',bodyX:'<path d="M72 150 v50 M128 150 v50" stroke="#1d3f73" stroke-width="8"/><circle cx="72" cy="172" r="4" fill="#f5b72d"/><circle cx="128" cy="172" r="4" fill="#f5b72d"/>',
  hat:'<path d="M50 74 q4 -44 52 -46 q46 2 50 40 q-50 -8 -102 6z" fill="#6b6f76"/><path d="M50 74 q50 -14 102 -6 q18 4 22 12 q-62 -10 -124 -6z" fill="#565a61"/><circle cx="102" cy="30" r="4" fill="#565a61"/>',
  face:'<path d="M76 116 q12 -8 24 -2 q12 -6 24 2 q-6 10 -24 6 q-18 4 -24 -6z" fill="#5b3a29"/><path d="M60 104 l8 2" stroke="#555" stroke-width="3" opacity=".5"/>',brow:'#5b3a29'};
function eyes(m){return m==='happy'?'<path d="M75 96 q8 -8 16 0 M109 96 q8 -8 16 0" stroke="#3a2a22" stroke-width="3.4" fill="none" stroke-linecap="round"/>':'<ellipse cx="83" cy="96" rx="5.5" ry="6.5" fill="#3a2a22"/><ellipse cx="117" cy="96" rx="5.5" ry="6.5" fill="#3a2a22"/><circle cx="85" cy="94" r="1.8" fill="#fff"/><circle cx="119" cy="94" r="1.8" fill="#fff"/>';}
function brows(m,c){return m==='sad'?'<path d="M72 80 q10 -2 18 5 M128 80 q-10 -2 -18 5" stroke="'+c+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>':'<path d="M72 83 q10 -5 20 0 M108 83 q10 -5 20 0" stroke="'+c+'" stroke-width="4.5" fill="none" stroke-linecap="round"/>';}
function mouth(m){return m==='happy'?'<path d="M84 119 q16 19 32 0 q-16 6 -32 0z" fill="#b83b44"/><path d="M89 123 q11 6 22 0" fill="#fff" opacity=".9"/>':m==='sad'?'<path d="M88 130 q12 -9 24 0" stroke="#b83b44" stroke-width="4" fill="none" stroke-linecap="round"/>':'<path d="M86 121 q14 13 28 0" stroke="#b83b44" stroke-width="4.2" fill="none" stroke-linecap="round"/>';}
var FN=0;
function face(m){m=m||'norm';try{if(window.VYPPL&&VYPPL.svg){var v=VYPPL.svg('tolik',m==='norm'?'norm':m);if(v)return v;}if(window.ARTP&&ARTP.face){var a=ARTP.face('tolik',m);if(a)return a;}if(window.VYPEOPLE&&VYPEOPLE.svg){var b=VYPEOPLE.svg('tolik',{mood:m});if(b)return b;}}catch(e){}
  var u='tl'+(++FN),o=TL;
  return '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="'+u+'" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffe2cc"/><stop offset="1" stop-color="#f5c9a8"/></radialGradient></defs>'+
  '<rect width="200" height="200" fill="'+o.bg+'"/><path d="M28 200 q4 -46 44 -54 h56 q40 8 44 54z" fill="'+o.body+'"/>'+o.bodyX+'<rect x="88" y="128" width="24" height="22" rx="8" fill="#e9ae88"/>'+
  '<circle cx="53" cy="104" r="8" fill="#f5c9a8"/><circle cx="147" cy="104" r="8" fill="#f5c9a8"/><ellipse cx="100" cy="98" rx="47" ry="50" fill="url(#'+u+')"/>'+
  '<ellipse cx="70" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".4"/><ellipse cx="130" cy="114" rx="10" ry="6.5" fill="#f58f8f" opacity=".4"/>'+brows(m,o.brow)+eyes(m)+
  '<path d="M100 100 q-5 12 -1 15 q4 2 7 -1" stroke="#e9ae88" stroke-width="3" fill="none" stroke-linecap="round"/>'+mouth(m)+o.face+o.hat+'</svg>';}
var TOLIK=window.TOLIK={face:face};
TOLIK.say=function(t,m){return '<div class="tlsay"><span class="tlpf">'+face(m||'happy')+'</span><p><b>'+L('Толик «Карбюратор»','Tolik “Carburettor”')+'</b>'+t+'</p></div>';};
var LINES={
  hi:[['Заходи, сосед. Только аккуратно — тут масло на полу.','Come in, neighbour. Careful — oil on the floor.'],['Карбюратор я тебе за так переберу. А вот кузов — дело серьёзное.','I’ll redo your carburettor for free. The body, though — that’s serious work.'],['Не торопись. Машина спешки не любит.','Take it slow. Cars don’t like a rush.'],['Тут без резких движений. По-соседски всё сделаем.','No sudden moves here. We’ll sort it out, neighbour-style.']],
  none:[['Ржавых пока нет. Пройди регион — что-нибудь да пригонят.','No rusty cars yet. Clear a region — someone will bring one in.'],['Пусто в гараже. Скучно мне без работы, сосед.','The garage is empty. I’m bored without work, neighbour.']],
  work:[['Работаю. Чай не остыл ещё, а я уже половину сделал.','Working on it. Tea’s still warm and I’m halfway done.'],['Слышишь, как звенит? Это хорошо. Значит, живой мотор.','Hear that ring? That’s good — the engine’s alive.']],
  done:[['Принимай работу! Как новенькая.','Here you go! Good as new.'],['Готово. Только по лужам первую неделю не гоняй.','Done. Just don’t race through puddles the first week.']],
  nogar:[['Мне бы гараж, сосед. Под открытым небом мотор не переберёшь.','I need a garage, neighbour. Can’t rebuild an engine out in the open.']]};
function line(k){var a=LINES[k]||LINES.hi,x=a[Math.floor(MY.now()/36e5)%a.length];return L(x[0],x[1]);}

/* ---------- сохранение ---------- */
MY.fix(function(){if(!Array.isArray(S.albJ))S.albJ=[];var seen={};S.albJ=S.albJ.filter(function(j){if(!j||typeof j!=='object'||!ALB.byId(j.id)||seen[j.id])return false;seen[j.id]=1;
  var s=ALB.st(j.id);if(!(s>=1&&s<4))return false;j.s=s-1;if(typeof j.e!=='number'||!isFinite(j.e))j.e=0;return true;}).slice(0,2);});
MY.merge(function(loc,d){if(!Array.isArray(d.albJ))return;d.albJ.forEach(function(j){if(!j||!ALB.byId(j.id))return;var mine=S.albJ.filter(function(x){return x.id===j.id;})[0];
  if(!mine){if(S.albJ.length<2)S.albJ.push({id:j.id,s:j.s|0,e:+j.e||0});}else if((j.s|0)>(mine.s|0)||(j.s===mine.s&&+j.e<mine.e)){mine.s=j.s|0;mine.e=+j.e||0;}});});

/* ---------- ремонт ---------- */
function rar(id){var c=ALB.byId(id);return c?c.r:0;}
TOLIK.slots=function(){var g=MY.kindLv('gar');return g>=2?2:g>=1?1:0;};
TOLIK.speed=function(){return MY.kindLv('gar')>=3?.75:1;};
// цена шага s (0..2): монеты, детали, часы
TOLIK.cost=function(id,s){var r=rar(id);if(s==null){var st=ALB.st(id);s=Math.max(0,st-1);}
  return {c:Math.round(COST[r][0]*PART[s]/10)*10,p:Math.round(COST[r][1]*PART[s]),h:RT[r][s]*TOLIK.speed(),s:s};};
TOLIK.full=function(id){var r=rar(id);return {c:COST[r][0],p:COST[r][1]};};
TOLIK.job=function(id){var j=S.albJ.filter(function(x){return x.id===id;})[0];if(!j)return null;return {id:j.id,s:j.s,e:j.e,done:MY.now()>=j.e};};
TOLIK.jobs=function(){return S.albJ.map(function(j){return TOLIK.job(j.id);});};
TOLIK.ready=function(){return S.albJ.filter(function(j){return MY.now()>=j.e;}).length;};
TOLIK.free=function(){return Math.max(0,TOLIK.slots()-S.albJ.length);};
TOLIK.start=function(id){var s=ALB.st(id);if(!(s>=1&&s<4)||TOLIK.job(id))return false;if(!TOLIK.free()){MY.toast(L('Оба места заняты — подожди, пока Толик закончит.','All spots are busy — wait until Tolik finishes.'));return false;}
  var k=TOLIK.cost(id);if(MY.coins()<k.c){need(k.c-MY.coins(),'c');return false;}if(MY.prt.get()<k.p){need(k.p-MY.prt.get(),'p');return false;}
  if(!MY.spend(k.c,'rest'))return false;MY.prt.spend(k.p,'rest');S.albJ.push({id:id,s:k.s,e:MY.now()+k.h*36e5});MY.save();
  MY.ev('car',{id:id,a:'step',s:k.s+1,c:k.c,p:k.p});return true;};
TOLIK.take=function(id){var j=S.albJ.filter(function(x){return x.id===id;})[0];if(!j||MY.now()<j.e)return 0;S.albJ=S.albJ.filter(function(x){return x.id!==id;});
  var ns=Math.min(4,(j.s|0)+2);S.alb[id]=Math.max(S.alb[id]|0,ns);MY.save();MY.ev('car',{id:id,a:'done',s:j.s+1});MY.fire('restore',{id:id,s:ns});return ns;};
function need(n,k){var h=k==='c'?L('Не хватает ','You need ')+MY.ct(n)+L('. Монеты — за дворы, сундуки и стоянку во дворе.',' more. Coins come from yards, chests and your parking lot.')
  :L('Не хватает ','You need ')+n+' 🔩'+L('. Детали не продаются — их дают ★★★ во дворах, затеи, сундук дня, голубиная почта и лига.',' more. Parts can’t be bought — they come from ★★★ yards, mini-games, the daily chest, pigeon post and the league.');
  try{modal('<h2>'+(k==='c'?L('Не хватает монет','Not enough coins'):L('Не хватает деталей','Not enough parts'))+'</h2>'+TOLIK.say(k==='c'?L('Бесплатно, сосед, только карбюратор. За кузов — платить.','Only the carburettor is free, neighbour. The body costs money.'):L('Без деталей не соберу. Найди мне болтов да гаек.','Can’t build it without parts. Find me some nuts and bolts.'),'sad')+'<p>'+h+'</p><div class="row"><button class="btn" id="mCancel">'+L('Понятно','OK')+'</button></div>');Q('mCancel').onclick=function(){hideModal();};}catch(e){MY.toast(h);}}

/* ---------- готово: празднуем ---------- */
function finished(id){var c=ALB.byId(id);if(!c)return;
  var h='<h2>'+L('Как новенькая!','Good as new!')+'</h2><div class="albbig shine">'+ALB.svg(id,{big:1})+'</div><p><b>'+esc(ALB.nm(id))+'</b> · <span class="albrar r'+c.r+'">'+ALB.rarName(c.r)+'</span></p>'+TOLIK.say(line('done'))+
    '<p>'+L('Машина в альбоме. Поставить её во дворы — пусть соседи завидуют?','The car is in the album. Park it in the yards so the neighbours can admire it?')+'</p>';
  try{modal(h+'<div class="row"><button class="btn green" id="tlY">🏠 '+L('Во дворы','To the yards')+'</button><button class="btn" id="mCancel">'+L('Потом','Later')+'</button></div>');}catch(e){return;}
  try{SND.win();}catch(e){}try{if(!MY.calm()&&typeof confetti==='function')confetti();}catch(e){}
  Q('tlY').onclick=function(){S.albY[id]=1;MY.save();MY.fire('yardcars');hideModal();MY.toast('🏠 '+ALB.nm(id)+L(' — во дворах!',' — in the yards!'));MY.render();};
  Q('mCancel').onclick=function(){hideModal();MY.render();};}

/* ---------- вкладка «Гараж» ---------- */
var tick=null;
function render(el){clearInterval(tick);var gl=MY.kindLv('gar'),slots=TOLIK.slots(),rusty=ALB.rusty(),h='';
  var mood=!gl?'nogar':S.albJ.length?(TOLIK.ready()?'done':'work'):rusty.length?'hi':'none';
  h+=TOLIK.say(line(mood),mood==='nogar'||mood==='none'?'norm':'happy');
  h+='<div class="tlprt"><span>🔩 <b>'+MY.prt.get()+'</b> '+L('деталей','parts')+'</span><button class="btn noenter" id="tlPrt">'+L('Где взять?','Where to get?')+'</button></div>';
  if(!gl){var c=MY.price(0,2,0);h+='<div class="tlnogar"><span class="mybi">'+MY.icon(0,2,1)+'</span><span><b>'+L('Построй Толику гараж','Build Tolik a garage')+'</b><small>'+L('«Мой двор» → «Гаражи Толика», ','“My yard” → “Tolik’s garages”, ')+c+' 💰. '+L('Без гаража ремонта нет.','No garage — no repairs.')+'</small></span><button class="btn accent noenter" id="tlGar">'+L('Построить','Build')+'</button></div>';}
  else{h+='<h3 class="albser">🔧 '+L('На подъёмнике','On the lift')+' <small>'+S.albJ.length+'/'+slots+(gl<2?' · '+L('второе место — гаражи 2-го ур.','2nd spot — garages level 2'):'')+'</small></h3><div class="tljobs">';
    for(var k=0;k<slots;k++){var j=S.albJ[k];if(!j){h+='<div class="tljob empty"><span>'+L('Свободно — выбери ржавую машину ниже','Free — pick a rusty car below')+'</span></div>';continue;}
      var jb=TOLIK.job(j.id),k2=TOLIK.cost(j.id,j.s),pct=jb.done?100:Math.max(3,Math.round((1-(j.e-MY.now())/(k2.h*36e5))*100));
      h+='<div class="tljob'+(jb.done?' done':'')+'" data-j="'+j.id+'"><span class="albpic">'+ALB.svg(j.id,{rust:true})+'</span><span class="tljt"><b>'+esc(ALB.nm(j.id))+'</b><small>'+L(STEP[j.s][0],STEP[j.s][1])+' · '+(jb.done?L('готово!','done!'):'<span class="tlt" data-e="'+j.e+'">'+MY.hm(j.e-MY.now())+'</span>')+'</small><span class="tlbar"><i style="width:'+pct+'%"></i></span></span>'+
        (jb.done?'<button class="btn green noenter" data-take="'+j.id+'">'+L('Забрать','Collect')+'</button>':'<span class="tlwait">⏳</span>')+'</div>';}
    h+='</div>';}
  var queue=rusty.filter(function(c){return !TOLIK.job(c.id);});
  h+='<h3 class="albser">🚗 '+L('Ржавые машины','Rusty cars')+' <small>'+queue.length+'</small></h3>';
  if(!queue.length)h+='<p class="mynote">'+L('Новые ржавые машины дают регионы (каждые 10 дворов), районы карьеры, заказы жильцов и лига соседей.','New rusty cars come from regions (every 10 yards), career districts, resident orders and the neighbours’ league.')+'</p>';
  else h+='<div class="tlq">'+queue.map(function(c){var k=TOLIK.cost(c.id),s=ALB.st(c.id),ok=gl&&TOLIK.free()&&MY.coins()>=k.c&&MY.prt.get()>=k.p;
    return '<div class="tlqi r'+c.r+'"><span class="albpic">'+ALB.svg(c.id,{rust:true})+'</span><span class="tljt"><b>'+esc(ALB.nm(c.id))+'</b><small><span class="albrar r'+c.r+'">'+ALB.rarName(c.r)+'</span> · '+L('шаг','step')+' '+s+'/3: '+L(STEP[k.s][0],STEP[k.s][1])+' · '+k.h+' '+L('ч','h')+'</small></span>'+
      '<button class="btn '+(ok?'accent':'')+' noenter" data-st="'+c.id+'"'+(gl?'':' disabled')+'>'+k.c+' 💰 + '+k.p+' 🔩</button></div>';}).join('')+'</div>';
  // барахолка
  var lot=ALB.barLot(),bar=lot?[ALB.byId(lot.id)]:[];if(lot)bar[0].pr=lot.pr;
  h+='<h3 class="albser">🛠 '+L('Барахолка Толика','Tolik’s flea market')+'</h3>';
  if(MY.dist()<2)h+='<p class="mynote">🔒 '+L('Откроется в районе «Микрорайон»: Толик достанет редкие машины — ржавые, но настоящие.','Opens in the “Estate” district: Tolik will find rare cars — rusty, but genuine.')+'</p>';
  else if(!bar.length)h+='<p class="mynote">'+L('Сегодня на барахолке пусто — все редкие машины уже у тебя. Заходи завтра.','Nothing at the flea market today — you already have every rare car. Come back tomorrow.')+'</p>';
  else h+='<p class="mynote">'+L('Лот дня — каждый день другая редкая машина, которой у тебя ещё нет.','Lot of the day — a different rare car you don’t have yet, every day.')+'</p><div class="tlq">'+bar.map(function(c){var own=ALB.st(c.id)>0;return '<div class="tlqi r'+c.r+(own?' own':'')+'"><span class="albpic">'+ALB.svg(c.id,{rust:!own||ALB.st(c.id)<4})+'</span><span class="tljt"><b>'+esc(ALB.nm(c.id))+'</b><small><span class="albrar r1">'+ALB.rarName(c.r)+'</span> · '+esc(ALB.ab(c.id))+'</small></span>'+
    (own?'<span class="myok">✓</span>':'<button class="btn '+(MY.coins()>=c.pr?'accent':'')+' noenter" data-bar="'+c.id+'">'+c.pr+' 💰</button>')+'</div>';}).join('')+'</div>';
  h+='<p class="mynote">'+L('Ремонт идёт сам, даже когда ты не играешь. Ускорить нельзя — Толик спешки не любит.','Repairs go on even when you’re not playing. You can’t speed them up — Tolik doesn’t like to rush.')+'</p>';
  el.innerHTML=h;
  if(Q('tlPrt'))Q('tlPrt').onclick=function(){MY.prtInfo();};
  if(Q('tlGar'))Q('tlGar').onclick=function(){MY.snd('tap');MY.open('yard0');};
  el.querySelectorAll('[data-take]').forEach(function(b){b.onclick=function(){var id=b.dataset.take,ns=TOLIK.take(id);if(!ns)return;try{SND.coin();}catch(e){}
    if(ns>=4)finished(id);else{MY.toast('✓ '+ALB.nm(id)+': '+L(STEP[ns-2][0],STEP[ns-2][1]).toLowerCase()+L(' готов',' done'));render(el);}};});
  el.querySelectorAll('[data-st]').forEach(function(b){b.onclick=function(){if(!gl)return;if(TOLIK.start(b.dataset.st)){MY.toast('🔧 '+L('Толик взялся за дело','Tolik got to work'));render(el);}};});
  el.querySelectorAll('[data-bar]').forEach(function(b){b.onclick=function(){var c=ALB.byId(b.dataset.bar);if(!c||ALB.st(c.id))return;
    var lt=ALB.barLot();if(!lt||lt.id!==c.id)return;c.pr=lt.pr;if(MY.coins()<c.pr){need(c.pr-MY.coins(),'c');return;}
    try{modal('<h2>'+esc(ALB.nm(c.id))+'</h2><div class="albbig rust">'+ALB.svg(c.id,{rust:true,big:1})+'</div>'+TOLIK.say(L('Ржавая, но своя. Таких во всей области — раз-два и обчёлся.','Rusty, but it’s real. There are only a couple of these in the whole region.'))+
      '<div class="row"><button class="btn accent noenter" id="tlBuy">'+L('Купить','Buy')+' · '+c.pr+' 💰</button><button class="btn" id="mCancel">'+L('Отмена','Cancel')+'</button></div>');}catch(e){return;}
    Q('mCancel').onclick=function(){hideModal();};Q('tlBuy').onclick=function(){if(!MY.spend(c.pr,'bar'))return;ALB.give(c.id,'bar',true);hideModal();MY.toast('🛠 '+ALB.nm(c.id)+L(' — в гараже Толика',' — in Tolik’s garage'));render(el);};};});
  tick=setInterval(function(){if(!document.body.contains(el)||!MY.isOpen()||MY.cur()!=='garage'){clearInterval(tick);return;}
    var any=false;el.querySelectorAll('.tlt').forEach(function(t){var e=+t.dataset.e,l=e-MY.now();if(l<=0)any=true;else t.textContent=MY.hm(l);});if(any)render(el);},20000);}
MY.tab({id:'garage',n:L('Гараж','Garage'),ic:'🔧',o:20,title:L('Гараж Толика','Tolik’s garage'),sub:function(){var r=ALB.rusty().length;return r?r+' '+L('ржавых','rusty'):L('реставрация машин','car restoration');},render:render,
  dot:function(){return TOLIK.ready()>0||TOLIK.slots()>0&&TOLIK.free()>0&&ALB.rusty().some(function(c){var k=TOLIK.cost(c.id);return !TOLIK.job(c.id)&&MY.coins()>=k.c&&MY.prt.get()>=k.p;});}});
MY.homeLine({pri:20,f:function(){var r=TOLIK.ready();if(r){var j=S.albJ.filter(function(x){return MY.now()>=x.e;})[0];return {ic:'🔧',t:L('Толик закончил: ','Tolik is done: ')+ALB.nm(j.id)+' — '+L('забери','collect'),a:'garage'};}
  if(S.albJ.length){var e=Math.min.apply(null,S.albJ.map(function(x){return x.e;}));return {ic:'🔧',t:L('Толик чинит — ещё ','Tolik is fixing it — ')+MY.hm(e-MY.now()),a:'garage'};}
  var rs=ALB.rusty();if(rs.length&&TOLIK.slots())return {ic:'🔧',t:L('Ржавых машин: ','Rusty cars: ')+rs.length+' — '+L('отдай Толику','give them to Tolik'),a:'garage'};return null;}});
MY.prg2=function(){return {rs:ALB.rusty().length};};
})();
