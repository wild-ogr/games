'use strict';
/* ================= g3-lines — G3-П3: банк реплик «Утро и люди» (Гастроном 3.0, волна 1) =================
   Голос — библия boost3-gastronom/HUMOR.md: Валя на «вы» к игроку, шутка с профессиональной колокольни, поворот в последней фразе,
   ≤90 знаков, без политики/алкоголя/насмешки над игроком; Пломбир, чай, «Торг» — не чаще 1/30.
   Каждая строка — [ru, en]. Читает js/g3-utro.js (G3U.line, G3U.timeLine) и может брать П4 (живая реплика под залом).
   Разделы: m/d/e/n — время дня (n — после 23:00 «гонит спать»); come — «Отложила…» в окне «Утро»; gift — гостинец;
   vs/vbeat/vtie/vworse — Витрина дня; card — карточка на главном, когда всё сделано; REGS — постоянные покупатели и их нити.
*/
window.G3LINES={
  m:[['Доброе утро! Весы поверены, сдача разложена, очередь уже недовольна. Всё по графику.','Good morning! Scales checked, change counted, the queue already grumbling. All on schedule.'],
    ['Открываемся! Первому покупателю — улыбка. Второму тоже, но уже поменьше.','We\'re open! A smile for the first customer. For the second too, just a smaller one.'],
    ['С добрым утром! Табличку «Перерыв» я спрятала. Недалеко.','Good morning! I\'ve hidden the "Break" sign. Not very far.'],
    ['Рано вы! Я ещё ценники не повесила. И глаза не открыла — одно.','You\'re early! I haven\'t put the price tags up yet. Or opened my eyes — one of them.'],
    ['Утро — лучшее время: очередь ещё вежливая, а Зоя Павловна ещё не пришла.','Morning is the best time: the queue is still polite and the manager isn\'t in yet.'],
    ['Мой спросил, когда вернусь. Сказала: после переучёта. Он записал на март.','My husband asked when I\'d be home. I said: after stocktaking. He wrote down March.'],
    ['Хлеб привезли тёплый. Я проверила — пальцем нельзя, я ладошкой.','The bread came in warm. I checked — not with a finger, with my whole palm.'],
    ['Доброе утро! Касса открыта, гирьки на месте, я — почти.','Good morning! Till open, weights in place, me — nearly.']],
  d:[['День в разгаре! Очередь до двери — значит, работаем правильно. Или дверь близко.','Busy day! The queue reaches the door — so we\'re doing it right. Or the door is close.'],
    ['Обед у меня с часу до двух. Но вас это не касается — вы в смене.','My lunch is from one to two. But that doesn\'t concern you — you\'re on shift.'],
    ['Зоя Павловна велела улыбаться. Улыбаюсь с девяти. Щёки просятся на переучёт.','The manager told me to smile. I\'ve been smiling since nine. My cheeks want a stocktake.'],
    ['Люда из «Юбилейного» хвасталась тележками. А у нас зато люди с руками.','Lyuda from the Jubilee bragged about her trolleys. Well, our people come with hands.'],
    ['Самое бойкое время! Даже кот Пломбир делает вид, что занят.','Rush hour! Even Plombir the cat is pretending to be busy.'],
    ['«В одни руки — по две». У вас, напарник, рук сколько? Вот и я считаю.','"Two per pair of hands." How many hands have you got, partner? I\'m counting too.']],
  e:[['Вечер. Самые терпеливые покупатели — вечерние. Остальные сдались ещё утром.','Evening. The most patient customers come at night. The rest gave up in the morning.'],
    ['Скоро закрытие. Это когда очередь становится вдвое длиннее.','Closing soon. That\'s when the queue gets twice as long.'],
    ['Мой спрашивает, что на ужин. Говорю: что останется. Теперь болеет против покупателей.','My husband asks what\'s for dinner. I say: whatever\'s left. Now he roots against the customers.'],
    ['Вечерняя смена — моя любимая. Ревизор в это время уже спит. Надеюсь.','The evening shift is my favourite. The inspector is asleep by now. I hope.'],
    ['Толик обещал завоз «к шести». Не сказал, какого дня.','Tolik promised the delivery "by six". He didn\'t say which day.'],
    ['Добрый вечер! Товар свежий, я — не очень, но держусь.','Good evening! The goods are fresh, I\'m less so, but holding up.']],
  n:[['Идите спать. Сгущёнка до утра не скиснет, а вы — да.','Go to bed. The condensed milk won\'t go off by morning, but you will.'],
    ['Ночь на дворе! Даже весы задремали — показывают ноль.','It\'s the middle of the night! Even the scales dozed off — they show zero.'],
    ['Магазин ночью закрыт. Я тут случайно — кассу пересчитываю. В третий раз.','The shop is closed at night. I\'m here by chance — recounting the till. Third time.'],
    ['Час ночи, а вы за прилавком. Мой так в армии стоял. Его хоть сменяли.','One a.m. and you\'re behind the counter. My husband stood guard like that in the army. At least he got relieved.'],
    ['Гражданин, мы закрыты! Ой, это вы. Ну, одну полочку — и спать.','Sir, we\'re closed! Oh, it\'s you. Well, one shelf — then bed.'],
    ['Поздно уже. Завтра приходите пораньше — я кефир отложу. Себе.','It\'s late. Come early tomorrow — I\'ll put some kefir aside. For me.']],
  /* «Утро»: что отложено и кто ждёт — {a} что (вин. п.), {w} кто */
  come:[['Отложила {a}. {w} уже в очереди — с самого открытия.','I put the {a} aside. {w} is already in the queue — since opening.'],
    ['{w} уже в очереди, первым номером. Отложила {a} — под прилавок, как в сейф.','{w} is first in line. The {a} is put aside — under the counter, like in a safe.'],
    ['Отложила {a}, как договаривались. {w} в очереди: смотрит на часы, а часы — на неё.','I put the {a} aside as agreed. {w} is in the queue: watching the clock, the clock watching back.'],
    ['Вчерашний уговор помню: {a} убрала под прилавок. {w} уже в очереди — остальные завидуют.','I remember yesterday\'s deal: the {a} is under the counter. {w} is already in the queue — the others are jealous.']],
  gift:[['Гостинец от меня — уже в копилке.','A little treat from me — already in your money box.'],
    ['Гостинец положила в копилку. Не благодарите — работайте.','I put a treat in your money box. Don\'t thank me — work.'],
    ['Гостинец — в копилке. Из своих, не из кассы. Ревизор, слышите?','The treat is in your money box. From my own pocket, not the till. Hear that, inspector?']],
  /* Витрина дня: {v} — ходы Вали, {m} — ваши */
  vs:[['Витрина дня — одна на всех. Отмены хода нет: как в жизни.','Display of the day — the same for everyone. No undo: just like life.'],
    ['Сегодняшнюю витрину я прошла за {v}. Не хвастаюсь — сообщаю.','I did today\'s display in {v}. Not bragging — reporting.'],
    ['Витрина дня! Вся страна раскладывает то же самое. Мы — аккуратнее.','Display of the day! The whole country is stacking the same thing. We do it neater.']],
  vbeat:[['{m}! Быстрее меня. Зоя Павловна не узнает — я не скажу. Наверное.','{m}! Faster than me. The manager won\'t find out — I won\'t tell. Probably.'],
    ['Обогнали тётю Валю! Тридцать лет стажа — и такой позор. Горжусь вами.','You beat Aunt Valya! Thirty years on the job — what a disgrace. I\'m proud of you.']],
  vtie:[['Ход в ход со мной! Будто в одном техникуме учились, в 1973-м.','Move for move with me! As if we went to the same trade school, class of 1973.'],
    ['Ровно как я. Значит, правильно — меня в Торге поверяли.','Exactly like me. So it\'s correct — I\'m certified by the Trade Office.']],
  vworse:[['Неплохо! Я, правда, быстрее. Но у меня тридцать лет у прилавка, а у вас — сегодня.','Not bad! I was quicker, mind. But I\'ve had thirty years at the counter, and you\'ve had today.'],
    ['Хорошо! Ещё раз? Вдруг обгоните. Я специально не тренируюсь.','Good! Again? You might beat me. I\'m deliberately not practising.']],
  card:[['На сегодня всё! Можно и просто постоять за прилавком.','All done for today! Now you can just stand behind the counter.'],
    ['Дела сделаны. Остальное — по желанию, как добавка.','The jobs are done. The rest is optional, like seconds.']]
};
/* ПОСТОЯННЫЕ: нить = шаги по дням. Шаг: t — товар (GOODS), a — что (вин. п. для «Отложила …»), ask — просьба вечером (в «Кассе»),
   come — первая в очереди наутро, thx — уходит довольной (+подарок). kind — типаж рисунка покупателя. */
window.G3LINES.REGS=[
  {id:'anna',n:['Анна Петровна','Anna Petrovna'],kind:'babka',steps:[
    {t:6,a:['кефир','kefir'],ask:['Завтра за кефиром приду — оставите? Только свежий: зять у меня инженер, проверит.','I\'ll come for kefir tomorrow — will you keep some? Fresh, mind: my son-in-law is an engineer, he\'ll check.'],
     come:['Я за кефиром! Не продали? Правильно, я бы обиделась. Дня на три.','I\'m here for my kefir! Didn\'t sell it? Good, I\'d have been offended. For three days.'],
     thx:['Вот спасибо! Зять скажет, что свежий. Он инженер — ему виднее, чем мне.','Thank you! My son-in-law will say it\'s fresh. He\'s an engineer — he knows better than me.']},
    {t:19,a:['масло','butter'],ask:['А маслица на завтра отложите? Блины затеваю — на всю лестничную клетку.','Will you keep me some butter for tomorrow? I\'m making pancakes — for the whole staircase.'],
     come:['За маслом пришла. Соседи уже с тарелками стоят — я им пообещала.','Here for the butter. The neighbours are already waiting with plates — I promised.'],
     thx:['Спасибо, Валечка! Первый блин — вам. Он комом, но от души.','Thank you, Valya dear! The first pancake is yours. It\'s lumpy, but from the heart.']},
    {t:20,a:['пряники','gingerbread'],ask:['Пряников на завтра отложите? Еду к сестре в Тамбов. До первой ссоры.','Keep some gingerbread for tomorrow? I\'m off to my sister\'s. Until our first quarrel.'],
     come:['За пряниками! И попрощаться. Сестра звонила — уже ругается, ждёт.','Here for the gingerbread! And to say goodbye. My sister rang — already arguing, waiting for me.'],
     thx:['Спасибо! Очередь без меня не балуйте. Вернусь — проверю.','Thank you! Don\'t spoil the queue without me. I\'ll be back to check.']}]},
  {id:'lev',n:['Лев Борисович','Lev Borisovich'],kind:'intel',steps:[
    {t:2,a:['шпроты','sprats'],ask:['Простите, можно на завтра шпроты? Жене скажу, что достал. «Купил» она не поймёт.','Excuse me, could I have sprats tomorrow? I\'ll tell my wife I "got hold" of them. "Bought" she won\'t believe.'],
     come:['Доброе утро. Я за шпротами. Если что — я их достал, вы свидетель.','Good morning. I\'m here for the sprats. If asked — I got hold of them, you\'re my witness.'],
     thx:['Благодарю! Возьмите билет в филармонию. Лишний. Жена тоже не пойдёт.','Thank you! Have a ticket to the concert hall. A spare. My wife won\'t go either.']},
    {t:13,a:['чай','tea'],ask:['А на завтра — чаю? Приезжает тёща. Хочу, чтобы уехала довольной. И скоро.','And tea for tomorrow? My mother-in-law is visiting. I want her to leave happy. And soon.'],
     come:['За чаем. Тёща уже в пути. Я специально пришёл пешком.','Here for the tea. My mother-in-law is on her way. I walked here on purpose.'],
     thx:['Спасибо! Тёща хвалит только плохой чай. Надеюсь, этот её разочарует.','Thank you! She only praises bad tea. I hope this one disappoints her.']}]},
  {id:'step',n:['Степаныч','Stepanych'],kind:'worker',steps:[
    {t:8,a:['батоны','loaves'],ask:['Хозяйка, завтра на бригаду батонов отложи. Десять. Нас шестеро, но мы растём.','Missus, keep ten loaves for my crew tomorrow. There are six of us, but we\'re growing.'],
     come:['Я за батонами! Бригада сказала: без хлеба не приходи. Без сдачи — можно.','Here for the loaves! The crew said: don\'t come back without bread. Without change is fine.'],
     thx:['Спасибо! Цех тебе привет передаёт. Хором. Я один, но громко.','Thanks! The whole shop floor says hello. In chorus. It\'s just me, but loudly.']},
    {t:9,a:['докторскую','sausage'],ask:['Завтра докторской кило отложи. У мастера юбилей — сорок лет у станка. Станок не придёт.','Keep me a kilo of sausage tomorrow. Our foreman\'s jubilee — forty years at the lathe. The lathe isn\'t coming.'],
     come:['За докторской! Мастер с утра волнуется. Станок, говорят, тоже.','Here for the sausage! The foreman\'s been nervous since morning. So\'s the lathe, they say.'],
     thx:['Во! Тютелька в тютельку. У нас на заводе так не умеют, а у нас ГОСТ.','There! Spot on to the gram. Even at our plant they can\'t do that, and we have standards.']},
    {t:1,a:['сгущёнку','condensed milk'],ask:['А сгущёнку на завтра можно? Внуку обещал. Внук обещал не говорить бабке.','Condensed milk for tomorrow? Promised the grandson. He promised not to tell granny.'],
     come:['За сгущёнкой. Внук с утра у окна. Бабка тоже — догадалась.','Here for the condensed milk. The grandson\'s been at the window since dawn. So has granny — she guessed.'],
     thx:['Спасибо, хозяйка! Если бабка спросит — я брал кефир.','Thanks, missus! If granny asks — I bought kefir.']}]},
  {id:'petya',n:['Петя','Petya'],kind:'school',steps:[
    {t:21,a:['сахар','sugar'],ask:['Тётя Валя, мама велела завтра взять сахар. Отложите? Я записал на руке. Руку не мою.','Aunt Valya, Mum says get sugar tomorrow. Will you keep it? I wrote it on my hand. Not washing it.'],
     come:['Я за сахаром! Вот рука — надпись целая. Я её от мамы прятал.','I\'m here for sugar! Here\'s my hand — the note\'s still there. I hid it from Mum.'],
     thx:['Спасибо! Сдачу донесу. Если по дороге не будет ирисок.','Thanks! I\'ll bring the change home. Unless there are toffees on the way.']},
    {t:16,a:['яйца','eggs'],ask:['А десяток яиц на завтра? Мама торт печёт мне на день рождения. Она не знает, что я знаю.','And a dozen eggs for tomorrow? Mum\'s baking my birthday cake. She doesn\'t know I know.'],
     come:['Я за яйцами! Только тихо: мама стоит в очереди за мной.','I\'m here for the eggs! Shh: Mum is standing right behind me.'],
     thx:['Ура! Донесу все десять. Ну, девять — точно.','Hooray! I\'ll get all ten home. Well, nine for sure.']}]}
];
