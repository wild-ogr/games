'use strict';
/* ================= утилиты ================= */
const $=id=>document.getElementById(id);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function plural(n,a,b,c){const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;}
const coinsTxt=n=>n+' '+plural(n,'монета','монеты','монет');
const COIN_I='<span class="coin" style="width:16px;height:16px;vertical-align:-2px"></span>'; // монетка в тексте (эмодзи 🪙 старые телефоны не знают)
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
// тост держится по длине текста (для 45+: не меньше 2,5 с), нажатие закрывает
function toast(t,ms){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast._t);
  toast._t=setTimeout(()=>e.classList.remove('on'),ms||Math.max(2500,1000+60*t.length));}
if($('toast'))$('toast').addEventListener('click',()=>{clearTimeout(toast._t);$('toast').classList.remove('on');});
const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),ms))]);
const T0=Date.now(); // начало сессии: межуровневая реклама и просьбы — не в первые минуты

/* ================= словарь (Set строим при первом слове, а не на старте) ================= */
// MORE — добавка бонусных слов из js/zina.js (кеды, жюри…): отдельно от dict.js, чтобы уровни не пересобирались
// DENY — слова из словаря, которые засчитывать нельзя («она», «кости», «лет»: не «одна штука» или не предмет; js/zina.js, разделы «!» в data/zina-no.txt)
// RUDEH — отпечатки грубого (ZINA_RUDE): не засчитывается, даже если слово есть в словаре (аудит 18: педофил, хохол, дура…)
let MAIN=null,EXTRA=null,MORE=null,WHY=null,DENY=null,RUDEH=null;
// словарь готов: dict.js и zina.js загружены. Без zina.js бонусы не засчитываем вовсе — иначе пройдёт грубое и «она/кости»
const dictReady=()=>typeof DICT_MAIN!=='undefined'&&typeof ZINA_NO==='object';
// аудит 18: dict.js/zina.js не догрузились (плохая сеть) — пробуем ещё раз: не чаще раза в 3 с, после 4 попыток — раз в минуту
const DLOAD={n:{},t:{}};
function ensureDict(){[['js/dict.js',typeof DICT_MAIN==='undefined'],['js/zina.js',typeof ZINA_NO!=='object']].forEach(([f,need])=>{
  const n=DLOAD.n[f]||0,ago=Date.now()-(DLOAD.t[f]||0);if(!need||ago<(n>=4?60000:3000))return;DLOAD.n[f]=n+1;DLOAD.t[f]=Date.now();
  loadScript(f+'?r='+(n+1),15000).catch(()=>{});});}
addEventListener('load',()=>setTimeout(()=>{if(!dictReady())ensureDict();},1500));
function isWord(w){if(!dictReady())return false;
  if(!MAIN){MAIN=new Set(DICT_MAIN.split(' '));EXTRA=new Set(DICT_EXTRA.split(' '));
    MORE=new Set(typeof ZINA_MORE==='string'&&ZINA_MORE?ZINA_MORE.split(' '):[]);DENY=new Set(typeof ZINA_DENY==='string'&&ZINA_DENY?ZINA_DENY.split(' '):[]);
    RUDEH=new Set(typeof ZINA_RUDE==='string'&&ZINA_RUDE?ZINA_RUDE.split(' '):[]);WHY=null;}
  return !DENY.has(w)&&(MAIN.has(w)||EXTRA.has(w)||MORE.has(w))&&!RUDEH.has(h32(w));}
// почему настоящее слово не засчитано (js/zina.js): adj, pron, num, adv, func, name, rude, form, plural, verb; '' — не знаем
// грубое хранится отпечатками (tools/zina.py, h32) — чтобы в игре не лежал мат текстом
function h32(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
function whyNot(w){if(!WHY||(!WHY.size&&typeof ZINA_NO==='object')){WHY=new Map();if(typeof ZINA_NO==='object')for(const k in ZINA_NO)ZINA_NO[k].split(' ').forEach(x=>WHY.set(x,k));
    if(typeof ZINA_RUDE==='string'&&ZINA_RUDE)ZINA_RUDE.split(' ').forEach(x=>WHY.set('#'+x,'rude'));}
  return WHY.get('#'+h32(w))||WHY.get(w)||'';}

/* ================= сохранение ================= */
const SKEY='slovo-v1';
function freshSave(){return {v:1,ts:0,lv:0,coins:50,sound:1,bonusAll:0,jar:0,dict:{},daily:{},streak:0,lastDaily:'',found:0,hintsUsed:0,plays:0,tip:{},curs:{},
  music:1,ex:'',skin:'gzhel',outfit:'lilac',own:{},bestStreak:0,ask:{},vib:1,big:0};}
let S=freshSave();
const SHOT=/[?&]shot=/.test(location.search);
try{const r=!SHOT&&localStorage.getItem(SKEY);if(r){const o=JSON.parse(r);if(o&&typeof o==='object'&&!Array.isArray(o))S=Object.assign(S,o);}}catch(e){}
// BOOT — что лежит в облаке по нашим сведениям (при запуске — то, что на устройстве; после записи в облако — записанное).
// Облако новее → монеты и банка = облако + заработанное здесь с тех пор (ничего не теряется и не удваивается).
const BOOT={ts:S.ts||0,coins:+S.coins||0,jar:+S.jar||0};
const bootSnap=()=>({ts:S.ts,coins:+S.coins||0,jar:+S.jar||0});
function synced(s){Object.assign(BOOT,s);}
// облако: не чаще раза в 3 с (VK — 15 с); пока облако не прочитано и не слито — в него не пишем
let cloudT=0,cloudReady=false,cloudBusy=false,cloudTry=0,cloudFails=0;
// таймер ставим, только если его нет: частые слова не отодвигают запись (было «через 15 с тишины» — у активного игрока облако не писалось)
function save(){if(SHOT)return;S.ts=Date.now();try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}
  if(!cloudT)cloudT=setTimeout(()=>{cloudT=0;cloudSave();},PLAT==='vk'?15000:3000);}
function cloudSoon(ms){if(SHOT)return;clearTimeout(cloudT);cloudT=setTimeout(()=>{cloudT=0;cloudSave();},ms||1500);}
function cloudSave(flush){if(SHOT)return;if(!cloudReady){cloudLoad();return;}
  try{if(YP)yaSave(flush);else if(PLAT==='vk'&&VK)vkSaveCloud();}catch(e){}}
// Яндекс: не больше 100 записей за 5 минут — держим запас (90), лишнее откладываем
const yaLog=[];let yaT=0;
function yaSave(flush){const now=Date.now();while(yaLog.length&&now-yaLog[0]>300000)yaLog.shift();
  if(yaLog.length>=90){clearTimeout(yaT);yaT=setTimeout(()=>cloudSave(),300000-(now-yaLog[0])+1000);return;}
  yaLog.push(now);const snap=bootSnap();YP.setData(S,!!flush).then(()=>synced(snap)).catch(()=>{});}
// JSON с упорядоченными ключами — чтобы сравнивать сохранения без учёта порядка и ts
function canon(o){return JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((r,x)=>(r[x]=v[x],r),{}):v);}
const noTs=o=>Object.assign({},o,{ts:0});
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
// слияние облака с тем, что на устройстве: прогресс (уровни, словарь, облики, медали, дни) — объединение/максимум;
// монеты и банка — облако + заработанное здесь после последней синхронизации; настройки — из более нового. S меняется на месте.
function mergeSave(d){if(!isObj(d))return false;const before=canon(noTs(S)),newer=(+d.ts||0)>BOOT.ts;
  for(const k in d)if(!(k in S))S[k]=d[k];
  SOC.merge(d.soc); // «Друзья и игры» (VK): сессии — максимум, «сделано» — навсегда
  STAT.merge(d.stc); // статистика: день установки, число сеансов — раньше/больше (S.stc пишет сам модуль)
  for(const k of['lv','found','bonusAll','hintsUsed','plays','bestStreak','wins'])S[k]=Math.max(+S[k]||0,+d[k]||0);
  for(const k of['dict','daily','own','tip','ask','chg'])S[k]=Object.assign({},isObj(d[k])?d[k]:{},isObj(S[k])?S[k]:{});
  const a=typeof S.ex==='string'?S.ex:'',b=typeof d.ex==='string'?d.ex:'';let e='';for(let i=0;i<Math.max(a.length,b.length);i++)e+=a[i]==='1'||b[i]==='1'?'1':'0';S.ex=e;
  S.curs=isObj(S.curs)?S.curs:{};if(isObj(d.curs))for(const k in d.curs){const x=d.curs[k];if(isObj(x)&&(!S.curs[k]||(x.t||0)>(S.curs[k].t||0)))S.curs[k]=x;}
  const la=+S.lastDaily||0,lb=+d.lastDaily||0;
  if(lb>la){S.lastDaily=d.lastDaily;S.streak=+d.streak||0;}else if(lb===la)S.streak=Math.max(+S.streak||0,+d.streak||0);
  if(isObj(d.dailyPick)&&(!S.dailyPick||d.dailyPick.d>S.dailyPick.d))S.dailyPick=d.dailyPick;
  if(isObj(d.fix)&&(!S.fix||d.fix.d>S.fix.d))S.fix=d.fix; // восстановленная серия
  if(isObj(d.adc)&&(!S.adc||d.adc.d>S.adc.d||d.adc.d===S.adc.d&&d.adc.n>S.adc.n))S.adc=d.adc; // сколько раз сегодня брали монеты за рекламу
  if(isObj(d.fl)&&(!S.fl||d.fl.d>S.fl.d||d.fl.d===S.fl.d&&d.fl.n>S.fl.n))S.fl=d.fl; // бесплатные буквы дня (сколько взято)
  if(isObj(d.gift)&&(!S.gift||d.gift.d>S.gift.d))S.gift=d.gift; // подарок дня за рекламу уже взят
  if(isObj(d.lg)&&(!S.lg||(+d.lg.n||0)>(+S.lg.n||0)||(+d.lg.n||0)===(+S.lg.n||0)&&(+d.lg.d||0)>(+S.lg.d||0)))S.lg=d.lg; // «Гостинцы»: больше взято — главнее
  if(isObj(d.wk)&&(!S.wk||d.wk.w>S.wk.w))S.wk=d.wk; // подарок «Тетради недели» уже получен (неделя — ключ понедельника)
  for(const k of['exAll','catW'])if(+d[k]>(+S[k]||0))S[k]=+d[k]; // счётчики «Отличника» и кота Ять
  if(typeof thMerge==='function')thMerge(d,newer); // темы оформления (js/themes.js): открытые — объединение, ролики — максимум, выбранная — из более нового
  if(typeof payMerge==='function')payMerge(d); // покупки (js/pay.js): купленное, бонусы, токены и заказы VK — объединение
  if(newer){
    const js=typeof JAR_SIZE!=='undefined'?JAR_SIZE:0,jp=typeof JAR_PRIZE!=='undefined'?JAR_PRIZE:0;
    S.coins=Math.max(0,(+d.coins||0)+((+S.coins||0)-BOOT.coins));
    // банка: облако + собранное здесь; переполнилась — приз (раньше лишние слова обрезались)
    let jar=Math.max(0,(+d.jar||0)+((+S.jar||0)-BOOT.jar));if(js)while(jar>=js){jar-=js;S.coins+=jp;}S.jar=jar;
    for(const k of['sound','music'])if(k in d)S[k]=d[k];
    const has=(t,L,id)=>{const it=L&&L.find(x=>x.id===id);return !!it&&(!it.p&&!it.gift||!!(S.own||{})[t+':'+id]);};
    if(has('s',typeof SKINS!=='undefined'&&SKINS,d.skin))S.skin=d.skin;if(has('o',typeof OUTFITS!=='undefined'&&OUTFITS,d.outfit))S.outfit=d.outfit;
    synced({ts:+d.ts,coins:+d.coins||0,jar:+d.jar||0});}
  migrate();return canon(noTs(S))!==before;}
// прочитать облако (при запуске, после входа в Яндекс или повтор после сбоя), слить и отправить итог, если в облаке чего-то не хватает.
// Сбой или битое облако — «прочитано» не ставим (в облако не пишем), пробуем ещё до 3 раз.
async function cloudLoad(){if(cloudBusy||cloudReady||SHOT||cloudFails>=4||!(ysdk||PLAT==='vk'&&VK)||Date.now()-cloudTry<10000)return;cloudBusy=true;cloudTry=Date.now();
  try{let d;
    if(ysdk){if(!YP)YP=await withTimeout(ysdk.getPlayer({scopes:false}),10000);d=await withTimeout(YP.getData(),10000);}
    else d=await vkLoadCloud();
    const ch=mergeSave(d);cloudReady=true;if(isObj(d)&&+d.ts>0&&!S.cl){S.cl=1;try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}}statProg();updCoins();if(ch){try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}}
    if(!d||canon(noTs(d))!==canon(noTs(S)))save(); // в облаке нет того, что есть на устройстве — дописываем
    if(ch&&typeof onCloud==='function')onCloud();
  }catch(e){cloudFails++;if(cloudFails<4)setTimeout(cloudLoad,11000);}finally{cloudBusy=false;}}
// старые сохранения: один незаконченный уровень S.cur → словарь S.curs по ключу уровня
function migrate(){S.curs=isObj(S.curs)?S.curs:{};if(S.cur&&S.cur.key&&!S.curs[S.cur.key])S.curs[S.cur.key]=Object.assign({t:Date.now()},S.cur);delete S.cur;
  if(!isObj(S.ask))S.ask={};if(!isObj(S.tip))S.tip={};
  for(const k of['payT','payV'])if(S[k]!=null&&!Array.isArray(S[k]))S[k]=[];for(const k of['buy','buyB'])if(S[k]!=null&&!isObj(S[k]))S[k]={};
  if(typeof thFix==='function')thFix();} // темы оформления: S.th, S.thU, S.adTot (js/themes.js)
migrate();
// src — откуда монеты (STAT v1.2 earn): lvl, ad, gift, chest, buy, quest; траты (n<0) не считаются
function addCoins(n,src){S.coins=Math.max(0,S.coins+n);if(n>0)STAT.earn(src||'oth',n);save();updCoins();}
function updCoins(){document.querySelectorAll('.cc').forEach(e=>e.textContent=S.coins);STAT.bal(+S.coins||0);}

/* ================= площадка: Яндекс Игры или VK ================= */
// VK передаёт в адрес игры параметры запуска (vk_app_id и др.); ?vk=1 — проверка VK-режима на маке
const PLAT=/[?&](vk_app_id|vk)=/.test(location.search)?'vk':'yandex';
const VK_MOBILE=/[?&]vk_platform=mobile_/.test(location.search); // клиент VK на телефоне (WebView: скачивание файлов не работает)
let ysdk=null,YP=null,VK=null,paused=false,muted=false;
// «сейчас» для дней (задание дня, серия, бесплатная буква, подарок дня): на Яндексе — часы сервера
// (перевод часов на телефоне не даёт лишних дней), иначе — часы устройства
function nowMs(){try{if(ysdk&&ysdk.serverTime){const t=ysdk.serverTime();if(typeof t==='number'&&t>1.6e12)return t;}}catch(e){}return Date.now();}
/*STAT*/
/* ===== STAT v1.2 (04.10.2026; v1 — 29.09): своя ОБЕЗЛИЧЕННАЯ статистика — общий модуль всех игр =====
   Источник — ~/Projects/hobby-analytics/stat/stat.js (правки только тут, в игры — stat-sync.sh). Как встраивать — stat/README.md.
   Никогда не отправляем: vk_user_id и параметры адреса запуска (кроме vk_platform, vk_ref), имя, IP, User-Agent целиком,
   постоянный номер игрока/устройства. Ключ — случайная строка СЕАНСА (только в памяти). На устройстве: день установки, число сеансов,
   день отметки, неотправленные пачки (stat-q-<игра>), признак новой функции (stat-srv), буквы опытов (stat-ab-<игра>-<опыт>).
   v1.2: очередь «без потерь» (включается сама по ответу функции {"v":2} / X-Stat: 2), bd — день пачки по Москве, adReq→ms, offer/hold с n,
   progress→start, bal→cb, ранние ошибки и незагрузившиеся файлы, act, perf, ab+cfg, adchk, earn, idle. Старый синтаксис: только var/function. */
var STAT=(function(){
  var V=1,SV=12,FLUSH=90,MAXQ=40,MAXB=60,PMAX=30,PBYTES=3e5,SESS_GAP=30*60e3,MAXERR=5,THR=2e4;
  var O={},on=false,dev=false,G='',Q=[],pend=[],sk='',seq=0,t0=0,act=0,actT=0,vis=true,hideT=0,timer=0,
      st={c:0,n:0,d:0},hdr={},lvl=null,scr='',errN=0,resN=0,errSeen={},once={},lastErr='',
      srv=false,nm=0,fly={},fails=0,nextT=0,sP=null,sTm=0,prog=null,cb,mvT=0,aR={},thr={},eS=null,aC={},
      cfgO=null,cfgS=0,abs={},rdT=0,acted=0,pre=0,tp=0,fT=0,fS=0,fC=0,fN=0,fH=[],fLo=999,fHg=0,pfS=0;
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
     ?stat=dev на localhost — журнал в консоль и window.__stat без отправки. Площадка yandex на *.github.io пишется как p:'web'. */
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
    hdr={v:V,sv:SV,g:G,gv:String(O.gv||'').slice(0,20),p:String(O.plat==='yandex'&&/\.github\.io$/.test(location.hostname)?'web':O.plat||'').slice(0,8),l:String(O.lang||'').slice(0,4),
      vp:scrub(qp('vk_platform'),16),src:scrub(qp('vk_ref'),32),os:d.os,dv:d.dv,wv:d.wv,br:d.br,sw:d.sw,sh:d.sh,sk:sk};
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
  function adReq(f){aR[f]=Date.now();}
  function thrN(k,n,p){var x=thr[k]||(thr[k]={c:0,t:0}),t=Date.now();x.c++;x.n=n;x.p=p;if(t-x.t>=THR){x.t=t;thrOut(x);}}
  function thrOut(x){if(!x.c)return;x.p.n=x.c;x.c=0;ev(x.n,x.p);}
  function ad(f,r,code){var p={f:f,r:r,p:f==='int'?'int':(place||'?')};if(code!==undefined&&code!==null&&code!=='')p.c=scrub(code,24);
    if(r==='hold'){thrN('h'+p.p,'ad',p);return;}
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
  // --- плавность: STAT.frame() раз за кадр игрового цикла → perf {fps (медиана), lo (худшая секунда), hg (подвисаний > 1 с)} ---
  function frame(){var t=Date.now(),d=t-fT;fT=t;if(d>5000||!fS){fS=t;fC=0;return;}fN++;fC++;if(d>1000)fHg++;
    if(t-fS>=1000){d=Math.min(240,Math.round(fC*1000/(t-fS)));fH[d]=(fH[d]||0)+1;if(d<fLo)fLo=d;fS=t;fC=0;}}
  function perf(){var i,s=0,h=0;if(pfS||fN<300)return;for(i=0;i<=240;i++)s+=fH[i]||0;if(!s)return;pfS=1;for(i=0;i<=240;i++){h+=fH[i]||0;if(h*2>=s)break;}
    ev('perf',{fps:i,lo:fLo,hg:fHg});}

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
  function hide(){if(!on||!vis)return;vis=false;act+=Date.now()-actT;hideT=Date.now();fS=0;rel();var k,p={d:actSec()};
    for(k in thr)thrOut(thr[k]);if(eS){ev('earn',eS);eS=null;}for(k in aC){if(aC[k].y||aC[k].n)ev('adchk',{f:k,y:aC[k].y,n:aC[k].n});aC[k]={y:0,n:0};}
    perf();if(!acted&&tp&&!rdT){acted=1;ev('act',{ms:tp-t0,nr:1});}
    if(lvl)p.l=lvl.l;if(scr)p.sc=scr;if(cb!==undefined)p.cb=cb;if(mvT)p.idle=idle();ev('pause',p);
    while(Q.length)pend.push(pack());keep();beacon();}
  function show(){if(!on||vis)return;vis=true;actT=Date.now();
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
    _dbg:function(){return {on:on,dev:dev,cut:cut,Q:Q,pend:pend,st:st,hdr:hdr,lvl:lvl,lastErr:lastErr,srv:srv,nm:nm,fails:fails,nextT:nextT,sP:!!sP,cb:cb,fN:fN,pl:place};}};
})();
/*/STAT*/
// STAT — своя ОБЕЗЛИЧЕННАЯ статистика (hobby-analytics/stat): без vk_user_id, IP и постоянного номера; выключатель — ⚙ «Анонимная статистика».
// Адрес боевой; на маке/LAN/в headless модуль молчит сам (03.10). ?stat=dev на localhost — журнал [STAT] в консоль без отправки.
// Игра только на русском — lang:'ru' (window.LANG от Яндекса интерфейс не меняет).
const STAT_URL='https://functions.yandexcloud.net/d4efqgmii6honbajplim?op=ev';
STAT.init({g:'slovo',gv:'v2.2-100415',plat:PLAT,lang:'ru',url:STAT_URL,now:()=>nowMs(),S:S});
// STAT v1.2: прогресс на входе — после облака (что позже), но не дольше 2,5 с (иначе модуль сам отправит start без полей через 3 с).
// pl — пройдено уровней, cn — монет, bt — облако хоть раз отдавало сохранение (S.cl — метка на устройстве, ставит cloudLoad)
let statPr=0;function statProg(){if(statPr)return;statPr=1;STAT.progress({pl:+S.lv||0,cn:+S.coins||0,bt:S.cl?1:0});}
setTimeout(statProg,2500);STAT.bal(+S.coins||0);STAT.cfg({snd:S.sound?1:0});
// причины паузы: реклама, пауза от Яндекса, VK свернул игру, вкладка скрыта. Снимаем паузу, только когда ушли все
const PR=new Set();
function setPause(r,on){if(on)PR.add(r);else PR.delete(r);paused=PR.has('ad')||PR.has('sdk')||PR.has('vk');muted=PR.size>0;
  if(AC){if(muted)AC.suspend().catch(()=>{});else if(AC.state!=='running'&&(S.sound||S.music))AC.resume().catch(()=>{});}}
// разметка геймплея для Яндекса; повторные start/stop подряд не отправляем (до готовности SDK — не отмечаем)
const YG={on:false,
  start(){if(this.on||!ysdk)return;this.on=true;try{ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.start();}catch(e){}},
  stop(){if(!this.on)return;this.on=false;try{ysdk&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI.stop();}catch(e){}}
};
// идёт ли сейчас игра: открыт экран уровня, уровень не решён, нет окна и паузы
function inPlay(){return !!(typeof G!=='undefined'&&G&&!G.won&&!paused&&$('game').classList.contains('on')&&!$('modal').classList.contains('on'));}
// на локальном компьютере (разработка) реклама — заглушка; на площадке без SDK/моста — «недоступна», без награды
const LOCAL=/^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname)&&!/[?&]vk_app_id=/.test(location.search);
const AD_FAIL='Реклама сейчас недоступна — загляни чуть позже';
const VK_REAL=/[?&]vk_app_id=/.test(location.search); // настоящий VK (не ?vk=1 на маке): заглушек покупок нет
// можно ли предлагать ролик за награду: есть SDK/мост (или заглушка на своём компьютере). В VK без моста кнопок «за рекламу» нет
const adsOk=()=>!!(VK||ysdk||LOCAL);
// без контекстного меню и «долгого тапа» (требование площадок); можно — поле поиска и картинка открытки (сохранить долгим нажатием)
document.addEventListener('contextmenu',e=>{const t=e.target;if(!(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.classList&&t.classList.contains('cardimg'))))e.preventDefault();});
// iOS: щипок увеличивает страницу вопреки user-scalable=no
document.addEventListener('gesturestart',e=>e.preventDefault());
function loadScript(src,ms){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);setTimeout(no,ms||20000);});}
// ответ VK с ограничением по времени (вне VK мост не отвечает)
function vkSend(method,params,ms){return withTimeout(window.vkBridge.send(method,params||{}),ms||4000);}
/*SOC*/
/* ===== SOC v2.1 (04.10: итоги в STAT — событие soc; v2 — 29.09.2026; v2 — дружит с REF: «Позвать друзей» = ссылка с #ref): друзья, избранное, «Ещё игры во дворе» — ТОЛЬКО VK с мостом; в Яндексе молчит =====
   Общий модуль для всех игр. Источник — ~/Projects/hobby-analytics/soc/soc.js (правки — только там, потом soc-sync.sh).
   Правила VK: 2.6.2 — никаких наград за приглашение/«поделиться»/избранное/экран (разрешено лишь за вступление в сообщество —
   в наших играх НЕ даём); 2.6.3 — само-предложения не в первую сессию, отказ помним, повтор не чаще раза в 30 дней, ≤3 раз.
   Покер (18+) в список не добавлять никогда. 12+ (Дурак, Козёл) — с пометкой «12+».
   Старый синтаксис: без optional chaining и nullish-оператора, без CSS-свойства inset. Нужны из игры: PLAT ('vk'|…), VK (мост после VKWebAppInit или null), vkSend(метод,параметры,мс). */
var SOC=(function(){
  var GROUP=241793582,DAY=864e5,VER=2.1;
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
  // STAT v1.2 (А15): итог предложения площадки → soc {a: fav|home|inv|grp|shr|more, r: show|ok|no|err}; отказ игрока (код 4 / «denied») — no
  function sx(a,r){try{if(typeof STAT!=='undefined'&&STAT.ev)STAT.ev('soc',{a:a,r:r});}catch(e){}}
  function sr(a){return function(e){var d=e&&e.error_data||{};sx(a,d.error_code===4||/denied|cancel/i.test(String(d.error_reason||d.error_msg||''))?'no':'err');};}
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
  function fav(){return send('VKWebAppAddToFavorites').then(function(r){if(r&&r.result)done('fav');sx('fav',r&&r.result?'ok':'no');return !!(r&&r.result);},function(e){sr('fav')(e);tried('fav');return false;});}
  function home(){return send('VKWebAppAddToHomeScreen').then(function(r){if(r&&r.result){done('home');homeOk=false;}sx('home',r&&r.result?'ok':'no');return !!(r&&r.result);},function(e){sr('home')(e);tried('home');return false;});}
  // «Приведи друга» (модуль REF, если он есть в игре и включён): вместо окна приглашения — ссылка с меткой #ref=<id>,
  // иначе друг, открывший игру с телефона, не засчитается (окно приглашения передаёт автора только на сайте ВК)
  function refOn(){return typeof REF!=='undefined'&&!!REF&&typeof REF.on==='function'&&REF.on();}
  function invite(){if(refOn())return send('VKWebAppShare',{link:REF.link()}).then(function(){done('inv');sx('inv','ok');return true;},function(e){sr('inv')(e);tried('inv');return false;});
    return send('VKWebAppShowInviteBox').then(function(r){if(r&&r.success!==false)done('inv');sx('inv',r&&r.success!==false?'ok':'no');return true;},function(e){sr('inv')(e);tried('inv');return false;});}
  function share(){return send('VKWebAppShare',{link:refOn()?REF.link():'https://vk.com/app'+APP}).then(function(){sx('shr','ok');return true;},function(e){sr('shr')(e);return false;});}
  function group(){return send('VKWebAppJoinGroup',{group_id:GROUP}).then(function(r){if(r&&r.result)done('grp');sx('grp',r&&r.result?'ok':'no');return !!(r&&r.result);},function(e){sr('grp')(e);tried('grp');return false;});}
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
    if(!o)return null;asked=true;sx(o.k,'show');if(o.k==='more'){st.more={t:Date.now()};saveFn();}else tried(o.k);return o;}

  return {v:VER,ok:ok,init:init,ready:ready,merge:merge,fav:fav,home:home,invite:invite,share:share,group:group,open:open,list:list,
    settingsHtml:settingsHtml,bind:bind,showMore:showMore,offer:offer,games:GAMES};
})();
/*/SOC*/
SOC.init(S,{save:()=>save(),toast:t=>toast(t),cls:'btn ghost',modal:h=>{modal(h);return $('mcard');},close:()=>hideModal()});

/* ---------- облако VK ----------
   Значение — до 4096 байт, на деле надёжно ~2 КБ: режем JSON на куски по 900 символов (кириллица — 2 байта).
   Два набора кусков (sva0…, svb0…) по очереди: новый пишем последовательно, по одному, а указатель svn
   («a:кусков:длина:хэш») — последним. Пока новый набор не дописан, старый цел. При чтении сверяем длину и хэш:
   не сошлось — облако «битое», его НЕ считаем пустым и не затираем. Старый формат (svn = число, sv0…) читаем. */
const VK_CHUNK=900,VK_MAXCH=60,vkSent={};let vkSlot=null,vkBusy=false,vkAgain=false;
function vkHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
const vkBroken=()=>Object.assign(new Error('broken'),{broken:true});
async function vkSet(k,v){if(vkSent[k]===v)return;delete vkSent[k];await vkSend('VKWebAppStorageSet',{key:k,value:v},8000);vkSent[k]=v;}
async function vkSaveCloud(){if(vkBusy){vkAgain=true;return;}vkBusy=true;
  try{do{vkAgain=false;const str=JSON.stringify(S),n=Math.ceil(str.length/VK_CHUNK);if(n>VK_MAXCH)break;
      const snap=bootSnap(),slot=vkSlot==='a'?'b':'a';
      for(let i=0;i<n;i++)await vkSet('sv'+slot+i,str.slice(i*VK_CHUNK,(i+1)*VK_CHUNK));
      await vkSet('svn',slot+':'+n+':'+str.length+':'+vkHash(str));vkSlot=slot;synced(snap);
    }while(vkAgain);}catch(e){}finally{vkBusy=false;}}
async function vkLoadCloud(){
  const r0=await vkSend('VKWebAppStorageGet',{keys:['svn']},8000),p0=((r0&&r0.keys)||[]).find(k=>k.key==='svn'),svn=p0&&p0.value||'';
  if(!svn)return null; // облака нет — новый игрок
  let slot='',n=0,len=-1,hash='';
  if(/^\d+$/.test(svn))n=+svn;else{const p=svn.split(':');slot=p[0];n=+p[1];len=+p[2];hash=p[3]||'';if(slot!=='a'&&slot!=='b')throw vkBroken();}
  if(!(n>0&&n<=VK_MAXCH))throw vkBroken();
  const keys=[];for(let i=0;i<n;i++)keys.push('sv'+slot+i);
  const r=await vkSend('VKWebAppStorageGet',{keys},8000),m={};((r&&r.keys)||[]).forEach(k=>m[k.key]=k.value);
  let str='';for(const k of keys){if(typeof m[k]!=='string'||!m[k])throw vkBroken();str+=m[k];}
  if(len>=0&&(str.length!==len||vkHash(str)!==hash))throw vkBroken();
  let d;try{d=JSON.parse(str);}catch(e){throw vkBroken();}
  if(!isObj(d))throw vkBroken();
  for(const k of keys)vkSent[k]=m[k];vkSent.svn=svn;vkSlot=slot||null;return d;}

// VK web: высота окна под экран браузера (модерация VK 29.09: VKWebAppResizeWindow)
var VK_FIT={top:130,min:560,max:900,last:0,t:0};
function vkFit(vh){if(!vh||!window.vkBridge)return;
  var h=Math.round(Math.max(VK_FIT.min,Math.min(VK_FIT.max,vh-VK_FIT.top)));
  if(Math.abs(h-VK_FIT.last)<8)return;VK_FIT.last=h;
  var w=Math.max(600,Math.min(1000,window.innerWidth||911));
  vkSend('VKWebAppResizeWindow',{width:w,height:h},8000).catch(function(){VK_FIT.last=0;});}
function vkFitInit(){try{
  window.vkBridge.subscribe(function(e){var d=e&&e.detail;
    if(d&&d.type==='VKWebAppUpdateConfig'&&d.data&&d.data.viewport_height){clearTimeout(VK_FIT.t);
      VK_FIT.t=setTimeout(function(){vkFit(d.data.viewport_height);},200);}});
  vkSend('VKWebAppGetConfig',{},8000).then(function(c){if(c&&c.viewport_height)vkFit(c.viewport_height);}).catch(function(){});
}catch(e){}}

async function initSDK(){
  // меню (или первый уровень для новичка) — сразу; SDK/мост и облако догружаем следом, облако сольётся в onCloud
  if(typeof onReady==='function')onReady();
  if(PLAT==='vk'){
    try{if(!window.vkBridge)await loadScript('js/vk-bridge.min.js');
      await vkSend('VKWebAppInit',{},20000);VK=window.vkBridge;vkFitInit();SOC.ready();if(typeof updMore==='function')updMore();
      VK.subscribe(e=>{const t=e.detail&&e.detail.type;if(t==='VKWebAppViewHide'){setPause('vk',true);clearTimeout(cloudT);cloudT=0;cloudSave();}else if(t==='VKWebAppViewRestore'){setPause('vk',false);if(typeof adBack==='function')adBack();}});
      Promise.resolve(cloudLoad()).then(payInit,payInit);if(typeof askProbe==='function')askProbe();if(typeof updGift==='function')updGift();
      adPreload(); // adfix: подгрузка ролика за награду; «не готов» — переспросим в фоне
    }catch(e){VK=null;}
    if(!VK)payInit(); // покупки VK: с мостом — после облака (выше); без моста — только заглушка ?vk=1&paytest=1 на маке
    return;
  }
  if(/[?&]nosdk/.test(location.search))return;
  try{await loadScript('/sdk.js');}catch(e){}
  if(!window.YaGames){payInit();return;}
  try{ysdk=await withTimeout(YaGames.init(),20000);}catch(e){ysdk=null;return;}
  // игра только на русском: язык из SDK читаем, но интерфейс не меняем (в консоли выбран только русский)
  try{window.LANG=ysdk.environment.i18n.lang||'ru';}catch(e){window.LANG='ru';}
  try{ysdk.on&&ysdk.on('game_api_pause',()=>setPause('sdk',true));ysdk.on&&ysdk.on('game_api_resume',()=>setPause('sdk',false));}catch(e){}
  try{ysdk.features.LoadingAPI&&ysdk.features.LoadingAPI.ready();}catch(e){}
  // числа рекламы и цены — флагами из консоли Яндекса (applyFlags в game.js, рамки жёсткие); нет флагов — остаются как в коде
  try{ysdk.getFlags&&ysdk.getFlags().then(f=>{if(typeof applyFlags==='function')applyFlags(f);}).catch(()=>{});}catch(e){}
  if(typeof updGift==='function')updGift();
  if(inPlay())YG.start();
  Promise.resolve(cloudLoad()).then(payInit,payInit);if(typeof askProbe==='function')askProbe();
}
// покупки (js/pay.js) — после SDK/моста и облака; меню не ждёт
function payInit(){if(typeof PAY!=='undefined')PAY.init();}

/* ---------- реклама ---------- */
function stubAd(cb){const ad=$('ad'),tEl=$('adT');adOpen();ad.classList.add('on');let n=3;tEl.textContent=n;
  const it=setInterval(()=>{n--;tEl.textContent=n;if(n<=0){clearInterval(it);ad.classList.remove('on');adClose();cb();}},600);}
function adOpen(){setPause('ad',true);YG.stop();}
function adClose(){setPause('ad',false);setTimeout(()=>{if(inPlay())YG.start();},0);} // награда могла открыть или закрыть окно — решаем после неё
/* adfix (03.10): «ролика нет» — VK отвечает ошибкой 20 ('No ads'), чаще всего на компьютере: ролик ещё не подгрузился, готов он бывает через 10–60 с.
   Раньше игрок видел «недоступна» и жал кнопку по нескольку раз. Теперь:
   1) отказ «ролика нет» → один тихий автоповтор через AD_RETRY_MS под надписью «Ролик загружается…» (игра на паузе, нажать ничего нельзя);
   2) снова нет → не ошибка, а «Ролик будет через несколько секунд…»; кнопки «за рекламу» (AD_BTN_SEL) гаснут, игра в фоне раз в AD_POLL_MS спрашивает VK (Check);
      VK ответил «готов» (но не раньше AD_COOL_MIN) → кнопки загораются и «Ролик готов»; ответа нет — загораются сами через AD_COOL_MS.
      Нажатие по погасшей кнопке VK не дёргает — только «ещё загружается».
   3) заранее: Check при запуске и после каждого показа; если VK сказал «не готов» — переспрашиваем в фоне (до 6 раз), чтобы к нажатию ролик уже был.
   Ответу Check «не готов» как запрету не верим (бывает ложным) — кнопку из-за него не гасим. Автоповтор — только на «ролика нет», не на закрытый ролик.
   Награда — по-прежнему только за досмотр (result:true / onRewarded) и один раз. Статистика: ok+c='retry' — спас автоповтор; none — ролика не было и после повтора.
   Тот же приём — во всех играх (журнал hobby-analytics/release-f/ads-fail.md, раздел «ОБРАЗЕЦ»; эта игра — ads-slovo.md).
   AD_BTN_SEL: общего класса у рекламных кнопок нет — перечислены по id; новая кнопка «за рекламу» — добавь её сюда. #btnGift гаснет только как «Подарок дня» (ghost), «Гостинец» (gold) — без рекламы. */
const AD_RETRY_MS=3000,AD_COOL_MS=30000,AD_COOL_MIN=8000,AD_POLL_MS=5000,AD_BTN_SEL='#mAd,#jfX2:not([disabled]),#mX2:not([disabled]),#mChX2:not([disabled]),#mFix,#btnGift.ghost,.thad';let adCoolT=0,adCoolS=0,adDimT=0,adChkT=0,adRdyT=0;
function adErrCode(e){const d=e&&e.error_data||{};return d.error_code||d.error_reason||(e&&(e.error_type||e.message))||'';} // код VK, иначе причина словами — в статистику
function adNoFill(e){const d=e&&e.error_data||{};return +d.error_code===20||/no ads?\b/i.test(String(d.error_reason||''));}
function adSoon(){return 'Ролик будет через несколько секунд — кнопка загорится, когда он загрузится';}
// подгрузка ролика заранее; «не готов» — переспросить n раз (каждые AD_POLL_MS); «готов» во время паузы кнопок — зажечь их
function adPreload(n){if(!VK)return;clearTimeout(adChkT);n=n===undefined?6:n;const again=()=>{if(n>0)adChkT=setTimeout(()=>adPreload(n-1),AD_POLL_MS);};
  vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).then(r=>{STAT.adChk('rew',r&&r.result?1:0);if(r&&r.result)adReady();else again();},()=>{STAT.adChk('rew',0);again();});}
function adReady(){if(Date.now()>=adCoolT)return;clearTimeout(adRdyT);adRdyT=setTimeout(()=>{if(Date.now()>=adCoolT)return;adCoolT=0;adDim();let vis=false;try{const q=document.querySelectorAll(AD_BTN_SEL);for(let i=0;i<q.length;i++)if(q[i].offsetParent)vis=true;}catch(e){}if(vis&&!adBusy)toast('Ролик готов — можно смотреть');},Math.max(0,adCoolS+AD_COOL_MIN-Date.now()));}
function adWait(on,txt,exit){let w=document.getElementById('adWait');if(!on){if(w)w.style.display='none';return;}
  if(!w){w=document.createElement('div');w.id='adWait';w.style.cssText='position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:rgba(0,0,0,.74);color:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;font-weight:800;font-size:20px;line-height:1.35';document.body.appendChild(w);}
  w.textContent=txt||'Ролик загружается…';
  if(exit){const n=document.createElement('div');n.style.cssText='margin-top:14px;font-weight:600;font-size:16px;max-width:340px';n.textContent='Ролик уже закрыт, а награды нет? Можно не ждать: подтвердится просмотр — награду отдам.';w.appendChild(n);
    const b=document.createElement('button');b.id='adExit';b.className='noenter';b.textContent='Продолжить без награды';b.style.cssText='margin-top:18px;min-height:52px;padding:12px 22px;border:0;border-radius:14px;background:#fff;color:#222;font:inherit;font-size:18px;cursor:pointer';b.onclick=exit;w.appendChild(b);}
  w.style.display='flex';}
// кнопки «за рекламу» гаснут, пока идёт пауза (окна перерисовываются — поэтому раз в секунду); гаснут через opacity, не disabled: нажатие по погасшей объясняет
function adDim(){clearTimeout(adDimT);const off=Date.now()<adCoolT;try{const q=document.querySelectorAll(AD_BTN_SEL);for(let i=0;i<q.length;i++)q[i].style.opacity=off?'.45':'';}catch(e){}if(off)adDimT=setTimeout(adDim,1000);}
function adCool(){adCoolS=Date.now();adCoolT=adCoolS+AD_COOL_MS;adDim();adPreload();}
/* adt (04.10): обрыв ролика через 60 с. Раньше показ ждал ответа VK 60 с (vkSend(…,60000)), потом писал «недоступна», а поздний ответ «досмотрел» никто не слушал —
   на Android так кончалось каждое пятое нажатие: ролик посмотрен, награды нет. Теперь:
   1) ответа площадки ждём AD_WAIT_MS (180 с); игра всё это время на паузе «ad» (звук выключен, как при рекламе);
   2) ролик закрылся, а ответа нет: по знаку «игрок вернулся» (adBack: вкладка снова видна, окно получило фокус, VK вернул игру, нажатие по игре позже AD_TAP_MS)
      через AD_CHK_MS — надпись «Проверяем просмотр ролика…», через AD_EXIT_MS от знака — кнопка «Продолжить без награды». Знака нет — считаем им 60-ю секунду
      (надпись под роликом никому не мешает);
   3) вышли без ответа (кнопка или 180 с) — игра снята с паузы, onFail (кнопка рекламы снова живая), но ответ слушаем дальше. Пришёл ПОЗДНИЙ «досмотрел» —
      награда один раз (тот же флаг paid) по правилу места: третий параметр showRewarded(cb,onFail,late). late() сам выдаёт награду, если она ещё уместна,
      иначе замену (adLateCoins(n) — монеты по полной цене обещанного; цены в монетах нет — ECO.adCoins), и возвращает слова для надписи («держи монеты: +10»); вернул '' — выдавать нечего
      (награду уже получили другим роликом). Идёт другой ролик или игра свёрнута — поздняя награда ждёт. Поздний отказ — ничего не даём;
   4) статистика (секунды ожидания — поле w): ok c=slow — ответ пришёл на 60–180-й секунде (раньше оборвался бы); ok c=late — засчитано после выхода,
      ok c=latec — заменено монетами, ok c=late0 — выдавать было нечего; err c=timeout (w=180) / c=exit (игрок вышел кнопкой) — ответ так и не пришёл
      (пишется через AD_LATE_MS после выхода или когда игру свернули; пришёл ответ ещё позже — событие с dup:1); fail c=late / skip c=late / err c=late:код — поздний отказ.
   Яндекс: таймера там не было (колбэки живут сами), добавлены та же надпись, выход и учёт — чтобы пауза не висела, если SDK не ответит.
   Образец для остальных игр — hobby-analytics/release-g/ads-timeout.md, раздел «ОБРАЗЕЦ». Числа — let, а не const: стенд их укорачивает. */
let AD_WAIT_MS=180000,AD_SLOW_MS=60000,AD_CHK_MS=1500,AD_EXIT_MS=15000,AD_TAP_MS=5000,AD_LATE_MS=600000;
const AD_CHK='Проверяем просмотр ролика…';
let adW=null,adPl='',adLateC=0;const adLateQ=[];
// место рекламы (STAT.place) запоминаем сами: позднее событие пишется после выхода, когда место у модуля уже другое; модуль STAT не правим
{const sp=STAT.place;STAT.place=function(p){adPl=String(p||'');return sp.apply(STAT,arguments);};}
// позднее событие ролика (после выхода игрока): ms — от нажатия (STAT v1.2; раньше — секунды w); x.p — место, x.dup — «ответ не пришёл» уже записано
function adStat(r,c,ms,x){const p={f:'rew',r:r,p:x&&x.p||adPl||'?',ms:ms};if(c!==''&&c!=null)p.c=String(c).slice(0,24);if(x&&x.dup)p.dup=1;STAT.ev('ad',p);}
// ожидание ответа: rel('timeout'|'exit') — отпустить игрока без ответа
function adWatch(rel){adUnwatch();const w=adW={t0:Date.now(),back:0,rel:rel};w.tS=setTimeout(adBack,AD_SLOW_MS);w.tW=setTimeout(()=>{if(adW===w)rel('timeout');},AD_WAIT_MS);}
function adUnwatch(){const w=adW;if(!w)return;adW=null;clearTimeout(w.tS);clearTimeout(w.tW);clearTimeout(w.tC);clearTimeout(w.tE);adWait(0);}
function adBack(){const w=adW;if(!w||w.back)return;w.back=Date.now();
  w.tC=setTimeout(()=>{if(adW===w)adWait(1,AD_CHK);},AD_CHK_MS);
  w.tE=setTimeout(()=>{if(adW===w)adWait(1,AD_CHK,()=>w.rel('exit'));},AD_EXIT_MS);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)adBack();else adLateFlush();});
window.addEventListener('focus',adBack);window.addEventListener('pagehide',adLateFlush);
['pointerdown','touchstart','keydown'].forEach(n=>document.addEventListener(n,()=>{if(adW&&Date.now()-adW.t0>=AD_TAP_MS)adBack();},true));
// вышли без ответа: событие «так и не пришло» откладываем (вдруг придёт), но не дольше AD_LATE_MS и не дальше сворачивания игры
function adLatePend(rec){adLateQ.push(rec);rec.tF=setTimeout(()=>adLateFin(rec),AD_LATE_MS);}
function adLateFin(rec){if(rec.fin||rec.hold)return;rec.fin=1;clearTimeout(rec.tF);const i=adLateQ.indexOf(rec);if(i>=0)adLateQ.splice(i,1);adStat('err',rec.exit?'exit':'timeout',rec.w,{p:rec.p});}
function adLateFlush(){adLateQ.slice().forEach(adLateFin);}
// поздний ответ пришёл: r/c — что писать; после уже записанного «не пришло» отказ не пишем, а «досмотрел» пишем с dup
function adLateEnd(rec,r,c){const dup=rec.fin;rec.fin=1;clearTimeout(rec.tF);const i=adLateQ.indexOf(rec);if(i>=0)adLateQ.splice(i,1);if(dup&&r!=='ok')return;
  adStat(r,c,Date.now()-rec.t0,{p:rec.p,dup:dup});}
// замена награды, которая уже неуместна (уровень пройден, окно закрыто): монеты по ПОЛНОЙ цене обещанного (n — из констант игры: PRICE.word, PRICE.letter);
// у награды нет цены в монетах (серия, примерка темы) — цена одного ролика ECO.adCoins
function adLateCoins(n){n=n>0?n:ECO.adCoins;adLateC=1;addCoins(n,'ad');SND.coin();return 'держи монеты: +'+n;}
// за награду — по желанию игрока; пока ролик идёт, повторные нажатия не запускают второй (и не дают двойную награду)
let adBusy=false;
function showRewarded(cb0,onFail0,late0){
  if(adBusy)return;
  if(Date.now()<adCoolT){STAT.ad('rew','hold');toast('Ролик ещё загружается — подожди несколько секунд');if(onFail0)onFail0();return;} // пауза кнопок: площадку не дёргаем; STAT — «нажал по погасшей» (не чаще раза в 20 с, n)
  adBusy=true;clearTimeout(showRewarded._t);showRewarded._t=setTimeout(()=>{adBusy=false;adWait(0);},AD_WAIT_MS*2+AD_RETRY_MS+15000);
  STAT.adReq('rew'); // STAT v1.2: нажатие → ms в итоговом ad
  const t0=Date.now(),rec={p:adPl,t0:t0,fin:0};adPl='';
  let paid=false,st=0; // st: 0 — ждём ответ, 1 — ответ получен, 2 — игрока отпустили без ответа (слушаем поздний)
  const cb=()=>{if(paid)return;paid=true;adBusy=false;lastRew=Date.now();cb0();},onFail=()=>{adBusy=false;lastRew=Date.now();onFail0&&onFail0();};
  const stat=(r,c)=>STAT.ad('rew',r,Date.now()-t0>=AD_SLOW_MS?c||'slow':c); // ms ставит модуль; место живёт до итога
  const rel=why=>{if(st)return;st=2;rec.w=Date.now()-t0;rec.exit=why==='exit';adUnwatch();adClose();adPreload();
    toast(rec.exit?'Хорошо. Подтвердится просмотр — награду отдам':'Не дождалась ответа о просмотре. Придёт — награду отдам',4500);onFail();adDim();adLatePend(rec);};
  const lateOk=()=>{if(paid)return;rec.hold=1;if(adBusy||interOn||document.hidden){setTimeout(lateOk,1000);return;} // другой ролик или игра свёрнута — подождём (hold: «не пришло» уже не пишем)
    paid=true;lastRew=Date.now();adLateC=0;let m='';try{m=late0&&late0()||'';}catch(e){}
    adLateEnd(rec,'ok',m?(adLateC?'latec':'late'):'late0');if(m)toast('Просмотр подтвердился — '+m,4500);};
  if(VK){
    let tries=0;
    const go=()=>{adOpen();adWatch(rel);window.vkBridge.send('VKWebAppShowNativeAds',{ad_format:'reward'}).then(r=>{
        if(st===2){if(r&&r.result)lateOk();else adLateEnd(rec,'fail','late');return;}
        if(st)return;st=1;adUnwatch();adClose();
        if(r&&r.result){stat('ok',tries?'retry':'');adPreload();cb();}else{stat('fail','noresult');toast(AD_FAIL);adPreload();onFail();}
      },e=>{
        if(st===2){adLateEnd(rec,'err','late:'+adErrCode(e));return;}
        if(st)return;adUnwatch();
        if(adNoFill(e)&&!tries){tries=1;adWait(1);adPreload();setTimeout(()=>{adWait(0);go();},AD_RETRY_MS);return;} // ролика нет — один тихий повтор; игра остаётся на паузе (adClose — после него)
        st=1;adClose();if(adNoFill(e)){stat('none',adErrCode(e));toast(adSoon());adCool();}else{stat('err',adErrCode(e));toast(AD_FAIL);adPreload();}
        onFail();adDim();});};
    go();return;}
  if(!VK&&!ysdk){if(LOCAL){STAT.ad('rew','ok','stub');stubAd(cb);}else{STAT.ad('rew','fail',PLAT==='vk'?'nobridge':'nosdk');toast(AD_FAIL);onFail();}return;} // мост/SDK не ответили — награду даром не даём
  let got=false;adWatch(rel);
  // поздние колбэки (после выхода): ролик мог открыться и поставить паузу — снимаем её, если не идёт другой ролик
  const lateY=f=>{if(!adBusy)adClose();f();};
  ysdk.adv.showRewardedVideo({callbacks:{onOpen:adOpen,onRewarded:()=>{got=true;},
    onClose:()=>{if(st===2){lateY(()=>{if(got)lateOk();else adLateEnd(rec,'skip','late');});return;}if(st)return;st=1;adUnwatch();
      adClose();stat(got?'ok':'skip','');if(got)cb();else{toast('Досмотри ролик до конца — тогда награда твоя');onFail();}},
    onError:()=>{if(st===2){lateY(()=>adLateEnd(rec,'err','late'));return;}if(st)return;st=1;adUnwatch();
      adClose();stat('err','');toast(AD_FAIL);adCool();onFail();adDim();}}});
}
// межэкранная (отчёт 12, 27.09): после ЛЮБОГО пройденного уровня («Дальше», «В меню» в окне победы) и при входе в уровень из меню
// («Играть», выбор уровня, задание дня) — только в этот момент перехода: не по таймеру, никогда во время уровня и не при запуске.
// Защита новичка: не раньше AD.minLv-го уровня и не в первые AD.sess с сессии. Не чаще раза в AD.gap с и не раньше AD.afterRew с
// после ролика за награду. Площадки ещё и сами ограничивают частоту (VK — не чаще 30 с). Числа — флагами Яндекса (applyFlags, game.js).
const AD={gap:180,afterRew:90,minLv:8,sess:180};
let lastInter=0,lastRew=0,interOn=false,interNext=null;
function interDue(){const now=Date.now();
  return !SHOT&&!(typeof PAY!=='undefined'&&PAY.own('no_ads'))&&!!(ysdk||VK||LOCAL)&&S.lv>=AD.minLv&&now-T0>=AD.sess*1000&&now-lastInter>=AD.gap*1000&&now-lastRew>=AD.afterRew*1000;}
// STAT v1.2: межэкранная положена (не новичок, без no_ads), но не показана — ad int none: gap — рано после прошлой, cap — рано после ролика за награду, nosdk — нет SDK/моста
function interWhy(){if(SHOT||(typeof PAY!=='undefined'&&PAY.own('no_ads'))||S.lv<AD.minLv||Date.now()-T0<AD.sess*1000)return;
  const c=!(ysdk||VK||LOCAL)?'nosdk':Date.now()-lastInter<AD.gap*1000?'gap':'cap';STAT.ad('int','none',c);}
function maybeInterstitial(cb){
  if(interOn){interNext=cb;return;} // реклама уже идёт — второй переход сделаем после неё (последний выбранный)
  S.plays=(S.plays||0)+1;
  if(!interDue()){interWhy();cb();return;}
  // показ не состоялся (площадка отказала, нет рекламы) — паузу не засчитываем, попробуем на следующем переходе
  const prev=lastInter;lastInter=Date.now();interOn=true;const done=()=>{interOn=false;const f=interNext||cb;interNext=null;f();};
  STAT.adReq('int');
  if(VK){const fin=()=>{adClose();done();};adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).then(r=>{if(r&&r.result)STAT.ad('int','show');else STAT.ad('int','none','nofill');if(!(r&&r.result))lastInter=prev;}).catch(e=>{if(adNoFill(e))STAT.ad('int','none','nofill');else STAT.ad('int','err',adErrCode(e));lastInter=prev;})
      .then(fin,fin);return;} // не .finally: в старых WebView его нет
  if(!ysdk){STAT.ad('int','show','stub');stubAd(done);return;} // свой компьютер — заглушка
  ysdk.adv.showFullscreenAdv({callbacks:{onOpen:adOpen,onClose:shown=>{if(shown!==false)STAT.ad('int','show');else STAT.ad('int','none','nofill');if(shown===false)lastInter=prev;adClose();done();},onError:()=>{STAT.ad('int','err','sdk');lastInter=prev;adClose();done();}}});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){setPause('hidden',true);clearTimeout(cloudT);cloudT=0;cloudSave(true);}else setPause('hidden',false);});

/* ================= звук (синтез, без файлов) ================= */
// общий выход: регулятор громкости + компрессор (сумма звуков не хрипит)
let AC=null,OUT=null;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();
      const c=AC.createDynamicsCompressor();c.threshold.value=-14;c.knee.value=8;c.ratio.value=4;c.attack.value=.004;c.release.value=.2;
      OUT=AC.createGain();OUT.gain.value=.9;OUT.connect(c);c.connect(AC.destination);}catch(e){AC=null;}}
  // iOS после звонка/Siri ставит состояние interrupted — будим при любом, кроме running
  if(AC&&AC.state!=='running'&&!muted)AC.resume().catch(()=>{});return AC;}
function tone(f,d,type,v,f2,delay){if(!S.sound||muted)return;const a=ac();if(!a)return;const t=a.currentTime+(delay||0);
  const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
  if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.12,t+.012);g.gain.exponentialRampToValueAtTime(.0008,t+d);
  o.connect(g).connect(OUT);o.start(t);o.stop(t+d+.03);}
// лёгкая вибрация на найденное слово (Android; в VK — «таптик» через мост, он есть и на iPhone). Выключатель — ⚙️ «Вибрация» (S.vib)
const CAN_VIB=typeof navigator.vibrate==='function';
function buzz(kind){if(S.vib===0||paused)return;
  if(PLAT==='vk'&&VK&&VK_MOBILE){vkSend(kind==='bad'?'VKWebAppTapticNotificationOccurred':'VKWebAppTapticImpactOccurred',
    kind==='bad'?{type:'warning'}:{style:kind==='long'||kind==='win'?'medium':'light'},1500).catch(()=>{});return;}
  // до первого касания браузер вибрацию не пускает (и ругается в консоли) — не просим
  if(CAN_VIB&&!(navigator.userActivation&&!navigator.userActivation.hasBeenActive))try{navigator.vibrate(kind==='long'?[18,60,30]:kind==='win'?[25,70,25,70,45]:kind==='bad'?[35]:14);}catch(e){}}
// меньше движения: системная настройка «уменьшить движение» — без летающих букв и печатей
const CALM=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const NOTES=[523.25,587.33,659.25,698.46,783.99,880,987.77,1046.5,1174.66];
const SND={
  letter(i){tone(NOTES[Math.min(i,8)],.16,'triangle',.13);},
  // слово: чем длиннее, тем выше и богаче (7–8 букв — аккорд в конце); серия — каждое следующее на полтона выше (до +6)
  word(n,combo){const up=Math.pow(2,Math.min(combo||0,6)/12),seq=n>=5?[0,2,4,7]:[0,2,4];
    seq.forEach((k,i)=>tone(NOTES[k]*up,.22,'triangle',.11,0,i*.07));
    if(n>=7){const t=seq.length*.07+.02;[NOTES[4],NOTES[7],NOTES[7]*1.26].forEach(f=>tone(f*up,.5,'triangle',.07,0,t));}
    else if(n>=5)tone(NOTES[8]*up,.3,'sine',.06,0,seq.length*.07);},
  bonus(){tone(1318,.12,'sine',.1,0,0);tone(1760,.2,'sine',.09,0,.08);},
  bad(){tone(220,.22,'sawtooth',.05,150);tone(185,.25,'square',.03,120,.05);},
  old(){tone(440,.12,'sine',.08);tone(440,.12,'sine',.08,0,.14);},
  open(){tone(1567,.1,'sine',.07);},
  win(){[0,2,4,7,4,7].forEach((n,i)=>tone(NOTES[n]*(i>3?2:1),.3,'triangle',.11,0,i*.11));},
  coin(){tone(1975,.08,'square',.04);tone(2637,.14,'square',.04,0,.06);},
  tap(){tone(700,.05,'sine',.06);},
  shuffle(){for(let i=0;i<5;i++)tone(400+i*90,.05,'triangle',.05,0,i*.035);},
  meow(){tone(700,.35,'sawtooth',.03,1100);tone(1100,.25,'triangle',.05,600,.2);}
};
// разблокировка звука: браузеры разрешают его только из «жеста» (на телефоне это touchend/click, а не pointerdown).
// Слушаем всегда (iOS может снова приостановить звук после звонка); при первом разе проигрываем пустой звук — старый приём для iOS
let unlocked=false;
function unlockAudio(){if(!S.music&&!S.sound)return;const a=ac();if(!a)return;
  if(!unlocked){unlocked=true;try{const s=a.createBufferSource();s.buffer=a.createBuffer(1,1,22050);s.connect(a.destination);s.start(0);}catch(e){}}}
['pointerdown','touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));

/* ================= музыка: записанный трек (audio/tea.m4a) =================
   «Black Tea Rag» (decimnet, CC BY 4.0) — подпись в «Благодарностях» (ui.js, openCredits).
   Трек моно (в памяти после раскрытия ~18 МБ, а не 35). Web Audio: fetch → decodeAudioData → AudioBufferSourceNode с loop.
   Грузится лениво, после первого касания; до загрузки — тишина. Сбой сети — ещё 2 попытки (через 20 и 40 с), скачанное
   заново не качаем; браузер не умеет AAC — больше не пробуем. musTick() раз в 200 мс сам включает/глушит (выключатель,
   реклама, сворачивание) и помнит место в треке. Поменять трек — MUSF; громкость — MUS_VOL. */
const MUSF={tea:'audio/tea.m4a'},MUS_VOL=.2;
const MUS={buf:{},ld:{},ab:{},tries:{},cur:null,src:null,g:null,t0:0,off:0,v:0,fade:0,pos:{}};
function musWant(){return S.music&&!muted&&!paused&&!document.hidden?'tea':null;}
// края трека: пропускаем тишину кодека в начале/конце, чтобы на стыке петли не было паузы
function musEdges(b){const sr=b.sampleRate,n=b.length,lim=Math.min(n>>1,sr*2),th=.002,chs=[];for(let c=0;c<b.numberOfChannels;c++)chs.push(b.getChannelData(c));
  const loud=i=>chs.some(d=>Math.abs(d[i])>th);let i0=0,i1=n-1;while(i0<lim&&!loud(i0))i0++;while(i1>n-lim&&!loud(i1))i1--;
  b._ls=i0<lim?i0/sr:0;b._le=i1>n-lim?(i1+1)/sr:b.duration;}
// на случай стерео-файла: сводим в моно (вдвое меньше памяти)
function musMono(b){if(b.numberOfChannels<2)return b;try{const m=AC.createBuffer(1,b.length,b.sampleRate),o=m.getChannelData(0),k=1/b.numberOfChannels;
  for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++)o[i]+=d[i]*k;}return m;}catch(e){return b;}}
function musLoad(n){const l=MUS.ld[n];if(MUS.buf[n]||!AC||l===1||l===-1||(l&&performance.now()<l))return;MUS.ld[n]=1;let dec=false;
  (MUS.ab[n]?Promise.resolve(MUS.ab[n]):fetch(MUSF[n]).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.arrayBuffer();}).then(ab=>(MUS.ab[n]=ab)))
    .then(ab=>{dec=true;return new Promise((ok,no)=>{const p=AC.decodeAudioData(ab.slice(0),ok,no);if(p&&p.catch)p.catch(no);});})
    .then(b=>{b=musMono(b);musEdges(b);MUS.buf[n]=b;MUS.ld[n]=0;delete MUS.ab[n];})
    .catch(()=>{const t=MUS.tries[n]=(MUS.tries[n]||0)+1;if(dec||t>=3){MUS.ld[n]=-1;delete MUS.ab[n];}else MUS.ld[n]=performance.now()+20000*t;});}
function musPos(){const b=MUS.buf[MUS.cur],L=b._le-b._ls;return b._ls+((MUS.off-b._ls)+(AC.currentTime-MUS.t0))%L;}
function musStart(n,v,fade){const a=AC,b=MUS.buf[n],t=a.currentTime,s=a.createBufferSource(),g=a.createGain();
  s.buffer=b;s.loop=true;s.loopStart=b._ls;s.loopEnd=b._le;const off=MUS.pos[n]!=null?MUS.pos[n]:b._ls;delete MUS.pos[n];
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+fade);s.connect(g).connect(OUT);s.start(t,off);
  Object.assign(MUS,{cur:n,src:s,g,t0:t,off,v,fade:t+fade});}
function musStop(fade,keep){const a=AC,s=MUS.src,g=MUS.g,t=a.currentTime;if(keep)MUS.pos[MUS.cur]=musPos();else delete MUS.pos[MUS.cur];
  MUS.src=MUS.g=MUS.cur=null;if(a.state!=='running'){try{s.stop();}catch(e){}try{g.disconnect();}catch(e){}return;}
  try{g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+fade);s.stop(t+fade+.05);}catch(e){}
  setTimeout(()=>{try{g.disconnect();}catch(e){}},fade*1000+400);}
function musTick(){if(!AC)return;const n=musWant(),v=n?MUS_VOL:0,run=AC.state==='running';
  if(n){musLoad(n);if(!run)AC.resume().catch(()=>{});}
  if(MUS.src&&(MUS.cur!==n||!v||!run))musStop(MUS.cur!==n&&n?1:.4,true);
  if(!MUS.src){if(n&&v&&run&&MUS.buf[n])musStart(n,v,1.2);}
  else if(Math.abs(v-MUS.v)>.001&&AC.currentTime>MUS.fade){MUS.g.gain.setTargetAtTime(v,AC.currentTime,.08);MUS.v=v;}
}
setInterval(musTick,200);
