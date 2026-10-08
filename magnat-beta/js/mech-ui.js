/* ================= «Из ларька в магнаты: бизнес» — своя механика дел: интерфейс (M21) =================
   Модель — js/mech.js (ECON.mx*). Грузится после owner-ui.js. Хуки: OWNUI.ptCards зовёт MECHUI.card(W,b) — карточка показателя наверху точки;
   biz-ui: ptRow — MECHUI.badge(W,b) (короткий показатель в списке точек), советы Людмилы z_mx — MECHUI.adv(a). Кнопки — атрибут data-mx.
   Людмила объясняет механику один раз (S.o2t: mx_shaw, mx_coffee, mx_pvz, mx_sto). Для 45+: шрифт ≥ 15 px, кнопки ≥ 48 px, без inset и gap. */
(function(){
'use strict';
const E=window.ECON;if(!E||!E.mxHint){window.MECHUI=null;return;}
const w=()=>GAME.W,$$=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const M=x=>FMT.money(x),Mr=x=>M(Math.round(x/(Math.abs(x)>=1e5?1000:100))*(Math.abs(x)>=1e5?1000:100));
const days=n=>n+' '+pl(n,'день','дня','дней','day','days');
const snd=k=>{try{if(SND&&SND[k])SND[k]();}catch(e){}};
const pct=x=>Math.round(x*100)+L(' %','%');
const face=m=>{try{return UI.face(m);}catch(e){return '';}};
const bn=t=>E.BIZ[t]?L(E.BIZ[t].n,E.BIZ[t].en):t;
const d1=x=>(Math.round(x*10)/10).toLocaleString(LANG==='en'?'en-US':'ru-RU');
function act(name,...a){try{return GAME.act(name,...a);}catch(e){console.error(e);return null;}}

const CSS=`
.mx-card{border-left:5px solid var(--accent)}
.mx-h{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap}.mx-h b{font-size:18px}.mx-h span{font-size:18px;font-weight:700;margin-left:12px}
.mx-bar{height:14px;border-radius:8px;background:var(--track);overflow:hidden;margin:8px 0 4px;position:relative}
.mx-bar i{display:block;height:100%;border-radius:8px;background:var(--good)}.mx-bar i.w{background:var(--warn,#9a6200)}.mx-bar i.b{background:var(--bad)}
.mx-bar s{position:absolute;top:0;bottom:0;width:2px;background:var(--ink);opacity:.35}
.mx-card p{margin:6px 0 0;font-size:16px;line-height:1.4}.mx-card p.g{color:var(--good)}.mx-card p.w{color:var(--warn,#9a6200)}.mx-card p.b{color:var(--bad)}
.mx-row{display:flex;align-items:center;padding:10px 0 0;margin-top:10px;border-top:1px solid var(--line)}
.mx-row .f1{flex:1;min-width:0;margin-right:10px}.mx-row .f1 b{display:block;font-size:17px;font-weight:600;line-height:1.25}.mx-row .f1 small{display:block;color:var(--muted);font-size:15px;line-height:1.3}
.mx-row .btn{flex:none;min-width:104px;min-height:48px;padding:8px 12px;white-space:normal;line-height:1.2}
.mx-sw{flex:none;min-width:88px;min-height:48px;border-radius:24px;border:2px solid var(--line);background:var(--card);font-size:16px;font-weight:700;color:var(--muted)}
.mx-sw.on{background:var(--good);border-color:var(--good);color:#fff}
.mx-chips{display:flex;flex-wrap:wrap;margin:6px -3px 0}.mx-chips span{margin:3px;background:var(--soft);border-radius:999px;padding:4px 10px;font-size:15px;color:var(--ink2)}
.mx-chips span.b{background:var(--bad-t,#fdecec);color:var(--bad)}
.mx-tip{margin:10px 0 4px;background:var(--soft2,#f4f1ea);border-radius:14px;padding:10px 12px}.mx-tip p{margin:0 0 8px;font-size:16px;line-height:1.4}.mx-tip .btn{min-height:44px}
`;
function css(){if($$('mxCss'))return;const s=document.createElement('style');s.id='mxCss';s.textContent=CSS;document.head.appendChild(s);}

/* ---------------- Людмила объясняет один раз ---------------- */
const TIP={
  shaw:()=>L('У шаурмы главное — чистота. Каждый день кухня грязнится. Чисто — гостей больше и проверка приходит реже. Грязно — гости уходят, а санитарный врач — тут как тут. Проще всего включить уборку по графику.','For a shawarma stand, cleanliness is everything. The kitchen gets dirtier every day. Clean means more customers and fewer inspections. Dirty means customers walk away — and the health inspector shows up. The easiest way is to switch on scheduled cleaning.'),
  coffee:()=>L('Кофейня живёт постоянными гостями: они приходят каждое утро. Их становится больше, когда за стойкой опытные бариста или вы сами. Летом можно открыть вечернюю смену — вечером гуляют и пьют кофе. Зимой вечер не окупается — выключайте.','A coffee stand lives on regulars: they come every morning. You get more of them with experienced baristas or when you stand at the counter yourself. In summer an evening shift pays — people stroll and drink coffee. In winter the evening doesn’t pay — switch it off.'),
  pvz:()=>L('Пункт выдачи зарабатывает на каждой посылке. В ноябре и декабре — распродажи, посылок на треть больше. Склад не резиновый: переполнится — маркетплейс штрафует и снижает рейтинг. Возьмите помощника заранее, в конце октября.','A pick-up point earns on every parcel. November and December bring sales — a third more parcels. The store room isn’t endless: if it overflows, the marketplace fines you and lowers your rating. Hire a helper in advance, at the end of October.'),
  sto:()=>L('В автосервисе следите за очередью. Пусто — мастера сидят без дела: позовите клиентов акцией на ТО. Очередь больше трёх дней — люди уезжают к конкурентам: работайте в выходные.','In a car service, watch the queue. Empty — mechanics sit idle: bring customers in with a service promotion. A queue of more than three days — people go to competitors: work weekends.')};
function tip(t){if(!S.o2t||typeof S.o2t!=='object')S.o2t={};const k='mx_'+t;if(S.o2t[k]||!TIP[t])return '';
  return `<div class="say mx-tip">${face('calm')}<div><p>${esc(TIP[t]())}</p><button class="btn sm noenter" data-mx="tip" data-k="${k}">${L('Понятно','Got it')}</button></div></div>`;}

/* ---------------- части карточки ---------------- */
function bar(p,cls,mark){return `<div class="mx-bar" aria-hidden="true"><i class="${cls||''}" style="width:${Math.max(2,Math.min(100,p*100)).toFixed(1)}%"></i>${mark!=null?`<s style="left:${(mark*100).toFixed(1)}%"></s>`:''}</div>`;}
function sw(on,id,a,lbl){return `<button class="mx-sw noenter${on?' on':''}" data-mx="act" data-id="${id}" data-a="${a}" data-v="${on?0:1}" role="switch" aria-checked="${on?'true':'false'}" aria-label="${esc(lbl)}">${on?L('вкл','on'):L('выкл','off')}</button>`;}
function btn(id,a,lbl,ok,green){return `<button class="btn sm noenter${green?' green':''}" data-mx="act" data-id="${id}" data-a="${a}"${ok!=='ok'?' disabled':''}>${lbl}</button>`;}
function lastLine(X,what){if(!X||Math.abs(X.lr||0)<1000)return '';return `<p class="${X.lr>0?'g':'b'}">📊 ${L('За прошлый месяц ','Last month ')+esc(what)+': '+(X.lr>0?'+':'−')+Mr(Math.abs(X.lr))}</p>`;}
const whoTxt=(W,b)=>E.mxWho(W,b);
const STAND=()=>L(' Дело хозяина «Встать за прилавок» — 5 дней как при вас.',' The owner’s task “Stand at the counter” — 5 days as if you were there.');
function dayOf(W,t){const dd=W.d+(t-W.t),mm=W.m+Math.floor(dd/30),d=(dd%30)+1;try{return d+' '+FMT.mon(mm).split(' ')[0];}catch(e){return d+'';}}

function shawCard(W,b){const X=b.mx,S0=E.MX_SH,v=X.v,wh=whoTxt(W,b),k=E.mxShK(v);const cls=v>=S0.hi?'':v>=S0.lo?'w':'b';
  let h=`<div class="mx-h"><b>🧼 ${L('Чистота кухни','Kitchen cleanliness')}</b><span>${Math.round(v)} %</span></div>${bar(v/100,cls,S0.hi/100)}`;
  h+=v>=S0.hi?`<p class="g">${L(`Чисто: гостям нравится (+${Math.round(S0.dHi*100)} % гостей), проверка придёт вдвое реже.`,`Clean: customers like it (+${Math.round(S0.dHi*100)}% customers), inspections come half as often.`)}</p>`
    :v>=S0.lo?`<p class="w">${L('Пора убраться: ниже 70 % гости перестают замечать чистоту, ниже 50 % — уходят.','Time to clean: below 70% customers stop noticing, below 50% they leave.')}</p>`
    :`<p class="b">${L(`Грязно: гостей меньше на ${Math.round((1-k)*100)} %, проверка вдвое вероятнее.`,`Dirty: ${Math.round((1-k)*100)}% fewer customers, an inspection is twice as likely.`)}</p>`;
  h+=`<p>🕐 ${L('Обеденный пик 12–14 ч: ','Lunch rush, 12–2 pm: ')}${(b.lv||1)>=2?L('второй гриль — очереди нет.','a second grill — no queue.'):L('очередь, часть гостей уходит. Поможет «Второй гриль» в улучшениях.','a queue, some customers leave. A “second grill” upgrade helps.')}</p>`;
  h+=tip('shaw');
  const r=E.mxOk(W,b.id,'clean');
  h+=`<div class="mx-row"><span class="f1"><b>🧽 ${L('Санитарный день','Deep-clean day')} · ${M(S0.c)}</b><small>${L('чистота — 100 %, точка работает как обычно (моют после закрытия)','cleanliness back to 100%, the stand works as usual (cleaned after closing)')}</small></span>${btn(b.id,'clean',r==='cd'?L('Чисто','Clean'):L('Убрать','Clean now'),r,v<S0.hi)}</div>`;
  h+=`<div class="mx-row"><span class="f1"><b>📅 ${L('По графику — раз в 2 недели','On a schedule — every 2 weeks')}</b><small>${L('≈ '+Mr(S0.c*30/S0.plan)+' в месяц, кухня всегда чистая','≈ '+Mr(S0.c*30/S0.plan)+' a month, the kitchen is always clean')}${wh==='mgr'?L('; управляющий иногда забывает','; the manager sometimes forgets'):''}</small></span>${sw(!!X.pl,b.id,'plan',L('Уборка по графику','Scheduled cleaning'))}</div>`;
  h+=`<p style="color:var(--muted)">${wh==='mgr'?L(`Без графика управляющий моет, только когда уже грязно — при ${E.MX_SH.th.mgr} %.`,`Without a schedule the manager only cleans once it’s dirty — at ${E.MX_SH.th.mgr}%.`)+STAND():L(`Без графика персонал моет при ${E.MX_SH.th[wh]||E.MX_SH.th.own} %.`,`Without a schedule the staff clean at ${E.MX_SH.th[wh]||E.MX_SH.th.own}%.`)}${b.k&&b.k.san==='strict'?L(' Строгая санитария: грязнится вдвое медленнее.',' Strict hygiene: it gets dirty half as fast.'):''}</p>`;
  return h+lastLine(X,L('чистота дала','cleanliness gave'));}
function coffeeCard(W,b){const X=b.mx,C=E.MX_CF,v=X.v,T=E.mxCfTarget(W,b),wh=whoTxt(W,b),k=E.mxCfK(v)/E.mxCfK(50)-1;
  let h=`<div class="mx-h"><b>❤ ${L('Постоянные гости','Regulars')}</b><span>${Math.round(v)}${L(' из 100',' of 100')}</span></div>${bar(v/100,v>=45?'':v>=30?'w':'b',T/100)}`;
  h+=`<p class="${Math.abs(k)<.005?'':k>0?'g':'w'}">${Math.abs(k)<.005?L('Гостей — как у обычной кофейни.','Customers — like an ordinary coffee stand.'):k>0?L(`Гостей больше обычного на ${pct(k)}.`,`${pct(k)} more customers than usual.`):L(`Гостей меньше обычного на ${pct(-k)}.`,`${pct(-k)} fewer customers than usual.`)} ${Math.round(T)>Math.round(v)?L(`Растут — до ${Math.round(T)}.`,`Growing — up to ${Math.round(T)}.`):Math.round(T)<Math.round(v)?L(`Уходят — до ${Math.round(T)}.`,`Leaving — down to ${Math.round(T)}.`):''}</p>`;
  const ch=[],sg=x=>(x>0?'+':'−')+Math.abs(x);if(b.k&&b.k.bar==='pro')ch.push(['',L('опытные бариста ','experienced baristas ')+sg(C.pro)]);else ch.push(['b',L('бариста-стажёры: опытные дали бы ','trainee baristas: experienced ones would give ')+sg(C.pro)]);
  if(wh==='own'&&C.own)ch.push(['',L('вы за стойкой ','you at the counter ')+sg(C.own)]);else if(wh==='mgr'&&C.mgr)ch.push(['b',L('управляющий ','manager ')+sg(C.mgr)]);
  if((b.lv||1)>=3)ch.push(['',L('карта гостя ','loyalty card ')+sg(C.card)]);else ch.push(['b',L('карта гостя (улучшение 3) дала бы ','a loyalty card (upgrade 3) would give ')+sg(C.card)]);if(X.eve)ch.push(['',L('вечер ','evening ')+sg(C.eve)]);
  h+=`<div class="mx-chips">${ch.map(x=>`<span class="${x[0]}">${esc(x[1])}</span>`).join('')}</div>`+tip('coffee');
  const m=W.m%12,g=E.mxEveGain(W,b,m),g1=E.mxEveGain(W,b,(m+1)%12);
  h+=`<div class="mx-row"><span class="f1"><b>🌙 ${L('Вечерняя смена до 22:00','Evening shift till 10 pm')} · ${M(C.EVF)}${L(' в месяц',' a month')}</b><small>${L('в этом месяце ','this month ')}${g>=0?L('даст ≈ +','adds ≈ +')+Mr(g):L('в убыток ≈ −','loses ≈ −')+Mr(-g)}${L('; в следующем ','; next month ')}${g1>=0?'+'+Mr(g1):'−'+Mr(-g1)}${b.k&&b.k.place==='bc'?L(' (бизнес-центр вечером пустой)',' (the business centre is empty in the evening)'):''}</small></span>${sw(!!X.eve,b.id,'eve',L('Вечерняя смена','Evening shift'))}</div>`;
  h+=`<p style="color:var(--muted)">${L('Летом вечер приносит деньги, зимой — убыток. ','In summer the evening pays, in winter it loses money. ')}${wh==='mgr'?L('Управляющий часы сам не меняет — переключайте весной и осенью.','The manager won’t change the hours himself — switch them in spring and autumn.')+STAND():L('Я напомню, когда пора переключить.','I’ll remind you when it’s time to switch.')}</p>`;
  return h+lastLine(X,L('постоянные гости дали','regulars gave'));}
function pvzCard(W,b){const X=b.mx,P=E.MX_PV,ld=X.v||0,wh=whoTxt(W,b),hu=X.hu>W.t,m=W.m%12;const cls=ld<=.95?'':ld<=1?'w':'b';
  let h=`<div class="mx-h"><b>📦 ${L('Склад посылок загружен','Parcel store room load')}</b><span>${pct(ld)}</span></div>${bar(Math.min(1,ld/1.3),cls,1/1.3)}`;
  h+=ld>1?`<p class="b">${L('Склад переполнен: часть посылок уходит в другие пункты, маркетплейс штрафует за просрочку и снижает рейтинг ⭐.','The store room is overflowing: some parcels go to other points, the marketplace fines you for delays and lowers your rating ⭐.')}${X.fm?' '+L('Штрафы в этом месяце: ','Fines this month: ')+M(X.fm)+'.':''}</p>`
    :`<p class="g">${L('Справляемся: посылки выдаём вовремя.','Coping: parcels go out on time.')}</p>`;
  const nov=E.mxPvFlow(W,b,10)/E.mxPvCap(W,b,false);
  h+=`<p>🛍 ${L(`Ноябрь и декабрь — распродажи: посылок на ${Math.round((E.MX_PV.PS[10]-1)*100)} % больше. `,`November and December are sale season: ${Math.round((E.MX_PV.PS[10]-1)*100)}% more parcels. `)}${nov>1?L(`Без помощника склад будет загружен на ${pct(nov)}.`,`Without a helper the store room will be at ${pct(nov)}.`):L('Нашему складу хватит места.','Our store room will cope.')}</p>`+tip('pvz');
  if(hu)h+=`<div class="mx-row"><span class="f1"><b>🚶 ${L('Помощник работает','The helper is working')}</b><small>${L('до ','until ')+esc(dayOf(W,X.hu))+L(': склад принимает на 30 % больше',': the store room takes 30% more')}</small></span></div>`;
  else{const r=E.mxOk(W,b.id,'help'),sea=E.mxPvSea(W),pr=E.mxPvPrice(W);
    h+=`<div class="mx-row"><span class="f1"><b>🚶 ${sea?L('Помощник на распродажи','A helper for the sales'):L('Помощник на 30 дней','A helper for 30 days')} · ${M(pr)}</b><small>${L(M(E.MX_PV.cd)+' в день',M(E.MX_PV.cd)+' a day')}${sea?L(' до 31 декабря',' until 31 December'):''}${L('; склад принимает на 30 % больше','; the store room takes 30% more')}</small></span>${btn(b.id,'help',L('Нанять','Hire'),r,ld>1||sea&&nov>1)}</div>`;}
  h+=`<p style="color:var(--muted)">${wh==='mgr'?L(`Без вас управляющий позовёт помощника только после ${days(E.MX_PV.th.mgr)} переполнения.`,`Without you the manager only calls a helper after ${days(E.MX_PV.th.mgr)} of overflow.`)+STAND():L(`Без вас помощника позовут после ${days(E.MX_PV.th[wh]||E.MX_PV.th.own)} переполнения.`,`Without you a helper is called after ${days(E.MX_PV.th[wh]||E.MX_PV.th.own)} of overflow.`)}</p>`;
  if(X.lfm||X.llost>.002)h+=`<p class="b">📊 ${L('В прошлом месяце: ','Last month: ')}${X.lfm?L('штрафы ','fines ')+M(X.lfm):''}${X.lfm&&X.llost>.002?', ':''}${X.llost>.002?L('ушло в другие пункты ','went to other points ')+pct(X.llost):''}</p>`;
  return h;}
function stoCard(W,b){const X=b.mx,Q=X.v||0,wh=whoTxt(W,b),ot=X.ot>W.t,pr=X.pr>W.t;const cls=Q<1?'w':Q<=3?'':'b';
  let h=`<div class="mx-h"><b>🚗 ${L('Очередь машин','Car queue')}</b><span>${L('на ','')}${d1(Q)} ${L('дн.','d')}</span></div>${bar(Math.min(1,Q/6),cls,3/6)}`;
  h+=Q<1?`<p class="w">${L('Посты простаивают: мастерам нечего делать — позовите клиентов акцией.','Bays stand idle: the mechanics have nothing to do — bring customers in with a promotion.')}</p>`
    :Q<=3?`<p class="g">${L('Очередь в норме: машины записаны на ближайшие дни.','The queue is fine: cars are booked for the next few days.')}</p>`
    :`<p class="b">${L('Очередь длинная: часть клиентов уезжает к конкурентам. Поработайте в выходные.','The queue is long: some customers go to competitors. Work weekends.')}</p>`;
  h+=`<p>🔩 ${(b.lv||1)>=5?L('Свой склад запчастей — машины не ждут деталей.','Own spare-parts store — cars don’t wait for parts.'):L('Запчасти — под заказ: часть машин ждёт деталей. Свой склад — в улучшениях.','Parts are ordered in: some cars wait for them. An own store is among the upgrades.')} ${L('Весной и осенью машин больше — переобувка и ТО.','Spring and autumn are busier — tyre changes and servicing.')}</p>`+tip('sto');
  const r1=E.mxOk(W,b.id,'promo'),r2=E.mxOk(W,b.id,'ot');
  h+=`<div class="mx-row"><span class="f1"><b>📣 ${L('Акция на ТО','Service promotion')} · ${M(E.MX_ST.prC)}</b><small>${pr?L('идёт ещё ','running, ')+days(X.pr-W.t)+L('',' left'):L('7 дней машин больше — когда очередь пустая','7 days of more cars — when the queue is empty')}</small></span>${btn(b.id,'promo',pr?L('Идёт','On'):L('Запустить','Run'),r1,Q<1&&!pr)}</div>`;
  h+=`<div class="mx-row"><span class="f1"><b>⏰ ${L('Работа в выходные','Weekend work')} · ${M(E.MX_ST.otC)}</b><small>${ot?L('идёт ещё ','running, ')+days(X.ot-W.t)+L('',' left'):L('неделю чиним на 30 % больше машин — когда очередь длинная','for a week we fix 30% more cars — when the queue is long')}</small></span>${btn(b.id,'ot',ot?L('Идёт','On'):L('Начать','Start'),r2,Q>3&&!ot)}</div>`;
  h+=`<p style="color:var(--muted)">${wh==='mgr'?L(`Управляющий акций не делает, а в выходные выходит, только когда очередь больше ${d1(E.MX_ST.th.mgr)} дн.`,`The manager runs no promotions and only works weekends once the queue tops ${d1(E.MX_ST.th.mgr)} days.`)+STAND():L(`Без вас мастера выходят в выходные, только когда очередь больше ${d1(E.MX_ST.th[wh]||E.MX_ST.th.own)} дн.`,`Without you the mechanics only work weekends once the queue tops ${d1(E.MX_ST.th[wh]||E.MX_ST.th.own)} days.`)}</p>`;
  if(X.lidle>=.5||X.lgone>=.5)h+=`<p class="w">📊 ${L('В прошлом месяце: ','Last month: ')}${X.lidle>=.5?L('простой ','idle ')+d1(X.lidle)+L(' дн.',' d'):''}${X.lidle>=.5&&X.lgone>=.5?', ':''}${X.lgone>=.5?L('уехали к конкурентам ≈ ','went to competitors ≈ ')+d1(X.lgone)+L(' дн. работы',' d of work'):''}</p>`;
  return h;}
const CARDS={shaw:shawCard,coffee:coffeeCard,pvz:pvzCard,sto:stoCard};
function card(W,b){if(!W||W.ned||!CARDS[b.t]||b.st!=='w')return '';E.mxOf(W,b);try{return `<div class="card mx-card">${CARDS[b.t](W,b)}</div>`;}catch(e){console.error(e);return '';}}
// короткий показатель для списка точек
function badge(W,b){if(!W||W.ned||!CARDS[b.t]||b.st!=='w'||!b.mx)return '';const X=b.mx;
  if(b.t==='shaw')return ' · 🧼 '+Math.round(X.v)+L(' %','%');if(b.t==='coffee')return ' · ❤ '+Math.round(X.v);
  if(b.t==='pvz')return ' · 📦 '+pct(X.v||0);if(b.t==='sto')return ' · 🚗 '+d1(X.v||0)+L(' дн.',' d');return '';}
// совет Людмилы z_mx: {id, bt, a, why, v, g, ld}
function adv(a){a=a||{};const n=bn(a.bt);
  if(a.a==='plan')return L(`«${n}»: включите уборку по графику — кухня будет всегда чистой, гостей больше, проверок меньше.`,`“${n}”: switch on scheduled cleaning — the kitchen stays clean, more customers, fewer inspections.`);
  if(a.a==='clean')return L(`«${n}»: на кухне грязновато — пора санитарный день, 3 000 ₽.`,`“${n}”: the kitchen is getting dirty — time for a deep-clean day, 3,000 ₽.`);
  if(a.a==='eve')return a.v?L(`«${n}»: потеплело — откройте вечернюю смену, ≈ +${Mr(a.g||0)} в месяц.`,`“${n}”: it’s warmer — open the evening shift, ≈ +${Mr(a.g||0)} a month.`):L(`«${n}»: похолодало, вечером пусто — закройте вечернюю смену, сбережём ≈ ${Mr(a.g||0)} в месяц.`,`“${n}”: it’s colder and the evenings are empty — close the evening shift, saving ≈ ${Mr(a.g||0)} a month.`);
  if(a.a==='help')return a.why==='soon'?L(`«${n}»: скоро распродажи — склад будет загружен на ${pct(a.ld||1)}. Возьмите помощника заранее.`,`“${n}”: sales are coming — the store room will be at ${pct(a.ld||1)}. Hire a helper in advance.`):L(`«${n}»: склад переполнен — маркетплейс штрафует. Нужен помощник.`,`“${n}”: the store room is overflowing — the marketplace is fining us. We need a helper.`);
  if(a.a==='ot')return L(`«${n}»: очередь больше трёх дней, клиенты уезжают — поработайте в выходные, 10 000 ₽.`,`“${n}”: the queue is over three days, customers are leaving — work weekends, 10,000 ₽.`);
  if(a.a==='promo')return L(`«${n}»: посты простаивают — запустите акцию на ТО, 15 000 ₽.`,`“${n}”: the bays are idle — run a service promotion, 15,000 ₽.`);
  return '';}

/* ---------------- нажатия ---------------- */
const RES={clean:()=>L('Кухня сияет: чистота 100 %','The kitchen sparkles: 100% clean'),help:()=>L('Помощник вышел на работу','The helper has started'),promo:()=>L('Акция на ТО запущена','Service promotion started'),ot:()=>L('Мастера работают в выходные','The mechanics are working weekends')};
function onClick(e){const el=e.target.closest('[data-mx]');if(!el||el.disabled)return;const W=w();if(!W)return;e.preventDefault();e.stopPropagation();const k=el.dataset.mx;
  if(k==='tip'){if(!S.o2t)S.o2t={};S.o2t[el.dataset.k]=1;save();snd('tap');GAME.emit('change');return;}
  if(k==='act'){const a=el.dataset.a,v=el.dataset.v!=null?+el.dataset.v:undefined;const r=act('mxAct',el.dataset.id,a,v);
    if(r==='ok'){snd(a==='plan'||a==='eve'?'tap':'coin');const b=W.biz.find(x=>x.id===el.dataset.id);
      const t=a==='plan'?(v?L('Уборка по графику включена','Scheduled cleaning on'):L('Уборка по графику выключена','Scheduled cleaning off')):a==='eve'?(v?L('Вечерняя смена открыта','Evening shift on'):L('Вечерняя смена закрыта','Evening shift off')):(RES[a]?RES[a]():'');
      if(t)try{toast((b?E.BIZ[b.t].ico+' ':'')+t,2200);}catch(x){}try{GAME.emit('o2',{k:'mx',a,t:b?b.t:''});}catch(x){}}
    else if(r==='cash'){snd('no');try{toast(L('Не хватает денег','Not enough money'));}catch(x){}}}}
function init(){css();document.addEventListener('click',e=>{if(e.target.closest('#main,#modal,#adv')&&e.target.closest('[data-mx]'))onClick(e);},true);}
window.MECHUI={init,card,badge,adv,tip};
if(document.readyState!=='loading')init();else document.addEventListener('DOMContentLoaded',init);
})();
