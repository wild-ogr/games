'use strict';
/* ================= zb3-house-s — клиент «Сервера дома» (Z3.srv) для «Зины 3.0», поздняя часть (поток SRV, 24.10.2026; BUILD 25.10 диета: вынесено из старта
   js/zb3-house.js — там флаг z3srv и тонкая обёртка Z3.srv: send копит в Z3.q, get/flush/okFriends догружают этот файл, peek/me читают кэш) =================
   Договор — hobby-analytics/release-i/zina-boost3/Z3-SRV-API.md. Сервер — hobby-analytics/online/ext/house.py (hobby-cup, op=house).
   Z3.srv.send(kind,data) — в очередь (localStorage z3-q), досдача пачкой; Z3.srv.get(kind,q) → Promise(obj) ВСЕГДА с ответом:
   свежий | сохранённый (_off:1,_age) | рассчитанный на месте (_sim:1: персонажи-соседи, стройка по расписанию). Ошибок игроку не показываем.
   Адрес сервера — URL ниже (пусто → только расчёт). Стенд (localhost): ?z3srv=11640 (поддельный сервер), ?z3u=<номер> — игрок.
   Флаг: ?off=z3srv — без сети (только расчёт). Старые WebView: без ?. ?? .at :has structuredClone.
*/
(function(){
  var Z=window.Z3;if(!Z||typeof window.ZB==='undefined'||!Z.srv||Z.srv._full)return;
  var MAILNET=false; // письма Зине на сервер не шлём (решение владельца 25.10, Z3-NOAI.md); true — старая почта через сервер (ИИ/заготовки ночью)
  var URL='https://functions.yandexcloud.net/d4e5nfg9u466prmmiooj?op=house'; // функция hobby-cup (выкачена 25.10, Z3-SRV-DEPLOY.md «Подстановка»); пусто → дом живёт на расчёте
  var ON=!!Z.srv.ON; // флаг z3srv — в заглушке js/zb3-house.js
  function now(){try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}}
  function lsG(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
  function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function rng(a){a=a>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
  function hsh(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  // ---- время МСК: день, неделя ISO (как на сервере) ----
  function msk(t){return new Date((t||now())+3*3600e3);}
  function dkey(t){var d=msk(t);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();}
  function wkey(t){var d=msk(t),x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())),w=(x.getUTCDay()+6)%7;x.setUTCDate(x.getUTCDate()-w+3);
    var y=x.getUTCFullYear(),f=new Date(Date.UTC(y,0,4));return y*100+1+Math.round(((x-f)/864e5-3+(f.getUTCDay()+6)%7)/7);} // ISO-неделя, как week_key на сервере (RELEASE-Z3: был знак наоборот → в 2026 на 1 меньше)
  function wstart(t){var d=msk(t),w=(d.getUTCDay()+6)%7;return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-w)-3*3600e3;}
  function wfrac(t){return Math.max(0,Math.min(1,((t||now())-wstart(t))/(7*864e5)));}
  function wmon(wk){var y=Math.floor(wk/100),n=wk%100,f=new Date(Date.UTC(y,0,4)),m=Date.UTC(y,0,4-((f.getUTCDay()+6)%7));return m+(n-1)*7*864e5;}
  function wkidx(a,b){return Math.round((wmon(b)-wmon(a))/(7*864e5));}

  // ---- свой вклад (для расчёта без сервера) ----
  function mine(){var o=lsG('z3-my',null),w=wkey();if(!o||o.wk!==w)o={wk:w,st:0,wd:0,d:dkey(),dst:0};if(o.d!==dkey()){o.d=dkey();o.dst=0;}return o;}

  // ---- очередь ----
  var Q=lsG('z3-q',[]);if(!(Q instanceof Array))Q=[];
  var fly=0,ft=0,fails=+lsG('z3-fails',0)||0,next=+lsG('z3-next',0)||0,tok=lsG('z3-tok',null),lastOk=+lsG('z3-ok',0)||0;
  function qsave(){if(Q.length>200)Q=Q.slice(Q.length-200);lsS('z3-q',Q);}
  function send(kind,data){try{if(!kind)return;data=data||{};
      if(kind==='stars'){kind='add';data={st:+data.n||0};} // CORE (zb3-kitchen) шлёт звёзды уровня так — это та же сдача add
      if(kind==='add'){var m=mine();m.st+=+data.st||0;m.wd+=+data.wd||0;m.dst+=+data.st||0;lsS('z3-my',m);
        var L=Q.length?Q[Q.length-1]:null;if(L&&L[0]==='add'&&Q.length>fly){L[1].st=(+L[1].st||0)+(+data.st||0);L[1].wd=(+L[1].wd||0)+(+data.wd||0);if(data.lv)L[1].lv=Math.max(+L[1].lv||0,+data.lv);qsave();soon();return;}}
      if(kind==='lt'){var L=lsG('z3-lt',[]),t=now(),m=msk(t);L.push({id:'l'+t,at:Date.UTC(m.getUTCFullYear(),m.getUTCMonth(),m.getUTCDate()+(m.getUTCHours()>=3?1:0),7)-3*3600e3,t:String(data.t||'').slice(0,60),nm:String(data.nm||'').slice(0,20),d:dkey()});lsS('z3-lt',L.slice(-5));}
      if(kind==='rid'){var r=lsG('z3-rid',[]);r.push({id:'l'+now(),w:data.w,d:dkey(),n:0});lsS('z3-rid',r.slice(-9));}
      if(kind==='vote'){var v=lsG('z3-vt',{});v[data.f]=data.o;lsS('z3-vt',v);}
      if(kind==='lt'&&!MAILNET)return; // решение 25.10 «без ИИ»: текст письма Зине остаётся на устройстве, ответ — утром из местного подбора
      Q.push([kind,data,now()]);qsave();soon();}catch(e){}}
  function soon(){if(!ft&&net())ft=setTimeout(function(){ft=0;go([]);},20000);}

  // ---- сеть ----
  function url(){try{if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){var p=/[?&]z3srv=(\d{2,5})/.exec(location.search);if(p)return 'http://127.0.0.1:'+p[1]+'/?op=house';}}catch(e){}return URL;}
  function dev(){return url().indexOf('127.0.0.1')>0;}
  function net(){return ON&&!!url()&&(dev()||PLAT==='vk'||(typeof ypAuth==='function'&&ypAuth()));}
  var evT={};function ev(a,o){if(now()-(evT[a]||0)<600e3)return;evT[a]=now();o=o||{};o.a=a;Z.ev('z3x',o);}
  function ident(cb){
    var sh=lsG('cup-zina',null),a;sh=(sh===1||sh==='1')?1:0;
    if(dev()){var u=(/[?&]z3u=(\d+)/.exec(location.search)||[])[1]||lsG('z3-devu',0);if(!u){u=String(1000+Math.floor(Math.random()*9e6));}lsS('z3-devu',u);
      return cb({p:'dev',u:String(u),cl:(typeof OK!=='undefined'&&OK)?'ok':PLAT==='vk'?'vk':'ya',nm:'Ольга Котова',sh:sh});}
    if(PLAT==='vk'){a={p:'vk',q:location.search,sh:sh};
      var nm=lsG('z3-nm','');if(sh&&!nm&&typeof vkSend==='function'){vkSend('VKWebAppGetUserInfo',{},4000).then(function(r){if(r&&r.first_name){nm=(r.first_name+' '+(r.last_name||'')).trim();lsS('z3-nm',nm);}a.nm=nm;cb(a);},function(){cb(a);});return;}
      a.nm=nm;return cb(a);}
    try{if(typeof ysdk==='undefined'||!ysdk||!ypAuth())return cb(null);var done=0,t=setTimeout(function(){if(!done){done=1;cb(null);}},8000);
      ysdk.getPlayer({signed:true}).then(function(p){if(!done){done=1;clearTimeout(t);cb(p&&p.signature?{p:'ya',sig:p.signature,sh:sh}:null);}},function(){if(!done){done=1;clearTimeout(t);cb(null);}});}catch(e){cb(null);}}
  // код «приведи друга»: #gift=КОД (VK) или параметр запуска hash= (ОК кладёт свою часть после # в hash: «gift=КОД» или просто «КОД»)
  function refRaw(){var m=/(^|[#&])gift=([A-Z0-9]{6})/.exec(location.hash||'');if(m)return m;var h=/[?&]hash=([^&]*)/.exec(location.search||'');
    if(h){var v=decodeURIComponent(h[1].replace(/\+/g,' '));m=/(^|[#&?])gift=([A-Z0-9]{6})/.exec(v)||/^()([A-Z0-9]{6})$/.exec(v);}return m;}
  function ref(){var r=lsG('z3-ref','');if(r)return r;try{var m=refRaw();if(m&&(typeof S==='undefined'||!S||(+S.lv||0)<5)){lsS('z3-ref',m[2]);return m[2];}}catch(e){}return '';}
  function post(b,keep){var u=url(),body=JSON.stringify(b);
    return new Promise(function(ok,no){var done=0,t=setTimeout(function(){if(!done){done=1;no(new Error('timeout'));}},12000);
      fetch(u,{method:'POST',body:body,keepalive:!!keep&&body.length<60000}).then(function(r){return r.json();}).then(function(j){if(!done){done=1;clearTimeout(t);ok(j);}},function(e){if(!done){done=1;clearTimeout(t);no(e);}});});}
  var busy=null;
  // один запрос: очередь (≤50) + запросы g; → Promise(r|null)
  function go(g,keep){
    if(!net()||now()<next)return Promise.resolve(null);
    if(busy)return busy.then(function(){return go(g,keep);});
    var n=Math.min(50,Q.length),q=Q.slice(0,n),t0=now();fly=n;
    busy=new Promise(function(done){
      function fire(a){var b={q:q,g:g};try{if(typeof S!=='undefined'&&S&&S.streak>=0)b.sr=+S.streak||0;}catch(e){}if(tok&&tok.exp>now()&&!a)b.tok=tok.t;else if(a){b.a=a;var rf=ref();if(rf)b.ref=rf;}else return done(null);
        post(b,keep).then(function(r){
          if(r&&r.ok===0&&r.why==='tok'&&!a){tok=null;lsS('z3-tok',null);return ident(function(a2){if(a2)fire(a2);else done(null);});}
          if(!r||r.ok!==1)return fail(r&&r.why||'bad');
          if(r.tok){tok={t:r.tok,exp:now()+((r.ttl||86400)-600)*1000};lsS('z3-tok',tok);}
          Q.splice(0,n);qsave();fails=0;next=0;lsS('z3-fails',0);lsS('z3-next',0);lastOk=now();lsS('z3-ok',lastOk);
          if(r.me)lsS('z3-me',r.me);if(r.z3off!=null)lsS('z3-off',r.z3off?1:0);if(b.a&&b.ref)lsS('z3-ref','');
          ev('ok',{n:n,ms:now()-t0});done(r);},function(e){fail('net');});}
      function fail(why){fails++;var w=why==='off'||why==='rest'||why==='op'?6*3600e3:Math.min(30*60e3,60e3*Math.pow(2,fails-1));
        next=now()+w;lsS('z3-fails',fails);lsS('z3-next',next);ev('fail',{why:why,n:n});done(null);}
      if(tok&&tok.exp>now())fire(null);else ident(function(a){if(a)fire(a);else done(null);});
    }).then(function(r){busy=null;fly=0;return r;});
    return busy;}

  // ---- get: копим 50 мс → один запрос ----
  var GQ=[],gt=0;
  function ck(kind,q){return 'z3-c-'+kind+(kind==='vote'&&q&&q.f?'-'+q.f:'');}
  function get(kind,q){if(kind==='mail'&&!MAILNET)return Promise.resolve(fallback(kind,q));return new Promise(function(ok){GQ.push({k:kind,q:q||{},ok:ok});if(!gt)gt=setTimeout(fire,50);});}
  function fire(){gt=0;var L=GQ;GQ=[];var g=[],seen={};
    L.forEach(function(x){var id=x.k+JSON.stringify(x.q);if(!seen[id]){seen[id]=1;g.push([x.k,x.q]);}});
    go(g).then(function(r){L.forEach(function(x){var d=r&&r.r&&r.r[x.k];
        if(d&&d.ok!==0){if(d.wk0)lsS('z3-wk0',d.wk0);
          if(x.k!=='forget'&&x.k!=='fr'){var c={t:now(),d:d};try{if(JSON.stringify(c).length<8000)lsS(ck(x.k,x.q),c);}catch(e){}}
          try{ZB.emit('z3srv',{kind:x.k,data:d});}catch(e){}return x.ok(d);}
        Promise.resolve(fallback(x.k,x.q)).then(x.ok);});});}
  function fallback(kind,q){
    var c=lsG(ck(kind,q),null),s;
    if(c&&c.d&&now()-c.t<7*864e5&&kind!=='mail'){var d=JSON.parse(JSON.stringify(c.d));d._off=1;d._age=Math.round((now()-c.t)/1000);
      if(kind==='build'&&d.wk===wkey())return d;if(kind==='house'&&d.wk===wkey()&&d.d===dkey())return d;if(kind!=='build'&&kind!=='house')return d;}
    return ZB.load('js/zb3-house-x.js').then(function(){var f=Z.srv._sim[kind],o=f?f(q||{}):{};o._sim=1;return o;},function(){return {_sim:1};});}
  function peek(kind,q){var c=lsG(ck(kind,q),null);return c&&c.d||null;}

  // оценки шуток 😂/😐 (NUM, PAPER шлют STAT.ev('jk',{id,v})) → сервер дома, для «золотых» Альбома; свежие «золотые» — раз в день
  try{if(window.STAT&&STAT.ev&&!STAT.__z3jk){var ev0=STAT.ev;STAT.__z3jk=1;STAT.ev=function(n,o){try{if(n==='jk'&&net()&&o&&o.a!=='n'&&o.id&&(o.v===0||o.v===1||o.v==='0'||o.v==='1'))send('jk',{id:String(o.id).slice(0,24),v:+o.v});}catch(e){}return ev0.apply(this,arguments);};}}catch(e){}
  setTimeout(function(){var c=lsG('z3-c-jk',null);if(net()&&(!c||now()-c.t>864e5))get('jk');},15000);
  // Оповещения (правило VK 2.7.3 — «отключить в самом Приложении»; в ОК оповещения шлёт только наш сервер): строка в ⚙ — включить/выключить.
  // VK: включить предлагает SOC (кнопка «Напоминания»), здесь — только «выключить», когда включены; ОК: и включить, и выключить. ?off=z3ntf — без строки.
  var NTF=ZB2.reg('z3ntf',{t:'Оповещения Зины: включить/выключить в ⚙ (VK и ОК)',who:'SRV'});
  function isOK(){return typeof OK!=='undefined'&&!!OK;}
  function ntfSt(){var v=lsG('z3-ntf',null);if(v===0||v===1)return v;try{if(window.SOC&&SOC.ntfOn&&SOC.ntfOn())return 1;}catch(e){}var m=/[?&]vk_are_notifications_enabled=([01])/.exec(location.search);return m?+m[1]:0;}
  function ntfSet(on){var m=on?'VKWebAppAllowNotifications':'VKWebAppDenyNotifications';
    return vkSend(m,{},30000).then(function(r){var y=on?!!(r&&r.result):true;if(y){lsS('z3-ntf',on?1:0);send('ntf',{on:on?1:0});flushSoon();}Z.ev('z3x',{a:'ntf',r:y?(on?'on':'off'):'no',ok:isOK()?1:0});return y;},
      function(){if(!on){lsS('z3-ntf',0);send('ntf',{on:0});}Z.ev('z3x',{a:'ntf',r:'err',ok:isOK()?1:0});return !on;});}
  function flushSoon(){setTimeout(function(){go([]);},500);}
  if(NTF&&typeof openSettings==='function'&&PLAT==='vk'){var os0=openSettings;openSettings=function(){os0.apply(this,arguments);try{
      if(typeof VK==='undefined'||!VK||typeof vkSend!=='function'||document.getElementById('z3Ntf'))return;var on=ntfSt();if(!on&&!isOK())return;
      var mc=document.getElementById('mcard'),bt=mc&&mc.querySelector('.btns');if(!bt)return;var b=document.createElement('button');
      b.id='z3Ntf';b.className='setrow'+(on?'':' off');b.innerHTML='<span>🔔 Оповещения от Зины</span><b>'+(on?'● вкл':'○ выкл')+'</b>';
      bt.parentNode.insertBefore(b,bt);b.onclick=function(){try{SND.tap();}catch(e){}ntfSet(!on).then(function(){try{openSettings();}catch(e){}});};}catch(e){}};}
  // досдать при уходе со страницы
  try{document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&Q.length&&net())go([],true);});}catch(e){}
  setTimeout(function(){if(Q.length)go([]);},8000);
  // П.16: запуск из оповещения героев (ОК кладёт fragment «z3n=<повод>» в параметр hash) → STAT z3x {a:'ntf_open', k} — какой повод приводит игроков
  try{var nq=/(^|[#&])z3n=([a-z.]{2,12})/.exec(location.hash||'')||(function(){var h=/[?&]hash=([^&]*)/.exec(location.search||'');return h?/(^|[#&?])z3n=([a-z.]{2,12})/.exec(decodeURIComponent(h[1])):null;})();
    if(nq&&ON)setTimeout(function(){Z.ev('z3x',{a:'ntf_open',k:nq[2]});},1500);}catch(e){}

  // то, что накопила заглушка до загрузки (Z3.q), — через send (счёт своего вклада z3-my, письма, загадки)
  var q0=Z.q||[];Z.q=[];q0.forEach(function(x){send(x.k,x.d);});
  var R={v:1,send:send,get:get,peek:peek,flush:function(){return go([]);},
    on:function(){return net()&&now()-lastOk<6*3600e3;},
    me:function(){return lsG('z3-me',null);},
    mailNet:function(){return MAILNET&&net();},
    okFriends:function(){return ZB.load('js/zb3-house-x.js').then(function(){return Z.srv._okFriends();}).then(null,function(){return {ids:[],in:[]};});},
    _sim:{},_h:{now:now,lsG:lsG,lsS:lsS,rng:rng,hsh:hsh,msk:msk,dkey:dkey,wkey:wkey,wstart:wstart,wfrac:wfrac,wkidx:wkidx,mine:mine,net:net,clr:function(){Q=[];}},_dbg:function(){return {url:url(),net:net(),q:Q.length,fails:fails,next:next,tok:!!tok,wk:wkey(),d:dkey()};}};
  if(Z.soff&&!Z.on&&url())ZB.load('js/zb3-house-x.js').then(function(){Z.srv._z3chk(url());},function(){}); // Зина 3.0 выключена с сервера — только спросить, не включили ли (загружено заглушкой через 6 с)
  for(var k in R)Z.srv[k]=R[k];Z.srv._full=1; // тот же объект Z3.srv (ссылки чужих модулей живут)
})();
