/* b2-mg1.js — MG1 — мини-игры, набор 1: опись (сами игры — js/b2-mg-<id>.js, грузит оболочка MGCORE по требованию). Журнал M50-boost/logs/MG1.md.
   Договор — шапка js/b2-mg-core.js. Игры: 🥙 shaw «Шаурма на скорость», 💵 cash «Пересчитай кассу», 🤝 torg «Торг с поставщиком», ☕ capu «Капучино до черты»
   («📄 Листовки» — образец MGCORE). Крючки — дела хозяина: neg → торг; check → касса; stand («Встать за прилавок») — по виду точки (fit, обёртка MG.after здесь):
   шаурма/столовая/фудтрак → шаурма, кофе/пекарня/автомат → капучино, прочие → касса. Эффекты по медали — оболочка (mgcore.*), своих чисел и полей нет. Флаг B2.off.mg1. */
(function(root){'use strict';
B2.off.mg1=0;          // 1 — выключено по умолчанию
if(B2.off('mg1')||!root.MG)return;
const E=root.ECON,FOOD=['shaw','canteen','truckf'],CUP=['coffee','bakery','vend'];
const has=(W,a)=>!!(W&&W.biz&&W.biz.some(b=>a.indexOf(b.t)>=0&&b.st==='w'));
const st2=W=>!!(W&&!W.ned&&E&&E.stI&&E.stI(W)>=1);
const ptT=ref=>{const W=root.GAME&&GAME.W,b=W&&W.biz&&W.biz.find(x=>x.id===ref);return b?b.t:'';};
const small=W=>W&&W.biz?W.biz.filter(b=>b.st==='w'&&E.SMALL&&E.SMALL.indexOf(b.t)>=0).length:0;
const U=(a,b,c,e1,e2)=>[[a,b,c],[e1,e2]];
MG.add({id:'shaw',o:'mg1',n:['Шаурма на скорость','Speed shawarma'],ico:'🥙',u:U('заказ','заказа','заказов','order','orders'),
  md:[7,12,17],mid:10,hook:{job:['stand']},fit:(k,t,ref)=>FOOD.indexOf(ptT(ref))>=0,open:W=>st2(W)&&has(W,FOOD),
  lk:['Откроется с шаурмой, столовой или фудтраком','Opens with a shawarma stand, canteen or food truck']});
MG.add({id:'capu',o:'mg1',n:['Капучино до черты','Cappuccino to the line'],ico:'☕',u:U('стакан','стакана','стаканов','cup','cups'),
  md:[5,9,12],mid:8,hook:{job:['stand']},fit:(k,t,ref)=>CUP.indexOf(ptT(ref))>=0,open:W=>st2(W)&&has(W,CUP),
  lk:['Откроется с «Кофе с собой», пекарней или кофейным автоматом','Opens with coffee to go, a bakery or a coffee machine']});
MG.add({id:'cash',o:'mg1',n:['Пересчитай кассу','Count the till'],ico:'💵',u:U('₽','₽','₽','₽','₽'),
  md:[15000,30000,48000],mid:24000,hook:{job:['check','stand']},fit:(k,t,ref)=>t==='check'||(FOOD.indexOf(ptT(ref))<0&&CUP.indexOf(ptT(ref))<0),
  open:W=>st2(W)&&small(W)>=1,lk:['Откроется в главе «Своё дело»','Opens in the “Own business” chapter']});
MG.add({id:'torg',o:'mg1',n:['Торг с поставщиком','Haggle with the supplier'],ico:'🤝',u:U('₽','₽','₽','₽','₽'),
  md:[45000,70000,88000],mid:60000,hook:{job:['neg']},open:W=>st2(W)&&small(W)>=2,
  lk:['Откроется со второй точкой','Opens with your second outlet']});
// «Встать за прилавок» — игра по виду точки (fit); остальное — как в оболочке
const af=MG.after;MG.after=function(kind,t,ref){if(kind!=='job'||t!=='stand')return af.apply(this,arguments);
  const W=root.GAME&&GAME.W,id=['shaw','capu','cash'].find(i=>MG.on(i)&&MG.G[i].fit(kind,t,ref));if(!id||!W||!W.ow||!MG.isOpen(id,W))return;
  const j=W.ow.j.filter(x=>x.k===t&&x.a===ref).pop();if(j)MG.ui().then(U=>U.offer(id,{src:kind,kind,t,ref:j.id})).catch(()=>{});};
})(typeof window!=='undefined'?window:globalThis);
