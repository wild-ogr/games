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
function fixSave(){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);
  for(const k of['forge','village','armory','done','best','rank','bought','stats','bossKill','evoSeen','skins','skin','ach','meet','bk','ask','stars'])if(!ob(S[k]))S[k]={};
  for(const i in S.done)if(S.done[i])S.stars[i+'w']=1; // звёзды глав (boost 2): пройденной главе — первая звезда
  if(typeof S.gold!=='number'||!isFinite(S.gold))S.gold=0;if(!S.afkT)S.afkT=nowMs();
  for(const k of['payT','payV'])if(S[k]!=null&&!Array.isArray(S[k]))S[k]=[];if(S.buy!=null&&!ob(S.buy))S.buy={};if(S.buyB!=null&&!ob(S.buyB))S.buyB={};} // покупки (js/pay.js)
fixSave();
const BOOT={ts:S.ts||0,fresh:!S.ts}; // что было на этом устройстве при запуске
let loginMerge=false,cloudBase=S.gold||0,cloudReady=false,cloudPending=null,cloudT=0,cloudLast=0,cloudBusy=false;
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
function mergeProgress(d,loc,useCloud){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{},o=Object.assign(freshSave(),JSON.parse(JSON.stringify(loc)));
  const mx=k=>{const a=Object.assign({},ob(o[k])),b=ob(d[k]);for(const i in b)if(typeof b[i]==='number')a[i]=Math.max(+a[i]||0,b[i]);o[k]=a;};
  for(const k of['forge','village','armory','rank','best','bk','stats'])mx(k);
  for(const k of['done','bought','bossKill','evoSeen','skins','ach','meet','ask','stars'])o[k]=Object.assign({},ob(d[k]),ob(o[k]));
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
  if(useCloud)for(const k of['hero','skin','curse','sound','music','vm','vs','calm','vib'])if(k in d)o[k]=d[k];
  if(typeof payMerge==='function')payMerge(d,o); // покупки (js/pay.js): купленное — объединение
  o.ts=Math.max(+o.ts||0,+d.ts||0);return o;}
function mergeSave(d){if(!d||typeof d!=='object'||Array.isArray(d)||!d.ts)return false;
  const soc=S.soc;S=mergeProgress(d,S,BOOT.fresh||d.ts>(S.ts||0));if(soc&&typeof soc==='object'){S.soc=soc;if(typeof SOC!=='undefined')SOC.merge(d.soc);} // «Друзья и игры»: тот же объект (модуль держит ссылку), облако — слиянием
  fixSave();cloudBase=+d.gold||0;BOOT.fresh=false;return true;}
// облако прочитано: d — сохранение из облака или null (облако пустое). Во время похода — ждём возврата в меню (cloudApply)
function cloudIn(d){if(typeof G!=='undefined'&&G){cloudPending={d};return;}applyCloud(d);}
function applyCloud(d){cloudPending=null;let changed=false;
  try{changed=mergeSave(d);}catch(e){console.warn('cloud merge',e);return;} // не слилось — в облако не пишем
  loginMerge=false;cloudReady=true;save();if(changed&&typeof onCloud==='function')onCloud();}
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
  window.vkBridge.send('VKWebAppGetConfig').then(function(c){if(c&&c.viewport_height)vkFit(c.viewport_height);}).catch(function(){});
}catch(e){}}
async function initSDK(){
  if(PLAT==='vk'){
    // меню уже показано, мост VK и облако догружаем следом (VKWebAppInit может отвечать секунды)
    let cl=null;
    try{if(!window.vkBridge)await loadScript('js/vk-bridge.min.js');
      await vkSend('VKWebAppInit',{},20000);VK=window.vkBridge;
      if(typeof SOC!=='undefined'){SOC.ready();updMore();} // «Друзья и игры» (только VK с мостом)
      adRedraw();vkFitInit(); // VK web: подогнать высоту окна под экран (без ожидания)
      VK.subscribe(e=>{const t=e.detail&&e.detail.type;
        if(t==='VKWebAppViewHide'){paused=true;setMuted(true);cloudFlush();}
        else if(t==='VKWebAppViewRestore'&&!adShowing){paused=false;setMuted(false);}});
      cl=vkCloudInit(2);
      vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).catch(()=>{});
      vkSend('VKWebAppCheckNativeAds',{ad_format:'interstitial'}).catch(()=>{});
    }catch(e){VK=null;}
    try{await cl;}catch(e){}
    if(typeof PAY!=='undefined')PAY.init(); // покупки VK (js/pay.js): после моста и облака (на маке без моста — только ?vk=1&paytest=1)
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
  if(!ADV.on||S.runs<ADV.from||ADV.sess<2||!(runT>=45)||now-ADV.last<ADV.gap*60000||adBusy||adShowing)return false;
  if(PLAT==='vk')return !!VK||(!VK_REAL&&LOCAL); // в настоящем VK без моста — нет; ?vk=1 на маке — заглушка
  return !!ysdk||LOCAL;}
function showInterstitial(cb0){let done=false;const cb=()=>{if(done)return;done=true;adMark();if(cb0)cb0();};
  if(PLAT==='vk'&&!VK){if(!VK_REAL&&LOCAL)stubAd(cb);else cb();return;}
  if(VK){adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).catch(()=>{}).then(()=>{adClose();cb();vkSend('VKWebAppCheckNativeAds',{ad_format:'interstitial'}).catch(()=>{});});return;}
  if(!ysdk){if(LOCAL)stubAd(cb);else cb();return;}
  try{ysdk.adv.showFullscreenAdv({callbacks:{onOpen:adOpen,onClose:()=>{adClose();cb();},onError:()=>{adClose();cb();},onOffline:()=>{adClose();cb();}}});}catch(e){adClose();cb();}}
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
// пока ролик идёт, повторные нажатия не запускают второй (и не дают двойную награду)
let adBusy=false;
function showRewarded(cb0,onFail0){
  if(adBusy)return;adBusy=true;clearTimeout(showRewarded._t);showRewarded._t=setTimeout(()=>{adBusy=false;},90000);
  const cb=()=>{adBusy=false;cb0();},onFail=()=>{adBusy=false;onFail0&&onFail0();};
  if(PLAT==='vk'&&!VK){if(VK_REAL){toast(adFail());onFail();}else stubAd(cb);return;} // в VK мост не ответил — не даём награду даром; ?vk=1 на маке — заглушка
  if(VK){
    adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'reward'},60000)
      .then(r=>{adClose();if(r&&r.result)cb();else{toast(adFail());onFail();}})
      .catch(()=>{adClose();toast(adFail());onFail();})
      .then(()=>vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).catch(()=>{})); // не .finally — его нет в старых WebView
    return;}
  if(!ysdk){if(LOCAL)stubAd(cb);else{toast(sdkDone?adFail():L('Реклама ещё загружается, попробуй через пару секунд','Ads are still loading, try again in a few seconds'));onFail();}return;}
  let got=false;
  ysdk.adv.showRewardedVideo({callbacks:{onOpen:adOpen,onRewarded:()=>{got=true;},
    onClose:()=>{adClose();if(got)cb();else{toast(L('Досмотри видео до конца, чтобы получить награду','Watch the video to the end to get the reward'));onFail();}},
    onError:()=>{adClose();toast(adFail());onFail();}}});
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
  vkFriends(){if(!VK){toast('Таблица друзей откроется в игре ВКонтакте');return;} // i18n:ru — только VK (там всегда русский)
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
