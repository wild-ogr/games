'use strict';
/* ================= язык: русский (исходный) и английский (v18, 27.09) =================
   Как устроено:
   • Строки интерфейса — прямо в коде парами: L('Русский','English'). Числа — склейкой или шаблоном `${}` в обеих половинах.
     Множественное число — plu(n,'монета','монеты','монет','coin','coins') (слово без числа).
   • Тексты таблиц data.js (богатыри, оружие, нечисть, главы, задания, достижения, реплики, книга…) — английское наложение
     по id в js/en.js (I18N_EN). Русский в data.js не трогаем: trData() запоминает русский оригинал, applyLang() ставит нужный.
   • ПРАВИЛО: новый текст — сразу на двух языках (L(...) или поле в js/en.js). Проверка: ?lang=en&i18ncheck — в консоли
     список полей data.js без перевода; tools/i18n-scan.py — кириллица в коде вне L(…)/комментариев.
   Язык: VK — всегда русский. Иначе: выбор игрока в настройках (localStorage «bogatyr-lang») → язык Яндекса
   (ysdk.environment.i18n.lang, приходит после SDK — langFromSDK) → до SDK: ?lang= в адресе, navigator.language.
   ru/be/kk/uk/uz → русский, всё остальное → английский. На маке (localhost) ?lang=en|ru главнее сохранённого выбора. */
const LANG_RU=['ru','be','kk','uk','uz'];
const LANG_VK=/[?&](vk_app_id|vk)=/.test(location.search); // то же условие, что PLAT==='vk' в core.js
const LANG_Q=(/[?&]lang=([a-zA-Z-]+)/.exec(location.search)||[])[1]||'';
const LANG_LOCAL=location.protocol==='file:'||/^(localhost|127\.0\.0\.1|\[::1\]|.*\.local|.*\.localhost)$/.test(location.hostname);
function langNorm(l){l=String(l||'').slice(0,2).toLowerCase();return !l?'ru':LANG_RU.indexOf(l)>=0?'ru':'en';}
function langSaved(){try{const v=localStorage.getItem('bogatyr-lang');return v==='ru'||v==='en'?v:'';}catch(e){return '';}}
let LANG=LANG_VK?'ru':(LANG_LOCAL&&LANG_Q)?langNorm(LANG_Q):langSaved()||langNorm(LANG_Q||navigator.language||'ru');
function L(ru,en){return LANG==='en'?en:ru;}
// множественное число: русское (1 монета / 2 монеты / 5 монет) и английское (1 coin / 2 coins); возвращает слово без числа
function plu(n,r1,r2,r5,e1,eN){n=Math.abs(Math.floor(+n||0));if(LANG==='en')return n===1?e1:eN;
  const a=n%10,b=n%100;return a===1&&b!==11?r1:a>=2&&a<=4&&(b<12||b>14)?r2:r5;}
// название в кавычках: «…» / “…”
function qt(s){return LANG==='en'?'“'+s+'”':'«'+s+'»';}
// «N золота» / «N gold» — самое частое
function goldW(n){return L(' золота',' gold');}
/* ---------- наложение текстов таблиц (js/en.js) ---------- */
const I18D=[]; // [объект, поле, русский, английский]
function trField(o,k,en){if(o&&en!=null&&typeof o[k]!=='function')I18D.push([o,k,o[k],en]);}
// src — кусок I18N_EN: строка → поле; массив строк → поле целиком; объект → внутрь (у массивов объектов ключ — id или номер)
function trData(dst,src){if(!dst||!src)return;
  for(const k in src){const s=src[k];
    if(Array.isArray(dst)&&typeof s==='object'&&s&&!Array.isArray(s)&&!/^\d+$/.test(k)){ // массив объектов с id: все с этим id (праздничные облики есть у каждого богатыря)
      for(const el of dst)if(el&&el.id===k)trData(el,s);continue;}
    if(typeof s==='string'||(Array.isArray(s)&&(s.length===0||typeof s[0]==='string')))trField(dst,k,s);
    else if(Array.isArray(s)){for(let i=0;i<s.length;i++)if(s[i]&&dst[k])trData(dst[k][i],s[i]);}
    else if(s&&typeof s==='object')trData(dst[k],s);}}
function applyLang(){for(const [o,k,ru,en] of I18D)o[k]=LANG==='en'?en:ru;
  try{document.documentElement.lang=LANG;document.title=L('Богатырь против нечисти','Bogatyr vs the Dark Folk');
    document.querySelectorAll('[data-en]').forEach(e=>{if(e.dataset.ru==null)e.dataset.ru=e.innerHTML;e.innerHTML=LANG==='en'?e.dataset.en:e.dataset.ru;});
    document.querySelectorAll('[data-en-aria]').forEach(e=>{if(e.dataset.ruAria==null)e.dataset.ruAria=e.getAttribute('aria-label')||'';e.setAttribute('aria-label',LANG==='en'?e.dataset.enAria:e.dataset.ruAria);});
  }catch(e){}}
// смена языка: из настроек (save=true — запомнить выбор) или от SDK. Перерисовку делает langRedraw() в ui.js
function setLang(l,save){l=l==='en'?'en':'ru';if(LANG_VK)l='ru';
  if(save){try{localStorage.setItem('bogatyr-lang',l);}catch(e){}}
  if(l===LANG)return false;LANG=l;applyLang();if(typeof langRedraw==='function')try{langRedraw();}catch(e){}return true;}
// язык Яндекса после YaGames.init(): главнее догадки, но не выбора игрока (и не ?lang= на маке)
function langFromSDK(l){if(LANG_VK||langSaved()||(LANG_LOCAL&&LANG_Q)||!l)return;setLang(langNorm(l));}
// проверка перевода: ?i18ncheck — поля таблиц без английского
function i18nCheck(tables){const miss=[];const seen=new Set(I18D.map(x=>x[0]));
  const walk=(o,p)=>{if(!o||typeof o!=='object')return;
    for(const k in o){const v=o[k];if(typeof v==='string'&&/[А-Яа-яЁё]/.test(v)&&!(seen.has(o)&&I18D.some(x=>x[0]===o&&x[1]===k)))miss.push(p+'.'+k+' = '+v);
      else if(Array.isArray(v)&&v.length&&typeof v[0]==='string'&&v.some(s=>/[А-Яа-яЁё]/.test(s))){if(!I18D.some(x=>x[0]===o&&x[1]===k))miss.push(p+'.'+k+' = ['+v[0]+'…]');}
      else if(v&&typeof v==='object')walk(v,p+'.'+k);}};
  for(const n in tables)walk(tables[n],n);return miss;}
applyLang(); // статичные надписи index.html (data-en) — сразу, до загрузки остальных скриптов
