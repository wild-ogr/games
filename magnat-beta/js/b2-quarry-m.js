/* b2-quarry-m.js — QUARRY, модель «живого Карьера» (без DOM; в jsc-симуляторах грузится сразу, в браузере — B2.need из b2-quarry.js).
   Разбор: hobby-analytics/release-b/M50-boost/05-depth.md Д4-2…Д4-4. Цель — в главе «Карьер» новое решение раз в 1–2 минуты, темп главы не растягивать.
   Ничего в biz.js не правим: обёртки ECON.bizDay / ECON.bizClose (как RIVAL оборачивает ptMod), действия — ECON.qtBid / qpSet / qxDrill (через GAME.act).

   1) ТЕНДЕРЫ СТРОЕК (qt): раз в ~1–1,5 онлайн-месяца стройка города (клиенты подрядов M22) объявляет тендер на щебень/песок: объём в месяц × месяцев,
      потолок цены. Игрок выбирает цену: высокая / средняя / низкая (доля потолка 0,96 / 0,90 / 0,84) или «не участвуем». Соперники (B2.rivals.tender(W,'build'),
      без RIVAL — Бобров и Топтыгин) подают свои цены — скрыто, случайность своя (хэш мира и тендера, поток RNG мира не трогаем). Ответ — 7 онлайн-дней
      (офлайн срок стоит), итог — в тот же день. Выиграли — подряд в W.pc.a (поставки, штраф, учёт — готовый механизм M22, pcDay), отметка tn:1.
      Совет Людмилы — вариант с наибольшей ожидаемой прибылью (шанс × прибыль по ECON.pcFore), если все ≤ 0 — «не участвуем».
   2) ЧТО ДОБЫВАЕМ В КВАРТАЛЕ (qp): в начале квартала (онлайн) по каждому работающему карьеру — 3 продукта (щебень крупный/средний/мелкий, песок
      для засыпки/строительный/мытый). Спрос строек квартала: один продукт в цене (+4…7 %), один в избытке (−3…6 %); мелкий и мытый — дороже в добыче.
      Молчание — остаётся прежний продукт. Действует только в «Карьере» (в «Недрах» — нет).
   3) РАЗВЕДКА УЧАСТКА ДО ТОРГОВ (qx): марка камня/песка участка (хуже / обычная / лучше: цена тонны ×0,92 / ×1 / ×1,08) скрыта. Бурение ≈ 1 % оценки
      открывает марку до торгов, оценка участка (а с ней «разумный предел» и предел соперников) пересчитывается. Без разведки марка откроется при стройке.
      Карьеры, построенные до этой версии, — обычная марка (старые сохранения не меняются).
   Деньги: поправка к выручке карьера = выручка дня × (спрос продукта × марка − 1) − тонны × доплата за переработку; тег — карьер (раскрытие строк).
   Числа — B2.eco.k('quarry.mix_k'|'quarry.grade_k'|'quarry.tn_k', 1) (ECO может ослабить/выключить: 0 = механика без денег).
   Мир W.b2.quarry = {m0 (месяц входа в главу), k0 ('z1,z2' — карьеры до версии), t (тендер), tm, r (итог), tw, tl, mx {карьер: продукт}, mh (выбрано «в цене»), qq, qa {exp}, qd ('z1,'), d ('q3,' — разведаны), n}. */
(function(){'use strict';
if(typeof B2==='undefined'||B2.off('quarry')||typeof ECON==='undefined'||!ECON.bizDay||ECON.__b2q)return;
const E=ECON;E.__b2q=1;
const D=30,rnd0=Math.round;
const K=(k,d)=>B2.eco&&B2.eco.k?B2.eco.k('quarry.'+k,d):d;
const O=W=>B2.w(W,'quarry');
function hs(){let h=2166136261;const s=Array.prototype.join.call(arguments,'|');for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return (h>>>0)/4294967296;}
const isPit=b=>E.PITS.indexOf(b.t)>=0;
const pitsW=W=>W.biz.filter(b=>b.st==='w'&&isPit(b));
const hasBase=W=>W.biz.some(b=>b.t==='base'&&b.st==='w');
const inL=(s,id)=>(','+(s||'')+',').indexOf(','+id+',')>=0;
const addL=(s,id)=>inL(s,id)?s:(s?s+',':'')+id;
const live=W=>W.st==='quarry'&&!W.ned;

/* ---------- марка участка ---------- */
const GR=[.92,1,1.08];
function grade(W,pid){const h=hs(W.seed,'gr',pid);return h<.3?0:h<.7?1:2;}
function gradeK(W,b){const o=O(W);if(!b||!b.pid||inL(o.k0,b.id))return 1;return 1+(GR[grade(W,b.pid)]-1)*K('grade_k',1);}
function vK(g){return 1+3*(GR[g]-1)*K('grade_k',1);}   // во сколько раз меняется оценка участка от марки (цена +8 % ≈ заработок +24…30 %)
function qxCost(p){return Math.max(3e5,Math.min(3e6,rnd0(p.V*.01/1e5)*1e5));}
function qxOk(W,p){return !!p&&live(W)&&(p.st==='list'||p.st==='auc')&&p.own!=='you'&&!inL(O(W).d,p.id);}
function qxDrill(W,pid){const p=W.opi.find(x=>x.id===pid);if(!qxOk(W,p))return 'no';const c=qxCost(p);if(W.cash-c<E.bizDuty(W))return 'cash';
  const t0=E.tg?E.tg('q.'+pid):'';E.bizCost(W,c,'oth','oth','quarry');if(E.tg)E.tg(t0);
  const o=O(W),g=grade(W,pid);o.d=addL(o.d,pid);p.V=rnd0(p.V*vK(g));o.n=(o.n|0)+1;return 'ok';}
function qxInfo(W,p){const o=O(W),dr=inL(o.d,p.id);return {dr,g:dr?grade(W,p.id):-1,c:qxCost(p),ok:qxOk(W,p)};}

/* ---------- что добываем в квартале ---------- */
const PR={grav:[{ru:'Крупный щебень 40–70',en:'Coarse stone 40–70',wr:'дорог и насыпей',we:'roads and embankments',v:0},
    {ru:'Средний щебень 20–40',en:'Medium stone 20–40',wr:'бетона и фундаментов',we:'concrete and foundations',v:0},
    {ru:'Мелкий щебень 5–20',en:'Fine stone 5–20',wr:'асфальта и плит ЖБИ',we:'asphalt and concrete slabs',v:40}],
  sand:[{ru:'Песок для засыпки',en:'Fill sand',wr:'насыпей и дорог',we:'embankments and roads',v:-15},
    {ru:'Строительный песок',en:'Building sand',wr:'раствора и кладки',we:'mortar and brickwork',v:0},
    {ru:'Мытый песок',en:'Washed sand',wr:'бетона',we:'concrete',v:25}]};
const qi=W=>Math.floor(W.m/3);
// спрос квартала: летом чаще нужны дороги (крупный/засыпка), зимой и осенью — заводы ЖБИ и бетон (мелкий/мытый)
function dem(W,g,q){const a=[1,1,1],amp=K('mix_k',1),s=q%4;let hot=Math.floor(hs(W.seed,'qh',g,q)*3);
  if(hs(W.seed,'qs',g,q)<.45)hot=s===1||s===2?0:2;const cold=(hot+1+Math.floor(hs(W.seed,'qc',g,q)*2))%3;
  a[hot]+=amp*(.04+.03*hs(W.seed,'qa',g,q));a[cold]-=amp*(.03+.03*hs(W.seed,'qb',g,q));return {a,hot,cold};}
function mxOf(W,b){const v=O(W).mx;const k=v&&v[b.id];return k===0||k===2?k:1;}
// варианты по карьеру: ₽ в месяц к нынешнему (выручка у карьера × спрос − доплата за переработку)
function qpOpts(W,b){const B=E.BIZ[b.t],g=B.out,d=dem(W,g,qi(W)),f=E.pitFore(W,b),gk=gradeK(W,b),mk=Math.max(0,f.mkt),rv=mk*f.price*gk;
  const cur=mxOf(W,b),val=PR[g].map((p,i)=>rnd0(rv*(d.a[i]-1)-mk*p.v*K('mix_k',1)));let best=0;val.forEach((v,i)=>{if(v>val[best])best=i;});
  return {g,a:d.a,hot:d.hot,cold:d.cold,val,best,cur,gain:val[best]-val[cur],P:PR[g]};}
function qpPend(W){const o=O(W);if(!o.qa)return [];return pitsW(W).filter(b=>!inL(o.qd,b.id));}
function qpSet(W,bid,k){const o=O(W);k=+k;if(!live(W)||!o.qa||!(k>=0&&k<=2))return 'no';const b=W.biz.find(x=>x.id===bid);if(!b||b.st!=='w'||!isPit(b))return 'no';
  if(!o.mx||typeof o.mx!=='object')o.mx={};o.mx[bid]=k;o.qd=addL(o.qd,bid);o.n=(o.n|0)+1;if(k===dem(W,E.BIZ[b.t].out,qi(W)).hot)o.mh=(o.mh|0)+1;if(!qpPend(W).length)o.qa=null;return 'ok';}

/* ---------- тендеры строек ---------- */
const TF=[.96,.90,.84];
function rivs(W){let r=null;try{r=B2.rivals&&B2.rivals.tender?B2.rivals.tender(W,'build'):null;}catch(e){}
  if(!r||!r.length)r=[{id:'beav',n:'Бобров и Ко',en:'Bobrov & Co',agg:.5},{id:'bear',n:'Топтыгин Групп',en:'Toptygin Group',agg:.8}];
  return r.slice(0,3).map(x=>({id:x.id,n:x.n,en:x.en,col:x.col,lo:.8+.1*(1-(x.agg==null?.5:x.agg))}));}
const HI=1.08;   // цена соперника — равномерно от lo до 1,08 потолка; выше потолка — соперник не участвует
function winP(W,t,x){let p=1;for(const r of rivs(W))p*=Math.max(0,Math.min(1,(HI-x)/(HI-r.lo)));return p;}
function tnCnt(W){const P=W.pc;return P&&Array.isArray(P.a)?P.a.filter(c=>c.tn).length:0;}
function qtNew(W){const o=O(W);if(!live(W)||o.t||!hasBase(W)||tnCnt(W)>=2||W.m-(o.tm==null?-99:o.tm)<1)return;
  const mo=W.m%12,win=mo===11||mo<=1;if(hs(W.seed,'tq',W.m)>=(win?.4:.85))return;
  const h=k=>hs(W.seed,'t'+k,W.m,W.nid),g=h('g')<.65?'grav':'sand',qm=Math.round((1500+2000*h('q'))*(g==='sand'?1.2:1)/100)*100,n=3+Math.floor(h('n')*3);
  const cap=Math.round(E.AGG[g].sell*(.88+.1*h('c'))/10)*10;
  o.t={id:'t'+(W.nid++),g,qm,n,cap,cl:Math.floor(h('l')*8),exp:W.t+7,end:W.t+7};o.tm=W.m;}
function qtOpt(W,t,i){const x=TF[i],p=Math.round(t.cap*x/10)*10,c={g:t.g,qm:t.qm,n:t.n,q:t.qm*t.n,p};let f=null;try{f=E.pcFore(W,c);}catch(e){}
  const tot=f?rnd0(f.tot*K('tn_k',1)):0,ch=winP(W,t,x);return {i,x,p,ch,tot,perT:f?rnd0(f.perT):0,ev:rnd0(ch*tot)};}
function qtAdv(W){const o=O(W),t=o.t;if(!t)return null;const a=[0,1,2].map(i=>qtOpt(W,t,i));let best=3,bv=0;a.forEach(x=>{if(x.ev>bv){bv=x.ev;best=x.i;}});return {a,best};}
function qtBid(W,i){const o=O(W),t=o.t;i=+i;if(!live(W)||!t||t.my!=null||!(i>=0&&i<=3))return 'no';t.my=i;o.n=(o.n|0)+1;if(i===3){qtEnd(W);return 'ok';}return 'ok';}
function qtEnd(W){const o=O(W),t=o.t;if(!t)return;o.t=null;if(t.my==null||t.my===3){o.r={no:1,m:W.m,g:t.g,cl:t.cl};return;}
  const x=TF[t.my];let mb=9,who=null;for(const r of rivs(W)){const b=r.lo+(HI-r.lo)*hs(W.seed,'tb',t.id,r.id);if(b<=1&&b<mb){mb=b;who=r.id;}}
  const p=Math.round(t.cap*x/10)*10;
  if(x<mb){const P=E.pcOf(W);P.a.push({id:t.id,g:t.g,qm:t.qm,n:t.n,q:t.qm*t.n,p,cl:t.cl,exp:W.t,m:W.m,st:W.t,end:W.t+t.n*D,dq:0,rev:0,pr:0,miss:0,tn:1});
    o.tw=(o.tw|0)+1;o.r={w:1,p,m:W.m,g:t.g,cl:t.cl,q:t.qm*t.n};}
  else{o.tl=(o.tl|0)+1;o.r={w:0,p,m:W.m,g:t.g,cl:t.cl,who,wp:Math.round(t.cap*mb/10)*10};}
  if(typeof B2!=='undefined')B2.emit('quarry','tender');}

/* ---------- день и месяц ---------- */
function mig(W,o){if(o.m0==null&&W.st==='quarry')o.m0=W.m;
  if(o.k0==null)o.k0=W.biz.filter(isPit).map(b=>b.id).join(',');}
B2.mig('quarry',(W,o)=>mig(W,o));
function day(W,off,ps,s0){const o=O(W);mig(W,o);
  // поправка выручки карьера: спрос на продукт (только «Карьер») × марка участка
  for(let i=0;i<ps.length;i++){const b=ps[i],m=b.mq;if(!m)continue;const dr=m.rv-s0[i][0],dq=m.m+m.sv-s0[i][1];if(!(dr>0)||!(dq>0))continue;
    const g=E.BIZ[b.t].out,k=live(W)?mxOf(W,b):1,dk=live(W)?dem(W,g,qi(W)).a[k]:1,v=live(W)?PR[g][k].v*K('mix_k',1):0,kk=dk*gradeK(W,b);
    const adj=rnd0(dr*(kk-1)),vc=rnd0(dq*v);if(!adj&&!vc)continue;const t0=E.tg?E.tg(b.id):'';
    let a=0;if(adj)a=E.bizInc(W,adj,'quarry',true);if(vc>0)a-=E.bizCost(W,vc,'cogs','prod','quarry');else if(vc<0)a+=E.bizInc(W,-vc,'quarry',true);
    if(E.tg)E.tg(t0);m.rv+=adj;b.m.r+=adj;b.m.e+=a;}
  if(!live(W)){o.t=null;o.qa=null;return;}
  const t=o.t;if(t){if(t.my==null){if(off)t.exp++;else if(W.t>=t.exp){t.my=3;qtEnd(W);}}else if(off&&W.t<t.end)t.end++;else if(W.t>=t.end)qtEnd(W);}
  const q=qi(W);if(o.qa){if(off)o.qa.exp++;else if(W.t>=o.qa.exp||o.qa.q!==q)o.qa=null;}
  if(!off&&o.qq!==q&&pitsW(W).length){o.qq=q;o.qa={q,exp:W.t+20};o.qd='';}}
const d0=E.bizDay;E.bizDay=function(W,off){const ps=W.biz?W.biz.filter(b=>b.st==='w'&&isPit(b)):[],s0=ps.map(b=>b.mq?[b.mq.rv,b.mq.m+b.mq.sv]:[0,0]);
  const r=d0.apply(this,arguments);try{if(W.b2)day(W,off,ps,s0);}catch(e){try{console.error('b2-quarry',e);}catch(x){}}return r;};
const c0=E.bizClose;E.bizClose=function(W,M,off){const r=c0.apply(this,arguments);
  try{const o=O(W);if(o.r&&W.m-o.r.m>1)o.r=null;if(!off)qtNew(W);}catch(e){try{console.error('b2-quarry',e);}catch(x){}}return r;};

/* ---------- бот симуляторов (sim-chap зовёт E.netAuto онлайн): как советует Людмила ---------- */
function bot(W){if(!live(W))return;const o=O(W);
  if(o.t&&o.t.my==null){const a=qtAdv(W);E.qtBid(W,a.best);}
  for(const b of qpPend(W))E.qpSet(W,b.id,qpOpts(W,b).best);
  for(const p of W.opi)if(qxOk(W,p)&&(p.st==='auc'||p.day-W.t<=45)&&W.cash>qxCost(p)*4+E.bizDuty(W)){E.qxDrill(W,p.id);break;}}
const na=E.netAuto;E.netAuto=function(W){if(na)na.apply(this,arguments);try{bot(W);}catch(e){}};

Object.assign(E,{qtBid,qpSet,qxDrill});
// sim-chap: какие вызовы — решения и что в них «новое» (тендер, карьер×квартал, участок)
B2.sim=B2.sim||{};Object.assign(B2.sim,{qtBid:(a,W)=>{const t=O(W).t;return t?t.id:'-';},qpSet:(a,W)=>a[1]+':'+qi(W),qxDrill:a=>a[1]});
B2.qx=B2.qx||{};Object.assign(B2.qx,{v:1,O,PR,TF,GR,grade,gradeK,qxCost,qxOk,qxInfo,dem,qpOpts,qpPend,mxOf,qtAdv,qtOpt,rivs,winP,tnCnt,live,pitsW,hs});
})();
