'use strict';
/* ================= ob-cup — живая лига hobby-cup в «Соседних заставах» (CUP-OB, 14.10.2026; журнал hobby-analytics/release-i/cup-oborona/CUP-OB.md) =================
   Грузится ПО ТРЕБОВАНИЮ (OB2.need из заглушки <!-- ob2:CUP --> в index.html): при открытии «Соседних застав», у живых игроков — после меню, при бое Босса/осады.
   Решение (А): при ответе сервера «Соседние заставы» = живая группа лиги (люди «Игрок NNNN» + воеводы-соседи с сервера), очки — та же Слава недели,
   лестница общая 7×4 (Деревянная 4 … Алмазная 1), награда — золото с сервера («Итоги недели», один раз на неделю). Сервер молчит → всё как v4.1 (местные воеводы).
   Модуль CUP — блок /*CUP*/
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
const LAD0={n:['Деревянная','Каменная','Медная','Бронзовая','Серебряная','Золотая','Алмазная'],ne:['Wooden','Stone','Copper','Bronze','Silver','Gold','Diamond'],s:4};
const LGC=['#9c6b3c','#8e959c','#c4703a','#cd7f32','#aab4bc','#e6b53a','#5fc4e6'];
const LGT=600e3,SLT=15*60e3;
let lg=null,off=false,tk=null,vkNm='',vkAsked=false,peo={},busy=null,claimWait=false;
const O=()=>{if(!S.o2c||typeof S.o2c!=='object')S.o2c={};return S.o2c;};
const ev=(a,p)=>{try{STAT.ev('lg',Object.assign({a:a},p||{}));}catch(e){}};
const cev=(a,p)=>{try{STAT.ev('cup',Object.assign({a:a,on:1},p||{}));}catch(e){}};
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]);
const err=(w,x)=>{err.n=(err.n||0)+1;if(err.n<=5)console.warn('ob-cup '+w+': '+(x&&x.message||x));};
// сутки МСК и неделя (с понедельника) — та же формула, что weekNo() игры по местной дате
const dnum=ms=>Math.floor(ms/864e5);
const mskD=()=>dnum(nowMs()+3*3600e3);
const locD=()=>{const d=new Date(nowMs());return dnum(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));};
const wkOf=d=>Math.floor((d+3)/7);
// местная дата = дата МСК: только тогда неделя игры = неделя сервера (иначе Славу не сдаём — она уйдёт следующей сдачей)
const dateOk=()=>mskD()===locD();

function sig(cb){if(CUP._dbg().dev)return cb('dev');
  try{if(!ysdk||(YP&&YP.getMode&&YP.getMode()==='lite'))return cb('');let done=false;const t=setTimeout(()=>{if(!done){done=true;cb('');}},8000);
    ysdk.getPlayer({signed:true}).then(p=>{if(!done){done=true;clearTimeout(t);cb(p&&p.signature||'');}},()=>{if(!done){done=true;clearTimeout(t);cb('');}});}catch(e){cb('');}}
CUP.init({g:'oborona',plat:PLAT==='vk'?'vk':'yandex',url:CUP_URL,lang:()=>LANG,name:()=>vkNm,sig:sig,
  tr0:()=>{const t=S.tour;return t&&typeof t==='object'?Math.max(0,Math.min(6,t.tr|0))*4:undefined;}});   // местная ступень застав → лига той же высоты (сервер берёт один раз)
function vkName(cb){if(PLAT!=='vk'||vkAsked||!window.vkBridge)return cb();vkAsked=true;
  vkSend('VKWebAppGetUserInfo',{},4000).then(u=>{if(u&&u.first_name)vkNm=(u.first_name+' '+(u.last_name||'')).trim();cb();},()=>cb());}

/* ---------- лестница, ступень, награда ---------- */
function lad(){return lg&&lg.lad||CUP.me()&&CUP.me().lad||LAD0;}
function tierP(i){const d=lad(),s=Math.max(1,d.s||1),n=(LANG==='en'&&d.ne?d.ne:d.n)||[],li=Math.max(0,Math.min(n.length-1,Math.floor((i||0)/s)));return {li:li,sub:s>1?s-(i||0)%s:0,nm:n[li]||''};}
function tierN(i){const t=tierP(i);return t.nm+(t.sub?' '+t.sub:'');}
function tierH(i){const t=tierP(i);return '<span style="white-space:nowrap"><span style="display:inline-block;width:.8em;height:.8em;border-radius:50%;vertical-align:-1px;margin-right:4px;box-shadow:0 0 0 1px rgba(0,0,0,.3) inset;background:'+LGC[t.li%LGC.length]+'"></span>'+esc(tierN(i))+'</span>';}
// награда сервера — в «испытаниях дня» (золото награды Испытания дня: 100 + 40·глав, ≤ 420), округляем до 5
function rwGold(k){if(!(k>0))return 0;let u=140;try{u=dchGold();}catch(e){}return Math.max(5,Math.round(k*u/5)*5);}
function wendTxt(){const s=lg&&lg.wend!=null?lg.wend-(Date.now()-lg._t)/1000:0;if(!(s>0))return tourLeftTxt();const h=Math.max(1,Math.ceil(s/3600));return h>=24?Math.floor(h/24)+Lg(' дн. ','d ')+(h%24)+Lg(' ч','h'):h+Lg(' ч','h');}
function tierSet(t,mv){const o=O();if(t>=0&&(o.tr!==t||(mv&&o.mv!==mv))){o.tr=t;if(mv)o.mv=mv;save();}}

/* ---------- живое ли сейчас ---------- */
function liveNow(){return !off&&!!lg&&!!lg.joined&&lg.lw===weekNo()&&Date.now()-lg._t<6*3600e3&&CUP.state()!=='gone';}
function joinWk(tr){const o=O(),me=CUP.me();o.on=1;const w=weekNo();if(!o.jl||typeof o.jl!=='object')o.jl={};if(!o.jl[w]){o.jl[w]=1;const ks=Object.keys(o.jl).map(Number).sort((a,b)=>b-a);ks.slice(4).forEach(k=>delete o.jl[k]);}
  if(me&&me.wk&&(o.jw||0)<me.wk){if(!o.jw)ev('in',{t:tr!=null?tr:lg&&lg.tier||0});o.jw=me.wk;}}

/* ---------- вход и лига (одна на всех ждущих) ---------- */
function login(cb,fresh){if(!fresh&&lg&&Date.now()-lg._t<LGT&&CUP.state()==='ok')return cb(lg);
  if(busy){busy.push(cb);return;}busy=[cb];
  const end=r=>{const q=busy||[];busy=null;q.forEach(f=>{try{f(r);}catch(e){err('login',e);}});};
  vkName(()=>{let done=false;const tm=setTimeout(()=>{if(!done){done=true;off=true;end(null);}},12000);
    subSl(()=>CUP.league(r=>{if(done)return;done=true;clearTimeout(tm);
      if(!r){off=true;return end(null);}
      off=false;r._t=Date.now();r.lw=weekNo();lg=r;const o=O();o.on=1;
      if(r.joined){joinWk();o.pl=r.i||0;o.n=r.n||0;tierSet(r.tier||0);}
      save();end(r);}),!(O().jl&&O().jl[weekNo()]));});}   // войти в группу этой недели — сдать Славу, даже если она не выросла

/* ---------- сдать Славу недели: в лигу идёт лучшее за неделю (= последнее). force — даже если не выросла (вход в группу) ---------- */
function slv(){return typeof slWeekPts==='function'?slWeekPts(weekNo()):0;}
function tkOk(t){return t&&t.t&&wkOf(dnum((t.got||0)+3*3600e3))===wkOf(mskD())&&Date.now()-t.got<(t.exp||0)*1000-60e3;}
function subSl(cb,force){cb=cb||function(){};if(!dateOk())return cb();const o=O(),w=weekNo(),v=slv(),sv=o.sv&&o.sv.w===w?o.sv:null;
  if(sv&&v<=sv.v&&!force)return cb();if(!force&&!sv&&!v&&!o.on)return cb();
  const go=t=>{if(!t||t.no)return cb();CUP.submit(t,v,{next:true},r=>{if(r&&r.ok){o.sv={w:w,v:Math.max(v,sv?sv.v:0),t:Date.now()};tk=r.next&&r.next.t?r.next:null;
      if(r.lg){joinWk(r.lg.tr||0);tierSet(r.lg.tr||0);}save();}cb();});};
  if(tkOk(tk)){const t=tk;tk=null;go(t);}else CUP.ticket('sl',go);}

/* ---------- таблица «Соседних застав» из живой группы (тот же вид, что tourTable: i<0 — игрок, 0–6 — воеводы-соседи, 100+ — живые люди) ---------- */
function liveRows(o){peo={};const rows=[];let j=0;
  (lg.rows||[]).forEach(r=>{if(r.me){rows.push({i:-1,pts:Math.max(r.v||0,tourPts(o)),z:r.z});return;}
    if(r.bot){let k=TOUR_NB.findIndex(b=>b.n===r.nm);if(k<0)k=0;rows.push({i:k,pts:r.v||0,z:r.z,bot:1});return;}
    const i=100+(j++);peo[i]=r;rows.push({i:i,pts:r.v||0,z:r.z});});
  if(!rows.some(r=>r.i<0))rows.push({i:-1,pts:tourPts(o)});
  return rows.sort((a,b)=>b.pts-a.pts||(a.i<0?-1:b.i<0?1:0));}
const tb0=tourTable;
tourTable=function(o,t){try{if(liveNow()&&o&&+o.w===weekNo()&&Math.abs((t||0)-nowMs())<300e3)return liveRows(o);}catch(e){err('table',e);}return tb0.apply(this,arguments);};
const nn0=tourNbName,fc0=tourFace;
tourNbName=function(i){if(i>=100){const r=peo[i];return r?CUP.nameOf(r):Lg('Воевода','Commander');}return nn0(i);};
tourFace=function(i){return i>=100?ic('tour_shield',64):fc0(i);};
// зоны: у живой группы — с сервера (▲ лучшие, ▼ последние); подписи людей — «живой воевода»
function rowsHTML(tb){const me=typeof slRank==='function'?slRank():'';return '<div class="tourt">'+tb.map((x,j)=>{const my=x.i<0,bot=x.i>=0&&x.i<100,nb=bot?TOUR_NB[x.i]:null,up=x.z==='up',dn=x.z==='down';
  return '<div class="tourr'+(my?' me':'')+'"'+(bot?' data-tnb="'+x.i+'"':'')+'><b class="tp">'+(j+1)+'</b><img src="'+(my?ic('voevoda',64):tourFace(x.i))+'" width="34" height="34" alt="">'+
    '<span class="tn"><b>'+esc(my?Lg('Ты','You')+(me?' · '+me:''):tourNbName(x.i))+'</b><small>'+(my?Lg('твоя застава','your outpost'):bot?Lg('сосед · '+nb.z,'neighbour · '+nb.ze):Lg('живой воевода','live commander'))+'</small></span>'+
    '<b class="ts">'+(!my&&!x.pts?'💤':fmtNum(x.pts))+'</b><span class="ta" style="color:'+(up?'#2f8a4a':dn?'#c0392b':'transparent')+'">'+(up?'▲':dn?'▼':'·')+'</span></div>';}).join('')+'</div>';}

/* ---------- плашка на карте ---------- */
const mb0=tourMapBtn;
tourMapBtn=function(){try{const o=tourTick();if(!o||!liveNow())return mb0.apply(this,arguments);const tb=tourTable(o,nowMs()),pl=tourPlace(tb),pts=tourPts(o),cl=claims().length;tourLast={w:o.w,pts:pts,tb:tb};
  return '<button class="glbar mtile'+(cl||!O().ask?' hot':'')+'" id="tourGo"><img src="'+ic('tour_shield',64)+'" alt=""><span class="t"><b>'+(cl?Lg('🏆 Итоги!','🏆 Results!'):pts?tourPlTxt(pl):Lg('Соседи','Neighbours'))+'</b><small>'+(cl?Lg('забрать награду','collect the reward'):esc(tierN(lg.tier||0))+' · '+wendTxt())+'</small></span></button>';}catch(e){err('map',e);return mb0.apply(this,arguments);}};
// «Сегодня»: итоги живой недели ждут
OB2.slot('today','cup',a=>{try{if(liveNow()&&claims().length)a.push({id:'cup',hot:1,t:Lg('🏆 Итоги недели','🏆 Weekly results'),fn:()=>openTour('map')});}catch(e){}},5);

/* ---------- итоги прошлых недель с сервера (к выдаче) ---------- */
function claims(){const g=O().lgw||0,src=lg&&lg.claims||CUP.me()&&CUP.me().claims||[];return src.filter(c=>c&&c.wk>g);}
function claimWin(c,back){const o=O(),got=c.wk<=(o.lgw||0),gold=got?0:rwGold(c.rw),up=c.res==='up',dn=c.res==='down',top=c.res==='top',pl=c.pl|0;
  if(!got&&(o.sw||0)<c.wk){o.sw=c.wk;save();ev('wk',{f:c.tr,t:c.to,p:pl,o:c.pts||0,r:gold,h:c.nh||0,m:c.res});}
  tierSet(c.to,c.res);
  const li0=Math.floor((c.tr||0)/4),li1=Math.floor((c.to||0)/4),bnId=li1>li0&&li1>=1&&li1<=6&&typeof xbnOwn==='function'&&!xbnOwn('lg'+li1)?'lg'+li1:'';
  const bn=bnId&&typeof XBN!=='undefined'?XBN.find(b=>b.id===bnId):null;
  const h=pl===1?Lg('🏆 Первая застава группы!','🏆 First outpost of the group!'):pl===2?Lg('🥈 Второе место в группе!','🥈 Second in the group!'):pl===3?Lg('🥉 Третье место в группе!','🥉 Third in the group!'):Lg('🛡 Итоги недели','🛡 Weekly results');
  const t=up?Lg('Живые соседи признали: твоя застава — из лучших! Поднимаемся выше.','The live neighbours agree: your outpost is among the best! Moving up.'):top?Lg('Выше лиги нет — держим вершину!','There is no higher league — hold the top!'):
    dn?Lg('Неделя не задалась — опускаемся на ступень. Ничего, отыграемся!','A rough week — we drop a step. We’ll win it back!'):Lg('Держим ступень. На этой неделе — выше!','We hold our step. This week — higher!');
  showModal('<h3>'+h+'</h3><div class="say"><img src="'+ic('voevoda')+'" alt=""><div>'+t+'</div></div>'+
    '<p class="sub" style="text-align:center">'+Lg('Живая лига, прошлая неделя: ','Live league, last week: ')+'<b>'+tourPlTxt(pl)+'</b>'+Lg(' в группе',' in the group')+(c.nh?Lg(' (живых — ',' (live: ')+c.nh+')':'')+' · '+fmtNum(c.pts||0)+Lg(' Славы',' Fame')+'</p>'+
    '<p class="sub" style="text-align:center">'+(up?Lg('▲ Ступень выше: ','▲ Up a step: ')+tierH(c.tr)+' → <b>'+tierH(c.to)+'</b>':dn?Lg('▼ Ступень ниже: ','▼ Down a step: ')+tierH(c.tr)+' → '+tierH(c.to):Lg('Ступень: ','Step: ')+tierH(c.to))+'</p>'+
    (gold?'<div class="card treasury" style="text-align:center"><b>+'+fmtGold(gold)+'</b><br><span style="font-size:13px">'+Lg('Награда за неделю: чем выше лига — тем больше; за подъём ×1,5, за спуск ×0,5','Weekly reward: the higher the league, the more; ×1.5 for moving up, ×0.5 for moving down')+'</span></div>':'')+
    (bn&&!got?'<div class="card" style="text-align:center"><img src="'+xbnURL(bn,96)+'" width="72" height="72" alt=""><br><b>'+xbnName(bn)+'</b><br><span class="note">'+Lg('За выход в лигу «'+tierP(c.to).nm+'» — твоё навсегда.','For reaching the “'+tierP(c.to).nm+'” league — yours forever.')+'</span></div>':'')+
    '<div class="btns"><button class="btn big" id="cupTake">'+(gold?Lg('💰 Забрать','💰 Collect'):Lg('Хорошо','OK'))+'</button></div>','tour');
  if(up||top){try{SND.up();}catch(e){}}
  on('cupTake',()=>{const o=O();if(c.wk>(o.lgw||0)){o.lgw=c.wk;const n=rwGold(c.rw);if(n){S.gold+=n;ern('quest',n);}
      if(bnId&&typeof xbnGive==='function')xbnGive(bnId);
      const tt=tourTick();if(tt&&pl>=1&&pl<=3){tt.g=tt.g&&typeof tt.g==='object'?tt.g:{};tt.g[pl]=(+tt.g[pl]||0)+1;tt.pz=(tt.pz|0)+1;
        if(tt.pz>=TOUR.plate&&typeof xbnOwn==='function'&&!xbnOwn('sosed'))xbnGive('sosed');}
      ev('take',{t:c.to,r:n});cev('claim',{pl:pl,g:n});save();setPills();try{SND.coin();}catch(e){}}
    CUP.claim(c.wk);if(lg&&lg.claims)lg.claims=lg.claims.filter(x=>x.wk!==c.wk);
    if(back==='none'){hideModal();metaRe();}else if(typeof back==='function')back();else liveOpen(null,back);});}
// при входе: был в живой группе, награда не забрана — тихо спросить сервер и показать, когда окно свободно
function boot(){const o=O();if(!o.on&&!(o.jw>(o.lgw||0))&&!(typeof tourCanJoin==='function'&&tourCanJoin()))return;   // OB-FIX п.5: вход в живую группу сам, после меню (имя скрыто по умолчанию; знакомство — при первом открытии окна)
  login(r=>{if(!r)return;try{if(typeof metaRe==='function')metaRe();}catch(e){}
    try{if(O().tr!=null&&!boot.s){boot.s=1;ev('ses',{t:O().tr,m:O().mv||''});}}catch(e){}
    const cl=claims();if(!cl.length||claimWait)return;claimWait=true;let n=0;
    const tm=setInterval(()=>{if(++n>240){clearInterval(tm);claimWait=false;return;}if((typeof G!=='undefined'&&G)||$('modal').classList.contains('on'))return;clearInterval(tm);claimWait=false;
      const c=claims()[0];if(c)claimWin(c,'none');},1000);});}

/* ---------- окно «Соседние заставы» вживую ---------- */
function intro(next){const o=O(),me=CUP.me()||{},sh=CUP.shown(),old=S.tour&&S.tour.tr?TOUR_TIERS[Math.min(6,S.tour.tr|0)]:null;
  showModal('<h3>'+Lg('🌐 Соседи ожили!','🌐 The neighbours came alive!')+'</h3><div class="say"><img src="'+ic('voevoda')+'" alt=""><div>'+
    Lg('Теперь в «Соседних заставах» — живые воеводы со всей Руси! Твоя застава в группе до 30 игроков, очки — та же Слава недели. Пока людей мало, подмогу шлют соседи-персонажи.',
       'The “Neighbouring Outposts” now have live commanders from all over Rus! Your outpost is in a group of up to 30 players, points are the same weekly Fame. While there are few people, fairy-tale neighbours help out.')+'</div></div>'+
    (old&&lg?'<p class="sub" style="text-align:center">'+Lg('Твоя ступень «'+old.n+'» стала лигой ','Your “'+old.en+'” tier became the league ')+tierH(lg.tier||0)+'</p>':'')+
    '<p class="sub">'+Lg('В таблицах ты — <b>«Игрок '+(me.tg||'NNNN')+'»</b>: имя скрыто. Показать имя («Имя Ф.») можно сейчас или потом в ⚙. Удалить свои данные турниров — тоже в ⚙.',
       'On the boards you are <b>“Player '+(me.tg||'NNNN')+'”</b>: your name is hidden. You can show your name now or later in ⚙. Deleting your contest data is in ⚙ too.')+'</p>'+
    '<div class="btns"><button class="btn big" id="cupI0">'+(sh?Lg('Оставить имя','Keep my name'):Lg('Без имени — в бой!','No name — to battle!'))+'</button><button class="btn ghost" id="cupI1">'+(sh?Lg('Скрыть имя','Hide my name'):Lg('Показывать моё имя','Show my name'))+'</button></div>','tour');
  let did=0;const fin=x=>{if(did)return;did=1;o.ask=1;save();cev('intro',{n:x});next();}; // FX-GV 24.10: второе нажатие (пока «Показывать имя» ждёт сервер) — не открывать окно дважды
  on('cupI0',()=>fin(sh?1:0));on('cupI1',()=>{CUP.showName(!sh,()=>{lg=null;login(()=>fin(sh?0:1),true);});});}
function liveOpen(ot,back,from){const o=tourTick();if(!o)return;
  if(claims().length){claimWin(claims()[0],back);return;}
  if(!O().ask){intro(()=>liveOpen(ot,back,from));return;}
  // FX-GV 24.10 (сбой VK Android 18.10, ob-cup.js:316 «Cannot read properties» lg.n): лиги ещё нет (lg=null — «Показывать имя» перезаходит) — дождаться входа
  if(!lg){login(x=>{if(x&&x.joined)liveOpen(ot,back,from);else if(typeof ot==='function')ot(from,back);});return;}
  const tb=tourTable(o,nowMs()),pl=tourPlace(tb),pts=tourPts(o),hum=(lg.n|0),k=lg.rwd&&lg.rwd.k?lg.rwd.k[Math.max(0,Math.min(lg.rwd.k.length-1,lg.tier||0))]:0,z=lg.rwd&&lg.rwd.z||{};
  STAT.screen('tour');cev('view',{f:from||'',pl:pl,pts:pts,n:hum});
  const lead=tb[0].i<0?tb[1]:tb[0],nm=lead?tourNbName(lead.i):'';
  const say=!pts?Lg('Новая неделя! Живые соседи уже на стенах — самое время начать.','A new week! The live neighbours are already on the walls — a good time to start.'):
    pl===1?Lg('Ты впереди всей группы! Живые воеводы шлют гонцов — спрашивают, как ты так.','You lead the whole group! Live commanders send messengers asking how you do it.'):
    pl<=3?Lg('Почти! '+esc(nm)+' впереди — неделя длинная, догоним.','Almost! '+esc(nm)+' is ahead — the week is long, we’ll catch up.'):
    Lg('Не спеши: соседи тоже не каждый день воюют. Пара побед — и подвинем их.','No rush: the neighbours don’t fight every day either. A couple of wins — and we’ll move them.');
  const g=o.g||{},gr=['1','2','3'].filter(x=>+g[x]).map(x=>['🥇','🥈','🥉'][x-1]+'×'+g[x]).join(' '),wb=typeof tourWkBest==='function'?tourWkBest():'';
  const h='<h3>'+Lg('🛡 Соседние заставы','🛡 Neighbouring Outposts')+'</h3><p class="sub" style="text-align:center;margin:0 0 4px">'+Lg('Лига: ','League: ')+'<b>'+tierH(lg.tier||0)+'</b> · '+Lg('до итогов ','results in ')+wendTxt()+(gr?' · '+gr:'')+'</p>'+
    '<div class="say" data-fit="2"><img src="'+ic('voevoda')+'" alt=""><div>'+say+'</div></div>'+rowsHTML(tb)+
    (k?'<p class="goal" style="text-align:center;margin:6px 0">💰 '+Lg('Награда за неделю на этой ступени: ','Weekly reward at this step: ')+'<b>'+fmtGold(rwGold(k))+'</b>'+(lg.up?' · ▲ '+fmtNum(rwGold(k*(z.up||1.5))):'')+(lg.down?' · ▼ '+fmtNum(rwGold(k*(z.down||.5))):'')+'</p>':'')+
    '<p class="sub" data-fit="1">'+Lg('Очки — Слава недели: бои, осада, испытание дня, задания, Босс недели, заказы (до 400 в день). В понедельник итоги: ▲ лучшие — ступенью выше, ▼ последние — ниже; награда — золото. ',
      'Points are this week’s Fame: battles, the siege, the daily challenge, quests, the Boss of the Week, orders (up to 400 a day). Results on Monday: ▲ the best move up a step, ▼ the last move down; the reward is gold. ')+
    '<i>'+Lg('«Сосед» — персонаж сказки, остальные — живые игроки.','“Neighbour” means a fairy-tale character; the rest are live players.')+'</i></p>'+
    '<div class="card"><div class="row"><img class="ic" src="'+ic(CH[weekCh()].boss)+'" alt=""><div class="t"><b>'+Lg('⚔ Лучший бой с Боссом недели','⚔ Best Boss of the Week battle')+'</b><span>'+(wb||Lg('ещё не сражался','not fought yet'))+'</span></div>'+
      (S.stars['0-5']?'<button class="btn" id="tourWk">'+Lg('В бой','Fight')+'</button>':'')+'</div><div id="tourLive">'+
      '<p class="sub" style="margin:6px 0 0"><span id="cupTb1" style="cursor:pointer;text-decoration:underline dotted">'+Lg('⚔ Босс недели — все воеводы','⚔ Boss of the Week — all commanders')+' ›</span><br>'+
      '<span id="cupTb2" style="cursor:pointer;text-decoration:underline dotted">'+Lg('🏰 Осада — рекорды','🏰 Siege — records')+' ›</span><br>'+
      '<span id="cupTb3" style="cursor:pointer;text-decoration:underline dotted">'+Lg('🛡 Слава недели — вся твоя ступень','🛡 Weekly Fame — your whole step')+' ›</span></p></div></div>'+
    '<div class="btns"><button class="btn big" id="tourOk">'+(back?Lg('Назад','Back'):Lg('Хорошо','OK'))+'</button></div>';
  showModal(h,'tour');
  for(const r of $('mBody').querySelectorAll('[data-tnb]'))r.onclick=()=>{const b=TOUR_NB[+r.dataset.tnb];SND.click();toast(tourNbName(+r.dataset.tnb)+': '+Lg(b.t,b.te));};
  const me=()=>liveOpen(ot,back,from);
  on('tourOk',()=>{if(back)back();else{hideModal();metaRe();}});on('tourWk',()=>{if(typeof startWeekly==='function'){if(back&&typeof G!=='undefined'&&G)toMenu('Siege');startWeekly();}});
  on('cupTb1',()=>top('boss','w',me));on('cupTb2',()=>top('endless','w',me));on('cupTb3',()=>top('sl','w@t',me));}
// таблица сервера: Босс недели (все), осада (неделя / всё время), Слава недели своей ступени
function top(mode,per,back){cev('top',{m:mode,p:per});const T={boss:Lg('⚔ Босс недели — все воеводы','⚔ Boss of the Week — all commanders'),endless:Lg('🏰 Осада — рекорды','🏰 Siege — records'),sl:Lg('🛡 Слава недели — ','🛡 Weekly Fame — ')+tierN(lg&&lg.tier||0)};
  const fv=v=>mode==='boss'?fmtWeek(v):mode==='endless'?v+Lg(' волн',' waves'):fmtNum(v);
  showModal('<h3>'+esc(T[mode])+'</h3>'+(mode==='endless'?'<div class="seg"><button data-cp="w" class="'+(per==='w'?'on':'')+'">'+Lg('Неделя','Week')+'</button><button data-cp="a" class="'+(per==='a'?'on':'')+'">'+Lg('Всё время','All time')+'</button></div>':'')+
    '<p class="sub" id="cupTl">'+Lg('Загружаем…','Loading…')+'</p><div class="tourt" id="cupTt"></div><div class="btns"><button class="btn big" id="cupTb">'+Lg('Назад','Back')+'</button></div>','tour');
  for(const b of $('mBody').querySelectorAll('[data-cp]'))b.onclick=()=>{SND.click();top(mode,b.dataset.cp,back);};
  on('cupTb',back);
  CUP.top(mode,per,r=>{const box=$('cupTt'),l=$('cupTl');if(!box||!l)return;if(!r){l.textContent=Lg('Общая таблица сейчас отдыхает — загляни попозже.','The shared board is resting — try later.');return;}
    const rows=(r.top||[]).concat(r.me&&r.me.i>(r.top||[]).length?(r.around||[]):[]);
    l.textContent=rows.length?(mode==='boss'?Lg('Лучший бой недели у каждого воеводы.','Each commander’s best battle this week.'):mode==='sl'?Lg('Все воеводы твоей ступени, не только группа.','All commanders of your step, not just your group.'):Lg('Больше волн — выше.','More waves — higher.')):Lg('Пока пусто — будь первым!','Empty so far — be the first!');
    box.innerHTML=rows.map(o=>'<div class="tourr'+(o.me?' me':'')+'"><b class="tp">'+o.i+'</b><span class="tn"><b>'+esc(o.me?Lg('Ты','You'):CUP.nameOf(o))+'</b></span><b class="ts">'+esc(fv(o.v))+'</b></div>').join('');if(typeof fitModal==='function')fitModal();});}

/* ---------- бои: Босс недели и осада — путёвка в начале боя, результат в конце (в лигу не идут, только таблицы) ---------- */
function runMode(g){return g&&g.wk?'boss':g&&g.endless&&!g.dly&&!g.rule&&!g.week?'endless':'';}
function onRun(g){const m=runMode(g);if(!m||!O().on||off)return;g.cupT=[];g.cupN=0;
  const n=m==='endless'?2:1;for(let i=0;i<n;i++)CUP.ticket(m,t=>{if(t&&t.t&&!t.no)g.cupT.push(t);});}   // вторая путёвка осады — на «ещё попытку» (тот же забег)
function onEnd(g,win){const m=runMode(g);
  if(m&&g.cupT&&g.cupT.length){const t=g.cupT.shift();setTimeout(()=>{const v=m==='boss'?(typeof wkMine==='function'?wkMine().best:0):Math.max(0,g.wave-1);
    if(!(v>0))return;CUP.submit(t,v,{},r=>{if(!r||!r.ok)return;const mb=$('mBody');if(!mb||$('cupRes')||!$('modal').classList.contains('on'))return;
      const p=document.createElement('p');p.className='sub';p.id='cupRes';p.style.cssText='text-align:center;margin:4px 0;cursor:pointer;text-decoration:underline dotted';
      p.textContent='📡 '+Lg('Общая таблица: ','Shared board: ')+(r.rank>0?(r.approx?Lg('примерно ','about '):'')+tourPlTxt(r.rank):Lg('записано','saved'))+' ›';
      const bt=mb.querySelector('.btns');if(bt)mb.insertBefore(p,bt);else mb.appendChild(p);p.onclick=()=>{SND.click();top(m,'w',()=>{hideModal();toMenu('Siege');});};});},0);}
  // Слава недели — не чаще раза в 15 минут после боя (и при открытии окна застав)
  const o=O();if(o.on&&!off&&dateOk()&&(!o.sv||Date.now()-(o.sv.t||0)>SLT))setTimeout(()=>subSl(()=>{if(lg)lg._t=0;}),1500);}

/* ---------- ⚙: показ имени, удаление данных ---------- */
function setRow(){const mb=$('mBody');if(!mb||$('cupSN')||!$('sOk'))return;const bt=mb.querySelector('.btns');if(!bt)return;const sh=CUP.shown(),tg=CUP.me()&&CUP.me().tg;
  const d=document.createElement('div');d.id='cupSet';
  d.innerHTML='<div class="tg" style="border:0;padding-bottom:0">'+Lg('👤 Показывать моё имя','👤 Show my name')+' <button class="btn '+(sh?'green':'ghost')+'" id="cupSN">'+(sh?Lg('Вкл','On'):Lg('Выкл','Off'))+'</button></div>'+
    '<p class="sub" style="margin:2px 0 6px;font-size:14px">'+Lg('в «Соседних заставах» и общих таблицах: «Имя Ф.» вместо «Игрок '+(tg||'NNNN')+'»','in the Neighbouring Outposts and shared boards: your name instead of “Player '+(tg||'NNNN')+'”')+'</p>'+
    '<button class="btn ghost" id="cupSD" style="width:100%;justify-content:center">'+Lg('🗑 Удалить мои данные турниров','🗑 Delete my contest data')+'</button><p class="sub" id="cupSM" style="font-size:14px;margin:4px 0"></p>';
  mb.insertBefore(d,bt);if(typeof fitModal==='function')fitModal();
  on('cupSN',()=>{const v=!CUP.shown();cev('name',{v:v?1:0});const b=$('cupSN');if(b){b.textContent=v?Lg('Вкл','On'):Lg('Выкл','Off');b.className='btn '+(v?'green':'ghost');}
    vkName(()=>CUP.showName(v,()=>{lg=lg&&Object.assign(lg,{_t:0});}));});
  const del=$('cupSD');if(del)del.onclick=()=>{SND.click();const m=$('cupSM');if(!del.dataset.sure){del.dataset.sure='1';m.textContent=Lg('Нажми ещё раз — результаты, место в лиге и таблицах будут удалены с сервера во всех играх. Золото, Слава и прогресс в игре останутся.','Tap again to delete your scores, league and board places from the server in all games. Gold, Fame and progress stay.');return;}
    m.textContent=Lg('Удаляем…','Deleting…');CUP.forget(x=>{del.dataset.sure='';const mm=$('cupSM');
      if(x){const o=O();['on','ask','jw','sv','pl','n','tr','mv','jl'].forEach(k=>delete o[k]);lg=null;tk=null;save();cev('forget',{});}
      if(mm)mm.textContent=x?Lg('Готово: данные турниров удалены.','Done: your contest data is deleted.'):Lg('Сервер сейчас не отвечает — попробуй позже.','The server is not responding — try again later.');});};}

/* ---------- для заглушки ---------- */
window.CUPX={
  // открыть «Соседние заставы»: живые — если сервер ответит; пока ждём — окно-заготовка; не ответил — местное окно (как v4.1)
  open(ot,from,back,up){const fresh=lg&&Date.now()-lg._t<LGT&&!off;
    if(fresh&&lg.joined){liveOpen(ot,back,from);return;}
    if(!O().on){const r=up?null:ot(from,back);let mine=true;const m=$('mBody');
      login(x=>{if(!x||!x.joined||!mine)return;const mb=$('mBody');if(mb&&mb.getAttribute('data-w')==='tour'&&$('modal').classList.contains('on')&&$('tourOk'))liveOpen(ot,back,from);});
      setTimeout(()=>{mine=!!(m&&m.getAttribute('data-w')==='tour');},0);return r;}
    showModal('<h3>'+Lg('🛡 Соседние заставы','🛡 Neighbouring Outposts')+'</h3><p class="sub" style="text-align:center">'+Lg('Собираем соседей…','Gathering the neighbours…')+'</p><div class="btns"><button class="btn big" id="tourOk">'+(back?Lg('Назад','Back'):Lg('Хорошо','OK'))+'</button></div>','tour');
    let gone=false;on('tourOk',()=>{gone=true;if(back)back();else hideModal();});
    login(x=>{if(gone)return;const mb=$('mBody');if(!mb||mb.getAttribute('data-w')!=='tour'||!$('modal').classList.contains('on'))return;
      if(x&&x.joined)liveOpen(ot,back,from);else ot(from,back);});},
  boot:boot,run:onRun,end:onEnd,set:setRow,live:liveNow,
  _dbg:()=>({lg:lg,off:off,tk:tk,o:O(),cup:CUP._dbg()}),
  _reset:()=>{lg=null;off=false;tk=null;}};
})();
