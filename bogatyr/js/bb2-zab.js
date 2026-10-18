/* ===== bb2-zab.js — ДОГОВОР РЕКОРДОВ «Спор богатырей» (общая рамка ловкостных и старых Забав). Поток ZAB, 13.10.2026. =====
   Журнал: hobby-analytics/release-i/bogatyr-boost2/logs/ZAB.md. На старте — только этот файл (вызовы и заглушки); окно итогов, соседи,
   старт-карточка, счёт на экране, «Привал» — лениво в js/bb2-zab-ui.js (набор 'zrec'). Старый синтаксис: без ?. ?? .finally.

   ДОГОВОР ДЛЯ ЛОВКОСТНЫХ (ZREC.add, файл игры, ZREC.play, API, событие шины 'zab', флаги, STAT) — в шапке js/bb2-zab-ui.js (сюда не переносить: вес старта). */
var ZREC=(function(){
  var Z={v:1},A={},ORD=[],CF={},IDK=/^[a-z][a-z0-9]{1,11}$/;
  function ob(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:null;}
  function num(v){v=+v;return isFinite(v)&&v>0?Math.round(v):0;}
  Z.on=function(){return BB2.on('zrec');};

  /* ---------- S.bb2.zab: r{id:{b рекорд (только ловкостные; у старых — S.zab.b), n партий, m лучшая медаль, a счёт Алёши, ad день Алёши, w0 неделя первой партии, l:1 «меньше — лучше»}},
     x{id:{…своё игры}}, pv — побед с прошлого привала, pn — привалов показано, wl — поражений всего, wn — разминок сыграно, t1 — пояснение экрана Забав прочитано ---------- */
  var SC=['pv','pn','wl','wn','t1'],RK=['b','n','m','a','ad','w0','l'];
  function fixR(o){var r={},i,v;for(i=0;i<RK.length;i++){v=num(o&&o[RK[i]]);if(v)r[RK[i]]=v;}if(r.m>3)r.m=3;if(r.l)r.l=1;return r;}
  function fix(z){var k,s,i,n;if(!ob(z.r))z.r={};for(k in z.r){if(!IDK.test(k))delete z.r[k];else z.r[k]=fixR(z.r[k]);}
    if(!ob(z.x))z.x={};for(k in z.x){s='';try{s=JSON.stringify(z.x[k]);}catch(e){}if(!IDK.test(k)||!ob(z.x[k])||s.length>60)delete z.x[k];}
    for(i=0;i<SC.length;i++){n=num(z[SC[i]]);if(n)z[SC[i]]=n;else delete z[SC[i]];}for(k in z)if(k!=='r'&&k!=='x'&&SC.indexOf(k)<0)delete z[k];
    for(k in z.r){n=0;for(s in z.r[k])n++;if(!n)delete z.r[k];}n=0;for(k in z.r)n++;if(!n)delete z.r;n=0;for(k in z.x)n++;if(!n)delete z.x;return z;}   /* нет поля = «как у новичка»: нули и пустое не храним */
  function merge(a,b){var k,p,q,i;a=fix(a);b=fix(JSON.parse(JSON.stringify(b)));a.r=a.r||{};a.x=a.x||{};b.r=b.r||{};b.x=b.x||{};
    for(k in b.r){p=a.r[k];q=b.r[k];if(!p){a.r[k]=q;continue;}
      if(p.l||q.l){p.l=1;p.b=p.b&&q.b?Math.min(p.b,q.b):p.b||q.b||0;}else p.b=Math.max(p.b||0,q.b||0);
      p.n=Math.max(p.n||0,q.n||0);p.m=Math.max(p.m||0,q.m||0);if((q.ad||0)>(p.ad||0)){p.ad=q.ad;p.a=q.a;}
      p.w0=p.w0&&q.w0?Math.min(p.w0,q.w0):p.w0||q.w0||0;a.r[k]=fixR(p);}
    for(k in b.x)a.x[k]=a.x[k]?BB2.mx(a.x[k],b.x[k]):b.x[k];
    for(i=0;i<SC.length;i++)a[SC[i]]=Math.max(a[SC[i]]|0,b[SC[i]]|0);return fix(a);}
  BB2.save('zab',{fix:fix,merge:merge});
  Z.s=function(){return BB2.s('zab');};
  Z.rec=function(id){var z=Z.s();if(!z.r)z.r={};if(!z.r[id])z.r[id]={};return z.r[id];};
  Z.inc=function(k,d){var z=Z.s();z[k]=(z[k]|0)+(d==null?1:d);return z[k];};
  Z.x=function(id){var z=Z.s();if(!z.x)z.x={};if(!ob(z.x[id]))z.x[id]={};return z.x[id];};
  Z.touch=function(){try{save();}catch(e){}};

  /* ---------- игры ---------- */
  Z.add=function(id,c){if(!IDK.test(id)||A[id]||!ob(c)||!BB2.on('lov-'+id))return Z;c.id=id;c.lov=1;A[id]=c;ORD.push(id);
    BB2.lazy('lov-'+id,[].concat(c.f||[]),function(){return typeof ZAB!=='undefined'&&!!ZAB.by[id];});return Z;};
  Z.old=function(id,c){c.id=id;CF[id]=c;};   /* старые Забавы со счётом — таблица в bb2-zab-ui.js */
  Z.info=function(id){return A[id]||CF[id]||null;};
  Z.ids=function(){return ORD.slice();};
  Z.has=function(id){return !!Z.info(id)&&Z.on();};
  Z.name=function(id){var c=Z.info(id);if(c&&c.n)return L(c.n[0],c.n[1]||c.n[0]);try{return zabName(ZAB.by[id]);}catch(e){return id;}};
  Z.isOpen=function(id){var c=A[id];return !!c&&Z.on()&&(S.runs|0)>=(c.from==null?3:c.from);};
  Z.best=function(id){var c=Z.info(id);if(c&&c.lov)return Z.rec(id).b|0;try{return S.zab.b[id]|0;}catch(e){return 0;}};
  Z.medal=function(id){var r=Z.s().r;r=r&&r[id];return r?r.m|0:0;};
  Z.tier=function(id,sc){var c=Z.info(id),m=c&&c.md,t=0,i;if(!m||!(sc>0))return 0;for(i=0;i<3;i++)if(c.less?sc<=m[i]:sc>=m[i])t=i+1;return t;};
  Z.unit=function(id,n){var c=Z.info(id),u=c&&c.u,e=c&&c.ue||[];n=Math.round(+n||0);return fmtNum(n)+(u?' '+plu(n,u[0],u[1],u[2],e[0]||u[0],e[1]||e[0]||u[2]):'');};
  function wkN(){try{return weekNo();}catch(e){return 0;}}

  /* ---------- догрузка и запуск ---------- */
  BB2.lazy('zrec',['js/bb2-zab-ui.js'],function(){return !!Z.ui;});
  Z.load=function(){var li=BB2.lazyInfo(),p=li.zab&&typeof ZAB_OPEN==='undefined'?BB2.need('zab'):Promise.resolve();
    return p.then(function(){return BB2.need('zrec');});};
  Z.play=function(id,opt){opt=opt||{};return Z.load().then(function(){return A[id]?BB2.need('lov-'+id):null;}).then(function(){
      var g=ZAB.by[id];if(!g)throw new Error('zrec: no game '+id);var paid=0;try{paid=ZB().d.p[id]|0;}catch(e){}
      var o={};for(var k in opt)o[k]=opt[k];if(o.train==null)o.train=!!paid;if(!o.mode)o.mode=g.kind==='week'?'week':g.kind==='fest'?'fest':'day';
      if(o.src)window.ZAB_SRC=o.src;if(typeof hideModal==='function'&&!o.keep)hideModal();return ZAB_OPEN(id,o);},
    function(e){if(typeof toast==='function')toast(L('Не загрузилось — нажми ещё раз','Couldn’t load — tap again'));throw e;});};

  /* ---------- крючки ядра Забав (js/zab-core.js: ZAB_OPEN → pre, ZAB_FIN → put/rw, zabFinUI → fin) ---------- */
  Z.pre=function(g,o,opt){if(!Z.on())return;Z.load().then(null,function(){});var c=Z.info(g.id);o.again=opt.again|0;o.vs=ob(opt.vs)||null;
    o.unit=function(n){return Z.unit(g.id,n);};if(c){o.first=Z.rec(g.id).n?0:1;if(c.lov)o.best=Z.best(g.id);}};
  Z.rw=function(g){return g.kind==='lov'&&Z.on()?{sl:BB2.n('zab.lovSl',[0,4,8,12]) /*ECO?*/,tr:[0,0,0,0]}:null;};
  Z.put=function(g,o,r){var c=Z.info(g.id);if(!c||!Z.on())return null;var id=g.id,q=Z.rec(id),sc=Math.max(0,Math.round(+r.score||0)),prev=Z.best(id);
    if(r.tier==null||c.lov&&r.tier===undefined)r.tier=Z.tier(id,sc);var t=Math.max(0,Math.min(3,r.tier|0));
    var ok=!r.fail&&sc>0&&(c.lov||!g.noRec&&t>=1),rec=ok&&(c.less?!prev||sc<prev:sc>prev),m0=q.m|0,first=!q.n;
    if(rec){if(c.lov){q.b=sc;if(c.less)q.l=1;}else try{ZB().b[id]=sc;}catch(e){}}
    q.n=(q.n|0)+1;if(!q.w0)q.w0=wkN();if(ok&&t>m0)q.m=t;
    return {rec:!!rec,prev:prev,best:rec?sc:prev,first:first,medal:q.m|0,up:(q.m|0)>m0,ok:!!ok,sc:sc};};
  Z.fin=function(g,o,out,opt){if(!Z.on())return false;var c=ZAB.cur,zr=out.zr,t=c?Math.round((Date.now()-c.t0)/1000):0,id=g.id;
    if(zr&&Z.ui)try{Z.place(id,zr,out.score);}catch(e){}
    if(zr&&zr.rec)BB2.stat('zab',{a:'rec',id:id,sc:out.score,pl:zr.place|0});if(zr&&zr.up)BB2.stat('zab',{a:'medal',id:id,m:zr.medal});
    BB2.ev('zab',{id:id,sc:out.score,tier:out.tier,rec:out.rec?1:0,medal:zr?zr.medal:0,up:zr&&zr.up?1:0,train:out.train?1:0,src:String(ZAB.src||''),t:t,lov:g.kind==='lov'?1:0,n:zr?Z.rec(id).n|0:0});
    if(opt.quiet){ZAB_CLOSE();if(opt.back)try{opt.back(out);}catch(e){}return true;}
    if(!zr||!Z.ui||g.noScore)return false;
    try{return Z.ui(g,o,out,opt)!==false;}catch(e){try{console.warn('zrec ui',e);}catch(x){}return false;}};
  /* ---------- «Привал» на карте: раз в 3 победы в главах «Выступить» сначала ведёт к костру (пропуск — одно нажатие). Окно — Z.prival в ленивой части.
     Разминка после поражения: после 1-го и каждого 3-го поражения в главе — кнопка в окне итогов (с первого похода). Под ?bot молчат (как сила забав). ---------- */
  function botQ(){return /[?&]bot/.test(location.search)&&!window.__zabBot;}
  function chRun(g){return !!g&&!g.endless&&!g.daily&&!g.weekly;}
  function goOn(chi,o){startRun(chi,o.endless,o.wk,o.dr);}   /* не BB2.go: окна «В поход» других потоков должны получить свой черёд (счётчик привала уже сброшен) */
  /* ok2 (17.10): новичку привал — после 6 походов (флаг nvq), чтобы не шёл одной пачкой с первым судом */
  Z.pvDue=function(){return BB2.on('prival')&&!botQ()&&(S.runs|0)>=3&&!(BB2.on('nvq')&&(S.runs|0)<7)&&(Z.s().pv|0)>=BB2.n('zab.pvEvery',3) /*ECO?*/;};
  BB2.hook('win',function(g){if(chRun(g))Z.inc('pv');});
  BB2.hook('march',function(chi,o){o=o||{};if(typeof ZAB!=='undefined'&&ZAB.cur)return true;   /* забава на экране (Enter на карте) — в поход не уходим */
    if(o.endless||o.wk||o.dr||!Z.pvDue())return;Z.s().pv=0;Z.inc('pn');
    Z.load().then(function(){if(!Z.prival||!Z.prival(chi,o))goOn(chi,o);},function(){goOn(chi,o);});return true;},1);
  var warm=0;
  BB2.hook('lose',function(g){warm=0;if(!chRun(g)||!BB2.on('warm')||botQ())return;var n=Z.inc('wl');if(n===1||n%3===0){warm=1;Z.load().then(function(){var m=document.getElementById('mBody');if(warm===1&&m&&m.getAttribute('data-w')==='result'&&document.getElementById('modal').classList.contains('on'))Z.warm(m,function(){warm=2;},1);},function(){});}});
  BB2.hook('run',function(){warm=0;});
  BB2.hook('modal',function(k,m){if(k==='result'&&warm&&Z.warm)try{Z.warm(m,function(){warm=2;},warm);}catch(e){}});
  BB2.hook('chInfo',function(slot,sel){if(sel&&Z.pvDue())BB2.put(sel,'end','<div class="sub" style="text-align:center;margin:4px 0 0;font-size:14px">🔥 '+L('У дороги привал: костёр ждёт','A campfire awaits by the road')+'</div>','zabPvChip');});
  return Z;})();
