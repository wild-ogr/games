/*NEWS*/
/* NEWS v1 (26.10.2026) — «объявление игрокам при входе», общий модуль всех игр (папка hobby-analytics/news, README.md там же; журнал release-i/news-2610/NEWS.md).
   Владелец пишет объявление в дашборде (stat.assortiz.ru → Ещё → Объявления) или с мака (push.py news); игра при входе спрашивает
   GET https://stat.assortiz.ru/news?g=<игра> (таймаут 3 с; ошибка/нет сети — молча ничего) и, если есть непоказанное, рисует карточку поверх главного экрана.
   - Не мешает новичку: не раньше 15 с после запуска и только когда игра говорит ready() (главный экран, нет окна, новичок прошёл 1-й уровень).
   - «Понятно» → id запоминается (localStorage news-seen-<игра>), больше не всплывает; пока объявление висит — строчка в гнезде slot() на главном экране, по ней — открыть снова.
   - Статистика (общий STAT): news {a: show|open|close, id}. Сервер править не надо.
   - Текст — только простой (экранируется, ссылок нет — правила VK 4.2.3/4.1.8; сервер ссылки и не примет). Английская версия на Яндексе — только если есть title_en/text_en.
   Подключение: NEWS.init({g:'vyezd', ready:()=>…, slot:()=>элемент, hero:{i:'👵',n:'…'}, theme:{…}, lang:()=>LANG}) — подробно README.md.
   Совместимость: старый синтаксис (var/function), без optional chaining, без CSS inset и flex gap. Свой CSS вставляется сам (классы nws-*). */
var NEWS=(function(){
  'use strict';
  var W=window,D=document,O=null,list=[],seen=[],t0=0,shownNow=false,openEl=null,fetchedAt=0,timer=0,lastSlot=null,lastLine='',keyFn=null;
  var URL='https://stat.assortiz.ru/news',WAIT=15000,TIMEOUT=3000,REFETCH=30*60e3,MAXSEEN=40;
  var KIND={thanks:'🙏',fix:'🔧',info:'📣'};
  function nop(){}
  function dev(){return /^(localhost|127\.0\.0\.1)$/.test(location.hostname);}   /* стенд на маке: window.NEWS_URL / NEWS_WAIT */
  function now(){return Date.now();}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function en(){try{var l=typeof O.lang==='function'?O.lang():O.lang;return String(l||'ru').slice(0,2)==='en';}catch(e){return false;}}
  function tx(ru,e){return en()?e:ru;}
  function lsGet(k){try{return W.localStorage.getItem(k);}catch(e){return null;}}
  function lsSet(k,v){try{W.localStorage.setItem(k,v);}catch(e){}}
  function st(a,id){try{if(O.stat)O.stat('news',{a:a,id:id});else if(W.STAT&&STAT.ev)STAT.ev('news',{a:a,id:id});}catch(e){}}
  function call(f,d){try{return typeof f==='function'?f():d;}catch(e){return d;}}

  function loadSeen(){try{var v=JSON.parse(lsGet('news-seen-'+O.g)||'[]');seen=v&&v.length!==undefined?v.slice(-MAXSEEN):[];}catch(e){seen=[];}}
  function isSeen(id){for(var i=0;i<seen.length;i++)if(seen[i]===id)return true;return false;}
  function markSeen(id){if(isSeen(id))return;seen.push(id);if(seen.length>MAXSEEN)seen=seen.slice(-MAXSEEN);lsSet('news-seen-'+O.g,JSON.stringify(seen));}

  /* объявление для этого игрока: срок не вышел, есть текст на его языке */
  function item(x){
    if(!x||!x.id||!(x.to*1000>now()))return null;
    var t=en()?x.title_en:x.title,b=en()?x.text_en:x.text;
    if(!t||!b)return null;
    return {id:String(x.id),title:String(t),text:String(b),kind:x.kind,to:x.to};
  }
  function active(){var o=[],i,y;for(i=0;i<list.length;i++){y=item(list[i]);if(y)o.push(y);}return o;}
  function fresh(){var a=active(),o=[],i;for(i=0;i<a.length;i++)if(!isSeen(a[i].id))o.push(a[i]);return o;}

  function fetchNews(){
    fetchedAt=now();
    var u=(O.url||(dev()&&W.NEWS_URL)||URL)+'?g='+encodeURIComponent(O.g),done=false;
    function ok(d){if(done)return;done=true;list=d&&d.news&&d.news.length!==undefined?d.news:[];call(O.onList?function(){O.onList(active().length);}:null);tick();}
    function fail(){done=true;}
    setTimeout(function(){if(!done){done=true;if(ctl)try{ctl.abort();}catch(e){}}},TIMEOUT);
    var ctl=null;
    try{
      if(W.fetch){ctl=W.AbortController?new AbortController():null;
        fetch(u,{method:'GET',mode:'cors',credentials:'omit',signal:ctl?ctl.signal:undefined}).then(function(r){return r.ok?r.json():null;}).then(ok,fail);return;}
      var x=new XMLHttpRequest();x.open('GET',u,true);x.timeout=TIMEOUT;
      x.onload=function(){try{ok(x.status===200?JSON.parse(x.responseText):null);}catch(e){fail();}};x.onerror=x.ontimeout=fail;x.send();
    }catch(e){fail();}
  }

  /* ---------- вид ---------- */
  function css(){
    if(D.getElementById('nws-css'))return;
    var T=O.theme||{},card=T.card||'#fffaf0',ink=T.ink||'#3a2f25',sub=T.sub||'#7a6a58',acc=T.accent||'#e8743b',accInk=T.accentInk||'#fff',line=T.line||'#f0e2c8',
      font=T.font||'inherit',shadow=T.btnShadow||'0 4px 0 rgba(0,0,0,.18)',lineBg=T.lineBg||'rgba(255,255,255,.92)';
    var s='.nws-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:'+(O.z||9000)+';background:rgba(20,16,10,.55);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;-webkit-tap-highlight-color:transparent;animation:nwsIn .18s ease-out}'+
      '.nws-card{position:relative;background:'+card+';color:'+ink+';font-family:'+font+';width:100%;max-width:420px;max-height:88vh;max-height:calc(100vh - 32px);overflow:auto;-webkit-overflow-scrolling:touch;border-radius:22px;box-shadow:0 18px 48px rgba(0,0,0,.35);padding:0;box-sizing:border-box;text-align:left}'+
      '.nws-head{display:flex;align-items:center;padding:14px 48px 12px 18px;border-bottom:2px dashed '+line+';font-weight:700;font-size:15px;color:'+sub+';letter-spacing:.02em}'+
      '.nws-ava{flex:none;width:40px;height:40px;border-radius:50%;background:'+line+';display:flex;align-items:center;justify-content:center;font-size:24px;margin-right:10px}'+
      '.nws-head small{display:block;font-weight:500;font-size:12.5px;opacity:.85;letter-spacing:0}'+
      '.nws-x{position:absolute;right:8px;top:8px;width:40px;height:40px;border:0;background:transparent;color:'+sub+';font-size:22px;line-height:40px;cursor:pointer;border-radius:50%;padding:0}'+
      '.nws-it{padding:14px 18px 0}.nws-it+.nws-it{border-top:1px solid '+line+';margin-top:14px}'+
      '.nws-t{font-size:20px;line-height:1.2;font-weight:800;margin:0 0 8px}'+
      '.nws-t i{font-style:normal;margin-right:6px}'+
      '.nws-p{font-size:16px;line-height:1.42;margin:0 0 8px;white-space:normal;word-wrap:break-word}'+
      '.nws-foot{position:-webkit-sticky;position:sticky;bottom:0;background:'+card+';padding:12px 18px 16px;margin-top:4px}'+
      '.nws-ok{display:block;width:100%;margin:0;min-height:50px;border:0;border-radius:18px;background:'+acc+';color:'+accInk+';font:inherit;font-weight:800;font-size:18px;cursor:pointer;box-shadow:'+shadow+'}'+
      '.nws-ok:active{transform:translateY(2px)}'+
      '.nws-line{display:flex;align-items:center;width:100%;box-sizing:border-box;margin:6px 0;padding:8px 12px;border:0;border-radius:14px;background:'+lineBg+';color:'+ink+';font:inherit;font-size:14.5px;font-weight:700;text-align:left;cursor:pointer;box-shadow:0 2px 0 rgba(0,0,0,.08)}'+
      '.nws-line b{flex:none;margin-right:8px;font-size:17px}.nws-line span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nws-line em{flex:none;font-style:normal;margin-left:8px;opacity:.6}'+
      '.nws-line .nws-dot{flex:none;width:8px;height:8px;border-radius:50%;background:'+acc+';margin-left:6px}'+
      '@keyframes nwsIn{from{opacity:0}to{opacity:1}}'+
      '@media (max-height:560px){.nws-t{font-size:18px}.nws-p{font-size:15px;line-height:1.35}.nws-ok{min-height:44px}}';
    var e=D.createElement('style');e.id='nws-css';e.textContent=s;(D.head||D.documentElement).appendChild(e);
  }
  function para(t){var a=String(t).split(/\n+/),o='',i;for(i=0;i<a.length;i++)if(a[i].replace(/\s+/g,''))o+='<p class="nws-p">'+esc(a[i])+'</p>';return o;}
  function cardHtml(items){
    var h=O.hero||{},head=O.head||tx('Объявление','News'),i,o='';
    o+='<div class="nws-head">'+(h.i?'<span class="nws-ava" aria-hidden="true">'+esc(h.i)+'</span>':'')+'<span>'+esc(head)+(h.n?'<small>'+esc(h.n)+'</small>':'')+'</span></div>';
    o+='<button type="button" class="nws-x '+(O.cls||'')+'" data-nws="x" aria-label="'+esc(tx('Закрыть','Close'))+'">✕</button>';
    for(i=0;i<items.length;i++)o+='<div class="nws-it"><h2 class="nws-t">'+(KIND[items[i].kind]?'<i aria-hidden="true">'+KIND[items[i].kind]+'</i>':'')+esc(items[i].title)+'</h2>'+para(items[i].text)+'</div>';
    o+='<div class="nws-foot"><button type="button" class="nws-ok '+(O.cls||'')+'" data-nws="ok">'+esc(O.btn||tx('Понятно','Got it'))+'</button></div>';
    return o;
  }
  function show(items,how){
    if(openEl||!items.length)return false;
    css();
    var ov=D.createElement('div');ov.className='nws-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label',O.head||tx('Объявление','News'));
    ov.innerHTML='<div class="nws-card">'+cardHtml(items)+'</div>';
    function close(){if(!openEl)return;try{openEl.parentNode.removeChild(openEl);}catch(e){}openEl=null;
      if(keyFn){D.removeEventListener('keydown',keyFn,true);keyFn=null;}
      for(var i=0;i<items.length;i++){markSeen(items[i].id);st('close',items[i].id);}
      call(O.onClose);line(true);}
    ov.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('[data-nws]'):null;if(b){e.preventDefault();e.stopPropagation();try{if(W.SND&&SND.tap)SND.tap();}catch(x){}close();}else if(e.target===ov){e.stopPropagation();}},false);
    /* Enter/Пробел/Esc — только наша кнопка: обработчик клавиш игры не должен жать её кнопки под карточкой */
    keyFn=function(e){var k=e.key||'';if(k==='Escape'||k==='Esc'||k==='Enter'||k===' '){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();close();}};
    D.addEventListener('keydown',keyFn,true);
    (D.body||D.documentElement).appendChild(ov);openEl=ov;
    for(var i=0;i<items.length;i++)st(how,items[i].id);
    call(O.onShow);
    try{var b=ov.querySelector('.nws-ok');if(b&&b.focus)b.focus({preventScroll:true});}catch(e){}
    return true;
  }
  /* строчка на главном экране: пока есть активные объявления */
  function line(force){
    var el=call(O.slot,null),a=active();
    if(!el){lastSlot=null;return;}
    var html=lineHtml();
    if(!force&&el===lastSlot&&html===lastLine&&(html?el.querySelector('[data-nws-line]'):!el.firstChild))return;   /* игра перерисовала экран — вставим заново */
    lastSlot=el;lastLine=html;css();el.innerHTML=html;el.style.display=html?'':'none';
  }
  function lineHtml(){var a=O?active():[];if(!a.length)return '';css();var f=fresh().length;
    return '<button type="button" class="nws-line '+(O.cls||'')+'" data-nws-line="1"><b aria-hidden="true">'+(O.lineIcon||'📰')+'</b><span>'+esc(a[0].title)+(a.length>1?' · +'+(a.length-1):'')+'</span>'+(f?'<i class="nws-dot" aria-hidden="true"></i>':'')+'<em aria-hidden="true">›</em></button>';}
  function onLine(e){var b=e.target&&e.target.closest?e.target.closest('[data-nws-line]'):null;if(!b)return;e.preventDefault();e.stopPropagation();
    try{if(W.SND&&SND.tap)SND.tap();}catch(x){}var a=active();if(a.length)show(a,'open');}

  function tick(){
    if(!O)return;
    line(false);
    if(shownNow||openEl||D.hidden||now()-t0<(O.wait!=null?O.wait:dev()&&W.NEWS_WAIT!=null?W.NEWS_WAIT:WAIT))return;
    var f=fresh();if(!f.length)return;
    if(!call(O.ready,true)||call(O.busy,false))return;
    if(show(f,'show'))shownNow=true;          /* сам — один раз за заход; остальное по строчке */
  }

  /* NEWS.init({g, url?, ready?, busy?, slot?, hero?:{i,n}, head?, btn?, theme?, cls?, lang?, wait?, z?, stat?, onShow?, onClose?, onList?(n)}) — один раз при запуске.
     onList(n) — список пришёл (n активных): игра со своими гнёздами (Выезд — homeSlots) перерисовывает главный экран. */
  function init(o){
    if(O||!o||!o.g)return;
    O=o;t0=now();loadSeen();
    D.addEventListener('click',onLine,true);
    fetchNews();
    timer=setInterval(tick,1000);
    D.addEventListener('visibilitychange',function(){if(!D.hidden&&now()-fetchedAt>REFETCH)fetchNews();});
  }
  return {v:1,init:init,tick:tick,
    open:function(){var a=active();return a.length?show(a,'open'):false;},   /* открыть все активные (кнопка в меню игры, если хочется) */
    count:function(){return O?active().length:0;},
    lineHtml:function(){return O?lineHtml():'';},   /* строчка для своего гнезда игры (Выезд — homeSlots zone top); нажатие модуль ловит сам */
    titles:function(){var a=O?active():[],o=[],i;for(i=0;i<a.length;i++)o.push(a[i].title);return o;},   /* для своей плитки игры (Выезд — homeSlots) */
    fresh:function(){return O?fresh().length:0;},
    isOpen:function(){return !!openEl;},
    _set:function(l){list=l||[];tick();},              /* для стендов */
    _reset:function(){seen=[];lsSet('news-seen-'+(O&&O.g),'[]');shownNow=false;}};
})();
/*/NEWS*/
