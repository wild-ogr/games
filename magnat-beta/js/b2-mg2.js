/* b2-mg2.js — MG2 — мини-игры, набор 2: опись (сами игры — js/b2-mg-<id>.js, грузит оболочка MGCORE по требованию). Журнал M50-boost/logs/MG2.md.
   Договор — шапка js/b2-mg-core.js. Игры: 🚚 gaz «Газель задом к рампе», 📦 sort «Ночная сортировка», 📚 slovo «Словечко Людмилы» (по словарику gloss.js),
   💥 blast «Подрыв по команде» (карьер); края (W.b2.krai.id, формат KRAI): ❄ zimnik «Фура по зимнику» (yak), 🔥 plavka «Плавка до черты» (nor),
   🐟 ulov «Улов» (sah), 🍯 paseka «Пасека» (alt). Крючки: подработки loader → газель, night → сортировка; «Встать за прилавок» в газели → газель,
   в ПВЗ → сортировка (обёртка MG.after здесь; прочие точки — дальше по цепочке MG1/оболочки). Эффекты — оболочка (mgcore.*), своих чисел и полей нет; 💎 нет. Флаг B2.off.mg2. */
(function(root){'use strict';
B2.off.mg2=0;          // 1 — выключено по умолчанию
if(B2.off('mg2')||!root.MG)return;
const E=root.ECON;
const has=(W,a)=>!!(W&&W.biz&&W.biz.some(b=>a.indexOf(b.t)>=0&&b.st==='w'));
const gig=(W,t)=>!!(W&&W.me&&W.me.n&&W.me.n[t]>0);
const stI=W=>W&&E&&E.stI?E.stI(W):0;
const kr=(W,id)=>!!(W&&W.b2&&W.b2.krai&&W.b2.krai.id===id)||!!(typeof S!=='undefined'&&S&&S.b2k&&S.b2k.st&&S.b2k.st[id]>0);
const ptT=ref=>{const W=root.GAME&&GAME.W,b=W&&W.biz&&W.biz.find(x=>x.id===ref);return b?b.t:'';};
const U=(a,b,c,e1,e2)=>[[a,b,c],[e1,e2]];
const STAND={gazel:'gaz',pvz:'sort'};
MG.add({id:'gaz',o:'mg2',n:['Газель задом к рампе','Van back to the dock'],ico:'🚚',u:U('с','с','с','s','s'),lower:1,
  md:[380,260,200],mid:250,hook:{gig:['loader']},open:W=>gig(W,'loader')||has(W,['gazel','whs','base'])||stI(W)>=2,
  lk:['Откроется с подработкой «Грузчик» или своей газелью','Opens with the “Mover” gig or your own van']});
MG.add({id:'sort',o:'mg2',n:['Ночная сортировка','Night sorting'],ico:'📦',u:U('посылка','посылки','посылок','parcel','parcels'),
  md:[16,23,27],mid:21,hook:{gig:['night']},open:W=>gig(W,'night')||has(W,['pvz']),
  lk:['Откроется с ночной сменой на складе или своим ПВЗ','Opens with a warehouse night shift or your own pickup point']});
MG.add({id:'slovo',o:'mg2',n:['Словечко Людмилы','Lyudmila’s word game'],ico:'📚',u:U('слово','слова','слов','word','words'),
  md:[6,10,14],mid:9,hook:{},open:W=>stI(W)>=1||!!(W&&W.me&&W.me.ng>=6),
  lk:['Откроется в главе «Своё дело»','Opens in the “Own business” chapter']});
MG.add({id:'blast',o:'mg2',n:['Подрыв по команде','Blast on command'],ico:'💥',u:U('тонна','тонны','тонн','ton','tons'),
  md:[700,1100,1450],mid:1000,hook:{},open:W=>stI(W)>=3,
  lk:['Откроется с карьером','Opens with the quarry']});
MG.add({id:'zimnik',o:'mg2',n:['Фура по зимнику','Truck on the ice road'],ico:'🚛',u:U('км','км','км','km','km'),
  md:[40,58,68],mid:52,hook:{},open:W=>kr(W,'yak'),lk:['Откроется в Якутии','Opens in Yakutia']});
MG.add({id:'plavka',o:'mg2',n:['Плавка до черты','Pour to the line'],ico:'🔥',u:U('слиток','слитка','слитков','ingot','ingots'),
  md:[7,11,14],mid:10,hook:{},open:W=>kr(W,'nor'),lk:['Откроется в Норильске','Opens in Norilsk']});
MG.add({id:'ulov',o:'mg2',n:['Улов','The catch'],ico:'🐟',u:U('кг','кг','кг','kg','kg'),
  md:[30,48,62],mid:42,hook:{},open:W=>kr(W,'sah'),lk:['Откроется на Сахалине','Opens on Sakhalin']});
MG.add({id:'paseka',o:'mg2',n:['Пасека','The apiary'],ico:'🍯',u:U('г мёда','г мёда','г мёда','g of honey','g of honey'),
  md:[600,950,1250],mid:850,hook:{},open:W=>kr(W,'alt'),lk:['Откроется на Алтае','Opens in Altai']});
// «Встать за прилавок» в газели / ПВЗ — свои игры; прочие точки — дальше по цепочке (MG1: шаурма, капучино, касса)
const af=MG.after;MG.after=function(kind,t,ref){const id=kind==='job'&&t==='stand'&&STAND[ptT(ref)];if(!id)return af.apply(this,arguments);
  const W=root.GAME&&GAME.W;if(!W||!W.ow||!MG.isOpen(id,W))return;
  const j=W.ow.j.filter(x=>x.k===t&&x.a===ref).pop();if(j)MG.ui().then(U=>U.offer(id,{src:kind,kind,t,ref:j.id})).catch(()=>{});};
})(typeof window!=='undefined'?window:globalThis);
