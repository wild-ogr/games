/* b2-event.js — EVENT «Магнат 2.0»: табель 28 дней с отгулом, Поток заданий героев, полоска сезона, тема недели. Стартовый файл (≤ 8 КБ);
   движок и задания — js/b2-event-flow.js, окна — js/b2-event-ui.js (B2.need). Устройство: S.b2e (всё переживает IPO). Мир не пишем.
   ДОГОВОР ПОТОКА v1 (полный текст — release-b/M50-boost/logs/EVENT-B.md):
     B2.flowAdd({id:'bf26'(≤8), o:'fest', who:'lud|son|bor|pet|vit', ru,en, ico, on:()=>bool, to:ms?, t:[5 × {k,need,ru,en}], prize:{cr:'fest.<ключ>', ru,en}})
     k: 'c:close|prof|gigs|pts|biz|city|build|expl|sold|eq' · 'a:<GAME.act>' · 'u:rep|gl|fin' · 'x:<имя>' (B2.flowTick(имя,n)) · свой вид B2.flowKind(k, W=>число)
     события: 'flow:task' {c,h,n,k} · 'flow:chain' {c,o,h} (prize.cr уже выдан EVENT). B2.flowState(id) → {n, done}. */
(function(){'use strict';
B2.off.event=0;          // 1 — выключено по умолчанию
// очередь цепочек — работает и когда EVENT выключен/не загружен (тогда цепочки просто не показываются)
const Q=B2._flowQ=B2._flowQ||[];
B2.flowAdd=B2.flowAdd||(d=>{if(d&&d.id)Q.push(d);});
B2.flowTick=B2.flowTick||(()=>{});B2.flowKind=B2.flowKind||(()=>{});B2.flowState=B2.flowState||(()=>({n:0,done:false}));
if(B2.off('event'))return;
const s=()=>B2.s('e');
const KND={};
const cnt=(k,n)=>{const o=s();if(!B2.isObj(o.k))o.k={};o.k[k]=(o.k[k]|0)+(n==null?1:n);};
// счётчики действий: только те, что встречаются в заданиях (размер S.b2e мал)
const ACT=['mkRun','stTrain','edStart','opiBid','frpLoan','afacSet','bizOpen','bizOpenN','upgrade','ptUp','ptUpAll','takeLoan','repay','factor','explore','cityOpen','optUp','optCt','vehTO','vehAdd','build','pitBuild','pitUp','regIP','regOOO','bizMgr','bizAudit','ship','reBuy','eqBuy','friendCall','friendVisit','gigTake','jobStart','addRoute','buyWagons','netSell'];
B2.flowTick=(k,n)=>{if(k)cnt('x:'+String(k).slice(0,10),n);};
B2.flowKind=(k,fn)=>{if(k&&typeof fn==='function')KND[k]=fn;};
B2.flowState=id=>{const fc=s().fc||{},n=fc[id]|0;return {n,done:n>=5};};
B2.flowAdd=d=>{if(d&&d.id){const i=Q.findIndex(x=>x.id===d.id);if(i>=0)Q.splice(i,1);Q.push(d);}};
const EV={Q,KND,cnt,ACT,s};B2.evt=EV;
const ms=()=>{const o=s(),f=o.f||{};return {g:o.g|0,t:f.t|0,r:f.r||{},zc:o.zc|0};};
B2.vkm('event',[['ev_tab7',o=>o.g>=7],['ev_tab28',o=>o.g>=28],['ev_tab3',o=>o.g>=84],['ev_fl10',o=>o.t>=10],['ev_fl50',o=>o.t>=50],['ev_fl200',o=>o.t>=200],['ev_fl500',o=>o.t>=500],
  ['ev_ch1',o=>Object.keys(o.r).some(h=>o.r[h]>0)],['ev_ch5',o=>['lud','son','bor','pet','vit'].every(h=>o.r[h]>0)],['ev_sz1',o=>o.zc>=1],['ev_sz3',o=>o.zc>=3],['ev_sz6',o=>o.zc>=6]].map(([id,f])=>({id,ok:()=>f(ms())})));
// табель на 28 дней: GAME.CAL на месте = ECO 'event.tab' (как main ×4); выдаёт старый planGift (ролик ×2, спонсор — как было)
function cal28(){const C=GAME.CAL;if(!C)return;let L=B2.eco&&B2.eco.list?B2.eco.list('event.tab'):[];if(L.length!==28){const w=C.slice(0,7);L=[];for(let i=0;i<4;i++)L.push(...w);}C.length=0;C.push(...L);}   // ряд — договор чисел ECO 'event.tab'
const root_pl=()=>typeof S!=='undefined'&&S.pl&&typeof S.pl==='object'?S.pl:null;
const BAD=['no','cash','cr','max','plan','req','limit','busy','wait','ev','nc','have','eq','pts','veh','res','lim','day','err','lost','none'];
const ok=r=>r!=null&&r!==false&&r!==0&&(typeof r!=='string'||BAD.indexOf(r)<0)&&!(B2.isObj(r)&&(r.res==='no'||r.ok===false||r.err));
function hook(){const p=root_pl();if(p&&Array.isArray(p.t)&&p.t.length)p.t=[];   // поручения старой Планёрки (сегодняшние) — уходят, вместо них Поток
  if(typeof GAME==='undefined'||!GAME.on)return false;
  cal28();GAME.b2flow=()=>!B2.off('event');
  GAME.on('change',(name,r)=>{if(name&&ACT.indexOf(name)>=0&&ok(r))cnt('a:'+name);});
  return true;}
if(!hook()&&typeof document!=='undefined')document.addEventListener('DOMContentLoaded',hook);
// интерфейс: отчёты, словарик, финансы (обёртки в рантайме, чужие файлы не правим)
B2.on('ready',()=>{try{if(window.FIN&&FIN.openReport&&!FIN.__b2e){const f=FIN.openReport;FIN.__b2e=1;FIN.openReport=function(){cnt('u:rep');return f.apply(this,arguments);};}
  if(window.STAT&&!STAT.__b2e){STAT.__b2e=1;const e=STAT.ev,sc=STAT.screen;STAT.ev=function(n){if(n==='gl')cnt('u:gl');return e.apply(this,arguments);};
    if(sc)STAT.screen=function(t){if(t==='fin')cnt('u:fin');return sc.apply(this,arguments);};}}catch(e){}});
// движок и окна — по требованию
let F=null;const flow=()=>F||(F=B2.need('b2-event-data.js').then(()=>B2.need('b2-event-flow.js')).then(()=>B2.evF).catch(e=>{F=null;throw e;}));
EV.flow=flow;
B2.on('enter',()=>flow().catch(()=>{}));
B2.slot('today','event',ctx=>B2.evF?B2.evF.today(ctx):(flow().then(()=>{try{UI.refresh();}catch(e){}}).catch(()=>{}),''),70);
B2.slot('morning','event',ctx=>B2.evF?B2.evF.morning(ctx):'',60);
B2.click('event',(a,arg,el,ev)=>flow().then(f=>f.click(a,arg,el,ev)));
// старая «Планёрка» (meta-ui) — заменяется окном EVENT (крючок /* b2-event */ в meta-ui.js зовёт B2.evUI)
B2.evUI=(k)=>{if(B2.evF)return B2.evF.ui(k);flow().then(()=>{if(k==='open')B2.evF.ui('open');else try{UI.refresh();}catch(e){}}).catch(()=>{});return '';};
})();
