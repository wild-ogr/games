/* ================= vik-cup — живая лига hobby-cup в «Лиге двора» (UP-OV, 24.10.2026; журнал hobby-analytics/release-i/fix-2410/UP-OV.md) =================
   Решение (А), как «Соседние заставы» Обороны (js/ob-cup.js): когда сервер отвечает, таблица вкладки «Лига» = живая группа лиги
   (люди «Игрок NNNN» + соседи-персонажи с сервера), очки — те же очки недели (YD.lgScore: 5 лучших дней + Кубок выходного дня),
   лестница общая 7×4 (Деревянная 4 … Алмазная 1), награда за неделю — монеты с сервера (окно «Итоги недели», один раз на неделю).
   Местный итог недели, в которой игрок был в живой группе, отменяется (монеты, переход лиги, окно) — награда приходит с сервера.
   Только ВКонтакте и Яндекс: в Одноклассниках (OK) ядро не работает — там всё как было. Сервер молчит / игра не в CUP_LIVE / мак без ?cup=dev — всё как было.
   Сохранение S.vcup {on, jl{неделя:1}, jw, lgw — неделя последней выданной награды, tr — ступень, ask — показано знакомство, sv{w,v} — что сдано}.
   Проверка на маке: ?cup=dev (ответы-заглушки модуля CUP). Сервер: online/games/viktorina.py. */
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
(function(){
'use strict';
var YD=window.YD;if(!YD||typeof CUP==='undefined')return;
var CUP_URL='https://functions.yandexcloud.net/d4e5nfg9u466prmmiooj';
var LAD0={n:['Деревянная','Каменная','Медная','Бронзовая','Серебряная','Золотая','Алмазная'],s:4};
var LGC=['#9c6b3c','#8e959c','#c4703a','#cd7f32','#aab4bc','#e6b53a','#5fc4e6'];
var LGT=600e3,SUBT=10*60e3;
var lg=null,off=false,busy=null,vkNm='',claimWait=false,subT=0;
var q=/[?&]cup=(dev|sink:\d+)/.test(location.search);
function O(){if(!S.vcup||typeof S.vcup!=='object')S.vcup={};return S.vcup;}
function ev(a,p){try{var o={a:a};for(var k in (p||{}))o[k]=p[k];STAT.ev('lg',o);}catch(e){}}
function cev(a,p){try{var o={a:a,on:1};for(var k in (p||{}))o[k]=p[k];STAT.ev('cup',o);}catch(e){}}
var esc=YD.esc;
function err(w,x){err.n=(err.n||0)+1;if(err.n<=5)try{console.warn('vik-cup '+w+': '+(x&&x.message||x));}catch(e){}}
// где можно: не ОК, есть адрес, не автотест/мак (кроме ?cup=dev|sink), есть мост VK или SDK Яндекса
function can(){if(typeof OK!=='undefined'&&OK)return false;if(q)return true;if(!CUP_URL)return false;
  try{if(AD_LOCAL||navigator.webdriver||/HeadlessChrome/.test(navigator.userAgent))return false;}catch(e){}
  return PLAT==='vk'?!!VK:!!ysdk;}
// местный день = день МСК (иначе неделя игры может не совпасть с неделей сервера — тогда очки не сдаём)
function mskD(){return Math.floor((YD.now()+3*3600e3)/864e5);}
function dateOk(){return mskD()===YD.dayNo();}

/* ---------- сохранение ---------- */
YD.fix(function(){var o=O();['jw','lgw','tr','ask','on'].forEach(function(k){if(typeof o[k]!=='number'||!(o[k]>=0))delete o[k];});
  if(o.jl&&typeof o.jl!=='object')delete o.jl;if(o.sv&&typeof o.sv!=='object')delete o.sv;});
YD.merge(function(loc,d){var a=O(),b=d&&d.vcup;if(!b||typeof b!=='object')return;
  ['jw','lgw','ask','on'].forEach(function(k){if(typeof b[k]==='number')a[k]=Math.max(a[k]||0,b[k]);});
  if(b.jl&&typeof b.jl==='object'){if(!a.jl)a.jl={};for(var k in b.jl)a.jl[k]=1;}
  if(typeof b.tr==='number'&&a.tr==null)a.tr=b.tr;});

/* ---------- модуль CUP ---------- */
function sig(cb){if(CUP._dbg().dev)return cb('dev');
  try{if(!ysdk)return cb('');var done=false,t=setTimeout(function(){if(!done){done=true;cb('');}},8000);
    ysdk.getPlayer({signed:true}).then(function(p){if(!done){done=true;clearTimeout(t);cb(p&&p.signature||'');}},function(){if(!done){done=true;clearTimeout(t);cb('');}});}catch(e){cb('');}}
var inited=false;
function init(){if(inited)return CUP.on;inited=true;
  CUP.init({g:'viktorina',plat:PLAT==='vk'?'vk':'yandex',url:CUP_URL,lang:'ru',name:function(){return vkNm;},sig:sig,
    tr0:function(){var l=S.lgaL;return typeof l==='number'?Math.max(0,Math.min(2,l|0))*4:undefined;}});   // местная лига → лига той же высоты (сервер берёт один раз)
  return CUP.on;}
function vkName(cb){if(PLAT!=='vk'||vkNm||!CUP.shown()||!window.vkBridge)return cb();
  try{vkSend('VKWebAppGetUserInfo',{},4000).then(function(u){if(u&&u.first_name)vkNm=(u.first_name+' '+(u.last_name||'')).trim();cb();},function(){cb();});}catch(e){cb();}}

/* ---------- лестница ---------- */
function lad(){return lg&&lg.lad||CUP.me()&&CUP.me().lad||LAD0;}
function tierP(i){var d=lad(),s=Math.max(1,d.s||1),n=d.n||[],li=Math.max(0,Math.min(n.length-1,Math.floor((i||0)/s)));return {li:li,sub:s>1?s-(i||0)%s:0,nm:n[li]||''};}
function tierN(i){var t=tierP(i);return t.nm+(t.sub?' '+t.sub:'');}
function tierH(i){var t=tierP(i);return '<span class="vcT"><i style="background:'+LGC[t.li%LGC.length]+'"></i>'+esc(tierN(i))+'</span>';}
function liveNow(){return !off&&!!lg&&!!lg.joined&&lg.lw===YD.week()&&Date.now()-lg._t<6*3600e3&&CUP.state()!=='gone';}
function joinWk(tr){var o=O(),w=YD.week(),me=CUP.me();o.on=1;if(!o.jl)o.jl={};if(!o.jl[w]){o.jl[w]=1;Object.keys(o.jl).map(Number).sort(function(a,b){return b-a;}).slice(6).forEach(function(k){delete o.jl[k];});}
  if(me&&me.wk&&(o.jw||0)<me.wk){if(!o.jw)ev('in',{t:tr!=null?tr:0});o.jw=me.wk;}}

/* ---------- сдать очки недели (лучшее = последнее). force — даже если не выросли (вход в группу недели) ---------- */
function subLg(cb,force){cb=cb||function(){};if(!dateOk())return cb();var o=O(),w=YD.week(),v=0;try{v=YD.lgScore();}catch(e){}
  var sv=o.sv&&o.sv.w===w?o.sv:null;if(sv&&v<=sv.v&&!force)return cb();
  CUP.ticket('lg',function(t){if(!t||t.no||!t.t)return cb();CUP.submit(t,v,{},function(r){if(r&&r.ok){o.sv={w:w,v:Math.max(v,sv?sv.v:0)};subT=Date.now();
    if(r.lg){joinWk(r.lg.tr||0);o.tr=r.lg.tr||0;}YD.save();}cb();});});}

/* ---------- вход и группа (одна на всех ждущих) ---------- */
function login(cb,fresh){if(!init())return cb(null);if(!fresh&&lg&&Date.now()-lg._t<LGT&&CUP.state()==='ok')return cb(lg);
  if(busy){busy.push(cb);return;}busy=[cb];
  var end=function(r){var qq=busy||[];busy=null;qq.forEach(function(f){try{f(r);}catch(e){err('login',e);}});};
  vkName(function(){var done=false,tm=setTimeout(function(){if(!done){done=true;off=true;end(null);}},12000);
    subLg(function(){CUP.league(function(r){if(done)return;done=true;clearTimeout(tm);
      if(!r||!r.ok){off=true;return end(null);}
      off=false;r._t=Date.now();r.lw=YD.week();lg=r;var o=O();o.on=1;if(r.joined){joinWk(r.tier||0);o.tr=r.tier||0;}
      fixLocal();YD.save();end(r);});},!(O().jl&&O().jl[YD.week()]));});}

/* ---------- местный итог «живой» недели — отменить (награда придёт с сервера) ---------- */
function fixLocal(){try{var r=S.lgaR,o=O();if(!r||!o.jl||!o.jl[r.w]||r.cup)return;
  if(r.c>0){S.coins=Math.max(0,(S.coins||0)-r.c);try{updCoins();}catch(e){}}
  S.lgaL=r.l;if(S.lgaH)delete S.lgaH[r.w];delete S.lgaR;YD.save();ev('loc0',{w:r.w%1000,c:r.c||0});}catch(e){err('fixLocal',e);}}

/* ---------- итоги прошлых недель с сервера ---------- */
function claims(){var g=O().lgw||0,src=lg&&lg.claims||CUP.me()&&CUP.me().claims||[];return src.filter(function(c){return c&&c.wk>g;});}
function claimWin(c,then){var o=O(),got=c.wk<=(o.lgw||0),coins=got?0:Math.max(0,Math.round(+c.rw||0)),up=c.res==='up',dn=c.res==='down',top=c.res==='top',pl=c.pl|0;
  var h=pl===1?'🏆 Первое место в группе!':pl===2?'🥈 Второе место в группе!':pl===3?'🥉 Третье место в группе!':'🥇 Итоги недели';
  var t=up?'Живые соседи признали: ты — из лучших знатоков! Поднимаемся выше.':top?'Выше лиги нет — держим вершину!':dn?'Неделя не задалась — спускаемся на ступень. Отыграемся!':'Держим ступень. На этой неделе — выше!';
  modal('<div class="av">'+portrait('mihalych',dn?'norm':'happy')+'</div><h2>'+h+'</h2><p>'+t+'</p>'+
    '<p class="goal">Живая лига, прошлая неделя: <b>'+(pl?pl+' место':'—')+'</b> в группе'+(c.nh?' (живых — '+c.nh+')':'')+' · '+(c.pts||0)+' очков</p>'+
    '<p class="goal">'+(up?'▲ Ступень выше: '+tierH(c.tr)+' → <b>'+tierH(c.to)+'</b>':dn?'▼ Ступень ниже: '+tierH(c.tr)+' → '+tierH(c.to):'Ступень: '+tierH(c.to))+'</p>'+
    (coins?'<p class="goal tipl">💰 Награда за неделю: +'+coinsTxt(coins)+'</p>':'')+
    '<div class="row"><button class="btn accent noenter" id="vcTake">'+(coins?'💰 Забрать':'Хорошо')+'</button></div>');
  if(!got)ev('wk',{f:c.tr,t:c.to,p:pl,o:c.pts||0,r:coins,h:c.nh||0,m:c.res||''});
  document.getElementById('vcTake').onclick=function(){var o=O();if(c.wk>(o.lgw||0)){o.lgw=c.wk;o.tr=c.to;if(coins){S.coins=(S.coins||0)+coins;try{STAT.earn('quest',coins);}catch(e){}try{SND.coin();}catch(e){}}
      ev('take',{t:c.to,r:coins});cev('claim',{pl:pl,g:coins});YD.save();try{updCoins();}catch(e){}}
    CUP.claim(c.wk);if(lg&&lg.claims)lg.claims=lg.claims.filter(function(x){return x.wk!==c.wk;});hideModal();if(then)then();};}

/* ---------- вход сам, после меню (как Оборона v4.4): игравшим в лигу / с 3 лестниц ---------- */
function eligible(){var o=O();return !!o.on||(S.games||0)>=3;}
function boot(){if(!can()||!eligible())return;
  login(function(r){if(!r)return;try{YD.homeRefresh();}catch(e){}if(!boot.s){boot.s=1;ev('ses',{t:O().tr||0});}
    if(!claims().length||claimWait)return;claimWait=true;var n=0;
    var tm=setInterval(function(){if(++n>240){clearInterval(tm);claimWait=false;return;}if((typeof G!=='undefined'&&G&&!G.over)||modalOn)return;clearInterval(tm);claimWait=false;
      var c=claims()[0];if(c)claimWin(c,function(){try{if(YD.cur()==='league'&&document.getElementById('scr-yard').classList.contains('on'))YD.render();}catch(e){}});},1000);});}
YD.on('start',function(){fixLocal();setTimeout(boot,2500);});
// меню: раз в 10 минут — сдать очки и обновить группу
try{var om=window.openMenu;if(typeof om==='function')window.openMenu=function(){var r=om.apply(this,arguments);try{if(can()&&O().on&&Date.now()-subT>SUBT){subT=Date.now();login(function(){},true);}}catch(e){}return r;};}catch(e){}

/* ---------- вкладка «Лига» вживую ---------- */
function rows(){var out=[],mine=0;try{mine=YD.lgScore();}catch(e){}
  (lg.rows||[]).forEach(function(r){out.push({me:!!r.me,bot:!!r.bot,nm:r.me?'Ты':CUP.nameOf(r),v:r.me?Math.max(r.v||0,mine):(r.v||0),z:r.z||''});});
  if(!out.some(function(r){return r.me;}))out.push({me:true,nm:'Ты',v:mine,z:''});
  return out.sort(function(a,b){return b.v-a.v||(a.me?-1:b.me?1:0);});}
function wendTxt(){var s=lg&&lg.wend!=null?lg.wend-(Date.now()-lg._t)/1000:0;if(!(s>0))return '';var h=Math.max(1,Math.ceil(s/3600));return 'до итогов '+(h>=24?Math.floor(h/24)+' дн. '+(h%24)+' ч':h+' ч');}
function liveHTML(){var rs=rows(),me=0,i;for(i=0;i<rs.length;i++)if(rs[i].me)me=i+1;var mine=rs[me-1]?rs[me-1].v:0,tr=lg.tier||0,
    k=lg.rwd&&lg.rwd.k?lg.rwd.k[Math.max(0,Math.min(lg.rwd.k.length-1,tr))]:0,meR=CUP.me()||{};
  var h='<div class="lghead vclive">'+YD.lgBadge(Math.min(2,Math.floor(tr/8)),64)+'<div><b>Живая лига · '+tierH(tr)+'</b><small>'+esc(wendTxt())+' · в группе '+rs.length+(lg.n?' (живых — '+lg.n+')':'')+'</small><small>Твои очки: <b>'+mine+'</b></small></div></div>';
  h+='<p class="goal lgzt">'+(!mine?'Новая неделя! Живые знатоки уже отвечают — сыграй лестницу или табло.':me===1?'Ты впереди всей группы! Держись до понедельника.':me<=3?'Ты в тройке! Неделя длинная — можно и выше.':'До тройки — '+(me-3)+' '+YD.pl(me-3,'место','места','мест')+'.')+'</p>';
  h+='<div class="lgt">'+rs.map(function(r,j){var up=r.z==='up',dn=r.z==='down';
    return '<div class="lgr'+(r.me?' lgme':'')+(up?' up':dn?' down':'')+'"><b class="lgp">'+(j+1)+'</b>'+(r.me||!r.bot?'<span class="vcF">'+(r.me?'🙂':'🧑')+'</span>':'<span class="vcF">🏠</span>')+
      '<span class="lgn"><b>'+esc(r.nm)+'</b><small>'+(r.me?'5 лучших дней недели':r.bot?'сосед':'живой знаток')+'</small></span><i class="lgg">'+(r.v||'—')+'</i></div>';}).join('')+'</div>';
  h+='<p class="ydnote">Живая лига: группа до 30 знатоков, очки — те же очки недели (5 лучших дней + Кубок выходного дня). Итог — в понедельник: лучшие — ступенью выше, последние — ниже.'+
    (k?' Награда за неделю на этой ступени: '+YD.ct(k)+' (подъём ×1,5, спуск ×0,5).':'')+' В таблицах ты — «Игрок '+(meR.tg||'NNNN')+'»'+(CUP.shown()?' (имя показано)':', имя скрыто')+'; показать имя или удалить данные — в ⚙.</p>';
  return h;}
var r0=YD.render;YD.render=function(){r0.apply(this,arguments);try{if(YD.cur()!=='league')return;
  if(!liveNow()){if(can()&&eligible())login(function(r){if(r&&r.joined&&YD.cur()==='league'&&document.getElementById('scr-yard').classList.contains('on'))YD.render();});return;}
  var pane=document.getElementById('ydPane');if(!pane)return;var cb=pane.querySelector('.cupb');pane.innerHTML=liveHTML();if(cb)pane.appendChild(cb);
  try{document.getElementById('ydSub').textContent='Живая лига · '+tierN(lg.tier||0);}catch(e){}
  try{if(window.LK&&LK.scan)LK.scan(pane);}catch(e){}
  if(!O().ask){O().ask=1;YD.save();cev('intro',{n:CUP.shown()?1:0});}
  cev('view',{n:lg.n|0});if(claims().length&&!modalOn)claimWin(claims()[0],function(){YD.render();});}catch(e){err('render',e);}};
// строка на главном: место в живой группе
YD.homeLine({pri:21,f:function(){try{if(!liveNow())return null;if(claims().length)return {ic:'🏆',t:'Итоги живой лиги — забери награду!',a:'league'};
  var rs=rows(),p=0;for(var i=0;i<rs.length;i++)if(rs[i].me)p=i+1;return {ic:'🥇',t:'Живая лига · '+tierN(lg.tier||0)+': ты '+p+'-й из '+rs.length,a:'league'};}catch(e){return null;}}});

/* ---------- ⚙: имя и удаление данных ---------- */
try{var os=window.openSettings;if(typeof os==='function')window.openSettings=function(){var r=os.apply(this,arguments);try{if(!can()||!O().on)return r;var c=document.getElementById('mcard'),row=c&&c.querySelector('.row:last-child');if(!c)return r;
  var d=document.createElement('div');d.className='vcSet';d.innerHTML='<button class="set" id="vcName"><span>🌐 Живая лига: '+(CUP.shown()?'имя показано':'имя скрыто')+'<br><small>'+(CUP.shown()?'нажми, чтобы скрыть':'показывать «Имя Ф.» вместо «Игрок NNNN»')+'</small></span></button>'+
    '<button class="set" id="vcDel"><span>🗑 Удалить мои данные турниров<br><small>во всех играх двора; лига начнётся заново</small></span></button>';
  if(row)c.insertBefore(d,row);else c.appendChild(d);
  document.getElementById('vcName').onclick=function(){var on=!CUP.shown();CUP.showName(on,function(){lg=null;cev('name',{s:on?1:0});login(function(){openSettings();},true);});};
  document.getElementById('vcDel').onclick=function(){CUP.forget(function(x){if(x){var o=O();delete o.on;delete o.jl;delete o.jw;delete o.sv;delete o.tr;lg=null;YD.save();cev('forget',{});try{toast('Данные турниров удалены');}catch(e){}}openSettings();});};}catch(e){err('set',e);}return r;};}catch(e){}

window.VCUP={can:can,live:liveNow,login:login,boot:boot,fixLocal:fixLocal,claims:claims,_lg:function(){return lg;}};
})();
