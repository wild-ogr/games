/* ================= «Из ларька в магнаты: бизнес» — своя механика ключевых дел (M21, M15 C3, без DOM) =================
   Грузится после owner.js (и в симуляторе). Ответ на «экономики другие»: у четырёх дел — свой показатель на карточке и одно понятное решение раз в 2–4 недели.
   • 🥙 шаурма — «Чистота кухни» (падает каждый день; чисто — гостей +5 %, проверки вдвое реже; грязно — гости уходят, проверки вдвое чаще).
     Решение: «Санитарный день» (3 000 ₽) сейчас или «по графику — раз в 2 недели». Без вас персонал моет, когда уже грязно (с управляющим — ещё позже).
   • 🥤 кофе — «Постоянные гости» (копятся месяцами: опытные бариста, хозяин за стойкой, карта лояльности; управляющий их теряет) и вечерняя смена:
     летом вечер приносит деньги, зимой — убыток. Решение — включать вечер весной и выключать осенью (управляющий часы сам не меняет).
   • 📦 ПВЗ — «Склад посылок»: поток по месяцам (распродажи в ноябре–декабре ×1,35), склад переполнен — часть посылок уходит в другие пункты, штрафы маркетплейса чаще.
     Решение: «Помощник на распродажи» (600 ₽ в день до 31 декабря) — заранее, в конце октября. Без вас его берут, когда склад уже переполнен.
   • 🛠 автосервис — «Очередь машин» (в днях): пусто — посты простаивают, длинная — клиенты уезжают к конкурентам. Весной и осенью машин больше.
     Решения: «Акция на ТО» (15 000 ₽, когда очередь пустая) и «Работа в выходные» (10 000 ₽ за неделю, когда очередь длинная). Без вас — только выходные и поздно.
   Ларёк (ассортимент и наценка), цветы (ставка на праздник), шиномонтаж (шины к сезону) — своя механика уже есть в biz.js; автомат — пассивное дело.
   Случайность — своя, от id точки и дня (поток RNG мира не сдвигается: миры без этих дел идут как раньше). Прогноз Людмилы (noEv) — «как без вас», ≈ как до механики.
   Состояние: у точки b.mx = {v: показатель, …, mr: эффект за месяц ₽, lr: эффект прошлого месяца, n: решений}. Учёт: уборка, помощник, выходные — fix; акция — adm. */
(function(root){
'use strict';
const E=root.ECON;if(!E||!E.ptMod||!E.BIZ)return;
const _=E._,{rnd0,clamp}=_;
const cost=(W,a,k,c,s)=>E.bizCost(W,a,k,c,s);
// трата механики: в учёт (статья) и в прибыль точки за месяц (b.m.e — график «Прибыль по месяцам», цена продажи)
function pcost(W,b,a,k){const x=cost(W,a,k,k,E.BIZ[b.t].seg);if(b.m)b.m.e-=x;return x;}
const opt=(B,kk,id)=>E.bizOpt(B,kk,id);

// своя «случайность» 0…1 от точки и дня (детерминированно)
function nz(b,t,s){const id=String(b.id)+'|'+t+'|'+(s||0);let h=2166136261;for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619);}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return ((h>>>0)%100000)/100000;}
// кто сейчас решает: own — вы сами (или стоите за прилавком делом хозяина), mgr — управляющий, opd — опердиректор (профессионал: реагирует как хозяин)
function who(W,b){if(W.opd&&W.opd[b.t])return 'opd';if(b.mgr)return b.st2>W.t?'own':'mgr';return 'own';}

/* ---------------- справочник ---------------- */
// SHAW: чистота 0…100, минус в день (строгая санитария — вдвое медленнее), авто-уборка ниже порога (кто решает), график — раз в PLAN дней
const SH={dec:2.1,decS:1.05,c:2000,plan:14,th:{own:40,opd:40,mgr:35},skip:.3,hi:70,lo:50,dHi:.04,dLo:.1};
// COFFEE: постоянные гости 0…100 → спрос ×(0,92 + 0,16 × v/100) (50 — как раньше); цель — от бариста, хозяина, карты; вечерняя смена: +спрос по месяцам, +EVF ₽/мес
const CF={base:40,pro:15,own:3,mgr:0,card:10,eve:5,up:1.5,dn:1,start:30,EVE:[.03,.03,.04,.08,.16,.16,.16,.16,.16,.08,.03,.03],EVF:25000,bc:.3};
// PVZ: поток по месяцам (распродажи), вместимость склада, помощник ×1,3 на 30 дней
const PV={PS:[.85,.95,1,1,1,.95,.95,1,1,1,1.35,1.35],cap:1.25,c:30000,cd:600,dur:30,k:1.3,th:{own:2,opd:2,mgr:4},late:.3,rt:.1,fd:15000};   // th — сколько дней склад переполнен, пока без вас позовут помощника
// STO: очередь в днях работы; машин в день — сезон × K × шум; уезжают, если очередь > 3 дней; выходные ×1,3 на 7 дней; акция +0,3 на 7 дней
const ST={SS:[.9,.9,1,1.15,1.1,1,.95,.95,1,1.15,1.1,.9],K:1.03,bal:3,ot:1.3,otC:6000,prC:8000,prK:.3,dur:7,th:{own:4.5,opd:4.5,mgr:5},max:10};
const MX={shaw:'clean',coffee:'loyal',pvz:'load',sto:'queue'};
const MXL=Object.keys(MX);
const SSN=ST.SS.reduce((a,x)=>a+x,0)/12;

function mxNew(W,b){const t=b.t;if(t==='shaw')return {v:100,pl:0,lc:W.t,n:0,mr:0,lr:0};if(t==='coffee')return {v:CF.start,eve:0,n:0,mr:0,lr:0};
  if(t==='pvz')return {v:.9,hu:0,pk:0,lost:0,n:0,mr:0,lr:0};if(t==='sto')return {v:2,ot:0,pr:0,s:1,idle:0,gone:0,n:0,mr:0,lr:0};return null;}
function mx(W,b){if(!MX[b.t])return null;if(!b.mx||typeof b.mx!=='object')b.mx=mxNew(W,b);return b.mx;}

/* ---------------- шаурма ---------------- */
function shK(v){return v>=SH.hi?1+SH.dHi:v>=SH.lo?1:1-SH.dLo+SH.dLo*v/SH.lo;}
function shRk(v){return v>=SH.hi?.5:v>=SH.lo?1:2;}
function shClean(W,b,auto,out){const X=b.mx;pcost(W,b,SH.c,'fix');X.v=100;X.lc=W.t;if(!auto)X.n++;
  if(auto&&out)out.push({k:'own',w:'mx',a:b.id,x:'clean',auto:1});}
function shDay(W,b,out){const X=b.mx;X.v=Math.max(0,X.v-(b.k&&b.k.san==='strict'?SH.decS:SH.dec));const w=who(W,b);
  let need=X.v<SH.th[w];if(!need&&X.pl&&W.t-X.lc>=SH.plan)need=w!=='mgr'||nz(b,W.t,1)>=SH.skip;   // управляющий иногда «забывает» график
  if(need&&W.cash>=SH.c)shClean(W,b,true,null);}
/* ---------------- кофе ---------------- */
function cfTarget(W,b){const X=b.mx||{};let T=CF.base;if(b.k&&b.k.bar==='pro')T+=CF.pro;const w=who(W,b);if(w==='own')T+=CF.own;else if(w==='mgr')T+=CF.mgr;
  if((b.lv||1)>=3)T+=CF.card;if(X.eve)T+=CF.eve;return clamp(T,0,100);}
function cfK(v){return .92+.16*v/100;}
function cfEve(b,m){return CF.EVE[m]*(b.k&&b.k.place==='bc'?CF.bc:1);}
function cfDay(W,b){const X=b.mx;if(b.down>0){X.v=Math.max(0,X.v-2);return;}const T=cfTarget(W,b);X.v=X.v<T?Math.min(T,X.v+CF.up):Math.max(T,X.v-CF.dn);}
/* ---------------- ПВЗ ---------------- */
function pvCap(W,b,hu){const l=b.lv||1;let c=PV.cap;if(l>=3)c+=.12;if(l>=4)c+=.06;if(l>=5)c+=.2;if(b.k&&b.k.cam==='yes')c+=.08;if(hu)c*=PV.k;return c;}
// поток посылок этой точки: сезон × маркетплейс × улучшения × насыщение (свои ПВЗ рядом делят поток); склад в большом городе — под его поток
function pvFlow(W,b,m,n){const o=opt(E.BIZ.pvz,'knob',b.k&&b.k.mkt);const L=(b.lv||1)>1?E.lvEff(b):{d:0};const sat=E.satOf?E.satOf(W,'pvz',b.c,b).m:1;
  return PV.PS[m]*(o.d||1)*(1+L.d)*sat*(n==null?1:.96+.08*n);}
function pvS(ld){return ld<=1?1:1/ld+PV.late*(1-1/ld);}   // доля посылок, которые выданы у нас (остальные — в другие пункты)
// помощник: с конца октября — «на распродажи», до 31 декабря; в другие месяцы — на 30 дней; 600 ₽ в день
function pvSea(W){const m=W.m%12;return m>=10||m===9&&W.d>=24;}   // «на распродажи»: с конца октября до 31 декабря
function pvEnd(W){const m=W.m%12;return pvSea(W)?W.t+(30-W.d)+(11-m)*30:W.t+PV.dur;}
function pvPrice(W){return PV.cd*(pvEnd(W)-W.t);}
function pvHire(W,b,auto,out){const X=b.mx;pcost(W,b,pvPrice(W),'fix');X.hu=pvEnd(W);if(!auto)X.n++;if(auto&&out)out.push({k:'own',w:'mx',a:b.id,x:'help',auto:1});}
function pvDay(W,b,out){const X=b.mx,m=W.m%12;let hu=X.hu>W.t;let ld=pvFlow(W,b,m,nz(b,W.t,2))/pvCap(W,b,hu);
  if(ld>1)X.od=(X.od||0)+1;if(!hu&&ld>1&&X.od>=PV.th[who(W,b)]&&W.cash>=pvPrice(W)){pvHire(W,b,true,null);hu=true;ld=pvFlow(W,b,m,nz(b,W.t,2))/pvCap(W,b,true);}
  X.v=Math.round(ld*1000)/1000;X.pk=Math.max(X.pk||0,X.v);if(ld>1){X.lost=(X.lost||0)+(1-pvS(ld))/30;const f=rnd0(PV.fd*(ld-1)/100)*100;if(f>0){pcost(W,b,f,'oth');X.fm=(X.fm||0)+f;}   // штраф маркетплейса за просрочку выдачи
    b.rt=Math.max(1,Math.round(((b.rt||3.5)-PV.rt*(ld-1))*1000)/1000);}}   // склад не справляется — маркетплейс снижает рейтинг пункта (⭐ — спрос на месяцы вперёд)
/* ---------------- автосервис ---------------- */
function stCap(W,b){const X=b.mx;return (X.ot>W.t?ST.ot:1)*((b.lv||1)>=5?1.03:1);}
function stDay(W,b,out){const X=b.mx,m=W.m%12;let r=ST.SS[m]/SSN*ST.K*(.7+.6*nz(b,W.t,3));if(X.pr>W.t)r+=ST.prK;
  if(X.v>ST.bal){const k=Math.max(.4,1-.1*(X.v-ST.bal));X.gone=(X.gone||0)+r*(1-k);r*=k;}
  const w=who(W,b);if(!(X.ot>W.t)&&X.v>ST.th[w]&&W.cash>=ST.otC){stOt(W,b,true,null);}
  const c=stCap(W,b),s=Math.min(c,X.v+r);if(s<1)X.idle=(X.idle||0)+(1-s);X.v=Math.min(ST.max,Math.max(0,X.v+r-s));X.s=s;}
function stOt(W,b,auto,out){const X=b.mx;pcost(W,b,ST.otC,'fix');X.ot=W.t+ST.dur;if(!auto)X.n++;if(auto&&out)out.push({k:'own',w:'mx',a:b.id,x:'ot',auto:1});}
function stPromo(W,b){const X=b.mx;pcost(W,b,ST.prC,'adm');X.pr=W.t+ST.dur;X.n++;}

/* ---------------- решения игрока ---------------- */
// a: clean | plan (вкл/выкл) | eve (вкл/выкл) | help | promo | ot → 'ok' | 'no' | 'cash' | 'on' (уже идёт) | 'cd' (только что) | 'ned'
function mxOk(W,id,a){const b=W.biz.find(x=>x.id===id);if(!b||b.st!=='w'||!MX[b.t]||W.ned)return 'no';const X=mx(W,b);
  if(b.t==='shaw'){if(a==='plan')return 'ok';if(a!=='clean')return 'no';if(X.v>=97)return 'cd';return W.cash<SH.c?'cash':'ok';}
  if(b.t==='coffee')return a==='eve'?'ok':'no';
  if(b.t==='pvz'){if(a!=='help')return 'no';if(X.hu>W.t)return 'on';return W.cash<pvPrice(W)?'cash':'ok';}
  if(b.t==='sto'){if(a==='ot'){if(X.ot>W.t)return 'on';return W.cash<ST.otC?'cash':'ok';}if(a==='promo'){if(X.pr>W.t)return 'on';return W.cash<ST.prC?'cash':'ok';}}
  return 'no';}
function mxAct(W,id,a,v){const r=mxOk(W,id,a);if(r!=='ok')return r;const b=W.biz.find(x=>x.id===id),X=b.mx;
  if(a==='clean')shClean(W,b,false);else if(a==='plan'){X.pl=v==null?(X.pl?0:1):(v?1:0);X.n++;}
  else if(a==='eve'){X.eve=v==null?(X.eve?0:1):(v?1:0);X.n++;}
  else if(a==='help')pvHire(W,b,false);else if(a==='ot')stOt(W,b,false);else if(a==='promo')stPromo(W,b);
  return 'ok';}

/* ---------------- что сейчас разумно (совет Людмилы и «живой игрок» в симуляторе) ---------------- */
// → {a, why} или null. Кофе: включить вечер, если в этом и следующем месяце он даёт больше, чем стоит; выключить — если меньше
function eveGain(W,b,m){const x=E.bizEcon(W,Object.assign({},b,{mx:Object.assign({},b.mx,{eve:0})}),b.k,m,true),cm=x.rev>0?(x.rev-x.vc)/x.rev:.5;
  return x.rev*cfEve(b,m)*cm-CF.EVF;}
function mxHint(W,b){if(!MX[b.t]||b.st!=='w'||W.ned)return null;const X=mx(W,b),m=W.m%12;
  if(b.t==='shaw'){if(!X.pl)return {a:'plan',why:'plan'};if(X.v<SH.hi)return {a:'clean',why:'dirty'};return null;}
  if(b.t==='coffee'){const g0=eveGain(W,b,m),g1=eveGain(W,b,(m+1)%12);if(!X.eve&&g0>2000&&g1>0)return {a:'eve',v:1,why:'on',g:rnd0(g0)};if(X.eve&&g0<-2000)return {a:'eve',v:0,why:'off',g:rnd0(-g0)};return null;}
  if(b.t==='pvz'){if(X.hu>W.t)return null;const l0=pvFlow(W,b,m)/pvCap(W,b,false),nov=pvFlow(W,b,10)/pvCap(W,b,false);
    if(l0>1.05||X.v>1.05&&W.d>0&&l0>1)return {a:'help',why:'now',ld:Math.max(l0,X.v)};if(m===9&&W.d>=24&&nov>1.05)return {a:'help',why:'soon',ld:nov};return null;}
  if(b.t==='sto'){if(X.v>3.2&&!(X.ot>W.t))return {a:'ot',why:'long'};if(X.v<.8&&!(X.pr>W.t)&&!(X.ot>W.t))return {a:'promo',why:'empty'};return null;}
  return null;}

/* ---------------- хуки (оборачивают owner.js; biz.js зовёт их через ECON) ---------------- */
const pm0=E.ptMod;
E.ptMod=function(W,b,m,noEv){const o=pm0(W,b,m,noEv);if(!MX[b.t]||W.ned)return o;const X=mx(W,b);if(!X)return o;
  if(b.t==='shaw'){if(!noEv)o.d*=shK(X.v);}
  else if(b.t==='coffee'){o.d*=cfK(noEv?Math.max(50,cfTarget(W,b)):X.v);   // прогноз: не ниже «обычной кофейни» (гости копятся после открытия)
    if(X.eve){o.d*=1+cfEve(b,m);o.f+=CF.EVF;}}
  else if(b.t==='pvz'){o.d*=PV.PS[m];let s;if(noEv){const f=pvFlow(W,b,m),l0=f/pvCap(W,b,false);s=pvS(l0);   // прогноз: в переполненный месяц — помощник и штрафы, как «без вас»
      if(l0>1){const l1=f/pvCap(W,b,true);s=pvS(l1);o.f+=PV.cd*30+(l1>1?PV.fd*(l1-1)*30:0)+PV.fd*(l0-1)*PV.th.own;}}else s=pvS(X.v||0);o.d*=s;}
  else if(b.t==='sto'){if(!noEv)o.d*=X.s==null?1:X.s;}
  return o;};
const rk0=E.ptRk;
E.ptRk=function(W,b,k){let x=rk0(W,b,k);if(b.t==='shaw'&&k==='insp'&&b.mx&&!W.ned)x*=shRk(b.mx.v);return x;};
// штраф маркетплейса (biz.js bizEvent 'fine' — своя вероятность): склад переполнялся — чаще
E.mxRk=function(W,b,k){if(b.t==='pvz'&&k==='fine'&&b.mx&&!W.ned){return 1+(b.mx.od||0)/8;}return 1;};   // каждые 8 дней переполненного склада — проверка маркетплейса вдвое вероятнее
// эффект механики за день в рублях прибыли (для строки «за прошлый месяц» в карточке)
function dayK(W,b){const X=b.mx;if(!X)return 1;if(b.t==='shaw')return shK(X.v);if(b.t==='coffee')return cfK(X.v)/cfK(50);if(b.t==='pvz')return pvS(X.v);if(b.t==='sto')return X.s==null?1:X.s;return 1;}
const pd0=E.ownPtDay;
E.ownPtDay=function(W,b,rev,vc,x){if(pd0)pd0(W,b,rev,vc,x);if(!MX[b.t]||!b.mx||W.ned||rev<=0)return;const k=dayK(W,b);if(!(k>0))return;const cm=1-vc/rev;
  b.mx.mr=(b.mx.mr||0)+(rev-rev/k)*cm;};
const od0=E.ownDay;
E.ownDay=function(W,off,out){od0(W,off,out);if(W.ned)return;for(const b of W.biz){if(!MX[b.t]||b.st!=='w')continue;mx(W,b);if(b.down>0&&b.t!=='coffee')continue;
  try{if(b.t==='shaw')shDay(W,b,out);else if(b.t==='coffee')cfDay(W,b);else if(b.t==='pvz')pvDay(W,b,out);else if(b.t==='sto')stDay(W,b,out);}catch(e){}}};
const oc0=E.ownClose;
E.ownClose=function(W,M,off){oc0(W,M,off);if(W.ned)return;for(const b of W.biz){if(!b.mx||!MX[b.t])continue;const X=b.mx;
  X.lr=rnd0(X.mr||0);X.mr=0;if(b.t==='shaw'&&X.v!=null)X.lm=Math.round(X.v);   // на начало месяца
  if(b.t==='pvz'){X.lpk=X.pk||0;X.llost=X.lost||0;X.lod=X.od||0;X.lfm=X.fm||0;X.pk=0;X.lost=0;X.od=0;X.fm=0;}if(b.t==='sto'){X.lidle=rnd0((X.idle||0)*10)/10;X.lgone=rnd0((X.gone||0)*10)/10;X.idle=0;X.gone=0;}}};
const oa0=E.ownAdvise;
E.ownAdvise=function(W,o){oa0(W,o);if(W.ned||!W.me||!W.ip)return;let best=null;
  for(const b of W.biz){const h=mxHint(W,b);if(!h)continue;const pri=h.a==='help'&&h.why==='now'||h.a==='ot'||h.a==='clean'&&b.mx.v<SH.lo?52:46;if(!best||pri>best.pri)best={k:'z_mx',pri,a:Object.assign({id:b.id,bt:b.t},h)};}
  if(best)o.push(best);};
// сезон для «паспорта» дела и строки «пик спроса» (поток посылок, машины в автосервисе)
const se0=E.season;
E.season=function(t,m,k){if(t==='pvz')return PV.PS[m];if(t==='sto')return ST.SS[m]/SSN;return se0(t,m,k);};
// миграция: у старых точек — показатели «как в спокойном месяце»; новые — с начала
const mg0=E.ownMig;
E.ownMig=function(W,fx){mg0(W,fx);for(const b of W.biz||[]){if(!MX[b.t])continue;if(!b.mx||typeof b.mx!=='object'){b.mx=mxNew(W,b);if(b.t==='coffee'&&b.st==='w')b.mx.v=cfTarget(W,b);if(b.t==='shaw')b.mx.v=80;}
  const X=b.mx;if(typeof X.v!=='number'||!isFinite(X.v))X.v=mxNew(W,b).v;for(const k of ['n','mr','lr'])if(typeof X[k]!=='number')X[k]=0;}};
const oo0=E.ownOpen;
E.ownOpen=function(W,b){oo0(W,b);if(MX[b.t])b.mx=mxNew(W,b);};

Object.assign(E,{MX,MXL,MX_SH:SH,MX_CF:CF,MX_PV:PV,MX_ST:ST,mxOf:mx,mxOk,mxAct,mxHint,mxWho:who,mxCfTarget:cfTarget,mxCfEve:cfEve,mxEveGain:eveGain,mxPvFlow:pvFlow,mxPvCap:pvCap,mxPvS:pvS,mxPvSea:pvSea,mxPvPrice:pvPrice,mxShK:shK,mxCfK:cfK});
})(typeof window!=='undefined'?window:this);
