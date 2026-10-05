/* ================= M39 «Опт» (этап 1 ТЗ M38-wholesale.md): виды опта, машины внутри хозяина, связи (без DOM) =================
   Грузится сразу после js/biz.js (игра, симуляторы, проверки). Дописывает ECON.
   - Все оптовые — тип `whs` с полем `b.kd` ('food'|'drink'|'home'; этап 2 — pack, parts). Параметры видов — OPTK. Каждого вида — один на сеть.
   - Машина всегда у хозяина: газель `van` (только у опта), самосвал `truck` (у стройбазы). Поле `b.at` — id хозяина или 'mkt' (без хозяина:
     частные заказы, только старые сейвы). Купить/продать — vehAdd / vehDel; строками в «Сети» машины не показываются.
   - Доставка опта: нужно машин optCars (по обороту и сезону), свои — VAN_OWN в месяц каждая (и стоящие), недостающие — наёмные VAN_HIRE.
   - Связи LINKS: опт снабжает свои точки дешевле (скидка закупки), потолок связей LINK_CAP, всё вместе со скидкой сети — TOT_CAP;
     включается через месяц после открытия опта; в другом городе — вполсилы (LINK_FAR).
   - Улучшения b.up (0…2 на этапе 1): 1 — «1С и учёт» (потери −1 % выручки), 2 — особое у вида (OPTK[kd].u2).
   Решения владельца 04.10: скидка склада −3,5 % всей рознице убрана (OPT_KEEP35=0 вернёт её), пороги 40/60/80 млн (OPTK.eq).
   M44 (этап 2): виды pack (упаковка, 40 млн + 5 точек еды) и parts (запчасти и шины, 80 млн + шиномонтаж/автосервис); потолок склада lim, смены k.sh,
   закупка к сезону k.pre (напитки, запчасти), улучшения 3 (WMS) и 4 (контракт с сетью — событие b.co → b.ct); стройбаза — манипулятор (b.up 1);
   Транспортная компания tk (60 млн + 2 хозяина): парк в одном месте, направления v.go (id хозяина | 'mkt' | 'snow' | ''), Людмила распределяет (b.auto);
   износ машин v.wr и ТО (vehTO), поломка вместо события brk. */
(function(root){
'use strict';
const E=root.ECON;if(!E||!E.BIZ)return;
const {rnd0}=E._;const BIZ=E.BIZ,DAYS=30;
const L2=(ru,en)=>({ru,en});
// газель опта: своя — водитель 70 тыс. + топливо и мелкий ремонт 20 тыс.; наёмная — 220 тыс. за машино-месяц
const VAN_OWN=90e3,VAN_HIRE=220e3,VAN_CAP=3.2e6,TRUCK_STAFF=80e3,VAN_MAX=6,TRUCK_MAX=10;
// скидка связей точке — не больше 6 %, вместе со скидкой сети — не больше 10 %; в другом городе — вполсилы
const LINK_CAP=.06,TOT_CAP=.10,LINK_FAR=.5;
// 1 — вернуть старую скидку склада −3,5 % всей рознице (продуктовая связь тогда рознице не добавляется)
const OPT_KEEP35=0;
// сезоны видов (среднее ≈ 1): напитки — летом ×1,5, зимой ×0,6
const OSEA={drink:[.6,.6,.75,.9,1.2,1.45,1.5,1.4,1.05,.85,.7,.9],
  // M44: запчасти и шины — два сезона шин (апрель и октябрь ×1,4; со «шинным складом» ×1,6)
  parts:[.9,.9,1,1.4,1,.9,.9,.9,1,1.4,1,.85]};
/* Виды опта. R — оборот в месяц (Кемерово, обычные настройки), mk — наценка для чужих (низкая/средняя/высокая, доля к закупке),
   f — аренда+персонал, loss — потери и пересортица (доля выручки; убирает «1С»), brk — бой тары, sd — запас (дней: дни, покупатели×, порча), dd — покупатели× по отсрочке
   (у хозтоваров норма рынка — 30 дней: без отсрочки ×0,7), cars — газелей в месяц на оборот R, eq — капитал для открытия, need — нужен другой вид, k0 — ручки по умолчанию,
   u2 — особое улучшение (ур. 2). */
const OPTK={
  food:{n:'Продуктовый опт',en:'Food wholesale',ico:'🥫',cap:3.5e6,R:12e6,mk:{lo:.12,mid:.16,hi:.2},rent:200e3,staff:150e3,loss:.01,brk:0,cars:3,eq:0,lim:18e6,
    sd:{s7:[7,.88,.003],s15:[15,1,.01],s30:[30,1.02,.025]},k0:{def:'d0',mk:'mid',sd:'s15'},
    u2:{c:1.5e6,f:40e3,d:1.25,sp:.01,n:'Холодильная камера',en:'Cold room',t:L2('мясо и молочка: оборот +25 %, порча +1 %; своим шаурмам мясо ещё −2 %','meat and dairy: turnover +25%, spoilage +1%; your shawarma stands get meat 2% cheaper')}},
  drink:{n:'Напитки и вода',en:'Drinks & water',ico:'🥤',cap:3e6,R:9e6,mk:{lo:.11,mid:.15,hi:.19},rent:180e3,staff:130e3,loss:.01,brk:.003,cars:2,eq:40e6,need:'food',sea:'drink',lim:14e6,
    sd:{s7:[7,.92,0],s15:[15,1,.002],s30:[30,1.02,.006]},k0:{def:'d0',mk:'mid',sd:'s15'},
    u2:{c:2e6,f:0,brk:.001,sum:1.15,n:'Площадка под тару и погрузчик',en:'Crate yard & forklift',t:L2('бой тары 0,3 % → 0,1 %, летом (май–август) оборот +15 %','breakage 0.3% → 0.1%, summer (May–Aug) turnover +15%')}},
  home:{n:'Хозтовары и бытовая химия',en:'Household goods & cleaning',ico:'🧴',cap:3.5e6,R:6e6,mk:{lo:.18,mid:.22,hi:.26},rent:120e3,staff:100e3,loss:.01,brk:0,cars:1.5,eq:80e6,lim:7e6,
    sd:{s7:[7,.8,0],s15:[15,.92,0],s30:[30,1,0]},dd:{d0:.7,d7:.8,d14:.9,d30:1},k0:{def:'d14',mk:'mid',sd:'s30'},
    u2:{c:4e6,f:0,mg:.012,lk:.02,n:'Своя фасовка («своя марка»)',en:'Own packing (own brand)',t:L2('наценка +3 п.п. на 40 % товара; своим хозмагазинам, мойкам и химчисткам ещё −2 %','mark-up +3 pp on 40% of goods; your hardware shops, car washes and dry cleaners get 2% more off')}}};
// M44 (этап 2): упаковка и запчасти. needN — нужно n своих точек этих видов; needT — нужна хоть одна точка этих видов
OPTK.pack={n:'Упаковка для общепита',en:'Food-service packaging',ico:'🧻',cap:2.5e6,R:4.5e6,mk:{lo:.12,mid:.16,hi:.2},rent:90e3,staff:70e3,loss:.01,brk:0,cars:1,eq:40e6,lim:5.5e6,
  needN:{t:['shaw','coffee','bakery','canteen','truckf'],n:5},sd:{s7:[7,.9,0],s15:[15,1,0],s30:[30,1.02,0]},k0:{def:'d7',mk:'mid',sd:'s15'},
  u2:{c:2e6,f:0,mg:.017,n:'Печать логотипа',en:'Logo printing',t:L2('стаканы и коробки с логотипом: наценка чужим +2 п.п.','cups and boxes with a logo: mark-up for outside buyers +2 pp')}};
OPTK.parts={n:'Автозапчасти и шины',en:'Auto parts & tyres',ico:'🔩',cap:4e6,R:9e6,mk:{lo:.16,mid:.2,hi:.24},rent:180e3,staff:150e3,loss:.01,brk:0,cars:2,eq:80e6,lim:12e6,
  needT:['tire','sto'],sea:'parts',sd:{s7:[7,.85,0],s15:[15,.95,0],s30:[30,1,0]},dd:{d0:.7,d7:.8,d14:.9,d30:1},k0:{def:'d14',mk:'mid',sd:'s15'},
  u2:{c:3e6,f:0,pk:1.6,inc:60e3,n:'Шинный склад-хранение',en:'Tyre storage',t:L2('хранит чужие шины (+60 тыс. в месяц), пик шин ×1,6 вместо ×1,4; своим шиномонтажам шины ещё −2 %','stores customers’ tyres (+60k a month), tyre peak ×1.6 instead of ×1.4; your tyre shops get 2% more off')}};
const OPT_KD=['food','drink','pack','home','parts'];
// M44: потолок склада (сколько можно отгрузить в месяц): две смены ×1,35 (+180 тыс. зарплат), адресное хранение (ур. 3) ×1,4 и персонал −20 %
const SH2_K=1.35,SH2_F=180e3,WMS_K=1.4,WMS_ST=.8;
const UP3={c:2.5e6,n:'Адресное хранение и сканеры',en:'Address storage & scanners',t:L2('потолок склада +40 %, персонал −20 %','warehouse ceiling +40%, staff −20%')};
// ур. 4 — контракт с сетью: не покупается, приходит событием (есть ур. 3): +30 % оборота, наценка −4 п.п., отсрочка 45 дней, штраф 15 % за недопоставку
const CT_K=.3,CT_MK=.04,CT_DD=45,CT_BAD=.005,CT_PEN=.15,CT_P=.3;
const UP4={ev:1,n:'Контракт с сетью магазинов',en:'Retail chain contract',t:L2('приходит предложением, когда есть ур. 3: оборот +30 %, наценка −4 п.п., отсрочка 45 дней, штраф 15 % за недопоставку','comes as an offer once you have step 3: turnover +30%, mark-up −4 pp, 45-day credit, 15% fine for short delivery')};
// закупка к сезону (k.pre='yes'): за 2 месяца до пика закупаем q месяцев пиковой закупки на 5 % дешевле
// sh — какая доля закупки пикового месяца идёт из заранее купленного (напитки: 1 месяц из 4 пиковых; запчасти: полмесяца на каждый пик)
const PRE_D=.05,PRE={drink:{buy:[2],peak:[4,5,6,7],q:1,sh:.25},parts:{buy:[1,7],peak:[3,9],q:.5,sh:.5}};
// стройбаза: манипулятор (ур. 1) — «штучные стройматериалы» +20 % выручки базы с маржой 15 %, оператор 60 тыс.
const MAN={c:6e6,add:.2,mg:.15,f:60e3,n:'Манипулятор',en:'Crane truck',t:L2('штучные стройматериалы (цемент, блоки, смеси): выручка базы +20 %','building supplies (cement, blocks, mixes): yard revenue +20%')};
// Транспортная компания: чужие заказы газели +170 тыс. выручки (−90 своих расходов = +80), самосвала 420 тыс. × сезон, вывоз снега 460 тыс. (дек.–март); переменные 35 %
// со своей ТК наёмные дешевле: диспетчер собирает рейсы — хозяин платит ТК 200 тыс. за газель (вместо 220) и 650 ₽/т (вместо 700),
// ТК платит перевозчикам на TK_BRK / TK_BRK_T меньше — это её выручка (посредничество)
const TK_HIRE=200e3,TK_HIRE_T=650,TK_BRK=30e3,TK_BRK_T=50,TK_EQ=60e6,TK_VAN_R=170e3,TK_TR_R=420e3,TK_SNOW_R=460e3,TK_TV=.35,SNOW_M=[11,0,1,2],TK_MAX=20;
const TK_UP=[{c:.5e6,n:'GPS-мониторинг',en:'GPS tracking',t:L2('топливо на чужих заказах −8 %','fuel on outside orders −8%')},{c:2e6,n:'Свой бокс ТО',en:'Own service bay',t:L2('ТО вдвое дешевле, поломок вдвое меньше','maintenance half price, half as many breakdowns')}];
// износ: +8 % в месяц в работе (+3 % стоя), с 80 % — поломка 14 % в месяц (5 дней и ремонт); ТО — 2 дня, износ → 5 %
const WR_M=8,WR_IDLE=3,WR_BRK=80,BRK_P=.14,BRK_D=5,TO_D=2,WR_AUTO=70,TO_C={van:30e3,truck:50e3},REP_C={van:60e3,truck:150e3};
const UP1={c:.4e6,n:'1С и учёт',en:'1C accounting',t:L2('потери и пересортица −1 % выручки','losses and mis-sorts −1% of revenue')};
// покупатели × по наценке (низкая / средняя / высокая)
const MKD={lo:1.3,mid:1,hi:.65};
/* Связи: от вида опта → кому (вид точки: скидка закупки). up2 — прибавка с особым улучшением. */
const LINKS={food:{shaw:.035,kiosk:.035,coffee:.035,canteen:.035,bakery:.035,truckf:.035},
  drink:{kiosk:.015,coffee:.015,truckf:.015,club:.015},
  home:{hard:.04,wash:.05,clean:.04}};
const LINK_UP2={food:{shaw:.02},home:{hard:.02,wash:.02,clean:.02},parts:{tire:.02}};
// M44: упаковка — расходники −1 % точкам еды, ПВЗ — штрафы за брак упаковки −30 % (LINK_RK); запчасти — шиномонтаж −6 %, автосервис −5 %
LINKS.pack={shaw:.01,coffee:.01,bakery:.01,canteen:.01,truckf:.01};LINKS.parts={tire:.06,sto:.05};
const LINK_RK={pack:{pvz:.3}};

/* ---------------- помощники ---------------- */
const kdOf=b=>b&&OPTK[b.kd]?b.kd:'food';
const isVeh=t=>t==='van'||t==='truck';
const isOwner=b=>b&&(b.t==='whs'||b.t==='base'||b.t==='tk');
function fleet(W,id){return W.biz.filter(b=>isVeh(b.t)&&b.at===id);}
// M44: машины ТК, которые Людмила (или игрок) отправила работать на хозяина: v.go = id хозяина
function fleetTk(W,id){return W.biz.filter(b=>isVeh(b.t)&&b.go===id&&b.at!==id);}
// свои машины хозяина в работе (W._fd = {id, d} — «а если на одну больше/меньше», только для прогнозов); M44: + машины ТК на него, без сломанных и стоящих на ТО
function fleetN(W,b){if(!b||!b.id)return 0;let n=0;for(const x of W.biz)if((x.at===b.id||x.go===b.id)&&x.st==='w'&&!(x.down>0)&&isVeh(x.t))n++;if(W._fd&&W._fd.id===b.id)n=Math.max(0,n+W._fd.d);return n;}
function optOf(W,kd){return W.biz.find(b=>b.t==='whs'&&kdOf(b)===kd);}
function knobs(kd,k){const d=OPTK[kd].k0;k=k||{};return {def:k.def||d.def,mk:MKD[k.mk]?k.mk:d.mk,sd:OPTK[kd].sd[k.sd]?k.sd:d.sd,sh:k.sh==='two'?'two':'one',pre:k.pre==='yes'&&PRE[kd]?'yes':'no'};}
// M44: потолок склада (₽ выручки в месяц) с учётом смен и адресного хранения
function optLim(b,kk){const kd=kdOf(b);kk=kk||knobs(kd,b.k);return OPTK[kd].lim*(kk.sh==='two'?SH2_K:1)*((b.up||0)>=3?WMS_K:1);}
const ctOn=(W,b)=>b.ct&&W.t<b.ct.end;
function seaK(kd,m){const s=OPTK[kd].sea;return s?OSEA[s][m]:1;}
// дней запаса на полке (для restock, stockDays)
function optSd(b){if(b.oc)return b.oc.sd;const kd=kdOf(b),K=OPTK[kd],k=knobs(kd,b.k);return K.sd[k.sd][0];}
// переходные 3 месяца после обновления (W.optT): старый склад считается как раньше (b.oc — его прежний товар), рознице — старая скидка −3,5 %, связей ещё нет
const OPT_TR=3;

/* ---------------- экономика опта (зовёт econ из biz.js; dem — спрос города и ⭐ без сезона) ---------------- */
function optEcon(W,b,k,m,noEv,dem,o){if(b.oc&&W.optT>W.m){const c=b.oc,rev=12e6*dem*(o.d||1)*c.d*(c.sea&&E.SEA[c.sea]?E.SEA[c.sea][m]:1),vc=rev*c.v,risk=rev*(o.bad||0),f=400e3;
    return {rev,vc,sp:0,f,risk,log:0,prof:rev-vc-f-risk,need:0,own:0,hire:0,idle:0,mg:0,old:1};}
  const kd=kdOf(b),K=OPTK[kd],kk=knobs(kd,k),up=b.up||0,C=E.CITY[b.c]||E.CITY.kuz;
  const dd=K.dd?(K.dd[kk.def]!=null?K.dd[kk.def]:1):(o.d||1),sd=K.sd[kk.sd],mk=K.mk[kk.mk];
  let sk=seaK(kd,m);if(up>=2&&K.u2.pk&&sk>1.2)sk*=K.u2.pk/1.4;   // M44: шинный склад — пик шин ×1,6
  let d=dem*sk*dd*MKD[kk.mk]*sd[1];
  if(up>=2){const u=K.u2;if(u.d)d*=u.d;if(u.sum&&m>=4&&m<=7)d*=u.sum;}
  // M44: потолок склада — чужие покупатели и контракт с сетью режутся поровну; недопоставка по контракту — штраф 15 %
  const r0=K.R*d,c0=ctOn(W,b)?r0*(b.ct.k||CT_K):0,lim=optLim(b,kk),sc=r0+c0>lim?lim/(r0+c0):1,r1=r0*sc,ct=c0*sc,ctFine=(c0-ct)*CT_PEN,rev=r1+ct;
  let sp=rev*((up>=1?0:K.loss)+sd[2]+(up>=2&&K.u2.brk!=null?K.u2.brk:K.brk)+(up>=2&&K.u2.sp?K.u2.sp:0));
  let vc=r1/(1+mk)+ct/(1+Math.max(.02,mk-(b.ct&&b.ct.mk||CT_MK)))+sp;if(up>=2&&K.u2.mg)vc-=r1*K.u2.mg;
  // M44: закупка к сезону — в прогнозе пиковые месяцы дешевле (на деле — скидка на закупленный заранее товар, b.pd)
  if(noEv&&kk.pre==='yes'&&PRE[kd]&&PRE[kd].peak.indexOf(m)>=0)vc-=r1/(1+mk)*PRE_D*PRE[kd].sh;
  let f=K.rent*C.rent+K.staff*(up>=3?WMS_ST:1)+(up>=2?K.u2.f||0:0)+(kk.sh==='two'?SH2_F:0);
  const inc2=up>=2&&K.u2.inc?K.u2.inc:0;
  const need=K.cars*rev/K.R,own=fleetN(W,b),use=Math.min(own,need),hire=Math.max(0,need-own);
  const hp=tkOn(W)?TK_HIRE:VAN_HIRE,log=own*VAN_OWN+hire*hp,risk=r1*(o.bad||0)+ct*CT_BAD+ctFine;
  return {rev:rev+inc2,vc,sp,f,risk,log,prof:rev+inc2-vc-f-risk-log,need,own,hire,hp,idle:own-use,mg:0,lim,cut:r0+c0>lim?r0+c0-lim:0,ct,ctFine,inc2};}
function tkOn(W){for(const b of W.biz)if(b.t==='tk'&&b.st==='w')return true;return false;}
// стройбаза: свои самосвалы (at = база) возят её щебень; что не нужно базе и подрядам — частные заказы (выручка базы); зарплата водителей — в постоянных базы
function baseTrucks(W,b,q,m,noEv){const n=fleetN(W,b),cap=n*E.TRUCK_T,own=Math.min(q,cap);let pc=0;
  if(!noEv&&W._pcTr&&W._pcTr[b.id]!=null)pc=W._pcTr[b.id]*DAYS;else if(W.pc&&W.pc.a&&W.pc.a.length){let pq=0;for(const c of W.pc.a)if(c.dq<c.q)pq+=c.qm;pc=Math.min(cap-own,pq/Math.max(1,W.biz.filter(x=>x.t==='base'&&x.st==='w').length));}
  pc=Math.max(0,Math.min(cap-own,pc));const free=Math.max(0,(cap-own-pc)/E.TRUCK_T);
  const C=E.CITY[b.c]||E.CITY.kuz,T=BIZ.truck,pr=free*T.R*C.dem*E.season('truck',m);
  return {n,own,pc,free,prRev:pr,prVc:pr*T.v,staff:n*TRUCK_STAFF,hireT:tkOn(W)?TK_HIRE_T:E.HIRE_T};}
// прогноз хозяина «если машин на d больше/меньше» — в среднем за год (₽/мес); {now, d, gain}
function fleetGain(W,b,d){const f0=E.bizForecast(W,b,b.k).prof;W._fd={id:b.id,d};let f1;try{f1=E.bizForecast(W,b,b.k).prof;}finally{delete W._fd;}return {now:rnd0(f0),then:rnd0(f1),gain:rnd0(f1-f0)};}
// сколько машин нужно хозяину в этом месяце (и в среднем, в пике)
function optCars(W,b,m){m=m==null?W.m%12:m;const x=E.bizEcon(W,b,b.k,m,true);
  if(b.t==='base'){const T=E.TRUCK_T;return {need:x.q/T,own:x.tn||0,hire:Math.max(0,x.q-(x.tn||0)*T)/T,idle:x.fr||0,unit:T};}
  return {need:x.need,own:x.own,hire:x.hire,idle:x.idle};}

/* ---------------- машины: купить, продать, польза ---------------- */
function vehType(o,t){return o.t==='base'?'truck':o.t==='tk'?(t==='truck'?'truck':'van'):'van';}
function vehCan(W,ownerId,t){const o=W.biz.find(b=>b.id===ownerId);if(!isOwner(o))return 'no';t=vehType(o,t);const B=BIZ[t];
  if(o.t==='tk'?fleet(W,o.id).length>=TK_MAX:fleet(W,o.id).length>=(t==='van'?VAN_MAX:TRUCK_MAX))return 'max';if(W.cash<B.cap)return 'cash';return 'ok';}
// t — тип машины для ТК ('van' | 'truck'), go — куда ТК её сразу отправит (иначе — как решит Людмила / стоит)
function vehAdd(W,ownerId,t,go){const r=vehCan(W,ownerId,t);if(r!=='ok')return r;const o=W.biz.find(b=>b.id===ownerId);t=vehType(o,t);
  const x=E.bizOpen(W,t,{c:o.c,veh:1});if(x!=='ok')return x;const v=W.biz[W.biz.length-1];v.at=o.id;v.wr=0;if(o.t==='tk'){v.go=go||'';if(o.auto&&!go)tkPlan(W);}return 'ok';}
// how: 'sell' — продать (по цене продажи), 'mkt' — самосвал без хозяина (частные заказы), 'tk' — M44: отдать в Транспортную компанию
function vehDel(W,id,how){const v=W.biz.find(b=>b.id===id);if(!v||!isVeh(v.t))return 'no';if(how==='mkt'){if(v.t!=='truck')return 'no';v.at='mkt';delete v.go;return 'ok';}
  if(how==='tk'){const t=tkOf(W);if(!t||v.at===t.id)return 'no';v.at=t.id;v.go='';delete v.mkS;if(t.auto)tkPlan(W);return 'ok';}
  return E.bizSell(W,id);}
// самосвалы без хозяина (старые сейвы) → в парк стройбазы ownerId (vid — один, иначе все); → сколько передали
function vehTo(W,ownerId,vid){const o=W.biz.find(b=>b.id===ownerId);if(!o||o.t!=='base')return 'no';let n=0;
  for(const v of W.biz)if(v.t==='truck'&&v.at==='mkt'&&(!vid||v.id===vid)&&fleet(W,o.id).length<TRUCK_MAX){v.at=o.id;delete v.mkS;n++;}return n?'ok':'no';}
// польза машины для карточки: где работает и сколько экономит хозяину (₽/мес, в среднем за год)
function vehUse(W,v){if(typeof v==='string')v=W.biz.find(b=>b.id===v);if(!v)return null;const o=W.biz.find(b=>b.id===v.at);
  if(!o||v.at==='mkt'){const x=E.bizEcon(W,v);return {where:'mkt',save:rnd0(x.prof),o:null};}
  if(v.st!=='w')return {where:o.id,save:0,o,wait:v.left};
  if(o.t==='tk'){const g=W.biz.find(b=>b.id===v.go&&b.st==='w'),m=W.m%12,dm=tkDem(W,o);
    if(g){const x=fleetGain(W,g,-1);return {where:o.id,save:Math.max(0,-x.gain),o,go:g,cost:v.t==='van'?VAN_OWN:TRUCK_STAFF};}
    const r=v.go==='mkt'?(v.t==='van'?TK_VAN_R*dm:TK_TR_R*dm*E.season('truck',m)*(1-TK_TV)):v.go==='snow'&&SNOW_M.indexOf(m)>=0?TK_SNOW_R*dm*(1-TK_TV):0;
    const c=v.t==='van'?VAN_OWN:TRUCK_STAFF;return {where:o.id,save:rnd0(r-c),o,go:v.go||'',cost:c,tk:1};}
  const g=fleetGain(W,o,-1);return {where:o.id,save:Math.max(0,-g.gain),o,cost:v.t==='van'?VAN_OWN:TRUCK_STAFF};}

/* ---------------- M44: Транспортная компания («Диспетчерская») ---------------- */
function tkOf(W){return W.biz.find(b=>b.t==='tk');}
const tkDem=(W,t)=>{const C=E.CITY[t&&t.c]||E.CITY.kuz;return C.dem;};
// можно ли открыть: одна на сеть, капитал от 60 млн, есть 2 хозяина машин (2 опта или стройбаза + опт)
function tkCan(W){if(W.biz.some(b=>b.t==='tk'))return 'max';if(W.biz.filter(b=>b.t==='whs'||b.t==='base').length<2)return 'have2';if(E.equity(W)<TK_EQ)return 'eq';if(W.cash<BIZ.tk.cap)return 'cash';return 'ok';}
// экономика ТК: машины на хозяев — их расходы у хозяина; на чужих заказах и вывозе снега — выручка ТК; стоящие — водитель за счёт ТК
function tkEcon(W,b,k,m,noEv,dem){const gps=(b.up||0)>=1,vk=TK_TV*(gps?.92:1);let rev=0,vc=0,f=BIZ.tk.staff,mk=0,sn=0,idle=0,own=0,n=0;
  for(const v of W.biz){if(v.at!==b.id||!isVeh(v.t)||v.st!=='w')continue;n++;
    if(v.go&&v.go!=='mkt'&&v.go!=='snow'&&W.biz.some(o=>o.id===v.go&&o.st==='w')){own++;continue;}
    f+=v.t==='van'?VAN_OWN:TRUCK_STAFF;if(v.down>0){idle++;continue;}
    if(v.go==='mkt'){mk++;if(v.t==='van')rev+=TK_VAN_R*dem;else{const r=TK_TR_R*dem*E.season('truck',m);rev+=r;vc+=r*vk;}}
    else if(v.go==='snow'&&SNOW_M.indexOf(m)>=0&&v.t==='truck'){sn++;const r=TK_SNOW_R*dem;rev+=r;vc+=r*vk;}else idle++;}
  // посредничество: наёмные машины для своих оптов и баз ТК находит дешевле — разница её
  let br=0;if(b.st==='w')for(const o of W.biz){if(o.st!=='w'||o.t!=='whs'&&o.t!=='base')continue;const x=E.bizEcon(W,o,o.k,m,true);br+=o.t==='whs'?(x.hire||0)*TK_BRK:Math.max(0,(x.q||0)-(x.own||0))*TK_BRK_T;}
  rev+=br;return {rev,vc,sp:0,f,risk:0,log:0,prof:rev-vc-f,mg:0,mk,sn,idle,own,n,br};}
// польза машины в каждом направлении (₽/мес, этот месяц): хозяину — сколько наёмных она заменит, чужим заказам/снегу — маржа
function tkVal(W,t,v,dir,m){const dm=tkDem(W,t);if(dir==='mkt')return v.t==='van'?TK_VAN_R*dm:TK_TR_R*dm*E.season('truck',m)*(1-TK_TV);
  if(dir==='snow')return v.t==='truck'&&SNOW_M.indexOf(m)>=0?TK_SNOW_R*dm*(1-TK_TV):0;
  const o=W.biz.find(b=>b.id===dir);if(!o||o.st!=='w')return 0;
  if(o.t==='whs'&&v.t==='van'){const c=optCars(W,o,m);return Math.min(1,c.hire)*(tkOn(W)?TK_HIRE:VAN_HIRE);}
  if(o.t==='base'&&v.t==='truck'){const x=E.bizEcon(W,o,o.k,m,true);let pq=0;if(W.pc&&W.pc.a)for(const c of W.pc.a)if(c.dq<c.q)pq+=c.qm/Math.max(1,W.biz.filter(b=>b.t==='base'&&b.st==='w').length);
    const ht=Math.max(0,x.q+pq-(x.tn||0)*E.TRUCK_T);return Math.min(E.TRUCK_T,ht)*((tkOn(W)?TK_HIRE_T:E.HIRE_T)-E.OWN_T);}
  return 0;}
// Людмила распределяет: раз в месяц (и после покупки/передачи машины) — каждую машину ТК туда, где польза больше, с учётом сезона
function tkPlan(W,m){const t=tkOf(W);if(!t||t.st!=='w')return;m=m==null?W.m%12:m;const pool=W.biz.filter(v=>v.at===t.id&&isVeh(v.t));for(const v of pool)v.go='';
  const dirs=W.biz.filter(o=>(o.t==='whs'||o.t==='base')&&o.st==='w').map(o=>o.id).concat(['mkt','snow']);
  for(const v of pool){let best='',bv=0;for(const d of dirs){const x=tkVal(W,t,v,d,m);if(x>bv+1){bv=x;best=d;}}v.go=best;}}
function tkAuto(W,on){const t=tkOf(W);if(!t)return 'no';t.auto=on?1:0;if(on)tkPlan(W);return 'ok';}
// вручную: ещё одну машину типа vt в направление dir (из стоящих) или убрать одну оттуда (станет стоять); ручной режим включается сам
function tkGo(W,dir,vt,d){const t=tkOf(W);if(!t)return 'no';const pool=W.biz.filter(v=>v.at===t.id&&v.t===vt);
  if(d>0){const v=pool.find(x=>!x.go)||null;if(!v)return 'none';v.go=dir;}else{const v=pool.filter(x=>x.go===dir).pop();if(!v)return 'none';v.go='';}
  t.auto=0;return 'ok';}
// взять машину из ТК к хозяину (сначала стоящую, потом с чужих заказов) — «＋» в парке хозяина без покупки
function tkFree(W,o){const t=tkOf(W);if(!t||!o||o.t==='tk')return null;const vt=o.t==='base'?'truck':'van',pool=W.biz.filter(v=>v.at===t.id&&v.t===vt&&v.st==='w'&&v.go!==o.id);
  return pool.find(v=>!v.go)||pool.find(v=>v.go==='mkt')||pool.find(v=>v.go==='snow')||null;}
function vehTake(W,ownerId){const o=W.biz.find(b=>b.id===ownerId),v=tkFree(W,o);if(!v)return 'none';v.at=o.id;delete v.go;return 'ok';}
// собрать все машины хозяев в парк ТК (каждая пока работает там же — Людмила потом переставит по сезону)
function tkGather(W){const t=tkOf(W);if(!t)return 0;let n=0;for(const v of W.biz)if(isVeh(v.t)&&v.at&&v.at!==t.id&&v.at!=='mkt'&&W.biz.some(o=>o.id===v.at)&&fleet(W,t.id).length<TK_MAX){v.go=v.at;v.at=t.id;n++;}
  if(n&&t.auto)tkPlan(W);return n;}
// газель главы 2 (малое дело gazel) → машина парка ТК (балансовая стоимость та же)
function gazelToTk(W,id){const t=tkOf(W),b=W.biz.find(x=>x.id===id);if(!t||!b||b.t!=='gazel'||b.st!=='w')return 'no';
  b.t='van';b.at=t.id;b.go='';b.k={};b.mgr=0;b.wr=b.wr||Math.min(40,(b.wm||0)*2);delete b.ld;if(t.auto)tkPlan(W);return 'ok';}
// стройбаза зимой: лишние самосвалы — на вывоз снега через ТК
function baseSnow(W,id){const t=tkOf(W),b=W.biz.find(x=>x.id===id);if(!t||!b||b.t!=='base')return 'no';const x=E.bizEcon(W,b,b.k,null,true),k=Math.floor(x.fr+.05);if(k<1)return 'none';
  const fl=fleet(W,b.id).filter(v=>v.st==='w').slice(-k);for(const v of fl){v.at=t.id;v.go='snow';}return fl.length?'ok':'none';}

/* ---------------- M44: износ и ТО ---------------- */
const tkBox=W=>{const t=tkOf(W);return !!(t&&t.st==='w'&&(t.up||0)>=2);};
function toCost(W,v){return TO_C[v.t]*(tkBox(W)?.5:1);}
function vehTO(W,id){const v=W.biz.find(b=>b.id===id);if(!v||!isVeh(v.t)||v.st!=='w')return 'no';if(v.down>0)return 'busy';const c=toCost(W,v);if(W.cash<c)return 'cash';
  const t0=E.tg(v.at&&W.biz.some(o=>o.id===v.at)?v.at:v.id);E.bizCost(W,c,'fix','fix',BIZ[v.t].seg);E.tg(t0);v.wr=5;v.down=TO_D;v.to=W.m;return 'ok';}
// стоит без дела: в ТК без направления, снег не зимой, лишняя у хозяина
function vehIdle(W,v,m){const t=tkOf(W);if(t&&v.at===t.id)return !v.go||v.go==='snow'&&SNOW_M.indexOf(m)<0;return false;}
// месяц: износ, поломки, авто-ТО (если ТК и Людмила распределяет)
function vehMonth(W,off){const m=W.m%12,t=tkOf(W),auto=t&&t.st==='w'&&t.auto;
  for(const v of W.biz){if(!isVeh(v.t)||v.st!=='w')continue;v.wr=Math.min(100,(v.wr||0)+(vehIdle(W,v,m)?WR_IDLE:WR_M));
    if(v.wr>=WR_BRK&&!(v.down>0)&&E._.R(W)<BRK_P*(tkBox(W)?.5:1)){const c=REP_C[v.t];const t0=E.tg(v.at&&W.biz.some(o=>o.id===v.at)?v.at:v.id);E.bizCost(W,c,'oth','oth',BIZ[v.t].seg);E.tg(t0);v.down=BRK_D;v.wr=Math.max(40,v.wr-30);E._.news(W,'biz',{k:'vbrk',bt:v.t,c,id:v.id});}
    else if(auto&&!(v.down>0)&&(v.wr>=WR_AUTO||v.wr>=50&&v.t==='truck'&&SNOW_M.indexOf(m)>=0&&v.go!=='snow')&&W.cash>toCost(W,v)*3)vehTO(W,v.id);}}

/* ---------------- M44: закупка к сезону (напитки, запчасти) ---------------- */
function optPre(W,b){if(W.d!==1||b.st!=='w')return;const kd=kdOf(b),P=PRE[kd];if(!P||knobs(kd,b.k).pre!=='yes'||b.pd>0||b.oc)return;const mo=W.m%12;if(P.buy.indexOf(mo)<0)return;
  const pk=P.peak.find(x=>x>mo)!=null?P.peak.find(x=>x>mo):P.peak[0],k2=Object.assign({},b.k,{pre:'no'}),x=E.bizEcon(W,b,k2,pk,true),q=rnd0(x.vc*P.q),c=rnd0(q*(1-PRE_D));
  if(c<=0||W.cash-E.bizDuty(W)<c)return;E._.pay(W,c,'supp');b.stk=(b.stk||0)+c;b.pd=q;b.pdM=W.m;E._.news(W,'biz',{k:'optpre',kd,a:c});}
// день: сколько себестоимости продажи покрыто заранее закупленным (скидка 5 %)
function optPreUse(b,vc){if(!(b.pd>0))return vc;const u=Math.min(vc,b.pd);b.pd-=u;if(b.pd<1)b.pd=0;return vc-u*PRE_D;}

/* ---------------- M44: стройбаза — манипулятор ---------------- */
function baseMan(W,b,s){if((b.up||0)<1)return null;const rev=s*MAN.add;return {rev,vc:rev*(1-MAN.mg),f:MAN.f};}

/* ---------------- связи ---------------- */
function linkOn(W,o){return o&&o.t==='whs'&&o.st==='w'&&!(o.down>0)&&(o.wm||0)>=1;}
// скидка закупки точке b от своих оптов: {d (с потолком), src:[{id,kd,d}]}
function linkOf(W,b){const r={d:0,raw:0,src:[]};if(!b||W._noLink||W.ned&&!W.biz.length)return r;
  for(const o of W.biz){if(!linkOn(W,o))continue;const kd=kdOf(o),L=LINKS[kd];if(!L||!L[b.t])continue;if(OPT_KEEP35&&kd==='food'&&BIZ[b.t].seg==='retail')continue;
    let d=L[b.t]+((o.up||0)>=2&&LINK_UP2[kd]&&LINK_UP2[kd][b.t]||0);if(o.c&&b.c&&o.c!==b.c)d*=LINK_FAR;d*=optLoadK(W,o);r.raw+=d;r.src.push({id:o.id,kd,d});}
  const ch=E.chainDisc(W,b.t);r.d=Math.max(0,Math.min(r.raw,LINK_CAP,TOT_CAP-ch));
  // M44: ПВЗ — свой опт упаковки: штрафы за брак упаковки −30 % (не скидка закупки)
  for(const o of W.biz){if(!linkOn(W,o))continue;const kd=kdOf(o),R=LINK_RK[kd];if(!R||!R[b.t])continue;let k=R[b.t];if(o.c&&b.c&&o.c!==b.c)k*=LINK_FAR;r.rk=Math.min(.5,(r.rk||0)+k);r.src.push({id:o.id,kd,d:0,rk:k});}
  return r;}
function linkRk(W,b){if(W._noLink||W.optT>W.m)return 0;return linkOf(W,b).rk||0;}
/* M44: «опт не успевает» — если свои точки закупают больше половины потолка склада, скидка своим уменьшается пропорционально.
   Закупка своих — по econ без связей; кэш на день (WeakMap, в сейв не попадает). */
const OLC=typeof WeakMap!=='undefined'?new WeakMap():null;
function optLoad(W,o){const L=LINKS[kdOf(o)];if(!L)return 0;let c=OLC&&OLC.get(W);if(!c||c.t!==W.t||c.n!==W.biz.length){c={t:W.t,n:W.biz.length,v:{}};if(OLC)OLC.set(W,c);}
  if(c.v[o.id]!=null)return c.v[o.id];c.v[o.id]=0;let a=0;const nl=W._noLink;W._noLink=1;try{for(const b of W.biz)if(b.st==='w'&&L[b.t]){const x=E.bizEcon(W,b,b.k,null,true);a+=Math.max(0,x.vc||0);}}finally{if(nl)W._noLink=nl;else delete W._noLink;}
  c.v[o.id]=a;return a;}
function optLoadK(W,o){if(W._olOff)return 1;const lim=optLim(o),a=optLoad(W,o);return a>lim*.5?lim*.5/a:1;}
function linkDisc(W,b){if(W._noLink||W.optT>W.m)return 0;let ok=false;for(const o of W.biz)if(o.t==='whs'&&o.st==='w'){ok=true;break;}return ok?linkOf(W,b).d:0;}
// польза связей: разница прибыли точек со связью и без (₽/мес, этот месяц); [{from, kd, a, to:[{id,t,a}]}] + сумма
function linkSum(W,m){const by={},out=[];let sum=0;
  for(const b of W.biz){if(b.st!=='w'||E.SMALL.indexOf(b.t)<0)continue;const lo=linkOf(W,b);if(!lo.d&&!lo.rk)continue;
    const x1=E.bizEcon(W,b,b.k,m,true);W._noLink=1;let x0;try{x0=E.bizEcon(W,b,b.k,m,true);}finally{delete W._noLink;}const a=x1.prof-x0.prof;if(!(a>0))continue;sum+=a;
    // делим пользу между оптами пропорционально их скидке
    const tot=lo.src.reduce((q,s)=>q+(s.d||0)+(s.rk||0),0)||1;
    for(const s of lo.src){const g=by[s.id]||(by[s.id]={from:s.id,kd:s.kd,a:0,to:[]});const p=a*((s.d||0)+(s.rk||0))/tot;g.a+=p;g.to.push({id:b.id,t:b.t,a:rnd0(p)});}}
  for(const id in by){by[id].a=rnd0(by[id].a);out.push(by[id]);}out.sort((x,y)=>y.a-x.a);return {sum:rnd0(sum),a:out};}
// чего не хватает: неоткрытые виды и сколько сэкономили бы ваши точки (подсказка «что открыть дальше»)
function linkHint(W){const o=[];for(const kd of OPT_KD){if(optOf(W,kd))continue;const L=LINKS[kd];let a=0,n=0;const by={};
    for(const b of W.biz){if(b.st!=='w'||!L[b.t])continue;const x=E.bizEcon(W,b,b.k,null,true);const ch=E.chainDisc(W,b.t),cur=linkOf(W,b).d;const add=Math.max(0,Math.min(cur+L[b.t],LINK_CAP,TOT_CAP-ch)-cur);
      const base=x.vc/Math.max(.01,1-ch-cur);a+=base*add*(b.mgr&&!W.opd[b.t]?.7:1);n++;by[b.t]=(by[b.t]||0)+1;}
    o.push({kd,a:rnd0(a),n,by,can:E.bizCan(W,'whs',W.home||'kuz',kd)});}
  return o;}

/* ---------------- улучшения: опт (1С, особое, WMS, контракт), стройбаза (манипулятор), ТК (GPS, бокс ТО) ---------------- */
function upList(b){if(!b)return [];if(b.t==='whs')return [UP1,OPTK[kdOf(b)].u2,UP3,UP4];if(b.t==='base')return [MAN];if(b.t==='tk')return TK_UP;return [];}
function optUpInfo(W,id){const b=W.biz.find(x=>x.id===id);if(!b||!isOwner(b))return null;const up=b.up||0,Ls=upList(b);if(up>=Ls.length)return {max:1,up,n:Ls.length};
  const U=Ls[up];if(U.ev)return {up,lv:up+1,ev:1,n:U.n,en:U.en,t:U.t,co:b.co||null,ct:b.ct||null,ok:false};
  const c=U.c;const f0=E.bizForecast(W,b,b.k).prof,b2=Object.assign({},b,{up:up+1}),f1=E.bizForecast(W,b2,b.k).prof;
  return {up,lv:up+1,c,n:U.n,en:U.en,t:U.t,gain:rnd0(f1-f0),pay:f1>f0?c/(f1-f0):0,ok:W.cash>=c&&b.st==='w'};}
function optUp(W,id){const b=W.biz.find(x=>x.id===id);if(!b||!isOwner(b)||b.st!=='w')return 'no';const u=optUpInfo(W,id);if(!u||u.max)return 'max';if(u.ev)return 'ev';if(W.cash<u.c)return 'cash';
  E._.pay(W,u.c,'capex');b.g+=u.c;b.up=(b.up||0)+1;E._.news(W,'biz',{k:'optup',kd:b.t==='whs'?kdOf(b):b.t,lv:b.up});return 'ok';}
// M44: контракт с сетью (ур. 4): предложение b.co (10 дней на ответ) → b.ct на n месяцев
function optCt(W,id,yes){const b=W.biz.find(x=>x.id===id);if(!b||b.t!=='whs'||!b.co)return 'no';const o=b.co;delete b.co;if(!yes||W.t>o.exp)return 'ok';
  b.ct={st:W.t,end:W.t+o.n*DAYS,n:o.n,k:o.k,mk:o.mk};if((b.up||0)===3)b.up=4;E._.news(W,'biz',{k:'optct',kd:kdOf(b),n:o.n});return 'ok';}
function ctFore(W,b){if(!b.co)return null;const b2=Object.assign({},b,{ct:{end:W.t+1e9,k:b.co.k,mk:b.co.mk}});const f0=E.bizForecast(W,b,b.k),f1=E.bizForecast(W,b2,b.k);
  return {gain:rnd0(f1.prof-f0.prof),rev:rnd0(f1.rev-f0.rev),fine:rnd0((f1.now&&f1.now.ctFine)||0),rec:rnd0((f1.rev-f0.rev)/DAYS*CT_DD)};}

// M44: условия вида кроме капитала: упаковке — 5 своих точек еды ('pts'), запчастям — свой шиномонтаж или автосервис ('have')
function optNeed(W,kd){const K=OPTK[kd];if(!K)return 'no';if(K.need&&!W.biz.some(b=>b.t==='whs'&&kdOf(b)===K.need))return 'have';
  if(K.needT&&!W.biz.some(b=>K.needT.indexOf(b.t)>=0))return 'have';if(K.needN&&W.biz.filter(b=>K.needN.t.indexOf(b.t)>=0).length<K.needN.n)return 'pts';return null;}
function needPts(W,kd){const K=OPTK[kd];return K&&K.needN?W.biz.filter(b=>K.needN.t.indexOf(b.t)>=0).length:0;}
/* ---------------- что видит игрок при открытии: окупаемость вида ---------------- */
function optFore(W,kd,k){const K=OPTK[kd],kk=Object.assign({},K.k0,k||{});const b={t:'whs',kd,c:W.home||'kuz',rt:3.5,k:kk,mgr:0,wm:3,ev:{},up:0};
  const f=E.bizForecast(W,b,kk),o=E.bizOpt(BIZ.whs,'knob',kk.def),stk=rnd0(f.vc/DAYS*K.sd[kk.sd][0]),rec=rnd0(f.rev/DAYS*(o.dd||0));
  return {kd,cap:K.cap,stk,rec,need:K.cap+stk+rec,prof:rnd0(f.prof),rev:rnd0(f.rev),pay:f.prof>0?(K.cap+stk+rec)/f.prof:0,cars:K.cars*f.rev/K.R,log:rnd0(f.log)};}

/* ---------------- месяц: связи для отчёта и «вау» ---------------- */
function optClose(W,off){if(W.optT!=null&&W.m+1>=W.optT){delete W.optT;for(const b of W.biz)if(b.oc)delete b.oc;E._.news(W,'biz',{k:'optnew'});}
  // M44: износ и ТО, контракты с сетью, Людмила распределяет парк ТК на следующий месяц
  vehMonth(W,off);
  for(const b of W.biz){if(b.t!=='whs'||b.st!=='w')continue;
    if(b.ct){const x=E.bizEcon(W,b);if(x.ctFine>1){const t0=E.tg(b.id);E.bizCost(W,x.ctFine,'oth','oth','trade');E.tg(t0);b.ct.f=(b.ct.f||0)+rnd0(x.ctFine);}
      if(W.t>=b.ct.end){E._.news(W,'biz',{k:'optctend',kd:kdOf(b),f:b.ct.f||0});delete b.ct;}}
    if(b.co&&W.t>b.co.exp)delete b.co;
    if(!off&&!b.ct&&!b.co&&(b.up||0)>=3&&(b.wm||0)>=2&&E._.R(W)<CT_P){b.co={exp:W.t+10,n:6+Math.floor(E._.R(W)*7),k:CT_K,mk:CT_MK};E._.news(W,'biz',{k:'optco',kd:kdOf(b),n:b.co.n});}}
  {const t=tkOf(W);if(t&&t.st==='w'&&t.auto)tkPlan(W,(W.m+1)%12);}   // W.m ещё закрываемый месяц — план на следующий
  if(!W.biz.some(b=>b.t==='whs'))return;const s=linkSum(W);const L=W.lnk||(W.lnk={m:-1,sum:0});
  if(s.sum>0&&L.m<0){L.m=W.m;E._.news(W,'biz',{k:'link1',a:s.sum});}L.p=L.sum||0;L.sum=s.sum;}

/* ---------------- миграция старых сейвов (FMT_V 5) ---------------- */
const CAT2KD={food:'food',drink:'drink',home:'home',build:'home'};
// прежний товар склада (до M39: множитель спроса, доля закупки, запас, сезон) — для переходных месяцев
const OLDCAT={food:{d:1,v:.93,sd:15},drink:{d:.95,v:.925,sd:15,sea:'summer'},home:{d:.6,v:.9,sd:30},build:{d:1.1,v:.93,sd:15,sea:'build'}};
function optMigrate(W,fx){if(!Array.isArray(W.biz))return;const used={};
  if(W.optT==null&&W.biz.some(b=>b.t==='whs'&&!b.kd||b.t==='truck'&&!b.at)&&W.st!=='nedra'&&!W.ned)W.optT=W.m+OPT_TR;
  for(const b of W.biz){if(b.t!=='whs')continue;if(!b.kd){let kd=CAT2KD[b.k&&b.k.cat]||'food';if(W.optT!=null)b.oc=Object.assign({},OLDCAT[b.k&&b.k.cat]||OLDCAT.food);if(b.k&&b.k.cat==='build')E._.news(W,'biz',{k:'optmig',a:'build'});
      if(used[kd]){kd=['drink','home','food'].find(x=>!used[x])||kd;E._.news(W,'biz',{k:'optmig',a:'two',kd});}b.kd=kd;if(fx)fx.push('opt:'+kd);}
    used[b.kd]=1;if(b.k){delete b.k.cat;const d=OPTK[b.kd].k0;if(!b.k.mk)b.k.mk=d.mk;if(!b.k.sd)b.k.sd=d.sd;if(!b.k.def)b.k.def=d.def;}if(typeof b.up!=='number')b.up=0;}
  const bases=W.biz.filter(b=>b.t==='base');let i=0;
  for(const b of W.biz){if(b.t!=='truck'||b.at)continue;if(bases.length){b.at=bases[i++%bases.length].id;}else{b.at='mkt';b.mkS=W.m+3;}if(fx)fx.push('truck:'+b.at);}
  for(const b of W.biz)if(b.t==='van'&&!b.at)b.at='mkt';
  if(W.lnk&&typeof W.lnk!=='object')delete W.lnk;
  // M44 (FMT_V 6): износ машин (старым — по возрасту, не больше 40 %, чтобы не ломались сразу), смены и закупка к сезону у опта, ТК — Людмила распределяет
  for(const b of W.biz){if(isVeh(b.t)&&typeof b.wr!=='number')b.wr=Math.min(40,(b.wm||0)*2);
    if(b.t==='whs'&&b.k){if(b.k.sh!=='two')b.k.sh='one';if(b.k.pre!=='yes')b.k.pre='no';}
    if(b.t==='tk'&&typeof b.auto!=='number')b.auto=1;if(isVeh(b.t)&&b.go!=null&&!W.biz.some(t=>t.t==='tk'&&t.id===b.at))delete b.go;}}

/* ---------------- совет Людмилы z_cars: опту не хватает своих газелей (наёмные переплачивают) ---------------- */
if(E.bizAdvise&&!E.bizAdvise.__opt){const a0=E.bizAdvise;E.bizAdvise=function(W){const o=a0.apply(this,arguments);try{if(W&&W.st==='mid'&&!W.ned){
    for(const b of W.biz){if(b.t!=='whs'||b.st!=='w'||(b.wm||0)<1||b.oc)continue;const c=E.optCars(W,b);if(c.hire<.6)continue;const g=fleetGain(W,b,1).gain;
      if(g>=100e3&&VAN_CAP/g<=30&&W.cash>=VAN_CAP*1.5){o.push({k:'z_cars',pri:46,a:{id:b.id,kd:kdOf(b),g,hire:Math.round(c.hire*10)/10,over:rnd0(c.hire*(VAN_HIRE-VAN_OWN))}});o.sort((x,y)=>y.pri-x.pri);break;}}
    // M44: контракт с сетью ждёт ответа; машины изношены (без ТК с Людмилой ТО само не делается)
    for(const b of W.biz)if(b.t==='whs'&&b.co&&W.t<=b.co.exp){const f=ctFore(W,b);o.push({k:'z_ct',pri:62,a:{id:b.id,kd:kdOf(b),n:b.co.n,g:f?f.gain:0,left:b.co.exp-W.t}});break;}
    const t=tkOf(W),au=t&&t.st==='w'&&t.auto;if(!au){const wv=W.biz.filter(v=>isVeh(v.t)&&v.st==='w'&&(v.wr||0)>=WR_BRK-5).sort((x,y)=>y.wr-x.wr);
      if(wv.length)o.push({k:'z_to',pri:45,a:{id:wv[0].id,n:wv.length,wr:Math.round(wv[0].wr),c:wv.reduce((q,v)=>q+toCost(W,v),0)}});}
    o.sort((x,y)=>y.pri-x.pri);}}catch(e){}return o;};E.bizAdvise.__opt=1;}

Object.assign(E,{OPTK,OPT_KD,OSEA,UP1,MKD,LINKS,LINK_UP2,VAN_OWN,VAN_HIRE,VAN_CAP,TRUCK_STAFF,VAN_MAX,TRUCK_MAX,LINK_CAP,TOT_CAP,LINK_FAR,OPT_KEEP35,
  // M44
  UP3,UP4,MAN,TK_UP,TK_HIRE,TK_HIRE_T,TK_BRK,TK_BRK_T,tkOn,TK_EQ,TK_VAN_R,TK_TR_R,TK_SNOW_R,TK_TV,SNOW_M,TK_MAX,SH2_K,SH2_F,WMS_K,CT_K,CT_MK,CT_DD,CT_BAD,CT_PEN,PRE,PRE_D,WR_M,WR_BRK,WR_AUTO,BRK_P,TO_C,REP_C,LINK_RK,
  optLim,optLoad,linkRk,upList,optCt,ctFore,optPre,optPreUse,baseMan,fleetTk,tkOf,tkCan,tkEcon,tkVal,tkPlan,tkAuto,tkGo,tkFree,vehTake,tkGather,gazelToTk,baseSnow,vehTO,toCost,vehIdle,vehMonth,optNeed,needPts,
  optEcon,optSd,optKd:kdOf,optKnobs:knobs,optOf,optCars,optFore,optUp,optUpInfo,optClose,optMigrate,fleet,fleetN,fleetGain,baseTrucks,isVeh,isOwner,vehCan,vehAdd,vehDel,vehTo,vehUse,
  linkOf,linkDisc,linkSum,linkHint});
})(typeof window!=='undefined'?window:this);
