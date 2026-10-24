/*CUP*/
/* ===== CUP v1 (03.10.2026): таблицы рекордов, турниры дня/недели, лиги, вызов другу — общий модуль хобби-игр =====
   Источник — ~/Projects/hobby-analytics/online/cup.js (правки только тут, в игры — cup-sync.sh). Сервер — online/function/index.py.
   Главное правило: игра НИКОГДА не ждёт сервер и не ломается без него. Нет адреса, сервер «отдыхает» (суточный предохранитель),
   нет сети, подпись не прошла — все вызовы молча отвечают null, игра работает как без онлайна. Окон с ошибками модуль не показывает.
   Что уходит на сервер: в VK — строка параметров запуска (её подписал VK; сервер берёт из неё только номер игрока и проверяет подпись,
   саму строку не хранит) и имя («Иван П.» делает сервер; фамилия целиком не хранится); в Яндексе — подпись игрока (signature).
   Больше ничего: ни устройства, ни адреса страницы. На устройстве (localStorage 'cup-<игра>') — только «показывать имя» (1/0).
   Запросы — text/plain без своих заголовков (без CORS-предзапроса), по одному вызову на действие: вход сразу приносит путёвку,
   результат — место, очки лиги и следующую путёвку. Вход — ленивый: пока игрок не открыл турнир/таблицу, запросов нет вообще.
   Старый синтаксис: только var/function, без стрелок, optional chaining, шаблонных строк, Promise. */
var CUP=(function(){
  var V=1,TMO=8000,TOPC=60e3,FAILS=3,PAUSE=5*60e3;
  var O={},G='',url='',dev=false,cut='',st='off',tok='',tokT=0,me=null,helloQ=null,tks={},fails=0,pauseT=0,restDay=0,
      topC={},sh=0,shL=null,log=[],mockN=0;
  function ls(k,v){try{if(v===undefined)return window.localStorage.getItem(k);window.localStorage.setItem(k,v);}catch(e){}return null;}
  function qp(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);try{return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}
  function locH(h){return /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|)$|\.localhost$|\.local$|\.test$|^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(String(h||''));}
  function locU(u){var m=/^https?:\/\/(\[[^\]]*\]|[^\/:?#]+)/i.exec(u);return !!m&&locH(m[1]);}
  function mskDay(){var d=new Date(Date.now()+3*3600e3);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();}
  function later(cb,v){if(typeof cb==='function')setTimeout(function(){try{cb(v);}catch(e){}},0);}
  function note(a,b){if(dev||O.debug){log.push([a,b]);if(log.length>200)log.shift();try{if(dev&&window.console)console.log('[CUP]',a,b);}catch(e){}}}
  function setSt(s){if(st!==s){st=s;try{if(O.onState)O.onState(s);}catch(e){}}}

  /* Тот же генератор, что mulberry32 на сервере: одинаковые числа в игре и при пересчёте результата (тесты сверяют). */
  var imul=Math.imul||function(a,b){var ah=(a>>>16)&0xffff,al=a&0xffff,bh=(b>>>16)&0xffff,bl=b&0xffff;return (al*bl+(((ah*bl+al*bh)<<16)>>>0))|0;};
  function rng(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=imul(t^(t>>>15),t|1);
    t^=t+imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

  /* CUP.init({g:'rybak', plat:PLAT, url:CUP_URL, lang:LANG, name:function(){return 'Иван Петров';}, sig:function(cb){cb(подпись Яндекса);},
               free:['endless'], onState:function(s){}, tr0:function(){return 8;}})
     url ПУСТОЙ → модуль молчит (можно встроить заранее, адрес вписать потом). plat: 'vk' | 'yandex'.
     name — VK: имя и фамилия из VKWebAppGetUserInfo (строка или функция); Яндекс — не нужен (имя придёт в подписи).
     sig  — Яндекс: функция, отдающая player.signature из ysdk.getPlayer({signed:true}) (нет входа в Яндекс → отдать '').
     free — режимы со случайным зерном («бесконечная»): их путёвку берём заодно со входом, без отдельного запроса.
     tr0  — (по желанию) ступень со своей прежней лестницы игры (число): сервер ставит её только новому игроку и не выше 'carry' адаптера.
     НАШИ ТЕСТЫ — не на боевой сервер: боевой адрес обнуляется, если игра открыта автоматом (webdriver/HeadlessChrome) или с мака/локальной
     сети/file://. На localhost: ?cup=sink:8831 → стенд http://localhost:8831/fn; ?cup=dev → без сервера, ответы-заглушки и журнал в консоль. */
  function init(o){O=o||{};G=String(O.g||'');url=String(O.url||'');cut='';dev=false;tok='';me=null;tks={};topC={};fails=0;pauseT=0;restDay=0;helloQ=null;
    var loc=locH(location.hostname)&&location.protocol!=='file:',q=qp('cup'),m;
    if(loc&&(m=/^sink:(\d{2,5})$/.exec(q)))url='http://'+location.hostname+':'+m[1]+'/fn';
    if(/^https?:/i.test(url)&&!locU(url)){var wd=false;try{wd=navigator.webdriver===true||/HeadlessChrome|PhantomJS|Puppeteer|Playwright/.test(navigator.userAgent||'');}catch(e){}
      cut=wd?'wd':location.protocol==='file:'?'file':locH(location.hostname)?'local':'';if(cut)url='';}
    if(!url&&loc&&(q==='dev'||O.dev===true))dev=true;
    shL=ls('cup-'+G);sh=shL==='1'?1:0;                                        // имя скрыто по умолчанию (политика 13.10): только если игрок сам включил
    api.on=!!(url||dev)&&!!G;setSt(api.on?'idle':'off');return api.on;}

  function plat(){return O.plat==='vk'?'vk':'ya';}
  function resting(){if(restDay&&restDay!==mskDay())restDay=0;return !!restDay||st==='gone'||(pauseT&&Date.now()<pauseT);}

  /* один запрос: POST text/plain, ответ JSON; любая беда → cb(null) */
  function post(op,body,cb){
    if(dev){note('→ '+op,body);return later(function(){var r=mock(op,body);note('← '+op,r);cb(r);});}
    var x,done=false,t;
    function fin(r){if(done)return;done=true;clearTimeout(t);
      if(!r){fails++;if(fails>=FAILS){pauseT=Date.now()+PAUSE;fails=0;setSt('err');}}else{fails=0;pauseT=0;}
      note('← '+op,r);cb(r);}
    try{x=new XMLHttpRequest();x.open('POST',url+(url.indexOf('?')<0?'?':'&')+'op='+op,true);
      x.setRequestHeader('Content-Type','text/plain;charset=UTF-8');
      x.onreadystatechange=function(){if(x.readyState!==4)return;var r=null;try{r=JSON.parse(x.responseText);}catch(e){}fin(r&&typeof r==='object'?r:null);};
      x.onerror=function(){fin(null);};
      t=setTimeout(function(){try{x.abort();}catch(e){}fin(null);},TMO);
      note('→ '+op,body);x.send(JSON.stringify(body));
    }catch(e){fin(null);}}

  /* ответ сервера «нет»: что делаем дальше (всё молча) */
  function refuse(r){var w=r&&r.why;
    if(w==='rest'){restDay=mskDay();setSt('rest');}           // суточный предохранитель: до полуночи МСК не беспокоим
    else if(w==='off'||w==='game'||w==='config'||w==='sign'||w==='old'||w==='plat'){setSt('gone');} // до перезапуска игры
    else if(w==='tok'){tok='';}                                // жетон истёк — следующий вызов войдёт заново
  }

  /* вход (ленивый, один на всех ждущих): want — режимы, чью путёвку взять сразу */
  function hello(want,cb){
    if(tok&&Date.now()-tokT<23*3600e3)return cb(true);
    if(helloQ){helloQ.push(cb);return;}
    helloQ=[cb];
    function go(sig){
      var b={g:G,plat:plat(),want:want||[]},i,f=O.free||[];if(shL==='0'||shL==='1')b.sh=sh; // выбора на устройстве нет — сервер помнит прежний (новый игрок — скрыто)
      try{var t0=typeof O.tr0==='function'?O.tr0():O.tr0;if(typeof t0==='number'&&t0>=0)b.tr0=Math.floor(t0);}catch(e){} // ступень со старой лестницы игры (сервер берёт один раз, адаптер 'carry')
      for(i=0;i<f.length&&b.want.length<3;i++)if(b.want.indexOf(f[i])<0)b.want.push(f[i]);
      if(b.plat==='vk'){b.q=location.search;var n='';try{n=typeof O.name==='function'?O.name():O.name;}catch(e){}b.nm=String(n||'').slice(0,60);}
      else{if(!sig)return end(false);b.sig=sig;}
      post('hello',b,function(r){
        if(!r||!r.ok){refuse(r);return end(false);}
        tok=r.tok;tokT=Date.now();if(shL!=='0'&&shL!=='1')sh=r.sh?1:0;me={lad:r.lad||null,tier:r.tier,ntf:r.ntf,tg:r.tg,nm:r.nm,sh:r.sh,claims:r.claims||[],day:r.day,wk:r.wk,wend:r.wend,sd:r.sd||null,t:Date.now()};
        var k;if(r.tk)for(k in r.tk)if(r.tk.hasOwnProperty(k)&&r.tk[k]&&r.tk[k].ok)tks[k]=wrap(r.tk[k]);else if(r.tk.hasOwnProperty(k))tks[k]={no:r.tk[k]};
        setSt('ok');end(true);});}
    function end(ok){var q=helloQ||[],i;helloQ=null;for(i=0;i<q.length;i++)try{q[i](ok);}catch(e){}}
    if(plat()==='ya'){var got=false;try{O.sig(function(s){if(!got){got=true;go(s);}});}catch(e){if(!got){got=true;end(false);}}}
    else go('');}

  function wrap(t){t.rng=rng(t.seed);t.got=Date.now();return t;}

  /* общий вызов с жетоном; один повтор, если жетон истёк */
  function call(op,body,cb,want,again){
    if(!api.on||resting())return later(cb,null);
    hello(want,function(ok){
      if(!ok)return cb(null);
      body.tok=tok;
      post(op,body,function(r){
        if(r&&!r.ok&&r.why==='tok'&&!again){tok='';return call(op,body,cb,want,true);}
        if(r&&!r.ok)refuse(r);
        cb(r);});});}

  /* --- путёвка: cb({t, seed, left, mode, rng}) или cb(null) (нет онлайна) или cb({no:'limit'}) (попытки кончились) --- */
  function ticket(mode,cb,pa){  /* pa — параметры досок от игры, например {l:17} (номер уровня) для досок 'a@l' */
    if(!api.on||resting())return later(cb,null);
    hello(pa?[]:[mode],function(ok){
      if(!ok)return cb(null);
      var t=pa?null:tks[mode];
      if(t){delete tks[mode];if(t.no)return cb({no:t.no.why||'no',left:0});
        if(Date.now()-t.got<(t.exp||0)*1000-60e3)return cb(t);}
      var b={mode:mode};if(pa)b.pa=pa;
      call('ticket',b,function(r){
        if(!r)return cb(null);
        cb(r.ok?wrap(r):{no:r.why||'no',left:r.left||0});});});}

  /* --- результат: CUP.submit(t, очки, {log:[…], d:мс_игры, next:true}, cb) → cb({rank, approx, best, bv, lg, next, …}) | cb(null) | cb({no:'bad'|'used'|…}) --- */
  function submit(t,v,o,cb){
    if(typeof o==='function'){cb=o;o={};}o=o||{};
    if(!t||!t.t)return later(cb,null);
    var b={t:t.t,v:Math.round(v)};if(o.log!==undefined)b.log=o.log;if(o.d)b.d=Math.round(o.d);if(o.next)b.next=1;
    call('submit',b,function(r){
      if(!r)return cb(null);
      if(!r.ok)return cb({no:r.why||'no',c:r.c});
      topC={};if(r.next&&r.next.ok)r.next=wrap(r.next);else if(r.next)r.next={no:r.next.why||'no',left:0};
      cb(r);});}

  /* --- таблица: per 'd' день | 'w' неделя | 'a' всё время; в памяти 60 с (повторное открытие окна — без запроса) --- */
  function top(mode,per,cb,pa){  /* per — 'd'|'w'|'a'|'p' или доска с параметром 'w@t' (своя ступень), 'a@l' + pa {l:17} (уровень) */
    var k=mode+':'+(per||'')+':'+(pa?JSON.stringify(pa):''),c=topC[k];
    if(c&&Date.now()-c.t<TOPC)return later(cb,c.r);
    var b={mode:mode};if(per)b.per=per;if(pa)b.pa=pa;
    call('top',b,function(r){if(r&&r.ok){topC[k]={t:Date.now(),r:r};cb(r);}else cb(null);});}

  function simple(op,body,cb){call(op,body,function(r){cb(r&&r.ok?r:null);});}
  function league(cb){simple('league',{},cb);}
  function claim(wk,cb){simple('claim',{wk:wk},cb||function(){});}
  function challenge(cb){simple('chal',{},cb);}                       // код вызова по последнему результату
  function accept(code,cb){call('accept',{code:String(code||'')},function(r){   // путёвка на том же зерне
    if(!r)return cb(null);cb(r.ok?wrap(r):{no:r.why||'no',ch:r.ch});});}
  function chres(code,cb){simple('chres',{code:String(code||'')},cb);}
  function friends(mode,ids,cb){if(plat()!=='vk')return later(cb,null);simple('friends',{mode:mode,ids:(ids||[]).slice(0,20)},cb);}
  function notify(on,cb){if(plat()!=='vk')return later(cb,null);simple('ntf',{on:on?1:0},function(r){if(r&&me)me.ntf=r.ntf;(cb||function(){})(r);});}
  function showName(on,cb){sh=on?1:0;shL=String(sh);ls('cup-'+G,shL);topC={};
    if(!tok)return later(cb,{ok:1,sh:sh});                              // ещё не входили — уйдёт вместе со входом
    simple('name',{sh:sh},function(r){if(r&&me)me.sh=r.sh;(cb||function(){})(r);});}
  function forget(cb){simple('forget',{},function(r){if(r){tok='';me=null;tks={};topC={};}(cb||function(){})(r);});}

  /* подпись строки таблицы: имя «Иван П.» или «Игрок 4821» (имя скрыто), у «соседей» лиги — имя на языке игры */
  function nameOf(row){if(!row)return '';var en=O.lang==='en'||(typeof O.lang==='function'&&O.lang()==='en');
    if(row.bot)return en&&row.nm_en?row.nm_en:row.nm;
    return row.nm||((en?'Player ':'Игрок ')+(row.tg||''));}

  /* ?cup=dev на localhost: ответы-заглушки, чтобы собирать окна игры без сервера */
  function mseed(m){return (((m==='week'?0x51A7C3:0x3039E5)+mskDay()%9973)*256+(mockN&255))>>>0;}  // как у сервера: старшие биты — турнир, младшие 8 — № попытки
  /* заглушка лестницы (как по умолчанию в ядре: 7 лиг × 4 подгруппы) */
  var LAD0={n:['Деревянная','Каменная','Медная','Бронзовая','Серебряная','Золотая','Алмазная'],ne:['Wooden','Stone','Copper','Bronze','Silver','Gold','Diamond'],s:4};
  function mock(op,b){mockN++;
    if(op==='hello'){var tk={},i;for(i=0;i<(b.want||[]).length;i++)tk[b.want[i]]={ok:1,t:'dev'+mockN+i,mode:b.want[i],seed:mseed(b.want[i]),left:1,exp:3600};
      return {ok:1,tok:'dev',ttl:86400,lad:LAD0,tier:0,ntf:0,tg:4821,nm:'Иван П.',sh:b.sh,claims:[],tk:tk,day:mskDay(),wk:0,wend:86400,sd:{day:(mseed('day')&~255)>>>0,week:(mseed('week')&~255)>>>0}};}
    if(op==='ticket')return {ok:1,t:'dev'+mockN,mode:b.mode,seed:mseed(b.mode),left:1,exp:3600};
    if(op==='submit'){var r={ok:1,v:b.v,per:'d',best:1,bv:b.v,rank:3,lg:{pts:40,tr:0}};if(b.next)r.next={ok:1,t:'dev'+mockN,mode:'',seed:mseed(''),left:0,exp:3600};return r;}
    if(op==='top')return {ok:1,b:b.mode,per:b.per||'d',top:[{i:1,nm:'Наталья К.',tg:0,v:320},{i:2,nm:'',tg:7313,v:290},{i:3,nm:'Иван П.',tg:0,v:250,me:1}],me:{i:3,v:250},around:[]};
    if(op==='league')return {ok:1,wk:0,wend:86400,lad:LAD0,tier:0,tiers:28,joined:1,tr:0,n:2,up:1,down:0,i:2,claims:[],
      rows:[{i:1,v:90,nm:'Наталья К.',tg:0,z:'up'},{i:2,v:40,nm:'Иван П.',tg:0,me:1},{i:3,v:25,bot:1,nm:'Петрович',nm_en:'Petrovich'}]};
    if(op==='chal')return {ok:1,code:'ABC234',v:250,mode:'day'};
    if(op==='accept')return {ok:1,t:'dev'+mockN,mode:'day',seed:mseed('day'),left:0,exp:3600,from:{nm:'Наталья К.',tg:0,v:320}};
    return {ok:1};}

  var api={on:false,v:V,init:init,rng:rng,ticket:ticket,submit:submit,top:top,league:league,claim:claim,challenge:challenge,accept:accept,
    chres:chres,friends:friends,notify:notify,showName:showName,forget:forget,nameOf:nameOf,
    state:function(){return st;},me:function(){return me;},shown:function(){return sh;},
    _dbg:function(){return {url:url,cut:cut,dev:dev,st:st,tok:!!tok,log:log,rest:restDay,tks:tks};}};
  return api;
})();
/*/CUP*/

/* ================= kr-cup — «Лига двора»: живая лига hobby-cup в Кирпичиках (BK-KR 24.10.2026; журнал hobby-analytics/release-i/backlog-2410/BK-KR.md) =================
   Образец — «Соседние заставы» Обороны (oborona/js/ob-cup.js). Лестница общая (Деревянная 4 … Алмазная 1), группа — люди «Игрок NNNN» + соседи двора с сервера.
   Очки лиги — «очки двора» недели (неделя с понедельника по МСК): уровень 10 + 10 за звезду (субботник ×2), задание дня 60 (+40 трудное, догнанный день 20),
   бесконечная — счёт/250 (≤ 60); не больше 400 в день (тот же предел pace у сервера). Копятся на устройстве всегда, видны — только когда сервер отвечает.
   Сервер молчит (нет kirp в CUP_LIVE, нет сети, ОК, мак/безголовый Chrome) → ни строки, ни окна: игра как без лиги.
   Сохранение: S.lg {pw,pv — неделя и очки; pd,pdv — день и очки дня; on — входил; ask — знакомство показано; jw — неделя входа; sv — сдано; lgw — забранная неделя; tr — ступень}.
   Облако — lgMerge в index.html (очки — больше в той же неделе, lgw — максимум). */
(function(){
'use strict';
var CUP_URL='https://functions.yandexcloud.net/d4e5nfg9u466prmmiooj';   // функция hobby-cup (та же, что у Рыбалки и Обороны); игра kirp включается строкой CUP_LIVE в облаке
const LAD0={n:['Деревянная','Каменная','Медная','Бронзовая','Серебряная','Золотая','Алмазная'],ne:['Wooden','Stone','Copper','Bronze','Silver','Gold','Diamond'],s:4};
const LGC=['#9c6b3c','#8e959c','#c4703a','#cd7f32','#aab4bc','#e6b53a','#5fc4e6'];
const DAY_CAP=400,LGT=600e3,SUBT=10*60e3,MIN_WINS=3;
const BOT_HOST={'Дед Митяй':'mityai','Дворник Михалыч':'mihalych','Тётя Валя':'valya','Баба Зина':'zina','Дядя Коля':'kolya'};
let lg=null,off=false,tk=null,vkNm='',vkAsked=false,busy=null,claimWait=false;
const isO=v=>v&&typeof v==='object'&&!Array.isArray(v);
const O=()=>{if(!isO(S.lg))S.lg={};return S.lg;};
const ev=(a,p)=>{try{STAT.ev('lg',Object.assign({a:a},p||{}));}catch(e){}};
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]);
const err=(w,x)=>{err.n=(err.n||0)+1;if(err.n<=5)try{console.warn('kr-cup '+w+': '+(x&&x.message||x));}catch(e){}};
// сутки и неделя МСК (неделя — с понедельника; 01.01.1970 — четверг)
const mskD=()=>Math.floor((nowMs()+3*3600e3)/864e5);
const wkNo=()=>Math.floor((mskD()+3)/7);
const fmt=n=>String(Math.round(n||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');

/* ---------- очки двора недели ---------- */
function pts(){const o=O();return o.pw===wkNo()?(o.pv|0):0;}
function addPts(n){n=Math.round(n);if(!(n>0))return 0;const o=O(),w=wkNo(),d=mskD();
  if(o.pw!==w){o.pw=w;o.pv=0;}if(o.pd!==d){o.pd=d;o.pdv=0;}
  const k=Math.max(0,Math.min(n,DAY_CAP-(o.pdv|0)));if(!k)return 0;o.pv=(o.pv|0)+k;o.pdv=(o.pdv|0)+k;return k;}

/* ---------- модуль CUP ---------- */
function sig(cb){if(CUP._dbg().dev)return cb('dev');
  try{if(!ysdk||(YP&&YP.getMode&&YP.getMode()==='lite'))return cb('');let done=false;const t=setTimeout(()=>{if(!done){done=true;cb('');}},8000);
    ysdk.getPlayer({signed:true}).then(p=>{if(!done){done=true;clearTimeout(t);cb(p&&p.signature||'');}},()=>{if(!done){done=true;clearTimeout(t);cb('');}});}catch(e){cb('');}}
// в Одноклассниках ядро не работает (подпись ОК другая) — модуль не включаем
if(!OK)CUP.init({g:'kirp',plat:PLAT==='vk'?'vk':'yandex',url:CUP_URL,lang:()=>LANG,name:()=>vkNm,sig:sig});
function vkName(cb){if(PLAT!=='vk'||vkAsked||!window.vkBridge)return cb();vkAsked=true;
  vkSend('VKWebAppGetUserInfo',{},4000).then(u=>{if(u&&u.first_name)vkNm=(u.first_name+' '+(u.last_name||'')).trim();cb();},()=>cb());}

/* ---------- лестница ---------- */
function lad(){return lg&&lg.lad||CUP.me()&&CUP.me().lad||LAD0;}
function tierP(i){const d=lad(),s=Math.max(1,d.s||1),n=(LANG==='en'&&d.ne?d.ne:d.n)||[],li=Math.max(0,Math.min(n.length-1,Math.floor((i||0)/s)));return {li:li,sub:s>1?s-(i||0)%s:0,nm:n[li]||''};}
function tierN(i){const t=tierP(i);return t.nm+(t.sub?' '+t.sub:'');}
function tierH(i){const t=tierP(i);return '<span class="krl-t"><i style="background:'+LGC[t.li%LGC.length]+'"></i>'+esc(tierN(i))+'</span>';}
function wendTxt(){const s=lg&&lg.wend!=null?lg.wend-(Date.now()-lg._t)/1000:0;if(!(s>0))return '';const h=Math.max(1,Math.ceil(s/3600));
  return h>=24?Math.floor(h/24)+L(' дн. ','d ')+(h%24)+L(' ч','h'):h+L(' ч','h');}
function plTxt(p){return LANG==='en'?p+(p%10===1&&p%100!==11?'st':p%10===2&&p%100!==12?'nd':p%10===3&&p%100!==13?'rd':'th')+' place':p+'-е место';}

/* ---------- живое ли сейчас ---------- */
function liveNow(){return !off&&!!lg&&!!lg.joined&&lg.lw===wkNo()&&Date.now()-lg._t<6*3600e3&&CUP.state()!=='gone';}
function canTry(){return CUP.on&&!OK&&CUP.state()!=='gone'&&((S.wins|0)>=MIN_WINS||O().on);}

/* ---------- сдать очки недели (в лигу идёт лучшее = последнее накопленное); force — даже если не выросли (вход в группу недели) ---------- */
function tkOk(t){return t&&t.t&&Date.now()-t.got<(t.exp||0)*1000-60e3&&t.wk===wkNo();}
function subWk(cb,force){cb=cb||function(){};const o=O(),w=wkNo(),v=pts(),sv=isO(o.sv)&&o.sv.w===w?o.sv:null;
  if(sv&&v<=sv.v&&!force)return cb();
  const go=t=>{if(!t||t.no)return cb();CUP.submit(t,v,{next:true},r=>{if(r&&r.ok){o.sv={w:w,v:Math.max(v,sv?sv.v:0),t:Date.now()};
      tk=r.next&&r.next.t?Object.assign(r.next,{wk:w}):null;if(r.lg){o.jw=w;if(r.lg.tr>=0)o.tr=r.lg.tr;}save();}cb();});};
  if(tkOk(tk)){const t=tk;tk=null;go(t);}else CUP.ticket('wk',t=>{if(t&&t.t)t.wk=w;go(t);});}

/* ---------- вход и лига (одна на всех ждущих) ---------- */
function login(cb,fresh){if(!fresh&&lg&&Date.now()-lg._t<LGT&&CUP.state()==='ok')return cb(lg);
  if(!canTry())return cb(null);
  if(busy){busy.push(cb);return;}busy=[cb];
  const end=r=>{const q=busy||[];busy=null;q.forEach(f=>{try{f(r);}catch(e){err('login',e);}});};
  vkName(()=>{let done=false;const tm=setTimeout(()=>{if(!done){done=true;off=true;end(null);}},15000);
    const o=O(),w=wkNo();
    subWk(()=>CUP.league(r=>{if(done)return;done=true;clearTimeout(tm);
      if(!r){off=true;return end(null);}
      off=false;r._t=Date.now();r.lw=w;lg=r;
      if(r.joined){if(!o.on)ev('in',{t:r.tier||0});o.on=1;o.jw=w;o.tr=r.tier||0;o.pl=r.i||0;}
      save();end(r);}),o.jw!==w);});}

/* ---------- окно «Лига двора» ---------- */
function css(){if(document.getElementById('krlCss'))return;const s=document.createElement('style');s.id='krlCss';
  s.textContent='.krl-t{white-space:nowrap}.krl-t i{display:inline-block;width:.8em;height:.8em;border-radius:50%;vertical-align:-1px;margin-right:4px;box-shadow:0 0 0 1px rgba(0,0,0,.3) inset}'+
  '.krl{max-height:46vh;overflow:auto;margin:8px 0;text-align:left;border-radius:14px;background:rgba(0,0,0,.04)}'+
  '.krl-r{display:flex;align-items:center;gap:8px;padding:5px 8px;font-size:15px;line-height:1.2;border-bottom:1px solid rgba(0,0,0,.06)}.krl-r:last-child{border-bottom:0}'+
  '.krl-r.me{background:rgba(255,200,40,.28);font-weight:800}.krl-r .p{width:22px;text-align:right;font-weight:800;flex:0 0 auto}'+
  '.krl-r .a{width:32px;height:32px;border-radius:50%;overflow:hidden;flex:0 0 auto;background:#e8eef5;display:flex;align-items:center;justify-content:center;font-size:18px}.krl-r .a svg{width:100%;height:100%}'+
  '.krl-r .n{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.krl-r .n small{display:block;font-size:12px;opacity:.7;font-weight:600}'+
  '.krl-r .v{font-weight:800;flex:0 0 auto}.krl-r .z{width:14px;flex:0 0 auto;text-align:center}'+
  '.krl-s{font-size:14px;opacity:.85;margin:6px 0}.krl-lp{margin:6px 0 0;font-weight:800}';
  document.head.appendChild(s);}
function rowsHTML(){const rows=(lg.rows||[]).slice();if(!rows.some(r=>r.me))rows.push({me:1,v:pts()});
  rows.forEach(r=>{if(r.me)r.v=Math.max(r.v||0,pts());});rows.sort((a,b)=>(b.v||0)-(a.v||0)||(a.me?-1:b.me?1:0));
  return '<div class="krl">'+rows.map((r,j)=>{const h=r.bot&&BOT_HOST[r.nm],up=r.z==='up',dn=r.z==='down';
    const av=r.me?portrait('mityai','happy'):h?portrait(h,'norm'):'🙂';
    return '<div class="krl-r'+(r.me?' me':'')+'"><b class="p">'+(j+1)+'</b><span class="a">'+(r.me?'🧱':av)+'</span><span class="n">'+esc(r.me?L('Ты','You'):CUP.nameOf(r))+
      '<small>'+(r.me?L('твой двор','your yard'):r.bot?L('сосед','neighbour'):L('живой игрок','live player'))+'</small></span><b class="v">'+(!r.me&&!r.v?'💤':fmt(r.v))+'</b>'+
      '<span class="z" style="color:'+(up?'#2f8a4a':dn?'#c0392b':'transparent')+'">'+(up?'▲':dn?'▼':'·')+'</span></div>';}).join('')+'</div>';}
function place(){const rows=(lg&&lg.rows||[]).map(r=>r.me?Math.max(r.v||0,pts()):r.v||0),me=pts();let p=1;rows.forEach((v,i)=>{if(!(lg.rows[i]||{}).me&&v>me)p++;});return p;}
function rwK(){const k=lg&&lg.rwd&&lg.rwd.k;return k?k[Math.max(0,Math.min(k.length-1,lg.tier||0))]|0:0;}
function openLg(from){css();
  if(!lg){login(x=>{if(x&&x.joined)openLg(from);});return;}   // лиги ещё нет — сначала вход (окно — когда сервер ответит)
  if(claims().length){claimWin(claims()[0]);return;}
  if(!O().ask){intro(()=>openLg(from));return;}
  STAT.screen('league');ev('view',{f:from||'',p:pts(),n:lg.n|0});
  const p=place(),v=pts(),k=rwK(),z=lg.rwd&&lg.rwd.z||{};
  const say=!v?L('Новая неделя! Соседи уже кладут кирпичи — самое время начать.','A new week! The neighbours are already laying bricks — a good time to start.'):
    p===1?L('Ты впереди всего двора! Так держать, внучок.','You lead the whole yard! Keep it up.'):
    p<=3?L('Почти первые! Неделя длинная — догоним.','Almost first! The week is long — we will catch up.'):
    L('Не спеши: пара уровней — и подвинем соседей.','No rush: a couple of levels — and we will move past the neighbours.');
  modal((innerHeight>=760?'<div class="av">'+portrait('mityai',v&&p<=3?'happy':'norm')+'</div>':'')+'<h2>🏆 '+L('Лига двора','Yard league')+'</h2>'+
    '<p class="krl-s">'+L('Ступень: ','Step: ')+'<b>'+tierH(lg.tier||0)+'</b>'+(wendTxt()?' · '+L('до итогов ','results in ')+wendTxt():'')+'</p>'+
    '<p class="quote">'+say+'</p>'+rowsHTML()+
    (k?'<p class="goal">💰 '+L('Награда за неделю на этой ступени: ','Weekly reward at this step: ')+'<b>'+coinsTxt(k)+'</b>'+(lg.up?' · ▲ '+coinsTxt(Math.round(k*(z.up||1.5))):'')+'</p>':'')+
    '<p class="krl-s">'+L('Очки: уровни (за ★ больше), задание дня, бесконечная — до 400 в день. Итоги в понедельник: ▲ лучшие — ступенью выше, ▼ последние — ниже. «Сосед» — герой игры, остальные — живые игроки.',
      'Points: levels (more for ★), the daily task, endless — up to 400 a day. Results on Monday: ▲ the best move up, ▼ the last move down. “Neighbour” is a game character, the rest are live players.')+'</p>'+
    '<div class="row"><button class="btn green" id="krlOk">'+L('Хорошо','OK')+'</button></div>');
  $('krlOk').onclick=()=>{try{SND.tap();}catch(e){}hideModal();try{if($('scr-menu').classList.contains('on'))renderMenu();}catch(e){}};}
function intro(next){const me=CUP.me()||{},sh=CUP.shown();
  modal('<div class="av">'+portrait('mityai','wow')+'</div><h2>🏆 '+L('Лига двора','Yard league')+'</h2><p class="quote">'+
    L('Слыхал, внучок? Теперь соревнуемся с живыми игроками из других дворов! Неделя — очки за уровни и задания, лучшие поднимаются в лиге. Пока людей мало, подтягиваются соседи.',
      'Have you heard? Now we compete with live players from other yards! Each week — points for levels and tasks, the best move up the league. While there are few people, the neighbours join in.')+'</p>'+
    '<p class="krl-s">'+L('В таблице ты — <b>«Игрок '+(me.tg||'NNNN')+'»</b>: имя скрыто. Показать имя («Имя Ф.») или удалить свои данные турниров — в ⚙.',
      'On the board you are <b>“Player '+(me.tg||'NNNN')+'”</b>: your name is hidden. Show your name or delete your contest data in ⚙.')+'</p>'+
    '<div class="row"><button class="btn green" id="krlI0">'+(sh?L('Оставить имя','Keep my name'):L('Без имени — играем!','No name — let’s play!'))+'</button><button class="btn" id="krlI1">'+(sh?L('Скрыть имя','Hide my name'):L('Показывать имя','Show my name'))+'</button></div>');
  let did=0;const fin=x=>{if(did)return;did=1;O().ask=1;save();ev('intro',{n:x});next();};
  $('krlI0').onclick=()=>fin(sh?1:0);
  $('krlI1').onclick=()=>{const b=$('krlI1');if(b)b.disabled=true;vkName(()=>CUP.showName(!sh,()=>{lg=null;login(()=>{if(lg)fin(sh?0:1);else{did=1;hideModal();}},true);}));};}

/* ---------- итоги прошлых недель (к выдаче) ---------- */
function claims(){const g=O().lgw||0,src=lg&&lg.claims||CUP.me()&&CUP.me().claims||[];return src.filter(c=>c&&c.wk>g);}
function claimWin(c){css();const o=O(),coins=Math.max(0,Math.round(c.rw||0)),up=c.res==='up',dn=c.res==='down',top=c.res==='top',p=c.pl|0;
  if((o.sw||0)<c.wk){o.sw=c.wk;save();ev('wk',{f:c.tr,t:c.to,p:p,o:c.pts||0,r:coins,h:c.nh||0,m:c.res});}
  const h=p===1?L('🏆 Первое место во дворе!','🏆 First in the yard!'):p===2?L('🥈 Второе место!','🥈 Second place!'):p===3?L('🥉 Третье место!','🥉 Third place!'):L('🏆 Итоги недели','🏆 Weekly results');
  const t=up?L('Ну, внучок, ты из лучших! Поднимаемся на ступень выше.','You are among the best! Moving up a step.'):top?L('Выше лиги нет — держим вершину!','There is no higher league — hold the top!'):
    dn?L('Неделя не задалась — опускаемся на ступень. Ничего, отыграемся!','A rough week — we drop a step. We will win it back!'):L('Держим ступень. На этой неделе — выше!','We hold our step. This week — higher!');
  modal('<div class="av">'+portrait('mityai',dn?'sad':'happy')+'</div><h2>'+h+'</h2><p class="quote">'+t+'</p>'+
    '<p class="krl-s">'+L('Прошлая неделя: ','Last week: ')+'<b>'+plTxt(p||1)+'</b>'+(c.nh?L(' (живых — ',' (live: ')+c.nh+')':'')+' · '+fmt(c.pts||0)+L(' очков',' points')+'</p>'+
    '<p class="krl-s">'+(up?'▲ '+tierH(c.tr)+' → <b>'+tierH(c.to)+'</b>':dn?'▼ '+tierH(c.tr)+' → '+tierH(c.to):L('Ступень: ','Step: ')+tierH(c.to))+'</p>'+
    (coins?'<p class="coins-won">+'+coinsTxt(coins)+'</p>':'')+
    '<div class="row"><button class="btn green" id="krlTake">'+(coins?L('💰 Забрать','💰 Collect'):L('Хорошо','OK'))+'</button></div>');
  try{if(up||top)SND.win();}catch(e){}
  $('krlTake').onclick=()=>{const o=O();if(c.wk>(o.lgw||0)){o.lgw=c.wk;o.tr=c.to;if(coins){S.coins+=ern('quest',coins);}ev('take',{t:c.to,r:coins});save();try{updCoins();if(coins)SND.coin();}catch(e){}}
    CUP.claim(c.wk);if(lg&&lg.claims)lg.claims=lg.claims.filter(x=>x.wk!==c.wk);
    hideModal();try{if($('scr-menu').classList.contains('on'))renderMenu();}catch(e){}};}

/* ---------- вход после меню: тихо, один раз за заход; итоги — когда окно свободно ---------- */
function boot(){if(boot.d||!canTry())return;boot.d=1;
  login(r=>{if(!r)return;try{if($('scr-menu').classList.contains('on')&&!modalOn)renderMenu();}catch(e){}
    if(!claims().length||claimWait)return;claimWait=true;let n=0;
    const tm=setInterval(()=>{if(++n>240){clearInterval(tm);claimWait=false;return;}if(G||modalOn||!$('scr-menu').classList.contains('on'))return;clearInterval(tm);claimWait=false;
      const c=claims()[0];if(c)claimWin(c);},1000);});}

/* ---------- крючки игры ---------- */
// строка в окне итога: «🏆 Лига двора: +N» (только когда лига живая)
function lpLine(k){if(!(k>0)||!liveNow())return;try{const c=$('mcard');if(!c||!modalOn||c.querySelector('.krl-lp'))return;const p=document.createElement('p');p.className='goal krl-lp';
  p.textContent='🏆 '+L('Лига двора: +','Yard league: +')+k+L(' очков',' points')+' · '+fmt(pts());const rows=c.querySelectorAll('.row'),r=rows[rows.length-1];if(r)c.insertBefore(p,r);else c.appendChild(p);}catch(e){err('lp',e);}}
function after(k){if(!(k>0))return;save();lpLine(k);const o=O();
  if(o.on&&!off&&canTry()&&(!isO(o.sv)||Date.now()-(o.sv.t||0)>SUBT))setTimeout(()=>subWk(()=>{if(lg)lg._t=0;}),1500);}
{const f0=levelWon;levelWon=function(){const my=G;let k=0;
  try{if(my&&my.mode!=='daily'&&!my.chl&&my.cfg&&my.st){const st=starsFor(my.st.moves,my.par||levelPar(my.cfg));k=(10+10*st)*(my.cfg.boss?2:1);}}catch(e){err('lv',e);}
  const r=f0.apply(this,arguments);if(k)try{after(addPts(k));}catch(e){err('lv2',e);}return r;};}
{const f0=dailyWon;dailyWon=function(){const my=G;let k=0;
  try{if(my&&my.cfg&&!my.chl){const d=String(my.day);if(my.cfg.hard){if(!(S.dh&&S.dh[d]))k=40;}else if(!S.daily[d])k=my.cfg.late?20:60;}}catch(e){err('dw',e);}
  const r=f0.apply(this,arguments);if(k)try{after(addPts(k));}catch(e){err('dw2',e);}return r;};}
{const f0=endlessOver;endlessOver=function(){const my=G;let k=0;
  try{if(my&&my.st&&!my.k3e&&!my.chl)k=Math.min(60,Math.floor((my.st.score||0)/250));}catch(e){err('eo',e);}
  const r=f0.apply(this,arguments);if(k)try{after(addPts(k));}catch(e){err('eo2',e);}return r;};}
// меню: строка в «Что сегодня» (только живая лига) + вход после показа меню
{const f0=todayCard;todayCard=function(){const r=f0.apply(this,arguments);
  try{const e=$('mToday');if(e&&liveNow()&&e.querySelector('h3')){const cl=claims().length,p=place(),v=pts();
      const b=document.createElement('button');b.className='trow'+(cl||!O().ask?' hot':'');b.id='tLeague';
      b.innerHTML='<span class="ic">🏆</span><span>'+(cl?L('Лига двора: итоги недели — забери награду','Yard league: weekly results — collect'):
        L('Лига двора: ','Yard league: ')+esc(tierN(lg.tier||0))+' · '+(v?plTxt(p)+' · '+fmt(v):L('начни неделю','start the week')))+'</span><i>›</i>';
      e.querySelector('h3').after(b);b.onclick=()=>{try{SND.tap();}catch(x){}openLg('menu');};}}catch(x){err('today',x);}
  return r;};}
{const f0=openMenu;openMenu=function(){const r=f0.apply(this,arguments);if(!boot.d&&canTry())setTimeout(boot,4000);return r;};}
// ⚙: показ имени и удаление данных турниров (только если лига уже была)
{const f0=openSettings;openSettings=function(){const r=f0.apply(this,arguments);
  try{if(!O().on||!CUP.on||OK)return r;const c=$('mcard'),sets=c&&c.querySelector('.sets');if(!sets||$('stLg'))return r;const row=sets.querySelector('.row');
    const b=document.createElement('button');b.className='set';b.id='stLg';
    b.innerHTML='<span>🏆 '+L('Лига двора','Yard league')+'<br><small>'+L('имя в таблице, мои данные','name on the board, my data')+'</small></span><i class="go">›</i>';
    if(row)sets.insertBefore(b,row);else sets.appendChild(b);b.onclick=()=>{try{SND.tap();}catch(e){}lgSet();};}catch(e){err('set',e);}
  return r;};}
function lgSet(){css();const sh=CUP.shown(),tg=CUP.me()&&CUP.me().tg;
  modal('<h2>🏆 '+L('Лига двора','Yard league')+'</h2><div class="sets">'+
    '<button class="set" id="krlSN"><span>👤 '+L('Показывать моё имя','Show my name')+'<br><small>'+L('«Имя Ф.» вместо «Игрок '+(tg||'NNNN')+'»','your name instead of “Player '+(tg||'NNNN')+'”')+'</small></span>'+(sh?'<i>'+L('вкл','on')+'</i>':'<i class="off">'+L('выкл','off')+'</i>')+'</button>'+
    '<button class="set" id="krlSD"><span>🗑 '+L('Удалить мои данные турниров','Delete my contest data')+'<br><small id="krlSM">'+L('очки и место в лиге на сервере, во всех играх','scores and league place on the server, in all games')+'</small></span></button>'+
    '<div class="row"><button class="btn green" id="krlSB">'+L('Готово','Done')+'</button></div></div>');
  $('krlSB').onclick=()=>openSettings();
  $('krlSN').onclick=()=>{const v=!CUP.shown();ev('name',{v:v?1:0});vkName(()=>CUP.showName(v,()=>{if(lg)lg._t=0;lgSet();}));};
  const del=$('krlSD');del.onclick=()=>{const m=$('krlSM');if(!del.dataset.sure){del.dataset.sure='1';m.textContent=L('Нажми ещё раз — очки и место в лиге будут удалены с сервера во всех играх. Монеты и уровни останутся.','Tap again — your league scores and place will be deleted from the server in all games. Coins and levels stay.');return;}
    m.textContent=L('Удаляем…','Deleting…');CUP.forget(x=>{del.dataset.sure='';const mm=$('krlSM');
      if(x){const o=O();['on','ask','jw','sv','pl','tr'].forEach(k=>delete o[k]);lg=null;tk=null;save();ev('forget',{});}
      if(mm)mm.textContent=x?L('Готово: данные турниров удалены.','Done: your contest data is deleted.'):L('Сервер сейчас не отвечает — попробуй позже.','The server is not responding — try again later.');});};}

// меню уже открыто при загрузке файла (запуск сразу в меню) — тот же отложенный вход
setTimeout(()=>{try{if(!boot.d&&canTry()&&$('scr-menu').classList.contains('on'))boot();}catch(e){}},4000);
window.KRL={open:openLg,boot:boot,live:liveNow,pts:pts,add:addPts,
  _dbg:()=>({lg:lg,off:off,tk:tk,o:O(),cup:CUP._dbg()}),_reset:()=>{lg=null;off=false;tk=null;boot.d=0;}};
})();
