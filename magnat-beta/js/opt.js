/* ================= M39 «Опт» (этап 1 ТЗ M38-wholesale.md): виды опта, машины внутри хозяина, связи (без DOM) =================
   Грузится сразу после js/biz.js (игра, симуляторы, проверки). Дописывает ECON.
   - Все оптовые — тип `whs` с полем `b.kd` ('food'|'drink'|'home'; этап 2 — pack, parts). Параметры видов — OPTK. Каждого вида — один на сеть.
   - Машина всегда у хозяина: газель `van` (только у опта), самосвал `truck` (у стройбазы). Поле `b.at` — id хозяина или 'mkt' (без хозяина:
     частные заказы, только старые сейвы). Купить/продать — vehAdd / vehDel; строками в «Сети» машины не показываются.
   - Доставка опта: нужно машин optCars (по обороту и сезону), свои — VAN_OWN в месяц каждая (и стоящие), недостающие — наёмные VAN_HIRE.
   - Связи LINKS: опт снабжает свои точки дешевле (скидка закупки), потолок связей LINK_CAP, всё вместе со скидкой сети — TOT_CAP;
     включается через месяц после открытия опта; в другом городе — вполсилы (LINK_FAR).
   - Улучшения b.up (0…2 на этапе 1): 1 — «1С и учёт» (потери −1 % выручки), 2 — особое у вида (OPTK[kd].u2).
   Решения владельца 04.10: скидка склада −3,5 % всей рознице убрана (OPT_KEEP35=0 вернёт её), пороги 40/60/80 млн (OPTK.eq). */
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
const OSEA={drink:[.6,.6,.75,.9,1.2,1.45,1.5,1.4,1.05,.85,.7,.9]};
/* Виды опта. R — оборот в месяц (Кемерово, обычные настройки), mk — наценка для чужих (низкая/средняя/высокая, доля к закупке),
   f — аренда+персонал, loss — потери и пересортица (доля выручки; убирает «1С»), brk — бой тары, sd — запас (дней: дни, покупатели×, порча), dd — покупатели× по отсрочке
   (у хозтоваров норма рынка — 30 дней: без отсрочки ×0,7), cars — газелей в месяц на оборот R, eq — капитал для открытия, need — нужен другой вид, k0 — ручки по умолчанию,
   u2 — особое улучшение (ур. 2). */
const OPTK={
  food:{n:'Продуктовый опт',en:'Food wholesale',ico:'🥫',cap:3.5e6,R:12e6,mk:{lo:.12,mid:.16,hi:.2},rent:200e3,staff:150e3,loss:.01,brk:0,cars:3,eq:0,
    sd:{s7:[7,.88,.003],s15:[15,1,.01],s30:[30,1.02,.025]},k0:{def:'d0',mk:'mid',sd:'s15'},
    u2:{c:1.5e6,f:40e3,d:1.25,sp:.01,n:'Холодильная камера',en:'Cold room',t:L2('мясо и молочка: оборот +25 %, порча +1 %; своим шаурмам мясо ещё −2 %','meat and dairy: turnover +25%, spoilage +1%; your shawarma stands get meat 2% cheaper')}},
  drink:{n:'Напитки и вода',en:'Drinks & water',ico:'🥤',cap:3e6,R:9e6,mk:{lo:.11,mid:.15,hi:.19},rent:180e3,staff:130e3,loss:.01,brk:.003,cars:2,eq:40e6,need:'food',sea:'drink',
    sd:{s7:[7,.92,0],s15:[15,1,.002],s30:[30,1.02,.006]},k0:{def:'d0',mk:'mid',sd:'s15'},
    u2:{c:2e6,f:0,brk:.001,sum:1.15,n:'Площадка под тару и погрузчик',en:'Crate yard & forklift',t:L2('бой тары 0,3 % → 0,1 %, летом (май–август) оборот +15 %','breakage 0.3% → 0.1%, summer (May–Aug) turnover +15%')}},
  home:{n:'Хозтовары и бытовая химия',en:'Household goods & cleaning',ico:'🧴',cap:3.5e6,R:6e6,mk:{lo:.18,mid:.22,hi:.26},rent:120e3,staff:100e3,loss:.01,brk:0,cars:1.5,eq:80e6,
    sd:{s7:[7,.8,0],s15:[15,.92,0],s30:[30,1,0]},dd:{d0:.7,d7:.8,d14:.9,d30:1},k0:{def:'d14',mk:'mid',sd:'s30'},
    u2:{c:4e6,f:0,mg:.012,lk:.02,n:'Своя фасовка («своя марка»)',en:'Own packing (own brand)',t:L2('наценка +3 п.п. на 40 % товара; своим хозмагазинам, мойкам и химчисткам ещё −2 %','mark-up +3 pp on 40% of goods; your hardware shops, car washes and dry cleaners get 2% more off')}}};
const OPT_KD=['food','drink','home'];
const UP1={c:.4e6,n:'1С и учёт',en:'1C accounting',t:L2('потери и пересортица −1 % выручки','losses and mis-sorts −1% of revenue')};
// покупатели × по наценке (низкая / средняя / высокая)
const MKD={lo:1.3,mid:1,hi:.65};
/* Связи: от вида опта → кому (вид точки: скидка закупки). up2 — прибавка с особым улучшением. */
const LINKS={food:{shaw:.035,kiosk:.035,coffee:.035,canteen:.035,bakery:.035,truckf:.035},
  drink:{kiosk:.015,coffee:.015,truckf:.015,club:.015},
  home:{hard:.04,wash:.05,clean:.04}};
const LINK_UP2={food:{shaw:.02},home:{hard:.02,wash:.02,clean:.02}};

/* ---------------- помощники ---------------- */
const kdOf=b=>b&&OPTK[b.kd]?b.kd:'food';
const isVeh=t=>t==='van'||t==='truck';
const isOwner=b=>b&&(b.t==='whs'||b.t==='base');
function fleet(W,id){return W.biz.filter(b=>isVeh(b.t)&&b.at===id);}
// свои машины хозяина в работе (W._fd = {id, d} — «а если на одну больше/меньше», только для прогнозов)
function fleetN(W,b){if(!b||!b.id)return 0;let n=0;for(const x of W.biz)if(x.at===b.id&&x.st==='w'&&isVeh(x.t))n++;if(W._fd&&W._fd.id===b.id)n=Math.max(0,n+W._fd.d);return n;}
function optOf(W,kd){return W.biz.find(b=>b.t==='whs'&&kdOf(b)===kd);}
function knobs(kd,k){const d=OPTK[kd].k0;k=k||{};return {def:k.def||d.def,mk:MKD[k.mk]?k.mk:d.mk,sd:OPTK[kd].sd[k.sd]?k.sd:d.sd};}
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
  let d=dem*seaK(kd,m)*dd*MKD[kk.mk]*sd[1];
  if(up>=2){const u=K.u2;if(u.d)d*=u.d;if(u.sum&&m>=4&&m<=7)d*=u.sum;}
  const rev=K.R*d;let sp=rev*((up>=1?0:K.loss)+sd[2]+(up>=2&&K.u2.brk!=null?K.u2.brk:K.brk)+(up>=2&&K.u2.sp?K.u2.sp:0));
  let vc=rev/(1+mk)+sp;if(up>=2&&K.u2.mg)vc-=rev*K.u2.mg;
  const f=K.rent*C.rent+K.staff+(up>=2?K.u2.f||0:0);
  const need=K.cars*rev/K.R,own=fleetN(W,b),use=Math.min(own,need),hire=Math.max(0,need-own);
  const log=own*VAN_OWN+hire*VAN_HIRE,risk=rev*(o.bad||0);
  return {rev,vc,sp,f,risk,log,prof:rev-vc-f-risk-log,need,own,hire,idle:own-use,mg:0};}
// стройбаза: свои самосвалы (at = база) возят её щебень; что не нужно базе и подрядам — частные заказы (выручка базы); зарплата водителей — в постоянных базы
function baseTrucks(W,b,q,m,noEv){const n=fleetN(W,b),cap=n*E.TRUCK_T,own=Math.min(q,cap);let pc=0;
  if(!noEv&&W._pcTr&&W._pcTr[b.id]!=null)pc=W._pcTr[b.id]*DAYS;else if(W.pc&&W.pc.a&&W.pc.a.length){let pq=0;for(const c of W.pc.a)if(c.dq<c.q)pq+=c.qm;pc=Math.min(cap-own,pq/Math.max(1,W.biz.filter(x=>x.t==='base'&&x.st==='w').length));}
  pc=Math.max(0,Math.min(cap-own,pc));const free=Math.max(0,(cap-own-pc)/E.TRUCK_T);
  const C=E.CITY[b.c]||E.CITY.kuz,T=BIZ.truck,pr=free*T.R*C.dem*E.season('truck',m);
  return {n,own,pc,free,prRev:pr,prVc:pr*T.v,staff:n*TRUCK_STAFF};}
// прогноз хозяина «если машин на d больше/меньше» — в среднем за год (₽/мес); {now, d, gain}
function fleetGain(W,b,d){const f0=E.bizForecast(W,b,b.k).prof;W._fd={id:b.id,d};let f1;try{f1=E.bizForecast(W,b,b.k).prof;}finally{delete W._fd;}return {now:rnd0(f0),then:rnd0(f1),gain:rnd0(f1-f0)};}
// сколько машин нужно хозяину в этом месяце (и в среднем, в пике)
function optCars(W,b,m){m=m==null?W.m%12:m;const x=E.bizEcon(W,b,b.k,m,true);
  if(b.t==='base'){const T=E.TRUCK_T;return {need:x.q/T,own:x.tn||0,hire:Math.max(0,x.q-(x.tn||0)*T)/T,idle:x.fr||0,unit:T};}
  return {need:x.need,own:x.own,hire:x.hire,idle:x.idle};}

/* ---------------- машины: купить, продать, польза ---------------- */
function vehType(o){return o.t==='base'?'truck':'van';}
function vehCan(W,ownerId){const o=W.biz.find(b=>b.id===ownerId);if(!isOwner(o))return 'no';const t=vehType(o),B=BIZ[t];
  if(fleet(W,o.id).length>=(t==='van'?VAN_MAX:TRUCK_MAX))return 'max';if(W.cash<B.cap)return 'cash';return 'ok';}
function vehAdd(W,ownerId){const r=vehCan(W,ownerId);if(r!=='ok')return r;const o=W.biz.find(b=>b.id===ownerId),t=vehType(o);
  const x=E.bizOpen(W,t,{c:o.c,veh:1});if(x!=='ok')return x;const v=W.biz[W.biz.length-1];v.at=o.id;return 'ok';}
// how: 'sell' — продать (по цене продажи), 'mkt' — самосвал без хозяина (частные заказы)
function vehDel(W,id,how){const v=W.biz.find(b=>b.id===id);if(!v||!isVeh(v.t))return 'no';if(how==='mkt'){if(v.t!=='truck')return 'no';v.at='mkt';return 'ok';}
  return E.bizSell(W,id);}
// самосвалы без хозяина (старые сейвы) → в парк стройбазы ownerId (vid — один, иначе все); → сколько передали
function vehTo(W,ownerId,vid){const o=W.biz.find(b=>b.id===ownerId);if(!o||o.t!=='base')return 'no';let n=0;
  for(const v of W.biz)if(v.t==='truck'&&v.at==='mkt'&&(!vid||v.id===vid)&&fleet(W,o.id).length<TRUCK_MAX){v.at=o.id;delete v.mkS;n++;}return n?'ok':'no';}
// польза машины для карточки: где работает и сколько экономит хозяину (₽/мес, в среднем за год)
function vehUse(W,v){if(typeof v==='string')v=W.biz.find(b=>b.id===v);if(!v)return null;const o=W.biz.find(b=>b.id===v.at);
  if(!o||v.at==='mkt'){const x=E.bizEcon(W,v);return {where:'mkt',save:rnd0(x.prof),o:null};}
  if(v.st!=='w')return {where:o.id,save:0,o,wait:v.left};
  const g=fleetGain(W,o,-1);return {where:o.id,save:Math.max(0,-g.gain),o,cost:v.t==='van'?VAN_OWN:TRUCK_STAFF};}

/* ---------------- связи ---------------- */
function linkOn(W,o){return o&&o.t==='whs'&&o.st==='w'&&!(o.down>0)&&(o.wm||0)>=1;}
// скидка закупки точке b от своих оптов: {d (с потолком), src:[{id,kd,d}]}
function linkOf(W,b){const r={d:0,raw:0,src:[]};if(!b||W._noLink||W.ned&&!W.biz.length)return r;
  for(const o of W.biz){if(!linkOn(W,o))continue;const kd=kdOf(o),L=LINKS[kd];if(!L||!L[b.t])continue;if(OPT_KEEP35&&kd==='food'&&BIZ[b.t].seg==='retail')continue;
    let d=L[b.t]+((o.up||0)>=2&&LINK_UP2[kd]&&LINK_UP2[kd][b.t]||0);if(o.c&&b.c&&o.c!==b.c)d*=LINK_FAR;r.raw+=d;r.src.push({id:o.id,kd,d});}
  const ch=E.chainDisc(W,b.t);r.d=Math.max(0,Math.min(r.raw,LINK_CAP,TOT_CAP-ch));return r;}
function linkDisc(W,b){if(W._noLink||W.optT>W.m)return 0;let ok=false;for(const o of W.biz)if(o.t==='whs'&&o.st==='w'){ok=true;break;}return ok?linkOf(W,b).d:0;}
// польза связей: разница прибыли точек со связью и без (₽/мес, этот месяц); [{from, kd, a, to:[{id,t,a}]}] + сумма
function linkSum(W,m){const by={},out=[];let sum=0;
  for(const b of W.biz){if(b.st!=='w'||E.SMALL.indexOf(b.t)<0)continue;const lo=linkOf(W,b);if(!lo.d)continue;
    const x1=E.bizEcon(W,b,b.k,m,true);W._noLink=1;let x0;try{x0=E.bizEcon(W,b,b.k,m,true);}finally{delete W._noLink;}const a=x1.prof-x0.prof;if(!(a>0))continue;sum+=a;
    // делим пользу между оптами пропорционально их скидке
    for(const s of lo.src){const g=by[s.id]||(by[s.id]={from:s.id,kd:s.kd,a:0,to:[]});const p=a*s.d/lo.raw;g.a+=p;g.to.push({id:b.id,t:b.t,a:rnd0(p)});}}
  for(const id in by){by[id].a=rnd0(by[id].a);out.push(by[id]);}out.sort((x,y)=>y.a-x.a);return {sum:rnd0(sum),a:out};}
// чего не хватает: неоткрытые виды и сколько сэкономили бы ваши точки (подсказка «что открыть дальше»)
function linkHint(W){const o=[];for(const kd of OPT_KD){if(optOf(W,kd))continue;const L=LINKS[kd];let a=0,n=0;const by={};
    for(const b of W.biz){if(b.st!=='w'||!L[b.t])continue;const x=E.bizEcon(W,b,b.k,null,true);const ch=E.chainDisc(W,b.t),cur=linkOf(W,b).d;const add=Math.max(0,Math.min(cur+L[b.t],LINK_CAP,TOT_CAP-ch)-cur);
      const base=x.vc/Math.max(.01,1-ch-cur);a+=base*add*(b.mgr&&!W.opd[b.t]?.7:1);n++;by[b.t]=(by[b.t]||0)+1;}
    o.push({kd,a:rnd0(a),n,by,can:E.bizCan(W,'whs',W.home||'kuz',kd)});}
  return o;}

/* ---------------- улучшения опта ---------------- */
function optUpInfo(W,id){const b=W.biz.find(x=>x.id===id);if(!b||b.t!=='whs')return null;const kd=kdOf(b),up=b.up||0;if(up>=2)return {max:1,up};
  const U=up===0?UP1:OPTK[kd].u2,c=U.c;const f0=E.bizForecast(W,b,b.k).prof,b2=Object.assign({},b,{up:up+1}),f1=E.bizForecast(W,b2,b.k).prof;
  return {up,lv:up+1,c,n:U.n,en:U.en,t:U.t,gain:rnd0(f1-f0),pay:f1>f0?c/(f1-f0):0,ok:W.cash>=c&&b.st==='w'};}
function optUp(W,id){const b=W.biz.find(x=>x.id===id);if(!b||b.t!=='whs'||b.st!=='w')return 'no';const u=optUpInfo(W,id);if(!u||u.max)return 'max';if(W.cash<u.c)return 'cash';
  E._.pay(W,u.c,'capex');b.g+=u.c;b.up=(b.up||0)+1;E._.news(W,'biz',{k:'optup',kd:kdOf(b),lv:b.up});return 'ok';}

/* ---------------- что видит игрок при открытии: окупаемость вида ---------------- */
function optFore(W,kd,k){const K=OPTK[kd],kk=Object.assign({},K.k0,k||{});const b={t:'whs',kd,c:W.home||'kuz',rt:3.5,k:kk,mgr:0,wm:3,ev:{},up:0};
  const f=E.bizForecast(W,b,kk),o=E.bizOpt(BIZ.whs,'knob',kk.def),stk=rnd0(f.vc/DAYS*K.sd[kk.sd][0]),rec=rnd0(f.rev/DAYS*(o.dd||0));
  return {kd,cap:K.cap,stk,rec,need:K.cap+stk+rec,prof:rnd0(f.prof),rev:rnd0(f.rev),pay:f.prof>0?(K.cap+stk+rec)/f.prof:0,cars:K.cars*f.rev/K.R,log:rnd0(f.log)};}

/* ---------------- месяц: связи для отчёта и «вау» ---------------- */
function optClose(W){if(W.optT!=null&&W.m+1>=W.optT){delete W.optT;for(const b of W.biz)if(b.oc)delete b.oc;E._.news(W,'biz',{k:'optnew'});}
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
  if(W.lnk&&typeof W.lnk!=='object')delete W.lnk;}

/* ---------------- совет Людмилы z_cars: опту не хватает своих газелей (наёмные переплачивают) ---------------- */
if(E.bizAdvise&&!E.bizAdvise.__opt){const a0=E.bizAdvise;E.bizAdvise=function(W){const o=a0.apply(this,arguments);try{if(W&&W.st==='mid'&&!W.ned){
    for(const b of W.biz){if(b.t!=='whs'||b.st!=='w'||(b.wm||0)<1||b.oc)continue;const c=E.optCars(W,b);if(c.hire<.6)continue;const g=fleetGain(W,b,1).gain;
      if(g>=100e3&&VAN_CAP/g<=30&&W.cash>=VAN_CAP*1.5){o.push({k:'z_cars',pri:46,a:{id:b.id,kd:kdOf(b),g,hire:Math.round(c.hire*10)/10,over:rnd0(c.hire*(VAN_HIRE-VAN_OWN))}});o.sort((x,y)=>y.pri-x.pri);break;}}}}catch(e){}return o;};E.bizAdvise.__opt=1;}

Object.assign(E,{OPTK,OPT_KD,OSEA,UP1,MKD,LINKS,LINK_UP2,VAN_OWN,VAN_HIRE,VAN_CAP,TRUCK_STAFF,VAN_MAX,TRUCK_MAX,LINK_CAP,TOT_CAP,LINK_FAR,OPT_KEEP35,
  optEcon,optSd,optKd:kdOf,optKnobs:knobs,optOf,optCars,optFore,optUp,optUpInfo,optClose,optMigrate,fleet,fleetN,fleetGain,baseTrucks,isVeh,isOwner,vehCan,vehAdd,vehDel,vehTo,vehUse,
  linkOf,linkDisc,linkSum,linkHint});
})(typeof window!=='undefined'?window:this);
