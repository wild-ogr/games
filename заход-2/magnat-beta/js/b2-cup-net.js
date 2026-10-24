/* b2-cup-net.js — CUP «Магнат 2.0»: сеть живой лиги. Грузится по требованию (B2.need) из js/b2-cup.js, только когда лига доступна (VK/Яндекс, не мак).
   Блок между метками CUP — БАЙТ-В-БАЙТ копия общего модуля ~/Projects/hobby-analytics/online/cup.js (правки только там; обновить — заменить блок целиком).
   Ниже — CUPM: вход (имя VK — только если игрок включил «показывать имя»), сдача очков роста (путёвка «grow» с главой игрока l), лига, итоги недели и призы
   (💎 по месту — договор ECO cup.p1/p2/p3/top10, кубок места 1–3 на полку, рамка за первый выход в Бронзовую/Серебряную/Золотую/Алмазную лигу).
   В jsc (симуляторы) файл ничего не делает. */
if(typeof window!=='undefined'&&typeof document!=='undefined'){
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

window.CUPM=(function(){'use strict';
const X=B2.cup,C=()=>B2.s('c'),Lx=(r,e)=>L(r,e),now=()=>{try{return nowMs();}catch(e){return Date.now();}};
let lg=null,busy=null,tk=null,vkNm='',vkAsked=false,inited=false;
function sv(){try{save();}catch(e){}}
function refresh(){try{if(window.UI&&UI.refresh)UI.refresh();}catch(e){}}
function sig(cb){if(CUP._dbg().dev)return cb('dev');
  try{if(!ysdk)return cb('');let done=false;const t=setTimeout(()=>{if(!done){done=true;cb('');}},8000);
    ysdk.getPlayer({signed:true}).then(p=>{if(!done){done=true;clearTimeout(t);cb(p&&p.signature||'');}},()=>{if(!done){done=true;clearTimeout(t);cb('');}});}catch(e){cb('');}}
function init(){if(inited)return;inited=true;
  CUP.init({g:'magnat',plat:PLAT==='vk'?'vk':'yandex',url:X.URL,lang:()=>LANG,name:()=>vkNm,sig:sig});}
// имя из VK спрашиваем, только если игрок сам включил показ имени (по умолчанию «Игрок 4821» — политика 13.10)
function vkName(cb){if(PLAT!=='vk'||vkAsked||!window.vkBridge||!CUP.shown())return cb();vkAsked=true;
  vkSend('VKWebAppGetUserInfo',{},4000).then(u=>{if(u&&u.first_name)vkNm=(u.first_name+' '+(u.last_name||'')).trim();cb();},()=>cb());}
const wkNo=()=>X.week();
function tkOk(t){return t&&t.t&&t.w===wkNo()&&t.ch===chNow()&&Date.now()-t.got<(t.exp||0)*1000-60e3;}
function chNow(){return X.chOf(GAME.W);}
// сдать очки роста недели (в лигу идёт лучшее = последнее). force — даже если не выросли (вход в группу этой недели)
function sub(cb,force){cb=cb||function(){};init();X.sample();const c=C(),w=wkNo(),v=X.pts(),s0=c.sv&&c.sv.w===w?c.sv.v:-1;
  if(!force&&v<=s0)return cb();
  const go=t=>{if(!t||t.no||!t.t)return cb();CUP.submit(t,v,{next:true},r=>{
    if(r&&r.ok){c.sv={w:w,v:Math.max(v,s0)};c.st=now();const n=r.next&&r.next.t?r.next:null;tk=n?Object.assign(n,{w:w,ch:t.ch}):null;
      if(r.lg){join(r.lg.tr|0);}sv();}cb(r);});};
  if(tkOk(tk)){const t=tk;tk=null;go(t);}else{const ch=chNow();CUP.ticket('grow',t=>{if(t){t.w=w;t.ch=ch;t.got=t.got||Date.now();}go(t);},{l:ch});}}
function join(tr){const c=C();c.on=1;c.tr=tr;if((c.jw|0)<wkNo()){if(!c.jw)B2.ev('cup','in',{t:tr});c.jw=wkNo();}}
// вход: сдать (войти в группу этой недели) + таблица группы. Одна на всех ждущих
function login(cb,fresh){cb=cb||function(){};if(!fresh&&lg&&Date.now()-lg._t<60e3&&CUP.state()==='ok')return cb(lg);
  if(busy){busy.push(cb);return;}busy=[cb];init();
  const end=r=>{const q=busy||[];busy=null;q.forEach(f=>{try{f(r);}catch(e){}});};
  vkName(()=>{let done=false;const tm=setTimeout(()=>{if(!done){done=true;end(null);}},15000);
    sub(()=>CUP.league(r=>{if(done)return;done=true;clearTimeout(tm);if(!r)return end(null);
      r._t=Date.now();lg=r;const c=C();if(r.joined){join(r.tr|0);c.pl=r.i|0;c.n=(r.rows||[]).length;}else if(r.tier!=null)c.tr=r.tier;
      sv();refresh();end(r);}),!(C().jw===wkNo()));});}
function claims(){const g=C().lgw|0,src=lg&&lg.claims||CUP.me()&&CUP.me().claims||[];return src.filter(x=>x&&x.wk>g).sort((a,b)=>a.wk-b.wk);}
function wkStr(wk){return Math.floor(wk/100)+'-W'+('0'+(wk%100)).slice(-2);}
// призы одной недели: один раз на номер недели (S.b2c.lgw), потом отметка на сервере (claim)
function prize(x){const c=C();if(!x||x.wk<=(c.lgw|0))return null;c.lgw=x.wk;if(x.res==='up')c.up=(c.up|0)+1;if((x.pl|0)===1)c.win=(c.win|0)+1;   /* b2-merge: для миссий VK cu_up/cu_win */
  const pl=x.pl|0,o={pl:pl,res:x.res,tr:x.tr|0,to:x.to|0,cr:0,cup:0,fr:null};
  const key=pl===1?'cup.p1':pl===2?'cup.p2':pl===3?'cup.p3':pl>0&&pl<=10?'cup.top10':'';
  if(key&&B2.eco&&B2.eco.give)o.cr=B2.eco.give(key)|0;
  if(pl>=1&&pl<=3&&GAME.wallAdd&&GAME.wallAdd('cup_lg_'+wkStr(x.wk),{w:4-pl,pl:pl,tr:o.tr}))o.cup=4-pl;
  const li=Math.floor(o.to/4);if(!c.fr||typeof c.fr!=='object')c.fr={};
  for(const f of X.FRS)if(li>=f.li&&!c.fr[f.li]){c.fr[f.li]=1;try{GAME.cosGive(f.id);}catch(e){}o.fr=f;}
  B2.ev('cup','wk',{res:x.res,pl:pl,t:o.tr,c:o.cr});return o;}
function take(cb){const got=[];for(const x of claims()){const o=prize(x);if(o){got.push(o);CUP.claim(x.wk);}}sv();
  if(got.length){const o=got[got.length-1],cr=got.reduce((a,b)=>a+b.cr,0);B2.ev('cup','take',{n:got.length,c:cr});
    try{toast('🏆 '+Lx('Лига: ','League: ')+(o.pl?o.pl+Lx('-е место','th place'):'')+(cr?' · +'+cr+' 💎':'')+(o.cup?' · '+Lx('кубок на полке','cup on the shelf'):'')+(o.fr?' · '+Lx(o.fr.ru,o.fr.en):''));}catch(e){}
    try{if(window.UI&&UI.hdr)UI.hdr();}catch(e){}}
  refresh();if(cb)cb(got);return got;}
function open(tab){B2.need('b2-cup-ui.js').then(()=>{if(window.CUPUI)CUPUI.open(tab);}).catch(()=>{});}
return {init,login,sub,claims,take,prize,open,lg:()=>lg,_set:r=>{lg=r;},wkStr};
})();
}
