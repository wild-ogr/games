/* Заказы жильцов — поручения в окнах пятиэтажки (поток CAR буста «Наш двор», 10.10.2026; замысел — 04-meta-economy.md §2.5).
   Журнал hobby-analytics/release-i/vyezd-boost/logs/CAR.md. Грузится ПОСЛЕ основного скрипта, js/career.js и js/today.js. Наружу — window.ORD.
   Поле сохранения — S.ord = {c: № цепочки, s: шаг в цепочке, t: {d, r, s, p, ok} — заказ дня, n: всего выполнено, g: [цепочки, за которые машина уже дана]}.
   - Один заказ в день (с CFG.ordFrom-го пройденного двора). Заказ — следующий шаг цепочки жильца; цепочка = 6 заказов → редкая машина в Автоальбом
     (YARD.giveCar(id, 'ord') — машину выдаёт YARD; нет YARD — машина ждёт в S.ord.cw). Все цепочки пройдены — «соседские просьбы» без конца.
   - Награда за заказ: CFG.order.c 💰 + CFG.order.p 🔩 + очки карьеры CFG.pts.order; заказ — одно из пяти дел «Сегодня во дворе».
   - Проверка — по итогу двора (yardHook) и состоянию двора G в момент победы (аварии, подсказки, скорая, полиция, ходы, босс).
   Жильцы — только общие персонажи (реестр ~/Brain/hobby/characters.md); облик — ART (VYPPL.svg через CAR.face).
   Вставка: homeSlots zone 'win' — окно пятиэтажки с жильцом и его просьбой (id 'w-<жилец>', поверх заглушки UX), winSlots — «заказ выполнен» + благодарность. */
(function(){
'use strict';
function C(){return CAR.CFG;}
function tr(ru,en){try{return L(ru,en);}catch(e){return ru;}}
function T(x){return Array.isArray(x)?tr(x[0],x[1]):x;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function dk(){try{return dayKey(0);}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function num(x){return typeof x==='number'&&isFinite(x)&&x>=0?x:0;}
function ct(n){try{return coinsTxt(n);}catch(e){return n+' 💰';}}
function open0(){try{return (S.levelsDone||0)>=C().ordFrom;}catch(e){return false;}}

/* ---------- виды заказов: k — что проверять, n — сколько раз ---------- */
// win — пройти двор · new — новый двор · clean — без аварий · s3 — на ★★★ · nh — без подсказок и эвакуатора · amb — скорая вовремя
// pol — двор с полицией · tg — не больше 2 лишних ходов · boss — двор-босс 🔥 · daily — двор дня
var K={win:1,new:1,clean:1,s3:1,nh:1,amb:1,pol:1,tg:1,boss:1,daily:1};
/* ---------- жильцы и их цепочки (6 заказов → машина) ---------- */
var CHAINS=[
 {r:'mityai',n:'Дед Митяй',en:'Grandpa Mityai',ic:'🎣',car:'gorbaty',carN:['«Горбатый» Запорожец','“Humpback” Zaporozhets'],fl:4,
  o:[{k:'win',n:2,t:['Внучок, на рыбалку собираюсь — пройди пару дворов, мне Запорожец не выгнать.','Off fishing, lad — clear a couple of yards, I can’t get my Zaporozhets out.']},
     {k:'clean',n:1,t:['Не гони — рыба шума не любит. Пройди двор без аварий.','Easy now — fish hate noise. Clear a yard with no crashes.']},
     {k:'amb',n:1,t:['Соседу плохо стало, скорая стоит запертая. Выпусти её вовремя!','A neighbour’s unwell and the ambulance is stuck. Get it out in time!']},
     {k:'s3',n:1,t:['Удочки уложил — теперь чтоб красиво: двор на ★★★.','Rods are packed — now do it nicely: a ★★★ yard.']},
     {k:'win',n:3,t:['Пока снасти собираю — пройди три двора.','While I pack the tackle — clear three yards.']},
     {k:'boss',n:1,t:['Последний рывок: двор-босс 🔥 — и мой старый Запорожец твой!','One last push: a boss yard 🔥 — and my old Zaporozhets is yours!']}],
  thx:[['Вот спасибо, внучок! С меня окунь.','Thanks, lad! I owe you a perch.']]},
 {r:'valerka',n:'Валерка',en:'Valerka',ic:'🎒',car:'shesterka',carN:['«Шестёрка»','Lada “Six”'],
  o:[{k:'win',n:1,t:['Покажи, как выезжать! Пройди двор — я посмотрю.','Show me how to drive out! Clear a yard — I’ll watch.']},
     {k:'tg',n:1,t:['А без лишних ходов слабо? Не больше двух лишних.','Bet you can’t do it without extra moves? Two at most.']},
     {k:'clean',n:1,t:['Инструктор говорит — главное без аварий. Покажи!','The instructor says no crashes is key. Show me!']},
     {k:'amb',n:1,t:['А как скорую пропускать? Выпусти её вовремя.','How do you let the ambulance through? Get it out in time.']},
     {k:'new',n:2,t:['Хочу новые дворы посмотреть — пройди два новых.','I want to see new yards — clear two new ones.']},
     {k:'boss',n:1,t:['Экзамен! Двор-босс 🔥 — сдашь, и папа отдаст «Шестёрку»!','Exam time! A boss yard 🔥 — pass it and Dad gives you the “Six”!']}],
  thx:[['Круто! Я тоже так научусь.','Cool! I’ll learn that too.']]},
 {r:'tolik',n:'Толик',en:'Tolik',ic:'🔧',car:'gazon',carN:['Грузовик «Газон»','“Gazon” truck'],
  o:[{k:'nh',n:1,t:['Браток, руками надо, без подсказок. Один двор.','Mate, by hand — no hints. One yard.']},
     {k:'win',n:3,t:['Карбюратор перебираю — а ты три двора пройди.','I’m stripping a carburettor — you clear three yards.']},
     {k:'tg',n:1,t:['Как по чертежу: не больше двух лишних ходов.','By the drawing: two extra moves at most.']},
     {k:'pol',n:1,t:['Участковый к гаражам приехал. Пройди двор с полицией.','The beat cop came to the garages. Clear a yard with a police car.']},
     {k:'clean',n:2,t:['Покраска свежая — два двора без аварий.','Fresh paint — two yards with no crashes.']},
     {k:'boss',n:1,t:['Финишная прямая: двор-босс 🔥 — и «Газон» твой, заведётся с пол-оборота.','The home stretch: a boss yard 🔥 — and the “Gazon” is yours, starts first time.']}],
  thx:[['Как по маслу! Заглядывай в гараж.','Smooth as oil! Drop by the garage.']]},
 {r:'shura',n:'Баба Шура',en:'Granny Shura',ic:'🧶',car:'moloko',carN:['Молоковоз','Milk tanker'],
  o:[{k:'new',n:1,t:['Внучок, в соседнем дворе всё заставили. Пройди новый двор.','Dear, the next yard is jammed. Clear a new yard.']},
     {k:'amb',n:1,t:['Давление у Гали! Выпусти скорую вовремя.','Galya’s blood pressure! Get the ambulance out in time.']},
     {k:'nh',n:2,t:['Ты у нас умный — два двора без подсказок.','You’re clever — two yards without hints.']},
     {k:'daily',n:1,t:['Двор дня сыграй — потом мне расскажешь.','Play the yard of the day — tell me after.']},
     {k:'clean',n:3,t:['Три двора без аварий — и я спокойна.','Three yards with no crashes — and I can rest easy.']},
     {k:'boss',n:1,t:['Молоковоз с фермы у нас застрял. Двор-босс 🔥 — и он твой, молоко всему двору!','The milk tanker is stuck here. A boss yard 🔥 — and it’s yours, milk for the whole yard!']}],
  thx:[['Умница! Держи гостинец.','Good for you! Here’s a treat.']]},
 {r:'mihalych',n:'Михалыч',en:'Mikhalych',ic:'🧹',car:'polivalka',carN:['Поливалка','Street sprinkler'],
  o:[{k:'win',n:2,t:['Мести мешают — убери машины из двух дворов.','They’re in my way — clear two yards.']},
     {k:'clean',n:1,t:['На газон не заезжать! Двор без аварий.','Keep off the grass! A yard with no crashes.']},
     {k:'daily',n:1,t:['Двор дня сегодня — мой участок. Наведи порядок.','The yard of the day is my patch. Tidy it up.']},
     {k:'s3',n:1,t:['Чтоб блестело: двор на ★★★.','Make it shine: a ★★★ yard.']},
     {k:'win',n:5,t:['Субботник большой: пять дворов.','Big clean-up day: five yards.']},
     {k:'tg',n:1,t:['Аккуратно, без лишних ходов — и поливалка твоя, катайся.','Neatly, no extra moves — and the sprinkler is yours.']}],
  thx:[['Вот это порядок! Уважаю.','Now that’s order! Respect.']]},
 {r:'valya',n:'Тётя Валя',en:'Aunt Valya',ic:'🛒',car:'hleb',carN:['Хлебный фургон','Bread van'],
  o:[{k:'win',n:2,t:['Хлеб привезли, а фургон заперт! Пройди два двора, голубчик.','The bread’s here but the van is boxed in! Clear two yards, dear.']},
     {k:'nh',n:2,t:['Сам, без подсказок: два двора — и очередь не ждёт.','On your own, no hints: two yards — the queue won’t wait.']},
     {k:'daily',n:1,t:['Весь дом про двор дня говорит — сыграй, расскажешь.','The whole block is talking about the yard of the day — play it.']},
     {k:'pol',n:1,t:['Милиция у магазина встала. Пройди двор с полицией.','The police parked by the shop. Clear a yard with a police car.']},
     {k:'clean',n:2,t:['Яйца везу — аккуратно! Два двора без аварий.','I’m carrying eggs — careful! Two yards with no crashes.']},
     {k:'s3',n:2,t:['К открытию успеть: два двора на ★★★ — и фургон твой!','Make it by opening time: two ★★★ yards — and the van is yours!']}],
  thx:[['Ой, выручил! Заходи за пирожком.','Oh, you saved me! Drop by for a pie.']]}];
// после всех цепочек — «соседские просьбы» (без машины), по дню
var TPL=[{k:'win',n:3},{k:'clean',n:2},{k:'s3',n:2},{k:'nh',n:2},{k:'amb',n:1},{k:'pol',n:1},{k:'tg',n:1},{k:'new',n:2},{k:'daily',n:1}];
var TPLT={win:['Пройди {n} двора — соседи просят.','Clear {n} yards — the neighbours ask.'],clean:['{n} двора без аварий.','{n} yards with no crashes.'],s3:['{n} двора на ★★★.','{n} ★★★ yards.'],
  nh:['{n} двора без подсказок.','{n} yards without hints.'],amb:['Выпусти скорую вовремя.','Get the ambulance out in time.'],pol:['Пройди двор с полицией.','Clear a yard with a police car.'],
  tg:['Двор без лишних ходов (не больше 2).','A yard with at most 2 extra moves.'],new:['Пройди {n} новых двора.','Clear {n} new yards.'],daily:['Сыграй двор дня.','Play the yard of the day.'],
  boss:['Пройди двор-босс 🔥.','Clear a boss yard 🔥.']};

/* ---------- сохранение ---------- */
// id машин — канонические из VYCARS (ART, js/art-cars.js), как в альбоме YARD; старые имена (до 10.10 вечер) переводятся при загрузке
var ALIAS={zaz965:'gorbaty',vaz2108:'shesterka',izh:'gazon',m412:'moloko',poliv:'polivalka'};
function fixS(){if(!isO(S.ord))S.ord={c:0,s:0,t:null,n:0,g:[],cw:[]};var o=S.ord;o.c=Math.floor(num(o.c));o.s=Math.min(5,Math.floor(num(o.s)));o.n=num(o.n);
  if(!Array.isArray(o.g))o.g=[];if(!Array.isArray(o.cw))o.cw=[];o.cw=o.cw.map(function(x){return ALIAS[x]||x;}).filter(function(x,i,a){return typeof x==='string'&&a.indexOf(x)===i;});if(o.t!=null&&!isO(o.t))o.t=null;}
function fix(){try{fixS();}catch(e){S.ord=null;fixS();}}
function merge(d){if(!d||!isO(d.ord))return;fix();var a=S.ord,b=d.ord,ka=a.c*6+a.s,kb=num(b.c)*6+num(b.s);
  if(kb>ka){a.c=Math.floor(num(b.c));a.s=Math.min(5,Math.floor(num(b.s)));}a.n=Math.max(a.n,num(b.n));
  if(Array.isArray(b.g))b.g.forEach(function(x){if(a.g.indexOf(x)<0)a.g.push(x);});
  if(Array.isArray(b.cw))b.cw.forEach(function(x){x=ALIAS[x]||x;if(typeof x==='string'&&a.cw.indexOf(x)<0)a.cw.push(x);});
  if(isO(b.t)&&(!a.t||b.t.d>a.t.d||b.t.d===a.t.d&&num(b.t.p)>num(a.t.p)))a.t=b.t;}
function st(){fix();return S.ord;}

/* ---------- заказ дня ---------- */
function chainOf(c){return CHAINS[c]||null;}
function cur(){if(!open0())return null;var o=st(),t=dk();
  if(!o.t||o.t.d!==t){ // новый день — следующий шаг цепочки (вчерашний невыполненный заказ остаётся тем же шагом)
    var ch=chainOf(o.c);if(ch)o.t={d:t,r:ch.r,c:o.c,s:o.s,p:0,ok:0};
    else{var R=0;try{R=rng(t*17+3)();}catch(e){R=(t%97)/97;}var x=TPL[Math.floor(R*TPL.length)];o.t={d:t,r:['mityai','valya','valerka','tolik','mihalych','shura'][t%6],c:-1,k:x.k,n:x.n,p:0,ok:0};}
    try{save();}catch(e){}}
  return o.t;}
function spec(t){if(!t)return null;if(t.c>=0){var ch=chainOf(t.c);return ch?ch.o[t.s]:null;}return{k:t.k,n:t.n,t:TPLT[t.k]};}
function who(r){for(var i=0;i<CHAINS.length;i++)if(CHAINS[i].r===r)return CHAINS[i];return CHAINS[0];}
function txt(t){var s=spec(t);if(!s)return '';var x=T(s.t||TPLT[s.k]);return x.replace('{n}',s.n);}
var SHT={win:['{n} двора','{n} yards'],new:['{n} новых двора','{n} new yards'],clean:['{n} без аварий','{n} with no crashes'],s3:['{n} на ★★★','{n} with ★★★'],
  nh:['{n} без подсказок','{n} without hints'],amb:['скорая вовремя','ambulance in time'],pol:['двор с полицией','a police yard'],tg:['без лишних ходов','no extra moves'],
  boss:['двор-босс 🔥','a boss yard 🔥'],daily:['двор дня','yard of the day']};
function short(t){var s=spec(t);if(!s)return '';var x=T(SHT[s.k]||TPLT[s.k]);if(s.n===1)x=x.replace('{n} ','');x=x.replace('{n}',s.n);
  if(s.n===1&&/^(win|new|clean|s3|nh)$/.test(s.k))x=T({win:['пройди двор','clear a yard'],new:['новый двор','a new yard'],clean:['двор без аварий','a yard with no crashes'],s3:['двор на ★★★','a ★★★ yard'],nh:['двор без подсказок','a yard without hints']}[s.k]);
  return x.charAt(0).toUpperCase()+x.slice(1)+(s.n>1?' · '+num(t.p)+'/'+s.n:'');}
function today(){var t=cur();if(!t)return null;var w=who(t.r);return{r:t.r,who:tr(w.n,w.en),ic:w.ic,t:short(t),full:txt(t),ok:!!t.ok,p:num(t.p),n:(spec(t)||{}).n||1,
  step:t.c>=0?t.s+1:0,car:t.c>=0?T(w.carN):''};}

/* ---------- проверка по итогу двора ---------- */
var news=[];
function G0(){try{return G;}catch(e){return null;}}
function hit(k,o,g){var daily=!!o.daily||o.mode==='daily';
  switch(k){
   case 'win':return !daily;
   case 'new':try{return !daily&&TD.isFirst(o);}catch(e){return false;}
   case 'clean':return !(o.crashes!=null?num(o.crashes):(g?g.crashes:0));
   case 's3':return (+o.stars||0)>=3;
   case 'nh':return !(o.hint!=null?num(o.hint)+num(o.tow):(g?g.helps:0));
   case 'amb':return !!(g&&g.amb&&g.amb.done)||!!o.amb;
   case 'pol':return !!(g&&g.police>=0)||!!o.pol;
   case 'tg':var mv=g?g.moves:o.moves,nv=g&&g.vs?g.vs.length:0;return !!nv&&mv!=null&&mv<=nv+2;
   case 'boss':return !daily&&((o.idx!=null?+o.idx:(g?g.idx:(+o.lv||1)-1))%10===9);
   case 'daily':return daily;}
  return false;}
function onYard(o){try{if(!o||!o.ok)return;var t=cur();if(!t||t.ok)return;var s=spec(t);if(!s)return;var g=G0();
  if(o.mode&&!/^(n|norm|yard|fin|daily|day)$/.test(o.mode))return;
  if(!hit(s.k,o,g))return;t.p=Math.min(s.n,num(t.p)+1);if(t.p>=s.n)done(t);try{save();}catch(e){}
}catch(e){try{console.warn('ORD yard',e);}catch(_){}}}
function done(t){var o=st(),w=who(t.r),c=C().order;t.ok=1;o.n++;
  try{TD.give(c.c,c.p,'quest');}catch(e){try{S.coins+=c.c;}catch(e2){}}
  try{CAR.add(C().pts.order,'order');}catch(e){}
  var line='📮 '+tr(w.n,w.en)+': «'+T(w.thx[0])+'» +'+ct(c.c)+(c.p?' +'+c.p+' 🔩':''),car=null;
  if(t.c>=0&&t.c===o.c){o.s++;if(o.s>=6){car=w;o.s=0;o.c++;if(o.g.indexOf(t.c)<0){o.g.push(t.c);giveCar(w);}}}
  news.push({t:line,car:car,r:t.r});
  try{STAT.ev('ord',{r:t.r,c:t.c,s:t.s+1});}catch(e){}
  try{TD.mark('or');}catch(e){}}
function giveCar(w){var ok=false;try{if(window.YARD&&typeof YARD.giveCar==='function'){YARD.giveCar(w.car,'ord');ok=true;}}catch(e){}
  if(!ok){var o=st();if(o.cw.indexOf(w.car)<0)o.cw.push(w.car);} // машина ждёт YARD (YARD заберёт ORD.takeCars())
  try{STAT.ev('unlock',{k:'car',id:w.car,f:'ord'});}catch(e){}}

/* ---------- окно заказа ---------- */
function openOrd(){var t=cur();if(!t){try{toast(tr('Заказы жильцов — с '+C().ordFrom+'-го двора','Neighbour requests open after yard '+C().ordFrom));}catch(e){}return;}
  try{STAT.screen('order');}catch(e){}var w=who(t.r),s=spec(t),c=C().order,ch=t.c>=0;
  var dots='';if(ch)for(var i=0;i<6;i++)dots+='<i class="'+(i<t.s||(i===t.s&&t.ok)?'ok':i===t.s?'now':'')+'"></i>';
  modal('<div class="car-hero">'+CAR.face(t.r)+'</div><h2>📮 '+esc(tr(w.n,w.en))+'</h2>'+
    '<p class="car-q">«'+esc(txt(t))+'»</p>'+
    (s&&s.n>1?'<p class="goal">'+tr('Сделано: ','Done: ')+num(t.p)+' / '+s.n+'</p>':'')+
    '<p class="goal">'+(t.ok?'✅ '+tr('Заказ выполнен! Новый — завтра.','Request done! A new one tomorrow.'):tr('Награда: +','Reward: +')+ct(c.c)+(c.p?' +'+c.p+' 🔩':'')+' · '+tr('одно из дел «Сегодня во дворе»','one of the “Today in the yard” jobs'))+'</p>'+
    (ch?'<div class="ord-dots">'+dots+'</div><p class="goal ord-car">🚗 '+tr('6 заказов — и в альбом: ','6 requests — and into the album: ')+'<b>'+esc(T(w.carN))+'</b></p>':'')+
    '<div class="row">'+(t.ok?'':'<button class="btn green" id="ordGo">▶ '+tr('Выполнить','Do it')+'</button>')+'<button class="btn" id="mCancel">'+tr('Закрыть','Close')+'</button></div>');
  if($('ordGo'))$('ordGo').onclick=function(){hideModal();try{if(s.k==='daily')openDaily();else startLevel(Math.max(0,(S.unlocked||1)-1));}catch(e){}};
  $('mCancel').onclick=function(){hideModal();};}

/* ---------- гнёзда UX ---------- */
function tile(o){try{return UI.tile(o);}catch(e){return '<button class="hsT '+(o.cls||'')+'"><span class="hsI">'+o.ic+'</span><span class="hsB"><b>'+esc(o.t)+'</b><small>'+esc(o.s||'')+'</small></span>'+(o.tag?'<em class="hsTag">'+esc(o.tag)+'</em>':'')+'</button>';}}
['homeSlots','winSlots','yardHook'].forEach(function(n){if(!Array.isArray(window[n]))window[n]=[];});
// окно пятиэтажки: у жильца с заказом дня — значок 📮 и его просьба (UX: zone 'win', id 'w-<жилец>' — заменяет заглушку UX, остальное время — её же реплика)
try{if(window.UI&&UI.onSave)UI.onSave({id:'ord',keys:['ord'],fix:function(){fix();},merge:function(S0,d){merge(d);}});}catch(e){}
['mityai','valerka','tolik','shura','mihalych','valya'].forEach(function(r,i){var id='w-'+r,old=null;
  for(var k=homeSlots.length-1;k>=0;k--)if(homeSlots[k]&&homeSlots[k].id===id){old=homeSlots[k];break;}
  homeSlots.push({id:id,order:old&&old.order!=null?old.order:60+i,zone:'win',render:function(ctx){var t=null;try{t=cur();}catch(e){}
    if(t&&t.r===r&&!t.ok){var w=who(r),sp=spec(t);return{who:r,t:tr(w.n,w.en),s:short(t),badge:'📮',say:txt(t),go:openOrd};}
    return old&&old.render?old.render(ctx):null;},mount:old&&old.mount});});
winSlots.push({id:'ord',order:15,zone:'goal',fit:0,/* vy-merge: было fit 2 — в сводной окно победы теснее (Перекур, сундук дня) и благодарность жильца срезалась; строка прогресса заказа и так data-fit 3 */render:function(){var h='',t=null;try{t=cur();}catch(e){}
  var nn=news.splice(0);for(var i=0;i<nn.length;i++){h+='<div class="ord-done"><span class="ord-f">'+CAR.face(nn[i].r)+'</span><p>'+esc(nn[i].t)+(nn[i].car?'<br><b>🚗 '+tr('В альбом: ','Into the album: ')+esc(T(nn[i].car.carN))+'!</b>':'')+'</p></div>';}
  if(!h&&t&&!t.ok){var s=spec(t);if(s&&s.n>1&&num(t.p)>0)h='<p class="goal" data-fit="3">📮 '+esc(tr(who(t.r).n,who(t.r).en))+': '+num(t.p)+'/'+s.n+'</p>';}
  return h||null;}});
yardHook.push({id:'ord',order:3,fn:onYard});
window.ORD={CHAINS:CHAINS,fix:fix,merge:merge,today:today,open:openOrd,onYard:onYard,cur:cur,
  takeCars:function(){var o=st(),a=o.cw.slice();o.cw=[];try{save();}catch(e){}return a;}};
try{fix();}catch(e){}
})();
