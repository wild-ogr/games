/* ===== bb2-sud-ui.js — «Суд над нечистью»: сцена суда, Книга судеб, блок в Тереме, диковина в бою. Догружается набором 'sud' (BB2.need('sud')). =====
   Заглушка js/bb2-sud.js держит только сохранение (починка + слияние) и догрузку. Здесь — всё остальное. Наружу: SUDX (вид) и BB2.sud (справка ниже). Без ?. ?? .finally.
   Флаг 'sud' (выключен → игра как v24.1: суда нет, мирные прибавки = 0, диковина молчит; сохранённые приговоры не теряются).
   После победы над боссом главы (не Сеча, не Поход дня, не Испытание): ПОЩАДИТЬ → служит во дворе, мирная прибавка; ПРОГНАТЬ → «диковина» в бой.
   Порядок с HERO: его кино-добивание и лубок идут в бою (пока G.winT), суд — после endRun, поверх окна итогов. Общих крючков нет.
   Сохранение S.bb2.sud: v{слот:'m'|'x'} — нынешний приговор; b{слот:1|2|3} — записи Книги судеб (1 помилован, 2 прогнан); p{слот:1} — побеждён, ждёт суда; tr — слот диковины в походе; ts.
   Мирные прибавки (числа — договор ECO, раздел sud): три вида по месту главы в земле — 1-я глава 'k' казна, 2-я 'h' урожай (грядки зреют быстрее), 3-я 's' слава (опыт славы за поход).
     Все пощажённые одного вида вместе — не больше sud.mercySum (+10 %). Прибавки МНОЖАТСЯ поверх чужих (обёртки afkRate / plotLeft / slRunXp), а не заменяют их.
   Для соседей (DVOR, BYL, EVENT):
     BB2.sud.yard() → [{slot,boss,t:'k'|'h'|'s'}] пощажённые (кого рисовать во дворе) · BB2.sud.st(слот) → {v,b,p} · BB2.sud.bonus('k'|'h'|'s') → доля (0…0,1) · BB2.sud.count() → {m,x,book,all}
     BB2.sud.name(слот) — имя босса главы · BB2.sud.open() — Книга судеб · BB2.sud.relic() — слот диковины или −1 · BB2.sud.relicOn(G) — работает ли она в этом походе
     событие шины: BB2.hook('sud',function(e){}) e={slot,boss,bv,v:'m'|'x',prev,first,entry,hero,src:'win'|'again'|'book'}; «Подвиги»: BB2.pdv('sud') / 'sud.m' / 'sud.x' / 'sud.book' (рекорд — записей в Книге)
     куплет для «Былины»: BB2.ev('kuplet',{c:'sud',t,src:'sud'}) — только за приговор после победы
     Соседям: до догрузки набора BB2.sud ещё нет — звать через BB2.after('sud',function(){…}) или проверять BB2.ready('sud'). */
var SUDX=(function(){
  var B=BB2,U={},X={};
  function N(k,d){return B.n('sud.'+k,d);}
  function on(){return B.on('sud');}
  function SS(){return B.s('sud');}
  /* ---------- главы и боссы ---------- */
  function camp(slot){return typeof CAMP_S!=='undefined'&&CAMP_S[slot]||null;}
  function slots(){return typeof ORD!=='undefined'?ORD.slice():[];} /* главы кампании по порядку мест */
  U.type=function(slot){var r=camp(slot);return r?(r.n===2?'h':r.n===3?'s':'k'):'k';};
  U.name=function(slot){var c=CH[slot];if(!c)return '';var v=c.bv&&BOSS[c.bv];return v&&v.n?L(v.n,v.en&&v.en.n||v.n):EN[c.boss]?EN[c.boss].n:'';};
  U.gen=function(slot){var c=CH[slot],v=c&&c.bv&&BOSS[c.bv];return v&&v.g||c&&EN[c.boss]&&EN[c.boss].g||'m';};
  U.S=SS;
  U.st=function(slot){var s=SS();return {v:s.v[slot]||'',b:s.b[slot]|0,p:s.p[slot]?1:0};};
  U.yard=function(){var s=SS(),a=[],l=slots(),i;if(!on())return a;for(i=0;i<l.length;i++)if(s.v[l[i]]==='m')a.push({slot:l[i],boss:CH[l[i]].boss,t:U.type(l[i])});return a;};
  U.count=function(){var s=SS(),o={m:0,x:0,book:0,all:slots().length*2,p:0},k;for(k in s.v)o[s.v[k]]++;for(k in s.b)o.book+=(s.b[k]&1)+(s.b[k]>>1&1);for(k in s.p)o.p++;return o;};

  /* ---------- мирные прибавки пощажённых ---------- */
  var CURVE=.5; /*ECO?*/ /* sud.curve: доля потолка = (пощажено вида / всех глав вида)^curve — первый пощажённый заметен (~3 %), все 11 дают ровно потолок */
  U.bonus=function(t){if(!on())return 0;var s=SS(),l=slots(),n=0,all=0,i,cap=Math.min(N('mercySum',.1),.1);
    for(i=0;i<l.length;i++)if(U.type(l[i])===t){all++;if(s.v[l[i]]==='m')n++;}
    if(!n||!all)return 0;return Math.min(cap,Math.round(cap*Math.pow(n/all,N('curve',CURVE))*1000)/1000);};
  /* что даст приговор «пощадить» сверх нынешнего (для карточки суда) */
  U.gain=function(slot){var s=SS(),t=U.type(slot),was=s.v[slot],a,b;if(was==='m')return 0;a=U.bonus(t);s.v[slot]='m';b=U.bonus(t);if(was)s.v[slot]=was;else delete s.v[slot];return Math.max(0,b-a);};
  /* обёртки: прибавка множится поверх того, что вернула прежняя функция (и чужие обёртки) — складывается с любыми другими бонусами */
  function wrap(nm,fn){try{var f=window[nm];if(typeof f!=='function'||f.sud)return;var w=function(a,b){return fn(f.apply(this,arguments),a,b);};w.sud=1;window[nm]=w;}catch(e){}}
  function wraps(){
    wrap('afkRate',function(r){var q=U.bonus('k');return q?Math.round(r*(1+q)):r;});                              /* казна: золота в час */
    wrap('plotLeft',function(r,p){var q=U.bonus('h');return q&&p&&r>0?Math.max(0,r-(+p.d||0)*q):r;});             /* урожай: грядка зреет быстрее */
    wrap('slRunXp',function(r){var q=U.bonus('s');return q?Math.round(r*(1+q)):r;});}                             /* слава: опыт за поход */
  wraps();B.hook('ready',wraps);B.hook('late',wraps); /* Подворье у новичка догружается позже — оборачиваем, когда появится */

  /* ---------- диковина (трофей «прогнал») в поход: одна; в рейтинговых режимах выключена ---------- */
  U.relic=function(){return on()?SS().tr:-1;};
  U.relicOn=function(g){if(!g||U.relic()<0)return false;
    if(N('noRank',1)&&(g.endless||g.daily||g.weekly||g.bb2lih||g.bb2most))return false; /* Сеча, Поход дня, Испытание; Лихая неделя и Калинов мост (признаки потока TAIL) — рейтинги честные */
    return true;};
  U.equip=function(slot){var s=SS();if(s.v[slot]!=='x')return false;s.tr=+slot;s.ts=Date.now();save();B.stat('sud_book',{a:'eq',c:+slot});return true;};

  /* ---------- приговор ---------- */
  U.judge=function(slot,v,src){var s=SS(),c=CH[slot];if(!c||(v!=='m'&&v!=='x'))return null;slot=+slot;
    var prev=s.v[slot]||'',bit=v==='m'?1:2,entry=!((s.b[slot]|0)&bit),e,tr='',n;
    s.v[slot]=v;s.b[slot]=(s.b[slot]|0)|bit;delete s.p[slot];s.ts=Date.now();
    if(v==='x'){if(s.v[s.tr]!=='x')s.tr=slot;}else if(s.tr===slot){s.tr=-1;for(n in s.v)if(s.v[n]==='x'){s.tr=+n;break;}}
    if(entry){n=N('bookTro',1);tr=camp(slot)?'tr_'+camp(slot).th:'';if(n>0&&tr&&typeof TRO_DEF!=='undefined'&&TRO_DEF[tr]&&typeof TRO_ADD==='function')TRO_ADD(tr,n);else tr='';} /* новая запись Книги — трофей земли */
    save();
    e={slot:slot,boss:c.boss,bv:c.bv||null,v:v,prev:prev,first:!prev,entry:entry,tro:tr,hero:typeof G!=='undefined'&&G?G.heroId:S.hero,src:src||'win'};
    B.stat('sud',{a:v,b:c.bv||c.boss,c:slot,f:prev?0:1,e:entry?1:0,s:e.src});
    if(typeof B.pdv==='function'){B.pdv('sud');B.pdv('sud.'+v);B.pdv('sud.book',U.count().book,1);}
    B.ev('sud',e);return e;};

  U.open=function(){if(on())X.book();};
  U.court=function(slot,cb){if(on())X.court(slot,{src:'book'},cb);};

  /* ---------- крючки ---------- */
  function chap(g){return !!g&&!g.endless&&!g.daily&&!g.weekly;}
  B.hook('run',function(g){if(!on())return;g.sd=null;
    if(U.relicOn(g))X.run(g);});
  X.late=function(g){if(!on()||g.sd)return;if(U.relicOn(g))X.run(g);}; /* набор догрузился уже в походе (зовёт заглушка) */
  B.hook('frame',function(dt,g){if(g.sd)X.frame(dt,g);});
  B.hook('drawTop',function(c,g){if(g.sd)X.drawTop(c,g);});
  B.hook('end',function(g,win){if(!on())return;if(g.sd)X.end(g,win);
    if(!win||!chap(g))return;var s=SS(),slot=g.chi;if(!CH[slot]||!camp(slot))return;
    g.sud={slot:slot,first:!s.v[slot],done:0};if(!s.v[slot])s.p[slot]=1;}); /* «ждёт суда» запоминаем сразу: закрыл игру посреди суда — дело останется в Книге */
  B.hook('modal',function(kind,m){if(!on())return;
    if(kind==='result'&&typeof G!=='undefined'&&G&&G.sud){
      X.result(m,G);}
    else if(kind==='terem'){var c=U.count();if(c.m+c.x+c.p>0)X.terem(m);}});
  /* вход в Книгу судеб: карточка в деревне (когда есть хоть одно дело) и строка на карточке главы */
  B.hook('vil',function(el){if(!on()||!el)return;var c=U.count();if(c.m+c.x+c.p<=0)return;
    var d=document.createElement('div');d.className='card'+(c.p?' next':'');d.id='sudCard';
    d.innerHTML='<div class="row"><img class="ic" src="'+ic('p_amulet',96)+'"><div class="t"><b>'+L('⚖ Книга судеб','⚖ Book of Fates')+' · '+c.book+'/'+c.all+'</b><span>'+
      (c.p?L('Ждут суда: ','Awaiting judgment: ')+c.p+' · ':'')+L('во дворе служат: ','serving in the yard: ')+c.m+L(' · прогнано: ',' · banished: ')+c.x+'</span></div><button class="btn'+(c.p?' gold':' ghost')+'" id="sudGo">'+L('Открыть','Open')+'</button></div>';
    el.appendChild(d);var b=d.querySelector('#sudGo');b.onclick=function(){try{SND.click();}catch(e){}U.open();};});
  B.hook('chInfo',function(slot,sel,info){if(!on()||!info||!camp(slot)||!S.done[slot])return;var q=U.st(slot),f=U.gen(slot),t;
    t=q.v==='m'?L(f==='f'?'пощажена — служит во дворе':f==='n'?'пощажено — служит во дворе':'пощажён — служит во дворе','spared — serves in your yard'):
      q.v==='x'?L(f==='f'?'прогнана — диковина твоя':f==='n'?'прогнано — диковина твоя':'прогнан — диковина твоя','banished — the relic is yours'):
      q.p?L('ждёт твоего суда','awaits your judgment'):L('одолей ещё раз — и суди','beat again to judge');
    B.put(info,'end','<button class="sudln" id="sudLn" style="display:block;width:100%;margin-top:8px;padding:7px 10px;border-radius:12px;background:rgba(255,216,74,.12);border:1px solid rgba(255,216,74,.35);color:inherit;font-size:13px;font-weight:700;text-align:left">⚖ '+U.name(slot)+': '+t+
      (q.v&&q.b!==3?' <span style="opacity:.75;font-weight:600">· '+L('победи снова — можно передумать','win again to change your mind')+'</span>':'')+'</button>','sudLnB');
    var b=document.getElementById('sudLn');if(b)b.onclick=function(){try{SND.click();}catch(e){}U.open();};});

  B.sud=U;
  function calm(){try{return typeof CALM==='function'&&CALM();}catch(e){return false;}}
  function el(id){return document.getElementById(id);}
  function snd(k){try{if(SND[k])SND[k]();}catch(e){}}
  function pct(v){var p=Math.round(v*1000)/10;return (p%1?dec(p,1):String(p))+(LANG==='en'?'%':' %');}

  /* ---------- 33 дела: [слот, мольба босса, служба пощажённого, диковина, как бьёт]. Как бьёт: r — круг у богатыря, b — пять ближних, g — самого крепкого, w — всех на экране ---------- */
  function cases(){return [
    [0,L('Не губи, богатырь! Буду по утрам свистеть вместо петуха. Тихонько!','Spare me, hero! I’ll whistle you awake instead of the rooster. Quietly!'),L('Сторожит казну: свистнет — у воров шапки слетают','Guards the treasury: one whistle and thieves lose their hats'),L('Соловьиный свист','Nightingale’s Whistle'),'r'],
    [8,L('Не гони! Я санитар леса. Могу и огорода.','Don’t chase me off! I keep the forest tidy. Gardens too.'),L('Гоняет зайцев с грядок','Chases hares off the garden beds'),L('Волчий клык','Wolf Fang'),'g'],
    [9,L('Опять ты?! Ладно, гнездо твоё. Только птенцов не буди.','You again?! Fine, the nest is yours. Just don’t wake the chicks.'),L('Свистит о твоих подвигах на всю округу','Whistles about your deeds for all to hear'),L('Разбойничья дудка','Robber’s Pipe'),'w'],
    [1,L('Не губи, касатик! Накормлю, напою… и в печь не посажу. Честное слово!','Spare me, dearie! I’ll feed you, and I won’t put you in the oven. Promise!'),L('Считает казну на костяных счётах — ни монетки мимо','Counts the treasury on a bone abacus — not a coin slips by'),L('Ягино помело','Yaga’s Broom'),'r'],
    [10,L('Отпусти, служивый! Огород полью — у меня воды целое болото.','Let me go! I’ll water your garden — I own a whole swamp of water.'),L('Поливает грядки. Лягушки — в подарок','Waters the beds. Frogs come free'),L('Болотный пузырь','Swamp Bubble'),'r'],
    [11,L('Избушку-то оставь! Она только к лесу задом стоять привыкла.','Leave the hut alone! It only just learned which way to face.'),L('Рассказывает сказки про тебя. Привирает, но красиво','Tells tales about you. Embellished, but nicely'),L('Курья ножка','Chicken Leg'),'g'],
    [2,L('— Не руби! — Не руби! — А я вообще спал…','“Don’t chop!” “Don’t chop!” “I was asleep anyway…”'),L('Три головы — три сторожа казны. Спят по очереди','Three heads — three treasury guards. They nap in shifts'),L('Горынычев чих','Gorynych’s Sneeze'),'w'],
    [12,L('Не гони! Я пашу за двоих: и за коня, и за пахаря.','Don’t send me away! I plough for two: the horse and the ploughman.'),L('Пашет грядки. Сам себе конь','Ploughs the beds. His own horse'),L('Полканова подкова','Polkan’s Horseshoe'),'g'],
    [13,L('Мы посовещались. Большинством голов — сдаёмся!','We took a vote. By a majority of heads — we surrender!'),L('Поёт о тебе на три голоса. Средняя фальшивит','Sings of you in three voices. The middle one is flat'),L('Змеиный зуб','Serpent’s Tooth'),'b'],
    [3,L('Не губи! Я бессмертный, но мне всё равно обидно. Давай казну посчитаю?','Spare me! I’m deathless, but it still hurts my feelings. Shall I count your gold?'),L('Чахнет над твоей казной. От этого золото прибывает','Pines over your treasury. Somehow the gold grows'),L('Кощеева игла','Koschei’s Needle'),'g'],
    [14,L('Кар-р-раул! Не гони! Пойду пугалом. Бесплатно!','Caw-caw-mercy! I’ll be your scarecrow. For free!'),L('Работает пугалом. Сам себя боится','Works as a scarecrow. Scares himself'),L('Вороново перо','Raven’s Feather'),'b'],
    [15,L('Яйцо верни, а? Ну хоть утку. Ну хоть зайца!','Give back the egg, eh? Or at least the duck. Or the hare!'),L('Пишет летопись твоих подвигов. Времени у него — вечность','Writes the chronicle of your deeds. He has eternity for it'),L('Яйцо с секретом','Egg with a Secret'),'r'],
    [16,L('Не гони, хозяин! Чудь копать умеет. Где скажешь — там и клад.','Don’t send us off, master! We dig. Point anywhere — there’s your treasure.'),L('Стережёт казну под землёй — глубоко и надёжно','Guards the treasury underground — deep and safe'),L('Чудская кирка','Chud Pickaxe'),'g'],
    [17,L('Ш-ш-шутишь? Я золото под землёй вижу. И репу тоже.','You j-j-jest? I can see gold underground. Turnips too.'),L('Рыхлит грядки изнутри','Loosens the beds from below'),L('Полозов след','Poloz’s Trail'),'b'],
    [18,L('Что, богатырь, не вышел каменный цветок? Зато шкатулку подарю.','So, hero, no stone flower today? Have a casket instead.'),L('Высекает твои подвиги в малахите','Carves your deeds in malachite'),L('Малахитовая шкатулка','Malachite Casket'),'r'],
    [4,L('Не губи! Я казну заморожу — ни одна монета не утечёт.','Spare me! I’ll freeze your treasury — not a coin will leak.'),L('Держит казну в холоде: золото не портится','Keeps the treasury chilled: gold stays fresh'),L('Ледяной посох','Ice Staff'),'w'],
    [19,L('Не гони… Я большой, но тихий. Могу воду носить. Озёрами.','Don’t send me off… I’m big but quiet. I can carry water. By the lake.'),L('Носит воду на грядки. Вёдра — с баню','Carries water to the beds. Buckets the size of a bathhouse'),L('Великанья рукавица','Giant’s Mitten'),'g'],
    [20,L('Чертог оставь! Там только ремонт закончили!','Leave the hall! We’ve only just finished renovating!'),L('Рисует твои подвиги узорами на окнах','Paints your deeds as frost on the windows'),L('Сосулька-громадина','Whopping Icicle'),'b'],
    [5,L('Не губи! Жемчугом откуплюсь. Мелким, но откуплюсь.','Spare me! I’ll pay in pearls. Small ones, but still.'),L('Сыплет в казну жемчуг. Мелкий, зато каждый день','Pours pearls into the treasury. Small, but daily'),L('Царский трезубец','Royal Trident'),'b'],
    [21,L('Отпусти — на спине огород разобью. Там уже и село стоит.','Let me go — I’ll plant a garden on my back. There’s a village up there already.'),L('Пускает фонтан на грядки','Sprays a fountain over the beds'),L('Китовый фонтан','Whale Fountain'),'r'],
    [22,L('Гусляра позвать? Спляшу! Только не до бури.','Shall I call the gusli player? I’ll dance! Just not up a storm.'),L('Пляшет под гусли о твоих подвигах. Море волнуется','Dances to songs of your deeds. The sea gets excited'),L('Морская волна','Sea Wave'),'w'],
    [23,L('Мур-р… Не гони. Цепь златую сам сдам. В казну.','Purr… Don’t chase me off. I’ll hand in the golden chain myself. To the treasury.'),L('Ходит вокруг казны: направо — считает, налево — пересчитывает','Walks round the treasury: right — counts, left — recounts'),L('Златая цепь','Golden Chain'),'r'],
    [24,L('Не гони! Колдовать брошу. Почти.','Don’t banish me! I’ll quit sorcery. Almost.'),L('Колдует над репой. Зреет как в сказке','Enchants the turnips. They ripen like in a fairy tale'),L('Колдовской посох','Sorcerer’s Staff'),'b'],
    [25,L('Только бороду не трогай! В ней вся сила. И крошки.','Just don’t touch the beard! All my power is in it. And crumbs.'),L('Летает над полями и трубит о тебе','Flies over the fields trumpeting your name'),L('Клок бороды Черномора','Tuft of Chernomor’s Beard'),'w'],
    [6,L('Не губи! Я дань собирать умею. В твою казну. Вежливо!','Spare me! I can collect tribute. For your treasury. Politely!'),L('Собирает дань в твою казну. Вежливо, как обещал','Collects tribute for your treasury. Politely, as promised'),L('Тугаринов кнут','Tugarin’s Whip'),'b'],
    [26,L('И-го-го… то есть не гони! Теплицу обогрею.','Neigh… I mean, nay, don’t! I’ll heat your greenhouse.'),L('Греет грядки — урожай и в мороз','Warms the beds — harvest even in frost'),L('Огненная подкова','Fiery Horseshoe'),'r'],
    [27,L('Шатёр бери, коня бери, только не позорь!','Take the tent, take the horse, just spare my pride!'),L('Ездит по степи и хвалит тебя. Сквозь зубы','Rides the steppe praising you. Through gritted teeth'),L('Змеиные крылья','Serpent Wings'),'w'],
    [28,L('Га-га-гарантирую: унесём что скажешь. Детей — нет, мы завязали.','Honk-honk-honest: we’ll carry anything. Not children — we quit that.'),L('Стая носит монеты в казну. По одной, зато строем','The flock flies coins to the treasury. One each, in formation'),L('Лебединое перо','Swan Feather'),'b'],
    [29,L('Не гони, милок! Дождик нужен? Грибной, слепой, проливной?','Don’t chase me, love! Need rain? Drizzle, shower, downpour?'),L('Поливает грядки дождём по расписанию','Waters the beds with rain on schedule'),L('Громовая скалка','Thunder Rolling Pin'),'g'],
    [30,L('Отпусти — разнесу!.. В смысле, славу твою разнесу. По свету.','Let me go or I’ll blow… your fame all over the world, I mean.'),L('Разносит славу о тебе по белу свету','Carries your fame around the wide world'),L('Вихрь в мешке','Whirlwind in a Sack'),'r'],
    [7,L('Не губи! Глаз с казны не спущу. Он у меня один, зато какой!','Spare me! I won’t take my eye off the treasury. I’ve only one, but what an eye!'),L('Глаз с казны не спускает. Единственный','Never takes its eye off the treasury. Its only one'),L('Лихой глаз','Evil Eye'),'g'],
    [31,L('Мяу… Не гони. Буду грядкам сказки сказывать — заслушаются и вырастут.','Meow… Don’t chase me. I’ll tell the garden bedtime stories — it’ll grow just listening.'),L('Баюкает грядки. Растут во сне','Lulls the beds. They grow in their sleep'),L('Баюнов коготь','Bayun’s Claw'),'b'],
    [32,L('Ладно-ладно! Беда не приходит одна — я с подарком!','All right, all right! Trouble never comes alone — I brought a gift!'),L('Ходит по чужим дворам, а про тебя — только хорошее','Visits other people’s yards, but says only good things about you'),L('Беда в кармане','Pocket of Trouble'),'w']];}
  var CC=null,CL='';
  function cs(slot){if(!CC||CL!==LANG){CC={};CL=LANG;var a=cases(),i;for(i=0;i<a.length;i++)CC[a[i][0]]={plea:a[i][1],job:a[i][2],rel:a[i][3],k:a[i][4]};}
    return CC[slot]||{plea:L('Не губи, богатырь! Пригожусь!','Spare me, hero! I’ll be useful!'),job:L('Служит во дворе','Serves in your yard'),rel:L('Диковина','Relic'),k:'r'};}
  /* как бьёт диковина: откат = sud.troCd × множитель (не короче troCd); сила = sud.troDmg от урона богатыря за это время — у всех одна */
  var ARCH={r:{cd:1,R:170,col:'#ffd84a'},b:{cd:1,n:5,col:'#8ad8ff'},g:{cd:1.5,col:'#ff8a5a'},w:{cd:1.33,col:'#c9a6ff'}}; /*ECO?*/ /* sud.arch: множители отката и число целей */
  function relCd(k){return Math.max(N('troCd',30),Math.round(N('troCd',30)*BB2.n('sud.arch.'+k,ARCH[k].cd)));} /* MERGE: множители — из договора ECO v4 sud.arch */
  function relHow(k){var t=relCd(k);return k==='r'?L('раз в '+t+' с бьёт всю нечисть рядом с тобой','every '+t+' s it strikes all monsters near you'):
    k==='b'?L('раз в '+t+' с бьёт пятерых ближних врагов','every '+t+' s it strikes the five nearest enemies'):
    k==='g'?L('раз в '+t+' с бьёт самого крепкого врага','every '+t+' s it strikes the toughest enemy'):L('раз в '+t+' с задевает всю нечисть на экране','every '+t+' s it hits every monster on screen');}
  function tName(t){return t==='k'?L('казна копит быстрее','treasury fills faster'):t==='h'?L('грядки зреют быстрее','garden beds ripen faster'):L('больше славы за поход','more fame per run');}
  function tShort(t){return t==='k'?L('Казна','Treasury'):t==='h'?L('Урожай','Harvest'):L('Слава','Fame');}
  function vWord(slot,v){var f=U.gen(slot);return v==='m'?L(f==='f'?'помилована':f==='n'?'помиловано':'помилован','spared'):L(f==='f'?'прогнана':f==='n'?'прогнано':'прогнан','banished');}
  X.info=function(slot){var c=cs(slot);return {plea:c.plea,job:c.job,relic:c.rel,how:relHow(c.k),k:c.k,cd:relCd(c.k)};}; /* для DVOR и BYL */

  /* ---------- вид ---------- */
  var cssOn=0;
  function css(){if(cssOn)return;cssOn=1;var s=document.createElement('style');s.textContent=
    '#sudOv{position:fixed;top:0;right:0;bottom:0;left:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(10,6,14,.86);padding:10px;overflow-x:hidden;overflow-y:auto;-webkit-tap-highlight-color:transparent}'+
    '#sudOv .sdc{position:relative;overflow:hidden;width:100%;max-width:400px;margin:auto;background:#f3e4bf;color:#3a2206;border:4px solid #7a2a1a;border-radius:16px;padding:10px 12px 12px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.6);font-family:inherit}'+
    '#sudOv .sdc:before{content:"";position:absolute;top:5px;right:5px;bottom:5px;left:5px;border:1.5px solid #c08a2e;border-radius:10px;pointer-events:none}'+
    '#sudOv h4{margin:0;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#7a2a1a;font-weight:900}'+
    '#sudOv .sdn{font-size:20px;font-weight:900;margin:2px 0 0;line-height:1.15}'+
    '#sudOv .sdi{position:relative;height:124px;margin:2px 0 0}'+
    '#sudOv .sdi i{position:absolute;left:50%;bottom:6px;width:120px;height:18px;margin-left:-60px;border-radius:50%;background:rgba(58,34,6,.22)}'+
    '#sudOv .sdi img{position:absolute;left:50%;bottom:8px;width:124px;height:124px;margin-left:-62px;transform-origin:50% 92%;transform:rotate(14deg) scale(.94,.8);transition:transform .45s,opacity .45s}'+
    '#sudOv.m .sdi img{transform:rotate(0) scale(1)}#sudOv.x .sdi img{transform:translateX(210px) rotate(40deg) scale(.6);opacity:0}'+
    '#sudOv .sdp{position:relative;background:#fffaf0;border:1.5px solid #c08a2e;border-radius:12px;padding:7px 10px;margin:4px 2px 9px;font-size:14px;font-weight:700;line-height:1.3;font-style:italic}'+
    '#sudOv .sdp:before{content:"";position:absolute;left:50%;top:-7px;width:11px;height:11px;margin-left:-6px;background:#fffaf0;border-left:1.5px solid #c08a2e;border-top:1.5px solid #c08a2e;transform:rotate(45deg)}'+
    '#sudOv .sdb{display:flex;gap:8px}'+
    '#sudOv .sdo{flex:1 1 0;min-width:0;min-height:112px;border-radius:14px;padding:8px 7px;border:2px solid #2f7a3a;background:linear-gradient(180deg,#e2f3d0,#c4e2a8);color:#17360f;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.18)}'+
    '#sudOv .sdo.x{border-color:#9a2a1a;background:linear-gradient(180deg,#ffe1cf,#f6bfa2);color:#4a130a}'+
    '#sudOv .sdo b{font-size:17px;font-weight:900;line-height:1.1}#sudOv .sdo span{font-size:12.5px;font-weight:700;line-height:1.25}#sudOv .sdo em{font-style:normal;font-size:12.5px;font-weight:900;margin-top:auto;background:rgba(255,255,255,.6);border-radius:8px;padding:2px 7px}'+
    '#sudOv .sdo.cur{box-shadow:0 0 0 3px #ffd84a,0 3px 0 rgba(0,0,0,.18)}#sudOv .sdo[disabled]{opacity:.55}'+
    '#sudOv .sdh{font-size:12px;font-weight:700;opacity:.8;margin:8px 0 0;line-height:1.3}'+
    '#sudOv .sdk{margin-top:8px;width:100%;min-height:44px;border-radius:12px;border:1.5px solid #a07a3a;background:rgba(255,255,255,.5);color:#3a2206;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer}'+
    '#sudOv .sds{position:absolute;left:50%;top:74px;margin-left:-120px;width:240px;text-align:center;font-size:26px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;padding:3px 0;border:4px solid;border-radius:10px;transform:rotate(-11deg) scale(2.2);opacity:0;transition:transform .28s cubic-bezier(.2,1.5,.4,1),opacity .2s;pointer-events:none;background:rgba(243,228,191,.85)}'+
    '#sudOv .sds.on{transform:rotate(-11deg) scale(1);opacity:1}#sudOv.m .sds{color:#2f7a3a}#sudOv.x .sds{color:#a02a1a}'+
    '#sudOv.calm .sdi img,#sudOv.calm .sds{transition:none}'+
    '@media (max-height:600px){#sudOv .sdi{height:92px}#sudOv .sdi img{width:92px;height:92px;margin-left:-46px}#sudOv .sdo{min-height:96px}#sudOv .sds{top:52px}}'+
    '.sudres{display:flex;align-items:center;gap:8px;margin:6px 0;padding:6px 9px;border-radius:12px;background:rgba(255,216,74,.14);border:1px solid rgba(255,216,74,.4);font-size:13px;font-weight:700;line-height:1.3;text-align:left}'+
    '.sudres img{width:34px;height:34px;flex:none}.sudres span{flex:1;min-width:0}.sudres button{flex:none;min-height:36px;padding:4px 9px;border-radius:10px;border:1px solid rgba(120,80,20,.5);background:rgba(255,255,255,.14);color:inherit;font-family:inherit;font-size:12.5px;font-weight:800}'+
    '.sudbk .sdsum{display:flex;gap:6px;margin:8px 0}.sudbk .sdsum div{flex:1;border-radius:12px;padding:6px 4px;text-align:center;background:rgba(255,216,74,.14);border:1px solid rgba(255,216,74,.4);font-size:12px;font-weight:700;line-height:1.25}.sudbk .sdsum b{display:block;font-size:17px}'+
    '.sudbk .sdrow{display:flex;align-items:center;gap:8px;padding:7px 4px;border-top:1px dashed rgba(120,80,20,.35);text-align:left}'+
    '.sudbk .sdrow img{width:44px;height:44px;flex:none}.sudbk .sdrow .t{flex:1;min-width:0;font-size:12.5px;line-height:1.3}.sudbk .sdrow .t b{display:block;font-size:14px}'+
    '.sudbk .sdrow.no{opacity:.55}.sudbk .sdrow.no img{filter:grayscale(1)}'+
    '.sudbk .sdm{display:inline-block;min-width:22px;text-align:center;border-radius:7px;padding:1px 4px;margin-right:3px;font-size:12px;font-weight:900;border:1px solid rgba(120,80,20,.45);opacity:.4}.sudbk .sdm.on{opacity:1;background:rgba(255,216,74,.3)}'+
    '.sudbk .sdrow button{flex:none;min-height:40px;max-width:104px;padding:4px 8px;border-radius:10px;font-family:inherit;font-size:12.5px;font-weight:800;line-height:1.15;white-space:normal;border:1px solid rgba(120,80,20,.5);background:rgba(255,255,255,.14);color:inherit}'+
    '.sudbk .sdrow button.go{background:linear-gradient(180deg,#ffd84a,#f0a020);color:#3a2206;border-color:#b87a10}.sudbk .sdrow button.eq{background:rgba(63,207,94,.22)}'+
    '.sudbk h4{margin:12px 0 2px;font-size:14px;text-align:left}'+
    '.sudtm{margin:8px 0;padding:8px 10px;border-radius:14px;background:rgba(255,216,74,.12);border:1px solid rgba(255,216,74,.4);text-align:left}.sudtm b{font-size:14px}'+
    '.sudtm .sdy{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0}.sudtm .sdy img{width:38px;height:38px}.sudtm p{margin:0 0 6px;font-size:12.5px;line-height:1.3}';
    document.head.appendChild(s);}

  /* ---------- сцена суда (поверх любого окна). o: {src:'win'|'again'|'book'}; cb(e|null) — после приговора или «оставить» ---------- */
  var ov=null;
  X.open=function(){return !!ov;};
  X.court=function(slot,o,cb){if(ov||!CH[slot])return;css();o=o||{};
    var c=cs(slot),q=U.st(slot),t=U.type(slot),nm=U.name(slot),gain=U.gain(slot),t0=Date.now(),done=0,d=document.createElement('div'),key;
    d.id='sudOv';if(calm())d.className='calm';
    d.innerHTML='<div class="sdc"><h4>'+L('Суд над нечистью','Judgment of the Unclean')+'</h4><div class="sdn">'+nm+'</div>'+
      '<div class="sdi"><i></i><img src="'+ic(CH[slot].boss,256)+'" alt=""><div class="sds" id="sudSt"></div></div>'+
      '<div class="sdp">'+qt(c.plea)+'</div>'+
      '<div class="sdb"><button class="sdo m'+(q.v==='m'?' cur':'')+'" id="sudM"><b>🕊 '+L('Пощадить','Spare')+'</b><span>'+c.job+'</span><em>'+
        (q.v==='m'?L('уже служит','already serving'):tShort(t)+' +'+pct(gain))+'</em></button>'+
      '<button class="sdo x'+(q.v==='x'?' cur':'')+'" id="sudX"><b>⚔ '+L('Прогнать','Banish')+'</b><span>'+L('Диковина в бой: ','A relic for battle: ')+'<br>'+qt(c.rel)+'</span><em>'+
        (q.v==='x'?L('уже твоя','already yours'):L('бьёт раз в '+relCd(c.k)+' с','strikes every '+relCd(c.k)+' s'))+'</em></button></div>'+
      '<div class="sdh">'+(q.v?L('Сейчас: '+vWord(slot,q.v)+'. Можно передумать — или оставить как есть.','Now: '+vWord(slot,q.v)+'. Change your mind — or leave it be.'):
        L('Оба решения хороши. Передумаешь — победи его ещё раз.','Both choices are good. To change your mind, beat him again.'))+'</div>'+
      (q.v?'<button class="sdk" id="sudK">'+L('Оставить как есть','Leave it be')+'</button>':'')+'</div>';
    document.body.appendChild(d);ov=d;B.stat('sud',{a:'see',b:CH[slot].bv||CH[slot].boss,c:slot,f:q.v?0:1,s:o.src||'win'});
    function close(e){document.removeEventListener('keydown',key,true);if(d.parentNode)d.parentNode.removeChild(d);ov=null;if(cb)try{cb(e);}catch(x){}}
    function pick(v){if(done||Date.now()-t0<450)return; /* защита от случайного касания: окно появилось под пальцем */
      done=1;var e=v?U.judge(slot,v,o.src||'win'):null,st=el('sudSt');
      if(!v){snd('click');B.stat('sud',{a:'keep',c:slot,ms:Date.now()-t0});close(null);return;}
      d.className+=' '+v;if(st){st.textContent=vWord(slot,v);st.className='sds on';}snd(v==='m'?'chest':'win');try{vib(40,1);}catch(x){}
      var b=d.querySelectorAll('button'),i;for(i=0;i<b.length;i++)b[i].disabled=true;
      if(e&&e.tro&&o.src==='book'&&typeof toast==='function')toast(L('Новая запись в Книге судеб: +1 ','New entry in the Book of Fates: +1 ')+(typeof troName==='function'?troName(e.tro).toLowerCase():''));
      setTimeout(function(){close(e);},calm()?500:1050);}
    el('sudM').onclick=function(){pick('m');};el('sudX').onclick=function(){pick('x');};if(el('sudK'))el('sudK').onclick=function(){pick('');};
    key=function(e){if(!ov)return;var k=e.code;e.stopPropagation(); /* клавиши не должны нажать «Забрать» в итогах под судом */
      if(k==='Digit1'||k==='ArrowLeft'){e.preventDefault();pick('m');}else if(k==='Digit2'||k==='ArrowRight'){e.preventDefault();pick('x');}
      else if(k==='Escape'&&q.v){e.preventDefault();pick('');}else if(k==='Enter'||k==='Space')e.preventDefault();};
    document.addEventListener('keydown',key,true);};

  /* ---------- итоги похода: первый раз — суд сам; уже судил — строка с кнопкой «Пересудить» ---------- */
  function kuplet(e){var n=U.name(e.slot),a=e.v==='m'?[L('Суд был скор: «'+n+' — во двор!»','The court was brief: “'+n+' — to the yard!”'),L('Не казнил, а пожалел: '+n+' — при деле, цел.',''+n+' was shown mercy — and given a job.')]:
      [L('Суд был скор: «'+n+' — за бугор!»','The court was brief: “'+n+' — over the hills!”'),L('Гнал до самых до ворот: '+n+' — и в огород не зайдёт.',''+n+' was chased past the gate — and won’t be back.')];
    return a[(e.slot+(e.first?0:1))%a.length];}
  function resLine(m,g){var s=g.sud,slot=s.slot,q=U.st(slot),c=cs(slot),t=U.type(slot),h;if(!q.v)return;
    h='<div class="sudres"><img src="'+ic(CH[slot].boss,96)+'" alt=""><span>⚖ <b>'+U.name(slot)+' — '+vWord(slot,q.v)+'</b><br>'+
      (q.v==='m'?c.job+' · '+tShort(t)+' +'+pct(U.bonus(t)):L('Диковина «'+c.rel+'» — '+(U.relic()===slot?'с тобой в походе':'в Книге судеб'),'Relic “'+c.rel+'” — '+(U.relic()===slot?'goes with you':'in the Book of Fates')))+
      (s.tro?' · '+L('в Книгу судеб: +1 ','Book of Fates: +1 ')+(typeof troName==='function'?troName(s.tro).toLowerCase():''):'')+'</span>'+
      (s.first?'':'<button id="sudRe">'+L('Пересудить','Rejudge')+'</button>')+'</div>';
    B.put(m,'top',h,'sudResB');
    var b=el('sudRe');if(b)b.onclick=function(){snd('click');X.court(slot,{src:'again'},function(e){if(e)after(g,e);var q2=el('mBody');if(q2&&q2.getAttribute('data-w')==='result')resLine(q2,g);});};}
  function after(g,e){g.sud.done=1;if(e&&e.tro)g.sud.tro=e.tro;if(e&&e.src!=='book')B.ev('kuplet',{c:'sud',t:kuplet(e),src:'sud'});}
  BB2.hook('run',function(){var o=el('sudOv');if(o&&o.parentNode)o.parentNode.removeChild(o);}); /* MERGE: суд не висит поверх нового похода (босс остаётся «ждёт суда» в Книге судеб) */
  function quiet(m,g){var b=m.querySelector('.goldrow');if(!b||m.querySelector('#sudLater'))return;var d=document.createElement('p');d.className='sub';d.id='sudLater';
    d.innerHTML='⚖ '+L(U.name(g.sud.slot)+' ждёт твоего суда — рассудишь потом, в деревне: «Книга судеб»',U.name(g.sud.slot)+' awaits your judgment — decide later in the village: Book of Fates');b.parentNode.insertBefore(d,b.nextSibling);}
  X.result=function(m,g){var s=g.sud;if(!s)return;css();
    if(s.first&&!s.done&&B.nvq&&B.nvq()){if(!s.lat){s.lat=1;B.stat('sud',{a:'later',c:s.slot});}quiet(m,g);return;} /* ok2: новичку суд — потом, в Книге судеб (дело уже записано «ждёт суда») */
    if(s.first&&!s.done&&!s.ask){s.ask=1;setTimeout(function(){var q0=el('mBody');if(!q0||q0.getAttribute('data-w')!=='result'||!el('modal').classList.contains('on')||(typeof G!=='undefined'&&G&&G!==g&&!G.over)){s.ask=0;return;}X.court(s.slot,{src:'win'},function(e){after(g,e);var q=el('mBody');if(q&&q.getAttribute('data-w')==='result')resLine(q,g);});},120);return;} /* MERGE: суд — через кадр после окна итогов (переход «итог похода» на слабом телефоне легче) */
    resLine(m,g);};

  /* ---------- Книга судеб ---------- */
  X.book=function(back){css();var l=typeof ORD!=='undefined'?ORD:[],cn=U.count(),rl=U.relic(),h,i,slot,q,c,t,th='',r,open;
    h='<h3>'+L('⚖ Книга судеб','⚖ Book of Fates')+'</h3><div class="sudbk"><p class="sub">'+L('Победил босса — реши его судьбу: пощадишь — служит во дворе, прогонишь — оставит диковину в бой. Записей — по две на каждого.',
      'Beat a boss and decide his fate: spare him and he serves in your yard, banish him and he leaves a relic for battle. Two entries for each.')+'</p>'+
      '<div class="sdsum"><div><b>'+cn.book+'/'+cn.all+'</b>'+L('записей','entries')+'</div><div><b>+'+pct(U.bonus('k'))+'</b>'+tShort('k')+'</div><div><b>+'+pct(U.bonus('h'))+'</b>'+tShort('h')+'</div><div><b>+'+pct(U.bonus('s'))+'</b>'+tShort('s')+'</div></div>'+
      '<p class="sub" style="text-align:left">'+(rl>=0?L('⚔ В поход идёт диковина «'+cs(rl).rel+'»: '+relHow(cs(rl).k)+'. Сила — '+pct(N('troDmg',.03))+' твоего урона за это время. В Сече, Походе дня и Испытании диковины молчат.',
        '⚔ Relic “'+cs(rl).rel+'” goes with you: '+relHow(cs(rl).k)+'. Power — '+pct(N('troDmg',.03))+' of your damage over that time. Relics stay silent in Endless Battle, Daily Run and the Trial.'):
        L('⚔ Диковины пока нет: прогони кого-нибудь — и он оставит её тебе в бой.','⚔ No relic yet: banish someone and he’ll leave you one for battle.'))+'</p>';
    for(i=0;i<l.length;i++){slot=l[i];r=typeof CAMP_S!=='undefined'&&CAMP_S[slot];if(!r||!CH[slot])continue;q=U.st(slot);c=cs(slot);t=U.type(slot);open=!!S.done[slot];
      if(r.th!==th){th=r.th;h+='<h4>'+(typeof TH!=='undefined'&&TH[th]&&TH[th].name||'')+'</h4>';}
      h+='<div class="sdrow'+(open?'':' no')+'"><img src="'+ic(CH[slot].boss,96)+'" alt=""><div class="t"><b>'+(open?U.name(slot):'???')+'</b>'+
        '<span class="sdm'+(q.b&1?' on':'')+'">🕊</span><span class="sdm'+(q.b&2?' on':'')+'">⚔</span>'+
        (!open?L('одолей босса главы «'+CH[slot].name+'»','beat the boss of “'+CH[slot].name+'”'):q.v==='m'?c.job+' · '+tShort(t):q.v==='x'?L('диковина «'+c.rel+'»','relic “'+c.rel+'”'):
          q.p?L('ждёт твоего суда','awaits your judgment'):L('одолей ещё раз — и суди','beat again to judge'))+'</div>'+
        (q.p?'<button class="go" data-sj="'+slot+'">'+L('Судить','Judge')+'</button>':q.v==='x'?(rl===slot?'<button class="eq" disabled>'+L('в походе','equipped')+'</button>':'<button data-se="'+slot+'">'+L('Взять в поход','Take along')+'</button>'):'')+'</div>';}
    h+='</div><div class="btns stick"><button class="btn big" id="sudBack">'+L('Закрыть','Close')+'</button></div>';
    var keep=el('mBody').getAttribute('data-w')==='sud'?el('mBody').scrollTop:0;
    showModal(h,'sud');if(keep)el('mBody').scrollTop=keep;else B.stat('sud_book',{a:'open',n:cn.book});
    var a=el('mBody').querySelectorAll('[data-sj]'),j;
    for(j=0;j<a.length;j++)a[j].onclick=function(){snd('click');X.court(+this.getAttribute('data-sj'),{src:'book'},function(){X.book(back);});};
    a=el('mBody').querySelectorAll('[data-se]');
    for(j=0;j<a.length;j++)a[j].onclick=function(){snd('click');U.equip(+this.getAttribute('data-se'));X.book(back);};
    el('sudBack').onclick=function(){snd('click');if(back)back();else{hideModal();if(typeof curTab!=='undefined'&&curTab==='Village'&&!(typeof G!=='undefined'&&G))try{renderVillage();}catch(e){}}};};

  /* ---------- Терем: кто служит во дворе (пока нет «Живого двора»; DVOR заберёт BB2.sud.yard()) ---------- */
  X.terem=function(m){css();var y=U.yard(),cn=U.count(),h='<div class="sudtm"><b>'+L('⚖ Во дворе служат','⚖ Serving in your yard')+': '+y.length+'</b>',i;
    if(y.length){h+='<div class="sdy">';for(i=0;i<y.length&&i<12;i++)h+='<img src="'+ic(y[i].boss,96)+'" alt="" title="'+U.name(y[i].slot)+'">';h+='</div>'+
      '<p><b>'+U.name(y[y.length-1].slot)+'.</b> '+cs(y[y.length-1].slot).job+'.</p>';}
    else h+='<p>'+L('Пока никого. Пощади побеждённого босса — и он переедет к тебе.','No one yet. Spare a beaten boss and he’ll move in.')+'</p>';
    h+='<p>'+tShort('k')+' +'+pct(U.bonus('k'))+' · '+tShort('h')+' +'+pct(U.bonus('h'))+' · '+tShort('s')+' +'+pct(U.bonus('s'))+(cn.p?' · <b>'+L('ждут суда: ','awaiting judgment: ')+cn.p+'</b>':'')+'</p>'+
      '<button class="btn ghost" id="sudTm" style="width:100%">'+L('Книга судеб','Book of Fates')+' · '+cn.book+'/'+cn.all+'</button></div>';
    B.put(m,'top',h,'sudTmB');var b=el('sudTm');if(b)b.onclick=function(){snd('click');X.book(function(){if(typeof openTerem==='function')openTerem();else hideModal();});};};

  /* ---------- диковина в бою. Сила: sud.troDmg (3 %) от урона, который богатырь нанёс с прошлого удара диковины, — по построению не больше 3 % урона похода ---------- */
  var self=0,wrapped=0;
  function wrapHit(){if(wrapped||typeof hitEnemy!=='function')return;wrapped=1;var f=hitEnemy;
    hitEnemy=function(e,d,kx,ky){var s=typeof G!=='undefined'&&G?G.sd:null,h;if(!s||self||e.prop||e.dead)return f(e,d,kx,ky);
      h=e.hp;f(e,d,kx,ky);if(e.hp<h){h=h-Math.max(0,e.hp);s.acc+=h;s.tot+=h;}};}
  function icon(type,col){var k=Math.min(2,VIEW.dpr||1),z=34,c=mkCanvas(z*k,z*k),x=c.getContext('2d'),im=spr(type);x.setTransform(k,0,0,k,0,0);
    x.beginPath();x.arc(z/2,z/2,z/2-1.5,0,Math.PI*2);x.fillStyle='rgba(20,12,8,.78)';x.fill();x.lineWidth=2.5;x.strokeStyle=col;x.stroke();
    if(im&&im.c)x.drawImage(im.c,5,5,z-10,z-10);return c;}
  X.run=function(g){var slot=U.relic();if(slot<0||!CH[slot]||!U.relicOn(g))return;var c=cs(slot),a=ARCH[c.k];
    g.sd={slot:slot,k:c.k,cd:relCd(c.k),t:relCd(c.k),acc:0,tot:0,d:0,n:0,pop:0,col:a.col,ic:null,boss:CH[slot].boss};wrapHit();};
  function near(g,R){var H=g.hero,a=[];forNear(H.x,H.y,R,function(e){if(e.dead||e.prop||e.invul||!(e.hp>0))return;var d=(e.x-H.x)*(e.x-H.x)+(e.y-H.y)*(e.y-H.y);if(d<=(R+e.r)*(R+e.r)){e.sdD=d;a.push(e);}});return a;}
  function fire(g,s){var H=g.hero,A=ARCH[s.k],R=s.k==='r'?A.R:Math.max(200,VIEW.R||300),a=near(g,R),i,bank,per,e;
    if(!a.length)return false;
    if(s.k==='b'){a.sort(function(p,q){return p.sdD-q.sdD;});a.length=Math.min(a.length,A.n);}
    else if(s.k==='g'){e=a[0];for(i=1;i<a.length;i++)if((a[i].boss?1e9:0)+a[i].hp>(e.boss?1e9:0)+e.hp)e=a[i];a=[e];}
    bank=N('troDmg',.03)*s.acc/(1+.05*(g.st&&g.st.luck||1)); /* поправка на крит (5 % × удача, ×2): в среднем выходит ровно доля */
    s.acc=0;per=bank/a.length;self=1;
    try{for(i=0;i<a.length;i++){e=a[i];hitEnemy(e,per,0,0);if(i<8)spark(e.x,e.y,s.col,calm()?2:5);}}catch(x){}self=0;
    if(!s.n)try{heroSay(cs(s.slot).rel+'!');}catch(x){}s.d+=bank;s.n++;s.pop=.5;
    g.fx.push({k:'wave',x:H.x,y:H.y,t:0,dur:.55,r1:s.k==='r'?A.R:Math.min(R,260),col:s.col});
    return true;}
  X.frame=function(dt,g){var s=g.sd;if(!s||g.over||g.win)return;
    if(!s.ok){if(!U.relicOn(g)){g.sd=null;return;}s.ok=1;} /* признаки рейтинговых режимов соседи ставят в своём крючке run — сверяем на первом кадре */
    if(s.pop>0)s.pop-=dt;s.t-=dt;
    if(s.t<=0){if(s.acc>0&&fire(g,s))s.t=s.cd;else s.t=.5;}};
  X.drawTop=function(c,g){var s=g.sd;if(!s||g.over)return;if(!s.ic)s.ic=icon(s.boss,s.col);
    var z=34,x=VIEW.W-12-z,y=(window.__safeTop||0)+8+84,q=Math.max(0,Math.min(1,1-s.t/s.cd)),k=s.pop>0&&!calm()?1+s.pop*.5:1,a=c.globalAlpha;
    c.globalAlpha=a*(.45+.55*q);c.drawImage(s.ic,x-(z*k-z)/2,y-(z*k-z)/2,z*k,z*k);c.globalAlpha=a;
    c.beginPath();c.arc(x+z/2,y+z/2,z/2+2,-Math.PI/2,-Math.PI/2+Math.PI*2*q);c.lineWidth=2.5;c.strokeStyle=s.col;c.stroke();};
  X.end=function(g,win){var s=g.sd;if(!s)return;B.stat('sud_tro',{c:s.slot,k:s.k,n:s.n,p:s.tot>0?Math.round(1000*s.d/s.tot)/10:0,w:win?1:0});
    g.sdRes={n:s.n,d:Math.round(s.d),tot:Math.round(s.tot)};};
  return X;})();
