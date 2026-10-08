/* ================= «Из ларька в магнаты: бизнес» — глава 5 «Недра»: вторая половина главы (M30, без DOM) =================
   Решение владельца 02.10: порог IPO не снижать, а заполнить главу. Только миры с флагом W.n5 (новые миры и миры «из ларька»;
   эталонный сейв v3 без флага идёт до рубля как раньше). Грузится после econ.js (и в симуляторе — tools/sim.sh и др.).
   1) Новые участки по ходу главы: регион без «?» — раз в несколько месяцев геологи открывают новый (до NP_MAX участков в регионе);
      к 8-му месяцу главы на Урале гарантированно есть свободный участок с медью (единственный регион с медью).
   2) События с выбором (8 видов, nev): РЖД продаёт вагоны со скидкой, завод-банкрот продаёт оборудование (передел со скидкой 25 %),
      профсоюз, экологическая проверка, продолжение пласта (доразведка своего участка), экспортёр, рефинансирование, город просит помочь.
      Одно событие за раз; без ответа ND дней — решает Людмила (вариант def). Совет Людмилы — вариант adv (с цифрами в окне, js/nedra-ui.js).
   3) Выработанный рудник: «закрыть и продать оборудование» (scrap) — 25 % остаточной стоимости, постоянные расходы уходят.
   4) Соперник с отрицательным капиталом — банкротство: продаёт активы (участки — на торги), долг списывается новым собственником.
   Случайность — своя (W.nr): поток W.rs мира не сдвигается от наших бросков.
   Деньги — через ECON._ pay/recv/pl (ДДС и БДР с тегом 'ev' или объекта) — баланс сходится. Новые денежные потоки — в реестре ECON.cpSrc (ветка cash). */
(function(root){
'use strict';
const E=root.ECON;if(!E||!E._)return;
const {pay,recv,pl,news,rnd0,clamp}=E._;
const NP_MAX=11,NP_N5=0,ND=10,EV_P=.75,EV_GAP=3,EV_BIG={plant:9,tip:9,geo:9,rail:9},UN_K=.08,UN_MO=12;
// своя случайность (mulberry32) — состояние W.nr
function NR(W){if(typeof W.nr!=='number')W.nr=((W.seed>>>0)^0x5bd1e995)|0;let a=W.nr=(W.nr+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;}
const NRR=(W,a,b)=>a+(b-a)*NR(W);
function nx(W){let X=W.nx;if(!X||typeof X!=='object')X=W.nx={};if(!X.dn||typeof X.dn!=='object')X.dn={};if(X.ev===undefined)X.ev=null;if(typeof X.n!=='number')X.n=0;if(typeof X.lm!=='number')X.lm=-99;return X;}
const on=W=>!!W&&W.ned&&!!W.n5;
const mo=W=>W.m-(typeof W.n5m==='number'?W.n5m:W.m);   // месяц главы
function tagged(t,f){const p=E.tg(t);try{return f();}finally{E.tg(p);}}
function myMines(W){return W.obj.filter(o=>o.st==='w'&&E.OBJ[o.t].dep&&o.plot);}
function prodCap(W,g){let s=0;for(const o of W.obj)if(o.st==='w'&&!o.off&&E.OBJ[o.t].out===g)s+=E.objCap(o);return s;}
// маржа объекта в месяц по ценам на месте (сырьё своё — по цене продажи на месте: столько бы выручили за него)
function margin(W,t,r,vc){const O=E.OBJ[t];let c=vc!=null?vc:(O.vc||0);if(O.in)for(const g in O.in)c+=O.in[g]*E.price(W,r,g);return (E.price(W,r,O.out)-c)*O.cap-O.fix;}

/* ---------------- новые участки ---------------- */
function newDep(W,r,g){const P=E.REGS[r].p;if(!g){let s=.2;for(const k in P)s+=P[k];let x=NR(W)*s;g=null;for(const k in P){x-=P[k];if(x<0){g=k;break;}}if(!g)return null;}
  const D={coal:{res:[900e3,2500e3],vc:[5000,6400]},ore:{res:[1200e3,3000e3],vc:[4800,6600]},lime:{res:[1500e3,3500e3],vc:[500,800]},wood:{res:[600e3,1500e3],vc:[2300,3100]},cuore:{res:[4e6,9e6],vc:[1400,1900]}}[g];
  // участок «по наводке геологов» — из лучших: запас в верхней половине, добыча дешевле (нижняя треть), стройка без надбавки
  return {g,res:rnd0(NRR(W,(D.res[0]+D.res[1])/2,D.res[1])/1000)*1000,vc:rnd0(NRR(W,D.vc[0],D.vc[0]+(D.vc[1]-D.vc[0])/3)/10)*10,cm:Math.round(NRR(W,1,1.08)*100)/100};}
function addPlot(W,r,g){if(W.plots[r].length>=NP_MAX)return null;const p={id:r+W.plots[r].length,r,st:'hid',dep:newDep(W,r,g),own:null,n5:1};while(E.plotById(W,p.id))p.id+='x';W.plots[r].push(p);news(W,'ev',{k:'plot',r});return p;}
function plotsMonth(W){const X=nx(W);
  // со второй трети главы: один регион без «?» за месяц, шанс 25 %; геологи ищут то, что дорожает (цена выше обычной) — рынок не заваливается
  const rs=E.REG.filter(r=>!W.plots[r].some(p=>p.st==='hid')&&W.plots[r].length<NP_MAX&&W.plots[r].filter(p=>p.n5).length<NP_N5);
  if(mo(W)>=10&&rs.length&&NR(W)<.25){const r=rs[Math.floor(NR(W)*rs.length)],P=E.REGS[r].p;let s=0;const w={};for(const g in P){w[g]=P[g]*Math.max(.15,W.mk[g].i-.85);s+=w[g];}
    let x=NR(W)*s,g=null;for(const k in w){x-=w[k];if(x<0){g=k;break;}}addPlot(W,r,g||null);}
  // медь: к 8-му месяцу главы на Урале есть свободный участок с медью (если своего медного рудника нет)
  if(!X.cu&&mo(W)>=8){X.cu=1;const free=W.plots.ural.some(p=>p.dep&&p.dep.g==='cuore'&&(p.own==='you'||['hid','exp','found','auc'].indexOf(p.st)>=0));
    if(!free&&!W.obj.some(o=>o.t==='cupit'))addPlot(W,'ural','cuore');}}

/* ---------------- события с выбором ---------------- */
// k → {ok(W) — может ли случиться, mk(W) → параметры a, n — вариантов, def — без ответа, adv(W,a) — совет Людмилы, run(W,a,i) — исполнить}
const EVN={
  rail:{ok:W=>W.obj.filter(o=>o.st==='w').length>=2&&W.wag.n<40,mk:W=>{const n=W.routes.length?20:10;return {n,p:rnd0(E.WAG_COST*.7),c:rnd0(n*E.WAG_COST*.7)};},n:2,def:1,
    adv:(W,a)=>W.routes.length||W.obj.some(o=>o.st==='w'&&E.OBJ[o.t].in)?0:1,
    run:(W,a,i)=>{if(i!==0)return 'ok';if(W.cash<a.c)return 'cash';tagged('wag',()=>pay(W,a.c,'wag'));W.wag.n+=a.n;W.wag.g+=a.c;news(W,'wagons',{n:a.n});return 'ok';}},
  plant:{ok:W=>!!plantOf(W),mk:W=>{const x=plantOf(W),cap=rnd0(E.OBJ[x.t].capex*.75),m=margin(W,x.t,x.r,null);return {t:x.t,r:x.r,c:cap,m:rnd0(m),pb:m>0?Math.ceil(cap/m):99};},n:2,def:1,
    adv:(W,a)=>a.pb<=30&&(W.cash+E.loanOffer(W).max)>=a.c*.6&&!W.obj.some(o=>o.st==='b'&&E.OBJ[o.t].in)&&E.buildPlan(W,a.c*(1-FRP_K),E.OBJ[a.t].mo*E.DAYS).kind!=='no'?0:1,   // M47c: не советовать второй завод, пока строится первый, и когда не хватит даже с проектным кредитом
    run:(W,a,i)=>{if(i!==0)return 'ok';if(W.cash<a.c*.2)return 'cash';const r=E.build(W,a.t,a.r);if(r!=='ok')return r;const o=W.obj[W.obj.length-1];o.cost=a.c;o.ev=1;const cut=Math.min(30,o.left-30);if(cut>0){o.left-=cut;o.tot-=cut;}o.ab=true;return 'ok';}},
  union:{ok:W=>myMines(W).length>=2&&!(nx(W).un>W.m),mk:W=>{let f=0;for(const o of myMines(W))f+=E.objFix(o);const ms=myMines(W);let e=0;for(const o of ms){const p=E.plotById(W,o.plot);if(p&&p.dep)e+=Math.max(0,margin(W,o.t,o.r,o.vc)+E.objFix(o));}
      return {x:rnd0(f*UN_K),tot:rnd0(f*UN_K*UN_MO),loss:rnd0(e/ms.length/3*.35+f*.02)};},n:2,def:0,
    adv:(W,a)=>a.tot<=a.loss*3?0:1,
    run:(W,a,i)=>{const X=nx(W);if(i===0){X.un=W.m+UN_MO;X.ux=a.x;return 'ok';}if(NR(W)<.35){const ms=myMines(W);const o=ms[Math.floor(NR(W)*ms.length)];if(o){o.stop=W.t+10;X.str={o:o.id,t:W.t};}}return 'ok';}},
  eco:{ok:W=>myMines(W).length>=1,mk:W=>{let b=0;for(const o of myMines(W))b+=o.g-o.dp;return {c:Math.max(5e6,rnd0(b*.01/1e5)*1e5),f:Math.max(10e6,rnd0(b*.03/1e5)*1e5)};},n:2,def:0,
    adv:(W,a)=>a.c<=a.f*.5+a.f*.15?0:1,
    run:(W,a,i)=>{if(i===0){if(W.cash<a.c)return 'cash';tagged('ev',()=>{pay(W,a.c,'oth');pl(W,'oth',-a.c);});return 'ok';}
      if(NR(W)<.5){tagged('ev',()=>{pay(W,a.f,'oth');pl(W,'oth',-a.f);});const ms=myMines(W);const o=ms[Math.floor(NR(W)*ms.length)];if(o)o.stop=W.t+10;nx(W).fine={f:a.f,t:W.t};}return 'ok';}},
  geo:{ok:W=>!!geoOf(W),mk:W=>{const o=geoOf(W),p=E.plotById(W,o.plot),O=E.OBJ[o.t],k=Math.round(NRR(W,.4,.7)*100)/100,add=rnd0(Math.max(p.dep.res,O.cap*24)*k/1000)*1000,c=rnd0(E.explCost(W,o.r)*2);
      return {o:o.id,t:o.t,r:o.r,g:p.dep.g,add,c,v:rnd0(Math.max(0,margin(W,o.t,o.r,o.vc))*Math.min(add/O.cap,36)*.5)};},n:2,def:1,
    adv:(W,a)=>a.v>a.c*1.5?0:1,
    run:(W,a,i)=>{if(i!==0)return 'ok';const o=W.obj.find(x=>x.id===a.o);const p=o&&E.plotById(W,o.plot);if(!p||!p.dep)return 'no';if(W.cash<a.c)return 'cash';
      tagged(p.id,()=>{pay(W,a.c,'expl');pl(W,'expl',a.c);});p.dep.res+=a.add;if(o.why==='empty')o.why='';return 'ok';}},
  export:{ok:W=>!!expOf(W),mk:W=>{const g=expOf(W),q=Math.max(1000,Math.round(prodCap(W,g)*.8/500)*500),src=W.obj.find(o=>o.st==='w'&&E.OBJ[o.t].out===g);return {g,q,p:rnd0(E.price(W,src?src.r:'kuz',g)*1.12),days:30};},n:2,def:1,
    adv:(W,a)=>prodCap(W,a.g)>=a.q*1.05?0:1,
    run:(W,a,i)=>{if(i!==0)return 'ok';const id='c'+(W.nid++);W.cons.push({id,g:a.g,q:a.q,p:a.p,days:a.days,pen:.2,b:'Экспортёр «Восточный терминал»',be:'Eastern Terminal exporter',exp:W.t,urg:false,end:W.t+a.days,done:0});news(W,'contract',{g:a.g,q:a.q,p:a.p});return 'ok';}},
  refi:{ok:W=>refiLoans(W).length>0&&!nx(W).rf,mk:W=>{const ls=refiLoans(W);let d=0,sv=0;for(const l of ls){d+=l.a;sv+=l.a*Math.min(.015,l.r-(W.key+.01))/12*Math.min(l.n,24)*.6;}return {d:rnd0(d),fee:rnd0(d*.01/1e5)*1e5,sv:rnd0(sv)};},n:2,def:1,
    adv:(W,a)=>a.sv>a.fee*1.2?0:1,
    run:(W,a,i)=>{if(i!==0)return 'ok';if(W.cash<a.fee)return 'cash';tagged('ev',()=>{pay(W,a.fee,'int');pl(W,'int',a.fee);});for(const l of refiLoans(W))l.r=Math.max(W.key+.01,l.r-.015);nx(W).rf=1;return 'ok';}},
  // наводка геологов: участок найден сразу (разведка дороже обычной, зато без риска «пусто»), дальше — торги, первооткрыватель — вы
  tip:{ok:W=>mo(W)>=6&&tipReg(W)!==null,mk:W=>{const r=tipReg(W),d=newDep(W,r,tipGood(W,r)),c=rnd0(E.explCost(W,r)*1.6/1e6)*1e6;return {r,d,c,v:rnd0(E.depVal(W,r,d))};},n:2,def:1,
    adv:(W,a)=>a.v*.4>a.c?0:1,
    run:(W,a,i)=>{if(i!==0)return 'ok';if(W.cash<a.c)return 'cash';if(W.plots[a.r].length>=NP_MAX+2)return 'no';const p={id:a.r+W.plots[a.r].length,r:a.r,st:'hid',dep:a.d,own:null,n5:1};while(E.plotById(W,p.id))p.id+='x';W.plots[a.r].push(p);
      if(E.explore(W,p.id,true)!=='ok')return 'cash';const extra=a.c-E.explCost(W,a.r);if(extra>0)tagged(p.id,()=>{pay(W,extra,'expl');pl(W,'expl',extra);});return 'ok';}},
  town:{ok:W=>E.REG.some(r=>W.plots[r].some(p=>p.st==='hid'))&&!nx(W).fav,mk:W=>({c:Math.max(10e6,rnd0(Math.max(0,E.equity(W))*.003/1e6)*1e6)}),n:2,def:1,
    adv:(W,a)=>W.cash>a.c*8?0:1,
    run:(W,a,i)=>{if(i!==0)return 'ok';if(W.cash<a.c)return 'cash';tagged('ev',()=>{pay(W,a.c,'oth');pl(W,'oth',-a.c);});nx(W).fav=1;return 'ok';}}};
// M47c: события про заводы передела (вторая половина главы): долгий заказ на продукцию передела с надбавкой (офтейк) и своя подстанция (постоянные завода −15 %)
Object.assign(EVN,{
  ord:{ok:W=>!!ordOf(W),mk:W=>{const g=ordOf(W),cap=prodCap(W,g),mo3=3,q=Math.max(500,Math.round(cap*mo3*.85/100)*100),src=W.obj.find(o=>o.st==='w'&&E.OBJ[o.t].out===g),p=rnd0(E.price(W,src?src.r:'ural',g)*NRR(W,1.12,1.16));
      return {g,q,p,days:E.DAYS*mo3,cap,k:Math.round((p/E.price(W,src?src.r:'ural',g)-1)*100),add:rnd0((p-E.price(W,src?src.r:'ural',g))*q)};},n:2,def:1,
    adv:(W,a)=>prodCap(W,a.g)*3>=a.q*1.05?0:1,
    run:(W,a,i)=>{if(i!==0)return 'ok';const id='c'+(W.nid++);W.cons.push({id,g:a.g,q:a.q,p:a.p,days:a.days,pen:.2,b:'Госзаказ: «Мостострой»',be:'State order: Bridgebuild',exp:W.t,urg:false,end:W.t+a.days,done:0,ot:1});news(W,'contract',{g:a.g,q:a.q,p:a.p});return 'ok';}},
  sub:{ok:W=>!!subOf(W),mk:W=>{const o=subOf(W),f=E.objFix(o),sv=rnd0(f*SUB_K),c=Math.max(10e6,rnd0(sv*NRR(W,10,14)/1e6)*1e6);return {o:o.id,t:o.t,r:o.r,sv,c,pb:Math.ceil(c/Math.max(1,sv))};},n:2,def:1,
    adv:(W,a)=>a.pb<=18&&W.cash>=a.c*2?0:1,
    run:(W,a,i)=>{if(i!==0)return 'ok';const o=W.obj.find(x=>x.id===a.o);if(!o)return 'no';if(W.cash<a.c)return 'cash';tagged(o.id,()=>pay(W,a.c,'capex'));o.g+=a.c;o.ek=1-SUB_K;news(W,'nevsub',{t:o.t,r:o.r,c:a.c});return 'ok';}}});
Object.assign(EV_BIG,{sub:6});
const SUB_K=.15;
function ordOf(W){const gs=['roll','wire','steel','cu','lumber','pig','cucon'].filter(g=>prodCap(W,g)>0&&!W.cons.some(c=>c.g===g));return gs.length?gs[0]:null;}
function subOf(W){return W.obj.find(o=>o.st==='w'&&!o.off&&E.OBJ[o.t].in&&!o.ek)||null;}
const NEV=Object.keys(EVN);
// передел, который окупается своим сырьём: лесопилка у своей лесозаготовки, обогатительная у медного рудника, домна на Урале при своей руде и угле
function plantOf(W){const has=t=>W.obj.some(o=>o.t===t),at=t=>{const o=W.obj.find(x=>x.t===t&&x.st==='w');return o?o.r:null;};
  if(at('logging')&&!has('sawmill'))return {t:'sawmill',r:at('logging')};
  if(at('cupit')&&!has('cuconc'))return {t:'cuconc',r:at('cupit')};
  if(at('orepit')&&at('coalpit')&&!has('furnace'))return {t:'furnace',r:at('orepit')};
  if(has('furnace')&&!has('steel'))return {t:'steel',r:W.obj.find(o=>o.t==='furnace').r};
  if(has('cuconc')&&!has('smelter'))return {t:'smelter',r:W.obj.find(o=>o.t==='cuconc').r};return null;}
function tipReg(W){const rs=E.REG.filter(r=>W.plots[r].length<NP_MAX+2&&W.plots[r].filter(p=>p.n5).length<2);return rs.length?rs[Math.floor(NR(W)*rs.length)]:null;}
function tipGood(W,r){const P=E.REGS[r].p;let s=0;const w={};for(const g in P){w[g]=P[g]*Math.max(.15,W.mk[g].i-.85);s+=w[g];}let x=NR(W)*s;for(const k in w){x-=w[k];if(x<0)return k;}return Object.keys(P)[0];}
function geoOf(W){const ms=myMines(W).map(o=>({o,p:E.plotById(W,o.plot)})).filter(x=>x.p&&x.p.dep);const l=ms.filter(x=>x.p.dep.res<E.OBJ[x.o.t].cap*24).sort((a,b)=>a.p.dep.res-b.p.dep.res);return l.length?l[0].o:null;}
function expOf(W){const gs=['coal','ore','wood','lumber','pig','steel','cucon'].filter(g=>prodCap(W,g)>=2000&&!W.cons.some(c=>c.g===g));return gs.length?gs[0]:null;}
function refiLoans(W){return W.loans.filter(l=>(l.k==='ann'||l.k==='eq')&&!l.san&&l.a>=20e6&&l.r>W.key+.025);}
// крупные траты (передел, наводка, доразведка, вагоны) — не чаще раза в 9 мес., мелкие решения — раз в 3 мес.
// M47c: со 2-й трети главы (8-й месяц) — ещё одно событие в середине месяца, только пока игрок в игре (онлайн): решений больше там, где их мало
// M47c (решение владельца 08.10 «реже»): второе событие — не раньше 30 игр. дней после прошлого (≈ 5 мин при ×1), т. е. окно с выбором не чаще раза в ~5 мин
const EV_MID=.7,EV_MID_MO=8,EV_MID_GAP=30;
function evNew(W,mid){const X=nx(W);if(X.ev||mo(W)<2)return;if(mid){if(mo(W)<EV_MID_MO||W.t-(X.lt||0)<EV_MID_GAP||NR(W)>=EV_MID)return;}else{if(W.m-X.lm<1)return;if(NR(W)>=EV_P)return;}
  const ks=NEV.filter(k=>(X.dn[k]==null||W.m-X.dn[k]>=(EV_BIG[k]||EV_GAP))&&EVN[k].ok(W));if(!ks.length)return;const k=ks[Math.floor(NR(W)*ks.length)];
  X.ev={id:'v'+(W.nid++),k,t:W.t,x:W.t+ND,a:EVN[k].mk(W)};X.lm=W.m;X.lt=W.t;X.dn[k]=W.m;}
// ответ: i — вариант; auto — решила Людмила (по умолчанию)
function nedAns(W,i,auto){const X=nx(W),e=X.ev;if(!e)return 'no';const D=EVN[e.k];if(!D)return 'no';i=i|0;if(i<0||i>=D.n)return 'no';
  const r=D.run(W,e.a,i);if(r!=='ok'&&!auto)return r;X.ev=null;X.last={k:e.k,i:r==='ok'?i:D.def,auto:!!auto,m:W.m,a:e.a,t:W.t};X.n++;news(W,'nev',{k:e.k,i,auto:auto?1:0});return 'ok';}
function nedAdv(W){const e=nx(W).ev;if(!e)return null;try{return EVN[e.k].adv(W,e.a);}catch(x){return EVN[e.k].def;}}
// симулятор (и «живой игрок» в sim): отвечаем, как советует Людмила
function nedAuto(W){if(!on(W))return;const e=nx(W).ev;if(!e||W.t-e.t<2)return;const i=nedAdv(W);if(E.nedAns(W,i==null?EVN[e.k].def:i)!=='ok')E.nedAns(W,EVN[e.k].def,true);}

/* ---------------- выработанный рудник: закрыть и продать оборудование ---------------- */
const SCRAP_K=.25;
function scrapOk(W,oid){const o=W.obj.find(x=>x.id===oid);if(!o||o.st!=='w'||!E.OBJ[o.t].dep||o.up)return null;const p=E.plotById(W,o.plot);if(!p||!p.dep||p.dep.res>0)return null;
  const bk=o.g-o.dp,lb=p.lic?p.lic.g-p.lic.am:0;return {o,p,bk,lb,pr:rnd0(bk*SCRAP_K),fix:E.objFix(o)};}
function scrap(W,oid){const x=scrapOk(W,oid);if(!x)return 'no';const {o,p,bk,lb,pr}=x;E.dtName(W,o.id,o.t+'.'+o.r);
  tagged(o.id,()=>{recv(W,pr,'asale');pl(W,'oth',pr-bk-lb);});p.lic=null;p.own=null;p.st='empty';W.obj=W.obj.filter(y=>y!==o);news(W,'scrap',{t:o.t,r:o.r,pr});return 'ok';}

/* ---------------- M47c: льготный заём Фонда развития промышленности (ФРП) — только на заводы передела ----------------
   До 50 % цены завода (строящегося или уже работающего — фонд берёт и модернизацию), 3 % годовых, 5 лет, первые 2 года — только проценты; один заём на завод; вне лимита банка (фонд — не банк).
   Окупаемость завода на свои деньги становится сравнимой с рудником — передел становится целью главы, а не только «после 2 млрд». */
const FRP_K=.5,FRP_R=.03,FRP_N=60,FRP_GR=24;
function frpOk(W,oid){if(!on(W))return null;const o=W.obj.find(x=>x.id===oid);if(!o||o.frp||!E.OBJ[o.t]||!E.OBJ[o.t].in)return null;if(o.st!=='b'&&o.st!=='w')return null;
  const a=Math.floor(o.cost*FRP_K/1e6)*1e6;if(a<10e6)return null;const bank=E.loanOffer(W).rate;
  return {o,a,r:FRP_R,n:FRP_N,gr:FRP_GR,int:rnd0(a*FRP_R/12),bank,sv:rnd0(a*(bank-FRP_R)*FRP_GR/12)};}
function frpLoan(W,oid){const x=frpOk(W,oid);if(!x)return 'no';const l={id:'l'+(W.nid++),a:x.a,a0:x.a,r:FRP_R,n:FRP_N,n0:FRP_N,k:'ann',gr:FRP_GR,frp:1,fo:x.o.id};W.loans.push(l);
  tagged(l.id,()=>recv(W,x.a,'loan'));x.o.frp=1;news(W,'frp',{a:x.a,t:x.o.t,r:x.o.r});return 'ok';}
function frpList(W){return on(W)?W.obj.filter(o=>frpOk(W,o.id)).map(o=>o.id):[];}

/* ---------------- соперник с отрицательным капиталом — банкротство ---------------- */
function botsMonth(W){for(const b of W.bots){if(E.botValue(W,b)>=0)continue;const sold=[];
  while(b.as.length>1&&E.botValue(W,b)<0){b.as.sort((x,y)=>x.g-y.g);const a=b.as.shift();b.cash+=a.g*.6;sold.push(a.t);
    if(a.plot){const p=E.plotById(W,a.plot);if(p){p.own=null;p.st='found';p.direct=1;E.passDirect(W,p.id);}}}
  if(E.botValue(W,b)<0){b.debt=0;b.cash=Math.max(b.cash,150e6);}   // долг списали — у компании новый собственник
  news(W,'botsan',{b:b.id,n:sold.length});}}

/* ---------------- хуки econ.js: день и закрытие месяца ---------------- */
function nedDay(W,off,out){if(!on(W))return;cpHook();const X=nx(W);
  // доплата профсоюзу (+8 % к постоянным рудников) — по дням, до налога
  if(X.un>W.m&&X.ux>0)tagged('ev',()=>{const d=rnd0(X.ux/E.DAYS);pay(W,d,'fix');pl(W,'fix',d);});
  // без ответа ND дней — решает Людмила. M47c: пока игрока нет (офлайн), событие ждёт его — как торги ОПИ в «Карьере»: решения — игроку, не автопилоту
  if(X.ev&&off)X.ev.x=Math.max(X.ev.x,W.t+ND);
  if(X.ev&&W.t>=X.ev.x)nedAns(W,EVN[X.ev.k].def,true);
  if(!off&&W.d===15)evNew(W,true);
  // «город помог»: следующий найденный нами участок — лицензия без торгов по стартовой цене
  if(X.fav)for(const a of W.auc)if(a.finder==='you'&&!a.done&&!a.lead){const p=E.plotById(W,a.p);W.auc=W.auc.filter(y=>y!==a);a.done=true;p.st='found';p.direct=a.st;X.fav=0;news(W,'nevfav',{r:p.r,g:p.dep.g,pr:a.st});break;}}
function nedClose(W,M,off){if(!on(W))return;E.nedPlots(W);E.nedBots(W);evNew(W);
  // M47c: дивиденды по акциям прошлых холдингов (W.dv ₽/мес., econ.js ipoDv) — прочий доход, налог удержан у источника
  if(W.dv>0){if(typeof M.pl.dv!=='number')M.pl.dv=0;tagged('dv',()=>{recv(W,W.dv,'oth');pl(W,'dv',W.dv);});
    const X=nx(W);if(!X.dvS){X.dvS=1;news(W,'dvpay',{a:W.dv});}}}
// советы Людмилы: событие ждёт ответа; передел своим сырьём окупается быстро; выработанный рудник можно продать
const adv0=E.advise;
E.advise=function(W){const o=adv0.apply(this,arguments);if(!on(W))return o;const X=nx(W);
  if(X.ev)o.push({k:'nev',pri:58,a:{k:X.ev.k}});
  if(!W.obj.some(x=>x.st==='b'&&E.OBJ[x.t].in)){const x=plantOf(W);if(x){const m=margin(W,x.t,x.r,null),c=E.OBJ[x.t].capex,pb=m>0?Math.ceil(c/m):99;if(pb<=30)o.push({k:'chain',pri:41,a:{t:x.t,r:x.r,pb,m:rnd0(m)}});}}
  for(const ob of W.obj)if(scrapOk(W,ob.id)&&ob.off)o.push({k:'scrap',pri:44,a:{t:ob.t,r:ob.r}});
  {const f=frpList(W)[0];if(f){const x=frpOk(W,f);o.push({k:'frp',pri:47,a:{o:f,t:x.o.t,r:x.o.r,a:x.a,sv:x.sv}});}}   // M47c: льготный заём ФРП на завод
  // «честный совет про заводы» не про передел со скидкой (событие «завод-банкрот»): он окупается быстрее
  const pi=o.findIndex(x=>x.k==='plant');if(pi>=0){const pb=W.obj.find(x=>x.st==='b'&&E.OBJ[x.t]&&E.OBJ[x.t].in&&x.t!=='sawmill');if(pb&&pb.ev)o.splice(pi,1);}
  o.sort((a,b)=>b.pri-a.pri);return o;};
// календарь денег (ветка cash, js/cash.js грузится позже): свои потоки — источник ECON.cpSrc; доплата профсоюзу (тег ev, статья fix), штраф/фильтры, комиссия банка
let cpReg=false;
function cpHook(){if(cpReg||!Array.isArray(E.cpSrc))return;cpReg=true;
  E.cpSrc.unshift((W,days,P)=>P.take(f=>f.tag==='ev'&&f.cf==='fix').map(f=>P.item(f,'fix','Доплата горнякам (профсоюз)','Miners’ pay rise (union)','union')));
  E.cpSrc.unshift((W,days,P)=>P.take(f=>f.tag==='dv').map(f=>P.item(f,'oth','Дивиденды по акциям прошлых холдингов','Dividends from your past holdings','dv')));}   // M47c
cpHook();
function nedMig(W,fx){if(W.n5){nx(W);if(typeof W.n5m!=='number')W.n5m=W.m;}}
Object.assign(E,{nedPlots:plotsMonth,nedBots:botsMonth,NEV,EVN,ND,NP_MAX,nedDay,nedClose,nedAns,nedAdv,nedAuto,nedMig,scrap,scrapOk,SCRAP_K,nedMargin:margin,plantOf,frpOk,frpLoan,frpList,FRP_K,FRP_R,FRP_N,FRP_GR});
})(typeof window!=='undefined'?window:this);
