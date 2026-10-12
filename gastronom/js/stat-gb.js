/* STATGB — статистика буста «Гастроном №1: Образцовый» (поток TECH, 10.10.2026; журнал hobby-analytics/release-i/gastronom-boost/logs/TECH.md).
   Дополняет общий модуль STAT v1.4 (блок /*STAT*\/ в index.html; сам модуль не меняем). Без личных данных: номер уровня и ход игры.
   Все события ≤ 8 полей, порядок = приоритет (STAT отрезает всё после 8-го), пустые поля не шлём. Строка — под меткой <!-- gb:TECH -->;
   не загрузился / выключен (window.GB_OFF={statgb:1}) — игра и старые события работают как раньше.

   ДОГОВОР СОБЫТИЙ (новое и дополненное; старые события — как были):
     end   win  {l, r, s, [m, h, u], f, st, mv, pm, an, sk, mx, tb} — f:1 — ПЕРВАЯ победа уровня; m — режим (daily | rev после «Ещё попытки» |
                G.mode потоков MODE/FEST); mv — ходов; pm — минимум терпения покупателя за попытку (ходов до ухода; 0 — кто-то ушёл);
                an — ушли недовольными; sk/mx/tb — тупиков/«Смешать»/«Столик» (при 8+ полях отрезаются последними).
           lose/quit {l, r, s, [m, h, u, idle], left, mv, pm, an, sk, mx, tb} — left — сколько товаров осталось на полках.
     stk   {l, t, n, left, m} — 30+ с ИГРЫ без тройки (окна, пауза, свёрнуто — не в счёт): t — секунд без тройки, n — который раз за попытку
           (до 3), left — товаров осталось. Тупик «Полки забиты» — как раньше (sk в end).
     bst   {l, k, s, m} — каждый бустер: k = undo | hint | mix | table | life (ещё попытка); s = free (первая отмена даром) | coins | ad.
     win_btn {l, b, m} — первое нажатие в «Кассе»: next | map | daily | shop | lb | gb:<id гнезда> | … (id кнопки без «m», или data-st).
     map   {why, l} — открыли главный/карту: why = win | lose | quit (ушли из уровня) | city (после Ревизии) | boot | nav.
     scr   {n, k, d} — ПОВТОРНЫЙ заход на экран в том же сеансе (первый пишет сам STAT, без k): k — какой по счёту, d — секунд на прошлом экране.
           Экраны буста GB.go(name) → STAT.screen(name) (первый заход — обычный scr {n}).
     unlock {k, id, l} — открытие: k = city (новый город, id — номер города) | rep (новая республика, GBU) | daily (задание дня) | rank (разряд, GBM).
     egb   {plan, seal, dep, glass, book, lg, qp, mg, …} — монеты по источникам буста за заход: общий STAT.earn знает только
           lvl|ad|gift|chest|buy|quest и остальное кладёт в 'oth' (там они и остаются для итога earn); egb — расшифровка 'oth', шлётся
           при сворачивании, по 8 источников в событии.
     prg   {rk, dp, al, bk, lg, sr, st, sz} — прохождение раз за загрузку (и после перерыва 30 мин, если изменилось): rk — разряд GBM.rank(),
           dp — шагов отделов (сумма GBM.depList()[].lv), al — карточек «Дефицит», bk — благодарностей GBM.thanksN(), lg — лига GBLG.prg().lg,
           sr — серия заданий дня, st — звёзд всего, sz — размер сохранения в тыс. символов (бюджет облака VK — см. VK_MAXCH).
     mus   {on} — музыка вкл./выкл. раз за сеанс (cfg модуля STAT берёт только th/snd/calm) и при каждом переключении.
     pl    — STAT.pl(пройдено уровней) после каждой победы (v1.4: поле pl в pause и в start следующего сеанса).
     ldf   {n, f, w} — (предохранитель загрузки в <head>) прошлая загрузка сорвалась: n — попытка, f — файл, w — net | cut | none.
   Свои события других потоков (шлют сами; сводка — hobby-analytics/stat/README.md «Гастроном буст»): seal, plan, step, dep, glass, book, card, ord,
   ret (META), lg, ss (LEAGUE), mg (MG0), md (MODE), nb, tut (NEWBIE), fest (FEST), ob/tip (OBST), fb (форма отзывов — STATGB.fb).
   Вход для других потоков: STATGB.fb(текст) — отзыв кусками (см. ниже); STATGB.prg() — переслать prg; кнопкам «Кассы» — атрибут data-st="имя".
   Старый синтаксис (var/function), без ?. ?? .at :has. */
(function(){
  'use strict';
  if(window.STATGB)return;
  if(window.GB&&GB.flag&&!GB.flag('statgb'))return;
  function S_(){return typeof STAT!=='undefined'&&STAT&&STAT.ev?STAT:null;}
  function ev(n,p){var s=S_();if(!s)return;var o={},k;for(k in p)if(p.hasOwnProperty(k)&&p[k]!==undefined&&p[k]!==null&&p[k]!=='')o[k]=p[k];try{s.ev(n,o);}catch(e){}}
  function g(){try{return typeof G!=='undefined'?G:null;}catch(e){return null;}}
  function sv(){try{return typeof S!=='undefined'?S:null;}catch(e){return null;}}
  function now(){return Date.now();}
  function $(id){return document.getElementById(id);}
  function on(id){var e=$(id);return !!(e&&e.classList.contains('on'));}
  function mOn(){try{return typeof modalOn!=='undefined'?!!modalOn:on('modal');}catch(e){return on('modal');}}
  function skNow(){try{var d=STAT._dbg();return d&&d.hdr&&d.hdr.sk||'';}catch(e){return '';}}
  function wrapFn(name,after,before){var f=window[name];if(typeof f!=='function'||f.__gbs)return false;
    var w=function(){var x;try{if(before)x=before.apply(this,arguments);}catch(e){}var r=f.apply(this,arguments);
      try{if(after)after.apply(this,[x,r].concat([].slice.call(arguments)));}catch(e){}return r;};
    w.__gbs=1;w.__orig=f;window[name]=w;return true;}
  function wrapStat(name,fn){var s=S_();if(!s||typeof s[name]!=='function'||s[name].__gbs)return;var f0=s[name];var w=function(){return fn(f0,s,arguments);};w.__gbs=1;s[name]=w;}
  function num(v){return typeof v==='number'&&isFinite(v);}
  function L(G_){return G_?G_.idx+1:undefined;}
  function mode(G_){if(!G_)return '';if(G_.mode)return String(G_.mode).slice(0,10);return G_.daily?'daily':'';}
  function left(G_){try{return G_.st.n;}catch(e){return undefined;}}

  // ---- текущая попытка: минимум терпения, застревание ----
  var cur={g:null,pm:99,n0:-1,act:0,stk:0};
  function att(){var G_=g();if(G_&&cur.g!==G_)cur={g:G_,pm:99,n0:left(G_),act:0,stk:0};return G_;}
  function patNow(G_){var m=99,i,v;try{for(i=0;i<G_.q.vis.length;i++){v=G_.q.vis[i];if(v.max<90&&v.pat<m)m=v.pat;}}catch(e){}return m;}
  function samp(){var G_=att();if(!G_)return;var m=patNow(G_);if(m<cur.pm)cur.pm=m;if((G_.angry||0)>0)cur.pm=0;}
  if(typeof GB!=='undefined'&&GB.startHook)GB.startHook.push(function(){att();});

  // ---- итог попытки: дополняем end (порядок полей = приоритет) ----
  wrapStat('end',function(f0,s,a){var r=a[0],p=a[1]||{},o={},k,G_=null;
    try{G_=att();if(G_){samp();var m=G_.mode?mode(G_):'';if(m)o.m=m;
        if(r==='win'){if(!G_.daily){var st0=sv();if(!(st0&&st0.stars&&st0.stars[G_.idx]>0))o.f=1;}if(p.st!==undefined)o.st=p.st;}
        else o.left=left(G_);
        o.mv=G_.moves||0;if(cur.pm<99)o.pm=cur.pm;if(G_.angry)o.an=G_.angry;}
      for(k in p)if(p.hasOwnProperty(k)&&o[k]===undefined)o[k]=p[k];}catch(e){o=p;}
    return f0.call(s,r,o);});

  // ---- застревание: 30 с ИГРЫ без тройки (окно, пауза, свёрнуто — не в счёт), до 3 раз за попытку ----
  var STK_S=30;
  setInterval(function(){var G_=g();if(!G_||G_.over||G_.won||!on('scr-game')||mOn()||document.hidden)return;try{if(typeof paused!=='undefined'&&paused)return;}catch(e){}
    att();samp();var n=left(G_);if(n!==cur.n0){cur.n0=n;cur.act=0;cur.sent=0;return;}
    cur.act++;if(cur.act<STK_S||cur.sent||cur.stk>=3)return;cur.stk++;cur.sent=1;
    ev('stk',{l:L(G_),t:cur.act,n:cur.stk,left:n,m:mode(G_)});},1000);
  // терпение — сразу после хода (тикает в afterMove)
  wrapFn('afterMove',function(){samp();});

  // ---- бустеры: откуда (даром / монеты / ролик) ----
  var BK=/^(undo|hint|mix|table|life)$/,pend=null;
  wrapStat('ev',function(f0,s,a){try{var n=a[0],p=a[1]||{};if(n==='spend'&&BK.test(p.k))pend={k:p.k,s:'coins',t:now()};}catch(e){}return f0.apply(s,a);});
  wrapStat('place',function(f0,s,a){try{if(BK.test(a[0]))pend={k:a[0],s:'ad',t:now()};}catch(e){}return f0.apply(s,a);});
  wrapStat('ad',function(f0,s,a){try{if(a[0]==='rew'&&a[1]!=='ok'&&a[1]!=='show'&&a[1]!=='hold'&&pend&&pend.s==='ad')pend=null;}catch(e){}return f0.apply(s,a);});
  function bst(k){var G_=att(),src='free';if(pend&&pend.k===k&&now()-pend.t<180e3)src=pend.s;pend=null;
    ev('bst',{l:L(G_),k:k,s:src,m:mode(G_)});}
  wrapStat('use',function(f0,s,a){try{if(BK.test(a[0]))bst(a[0]);}catch(e){}return f0.apply(s,a);});
  wrapStat('lvl',function(f0,s,a){try{if(a[1]==='rev')bst('life');}catch(e){}return f0.apply(s,a);});

  // ---- «Касса»: первое нажатие ----
  var wG=null,wCard=null;
  wrapFn('win',function(){var c=$('mcard');wCard=c&&c.firstElementChild;wG=g();});
  function bName(b){var z=b.closest&&b.closest('[data-gb]');var x=b.getAttribute('data-st')||b.id||'';x=x.replace(/^m(?=[A-Z0-9])/,'').toLowerCase();
    if(!b.getAttribute('data-st')&&z)x='gb:'+z.getAttribute('data-gb')+(b.id?':'+x:'');return (x||'btn').slice(0,20);}
  document.addEventListener('click',function(e){var t=e.target;if(!t||!t.closest||!wG)return;var b=t.closest('#mcard button');if(!b)return;
    var c=$('mcard');if(!mOn()||!c||c.firstElementChild!==wCard){wG=null;return;}
    var G0=wG;wG=null;ev('win_btn',{l:L(G0),b:bName(b),m:mode(G0)});},true);

  // ---- главный/карта: почему ----
  var mapN=0;
  wrapFn('openMap',null,function(o){var G_=g(),why;o=o||{};
    if(o.city!==undefined&&o.city!==null)why='city';else if(G_)why=G_.won?'win':(G_.over||G_.gbE==='lose')?'lose':'quit';else why=mapN?'nav':'boot';
    mapN++;ev('map',{why:why,l:G_?L(G_):undefined});});

  // ---- экраны: каждый заход (не только первый за сеанс); экраны буста GB.go → STAT.screen ----
  var sk0='',cnt={},lastScr='',lastT=now();
  wrapStat('screen',function(f0,s,a){var r=f0.apply(s,a);try{var n=String(a[0]).slice(0,16),sk=skNow();if(sk!==sk0){sk0=sk;cnt={};}
      if(n!==lastScr){var d=Math.round((now()-lastT)/1000);cnt[n]=(cnt[n]||0)+1;if(cnt[n]>=2&&n!=='game')ev('scr',{n:n,k:cnt[n],d:d});lastScr=n;lastT=now();}}catch(e){}return r;});
  if(typeof GB!=='undefined'&&GB.on)GB.on('screen',function(id){if(typeof id==='string'&&id.indexOf('gb-')===0){var s=S_();if(s)s.screen(id.slice(3));}});

  // ---- монеты: источники буста (общий STAT.earn их кладёт в 'oth' — оставляем, плюс расшифровка egb) ----
  var eZ=null,KNOWN=/^(lvl|ad|gift|chest|buy|quest)$/;
  wrapStat('earn',function(f0,s,a){try{var src=String(a[0]||''),n=+a[1];if(n>0&&!KNOWN.test(src)){src=src.replace(/[^a-z0-9]/gi,'').slice(0,8)||'oth';eZ=eZ||{};eZ[src]=(eZ[src]||0)+n;}}catch(e){}
    return f0.apply(s,a);});
  function earnOut(){if(!eZ)return;var p=eZ,k=Object.keys(p),i,o;eZ=null;for(i=0;i<k.length;i+=8){o={};k.slice(i,i+8).forEach(function(x){o[x]=p[x];});ev('egb',o);}}
  // свернули — расшифровка монет ДО pause модуля (слушаем на window в фазе захвата — раньше модуля STAT)
  window.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')earnOut();},true);
  window.addEventListener('pagehide',earnOut,true);

  // ---- победы: STAT.pl, открытия ----
  if(typeof GB!=='undefined'&&GB.levelHook){
    GB.levelHook.push(function(i){if(!i||i.r!=='win')return;var s=S_(),st=sv();try{if(s&&s.pl&&st)s.pl(Math.max(0,(+st.unlocked||1)-1));}catch(e){}
      if(!i.first||i.daily)return;
      try{if(i.boss)ev('unlock',{k:'city',id:Math.floor(i.idx/10)+2,l:i.l});}catch(e){}
      try{if(window.GBU&&GBU.rep){var a=GBU.rep(i.l),b=GBU.rep(i.l+1),ia=a&&typeof a==='object'?a.id:a,ib=b&&typeof b==='object'?b.id:b;if(ib!==undefined&&ib!==ia)ev('unlock',{k:'rep',id:ib,l:i.l});}}catch(e){}
      try{if(typeof AD_FROM!=='undefined'&&i.idx===AD_FROM-1)ev('unlock',{k:'daily',l:i.l});}catch(e){}});
  }
  function hookRank(){try{if(window.GBM&&GBM.on&&!hookRank.d){hookRank.d=1;GBM.on('rank',function(r){ev('unlock',{k:'rank',id:num(r)?r:(r&&r.n),l:Math.max(0,(+(sv()||{}).unlocked||1)-1)});});}}catch(e){}}

  // ---- музыка: раз за сеанс и при переключении ----
  var musK='',musV=null;
  function musNow(){var s=sv();return s&&s.music===0||s&&s.music===false?0:1;}
  function musOut(force){var mk=skNow(),v=musNow();if(!force&&mk===musK)return;musK=mk;musV=v;ev('mus',{on:v});}
  wrapFn('save',function(){if(musV!==null&&musNow()!==musV)musOut(1);});

  // ---- prg: прохождение ----
  var prgK='',prgOn=0;
  function call(o,f){try{var v=o&&typeof o[f]==='function'?o[f]():undefined;return num(v)?Math.round(v):undefined;}catch(e){return undefined;}}
  function prg(){var s=sv();if(!S_()||!s)return;prgOn=1;var dp,lg,st=0,sz,k,sr;
    try{if(window.GBM&&GBM.depList){dp=0;GBM.depList().forEach(function(d){dp+=+d.lv||0;});}}catch(e){dp=undefined;}
    try{if(window.GBLG&&GBLG.prg){var x=GBLG.prg();lg=x&&num(x.lg)?x.lg:undefined;}}catch(e){}
    try{for(k in s.stars)st+=+s.stars[k]||0;}catch(e){}
    try{sz=Math.round(JSON.stringify(s).length/1000);}catch(e){}
    try{sr=s.streak&&num(s.streak.day)?s.streak.day:0;}catch(e){}
    var p={rk:call(window.GBM,'rank'),dp:dp,al:(s.album||[]).length,bk:call(window.GBM,'thanksN'),lg:lg,sr:sr,st:st,sz:sz};
    musOut(0);
    var j=JSON.stringify(p);if(j===prgK)return;prgK=j;ev('prg',p);}
  var hidT=0;
  document.addEventListener('visibilitychange',function(){if(document.hidden){hidT=now();return;}if(prgOn&&hidT&&now()-hidT>30*60e3)setTimeout(prg,500);});

  // ---- форма отзывов «Книга жалоб и предложений» (UI — META): кусками по 120 знаков в поле m, до 5 событий fb {m, n, of} ----
  // Сервер STAT режет строки до 40 знаков, поле m — до 120 (stat/function/index.py) — поэтому кусками. Ссылки, почта и длинные числа вычищаются.
  var fbT=0;
  function fbScrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f]+/g,' ');
    t=t.replace(/\b(?:https?:\/\/|www\.)\S+/gi,'[ссылка]').replace(/\S+@\S+\.\S+/g,'[почта]').replace(/(?:\+?\d[\d\s()-]{5,}\d)/g,'#');
    return t.replace(/\s+/g,' ').trim().slice(0,600);}
  function fb(txt,opt){var t=fbScrub(txt);if(!t)return 0;if(now()-fbT<20e3)return -1;fbT=now(); /* не чаще раза в 20 с */
    var parts=[],i;for(i=0;i<t.length&&parts.length<5;i+=120)parts.push(t.slice(i,i+120));
    var G_=g(),st=sv(),x=opt&&typeof opt==='object'?opt:{};
    for(i=0;i<parts.length;i++)ev('fb',{m:parts[i],n:i+1,of:parts.length,k:i===0&&x.k?String(x.k).slice(0,12):undefined,l:i===0&&st?Math.max(0,(+st.unlocked||1)-1):undefined});
    try{var s=S_();if(s&&s.flush)s.flush();}catch(e){}
    return parts.length;}

  // ldf: прошлый запуск не загрузился (предохранитель в <head> перезагрузил) — что и сколько раз; шлём после удачного запуска
  function ldf(){try{if(document.getElementById('ldfail'))return;var x=sessionStorage.getItem('gbldlog');if(!x)return;sessionStorage.removeItem('gbldlog');var o=JSON.parse(x)||{};ev('ldf',{n:+o.n||1,f:o.f,w:o.w});}catch(e){}}
  function boot(){hookRank();setTimeout(prg,3000);setTimeout(ldf,1500);}
  if(typeof GB!=='undefined'&&GB.isReady)boot();else if(typeof GB!=='undefined'&&GB.on)GB.on('ready',boot);else window.addEventListener('load',boot);

  window.STATGB={fb:fb,prg:prg,_set:function(o){if(o&&o.stk)STK_S=+o.stk;},_dbg:function(){return {cur:{pm:cur.pm,act:cur.act,stk:cur.stk},pend:pend,cnt:cnt,prg:prgK,eZ:eZ};}};
})();
