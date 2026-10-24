/* b2-nedra-m.js — модель NEDRA (без DOM; грузится b2-nedra.js по требованию, в jsc — сразу). Договор — logs/NEDRA.md.
   П1 fore — честная прибыль объекта: своя продукция сбивает цену (как mkDay: цель ∝ 1 − 0,8·(s30/V − p0)), покупное сырьё дорожает от своей закупки,
      своё сырьё — по цене на месте (+ перевозка из другого региона). Ею пользуются советы chain/plant, событие plant, E.nedMargin (бот sim.js chainsF).
   П3 upFore — модернизация (+50 % выпуска): прибыль добавки с падением цены, окупаемость; совет b2up.
   П4 события: параметры из распределения, совет зависит от состояния (≈ половина «да»); export/eco/tip/refi/union/town/plant/geo/rail.
   П5 доразведка: deep — пустой участок («пусто») разведать глубже (дороже, шанс ~55 %, раз на участок); dz — продлить запас своего рудника;
      событие sell — соперник продаёт работающий рудник. «Деньги без дела» — idle(W) и совет b2deal с делами deals(W). */
(function(root){'use strict';
const E=root.ECON,N=typeof B2!=='undefined'&&B2.nedra;if(!E||!E._||!N||N.M)return;   // второй раз (маска b2-* + B2.need) — не грузим
const {pay,recv,pl,news,rnd0,clamp}=E._,OBJ=E.OBJ;
const cfg=W=>N.cfg(W);
const o2=W=>B2.w(W,'nedra');
function NR(W){const o=o2(W);if(typeof o.r!=='number')o.r=((W.seed>>>0)^0x2c1b3c6d)|0;let a=o.r=(o.r+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;}
const NRR=(W,a,b)=>a+(b-a)*NR(W);
const r1=(x,u)=>Math.max(u,Math.round(x/u)*u);
function tagged(t,f){const p=E.tg(t);try{return f();}finally{E.tg(p);}}
const on=W=>!!W&&W.ned&&W.n5&&!B2.off('nedra');
const mo=W=>W.m-(typeof W.n5m==='number'?W.n5m:W.m);

/* ---------- П1: честная прибыль ---------- */
// во сколько раз изменится цена от своего объёма q в месяц (q<0 — своя закупка)
function tgK(W,g,q){const K=W.mk&&W.mk[g];if(!K||!K.V)return 1;const tg=x=>clamp(1-.8*(x/K.V-(K.p0||0)),.55,1.6);const a=tg(K.s30||0);return a>0?tg((K.s30||0)+q)/a:1;}
// своё сырьё g: свободный выпуск (сверх нужд своих заводов) и где его больше всего
function flow(W,g,skip){let s=0,d=0,src=null,sq=0;for(const o of W.obj){if(o.st!=='w'||o.off||o===skip)continue;const O=OBJ[o.t],c=E.objCap(o);
  if(O.out===g&&o.why!=='empty'){s+=c;if(c>sq){sq=c;src=o.r;}}if(O.in&&O.in[g])d+=c*O.in[g];}return {free:Math.max(0,s-d),src};}
// o: {q — выпуск в месяц (по умолч. мощность), fix, vc, c — цена вложения, pid — участок (цена стройки рудника ×cm), skip — объект не считать в своём сырье}
function fore(W,t,r,o){o=o||{};const O=OBJ[t];if(!O||!O.out||!W.mk)return null;
  const q=o.q||O.cap,fix=o.fix!=null?o.fix:O.fix;let c=o.vc!=null?o.vc:(O.vc||0),own=1,far=0;
  if(O.in)for(const g in O.in){const need=q*O.in[g],f=flow(W,g,o.skip),mine=Math.min(need,f.free),buy=need-mine;let s=0;
    if(mine>0&&f.src&&f.src!==r)far=1;if(mine>0)s+=mine*(E.price(W,f.src||r,g)+(f.src&&f.src!==r?E.tariff(W,f.src,r):0));
    if(buy>0){s+=buy*E.buyPrice(W,r,g,buy)*tgK(W,g,-buy);own=Math.min(own,mine/need);}c+=s/q;}
  const p=E.price(W,r,O.out),f=tgK(W,O.out,q),m=rnd0((p*f-c)*q-fix);
  const cost=o.c!=null?o.c:(o.pid?E.capexOf(W,t,r,o.pid):O.capex);
  let pbF=null;if(O.in&&E.FRP_K){const a=cost*E.FRP_K,mm=m-a*E.FRP_R/12;pbF=mm>0?Math.ceil((cost-a)/mm):999;}
  return {t,r,q,p,pa:p*f,c,drop:1-f,m,cost,pb:m>0?Math.ceil(cost/m):999,pbF,own,far};}

/* ---------- П3: модернизация ---------- */
function upFore(W,o){if(!o||o.st!=='w'||o.up||o.off||o.t==='store'||o.lv>=E.UP_MAX)return null;const O=OBJ[o.t];if(!O||!O.out)return null;
  const nx=Object.assign({},o,{lv:o.lv+1,off:0}),add=E.objCap(nx)-E.objCap(o),fx=E.objFix(nx)-E.objFix(Object.assign({},o,{off:0}));
  const f=fore(W,o.t,o.r,{q:add,fix:fx,vc:o.vc,c:E.upCost(W,o)});if(!f)return null;f.o=o.id;f.mo=Math.ceil(O.mo/2)+1;
  if(O.dep){const p=E.plotById(W,o.plot);const left=p&&p.dep?p.dep.res/E.objCap(nx):0;f.left=Math.floor(left);if(left<f.pb+12)f.pb=999;}
  return f;}

/* ---------- П5: доразведка ---------- */
const DEPR={coal:{res:[900e3,2500e3],vc:[5000,6400]},ore:{res:[1200e3,3000e3],vc:[4800,6600]},lime:{res:[1500e3,3500e3],vc:[500,800]},wood:{res:[600e3,1500e3],vc:[2300,3100]},cuore:{res:[4e6,9e6],vc:[1400,1900]}};
// месторождение «как в регионе», без лучшего: запас — нижние 2/3, себестоимость — любая
function dep(W,r,g,full){const P=E.REGS[r].p;if(!g){let s=0;for(const k in P)s+=P[k];let x=NR(W)*s;for(const k in P){x-=P[k];if(x<0){g=k;break;}}g=g||Object.keys(P)[0];}
  const D=DEPR[g]||DEPR.coal;return {g,res:rnd0(NRR(W,D.res[0],D.res[0]+(D.res[1]-D.res[0])*(full?1:.66))/1000)*1000,vc:rnd0(NRR(W,D.vc[0],D.vc[1])/10)*10,cm:Math.round(NRR(W,1,1.25)*100)/100};}
// пустой участок: глубокая разведка (раз на участок)
function deepOk(W,pid){const K=cfg(W);if(!on(W)||!K.dz||!K.dz.on)return null;const p=E.plotById(W,pid);if(!p||p.st!=='empty'||p.own||p.dz)return null;
  return {p,c:rnd0(E.explCost(W,p.r)*K.dz.dk/1e6)*1e6,ch:K.dz.dp,days:E.explDays(W)};}
function deep(W,pid){const x=deepOk(W,pid);if(!x)return 'no';const base=E.explCost(W,x.p.r);if(W.cash<x.c)return 'cash';const p=x.p;
  p.dz=1;p.n5=1;p.st='hid';p.dep=NR(W)<x.ch?dep(W,p.r,null,1):null;const r=E.explore(W,pid);if(r!=='ok'){p.st='empty';p.dep=null;return r;}
  const extra=x.c-base;if(extra>0)tagged(p.id,()=>{pay(W,extra,'expl');pl(W,'expl',extra);});news(W,'b2deep',{p:p.id,r:p.r,c:x.c});return 'ok';}
function deepList(W){const l=[];if(!on(W))return l;for(const r of E.REG)for(const p of W.plots[r]){const x=deepOk(W,p.id);if(x)l.push(x);}return l;}
// свой рудник: продлить запас (если осталось < 4 лет при нынешней добыче), раз в 12 мес. на рудник
function dzOk(W,oid){const K=cfg(W);if(!on(W)||!K.dz||!K.dz.on)return null;const o=W.obj.find(x=>x.id===oid);if(!o||o.st!=='w'||!OBJ[o.t].dep||!o.plot)return null;
  const p=E.plotById(W,o.plot);if(!p||!p.dep)return null;const cap=E.objCap(o),left=p.dep.res/cap;if(left>=48)return null;
  const X=o2(W),dz=X.dz||{};if(dz[oid]!=null&&W.m-dz[oid]<12)return null;if(X.dzq&&X.dzq.some(z=>z.o===oid))return null;
  const add=rnd0(Math.max(p.dep.res,cap*24)*(K.dz.add[0]+K.dz.add[1])/2/1000)*1000,c=rnd0(E.explCost(W,o.r)*K.dz.k/1e6)*1e6;
  const f=fore(W,o.t,o.r,{q:cap,vc:o.vc,c,fix:E.objFix(o)});const m=f?f.m:0;
  return {o,p,c,add,months:Math.round(add/cap),left:Math.floor(left),m,v:m>0?m*Math.min(36,add/cap):0,days:E.explDays(W)};}
function dz(W,oid){const x=dzOk(W,oid);if(!x)return 'no';if(W.cash<x.c)return 'cash';const K=cfg(W),X=o2(W);
  tagged(x.p.id,()=>{pay(W,x.c,'expl');pl(W,'expl',x.c);});const add=rnd0(Math.max(x.p.dep.res,E.objCap(x.o)*24)*NRR(W,K.dz.add[0],K.dz.add[1])/1000)*1000;
  (X.dz||(X.dz={}))[oid]=W.m;(X.dzq||(X.dzq=[])).push({o:oid,t:W.t+x.days,a:add});news(W,'b2dz',{o:oid,t:x.o.t,r:x.o.r,c:x.c});return 'ok';}
function dzDay(W){const X=o2(W);if(!X.dzq||!X.dzq.length)return;for(const z of X.dzq.slice()){if(W.t<z.t)continue;X.dzq=X.dzq.filter(y=>y!==z);
  const o=W.obj.find(x=>x.id===z.o),p=o&&E.plotById(W,o.plot);if(!p||!p.dep)continue;p.dep.res+=z.a;if(o.why==='empty')o.why='';news(W,'b2dzok',{t:o.t,r:o.r,a:z.a,g:p.dep.g});}
  if(!X.dzq.length)delete X.dzq;}

/* ---------- дела: кандидаты карточки цели и «денег без дела» ---------- */
function plan(W,c,days){try{return E.buildPlan(W,c,days).kind;}catch(e){return 'ok';}}
function deals(W,n){if(!on(W))return [];const K=cfg(W),out=[];const busyPlant=W.obj.some(x=>x.st==='b'&&OBJ[x.t].in);
  if(K.up>0&&!W.obj.some(x=>x.up))for(const o of W.obj){const f=upFore(W,o);if(f&&f.m>0&&f.pb<=K.up)out.push({k:'up',o:o.id,t:o.t,r:o.r,c:f.cost,m:f.m,pb:f.pb,days:f.mo*E.DAYS});}
  for(const r of E.REG)for(const p of W.plots[r])if(p.own==='you'&&p.st==='lic'&&p.dep&&!W.obj.some(x=>x.plot===p.id)){const t=E.MINE_OF[p.dep.g],f=fore(W,t,r,{vc:p.dep.vc,pid:p.id});
    if(f&&f.m>0&&f.pb<=K.pb)out.push({k:'mine',pid:p.id,t,r,c:f.cost,m:f.m,pb:f.pb,days:OBJ[t].mo*E.DAYS});}
  if(!busyPlant)for(const t in OBJ){const O=OBJ[t];if(!O.in)continue;for(const r of E.REG){if(W.obj.some(x=>x.t===t&&x.r===r))continue;const f=fore(W,t,r);
    if(f&&f.m>0&&(f.own===1&&!f.far||f.pb<=24)&&Math.min(f.pb,f.pbF||999)<=K.pb)out.push({k:'plant',t,r,c:f.cost,m:f.m,pb:f.pb,pbF:f.pbF,own:f.own,far:f.far,days:O.mo*E.DAYS});}}
  for(const o of W.obj){const x=dzOk(W,o.id);if(x&&x.v>x.c*2)out.push({k:'dz',o:o.id,t:o.t,r:o.r,c:x.c,m:rnd0(x.v/36),pb:Math.max(1,Math.ceil(x.c/Math.max(1,x.m))),add:x.add,mon:x.months,left:x.left,days:x.days});}
  out.sort((a,b)=>((a.pb>24)-(b.pb>24))||(b.m-a.m));   // сначала быстрые (≤ 2 лет) — по прибыли в месяц, потом остальные
  // одно дело на объект/регион-вид; заводов — лучший
  const seen={},res=[];for(const d of out){const key=d.k==='plant'?'plant':d.k+(d.o||d.pid||'');if(seen[key])continue;seen[key]=1;d.kind=plan(W,d.c,d.days||E.DAYS);if(d.kind==='no')continue;res.push(d);}
  // без окупаемости — разведка: обычная (есть «?») и глубокая (пустые участки)
  const hid=[];for(const r of E.REG)for(const p of W.plots[r])if(p.st==='hid')hid.push(p);
  if(hid.length){const p=hid[0];res.push({k:'expl',pid:p.id,r:p.r,c:E.explCost(W,p.r),pb:null,n:hid.length});}
  else{const l=deepList(W);if(l.length){const x=l[0];res.push({k:'deep',pid:x.p.id,r:x.p.r,c:x.c,ch:x.ch,pb:null,n:l.length});}}
  return res.slice(0,n||3);}
// «деньги без дела»: свободных (сверх платежей месяца и недоплаты строек) больше K.idle месячных прибылей
function idle(W){if(!on(W))return null;const K=cfg(W),h=(W.hist||[]).slice(-3);if(h.length<3)return null;let np=0;for(const x of h)np+=Math.max(0,x.np);np/=3;
  const free=W.cash-E.duty(W)-E.buildRest(W);if(np<=0||free<=0)return null;const months=free/np;if(months<K.idle)return null;
  return {cash:W.cash,free:rnd0(free),months:Math.round(months),np:rnd0(np),deals:deals(W,3)};}

/* ---------- П4: события с двусторонним советом ---------- */
const EV=E.EVN;
function prodCap(W,g){let s=0;for(const o of W.obj)if(o.st==='w'&&!o.off&&OBJ[o.t].out===g)s+=E.objCap(o);return s;}
function ownStock(W,g){let s=0;for(const r of E.REG)if(W.inv&&W.inv[r]&&W.inv[r][g])s+=W.inv[r][g].q;return Math.min(s,E.ownQ?E.ownQ(W,g):s);}
function mines(W){return W.obj.filter(o=>o.st==='w'&&OBJ[o.t].dep&&o.plot);}
function mineM(W,o){const f=fore(W,o.t,o.r,{q:1,vc:o.vc,fix:0});return f?Math.max(0,f.m)*E.objCap(o):0;}   // маржа рудника в месяц до постоянных
const P={};
P.export={mk:(W,a)=>{const cap=prodCap(W,a.g),k=NRR(W,.6,1.5),q=Math.max(1000,Math.round(cap*k/500)*500),pr=NRR(W,1.05,1.15),src=W.obj.find(o=>o.st==='w'&&OBJ[o.t].out===a.g),pp=E.price(W,src?src.r:'kuz',a.g);
    const del=rnd0(cap*.95+ownStock(W,a.g)),sh=Math.max(0,q-del);return Object.assign(a,{q,p:rnd0(pp*pr),k:Math.round((pr-1)*100),cap,sh,gain:rnd0((pp*pr-pp)*Math.min(q,del)-.2*pp*pr*sh)});},
  adv:(W,a)=>a.gain>0&&a.sh<=a.q*.05?0:1};
P.eco={mk:(W,a)=>{let b=0;for(const o of mines(W))b+=o.g-o.dp;const ms=mines(W);let mm=0;for(const o of ms)mm+=mineM(W,o);mm=ms.length?mm/ms.length:0;
    const c=r1(b*NRR(W,.008,.03),1e5),f=r1(b*NRR(W,.015,.045),1e5),pr=Math.round(NRR(W,.3,.7)*20)/20,loss=rnd0(mm/3);
    return Object.assign(a,{c:Math.max(5e6,c),f:Math.max(10e6,f),pr,loss,risk:rnd0(pr*(Math.max(10e6,f)+loss))});},
  adv:(W,a)=>a.c<=a.risk?0:1,
  run:(W,a,i)=>{if(i===0){if(W.cash<a.c)return 'cash';tagged('ev',()=>{pay(W,a.c,'oth');pl(W,'oth',-a.c);});return 'ok';}
    if(NR(W)<a.pr){tagged('ev',()=>{pay(W,a.f,'oth');pl(W,'oth',-a.f);});const ms=mines(W);const o=ms[Math.floor(NR(W)*ms.length)];if(o)o.stop=W.t+10;if(W.nx)W.nx.fine={f:a.f,t:W.t};}return 'ok';}};
P.tip={mk:(W,a)=>{const d=dep(W,a.r,a.d&&a.d.g),c=rnd0(E.explCost(W,a.r)*NRR(W,1.3,2.4)/1e6)*1e6,t=E.MINE_OF[d.g],f=fore(W,t,a.r,{vc:d.vc,c:OBJ[t].capex*d.cm});
    return Object.assign(a,{d,c,v:rnd0(E.depVal(W,a.r,d)),pb:f?f.pb:999,m:f?f.m:0});},
  adv:(W,a)=>a.pb<=cfg(W).pb&&a.v*.3>a.c&&W.cash>a.c*3?0:1};
P.refi={mk:(W,a)=>{const cut=Math.round(NRR(W,.008,.02)*1000)/1000,fee=r1(a.d*NRR(W,.006,.025),1e5);let sv=0;for(const l of W.loans.filter(l=>(l.k==='ann'||l.k==='eq')&&!l.san&&l.a>=20e6&&l.r>W.key+.025))sv+=l.a*Math.min(cut,l.r-(W.key+.01))/12*Math.min(l.n,24)*.6;
    return Object.assign(a,{cut,fee,sv:rnd0(sv)});},
  adv:(W,a)=>a.sv>a.fee*1.2?0:1,
  run:(W,a,i)=>{if(i!==0)return 'ok';if(W.cash<a.fee)return 'cash';tagged('ev',()=>{pay(W,a.fee,'int');pl(W,'int',a.fee);});
    for(const l of W.loans)if((l.k==='ann'||l.k==='eq')&&!l.san&&l.a>=20e6&&l.r>W.key+.025)l.r=Math.max(W.key+.01,l.r-a.cut);if(W.nx)W.nx.rf=1;return 'ok';}};
P.union={mk:(W,a)=>{const ms=mines(W);let f=0,mm=0;for(const o of ms){f+=E.objFix(o);mm+=mineM(W,o);}const k=Math.round(NRR(W,.04,.12)*100)/100,pr=Math.round(NRR(W,.25,.65)*20)/20,d=Math.round(NRR(W,7,14));
    return Object.assign(a,{k:Math.round(k*100),x:rnd0(f*k),tot:rnd0(f*k*12),pr,d,loss:rnd0(pr*mm*d/30)});},
  adv:(W,a)=>a.tot<=a.loss?0:1,
  run:(W,a,i)=>{const X=W.nx;if(i===0){X.un=W.m+12;X.ux=a.x;return 'ok';}if(NR(W)<a.pr){for(const o of mines(W))o.stop=W.t+a.d;X.str={o:'all',t:W.t};}return 'ok';}};
P.town={mk:(W,a)=>{const c=r1(Math.max(10e6,Math.max(0,E.equity(W))*NRR(W,.002,.007)),1e6);let v=0,n=0;
    for(const r of E.REG)for(const p of W.plots[r])if(p.dep&&(p.st==='found'||p.st==='auc'||p.own)){v+=E.depVal(W,r,p.dep);n++;}v=n?v/n:150e6;
    return Object.assign(a,{c,v:rnd0(v*.25)});},
  adv:(W,a)=>a.c<a.v&&W.cash>a.c*5?0:1};
P.plant={mk:(W,a)=>{const f=fore(W,a.t,a.r,{c:a.c});return Object.assign(a,{m:f?f.m:0,pb:f?f.pb:99});}};
P.geo={mk:(W,a)=>{const k=NRR(W,.6,1.6);a.c=r1(a.c*k,1e6);a.add=rnd0(a.add*NRR(W,.6,1.2)/1000)*1000;const o=W.obj.find(x=>x.id===a.o);
    a.v=o?rnd0(Math.max(0,mineM(W,o)-E.objFix(o))*Math.min(a.add/E.objCap(o),36)*.5):a.v;return a;}};
P.rail={mk:(W,a)=>{const d=Math.round(NRR(W,.55,.85)*100)/100;a.p=rnd0(E.WAG_COST*d);a.c=a.p*a.n;a.k=Math.round((1-d)*100);return a;},
  adv:(W,a)=>W.routes.length&&(E.wagFree(W)<a.n||a.k>=35)?0:1};
function patchEv(){if(!EV||EV.__b2||root.NEDRA_NOEV)return;EV.__b2=1;
  for(const k in P){const D=EV[k],X=P[k];if(!D)continue;const mk0=D.mk,adv0=D.adv,run0=D.run,ok0=D.ok;
    D.mk=function(W){const a=mk0.apply(this,arguments);if(!on(W)||!X.mk)return a;try{return X.mk(W,a)||a;}catch(e){return a;}};
    if(X.adv)D.adv=function(W,a){if(on(W)&&a&&(k!=='plant'||a.pb!=null))try{return X.adv(W,a);}catch(e){}return adv0.apply(this,arguments);};
    if(X.run)D.run=function(W,a,i){if(on(W)&&a&&(a.pr!=null||a.cut!=null||a.d!=null))return X.run(W,a,i);return run0.apply(this,arguments);};}
  // веса событий края (KRAI: NK.ev) — 0 = нет события; дробь — шанс
  for(const k in EV){const D=EV[k];if(!D||!D.ok||D.__w)continue;const ok0=D.ok;D.__w=1;D.ok=function(W){if(!ok0.apply(this,arguments))return false;if(!on(W))return true;const w=(cfg(W).ev||{})[k];return w==null||w>=1?true:w>0&&NR(W)<w;};}
  for(const k in N.evx)addEv(k,N.evx[k]);}
function addEv(k,d){if(!EV||!d)return;EV[k]=d;if(E.NEV&&E.NEV.indexOf(k)<0)E.NEV.push(k);}
// событие «соперник продаёт рудник» (П5): работающий рудник соперника, цена ≈ 18–32 мес. его прибыли
function sellOf(W){if(mo(W)<10)return null;const K=cfg(W),X=o2(W);if(X.sl!=null&&W.m-X.sl<9)return null;if(!K.buy||!K.buy.on)return null;let best=null;
  for(const b of W.bots)for(const a of b.as){const O=OBJ[a.t];if(!O||!O.dep||a.b>0||!a.plot)continue;const p=E.plotById(W,a.plot);if(!p||!p.dep||p.dep.res<O.cap*48)continue;
    const f=fore(W,a.t,a.r,{vc:a.vc,q:E.objCap({t:a.t,lv:a.lv||0})});if(!f||f.m<=0)continue;if(!best||f.m>best.m)best={b:b.id,a,f,m:f.m};}return best;}
const SELL={ok:W=>!!sellOf(W),mk:W=>{const x=sellOf(W);o2(W).sl=W.m;const pr=r1(x.m*NRR(W,12,30)*cfg(W).buy.k,1e6);return {b:x.b,t:x.a.t,r:x.a.r,plot:x.a.plot,lv:x.a.lv||0,c:pr,m:x.m,pb:Math.ceil(pr/x.m),g:E.plotById(W,x.a.plot).dep.g};},n:2,def:1,
  adv:(W,a)=>a.pb<=Math.min(30,cfg(W).pb)&&plan(W,a.c,E.DAYS)!=='no'?0:1,
  run:(W,a,i)=>{if(i!==0)return 'ok';if(W.cash<a.c)return 'cash';const b=W.bots.find(x=>x.id===a.b),as=b&&b.as.find(x=>x.plot===a.plot&&x.t===a.t);const p=E.plotById(W,a.plot);if(!as||!p)return 'no';
    const id='o'+(W.nid++);tagged(id,()=>pay(W,a.c,'capex'));b.as=b.as.filter(x=>x!==as);b.cash+=a.c;p.own='you';p.st='lic';p.lic=null;
    W.obj.push({id,t:a.t,r:a.r,plot:a.plot,st:'w',cost:a.c,paid:0,left:0,tot:1,g:a.c,dp:0,lv:as.lv||0,vc:as.vc,sp:0,b2buy:1});news(W,'b2buy',{b:a.b,t:a.t,r:a.r,c:a.c});return 'ok';}};

/* ---------- советы Людмилы ---------- */
function adv(W,l){const K=cfg(W);
  // нечестный chain (без падения цены) и «денег много» — заменяем
  for(let i=l.length-1;i>=0;i--)if(l[i].k==='chain'||l[i].k==='lazy')l.splice(i,1);
  if(!W.obj.some(x=>x.st==='b'&&OBJ[x.t].in)&&E.plantOf){const x=E.plantOf(W);if(x){const f=fore(W,x.t,x.r);if(f&&f.m>0&&f.pb<=30)l.push({k:'chain',pri:41,a:{t:x.t,r:x.r,pb:f.pb,m:f.m,pbF:f.pbF}});}}
  const busy=W.obj.some(x=>x.st==='b'||x.up);const ds=deals(W,3),id=idle(W);
  const up=ds.find(d=>d.k==='up');if(up&&!W.obj.some(x=>x.up))l.push({k:'b2up',pri:40,a:up});
  for(const o of W.obj){if(o.why==='empty'||!o.plot)continue;const x=dzOk(W,o.id);if(x&&x.left<=18){l.push({k:'b2dz',pri:43,a:{o:o.id,t:o.t,r:o.r,c:x.c,left:x.left,mon:x.months}});break;}}
  if(id&&id.deals.length)l.push({k:'b2idle',pri:busy?34:46,a:{free:id.free,months:id.months,d:id.deals}});
  l.sort((a,b)=>b.pri-a.pri);}

/* ---------- день, месяц ---------- */
function day(W,off){if(!on(W))return;dzDay(W);}
function close(W){}
/* ---------- бот симулятора: живой игрок слушает советы (раз в полмесяца) ---------- */
function bot(W,st){if(W.d!==1&&W.d!==15)return;const K=cfg(W),BM=root.NEDRA_BOT||'upz',bm=c=>BM.indexOf(c)>=0;
  const ds=deals(W,4);for(const d of ds){
    if(d.k==='up'&&bm('u')&&d.pb<=K.up){const P2=E.buildPlan(W,d.c,d.days);if(P2.kind==='no'||(!root.NEDRA_LOAN&&P2.kind==='loan'))continue;if(P2.kind==='loan'){const mt=E.metrics(W);if(mt&&mt.de>2.5)continue;}if(P2.kind==='loan'&&E.projLoan(W,E.projLoanAmt(W,P2.short,d.c),d.days,d.c)!=='ok')continue;if(E.upgrade(W,d.o)==='ok')return;}
    if(d.k==='plant'&&bm('p')&&d.own===1&&!d.far&&Math.min(d.pb,d.pbF||999)<=30&&W.obj.filter(o=>OBJ[o.t].dep&&o.st==='w').length>=2){const P2=E.buildPlan(W,d.c*(1-(E.FRP_K||0)),d.days);if(P2.kind==='no')continue;
      if(P2.kind==='loan'){const mt=E.metrics(W);if(mt&&mt.de>2.5)continue;if(E.projLoan(W,E.projLoanAmt(W,P2.short,d.c),d.days,d.c)!=='ok')continue;}
      if(W.cash<d.c*.2)continue;if(E.build(W,d.t,d.r)==='ok'){const o=W.obj[W.obj.length-1];if(E.frpLoan&&E.frpOk&&E.frpOk(W,o.id))E.frpLoan(W,o.id);return;}}
    if(d.k==="dz"&&bm("z")&&W.cash>d.c+E.duty(W)){if(E.b2dz(W,d.o)==="ok")return;}
    if(d.k==='deep'&&bm('d')&&idle(W)&&W.cash>d.c+E.duty(W)+80e6&&!W.auc.some(a=>!a.done&&a.finder==='you')){if(E.b2deep(W,d.pid)==="ok")return;}}}

addEv('sell',SELL);patchEv();   // sell — не чаще раза в 9 мес. (o.sl), с 10-го мес. главы
N.M={fore,upFore,deals,idle,deep,deepOk,deepList,dz,dzOk,day,close,adv,bot,addEv,tgK,NR};
Object.assign(E,{b2deep:deep,b2dz:dz});   // для GAME.act('b2deep', pid) / GAME.act('b2dz', oid)
})(typeof window!=='undefined'?window:this);
