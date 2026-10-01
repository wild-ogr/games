/* ================= «Из ларька в магнаты: бизнес» — хозяин и рынок (M17, без DOM) =================
   Грузится после biz.js (и в симуляторе). Ответ на «белку в колесе» (hobby-analytics/release-b/M15, M17):
   • характер дела TR: ёмкость рынка города (cap — хороших мест без потерь) и спад k, чувствительность к рекламе mk, «хозяйский глаз» ow, зависимость от места pl;
   • насыщение рынка: спрос каждой точки вида в городе = 1 / (1 + k × max(0, n − cap)) — «10 автоматов» больше не выгоднее разного портфеля;
   • уровни точки 1–5 (LV): у каждого вида свои улучшения, деньги — в стоимость точки (capex → ОС), износ как у точки;
   • маркетинг MK (листовки, вывеска, соцсети, «1+1», радио, наружная, блогер): усталость при повторе, потолок +45 %, итог — в отчёте месяца;
   • курсы героя ED и персонала ST; дела хозяина JOBS (рука × дни × ⚡ в день, откат); события с выбором: глава 2 — EV2, глава 3 «Сеть» — EV3 (опт, второй город, управляющего переманивают, ТЦ, тендер, налоговая); «Режим дня» за 💎 (W.pk.reg).
   Учёт: реклама и курсы — adm, вывеска и улучшения — capex (в стоимость точки), штраф за декларацию — oth, субсидия — oth (+). Баланс сходится.
   Состояние: W.ow = {j:[дела], cd:{откаты}, ed:{курсы}, neg:{вид:[до месяца, скидка]}, spot:{вид:1}, soc:{город:1}, cc:[кампании города], fat:{усталость},
   vis:{друг:месяц}, ev:{событие}|null, evM, mon:{sp,rev,pr}, last:{m,sp,rev,pr}, tip:{}}; у точки: lv, mc:[кампании], sign, tr/ms (обучение), trn (учёба до дня),
   spot, st2 (хозяин за прилавком до дня), chk (проверка до месяца), rx/sx (надбавки аренды/зарплаты), pr2 [до месяца, цена]. */
(function(root){
'use strict';
const E=root.ECON;if(!E||!E.BIZ)return;
const _=E._,{pay,recv,pl,news,R,RR,rnd0,clamp}=_;
const DAYS=30;
const cost=(W,a,k,c,s)=>E.bizCost(W,a,k,c,s);

/* ---------------- характер дела ---------------- */
// cap — хороших мест в городе (без потерь), k — спад спроса за каждую точку сверх cap (подобраны так, что n-я «лишняя» точка даёт ≈ 0: автомат ~10, ларёк ~7, цветы ~4, услуги ~3 — M17, satk), mk — отклик на рекламу, ow — «хозяйский глаз» (сам стою: ×ow, онлайн),
// pl — зависимость от места и трафика (0 — мало, 1 — средне, 2 — очень), rs — риск (0 низкий: хозмаг, аптека, столовая; 2 высокий: шаурма — проверки, цветы — ставка на праздник, фудтрак — погода)
const TR={vend:{cap:3,k:.03,mk:.3,ow:1,pl:2,rs:1},kiosk:{cap:2,k:.085,mk:1,ow:1.1,pl:2,rs:1},shaw:{cap:1,k:.075,mk:1,ow:1.08,pl:1,rs:2},flow:{cap:1,k:.095,mk:1.1,ow:1.08,pl:1,rs:2},
  pvz:{cap:2,k:.08,mk:.3,ow:1.03,pl:0,rs:1},coffee:{cap:1,k:.066,mk:1.2,ow:1.06,pl:2,rs:1},wash:{cap:1,k:.31,mk:.6,ow:1.02,pl:1,rs:1},tire:{cap:1,k:.34,mk:.5,ow:1.05,pl:0,rs:1},
  sto:{cap:1,k:.24,mk:.6,ow:1.06,pl:0,rs:1},gazel:{cap:3,k:.24,mk:.4,ow:1.05,pl:0,rs:1},barber:{cap:1,k:.44,mk:.9,ow:1.04,pl:1,rs:1},bakery:{cap:1,k:.2,mk:1,ow:1.06,pl:1,rs:1},
  canteen:{cap:1,k:.13,mk:.5,ow:1.05,pl:0,rs:0},hard:{cap:1,k:.22,mk:.7,ow:1.06,pl:1,rs:0},pharm:{cap:1,k:.32,mk:.6,ow:1.04,pl:1,rs:0},club:{cap:1,k:.21,mk:.8,ow:1.03,pl:1,rs:1},
  clean:{cap:1,k:.14,mk:.6,ow:1.04,pl:0,rs:1},truckf:{cap:1,k:.21,mk:1.1,ow:1.08,pl:2,rs:2}};
// насыщение: n — точек вида в городе (с новой), cap — ёмкость (+ доставка у этой точки), m — множитель спроса, pct — сколько спроса съела конкуренция своих же точек
function satOf(W,t,c,b){const T=TR[t];if(!T)return {n:0,cap:0,m:1,pct:0};c=c||W.home||'kuz';
  const a=W.biz.filter(x=>x.t===t&&x.c===c);let n=a.length;if(!b||!a.some(x=>x===b||b.id&&x.id===b.id))n++;   // копия точки (прогноз) — та же точка
  const cap=T.cap+(b&&b.lv>1?lvEff(b).sat:0),m=1/(1+T.k*Math.max(0,n-cap));return {n,cap,m,pct:1-m};}

/* ---------------- уровни точки (2…5): [id, рус, англ, цена ₽, эффект]; цена растёт по ступеням (×1; ×1,15; ×1,35; ×1,6 — окупаемость 5–8 → 12–20 мес.); все пять ступеней вместе — +40…70 % прибыли точки (не «удвоение»: иначе «Сеть» и недра пролетают) ----------------
   Эффект: d — покупателей +, p — к цене/чеку +, v — себестоимость (−), f — постоянные ₽/мес, rk — поломки и штрафы (множитель −), sat — +мест на рынке (доставка), sea — сезон ровнее (0…1) */
const LV={
  // автомат — дешёвый старт с тонкой маржой (место 12 тыс. при выручке 34): улучшения скромнее, иначе «10 автоматов с прокачкой» снова лучше всего
  vend:[['card','Оплата картой и по QR','Card and QR payments',5e3,{d:.03}],['bean','Свежее зерно и сиропы','Fresh beans and syrups',10e3,{p:.036}],
    ['tele','Телеметрия: сам сообщает о поломке','Telemetry: reports its own faults',15e3,{rk:-.6,d:.024}],['big','Новый автомат с большим меню','A new machine with a bigger menu',30e3,{d:.048,p:.024}]],
  kiosk:[['cash','Кассовый аппарат и эквайринг','Till and card terminal',30e3,{d:.042,th:-.5}],['fridge','Холодильник-витрина','Display fridge',60e3,{d:.048,v:-.006}],
    ['win2','Второе окно выдачи','A second serving window',85e3,{d:.06}],['pav','Пристройка: павильон с дверью','Extension: a pavilion with a door',200e3,{d:.15,f:3e3}]],
  shaw:[['grill','Второй гриль — нет очереди в обед','A second grill — no lunch queue',70e3,{d:.048}],['dlv','Доставка через агрегатор','Delivery via an app',100e3,{d:.048,sat:1}],
    ['tbl','Столики под навесом','Tables under an awning',160e3,{d:.06}],['meat','Своя заготовка мяса','Own meat preparation',300e3,{v:-.036}]],
  flow:[['cold','Холодильная камера','A cold room',55e3,{v:-.036}],['dlv','Доставка букетов','Bouquet delivery',100e3,{d:.072,sat:1}],
    ['des','Флорист-дизайнер: авторские букеты','A designer florist: signature bouquets',120e3,{p:.06,f:9e3}],['wed','Свадьбы и оформление залов','Weddings and hall decoration',290e3,{d:.09,sea:.2}]],
  pvz:[['fit','Примерочные','Fitting rooms',70e3,{d:.048}],['win2','Второе окно выдачи','A second counter',115e3,{d:.072,f:5e3}],
    ['post','Постамат у входа','A parcel locker at the door',170e3,{d:.06,rk:-.5}],['big','Склад на 2 000 ячеек','A 2,000-cell store room',335e3,{d:.108}]],
  coffee:[['mach','Кофемашина получше','A better coffee machine',110e3,{p:.048}],['loyal','Карта «каждый 6-й кофе бесплатно»','A “6th coffee free” card',60e3,{d:.06,p:-.012}],
    ['bake','Выпечка к кофе','Pastries with coffee',120e3,{d:.048,p:.024}],['isl','Второй островок у выхода','A second stand by the exit',385e3,{d:.15,f:9e3}]],
  wash:[['vac','Пылесосы и воздух для шин','Vacuums and tyre air',180e3,{p:.036}],['warm','Тёплый пол и крыша — работает зимой','Heated floor and roof — works in winter',415e3,{sea:.7}],
    ['card','Оплата картой на постах','Card payment at the bays',205e3,{d:.036}],['post5','Пятый пост','A fifth bay',1.05e6,{d:.15}]],
  tire:[['m2','Второй мастер в сезон','A second fitter in season',70e3,{d:.072}],['bal','Балансировочный стенд и подъёмник','Balancing stand and lift',175e3,{p:.048}],
    ['store','Сезонное хранение шин','Seasonal tyre storage',205e3,{sea:.4,f:3e3}],['sale','Продажа шин и дисков','Selling tyres and wheels',385e3,{p:.06,v:.012}]],
  sto:[['scan','Диагностический сканер','A diagnostic scanner',300e3,{p:.03}],['post4','Четвёртый пост','A fourth bay',690e3,{d:.15,f:18e3}],
    ['fleet','Договор с таксопарком','A taxi-fleet contract',325e3,{d:.048,rk:-.5}],['parts','Свой склад запчастей','Own spare-parts store',600e3,{v:-.03}]],
  gazel:[['load','Грузчики по заказу','Movers on request',90e3,{p:.048}],['lift','Гидроборт','A tail lift',175e3,{d:.09}],
    ['gps','GPS и диспетчер','GPS and a dispatcher',95e3,{rk:-.6,d:.048}],['ref','Будка-рефрижератор','A refrigerated body',430e3,{p:.072}]],
  barber:[['book','Онлайн-запись','Online booking',70e3,{d:.048}],['ch4','Четвёртое кресло','A fourth chair',350e3,{d:.15}],
    ['cos','Косметика для бороды на продажу','Beard products for sale',160e3,{p:.03}],['sch','Своя школа барберов','Own barber school',575e3,{p:.06,d:.03,rk:-.7}]],
  bakery:[['oven2','Вторая печь','A second oven',150e3,{rk:-.8,d:.036}],['cof','Кофе к выпечке','Coffee with pastries',175e3,{d:.06}],
    ['dlv','Доставка в офисы','Delivery to offices',325e3,{d:.06,sat:1}],['cake','Торты на заказ','Cakes to order',575e3,{p:.048}]],
  canteen:[['line','Линия раздачи','A serving line',240e3,{d:.048}],['ban','Банкеты и поминки','Banquets and wakes',275e3,{p:.03}],
    ['lunch','Обеды в цеха с доставкой','Lunches delivered to the shop floor',485e3,{d:.072,sat:1}],['veg','Своё овощехранилище','Own vegetable store',440e3,{v:-.048}]],
  hard:[['bar','Касса и штрихкоды','Till and barcodes',90e3,{d:.042,th:-.5}],['key','Ключи и заточка ножей','Keys and knife sharpening',85e3,{p:.018}],
    ['dlv','Доставка на дом','Home delivery',205e3,{d:.06,sat:1}],['gar','Садовый отдел','A garden section',335e3,{d:.09}]],
  pharm:[['web','Заказ онлайн с самовывозом','Order online, collect in store',150e3,{d:.048}],['cold','Холодильник для инсулина и вакцин','A fridge for insulin and vaccines',140e3,{d:.03}],
    ['prov','Провизор-консультант','A consulting pharmacist',290e3,{p:.012}],['dist','Договор с дистрибьютором напрямую','A direct distributor deal',480e3,{v:-.024}]],
  club:[['chair','Игровые кресла','Gaming chairs',180e3,{d:.036}],['vr','VR-зона','A VR zone',480e3,{d:.048,p:.024}],
    ['tour','Турниры по выходным','Weekend tournaments',240e3,{d:.03,sea:.2}],['room2','Вторая комната на 10 мест','A second room with 10 seats',1.08e6,{d:.21,f:30e3}]],
  clean:[['rec','Приёмные пункты в ТЦ','Drop-off points in malls',180e3,{d:.048,sat:1}],['aqua','Аквачистка — бережно','Wet cleaning — gentle',275e3,{rk:-.7,p:.03}],
    ['fix','Ремонт и подгонка одежды','Alterations and repairs',205e3,{p:.03}],['corp','Корпоративные клиенты: спецодежда','Corporate clients: workwear',575e3,{d:.072,sea:.3}]],
  truckf:[['qr','Касса и QR','Till and QR',50e3,{d:.03}],['trl','Второй прицеп-гриль','A second grill trailer',275e3,{d:.18,f:12e3}],
    ['tent','Тент и обогрев','An awning and heaters',120e3,{sea:.3}],['wed','Выезды на свадьбы и корпоративы','Weddings and corporate events',335e3,{p:.06}]]};
const LV_MAX=5;
function lvEff(b){const o={d:0,p:0,v:0,f:0,rk:1,sat:0,sea:0,th:1};const a=LV[b.t];if(!a)return o;
  for(let i=0;i<Math.min((b.lv||1)-1,a.length);i++){const e=a[i][4];o.d+=e.d||0;o.p+=e.p||0;o.v+=e.v||0;o.f+=e.f||0;o.sat+=e.sat||0;o.sea=Math.max(o.sea,e.sea||0);
    if(e.rk)o.rk*=1+e.rk;if(e.th)o.th*=1+e.th;}return o;}
function lvNext(W,b){if(typeof b==='string')b=W.biz.find(x=>x.id===b);if(!b)return null;const a=LV[b.t];const l=b.lv||1;if(!a||l>=LV_MAX)return null;
  const x=a[l-1];return {n:l+1,id:x[0],ru:x[1],en:x[2],c:x[3],e:x[4]};}
function ptUpOk(W,id){const b=W.biz.find(x=>x.id===id);if(!b||b.st!=='w'||W.ned)return 'no';const x=lvNext(W,b);if(!x)return 'max';if(W.cash<x.c)return 'cash';return 'ok';}
// улучшить точку: деньги — в стоимость точки (ОС), износ — по сроку службы точки
function ptUp(W,id){const r=ptUpOk(W,id);if(r!=='ok')return r;const b=W.biz.find(x=>x.id===id),x=lvNext(W,b);pay(W,x.c,'capex');b.g+=x.c;b.lv=x.n;
  news(W,'biz',{k:'lvup',bt:b.t,n:x.n});return 'ok';}
// прибавка прибыли от следующего уровня (прогноз, в среднем за год) и окупаемость
function lvGain(W,b){const x=lvNext(W,b);if(!x)return null;const f0=E.bizForecast(W,b,b.k).prof,b2=Object.assign({},b,{lv:x.n}),f1=E.bizForecast(W,b2,b.k).prof;
  const g=f1-f0;return {x,g,pay:g>0?x.c/g:999};}

/* ---------------- маркетинг ---------------- */
// sc: pt — одна точка, city — все точки города; c — цена (cf — доля вложений точки для вывески), dur — дней, e — +покупателей, pr — цена ×, min — точек в городе
const MK={fly:{ico:'📄',c:5000,dur:14,e:.15,sc:'pt'},bogo:{ico:'🎁',c:0,dur:10,e:.35,pr:.8,sc:'pt'},blog:{ico:'🤳',c:40000,dur:20,e:.25,sc:'pt',rnd:1},
  sign:{ico:'🔖',cf:.06,cmin:25000,e:.06,sc:'pt',once:1},soc:{ico:'📱',c:15000,e:.05,sc:'city',sub:1},
  radio:{ico:'📻',c:60000,dur:20,e:.12,sc:'city',min:3},out:{ico:'🏙',c:90000,dur:30,e:.1,sc:'city',min:3}};
const MK_CAP=.45;
function mkSens(W,t){const T=TR[t];return (T?T.mk:.5)*(ed(W,'mkt')?1.25:1);}
function ow(W){return W.ow||(W.ow=owNew());}
function owNew(){return {v:1,j:[],cd:{},ed:{},neg:{},spot:{},soc:{},cc:[],fat:{},vis:{},ev:null,evM:-9,mon:{sp:0,rev:0,pr:0},last:null,tip:{}};}
function ed(W,k){return !!(W.ow&&W.ow.ed&&W.ow.ed[k]);}
function pts(W,c){return W.biz.filter(b=>E.SMALL.indexOf(b.t)>=0&&b.st==='w'&&(!c||b.c===c));}
// все маркетинговые прибавки точки: постоянные (вывеска, соцсети) и кампании (если noEv — только постоянные); итог ≤ +45 %
function mkBoost(W,b,noEv){const O=W.ow;if(!O)return 0;let s=0;const sn=mkSens(W,b.t);
  if(b.sign)s+=MK.sign.e*Math.min(1,sn+.2);if(O.soc&&O.soc[b.c])s+=MK.soc.e*sn;
  if(!noEv){for(const x of b.mc||[])if(x.u>W.t)s+=x.e;for(const x of O.cc)if(x.c===b.c&&x.u>W.t)s+=x.e*sn;}
  return Math.min(MK_CAP,s);}
function mkCost(W,k,b){const m=MK[k];if(!m)return 0;if(m.cf)return Math.max(m.cmin,rnd0(E.BIZ[b.t].cap*m.cf/1000)*1000);return m.c;}
function fatK(W,key){return W.ow.fat[key]||0;}
// можно ли запустить: 'ok' | 'no' | 'cash' | 'once' (вывеска уже есть) | 'on' (уже идёт) | 'min' (мало точек в городе)
function mkOk(W,k,tg){const m=MK[k];if(!m||W.ned||!W.ip)return 'no';const O=ow(W);
  if(m.sc==='pt'){const b=W.biz.find(x=>x.id===tg);if(!b||b.st!=='w'||E.SMALL.indexOf(b.t)<0)return 'no';if(m.once&&b.sign)return 'once';if((b.mc||[]).some(x=>x.k===k&&x.u>W.t))return 'on';
    if(W.cash<mkCost(W,k,b))return 'cash';return 'ok';}
  const c=tg||W.home||'kuz';if(m.sub&&O.soc[c])return 'on';if(O.cc.some(x=>x.k===k&&x.c===c&&x.u>W.t))return 'on';if(m.min&&pts(W,c).length<m.min)return 'min';if(W.cash<m.c)return 'cash';return 'ok';}
// сколько даст сейчас (доля покупателей) с учётом усталости и чувствительности вида
function mkEff(W,k,tg){const m=MK[k],O=ow(W);if(m.sc==='pt'){const b=W.biz.find(x=>x.id===tg);if(!b)return 0;const sn=mkSens(W,b.t);if(m.once)return m.e*Math.min(1,sn+.2);
    return m.e*sn*(1-Math.min(.8,fatK(W,k+':'+b.id)));}
  return m.e*(ed(W,'mkt')?1.25:1)*(m.sub?1:1-Math.min(.8,fatK(W,k+':'+(tg||W.home||'kuz'))));}
function mkRun(W,k,tg){const r=mkOk(W,k,tg);if(r!=='ok')return r;const m=MK[k],O=ow(W);let res='ok';
  if(m.sc==='pt'){const b=W.biz.find(x=>x.id===tg),B=E.BIZ[b.t],c=mkCost(W,k,b);
    if(m.once){pay(W,c,'capex');b.g+=c;b.sign=1;}else{if(c)cost(W,c,'adm','adm',B.seg);O.mon.sp+=c;
      let e=mkEff(W,k,b.id);if(m.rnd){const x=R(W);if(x<.6){b.rt=Math.min(5,(b.rt||3.5)+.1);res='hit';}else if(x<.85){e*=.32;res='meh';}else{e=0;res='flop';}}
      if(!b.mc)b.mc=[];b.mc=b.mc.filter(x=>x.u>W.t);b.mc.push({k,u:W.t+m.dur,e,pr:m.pr||1});O.fat[k+':'+b.id]=fatK(W,k+':'+b.id)+.5;}
    if(m.once)O.mon.sp+=0;}
  else{const c=tg||W.home||'kuz';if(m.sub){O.soc[c]=1;cost(W,m.c,'adm','adm','retail');O.mon.sp+=m.c;}
    else{cost(W,m.c,'adm','adm','retail');O.mon.sp+=m.c;const e=mkEff(W,k,c);O.cc=O.cc.filter(x=>x.u>W.t);O.cc.push({k,c,u:W.t+m.dur,e});O.fat[k+':'+c]=fatK(W,k+':'+c)+.5;}}
  return res;}
function mkStop(W,k,c){const O=ow(W);c=c||W.home||'kuz';if(k==='soc'&&O.soc[c]){delete O.soc[c];return 'ok';}return 'no';}

/* ---------------- курсы ---------------- */
// курсы героя: c — цена, d — дней (1 рука, 5 ⚡ в день), need — нужен курс, st — с какой главы (1 — «Своё дело»)
const ED={acc:{ico:'📒',c:15e3,d:5,st:0,ip:1},neg:{ico:'🤝',c:40e3,d:7,st:1},mgr:{ico:'👥',c:60e3,d:10,st:1},mkt:{ico:'📣',c:30e3,d:5,st:1},
  mgr2:{ico:'🎓',c:200e3,d:15,st:1,need:'mgr'}};
const ED_E=5;
function edOk(W,k){const x=ED[k];if(!x||W.ned||!W.me)return 'no';const O=ow(W);if(O.ed[k])return 'done';if(O.j.some(j=>j.k==='edu'))return 'busy';
  if(x.need&&!O.ed[x.need])return 'need';if(x.ip&&!W.ip)return 'ip';if(E.stI(W)<x.st)return 'stage';if(E.hands(W).free<1)return 'hand';if(W.cash<x.c)return 'cash';return 'ok';}
function edStart(W,k){const r=edOk(W,k);if(r!=='ok')return r;const x=ED[k];cost(W,x.c,'adm','adm',null);ow(W).j.push({id:'j'+(W.nid++),k:'edu',a:k,left:x.d,d:x.d,e:ED_E});return 'ok';}
// обучение персонала точки: sell — продавцы (розница, +6 % покупателей), mast — мастера (услуги: ⭐ +0,4 и +5 % к цене). Точка 5–7 дней работает на 80 %
const ST={sell:{ico:'🗣',d:5,seg:'retail'},mast:{ico:'🧑‍🔧',d:7,seg:'serv'}};
function stCost(W,b,k){const B=E.BIZ[b.t];return k==='sell'?Math.max(15e3,rnd0((B.staff||40e3)*.5/1000)*1000):clamp(rnd0(B.cap*.025/1000)*1000,40e3,120e3);}
function stOk(W,id,k){const b=W.biz.find(x=>x.id===id),x=ST[k];if(!b||!x||b.st!=='w'||W.ned)return 'no';const B=E.BIZ[b.t];if(B.seg!==x.seg||!B.hand)return 'no';
  if(k==='sell'?b.tr:b.ms)return 'done';if(b.trn>W.t)return 'busy';if(W.cash<stCost(W,b,k))return 'cash';return 'ok';}
function stTrain(W,id,k){const r=stOk(W,id,k);if(r!=='ok')return r;const b=W.biz.find(x=>x.id===id),B=E.BIZ[b.t];cost(W,stCost(W,b,k),'adm','adm',B.seg);b.trn=W.t+ST[k].d;b.trk=k;return 'ok';}

/* ---------------- дела хозяина ---------------- */
// d — дней, e — ⚡ в день, sc — на что: type (вид точек), pt (точка), mpt (точка с управляющим), fr (друг); cd — откат, мес.; c — ₽
const JOBS={neg:{ico:'🤝',d:3,e:15,sc:'type',cd:3},spot:{ico:'📍',d:5,e:10,sc:'type'},stand:{ico:'🧍',d:5,e:10,sc:'mpt'},check:{ico:'🔍',d:2,e:15,sc:'pt',cd:3},
  fly:{ico:'📄',d:2,e:15,sc:'pt',c:1000},visit:{ico:'☕',d:1,e:0,sc:'fr',cd:1}};
const FRIENDS=['owl','beav','bars','vit'];
function jobKey(k,a){return k+':'+a;}
function jobOk(W,k,a){const x=JOBS[k];if(!x||W.ned||!W.me)return 'no';const O=ow(W),M=W.me;if(E.stI(W)<1)return 'stage';
  if(M.out>0)return 'out';if(M.rest>0)return 'rest';if(E.hands(W).free<1)return 'hand';if(M.en<Math.max(10,x.e))return 'en';
  if(O.j.some(j=>j.k===k&&j.a===a))return 'on';if(x.cd&&(O.cd[jobKey(k,a)]||-99)>W.m)return 'cd';
  if(x.sc==='type'){if(!E.BIZ[a]||E.SMALL.indexOf(a)<0)return 'no';if(k==='neg'&&!W.biz.some(b=>b.t===a&&b.st==='w'))return 'no';if(k==='spot'&&O.spot[a])return 'on';}
  else if(x.sc==='pt'||x.sc==='mpt'){const b=W.biz.find(y=>y.id===a);if(!b||b.st!=='w'||E.SMALL.indexOf(b.t)<0)return 'no';if(x.sc==='mpt'&&!b.mgr)return 'no';if(k==='check'&&!b.mgr&&!(E.BIZ[b.t].hand===0))return 'no';}
  else if(x.sc==='fr'){if(FRIENDS.indexOf(a)<0)return 'no';if((O.vis[a]|0)>=W.m+1)return 'cd';}
  if(x.c&&W.cash<x.c)return 'cash';return 'ok';}
function jobStart(W,k,a){const r=jobOk(W,k,a);if(r!=='ok')return r;const x=JOBS[k],O=ow(W);if(x.c)cost(W,x.c,'adm','adm',null);
  O.j.push({id:'j'+(W.nid++),k,a,left:x.d,d:x.d,e:x.e});if(k==='stand'){const b=W.biz.find(y=>y.id===a);b.st2=W.t+x.d;}
  if(k==='visit')O.vis[a]=W.m+1;return 'ok';}
function jobStop(W,id){const O=ow(W),j=O.j.find(x=>x.id===id);if(!j||j.k==='edu')return 'no';O.j=O.j.filter(x=>x!==j);if(j.k==='stand'){const b=W.biz.find(y=>y.id===j.a);if(b)b.st2=0;}return 'ok';}
function ownHands(W){return W.ow&&W.ow.j?W.ow.j.length:0;}
// дело закончено — эффект
function jobDone(W,j,out){const O=W.ow;
  if(j.k==='edu'){O.ed[j.a]=1;news(W,'biz',{k:'edu',ed:j.a});out.push({k:'own',w:'edu',a:j.a});return;}
  if(j.k==='neg'){O.neg[j.a]=[W.m+3,ed(W,'neg')?.04:.03];O.cd[jobKey('neg',j.a)]=W.m+3;}
  else if(j.k==='spot')O.spot[j.a]=1;
  else if(j.k==='check'){const b=W.biz.find(y=>y.id===j.a);if(b){b.chk=W.m+3;O.cd[jobKey('check',j.a)]=W.m+3;out.push({k:'own',w:'check',a:j.a,th:rnd0(b.th||0),hon:b.hon||0});if(b.mgr)b.aud=W.m;}return;}
  else if(j.k==='fly'){const b=W.biz.find(y=>y.id===j.a);if(b){const e=MK.fly.e*mkSens(W,b.t)*(1-Math.min(.8,fatK(W,'fly:'+b.id)));if(!b.mc)b.mc=[];b.mc.push({k:'fly',u:W.t+MK.fly.dur,e,pr:1});O.fat['fly:'+b.id]=fatK(W,'fly:'+b.id)+.5;}}
  else if(j.k==='visit'){if(W.me)W.me.en=Math.min(E.enMax(W),W.me.en+15);let r=null;if(E.friendVisit)try{r=E.friendVisit(W,j.a,'econ');}catch(e){}   // модель друзей (js/story.js): 'econ' — силы уже потрачены делом хозяина
    out.push({k:'own',w:'visit',a:j.a,fr:r&&r.res==='ok'?r:null});return;}
  out.push({k:'own',w:j.k,a:j.a});}

/* ---------------- модификаторы точки для econ() (biz.js) ---------------- */
function ptMod(W,b,m,noEv){const o={d:1,p:1,v:1,f:0,rk:1},T=TR[b.t];if(!T)return o;
  o.d*=satOf(W,b.t,b.c,b).m;
  if((b.lv||1)>1){const L=lvEff(b);o.d*=1+L.d;o.p*=1+L.p;o.v*=1+L.v;o.f+=L.f;o.rk*=L.rk;
    if(L.sea){const x=E.season(b.t,m,b.k);if(x>0&&x<1)o.d*=(x+L.sea*(1-x))/x;}}
  if(b.spot)o.d*=1+b.spot;if(b.tr)o.d*=1.06;if(b.ms)o.p*=1.05;if(b.rx)o.f+=b.rx;if(b.sx)o.f+=b.sx;
  o.d*=1+mkBoost(W,b,noEv);
  const O=W.ow;if(O){const n=O.neg[b.t];if(n&&n[0]>W.m)o.v*=1-n[1];if(O.ed.neg&&E.BIZ[b.t].seg==='retail')o.v*=.98;}
  if(!noEv){for(const x of b.mc||[])if(x.u>W.t&&x.pr&&x.pr!==1)o.p*=x.pr;if(b.st2>W.t)o.d*=1.12;if(b.trn>W.t)o.d*=.8;if(b.pr2&&b.pr2[0]>W.m)o.p*=b.pr2[1];}
  if(b.chk>=W.m)o.rk*=.5;
  return o;}
// вероятность плохого события точки (поломки, штрафы, уход мастера): уровни, проверка, возраст автомата
const EV_GOOD={viral:1,fleet:1,order:1};
function ptRk(W,b,k){if(EV_GOOD[k])return 1;let x=1;if((b.lv||1)>1)x*=lvEff(b).rk;if(b.chk>=W.m)x*=.5;if(b.t==='vend'&&(b.wm||0)>24)x*=1.4;return x;}
// кражи нечестного управляющего: касса/штрихкоды, проверка точки
function ownTh(W,b){let x=(b.lv||1)>1?lvEff(b).th:1;if(b.chk>=W.m)x*=.3;if(ed(W,'mgr'))x*=.5;return x;}   // курс «Управление персоналом» — «хозяйский глаз»: недостача вдвое меньше
// сколько выручки дал маркетинг сегодня (для отчёта «маркетинг дал +X ₽»)
function ownPtDay(W,b,rev,vc,x){const O=W.ow;if(!O||!TR[b.t]||rev<=0)return;const s=mkBoost(W,b,false)+(b.ad>W.t?E.PROMO_K:0);if(s<=0)return;
  const ex=rev*(1-1/(1+s));O.mon.rev+=ex;O.mon.pr+=ex*(1-(rev>0?vc/rev:0));}
// открытие: найденное хозяином место — +12 % покупателей навсегда и открытие на 30 % быстрее
function ownOpen(W,b){const O=ow(W);if(!b.lv)b.lv=1;if(O.spot[b.t]){b.spot=.12;b.left=Math.max(1,Math.round(b.left*.7));delete O.spot[b.t];}}
function ownMgrSh(W){return ed(W,'mgr2')?.27:E.MGR_SH;}
// сколько у вас управляющих (лимита нет — решение владельца 01.10)
function mgrN(W){return W.biz.filter(b=>b.mgr&&!W.opd[b.t]&&E.BIZ[b.t]&&E.BIZ[b.t].mw).length;}
function ownLoanK(W){return ed(W,'acc')?1.1:1;}

/* ---------------- «Режим дня» (💎 навсегда) и вещи, которые дают силы ---------------- */
const REG_CR=[40,90,160],REG_STEP=10;
function rg(W){const p=W&&W.pk;const n=p&&typeof p.reg==='number'?p.reg:0;return Math.max(0,Math.min(REG_CR.length,Math.floor(n)));}
function luxEn(W){let s=0;if(W.lx&&E.LUX)for(const x of E.LUX)if(x.ef&&x.id in W.lx)s+=x.ef;return s;}
function enBonus(W){return REG_STEP*rg(W)+luxEn(W);}

/* ---------------- день и месяц ---------------- */
function ownDay(W,off,out){const O=ow(W),M=W.me;if(!M||W.ned)return;
  for(const j of O.j.slice()){if(j.e&&M.en>0)M.en=Math.max(0,M.en-j.e);if(--j.left<=0){O.j=O.j.filter(x=>x!==j);jobDone(W,j,out);}}
  for(const b of W.biz){if(b.trn&&b.trn<=W.t&&b.trk){if(b.trk==='sell')b.tr=1;else{b.ms=1;b.rt=Math.min(5,(b.rt||3.5)+.4);}b.trk='';out.push({k:'own',w:'staff',a:b.id});}}
  if(O.ev&&O.ev.exp<=W.t)evAns(W,O.ev.def,true);}
function ownClose(W,M,off){const O=ow(W);if(W.ned)return;
  O.last={m:W.m,sp:rnd0(O.mon.sp),rev:rnd0(O.mon.rev),pr:rnd0(O.mon.pr)};O.mon={sp:0,rev:0,pr:0};
  // соцсети — подписка на месяц
  for(const c in O.soc)if(O.soc[c]){if(W.cash>=MK.soc.c){cost(W,MK.soc.c,'adm','adm','retail');O.last.sp+=MK.soc.c;}else delete O.soc[c];}
  // усталость от рекламы проходит
  const dk=ed(W,'mkt')?.5:.25;for(const k in O.fat){O.fat[k]=Math.max(0,O.fat[k]-dk);if(!O.fat[k])delete O.fat[k];}
  for(const b of W.biz)if(b.mc)b.mc=b.mc.filter(x=>x.u>W.t);O.cc=O.cc.filter(x=>x.u>W.t);
  for(const k in O.neg)if(O.neg[k][0]<=W.m+1)delete O.neg[k];
  // ошибка в декларации: без курса бухучёта — раз в квартал с шансом 20 % (штраф и пени 3–10 тыс.)
  if(W.ip&&!W.ooo&&(W.taxm==='usn6'||W.taxm==='usn15')&&W.m%3===2&&!ed(W,'acc')&&E.stI(W)<=1){if(R(W)<.2){const a=clamp(rnd0((3000+M.pl.rev*.02)/100)*100,3000,10000);cost(W,a,'oth','oth',null);news(W,'biz',{k:'taxerr',a});O.terr=(O.terr|0)+1;}}
  // событие главы 2 и 3 с выбором (не чаще раза в полтора месяца)
  if(!O.ev&&!off&&(W.st==='small'||W.st==='mid')&&W.m-O.evM>=1&&pts(W).length&&R(W)<.5)evNew(W);}

/* ---------------- события с выбором (главы «Своё дело» и «Сеть») ----------------
   o — варианты (id); def — что будет, если не ответить за 10 дней (обычно «ничего не делать»). Тексты — в интерфейсе (js/owner-ui.js). */
const FOOD={shaw:1,bakery:1,canteen:1,truckf:1,coffee:1,kiosk:1};
const EV2={
  rent:{o:['ok','move'],def:0,f:b=>E.BIZ[b.t].rent>0},
  raise:{o:['give','no'],def:1,f:b=>E.BIZ[b.t].hand>0},
  fair:{o:['go','skip'],def:1,f:b=>E.BIZ[b.t].seg==='retail'},
  sale:{o:['buy','no'],def:1,f:(b,W)=>b.t==='kiosk'&&E.bizCan(W,'kiosk')!=='max'&&W.cash>=E.BIZ.kiosk.cap*.6},
  bulk:{o:['sign','no'],def:1,f:b=>E.BIZ[b.t].seg==='retail'&&E.BIZ[b.t].v>0},
  blog:{o:['feed','no'],def:1,f:b=>!!FOOD[b.t]},
  insp:{o:['fix','risk'],def:1,f:b=>!!FOOD[b.t]},
  rival:{o:['promo','no'],def:1,f:b=>E.BIZ[b.t].seg!=='logi'&&b.t!=='vend'},
  corp:{o:['take','no'],def:0,f:b=>b.t==='coffee'||b.t==='canteen'||b.t==='bakery'||b.t==='shaw'||b.t==='truckf'||b.t==='clean'},
  grant:{o:['apply','no'],def:1,f:(b,W)=>!W.ooo}};
// M19: глава 3 «Сеть» — свои события (частота та же): оптовый контракт на квартал, вход во второй город, переманивают управляющего,
// новый торговый центр, тендер, выездная налоговая проверка ООО. def — «не тратить деньги» (как в главе 2: прибавка — нет, проверка — как есть).
const tyVc=(W,t)=>W.biz.filter(b=>b.t===t&&b.st==='w').reduce((s,b)=>s+E.bizForecast(W,b,b.k).vc,0);
const city2=W=>(E.CITY_L||Object.keys(E.CITY)).filter(c=>W.cities.indexOf(c)<0);
const EV3={
  opt3:{o:['sign','no'],def:1,f:(b,W)=>E.BIZ[b.t].seg==='retail'&&E.BIZ[b.t].v>0&&W.biz.filter(x=>x.t===b.t&&x.st==='w').length>=2&&!(W.ow.neg[b.t]&&W.ow.neg[b.t][0]>W.m)},
  city2:{o:['go','no'],def:1,f:(b,W)=>!!W.ooo&&city2(W).length>0&&W.cash>=E.EV3_CITY+3e5},
  poach:{o:['keep','let'],def:1,f:b=>!!b.mgr&&E.BIZ[b.t].hand>0},
  mall:{o:['move','stay'],def:1,f:(b,W)=>E.BIZ[b.t].rent>0&&(E.BIZ[b.t].seg==='retail'||E.BIZ[b.t].seg==='serv')&&b.t!=='vend'&&!b.mall&&!(W.ow.mallC&&W.m-(W.ow.mallC[b.c]|0)<12&&b.c in W.ow.mallC)},   // ТЦ — не чаще раза в год на город (и после отказа — год тишины)
  tender:{o:['apply','no'],def:1,f:b=>!!FOOD[b.t]||b.t==='clean'||b.t==='hard'||b.t==='pharm'},
  audit3:{o:['aud','risk'],def:1,f:(b,W)=>!!W.ooo}};
E.EV3_CITY=5e5;
const EV2_L=Object.keys(EV2),EV3_L=Object.keys(EV3);
const evDef=k=>EV2[k]||EV3[k];
function evNew(W){const O=ow(W),ps=pts(W),mid=W.st==='mid',D=mid?EV3:EV2,KL=mid?EV3_L:EV2_L;const c=[];
  for(const k of KL){if(k==='city2'||k==='audit3'){if(ps.length&&D[k].f(ps[0],W))c.push([k,ps[0]]);continue;}for(const b of ps)if(D[k].f(b,W))c.push([k,b]);}if(!c.length)return;
  // в «Сети» каждый вид — с равным шансом (иначе 15 точек одного вида заслоняют редкие события)
  let k,b;if(mid){const ks=[...new Set(c.map(x=>x[0]))];k=ks[Math.floor(R(W)*ks.length)];const cc=c.filter(x=>x[0]===k);b=cc[Math.floor(R(W)*cc.length)][1];}else[k,b]=c[Math.floor(R(W)*c.length)];
  const B=E.BIZ[b.t],C=E.CITY[b.c]||E.CITY.kuz;
  const a={};if(k==='rent')a.inc=rnd0(B.rent*C.rent*.2/1000)*1000;if(k==='raise')a.inc=10000;if(k==='sale')a.pr=rnd0(E.BIZ.kiosk.cap*.6);
  if(k==='opt3'){const v=tyVc(W,b.t);a.fee=Math.max(30e3,rnd0(v*.1/1000)*1000);a.sv=rnd0(v*.08*3/1000)*1000;}
  if(k==='city2'){const cs=city2(W);a.c=cs[Math.floor(R(W)*cs.length)];a.pr=E.EV3_CITY;}
  // M21 (по просьбе главного): суммы событий «Сети» — от размера дела (минимум — как было): премия управляющему — 20 % прибыли точки, переезд в ТЦ — 15 % выручки точки,
  // тендер — на все точки вида в городе, документы 4 % их выручки; налоговая — аудитор 0,4 %, доначисление 0,8–1,6 % месячной выручки компании
  const k1=x=>Math.round(x/1000)*1000,pf=Math.max(0,b.pm&&b.pm.length?b.pm[b.pm.length-1]:0);
  if(k==='poach')a.c=Math.max(20e3,k1(pf*.2));
  if(k==='tender'){const tp=W.biz.filter(x=>x.t===b.t&&x.c===b.c&&x.st==='w');a.n=tp.length;a.fee=Math.max(15e3,k1(tp.reduce((q,x)=>q+(x.lr||0),0)*.04));}
  if(k==='audit3'){const r=W.reps&&W.reps.length?W.reps[W.reps.length-1].pl.rev:0;a.c=Math.max(40e3,k1(r*.004));a.f1=Math.max(60e3,k1(r*.008));a.f2=Math.max(120e3,k1(r*.016));}
  if(k==='mall'){a.mv=Math.max(80e3,k1((b.lr||0)*.15));(O.mallC||(O.mallC={}))[b.c]=W.m;a.inc=rnd0(B.rent*C.rent*.6/1000)*1000;const f0=E.bizForecast(W,b,b.k).prof,f1=E.bizForecast(W,Object.assign({},b,{spot:(b.spot||0)+.25,rx:(b.rx||0)+a.inc}),b.k).prof;a.g=rnd0((f1-f0)/100)*100;}
  O.ev={k,id:b.id,bt:b.t,exp:W.t+10,def:evDef(k).def,a,m:W.m};O.evM=W.m;}
// ответ: i — номер варианта; auto — прошло 10 дней
function evAns(W,i,auto){const O=ow(W),v=O.ev;if(!v)return 'no';const b=W.biz.find(x=>x.id===v.id);O.ev=null;if(!b)return 'gone';const B=E.BIZ[b.t],k=v.k,a=v.a||{};let res='ok';
  if(k==='rent'){if(i===0)b.rx=(b.rx||0)+a.inc;else{if(W.cash<60e3)b.rx=(b.rx||0)+a.inc;else{cost(W,60e3,'oth','oth',B.seg);b.down=Math.max(b.down||0,5);}}}
  else if(k==='raise'){if(i===0){b.sx=(b.sx||0)+a.inc;b.rt=Math.min(5,(b.rt||3.5)+.2);}else b.ev.quit=[W.m+2,.9];}
  else if(k==='fair'){if(i===0&&W.cash>=20e3){cost(W,20e3,'adm','adm',B.seg);O.mon.sp+=20e3;if(!b.mc)b.mc=[];b.mc.push({k:'fair',u:W.t+7,e:.3,pr:1});}}
  else if(k==='sale'){if(i===0){const r=E.bizOpen(W,'kiosk',{c:b.c,pr:a.pr,days:3});res=r==='ok'?'ok':r;}}
  else if(k==='bulk'){if(i===0&&W.cash>=25e3){cost(W,25e3,'adm','adm',B.seg);O.neg[b.t]=[W.m+3,Math.max(.06,O.neg[b.t]?O.neg[b.t][1]:0)];}}
  else if(k==='blog'){if(i===0){cost(W,3000,'adm','adm',B.seg);if(R(W)<.55){b.rt=Math.min(5,(b.rt||3.5)+.1);if(!b.mc)b.mc=[];b.mc.push({k:'blog',u:W.t+30,e:.2,pr:1});res='hit';}else res='meh';}
    else if(R(W)<.2){b.rt=Math.max(1,(b.rt||3.5)-.1);res='bad';}}
  else if(k==='insp'){if(i===0){cost(W,8000,'oth','oth',B.seg);b.down=Math.max(b.down||0,1);}else if(R(W)<.4){const f=rnd0(RR(W,30e3,50e3)/1000)*1000;cost(W,f,'oth','oth',B.seg);res='fine';v.fine=f;}}
  else if(k==='rival'){if(i===0)b.pr2=[W.m+1,.85];else b.ev.rival2=[W.m+3,.85];}
  else if(k==='corp'){if(i===0)b.ev.corp=[W.m+1,1.3];}
  else if(k==='grant'){if(i===0){const g=30e3;recv(W,g,'oth');pl(W,'oth',g);res='got';}}
  // глава 3
  else if(k==='opt3'){if(i===0&&W.cash>=a.fee){cost(W,a.fee,'adm','adm',B.seg);O.neg[b.t]=[W.m+3,Math.max(.08,O.neg[b.t]&&O.neg[b.t][0]>W.m?O.neg[b.t][1]:0)];}}
  else if(k==='city2'){if(i===0){if(W.cities.indexOf(a.c)>=0)res='gone';else if(W.cash<a.pr)res='cash';else{cost(W,a.pr,'adm','adm',null);W.cities.push(a.c);res='city';}}}
  else if(k==='poach'){const pc=a.c||20e3;if(i===0){if(W.cash>=pc)cost(W,pc,'fix','fix',B.seg);else{b.hon=1+Math.floor(R(W)*5);b.th=0;b.ev.poach=[W.m+2,.85];}}else{b.hon=1+Math.floor(R(W)*5);b.th=0;b.ev.poach=[W.m+2,.85];}}
  else if(k==='mall'){const mv=a.mv||80e3;if(i===0){if(W.cash<mv)res='cash';else{cost(W,mv,'oth','oth',B.seg);b.down=Math.max(b.down||0,5);b.mall=1;b.spot=(b.spot||0)+.25;b.rx=(b.rx||0)+a.inc;}}}
  else if(k==='tender'){if(i===0){cost(W,a.fee||15e3,'adm','adm',B.seg);if(R(W)<.6){const tp=a.n?W.biz.filter(x=>x.t===b.t&&x.c===b.c&&x.st==='w'):[b];for(const x of tp)x.ev.tender=[W.m+3,1.25];res='won';}else res='lost';}}
  else if(k==='audit3'){if(i===0)cost(W,a.c||40e3,'adm','adm',null);else if(R(W)<.5){const f=rnd0(RR(W,a.f1||60e3,a.f2||120e3)/1000)*1000;cost(W,f,'oth','oth',null);res='tax';v.fine=f;}}
  O.lastEv={k,i,res,bt:b.t,m:W.m,auto:!!auto,fine:v.fine||0,a};return res;}

/* ---------------- подсказки: пассив, налог, «до Сети», прогноз новой точки ---------------- */
// пассив: прибыль прошлого месяца точек, которые работают без вас (автоматы, с управляющим, с опердиректором) против обязательных трат жизни
function passive(W){let inc=0;for(const b of W.biz){const B=E.BIZ[b.t];if(!B||b.st!=='w'||E.PITS.indexOf(b.t)>=0)continue;if(B.hand&&!b.mgr&&!W.opd[b.t])continue;const p=b.pm&&b.pm.length?b.pm[b.pm.length-1]:0;inc+=p;}
  const need=(E.LIFE[W.st]||45e3)+(W.ip&&!W.ooo?4750:0)+(W.ooo?90e3:0);return {inc,need,pct:need>0?Math.max(0,inc/need):0};}
// совет по налогу для портфеля (прогноз 12 мес.): если точек нет — по первому делу (автомат)
function taxAdv(W,types){let rev=0,costs=0;const add=f=>{rev+=f.rev*12;costs+=(f.vc+f.f+f.risk)*12;};
  const ps=W.biz.filter(b=>E.SMALL.indexOf(b.t)>=0);for(const b of ps)add(E.bizForecast(W,b,b.k));
  for(const t of types||(ps.length?[]:['vend']))add(E.bizForecast(W,t));
  const fee=4750*12,u6=Math.max(0,rev*.06-fee),u15=Math.max(.15*Math.max(0,rev-costs-fee),.01*rev);return {u6:rnd0(u6),u15:rnd0(u15),best:u15<u6?'usn15':'usn6',rev:rnd0(rev),prof:rnd0(rev-costs)};}
// до «Сети»: что осталось и примерный срок (мес.)
function oooEta(W){const q=E.oooReq(W),o={q,left:[],m:0};if(W.ooo)return o;
  const h=W.reps.slice(-3);let g=0;if(h.length){for(const x of h)g+=E.netOf(x.pl);g/=h.length;}
  if(!q.eq){const m=g>0?Math.ceil((E.OOO_EQ-q.eqv)/g):-1;o.left.push(['eq',m]);if(m>o.m)o.m=m;if(m<0)o.m=-1;}
  if(!q.ch){const c=E.chInfo(W);o.left.push(['ch',c.eta]);if(c.eta>o.m&&o.m>=0)o.m=c.eta;if(c.eta<0)o.m=-1;}
  if(!q.pts)o.left.push(['pts',4-q.ptsn]);if(!q.mgr)o.left.push(['mgr',0]);return o;}
// новая точка вида t в городе c: своя прибыль и сколько потеряют свои же точки этого вида (насыщение)
function marginal(W,t,c){c=c||W.home||'kuz';const f=E.bizForecast(W,{t,c,rt:3.5,k:E.defKnob(t),mgr:0,wm:3,ev:{},lv:1});let loss=0;
  const a=W.biz.filter(x=>x.t===t&&x.c===c);if(a.length&&TR[t]){const T=TR[t];for(const b of a){const cap=T.cap+(b.lv>1?lvEff(b).sat:0),m0=1/(1+T.k*Math.max(0,a.length-cap)),m1=1/(1+T.k*Math.max(0,a.length+1-cap));
      if(m1<m0){const x=E.bizForecast(W,b,b.k);loss+=(x.rev-x.vc)*(1-m1/m0);}}}
  return {self:f.prof,loss:rnd0(loss),net:rnd0(f.prof-loss),sat:satOf(W,t,c,null),f};}
// «паспорт» дела: сезон по месяцам, пик, риск, маржа/оборот, место, нужен ли хозяин, окупаемость
// M19: k — ручка точки (ассортимент, ниша); без неё — по умолчанию. sv — варианты ручки с другим сезоном: [{id, ru, en, peak:[мес.]}]
function seaPk(s){const mx=Math.max(...s);return s.map((x,i)=>x>=mx*.95&&mx>1.1?i:-1).filter(i=>i>=0);}
function seaVar(t){const B=E.BIZ[t],d=E.defKnob(t),out=[];if(!B)return out;const s0=[];for(let m=0;m<12;m++)s0.push(E.season(t,m,d));
  for(const K of [B.knob,B.gd])if(K&&K.k&&K.o)for(const o of K.o){const k=Object.assign({},d,{[K.k]:o[0]}),s=[];for(let m=0;m<12;m++)s.push(E.season(t,m,k));
    if(s.some((x,i)=>Math.abs(x-s0[i])>.05))out.push({id:o[0],ru:o[1],en:o[2],peak:seaPk(s),flat:Math.max(...s)-Math.min(...s)<.25});}
  return out;}
function charOf(W,t,kn){const B=E.BIZ[t],T=TR[t]||{},k=Object.assign(E.defKnob(t),kn||{}),s=[];for(let m=0;m<12;m++)s.push(E.season(t,m,k));
  const f=E.bizForecast(W,{t,c:W.home||'kuz',rt:3.5,k,mgr:0,wm:3,ev:{},lv:1}),mx=Math.max(...s),mn=Math.min(...s);
  const risk=T.rs|0,cm=f.rev>0?(f.rev-f.vc)/f.rev:0;
  return {sea:s,peak:s.map((x,i)=>x>=mx*.95&&mx>1.1?i:-1).filter(i=>i>=0),low:s.map((x,i)=>x<=mn*1.05&&mn<.9?i:-1).filter(i=>i>=0),seaK:mx-mn,sv:seaVar(t),risk,
    margin:cm>=.5?2:cm>=.3?1:0,pl:T.pl|0,owner:!B.hand?0:(T.ow||1.05)>=1.08?2:1,pay:f.prof>0?B.cap/f.prof:0,f,cap:T.cap||0};}
// советы Людмилы (bizAdvise): z_ev — ждёт решения, z_tax — другой режим выгоднее, z_up — улучшение окупится быстро, z_sat — рынок вида насыщен, z_hand — рука без дела
function ownAdvise(W,o){if(W.ned||!W.me||!W.ip)return;const O=ow(W);
  if(O.ev)o.push({k:'z_ev',pri:64,a:{k:O.ev.k}});
  if(E.taxOk(W)){const a=taxAdv(W);const cur=W.taxm==='usn6'?a.u6:a.u15,oth=W.taxm==='usn6'?a.u15:a.u6;if(a.best!==W.taxm&&cur-oth>Math.max(12e3,cur*.1))o.push({k:'z_tax',pri:58,a:{m:a.best,save:rnd0(cur-oth)}});}
  let bu=null;for(const b of W.biz){if(b.st!=='w'||!LV[b.t])continue;const g=lvGain(W,b);if(g&&g.pay<=8&&W.cash>=g.x.c+E.bizRes(W)&&(!bu||g.pay<bu.pay))bu={id:b.id,bt:b.t,pay:g.pay,g:g.g,ru:g.x.ru,en:g.x.en};}
  if(bu)o.push({k:'z_up',pri:45,a:bu});
  for(const t in TR){const n=W.biz.filter(b=>b.t===t&&b.c===(W.home||'kuz')).length;if(n<2)continue;const s=satOf(W,t,W.home||'kuz',W.biz.find(b=>b.t===t&&b.c===(W.home||'kuz')));if(s.pct>=.2){o.push({k:'z_sat',pri:44,a:{bt:t,n,p:s.pct}});break;}}
  if(E.stI(W)>=1&&!O.j.length&&E.hands(W).free>0&&W.me.en>=40&&W.biz.some(b=>b.st==='w'))o.push({k:'z_hand',pri:38});}
// миграция старых миров: уровни 1, налог можно сменить сразу (раньше — только в январе), пустое состояние хозяина
function ownMig(W,fx){if(!W.ow||typeof W.ow!=='object'){W.ow=owNew();if(fx&&W.biz&&W.biz.length)fx.push('owner');}const O=W.ow,d=owNew();for(const k in d)if(O[k]===undefined)O[k]=d[k];
  if(!Array.isArray(O.j))O.j=[];if(!Array.isArray(O.cc))O.cc=[];
  for(const b of W.biz||[]){if(typeof b.lv!=='number')b.lv=1;}
  if(W.ip&&typeof W.taxM!=='number')W.taxM=W.m-12;
  if(W.pk&&typeof W.pk==='object'&&W.pk.reg!=null&&typeof W.pk.reg!=='number')W.pk.reg=0;}

Object.assign(E,{OWN_TR:TR,satOf,LV,LV_MAX,lvEff,lvNext,ptUpOk,ptUp,lvGain,MK,MK_CAP,mkSens,mkBoost,mkCost,mkOk,mkEff,mkRun,mkStop,ED,edOk,edStart,ST,stCost,stOk,stTrain,
  JOBS,FRIENDS,jobOk,jobStart,jobStop,ownHands,ptMod,ptRk,ownTh,ownPtDay,ownOpen,ownMgrSh,mgrN,ownLoanK,REG_CR,REG_STEP,rg,luxEn,enBonus,
  ownAdvise,ownDay,ownClose,EV2,EV3,evNew,evAns,passive,taxAdv,oooEta,marginal,charOf,ownMig,ownEd:ed});
})(typeof window!=='undefined'?window:this);
