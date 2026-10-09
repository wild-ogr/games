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
  dq:null,login:null,ret:{},diff:1,crown:{},bk:{},ach:{},wk:null,dch:null,dchN:0,skins:{},skin:{},deco:{},bns:{},bn:'',bnSet:0,goal:'',th:'',dst:{},dfc:{}};}
// поля-объекты могли прийти битыми (ручная правка, старая версия) — чиним
function fixSave(){for(const k of['stars','forge','village','seen','introSeen','lose','ret','crown','bk','ach','skins','skin','deco','bns'])if(!S[k]||typeof S[k]!=='object'||Array.isArray(S[k]))S[k]={};
  if(!S.afkT)S.afkT=Date.now();if(S.boost==null||isNaN(S.boost))S.boost=900;if(S.shake==null)S.shake=REDUCED?0:1;
  if(S.payT!=null&&!Array.isArray(S.payT))S.payT=[];if(S.payV!=null&&!Array.isArray(S.payV))S.payV=[];
  if(typeof S.th!=='string')S.th='';   // look1: выбранная тема оформления ('' — основная)
  if(typeof difFix==='function')difFix();   // OB:DIF звёзды режимов S.dst, выбор S.dfc, миграция корон (js/dif.js)
  if(typeof META_HK==='function')META_HK('FIX',S);}   // OB:META1 розетка меты: починка своих ключей модулей (при самой первой загрузке META_HK ещё нет — модуль чинит сам)
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
function save(){if(SHOT)return;hmk('save');S.ts=Date.now();try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}
  cloudDirty=true;if(!cloudLoaded||cloudPending||cloudT)return;
  cloudT=setTimeout(()=>{cloudT=0;cloudSave();},Math.max(3000,cloudLast+cloudGap()-Date.now()));}
function cloudFlush(){if(cloudT){clearTimeout(cloudT);cloudT=0;}if(cloudDirty)cloudSave(true);}
function cloudSave(flush){hmk('cs');if(!cloudLoaded||cloudPending||SHOT)return;cloudLast=Date.now();cloudDirty=false;
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
  if(typeof difMerge==='function')difMerge(o,other); // OB:DIF звёзды режимов — максимум, выбор режима — из основы
  if(typeof META_HK==='function')META_HK('MERGE',other,o); // OB:META1 розетка меты: свои ключи модулей — максимум/объединение (other — вторая сторона, o — итог)
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
function cloudIn(d){cloudLoaded=true;if(d&&typeof d==='object'){if(+d.ts>0){try{localStorage.setItem('oborona-cl','1');}catch(e){}}cloudPending=d;cloudApply();}else save();
  if(typeof statProg==='function')statProg();} // STAT v1.2: progress в start — после первого чтения облака (bt — облако хоть раз отдало сохранение; метка устройства, не в сохранении)
function cloudApply(start){if(!cloudPending||(!start&&typeof G!=='undefined'&&G&&!G.over))return;const d=cloudPending;cloudPending=null;
  if(cloudMerge(d)){S.ts=Date.now();try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}cloudDirty=true;cloudSave();if(typeof onSaveMerged==='function')onSaveMerged();}}

/* ================= площадка: Яндекс Игры или VK ================= */
// VK передаёт в адрес игры параметры запуска (vk_app_id и др.); ?vk=1 — проверка VK-режима на маке
const PLAT=/[?&](vk_app_id|vk)=/.test(location.search)?'vk':'yandex';
const OK=PLAT==='vk'&&/[?&](vk_client=ok|vk_platform=[a-z_]*_ok|ok=1)(&|$)/.test(location.search);
const OK_LINK='https://ok.ru/game/512005500650'; // ссылка на игру в ОК (пусто — «Поделиться» в ОК спрятано)
let ysdk=null,YP=null,VK=null,paused=false,muted=false;
/*STAT*/
/* ===== STAT v1.4 (09.10.2026; v1.3 — 08.10, v1.2 — 04.10, v1 — 29.09): своя ОБЕЗЛИЧЕННАЯ статистика — общий модуль всех игр =====
   Источник — ~/Projects/hobby-analytics/stat/stat.js (правки только тут, в игры — stat-sync.sh). Как встраивать — stat/README.md.
   Никогда не отправляем: vk_user_id и параметры адреса запуска (кроме vk_platform, vk_ref), имя, IP, User-Agent целиком,
   постоянный номер игрока/устройства. Ключ — случайная строка СЕАНСА (только в памяти). На устройстве: день установки, число сеансов,
   день отметки, неотправленные пачки (stat-q-<игра>), признак новой функции (stat-srv), буквы опытов (stat-ab-<игра>-<опыт>).
   v1.2: очередь «без потерь» (включается сама по ответу функции {"v":2} / X-Stat: 2), bd — день пачки по Москве, adReq→ms, offer/hold с n,
   progress→start, bal→cb, ранние ошибки и незагрузившиеся файлы, act, perf, ab+cfg, adchk, earn, idle. Старый синтаксис: только var/function.
   05.10: perf v:2 — плавность меряем по кадрам БРАУЗЕРА, пока игра зовёт STAT.frame(); паузы игры, сворачивание и реклама в «подвисания» не идут.
   08.10 (v1.3, sv:13): «без хода» (idle) обнуляется при новом сеансе после перерыва — раньше тянулся из прошлого (idle 2612 с у сеанса в 72 с).
   09.10 (v1.4, sv:14): STAT.pl(n) — прогресс сейчас (то же, что pl в STAT.progress) → поле pl в pause (прогресс на конец захода) и в start нового сеанса. */
var STAT=(function(){
  var V=1,SV=14,FLUSH=90,MAXQ=40,MAXB=60,PMAX=30,PBYTES=3e5,SESS_GAP=30*60e3,MAXERR=5,THR=2e4;
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
  // v1.4: STAT.pl(n) — прогресс изменился (уровень пройден и т. п.): событий не шлёт, уходит полем pl в pause и в start следующего сеанса
  function setPl(n){n=+n;if(!isFinite(n))return;prog=prog||{};prog.pl=n;}

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
    if(lvl)p.l=lvl.l;if(scr)p.sc=scr;if(cb!==undefined)p.cb=cb;if(mvT)p.idle=idle();if(prog&&prog.pl!==undefined)p.pl=prog.pl;ev('pause',p);
    while(Q.length)pend.push(pack());keep();beacon();}
  function show(){if(!on||vis)return;vis=true;actT=Date.now();fBrk();
    if(Date.now()-hideT>SESS_GAP){ // долго не было — новый сеанс (новый ключ, счётчик сеансов +1)
      if(lvl)lvl=null;once={};errN=0;resN=0;errSeen={};mvT=0;sk=rnd();hdr.sk=sk;seq=0;t0=Date.now();act=0;st.n++;saveSt();cfgS=0;
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
    progress:progress,pl:setPl,bal:bal,move:move,earn:earn,frame:frame,ab:ab,cfg:cfg,
    _dbg:function(){return {on:on,dev:dev,cut:cut,Q:Q,pend:pend,st:st,hdr:hdr,lvl:lvl,lastErr:lastErr,srv:srv,nm:nm,fails:fails,nextT:nextT,sP:!!sP,cb:cb,fN:fN,fHg:fHg,fJ:fJ,pl:place};}};
})();
/*/STAT*/
// STAT — своя ОБЕЗЛИЧЕННАЯ статистика (hobby-analytics/stat): без vk_user_id, IP и постоянного номера; выключатель — ⚙ «Анонимная статистика».
// Адрес боевой; на маке/LAN/в headless модуль молчит сам (03.10). ?stat=dev на localhost — журнал [STAT] в консоль без отправки.
const STAT_URL='https://functions.yandexcloud.net/d4efqgmii6honbajplim?op=ev';
// STAT_O.S — текущее сохранение: облако подменяет S целиком (cloudMerge), ссылку обновляем там же
const STAT_O={g:'oborona',gv:'v3.1-100916',plat:PLAT,lang:LANG,url:STAT_URL,now:()=>nowMs(),S:S};STAT.init(STAT_O);
/* STAT v1.2: настройки сеанса (cfg), прогресс на входе (progress: pl — уровней кампании со звёздами, cn — золото, bt — облако хоть раз отдало сохранение;
   после первого чтения облака, но не позже 2,5 с), баланс золота (bal — в setPills), откуда золото (ern → earn: lvl, ad, gift, chest, buy, quest) */
function statCfg(){let th='';try{th=window.LOOK&&LOOK.cur?LOOK.cur():(S.th||'');}catch(e){}STAT.cfg({th:th,snd:S.sound?1:0,calm:S.shake?0:1});}
let statPr=0;function statProg(){if(statPr)return;statPr=1;let bt=0,pl=0;try{bt=localStorage.getItem('oborona-cl')==='1'?1:0;}catch(e){}
  pl=statPlN();statCfg();STAT.progress({pl:pl,cn:Math.floor(+S.gold||0),bt:bt});STAT.bal(Math.floor(+S.gold||0));statPrg();}
/* STAT v1.4 (09.10): pl — уровней кампании со звёздами на Обычном; STAT.pl после каждой победы → поле pl в pause/start.
   prg — разово после загрузки сохранения: p — сила (powerNow), st — Σ звёзд Обычного, sd — Σ звёзд ⚔/🔥 (S.dst), v — Σ уровней деревни */
function statPlN(){let pl=0;for(const k in S.stars)if(S.stars[k]>0)pl++;return pl;}
function statPl(){try{STAT.pl(statPlN());}catch(e){}}
function statPrg(){try{let sd=0,v=0;for(const k in S.dst||{})sd+=+S.dst[k]||0;for(const k in S.village||{})v+=+S.village[k]||0;
  STAT.ev('prg',{p:typeof powerNow==='function'?Math.round(powerNow()):0,st:typeof starsTotal==='function'?starsTotal():0,sd:sd,v:v});}catch(e){}}
setTimeout(statProg,2500);
/* HANG (09.10): подвисание > 1 с — где игра стояла. Меряем промежуток между кадрами браузера в общем цикле (loop в game.js зовёт hangTick
   на каждом кадре — и в меню, и в бою, и в мини-играх). Не считаем: свёрнута/без фокуса (и 1,5 с после возврата), ролик на экране (adW),
   первый кадр после паузы цепочки. Событие hang {ms, sc — где (b — бой, b_end — итоги боя, mg_<id>, вкладка меню; +':'+окно), l — уровень,
   wv — волна, en — нечисти на поле, sp — скорость, mk — что игра делала прямо перед остановкой (метки hmk), bt — секунд от запуска}. Не больше 5 за сеанс. */
let hngP=0,hngX=0,hngN=0;const hngM=[];
function hmk(s){const t=performance.now();hngM.push([t,s]);if(hngM.length>6)hngM.shift();}
function hngBrk(){hngX=performance.now()+1500;hngP=0;}
document.addEventListener('visibilitychange',hngBrk);window.addEventListener('blur',hngBrk);window.addEventListener('focus',hngBrk);
function hangTick(t){const p=hngP;hngP=t;if(!p||document.hidden||t<hngX||p<hngX||(typeof adW!=='undefined'&&adW)||hngN>=5)return;const d=t-p;if(d<1000||d>60000)return;hngN++;
  try{const mc=typeof MG!=='undefined'&&MG.cur,md=$('modal')&&$('modal').classList.contains('on')?($('mBody').getAttribute('data-w')||'m'):'';
    const sc=(mc?'mg_'+mc.id:G?(G.over?'b_end':'b'):String(typeof curTab!=='undefined'?curTab:'menu').toLowerCase())+(md?':'+md:'');
    const mk=hngM.filter(m=>m[0]>=p-50).map(m=>m[1]).join(',')||(hngM.length?'~'+hngM[hngM.length-1][1]:'');
    const o={ms:Math.round(d),sc:sc,mk:mk,bt:Math.round(t/1000)};if(G){o.l=typeof statLv==='function'?statLv():'';o.wv=G.wave;o.en=(G.en||[]).filter(e=>!e.dead).length;o.sp=G.speed;}
    STAT.ev('hang',o);}catch(e){}}
function ern(s,n){if(n>0)STAT.earn(s,Math.round(n));}
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
/* ===== SOC v2.4 (06.10 вечер: уведомления в статистике — день игрока, код ошибки, «включены ли» раз за сеанс; кнопка в ⚙ возвращается, если игрок выключил их в VK; Гастроном в «Ещё игры»; off:'all' действует и в ОК — см. «v2.4» ниже. v2.3 — 06.10: события VK — лента друзей, таблица, миссии: SOC.level/score/mission через свою функцию ?op=vkev; разрешение на уведомления — SOC.ntf и предложение 'ntf'; см. «v2.3» ниже. v2.2 — 04.10: Одноклассники — см. «ОК» ниже; v2.1 — 04.10: итоги в STAT — событие soc; v2 — 29.09.2026; v2 — дружит с REF: «Позвать друзей» = ссылка с #ref): друзья, избранное, «Ещё игры во дворе» — ТОЛЬКО VK с мостом; в Яндексе молчит =====
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
  var GROUP=241793582,DAY=864e5,VER=2.4;
  // i — место в спрайте dvor.jpg (по 96 px), g — группа (c карты, p головоломки, s сказка, r спокойные), a — возраст,
  // off — где игры НЕТ в каталоге VK: 'all' — нигде, 'web' — нет на компьютере (desktop_web). Обновлять по platforms.md.
  // ok — ID этой игры в Одноклассниках (vk_ok_app_id), когда она там вышла; без него в ОК игра в «Ещё игры» не показывается.
  // v2.4: off:'all' прячет игру везде, и в ОК тоже (Козёл: номер ОК вписан заранее, показ включится, когда уберём off).
  var GAMES=[
    {id:54791564,t:'Выезд со двора',a:6,i:0,g:'p',ok:512004864050},
    {id:54787973,t:'Баба Зина: слова из букв',a:0,i:1,g:'p',ok:512005727621},
    {id:54791567,t:'Богатырь против нечисти',a:6,i:2,g:'s',ok:512005580574},
    {id:54791569,t:'Тридевятая оборона: защита башен',a:6,i:3,g:'s',ok:512005500650},
    {id:54791634,t:'Гастроном номер 1',a:0,i:4,g:'p',ok:512005037494},
    {id:54792006,t:'Дурак во дворе',a:12,i:5,g:'c',ok:512005141228},
    {id:54792009,t:'Косынка во дворе',a:0,i:6,g:'c',ok:512005597603},
    {id:54792011,t:'Паук на даче',a:0,i:7,g:'c',ok:512005626567},
    {id:54792015,t:'Свободная ячейка в санатории',a:0,i:8,g:'c',ok:512005010476},
    {id:54792674,t:'Козёл во дворе',a:12,i:9,g:'c',off:'all',ok:512005062986},
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
    if(k==='ntf')return !OKP&&!ntfOn(); // уведомления — пока только ВКонтакте
    if(!OKP)return k==='home'?!!homeOk:k==='fav'?!(st.fav&&st.fav.d):true;
    return k==='inv'||(k==='share'&&!!O.okLink)||(k==='grp'&&!!O.okGroup);}
  function me(){for(var i=0;i<N;i++)if(GAMES[i].id===APP)return GAMES[i];return null;}
  function done(k){st[k]={d:1};saveFn();}
  function tried(k){var x=st[k]||{};x.n=(x.n||0)+1;x.t=Date.now();st[k]=x;saveFn();}
  // STAT v1.2 (А15): итог предложения площадки → soc {a: fav|home|inv|grp|shr|more, r: show|ok|no|err}; отказ игрока (код 4 / «denied») — no
  function sx(a,r,n,x){try{if(typeof STAT!=='undefined'&&STAT.ev){var p={a:a,r:r},k;if(n)p.n=n;if(x)for(k in x)if(x[k]!==''&&x[k]!=null)p[k]=x[k];STAT.ev('soc',p);}}catch(e){}} // n — номер попытки (уведомления: 1–3); x — доп. поля (v2.4)
  function sr(a){return function(e){var d=e&&e.error_data||{};sx(a,d.error_code===4||/denied|cancel/i.test(String(d.error_reason||d.error_msg||''))?'no':'err');};}
  function due(k){var x=st[k]||{};return !x.d&&(x.n||0)<3&&(!x.t||Date.now()-x.t>30*DAY);}

  /* SOC.init(S, {save, toast, cls, modal, close}) — один раз при запуске, после загрузки сохранения (считает сессии).
     cls — классы кнопок (по умолчанию 'btn noenter': Enter их не жмёт); modal(html) — показать окно игры и вернуть его
     контейнер; close() — закрыть окно игры. Без modal — своё лёгкое окно. */
  function init(S,opt){O=opt||{};if(!S.soc||typeof S.soc!=='object')S.soc={};st=S.soc;
    if(!st.ses&&!st.d0)st.d0=nowFn(); // день первого запуска (для расписания уведомлений); у давних игроков его нет
    st.ses=(st.ses||0)+1;if(!OKP&&qp('vk_is_favorite')==='1')st.fav={d:1};evInit();saveFn();ready();}
  // после VKWebAppInit (мост готов): узнать, можно ли значок на экран (только Android)
  function ready(){if(readyOn||!ok())return;readyOn=true;evPlan(8000);ntfSes();
    if(!OKP&&PF.indexOf('android')>=0)vkSend('VKWebAppAddToHomeScreenInfo',{},4000).then(function(r){
      homeOk=!!(r&&r.is_feature_supported&&!r.is_added_to_home_screen);},function(){homeOk=false;});
    else homeOk=false;}
  // облако: вызвать из слияния сохранений игры — SOC.merge(d.soc); сессии — максимум, «сделано» — навсегда, попытки — больше/позже
  function merge(d){if(!d||typeof d!=='object')return;
    for(var k in d){var a=st[k],b=d[k];
      if(k==='ses'){if(typeof b==='number'&&b>(st.ses||0))st.ses=b;continue;}
      if(k==='ev'){evMerge(b);continue;}
      if(k==='d0'){if(+b>0&&(!st.d0||+b<st.d0))st.d0=+b;continue;} // первый запуск — более ранний
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
      if(g.off==='all'||(OKP?!(g.ok&&OKWEB):(g.off==='web'&&WEB)))continue;out.push(g);} // ОК: только игры с ID в ОК и только там, где работает OpenApp
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
    if(O.ntf&&can('ntf'))b+=btn('ntf',O.ntf.s||tx('🔔 Напоминания от игры','🔔 Game reminders'));
    if(can('more'))b+=btn('more',tx('🎲 Ещё игры во дворе','🎲 More yard games'));
    return '<div class="soc-set">'+b+'</div>';}
  // навесить обработчики после вставки HTML: SOC.bind(контейнер, back) — back() вызывается при «Назад» из «Ещё игры»
  function bind(root,back){if(!root)return;var bs=root.querySelectorAll('[data-soc]');
    for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var k=this.getAttribute('data-soc');
      if(k==='inv')invite();else if(k==='share')share();else if(k==='fav')fav().then(function(){if(back)back();});
      else if(k==='home')home().then(function(){if(back)back();});else if(k==='ntf')ntf(0).then(function(){if(back)back();});else if(k==='grp')group();else if(k==='more')showMore(back);};}

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
  function offer(wins,busy){if(!ok()||asked||busy||Date.now()-T0<120000)return null;
    var o=null;
    // уведомления: до 3 показов за всё время — в 1-й, 3-й и 7-й день игрока (NTF_DAYS), после 3 побед; из ⚙ игрок может включить сам
    var nn=ntfDue()&&(wins||0)>=3?ntfN()+1:0,nt=nn?ntfText(nn):'';
    if(nn&&nt)o={k:'ntf',n:nn,t:nt,b:O.ntf.b||tx('🔔 Напоминать','🔔 Remind me'),ok:O.ntf.ok||'',run:function(){return ntf(nn);}};
    else if((st.ses||0)<2)return null; // остальные предложения — не в первую сессию (п. 2.6.3)
    else if(can('fav')&&due('fav'))o={k:'fav',t:tx('Добавьте игру в избранное — будет всегда под рукой.','Add the game to favourites — always at hand.'),b:tx('⭐ В избранное','⭐ Add to favourites'),run:fav};
    else if(can('home')&&st.ses>=3&&due('home'))o={k:'home',t:tx('Значок игры на экране — заходить в одно касание.','A game icon on your screen — one tap to play.'),b:tx('📲 На экран телефона','📲 Add to home screen'),run:home};
    else if(st.ses>=3&&(wins||0)>=5&&due('inv'))o={k:'inv',t:tx('Позовите друзей — будет с кем посоревноваться.','Invite friends — someone to compete with.'),b:tx('👥 Позвать друзей','👥 Invite friends'),run:invite};
    else if(can('grp')&&st.ses>=4&&due('grp'))o={k:'grp',t:tx('Новости и новые игры — в сообществе «Игры во дворе».','News and new games — in the "Yard Games" community.'),b:tx('📣 Наше сообщество','📣 Our community'),run:group};
    else{var x=st.more||{};if(!x.t||Date.now()-x.t>7*DAY){var g=list(1)[0];
      if(g)o={k:'more',t:tx('Попробуйте ещё: «'+g.t+'»'+(g.a>=12?' ('+g.a+'+)':'')+'.','Try another one: "'+g.t+'".'),b:tx('🎲 Открыть','🎲 Open'),run:function(){return open(g);}};}}
    if(!o)return null;asked=true;sx(o.k,'show',o.n,o.k==='ntf'?{d:ntfDay()}:null);
    if(o.k==='more'){st.more={t:Date.now()};saveFn();}
    else if(o.k==='ntf'){st.ntf={n:o.n,t:nowFn()};saveFn();}
    else tried(o.k);return o;}

  /* ===== v2.3. Разрешение на уведомления (VKWebAppAllowNotifications) =====
     Сам модуль ничего не показывает: игра включает настройкой SOC.init(…,{ntf:{t:'вопрос' или function(n){…},b:'кнопка',ok:'ответ',s:'кнопка в ⚙'},now:часы игры}).
     Тогда: в ⚙ — кнопка (жмёт сам игрок, всегда, пока не разрешено), в SOC.offer — предложение 'ntf' до NTF_MAX=3 раз за всё время,
     по дням игрока NTF_DAYS=[1,3,7] (день 1 — день первого запуска, S.soc.d0; дни календарные, по часам игры O.now):
     показ №1 — в первый же день (условие «вторая сессия» на него НЕ действует; остаётся: не в первые 2 минуты сеанса и при ≥3 победах),
     №2 — не раньше 3-го дня, №3 — не раньше 7-го; не заходил в нужный день — при первом заходе позже; два показа в один день — никогда.
     Игрок, который начал играть до этой версии (нет S.soc.d0): №1 — сразу по обычному условию, №2 — через 2 дня после №1, №3 — через 4 дня после №2.
     t — строка или функция от номера попытки (1–3): каждый раз свой повод; вернула пусто — в этот раз не предлагаем (показ не тратится).
     S.soc.ntf: {n: сколько раз показали, t: когда в последний раз (часы игры O.now, иначе Date.now)} или {d:1} — разрешено, больше никогда.
     Облако (merge): счётчик — больший, дата — более поздняя, «разрешено» — навсегда. Окно VK вызывается только нажатием кнопки игроком.
     Статистика: soc {a:'ntf', r: show|ok|no|err, n: номер попытки 1–3; из ⚙ — без n}. Если VK уже сообщил vk_are_notifications_enabled=1 — не спрашиваем. В ОК пока выключено. Наград нет.
     v2.4 — статистика подробнее (событие то же, soc с a:'ntf'; сервер статистики править не надо):
       show {n, d}        — предложение показано: n — какое по счёту (1–3), d — день игрока (1 — день первого запуска; 0 — неизвестен, давний игрок);
       ok | no | err {n, d, e} — ответ на окно VK: разрешил | отказал (закрыл окно, код 4) | ошибка; e — код ошибки VK (число) или короткая причина; из ⚙ — без n;
       on {s}             — раз за сеанс, если уведомления включены: s:'vk' — так сообщил VK (vk_are_notifications_enabled=1), s:'me' — игрок разрешил нашей кнопкой, а VK параметра не дал;
       off                — раз за сеанс: игрок разрешал нашей кнопкой, а VK сообщает vk_are_notifications_enabled=0 (выключил в настройках VK).
     «Пришёл по уведомлению» модуль не пишет: метка захода vk_ref и так есть в шапке каждой пачки статистики (поле src).
     Если игрок выключил уведомления в VK (параметр = 0), кнопка в ⚙ появляется снова (включить может только он сам); само-предложение — никогда. */
  var ntfNow=false; // разрешил в этом сеансе (параметр запуска VK до перезапуска остаётся прежним)
  function ntfOn(){var v=qp('vk_are_notifications_enabled');return ntfNow||v==='1'||(v!=='0'&&!!(st.ntf&&st.ntf.d));}
  function ntfDay(){return st.d0?Math.max(0,dayNo(nowFn())-dayNo(st.d0)+1):0;}
  function ntfSes(){if(!O.ntf||OKP)return;var v=qp('vk_are_notifications_enabled'),d=!!(st.ntf&&st.ntf.d);
    if(v==='1')sx('ntf','on',0,{s:'vk'});else if(d)sx('ntf',v==='0'?'off':'on',0,v==='0'?null:{s:'me'});}
  var NTF_MAX=3,NTF_DAYS=[1,3,7]; // показов всего; в какой день игрока (от первого запуска) не раньше — показ №1, №2, №3
  function dayNo(t){var d=new Date(t);return Math.floor((t-d.getTimezoneOffset()*60000)/DAY);} // номер календарного дня (местное время)
  function nowFn(){var t=0;try{t=+(O.now&&O.now())||0;}catch(e){}return t>0?t:Date.now();}
  function ntfN(){return st.ntf&&+st.ntf.n||0;}
  function ntfDue(){if(!O.ntf||!can('ntf')||(st.ntf&&st.ntf.d))return false;var n=ntfN();
    if(n>=NTF_MAX)return false;if(!n)return true;
    var now=dayNo(nowFn()),last=dayNo(+st.ntf.t||0);if(now<=last)return false; // в один день — никогда
    return st.d0?now-dayNo(st.d0)+1>=NTF_DAYS[n]:now-last>=NTF_DAYS[n]-NTF_DAYS[n-1];}
  function ntfText(n){var t=O.ntf.t;if(typeof t==='function'){try{t=t(n);}catch(e){t='';}}
    return t==null?tx('Напомнить, когда появится что-то новое?','Remind you when there is something new?'):String(t||'');}
  // n — номер попытки из offer (1–3) или 0/пусто — кнопка в ⚙. Отказ счётчик показов не меняет (показ уже посчитан в offer)
  function ntf(n){n=+n||0;return send('VKWebAppAllowNotifications').then(function(r){var y=!!(r&&r.result);if(y){done('ntf');ntfNow=true;}sx('ntf',y?'ok':'no',n,{d:ntfDay()});return y;},
    function(e){var d=e&&e.error_data||{},c=+d.error_code||0,why=String(d.error_reason||d.error_msg||'');
      sx('ntf',c===4||/denied|cancel/i.test(why)?'no':'err',n,{d:ntfDay(),e:c||String(why||(e&&(e.error_type||e.message))||'?').slice(0,24)});return false;});}

  /* ===== v2.3. События VK: лента активности друзей, таблица результатов, миссии =====
     VK принимает их только с сервера (secure.addAppEvent), поэтому игра шлёт в свою функцию (hobby-pay, ?op=vkev) подписанные параметры
     запуска и список событий; сервер проверяет подпись. Включается настройками SOC.init: evUrl — адрес функции,
     evId(код) — номер миссии из кабинета VK (0/пусто — миссия ещё не заведена, не шлём), evGap — пауза между отправками уровня/очков (мс).
     Игра зовёт (в любой момент, хоть на каждую победу): SOC.level(n) — пройдено уровней, SOC.score(n) — очки, SOC.mission('код') — миссия выполнена.
     Модуль помнит в S.soc.ev: l/p — что надо отправить, ls/ps — что уже отправлено, m — миссии {код: 0 ждёт | 1 отправлена},
     f — {код: когда VK в последний раз отказал}. Отказ VK по миссии (ещё на проверке у модератора, отклонена, сбой) — НЕ навсегда:
     миссия остаётся ждать и повторяется при следующих запусках, но не чаще раза в сутки (EV_RETRY_DAYS) на миссию. Шлёт пачкой (до 4 событий, миссий — до 2 за запрос и до 4 за сеанс), уровень/очки — не чаще раза в evGap (3 мин),
     плюс при сворачивании игры; не отправилось (нет сети, сервер молчит) — уйдёт в следующий раз/при следующем запуске.
     Только ВКонтакте с мостом и подписью в адресе: в ОК, в Яндексе и на маке без vk_app_id — ни одного запроса. Всё молча: игрок ничего не видит.
     Статистика: STAT.ev('vkev',{a:'lvl'|'pts'|'mis'|'req', r:итог, k:код миссии}). Наград за это нет. */
  var evT=0,evBusy=false,evLast=0,evSes=0,evDead=false,evWait=0,evFails=0,evSkip={},EV_RETRY_DAYS=1;
  function evHold(k){var e=evSt(),t=e.f&&+e.f[k]||0;return evSkip[k]||(t>0&&nowFn()-t<EV_RETRY_DAYS*DAY&&nowFn()>=t);} // недавно отказали — пока не шлём
  function evSt(){if(!st.ev||typeof st.ev!=='object')st.ev={};if(!st.ev.m||typeof st.ev.m!=='object')st.ev.m={};return st.ev;}
  function evKeep(){return typeof PLAT!=='undefined'&&PLAT==='vk'&&!OKP;} // запоминать достижения (даже без сети/моста)
  function evOn(){return ok()&&!OKP&&!!O.evUrl&&!!qp('sign')&&!evDead&&typeof fetch==='function';}
  function evNum(code){var n=0;try{n=+(typeof O.evId==='function'?O.evId(code):O.evId&&O.evId[code])||0;}catch(e){}return n>=3?n:0;}
  function evStat(a,r,k){try{if(typeof STAT!=='undefined'&&STAT.ev){var p={a:a,r:String(r).slice(0,8)};if(k)p.k=k;STAT.ev('vkev',p);}}catch(e){}}
  function evInit(){if(!evKeep())return;evSt();
    try{document.addEventListener('visibilitychange',function(){if(document.hidden)evFlush(true);});}catch(e){}}
  function evMerge(b){if(!b||typeof b!=='object')return;var e=evSt(),k,i,ks=['l','ls','p','ps'];
    for(i=0;i<ks.length;i++){k=ks[i];if(+b[k]>(+e[k]||0))e[k]=+b[k];}
    if(b.m&&typeof b.m==='object')for(k in b.m)if(e.m[k]==null||+b.m[k]>+e.m[k])e.m[k]=+b.m[k]===1?1:0;
    if(b.f&&typeof b.f==='object'){if(!e.f)e.f={};for(k in b.f)if(+b.f[k]>(+e.f[k]||0))e.f[k]=+b.f[k];}}
  function evSet(k,n){if(!evKeep())return;n=Math.floor(+n||0);var e=evSt();if(!(n>(+e[k]||0)))return;e[k]=n;saveFn();evPlan(5000);}
  function level(n){evSet('l',n);}
  function score(n){evSet('p',n);}
  function missionKnown(code){return !evKeep()||evSt().m[code]!=null;}
  function mission(code){if(!evKeep()||!code)return false;var e=evSt();if(e.m[code]!=null)return false;e.m[code]=0;saveFn();evPlan(5000);return true;}
  function evPick(force){var e=evSt(),out=[],k,n=0,gap=+O.evGap||180000,now=Date.now();
    for(k in e.m){if(e.m[k]!==0||evHold(k)||!evNum(k))continue;if(n>=2||evSes+n>=4)break;out.push({m:k,id:evNum(k)});n++;}
    if(out.length||!evLast||now-evLast>=(force?30000:gap)){
      if((+e.l||0)>(+e.ls||0))out.push({a:1,v:+e.l});
      if((+e.p||0)>(+e.ps||0))out.push({a:2,v:+e.p});}
    return out;}
  function evPlan(ms){if(evT||!evOn())return;var e=evSt(),gap=+O.evGap||180000,left=evLast?evLast+gap-Date.now():0,k,mis=false;
    for(k in e.m)if(e.m[k]===0&&!evHold(k)&&evNum(k)&&evSes<4){mis=true;break;}
    if(!mis&&!((+e.l||0)>(+e.ls||0)||(+e.p||0)>(+e.ps||0)))return;
    evT=setTimeout(function(){evT=0;evFlush();},Math.max(ms||5000,mis?0:left,evWait-Date.now()));}
  function evFlush(force){if(evBusy||!evOn()||Date.now()<evWait)return;
    try{if(navigator.onLine===false)return;}catch(e){}
    var list=evPick(force);if(!list.length)return;evBusy=true;evLast=Date.now();
    var fin=false,guard=setTimeout(function(){end(null);},15000);
    function end(d){if(fin)return;fin=true;clearTimeout(guard);evBusy=false;evDone(list,d);}
    try{fetch(O.evUrl,{method:'POST',mode:'cors',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({app:String(APP),q:location.search,ev:list})})
      .then(function(r){return r.json();}).then(function(d){end(d&&typeof d==='object'?d:null);},function(){end(null);});}catch(e){end(null);}}
  function evDone(list,d){var e=evSt(),i,x,r,again=false;
    if(!d){evFails++;evWait=Date.now()+Math.min(3600000,60000*Math.pow(2,evFails));evStat('req','net');evPlan(5000);return;} // сеть/сервер: позже, в этом же сеансе реже
    if(!d.ok||!d.r){evDead=true;evStat('req',d.why||'bad');return;} // подпись устарела, игра не включена на сервере и т. п. — до следующего запуска молчим
    evFails=0;
    for(i=0;i<list.length;i++){x=list[i];r=String(d.r[i]||'net');
      if(x.m){evStat('mis',r,x.m);
        if(r==='ok'||r==='dup'){e.m[x.m]=1;evSes++;if(e.f)delete e.f[x.m];}
        else if(r==='off')evSkip[x.m]=1; // на сервере миссии ещё нет — до следующего запуска не спрашиваем
        else if(r==='busy'||r==='net')again=true;
        else{if(!e.f)e.f={};e.f[x.m]=nowFn();evSkip[x.m]=1;}} // VK отказал (на проверке / отклонена / сбой): миссия ждёт дальше, повтор — не раньше чем через сутки
      else{evStat(x.a===1?'lvl':'pts',r);
        if(r==='busy'||r==='net')again=true;
        else if(x.a===1)e.ls=x.v;else e.ps=x.v;}} // ok — принято; off/bad/e… — это значение больше не шлём, следующее (больше) попробуем
    saveFn();if(again)evWait=Date.now()+120000;evPlan(20000);}

  return {v:VER,ok:ok,isOk:OKP,can:can,init:init,ready:ready,merge:merge,fav:fav,home:home,invite:invite,share:share,group:group,open:open,list:list,
    settingsHtml:settingsHtml,bind:bind,showMore:showMore,offer:offer,games:GAMES,
    ntf:ntf,ntfOn:ntfOn,ntfDue:ntfDue,ntfDay:ntfDay,level:level,score:score,mission:mission,missionKnown:missionKnown,evOn:evOn,evFlush:evFlush};
})();
/*/SOC*/
SOC.init(S,{save:()=>save(),toast:t=>toast(t),cls:'btn ghost',modal:h=>{showModal(h);return $('mBody');},close:()=>hideModal(),okLink:OK_LINK,
  /* ntf: разрешение на напоминания VK (SOC v2.4) — вопрос воеводы в окне победы (ui.js: ntfText, socRow, onBattleEnd); расписание — в модуле, наград нет */
  now:()=>nowMs(),ntf:{t:n=>ntfText(n),b:Lg('🔔 Напоминать','🔔 Remind me'),ok:Lg('Так точно! По пустякам тревожить не стану.','Aye! I won’t trouble you over trifles.'),s:Lg('🔔 Включить напоминания','🔔 Turn on reminders')}});
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
  if(!OK)window.vkBridge.send('VKWebAppGetConfig').then(function(c){if(c&&c.viewport_height)vkFit(c.viewport_height);}).catch(function(){});
}catch(e){}}
async function vkInit(tries){
  try{await vkSend('VKWebAppInit',{},SDK_WAIT);}catch(e){if(tries>0)vkInit(tries-1);return;}
  if(VK)return;VK=window.vkBridge;SOC.ready();if(typeof updMore==='function')updMore();
  vkFitInit(); // VK web: подогнать высоту окна под экран (без ожидания)
  VK.subscribe(e=>{const t=e.detail&&e.detail.type;if(t==='VKWebAppViewHide'){setPause('vk',1);cloudFlush();}else if(t==='VKWebAppViewRestore'){setPause('vk',0);if(typeof adBack==='function')adBack();setTimeout(adBackChk,300);}});
  vkCloudInit(3).then(()=>{if(typeof PAY!=='undefined'&&!OK)PAY.init();}); // покупки VK (js/pay.js): после моста и первого чтения облака
  adPreload('boot'); // pre: подгрузка ролика за награду сразу после моста (облако не ждём); «нет» — переспрашиваем в фоне, пока не станет «есть»
  interPre();} // подгрузка межэкранной (как в Богатыре); правила показа не меняются
// Яндекс: игрок и облако — с тайм-аутом, иначе повисший запрос оставит игру без облака навсегда
async function ycloud(n){if(!ysdk)return;try{if(!YP)YP=await withTimeout(ysdk.getPlayer({scopes:false}),10000);cloudIn(await withTimeout(YP.getData(),10000));}
  catch(e){if(n>0)setTimeout(()=>ycloud(n-1),10000);}}
async function initSDK(){
  if(PLAT==='vk'){
    // меню не ждёт ответа моста: VKWebAppInit уходит сразу, ответ ждём до 20 с (и ещё раз, если не пришёл); облако догружается следом
    try{if(!window.vkBridge)await loadScript('js/vk-bridge.min.js').catch(function(){return new Promise(function(r){setTimeout(r,1500);}).then(function(){return window.vkBridge||loadScript('js/vk-bridge.min.js?r=2');});});vkInit(1);}catch(e){VK=null;}
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
  if(typeof PAY!=='undefined'&&!OK)PAY.init(); // ОК: покупки в «ОКах», сервер не готов → PAY.on=false, кнопок и окон покупок нет. Покупки (js/pay.js): Яндекс; VK — после моста (vkInit), здесь только заглушка ?vk=1&paytest=1 без моста
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
// код 4 VK (и onClose без onRewarded в Яндексе) — игрок сам закрыл ролик раньше конца: честно, не «реклама сломана» (решение владельца 08.10, hobby-analytics/release-h/attention-0810.md)
function adSkipTxt(){return Lg('Ролик закрыт до конца — награды нет','The video was closed early — no reward');}
function adUserClosed(e){const d=e&&e.error_data||{};return +d.error_code===4;}
// пока ролик идёт, повторные нажатия не запускают второй (и не дают двойную награду)
let adBusy=false;
/* adfix (03.10): «ролика нет» — VK отвечает ошибкой 20 ('No ads'), чаще на компьютере: ролик ещё не подгрузился, готов он бывает через 10–60 с.
   1) отказ «ролика нет» → один тихий автоповтор через AD_RETRY_MS под надписью «Ролик загружается…» (игра на паузе);
   2) снова нет → «Ролик будет через несколько секунд…», кнопки «за рекламу» (AD_BTN_SEL) гаснут, в фоне раз в AD_POLL_MS спрашиваем VK (Check);
      «готов» (не раньше AD_COOL_MIN) → кнопки загораются и «Ролик готов»; ответа нет — загораются сами через AD_COOL_MS. Нажатие по погасшей кнопке VK не дёргает;
   3) заранее: Check при запуске и после каждого показа, «не готов» — переспрашиваем в фоне, пока не станет «готов» (см. pre ниже). Ответу «не готов» как запрету не верим.
   Награда — только за досмотр и один раз. Статистика: ok+c='retry' — спас автоповтор; none — ролика не было и после повтора.
   Один приём во всех играх: hobby-analytics/release-f/ads-fail.md, раздел «ОБРАЗЕЦ». */
const AD_RETRY_MS=3000,AD_COOL_MS=30000,AD_COOL_MIN=8000,AD_POLL_MS=5000,AD_BTN_SEL='.btn.ad',AD_BTN_RE=null;let adCoolT=0,adCoolS=0,adDimT=0,adChkT=0,adRdyT=0;
function adErrCode(e){const d=e&&e.error_data||{};return d.error_code||d.error_reason||(e&&(e.error_type||e.message))||'';} // код VK, иначе причина словами — в статистику
function adNoFill(e){const d=e&&e.error_data||{};return +d.error_code===20||/no ads?\b/i.test(String(d.error_reason||''));}
function adSoon(){return Lg('Ролик будет через несколько секунд — кнопка загорится, когда он загрузится','The video will be ready in a few seconds — the button will light up');}
function adBtns(){const o=[];try{const q=document.querySelectorAll(AD_BTN_SEL);for(let i=0;i<q.length;i++){const b=q[i];if(!AD_BTN_RE||b.hasAttribute('data-adoff')||(AD_BTN_RE.test(b.textContent)&&!/без реклам|no ads/i.test(b.textContent)))o.push(b);}}catch(e){}return o;}
/* pre (05.10): ролик за награду подгружаем ЗАРАНЕЕ и помним ответ. VKWebAppCheckNativeAds не только отвечает «есть/нет», но и просит VK загрузить ролик,
   поэтому «нет» переспрашиваем, пока не станет «есть» (раньше — 6 раз за 30 с и тишина): шаги AD_STEP (6 раз по 5 с, 4 раза по 15 с), дальше раз в AD_STEP_MAX (45 с).
   Не чаще раза в AD_ASK_MIN; в свёрнутой игре не спрашиваем (вернулись — спросили сразу). Ответ «есть» перепроверяем, только если он старше AD_FRESH и на экране есть кнопка ролика.
   adSt: 1 — ролик готов, −1 — VK ответил «нет», 0 — неизвестно (ещё не спрашивали / ролик только что показан / мост молчит). Два «нет» подряд → на кнопках ролика значок ⏳
   (data-adwait; нажать всё равно можно: «нет» — не запрет, показ сам попробует загрузить). Стало «есть» → значок уходит, «Ролик готов». Игра САМА к ролику не зовёт
   (подсветок и реплик «за рекламу» в Обороне нет); появится такое предложение — показывать только при adLikely().
   Статистика: в событии ad поле pr — 1 «был готов к нажатию», 0 «VK говорил нет», нет поля — неизвестно; при переходе «нет»→«есть» — adchk {f:'rew',w:секунд ждали,k:сколько «нет»,s:повод}.
   Имя adWhy занято межэкранной — у опроса adAskWhy. Образец: hobby-analytics/release-h/preload/preload-sample.md, раздел «ОБРАЗЕЦ». Числа — let: стенд их укорачивает. */
let AD_STEP=[5000,5000,5000,5000,5000,5000,15000,15000,15000,15000],AD_STEP_MAX=45000,AD_ASK_MIN=3000,AD_FRESH=120000,AD_LOOK_MS=20000;
let adSt=0,adStT=0,adAskT=0,adAsking=0,adAskN=0,adNoN=0,adNoT0=0,adStepN=0,adAskWhy='boot',adMarkT=0,adRdyToastT=0;
function adLikely(){return !(VK&&adSt<0&&adNoN>=2);} // false — VK уже дважды подряд ответил «ролика нет»
function adHid(){return document.hidden||!!PAUSE.vk||!!PAUSE.hidden;} // игра свёрнута (вкладка скрыта или VKWebAppViewHide)
function adPreload(why){if(!VK)return;clearTimeout(adChkT);if(typeof why==="string"){adAskWhy=why;adStepN=0;}
  if(adHid()||adW)return; // свёрнуты или ролик на экране — молчим; вернёмся / ролик закончится — спросим (adBackChk, итог показа)
  const now=typeof why==='string'&&why!=='back'&&why!=='look'; // итог показа и запуск — спрашиваем сразу (ролик потрачен, прежний ответ устарел); опрос по таймеру — не чаще AD_ASK_MIN
  if(!now){const wait=adAsking?AD_ASK_MIN:adAskT+AD_ASK_MIN-Date.now();if(wait>0){adChkT=setTimeout(adPreload,wait);return;}}
  adAskT=Date.now();const id=adAsking=++adAskN; // ответ на прежний, уже устаревший вопрос не слушаем
  vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).then(r=>{if(id!==adAskN)return;adAsking=0;const ok=!!(r&&r.result);STAT.adChk('rew',ok?1:0);adAns(ok);},()=>{if(id!==adAskN)return;adAsking=0;STAT.adChk('rew',0);adAns(null);});}
function adAns(ok){const t=Date.now();
  if(ok){if(adNoN)STAT.ev('adchk',{f:'rew',w:Math.round((t-adNoT0)/1000),k:adNoN,s:adAskWhy});
    const was=adSt<0&&adNoN>=2;adSt=1;adStT=t;adNoN=0;adStepN=0;adReady();
    if(adMark()&&was&&t>=adCoolT&&!adBusy&&t-adRdyToastT>30000){adRdyToastT=t;toast(Lg('Ролик готов — можно смотреть','The video is ready to watch'));}
    return;}
  if(ok===false){if(!adNoN)adNoT0=t;adNoN++;adSt=-1;adStT=t;adMark();} // null — мост не ответил: состояние не трогаем, но спрашивать продолжаем
  adChkT=setTimeout(adPreload,AD_STEP[adStepN++]||AD_STEP_MAX);}
// ⏳ на кнопках ролика, пока VK говорит «нет» (окна перерисовываются — поэтому раз в секунду, только пока «нет»); вернёт true, если значок был на видимой кнопке и снят
function adMark(){clearTimeout(adMarkT);const on=!adLikely(),q=on?adBtns():[];let seen=false,old=[];try{old=document.querySelectorAll('[data-adwait]');}catch(e){}
  for(let i=0;i<q.length;i++)q[i].setAttribute('data-adwait','1');
  for(let i=0;i<old.length;i++){const b=old[i];if(q.indexOf(b)<0){b.removeAttribute('data-adwait');if(!on&&b.offsetParent)seen=true;}}
  /* OB:META1 (07-stats п.6): «×2» при коде 20 жали впустую до 31 раза подряд — если VK ответил «ролика нет» (adSt<0), кнопки ×2 (data-pre, ставит adOn)
     прячем, пока ролик не подгрузится (pre: при pr=1 — 69 успехов на 1 отказ, при pr=0 — одни отказы); стало «есть» — кнопка появляется сама */
  const pre=adPre();try{const P=document.querySelectorAll('[data-pre]');for(let i=0;i<P.length;i++){const b=P[i];if(pre)b.style.display='none';else if(b.style.display==='none'){b.style.display='';STAT.offer(b.getAttribute('data-pre'));}}}catch(e){}
  if(on||pre)adMarkT=setTimeout(adMark,1000);return seen;}
function adPre(){return !!(VK&&adSt<0);} // OB:META1: VK сказал «ролика нет» — кнопки ×2 спрятаны до «есть»
// вернулись в игру или давно не спрашивали, а кнопка ролика на экране — спросить ещё раз
function adBackChk(tick){if(!VK||adBusy||adHid())return;
  if(adSt<1){if(tick!==1)adPreload('back');else if(Date.now()-adAskT>AD_STEP_MAX+2*AD_ASK_MIN)adPreload();return;} // по таймеру — только страховка, шаги не сбрасываем
  if(Date.now()-adStT<AD_FRESH)return;const q=adBtns();for(let i=0;i<q.length;i++)if(q[i].offsetParent){adPreload('look');return;}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(adChkT);else setTimeout(adBackChk,300);});
setInterval(()=>adBackChk(1),AD_LOOK_MS);
function adReady(){if(Date.now()>=adCoolT)return;clearTimeout(adRdyT);adRdyT=setTimeout(()=>{if(Date.now()>=adCoolT)return;adCoolT=0;adDim();let vis=false;const q=adBtns();for(let i=0;i<q.length;i++)if(q[i].offsetParent)vis=true;if(vis&&!adBusy)toast(Lg('Ролик готов — можно смотреть','The video is ready to watch'));},Math.max(0,adCoolS+AD_COOL_MIN-Date.now()));}
function adWait(on,txt,exit){let w=document.getElementById('adWait');if(!on){if(w)w.style.display='none';return;}
  if(!w){w=document.createElement('div');w.id='adWait';w.style.cssText='position:fixed;top:0;right:0;bottom:0;left:0;z-index:99999;background:rgba(0,0,0,.74);color:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;font-weight:800;font-size:20px;line-height:1.35';document.body.appendChild(w);}
  w.textContent=txt||Lg('Ролик загружается…','Loading the video…');
  if(exit){const n=document.createElement('div');n.style.cssText='margin-top:14px;font-weight:600;font-size:17px;max-width:340px';n.textContent=Lg('Ролик уже закрыт, а награды нет? Можно не ждать: подтвердится просмотр — награду отдам.','The video is closed but no reward yet? No need to wait: once the view is confirmed, the reward is yours.');w.appendChild(n);
    const b=document.createElement('button');b.id='adExit';b.className='noenter';b.textContent=Lg('Продолжить без награды','Continue without the reward');b.style.cssText='margin-top:18px;min-height:52px;padding:12px 22px;border:0;border-radius:14px;background:#fff;color:#222;font:inherit;font-size:18px;cursor:pointer';b.onclick=exit;w.appendChild(b);}
  w.style.display='flex';}
// кнопки «за рекламу» гаснут, пока идёт пауза (окна перерисовываются — поэтому раз в секунду)
function adDim(){clearTimeout(adDimT);const off=Date.now()<adCoolT,q=adBtns();for(let i=0;i<q.length;i++){const b=q[i];
    if(off){b.style.opacity='.45';b.setAttribute('data-adoff','1');}else if(b.hasAttribute('data-adoff')){b.style.opacity='';b.removeAttribute('data-adoff');}}if(off)adDimT=setTimeout(adDim,1000);}
function adCool(){adCoolS=Date.now();adCoolT=adCoolS+AD_COOL_MS;adDim();adPreload('none');}
/* adt (04.10): обрыв ролика через 60 с. Раньше показ ждал ответа VK 60 с (vkSend(…,60000)), потом писал «недоступна», а поздний ответ «досмотрел» никто не слушал —
   на Android так кончалось каждое пятое нажатие: ролик посмотрен, награды нет. Теперь:
   1) ответа площадки ждём AD_WAIT_MS (180 с); игра всё это время на паузе «ad» (звук выключен, как при рекламе);
   2) ролик закрылся, а ответа нет: по знаку «игрок вернулся» (adBack: вкладка снова видна, окно получило фокус, VK вернул игру, нажатие по игре позже AD_TAP_MS)
      через AD_CHK_MS — надпись «Проверяем просмотр ролика…», через AD_EXIT_MS от знака — кнопка «Продолжить без награды». Знака нет — считаем им 60-ю секунду;
   3) вышли без ответа (кнопка или 180 с) — игра снята с паузы, onFail (если есть), но ответ слушаем дальше. Пришёл ПОЗДНИЙ «досмотрел» —
      награда один раз (тот же флаг paid) по правилу места: третий параметр showRewarded(cb,onFail,late). late() сам выдаёт награду, если она ещё уместна,
      иначе замену (adLateCoins(n) — золото по ПОЛНОЙ цене обещанного; цены в золоте нет — цена одного ролика adCoins() = гостинец Яги), и возвращает слова для надписи;
      вернул '' — выдавать нечего (награду уже получили другим роликом). Идёт другая реклама или игра свёрнута — поздняя награда ждёт. Поздний отказ — ничего не даём;
   4) статистика (секунды ожидания — поле w): ok c=slow — ответ пришёл на 60–180-й секунде; ok c=late — засчитано после выхода, ok c=latec — заменено золотом,
      ok c=late0 — выдавать было нечего; err c=timeout (w=180) / c=exit (вышел кнопкой) — ответ так и не пришёл (пишется через AD_LATE_MS после выхода или когда игру
      свернули; пришёл ответ ещё позже — событие с dup:1); fail c=late / skip c=late / err c=late:код — поздний отказ.
   Яндекс: таймера там не было (колбэки живут сами), добавлены та же надпись, выход и учёт — чтобы пауза не висела, если SDK не ответит.
   Образец — hobby-analytics/release-g/ads-timeout.md, раздел «ОБРАЗЕЦ». Числа — let, а не const: стенд их укорачивает. Новая кнопка рекламы — обязательно с late. */
let AD_WAIT_MS=180000,AD_SLOW_MS=60000,AD_CHK_MS=1500,AD_EXIT_MS=15000,AD_TAP_MS=5000,AD_LATE_MS=600000;
const adChkTxt=()=>Lg('Проверяем просмотр ролика…','Checking that the video was watched…');
let adW=null,adPl='',adLateC=0;const adLateQ=[];
/* место рекламы (STAT.place) запоминаем сами: позднее событие пишется, когда STAT его уже сбросил; модуль STAT не правим */
{const sp=STAT.place;STAT.place=function(p){adPl=String(p||'');return sp.apply(STAT,arguments);};}
/* позднее событие ролика (после выхода): ms — мс от нажатия (STAT v1.2; было w — секунды), x.p — место позднего события, x.dup — «ответ не пришёл» уже записано.
   Обычные итоги и slow — через STAT.ad (ms ставит модуль от STAT.adReq) */
function adStat(r,c,ms,x){const p={f:'rew',r:r,p:x&&x.p||adPl||'?',ms:ms};if(c!==''&&c!=null)p.c=String(c).slice(0,24);if(x&&x.dup)p.dup=1;if(x&&x.pr!=null)p.pr=x.pr;STAT.ev('ad',p);}
/* ожидание ответа: rel('timeout'|'exit') — отпустить игрока без ответа */
function adWatch(rel){adUnwatch();const w=adW={t0:Date.now(),back:0,rel:rel};w.tS=setTimeout(adBack,AD_SLOW_MS);w.tW=setTimeout(()=>{if(adW===w)rel('timeout');},AD_WAIT_MS);}
function adUnwatch(){const w=adW;if(!w)return;adW=null;clearTimeout(w.tS);clearTimeout(w.tW);clearTimeout(w.tC);clearTimeout(w.tE);adWait(0);}
function adBack(){const w=adW;if(!w||w.back)return;w.back=Date.now();
  w.tC=setTimeout(()=>{if(adW===w)adWait(1,adChkTxt());},AD_CHK_MS);
  w.tE=setTimeout(()=>{if(adW===w)adWait(1,adChkTxt(),()=>w.rel('exit'));},AD_EXIT_MS);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)adBack();else adLateFlush();});
window.addEventListener('focus',adBack);window.addEventListener('pagehide',adLateFlush);
['pointerdown','touchstart','keydown'].forEach(n=>document.addEventListener(n,()=>{if(adW&&Date.now()-adW.t0>=AD_TAP_MS)adBack();},true));
/* вышли без ответа: событие «так и не пришло» откладываем (вдруг придёт), но не дольше AD_LATE_MS и не дальше сворачивания игры */
function adLatePend(rec){adLateQ.push(rec);rec.tF=setTimeout(()=>adLateFin(rec),AD_LATE_MS);}
function adLateFin(rec){if(rec.fin||rec.hold)return;rec.fin=1;clearTimeout(rec.tF);const i=adLateQ.indexOf(rec);if(i>=0)adLateQ.splice(i,1);adStat('err',rec.exit?'exit':'timeout',rec.ms,{p:rec.p,pr:rec.pr});}
function adLateFlush(){adLateQ.slice().forEach(adLateFin);}
/* поздний ответ пришёл: r/c — что писать; после уже записанного «не пришло» отказ не пишем, а «досмотрел» пишем с dup */
function adLateEnd(rec,r,c){const dup=rec.fin;rec.fin=1;clearTimeout(rec.tF);const i=adLateQ.indexOf(rec);if(i>=0)adLateQ.splice(i,1);if(dup&&r!=='ok')return;
  adStat(r,c,Date.now()-rec.t0,{p:rec.p,dup:dup,pr:rec.pr});}
/* цена одного ролика в золоте — гостинец Яги за рекламу (giftGold, data.js) */
function adCoins(){return typeof giftGold==='function'?giftGold():40;}
/* замена награды, которая уже неуместна (бой кончился, окно закрыто): золото по ПОЛНОЙ цене обещанного (n); цены в золоте нет — цена одного ролика adCoins() */
function adLateCoins(n){n=n>0?Math.round(n):adCoins();adLateC=1;S.gold+=n;ern('ad',n);save();SND.coin();if(typeof setPills==='function')setPills();return Lg('держи золото: +','here is gold: +')+fmtGold(n);}
function adOther(){return adBusy||interBusy||!!PAUSE.ad||$('ad').classList.contains('on')||document.hidden;}
function showRewarded(cb0,onFail0,late0){
  if(adBusy)return;
  if(Date.now()<adCoolT){STAT.ad('rew','hold');toast(Lg('Ролик ещё загружается — подожди несколько секунд','The video is still loading — wait a few seconds'));if(onFail0)onFail0();adDim();return;} // STAT v1.2: нажатие по погасшей (место — от adOn)
  STAT.adReq('rew'); // STAT v1.2: нажатие → ms в итоговом ad
  adBusy=true;clearTimeout(showRewarded._t);showRewarded._t=setTimeout(()=>{adBusy=false;adWait(0);},AD_WAIT_MS*2+AD_RETRY_MS+15000);
  const t0=Date.now(),rec={p:adPl,t0:t0,fin:0};adPl='';if(VK&&adSt)rec.pr=adSt>0?1:0; /* pre: был ли ролик готов к нажатию */
  let paid=false,st=0; /* st: 0 — ждём ответ, 1 — ответ получен, 2 — игрока отпустили без ответа (слушаем поздний) */
  const cb=()=>{if(paid)return;paid=true;adBusy=false;cb0();},onFail=()=>{adBusy=false;onFail0&&onFail0();};
  const stat=(r,c)=>STAT.ad('rew',r,Date.now()-t0>=AD_SLOW_MS?c||'slow':c,{pr:rec.pr}); // STAT v1.2: ms ставит модуль; место живёт до итога; pre: pr — был ли ролик готов к нажатию (нужен STAT с 4-м параметром)
  const rel=why=>{if(st)return;st=2;rec.ms=Date.now()-t0;rec.exit=why==='exit';adUnwatch();adClose();adPreload('exit');
    onFail();adDim();toast(rec.exit?Lg('Хорошо. Подтвердится просмотр — награду отдам','All right. Once the view is confirmed, the reward is yours'):Lg('Не дождался ответа о просмотре. Придёт — награду отдам','No answer about the video yet. If it comes, the reward is yours'));adLatePend(rec);};
  const lateOk=()=>{if(paid)return;rec.hold=1;if(adOther()){setTimeout(lateOk,1000);return;} /* другая реклама или игра свёрнута — подождём (hold: «не пришло» уже не пишем) */
    paid=true;lastAdT=Date.now();adLateC=0;let m='';try{m=late0&&late0()||'';}catch(e){}
    adLateEnd(rec,'ok',m?(adLateC?'latec':'late'):'late0');if(m)toast(Lg('Просмотр подтвердился — ','The view is confirmed — ')+m);};
  // в VK мост не ответил — награду даром не даём; заглушка только для ?vk=1 на маке
  if(PLAT==='vk'&&!VK){if(VK_REAL){STAT.ad('rew','fail','nobridge');toast(AD_FAIL);onFail();}else{STAT.ad('rew','ok','stub');stubAd(cb);}return;}
  if(VK){
    let tries=0;
    const go=()=>{clearTimeout(adChkT);if(adSt>0){adSt=0;adMark();}adOpen();adWatch(rel);window.vkBridge.send('VKWebAppShowNativeAds',{ad_format:'reward'}).then(r=>{
        if(st===2){if(r&&r.result)lateOk();else adLateEnd(rec,'fail','late');return;}
        if(st)return;st=1;adUnwatch();adClose();
        if(r&&r.result){stat('ok',tries?'retry':'');adPreload('shown');cb();}else{stat('fail','noresult');toast(AD_FAIL);adPreload('fail');onFail();}
      },e=>{
        if(st===2){adLateEnd(rec,'err','late:'+adErrCode(e));return;}
        if(st)return;adUnwatch();
        if(adNoFill(e)&&!tries){tries=1;adWait(1);adPreload('retry');setTimeout(()=>{adWait(0);go();},AD_RETRY_MS);return;} // ролика нет — один тихий повтор; игра остаётся на паузе (adClose — после него)
        st=1;adClose();if(adNoFill(e)){stat('none',adErrCode(e));toast(adSoon());adCool();}else if(adUserClosed(e)){stat('err',adErrCode(e));toast(adSkipTxt());adPreload('err');}else{stat('err',adErrCode(e));toast(AD_FAIL);adPreload('err');}
        onFail();adDim();});}; // adDim: колбэк мог заново открыть окно с кнопкой — гасим её сразу
    go();return;}
  if(!ysdk){if(LOCAL){STAT.ad('rew','ok','stub');stubAd(cb);}else{STAT.ad('rew','fail','nosdk');toast(AD_FAIL);onFail();}return;}
  let got=false;adWatch(rel);
  /* поздние колбэки (после выхода): ролик мог открыться и поставить паузу — снимаем её, если не идёт другой ролик */
  const lateY=f=>{if(!adBusy)adClose();f();};
  try{ysdk.adv.showRewardedVideo({callbacks:{onOpen:()=>{if(st===2&&!adBusy)return;adOpen();},onRewarded:()=>{got=true;},
    onClose:()=>{if(st===2){lateY(()=>{if(got)lateOk();else adLateEnd(rec,'skip','late');});return;}if(st)return;st=1;adUnwatch();
      adClose();stat(got?'ok':'skip','');if(got)cb();else{toast(adSkipTxt());onFail();}},
    onError:()=>{if(st===2){lateY(()=>adLateEnd(rec,'err','late'));return;}if(st)return;st=1;adUnwatch();
      adClose();stat('err','');toast(AD_FAIL);adCool();onFail();}}});}
  catch(e){if(st)return;st=1;adUnwatch();adClose();STAT.ad('rew','err','throw');toast(AD_FAIL);onFail();}
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
function interPre(){if(!VK)return;try{vkSend('VKWebAppCheckNativeAds',{ad_format:'interstitial'}).then(r=>STAT.adChk('int',r&&r.result?1:0),()=>STAT.adChk('int',0));}catch(e){}}
/* STAT v1.2: итог межэкранной — show | none nofill (площадка не дала) | none nosdk (нет моста/SDK) | err (ошибка, c — код); положена, но не показана — adWhy() */
let lastIntT=0;
function showInterstitial(cb0){if(interBusy)return;interBusy=true;let done=false;
  const cb=(shown,c)=>{if(done)return;done=true;clearTimeout(t);interBusy=false;lastAdT=Date.now();
    if(shown===true){lastIntT=lastAdT;STAT.ad('int','show',c);}else if(shown==='err')STAT.ad('int','err',c);else STAT.ad('int','none',c||'nofill');cb0();};
  const t=setTimeout(()=>{if(PAUSE.ad)adClose();cb(false,'nofill');},90000);   // площадка не ответила — не держим игрока
  if(PLAT==='vk'&&!VK){if(VK_REAL)cb(false,'nosdk');else stubAd(()=>cb(true,'stub'));return;}
  STAT.adReq('int');
  if(VK){adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).then(r=>{adClose();interPre();cb(!(r&&r.result===false));},e=>{adClose();interPre();if(adNoFill(e))cb(false,'nofill');else cb('err',String(adErrCode(e)||'vk'));});return;}
  if(!ysdk){if(LOCAL)stubAd(()=>cb(true,'stub'));else cb(false,'nosdk');return;}
  try{ysdk.adv.showFullscreenAdv({callbacks:{onOpen:adOpen,onClose:s=>{adClose();cb(s!==false);},onError:()=>{adClose();cb('err','sdk');},onOffline:()=>cb(false,'nofill')}});}catch(e){adClose();cb('err','throw');}}
/* межэкранная положена (уход с итогов победы), но interReady() не пустил: рано после прошлой межэкранной — gap; после ролика за награду или в первые 5 минут захода — cap;
   нет моста/SDK — nosdk. Не пишем, если межэкранных нет совсем (no_ads, флаг inter=0, бот) или идёт другая реклама */
function adWhy(){if(!INTER_ON||adBusy||interBusy||typeof PAY!=='undefined'&&PAY.own('no_ads')||/[?&](bot|shot)/.test(location.search))return;
  const now=Date.now(),m=INTER_MIN*60e3;let c='';
  if(lastIntT&&now-lastIntT<m)c='gap';else if(now-lastAdT<m||now-sessT<5*60e3)c='cap';else if(!adOk())c='nosdk';
  if(c)STAT.ad('int','none',c);}
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
  vkOk(){return !!VK&&!OK;}, // ОК: VKWebAppShowLeaderBoardBox нет в списке — «Рекорды друзей» спрятаны
  vkFriends(score){if(!VK||OK)return;vkSend('VKWebAppShowLeaderBoardBox',{user_result:Math.floor(score)},60000).catch(e=>{
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
   ПОТОКОМ (09.10, было Web Audio с раскрытием в память ~30 МБ): два элемента <audio loop> → createMediaElementSource → свой GainNode → шина mus
   (образец — Покер deee321 / Гастроном). Два — чтобы смена трека шла кроссфейдом ~1 с. Файл в память не распаковывается.
   iOS: элементы создаются и первый раз запускаются только в жесте (musPrime — касание/клик/клавиша; тихий wav), дальше их можно включать из musTick.
   Если запуск всё же не разрешён (NotAllowed) — повторим на следующем жесте. Тихий <audio> и audioSession в <head> (бесшумный режим iPhone) — не трогать.
   Файл не загрузился — ещё 2 попытки через 20 с, дальше трек молчит. window.NO_MUSIC (архив без audio/ для хостинга VK) — треки не просим вовсе (нет 404).
   musTick() раз в 200 мс сам включает, меняет и глушит (S.music, реклама/пауза площадки — muted/paused, сворачивание);
   после паузы трек продолжается с того же места, смена трека — с начала. Громкость — MUS_VOL × MUS_TV (Market Day на 7 дБ громче остальных). */
const MUSF={market:'audio/market.m4a',battle:'audio/battle.m4a',boss:'audio/boss.m4a'},MUS_VOL=.3,MUS_TV={market:.45,battle:1,boss:.85};
const MUS_SIL='data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
const MUS={mode:'menu',el:[],cur:-1,fail:{},retry:{},blk:0};
function musPref(){return MUS.mode!=='battle'?'market':typeof G!=='undefined'&&G&&G.boss&&!G.boss.dead?'boss':'battle';}
function musWant(){if(window.NO_MUSIC||!S.music||muted||paused||document.hidden)return null;const n=musPref();
  if((MUS.fail[n]||0)>=3||performance.now()<(MUS.retry[n]||0))return null;return n;}
function musicMode(m){MUS.mode=m;musTick();}
function musicSync(){musTick();}
function musicStop(){musTick();}
function musVol(n){return MUS_VOL*(MUS_TV[n]||1);}
// громкость слота: плавно (AC идёт и есть GainNode) или сразу
function musGain(o,v,fade){o.v=v;if(o.g&&AC){try{const t=AC.currentTime,g=o.g.gain;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(v,t+fade);return;}catch(e){}}
  try{o.a.volume=Math.max(0,Math.min(1,v));}catch(e){}}
function musPlay(o){try{const p=o.a.play();if(p&&p.then)p.then(()=>{MUS.blk=0;if(!o.on)o.a.pause();},e=>{if(e&&e.name==='NotAllowedError')MUS.blk=1;});}catch(e){}}
function musOff(o,fade){if(!o.on)return;o.on=0;musGain(o,0,fade);clearTimeout(o.tm);
  const run=AC&&AC.state==='running'&&o.g;if(!run){try{o.a.pause();}catch(e){}return;}
  o.tm=setTimeout(()=>{if(!o.on)try{o.a.pause();}catch(e){}},fade*1000+80);}
function musOn(o,n,fade){clearTimeout(o.tm);
  if(o.n!==n){o.n=n;o.a.src=MUSF[n];try{o.a.load();}catch(e){}}
  o.on=1;if(o.g&&AC)try{o.g.gain.setValueAtTime(o.v||0,AC.currentTime);}catch(e){}musGain(o,musVol(n),fade);if(o.a.paused)musPlay(o);}
// в жесте: создать оба элемента (тихий wav — «разрешение» iOS) или повторить запрет на запуск
function musPrime(){if(window.NO_MUSIC)return;
  if(!MUS.el.length){const a0=ac();if(!a0||!BUS)return;
    for(let i=0;i<2;i++){const a=new Audio();a.loop=true;a.preload='auto';a.setAttribute('playsinline','');let g=null;
      try{const s=a0.createMediaElementSource(a);g=a0.createGain();g.gain.value=0;s.connect(g).connect(BUS.mus);}catch(e){g=null;}
      const o={a,g,n:null,on:0,v:0,tm:0};
      a.addEventListener('error',()=>{const n=o.n;if(!n||!a.src||a.src.indexOf(MUSF[n])<0)return;o.n=null;o.on=0;
        MUS.fail[n]=(MUS.fail[n]||0)+1;MUS.retry[n]=performance.now()+20000;try{a.removeAttribute('src');a.load();}catch(e){}});
      a.src=MUS_SIL;musPlay(o);MUS.el.push(o);}}
  else if(MUS.blk){const o=MUS.el[MUS.cur];if(o&&o.on&&o.a.paused)musPlay(o);}
  musTick();}
function musTick(){if(!MUS.el.length)return;const n=musWant(),run=AC&&AC.state==='running';
  if(n&&!run&&!muted&&AC){try{AC.resume().catch(()=>{});}catch(e){}}
  const cur=MUS.el[MUS.cur];
  if(!n||!run){for(const o of MUS.el)musOff(o,.4);return;}   // выключено/пауза: элементы на паузе, место запомнят сами
  if(cur&&cur.n===n){if(!cur.on)musOn(cur,n,.6);else if(cur.a.paused&&!MUS.blk)musPlay(cur);return;}
  // смена трека: новый — в свободный элемент (с начала), старый — затихает
  const i=MUS.el.findIndex(o=>o.n===n),k=i>=0?i:(MUS.cur===0?1:0),o=MUS.el[k];
  for(const x of MUS.el)if(x!==o)musOff(x,1);
  if(i>=0&&!o.on){try{o.a.currentTime=0;}catch(e){}}
  MUS.cur=k;musOn(o,n,1);}
for(const t of['touchend','click','keydown'])document.addEventListener(t,musPrime,{capture:true,passive:true});
setInterval(musTick,200);

/* ================= тост ================= */
let toastT=0;
// держится не меньше 2,5 с: 1 с + 60 мс на знак
function toast(s){s=langToast(s);const t=$('toast');t.textContent=s;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),Math.max(2500,1000+60*String(s).length));}
