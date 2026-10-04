'use strict';
/* ================= утилиты ================= */
const $=id=>document.getElementById(id);
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a,b)=>a+Math.random()*(b-a);
const randi=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash(x,y,s){let h=(x*374761393+y*668265263+s*982451653)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
// a>0 — светлее, a<0 — темнее
function shade(hex,a){let n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;
  if(a>0){r+=(255-r)*a;g+=(255-g)*a;b+=(255-b)*a;}else{r*=1+a;g*=1+a;b*=1+a;}
  return 'rgb('+(r|0)+','+(g|0)+','+(b|0)+')';}
function rgba(hex,al){const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+al+')';}
function fmtNum(n){return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g,LANG==='en'?',':' ');}
function fmtGold(n){n=Math.floor(n);return fmtNum(n)+' '+plw(n,'золотой','золотых','золотых','gold','gold');}
function coinsTxt(n){return n+' '+plw(n,'монета','монеты','монет','coin','coins');}
function plural(n,a,b,c){const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;}
/* время: у Яндекса — серверное (ysdk.serverTime), иначе часы устройства. Переводом часов не получить заново задание дня,
   награду за вход, испытание дня и не попасть в таблицу недели «из будущего» (аудит 14) */
function nowMs(){try{if(typeof ysdk!=='undefined'&&ysdk&&ysdk.serverTime){const t=+ysdk.serverTime();if(t>1e12)return t;}}catch(e){}return Date.now();}
function dayKey(t){const d=new Date(t||nowMs());return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function withTimeout(p,ms){return Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms))]);}
const BOOT_T=Date.now();
// «спокойный режим»: без тряски и пульсаций, если так просит система
const REDUCED=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ================= сохранение ================= */
const SKEY='oborona-v1';
const SHOT=/[?&]shot/.test(location.search);
function freshSave(){return {v:1,ts:0,gold:0,stars:{},forge:{},village:{},afkT:0,afkBoost:null,sound:1,music:1,shake:REDUCED?0:1,
  boost:900,boostDay:'',endBest:0,endRuns:0,runs:0,wins:0,kills:0,seen:{},introSeen:{},tut:0,lastCh:0,gift:0,lose:{},
  dq:null,login:null,ret:{},diff:1,crown:{},bk:{},ach:{},wk:null,dch:null,dchN:0,skins:{},skin:{},deco:{},bns:{},bn:'',bnSet:0,goal:'',th:''};}
// поля-объекты могли прийти битыми (ручная правка, старая версия) — чиним
function fixSave(){for(const k of['stars','forge','village','seen','introSeen','lose','ret','crown','bk','ach','skins','skin','deco','bns'])if(!S[k]||typeof S[k]!=='object'||Array.isArray(S[k]))S[k]={};
  if(!S.afkT)S.afkT=Date.now();if(S.boost==null||isNaN(S.boost))S.boost=900;if(S.shake==null)S.shake=REDUCED?0:1;
  if(S.payT!=null&&!Array.isArray(S.payT))S.payT=[];if(S.payV!=null&&!Array.isArray(S.payV))S.payV=[];
  if(typeof S.th!=='string')S.th='';}   // look1: выбранная тема оформления ('' — основная)
let S=freshSave();
try{const r=!SHOT&&localStorage.getItem(SKEY);if(r){const o=JSON.parse(r);if(o&&typeof o==='object'&&!Array.isArray(o))S=Object.assign(S,o);}}catch(e){}
fixSave();
// что было на устройстве при запуске — с этим сравниваем облако (а не с текущим S.ts: иначе первый же save() до прихода облака его «перебьёт»)
const BOOT={ts:S.ts||0,gold:S.gold||0,boost:S.boost!=null?S.boost:900};
/* облако: пишем только после того, как прочитали его (cloudLoaded) и свели (cloudPending пуст);
   не чаще раза в 5 с у Яндекса (лимит — 100 запросов за 5 минут) и раз в 15 с у VK; при сворачивании — сразу */
let cloudLoaded=false,cloudPending=null,cloudT=0,cloudLast=0,cloudDirty=false;
// VK пишет всё сохранение кусками (5–6 вызовов) — в бою не чаще раза в минуту, в меню — раз в 15 с; при сворачивании — сразу
function cloudGap(){return PLAT==='vk'?(typeof G!=='undefined'&&G&&!G.over?60000:15000):5000;}
function save(){if(SHOT)return;S.ts=Date.now();try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}
  cloudDirty=true;if(!cloudLoaded||cloudPending||cloudT)return;
  cloudT=setTimeout(()=>{cloudT=0;cloudSave();},Math.max(3000,cloudLast+cloudGap()-Date.now()));}
function cloudFlush(){if(cloudT){clearTimeout(cloudT);cloudT=0;}if(cloudDirty)cloudSave(true);}
function cloudSave(flush){if(!cloudLoaded||cloudPending||SHOT)return;cloudLast=Date.now();cloudDirty=false;
  try{if(YP)YP.setData(S,!!flush).catch(()=>{cloudDirty=true;});else if(PLAT==='vk'&&VK)vkSaveCloud();}catch(e){cloudDirty=true;}}
/* слияние облака d с сохранением L. Звёзды, кузница, деревня, «виденное», счётчики — по максимуму/объединению всегда.
   newer (облако новее запуска): основа — облако, золото и ускорение = облако + заработанное тут с запуска;
   иначе основа — своё (облако старое: только добираем из него прогресс) */
function mergeProgress(d,L,newer){const base=newer?d:L,other=newer?L:d;const o=Object.assign(freshSave(),JSON.parse(JSON.stringify(base)));
  const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
  const mx=(a,b)=>{for(const k in b)a[k]=Math.max(+a[k]||0,+b[k]||0);};
  o.stars=obj(o.stars);mx(o.stars,obj(other.stars));o.village=obj(o.village);mx(o.village,obj(other.village));
  o.crown=obj(o.crown);mx(o.crown,obj(other.crown));o.bk=obj(o.bk);mx(o.bk,obj(other.bk));
  // облики и украшения: купленное — объединение; надетый облик — из основы, недостающее — из другого
  o.skins=obj(o.skins);mx(o.skins,obj(other.skins));o.deco=obj(o.deco);mx(o.deco,obj(other.deco));o.skin=Object.assign({},obj(other.skin),obj(o.skin));
  o.bns=obj(o.bns);mx(o.bns,obj(other.bns));o.bnSet=Math.max(+o.bnSet||0,+other.bnSet||0);if(!o.bn)o.bn=other.bn||'';if(!o.th)o.th=typeof other.th==='string'?other.th:'';   // знамёна: купленное — объединение
  // кузница: берём целиком ту сторону, где её меняли позже (S.forgeT) — иначе сброс на одном устройстве откатывался бы облаком;
  // у старых сохранений без отметки — объединение, как раньше
  const fa=+o.forgeT||0,fb=+other.forgeT||0;
  if(fa!==fb){if(fb>fa){o.forge=JSON.parse(JSON.stringify(obj(other.forge)));o.forgeT=fb;}}
  else{o.forge=obj(o.forge);const of=obj(other.forge);for(const k in of){const a=o.forge[k],b=of[k];
    if(typeof b==='object'||typeof a==='object'){const ao=typeof a==='object'?obj(a):{},bo=typeof b==='object'?obj(b):{};o.forge[k]=Object.assign({},ao,bo);}else o.forge[k]=Math.max(+a||0,+b||0);}}
  for(const k of['seen','bossKill','introSeen','ret','ach'])o[k]=Object.assign({},obj(o[k]),obj(other[k]));
  for(const k of['endBest','endRuns','runs','wins','kills','tut','lastCh','dchN','wkN','bestTw'])o[k]=Math.max(+o[k]||0,+other[k]||0);
  // Босс недели и испытание дня: свежая неделя/день побеждает, в ту же — лучшее из двух
  const wa=obj(o.wk),wb=obj(other.wk);if((+wb.w||0)>(+wa.w||0))o.wk=wb;else if(wa.w&&wa.w===wb.w)o.wk={w:wa.w,best:Math.max(+wa.best||0,+wb.best||0),got:Math.max(+wa.got||0,+wb.got||0),runs:Math.max(+wa.runs||0,+wb.runs||0)};
  const da=obj(o.dch),dd=obj(other.dch);if(dd.day&&(!da.day||dd.day>da.day))o.dch=dd;else if(da.day&&da.day===dd.day)o.dch=Object.assign({},da,{res:Math.max(+da.res||0,+dd.res||0),tried:Math.max(+da.tried||0,+dd.tried||0)});
  SOC.merge(d.soc);o.soc=L.soc; // соц-предложения VK: модуль держит ссылку на старый объект S.soc — сливаем в него и оставляем его
  if(typeof payMerge==='function'){payMerge(L,o);payMerge(d,o);} // покупки (js/pay.js): купленное — объединение
  if(newer){const db=d.boost!=null?d.boost:900;
    o.gold=Math.max(0,(+d.gold||0)+((+L.gold||0)-BOOT.gold));o.boost=Math.min(7200,Math.max(0,db+((L.boost!=null?L.boost:900)-BOOT.boost)));}
  return o;}
function cloudMerge(d){if(!d||typeof d!=='object'||Array.isArray(d))return false;const newer=(+d.ts||0)>BOOT.ts;
  try{S=mergeProgress(d,S,newer);fixSave();}catch(e){return false;}
  try{STAT_O.S=S;STAT.merge(d.stc);}catch(e){} // статистика: отметки (день установки, число сеансов) — раньше/больше, в новый S
  if(newer){BOOT.ts=+d.ts;BOOT.gold=+d.gold||0;BOOT.boost=d.boost!=null?d.boost:900;}
  return true;}
// облако прочитано: посреди боя только запоминаем (в облако до сведения не пишем), иначе сводим сразу.
// Сводим и когда бой уже кончился (экран итогов), и в начале следующего боя (newBattle зовёт cloudApply(true)):
// серия «Ещё раз» без выхода в меню не блокирует запись в облако (аудит 14)
function cloudIn(d){cloudLoaded=true;if(d&&typeof d==='object'){cloudPending=d;cloudApply();}else save();}
function cloudApply(start){if(!cloudPending||(!start&&typeof G!=='undefined'&&G&&!G.over))return;const d=cloudPending;cloudPending=null;
  if(cloudMerge(d)){S.ts=Date.now();try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}cloudDirty=true;cloudSave();if(typeof onSaveMerged==='function')onSaveMerged();}}

/* ================= площадка: Яндекс Игры или VK ================= */
// VK передаёт в адрес игры параметры запуска (vk_app_id и др.); ?vk=1 — проверка VK-режима на маке
const PLAT=/[?&](vk_app_id|vk)=/.test(location.search)?'vk':'yandex';
let ysdk=null,YP=null,VK=null,paused=false,muted=false;
/*STAT*/
/* ===== STAT v1 (29.09.2026; 03.10 — тесты с мака/LAN/webdriver не шлются): своя ОБЕЗЛИЧЕННАЯ статистика — общий модуль всех игр =====
   Источник — ~/Projects/hobby-analytics/stat/stat.js (правки только тут, в игры — stat-sync.sh). Проект — hobby-analytics/37-own-analytics.md.
   Что НЕ отправляем никогда: vk_user_id и любые параметры адреса запуска (кроме vk_platform и vk_ref), имя, IP (сервер его не пишет),
   постоянный номер устройства/игрока. Единственный «ключ» — случайная строка СЕАНСА (живёт только в памяти, до закрытия игры).
   На устройстве (localStorage 'stat-<игра>') — только день установки, число сеансов и день последней отметки «зашёл сегодня».
   Возвраты по дням считаем без номера игрока: раз в календарный день игра шлёт 'day' с dn = дней с установки.
   Отправка — пачкой: раз в FLUSH секунд (если есть события), при сворачивании (sendBeacon) и когда накопилось MAXQ.
   text/plain без своих заголовков → «простой» запрос без CORS-предзапроса; ответ не читаем. Не отправилось — лежит до следующего раза.
   Старый синтаксис: только var/function, без стрелок, optional chaining, nullish, шаблонных строк. */
var STAT=(function(){
  var V=1,FLUSH=90,MAXQ=40,MAXB=60,KEEP=4,SESS_GAP=30*60e3,MAXERR=5;
  var O={},on=false,dev=false,G='',Q=[],pend=[],sk='',seq=0,t0=0,act=0,actT=0,vis=true,hideT=0,timer=0,
      st={c:0,n:0,d:0},hdr={},lvl=null,scr='',errN=0,errSeen={},once={},lastErr='';
  function nop(){}
  function ls(k,v){try{if(v===undefined)return window.localStorage.getItem(k);if(v===null)window.localStorage.removeItem(k);else window.localStorage.setItem(k,v);}catch(e){}return null;}
  function jp(s){try{return s?JSON.parse(s):null;}catch(e){return null;}}
  function now(){var t=0;try{t=O.now?O.now():0;}catch(e){}return typeof t==='number'&&t>1.6e12?t:Date.now();}
  function dk(t){var d=new Date(t);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
  function dms(k){return Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100);}
  function ddiff(a,b){return Math.round((dms(b)-dms(a))/864e5);}
  function rnd(){var s='',i;for(i=0;i<3;i++)s+=('0000'+Math.floor(Math.random()*1679616).toString(36)).slice(-4);return s;}
  function qp(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);try{return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}
  function sec(){return Math.round((Date.now()-t0)/100)/10;}
  function actSec(){return Math.round((act+(vis?Date.now()-actT:0))/1000);}
  // чистка: без длинных чисел (вдруг id), без адресов с параметрами, короткие строки, не больше 8 полей
  function scrub(s,n){s=String(s).replace(/[?&#][\w.\-]+=[^\s&#)'"]*/g,'').replace(/(https?:\/\/[^\s?#)'"]*)[?#][^\s)'"]*/g,'$1').replace(/https?:\/\/[^\/\s)'"]+/g,'').replace(/\d{7,}/g,'#');return s.slice(0,n||40);}
  function clean(p){var o={},n=0,k,v;if(!p||typeof p!=='object')return o;
    for(k in p){if(!p.hasOwnProperty(k)||n>=8)continue;v=p[k];
      if(typeof v==='number'){if(!isFinite(v))continue;v=Math.round(v*100)/100;}
      else if(typeof v==='boolean')v=v?1:0;else if(typeof v==='string')v=scrub(v);else continue;
      o[String(k).slice(0,12)]=v;n++;}return o;}
  function device(){var ua=navigator.userAgent||'',w=Math.round(window.innerWidth||0),h=Math.round(window.innerHeight||0),
      os=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)?'ios':/Android/.test(ua)?'android':/Windows/.test(ua)?'win':/Mac OS X/.test(ua)?'mac':/Linux|CrOS/.test(ua)?'linux':'other',
      touch=('ontouchstart' in window)||navigator.maxTouchPoints>0,m=Math.min(w,h);
    var cv=/Chrome\/(\d+)/.exec(ua),sv=/Version\/(\d+)[.\d]* (Mobile\/\S+ )?Safari/.exec(ua);
    return {os:os,dv:touch?(m<600?'m':'t'):'d',sw:Math.round(w/20)*20,sh:Math.round(h/20)*20,
      wv:/; wv\)|VKAndroidApp|com\.vkontakte/.test(ua)||(os==='ios'&&!/Safari\//.test(ua))?1:0,
      br:cv?'c'+cv[1]:sv?'s'+sv[1]:/Firefox\/(\d+)/.test(ua)?'f'+/Firefox\/(\d+)/.exec(ua)[1]:'?'};}
  function saveSt(){if(O.S){O.S.stc={c:st.c,n:st.n,d:st.d};}ls('stat-'+G,JSON.stringify(st));}

  /* STAT.init({g:'gastronom', gv:'v16', plat:PLAT, lang:LANG, url:STAT_URL, now:nowMs, S:S, rate:1})
     g — короткое имя игры (как папка), gv — версия игры, url — адрес приёмника из конфига игры.
     url ПУСТОЙ → модуль полностью молчит: ни запросов, ни обработчиков, ни журнала (можно встроить заранее, адрес вписать потом).
       Локально считаются только день установки и число сеансов — чтобы после включения возвраты считались от настоящей установки.
     dev:true (или ?stat=dev на localhost) без url — журнал в консоль и window.__stat, без отправки (стенд, мак).
     S — если передать, отметки живут ещё и в сохранении игры (S.stc) → облако, меньше «ложных новичков». */
  var first=false,hooked=false,cut='';
  /* A1 (03.10): НАШИ ТЕСТЫ — не в боевую базу. Боевой адрес обнуляется (модуль молчит, как с пустым url), если игра открыта
     автоматом (navigator.webdriver или HeadlessChrome в User-Agent: CDP-прогоны) или с мака/локальной сети: localhost, 127.*, [::1], *.localhost,
     *.local, *.test, 192.168.*, 10.*, 172.16–31.*, file://. Адрес на сам localhost/LAN или относительный (?stat=sink, стенд) не трогаем.
     ?stat=dev на localhost — журнал в консоль, как раньше. Почему молчим — STAT._dbg().cut ('wd'|'local'|'file').
     Площадка 'yandex' на нашем сайте *.github.io (там нет SDK Яндекса: бета, прямые ссылки) пишется как p:'web'. */
  function locH(h){return /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|)$|\.localhost$|\.local$|\.test$|^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(String(h||''));}
  function locU(u){var m=/^https?:\/\/(\[[^\]]*\]|[^\/:?#]+)/i.exec(u);return !!m&&locH(m[1]);}
  function init(o){O=o||{};O.url=String(O.url||'');G=String(O.g||'game').slice(0,16);t0=Date.now();actT=t0;
    cut='';if(/^https?:/i.test(O.url)&&!locU(O.url)){var wd=false;try{wd=navigator.webdriver===true||/HeadlessChrome|PhantomJS|Puppeteer|Playwright/.test(navigator.userAgent||'');}catch(e){}
      cut=wd?'wd':location.protocol==='file:'?'file':locH(location.hostname)?'local':'';if(cut)O.url='';}
    dev=!O.url&&(O.dev===true||(/[?&]stat=dev/.test(location.search)&&/^(localhost|127\.0\.0\.1|\[::1\])$|\.localhost$|\.test$/.test(location.hostname)));
    var s=jp(ls('stat-'+G))||{},c=O.S&&O.S.stc||{};
    st={c:+s.c||+c.c||0,n:Math.max(+s.n||0,+c.n||0),d:Math.max(+s.d||0,+c.d||0)};
    var today=dk(now());first=!st.c;if(first)st.c=today;st.n++;
    if(!O.url&&!dev){on=false;saveSt();return;}          // адреса нет — молчим
    if(!enabled()||Math.random()>=(typeof O.rate==='number'?O.rate:1)){on=false;ls('stat-q-'+G,null);saveSt();return;}
    start();}
  function start(){var d=device();on=true;sk=rnd();seq=0;
    hdr={v:V,g:G,gv:String(O.gv||'').slice(0,12),p:String(O.plat==='yandex'&&/\.github\.io$/.test(location.hostname)?'web':O.plat||'').slice(0,8),l:String(O.lang||'').slice(0,4),
      vp:scrub(qp('vk_platform'),16),src:scrub(qp('vk_ref'),32),os:d.os,dv:d.dv,wv:d.wv,br:d.br,sw:d.sw,sh:d.sh,sk:sk};
    pend=jp(ls('stat-q-'+G))||[];if(!(pend instanceof Array))pend=[];
    ev('start',{sn:st.n,f:first?1:0,ld:Math.round(window.performance&&performance.now?performance.now():0)});
    dayMark();saveSt();
    if(!hooked){hooked=true;
      window.addEventListener('error',function(e){var x=e&&e.target;if(x&&x!==window&&x.tagName){var u=x.src||x.href||'';if(/\/sdk\.js([?#]|$)/.test(u)&&hdr.p!=='yandex')return;err('load '+String(x.tagName).toLowerCase(),u);return;} // не загрузилась картинка/скрипт: без message; SDK Яндекса вне Яндекса (сайт, VK) — не ошибка (03.10)
        err(e&&e.message,e&&e.filename,e&&e.lineno,e&&e.colno);},true);
      window.addEventListener('unhandledrejection',function(e){var r=e&&e.reason;err('promise: '+(r&&r.message||r),r&&r.stack?String(r.stack).split('\n')[1]:'');});
      document.addEventListener('visibilitychange',function(){document.visibilityState==='hidden'?hide():show();});
      window.addEventListener('pagehide',hide);
      timer=setInterval(function(){if(on&&vis&&Q.length)flush();},FLUSH*1000);}
    setTimeout(flush,5000); // старое неотправленное + первые шаги — быстро (воронка первой минуты)
  }
  // «зашёл сегодня» — раз в календарный день, dn = дней с установки (по дню устройства/сервера игры)
  function dayMark(){var t=dk(now());if(st.d===t)return;st.d=t;ev('day',{dn:Math.max(0,ddiff(st.c,t)),sn:st.n});saveSt();}
  function ev(n,p){if(!on)return;var e=[String(n).slice(0,16),sec(),clean(p)];Q.push(e);
    if(dev){try{(window.__stat=window.__stat||[]).push(e);if(window.console)console.log('[STAT]',e[0],JSON.stringify(e[2]));}catch(x){}}
    if(Q.length>=MAXQ)flush();}
  function onceEv(n,p){if(once[n])return;once[n]=1;ev(n,p);}

  // --- уровни: STAT.lvl(5,'daily') в начале, STAT.use('hint') по ходу, STAT.end('win',{st:3}) в конце ---
  function lvlStart(l,m){if(lvl)lvlEnd('quit');lvl={l:l,m:m||'',t:Date.now(),h:0,u:0,x:{}};var p={l:l};if(m)p.m=m;ev('lvl',p);}
  function use(k,n){if(lvl){if(k==='hint')lvl.h+=n||1;else if(k==='undo')lvl.u+=n||1;else lvl.x[k]=(lvl.x[k]||0)+(n||1);}}
  function lvlEnd(r,p){if(!lvl)return;var o={l:lvl.l,r:r,s:Math.round((Date.now()-lvl.t)/1000)},k;if(lvl.m)o.m=lvl.m;if(lvl.h)o.h=lvl.h;if(lvl.u)o.u=lvl.u;
    for(k in p||{})if(p.hasOwnProperty(k))o[k]=p[k];lvl=null;ev('end',o);}
  function screen(n){if(n===scr)return;scr=String(n).slice(0,16);if(!once['s_'+scr]){once['s_'+scr]=1;ev('scr',{n:scr});}}

  // --- реклама: STAT.place('hint') ПЕРЕД showRewarded; внутри showRewarded — STAT.ad('rew','ok'|'skip'|'fail'|'err', код) ---
  var place='';
  function setPlace(p){place=String(p||'').slice(0,16);}
  function ad(f,r,code){var p={f:f,r:r,p:f==='int'?'int':(place||'?')};if(code!==undefined&&code!==null&&code!=='')p.c=scrub(code,24);ev('ad',p);if(f!=='int')place='';}
  function offer(p){onceEv('of_'+p,{p:p});} // кнопка «за рекламу» ПОКАЗАНА (раз за сеанс на место)

  // --- ошибки JS: не больше MAXERR разных за сеанс, без адресов с параметрами (в них vk_user_id!) ---
  function err(m,src,ln,col){if(!on||errN>=MAXERR)return;m=scrub(m||'?',120);src=scrub(String(src||'').replace(/[?#].*$/,'').replace(/^.*\//,''),40)+(ln?':'+ln+(col?':'+col:''):'');
    var k=m+'|'+src;if(errSeen[k])return;errSeen[k]=1;errN++;lastErr=m;ev('err',{m:m,s:src,l:lvl?lvl.l:'',sc:scr});flush();}

  // --- отправка ---
  function pack(){if(!Q.length)return null;var b={},k;for(k in hdr)b[k]=hdr[k];b.dk=dk(now());b.dn=Math.max(0,ddiff(st.c,b.dk));b.sn=st.n;b.q=++seq;b.e=Q.splice(0,MAXB);return b;}
  function keep(){while(pend.length>KEEP)pend.shift();ls('stat-q-'+G,pend.length?JSON.stringify(pend):null);}
  function send(b){var s=JSON.stringify(b);if(dev&&!O.url)return true;
    if(navigator.onLine===false)return false;
    try{if(navigator.sendBeacon&&navigator.sendBeacon(O.url,s))return true;}catch(e){}
    try{if(window.fetch){fetch(O.url,{method:'POST',body:s,keepalive:s.length<60000,mode:'no-cors',headers:{'Content-Type':'text/plain'}})['catch'](function(){pend.push(b);keep();});return true;}}catch(e){}
    try{var x=new XMLHttpRequest();x.open('POST',O.url,true);x.setRequestHeader('Content-Type','text/plain');x.send(s);return true;}catch(e){}
    return false;}
  function flush(){if(!on)return;var b,left=[];while(pend.length){b=pend.shift();if(!send(b)){left.push(b);break;}}pend=left.concat(pend);
    while(Q.length){b=pack();if(!send(b)){pend.push(b);break;}}keep();}
  function hide(){if(!on||!vis)return;vis=false;act+=Date.now()-actT;hideT=Date.now();var p={d:actSec()};if(lvl)p.l=lvl.l;if(scr)p.sc=scr;ev('pause',p);flush();}
  function show(){if(!on||vis)return;vis=true;actT=Date.now();
    if(Date.now()-hideT>SESS_GAP){ // долго не было — новый сеанс (новый ключ, счётчик сеансов +1)
      if(lvl)lvl=null;once={};errN=0;errSeen={};sk=rnd();hdr.sk=sk;seq=0;t0=Date.now();act=0;st.n++;saveSt();ev('start',{sn:st.n,f:0,r:1});}
    dayMark();}

  // облако игры: в mergeSave — STAT.merge(d.stc): раньше установлен, больше сеансов
  function merge(c){if(!c||typeof c!=='object')return;if(+c.c&&(!st.c||+c.c<st.c))st.c=+c.c;if(+c.n>st.n)st.n=+c.n;if(+c.d>st.d)st.d=+c.d;saveSt();}
  // --- переключатель «Анонимная статистика» для ⚙ (по умолчанию ВКЛ.; выбор — на устройстве, localStorage 'stat-off') ---
  function tx(ru,en){return typeof LANG!=='undefined'&&LANG==='en'?en:ru;}
  function enabled(){return ls('stat-off')!=='1';}
  function available(){return !!(O.url||dev);}          // адреса нет — строку в ⚙ не показываем
  function setEnabled(v){if(v){ls('stat-off',null);if(!on&&available())start();}
    else{ls('stat-off','1');Q=[];pend=[];ls('stat-q-'+G,null);on=false;}}
  function optOut(v){setEnabled(!v);}
  function label(){return tx('📊 Анонимная статистика: ','📊 Anonymous statistics: ')+(enabled()?tx('вкл','on'):tx('выкл','off'));}
  function note(){return tx('Уровни, ошибки и нажатия кнопок — без имени, ID и IP. Помогает делать игру лучше.',
    'Levels, errors and button taps — no name, ID or IP. Helps us improve the game.');}
  function toggle(){setEnabled(!enabled());return label();}
  return {init:init,enabled:enabled,available:available,setEnabled:setEnabled,label:label,note:note,toggle:toggle,ev:ev,once:onceEv,lvl:lvlStart,use:use,end:lvlEnd,screen:screen,place:setPlace,ad:ad,offer:offer,err:err,flush:flush,merge:merge,optOut:optOut,
    _dbg:function(){return {on:on,dev:dev,cut:cut,Q:Q,pend:pend,st:st,hdr:hdr,lvl:lvl,lastErr:lastErr};}};
})();
/*/STAT*/
// STAT — своя ОБЕЗЛИЧЕННАЯ статистика (hobby-analytics/stat): без vk_user_id, IP и постоянного номера; выключатель — ⚙ «Анонимная статистика».
// Адрес боевой; на маке/LAN/в headless модуль молчит сам (03.10). ?stat=dev на localhost — журнал [STAT] в консоль без отправки.
const STAT_URL='https://functions.yandexcloud.net/d4efqgmii6honbajplim?op=ev';
// STAT_O.S — текущее сохранение: облако подменяет S целиком (cloudMerge), ссылку обновляем там же
const STAT_O={g:'oborona',gv:'v1.9b',plat:PLAT,lang:LANG,url:STAT_URL,now:()=>nowMs(),S:S};STAT.init(STAT_O);
/* причины паузы: реклама, сворачивание, пауза площадки, VK свернул окно. Снимаем, только когда ушли все —
   возврат из фона не включает звук посреди рекламы */
const PAUSE={};
function setPause(k,v){if(v)PAUSE[k]=1;else delete PAUSE[k];const any=Object.keys(PAUSE).length>0;paused=muted=any;
  if(AC){if(any)AC.suspend().catch(()=>{});else AC.resume().catch(()=>{});}musTick();}
const YG={
  start(){try{ysdk&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.start();}catch(e){}},
  stop(){try{ysdk&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.stop();}catch(e){}}
};
// SDK и мост ждём до 20 с: на медленной сети 4 с не хватало — игра запускалась без рекламы и облака
const SDK_WAIT=20000;
function loadScript(src,ms){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);setTimeout(no,ms||SDK_WAIT);});}
function vkSend(method,params,ms){return withTimeout(window.vkBridge.send(method,params||{}),ms||4000);}
/*SOC*/
/* ===== SOC v2 (29.09.2026; v2 — дружит с REF: «Позвать друзей» = ссылка с #ref): друзья, избранное, «Ещё игры во дворе» — ТОЛЬКО VK с мостом; в Яндексе молчит =====
   Общий модуль для всех игр. Источник — ~/Projects/hobby-analytics/soc/soc.js (правки — только там, потом soc-sync.sh).
   Правила VK: 2.6.2 — никаких наград за приглашение/«поделиться»/избранное/экран (разрешено лишь за вступление в сообщество —
   в наших играх НЕ даём); 2.6.3 — само-предложения не в первую сессию, отказ помним, повтор не чаще раза в 30 дней, ≤3 раз.
   Покер (18+) в список не добавлять никогда. 12+ (Дурак, Козёл) — с пометкой «12+».
   Старый синтаксис: без optional chaining и nullish-оператора, без CSS-свойства inset. Нужны из игры: PLAT ('vk'|…), VK (мост после VKWebAppInit или null), vkSend(метод,параметры,мс). */
var SOC=(function(){
  var GROUP=241793582,DAY=864e5,VER=2;
  // i — место в спрайте dvor.jpg (по 96 px), g — группа (c карты, p головоломки, s сказка, r спокойные), a — возраст,
  // off — где игры НЕТ в каталоге VK: 'all' — нигде, 'web' — нет на компьютере (desktop_web). Обновлять по platforms.md.
  var GAMES=[
    {id:54791564,t:'Выезд со двора',a:6,i:0,g:'p'},
    {id:54787973,t:'Баба Зина: слова из букв',a:0,i:1,g:'p'},
    {id:54791567,t:'Богатырь против нечисти',a:6,i:2,g:'s'},
    {id:54791569,t:'Тридевятая оборона: защита башен',a:6,i:3,g:'s'},
    {id:54791634,t:'Гастроном номер 1',a:0,i:4,g:'p',off:'all'},
    {id:54792006,t:'Дурак во дворе',a:12,i:5,g:'c'},
    {id:54792009,t:'Косынка во дворе',a:0,i:6,g:'c'},
    {id:54792011,t:'Паук на даче',a:0,i:7,g:'c'},
    {id:54792015,t:'Свободная ячейка в санатории',a:0,i:8,g:'c'},
    {id:54792674,t:'Козёл во дворе',a:12,i:9,g:'c',off:'all'},
    {id:54792676,t:'Кирпичики во дворе',a:0,i:10,g:'p'},
    {id:54794412,t:'Рыбалка с Петровичем',a:0,i:11,g:'r'},
    {id:54794419,t:'Дворовая викторина',a:6,i:12,g:'p'}
  ];
  var N=GAMES.length;
  function qp(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):'';}
  var APP=+qp('vk_app_id')||0,PF=qp('vk_platform'),WEB=PF.indexOf('desktop')===0;
  var st={},O={},T0=Date.now(),asked=false,homeOk=null,readyOn=false;
  function tx(ru,en){return typeof LANG!=='undefined'&&LANG==='en'?en:ru;} // VK всегда по-русски; обёртка — по правилам игр
  function nop(){}
  function saveFn(){(O.save||nop)();}
  function toastFn(t){(O.toast||nop)(t);}

  // только настоящий VK (vk_app_id в адресе) и живой мост
  function ok(){return typeof PLAT!=='undefined'&&PLAT==='vk'&&typeof VK!=='undefined'&&!!VK&&APP>0;}
  function send(m,p){return vkSend(m,p||{},60000);}
  function me(){for(var i=0;i<N;i++)if(GAMES[i].id===APP)return GAMES[i];return null;}
  function done(k){st[k]={d:1};saveFn();}
  function tried(k){var x=st[k]||{};x.n=(x.n||0)+1;x.t=Date.now();st[k]=x;saveFn();}
  function due(k){var x=st[k]||{};return !x.d&&(x.n||0)<3&&(!x.t||Date.now()-x.t>30*DAY);}

  /* SOC.init(S, {save, toast, cls, modal, close}) — один раз при запуске, после загрузки сохранения (считает сессии).
     cls — классы кнопок (по умолчанию 'btn noenter': Enter их не жмёт); modal(html) — показать окно игры и вернуть его
     контейнер; close() — закрыть окно игры. Без modal — своё лёгкое окно. */
  function init(S,opt){O=opt||{};if(!S.soc||typeof S.soc!=='object')S.soc={};st=S.soc;
    st.ses=(st.ses||0)+1;if(qp('vk_is_favorite')==='1')st.fav={d:1};saveFn();ready();}
  // после VKWebAppInit (мост готов): узнать, можно ли значок на экран (только Android)
  function ready(){if(readyOn||!ok())return;readyOn=true;
    if(PF.indexOf('android')>=0)vkSend('VKWebAppAddToHomeScreenInfo',{},4000).then(function(r){
      homeOk=!!(r&&r.is_feature_supported&&!r.is_added_to_home_screen);},function(){homeOk=false;});
    else homeOk=false;}
  // облако: вызвать из слияния сохранений игры — SOC.merge(d.soc); сессии — максимум, «сделано» — навсегда, попытки — больше/позже
  function merge(d){if(!d||typeof d!=='object')return;
    for(var k in d){var a=st[k],b=d[k];
      if(k==='ses'){if(typeof b==='number'&&b>(st.ses||0))st.ses=b;continue;}
      if(!b||typeof b!=='object')continue;
      if(!a||typeof a!=='object'){st[k]=b;continue;}
      if(a.d||b.d){st[k]={d:1};continue;}
      a.n=Math.max(a.n||0,b.n||0);a.t=Math.max(a.t||0,b.t||0);}}

  // --- действия (кнопки в ⚙ жмёт сам игрок; ограничений частоты нет, наград нет) ---
  function fav(){return send('VKWebAppAddToFavorites').then(function(r){if(r&&r.result)done('fav');return !!(r&&r.result);},function(){tried('fav');return false;});}
  function home(){return send('VKWebAppAddToHomeScreen').then(function(r){if(r&&r.result){done('home');homeOk=false;}return !!(r&&r.result);},function(){tried('home');return false;});}
  // «Приведи друга» (модуль REF, если он есть в игре и включён): вместо окна приглашения — ссылка с меткой #ref=<id>,
  // иначе друг, открывший игру с телефона, не засчитается (окно приглашения передаёт автора только на сайте ВК)
  function refOn(){return typeof REF!=='undefined'&&!!REF&&typeof REF.on==='function'&&REF.on();}
  function invite(){if(refOn())return send('VKWebAppShare',{link:REF.link()}).then(function(){done('inv');return true;},function(){tried('inv');return false;});
    return send('VKWebAppShowInviteBox').then(function(r){if(r&&r.success!==false)done('inv');return true;},function(){tried('inv');return false;});}
  function share(){return send('VKWebAppShare',{link:refOn()?REF.link():'https://vk.com/app'+APP}).then(function(){return true;},function(){return false;});}
  function group(){return send('VKWebAppJoinGroup',{group_id:GROUP}).then(function(r){if(r&&r.result)done('grp');return !!(r&&r.result);},function(){tried('grp');return false;});}
  function open(g){return send('VKWebAppOpenApp',{app_id:g.id,location:'from='+APP}).then(function(){return true;},function(){
    toastFn(tx('Найдите «'+g.t+'» в разделе «Игры»','Find "'+g.t+'" in the Games section'));return false;});}

  // --- список «Ещё игры»: без себя, без 18+, без неопубликованных на этой площадке; сначала родственные, дальше — сдвиг по дню ---
  function list(n){var m=me(),mg=m?m.g:'',out=[],i,g,day=Math.floor(Date.now()/DAY);
    for(i=0;i<N;i++){g=GAMES[i];if(g.id===APP||g.a>=18||g.off==='all'||(g.off==='web'&&WEB))continue;out.push(g);}
    out.sort(function(a,b){var x=(b.g===mg)-(a.g===mg);if(x)return x;return ((a.i+day)%N)-((b.i+day)%N);});
    return out.slice(0,n||6);}

  function css(){if(document.getElementById('socCss'))return;var s=document.createElement('style');s.id='socCss';
    s.textContent='.soc-list{margin:6px 0 4px;text-align:left}'+
      '.soc-g{display:flex;align-items:center;width:100%;padding:7px 4px;border:0;border-top:1px solid rgba(0,0,0,.08);background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}'+
      '.soc-g:first-child{border-top:0}'+
      '.soc-ic{width:48px;height:48px;border-radius:11px;flex:none;margin-right:12px;background-color:#ddd;background-repeat:no-repeat;box-shadow:0 1px 3px rgba(0,0,0,.2)}'+
      '.soc-t{flex:1;min-width:0;font-weight:700;font-size:17px;line-height:1.2}'+
      '.soc-t small{font-weight:800;color:#8a6d4b;margin-left:4px;white-space:nowrap}'+
      '.soc-a{font-size:24px;opacity:.5;margin-left:6px}'+
      '.soc-box{position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,.55);z-index:9999;overflow:auto;padding:12px 16px}'+
      '.soc-card{background:#fff;color:#222;border-radius:16px;max-width:420px;margin:0 auto;padding:14px 16px;font:17px/1.3 sans-serif}'+
      '.soc-set>*+*{margin-top:8px}'+
      '@media (max-height:620px){.soc-g{padding:4px}}'+
      '@media (max-height:440px) and (min-width:600px){.soc-list{display:-webkit-box;display:flex;flex-wrap:wrap}.soc-g{width:50%;border-top:0}}';
    document.head.appendChild(s);}
  function btn(k,label){return '<button class="'+(O.cls||'btn noenter')+'" data-soc="'+k+'">'+label+'</button>';}

  // --- кнопки для ⚙ (HTML); в Яндексе и без моста — пусто ---
  function settingsHtml(){if(!ok())return '';
    var b=btn('inv',tx('👥 Позвать друзей','👥 Invite friends'))+btn('share',tx('📤 Поделиться игрой','📤 Share the game'));
    if(!(st.fav&&st.fav.d))b+=btn('fav',tx('⭐ В избранное','⭐ Add to favourites'));
    if(homeOk)b+=btn('home',tx('📲 На экран телефона','📲 Add to home screen'));
    b+=btn('grp',tx('📣 Наше сообщество','📣 Our community'))+btn('more',tx('🎲 Ещё игры во дворе','🎲 More yard games'));
    return '<div class="soc-set">'+b+'</div>';}
  // навесить обработчики после вставки HTML: SOC.bind(контейнер, back) — back() вызывается при «Назад» из «Ещё игры»
  function bind(root,back){if(!root)return;var bs=root.querySelectorAll('[data-soc]');
    for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var k=this.getAttribute('data-soc');
      if(k==='inv')invite();else if(k==='share')share();else if(k==='fav')fav().then(function(){if(back)back();});
      else if(k==='home')home().then(function(){if(back)back();});else if(k==='grp')group();else if(k==='more')showMore(back);};}

  // --- окно «Ещё игры во дворе»: через modal() игры (O.modal) или своё лёгкое. back — куда вернуться по «Назад» ---
  function showMore(back){if(!ok())return;css();var G=list(6),spr=O.sprite||'js/dvor.jpg',h='';
    for(var i=0;i<G.length;i++)h+='<button class="soc-g" data-g="'+i+'"><span class="soc-ic" style="background-image:url('+spr+');background-position:'+(-48*G[i].i)+'px 0;background-size:'+(48*N)+'px 48px"></span>'+
      '<span class="soc-t">'+G[i].t+(G[i].a>=12?'<small>'+G[i].a+'+</small>':'')+'</span><span class="soc-a">›</span></button>';
    var head='<h2>'+tx('Ещё игры во дворе','More yard games')+'</h2>',
      foot='<div class="row"><button class="'+(O.cls||'btn noenter')+'" id="socClose">'+(back?tx('← Назад','← Back'):tx('Закрыть','Close'))+'</button></div>',
      root,box=null;
    if(O.modal)root=O.modal(head+'<div class="soc-list">'+h+'</div>'+foot);
    else{box=document.createElement('div');box.className='soc-box';box.id='socBox';
      box.innerHTML='<div class="soc-card">'+head+'<div class="soc-list">'+h+'</div>'+foot+'</div>';document.body.appendChild(box);root=box;
      box.onclick=function(e){if(e.target===box)close();};}
    function close(){if(box){if(box.parentNode)box.parentNode.removeChild(box);}else if(O.close)O.close();}
    var c=root.querySelector('#socClose');if(c)c.onclick=function(){if(back&&O.modal)back();else close();};
    var rows=root.querySelectorAll('[data-g]');
    for(var j=0;j<rows.length;j++)rows[j].onclick=function(){open(G[+this.getAttribute('data-g')]);};}

  /* --- одно само-предложение за сессию (звать из окна победы). wins — число побед всего; busy — игра занята
     (реклама < 60 с назад, пауза, следом межэкранная). Вернёт {k, t, b, run} или null — строку и кнопку рисует игра.
     Показ сразу считается «отказом» (≤3 раз, не чаще раза в 30 дней); успех fav/home/inv/grp — больше никогда. --- */
  function offer(wins,busy){if(!ok()||asked||busy||(st.ses||0)<2||Date.now()-T0<120000)return null;
    var o=null;
    if(due('fav'))o={k:'fav',t:tx('Добавьте игру в избранное — будет всегда под рукой.','Add the game to favourites — always at hand.'),b:tx('⭐ В избранное','⭐ Add to favourites'),run:fav};
    else if(homeOk&&st.ses>=3&&due('home'))o={k:'home',t:tx('Значок игры на экране — заходить в одно касание.','A game icon on your screen — one tap to play.'),b:tx('📲 На экран телефона','📲 Add to home screen'),run:home};
    else if(st.ses>=3&&(wins||0)>=5&&due('inv'))o={k:'inv',t:tx('Позовите друзей — будет с кем посоревноваться.','Invite friends — someone to compete with.'),b:tx('👥 Позвать друзей','👥 Invite friends'),run:invite};
    else if(st.ses>=4&&due('grp'))o={k:'grp',t:tx('Новости и новые игры — в сообществе «Игры во дворе».','News and new games — in the "Yard Games" community.'),b:tx('📣 Наше сообщество','📣 Our community'),run:group};
    else{var x=st.more||{};if(!x.t||Date.now()-x.t>7*DAY){var g=list(1)[0];
      if(g)o={k:'more',t:tx('Попробуйте ещё: «'+g.t+'»'+(g.a>=12?' ('+g.a+'+)':'')+'.','Try another one: "'+g.t+'".'),b:tx('🎲 Открыть','🎲 Open'),run:function(){return open(g);}};}}
    if(!o)return null;asked=true;if(o.k==='more'){st.more={t:Date.now()};saveFn();}else tried(o.k);return o;}

  return {v:VER,ok:ok,init:init,ready:ready,merge:merge,fav:fav,home:home,invite:invite,share:share,group:group,open:open,list:list,
    settingsHtml:settingsHtml,bind:bind,showMore:showMore,offer:offer,games:GAMES};
})();
/*/SOC*/
SOC.init(S,{save:()=>save(),toast:t=>toast(t),cls:'btn ghost',modal:h=>{showModal(h);return $('mBody');},close:()=>hideModal()});
/* VK хранит значения до 4096 байт, а на деле (vk-bridge#226) надёжно ~2 КБ — режем сохранение на куски по 1000 знаков.
   Двойной буфер: новые куски пишем под другим префиксом (sa0…, sb0…) по одному, ключ svn = «префикс:кусков:длина» — строго последним.
   Пока svn не переписан, старый набор цел; оборванная запись облако не портит. Старый формат (sv0…, svn = число) читается. */
const VK_CHUNK=1000,VK_MAXCH=60;
let vkMeta={pre:'sv',n:0,len:0},vkBusy=false,vkAgain=false;
function vkParseMeta(v){const m=String(v||'').split(':');if(m.length>=3)return {pre:m[0],n:+m[1]||0,len:+m[2]||0};return {pre:'sv',n:+m[0]||0,len:0};}
async function vkLoadCloud(){
  const r=await vkSend('VKWebAppStorageGet',{keys:['svn']});const meta=vkParseMeta(((r.keys||[])[0]||{}).value);
  if(!meta.n)return null;                      // облака нет — это не ошибка
  const bad=()=>{const e=new Error('broken');e.broken=1;return e;};
  if(meta.n>VK_MAXCH)throw bad();
  const keys=[];for(let i=0;i<meta.n;i++)keys.push(meta.pre+i);
  const r2=await vkSend('VKWebAppStorageGet',{keys},8000);const m={};(r2.keys||[]).forEach(k=>m[k.key]=k.value);
  let str='';for(let i=0;i<meta.n;i++){const p=m[meta.pre+i];if(!p)throw bad();str+=p;}
  if(meta.len&&str.length!==meta.len)throw bad();
  let d;try{d=JSON.parse(str);}catch(e){throw bad();}
  vkMeta=meta;return d;}
async function vkSaveCloud(){if(vkBusy){vkAgain=true;return;}vkBusy=true;
  try{do{vkAgain=false;const str=JSON.stringify(S),n=Math.ceil(str.length/VK_CHUNK);if(n>VK_MAXCH)break;
      const pre=vkMeta.pre==='sa'?'sb':'sa';
      for(let i=0;i<n;i++)await vkSend('VKWebAppStorageSet',{key:pre+i,value:str.slice(i*VK_CHUNK,(i+1)*VK_CHUNK)});
      await vkSend('VKWebAppStorageSet',{key:'svn',value:pre+':'+n+':'+str.length});vkMeta={pre,n,len:str.length};
    }while(vkAgain);}catch(e){cloudDirty=true;}finally{vkBusy=false;}}
// битое облако — не пустое: не затираем, а перечитываем; только если оно так и не собралось, пишем своё
async function vkCloudInit(tries){try{cloudIn(await vkLoadCloud());}catch(e){
  if(tries>0)setTimeout(()=>vkCloudInit(tries-1),10000);else if(e&&e.broken)cloudIn(null);else setTimeout(()=>vkCloudInit(0),60000);}}
// VK web: высота окна под экран браузера (модерация VK 29.09: VKWebAppResizeWindow)
var VK_FIT={top:130,min:560,max:900,last:0,t:0};
function vkFit(vh){if(!vh||!window.vkBridge)return;
  var h=Math.round(Math.max(VK_FIT.min,Math.min(VK_FIT.max,vh-VK_FIT.top)));
  if(Math.abs(h-VK_FIT.last)<8)return;VK_FIT.last=h;
  var w=Math.max(600,Math.min(1000,window.innerWidth||911));
  window.vkBridge.send('VKWebAppResizeWindow',{width:w,height:h}).catch(function(){VK_FIT.last=0;});}
function vkFitInit(){try{
  window.vkBridge.subscribe(function(e){var d=e&&e.detail;
    if(d&&d.type==='VKWebAppUpdateConfig'&&d.data&&d.data.viewport_height){clearTimeout(VK_FIT.t);
      VK_FIT.t=setTimeout(function(){vkFit(d.data.viewport_height);},200);}});
  window.vkBridge.send('VKWebAppGetConfig').then(function(c){if(c&&c.viewport_height)vkFit(c.viewport_height);}).catch(function(){});
}catch(e){}}
async function vkInit(tries){
  try{await vkSend('VKWebAppInit',{},SDK_WAIT);}catch(e){if(tries>0)vkInit(tries-1);return;}
  if(VK)return;VK=window.vkBridge;SOC.ready();if(typeof updMore==='function')updMore();
  vkFitInit(); // VK web: подогнать высоту окна под экран (без ожидания)
  VK.subscribe(e=>{const t=e.detail&&e.detail.type;if(t==='VKWebAppViewHide'){setPause('vk',1);cloudFlush();}else if(t==='VKWebAppViewRestore')setPause('vk',0);});
  vkCloudInit(3).then(()=>{if(typeof PAY!=='undefined')PAY.init();}); // покупки VK (js/pay.js): после моста и первого чтения облака
  adPreload(); // adfix: подгрузка ролика за награду; «не готов» — переспросим в фоне
  interPre();} // подгрузка межэкранной (как в Богатыре); правила показа не меняются
// Яндекс: игрок и облако — с тайм-аутом, иначе повисший запрос оставит игру без облака навсегда
async function ycloud(n){if(!ysdk)return;try{if(!YP)YP=await withTimeout(ysdk.getPlayer({scopes:false}),10000);cloudIn(await withTimeout(YP.getData(),10000));}
  catch(e){if(n>0)setTimeout(()=>ycloud(n-1),10000);}}
async function initSDK(){
  if(PLAT==='vk'){
    // меню не ждёт ответа моста: VKWebAppInit уходит сразу, ответ ждём до 20 с (и ещё раз, если не пришёл); облако догружается следом
    try{if(!window.vkBridge)await loadScript('js/vk-bridge.min.js');vkInit(1);}catch(e){VK=null;}
  }else if(!/[?&](nosdk|bot|shot)/.test(location.search)){
    try{await loadScript('/sdk.js');}catch(e){}
    if(window.YaGames){
      try{ysdk=await withTimeout(YaGames.init(),15000);
        try{langFromSdk(ysdk.environment.i18n.lang);}catch(e){} // язык площадки (js/lang.js)
        ysdk.on&&ysdk.on('game_api_pause',()=>setPause('sdk',1));
        ysdk.on&&ysdk.on('game_api_resume',()=>setPause('sdk',0));
        ycloud(3);
        try{ysdk.getFlags&&ysdk.getFlags().then(applyFlags).catch(()=>{});}catch(e){}
      }catch(e){ysdk=null;}
    }
  }
  if(typeof onReady==='function')onReady();
  try{ysdk&&ysdk.features.LoadingAPI&&ysdk.features.LoadingAPI.ready();}catch(e){}
  if(typeof PAY!=='undefined')PAY.init(); // покупки (js/pay.js): Яндекс; VK — после моста (vkInit), здесь только заглушка ?vk=1&paytest=1 без моста
}
/* Реклама: за награду — по желанию игрока (кнопки «… за рекламу»); межэкранная — бережно, правило П2 (решение владельца 27.09,
   hobby-analytics/12): только при уходе с экрана итогов после победы (кампания со 2-й главы, испытание дня, повергнутый Босс недели)
   и после осады; не в первые 5 минут захода и не ближе INTER_MIN минут к любой рекламе (ролик за награду тоже сбрасывает отсчёт).
   Никогда: посреди боя, при запуске, после поражения, сразу после ролика за награду. */
// заглушка рекламы — только локально (мак, ?nosdk): в настоящем Яндексе без SDK награды без ролика нет
const LOCAL=/^(localhost|127\.0\.0\.1|\[::1\])$|\.(localhost|test)$/.test(location.hostname)||/[?&]nosdk/.test(location.search);
// можно ли показывать кнопки «… за рекламу»: в настоящем VK без моста и в Яндексе без SDK — нет
function adOk(){if(PLAT==='vk')return !!VK||!VK_REAL;return !!ysdk||LOCAL;}
function stubAd(cb){const ad=$('ad'),tEl=$('adT');ad.classList.add('on');adOpen();let n=3;tEl.textContent=n;
  const it=setInterval(()=>{n--;tEl.textContent=n;if(n<=0){clearInterval(it);ad.classList.remove('on');adClose();cb();}},600);}
function adOpen(){setPause('ad',1);YG.stop();}
// после рекламы «игра идёт» — только если бой идёт и не открыта пауза или окно (окно само вызовет start при закрытии)
function adClose(){lastAdT=Date.now();setPause('ad',0);if(G&&!G.over&&!G.paused&&!paused&&!$('modal').classList.contains('on'))YG.start();musicSync();}
const AD_FAIL='Реклама сейчас недоступна, попробуй позже';
// пока ролик идёт, повторные нажатия не запускают второй (и не дают двойную награду)
let adBusy=false;
/* adfix (03.10): «ролика нет» — VK отвечает ошибкой 20 ('No ads'), чаще на компьютере: ролик ещё не подгрузился, готов он бывает через 10–60 с.
   1) отказ «ролика нет» → один тихий автоповтор через AD_RETRY_MS под надписью «Ролик загружается…» (игра на паузе);
   2) снова нет → «Ролик будет через несколько секунд…», кнопки «за рекламу» (AD_BTN_SEL) гаснут, в фоне раз в AD_POLL_MS спрашиваем VK (Check);
      «готов» (не раньше AD_COOL_MIN) → кнопки загораются и «Ролик готов»; ответа нет — загораются сами через AD_COOL_MS. Нажатие по погасшей кнопке VK не дёргает;
   3) заранее: Check при запуске и после каждого показа, «не готов» — переспрашиваем в фоне (до 6 раз). Ответу «не готов» как запрету не верим.
   Награда — только за досмотр и один раз. Статистика: ok+c='retry' — спас автоповтор; none — ролика не было и после повтора.
   Один приём во всех играх: hobby-analytics/release-f/ads-fail.md, раздел «ОБРАЗЕЦ». */
const AD_RETRY_MS=3000,AD_COOL_MS=30000,AD_COOL_MIN=8000,AD_POLL_MS=5000,AD_BTN_SEL='.btn.ad',AD_BTN_RE=null;let adCoolT=0,adCoolS=0,adDimT=0,adChkT=0,adRdyT=0;
function adErrCode(e){const d=e&&e.error_data||{};return d.error_code||d.error_reason||(e&&(e.error_type||e.message))||'';} // код VK, иначе причина словами — в статистику
function adNoFill(e){const d=e&&e.error_data||{};return +d.error_code===20||/no ads?\b/i.test(String(d.error_reason||''));}
function adSoon(){return Lg('Ролик будет через несколько секунд — кнопка загорится, когда он загрузится','The video will be ready in a few seconds — the button will light up');}
function adBtns(){const o=[];try{const q=document.querySelectorAll(AD_BTN_SEL);for(let i=0;i<q.length;i++){const b=q[i];if(!AD_BTN_RE||b.hasAttribute('data-adoff')||(AD_BTN_RE.test(b.textContent)&&!/без реклам|no ads/i.test(b.textContent)))o.push(b);}}catch(e){}return o;}
function adPreload(n){if(!VK)return;clearTimeout(adChkT);n=n===undefined?6:n;const again=()=>{if(n>0)adChkT=setTimeout(()=>adPreload(n-1),AD_POLL_MS);};
  vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).then(r=>{if(r&&r.result)adReady();else again();},again);}
function adReady(){if(Date.now()>=adCoolT)return;clearTimeout(adRdyT);adRdyT=setTimeout(()=>{if(Date.now()>=adCoolT)return;adCoolT=0;adDim();let vis=false;const q=adBtns();for(let i=0;i<q.length;i++)if(q[i].offsetParent)vis=true;if(vis&&!adBusy)toast(Lg('Ролик готов — можно смотреть','The video is ready to watch'));},Math.max(0,adCoolS+AD_COOL_MIN-Date.now()));}
function adWait(on){let w=document.getElementById('adWait');if(!on){if(w)w.style.display='none';return;}
  if(!w){w=document.createElement('div');w.id='adWait';w.style.cssText='position:fixed;top:0;right:0;bottom:0;left:0;z-index:99999;background:rgba(0,0,0,.74);color:#fff;display:none;align-items:center;justify-content:center;text-align:center;padding:24px;font-weight:800;font-size:20px;line-height:1.35';document.body.appendChild(w);}
  w.textContent=Lg('Ролик загружается…','Loading the video…');w.style.display='flex';}
// кнопки «за рекламу» гаснут, пока идёт пауза (окна перерисовываются — поэтому раз в секунду)
function adDim(){clearTimeout(adDimT);const off=Date.now()<adCoolT,q=adBtns();for(let i=0;i<q.length;i++){const b=q[i];
    if(off){b.style.opacity='.45';b.setAttribute('data-adoff','1');}else if(b.hasAttribute('data-adoff')){b.style.opacity='';b.removeAttribute('data-adoff');}}if(off)adDimT=setTimeout(adDim,1000);}
function adCool(){adCoolS=Date.now();adCoolT=adCoolS+AD_COOL_MS;adDim();adPreload();}
function showRewarded(cb0,onFail0){
  if(adBusy)return;
  if(Date.now()<adCoolT){toast(Lg('Ролик ещё загружается — подожди несколько секунд','The video is still loading — wait a few seconds'));if(onFail0)onFail0();adDim();return;}
  adBusy=true;clearTimeout(showRewarded._t);showRewarded._t=setTimeout(()=>{adBusy=false;adWait(0);},135000);
  let paid=false;const cb=()=>{if(paid)return;paid=true;adBusy=false;cb0();},onFail=()=>{adBusy=false;onFail0&&onFail0();};
  // в VK мост не ответил — награду даром не даём; заглушка только для ?vk=1 на маке
  if(PLAT==='vk'&&!VK){if(VK_REAL){STAT.ad('rew','fail','nobridge');toast(AD_FAIL);onFail();}else{STAT.ad('rew','ok','stub');stubAd(cb);}return;}
  if(VK){
    let tries=0;
    const go=()=>{adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'reward'},60000).then(r=>{adClose();
        if(r&&r.result){STAT.ad('rew','ok',tries?'retry':'');adPreload();cb();}else{STAT.ad('rew','fail','noresult');toast(AD_FAIL);adPreload();onFail();}
      },e=>{
        if(adNoFill(e)&&!tries){tries=1;adWait(1);adPreload();setTimeout(()=>{adWait(0);go();},AD_RETRY_MS);return;} // ролика нет — один тихий повтор; игра остаётся на паузе (adClose — после него)
        adClose();if(adNoFill(e)){STAT.ad('rew','none',adErrCode(e));toast(adSoon());adCool();}else{STAT.ad('rew','err',adErrCode(e));toast(AD_FAIL);adPreload();}
        onFail();adDim();});}; // adDim: колбэк мог заново открыть окно с кнопкой — гасим её сразу
    go();return;}
  if(!ysdk){if(LOCAL){STAT.ad('rew','ok','stub');stubAd(cb);}else{STAT.ad('rew','fail','nosdk');toast(AD_FAIL);onFail();}return;}
  let got=false;
  try{ysdk.adv.showRewardedVideo({callbacks:{onOpen:adOpen,onRewarded:()=>{got=true;},
    onClose:()=>{adClose();STAT.ad('rew',got?'ok':'skip');if(got)cb();else{toast(Lg('Досмотри видео до конца, чтобы получить награду','Watch the video to the end to get the reward'));onFail();}},
    onError:()=>{adClose();STAT.ad('rew','err');toast(AD_FAIL);adCool();onFail();}}});}catch(e){adClose();STAT.ad('rew','err','throw');toast(AD_FAIL);onFail();}
}
/* межэкранная. Интервал — флагом Яндекса inter_min (минуты; берём только 5…12, иначе 8), inter=0/off — выключить.
   Заход: с запуска или с возвращения после 30+ минут в фоне — первые 5 минут межэкранной нет. */
const VK_REAL=/[?&]vk_app_id=/.test(location.search);
let INTER_MIN=8,INTER_ON=true,lastAdT=0,sessT=BOOT_T,hideT=0,interBusy=false;
function applyFlags(f){if(!f||typeof f!=='object')return;const n=parseInt(f.inter_min,10);if(isFinite(n)&&n>=5&&n<=12)INTER_MIN=n;
  if(f.inter==='0'||f.inter==='off')INTER_ON=false;}
function interReady(){if(!INTER_ON||adBusy||interBusy||typeof PAY!=='undefined'&&PAY.own('no_ads')||/[?&](bot|shot)/.test(location.search))return false;const now=Date.now();
  if(now-sessT<5*60e3||now-lastAdT<INTER_MIN*60e3)return false;
  return adOk();}   // в VK без ответа моста и в Яндексе без SDK — просто пропускаем, без заглушки   // в VK без ответа моста — просто пропускаем, без заглушки
// подгрузка межэкранной VK: при запуске и после каждого показа/отказа; ответ не используется, на показ не влияет
function interPre(){if(!VK)return;try{vkSend('VKWebAppCheckNativeAds',{ad_format:'interstitial'}).catch(()=>{});}catch(e){}}
function showInterstitial(cb0){if(interBusy)return;interBusy=true;let done=false;
  const cb=shown=>{if(done)return;done=true;clearTimeout(t);interBusy=false;lastAdT=Date.now();STAT.ad('int',shown===false?'none':'show');cb0();};
  const t=setTimeout(()=>{if(PAUSE.ad)adClose();cb(false);},90000);   // площадка не ответила — не держим игрока
  if(PLAT==='vk'&&!VK){if(VK_REAL)cb(false);else stubAd(cb);return;}
  if(VK){adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).then(r=>{adClose();interPre();cb(!(r&&r.result===false));},()=>{adClose();interPre();cb(false);});return;}
  if(!ysdk){if(LOCAL)stubAd(cb);else cb(false);return;}
  try{ysdk.adv.showFullscreenAdv({callbacks:{onOpen:adOpen,onClose:s=>{adClose();cb(s!==false);},onError:()=>{adClose();cb(false);},onOffline:()=>cb(false)}});}catch(e){adClose();cb(false);}}
document.addEventListener('visibilitychange',()=>{if(document.hidden){hideT=Date.now();setPause('hidden',1);cloudFlush();}
  else{if(hideT&&Date.now()-hideT>30*60e3)sessT=Date.now();setPause('hidden',0);}});

// контекстное меню (правый клик, долгий тап) не открываем — это игра, а не страница
document.addEventListener('contextmenu',e=>e.preventDefault());

/* ================= таблица рекордов Яндекса и друзей VK =================
   Яндекс: в консоли создать лидерборды 'endless' (число — пройдено волн) и 'weekly' (число — Босс недели: неделя×100000 + очки).
   VK: VKWebAppShowLeaderBoardBox — таблица друзей по рекорду осады. */
const LB={
  ok(){return !!(ysdk&&(ysdk.leaderboards||ysdk.getLeaderboards));},
  async set(name,score){if(!ysdk)return;try{if(YP&&YP.isAuthorized&&!YP.isAuthorized())return;
    if(ysdk.leaderboards&&ysdk.leaderboards.setScore)await ysdk.leaderboards.setScore(name,Math.floor(score));
    else{const lb=await ysdk.getLeaderboards();await lb.setLeaderboardScore(name,Math.floor(score));}}catch(e){}},
  async get(name){if(!ysdk)return null;try{const o={quantityTop:10,includeUser:true,quantityAround:2};
    if(ysdk.leaderboards&&ysdk.leaderboards.getEntries)return await ysdk.leaderboards.getEntries(name,o);
    const lb=await ysdk.getLeaderboards();return await lb.getLeaderboardEntries(name,o);}catch(e){return null;}},
  authed(){return !YP||!YP.isAuthorized||YP.isAuthorized();},
  // после входа это уже другой игрок со своим облаком: не пишем в него, пока не прочитали и не свели
  async login(){try{await ysdk.auth.openAuthDialog();if(cloudT){clearTimeout(cloudT);cloudT=0;}cloudLoaded=false;cloudPending=null;
    YP=await withTimeout(ysdk.getPlayer({scopes:false}),10000);await ycloud(3);return true;}catch(e){return false;}},
  vkOk(){return !!VK;},
  vkFriends(score){if(!VK)return;vkSend('VKWebAppShowLeaderBoardBox',{user_result:Math.floor(score)},60000).catch(e=>{
    // отказ игрока (закрыл окно) — молча; иначе таблица не настроена или недоступна
    const d=e&&(e.error_data||e.data)||{},c=d.error_code;if(c!==4)toast('Таблица друзей сейчас недоступна');});}
};

/* ================= звук: эффекты — синтез, музыка — записанные треки (ниже) =================
   Всё идёт через шины sfx/mus → общий компрессор-ограничитель → динамики: в массовом бою сумма не хрипит. */
let AC=null,BUS=null;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}if(AC)busInit();}
  // iOS после звонка ставит «interrupted», а не «suspended» — будим при любом состоянии, кроме «running»
  if(AC&&AC.state!=='running'&&!muted&&!document.hidden){try{const p=AC.resume();p&&p.catch&&p.catch(()=>{});}catch(e){}}return AC;}
function busInit(){const a=AC;try{const c=a.createDynamicsCompressor();c.threshold.value=-14;c.knee.value=8;c.ratio.value=8;c.attack.value=.003;c.release.value=.25;
    const master=a.createGain();master.gain.value=.9;c.connect(master);master.connect(a.destination);
    const sfx=a.createGain(),mus=a.createGain();sfx.connect(c);mus.connect(c);BUS={sfx,mus};}catch(e){BUS={sfx:a.destination,mus:a.destination};}}
/* разблокировка звука: браузеры (особенно iOS) разрешают звук только из касания/клика/клавиши (не из pointerdown пальцем).
   Слушаем всё и не снимаем слушатель — сработает на первом же настоящем жесте и после любого «interrupted».
   Будим контекст и при выключенных эффектах: иначе на iPhone не заиграет музыка. */
function unlockAudio(){if(AC&&AC.state==='running')return;const a=ac();if(!a)return;
  try{const b=a.createBuffer(1,1,22050),s=a.createBufferSource();s.buffer=b;s.connect(a.destination);s.start(0);}catch(e){}musTick();}
for(const t of['pointerdown','touchend','click','keydown'])window.addEventListener(t,unlockAudio,{capture:true,passive:true});
// не больше 12 звуков одновременно: лишние (обычно в каше массового боя) пропускаем
let voices=0;const VOICE_MAX=12;
function voiceOk(d){if(voices>=VOICE_MAX)return false;voices++;setTimeout(()=>{voices--;},d*1000+60);return true;}
function tone(f,d,type,v,f2,delay,dest){if(!S.sound||muted)return;const a=ac();if(!a||!voiceOk(d+(delay||0)))return;const t=a.currentTime+(delay||0);
  const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.12,t+.01);g.gain.exponentialRampToValueAtTime(.0008,t+d);
  o.connect(g).connect(dest||BUS.sfx);o.start(t);o.stop(t+d+.03);}
let NB=null;
function noise(d,v,freq,q){if(!S.sound||muted)return;const a=ac();if(!a||!voiceOk(d))return;
  if(!NB){NB=a.createBuffer(1,a.sampleRate*.5,a.sampleRate);const ch=NB.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;}
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;s.buffer=NB;f.type='bandpass';f.frequency.value=freq||1000;f.Q.value=q||1;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.2,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f).connect(g).connect(BUS.sfx);s.start(t);s.stop(t+d);}
// частые звуки: не чаще раза в ms (реального времени — на ×2/×3 интервал растёт вместе со скоростью) и с лёгкой расстройкой
const SNDT={};
function thr(k,ms){const n=performance.now(),m=(typeof G!=='undefined'&&G&&G.speed>1)?G.speed:1;if(SNDT[k]&&n-SNDT[k]<ms*m)return false;SNDT[k]=n;return true;}
const dt5=()=>rand(.95,1.05);
const SND={
  arrow(){if(thr('ar',90))noise(.07,.05,3200*dt5(),1.2);},
  cannon(){if(thr('cn',110)){noise(.22,.14,420*dt5(),.8);tone(140*dt5(),.18,'sine',.1,55);}},
  boom(){if(thr('bm',110)){noise(.3,.15,260*dt5(),.7);tone(90,.25,'sine',.11,40);}},
  splash(){if(thr('sp',120)){noise(.2,.07,900*dt5(),2);tone(300,.12,'sine',.05,180);}},
  zap(){if(thr('zp',100)){noise(.16,.08,3800*dt5(),.6);tone(1500*dt5(),.1,'sawtooth',.03,220);}},
  roots(){if(thr('rt',140)){noise(.25,.12,160,1);tone(70,.25,'triangle',.1,40);}},
  kill(){if(thr('kl',80))tone(rand(420,520),.07,'triangle',.05,200);},
  coin(){if(thr('co',90)){const k=dt5();tone(1300*k,.05,'square',.025);tone(1750*k,.09,'square',.025,0,.05);}},
  build(){noise(.12,.12,700,1);tone(330,.1,'triangle',.08,0,.05);tone(494,.14,'triangle',.08,0,.12);},
  up(){[392,523,659,784].forEach((f,i)=>tone(f,.16,'triangle',.08,0,i*.06));},
  sell(){tone(900,.07,'square',.03);tone(600,.1,'square',.03,0,.07);},
  leak(){if(thr('lk',150))tone(260,.25,'sawtooth',.06,120);},
  wave(){tone(196,.4,'sawtooth',.05,196);tone(294,.5,'sawtooth',.05,0,.18);tone(392,.6,'triangle',.07,0,.36);},
  boss(){tone(110,.9,'sawtooth',.09,55);noise(.8,.11,200,.5);},
  // свист — самая чувствительная для уха область: тише и ниже
  whistle(){tone(1500,.55,'sine',.06,2400);tone(2000,.45,'sine',.03,1300,.15);},
  thunder(){noise(.6,.18,300,.5);noise(.3,.1,2500,.4);tone(80,.5,'sine',.1,35);},
  purr(){for(let i=0;i<6;i++)tone(90+i%2*12,.12,'sawtooth',.03,0,i*.11);tone(700,.4,'sine',.04,1000,.1);},
  frog(){if(thr('fr',150)){tone(300,.08,'square',.05,200);tone(260,.12,'square',.05,160,.1);}},
  click(){tone(660,.05,'triangle',.06);},
  star(i){tone(880+i*220,.25,'triangle',.09);tone(1320+i*330,.3,'sine',.05,0,.05);},
  win(){[523,659,784,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',.09,0,i*.13));},
  lose(){[392,349,311,262].forEach((f,i)=>tone(f,.35,'triangle',.09,0,i*.18));}
};

/* ================= музыка: записанные треки (audio/*.m4a, моно), авторы — в «Благодарностях» (ui.js, openCredits) =================
   Меню, деревня, кузница — «Market Day»; бой — «Zombies also love to play the fool»; пока жив босс — «Brave Soldiers».
   Web Audio: fetch → decodeAudioData → AudioBufferSourceNode с loop (петля без щелчка). Раскрытым (PCM) в памяти держим
   только нужный сейчас трек (моно, ~30 МБ на самый длинный); сжатый файл (≤1,3 МБ) храним, чтобы не качать заново.
   Сеть не ответила — ещё 2 попытки через 20 с; не раскодировался — больше не пробуем. До загрузки — тишина.
   musTick() раз в 200 мс сам включает, меняет (кроссфейд ~1 с) и глушит (S.music, реклама, сворачивание);
   после паузы трек продолжается с того же места. Громкость — MUS_VOL × MUS_TV (Market Day на 7 дБ громче остальных). */
const MUSF={market:'audio/market.m4a',battle:'audio/battle.m4a',boss:'audio/boss.m4a'},MUS_VOL=.3,MUS_TV={market:.45,battle:1,boss:.85};
const MUS={mode:'menu',buf:{},ab:{},ld:{},fail:{},cur:null,src:null,g:null,t0:0,off:0,v:0,fade:0,pos:{}};
function musPref(){return MUS.mode!=='battle'?'market':typeof G!=='undefined'&&G&&G.boss&&!G.boss.dead?'boss':'battle';}
function musWant(){if(!S.music||muted||paused||document.hidden)return null;return musPref();}
function musicMode(m){MUS.mode=m;musTick();}
function musicSync(){musTick();}
function musicStop(){musTick();}
// края трека: пропускаем тишину кодека в начале/конце, чтобы на стыке петли не было паузы
function musEdges(b){const sr=b.sampleRate,n=b.length,lim=Math.min(n>>1,sr*2),th=.002,chs=[];for(let c=0;c<b.numberOfChannels;c++)chs.push(b.getChannelData(c));
  const loud=i=>chs.some(d=>Math.abs(d[i])>th);let i0=0,i1=n-1;while(i0<lim&&!loud(i0))i0++;while(i1>n-lim&&!loud(i1))i1--;
  b._ls=i0<lim?i0/sr:0;b._le=i1>n-lim?(i1+1)/sr:b.duration;}
function musLoad(n){const l=MUS.ld[n];if(MUS.buf[n]||!AC||l===1||(l&&performance.now()<l))return;MUS.ld[n]=1;
  const dec=ab=>new Promise((ok,no)=>{const p=AC.decodeAudioData(ab.slice(0),ok,no);if(p&&p.catch)p.catch(no);});
  const get=MUS.ab[n]?Promise.resolve(MUS.ab[n]):fetch(MUSF[n]).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.arrayBuffer();}).then(ab=>MUS.ab[n]=ab);
  get.then(ab=>dec(ab).then(b=>{musEdges(b);if(musPref()===n)MUS.buf[n]=b;MUS.ld[n]=0;},()=>{MUS.ld[n]=Infinity;}))   // не раскодировался — не мучаем
    .catch(()=>{MUS.fail[n]=(MUS.fail[n]||0)+1;MUS.ld[n]=MUS.fail[n]>=3?Infinity:performance.now()+20000;});}
function musPos(){const b=MUS.buf[MUS.cur]||MUS.src.buffer,L=b._le-b._ls;return b._ls+((MUS.off-b._ls)+(AC.currentTime-MUS.t0))%L;}
function musStart(n,v,fade){const a=AC,b=MUS.buf[n],t=a.currentTime,s=a.createBufferSource(),g=a.createGain();
  s.buffer=b;s.loop=true;s.loopStart=b._ls;s.loopEnd=b._le;const off=MUS.pos[n]!=null?MUS.pos[n]:b._ls;delete MUS.pos[n];
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+fade);s.connect(g).connect(BUS.mus);s.start(t,off);
  Object.assign(MUS,{cur:n,src:s,g,t0:t,off,v,fade:t+fade});}
function musStop(fade,keep){const a=AC,s=MUS.src,g=MUS.g,t=a.currentTime;if(keep)MUS.pos[MUS.cur]=musPos();else delete MUS.pos[MUS.cur];
  MUS.src=MUS.g=MUS.cur=null;if(a.state!=='running'){try{s.stop();}catch(e){}try{g.disconnect();}catch(e){}return;}
  try{g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+fade);s.stop(t+fade+.05);}catch(e){}
  setTimeout(()=>{try{g.disconnect();}catch(e){}},fade*1000+400);}
function musTick(){if(!AC)return;const n=musWant(),run=AC.state==='running';
  if(n){musLoad(n);if(!run&&!muted)AC.resume().catch(()=>{});}
  if(MUS.src&&(MUS.cur!==n||!run))musStop(n?1:.4,!n||MUS.cur===n);   // смена трека — с начала; пауза/выключено — запомним место
  if(!MUS.src&&n&&run&&MUS.buf[n])musStart(n,MUS_VOL*(MUS_TV[n]||1),1);
  // лишние раскрытые треки выгружаем (играющий при кроссфейде держит свой буфер сам, пока не доиграет)
  const keep=S.music?musPref():null;for(const k in MUS.buf)if(k!==keep&&k!==MUS.cur)delete MUS.buf[k];
}
setInterval(musTick,200);

/* ================= тост ================= */
let toastT=0;
// держится не меньше 2,5 с: 1 с + 60 мс на знак
function toast(s){s=langToast(s);const t=$('toast');t.textContent=s;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),Math.max(2500,1000+60*String(s).length));}
