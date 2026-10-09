/* Выезд со двора — АВТОАЛЬБОМ «Советский автопром»: 40 машин в 6 сериях (поток YARD, 10.10.2026). Журнал: vyezd-boost/logs/YARD.md; 04 §2.3.
   Редкость = трудность получения, не удача: обычная — регион (пройди его 10 дворов), редкая — заказы жильцов / тройка лиги / барахолка Толика,
   легенда — новый район карьеры. Как получить — написано на пустой клетке заранее. Сундуков со случайной машиной нет.
   12 машин старого гаража (MODELS, S.garage) — первые страницы альбома, уже готовые (покраска и «во дворы» — прежнее окно openCar).
   Новые 28 приходят РЖАВЫМИ; реставрирует Толик «Карбюратор» (js/garage-tolik.js) за монеты и детали 🔩 в 3 шага: кузов → мотор → покраска.
   Рисунки: справочник ART window.VYCARS (svg(id,{rust})) — если есть; иначе свои силуэты (сбоку) по типу кузова.
   Регионы: справочник LVL window.VYREG (машина региона r.car за двор-босс r.to); без него — по reg справочника (дворы 51–210).
   Сохранение: S.alb {id: 1 ржавая, 2 кузов готов, 3 мотор готов, 4 готова}, S.albN [новые, ещё не смотрел], S.albA [ждут окна «новая машина»],
   S.albL (машин за лигу выдано), S.albY {id:1} (новые машины, отправленные «во дворы»).
   Наружу: window.ALB: give(id,src), has(id), st(id), count(), N, CARS, byId(id), svg(id,o), rarName(r), yardCars(), open(id). */
(function(){
'use strict';
var MY=window.MY;if(!MY)return;
var esc=MY.esc,K=MY.svg.K;
var L=function(r,e){try{return LANG==='en'?e:r;}catch(x){return r;}};
var SER=[{id:'leg',n:'Легковушки',en:'Passenger cars',ic:'🚗'},{id:'trud',n:'Трудяги',en:'Workhorses',ic:'🚐'},{id:'bus',n:'Автобусы',en:'Buses',ic:'🚌'},
  {id:'spec',n:'Спецмашины',en:'Special vehicles',ic:'🚑'},{id:'stroy',n:'Стройка и село',en:'Building & farm',ic:'🚜'},{id:'lgnd',n:'Легенды',en:'Legends',ic:'⭐'}];
var RAR=[{n:'обычная',en:'common',c:'#8a96a3'},{n:'редкая',en:'rare',c:'#3d7bd9'},{n:'легенда',en:'legend',c:'#d9a521'}],RK={common:0,rare:1,legend:2};
// справочник машин — ART (js/art-cars.js, VYCARS.list: id, name, ser, rar, reg, len, col, mdl); здесь запасная копия на случай, если файла нет.
// id|имя|серия|редкость|регион 1–16|длина|цвет|номер старой модели
var FB='kopeyka|Копейка|leg|0|0|2|#c8372d|0,shesterka|Шестёрка|leg|0|0|2|#7d1d2e|-1,devyatka|Девятка|leg|0|0|2|#2f5f9e|1,moskvich|Москвич-412|leg|0|1|2|#d7c45a|-1,zapor|Запорожец|leg|0|0|2|#e07a9a|10,'+
 'gorbaty|Горбатый|leg|1|0|2|#7fb8a4|-1,oka|Ока|leg|0|12|2|#e8b64a|-1,niva|Нива|leg|0|0|2|#4f8a3c|2,volga|Волга|leg|0|0|2|#2b2f36|3,taxi|Такси|leg|0|0|2|#f2c230|4,'+
 'buhanka|Буханка|trud|0|0|3|#6f8f45|5,raf|РАФик|trud|0|2|3|#d9d2bf|-1,gazel|Газель|trud|0|0|3|#eef0f2|6,kabluk|Каблук|trud|1|14|2|#5b86b8|-1,gazon|Газон|trud|0|0|3|#4f7fa8|-1,'+
 'hleb|Хлебный|trud|1|0|3|#8a5a3b|-1,moloko|Молоковоз|trud|1|0|3|#3d6fb0|-1,paz|ПАЗик|bus|0|0|4|#e9b63c|8,laz|ЛАЗ|bus|1|0|4|#d2483a|-1,liaz|ЛиАЗ|bus|0|4|4|#e5c04a|-1,'+
 'ikarus|Икарус|bus|0|0|5|#ef7d3c|9,trolley|Троллейбус|bus|1|13|4|#3f7fc0|-1,skoraya|Скорая|spec|0|0|3|#f4f4ef|7,tabletka|Таблетка|spec|0|6|3|#e9e4d0|-1,bobik|Бобик|spec|0|0|2|#e8cf3c|-1,'+
 'pozhar|Пожарная|spec|1|0|4|#d32f2f|-1,polivalka|Поливалка|spec|1|0|3|#ef8a2c|-1,musorovoz|Мусоровоз|spec|0|3|3|#3f86c6|-1,morozh|Мороженое|spec|0|0|3|#8ee0e0|11,'+
 'samosval|Самосвал|stroy|0|11|3|#4a78b5|-1,kamaz|КамАЗ|stroy|0|9|4|#ef7f1a|-1,gaz66|Шишига|stroy|0|8|3|#5f6b3a|-1,kran|Автокран|stroy|1|15|4|#f0c020|-1,belarus|Беларус|stroy|1|10|2|#c8302b|-1,'+
 'trekol|Вездеход|stroy|1|5|3|#d8d2c0|-1,pobeda|Победа|lgnd|2|7|2|#5d6b52|-1,volga21|Волга с оленем|lgnd|2|0|2|#8fb7c9|-1,zim|ЗИМ|lgnd|2|0|3|#3a2a2a|-1,chaika|Чайка|lgnd|2|16|3|#1d1f24|-1,zil|ЗИЛ|lgnd|2|0|3|#15171b|-1';
var EN={kopeyka:'Kopeyka',shesterka:'Lada “Six”',devyatka:'Devyatka',moskvich:'Moskvich-412',zapor:'Zaporozhets',gorbaty:'“Humpback” Zaporozhets',oka:'Oka',niva:'Niva',volga:'Volga',taxi:'Taxi',
  buhanka:'Bukhanka',raf:'RAF minibus',gazel:'Gazelle',kabluk:'IZh “Heel” van',gazon:'GAZ-53 lorry',hleb:'Bread van',moloko:'Milk tanker',paz:'PAZik',laz:'LAZ bus',liaz:'LiAZ bus',ikarus:'Ikarus bendy bus',
  trolley:'Trolleybus',skoraya:'Ambulance',tabletka:'“Pill” UAZ ambulance',bobik:'UAZ “Bobik”',pozhar:'Fire engine',polivalka:'Street sprinkler',musorovoz:'Garbage truck',morozh:'Ice-cream van',
  samosval:'Dump truck',kamaz:'KamAZ',gaz66:'GAZ-66 “Shishiga”',kran:'Truck crane',belarus:'Belarus tractor',trekol:'Trekol ATV',pobeda:'Pobeda',volga21:'Volga with the deer',zim:'ZIM',chaika:'Chaika',zil:'Government ZIL'};
// подписи (про жильцов и двор)
var AB={kopeyka:['Классика двора','The yard classic'],shesterka:['Валерка учится на ней водить','Valerka is learning to drive in it'],devyatka:['Тонировка и музыка','Tinted windows, loud stereo'],
  moskvich:['Мечта каждого гаража','Every garage’s dream'],zapor:['Ушастый. Гостинец 7-го дня','Big ears. The day-7 gift'],gorbaty:['Деда Митяя — на рыбалку','Grandpa Mityai’s — off fishing'],
  oka:['Маленькая, да удаленькая','Tiny but brave'],niva:['Проедет везде','Goes anywhere'],volga:['Для начальства','Fit for the boss'],taxi:['Шашечки есть','Checkers on the roof'],
  buhanka:['Легенда бездорожья','The “loaf” van. Mud legend'],raf:['Из Риги с любовью','From Riga with love'],gazel:['Маршрутка №7','Minibus route 7'],kabluk:['Фургончик для дачи','A little van for the dacha'],
  gazon:['Толик возит на нём запчасти','Tolik hauls spare parts in it'],hleb:['Тёти Вали — батон к открытию','Aunt Valya’s — fresh loaf by opening'],moloko:['Бабе Шуре — молоко к завтраку','Milk for Granny Shura’s breakfast'],
  paz:['Школьный автобус','The school bus'],laz:['Межгород с окошками на крыше','Intercity, roof windows'],liaz:['Городской «скотовоз»','The packed city bus'],ikarus:['Гнётся на поворотах','Bends round corners'],
  trolley:['Рога на крыше','Horns on the roof'],skoraya:['Пропустите!','Make way!'],tabletka:['УАЗ-«таблетка» с крестом','The “pill” with a red cross'],bobik:['Брезентовый верх','Canvas roof'],
  pozhar:['Лестница и сирена','Ladder and siren'],polivalka:['Михалыча — радуга на асфальте','Mikhalych’s — rainbows on the asphalt'],musorovoz:['Будит двор по вторникам','Wakes the yard on Tuesdays'],
  morozh:['Пломбир всему двору!','Ice cream for the whole yard!'],samosval:['Песок для песочницы','Sand for the sandbox'],kamaz:['Чемпион ралли','Rally champion'],gaz66:['Вездеход с кунгом','All-terrain with a cabin'],
  kran:['Стрела на 14 метров','A 14-metre boom'],belarus:['Большие колёса сзади','Big rear wheels'],trekol:['Шины-пузыри, проедет болото','Bubble tyres, crosses swamps'],
  pobeda:['Горбатая красавица 1946-го','The 1946 beauty'],volga21:['С оленем на капоте','With a deer on the bonnet'],zim:['Шесть мест и бархат','Six seats and velvet'],chaika:['Для свадеб и парадов','For weddings and parades'],zil:['Самая длинная машина двора','The longest car in the yard']};
// ОТКУДА (решение YARD, редкость = трудность): регион — VYREG/reg; old — старый гараж; dist — новый район карьеры; ord — цепочка заказов жильца (CAR);
// lg — тройка в лиге соседей (по порядку); остальное — барахолка Толика (лот дня из недостающих редких, с Микрорайона)
var SRC={dist:{volga21:2,zim:4,zil:5},ord:{gorbaty:'mityai',shesterka:'valerka',gazon:'tolik',moloko:'shura',polivalka:'mihalych',hleb:'valya'},lg:['laz','pozhar','bobik']};
var ORD_ALIAS={zaz965:'gorbaty',vaz2108:'shesterka',izh:'gazon',m412:'moloko',poliv:'polivalka',hleb:'hleb'}; // старые имена из orders.js (CAR) → id альбома
var WHO={mityai:['деда Митяя','Grandpa Mityai'],valerka:['Валерки','Valerka'],tolik:['Толика','Tolik'],shura:['бабы Шуры','Granny Shura'],mihalych:['Михалыча','Mikhalych'],valya:['тёти Вали','Aunt Valya']};
var CARS=FB.split(',').map(function(r){var a=r.split('|');return {id:a[0],n:a[1],s:a[2],r:+a[3],reg:+a[4],len:+a[5],col:a[6],m:+a[7]};});
(function(){var V=window.VYCARS&&VYCARS.list;if(!Array.isArray(V)||V.length<10)return;var by={};CARS.forEach(function(c){by[c.id]=c;});
  CARS=V.map(function(v){var o=by[v.id]||{};return {id:v.id,n:v.name||o.n||v.id,full:v.full,en:v.en,fullEn:v.fullEn,s:v.ser||o.s,r:RK[v.rar]!=null?RK[v.rar]:(o.r|0),reg:v.reg|0,len:v.len||o.len||2,col:v.col||o.col,m:typeof v.mdl==='number'?v.mdl:(o.m==null?-1:o.m)};});})();
CARS.forEach(function(c){c.en=c.en||EN[c.id]||c.n;c.a=(AB[c.id]||['',''])[0];
  c.src=c.m>=0?'old':c.reg?'reg':SRC.dist[c.id]!=null?'dist':SRC.ord[c.id]?'ord':SRC.lg.indexOf(c.id)>=0?'lg':'bar';
  if(c.src==='dist')c.d=SRC.dist[c.id];if(c.src==='ord')c.who=SRC.ord[c.id];if(c.src==='lg')c.k=SRC.lg.indexOf(c.id);});
var N=CARS.length,BY={};CARS.forEach(function(c,i){c.i=i;BY[c.id]=c;});
var ORD_FB=[7,14,21,28,35,42]; // заказы жильцов до модуля CAR (ORD): игровых дней

/* ---------- справочник ART: рисунки ---------- */
function vy(id){try{return window.VYCARS&&VYCARS.get?VYCARS.get(id):null;}catch(e){return null;}}
function canon(id){var v=vy(id);return v&&v.id?v.id:id;}
function nm(c){return L(c.n,c.en);}
function ab(c){var x=AB[c.id];return x?L(x[0],x[1]):'';}

/* ---------- сохранение ---------- */
MY.fix(function(){if(!MY.isO(S.alb))S.alb={};for(var k in S.alb){var v=S.alb[k];if(!BY[k]||typeof v!=='number'||!(v>=1))delete S.alb[k];else S.alb[k]=Math.min(4,Math.floor(v));}
  ['albN','albA'].forEach(function(f){if(!Array.isArray(S[f]))S[f]=[];S[f]=S[f].filter(function(x){return typeof x==='string'&&BY[x];});});
  MY.fNum('albL');if(!MY.isO(S.albY))S.albY={};});
MY.merge(function(loc,d){MY.mObjMax(d,'alb');['albN','albA'].forEach(function(f){if(Array.isArray(d[f]))d[f].forEach(function(x){if(typeof x==='string'&&S[f].indexOf(x)<0&&!(S.alb[x]>=4&&f==='albA'))S[f].push(x);});});
  MY.mMax(d,'albL');MY.mObjMax(d,'albY');});

/* ---------- состояние машины: 0 — нет, 1 ржавая, 2 кузов, 3 мотор, 4 готова ---------- */
function st(id){var c=BY[id];if(!c)return 0;if(c.src==='old'){try{return S.garage.indexOf(c.m)>=0?4:0;}catch(e){return 0;}}return S.alb[id]|0;}
var ALB=window.ALB={CARS:CARS,N:N,SER:SER,RAR:RAR,byId:function(id){return BY[id]||null;},st:st,has:function(id){return st(id)>0;},nm:function(id){return BY[id]?nm(BY[id]):id;},ab:function(id){return BY[id]?ab(BY[id]):'';}};
ALB.count=function(){var n=0;CARS.forEach(function(c){if(st(c.id)>=4)n++;});return n;};      // готовых (в альбоме)
ALB.got=function(){var n=0;CARS.forEach(function(c){if(st(c.id)>0)n++;});return n;};          // получено, в т. ч. ржавые
ALB.rusty=function(){return CARS.filter(function(c){var s=st(c.id);return s>0&&s<4;});};
ALB.rarName=function(r){return L(RAR[r].n,RAR[r].en);};
// выдача машины: ржавой (кроме старых). src — откуда (reg, dist, ord, lg, bar, mg, gift…). Старые имена — через псевдонимы VYCARS/CAR
ALB.give=function(id,src,quiet){if(src==='ord'&&ORD_ALIAS[id])id=ORD_ALIAS[id];id=BY[id]?id:canon(id);var c=BY[id];if(!c||st(id)>0)return false;
  if(c.src==='old'){try{if(S.garage.indexOf(c.m)<0)S.garage.push(c.m);}catch(e){}}else S.alb[id]=1;
  if(S.albN.indexOf(id)<0)S.albN.push(id);if(!quiet&&S.albA.indexOf(id)<0)S.albA.push(id);
  MY.save();MY.ev('car',{id:id,k:src||c.src,r:c.r,n:ALB.got()});MY.fire('car',{id:id,src:src});
  if(!quiet)setTimeout(ALB.announce,60);return true;};
// как получить — для пустой клетки
var ORD_ON=function(){return !!window.ORD;};
ALB.how=function(c){if(c.src==='old'){var at=null;try{at=CAR_AT[c.m];}catch(e){}return at?L('за двор '+at,'for yard '+at):L('гостинец бабы Шуры на 7-й день','Granny Shura’s day-7 gift');}
  if(c.src==='reg'){var r=regOf(c.id);return r?L('пройди регион «'+r.n+'» (двор '+r.to+')','clear the region “'+r.n+'” (yard '+r.to+')'):L('пройди новый регион','clear a new region');}
  if(c.src==='dist')return L('дойди до района «'+MY.DIST[c.d]+'» в карьере','reach the “'+MY.distName(c.d)+'” district in your career');
  if(c.src==='ord'){var w=WHO[c.who]||['жильца','a resident'];return ORD_ON()?L('6 заказов '+w[0],'6 orders for '+w[1]):L('заказы '+w[0]+' — играй '+ordDays(c)+' '+MY.pl(ordDays(c),'день','дня','дней')+' (уже '+MY.num(S.myDn)+')','orders for '+w[1]+' — play on '+ordDays(c)+' days (so far '+MY.num(S.myDn)+')');}
  if(c.src==='lg')return L((c.k+1)+'-я тройка в лиге соседей','top-3 finish #'+(c.k+1)+' in the neighbours’ league');
  if(c.src==='bar')return L('барахолка Толика (с района «Микрорайон»)','Tolik’s flea market (from the “Estate” district)');
  return '';};
function ordDays(c){var k=Object.keys(SRC.ord).indexOf(c.id);return ORD_FB[Math.max(0,k)];}
// регионы: VYREG (LVL: 16 регионов, дворы 51–210, машина за босса — двор to); без LVL — те же номера по reg из справочника
function regs(){var out=[];try{var V=window.VYREG;if(Array.isArray(V)&&V.length)V.forEach(function(r,i){if(!r||!r.car)return;
    out.push({n:LANG==='en'&&r.en?r.en:(r.name||('Регион '+(i+1))),to:r.to||r.boss||(r.from+9),car:canon(r.car)});});}catch(e){}
  if(out.length)return out;
  return CARS.filter(function(c){return c.src==='reg';}).sort(function(a,b){return a.reg-b.reg;}).map(function(c){var to=50+c.reg*10;return {n:L('дворы ','yards ')+(to-9)+'–'+to,to:to,car:c.id};});}
function regOf(id){var R=regs();for(var i=0;i<R.length;i++)if(R[i].car===id)return R[i];return null;}
// проверка источников: регионы, районы, заказы (CAR отдаёт сам; без него — по дням игры) — после двора, при входе, после слияния облака
ALB.sync=function(quiet){var done=Math.max(0,(S.unlocked||1)-1),d=MY.dist(),got=[];
  regs().forEach(function(r){if(r.car&&BY[r.car]&&BY[r.car].src==='reg'&&done>=r.to&&!st(r.car)&&ALB.give(r.car,'reg',true))got.push(r.car);});
  CARS.forEach(function(c){if(c.src==='dist'&&d>=c.d&&!st(c.id)&&ALB.give(c.id,'dist',true))got.push(c.id);
    if(c.src==='ord'&&!ORD_ON()&&MY.num(S.myDn)>=ordDays(c)&&!st(c.id)&&ALB.give(c.id,'ord',true))got.push(c.id);});
  try{if(window.ORD&&ORD.takeCars)ORD.takeCars().forEach(function(id){var x=ORD_ALIAS[id]||canon(id);if(ALB.give(x,'ord',true))got.push(x);});}catch(e){}
  if(got.length&&!quiet){got.forEach(function(id){if(S.albA.indexOf(id)<0)S.albA.push(id);});MY.save();setTimeout(ALB.announce,60);}
  return got;};
// лига: 1–3 место → следующая машина «за лигу» (первые 3 раза)
ALB.league=function(){var c=CARS.filter(function(x){return x.src==='lg'&&!st(x.id);}).sort(function(a,b){return a.k-b.k;})[0];if(!c)return null;S.albL=MY.num(S.albL)+1;ALB.give(c.id,'lg',true);return c.id;};
// барахолка Толика: лот дня — одна недостающая редкая машина (кроме легенд) за монеты; с района «Микрорайон»
ALB.barLot=function(){if(MY.dist()<2)return null;var miss=CARS.filter(function(c){return !st(c.id)&&(c.src==='lg'||c.src==='bar');});if(!miss.length)return null;
  var c=miss[MY.dayNo()%miss.length];return {id:c.id,pr:c.src==='bar'?1500:2500};};
/* ---------- окно «новая машина» (не во дворе и не поверх окна) ---------- */
ALB.announce=function(){if(!S.albA.length)return false;try{if(G||modalOn)return false;}catch(e){}
  if(S.albA.length>2){var ids=S.albA.slice();S.albA=[];MY.save();
    var hm='<h2>'+L('Толик пригнал машины!','Tolik brought cars!')+'</h2>'+(window.TOLIK?TOLIK.say(L('Пока тебя не было, я по округе поездил. Вот, '+ids.length+' '+MY.pl(ids.length,'машина','машины','машин')+' за твои дворы — ржавые, но наши.','While you were away I drove round the area. Here are '+ids.length+' cars for your yards — rusty, but ours.')):'')+
      '<div class="albmany">'+ids.slice(0,9).map(function(x){return '<span>'+ALB.svg(x,{rust:st(x)<4})+'<small>'+esc(nm(BY[x]))+'</small></span>';}).join('')+'</div>'+(ids.length>9?'<p>'+L('и ещё ','and ')+(ids.length-9)+L('…',' more…')+'</p>':'');
    try{modal(hm+'<div class="row"><button class="btn green" id="albGo">📒 '+L('В альбом','To the album')+'</button><button class="btn" id="mCancel">'+L('Потом','Later')+'</button></div>');}catch(e){return false;}
    try{SND.win();}catch(e){}MY.Q('mCancel').onclick=function(){hideModal();};MY.Q('albGo').onclick=function(){hideModal();MY.open('album');};return true;}
  var id=S.albA[0],c=BY[id];S.albA.shift();MY.save();if(!c)return false;var rusty=st(id)<4;
  var h='<h2>'+(c.r===2?'⭐ '+L('Легенда в альбоме!','A legend for the album!'):L('Новая машина!','A new car!'))+'</h2><div class="albbig'+(rusty?' rust':'')+'">'+ALB.svg(id,{rust:rusty,big:1})+'</div>'+
    '<p><b>'+esc(nm(c))+'</b> · <span class="albrar r'+c.r+'">'+ALB.rarName(c.r)+'</span></p>'+
    (rusty?(window.TOLIK?TOLIK.say(L('Ржавая, конечно… Но мотор живой. Загоняй ко мне в гараж — переберу по-соседски.','Rusty, of course… but the engine’s alive. Bring her to my garage — I’ll fix her up, neighbour.')):'<p>'+L('Машина ржавая — её починит Толик «Карбюратор».','The car is rusty — Tolik “Carburettor” will fix it.')+'</p>'):'<p>'+esc(ab(c))+'</p>');
  try{modal(h+'<div class="row">'+(rusty?'<button class="btn green" id="albGo">🔧 '+L('К Толику в гараж','To Tolik’s garage')+'</button>':'')+'<button class="btn" id="mCancel">'+L('Потом','Later')+'</button></div>');}catch(e){return false;}
  try{SND.win();}catch(e){}try{if(!MY.calm()&&typeof confetti==='function'&&c.r)confetti();}catch(e){}
  MY.Q('mCancel').onclick=function(){hideModal();setTimeout(ALB.announce,300);};
  if(MY.Q('albGo'))MY.Q('albGo').onclick=function(){hideModal();MY.open('garage');};
  return true;};

/* ---------- рисунок машины ---------- */
// свой силуэт сбоку (viewBox 0 0 120 60): кузов по типу f, родной цвет, ржавчина
function shade(hex,p){var n=parseInt(String(hex).replace('#',''),16);if(isNaN(n))return hex;var r=n>>16,g=n>>8&255,b=n&255,t=p<0?0:255,q=Math.abs(p);
  return 'rgb('+Math.round((t-r)*q+r)+','+Math.round((t-g)*q+g)+','+Math.round((t-b)*q+b)+')';}
function rustCol(hex){var n=parseInt(String(hex).replace('#',''),16);if(isNaN(n))return '#a0673a';var r=n>>16,g=n>>8&255,b=n&255,m=.4;
  return 'rgb('+Math.round(r*(1-m)+150*m)+','+Math.round(g*(1-m)+95*m)+','+Math.round(b*(1-m)+60*m)+')';}
var SH={ // кузов: путь, стёкла, колёса [x...], длина
  sedan:['M10 40 v-10 q2 -4 8 -5 l14 -2 l10 -10 h34 l12 10 l18 3 q6 1 7 6 v8 z',['M45 23 l7 -8 h14 v8 z','M70 23 v-8 h12 l9 8 z'],[28,92]],
  hatch:['M10 40 v-10 q2 -4 8 -5 l14 -2 l12 -11 h34 l16 11 l10 2 q5 1 6 6 v9 z',['M47 22 l9 -8 h12 v8 z','M72 22 v-8 h12 l11 8 z'],[28,92]],
  small:['M14 40 v-9 q2 -6 10 -7 l12 -10 h30 l14 11 l12 2 q5 2 6 6 v7 z',['M40 23 l7 -7 h12 v7 z','M63 23 v-7 h10 l9 7 z'],[32,86]],
  suv:['M12 40 v-14 q2 -4 6 -4 l12 -12 h44 l8 12 h20 q6 0 7 6 v12 z',['M34 22 l9 -10 h14 v10 z','M61 22 v-10 h12 l7 10 z'],[30,90]],
  van:['M8 40 v-26 q0 -6 6 -6 h70 l14 14 h10 q6 0 6 6 v12 z',['M16 22 v-9 h18 v9 z','M40 22 v-9 h18 v9 z','M64 22 v-9 h16 l10 9 z'],[26,94]],
  pickup:['M8 40 v-18 h44 v-12 h28 l14 13 h12 q6 0 6 6 v11 z',['M58 22 v-9 h18 l10 9 z'],[26,94]],
  bus:['M4 40 v-30 q0 -5 5 -5 h98 q8 0 9 8 v27 z',['M10 20 v-10 h16 v10 z','M30 20 v-10 h16 v10 z','M50 20 v-10 h16 v10 z','M70 20 v-10 h16 v10 z','M90 20 v-10 h16 q4 0 4 4 v6 z'],[22,96]],
  long:['M2 40 v-30 q0 -5 5 -5 h104 q8 0 9 8 v27 z',['M8 20 v-10 h14 v10 z','M26 20 v-10 h14 v10 z','M48 20 v-10 h14 v10 z','M66 20 v-10 h14 v10 z','M88 20 v-10 h16 q4 0 4 4 v6 z'],[16,60,100]],
  truck:['M6 40 v-22 h66 v22 z M74 40 v-26 q0 -4 4 -4 h18 l12 12 q4 2 4 6 v12 z',['M80 22 v-8 h14 l8 8 z'],[22,46,96]],
  truckvan:['M6 40 v-30 h66 v30 z M74 40 v-24 q0 -4 4 -4 h18 l12 12 q4 2 4 6 v10 z',['M80 24 v-8 h14 l8 8 z'],[22,46,96]],
  dump:['M6 32 l6 -18 h58 l2 18 z M74 40 v-26 q0 -4 4 -4 h18 l12 12 q4 2 4 6 v12 z M6 40 v-8 h68 v8 z',['M80 22 v-8 h14 l8 8 z'],[22,46,96]],
  tank:['M6 40 v-8 h68 v8 z M10 32 q0 -18 30 -18 q30 0 30 18 z M74 40 v-26 q0 -4 4 -4 h18 l12 12 q4 2 4 6 v12 z',['M80 22 v-8 h14 l8 8 z'],[22,46,96]],
  tractor:['M30 40 v-14 h40 v-16 h22 v30 z M70 26 l-6 -14',['M74 24 v-10 h14 v10 z'],[[40,9],[86,15]]],
  crane:['M6 40 v-10 h68 v10 z M74 40 v-26 q0 -4 4 -4 h18 l12 12 q4 2 4 6 v12 z M30 30 l40 -26 l4 4 l-38 24 z',['M80 22 v-8 h14 l8 8 z'],[22,46,96]],
  pobeda:['M8 40 v-8 q0 -6 8 -8 l16 -4 q10 -14 30 -14 q22 0 30 14 l12 4 q8 2 8 8 v8 z',['M40 22 q6 -10 20 -10 v10 z','M64 22 v-10 q14 0 20 10 z'],[28,92]],
  limo:['M4 40 v-10 q2 -4 8 -5 l14 -2 l10 -10 h48 l10 10 l16 3 q6 1 8 6 v8 z',['M40 23 l7 -8 h14 v8 z','M64 23 v-8 h16 v8 z','M83 23 v-8 h1 l8 8 z'],[24,98]]};
function ownSvg(c,o){var f=SH[c.f]||SH.sedan,rust=o&&o.rust,col=rust?rustCol(c.col):c.col,dk=shade(col,-.28),s='';
  s+='<ellipse cx="60" cy="44" rx="54" ry="4" fill="rgba(0,0,0,.14)"/>';
  s+='<path d="'+f[0]+'" fill="'+col+'" stroke="'+K+'" stroke-width="2" stroke-linejoin="round"/>';
  s+='<path d="M10 33 h100" stroke="'+dk+'" stroke-width="2" opacity=".5"/>';
  f[1].forEach(function(w){s+='<path d="'+w+'" fill="'+(rust?'#8a9aa3':'#bfe3f2')+'" stroke="'+K+'" stroke-width="1.4" stroke-linejoin="round"/>';});
  if(c.id==='taxi')s+='<rect x="54" y="7" width="12" height="5" fill="#fff" stroke="'+K+'" stroke-width="1"/>';
  if(c.id==='amb'||c.id==='uaz'||c.id==='fire')s+='<rect x="'+(c.id==='amb'?52:56)+'" y="'+(c.id==='amb'?4:9)+'" width="8" height="4" rx="1" fill="'+(c.id==='uaz'?'#3f8fe0':'#e5484d')+'" stroke="'+K+'" stroke-width="1"/>';
  if(c.id==='amb')s+='<path d="M30 30 h20 M40 25 v10" stroke="#e5484d" stroke-width="3"/>';
  if(c.id==='fire')s+='<path d="M10 14 h58 M14 10 v8 M24 10 v8 M34 10 v8 M44 10 v8 M54 10 v8" stroke="#ddd" stroke-width="2"/>';
  if(c.id==='kvas')s+='<text x="40" y="30" font-family="Rubik,Arial" font-weight="800" font-size="9" fill="#8a4a1a" text-anchor="middle">КВАС</text>';
  if(c.id==='hleb')s+='<text x="39" y="29" font-family="Rubik,Arial" font-weight="800" font-size="9" fill="#fff" text-anchor="middle">ХЛЕБ</text>';
  if(c.id==='ice')s+='<text x="44" y="32" font-family="Rubik,Arial" font-weight="800" font-size="8" fill="#e5484d" text-anchor="middle">МОРОЖЕНОЕ</text>';
  if(c.id==='eraz')s+='<text x="44" y="33" font-family="Rubik,Arial" font-weight="800" font-size="8" fill="#2f6fd0" text-anchor="middle">ПОЧТА</text>';
  // фары и бампер
  s+='<circle cx="111" cy="31" r="2.6" fill="#fff6c8" stroke="'+K+'" stroke-width="1"/><rect x="104" y="37" width="10" height="3" rx="1" fill="#d6dae0" stroke="'+K+'" stroke-width="1"/>';
  (f[2]||[]).forEach(function(w){var x=Array.isArray(w)?w[0]:w,r=Array.isArray(w)?w[1]:8;s+='<circle cx="'+x+'" cy="'+(48-r)+'" r="'+r+'" fill="#2b2733" stroke="'+K+'" stroke-width="1.4"/><circle cx="'+x+'" cy="'+(48-r)+'" r="'+(r*.42)+'" fill="'+(rust?'#8a6a4a':'#c3ced9')+'"/>';});
  if(rust){[[24,30,5],[52,34,4],[86,28,6],[70,36,3],[40,22,3]].forEach(function(p){s+='<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="'+p[2]+'" ry="'+(p[2]*.7)+'" fill="#7a3f1e" opacity=".75"/>';});
    s+='<path d="M16 38 l3 -3 l3 3 M96 38 l3 -4 l3 4" stroke="#5a2e14" stroke-width="1.4" fill="none"/>';}
  return '<svg viewBox="0 4 120 46" class="albsvg" aria-hidden="true">'+s+'</svg>';}
ALB.svg=function(id,o){var c=BY[id];if(!c)return '';o=o||{};
  if(window.VYCARS&&VYCARS.svg&&vy(id)){try{var col=o.color||null;if(!col&&c.src==='old'&&!o.rust)try{if(S.paint[c.m])col=carColor(c.m);}catch(e){}var r=VYCARS.svg(id,{view:'side',state:o.rust?'rust':o.shine?'shine':'new',ghost:!!o.ghost,color:col,cls:'albsvg'});if(r)return String(r);}catch(e){MY.err('svg',e);}}
  if(o.side)return ownSvg(c,o);
  // по умолчанию — тем же рисунком, что машины в игре (drawVehicle сверху), на холсте; рисует ALB.paint (сам, по появлению холста)
  return '<canvas class="albcv'+(o.big?' big':'')+'" data-car="'+id+'"'+(o.rust?' data-rust="1"':'')+'></canvas>';};
var LEN={sedan:2,hatch:2,small:2,suv:2,pickup:2,pobeda:2,van:3,truckvan:3,tank:3,dump:3,truck:3,crane:3,tractor:2,limo:3,bus:4,long:5};
function pseudo(c){if(c.src==='old'){try{return MODELS[c.m];}catch(e){}}return {name:c.n,len:c.len||2,color:c.col,kind:''};}
function paintOne(cv){if(!cv||cv.dataset.done)return;var c=BY[cv.dataset.car];if(!c)return;var r=cv.getBoundingClientRect();if(!r.width)return;cv.dataset.done=1;
  var rust=!!cv.dataset.rust,m=pseudo(c),col=c.src==='old'&&!rust?(function(){try{return typeof carColor==='function'?carColor(c.m):m.color;}catch(e){return m.color;}})():rust?rustCol(c.col):c.col;
  try{drawModel(cv,m,col);}catch(e){MY.err('draw',e);return;}
  if(!rust)return;try{var g=cv.getContext('2d'),W=r.width,H=r.height;g.save();g.globalCompositeOperation='source-atop';g.fillStyle='rgba(150,95,50,.14)';g.fillRect(0,0,W,H);
    var R=0;for(var i=0;i<c.id.length;i++)R=(R*31+c.id.charCodeAt(i))>>>0;var rnd=function(){R=(R*1103515245+12345)>>>0;return (R>>>8)/16777216;};
    for(var k=0;k<9;k++){g.fillStyle=k%3?'rgba(110,52,20,.7)':'rgba(70,35,15,.6)';g.beginPath();g.ellipse(W*(.2+rnd()*.6),H*(.25+rnd()*.5),W*(.02+rnd()*.035),H*(.04+rnd()*.06),rnd()*3,0,7);g.fill();}
    g.restore();}catch(e){}}
ALB.paint=function(root){(root||document).querySelectorAll('canvas.albcv[data-car]:not([data-done])').forEach(paintOne);};
// сам рисует новые холсты (окна, вкладки, чужие модули)
(function(){var t=0;function go(){t=0;ALB.paint();}
  try{new MutationObserver(function(ms){for(var i=0;i<ms.length;i++)if(ms[i].addedNodes.length){if(!t)t=requestAnimationFrame(go);return;}}).observe(document.body,{childList:true,subtree:true});}catch(e){}})();
// для стоянки «Моего двора»: готовые машины игрока сверху (простые)
MY.parkCars=function(n,y){var ids=CARS.filter(function(c){return st(c.id)>=4;}).map(function(c){return c.id;});if(!ids.length)return [];
  var out=[],off=(y||0)*3;for(var i=0;i<n;i++){var c=BY[ids[(i+off)%ids.length]];if(!c||(i>=ids.length))break;var col=c.src==='old'?(function(){try{return typeof carColor==='function'?carColor(c.m):c.col;}catch(e){return c.col;}})():c.col,dk=shade(col,-.3);
    out.push('<rect x="-12" y="-17" width="24" height="36" rx="7" fill="'+col+'" stroke="'+K+'" stroke-width="1.6"/><rect x="-9" y="-11" width="18" height="8" rx="2" fill="#2f4a63"/><rect x="-9" y="7" width="18" height="6" rx="2" fill="#2f4a63"/><rect x="-8" y="-2" width="16" height="8" rx="2" fill="'+dk+'"/>'+
      '<circle cx="-7" cy="-16" r="2" fill="#fff6c8"/><circle cx="7" cy="-16" r="2" fill="#fff6c8"/>');}
  return out;};
// новые готовые машины «во дворы» (для LVL/ART: какие показывать в уровнях)
ALB.yardCars=function(){return CARS.filter(function(c){return c.src!=='old'&&st(c.id)>=4&&S.albY[c.id];}).map(function(c){return c.id;});};

/* ---------- вкладка «Альбом» ---------- */
var flt='all';
function card(c){var s=st(c.id),own=s>=4,rusty=s>0&&s<4,job=window.TOLIK&&TOLIK.job(c.id),isNew=S.albN.indexOf(c.id)>=0;
  var pic='<span class="albpic'+(s?'':' ghost')+'">'+ALB.svg(c.id,{rust:rusty})+'</span>';
  var sub=own?(c.src==='old'?L('в гараже','in the garage'):(S.albY[c.id]?L('🏠 во дворах','🏠 in the yards'):L('готова','restored'))):rusty?(job?(job.done?L('✓ Толик закончил шаг','✓ Tolik finished a step'):'🔧 '+MY.hm(job.e-MY.now())):L('ржавая · шаг ','rusty · step ')+s+'/3'):esc(ALB.how(c));
  return '<button class="albc r'+c.r+(own?' own':rusty?' rusty':' lock')+(isNew?' new':'')+'" data-id="'+c.id+'"><i class="albrs"></i>'+pic+'<b>'+(s?'':'🔒 ')+esc(nm(c))+'</b><small>'+sub+'</small>'+(isNew?'<em class="albnew">'+L('новая','new')+'</em>':'')+'</button>';}
function render(el){ALB.sync(true);var n=ALB.count(),g=ALB.got(),h='';
  h+='<div class="albhead"><div class="albbar"><i style="width:'+Math.round(n/N*100)+'%"></i></div><span><b>'+n+'</b> '+L('из','of')+' '+N+' '+L('готовы','restored')+(g>n?' · '+(g-n)+' '+L('ржавых ждут Толика','rusty cars wait for Tolik'):'')+'</span></div>';
  h+='<div class="albflt" role="tablist">'+[['all',L('Все','All')],['own',L('Мои','Mine')],['rust',L('Ржавые','Rusty')],['lock',L('Нет','Missing')]].map(function(f){return '<button class="'+(flt===f[0]?'on':'')+'" data-f="'+f[0]+'">'+f[1]+'</button>';}).join('')+'</div>';
  SER.forEach(function(se){var list=CARS.filter(function(c){if(c.s!==se.id)return false;var s=st(c.id);return flt==='all'||flt==='own'&&s>=4||flt==='rust'&&s>0&&s<4||flt==='lock'&&!s;});if(!list.length)return;
    var have=CARS.filter(function(c){return c.s===se.id&&st(c.id)>=4;}).length,tot=CARS.filter(function(c){return c.s===se.id;}).length;
    h+='<h3 class="albser">'+se.ic+' '+L(se.n,se.en)+' <small>'+have+'/'+tot+'</small></h3><div class="albgrid">'+list.map(card).join('')+'</div>';});
  if(flt!=='all'&&!el.querySelector)h+='';
  h+='<p class="mynote">'+L('Редкость — это трудность, а не удача: обычные машины дают регионы, редкие — заказы жильцов, лига и барахолка Толика, легенды — новые районы. Машины приходят ржавыми, Толик чинит их за монеты и детали 🔩.','Rarity means effort, not luck: regions give common cars; resident orders, the league and Tolik’s flea market give rare ones; new districts give legends. Cars arrive rusty — Tolik restores them for coins and parts 🔩.')+'</p>';
  el.innerHTML=h;
  el.querySelectorAll('[data-f]').forEach(function(b){b.onclick=function(){MY.snd('tap');flt=b.dataset.f;render(el);};});
  el.querySelectorAll('.albc').forEach(function(b){b.onclick=function(){MY.snd('tap');info(b.dataset.id);};});
  // «новые» отмечены просмотренными после показа
  if(S.albN.length){setTimeout(function(){S.albN=[];MY.save();},1500);}}
function info(id){var c=BY[id];if(!c)return;var s=st(id),own=s>=4,rusty=s>0&&s<4;
  if(own&&c.src==='old'){try{openCar(c.m);return;}catch(e){}}
  var h='<h2>'+esc(nm(c))+'</h2><div class="albbig'+(rusty?' rust':'')+(s?'':' ghost')+'">'+ALB.svg(id,{rust:rusty||!s,big:1})+'</div>'+
    '<p><span class="albrar r'+c.r+'">'+ALB.rarName(c.r)+'</span> · '+L(SER.filter(function(x){return x.id===c.s;})[0].n,SER.filter(function(x){return x.id===c.s;})[0].en)+'</p><p>'+esc(ab(c))+'</p>';
  var row='';
  if(!s)h+='<p class="goal">🔒 '+L('Как получить: ','How to get it: ')+esc(ALB.how(c))+'</p>';
  else if(rusty){h+='<div class="albsteps">'+[L('Кузов','Body'),L('Мотор','Engine'),L('Покраска','Paint')].map(function(t,k){return '<span class="'+(k<s-1?'on':k===s-1?'nx':'')+'">'+(k<s-1?'✓ ':'')+t+'</span>';}).join('')+'</div>';
    row='<button class="btn green" id="albGo">🔧 '+L('К Толику','To Tolik')+'</button>';}
  else{var inY=!!S.albY[id];h+='<p>'+(inY?L('Стоит во дворах-головоломках.','Parked in the puzzle yards.'):L('Готова! Можно поставить её во дворы — будет стоять у подъезда.','Restored! You can park it in the yards.'))+'</p>';
    row='<button class="btn '+(inY?'':'green')+'" id="albY">'+(inY?L('Убрать из дворов','Take out of the yards'):'🏠 '+L('Во дворы','To the yards'))+'</button>';}
  try{modal(h+'<div class="row">'+row+'<button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div>');}catch(e){return;}
  MY.Q('mCancel').onclick=function(){hideModal();};
  if(MY.Q('albGo'))MY.Q('albGo').onclick=function(){hideModal();MY.open('garage');};
  if(MY.Q('albY'))MY.Q('albY').onclick=function(){if(S.albY[id])delete S.albY[id];else S.albY[id]=1;MY.save();hideModal();MY.fire('yardcars');MY.toast(S.albY[id]?'🏠 '+nm(c)+L(' — теперь во дворах!',' — now in the yards!'):L('Убрали из дворов','Taken out of the yards'));MY.render();};}
ALB.open=function(id){MY.open('album');if(id)setTimeout(function(){info(id);},50);};
MY.tab({id:'album',n:L('Альбом','Album'),ic:'📒',o:10,title:L('Автоальбом','Car album'),sub:function(){return ALB.count()+' '+L('из','of')+' '+N+' '+L('машин','cars');},render:render,dot:function(){return S.albN.length>0;}});
MY.homeLine({pri:40,f:function(){var a=S.albN.length;return a?{ic:'📒',t:L('Новая машина в альбоме','A new car in the album')+(a>1?' (+'+a+')':''),a:'album'}:null;}});
// после двора и на старте — проверить источники
MY.onYard(function(){setTimeout(function(){ALB.sync(false);},0);});
MY.on('start',function(){ALB.sync(false);});
MY.on('merge',function(){ALB.sync(false);});
// окно «новая машина» — когда игрок на карте (обёртка openMap — после гнёзд/запасного входа)
MY.on('start',function(){var om=window.openMap;if(typeof om==='function')window.openMap=function(){var r=om.apply(this,arguments);try{if(S.albA.length)setTimeout(ALB.announce,700);}catch(e){}return r;};
  setTimeout(function(){try{if(S.albA.length&&!G)ALB.announce();}catch(e){}},1500);});
MY.prgAl=function(){return ALB.count();};
})();
