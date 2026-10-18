/* b2-quarry.js — QUARRY — живой «Карьер» (стартовый файл, ≤ 8 КБ). Договоры — шапка js/b2-core.js.
   Модель — js/b2-quarry-m.js (без DOM: тендеры строек, «что добываем в квартале», разведка участка; jsc — сразу, браузер — B2.need в «Сети»/«Карьере»).
   Вид — js/b2-quarry-ui.js (карточки «Сегодня», вкладки «Карьер», окна месяца, картинка разреза для Улицы; грузится там же).
   Мир: W.b2.quarry (поля — шапка b2-quarry-m.js). Устройство: S.b2q (не используется). Флаг: B2.off.quarry.
   Для других потоков: B2.quarry.qm(W) — месяц главы «Карьер» (−1 вне главы; сцены bars5/beav6 в story.js), B2.quarry.svg(W,{w,h}) — разрез карьера (HOME, Улица). */
(function(){'use strict';
B2.off.quarry=0;          // 1 — выключено по умолчанию
if(B2.off('quarry'))return;
const HAS_DOM=typeof document!=='undefined';
const API=B2.quarry={qm(W){const o=W&&W.b2&&W.b2.quarry;return W&&W.st==='quarry'&&!W.ned&&o&&o.m0!=null?W.m-o.m0:-1;},
  svg(W,o){return B2.qu&&B2.qu.svg?B2.qu.svg(W,o):(load(),'');}};
let ld=null;
function load(){if(ld)return ld;ld=B2.need('b2-quarry-m.js').then(()=>HAS_DOM?B2.need('b2-quarry-ui.js'):null)
  .then(()=>{if(HAS_DOM&&window.UI&&UI.refresh)try{UI.refresh();}catch(e){}}).catch(()=>{ld=null;});return ld;}
const want=W=>!!W&&!W.ned&&(W.st==='mid'||W.st==='quarry');
if(!HAS_DOM)load();   // симуляторы: модель нужна с первого дня (глава «Карьер» наступает без migrate)
B2.mig('quarry',W=>{if(want(W))load();});
if(HAS_DOM&&window.GAME&&GAME.on)GAME.on('change',()=>{if(!ld&&want(GAME.W))load();});
// гнёзда: пока вид не загружен — пусто (каркас перерисует после загрузки)
const ui=(k,ctx)=>B2.qu&&B2.qu[k]?B2.qu[k](ctx):'';
B2.slot('today','quarry',ctx=>ui('today',ctx),70);
B2.slot('close','quarry',ctx=>ui('close',ctx),60);
B2.slot('pit','quarry',ctx=>ui('pit',ctx),50);
B2.click('quarry',(a,arg,el,ev)=>{if(B2.qu&&B2.qu.click)B2.qu.click(a,arg,el,ev);});
// миссии VK (договор VKT): тендер выигран, участок разведан, продукт выбран под спрос квартала
const qo=()=>{const W=typeof GAME!=='undefined'&&GAME.W;return W&&W.b2&&W.b2.quarry||{};};
B2.vkm('quarry',[{id:'qu_tend',p:10,ok:()=>(qo().tw|0)>=1},{id:'qu_drill',ok:()=>!!qo().d},{id:'qu_mix',ok:()=>(qo().mh|0)>=1}]);
API.load=load;
if(B2.street&&B2.street.scene)B2.street.scene('quarry',c=>c.ch==='quarry'&&(c.W.biz||[]).some(b=>b.st==='w'&&ECON.PITS.indexOf(b.t)>=0)?API.svg(c.W,{w:c.w,h:c.h})||null:null,60);   /* b2-merge: Улица в гл.4 — разрез своего карьера QUARRY (карьера ещё нет или вид не загружен — сцена HOME) */
})();
