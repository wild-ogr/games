/* ===== bb2-ev-pdv.js — поток EVENT: «ПОДВИГИ» (догружается набором 'ev'; флаг 'pdv'; шина — js/bb2-ev.js) =====
   Всегда три подвига: ① короткий (один поход) ② средний (2–3 похода или другое место игры) ③ связка героя (5 подряд → куплет «Былины о тебе»).
   Выполнил — награда сразу, следующий подвиг появляется тут же (и посреди похода). Ничего не сгорает в полночь. Сундук дня — за любые 3 подвига за день.
   Заменяет «Задания дня» (без флага — всё по-старому). Числа — BB2.n('ev.…') из договора ECO. Сейв — S.bb2.ev.p:
     a:[{t:шаблон|'c',n:цель,p:счёт,s:место,c:связка,i:шаг,f:1 запасной шаг}], k всего выполнено, d день, dn сегодня, dg золота сегодня, ch день сундука, sw день замены,
     ci/cs связка и шаг, cn связок допето, ku:[[связка,число]] куплеты, h последние шаблоны, tut шаг обучающих. */
var BB2EV=(function(){
  var E={},T={},R=null,HUDT=0,hud=null,hudTxt='',RUN_DONE=[];
  function ev(){var o=BB2.s('ev');if(!o.v)BB2.evFix(o);return o;}
  function P(){return ev().p;}
  function N(k,d){return BB2.n('ev.'+k,d);} /* числа экономики — только отсюда */
  function fn(n){return typeof fmtNum==='function'?fmtNum(n):String(n);}
  function today(){return dayKey();}
  function rw(){return typeof questReward==='function'?questReward():90;}
  function tier(){return typeof questTier==='function'?questTier():0;}
  function has(f){return typeof window[f]==='function';}
  function can(f){try{return has(f)&&!!window[f]();}catch(e){return false;}}
  function stat(a,o){o=o||{};o.a=a;BB2.stat('pdv',o);}
  E.N=N;
  /* золото «по отрезку глав игрока» (договор ECO): 's'|'m'|'b' → base.small|mid|big[0 — до 3 глав, 1 — 4–18, 2 — 19+] */
  E.gold=function(x){if(typeof x==='number')return x;var n=0,k;for(k in S.done)n++;var b=n<=3?0:n<=18?1:2,t=BB2.n('base.'+(x==='s'?'small':x==='m'?'mid':'big'),x==='s'?[70,200,650]:x==='m'?[350,950,3200]:[1400,3800,12800]);return t[b]||0;};E.ev=ev;E.rw=rw;E.fn=fn;E.can=can;

  /* ---------- шаблоны ---------- h — короткое слово для строки в бою; run:1 — счёт идёт прямо в походе */
  function def(d){T[d.id]=d;}
  function goMap(){openTab('Map');}
  function goVil(){openTab('Village');}
  var okY=function(){return can('yardOpen');},okZ=function(){return can('zabOpen')&&has('zabScreen');};
  [ {id:'k5',key:'kills',s:1,run:1,n:[300,700,1200],t:function(n){return L('Одолей нечисть: '+fn(n),'Defeat monsters: '+fn(n));},h:function(){return L('нечисть','monsters');}},
    {id:'ch',key:'chest',s:1,run:1,n:[2,3,4],t:function(n){return L('Открой сундуков: '+n,'Open chests: '+n);},h:function(){return L('сундуки','chests');}},
    {id:'lv',key:'lvl',s:1,run:1,max:1,n:[10,16,22],t:function(n){return L('Возьми '+n+'-й уровень в одном походе','Reach level '+n+' in one run');},h:function(){return L('уровень','level');}},
    {id:'tm',key:'time',s:1,run:1,max:1,min:1,n:[3,4,5],t:function(n){return L('Продержись '+n+' мин в одном походе','Survive '+n+' min in one run');},h:function(){return L('минуты','minutes');}},
    {id:'dr',key:'dar',s:1,run:1,n:[8,15,25],t:function(n){return L('Используй дар богатыря: '+n,'Use the hero’s gift: '+n);},h:function(){return L('дар','gift');}},
    {id:'ev',key:'evo',s:1,run:1,n:[1,1,2],ok:function(){return tier()>=1||Object.keys(S.evoSeen||{}).length>0;},t:function(n){return n>1?L('Проведи эволюций оружия: '+n,'Evolve weapons: '+n):L('Проведи эволюцию оружия','Evolve a weapon');},h:function(){return L('эволюция','evolution');}},
    {id:'gd',key:'gold',s:1,n:[200,500,1000],t:function(n){return L('Принеси из походов золота: '+fn(n),'Bring home gold from runs: '+fn(n));}},
    {id:'k2',key:'kills',s:2,run:1,n:[1500,3500,6000],t:function(n){return L('Одолей нечисть: '+fn(n),'Defeat monsters: '+fn(n));},h:function(){return L('нечисть','monsters');}},
    {id:'bs',key:'boss',s:2,run:1,n:[1,2,2],t:function(n){return L('Победи босса: '+n,'Beat a boss: '+n);},h:function(){return L('босс','boss');}},
    {id:'rn',key:'run',s:2,n:[2,3,3],t:function(n){return L('Сходи в поход: '+n,'Go on runs: '+n);}},
    {id:'wn',key:'win',s:2,n:[1,2,2],t:function(n){return L('Победи в главе: '+n,'Win a chapter: '+n);}},
    {id:'dd',key:'drun',s:2,n:[1,1,1],ok:function(){return can('drOpen');},go:function(){openDaily();},t:function(){return L('Сходи в Поход дня','Play the Daily Run');}},
    {id:'en',key:'endless',s:2,max:1,min:1,n:[3,5,7],ok:function(){return can('endOpen');},t:function(n){return L('Продержись '+n+' мин в Бесконечной сече','Survive '+n+' min in Endless Battle');}},
    {id:'zb',key:'zab',s:2,n:[1,1,2],ok:okZ,go:function(){window.ZAB_SRC='menu';zabScreen();},t:function(n){return n>1?L('Сыграй в Забавы: '+n,'Play Fun & Games: '+n):L('Сыграй в любую Забаву','Play any of the Fun & Games');}},
    {id:'or',key:'order',s:2,n:[1,1,2],ok:function(){return can('troOpen');},go:goVil,t:function(n){return n>1?L('Сдай заказы старосте: '+n,'Fill the elder’s orders: '+n):L('Сдай заказ старосте','Fill an order for the elder');}},
    {id:'fg',key:'forge',s:2,n:[1,2,3],ok:function(){return !!(S.village&&S.village.forge);},go:function(){openTab('Forge');},t:function(n){return n>1?L('Улучши в кузнице: '+n,'Forge upgrades: '+n):L('Улучши что-нибудь в кузнице','Upgrade something at the forge');}},
    {id:'hv',key:'harv',s:2,n:[2,3,4],ok:okY,go:function(){openYard();},t:function(n){return L('Собери урожай на подворье: '+n,'Harvest crops in the yard: '+n);}},
    {id:'bk',key:'bake',s:2,n:[1,1,2],ok:okY,go:function(){openYard();},t:function(n){return n>1?L('Испеки в печи: '+n,'Bake in the oven: '+n):L('Испеки что-нибудь в печи','Bake something in the oven');}},
    {id:'s3',key:'star3',s:2,n:[1,1,1],t:function(){return L('Возьми три звезды за один поход','Earn three stars in one run');}},
    {id:'nr',key:'nores',s:2,n:[1,1,1],t:function(){return L('Победи в главе, ни разу не упав','Win a chapter without falling once');}},
    {id:'hd',key:'hard',s:2,n:[1,1,1],ok:function(){for(var i=0;i<ORD.length;i++)if(difOpen(ORD[i],'s'))return S.runs>=8;return false;},t:function(){return L('Победи на Сложной или Адской','Win on Hard or Hellish');}},
    /* обучающие — первые подвиги новичка: ведут туда, что обычно находят поздно */
    {id:'t1',key:'run',tut:1,n:[1],t:function(){return L('Сходи в поход','Go on a run');}},
    {id:'t2',key:'kills',tut:1,run:1,n:[150],t:function(n){return L('Одолей нечисть: '+n,'Defeat monsters: '+n);},h:function(){return L('нечисть','monsters');}},
    {id:'t3',key:'forge',tut:1,n:[1],ok:function(){return !!(S.village&&S.village.forge);},go:function(){openTab('Forge');},t:function(){return L('Загляни в кузницу: улучши что-нибудь','Visit the forge: upgrade something');}},
    {id:'t4',key:'chest',tut:1,run:1,n:[1],t:function(){return L('Открой сундук в походе','Open a chest on a run');},h:function(){return L('сундук','chest');}},
    {id:'t5',key:'evo',tut:1,run:1,n:[1],t:function(){return L('Проведи эволюцию оружия (ищи карточки с 🔥)','Evolve a weapon (look for 🔥 cards)');},h:function(){return L('эволюция','evolution');}},
    {id:'t6',key:'boss',tut:1,run:1,n:[1],t:function(){return L('Победи босса главы','Beat a chapter boss');},h:function(){return L('босс','boss');}},
    {id:'t7',key:'zab',tut:1,n:[1],ok:okZ,go:function(){window.ZAB_SRC='menu';zabScreen();},t:function(){return L('Сыграй первую Забаву','Play your first Fun & Games');}},
    {id:'t8',key:'harv',tut:1,n:[1],ok:okY,go:function(){openYard();},t:function(){return L('Посади и собери репу на подворье','Plant and harvest a turnip in the yard');}}
  ].forEach(def);
  var TUT=['t1','t2','t3','t4','t5','t6','t7','t8'];
  BB2.pdvAdd=function(d){if(d&&d.id&&d.key&&!T[d.id]){d.s=d.s===2?2:1;if(!Array.isArray(d.n))d.n=[d.n||1];def(d);}};
  (BB2.pdvDefs||[]).forEach(BB2.pdvAdd);

  /* ---------- связки героев: 5 подвигов подряд → куплет. Шаг: [ключ, цель, запасной ключ (если место ещё закрыто), запасная цель] ---------- */
  var KEYT={kills:function(n){return L('Одолей нечисть: '+fn(n),'Defeat monsters: '+fn(n));},boss:function(n){return L('Победи босса: '+n,'Beat a boss: '+n);},
    time:function(n){return L('Продержись '+n+' мин в одном походе','Survive '+n+' min in one run');},lvl:function(n){return L('Возьми '+n+'-й уровень в одном походе','Reach level '+n+' in one run');},
    gold:function(n){return L('Принеси из походов золота: '+fn(n),'Bring home gold from runs: '+fn(n));},chest:function(n){return L('Открой сундуков: '+n,'Open chests: '+n);},
    dar:function(n){return L('Используй дар богатыря: '+n,'Use the hero’s gift: '+n);},evo:function(n){return L('Проведи эволюций оружия: '+n,'Evolve weapons: '+n);},
    run:function(n){return L('Сходи в поход: '+n,'Go on runs: '+n);},win:function(n){return L('Победи в главе: '+n,'Win a chapter: '+n);},drun:function(){return L('Сходи в Поход дня','Play the Daily Run');},
    endless:function(n){return L('Продержись '+n+' мин в Бесконечной сече','Survive '+n+' min in Endless Battle');},star3:function(){return L('Возьми три звезды за один поход','Earn three stars in one run');},
    nores:function(){return L('Победи в главе, ни разу не упав','Win a chapter without falling once');},hard:function(){return L('Победи на Сложной или Адской','Win on Hard or Hellish');},
    zab:function(n){return L('Сыграй в Забавы: '+n,'Play Fun & Games: '+n);},order:function(n){return L('Сдай заказы старосте: '+n,'Fill the elder’s orders: '+n);},
    forge:function(n){return L('Улучши в кузнице: '+n,'Forge upgrades: '+n);},harv:function(n){return L('Собери урожай на подворье: '+n,'Harvest crops in the yard: '+n);},bake:function(n){return L('Испеки в печи: '+n,'Bake in the oven: '+n);}};
  var KMAX={time:1,lvl:1,endless:1},KMIN={time:1,endless:1},KRUN={kills:1,boss:1,time:1,lvl:1,chest:1,dar:1,evo:1};
  var KOK={drun:function(){return can('drOpen');},endless:function(){return can('endOpen');},zab:okZ,order:function(){return can('troOpen');},forge:function(){return !!(S.village&&S.village.forge);},harv:okY,bake:okY,hard:function(){return T.hd.ok();}};
  var KSH={kills:function(){return L('нечисть','monsters');},boss:function(){return L('босс','boss');},time:function(){return L('минуты','minutes');},lvl:function(){return L('уровень','level');},chest:function(){return L('сундуки','chests');},dar:function(){return L('дар','gift');},evo:function(){return L('эволюция','evolution');}};
  var CHN=[
    {id:'ily',ic:'hp_ily',nm:function(){return L('Илья Муромец: «Тридцать лет на печи»','Ilya Muromets: “Thirty Years on the Stove”');},st:[['time',5],['kills',1000],['boss',1],['nores',1],['win',2]],
      ku:function(n){return L('Тридцать лет Илья на печи сидел — а ты и трёх минут не усидел: нечисти положено '+n+', и печь остыть не успела.','Ilya sat on the stove for thirty years — you couldn’t sit for three minutes: '+n+' monsters down, and the stove’s still warm.');}},
    {id:'dob',ic:'hp_dob',nm:function(){return L('Добрыня: «Змеиный вопрос»','Dobrynya: “The Serpent Question”');},st:[['boss',1],['kills',800],['boss',2],['star3',1],['nores',1]],
      ku:function(n){return L('Спросил Добрыня у Змея: «Сколько голов?» — «Было больше». А боссов повержено '+n+', и каждый жалобу писал.','Dobrynya asked the Serpent: “How many heads?” — “Used to be more.” Bosses beaten: '+n+', and each one filed a complaint.');},kn:function(){return S.bosses||0;}},
    {id:'ale',ic:'hp_ale',nm:function(){return L('Алёша Попович: «Хитрость не порок»','Alyosha Popovich: “Cunning Is No Vice”');},st:[['chest',3],['drun',1,'run',2],['lvl',15],['chest',5],['win',1]],
      ku:function(){return L('Алёша силой не хвалился — он сундуки считал. Досчитал до пяти, а шестой сам пришёл сдаваться.','Alyosha never bragged of strength — he counted chests. Got to five, and the sixth came to surrender.');}},
    {id:'lesh',ic:'e_leshy',nm:function(){return L('Челобитная Лешего: «Уйми свои колобки»','The Leshy’s Petition: “Call Off Your Buns”');},st:[['kills',600],['dar',10],['kills',1200],['chest',3],['win',1]],
      ku:function(n){return L('Бьёт челом Леший: «Весь лес укатали, грибам ступить негде!» Писано со слов '+n+' потерпевших.','The Leshy petitions: “You’ve rolled the whole forest flat!” Written on behalf of '+n+' victims.');}},
    {id:'vas',ic:'hp_vas',nm:function(){return L('Василиса: «Премудрости»','Vasilisa: “Words of Wisdom”');},st:[['evo',1],['lvl',18],['zab',1,'run',2],['star3',1],['evo',2]],
      ku:function(){return L('Учила Василиса: «Не силой, а умом». Ты кивнул, записал — и провёл эволюцию палицы. Тоже наука.','Vasilisa taught: “Brains over brawn.” You nodded, took notes — and evolved a club. Also a science.');}},
    {id:'sad',ic:'hp_sad',nm:function(){return L('Садко: «Торг уместен»','Sadko: “Open to Offers”');},st:[['gold',500],['order',1,'gold',400],['gold',1000],['chest',4],['forge',1]],
      ku:function(){return L('Садко торговался с морским царём, а ты — с нечистью: она тебе золото, ты ей — палицей сдачу.','Sadko haggled with the Sea King, you — with monsters: they give gold, you give change with a club.');}},
    {id:'mik',ic:'hp_mik',nm:function(){return L('Микула: «Пахота»','Mikula: “Ploughing”');},st:[['harv',2,'run',2],['bake',1,'kills',700],['forge',1,'chest',3],['run',3],['harv',3,'win',1]],
      ku:function(){return L('Микула поле пахал — три дружины сошку поднять не могли. Ты поднял репу. С первого раза. Почти.','Mikula ploughed a field no three squads could lift the plough from. You lifted a turnip. First try. Almost.');}},
    {id:'vod',ic:'e_vodyanoy',nm:function(){return L('Челобитная Водяного: «Не мути воду»','The Vodyanoy’s Petition: “Stop Muddying the Water”');},st:[['kills',300],['time',4],['gold',400],['boss',1],['run',2]],
      ku:function(n){return L('Пишет Водяной: «Воду не мутить, лягушек не пугать, богатыря — унять». Подписей — '+n+', все мокрые.','The Vodyanoy writes: “No muddying, no scaring frogs, calm the hero down.” Signatures: '+n+', all wet.');}},
    {id:'vol',ic:'hp_vol',nm:function(){return L('Вольга: «Оборотень»','Volga: “The Shapeshifter”');},st:[['run',2],['drun',1,'run',2],['kills',1500],['endless',3,'time',5],['win',2]],
      ku:function(){return L('Вольга волком рыскал, соколом летал. Ты проще: пришёл как есть — и нечисть сама обернулась. Наутёк.','Volga ran as a wolf and flew as a falcon. You kept it simple: showed up as is — and the monsters turned. To run.');}},
    {id:'mar',ic:'hp_mar',nm:function(){return L('Марья Моревна: «Кощей на цепи»','Marya Morevna: “Koschei on a Chain”');},st:[['hard',1,'win',1],['boss',2],['endless',4,'time',5],['nores',1],['hard',1,'win',2]],
      ku:function(){return L('У Марьи Кощей на двенадцати цепях висел и воды просил. У тебя не просит: некогда ему, он бежит.','Marya kept Koschei on twelve chains, begging for water. With you he doesn’t beg: no time, he’s running.');}},
    {id:'iva',ic:'hp_iva',nm:function(){return L('Иван: «Авось»','Ivan: “Here’s Hoping”');},st:[['zab',1,'run',1],['chest',3],['zab',2,'run',2],['run',3],['win',1]],
      ku:function(){return L('Шёл Иван куда глаза глядят — и пришёл куда надо. Спросили: «Как?» — «Авось». Записали как военную хитрость.','Ivan went wherever his eyes led — and arrived right where he should. “How?” — “Here’s hoping.” Logged as a stratagem.');}},
    {id:'kik',ic:'e_kikimora',nm:function(){return L('Челобитная Кикиморы: «Верни тишину на болоте»','The Kikimora’s Petition: “Give the Swamp Its Quiet Back”');},st:[['run',1],['kills',500],['nores',1],['time',5],['win',1]],
      ku:function(n){return L('Жалуется Кикимора: «Раньше на болоте тихо было, одна я кричала». Теперь кричат '+n+' — и все от тебя.','The Kikimora complains: “It used to be quiet here, only I screamed.” Now '+n+' scream — all because of you.');}}];
  E.CHN=CHN;
  function chn(i){return CHN[((i|0)%CHN.length+CHN.length)%CHN.length];}
  function icOk(k){return typeof ART!=='undefined'&&ART[k]?k:'chest';}

  /* описание активного подвига: единый вид для шаблона и шага связки */
  function D(a){if(a.t==='c'){var c=chn(a.c),st=c.st[a.i]||c.st[0],k=a.f&&st[2]?st[2]:st[0];
      return {id:'c',key:k,s:3,max:KMAX[k],min:KMIN[k],run:KRUN[k],t:KEYT[k]||function(n){return k+': '+n;},h:KSH[k],chain:c};}
    return T[a.t]||null;}
  function need(a,d){return d.min?a.n*60:a.n;}
  function val(a,d){var b=a.p||0;if(!R)return b;var r=R[d.key]||0;return d.max?Math.max(b,r):b+Math.max(0,r-(a.b||0));}
  function shown(a,d){var v=Math.min(val(a,d),need(a,d));return d.min?Math.floor(v/60):Math.floor(v);}
  function text(a){var d=D(a);return d?d.t(a.n):'';}
  E.text=text;
  function grow(n,max){var k=1+Math.min(P().k,N('pdv.growCap',240)/*ECO?*/)/N('pdv.grow',120),v=n*k;
    if(max||n<8)return Math.max(n,Math.min(Math.round(v),n*2));return v>=400?Math.round(v/100)*100:v>=40?Math.round(v/10)*10:Math.round(v);}

  /* ---------- выдача нового подвига на место s (1 короткий, 2 средний, 3 связка) ---------- */
  function spawn(s){var p=P(),a,i,d;
    if(s===3){var c=chn(p.ci),st=c.st[p.cs]||c.st[0],k=st[0],f=0,n=st[1];if(KOK[k]&&!KOK[k]()&&st[2]){k=st[2];n=st[3]||1;f=1;}
      a={t:'c',c:p.ci,i:p.cs,n:KMAX[k]||n<8?n:grow(n),p:0,s:3};if(f)a.f=1;}
    else{var pool=[],used={},inRun=!!R;for(i=0;i<p.a.length;i++){d=D(p.a[i]);if(d)used[d.key]=1;}
      for(i=0;i<TUT.length&&!pool.length;i++){if(p.tut&(1<<i))continue;d=T[TUT[i]];try{if(used[d.key]||(d.ok&&!d.ok())||(inRun&&!d.run))continue;}catch(e){continue;}pool=[d];p.tut|=1<<i;} /* tut — биты выданных обучающих */
      if(!pool.length)for(var id in T){d=T[id];if(d.tut||d.s!==s||used[d.key]||p.h.indexOf(id)>=0)continue;try{if(d.ok&&!d.ok())continue;}catch(e){continue;}
        if(inRun&&s===1&&!d.run)continue;pool.push(d);}
      if(!pool.length)for(id in T){d=T[id];if(!d.tut&&d.s===s&&!used[d.key]&&(!d.ok||d.ok()))pool.push(d);}
      if(!pool.length)pool=[T.k5];
      d=pool[Math.floor(Math.random()*pool.length)];var b=d.n[Math.min(tier(),d.n.length-1)];
      a={t:d.id,n:d.tut?b:grow(b,d.max),p:0,s:s};}
    d=D(a);if(R&&d){if(d.max&&(R[d.key]||0)>=need(a,d)&&!d.tut){a.n=grow(a.n+(d.min?1:2),1);if((R[d.key]||0)>=need(a,d))a.n=Math.floor((R[d.key]||0)/(d.min?60:1))+(d.min?1:2);}
      a.b=R[d.key]||0;}
    stat('new',{t:a.t==='c'?chn(a.c).id+a.i:a.t,s:s,n:a.n,in:R?1:0});return a;}
  function roll(){var p=P(),t=today();if(p.d!==t){p.d=t;p.dn=0;p.dg=0;}}
  function ensure(){var p=P(),i,have={},ch=0;roll();
    if(!p.init){p.init=1;if((S.runs|0)>3)p.tut=255;ch=1;}
    p.a=p.a.filter(function(a){return !!D(a);});for(i=0;i<p.a.length;i++)have[p.a[i].s]=1;
    [3,1,2].forEach(function(i){if(!have[i]){p.a.push(spawn(i));ch=1;}}); /* связка первой: короткий и средний не берут её ключ */
    p.a.sort(function(x,y){return x.s-y.s;});return ch;}
  E.list=function(){ensure();return P().a.map(function(a){var d=D(a);return {a:a,d:d,v:shown(a,d),n:a.n,q:Math.min(1,val(a,d)/need(a,d)),t:d.t(a.n)};});};
  E.on=function(){return BB2.on('pdv')&&(S.runs|0)>=1;};

  /* ---------- награда ---------- */
  function mulDay(){var c=ev().cal;if(BB2.on('cal')&&c.n>0)return 1+N('cal.streak',.1)*Math.min(c.n-1,Math.round(N('cal.streakCap',.6)/N('cal.streak',.1)));
    try{return streakInfo().mul;}catch(e){return 1;}}
  function strk(){var c=ev().cal;if(BB2.on('cal')&&c.n>0)return c.n;try{return streakInfo().n;}catch(e){return 1;}}
  E.chestGold=function(){return Math.round(rw()*N('pdv.chestRw',2)*mulDay());};
  E.chestReady=function(){var p=P();roll();return p.ch!==today()&&p.dn>=N('pdv.chest',3);};
  E.chestGot=function(){return P().ch===today();};
  E.chestTake=function(){if(!E.chestReady())return 0;var p=P(),g=E.chestGold(),t=today();p.ch=t;S.gold+=g;ern('chest',g);
    try{var dq=dailyEnsure();dq.bonus=1;S.streak={last:t,n:Math.max(strk(),1)};}catch(e){} /* старые счётчики: достижение «Верный» и миссии VK про сундук дня считают по ним */
    save();stat('chest',{n:g});try{SND.chest();}catch(e){}if(has('vkmCheck'))try{vkmCheck();}catch(e){}return g;};
  function reward(a,d,vow){var r=rw(),k=a.s===1?N('pdv.short.g',.5):a.s===2?N('pdv.mid.g',1):a.i>=4?N('pdv.fin.g',1.5):N('pdv.chain.g',.75),
      fx=a.s===1?N('pdv.short.sl',5):a.s===2?N('pdv.mid.sl',10):a.i>=4?N('pdv.fin.sl',20):N('pdv.chain.sl',8),
      sg=a.s===1?N('pdv.short.sk',2):a.s===2?N('pdv.mid.sk',3):a.i>=4?N('pdv.fin.sk',5):N('pdv.chain.sk',3),p=P();
    if(d.tut)k=N('pdv.tutG',.5)/*ECO?*/;
    var g=Math.round(r*k/5)*5,cap=Math.round(r*N('pdv.capRw',3));if(vow){g*=N('pdv.vow',2);fx*=N('pdv.vow',2);}
    var left=Math.max(0,cap-p.dg),over=g>left;g=Math.min(g,left);
    return {g:g,fx:fx,sg:sg,tro:over?N('pdv.overTro',1):0,cap:over&&!left?1:0};}
  function give(rwd){var p=P();if(rwd.g>0){S.gold+=rwd.g;ern('quest',rwd.g);p.dg+=rwd.g;}
    try{if(E.gv){if(rwd.fx)E.gv({fx:rwd.fx},'pdv');if(rwd.tro)E.gv({tr:rwd.tro,i:p.k},'pdv');}
      if(rwd.sg&&has('SL')&&SL()){var q=slSaga();q.p+=rwd.sg;if(sagaUd(q))q.u+=rwd.sg;}}catch(e){}}
  function rwStr(rwd){var a=[];if(rwd.g)a.push('+'+fn(rwd.g)+goldW());if(rwd.fx)a.push('⭐ +'+rwd.fx);if(rwd.tro)a.push(L('трофей','a trophy'));return a.join(' · ');}
  E.rwPreview=function(a){var d=D(a);return rwStr(reward(a,d,0));};

  function done(a,d){var p=P(),i=p.a.indexOf(a),vow=BB2.on('pdv')&&R&&typeof G!=='undefined'&&G&&G.bb2vow>0?1:0,rwd=reward(a,d,vow),inRun=R?1:0,txt=d.t(a.n),ku=null;
    roll();give(rwd);p.k++;p.dn++;if(a.t!=='c'){p.h.push(a.t);p.h=p.h.slice(-6);}
    stat('done',{t:a.t==='c'?chn(a.c).id+a.i:a.t,s:a.s,n:p.k,in:inRun,g:rwd.g});if(vow)stat('vowok',{s:a.s});if(rwd.cap)stat('cap',{n:p.dn});
    if(a.s===3){p.cs=a.i+1;if(p.cs>=5){var c=chn(a.c),num=c.kn?c.kn():(S.kills||0);p.cs=0;p.ci=a.c+1;p.cn++;if(p.ku.length<40)p.ku.push([a.c%CHN.length,num]);
        ku={c:c.id,n:p.cn,t:c.ku(fn(num)),src:'pdv'};stat('chain',{c:c.id,n:p.cn});}}
    if(i>=0)p.a.splice(i,1,spawn(a.s));
    var o={id:a.t==='c'?'c':a.t,key:d.key,n:a.n,s:a.s,c:a.t==='c'?chn(a.c).id:'',gold:rwd.g,run:inRun,vow:vow,text:txt,rw:rwStr(rwd),cap:rwd.cap,ku:ku};
    if(inRun){RUN_DONE.push(o);try{banner(L('Подвиг!','Deed done!'),L('Боян записал: ','Boyan wrote it down: ')+txt+(rwd.g?' · +'+fn(rwd.g):''),3);SND.chest();}catch(e){}hudTxt='';}
    else{try{save();SND.coin();toast('📜 '+L('Подвиг выполнен: ','Deed done: ')+txt+(o.rw?' · '+o.rw:'')+(rwd.cap?L(' · золото на сегодня спето','· today’s gold is all sung'):''));setGold();}catch(e){}
      if(ku)setTimeout(function(){E.kuShow(ku);},900);E.refresh();}
    BB2.ev('pdvDone',o);if(ku)BB2.ev('kuplet',ku);return o;}
  function check(){var p=P(),i,a,d,n=0;for(i=0;i<p.a.length&&n<6;i++){a=p.a[i];d=D(a);if(d&&val(a,d)>=need(a,d)){done(a,d);i=-1;n++;}}return n;}

  /* ---------- вход событий: шина (BB2.pdv) и счёт в бою ---------- */
  BB2.pdvIn=function(key,n,max){if(!E.on())return;
    if(R){R[key]=max?Math.max(R[key]||0,n):(R[key]||0)+n;return;}
    var p=P(),i,a,d,hit=0;ensure();for(i=0;i<p.a.length;i++){a=p.a[i];d=D(a);if(d&&d.key===key){a.p=d.max||max?Math.max(a.p,n):a.p+n;hit=1;}}
    if(hit&&!check()){try{save();}catch(e){}E.refresh();}};
  function flushQ(){var q=BB2.pdvQ||{},k;for(k in q){var v=q[k];delete q[k];if(v[0])BB2.pdvIn(k,v[0],0);if(v[1])BB2.pdvIn(k,v[1],1);}}
  function live(g){return !!(g&&g.q&&g.hero);}
  function pull(g){R.kills=g.kills|0;R.time=g.t||0;R.lvl=g.hero.lvl|0;R.chest=g.q.chests|0;R.dar=g.q.dars|0;R.evo=g.q.evos|0;}
  function runStart(g){RUN_DONE=[];hudTxt='';hud=null;if(!E.on()||!live(g)){R=null;return;}var p=P(),i;ensure();for(i=0;i<p.a.length;i++)delete p.a[i].b;R={boss:0};pull(g);HUDT=0;}
  BB2.hook('run',runStart);
  BB2.hook('bossDie',function(){if(R)R.boss=(R.boss||0)+1;});
  BB2.hook('frame',function(dt,g){if(!R||!g||g.over)return;HUDT-=dt;if(HUDT>0)return;HUDT=.25;pull(g);check();hudMake(g);});
  BB2.hook('end',function(g,win){if(BB2.on('pdv')&&E.on())g.questDone=[]; /* старая строка «Задание выполнено» — не про нас */
    if(!R){if(E.on()&&live(g)&&(g.t||0)>=30){R={boss:0};}else return;}
    var p=P(),i,a,d,camp=!g.endless&&!g.daily&&!g.weekly;
    if((g.t||0)>=30){pull(g);R.run=1;R.gold=g.reward|0;R.win=win&&camp?1:0;R.drun=g.daily&&g.t>=60?1:0;R.endless=g.endless&&!g.weekly?g.t:0;
      if(g.endless)R.boss=Math.max(R.boss||0,g.bossesKilled|0);
      R.star3=win&&camp&&g.starGot&&g.starGot.w&&g.starGot.d&&g.starGot.t?1:0;R.nores=win&&camp&&!g.falls?1:0;R.hard=win&&camp&&(g.dif==='s'||g.dif==='h')?1:0;
      check();p=P();for(i=0;i<p.a.length;i++){a=p.a[i];d=D(a);if(d)a.p=val(a,d);delete a.b;}}
    else for(i=0;i<p.a.length;i++)delete p.a[i].b;
    R=null;hud=null;});

  /* строка подвига в бою: готовая картинка, перерисовывается только когда меняется число (не чаще 4 раз в секунду) */
  function hudMake(g){if(!BB2.on('pdv'))return;var p=P(),best=null,bq=-1,i,a,d,q;
    for(i=0;i<p.a.length;i++){a=p.a[i];d=D(a);if(!d||!d.run||!d.h)continue;q=val(a,d)/need(a,d);if(q>bq){bq=q;best=a;}}
    if(!best){hud=null;return;}d=D(best);var t='📜 '+d.h()+' '+fn(shown(best,d))+' / '+fn(best.n);if(t===hudTxt&&hud)return;hudTxt=t;
    var k=Math.min(2,window.devicePixelRatio||1),w=190,h=22,c=hud&&hud.c||document.createElement('canvas');c.width=w*k;c.height=h*k;var x=c.getContext('2d');x.setTransform(k,0,0,k,0,0);x.clearRect(0,0,w,h);
    var f=typeof CVL!=='undefined'&&CVL.font?CVL.font:'sans-serif';x.font='800 13px '+f;x.textAlign='left';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=3.5;
    x.strokeStyle=typeof CVL!=='undefined'&&CVL.stroke?CVL.stroke:'#000';x.strokeText(t,3,h/2+.5);x.fillStyle='#ffe9a0';x.fillText(t,3,h/2+.5);hud={c:c,w:w,h:h};}
  BB2.hook('drawTop',function(c,g){if(!hud||!R||!g||g.over)return;var top=(window.__safeTop||0)+8;c.drawImage(hud.c,146,top+66,hud.w,hud.h);});

  /* ---------- замена подвига: раз в день бесплатно («Боян порвал струну») ---------- */
  E.swapOk=function(){return P().sw!==today();};
  E.swap=function(i){var p=P(),a=p.a[i];if(!a||a.s===3||!E.swapOk())return false;p.sw=today();if(a.t!=='c'){p.h.push(a.t);p.h=p.h.slice(-6);}p.a.splice(i,1);p.a.splice(i,0,spawn(a.s));
    p.a.sort(function(x,y){return x.s-y.s;});save();stat('swap',{t:a.t,s:a.s});return true;};

  /* ---------- куплет «Былины о тебе» ---------- */
  E.kuText=function(k){var c=CHN[k[0]%CHN.length];return c?c.ku(fn(k[1])):'';};
  E.kuShow=function(ku){try{if(document.body.classList.contains('run')||$('modal').classList.contains('on'))return; /* поверх чужого окна не лезем — куплет останется во вкладке «Подвиги» */
    showModal('<h3>'+L('Былина о тебе','The Ballad of You')+'</h3><p class="sub">'+L('Боян допел куплет № ','Boyan finished verse No. ')+ku.n+'</p><div class="card" style="font-size:15px;line-height:1.5;font-style:italic">«'+ku.t+'»</div>'+
      '<div class="btns"><button class="btn big" id="evKuOk">'+L('Славно!','Splendid!')+'</button></div>','evku');
    on('evKuOk',function(){hideModal();E.refresh();});}catch(e){}};
  E.runDone=function(){return RUN_DONE;};
  E.toKu=function(){var p=P();return 5-p.cs;};
  E.chainNow=function(){return chn(P().ci);};
  E.refresh=function(){try{if(document.body.classList.contains('run'))return;if(typeof curTab!=='undefined'&&(curTab==='Quests'||curTab==='Map')&&!$('modal').classList.contains('on'))openTab(curTab);else if(has('questBadge'))questBadge();}catch(e){}};
  E.icOk=icOk;E.D=D;E.ensure=ensure;E.flush=flushQ;
  /* движок приехал посреди похода — подхватываем его с нуля счётчиков */
  try{if(typeof G!=='undefined'&&G&&!G.over&&live(G)&&E.on()){runStart(G);}}catch(e){}
  return E;})();
