/* «Сегодня во дворе» — 5 дел дня, путевой лист + сундук дня, 3 задания, подарок вернувшемуся (поток CAR буста «Наш двор», 10.10.2026).
   Журнал hobby-analytics/release-i/vyezd-boost/logs/CAR.md; замысел — 04-meta-economy.md §2.4; числа — CAR.CFG (js/career.js, модель tools/econ_car.py).
   Грузится ПОСЛЕ основного скрипта и js/career.js. Наружу — window.TD. Поля сохранения: S.td (дела сегодняшнего дня), S.tdR (подарок вернувшемуся).
   Пять дел: 📅 двор дня · 📮 заказ жильца (js/orders.js) · 🎁 гостинец бабы Шуры · 🧩 затея дня (мини-игра MG0, источник day) · ✅ 3 задания.
   3 из 5 → 📄 путевой лист (CAR.list, 1 в день) + 🎁 сундук дня (содержимое видно заранее; показывается сам — карточкой в окне победы
   и окном на главном; «Забрать» — большая зелёная кнопка; без «×2 за рекламу»).
   Нет модуля — дело заменяется своим: заказы → «двор на ★★★», затея → «двор без аварий», двор дня закрыт (до 7-го двора) → «3 двора».
   Чужие модули (если есть): VYMG.today() → {id, n, ic, done, rw, play()} (MG0); ORD (orders.js); YARD.addParts(n, why) — детали 🔩
   (нет YARD — копим в S.td.pp, YARD заберёт TD.takeParts()). Другие сообщают о сделанном: TD.mark('mg'|'or'), TD.ev(k).
   Вставка — гнёзда UX: homeSlots (плитки ленты), winSlots (строки и сундук в окне победы), yardHook (итог двора). */
(function(){
'use strict';
function C(){return CAR.CFG;}
function tr(ru,en){try{return L(ru,en);}catch(e){return ru;}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function dk(o){try{return dayKey(o||0);}catch(e){var d=new Date();d.setDate(d.getDate()+(o||0));return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function num(x){return typeof x==='number'&&isFinite(x)&&x>=0?x:0;}
function now(){try{return nowMs();}catch(e){return Date.now();}}
function wd(){return new Date(now()).getDay();} // 0 — воскресенье
function dayDiff(a,b){function t(k){return Date.UTC(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100)/864e5;}return a&&b?Math.round(t(b)-t(a)):0;}
function done(){try{return S.levelsDone||0;}catch(e){return 0;}}
function ct(n){try{return coinsTxt(n);}catch(e){return n+' 💰';}}
function rgen(seed){try{return rng(seed);}catch(e){var a=seed>>>0;return function(){a=(a*1664525+1013904223)>>>0;return a/4294967296;};}}

/* ---------- состояние ---------- */
function fresh(){var t=dk();return{d:t,tk:tasksFor(t),m:{},n:{},l:0,ch:0,cs:0};}
function fixS(){
  if(!isO(S.td)||S.td.d!==dk()){var pp=isO(S.td)?num(S.td.pp):0;S.td=fresh();S.td.pp=pp;}
  var d=S.td;if(!isO(d.m))d.m={};if(!isO(d.n))d.n={};if(!Array.isArray(d.tk))d.tk=tasksFor(d.d);d.l=num(d.l);d.ch=num(d.ch);d.cs=num(d.cs);d.pp=num(d.pp);
  if(!isO(S.tdR))S.tdR={v:0,g:0};S.tdR.v=num(S.tdR.v);S.tdR.g=num(S.tdR.g);}
function fix(){try{fixS();}catch(e){S.td=null;S.tdR=null;try{fixS();}catch(e2){}}}
function merge(d){if(!d)return;fix();
  if(isO(d.tdR)){S.tdR.v=Math.max(S.tdR.v,num(d.tdR.v));S.tdR.g=Math.max(S.tdR.g,num(d.tdR.g));}
  if(isO(d.td)&&d.td.d===S.td.d){var x=S.td,y=d.td;x.l=Math.max(x.l,num(y.l));x.ch=Math.max(x.ch,num(y.ch));
    if(isO(y.m))for(var k in y.m)if(y.m[k])x.m[k]=1;if(isO(y.n))for(var k2 in y.n)x.n[k2]=Math.max(num(x.n[k2]),num(y.n[k2]));
    if(Array.isArray(y.tk))for(var j=0;j<x.tk.length&&j<y.tk.length;j++)if(y.tk[j]&&y.tk[j].k===x.tk[j].k){x.tk[j].p=Math.max(x.tk[j].p,num(y.tk[j].p));x.tk[j].r=Math.max(x.tk[j].r,num(y.tk[j].r));}}}
function sd(){fix();return S.td;}

/* ---------- задания дня: три (по одному из трёх корзин), одинаковые у всех по дате ---------- */
var TASKS={
 w3:{n:3,t:['Пройди {n} двора','Clear {n} yards']},
 w5:{n:5,t:['Пройди {n} дворов','Clear {n} yards'],min:20},
 nw:{n:2,t:['Пройди {n} новых двора','Clear {n} new yards']},
 cl:{n:2,t:['{n} двора без аварий','{n} yards with no crashes']},
 s3:{n:2,t:['{n} двора на ★★★','{n} yards with ★★★']},
 nh:{n:3,t:['{n} двора без подсказок и эвакуатора','{n} yards without hints or the tow truck']},
 amb:{n:1,t:['Выпусти скорую вовремя','Get the ambulance out in time'],min:6},
 pol:{n:1,t:['Пройди двор с полицией','Clear a yard with a police car'],min:12},
 tg:{n:1,t:['Двор без лишних ходов (не больше 2)','A yard with at most 2 extra moves'],min:4}};
var BASK=[['w3','w5','nw'],['cl','s3','nh'],['amb','pol','tg']];
function tasksFor(t){var R=rgen(t*131+7),out=[],u=0;try{u=S.unlocked||1;}catch(e){}
  for(var b=0;b<BASK.length;b++){var c=BASK[b].filter(function(k){return !TASKS[k].min||u>=TASKS[k].min;});if(!c.length)c=['w3'];var k=c[Math.floor(R()*c.length)];
    out.push({k:k,n:TASKS[k].n,p:0,r:0});}
  return out;}
function tText(x){var t=TASKS[x.k];if(!t)return x.k;return tr(t.t[0],t.t[1]).replace('{n}',x.n);}
var evq=[]; // новости для окна победы / тоста
function tProg(k,inc){if(done()<1)return;var d=sd();for(var i=0;i<d.tk.length;i++){var x=d.tk[i];if(x.k!==k||x.r)continue;
  x.p=Math.min(x.n,x.p+(inc||1));if(x.p>=x.n){x.r=1;taskDone(x);}}}
var tq={n:0,c:0,p:0,t:''}; // задания, сделанные в этом дворе — одной строкой в окне победы
function taskDone(x){var c=C().task;give(c.c,c.p,'quest');CAR.add(C().pts.task,'task');
  tq.n++;tq.c+=c.c;tq.p+=c.p;tq.t=tText(x);try{STAT.ev('task',{k:x.k});}catch(e){}
  var d=sd();if(!d.m.all&&d.tk.every(function(y){return y.r;})){d.m.all=1;give(c.all,0,'quest');tq.c+=c.all;tq.all=1;}}
// монеты + детали 🔩 (детали — YARD; без YARD копим до его прихода)
function give(coins,parts,why){if(coins>0){try{S.coins+=coins;ern(/^(chest|gift|night|quest)$/.test(why)?why:'quest',coins);updCoins();}catch(e){}}
  if(parts>0)parts0(parts,why);}
function parts0(n,why){try{if(window.YARD&&typeof YARD.addParts==='function'){YARD.addParts(n,why||'td');return;}}catch(e){}var d=sd();d.pp=num(d.pp)+n;}

/* ---------- итог двора (yardHook): задания, «свои» дела ---------- */
function isFirst(o){if(o.first!=null)return !!o.first;if(o.f!=null)return !!o.f;try{var l=CAR.last();if(l&&l.idx===(+o.lv||1)-1)return l.first;}catch(e){}return false;}
function G0(){try{return G;}catch(e){return null;}}
function onYard(o){try{if(!o)return;fix();var d=sd(),g=G0();
  var daily=!!o.daily||o.mode==='daily'||o.mode==='day';
  if(o.mode&&!daily&&!/^(n|norm|yard|fin)$/.test(o.mode)){if(o.ok)d.n.mw=num(d.n.mw)+1;check();return;} // режимы LVL — только «дворов за день»
  if(!o.ok){check();return;}
  var crashes=o.crashes!=null?num(o.crashes):(g&&g.crashes!=null?g.crashes:0),helps=o.hint!=null?num(o.hint)+num(o.tow):(g&&g.helps!=null?g.helps:0),stars=+o.stars||1;
  var first=isFirst(o);
  if(!daily)nightBonus(o,stars);
  d.n.w=num(d.n.w)+1;tProg('w3');tProg('w5');
  if(first||o.isNew)tProg('nw');
  if(!crashes){tProg('cl');d.n.cl=num(d.n.cl)+1;}
  if(stars>=3){tProg('s3');d.n.s3=num(d.n.s3)+1;}
  if(!helps)tProg('nh');
  if(g&&g.amb&&g.amb.done)tProg('amb');else if(o.amb)tProg('amb');
  if(g&&g.police>=0||o.pol)tProg('pol');
  var mv=g?g.moves:o.moves,nv=g&&g.vs?g.vs.length:0;if(nv&&mv!=null&&mv<=nv+2)tProg('tg');
  if(daily&&!d.m.dyp){d.m.dy=1;d.m.dyp=1;CAR.add(C().pts.daily,'daily');try{parts0(C().daily.p,'daily');}catch(e){}}
  check();
}catch(e){try{console.warn('TD yard',e);}catch(_){}}}

/* ---------- «Ночная смена» (UX: UI.night.on(), 20:00–6:00): монеты за двор ×2, доплата не больше CAR.CFG.night.cap в сутки ---------- */
// модель tools/econ_car.py: ×2 с потолком 40 — темп карьеры прежний (11/16 нед.), казуалу +12 % монет, упорному — потолок
function nightOn(){try{return !!(window.UI&&UI.night&&UI.night.on());}catch(e){return false;}}
var nightNow=0;
function nightLeft(){var nb=C().night||{};return Math.max(0,(nb.cap||0)-num(sd().n.nt));}
function nightBonus(o,stars){nightNow=0;var nb=C().night;if(!nb||!nightOn())return;var idx=o.idx!=null?+o.idx:(+o.lv||1)-1;
  var base=(4+2*stars)*(idx%10===9?2:1),add=Math.min(Math.round(base*((nb.mul||2)-1)),nightLeft());if(add<=0)return;
  var d=sd();d.n.nt=num(d.n.nt)+add;nightNow=add;give(add,0,'night');try{STAT.ev('night',{c:add,t:d.n.nt});}catch(e){}}

/* ---------- пять дел ---------- */
function dailyOpen(){try{return !dailyLocked();}catch(e){return done()>=6;}}
function vt(){try{if(!window.VYMG)return null;if(VYMG.today)return VYMG.today();
  // своими силами из оболочки MG0: dayId() — затея дня (одна на всех), S.vymg.d.z — сыграна сегодня с наградой
  if(!VYMG.dayId||(S.levelsDone||0)<4)return null;var id=VYMG.dayId();if(!id||!VYMG.REG||!VYMG.REG.by||!VYMG.REG.by[id])return null;
  var inf=VYMG.INFO[VYMG.IDS[id]]||{},z=S.vymg&&S.vymg.d,dn=!!(z&&z.z&&z.k===dk());
  return{id:id,n:inf.n||id,ic:inf.ic||'🧩',done:dn,rw:0,play:function(){VYMG.open(id,{mode:'day'});}};}catch(e){return null;}}
function ordT(){try{return window.ORD&&ORD.today?ORD.today():null;}catch(e){return null;}}
function deals(){var d=sd(),a=[],t=String(dk());
  // 1. двор дня (до 7-го двора закрыт — вместо него «3 двора»)
  if(dailyOpen()){var dq=false;try{dq=(S.daily[t]||0)>0;}catch(e){}if(dq)d.m.dy=1;
    a.push({k:'dy',ic:'📅',n:tr('Двор дня','Yard of the day'),s:dq?tr('пройден','cleared'):tr('один на весь двор','the same for everyone'),ok:dq});}
  else{var w=Math.min(3,num(d.n.w));a.push({k:'y3',ic:'🚗',n:tr('Три двора','Three yards'),s:w>=3?tr('есть!','done!'):w+tr(' из 3',' of 3'),ok:w>=3});}
  // 2. заказ жильца (orders.js) — или «двор на ★★★»
  var o=ordT();
  if(o)a.push({k:'or',ic:'📮',n:tr('Заказ: ','Request: ')+o.who,s:o.ok?tr('выполнен','done'):o.t,ok:!!o.ok||!!d.m.or});
  else a.push({k:'s3',ic:'⭐',n:tr('Двор на ★★★','A ★★★ yard'),s:num(d.n.s3)?tr('есть!','done!'):tr('пройди любой двор на три звезды','clear any yard with three stars'),ok:num(d.n.s3)>0});
  // 3. гостинец бабы Шуры
  var gf=false;try{gf=streakState().claimed;}catch(e){}
  a.push({k:'gf',ic:'🎁',n:tr('Гостинец бабы Шуры','Granny Shura’s gift'),s:gf?tr('забран','collected'):tr('ждёт тебя','waiting for you'),ok:gf});
  // 4. затея дня (мини-игра MG0) — или «двор без аварий»
  var v=vt();
  if(v&&v.n){var md=!!d.m.mg||!!v.done;a.push({k:'mg',ic:v.ic||'🧩',n:tr('Затея дня','Pastime of the day'),s:md?tr('сыграно: ','played: ')+v.n:v.n+(v.rw?' · 🔩 '+v.rw:''),ok:md});}
  else a.push({k:'cl',ic:'✨',n:tr('Чистый двор','A clean yard'),s:num(d.n.cl)?tr('есть!','done!'):tr('двор без единой аварии','a yard with no crashes'),ok:num(d.n.cl)>0});
  // 5. три задания
  var td=d.tk.filter(function(x){return x.r;}).length;a.push({k:'tk',ic:'✅',n:tr('Задания дня','Daily tasks'),s:td+tr(' из 3',' of 3'),ok:td>=3});
  return a;}
function count(){return deals().filter(function(x){return x.ok;}).length;}
// 3 из 5 → путевой лист (1 в день) + сундук дня
function check(){var d=sd(),n=count();
  if(n!==d.cs){d.cs=n;try{STAT.ev('today',{n:n});}catch(e){}}
  if(!d.l&&n>=3){d.l=1;if(CAR.list()){tq.l=1;evq.push('📄 '+tr('Путевой лист за 3 дела из 5!','A trip sheet for 3 jobs out of 5!'));}}
  try{save();}catch(e){}}
function mark(k){var d=sd();d.m[k]=1;if(k==='mg')CAR.add(C().pts.mg,'mg');check();}
function ev(k){if(k==='mg'||k==='or')mark(k);else check();}

/* ---------- сундук дня: содержимое видно заранее, показывается сам ---------- */
function chestN(){var c=C().chest;return{c:wd()===0?c.sun:c.c,p:c.p};}
function chestTxt(){var x=chestN();return '+'+ct(x.c)+' +'+x.p+' 🔩';}
function chestReady(){var d=sd();return !!d.l&&!d.ch;}
function takeChest(el){var d=sd();if(!d.l||d.ch)return 0;d.ch=1;var x=chestN();give(x.c,x.p,'chest');
  try{SND.coin();setTimeout(function(){SND.win();},200);}catch(e){}
  try{STAT.ev('chest',{k:'day',c:x.c});}catch(e){}
  try{save();}catch(e){}try{if(el)coinFx(x.c,el);}catch(e){}
  toast('🎁 '+tr('Сундук дня: ','Daily chest: ')+chestTxt());return x.c;}
function openChest(){if(!chestReady())return;try{STAT.screen('chest');}catch(e){}var r=CAR.rank();
  modal('<h2>🎁 '+tr('Сундук дня','Daily chest')+'</h2><div class="td-chest-big">🧰</div>'+
    shuraLine(tr('Три дела из пяти — путевой лист твой! А это от меня, заслужил.','Three jobs out of five — the trip sheet is yours! And this is from me, well earned.'))+
    '<p class="coins-won" id="tdChW">'+chestTxt()+'</p><p class="goal">📄 '+tr('Путевых листов: ','Trip sheets: ')+r.lists+'</p>'+
    '<div class="row"><button class="btn green td-take" id="tdChOk">'+tr('Забрать','Collect')+' '+chestTxt()+'</button></div>');
  $('tdChOk').onclick=function(){takeChest($('tdChW'));hideModal();render();setTimeout(function(){try{if(!G)maybeStreak();}catch(e){}},300);};}
function shuraLine(t){try{return shura(t);}catch(e){return '<p>'+esc(t)+'</p>';}}

/* ---------- подарок вернувшемуся (≥3 дней не было): 3/7/14 дней → 100/200/300 💰 + детали ---------- */
function retState(){fix();var r=S.tdR,t=dk();if(!r.v||r.g===t)return null;var gap=dayDiff(r.v,t);if(gap<3)return null;var tier=null,R=C().ret;
  for(var i=0;i<R.length;i++)if(gap>=R[i][0])tier=R[i];return tier?{gap:gap,c:tier[1],p:tier[2]}:null;}
function visit(){fix();var t=dk();if(S.tdR.v!==t){S.tdR.v=t;try{save();}catch(e){}}}
function openReturn(){var x=retState();if(!x)return false;S.tdR.g=dk();
  modal('<h2>'+tr('С возвращением! 🎁','Welcome back! 🎁')+'</h2>'+shuraLine(tr('Где пропадал? '+x.gap+' '+plural0(x.gap,'день','дня','дней')+' тебя не было! Двор без тебя совсем заставили. Держи гостинец — и за дело.',
      'Where have you been? '+x.gap+' days away! The yard got jammed without you. Here’s a little something — back to work.'))+
    '<p class="coins-won" id="tdRetW">+'+ct(x.c)+' +'+x.p+' 🔩</p>'+
    '<div class="row"><button class="btn green td-take" id="tdRetOk">'+tr('Забрать','Collect')+'</button></div>');
  $('tdRetOk').onclick=function(){give(x.c,x.p,'gift');try{SND.coin();coinFx(x.c,$('tdRetW'));}catch(e){}try{STAT.ev('ret',{g:x.gap,c:x.c});}catch(e){}
    visit();try{save();}catch(e){}hideModal();render();setTimeout(function(){try{maybeStreak();}catch(e){}},300);};
  return true;}
function plural0(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}

/* ---------- окно «Сегодня во дворе» (все пять дел) ---------- */
var DN=[['Воскресенье','Sunday'],['Понедельник','Monday'],['Вторник','Tuesday'],['Среда','Wednesday'],['Четверг','Thursday'],['Пятница','Friday'],['Суббота','Saturday']];
var AC=[['сундук дня побольше','a bigger daily chest'],['новый заказ жильца','a new neighbour request'],['задания дня','daily tasks'],['затея дня','pastime of the day'],['двор дня','yard of the day'],['пятничный выезд','Friday drive'],['кубок выходного дня','weekend cup']];
function body(){var a=deals(),n=a.filter(function(x){return x.ok;}).length,d=sd(),r=CAR.rank(),h='';
  h+='<div class="td-box"><div class="td-head"><span class="td-ring" style="--p:'+Math.round(100*Math.min(n,5)/5)+'"><b>'+n+'</b>/5</span><span class="td-ht"><b>'+tr('Сегодня во дворе','Today in the yard')+'</b><small>'+esc(tr(DN[wd()][0],DN[wd()][1]))+'</small></span></div><div class="td-list">';
  var k0=-1;for(var i=0;i<a.length;i++)if(!a[i].ok){k0=i;break;} /* KEYS: рамка клавиатуры начинается с первого несделанного дела */
  for(var i=0;i<a.length;i++)h+='<button class="td-c'+(a[i].ok?' ok':'')+'" data-k="'+a[i].k+'" type="button"'+(i===k0?' data-keys-default':'')+'><span class="td-ic">'+a[i].ic+'</span><span class="td-n"><b>'+esc(a[i].n)+'</b><small>'+esc(a[i].s)+'</small></span><span class="td-ck">'+(a[i].ok?'✓':'›')+'</span></button>';
  h+='</div><div class="td-seal">'+(d.l?(d.ch?'📄 '+tr('Путевой лист получен · сундук открыт','Trip sheet received · chest opened'):'<button class="btn green td-take" id="tdChest" type="button">🎁 '+tr('Забрать сундук дня','Collect the daily chest')+': '+chestTxt()+'</button>'):
    '📄 '+tr('3 дела из 5 → путевой лист + 🎁 сундук ','3 jobs of 5 → a trip sheet + 🎁 chest ')+chestTxt()+' ('+tr('осталось ','left ')+Math.max(0,3-n)+')')+'</div>';
  h+='<button class="td-car" id="tdCar" type="button">'+r.dist.ic+' <b>'+esc(r.name)+'</b> · 📄 '+r.lists+' · <span>'+esc(CAR.look().s)+'</span></button></div>';
  return h;}
function openToday(){try{STAT.screen('today');}catch(e){}fix();check();modal('<div class="td-modal" data-keys-hint="'+esc(tr('1–5 — дело · стрелки — выбор · Enter — нажать · Esc — закрыть','1–5 — job · arrows — select · Enter — press · Esc — close'))+'">'+body()+'</div><div class="row"><button class="btn" id="mCancel">'+tr('Закрыть','Close')+'</button></div>');
  bind($('mcard'));$('mCancel').onclick=function(){hideModal();render();};}
function bind(root){var q=function(s){return root.querySelector(s);};
  if(q('#tdCar'))q('#tdCar').onclick=function(){tap();hideModal();CAR.look().go();};
  var cs=root.querySelectorAll('.td-c');for(var i=0;i<cs.length;i++)cs[i].onclick=function(){tap();hideModal();go(this.dataset.k);};
  if(q('#tdChest'))q('#tdChest').onclick=function(){openChest();};}
function tap(){try{SND.tap&&SND.tap();}catch(e){}}
function go(k){
  if(k==='dy'){try{openDaily();}catch(e){}}
  else if(k==='gf'){try{showStreak();}catch(e){}}
  else if(k==='or'){try{ORD.open();}catch(e){}}
  else if(k==='mg'){playMg();}
  else if(k==='tk')openTasks();
  else{try{startLevel(Math.max(0,(S.unlocked||1)-1));}catch(e){}}}
function playMg(){var v=vt();if(!v)return;try{if(v.play)v.play();else if(window.VYMG&&VYMG.open)VYMG.open(v.id,{src:'day'});}catch(e){}}
function openTasks(){var d=sd(),h='',c=C().task;for(var i=0;i<d.tk.length;i++){var x=d.tk[i];
    h+='<div class="td-task'+(x.r?' done':'')+'"><span>'+(x.r?'✅':'▫️')+'</span><span><b>'+esc(tText(x))+'</b><small>'+(x.r?tr('готово','done'):x.p+tr(' из ',' of ')+x.n)+' · +'+ct(c.c)+(c.p?' +'+c.p+' 🔩':'')+'</small><span class="bar"><i style="width:'+Math.round(100*x.p/x.n)+'%"></i></span></span></div>';}
  modal('<h2>✅ '+tr('Задания дня','Daily tasks')+'</h2>'+h+'<p class="goal">'+tr('Все три — ещё +','All three — another +')+ct(c.all)+tr('. Новые задания — завтра.','. New tasks tomorrow.')+'</p><div class="row"><button class="btn green" id="tdPlay">▶ '+tr('Играть','Play')+'</button><button class="btn" id="mCancel">'+tr('Закрыть','Close')+'</button></div>');
  $('tdPlay').onclick=function(){hideModal();go('y3');};$('mCancel').onclick=function(){hideModal();render();};}
function render(){try{if(typeof modalOn!=='undefined'&&modalOn)return;if(window.UI&&UI.refresh)UI.refresh();else if(window.UI&&UI.homeRender)UI.homeRender();}catch(e){}}

/* ---------- плитки ленты (homeSlots) ---------- */
function tile(o){try{return UI.tile(o);}catch(e){return '<button class="hsT '+(o.cls||'')+'"><span class="hsI">'+esc(o.ic)+'</span><span class="hsB"><b>'+esc(o.t)+'</b>'+(o.s?'<small>'+esc(o.s)+'</small>':'')+'</span>'+(o.tag?'<em class="hsTag">'+esc(o.tag)+'</em>':'')+'</button>';}}
function first(el,fn){var b=el.querySelector('button')||el.firstChild;if(b)b.onclick=function(){tap();fn();};}
var autoT=0;
// само: подарок вернувшемуся → сундук дня (если готов и не забран) — раз за показ главного, не поверх другого окна
function auto(){clearTimeout(autoT);autoT=setTimeout(function(){try{if(typeof modalOn!=='undefined'&&modalOn)return;}catch(e){}
  try{if(G)return;}catch(e){}
  if(done()<1)return;if(openReturn())return;visit();
  var d=sd();if(chestReady()&&!d.ask){d.ask=1;openChest();}},250);} // раньше гостинца бабы Шуры (maybeStreak — 400 мс): он покажется после
var TILES=[
 {id:'td-chest',order:1,render:function(){if(!chestReady())return null;return tile({ic:'🎁',t:tr('Сундук дня','Daily chest'),s:tr('забрать ','collect ')+chestTxt(),tag:tr('готов','ready'),cls:'grn td-tchest'});},mount:function(el){first(el,openChest);}},
 {id:'td-today',order:2,render:function(){if(done()<1)return null;fix();check();var n=count(),d=sd();
   return tile({ic:'📋',t:tr('Сегодня ','Today ')+n+'/5',s:d.l?(d.ch?tr('путевой лист есть ✓','trip sheet received ✓'):tr('сундук дня ждёт!','the daily chest is waiting!')):tr('ещё ','')+Math.max(0,3-n)+tr(' — и путевой лист',' more for a trip sheet'),cls:'td-ttoday'+(d.l?'':' hot')});},
   mount:function(el){first(el,openToday);auto();flush();}},
 {id:'td-mg',order:20,render:function(){if(done()<1)return null;var v=vt();if(!v||!v.n)return null;var md=!!sd().m.mg||!!v.done;if(md)return null;
   return tile({ic:v.ic||'🧩',t:tr('Затея дня','Pastime of the day'),s:v.n,tag:v.rw?'🔩 '+v.rw:'',cls:'yel td-tmg'});},mount:function(el){first(el,playMg);}},
 {id:'td-tasks',order:30,render:function(){if(done()<1)return null;var d=sd(),k=d.tk.filter(function(x){return x.r;}).length,nx=d.tk.filter(function(x){return !x.r;})[0];
   return tile({ic:'✅',t:tr('Задания: ','Tasks: ')+k+tr(' из 3',' of 3'),s:nx?tText(nx)+' · '+nx.p+'/'+nx.n:tr('все сделаны!','all done!'),cls:k>=3?'':'td-ttk'});},mount:function(el){first(el,openTasks);}}];

/* ---------- окно победы (winSlots): новости заданий, сундук дня карточкой с большой кнопкой, сундук дворов за звёзды ---------- */
function tqLine(){if(!tq.n)return '';var t=tq.n===1?'✅ '+tr('Задание дня: ','Daily task: ')+tq.t:'✅ '+tr('Заданий дня: ','Daily tasks: ')+tq.n+(tq.all?tr(' — все три!',' — all three!'):'');
  t+=' · +'+ct(tq.c)+(tq.p?' +'+tq.p+' 🔩':'');tq={n:0,c:0,p:0,t:''};return t;}
function winHtml(){var d=sd(),h='',n=count(),justL=!!tq.l,tl=tqLine(),showL=chestReady();
  var ev=evq.filter(function(x){return !(showL&&x.indexOf('📄')===0);});evq=[];if(tl)ev.unshift(tl);
  if(ev.length)h+='<p class="goal tipl td-ev" data-fit="3">'+esc(ev.join(' · '))+'</p>';
  if(nightNow){h+='<p class="goal td-night">🌙 '+tr('Ночная смена: ещё +','Night shift: another +')+ct(nightNow)+' (×2)'+(nightLeft()?'':tr(' — на сегодня всё',' — that’s all for today'))+'</p>';nightNow=0;}
  if(chestReady())h+='<div class="td-wchest"><span class="td-wci">🎁</span><span><b>'+(justL?'📄 '+tr('Путевой лист! Сундук дня:','Trip sheet! Daily chest:'):tr('Сундук дня ждёт:','The daily chest is waiting:'))+'</b><small>'+chestTxt()+'</small></span><button class="btn sec sm td-take noenter" id="tdWChest" type="button">'+tr('Забрать','Collect')+'</button></div>';
  else if(!d.l&&n<3&&done()>=1)h+='<p class="goal td-rs" data-fit="4">📋 '+tr('Сегодня ','Today ')+n+tr(' из 5 дел — ещё ',' of 5 jobs — ')+(3-n)+tr(' до путевого листа',' more for a trip sheet')+'</p>';
  var sc=chestReady()?null:starChest();if(sc)h+='<div class="td-wchest star"><span class="td-wci">⭐</span><span><b>'+tr('Сундук дворов ','Chest for yards ')+(sc.k*10+1)+'–'+(sc.k*10+10)+'</b><small>'+sc.st+'★ · +'+ct(sc.c)+'</small></span><button class="btn sec sm td-take noenter" id="tdWStar" type="button">'+tr('Забрать','Collect')+'</button></div>';
  return h||null;}
function winMount(el){var b=el.querySelector('#tdWChest');if(b)b.onclick=function(){var w=b.parentNode;takeChest(b);b.disabled=true;w.classList.add('got');b.textContent='✓';};
  var s=el.querySelector('#tdWStar');if(s)s.onclick=function(){if(openStar())s.parentNode.classList.add('got');s.disabled=true;s.textContent='✓';};}
// сундук за звёзды (index.html: CHEST, S.chest) — раньше строкой в списке карты, 64 % его не замечали; теперь — карточкой в окне победы (первый готовый)
function starChest(){try{for(var k=0;k*10<S.unlocked-1;k++){var got=S.chest[k]||0,nx=CHEST[got];if(!nx)continue;var n=chestStars(k);if(n>=nx[0])return{k:k,c:nx[1],st:n,g:got};}}catch(e){}return null;}
function openStar(){var x=starChest();if(!x)return false;S.chest[x.k]=x.g+1;give(x.c,0,'chest');try{SND.coin();}catch(e){}try{STAT.ev('chest',{k:'star',c:x.c});}catch(e){}try{save();}catch(e){}
  toast('⭐ '+tr('Сундук открыт: +','Chest opened: +')+ct(x.c));return true;}
function flush(){var tl=tqLine();if(tl)evq.unshift(tl);if(!evq.length)return;var t=evq.join(' · ');evq=[];try{toast(t,3500);}catch(e){}}

/* ---------- регистрация в гнёздах UX ---------- */
['homeSlots','winSlots','yardHook','saveHook'].forEach(function(n){if(!Array.isArray(window[n]))window[n]=[];});
try{if(window.UI&&UI.onSave)UI.onSave({id:'td',keys:['td','tdR'],fix:function(){fix();},merge:function(S0,d){merge(d);}});}catch(e){}
TILES.forEach(function(x){x.zone='feed';homeSlots.push(x);});
(function(){var old=null;for(var k=homeSlots.length-1;k>=0;k--)if(homeSlots[k]&&homeSlots[k].id==='night'){old=homeSlots[k];break;}
  homeSlots.push({id:'night',order:old&&old.order!=null?old.order:5,zone:'feed',render:function(ctx){if(!nightOn()||!C().night)return old&&old.render?old.render(ctx):null;var l=nightLeft();
    return tile({ic:'🌙',t:tr('Ночная смена Михалыча','Mikhalych’s night shift'),s:l?tr('монеты за дворы ×2 · ещё до +','coins for yards ×2 · up to +')+ct(l):tr('доплата смены на сегодня собрана','tonight’s bonus is collected'),tag:l?'×2':'',cls:'night'});},
    mount:function(el){first(el,function(){try{UI.go('game-next');}catch(e){go('y3');}});}});})();
// сундук за звёзды (заглушка UX 'chest' вела на карту) — тот же id: «Забрать» сразу, без похода на маршрут
homeSlots.push({id:'chest',order:40,zone:'feed',render:function(){var x=starChest();if(!x)return null;return tile({ic:'🧰',t:tr('Сундук за звёзды','Star chest'),s:tr('дворы ','yards ')+(x.k*10+1)+'–'+(x.k*10+10)+' · +'+ct(x.c),tag:tr('забрать','collect'),cls:'hot'});},
  mount:function(el){first(el,function(){if(openStar())render();});}});
winSlots.push({id:'td',order:20,zone:'goal',fit:0,render:function(){return winHtml();},mount:winMount});
yardHook.push({id:'td',order:2,fn:onYard});
window.TD={fix:fix,merge:merge,deals:deals,count:count,check:check,mark:mark,ev:ev,openToday:openToday,openTasks:openTasks,openChest:openChest,takeChest:takeChest,
  chestReady:chestReady,isFirst:isFirst,openReturn:openReturn,retState:retState,visit:visit,onYard:onYard,winHtml:winHtml,flush:flush,give:give,
  takeParts:function(){var d=sd(),n=num(d.pp);d.pp=0;try{save();}catch(e){}return n;},auto:auto,tText:tText};
try{fix();}catch(e){}
})();
