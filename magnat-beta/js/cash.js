/* ================= «Из ларька в магнаты: бизнес» — 📅 Календарь денег (M30), модель без DOM =================
   ECON.cashPlan(W, days) — что придёт и что уйдёт по дням на days дней вперёд (по умолчанию 60) и прогноз остатка.
   Как: «тень» — копия мира и обычный ECON.tick(копия,false) день за днём «если ничего не трогать» (та же модель со всеми обёртками,
   тот же поток случайности W.rs — пока игрок ничего не делает, прогноз совпадает с фактом до рубля). С каждого дня тени снимаем сырые
   потоки денег по статьям ДДС и тегам M25 (W.mon.dt.c; в день закрытия — rep.dt.c и новый месяц), сверяем с изменением денег
   (расхождение — строка «прочее», лента всегда сходится с деньгами тени). Потом источники ECON.cpSrc разбирают потоки в строки ленты.
   Сам W не меняется (копия), модель и учёт не трогаем. Контракт для помощников — CLAUDE.md, раздел «📅 Календарь денег».
   Грузится после всех модельных файлов (econ, biz, owner, mech, story, realty) — в игре, sim.sh, sim-friends.sh, pack.sh. */
(function(root){
'use strict';
const E=root.ECON;if(!E)return;
const rnd0=Math.round,DAYS=30;
const L2=(ru,en)=>({ru,en});

/* ---------------- копия мира (без JSON: Infinity/NaN сохраняются; скрытые поля dt/nm не копируются — модель создаст их сама) ---------------- */
function cl(x){if(x===null||typeof x!=='object')return x;if(Array.isArray(x)){const n=x.length,a=new Array(n);for(let i=0;i<n;i++)a[i]=cl(x[i]);return a;}
  const o={};for(const k in x)if(Object.prototype.hasOwnProperty.call(x,k))o[k]=cl(x[k]);return o;}
function snapC(c){const o={};if(!c)return o;for(const k in c){const r=c[k],s=o[k]={};for(const t in r)if(t!=='_rl')s[t]=r[t];}return o;}
function odSum(W){let s=0;for(const l of W.loans||[])if(l.k==='od')s+=l.a;return s;}
function recSum(W){let s=0;for(const x of W.rec||[])s+=x.a;return s;}
function halts(W){const o=[];for(const x of W.obj||[]){if(x.st==='b'&&x.halt)o.push(x.id);else if(x.up&&x.up.halt)o.push(x.id);}for(const b of W.biz||[])if(b.st==='b'&&b.halt)o.push(b.id);return o;}

/* ---------------- тень: прогон копии мира ---------------- */
// apply(C) — «что если»: действие игрока на копии до прогона (кнопки-решения считают свой итог так же)
function shadow(W,days,apply){const C=cl(W);const tg0=E.tg(''),ts0=E.ts(''),in0=E.cpIn;E.cpIn=true;const flows=[],dd=[],odIds={},cons={};let err=null,a0=null;
  for(const l of C.loans||[])if(l.k==='od')odIds[l.id]=1;
  try{
    if(apply){const c0=C.cash;const r=apply(C);a0={res:r,da:C.cash-c0};}
    for(let i=1;i<=days;i++){const M=C.mon,c0=C.cash,b=snapC(M.dt&&M.dt.c),t1=C.t+1;
      let due=0;for(const x of C.rec||[])if(x.due<=t1)due+=x.a;
      const cd={};for(const c of C.cons||[])cd[c.id]=[c.done,c.p,c.g];
      const out=E.tick(C,false)||[];const cl0=out.find(e=>e&&e.k==='close');const fl=[];
      const add=(c,s)=>{for(const k in c){const r=c[k],q=s&&s[k]||{};for(const t in r){if(t==='_rl')continue;const a=r[t]-(q[t]||0);if(a)fl.push({d:i,t:C.t,cf:k,tag:t,a,cl:cl0?1:0});}}};
      if(cl0){add(cl0.rep.dt&&cl0.rep.dt.c,b);add(C.mon.dt&&C.mon.dt.c,null);}else add(C.mon.dt&&C.mon.dt.c,b);
      let s=0;for(const f of fl)s+=f.a;const res=C.cash-c0-s;if(res)fl.push({d:i,t:C.t,cf:'oth',tag:'?',a:res,cl:cl0?1:0});
      // контракты: сколько из продаж товара — отгрузка по контракту (цена контракта × отгружено за день)
      const con={};for(const c of C.cons||[]){const x=cd[c.id];if(x&&c.done>x[0])con[c.g]=(con[c.g]||0)+rnd0((c.done-x[0])*c.p);}
      for(const l of C.loans||[])if(l.k==='od')odIds[l.id]=1;
      for(const f of fl)flows.push(f);
      dd.push({d:i,t:C.t,m:C.m,dm:C.d,cash:C.cash,od:odSum(C),rec:recSum(C),due,con,cl:cl0?1:0,halt:halts(C),rep:cl0?cl0.rep:null});}
  }catch(e){err=e;}finally{E.tg(tg0);E.ts(ts0);E.cpIn=in0;}
  return {flows,days:dd,odIds,W1:C,err,a0};}

/* ---------------- подписи ---------------- */
function regC(c){const R=E.REGS&&E.REGS[c];return R?L2(R.city,R.ce):L2('','');}
function bizName(W,id){const b=(W.biz||[]).find(x=>x.id===id);const B=b&&E.BIZ&&E.BIZ[b.t];if(!B)return null;const c=regC(b.c);
  const many=(W.cities||[]).length>1;return L2(B.ico+' '+B.n+(many&&c.ru?' · '+c.ru:''),B.ico+' '+B.en+(many&&c.en?' · '+c.en:''));}
function objName(W,id){const o=(W.obj||[]).find(x=>x.id===id);const O=o&&E.OBJ[o.t];if(!O)return null;const c=regC(o.r);return L2(O.n+(c.ru?' · '+c.ru:''),O.en+(c.en?' · '+c.en:''));}
function goodName(g){const G=E.GOODS[g];return G?L2(G.n,G.en):L2(g,g);}
function loanOf(W,P,id){return (W.loans||[]).find(l=>l.id===id)||(P.sh.W1.loans||[]).find(l=>l.id===id)||null;}
function loanName(l){if(!l)return L2('Кредит','Loan');if(l.k==='od')return L2('Овердрафт банка','Bank overdraft');if(l.card)return L2('Кредитная карта','Credit card');
  if(l.k==='mort')return L2('Ипотека','Mortgage');if(l.k==='fr')return L2('Заём у друга','Loan from a friend');if(l.san)return L2('Кредит после санации','Post-rescue loan');return L2('Кредит банка','Bank loan');}

/* ---------------- источники (реестр) ---------------- */
// каждый источник: fn(W, days, P) → items[]; P.take(pred) забирает потоки (каждый — один раз), P.item(f,k,ru,en,src) — строка из потока
const SRC=[];
const isPt=(W,t)=>/^z\d+$/.test(t)&&(W.biz||[]).some(b=>b.id===t);
const ptT=(W,t)=>{const b=(W.biz||[]).find(x=>x.id===t);return b?b.t:'';};
// 1. оплаты покупателей (дебиторка W.rec): ДДС «поступления» без тега в дни, когда у покупателей подошёл срок
SRC.push(function rec(W,days,P){const o=[];const dueBy={};for(const x of P.sh.days)dueBy[x.d]=x.due;
  for(const f of P.take(f=>f.cf==='sales'&&f.tag==='_'&&f.a>0&&dueBy[f.d]>0)){const a=Math.min(f.a,dueBy[f.d]);dueBy[f.d]-=a;
    o.push(P.item(Object.assign({},f,{a}),'rec','Оплата от покупателей (опт)','Payment from wholesale buyers','whs'));
    if(f.a>a)o.push(P.item(Object.assign({},f,{a:f.a-a}),'sale','Поступления','Receipts','_'));}
  return o;});
// 2. работа и заказы
SRC.push(function job(W,days,P){const o=[];
  for(const f of P.take(f=>f.tag==='job'))o.push(P.item(f,'job','Зарплата на складе','Warehouse wages','job'));
  for(const f of P.take(f=>/^gig\./.test(f.tag))){const g=f.tag.slice(4),G=E.GIGS&&E.GIGS[g];const nm=G?L2(G.ico+' '+G.n,G.ico+' '+G.en):L2('Заказ','Gig');
    o.push(P.item(f,'gig',f.a>0?'Заказ: '+nm.ru:'Заказ (расход): '+nm.ru,f.a>0?'Gig: '+nm.en:'Gig (cost): '+nm.en,f.tag));}
  return o;});
// 3. точки (магазины, склад, стройбаза, карьеры): выручка, товар, закупка склада, аренда и зарплаты, стройка, доставка, штрафы
SRC.push(function points(W,days,P){const o=[];
  for(const f of P.take(f=>/^m\.z\d+$/.test(f.tag))){const id=f.tag.slice(2),n=bizName(W,id)||L2('точка','outlet');o.push(P.item(f,'mgr','Управляющему: '+n.ru,'Manager’s share: '+n.en,id));}
  for(const f of P.take(f=>/^opd\./.test(f.tag))){const t=f.tag.slice(4),B=E.BIZ&&E.BIZ[t];o.push(P.item(f,'opd','Операционный директор'+(B?': '+B.n:''),'Operations director'+(B?': '+B.en:''),f.tag));}
  for(const f of P.take(f=>isPt(W,f.tag)||/^z\d+$/.test(f.tag))){const n=bizName(W,f.tag)||L2('точка','outlet'),t=ptT(W,f.tag);let k='oth',ru=n.ru,en=n.en;
    if(f.cf==='sales'){k='sale';ru='Выручка: '+n.ru;en='Takings: '+n.en;}
    else if(f.cf==='supp'){if(t==='whs'){k='whs';ru='Закупка опта: '+n.ru;en='Wholesale buying: '+n.en;}else{k='supp';ru='Товар: '+n.ru;en='Stock: '+n.en;}}
    else if(f.cf==='fix'){k='rent';ru='Аренда и зарплаты: '+n.ru;en='Rent & wages: '+n.en;}
    else if(f.cf==='capex'){k='build';ru='Стройка: '+n.ru;en='Construction: '+n.en;}
    else if(f.cf==='log'){k='log';ru='Доставка: '+n.ru;en='Delivery: '+n.en;}
    else if(f.cf==='asale'){k='oth';ru='Продажа: '+n.ru;en='Sale: '+n.en;}
    else if(f.cf==='prod'){k='prod';ru='Добыча: '+n.ru;en='Extraction: '+n.en;}
    else {k='oth';ru=(f.a<0?'Штраф, ремонт: ':'Прочее: ')+n.ru;en=(f.a<0?'Fine, repair: ':'Other: ')+n.en;}
    o.push(P.item(f,k,ru,en,f.tag));}
  return o;});
// 4. жизнь, взносы, бухгалтер, дела хозяина
SRC.push(function life(W,days,P){const o=[],T={life:['life','Жизнь (еда, жильё, проезд)','Living costs (food, rent, travel)'],ipf:['ipf','Взносы ИП','Sole-trader contributions'],
    acc:['acc','Бухгалтер ООО','Company accountant'],own:['own','Дела хозяина (курсы, маркетинг)','Owner’s affairs (courses, marketing)'],eq:['oth','Имущество для работы','Work equipment']};
  for(const f of P.take(f=>T[f.tag])){const x=T[f.tag];o.push(P.item(f,x[0],x[1],x[2],f.tag));}return o;});
// 5. налог
SRC.push(function tax(W,days,P){return P.take(f=>f.cf==='tax'||f.tag==='tax').map(f=>P.item(f,'tax',W.ned||W.taxm==='osno'?'Налог на прибыль':'Налог','Tax','tax'));});
// 6. кредиты, кредитка, ипотека, займы друзей, овердрафт
SRC.push(function loans(W,days,P){const o=[];
  for(const f of P.take(f=>f.tag==='od'||/^l\d+$/.test(f.tag)&&P.sh.odIds[f.tag])){const n=f.cf==='loan'?(f.a>0?'Банк закроет минус овердрафтом':'Овердрафт'):f.cf==='int'?'Проценты по овердрафту':'Вернуть овердрафт';
    const en=f.cf==='loan'?'Bank covers the minus with an overdraft':f.cf==='int'?'Overdraft interest':'Overdraft repayment';o.push(P.item(f,'od',n,en,f.tag));}
  for(const f of P.take(f=>/^l\d+$/.test(f.tag))){const l=loanOf(W,P,f.tag),n=loanName(l);const k=l&&l.k==='mort'?'re':l&&l.k==='fr'?'fr':f.cf==='int'?'int':'loan';
    o.push(P.item(f,k,(f.cf==='int'?'Проценты: ':f.cf==='repay'?'Платёж (долг): ':'')+n.ru,(f.cf==='int'?'Interest: ':f.cf==='repay'?'Repayment: ':'')+n.en,f.tag));}
  return o;});
// 7. недра: объекты (добыча, передел, постоянные, стройка), офис, вагоны, перевозки, рынок и контракты
SRC.push(function nedra(W,days,P){const o=[];
  for(const f of P.take(f=>/^o\d+$/.test(f.tag))){const n=objName(W,f.tag)||objName(P.sh.W1,f.tag)||L2('объект','site');const K={prod:['prod','Добыча и передел: ','Production: '],fix:['fix','Постоянные: ','Fixed costs: '],capex:['build','Стройка: ','Construction: ']}[f.cf]||['oth','',''];
    o.push(P.item(f,K[0],K[1]+n.ru,K[2]+n.en,f.tag));}
  for(const f of P.take(f=>f.tag==='office'))o.push(P.item(f,'adm','Офис и управление','Head office','office'));
  for(const f of P.take(f=>f.tag==='wag'))o.push(P.item(f,'log','Вагоны: обслуживание','Wagons: upkeep','wag'));
  for(const f of P.take(f=>/^ship\./.test(f.tag))){const n=goodName(f.tag.slice(5));o.push(P.item(f,'log','Перевозка: '+n.ru,'Freight: '+n.en,f.tag));}
  for(const f of P.take(f=>f.tag==='pen'))o.push(P.item(f,'con','Штраф по контракту','Contract penalty','pen'));
  // продажи товара: часть — отгрузка по контрактам (по дням тени), остальное — рынок
  const con={};for(const x of P.sh.days)con[x.d]=x.con;
  for(const f of P.take(f=>/^g\./.test(f.tag))){const g=f.tag.slice(2),n=goodName(g);
    if(f.cf==='sales'){const c=con[f.d]||{},a=Math.min(f.a,c[g]||0);if(a>0){c[g]-=a;o.push(P.item(Object.assign({},f,{a}),'con','Контракт: '+n.ru,'Contract: '+n.en,f.tag));}
      if(f.a>a)o.push(P.item(Object.assign({},f,{a:f.a-a}),'mkt','Продажа: '+n.ru,'Sales: '+n.en,f.tag));}
    else o.push(P.item(f,'prod',(f.cf==='supp'?'Закупка сырья: ':'')+n.ru,(f.cf==='supp'?'Raw materials: ':'')+n.en,f.tag));}
  return o;});
// 8. друзья, совместные дела, недвижимость, действия игрока
SRC.push(function misc(W,days,P){const o=[];
  for(const f of P.take(f=>f.tag==='fr'))o.push(P.item(f,'fr','Друзья и совместные дела','Friends & joint ventures','fr'));
  for(const f of P.take(f=>f.tag==='re'||/^h\d+$/.test(f.tag)))o.push(P.item(f,'re','Недвижимость','Property',f.tag));
  // M32: в тени ручных действий нет — a.factor там только от автофакторинга (W.afa)
  for(const f of P.take(f=>f.tag==='a.factor'))o.push(f.a>0?P.item(f,'rec','Автофакторинг: банк платит за долги покупателей','Auto-factoring: the bank pays what buyers owe','afac'):P.item(f,'rec','Комиссия банка за факторинг, 3 %','Bank factoring fee, 3%','afac'));
  for(const f of P.take(f=>/^a\./.test(f.tag)))o.push(P.item(f,'act','Ваше действие','Your action',f.tag));
  for(const f of P.take(f=>f.tag==='ev'||f.tag==='san'))o.push(P.item(f,'oth',f.tag==='san'?'Санация':'Событие','Event',f.tag));
  return o;});

/* ---------------- прочее (всё, что не забрали источники) ---------------- */
const CFN={sales:L2('Поступления','Receipts'),supp:L2('Закупки','Purchases'),prod:L2('Производство','Production'),fix:L2('Постоянные расходы','Fixed costs'),log:L2('Перевозки','Freight'),
  adm:L2('Управление','Admin'),expl:L2('Разведка','Exploration'),oth:L2('Прочее','Other'),int:L2('Проценты','Interest'),tax:L2('Налог','Tax'),capex:L2('Стройка','Construction'),lic:L2('Лицензии','Licences'),
  wag:L2('Вагоны','Wagons'),asale:L2('Продажа имущества','Asset sales'),loan:L2('Кредиты','Loans'),repay:L2('Погашение кредитов','Loan repayments'),eqin:L2('Взнос в капитал','Equity in'),jvin:L2('Совместные дела','Joint ventures'),
  div:L2('Дивиденды','Dividends'),lend:L2('Займы','Loans given'),drw:L2('Личные покупки','Personal purchases')};
const CFK={capex:'build',int:'int',repay:'loan',loan:'loan',tax:'tax',fix:'fix',log:'log',adm:'adm',prod:'prod',supp:'supp',sales:'sale'};

/* ---------------- план ---------------- */
let CACHE={};
function key(W,days){let b=0;for(const x of W.biz||[])b+=(x.k?JSON.stringify(x.k).length:0)+(x.mgr?7:0)+(x.st==='b'?3:0);let o=0;for(const x of W.obj||[])o+=(x.off?5:0)+(x.ab?3:0)+(x.st==='b'?1:0);
  return [W.t,W.cash,W.nid,days,(W.biz||[]).length,(W.obj||[]).length,(W.loans||[]).length,(W.rec||[]).length,(W.cons||[]).length,(W.routes||[]).length,b,o,W.taxm,W.st].join('|');}
function cashPlan(W,days,o){days=Math.max(1,Math.min(120,days|0||60));o=o||{};
  const ck=CACHE[days];if(!o.apply&&!o.nocache&&ck&&ck.W===W&&ck.k===key(W,days))return ck.p;
  const sh=shadow(W,days,o.apply);const pool=sh.flows.slice(),items=[];
  const P={W0:W,sh,flows:pool,days,
    take(pred){const out=[];for(let i=0;i<pool.length;i++){const f=pool[i];if(f&&pred(f)){out.push(f);pool[i]=null;}}return out;},
    item(f,k,ru,en,src){return {d:f.d,t:f.t,a:f.a,k,ru,en,src:src==null?f.tag:src,cf:f.cf,cl:f.cl?1:0};}};
  P.flows=pool;
  for(const fn of E.cpSrc){try{const r=fn(W,days,P);if(Array.isArray(r))for(const x of r)if(x&&x.a)items.push(x);}catch(e){if(root.console)try{console.warn('cashPlan: источник',fn&&fn.name,e);}catch(_){}}}
  for(const f of pool){if(!f)continue;const n=CFN[f.cf]||L2(f.cf,f.cf);items.push({d:f.d,t:f.t,a:f.a,k:CFK[f.cf]||'oth',ru:n.ru,en:n.en,src:f.tag,cf:f.cf,cl:f.cl?1:0});}
  // свёртка: одна строка на (день, вид, откуда)
  const agg={},list=[];for(const x of items){const kk=x.d+'|'+x.k+'|'+x.src+'|'+(x.a>0?1:0)+'|'+(x.est?1:0);const y=agg[kk];if(y){y.a+=x.a;}else{const z=Object.assign({},x);agg[kk]=z;list.push(z);}}
  const its=list.filter(x=>x.a).sort((a,b)=>a.d-b.d||Math.abs(b.a)-Math.abs(a.a));
  const byDay=[];let prev=W.cash;const est={};for(const x of its)if(x.est)est[x.d]=(est[x.d]||0)+x.a;let ea=0;
  const odL={};for(const x of its)if(x.k==='od'&&x.cf==='loan')odL[x.d]=1;
  for(const x of sh.days){let inn=0,out=0;for(const y of its)if(y.d===x.d){if(y.a>0)inn+=y.a;else out+=y.a;}ea+=est[x.d]||0;
    byDay.push({d:x.d,t:x.t,m:x.m,dm:x.dm,inn,out,cash:x.cash+ea,od:x.od,own:x.cash+ea-x.od,rec:x.rec,cl:x.cl,halt:x.halt});prev=x.cash;}
  const own0=W.cash-odSum(W);let min={d:0,a:own0};for(const x of byDay)if(x.own<min.a)min={d:x.d,a:x.own};
  const c1=byDay.find(x=>x.cl);const eom=c1?{d:c1.d,t:c1.t,a:c1.cash,own:c1.own,od:c1.od,m:sh.days[c1.d-1].m}:null;
  const last=byDay[byDay.length-1];
  const rec=[];{const by={};for(const x of W.rec||[]){const t=x.due;by[t]=(by[t]||0)+x.a;}for(const t in by)if(by[t]>=1)rec.push({t:+t,d:+t-W.t,a:by[t]});rec.sort((a,b)=>a.t-b.t);}
  const halt=[];{const was={};for(const id of halts(W))was[id]=1;const seen={};for(const x of byDay)for(const id of x.halt||[])if(!seen[id]){seen[id]=1;const n=objName(W,id)||bizName(W,id)||L2('стройка','construction');halt.push({d:was[id]?0:x.d,id,ru:n.ru,en:n.en,now:!!was[id]});}}
  const p={cash0:W.cash,own0,t0:W.t,d0:W.d,m0:W.m,days,items:its,byDay,min,eom,end:last?{d:last.d,a:last.cash,own:last.own}:null,rec,halt,gaps:[],err:sh.err?String(sh.err):null};
  p.gaps=gapsOf(W,p,sh,o);
  if(!o.apply&&!o.nocache){if(Object.keys(CACHE).length>3)CACHE={};CACHE[days]={W,k:key(W,days),p};}
  return p;}
function cpReset(){CACHE={};}

/* ---------------- разрывы: когда не хватит, почему, что сделать ---------------- */
const sumK=(its,ks,d1,sg)=>{let s=0;for(const x of its)if(x.d<=d1&&ks.indexOf(x.k)>=0&&(!sg||sg*x.a>0))s+=x.a;return s;};
// кнопки-решения считаются «что если» (до ~9 прогонов тени) — лениво и не чаще раза в 3 игровых дня, пока не поменялось устройство дела
const FXC={};let FXN=0;
function fxKey(W,g){let k='';for(const b of W.biz||[])k+=b.t[0]+(b.k&&b.k.def||'');return [W.m,Math.floor(W.d/3),g.k,g.why,g.d>0?1:0,(W.loans||[]).length,(W.obj||[]).length,(W.biz||[]).length,k,W.st].join('|');}
function lazyFix(W,p,g){let v=null;Object.defineProperty(g,'fix',{enumerable:true,configurable:true,get(){if(!v){const k=fxKey(W,g);const c=FXC[k];if(c&&c.W===W)v=c.v;else{v=fixesOf(W,p,g);if(++FXN>40){for(const x in FXC)delete FXC[x];FXN=0;}FXC[k]={W,v};}}return v;}});return g;}
// M39: опт по видам — сумма по всем оптам (закупка опта), id — опт с самой большой нехваткой товара
function whsGap(W){const a=(W.biz||[]).filter(x=>x.t==='whs'&&x.st==='w');if(!a.length||!E.bizEcon)return null;let r=null,tgt=0,stk=0,need=0,mx=-1;
  for(const b of a){const sd=E.optSd?E.optSd(b):E.BIZ.whs.sd,x=E.bizEcon(W,b),t=rnd0(x.vc/DAYS*sd),s=rnd0(b.stk||0),n=Math.max(0,t-s);tgt+=t;stk+=s;need+=n;if(n>mx){mx=n;r=b;}}
  return {id:r.id,tgt,stk,need,def:r.k&&r.k.def,n:a.length};}
function gapsOf(W,p,sh,o){const g=[];if(o.nogap)return g;const its=p.items;
  const neg=p.own0<0?{d:0,t:W.t,own:p.own0,rec:recSum(W)}:p.byDay.find(x=>x.own<0);
  const wg=whsGap(W);
  const zero=wg?p.byDay.filter(x=>x.cash<=5000&&!x.cl).length:0;
  // эпизоды: сейчас в минусе и каждое закрытие месяца, где свои деньги < 0
  const eps=[];if(p.own0<0)eps.push({d:0,t:W.t,own:p.own0,rec:recSum(W)});for(const x of p.byDay)if(x.cl&&x.own<0&&!eps.some(e=>e.d===x.d))eps.push(x);
  if(!eps.length&&neg)eps.push(neg);
  const buyM=-['capex','lic','drw','wag','lend'].reduce((a,k)=>a+Math.min(0,(W.mon.cf&&W.mon.cf[k])||0),0),d1=p.eom?p.eom.d:DAYS;
  for(const ep of eps){if(g.filter(x=>x.k==='od').length>=2)break;const D=ep.d,win=p.byDay.filter(x=>x.d>=D&&x.d<=Math.min(p.days,D+30));let pk={d:D,a:-ep.own};for(const x of p.byDay)if(x.d>=D&&-x.own>pk.a)pk={d:x.d,a:-x.own};const short=-ep.own;
    // причины: деньги у покупателей и в товаре (склад), своя покупка в этом месяце, стройка, банк, налог, аренда и зарплаты
    const DD=Math.max(D,1),D0=g.length?g[g.length-1].d+1:1,f=(ks)=>{let s2=0;for(const x of its)if(x.d>=D0&&x.d<=DD&&ks.indexOf(x.k)>=0&&x.a<0)s2-=x.a;return s2;};
    const recD=ep.rec||0,whsBuy=f(['whs']),build=f(['build']),bank=f(['loan','int','re']),tax=f(['tax']),rent=f(['rent','mgr','opd','life','acc','ipf','fix','adm']),buy=D<=d1&&!g.length?buyM:0;
    const hasW=(W.biz||[]).some(b=>b.t==='whs');const C=[['whs',hasW?Math.max(recD,whsBuy*.5,wg?wg.need:0):0],['buy',buy],['build',build],['loan',bank],['tax',tax],['rent',rent*.6]];C.sort((a,b)=>b[1]-a[1]);
    const why=C[0][1]>0?C[0][0]:'rent';if(g.length&&g[g.length-1].why===why)continue;
    g.push(lazyFix(W,p,{k:'od',d:D,t:ep.t,a:rnd0(short),peak:{d:pk.d,a:rnd0(pk.a)},eomShort:p.eom?Math.max(0,rnd0(-p.eom.own)):0,why,now:D===0,odNow:odSum(W),amt:{rec:recD,whs:whsBuy,stk:wg?wg.need:0,buy,build,loan:bank,tax,rent}}));}
  for(const h of p.halt){if(g.some(x=>x.k==='halt'))break;const D=h.d||0;const need=haltNeed(W,p,h);g.push(lazyFix(W,p,{k:'halt',d:D,t:W.t+D,a:need,why:'build',id:h.id,ru:h.ru,en:h.en,now:h.now}));}
  if(!g.length&&zero>=3)g.push(lazyFix(W,p,{k:'zero',d:(p.byDay.find(x=>x.cash<=5000)||{}).d||0,a:wg?wg.need:0,why:'whs',n:zero,amt:{stk:wg?wg.need:0,rec:recSum(W)}}));
  g.sort((a,b)=>a.d-b.d);return g;}
// сколько не хватает стройке: по правилу модели она идёт, пока денег больше «обязательств месяца» (ECON.duty / bizDuty) + дневной платёж
function haltNeed(W,p,h){const o=(W.obj||[]).find(x=>x.id===h.id),b=(W.biz||[]).find(x=>x.id===h.id);let need=0,duty=0;
  if(o){const j=o.st==='b'?o:o.up;if(j)need=Math.max(0,rnd0((j.cost-j.paid)/Math.max(1,j.left)));duty=E.duty?E.duty(W):0;}
  else if(b){need=Math.max(0,rnd0((b.cost-b.paid)/Math.max(1,b.left)));duty=E.bizDuty?E.bizDuty(W):0;}
  const rest=o?((o.st==='b'?o:o.up||{}).cost||0)-((o.st==='b'?o:o.up||{}).paid||0):b?(b.cost-b.paid):0;
  const x=p.byDay[Math.max(0,(h.d||1)-1)]||{cash:W.cash};return Math.max(0,rnd0(Math.min(rest,need*30)+duty-x.cash));}
// «что если»: прогон тени после действия act(копия,…args) — те же правила, что у игры
function whatIf(W,act,args,days){try{const q=cashPlan(W,days,{apply:C=>E[act]?E[act].apply(null,[C].concat(args||[])):'no',nogap:1});const m=q.byDay.reduce((m,x)=>Math.min(m,x.own),Infinity);
    const hl=q.halt.filter(h=>!h.now||q.byDay.every(x=>(x.halt||[]).indexOf(h.id)>=0)).length;return {min:rnd0(m),eom:q.eom?rnd0(q.eom.own):null,end:q.end?rnd0(q.end.own):null,halt:hl,res:q.err?'err':'ok',p:q};}catch(e){return null;}}
const nice=(a,u)=>{const e=Math.pow(10,Math.max(0,Math.floor(Math.log10(Math.max(a,1)))-1));return Math.ceil(a/Math.max(u,e))*Math.max(u,e);};
// кнопки-решения: каждая — существующее действие; цифры «после» — тот же прогон тени «что если»
function fixesOf(W,p0,gp){const F=[];const unit=W.ned?1e6:1e4,H=60,p=p0.days>=H?p0:cashPlan(W,H);   // «что если» — всегда на 60 дней (склад выходит в плюс не сразу)
  const ok=r=>r&&r.min>=0&&(gp.k!=='halt'||r.halt===0);
  const after=(act,args)=>whatIf(W,act,args,H);
  // 1. кредит: самая маленькая сумма, после которой прогноз не уходит в минус (и стройка не встаёт); проектный — с отсрочкой тела, если причина — стройка
  if(E.loanOffer&&E.takeLoan&&gp.k!=='zero'){const of=E.loanOffer(W),mx=Math.floor((of.max||0)/unit)*unit;const proj=gp.why==='build';const n=proj?36:W.ned?24:12,gr=proj?6:0;
    if(mx>=unit){const tryA=a=>after('takeLoan',[a,n,'ann',gr]);let lo=Math.max(unit,Math.ceil(Math.max(gp.peak?gp.peak.a:gp.a,unit)/unit)*unit),a=Math.min(mx,lo),r=tryA(a);
      if(!ok(r)&&a<mx){let hi=mx,rh=tryA(hi);if(ok(rh)){let l=a;for(let i=0;i<6&&hi-l>unit;i++){const m=Math.ceil((l+hi)/2/unit)*unit;const rm=tryA(m);if(ok(rm)){hi=m;rh=rm;}else l=m;}}a=hi;r=rh;}
      a=Math.min(mx,nice(a,unit));if(a!==r.a)r=tryA(a)||r;
      F.push({k:'loan',a,rate:of.rate,n,gr,act:'takeLoan',args:[a,n,'ann',gr],ok:ok(r),max:mx,after:r&&{min:r.min,eom:r.eom,end:r.end,halt:r.halt},
        ru:(proj?'🏦 Проектный кредит на {m}':'🏦 Взять кредит на {m}'),en:(proj?'🏦 Project loan of {m}':'🏦 Take a loan of {m}')});}}
  // 2. факторинг дебиторки: деньги покупателей — сразу, за 3 %
  const rs=recSum(W);if(rs>0&&E.factor&&gp.k!=='halt'){const fee=rnd0(rs*.03),r=after('factor',[]);F.push({k:'factor',a:rs-fee,fee,rec:rs,act:'factor',args:[],ok:ok(r),after:r&&{min:r.min,eom:r.eom,end:r.end,halt:r.halt},ru:'🧾 Получить сейчас {m} от покупателей',en:'🧾 Get {m} from buyers now'});}
  // 3. склад: отсрочка покупателям «без» — новые продажи платят сразу (меньше денег зависает у покупателей)
  const wh=(W.biz||[]).find(b=>b.t==='whs'&&b.st==='w'&&b.k&&b.k.def&&b.k.def!=='d0');
  if(wh&&E.bizKnob&&(gp.why==='whs'||gp.k==='zero')){const r=after('bizKnob',[wh.id,'def','d0']);F.push({k:'whs',id:wh.id,act:'bizKnob',args:[wh.id,'def','d0'],ok:ok(r),after:r&&{min:r.min,eom:r.eom,end:r.end,halt:r.halt},a:0,ru:'🏬 Склад: отсрочка покупателям — «без»',en:'🏬 Warehouse: no credit for buyers'});}
  // показываем только то, что помогает: прогноз не уходит в минус, или «дно» / остаток в конце заметно лучше, или стройка не встаёт
  const bm=p.min.a,be=p.end?p.end.own:bm,gain=f=>!f.after?0:Math.max(f.after.min-bm,(f.after.end==null?-Infinity:f.after.end-be));
  const good=F.filter(f=>f.after&&(f.ok||f.after.min>bm+Math.abs(bm)*.05+1||f.after.end>be+Math.abs(be)*.05+1||f.after.halt<p.halt.filter(h=>h.d>=0).length));
  good.sort((a,b)=>(b.ok?1:0)-(a.ok?1:0)||gain(b)-gain(a));return good.slice(0,3);}

/* ---------------- советы Людмилы: z_cash (причина разрыва), z_factor (починен: раньше ждал cash<0, которого не бывает) ---------------- */
function advWrap(name){const f=E[name];if(typeof f!=='function'||f.__cp)return;const g=function(W){const o=f.apply(this,arguments);try{if(Array.isArray(o)&&W&&E.cpAdvOn&&!E.cpIn)cpAdv(W,o);}catch(e){}return o;};g.__cp=1;E[name]=g;}
function cpAdv(W,o){const p=cashPlan(W,35);const g=p.gaps[0];if(!g||g.d>40)return;
  // без двойных советов: про овердрафт «сейчас» говорит z_od, про склад — z_whs / z_factor (fx3) — z_cash тогда не добавляем
  const has=k=>o.some(x=>x.k===k),dup=g.d===0&&has('z_od')||g.why==='whs'&&(has('z_whs')||has('z_factor'));
  if(!dup&&!has('z_cash'))o.push({k:'z_cash',pri:g.k==='od'&&g.d<=15?88:g.k==='halt'?84:72,a:{d:g.d,a:g.a,why:g.why,k:g.k,id:g.id}});
  if(recSum(W)>0&&g.k!=='halt'&&!W.afa&&!o.some(x=>x.k==='z_factor'))o.push({k:'z_factor',pri:74,a:{rec:recSum(W),fee:rnd0(recSum(W)*.03),d:g.d,af:1}});
  o.sort((a,b)=>b.pri-a.pri);}
advWrap('bizAdvise');advWrap('advise');

E.cpSrc=SRC;
Object.assign(E,{cashPlan,cpReset,cpWhatIf:whatIf,cpShadow:shadow,cpClone:cl,cpWhs:whsGap,cpAdvOn:false});
})(typeof window!=='undefined'?window:this);
