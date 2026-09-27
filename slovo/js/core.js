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
let MAIN=null,EXTRA=null,MORE=null,WHY=null;
function isWord(w){if(!MAIN){if(typeof DICT_MAIN==='undefined')return false;MAIN=new Set(DICT_MAIN.split(' '));EXTRA=new Set(DICT_EXTRA.split(' '));
    MORE=new Set(typeof ZINA_MORE==='string'&&ZINA_MORE?ZINA_MORE.split(' '):[]);}
  return MAIN.has(w)||EXTRA.has(w)||MORE.has(w);}
// почему настоящее слово не засчитано (js/zina.js): adj, pron, num, adv, func, name, rude, form, plural, verb; '' — не знаем
// грубое хранится отпечатками (tools/zina.py, h32) — чтобы в игре не лежал мат текстом
function h32(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
function whyNot(w){if(!WHY){WHY=new Map();if(typeof ZINA_NO==='object')for(const k in ZINA_NO)ZINA_NO[k].split(' ').forEach(x=>WHY.set(x,k));
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
function save(){if(SHOT)return;S.ts=Date.now();try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}
  clearTimeout(cloudT);cloudT=setTimeout(cloudSave,PLAT==='vk'?15000:3000);}
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
  for(const k of['lv','found','bonusAll','hintsUsed','plays','bestStreak'])S[k]=Math.max(+S[k]||0,+d[k]||0);
  for(const k of['dict','daily','own','tip','ask'])S[k]=Object.assign({},isObj(d[k])?d[k]:{},isObj(S[k])?S[k]:{});
  const a=typeof S.ex==='string'?S.ex:'',b=typeof d.ex==='string'?d.ex:'';let e='';for(let i=0;i<Math.max(a.length,b.length);i++)e+=a[i]==='1'||b[i]==='1'?'1':'0';S.ex=e;
  S.curs=isObj(S.curs)?S.curs:{};if(isObj(d.curs))for(const k in d.curs){const x=d.curs[k];if(isObj(x)&&(!S.curs[k]||(x.t||0)>(S.curs[k].t||0)))S.curs[k]=x;}
  const la=+S.lastDaily||0,lb=+d.lastDaily||0;
  if(lb>la){S.lastDaily=d.lastDaily;S.streak=+d.streak||0;}else if(lb===la)S.streak=Math.max(+S.streak||0,+d.streak||0);
  if(isObj(d.dailyPick)&&(!S.dailyPick||d.dailyPick.d>S.dailyPick.d))S.dailyPick=d.dailyPick;
  if(isObj(d.fix)&&(!S.fix||d.fix.d>S.fix.d))S.fix=d.fix; // восстановленная серия
  if(isObj(d.adc)&&(!S.adc||d.adc.d>S.adc.d||d.adc.d===S.adc.d&&d.adc.n>S.adc.n))S.adc=d.adc; // сколько раз сегодня брали монеты за рекламу
  if(isObj(d.fl)&&(!S.fl||d.fl.d>S.fl.d||d.fl.d===S.fl.d&&d.fl.n>S.fl.n))S.fl=d.fl; // бесплатные буквы дня (сколько взято)
  if(isObj(d.gift)&&(!S.gift||d.gift.d>S.gift.d))S.gift=d.gift; // подарок дня за рекламу уже взят
  if(newer){
    const jarMax=typeof JAR_SIZE!=='undefined'?JAR_SIZE-1:99;
    S.coins=Math.max(0,(+d.coins||0)+((+S.coins||0)-BOOT.coins));
    S.jar=clamp((+d.jar||0)+((+S.jar||0)-BOOT.jar),0,jarMax);
    for(const k of['sound','music'])if(k in d)S[k]=d[k];
    const has=(t,L,id)=>{const it=L&&L.find(x=>x.id===id);return !!it&&(!it.p||!!(S.own||{})[t+':'+id]);};
    if(has('s',typeof SKINS!=='undefined'&&SKINS,d.skin))S.skin=d.skin;if(has('o',typeof OUTFITS!=='undefined'&&OUTFITS,d.outfit))S.outfit=d.outfit;
    synced({ts:+d.ts,coins:+d.coins||0,jar:+d.jar||0});}
  migrate();return canon(noTs(S))!==before;}
// прочитать облако (при запуске, после входа в Яндекс или повтор после сбоя), слить и отправить итог, если в облаке чего-то не хватает.
// Сбой или битое облако — «прочитано» не ставим (в облако не пишем), пробуем ещё до 3 раз.
async function cloudLoad(){if(cloudBusy||cloudReady||SHOT||cloudFails>=4||!(ysdk||PLAT==='vk'&&VK)||Date.now()-cloudTry<10000)return;cloudBusy=true;cloudTry=Date.now();
  try{let d;
    if(ysdk){if(!YP)YP=await withTimeout(ysdk.getPlayer({scopes:false}),10000);d=await withTimeout(YP.getData(),10000);}
    else d=await vkLoadCloud();
    const ch=mergeSave(d);cloudReady=true;if(ch){try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}}
    if(!d||canon(noTs(d))!==canon(noTs(S)))save(); // в облаке нет того, что есть на устройстве — дописываем
    if(ch&&typeof onCloud==='function')onCloud();
  }catch(e){cloudFails++;if(cloudFails<4)setTimeout(cloudLoad,11000);}finally{cloudBusy=false;}}
// старые сохранения: один незаконченный уровень S.cur → словарь S.curs по ключу уровня
function migrate(){S.curs=isObj(S.curs)?S.curs:{};if(S.cur&&S.cur.key&&!S.curs[S.cur.key])S.curs[S.cur.key]=Object.assign({t:Date.now()},S.cur);delete S.cur;
  if(!isObj(S.ask))S.ask={};if(!isObj(S.tip))S.tip={};}
migrate();
function addCoins(n){S.coins=Math.max(0,S.coins+n);save();updCoins();}
function updCoins(){document.querySelectorAll('.cc').forEach(e=>e.textContent=S.coins);}

/* ================= площадка: Яндекс Игры или VK ================= */
// VK передаёт в адрес игры параметры запуска (vk_app_id и др.); ?vk=1 — проверка VK-режима на маке
const PLAT=/[?&](vk_app_id|vk)=/.test(location.search)?'vk':'yandex';
const VK_MOBILE=/[?&]vk_platform=mobile_/.test(location.search); // клиент VK на телефоне (WebView: скачивание файлов не работает)
let ysdk=null,YP=null,VK=null,paused=false,muted=false;
// «сейчас» для дней (задание дня, серия, бесплатная буква, подарок дня): на Яндексе — часы сервера
// (перевод часов на телефоне не даёт лишних дней), иначе — часы устройства
function nowMs(){try{if(ysdk&&ysdk.serverTime){const t=ysdk.serverTime();if(typeof t==='number'&&t>1.6e12)return t;}}catch(e){}return Date.now();}
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
// можно ли предлагать ролик за награду: есть SDK/мост (или заглушка на своём компьютере). В VK без моста кнопок «за рекламу» нет
const adsOk=()=>!!(VK||ysdk||LOCAL);
// без контекстного меню и «долгого тапа» (требование площадок); можно — поле поиска и картинка открытки (сохранить долгим нажатием)
document.addEventListener('contextmenu',e=>{const t=e.target;if(!(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.classList&&t.classList.contains('cardimg'))))e.preventDefault();});
// iOS: щипок увеличивает страницу вопреки user-scalable=no
document.addEventListener('gesturestart',e=>e.preventDefault());
function loadScript(src,ms){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);setTimeout(no,ms||20000);});}
// ответ VK с ограничением по времени (вне VK мост не отвечает)
function vkSend(method,params,ms){return withTimeout(window.vkBridge.send(method,params||{}),ms||4000);}

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

async function initSDK(){
  // меню (или первый уровень для новичка) — сразу; SDK/мост и облако догружаем следом, облако сольётся в onCloud
  if(typeof onReady==='function')onReady();
  if(PLAT==='vk'){
    try{if(!window.vkBridge)await loadScript('js/vk-bridge.min.js');
      await vkSend('VKWebAppInit',{},20000);VK=window.vkBridge;
      VK.subscribe(e=>{const t=e.detail&&e.detail.type;if(t==='VKWebAppViewHide'){setPause('vk',true);clearTimeout(cloudT);cloudSave();}else if(t==='VKWebAppViewRestore')setPause('vk',false);});
      cloudLoad();if(typeof askProbe==='function')askProbe();if(typeof updGift==='function')updGift();
      vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).catch(()=>{});
    }catch(e){VK=null;}
    return;
  }
  if(/[?&]nosdk/.test(location.search))return;
  try{await loadScript('/sdk.js');}catch(e){}
  if(!window.YaGames)return;
  try{ysdk=await withTimeout(YaGames.init(),20000);}catch(e){ysdk=null;return;}
  // игра только на русском: язык из SDK читаем, но интерфейс не меняем (в консоли выбран только русский)
  try{window.LANG=ysdk.environment.i18n.lang||'ru';}catch(e){window.LANG='ru';}
  try{ysdk.on&&ysdk.on('game_api_pause',()=>setPause('sdk',true));ysdk.on&&ysdk.on('game_api_resume',()=>setPause('sdk',false));}catch(e){}
  try{ysdk.features.LoadingAPI&&ysdk.features.LoadingAPI.ready();}catch(e){}
  // числа рекламы и цены — флагами из консоли Яндекса (applyFlags в game.js, рамки жёсткие); нет флагов — остаются как в коде
  try{ysdk.getFlags&&ysdk.getFlags().then(f=>{if(typeof applyFlags==='function')applyFlags(f);}).catch(()=>{});}catch(e){}
  if(typeof updGift==='function')updGift();
  if(inPlay())YG.start();
  cloudLoad();if(typeof askProbe==='function')askProbe();
}

/* ---------- реклама ---------- */
function stubAd(cb){const ad=$('ad'),tEl=$('adT');adOpen();ad.classList.add('on');let n=3;tEl.textContent=n;
  const it=setInterval(()=>{n--;tEl.textContent=n;if(n<=0){clearInterval(it);ad.classList.remove('on');adClose();cb();}},600);}
function adOpen(){setPause('ad',true);YG.stop();}
function adClose(){setPause('ad',false);setTimeout(()=>{if(inPlay())YG.start();},0);} // награда могла открыть или закрыть окно — решаем после неё
// за награду — по желанию игрока; пока ролик идёт, повторные нажатия не запускают второй (и не дают двойную награду)
let adBusy=false;
function showRewarded(cb0,onFail0){
  if(adBusy)return;adBusy=true;clearTimeout(showRewarded._t);showRewarded._t=setTimeout(()=>{adBusy=false;},90000);
  const cb=()=>{adBusy=false;lastRew=Date.now();cb0();},onFail=()=>{adBusy=false;lastRew=Date.now();onFail0&&onFail0();};
  if(VK){adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'reward'},60000)
      .then(r=>{adClose();if(r&&r.result)cb();else{toast(AD_FAIL);onFail();}})
      .catch(()=>{adClose();toast(AD_FAIL);onFail();})
      .finally(()=>vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).catch(()=>{}));return;}
  if(!VK&&!ysdk){if(LOCAL)stubAd(cb);else{toast(AD_FAIL);onFail();}return;} // мост/SDK не ответили — награду даром не даём
  let got=false;
  ysdk.adv.showRewardedVideo({callbacks:{onOpen:adOpen,onRewarded:()=>{got=true;},
    onClose:()=>{adClose();if(got)cb();else{toast('Досмотри ролик до конца — тогда награда твоя');onFail();}},
    onError:()=>{adClose();toast(AD_FAIL);onFail();}}});
}
// межэкранная (отчёт 12, 27.09): после ЛЮБОГО пройденного уровня («Дальше», «В меню» в окне победы) и при входе в уровень из меню
// («Играть», выбор уровня, задание дня) — только в этот момент перехода: не по таймеру, никогда во время уровня и не при запуске.
// Защита новичка: не раньше AD.minLv-го уровня и не в первые AD.sess с сессии. Не чаще раза в AD.gap с и не раньше AD.afterRew с
// после ролика за награду. Площадки ещё и сами ограничивают частоту (VK — не чаще 30 с). Числа — флагами Яндекса (applyFlags, game.js).
const AD={gap:180,afterRew:90,minLv:8,sess:180};
let lastInter=0,lastRew=0,interOn=false;
function interDue(){const now=Date.now();
  return !SHOT&&!!(ysdk||VK||LOCAL)&&S.lv>=AD.minLv&&now-T0>=AD.sess*1000&&now-lastInter>=AD.gap*1000&&now-lastRew>=AD.afterRew*1000;}
function maybeInterstitial(cb){
  if(interOn)return; // реклама уже идёт — второй переход не запускаем
  S.plays=(S.plays||0)+1;
  if(!interDue()){cb();return;}
  // показ не состоялся (площадка отказала, нет рекламы) — паузу не засчитываем, попробуем на следующем переходе
  const prev=lastInter;lastInter=Date.now();interOn=true;const done=()=>{interOn=false;cb();};
  if(VK){adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).then(r=>{if(!(r&&r.result))lastInter=prev;}).catch(()=>{lastInter=prev;})
      .finally(()=>{adClose();done();});return;}
  if(!ysdk){stubAd(done);return;} // свой компьютер — заглушка
  ysdk.adv.showFullscreenAdv({callbacks:{onOpen:adOpen,onClose:shown=>{if(shown===false)lastInter=prev;adClose();done();},onError:()=>{lastInter=prev;adClose();done();}}});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){setPause('hidden',true);clearTimeout(cloudT);cloudSave(true);}else setPause('hidden',false);});

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
