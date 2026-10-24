/* b2-st.js — ST — супер-статистика беты (поток «st», M50 «Магнат 2.0»). Договоры — шапка js/b2-core.js.
   ТОЛЬКО бета (B2.beta: /magnat-beta/ или ?beta=1 на маке/LAN) и только с DOM: в выпуске VK/Яндекса и в jsc-симуляторах файл сразу выходит —
   ни одного нового события, ни одного обработчика. Всё основное — js/b2-st-beta.js (грузится по требованию через B2.need).
   Здесь — только то, что нельзя пропустить, пока основной файл грузится: ошибки со стеком и момент загрузки страницы.
   События — B2.ev('st',…) → b2st_<имя>; список и поля — шапка js/b2-st-beta.js; разбор — ~/Projects/hobby-analytics/stat/magnat-beta.py. */
(function(){'use strict';
B2.off.st=0;          // 1 — выключено по умолчанию
if(B2.off('st'))return;
if(typeof document==='undefined'||typeof window==='undefined'||!B2.beta)return;
const Z=window.B2ST={q:[],t0:Date.now()};
// ошибки до загрузки основного файла — в очередь (основной файл отправит со стеком)
const qe=(x,k)=>{if(Z.q.length<10)Z.q.push([k,x,Date.now()]);};
Z.onErr=e=>qe(e&&(e.error||{message:e.message,stack:(e.filename||'')+':'+(e.lineno||0)+':'+(e.colno||0)}),'e');
Z.onRej=e=>qe(e&&e.reason,'p');
window.addEventListener('error',Z.onErr);
window.addEventListener('unhandledrejection',Z.onRej);
const go=()=>B2.need('b2-st-beta.js').catch(()=>{});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
