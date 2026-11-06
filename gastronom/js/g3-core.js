'use strict';
/* ================= g3-core — каркас «Гастроном 3.0, волна 1 — Смена у тёти Вали» (06.11.2026, ветка g3w1) =================
   План — hobby-analytics/release-i/boost3-gastronom/REVIEW-1106/PLAN-3.0.md, журнал — boost3-gastronom/G3W1/LEAD.md.
   Грузится сразу после js/gb-core.js (data-gb — не обязательный: не загрузился → window.G3 нет, игра как v14.9).

   ФЛАГИ: G3.on() — вся волна; G3.on('combo') — часть. Части: combo vybr pila pochti novo nb utro vitr regs home win int petr vis.
     Выключить: ?off=g3 (всё) / ?off=g3.combo,g3.pila / localStorage 'g3-off' = 'g3' | 'g3.combo,g3.pila' / window.G3_OFF={combo:1}.
     На <html> класс g3 (или g3-off) — для CSS: html.g3 …
   ОТКРЫТИЕ ПО ДНЯМ (план 4.3): G3.open(part) → bool — часть включена И уже открылась этому игроку.
     Новичок (S.g3.nw=1, пришёл уже в 3.0): combo д1; utro д2; vitr д3; pila/pochti д3 (и только после 10-го уровня); vybr с 6-го уровня.
     Старый (nw=2): д1 combo+vybr, д2 utro, д3 vitr, д4 pila+pochti. «День» — номер ДНЯ ЗАХОДА в 3.0 (S.g3.n — разных дней).
   STAT: G3.mark(part[, a, extra]) → STAT.ev('mod',{m:'g3.'+part, a}) (a по умолчанию 'on'; 'on' — раз за сеанс).
   СОХРАНЕНИЕ: S.g3 {d0 первый день 3.0, n дней захода, last день, nw 1|2} — GB.onSave 'g3'.
*/
(function(){
var PARTS=['combo','vybr','pila','pochti','novo','nb','rev','utro','vitr','regs','home','win','int','petr','vis'];
var off={},all=false;
function addOff(s){String(s||'').split(/[,;\s]+/).forEach(function(k){if(!k)return;if(k==='g3')all=true;else if(k.indexOf('g3.')===0)off[k.slice(3)]=1;});}
try{var m=/[?&]off=([^&#]*)/.exec(location.search);if(m)addOff(decodeURIComponent(m[1]));}catch(e){}
try{addOff(localStorage.getItem('g3-off'));}catch(e){}
try{if(window.G3_OFF){if(G3_OFF===1||G3_OFF.all)all=true;for(var k in G3_OFF)off[k]=1;}}catch(e){}
var G3=window.G3={v:1,PARTS:PARTS,off:off,all:all,_mk:{}};
G3.on=function(p){if(all)return false;if(!p)return true;p=String(p).replace(/^g3\./,'');return !off[p];};
try{document.documentElement.classList.add(all?'g3-off':'g3');}catch(e){}

function S_(){try{return typeof S!=='undefined'&&S?S:null;}catch(e){return null;}}
function dk(){try{return dayKey(0);}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
G3.today=dk;
function num(v){v=+v;return isFinite(v)&&v>0?v:0;}
function fix(s){if(!s.g3||typeof s.g3!=='object'||Array.isArray(s.g3))s.g3={};var g=s.g3;g.d0=num(g.d0);g.n=num(g.n);g.last=num(g.last);g.nw=num(g.nw);}
G3.fix=fix;
function merge(s,d){fix(s);if(!d||!d.g3||typeof d.g3!=='object')return;var a=s.g3,b=d.g3;
  if(num(b.d0)&&(!a.d0||num(b.d0)<a.d0))a.d0=num(b.d0);a.n=Math.max(a.n,num(b.n));a.last=Math.max(a.last,num(b.last));a.nw=Math.max(a.nw,num(b.nw));
  /* свои поля частей (g3 модули кладут сюда же): числа — максимум, остальное — с устройства, если нет */
  for(var k in b){if(k==='d0'||k==='n'||k==='last'||k==='nw')continue;if(a[k]===undefined)a[k]=b[k];else if(typeof a[k]==='number'&&typeof b[k]==='number')a[k]=Math.max(a[k],b[k]);}}
if(window.GB&&GB.onSave)GB.onSave({id:'g3',keys:['g3'],fix:fix,merge:merge});
G3.st=function(){var s=S_();if(!s)return null;fix(s);return s.g3;};
/* учёт дня захода: зовётся при готовности и при каждом возврате на главный (переход через полночь) */
G3.tick=function(){var s=S_();if(!s||all)return;fix(s);var g=s.g3,t=dk();
  if(!g.nw)g.nw=(s.levelsDone||0)>0||(s.unlocked||1)>1?2:1;
  if(!g.d0)g.d0=t;if(g.last!==t){g.last=t;g.n=(g.n||0)+1;try{save();}catch(e){}}};
G3.day=function(){var g=G3.st();return g&&g.n?g.n:1;};
G3.isNew=function(){var g=G3.st();return !!(g&&g.nw===1);};
G3.lvDone=function(){var s=S_();return s?(s.levelsDone||0):0;};
/* когда часть открывается: [день новичка, день старого] */
var OPEN={combo:[1,1],vybr:[1,1],utro:[2,2],vitr:[3,3],pila:[3,4],pochti:[3,4],regs:[3,3]};
G3.open=function(p){if(!G3.on(p))return false;var o=OPEN[p];if(!o)return true;
  if(window.__demo)return true;
  try{var u=/[?&]g3day=(\d+)/.exec(location.search);if(u)return +u[1]>=o[G3.isNew()?0:1];}catch(e){}
  return G3.day()>=o[G3.isNew()?0:1];};
G3.mark=function(p,a,x){a=a||'on';if(a==='on'){if(G3._mk[p])return;G3._mk[p]=1;}
  try{var e={m:'g3.'+p,a:a};if(x)for(var k in x)e[k]=x[k];STAT.ev('mod',e);}catch(e){}};
G3.L=function(r,e){try{return typeof L==='function'?L(r,e):r;}catch(x){return r;}};
G3.pick=function(a){return a[Math.floor(Math.random()*a.length)];};
/* сеанс: первый заход (для «первый заход — без окон») */
G3.ses=function(){var s=S_();try{return s&&s.soc&&+s.soc.ses||1;}catch(e){return 1;}};
if(window.GB){GB.on('ready',function(){G3.tick();});GB.on('home',function(){G3.tick();});}
})();
