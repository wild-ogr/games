/* ================= «Из ларька в магнаты: бизнес» — обвес площадок (shell.js) =================
   Площадка (Яндекс Игры / VK Игры), SDK и мост, облако (Яндекс setData, VK — куски по 1800 символов с двойным буфером),
   пауза, звук-синтез SND, buzz, реклама (rewarded / межэкранная по «долгу» закрытий месяца), покупки PAY (общий модуль,
   байт-в-байт как в «Козле»/«Дураке») + PAY_ITEMS, рейтинг LB (Яндекс «week», VK — таблица друзей), язык L/pl/LANG/setLang,
   окна modal/hideModal/toast, настройки, «Об игре», offerReturn. Образцы — ~/Projects/kozel, ~/Projects/vyezd.
   Хуки (если есть): window.onCloud() — облако подменило S; window.onSdkReady() — SDK/мост готов или не пришёл (один раз);
   window.uiRefresh() — после покупки, смены языка, облака.
   ПРАВИЛО: любой текст игроку — сразу на двух языках L('русский','English'); VK — всегда русский, без слова «Яндекс». */
'use strict';
const $=id=>document.getElementById(id);
const isObj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function plural(n,a,b,c){if(n%1)return b;n=Math.abs(n)%100;   // дробные — «7,5 минуты», «1,5 месяца»
const k=n%10;return n>10&&n<20?c:k>1&&k<5?b:k===1?a:c;}

/* ================= язык: русский / английский =================
   VK — всегда русский. Яндекс — выбор игрока в ⚙ (localStorage magnat-lang) > ysdk.environment.i18n.lang > ?lang= > navigator.language;
   ru/be/kk/uk/uz → русский, остальное → английский. На маке (localhost) ?lang=en|ru главнее всего. */
const RU_LANGS=['ru','be','kk','uk','uz'],LANG_KEY='magnat-lang';
const normLang=l=>RU_LANGS.indexOf(String(l||'').slice(0,2).toLowerCase())>=0?'ru':'en';
const IS_VK=/[?&](vk_app_id|vk)=/.test(location.search),QLANG=new URLSearchParams(location.search).get('lang'),
  LOCAL=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
let LANG_MAN=null;try{const v=localStorage.getItem(LANG_KEY);if(v==='ru'||v==='en')LANG_MAN=v;}catch(e){}
let LANG=IS_VK?'ru':QLANG&&LOCAL?normLang(QLANG):LANG_MAN||normLang(QLANG||navigator.language||'ru');
document.documentElement.lang=LANG;
const L=(ru,en)=>LANG==='en'?en:ru;
// число + слово: pl(5,'месяц','месяца','месяцев','month','months')
function pl(n,a,b,c,e1,e2){return LANG==='en'?(n===1?e1:e2):plural(n,a,b,c);}
const crTxt=n=>n+' 💎';

/* ================= сохранение ================= */
const SKEY='magnat-v1';
let S={w:null,cr:20,crE:{},adW:0,ask:{},tut:{},fame:[]};
// M24: мир пишем упакованным без потерь (js/savepack.js: имена полей массивов — один раз; 90 тыс. знаков → ~55), читаем — распаковываем; игра видит только обычный мир.
// Старый сейв (без метки w.$pk) читается как есть; без PACK или если проверка обратимости не прошла — пишем как раньше
function wIn(o){if(isObj(o)&&isObj(o.w)&&o.w.$pk===1){try{o.w=PACK.unpack(o.w);}catch(e){try{localStorage.setItem('magnat-backup-'+Date.now(),JSON.stringify(o));}catch(x){}o.w=null;}}return o;}
function sOut(){return isObj(S.w)&&typeof PACK!=='undefined'?Object.assign({},S,{w:PACK.packSafe(S.w)}):S;}
try{const r=localStorage.getItem(SKEY);if(r){let o=null;try{o=wIn(JSON.parse(r));}catch(e){}if(isObj(o))S=Object.assign(S,o);else try{localStorage.setItem('magnat-backup-'+Date.now(),r);}catch(e){}}}catch(e){}   // сейв не читается — кладём копию рядом, а не теряем молча (игра начнётся заново, облако может вернуть мир)
const OBJF=['rbN','rbHi','crE','ask','tut','cos','pk','psG','psT','wall','lxE','lxc','col','colG','thU','adT','wS','lxSeen'];   // M43: wS — увиденное на Стене, lxSeen — показанные вещи в продаже (объединение = «прочитано по максимуму»)   // M31: adT — пауза мест рекламы (мс последнего ролика), берём позднее   // M27: thU — открытые темы оформления (js/themes.js), объединение
   // M8: стена почёта, вещи, украшения вещей, наборы — объединение // cos — украшения за 💎, pk — улучшения «Доли основателя» (объединение, берём больший уровень); psG/psT — «Путёвка председателя» (день начала / сколько взято по ключу покупки)
// защита от сохранений неожиданной формы (ручная правка, старая версия)
function fixSave(){for(const f of OBJF)if(!isObj(S[f]))S[f]={};
  if(S.w!=null&&!isObj(S.w))S.w=null;
  if(typeof S.cr!=='number'||!isFinite(S.cr))S.cr=20;if(S.cr<0)S.cr=0;S.cr=Math.floor(S.cr);
  if(typeof S.adW!=='number'||!isFinite(S.adW)||S.adW<0)S.adW=0;
  if(!Array.isArray(S.fame))S.fame=[];S.fame=S.fame.filter(isObj);
  for(const f of ['ts','lastT','maxT'])if(S[f]!=null&&(typeof S[f]!=='number'||!isFinite(S[f])))delete S[f];
  if(S.wk!=null&&!isObj(S.wk))delete S.wk;if(S.adCr!=null&&!isObj(S.adCr))delete S.adCr;if(S.adR!=null&&!isObj(S.adR))delete S.adR;
  if(S.th!=null&&typeof S.th!=='string')delete S.th;if(S.adTot!=null&&(typeof S.adTot!=='number'||!isFinite(S.adTot)))delete S.adTot; // M27: темы
  // M28: S.st0 — первый запуск игры (мс; для «Стартового набора» — первые 10 реальных дней). Старый игрок — день первого запуска из статистики (S.stc.c, ГГГГММДД)
  if(typeof S.st0!=='number'||!isFinite(S.st0)||S.st0<=0){const c=isObj(S.stc)?+S.stc.c:0;S.st0=c>2e7?Date.UTC(Math.floor(c/1e4),Math.floor(c/100)%100-1,c%100):Date.now();}
  if(S.payT!=null&&!Array.isArray(S.payT))S.payT=[];if(S.payV!=null&&!Array.isArray(S.payV))S.payV=[];if(S.buy!=null&&!isObj(S.buy))S.buy={};if(S.buyB!=null&&!isObj(S.buyB))S.buyB={};}
fixSave();
// «точка отсчёта» с облаком (как монеты в «Козле»): 💎, заработанные/потраченные на устройстве с этой точки, прибавляются к облачным
let BOOT_TS=S.ts||0,BOOT_CR=S.cr;
// облако: Яндекс — не чаще раза в 3,5 с, VK — раза в 15 с; при сворачивании — сразу. Пока облако не прочитано и не слито — не пишем
let cloudT=0,cloudReady=false,cloudBusy=false,cloudTry=0,cloudBroken=0;
function save(){S.ts=nowMs();
  try{localStorage.setItem(SKEY,JSON.stringify(sOut()));}catch(e){}
  if(!cloudReady){cloudLoad();return;}
  if((YP||VK)&&!cloudT)cloudT=setTimeout(cloudFlush,YP?3500:15000);}
function cloudFlush(){clearTimeout(cloudT);cloudT=0;if(!cloudReady)return;
  try{if(YP){const ts=S.ts,c=S.cr;YP.setData(sOut(),true).then(()=>{BOOT_TS=ts;BOOT_CR=c;}).catch(()=>{});}else if(VK)vkSaveCloud();}catch(e){}}
function canon(o){return JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((r,x)=>(r[x]=v[x],r),{}):v);}
const noTs=o=>Object.assign({},o,{ts:0});
async function cloudLoad(force){if(cloudBusy||cloudReady||!(YP||VK)||(!force&&Date.now()-cloudTry<10000))return;cloudBusy=true;cloudTry=Date.now();
  try{const d=wIn(YP?await timeLim(YP.getData(),8000):await vkLoadCloud());
    const before=canon(noTs(S));mergeSave(d);fixSave();cloudReady=true;cloudBroken=0;if(d&&typeof d.ts==='number'&&d.ts>0)try{localStorage.setItem('magnat-cl','1');}catch(e){}statProg();
    if(d&&typeof d.ts==='number')BOOT_TS=Math.max(BOOT_TS,d.ts);BOOT_CR=S.cr;
    const ch=canon(noTs(S))!==before;
    if(ch){try{localStorage.setItem(SKEY,JSON.stringify(sOut()));}catch(e){}}
    if(!d||canon(noTs(d))!==canon(noTs(S))){save();cloudFlush();}
    if(ch)cloudChanged();
  }catch(e){if(e&&e.broken&&++cloudBroken>=3){cloudReady=true;BOOT_CR=S.cr;save();}}finally{cloudBusy=false;}}
// облако пришло позже экрана: 💎 и оформление — здесь, остальное — хуки игры и интерфейса
function cloudChanged(){updCr();applyOffice();
  try{window.onCloud&&window.onCloud();}catch(e){setTimeout(()=>{throw e;});}
  try{window.uiRefresh&&window.uiRefresh();}catch(e){setTimeout(()=>{throw e;});}}

/* ================= площадка: Яндекс Игры или VK (модули — из «Козла»/«Выезда») ================= */
// третий режим — Android-приложение (APK, RuStore и др.): ?apk=1 на маке или window.__APK__ от обёртки. Покупок нет, реклама — через мост
const IS_APK=/[?&]apk=1/.test(location.search)||!!window.__APK__,APK_REAL=!!window.__APK__;
const PLAT=IS_APK?'apk':IS_VK?'vk':'yandex';
const apkAds=()=>window.__APK__&&window.__APK__.ads||null;
let ysdk=null,YP=null,VK=null,paused=false;
/*STAT*/
/* ===== STAT v1.2 (04.10.2026; v1 — 29.09): своя ОБЕЗЛИЧЕННАЯ статистика — общий модуль всех игр =====
   Источник — ~/Projects/hobby-analytics/stat/stat.js (правки только тут, в игры — stat-sync.sh). Как встраивать — stat/README.md.
   Никогда не отправляем: vk_user_id и параметры адреса запуска (кроме vk_platform, vk_ref), имя, IP, User-Agent целиком,
   постоянный номер игрока/устройства. Ключ — случайная строка СЕАНСА (только в памяти). На устройстве: день установки, число сеансов,
   день отметки, неотправленные пачки (stat-q-<игра>), признак новой функции (stat-srv), буквы опытов (stat-ab-<игра>-<опыт>).
   v1.2: очередь «без потерь» (включается сама по ответу функции {"v":2} / X-Stat: 2), bd — день пачки по Москве, adReq→ms, offer/hold с n,
   progress→start, bal→cb, ранние ошибки и незагрузившиеся файлы, act, perf, ab+cfg, adchk, earn, idle. Старый синтаксис: только var/function.
   05.10: perf v:2 — плавность меряем по кадрам БРАУЗЕРА, пока игра зовёт STAT.frame(); паузы игры, сворачивание и реклама в «подвисания» не идут. */
var STAT=(function(){
  var V=1,SV=12,FLUSH=90,MAXQ=40,MAXB=60,PMAX=30,PBYTES=3e5,SESS_GAP=30*60e3,MAXERR=5,THR=2e4;
  var O={},on=false,dev=false,G='',Q=[],pend=[],sk='',seq=0,t0=0,act=0,actT=0,vis=true,hideT=0,timer=0,
      st={c:0,n:0,d:0},hdr={},lvl=null,scr='',errN=0,resN=0,errSeen={},once={},lastErr='',
      srv=false,nm=0,fly={},fails=0,nextT=0,sP=null,sTm=0,prog=null,cb,mvT=0,aR={},thr={},eS=null,aC={},
      cfgO=null,cfgS=0,abs={},rdT=0,acted=0,pre=0,tp=0,fL=0,fP=0,fR=0,fX=0,fA=0,fC=0,fN=0,fH=[],fLo=999,fHg=0,fJ=0,pfS=0,FGR=100;
  function ls(k,v){try{if(v===undefined)return window.localStorage.getItem(k);if(v===null)window.localStorage.removeItem(k);else window.localStorage.setItem(k,v);}catch(e){}return null;}
  function jp(s){try{return s?JSON.parse(s):null;}catch(e){return null;}}
  function now(){var t=0;try{t=O.now?O.now():0;}catch(e){}return typeof t==='number'&&t>1.6e12?t:Date.now();}
  function dk(t){var d=new Date(t);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
  function bdk(){var d=new Date(now()+108e5);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();} // день по Москве
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

  /* STAT.init({g:'gastronom', gv:'v16', plat:PLAT, lang:LANG, url:STAT_URL, now:nowMs, S:S, rate:1}) — README.
     url пустой → модуль молчит. Боевой адрес на маке/LAN/file:// или в автомате (webdriver, HeadlessChrome) обнуляется (_dbg().cut);
     ?stat=dev на localhost — журнал в консоль и window.__stat без отправки. Площадка yandex на *.github.io пишется как p:'web',
     vk в Одноклассниках (vk_client=ok) — как p:'ok' (игра по-прежнему передаёт plat:PLAT, модуль различает сам). */
  var first=false,hooked=false,cut='';
  function locH(h){return /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|)$|\.localhost$|\.local$|\.test$|^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(String(h||''));}
  function locU(u){var m=/^https?:\/\/(\[[^\]]*\]|[^\/:?#]+)/i.exec(u);return !!m&&locH(m[1]);}
  function init(o){O=o||{};O.url=String(O.url||'');G=String(O.g||'game').slice(0,16);t0=Date.now();actT=t0;
    cut='';if(/^https?:/i.test(O.url)&&!locU(O.url)){var wd=false;try{wd=navigator.webdriver===true||/HeadlessChrome|PhantomJS|Puppeteer|Playwright/.test(navigator.userAgent||'');}catch(e){}
      cut=wd?'wd':location.protocol==='file:'?'file':locH(location.hostname)?'local':'';if(cut)O.url='';}
    dev=!O.url&&(O.dev===true||(/[?&]stat=dev/.test(location.search)&&/^(localhost|127\.0\.0\.1|\[::1\])$|\.localhost$|\.test$/.test(location.hostname)));
    var s=jp(ls('stat-'+G))||{},c=O.S&&O.S.stc||{};
    st={c:+s.c||+c.c||0,n:Math.max(+s.n||0,+c.n||0),d:Math.max(+s.d||0,+c.d||0)};
    var today=dk(now());first=!st.c;if(first)st.c=today;st.n++;srv=ls('stat-srv')==='2';
    if(!O.url&&!dev){on=false;window.__se=[];saveSt();return;}          // адреса нет — молчим
    if(!enabled()||Math.random()>=(typeof O.rate==='number'?O.rate:1)){on=false;ls('stat-q-'+G,null);saveSt();return;}
    start();}
  function start(){var d=device(),i,x,se=window.__se;on=true;sk=rnd();seq=0;
    // Одноклассники: та же VK-сборка, запущенная с vk_client=ok (vk_platform — с хвостом _ok; на маке ?vk=1&ok=1) → площадка p:'ok',
    // а vp — без хвоста (mobile_android_ok не влезает в 16 знаков; значения те же, что в VK: desktop_web, mobile_android, mobile_iphone, mobile_web)
    var okp=/[?&](vk_client=ok|vk_platform=[a-z_]*_ok|ok=1)(&|$)/.test(location.search);
    hdr={v:V,sv:SV,g:G,gv:String(O.gv||'').slice(0,20),p:String(O.plat==='yandex'&&/\.github\.io$/.test(location.hostname)?'web':O.plat==='vk'&&okp?'ok':O.plat||'').slice(0,8),l:String(O.lang||'').slice(0,4),
      vp:scrub(qp('vk_platform').replace(/_ok$/,''),16),src:scrub(qp('vk_ref'),32),os:d.os,dv:d.dv,wv:d.wv,br:d.br,sw:d.sw,sh:d.sh,sk:sk};
    pend=dev&&!O.url?[]:jp(ls('stat-q-'+G))||[];if(!(pend instanceof Array))pend=[]; // журнал мака очередь не трогает
    // start ждёт STAT.progress() (поля pl, cn, bt), но не дольше 3 с; события до него встанут после
    sP=['start',sec(),{sn:st.n,f:first?1:0,ld:Math.round(window.performance&&performance.now?performance.now():0)}];
    if(prog)rel();else sTm=setTimeout(rel,3000);
    dayMark();saveSt();
    if(se&&se.length){for(i=0;i<se.length;i++){x=se[i];if(x&&x[0]===2)res(x[1],x[2]);else if(x)err(x[1],x[2],x[3],0,{e:1});}}window.__se=[];
    if(!hooked){hooked=true;
      window.addEventListener('error',function(e){var x=e&&e.target;if(x&&x!==window&&x.tagName){res(x.src||x.href||'',x.tagName);return;}
        err(e&&e.message,e&&e.filename,e&&e.lineno,e&&e.colno);},true);
      window.addEventListener('unhandledrejection',function(e){var r=e&&e.reason;err('promise: '+(r&&r.message||r),r&&r.stack?String(r.stack).split('\n')[1]:'');});
      document.addEventListener('visibilitychange',function(){document.visibilityState==='hidden'?hide():show();});
      window.addEventListener('pagehide',hide);
      window.addEventListener('blur',function(){fBrk();});window.addEventListener('focus',function(){fBrk();});
      var ts=['pointerdown','touchstart','keydown'];for(i=0;i<3;i++)document.addEventListener(ts[i],tap,{capture:true,passive:true});
      timer=setInterval(function(){if(on&&vis&&(Q.length||pend.length))flush();},FLUSH*1000);}
    setTimeout(flush,5000); // старое неотправленное + первые шаги — быстро (воронка первой минуты)
  }
  function rel(){if(!sP)return;clearTimeout(sTm);var e=sP,k;sP=null;if(prog)for(k in prog)e[2][k]=prog[k];e[2]=clean(e[2]);Q.unshift(e);log(e);
    if(cfgO||hasAb())cfg();}
  function log(e){if(dev){try{(window.__stat=window.__stat||[]).push(e);if(window.console)console.log('[STAT]',e[0],JSON.stringify(e[2]));}catch(x){}}}
  // «зашёл сегодня» — раз в календарный день, dn = дней с установки (по дню устройства/сервера игры)
  function dayMark(){var t=dk(now());if(st.d===t)return;st.d=t;ev('day',{dn:Math.max(0,ddiff(st.c,t)),sn:st.n});saveSt();}
  function ev(n,p){if(!on)return;var e=[String(n).slice(0,16),sec(),clean(p)];Q.push(e);log(e);
    if(e[0]==='ready'&&!rdT)rdT=Date.now();
    if(Q.length>=MAXQ)flush();}
  function onceEv(n,p){if(once[n])return;once[n]=1;ev(n,p);}

  // --- вход: STAT.progress({pl:уровень, cn:монеты, bt:1}) — после загрузки сохранения; STAT.bal(n) — баланс монет (в pause → cb) ---
  function progress(o){o=o||{};prog={};if(o.pl!==undefined)prog.pl=+o.pl||0;if(o.cn!==undefined){prog.cn=+o.cn||0;if(cb===undefined)cb=prog.cn;}
    if(o.bt!==undefined)prog.bt=o.bt?1:0;rel();}
  function bal(n){if(typeof n==='number'&&isFinite(n))cb=n;}

  // --- уровни: STAT.lvl(5,'daily',{n:3}) в начале, STAT.use('hint') по ходу, STAT.end('win',{st:3}) в конце; STAT.move() — каждый ход ---
  function lvlStart(l,m,x){if(lvl)lvlEnd('quit');lvl={l:l,m:m||'',t:Date.now(),h:0,u:0,x:{}};var p={l:l},k,n=0;if(m)p.m=m;
    if(x)for(k in x)if(x.hasOwnProperty(k)&&n++<3)p[k]=x[k];ev('lvl',p);}
  function use(k,n){if(lvl){if(k==='hint')lvl.h+=n||1;else if(k==='undo')lvl.u+=n||1;else lvl.x[k]=(lvl.x[k]||0)+(n||1);}}
  function lvlEnd(r,p){if(!lvl)return;var o={l:lvl.l,r:r,s:Math.round((Date.now()-lvl.t)/1000)},k;if(lvl.m)o.m=lvl.m;if(lvl.h)o.h=lvl.h;if(lvl.u)o.u=lvl.u;
    if(r==='quit'&&mvT)o.idle=idle();for(k in p||{})if(p.hasOwnProperty(k))o[k]=p[k];lvl=null;ev('end',o);}
  function screen(n){if(n===scr)return;scr=String(n).slice(0,16);if(!once['s_'+scr]){once['s_'+scr]=1;ev('scr',{n:scr});}}
  function move(){mvT=Date.now();}
  function idle(){return Math.round((Date.now()-mvT)/1000);}

  /* --- реклама: STAT.place('hint') у кнопки; STAT.adReq('rew'|'int') прямо перед вызовом SDK; STAT.ad(f, r, код) — итог (поле ms — от adReq).
     Место живёт до итога (r не 'show'/'hold'). STAT.ad('rew','hold') — нажали по погасшей кнопке; STAT.offer(p) — кнопку показали:
     оба не чаще раза в 20 с на место, поле n — сколько набежало. STAT.ad('int','none','cap'|'gap'|'nosdk'|'nofill') — межэкранная не показана. --- */
  var place='';
  function setPlace(p){place=String(p||'').slice(0,16);}
  function adReq(f){aR[f]=Date.now();fBrk(2e5);}
  function thrN(k,n,p){var x=thr[k]||(thr[k]={c:0,t:0}),t=Date.now();x.c++;x.n=n;x.p=p;if(t-x.t>=THR){x.t=t;thrOut(x);}}
  function thrOut(x){if(!x.c)return;x.p.n=x.c;x.c=0;ev(x.n,x.p);}
  function ad(f,r,code,x){var p={f:f,r:r,p:f==='int'?'int':(place||'?')},k;if(code!==undefined&&code!==null&&code!=='')p.c=scrub(code,24);
    if(x)for(k in x)if(x[k]!==undefined&&x[k]!==null&&p[k]===undefined)p[k]=x[k]; /* 4-й параметр — свои поля итога, напр. {pr:1} «ролик был готов к нажатию» */
    if(r==='hold'){thrN('h'+p.p,'ad',p);return;}
    fX=0;fBrk(r==='show'?2e5:1000); /* плавность: пока идёт реклама (и секунду после итога) кадры не меряем */
    if(aR[f]){p.ms=Date.now()-aR[f];aR[f]=0;}ev('ad',p);if(f!=='int'&&r!=='show')place='';}
  function offer(p){p=String(p).slice(0,13);thrN('o'+p,'of_'+p,{p:p});}
  function adChk(f,ok){var x=aC[f]||(aC[f]={y:0,n:0});x[ok?'y':'n']++;}
  // --- монеты: STAT.earn('lvl'|'ad'|'gift'|'chest'|'buy'|'quest'|'oth', n) — сводка earn при сворачивании ---
  function earn(s,n){if(!(n>0))return;s=/^(lvl|ad|gift|chest|buy|quest)$/.test(s)?s:'oth';eS=eS||{};eS[s]=(eS[s]||0)+n;}
  // --- опыты: STAT.ab('fr1',2) → 'A'|'B' (после init; вариант хранится на устройстве, наружу — только имя и буква в cfg).
  //     nw=true — только новичкам (первый запуск), остальным '' ; STAT.cfg({th, snd, calm}) — настройки сеанса → событие cfg ---
  function ab(id,n,nw){id=String(id).toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8);n=Math.max(2,Math.min(26,n|0||2));
    var k='stat-ab-'+G+'-'+id,v=abs[id]||ls(k)||'';if(!/^([A-Z]|-)$/.test(v)){v=nw&&!first?'-':String.fromCharCode(65+Math.floor(Math.random()*n));ls(k,v);}
    abs[id]=v;return v==='-'?'':v;}
  function hasAb(){for(var k in abs)if(abs[k]!=='-')return true;return false;}
  function cfg(o){var k,a=[],p;if(o){cfgO=cfgO||{};for(k in o)if(/^(th|snd|calm)$/.test(k))cfgO[k]=o[k];}
    if(!on||sP||cfgS)return;cfgS=1;for(k in abs)if(abs[k]!=='-')a.push(k+':'+abs[k]);p={};if(a.length)p.ab=a.join(',');
    for(k in cfgO||{})p[k]=cfgO[k];p.lg=String(O.lang||'');ev('cfg',p);}

  // --- первое нажатие: act {ms} от ready (без ready — от начала сеанса, при сворачивании, nr:1) ---
  function tap(){if(acted||!on)return;var t=Date.now();if(!rdT){pre++;if(!tp)tp=t;return;}acted=1;var p={ms:t-rdT};if(pre)p.pre=pre;ev('act',p);}
  /* --- плавность: STAT.frame() раз за кадр игрового цикла → perf {fps (медиана), lo (худшая секунда), hg (подвисаний > 1 с), jk (рывков > 0,25 с), s (секунд замера), v:2}.
     v:2 (05.10): игра своим вызовом только говорит «я сейчас рисую» (fL). Модуль сам ведёт цепочку кадров браузера (ftick) и меряет промежутки
     между НИМИ. Промежуток идёт в счёт, только если игра звала frame() прямо перед ним (не раньше FGR мс до его начала) — то есть ждала кадр.
     Игра перестала звать (пауза, окно, спящий цикл) → цепочка гаснет, после возобновления первый промежуток не считается: пауза — не подвисание.
     Помехи (fX): сворачивание/возврат, потеря/возврат фокуса (системные окна поверх игры), реклама от adReq/ad('show') до итога + 1 с — промежутки с ними
     выбрасываются. Старый счёт (до 05.10, без v) мерил разрыв между вызовами игры и принимал её паузы за подвисания — его hg и lo не верить. --- */
  function frame(){fL=Date.now();if(!fR&&on&&window.requestAnimationFrame){fR=1;requestAnimationFrame(ftick);}}
  function ftick(){var t=Date.now(),d=t-fP,ok=fP>0&&fL>=fP-FGR&&fX<fP&&vis&&d>=0&&d<=5000;fR=0;
    if(t-fL>FGR&&!ok){fP=0;return;}                 // игра кадров не просит — серия кончилась
    fP=t;fR=1;requestAnimationFrame(ftick);if(!ok)return;
    fN++;fC++;fA+=d;if(d>1000)fHg++;if(d>250)fJ++;
    if(fA>=1000){d=Math.min(240,Math.round(fC*1000/fA));fH[d]=(fH[d]||0)+1;if(d<fLo)fLo=d;fA=0;fC=0;}}
  function fBrk(ms){var t=Date.now()+(ms||0);if(t>fX)fX=t;}   // помеха: промежутки кадров до этой минуты не считаем
  function perf(){var i,s=0,h=0;if(pfS||fN<300)return;for(i=0;i<=240;i++)s+=fH[i]||0;if(!s)return;pfS=1;for(i=0;i<=240;i++){h+=fH[i]||0;if(h*2>=s)break;}
    ev('perf',{fps:i,lo:fLo,hg:fHg,jk:fJ,s:s,v:2});}

  // --- ошибки JS: не больше MAXERR разных за сеанс, без адресов с параметрами (в них vk_user_id!); x — доп. поля (e:1 — до запуска) ---
  function err(m,src,ln,col,x){if(!on||errN>=MAXERR)return;m=scrub(m||'?',120);src=scrub(String(src||'').replace(/[?#].*$/,'').replace(/^.*\//,''),40)+(ln?':'+ln+(col?':'+col:''):'');
    var k=m+'|'+src,p={m:m,s:src,l:lvl?lvl.l:'',sc:scr};if(errSeen[k])return;errSeen[k]=1;errN++;lastErr=m;if(x&&x.e)p.e=x.e;ev('err',p);if(!sP)flush();}
  // незагрузившийся файл → err {e:2, f:имя файла}; SDK Яндекса вне Яндекса — не ошибка
  function res(u,tag){u=String(u||'');if(!on||resN>=MAXERR||(/\/sdk\.js([?#]|$)/.test(u)&&hdr.p!=='yandex'))return;
    var f=scrub(u.replace(/[?#].*$/,'').replace(/^.*\//,''),40);if(errSeen['f|'+f])return;errSeen['f|'+f]=1;resN++;
    ev('err',{m:'load '+String(tag||'').toLowerCase(),e:2,f:f,sc:scr});}

  /* --- отправка: пачка сначала в очередь pend (localStorage), потом fetch cors. Функция с признаком v2 ({"v":2} / X-Stat: 2) →
     режим «без потерь» (stat-srv=2): удаляем только после 2xx, при сворачивании sendBeacon не удаляет. Без признака (старая 204) —
     как раньше: доставлено сразу, beacon удаляет. Сеть/5xx/429 — повтор (после 3 неудач подряд пауза 90 → 180 → … ≤ 900 с). --- */
  function pack(){var b={},k;for(k in hdr)b[k]=hdr[k];b.dk=dk(now());b.dn=Math.max(0,ddiff(st.c,b.dk));b.sn=st.n;b.q=++seq;b.bd=bdk();b.e=Q.splice(0,MAXB);return b;}
  function bk(b){return b.sk+'.'+b.q;}
  function keep(){var s=JSON.stringify(pend),n=0;while(pend.length&&(pend.length>PMAX||s.length>PBYTES)){pend.shift();n++;s=JSON.stringify(pend);}
    if(n){var L=pend[pend.length-1],e=['lost',sec(),{n:n}];if(L&&L.e.length<MAXB){L.e.push(e);s=JSON.stringify(pend);}else Q.push(e);} // lost — в самую свежую пачку
    if(O.url)ls('stat-q-'+G,pend.length?s:null);}
  function drop(b){for(var i=0;i<pend.length;i++)if(bk(pend[i])===bk(b)){pend.splice(i,1);keep();return;}}
  function got(b,s,mark){if(mark){if(!srv)ls('stat-srv','2');srv=true;nm=0;}else if(s>=200&&s<300&&srv&&++nm>=3){srv=false;ls('stat-srv',null);}
    if(s>=500||s===429||!s)return bad();fails=0;nextT=0;drop(b);flush();}
  function bad(){fails++;if(fails>=3)nextT=Date.now()+Math.min(900,90*Math.pow(2,fails-3))*1000;}
  function send(b){var s=JSON.stringify(b),k=bk(b),t=Date.now();if(fly[k]&&t-fly[k]<3e4)return;fly[k]=t;
    function fin(c,mark){delete fly[k];got(b,c,mark);}
    function no(){delete fly[k];bad();}
    try{if(window.fetch){fetch(O.url,{method:'POST',mode:'cors',body:s,keepalive:s.length<6e4,headers:{'Content-Type':'text/plain'}}).then(function(r){
        var h='';try{h=r.headers.get('X-Stat')||'';}catch(e){}
        return r.text().then(function(x){fin(r.status,h==='2'||/"v"\s*:\s*2/.test(x));},function(){fin(r.status,h==='2');});},no);return;}
      var x=new XMLHttpRequest();x.open('POST',O.url,true);x.setRequestHeader('Content-Type','text/plain');
      x.onload=function(){fin(x.status,/x-stat:\s*2/i.test(x.getAllResponseHeaders()||'')||/"v"\s*:\s*2/.test(x.responseText||''));};x.onerror=no;x.send(s);}catch(e){no();}}
  function flush(){if(!on||sP)return;while(Q.length)pend.push(pack());keep();
    if(dev&&!O.url){pend=[];keep();return;}
    if(navigator.onLine===false||!pend.length||Date.now()<nextT)return;send(pend[0]);}
  function beacon(){var i,b,ok,left=[];if(dev&&!O.url){pend=[];keep();return;}if(navigator.onLine===false)return;
    for(i=0;i<pend.length;i++){b=pend[i];ok=false;try{ok=!!(navigator.sendBeacon&&navigator.sendBeacon(O.url,JSON.stringify(b)));}catch(e){}
      if(!ok||srv)left.push(b);}
    pend=left;keep();if(pend.length&&!srv)send(pend[0]);}
  function hide(){if(!on||!vis)return;vis=false;act+=Date.now()-actT;hideT=Date.now();fP=0;fBrk();rel();var k,p={d:actSec()};
    for(k in thr)thrOut(thr[k]);if(eS){ev('earn',eS);eS=null;}for(k in aC){if(aC[k].y||aC[k].n)ev('adchk',{f:k,y:aC[k].y,n:aC[k].n});aC[k]={y:0,n:0};}
    perf();if(!acted&&tp&&!rdT){acted=1;ev('act',{ms:tp-t0,nr:1});}
    if(lvl)p.l=lvl.l;if(scr)p.sc=scr;if(cb!==undefined)p.cb=cb;if(mvT)p.idle=idle();ev('pause',p);
    while(Q.length)pend.push(pack());keep();beacon();}
  function show(){if(!on||vis)return;vis=true;actT=Date.now();fBrk();
    if(Date.now()-hideT>SESS_GAP){ // долго не было — новый сеанс (новый ключ, счётчик сеансов +1)
      if(lvl)lvl=null;once={};errN=0;resN=0;errSeen={};sk=rnd();hdr.sk=sk;seq=0;t0=Date.now();act=0;st.n++;saveSt();cfgS=0;
      var p={sn:st.n,f:0,r:1},k;for(k in prog||{})p[k]=prog[k];if(cb!==undefined)p.cn=cb;ev('start',p);if(cfgO||hasAb())cfg();}
    dayMark();}

  // облако игры: в mergeSave — STAT.merge(d.stc): раньше установлен, больше сеансов
  function merge(c){if(!c||typeof c!=='object')return;if(+c.c&&(!st.c||+c.c<st.c))st.c=+c.c;if(+c.n>st.n)st.n=+c.n;if(+c.d>st.d)st.d=+c.d;saveSt();}
  // --- переключатель «Анонимная статистика» для ⚙ (по умолчанию ВКЛ.; выбор — на устройстве, localStorage 'stat-off') ---
  function tx(ru,en){return typeof LANG!=='undefined'&&LANG==='en'?en:ru;}
  function enabled(){return ls('stat-off')!=='1';}
  function available(){return !!(O.url||dev);}          // адреса нет — строку в ⚙ не показываем
  function setEnabled(v){if(v){ls('stat-off',null);if(!on&&available())start();}
    else{ls('stat-off','1');Q=[];pend=[];sP=null;clearTimeout(sTm);ls('stat-q-'+G,null);on=false;}}
  function optOut(v){setEnabled(!v);}
  function label(){return tx('📊 Анонимная статистика: ','📊 Anonymous statistics: ')+(enabled()?tx('вкл','on'):tx('выкл','off'));}
  function note(){return tx('Уровни, ошибки и нажатия кнопок — без имени, ID и IP. Помогает делать игру лучше.',
    'Levels, errors and button taps — no name, ID or IP. Helps us improve the game.');}
  function toggle(){setEnabled(!enabled());return label();}
  return {v:SV,init:init,enabled:enabled,available:available,setEnabled:setEnabled,label:label,note:note,toggle:toggle,ev:ev,once:onceEv,lvl:lvlStart,use:use,end:lvlEnd,screen:screen,
    place:setPlace,ad:ad,adReq:adReq,offer:offer,adChk:adChk,err:err,flush:function(){rel();flush();},merge:merge,optOut:optOut,
    progress:progress,bal:bal,move:move,earn:earn,frame:frame,ab:ab,cfg:cfg,
    _dbg:function(){return {on:on,dev:dev,cut:cut,Q:Q,pend:pend,st:st,hdr:hdr,lvl:lvl,lastErr:lastErr,srv:srv,nm:nm,fails:fails,nextT:nextT,sP:!!sP,cb:cb,fN:fN,fHg:fHg,fJ:fJ,pl:place};}};
})();
/*/STAT*/
// STAT — своя ОБЕЗЛИЧЕННАЯ статистика (hobby-analytics/stat): без vk_user_id, IP и постоянного номера; выключатель — ⚙ «Анонимная статистика»
// адрес обязан кончаться на ?op=ev (без него функция отвечает 200 и молча выбрасывает пачку). На маке (localhost) — тишина, чтобы не засорять боевую базу:
// ?stat=dev — журнал [STAT] в консоль без отправки, ?stat=sink[:порт] — на локальный приёмник http://localhost:порт/fn?op=ev (проверка)
// локальная сеть (телефон с мака: 192.168.*, 10.*, 172.16–31.*, *.local) — тоже не боевая: STAT_URL пустой.
// ?rec=1 (localhost/LAN) — запись живой игры js/playtest.js: STAT в режиме журнала (window.__stat), без отправки в боевую базу
const STAT_LAN=/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)|\.local$/.test(location.hostname),
  STAT_REC=(LOCAL||STAT_LAN)&&/[?&]rec=1/.test(location.search);
const STAT_SINK=LOCAL?/[?&]stat=sink(?::(\d+))?/.exec(location.search):null;
const STAT_URL=STAT_SINK?'http://localhost:'+(STAT_SINK[1]||'8795')+'/fn?op=ev':LOCAL||STAT_LAN?'':'https://functions.yandexcloud.net/d4efqgmii6honbajplim?op=ev';
// бета для друзей: папка games/magnat-beta/ на GitHub (или ?beta=1 на маке/LAN) — пометка «ТЕСТ», «Написать отзыв» в ⚙, статистика с gv 'beta3' (бета-1 — 'beta1', бета-2 — 'beta2'; отдельно от настоящих цифр)
const BETA=/\/magnat-beta\//.test(location.pathname)||(LOCAL||STAT_LAN)&&/[?&]beta=1/.test(location.search);
const FB_URL='https://vk.me/igry_dvor';
STAT.init({g:'magnat',gv:BETA?'beta12':'v1',plat:PLAT,lang:LANG,url:STAT_URL,dev:STAT_REC,now:()=>nowMs(),S:S});
/* STAT v1.2 (M44): «монеты» статистики в Магнате — 💎 (S.cr): cn в start, cb в pause, earn по источникам (js/stat-hooks.js, GAME 'cr'; покупки — payAdd).
   progress — после облака или готовности SDK, но не позже 2,5 с (statProg; pl — глава 1–5, bt — облако хоть раз отдавало сохранение: метка устройства magnat-cl) */
STAT.bal(S.cr|0);
let statPr=0;function statProg(){if(statPr)return;statPr=1;let bt=0,pl=0;try{bt=localStorage.getItem('magnat-cl')?1:0;}catch(e){}
  try{const st=S.w&&S.w.st||'gig';pl=Math.max(1,['gig','small','mid','quarry','nedra'].indexOf(st)+1);}catch(e){}
  STAT.progress({pl:pl,cn:S.cr|0,bt:bt});STAT.bal(S.cr|0);}
setTimeout(statProg,2500);
// реклама: мы внутри колбэка досмотра ролика (showRewarded → cb0) — начисления 💎 в это время идут в earn как «ad» (stat-hooks.js)
let adInCb=0;
const pauseWhy=new Set();
function setPause(why,on){if(on)pauseWhy.add(why);else pauseWhy.delete(why);paused=muted=pauseWhy.size>0;
  if(AC){try{if(muted){const p=AC.suspend();p&&p.catch&&p.catch(()=>{});}else if(S.sound!==false)acWake();}catch(e){}}
  if(paused)YG.stop();else if(!modalOn)YG.start();}
// GameplayAPI Яндекса: «игра идёт» = время холдинга течёт (нет окна, паузы, рекламы)
const YG={on:false,
  start(){if(YG.on||!ygRun())return;YG.on=true;try{ysdk&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.start();}catch(e){}},
  stop(){if(!YG.on)return;YG.on=false;try{ysdk&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.stop();}catch(e){}}
};
// M47d (аудит-4 №14): «игра идёт» для Яндекса = время холдинга фактически течёт (GAME.running(): своя ⏸, «читаю», словарик, обучение — тоже стоп);
// до запуска мира — как раньше (нет окна и паузы площадки). hold/скорость меняются без вызова YG — поэтому раз в секунду сверяем
function ygRun(){try{if(typeof GAME!=='undefined'&&GAME.running&&GAME.W)return GAME.running();}catch(e){}return !paused&&!modalOn;}
setInterval(()=>{if(ysdk)ygRun()?YG.start():YG.stop();},1000);
// какой мир новее: сначала номер холдинга (после IPO — новый мир с маленьким w.t), потом игровые дни
const wGen=o=>isObj(o)&&isObj(o.w)?(o.rst|0)*1000+(typeof o.w.hold==='number'?o.w.hold:Array.isArray(o.fame)?o.fame.length:0):-1;
const wDays=o=>isObj(o)&&isObj(o.w)&&typeof o.w.t==='number'?o.w.t+(o.w.rbg|0)*1e7:-1;   // M48rb: мир после отката (w.rbg — сколько откатов) новее «ушедшего дальше» мира до отката
// слияние облака с локальным: мир — где больше холдинг/дней (при равенстве — новее ts), 💎 — облачные + изменение на устройстве,
// fame — объединение по hold, «за что дали» — объединение, покупки — payMerge, настройки — из более нового
function mergeSave(d,ref){if(!isObj(d))return;wIn(d);
  const dt=typeof d.ts==='number'?d.ts:0,rt=ref==null?BOOT_TS:ref,newer=dt>rt;
  if(isObj(d.w)){const ga=wGen(S),gb=wGen(d),ta=wDays(S),tb=wDays(d);
    if(gb>ga||gb===ga&&(tb>ta||tb===ta&&dt>(S.ts||0))){S.w=d.w;const ph0=S.ph;for(const f of ['wk','lastT','offMore','freeM','ph','adD','gift'])if(f in d)S[f]=d[f];S.ph=phMerge(S.ph,ph0);}
    else S.ph=phMerge(S.ph,d.ph);}   // M43: телефон едет с миром; прочитанное с другого устройства того же холдинга — по максимуму
  if(typeof d.cr==='number'&&isFinite(d.cr))S.cr=newer?Math.max(0,d.cr+(S.cr-BOOT_CR)):(dt===rt&&!dt)?Math.max(S.cr,d.cr):S.cr;
  for(const f of OBJF)if(isObj(d[f])){if(!isObj(S[f]))S[f]={};for(const k in d[f]){const a=S[f][k],b=d[f][k];
    if(typeof b==='number'&&(typeof a!=='number'||b>a))S[f][k]=b;else if(a==null)S[f][k]=b;}}
  if(Array.isArray(d.fame)){if(!Array.isArray(S.fame))S.fame=[];for(const x of d.fame)if(isObj(x)&&!S.fame.some(y=>y&&y.hold===x.hold))S.fame.push(x);
    S.fame.sort((a,b)=>(a.hold||0)-(b.hold||0));}
  if(isObj(d.adCr)&&(!isObj(S.adCr)||String(d.adCr.d)>String(S.adCr.d)))S.adCr=d.adCr;
  else if(isObj(d.adCr)&&isObj(S.adCr)&&d.adCr.d===S.adCr.d)S.adCr.n=Math.max(S.adCr.n||0,d.adCr.n||0);
  if(isObj(d.adR)&&(!isObj(S.adR)||(d.adR.d|0)>(S.adR.d|0)))S.adR=d.adR;else if(isObj(d.adR)&&isObj(S.adR)&&d.adR.d===S.adR.d)S.adR.n=Math.max(S.adR.n|0,d.adR.n|0);   // общий предел роликов: берём больший счёт дня
  if(isObj(d.adF)&&(!isObj(S.adF)||(d.adF.d|0)>(S.adF.d|0)))S.adF=d.adF;else if(isObj(d.adF)&&isObj(S.adF)&&d.adF.d===S.adF.d){S.adF.n=Math.max(S.adF.n|0,d.adF.n|0);S.adF.t=Math.max(+S.adF.t||0,+d.adF.t||0);}   // M31: бонус-ролики после лесенки
  if(typeof d.maxT==='number')S.maxT=Math.max(S.maxT||0,d.maxT);
  if(typeof d.st0==='number'&&d.st0>0)S.st0=S.st0>0?Math.min(S.st0,d.st0):d.st0;   // M28: первый запуск — самый ранний с любого устройства
  if(typeof d.rst==='number')S.rst=Math.max(S.rst||0,d.rst);
  for(const f of ['rk','rkG','udN','adTot','wsV','svIn'])if(typeof d[f]==='number')S[f]=Math.max(S[f]|0,d[f]);   // звание не падает и на другом устройстве
  if(typeof d.rkX2d==='number')S.rkX2d=Math.max(+S.rkX2d||0,d.rkX2d);   // M47: ×2 за звание — закрытое предложение (досмотр/замена) не возвращается с другого устройства
  if(isObj(d.rkX2)&&(!isObj(S.rkX2)||(+d.rkX2.t||0)>(+S.rkX2.t||0)))S.rkX2=d.rkX2;if(isObj(S.rkX2)&&(+S.rkX2.t||0)<=(+S.rkX2d||0))S.rkX2=null;
  if(typeof d.adW==='number')S.adW=Math.max(S.adW||0,d.adW);
  if(typeof d.lbB==='number')S.lbB=Math.max(S.lbB||0,d.lbB);
  if(typeof QUEST!=='undefined'&&isObj(d.quest)){if(!isObj(S.quest))S.quest=d.quest;else QUEST.merge(d.quest);}   // «Ролики дня»: тот же день — максимумы
  for(const k in d)if(!(k in S)||newer&&!/^(ts|w|cr|crE|ask|tut|fame|adCr|adR|adT|adF|maxT|st0|adW|lbB|wk|lastT|offMore|freeM|buy|buyB|payT|payV|soc|stc|quest|rk|rkG|udN|adTot|thU|wall|lxE|lxc|col|colG|ph|wN|rwNew|lxSeen|wS|wsV|rkX2|rkX2d|svIn|svQ|rbN|rbHi)$/.test(k))S[k]=d[k]; // флажки и настройки (M43: «новое» телефона и ★ — не отсюда: ph едет с миром, wS/lxSeen — объединение, wN считается, rwNew — своё)
  SOC.merge(d.soc);STAT.merge(d.stc); // соц-предложения VK (модуль держит ссылку на S.soc) и отметки статистики — сливаем, а не заменяем
  payMerge(d);}
// M43: «прочитано» телефона — максимум из двух устройств, если это тот же холдинг (S.ph.wk); a — основа (едет с выбранным миром), b — другое
function phMerge(a,b){if(!isObj(a))return isObj(b)?b:a;if(!isObj(b)||a.wk!==b.wk||a.v!==b.v)return a;
  // лента (день + число в тот же день) и вопросы (qid) — общие для устройств; служебные сообщения (loc, rdn) у каждого устройства свои — их не смешиваем
  if(!isObj(a.rd))a.rd={};if(!isObj(a.rdk))a.rdk={};
  if(isObj(b.rd))for(const k in b.rd){const x=b.rd[k],y=a.rd[k];if(typeof x!=='number')continue;
    if(typeof y!=='number'||x>y){a.rd[k]=x;a.rdk[k]=isObj(b.rdk)?b.rdk[k]|0:0;}else if(x===y&&isObj(b.rdk))a.rdk[k]=Math.max(a.rdk[k]|0,b.rdk[k]|0);}
  if(isObj(b.qr)){if(!isObj(a.qr))a.qr={};for(const k in b.qr)a.qr[k]=1;}
  return a;}
function timeLim(p,ms){return Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms))]);}
function loadScript(src,ms){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);setTimeout(no,ms||20000);});}
function vkSend(method,params,ms){return Promise.race([window.vkBridge.send(method,params||{}),new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms||4000))]);}
/*SOC*/
/* ===== SOC v2.2 (04.10: Одноклассники — см. «ОК» ниже; v2.1 — 04.10: итоги в STAT — событие soc; v2 — 29.09.2026; v2 — дружит с REF: «Позвать друзей» = ссылка с #ref): друзья, избранное, «Ещё игры во дворе» — ТОЛЬКО VK с мостом; в Яндексе молчит =====
   Общий модуль для всех игр. Источник — ~/Projects/hobby-analytics/soc/soc.js (правки — только там, потом soc-sync.sh).
   Правила VK: 2.6.2 — никаких наград за приглашение/«поделиться»/избранное/экран (разрешено лишь за вступление в сообщество —
   в наших играх НЕ даём); 2.6.3 — само-предложения не в первую сессию, отказ помним, повтор не чаще раза в 30 дней, ≤3 раз.
   Покер (18+) в список не добавлять никогда. 12+ (Дурак, Козёл) — с пометкой «12+».
   Старый синтаксис: без optional chaining и nullish-оператора, без CSS-свойства inset. Нужны из игры: PLAT ('vk'|…), VK (мост после VKWebAppInit или null), vkSend(метод,параметры,мс).
   ОК (Одноклассники; та же игра VK, запущенная с vk_client=ok — модуль узнаёт сам, SOC.isOk): в ОК нет избранного и значка на экран,
   ссылки на vk.com запрещены, группа у нас только ВКонтакте, ID игр в ОК другие. Поэтому в ОК остаётся только «Позвать друзей»
   (окно приглашения с обязательным message), а остальное включается настройками SOC.init: okLink — ссылка на игру в ОК («Поделиться»),
   okGroup — ID группы в ОК («Наше сообщество»), поле ok у игры в GAMES — её ID в ОК («Ещё игры», только сайт и мобильный браузер ОК). */
var SOC=(function(){
  var GROUP=241793582,DAY=864e5,VER=2.2;
  // i — место в спрайте dvor.jpg (по 96 px), g — группа (c карты, p головоломки, s сказка, r спокойные), a — возраст,
  // off — где игры НЕТ в каталоге VK: 'all' — нигде, 'web' — нет на компьютере (desktop_web). Обновлять по platforms.md.
  // ok — ID этой игры в Одноклассниках (vk_ok_app_id), когда она там вышла; без него в ОК игра в «Ещё игры» не показывается.
  var GAMES=[
    {id:54791564,t:'Выезд со двора',a:6,i:0,g:'p',ok:512004864050},
    {id:54787973,t:'Баба Зина: слова из букв',a:0,i:1,g:'p',ok:512005727621},
    {id:54791567,t:'Богатырь против нечисти',a:6,i:2,g:'s',ok:512005580574},
    {id:54791569,t:'Тридевятая оборона: защита башен',a:6,i:3,g:'s',ok:512005500650},
    {id:54791634,t:'Гастроном номер 1',a:0,i:4,g:'p',off:'all'},
    {id:54792006,t:'Дурак во дворе',a:12,i:5,g:'c',ok:512005141228},
    {id:54792009,t:'Косынка во дворе',a:0,i:6,g:'c',ok:512005597603},
    {id:54792011,t:'Паук на даче',a:0,i:7,g:'c',ok:512005626567},
    {id:54792015,t:'Свободная ячейка в санатории',a:0,i:8,g:'c',ok:512005010476},
    {id:54792674,t:'Козёл во дворе',a:12,i:9,g:'c',off:'all'},
    {id:54792676,t:'Кирпичики во дворе',a:0,i:10,g:'p',ok:512005552366},
    {id:54794412,t:'Рыбалка с Петровичем',a:0,i:11,g:'r',ok:512005219424},
    {id:54794419,t:'Дворовая викторина',a:6,i:12,g:'p',ok:512005471658}
  ];
  var N=GAMES.length;
  function qp(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):'';}
  var APP=+qp('vk_app_id')||0,PF=qp('vk_platform'),WEB=PF.indexOf('desktop')===0;
  // Одноклассники: vk_client=ok (и vk_platform с хвостом _ok); на маке — ?vk=1&ok=1. То же правило, что у константы OK в играх
  var OKP=/[?&](vk_client=ok|vk_platform=[a-z_]*_ok|ok=1)(&|$)/.test(location.search),OKWEB=PF.indexOf('web')>=0;
  var st={},O={},T0=Date.now(),asked=false,homeOk=null,readyOn=false;
  function tx(ru,en){return typeof LANG!=='undefined'&&LANG==='en'?en:ru;} // VK всегда по-русски; обёртка — по правилам игр
  function nop(){}
  function saveFn(){(O.save||nop)();}
  function toastFn(t){(O.toast||nop)(t);}

  // только настоящий VK (vk_app_id в адресе) и живой мост
  function ok(){return typeof PLAT!=='undefined'&&PLAT==='vk'&&typeof VK!=='undefined'&&!!VK&&APP>0;}
  function send(m,p){return vkSend(m,p||{},60000);}
  // что доступно на этой площадке: inv|share|fav|home|grp|more. В VK — всё (как было), в ОК — см. шапку модуля
  function can(k){if(!ok())return false;
    if(k==='more')return list(1).length>0;
    if(!OKP)return k==='home'?!!homeOk:k==='fav'?!(st.fav&&st.fav.d):true;
    return k==='inv'||(k==='share'&&!!O.okLink)||(k==='grp'&&!!O.okGroup);}
  function me(){for(var i=0;i<N;i++)if(GAMES[i].id===APP)return GAMES[i];return null;}
  function done(k){st[k]={d:1};saveFn();}
  function tried(k){var x=st[k]||{};x.n=(x.n||0)+1;x.t=Date.now();st[k]=x;saveFn();}
  // STAT v1.2 (А15): итог предложения площадки → soc {a: fav|home|inv|grp|shr|more, r: show|ok|no|err}; отказ игрока (код 4 / «denied») — no
  function sx(a,r){try{if(typeof STAT!=='undefined'&&STAT.ev)STAT.ev('soc',{a:a,r:r});}catch(e){}}
  function sr(a){return function(e){var d=e&&e.error_data||{};sx(a,d.error_code===4||/denied|cancel/i.test(String(d.error_reason||d.error_msg||''))?'no':'err');};}
  function due(k){var x=st[k]||{};return !x.d&&(x.n||0)<3&&(!x.t||Date.now()-x.t>30*DAY);}

  /* SOC.init(S, {save, toast, cls, modal, close}) — один раз при запуске, после загрузки сохранения (считает сессии).
     cls — классы кнопок (по умолчанию 'btn noenter': Enter их не жмёт); modal(html) — показать окно игры и вернуть его
     контейнер; close() — закрыть окно игры. Без modal — своё лёгкое окно. */
  function init(S,opt){O=opt||{};if(!S.soc||typeof S.soc!=='object')S.soc={};st=S.soc;
    st.ses=(st.ses||0)+1;if(!OKP&&qp('vk_is_favorite')==='1')st.fav={d:1};saveFn();ready();}
  // после VKWebAppInit (мост готов): узнать, можно ли значок на экран (только Android)
  function ready(){if(readyOn||!ok())return;readyOn=true;
    if(!OKP&&PF.indexOf('android')>=0)vkSend('VKWebAppAddToHomeScreenInfo',{},4000).then(function(r){
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
  function fav(){return send('VKWebAppAddToFavorites').then(function(r){if(r&&r.result)done('fav');sx('fav',r&&r.result?'ok':'no');return !!(r&&r.result);},function(e){sr('fav')(e);tried('fav');return false;});}
  function home(){return send('VKWebAppAddToHomeScreen').then(function(r){if(r&&r.result){done('home');homeOk=false;}sx('home',r&&r.result?'ok':'no');return !!(r&&r.result);},function(e){sr('home')(e);tried('home');return false;});}
  // «Приведи друга» (модуль REF, если он есть в игре и включён): вместо окна приглашения — ссылка с меткой #ref=<id>,
  // иначе друг, открывший игру с телефона, не засчитается (окно приглашения передаёт автора только на сайте ВК)
  function refOn(){return typeof REF!=='undefined'&&!!REF&&typeof REF.on==='function'&&REF.on();}
  // ОК: ссылка REF ведёт на vk.com — не годится; окно приглашения, message обязателен на сайте и в мобильном браузере ОК
  function invite(){if(OKP)return send('VKWebAppShowInviteBox',{message:O.okMsg||tx('Заходи в игру — посоревнуемся!','Come and play — let us compete!')}).then(function(r){if(r&&r.success!==false)done('inv');sx('inv',r&&r.success!==false?'ok':'no');return true;},function(e){sr('inv')(e);tried('inv');return false;});
    if(refOn())return send('VKWebAppShare',{link:REF.link()}).then(function(){done('inv');sx('inv','ok');return true;},function(e){sr('inv')(e);tried('inv');return false;});
    return send('VKWebAppShowInviteBox').then(function(r){if(r&&r.success!==false)done('inv');sx('inv',r&&r.success!==false?'ok':'no');return true;},function(e){sr('inv')(e);tried('inv');return false;});}
  function share(){if(OKP&&!O.okLink)return Promise.resolve(false);
    return send('VKWebAppShare',{link:OKP?O.okLink:refOn()?REF.link():'https://vk.com/app'+APP}).then(function(){sx('shr','ok');return true;},function(e){sr('shr')(e);return false;});}
  function group(){if(OKP&&!O.okGroup)return Promise.resolve(false);
    return send('VKWebAppJoinGroup',{group_id:OKP?O.okGroup:GROUP}).then(function(r){if(r&&r.result)done('grp');sx('grp',r&&r.result?'ok':'no');return !!(r&&r.result);},function(e){sr('grp')(e);tried('grp');return false;});}
  function open(g){if(OKP&&!(g.ok&&OKWEB))return Promise.resolve(false); // ОК: OpenApp есть только на сайте и в мобильном браузере
    return send('VKWebAppOpenApp',OKP?{app_id:g.ok,app_is_local:true}:{app_id:g.id,location:'from='+APP}).then(function(){return true;},function(){
    toastFn(tx('Найдите «'+g.t+'» в разделе «Игры»','Find "'+g.t+'" in the Games section'));return false;});}

  // --- список «Ещё игры»: без себя, без 18+, без неопубликованных на этой площадке; сначала родственные, дальше — сдвиг по дню ---
  function list(n){var m=me(),mg=m?m.g:'',out=[],i,g,day=Math.floor(Date.now()/DAY);
    for(i=0;i<N;i++){g=GAMES[i];if(g.id===APP||g.a>=18)continue;
      if(OKP?!(g.ok&&OKWEB):(g.off==='all'||(g.off==='web'&&WEB)))continue;out.push(g);} // ОК: только игры с ID в ОК и только там, где работает OpenApp
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
    var b=btn('inv',tx('👥 Позвать друзей','👥 Invite friends'));
    if(can('share'))b+=btn('share',tx('📤 Поделиться игрой','📤 Share the game'));
    if(can('fav'))b+=btn('fav',tx('⭐ В избранное','⭐ Add to favourites'));
    if(can('home'))b+=btn('home',tx('📲 На экран телефона','📲 Add to home screen'));
    if(can('grp'))b+=btn('grp',tx('📣 Наше сообщество','📣 Our community'));
    if(can('more'))b+=btn('more',tx('🎲 Ещё игры во дворе','🎲 More yard games'));
    return '<div class="soc-set">'+b+'</div>';}
  // навесить обработчики после вставки HTML: SOC.bind(контейнер, back) — back() вызывается при «Назад» из «Ещё игры»
  function bind(root,back){if(!root)return;var bs=root.querySelectorAll('[data-soc]');
    for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var k=this.getAttribute('data-soc');
      if(k==='inv')invite();else if(k==='share')share();else if(k==='fav')fav().then(function(){if(back)back();});
      else if(k==='home')home().then(function(){if(back)back();});else if(k==='grp')group();else if(k==='more')showMore(back);};}

  // --- окно «Ещё игры во дворе»: через modal() игры (O.modal) или своё лёгкое. back — куда вернуться по «Назад» ---
  function showMore(back){if(!can('more'))return;css();var G=list(6),spr=O.sprite||'js/dvor.jpg',h='';
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
    if(can('fav')&&due('fav'))o={k:'fav',t:tx('Добавьте игру в избранное — будет всегда под рукой.','Add the game to favourites — always at hand.'),b:tx('⭐ В избранное','⭐ Add to favourites'),run:fav};
    else if(can('home')&&st.ses>=3&&due('home'))o={k:'home',t:tx('Значок игры на экране — заходить в одно касание.','A game icon on your screen — one tap to play.'),b:tx('📲 На экран телефона','📲 Add to home screen'),run:home};
    else if(st.ses>=3&&(wins||0)>=5&&due('inv'))o={k:'inv',t:tx('Позовите друзей — будет с кем посоревноваться.','Invite friends — someone to compete with.'),b:tx('👥 Позвать друзей','👥 Invite friends'),run:invite};
    else if(can('grp')&&st.ses>=4&&due('grp'))o={k:'grp',t:tx('Новости и новые игры — в сообществе «Игры во дворе».','News and new games — in the "Yard Games" community.'),b:tx('📣 Наше сообщество','📣 Our community'),run:group};
    else{var x=st.more||{};if(!x.t||Date.now()-x.t>7*DAY){var g=list(1)[0];
      if(g)o={k:'more',t:tx('Попробуйте ещё: «'+g.t+'»'+(g.a>=12?' ('+g.a+'+)':'')+'.','Try another one: "'+g.t+'".'),b:tx('🎲 Открыть','🎲 Open'),run:function(){return open(g);}};}}
    if(!o)return null;asked=true;sx(o.k,'show');if(o.k==='more'){st.more={t:Date.now()};saveFn();}else tried(o.k);return o;}

  return {v:VER,ok:ok,isOk:OKP,can:can,init:init,ready:ready,merge:merge,fav:fav,home:home,invite:invite,share:share,group:group,open:open,list:list,
    settingsHtml:settingsHtml,bind:bind,showMore:showMore,offer:offer,games:GAMES};
})();
/*/SOC*/
// VK: куски по 1800 символов, двойной буфер «a0…»/«b0…», указатель svn="b:5:<длина>" — последним. Мир в «Недрах» дорастал до 90+ тыс. знаков (sim, 01.10; с упаковкой js/savepack.js — до ~55) →
// до 200 кусков (360 тыс.; у VK лимит 1000 ключей на игрока, значение ≤ 4096 байт — 1800 знаков кириллицы влезают), читаем пачками по 50 ключей
const VK_CHUNK=1800,VK_MAXCH=200,VK_GETN=50,vkSent={};let vkCur=null,vkQ=null,vkAgain=false;
async function vkPut(k,v){if(vkSent[k]===v)return;await vkSend('VKWebAppStorageSet',{key:k,value:v},8000);vkSent[k]=v;}
function vkSaveCloud(){if(vkQ){vkAgain=true;return vkQ;}
  vkQ=(async()=>{try{do{vkAgain=false;const str=JSON.stringify(sOut()),ts=S.ts,c=S.cr,n=Math.ceil(str.length/VK_CHUNK),pre=vkCur==='a'?'b':'a';if(n>VK_MAXCH)return;
      for(let i=0;i<n;i++)await vkPut(pre+i,str.slice(i*VK_CHUNK,(i+1)*VK_CHUNK));
      await vkPut('svn',pre+':'+n+':'+str.length);vkCur=pre;BOOT_TS=ts;BOOT_CR=c;}while(vkAgain);}catch(e){}finally{vkQ=null;}})();
  return vkQ;}
const BROKEN={broken:true};
async function vkLoadCloud(){const r0=await vkSend('VKWebAppStorageGet',{keys:['svn']}),e0=((r0&&r0.keys)||[]).find(k=>k.key==='svn'),raw=e0&&e0.value||'';
  if(!raw)return null;
  const m=/^([ab]):(\d+):(\d+)$/.exec(raw);let pre='sv',n=+raw||0,len=-1;
  if(m){pre=m[1];n=+m[2];len=+m[3];}
  if(!n||n>VK_MAXCH)throw BROKEN;
  const keys=[];for(let i=0;i<n;i++)keys.push(pre+i);
  const mm={};for(let j=0;j<keys.length;j+=VK_GETN){const r=await vkSend('VKWebAppStorageGet',{keys:keys.slice(j,j+VK_GETN)},8000);((r&&r.keys)||[]).forEach(k=>mm[k.key]=k.value);}
  let str='';for(const k of keys){if(typeof mm[k]!=='string'||!mm[k])throw BROKEN;str+=mm[k];}
  if(len>=0&&str.length!==len)throw BROKEN;
  let d;try{d=wIn(JSON.parse(str));}catch(e){throw BROKEN;}if(!isObj(d))throw BROKEN;
  if(pre!=='sv'){vkCur=pre;for(const k of keys)vkSent[k]=mm[k];vkSent.svn=raw;}
  return d;}
// SDK/мост готов (или не пришёл) — хук игры ровно один раз
let sdkDone=false;
function sdkReady(){if(sdkDone)return;sdkDone=true;window.__sdkDone=true;statProg();
  try{window.onSdkReady&&window.onSdkReady();}catch(e){setTimeout(()=>{throw e;});}
  YG.start();}
// VK web: высота окна под экран браузера (модерация VK 29.09: VKWebAppResizeWindow; как в Рыбалке bef5ed9, Гастрономе, Дураке)
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
async function initVK(){
  const safety=setTimeout(sdkReady,22000);
  // при сбое загрузки моста — повтор через 1,5 с (у игрока на iPhone со слабой сетью не загрузился → без рекламы, покупок и облака; как во всех играх 04.10)
  try{if(!window.vkBridge)await loadScript('js/vk-bridge.min.js').catch(function(){return new Promise(function(r){setTimeout(r,1500);}).then(function(){return window.vkBridge||loadScript('js/vk-bridge.min.js?r=2');});});
    // на маке (?vk=1, без vk_app_id) мост вне VK не ответит никогда — не ждём 20 с (иначе покупки/облако/onSdkReady появлялись только через 20 с)
    await vkSend('VKWebAppInit',{},VK_REAL?20000:2500);VK=window.vkBridge;vkFitInit();SOC.ready();socMoreUpd(); // «Друзья и игры», «Ещё игры» — только VK с мостом
    VK.subscribe(e=>{const t=e.detail&&e.detail.type;
      if(t==='VKWebAppViewHide'){setPause('vkh',true);cloudFlush();}   // M47: свой ключ (не общий со сворачиванием вкладки); касание игры снимает (см. inAt)
      else if(t==='VKWebAppViewRestore')setPause('vkh',false);});
    await cloudLoad();
    adPreload(); // adfix: подгрузка ролика за награду; «не готов» — переспросим в фоне
  }catch(e){VK=null;}
  clearTimeout(safety);PAY.init();updCr();sdkReady();}
async function initSDK(){
  const safety=setTimeout(sdkReady,8000);
  if(window.YaGames){
    try{ysdk=await timeLim(YaGames.init(),8000);
      // «игра загружена» — сразу: экран уже есть, облако и покупки догружаются следом
      try{ysdk.features&&ysdk.features.LoadingAPI&&ysdk.features.LoadingAPI.ready();}catch(e){}
      // язык площадки; ручной выбор игрока в ⚙ главнее; на маке ?lang= главнее всего
      try{const sl=ysdk.environment&&ysdk.environment.i18n&&ysdk.environment.i18n.lang;if(sl&&!LANG_MAN&&!(QLANG&&LOCAL))setLang(sl);}catch(e){}
      ysdk.on&&ysdk.on('game_api_pause',()=>setPause('sdk',true));
      ysdk.on&&ysdk.on('game_api_resume',()=>setPause('sdk',false));
      try{ysdk.getFlags&&ysdk.getFlags().then(applyFlags).catch(()=>{});}catch(e){}
      try{YP=await timeLim(ysdk.getPlayer({scopes:false}),8000);await cloudLoad();}catch(e){}
    }catch(e){ysdk=null;}
  }
  clearTimeout(safety);PAY.init();updCr();sdkReady();}

/* ================= звук (синтез, без музыки) ================= */
let AC=null,muted=false,acUnlocked=false;
function acWake(){if(AC&&AC.state!=='running'){try{const p=AC.resume();p&&p.catch&&p.catch(()=>{});}catch(e){}}}
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&!muted)acWake();return AC;}
function unlockAudio(){if(S.sound===false||muted)return;const a=ac();if(!a)return;
  if(!acUnlocked){try{const b=a.createBuffer(1,1,22050),src=a.createBufferSource();src.buffer=b;src.connect(a.destination);src.start(0);acUnlocked=true;}catch(e){}}}
['touchend','click','keydown'].forEach(t=>document.addEventListener(t,unlockAudio,{capture:true,passive:true}));
// атака 6 мс — без щелчка в начале
function tone(type,f1,f2,dur,vol){if(muted||S.sound===false)return;const a=ac();if(!a)return;const t=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g).connect(a.destination);o.start(t);o.stop(t+dur+.02);}
const NZ={};function noiseBuf(a,dur){const k=Math.round(dur*100);if(NZ[k]&&NZ[k].sampleRate===a.sampleRate)return NZ[k];const n=a.createBuffer(1,Math.max(1,Math.floor(a.sampleRate*dur)),a.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);return NZ[k]=n;}
function noise(dur,vol,freq,type){if(muted||S.sound===false)return;const a=ac();if(!a)return;const t=a.currentTime,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();f.type=type||'lowpass';f.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.006);s.buffer=noiseBuf(a,dur);s.connect(f).connect(g).connect(a.destination);s.start(t);}
const later=(ms,f)=>setTimeout(f,ms);
const SND={
  tap(){tone('sine',600,500,.05,.04);tapBuzz(6);},
  coin(){tone('triangle',990,1320,.12,.06);later(90,()=>tone('triangle',1320,1760,.12,.05));},
  // закрытие месяца — мягкий «колокольчик кассы»: щелчок механизма и два затухающих звона
  close(){noise(.05,.06,3200,'bandpass');later(40,()=>{tone('sine',1568,1560,.6,.05);tone('sine',3136,3120,.35,.012);});later(170,()=>tone('sine',2093,2085,.7,.04));},
  // стройка готова — два удара и восходящий аккорд
  build(){noise(.08,.14,700);later(140,()=>noise(.08,.14,700));[392,523,659].forEach((f,i)=>later(300+i*110,()=>tone('triangle',f,f,.22,.06)));},
  // нашли месторождение — искристое «динь-динь» вверх
  found(){[659,880,1175,1568].forEach((f,i)=>later(i*80,()=>tone('triangle',f,f*1.01,.2,.05)));later(340,()=>noise(.25,.03,6000,'highpass'));},
  // удар молотка на торгах — деревянный стук
  gavel(){noise(.07,.3,1100,'bandpass');tone('triangle',190,90,.14,.12);later(90,()=>noise(.05,.08,1300,'bandpass'));},
  alert(){[880,660,880].forEach((f,i)=>later(i*150,()=>tone('triangle',f,f,.12,.05)));},
  no(){tone('square',200,160,.1,.025);tapBuzz([20,40,20]);},
  // IPO — фанфара
  win(){[523,659,784,1047].forEach((f,i)=>later(i*120,()=>tone('triangle',f,f,.2,.08)));later(520,()=>{tone('triangle',1047,1047,.6,.05);tone('triangle',1319,1319,.6,.035);tone('triangle',1568,1568,.6,.03);});}
};
let touched=false;['pointerdown','keydown'].forEach(t=>document.addEventListener(t,()=>{touched=true;},{capture:true,passive:true}));
function buzz(ms){try{if(touched&&S.vib!==false&&navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
// лёгкая вибрация в звуке кнопки: только сразу после касания пальцем (не на подсказки и события игры), уважает «Вибрацию» и спокойный режим; на iPhone vibrate нет — это нормально
let lastPtr=0;document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')lastPtr=Date.now();},{capture:true,passive:true});
function tapBuzz(ms){if(Date.now()-lastPtr>500||(typeof calm==='function'&&calm()))return;buzz(ms);}

/* ================= реклама (SDK площадки; без него — заглушка только на маке) ================= */
function stubAd(cb){const ad=$('ad'),tEl=$('adT');adOpen();
  if(!ad||!tEl){setTimeout(()=>{adClose();cb();},1200);return;}
  ad.classList.add('on');let n=3;tEl.textContent=n;const it=setInterval(()=>{n--;tEl.textContent=n;if(n<=0){clearInterval(it);ad.classList.remove('on');adClose();cb();}},600);}
function adOpen(){setPause('ad',true);}
function adClose(){setPause('ad',false);}
const VK_REAL=/[?&]vk_app_id=/.test(location.search);
// M47d (аудит-4 №6): настоящий Яндекс — домен игр Яндекса (app-….games.s3.yandex.net, yandex.*, playhop.com) или страница внутри него. Если там SDK нет
// (блокировщик рекламы, сбой сети, YaGames.init не ответил) — награду за заглушку НЕ даём, как VK_REAL; заглушка — только на маке, LAN, github.io (бета).
// Проверка на маке: ?yareal=1 (без /sdk.js — как с блокировщиком).
const YA_RE=/(^|\.)(yandex\.(ru|net|com|by|kz|uz|az|com\.tr|com\.am|com\.ge|co\.il|fr|lt|lv|ee|md|tj|tm)|playhop\.com)$/;
const YA_REAL=PLAT==='yandex'&&((LOCAL||STAT_LAN)?/[?&]yareal=1/.test(location.search):(()=>{try{if(YA_RE.test(location.hostname)||/[?&]app-id=/.test(location.search))return true;
  const a=location.ancestorOrigins;if(a)for(let i=0;i<a.length;i++)if(YA_RE.test(new URL(a[i]).hostname))return true;}catch(e){}return false;})());
const adFail=()=>L('Реклама сейчас недоступна — загляните чуть позже','Ads are unavailable right now — please try a bit later');
const adClosed=()=>L('Ролик закрыт до конца — награды нет','The video was closed early — no reward');   // 08.10: код VK 4 / Яндекс onClose без награды — игрок закрыл сам, это не поломка
function adUser(e){const d=e&&e.error_data||{};return +d.error_code===4;}
// межэкранная: только по кнопке «Продолжить» в окне закрытия месяца (зовёт интерфейс), при adDue() и adReady();
// «долг» S.adW — закрытий месяца онлайн с прошлого показа (S.adW++ делает game.js), обнуляется только после настоящего показа
let lastAdT=Date.now(),AD_GAP=180000,AD_EVERY=2;
// ранние главы: межэкранная не раньше первой точки и AD_FROM-го игрового месяца (0 = январь первого года; 5 = июнь);
// AD_OFF=1 — ещё и по кнопке «К делам» в окне «Пока вас не было» (только при возврате во вкладку: при запуске adReady() ложно 180 с)
let AD_FROM=5,AD_OFF=0;
function adFrom(){return AD_FROM;}
function adOffOn(){return AD_OFF===1;}
/* adfix (03.10): «ролика нет» — VK отвечает ошибкой 20 ('No ads'), чаще всего на компьютере: ролик ещё не подгрузился, готов он бывает через 10–60 с.
   1) отказ «ролика нет» → один тихий автоповтор через AD_RETRY_MS под надписью «Ролик загружается…» (игра на паузе 'ad', нажать ничего нельзя);
   2) снова нет → не ошибка, а «Ролик будет через несколько секунд…»; кнопки «📺 … за рекламу» (adBtns) гаснут, игра в фоне раз в AD_POLL_MS спрашивает VK (Check);
      VK ответил «готов» (но не раньше AD_COOL_MIN) → кнопки загораются и «Ролик готов»; ответа нет — загораются сами через AD_COOL_MS.
      Нажатие по погасшей кнопке VK не дёргает — только «ещё загружается» (adHold() — для кнопок, которые до показа закрывают своё окно).
   3) заранее: Check при запуске и после каждого показа; VK сказал «не готов» — переспрашиваем в фоне (до 6 раз).
   Ответу Check «не готов» как запрету не верим (бывает ложным) — кнопку из-за него не гасим. Автоповтор — только на «ролика нет», не на закрытый ролик.
   Награда — по-прежнему только за досмотр (result:true / onRewarded) и один раз (paid). Статистика: ok+c='retry' — спас автоповтор; none — ролика не было и после повтора.
   Яндекс: только фраза и пауза кнопок после onError. APK и межэкранная не тронуты. Образец — «Богатырь» (hobby-analytics/release-f/ads-fail.md, «ОБРАЗЕЦ»);
   отличия Магната: adReady() здесь занято межэкранной → adVidReady(); общего класса у рекламных кнопок нет → adBtns() по значку 📺 в тексте кнопки; тексты на «вы». */
const AD_RETRY_MS=3000,AD_COOL_MS=30000,AD_COOL_MIN=8000,AD_POLL_MS=5000,AD_BTN_SEL='button:not(.shop-tab)';let adCoolT=0,adCoolS=0,adDimT=0,adChkT=0,adRdyT=0;
function adErrCode(e){const d=e&&e.error_data||{};return d.error_code||d.error_reason||(e&&(e.error_type||e.message))||'';} // код VK, иначе причина словами — в статистику
function adNoFill(e){const d=e&&e.error_data||{};return +d.error_code===20||/no ads?\b/i.test(String(d.error_reason||''));}
function adSoon(){return L('Ролик будет через несколько секунд — кнопка загорится, когда он загрузится','The video will be ready in a few seconds — the button will light up');}
function adStill(){return L('Ролик ещё загружается — подождите несколько секунд','The video is still loading — please wait a few seconds');}
function adHold(p){if(Date.now()<adCoolT){if(p)STAT.place(p);STAT.ad('rew','hold');toast(adStill());return true;}return false;} // идёт пауза кнопок: сказать и ничего не делать; STAT v1.2 — ad rew hold (p — место, если STAT.place ещё не звали)
function adBtns(){const r=[];try{const q=document.querySelectorAll(AD_BTN_SEL);for(let i=0;i<q.length;i++)if(q[i].dataset.adc||(q[i].textContent||'').indexOf('📺')>=0)r.push(q[i]);}catch(e){}return r;} // значки icons.js оставляют 📺 в textContent
// подгрузка ролика заранее; «не готов» — переспросить n раз (каждые AD_POLL_MS); «готов» во время паузы кнопок — зажечь их
function adPreload(n){if(!VK)return;clearTimeout(adChkT);n=n===undefined?6:n;const again=()=>{if(n>0)adChkT=setTimeout(()=>adPreload(n-1),AD_POLL_MS);};
  vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).then(r=>{STAT.adChk('rew',r&&r.result?1:0);if(r&&r.result)adVidReady();else again();},()=>{STAT.adChk('rew',0);again();});}
function adVidReady(){if(Date.now()>=adCoolT)return;clearTimeout(adRdyT);adRdyT=setTimeout(()=>{if(Date.now()>=adCoolT)return;adCoolT=0;adDim();let vis=false;const q=adBtns();for(let i=0;i<q.length;i++)if(q[i].offsetParent)vis=true;if(vis&&!adBusy)toast(L('Ролик готов — можно смотреть','The video is ready to watch'));},Math.max(0,adCoolS+AD_COOL_MIN-Date.now()));}
function adWait(on){let w=document.getElementById('adWait');if(!on){if(w)w.style.display='none';return;}
  if(!w){w=document.createElement('div');w.id='adWait';w.style.cssText='position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:rgba(0,0,0,.74);color:#fff;display:none;align-items:center;justify-content:center;text-align:center;padding:24px;font-weight:800;font-size:20px;line-height:1.35';document.body.appendChild(w);}
  w.textContent=L('Ролик загружается…','Loading the video…');w.style.display='flex';}
// кнопки «за рекламу» гаснут, пока идёт пауза (окна перерисовываются — поэтому раз в секунду); метка data-adc — чтобы вернуть яркость только своим
function adDim(){clearTimeout(adDimT);const off=Date.now()<adCoolT,q=adBtns();for(let i=0;i<q.length;i++){if(off){q[i].style.opacity='.45';q[i].dataset.adc='1';}else if(q[i].dataset.adc){q[i].style.opacity='';delete q[i].dataset.adc;}}if(off)adDimT=setTimeout(adDim,1000);}
function adCool(){adCoolS=Date.now();adCoolT=adCoolS+AD_COOL_MS;adDim();adPreload();}
let adBusy=false;
function showRewarded(cb0,onFail0){
  if(adBusy)return;
  if(adHold()){if(onFail0)onFail0();adDim();return;} // onFail мог перерисовать окно — сразу гасим заново открытые кнопки
  STAT.adReq('rew'); // STAT v1.2: нажатие → ms в итоговом ad (место STAT.place живёт до итога)
  adBusy=true;clearTimeout(showRewarded._t);showRewarded._t=setTimeout(()=>{const st=adBusy;adBusy=false;adWait(0);if(st)adClose();},135000);   // M47: площадка не вызвала закрытие — снимаем и паузу 'ad'
  if(adRewLeft()<=0){adBusy=false;toast(L('Ролики за награду на сегодня закончились — завтра будут снова','No more reward videos today — back tomorrow'));onFail0&&onFail0();return;}
  let paid=false;const cb=()=>{if(paid)return;paid=true;adBusy=false;lastAdT=Date.now();adRewLeft();S.adR.n=(S.adR.n|0)+1;S.adTot=(S.adTot|0)+1;if(AD_REW_DAY&&S.adR.n===AD_REW_DAY)STAT.ev('adcap',{});try{save();}catch(e){}adInCb++;try{cb0();}finally{adInCb--;}},onFail=()=>{adBusy=false;lastAdT=Date.now();onFail0&&onFail0();};
  if(PLAT==='apk'){const A=apkAds();if(A&&A.rewarded){adOpen();A.rewarded(ok=>{adClose();STAT.ad('rew',ok?'ok':'fail','apk');if(ok)cb();else{toast(adFail());onFail();}});}else if(!APK_REAL){STAT.ad('rew','ok','stub');stubAd(cb);}else{STAT.ad('rew','fail','noapk');toast(adFail());onFail();}return;}
  if(PLAT==='vk'&&!VK){if(VK_REAL){STAT.ad('rew','fail','nobridge');toast(adFail());onFail();}else{STAT.ad('rew','ok','stub');stubAd(cb);}return;} // мост VK не ответил — награду даром не даём; ?vk=1 на маке — заглушка
  if(VK){let tries=0;
    const go=()=>{adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'reward'},60000).then(r=>{adClose();
        if(r&&r.result){STAT.ad('rew','ok',tries?'retry':'');adPreload();cb();}else{STAT.ad('rew','fail','noresult');toast(adFail());adPreload();onFail();}
      },e=>{
        if(adNoFill(e)&&!tries){tries=1;adWait(1);adPreload();setTimeout(()=>{adWait(0);go();},AD_RETRY_MS);return;} // ролика нет — один тихий повтор; игра остаётся на паузе (adClose — после него)
        adClose();if(adNoFill(e)){STAT.ad('rew','none',adErrCode(e));toast(adSoon());adCool();}else{STAT.ad('rew','err',adErrCode(e));toast(adUser(e)?adClosed():adFail());adPreload();}
        onFail();adDim();});};
    go();return;}
  if(!ysdk){if(YA_REAL){STAT.ad('rew','fail',sdkDone?'nosdk':'early');toast(sdkDone?adFail():adStill());onFail();adDim();return;}STAT.ad('rew','ok','stub');stubAd(cb);return;}   // M47d: Яндекс без SDK — без награды (до готовности SDK — «ещё загружается»)
  let got=false;
  ysdk.adv.showRewardedVideo({callbacks:{onOpen:adOpen,onRewarded:()=>{got=true;},
    onClose:()=>{adClose();STAT.ad('rew',got?'ok':'skip');if(got)cb();else{toast(adClosed());onFail();}},
    onError:()=>{adClose();STAT.ad('rew','err');toast(adFail());adCool();onFail();adDim();}}});
}
function adPlat(){return !(PLAT==='vk'&&!VK&&VK_REAL)&&!(YA_REAL&&!ysdk&&sdkDone)&&!(PLAT==='apk'&&APK_REAL&&!apkAds());}   // площадка умеет рекламу (мост/SDK)
// общий дневной предел роликов за награду: 0 — нет предела (решение владельца 01.10: убрали 20 в день). M31: и у мест дневных лимитов нет — паузы мест GAME.adWait (game.js AD_GAP), лесенка + бонус-ролики. S.adR — счёт роликов дня (для STAT)
const AD_REW_DAY=0;
function adRewLeft(){const d=payDay();if(!S.adR||typeof S.adR!=='object'||S.adR.d!==d)S.adR={d:d,n:0};return AD_REW_DAY?Math.max(0,AD_REW_DAY-(S.adR.n|0)):999;}
function adOk(){return adPlat()&&adRewLeft()>0;}   // кнопки «📺 … за рекламу» — только при adOk(): кончился предел — кнопки прячутся
function adReady(){return Date.now()-lastAdT>=AD_GAP&&adPlat();}
// строка для окон с роликами: сколько осталось сегодня / «завтра»
function adDayHtml(){if(!adPlat()||!AD_REW_DAY)return '';const n=adRewLeft();
  return '<p class="mut addl" style="font-size:16px;text-align:center">📺 '+(n>0?L('Роликов за награду сегодня: осталось ','Reward videos left today: ')+n+L(' из ',' of ')+AD_REW_DAY:L('Ролики за награду на сегодня закончились — завтра будут снова','No more reward videos today — back tomorrow'))+'</p>';}
// не раньше 3-го месяца, не после отчёта с санацией, убытком или овердрафтом (не добивать в плохой месяц), не при «Без рекламы»
function adDue(){const w=S.w,r=w&&Array.isArray(w.reps)&&w.reps.length?w.reps[w.reps.length-1]:null;let bad=false;try{bad=!!(r&&r.pl&&ECON.netOf(r.pl)<0)||(w&&w.odM>0);}catch(e){}
  return !PAY.own('no_ads')&&(S.adW||0)>=AD_EVERY&&!!w&&(w.m||0)>=3&&!(r&&r.san)&&!bad;}
// STAT v1.2: «положена, но не показана» — ad int none: nofill (площадка не дала), nosdk (нет моста/SDK), gap (рано после прошлой межэкранной), cap (рано после ролика за награду)
let lastIntT=0;
function adIntWhy(){return !adPlat()?'nosdk':Date.now()-lastIntT<AD_GAP?'gap':'cap';}
function showInterstitial(cb0){
  STAT.adReq('int');
  const cb=(shown,r,c)=>{lastAdT=lastIntT=Date.now();if(r)STAT.ad('int',r,c);else if(shown!==false)STAT.ad('int','show');else STAT.ad('int','none','nofill');if(shown!==false){S.adW=0;save();}cb0();};
  if(PLAT==='apk'){const A=apkAds();if(A&&A.interstitial){adOpen();A.interstitial(ok=>{adClose();cb(!!ok);});}else if(!APK_REAL)stubAd(cb);else cb0();return;}
  if(PLAT==='vk'&&!VK){if(VK_REAL){STAT.ad('int','none','nosdk');cb0();}else stubAd(cb);return;}
  if(VK){adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).then(r=>{adClose();cb(!!(r&&r.result));},e=>{adClose();if(adNoFill(e))cb(false);else cb(false,'err',adErrCode(e));});return;}
  if(!ysdk){if(YA_REAL){STAT.ad('int','none','nosdk');cb0();}else stubAd(cb);return;}   // M47d: как VK без моста
  ysdk.adv.showFullscreenAdv({callbacks:{onOpen:adOpen,onClose:w=>{adClose();cb(w!==false);},onError:()=>{adClose();cb(false,'err');}}});
}
// удалённая настройка Яндекса (флаги консоли). Границы жёсткие: межэкранная — не чаще раза в 2 закрытия месяца и раза в 180 с;
// ad_every 2–6 (закрытий месяца), ad_gap 180–600 с, ad_from 5–12 (с какого игрового месяца в ранних главах), ad_off 0/1 (после окна «Пока вас не было»)
function applyFlags(f){if(!isObj(f))return;const num=(k,a,b)=>{const n=parseInt(f[k],10);return isFinite(n)&&n>=a&&n<=b?n:null;};let n;
  if((n=num('ad_every',2,6))!==null)AD_EVERY=n;if((n=num('ad_gap',180,600))!==null)AD_GAP=n*1000;
  if((n=num('ad_from',5,12))!==null)AD_FROM=n;if((n=num('ad_off',0,1))!==null)AD_OFF=n;}

/* ================= кристаллы 💎 ================= */
function updCr(){const e=$('crCnt');if(e)e.textContent=S.cr;STAT.bal(S.cr|0);}
// оформление «Кабинет председателя» (покупка office): включено, пока игрок не выключил в настройках
// «Лихие 90-е» (покупка set90) — тема th-90s (CSS — js/meta-ui.js); включена, пока не выключили; главнее «Кабинета» (две темы сразу не смешиваем)
const th90On=()=>PAY.own('set90')&&S.th90!==false,thOffOn=()=>PAY.own('office')&&S.office!==false&&!th90On();
function applyOffice(){if(window.THEME){THEME.apply();return;}if(!document.body)return; // M27: темы — js/themes.js (THEME); здесь — только до его загрузки
  document.body.classList.toggle('th-office',thOffOn());document.body.classList.toggle('th-90s',th90On());}

/* ---- товары «Магната» (каталог — hobby-analytics/13-purchases-catalog.md). Не продаём рубли, место в рейтинге и «удачу» торгов ----
   vk — цена в голосах (в hobby-pay/catalog.json — под ключом «54794426» (VK app_id игры)) */
const PAY_ROW='set';
const PAY_ITEMS={
  no_ads:{perm:1,bonus:30,vk:14,ic:'🚫',name:'Без рекламы',desc:'Навсегда без рекламы между месяцами, и сразу +30 💎. Ролики за награду остаются — по желанию',
    en:{name:'No ads',desc:'No ads between months forever, plus 30 💎 right away. Rewarded videos stay optional'}},
  // 29.09 (утвердил владелец, hobby-analytics/29): спонсор (99 ₽ / 14, навсегда; в магазине только при adOk()), путёвка (149 ₽ / 21, расходуемая),
  // сейф (299 ₽ / 42), «Лихие 90-е» (79 ₽ / 11, навсегда, только вид). Удвоение 💎 за ролики и посылки — js/meta-ui.js
  sponsor:{perm:1,vk:14,ic:'🤝',name:'Договор со спонсором',desc:'Навсегда: кристаллы за ролики ×2 — вдвое больше 💎 за каждый ролик «Ролики дня» и бонус-ролик',
    en:{name:'Sponsor deal',desc:'Forever: crystals for videos ×2 — double 💎 for every daily video and bonus video'}},
  // M36 (П1, решение владельца 03.10): + «Продлить смену» без ролика (окна «Пока вас не было» — ui.js, biz-ui.js)
  manager:{perm:1,vk:21,ic:'👔',name:'Управляющий',desc:'Пока вас нет, управляющий ведёт дела 8 часов вместо 6 (8 игровых месяцев), а продлить смену можно без рекламы',
    en:{name:'Manager',desc:'While you’re away, the manager runs things for 8 hours instead of 6 (8 game months), and you can extend the shift without an ad'}},
  cr_s:{n:60,vk:7,ic:'💎',name:'Горсть кристаллов: 60 💎',desc:'Ускорить стройку, разведку, срочный контракт',done:'+60 💎 — спасибо!',
    en:{name:'Handful of crystals: 60 💎',desc:'Speed up construction, exploration, an urgent contract',done:'+60 💎 — thank you!'}},
  cr_l:{n:200,vk:18,ic:'💎',name:'Шкатулка кристаллов: 200 💎',desc:'Выгоднее горсти',done:'+200 💎 — спасибо!',
    en:{name:'Crystal casket: 200 💎',desc:'Better value than a handful',done:'+200 💎 — thank you!'}},
  // M36 (П1): сейф 600 → 800 💎 за те же 299 ₽ / 42 (лестница 💎 за рубль: путёвка больше не выгоднее сейфа)
  cr_xl:{n:800,vk:42,ic:'💰',name:'Сейф кристаллов: 800 💎',desc:'Самый большой и самый выгодный запас кристаллов',done:'+800 💎 — спасибо!',
    en:{name:'Crystal safe: 800 💎',desc:'The biggest and best-value crystal stock',done:'+800 💎 — thank you!'}},
  pass:{n:60,vk:21,ic:'🎫',name:'Путёвка председателя',desc:'Сразу +60 💎 и 30 посылок по 15 💎 — по одной в день, пропуски не сгорают. При первой покупке — эмблема и рамка',done:'+60 💎! Посылки ждут на «Планёрке»',
    en:{name:'Chairman’s voucher',desc:'60 💎 right away and 30 parcels of 15 💎 — one a day, missed days don’t burn. The first purchase adds an emblem and a frame',done:'+60 💎! Parcels are waiting at the Morning meeting'},
    give(){passGive();}},
  office:{perm:1,vk:11,ic:'🏛',name:'Кабинет председателя',desc:'Оформление игры: тёмное дерево и золото',
    en:{name:'Chairman’s office',desc:'Game theme: dark wood and gold'}},
  // этап 6 (28.09, утвердил владелец): стартовый набор (разовый, 79 ₽ / 11), «Всё и сразу» (299 ₽ / 40), торт (расходуемый, 49 ₽ / 7), вывески (79 ₽ / 11)
  starter:{perm:1,bonus:150,vk:11,ic:'🎁',name:'Стартовый набор председателя',desc:'150 💎 и эмблема «Золотой молот» перед названием холдинга. Один раз',
    en:{name:'Chairman’s starter pack',desc:'150 💎 and the “Golden hammer” emblem next to your holding’s name. One time only'}},
  bundle:{perm:1,bonus:200,vk:40,ic:'🧰',name:'Всё и сразу',desc:'Без рекламы между месяцами, «Управляющий» (8 часов вместо 6), «Кабинет председателя» и 200 💎. Что уже куплено — заменим на +60 💎 за каждое',
    en:{name:'Everything at once',desc:'No ads between months, the Manager (8 hours instead of 6), the Chairman’s office and 200 💎. Anything you already own is swapped for +60 💎 each'},
    give(){payBundle();}},
  tea:{n:25,vk:7,ic:'🎂',name:'Торт для Людмилы Санны',desc:'Порадовать главбуха — и +25 💎. Спасибо, что поддерживаете игру!',done:'Людмила Санна растрогана: +25 💎',
    en:{name:'A cake for Lyudmila Sanna',desc:'Treat your chief accountant — and get +25 💎. Thank you for supporting the game!',done:'Lyudmila Sanna is touched: +25 💎'},
    give(){S.teaN=(S.teaN||0)+1;}},
  livery:{perm:1,vk:11,ic:'🎨',name:'Вывески и цвета сети',desc:'Сразу 6 эмблем и 6 цветов вывесок — только для красоты',
    en:{name:'Chain signs and colours',desc:'6 emblems and 6 sign colours at once — just for looks'}},
  set90:{perm:1,vk:11,ic:'📼',name:'Коллекция «Лихие 90-е»',desc:'Тема оформления «Ларёк 90-х», 3 эмблемы, цвет вывесок «Малиновый пиджак» и кожаная рамка — только для красоты',
    en:{name:'The Wild 90s collection',desc:'“90s kiosk” theme, 3 emblems, the “Raspberry blazer” sign colour and a leather frame — just for looks'},
    give(){S.th90=true;}},
  // 01.10 (решил владелец): тема «Тёплый плакат» (79 ₽ / 11, навсегда, только вид) — тема poster в js/themes.js (unlock pay th_poster); после покупки payAfter(id) → THEME.bought включает её сама
  th_poster:{perm:1,vk:11,ic:'🖼',name:'Тема «Тёплый плакат»',desc:'Оформление игры в тёплых цветах старого плаката — только для красоты. Навсегда',
    en:{name:'“Warm poster” theme',desc:'The game in the warm colours of an old poster — just for looks. Forever'}},
  // M28, 01.10 (утвердил владелец): щепотка 29 ₽ / 4, набор недропользователя 149 ₽ / 21 (один раз, виден с главы «Карьер» — js/shop.js),
  // «Вся красота» 199 ₽ / 28 (office + set90 + th_poster + livery, за уже купленное +40 💎). Эмблема «Золотая кирка» (em_gpick) — в js/shop.js

  cr_xs:{n:25,vk:4,ic:'💎',name:'Щепотка кристаллов: 25 💎',desc:'Чтобы попробовать: ускорить стройку или купить украшение',done:'+25 💎 — спасибо!',
    en:{name:'A pinch of crystals: 25 💎',desc:'To try it out: speed up construction or buy a decoration',done:'+25 💎 — thank you!'}},
  nedra_pack:{perm:1,bonus:400,vk:21,ic:'⛏',name:'Набор недропользователя',desc:'400 💎 и эмблема «Золотая кирка» перед названием холдинга. Один раз',
    en:{name:'Mineral rights holder’s pack',desc:'400 💎 and the “Golden pickaxe” emblem next to your holding’s name. One time only'},
    give(){if(!payObj(S.cos))S.cos={};S.cos.em_gpick=1;}},
  look_all:{perm:1,vk:28,ic:'🎨',name:'Вся красота',desc:'Темы «Кабинет председателя», «Тёплый плакат», коллекция «Лихие 90-е» и «Вывески и цвета сети». Что уже куплено — заменим на +40 💎 за каждое',
    en:{name:'All the looks',desc:'The “Chairman’s office” and “Warm poster” themes, “The Wild 90s” collection and “Chain signs and colours”. Anything you already own is swapped for +40 💎 each'},
    give(){payLookAll();}},
  // M36 (П2, решение владельца 03.10): «Рабочий набор» 49 ₽ / 7 (гл. 1–2, пока не куплены силы), наборы глав: «Набор сетевика» 99 ₽ / 14 (с «Сети»),
  // «Колокол биржи» 149 ₽ / 21 (с «Недр», строка — в окне IPO), якорь «Магнат навсегда» 499 ₽ / 71 (с «Сети»). Где видно — js/shop.js SHOW
  // M36: содержимое подобрано симулятором (hobby-analytics/release-b/M36-mon.md): рука + силы давали +18 % капитала в sim-friends (порог 10 %) → силы + 30 💎
  kit1:{perm:1,bonus:30,vk:7,ic:'🛠',name:'Рабочий набор',desc:'Навсегда: ⚡ +20 к запасу сил — больше работы без отдыха, и сразу +30 💎. Если силы уже куплены — вернём кристаллами. Один раз',
    en:{name:'Work kit',desc:'Forever: ⚡ +20 to your energy reserve — more work without rest, plus 30 💎 right away. If you already bought the energy, it’s refunded in crystals. One time only'},
    give(){payKit();}},
  net_pack:{perm:1,bonus:250,vk:14,ic:'🏬',name:'Набор сетевика',desc:'250 💎, эмблема «Универмаг» 🏬 и цвет вывесок «Фирменный» — для своей сети. Один раз',
    en:{name:'Chain owner’s pack',desc:'250 💎, the “Department store” 🏬 emblem and the “Signature” sign colour — for your chain. One time only'}},
  ipo_pack:{perm:1,bonus:300,vk:21,ic:'🔔',name:'Колокол биржи',desc:'300 💎, тема оформления «Биржа», эмблема «Колокол» 🔔 и рамка «Биржевая» — к выходу на биржу. Один раз',
    en:{name:'Exchange bell',desc:'300 💎, the “Exchange” theme, the “Bell” 🔔 emblem and the “Exchange” frame — for going public. One time only'}},
  magnat:{perm:1,bonus:300,vk:71,ic:'👑',name:'Магнат навсегда',desc:'Всё навсегда: без рекламы между месяцами, «Договор со спонсором», «Управляющий», «Вся красота» (4 темы и коллекции) и 300 💎. Что уже куплено — заменим на +40 💎 за каждое',
    en:{name:'Tycoon forever',desc:'Everything forever: no ads between months, the Sponsor deal, the Manager, All the looks (4 themes and collections) and 300 💎. Anything you already own is swapped for +40 💎 each'},
    give(){payMagnat();}}
};
// «Путёвка председателя»: каждая покупка — свой ключ в S.psG (= номер дня покупки), взятые посылки — S.psT[ключ]. Облако сливает оба
// объекта по ключам (max) — посылки не размножаются. Эмблема «Путёвка» и рамка «Санаторная» — в S.cos. Посылки забирают в META (meta-ui.js)
function payDay(){const d=new Date(nowMs());return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);}
function passGive(){if(!isObj(S.psG))S.psG={};let k;do k='p'+nowMs().toString(36)+Math.random().toString(36).slice(2,6);while(S.psG[k]!=null);
  S.psG[k]=payDay();if(!isObj(S.cos))S.cos={};S.cos.em_pass=1;S.cos.fr_sana=1;}
// «Стартовый набор» (решение владельца 01.10): в продаже только первые 10 реальных дней с первого запуска (S.st0, облако — самый ранний); купленный виден всегда
const STARTER_DAYS=10;
function starterOn(){return PAY.own('starter')||nowMs()-(S.st0||nowMs())<STARTER_DAYS*864e5;}
// M36: сколько реальных дней стартовый набор ещё в продаже (честный остаток от S.st0; 0 — уже нет)
function starterLeft(){if(PAY.own('starter'))return 0;const ms=STARTER_DAYS*864e5-(nowMs()-(S.st0||nowMs()));return ms>0?Math.max(1,Math.ceil(ms/864e5)):0;}
// «Всё и сразу»: включает no_ads, manager, office; что уже было куплено — +60 💎 за каждое (один раз: S.buyB.bundle_c)
function payBundle(){if(!payObj(S.buy))S.buy={};if(!payObj(S.buyB))S.buyB={};let c=0;
  for(const id of ['no_ads','manager','office']){if(S.buy[id])c++;else S.buy[id]=1;}
  if(c&&!S.buyB.bundle_c){S.buyB.bundle_c=1;payAdd(60*c);}}
// английский для общего модуля PAY (сам модуль не трогаем): надписи его разметки и тосты переводит обёртка
function payHtml(ids,owned){const h=PAY.html(ids,owned);return LANG==='en'?h.replace('<h3>Покупки</h3>','<h3>Purchases</h3>').replace(/<i>куплено<\/i>/g,'<i>owned</i>'):h;}
const TOAST_EN={'Покупка зачислена':'Purchase added','Готово! Спасибо за покупку':'Done! Thanks for your purchase','Покупка не состоялась':'The purchase didn’t go through','Покупки проверены — всё на месте':'Purchases checked — everything is in place'};
const PAY_TEST={no_ads:99,sponsor:99,manager:149,cr_s:49,cr_l:129,cr_xl:299,pass:149,office:79,starter:79,bundle:299,tea:49,livery:79,set90:79,th_poster:79,cr_xs:29,nedra_pack:149,look_all:199,kit1:49,net_pack:99,ipo_pack:149,magnat:499}; // цены только для ?paytest=1; настоящие — в консоли
// «Вся красота»: включает office, set90, th_poster, livery; что уже было — +40 💎 за каждое (один раз: S.buyB.look_all_c)
function payLookAll(){if(!payObj(S.buy))S.buy={};if(!payObj(S.buyB))S.buyB={};let c=0;
  for(const id of ['office','set90','th_poster','livery']){if(S.buy[id])c++;else S.buy[id]=1;}
  if(c&&!S.buyB.look_all_c){S.buyB.look_all_c=1;payAdd(40*c);}}
// M36 «Магнат навсегда»: no_ads, sponsor, manager и «Вся красота» (office, th_poster, set90, livery); что уже было — +40 💎 за каждое (один раз: S.buyB.magnat_c)
function payMagnat(){if(!payObj(S.buy))S.buy={};if(!payObj(S.buyB))S.buyB={};let c=0;
  for(const id of ['no_ads','sponsor','manager','office','th_poster','set90','livery']){if(S.buy[id])c++;else{S.buy[id]=1;if(id==='set90')S.th90=true;}}
  if(c&&!S.buyB.magnat_c){S.buyB.magnat_c=1;payAdd(40*c);}}
// M36 «Рабочий набор»: первая ступень запаса сил (⚡ +20, 40 💎) навсегда — в S.pk (как покупка за 💎, game.js pkSync); уже купленная → её цена в 💎 (один раз: S.buyB.kit1_c)
function payKit(){try{if(window.GAME&&GAME.pkSync)GAME.pkSync();}catch(e){}if(!isObj(S.pk))S.pk={};let c=0;
  if((S.pk.enx|0)>=1)c+=40;else S.pk.enx=1;
  if(c){if(!payObj(S.buyB))S.buyB={};if(!S.buyB.kit1_c){S.buyB.kit1_c=1;payAdd(c);}}
  try{if(window.GAME&&GAME.pkSync)GAME.pkSync();}catch(e){}}
// M36 (П1): подарок за первую покупку — +50 💎 и рамка «Меценат», один раз на игрока (S.buyB.first; облако — объединение buyB). Кто уже покупал раньше — не новичок
const FIRST_CR=50;
function payPaid(){return !!(payObj(S.buyB)&&S.buyB.first)||payObj(S.buy)&&Object.keys(S.buy).some(k=>S.buy[k])||Array.isArray(S.payT)&&S.payT.length>0||Array.isArray(S.payV)&&S.payV.length>0||(S.teaN|0)>0||isObj(S.psG)&&Object.keys(S.psG).length>0;}
function payFirst(){if(!payObj(S.buyB))S.buyB={};if(S.buyB.first)return false;S.buyB.first=1;payAdd(FIRST_CR);if(!isObj(S.cos))S.cos={};S.cos.fr_mecen=1;return true;}
function payAdd(n){S.cr+=n;STAT.earn('buy',n);STAT.bal(S.cr|0);}   // STAT v1.2: 💎 из покупок — earn buy
function payFlush(){cloudFlush();}
function payPause(on){setPause('pay',on);}
// после покупки/восстановления: 💎 на экране, оформление, перерисовать окно, где были кнопки (PAY.re), и интерфейс
function payAfter(id){updCr();try{if(id&&window.THEME)THEME.bought(id);}catch(e){}applyOffice();if(modalOn&&PAY.re)PAY.re();try{window.uiRefresh&&window.uiRefresh();}catch(e){setTimeout(()=>{throw e;});}}
/* ================= покупки за деньги: Яндекс Игры (ysdk.payments) и VK Игры (VKWebAppShowOrderBox) — общий модуль (одинаковый в 5 играх) =================
   Товары игры — PAY_ITEMS (выше), id совпадают с id в консоли Яндекса («Инап-покупки») и в hobby-pay/catalog.json (VK).
   Кнопок покупок НЕТ совсем, если платежи недоступны: нет SDK/моста (мак), каталог Яндекса пуст, VK не поддерживает оплату (iOS).
   Постоянные (perm) — флаг S.buy[id], разовый бонус монет — один раз на игрока (S.buyB). Выдача — только после подтверждения площадки.
   Яндекс: цена и значок валюты — только из getCatalog; расходуемые: выдать → сохранить (облако сразу) → consumePurchase;
     незавершённые при запуске довыдаём (getPurchases). Токены выданных — S.payT (и в облаке), сбой consume не даст выдать второй раз.
   VK: на кнопке число голосов (PAY_ITEMS.vk). success:true + order_id → выдать → сохранить → стереть ключ pay_<order_id>.
     Страховка: сервер vk-pay при оплате пишет в хранилище VK игрока pay_<order_id>=id (расходуемые) и own_<id>=1 (постоянные);
     при запуске читаем их и довыдаём. Выданные order_id — S.payV (последние 30); покупка без order_id оставляет метку «x:<id>»,
     которая «съест» первый чужой pay_ этого товара — второй раз не выдастся.
   Мак: ?paytest=1 — имитация Яндекса (localStorage «paytest»), ?vk=1&paytest=1 — имитация VK с сервером (localStorage «paytestvk»),
   ?paytest=fail — отказ. В настоящем VK (vk_app_id) и в Яндексе заглушек нет */
const payObj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const PAY={on:false,p:null,v:null,list:[],busy:false,
  test:/[?&]paytest=/.test(location.search),
  // запуск: после SDK/моста и облака. Незавершённые покупки обрабатываем, даже если каталог не пришёл
  async init(){if(PAY.p||PAY.v)return;
    if(PLAT==='vk')return PAY.initVK();
    try{if(ysdk)PAY.p=ysdk.getPayments?await payT(ysdk.getPayments({signed:false})):ysdk.payments;
      else if(PAY.test&&!window.YaGames)PAY.p=payStub();}catch(e){PAY.p=null;}
    if(!PAY.p)return;
    try{await PAY.restore();}catch(e){}
    try{const c=await payT(PAY.p.getCatalog());PAY.list=(Array.isArray(c)?c:[]).filter(x=>x&&PAY_ITEMS[x.id]);}catch(e){PAY.list=[];}
    PAY.on=PAY.list.length>0;if(PAY.on)payAfter();},
  async initVK(){
    if(VK){let ok=false;try{ok=!!(VK.supportsAsync&&await payT(VK.supportsAsync('VKWebAppShowOrderBox'),8000));}catch(e){}if(ok)PAY.v=payVK();}
    else if(PAY.test&&!VK_REAL)PAY.v=payStubVK();
    if(!PAY.v)return;
    try{await PAY.restore();}catch(e){}
    PAY.list=Object.keys(PAY_ITEMS).filter(id=>PAY_ITEMS[id].vk>0).map(id=>({id}));
    PAY.on=PAY.list.length>0;if(PAY.on)payAfter();},
  own(id){return !!(payObj(S.buy)&&S.buy[id]);},
  item(id){return PAY.list.find(x=>x.id===id)||null;},
  give(id){const it=PAY_ITEMS[id];
    if(it.perm){if(!payObj(S.buy))S.buy={};S.buy[id]=1;
      if(it.bonus){if(!payObj(S.buyB))S.buyB={};if(!S.buyB[id]){S.buyB[id]=1;payAdd(it.bonus);}}}
    else payAdd(it.n||0);
    if(it.give)it.give();},
  // при запуске и «Восстановить покупки»: постоянные — выдать, если флага нет; расходуемые — довыдать и отметить
  async restore(){let got=0;
    if(PAY.v)got=await PAY.restoreVK();
    else{const ps=await payT(PAY.p.getPurchases());
      for(const x of (Array.isArray(ps)?ps:[])){const it=x&&PAY_ITEMS[x.productID];if(!it)continue;
        if(it.perm){if(!PAY.own(x.productID)){PAY.give(x.productID);got=1;}}else if(await PAY.credit(x))got=1;}}
    if(got){save();payFlush();payAfter();toast('Покупка зачислена',2600);}
    return got;},
  // VK: ключи own_<id> (постоянные, не стираем) и pay_<order_id> (расходуемые: выдать, сохранить, стереть)
  async restoreVK(){const ks=await PAY.v.keys();let got=0;const done=[];if(!Array.isArray(S.payV))S.payV=[];
    for(const k of ks){const m=/^(own|pay)_(.+)$/.exec(k.key||'');if(!m||!k.value)continue;
      if(m[1]==='own'){const it=PAY_ITEMS[m[2]];if(it&&it.perm&&!PAY.own(m[2])){PAY.give(m[2]);got=1;}continue;}
      const id=String(k.value),it=PAY_ITEMS[id];if(!it)continue;
      if(S.payV.indexOf(m[2])<0){const x=S.payV.indexOf('x:'+id); // покупка без order_id уже выдана — это её заказ
        if(x>=0)S.payV[x]=m[2];else{PAY.give(id);payMark(m[2]);got=1;}}
      done.push(k.key);}
    if(done.length){save();payFlush();for(const k of done)try{await PAY.v.clear(k);}catch(e){}}
    return got;},
  // расходуемая: выдать (если этот токен ещё не выдавали), сохранить в облако и только потом consumePurchase
  async credit(x){const t=String(x.purchaseToken||'');if(!Array.isArray(S.payT))S.payT=[];let fresh=false;
    if(!t||S.payT.indexOf(t)<0){PAY.give(x.productID);if(t)S.payT.push(t);if(S.payT.length>30)S.payT=S.payT.slice(-30);save();payFlush();fresh=true;}
    try{if(t)await payT(PAY.p.consumePurchase(t));}catch(e){}
    return fresh;},
  async buy(id){const it=PAY_ITEMS[id];if(!it||PAY.busy||!PAY.on||!PAY.item(id)||(it.perm&&PAY.own(id)))return;PAY.busy=true;payPause(true);
    try{if(PAY.v){const r=await PAY.v.order(id);if(!r||!r.success)throw new Error('cancel');
        const oid=r.order_id!=null?String(r.order_id):'';if(!Array.isArray(S.payV))S.payV=[];
        if(!oid||S.payV.indexOf(oid)<0){PAY.give(id);payMark(oid||'x:'+id);}
        save();payFlush();if(oid)PAY.v.clear('pay_'+oid).catch(()=>{});}
      else{const x=await PAY.p.purchase({id});
        if(it.perm){PAY.give(id);save();payFlush();}
        else await PAY.credit(x&&x.productID===id?x:{productID:id,purchaseToken:x&&x.purchaseToken});}
      SND.coin();toast(it.done||'Готово! Спасибо за покупку',2800);payAfter(id);}
    catch(e){toast('Покупка не состоялась',2200);}
    finally{PAY.busy=false;payPause(false);}},
  // «Восстановить покупки» (Об игре): заново читаем getPurchases / ключи VK
  async again(){if(!(PAY.p||PAY.v)||PAY.busy)return;PAY.busy=true;let got=0;try{got=await PAY.restore();}catch(e){}PAY.busy=false;if(!got)toast('Покупки проверены — всё на месте',2400);},
  // цена: VK — число голосов (требование VK); Яндекс — из каталога: число + значок валюты (getPriceCurrencyImage), иначе готовая строка price
  price(pr){if(PAY.v){const n=PAY_ITEMS[pr.id].vk,a=n%10,b=n%100;return n+' '+(a===1&&b!==11?'голос':a>=2&&a<=4&&(b<12||b>14)?'голоса':'голосов');}
    let img='';try{img=pr.getPriceCurrencyImage?pr.getPriceCurrencyImage('svg'):'';}catch(e){}
    return img&&pr.priceValue?payEsc(pr.priceValue)+'<img class="pcur" src="'+payEsc(img)+'" alt="">':payEsc(pr.price||pr.priceValue||'');},
  row(pr){const it=PAY_ITEMS[pr.id],own=it.perm&&PAY.own(pr.id),txt='<span>'+it.ic+' '+payEsc(it.name)+'<br><small>'+payEsc(it.desc)+'</small></span>';
    return own?'<div class="'+PAY_ROW+' pown">'+txt+'<i>куплено</i></div>':'<button class="'+PAY_ROW+' pbuy" data-pid="'+payEsc(pr.id)+'">'+txt+'<b>'+PAY.price(pr)+'</b></button>';},
  // список товаров (ids — только эти, по порядку каталога); owned=false — без уже купленных
  html(ids,owned){const L=PAY.list.filter(pr=>(!ids||ids.indexOf(pr.id)>=0)&&(owned!==false||!(PAY_ITEMS[pr.id].perm&&PAY.own(pr.id))));
    return L.length?'<div class="pay"><h3>Покупки</h3>'+L.map(PAY.row).join('')+'</div>':'';},
  bind(root){(root||document).querySelectorAll('.pbuy').forEach(b=>b.onclick=()=>{try{(SND.tap||SND.click)();}catch(e){}PAY.buy(b.dataset.pid);});}
};
function payMark(v){if(!Array.isArray(S.payV))S.payV=[];if(S.payV.indexOf(v)<0)S.payV.push(v);if(S.payV.length>30)S.payV=S.payV.slice(-30);}
// слияние облака (d) в сохранение T (по умолчанию S): купленное, выданные бонусы, токены и заказы — объединение (покупка не теряется ни с какой стороны)
function payMerge(d,T){T=T||S;if(!payObj(d)||!payObj(T))return;
  for(const f of ['buy','buyB'])if(payObj(d[f])){if(!payObj(T[f]))T[f]={};for(const k in d[f])if(d[f][k])T[f][k]=1;}
  for(const f of ['payT','payV'])if(Array.isArray(d[f])){if(!Array.isArray(T[f]))T[f]=[];for(const t of d[f])if(typeof t==='string'&&T[f].indexOf(t)<0)T[f].push(t);if(T[f].length>30)T[f]=T[f].slice(-30);}}
function payT(p,ms){return Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms||15000))]);}
function payEsc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);}
// VK: окно оплаты (игрок может думать долго — ждём до 10 мин) и ключи хранилища, которые пишет сервер vk-pay
function payVK(){return {order:id=>vkSend('VKWebAppShowOrderBox',{type:'item',item:id},600000),
  keys:async()=>{const r=await vkSend('VKWebAppStorageGetKeys',{count:1000,offset:0},8000),ks=((r&&r.keys)||[]).filter(k=>/^(own|pay)_/.test(k));
    if(!ks.length)return [];const g=await vkSend('VKWebAppStorageGet',{keys:ks},8000);return (g&&g.keys)||[];},
  clear:k=>vkSend('VKWebAppStorageSet',{key:k,value:''},8000)};}
// имитация платежей для проверки на маке (?paytest=1): цены — PAY_TEST, покупки лежат в localStorage «paytest», consume их убирает
function payStub(){const K='paytest',rd=()=>{try{return JSON.parse(localStorage.getItem(K))||[];}catch(e){return [];}},wr=a=>{try{localStorage.setItem(K,JSON.stringify(a));}catch(e){}};
  const cur='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#f5b400"/><text x="10" y="14.5" font-size="12" text-anchor="middle" font-family="Arial" font-weight="700" fill="#fff">T</text></svg>');
  const wait=v=>new Promise(ok=>setTimeout(()=>ok(v),250)),fail=()=>window.__payCancel||/[?&]paytest=fail/.test(location.search);
  return {getCatalog:()=>wait(Object.keys(PAY_TEST).map(id=>({id,title:id,description:'',imageURI:'',price:PAY_TEST[id]+' тест',priceValue:String(PAY_TEST[id]),priceCurrencyCode:'TST',getPriceCurrencyImage:()=>cur}))),
    getPurchases:()=>wait(rd()),
    purchase:({id})=>fail()?Promise.reject(new Error('cancel')):wait(null).then(()=>{const x={productID:id,purchaseToken:'t'+Date.now()+Math.random().toString(36).slice(2,6),developerPayload:''};const a=rd();a.push(x);wr(a);return x;}),
    consumePurchase:t=>{if(window.__payNoConsume)return Promise.reject(new Error('fail'));wr(rd().filter(x=>x.purchaseToken!==t));return wait();}};}
// имитация VK (?vk=1&paytest=1): «сервер» пишет pay_/own_ в localStorage «paytestvk», как vk-pay в хранилище VK.
// __payNoOid — ответ без order_id, __payNoClear — стирание ключа не прошло, ?paytest=fail / __payCancel — отказ
function payStubVK(){const K='paytestvk',rd=()=>{try{return JSON.parse(localStorage.getItem(K))||{};}catch(e){return {};}},wr=o=>{try{localStorage.setItem(K,JSON.stringify(o));}catch(e){}};
  const wait=v=>new Promise(ok=>setTimeout(()=>ok(v),250)),fail=()=>window.__payCancel||/[?&]paytest=fail/.test(location.search);
  return {order:id=>fail()?Promise.reject({error_type:'client_error'}):wait().then(()=>{const oid=String(Date.now()),o=rd();
      if(PAY_ITEMS[id].perm)o['own_'+id]='1';else o['pay_'+oid]=id;wr(o);return window.__payNoOid?{success:true}:{success:true,order_id:+oid};}),
    keys:()=>wait(Object.entries(rd()).filter(([k,v])=>v).map(([key,value])=>({key,value}))),
    clear:k=>{if(window.__payNoClear)return Promise.reject(new Error('fail'));const o=rd();delete o[k];wr(o);return wait();}};}

/* ================= рейтинг «Лучшая неделя холдинга» =================
   Очки (с 28.09) — рост стоимости компании за неделю в процентах: номер недели × 100 000 + сотые доли процента (GAME.weekGain().score, до 999,99 %).
   Номер недели впереди — Яндекс хранит лучший результат, а новая неделя всегда выше старой, так что старые рекорды уходят вниз. Яндекс: лидерборд week
   (в консоли: лучший результат, по убыванию). VK: таблица друзей VKWebAppShowLeaderBoardBox. Нет SDK/моста — кнопки нет. */
const LB={
  score(){try{if(window.GAME&&GAME.weekGain){const g=GAME.weekGain().score;return isFinite(g)?Math.max(0,Math.floor(g)):0;}}catch(e){}return 0;},
  // лучший результат ЭТОЙ недели (старые очки в млн ₽ и прошлые недели — не в счёт)
  best(){const wk=window.GAME&&GAME.weekNo?GAME.weekNo():0,b=S.lbB||0;return Math.max(Math.floor(b/1e5)===wk?b:0,LB.score());},
  pct(n){n=Math.max(0,n||0)%1e5/100;const t=n>=100?String(Math.floor(n)):n.toFixed(1);return (LANG==='en'?t:t.replace('.',','))+(LANG==='en'?'%':' %');},
  ok(){return PLAT==='vk'?!!VK:!!(ysdk&&(ysdk.leaderboards||ysdk.getLeaderboards));},
  // зовёт game.js после закрытия месяца; отправляем, только если побили свой лучший результат (force — после входа)
  async submit(force){const n=LB.score();if(n>(S.lbB||0)){S.lbB=n;save();}const b=S.lbB||0;
    if(PLAT==='vk'||!ysdk||!b||(!force&&b<=(LB.sent||0)))return;LB.sent=b;
    try{if(ysdk.leaderboards&&ysdk.leaderboards.setScore)await ysdk.leaderboards.setScore('week',b);
      else{const lb=await ysdk.getLeaderboards();await lb.setLeaderboardScore('week',b);}}catch(e){LB.sent=0;}},
  async entries(){const o={includeUser:true,quantityAround:2,quantityTop:10};
    try{if(ysdk.leaderboards&&ysdk.leaderboards.getEntries)return await ysdk.leaderboards.getEntries('week',o);
      const lb=await ysdk.getLeaderboards();return await lb.getLeaderboardEntries('week',o);}catch(e){return null;}},
  async show(){
    if(PLAT==='vk'){if(!VK)return;vkSend('VKWebAppShowLeaderBoardBox',{user_result:Math.round(LB.best()%1e5/100)},60000).catch(()=>toast('Таблица друзей сейчас недоступна'));return;}
    if(!ysdk)return;
    const title=L('🏆 Лучшая неделя холдинга','🏆 Best holding week');
    modal(`<h2>${title}</h2><p>${L('Загружаем…','Loading…')}</p><div class="row"><button class="btn" id="lbClose">${L('Закрыть','Close')}</button></div>`);$('lbClose').onclick=hideModal;
    const r=await LB.entries();if(!modalOn||!$('lbClose'))return;const list=(r&&r.entries)||[];
    const me=r&&typeof r.userRank==='number'?r.userRank:0,authed=!!(YP&&YP.getMode&&YP.getMode()!=='lite');
    const esc=t=>String(t||'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
    const rows=list.map(e=>`<div class="lbr${e.rank===me?' me':''}"><b>${e.rank}</b><span>${esc(e.player&&e.player.publicName)||L('Игрок','Player')}</span><i>+${LB.pct(e.score)}</i></div>`).join('');
    modal(`<h2>${title}</h2><p>${L('На сколько процентов выросла стоимость компании за эту неделю — честно для всех, от ларька до холдинга. У вас:','By what percentage your company’s value grew this week — fair for everyone, from a kiosk to a holding. Yours:')} <b>+${LB.pct(LB.best())}</b></p>
      <div class="lb">${rows||'<p>'+L('Пока пусто — будьте первым!','Empty so far — be the first!')+'</p>'}</div>
      ${authed?'':'<p><small>'+L('Чтобы попасть в рейтинг, войдите в аккаунт.','Sign in to get on the leaderboard.')+'</small></p>'}
      <div class="row">${authed||!(ysdk&&ysdk.auth)?'':`<button class="btn accent noenter" id="lbAuth">${L('Войти','Sign in')}</button>`}<button class="btn" id="lbClose">${L('Закрыть','Close')}</button></div>`);
    modalRe=LB.show;$('lbClose').onclick=hideModal;
    const a=$('lbAuth');if(a)a.onclick=async()=>{try{await ysdk.auth.openAuthDialog();YP=await ysdk.getPlayer({scopes:false});
      clearTimeout(cloudT);cloudT=0;cloudReady=false;cloudTry=0;await cloudLoad(true);updCr();await LB.submit(true);}catch(e){}LB.show();};}
};

/* ================= общее: окна, тосты, время ================= */
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const calm=()=>S.calm===true||RM;
let modalOn=false,modalRe=null; // modalRe — функция, которая перерисует открытое окно (смена языка)
// M38 (a45, игрок 45+): тост — не дольше 2 с, на месте нижнего меню (не поверх читаемого текста), при открытом окне — в очередь
// (покажется после закрытия; ответ на своё нажатие в окне — сразу, внизу); очередь — не больше 3, одинаковые не повторяются
let tapT=0;try{document.addEventListener('pointerdown',()=>{tapT=Date.now();},{passive:true,capture:true});}catch(e){}
const TOAST_MIN=1200;   // M48: тост виден не меньше 1,2 с, если за ним очередь
function toast(t,ms){if(LANG==='en'&&TOAST_EN[t])t=TOAST_EN[t];const e=$('toast');if(!e||!t)return;
  if(modalOn&&Date.now()-tapT>700){const q=toast.q||(toast.q=[]);const i=q.indexOf(t);if(i>=0)q.splice(i,1);q.push(t);if(q.length>3)q.shift();return;}
  // M48: другой тост не перебивает показанный раньше чем через TOAST_MIN — ждёт в очереди (было: итог первого заказа «+1 200 ₽» виден 0,1 с — его сразу накрывали «Звание», «+1 💎», «Новое фото»)
  const age=Date.now()-(toast.at||0);if(e.classList.contains('on')&&toast.base!==t&&age<TOAST_MIN){const q=toast.q||(toast.q=[]);const i=q.indexOf(t);if(i>=0)q.splice(i,1);q.push(t);if(q.length>4)q.shift();clearTimeout(toast._w);toast._w=setTimeout(()=>toastNext(1),TOAST_MIN-age+30);return;}
  if(e.classList.contains('on')&&toast.base===t){toast.n=(toast.n|0)+1;e.textContent=t+' ×'+toast.n;}else{toast.base=t;toast.n=1;e.textContent=t;}   // M47: одинаковые тосты подряд склеиваем («×3»)
  e.classList.add('on');clearTimeout(toast._t);toast.at=Date.now();if(toast.q&&toast.q.length&&!modalOn){clearTimeout(toast._w);toast._w=setTimeout(()=>toastNext(1),TOAST_MIN+30);}
  const d=ms&&ms<2000?ms:2000;toast._t=setTimeout(()=>{e.classList.remove('on');if(toast.q&&toast.q.length)setTimeout(toastNext,350);},d);}
function toastNext(cut){if(modalOn||!toast.q||!toast.q.length)return;const e=$('toast');if(e&&e.classList.contains('on')){if(!(cut===1&&Date.now()-(toast.at||0)>=1000))return;clearTimeout(toast._t);}toast(toast.q.shift());}   // M44: после закрытия окна старый тост (висел над окном ≥ 1 с) уступает очереди — ждущий не стоит лишние 1–2 с
// окно = нижний лист на телефоне (css: .modal/#mcard); role=dialog, фокус внутрь окна и обратно
let mFocus=null;
// M38 (a45): одно окно за раз — окна, которые игра открывает сама (награды, сцены, торги), ждут WIN_GAP после закрытия прошлого окна
// (в проверке check.py с помощником __chk — без паузы, если не задано window.__winGap)
// M38 (a45): пауза «читаю» — человек сам листает экран (палец, колесо, клавиши) — игровое время стоит ещё READ_MS после последнего листания
// (GAME.hold 'read'; офлайн и симуляторы не задевает: S.lastT идёт всегда, модель та же). Программная прокрутка паузу не ставит.
// M46 (владелец, бета-10: «постоянно включает паузу»): пауза «читаю» — мягкая. Короткая прокрутка (к кнопке, по списку) время НЕ останавливает;
// пауза — только если человек листает дольше READ_ARM (серия касаний с промежутками < READ_GAP), держится READ_MS после последнего листания
// и не дольше READ_MAX подряд (потом время идёт, пока не будет READ_GAP без листания). Пока стоит — заметная плашка «⏸ Пауза — вы читаете · ▶ Продолжить»
// (#rdP под шапкой); «Продолжить» снимает паузу и не ставит её READ_OFF. В ⚙ — «⏸ Пауза, пока листаю». M47: по умолчанию ВЫКЛ (S.readP===true — включено).
const READ_MS=4000,READ_ARM=3500,READ_GAP=5000,READ_MAX=20000,READ_OFF=60000;
const RD={s0:0,last:0,on0:0,off:0,t:null};
function rdHold(){try{return !!(window.GAME&&GAME.hold&&GAME.hold.has('read'));}catch(e){return false;}}
// M47: плашка и при своей ⏸ (кнопка скорости) — видно, что время стоит, и «▶ Продолжить» снимает одним нажатием
function rdOwn(){try{return !!(window.GAME&&GAME.W&&GAME.speed()===0);}catch(e){return false;}}
function rdUi(){let b=$('rdP');const own=rdOwn(),on=(rdHold()||own)&&!modalOn&&!document.hidden;
  if(!on){if(b)b.classList.remove('on');return;}
  if(!b){b=document.createElement('div');b.id='rdP';b.setAttribute('role','status');document.body.appendChild(b);}
  const h=`<span>⏸ ${own?L('Пауза','Paused'):L('Пауза: читаете','Paused: reading')}</span><button class="noenter" id="rdGo">▶ ${L('Продолжить','Continue')}</button>`,hk=LANG+(own?'o':'r');if(b.dataset.l!==hk){b.innerHTML=h;b.dataset.l=hk;$('rdGo').onclick=rdGo;}
  try{const r=$('hdr').getBoundingClientRect();b.style.top=Math.max(0,Math.round(r.bottom)+6)+'px';}catch(e){}b.classList.add('on');}
function rdOff(){clearTimeout(RD.t);RD.t=null;try{GAME.hold.delete('read');}catch(e){}rdUi();try{window.UI&&UI.hdr&&UI.hdr();}catch(e){}}
function rdGo(e){if(e){e.preventDefault();e.stopPropagation();}try{if(GAME.speed()===0)GAME.setSpeed(1);}catch(x){}resumeNow();try{SND.tap();}catch(x){}}
// M46 (владелец: «пауза включается — её не снимешь»): кнопка скорости ×1/×2 при авто-паузе меняла скорость, а «читаю» держало время (и ставилось снова от
// следующего листания) — время не шло. resumeNow() — снять все мягкие авто-паузы («читаю», совет Людмилы, словарик) и не ставить «читаю»,
// пока игрок сам не откроет окно (modal после касания). Зовут: кнопка скорости, «▶ Продолжить», нажатие на строку дня в шапке.
function resumeNow(){RD.off=Infinity;clearTimeout(RD.t);RD.t=null;try{GAME.hold.delete('read');GAME.hold.delete('advb');}catch(e){}
  if(!document.hidden){if(pauseWhy.has('vkh'))setPause('vkh',false);if(pauseWhy.has('hide'))setPause('hide',false);}   // M47: вкладка видна — «скрыта» снимаем
  try{if(window.GLOSS&&GLOSS.isOpen())GLOSS.hide();}catch(e){}rdUi();try{window.UI&&UI.hdr&&UI.hdr();}catch(e){}
  try{return GAME.running();}catch(e){return false;}}
(function(){let inT=0;const mark=()=>{inT=Date.now();};
  try{for(const ev of ['touchmove','wheel','keydown'])document.addEventListener(ev,mark,{passive:true,capture:true});
    document.addEventListener('scroll',()=>{const now=Date.now();if(now-inT>1200||S.readP!==true)return;   // M47: по умолчанию выкл. (включить — ⚙)
      let G=null;try{G=GAME;}catch(e){}if(!G||!G.hold)return;
      if(now-RD.last>READ_GAP){RD.s0=now;if(!G.hold.has('read'))RD.on0=0;}RD.last=now;   // новая серия листания
      if(now<RD.off||now-RD.s0<READ_ARM)return;   // «Продолжить» нажали недавно / листает недолго — время идёт
      if(!G.hold.has('read')){if(RD.on0&&now-RD.on0>=READ_MAX)return;RD.on0=now;G.hold.add('read');try{window.UI&&UI.hdr&&UI.hdr();}catch(e){}}
      else if(now-RD.on0>=READ_MAX){rdOff();return;}   // не залипает: 20 с подряд — хватит
      rdUi();clearTimeout(RD.t);RD.t=setTimeout(rdOff,READ_MS);},{passive:true,capture:true});}catch(e){}})();
let mCloseT=0;function winCalm(){const g=window.__winGap!=null?window.__winGap:(window.__chk?0:5000);return !modalOn&&Date.now()-mCloseT>=g&&Date.now()-tapT>=700&&Date.now()-inAt>=700;}   // M47: окно игры — не под пальцем (касание < 0,7 с назад — подождать)
// M47 (владелец, бета-11, вариант «а»): окно, которое открыл игрок, время НЕ останавливает. Держат время только окна modal(html,{hold:1}):
// закрытие месяца, «Пока вас не было», решения (события «Нужно ваше решение», торги, вопросы недр, сцены с выбором), сломанный сейв.
// Держит до hideModal (цепочка окон из такого окна — тоже держит), но не дольше HOLD_IDLE без касаний (игру оставили открытой — время идёт).
// modalOn остаётся «окно открыто» (Enter, winCalm, тосты, пуши); GAME.running() смотрит modalHolds().
const HOLD_IDLE=60000;let modalHold=false,mHoldT=0,inAt=0;
try{for(const ev of ['pointerdown','keydown','wheel','touchstart'])document.addEventListener(ev,()=>{inAt=Date.now();
  if(!document.hidden){if(pauseWhy.has('vkh'))setPause('vkh',false);if(pauseWhy.has('hide'))setPause('hide',false);}},{passive:true,capture:true});}catch(e){}   // игрок трогает игру — она видна: «скрыта» не залипает (VK)
// M47: почему время стоит — честно, словами (тост кнопок скорости/паузы)
function pauseReason(){try{if(document.hidden)return '';if(pauseWhy.has('ad'))return L('Идёт реклама — время продолжится после неё','An ad is playing — time resumes after it');if(pauseWhy.has('pay'))return L('Идёт оплата — время продолжится после неё','Payment in progress — time resumes after it');
  if(pauseWhy.has('sdk'))return L('Площадка поставила игру на паузу — продолжится сама','The platform paused the game — it resumes by itself');if(modalHolds())return L('Время стоит, пока открыто это окно — ответьте или закройте его','Time stands while this window is open — answer or close it');
  if(GAME.hold.has('pro')||GAME.hold.has('advb')||GAME.hold.has('tut'))return L('Людмила Санна ждёт ваш шаг — нажмите подсвеченную кнопку','Lyudmila Sanna is waiting for your step — tap the highlighted button');if(GAME.hold.has('broken'))return L('Сначала решите, что делать с сохранением','First decide what to do with the save');}catch(e){}return '';}
function modalH(h){return modal(h,{hold:1});}   // окно, которое держит время (см. выше)
function modalHolds(){return modalOn&&modalHold&&Date.now()-Math.max(inAt,mHoldT)<HOLD_IDLE;}
/* M37: память прокрутки окон. Цепочка окон одного показа (до hideModal + 0,6 с) — стек {s:подпись, y, my, n}; подпись — data-nav или заголовок h2 + выбранная вкладка + начало первого абзаца (без цифр).
   Новое окно с подписью из стека — это «назад» (или перерисовка того же окна): позиция, где был; иначе — вперёд, сверху. Вложенные прокрутки (.lb и т. п.) — тоже. */
let mNav=[],mNavT=0;
// поставить прокрутку и подержать её ~0,2 с: после перерисовки бывают поздние вставки (✕ окна через 30 мс, плашки, недвижимость), и «якорение» браузера сдвигает позицию; палец/колесо — отпускаем
function scrollPin(el,y){if(!el)return;const t=el._pin=(el._pin|0)+1,re=()=>{if(el._pin===t&&Math.abs(el.scrollTop-y)>1)el.scrollTop=y;};el.scrollTop=y;if(!y)return;
  Promise.resolve().then(re);try{requestAnimationFrame(()=>{re();setTimeout(re,60);setTimeout(re,160);setTimeout(re,260);});}catch(e){setTimeout(re,60);}}
// кто-то прокручивает сам (подсветка обучения, «к событию») — его прокрутка главнее удержания
try{const siv=Element.prototype.scrollIntoView,sto=Element.prototype.scrollTo;
  if(siv)Element.prototype.scrollIntoView=function(){let p=this.parentNode;while(p&&p.nodeType===1){if(p._pin)p._pin++;p=p.parentNode;}return siv.apply(this,arguments);};
  if(sto)Element.prototype.scrollTo=function(){if(this._pin)this._pin++;return sto.apply(this,arguments);};}catch(e){}
['wheel','touchstart','pointerdown','keydown'].forEach(k=>document.addEventListener(k,e=>{let p=e.target;while(p&&p.nodeType===1){if(p._pin)p._pin++;p=p.parentNode;}const m=document.getElementById('main'),c=document.getElementById('mcard');if(m&&m._pin&&k!=='pointerdown')m._pin++;if(c&&c._pin&&k!=='pointerdown')c._pin++;},{capture:true,passive:true}));
function mSig(c){const d=c.querySelector('[data-nav]');if(d)return d.getAttribute('data-nav');const h=c.querySelector('h2')||c.querySelector('h3');let s=h?h.textContent:'';
  const t=c.querySelector('[role="tab"][aria-selected="true"],.shop-tab.on,.f-tab.on');if(t)s+='|'+t.textContent;const p=c.querySelector('p');if(p)s+='|'+p.textContent.slice(0,60);   // абзац: шаги сюжета с тем же заголовком — разные окна (сверху)
  return s.replace(/[0-9\s.,:+\u2212%()₽-]+/g,'').slice(0,140);}
function mNest(c){const n={};try{const all=c.querySelectorAll('*');for(let i=0;i<all.length;i++){const e=all[i];if(e.scrollTop||e.scrollLeft){const sel=e.id?'#'+e.id:e.classList.length?'.'+e.classList[0]:'';if(!sel)continue;const l=c.querySelectorAll(sel);let j=0;while(j<l.length&&l[j]!==e)j++;n[sel+'|'+j]=[e.scrollLeft,e.scrollTop];}}}catch(e){}return n;}
function mKeep(){const m=$('modal'),c=$('mcard'),e=mNav[mNav.length-1];if(!e||!c)return;e.y=c.scrollTop;e.my=m?m.scrollTop:0;e.n=mNest(c);}
function mPlace(m,c){const s=mSig(c);let i=-1;if(s)for(let j=mNav.length-1;j>=0;j--)if(mNav[j].s===s){i=j;break;}
  if(i<0){mNav.push({s,y:0,my:0,n:{}});if(mNav.length>20)mNav.shift();c.scrollTop=0;m.scrollTop=0;return;}
  const e=mNav[i];mNav.length=i+1;scrollPin(c,e.y);if(e.my)scrollPin(m,e.my);else m.scrollTop=0;
  for(const k in e.n){const p=k.split('|'),x=c.querySelectorAll(p[0])[+p[1]];if(x){x.scrollLeft=e.n[k][0];x.scrollTop=e.n[k][1];}}}
function hideModal(){if(modalOn){try{mKeep();}catch(e){}mNavT=Date.now();}const m=$('modal');if(m)m.classList.remove('on');modalOn=false;modalHold=false;document.body.classList.remove('mon');mCloseT=Date.now();modalRe=null;YG.start();setTimeout(()=>toastNext(1),400);
  try{const c=$('mcard');if(c)c.style.transform='';if(mFocus&&document.contains(mFocus)&&mFocus.focus)mFocus.focus({preventScroll:true});}catch(e){}mFocus=null;}
function modal(html,o){if(RD.off===Infinity&&Date.now()-tapT<700)RD.off=0;   // M46: игрок сам открыл окно — «читаю» снова можно
  PAY.re=null;modalRe=null;const m=$('modal'),c=$('mcard');if(!m||!c)return;const was=modalOn;
  if(!was)modalHold=false;if(o&&o.hold){if(!modalHold)mHoldT=Date.now();modalHold=true;}   /* M47 */if(!was)mFocus=document.activeElement;
  try{if(was)mKeep();else if(Date.now()-mNavT>600)mNav=[];}catch(e){mNav=[];}
  c.innerHTML=html;c.style.transform='';m.classList.add('on');m.classList.toggle('re',was);modalOn=true;document.body.classList.add('mon');try{mPlace(m,c);}catch(e){c.scrollTop=0;m.scrollTop=0;}YG.stop();
  try{c.setAttribute('role','dialog');c.setAttribute('aria-modal','true');const h=c.querySelector('h2');if(h){if(!h.id)h.id='mTitle';c.setAttribute('aria-labelledby',h.id);}else c.removeAttribute('aria-labelledby');c.tabIndex=-1;c.focus({preventScroll:true});}catch(e){}}
function nowMs(){try{if(ysdk&&ysdk.serverTime){const t=ysdk.serverTime();if(typeof t==='number'&&t>1.6e12)return t;}}catch(e){}return Date.now();}

/* ================= язык: смена на лету ================= */
const I18N_DATA=[Object.values(PAY_ITEMS)];
function applyLang(){document.documentElement.lang=LANG;document.title=L('Из ларька в магнаты: бизнес','From Kiosk to Tycoon: Business Sim');
  document.querySelectorAll('[data-en]').forEach(e=>{if(e.dataset.ru==null)e.dataset.ru=e.innerHTML;e.innerHTML=LANG==='en'?e.dataset.en:e.dataset.ru;});
  document.querySelectorAll('[data-en-aria]').forEach(e=>{if(e.dataset.ruAria==null)e.dataset.ruAria=e.getAttribute('aria-label')||'';e.setAttribute('aria-label',LANG==='en'?e.dataset.enAria:e.dataset.ruAria);});
  // en-поля накладываются на name/desc/done; русский оригинал — в поле ru
  for(const arr of I18N_DATA)for(const o of arr){if(!o.en)continue;if(!o.ru){o.ru={};for(const k in o.en)o.ru[k]=o[k];}const src=LANG==='en'?o.en:o.ru;for(const k in src)o[k]=src[k];}}
function setLang(l){l=normLang(l);if(IS_VK)l='ru';if(l===LANG)return;LANG=l;applyLang();
  const t=$('toast');if(t)t.classList.remove('on');
  try{window.uiRefresh&&window.uiRefresh();}catch(e){setTimeout(()=>{throw e;});}
  if(modalOn&&modalRe)modalRe();}

/* ================= настройки, покупки, «Об игре» ================= */
/* M47d: код переноса. Было: base64(JSON) целиком → правка «в блокноте» давала любые 💎 и покупки (аудит-4 №3).
   Теперь код «MG2.<подпись>.<base64>» (подпись — хеш с солью, svSig); старый код (просто base64) тоже принимаем.
   Из кода берём мир и прогресс; покупки (buy/buyB/payT/payV, путёвка psG/psT) — никогда: они придут с площадки (PAY.restore/payMerge);
   💎 — только с подписанного кода и только на «новое» устройство (svFresh: здесь ещё не загружали код, не начинали заново, нет прошлых холдингов, мир < 60 дней) — max(здесь, в коде);
   иначе 💎 остаются как на этом устройстве. Счётчики роликов/подарков дня — как на этом устройстве. Неподписанный код: только мир (+ то, что едет с миром) —
   звания, наборы, вещи, украшения, улучшения за 💎 — здешние, а награды за то, что в мире уже достигнуто, при первой проверке не платятся (S.svQ → game.js checkAch). */
const SV_PRE='MG2.';
function svSig(b){let h1=0x6d47a3c1,h2=0x1b873593;const s='магнат·M47d·'+b.length+'·'+b;   // соль + длина + сам код
  for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return (h2>>>0).toString(36)+'x'+(h1>>>0).toString(36);}
function svMake(){try{const b=btoa(unescape(encodeURIComponent(JSON.stringify(sOut()))));return SV_PRE+svSig(b)+'.'+b;}catch(e){return '';}}
// разобрать код → {d, sig:true|false} или null (подпись не сошлась / мусор)
function svRead(t){t=String(t||'').replace(/\s+/g,'');let b=t,sig=false;
  if(t.indexOf(SV_PRE)===0){const i=t.indexOf('.',SV_PRE.length);if(i<0)return null;b=t.slice(i+1);if(svSig(b)!==t.slice(SV_PRE.length,i))return null;sig=true;}
  let d=null;try{d=wIn(JSON.parse(decodeURIComponent(escape(atob(b)))));}catch(e){return null;}
  return isObj(d)&&isObj(d.w)&&d.w.v===1?{d,sig}:null;}
function svFresh(){return !(S.svIn>0)&&!(S.rst>0)&&!(Array.isArray(S.fame)&&S.fame.length)&&!(isObj(S.w)&&(S.w.t|0)>=60);}
// собрать новое сохранение: L — здешнее (S), d — из кода
function svApply(L,d,sig){const N=sig?Object.assign({},d):Object.assign({},L);
  if(!sig){N.w=d.w;for(const f of ['wk','lastT','offMore','freeM','ph','adD','gift','fame','tut','rst'])if(f in d)N[f]=d[f];   // то, что едет с миром (как в mergeSave)
    N.rst=Math.max(L.rst|0,d.rst|0);}
  // 💎: подписанный код на новом устройстве — больше из двух; иначе — здешние
  const lc=typeof L.cr==='number'&&isFinite(L.cr)?L.cr:0,dc=typeof d.cr==='number'&&isFinite(d.cr)?Math.max(0,Math.floor(d.cr)):0;
  N.cr=sig&&svFresh()?Math.max(lc,dc):lc;
  // покупки и всё, что даёт 💎/подарок по счётчику дня, — только здешнее
  for(const f of ['buy','buyB','payT','payV','psG','psT','adCr','adR','adF','adT','quest','pl','plW','wkR','rkX2','rkX2d','rwNew','svIn','st0','sound','vib','calm','lang','th','readP','soc','stc'])
    if(f in L)N[f]=L[f];else delete N[f];
  // «за что уже дали» — объединение (лишнее только мешает получить 💎 ещё раз); звания и счётчики — не ниже здешних
  N.crE=Object.assign({},isObj(d.crE)?d.crE:{},isObj(L.crE)?L.crE:{});
  for(const f of ['rk','rkG','adTot','udN'])if(typeof L[f]==='number'||typeof N[f]==='number')N[f]=Math.max(L[f]|0,sig?N[f]|0:0);
  if(!sig)N.svQ=1;else delete N.svQ;   // неподписанный: награды за уже достигнутое в мире — без 💎 (game.js)
  N.svIn=nowMs();return N;}
function openSave(){const code=svMake();
  modal(`<h2>💾 ${L('Сохранение','Save')}</h2><p class="about">${L('Игра сохраняется сама на этом устройстве'+(PLAT==='apk'?'':' и в облаке площадки')+'. Чтобы перенести холдинг на другое устройство — скопируйте код и вставьте его там.','The game saves itself on this device'+(PLAT==='apk'?'':' and in the platform cloud')+'. To move your holding to another device, copy the code and paste it there.')}</p>
    <textarea id="svCode" rows="4" style="width:100%;font-size:14px;border-radius:12px;padding:8px" readonly>${code}</textarea>
    <div class="row"><button class="btn noenter" id="svCopy">📋 ${L('Скопировать','Copy')}</button></div>
    <p class="about">${L('Загрузить сохранение (текущий холдинг будет заменён):','Load a save (your current holding will be replaced):')}</p>
    <textarea id="svIn" rows="3" style="width:100%;font-size:14px;border-radius:12px;padding:8px" placeholder="${L('вставьте код','paste the code')}"></textarea>
    <div class="row"><button class="btn noenter" id="svLoad">⬆️ ${L('Загрузить','Load')}</button><button class="btn" id="svBack" data-esc>${L('← Назад','← Back')}</button></div>`);
  $('svCopy').onclick=()=>{const t=$('svCode');t.select();try{navigator.clipboard?navigator.clipboard.writeText(t.value).then(()=>toast(L('Код скопирован','Code copied'))):document.execCommand('copy');}catch(e){}};
  $('svLoad').onclick=()=>{const r=svRead($('svIn').value);   // M47d: подпись, мир и прогресс — без 💎 и покупок из кода
    if(!r){toast(L('Код не подходит — проверьте, что скопирован целиком','The code doesn’t fit — make sure it was copied in full'));return;}
    const d=svApply(S,r.d,r.sig);try{STAT.ev('svin',{s:r.sig?1:0,c:(d.cr|0)-(S.cr|0)});}catch(e){}
    S=d;fixSave();S.ts=nowMs();try{localStorage.setItem(SKEY,JSON.stringify(sOut()));}catch(e){}cloudFlush();
    // до перезагрузки игра не должна перезаписать загруженное (game.js при уходе со страницы кладёт в S.w старый мир и сохраняет)
    const keep=JSON.stringify(sOut());save=function(){try{localStorage.setItem(SKEY,keep);}catch(e){}};cloudReady=false;location.reload();};
  $('svBack').onclick=openSettings;}
// «Начать игру заново»: два шага — предупреждение, потом удержание красной кнопки 2 с. Копия сейва — в резерв; 💎 и покупки остаются
function openReset(){
  modal(`<h2>🔄 ${L('Начать игру заново?','Start the game over?')}</h2><p class="about">${L('Весь прогресс холдинга будет удалён: деньги, объекты, участки, отчёты. Кристаллы и покупки сохранятся. Копию нынешней игры я отложу в резерв.','All holding progress will be deleted: money, facilities, plots, reports. Crystals and purchases are kept. A copy of the current game will be put aside as a backup.')}</p>
    <div class="row"><button class="btn noenter" id="rsNext" style="background:var(--bad);color:#fff">${L('Да, начать заново','Yes, start over')}</button><button class="btn" id="rsNo" data-esc>${L('Отмена','Cancel')}</button></div>`);
  $('rsNo').onclick=openSettings;$('rsNext').onclick=openReset2;}
function openReset2(){const bizOk=!!(window.ECON&&ECON.bizInit);
  const go=mode=>`<button class="btn noenter rsHold" data-m="${mode}" style="background:var(--bad);color:#fff;position:relative;overflow:hidden"><span style="position:relative">${mode==='rags'?L('🧺 С нуля — подработка','🧺 From zero — side jobs'):mode==='nedra'?L('⛏ Сразу недра','⛏ Straight to mining'):L('Удалить и начать','Delete and start')}</span><i class="rsBar" style="position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(255,255,255,.3)"></i></button>`;
  modal(`<h2>${L('Точно?','Are you sure?')}</h2><p class="about">${L('Нажмите и держите кнопку 2 секунды — так случайно не сбросить.','Press and hold the button for 2 seconds so it can’t happen by accident.')}</p>
    <div class="row">${bizOk?go('rags')+go('nedra'):go('')}</div><div class="row"><button class="btn" id="rsNo2" data-esc>${L('Отмена','Cancel')}</button></div>`);
  $('rsNo2').onclick=openSettings;
  document.querySelectorAll('#mcard .rsHold').forEach(b=>{let t0=0,raf=0;const bar=b.querySelector('.rsBar');
    const stop=()=>{t0=0;cancelAnimationFrame(raf);bar.style.width='0';};
    const step=()=>{if(!t0)return;const k=(Date.now()-t0)/2000;bar.style.width=Math.min(100,k*100)+'%';if(k>=1){t0=0;hideModal();GAME.reset(b.dataset.m||'');toast(L('Новая игра началась','A new game has started'));return;}raf=requestAnimationFrame(step);};
    b.addEventListener('pointerdown',e=>{e.preventDefault();t0=Date.now();step();});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,stop));
    b.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!t0){t0=Date.now();step();}});b.addEventListener('keyup',stop);});}
// сюжет «с нуля» (пролог, имя героя) — пункты в ⚙ только если он есть
const storyOn=()=>!!(window.STORYUI&&window.GAME&&GAME.W&&GAME.W.fr&&GAME.W.fr.rags);
function openSettings(){const on=v=>v?'<i>'+L('вкл','on')+'</i>':'<i class="off">'+L('выкл','off')+'</i>';
  modal(`<h2>${L('Настройки','Settings')}</h2>
    <button class="set" id="stBig"><span>🔠 ${L('Крупный шрифт','Large text')}<br><small>${L('весь текст и кнопки крупнее','all text and buttons bigger')}</small></span><i${(S.bigF|0)?'':' class="off"'}>${[L('обычный','normal'),L('крупнее','larger'),L('ещё крупнее','largest')][S.bigF|0]}</i></button>
    ${BETA?`<button class="set" id="stFb"><span>✉️ ${L('Написать отзыв','Send feedback')}<br><small>${L('тестовая версия — нам важно ваше мнение','test version — your opinion matters')}</small></span><i class="go">›</i></button>`:''}
    <button class="set" id="stSnd"><span>🔊 ${L('Звук','Sound')}</span>${on(S.sound!==false)}</button>
    ${window.MUSIC?MUSIC.setHtml(on):''}<!-- M47e: 🎵 Музыка (js/music.js) -->
    <button class="set" id="stVib"><span>📳 ${L('Вибрация','Vibration')}</span>${on(S.vib!==false)}</button>
    <button class="set" id="stCalm"><span>🌿 ${L('Спокойный режим','Calm mode')}<br><small>${L('меньше анимации и движения','less animation and motion')}</small></span>${on(calm())}</button>
    <button class="set" id="stReadP"><span>⏸ ${L('Пауза, пока листаю','Pause while I scroll')}<br><small>${L('время стоит, пока вы долго читаете экран','time stops while you read a long screen')}</small></span>${on(S.readP===true)}</button>
    <button class="set" id="stNoIco"><span>🔤 ${L('Без значков','No icons')}<br><small>${L('слова вместо значков: «силы 60» вместо «⚡ 60»','words instead of icons: “energy 60” instead of “⚡ 60”')}</small></span>${on(!!S.noIco)}</button>
    ${IS_VK?'':`<button class="set" id="stLang"><span>🌐 Язык / Language</span><i>${LANG==='en'?'EN':'RU'}</i></button>`}
    ${window.THEME?`<button class="set" id="stTheme"><span>🎨 ${L('Оформление','Themes')}<br><small>${L('сейчас: ','now: ')}${(THEME.list().filter(t=>t.cur)[0]||{name:''}).name}</small></span><i class="go">›</i></button>`:''}
    ${PAY.on?payHtml(['no_ads'],false):''}<button class="set" id="stShop"><span>🛒 ${L('Магазин','Shop')}<br><small>${PAY.on?L('кристаллы, наборы, оформление, награды','crystals, bundles, looks, rewards'):L('кристаллы, оформление, награды','crystals, looks, rewards')}</small></span><i class="go">›</i></button>
    ${storyOn()&&STORYUI.openHero?`<button class="set" id="stHero"><span>👤 ${L('Как меня зовут','My name')}<br><small>${L('имя и пол героя','hero’s name and gender')}</small></span><i class="go">›</i></button>`:''}
    ${storyOn()&&STORYUI.prologue?`<button class="set" id="stPro"><span>📖 ${L('Вспомнить пролог','Replay the prologue')}<br><small>${L('встреча 11 «Б» и пари','the Class 11B reunion and the bet')}</small></span><i class="go">›</i></button>`:''}
    ${STAT.available()?`<button class="set" id="stStat"><span>${L('📊 Анонимная статистика','📊 Anonymous statistics')}<br><small>${STAT.note()}</small></span>${on(STAT.enabled())}</button>`:''}
    ${SOC.ok()?`<button class="set" id="stSoc"><span>👥 ${L('Друзья и игры','Friends and games')}<br><small>${L('позвать, поделиться, ещё игры','invite, share, more games')}</small></span><i class="go">›</i></button>`:''}
    <button class="set" id="stSave"><span>💾 ${L('Сохранение','Save')}<br><small>${L('перенести на другое устройство','move to another device')}</small></span><i class="go">›</i></button>
    ${window.GAME&&GAME.reset?`<button class="set noenter" id="stReset"><span>🔄 ${L('Начать игру заново','Start the game over')}<br><small>${L('кристаллы и покупки сохранятся','crystals and purchases are kept')}</small></span><i class="go">›</i></button>`:''}
    ${window.UI&&UI.restartTut?`<button class="set" id="stTut"><span>🎓 ${L('Обучение заново','Restart tutorial')}<br><small>${L('подсказки главбуха с первого шага','the accountant’s tips from step one')}</small></span><i class="go">›</i></button>`:''}
    <button class="set noenter" id="stHow"><span>❓ ${L('Как играть','How to play')}<br><small>${L('правила, главы, словарик','rules, chapters, glossary')}</small></span><i class="go">›</i></button>
    <button class="set noenter" id="stAbout"><span>ℹ️ ${L('Об игре','About')}</span><i class="go">›</i></button>
    <div class="row"><button class="btn green" id="stClose">${L('Готово','Done')}</button></div>`);   // M41: внизу окна — одна кнопка (при крупном шрифте три кнопки закрывали полэкрана)
  modalRe=openSettings;
  $('stSnd').onclick=()=>{S.sound=S.sound===false;save();if(S.sound){unlockAudio();SND.tap();}openSettings();};
  if(window.MUSIC)MUSIC.bind(openSettings);   // M47e
  $('stVib').onclick=()=>{S.vib=S.vib===false;save();try{if(S.vib&&navigator.vibrate)navigator.vibrate(40);}catch(e){}openSettings();};
  $('stBig').onclick=()=>{S.bigF=((S.bigF|0)+1)%3;save();applyA11y();openSettings();};
  $('stReadP').onclick=()=>{S.readP=S.readP!==true;save();if(!S.readP)rdOff();openSettings();};   // M46; M47: по умолчанию выкл.
  $('stNoIco').onclick=()=>{S.noIco=!S.noIco;save();applyA11y();try{window.uiRefresh&&window.uiRefresh();}catch(e){}openSettings();};
  $('stCalm').onclick=()=>{if(RM){toast(L('Включено в настройках телефона («уменьшить движение»)','Turned on in your device settings (“reduce motion”)'));return;}S.calm=!S.calm;save();applyCalm();openSettings();};
  if($('stLang'))$('stLang').onclick=()=>{const l=LANG==='en'?'ru':'en';LANG_MAN=l;try{localStorage.setItem(LANG_KEY,l);}catch(e){}setLang(l);};
  if($('stTheme'))$('stTheme').onclick=()=>{SND.tap();THEME.open(openSettings);};
  if($('stShop'))$('stShop').onclick=()=>{SND.tap();openShop('',{from:'set'});};
  PAY.re=openSettings;if(PAY.on)PAY.bind($('mcard'));
  if($('stTut'))$('stTut').onclick=()=>{hideModal();UI.restartTut();};
  if($('stHero'))$('stHero').onclick=()=>{SND.tap();hideModal();STORYUI.openHero(()=>setTimeout(openSettings,60));};
  if($('stPro'))$('stPro').onclick=()=>{SND.tap();hideModal();STORYUI.prologue(null,{replay:1});};
  $('stHow').onclick=()=>{if(window.UI&&UI.openHow)UI.openHow();};
  if($('stReset'))$('stReset').onclick=openReset;
  if($('stFb'))$('stFb').onclick=()=>{SND.tap();try{STAT.ev&&STAT.ev('fb',{});}catch(e){}try{window.open(FB_URL,'_blank');}catch(e){location.href=FB_URL;}};
  $('stAbout').onclick=openAbout;if($('stSave'))$('stSave').onclick=openSave;$('stClose').onclick=hideModal;
  if($('stStat'))$('stStat').onclick=()=>{STAT.setEnabled(!STAT.enabled());SND.tap();openSettings();}; // по умолчанию вкл.; строки нет, пока у модуля нет адреса приёмника
  if($('stSoc'))$('stSoc').onclick=()=>{SND.tap();STAT.ev('mod',{m:'soc',a:'open'});openSocial();};STAT.screen('settings');}
// «Друзья и игры» (модуль SOC, только VK с мостом): позвать, поделиться, избранное, экран телефона, сообщество, ещё игры. Наград нет (п. 2.6.2)
function openSocial(){if(!SOC.ok()){openSettings();return;}STAT.screen('social');
  modal(`<h2>👥 ${L('Друзья и игры','Friends and games')}</h2>${SOC.settingsHtml()}<div class="row"><button class="btn" id="socBack" data-esc>${L('← Назад','← Back')}</button></div>`);
  modalRe=openSocial;SOC.bind($('mcard'),openSocial);$('socBack').onclick=openSettings;socStat();}
// нажатия соц-кнопок и плиток «Ещё игры» — в статистику (после SOC.bind: модуль ставит свой onclick, мы — addEventListener)
function socStat(){const mc=$('mcard');if(!mc)return;mc.querySelectorAll('[data-soc],[data-g]').forEach(b=>b.addEventListener('click',()=>{const k=b.getAttribute('data-soc');
  STAT.ev('mod',{m:'soc',a:k?k:'app'});if(k==='more')setTimeout(socStat,50);}));}
// «🎲 Ещё игры во дворе» на «Сегодня» и на карте: кнопку рисует интерфейс (атрибут data-socmore, скрыта без SOC.ok()), нажатие ловим здесь
function socMoreHtml(){return SOC.ok()?`<button class="btn w noenter socmore" data-socmore="1" style="margin-top:14px">🎲 ${L('Ещё игры во дворе','More yard games')}</button>`:'';}
function socMoreUpd(){try{window.uiRefresh&&window.uiRefresh();}catch(e){}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-socmore]'):null;if(!b||!SOC.ok())return;
  SND.tap();STAT.ev('mod',{m:'soc',a:'more'});SOC.showMore();socStat();});
/* «📤 Похвастаться» (спец. SOC, «окно рекорда»): маленькая кнопка в окнах больших моментов — новая глава (small = первая точка), IPO, звание «Магнат».
   Только VK с мостом (SOC.ok), жмёт сам игрок, без наград (п. 2.6.2) и без всплывающих окон — поэтому не входит в «одно предложение за сессию».
   VK всегда по-русски: текст — только русский (параметр text VK берёт лишь на телефоне), ссылка — на игру; в Яндексе пусто */
const SOC_BRAG={small:'Первая точка открыта — теперь у меня своё дело! Играю в «Из ларька в магнаты»',
  mid:'Новая глава: у меня своя сеть и ООО! Играю в «Из ларька в магнаты»',quarry:'Новая глава: свой карьер! Играю в «Из ларька в магнаты»',
  nedra:'Новая глава: выхожу в недра! Играю в «Из ларька в магнаты»',ipo:'Мой холдинг вышел на биржу — IPO! Играю в «Из ларька в магнаты»',
  rank:'Мне присвоено звание «Магнат»! Играю в «Из ларька в магнаты»'};
// не .row: последний .row окна на телефоне — липкий низ с главной кнопкой (theme.css), поэтому строку ставим ПЕРЕД ним
function socBragHtml(k){return SOC.ok()&&SOC_BRAG[k]?`<div class="socbrag" style="margin:12px 0 0;text-align:center"><button class="btn noenter" data-socbrag="${k}">📤 ${L('Похвастаться друзьям','Tell your friends')}</button></div>`:'';}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-socbrag]'):null;if(!b||!SOC.ok()||!VK)return;
  const k=b.getAttribute('data-socbrag'),q=new URLSearchParams(location.search),app=+q.get('vk_app_id')||54794426,mob=/^mobile_/.test(q.get('vk_platform')||'');
  const p={link:'https://vk.com/app'+app};if(mob&&SOC_BRAG[k])p.text=SOC_BRAG[k];
  SND.tap();STAT.ev('mod',{m:'soc',a:'brag',k});vkSend('VKWebAppShare',p,60000).catch(()=>{});});
// «Кристаллы и покупки»: что такое 💎, товары PAY (если платежи есть) и «+3 💎 за рекламу»
function openShop(){const lb=adOk()&&window.GAME&&GAME.ladLabel?GAME.ladLabel():'',ad=!!lb,x=ad?GAME.lad():null;   // «Ролики дня» — лесенка 2/3/3/4/6 💎 (game.js, QUEST)
  const ids=PAY.list.map(x=>x.id).filter(id=>id!=='sponsor'||adPlat()); // спонсор без роликов бесполезен — без рекламы на площадке не продаём
  modal(`<h2>${L('Кристаллы','Crystals')} 💎</h2><p>${L('У вас','You have')} <b>${crTxt(S.cr)}</b>. ${L('Кристаллы дают за достижения, годы работы, IPO и рекламу. Они немного ускоряют стройку и разведку — это чуть сказывается и на рейтинге недели, но само место в рейтинге не продаётся.','You get crystals for achievements, years in business, IPO and ads. They speed up construction and exploration a little — which slightly shows in the weekly leaderboard too, but a place in it isn’t sold.')}</p>
    ${PAY.on?payHtml(ids):''}
    <div class="row">${ad?`<button class="btn accent noenter" id="shAd">${lb}</button>`:''}${window.META&&typeof META.openCos==='function'?`<button class="btn noenter" id="shCos">🎨 ${L('Украшения','Decorations')}</button>`:''}<button class="btn" id="shClose">${L('Закрыть','Close')}</button></div>
    ${!ad&&adOk()&&window.GAME&&GAME.lad&&GAME.lad().n>=GAME.LAD.length?'<p style="text-align:center"><small>'+L('«Ролики дня» на сегодня пройдены — завтра лесенка начнётся заново','Today’s daily videos are done — the ladder starts again tomorrow')+'</small></p>':''}${adDayHtml()}`);
  modalRe=openShop;PAY.re=openShop;if(PAY.on)PAY.bind($('mcard')); // PAY.re и без PAY.on: каталог/мост пришёл, пока окно открыто, — перерисуем с покупками
  if($('shAd'))$('shAd').onclick=()=>{if(adHold())return;hideModal();GAME.ladWatch();};
  if($('shCos'))$('shCos').onclick=()=>{try{META.openCos();}catch(e){console.error(e);}};
  $('shClose').onclick=hideModal;}
function openAbout(){
  modal(`<h2>${L('Об игре','About')}</h2>
    <p class="about">${L('«Из ларька в магнаты: бизнес» — экономическая стратегия «из грязи в князи»: от подработки и первого ларька — к сети, карьеру, горнорудному холдингу и IPO. Точки и сети, торги за лицензии, заводы и железная дорога, рынок, кредиты, недвижимость, друзья из 11 «Б» и отчёты главбуха.','“From Kiosk to Tycoon: Business Sim” is a rags-to-riches economic strategy: from side jobs and your first kiosk to a chain, a quarry, a mining holding and an IPO. Shops and chains, licence auctions, plants and railways, the market, loans, real estate, school friends and your chief accountant’s reports.')}</p>
    <p class="about">${L('Все компании, персонажи и события вымышлены, совпадения случайны. Соперники — боты игры, а не живые игроки.','All companies, characters and events are fictional; any resemblance is coincidental. Rivals are game bots, not real players.')}</p>
    <p class="about">${L('В игре нет ставок и азарта. Рубли в игре — только игровые: их нельзя купить, вывести или передать. Кристаллы 💎 немного ускоряют дела (это чуть сказывается и на рейтинге недели), но само место в рейтинге не продаётся.','There is no betting or gambling. In-game rubles are play money only: they can’t be bought, withdrawn or transferred. Crystals 💎 speed things up a little (which slightly shows in the weekly leaderboard), but a place in it isn’t sold.')}</p>
    ${window.MUSIC?MUSIC.aboutHtml():''}<!-- M47e: подпись CC BY треков — не удалять -->
    ${PLAT==='vk'?'<p class="about"><b>Благодарности.</b> VK Bridge — © V Kontakte, LLC, лицензия MIT.</p>':''}
    <p class="about">${L('Цены товаров близки к рынку России 2026 года, а мощности, стоимость и сроки стройки заводов упрощены под игру: время сжато, месяц идёт несколько минут.','Commodity prices are close to the Russian market of 2026, while plant capacities, construction costs and times are simplified for the game: time is compressed, a month lasts a few minutes.')}</p>
    <p class="about">${L('На компьютере: Esc — закрыть окно, Enter — главная кнопка окна.','On a computer: Esc closes a window, Enter presses its main button.')}</p>
    <div class="row">${PAY.on?`<button class="btn noenter" id="abPay">${L('↻ Восстановить покупки','↻ Restore purchases')}</button>`:''}<button class="btn" id="abBack">${L('← Назад','← Back')}</button></div>`);
  modalRe=openAbout;
  if($('abPay'))$('abPay').onclick=()=>PAY.again();
  $('abBack').onclick=openSettings;}
function applyCalm(){if(document.body)document.body.classList.toggle('calm',calm());}
// M38 (a45): «Крупный шрифт» — масштаб всего #app (zoom 1,12 / 1,24: весь текст и кнопки на 2 и 4 ступени крупнее, вёрстка переносится как на узком экране);
// старые WebView со «старым» zoom растягивают высоту — тогда высоту #app делим на масштаб. «Без значков» — body.noico (icons.js: слово вместо значка у чисел)
const BIG_Z=[1,1.12,1.24];
// M41: кнопка «🔠 Крупный текст» для пролога и «Как играть» (data-bigf; нажатие — следующая ступень, fn — перерисовать окно)
const BIGN=()=>[L('обычный','normal'),L('крупнее','larger'),L('ещё крупнее','largest')][S.bigF|0];
function bigBtnHtml(){return `<button class="btn w noenter" data-bigf="1" style="margin:4px 0 8px;min-height:48px">🔠 ${L('Крупный текст','Large text')}: <b>${BIGN()}</b> · ${L('нажмите','tap')}</button>`;}
function bigBtnBind(fn){document.querySelectorAll('#mcard [data-bigf]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();S.bigF=((S.bigF|0)+1)%3;save();applyA11y();try{SND.tap();}catch(x){}try{STAT.ev('mod',{m:'bigf',a:S.bigF|0});}catch(x){}if(fn)fn();});}
window.bigBtnHtml=bigBtnHtml;window.bigBtnBind=bigBtnBind;
function applyA11y(){const a=$('app'),z=BIG_Z[S.bigF|0]||1;try{$('crBtn').setAttribute('data-w',L('кристаллы','crystals'));}catch(e){}   // M41: «Без значков» — подпись к 💎 в шапке
  document.documentElement.classList.toggle('bigf',z>1);if(document.body)document.body.classList.toggle('noico',!!S.noIco);
  if(!a)return;a.style.zoom=z>1?String(z):'';a.style.height='';const hc=$('hCash');if(hc)hc.textContent='';   // шапка заново подгонит сумму под новую ширину
  if(z>1)try{requestAnimationFrame(()=>{const r=a.getBoundingClientRect();if(r.height>window.innerHeight+4)a.style.height=(100/z).toFixed(3)+'%';});}catch(e){}
  try{requestAnimationFrame(()=>{if(window.UI&&UI.hdr)UI.hdr();});}catch(e){}}   // M41: сумму в шапке подогнать сразу (раньше — только на следующем дне)

/* ---- клавиатура на ПК: только окна (остальное — интерфейс) ---- */
document.addEventListener('keydown',e=>{const k=e.key;if(!modalOn||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const ad=$('ad');if(ad&&ad.classList.contains('on'))return;const mc=$('mcard');if(!mc)return;
  if(k==='Escape'){const b=mc.querySelector('[data-esc]')||['socClose','socBack','mCancel','lbClose','shClose','stClose','abBack','hBack','hClose'].map($).find(x=>x&&mc.contains(x));if(b){e.preventDefault();b.click();}}
  else if((k==='Enter'||k===' ')&&!(document.activeElement&&/^(TEXTAREA|INPUT)$/.test(document.activeElement.tagName))&&!(document.activeElement&&document.activeElement.tagName==='BUTTON'&&mc.contains(document.activeElement))){
    const b=mc.querySelector('.btn:not([disabled]):not(.x2):not(.buy):not(.noenter)');if(b){e.preventDefault();b.click();}}});

/* ---- ярлык, оценка, избранное: одно предложение за сессию, после 2-го закрытия месяца и не раньше 2 минут; отказ запоминаем.
   Зовёт интерфейс после окна закрытия месяца (каждый вызов = одно закрытие) ---- */
const BOOT_T=Date.now();let askedNow=false,sessCloses=0;
async function offerReturn(){if(askedNow||window.__demo)return;sessCloses++;
  const ad=$('ad');if(sessCloses<2||Date.now()-BOOT_T<120000||adBusy||(ad&&ad.classList.contains('on'))||pauseWhy.size)return;
  const now=Date.now(),due=(k,d)=>!S.ask[k]||now-S.ask[k]>d*864e5,mark=k=>{askedNow=true;S.ask[k]=now;save();};
  try{
    if(PLAT==='yandex'&&ysdk){
      if(due('review',30)&&ysdk.feedback){const c=await ysdk.feedback.canReview();if(c&&c.value){mark('review');await ysdk.feedback.requestReview();return;}}
      if(due('shortcut',14)&&ysdk.shortcut){const c=await ysdk.shortcut.canShowPrompt();if(c&&c.canShow){mark('shortcut');await ysdk.shortcut.showPrompt();return;}}}
    // VK: сам ничего не зовём — одно предложение за сессию рисует socOffer() строкой в окне «Закрытие месяца» (п. 2.6.3)
  }catch(e){}}
/* VK: одно само-предложение за сессию (модуль SOC: не в первую сессию, не раньше 2 минут, отказ — не раньше 30 дней, ≤3 раз, согласие — никогда больше; без наград).
   Зовёт интерфейс сразу после показа окна «Закрытие месяца»; строка и кнопка — над рядом кнопок окна (он на телефоне — липкий низ; ставим в том же кадре, до отрисовки), диалог VK — только по нажатию.
   busy — следом межэкранная; ещё не предлагаем в первом закрытии месяца за сессию и сразу после рекламы */
let socCloses=0;
function socOffer(busy){if(PLAT!=='vk'||!SOC.ok()||window.__demo)return;socCloses++;
  const mc=$('mcard'),rows=mc?mc.querySelectorAll('.row'):[],row=rows.length?rows[rows.length-1]:null;if(!row||mc.querySelector('.soc-o'))return;
  const ad=$('ad');if(socCloses<2||adBusy||(ad&&ad.classList.contains('on')))return;
  const o=SOC.offer(Math.floor(((S.w&&S.w.t)||0)/30),!!busy||Date.now()-lastAdT<60000||pauseWhy.size>0);if(!o)return;
  const d=document.createElement('div');d.className='soc-o';d.style.cssText='margin-top:12px;text-align:center;font-size:17px';
  d.innerHTML='<p style="margin:0 0 8px">'+o.t+'</p><button class="btn noenter" id="mSoc">'+o.b+'</button>';
  row.parentNode.insertBefore(d,row);STAT.ev('mod',{m:'soc',a:'of_'+o.k});
  const b=$('mSoc');b.onclick=()=>{b.disabled=true;SND.tap();STAT.ev('mod',{m:'soc',a:'ok_'+o.k});o.run();};}

/* ================= запуск ================= */
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden){setPause('hide',true);cloudFlush();}else setPause('hide',false);});
window.addEventListener('pagehide',()=>{cloudFlush();});
if(document.hidden)setPause('hide',true);
applyLang();applyCalm();applyOffice();try{applyA11y();}catch(e){}
// «Назад» Android: в окне — кнопка «←» (шаг назад, M37), иначе закрыть окно; без окна — шаг назад в интерфейсе (обёртка шлёт событие backbutton или зовёт window.__back())
function goBack(){const ad=$('ad');if(ad&&ad.classList.contains('on'))return true;
  if(modalOn){const mc=$('mcard'),b=mc&&(Array.prototype.find.call(mc.querySelectorAll('button'),x=>!x.disabled&&x.offsetParent!==null&&/^\s*←/.test(x.textContent||''))||mc.querySelector('[data-esc]')||['socClose','socBack','mCancel','lbClose','shClose','stClose','abBack','hBack','hClose'].map($).find(x=>x&&mc.contains(x)));if(b)b.click();else hideModal();return true;}
  return !!(window.UI&&UI.back&&UI.back());}
window.__back=goBack;document.addEventListener('backbutton',e=>{e.preventDefault&&e.preventDefault();goBack();},false);
// SOC — после загрузки сохранения, до моста VK (считает сессии в S.soc); окна — через modal() игры
SOC.init(S,{save:()=>save(),toast:t=>toast(t),cls:'btn noenter',modal:h=>{modal(h);return $('mcard');},close:()=>hideModal()});
// покупки → статистика (модуль PAY не трогаем): попытка и итог; «ok» — площадка подтвердила и товар выдан (PAY.give)
// STAT v1.2: buy {i, r: try|ok|cancel|fail, v: цена в голосах из PAY_ITEMS (= hobby-pay/catalog.json)}; fail — ошибка моста/SDK, cancel — отказ игрока (раньше — 'no')
// M36: при «ok» ещё s — глава (1–5), d — реальный день игры, n — какая по счёту покупка, cr — 💎 до покупки; подарок за первую покупку (payFirst) — здесь же
{let payOk=null;const g0=PAY.give,b0=PAY.buy;PAY.give=function(id){payOk=id;return g0.apply(PAY,arguments);};
  PAY.buy=function(id){if(PAY.busy||!PAY.on)return b0.call(PAY,id);payOk=null;const c0=S.cr|0,first=!payPaid();
    const it=PAY_ITEMS[id],v=it&&it.vk||0;let why='';STAT.ev('buy',{i:id,r:'try',v});
    const cls=e=>{const d=e&&e.error_data||{},m=String(d.error_reason||d.error_msg||e&&e.message||e||'');return +d.error_code===4||/cancel|closed?|denied|abort|user/i.test(m)?'cancel':'fail';};
    const wrap=(o,k,okf)=>{if(!o||typeof o[k]!=='function')return null;const f=o[k];o[k]=function(){return Promise.resolve(f.apply(o,arguments)).then(r=>{if(okf&&!okf(r))why='cancel';return r;},e=>{why=cls(e);throw e;});};return ()=>{o[k]=f;};};
    const un=[wrap(PAY.v,'order',r=>r&&r.success),wrap(PAY.p,'purchase')];
    return Promise.resolve(b0.call(PAY,id)).then(r=>{const ok=payOk===id;un.forEach(u=>u&&u());
      if(ok){S.payN=(S.payN|0)+1;let s=0,d=0;try{s=GAME.stN();d=GAME.realDay();}catch(e){}STAT.ev('buy',{i:id,r:'ok',v,s,d,n:S.payN,cr:c0});
        if(first&&payFirst()){save();payFlush();updCr();setTimeout(()=>{try{SND.coin();}catch(e){}toast('🎁 '+L('Подарок за первую покупку: +'+FIRST_CR+' 💎 и рамка «Меценат». Спасибо!','First purchase gift: +'+FIRST_CR+' 💎 and the “Patron” frame. Thank you!'),4200);try{window.uiRefresh&&window.uiRefresh();}catch(e){}if(modalOn&&PAY.re)PAY.re();},3000);}}
      else STAT.ev('buy',{i:id,r:why||'cancel',v});return r;});};}
if(PLAT==='apk'){setTimeout(()=>{sdkReady();},0);}
else if(PLAT==='vk')initVK();
// M15 A8: на github.io и в бете SDK Яндекса нет — не грузим /sdk.js (иначе 404 и ошибка загрузки в STAT), сразу initSDK (без YaGames — заглушка: локальное сохранение, без рекламы площадки)
else if(BETA||/(^|\.)github\.io$/.test(location.hostname))setTimeout(()=>{initSDK();},0);
else (()=>{const s=document.createElement('script');s.src='/sdk.js';s.async=true;s.onload=s.onerror=()=>initSDK();document.head.appendChild(s);})();
window.__shell={mergeSave,vkSaveCloud,vkLoadCloud,cloudFlush,showRewarded,showInterstitial,PAY,LB,get S(){return S;},set S(v){S=v;},set VK(v){VK=v;},get VK(){return VK;}};

// бета: пометка «ТЕСТ» в углу (не мешает нажатиям) и одна подсказка за сессию, где оставить отзыв
if(BETA)try{const b=document.createElement('div');b.textContent=L('ТЕСТ','BETA');b.setAttribute('aria-hidden','true');
  b.style.cssText='position:fixed;left:0;bottom:0;z-index:9999;pointer-events:none;background:#c62828;color:#fff;font:700 11px/1 sans-serif;padding:3px 6px;border-top-right-radius:6px;opacity:.85';
  document.body.appendChild(b);
  let seen=false;try{seen=sessionStorage.getItem('mg-beta-tip')==='1';sessionStorage.setItem('mg-beta-tip','1');}catch(e){}
  if(!seen)setTimeout(()=>{try{toast('🧪 '+L('Тестовая версия. Отзыв — ⚙ → «Написать отзыв»','Test version. Feedback — ⚙ → “Send feedback”'),5000);}catch(e){}},9000);}catch(e){}
