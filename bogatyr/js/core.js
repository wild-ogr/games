'use strict';
/* ================= утилиты ================= */
const $=id=>document.getElementById(id);
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a,b)=>a+Math.random()*(b-a);
const randi=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
function hash(x,y,s){let h=(x*374761393+y*668265263+s*982451653)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
// a>0 — светлее, a<0 — темнее
function shade(hex,a){let n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;
  if(a>0){r+=(255-r)*a;g+=(255-g)*a;b+=(255-b)*a;}else{r*=1+a;g*=1+a;b*=1+a;}
  return 'rgb('+(r|0)+','+(g|0)+','+(b|0)+')';}
function rgba(hex,al){const n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+al+')';}
function fmtTime(t){t=Math.max(0,Math.floor(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}
function fmtNum(n){return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g,LANG==='en'?',':' ');} // 1 000 / 1,000
function dec(v,n){return LANG==='en'?v.toFixed(n):v.toFixed(n).replace('.',',');} // дробь: 1,45 / 1.45

/* ================= площадка: Яндекс Игры или VK =================
   VK передаёт в адрес игры параметры запуска (vk_app_id и др.); ?vk=1 — проверка VK-режима на маке */
const PLAT=/[?&](vk_app_id|vk)=/.test(location.search)?'vk':'yandex';
const OK=PLAT==='vk'&&/[?&](vk_client=ok|vk_platform=[a-z_]*_ok|ok=1)(&|$)/.test(location.search);
const OK_LINK='https://ok.ru/game/512005580574'; // ссылка на игру в ОК (пусто — «Поделиться» в ОК спрятано)
// своя машина (localhost) — там вместо рекламы заглушка; на площадке без SDK награды даром нет
const LOCAL=location.protocol==='file:'||/^(localhost|127\.0\.0\.1|\[::1\]|.*\.local|.*\.localhost)$/.test(location.hostname);
let ysdk=null,YP=null,VK=null,paused=false,muted=false,adShowing=false;
/* время (27.09, аудит 12): казна и Дар Жар-птицы — не по часам телефона, чтобы перевод часов вперёд не давал золото.
   srvMs(): Яндекс — ysdk.serverTime(), иначе часы устройства (мак, SDK ещё грузится).
   nowMs() — для золота: в VK сервера нет, но есть vk_ts (время сервера VK при запуске, в параметрах адреса) — часы устройства
   принимаем, только если они не убежали вперёд больше чем на 10 мин от «vk_ts + сколько прошло с запуска».
   dayMs() — для смены дня (задания, вход, поход дня): Яндекс — сервер, VK — часы устройства (vk_ts может отставать после сна телефона) */
const T0P=performance.now(),VK_TS=(function(){const m=/[?&]vk_ts=(\d+)/.exec(location.search);return m?+m[1]*1000:0;})();
function srvMs(){try{if(ysdk&&ysdk.serverTime){const t=ysdk.serverTime();if(typeof t==='number'&&t>1.6e12)return t;}}catch(e){}return 0;}
function nowMs(){const t=srvMs();if(t)return t;if(VK_TS>1.6e12)return Math.min(Date.now(),VK_TS+(performance.now()-T0P)+600000);return Date.now();}
function dayMs(){const t=srvMs();if(t)return t;if(VK_TS>1.6e12)return Math.min(Date.now(),VK_TS+(performance.now()-T0P)+12*3600e3);return Date.now();} // VK: не дальше 12 ч вперёд от запуска (перевод даты не даёт новый день)

/* ================= сохранение =================
   localStorage — сразу. Облако (Яндекс: player.setData, VK: VKWebAppStorage) — ТОЛЬКО после того, как облако прочитано
   и слито с тем, что на устройстве (cloudReady). Слияние, а не замена: прогресс — максимум/объединение,
   золото — облако + заработанное здесь с последней сверки (cloudBase — сколько золота лежит в облаке). */
const SKEY='bogatyr-v1';
function freshSave(){return {v:1,ts:0,gold:0,forge:{},village:{},armory:{},done:{},best:{},endBest:0,afkT:0,hero:'dob',sound:1,music:1,vm:.6,vs:.8,runs:0,kills:0,gift:0,tut:0};}
let S=freshSave();
try{const r=localStorage.getItem(SKEY);if(r){const o=JSON.parse(r);if(o&&typeof o==='object'&&!Array.isArray(o))S=Object.assign(S,o);}}catch(e){}
/* Оружейная: растяжка 07.10 (PROG.md) — было 5 ур. по +10 % урона (+10 % размаха на 3/5), стало 10 ур. по +4,5 % (+5 % размаха на 4/7/10).
   Старый уровень → новый с тем же или большим эффектом: 1→3, 2→5, 3→7, 4→9, 5→10 + «старый бонус» armL[id]=1 (пол +50 % урона, +20 % размаха).
   Сейв: S.armV=2 — уже новые уровни. Облако без armV мигрирует перед слиянием (mergeProgress). Значение >5 в старом сейве — уже новый уровень (не трогаем). */
const ARM_OLD=[0,3,5,7,9,10];
function armMig(arm,leg){for(const k in arm){const o=Math.floor(+arm[k]||0);if(o<=0||o>5)continue;arm[k]=ARM_OLD[o];if(o===5&&leg)leg[k]=1;}}
function fixSave(){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);
  for(const k of['forge','village','armory','armL','done','best','rank','bought','stats','bossKill','evoSeen','skins','skin','ach','meet','bk','ask','stars','dfc'])if(!ob(S[k]))S[k]={};
  if(S.armV!==2){armMig(S.armory,S.armL);S.armV=2;} // Оружейная 5 → 10 ур. (см. armMig)
  // уровни сложности (difficulty 05.10): S.dfc — выбор {глава:'n'|'s'|'h'}; победы и звёзды уровней — в S.stars (Обычная — без приставки, Сложная 's', Адская 'h')
  for(const i in S.done)if(S.done[i])S.stars[i+'w']=1; // звёзды глав (boost 2): пройденной главе — первая звезда Обычной; старые сейвы: всё пройденное → Обычная, в этих главах сразу открыта Сложная
  if(typeof S.gold!=='number'||!isFinite(S.gold))S.gold=0;if(!S.afkT)S.afkT=nowMs();if(typeof S.th!=='string')S.th=''; // S.th — тема оформления (js/look.js), '' = основная
  for(const k of['payT','payV'])if(S[k]!=null&&!Array.isArray(S[k]))S[k]=[];if(S.buy!=null&&!ob(S.buy))S.buy={};if(S.buyB!=null&&!ob(S.buyB))S.buyB={}; // покупки (js/pay.js)
  if(typeof META_HK==='function')META_HK('FIX',S);} /* мета «Подворье»: починка своих ключей (при самой первой загрузке META_HK ещё нет — meta.js чинит S сам при загрузке) */
fixSave();
const BOOT={ts:S.ts||0,fresh:!S.ts}; // что было на этом устройстве при запуске
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
// STAT — своя ОБЕЗЛИЧЕННАЯ статистика (hobby-analytics/stat): без vk_user_id, IP и постоянного номера; выключатель — ⚙ «Анонимная статистика».
// Адрес боевой; на маке/LAN/в headless модуль молчит сам (03.10). ?stat=dev на localhost — журнал [STAT] в консоль без отправки.
// S: облако ЗАМЕНЯЕТ объект S (mergeSave) — модулю даём «окно» в текущий S (отметки stc всегда пишутся в живое сохранение)
const STAT_URL='https://functions.yandexcloud.net/d4efqgmii6honbajplim?op=ev';
STAT.init({g:'bogatyr',gv:'v23-100721',plat:PLAT,lang:LANG,url:STAT_URL,now:()=>nowMs(),S:{get stc(){return S.stc;},set stc(v){S.stc=v;}}});
// STAT v1.2 (04.10): ern — откуда золото (lvl поход, ad ролик, gift подарок/вход, chest сундук дня, buy покупка, quest задания/достижения, oth казна и прочее);
// statProg — прогресс на входе (pl: пройдено глав, cn: золото, bt: облако хоть раз отдало сохранение — метка устройства bogatyr-cl) + cfg; после облака, не позже 2,5 с
function ern(s,n){n=Math.round(n);if(n>0)STAT.earn(s,n);}
let statPr=false;
function statProg(cl){if(cl)try{localStorage.setItem('bogatyr-cl','1');}catch(e){}if(statPr)return;statPr=true;let bt=0;try{bt=localStorage.getItem('bogatyr-cl')?1:0;}catch(e){}
  STAT.progress({pl:Object.keys(S.done||{}).length,cn:Math.floor(S.gold||0),bt:bt});STAT.bal(Math.floor(S.gold||0));
  const c={snd:S.sound?1:0,calm:S.calm?1:0};try{if(window.LOOK&&LOOK.cur)c.th=String(LOOK.cur());}catch(e){}STAT.cfg(c);}
setTimeout(()=>statProg(0),2500);
let loginMerge=false,cloudBase=S.gold||0,cloudReady=false,cloudPending=null,cloudT=0,cloudLast=0,cloudBusy=false;
const CLOUD_GAP=PLAT==='vk'?15000:3500; // VK — не чаще раза в 15 с; Яндекс — лимит 100 записей за 5 мин
function save(){S.ts=Date.now();STAT.bal(Math.floor(S.gold||0));try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}cloudQueue();}
function cloudQueue(){if(!cloudReady||cloudPending||cloudT)return;cloudT=setTimeout(cloudSave,Math.max(2000,CLOUD_GAP-(Date.now()-cloudLast)));}
function cloudSave(now){clearTimeout(cloudT);cloudT=0;if(!cloudReady||cloudPending)return;
  if(cloudBusy&&!(now&&YP)){cloudT=setTimeout(cloudSave,2000);return;}
  const str=JSON.stringify(S),gold=S.gold;cloudLast=Date.now();
  try{if(YP){cloudBusy=true;YP.setData(JSON.parse(str),!!now).then(()=>{cloudBase=gold;},()=>{}).then(()=>{cloudBusy=false;});}
    else if(PLAT==='vk'&&VK){cloudBusy=true;vkSaveCloud(str).then(ok=>{if(ok)cloudBase=gold;cloudBusy=false;});}}catch(e){cloudBusy=false;}}
function cloudFlush(){if(cloudReady&&!cloudPending)cloudSave(true);} // сворачивание — сразу
// слияние: d — облако, L — это устройство; useCloud — настройки брать из облака
function mergeProgress(d,loc,useCloud){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{},o=Object.assign(freshSave(),JSON.parse(JSON.stringify(loc)));
  if(d.armV!==2){d=Object.assign({},d,{armory:Object.assign({},ob(d.armory)),armL:Object.assign({},ob(d.armL))});armMig(d.armory,d.armL);} // облако старой версии: Оружейная → новые уровни до максимума
  if((ob(loc).armV|0)!==2){o.armory=Object.assign({},ob(o.armory));o.armL=Object.assign({},ob(o.armL));armMig(o.armory,o.armL);}o.armV=2;
  const mx=k=>{const a=Object.assign({},ob(o[k])),b=ob(d[k]);for(const i in b)if(typeof b[i]==='number')a[i]=Math.max(+a[i]||0,b[i]);o[k]=a;};
  for(const k of['forge','village','armory','armL','rank','best','bk','stats'])mx(k);
  for(const k of['done','bought','bossKill','evoSeen','skins','ach','meet','ask','stars','mapSeen'])o[k]=Object.assign({},ob(d[k]),ob(o[k]));
  {const a=ob(o.lairL),b=ob(d.lairL),m={};for(const s in Object.assign({},a,b))if(!o.done[s])m[s]=Math.max(a[s]|0,b[s]|0);o.lairL=m;} /* поблажка Логова: максимум, пройденное — стёрто */
  for(const k of['endBest','runs','kills','bosses','curseMax','eco','gift','tut','nb'])o[k]=Math.max(+o[k]||0,+d[k]||0);
  for(const k in d)if(/^seen\d+$/.test(k)&&d[k])o[k]=1;
  o.afkT=BOOT.fresh?(+d.afkT||o.afkT):Math.max(+o.afkT||0,+d.afkT||0);
  o.gold=Math.max(0,Math.round((+d.gold||0)+((+loc.gold||0)-cloudBase)));
  if(loginMerge){loginMerge=false;o.gold=Math.max(o.gold,Math.round(+loc.gold||0));} // гость вошёл в аккаунт: золото гостя не «пропадает» — берём большее
  const later=(a,b)=>!a?b:!b?a:(b.last>a.last||b.last===a.last&&(b.n||0)>(a.n||0))?b:a;
  o.login=later(ob(o.login).last?o.login:null,ob(d.login).last?d.login:null)||o.login;o.streak=later(ob(o.streak).last?o.streak:null,ob(d.streak).last?d.streak:null)||o.streak;
  const ab=ob(o.afkBoost),db=ob(d.afkBoost);if(db.day&&(!ab.day||db.day>ab.day))o.afkBoost=db;else if(db.day&&db.day===ab.day)o.afkBoost={day:ab.day,n:Math.max(ab.n||0,db.n||0)};
  const aq=ob(o.dq),dq=ob(d.dq);if(dq.day&&Array.isArray(dq.list)){if(!aq.day||dq.day>aq.day)o.dq=dq;else if(dq.day===aq.day&&Array.isArray(aq.list)){
    aq.list.forEach((x,i)=>{const y=dq.list[i];if(y&&y.id===x.id){x.p=Math.max(x.p||0,y.p||0);x.c=Math.max(x.c||0,y.c||0);}});aq.bonus=Math.max(aq.bonus||0,dq.bonus||0);}}
  const ar=ob(o.dr),dr=ob(d.dr);if(dr.day&&(!ar.day||dr.day>ar.day))o.dr=dr;else if(dr.day&&dr.day===ar.day)for(const k of['best','got','runs'])ar[k]=Math.max(ar[k]||0,dr[k]||0); // поход дня
  const aw=ob(o.wk),dw=ob(d.wk);if(dw.w&&(!aw.w||dw.w>aw.w))o.wk=dw;else if(dw.w&&dw.w===aw.w)for(const k of['best','got','runs'])aw[k]=Math.max(aw[k]||0,dw[k]||0);
  if(useCloud)for(const k of['hero','skin','curse','dfc','sound','music','vm','vs','calm','vib','th'])if(k in d)o[k]=d[k];
  if(typeof payMerge==='function')payMerge(d,o); // покупки (js/pay.js): купленное — объединение
  if(typeof TRO_MERGE==='function')TRO_MERGE(d,o); /* трофеи меты */
  if(typeof META_HK==='function')META_HK('MERGE',d,o); /* мета «Подворье»: свои ключи S.yard/S.tro/… — максимум/объединение */
  o.ts=Math.max(+o.ts||0,+d.ts||0);return o;}
function mergeSave(d){if(!d||typeof d!=='object'||Array.isArray(d)||!d.ts)return false;
  const soc=S.soc;S=mergeProgress(d,S,BOOT.fresh||d.ts>(S.ts||0));if(soc&&typeof soc==='object'){S.soc=soc;if(typeof SOC!=='undefined')SOC.merge(d.soc);} // «Друзья и игры»: тот же объект (модуль держит ссылку), облако — слиянием
  STAT.merge(d.stc); // статистика: день установки — раньше, сеансов — больше
  fixSave();cloudBase=+d.gold||0;BOOT.fresh=false;return true;}
// облако прочитано: d — сохранение из облака или null (облако пустое). Во время похода — ждём возврата в меню (cloudApply)
function cloudIn(d){if(typeof G!=='undefined'&&G){cloudPending={d};return;}applyCloud(d);}
function applyCloud(d){cloudPending=null;let changed=false;
  try{changed=mergeSave(d);}catch(e){console.warn('cloud merge',e);return;} // не слилось — в облако не пишем
  loginMerge=false;cloudReady=true;save();statProg(d&&d.ts?1:0);if(changed&&typeof onCloud==='function')onCloud();}
function cloudApply(){if(cloudPending&&!(typeof G!=='undefined'&&G))applyCloud(cloudPending.d);}
function withTimeout(p,ms){return Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms))]);}
// Яндекс: читаем облако с таймаутом; не вышло — повторяем (3 раза через 10 с, дальше раз в минуту)
async function yCloud(n){if(!ysdk)return;
  try{if(!YP)YP=await withTimeout(ysdk.getPlayer({scopes:false}),10000);const d=await withTimeout(YP.getData(),10000);cloudIn(d&&d.ts?d:null);}
  catch(e){setTimeout(()=>yCloud(Math.max(0,n-1)),n>0?10000:60000);}}
const YG={
  start(){try{ysdk&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.start();}catch(e){}},
  stop(){try{ysdk&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.stop();}catch(e){}}
};
function loadScript(src,ms){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);setTimeout(no,ms||20000);});}
// ответ VK с ограничением по времени (вне VK мост не отвечает)
function vkSend(method,params,ms){return Promise.race([window.vkBridge.send(method,params||{}),new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms||4000))]);}
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
/* VK хранит значение до 4096 байт: режем на куски по 1800 символов. Два набора кусков (sa… и sb…) по очереди:
   пишем новый набор ПОСЛЕДОВАТЕЛЬНО, «оглавление» svn = набор:кусков:длина — строго последним. Пока новый набор не дописан,
   старый цел. Старый формат (sv*, svn = число кусков) читается. Битое облако ≠ пустое: не пишем, читаем ещё раз. */
const VK_CHUNK=1800,VK_MAXCH=60;let vkBuf='sv';
function vkKV(r){const m={};(r&&r.keys||[]).forEach(k=>m[k.key]=k.value);return m;}
async function vkLoadCloud(){const h=vkKV(await vkSend('VKWebAppStorageGet',{keys:['svn']})).svn||'';if(!h)return {empty:true};
  const q=h.split(':');let p='sv',n=+h,len=-1;if(q.length===3){p=q[0];n=+q[1];len=+q[2];}
  if(!(n>0&&n<=VK_MAXCH))throw new Error('bad');const keys=[];for(let i=0;i<n;i++)keys.push(p+i);
  const m=vkKV(await vkSend('VKWebAppStorageGet',{keys}));let str='';for(const k of keys){if(!m[k])throw new Error('bad');str+=m[k];}
  if(len>=0&&str.length!==len)throw new Error('bad');let d;try{d=JSON.parse(str);}catch(e){throw new Error('bad');}
  if(!d||typeof d!=='object')throw new Error('bad');vkBuf=p;return {d};}
async function vkSaveCloud(str){const n=Math.ceil(str.length/VK_CHUNK);if(!n||n>VK_MAXCH)return false;const p=vkBuf==='sa'?'sb':'sa';
  try{for(let i=0;i<n;i++)await vkSend('VKWebAppStorageSet',{key:p+i,value:str.slice(i*VK_CHUNK,(i+1)*VK_CHUNK)},6000);
    await vkSend('VKWebAppStorageSet',{key:'svn',value:p+':'+n+':'+str.length},6000);vkBuf=p;return true;}catch(e){return false;}}
// битое облако: ещё 2 попытки через 10 с; не помогло — если на устройстве есть прогресс, пишем своё (битое облако всё равно не прочесть)
async function vkCloudInit(tries){try{const r=await vkLoadCloud();cloudIn(r.empty?null:r.d);}
  catch(e){if(tries>0)setTimeout(()=>vkCloudInit(tries-1),10000);else if(e.message==='bad'&&S.runs>0)cloudIn(null);else setTimeout(()=>vkCloudInit(1),60000);}}
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
async function initSDK(){
  if(PLAT==='vk'){
    // меню уже показано, мост VK и облако догружаем следом (VKWebAppInit может отвечать секунды)
    let cl=null;
    try{if(!window.vkBridge)await loadScript('js/vk-bridge.min.js').catch(function(){return new Promise(function(r){setTimeout(r,1500);}).then(function(){return window.vkBridge||loadScript('js/vk-bridge.min.js?r=2');});});
      await vkSend('VKWebAppInit',{},20000);VK=window.vkBridge;
      if(typeof SOC!=='undefined'){SOC.ready();updMore();} // «Друзья и игры» (только VK с мостом)
      adPreload('boot'); // pre: подгрузка ролика за награду сразу после моста (облако не ждём); «нет» — переспрашиваем в фоне
      adRedraw();vkFitInit(); // VK web: подогнать высоту окна под экран (без ожидания)
      VK.subscribe(e=>{const t=e.detail&&e.detail.type;
        if(t==='VKWebAppViewHide'){adHid=true;paused=true;setMuted(true);cloudFlush();}
        else if(t==='VKWebAppViewRestore'){adHid=false;if(!adShowing){paused=false;setMuted(false);}adBack();setTimeout(adBackChk,300);}});
      cl=vkCloudInit(2);
      vkSend('VKWebAppCheckNativeAds',{ad_format:'interstitial'}).then(r=>STAT.adChk('int',r&&r.result?1:0),()=>STAT.adChk('int',0));
    }catch(e){VK=null;}
    try{await cl;}catch(e){}
    if(typeof PAY!=='undefined'&&!OK)PAY.init(); // ОК: покупки в «ОКах», сервер не готов → PAY.on=false, кнопок и окон покупок нет. покупки VK (js/pay.js): после моста и облака (на маке без моста — только ?vk=1&paytest=1)
    return;
  }
  // Яндекс: меню тоже уже показано — SDK и облако догружаем следом
  if(window.YaGames){
    try{ysdk=await YaGames.init();
      try{langFromSDK(ysdk.environment.i18n.lang);}catch(e){} // язык Яндекса (js/i18n.js): главнее догадки, но не выбора игрока
      ysdk.on&&ysdk.on('game_api_pause',()=>{paused=true;setMuted(true);});
      ysdk.on&&ysdk.on('game_api_resume',()=>{if(adShowing)return;paused=false;setMuted(false);});
    }catch(e){ysdk=null;}
    if(ysdk&&typeof G!=='undefined'&&G&&!G.over&&!G.paused)YG.start(); // первый поход начался раньше, чем пришёл SDK
    try{ysdk&&ysdk.getFlags&&ysdk.getFlags().then(applyFlags).catch(()=>{});}catch(e){} // флаги из консоли Яндекса (межэкранная)
  }
  try{ysdk&&ysdk.features.LoadingAPI&&ysdk.features.LoadingAPI.ready();}catch(e){}
  sdkDone=true;if(!ysdk)adRedraw();if(ysdk)yCloud(3);else if(LOCAL)cloudReady=true; // на маке без SDK облака нет — только localStorage
  if(typeof PAY!=='undefined')PAY.init(); // покупки Яндекса (js/pay.js): постоянные — флаги, облако их объединит
}
let sdkDone=false;
/* Реклама (решение владельца 27.09): за награду — по желанию игрока; межэкранная — мягко, только между походами (interAfterRun).
   Межэкранная: после экрана итогов, со 2-го похода за всё время (решение 02.10; было с 4-го), не после первого похода захода, не чаще раза в 4 мин от ЛЮБОЙ рекламы,
   поход не короче 45 с; под флагами Яндекса (ADV). Никогда — посреди похода, при запуске, в первом походе. */
const VK_REAL=/[?&]vk_app_id=/.test(location.search);
const ADV={on:true,gap:4,from:2,sess:0,last:0}; // from: решение владельца 02.10 — со 2-го похода за всё время (было 4)
try{ADV.last=+localStorage.getItem('bogatyr-ad')||0;}catch(e){}
// флаги: inter = 0/off — выключить; inter_gap — минут между рекламой (2–30); inter_from — с какого похода (2–30). Чужие значения не берём
function applyFlags(f){if(!f||typeof f!=='object')return;const num=(k,a,b)=>{const n=parseInt(f[k],10);return isFinite(n)&&n>=a&&n<=b?n:null;};let n;
  if(f.inter==='0'||f.inter==='off')ADV.on=false;else if(f.inter==='1'||f.inter==='on')ADV.on=true;
  if((n=num('inter_gap',2,30))!==null)ADV.gap=n;if((n=num('inter_from',2,30))!==null)ADV.from=n;}
function adMark(){ADV.last=Date.now();try{localStorage.setItem('bogatyr-ad',String(ADV.last));}catch(e){}}
// поход закончен и итоги забраны: показать межэкранную? (runT — длина похода, с). Считает походы захода — звать ровно раз за поход
function interReady(runT){ADV.sess++;const now=Date.now();if(ADV.last>now)adMark(); // часы перевели назад — отсчёт заново
  if(typeof PAY!=='undefined'&&PAY.own('no_ads'))return false; // куплено «Без рекламы между походами»
  if(!ADV.on||S.runs<ADV.from||ADV.sess<2||!(runT>=45)||adBusy||adShowing)return false;
  // STAT v1.2: положена, но не показана — ad int none: gap — рано после прошлой межэкранной, cap — рано после ролика за награду, nosdk — нет SDK/моста
  if(now-ADV.last<ADV.gap*60000){STAT.ad('int','none',now-lastIntT<ADV.gap*60000?'gap':'cap');return false;}
  const ok=PLAT==='vk'?!!VK||(!VK_REAL&&LOCAL):!!ysdk||LOCAL; // в настоящем VK без моста — нет; ?vk=1 на маке — заглушка
  if(!ok)STAT.ad('int','none','nosdk');return ok;}
let lastIntT=0; // когда была последняя межэкранная (в этом заходе) — отличить gap от cap
// STAT v1.2: adReq('int') перед показом (→ ms); итоги: show | none nofill (площадка не дала) | none nosdk (нет SDK/моста) | err (код/причина)
function showInterstitial(cb0){let done=false;const cb=()=>{if(done)return;done=true;adMark();if(cb0)cb0();};lastIntT=Date.now();
  if(PLAT==='vk'&&!VK){if(!VK_REAL&&LOCAL){STAT.adReq('int');STAT.ad('int','show','stub');stubAd(cb);}else{STAT.ad('int','none','nosdk');cb();}return;}
  if(VK){adOpen();STAT.adReq('int');vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).then(r=>{if(r&&r.result)STAT.ad('int','show');else STAT.ad('int','none','nofill');},e=>{if(adNoFill(e))STAT.ad('int','none','nofill');else STAT.ad('int','err',adErrCode(e));}).then(()=>{adClose();cb();vkSend('VKWebAppCheckNativeAds',{ad_format:'interstitial'}).then(r=>STAT.adChk('int',r&&r.result?1:0),()=>STAT.adChk('int',0));});return;}
  if(!ysdk){if(LOCAL){STAT.adReq('int');STAT.ad('int','show','stub');stubAd(cb);}else{STAT.ad('int','none','nosdk');cb();}return;}
  STAT.adReq('int');
  try{ysdk.adv.showFullscreenAdv({callbacks:{onOpen:adOpen,onClose:w=>{adClose();if(w!==false)STAT.ad('int','show');else STAT.ad('int','none','nofill');cb();},onError:()=>{adClose();STAT.ad('int','err','sdk');cb();},onOffline:()=>{adClose();STAT.ad('int','err','offline');cb();}}});}catch(e){adClose();STAT.ad('int','err','ex');cb();}}
// будет ли межэкранная после этих итогов (как interReady, но без счёта походов) — чтобы не предлагать «Друзья и игры» перед роликом
function interPeek(runT){const now=Date.now();if(typeof PAY!=='undefined'&&PAY.own('no_ads'))return false;
  if(!ADV.on||S.runs<ADV.from||ADV.sess+1<2||!(runT>=45)||now-ADV.last<ADV.gap*60000)return false;return PLAT==='vk'?!!VK||(!VK_REAL&&LOCAL):!!ysdk||LOCAL;}
function stubAd(cb){const ad=$('ad'),tEl=$('adT');ad.classList.add('on');adOpen();let n=3;tEl.textContent=n;
  const it=setInterval(()=>{n--;tEl.textContent=n;if(n<=0){clearInterval(it);ad.classList.remove('on');adClose();cb();}},600);}
// можно ли показать рекламу: без SDK/моста кнопок «за рекламу» не рисуем (иначе нажатие даёт только «недоступна»); пока SDK Яндекса грузится — кнопки есть
function adOk(){if(PLAT==='vk')return !!VK||(!VK_REAL&&LOCAL);return !!ysdk||LOCAL||!sdkDone;}
// SDK/мост пришёл или не пришёл — перерисовать открытую вкладку (кнопки рекламы)
function adRedraw(){setTimeout(()=>{try{if(typeof langRedraw==='function'&&!$('modal').classList.contains('on'))langRedraw();}catch(e){}},0);}
function adOpen(){adShowing=true;paused=true;setMuted(true);YG.stop();}
function adClose(){adShowing=false;adMark();paused=document.hidden;setMuted(document.hidden);if(G&&!G.over&&!G.paused&&!G.pauseOpen&&!$('modal').classList.contains('on'))YG.start();} // окно или пауза открыты — start() вызовет их закрытие
function adFail(){return L('Реклама сейчас недоступна, попробуй позже','Ad unavailable right now, try again later');}
/* adfix (03.10): «ролика нет» — VK отвечает ошибкой 20 ('No ads'), чаще всего на компьютере: ролик ещё не подгрузился, готов он бывает через 10–60 с.
   Раньше игрок видел «недоступна» и жал кнопку по 5–10 раз. Теперь:
   1) отказ «ролика нет» → один тихий автоповтор через AD_RETRY_MS под надписью «Ролик загружается…» (игра на паузе, нажать ничего нельзя);
   2) снова нет → не ошибка, а «Ролик будет через несколько секунд…»; кнопки «за рекламу» (AD_BTN_SEL) гаснут, игра в фоне раз в AD_POLL_MS спрашивает VK (Check);
      VK ответил «готов» (но не раньше AD_COOL_MIN) → кнопки загораются и «Ролик готов»; ответа нет — загораются сами через AD_COOL_MS.
      Нажатие по погасшей кнопке VK не дёргает — только «ещё загружается».
   3) заранее: Check при запуске и после каждого показа; если VK сказал «не готов» — переспрашиваем в фоне, пока не станет «готов» (см. pre ниже).
   Ответу Check «не готов» как запрету не верим (бывает ложным) — кнопку из-за него не гасим. Автоповтор — только на «ролика нет», не на закрытый ролик.
   Награда — по-прежнему только за досмотр (result:true / onRewarded) и один раз. Статистика: ok+c='retry' — спас автоповтор; none — ролика не было и после повтора.
   Тот же приём — во всех играх (журнал hobby-analytics/release-f/ads-fail.md, раздел «ОБРАЗЕЦ»). */
const AD_RETRY_MS=3000,AD_COOL_MS=30000,AD_COOL_MIN=8000,AD_POLL_MS=5000,AD_BTN_SEL='.btn.ad,[data-g]';let adCoolT=0,adCoolS=0,adDimT=0,adChkT=0,adRdyT=0;
function adErrCode(e){const d=e&&e.error_data||{};return d.error_code||d.error_reason||(e&&(e.error_type||e.message))||'';} // код VK, иначе причина словами — в статистику
function adNoFill(e){const d=e&&e.error_data||{};return +d.error_code===20||/no ads?\b/i.test(String(d.error_reason||''));}
function adSoon(){return L('Ролик будет через несколько секунд — кнопка загорится, когда он загрузится','The video will be ready in a few seconds — the button will light up');}
/* pre (05.10, пачка 2): ролик за награду подгружаем ЗАРАНЕЕ и помним ответ. VKWebAppCheckNativeAds не только отвечает «есть/нет», но и просит VK загрузить ролик,
   поэтому «нет» переспрашиваем, пока не станет «есть» (раньше — 6 раз за 30 с и тишина): шаги AD_STEP (6 раз по 5 с, 4 раза по 15 с), дальше раз в AD_STEP_MAX (45 с).
   По таймеру не чаще раза в AD_ASK_MIN; в свёрнутой игре (adHid / document.hidden) и пока ролик на экране (adW) не спрашиваем — вернулись / ролик кончился → спросили сразу.
   Ответ «есть» перепроверяем, только если он старше AD_FRESH и на экране есть кнопка ролика.
   adSt: 1 — ролик готов, −1 — VK ответил «нет», 0 — неизвестно (не спрашивали / ролик только что показан / мост молчит). Два «нет» подряд → на кнопках ролика (AD_BTN_SEL) значок ⏳
   (data-adwait; нажать всё равно можно: «нет» — не запрет, показ сам попробует загрузить). Стало «есть» → значок уходит, «Ролик готов».
   Статистика: в событии ad поле pr — 1 «был готов к нажатию», 0 «VK говорил нет», нет поля — неизвестно (нужен STAT с 4-м параметром ad); при переходе «нет»→«есть» — adchk {f:'rew',w:секунд ждали,k:сколько «нет»,s:повод}.
   Имя adMark в Богатыре занято (время последней рекламы) — значок ставит adWaitMark. Образец: hobby-analytics/release-h/preload/preload-sample.md, раздел «ОБРАЗЕЦ». */
let AD_STEP=[5000,5000,5000,5000,5000,5000,15000,15000,15000,15000],AD_STEP_MAX=45000,AD_ASK_MIN=3000,AD_FRESH=120000,AD_LOOK_MS=20000;
let adSt=0,adStT=0,adAskT=0,adAsking=0,adAskN=0,adNoN=0,adNoT0=0,adStepN=0,adAskWhy='boot',adMarkT=0,adRdyToastT=0,adHid=false;
function adBtns(){const a=[];try{const q=document.querySelectorAll(AD_BTN_SEL);for(let i=0;i<q.length;i++)a.push(q[i]);}catch(e){}return a;}
function adLikely(){return !(VK&&adSt<0&&adNoN>=2);} // false — VK уже дважды подряд ответил «ролика нет»
function adPreload(why){if(!VK)return;clearTimeout(adChkT);if(typeof why==='string'){adAskWhy=why;adStepN=0;}
  if(document.hidden||adHid||adW)return; // свёрнуты или ролик на экране — молчим; вернёмся / ролик закончится — спросим (adBackChk, итог показа)
  const now=typeof why==='string'&&why!=='back'&&why!=='look'; // итог показа и запуск — спрашиваем сразу (ролик потрачен, прежний ответ устарел); опрос по таймеру — не чаще AD_ASK_MIN
  if(!now){const wait=adAsking?AD_ASK_MIN:adAskT+AD_ASK_MIN-Date.now();if(wait>0){adChkT=setTimeout(adPreload,wait);return;}}
  adAskT=Date.now();const id=adAsking=++adAskN; // ответ на прежний, уже устаревший вопрос не слушаем
  vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).then(r=>{if(id!==adAskN)return;adAsking=0;const ok=!!(r&&r.result);STAT.adChk('rew',ok?1:0);adAns(ok);},()=>{if(id!==adAskN)return;adAsking=0;STAT.adChk('rew',0);adAns(null);});}
function adAns(ok){const t=Date.now();
  if(ok){if(adNoN)STAT.ev('adchk',{f:'rew',w:Math.round((t-adNoT0)/1000),k:adNoN,s:adAskWhy});
    const was=adSt<0&&adNoN>=2;adSt=1;adStT=t;adNoN=0;adStepN=0;adReady();
    if(adWaitMark()&&was&&t>=adCoolT&&!adBusy&&t-adRdyToastT>30000){adRdyToastT=t;toast(L('Ролик готов — можно смотреть','The video is ready to watch'));}
    return;}
  if(ok===false){if(!adNoN)adNoT0=t;adNoN++;adSt=-1;adStT=t;adWaitMark();} // null — мост не ответил: состояние не трогаем, но спрашивать продолжаем
  adChkT=setTimeout(adPreload,AD_STEP[adStepN++]||AD_STEP_MAX);}
// ⏳ на кнопках ролика, пока VK говорит «нет» (окна перерисовываются — поэтому раз в секунду, только пока «нет»); вернёт true, если значок был на видимой кнопке и снят
function adWaitMark(){clearTimeout(adMarkT);const on=!adLikely(),q=on?adBtns():[];let seen=false,old=[];try{old=document.querySelectorAll('[data-adwait]');}catch(e){}
  for(let i=0;i<q.length;i++)if(!q[i].hasAttribute('data-adwait'))q[i].setAttribute('data-adwait','1');
  for(let i=0;i<old.length;i++){const b=old[i];if(q.indexOf(b)<0){b.removeAttribute('data-adwait');if(!on&&b.offsetParent)seen=true;}}
  if(on)adMarkT=setTimeout(adWaitMark,1000);return seen;}
// вернулись в игру или давно не спрашивали, а кнопка ролика на экране — спросить ещё раз
function adBackChk(tick){if(!VK||adBusy||document.hidden||adHid)return;
  if(adSt<1){if(tick!==1)adPreload('back');else if(Date.now()-adAskT>AD_STEP_MAX+2*AD_ASK_MIN)adPreload();return;} // по таймеру — только страховка, шаги не сбрасываем
  if(Date.now()-adStT<AD_FRESH)return;const q=adBtns();for(let i=0;i<q.length;i++)if(q[i].offsetParent){adPreload('look');return;}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(adChkT);else setTimeout(adBackChk,300);});
setInterval(()=>adBackChk(1),AD_LOOK_MS);
function adReady(){if(Date.now()>=adCoolT)return;clearTimeout(adRdyT);adRdyT=setTimeout(()=>{if(Date.now()>=adCoolT)return;adCoolT=0;adDim();let vis=false;try{const q=document.querySelectorAll(AD_BTN_SEL);for(let i=0;i<q.length;i++)if(q[i].offsetParent)vis=true;}catch(e){}if(vis&&!adBusy)toast(L('Ролик готов — можно смотреть','The video is ready to watch'));},Math.max(0,adCoolS+AD_COOL_MIN-Date.now()));}
function adWait(on,txt,exit){let w=document.getElementById('adWait');if(!on){if(w)w.style.display='none';return;}
  if(!w){w=document.createElement('div');w.id='adWait';w.style.cssText='position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:rgba(0,0,0,.74);color:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;font-weight:800;font-size:20px;line-height:1.35';document.body.appendChild(w);}
  w.textContent=txt||L('Ролик загружается…','Loading the video…');
  if(exit){const n=document.createElement('div');n.style.cssText='margin-top:14px;font-weight:600;font-size:16px;max-width:340px';n.textContent=L('Ролик уже закрыт, а награды нет? Можно не ждать: подтвердится просмотр — награду отдам.','Video closed but no reward? No need to wait: once the view is confirmed, the reward is yours.');w.appendChild(n);
    const b=document.createElement('button');b.id='adExit';b.className='noenter';b.textContent=L('Продолжить без награды','Continue without the reward');b.style.cssText='margin-top:18px;min-height:52px;padding:12px 22px;border:0;border-radius:14px;background:#fff;color:#222;font:inherit;font-size:18px;cursor:pointer';b.onclick=exit;w.appendChild(b);}
  w.style.display='flex';}
// кнопки «за рекламу» гаснут, пока идёт пауза (окна перерисовываются — поэтому раз в секунду)
function adDim(){clearTimeout(adDimT);const off=Date.now()<adCoolT;try{const q=document.querySelectorAll(AD_BTN_SEL);for(let i=0;i<q.length;i++)q[i].style.opacity=off?'.45':'';}catch(e){}if(off)adDimT=setTimeout(adDim,1000);}
function adCool(){adCoolS=Date.now();adCoolT=adCoolS+AD_COOL_MS;adDim();adPreload('none');}
// пока ролик идёт, повторные нажатия не запускают второй (и не дают двойную награду)
/* adt (04.10): обрыв ролика через 60 с — перенос из «Зины» (образец: hobby-analytics/release-g/ads-timeout.md, раздел «ОБРАЗЕЦ»).
   Раньше показ ждал ответа VK 60 с (vkSend(…,60000)), потом писал «недоступна», а поздний «досмотрел» никто не слушал. Теперь:
   1) ответа ждём AD_WAIT_MS (180 с), игра на паузе рекламы;
   2) ролик закрылся, а ответа нет: по знаку «игрок вернулся» (adBack: вкладка видна, фокус, VK вернул игру, нажатие позже AD_TAP_MS; запасной знак — 60-я секунда)
      через AD_CHK_MS — «Проверяем просмотр ролика…», через AD_EXIT_MS — кнопка «Продолжить без награды»;
   3) вышли без ответа (кнопка или 180 с) — пауза снята, onFail, но ответ слушаем дальше. Поздний «досмотрел» — награда один раз (флаг paid) по правилу места:
      третий параметр showRewarded(cb,onFail,late). late() сам выдаёт награду, если она ещё уместна, иначе замену adLateGold(n) — золото по полной цене обещанного
      (цены в золоте нет — ECO.gift[0], как «Дар Жар-птицы»), и возвращает слова для надписи; вернул '' — выдавать нечего. Идёт другой ролик или игра свёрнута — награда ждёт;
   4) статистика (ms — мс от нажатия; STAT v1.2, раньше секунды w): ok c=slow / late / latec / late0; err c=timeout / exit (через AD_LATE_MS или при сворачивании; ответ ещё позже — dup:1); fail|skip c=late; err c=late:код.
   Числа — let (стенд их укорачивает). НОВАЯ КНОПКА РЕКЛАМЫ — ОБЯЗАТЕЛЬНО С late. */
let AD_WAIT_MS=180000,AD_SLOW_MS=60000,AD_CHK_MS=1500,AD_EXIT_MS=15000,AD_TAP_MS=5000,AD_LATE_MS=600000;
function adChk(){return L('Проверяем просмотр ролика…','Checking that the video was watched…');}
let adW=null,adPl='',adLateC=0;const adLateQ=[];
{const sp=STAT.place;STAT.place=function(p){adPl=String(p||'');return sp.apply(STAT,arguments);};} // место рекламы запоминаем сами: позднее событие пишется после следующих нажатий
// позднее событие ролика (после выхода игрока): ms — от нажатия (STAT v1.2; раньше — секунды w); x.p — место, x.dup — «ответ не пришёл» уже записано
function adStat(r,c,ms,x){const p={f:'rew',r:r,p:x&&x.p||adPl||'?',ms:ms};if(c!==''&&c!=null)p.c=String(c).slice(0,24);if(x&&x.dup)p.dup=1;if(x&&x.pr!=null)p.pr=x.pr;STAT.ev('ad',p);}
function adWatch(rel){adUnwatch();const w=adW={t0:Date.now(),back:0,rel:rel};w.tS=setTimeout(adBack,AD_SLOW_MS);w.tW=setTimeout(()=>{if(adW===w)rel('timeout');},AD_WAIT_MS);}
function adUnwatch(){const w=adW;if(!w)return;adW=null;clearTimeout(w.tS);clearTimeout(w.tW);clearTimeout(w.tC);clearTimeout(w.tE);adWait(0);}
function adBack(){const w=adW;if(!w||w.back)return;w.back=Date.now();
  w.tC=setTimeout(()=>{if(adW===w)adWait(1,adChk());},AD_CHK_MS);
  w.tE=setTimeout(()=>{if(adW===w)adWait(1,adChk(),()=>w.rel('exit'));},AD_EXIT_MS);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)adBack();else adLateFlush();});
window.addEventListener('focus',adBack);window.addEventListener('pagehide',adLateFlush);
['pointerdown','touchstart','keydown'].forEach(n=>document.addEventListener(n,()=>{if(adW&&Date.now()-adW.t0>=AD_TAP_MS)adBack();},true));
function adLatePend(rec){adLateQ.push(rec);rec.tF=setTimeout(()=>adLateFin(rec),AD_LATE_MS);}
function adLateFin(rec){if(rec.fin||rec.hold)return;rec.fin=1;clearTimeout(rec.tF);const i=adLateQ.indexOf(rec);if(i>=0)adLateQ.splice(i,1);adStat('err',rec.exit?'exit':'timeout',rec.ms,{p:rec.p,pr:rec.pr});}
function adLateFlush(){adLateQ.slice().forEach(adLateFin);}
function adLateEnd(rec,r,c){const dup=rec.fin;rec.fin=1;clearTimeout(rec.tF);const i=adLateQ.indexOf(rec);if(i>=0)adLateQ.splice(i,1);if(dup&&r!=='ok')return;
  adStat(r,c,Date.now()-rec.t0,{p:rec.p,dup:dup,pr:rec.pr});}
// замена поздней награды, которая уже неуместна (поход кончился, окно закрыто): золото по ПОЛНОЙ цене обещанного; цены в золоте нет — ECO.gift[0]
function adLateGold(n){n=n>0?Math.round(n):ECO.gift[0];adLateC=1;S.gold+=n;ern('ad',n);save();try{setGold();}catch(e){}SND.coin();return L('держи золото: +','here’s gold: +')+fmtNum(n);}
let adBusy=false;
function showRewarded(cb0,onFail0,late0){
  if(adBusy)return;
  if(Date.now()<adCoolT){STAT.ad('rew','hold');toast(L('Ролик ещё загружается — подожди несколько секунд','The video is still loading — wait a few seconds'));if(onFail0)onFail0();adDim();return;} // пауза кнопок: площадку не дёргаем; STAT — «нажал по погасшей» (не чаще раза в 20 с, n)
  STAT.adReq('rew'); // STAT v1.2: нажатие → ms в итоговом ad
  adBusy=true;clearTimeout(showRewarded._t);showRewarded._t=setTimeout(()=>{adBusy=false;adWait(0);},AD_WAIT_MS*2+AD_RETRY_MS+15000);
  const t0=Date.now(),rec={p:adPl,t0:t0,fin:0};adPl='';if(VK&&adSt)rec.pr=adSt>0?1:0; // pre: был ли ролик готов к нажатию
  let paid=false,st=0; // st: 0 — ждём ответ, 1 — ответ получен, 2 — игрока отпустили без ответа (слушаем поздний)
  const cb=()=>{if(paid)return;paid=true;adBusy=false;cb0();},onFail=()=>{adBusy=false;onFail0&&onFail0();};
  const stat=(r,c)=>STAT.ad('rew',r,Date.now()-t0>=AD_SLOW_MS?c||'slow':c,{pr:rec.pr}); // pre: pr — был ли ролик готов к нажатию (нужен STAT с 4-м параметром); ms ставит модуль; место живёт до итога
  const rel=why=>{if(st)return;st=2;rec.ms=Date.now()-t0;rec.exit=why==='exit';adUnwatch();adClose();adPreload('exit');
    toast(rec.exit?L('Хорошо. Подтвердится просмотр — награду отдам','All right. Once the view is confirmed, the reward is yours'):L('Не дождались ответа о просмотре. Придёт — награду отдам','No answer about the view yet. When it comes, the reward is yours'));onFail();adDim();adLatePend(rec);};
  const lateOk=()=>{if(paid)return;rec.hold=1;if(adBusy||adShowing||document.hidden){setTimeout(lateOk,1000);return;} // другой ролик или игра свёрнута — подождём
    paid=true;adLateC=0;let m='';try{m=late0&&late0()||'';}catch(e){}
    adLateEnd(rec,'ok',m?(adLateC?'latec':'late'):'late0');if(m)toast(L('Просмотр подтвердился — ','View confirmed — ')+m);};
  if(PLAT==='vk'&&!VK){if(VK_REAL){STAT.ad('rew','fail','nobridge');toast(adFail());onFail();}else{STAT.ad('rew','ok','stub');stubAd(cb);}return;} // в VK мост не ответил — не даём награду даром; ?vk=1 на маке — заглушка
  if(VK){
    let tries=0;
    const go=()=>{clearTimeout(adChkT);if(adSt>0){adSt=0;adWaitMark();}adOpen();adWatch(rel);window.vkBridge.send('VKWebAppShowNativeAds',{ad_format:'reward'}).then(r=>{
        if(st===2){if(r&&r.result)lateOk();else adLateEnd(rec,'fail','late');return;}
        if(st)return;st=1;adUnwatch();adClose();
        if(r&&r.result){stat('ok',tries?'retry':'');adPreload('shown');cb();}else{stat('fail','noresult');toast(adFail());adPreload('fail');onFail();}
      },e=>{
        if(st===2){adLateEnd(rec,'err','late:'+adErrCode(e));return;}
        if(st)return;adUnwatch();
        if(adNoFill(e)&&!tries){tries=1;adWait(1);adPreload('retry');setTimeout(()=>{adWait(0);go();},AD_RETRY_MS);return;} // ролика нет — один тихий повтор; игра остаётся на паузе (adClose — после него)
        st=1;adClose();if(adNoFill(e)){stat('none',adErrCode(e));toast(adSoon());adCool();}else{stat('err',adErrCode(e));toast(adFail());adPreload('err');}
        onFail();adDim();});}; // adDim: колбэк мог заново открыть окно с кнопкой — гасим её сразу
    go();return;}
  if(!ysdk){if(LOCAL){STAT.ad('rew','ok','stub');stubAd(cb);}else{STAT.ad('rew','fail',sdkDone?'nosdk':'loading');toast(sdkDone?adFail():L('Реклама ещё загружается, попробуй через пару секунд','Ads are still loading, try again in a few seconds'));onFail();}return;}
  let got=false;adWatch(rel);
  const lateY=f=>{if(!adBusy)adClose();f();}; // поздние колбэки Яндекса: ролик мог поставить паузу — снимаем, если не идёт другой
  ysdk.adv.showRewardedVideo({callbacks:{onOpen:adOpen,onRewarded:()=>{got=true;},
    onClose:()=>{if(st===2){lateY(()=>{if(got)lateOk();else adLateEnd(rec,'skip','late');});return;}if(st)return;st=1;adUnwatch();
      adClose();stat(got?'ok':'skip','');if(got)cb();else{toast(L('Досмотри видео до конца, чтобы получить награду','Watch the video to the end to get the reward'));onFail();}},
    onError:()=>{if(st===2){lateY(()=>adLateEnd(rec,'err','late'));return;}if(st)return;st=1;adUnwatch();
      adClose();stat('err','');toast(adFail());adCool();onFail();adDim();}}});
}

/* ================= звук: эффекты — синтез, музыка — записанные треки (ниже) =================
   Шины: звуки (S.vs) и музыка (S.vm) → компрессор → выход. S.sound — общий выключатель.
   При сворачивании и рекламе весь звук ставится на паузу (setMuted → AC.suspend). */
let AC=null,BUS=null;
function acResume(){if(AC&&AC.state!=='running'&&!muted){try{const p=AC.resume();if(p&&p.catch)p.catch(()=>{});}catch(e){}}}
// iOS после звонка/Siri ставит состояние «interrupted» — будим всё, что не «running»
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();const cmp=AC.createDynamicsCompressor();cmp.threshold.value=-12;cmp.ratio.value=4;cmp.connect(AC.destination);
    BUS={sfx:AC.createGain(),mus:AC.createGain()};BUS.sfx.connect(cmp);BUS.mus.connect(cmp);volApply();}catch(e){}}
  acResume();return AC;}
function volS(){return S.vs==null?.8:S.vs;}
function volM(){return S.vm==null?.6:S.vm;}
let MDUCK=1; // приглушение музыки (пауза)
function musicDuck(v){MDUCK=v;volApply();}
function volApply(){if(!BUS)return;const on=S.sound?1:0,t=AC.currentTime;BUS.sfx.gain.setTargetAtTime(on*volS(),t,.05);BUS.mus.gain.setTargetAtTime(on*volM()*MDUCK,t,.15);}
function setMuted(m){muted=m;if(AC){try{const p=m?AC.suspend():AC.resume();if(p&&p.catch)p.catch(()=>{});}catch(e){}}}
// не больше 12 звуков одновременно (в толпе лишние пропускаем)
const VOX=[];function voice(d){const n=AC.currentTime;let j=0;for(let i=0;i<VOX.length;i++)if(VOX[i]>n)VOX[j++]=VOX[i];VOX.length=j;if(j>=12)return false;VOX.push(n+d);return true;}
// det — случайная расстройка ±5% (массовые звуки не «пилят»); атака 5 мс — без щелчка в начале
function tone(f,d,type,v,f2,delay,det){if(!S.sound||muted||!volS())return;const a=ac();if(!a||(det&&!voice(d)))return;const t=a.currentTime+(delay||0),k=det?rand(.95,1.05):1;
  const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f*k,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2*k,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.12,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(g).connect(BUS.sfx);o.start(t);o.stop(t+d+.02);}
let NB=null;
function noiseBuf(a){if(!NB){NB=a.createBuffer(1,a.sampleRate*.5,a.sampleRate);const ch=NB.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;}return NB;}
function noise(d,v,freq,q,det){if(!S.sound||muted||!volS())return;const a=ac();if(!a||(det&&!voice(d)))return;
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;s.buffer=noiseBuf(a);f.type='bandpass';f.frequency.value=(freq||1000)*(det?rand(.95,1.05):1);f.Q.value=q||1;
  g.gain.setValueAtTime(v||.2,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f).connect(g).connect(BUS.sfx);s.start(t);s.stop(t+d);}

/* ---------- музыка: записанные треки (audio/*.m4a, моно), авторы — в «Благодарностях» (ui.js, openCredits) ----------
   musicPlay('menu'|'run'|'boss'|null): меню и деревня — «Market Day», поход — «Zombies also love to play the fool», босс — «Brave Soldiers».
   Web Audio: fetch → decodeAudioData → AudioBufferSourceNode с loop (петля без щелчка) → шина BUS.mus (громкость S.vm, S.sound, musicDuck).
   Память: раскодирован только ТЕКУЩИЙ трек (≈12–32 МБ, моно); остальные лежат сжатыми (≈0,5–1,3 МБ) и раскодируются при смене.
   Не загрузился — ещё 2 попытки через 20 с; не раскодировался (браузер не умеет AAC) — больше не пробуем, тишина.
   musTick() сам включает, меняет (кроссфейд ~1 с) и глушит (реклама/сворачивание → AC.suspend); после паузы трек продолжается с того же места.
   Поменять трек — MUSF (файл) и MUSK (какой экран какой трек); общий уровень — MUS_LVL, по трекам — MUS_TRK. */
const MUSF={market:'audio/market.m4a',battle:'audio/battle.m4a',boss:'audio/boss.m4a'},MUSK={menu:'market',run:'battle',boss:'boss'},MUS_LVL=.5;
const MUS_TRK={market:.45,battle:1,boss:.85}; // Market Day записан громче на ~7 дБ
const MUS={want:null,buf:{},raw:{},ld:{},fails:{},retry:{},cur:null,src:null,g:null,t0:0,off:0,v:0,fade:0,pos:{}};
function musicPlay(name){MUS.want=name;}
// края трека: пропускаем тишину кодека в начале/конце, чтобы на стыке петли не было паузы
function musEdges(b){const sr=b.sampleRate,n=b.length,lim=Math.min(n>>1,sr*2),th=.002,chs=[];for(let c=0;c<b.numberOfChannels;c++)chs.push(b.getChannelData(c));
  const loud=i=>chs.some(d=>Math.abs(d[i])>th);let i0=0,i1=n-1;while(i0<lim&&!loud(i0))i0++;while(i1>n-lim&&!loud(i1))i1--;
  b._ls=i0<lim?i0/sr:0;b._le=i1>n-lim?(i1+1)/sr:b.duration;}
function musLoad(n){if(window.NO_MUSIC||MUS.buf[n]||!AC||MUS.ld[n]||(MUS.fails[n]||0)>=3||performance.now()<(MUS.retry[n]||0))return;MUS.ld[n]=1;
  (MUS.raw[n]?Promise.resolve(MUS.raw[n]):fetch(MUSF[n]).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.arrayBuffer();}).then(ab=>MUS.raw[n]=ab))
    .then(ab=>new Promise((ok,no)=>{const p=AC.decodeAudioData(ab.slice(0),ok,()=>no({dec:1}));if(p&&p.catch)p.catch(()=>no({dec:1}));}))
    .then(b=>{musEdges(b);MUS.ld[n]=0;if(MUSK[MUS.want]===n)MUS.buf[n]=b;})   // пока грузился, экран сменился — не держим
    .catch(e=>{MUS.ld[n]=0;if(e&&e.message==='http 404'){for(const k in MUSF)MUS.fails[k]=3;return;} // треков нет (сборка без музыки) — больше не просим
      MUS.fails[n]=(MUS.fails[n]||0)+(e&&e.dec?3:1);MUS.retry[n]=performance.now()+20000;});}
function musPos(){const b=MUS.buf[MUS.cur],len=b._le-b._ls;return b._ls+((MUS.off-b._ls)+(AC.currentTime-MUS.t0))%len;}
function musStart(n,v,fade){const a=AC,b=MUS.buf[n],t=a.currentTime,s=a.createBufferSource(),g=a.createGain();
  s.buffer=b;s.loop=true;s.loopStart=b._ls;s.loopEnd=b._le;const off=MUS.pos[n]!=null?MUS.pos[n]:b._ls;delete MUS.pos[n];
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+fade);s.connect(g).connect(BUS.mus);s.start(t,off);
  Object.assign(MUS,{cur:n,src:s,g,t0:t,off,v,fade:t+fade});}
function musStop(fade,keep){const a=AC,s=MUS.src,g=MUS.g,t=a.currentTime;if(keep&&MUS.buf[MUS.cur])MUS.pos[MUS.cur]=musPos();else delete MUS.pos[MUS.cur];
  MUS.src=MUS.g=MUS.cur=null;if(a.state!=='running'){try{s.stop();}catch(e){}try{g.disconnect();}catch(e){}return;}
  try{g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+fade);s.stop(t+fade+.05);}catch(e){}
  setTimeout(()=>{try{g.disconnect();}catch(e){}},fade*1000+400);}
function musTick(){if(!AC||!BUS)return;const on=!!(S.sound&&volM()),n=on?MUSK[MUS.want]||null:null,run=AC.state==='running'&&!muted;
  if(n)musLoad(n);
  if(MUS.src&&(MUS.cur!==n||!run))musStop(1,MUS.cur===n||!on);   // смена трека — с начала; пауза/выключено — запомним место
  if(!MUS.src&&n&&run&&MUS.buf[n])musStart(n,MUS_LVL*(MUS_TRK[n]||1),1);
  for(const k in MUS.buf)if(k!==n&&k!==MUS.cur)delete MUS.buf[k]; // в памяти — только нужный трек (доигрывающий хвост держит сам источник)
}
setInterval(musTick,200);
const SNDT={};
function thr(k,ms){const n=performance.now();if(SNDT[k]&&n-SNDT[k]<ms)return false;SNDT[k]=n;return true;}
let gemPitch=0,gemT=0;
const SND={
  hit(){if(thr('hit',70))noise(.06,.09,1800,2,1);},
  kill(){if(thr('kill',90))tone(rand(380,460),.08,'triangle',.07,160,0,1);},
  swing(){if(thr('sw',80))noise(.12,.08,2600,.7,1);},
  shoot(){if(thr('sh',70))tone(900,.06,'triangle',.04,500,0,1);},
  boom(){if(thr('bm',80)){noise(.25,.2,300,.8,1);tone(120,.2,'sine',.15,50,0,1);}},
  zap(){if(thr('zp',80)){noise(.18,.15,3500,.6,1);tone(1400,.12,'sawtooth',.05,200,0,1);}},
  gem(){const n=performance.now();if(n-gemT>600)gemPitch=0;gemT=n;if(thr('gem',60)){tone(700+gemPitch*40,.07,'sine',.07,0,0,1);gemPitch=Math.min(gemPitch+1,12);}},
  coin(){if(thr('coin',70)){tone(1200,.06,'square',.04,0,0,1);tone(1600,.1,'square',.04,0,.05);}},
  heal(){tone(500,.15,'sine',.1,900);},
  level(){[523,659,784,1047].forEach((f,i)=>tone(f,.18,'triangle',.1,0,i*.08));},
  hurt(){if(thr('hu',150)){tone(220,.15,'sawtooth',.1,90);noise(.1,.1,600);}},
  chest(){[392,523,659,784,1047].forEach((f,i)=>tone(f,.25,'triangle',.09,0,i*.1));},
  boss(){tone(110,.9,'sawtooth',.12,55);noise(.8,.15,200,.5);},
  whistle(){tone(1500,.6,'sine',.06,2400);tone(2000,.5,'sine',.035,1300,.15);},
  click(){tone(660,.05,'triangle',.07);},
  win(){[523,659,784,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',.1,0,i*.13));},
  lose(){[392,349,311,262].forEach((f,i)=>tone(f,.35,'triangle',.1,0,i*.18));},
  crit(){if(thr('cr',110))tone(1250,.08,'square',.045,1900,0,1);},
  tick(){if(thr('tk',60))tone(rand(1150,1350),.035,'triangle',.05);},          // рулетка сундука: «звон монет»
  reel(){tone(880,.12,'triangle',.09,1320);},                                   // ячейка рулетки остановилась
  combo(){[659,880,1175].forEach((f,i)=>tone(f,.14,'triangle',.08,0,i*.06));},  // «Раззудись плечо!»
  crack(){if(thr('ck',120)){noise(.14,.2,520,1.1);tone(160,.1,'triangle',.08,90);}} // пенёк/колода трещит
};

/* ================= вибрация: крит по вожаку/боссу, убит вожак, пришёл/повержен босс, эволюция, находки =================
   Выключатель — S.vib (по умолчанию вкл, в ⚙). Не чаще раза в 250 мс. VK — тактильный отклик моста (работает и на iPhone),
   иначе navigator.vibrate (в Safari на iPhone его нет — тогда тихо ничего). До первого касания браузер вибрацию не даёт — не зовём. */
let vibT=0;
function canVib(){return (PLAT==='vk'&&!!VK&&!OK)||typeof navigator.vibrate==='function';}
function vib(ms,strong){if(S.vib===0||muted||document.hidden||adShowing)return;const n=performance.now();if(n-vibT<250)return;vibT=n;
  try{if(PLAT==='vk'&&VK&&!OK){vkSend('VKWebAppTapticImpactOccurred',{style:strong?'heavy':'light'},2000).catch(()=>{});return;}
    const ua=navigator.userActivation;if(ua&&!ua.hasBeenActive)return;if(typeof navigator.vibrate==='function')navigator.vibrate(ms);}catch(e){}}

/* ================= качество эффектов: авто / много / мало =================
   Хранится только на этом устройстве (localStorage 'bogatyr-q'), в облако не идёт: у телефона и ПК разное железо.
   Авто: если в походе 3 секунды подряд меньше 40 кадров в секунду — «мало» (и так остаётся на этом устройстве).
   «Мало»: плотность экрана ≤1,5, частиц и цифр урона меньше, свечения у мелочи нет, потолок нечисти ×0,8 (а она на 25% крепче — сложность та же). */
const QL={mode:0,auto:0,n:0,sum:0,bad:0,last:0};
try{const q=JSON.parse(localStorage.getItem('bogatyr-q')||'{}');QL.mode=+q.mode||0;QL.auto=+q.auto||0;}catch(e){}
function qSave(){try{localStorage.setItem('bogatyr-q',JSON.stringify({mode:QL.mode,auto:QL.auto}));}catch(e){}}
function qLow(){return QL.mode===2||(QL.mode===0&&!!QL.auto);}
// кадр похода: t — время кадра (мс). Считаем среднее за секунду; паузы, окна и первые секунды не считаем
function qFrame(t){if(QL.mode!==0||QL.auto)return;const gap=t-QL.last;QL.last=t;if(!(gap>0&&gap<250))return;QL.n++;QL.sum+=gap;
  if(QL.sum<1000)return;const fps=QL.n*1000/QL.sum;QL.n=0;QL.sum=0;QL.bad=fps<40?QL.bad+1:0;
  if(QL.bad>=3){QL.auto=1;qSave();if(typeof layout==='function')layout();}}

/* ================= тост ================= */
let toastT=0;
// тосты общего модуля покупок (js/pay.js пишет по-русски, модуль не меняем) — английский здесь
const TOAST_EN={'Покупка зачислена':'Purchase credited','Готово! Спасибо за покупку':'Done! Thanks for your purchase','Покупка не состоялась':'Purchase not completed','Покупки проверены — всё на месте':'Purchases checked — everything’s in place'}; // i18n:ru — ключи на русском
function toast(s){if(LANG==='en'&&TOAST_EN[s])s=TOAST_EN[s];const t=$('toast');t.textContent=s;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),Math.max(2500,1000+60*String(s).length));}

/* ================= день (для заданий) ================= */
function dayKey(t){const d=new Date(t||dayMs());return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dayPrev(k){const [y,m,d]=k.split('-').map(Number);return dayKey(new Date(y,m-1,d-1).getTime());}

/* ================= таблицы рекордов: Яндекс (endless, kills, weekly) и VK (таблица друзей) =================
   В консоли Яндекс Игр нужно создать лидерборды с техническими именами 'endless', 'kills', 'weekly' и 'daily' (тип «число»). */
const LB={
  ok(){return !!(ysdk&&(ysdk.leaderboards||ysdk.getLeaderboards));},
  // setScore у Яндекса — не чаще раза в секунду: очередь, для каждой таблицы — только последнее значение, между вызовами 1,1 с
  q:{},busy:false,
  set(name,score){if(!ysdk)return;LB.q[name]=score;LB.pump();},
  async pump(){if(LB.busy)return;LB.busy=true;
    try{for(let k=Object.keys(LB.q)[0];k;k=Object.keys(LB.q)[0]){const score=LB.q[k];delete LB.q[k];
      try{if(YP&&YP.isAuthorized&&!YP.isAuthorized())continue;
        if(ysdk.leaderboards&&ysdk.leaderboards.setScore)await ysdk.leaderboards.setScore(k,Math.floor(score));
        else{const lb=await ysdk.getLeaderboards();await lb.setLeaderboardScore(k,Math.floor(score));}}catch(e){}
        await new Promise(r=>setTimeout(r,1100));}}
    finally{LB.busy=false;}},
  async get(name){if(!ysdk)return null;try{const o={quantityTop:10,includeUser:true,quantityAround:2};
    if(ysdk.leaderboards&&ysdk.leaderboards.getEntries)return await ysdk.leaderboards.getEntries(name,o);
    const lb=await ysdk.getLeaderboards();return await lb.getLeaderboardEntries(name,o);}catch(e){return null;}},
  authed(){return !YP||!YP.isAuthorized||YP.isAuthorized();},
  // после входа — другой игрок Яндекса: его облако читаем заново и сливаем с тем, что на устройстве (до этого в облако не пишем)
  async login(){try{await ysdk.auth.openAuthDialog();loginMerge=true;clearTimeout(cloudT);cloudT=0;cloudReady=false;cloudPending=null;YP=await ysdk.getPlayer({scopes:false});yCloud(3);return true;}catch(e){return false;}},
  // VK: таблица друзей (окно VK). Счёт — сколько нечисти одолено всего (в настройках приложения VK — турнирная таблица «по очкам»)
  vkFriends(){if(OK)return;if(!VK){toast('Таблица друзей откроется в игре ВКонтакте');return;} // i18n:ru — только VK (там всегда русский)
    vkSend('VKWebAppShowLeaderBoardBox',{user_result:Math.floor(S.kills||0)},60000).catch(()=>toast('Таблица друзей сейчас недоступна'));} // i18n:ru — только VK (там всегда русский)
};

/* ================= возврат игрока: ярлык и оценка (Яндекс), избранное, экран «Домой», друзья (VK) =================
   Предлагаем по одному за сессию — после победы, не раньше 3-го похода; что показали или от чего отказались — помним в S.ask. */
const ASK={session:false,
  async next(){const A=S.ask;
    if(PLAT==='vk')return null; // VK: избранное/экран/друзья — модуль SOC (предложение в итогах, со 2-й сессии)
    if(!ysdk)return null;
    if(!A.short){try{const r=await ysdk.shortcut.canShowPrompt();if(r&&r.canShow)return {k:'short',t:L('Добавь ярлык игры на рабочий стол — возвращаться в один клик.','Add a desktop shortcut — come back in one click.'),b:L('📌 Добавить ярлык','📌 Add shortcut'),run:()=>ysdk.shortcut.showPrompt()};}catch(e){}A.short=1;}
    if(!A.rev){try{const r=await ysdk.feedback.canReview();if(r&&r.value)return {k:'rev',t:L('Нравится игра? Поставь оценку — так богатыря найдут другие.','Enjoying the game? Rate it — help others find the bogatyr.'),b:L('⭐ Оценить игру','⭐ Rate the game'),run:()=>ysdk.feedback.requestReview()};}catch(e){}}
    return null;}
};
