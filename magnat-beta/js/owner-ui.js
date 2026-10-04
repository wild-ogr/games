/* ================= «Из ларька в магнаты: бизнес» — хозяин и рынок: интерфейс (M17) =================
   Модель — js/owner.js (ECON: уровни, насыщение, маркетинг, курсы, дела хозяина, события). Грузится после biz-ui.js; biz-ui зовёт хуки OWNUI.*:
   today: evCard (событие с выбором), ownCard (дела хозяина), eduCard (учёба); точка: ptCards, ptRows; бизнес: bizCards; каталог: catLine, passport;
   окно ИП с выбором налога (openIP); отчёт месяца: closeLines; «Сегодня» → «Этот месяц»: pasRow. Людмила объясняет новое один раз (S.o2t), не окнами.
   STAT: GAME.emit('o2', {k:…}) — js/stat-hooks.js. Для 45+: шрифт ≥ 15 px, кнопки ≥ 48 px, без inset и gap. */
(function(){
'use strict';
const E=window.ECON;if(!E||!E.ptMod){window.OWNUI=null;return;}
const w=()=>GAME.W,$$=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const M=x=>FMT.money(x),Mr=x=>M(Math.round(x/(Math.abs(x)>=1e5?1000:100))*(Math.abs(x)>=1e5?1000:100));
const T=a=>a?L(a[0],a[1]):'';
const days=n=>n+' '+pl(n,'день','дня','дней','day','days'),mons=n=>n+' '+pl(n,'месяц','месяца','месяцев','month','months');
const snd=k=>{try{if(SND&&SND[k])SND[k]();}catch(e){}};
const pct=x=>Math.round(x*100)+L(' %','%');
const bn=t=>E.BIZ[t]?L(E.BIZ[t].n,E.BIZ[t].en):t,cn=c=>{try{return NM.city(c);}catch(e){return c;}};
const ICO_FIX={tire:'🔩'},bico=t=>ICO_FIX[t]||(E.BIZ[t]&&E.BIZ[t].ico)||'🏪';
const FRN={owl:['Соня','Sonya'],beav:['Борис','Boris'],bars:['Пётр','Pyotr'],vit:['Витя','Vitya']};
const face=m=>{try{return UI.face(m);}catch(e){return '';}};
function act(name,...a){try{return GAME.act(name,...a);}catch(e){console.error(e);return null;}}
function stat(k,o){try{GAME.emit('o2',Object.assign({k},o||{}));}catch(e){}}
function stI(){const W=w();return W?E.stI(W):0;}
function prog(p){return `<div class="bz-prog"><i style="width:${Math.max(0,Math.min(100,p*100)).toFixed(1)}%"></i></div>`;}
const pos=x=>(x>0?'+':'')+Mr(x);

/* ---------------- CSS ---------------- */
const CSS=`
.ow-tip{margin:10px 0 4px;background:var(--soft2,#f4f1ea);border-radius:14px;padding:10px 12px}.ow-tip p{margin:0 0 8px;font-size:16px;line-height:1.4}
.ow-tip .btn{min-height:44px}
#owEvBar.ow-evbar{display:flex!important;flex-direction:row;align-items:center;width:calc(100% - 32px);box-sizing:border-box;text-align:left;margin:10px 16px 0;padding:10px 14px;min-height:64px;border:2px solid var(--accent);background:var(--card);color:var(--ink)}#owEvBar .bz-ic{flex:none}#owEvBar .chev{flex:none;font-size:22px;color:var(--muted)}#owEvBar .f1{flex:1;min-width:0;margin:0 10px}#owEvBar b{display:block;font-size:17px;line-height:1.25}#owEvBar small{display:block;color:var(--muted);font-size:15px;line-height:1.3}#owEvBar.hot{border-color:var(--bad)}
.ow-aut{margin:0 0 8px;min-height:52px;font-size:16px}.ow-upmax{margin-top:10px;min-height:52px}.ow-upmax small{display:block;font-weight:500;font-size:14px}.ow-aut small{font-size:14px;line-height:1.3}
.ow-row{display:flex;align-items:center;padding:10px 0;border-top:1px solid var(--line);min-height:60px}.ow-row:first-child{border-top:0}
.ow-row .f1{flex:1;min-width:0;margin:0 10px}.ow-row .f1 b{display:block;font-size:17px;font-weight:600;line-height:1.25}.ow-row .f1 small{display:block;color:var(--muted);font-size:15px;line-height:1.3}
.ow-row .btn.sm{flex:none;min-width:96px;min-height:48px;padding:8px 12px;white-space:normal;line-height:1.2}
.ow-more{margin-top:8px;min-height:48px;font-size:17px}.ow-row.done .f1 b{color:var(--good)}.ow-row.later{opacity:.55}.ow-row .f1 small.bad{color:var(--bad)}
.ow-ic{width:44px;height:44px;border-radius:50%;background:var(--icbg);display:flex;align-items:center;justify-content:center;font-size:22px;flex:none}
.ow-sea{display:flex;align-items:flex-end;height:46px;margin:8px 0 2px}
.ow-sea i{flex:1 1 0;margin:0 1px;background:var(--accent);border-radius:3px 3px 0 0;opacity:.8;min-height:3px}.ow-sea i.lo{background:var(--muted);opacity:.45}
.ow-seal{display:flex;font-size:14px;color:var(--ink2);height:38px;line-height:18px}.ow-seal span{flex:1 1 0;min-width:0;text-align:center;white-space:nowrap;overflow:visible;letter-spacing:-.3px}.ow-seal span:nth-child(even){padding-top:19px}
.ow-chips{display:flex;flex-wrap:wrap;margin:8px -3px 2px}.ow-chips span{margin:3px;background:var(--soft);border-radius:999px;padding:5px 11px;font-size:15px;font-weight:500;color:var(--ink2);white-space:nowrap;max-width:100%;box-sizing:border-box}.ow-chips span.w{white-space:normal;border-radius:14px}
.ow-chips span.g{background:var(--good-t,#e6f3e7);color:var(--good)}.ow-chips span.b{background:var(--bad-t,#fdecec);color:var(--bad)}.ow-chips span.w{background:var(--warn-t,#fff4e0);color:var(--warn,#9a6200)}
.ow-lv{display:flex;margin:6px 0 2px}.ow-lv i{flex:1 1 0;height:10px;border-radius:6px;background:var(--track);margin:0 2px}.ow-lv i.on{background:var(--accent)}
.ow-ev{border-left:5px solid var(--accent)}.ow-ev .row{margin-top:10px}.ow-ev .row .btn{flex:1 1 45%;min-height:52px;white-space:normal;line-height:1.25}
.ow-sat{font-size:16px;margin:6px 0 0}.ow-sat b{color:var(--warn,#9a6200)}
.ow-res{background:var(--good-t,#e6f3e7);border-radius:12px;padding:8px 12px;margin:8px 0;font-size:16px}
.ow-list{padding:2px 16px}
#mcard .ow-row{min-height:56px}
`;
function css(){if($$('owCss'))return;const s=document.createElement('style');s.id='owCss';s.textContent=CSS;document.head.appendChild(s);}

/* ---------------- Людмила объясняет новое — один раз (S.o2t), прямо в карточке ---------------- */
const TIP={
  sat:()=>L('Рынок города не резиновый: каждая следующая точка того же вида забирает покупателей у ваших же. Разные дела выгоднее одинаковых, а второй город — это свой, свежий рынок.','A city’s market isn’t endless: each extra outlet of the same kind takes customers from your own. Different businesses beat identical ones, and a second city is a fresh market of its own.'),
  lv:()=>L('Точку можно улучшать — у каждого дела свои улучшения. Смотрите на «окупится за»: меньше года — берите.','You can upgrade an outlet — every business has its own upgrades. Look at “pays back in”: under a year — go for it.'),
  mgr:()=>L('Управляющий работает за долю: 30 % прибыли точки. В плохой месяц берёт минимальный оклад 15 000 ₽, но в обычный месяц точка с ним всегда в плюсе.','A manager works for a share: 30% of the outlet’s profit. In a bad month he takes a minimum wage of 15,000 ₽, but in a normal month the outlet stays in profit.'),
  mk:()=>L('Реклама окупается там, где высокая наценка и много случайных покупателей: кофе, шаурма, цветы. В пункте выдачи и автомате почти не работает. И не частите: к одной и той же рекламе привыкают.','Advertising pays where mark-ups are high and passers-by are many: coffee, shawarma, flowers. It barely works for pick-up points and vending machines. And don’t overdo it: people get used to the same ad.'),
  job:()=>L('Когда точки работают без вас, ваше время свободно для дел хозяина: переговоры, проверки, поиск места. Сил они берут меньше, чем заказы, а двигают бизнес.','When outlets run without you, your hands are free for owner’s tasks: negotiations, inspections, scouting. They take less energy than side jobs and move the business forward.'),
  ed:()=>L('Учёба — вложение в себя: курс идёт несколько дней и занимает одно дело вашего времени, зато навсегда.','Study is an investment in yourself: a course takes a few days and a hand, but it lasts for good.'),
  ev:()=>L('В бизнесе всё время что-то случается. Решайте сами, а не успеете к сроку (он под кнопками) — выберу сама, какой вариант — тоже написано там.','Things keep happening in business. Decide yourself — if you miss the deadline (shown under the buttons), I’ll choose myself; which option is written there too.')};   // M38: было «за 20 дней» рядом с «Решить нужно за 10 дней» — два разных срока   // M34: срок из EV_DAYS, без «осторожный» (по умолчанию бывает и рискованный)
// M30: на карточке точки — не больше одной подсказки Людмилы за раз (было до 5 «Понятно» сразу); tipCap — сколько ещё можно показать в этой перерисовке
let tipCap=null;
function tip(k){if(!S.o2t||typeof S.o2t!=='object')S.o2t={};if(S.o2t[k]||!TIP[k])return '';if(tipCap!==null){if(tipCap<=0)return '';tipCap--;}
  return `<div class="say ow-tip">${face('calm')}<div><p>${esc(TIP[k]())}</p><button class="btn sm noenter" data-ow="tip" data-k="${k}">${L('Понятно','Got it')}</button></div></div>`;}

/* ---------------- тексты ---------------- */
const MKN={fly:['Листовки у точки','Flyers near the outlet'],bogo:['Акция «1+1»','“Buy one, get one” offer'],blog:['Обзор у блогера','A blogger’s review'],sign:['Вывеска','A sign'],
  soc:['Соцсети','Social media'],radio:['Ролик на радио','A radio ad'],out:['Наружная реклама','Billboards'],fair:['Ярмарка','A fair']};
const MKD={fly:()=>L(`промоутер две недели раздаёт листовки: +${Math.round(E.MK.fly.e*100)} % покупателей × отклик вида`,`a promoter hands out flyers for two weeks: +${Math.round(E.MK.fly.e*100)}% customers × the business’s response`),
  bogo:()=>L('покупателей +35 % на 10 дней, но цена −20 % — выгодно, где наценка большая','+35% customers for 10 days, but prices −20% — pays only with a high mark-up'),
  blog:()=>L('повезёт — +25 % на 20 дней и ⭐ +0,1; бывает, толку мало','with luck +25% for 20 days and ⭐ +0.1; sometimes it does little'),
  sign:()=>L('светящаяся вывеска: +6 % покупателей навсегда (в стоимость точки)','a lit sign: +6% customers for good (added to the outlet’s value)'),
  soc:()=>L('страница и посты для всех точек города: +5 % × отклик, подписка каждый месяц','a page and posts for all outlets in the city: +5% × response, paid monthly'),
  radio:()=>L('все точки города +12 % на 20 дней (от 3 точек)','all outlets in the city +12% for 20 days (from 3 outlets)'),
  out:()=>L('щиты у дорог: все точки города +10 % на 30 дней (от 3 точек)','roadside boards: all outlets in the city +10% for 30 days (from 3 outlets)')};
const EDN={acc:['Бухучёт для ИП','Bookkeeping for sole traders'],neg:['Закупки и переговоры','Purchasing and negotiation'],mgr:['Управление персоналом','People management'],
  mkt:['Маркетинг для малого бизнеса','Marketing for small business'],mgr2:['Школа директора','Director school']};
const EDD={acc:()=>L('без ошибок в декларации (без курса раз в квартал бывает штраф 3–10 тыс.) и лимит банка +10 %','no mistakes in tax returns (without it a 3–10k fine happens some quarters) and a 10% higher bank limit'),
  neg:()=>L('−2 % себестоимости всей розницы навсегда; «Переговоры с поставщиком» — −4 % вместо −3 %','−2% cost of goods for all retail for good; supplier talks give −4% instead of −3%'),
  mgr:()=>L('«хозяйский глаз»: нечестный управляющий ворует вдвое меньше','a keen eye: a dishonest manager steals half as much'),
  mkt:()=>L('реклама на 25 % сильнее, к ней привыкают вдвое медленнее','ads work 25% better and wear out half as fast'),
  mgr2:()=>L('доля управляющего 27 % вместо 30 %','the manager’s share is 27% instead of 30%')};
const JN={neg:['Переговоры с поставщиком','Negotiate with a supplier'],spot:['Поиск хорошего места','Scout a good location'],stand:['Встать за прилавок','Work the counter yourself'],
  check:['Проверка точки','Inspect an outlet'],fly:['Листовки своими руками','Hand out flyers yourself'],visit:['В гости к другу','Visit a friend'],edu:['Учёба','Study']};
const EVN={
  rent:[a=>L(`Арендодатель поднимает аренду на ${M(a.inc)} в месяц`,`The landlord raises the rent by ${M(a.inc)} a month`),()=>L('«Всё дорожает». Можно согласиться — или переехать в соседнее помещение: 60 000 ₽ и 5 дней точка закрыта.','“Everything’s getting dearer.” Agree — or move next door: 60,000 ₽ and 5 days closed.'),a=>[L('Согласиться: +'+M(a.inc)+' в месяц','Agree: +'+M(a.inc)+' a month'),L('Переехать: 60 000 ₽, 5 дней закрыто','Move: 60,000 ₽, 5 days closed')]],
  raise:[()=>L('Продавец просит прибавку 10 000 ₽','A seller asks for a 10,000 ₽ raise'),()=>L('Работает хорошо, покупатели его знают. Откажете — может уйти: два месяца покупателей будет на 10 % меньше.','He works well and customers know him. Say no — he may leave: 10% fewer customers for two months.'),()=>[L('Дать прибавку +10 000 ₽ в месяц · ⭐ +0,2','Give a raise +10,000 ₽ a month · ⭐ +0.2'),L('Отказать','Say no')]],
  fair:[()=>L('Городская ярмарка в выходные','A city fair at the weekend'),()=>L('Место на ярмарке — 20 000 ₽. Неделю покупателей на 30 % больше.','A stall costs 20,000 ₽. A week with 30% more customers.'),()=>[L('Участвовать — 20 000 ₽','Take part — 20,000 ₽'),L('Пропустить','Skip it')]],
  sale:[a=>L('Сосед продаёт ларёк за 60 % цены','A neighbour sells his kiosk for 60% of the price'),a=>L(`Уезжает к детям, ларёк рабочий: ${M(a.pr)} — и через 3 дня он ваш.`,`He’s moving to his children; the kiosk works: ${M(a.pr)} — and it’s yours in 3 days.`),a=>[L('Купить за '+M(a.pr),'Buy for '+M(a.pr)),L('Не надо','No, thanks')]],
  bulk:[()=>L('Оптовик предлагает договор','A wholesaler offers a contract'),(a,t)=>L(`Для «${bn(t)}»: 25 000 ₽ за вход — и 3 месяца закупка на 6 % дешевле для всех таких точек.`,`For “${bn(t)}”: 25,000 ₽ up front — and 3 months of 6% cheaper stock for all such outlets.`),()=>[L('Подписать — 25 000 ₽','Sign — 25,000 ₽'),L('Не надо','No, thanks')]],
  blog:[()=>L('Блогер просит бесплатный обед за обзор','A blogger wants a free meal for a review'),()=>L('«У меня 40 тысяч подписчиков!» Может помочь, а может и нет. Откажете — бывает, пишет гадости.','“I’ve got 40 thousand followers!” It may help, or not. Refuse — and sometimes he writes nasty things.'),()=>[L('Накормить — 3 000 ₽','Feed him — 3,000 ₽'),L('Вежливо отказать','Politely refuse')]],
  insp:[()=>L('Завтра проверка Роспотребнадзора','A health inspection tomorrow'),()=>L('Можно закрыться на день и навести порядок (8 000 ₽) — или работать как есть: могут выписать штраф 30–50 тыс.','Close for a day and tidy up (8,000 ₽) — or work as usual: the fine can be 30–50k.'),()=>[L('Навести порядок — 8 000 ₽','Tidy up — 8,000 ₽'),L('Работать как есть','Work as usual')]],
  rival:[()=>L('Рядом открылся конкурент','A competitor opened nearby'),()=>L('Ответить акцией: месяц цены на 15 % ниже — покупатели не уйдут. Или не реагировать: три месяца покупателей на 15 % меньше.','Answer with a promo: prices 15% lower for a month — customers stay. Or ignore it: 15% fewer customers for three months.'),()=>[L('Ответить акцией −15 %','Answer with −15% prices'),L('Не реагировать','Ignore it')]],
  corp:[()=>L('Корпоративный заказ','A corporate order'),()=>L('Соседний офис хочет брать у вас каждый день: месяц выручки на 30 % больше.','The office next door wants to buy from you every day: a month with 30% more revenue.'),()=>[L('Взять заказ','Take the order'),L('Отказаться','Decline')]],
  // глава 3 «Сеть» (M19)
  opt3:[()=>L('Федеральный поставщик: закупка на квартал вперёд','A national supplier: a quarter’s stock in advance'),(a,t)=>L(`Для всех ваших «${bn(t)}»: ${M(a.fee)} за договор — и 3 месяца закупка на 8 % дешевле, это ≈ ${M(a.sv)} экономии.`,`For all your “${bn(t)}”: ${M(a.fee)} for the contract — and 3 months of 8% cheaper stock, that’s ≈ ${M(a.sv)} saved.`),a=>[L('Подписать — '+M(a.fee),'Sign — '+M(a.fee)),L('Не надо','No, thanks')]],
  city2:[a=>L(`Знакомый зовёт в ${cn(a.c)}`,`A friend invites you to ${cn(a.c)}`),a=>L(`Поможет с помещением и разрешениями: войти в новый город за ${M(a.pr)} вместо 1 млн ₽. Там свой рынок — точки не мешают вашим.`,`He’ll help with premises and permits: enter a new city for ${M(a.pr)} instead of 1 mln ₽. It’s a separate market — outlets there don’t compete with yours.`),a=>[L('Открыть город — '+M(a.pr),'Open the city — '+M(a.pr)),L('Пока рано','Too early')]],
  poach:[()=>L('Конкурент переманивает управляющего','A rival is poaching your manager'),a=>L(`Предлагают ему больше. Удержать — разовая премия ${M(a.c||20000)}. Отпустить — придёт новый: два месяца покупателей на 15 % меньше, и неизвестно, честный ли.`,`They offer him more. Keep him — a one-off ${M(a.c||20000)} bonus. Let him go — a new one comes: 15% fewer customers for two months, and who knows if he’s honest.`),a=>[L('Удержать — '+M(a.c||20000),'Keep him — '+M(a.c||20000)),L('Отпустить','Let him go')]],
  mall:[()=>L('Новый торговый центр зовёт к себе','A new shopping mall invites you in'),a=>L(`Переезд — ${M(a.mv||80000)} и 5 дней закрыто. Покупателей +25 % навсегда, но аренда дороже на ${M(a.inc)} в месяц.`,`Moving costs ${M(a.mv||80000)} and 5 days closed. 25% more customers for good, but the rent is ${M(a.inc)} a month higher.`)+(a.g!=null?' '+(a.g>0?L(`Людмила: ≈ +${Mr(a.g)} прибыли в месяц.`,`Lyudmila: ≈ +${Mr(a.g)} profit a month.`):L('Людмила: не окупится — аренда съест прибавку.','Lyudmila: it won’t pay — the rent eats the gain.')):''),a=>[L('Переехать — '+M(a.mv||80000),'Move — '+M(a.mv||80000)),L('Остаться','Stay')]],
  tender:[()=>L('Тендер: поставки для школы и поликлиники','A tender: supplies for a school and a clinic'),(a,t)=>L(`Документы — ${M(a.fee||15000)}. Выиграете (шанс примерно 3 из 5) — три месяца выручки на 25 % больше${a.n>1?` у всех ${a.n} ваших «${bn(t)}» в городе`:''}.`,`Paperwork costs ${M(a.fee||15000)}. Win (about 3 chances in 5) — three months of 25% more revenue${a.n>1?` for all ${a.n} of your “${bn(t)}” in the city`:''}.`),a=>[L('Участвовать — '+M(a.fee||15000),'Bid — '+M(a.fee||15000)),L('Не участвовать','Don’t bid')]],
  audit3:[()=>L('Выездная налоговая проверка ООО','A tax field audit of your LLC'),a=>L(`Пригласить аудитора — ${M(a.c||40000)}, и всё будет в порядке. Или встретить проверку как есть: могут доначислить ${M(a.f1||60000)} – ${M(a.f2||120000)}.`,`Hire an auditor — ${M(a.c||40000)}, and all will be fine. Or face the audit as is: they may charge an extra ${M(a.f1||60000)} – ${M(a.f2||120000)}.`),a=>[L('Пригласить аудитора — '+M(a.c||40000),'Hire an auditor — '+M(a.c||40000)),L('Как есть','As is')]],
  grant:[()=>L('Программа поддержки малого бизнеса','A small-business support scheme'),()=>L('Город возмещает часть затрат на кассу и вывеску — 30 000 ₽. Нужно собрать бумаги.','The city refunds part of the cost of a till and a sign — 30,000 ₽. You need to collect the papers.'),()=>[L('Подать документы','Apply'),L('Некогда','No time')]]};
const EVR={hit:()=>L('Сработало!','It worked!'),meh:()=>L('Толку немного.','Not much came of it.'),bad:()=>L('Блогер написал гадость: ⭐ −0,1.','The blogger wrote something nasty: ⭐ −0.1.'),fine:()=>L('Проверка выписала штраф.','The inspection issued a fine.'),got:()=>L('Субсидия пришла: +30 000 ₽.','The subsidy arrived: +30,000 ₽.'),ok:()=>L('Сделано.','Done.'),gone:()=>L('Уже не актуально.','No longer relevant.'),
  city:()=>L('Новый город открыт — смотрите «Бизнес».','A new city is open — see Business.'),won:()=>L('Тендер выигран: три месяца выручки больше!','Tender won: three months of higher revenue!'),lost:()=>L('Тендер ушёл другому.','The tender went to someone else.'),tax:()=>L('Проверка доначислила налог.','The audit charged extra tax.'),cash:()=>L('Не хватило денег — оставили как есть.','Not enough money — left as is.')};
const RISK=[['риск низкий','low risk'],['риск средний','medium risk'],['риск высокий','high risk']],MARG=[['берёт оборотом','wins on turnover'],['наценка средняя','medium mark-up'],['высокая наценка','high mark-up']],
  PLC=[['место не важно','location matters little'],['место важно','location matters'],['всё решает место и поток людей','location and footfall are everything']],OWNR=[['хозяин не нужен','no owner needed'],['хозяин нужен иногда','owner helps a bit'],['хозяйский глаз важен','owner’s eye matters']];
const MON=[['янв','Jan'],['фев','Feb'],['мар','Mar'],['апр','Apr'],['май','May'],['июн','Jun'],['июл','Jul'],['авг','Aug'],['сен','Sep'],['окт','Oct'],['ноя','Nov'],['дек','Dec']],MONF=[['январь','January'],['февраль','February'],['март','March'],['апрель','April'],['май','May'],['июнь','June'],['июль','July'],['август','August'],['сентябрь','September'],['октябрь','October'],['ноябрь','November'],['декабрь','December']];

// M38: месяцы пика подряд — диапазоном («апрель – сентябрь»), а не списком из шести слов (плашка вылезала за край)
function monRange(a){a=(a||[]).slice().sort((x,y)=>x-y);const out=[];for(let i=0;i<a.length;){let j=i;while(j+1<a.length&&a[j+1]===a[j]+1)j++;
  out.push(j-i>=2?T(MONF[a[i]])+' – '+T(MONF[a[j]]):a.slice(i,j+1).map(m=>T(MONF[m])).join(', '));i=j+1;}return out.join(', ');}
/* ---------------- «паспорт» дела: сезон, риск, маржа, место, хозяин ---------------- */
function seaBars(s){const mx=Math.max(...s,1);return `<div class="ow-sea" aria-hidden="true">${s.map(x=>`<i class="${x<.9?'lo':''}" style="height:${Math.max(6,x/mx*100).toFixed(0)}%"></i>`).join('')}</div><div class="ow-seal">${MON.map(m=>`<span>${T(m)}</span>`).join('')}</div>`;}
function chips(W,t,k){const c=E.charOf(W,t,k);const a=[];
  a.push(c.seaK<.25?`<span>${L('круглый год ровно','steady all year')}</span>`:`<span class="w">🗓 ${L('пик: ','peak: ')}${monRange(c.peak)}</span>`);
  a.push(`<span class="${c.risk===2?'b':c.risk?'w':'g'}">${T(RISK[c.risk])}</span>`);a.push(`<span>${T(MARG[c.margin])}</span>`);a.push(`<span>${T(PLC[c.pl])}</span>`);a.push(`<span>${T(OWNR[c.owner])}</span>`);
  return `<div class="ow-chips">${a.join('')}</div>`;}
// k — ручка: в каталоге — как у вашей последней такой точки (иначе по умолчанию); сезон других вариантов — строкой
function lastKnob(W,t){const b=(W.biz||[]).filter(x=>x.t===t&&x.k).pop();return b?b.k:null;}
function seaOther(ch,k0){const o=ch.sv.filter(x=>!k0||!Object.keys(k0).some(kk=>k0[kk]===x.id));if(!o.length)return '';
  return `<p class="bz-note">🗓 ${L('Сезон зависит от выбора: ','The season depends on your choice: ')}${o.map(x=>esc(L(x.ru,x.en))+' — '+(x.flat||!x.peak.length?L('ровно','steady'):L('пик ','peak ')+monRange(x.peak))).join('; ')}.</p>`;}
function passport(W,t,c,k){k=k||lastKnob(W,t);const ch=E.charOf(W,t,k),q=E.marginal(W,t,c);let h=`<div class="bz-lab" style="margin-top:10px">${L('Характер дела','What this business is like')}</div>${chips(W,t,k)}`;
  if(ch.seaK>=.25)h+=seaBars(ch.sea);if(ch.sv.length)h+=seaOther(ch,k||E.defKnob(t));
  if(q.sat.n>1){const lost=q.loss>0?L(` Новая точка отнимет у ваших ~${Mr(q.loss)} в месяц — чистый прирост ~${Mr(q.net)}.`,` A new one takes ~${Mr(q.loss)} a month from your others — net gain ~${Mr(q.net)}.`):'';
    h+=`<p class="ow-sat">🏙 ${L(`В городе будет ${q.sat.n} таких точек: рынок насыщен на `,`There will be ${q.sat.n} of these in the city: the market is saturated by `)}<b>${pct(q.sat.pct)}</b>.${esc(lost)}</p>`+tip('sat');}
  return h;}
function catLine(W,t,c){const q=E.marginal(W,t,c);return q.sat.n>1&&q.sat.pct>=.01?L(`рынок насыщен на ${pct(q.sat.pct)}`,`market ${pct(q.sat.pct)} saturated`):'';}

/* ---------------- точка: уровни, рынок, реклама, обучение ---------------- */
function effTxt(e){const a=[];if(e.d)a.push(L('покупателей ','customers ')+(e.d>0?'+':'')+Math.round(e.d*100)+' %');if(e.p)a.push(L('чек ','average bill ')+(e.p>0?'+':'')+Math.round(e.p*100)+' %');
  if(e.v)a.push(L('себестоимость ','cost of goods ')+(e.v>0?'+':'')+Math.round(e.v*100)+' %');if(e.rk)a.push(L('поломки и штрафы ','breakdowns and fines ')+Math.round(e.rk*100)+' %');
  if(e.th)a.push(L('недостача ','shortfalls ')+Math.round(e.th*100)+' %');if(e.sat)a.push(L('доставка: рынок шире','delivery: a wider market'));if(e.sea)a.push(L('сезон ровнее','a smoother season'));
  if(e.f)a.push(L('расходы +','costs +')+M(e.f)+L('/мес','/mo'));return a.join(', ').replace(/(\d) %/g,'$1 %');}
// M19: длинные блоки карточки точки — главное сверху, остальное под «Ещё…» (раскрытие помним до перезагрузки)
// M30: переключатель «🔁 Повторять автоматически» (реклама точки/города, дела хозяина) — строкой-настройкой, как в ⚙
function autoRow(on,attrs,sub){return `<button class="set ow-aut noenter" ${attrs} aria-pressed="${on?'true':'false'}"><span>🔁 ${L('Повторять автоматически','Repeat automatically')}${sub?`<br><small>${esc(sub)}</small>`:''}</span><i${on?'':' class="off"'}>${on?L('вкл','on'):L('выкл','off')}</i></button>`;}
const MORE={};
function moreBtn(key,open,txt){return `<button class="btn sm w noenter ow-more" data-ow="more" data-k="${esc(key)}" aria-expanded="${open?'true':'false'}">${open?'▲ '+L('Свернуть','Collapse'):'▼ '+txt}</button>`;}
function lvCard(W,b){const a=E.LV[b.t];if(!a||b.st!=='w')return '';const l=b.lv||1,g=E.lvGain(W,b);let rows='',rest='',nd=0,nl=0;const mk=b.id+':lv',open=!!MORE[mk];
  a.forEach((x,i)=>{const n=i+2;const done=l>=n,nx=n===l+1;if(done)nd++;else if(!nx)nl++;
    const row=`<div class="ow-row ${done?'done':nx?'':'later'}"><span class="ow-ic">${done?'✓':n}</span><span class="f1"><b>${esc(L(x[1],x[2]))}</b><small>${esc(effTxt(x[4]))}${nx&&g?' · '+(g.g>0?L(`≈ +${Mr(g.g)} в месяц, окупится за ${mons(Math.max(1,Math.ceil(g.pay)))}`,`≈ +${Mr(g.g)} a month, pays back in ${mons(Math.max(1,Math.ceil(g.pay)))}`):L('сейчас почти ничего не даст','would give almost nothing now')):''}</small></span>`+
      (nx?`<button class="btn sm ${g&&g.pay<=12?'green':''} noenter" data-ow="up" data-id="${b.id}"${W.cash<x[3]?' disabled':''}>${M(x[3])}</button>`:'')+`</div>`;
    if(nx)rows+=row;else rest+=row;});
  const mt=[nd?L(`сделано ${nd}`,`${nd} done`):'',nl?L(`впереди ${nl}`,`${nl} ahead`):''].filter(Boolean).join(' · ');
  const more=rest?(rows?moreBtn(mk,open,L('Все улучшения','All upgrades')+(mt?' ('+mt+')':'')):''):'';
  // M32: «⏫ До максимума» — когда за раз можно взять 2+ уровня (у владельца было 4 × 4 нажатия)
  const um=E.ptUpMax?E.ptUpMax(W,b.id,true):null,umB=um&&um.n>=2?`<button class="btn sm w green noenter ow-upmax" data-ow="upmax" data-id="${b.id}">⏫ ${um.max?L('До максимума','To the max'):L('До уровня ','Up to level ')+um.to} (${M(um.c)})<small>${L(`уровни ${l+1}–${um.to} разом · запас ~${Mr(um.res)} не трогаем`,`levels ${l+1}–${um.to} in one go · the ~${Mr(um.res)} reserve stays`)}</small></button>`:'';
  return `<div class="card"><b>🔧 ${L('Улучшения точки','Outlet upgrades')} · ${L('уровень ','level ')}${l}${L(' из ',' of ')}${E.LV_MAX}</b><div class="ow-lv">${[1,2,3,4,5].map(i=>`<i class="${i<=l?'on':''}"></i>`).join('')}</div>${tip('lv')}<div>${rows}${!rows||open?rest:''}</div>${umB}${more}</div>`;}
function satLine(W,b){const s=E.satOf(W,b.t,b.c,b);if(s.n<=1||s.pct<.01)return '';   // M19: «насыщен на 0 %» — не показываем
return `<p class="ow-sat">🏙 ${L(`В городе ${s.n} ${pl(s.n,'такая точка','такие точки','таких точек','such outlet','such outlets')}: рынок насыщен на `,`${s.n} such outlets in the city: the market is saturated by `)}<b>${pct(s.pct)}</b>${s.pct>=.01?L(' — выгоднее другое дело или другой город.',' — a different business or another city pays better.'):'.'}</p>`+(s.pct>=.01?tip('sat'):'');}
function mkPtRows(W,b,promo){const B=E.BIZ[b.t];if(E.SMALL.indexOf(b.t)<0||b.st!=='w')return '';const f=E.bizForecast(W,b,b.k),cm=Math.max(0,f.rev-f.vc);let rows='';const all=[];
  const act0=[];if(b.sign)act0.push(L('вывеска','a sign'));const O=W.ow||{};if(O.soc&&O.soc[b.c])act0.push(L('соцсети','social media'));
  for(const x of b.mc||[])if(x.u>W.t)act0.push(T(MKN[x.k]||MKN.fly)+' '+L('ещё ','for ')+days(x.u-W.t));
  for(const k of ['fly','bogo','blog','sign']){const r=E.mkOk(W,k,b.id),au=!!(E.mkAutoOn&&E.mkAutoOn(W,k,b.id));if(r==='once'||r==='on'&&!au)continue;const c=E.mkCost(W,k,b),e=E.mkEff(W,k,b.id),m=E.MK[k];
    const g=k==='sign'?cm*e:k==='bogo'?(f.rev*(1+e)*.8-f.vc*(1+e))-(f.rev-f.vc):cm*e;const per=m.dur?g*m.dur/30:g;const ok=k==='sign'?(g>0&&c/g<=12):per>c;
    const pc=Math.round(e*100),what=k==='sign'?L(`+${pc} % покупателей навсегда`,`+${pc}% customers for good`):k==='bogo'?L(`+${pc} % покупателей, цена −20 %, ${days(m.dur)}`,`+${pc}% customers, prices −20%, ${days(m.dur)}`):k==='blog'?L(`повезёт — +${pc} % на ${days(m.dur)}`,`with luck +${pc}% for ${days(m.dur)}`):L(`+${pc} % покупателей на ${days(m.dur)}`,`+${pc}% customers for ${days(m.dur)}`);
    const est=k==='sign'?(g>0?L(`≈ +${Mr(g)} в месяц`,`≈ +${Mr(g)} a month`):''):per>0?L(`≈ +${Mr(per)} прибыли`,`≈ +${Mr(per)} profit`):L('не окупится','won’t pay off');
    const cur=(b.mc||[]).find(x=>x.k===k&&x.u>W.t),aSub=!au?(E.MK_AUTO&&E.MK_AUTO.indexOf(k)>=0?L('сама запустится снова, когда кончится и если окупается','restarts by itself when it ends, if it pays off'):''):cur?L(`идёт ещё ${days(cur.u-W.t)} — потом повторится сама`,`${days(cur.u-W.t)} left — then it repeats by itself`):ok?L('запустится сама в ближайший день','will start by itself in a day'):L('ждёт: сейчас не окупится (покупатели привыкли) — повторится, когда снова выгодно','waiting: it would not pay off now (customers got used to it) — repeats once it pays again');
    const tg=E.MK_AUTO&&E.MK_AUTO.indexOf(k)>=0?autoRow(au,`data-ow="mka" data-k="${k}" data-id="${b.id}"`,aSub):'';
    all.push({ok:ok&&r==='ok'||au,v:(au?1e12:0)+(k==='sign'?g*3:per-c),h:`<div class="ow-row"><span class="ow-ic">${m.ico}</span><span class="f1"><b>${esc(T(MKN[k]))} · ${c?M(c):'0 ₽'}</b><small>${esc(what.replace(/(\d) %/g,'$1\u00a0%'))}</small><small class="${ok?'':'bad'}">${esc(est)}${ok?'':' · '+L('не советую','not advised')}</small></span><button class="btn sm noenter${ok&&!cur?' green':''}" data-ow="mk" data-k="${k}" data-id="${b.id}"${r!=='ok'?' disabled':''}>${cur?L('Идёт','On'):L('Запустить','Run')}</button></div>${tg}`});}
  const mk=b.id+':mk',open=!!MORE[mk];let bi=-1;all.forEach((x,i)=>{if(x.ok&&(bi<0||x.v>all[bi].v))bi=i;});if(bi<0&&all.length)bi=0;
  let rest='';all.forEach((x,i)=>{if(i===bi||x.v>=1e12)rows+=x.h;else rest+=x.h;});
  {const r=E.jobOk(W,'fly',b.id);if(r==='ok'||r==='hand'||r==='en')rest+=`<div class="ow-row"><span class="ow-ic">✋</span><span class="f1"><b>${esc(T(JN.fly))} · 1 000 ₽</b><small>${L('те же листовки: 1 дело на 2 дня, 15 ⚡ в день','the same flyers: 1 hand for 2 days, 15 ⚡ a day')}</small></span><button class="btn sm noenter" data-ow="job" data-k="fly" data-a="${b.id}"${r!=='ok'?' disabled':''}>${L('Раздать','Go')}</button></div>`;}
  const nr=(rest.match(/class="ow-row"/g)||[]).length;if(rest)rows+=(open?rest:'')+moreBtn(mk,open,L('Ещё способы рекламы','More ways to advertise')+' ('+nr+')');
  return `<div class="card"><b>📣 ${L('Маркетинг точки','Outlet marketing')}</b><p class="bz-note">${L('Отклик этого дела на рекламу: ','This business’s response to ads: ')}<b>${[L('слабый','weak'),L('средний','medium'),L('сильный','strong')][E.mkSens(W,b.t)>=.95?2:E.mkSens(W,b.t)>=.55?1:0]}</b>${act0.length?' · '+L('сейчас: ','now: ')+esc(act0.join(', ')):''}</p>${tip('mk')}${promo||''}<div>${rows}</div></div>`;}
function staffRow(W,b){const B=E.BIZ[b.t];if(!B.hand||b.st!=='w')return '';const k=B.seg==='retail'?'sell':B.seg==='serv'?'mast':'';if(!k)return '';const r=E.stOk(W,b.id,k);
  const nm=k==='sell'?L('Тренинг продавцов','Sales training'):L('Мастера: повышение квалификации','Staff: advanced training'),ds=k==='sell'?L('+6 % покупателей навсегда','+6% customers for good'):L('⭐ +0,4 и +5 % к чеку навсегда','⭐ +0.4 and +5% to the bill for good');
  if(r==='done')return `<div class="ow-row done"><span class="ow-ic">✓</span><span class="f1"><b>${nm}</b><small>${ds}</small></span></div>`;
  if(r==='busy')return `<div class="ow-row"><span class="ow-ic">${E.ST[k].ico}</span><span class="f1"><b>${nm}</b><small>${L('идёт учёба: ещё ','training in progress: ')+days(Math.max(1,b.trn-W.t))}</small></span></div>`;
  return `<div class="ow-row"><span class="ow-ic">${E.ST[k].ico}</span><span class="f1"><b>${nm} · ${M(E.stCost(W,b,k))}</b><small>${ds}${L(`; ${E.ST[k].d} дней точка работает на 80 %`,`; for ${E.ST[k].d} days the outlet runs at 80%`)}</small></span><button class="btn sm noenter" data-ow="st" data-k="${k}" data-id="${b.id}"${r!=='ok'?' disabled':''}>${L('Обучить','Train')}</button></div>`;}
function seaLine(W,b){const ch=E.charOf(W,b.t,b.k);if(ch.seaK<.25&&!ch.sv.length)return '';return `<p class="bz-note">🗓 ${ch.sv.length?L('При этом выборе: ','With this choice: '):''}${ch.seaK<.25||!ch.peak.length?L('спрос ровный круглый год','steady demand all year'):L('пик спроса — ','peak demand: ')+ch.peak.map(i=>T(MONF[i])).join(', ')}${ch.low.length&&ch.seaK>=.25?L('; тише всего — ','; quietest: ')+ch.low.map(i=>T(MONF[i])).join(', '):''}.</p>`;}
function ptCards(W,b,promo){if(W.ned||E.SMALL.indexOf(b.t)<0)return promo?`<div class="card">${promo}</div>`:'';
  // M30: главное сверху (своя механика, улучшения, маркетинг), справка о сезоне/рынке и обучение персонала — под «▼ Ещё о точке»; одна подсказка за раз
  const mc=window.MECHUI?MECHUI.card(W,b):'';tipCap=/ow-tip|mx-tip|data-mx="tip"|data-k="mx_/.test(mc)?0:1;
  try{const sl=b.st==='w'?seaLine(W,b):'',st=satLine(W,b);let h=mc+lvCard(W,b)+mkPtRows(W,b,promo);const s=staffRow(W,b);
    let more=(st||sl?`<div class="card">${sl}${st}</div>`:'')+(s?`<div class="card"><b>🎓 ${L('Обучить персонал','Train the staff')}</b><div>${s}</div></div>`:'');
    if(more){const mk=b.id+':pmore',open=!!MORE[mk];h+=open?more+moreBtn(mk,true,''):moreBtn(mk,false,L('Ещё о точке: сезон, рынок, персонал','More: season, market, staff'));}
    return h;}finally{tipCap=null;}}   // M21: своя механика дела (js/mech-ui.js) — первой
// строки в «управлении» точки: дела хозяина по этой точке
function ptRows(W,b){if(W.ned||E.SMALL.indexOf(b.t)<0||b.st!=='w')return '';let r='';
  for(const k of ['check','stand']){const ok=E.jobOk(W,k,b.id);if(ok==='no')continue;const J=E.JOBS[k];const on=ok==='on';
    const ds=k==='check'?L('видна недостача; 3 месяца кражи −70 %, поломки вдвое реже','reveals shortfalls; 3 months of −70% theft and half the breakdowns'):L('5 дней: +12 % выручки, управляющий остаётся','5 days: +12% revenue, the manager stays');
    r+=`<div class="bz-li"><span class="bz-ic">${J.ico}</span><span class="f1"><b>${esc(T(JN[k]))}</b><small>${esc(ds)} · ✋ 1 · ${days(J.d)} · ⚡ ${J.e}${L(' в день',' a day')}${ok==='cd'?' · '+L('недавно было','done recently'):''}</small></span><button class="btn sm noenter" data-ow="job" data-k="${k}" data-a="${b.id}"${ok!=='ok'?' disabled':''}>${on?L('Идёт','On'):L('Начать','Start')}</button></div>`;const au=E.jobAutoOn&&E.jobAutoOn(W,k,b.id);r+=autoRow(au,`data-ow="ja" data-k="${k}" data-a="${b.id}"`,au?L('начнётся снова сама, когда будут свободное время и силы','restarts by itself when a hand and energy are free'):'');}
  return r;}

/* ---------------- «Бизнес»: маркетинг города и итог рекламы ---------------- */
function bizCards(W,c,sw){if(W.ned||!W.ip||!W.biz.some(b=>b.st==='w'&&E.SMALL.indexOf(b.t)>=0))return '';c=c||W.home||'kuz';const O=W.ow||{};let rows='';   // M38: c — выбранный город, sw — переключатель городов
  let cmSum=0,sn=0;for(const b of W.biz)if(b.st==='w'&&b.c===c&&E.SMALL.indexOf(b.t)>=0){const f=E.bizForecast(W,b,b.k);cmSum+=Math.max(0,f.rev-f.vc)*E.mkSens(W,b.t);sn++;}
  for(const k of ['soc','radio','out']){const m=E.MK[k],r=E.mkOk(W,k,c),e=E.mkEff(W,k,c)/(E.ownEd(W,'mkt')?1.25:1)*(E.ownEd(W,'mkt')?1.25:1);const g=cmSum*e*(m.dur?m.dur/30:1);
    const on=r==='on';const est=g>0?(m.sub?L(`≈ +${Mr(g)} прибыли в месяц`,`≈ +${Mr(g)} profit a month`):L(`≈ +${Mr(g)} прибыли за ${days(m.dur)}`,`≈ +${Mr(g)} profit over ${days(m.dur)}`)):'';
    rows+=`<div class="ow-row"><span class="ow-ic">${m.ico}</span><span class="f1"><b>${esc(T(MKN[k]))} · ${M(m.c)}${m.sub?L('/мес','/mo'):''}</b><small>${esc(MKD[k]())}${est?' · '+esc(est):''}${g<m.c&&!on?' · '+L('пока не окупится','won’t pay yet'):''}${r==='min'?' · '+L('нужно 3 точки в городе','needs 3 outlets in the city'):''}</small></span>`+
      (k==='soc'&&on?`<button class="btn sm noenter" data-ow="mkstop" data-k="soc" data-id="${c}">${L('Отключить','Stop')}</button>`:`<button class="btn sm noenter${g>m.c*1.2?' green':''}" data-ow="mk" data-k="${k}" data-id="${c}"${r!=='ok'?' disabled':''}>${on?L('Идёт','On'):L('Запустить','Run')}</button>`)+`</div>`;
    if(E.MKC_AUTO&&E.MKC_AUTO.indexOf(k)>=0&&r!=='min'){const au=E.mkAutoOn(W,k,c);rows+=autoRow(au,`data-ow="mka" data-k="${k}" data-id="${c}"`,au?(on?L('идёт — потом повторится сама, если окупается','running — then repeats by itself if it pays off'):g>m.c?L('запустится сама в ближайший день','will start by itself in a day'):L('ждёт, пока снова окупится','waiting until it pays off again')):'');}}
  // M30: одна кнопка вместо десятков щелчков — листовки сами у всех точек, где окупаются
  {let nA=0,nW=0;for(const b of W.biz)if(b.st==='w'&&E.SMALL.indexOf(b.t)>=0){if(E.mkAutoOn(W,'fly',b.id))nA++;else if(E.mkWorth(W,'fly',b.id).ok)nW++;}
    if(nA||nW)rows+=`<div class="ow-row"><span class="ow-ic">📄</span><span class="f1"><b>${L('Листовки у всех точек — сами','Flyers at every outlet — automatically')}</b><small>${nA?L(`повторяются сами у ${nA} ${pl(nA,'точки','точек','точек','outlet','outlets')}`,`repeating at ${nA} ${nA===1?'outlet':'outlets'}`)+(nW?' · ':''):''}${nW?L(`ещё ${nW} — где окупятся`,`${nW} more where they pay off`):''}</small></span><button class="btn sm noenter${nW?' green':''}" data-ow="mkall" data-k="fly" data-on="${nW?1:0}">${nW?L('Включить','Turn on'):L('Выключить','Turn off')}</button></div>`;}
  const ls=O.last;const res=ls&&(ls.sp||ls.rev)?`<div class="ow-res">📊 ${L(`В прошлом месяце реклама: потрачено ${M(ls.sp)}, дала +${Mr(ls.rev)} выручки ≈ ${pos(ls.pr-ls.sp)} прибыли.`,`Last month’s ads: spent ${M(ls.sp)}, brought +${Mr(ls.rev)} revenue ≈ ${pos(ls.pr-ls.sp)} profit.`)}</div>`:'';
  const mc=sw?(E.REGS&&E.REGS[c]?L(E.REGS[c].city,E.REGS[c].ce):c):'';
  return `<div class="bz-sec" id="owMkt">📣 ${L('Маркетинг','Marketing')}${mc?' · '+esc(mc):''}</div><div class="card">${sw||''}${res}<p class="bz-note" style="margin-top:0">${L((mc?`Для всех точек города ${mc}.`:'Для всех точек города.')+' Листовки, «1+1», блогер и вывеска — в карточке каждой точки.','For all outlets in the city. Flyers, “1+1”, a blogger and a sign are on each outlet’s card.')}</p>${tip('mk')}<div>${rows}</div></div>`;}

/* ---------------- «Сегодня»: событие, дела хозяина, учёба ---------------- */
function evCard(W){const O=W.ow;if(W.ned||!O||!O.ev)return '';const v=O.ev,b=W.biz.find(x=>x.id===v.id),x=EVN[v.k];if(!x)return '';const a=v.a||{},op=x[2](a);
  const left=Math.max(1,v.exp-W.t);
  return `<div class="card ow-ev" id="owEv"><div class="bz-lab">📰 ${L('Случилось','Something came up')}${b&&v.k!=='city2'&&v.k!=='audit3'?' · '+bico(b.t)+' '+esc(bn(b.t)):''}</div><b style="display:block;font-size:19px;margin:4px 0">${esc(x[0](a))}</b><p class="bz-note" style="color:var(--ink2);font-size:16px">${esc(x[1](a,v.bt))}</p>${tip('ev')}
    <div class="row"><button class="btn green noenter" data-ow="ev" data-i="0">${esc(op[0])}</button><button class="btn noenter" data-ow="ev" data-i="1">${esc(op[1])}</button></div><p class="bz-note">${L('Решить нужно за ','Decide within ')+days(left)}${L(' — иначе Людмила выберет «',' — otherwise Lyudmila picks “')}${esc(op[v.def])}${L('»','”')}</p></div>`;}
// M30: события с выбором не проходят мимо — плашка «📰 Нужно ваше решение» вверху любой вкладки (кроме «Сегодня», где сама карточка),
// а за 3 дня до срока — окно-напоминание с теми же кнопками (раз на событие), чтобы Людмила не решала молча
function evBar(W,cur){let el=$$('owEvBar');const O=W&&W.ow,v=O&&O.ev;const show=!!(v&&!W.ned&&EVN[v.k]&&cur!=='today');
  if(!show){if(el)el.remove();return;}const m=$$('main');if(!m)return;
  if(!el){el=document.createElement('button');el.id='owEvBar';el.className='card tap ow-evbar noenter';el.setAttribute('data-ow','evgo');m.insertBefore(el,m.firstChild);}
  else if(el.parentNode!==m||m.firstChild!==el)m.insertBefore(el,m.firstChild);
  const b=W.biz.find(x=>x.id===v.id),left=Math.max(1,v.exp-W.t),hot=left<=3;el.classList.toggle('hot',hot);
  const h=`<span class="bz-ic">📰</span><span class="f1"><b>${L('Нужно ваше решение','Your decision is needed')}${b?' · '+bico(b.t)+' '+esc(bn(b.t)):''}</b><small>${esc(EVN[v.k][0](v.a||{}))} · ${L('ещё ','')}${days(left)}${L('',' left')}</small></span><span class="chev">›</span>`;
  if(el.innerHTML!==h)el.innerHTML=h;}
function evRemind(W){const O=W&&W.ow,v=O&&O.ev;if(!v||W.ned||v.rem||!EVN[v.k])return;const left=v.exp-W.t;if(left>3||left<1)return;
  if(typeof modalOn!=='undefined'&&modalOn)return;if(typeof winCalm==='function'&&!winCalm())return;if(typeof paused!=='undefined'&&paused)return;v.rem=1;
  const x=EVN[v.k],a=v.a||{},op=x[2](a),b=W.biz.find(y=>y.id===v.id);snd('alert');
  modal(`<h2>📰 ${L('Нужно ваше решение','Your decision is needed')}</h2><div class="say">${face('worry')}<div><p>${L(`Осталось ${days(left)}. Если не ответите, я выберу «${esc(op[v.def])}».`,`${days(left)} left. If you don’t answer, I’ll pick “${esc(op[v.def])}”.`)}</p></div></div>
    <div class="card ow-ev">${b?`<div class="bz-lab">${bico(b.t)} ${esc(bn(b.t))}</div>`:''}<b style="display:block;font-size:19px;margin:4px 0">${esc(x[0](a))}</b><p class="bz-note" style="color:var(--ink2);font-size:16px">${esc(x[1](a,v.bt))}</p></div>
    <div class="row"><button class="btn green noenter" data-ow="ev" data-i="0">${esc(op[0])}</button><button class="btn noenter" data-ow="ev" data-i="1">${esc(op[1])}</button></div>
    <div class="row"><button class="btn" id="owEvLater" data-esc>${L('Решу позже','I’ll decide later')}</button></div>`);
  try{modalRe=null;}catch(e){}const l=$$('owEvLater');if(l)l.onclick=()=>{snd('tap');hideModal();};}
function jobName(W,j){const a=j.a;if(j.k==='edu')return T(EDN[a]);let t=T(JN[j.k]);if(j.k==='neg'||j.k==='spot')t+=' · '+bn(a);else if(j.k==='visit')t+=' · '+T(FRN[a]);else{const b=W.biz.find(x=>x.id===a);if(b)t+=' · '+bn(b.t);}return t;}
function ownCard(W){if(W.ned||!W.me||!W.ip||stI()<1)return '';const O=W.ow||{},H=E.hands(W);let rows='';
  for(const j of O.j||[]){rows+=`<div class="ow-row"><span class="ow-ic">${j.k==='edu'?E.ED[j.a].ico:E.JOBS[j.k].ico}</span><span class="f1"><b>${esc(jobName(W,j))}</b><small>${L('ещё ','')}${days(j.left)}${L('',' left')}${j.e?' · ⚡ '+j.e+L(' в день',' a day'):''}</small>${prog(1-j.left/Math.max(1,j.d))}</span>${j.k!=='edu'?`<button class="btn sm noenter" data-ow="jstop" data-id="${j.id}">${L('Прервать','Stop')}</button>`:''}</div>`;if(E.JOB_AUTO&&E.JOB_AUTO.indexOf(j.k)>=0){const au=E.jobAutoOn(W,j.k,j.a);rows+=autoRow(au,`data-ow="ja" data-k="${j.k}" data-a="${j.a}"`,'');}}
  {const ja=Object.keys(O.ja||{}).filter(key=>{const i=key.indexOf(':');return !(O.j||[]).some(j=>j.k===key.slice(0,i)&&j.a===key.slice(i+1));});
    if(ja.length)rows+=`<div class="ow-row"><span class="ow-ic">🔁</span><span class="f1"><b>${L('Повторяются сами','Repeating by themselves')}</b><small>${esc(ja.map(key=>{const i=key.indexOf(':');return jobName(W,{k:key.slice(0,i),a:key.slice(i+1)});}).join('; '))}${L(' — начнутся, когда будут свободное время и силы',' — they start when a hand and energy are free')}</small></span><button class="btn sm noenter" data-ow="jaoff">${L('Выключить','Turn off')}</button></div>`;}
  const btn=H.free>0?`<button class="btn accent w noenter" data-ow="jobs" style="margin-top:10px">✋ ${L('Чем занять свободное время?','What should the hand do?')} <small>(${L('свободно ','free: ')}${H.free})</small></button>`:`<p class="bz-note">${L('Всё время занято.','All hands are busy.')}</p>`;
  return `<div class="bz-sec">✋ ${L('Дела хозяина','Owner’s tasks')}</div><div class="card">${tip('job')}${rows?`<div>${rows}</div>`:`<p class="bz-note" style="margin-top:0">${L('Переговоры, проверки, поиск места, листовки, гости — дела, которые двигают бизнес.','Negotiations, inspections, scouting, flyers, visits — tasks that move the business.')}</p>`}${btn}</div>`;}
function eduCard(W){if(W.ned||!W.me||!W.ip)return '';const O=W.ow||{},n=Object.keys(E.ED).filter(k=>O.ed&&O.ed[k]).length,N=Object.keys(E.ED).length;const cur=(O.j||[]).find(j=>j.k==='edu');
  return `<button class="card tap bz-li noenter" data-ow="edu" style="padding:14px 18px"><span class="bz-ic">🎓</span><span class="f1"><b>${L('Учёба: курсы','Study: courses')} · ${n}${L(' из ',' of ')}${N}</b><small>${cur?L('идёт курс «','course in progress: “')+esc(T(EDN[cur.a]))+L('» — ещё ','” — ')+days(cur.left)+L('',' left'):L('бухучёт, переговоры, управление, маркетинг','bookkeeping, negotiation, management, marketing')}</small></span><span class="chev">›</span></button>`;}
// «Этот месяц»: строка «живу на пассиве»
function pasRow(W){if(W.ned||!W.biz.length)return '';const p=E.passive(W);const v=Math.min(1,p.pct);
  return `<div class="mr"><span class="bz-ic">🌿</span><span class="f1"><b>${p.pct>=1?L('✓ Живу на пассиве','✓ Living off passive income'):L('Живу на пассиве: ','Living off passive income: ')+Math.round(p.pct*100)+' %'}</b><small>${p.pct>=1?(p.pct>=1.95?L(`точки без вас покрывают жизнь и взносы в ${String(Math.floor(p.pct*10)/10).replace('.',',')} раза`,`outlets that run without you cover living costs and fees ${Math.floor(p.pct*10)/10} times over`):L('точки без вас покрывают жизнь и взносы','outlets that run without you cover living costs and fees')):L('точки без вас покрывают жизнь и взносы','outlets that run without you cover living costs and fees')}</small>${prog(v)}</span></div>`;}

/* ---------------- окна: дела хозяина, курсы, ИП ---------------- */
function jobOptions(W){const o=[],O=W.ow||{};const add=(k,a,val,ds)=>{const r=E.jobOk(W,k,a);if(r==='no'||r==='stage')return;o.push({k,a,val,ds,r});};
  const tv={};for(const b of W.biz)if(b.st==='w'&&E.SMALL.indexOf(b.t)>=0){const f=E.bizForecast(W,b,b.k);tv[b.t]=(tv[b.t]||0)+f.vc;}
  for(const t in tv){const rt=E.ownEd(W,'neg')?.04:.03,g=tv[t]*rt;if(g<1000)continue;add('neg',t,g*3,L(`−${Math.round(rt*100)} % закупки для «${bn(t)}» на 3 месяца: ≈ +${Mr(g)} в месяц`,`−${Math.round(rt*100)}% purchase costs for “${bn(t)}” for 3 months: ≈ +${Mr(g)} a month`));}
  for(const b of W.biz){if(b.st!=='w'||E.SMALL.indexOf(b.t)<0)continue;const f=E.bizForecast(W,b,b.k),cm=Math.max(0,f.rev-f.vc);
    if(b.mgr||!E.BIZ[b.t].hand)add('check',b.id,f.rev*.02*3+(b.th||0),L(`«${bn(b.t)}»: видна недостача, 3 месяца кражи −70 % и поломки вдвое реже`,`“${bn(b.t)}”: reveals shortfalls; 3 months of −70% theft and half the breakdowns`));
    if(b.mgr)add('stand',b.id,cm*.12*5/30,L(`«${bn(b.t)}»: 5 дней +12 % выручки (≈ +${Mr(cm*.12*5/30)})`,`“${bn(b.t)}”: 5 days of +12% revenue (≈ +${Mr(cm*.12*5/30)})`));
    const e=E.MK.fly.e*E.mkSens(W,b.t);add('fly',b.id,cm*e*14/30-1000,L(`«${bn(b.t)}»: +${Math.round(e*100)} % покупателей на 14 дней (≈ +${Mr(cm*e*14/30)}), 1 000 ₽`,`“${bn(b.t)}”: +${Math.round(e*100)}% customers for 14 days (≈ +${Mr(cm*e*14/30)}), 1,000 ₽`));}
  const cand=E.SMALL.filter(t=>{const r=E.bizCan(W,t);return r==='ok'||r==='cash';}).map(t=>({t,p:E.marginal(W,t).net})).filter(x=>x.p>0).sort((a,b)=>b.p-a.p).slice(0,2);
  for(const x of cand)add('spot',x.t,x.p*.12*6,L(`следующая «${bn(x.t)}» — +12 % покупателей навсегда и откроется на 30 % быстрее`,`your next “${bn(x.t)}” — +12% customers for good and opens 30% faster`));
  for(const f of E.FRIENDS)add('visit',f,2000,L(`${T(FRN[f])}: +15 ⚡ отдыха, друг рад встрече`,`${T(FRN[f])}: +15 ⚡ of rest, your friend is glad to see you`));
  return o.sort((a,b)=>(a.r==='ok'?0:1)-(b.r==='ok'?0:1)||b.val-a.val);}
const JWHY={hand:()=>L('нет свободного времени','no free hand'),en:()=>L('мало сил','low energy'),cd:()=>L('недавно было','done recently'),on:()=>L('уже идёт','already on'),cash:()=>L('не хватает денег','not enough money'),rest:()=>L('выходной','day off'),out:()=>L('больничный','sick leave')};
function openJobs(){const W=w();if(!W)return;const o=jobOptions(W),H=E.hands(W);
  let h=`<h2>✋ ${L('Чем занять свободное время?','What should the hand do?')}</h2><p class="bz-note" style="margin-top:0">${L(`Свободно на ${H.free} ${pl(H.free,'дело','дела','дел','','')}. Силы: ${Math.round(W.me.en)} ⚡. Людмила сложила дела по пользе.`,`Free hands: ${H.free}. Energy: ${Math.round(W.me.en)} ⚡. Lyudmila sorted the tasks by benefit.`)}</p><div class="card ow-list">`;
  for(const x of o.slice(0,9)){const J=E.JOBS[x.k];h+=`<div class="ow-row"><span class="ow-ic">${J.ico}</span><span class="f1"><b>${esc(T(JN[x.k]))}</b><small>${esc(x.ds)}</small><small>✋ 1 · ${days(J.d)}${J.e?' · ⚡ '+J.e+L(' в день',' a day'):''}${x.r!=='ok'?' · '+(JWHY[x.r]?JWHY[x.r]():''):''}</small></span><button class="btn sm noenter${x.r==='ok'?' green':''}" data-ow="job" data-k="${x.k}" data-a="${x.a}"${x.r!=='ok'?' disabled':''}>${L('Начать','Start')}</button></div>`;}
  if(!o.length)h+=`<p class="bz-note">${L('Пока нечем: откройте точку.','Nothing yet: open an outlet.')}</p>`;
  h+=`</div><p class="bz-note">${L('Заказы и подработка — как раньше, во вкладке «Заказы».','Side jobs are still in the Orders tab.')}</p><div class="row"><button class="btn" id="owJC" data-esc>${L('Закрыть','Close')}</button></div>`;
  modal(h);try{modalRe=openJobs;}catch(e){}$$('owJC').onclick=()=>{snd('tap');hideModal();};}
const EWHY={done:()=>L('пройден','completed'),busy:()=>L('сначала закончите текущий курс','finish the current course first'),need:()=>L('сначала «Управление персоналом»','first “People management”'),ip:()=>L('нужно ИП','needs sole-trader status'),stage:()=>L('с главы «Своё дело»','from “My business”'),hand:()=>L('нет свободного времени','no free hand'),cash:()=>L('не хватает денег','not enough money')};
function openEdu(){const W=w();if(!W)return;const O=W.ow||{};let h=`<h2>🎓 ${L('Учёба','Study')}</h2>${tip('ed')}<p class="bz-note" style="margin-top:0">${L('Курс занимает 1 дело вашего времени и 5 ⚡ в день, пока идёт. Сразу — один курс.','A course takes 1 hand and 5 ⚡ a day while it runs. One course at a time.')}</p><div class="card ow-list">`;
  for(const k in E.ED){const x=E.ED[k],r=E.edOk(W,k);h+=`<div class="ow-row${r==='done'?' done':''}"><span class="ow-ic">${r==='done'?'✓':x.ico}</span><span class="f1"><b>${esc(T(EDN[k]))}${r!=='done'?' · '+M(x.c)+' · '+days(x.d):''}</b><small>${esc(EDD[k]())}${r!=='ok'&&r!=='done'?' · '+(EWHY[r]?EWHY[r]():''):''}</small></span>${r==='done'?'':`<button class="btn sm noenter${r==='ok'?' green':''}" data-ow="ed" data-k="${k}"${r!=='ok'?' disabled':''}>${L('Учиться','Enrol')}</button>`}</div>`;}
  h+=`</div><p class="bz-note">${L('Персонал учится в карточке точки: «Обучить персонал».','Staff training is on each outlet’s card: “Train the staff”.')}</p><div class="row"><button class="btn" id="owEC" data-esc>${L('Закрыть','Close')}</button></div>`;
  modal(h);try{modalRe=openEdu;}catch(e){}$$('owEC').onclick=()=>{snd('tap');hideModal();};}
// окно ИП: выбор налога с советом Людмилы на числах (для первого дела — автомат)
function openIP(){const W=w();if(!W||W.ip)return;const a=E.taxAdv(W),kz=E.taxAdv(Object.assign({},W,{biz:[]}),['kiosk']);const best=a.best;
  // M30: «6 % — 0 ₽» объясняем (взносы ИП 57 000 ₽ в год вычитаются из налога 6 %), про ларёк — какой режим дешевле
  const fee=4750*12,t6=Math.round(a.rev*.06),z6=a.u6<=0;
  const w6=z6?L(`6 % с выручки — 0 ₽: 6 % от ${M(a.rev)} — это ${M(t6)}, а взносы ИП ${M(fee)} в год из этого налога вычитаются — платить почти нечего.`,`6% of revenue — 0 ₽: 6% of ${M(a.rev)} is ${M(t6)}, and the ${M(fee)} a year of contributions is deducted from this tax — almost nothing to pay.`)
    :L(`6 % с выручки — ${M(a.u6)} (6 % от выручки минус взносы ИП ${M(fee)} в год).`,`6% of revenue — ${M(a.u6)} (6% of revenue minus ${M(fee)} a year of contributions).`);
  const kb=kz.u15<kz.u6;
  const say=L(`Посчитала на вашем первом деле (кофейный автомат, за год). ${w6} 15 % с прибыли — ${M(a.u15)}. Сейчас выгоднее «${best==='usn6'?'6 %':'15 %'}». А вот для ларька с маленькой наценкой дешевле ${kb?'15 %':'6 %'}: ${M(kb?kz.u15:kz.u6)} против ${M(kb?kz.u6:kz.u15)} в год. Сменить режим можно раз в 12 месяцев — как в жизни.`,
    `I ran the numbers on your first business (a coffee machine, per year). ${w6} 15% of profit — ${M(a.u15)}. Right now “${best==='usn6'?'6%':'15%'}” is cheaper. But for a low-mark-up kiosk ${kb?'15%':'6%'} is cheaper: ${M(kb?kz.u15:kz.u6)} vs ${M(kb?kz.u6:kz.u15)} a year. You can switch once every 12 months — like in real life.`);
  const opt=(m,t,d)=>`<button class="btn ${m===best?'green':''} noenter" data-ow="ip" data-v="${m}" style="flex:1 1 45%;white-space:normal;line-height:1.25;min-height:64px"><b>${t}</b><br><small>${d}</small></button>`;
  modal(`<h2>📄 ${L('Своё ИП и налог','Sole trader and tax')}</h2><div class="say">${face('happy')}<div><p>${L('Для своей точки нужно ИП: самозанятым перепродавать товар нельзя. Оформим бесплатно, за 3 дня. Взносы — 4 750 ₽ в месяц. Осталось выбрать налог.','A business needs sole-trader status: the self-employed can’t resell goods. It’s free and takes 3 days. Contributions are 4,750 ₽ a month. Now pick the tax.')}</p><p>${esc(say)}</p></div></div>
    ${W.reg?`<div class="tip">📄 ${L('Уже оформляется: ещё ','Already in progress: ')+days(Math.max(1,W.reg.t-W.t))}</div><div class="row"><button class="btn" id="owIpN" data-esc>${L('Закрыть','Close')}</button></div>`:
    `<div class="row">${opt('usn6',L('6 % с выручки','6% of revenue'),L('проще; выгодно, где наценка большая','simpler; pays with high mark-ups'))}${opt('usn15',L('15 % с прибыли','15% of profit'),L('выгодно рознице с маленькой наценкой','pays for low-mark-up retail'))}</div><div class="row"><button class="btn" id="owIpN" data-esc>${L('Позже','Later')}</button></div>`}`);
  try{modalRe=openIP;}catch(e){}$$('owIpN').onclick=()=>{snd('tap');hideModal();};}

/* ---------------- отчёт месяца: прогресс, реклама, событие ---------------- */
function closeLines(rep){const W=w();if(!W||W.ned)return '';let h='';const O=W.ow||{};
  // M38: строка «До главы «Сеть»» — только после первого дела; одна ближайшая цель вместо пяти, срок — только если ≤ 2 лет
  if(W.ip&&!W.ooo&&(W.biz||[]).length){const q=E.oooEta(W),Q=q.q;const parts=[];if(!Q.pts)parts.push(L('точек ','outlets ')+Q.ptsn+L(' из 4',' of 4'));if(!Q.mgr)parts.push(L('нужен управляющий хотя бы в одной точке','a manager is needed in at least one outlet'));
    if(!Q.eq)parts.push(L('стоимость дела ','business value ')+M(Math.max(0,Q.eqv))+L(' из ',' of ')+M(E.OOO_EQ));
    if(!Q.ch)parts.push(L('кредитная история ','credit history ')+Math.floor(W.ch||0)+L(' из ',' of ')+(E.CH_OOO||50));
    const eta=q.m>0&&q.m<=24?L(' · ≈ '+mons(q.m),' · ≈ '+mons(q.m)):'';const more=parts.length-1;
    h+=`<div class="lbl">🏢 ${L('До главы «Сеть»','To the “Network” chapter')}</div><p class="about" style="margin:4px 0 8px">${parts.length?L('Ближайшее: ','Next: ')+esc(parts[0])+(more>0?L(' · и ещё '+more+' '+pl(more,'условие','условия','условий','condition','conditions'),' · and '+more+' more '+pl(more,'условие','условия','условий','condition','conditions')):'')+eta:L('всё готово — можно оформлять ООО!','all set — you can register the LLC!')}</p>`;}
  if(W.biz.length&&!W.ned&&W.st!=='quarry'){const p=E.passive(W);   // M34: в «Карьере» пассив и маркетинг 15 тыс. — шум
h+=`<div class="lbl">🌿 ${p.pct>=1?L('✓ Живу на пассиве: точки покрывают жизнь','✓ Living off passive income: outlets cover living costs')+(p.pct>=1.95?L(` в ${String(Math.floor(p.pct*10)/10).replace('.',',')} раза`,` ${Math.floor(p.pct*10)/10} times over`):''):L('Живу на пассиве','Living off passive income')+': '+Math.round(p.pct*100)+' %'}</div>${prog(Math.min(1,p.pct))}<p class="about" style="margin:2px 0 8px">${L(`точки без вас принесли ${M(Math.max(0,p.inc))} при тратах жизни ${M(p.need)}`,`outlets that run without you brought ${M(Math.max(0,p.inc))} against living costs of ${M(p.need)}`)}</p>`;}
  const ls=O.last;if(W.st!=='quarry'&&ls&&ls.m===rep.m&&(ls.sp||ls.rev))h+=`<div class="ow-res">📣 ${L(`Маркетинг: потрачено ${M(ls.sp)}, дал +${Mr(ls.rev)} выручки ≈ ${pos(ls.pr-ls.sp)} прибыли`,`Marketing: spent ${M(ls.sp)}, brought +${Mr(ls.rev)} revenue ≈ ${pos(ls.pr-ls.sp)} profit`)}</div>`;
  const le=O.lastEv;if(le&&le.m===rep.m&&le.auto&&EVN[le.k])h+=`<p class="about">📰 ${L('Людмила решила за вас: ','Lyudmila decided for you: ')}«${esc(EVN[le.k][2](Object.assign({inc:0,pr:0,fee:0},le.a||{}))[le.i])}».</p>`;
  return h;}

/* ---------------- нажатия ---------------- */
const MSG={cash:()=>L('Не хватает денег','Not enough money'),hand:()=>L('Нет свободного времени ✋','No free hand ✋'),en:()=>L('Мало сил ⚡','Too little energy ⚡')};
function onClick(e){const b=e.target.closest('[data-ow]');if(!b||b.disabled)return;const k=b.dataset.ow,W=w();if(!W)return;e.preventDefault();e.stopPropagation();
  switch(k){
    case 'tip':{if(!S.o2t)S.o2t={};S.o2t[b.dataset.k]=1;save();snd('tap');GAME.emit('change');if(modalOn&&modalRe)modalRe();break;}
    case 'upmax':{const bb=W.biz.find(x=>x.id===b.dataset.id),l0=bb?bb.lv||1:1,p=E.ptUpMax(W,b.dataset.id,true),r=act('ptUpMax',b.dataset.id);if(r==='ok'){snd('build');try{UI.salute(true);}catch(x){}toast('⏫ '+L(`Улучшено: уровень ${l0} → ${bb.lv}, ${M(p.c)}`,`Upgraded: level ${l0} → ${bb.lv}, ${M(p.c)}`),2600);stat('lvl',{t:bb.t,n:bb.lv,m:bb.lv-l0});}else if(r==='cash'){snd('no');toast(MSG.cash());}break;}   // M32
    case 'up':{const r=act('ptUp',b.dataset.id);if(r==='ok'){const bb=W.biz.find(x=>x.id===b.dataset.id);snd('build');try{UI.salute(true);}catch(x){}toast('🔧 '+L('Улучшено: уровень ','Upgraded: level ')+(bb?bb.lv:''),2200);stat('lvl',{t:bb?bb.t:'',n:bb?bb.lv:0});}else if(r==='cash'){snd('no');toast(MSG.cash());}break;}
    case 'mk':{const r=act('mkRun',b.dataset.k,b.dataset.id);if(r==='ok'||r==='hit'||r==='meh'||r==='flop'){snd('coin');toast('📣 '+T(MKN[b.dataset.k])+': '+(r==='hit'?L('обзор зашёл!','the review went down well!'):r==='meh'?L('обзор вышел, толку немного','the review is out, not much effect'):r==='flop'?L('обзор никто не заметил','nobody noticed the review'):L('запущено','running')),2600);stat('mk',{m:b.dataset.k,r});}else if(r==='cash'){snd('no');toast(MSG.cash());}break;}
    case 'mka':{const kk=b.dataset.k,id=b.dataset.id,on=!E.mkAutoOn(W,kk,id);if(!on&&E.mkApOn&&E.mkApOn(W)){snd('tap');toast('📣 '+L('Включена «Реклама на автопилоте» для всей сети — выключается во вкладке «Сеть»','“Advertising on autopilot” is on for the whole network — turn it off on the Network tab'),3200);break;}/* M34 */if(act('mkAutoSet',kk,id,on)==='ok'){snd('tap');stat('mka',{m:kk,on:on?1:0});
        if(on&&E.mkOk(W,kk,id)==='ok'&&E.mkWorth(W,kk,id).ok&&W.cash-E.mkWorth(W,kk,id).c>=30e3)act('mkRun',kk,id);
        toast('🔁 '+T(MKN[kk])+': '+(on?L('будет повторяться сама, пока окупается','will repeat by itself while it pays off'):L('автоповтор выключен','auto-repeat off')),2600);GAME.emit('change');}break;}
    case 'mkall':{const on=b.dataset.on==='1',n=act('mkAutoAll',b.dataset.k,on);snd('tap');stat('mka',{m:'all',on:on?1:0});if(on)try{act('ownAuto');}catch(x){}
        toast('🔁 '+(on?L(`Листовки сами: ${n} ${pl(n,'точка','точки','точек','outlet','outlets')}`,`Auto flyers: ${n} ${n===1?'outlet':'outlets'}`):L('Листовки: автоповтор выключен','Flyers: auto-repeat off')),2600);GAME.emit('change');break;}
    case 'ja':{const kk=b.dataset.k,a=b.dataset.a,on=!E.jobAutoOn(W,kk,a);if(act('jobAutoSet',kk,a,on)==='ok'){snd('tap');stat('ja',{j:kk,on:on?1:0});if(on&&E.jobOk(W,kk,a)==='ok')act('jobStart',kk,a);
        toast('🔁 '+T(JN[kk])+': '+(on?L('будет повторяться само','will repeat by itself'):L('автоповтор выключен','auto-repeat off')),2400);GAME.emit('change');}break;}
    case 'jaoff':{const O=W.ow||{};for(const key in O.ja||{}){const i=key.indexOf(':');if(!(O.j||[]).some(j=>j.k===key.slice(0,i)&&j.a===key.slice(i+1)))act('jobAutoSet',key.slice(0,i),key.slice(i+1),false);}snd('tap');GAME.emit('change');break;}
    case 'mkstop':{if(act('mkStop',b.dataset.k,b.dataset.id)==='ok'){snd('tap');toast(L('Соцсети отключены','Social media stopped'));}break;}
    case 'st':{const r=act('stTrain',b.dataset.id,b.dataset.k);if(r==='ok'){snd('coin');toast('🎓 '+L('Персонал учится','The staff are training'));stat('st',{w:b.dataset.k});}else if(r==='cash'){snd('no');toast(MSG.cash());}break;}
    case 'more':{MORE[b.dataset.k]=!MORE[b.dataset.k];snd('tap');GAME.emit('change');break;}
    case 'jobs':snd('tap');openJobs();break;
    case 'edu':snd('tap');openEdu();break;
    case 'job':{const r=act('jobStart',b.dataset.k,b.dataset.a);if(r==='ok'){snd('coin');toast('✋ '+T(JN[b.dataset.k])+' — '+days(E.JOBS[b.dataset.k].d),2200);stat('job',{j:b.dataset.k});if(modalOn){hideModal();}}else if(MSG[r]){snd('no');toast(MSG[r]());}break;}
    case 'jstop':{if(act('jobStop',b.dataset.id)==='ok')snd('tap');break;}
    case 'ed':{const r=act('edStart',b.dataset.k);if(r==='ok'){snd('coin');toast('🎓 '+T(EDN[b.dataset.k])+' — '+days(E.ED[b.dataset.k].d),2400);stat('edu',{c:b.dataset.k});hideModal();}else if(MSG[r]){snd('no');toast(MSG[r]());}break;}
    case 'ev':{const v=W.ow&&W.ow.ev;const r=act('evAns',+b.dataset.i);if(r){snd('tap');if(modalOn&&b.closest('#modal'))hideModal();toast('📰 '+((EVR[r]||EVR.ok)()),2400);stat('ev',{e:v?v.k:'',i:+b.dataset.i,r,rem:v&&v.rem?1:0});}break;}
    case 'evgo':{snd('tap');UI.go('today');setTimeout(()=>{const c=$$('owEv');if(c&&c.scrollIntoView)c.scrollIntoView({block:'start',behavior:'smooth'});},120);break;}
    case 'ip':{hideModal();const r=act('regIP',b.dataset.v);if(r==='ok'){snd('coin');toast(L('Документы поданы: ИП будет через 3 дня','Papers filed: registration in 3 days'));stat('tax',{m:b.dataset.v,w:'ip'});}break;}}}
function init(){css();document.addEventListener('click',e=>{if(e.target.closest('#main,#modal,#adv')&&e.target.closest('[data-ow]'))onClick(e);},true);
  GAME.on('change',(n,r)=>{if(n==='taxSet'&&r==='ok')stat('tax',{m:w().taxm,w:'set'});});
  GAME.on('day',()=>{try{evRemind(w());}catch(e){console.error(e);}});
  // итог дела хозяина — коротким сообщением (без окон)
  GAME.on('own',e=>{const W=w();if(!W||!e)return;let t='';const b=W.biz.find(x=>x.id===e.a);
    if(e.w==='evauto'){const x=EVN[e.ev];if(x)t='📰 '+L('Людмила решила за вас: «','Lyudmila decided for you: “')+x[2](e.x||{})[e.i]+L('»','”')+(b?' · '+bn(b.t):'');if(t)try{toast(t,4200);}catch(z){}return;}
    if(E.jobAutoOn&&E.jobAutoOn(W,e.w,e.a)&&!(e.w==='check'&&e.th>=1000))return;   // M30: автоповтор — без тоста на каждый круг (недостачу — показываем)
    if(e.w==='edu')t='🎓 '+L('Курс пройден: ','Course completed: ')+T(EDN[e.a]);
    else if(e.w==='check')t='🔍 '+(b?bn(b.t)+': ':'')+(e.th>=1000?L(`недостача ${M(e.th)} — управляющий нечист на руку, смените его в карточке точки`,`a shortfall of ${M(e.th)} — the manager is dishonest; replace him on the outlet card`):L('всё чисто, 3 месяца краж и поломок меньше','all clean; 3 months of less theft and fewer breakdowns'));
    else if(e.w==='neg')t='🤝 '+L(`Договорились: «${bn(e.a)}» — закупка дешевле на 3 месяца`,`Deal done: “${bn(e.a)}” — cheaper stock for 3 months`);
    else if(e.w==='spot')t='📍 '+L(`Нашли хорошее место для «${bn(e.a)}» — откройте там следующую точку`,`Found a good spot for “${bn(e.a)}” — open your next one there`);
    else if(e.w==='fly')t='📄 '+L('Листовки розданы — покупателей больше на 2 недели','Flyers handed out — more customers for 2 weeks');
    else if(e.w==='visit')t='☕ '+L(`Посидели с другом: +15 ⚡`,`Time with a friend: +15 ⚡`)+(FRN[e.a]?' · '+T(FRN[e.a]):'');
    else if(e.w==='staff')t='🎓 '+(b?bn(b.t)+': ':'')+L('персонал обучен','the staff are trained');
    else if(e.w==='stand')t='🧍 '+L('Смена за прилавком закончилась','Your counter shift is over');
    if(t)try{toast(t,3200);}catch(x){}});}
window.OWNUI={init,evBar,evRemind,evCard,ownCard,eduCard,pasRow,ptCards,ptRows,bizCards,catLine,passport,openIP,openJobs,openEdu,closeLines,tip,MSG};
if(document.readyState!=='loading')init();else document.addEventListener('DOMContentLoaded',init);
})();
