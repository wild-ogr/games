/* b2-story-txt.js — STORY: названия серий, «В следующей серии…», тексты арок краёв №2–№5 (для STORYUI.SC), окно «Все серии».
   Грузится по требованию из b2-story.js (B2.need). Без DOM на верхнем уровне не падает (в jsc просто ничего не делает). */
(function(root){'use strict';
const B2=root.B2;if(!B2||!B2.story)return;
const BS=B2.story,esc=BS.esc;
const T=(r,e)=>typeof L==='function'?L(r,e):r;
const G=(m,f)=>{try{return root.HERO&&HERO.fem&&HERO.fem()?f:m;}catch(e){return m;}};
const hv=()=>{try{return root.HERO&&HERO.v?HERO.v():T('председатель','president');}catch(e){return T('председатель','president');}};
const yrs=w=>10+Math.floor(((w&&w.m)||0)/12);
const YL=n=>{const a=n%10,b=n%100;return a===1&&b!==11?'год':a>=2&&a<=4&&(b<12||b>14)?'года':'лет';};
/* ---------- названия серий (сцены story.js и арки краёв) ---------- */
const TL={vit1:['Лишние руки','An Extra Pair of Hands'],owl1:['Пластиковое искушение','Plastic Temptation'],first1:['Деньги под скатертью','Money Under the Tablecloth'],
  beav1:['Ларёк напротив','The Kiosk Across the Street'],beav2:['Враг моего поставщика','The Enemy of My Supplier'],bars1:['Поручитель','The Guarantor'],
  owl2:['Пироги и отчёты','Pies and Spreadsheets'],beav4:['Сибирская лыжня','The Siberian Ski Race'],beav3:['Ночной звонок','A Late-Night Call'],
  vit4:['Горько!','Here Comes the Groom'],vit3:['Колёса на двоих','Wheels for Two'],bars3:['Синяя папка','The Blue Folder'],
  tpt1:['Звонок с московского номера','A Call from a Moscow Number'],lud1:['Разговор на кухне','A Kitchen-Table Talk'],owl4:['Соня открывает фонд','Sonya Opens Her Fund'],
  bars2:['Сосновый лог','Pine Hollow'],tpt2:['Торги против Медведя','Bidding Against the Bear'],bars5:['Взрыв на карьере','A Blast at the Quarry'],
  beav6:['Письма из столицы','Letters from the Capital'],part:['Партнёр для недр','A Partner for Mining'],ned1:['В большую лигу','The Big League'],
  bear1:['Медведь в кузове','A Bear in the Truck Bed'],vit5:['Спасибо, которое опоздало','A Belated Thank-You'],lud3:['Юбилей главбуха','The Accountant’s Big Birthday'],
  tpt4:['Предложение, от которого можно отказаться','An Offer You Can Refuse'],owlno:['Холодный кредитный отдел','A Chilly Credit Department'],vitno:['Все машины заняты','All Trucks Are Busy'],
  beavno:['Без поддавков','No Easy Wins'],barsno:['Петра переманивают','Poaching Pyotr'],partyno:['Шашлыки без тебя','A Barbecue Without You'],
  mem:['Людмила Санна вспоминает','Lyudmila Sanna Remembers'],beav5:['Бобров идёт на биржу','Beaver Goes Public'],bars4:['Стажёр Барсуков','Intern Barsukov'],
  owl3:['Фонд на двоих','A Fund for Two'],lud2:['Папка «Передать»','The Handover Folder'],tpt5:['Ход конём','A Knight’s Move'],ludcall:['Звонок по пятницам','The Friday Call'],
  help:['Друг в овердрафте','A Friend in Overdraft'],
  yak1:['Зимник','The Ice Road'],yak2:['Грамм на тонну','A Gram per Tonne'],yak3:['Носки особого назначения','Socks of Special Purpose'],yak4:['Нелётная погода','Grounded'],yak5:['Одна переправа на двоих','One Crossing for Two'],
  nor1:['Полярная ночь','Polar Night'],nor2:['Северный завоз','The Northern Haul'],nor3:['Самое дорогое на Севере','The Priciest Thing in the North'],nor4:['Соня выходит замуж','Sonya Is Getting Married'],nor5:['Медь для лесовозов','Copper for Log Trucks'],
  sak1:['Путина','The Fishing Season'],sak2:['Шторм','The Storm'],sak3:['Карьер, только мокрый','A Quarry, Only Wet'],sak4:['Аудитор Ася','Auditor Asya'],sak5:['Медведь уходит на рыбалку','The Bear Goes Fishing'],
  alt1:['Бухгалтерия для пчёл','Accounting for Bees'],alt2:['Загадка медового чая','The Honey-Tea Mystery'],alt3:['«Пчёлка-1» и «Пчёлка-2»','Busy Bee 1 and Busy Bee 2'],alt4:['Вниз и вверх','Down and Up'],alt5:['Последний спор','The Last Bet']};
function title(k){const x=TL[k];return x?T(x[0],x[1]):'';}
/* ---------- «В следующей серии…»: [этап, рус, англ]; этап g s m q n h или край yak/nor/sak/alt ---------- */
const NX={vit1:['g','Витя позвонит с подработкой — и платят сразу.','Vitya calls with a side job — and it pays on the spot.'],
  owl1:['g','Соня из банка предложит кое-что пластиковое и очень соблазнительное.','Sonya from the bank offers something plastic and very tempting.'],
  first1:['s','Первая выручка — и старая примета Людмилы Санны.','First takings — and an old superstition of Lyudmila Sanna’s.'],
  beav1:['s','Напротив вашей точки что-то строят. Кажется, это зелёная куртка Бориса.','Something’s being built across from you. Is that Boris’s green jacket?'],
  beav2:['s','Борис придумает, как дружить против поставщика.','Boris figures out how to be friends against a supplier.'],
  bars1:['s','Пётр и Оля копят на квартиру — и им нужен один подписант.','Pyotr and Olya are saving for a flat — and need one signature.'],
  owl2:['s','Мама Сони прочитала ваши отчёты. Говорит, лучше сериала.','Sonya’s mum read your reports. Says they beat any TV series.'],
  beav4:['s','Городской забег: точка против точки, проигравший закупается у победителя.','A city race: shop against shop, the loser buys from the winner.'],
  beav3:['s','Телефон зазвонит ночью. Голос будет знакомый — и непривычно тихий.','The phone rings at night. A familiar voice — unusually quiet.'],
  vit3:['m','У Вити идея на колёсах. Нужны только ваши деньги и его водители.','Vitya has an idea on wheels. It just needs your money and his drivers.'],
  bars3:['m','Пётр принесёт синюю папку и попросит её сохранить.','Pyotr brings a blue folder and asks you to keep it safe.'],
  tpt1:['m','Позвонят с московского номера. Голос скажет: «Буду краток».','A Moscow number calls. A voice says: “I’ll be brief.”'],
  owl4:['m','Соня уходит из банка. Мама уже печёт торт и волнуется больше всех.','Sonya is leaving the bank. Her mum is baking a cake and worrying most of all.'],
  bars2:['q','Та самая синяя папка вернётся — и в ней карьер.','That blue folder comes back — with a quarry inside.'],
  tpt2:['q','Друзья против Медведя: торги за «Каменный ручей».','Friends versus the Bear: bidding for Stone Creek.'],
  bars5:['q','Пётр выдаст каску. Будет громко.','Pyotr hands you a hard hat. It’s going to be loud.'],
  beav6:['q','Борис услышит про письма из столицы — и предложит идти вместе.','Boris hears about letters from the capital — and suggests going together.'],
  part:['q','Для недр нужен партнёр. Претендентов двое, и оба вам знакомы.','Mining needs a partner. There are two candidates, and you know them both.'],
  bear1:['n','Витя позвонит в беде. Рядом с его «ВитТрансом» бродит медведь.','Vitya calls in trouble. A bear is prowling around VitTrans.'],
  lud3:['n','У Людмилы Санны юбилей. Она просила никому не говорить — значит, ждёт всех.','Lyudmila Sanna has a big birthday. She asked to tell no one — so she expects everyone.'],
  tpt4:['n','Топтыгин предложит место в совете директоров. Себе.','Toptygin offers a seat on the board. For himself.'],
  beav5:['h','Борис звонит в колокол сам — и зовёт вас первым.','Boris rings the bell himself — and invites you first.'],
  bars4:['h','Старший сын Петра окончил горный — и просится к вам.','Pyotr’s eldest has graduated in mining — and wants to work for you.'],
  owl3:['h','Соня предложит фонд на двоих. Мама уже одобрила.','Sonya proposes a fund for two. Her mum has already approved.'],
  lud2:['h','На столе появится папка с надписью «Передать».','A folder marked “Handover” appears on your desk.'],
  tpt5:['h','Топтыгин сделает ход конём.','Toptygin makes a knight’s move.'],
  yak1:['yak','Витя разведал дорогу, которой летом нет.','Vitya has scouted a road that doesn’t exist in summer.'],
  yak2:['yak','Пётр впервые в жизни будет считать граммы, а не тонны.','For the first time in his life Pyotr counts grams, not tonnes.'],
  yak3:['yak','Людмила Санна пришлёт посылку. Очень тёплую.','Lyudmila Sanna sends a parcel. A very warm one.'],
  yak4:['yak','Борис прилетит посмотреть на зимник. Улететь будет сложнее.','Boris flies in to see the ice road. Flying out will be harder.'],
  yak5:['yak','На переправе встретятся двое. Один из них — Медведь.','Two meet at the river crossing. One of them is the Bear.'],
  nor1:['nor','Пётр привезёт на Север сыновей и гирлянды.','Pyotr brings his sons — and fairy lights — up north.'],
  nor2:['nor','Витя споёт песню про логистику. Её поёт ветер.','Vitya sings a song about logistics. The wind sings it.'],
  nor3:['nor','Людмила Санна найдёт на Севере самое дорогое. Это не металл.','Lyudmila Sanna finds the priciest thing in the North. It isn’t metal.'],
  nor4:['nor','Соня позвонит с новостью. Мама плакала.','Sonya calls with news. Her mum cried.'],
  nor5:['nor','Борису понадобится медь. Очень странная причина.','Boris needs copper. For a very strange reason.'],
  sak1:['sak','Борис на Сахалине. Говорит, что за рыбой.','Boris is on Sakhalin. Says he came for the fish.'],
  sak2:['sak','Паромы стоят, а рыба ждать не любит.','The ferries are stuck, and fish don’t like to wait.'],
  sak3:['sak','Старший Барсуков нарисует платформу без единого выброса.','The elder Barsukov draws a platform with zero emissions.'],
  sak4:['sak','Ася на практике. Угадайте, чьи отчёты ей дали проверять.','Asya is on her internship. Guess whose reports she’s been given to audit.'],
  sak5:['sak','Топтыгин попросится на рыбалку. Без контракта.','Toptygin asks to come fishing. No contract.'],
  alt1:['alt','Мама Сони спросит, есть ли у пчёл бухгалтерия.','Sonya’s mum asks whether the bees keep books.'],
  alt2:['alt','Людмила Санна приедет на турбазу и откроет меню.','Lyudmila Sanna checks into the lodge and opens the menu.'],
  alt3:['alt','У Вити две новые машины. Марина уже дала им имена.','Vitya has two new vehicles. Marina has already named them.'],
  alt4:['alt','Пётр всю жизнь копал вниз. Теперь посмотрит вверх.','Pyotr spent his life digging down. Now he looks up.'],
  alt5:['alt','Борис предложит последний спор. Ставка — торт.','Boris proposes one last bet. The stake is a cake.']};
const GEN=[['Людмила Санна сведёт отчёты, а кто-то из 11 «Б» обязательно позвонит.','Lyudmila Sanna closes the books, and someone from 11B is bound to call.'],
  ['Друзья не дремлют: у кого-то свадьба, у кого-то стройка, у Бориса — новый план.','Your friends never sleep: a wedding here, a building site there, a new plan from Boris.'],
  ['Телефон уже вибрирует. Кто это — узнаем через пару месяцев.','The phone is already buzzing. Who it is — we’ll find out in a couple of months.']];
const STG=['g','s','m','q','n','h'];
function stageOf(W){if(!W)return 'g';if(!W.ned)return STG[Math.max(0,['gig','small','mid','quarry'].indexOf(W.st||'gig'))];return (W.hold||1)<=1?'n':'h';}
function next(W,q){if(!W||!W.fr)return '';const F=W.fr,Y=root.STORY,cur=stageOf(W),ci=STG.indexOf(cur),kr=BS.kraiId(W);
  const ok=s=>s===kr||(STG.indexOf(s)>=0&&(STG.indexOf(s)===ci||STG.indexOf(s)===ci+1));
  const ord=((Y&&Y.ORDER)||[]).slice().sort((a,b)=>(b.slice(0,3)===kr)-(a.slice(0,3)===kr));
  for(const k of ord){const x=NX[k];if(!x||k===q.k||F.dn[k]!==undefined||F.q.some(z=>z.k===k))continue;if(ok(x[0]))return T(x[1],x[2]);}
  const g=GEN[String(q.k).length%GEN.length];return T(g[0],g[1]);}
/* ---------- тексты арок краёв (формат STORYUI.SC: m — настроение, t — реплика, o — кнопки [надпись, подсказка], r — ответ) ---------- */
const H6=d=>d?'❤ +'+d:'';
const S=(m,t,a,b,ra,rb,da,db)=>({m,t,o:{a:()=>[T(a[0],a[1]),H6(da)],b:()=>[T(b[0],b[1]),H6(db)]},r:{a:()=>T(ra[0],ra[1]),b:()=>T(rb[0],rb[1])}});
const TX={
  yak1:S('wow',(a,w)=>T(`Я разведал! Дорога к твоему золоту есть только зимой — по льду реки, называется «зимник». Летом — вертолёт и терпение. Мои ребята готовы, но там −50. Для Кузбасса −30 — это «свежо», тут −50 — это «надень вторые штаны». Поедешь первым рейсом со мной?`,`I’ve scouted it! The road to your gold only exists in winter — over the river ice, it’s called a “winter road”. In summer it’s helicopters and patience. My guys are ready, but it’s −50 out there. Back home −30 is “fresh”; here −50 is “put on a second pair of trousers”. Ride the first run with me?`),
    ['Еду с тобой!','I’m coming with you!'],['Езжай, я на связи','You go, I’ll stay on the line'],
    ['Беру термос, запасную печку и сало. Марина сказала: «Отморозишь уши — домой не возвращайтесь». Обоим.','I’ll pack a thermos, a spare stove and some bacon. Marina said: “Freeze your ears off and don’t come home.” Both of us.'],
    ['Понял. Буду присылать фото сугробов. Их будет много, и все одинаковые.','Got it. I’ll send photos of snowdrifts. There’ll be lots, and they all look the same.'],6,2),
  yak2:S('calm',()=>T('Золото — не уголь. Тут грамм на тонну, а у меня руки привыкли к тоннам на тонну. Местный старожил Игнат Саввич говорит, что золото «чует» по цвету ручья. Мои приборы говорят другое. Кого слушаем?','Gold isn’t coal. Here it’s a gram per tonne, and my hands are used to tonnes per tonne. Ignat Savvich, an old-timer here, says he can “smell” gold by the colour of a stream. My instruments say otherwise. Who do we listen to?'),
    ['Старожила — он тут сорок лет','The old-timer — he’s been here forty years'],['Приборы — на то они и приборы','The instruments — that’s what they’re for'],
    ['Согласен. Он, кстати, уже нашёл два ручья. И мою потерянную рукавицу.','Agreed. By the way, he’s already found two streams. And my lost mitten.'],
    ['Как скажешь. Игнат Саввич не обиделся — сказал, что приборы тоже надо уважать. Особенно когда они тёплые.','Your call. Ignat Savvich didn’t take offence — said instruments deserve respect too. Especially warm ones.'],6,3),
  yak3:S('happy',()=>T('Мама передала тебе посылку на Север: шерстяные носки, три пары. С запиской: «Отчёты — сдавать в тепле». А я по делу: совет «Сова Инвест» спорит, вкладываться ли в северные проекты. Скажешь пару слов?','Mum sent you a parcel up north: woollen socks, three pairs. With a note: “Reports must be filed somewhere warm.” And business: the Owl Invest board is arguing about northern projects. Will you say a few words?'),
    ['Приеду и скажу лично','I’ll come and say it in person'],['Пришлю отчёт с цифрами','I’ll send a report with figures'],
    ['Отлично! Совет любит, когда говорят люди, а не графики. Носки надень.','Great! The board likes people, not charts. Wear the socks.'],
    ['Хорошо. Я его, конечно, проверю. Мама тоже проверит. Дважды.','Fine. I’ll check it, of course. Mum will check it too. Twice.'],5,3),
  yak4:S('happy',()=>T('Прилетел посмотреть на твой зимник. Застрял на три дня — нелётная погода. Сижу в гостинице, ем строганину, научился отличать −40 от −45 по звуку шагов. Это знание мне в Карелии не пригодится вообще.','Flew in to see your winter road. Stuck for three days — no flights. Sitting in a hotel eating frozen-fish stroganina, learned to tell −40 from −45 by the sound of footsteps. This will be of zero use in Karelia.'),
    ['Заберу тебя на вездеходе','I’ll pick you up in an all-terrain truck'],['Отдыхай — тебе полезно','Rest — it’s good for you'],
    ['Вот это сервис! Записываю в тетрадь: «Спор №143 — кто кого выручит. Счёт в твою пользу». Скрипя зубами.','Now that’s service! Writing it down: “Bet No. 143 — who rescues whom. Point to you.” Through gritted teeth.'],
    ['Ладно. Но если я тут научусь играть на хомусе, виноват будешь ты.','Fine. But if I learn to play the jaw harp here, it’s on you.'],6,2),
  yak5:{m:'strict',t:()=>T('Топтыгин. Тоже в Якутии — соседний участок. Буду краток: переправа одна, зимник один, а нас двое. Предлагаю общий зимник: моя техника, ваша дорога, расходы пополам. Или каждый тянет своё.','Toptygin. Also in Yakutia — the neighbouring plot. I’ll be brief: one crossing, one winter road, two of us. I propose a shared road: my machinery, your route, costs split in half. Or each of us hauls his own.'),
    o:{a:()=>[T('Общий зимник — по рукам','A shared road — deal'),''],b:()=>[T('Каждый своей дорогой','Each to his own road'),'']},
    r:{a:()=>T('Разумно. Не думал, что скажу это вслух: с вами приятно иметь дело.','Sensible. Never thought I’d say it aloud: you’re a pleasure to do business with.'),b:()=>T('Понимаю. Встретимся на переправе. Уступать не буду — она узкая.','Understood. See you at the crossing. I won’t give way — it’s narrow.')}},
  nor1:S('happy',()=>T('Норильск! Тут руду не копают — её уговаривают. Полярная ночь — почти два месяца без солнца. Я взял обоих сыновей: старший — главный технолог, младший — главный по свету: лампы, гирлянды, всё такое. Чем поддержим людей в темноте?','Norilsk! Here you don’t dig ore — you talk it into coming out. Polar night — nearly two months without sun. I brought both sons: the elder is chief technologist, the younger is chief of light: lamps, fairy lights, the lot. How do we keep people going in the dark?'),
    ['Теплица с огурцами для всех','A greenhouse with cucumbers for everyone'],['Лампы-«солнце» в каждый кабинет','“Sun” lamps in every office'],
    ['Огурцы в полярную ночь! Младший уже назвал теплицу «Пляж». Табличку повесил.','Cucumbers in the polar night! The younger one already named the greenhouse “The Beach”. Put up a sign.'],
    ['Сделаем. Главное — не перепутать лампу-солнце с лампой-луной. Младший уже перепутал.','Will do. Just don’t mix up the sun lamp with the moon lamp. The younger one already did.'],6,3),
  nor2:S('calm',()=>T('Логистика тут — песня. Поёт её ветер. Морем — летом, по зимнику — зимой, остальное время — терпение. Предлагаю «северный завоз» по-нашему: всё на год вперёд, одним караваном. Или возить чаще, но понемногу?','Logistics here is a song. The wind sings it. By sea in summer, by winter road in winter, and patience the rest of the time. I suggest our own “northern haul”: everything a year ahead, one big convoy. Or ship more often, a bit at a time?'),
    ['Завоз на год — одним караваном','A year’s haul — one convoy'],['Чаще и понемногу','More often, a bit at a time'],
    ['Караван! Я уже вижу его во сне. Сорок машин, и все гудят «Подмосковные вечера».','A convoy! I see it in my dreams. Forty trucks, all honking a folk tune.'],
    ['Тоже верно. Мои водители рады: чаще дома, реже в сугробе.','Fair enough. My drivers are glad: home more often, in snowdrifts less.'],6,3),
  nor3:S('calm',()=>T('Я посчитала ваши северные надбавки. Знаете, что самое дорогое на Севере? Не металл. Люди, которые сюда поехали. Давайте им к зарплате — путёвку на юг раз в год? Или надбавку деньгами — пусть решают сами.','I’ve worked out your northern allowances. Do you know what’s most expensive in the North? Not metal. The people who came here. How about a trip south once a year on top of pay? Or a cash bonus — let them decide.'),
    ['Путёвки на юг — всем','Trips south for everyone'],['Надбавка деньгами','A cash bonus'],
    ['Правильно. В девяносто восьмом мы так сохранили бригаду: море помнят дольше, чем премию.','Right. Back in ’98 that’s how we kept a crew together: people remember the sea longer than a bonus.'],
    ['Тоже честно. Деньги, как говорил мой покойный муж, загара не дают, но и не обгорают.','Fair too. Money, as my late husband used to say, won’t give you a tan, but it won’t burn you either.'],0,0),
  nor4:S('wow',()=>T('Сядь, если стоишь. Я выхожу замуж! За Глеба, он аудитор. Мама счастлива: «Наконец-то в семье будет второй человек, который читает примечания к отчётности». У Глеба дочь Ася, ей семнадцать, и она уже нашла ошибку в маминой домашней бухгалтерии. Придёшь?','Sit down if you’re standing. I’m getting married! To Gleb, he’s an auditor. Mum is thrilled: “Finally a second person in the family who reads the notes to the accounts.” Gleb has a daughter, Asya, she’s seventeen and has already found a mistake in Mum’s household books. Will you come?'),
    ['Приду обязательно!','I wouldn’t miss it!'],['Поздравлю по видеосвязи','I’ll congratulate you by video call'],
    [`Ура! Ты — за главным столом. Мама уже посчитала, сколько ты съешь. Не спорь с ней.`,`Hooray! You’re at the top table. Mum has already calculated how much you’ll eat. Don’t argue with her.`],
    ['Хорошо. Только включи камеру, а то мама решит, что ты бот.','All right. Just turn your camera on, or Mum will think you’re a bot.'],6,2),
  nor5:S('happy',()=>T('«Бобров и Ко» хочет купить у тебя медь. На гвозди. Шучу! Я делаю сеть зарядок для лесовозов. Электрических. Да, я тоже не верил, пока один не заехал ко мне во двор и не попросил розетку. Продашь по-дружески?','Beaver & Co wants to buy your copper. For nails. Kidding! I’m building charging stations for log trucks. Electric ones. Yes, I didn’t believe it either until one rolled into my yard and asked for a socket. Sell to a friend?'),
    ['По-дружески — по рукам','Friend’s price — deal'],['Только по бирже — дружба дружбой','Market price — friendship aside'],
    ['Записываю: «Спор №151 — кто щедрее. Ты». Ладно, в этот раз проигрывать приятно.','Writing it down: “Bet No. 151 — who’s more generous. You.” Fine, this time losing feels nice.'],
    ['Вот это я понимаю — по-взрослому! Я бы так же ответил. Наверное. Скорее всего. Нет, точно так же.','Now that’s grown-up! I’d have said the same. Probably. Most likely. No, definitely the same.'],5,5),
  sak1:S('happy',()=>T('Я на Сахалине! Не за тобой — за рыбой. Ладно, за тобой. Путина через месяц: рыба идёт три недели, и кто не успел — тот ждёт год. Местный рыбный король уже точит ножи. Ну что, наперегонки — как на лыжне?','I’m on Sakhalin! Not following you — following the fish. Fine, following you. The fishing season starts in a month: the fish run for three weeks, and whoever misses it waits a year. The local fish king is already sharpening his knives. Race you — like the ski race?'),
    ['Наперегонки! Как в пятом классе','A race! Like in fifth grade'],['Давай вместе против короля','Let’s team up against the king'],
    ['Только без срезки через лес в этот раз. Нас тогда обоих сняли, помнишь?','No cutting through the woods this time. They disqualified both of us back then, remember?'],
    ['Вместе? Ты меня пугаешь. Ладно. Но засолку считаю отдельно.','Together? You’re scaring me. Fine. But I’m counting the salting separately.'],6,2),
  sak2:S('worry',()=>T('Шторм! Паромы стоят, а у меня рефрижераторы с твоей рыбой. Два варианта: ждать у причала или везти вокруг через три порта. Рыба, если что, свежая — пока.','A storm! The ferries are stuck, and my reefers are loaded with your fish. Two options: wait at the pier or go the long way round through three ports. The fish, by the way, is fresh — for now.'),
    ['Ждём — шторм не вечен','We wait — storms don’t last'],['Везём вокруг — время дороже','Go round — time is money'],
    ['Ждём. Водители играют в домино на ящиках с крабами. Крабы, по-моему, болеют за Петю.','We wait. The drivers are playing dominoes on the crab crates. I think the crabs are rooting for Petya.'],
    ['Поехали! Три порта, три обеда, три новых знакомых. Марина говорит, я так и в отпуск не съезжу.','Off we go! Three ports, three lunches, three new friends. Marina says this is the closest I get to a holiday.'],6,2),
  sak3:S('calm',()=>T('Шельф — это как карьер, только сверху море и все на тебя смотрят. Мой старший предлагает платформу без единого выброса: дорого, но красиво. Можно и попроще — надёжно, проверено, красоту потом.','The shelf is like a quarry, only with the sea on top and everyone watching. My eldest proposes a platform with zero emissions: pricey but beautiful. Or something simpler — reliable, proven, beauty later.'),
    ['Делаем красиво — без выбросов','We do it beautifully — zero emissions'],['Надёжно, а красоту потом','Reliable now, beauty later'],
    ['Сын сияет. Говорит, это будет первая платформа, где чайки не ругаются.','My son is beaming. Says it’ll be the first platform the seagulls don’t complain about.'],
    ['Разумно. Сын немного дуется, но уже рисует «красоту потом». В трёх вариантах.','Sensible. My son is sulking a little, but he’s already drawing “beauty later”. Three versions.'],6,3),
  sak4:S('happy',()=>T('Ася на практике в аудиторской фирме. Угадай, чью отчётность ей дали проверять? Твою. Она нашла ошибку. В примечании, которое писала… моя мама. Мама говорит: «Это не ошибка, это традиция». Ася говорит: «Это ошибка». Обе ждут тебя.','Asya is doing her internship at an audit firm. Guess whose accounts she got to check? Yours. She found a mistake. In a note written by… my mum. Mum says: “It’s not a mistake, it’s a tradition.” Asya says: “It’s a mistake.” Both are waiting for you.'),
    ['Ася права — исправляем','Asya’s right — we fix it'],['Это традиция, Людмила Санна права','It’s tradition — Lyudmila Sanna is right'],
    ['Ася сделала вид, что ей всё равно, и сразу позвонила подругам. Мама сказала: «Вся в меня». Это высшая похвала.','Asya pretended not to care and immediately called her friends. Mum said: “Takes after me.” Highest praise there is.'],
    ['Мама довольна. Ася записала в блокнот: «Традиции — проверить через год». Растёт смена.','Mum is pleased. Asya wrote in her notebook: “Traditions — re-check in a year.” The next generation is coming.'],5,3),
  sak5:{m:'calm',t:()=>T('Топтыгин. Без предисловий. Я продаю «Медведь Капитал». Устал. Хочу на рыбалку — по-настоящему, без контракта и без совета директоров. Говорят, вы знаете здесь хорошие места. Возьмёте?','Toptygin. No preamble. I’m selling Bear Capital. I’m tired. I want to go fishing — for real, with no contract and no board of directors. They say you know the good spots here. Will you take me?'),
    o:{a:()=>[T('Возьму — удочка лишняя есть','I will — I’ve got a spare rod'),''],b:()=>[T('Сначала подпишем бумаги','Paperwork first'),'']},
    r:{a:()=>T('Спасибо. Обещаю молчать. Это я умею лучше всего.','Thank you. I promise to keep quiet. It’s what I do best.'),b:()=>T('Узнаю старого себя. Бумаги — на столе. Удочку — потом.','I recognise my old self. The papers are on the table. The rod — later.')}},
  alt1:S('happy',()=>T('Алтай! Мама сказала: «Наконец-то что-то полезное — мёд». Она уже заказала три банки и спросила, есть ли у тебя на пасеке бухгалтерия. Я сказала: «Мама, это пчёлы». Она: «Тем более».','Altai! Mum said: “Finally something useful — honey.” She’s already ordered three jars and asked whether your apiary keeps books. I said: “Mum, they’re bees.” She said: “All the more reason.”'),
    ['Назначим пчёлам главбуха','We’ll appoint the bees a chief accountant'],['Пусть мама приезжает в гости','Let your mum come and visit'],
    ['Мама согласилась на полставки. Говорит, пчёлы дисциплинированнее твоих первых продавцов.','Mum agreed to work half-time. Says the bees are more disciplined than your first shop staff.'],
    ['Мама уже собирает чемодан. В нём калькулятор, пироги и сетка от пчёл. Она готовилась.','Mum is already packing. A calculator, pies and a bee veil. She was prepared.'],6,2),
  alt2:S('calm',()=>T('Я приехала на вашу турбазу. Номер чудесный, воздух — хоть в банку закатывай. Но в меню «медовый чай» стоит дороже, чем мёд отдельно и чай отдельно. Это не наценка, это загадка.','I’ve checked into your lodge. Lovely room, air you could bottle. But on the menu “honey tea” costs more than honey and tea separately. That’s not a markup, that’s a mystery.'),
    ['Поправим меню','We’ll fix the menu'],['Это маркетинг, Людмила Санна','It’s marketing, Lyudmila Sanna'],
    ['Вот и славно. Я ещё проверю «пирог дня» — подозреваю, что он вчерашний.','Good. I’ll check the “pie of the day” too — I suspect it’s yesterday’s.'],
    ['Маркетинг… В девяносто четвёртом это называлось иначе. Ладно, пью, но с калькулятором.','Marketing… In ’94 we called it something else. Fine, I’ll drink it — with a calculator.'],0,0),
  alt3:S('happy',()=>T('Туристы! Хотят к Белухе и на маралов посмотреть. Я переделал два самосвала в автобусы. Шучу, купил настоящие. Марина назвала их «Пчёлка-1» и «Пчёлка-2». Возить им только на твою турбазу?','Tourists! They want to see Belukha mountain and the maral deer. I turned two dump trucks into buses. Kidding, I bought real ones. Marina named them Busy Bee 1 and Busy Bee 2. Should they only drive to your lodge?'),
    ['К нам — и тебе первые места','To us — and you get first pick'],['Пусть возят всех — честная очередь','Let them drive everyone — fair queue'],
    ['«Пчёлки» вылетают! Водители в полосатых жилетах. Это была идея Марины, не моя. Ну, моя тоже.','The Bees are flying! Drivers in striped vests. Marina’s idea, not mine. Well, mine too.'],
    ['Честно — значит, надолго. Туристы всё равно к тебе: у тебя мёд, у остальных — сувениры.','Fair means it lasts. The tourists will end up with you anyway: you’ve got honey, the others have souvenirs.'],6,3),
  alt4:S('calm',()=>T('Знаешь, я тут понял: всю жизнь копал вниз. А здесь горы — вверх. Хочу через годик-другой держать маленькую пасеку. Сыновья справятся без меня. Научишь?','You know, I’ve realised something: I’ve spent my whole life digging down. And here the mountains go up. In a year or two I want to keep a small apiary. My sons will manage without me. Will you teach me?'),
    ['Подарю тебе первый улей','I’ll give you your first hive'],['Сначала дострой мне разрез!','Finish my open pit first!'],
    ['Спасибо… Назову его «Сосновый лог». Пусть хоть пчёлы там живут без торгов.','Thank you… I’ll call it Pine Hollow. Let the bees at least live there without an auction.'],
    ['Ха! Узнаю тебя. Дострою — и сразу в пчеловоды. Записал в синюю папку.','Ha! That’s you all right. I’ll finish it — and then bees. Put it in the blue folder.'],6,2),
  alt5:S('happy',(a,w)=>T(`Слушай… Мы с тобой соревнуемся ${yrs(w)} ${YL(yrs(w))}. Я посчитал: из 152 споров я выиграл 74, ты — 77. Один вничью — лыжня в пятом классе, нас обоих сняли за срезку. Предлагаю последний: кто соберёт всех на встречу 11 «Б». Проигравший платит за торт.`,`Listen… We’ve been competing for ${yrs(w)} years. I counted: out of 152 bets I won 74, you won 77. One draw — the fifth-grade ski race, we were both disqualified for cutting the corner. One last bet: who gets everyone to the 11B reunion. The loser pays for the cake.`),
    ['Спорим! Торт — за тобой','Deal! The cake is on you'],['Давай соберём вместе','Let’s organise it together'],
    ['Ха! Посмотрим. Я уже написал Пете, Вите и Соне. И Людмиле Санне — она проверит список.','Ha! We’ll see. I’ve already texted Petya, Vitya and Sonya. And Lyudmila Sanna — she’ll check the list.'],
    ['Вместе? После стольких лет? …Ладно. Вторая ничья в истории. Запишу красной ручкой.','Together? After all these years? …Fine. The second draw in history. I’ll write it in red ink.'],6,6)};
const TT={yak1:['🚚 Сезон «Якутия»: зимник','🚚 Season “Yakutia”: the ice road'],yak5:['🐻 Одна переправа на двоих','🐻 One crossing for two'],
  nor1:['🌌 Сезон «Норильск»: полярная ночь','🌌 Season “Norilsk”: polar night'],nor5:['🔌 Медь для лесовозов','🔌 Copper for log trucks'],
  sak1:['🐟 Сезон «Сахалин»: путина','🐟 Season “Sakhalin”: the fishing run'],sak5:['🎣 Медведь уходит на рыбалку','🎣 The Bear goes fishing'],
  alt1:['🍯 Сезон «Алтай»: бухгалтерия для пчёл','🍯 Season “Altai”: accounting for bees'],alt5:['🎂 Последний спор','🎂 The last bet']};
// кто говорит в сценах «на всех» и кто — у Людмилы
function inject(){const U=root.STORYUI;if(!U||!U.SC||U.SC.yak1)return;Object.assign(U.SC,TX);if(U.TITLE)Object.assign(U.TITLE,TT);}
inject();
/* ---------- окно «Все серии» (Кабинет) ---------- */
function list(st){if(typeof modal!=='function')return;const e=st&&st.e||{},a=Object.keys(e).map(k=>({k,n:Math.floor(e[k]/100),s:e[k]%100})).sort((x,y)=>x.n-y.n);
  const SN=['',T('Подработка','Side jobs'),T('Своё дело','My own business'),T('Сеть','The chain'),T('Карьер','The quarry'),T('Недра','Mining')];
  const KN={yak:T('Якутия','Yakutia'),nor:T('Норильск','Norilsk'),sak:T('Сахалин','Sakhalin'),alt:T('Алтай','Altai')};
  let h='<h2>📺 '+esc(T('Сериал «11 „Б“»','The 11B series'))+'</h2><p class="b2s-sub">'+esc(T('Все серии, которые вы видели. Новые приходят в телефон по ходу игры.','Every episode you’ve seen. New ones arrive on your phone as you play.'))+'</p>',cur=-1;
  for(const x of a){if(x.s!==cur){cur=x.s;const kp=x.k.slice(0,3);const nm=SN[x.s]||KN[kp]||T('Холдинг №'+(x.s-4),'Holding No. '+(x.s-4));h+='<h3 class="b2s-h3">'+esc(T('Сезон '+x.s+' «'+nm+'»','Season '+x.s+' “'+nm+'”'))+'</h3>';}
    h+='<div class="b2s-li"><b>'+x.n+'</b><span>'+esc(title(x.k)||x.k)+'</span></div>';}
  if(!a.length)h+='<p>'+esc(T('Пока ни одной серии — всё впереди.','No episodes yet — it’s all ahead.'))+'</p>';
  h+='<div class="row"><button class="btn w accent" onclick="hideModal()">'+esc(T('Закрыть','Close'))+'</button></div>';modal(h);}
/* ---------- стиль серий ---------- */
if(typeof document!=='undefined'&&!document.getElementById('b2s-css')){const s=document.createElement('style');s.id='b2s-css';
  s.textContent='.b2s-ep{margin:0 0 4px;padding-right:52px;font-size:14px;font-weight:700;letter-spacing:.02em;color:var(--muted,#4f5d72);text-transform:none}'
    +'.b2s-nx{margin:10px 0 2px;padding:8px 10px;border-radius:10px;background:var(--lk-hb,#f3f5f9);font-size:16px;line-height:1.35;color:var(--ink,#1d2733)}'
    +'.b2s-sub{color:var(--muted,#4f5d72);font-size:15px;margin-top:-4px}.b2s-h3{font-size:16px;margin:14px 0 4px}'
    +'.b2s-li{display:flex;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--line,#d5dbe2);font-size:17px}.b2s-li b{min-width:2.4em;color:var(--muted,#4f5d72)}';
  document.head.appendChild(s);}
BS.set('tx',{title,next,list,TX,TL,NX});
})(typeof window!=='undefined'?window:globalThis);
