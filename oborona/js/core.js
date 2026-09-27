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
function fmtNum(n){return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');}
function fmtGold(n){n=Math.floor(n);return fmtNum(n)+' '+plural(n,'золотой','золотых','золотых');}
function coinsTxt(n){return n+' '+plural(n,'монета','монеты','монет');}
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
  dq:null,login:null,ret:{},diff:1,crown:{},bk:{},ach:{},wk:null,dch:null,dchN:0,skins:{},skin:{},deco:{}};}
// поля-объекты могли прийти битыми (ручная правка, старая версия) — чиним
function fixSave(){for(const k of['stars','forge','village','seen','introSeen','lose','ret','crown','bk','ach','skins','skin','deco'])if(!S[k]||typeof S[k]!=='object'||Array.isArray(S[k]))S[k]={};
  if(!S.afkT)S.afkT=Date.now();if(S.boost==null||isNaN(S.boost))S.boost=900;if(S.shake==null)S.shake=REDUCED?0:1;
  if(S.payT!=null&&!Array.isArray(S.payT))S.payT=[];if(S.payV!=null&&!Array.isArray(S.payV))S.payV=[];}
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
  if(typeof payMerge==='function'){payMerge(L,o);payMerge(d,o);} // покупки (js/pay.js): купленное — объединение
  if(newer){const db=d.boost!=null?d.boost:900;
    o.gold=Math.max(0,(+d.gold||0)+((+L.gold||0)-BOOT.gold));o.boost=Math.min(7200,Math.max(0,db+((L.boost!=null?L.boost:900)-BOOT.boost)));}
  return o;}
function cloudMerge(d){if(!d||typeof d!=='object'||Array.isArray(d))return false;const newer=(+d.ts||0)>BOOT.ts;
  try{S=mergeProgress(d,S,newer);fixSave();}catch(e){return false;}
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
async function vkInit(tries){
  try{await vkSend('VKWebAppInit',{},SDK_WAIT);}catch(e){if(tries>0)vkInit(tries-1);return;}
  if(VK)return;VK=window.vkBridge;
  VK.subscribe(e=>{const t=e.detail&&e.detail.type;if(t==='VKWebAppViewHide'){setPause('vk',1);cloudFlush();}else if(t==='VKWebAppViewRestore')setPause('vk',0);});
  vkCloudInit(3).then(()=>{if(typeof PAY!=='undefined')PAY.init();}); // покупки VK (js/pay.js): после моста и первого чтения облака
  vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).catch(()=>{});}
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
function showRewarded(cb0,onFail0){
  if(adBusy)return;adBusy=true;clearTimeout(showRewarded._t);showRewarded._t=setTimeout(()=>{adBusy=false;},90000);
  const cb=()=>{adBusy=false;cb0();},onFail=()=>{adBusy=false;onFail0&&onFail0();};
  // в VK мост не ответил — награду даром не даём; заглушка только для ?vk=1 на маке
  if(PLAT==='vk'&&!VK){if(VK_REAL){toast(AD_FAIL);onFail();}else stubAd(cb);return;}
  if(VK){adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'reward'},60000)
      .then(r=>{adClose();if(r&&r.result)cb();else{toast(AD_FAIL);onFail();}})
      .catch(()=>{adClose();toast(AD_FAIL);onFail();})
      .finally(()=>vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).catch(()=>{}));return;}
  if(!ysdk){if(LOCAL)stubAd(cb);else{toast(AD_FAIL);onFail();}return;}
  let got=false;
  try{ysdk.adv.showRewardedVideo({callbacks:{onOpen:adOpen,onRewarded:()=>{got=true;},
    onClose:()=>{adClose();if(got)cb();else{toast('Досмотри видео до конца, чтобы получить награду');onFail();}},
    onError:()=>{adClose();toast(AD_FAIL);onFail();}}});}catch(e){adClose();toast(AD_FAIL);onFail();}
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
function showInterstitial(cb0){if(interBusy)return;interBusy=true;let done=false;
  const cb=()=>{if(done)return;done=true;clearTimeout(t);interBusy=false;lastAdT=Date.now();cb0();};
  const t=setTimeout(()=>{if(PAUSE.ad)adClose();cb();},90000);   // площадка не ответила — не держим игрока
  if(PLAT==='vk'&&!VK){if(VK_REAL)cb();else stubAd(cb);return;}
  if(VK){adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).then(()=>{adClose();cb();},()=>{adClose();cb();});return;}
  if(!ysdk){if(LOCAL)stubAd(cb);else cb();return;}
  try{ysdk.adv.showFullscreenAdv({callbacks:{onOpen:adOpen,onClose:()=>{adClose();cb();},onError:()=>{adClose();cb();},onOffline:cb}});}catch(e){adClose();cb();}}
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
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),Math.max(2500,1000+60*String(s).length));}
