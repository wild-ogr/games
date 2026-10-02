/* ================= «Из ларька в магнаты: бизнес» — сюжет «4 друга из 11 „Б“»: тексты и окна (window.STORYUI) =================
   Модель — js/story.js (STORY, ECON.friendAnswer/friendCall/…), портреты — js/friends.js (friendSvg). Договорённость с телефоном — tools/phone-api.md.
   STORYUI: who(id), msg(W,item), why(code), after(W,res), big(qid), callLabel(k,op), call(id,k), hello(W,id), feed(W,f), date(W,d)
   и свои окна: openFriends() — «Кто из нас дальше» и друзья, openFriend(id) — карточка (звонок, займы, совместные дела), openAsk(qid) — сцена/просьба.
   Без телефона (нет window.PHONE) — запасной вход: кнопка 👥 в шапке и окна сцен сами по себе (по одной, когда нет другого окна).
   Этап 5: prologue(done,{replay}) — пролог «Пари 11 „Б“» с выбором пола и имени; openHero() — «Как меня зовут» (для ⚙); prologueDue(); openIpoScene — IPO тремя кадрами;
   awayHtml() — блок «📱 Новости друзей» + «🔮 Скоро…» для окна «Пока вас не было» (если окно его не вставило — добавляется само перед #bzOk/#oOk);
   teaser() — «Завтра…» {w,tx,mood} (показывается тостом при паузе ⏸); partner() — партнёр для недр {id,n}; window.HERO {fem,g(м,ж),name,v} — род и имя героя для других файлов.
   Все тексты — L('рус','eng'); персонажи вымышленные. Траты — кнопки .noenter. */
(function(){
'use strict';
if(typeof ECON==='undefined'||!window.STORY)return;
const E=ECON,SY=window.STORY;
const W=()=>window.GAME&&GAME.W;
const en=()=>typeof LANG!=='undefined'&&LANG==='en';
const T=(r,e)=>typeof L==='function'?L(r,e):r;
const pln=(n,a,b,c,d,e)=>typeof pl==='function'?pl(n,a,b,c,d,e):c;
const money=x=>window.FMT?FMT.money(x):Math.round(x)+' ₽';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mon=n=>n+' '+pln(n,'месяц','месяца','месяцев','month','months');
const snd=k=>{try{if(window.SND&&SND[k])SND[k]();}catch(e){}};
const FRS=SY.FR;
const COL=window.FRIEND_COL||{owl:'#5b4b8a',beav:'#2e7d5b',bars:'#8e6b3a',vit:'#e07b39',bear:'#b03a2e'};

/* ---------------- герой: пол и имя (пролог; W.fr.hero) ----------------
   G('начал','начала') — форма по полу героя; hv() — как друзья зовут героя (имя или «председатель»); window.HERO — для других файлов. */
const HN={m1:['Андрей','Andrey'],m2:['Сергей','Sergey'],m3:['Дмитрий','Dmitry'],f1:['Татьяна','Tatiana'],f2:['Ольга','Olga'],f3:['Елена','Elena']};
const hero=()=>{const w=W();return (w&&w.fr&&w.fr.hero)||{g:'m',n:'',nc:''};};
const fem=()=>hero().g==='f';
const G=(m,f)=>fem()?f:m;
function heroName(){const h=hero();if(h.nc)return h.nc;const x=HN[h.n];return x?T(x[0],x[1]):'';}
const pres=()=>T('председатель','president');
const hv=()=>heroName()||pres();
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
window.HERO={fem,g:G,name:heroName,v:hv,pres};

/* ---------------- кто есть кто ---------------- */
const NAME={owl:['Соня Совина','Sonya Sovina'],beav:['Борис Бобров','Boris Bobrov'],bars:['Пётр Барсуков','Pyotr Barsukov'],vit:['Витя Козлов','Vitya Kozlov'],bear:['Михаил Топтыгин','Mikhail Toptygin'],lud:['Людмила Санна','Lyudmila Sanna'],you:['Вы','You']};
const NICK={owl:['Соня','Sonya'],beav:['Борис','Boris'],bars:['Пётр','Pyotr'],vit:['Витя','Vitya'],bear:['Топтыгин','Toptygin'],lud:['Людмила Санна','Lyudmila Sanna'],you:['Вы','You']};
// кто из героев — женщина (для «обещала/обещал»)
const FEM={owl:1,lud:1};
const GEN={owl:'Сони',beav:'Бориса',bars:'Петра',vit:'Вити',bear:'Топтыгина',lud:'Людмилы Санны'};
const gen=id=>en()?nk(id):(GEN[id]||nk(id));
const nm=id=>{const x=NAME[id];return x?T(x[0],x[1]):id;};
const nk=id=>{const x=NICK[id];return x?T(x[0],x[1]):id;};
// месяцев «пути» друзей: в истории «с нуля» — от старта; в мире «сразу недра» — друзья уже на вершине пути
function path(w){const F=w&&w.fr;if(!F||!F.v)return 999;return F.rags?w.m-F.m0:999;}
function who(id){const w=W(),mm=path(w),ned=!!(w&&w.ned);let s=['',''];
  if(id==='owl')s=ned||mm>=125?['фонд «Сова Инвест»','Owl Invest fund']:mm>=75?['аналитик, копит на свой фонд','analyst, saving up for her own fund']:mm>=40?['банк «Сибирский кредит», начальник отдела','Siberian Credit bank, head of department']:['банк «Сибирский кредит», кредитный инспектор','Siberian Credit bank, loan officer'];
  else if(id==='beav')s=ned||mm>=66?['«Бобров и Ко»','Beaver & Co']:mm>=54&&w.fr.dn&&w.fr.dn.beav3!==undefined?['начинает заново','starting over']:mm>=20?['ларьки и стройбаза','kiosks and a builders’ yard']:['ларёк у остановки','a bus-stop kiosk'];
  else if(id==='bars')s=!ned&&w.fr&&w.fr.bars&&w.fr.bars.tpt&&!w.fr.bars.stay&&SY.lv(w,'bars')<=1?['главный инженер «Медвежьего» разреза (у Топтыгина)','chief engineer at Toptygin’s Bear open pit']:ned||mm>=90?['«Барсуков и сыновья»','Barsukov & Sons']:['горный инженер, карьер «Сосновый лог»','mining engineer, Pine Hollow quarry'];
  else if(id==='vit')s=mm>=110||ned?['«ВитТранс»: самосвалы и вагоны','VitTrans: trucks and rail cars']:mm>=45?['«ВитТранс», самосвалы','VitTrans, dump trucks']:mm>=2?['Газель, грузоперевозки','a van, deliveries']:['такси','taxi driver'];
  else if(id==='bear')s=['«Медведь Капитал», Москва','Bear Capital, Moscow'];
  else if(id==='lud')s=w&&w.fr&&w.fr.lud&&w.fr.lud.ret?['на пенсии, на связи по пятницам','retired, on the phone on Fridays']:['главбух, мама Сони','chief accountant, Sonya’s mum'];
  return {n:nm(id),sub:T(s[0],s[1])};}

/* ---------------- портреты ---------------- */
function pic(id,mood,px){px=px||48;const c=COL[id]||'#98a2b3';let svg='';
  if(id!=='you'&&typeof window.friendSvg==='function'){try{svg=window.friendSvg(id,mood||'calm');}catch(e){svg='';}}
  if(!svg)svg=`<span class="st-ini">${esc(id==='you'?T('Вы','You'):nk(id).slice(0,1))}</span>`;
  return `<span class="st-av" style="width:${px}px;height:${px}px;border-color:${c}">${svg}</span>`;}
function hearts(tr){const h=SY.hearts(tr);return '<span class="st-hr" aria-label="'+T('доверие','trust')+' '+Math.round(tr)+'">'+'❤'.repeat(h)+'<i>'+'❤'.repeat(5-h)+'</i></span>';}

/* ---------------- тексты сцен ----------------
   t(a,w) — сообщение друга; o — варианты [подпись, подсказка]; r — ответ друга на выбор; m — настроение. */
const gName=g=>{if(E.GOODS&&E.GOODS[g])return window.NM?NM.good(g):E.GOODS[g].n;const x={sand:['песок','sand'],grav:['щебень','crushed stone']}[g];return x?T(x[0],x[1]):T('участок','the plot');};
const SC={
  vit1:{m:'happy',t:a=>T(`Привет, это Витя! Мой знакомый переезжает — нужны руки на вечер, платит сразу ${money(a.a)}. Возьмёшь?`,`Hi, it’s Vitya! A friend of mine is moving — needs an extra pair of hands tonight, pays ${money(a.a)} on the spot. In?`),
    o:{a:a=>[T('Беру, спасибо!','I’m in, thanks!'),T(`+${money(a.a)} сразу`,`+${money(a.a)} right away`)],b:()=>[T('Сегодня не успею','Can’t make it today'),'']},
    r:{a:()=>T('Вот это я понимаю! Он уже перевёл деньги.','That’s the spirit! He’s already sent the money.'),b:()=>T('Без проблем, найду ещё.','No problem, I’ll find more.')}},
  owl1:{m:'calm',t:a=>T(`Привет! Мама сказала, у тебя теперь своё дело. Могу оформить кредитку с лимитом ${money(a.a)}. Только помни: 100 дней без процентов — это не подарок, а срок.`,`Hi! Mum says you’ve got your own business now. I can get you a credit card with a ${money(a.a)} limit. Just remember: 100 interest-free days is a deadline, not a gift.`),
    o:{a:a=>[T('Оформляй','Go ahead'),T(`лимит ${money(a.a)}, 100 дней без процентов`,`${money(a.a)} limit, 100 days interest-free`)],b:()=>[T('Пока обойдусь','I’ll manage for now'),T('❤ всё равно чуть вырастет','❤ still goes up a little')]},
    r:{a:()=>T('Готово, карта придёт завтра. И да — я посмотрю, как ты гасишь.','Done, the card arrives tomorrow. And yes — I’ll be watching how you repay.'),b:()=>T('Правильно. Кто не берёт в долг, тот спит спокойно. Мама сказала бы так же.','Fair enough. No debt, sound sleep. Mum would say the same.')}},
  beav1:{m:'happy',t:()=>T(`${G('Видал','Видала')} ларёк напротив твоего? Мой! Как на лыжне в пятом классе: кто первый?`,'Seen the kiosk across from yours? It’s mine! Like the ski race in fifth grade: who’s first?'),
    o:{a:()=>[T('Посоревнуемся!','Game on!'),''],b:()=>[T('Покупателей хватит на всех','There are enough customers for both'),'']},
    r:{a:()=>T('Вот это разговор! Проигравший угощает шаурмой.','Now we’re talking! The loser buys the shawarma.'),b:()=>T('Хватит, конечно. Но первым всё равно буду я.','Sure there are. But I’ll still be first.')}},
  beav2:{m:'calm',t:()=>T('Слушай, у меня поставщик воды и снеков. Если закупаться вместе, нам обоим скидка 5 %. Соперничество соперничеством, а скидка — дело святое.','Listen, I’ve got a drinks and snacks supplier. If we buy together, we both get 5% off. Rivalry is rivalry, but a discount is sacred.'),
    o:{a:()=>[T('Закупаемся вместе','Let’s buy together'),T('−5 % к закупке товара на год','−5% on stock purchases for a year')],b:()=>[T(G('Спасибо, я сам','Спасибо, я сама'),'Thanks, I’ll manage'),'']},
    r:{a:()=>T('Договорились! Год закупаемся вместе.','Deal! We buy together for a year.'),b:()=>T('Как знаешь. Предложение в силе.','Your call. The offer stands.')}},
  bars1:{m:'worry',t:()=>T('Привет. Копим с Олей на квартиру. Банк просит поручителя по ипотеке. Я посчитал — платёж потянем. Поручишься?','Hi. Olya and I are saving for a flat. The bank wants a guarantor for the mortgage. I’ve done the maths — we can afford the payment. Will you vouch for us?'),
    o:{a:()=>[T('Поручусь','I’ll vouch for you'),T('на 2 года; если Пётр не заплатит, платёж ляжет на вас','for 2 years; if Pyotr misses a payment, it falls on you')],b:()=>[T('Прости, не могу','Sorry, I can’t'),'']},
    r:{a:()=>T('Спасибо. Не подведу — я пересчитал нагрузку дважды.','Thank you. I won’t let you down — I checked the load twice.'),b:()=>T('Понимаю. Лучше честно отказать, чем потом жалеть.','I understand. Better an honest no than regrets later.')}},
  beav3:{m:'worry',big:1,t:a=>T(`Не спишь, ${hv()}? Прогорел я. Стройбаза, долги — ${money(a.a)}. Банк больше не даёт. Звоню не за жалостью — за советом. Ну и… вдруг выручишь.`,`Still up, ${hv()}? I’ve gone bust. The builders’ yard, debts — ${money(a.a)}. The bank won’t lend any more. I’m not calling for pity — for advice. And… maybe a hand.`),
    o:{a:a=>[T(`Займу ${money(a.a)} без процентов на год`,`Lend ${money(a.a)} interest-free for a year`),T('вернёт через 12 месяцев; доверие сильно вырастет','he repays in 12 months; trust grows a lot')],
       b:a=>[T(`Войду в долю его стройбазы за ${money(a.a)}`,`Buy half of his yard for ${money(a.a)}`),T('станете совладельцем: половина прибыли ваша, дивиденды решаете вместе раз в год','you become co-owner: half the profit is yours, dividends agreed together once a year')],
       c:()=>[T('Сейчас не могу помочь','I can’t help right now'),''],
       d:(a,w)=>{const x=w?SY.partA(w):0;return [T(`Займу сколько могу — ${money(x)}`,`Lend what I can — ${money(x)}`),T('на полную сумму денег нет; вернёт через 12 месяцев, доверие вырастет','not enough for the full amount; repaid in 12 months, trust grows')];}},
    r:{a:()=>T('Я этого не забуду. Верну до копейки — и если тебе будет трудно, приду первым.','I won’t forget this. I’ll pay back every kopeck — and if you’re ever in trouble, I’ll be the first to come.'),
       b:()=>T('Честная сделка. Партнёр так партнёр — теперь это наша база!','A fair deal. Partners it is — it’s our yard now!'),c:()=>T(`Понимаю. Сам заварил — сам и расхлебаю. Спасибо, что ${G('выслушал','выслушала')}.`,'I get it. I made this mess, I’ll clean it up. Thanks for listening.'),
       d:()=>T('Спасибо. Это больше, чем я ждал, — остальное найду. Не забуду.','Thank you. That’s more than I expected — I’ll find the rest. I won’t forget it.')}},
  vit3:{m:'happy',t:a=>T(`Слушай идею! Транспортная компания на двоих: мои водители и клиенты, твои деньги — ${money(a.a)}. Прибыль пополам.`,`Here’s an idea! A transport company for two: my drivers and clients, your money — ${money(a.a)}. We split the profit.`),
    o:{a:a=>[T('По рукам!','Deal!'),T(`вклад ${money(a.a)}, ваша доля 50 %`,`invest ${money(a.a)}, your share 50%`)],b:()=>[T('Пока нет','Not yet'),'']},
    r:{a:()=>T('Ура! «ВитТранс» теперь и твой. Первый рейс — за мой счёт 🚚','Hooray! VitTrans is yours too. The first run is on me 🚚'),b:()=>T('Понял, не обижаюсь. Надумаешь — звони.','Got it, no hard feelings. Call me if you change your mind.')}},
  bars2:{m:'calm',t:a=>T(`${a.pl?G('Помнишь, ты сказал сохранить мой проект? Вот он. ','Помнишь, ты сказала сохранить мой проект? Вот он. '):''}«Сосновый лог» выставляют на торги. Я знаю каждый уступ. Пойдём вместе? Мой вклад — знания и проект, твой — ${money(a.a)}. У тебя ${pct(a.sh||.6)}.`,`${a.pl?'Remember you told me to keep my design? Here it is. ':''}Pine Hollow is going up for auction. I know every bench of it. Shall we go in together? I bring the know-how and the design, you bring ${money(a.a)}. You get ${pct(a.sh||.6)}.`),
    o:{a:a=>[T('Идём вместе','Let’s go together'),T(`вклад ${money(a.a)}, ваша доля ${pct(a.sh||.6)}`,`invest ${money(a.a)}, your share ${pct(a.sh||.6)}`)],b:()=>[T(G('Пойду один','Пойду одна'),'I’ll go alone'),T('Пётр подаст заявку с Борисом — честные торги','Pyotr will bid with Boris — a fair auction')],c:()=>[T('Возьму другой участок','I’ll take another plot'),'']},
    r:{a:()=>T('Отлично. Проект уже в столе — завтра покажу.','Great. The design is in my drawer — I’ll show you tomorrow.'),b:()=>T('Честно. Тогда увидимся на торгах — пусть победит лучший расчёт.','Fair. See you at the auction then — may the best numbers win.'),c:()=>T('Разумно. Места под Кемеровом хватит всем.','Sensible. There’s room for everyone around Kemerovo.')}},
  // M30: Соня — партнёр (если выбрали её фонд) и соперник на торгах; письмо не должно говорить, что «Сова Инвест» только открывается
  ned1:{m:'wow',big:1,t:()=>partner().id==='owl'?T('Письмо Роснедр пришло вам — и почти в тот же день Соне, Борису и Пете. Соня вложилась в вас через «Сова Инвест», но и сама пойдёт на торги: «Дружба дружбой, а участки врозь!» Борис уже купил костюм. «Ну что, в большую лигу?»','A letter from the subsoil agency reached you — and, almost the same day, Sonya, Boris and Pyotr. Sonya invested in you through Owl Invest, but she’ll bid for plots herself too: “Friends are friends, but plots are separate!” Boris has already bought a suit. “Well then, the big league?”'):T('Письмо Роснедр пришло вам — и почти в тот же день Соне, Борису и Пете. Соня нашла инвестора и открывает «Сова Инвест», Борис уже купил костюм. «Ну что, в большую лигу?»','A letter from the subsoil agency reached you — and, almost the same day, Sonya, Boris and Pyotr. Sonya found an investor and opens Owl Invest, Boris has already bought a suit. “Well then, the big league?”'),
    o:{a:()=>[T('В большую лигу!','To the big league!'),'']},r:{a:()=>T('Встретимся на торгах. Честно и по-дружески!','See you at the auctions. Fair and friendly!')}},
  bear1:{m:'worry',big:1,t:a=>T(`Беда, ${hv()}. Топтыгин из «Медведь Капитала» купил долю в «ВитТрансе» и давит на меня. Выкупить её обратно — ${money(a.a)}. Поможешь? Верну за два года, а возить тебе буду со скидкой.`,`Trouble, ${hv()}. Toptygin of Bear Capital bought a stake in VitTrans and is leaning on me. Buying it back costs ${money(a.a)}. Will you help? I’ll repay in two years and haul your freight at a discount.`),
    o:{a:a=>[T(`Помогу: займ ${money(a.a)} на 2 года`,`Help: lend ${money(a.a)} for 2 years`),T('возврат через 24 месяца; «ВитТранс» возит вам на 15 % дешевле всегда','repaid in 24 months; VitTrans hauls for you 15% cheaper for good')],b:()=>[T('Не буду вмешиваться','I’ll stay out of it'),'']},
    r:{a:()=>T('Вот это друг! «ВитТранс» снова наш. Твои грузы — со скидкой 15 %, навсегда.','What a friend! VitTrans is ours again. Your freight is 15% off, for good.'),b:()=>T('Понимаю, деньги большие. Как-нибудь выкручусь.','I understand, it’s a lot of money. I’ll find a way.')}},
  help:{m:'calm',t:a=>T(`Видел, у тебя овердрафт. Держи ${money(a.a)} без процентов на ${mon(a.n)}. Я тебя честно обыграю, а не пока ты лежишь.`,`I saw you’re in overdraft. Here’s ${money(a.a)} interest-free for ${mon(a.n)}. I’ll beat you fair and square — not while you’re down.`),
    o:{a:a=>[T('Спасибо, возьму','Thanks, I’ll take it'),T(`вернуть ${money(a.a)} через ${mon(a.n)}, без процентов`,`repay ${money(a.a)} in ${mon(a.n)}, no interest`)],b:()=>[T(G('Спасибо, справлюсь сам','Спасибо, справлюсь сама'),'Thanks, I’ll manage'),'']},
    r:{a:()=>T('Вот и славно. Вставай — нам ещё соревноваться.','Good. Get up — we’ve still got a race to run.'),b:()=>T('Уважаю. Но если что — звони.','Respect. But call me if anything.')}},
  /* ---- этап 5: новые сцены ---- */
  first1:{m:'happy',big:1,t:()=>T('Первая выручка своего дела! Мой покойный муж первую выручку всегда клал под скатерть — на удачу. Я не советую: скатерть процентов не платит. Но разок — можно 🙂','Your business’s first takings! My late husband always tucked the first takings under the tablecloth — for luck. I don’t recommend it: tablecloths pay no interest. But just once — why not 🙂'),
    o:{a:()=>[T('Положить под скатерть','Under the tablecloth'),T('на удачу — деньги всё равно ваши','for luck — the money is still yours')],b:()=>[T('Сразу в дело','Straight back into the business'),'']},
    r:{a:()=>T('Вот и я так делала в 94-м. Пусть полежит на удачу — а завтра всё равно в оборот 😉','That’s what I did in ’94. Let it lie there for luck — tomorrow it goes back to work anyway 😉'),b:()=>T('Правильно. Я бы тоже так, но муж был романтик.','Right. I’d do the same, but my husband was a romantic.')}},
  owl2:{m:'calm',t:()=>T('Мама опять до ночи сидела над твоими отчётами. Говорит: «Это лучше сериала». Приходи в воскресенье на пироги? Ей важно, что её цифры кому-то нужны.','Mum sat up late over your reports again. She says, “It’s better than a TV series.” Come for pies on Sunday? It matters to her that her numbers are needed.'),
    o:{a:()=>[T('Приду обязательно','I’ll be there'),T('❤ Сони +5','❤ Sonya +5')],b:()=>[T(G('Скажи, что очень занят','Скажи, что очень занята'),'Tell her I’m swamped'),'']},
    r:{a:()=>T('Ура! Мама уже ставит тесто. Предупреждаю: будет спрашивать про налоги 😊','Yay! Mum’s already making the dough. Fair warning: she’ll ask about taxes 😊'),b:()=>T('Скажу. Она поймёт — она всегда понимает.','I will. She’ll understand — she always does.')}},
  beav4:{m:'happy',t:()=>T('В субботу городской забег «Сибирская лыжня». Моя точка против твоей: кто проиграет — неделю закупается у победителя. Или слабо?','The city ski race “Siberian Track” is on Saturday. My shop against yours: the loser buys stock from the winner for a week. Or chicken?'),
    o:{a:a=>[T('Иду на лыжню!','To the ski track!'),T(`победа — Борис закупится у вас на ${money(a.a)}; силы ⚡ помогают`,`win — Boris buys ${money(a.a)} of stock from you; energy ⚡ helps`)],b:()=>[T('Я уже не в той форме','I’m not in that shape any more'),'']},
    r:{a:a=>a.win?T(`${G('Обогнал','Обогнала')} меня на последнем подъёме! Честно. Неделю закупаюсь у тебя — держи ${money(a.a)}.`,`You overtook me on the last climb! Fair and square. I’ll buy from you for a week — here’s ${money(a.a)}.`)
        :T(`${G('Хорошо шёл','Хорошо шла')}! Но первым опять я 😄 Закупаться у меня не надо — это я для азарта.`,'Good race! But I was first again 😄 No need to buy from me — that was just for fun.'),
       b:()=>T(`Эх, ${hv()}! В пятом классе ты не ${G('сдавался','сдавалась')}.`,`Oh, ${hv()}! In fifth grade you never gave up.`)}},
  bars3:{m:'calm',t:()=>T(`Защитил проект разреза. Главный сказал — лучший за десять лет. Но денег на него у «Соснового лога» нет. Может, лет через пять… Ладно. Просто хотел, чтобы ты ${G('знал','знала')}.`,'My open-pit design passed. The chief called it the best in ten years. But Pine Hollow has no money for it. Maybe in five years… Anyway. Just wanted you to know.'),
    o:{a:()=>[T('Сохрани его для меня','Keep it for me'),T('пригодится, когда дойдёт до карьера','it’ll come in handy when you get to quarries')],b:()=>[T('Горжусь тобой','I’m proud of you'),'']},
    r:{a:()=>T('Сохраню. Синяя папка, на ней твоё имя.','I will. A blue folder with your name on it.'),b:()=>T('Спасибо. Мне это важно.','Thanks. That matters to me.')}},
  vit4:{m:'happy',t:()=>T(`Женюсь! Марина сказала: «Или свадьба, или я ухожу к таксисту получше». Будешь ${G('свидетелем','свидетельницей')}? ${G('Галстук','Цветы')} — с меня.`,`I’m getting married! Marina said, “Either a wedding or I leave for a better taxi driver.” Will you be my ${G('best man','best woman')}? The ${G('tie’s','flowers are')} on me.`),
    o:{a:a=>[T(G('Буду свидетелем!','Буду свидетельницей!'),G('I’ll be best man!','I’ll be your best woman!')),T(`подарок молодым ${money(a.a)}; ❤ +10`,`a gift for the couple ${money(a.a)}; ❤ +10`)],b:()=>[T('Приду в гости','I’ll come as a guest'),'❤ +5']},
    r:{a:()=>T('Ура! Марина плачет от счастья. Кольца — у тебя, не потеряй!','Hooray! Marina’s crying with joy. You hold the rings — don’t lose them!'),b:()=>T('Отлично! Место за главным столом — твоё.','Great! Your seat’s at the top table.')}},
  tpt1:{m:'strict',big:1,t:a=>T(`Топтыгин, «Медведь Капитал». Буду краток. У вас ${a.n||1} ${pln(a.n||1,'точка','точки','точек','outlet','outlets')} и хорошие цифры. Куплю всё за полтора годовых оборота. Деньгами, завтра.`,`Toptygin, Bear Capital. I’ll be brief. You have ${a.n||1} ${pln(a.n||1,'точка','точки','точек','outlet','outlets')} and good numbers. I’ll buy the lot for one and a half years’ turnover. Cash, tomorrow.`),
    o:{a:()=>[T('Не продаётся','Not for sale'),''],b:()=>[T('А сколько это в рублях?','How much is that in roubles?'),'']},
    r:{a:()=>T('Уважаю. Тогда увидимся на торгах. Я редко проигрываю.','Respectable. See you at the auctions, then. I rarely lose.'),
       b:a=>T(`${money(a.a)}. Но вижу — не продадите. Уважаю. Увидимся на торгах. (Людмила Санна шепчет: «Не продавайте. Такие покупают дёшево».)`,`${money(a.a)}. But I can see you won’t sell. Respect. See you at the auctions. (Lyudmila Sanna whispers: “Don’t sell. His kind buy cheap.”)`)}},
  lud1:{m:'worry',big:1,t:()=>T('Не хотела говорить… Меня зовёт Топтыгин. Главбухом в «Медведь Капитал», втрое больше денег. Я, конечно, откажу. Или… как вы скажете?','I didn’t want to say… Toptygin offered me a job. Chief accountant at Bear Capital, triple the money. Of course I’ll refuse. Or… what do you say?'),
    o:{a:()=>[T('Людмила Санна, без вас никуда','I can’t do it without you'),''],b:()=>[T('Решайте сами — я пойму','It’s your call — I’ll understand'),'']},
    r:{a:()=>T('Вот и я так подумала. Пирожки у Топтыгина всё равно не те.','That’s what I thought. His pies wouldn’t be right anyway.'),b:()=>T('Спасибо, что не держите. Поэтому и остаюсь.','Thank you for not holding me back. That’s exactly why I’m staying.')}},
  lud3:{m:'wow',big:1,t:()=>T('Соня шепчет по телефону: «У мамы в субботу юбилей. Она просила никому не говорить — значит, ждёт всех». Что подарим?','Sonya whispers on the phone: “Mum’s birthday is on Saturday — a big one. She asked us not to tell anyone, which means she expects everyone.” What shall we give her?'),
    o:{a:a=>[T('Путёвку в санаторий','A spa holiday'),T(`${money(a.a)}, прочие расходы`,`${money(a.a)}, other expenses`)],b:()=>[T('Испечь торт своими руками','Bake a cake ourselves'),'']},
    r:{a:()=>T('Людмила Санна: «Санаторий?! Да я там со скуки отчёты начну сводить… Спасибо. Правда, спасибо».','Lyudmila Sanna: “A spa?! I’ll start balancing their books out of boredom… Thank you. Really, thank you.”'),
       b:()=>T('Людмила Санна: «Кривоватый, но свой. Лучший торт за шестьдесят лет. Только рецепт я вам потом поправлю».','Lyudmila Sanna: “A bit lopsided, but homemade. The best cake in sixty years. I’ll correct your recipe later, though.”')}},
  owl4:{m:'happy',big:1,t:()=>T('Ухожу из банка — открываю свой фонд! Первая презентация в пятницу. Придёшь? Мама печёт торт и волнуется больше меня.','I’m leaving the bank — I’m opening my own fund! The first presentation is on Friday. Will you come? Mum’s baking a cake and is more nervous than me.'),
    o:{a:()=>[T('Приду с цветами','I’ll come with flowers'),'❤ +5'],b:()=>[T('Пришлю поздравление','I’ll send my congratulations'),'']},
    r:{a:()=>T('Спасибо! Займу тебе место в первом ряду.','Thank you! I’ll save you a front-row seat.'),b:()=>T('Спасибо! Выложу фото — посмотришь.','Thanks! I’ll post photos for you.')}},
  tpt2:{m:'strict',big:1,t:()=>T('Соня в общем чате: «Ребята, на участок „Каменный ручей“ заявился Топтыгин. Поодиночке он нас передавит. Совместная заявка — законно, я проверила. Кто в деле?»','Sonya in the group chat: “Guys, Toptygin has bid for the Stony Brook plot. One by one he’ll crush us. A joint bid is legal — I checked. Who’s in?”'),
    o:{a:()=>[T('Все вместе!','All together!'),T('❤ Сони, Бориса и Петра +5','❤ Sonya, Boris and Pyotr +5')],b:()=>[T('Пусть победит сильнейший','May the strongest win'),'']},
    r:{a:()=>T(`Видали?! Одиннадцатый «Б» — сила! «Ручей» наш. Кубок пока оставь себе, ${hv()} 😄`,`See that?! Class 11B rules! Stony Brook is ours. Keep the cup for now, ${hv()} 😄`),
       b:()=>T('Топтыгин переплатил вдвое и забрал «Ручей». Пётр: «Пусть окупает. Мы найдём лучше».','Toptygin overpaid twice over and took Stony Brook. Pyotr: “Let him try to pay it back. We’ll find better.”')}},
  bars5:{m:'happy',t:()=>T('Завтра первый массовый взрыв на новом уступе. Хочешь посмотреть? Каску дам.','Tomorrow’s the first big blast on the new bench. Want to watch? I’ll lend you a hard hat.'),
    o:{a:()=>[T('Приеду!','I’ll come!'),'❤ +5'],b:()=>[T('В другой раз','Another time'),'']},
    r:{a:()=>T('Жду в шесть утра. Бутерброды — с меня.','See you at six a.m. Sandwiches are on me.'),b:()=>T('Понял. Сниму на видео.','Got it. I’ll film it.')}},
  beav6:{m:'happy',t:()=>T('Слышал, Роснедра рассылают письма. Если позовут — идём вместе? Будем соседями по торгам, как когда-то по ларькам.','I hear the subsoil agency is sending out letters. If they invite us — shall we go together? Neighbours at the auctions, like with the kiosks.'),
    o:{a:()=>[T('Идём вместе!','Let’s go together!'),''],b:()=>[T('Посмотрим, кто первый','We’ll see who’s first'),'']},
    r:{a:()=>T('Вот это разговор! Костюм я уже присмотрел.','Now we’re talking! I’ve already picked a suit.'),b:()=>T('Ха! Значит, по-старому — наперегонки.','Ha! The old way, then — a race.')}},
  part:{m:'wow',big:1,t:()=>T('Роснедра нас ждут, но на федеральные торги нужен партнёр с деньгами. Предложений два: фонд Сони «Сова Инвест» и «Медведь Капитал» Топтыгина. Условия похожие. Кого берём?','The subsoil agency is waiting, but national auctions need a partner with money. There are two offers: Sonya’s Owl Invest fund and Toptygin’s Bear Capital. The terms are similar. Who do we take?'),
    o:{a:()=>[T('Фонд «Сова Инвест» (Соня)','Owl Invest fund (Sonya)'),T('❤ Сони +10','❤ Sonya +10')],b:()=>[T('«Медведь Капитал» (Топтыгин)','Bear Capital (Toptygin)'),T('на IPO Топтыгин будет в зале — со своей стороны','Toptygin will be in the hall at the IPO — on his own side')]},
    r:{a:()=>T('Соня уже звонила: «Мама сказала — только в тебя». Ну, в добрый путь!','Sonya has already called: “Mum said — only you.” Well, off we go!'),b:()=>T('Деньги у него честные, хоть и холодные. Ладно — посмотрим, кто кого.','His money is honest, if cold. All right — we’ll see who wins.')}},
  // M20: «плохие» развилки — друг обижен (уровень «прохладно» или «в ссоре»)
  owlno:{m:'worry',t:()=>T(`Мне звонили из кредитного отдела — спрашивали про тебя. Раньше я бы сразу сказала: «Ручаюсь». А сейчас… Прости, поручиться не могу. Между нами что-то не так, а в банке такое чувствуют.`,'The credit department called me — asking about you. Before, I’d have said right away, “I vouch for them.” But now… Sorry, I can’t vouch. Something’s off between us, and banks pick up on that.'),
    o:{a:()=>[T('Соня, давай поговорим. Прости, если обидел'+G('','а'),'Sonya, let’s talk. Sorry if I hurt you'),'❤ +8'],b:()=>[T(G('Понимаю. Справлюсь сам','Понимаю. Справлюсь сама'),'I understand. I’ll manage'),T('поручительство — снова с уровня «друзья»','the guarantee comes back at “friends”')]},
    r:{a:()=>T('Спасибо, что сказал'+G('','а')+'. Давай в воскресенье к маме — там и поговорим.','Thanks for saying it. Come to Mum’s on Sunday — we’ll talk there.'),b:()=>T('Хорошо. Если что — я всё ещё здесь.','Okay. I’m still here, if anything.')}},
  beavno:{m:'strict',t:()=>T('Слышал, ты метишь на торги за карьер. Я тоже пойду. И скажу честно: уступать не буду. Раньше, может, и уступил бы — по старой дружбе. Да где она теперь, эта дружба?','I hear you’re after the quarry auction. I’m going too. And honestly: I won’t back down. Before, maybe I would have — for old times’ sake. But where’s that friendship now?'),
    o:{a:()=>[T('Боря, хватит дуться. Давай мириться','Borya, stop sulking. Let’s make up'),'❤ +8'],b:()=>[T('Посмотрим, кто кого','We’ll see who wins'),T('торги — на общих правилах','the auction is on equal terms')]},
    r:{a:()=>T('Ладно… С тебя шашлык. А на торгах всё равно не поддамся 😄','Fine… You owe me a barbecue. I still won’t go easy at the auction 😄'),b:()=>T('Посмотрим.','We’ll see.')}},
  barsno:{m:'worry',t:()=>T(`Топтыгин зовёт главным инженером на «Медвежий» разрез. Платит втрое. Раньше я бы сначала спросил тебя — мы же вместе всё начинали. А теперь… ты и не звонишь. Думаю, соглашусь.`,'Toptygin wants me as chief engineer at the Bear open pit. Triple the pay. Before, I’d have asked you first — we started all this together. But now… you don’t even call. I think I’ll say yes.'),
    o:{a:()=>[T('Петя, не уходи. Я был'+G('','а')+' неправ'+G('','а')+' — давай всё обсудим','Petya, don’t go. I was wrong — let’s talk it through'),'❤ +8'],b:()=>[T('Удачи на новом месте','Good luck in the new job'),T('Пётр будет работать на «Медведь Капитал»','Pyotr will work for Bear Capital')]},
    r:{a:()=>T('…Ладно. Остаюсь. Но звони хоть иногда, а?','…Okay. I’m staying. But call now and then, eh?'),b:()=>T('Спасибо. Не поминай лихом.','Thanks. No hard feelings.')}},
  vitno:{m:'calm',t:()=>T('Слушай, машины на этой неделе заняты — у меня теперь постоянные клиенты, им в первую очередь. Ищи другого перевозчика. Дороже выйдет, сам'+G('','а')+' понимаешь.','Listen, the trucks are busy this week — I’ve got regular clients now, they come first. Find another carrier. It’ll cost more, you know how it is.'),
    o:{a:()=>[T('Вить, прости, что пропадал'+G('','а')+'. Мириться — пицца с меня','Vitya, sorry I went quiet. Let’s make up — pizza’s on me'),'❤ +8'],b:()=>[T('Ладно, найду других','Fine, I’ll find others'),T('скидки Вити — снова с уровня «друзья»','Vitya’s discounts come back at “friends”')]},
    r:{a:()=>T('Пицца — это аргумент! Ладно, для тебя машину найду.','Pizza is a strong argument! Fine, I’ll find a truck for you.'),b:()=>T('Без обид. Бизнес.','No offence. Business.')}},
  partyno:{m:'worry',t:()=>T('Мы в субботу собирались у Петра — шашлыки, гитара, как в 11 «Б». Тебя не позвали. Решили, тебе теперь не до нас… Мне было грустно, правда.','We got together at Pyotr’s on Saturday — barbecue, guitar, like back in class 11B. You weren’t invited. We figured you don’t have time for us now… I was sad, honestly.'),
    o:{a:()=>[T('Обидно. Позовите в следующий раз — приду','That hurts. Invite me next time — I’ll come'),T('❤ обиженных друзей +5','❤ of upset friends +5')],b:()=>[T('Работы много, правда','I really am swamped'),'']},
    r:{a:()=>T('Позовём! Я скажу ребятам. Они обрадуются.','We will! I’ll tell the others. They’ll be glad.'),b:()=>T('Понимаю. Береги себя.','I understand. Take care of yourself.')}},
  vit5:{m:'calm',t:()=>T('Слушай… я тебе столько возил со скидкой и ни разу толком спасибо не сказал. Так вот: спасибо. Если бы не ты, «ВитТранс» был бы «МедведьТранс». Водители до сих пор зовут тебя «наш председатель».','Listen… I’ve hauled for you at a discount all this time and never properly said thanks. So: thank you. If not for you, VitTrans would be BearTrans. My drivers still call you “our president”.'),
    o:{a:()=>[T('Вот для этого и друзья','That’s what friends are for'),'❤ +5']},r:{a:()=>T('Обнимаю! Марина передаёт привет.','Big hug! Marina says hi.')}},
  tpt4:{m:'strict',big:1,t:()=>T('Топтыгин, без предисловий. Вижу, вы идёте на биржу. Стану якорным инвестором — размещение пройдёт дороже. Взамен — место в совете директоров. Решайте.','Toptygin, no preamble. I see you’re going public. I’ll be your anchor investor — the listing will go better. In return — a seat on the board. Your call.'),
    o:{a:()=>[T('Взять его деньги','Take his money'),T('на IPO +10 💎 премии за размещение; Топтыгин — в совете директоров','+10 💎 listing bonus at the IPO; Toptygin sits on the board')],b:()=>[T('Отказаться — друзья докупят акции','Refuse — friends will buy the shares'),T('❤ всех друзей +5','❤ all friends +5')]},
    r:{a:()=>T('Разумно. Люблю людей, которые умеют считать.','Sensible. I like people who can count.'),b:()=>T('Смело. Ваши друзья — ваш капитал. Уважаю.','Bold. Your friends are your capital. Respect.')}},
  mem:{m:'happy',big:1,t:a=>{const x=MEM[(a.v||0)%MEM.length];return T(x[0],x[1]);},o:{a:()=>[T('Расскажите ещё','Tell me more'),'']},r:{a:a=>{const x=MEM[(a.v||0)%MEM.length];return T(x[2],x[3]);}}},
  beav5:{m:'happy',t:a=>T(`Ну что, ${hv()}, моя очередь! «Бобров и Ко» идёт на биржу. Станешь якорным инвестором? Хочу, чтобы ты ${G('был','была')} первым в списке.`,`Well, ${hv()}, my turn! Beaver & Co is going public. Will you be an anchor investor? I want you first on the list.`),
    o:{a:a=>[T(`Стану: ${money(a.a)} за 10 %`,`Yes: ${money(a.a)} for 10%`),T('доля 10 % в компании Бориса: прибыль и дивиденды — как в совместном деле','a 10% stake in Boris’s company: profit and dividends work like a joint venture')],b:()=>[T('Поддержу словом — и приду на звонок','I’ll cheer you on — and come to the bell'),'❤ +3']},
    r:{a:()=>T('Я знал! Кубок пока у тебя, но я не сдаюсь 😄','I knew it! You’ve got the cup for now, but I’m not giving up 😄'),b:()=>T('Приходи обязательно. Без тебя колокол не зазвонит.','Be sure to come. The bell won’t ring without you.')}},
  bars4:{m:'calm',t:()=>T('Старший окончил горный. Хочет к тебе стажёром — сам попросил, я ни при чём. Возьмёшь? Только спуску не давай.','My eldest graduated from the mining institute. He wants to intern with you — his own idea, not mine. Will you take him? Don’t go easy on him.'),
    o:{a:()=>[T('Возьму','I’ll take him'),'❤ +10'],b:()=>[T('Пусть сначала поработает у тебя','Let him work with you first'),'']},
    r:{a:()=>T('Спасибо. Он весь вечер гладил рубашку.','Thank you. He spent all evening ironing his shirt.'),b:()=>T('Разумно. Пусть понюхает карьер.','Fair. Let him get a feel for the pit first.')}},
  owl3:{m:'happy',t:a=>T(`Предлагаю фонд на двоих: мои расчёты, твои деньги — ${money(a.a)}. Будем вкладывать в молодые компании Сибири. Мама уже одобрила.`,`I propose a fund for two: my analysis, your money — ${money(a.a)}. We’ll invest in young Siberian companies. Mum has already approved.`),
    o:{a:a=>[T('Открываем фонд','Let’s open the fund'),T(`вклад ${money(a.a)}, ваша доля 50 %`,`invest ${money(a.a)}, your share 50%`)],b:()=>[T('Пока нет','Not yet'),'']},
    r:{a:()=>T('Ура! Первое правило фонда: подушка — не роскошь. Это мамино.','Hooray! Rule one of the fund: a safety cushion isn’t a luxury. That’s Mum’s.'),b:()=>T('Поняла. Предложение не сгорит.','Got it. The offer won’t expire.')}},
  tpt5:{m:'strict',big:1,t:()=>T('Топтыгин: «Предлагаю объединить наши холдинги. Вы — лицо, я — деньги. Вместе нас в Сибири никто не догонит».','Toptygin: “I propose we merge our holdings. You’re the face, I’m the money. Together no one in Siberia will catch us.”'),
    o:{a:()=>[T('У нас своя дорога','We have our own road'),''],b:()=>[T('Давайте лучше дружить домами','Let’s just be good neighbours'),'']},
    r:{a:()=>T('Так и думал. Знаете… вы первый человек, который отказал мне трижды. Руку?','I thought so. You know… you’re the first person to turn me down three times. Shake on it?'),
       b:()=>T('Дружить домами… Смешно. Но — давайте. Приглашаю на рыбалку, Борис говорит, вы умеете ждать.','Good neighbours… Funny. But — let’s. Come fishing with me; Boris says you know how to wait.')}},
  lud2:{m:'calm',big:1,t:()=>T('Людмила Санна кладёт на стол папку «Передать»: — Я считала ваши деньги с пяти тысяч до миллиардов. Пора считать внуков. Вместо себя оставляю Аню — лучшую ученицу моей «Школы». Строгая, как я в молодости. А я буду на связи — звоните по пятницам.','Lyudmila Sanna puts a folder marked “Handover” on the desk. “I’ve counted your money from five thousand to billions. Time to count grandchildren. I’m leaving Anya in my place — the best student of my School. Strict, like me when I was young. And I’ll be in touch — call me on Fridays.”'),
    o:{a:()=>[T('Проводить как положено','A proper farewell'),''],b:()=>[T('Людмила Санна, ещё годик?','Just one more year?'),T('отложит на 5 игровых лет','she’ll stay 5 more game years')]},
    r:{a:()=>T('Только без слёз. Ладно, со слезами. Аня, запишите: председатель плачет — это к прибыли.','No tears, please. All right, with tears. Anya, write it down: when the president cries, profit follows.'),
       b:()=>T(`${G('Хитрый какой','Хитрая какая')}. Ладно, до следующей встречи выпускников — и всё!`,'Sly one. All right, until the next reunion — and that’s it!')}},
  ludcall:{m:'happy',big:1,t:a=>{const x=LCALL[(a.v||0)%LCALL.length];return T(x[0],x[1]);},o:{a:()=>[T('Спасибо, что позвонили!','Thank you for calling!'),'']},
    r:{a:a=>{const x=LCALL[(a.v||0)%LCALL.length];return T(x[2],x[3]);}}},
  ipo:{m:'wow',big:1,t:()=>T('Звонок на бирже! Друзья в зале, Людмила Санна не скрывает слёз. Борис жмёт руку: «Следующий — я. Честно».','The opening bell! Your friends are in the hall, Lyudmila Sanna doesn’t hide her tears. Boris shakes your hand: “I’m next. Fair and square.”'),
    o:{a:()=>[T('Спасибо всем!','Thank you all!'),'']},r:{a:()=>T('Новый холдинг, старые друзья. Поехали!','A new holding, old friends. Let’s go!')}}
};
// Людмила Санна вспоминает 90-е (и нулевые): [рус, eng, «расскажите ещё» рус, eng]
const MEM=[
  ['В 94-м я полгода стояла в ларьке у рынка. Выручку прятала в носок, а калькулятор — в валенок. Вам проще: у вас касса.','In ’94 I spent six months in a kiosk by the market. I hid the takings in a sock and the calculator in a felt boot. You’ve got it easy: you have a till.',
   'А хозяин ларька, Гоша, потом открыл сеть магазинов. Начинал, как вы, — с одного окошка.','And the kiosk owner, Gosha, later opened a chain of shops. He started like you — with one little window.'],
  ['В 98-м я взяла кредит в долларах за три недели до дефолта. С тех пор у меня правило: занимай в той валюте, в которой зарабатываешь.','In ’98 I took a dollar loan three weeks before the default. Since then my rule is: borrow in the currency you earn.',
   'Отдавала два года. Зато теперь меня ни один банк не проведёт.','It took me two years to pay off. But now no bank can fool me.'],
  ['Нам однажды зарплату выдали кастрюлями. Я полгода меняла их на сахар. Так что овердрафт — это ещё цветочки.','Once they paid our wages in saucepans. I spent six months swapping them for sugar. So an overdraft is nothing.',
   'Одна кастрюля до сих пор у меня. В ней лучшие пирожки получаются.','I still have one of those saucepans. It makes the best pies.'],
  ['Соне на выпускное платье я копила два года — по сто рублей в месяц. Вот что такое реинвестирование: понемногу, но каждый месяц.','I saved for Sonya’s prom dress for two years — a hundred roubles a month. That’s reinvestment for you: a little, but every month.',
   'Платье было голубое. Соня и на встречу выпускников в нём пришла — заметили?','The dress was light blue. Sonya wore it to the reunion too — did you notice?'],
  ['В нулевых я вела бухгалтерию угольного разреза. Главный инженер говорил: «Уголь не любит спешки». Недра — тем более.','In the 2000s I kept the books for a coal pit. The chief engineer used to say, “Coal doesn’t like haste.” Mining even less so.',
   'Он, кстати, учил и Петю. Мир тесен — особенно в Кузбассе.','He taught Pyotr too, by the way. It’s a small world — especially in Kuzbass.'],
  ['В 2008-м наш завод чуть не закрылся. Спасла подушка, которую я уговорила директора отложить. С тех пор меня зовут «Санна-сейф» 😄','In 2008 our plant nearly closed. We were saved by a cushion I’d talked the director into setting aside. Ever since they call me “Sanna the Safe” 😄',
   'Подушка — не жадность. Подушка — это спокойный сон всей бригады.','A cushion isn’t greed. A cushion is a good night’s sleep for the whole crew.'],
  ['В начале 90-х на заводе нам вместо премии раздали ваучеры. Я свой обменяла на акции — муж смеялся. Потом перестал.','In the early ’90s the plant gave us privatisation vouchers instead of a bonus. I swapped mine for shares — my husband laughed. Then he stopped.',
   'Урок простой: не продавай хорошее из-за паники.','The lesson is simple: don’t sell something good out of panic.'],
  ['В 2014-м рубль упал вдвое, а я спала спокойно: долгов в валюте — ноль. Помните мой урок про 98-й?','In 2014 the rouble halved, and I slept soundly: zero foreign-currency debt. Remember my lesson about ’98?',
   'Правила пишутся не для хороших времён, а для плохих.','Rules aren’t written for the good times but for the bad ones.']];
// Людмила на пенсии звонит раз в игровой год
const LCALL=[
  ['Звоню, как обещала! Аня мне всё докладывает — хвалит вас. А внук пошёл в первый класс.','Calling as promised! Anya reports everything — she praises you. And my grandson started school.','Растут, как ваша прибыль! Держите подушку — и звоните.','Growing like your profits! Keep your cushion — and call me.'],
  ['Смотрела ваш отчёт в газете. Выручка — хорошо, долг — терпимо. Я бы только склад проверила.','I read your report in the paper. Revenue good, debt tolerable. I’d just check the warehouse.','Проверьте, проверьте. Старая бухгалтерская привычка.','Do check it. An old accountant’s habit.'],
  ['Была на даче у Сони, пекли пирожки на всю вашу бригаду. Витя обещал завезти.','Spent the weekend at Sonya’s dacha, baked pies for your whole crew. Vitya promised to deliver them.','Бесплатно — для своих, как он говорит 😊','Free for friends, as he says 😊']];
// просьбы: у каждого друга свои поводы (v — вариант 0…2)
const RQT={
  // займы больше 1 млн — повод по масштабу (не «машина встала» на 50 млн)
  bigloan:{owl:[['Открываю своё дело, а банк тянет с решением. Займёшь','I’m starting my own firm and the bank is dragging its feet. Can you lend me']],
    beav:[['Подвернулся выкуп помещения под новую базу. Займёшь','A chance to buy premises for a new yard came up. Can you lend me'],['Крупный заказчик платит с отсрочкой, а поставщикам нужно сейчас. Займи','A big client pays late and my suppliers want paying now. Lend me']],
    bars:[['Нужна предоплата за новый буровой станок, банк тянет с решением. Займёшь','I need a down payment on a new drilling rig, the bank is dragging its feet. Can you lend me'],['Задержали оплату по госконтракту, а людям платить надо. Займёшь','Payment on a state contract is delayed and I have to pay my crew. Can you lend me']],
    vit:[['Подвернулись 20 вагонов в лизинг, нужен первый взнос. Займи','Twenty rail cars came up for lease, I need the first payment. Lend me'],['Беру самосвалы в лизинг — нужен аванс. Займёшь','I’m leasing dump trucks — I need the advance. Can you lend me']]},
  // больше 20 млн — дела крупной компании
  hugeloan:{owl:[['Фонд заходит в сделку, а деньги партнёра задерживаются на квартал. Выручишь','The fund is closing a deal and a partner’s money is delayed a quarter. Can you cover']],
    beav:[['Выкупаю долю в речном порту — нужен задаток. Займёшь','I’m buying into a river port — I need the deposit. Can you lend me'],['Лицензия на новый участок: экспертиза и залог разом. Займи','A licence for a new plot: survey and deposit all at once. Lend me']],
    bars:[['Экспертиза запасов для новой лицензии, а банк ждёт отчёт геологов. Займёшь','A reserves survey for a new licence, and the bank is waiting for the geologists. Can you lend me'],['Меняем дробильную линию целиком — поставщик просит аванс. Займёшь','We’re replacing the whole crushing line — the supplier wants an advance. Can you lend me']],
    vit:[['Беру в лизинг локомотив — первый взнос большой. Займи','I’m leasing a locomotive — the first payment is big. Lend me'],['Строим свой терминал у станции. Займёшь','We’re building our own terminal by the station. Can you lend me']]},
  loan:{owl:[['Неловко просить, но займёшь','It’s awkward to ask, but can you lend me']],
    beav:[['Поставщик требует предоплату. Займи','My supplier wants cash up front. Lend me'],['Ларёк надо подлатать к сезону. Займёшь','The kiosk needs fixing before the season. Can you lend me'],['Аренду подняли, а выручка в конце месяца. Займи','The rent went up and the takings come at month end. Lend me']],
    bars:[['Машина встала, а до работы 40 км. Займёшь','The car broke down and work is 40 km away. Can you lend me'],['Ремонт в детской затянулся. Займёшь','The nursery repairs dragged on. Can you lend me'],['Хочу пройти курсы по буровзрывным. Займёшь','I want to take a blasting course. Can you lend me']],
    vit:[['Подвернулась вторая Газель — дёшево! Займи','A second van came up — cheap! Lend me'],['Двигатель у машины сдох. Займёшь','My van’s engine died. Can you lend me'],['Страховку на парк надо оплатить сразу. Займи','I have to pay the fleet insurance up front. Lend me']]},
  gift:[['У меня день рождения в субботу! Заглянешь?','It’s my birthday on Saturday! Will you drop by?'],['У нас годовщина свадьбы — собираем друзей. Придёшь?','It’s our wedding anniversary — we’re gathering friends. Coming?'],['Новоселье! Ждём в гости.','Housewarming! Come and visit.']],
  watch:[['Уезжаю в отпуск на неделю — присмотришь за моей точкой?','I’m off on holiday for a week — can you keep an eye on my business?'],['Еду к родителям на пару дней. Глянешь, как там мои ребята?','Visiting my parents for a couple of days. Will you check on my team?'],['Лечу на выставку. Если что, подскажешь моим по телефону?','Flying to a trade fair. If anything comes up, will you advise my staff by phone?']],
  // «сходи со мной» — без денег
  visit:{beav:[['Суббота, футбол: наши против ветеранов «Шахтёра». Нужен вратарь. Ты же стоял на воротах в девятом классе!','Saturday, football: us against the Shakhtar veterans. We need a keeper. You were in goal in ninth grade!',['Встаю на ворота!','I’ll take the goal!'],['Колени уже не те','My knees aren’t what they were']],
      ['Открываю новую точку — перережешь ленточку? Для удачи нужен кто-то, кого я уважаю.','I’m opening a new place — will you cut the ribbon? For luck I need someone I respect.',['Приеду с ножницами','I’ll bring scissors'],['Поздравлю по телефону','I’ll call to congratulate']],
      ['Лыжный марафон в воскресенье, 30 км. Пройдём вместе, как в школе?','Ski marathon on Sunday, 30 km. Shall we do it together, like at school?',['Пройдём!','We’ll do it!'],['Буду болеть у финиша','I’ll cheer at the finish']]],
    bars:[['Сын пошёл в первый класс. Первое сентября — в эту субботу. Придёшь? Хочу, чтобы он видел, какие у папы друзья.','My son starts school — the first of September is this Saturday. Will you come? I want him to see what friends his dad has.',['Приду с букетом','I’ll come with flowers'],['Поздравлю по телефону','I’ll call to congratulate']],
      ['Везу сыновей в горный музей. Пойдёшь с нами? Там экскаватор настоящий.','Taking my sons to the mining museum. Will you come? There’s a real excavator.',['Пойду!','I’ll come!'],['В другой раз','Another time']],
      ['Сходишь со мной к нотариусу? Оформляю дом на Олю, нужен свидетель.','Will you come with me to the notary? I’m putting the house in Olya’s name, I need a witness.',['Конечно, схожу','Of course'],['На этой неделе не выйдет','Not this week']]],
    vit:[['Марина печёт пироги и зовёт в гости. Отказов не принимает — так и сказала.','Marina’s baking pies and invites you over. She says she won’t take no for an answer.',['Еду!','On my way!'],['Передай спасибо','Tell her thanks']],
      ['Водители устраивают турнир по шашкам. Нужен судья — честный. Ты подходишь.','My drivers are holding a draughts tournament. We need a referee — an honest one. You fit.',['Буду судьёй','I’ll referee'],['Пусть судит Пётр','Let Pyotr do it']],
      ['Первый рейс по новому маршруту! Прокатишься со мной в кабине?','The first run on a new route! Want to ride with me in the cab?',['Прокачусь!','Count me in!'],['Помашу вслед','I’ll wave you off']]],
    owl:[['Мама отмечает юбилей — будем только свои. Придёшь?','Mum is celebrating her birthday — just family and friends. Will you come?',['Приду обязательно','Wouldn’t miss it'],['Передам подарок через тебя','I’ll send a gift with you']],
      ['Читаю лекцию студентам про кредиты. Расскажешь им пять минут про свой путь?','I’m lecturing students on loans. Will you tell them about your path for five minutes?',['Расскажу','I will'],['Я не оратор','I’m no speaker']],
      ['В субботу забег в парке, 10 км. Составишь компанию?','There’s a 10 km run in the park on Saturday. Keep me company?',['Побежим!','Let’s run!'],['Приду поболеть','I’ll come and cheer']]]},
  advice:{owl:[['Как думаешь: брать ипотеку сейчас или ждать, пока снизят ставку?','What do you think: take a mortgage now or wait for rates to fall?',['Подожди снижения','Wait for the cut'],['Бери, если платёж по силам','Take it if you can afford the payment']],
      ['Клиент просит кредит под новый магазин. Цифры красивые, но опыта ноль. Дать?','A client wants a loan for a new shop. Nice numbers, zero experience. Lend?',['Дай, но поменьше','Lend, but less'],['Пусть сначала покажет опыт','Let him show some experience first']],
      ['Маме предлагают вклад «под 30 %». Я против. А ты?','Mum’s been offered a deposit “at 30%”. I’m against it. You?',['Это ловушка','It’s a trap'],['Пусть вложит немного','Let her put in a little']]],
    bars:[['Зовут на вахту в Якутию — вдвое больше денег. Ехать?','I’m offered a rotation job in Yakutia — double the pay. Should I go?',['Езжай, это опыт','Go, it’s experience'],['Оставайся с семьёй','Stay with your family']],
      ['Старший просит компьютер. Покупать или пусть сам заработает?','My eldest wants a computer. Buy it or let him earn it?',['Купи, пусть учится','Buy it, let him learn'],['Пусть заработает','Let him earn it']],
      ['Предлагают должность главного инженера, но в другой город. Что скажешь?','I’ve been offered chief engineer, but in another city. What do you say?',['Соглашайся','Take it'],['Здесь твои люди','Your people are here']]]}};
const rqAdv=q=>{const L2=RQT.advice[q.w]||RQT.advice.owl;return L2[((q.a&&q.a.v)||0)%L2.length];};
// M18: надёжность возврата займа (подсказка у кнопки) и тексты предложений / пари
function relW(w){const L=SY.lv?SY.lv(W(),w):2;if(w==='owl'||w==='bars')return T('возвращает в срок','pays back on time');return L>=3?T('обычно в срок','usually on time'):T('бывает, задерживает на 2 мес.','sometimes 2 months late');}
const OFR={ship:[['Мои ребята на неделе везут товар с оптовой базы — давай и тебе закуплю по их цене? Два месяца закупка на {p} дешевле.','My guys are hauling goods from the wholesale depot this week — shall I buy yours at their price? Two months of supplies {p} cheaper.'],['Давай!','Let’s do it!'],'закупка −{p} на 2 мес.; ❤ +3','supplies −{p} for 2 months; ❤ +3'],
  gig:[['Есть клиент — платит в полтора раза больше обычного. Отдаю тебе, мне некогда.','I’ve got a client who pays one and a half times the usual. It’s yours, I’m too busy.'],['Беру заказ','I’ll take it'],'оплата ×1,5 — заказ уже на доске; ❤ +3','pay ×1.5 — the job is on your board; ❤ +3'],
  gigb:[['Сосед просит помочь с переездом, платит щедро — в полтора раза выше обычного. Пойдёшь вместо меня?','A neighbour needs help moving and pays well — one and a half times the usual. Will you go instead of me?'],['Пойду','I’ll go'],'оплата ×1,5 — заказ уже на доске; ❤ +3','pay ×1.5 — the job is on your board; ❤ +3'],
  prof:[['Давай в выходные пройдусь по твоим точкам — профилактика. Три месяца ремонт за мой счёт.','Let me go round your places this weekend — preventive checks. Three months of repairs on me.'],['Спасибо, Петя!','Thanks, Petya!'],'3 мес. ремонт поломок бесплатно; ❤ +3','3 months of free repairs; ❤ +3'],
  rate:[['У нас в банке программа для своих. Поручусь — кредит на {r} п. п. дешевле. Действует 3 месяца.','My bank has a scheme for friends. I’ll vouch for you — a loan {r} p.p. cheaper. Valid for 3 months.'],['Спасибо, Соня!','Thanks, Sonya!'],'кредит в банке на {r} п. п. дешевле, лимит +15 %; ❤ +3','bank loan {r} p.p. cheaper, limit +15%; ❤ +3'],
  buy:[['Беру товар оптом — давай вскладчину? Выйдет на {b} дешевле, пару месяцев.','I’m buying stock wholesale — shall we split it? {b} cheaper for a couple of months.'],['Давай вскладчину','Let’s split it'],'закупка −{b}; ❤ +3','supplies −{b}; ❤ +3'],
  // M20: «Газель на двоих» (Витя) и доля в фонде Сони — ещё в первом холдинге
  jvvit:[['Присмотрел вторую Газель — почти новая. Одному тянуть тяжело. Давай на двоих? Вклад {a}, доля пополам. Вожу я, твои руки свободны, прибыль — пополам.','I’ve spotted a second van — almost new. Too much for me alone. Shall we go halves? You put in {a}, half the share. I drive, your hands stay free, profit split down the middle.'],['Берём Газель!','Let’s get the van!'],'вклад {a}, ~2 % в месяц к вкладу, без рук; ❤ +3','invest {a}, ~2% a month on it, no hands needed; ❤ +3'],
  jvowl:[['Фонд «Сова Инвест» набирает первых пайщиков. Своим — без комиссии. Вложишь {a}? Доход скромный, зато ровный — я считаю каждый рубль.','The Owl Invest fund is taking its first investors. No fee for friends. Will you put in {a}? Modest returns, but steady — I count every rouble.'],['Вхожу в фонд','I’m in'],'вклад {a}, ~1,3 % в месяц, ровно, без рук; ❤ +3','invest {a}, ~1.3% a month, steady, no hands needed; ❤ +3'],
  jv:[['Есть место под точку, одному тянуть не хочу. Откроем на двоих? Вклад {a}, доля пополам. Я присмотрю — твои руки свободны.','I’ve found a spot for a new place but don’t want to go it alone. Shall we open it together? You put in {a}, half the share. I’ll run it — your hands stay free.'],['Открываем!','Let’s open it!'],'вклад {a}, ~3 % в месяц к вкладу, без рук; ❤ +3','invest {a}, ~3% a month on it, no hands needed; ❤ +3']};
const pctS=x=>(Math.round(x*1000)/10).toLocaleString(en()?'en':'ru')+(en()?'%':' %');
function offerAsk(q){const a=q.a||{},p=a.p==='gig'&&q.w==='bars'?'gigb':a.p==='jv'&&(q.w==='vit'||q.w==='owl')?'jv'+q.w:a.p,x=OFR[p]||OFR.ship,P=SY.PK||{},L=SY.lv?SY.lv(W(),q.w):3;
  const f=t=>t.replace('{p}',pctS(P.ship||.04)).replace('{b}',pctS(P.buyD||.03)).replace('{r}',String(Math.round(-((P.guarDr||[])[Math.max(3,L)]||-.02)*100))).replace('{a}',money(a.a||0));
  return {m:'happy',tx:f(T(x[0][0],x[0][1])),o:{a:[T(x[1][0],x[1][1]),f(T(x[2],x[3]))],b:[T('Спасибо, не сейчас','Thanks, not now'),'']}};}
// M20: ставка на выбор — деньги или 💎 (STORY.PARI_CR)
function pariAsk(q){const a=q.a||{},c=SY.PARI_CR||5;return {m:'happy',tx:T(`Спорим на ${money(a.a)} или на ${c} 💎? Говорю: в следующем месяце твоя выручка не дотянет до ${money(a.tg)} (это +10 % к прошлому). Проиграю — плачу честно.`,`Bet you ${money(a.a)} or ${c} 💎? I say next month your revenue won’t reach ${money(a.tg)} (that’s +10% on last month). If I lose, I pay up.`),
  o:{a:[T(`Спорим на ${money(a.a)}`,`Bet ${money(a.a)}`),T(`выручка ≥ ${money(a.tg)} — Борис платит ${money(a.a)}, иначе платите вы; ❤ +2`,`revenue ≥ ${money(a.tg)} — Boris pays ${money(a.a)}, otherwise you pay; ❤ +2`)],
    c:[T(`Спорим на ${c} 💎`,`Bet ${c} 💎`),T(`${c} 💎 — сразу; выручка ≥ ${money(a.tg)} — вернутся ${2*c} 💎, иначе пропадут; ❤ +2`,`${c} 💎 now; revenue ≥ ${money(a.tg)} — you get ${2*c} 💎 back, otherwise they’re gone; ❤ +2`)],b:[T('Не буду спорить','I won’t bet'),'❤ −1']}};}
function ask(w,q){const a=q.a||{};
  if(q.k==='rq'){const v=(a.v||0)%3;
    if(q.r==='visit'){const L2=RQT.visit[q.w]||RQT.visit.beav,x=L2[v%L2.length];return {m:'happy',tx:T(x[0],x[1]),o:{a:[T(x[2][0],x[2][1]),'❤ +5'],b:[T(x[3][0],x[3][1]),'']}};}
    if(q.r==='loan'){const L2=a.a>2e7?RQT.hugeloan[q.w]||RQT.hugeloan.beav:a.a>1e6?RQT.bigloan[q.w]||RQT.bigloan.beav:RQT.loan[q.w]||RQT.loan.beav,x=L2[v%L2.length];
      return {m:'worry',tx:T(`${x[0]} ${money(a.a)} на ${mon(a.n)}? Верну обязательно.`,`${x[1]} ${money(a.a)} for ${mon(a.n)}? I’ll pay you back for sure.`),
        o:{a:[T(`Займу ${money(a.a)}`,`Lend ${money(a.a)}`),T(`вернёт через ${mon(a.n)} (${relW(q.w)}); ❤ +10`,`repaid in ${mon(a.n)} (${relW(q.w)}); ❤ +10`)],b:[T('Сейчас не могу','Can’t right now'),'❤ −5']}};}
    if(q.r==='gift'){const x=RQT.gift[v];return {m:'happy',tx:T(x[0],x[1]),o:{a:[T(`Прийти с подарком (${money(a.a)})`,`Come with a gift (${money(a.a)})`),T('❤ +5','❤ +5')],b:[T('Поздравлю по телефону','I’ll call to congratulate'),'❤ −5']}};}
    if(q.r==='watch'){const x=RQT.watch[v];return {m:'calm',tx:T(x[0],x[1]),o:{a:[T('Присмотрю','I’ll keep an eye on it'),T('❤ +5','❤ +5')],b:[T('Не получится','I can’t'),'❤ −5']}};}
    if(q.r==='offer')return offerAsk(q);if(q.r==='pari')return pariAsk(q);
    const x=rqAdv(q);return {m:'calm',tx:T(x[0],x[1]),o:{a:[T(x[2][0],x[2][1]),''],b:[T(x[3][0],x[3][1]),'']}};}
  if(q.k==='reu'||q.k==='pro'){const y=a.y||10;return {m:'happy',tx:T(`Встреча выпускников «${y} лет»! Кафе «Юность», в субботу. Все будут — приходи.`,`Class reunion “${y} years”! Youth Café, Saturday. Everyone’s coming — join us.`),
    o:{a:[T('Приду!','I’ll be there!'),'']}};}
  const s=SC[q.k];if(!s)return {m:'calm',tx:T('Есть разговор — нужно твоё решение.','We need to talk — I need your decision.'),o:{}};
  const o={};for(const k in s.o)o[k]=s.o[k](a,w);return {m:s.m,tx:s.t(a,w),o};}
function reply(q,o){if(q.k==='rq'){if(o!=='a'&&q.r==='visit')return T('Понимаю! Расскажу потом, как всё прошло.','No problem! I’ll tell you how it went.');
    if(q.r==='offer')return o==='a'?T('Договорились! Так и сделаю.','Deal! I’ll sort it.'):T('Ладно, если что — предложение в силе.','Okay, the offer stands if you change your mind.');
    if(q.r==='pari')return o!=='b'?T('Спорим! Разбивай. Посмотрим в конце месяца 😄','It’s a bet! Shake on it. We’ll see at month end 😄'):T('Эх, трусишь 😄 Ладно, в другой раз.','Chicken 😄 Okay, next time.');
    if(o!=='a')return q.r==='advice'?T('Спасибо, подумаю. С тобой всегда проще.','Thanks, I’ll think it over. It’s always easier with you.'):T(FEM[q.w]?'Ничего, понимаю. Как-нибудь сама.':'Ничего, понимаю. Как-нибудь сам.','No worries, I understand. I’ll manage.');
    return {loan:T('Спасибо! Верну в срок, слово даю.','Thank you! I’ll pay back on time, you have my word.'),gift:T('Вот это подарок! Как хорошо, что ты с нами.','What a gift! So good to have you here.'),
      watch:T('Спасибо! Теперь могу спокойно отдохнуть.','Thanks! Now I can relax properly.'),advice:T('Спасибо, так и сделаю.','Thanks, I’ll do just that.'),
      visit:T('Ура! Жду. Без тебя было бы не то.','Hooray! See you there. It wouldn’t be the same without you.')}[q.r];}
  const s=SC[q.k];return s&&s.r&&s.r[o]?s.r[o](q.a||{}):T('Договорились!','Deal!');}

/* ---------------- лента ---------------- */
const FEED={gazel:['Купил Газель! Теперь не только таксую, но и вожу грузы. Если что — звони.','Bought a van! Now I don’t just drive a taxi, I haul freight too. Call me if you need anything.'],
  best:['Меня назвали лучшим кредитным инспектором квартала! Мама испекла торт 🎂','I was named best loan officer of the quarter! Mum baked a cake 🎂'],
  shift:['Смена 12 часов, но дали премию. Карьер растёт — и я с ним.','Twelve-hour shift, but I got a bonus. The quarry grows — and so do I.'],
  kiosk2:['Открыл вторую точку. А у тебя сколько? 😏','Opened my second shop. How many have you got? 😏'],
  son1:['У нас родился сын! Кричит как экскаватор на запуске.','We had a son! Roars like an excavator starting up.'],
  head:['Повысили до начальника отдела. Теперь я решаю, кому давать кредит 😉','Promoted to head of department. Now I decide who gets a loan 😉'],
  cars5:['У меня уже пять машин! «ВитТранс» — звучит?','I’ve got five trucks now! VitTrans — sounds good?'],
  project:['Защитил проект разреза. Главный сказал: «Первый раз вижу, чтобы всё сошлось с первого раза».','Defended my open-pit design. The chief said: “First time I’ve seen it all add up on the first try.”'],
  plant:['Топтыгин купил завод в Новокузнецке. Говорят, в Москве у него ещё три.','Toptygin bought a plant in Novokuznetsk. They say he has three more in Moscow.'],
  back:['Я снова в деле: стройбаза «Бобров и Ко». Падать не стыдно — стыдно не вставать.','I’m back in business: Beaver & Co builders’ yard. Falling isn’t shameful — staying down is.'],
  leave:['Ухожу из банка. Мама сказала — пора. Пока аналитиком, а там посмотрим.','I’m leaving the bank. Mum said it’s time. An analyst for now, and then we’ll see.'],
  son2:['Второй сын! «Барсуков и сыновья» — звучит, а?','A second son! Barsukov & Sons — has a ring to it, eh?'],
  vitlook:['Топтыгин присматривается к «ВитТрансу». Витя пока шутит, но как-то нервно.','Toptygin is eyeing VitTrans. Vitya is still joking, but a bit nervously.'],
  wagons:['Купили первые вагоны! Теперь возим и по железной дороге.','We bought our first rail cars! Now we haul by rail too.'],
  fund:['Открываю фонд «Сова Инвест». Считаю в уме по-прежнему быстрее калькулятора.','I’m opening the Owl Invest fund. Still faster than a calculator in my head.'],
  self:['Ладно, это уже решилось само. Не переживай — всё в силе!','Never mind, it sorted itself out. Don’t worry — we’re good!'],
  thanks:['Получил, спасибо! С тобой приятно иметь дело.','Got it, thanks! A pleasure doing business with you.'],
  bobr:['Поднял цену на щебень у своей базы. Не обижайся — рынок есть рынок.','Raised the price of crushed stone at my yard. No offence — business is business.'],
  kiosk3:['Поставил ещё один ларёк напротив твоего. Держись! 😄','Put another kiosk across from yours. Hold on tight! 😄'],
  kiosk3b:['Мои ребята снова встали напротив твоей точки. Привычка! 😄','My lads set up opposite your shop again. Old habits! 😄'],
  intern2:['Сын говорит, у тебя порядок как на хорошем разрезе. Для него это высшая похвала.','My son says you run things like a good open pit. That’s his highest praise.']};
// «справился сам»: о чём была просьба — чтобы было понятно, о чём речь
const SELF_R={visit:['сходить вместе','coming along'],loan:['занять денег','a loan'],gift:['прийти на праздник','coming to the party'],watch:['присмотреть за точкой','keeping an eye on my business'],advice:['дать совет','some advice']};
const LIFE={owl:[['Была у мамы на даче. Людмила Санна передаёт привет и пирожки.','Visited Mum at the dacha. Lyudmila Sanna sends her regards and pies.'],['Прочитала книгу про кризисы. Вывод: подушка безопасности — не роскошь.','Read a book on crises. Takeaway: a safety cushion isn’t a luxury.'],['Пробежала полумарафон. Не первая, но и не последняя.','Ran a half-marathon. Not first, not last.'],['Ходили с мамой в театр. Весь антракт она хвалила тебя.','Went to the theatre with Mum. She praised you the whole interval.'],['Научила коллегу сводить баланс. Мама бы гордилась.','Taught a colleague to balance the books. Mum would be proud.'],['Отпуск на Алтае: горы, тишина и ни одного отчёта.','Holiday in the Altai: mountains, silence and not a single report.']],
  beav:[['Выиграл городской лыжный забег. Помнишь пятый класс? Я всё ещё первый!','Won the city ski race. Remember fifth grade? I’m still first!'],['Купил новую куртку. Спортивную, конечно.','Bought a new jacket. A sports one, of course.'],['Сыграли в футбол с мужиками — забил два!','Played football with the lads — scored twice!'],['Смотрел, как идут твои дела. Неплохо. Но я лучше 😄','Had a look at how you’re doing. Not bad. But I’m better 😄'],['Ездил на рыбалку — поймал щуку вот такую!','Went fishing — caught a pike this big!'],['Думаю, как тебя обогнать. Не обижайся — это спорт.','Thinking how to overtake you. No offence — it’s sport.']],
  bars:[['Починил старый «Урал». Ездит!','Fixed up an old Ural truck. It runs!'],['Сын нарисовал экскаватор. Похож.','My son drew an excavator. Looks right.'],['Посчитал нагрузку на мостик у дачи. Выдержит.','Did the load calculation for the bridge at the dacha. It’ll hold.'],['Читаю про новые буровые станки. Интересно.','Reading about new drilling rigs. Interesting.'],['Жарили шашлыки всей семьёй. Угля ушло 2,4 кг — я посчитал.','Family barbecue. Used 2.4 kg of charcoal — I counted.'],['Был на встрече горняков. Про тебя говорят хорошее.','Went to a miners’ meet-up. People speak well of you.']],
  vit:[['Подвозил сегодня мэра! Шучу. Но очень похожего.','Gave the mayor a ride today! Kidding. But someone very like him.'],['Знаю дешёвый маршрут через Юргу. Спрашивай, если что.','I know a cheap route via Yurga. Just ask.'],['Водители устроили мне день рождения прямо в гараже.','My drivers threw me a birthday party right in the garage.'],['Стоял в пробке на Кузнецком — зато выучил все песни по радио.','Stuck in traffic on Kuznetsky — at least I learned every song on the radio.'],['Марина передаёт привет! Зовёт в гости.','Marina says hi! She’s inviting you over.'],['Купил зимнюю резину на весь парк. Скидка — как у друга.','Bought winter tyres for the whole fleet. Got a friend’s discount.']]};
// ещё по 6 реплик на друга (всего 12 — STORY.LIFE_N; «Поздравить» — у owl 2,8, beav 0,9, bars 6,10, vit 2,7)
LIFE.owl.push(['Мама научилась пользоваться онлайн-банком. Теперь проверяет меня 😅','Mum learned online banking. Now she checks on me 😅'],['Разбирала старые фото — нашла наш выпускной. Ты там в центре, конечно.','Went through old photos — found our prom. You’re in the middle, of course.'],
  ['Меня позвали читать лекции в университет! Про кредиты, конечно.','I’ve been invited to lecture at the university! On loans, of course.'],['Купила маме новую духовку. Пирожков станет вдвое больше — готовься.','Bought Mum a new oven. Twice as many pies — be ready.'],
  ['Посчитала, сколько кофе выпила за год. Лучше не знать.','Counted how much coffee I drank this year. Better not to know.'],['Сходила на курсы по инвестициям. Мама сказала: «Я это знала ещё в 98-м».','Took an investment course. Mum said: “I knew all that back in ’98.”']);
LIFE.beav.push(['Учу соседского мальчишку кататься на лыжах. Талант! Весь в меня.','Teaching the neighbours’ boy to ski. A talent! Just like me.'],['Проиграл Пете в шахматы. Реванш через неделю — не обсуждается.','Lost to Pyotr at chess. Rematch in a week — no discussion.'],
  ['Посчитал: за десять лет ни разу не опоздал на открытие точки.','Worked it out: in ten years I’ve never been late to open up.'],['Выиграли турнир по мини-футболу! Кубок поставил рядом с местом для нашего, школьного 😉','We won the five-a-side tournament! Put the trophy next to the spot for our school cup 😉'],
  ['Взял отпуск на три дня. Выдержал два.','Took three days off. Lasted two.'],['Зашёл в нашу школу. Физрук узнал меня и сразу выдал лыжи 😄','Dropped by our school. The PE teacher recognised me and handed me skis at once 😄']);
LIFE.bars.push(['Получил знак «Шахтёрская слава». Оля говорит — заслужил.','I got the Miner’s Glory badge. Olya says I earned it.'],['Учил старшего считать объём кучи песка. Сошлось до кубометра.','Taught my eldest to work out the volume of a sand pile. Correct to the cubic metre.'],
  ['Прочитал отчёт твоей компании. Вопросов нет. Почти.','Read your company’s report. No questions. Almost.'],['Ездили всей семьёй на Телецкое озеро. Прикинул глубину на глаз — почти угадал.','Went to Lake Teletskoye with the family. Guessed the depth by eye — nearly right.'],
  ['Сдал на высший разряд взрывника. Оля спит спокойнее — я аккуратный.','Qualified as a top-grade blaster. Olya sleeps better — I’m careful.'],['Молчу. Работаю. Всё по плану.','Quiet. Working. All to plan.']);
LIFE.vit.push(['Выучил английский до уровня «хеллоу, машина готова». Прогресс!','Learned English up to “hello, your car is ready”. Progress!'],['Мой водитель Серёга — лучший водитель области! Горжусь.','My driver Seryoga was named best driver in the region! Proud of him.'],
  ['Нашёл в бардачке кассету 2007 года. Пою в пробках, как в выпускном классе.','Found a 2007 tape in the glovebox. Singing in traffic like in our final year.'],['Сам помыл все машины парка. Руки помнят!','Washed the whole fleet myself. The hands remember!'],
  ['Марина говорит, я слишком много работаю. А я ей: «Зато весело!»','Marina says I work too much. I told her: “But it’s fun!”'],['Подвёз бабушку до рынка — она мне пирожок. Бизнес по-сибирски!','Gave a granny a lift to the market — she gave me a pie. Siberian-style business!']);
const BEAR=[['Топтыгин снова на торгах в Кузбассе.','Toptygin is at the Kuzbass auctions again.'],['«Медведь Капитал» скупает всё, что плохо лежит.','Bear Capital is buying up anything not nailed down.'],['Топтыгин в интервью: «В Сибири пока слишком много хозяев».','Toptygin in an interview: “Siberia still has too many owners.”']];
const GG={beav:['Хорошо шёл. В следующий раз твой.','Good race. Next time it’s yours.'],owl:['Посчитала до рубля — прости, в этот раз мой.','I counted to the rouble — sorry, this one’s mine.'],bars:['Этот участок я знал как свои пять пальцев. Не обижайся.','I knew that plot like the back of my hand. No hard feelings.'],vit:['Повезло мне в этот раз!','I got lucky this time!']};
function feedTx(w,f){const a=f.a||{};
  if(f.k==='life'){const L2=LIFE[f.w]||LIFE.vit,x=L2[(a.v||0)%L2.length];return T(x[0],x[1]);}
  if(f.k==='bearnews'){const x=BEAR[(a.v||0)%BEAR.length];return T(x[0],x[1]);}
  if(f.k==='gg'){const x=GG[f.w]||GG.beav;return T(`Участок (${gName(a.g)}) достался мне. `,`The plot (${gName(a.g)}) went to me. `)+T(x[0],x[1]);}
  if(f.k==='self'&&SELF_R[a.r]){const x=SELF_R[a.r];return T(`Помнишь мою просьбу — ${x[0]}? Уже всё решилось, не переживай!`,`Remember I asked about ${x[1]}? All sorted, don’t worry!`);}
  if(f.k==='kiosk3'&&a.s>=2){const x=FEED.kiosk3b;return T(x[0],x[1]);}
  if(f.k==='back2')return T(`Возвращаю ${money(a.a)}. Спасибо, что ${G('выручил','выручила')}, ${hv()}!`,`Here’s your ${money(a.a)} back. Thanks for helping me out, ${hv()}!`);
  if(f.k==='wed2')return a.o==='a'?T(`Марина передаёт: ты ${G('лучший свидетель','лучшая свидетельница')} на свете. Особенно когда ${G('уронил','уронила')} кольцо 😄`,`Marina says you’re the best ${G('best man','best woman')} in the world. Especially when you dropped the ring 😄`)
    :T(`Свадьба отгремела! Марина говорит, ты ${G('танцевал','танцевала')} лучше всех 😄`,'The wedding’s over! Marina says you danced better than anyone 😄');
  if(f.k==='gpay')return T(`Прости… в этом месяце банк списал платёж по моей ипотеке с тебя (${money(a.a)}). Мне очень стыдно.`,`I’m sorry… this month the bank took my mortgage payment from you (${money(a.a)}). I’m really ashamed.`);
  // M18: письма об отношениях и пользе — у каждого своим голосом
  if(f.k==='back2'&&a.b)return T(`Возвращаю ${money(a.a)} и ещё ${money(a.b)} сверху — за ожидание. Спасибо, что ${G('поверил','поверила')}!`,`Here’s your ${money(a.a)} back plus ${money(a.b)} for the wait. Thanks for trusting me!`);
  if(f.k==='late')return ({beav:T(`Слушай… с деньгами туго. ${money(a.a)} верну через два месяца — с процентом, слово Боброва.`,`Listen… money’s tight. I’ll return the ${money(a.a)} in two months — with interest, Bobrov’s word.`),
    vit:T(`Прости, ${hv()}, клиент задержал оплату. ${money(a.a)} отдам через два месяца, с процентом!`,`Sorry, ${hv()}, a client paid late. I’ll give you the ${money(a.a)} in two months, with interest!`)})[f.w]||T(`Задержу возврат ${money(a.a)} на два месяца — прости. Верну с процентом.`,`I’ll be two months late with the ${money(a.a)} — sorry. I’ll pay it back with interest.`);
  if(f.k==='sav'){const x={vit:[`Посчитал: за эти месяцы мои машины и оптовики сэкономили тебе ${money(a.a)}. Обращайся!`,`I did the maths: these months my trucks and wholesalers saved you ${money(a.a)}. Any time!`],
      bars:[`Для справки: ремонт и монтаж через меня сэкономили тебе ${money(a.a)}. Не благодари.`,`For the record: repairs and fitting through me saved you ${money(a.a)}. No thanks needed.`],
      owl:[`Я посчитала: с моим поручительством ты платишь банку меньше — примерно на ${money(a.a)}.`,`I worked it out: with my guarantee you pay the bank less — about ${money(a.a)}.`],
      beav:[`Итог нашей дружбы за квартал: плюс ${money(a.a)} тебе. Не зазнавайся 😄`,`Our friendship this quarter: ${money(a.a)} in your pocket. Don’t get cocky 😄`]}[f.w];return x?T(x[0],x[1]):'';}
  if(f.k==='rep')return T(`Слышал, у тебя поломка (${bizN(a.bt)}). Заехал, починил своими — вышло на ${money(a.a)} дешевле.`,`Heard something broke at your ${bizN(a.bt)}. I dropped by and fixed it — ${money(a.a)} cheaper.`);
  if(f.k==='cap')return T(`Смонтировал тебе новую точку (${bizN(a.bt)}) со своими ребятами — сэкономили ${money(a.a)}.`,`Fitted out your new ${bizN(a.bt)} with my crew — saved you ${money(a.a)}.`);
  if(f.k==='move')return T(`Переезд точки (${bizN(a.bt)}) — на моих машинах: с тебя меньше на ${money(a.a)}.`,`Moving your ${bizN(a.bt)} — on my trucks: ${money(a.a)} off for you.`);
  if(f.k==='rival')return T(`Не обижайся — открыл свою точку рядом с твоей (${bizN(a.bt)}). Бизнес есть бизнес. Покупателей у тебя станет меньше на ${a.p} % месяца на три.`,`No hard feelings — I opened my place right next to your ${bizN(a.bt)}. Business is business. You’ll lose about ${a.p}% of customers for three months.`);
  if(f.k==='ovt')return T('Ну ты даёшь — обогнал меня по капиталу! Ничего, реванш за мной. Давай пари?','Well, look at you — you’ve overtaken me! Fine, I’ll get my revenge. Fancy a bet?');
  if(f.k==='ovt2')return T('Хе-хе, я снова впереди. Догоняй!','Heh, I’m ahead again. Catch up!');
  if(f.k==='pwin'&&a.cr)return T(`Выручка ${money(a.r)} — ты ${G('выиграл','выиграла')}! Твои ${a.cr} 💎 назад и ещё ${a.cr} 💎 сверху.`,`Revenue ${money(a.r)} — you win! Your ${a.cr} 💎 back plus ${a.cr} 💎 on top.`);
  if(f.k==='plose'&&a.cr)return T(`Выручка ${money(a.r)}, а нужно было ${money(a.tg)}. Пари моё — ${a.cr} 💎 мои 😄 Реванш?`,`Revenue ${money(a.r)}, and you needed ${money(a.tg)}. The bet’s mine — the ${a.cr} 💎 are mine 😄 Rematch?`);
  if(f.k==='pwin')return T(`Выручка ${money(a.r)} — ты ${G('выиграл','выиграла')}! Держи ${money(a.a)}, честно заработано.`,`Revenue ${money(a.r)} — you win! Here’s your ${money(a.a)}, fair and square.`);
  if(f.k==='plose')return T(`Выручка ${money(a.r)}, а нужно было ${money(a.tg)}. Пари моё — с тебя ${money(a.a)} 😄 Реванш?`,`Revenue ${money(a.r)}, and you needed ${money(a.tg)}. The bet’s mine — you owe me ${money(a.a)} 😄 Rematch?`);
  if(f.k==='peace')return ({beav:T('Ладно, мир. Ты всё-таки свой — 11 «Б» не пропьёшь.','Alright, truce. You’re one of us after all — Class 11B for life.'),owl:T('Спасибо, что пришёл. Я правда рада. Мир?','Thanks for coming. I’m really glad. Friends again?'),
    bars:T('…Проходи. Чай будешь? Давно надо было поговорить.','…Come in. Tea? We should have talked long ago.'),vit:T('О, наконец-то! Всё, мир-дружба-жвачка!','Oh, finally! That’s it — friends again!')})[f.w]||'';
  if(f.k==='miss')return ({beav:T('Совсем пропал! Зазнался, что ли? Позвони хоть.','You’ve vanished! Too grand for us now? At least give me a call.'),owl:T('Давно не слышались… Мама спрашивает, как ты.','We haven’t talked in ages… Mum asks how you are.'),
    bars:T('Давно не заходил. Всё нормально?','Haven’t seen you in a while. Everything alright?'),vit:T('Эй, ты куда пропал? Заезжай, чай попьём!','Hey, where did you go? Drop by for tea!')})[f.w]||'';
  if(f.k==='lvup'){const n=lvName(a.b);return a.b>=4?({beav:T('Знаешь… ты мне ближе брата. Только никому.','You know… you’re closer than a brother to me. Don’t tell anyone.'),owl:T('Ты у меня самый надёжный человек. Правда.','You’re the most reliable person I know. Really.'),bars:T('На тебя можно положиться. Это редкость.','I can count on you. That’s rare.'),vit:T('Братишка! Для тебя — всё что угодно!','Buddy! Anything for you!')})[f.w]+` (${n})`
    :T(`С тобой приятно иметь дело! Теперь мы — «${n}».`,`Good to deal with you! Now we’re “${n}”.`);}
  if(f.k==='lvdn'){const n=lvName(a.b);return a.b<=1?T(`Что-то между нами похолодало… Теперь у нас «${n}». Захочешь помириться — заходи в гости.`,`Things have cooled between us… We’re “${n}” now. If you want to make up — come round.`):T(`Мы как-то отдалились. Теперь просто «${n}».`,`We’ve drifted apart a bit. Now just “${n}”.`);}
  const x=FEED[f.k];return x?T(x[0],x[1]):T('Есть новости!','Got some news!');}
const FMOOD={gg:'happy',self:'calm',gpay:'worry',bobr:'strict',leave:'calm',vitlook:'worry',plant:'strict',bearnews:'strict',late:'worry',rival:'strict',miss:'worry',lvdn:'worry',plose:'happy',pwin:'worry',ovt:'wow'};
// уровни отношений (M18) — те же слова в телефоне и окне «Друзья»
const LVN=[['в ссоре','on the outs'],['прохладно','cool'],['приятели','pals'],['друзья','friends'],['не разлей вода','inseparable']];
function lvName(i){const x=LVN[Math.max(0,Math.min(4,i|0))];return T(x[0],x[1]);}
function bizN(t){const B=E.BIZ&&E.BIZ[t];return B?T(String(B.n||'').toLowerCase(),String(B.en||'').toLowerCase()):T('точка','business');}

/* ---------------- история (W.fr.ch) ---------------- */
const pct=x=>Math.round(x*100)+(en()?'%':' %');
const JVN={trans:['«ВитТранс»','VitTrans'],base:['стройбаза на двоих','the shared builders’ yard'],pit:['карьер «Сосновый лог»','Pine Hollow quarry'],fund:['фонд «Сова Инвест»','the Owl Invest fund'],gaz:['«Газель на двоих»','the shared van']};
const jvName=t=>{const x=JVN[t]||JVN.trans;return T(x[0],x[1]);};
function logMsg(w,x){const a=x.a||{},d=x.d?` · ❤ ${x.d>0?'+':''}${x.d}`:'';
  if(x.k==='reu'||x.k==='pro'){const h=SY.reuOf(w.fr,{a})||{};const p=h.r?SY.reuPlace(h):0;return {tx:T(`🥂 Встреча выпускников «${h.y||a.y||10} лет»`,`🥂 Class reunion “${h.y||a.y||10} years”`)+(p?T(`: вы — ${p}-е место`,`: you placed ${p}`):''),me:true,mood:'happy'};}
  if(x.k==='ipo')return {tx:T('🔔 IPO: друзья были в зале','🔔 IPO: your friends were in the hall'),me:true,mood:'wow'};
  if(SC[x.k]||x.k.indexOf('rq_')===0){const q=x.k.indexOf('rq_')===0?{k:'rq',r:x.k.slice(3),w:x.w,a}:{k:x.k,w:x.w,a};const s=ask(w,q);const op=s.o[x.o];
    return {q:s.tx,ans:op?op[0]:'',mood:s.m,me:true,d:x.d};}   // вопрос и ответ парой (телефон рисует их сам, если tx нет)
  const M={repaid:[T('Вы вернули долг','You repaid the loan'),1],lendback:[T(`Вернул вам ${money(a.a)}`,`Paid you back ${money(a.a)}`),0],
    jv:[T(`Открыли совместное дело: ${jvName(x.o)}, вклад ${money(a.a)}, ваша доля ${pct(a.sh||.5)}`,`Started a joint venture: ${jvName(x.o)}, invested ${money(a.a)}, your share ${pct(a.sh||.5)}`),1],
    jvyear:[T(`Год нашему делу (${jvName(x.o)})! Ваша доля прибыли за год — ${money(a.p)}.`,`A year of our venture (${jvName(x.o)})! Your share of profit for the year — ${money(a.p)}.`),0],
    jvdiv:[T(`Решили: дивиденды — ${pct(a.d||0)} прибыли (${jvName(x.o)})`,`Agreed: dividends — ${pct(a.d||0)} of profit (${jvName(x.o)})`),1],
    jvbuy:[T(`Вы выкупили долю друга за ${money(a.a)} (${jvName(x.o)})`,`You bought out your friend’s share for ${money(a.a)} (${jvName(x.o)})`),1],
    jvsell:[T(`Вы продали свою долю за ${money(a.a)} (${jvName(x.o)})`,`You sold your share for ${money(a.a)} (${jvName(x.o)})`),1],
    congr:[T('Вы поздравили 🎉','You sent congratulations 🎉'),1],
    gulate:[T('По кредиту, за который я поручилась, — просрочка. Мне было очень неловко перед банком.','The loan I guaranteed is overdue. I was really embarrassed in front of the bank.'),0],
    guse:[T(`Поручительство оформлено: кредит ${money(a.a)}, ставка на один процент ниже.`,`Guarantee done: a ${money(a.a)} loan at a rate one percent lower.`),0]};
  // M18: то, о чём друг сам пишет письмом, в переписке второй раз не показываем
  if({rep:1,cap:1,move:1,pwin:1,plose:1,rival:1,ovt:1,lendlate:1,peace:1}[x.k])return {tx:'',me:true};
  const M2={chat:T('📞 Поболтали','📞 A friendly chat'),visit:T('🏠 Вы заходили в гости','🏠 You came round'),ign:T('Просьба осталась без ответа','A request went unanswered'),
    perk:x.o==='jv'?(x.w==='vit'?T('🤝 Купили Газель на двоих','🤝 Bought a van together'):x.w==='owl'?T('🤝 Вошли в фонд Сони','🤝 Joined Sonya’s fund'):T('🤝 Открыли точку на двоих','🤝 Opened a place together')):T('🤝 Помощь друга: ','🤝 A friend’s help: ')+perkName(x.o)+(a.a?' (+'+money(a.a)+')':'')};
  if(M2[x.k])return {tx:M2[x.k]+d,me:true,mood:'happy'};
  if(x.k.indexOf('call_')===0){const k=x.k.slice(5);return {tx:'📞 '+(k==='loan'&&a.a?T(`Заняли ${money(a.a)} на ${mon(a.n||6)}`,`Borrowed ${money(a.a)} for ${mon(a.n||6)}`):callLabel(k,{a:a.a}))+d,me:true,mood:'happy'};}
  const m=M[x.k];if(!m)return {tx:T('Вы ответили','You replied')+d,me:true,mood:'calm'};
  return {tx:m[0]+d,me:!!m[1],mood:x.k==='gulate'?'strict':'happy'};}

/* ---------------- API для телефона ---------------- */
const WHY={cash:['не хватает денег','not enough money'],trust:['нужно больше доверия','needs more trust'],quarter:['уже просили в этом квартале','already asked this quarter'],
  owe:['сначала верните прошлый займ','repay the previous loan first'],bank:['банк пока не даёт кредит','the bank isn’t lending yet'],nobuild:['сейчас нет строек','no construction right now'],
  noauc:['сейчас нет торгов','no auctions right now'],cd:['уже помогал — позже','already helped — later'],active:['уже действует','already on'],nobank:['нет платежей банку','no bank payments'],norev:['нужна выручка за месяц','needs a month of revenue'],nosup:['нет точек с товаром','no businesses buying stock'],nopts:['нет работающих точек','no working businesses'],crno:['не хватает 💎','not enough 💎'],nogig:['подходящих заказов нет','no suitable jobs'],month:['уже в этом месяце','already this month'],en:['не хватает сил ⚡','not enough energy ⚡'],card:['карта уже есть','you already have the card'],wait:['решали меньше года назад','agreed less than a year ago'],no:['пока недоступно','not available yet']};
function why(c){const x=WHY[c]||WHY.no;return T(x[0],x[1]);}
function msg(w,it){w=w||W();const x=it.x;
  if(it.type==='feed')return {tx:feedTx(w,x),mood:FMOOD[x.k]||'happy',me:false};
  if(it.type==='ask'){const s=ask(w,x);const opts=[];for(const o in s.o)opts.push({o,tx:s.o[o][0],hint:s.o[o][1]||''});return {tx:s.tx,mood:s.m,me:false,opts};}
  if(it.type==='log')return logMsg(w,x);
  return null;}
function perkName(p){const x={ship:['закупка дешевле','cheaper supplies'],gig:['выгодный заказ','a well-paid job'],prof:['профилактика точек','preventive checks'],rate:['поручительство в банке','a bank guarantee'],
  guar:['поручительство в банке','a bank guarantee'],buy:['общая закупка','joint purchasing'],jv:['точка на двоих','a joint place']}[p];return x?T(x[0],x[1]):p;}
function callLabel(k,op){const a=op&&op.a,P=SY.PK||{},w=W(),L=op&&op.w&&SY.lv?SY.lv(w,op.w):3,pc=x=>pctS(x);
  const x={loan:[`Занять до ${money(a||0)} без процентов`,`Borrow up to ${money(a||0)} interest-free`],truck:['Машины на месяц: доставка −25 %','Trucks for a month: delivery −25%'],
    guar:[`Поручительство: кредит на ${Math.round(-(P.guarDr?P.guarDr[Math.max(3,L)]:-.02)*100)} п. п. дешевле`,`Guarantee: a loan ${Math.round(-(P.guarDr?P.guarDr[Math.max(3,L)]:-.02)*100)} p.p. cheaper`],
    bridge:[`Перекрыть платёж банку: ${money(a||0)} на 3 мес. без процентов`,`Cover my bank payment: ${money(a||0)} for 3 months interest-free`],
    check:['Проверить финансы и налог','Check my finances and tax'],expert:['Техаудит: участки и карьеры на торгах','Tech audit: plots and quarries at auction'],
    build:[`Ускорить стройку: −${pc(a||.2)} срока`,`Speed up construction: −${pc(a||.2)} time`],
    fix:[`Профилактика точек: ${P.fixM||3} мес. ремонт бесплатно`,`Preventive checks: ${P.fixM||3} months of free repairs`],
    pari:[`Пари на ${money(a||0)}: выручка +10 % за месяц`,`Bet ${money(a||0)}: revenue +10% in a month`],
    buy:[`Общая закупка: товар −${pc(P.buyD||.03)}`,`Joint purchasing: goods −${pc(P.buyD||.03)}`],
    gig:a?[`Подкинуть заказ: ${money(a)} (×1,5)`,`Pass me a job: ${money(a)} (×1.5)`]:['Подкинуть выгодный заказ (×1,5)','Pass me a well-paid job (×1.5)']}[k];
  return x?T(x[0],x[1]):k;}
const HELLO={owl:[['Привет! Слушаю внимательно.','Hi! I’m all ears.'],'calm'],beav:[['О, {v}! Звонишь сдаваться? 😄','Oh, {v}! Calling to surrender? 😄'],'happy'],
  bars:[['Да. Слушаю.','Yes. Listening.'],'calm'],vit:[['Алло-алло! Витя на связи!','Hello-hello! Vitya here!'],'happy'],bear:[['Топтыгин. Коротко, пожалуйста.','Toptygin. Briefly, please.'],'strict']};
function hello(w,id){const x=HELLO[id]||HELLO.vit;let tx=T(x[0][0],x[0][1]).replace('{v}',hv());const f=w&&w.fr&&w.fr[id];
  if(f&&typeof f.rel==='number'&&f.rel<=-16&&id!=='bear')return {tx:T('Да?.. Слушаю. Что '+G('хотел','хотела')+'?','Yes?.. I’m listening. What do you want?'),mood:'strict'};
  if(f&&f.tr<35&&id!=='bear')return {tx:T('Привет… Давно не слышались.','Hi… It’s been a while.'),mood:'worry'};return {tx,mood:x[1]};}
// совет Сони по налогу (M18): по вашим месяцам — что дешевле, УСН 6 % «с доходов» или 15 % «доходы минус расходы»
function taxTx(t){if(!t)return '';if(!t.best)return T(' Про налог скажу, когда наберётся пара месяцев отчётов.',' I’ll advise on tax once there are a couple of months of reports.');
  const nm=m=>m==='usn15'?T('УСН 15 % («доходы минус расходы»)','simplified 15% (income minus costs)'):T('УСН 6 % («с доходов»)','simplified 6% (on income)');
  if(t.best===t.cur)return T(` Налог: у тебя ${nm(t.cur)} — это и есть дешевле. Всё правильно.`,` Tax: you’re on ${nm(t.cur)} — that’s the cheaper one. Well done.`);
  return T(` Налог: ${nm(t.best)} тебе дешевле примерно на ${money(t.diff)} в год. `,` Tax: ${nm(t.best)} would save you about ${money(t.diff)} a year. `)+(t.can?T('Сменить можно прямо сейчас — в разделе налогов.','You can switch right now — in the tax section.'):T('Сменить можно в январе.','You can switch in January.'));}
function after(w,res){w=w||W();if(!res||res.res!=='ok')return {tx:'',toast:res?why(res.res):'',mood:'worry'};
  const wh=res.w==='all'?(ALLW[res.k]||'owl'):res.w;const d=res.d?(res.w==='all'||res.k==='tpt4'?` ❤ ${T('друзей','friends')} +5`:` ❤ ${nk(wh)}: ${res.d>0?'+':''}${res.d}`):'';
  if(res.k&&res.k!=='reu'&&res.k!=='pro'&&!('o' in res)&&SY.CALL[res.w]){   // звонок
    let tx='';const k=res.k;
    if(k==='loan')tx=T(`Держи ${money(res.a)}. Вернёшь через ${mon(res.n)} — без процентов.`,`Here’s ${money(res.a)}. Pay me back in ${mon(res.n)} — no interest.`);
    else if(k==='guar'){const dr=Math.round((res.dr||.02)*100);tx=T(`Поручусь. Бери кредит в ближайшие 3 месяца — оформим под меня. Ставка на ${dr} п. п. ниже, лимит на 15 % выше.`,`I’ll vouch for you. Take a loan within 3 months — we’ll put it under my name. The rate ${dr} p.p. lower, the limit 15% higher.`);}
    else if(k==='check'){const c=res.c||{};const cm=c.cashM>=99?T('надолго','for a long time'):T(`на ${(Math.round(c.cashM*10)/10).toLocaleString(en()?'en':'ru')} мес.`,`for ${(Math.round(c.cashM*10)/10).toLocaleString('en')} months`);
      tx=T(`Смотрю твои цифры. Денег хватит ${cm} расходов. ${c.lev>=99?'Долг из заработка пока не гасится.':c.lev<=.05?(c.debt>0?'Долг маленький — гасится из заработка за пару месяцев.':'Долгов нет.'):`Долг гасится из заработка примерно за ${(Math.round(c.lev*10)/10).toLocaleString('ru')} ${(x=>x%1?'года':pln(x,'год','года','лет','year','years'))(Math.round(c.lev*10)/10)}.`}`,`Looking at your numbers. Cash covers expenses ${cm}. ${c.lev>=99?'Earnings don’t cover the debt yet.':c.lev<=.05?(c.debt>0?'The debt is small — earnings clear it in a couple of months.':'No debt.'):`Your debt would take about ${(Math.round(c.lev*10)/10).toLocaleString('en')} years of earnings to repay.`}`)
        +(c.od?T(' Есть овердрафт — закрой его первым делом.',' You’re in overdraft — close it first.'):c.lev>3?T(' Долг великоват, я бы притормозила.',' The debt is on the high side, I’d slow down.'):T(' Всё спокойно, можно расти.',' All calm, you can grow.'))+taxTx(res.tax);}
    else if(k==='expert'){const L2=res.list||[];tx=L2.length?T('Посмотрел участки на торгах:','I looked at the plots up for auction:')+' '+L2.slice(0,3).map(x=>(x.opi?'':(window.NM?NM.reg(x.r)+', ':''))+gName(x.g)+(x.res?T(`: запас ${Math.round(x.res/1e3).toLocaleString('ru')} тыс.`,`: reserve ${Math.round(x.res/1e3).toLocaleString('en')}k`):'')+(x.vc?T(`, добыча ${x.vc.toLocaleString('ru')} ₽/ед.`,`, mining cost ${x.vc.toLocaleString('en')} ₽/unit`):'')).join('; ')+'. '+T('Бери, если лицензия не дороже 60 % оценки.','Take one if the licence costs under 60% of its value.'):T('Торгов сейчас нет — позвони, как объявят.','No auctions right now — call me when they’re announced.');}
    else if(k==='build')tx=T(`Пришлю своих ребят — стройка короче на ${pctS(res.f||.15)}. Ускорили: ${res.n||0}.`,`I’ll send my crew — construction ${pctS(res.f||.15)} shorter. Sped up: ${res.n||0}.`);
    else if(k==='bridge')tx=T(`Держи ${money(res.a)} — перекроешь платёж банку. Вернёшь через 3 месяца, без процентов.`,`Here’s ${money(res.a)} — cover your bank payment. Pay me back in 3 months, no interest.`);
    else if(k==='pari'&&res.cr)tx=T(`Спорим на ${res.cr} 💎: в следующем месяце выручка ${money(res.tg)} или больше — получишь ${2*res.cr} 💎. Нет — мои. По рукам!`,`It’s a bet, ${res.cr} 💎: next month revenue ${money(res.tg)} or more — you get ${2*res.cr} 💎. If not — they’re mine. Shake!`);
    else if(k==='pari')tx=T(`Спорим на ${money(res.a)}: в следующем месяце выручка ${money(res.tg)} или больше — плачу я. Нет — ты. По рукам!`,`It’s a bet, ${money(res.a)}: next month revenue ${money(res.tg)} or more — I pay. If not — you do. Shake!`);
    else if(k==='buy')tx=T(`Беру на двоих — товар на ${pctS(SY.PK.buyD||.03)} дешевле, ${mon(res.m||2)}.`,`I’ll buy for both of us — goods ${pctS(SY.PK.buyD||.03)} cheaper for ${mon(res.m||2)}.`);
    else if(k==='fix')tx=T(`В выходные пройдусь по твоим точкам. ${mon(res.m||3)} ремонт — за мой счёт.`,`I’ll go round your places at the weekend. ${mon(res.m||3)} of repairs on me.`);
    else if(k==='gig')tx=res.a?T(`Лови заказ — клиент платит ${money(res.a)}. Уже на твоей доске!`,`Here’s a job — the client pays ${money(res.a)}. It’s on your board!`):T('Сейчас ничего подходящего, позвони позже.','Nothing suitable right now, call later.');
    else if(k==='truck')tx=T('Машины твои! В этом месяце доставка на 25 % дешевле.','The trucks are yours! Delivery is 25% cheaper this month.');
    return {tx,toast:k==='loan'?T(`+${money(res.a)} от друга`,`+${money(res.a)} from a friend`):'',mood:'happy'};}
  // ответ на сцену
  const q={k:res.k==='rq'?'rq':res.k,r:res.r,w:res.w,a:res.a||{}};
  if(res.k==='reu'||res.k==='pro'){let t=res.place?T(`Ваше место за столом — ${res.place}-е.`,`Your place at the table — number ${res.place}.`):'';
    if(res.cr&&!res._cr){res._cr=1;try{GAME.addCr(res.cr,'reunion');}catch(e){}t+=` +${res.cr} 💎`;}
    const cu=res.cup==='you'?(res.cup0==='you'?T('Кубок 11 «Б» остаётся у вас!','The Class 11B cup stays with you!'):T('Кубок 11 «Б» теперь ваш! Борис ворчит, но хлопает громче всех.','The Class 11B cup is yours now! Boris grumbles but claps the loudest.'))
      :res.cup?T(`Кубок 11 «Б» пока у ${gen(res.cup)}. Через 5 лет — реванш!`,`The Class 11B cup goes to ${nk(res.cup)} for now. Rematch in 5 years!`):'';
    return {tx:(cu?'🏆 '+cu+' ':'')+T('Отличный вечер! До встречи через 5 лет.','A great evening! See you in 5 years.'),toast:t,mood:'happy'};}
  const s=SC[res.k];return {tx:reply(q,res.o),toast:d.trim(),mood:res.o==='a'||!s?'happy':'calm'};}
function feedApi(w,f){return feedTx(w||W(),f);}
function date(w,d){const x=d.w?nk(d.w):'';
  if(d.k==='reu')return T(`Встреча выпускников «${d.y} лет»`,`Class reunion “${d.y} years”`);
  if(d.k==='lendback')return T(`${x} вернёт вам ${money(d.a)}`,`${x} repays you ${money(d.a)}`);
  if(d.k==='owe')return T(`Вернуть ${x}: ${money(d.a)}`,`Repay ${x}: ${money(d.a)}`);
  if(d.k==='jvdiv')return T(`Совместное дело с ${d.w==='owl'?'Соней':d.w==='beav'?'Борисом':d.w==='bars'?'Петром':'Витей'}: решить про дивиденды`,`Joint venture with ${x}: agree on dividends`);
  if(d.k==='guar')return T('Поручительство Сони: успеть взять кредит','Sonya’s guarantee: take the loan in time');
  // M20
  if(d.k==='pari'){const st=d.cr?`${d.cr} 💎`:money(d.a||0);return T(`Итог пари с Борисом: выручка месяца ≥ ${money(d.tg||0)}? Ставка ${st}`,`Bet with ${x} settles: month revenue ≥ ${money(d.tg||0)}? Stake ${st}`);}
  if(d.k==='prof')return T('Профилактика Петра заканчивается — дальше ремонт за свой счёт','Pyotr’s preventive checks end — repairs are on you after this');
  if(d.k==='buy')return T(`Общая закупка с Борисом заканчивается (товар −${pctS(SY.PK.buyD||.03)})`,`Joint purchasing with Boris ends (goods −${pctS(SY.PK.buyD||.03)})`);
  if(d.k==='ship')return T(`Витя возит ваш товар со скидкой (−${pctS(SY.PK.ship||.04)}) — последний месяц`,`Vitya hauls your goods at a discount (−${pctS(SY.PK.ship||.04)}) — last month`);
  return '';}

/* ---------------- окна ---------------- */
function css(){if(document.getElementById('st-css'))return;const s=document.createElement('style');s.id='st-css';s.textContent=`
.st-av{display:inline-block;border-radius:50%;border:2px solid;overflow:hidden;flex:none;vertical-align:middle;background:var(--soft)}
.st-av svg{display:block;width:100%;height:100%}
.st-ini{display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-weight:700;color:var(--ink2)}
.st-hd{display:flex;align-items:center;margin-bottom:12px}.st-hd>.st-av{margin-right:14px}
.st-hd b{display:block;font-size:19px}.st-hd small{display:block;color:var(--muted);font-size:15px}
.st-say{background:var(--say-bg,var(--soft));border-radius:16px;padding:14px 16px;font-size:17px;line-height:1.45;margin:0 0 6px}
.st-hint{color:var(--muted);font-size:15px;margin:2px 4px 0}
.st-why{display:block;font-size:14px;font-weight:500;opacity:.9}
.st-hr{color:#d64550;letter-spacing:1px;font-size:16px}.st-hr i{font-style:normal;opacity:.22}
.st-tb{width:100%;border-collapse:collapse;margin:6px 0 4px}
.st-tb td{padding:8px 4px;border-bottom:1px solid var(--line);vertical-align:middle;font-size:17px}
.st-tb tr.me td{background:var(--accent-t,#eef2ff)}
.st-tb .n{width:28px;text-align:center;font-weight:700;color:var(--muted)}
.st-tb .v{text-align:right;white-space:nowrap;font-weight:600}
.st-tb .ph{display:block;color:var(--muted);font-size:14px;font-style:italic;margin-top:2px}
.st-tb .up{color:var(--good);font-size:14px}.st-tb .dn{color:var(--bad);font-size:14px}
.st-sub{color:var(--muted);text-align:center;margin:-4px 0 10px;font-size:16px}
.st-card{border:1px solid var(--line);border-radius:18px;padding:12px;margin:10px 0}
.st-row{display:flex;align-items:center}.st-row>*+*{margin-left:12px}
.st-f{flex:1 1 auto;min-width:0}.st-f b{display:block}.st-f small{display:block;color:var(--muted);font-size:15px}
.st-facts{display:flex;flex-wrap:wrap;margin:8px -6px 0}.st-facts>div{margin:4px 6px;font-size:16px}.st-facts span{color:var(--muted);margin-right:6px}
.st-pick{display:flex;flex-wrap:wrap;margin:6px -4px}.st-pick>.btn{flex:1 1 30%;margin:4px;min-height:52px}
.st-pick>.btn.on{background:var(--accent);color:var(--on-accent)}
.st-toast{text-align:center;font-size:18px;font-weight:600;margin:8px 0}
.st-four{display:flex;justify-content:center;margin:0 0 10px}.st-four>.st-av{margin:0 4px}
.st-line{margin:8px 0}.st-line>.st-av{align-self:flex-start}.st-line p{margin-top:0;margin-bottom:0}.st-line>*+*{margin-left:12px}
.st-line .st-f small{font-size:15px;line-height:1.35}
.st-in{display:block;width:100%;box-sizing:border-box;min-height:52px;margin:8px 0 4px;padding:10px 14px;font-size:18px;border:1px solid var(--line);border-radius:14px;background:var(--card,#fff);color:var(--ink)}
.st-skip{background:none!important;border:0!important;box-shadow:none!important;color:var(--muted)!important;font-weight:500;min-height:48px}
.st-dots{text-align:center;margin:10px 0 2px}.st-dots i{display:inline-block;width:8px;height:8px;border-radius:4px;background:var(--line);margin:0 4px}.st-dots i.on{background:var(--accent);width:22px}
.st-cup{text-align:center;font-size:56px;line-height:1.1;margin:4px 0}
.st-start{justify-content:center;margin:6px -6px 8px}.st-start>div{background:var(--soft);border-radius:12px;padding:8px 12px}
.st-photo{display:flex;flex-wrap:wrap;justify-content:center;margin:4px 0 8px}.st-photo>.st-av{margin:4px}
.st-away{border:1px solid var(--line);border-radius:16px;padding:10px 12px;margin:10px 0}
.st-lbl{font-weight:700;font-size:16px;margin-bottom:4px}
.st-away .st-f{font-size:16px;line-height:1.4}
.st-next{font-size:16px;line-height:1.4;margin:8px 0 2px}
@supports not (inset:0){.st-four>.st-av,.st-photo>.st-av{margin:4px}}
#stBtn{position:relative}#stBtn em{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:var(--bad);color:#fff;font-size:13px;font-style:normal;line-height:20px;padding:0 5px}
`;document.head.appendChild(s);}
function open(html,re){css();modal(html);try{modalRe=re||null;}catch(e){}}
function close(){try{hideModal();}catch(e){}}
function bind(sel,fn){const c=document.getElementById('mcard');if(!c)return;c.querySelectorAll(sel).forEach(b=>b.addEventListener('click',()=>fn(b)));}
const SPEND={beav3:'abd',vit3:'a',bars2:'a',bear1:'a',vit4:'a',beav5:'a',owl3:'a',lud3:'a'};
const spendO=(q,o)=>{if(q.k==='rq')return o==='a'&&(q.r==='loan'||q.r==='gift');return !!SPEND[q.k]&&SPEND[q.k].indexOf(o)>=0;};
// кто говорит в общих сценах (w:'all') и заголовки больших сцен
const ALLW={ipo:'beav',tpt2:'beav',ned1:'owl'};
const spk=q=>q.w==='all'?(ALLW[q.k]||'owl'):q.w;
const TITLE={beav3:['🌙 Ночной звонок','🌙 A late-night call'],ned1:['✉️ В большую лигу','✉️ The big league'],bear1:['🐻 Топтыгин','🐻 Toptygin'],ipo:['🔔 Звонок на бирже','🔔 The opening bell'],
  first1:['💰 Первая выручка','💰 First takings'],tpt1:['🐻 Звонок с московского номера','🐻 A call from a Moscow number'],lud1:['☕ Разговор на кухне','☕ A kitchen-table talk'],
  tpt2:['🐻 Торги против Медведя','🐻 Bidding against the Bear'],part:['🤝 Партнёр для недр','🤝 A partner for mining'],tpt4:['🐻 Предложение, от которого можно отказаться','🐻 An offer you can refuse'],
  mem:['📼 Людмила Санна вспоминает','📼 Lyudmila Sanna remembers'],lud2:['📁 Папка «Передать»','📁 The “Handover” folder'],ludcall:['☎️ Звонок по пятницам','☎️ The Friday call'],
  tpt5:['🐻 Ход конём','🐻 A knight’s move'],lud3:['🎂 Юбилей Людмилы Санны','🎂 Lyudmila Sanna’s birthday'],owl4:['🎤 Соня открывает фонд','🎤 Sonya opens her fund'],vit4:['💍 Витя женится','💍 Vitya’s getting married']};

// сцена/просьба (и большие сцены, кроме встречи): портрет, текст, варианты
function openAsk(qid){const w=W();if(!w||!w.fr)return false;const q=w.fr.q.find(x=>x.id===qid);if(!q)return false;
  if(q.k==='reu'||q.k==='pro')return openReunion(qid);
  if(q.k==='ipo')return openIpoScene(qid);
  const wh=spk(q),s=ask(w,q),ops=SY.optsOf(w,q);
  const hd=q.w==='all'?`<div class="st-hd">${['owl','beav','bars','vit'].map(id=>pic(id,s.m,44)).join(' ')}</div>`
    :`<div class="st-hd">${pic(wh,s.m,72)}<div><b>${esc(nm(wh))}</b><small>${esc(who(wh).sub)}</small></div></div>`;
  const title=TITLE[q.k]?T(TITLE[q.k][0],TITLE[q.k][1]):'';
  let h=(title?`<h2>${title}</h2>`:'')+hd+`<p class="st-say">${esc(s.tx)}</p><div class="row">`;
  for(const op of ops){const x=s.o[op.o]||[T('Да','Yes'),''],ok=op.ok===true;
    h+=`<div><button class="btn w${op.o==='a'&&ok?' accent':''}${spendO(q,op.o)?' noenter':''}" data-o="${op.o}"${ok?'':' disabled'}>${esc(x[0])}${ok?'':`<span class="st-why">${esc(why(op.ok))}</span>`}</button>${x[1]?`<p class="st-hint">${esc(x[1])}</p>`:''}</div>`;}
  if(!q.big)h+=`<button class="btn w noenter" data-x="1">${T('Ответить позже','Answer later')}</button>`;
  h+='</div>';
  open(h,()=>openAsk(qid));
  bind('[data-o]',b=>answer(q,b.dataset.o));bind('[data-x]',()=>close());return true;}
function answer(q,o){let r;try{r=GAME.act('friendAnswer',q.id,o);}catch(e){console.error(e);r={res:'no'};}
  if(!r||r.res!=='ok'){snd('no');toast(why(r&&r.res||'no'));return;}
  snd(spendO(q,o)?'coin':'tap');const af=after(W(),r);const wh=spk(q);
  open(`<div class="st-hd">${pic(wh,af.mood,72)}<div><b>${esc(nm(wh))}</b><small>${esc(who(wh).sub)}</small></div></div><p class="st-say">${esc(af.tx)}</p>${af.toast?`<p class="st-toast">${esc(af.toast)}</p>`:''}<div class="row"><button class="btn w accent" data-x="1">${T('Хорошо','OK')}</button></div>`);
  bind('[data-x]',()=>{close();next();});}
// встреча выпускников: «Кто из нас дальше»
const PH={owl:[['Считаю: ты догонишь. А я считаю точно.','My maths says you’ll catch up. And my maths is exact.'],['Горжусь тобой. И чуть-чуть завидую.','Proud of you. And a tiny bit jealous.']],
  beav:[['Ну что, {v}, отстаёшь?','Well, {v}, falling behind?'],['Ничего, догоню.','No matter, I’ll catch up.']],
  bars:[['Посчитал — повезло мне с участком.','Did the maths — I got lucky with my plot.'],['Молодец. Я своё ещё наверстаю.','Well done. I’ll make up my ground.']],
  vit:[['Кто бы мог подумать — таксист впереди!','Who’d have thought — the taxi driver’s ahead!'],['Ты молоток! Возить тебе — одно удовольствие.','You’re a star! Hauling for you is a pleasure.']],
  bear:[['Не одноклассник, но за ним следят все.','Not a classmate, but everyone keeps an eye on him.'],['Не одноклассник, но за ним следят все.','Not a classmate, but everyone keeps an eye on him.']]};
const PH0={owl:['Я в банке, выдаю кредиты таким, как вы будете.','I’m at a bank, lending to people like you’ll become.'],beav:['Открою ларёк, через год — сеть, вот увидите.','I’ll open a kiosk, a chain in a year — you’ll see.'],
  bars:['Карьер «Сосновый лог», смены по 12 часов.','Pine Hollow quarry, 12-hour shifts.'],vit:['Таксую. Подкину вам заказов!','Driving a taxi. I’ll send some jobs your way!'],bear:['','']};
// рост к прошлой встрече: при росте больше ×10 — «в N раз», иначе проценты; с нуля — «с нуля»
function grow(v,pv){if(!(pv>0))return v>0?`<span class="up">▲ ${T('с нуля','from zero')}</span>`:'';
  if(v>=pv){const k=v/pv;return `<span class="up">▲ ${k>=10?T(`в ${Math.round(k).toLocaleString('ru')} раз`,`×${Math.round(k).toLocaleString('en')}`):'+'+pct(k-1)}</span>`;}
  return `<span class="dn">▼ ${pct(1-v/pv)}</span>`;}
function openReunion(qid){const w=W();if(!w||!w.fr)return false;const q=w.fr.q.find(x=>x.id===qid);if(!q)return false;
  const h0=SY.reuOf(w.fr,q)||{r:{you:E.equity(w)},y:q.a.y||10,m:w.m};const y=h0.y||10,first=q.k==='pro';
  // таблица — с капиталом на момент встречи (окно открылось сейчас), а не на момент приглашения
  try{for(const x of SY.standings(w))if(x.id in h0.r||x.id==='you')h0.r[x.id]=x.v;}catch(e){}
  // Топтыгин — не одноклассник: за соседним столиком, строкой под таблицей
  const rows=Object.keys(h0.r).filter(id=>id!=='bear').map(id=>({id,v:h0.r[id]})).sort((a,b)=>b.v-a.v),me=rows.findIndex(x=>x.id==='you');
  let h=`<h2>🥂 ${T(`Встреча выпускников «${y} лет»`,`${y}-year class reunion`)}</h2><p class="st-sub">${T('Кафе «Юность», школа № 41, 11 «Б»','Youth Café, School No. 41, class 11B')} · ${window.FMT?FMT.date(w.m):''}</p>`;
  h+=`<p class="st-sub"><b>${first?T('«Через 10 лет — посмотрим, кто дальше!»','“Ten years from now — let’s see who’s come furthest!”'):T('Кто из нас дальше?','Who’s ahead?')}</b></p><table class="st-tb">`;
  rows.forEach((x,i)=>{const pv=h0.p&&h0.p[x.id];const ar=!first&&pv!==undefined?grow(x.v,pv):'';
    const ph=x.id==='you'?'':first?T(PH0[x.id][0],PH0[x.id][1]):(()=>{const p=PH[x.id]||PH.vit,z=p[i<me?0:1];return T(z[0],z[1]).replace('{v}',hv());})();
    h+=`<tr${x.id==='you'?' class="me"':''}><td class="n">${i+1}</td><td>${pic(x.id,i<me?'happy':'calm',40)}</td><td><b>${esc(x.id==='you'?T('Вы','You'):nk(x.id))}</b>${ph?`<span class="ph">${en()?'“':'«'}${esc(ph)}${en()?'”':'»'}</span>`:''}</td><td class="v">${money(x.v)}<br>${ar}</td></tr>`;});
  h+='</table>';
  // переходящий кубок: у кого сейчас и кто заберёт по итогам вечера
  {const cup=w.fr.cup||'beav',ld=rows[0]&&rows[0].id;
    h+=`<p class="st-hint" style="text-align:center">🏆 ${ld==='you'?T('Кубок 11 «Б» сегодня забираете вы!','Tonight the Class 11B cup is yours!'):T(`Кубок 11 «Б» сегодня у ${esc(gen(ld))}`,`Tonight the Class 11B cup goes to ${esc(nk(ld))}`)}${cup&&cup!==ld?T(` (был у ${cup==='you'?'вас':esc(gen(cup))})`,` (${cup==='you'?'it was yours':'it was with '+esc(nk(cup))})`):''}</p>`;}
  if(y>=30)h+=`<div class="st-hd">${pic('beav','happy',48)}<p class="st-say" style="flex:1">${esc(T(`Кафе «Юность» давно закрыли — теперь там ваш ресторан. Борис поднимает бокал: «${y} лет назад я увёл у председателя кубок. Двадцать — пытался обогнать. А сегодня скажу: спасибо, что ты у нас есть. Следующую встречу — у меня на яхте. Честно!»`,`Youth Café closed long ago — it’s your restaurant now. Boris raises his glass: “${y} years ago I stole the cup from our president. For twenty I tried to overtake you. Today I just want to say: thank you for being one of us. Next reunion is on my yacht. Honest!”`))}</p></div>`;
  if(h0.r.bear>0)h+=`<p class="st-hint">🐻 ${T(`Топтыгин за соседним столиком: ${money(h0.r.bear)}. Делает вид, что не слушает.`,`Toptygin at the next table: ${money(h0.r.bear)}. Pretending not to listen.`)}</p>`;
  const cr=[10,6,4,2,2,2,2][me]||2;
  h+=`<p class="st-hint" style="text-align:center">${T(`За встречу: +${cr} 💎`,`For showing up: +${cr} 💎`)}</p><div class="row"><button class="btn w accent noenter" data-o="a">🥂 ${y>=30?T('За 11 «Б»!','To Class 11B!'):T('За встречу!','Cheers!')}</button></div>`;
  open(h,()=>openReunion(qid));bind('[data-o]',()=>answer(q,'a'));return true;}
function big(qid){const w=W();const q=w&&w.fr&&w.fr.q.find(x=>x.id===qid);if(!q)return false;
  return q.k==='reu'||q.k==='pro'?openReunion(qid):openAsk(qid);}

// займ у друга: сумма и срок
function openLoan(id){const w=W();const op=SY.callOpts(w,id).find(x=>x.k==='loan');if(!op)return false;if(op.ok!==true){toast(why(op.ok));return true;}
  const mx=op.a,vals=[...new Set([SY.nice(mx/4),SY.nice(mx/2),mx].filter(v=>v>0&&v<=mx))];let a=vals[vals.length-1],n=6;
  const draw=()=>{open(`<div class="st-hd">${pic(id,'happy',72)}<div><b>${esc(nm(id))}</b><small>${esc(who(id).sub)}</small></div></div>
    <p class="st-say">${esc(T(`Без процентов, по-дружески. Сколько и на сколько?`,`Interest-free, as friends. How much and for how long?`))}</p>
    <p class="st-hint">${T('Сумма','Amount')}</p><div class="st-pick">${vals.map(v=>`<button class="btn noenter${v===a?' on':''}" data-a="${v}">${money(v)}</button>`).join('')}</div>
    <p class="st-hint">${T('Срок — вернуть одним платежом','Term — repay in one payment')}</p><div class="st-pick">${[6,12].map(v=>`<button class="btn noenter${v===n?' on':''}" data-n="${v}">${mon(v)}</button>`).join('')}</div>
    <p class="st-hint">${T(`В отчётах: «Кредиты получены» сейчас и «Кредиты погашены» через ${mon(n)}.`,`In reports: “Loans received” now and “Loans repaid” in ${mon(n)}.`)}</p>
    <div class="row"><button class="btn w accent noenter" data-ok="1">${T(`Занять ${money(a)}`,`Borrow ${money(a)}`)}</button><button class="btn w noenter" data-x="1">${T('Не сейчас','Not now')}</button></div>`,draw);
    bind('[data-a]',b=>{a=+b.dataset.a;draw();});bind('[data-n]',b=>{n=+b.dataset.n;draw();});bind('[data-x]',()=>close());
    bind('[data-ok]',()=>{let r;try{r=GAME.act('friendCall',id,'loan',{a,n});}catch(e){r={res:'no'};}if(!r||r.res!=='ok'){snd('no');toast(why(r&&r.res||'no'));return;}
      snd('coin');const af=after(W(),r);open(`<div class="st-hd">${pic(id,'happy',72)}<div><b>${esc(nm(id))}</b></div></div><p class="st-say">${esc(af.tx)}</p><div class="row"><button class="btn w accent" data-x="1">${T('Спасибо!','Thanks!')}</button></div>`);bind('[data-x]',()=>close());});};
  draw();return true;}
function call(id,k){if(k==='loan')return openLoan(id);if(k==='pari')return openPari(id);return false;}
// M20: пари по звонку — ставка на выбор: деньги или 💎
function openPari(id){const w=W();const op=SY.callOpts(w,id).find(x=>x.k==='pari');if(!op)return false;if(op.ok!==true){toast(why(op.ok));return true;}
  const c=SY.PARI_CR||5,have=window.GAME&&GAME.cr?GAME.cr():0;
  open(`<div class="st-hd">${pic(id,'happy',72)}<div><b>${esc(nm(id))}</b><small>${esc(who(id).sub)}</small></div></div>
    <p class="st-say">${esc(T('Спорим, что в следующем месяце твоя выручка не вырастет на 10 %? На что играем?','Bet your revenue won’t grow 10% next month? What are we playing for?'))}</p>
    <div class="row"><div><button class="btn w accent noenter" data-p="m">${T(`Спорим на ${money(op.a)}`,`Bet ${money(op.a)}`)}</button><p class="st-hint">${T('выиграли — Борис платит, проиграли — вы; ❤ +2','win — Boris pays, lose — you pay; ❤ +2')}</p></div>
    <div><button class="btn w noenter" data-p="c"${have>=c?'':' disabled'}>${T(`Спорим на ${c} 💎`,`Bet ${c} 💎`)}${have>=c?'':`<span class="st-why">${esc(why('crno'))}</span>`}</button><p class="st-hint">${T(`${c} 💎 — сразу, выиграли — вернутся ${2*c} 💎`,`${c} 💎 now, win — you get ${2*c} 💎 back`)}</p></div>
    <button class="btn w noenter" data-x="1">${T('Не сейчас','Not now')}</button></div>`,()=>openPari(id));
  bind('[data-x]',()=>close());
  bind('[data-p]',b=>{let r;try{r=GAME.act('friendCall',id,'pari',b.dataset.p==='c'?{cr:1}:{});}catch(e){r={res:'no'};}if(!r||r.res!=='ok'){snd('no');toast(why(r&&r.res||'no'));return;}
    snd('tap');const af=after(W(),r);open(`<div class="st-hd">${pic(id,'happy',72)}<div><b>${esc(nm(id))}</b></div></div><p class="st-say">${esc(af.tx)}</p><div class="row"><button class="btn w accent" data-x="1">${T('По рукам!','Deal!')}</button></div>`);bind('[data-x]',()=>close());});
  return true;}
// звонок без телефона
function doCall(id,k){if(k==='loan')return openLoan(id);let r;try{r=GAME.act('friendCall',id,k);}catch(e){r={res:'no'};}
  if(!r||r.res!=='ok'){snd('no');toast(why(r&&r.res||'no'));return;}snd('tap');const af=after(W(),r);
  open(`<div class="st-hd">${pic(id,af.mood,72)}<div><b>${esc(nm(id))}</b></div></div><p class="st-say">${esc(af.tx)}</p><div class="row"><button class="btn w accent" data-x="1">${T('Спасибо!','Thanks!')}</button><button class="btn w" data-b="1">${T('Назад к карточке','Back to the card')}</button></div>`);
  bind('[data-x]',()=>close());bind('[data-b]',()=>openFriend(id));}

// друзья: «Кто из нас дальше» и карточки
function openFriends(){if(window.FRUI&&FRUI.open)return FRUI.open();const w=W();if(!w)return;   // M18: окно «Друзья» — js/friends-ui.js
  SY.init(w);const st=SY.standings(w);
  let h=`<h2>👥 ${T('Друзья из 11 «Б»','Friends from class 11B')}</h2><p class="st-sub">${T('Кто из нас дальше — капитал сейчас','Who’s ahead — net worth today')}</p><table class="st-tb">`;
  st.forEach((x,i)=>{h+=`<tr${x.id==='you'?' class="me"':''}><td class="n">${i+1}</td><td>${pic(x.id,'calm',40)}</td><td><b>${esc(x.id==='you'?T('Вы','You'):nm(x.id))}</b>${x.id!=='you'?`<span class="ph">${esc(who(x.id).sub)}</span>`:''}</td><td class="v">${money(x.v)}</td></tr>`;});
  h+='</table>';
  for(const id of FRS){const f=SY.friend(w,id);const nq=f.q.length;
    h+=`<div class="st-card st-row">${pic(id,nq?'wow':'calm',48)}<div class="st-f"><b>${esc(nm(id))}</b>${hearts(f.tr)}${nq?`<small>✉️ ${T('ждёт ответа','waiting for your reply')}</small>`:''}</div><button class="btn sm noenter" data-f="${id}">${T('Открыть','Open')}</button></div>`;}
  const all=w.fr.q.filter(q=>q.w==='all'||q.w==='lud'||q.w==='bear');for(const q of all)h+=`<div class="row"><button class="btn w accent noenter" data-q="${q.id}">${q.k==='reu'||q.k==='pro'?'🥂 '+T('Встреча выпускников','Class reunion'):TITLE[q.k]?T(TITLE[q.k][0],TITLE[q.k][1]):T('Открыть событие','Open the event')}</button></div>`;
  h+=`<div class="row"><button class="btn w" data-x="1">${T('Закрыть','Close')}</button></div>`;
  open(h,openFriends);bind('[data-f]',b=>openFriend(b.dataset.f));bind('[data-q]',b=>big(b.dataset.q));bind('[data-x]',()=>close());}
function openFriend(id){if(window.FRUI&&FRUI.card)return FRUI.card(id);const w=W();if(!w)return;
  const f=SY.friend(w,id),c=who(id);
  let h=`<div class="st-hd">${pic(id,'happy',72)}<div><b>${esc(c.n)}</b><small>${esc(c.sub)}</small>${hearts(f.tr)}</div></div>`;
  h+=`<div class="st-facts"><div><span>${T('Капитал','Net worth')}</span><b>${money(f.cap)}</b></div>${f.owe?`<div><span>${T('Вы должны','You owe')}</span><b>${money(f.owe)}</b></div>`:''}${f.lent?`<div><span>${T('Должен вам','Owes you')}</span><b>${money(f.lent)}</b></div>`:''}</div>`;
  for(const q of f.q){const s=ask(w,q);h+=`<div class="st-card"><p class="st-say">${esc(s.tx)}</p><button class="btn w accent noenter" data-q="${q.id}">${T('Ответить','Reply')}</button></div>`;}
  for(const j of f.jv){const y=j.p.reduce((a,x)=>a+x,0);const dOk=j.dm<0||w.m-j.dm>=12;
    h+=`<div class="st-card"><b>🤝 ${esc(jvName(j.t))}</b><div class="st-facts"><div><span>${T('Доля','Share')}</span><b>${pct(j.sh)}</b></div><div><span>${T('Вложение','Investment')}</span><b>${money(j.inv)}</b></div><div><span>${T('Прибыль дела за год','Venture profit, 12 mo.')}</span><b>${money(y)}</b></div><div><span>${T('Дивиденды','Dividends')}</span><b>${pct(j.d)}</b></div></div>
      <p class="st-hint">${T('Прибыль есть, а денег нет — пока партнёры не решили платить дивиденды.','Profit isn’t cash — until the partners agree to pay dividends.')}</p>
      <div class="st-pick">${[0,.5,1].map(v=>`<button class="btn noenter${j.d===v?' on':''}" data-jd="${j.id}" data-v="${v}"${dOk?'':' disabled'}>${pct(v)}</button>`).join('')}</div>${dOk?'':`<p class="st-hint">${why('wait')}</p>`}
      <div class="st-pick">${j.sh<1?`<button class="btn noenter" data-jb="${j.id}">${T(`Выкупить долю друга: ${money(SY.jvPrice(j,'buy'))}`,`Buy out your friend: ${money(SY.jvPrice(j,'buy'))}`)}</button>`:''}<button class="btn noenter" data-js="${j.id}">${T(`Продать свою долю: ${money(SY.jvPrice(j,'sell'))}`,`Sell your share: ${money(SY.jvPrice(j,'sell'))}`)}</button></div>
      ${w.m-j.m0<12?`<p class="st-hint">${T('Выход раньше года огорчит друга (❤ −15).','Leaving before a year upsets your friend (❤ −15).')}</p>`:''}</div>`;}
  const ops=SY.callOpts(w,id);if(ops.length){h+=`<p class="st-hint">📞 ${T('Позвонить и попросить (раз в квартал):','Call and ask (once a quarter):')}</p><div class="row">`;
    for(const op of ops){const ok=op.ok===true;h+=`<button class="btn w noenter" data-c="${op.k}"${ok?'':' disabled'}>${esc(callLabel(op.k,op))}${ok?'':`<span class="st-why">${esc(op.ok==='trust'?T(`нужно ❤ ${op.need}`,`needs ❤ ${op.need}`):why(op.ok))}</span>`}</button>`;}h+='</div>';}
  const fd=w.fr.fd.map((x,i)=>({x,i})).filter(o=>o.x.w===id).slice(-3).reverse();
  for(const o of fd)h+=`<div class="st-card"><small class="st-hint">${window.FMT?FMT.date(o.x.m):''}</small><p class="st-say">${esc(feedTx(w,o.x))}</p>${o.x.c&&!o.x.g?`<button class="btn sm noenter" data-g="${o.i}">🎉 ${T('Поздравить','Congratulate')}</button>`:''}</div>`;
  h+=`<div class="row"><button class="btn w" data-bk="1">${T('Ко всем друзьям','All friends')}</button></div>`;
  open(h,()=>openFriend(id));
  bind('[data-q]',b=>openAsk(b.dataset.q));bind('[data-c]',b=>doCall(id,b.dataset.c));bind('[data-bk]',()=>openFriends());
  bind('[data-g]',b=>{const r=GAME.act('congrats',+b.dataset.g);if(r==='ok'){snd('coin');toast(T('Поздравили! ❤ +2','Congratulated! ❤ +2'));}else if(r==='quarter')toast(T('Уже поздравляли в этом квартале','Already congratulated this quarter'));openFriend(id);});
  bind('[data-jd]',b=>{const r=GAME.act('jvDiv',b.dataset.jd,+b.dataset.v);if(r!=='ok')toast(why(r));openFriend(id);});
  bind('[data-jb]',b=>{const r=GAME.act('jvExit',b.dataset.jb,'buy');if(r!=='ok'){snd('no');toast(why(r));}else snd('coin');openFriend(id);});
  bind('[data-js]',b=>{const r=GAME.act('jvExit',b.dataset.js,'sell');if(r!=='ok'){snd('no');toast(why(r));}else snd('coin');openFriend(id);});}

/* ---------------- пролог «Пари 11 „Б“» (этап 5) ----------------
   STORYUI.prologue(done, {replay}) — 4 коротких экрана до первого заказа: встреча и выбор пола/имени → кто есть кто → пари на кубок → Людмила у подъезда (старт и цель).
   «Пропустить» на каждом экране. Итог — GAME.act('storyPrologue', герой) (встреча «10 лет» считается сыгранной); replay — только сохранить героя.
   STORYUI.openHero() — тот же первый экран отдельно (для ⚙ «Как меня зовут»). */
function prologue(done,o){o=o||{};const w=W();let fired=false;const fin=()=>{if(fired)return;fired=true;try{if(typeof done==='function')done();}catch(e){console.error(e);}};
  if(!w||!w.fr){fin();return false;}
  const h0=w.fr.hero||{};const dr={g:h0.g==='f'?'f':'m',n:h0.n||'',nc:h0.nc||''};let touched=!!h0.set,step=0;
  const gd=(m,f)=>dr.g==='f'?f:m;
  const nameOf=()=>dr.nc||(HN[dr.n]?T(HN[dr.n][0],HN[dr.n][1]):'');
  const commit=()=>{try{if(o.replay||o.only0){if(touched)GAME.act('storyHero',dr);}else GAME.act('storyPrologue',touched?dr:null);}catch(e){console.error(e);}};
  const end=()=>{commit();close();fin();};
  const skipB=()=>`<button class="btn w st-skip noenter" data-skip="1">${o.only0?T('Отмена','Cancel'):T('Пропустить','Skip')}</button>`;
  const dots=()=>o.only0?'':`<div class="st-dots">${[0,1,2,3].map(i=>`<i${i===step?' class="on"':''}></i>`).join('')}</div>`;
  const four=m=>`<div class="st-four">${['owl','beav','bars','vit'].map(id=>pic(id,m||'happy',52)).join('')}</div>`;
  function draw(){let h='';
    if(step===0){const ks=dr.g==='f'?['f1','f2','f3']:['m1','m2','m3'];
      h=`<h2>🥂 ${T('Кафе «Юность», январь 2027','Youth Café, January 2027')}</h2>${four('happy')}
        <p class="st-say">${T('Десять лет, как 11 «Б» окончил школу. Соня машет от окна: «Проходи! Как тебя теперь называть — всё так же, председатель?»','Ten years since class 11B left school. Sonya waves from the window: “Come in! What do we call you now — still president?”')}</p>
        <p class="st-hint">${T('Кто вы?','Who are you?')}</p>
        <div class="st-pick"><button class="btn noenter${dr.g==='m'?' on':''}" data-g="m">👨 ${T('Мужчина','Man')}</button><button class="btn noenter${dr.g==='f'?' on':''}" data-g="f">👩 ${T('Женщина','Woman')}</button></div>
        <p class="st-hint">${T('Как вас зовут друзья?','What do your friends call you?')}</p>
        <div class="st-pick">${ks.map(k=>`<button class="btn noenter${dr.n===k&&!dr.nc?' on':''}" data-n="${k}">${esc(T(HN[k][0],HN[k][1]))}</button>`).join('')}<button class="btn noenter${!dr.n&&!dr.nc?' on':''}" data-n="">${T('Просто «председатель»','Just “president”')}</button></div>
        <input class="st-in" id="stName" maxlength="16" autocomplete="off" placeholder="${esc(T('…или своё имя','…or type your own name'))}" value="${esc(dr.nc)}" aria-label="${esc(T('Своё имя','Your own name'))}">
        ${dots()}<div class="row"><button class="btn w accent noenter" data-next="1">${o.only0?T('Сохранить','Save'):T('Дальше','Next')}</button>${skipB()}</div>`;}
    else if(step===1){const L1={owl:['кредитный инспектор в банке, считает быстрее калькулятора. Дочь Людмилы Санны','a loan officer at a bank, counts faster than a calculator. Lyudmila Sanna’s daughter'],
        beav:['ларёк у остановки. Соперник с пятого класса — это он увёл у вас кубок на лыжной эстафете','a bus-stop kiosk. Your rival since fifth grade — he’s the one who took the relay cup from you'],
        bars:['горный инженер на карьере «Сосновый лог». Молчит и всё считает','a mining engineer at Pine Hollow quarry. Says little, counts everything'],
        vit:['таксист и душа компании: «Алло-алло!»','a taxi driver and the life of the party: “Hello-hello!”'],
        lud:['мама Сони, главбух с тридцатилетним стажем. Помнит вас по родительскому комитету','Sonya’s mum, a chief accountant for thirty years. Remembers you from the parents’ committee']};
      h=`<h2>👥 ${T('Кто есть кто','Who’s who')}</h2>`+['owl','beav','bars','vit','lud'].map(id=>`<div class="st-row st-line">${pic(id,'happy',44)}<div class="st-f"><b>${esc(nm(id))}</b><small>${esc(T(L1[id][0],L1[id][1]))}</small></div></div>`).join('')
        +`<p class="st-say">${T('А вы были председателем совета класса: собирали на выпускной и всех мирили. Прозвище осталось.','And you were class president: you collected money for the prom and made peace between everyone. The nickname stuck.')}</p>
        ${dots()}<div class="row"><button class="btn w accent noenter" data-next="1">${T('Дальше','Next')}</button>${skipB()}</div>`;}
    else if(step===2){const nn=nameOf();
      h=`<h2>🏆 ${T('Пари 11 «Б»','The Class 11B bet')}</h2><div class="st-hd">${pic('beav','happy',64)}<div><b>${esc(nm('beav'))}</b><small>${T('стучит вилкой по бокалу','taps his glass with a fork')}</small></div></div><p class="st-say">${T('«Десять лет назад я увёл у председателя кубок за лыжную эстафету. Пари: через пять лет кубок забирает тот, кто дальше всех продвинется. И так — каждые пять лет!»','“Ten years ago I snatched the relay-race cup from our president. Here’s a bet: in five years the cup goes to whoever has come furthest. And again every five years!”')}</p></div>
        <div class="st-cup" aria-hidden="true">🏆</div>
        <p class="st-hint">${T(`Соня: «Считать буду я». Витя: «Ставлю на председателя!» Пётр молча кивает.`,`Sonya: “I’ll keep the score.” Vitya: “My money’s on ${nn?esc(nn):'the president'}!” Pyotr just nods.`)}</p>
        ${dots()}<div class="row"><button class="btn w accent noenter" data-next="1">${T('Принимаю пари!','I accept the bet!')}</button>${skipB()}</div>`;}
    else{const nn=nameOf();
      h=`<h2>🏠 ${T('У подъезда общежития','Outside the dorm')}</h2><div class="st-hd">${pic('lud','happy',64)}<div><b>${esc(nm('lud'))}</b><small>${T('догоняет вас у подъезда','catches up with you at the door')}</small></div></div><p class="st-say">${T(`«${nn?esc(nn)+', с':'С'}лышала про пари. Борис с пятого класса такой. Давайте так: вечерами вы берёте заказы, а я учу считать деньги. Кубок будет наш».`,`“${nn?esc(nn)+', I':'I'} heard about the bet. Boris has been like that since fifth grade. Here’s the deal: you take jobs in the evenings, I teach you to count money. That cup will be ours.”`)}</p></div>
        <div class="st-facts st-start"><div>💰 <b>5 000 ₽</b> ${T('на счёте','in the account')}</div><div>🏠 ${T('комната в общежитии','a dorm room')}</div><div>📦 ${T('работа кладовщиком','a storekeeper’s job')}</div></div>
        <p class="st-say">🎯 ${T('Цель: свой ларёк → сеть → карьер → недра → биржа. А через 5 лет — кубок 11 «Б».','The goal: your own kiosk → a chain → a quarry → mining → the stock exchange. And in 5 years — the Class 11B cup.')}</p>
        ${dots()}<div class="row"><button class="btn w accent noenter" data-next="1">${o.replay?T('Закрыть','Close'):T('Дальше','Next')}</button>${o.replay?'':skipB()}</div>`;}
    open(h,draw);
    bind('[data-g]',b=>{if(dr.g!==b.dataset.g){dr.g=b.dataset.g;if(dr.n&&dr.n[0]!==dr.g)dr.n='';}touched=true;snd('tap');draw();});
    bind('[data-n]',b=>{dr.n=b.dataset.n;dr.nc='';touched=true;snd('tap');draw();});
    const inp=document.getElementById('stName');if(inp){inp.addEventListener('input',()=>{dr.nc=inp.value.replace(/[<>&"`\\]/g,'').slice(0,16);touched=true;});
      inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();inp.blur();}});}
    bind('[data-next]',()=>{snd('tap');if(inp)dr.nc=inp.value.replace(/[<>&"`\\]/g,'').trim().slice(0,16);if(o.only0||step>=3){if(!o.only0&&!o.replay&&!o._stat){o._stat=1;STAT.ev('pro',{a:'done',h:touched?1:0});}end();return;}step++;draw();}); // статистика: пролог дочитан
    bind('[data-skip]',()=>{snd('tap');if(inp)dr.nc=inp.value.replace(/[<>&"`\\]/g,'').trim().slice(0,16);if(o.only0){close();fin();return;}if(!o.replay&&!o._stat){o._stat=1;STAT.ev('pro',{a:'skip',s:step+1});}end();});} // статистика: на каком экране пролога пропустили
  draw();
  // окно закрыли крестиком или свайпом — как «Пропустить» (обучение не должно зависнуть)
  const iv=setInterval(()=>{if(fired){clearInterval(iv);return;}if(typeof modalOn!=='undefined'&&!modalOn){clearInterval(iv);if(!o.only0)commit();fin();}},500);
  return true;}
function openHero(done){return prologue(done,{only0:1});}
function prologueDue(){const w=W();try{return !!(w&&SY.prologueDue&&SY.prologueDue(w));}catch(e){return false;}}

/* ---------------- IPO: три кадра с отзвуком прошлых выборов ---------------- */
function ipoMorning(F,a){let t;
  if((a.h0||1)>=2)t=F.lud.ret?T('Аня разбудила меня в пять утра: «Людмила Санна, сегодня звонок!» Как будто я забуду. Второй раз — а волнуюсь, как в первый.','Anya woke me at five: “Lyudmila Sanna, the bell is today!” As if I’d forget. The second time — and I’m as nervous as the first.')
    :T('Ещё один колокол — а волнуюсь, как в первый раз. Блузку погладила дважды.','Another bell — and I’m as nervous as the first time. Ironed my blouse twice.');
  else t=T('Я в последний раз так волновалась на выпускном у Сони. Блузку погладила трижды.','The last time I was this nervous was at Sonya’s prom. I ironed my blouse three times.');
  if(F.lud.loyal===1)t+=' '+T('Хорошо, что я тогда не ушла к Топтыгину — пирожки у него не те.','Good thing I didn’t go to Toptygin back then — his pies are all wrong.');
  else if(F.lud.loyal===2)t+=' '+T('Спасибо, что тогда дали мне решить самой. Поэтому я здесь.','Thank you for letting me decide for myself back then. That’s why I’m here.');
  if(F.cloth)t+=' '+T('А первую выручку из-под скатерти я сохранила — на счастье.','And I kept the first takings from under the tablecloth — for luck.');
  if(F.lud.gift===1)t+=' '+T('Путёвку в санаторий берегу на после звонка.','I’m saving the spa trip for after the bell.');else if(F.lud.gift===2)t+=' '+T('Ваш торт я до сих пор вспоминаю.','I still remember your cake.');
  return t;}
function ipoLine(F,id){const x=F[id]||{},hot=(x.tr||0)>=60;
  if(id==='beav')return x.hlp?T(`Я тогда ночью сказал, что не забуду. Не забыл. Звони громче, ${hv()}!`,`That night I said I wouldn’t forget. I haven’t. Ring it louder, ${hv()}!`):hot?T('Ну ты даёшь! Следующий — я. Честно.','Look at you! I’m next. Fair and square.'):T('Поздравляю. Но кубок я ещё отыграю.','Congratulations. But I’ll win the cup back.');
  if(id==='owl')return F.part==='owl'?T('Мой фонд — твой первый инвестор. Мама сказала: «Только в тебя».','My fund is your first investor. Mum said: “Only you.”'):hot?T(`Я всё посчитала: ты это ${G('заслужил','заслужила')}.`,'I did the maths: you’ve earned this.'):T('Поздравляю. Цифры не врут.','Congratulations. Numbers don’t lie.');
  if(id==='bars')return x.plan||x.opi?T('Помнишь проект в синей папке? Окупился. Я посчитал.','Remember the design in the blue folder? It paid off. I checked.'):T('Посчитал. Всё сходится. Молодец.','Did the maths. It all adds up. Well done.');
  return x.disc?T('«ВитТранс» привёз в зал цветы. Бесплатно — для своих!','VitTrans delivered flowers to the hall. Free — for friends!'):x.wed===1?T(`Марина передаёт: ${G('лучший свидетель','лучшая свидетельница')} — теперь и на бирже!`,`Marina says: the best ${G('best man','best woman')} — now on the stock exchange too!`):T('Алло-алло! Это история, запишите!','Hello-hello! This is history, write it down!');}
function ipoBear(F){if(F.tp.anchor===1)return T('Топтыгин кивает из первого ряда: «Хорошее размещение. Моё».','Toptygin nods from the front row: “A good listing. Mine.”');
  if(F.part==='bear')return T('Топтыгин в зале — со своей стороны. Хлопает сдержанно.','Toptygin is in the hall — on his own side. Claps with restraint.');
  if(F.tp.anchor===2)return T('Топтыгин прислал открытку: «Уважаю».','Toptygin sent a card: “Respect.”');
  if(F.tp.end)return T('Топтыгин жмёт руку: «Вы первый, кто трижды мне отказал».','Toptygin shakes your hand: “You’re the first to turn me down three times.”');
  return '';}
function openIpoScene(qid){const w=W();const q=w&&w.fr&&w.fr.q.find(x=>x.id===qid);if(!q)return false;const F=w.fr,a=q.a||{};let picked='';
  // M30 (решение владельца 02.10): после IPO — одно понятное окно вместо пяти: фото и путь, что сказали друзья (под «▼»), выбор «Доли основателя»
  function draw(){const near=FRS.filter(id=>SY.hearts(F[id]&&F[id].tr)>=3),far=FRS.filter(id=>near.indexOf(id)<0);
    const path=a.st&&(a.h0||1)===1?T(`Мы начинали с 5 000 ₽ и комнаты в общежитии. Сегодня компания стоит ${money(a.eq||0)}.`,`We started with 5,000 ₽ and a dorm room. Today the company is worth ${money(a.eq||0)}.`)
      :T(`Холдинг №${a.h0||1} — на бирже: ${money(a.eq||0)}. Новый холдинг — новая дорога.`,`Holding No. ${a.h0||1} is listed: ${money(a.eq||0)}. A new holding — a new road.`);
    const b=ipoBear(F),pk=window.META&&META.perkBtns?META.perkBtns():'';
    let h=`<h2>🔔 ${T('Холдинг на бирже!','The holding is public!')}</h2><div class="st-photo">${pic('you','happy',50)}${pic('lud','happy',50)}${near.map(id=>pic(id,'happy',50)).join('')}</div>`
      +(far.length?`<p class="st-hint" style="text-align:center">💐 ${esc(far.map(nk).join(', '))} ${T(far.length>1?'прислали цветы':FEM[far[0]]?'прислала цветы':'прислал цветы','sent flowers')}</p>`:'')
      +`<p class="st-say"><b>${esc(path)}</b></p>`
      +`<details class="st-hint"><summary>${T('Что сказали в зале','What people said in the hall')}</summary><p class="st-say">${esc(ipoMorning(F,a))}</p>`
      +FRS.map(id=>`<div class="st-row st-line">${pic(id,(F[id]&&F[id].tr>=41)?'happy':'calm',36)}<p class="st-say st-f"><b>${esc(nk(id))}:</b> ${esc(ipoLine(F,id))}</p></div>`).join('')
      +(b?`<div class="st-row st-line">${pic('bear','calm',36)}<p class="st-hint st-f">${esc(b)}</p></div>`:'')+`</details>`
      +(F.tp.anchor===1&&!F.tp.paid?`<p class="st-toast">+10 💎 ${T('премия за размещение','listing bonus')}</p>`:'')
      +(pk?`<h3 style="margin:12px 0 4px">⭐ ${T('Доля основателя','Founder’s share')}</h3><p class="st-hint">${T('Опыт остаётся с вами: выберите одно улучшение — оно будет работать во всех следующих холдингах.','The experience stays with you: choose one upgrade — it works in all your future holdings.')}</p>${pk}`
        :picked?`<p class="st-hint" style="text-align:center">⭐ ${T('Улучшение выбрано','Upgrade chosen')}: <b>${esc(picked)}</b></p>`:'')
      +`<p class="st-hint" style="text-align:center">${T('Фото — в «Зале славы». Людмила Санна не скрывает слёз.','The photo goes to the Hall of Fame. Lyudmila Sanna doesn’t hide her tears.')}</p>`
      +(typeof socBragHtml==='function'?socBragHtml('ipo'):'')+`<div class="row"><button class="btn w accent noenter" data-ok="1">${T('Спасибо всем!','Thank you all!')}</button></div>`;
    open(h,draw);
    bind('[data-pk]',el=>{const k=el.dataset.pk;if(GAME.perkPick(k)==='ok'){snd('coin');picked=window.META&&META.pkName?META.pkName(k):k;try{toast('⭐ '+picked);}catch(e){}draw();}});
    bind('[data-ok]',()=>{if(F.tp.anchor===1&&!F.tp.paid){F.tp.paid=1;try{GAME.addCr(10,'anchor');}catch(e){}}answer(q,'a');});}
  draw();return true;}

/* ---------------- «Пока вас не было»: новости друзей и «Скоро…»; «Завтра…» при паузе ---------------- */
const clip=(t,n)=>t.length>n?t.slice(0,n-1)+'…':t;
const MAJOR={gazel:1,best:1,shift:1,kiosk2:1,son1:1,head:1,cars5:1,project:1,plant:1,back:1,leave:1,son2:1,vitlook:1,wagons:1,fund:1,wed2:1,intern2:1,back2:1,thanks:1,gg:1,gpay:1,bobr:1};
function awayItems(w){const F=w&&w.fr;if(!F||!F.v||!F.aw)return {it:[],asks:0};const a=F.aw;
  const it=F.fd.map((f,i)=>({f,i})).filter(o=>o.f.t>=a.t0&&o.f.t<=a.t1+1)
    .map(o=>(o.p=MAJOR[o.f.k]?3:o.f.k==='life'?2:o.f.k==='self'?0:1,o)).filter(o=>o.p>0).sort((x,y)=>y.p-x.p||y.f.t-x.f.t).slice(0,3).sort((x,y)=>x.f.t-y.f.t);
  return {it,asks:F.q.filter(q=>q.t>=a.t0).length};}
function awayHtml(){const w=W();if(!w||!w.fr)return '';const x=awayItems(w),tz=teaser(w);if(!x.it.length&&!x.asks&&!tz)return '';css();
  return `<div class="st-away"><div class="st-lbl">📱 ${T('Новости друзей','Friends’ news')}</div>`
    +x.it.map(o=>`<div class="st-row st-line">${pic(o.f.w,FMOOD[o.f.k]||'happy',36)}<p class="st-f"><b>${esc(nk(o.f.w))}:</b> ${esc(clip(feedTx(w,o.f),120))}</p></div>`).join('')
    +(x.asks?`<p class="st-hint">✉️ ${T(`Ждут вашего ответа: ${x.asks}`,`Waiting for your reply: ${x.asks}`)}</p>`:'')
    +(tz?`<p class="st-next">🔮 <b>${T('Дальше:','Next:')}</b> ${esc(tz.tx)}</p>`:'')+'</div>';}
// «Завтра…»: одна строка про ближайшее событие сюжета (для окна закрытия месяца, «Пока вас не было», паузы). → {w, tx, mood} | null
function teaser(w){w=w||W();const F=w&&w.fr;if(!F||!F.v)return null;const m=w.m,mmv=m-F.m0;let st=0;try{st=SY.si(w);}catch(e){}
  const c=[];const add=(id,ru,e2,mood)=>c.push({w:id,tx:T(ru,e2),mood:mood||'happy'});
  try{if(w.ned&&E.ipoReady&&E.ipoReady(w))add('lud','Завтра — колокол на бирже? Я уже погладила блузку.','Tomorrow — the exchange bell? I’ve already ironed my blouse.','wow');}catch(e){}
  try{if(F.rags&&!w.ned&&E.nedraOk&&E.nedraOk(w))add('lud','Роснедра вот-вот пришлют письмо. Я держу ручку наготове.','The subsoil agency is about to send a letter. I have my pen ready.','wow');}catch(e){}
  if(F.rags&&!w.ned&&w.st==='quarry'&&F.dn.bars2===undefined)add('bars','Пётр обещал утром сказать, выставят ли «Сосновый лог» на торги.','Pyotr promised to tell you in the morning whether Pine Hollow goes to auction.','calm');
  if(F.dn.bars2!==undefined&&F.bars.opi&&w.t-F.dn.bars2<90)add('bars','Пётр обещал показать проект разреза — он уже в столе.','Pyotr promised to show you the pit design — it’s already in his drawer.','calm');
  if(F.rags&&!w.ned&&st>=2&&F.dn.tpt1===undefined&&mmv>=70)add('vit','Витя что-то темнит про какого-то Топтыгина из Москвы — спросите завтра.','Vitya is hiding something about some Toptygin from Moscow — ask him tomorrow.','worry');
  try{if(w.ned&&w.hold===1&&F.dn.tpt4===undefined&&E.equity(w)>=(E.IPO_EQ||2.2e9)*.5)add('lud','Говорят, Топтыгин интересуется вашими акциями. Завтра узнаем зачем.','They say Toptygin is interested in your shares. We’ll find out why tomorrow.','worry');}catch(e){}
  if(w.hold===1&&F.dn.vit4===undefined&&F.vit.tr>=35&&mmv>=55)add('vit','Витя обещал рассказать какую-то новость про Марину. Сияет.','Vitya promised to share some news about Marina. He’s beaming.');
  if(w.hold>=2&&F.dn.lud2===undefined&&m-(F.h0||0)>=18)add('lud','Людмила Санна что-то долго перебирает папки…','Lyudmila Sanna has been sorting through her folders for a long time…','calm');
  const left=(Math.floor(m/60)+1)*60-m;if(left<=12)add('beav',`До встречи выпускников — ${mon(left)}. Борис уже купил новый костюм.`,`${mon(left)} to the class reunion. Boris has already bought a new suit.`);
  for(const x of F.ln)if(x.due>=m&&x.due-m<=2){add(x.w,`${nk(x.w)} ${FEM[x.w]?'обещала':'обещал'} вернуть ${money(x.a)} — скоро срок.`,`${nk(x.w)} promised to repay ${money(x.a)} — it’s due soon.`,'calm');break;}
  const pq=F.q.find(q=>!q.big&&FRS.indexOf(q.w)>=0);if(pq)add(pq.w,`${nk(pq.w)} ждёт вашего ответа в телефоне.`,`${nk(pq.w)} is waiting for your reply on the phone.`,'calm');
  if(!c.length){const L3=[['Завтра начнём с отчёта — я испеку пирожки.','Tomorrow we start with the report — I’ll bake pies.'],['Отдыхайте. Цифры никуда не убегут — я за ними присмотрю.','Get some rest. The numbers won’t run away — I’ll keep an eye on them.'],['Завтра новый день — и новые возможности. Спокойной ночи!','Tomorrow is a new day — and new chances. Good night!']];
    const x=L3[Math.abs(m)%3];add('lud',x[0],x[1],'calm');}
  return c[0];}
// партнёр для недр (для окна главы 5): {id:'owl'|'bear', n}
function partner(){const w=W();const p=w&&w.fr&&w.fr.part==='bear'?'bear':'owl';return {id:p,n:p==='bear'?T('«Медведь Капитал» Топтыгина','Toptygin’s Bear Capital'):T('фонд Сони «Сова Инвест»','Sonya’s Owl Invest fund')};}
// окно «Пока вас не было» рисует ui.js/biz-ui.js: если они сами не вставили STORYUI.awayHtml(), добавляем блок перед кнопками (#bzOk, #oOk)
function awayAuto(){const c=document.getElementById('mcard');if(!c||c._stObs||typeof MutationObserver==='undefined')return;c._stObs=1;
  new MutationObserver(()=>{try{if(c.querySelector('.st-away'))return;const ok=c.querySelector('#bzOk,#oOk');if(!ok)return;const row=ok.closest('.row');if(!row)return;const html=awayHtml();if(html)row.insertAdjacentHTML('beforebegin',html);}catch(e){}}).observe(c,{childList:true});}

/* ---------------- запасной вход без телефона ---------------- */
const hasPhone=()=>!!window.PHONE;
let shown={},bigT=0;
// спокойный момент для большой сцены: нет окна, паузы, рекламы, открытого телефона и первых шагов обучения
function calmNow(){if(typeof modalOn!=='undefined'&&modalOn)return false;if(typeof paused!=='undefined'&&paused)return false;if(document.hidden)return false;
  try{if(GAME.hold&&GAME.hold.size)return false;}catch(e){}
  try{if(window.UI&&UI.tutStep&&UI.tutStep())return false;}catch(e){}
  try{if(window.BIZUI&&BIZUI.tutStep&&['hi','take1','wait1','take2'].indexOf(BIZUI.tutStep())>=0)return false;}catch(e){}
  try{if(window.PHONE&&PHONE.isOpen===true)return false;}catch(e){}
  const ad=document.getElementById('ad');if(ad&&ad.classList.contains('on'))return false;return true;}
// большие сцены (встречи выпускников, ночной звонок, «большая лига», Топтыгин) открываются окном сами — не чаще раза в 3 минуты; копия остаётся в телефоне.
// Без телефона — окном и обычные сцены/просьбы, по одной.
function next(){const w=W();if(!w||!w.fr||!calmNow())return;
  // IPO — кульминация: три кадра сразу после окна биржи, без очереди
  {const q=w.fr.q.find(x=>x.k==='ipo'&&!shown[x.id]);if(q){shown[q.id]=Date.now();bigT=Date.now();openIpoScene(q.id);return;}}
  // закрытую крестиком большую сцену показываем снова через 10 минут (сцены Людмилы и Топтыгина в телефоне видны не всегда)
  const fresh=x=>!shown[x.id]||(x.big&&Date.now()-shown[x.id]>600000);
  if(hasPhone()){if(Date.now()-bigT<180000)return;const q=w.fr.q.find(x=>x.big&&fresh(x));if(!q)return;shown[q.id]=Date.now();bigT=Date.now();big(q.id);return;}
  const q=w.fr.q.find(fresh);if(!q)return;shown[q.id]=Date.now();if(q.big)big(q.id);else openAsk(q.id);}
function badge(){const b=document.getElementById('stBtn');if(!b||!W())return;let n=0;try{n=W().fr?W().fr.q.length:0;}catch(e){}const e=b.querySelector('em');if(n){if(e)e.textContent=n;else b.insertAdjacentHTML('beforeend','<em>'+n+'</em>');}else if(e)e.remove();}
function fallback(){if(hasPhone()||document.getElementById('stBtn'))return;const cr=document.getElementById('crBtn');if(!cr)return;
  cr.insertAdjacentHTML('beforebegin',`<button class="hbtn noenter" id="stBtn" aria-label="${T('Друзья','Friends')}">👥</button>`);
  document.getElementById('stBtn').onclick=()=>{snd('tap');openFriends();};badge();}
// «Завтра…» — когда игрок ставит время на паузу (⏸): одна строка про ближайшее событие
let spd0=null;
function pauseTeaser(){try{const v=GAME.speed?GAME.speed():1;if(spd0!==null&&spd0!==0&&v===0&&!modalOn){const t=teaser();if(t&&typeof toast==='function')toast('🔮 '+t.tx,5000);}spd0=v;}catch(e){}}
if(window.GAME&&GAME.on){GAME.on('day',()=>{if(!hasPhone())badge();setTimeout(next,50);});GAME.on('change',()=>{if(!hasPhone())badge();pauseTeaser();});
  GAME.on('close',()=>{setTimeout(next,400);});GAME.on('ipo',()=>{setTimeout(next,600);});}
setTimeout(fallback,2500);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',awayAuto);else awayAuto();setTimeout(awayAuto,1500);
// IPO: друзья переходят в новый холдинг (доверие, встречи, лента); займы и СП остались в прежней компании
if(window.GAME&&GAME.doIpo&&E.storyCarry){const d0=GAME.doIpo;GAME.doIpo=function(){const w0=GAME.W,F0=w0&&w0.fr;const r=d0.apply(GAME,arguments);
  if(r&&F0&&GAME.W&&GAME.W!==w0){try{E.storyCarry(GAME.W,F0,{hold:r.hold,eq:r.eq});GAME.act('storyTouch');}catch(e){console.error(e);}}return r;};}

// M20: строка в окне «Закрытие месяца» (biz-ui.js closeExtra): сколько сэкономили друзья за этот месяц
function closeLine(rep){const w=W();if(!w||!w.fr||!rep||!SY.monthGain)return '';let g=null;try{g=SY.monthGain(w,rep.m);}catch(e){g=null;}if(!g)return '';
  const top=g.top&&g.tv<g.a?T(` (больше всех — ${nk(g.top)}: ${money(g.tv)})`,` (most of all — ${nk(g.top)}: ${money(g.tv)})`):g.top?T(` (это ${nk(g.top)})`,` (that was ${nk(g.top)})`):'';
  return `<p class="about st-cl">💬 ${T(`Друзья за месяц: сэкономили ${money(g.a)}`,`Friends this month: saved you ${money(g.a)}`)}${esc(top)}</p>`;}
window.STORYUI={closeLine,who,msg,why,after,big,callLabel,call,hello,feed:feedApi,date,openFriends,openFriend,openAsk,openReunion,ask,feedTx:(f)=>feedTx(W(),f),
  prologue,prologueDue,openHero,openIpoScene,awayHtml,teaser:()=>teaser(),partner,G,heroName,hv,speaker:spk,title:k=>TITLE[k]?T(TITLE[k][0],TITLE[k][1]):'',
  lvName,pic,nm,jvName,pct,perkName,taxTx,relW,log:x=>logMsg(W(),x)};   // M18: для окна «Друзья» (js/friends-ui.js)
})();
