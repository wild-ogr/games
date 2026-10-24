/* ================= zb2-cup-x — модуль hobby-cup (блок CUP — из hobby-analytics/online/cup.js, cup-sync.sh) + живой подъезд Соседок =================
   Грузит js/zb2-cup.js (ZBCUP.load) после первого Дома, только VK (не ОК) и Яндекс, с 10-го уровня. Договор ядра — online/CORE-API.md, адаптер — online/games/zina.py.
   Что делает: тихо входит в группу лиги этой недели (сдаёт очки недели Соседок — те же, что в офлайн-таблице: буква = 1, задание дня = +45),
   после побед досдаёт рост (не чаще раза в 2 мин), в окне Соседок — строка «🌐 Живой подъезд» → окно группы (люди + соседки сервера, «Игрок 4821» —
   имя скрыто, пока игрок сам не включит в ⚙), итоги недели с сервера — окно с монетами (один раз на неделю), ⚙ — показ имени и «удалить мои данные».
   STAT: lg {a: in|ses|open|wk|take|sub}, как у Обороны/Рыбалки (сравнимо в ONLINE). */
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
var CUP_URL='https://functions.yandexcloud.net/d4e5nfg9u466prmmiooj'; // функция hobby-cup (облако Яндекса). Без zina в CUP_LIVE сервер отвечает «игра не подключена» → всё молчит
var ZC=window.ZBCUP;if(!ZC||typeof CUP==='undefined')return;
var LAD0={n:['Деревянная','Каменная','Медная','Бронзовая','Серебряная','Золотая','Алмазная'],s:4},LGC=['#9c6b3c','#8e959c','#c4703a','#cd7f32','#aab4bc','#e6b53a','#5fc4e6'];
var LGT=600e3,SUBGAP=120e3;
var lg=null,off=false,tk=null,vkNm='',vkAsked=false,busy=null,claimWait=false,subT=0,subTm=0;
function $$(id){return document.getElementById(id);}
function O(){if(!S.z2u||typeof S.z2u!=='object')S.z2u={on:0,jw:0,lgw:0,sv:0,svw:0,tr:0,sw:0};return S.z2u;}
function ev(a,p){try{var o={a:a};for(var k in p||{})o[k]=p[k];STAT.ev('lg',o);}catch(e){}}
function esc(t){return String(t==null?'':t).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
function err(w,x){err.n=(err.n||0)+1;if(err.n<=5)try{console.warn('zb2-cup '+w+': '+(x&&x.message||x));}catch(e){}}
// сутки МСК и неделя сервера (с понедельника); местная дата должна совпасть с МСК — иначе неделя Соседок ≠ неделя сервера, очки не сдаём
function dnum(ms){return Math.floor(ms/864e5);}
function mskD(){return dnum(nowMs()+3*3600e3);}
function locD(){var d=new Date(nowMs());return dnum(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));}
function wkOf(d){return Math.floor((d+3)/7);}
function weekNo(){return wkOf(mskD());}
function dateOk(){return mskD()===locD();}

function sig(cb){if(CUP._dbg().dev)return cb('dev');
  try{if(typeof ysdk==='undefined'||!ysdk||typeof ypAuth!=='function'||!ypAuth())return cb('');var done=false,t=setTimeout(function(){if(!done){done=true;cb('');}},8000);
    ysdk.getPlayer({signed:true}).then(function(p){if(!done){done=true;clearTimeout(t);cb(p&&p.signature||'');}},function(){if(!done){done=true;clearTimeout(t);cb('');}});}catch(e){cb('');}}
CUP.init({g:'zina',plat:PLAT==='vk'?'vk':'yandex',url:CUP_URL,lang:'ru',name:function(){return vkNm;},sig:sig});
function vkName(cb){if(PLAT!=='vk'||vkAsked||typeof vkSend!=='function')return cb();vkAsked=true;
  vkSend('VKWebAppGetUserInfo',{},4000).then(function(u){if(u&&u.first_name)vkNm=(u.first_name+' '+(u.last_name||'')).trim();cb();},function(){cb();});}
// Яндекс: живая лига — только вошедшему игроку (правило Яндекса: вход не требуем, без входа онлайна просто нет)
function platOk(){if(PLAT==='vk')return typeof OK==='undefined'||!OK;return typeof ypAuth==='function'&&ypAuth();}

/* ---------- лестница ---------- */
function lad(){return lg&&lg.lad||CUP.me()&&CUP.me().lad||LAD0;}
function tierP(i){var d=lad(),s=Math.max(1,d.s||1),n=d.n||[],li=Math.max(0,Math.min(n.length-1,Math.floor((i||0)/s)));return {li:li,sub:s>1?s-(i||0)%s:0,nm:n[li]||''};}
function tierN(i){var t=tierP(i);return t.nm+(t.sub?' '+t.sub:'');}
function tierH(i){var t=tierP(i);return '<span class="zu-tr"><i style="background:'+LGC[t.li%LGC.length]+'"></i>'+esc(tierN(i))+'</span>';}
function wendTxt(){var s=lg&&lg.wend!=null?lg.wend-(Date.now()-lg._t)/1000:0;if(!(s>0))return '';var h=Math.max(1,Math.ceil(s/3600));
  return h>=24?Math.floor(h/24)+' дн. '+(h%24)+' ч':h+' ч';}
function liveNow(){return !off&&!!lg&&!!lg.joined&&lg.lw===weekNo()&&Date.now()-lg._t<6*3600e3&&CUP.state()!=='gone';}

/* ---------- очки недели Соседок ---------- */
function pts(){try{var o=typeof sosTick==='function'?sosTick():null;return o&&+o.w===sosWeek()?Math.max(0,Math.min(42000,sosPts(o)|0)):0;}catch(e){return 0;}}
function tkOk(t){return t&&t.t&&wkOf(dnum((t.got||0)+3*3600e3))===weekNo()&&Date.now()-t.got<(t.exp||0)*1000-60e3;}
// сдать очки недели: в лигу идёт лучшее за неделю (= последнее). force — даже если не выросли (вход в группу недели)
function sub(cb,force){cb=cb||function(){};if(!dateOk())return cb();var o=O(),w=weekNo(),v=pts(),sv=o.svw===w?+o.sv||0:-1;
  if(sv>=0&&v<=sv&&!force)return cb();
  var go=function(t){if(!t||t.no)return cb();CUP.submit(t,v,{next:true},function(r){if(r&&r.ok){o.sv=Math.max(v,sv);o.svw=w;tk=r.next&&r.next.t?r.next:null;subT=Date.now();
      if(r.lg){join(r.lg.tr||0);o.tr=r.lg.tr||0;}save();}cb(r);});};
  if(tkOk(tk)){var t=tk;tk=null;go(t);}else CUP.ticket('sp',go);}
function join(tr){var o=O();o.on=1;var w=weekNo();if((o.jw||0)<w){ev('in',{t:tr!=null?tr:lg&&lg.tier||0,f:o.jw?'':'1'});o.jw=w;}}

/* ---------- вход и группа (одна на всех ждущих) ---------- */
function login(cb,fresh){if(!platOk())return cb(null);if(!fresh&&lg&&Date.now()-lg._t<LGT&&CUP.state()==='ok')return cb(lg);
  if(busy){busy.push(cb);return;}busy=[cb];
  var end=function(r){var q=busy||[];busy=null;q.forEach(function(f){try{f(r);}catch(e){err('login',e);}});};
  vkName(function(){var done=false,tm=setTimeout(function(){if(!done){done=true;off=true;end(null);}},12000);
    sub(function(){CUP.league(function(r){if(done)return;done=true;clearTimeout(tm);
      if(!r){off=true;return end(null);}
      off=false;r._t=Date.now();r.lw=weekNo();lg=r;var o=O();
      if(r.joined){join(r.tier||0);o.tr=r.tier||0;}
      save();end(r);});},O().jw!==weekNo());});}

/* ---------- итоги прошлых недель (к выдаче) ---------- */
function claims(){var g=O().lgw||0,src=lg&&lg.claims||CUP.me()&&CUP.me().claims||[];return src.filter(function(c){return c&&c.wk>g;});}
function rwCoins(k){return k>0?Math.max(5,Math.round(k)):0;}
function claimWin(c,back){var o=O(),got=c.wk<=(o.lgw||0),n=got?0:rwCoins(c.rw),up=c.res==='up',dn=c.res==='down',top=c.res==='top',pl=c.pl|0;
  if(!got&&(o.sw||0)<c.wk){o.sw=c.wk;save();ev('wk',{f:c.tr,t:c.to,p:pl,o:c.pts||0,r:n,h:c.nh||0,m:c.res});}
  var h=pl===1?'🏆 Первая в живом подъезде!':pl===2?'🥈 Второе место в живом подъезде!':pl===3?'🥉 Третье место в живом подъезде!':'🌐 Итоги живого подъезда';
  var t=up?'Живые соседи признали: ты из лучших! Переезжаем этажом выше.':top?'Выше уже некуда — держим вершину!':
    dn?'Неделя не задалась — спускаемся на ступеньку. Ничего, отыграемся!':'Держим ступеньку. На этой неделе — выше!';
  modal('<div class="zu-w"><h2>'+h+'</h2><div class="zu-say"><div class="av">'+(typeof zinaSVG==='function'?zinaSVG(up||top?'wow':'happy'):'')+'</div><p>'+t+'</p></div>'+
    '<p class="zu-p">Прошлая неделя: <b>'+pl+'-е место</b> в группе'+(c.nh?' (живых — '+c.nh+')':'')+' · '+(c.pts||0)+' очк.</p>'+
    '<p class="zu-p">'+(up?'▲ '+tierH(c.tr)+' → <b>'+tierH(c.to)+'</b>':dn?'▼ '+tierH(c.tr)+' → '+tierH(c.to):'Ступенька: '+tierH(c.to))+'</p>'+
    (n?'<div class="zu-rw"><b>+'+n+' '+(typeof COIN_I!=='undefined'?COIN_I:'💰')+'</b><small>Чем выше ступенька — тем больше; за подъём ×1,5, за спуск ×0,5</small></div>':'')+
    '<div class="btns"><button class="btn green" id="zuTake">'+(n?'🎁 Забрать':'Хорошо')+'</button></div></div>');
  try{if(up||top)SND.win();}catch(e){}
  $$('zuTake').onclick=function(){var o=O();if(c.wk>(o.lgw||0)){o.lgw=c.wk;var k=rwCoins(c.rw);if(k){addCoins(k,'gift');try{SND.coin();}catch(e){}}ev('take',{t:c.to,r:k});save();try{cloudSoon();}catch(e){}}
    CUP.claim(c.wk);if(lg&&lg.claims)lg.claims=lg.claims.filter(function(x){return x.wk!==c.wk;});
    if(typeof back==='function')back();else hideModal();};}

/* ---------- окно «Живой подъезд» ---------- */
function rows(){var me=null,out=[];(lg.rows||[]).forEach(function(r){if(r.me){me=r;out.push({me:1,v:Math.max(r.v||0,pts()),z:r.z});}else out.push({r:r,v:r.v||0,z:r.z,bot:!!r.bot});});
  if(!me)out.push({me:1,v:pts()});return out.sort(function(a,b){return b.v-a.v||(a.me?-1:b.me?1:0);});}
function liveOpen(back){if(!liveNow()){login(function(r){if(r&&liveNow())liveOpen(back);},true);return;}
  ev('open',{t:lg.tier||0});var tb=rows(),mi=0;tb.forEach(function(x,j){if(x.me)mi=j;});
  // на телефоне — 8 строк: лучшие и вокруг тебя
  var show=tb.map(function(x,j){return j;}).filter(function(j){return j<3||Math.abs(j-mi)<=2||j===tb.length-1;}).slice(0,9),last=-1,h='';
  show.forEach(function(j){var x=tb[j];if(j>last+1)h+='<div class="zu-gap">⋯</div>';last=j;var up=x.z==='up',dn=x.z==='down';
    h+='<div class="sosr'+(x.me?' me':'')+'"><span class="sp">'+(j+1)+'</span><span class="se">'+(x.me?'🏠':x.bot?'👵':'🙂')+'</span><span class="sn"><b>'+
      (x.me?'Ты и баба Зина':esc(CUP.nameOf(x.r)))+'</b><small>'+(x.me?'это ты':x.bot?'соседка бабы Зины':'живой игрок')+'</small></span><span class="ss">'+(x.v||(x.me?0:'💤'))+
      '<i style="color:'+(up?'#237a3b':dn?'#c0392b':'transparent')+'">'+(up?'▲':dn?'▼':'·')+'</i></span></div>';});
  var o=O(),first=!o.iv;if(first){o.iv=1;save();}
  modal('<div class="sosm zu-w"><h2>🌐 Живой подъезд</h2><p class="zu-p">'+tierH(lg.tier||0)+' · '+(mi+1)+'-е место из '+tb.length+(wendTxt()?' · итоги через '+wendTxt():'')+'</p>'+
    (first?'<div class="zu-say"><div class="av">'+(typeof zinaSVG==='function'?zinaSVG('wow'):'')+'</div><p>Теперь в подъезде живые соседи — игроки со всей страны! Очки те же, что у Соседок. Лучшие переезжают этажом выше, за неделю — монеты.</p></div>':'')+
    '<div class="sost">'+h+'</div><p class="sosh">▲ — переедут выше, ▼ — ниже. Имена скрыты («Игрок 4821»), своё можно показать в ⚙. Соседки сервера — тоже персонажи бабы Зины.</p>'+
    '<div class="btns"><button class="btn green" id="zuOk">'+(back?'Назад':'Хорошо')+'</button></div></div>');
  $$('zuOk').onclick=function(){try{SND.tap();}catch(e){}if(typeof back==='function')back();else hideModal();};}

/* ---------- строка в окне Соседок ---------- */
function sosRow(from,back){if(!liveNow())return;var el=$$('sosLive');if(!el||$$('zuRow'))return;var tb=rows(),mi=0;tb.forEach(function(x,j){if(x.me)mi=j;});
  var b=document.createElement('button');b.type='button';b.id='zuRow';b.className='zu-row';
  b.innerHTML='<span>🌐 <b>Живой подъезд</b> · '+tierH(lg.tier||0)+'</span><b>'+(claims().length?'итоги!':(mi+1)+'-е из '+tb.length)+' ›</b>';
  el.parentNode.insertBefore(b,el.nextSibling);
  b.onclick=function(){try{SND.tap();}catch(e){}var re=function(){openSosedki(from,back);};var c=claims()[0];if(c)claimWin(c,re);else liveOpen(re);};}
if(typeof window.openSosedki==='function'&&!window.openSosedki.__zu){var os0=window.openSosedki;
  window.openSosedki=function(from,back){var r=os0.apply(this,arguments);ZB.safe('cup:sos',function(){sosRow(from,back);});return r;};window.openSosedki.__zu=1;}

/* ---------- после победы: досдать рост очков (не чаще раза в 2 мин) ---------- */
ZB.levelHook.push(function(i){if(!i||!i.ok||!O().on||off)return;var wait=Math.max(0,subT+SUBGAP-Date.now());clearTimeout(subTm);
  subTm=setTimeout(function(){ZB.safe('cup:sub',function(){sub(function(r){if(r&&r.ok&&lg)lg._t=0;});});},wait+1500);});
document.addEventListener('visibilitychange',function(){if(document.hidden&&O().on&&!off)ZB.safe('cup:hide',function(){sub();});});

/* ---------- ⚙: показ имени, удаление данных ---------- */
if(typeof window.openSettings==='function'&&!window.openSettings.__zu){var st0=window.openSettings;
  window.openSettings=function(){var r=st0.apply(this,arguments);ZB.safe('cup:set',setRow);return r;};window.openSettings.__zu=1;}
function setRow(){var rs=$$('setRows');if(!rs||$$('zuSet')||!O().on)return;var sh=CUP.shown(),me=CUP.me(),tg=me&&me.tg;
  var d=document.createElement('div');d.id='zuSet';
  d.innerHTML='<button class="setrow'+(sh?'':' off')+'" id="zuSN"><span>🌐 Моё имя в живом подъезде<br><small>'+(sh?'видно «Имя Ф.»':'скрыто — «Игрок'+(tg?' '+tg:'')+'»')+'</small></span><b>'+(sh?'● вкл':'○ выкл')+'</b></button>'+
    '<button class="setrow" id="zuDel"><span>🗑 Удалить мои данные живого подъезда</span><b>›</b></button>';
  rs.parentNode.insertBefore(d,rs.nextSibling);
  $$('zuSN').onclick=function(){try{SND.tap();}catch(e){}CUP.showName(!CUP.shown(),function(){});lg=null;var x=$$('zuSet');if(x)x.remove();setRow();};
  $$('zuDel').onclick=function(){try{SND.tap();}catch(e){}var b=this;if(!b.dataset.ok){b.dataset.ok=1;b.querySelector('span').textContent='🗑 Точно удалить? Нажми ещё раз';return;}
    CUP.forget(function(r){if(!r){try{toast('Не получилось — проверь интернет');}catch(e){}return;}var o=O();o.on=0;o.sv=0;o.svw=0;lg=null;off=true;save();ev('del',{});
      try{toast('Данные живого подъезда удалены');}catch(e){}var x=$$('zuSet');if(x)x.remove();});};}

/* ---------- старт: войти в группу недели; итоги к выдаче — когда Дом свободен ---------- */
function boot(){login(function(r){if(!r)return;try{if(!boot.s){boot.s=1;ev('ses',{t:O().tr||0,j:r.joined?1:0});}}catch(e){}
  if(!claims().length||claimWait)return;claimWait=true;var n=0;
  var tm=setInterval(function(){if(++n>240){clearInterval(tm);claimWait=false;return;}
    var m=document.querySelector('.screen.on');if(!m||m.id!=='menu'&&m.id!=='zb-home'||$$('modal').classList.contains('on'))return;
    clearInterval(tm);claimWait=false;var c=claims()[0];if(c)claimWin(c);},1000);});}

(function(){var s=document.createElement('style');s.textContent=
  '.zu-row{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;min-height:44px;margin:6px 0 0;padding:8px 10px;border-radius:12px;border:1px solid rgba(37,99,201,.35);background:rgba(37,99,201,.07);font:inherit;font-size:14.5px;color:var(--ink);cursor:pointer;text-align:left}'+
  '.zu-row>b{white-space:nowrap;flex:none}.zu-tr{white-space:nowrap}.zu-tr i{display:inline-block;width:.8em;height:.8em;border-radius:50%;vertical-align:-1px;margin-right:4px;box-shadow:0 0 0 1px rgba(0,0,0,.3) inset}'+
  '.zu-p{text-align:center;margin:4px 0;font-size:14.5px}.zu-gap{text-align:center;opacity:.6;line-height:1}.zu-say{display:flex;gap:8px;align-items:center;margin:6px 0}.zu-say .av{width:56px;flex:none}.zu-say p{margin:0;font-size:14.5px;text-align:left}'+
  '.zu-rw{text-align:center;margin:8px 0;padding:8px;border-radius:12px;background:rgba(230,181,58,.15)}.zu-rw b{display:block;font-size:22px}.zu-rw small{font-size:13px;color:var(--ink2)}'+
  '.zu-w .ss i{font-style:normal;margin-left:4px;font-size:12px}';
  document.head.appendChild(s);})();

ZC.x={boot:boot,login:login,live:liveNow,open:liveOpen,sub:sub,claims:claims,_lg:function(){return lg;}};
})();
