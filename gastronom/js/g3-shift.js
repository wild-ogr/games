'use strict';
/* ================= g3-shift — П1 «Смена»: касса-комбо, «Выбросили!», пила, «почти» (Гастроном 3.0, волна 1; план REVIEW-1106/PLAN-3.0.md, опоры 1–2) =================
   Ядро (LOGIC, генератор, раскладки, freeze) НЕ трогаем — всё здесь на уровне попытки (G), вызовы из index.html под `if(window.G3S)`.
   1) КАССА-КОМБО (g3.combo): ход с тройкой — ступень вверх, пустой ход — на ступень вниз (не в ноль). Ступени ×1 → ×2 → ×3 → ×5
      (серия 2 / 3 / 5). Арифмометр на прилавке в зале показывает ×N. 5 подряд — очередь хлопает, 10 подряд — Валя «Ура!» и ириски (+5 💰, раз за уровень).
      «План выручки» = хоть раз дошли до ×3. Звёзды (с 3-го уровня, не задание дня): ★★★ — никто не ушёл И план выручки;
      без плана — на звезду меньше (не ниже 1). Монет комбо не даёт (кроме ирисок).
   2) «ВЫБРОСИЛИ!» (g3.vybr): с 6-го уровня, в каждом 2–3-м (idx%5 = 0|2), раз за уровень, после 3-го хода: Валя кричит «Выбросили X!»,
      6 ходов двое первых в очереди хотят X, одна тройка X уводит обоих. Не успели — их прежние заказы возвращаются.
   3) ПИЛА (g3.pila): только на НЕпройденных уровнях с 11-го (не Ревизия, не задание дня, не режимы): «Трудный завоз» — уровни idx%9 = 3|8
      (каждый 4–5-й), терпение очереди ×0,65; следующий за ним — «лёгкий», терпение ×1,3. Раскладка та же (решено по ходу: «товара больше»
      требует генератора и меняет freeze — не делаем).
   4) БЕЗ ПРОВАЛА на 1–10-м (g3.pochti): третий ушедший не кончает уровень — Валя: «Ничего, чаем напою», звёзды считаются как обычно.
   5) «ПОЧТИ» (g3.pochti): окно проигрыша → «Очередь ропщет»: строка из очереди + анекдот Вали, «📺 Ещё 3 хода за рекламу» /
      «Ещё 3 хода — 60 💰» / «↻ Заново» (+ «На карту» ссылкой). Ещё 3 хода = попытка (сердце) + 3 хода терпения всем в очереди.
   STAT: mod g3.combo {a:'win', x: макс. ступень} · g3.vybr {a:show|ok|miss} · g3.pila {a:hard|easy|win|lose} · g3.pochti {a:show|ad|coins|re|forgive}.
*/
(function(){
if(!window.G3)return;
var X=window.G3S={};
var L=G3.L;
var RUNG=[1,2,3,5],THR=[0,2,3,5];
function rungOf(s){return s>=5?3:s>=3?2:s>=2?1:0;}
function lvOk(g){return g&&!g.daily&&!g.mode;}

/* ---------- тексты (голос Вали и очереди; поворот в конце) ---------- */
var T={
  clap5:[['Пять подряд! Очередь хлопает!','Five in a row! The queue is clapping!'],['Вот это касса! Аж звенит!','What a till! It\'s ringing!'],['Браво, тётя Валя!','Bravo, Aunt Valya!']],
  clap10:[['Ура! Десять подряд — ириски всем! Ну, вам.','Hooray! Ten in a row — toffees for everyone! Well, for you.'],['Десять! Директор из окна смотрит — и молчит. Это высшая похвала.','Ten! The manager watches from the window and says nothing. Highest praise there is.']],
  start:[['Касса новая, щёлкает — смотрите! Тройки подряд — и ×2, ×3…','New till, it clicks — look! Triples in a row — ×2, ×3…']],
  vybr:[['Выбросили {a}! Очередь, не толкаемся!','{N} is in! No pushing, everyone!'],['Ой, выбросили {a}! Двое сразу просят!','Oh, {N} just came in! Two people want it at once!'],['Внимание! Выбросили {a}! Берите, пока я добрая.','Attention! {N} is in! Grab it while I\'m kind.']],
  vybrOk:[['Двоих одним махом! Вот это работа.','Two in one go! That\'s work.'],['Обоих отоварили — и ни одной ссоры. Чудо.','Both served — and not a single quarrel. A miracle.']],
  vybrMiss:[['Разобрали без нас… Ну, в другой раз.','Gone without us… Next time.']],
  hard:[['Трудный завоз! Очередь нервная — шевелимся.','Tough delivery! The queue is nervous — let\'s move.'],['Завоз трудный, люди злые. Улыбаемся и работаем.','Tough delivery, cross customers. Smile and work.']],
  easy:[['Лёгкий денёк! Можно и чаю попить… после смены.','An easy day! We can even have tea… after the shift.'],['Народ сегодня добрый — дышите спокойно.','People are kind today — breathe easy.']],
  forgive:[['Ничего, ушёл — вернётся. Я его чаем напою.','Never mind, he\'ll be back. I\'ll give him tea.'],['Не беда! Новичкам у меня прощается.','No harm done! Beginners are forgiven here.']],
  ropot:[['«Я в „Юбилейный“ пойду! Там хоть очередь быстрее!»','"I\'m going to the Jubilee store! At least the line moves there!"'],['«Девушка, я тут с утра стою! С прошлого утра!»','"Miss, I\'ve been standing here since morning! Since yesterday morning!"'],['«Кто крайний? А, я крайний. Всё, ухожу!»','"Who\'s last? Oh, I am. That\'s it, I\'m leaving!"'],['«Я жалобную книгу попрошу! Вот прямо сейчас!»','"I\'ll ask for the complaints book! Right now!"'],['«У меня обед кончается! Он кончился вчера!»','"My lunch break is ending! It ended yesterday!"']],
  petr:[['Петрович с рыбалки заходил — карасей принёс. Говорит, клюёт быстрее, чем у нас очередь движется.','Petrovich dropped by after fishing — brought some carp. Says they bite faster than our queue moves.'],['Петрович опять мотыля спрашивал. Я ему: «Тут гастроном, а не речка!» А он: «Одно другому не мешает».','Petrovich asked for bait again. I said: "This is a grocery, not a river!" He said: "One doesn\'t stop the other."'],['У Петровича улов — весь подъезд жарит рыбу. Я хлеба побольше выставила.','Petrovich had a good catch — the whole building is frying fish. I put out extra bread.'],['Петрович говорит, лещ у него был вот такой. Я руки развела — он сказал: «Больше».','Petrovich says his bream was this big. I spread my arms — he said: "Bigger."'],['Петрович с утра на речке, а вечером у меня за сухарями. «Прикорм», говорит.','Petrovich is at the river in the morning and here for rusks in the evening. "Bait," he says.']],
  anek:[['Валя: «Был у нас ревизор — тоже торопился. Теперь у нас грузчиком».','Valya: "We had an inspector who was in a hurry too. Now he\'s our loader."'],['Валя: «Очередь как тесто: поругается — и подойдёт».','Valya: "A queue is like dough: it grumbles, then it rises."'],['Валя: «Ничего, у нас и не такие стояли. Один — с 1974 года».','Valya: "Don\'t worry, worse lines have stood here. One man since 1974."']]
};
function tx(a,o){var p=G3.pick(a),s=L(p[0],p[1]);if(o)for(var k in o)s=s.split('{'+k+'}').join(o[k]);return s;}
X.T=T;

/* ---------- пила ---------- */
X.pila=function(idx){if(idx<10||(idx%10)===9)return 0;var m=idx%9;if(m===3||m===8)return 1; /* трудный */
  var p=idx-1;if(p>=10&&(p%10)!==9&&(p%9===3||p%9===8))return 2; /* лёгкий после трудного */return 0;};
X.PF=[1,0.65,1.3];

/* ---------- начало уровня (до qFill) ---------- */
X.start=function(g){if(!G3.on())return;g.g3={s:0,r:0,mx:0,plan:false,c5:0,c10:0,vy:null,vyDone:false,pila:0,fg:0};
  if(!lvOk(g))return;var i=g.idx;
  if(G3.open('pila')&&!g.boss&&!(S.stars&&S.stars[i])){var k=X.pila(i);if(k){g.g3.pila=k;g.lv.P=Math.max(4,Math.round(g.lv.P*X.PF[k]));
    G3.mark('pila',k===1?'hard':'easy',{l:i+1});
    setTimeout(function(){if(G===g&&!g.over)try{say(tx(k===1?T.hard:T.easy),'valya');}catch(e){}},1400);}}
  if(G3.open('combo')&&!(S.g3&&S.g3.cmb)&&!G3.isNew()&&i>=1){S.g3.cmb=1; /* старому игроку — один раз: касса новая */
    setTimeout(function(){if(G===g&&!g.over)try{say(tx(T.start),'valya');}catch(e){}},2600);}
  if(G3.on('petr')&&i>=6&&!g.boss&&!g.g3.pila&&(i*7+G3.today())%8===3){var pl=tx(T.petr); /* встречная строка: Петрович из «Рыбалки» (≤1 уровня из 8) */
    setTimeout(function(){if(G===g&&!g.over&&!g.speech)try{say(pl,'valya');G3.mark('petr','say');}catch(e){}},4200);}
  g.g3.vyOn=G3.open('vybr')&&i>=5&&!g.boss&&(i%5===0||i%5===2)&&g.lv.K>=4;};

/* ---------- ход ---------- */
X.move=function(clears,isMove){var g=G;if(!g||!g.g3||!isMove)return;var c=g.g3;
  if(G3.open('combo')){
    if(clears){c.s++;}else{var r=rungOf(c.s);c.s=r>0?THR[r-1]:0;}
    var rr=rungOf(c.s);if(rr>c.r&&rr>=1){c.bump=1;try{SND.till(rr+1);}catch(e){}}c.r=rr;if(rr>c.mx)c.mx=rr;if(rr>=2)c.plan=true;
    if(clears&&c.s===5&&!c.c5){c.c5=1;later(function(){clap(5);},700);}
    if(clears&&c.s===10&&!c.c10){c.c10=1;later(function(){clap(10);},900);}}
  if(c.vyOn&&!c.vyDone&&!c.vy&&g.moves>=3&&!g.tutor)vyStart(g);
  else if(c.vy){c.vy.n--;if(c.vy.n<=0)vyEnd(g,false);}};
function clap(n){var g=G;if(!g||g.over)return;
  if(n===5){var cs=g.queue.filter(function(q){return q.st==='wait'||q.st==='in';});var who=cs.length?cs[0]:'valya';try{say(tx(T.clap5),who);SND.happy();}catch(e){}}
  else{try{say(tx(T.clap10),'valya');S.coins+=ern('lvl',5);save();updCoins();SND.coin();toast(L('🍬 Ириски от тёти Вали: +5 💰','🍬 Toffees from Aunt Valya: +5 💰'));}catch(e){}}
  G3.mark('combo','clap'+n);}
X.rung=function(){var g=G;return g&&g.g3?RUNG[g.g3.r]:1;};

/* ---------- «Выбросили!» ---------- */
function vyStart(g){var q=g.q;if(q.vis.length<2)return;var rem=remCounts(g.lv,g.st),best=-1,bc=0;
  for(var k in rem){var t=+k;if(t>=RARE0)continue;if(g.lv.ob&&window.GBOB&&GBOB.noAsk(g.lv,t))continue;var n=Math.floor(rem[t]/3);
    var asked=0;for(var j=0;j<q.vis.length;j++)if(q.vis[j].t===t)asked++;if(n-asked<1)continue;
    var sc=0;for(var i=0;i<g.lv.S;i++)for(var s=0;s<3;s++){var cc=g.st.F[i][s];if(cc&&tOf(cc)===t&&movable(g.st,cc))sc++;}
    if(sc>bc){bc=sc;best=t;}}
  if(best<0||bc<2)return;var two=q.vis.slice(0,2).filter(function(v){return v.t!==best&&!v.sk;});if(!two.length)return;
  g.g3.vyDone=true;g.g3.vy={t:best,n:6,w:two.map(function(v){return{id:v.id,t0:v.t};})};
  two.forEach(function(v){v.t=best;v.pat+=2;if(v.pat>v.max)v.max=v.pat;});
  for(var u=0;u<g.queue.length;u++){var c=g.queue[u];if(two.some(function(v){return v.id===c.id;}))c.t=best;}
  try{syncQueue();var gd=GOODS[best];say(tx(T.vybr,{a:gd.a,N:gd.n}),'valya');SND.till(3);vib(40);}catch(e){}
  G3.mark('vybr','show',{l:g.idx+1});}
function vyEnd(g,ok){var v=g.g3.vy;if(!v)return;g.g3.vy=null;
  if(!ok){var rem=remCounts(g.lv,g.st);v.w.forEach(function(w){var c=g.q.vis.filter(function(x){return x.id===w.id;})[0];if(!c)return;
      if(c.t===v.t&&rem[w.t0]>=3)c.t=w.t0;});
    for(var u=0;u<g.queue.length;u++){var c=g.queue[u];var w=v.w.filter(function(x){return x.id===c.id;})[0];if(w){var vv=g.q.vis.filter(function(x){return x.id===c.id;})[0];if(vv)c.t=vv.t;}}
    var still=v.w.some(function(w){return g.q.vis.some(function(x){return x.id===w.id;});});
    if(still){try{say(tx(T.vybrMiss),'valya');}catch(e){}G3.mark('vybr','miss');}}}
/* тройка товара «Выбросили!»: первый покупатель уже снят qClear — снимаем второго, кто ждёт тот же товар */
X.serve2=function(t){var g=G;if(!g||!g.g3||!g.g3.vy||g.g3.vy.t!==t)return null;var v=qClear(g.q,t);
  if(v){g.served++;later(function(){if(G)try{custLeave(v,true);SND.happy();}catch(e){}},700);}
  g.g3.vy=null;later(function(){try{say(tx(T.vybrOk),'valya');}catch(e){}},1200);G3.mark('vybr','ok');return v;};

/* ---------- без провала на 1–10 ---------- */
X.forgive=function(){var g=G;if(!g||!g.g3||!G3.on('pochti')||g.daily||g.mode||g.idx>=10)return false;
  g.hearts=1;try{renderHearts();}catch(e){}if(!g.g3.fg){g.g3.fg=1;later(function(){try{say(tx(T.forgive),'valya');}catch(e){}},1000);G3.mark('pochti','forgive',{l:g.idx+1});}return true;};

/* ---------- звёзды ---------- */
X.stars=function(st){var g=G;if(!g||!g.g3||!G3.open('combo')||g.daily||g.mode||g.idx<5)return st;
  G3.mark('combo','win',{x:RUNG[g.g3.mx],p:g.g3.plan?1:0});return g.g3.plan?st:Math.max(1,st-1);};
X.planTxt=function(){var g=G;if(!g||!g.g3||!G3.open('combo')||g.daily||g.mode||g.idx<5)return '';
  return g.g3.plan?L('План выручки выполнен — касса дошла до ×'+RUNG[g.g3.mx]+'.','Takings plan met — the till reached ×'+RUNG[g.g3.mx]+'.'):L('Третья ★ — за план выручки: тройки подряд до ×3.','Third ★ is for the takings plan: triples in a row up to ×3.');};

/* ---------- «почти» ---------- */
X.pochti=function(){var g=G;return !!(g&&g.g3&&G3.open('pochti'));};
X.loseTop=function(){G3.mark('pochti','show',{l:(G?G.idx:0)+1});
  return '<h2>'+L('Очередь ропщет','The queue is grumbling')+'</h2><p class="g3-ropot">'+QQ0(tx(T.ropot))+'</p><p class="g3-anek"><small>'+tx(T.anek)+'</small></p>';};
function QQ0(s){return s;}

/* ---------- арифмометр на прилавке ---------- */
X.draw=function(ctx,R,tk){var g=G;if(!g||!g.g3||!G3.open('combo')||!R)return;var c=g.g3,r=c.r,n=RUNG[r];
  var s=Math.max(24,Math.min(R.h>500?52:40,R.h*.15)),x=R.x+Math.min(R.w-s*1.6-4,(R.vX||R.w*.12)+(R.vS||60)*.42),cy=R.cy||R.h*.8,y=R.y+cy+Math.max(2,Math.min(s*.5,(R.h-cy-s)/2));if(y+s>R.y+R.h-1)y=R.y+R.h-s-1;
  if(c.bump){c.bumpT=0;c.bump=0;}if(c.bumpT!=null)c.bumpT+=1/60;var k=c.bumpT!=null&&c.bumpT<.35?1+.25*Math.sin(c.bumpT/.35*Math.PI):1;
  ctx.save();ctx.translate(x+s*.75,y+s*.5);ctx.scale(k,k);ctx.translate(-s*.75,-s*.5);
  ctx.fillStyle='rgba(60,40,20,.25)';ctx.fillRect(2,s*.95,s*1.5,s*.12);
  var gr=ctx.createLinearGradient(0,0,0,s);gr.addColorStop(0,'#8a6a3a');gr.addColorStop(1,'#5a4220');ctx.fillStyle=gr;ctx.fillRect(0,0,s*1.5,s);
  ctx.fillStyle=r>=2?'#ffe08a':'#efe6cf';ctx.fillRect(s*.12,s*.14,s*1.26,s*.56);
  ctx.fillStyle=r>=3?'#c0392b':'#3a2a10';ctx.font='bold '+Math.round(s*.46)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('×'+n,s*.75,s*.43);
  for(var i=0;i<4;i++){ctx.fillStyle=i<=r?'#ffd24a':'#3a2a10';ctx.beginPath();ctx.arc(s*(.27+i*.32),s*.84,s*.07,0,6.3);ctx.fill();}
  ctx.restore();};
})();
