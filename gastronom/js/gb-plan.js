'use strict';
/* ================= gb-plan — «План на сегодня»: 5 дел, 3 из 5 → печать «План выполнен» + авоська дня (поток META) =================
   Заменяет «Задания дня» (QUEST): вход #btnQuest и тост «Задание выполнено» прячутся, данные QUEST (quest, qTal, qStat) не трогаем,
   купленное за талоны остаётся. Выключатель: GB.flag('plan') — тогда всё как раньше (QUEST виден).
   ДОГОВОР ДЕЛ (GB.todayTasks, шапка gb-core.js): {id, order, t, ic, done()→bool, go(), hint()→str} + необязательные
     on()→bool (показывать ли сегодня), prog()→[сделано, нужно] (полоска). Тот же id у другого модуля — замена (GB.add).
   Свои пять: 'daily' 10 задание дня · 'deficit' 20 дефицит дня · 'order' 30 заказ соседа · 'mg' 40 затея дня (MG0 регистрирует своё 'mg'
     и/или зовёт GBPL.mark('mg'); без MG0 — запасное «уровень без подсказок») · 'norm' 50 норма (5 уровней).
   GBPL.mark(id)  — модуль сам отмечает своё дело сегодня (тогда done() можно не писать).
   GBPL.seal()    — есть ли печать сегодня; GBPL.count() — сделано дел; GBPL.list() — 5 строк; GBPL.bag() → {c} авоська дня.
   GBPL.deficit   — поставщик «Дефицита дня» (LVL/MODE): {start(), name()→'бананы', done()→bool}; нет — «соберите тройку дефицита в коробке».
   События: GB.emit('seal', {n: всего печатей}) — печать поставлена; GB.emit('plan', {id}) — дело сделано.
   Поле S.dp {d день, m {id:1} отмечено, n {w побед, o тройки заказа, r дефицит, nh без подсказок}, f печать, p авоська взята, a окно показано}.
   Числа — GBECO.plan {need:3, norm:5, bag:40, bagSun:60, order:[4,6]} (ECO), здесь — запасные. */
(function(){
if(typeof GB==='undefined'||!window.GBM)return;
var ON=GB.flag('plan')&&GBM.on;
var M=GBM,num=M.num,isO=M.isO,R=M.R,esc=M.esc,pl=M.pl,E=M.E,dk=M.dk,stat=M.stat;
var CFG={from:3,need:3,norm:5,bag:40,bagSun:60};
function S_(){return typeof S!=='undefined'?S:null;}
function sv(){try{save();}catch(e){}}
function tap(){try{SND.tap();}catch(e){}}
function dn(){return M.dnum(dk());}
function wd(){var k=dk();return new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100,12).getDay();}
function need(){return num(E('plan.need',0))||CFG.need;}
function normN(){return num(E('plan.norm',0))||CFG.norm;}
function lvDone(){var s=S_();return s?Math.max(0,(+s.unlocked||1)-1):0;}
function bag(){var c=0;try{if(window.GBECO&&typeof GBECO.bagOf==='function'){var b=GBECO.bagOf(dk());if(b&&num(b.c))return {c:num(b.c),t:b.t||'',eco:1};}}catch(e){}
  var sun=wd()===0;c=sun?(num(E('plan.bagSun',0))||CFG.bagSun):(num(E('plan.bag',0))||CFG.bag);
  var k=M.dep('konditer');if(k>=2)c+=k>=3?30:15; // кондитерский: торт к авоське
  return {c:c};}

/* ---------- сохранение ---------- */
function fresh(){return {d:dk(),m:{},n:{},f:0,p:0,a:0};}
function fix(s){s=s||S_();if(!s)return;if(!isO(s.dp)||num(s.dp.d)!==dk())s.dp=fresh();var t=s.dp;['m','n'].forEach(function(k){if(!isO(t[k]))t[k]={};});
  t.f=t.f?1:0;t.p=t.p?1:0;t.a=t.a?1:0;}
function merge(s,d){fix(s);if(!d||!isO(d.dp)||num(d.dp.d)!==s.dp.d)return;var a=s.dp,b=d.dp;
  if(isO(b.m))for(var k in b.m)if(b.m[k])a.m[k]=1;if(isO(b.n))for(var j in b.n)a.n[j]=Math.max(num(a.n[j]),num(b.n[j]));
  a.f=a.f||b.f?1:0;a.p=a.p||b.p?1:0;a.a=a.a||b.a?1:0;}
GB.onSave({id:'plan',keys:['dp'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});
function sd(){var s=S_();if(!isO(s.dp)||num(s.dp.d)!==dk())fix(s);return s.dp;}
function cnt(k){return num(sd().n[k]);}
function inc(k,v){var t=sd();t.n[k]=num(t.n[k])+(v==null?1:v);}

/* ---------- заказ соседа: N троек товаров одной группы (по кругу дней, один на всех) ---------- */
var GRP=[{id:'milk',n:'молочного',nn:'молочное',t:[5,6,10,11,16,19],dep:'moloko'},{id:'groc',n:'бакалеи',nn:'бакалея',t:[1,4,12,13,14,15,21],dep:'bakaleya'},
  {id:'bread',n:'хлеба и пряников',nn:'хлеб и пряники',t:[8,17,20],dep:'hleb'},{id:'can',n:'консервов',nn:'консервы',t:[2,3,4,22],dep:'ryba'},{id:'gas',n:'колбасы и сыра',nn:'колбаса и сыр',t:[9,10],dep:'gastro'}];
var WHO=[{w:'Нюра из дома напротив',s:'к юбилею'},{w:'Студент Лёша из общежития',s:'на всю комнату'},{w:'Пенсионерка Н.',s:'внукам на выходные'},
  {w:'Милиционер Петров',s:'на дежурство'},{w:'Школьник Вова, 4 «Б»',s:'маме к 8 Марта — заранее'},{w:'Интеллигент Аркадий Львович',s:'к приезду тёщи'},
  {w:'Рабочий Гена',s:'на смену'}];
// новые товары GOODS (GBG: {id, dep}) добавляются в группы по отделу
function grpTypes(g){var t=g.t.slice();try{if(Array.isArray(window.GBG))GBG.forEach(function(x){if(x&&x.dep===g.dep&&t.indexOf(x.id)<0)t.push(x.id);});}catch(e){}return t;}
function order(){var d=dn(),g=GRP[d%GRP.length],w=WHO[(d*3+1)%WHO.length],o=E('plan.order',null),lo=Array.isArray(o)?num(o[0]):4,hi=Array.isArray(o)?num(o[1]):6;
  var n=Math.min(hi||6,(lo||4)+Math.floor(lvDone()/60));return {g:g,w:w,n:n,types:grpTypes(g)};}
// тройки по типам: обёртка afterMove (события хода) — считаем тройки товаров заказа и дефицита
function onClears(ev){if(!ON)return;var g=null;try{g=G;}catch(e){}if(!g||!ev)return;var o=order(),add=0,rare=0;
  for(var i=0;i<ev.length;i++){var e=ev[i];if(!e||e.k!=='clear')continue;var t=+e.t;if(t>=200)rare++;else if(o.types.indexOf(t)>=0)add++;}
  if(add){g.gbOrd=(g.gbOrd||0)+add;}if(rare)g.gbRare=(g.gbRare||0)+rare;}
GB.on('ready',function(){if(!ON||typeof window.afterMove!=='function'||window.afterMove.gbPlan)return;var am=window.afterMove;
  window.afterMove=function(ev){GB.safe('plan-clears',function(){onClears(ev);});return am.apply(this,arguments);};window.afterMove.gbPlan=1;
  // затея дня без MG0: подсказки считаем обёрткой doHint
  if(typeof window.doHint==='function'&&!window.doHint.gbPlan){var dh=window.doHint;window.doHint=function(){try{G.gbHint=(G.gbHint||0)+1;}catch(e){}return dh.apply(this,arguments);};window.doHint.gbPlan=1;}});

/* ---------- итог уровня ---------- */
var news=[]; // для окна победы: {k:'seal'}
GB.levelHook.push(function(o){if(!ON||!o)return;var g=null;try{g=G;}catch(e){}
  if(o.r==='win'){if(!o.daily&&!o.mode)inc('w');
    if(g){if(g.gbOrd){inc('o',g.gbOrd);g.gbOrd=0;}if(g.gbRare){inc('r',1);g.gbRare=0;}
      if(!o.mx&&!o.tb&&!(g.gbHint>0))inc('nh');}}
  else if(g){g.gbOrd=0;g.gbRare=0;} // проигрыш/выход: тройки заказа не в счёт
  check();});

/* ---------- пять своих дел ---------- */
function startNext(){try{hideModal();}catch(e){}try{var i=Math.max(0,(S.unlocked||1)-1);if(window.GBPL_START)return GBPL_START(i);startLevel(i);}catch(e){}}
function dailyOpen(){var s=S_();return s&&(+s.unlocked||1)>=7;}
function dailyDone(){try{return !!S.daily[todayKey()];}catch(e){return false;}}
// день — ГГГГММДД (необязательно; без него — сегодня). Для «Завтра: …» NEWBIE: GBPL.defName(завтра)
function defName(day){var p=GBPL.deficit,d=day?M.dnum(+day):dn();if(p&&p.name){var n=GB.safe('def-name',function(){return p.name(day||undefined);});if(n)return n;}
  try{var r=RARE[d%Math.min(10,RARE.length)];return r&&r.n?r.n.toLowerCase():'';}catch(e){return '';}}
var OWN=[
 {id:'daily',order:10,ic:'📅',t:'Задание дня',done:dailyDone,
   hint:function(){return dailyDone()?'выполнено — одно на всех':dailyOpen()?'одно на всех, с рейтингом':'откроется после 6-го уровня';},
   go:function(){if(!dailyOpen()){try{toast(R('Задание дня откроется после 6-го уровня'));}catch(e){}return;}try{hideModal();startLevel(0,true);}catch(e){}}},
 {id:'deficit',order:20,ic:'🍌',t:'Дефицит дня',done:function(){var p=GBPL.deficit;if(p&&p.done)return !!GB.safe('def-done',function(){return p.done();});return cnt('r')>0;},
   hint:function(){var n=defName();return (n?'«Выбросили '+n+'!» — ':'')+(GBPL.deficit?'особый уровень дня':'соберите тройку из коробки «Дефицит»');},
   go:function(){var p=GBPL.deficit;if(p&&p.start){try{hideModal();}catch(e){}GB.safe('def-start',function(){p.start();});return;}startNext();}},
 {id:'order',order:30,ic:'📦',t:'Заказ соседа',done:function(){return cnt('o')>=order().n;},prog:function(){var o=order();return [Math.min(cnt('o'),o.n),o.n];},
   hint:function(){var o=order(),T=window.GBT_ORDERS,c=' · '+Math.min(cnt('o'),o.n)+' из '+o.n,q=o.n+' '+pl(o.n,'тройка','тройки','троек');
     if(Array.isArray(T)&&T.length){var x=T[dn()%T.length],en=window.GBEN&&GBEN.on();if(x&&x.say){if(en)return GBEN.tr(x.who)+': '+GBEN.tr(x.say).replace('{name}',GBEN.tr(o.g.nn)).replace(/\{n\|[^}]*\}/,o.n+' '+(o.n===1?'triple':'triples'))+' · '+Math.min(cnt('o'),o.n)+' of '+o.n;/* gb-EN */return x.who+': '+x.say.replace('{name}',o.g.nn).replace(/\{n\|[^}]*\}/,q)+c;}}
     return o.w.w+' '+o.w.s+': '+q+' '+o.g.n+c;},
   go:startNext},
 {id:'mg-fb',order:40,ic:'🎲',t:'Испытание дня: без подсказок',done:function(){return cnt('nh')>0||!!sd().m['mg-fb'];},
   hint:function(){return 'пройдите уровень без подсказок и бустеров';},go:startNext},
 {id:'norm',order:50,ic:'🧾',t:'Норма',done:function(){return cnt('w')>=normN();},prog:function(){return [Math.min(cnt('w'),normN()),normN()];},
   hint:function(){return 'пройдите '+normN()+' '+pl(normN(),'уровень','уровня','уровней')+' · '+Math.min(cnt('w'),normN())+' из '+normN();},go:startNext}];
OWN.forEach(function(x){x.own=1;for(var i=0;i<GB.todayTasks.length;i++)if(GB.todayTasks[i].id===x.id)return;GB.todayTasks.push(x);});
function onOk(x){return x&&GB.safe('pl-on:'+x.id,function(){return !x.on||x.on()!==false;})!==false;}
var STD=['daily','deficit','order','mg','norm'];
function isDone(x){return !!GB.safe('pl-done:'+x.id,function(){return x.done?x.done():!!sd().m[x.id];});}
// ровно 5 дел: свои по местам; «затея» MG0 ('mg') — вместо запасной; лишние (другие id) — одно в день на месте нормы (сделанное сегодня остаётся)
function pick(){var L=GB.todayTasks.filter(onOk),extra=L.filter(function(x){return STD.indexOf(x.id)<0&&x.id!=='mg-fb';});
  L=L.filter(function(x){return STD.indexOf(x.id)>=0;});
  if(!L.some(function(x){return x.id==='mg';})){var fb=GB.todayTasks.filter(function(x){return x.id==='mg-fb';})[0];if(fb)L.push(fb);}
  if(!extra.length)return L;var p=extra.filter(isDone)[0];
  if(!p){var nm=L.filter(function(x){return x.id==='norm';})[0];if(nm&&isDone(nm))return L;var k=dn()%(extra.length+1);p=k<extra.length?extra[k]:null;}
  if(!p)return L;var alt=p.alt||'norm',a=L.filter(function(y){return y.id===alt;})[0];if(a&&p.order==null)p.order=a.order;
  return L.filter(function(y){return y!==a;}).concat([p]);}
function list(){return pick().sort(function(a,b){return (a.order||0)-(b.order||0);}).slice(0,5).map(function(x){
  return {x:x,id:x.id,ok:isDone(x),t:R(x.t||x.id),ic:x.ic||'•',h:R(GB.safe('pl-hint:'+x.id,function(){return x.hint?x.hint():'';})||''),
    pr:x.prog?GB.safe('pl-prog:'+x.id,function(){return x.prog();}):null};});}
function count(){return list().filter(function(x){return x.ok;}).length;}

/* ---------- печать и авоська ---------- */
var lastN=-1,doneSeen={};
function check(){if(!ON)return;var t=sd(),L=list(),n=0;
  L.forEach(function(x){if(x.ok){n++;if(!doneSeen[x.id]){doneSeen[x.id]=1;if(lastN>=0){stat('plan',{id:String(x.id).slice(0,12),n:n});GB.emit('plan',{id:x.id});}}}});lastN=n;
  if(!t.f&&n>=need()){var s=S_();t.f=1;s.mtS=num(s.mtS)+1;if(!Array.isArray(s.mtSw))s.mtSw=[];if(s.mtSw.indexOf(dk())<0)s.mtSw.push(dk());s.mtSw=s.mtSw.slice(-14);
    news.push({k:'seal'});stat('seal',{n:n,all:s.mtS,l:lvDone()});GB.emit('seal',{n:s.mtS});}
  sv();}
function mark(id){var t=sd();if(!t.m[id]){t.m[id]=1;check();}}
function seal(){return !!sd().f;}
function bagReady(){var t=sd();return !!t.f&&!t.p;}
function bagTxt(){var b=bag();return '+'+b.c+' 💰'+(b.t?' + '+b.t:'');}
function takeBag(el){var t=sd();if(!t.f||t.p)return 0;t.p=1;var b=bag();
  try{if(b.eco&&typeof GBECO.bagGive==='function')GBECO.bagGive(dk(),b.c);else if(window.GBECO&&typeof GBECO.give==='function')GBECO.give('plan',b.c);else setCoins(S.coins+ern('plan',b.c));}catch(e){}
  try{SND.coin();}catch(e){}stat('plan',{id:'bag',c:b.c});sv();try{cloudSoon();}catch(e){}return b.c;}

/* ---------- вид: строки, печать ---------- */
var DN=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
var MN=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function dateTxt(){var k=dk();if(M.R('План на сегодня')!=='План на сегодня'){try{return new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100,12).toLocaleDateString('en-US',{month:'long',day:'numeric',weekday:'long'});}catch(e){return '';}}
  return (k%100)+' '+MN[Math.floor(k/100)%100-1]+', '+DN[wd()];}
function stampHtml(cls){return '<span class="mt-stamp'+(cls?' '+cls:'')+'"><b>ПЛАН</b><i>ВЫПОЛНЕН</i></span>';}
function rowsHtml(L){return L.map(function(x,i){var pr=x.pr&&x.pr[1]>1&&!x.ok?'<i class="mt-pb"><b style="width:'+Math.round(100*x.pr[0]/x.pr[1])+'%"></b></i>':'';
  return '<button type="button" class="mt-row'+(x.ok?' ok':'')+'" data-i="'+i+'"><span class="mt-ic">'+x.ic+'</span>'+
    '<span class="mt-b"><b>'+esc(x.t)+'</b><small>'+esc(x.h)+'</small>'+pr+'</span><span class="mt-mk">'+(x.ok?'✓':'›')+'</span></button>';}).join('');}
function sealHtml(n){var t=sd();
  if(t.f&&!t.p)return '<button type="button" class="btn green mt-take" data-bag="1">'+esc(R('Забрать авоську дня'))+': '+bagTxt()+'</button>';
  if(t.f)return '<div class="mt-seal got">'+stampHtml('sm')+'<span>'+esc(R('План на сегодня выполнен. Авоська забрана — завтра новые дела.'))+'</span></div>';
  var k=Math.max(0,need()-n);
  return '<div class="mt-seal">'+stampHtml('sm off')+'<span>'+esc(R('Ещё '+k+' '+pl(k,'дело','дела','дел')+' — и печать «План выполнен» + авоська дня'))+' <b>'+bagTxt()+'</b></span></div>';}
function weekHtml(){var s=S_(),w=Array.isArray(s.mtSw)?s.mtSw:[],D=['вс','пн','вт','ср','чт','пт','сб'],h='';
  for(var i=6;i>=0;i--){var d=new Date(nowMs0());d.setDate(d.getDate()-i);var k=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    h+='<span class="'+(i===0?'now':'')+'"><small>'+D[d.getDay()]+'</small><b>'+(w.indexOf(k)>=0?'✓':'')+'</b></span>';}
  return '<div class="mt-week">'+h+'</div>';}
function nowMs0(){try{return nowMs();}catch(e){return Date.now();}}
function bind(el,rerender){var L=list(),rs=el.querySelectorAll('.mt-row');
  for(var i=0;i<rs.length;i++)rs[i].onclick=(function(x){return function(){tap();GB.safe('pl-go:'+x.id,function(){x.x.go&&x.x.go();});};})(L[+rs[i].getAttribute('data-i')]);
  var b=el.querySelectorAll('[data-bag]');for(var j=0;j<b.length;j++)b[j].onclick=function(){var c=takeBag(this);try{coinBurst(this,c);}catch(e){}if(rerender)rerender();};}

/* ---------- экран «План на сегодня» ---------- */
function render(el){if(!R('План на сегодня')){home();return;} // ?lang=en без перевода — экрана нет
  var L=list(),n=L.filter(function(x){return x.ok;}).length,inf=GBM.info();
  el.innerHTML='<div class="mt-scr"><div class="mt-sheet"><div class="mt-dh"><span><small>'+esc(R('ПЛАН НА СЕГОДНЯ'))+'</small><b>'+esc(inf.name)+'</b></span>'+
    '<span class="mt-date">'+dateTxt()+'</span></div><div class="mt-cnt">'+n+' / 5</div>'+rowsHtml(L)+sealHtml(n)+weekHtml()+
    '<p class="mt-mut">'+esc(R('Пропустили день — ничего не сгорает. Печать — одна в день.'))+'</p></div>'+
    '<div class="row"><button type="button" class="btn" id="mtBack">'+esc(R('← В магазин'))+'</button></div></div>';
  bind(el,function(){render(el);});var bb=el.querySelector('#mtBack');if(bb)bb.onclick=function(){tap();home();};}
function home(){try{if(window.GB&&GB.homeGo)return GB.homeGo();}catch(e){}try{openMap();}catch(e){}}
GB.screen('plan',{render:render});
function open(){check();GB.go('plan');try{STAT.screen('plan');}catch(e){}}
function shown(){return ON&&(lvDone()>=CFG.from||dailyDone())&&!!R('План на сегодня');}

/* ---------- главный: зона plan ---------- */
GB.add(GB.homeSlots,{id:'mt-plan',order:10,zone:'plan',render:function(){if(!shown())return '';var L=list(),n=L.filter(function(x){return x.ok;}).length,t=sd(),k=Math.max(0,need()-n);
  var line=t.f?(t.p?R('Печать сегодня есть! Завтра — новые дела'):R('План выполнен! Авоська ждёт — заберите')):R('Ещё '+k+' — и печать + авоська')+' '+bagTxt();
  return '<button type="button" class="mt-home'+(bagReady()?' hot':'')+'"><span class="mt-hh"><b>📋 '+esc(R('План на сегодня'))+'</b>'+
    (t.f?stampHtml('xs'):'<span class="mt-cnt">'+n+'/5</span>')+'</span>'+
    '<span class="mt-chips">'+L.map(function(x){return '<i class="'+(x.ok?'ok':'')+'" title="'+esc(x.t)+'">'+x.ic+'</i>';}).join('')+'</span>'+
    '<span class="mt-hl">'+esc(line)+'</span></button>';},
  mount:function(el){var b=el.querySelector('.mt-home');if(b)b.onclick=function(){tap();open();};auto();}});
// само: печать есть, авоська не взята — окно один раз за день (не поверх окна и не в уровне)
var autoT=0;function auto(){clearTimeout(autoT);autoT=setTimeout(function(){try{if(modalOn)return;if(G&&!G.won)return;}catch(e){}
  if(window.GBMIG&&GBMIG.pending())return;var t=sd();if(bagReady()&&!t.a&&nbTurn('bag')){t.a=1;sv();openBag();}},800);}
// дирижёр новичка (NEWBIE): можно ли сейчас показать окно
function nbTurn(id){try{return window.GBNB&&GBNB.turn?GBNB.turn(id)!==false:true;}catch(e){return true;}}
function openBag(){if(!bagReady())return;try{STAT.screen('bag');}catch(e){}
  modal('<div class="mt-bag"><h2>'+esc(R('План выполнен!'))+'</h2>'+stampHtml('big')+'<p>'+esc(R('Три дела из пяти — печать в журнал! Вот вам авоська дня.'))+'</p>'+
    '<p class="coins-won" id="mtBagW">'+bagTxt()+'</p><div class="row"><button class="btn green" id="mtBagOk">'+esc(R('Забрать авоську'))+'</button></div></div>');
  var b=document.getElementById('mtBagOk');if(b)b.onclick=function(){var c=takeBag(b);try{coinBurst(document.getElementById('mtBagW'),c);}catch(e){}hideModal();GB.refresh();};}

/* ---------- «Касса»: зона seal ---------- */
var WS=GB.add(GB.winSlots,{id:'mt-plan',order:20,zone:'seal',fit:3,render:function(ctx){if(!shown())return '';var nn=news.splice(0),t=sd();WS.fit=3;
  if(bagReady()){var fresh=nn.some(function(x){return x.k==='seal';});if(fresh)WS.fit=0;
    return '<div class="mt-wseal'+(fresh?' new':'')+'">'+stampHtml('sm')+'<span><b>'+esc(fresh?R('План выполнен!'):R('Авоська дня ждёт'))+'</b><small>'+bagTxt()+'</small></span>'+
      '<button type="button" class="btn small mt-wtake noent" data-bag="1">'+esc(R('Забрать'))+'</button></div>';}
  if(t.f)return '';var n=count();if(n<1||!nbTurn('plan'))return '';var k=Math.max(0,need()-n);
  /* POLISH (QA-RU Ф3/Ф4): строку плана в «Кассе» — только когда план сдвинулся (уровни после «Нормы» план не двигают — одна и та же строка казалась «сломанной») */
  var dk=dn();if(WS.last&&WS.last.d===dk&&WS.last.n===n)return '';WS.last={d:dk,n:n};
  return '<p class="mt-wl">📋 '+esc(R('План: '+n+' из 5 — ещё '+k+' до печати'))+'</p>';},
  mount:function(el){var b=el.querySelector('[data-bag]');if(b)b.onclick=function(){var c=takeBag(b);try{coinBurst(b,c);}catch(e){}b.disabled=true;b.textContent='✓';};}});

/* ---------- QUEST «Задания дня» прячем (данные и талоны — как были) ---------- */
GB.on('ready',function(){if(!ON)return;
  if(typeof window.updQuest==='function'&&!window.updQuest.gbPlan){var uq=window.updQuest;window.updQuest=function(){var r=uq.apply(this,arguments);
    try{var b=document.getElementById('btnQuest');if(b)b.style.display='none';var ms=document.getElementById('mapScroll');if(ms)ms.classList.remove('qpad');}catch(e){}return r;};window.updQuest.gbPlan=1;}
  if(typeof window.toast==='function'&&!window.toast.gbPlan){var tt=window.toast;window.toast=function(t){if(typeof t==='string'&&t.indexOf('🎯')===0)return;return tt.apply(this,arguments);};window.toast.gbPlan=1;}
  try{updQuest();}catch(e){}check();});

window.GBPL={on:ON,list:list,count:count,check:check,mark:mark,seal:seal,bag:bag,bagReady:bagReady,takeBag:takeBag,open:open,openBag:openBag,order:order,deficit:null,
  render:render,defName:defName,nbTurn:nbTurn,fix:function(){fix();}};
})();
