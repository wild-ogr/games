'use strict';
/* ================= язык: русский / английский =================
   Русский — исходный: тексты в коде как были. Английский:
   - строки в коде — Lg('по-русски','in English') рядом друг с другом (новый текст — сразу в оба языка);
   - таблицы данных (TW, EN, CH, BLD, ACH…) — наложение из js/en.js по ключам/индексам (langReg), русский оригинал хранится в копии;
   - статическая вёрстка index.html — атрибуты data-en (текст) и data-en-aria (aria-label).
   Выбор: VK — всегда русский. ?lang=en|ru (проверка на маке) > выбор в настройках (localStorage oborona-lang) >
   язык Яндекса (ysdk.environment.i18n.lang, после SDK) > navigator.language. ru/be/kk/uk/uz → русский, остальное → английский. */
const LANG_RU=['ru','be','kk','uk','uz'],LANG_KEY='oborona-lang';
const LANG_VK=/[?&](vk_app_id|vk)=/.test(location.search);
const LANG_Q=(/[?&]lang=(ru|en)\b/.exec(location.search)||[])[1]||'';
function normLang(l){l=String(l||'').slice(0,2).toLowerCase();return !l||LANG_RU.indexOf(l)>=0?'ru':'en';}
function langSaved(){try{const v=localStorage.getItem(LANG_KEY);return v==='ru'||v==='en'?v:'';}catch(e){return '';}}
let LANG=LANG_VK?'ru':LANG_Q||langSaved()||normLang(navigator.language||(navigator.languages||[])[0]);
const Lg=(ru,en)=>LANG==='en'?en:ru;
const isEn=()=>LANG==='en';
// слово при числе: plw(5,'монета','монеты','монет','coin','coins') → «монет» / «coins»
function plw(n,a,b,c,e1,e2){if(LANG==='en')return Math.abs(n)===1?e1:e2;const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;}
// дробные числа: «1,5» / «1.5»
function dnum(s){s=String(s);return LANG==='en'?s.replace(',','.'):s.replace('.',',');}

/* наложение данных: langReg(таблица, английское) — в js/en.js. Массив строк заменяется целиком, массив объектов — по индексу
   (или по id/k, если английское задано объектом), объект — по ключам. Функции в таблицах не трогаем. */
const LANG_DATA=[];
function langSnap(o){if(Array.isArray(o))return o.map(langSnap);if(o&&typeof o==='object'){const r={};for(const k in o)if(typeof o[k]!=='function')r[k]=langSnap(o[k]);return r;}return o;}
function langOvl(dst,src){if(!dst||!src||typeof dst!=='object')return;
  if(Array.isArray(dst)){
    if(Array.isArray(src)){if(src.length&&typeof src[0]!=='object'||!src.length&&typeof dst[0]!=='object'){dst.length=0;for(const x of src)dst.push(x);}
      else src.forEach((o,i)=>{if(o!=null&&dst[i]!=null)langOvl(dst[i],o);});}
    else for(const k in src){const i=dst.findIndex(x=>x&&(x.id===k||x.k===k));if(i>=0)langOvl(dst[i],src[k]);}
    return;}
  for(const k in src){const v=src[k];
    if(v&&typeof v==='object'&&dst[k]&&typeof dst[k]==='object')langOvl(dst[k],v);else dst[k]=v;}}
function langReg(obj,en){LANG_DATA.push([obj,en,langSnap(obj)]);if(LANG==='en')langOvl(obj,en);}
// статическая вёрстка: data-en="English" (русский запоминаем в data-ru), data-en-aria
function langDom(){for(const e of document.querySelectorAll('[data-en]')){if(e.dataset.ru==null)e.dataset.ru=e.textContent;e.textContent=LANG==='en'?e.dataset.en:e.dataset.ru;}
  for(const e of document.querySelectorAll('[data-en-aria]')){if(e.dataset.ruAria==null)e.dataset.ruAria=e.getAttribute('aria-label')||'';e.setAttribute('aria-label',LANG==='en'?e.dataset.enAria:e.dataset.ruAria);}
  document.documentElement.lang=LANG;document.title=Lg('Тридевятая оборона: защита башен','Thrice-Nine Defense: Fairy-Tale Tower Defense');}
// сменить язык: данные, вёрстка, затем перерисовка (onLang в ui.js). keep — запомнить выбор игрока
function setLang(l,keep){l=LANG_VK?'ru':l==='en'?'en':'ru';
  if(keep){try{localStorage.setItem(LANG_KEY,l);}catch(e){}}
  if(l===LANG)return;LANG=l;
  for(const [o,en,ru] of LANG_DATA)langOvl(o,LANG==='en'?en:ru);
  langDom();if(typeof onLang==='function')onLang();}
// язык площадки (Яндекс): только если игрок не выбрал сам и нет ?lang
function langFromSdk(l){if(LANG_VK||LANG_Q||langSaved()||!l)return;setLang(normLang(l));}
// общий модуль покупок (js/pay.js) пишет по-русски — переводим его строки на выходе, сам модуль не трогаем
const LANG_TOAST={'Покупка зачислена':'Purchase credited','Готово! Спасибо за покупку':'Done! Thanks for your purchase',
  'Покупка не состоялась':'Purchase failed','Покупки проверены — всё на месте':'Purchases checked — all in place',
  'Реклама сейчас недоступна, попробуй позже':'Ads are unavailable right now, try later'};
function langToast(s){return LANG==='en'&&LANG_TOAST[s]||s;}
function payHtml(ids,owned){const h=PAY.html(ids,owned);return LANG==='en'?h.replace('<h3>Покупки</h3>','<h3>Purchases</h3>').replace(/<i>куплено<\/i>/g,'<i>owned</i>'):h;}
