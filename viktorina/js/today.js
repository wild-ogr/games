/* «Сегодня во дворе» — 5 дел дня, печать + сундук, 3 задания, вопрос дня Михалыча, серия входа 30 дней, заначка Михалыча, события по дням недели
   (поток CAR буста 09.10.2026; журнал hobby-analytics/release-i/viktorina-boost/logs/CAR.md; замысел — 04-meta-economy.md §2.4, §2.6, §3).
   Грузится ПОСЛЕ основного скрипта и js/career.js. Наружу — window.TD. Поля сохранения: S.td (дела сегодняшнего дня), S.tdS (серия, заначка, рамки серии).
   Пять дел: ❓ вопрос дня · 📅 викторина дня · 📺 табло дня (BOARD) · 🧩 затея дня (MG) · ✅ 3 задания. 3 из 5 → 🔖 печать двора (CAR.seal) + 🎁 сундук дня.
   Чужие модули (если есть): BOARD.dayOpen()/dayDone()/openDay(), VMG.dayDone()/openDay()/dayName(), YARD.gift(kind, cb) — марка/украшение.
   Нет модуля — дело заменяется своим: табло → «пройди уровень», затея → «10 верных ответов». Другие сообщают о сделанном: TD.mark('bd'|'mg'), TD.ev('mg'). */
(function(){
'use strict';
function C(){return CAR.CFG;}
function dk(o){try{return dayKey(o||0);}catch(e){var d=new Date();d.setDate(d.getDate()+(o||0));return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function num(x){return typeof x==='number'&&isFinite(x)&&x>=0?x:0;}
function now(){try{return nowMs();}catch(e){return Date.now();}}
function wd(){return new Date(now()).getDay();} // 0 — воскресенье
function dayDiff(a,b){function t(k){return Date.UTC(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100)/864e5;}return a&&b?Math.round(t(b)-t(a)):99;}

/* ---------- события по дням недели (04 §2.6; затея дня — расписание MG, 05 §4.3 п.2) ---------- */
var WEEK=[
 {mg:'По трём подсказкам',ac:'Кубок выходного дня · итоги лиги в 23:59 · сундук дня побольше',chest:1},
 {mg:'Правда или байка',ac:'Новая тема недели — монеты ×2 · новая неделя лиги'},
 {mg:'Анаграммы',ac:'День лёгких: вопросы за 100–200 — очки знатока ×2',easy:1},
 {mg:'Угадай год',ac:'Среда заданий: монеты за задания дня ×2',task2:1},
 {mg:'Пары',ac:'Четверг ностальгии: «СССР и быт» — очки знатока ×1,5',ussr:1},
 {mg:'Что лишнее',ac:'Табло дня с «Посылкой от бабы Зины» и «Торгом у гаражей»',board:1},
 {mg:'Кроссвордик',ac:'Кубок выходного дня на табло'}];
function today(){var w=WEEK[wd()],f=fest(),o={wd:wd(),mg:w.mg,ac:w.ac,board:!!w.board,easy:!!w.easy,ussr:!!w.ussr,task2:!!w.task2,chest:!!w.chest};
  try{var vt=window.VMG&&VMG.today&&VMG.today();if(vt&&vt.n)o.mg=vt.n;}catch(e){}
  if(f){var fn=f;try{fn=TN[f].n;}catch(e){}o.ac='Праздник «'+fn+'»: праздничные вопросы — очки ×1,5 · '+o.ac;o.fest=f;}return o;}
// множитель очков знатока по акценту дня (CAR.onAnswer)
function mul(q,p,mode){var w=WEEK[wd()],m=1;if(w.easy&&p<=200)m*=2;if(w.ussr&&q&&q.t==='ussr')m*=1.5;var f=fest();if(f&&q&&q.t===f)m*=1.5;return m;}

/* ---------- состояние ---------- */
function fixS(){
  if(!isO(S.tdS)){var g=isO(S.lg)?S.lg:null; // перенос: гостинцы (S.lg = {d, n}) → серия входа 30 дней
    S.tdS={n:g?Math.min(29,num(g.n)):0,d:g?num(g.d):0,cy:0,rs:0,fr:[],st:now()};} // прежние гостинцы (взято n) — продолжаем с того же дня
  var s=S.tdS;s.n=Math.min(29,Math.floor(num(s.n)));s.d=num(s.d);s.cy=num(s.cy);s.rs=num(s.rs);s.st=num(s.st)||now();if(s.st>now())s.st=now();
  if(!Array.isArray(s.fr))s.fr=[];s.fr=s.fr.filter(function(x){return typeof x==='string';}).slice(0,20);
  if(!isO(S.td)||S.td.d!==dk())S.td=fresh();
  var d=S.td;if(!isO(d.m))d.m={};if(!Array.isArray(d.tk))d.tk=tasksFor(dk());d.q=num(d.q);d.sl=num(d.sl);d.ch=num(d.ch);d.all=num(d.all);d.row=num(d.row);
}
function fresh(){var t=dk();return{d:t,q:0,qi:'',tk:tasksFor(t),m:{},sl:0,ch:0,all:0,row:0,ask:0};}
function fix(){try{fixS();}catch(e){S.tdS=null;S.td=null;try{fixS();}catch(e2){}}}
function merge(d){if(!d)return;fix();
  if(isO(d.tdS)){var a=S.tdS,b=d.tdS,ka=a.cy*30+a.n,kb=num(b.cy)*30+num(b.n);
    if(kb>ka||kb===ka&&num(b.d)>a.d){a.n=Math.min(29,num(b.n));a.d=num(b.d);a.cy=num(b.cy);}
    a.rs=Math.max(a.rs,num(b.rs));a.st=Math.max(a.st,Math.min(now(),num(b.st)));
    if(Array.isArray(b.fr))for(var i=0;i<b.fr.length;i++)if(typeof b.fr[i]==='string'&&a.fr.indexOf(b.fr[i])<0)a.fr.push(b.fr[i]);}
  if(isO(d.td)&&d.td.d===S.td.d){var x=S.td,y=d.td;x.q=Math.max(x.q,num(y.q));x.sl=Math.max(x.sl,num(y.sl));x.ch=Math.max(x.ch,num(y.ch));x.all=Math.max(x.all,num(y.all));
    if(isO(y.m))for(var k in y.m)if(y.m[k])x.m[k]=1;
    if(Array.isArray(y.tk))for(var j=0;j<x.tk.length&&j<y.tk.length;j++)if(y.tk[j]&&y.tk[j].k===x.tk[j].k){x.tk[j].p=Math.max(x.tk[j].p,num(y.tk[j].p));x.tk[j].r=Math.max(x.tk[j].r,num(y.tk[j].r));}}
}
function sd(){fix();return S.td;}

/* ---------- задания дня: три в день (по одному из трёх корзин), одинаковые у всех по дате ---------- */
var TASKS={
 cor:{n:15,t:function(n){return 'Дай '+n+' верных ответов';}},
 pass:{n:2,t:function(n){return 'Пройди '+n+' уровня лестницы';}},
 row:{n:5,t:function(n){return n+' верных ответов подряд';}},
 p400:{n:3,t:function(n){return 'Ответь верно на '+n+' вопроса ценой 400 и больше';}},
 top:{n:5,t:function(n,a){return 'Ответь верно на '+n+' вопросов в теме «'+tn(a)+'»';}},
 wk:{n:1,t:function(){var w='';try{w=tn(weekTopic());}catch(e){}return 'Пройди уровень в теме недели'+(w?' «'+w+'»':'');}},
 nh:{n:1,t:function(){return 'Пройди уровень без подсказок';}},
 day7:{n:7,t:function(n){return 'Викторина дня: '+n+' верных или больше';}},
 hard:{n:2,t:function(n){return 'Ответь верно на '+n+' вопроса за 500';}},
 bd3:{n:3,t:function(n){return 'На табло ответь верно на '+n+' вопроса';},need:function(){return boardOn();}},
 mg2:{n:2,t:function(n){return 'Сыграй '+n+' затеи';},need:function(){return !!window.VMG;}},
 fest:{n:5,t:function(n){return 'Праздник! Ответь верно на '+n+' праздничных вопросов';}}};
function fest(){try{return window.VTOP&&VTOP.festDay?VTOP.festDay(now()):null;}catch(e){return null;}}
var BASK=[['cor','pass','row'],['p400','top','wk','nh'],['day7','hard','bd3','mg2']];
function tn(t){try{return TN[t].n;}catch(e){return t||'';}}
function tasksFor(t){var R=rng(t*131+7),out=[];
  for(var b=0;b<BASK.length;b++){var c=BASK[b].filter(function(k){return !TASKS[k].need||TASKS[k].need();});var k=c[Math.floor(R()*c.length)],a='';
    if(k==='top'){try{var ts=TK_list();a=ts[Math.floor(R()*ts.length)];}catch(e){a='ussr';}}
    if(b===2&&fest())k='fest'; // праздник (FEST): третье задание — праздничное
    if(k==='p400'&&(S.lvl||0)<4)k='cor';out.push({k:k,a:a,n:TASKS[k].n,p:0,r:0});}
  return out;}
function TK_list(){try{return TK.slice();}catch(e){return ['ussr'];}} // TK — список тем игры (index.html)
function tText(x){return TASKS[x.k]?TASKS[x.k].t(x.n,x.a):x.k;}
// первый уровень новичка (страховка Михалыча) — без заданий: награда первого уровня как была (first_test A5)
function tProg(k,inc,set){if(!((S.lvl||0)>=1||(S.games||0)>=2))return false;var d=sd(),ch=false;for(var i=0;i<d.tk.length;i++){var x=d.tk[i];if(x.k!==k||x.r)continue;
  var p=set!=null?Math.max(x.p,set):x.p+(inc||0);if(p!==x.p){x.p=Math.min(x.n,p);ch=true;}
  if(x.p>=x.n&&!x.r){x.r=1;taskDone(x);}}return ch;}
var evq=[]; // новости для окна итога/тоста
function taskDone(x){var c=C().task,m=today().task2?2:1,coins=c.c*m;try{S.coins+=coins;STAT.earn('quest',coins);}catch(e){}CAR.add(c.oz,'task');
  evq.push('✅ Задание: '+tText(x)+' — +'+coinsTxt(coins)+', +'+c.oz+' очков');try{STAT.ev('task',{k:x.k});}catch(e){}
  var d=sd();if(!d.all&&d.tk.every(function(y){return y.r;})){d.all=1;var b=c.all*m;season(15,'td');try{S.coins+=b;STAT.earn('quest',b);}catch(e){}evq.push('✅ Все три задания! +'+coinsTxt(b));}}

/* ---------- ответы (answerHook): задания + серия «подряд» ---------- */
var lad={h:0};
function onAnswer(o){try{if(!o)return;fix();var d=sd(),q=null;try{q=QI[o.id];}catch(e){}
  if(o.mode==='lad'||o.mode==='ladder'){if(o.hint)lad.h=1;}
  if(o.mode==='qday')return;
  if(!o.ok){d.row=0;return;}
  d.row++;d.c10=(d.c10||0)+1;var p=+o.price||0;if(!(p>=100))try{p=priceOf(q);}catch(e){}
  tProg('cor',1);tProg('row',0,d.row);if(p>=400)tProg('p400',1);if(p>=500)tProg('hard',1);
  if(q)for(var i=0;i<d.tk.length;i++)if(d.tk[i].k==='top'&&d.tk[i].a===q.t)tProg('top',1);
  if(/^(board|bday|bcup|bfin)$/.test(o.mode||''))tProg('bd3',1);
  var fd=fest();if(fd&&q&&q.t===fd)tProg('fest',1);
  check();
}catch(e){}}
// конец лестницы (resultSlots): уровни, тема недели, без подсказок
function d0(){return sd();}
function onLadder(ctx){try{var g=ctx||window.G;if(!g||!g.res)return;var good=g.res.filter(function(x){return x===1;}).length,pass=good>=5;
  if(g.mode&&g.mode!=='lad'){lad.h=0;return;}
  var hinted=lad.h||(g.life&&Object.keys(g.life).length>0);lad.h=0;
  if(pass){d0().m.lv=1;tProg('pass',1);var wt='';try{wt=weekTopic();}catch(e){}if(g.topic===wt)tProg('wk',1);if(!hinted)tProg('nh',1);}
  check();}catch(e){}}

/* ---------- пять дел ---------- */
function boardOn(){try{return !!(window.BOARD&&BOARD.openDay)&&(S.lvl||0)>=4;}catch(e){return false;}} // табло — с 5-го уровня (BOARD OPEN_LVL)
function deals(){var d=sd(),t=dk(),dq=false;try{dq=S.daily[t]!=null;}catch(e){}
  var bd=boardOn(),mg=!!window.VMG,a=[];
  a.push({k:'qd',ic:'❓',n:'Вопрос дня',s:d.q?(d.q===1?'верно! +'+C().qday+' очков':'байку рассказал'):'Михалыч спросит одно трудное',ok:d.q>0});
  a.push({k:'dq',ic:'📅',n:'Викторина дня',s:dq?'сыграно: '+S.daily[t]+' из 10':'10 вопросов на весь двор',ok:dq});
  if(bd){var bdd=!!d.m.bd,bi=null;try{bi=BOARD.day&&BOARD.day();if(bi&&bi.done)bdd=true;}catch(e){}
    a.push({k:'bd',ic:'📺',n:'Табло дня',s:bdd?'сыграно'+(bi&&bi.score!=null?': '+bi.score+(bi.place?' · '+bi.place+'-е место':''):''):'одно табло на весь двор',ok:bdd});}
  else a.push({k:'lv',ic:'🪜',n:'Лестница дня',s:d.m.lv?'уровень пройден':'пройди один уровень',ok:!!d.m.lv});
  var vt=null;try{vt=window.VMG&&VMG.today?VMG.today():null;}catch(e){}
  // FIX1 (аудит: итог «2 из 5», главный «1/5»): затея дня открывается в конце первой лестницы и подменяла уже выполненное «Десять верных» — выполненное не отнимаем
  var c10=Math.min(10,d.c10||0),mgd=!!d.m.mg||!!(vt&&vt.done);
  if(mg&&vt&&(mgd||c10<10))a.push({k:'mg',ic:vt.ic||'🧩',n:'Затея дня',s:mgd?'сыграно: '+vt.n:vt.n+(vt.rw?' · до +'+vt.rw+' 💰':''),ok:mgd});
  else a.push({k:'c10',ic:'🎯',n:'Десять верных',s:c10>=10?'есть!':c10+' из 10',ok:c10>=10});
  var td=d.tk.filter(function(x){return x.r;}).length;a.push({k:'tk',ic:'✅',n:'Задания дня',s:td+' из 3',ok:td>=3});
  return a;}
function count(){return deals().filter(function(x){return x.ok;}).length;}
function season(n,k){try{if(window.YARD&&YARD.seasonAdd)YARD.seasonAdd(n,k);}catch(e){}}
function check(){var d=sd();if(!d.sl&&count()>=3){d.sl=1;if(CAR.seal()){evq.push('🔖 Печать двора за 3 дела из 5! Открой 🎁 сундук дня');season(10,'seal');}}
  try{save();}catch(e){}}
function mark(k){var d=sd();d.m[k]=1;check();}
function ev(k,o){if(k==='mg'){tProg('mg2',1);mark('mgx');}else if(k==='board')tProg('bd3',(o&&o.n)||0);check();}

/* ---------- сундук дня ---------- */
function openChest(){var d=sd();if(!d.sl||d.ch)return;d.ch=1;var n=today().chest?C().chestSun:C().chest;try{S.coins+=n;STAT.earn('chest',n);updCoins();SND.coin();}catch(e){}save();
  var yard=window.YARD&&typeof YARD.stampPick==='function';
  modal('<div class="av">'+portrait('mihalych','happy')+'</div><h2>🎁 Сундук дня</h2><p class="coins-won">+'+coinsTxt(n)+'</p>'+
    '<p>Три дела из пяти — и печать двора в копилку. Так держать, сосед!</p>'+(yard?'<p class="goal">📮 И марку на выбор — сейчас покажу.</p>':'')+
    '<div class="row"><button class="btn accent" id="tdChOk">Спасибо!</button></div>');
  $('tdChOk').onclick=function(){hideModal();if(yard){try{YARD.stampPick(function(id){if(id==null){try{S.coins+=10;STAT.earn('chest',10);updCoins();save();}catch(e){}toast('📮 Все марки уже есть — вот ещё +'+coinsTxt(10));}render();});return;}catch(e){}}render();};}

/* ---------- вопрос дня Михалыча: один трудный вопрос, одинаковый у всех, не из викторины дня ---------- */
function qid(t){try{var day={};try{seededSet(t*7919+13).qs.forEach(function(i){day[i]=1;});}catch(e){}
  var R=rng(t*104729+3),c=QS.filter(function(q){return q.d===3&&!day[q.i]&&q.x;});if(!c.length)c=QS.filter(function(q){return q.d===3;});
  return c[Math.floor(R()*c.length)].i;}catch(e){return '';}}
function openQday(){if(typeof qReady!=='undefined'&&!qReady){try{qWait(openQday);}catch(e){}return;}var d=sd(),q=null;try{q=QI[d.qi];}catch(e){}if(!q){d.qi=qid(d.d);try{q=QI[d.qi];}catch(e){}}if(!q)return;
  try{STAT.screen('qday');}catch(e){}d.ask=1;save();
  var tq=null;try{tq=QI[qid(dk(1))];}catch(e){}
  if(d.q){ // уже ответил — показать байку ещё раз
    modal('<div class="av">'+portrait('mihalych',d.q===1?'happy':'norm')+'</div><h2>❓ Вопрос дня</h2><p class="td-q">'+esc(q.q)+'</p><p class="goal">Ответ: <b>'+esc(q.a[0])+'</b></p>'+(q.x?'<p class="quote">'+esc(q.x)+'</p>':'')+
      (tq?'<p class="goal tmr">Завтра спрошу про «'+esc(tn(tq.t))+'»</p>':'')+'<div class="row"><button class="btn accent" id="tdQOk">Хорошо</button></div>');
    $('tdQOk').onclick=function(){hideModal();render();};return;}
  var R=rng(d.d*17+5),perm=shuffle([0,1,2,3],R),h='';
  for(var a=0;a<4;a++)h+='<button class="btn td-a" data-k="'+a+'">'+esc(q.a[perm[a]])+'</button>';
  modal('<div class="av">'+portrait('mihalych','norm')+'</div><h2>❓ Михалыч у подъезда</h2><p class="td-sub">Вопрос дня · «'+esc(tn(q.t))+'» · трудный. Верно — +'+C().qday+' очков знатока.</p>'+
    '<p class="td-q">'+esc(q.q)+'</p><div class="td-as">'+h+'</div><div class="row"><button class="btn" id="tdQLater">Потом</button></div>');
  try{fitCard();}catch(e){}
  $('tdQLater').onclick=function(){hideModal();render();};
  var bs=document.querySelectorAll('#mcard .td-a');for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var k=+this.dataset.k,ok=perm[k]===0;
    d.q=ok?1:2;if(ok){CAR.add(C().qday,'qday');try{SND.right();}catch(e){}}else try{SND.wrong();}catch(e){}
    try{CAR.fire({id:q.i,ok:ok,hint:0,mode:'qday',step:0,price:500});}catch(e){}
    check();
    modal('<div class="av">'+portrait('mihalych',ok?'happy':'sad')+'</div><h2>'+(ok?'Верно! +'+C().qday+' очков':'Эх, мимо…')+'</h2><p class="td-q">'+esc(q.q)+'</p><p class="goal">Ответ: <b>'+esc(q.a[0])+'</b></p>'+
      (q.x?'<p class="quote">'+(ok?'А знаешь байку? ':'Не беда — вот тебе байка: ')+esc(q.x)+'</p>':'')+
      (tq?'<p class="goal tmr">Завтра спрошу про «'+esc(tn(tq.t))+'»</p>':'')+'<div class="row"><button class="btn accent" id="tdQOk">Хорошо</button></div>');
    try{fitCard();}catch(e){}$('tdQOk').onclick=function(){hideModal();render();flush();};};}

/* ---------- серия входа 30 дней (вместо гостинцев 7 дней) ---------- */
// пропуск одного дня серию не рвёт; пропуск 2+ дней — откат к началу текущей недели серии (1/8/15/22-й день), вернуть — за ролик раз в 7 дней
function serState(){fix();var s=S.tdS,t=dk(),claimed=s.d===t,gap=s.d?dayDiff(s.d,t):0,n=s.n,broken=false,from=n;
  if(!claimed&&s.d&&gap>2){broken=true;n=Math.floor(n/7)*7;}
  var cur=C().series[n%30],aft=C().series[(n+(claimed?0:1))%30];
  return{today:claimed,n:claimed?n:n,day:(claimed?n:n+1),next:cur.c,nx:cur.x||'',after:aft.c,broken:broken,from:from,canRestore:broken&&adRestoreOk()&&from>n};}
function adRestoreOk(){var s=S.tdS;return !s.rs||dayDiff(s.rs,dk())>=7;}
// для index.html: giftState() / claimGift() — прежний формат {today,n,next,after}
function giftState(){var x=serState();return{today:x.today,n:x.n,next:x.next,after:x.after};}
function claim(){var x=serState();if(x.today)return 0;var s=S.tdS,it=C().series[x.n%30];
  s.n=x.n+1;s.d=dk();if(s.n>=30){s.n=0;s.cy++;}
  var c=it.c;try{S.coins+=c;STAT.earn('gift',c);}catch(e){}
  if(it.x)prize(it.x);
  try{STAT.ev('ser',{n:x.n+1,cy:s.cy});}catch(e){}
  try{save();updCoins();}catch(e){}return c;}
function prize(x){var s=S.tdS,y=window.YARD&&typeof YARD.gift==='function';
  if(x.indexOf('frame:')===0){var f=x.slice(6);if(s.fr.indexOf(f)<0)s.fr.push(f);evq.push('🖼 Рамка «'+((CAR.FRAMES[f]||{}).n||f).replace(/[«»]/g,'')+'» — за серию!');return;}
  if(y){try{YARD.gift(x==='stamp'?'stamp':'deco',null,'ser');evq.push(x==='stamp'?'📮 Марка за серию входа!':'🌼 Украшение двора за месяц серии!');return;}catch(e){}}
  if(x==='deco'){if(s.fr.indexOf('month')<0)s.fr.push('month');evq.push('🖼 Рамка «Месяц во дворе» — за 30 дней!');}}
function restore(){var x=serState();if(!x.canRestore)return;var s=S.tdS;
  if(adHold('ser'))return;hideModal();STAT.place('ser');var done=false;
  var ok=function(){if(done)return '';done=true;s.d=dk(-1);s.rs=dk();s.n=x.from;save();toast('🔥 Серия возвращена: день '+(x.from+1));return 'серия возвращена';};
  showRewarded(function(){ok();showSeries();},function(w){if(w==='wait')showSeries();},ok);}
function showSeries(){try{STAT.screen('gift');}catch(e){}var x=serState(),cells='',ser=C().series,pos=x.today?x.n-1:x.n;if(x.today&&x.n===0)pos=29;
  for(var i=0;i<30;i++){var it=ser[i],done=i<pos||x.today&&i===pos,tod=!x.today&&i===pos;
    cells+='<div class="sd'+(done?' done':'')+(tod?' today':'')+(it.x?' d7':'')+'"><small>'+(i+1)+'</small>'+(it.x?(it.x==='stamp'?'📮':it.x==='deco'?'🌼':'🖼'):'')+'+'+it.c+'</div>';}
  var st=null;try{st=streakState();}catch(e){}
  modal('<div class="av">'+portrait('mihalych','happy')+'</div><h2>🔥 Серия входа · день '+x.day+' из 30</h2>'+
    '<p>Заходи каждый день — гостинец Михалыча. На 7, 14, 21 и 30-й день — особый подарок. Пропустил один день — серия не рвётся.</p>'+
    (x.broken?'<p class="goal">Ты пропустил несколько дней — серия вернулась к '+(x.n+1)+'-му дню.'+(x.canRestore?' Можно вернуть '+(x.from+1)+'-й день за ролик (раз в неделю).':'')+'</p>':'')+
    '<div class="streak ser30">'+cells+'</div>'+(st?'<p class="goal">📅 Викторина дня: серия '+(st.claimed?st.day:Math.max(0,st.day-1))+' · сегодня '+(st.claimed?'✓':'+'+STREAK[st.day-1]+' за серию')+'</p>':'')+
    '<div class="row">'+(x.today?'':'<button class="btn accent" id="gTake">🎁 Забрать +'+coinsTxt(x.next)+'</button>')+
    (x.canRestore&&adBtnOk()?'<button class="btn" id="tdSerAd">📺 Вернуть серию за рекламу</button>':'')+
    '<button class="btn" id="mCancel">Закрыть</button></div>');
  try{fitCard();}catch(e){}
  if($('gTake'))$('gTake').onclick=function(){var a=claim();try{SND.coin();}catch(e){}toast('🎁 +'+coinsTxt(a));showSeries();flush();};
  if($('tdSerAd')){try{STAT.offer('ser');}catch(e){}$('tdSerAd').onclick=restore;}
  $('mCancel').onclick=function(){hideModal();render();};}

/* ---------- заначка Михалыча: копится, пока тебя нет (4 💰/ч, до 40); ×2 за ролик — только когда монет не хватает ---------- */
function stash(){fix();var s=S.tdS,h=(now()-s.st)/36e5;return Math.max(0,Math.min(C().stash.max,Math.floor(h*C().stash.per)));}
function stashFull(){var s=S.tdS;return Math.max(0,Math.ceil((C().stash.max-stash())/C().stash.per));}
var NEED=50; // «не хватает»: меньше, чем на вторую попытку (COST.second) или чем просит модуль (TD.stashNeed)
function short(need){var n=need||NEED;try{n=need||COST.second;}catch(e){}return (S.coins||0)<n;}
function takeStash(x2,need){var n=stash();if(n<=0)return 0;var s=S.tdS;s.st=now();var a=n*(x2?2:1);try{S.coins+=a;STAT.earn(x2?'ad':'chest',a);updCoins();SND.coin();}catch(e){}save();toast('💰 Заначка Михалыча: +'+coinsTxt(a));try{STAT.ev('stash',{n:a,x2:x2?1:0});}catch(e){}return a;}
function openStash(need){var n=stash(),sh=short(need),ad=false;try{ad=sh&&n>0&&adBtnOk();}catch(e){}
  modal('<div class="av">'+portrait('mihalych','happy')+'</div><h2>💰 Заначка Михалыча</h2>'+
    '<p>Пока тебя не было, я монетки собирал: '+C().stash.per+' в час, до '+C().stash.max+'. Забирай, когда нужно.</p><p class="coins-won">'+coinsTxt(n)+'</p>'+
    (n<C().stash.max?'<p class="goal">Полная — через '+stashFull()+' ч.</p>':'<p class="goal">Заначка полная — забирай, а то копить некуда.</p>')+
    '<div class="row">'+(n>0?'<button class="btn accent" id="tdStTake">Забрать +'+coinsTxt(n)+'</button>':'')+
    (ad?'<button class="btn" id="tdStAd">📺 Забрать ×2 за рекламу</button>':'')+'<button class="btn" id="mCancel">Закрыть</button></div>');
  if($('tdStTake'))$('tdStTake').onclick=function(){hideModal();takeStash(false);render();};
  if($('tdStAd')){try{STAT.offer('stash');}catch(e){}$('tdStAd').onclick=function(){if(adHold('stash'))return;hideModal();STAT.place('stash');var done=false;
    var n0=stash(); // FIX1 (AUD-ADS 3): поздний «досмотрел», а заначку уже забрали обычной кнопкой — даём вторую половину (то, что было ×1), а не «+0»
    var give=function(){if(done)return '';done=true;var a=0;if(stash()>0)a=takeStash(true);else if(n0>0){a=n0;try{S.coins+=a;STAT.earn('ad',a);updCoins();SND.coin();}catch(e){}save();}render();return a?'заначка ×2: +'+coinsTxt(a):'';};
    showRewarded(function(){give();},function(w){if(w==='wait')openStash(need);},give);};}
  $('mCancel').onclick=function(){hideModal();render();};}

/* ---------- окно «Задания дня» ---------- */
function openTasks(){var d=sd(),h='';for(var i=0;i<d.tk.length;i++){var x=d.tk[i];
    h+='<div class="td-task'+(x.r?' done':'')+'"><span>'+(x.r?'✅':'▫️')+'</span><span><b>'+esc(tText(x))+'</b><small>'+(x.r?'готово':x.p+' из '+x.n)+' · +'+coinsTxt(C().task.c*(today().task2?2:1))+', +'+C().task.oz+' очков</small><span class="bar"><i style="width:'+Math.round(100*x.p/x.n)+'%"></i></span></span></div>';}
  modal('<h2>✅ Задания дня</h2>'+h+'<p class="goal">Все три — ещё +'+coinsTxt(C().task.all*(today().task2?2:1))+'. Новые задания — завтра.</p><div class="row"><button class="btn accent" id="mCancel">Играть!</button></div>');
  $('mCancel').onclick=function(){hideModal();render();};}

/* ---------- «Сегодня во дворе»: плитки ленты главного (homeSlots UX) + окно со всеми пятью делами ---------- */
function body(){fix();var a=deals(),n=a.filter(function(x){return x.ok;}).length,d=sd(),x=serState(),sn=stash(),t=today(),h='';
  h+='<div class="td-box" id="tdBox"><div class="td-head"><span class="td-ring" style="--p:'+Math.round(100*Math.min(n,5)/5)+'"><b>'+n+'</b>/5</span><span class="td-ht"><b>Сегодня во дворе</b><small>'+esc(DN[t.wd]+': '+t.ac)+'</small></span></div><div class="td-list">';
  for(var i=0;i<a.length;i++)h+='<button class="td-c'+(a[i].ok?' ok':'')+'" data-k="'+a[i].k+'" type="button"><span class="td-ic">'+a[i].ic+'</span><span class="td-n"><b>'+esc(a[i].n)+'</b><small>'+esc(a[i].s)+'</small></span><span class="td-ck">'+(a[i].ok?'✓':'›')+'</span></button>';
  h+='</div><div class="td-seal">'+(d.sl?(d.ch?'🔖 Печать двора получена · сундук открыт':'<button class="btn accent td-chest" id="tdChest" type="button">🎁 Открыть сундук дня</button>'):'🔖 3 дела из 5 → печать двора + 🎁 сундук (осталось '+Math.max(0,3-n)+')')+'</div>';
  h+='<div class="td-row"><button class="td-mini'+(x.today?'':' hot')+'" id="tdSer" type="button">🔥 Серия <b>'+x.day+'</b>/30<small>'+(x.today?'завтра +'+x.after:'забери +'+x.next)+'</small></button>'+
    '<button class="td-mini'+(sn>=C().stash.max?' hot':'')+'" id="tdSt" type="button">💰 Заначка <b>'+sn+'</b><small>'+(sn>=C().stash.max?'полная!':'до '+C().stash.max)+'</small></button></div>'+car()+'</div>';
  return h;}
var DN=['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
// строка карьеры: район, печати, финал (шапку «кто я» со званием рисует UX)
function car(){var c=CAR.look();
  return '<button class="td-car'+(c.fin?' hot':'')+'" id="tdCar" type="button">'+c.ic+' <b>'+esc(c.dist)+'</b> · 🔖 '+c.seals+' · <span>'+esc(c.s)+'</span></button>';}
var todayOn=false;
function openToday(){try{STAT.screen('today');}catch(e){}check();modal('<div class="td-modal">'+body()+'</div><div class="row"><button class="btn" id="mCancel">Закрыть</button></div>');todayOn=true;
  bind($('mcard'));$('mCancel').onclick=function(){todayOn=false;hideModal();render();};flush();}
function bind(root){root=root||document;var q=function(s){return root.querySelector(s);};
  if(q('#tdCar'))q('#tdCar').onclick=function(){try{SND.tap();}catch(e){}todayOn=false;hideModal();CAR.look().go();};
  var cs=root.querySelectorAll('.td-c');for(var i=0;i<cs.length;i++)cs[i].onclick=function(){try{SND.tap();}catch(e){}todayOn=false;hideModal();go(this.dataset.k);};
  if(q('#tdChest'))q('#tdChest').onclick=function(){todayOn=false;openChest();};
  if(q('#tdSer'))q('#tdSer').onclick=function(){try{SND.tap();}catch(e){}todayOn=false;showSeries();};
  if(q('#tdSt'))q('#tdSt').onclick=function(){try{SND.tap();}catch(e){}todayOn=false;openStash();};}
function go(k){
  if(k==='qd')openQday();
  else if(k==='dq'){try{openDaily();}catch(e){}}
  else if(k==='bd'){try{UI.go('bday');}catch(e){try{BOARD.openDay();}catch(e2){}}}
  else if(k==='mg'){try{VMG.today().play();}catch(e){}}
  else if(k==='tk')openTasks();
  else if(k==='lv'||k==='c10'){try{if(lcurOk())resumeLadder();else if(window.UIH&&LK.on())UIH.play();else openTopics();}catch(e){}}}
// обновить главный (после окон «Сегодня», вопроса дня, сундука, заначки)
function render(){try{if(modalOn)return;var m=$('scr-menu');if(!m||!m.classList.contains('on'))return;if(window.UIH&&UIH.render)UIH.render();else openMenu();}catch(e){}}
function tile(o){try{return UI.tile(o);}catch(e){return '<button class="hsT"><b>'+esc(o.t)+'</b></button>';}}
function first(el,fn){var b=el.querySelector('button')||el.firstChild;if(b)b.onclick=function(){try{SND.tap();}catch(e){}fn();};}
var TILES=[
 {id:'car-fin',order:0,render:function(){var f=CAR.finState();if(!f||!f.ready)return null;return tile({ic:'🏆',t:'Финал района',s:f.ch.n+(f.free?' ждёт тебя!':' — завтра снова'),tag:'финал',cls:'red car-tfin'});},mount:function(el){first(el,CAR.openFinal);}},
 {id:'car-today',order:1,render:function(){fix();check();var n=count(),d=sd();
   return tile({ic:'📋',t:'Сегодня '+n+'/5',s:d.sl?(d.ch?'печать двора есть ✓':'открой сундук дня!'):'ещё '+Math.max(0,3-n)+' — и печать двора',tag:d.sl&&!d.ch?'сундук':'',cls:'grn car-ttd'});},mount:function(el){first(el,openToday);autoQ();flush();}},
 {id:'car-qday',order:2,render:function(){var d=sd();if(d.q||(S.games||0)<1)return null;return tile({ic:'❓',t:'Вопрос дня',s:'Михалыч ждёт у подъезда',tag:'+'+C().qday,cls:'yel'});},mount:function(el){first(el,openQday);}},
 {id:'car-tasks',order:3,render:function(){var d=sd(),k=d.tk.filter(function(x){return x.r;}).length;if((S.games||0)<1)return null;var nx=d.tk.filter(function(x){return !x.r;})[0];
   return tile({ic:'✅',t:'Задания: '+k+' из 3',s:nx?tText(nx)+' · '+nx.p+'/'+nx.n:'все сделаны!',cls:k>=3?'':'car-ttk'});},mount:function(el){first(el,openTasks);}},
 {id:'car-stash',order:45,render:function(){var n=stash();if(n<10||(S.games||0)<1)return null;return tile({ic:'💰',t:'Заначка Михалыча',s:n>=C().stash.max?'полная — забирай!':'накопилось '+n+' 💰',tag:'+'+n,cls:n>=C().stash.max?'grn':''});},mount:function(el){first(el,function(){openStash();});}},
 {id:'car-day',order:55,render:function(){if((S.lvl||0)<4)return null;/* FIX1: «акцент дня» (Табло дня, Кубок) — когда табло открыто */var t=today();return tile({ic:'🗓',t:DN[t.wd],s:t.ac,cls:'car-tday'});},mount:function(el){first(el,openToday);}}];
// вопрос дня — сам при первом заходе в меню за день (не новичку и не поверх другого окна)
function autoQ(){var d=sd();if(d.q||d.ask||(S.games||0)<2)return;setTimeout(function(){try{if(modalOn||!$('scr-menu').classList.contains('on'))return;}catch(e){return;}openQday();},700);}
function flush(){if(!evq.length)return;var t=evq.join(' · ');evq=[];try{toast(t);}catch(e){}}

/* ---------- окно итога лестницы (resultSlots): задания, печать ---------- */
function resultHtml(ctx){onLadder(ctx&&ctx.G||ctx);var d=sd(),h='',n=count();
  if(evq.length)h+='<p class="goal tipl">'+esc(evq.join(' · '))+'</p>';evq=[];
  if(!d.sl&&n<3)h+='<p class="goal td-rs">📋 Сегодня '+n+' из 5 дел — ещё '+(3-n)+' до печати двора</p>';
  return h;}

/* ---------- регистрация в гнёздах UX (js/ui-core.js) ---------- */
['homeSlots','resultSlots','answerHook'].forEach(function(n){if(!Array.isArray(window[n]))window[n]=[];});
TILES.forEach(function(x){homeSlots.push(x);});
resultSlots.push({id:'car-today',order:20,render:function(ctx){return resultHtml(ctx)||null;}});
answerHook.push({id:'today',fn:onAnswer});
// табло дня доиграно (BOARD → UI.emit('board',res)) — дело засчитано сразу, печать — если набралось 3 из 5
try{if(window.UI&&UI.on)UI.on('board',function(r){try{if(r&&r.mode==='day'&&!r.quit){fix();sd().m.bd=1;check();}}catch(e){}});}catch(e){}
window.TD={fix:fix,merge:merge,today:today,mul:mul,deals:deals,count:count,check:check,mark:mark,ev:ev,openToday:openToday,body:body,render:render,
  giftState:giftState,claimGift:claim,showSeries:showSeries,stash:stash,openStash:openStash,stashNeed:function(n){if(short(n))openStash(n);},
  openQday:openQday,openTasks:openTasks,openChest:openChest,onAnswer:function(o){onAnswer(o);},onLadder:function(g){onLadder(g);},resultHtml:resultHtml,flush:flush,WEEK:WEEK};
try{fix();}catch(e){}
})();
