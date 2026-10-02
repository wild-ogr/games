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
    const ch=mergeSave(d);cloudReady=true;if(ch){try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}}
    if(!d||canon(noTs(d))!==canon(noTs(S)))save(); // в облаке нет того, что есть на устройстве — дописываем
    if(ch&&typeof onCloud==='function')onCloud();
  }catch(e){cloudFails++;if(cloudFails<4)setTimeout(cloudLoad,11000);}finally{cloudBusy=false;}}
// старые сохранения: один незаконченный уровень S.cur → словарь S.curs по ключу уровня
function migrate(){S.curs=isObj(S.curs)?S.curs:{};if(S.cur&&S.cur.key&&!S.curs[S.cur.key])S.curs[S.cur.key]=Object.assign({t:Date.now()},S.cur);delete S.cur;
  if(!isObj(S.ask))S.ask={};if(!isObj(S.tip))S.tip={};
  for(const k of['payT','payV'])if(S[k]!=null&&!Array.isArray(S[k]))S[k]=[];for(const k of['buy','buyB'])if(S[k]!=null&&!isObj(S[k]))S[k]={};}
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
    {id:54787973,t:'Баба Зина: слова из букв',a:0,i:1,g:'p',off:'web'},
    {id:54791567,t:'Богатырь против нечисти',a:6,i:2,g:'s'},
    {id:54791569,t:'Тридевятая оборона: защита башен',a:6,i:3,g:'s'},
    {id:54791634,t:'Гастроном номер 1',a:0,i:4,g:'p',off:'all'},
    {id:54792006,t:'Дурак во дворе',a:12,i:5,g:'c',off:'web'},
    {id:54792009,t:'Косынка во дворе',a:0,i:6,g:'c'},
    {id:54792011,t:'Паук на даче',a:0,i:7,g:'c'},
    {id:54792015,t:'Свободная ячейка в санатории',a:0,i:8,g:'c'},
    {id:54792674,t:'Козёл во дворе',a:12,i:9,g:'c',off:'all'},
    {id:54792676,t:'Кирпичики во дворе',a:0,i:10,g:'p',off:'web'},
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
      VK.subscribe(e=>{const t=e.detail&&e.detail.type;if(t==='VKWebAppViewHide'){setPause('vk',true);clearTimeout(cloudT);cloudT=0;cloudSave();}else if(t==='VKWebAppViewRestore')setPause('vk',false);});
      Promise.resolve(cloudLoad()).then(payInit,payInit);if(typeof askProbe==='function')askProbe();if(typeof updGift==='function')updGift();
      vkSend('VKWebAppCheckNativeAds',{ad_format:'reward'}).catch(()=>{});
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
let lastInter=0,lastRew=0,interOn=false,interNext=null;
function interDue(){const now=Date.now();
  return !SHOT&&!(typeof PAY!=='undefined'&&PAY.own('no_ads'))&&!!(ysdk||VK||LOCAL)&&S.lv>=AD.minLv&&now-T0>=AD.sess*1000&&now-lastInter>=AD.gap*1000&&now-lastRew>=AD.afterRew*1000;}
function maybeInterstitial(cb){
  if(interOn){interNext=cb;return;} // реклама уже идёт — второй переход сделаем после неё (последний выбранный)
  S.plays=(S.plays||0)+1;
  if(!interDue()){cb();return;}
  // показ не состоялся (площадка отказала, нет рекламы) — паузу не засчитываем, попробуем на следующем переходе
  const prev=lastInter;lastInter=Date.now();interOn=true;const done=()=>{interOn=false;const f=interNext||cb;interNext=null;f();};
  if(VK){adOpen();vkSend('VKWebAppShowNativeAds',{ad_format:'interstitial'},60000).then(r=>{if(!(r&&r.result))lastInter=prev;}).catch(()=>{lastInter=prev;})
      .finally(()=>{adClose();done();});return;}
  if(!ysdk){stubAd(done);return;} // свой компьютер — заглушка
  ysdk.adv.showFullscreenAdv({callbacks:{onOpen:adOpen,onClose:shown=>{if(shown===false)lastInter=prev;adClose();done();},onError:()=>{lastInter=prev;adClose();done();}}});
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
