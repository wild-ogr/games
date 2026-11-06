/* rv-res.js — «Весь двор отвечает» (v6.0), поток П3 «ИТОГ»: окно итога лестницы — 4 блока + не больше ОДНОЙ строки-предложения.
   Флаг: rv.res (каркас П0: RV.on('res'); пока каркаса нет — свой разбор ?off=rv / ?off=rv.res и localStorage 'rv-off'). Выключен → окно как в v5.9.
   Блоки: 1) Михалыч (портрет + реплика с поворотом; за проигрыш — анекдот, банк 40) · 2) счёт «8/10», ряд ступенек, «+16 💰»
          3) ОДНА строка «двор»: редкий ответ лестницы («Свайка» — знают 3 из 10) или «двор в среднем 7 из 10, ты — 8» (KNOW.of из П0,
             без него — оценка PRICE.pOf со словом «обычно»; редкий — только по настоящим ответам) · 4) «▶ Дальше: уровень N» СРАЗУ в лестницу и «Меню».
   Предложение (одно, по очереди): новое звание/печать (car-pts) → новая медаль темы → «Проверь внука» (resultSlots id 'rv-vnuk', order 70 — П6)
          → «🔔 Напоминать» (socEarly) → «✉ Написать Михалычу» (mlm-mail). Прочие гнёзда итога вызываются (их счётчики и дела дня считаются как раньше),
          но в окно не попадают. Лучи (#modal.rs) — только когда уровень пройден.
   Зовётся из finishLadder (index.html): RVRES.show({...}). */
(function(){'use strict';
var W=window;
function ls(k){try{return localStorage.getItem(k)||'';}catch(e){return '';}}
function on(){try{if(W.RV&&typeof RV.on==='function')return !!RV.on('res');}catch(e){}
  var m=/[?&#]off=([^&#]*)/.exec(location.search+'&'+location.hash),off=(m?decodeURIComponent(m[1]):'')+','+ls('rv-off');
  return !/(^|,)\s*rv(\.res)?\s*(?=,|$)/.test(off);}
function pk(a){return a[Math.floor(Math.random()*a.length)];}
function e(s){return typeof esc==='function'?esc(s):String(s==null?'':s);}

/* ---- реплики Михалыча (≤90 знаков, завязка + поворот; на «ты», без рода) ---- */
var SAY={
  win:['Все десять! Пойду двору расскажу. Половина не поверит, остальные спросят тему.',
    'Десять из десяти. Баба Зина говорит — подсказывала. Из окна. Через два двора.',
    'Всю лестницу! Я так в молодости только очередь за колбасой проходил.',
    'Десять из десяти — хоть на доску почёта у подъезда. Доску, правда, ещё прибить.',
    'Вся лестница! Тётя Валя уже пирог ставит. Говорит, по такому случаю положено.',
    'Ни одной ошибки. Я столько не угадываю даже с прогнозом погоды.'],
  pass:['Уровень твой. Несгораемые — как варенье в погребе: никто не отнимет.',
    'Пройдено! До верха — как до пятого этажа без лифта: тяжело, но уже видно.',
    'Уровень взят. Я горжусь. Тихо, про себя, но очень.',
    'Монеты в копилку, уровень в карман. Дальше интереснее — честное дворовое.',
    'Уровень пройден. Дядя Коля спросил, кто это такой умный. Я сказал — наши.',
    'Хорошо идёшь! Ещё пара таких — и буду с тобой советоваться.'],
  take:['Синица в руках. А журавля завтра поймаем — никуда он не денется.',
    'Разумно. Я тоже с рынка ухожу, пока деньги ещё есть.',
    'Забрать вовремя — тоже ум. Жадных в нашем дворе не любят даже голуби.']
};
/* ---- анекдоты Михалыча за проигрыш (банк 40): короткие, с поворотом, без политики и обид ---- */
var JOKE=[
  '— Доктор, я всё забываю! — И давно это у вас? — Что «это»?',
  'Жена: «Купи хлеба, а если будут яйца — возьми десяток». Муж принёс десять батонов: «Яйца были».',
  'Учительница: «Вовочка, назови два местоимения». — «Кто, я?» — «Молодец, садись».',
  'Михалыч купил тренажёр. Теперь у него лучшая сушилка для белья во всём доме.',
  'Жена: «Ты меня совсем не слушаешь!» Муж: «Какое странное начало разговора».',
  '— Баба Зина, зачем вы по утрам бегаете? — Чтобы к обеду было что соседкам рассказать.',
  'Врач: «Вам нужно меньше нервничать». — «Тогда, доктор, выпишите мне других соседей».',
  '— Михалыч, зачем зонт в такую жару? — Чтобы дождь испугался. Видишь — работает.',
  'Внук: «Ба, вай-фай пропал!» — «Не плачь, найдётся. Я вот очки всегда нахожу — на лбу».',
  '— Что ты всё время теряешь? — Очки, ключи и терпение. Хорошо, терпение быстро нахожу.',
  'В поликлинике: «Кто последний?» — «Я. Но я за шляпой, а шляпа пошла к окулисту — искать, за кем она».',
  '— Михалыч, почему у тебя огурцы не растут? — Растут. Только у соседа, через забор.',
  'Объявление в подъезде: «Меняю будильник на тишину. Можно с доплатой».',
  'Жена: «Посмотри, я подстриглась!» Муж: «Вижу-вижу! Похудела, что ли?»',
  'Михалыч шесть часов на рыбалке — ни одной поклёвки. Вывод: «Отличный день, никто не мешал».',
  '— Зачем вы кроссворд карандашом решаете? — А вдруг правильный ответ передумает.',
  '— Сколько будет дважды два? — А мы покупаем или продаём?',
  'Внучка: «Бабушка, а ты в детстве была маленькой?» — «Нет, сразу с авоськой и в очереди».',
  '— Почему у вас в подъезде так чисто? — Баба Зина у окна сидит. Мусор её боится.',
  'Михалыч учил внука шахматам. Через месяц внук стал выигрывать. Теперь Михалыч учит его домино.',
  '— Дядя Коля, как вы так долго в браке? — Она всегда права, а я всегда согласен. Иногда заранее.',
  'Соседка: «Что-то кот у тебя толстый». Михалыч: «Не толстый. Запасливый».',
  '— Зачем ты огурцы на ночь укрываешь? — Чтобы не подслушивали, о чём помидоры шепчутся.',
  'Внук: «Дед, а интернет раньше был?» — «Был. Соседка с первого этажа: всё знала и всем рассказывала».',
  'Диета Михалыча: после шести не есть. Поэтому ужинает он в пять пятьдесят девять. До полуночи.',
  '— Сосед, одолжи молоток. — А что прибивать? — Ничего. Заходи, чай стынет.',
  'Учитель: «Почему в диктанте тридцать ошибок?» — «Так диктант длинный был!»',
  'Михалыч сказал жене, что на рынок не пойдёт. Через час нёс две сумки: «Я не ходил. Меня послали».',
  '— Как вы так хорошо выглядите? — Не взвешиваюсь и не смотрю новости. И те, и другие весы врут.',
  'Тётя Валя пекла пирог по рецепту из телевизора. Вышло как в телевизоре: красиво, но не про нас.',
  'Муж решил помочь на кухне. Теперь жена помогает кухне прийти в себя.',
  '— Михалыч, ты чего такой довольный? — Очки нашёл. — Где? — Не знаю. Они на мне были.',
  'Кот смотрит в холодильник так, будто там ответ на последний вопрос. Михалыч, кстати, тоже.',
  'Дед учит внука: «Терпение — главное». Внук: «А долго учиться?» — «Не торопи».',
  '— Как спалось? — Как на даче: проснулся в пять, полежал, вспомнил, что не на даче.',
  'Сосед хвастается: «У меня память как у слона!» — «Большая?» — «Слона помню. Где видел — нет».',
  'Михалыч решил бросить есть сладкое. Бросал до вечера. Потом тётя Валя принесла пирог.',
  '— Бабушка, зачем тебе очки, ты же в них не видишь? — Зато меня в них все узнают.',
  'Жена: «Я ушла на пять минут!» Муж поставил чайник на час: опытный.',
  '— Михалыч, а ты по гороскопу кто? — По гороскопу — лев. А по жене — котик.'
];

/* ---- «двор»: сколько из 10 соседей знают вопрос (KNOW П0; без данных — оценка «обычно») ---- */
function know(q){if(!q)return null;
  try{if(W.KNOW&&typeof KNOW.of==='function'){var k=KNOW.of(q);if(k&&k.n10!=null)return {n:Math.max(0,Math.min(10,Math.round(+k.n10))),real:!!k.real};}}catch(x){}
  try{if(W.PRICE&&typeof PRICE.pOf==='function')return {n:Math.round(10*PRICE.pOf(q)),real:false};}catch(x){}
  return null;}
function qOf(id){try{return typeof QI!=='undefined'?QI[id]:null;}catch(x){return null;}}
function win10(n){var h='';for(var i=0;i<10;i++)h+='<i class="'+(i<n?'on':'')+'"></i>';return '<span class="rv-dh" aria-hidden="true">'+h+'</span>';}
// одна строка двора: редкий верный ответ → (проигрыш) вопрос, на котором оборвалось → «двор в среднем X из M, ты — Y»
function yard(g){if(!g||!g.qs||!g.res)return '';var res=g.res,rare=null,sum=0,m=0,nReal=0,fail=null;
  for(var i=0;i<res.length&&i<10;i++){if(res[i]!==1&&res[i]!==0)continue;var q=qOf(g.qs[i]),k=know(q);if(!k)continue;
    m++;sum+=k.n;if(k.real)nReal++;
    if(res[i]===1&&k.real&&k.n<=3&&(!rare||k.n<rare.k.n))rare={q:q,k:k};
    if(res[i]===0)fail={q:q,k:k};}
  if(rare){var a=rare.q&&rare.q.a&&String(rare.q.a[0]||'');
    return win10(rare.k.n)+(a&&a.length<=26?'Редкий ответ: «'+e(/^«[^«»]*»$/.test(a)?a.slice(1,-1):a)+'» — знают '+rare.k.n+' из 10':'Редкий ответ — знают только '+rare.k.n+' из 10 соседей');}
  if(fail&&g.__lose){var n=fail.k.n,re=fail.k.real;
    return win10(n)+(!re?'Такие вопросы обычно знают '+n+' из 10':n<=4?'На этом спотыкается весь двор: знают '+n+' из 10':n>=8?'Этот знают '+n+' из 10 — в другой раз и ты вспомнишь':'Этот вопрос знают '+n+' из 10 соседей');}
  if(m<3)return '';var avg=Math.round(sum/10),good=res.filter(function(x){return x===1;}).length;
  return win10(Math.round(10*avg/m))+'<span>'+(nReal*2>=m?'Двор в среднем — ':'Двор обычно — ')+'<b class="rv-nw">'+avg+' из '+m+'</b>, <span class="rv-nw">ты — '+good+'</span></span>';}

/* ---- окно итога ---- */
var ALLOW={'car-pts':1,'rv-vnuk':1,'mlm-mail':1}; // предложения; порядок — по order гнёзд (car-pts 8 · rv-vnuk 70 · mlm-mail 90)
function show(o){var g=G,kind=o.kind,good=o.good,pass=o.pass,topic=o.topic,lose=!pass&&kind!=='take'&&kind!=='win';
  var rk=kind==='win'?'win':kind==='take'?'take':pass?'pass':'lose',
      rctx={kind:rk,good:good,prize:o.prize,topic:topic,pass:pass,res:g.res.slice(),lvl:S.lvl||0,G:g};
  // все гнёзда итога — как в v5.9 (очки карьеры, дела дня считаются); в окно — только одно предложение
  var it=UI.list(resultSlots),cand=[];
  for(var i=0;i<it.length;i++){var x=it[i],r=null;try{r=x.render?x.render(rctx):null;}catch(er){try{console.warn('UI slot '+x.id,er);}catch(_){}}
    if(r&&typeof r==='string'&&ALLOW[x.id])cand.push({x:x,h:r});}
  var news=[];
  if(o.newRank&&o.rank)news.push({x:null,h:'<p class="goal tipl">🏅 '+L('Новое звание: ','New rank: ')+e(o.rank[1])+'!</p>'});
  (g.newM||[]).forEach(function(z){try{news.push({x:null,h:'<p class="goal tipl">'+z.m+' '+e(TMNAME(tcOf(z.t)))+': «'+e(TN[z.t].n)+'»!</p>'});}catch(er){}});
  // звание/печать карьеры — первым; затем медаль темы; затем «Проверь внука», «Написать Михалычу»
  var car=cand.filter(function(c){return c.x.id==='car-pts';}),rest=cand.filter(function(c){return c.x.id!=='car-pts';});
  var offer=car.concat(news,rest)[0]||null;
  // Михалыч
  var joke=false,line;
  if(lose&&o.help)line=L('Не горюй: в следующий раз Михалыч подстрахует — до 5-й ступени ошибка лестницу не оборвёт.','Next time I have your back: up to step 5 a wrong answer will not end the ladder.');
  else if(lose){line=pk(JOKE);joke=true;}
  else line=pk(SAY[rk]||SAY.pass);
  var head=kind==='win'?L('Вся лестница!','The whole ladder!'):pass?L('Уровень пройден!','Level passed!'):kind==='take'?L('Монеты забраны','Coins taken'):L('Лестница оборвалась','The ladder broke');
  g.__lose=lose;var dv=yard(g);delete g.__lose;
  var sm=[];if(g.wk&&o.prize)sm.push('<span class="wk">'+L('тема недели ×2','topic of the week ×2')+'</span>');if(o.gift)sm.push(L('и гостинец +','and a gift +')+coinsTxt(o.gift));
  var nxt=pass?(g.first?{t:'▶ '+L('Дальше: выбери тему','Next: pick a topic'),f:openTopics}:{t:'▶ '+L('Дальше: уровень ','Next: level ')+((S.lvl||0)+1),f:function(){startLadder(topic);}})
             :{t:'↻ '+L('Ещё раз','Again'),f:function(){startLadder(topic);}};
  modal('<div class="av">'+portrait('mihalych',pass?'happy':'sad')+'</div><h2>'+head+'</h2>'+
    '<div class="rv-sc"><p class="score">'+good+'/10</p><p class="coins-won">+'+coinsTxt(o.prize)+(sm.length?' <small>'+sm.join(' · ')+'</small>':'')+'</p></div>'+lad10(g.res)+
    '<p class="quote rv-say'+(joke?' rv-joke':'')+'">'+(joke?'<b class="rv-jl">'+L('Анекдот от Михалыча','A joke from Mikhalych')+'</b>':'')+e(line)+'</p>'+
    (dv?'<p class="rv-dv">'+dv+'</p>':'')+
    (offer?'<div class="rslot rv-of" data-slot="'+e(offer.x?offer.x.id:'news')+'">'+offer.h+'</div>':'')+
    '<div class="row rv-btns" id="mWon"><button class="btn accent" id="'+(pass?'rNext':'rAgain')+'">'+nxt.t+'</button><button class="btn" id="rMenu">🏠 '+L('Меню','Menu')+'</button></div>');
  var mc=$('mcard');
  if(offer&&offer.x&&offer.x.mount){var el=mc.querySelector('.rv-of');try{offer.x.mount(el,rctx);}catch(er){}}
  if(pass)party();else mc.classList.add('res'); // лучи — только за пройденный уровень (VK-UX поломка №14)
  socEarly(!!offer&&!(offer.x&&offer.x.id==='mlm-mail')); // «🔔 Напоминать» — только если другого предложения нет (mlm-mail сам уступает ему место)
  fitCard();if(W.UIF)UIF.result();
  setTimeout(function(){try{if($('mWon')&&$('mWon').classList.contains('rv-btns')&&modalOn)fitCard();}catch(er){}},350); // П7: окно дорастает после показа (шрифты/значки/«🔔») — подогнать ещё раз
  if(W.STAT&&STAT.ev)try{STAT.ev('mod',{m:'rv.res',a:offer?('of_'+(offer.x?offer.x.id:'news')):(mc.querySelector('.soc-o')?'of_soc':'none')});}catch(er){}
  var go=function(f){return function(){hideModal();between(function(){TMR.go(f);});};};
  $(pass?'rNext':'rAgain').onclick=go(nxt.f);$('rMenu').onclick=go(openMenu);
  if(pass&&!offer)offerReturn();}

W.RVRES={on:on,show:show,yard:yard,know:know,SAY:SAY,JOKE:JOKE};
})();
