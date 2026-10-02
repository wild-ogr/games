/* ================= «Из ларька в магнаты: бизнес» — глава 5 «Недра»: интерфейс второй половины главы (M30) =================
   Модель — js/nedra.js (ECON.nedAns, EVN, scrap). Грузится после ui.js.
   • Событие с выбором: окно открывается само один раз (S.nevSeen), когда нет других окон, подсказок обучения и пузыря Людмилы;
     потом — карточка «📰 Ждёт решения» наверху карты (NEDUI.mapCard из ui.js rMap) и совет Людмилы «nev». Время в окне стоит.
     В окне: что случилось, варианты с цифрами, совет Людмилы (какой вариант и почему) и «решу позже» (через N дней решит она сама).
   • Новые торги: тост один раз на торги + строка на карте «🔨 Торги: …, ещё N дней».
   • Тексты советов (nev, chain, scrap) и новостей (nev, nevfav, scrap, botsan) — обёртки ADV.text / ADV.news (fin.js).
   Для 45+: шрифт ≥ 16 px, кнопки ≥ 48 px, без inset и gap. */
(function(){
'use strict';
const E=window.ECON;if(!E||!E.nedAns){window.NEDUI=null;return;}
const w=()=>GAME.W,$$=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const M=x=>FMT.money(x),Q=(q,g)=>FMT.qty(q,g);
const days=n=>n+' '+pl(n,'день','дня','дней','day','days'),mons=n=>n+' '+pl(n,'месяц','месяца','месяцев','month','months');
const snd=k=>{try{if(SND&&SND[k])SND[k]();}catch(e){}};
const face=m=>{try{return UI.face(m);}catch(e){return '';}};
const low=s=>String(s||'').toLowerCase();
const RIN={kuz:['в Кузбассе','in Kuzbass'],ural:['на Урале','in the Urals'],kar:['в Карелии','in Karelia']};
const rin=r=>RIN[r]?L(RIN[r][0],RIN[r][1]):NM.reg(r);
function act(name,...a){try{return GAME.act(name,...a);}catch(e){console.error(e);return null;}}

/* ---------------- тексты событий: t — заголовок, d — что случилось, o — варианты, why — совет Людмилы (i — какой вариант советует) ---------------- */
const T={
  rail:{ico:'🚂',t:()=>L('РЖД распродаёт вагоны','Railways are selling wagons'),
    d:a=>L(`Железная дорога обновляет парк и продаёт ${a.n} крепких вагонов по ${M(a.p)} за штуку — на 30 % дешевле нового. Свои вагоны возят без аренды (650 ₽ с тонны).`,`The railway is renewing its fleet and selling ${a.n} sturdy wagons at ${M(a.p)} each — 30% below new. Own wagons carry goods without rent (650 ₽ a tonne).`),
    o:a=>[L(`Купить ${a.n} вагонов · ${M(a.c)}`,`Buy ${a.n} wagons · ${M(a.c)}`),L('Не нужно','No need')],
    why:(a,i)=>i===0?L('Мы возим своё сырьё на свой завод — свои вагоны окупятся на аренде. Берём, пока дёшево.','We ship our own raw materials to our plant — own wagons pay back on rent. Let’s buy while it’s cheap.'):L('Пока нам нечего возить поездом: заводов на чужом сырье нет. Деньги нужнее на рудники.','We have nothing to ship by rail yet: no plants on outside raw materials. The money is better spent on mines.')},
  plant:{ico:'🏭',t:a=>L(`Завод-банкрот продаёт оборудование`,`A bankrupt plant is selling its equipment`),
    d:a=>L(`Соседний завод закрылся. Его оборудование — ${low(NM.obj(a.t))} ${rin(a.r)} — отдают за <b>${M(a.c)}</b> — на 25 % дешевле, и стройка на месяц короче. Сырьё — ваше же, своё, не нужно возить и покупать.`,`A neighbouring plant has closed. Its equipment for a ${low(NM.obj(a.t))} ${rin(a.r)} goes for <b>${M(a.c)}</b> — 25% cheaper, and a month shorter to build. The raw materials are your own — no freight, no purchases.`),
    o:a=>[L(`Строить со скидкой · ${M(a.c)}`,`Build at a discount · ${M(a.c)}`),L('Отказаться','Decline')],
    why:(a,i)=>i===0?L(`Посчитала: будет давать около ${M(a.m)} в месяц, окупится примерно за ${mons(a.pb)}. Не хватит денег — возьмём проектный кредит.`,`I’ve run the numbers: about ${M(a.m)} a month, paying back in about ${mons(a.pb)}. If cash runs short, we’ll take a project loan.`)
      :a.pb<99?L(`Окупится только за ${mons(a.pb)} — долго, или денег и кредита сейчас не хватит. Пропустим.`,`It would pay back only in ${mons(a.pb)} — too long, or we lack cash and credit right now. Let’s skip it.`):L('При нынешних ценах этот завод в минусе. Пропустим.','At today’s prices this plant would lose money. Let’s skip it.')},
  union:{ico:'⛑',t:()=>L('Профсоюз горняков просит прибавку','The miners’ union wants a pay rise'),
    d:a=>L(`Горняки просят +8 % к зарплате на год — это ещё <b>${M(a.x)}</b> в месяц, всего ${M(a.tot)}. Откажем — могут устроить забастовку: один рудник встанет на 10 дней.`,`The miners want +8% pay for a year — another <b>${M(a.x)}</b> a month, ${M(a.tot)} in total. Refuse, and they may strike: one mine stops for 10 days.`),
    o:a=>[L(`Согласиться · +${M(a.x)} в месяц`,`Agree · +${M(a.x)} a month`),L('Отказать','Refuse')],
    why:(a,i)=>i===0?L(`Прибавка за год — ${M(a.tot)}, а забастовка и разговоры в городе обойдутся дороже. Люди — это добыча.`,`The rise costs ${M(a.tot)} a year; a strike and the talk in town would cost more. People are the output.`):L(`Прибавка за год — ${M(a.tot)}, а 10 дней простоя одного рудника — около ${M(a.loss)}. Откажем вежливо.`,`The rise costs ${M(a.tot)} a year, while 10 days of one mine idle is about ${M(a.loss)}. Let’s politely refuse.`)},
  eco:{ico:'🌲',t:()=>L('Экологическая проверка','An environmental inspection'),
    d:a=>L(`Природнадзор едет на наши рудники. Поставить новые фильтры заранее — <b>${M(a.c)}</b>. Если не готовиться, с вероятностью 50 % — штраф ${M(a.f)} и 10 дней простоя одного рудника.`,`The environmental agency is coming to our mines. New filters in advance cost <b>${M(a.c)}</b>. Unprepared, there’s a 50% chance of a ${M(a.f)} fine and 10 days of one mine idle.`),
    o:a=>[L(`Поставить фильтры · ${M(a.c)}`,`Install filters · ${M(a.c)}`),L('Рискнуть','Take the risk')],
    why:(a,i)=>i===0?L(`Фильтры — ${M(a.c)}, а риск — половина от ${M(a.f)} плюс простой. Платим за спокойный сон.`,`Filters cost ${M(a.c)}; the risk is half of ${M(a.f)} plus downtime. Let’s pay for a good night’s sleep.`):L('Фильтры дороже, чем ожидаемый штраф. Рискнём, но аккуратно.','The filters cost more than the expected fine. Let’s take the risk, carefully.')},
  geo:{ico:'🔎',t:()=>L('Геологи нашли продолжение пласта','Geologists found the seam continues'),
    d:a=>L(`На нашем участке ${rin(a.r)} (${low(NM.obj(a.t))}) пласт уходит глубже. Доразведка — <b>${M(a.c)}</b>, и запас вырастет на ${Q(a.add,a.g)}: рудник проработает дольше.`,`At our ${low(NM.obj(a.t))} ${rin(a.r)} the seam goes deeper. Extra survey: <b>${M(a.c)}</b>, and reserves grow by ${Q(a.add,a.g)}: the mine runs longer.`),
    o:a=>[L(`Доразведать · ${M(a.c)}`,`Survey · ${M(a.c)}`),L('Не надо','No')],
    why:(a,i)=>i===0?L(`Новый запас принесёт около ${M(a.v)} — это в разы больше затрат. Стройка не нужна, рудник уже стоит.`,`The new reserves bring about ${M(a.v)} — several times the cost. No construction needed, the mine is already there.`):L('При нынешних ценах этот запас почти ничего не даст. Не тратим.','At today’s prices these reserves would bring almost nothing. Let’s not spend.')},
  export:{ico:'🚢',t:()=>L('Экспортёр ищет товар','An exporter is looking for goods'),
    d:a=>L(`«Восточный терминал» купит ${Q(a.q,a.g)} (${low(NM.good(a.g))}) за ${days(a.days)} по ${FMT.num(a.p)} ₽ — на 12 % выше цены на месте. Деньги — каждый день по мере отгрузки, недопоставка — штраф 20 %.`,`Eastern Terminal will buy ${Q(a.q,a.g)} of ${low(NM.good(a.g))} within ${days(a.days)} at ${FMT.num(a.p)} ₽ — 12% above the local price. Paid daily as goods ship; a shortfall costs 20%.`),
    o:a=>[L('Подписать','Sign'),L('Отказаться','Decline')],
    why:(a,i)=>i===0?L('Наш выпуск это покрывает — лишние 12 % к цене просто так. Подписываем.','Our output covers it — an extra 12% on price for nothing. Let’s sign.'):L('Своего выпуска на такой объём не хватит — заплатим штраф. Откажемся.','Our output won’t cover that volume — we’d pay a penalty. Let’s decline.')},
  refi:{ico:'🏦',t:()=>L('Банк предлагает рефинансирование','The bank offers refinancing'),
    d:a=>L(`Банк снизит ставку по нашим кредитам (${M(a.d)}) на 1,5 процентного пункта. Комиссия — <b>${M(a.fee)}</b> сразу.`,`The bank will cut the rate on our loans (${M(a.d)}) by 1.5 percentage points. Fee: <b>${M(a.fee)}</b> up front.`),
    o:a=>[L(`Согласиться · ${M(a.fee)}`,`Accept · ${M(a.fee)}`),L('Не надо','No')],
    why:(a,i)=>i===0?L(`Экономия на процентах — около ${M(a.sv)}, комиссия меньше. Соглашаемся.`,`Interest savings are about ${M(a.sv)}, more than the fee. Let’s accept.`):L(`Экономия около ${M(a.sv)} — не больше комиссии. Не стоит.`,`Savings of about ${M(a.sv)} — no more than the fee. Not worth it.`)},
  tip:{ico:'🧭',t:()=>L('Наводка геологов','A geologists’ tip'),
    d:a=>L(`Старые геологи знают место ${rin(a.r)}: там ${low(NM.good(a.d.g))}, около ${Q(a.d.res,a.d.g)}. Разведка по наводке — <b>${M(a.c)}</b> (дороже обычной, зато сразу и без риска «пусто»). Потом — торги, мы первооткрыватели.`,`Veteran geologists know a spot ${rin(a.r)}: ${low(NM.good(a.d.g))}, about ${Q(a.d.res,a.d.g)}. A survey on the tip costs <b>${M(a.c)}</b> (more than usual, but instant and never empty). Then an auction — we’re the finders.`),
    o:a=>[L(`Разведать · ${M(a.c)}`,`Survey · ${M(a.c)}`),L('Не сейчас','Not now')],
    why:(a,i)=>i===0?L(`Оценка участка — около ${M(a.v)}. Даже если на торгах заплатим до 0,6 оценки, выгодно. А проиграем — разведку вернут.`,`The plot is worth about ${M(a.v)}. Even paying up to 0.6 of that at auction, it’s worth it. If we lose, the survey is refunded.`):L(`Оценка участка — около ${M(a.v)}, а денег сейчас немного. Не будем распыляться.`,`The plot is worth about ${M(a.v)}, and cash is short now. Let’s not spread ourselves thin.`)},
  town:{ico:'🏫',t:()=>L('Город просит помочь','The town asks for help'),
    d:a=>L(`Администрация просит отремонтировать школу рядом с нашим рудником — <b>${M(a.c)}</b>. Взамен обещают: следующий участок, который найдут наши геологи, оформят без торгов по стартовой цене.`,`The administration asks us to renovate a school near our mine — <b>${M(a.c)}</b>. In return: the next plot our geologists find will be licensed without an auction at the starting price.`),
    o:a=>[L(`Помочь · ${M(a.c)}`,`Help · ${M(a.c)}`),L('Вежливо отказать','Politely decline')],
    why:(a,i)=>i===0?L('Деньги небольшие, а лицензия без торгов сэкономит десятки миллионов. И школе хорошо.','It’s not much money, and a licence without an auction saves tens of millions. Good for the school too.'):L('Денег сейчас впритык — сначала свои стройки. Город поймёт.','Cash is tight right now — our builds come first. The town will understand.')}};
window.NEDTXT=T;

/* ---------------- окно события ---------------- */
function evOf(W){return W&&W.nx&&W.nx.ev||null;}
function open(){const W=w(),e=evOf(W);if(!W||!e)return false;const D=T[e.k];if(!D)return false;const a=e.a,adv=E.nedAdv(W),left=Math.max(0,e.x-W.t),opts=D.o(a),def=E.EVN[e.k].def;
  try{(S.nevSeen||(S.nevSeen={}))[e.id]=1;save();}catch(x){}snd('alert');
  modal(`<h2>${D.ico} ${esc(D.t(a))}</h2><p>${D.d(a)}</p>
    <div class="say">${face(adv===0?'calm':'worry')}<div><p><b>${L('Людмила Санна','Lyudmila Sanna')}:</b> ${esc(D.why(a,adv))}</p></div></div>
    <div class="nev-o">${opts.map((t,i)=>`<button class="btn ${i===adv?'green':''} w noenter" data-nev="${i}" style="margin-top:8px">${esc(t)}${i===adv?`<small>${L('совет Людмилы','Lyudmila’s advice')}</small>`:''}</button>`).join('')}</div>
    <p class="mut" style="font-size:15px;margin-top:10px">${L(`Без ответа через ${days(left)} решит Людмила: «${esc(opts[def])}».`,`Without an answer, in ${days(left)} Lyudmila will choose “${esc(opts[def])}”.`)}</p>
    <div class="row"><button class="btn" id="nevLater" data-esc>${L('Решу позже','Decide later')}</button></div>`);
  try{modalRe=open;}catch(x){}
  document.querySelectorAll('#mcard [data-nev]').forEach(b=>b.onclick=()=>{const i=+b.dataset.nev,r=act('nedAns',i);
    if(r==='ok'){hideModal();snd('coin');toast(D.ico+' '+L('Решено: ','Done: ')+opts[i]);}
    else if(r==='cash'){snd('no');toast(L('Не хватает денег — можно взять кредит в «Финансах»','Not enough cash — you can take a loan in Finance'));}
    else{snd('no');hideModal();}});
  $$('nevLater').onclick=()=>{snd('tap');hideModal();};return true;}
// карточка на карте: ждёт решения + идущие торги
function mapCard(){const W=w();if(!W||!W.ned)return '';let h='';const e=evOf(W);
  if(e&&T[e.k]){const left=Math.max(0,e.x-W.t);h+=`<button class="card tap nev-c noenter" data-nevo="1" style="display:flex;align-items:center;width:100%;text-align:left;border-left:5px solid var(--accent)"><span style="font-size:28px;margin-right:12px">${T[e.k].ico}</span><span style="flex:1;min-width:0"><b style="display:block;font-size:18px">${L('Ждёт решения','Awaiting your decision')}: ${esc(T[e.k].t(e.a))}</b><small class="mut" style="font-size:15px">${L(`ещё ${days(left)} — потом решит Людмила`,`${days(left)} left — then Lyudmila decides`)}</small></span><span class="chev">›</span></button>`;}
  const au=W.auc.filter(a=>!a.done).slice(0,3);
  for(const a of au)h+=`<button class="card tap noenter" data-auco="${a.id}" style="display:flex;align-items:center;width:100%;text-align:left"><span style="font-size:24px;margin-right:12px">🔨</span><span style="flex:1;min-width:0"><b style="display:block;font-size:17px">${L('Торги','Auction')}: ${low(NM.good(a.g))}, ${NM.reg(a.r)}</b><small class="mut" style="font-size:15px">${L('цена','price')} ${M(a.pr)} · ${L('лидер','leader')}: ${a.lead==='you'?L('вы','you'):a.lead?esc(NM.bot(a.lead)):L('пока никто','nobody yet')} · ${L('ещё','left')} ${days(Math.max(0,a.end-W.t))}</small></span><span class="chev">›</span></button>`;
  return h;}
document.addEventListener('click',ev=>{const t=ev.target&&ev.target.closest?ev.target.closest('[data-nevo],[data-auco]'):null;if(!t)return;ev.preventDefault();ev.stopPropagation();snd('tap');
  if(t.dataset.nevo)open();else{const W=w(),a=W&&W.auc.find(x=>x.id===t.dataset.auco);if(a){try{UI.openRegion(a.r);}catch(x){}try{UI.openAuc(a.id);}catch(x){}}}},true);
// само окно — один раз на событие, в спокойный момент (нет окон, обучения, пузыря Людмилы, рекламы)
function quiet(){if(typeof modalOn!=='undefined'&&modalOn)return false;if(typeof paused!=='undefined'&&paused)return false;if(document.hidden)return false;
  try{if(UI.tutStep&&UI.tutStep())return false;}catch(x){}const a=$$('adv');if(a&&a.classList.contains('on'))return false;const d=$$('ad');if(d&&d.classList.contains('on'))return false;return true;}
const aucSeen={};let busyT=0;
setInterval(()=>{const W=w();if(!W||!W.ned)return;if(typeof modalOn!=='undefined'&&modalOn){busyT=Date.now();return;}if(Date.now()-busyT<2500||!quiet())return;
  const e=evOf(W);if(e&&!(S.nevSeen&&S.nevSeen[e.id])){open();return;}
  for(const a of W.auc){if(a.done||aucSeen[a.id])continue;aucSeen[a.id]=1;if(W.t-(a.end-15)>3)continue;
    try{toast('🔨 '+L(`Новые торги: ${low(NM.good(a.g))}, ${NM.reg(a.r)} — ${days(Math.max(0,a.end-W.t))}. Карта → регион.`,`New auction: ${low(NM.good(a.g))}, ${NM.reg(a.r)} — ${days(Math.max(0,a.end-W.t))}. Map → region.`),4500);}catch(x){}break;}},1500);

/* ---------------- советы и новости ---------------- */
function advTxt(it){const a=it.a||{};
  if(it.k==='nev'){const W=w(),e=evOf(W);return e&&T[e.k]?L(`${T[e.k].ico} Ждёт решения: «${T[e.k].t(e.a)}». Загляните — я посчитала варианты.`,`${T[e.k].ico} Awaiting a decision: “${T[e.k].t(e.a)}”. Take a look — I’ve priced the options.`):'';}
  if(it.k==='chain')return L(`${NM.obj(a.t)} ${rin(a.r)} на своём сырье окупится примерно за ${mons(a.pb)}: своё не нужно везти и покупать, а переделанный товар дороже. Это хороший шаг до IPO.`,`A ${low(NM.obj(a.t))} ${rin(a.r)} on your own raw materials pays back in about ${mons(a.pb)}: no freight or purchases, and processed goods sell for more. A good step before the IPO.`);
  if(it.k==='scrap')return L(`${NM.obj(a.t)} ${rin(a.r)} выработан и стоит законсервированный. Можно закрыть и продать оборудование — постоянные расходы уйдут совсем.`,`The ${low(NM.obj(a.t))} ${rin(a.r)} is exhausted and mothballed. Close it and sell the equipment — the fixed costs go away for good.`);
  return null;}
function newsTxt(n){const a=n.a||{},d=FMT.mon(n.m)+' · ';
  if(n.k==='nev'){const D=T[a.k];if(!D)return '';const W=w();return d+D.ico+' '+D.t({})+': '+(a.auto?L('решила Людмила','Lyudmila decided'):L('ваше решение','your decision'));}
  if(n.k==='nevfav')return d+L(`Город сдержал слово: лицензия ${rin(a.r)} без торгов — ${M(a.pr)}.`,`The town kept its word: a licence ${rin(a.r)} without an auction — ${M(a.pr)}.`);
  if(n.k==='scrap')return d+L(`Закрыт выработанный объект: ${low(NM.obj(a.t))}, ${NM.reg(a.r)}. Оборудование продано за ${M(a.pr)}.`,`Closed an exhausted ${low(NM.obj(a.t))} in ${NM.reg(a.r)}. Equipment sold for ${M(a.pr)}.`);
  if(n.k==='botsan')return d+L(`«${NM.bot(a.b)}» обанкротился: продал ${a.n} ${pl(a.n,'актив','актива','активов','asset','assets')}, участки уходят на торги.`,`${NM.bot(a.b)} went bankrupt: sold ${a.n} ${a.n===1?'asset':'assets'}, its plots go to auction.`);
  return null;}
function wrap(){const A=window.ADV;if(!A||A.__ned){if(!A)setTimeout(wrap,300);return;}A.__ned=1;
  const t0=A.text,n0=A.news;A.text=function(it){const x=it&&advTxt(it);return x!=null?x:t0.apply(this,arguments);};A.news=function(n){const x=n&&newsTxt(n);return x!=null?x:n0.apply(this,arguments);};}
wrap();
// выработанный рудник: кнопка «закрыть и продать» в карточке объекта (дорисовываем после перерисовки «Объектов»)
function objBtns(){const W=w();if(!W||!W.ned)return;const el=$$('scr-obj');if(!el||!el.classList.contains('on'))return;
  for(const o of W.obj){const x=E.scrapOk(W,o.id);if(!x)continue;const c=$$('ob-'+o.id);if(!c||!c.classList.contains('open')||c.querySelector('[data-scrap]'))continue;
    const b=document.createElement('button');b.className='btn noenter w';b.dataset.scrap=o.id;b.style.marginTop='8px';
    b.innerHTML=`🔧 ${L('Закрыть и продать оборудование','Close and sell the equipment')}<small>${x.pr>=1e5?'+'+M(x.pr)+' · ':''}${L('расходы','costs')} −${M(x.fix)} ${L('в мес.','a month')}</small>`;c.appendChild(b);}}
document.addEventListener('click',ev=>{const t=ev.target&&ev.target.closest?ev.target.closest('[data-scrap]'):null;if(!t)return;ev.preventDefault();ev.stopPropagation();const W=w(),x=E.scrapOk(W,t.dataset.scrap);if(!x)return;snd('tap');
  modal(`<h2>🔧 ${L('Закрыть рудник?','Close the mine?')}</h2><p>${L(`${NM.obj(x.o.t)} ${rin(x.o.r)} выработан до дна. ${x.pr>=1e5?`Оборудование купят за ${M(x.pr)} (25 % остаточной стоимости ${M(x.bk)}).`:'Оборудование уже полностью списано (амортизация) — денег за него почти не дадут.'} Постоянные расходы — ${M(x.fix)} в месяц — уйдут совсем. Участок станет пустым.`,`The ${low(NM.obj(x.o.t))} ${rin(x.o.r)} is fully exhausted. ${x.pr>=1e5?`The equipment sells for ${M(x.pr)} (25% of the ${M(x.bk)} book value).`:'The equipment is fully depreciated — it will fetch next to nothing.'} Fixed costs of ${M(x.fix)} a month go away. The plot becomes empty.`)}</p>
    <div class="row"><button class="btn green noenter" id="scY">${L('Закрыть и продать','Close and sell')}</button><button class="btn" id="scN" data-esc>${L('Отмена','Cancel')}</button></div>`);
  $$('scN').onclick=()=>{snd('tap');hideModal();};$$('scY').onclick=()=>{hideModal();if(act('scrap',x.o.id)==='ok'){snd('coin');toast(L('Оборудование продано: +','Equipment sold: +')+M(x.pr));}};},true);
try{GAME.on('change',()=>setTimeout(objBtns,30));GAME.on('day',()=>setTimeout(objBtns,30));document.addEventListener('click',()=>setTimeout(objBtns,60));}catch(x){}
window.NEDUI={open,mapCard,advTxt,newsTxt,T};
})();
