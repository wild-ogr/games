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
function fmtNum(n){return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');}
function dec(v,n){return v.toFixed(n).replace('.',',');} // дробь с запятой: 1,45

/* ================= площадка: Яндекс Игры или VK =================
   VK передаёт в адрес игры параметры запуска (vk_app_id и др.); ?vk=1 — проверка VK-режима на маке */
const PLAT=/[?&](vk_app_id|vk)=/.test(location.search)?'vk':'yandex';
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
function dayMs(){return srvMs()||Date.now();}

/* ================= сохранение =================
   localStorage — сразу. Облако (Яндекс: player.setData, VK: VKWebAppStorage) — ТОЛЬКО после того, как облако прочитано
   и слито с тем, что на устройстве (cloudReady). Слияние, а не замена: прогресс — максимум/объединение,
   золото — облако + заработанное здесь с последней сверки (cloudBase — сколько золота лежит в облаке). */
const SKEY='bogatyr-v1';
function freshSave(){return {v:1,ts:0,gold:0,forge:{},village:{},armory:{},done:{},best:{},endBest:0,afkT:0,hero:'dob',sound:1,music:1,vm:.6,vs:.8,runs:0,kills:0,gift:0,tut:0};}
let S=freshSave();
try{const r=localStorage.getItem(SKEY);if(r){const o=JSON.parse(r);if(o&&typeof o==='object'&&!Array.isArray(o))S=Object.assign(S,o);}}catch(e){}
function fixSave(){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);
  for(const k of['forge','village','armory','done','best','rank','bought','stats','bossKill','evoSeen','skins','skin','ach','meet','bk','ask'])if(!ob(S[k]))S[k]={};
  if(typeof S.gold!=='number'||!isFinite(S.gold))S.gold=0;if(!S.afkT)S.afkT=nowMs();}
fixSave();
const BOOT={ts:S.ts||0,fresh:!S.ts}; // что было на этом устройстве при запуске
let cloudBase=S.gold||0,cloudReady=false,cloudPending=null,cloudT=0,cloudLast=0,cloudBusy=false;
const CLOUD_GAP=PLAT==='vk'?15000:3500; // VK — не чаще раза в 15 с; Яндекс — лимит 100 записей за 5 мин
function save(){S.ts=Date.now();try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}cloudQueue();}
function cloudQueue(){if(!cloudReady||cloudPending||cloudT)return;cloudT=setTimeout(cloudSave,Math.max(2000,CLOUD_GAP-(Date.now()-cloudLast)));}
function cloudSave(now){clearTimeout(cloudT);cloudT=0;if(!cloudReady||cloudPending)return;
  if(cloudBusy&&!(now&&YP)){cloudT=setTimeout(cloudSave,2000);return;}
  const str=JSON.stringify(S),gold=S.gold;cloudLast=Date.now();
  try{if(YP){cloudBusy=true;YP.setData(JSON.parse(str),!!now).then(()=>{cloudBase=gold;},()=>{}).then(()=>{cloudBusy=false;});}
    else if(PLAT==='vk'&&VK){cloudBusy=true;vkSaveCloud(str).then(ok=>{if(ok)cloudBase=gold;cloudBusy=false;});}}catch(e){cloudBusy=false;}}
function cloudFlush(){if(cloudReady&&!cloudPending)cloudSave(true);} // сворачивание — сразу
// слияние: d — облако, L — это устройство; useCloud — настройки брать из облака
function mergeProgress(d,L,useCloud){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{},o=Object.assign(freshSave(),JSON.parse(JSON.stringify(L)));
  const mx=k=>{const a=Object.assign({},ob(o[k])),b=ob(d[k]);for(const i in b)if(typeof b[i]==='number')a[i]=Math.max(+a[i]||0,b[i]);o[k]=a;};
  for(const k of['forge','village','armory','rank','best','bk','stats'])mx(k);
  for(const k of['done','bought','bossKill','evoSeen','skins','ach','meet','ask'])o[k]=Object.assign({},ob(d[k]),ob(o[k]));
  for(const k of['endBest','runs','kills','bosses','curseMax','eco','gift','tut'])o[k]=Math.max(+o[k]||0,+d[k]||0);
  for(const k in d)if(/^seen\d+$/.test(k)&&d[k])o[k]=1;
  o.afkT=BOOT.fresh?(+d.afkT||o.afkT):Math.max(+o.afkT||0,+d.afkT||0);
  o.gold=Math.max(0,Math.round((+d.gold||0)+((+L.gold||0)-cloudBase)));
  const later=(a,b)=>!a?b:!b?a:(b.last>a.last||b.last===a.last&&(b.n||0)>(a.n||0))?b:a;
  o.login=later(ob(o.login).last?o.login:null,ob(d.login).last?d.login:null)||o.login;o.streak=later(ob(o.streak).last?o.streak:null,ob(d.streak).last?d.streak:null)||o.streak;
  const ab=ob(o.afkBoost),db=ob(d.afkBoost);if(db.day&&(!ab.day||db.day>ab.day))o.afkBoost=db;else if(db.day&&db.day===ab.day)o.afkBoost={day:ab.day,n:Math.max(ab.n||0,db.n||0)};
  const aq=ob(o.dq),dq=ob(d.dq);if(dq.day&&Array.isArray(dq.list)){if(!aq.day||dq.day>aq.day)o.dq=dq;else if(dq.day===aq.day&&Array.isArray(aq.list)){
    aq.list.forEach((x,i)=>{const y=dq.list[i];if(y&&y.id===x.id){x.p=Math.max(x.p||0,y.p||0);x.c=Math.max(x.c||0,y.c||0);}});aq.bonus=Math.max(aq.bonus||0,dq.bonus||0);}}
  const ar=ob(o.dr),dr=ob(d.dr);if(dr.day&&(!ar.day||dr.day>ar.day))o.dr=dr;else if(dr.day&&dr.day===ar.day)for(const k of['best','got','runs'])ar[k]=Math.max(ar[k]||0,dr[k]||0); // поход дня
  const aw=ob(o.wk),dw=ob(d.wk);if(dw.w&&(!aw.w||dw.w>aw.w))o.wk=dw;else if(dw.w&&dw.w===aw.w)for(const k of['best','got','runs'])aw[k]=Math.max(aw[k]||0,dw[k]||0);
  if(useCloud)for(const k of['hero','skin','curse','sound','music','vm','vs','calm','vib'])if(k in d)o[k]=d[k];
  o.ts=Math.max(+o.ts||0,+d.ts||0);return o;}
function mergeSave(d){if(!d||typeof d!=='object'||Array.isArray(d)||!d.ts)return false;
  S=mergeProgress(d,S,BOOT.fresh||d.ts>(S.ts||0));fixSave();cloudBase=+d.gold||0;BOOT.fresh=false;return true;}
// облако прочитано: d — сохранение из облака или null (облако пустое). Во время похода — ждём возврата в меню (cloudApply)
function cloudIn(d){if(typeof G!=='undefined'&&G){cloudPending={d};return;}applyCloud(d);}
function applyCloud(d){cloudPending=null;let changed=false;
  try{changed=mergeSave(d);}catch(e){console.warn('cloud merge',e);return;} // не слилось — в облако не пишем
  cloudReady=true;save();if(changed&&typeof onCloud==='function')onCloud();}
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
async function initSDK(){
  if(PLAT==='vk'){
    // меню уже показано, мост VK и облако догружаем следом (VKWebAppInit может отвечать секунды)
    try{if(!window.vkBridge)await loadScript('js/vk-bridge.min.js');
      await vkSend('VKWebAppInit',{},20000);VK=window.vkBridge;
      VK.subscribe(e=>{const t=e.detail&&e.detail.type;
        if(t==='VKWebAppViewHide'){paused=true;setMuted(true);cloudFlush();}
        else if(t==='VKWebAppViewRestore'&&!adShowing){paused=false;setMuted(false);}});
      vkCloudInit(2);
      vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).catch(()=>{});
      vkSend('VKWebAppCheckNativeAds',{ad_format:'interstitial'}).catch(()=>{});
    }catch(e){VK=null;}
    return;
  }
  // Яндекс: меню тоже уже показано — SDK и облако догружаем следом
  if(window.YaGames){
    try{ysdk=await YaGames.init();
      ysdk.on&&ysdk.on('game_api_pause',()=>{paused=true;setMuted(true);});
      ysdk.on&&ysdk.on('game_api_resume',()=>{if(adShowing)return;paused=false;setMuted(false);});
    }catch(e){ysdk=null;}
    try{ysdk&&ysdk.getFlags&&ysdk.getFlags().then(applyFlags).catch(()=>{});}catch(e){} // флаги из консоли Яндекса (межэкранная)
  }
  try{ysdk&&ysdk.features.LoadingAPI&&ysdk.features.LoadingAPI.ready();}catch(e){}
  sdkDone=true;if(ysdk)yCloud(3);else if(LOCAL)cloudReady=true; // на маке без SDK облака нет — только localStorage
}
let sdkDone=false;
/* Реклама (решение владельца 27.09): за награду — по желанию игрока; межэкранная — мягко, только между походами (interAfterRun).
   Межэкранная: после экрана итогов, с 4-го похода за всё время, не после первого похода захода, не чаще раза в 4 мин от ЛЮБОЙ рекламы,
   поход не короче 45 с; под флагами Яндекса (ADV). Никогда — посреди похода, при запуске, в первом походе. */
const VK_REAL=/[?&]vk_app_id=/.test(location.search);
const ADV={on:true,gap:4,from:4,sess:0,last:0};
try{ADV.last=+localStorage.getItem('bogatyr-ad')||0;}catch(e){}
// флаги: inter = 0/off — выключить; inter_gap — минут между рекламой (2–30); inter_from — с какого похода (2–30). Чужие значения не берём
function applyFlags(f){if(!f||typeof f!=='object')return;const num=(k,a,b)=>{const n=parseInt(f[k],10);return isFinite(n)&&n>=a&&n<=b?n:null;};let n;
  if(f.inter==='0'||f.inter==='off')ADV.on=false;else if(f.inter==='1'||f.inter==='on')ADV.on=true;
  if((n=num('inter_gap',2,30))!==null)ADV.gap=n;if((n=num('inter_from',2,30))!==null)ADV.from=n;}
function adMark(){ADV.last=Date.now();try{localStorage.setItem('bogatyr-ad',String(ADV.last));}catch(e){}}
// поход закончен и итоги забраны: показать межэкранную? (runT — длина похода, с). Считает походы захода — звать ровно раз за поход
function interReady(runT){ADV.sess++;const now=Date.now();if(ADV.last>now)adMark(); // часы перевели назад — отсчёт заново
  if(!ADV.on||S.runs<ADV.from||ADV.sess<2||!(runT>=45)||now-ADV.last<ADV.gap*60000||adBusy||adShowing)return false;
  if(PLAT==='vk')return !!VK||(!VK_REAL&&LOCAL); // в настоящем VK без моста — нет; ?vk=1 на маке — заглушка
  return !!ysdk||LOCAL;}
function showInterstitial(cb0){let done=false;const cb=()=>{if(done)return;done=true;adMark();if(cb0)cb0();};
  if(PLAT==='vk'&&!VK){if(!VK_REAL&&LOCAL)stubAd(cb);else cb();return;}
  if(VK){adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).catch(()=>{}).then(()=>{adClose();cb();vkSend('VKWebAppCheckNativeAds',{ad_format:'interstitial'}).catch(()=>{});});return;}
  if(!ysdk){if(LOCAL)stubAd(cb);else cb();return;}
  try{ysdk.adv.showFullscreenAdv({callbacks:{onOpen:adOpen,onClose:()=>{adClose();cb();},onError:()=>{adClose();cb();},onOffline:()=>{adClose();cb();}}});}catch(e){adClose();cb();}}
function stubAd(cb){const ad=$('ad'),tEl=$('adT');ad.classList.add('on');adOpen();let n=3;tEl.textContent=n;
  const it=setInterval(()=>{n--;tEl.textContent=n;if(n<=0){clearInterval(it);ad.classList.remove('on');adClose();cb();}},600);}
function adOpen(){adShowing=true;paused=true;setMuted(true);YG.stop();}
function adClose(){adShowing=false;adMark();paused=document.hidden;setMuted(document.hidden);if(G&&!G.over&&!G.paused&&!G.pauseOpen&&!$('modal').classList.contains('on'))YG.start();} // окно или пауза открыты — start() вызовет их закрытие
const AD_FAIL='Реклама сейчас недоступна, попробуй позже';
// пока ролик идёт, повторные нажатия не запускают второй (и не дают двойную награду)
let adBusy=false;
function showRewarded(cb0,onFail0){
  if(adBusy)return;adBusy=true;clearTimeout(showRewarded._t);showRewarded._t=setTimeout(()=>{adBusy=false;},90000);
  const cb=()=>{adBusy=false;cb0();},onFail=()=>{adBusy=false;onFail0&&onFail0();};
  if(PLAT==='vk'&&!VK){if(VK_REAL){toast(AD_FAIL);onFail();}else stubAd(cb);return;} // в VK мост не ответил — не даём награду даром; ?vk=1 на маке — заглушка
  if(VK){
    adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'reward'},60000)
      .then(r=>{adClose();if(r&&r.result)cb();else{toast(AD_FAIL);onFail();}})
      .catch(()=>{adClose();toast(AD_FAIL);onFail();})
      .finally(()=>vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).catch(()=>{}));return;}
  if(!ysdk){if(LOCAL)stubAd(cb);else{toast(sdkDone?AD_FAIL:'Реклама ещё загружается, попробуй через пару секунд');onFail();}return;}
  let got=false;
  ysdk.adv.showRewardedVideo({callbacks:{onOpen:adOpen,onRewarded:()=>{got=true;},
    onClose:()=>{adClose();if(got)cb();else{toast('Досмотри видео до конца, чтобы получить награду');onFail();}},
    onError:()=>{adClose();toast(AD_FAIL);onFail();}}});
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
function musLoad(n){if(MUS.buf[n]||!AC||MUS.ld[n]||(MUS.fails[n]||0)>=3||performance.now()<(MUS.retry[n]||0))return;MUS.ld[n]=1;
  (MUS.raw[n]?Promise.resolve(MUS.raw[n]):fetch(MUSF[n]).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.arrayBuffer();}).then(ab=>MUS.raw[n]=ab))
    .then(ab=>new Promise((ok,no)=>{const p=AC.decodeAudioData(ab.slice(0),ok,()=>no({dec:1}));if(p&&p.catch)p.catch(()=>no({dec:1}));}))
    .then(b=>{musEdges(b);MUS.ld[n]=0;if(MUSK[MUS.want]===n)MUS.buf[n]=b;})   // пока грузился, экран сменился — не держим
    .catch(e=>{MUS.ld[n]=0;MUS.fails[n]=(MUS.fails[n]||0)+(e&&e.dec?3:1);MUS.retry[n]=performance.now()+20000;});}
function musPos(){const b=MUS.buf[MUS.cur],L=b._le-b._ls;return b._ls+((MUS.off-b._ls)+(AC.currentTime-MUS.t0))%L;}
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
function canVib(){return (PLAT==='vk'&&!!VK)||typeof navigator.vibrate==='function';}
function vib(ms,strong){if(S.vib===0||muted||document.hidden||adShowing)return;const n=performance.now();if(n-vibT<250)return;vibT=n;
  try{if(PLAT==='vk'&&VK){vkSend('VKWebAppTapticImpactOccurred',{style:strong?'heavy':'light'},2000).catch(()=>{});return;}
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
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),Math.max(2500,1000+60*String(s).length));}

/* ================= день (для заданий) ================= */
function dayKey(t){const d=new Date(t||dayMs());return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dayPrev(k){const [y,m,d]=k.split('-').map(Number);return dayKey(new Date(y,m-1,d-1).getTime());}

/* ================= таблицы рекордов: Яндекс (endless, kills, weekly) и VK (таблица друзей) =================
   В консоли Яндекс Игр нужно создать лидерборды с техническими именами 'endless', 'kills', 'weekly' и 'daily' (тип «число»). */
const LB={
  ok(){return !!(ysdk&&(ysdk.leaderboards||ysdk.getLeaderboards));},
  async set(name,score){if(!ysdk)return;try{if(YP&&YP.isAuthorized&&!YP.isAuthorized())return;
    if(ysdk.leaderboards&&ysdk.leaderboards.setScore)await ysdk.leaderboards.setScore(name,Math.floor(score));
    else{const lb=await ysdk.getLeaderboards();await lb.setLeaderboardScore(name,Math.floor(score));}}catch(e){}},
  async get(name){if(!ysdk)return null;try{const o={quantityTop:10,includeUser:true,quantityAround:2};
    if(ysdk.leaderboards&&ysdk.leaderboards.getEntries)return await ysdk.leaderboards.getEntries(name,o);
    const lb=await ysdk.getLeaderboards();return await lb.getLeaderboardEntries(name,o);}catch(e){return null;}},
  authed(){return !YP||!YP.isAuthorized||YP.isAuthorized();},
  // после входа — другой игрок Яндекса: его облако читаем заново и сливаем с тем, что на устройстве (до этого в облако не пишем)
  async login(){try{await ysdk.auth.openAuthDialog();clearTimeout(cloudT);cloudT=0;cloudReady=false;cloudPending=null;YP=await ysdk.getPlayer({scopes:false});yCloud(3);return true;}catch(e){return false;}},
  // VK: таблица друзей (окно VK). Счёт — сколько нечисти одолено всего (в настройках приложения VK — турнирная таблица «по очкам»)
  vkFriends(){if(!VK){toast('Таблица друзей откроется в игре ВКонтакте');return;}
    vkSend('VKWebAppShowLeaderBoardBox',{user_result:Math.floor(S.kills||0)},60000).catch(()=>toast('Таблица друзей сейчас недоступна'));}
};

/* ================= возврат игрока: ярлык и оценка (Яндекс), избранное, экран «Домой», друзья (VK) =================
   Предлагаем по одному за сессию — после победы, не раньше 3-го похода; что показали или от чего отказались — помним в S.ask. */
const ASK={session:false,
  async next(){const A=S.ask;
    if(PLAT==='vk'){if(!VK)return null;
      if(!A.fav)return {k:'fav',t:'Добавь игру в избранное — будет всегда под рукой.',b:'⭐ В избранное',run:()=>vkSend('VKWebAppAddToFavorites',{},60000)};
      if(!A.home){try{const r=await vkSend('VKWebAppAddToHomeScreenInfo',{},4000);if(r&&r.is_feature_supported&&!r.is_added_to_home_screen)
        return {k:'home',t:'Добавь игру на экран телефона — заходить в одно касание.',b:'📲 На экран «Домой»',run:()=>vkSend('VKWebAppAddToHomeScreen',{},60000)};}catch(e){}A.home=1;}
      if(!A.inv)return {k:'inv',t:'Позови друзей — посмотрим, кто одолеет больше нечисти!',b:'👥 Позвать друзей',run:()=>vkSend('VKWebAppShowInviteBox',{},60000)};
      return null;}
    if(!ysdk)return null;
    if(!A.short){try{const r=await ysdk.shortcut.canShowPrompt();if(r&&r.canShow)return {k:'short',t:'Добавь ярлык игры на рабочий стол — возвращаться в один клик.',b:'📌 Добавить ярлык',run:()=>ysdk.shortcut.showPrompt()};}catch(e){}A.short=1;}
    if(!A.rev){try{const r=await ysdk.feedback.canReview();if(r&&r.value)return {k:'rev',t:'Нравится игра? Поставь оценку — так богатыря найдут другие.',b:'⭐ Оценить игру',run:()=>ysdk.feedback.requestReview()};}catch(e){}}
    return null;}
};
