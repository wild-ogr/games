/* ===== bb2-core.js — каркас супер-буста в2 (13.10.2026, поток CORE). Справка — CLAUDE.md, раздел «bb2». =====
   На старте, после data.js. Старый синтаксис: без ?. ?? .finally. Всё новое в игре идёт через этот файл:
   BB2.on(флаг) · BB2.need/bg/lazy (догрузка) · BB2.save/s (сохранение S.bb2.<поток>) · BB2.hook/hk/ev/sub (крючки и шина) · BB2.n (числа ECO) */
/* ВЫКЛЮЧАТЕЛЬ ОДНОЙ СТРОКОЙ: имена флагов через запятую ('um,chudo') — выключены; '*' — выключен весь буст (игра как v24.1) */
var BB2_OFF='';
var BB2=(function(){
  var B={v:1},H={},SV={},LZ={},SEEN={},warnN=0;
  function warn(k,x){if(++warnN<=8)try{console.warn('bb2 '+k+': '+(x&&x.message||x));}catch(e){}}
  function ob(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:null;}
  B.ob=ob;

  /* ---------- 1. Флаги. BB2.on('имя') → true/false. Не названный нигде флаг ВКЛЮЧЁН.
     Выключить: строка BB2_OFF выше или адрес ?bb2=-um,-chudo. ?bb2=0 — выключить всё; ?bb2=0,um — всё, кроме um; ?bb2=1 — включить всё (сильнее BB2_OFF). */
  var FQ={},fAll=0;
  (function(){var i,t,a=String(BB2_OFF||'').split(',');
    for(i=0;i<a.length;i++){t=a[i].replace(/\s/g,'');if(t==='*')fAll=-1;else if(t)FQ[t]=-1;}
    var m=/[?&]bb2=([^&#]*)/.exec(location.search);if(!m)return;a=decodeURIComponent(m[1]).split(',');
    for(i=0;i<a.length;i++){t=a[i].replace(/\s/g,'');if(!t)continue;
      if(t==='0'||t==='off'){fAll=-1;FQ={};}else if(t==='1'||t==='all'){fAll=1;FQ={};}
      else if(t.charAt(0)==='-')FQ[t.slice(1)]=-1;else FQ[t.charAt(0)==='+'?t.slice(1):t]=1;}})();
  B.on=function(n){SEEN[n]=1;var q=FQ[n];if(q)return q>0;return fAll>=0;};
  B.opt=function(n){SEEN[n]=1;return FQ[n]===1;}; /* флаг «только по просьбе»: включён, лишь если назван в адресе (?bb2=lazyall) */
  B.flags=function(){var o={},k;for(k in SEEN)o[k]=B.on(k);return o;};
  B.off=function(n){if(FQ[n]!==1)FQ[n]=-1;}; /* VKT «Пульт владельца»: выключить флаг на ходу (явное ?bb2=+имя сильнее) */
  B.nvq=function(){return B.on('nvq')&&((typeof S!=='undefined'&&S&&+S.runs)||0)<6;}; /* ok2 (17.10, уроки Зины): «тихие» первые 5 походов новичка — после победы без второстепенных окон (суд, привал откладываются, награды не теряются) */

  /* ---------- 2. Крючки и шина событий (одна таблица имён).
     BB2.hook('имя',fn) / BB2.sub — подписка; BB2.hk('имя',a,b,c) — вызов из игры, вернёт первый ответ не undefined; BB2.ev — то же, «сообщить о событии».
     Ошибка в подписчике — console.warn (до 8 раз), игра идёт дальше. Список имён — CLAUDE.md «bb2». */
  /* Порядок подписчиков: по «очереди» (третий довод: число, меньше — раньше; по умолчанию 50; true = 0), при равной — кто раньше подписался.
     Три вида крючков:
     • обычные — зовутся все, ответ берётся первый не undefined;
     • «труба» (hurt): значение первого довода идёт через всех по очереди — число в ответе заменяет его для следующих, false останавливает цепочку (удар отменён);
       подписчик ВСЕГДА получает уже изменённый предыдущими урон. Очередь по договору: 20 — уклонение/«Авось» (может отменить), 40 — щиты, 60 — множители урона, 80 — наблюдатели;
     • «хоть один» (down, tap, pick, march, morning): идут по очереди до первого ответа true — остальные НЕ зовутся (второй оберег не тратится зря), итог true. */
  var MODE={hurt:1,down:2,tap:2,pick:2,march:2,morning:2};
  B.hook=B.sub=function(n,fn,pr){if(typeof fn!=='function')return;var a=H[n]||(H[n]=[]),i;fn.bb2p=pr===true?0:typeof pr==='number'?pr:50;
    for(i=a.length;i>0&&a[i-1].bb2p>fn.bb2p;i--);a.splice(i,0,fn);};
  B.unhook=function(n,fn){var a=H[n],i=a?a.indexOf(fn):-1;if(i>=0)a.splice(i,1);};
  B.hk=B.ev=function(n,a,b,c){var l=H[n];if(!l)return;var r,q,i,m=MODE[n];
    if(m===1){for(i=0;i<l.length;i++)try{q=l[i](a,b,c);if(q===false)return false;if(typeof q==='number'&&q===q){a=q;r=q;}}catch(x){warn(n,x);}return r;}
    if(m===2){for(i=0;i<l.length;i++)try{if(l[i](a,b,c)===true)return true;}catch(x){warn(n,x);}return;}
    for(i=0;i<l.length;i++)try{q=l[i](a,b,c);if(r===undefined)r=q;}catch(x){warn(n,x);}
    return r;};
  B.has=function(n){return !!(H[n]&&H[n].length);};

  /* ---------- 3. Сохранение: всё новое — только в S.bb2.<поток>.
     BB2.save('um',{fix:function(o){…вернуть исправный объект…},merge:function(мой,облако){…вернуть слитый…}}) — ОБЯЗАТЕЛЬНО оба (проверка сборки).
     BB2.s('um') — объект потока (каждый раз брать заново: после облака S заменяется). Готовое слияние «максимум/объединение» — BB2.mx. */
  function root(){if(typeof S==='undefined'||!S)return null;if(!ob(S.bb2))S.bb2={};return S.bb2;}
  function fix1(k){var r=root();if(!r)return;var d=SV[k],v=r[k];
    try{v=d&&d.fix?d.fix(ob(v)||{}):ob(v)||{};}catch(x){warn('fix '+k,x);v=ob(v)||{};}
    r[k]=ob(v)||{};}
  function fixAll(){var r=root();if(!r)return;for(var k in SV)fix1(k);for(k in r)if(!ob(r[k]))delete r[k];}
  B.mx=function(a,b){ /* числа — максимум; объекты — объединение (рекурсивно); массивы — длинный; строки/прочее — своё, если есть */
    if(typeof a==='number'&&typeof b==='number')return Math.max(a,b);
    if(ob(a)&&ob(b)){var o={},k;for(k in a)o[k]=k in b?B.mx(a[k],b[k]):a[k];for(k in b)if(!(k in a))o[k]=b[k];return o;}
    if(Array.isArray(a)&&Array.isArray(b))return b.length>a.length?b:a;
    return a===undefined||a===null||a===''?b:a;};
  B.save=function(k,d){SV[k]={fix:d&&d.fix,merge:d&&d.merge};if(!d||typeof d.fix!=='function'||typeof d.merge!=='function')warn('save '+k,'fix+merge required');fix1(k);};
  B.s=function(k){var r=root();if(!r)return {};if(!ob(r[k]))fix1(k);return r[k];};
  function mergeAll(d,o){var db=ob(d&&d.bb2);if(!db||!ob(o))return;var lb=ob(o.bb2)||(o.bb2={}),k,m;
    for(k in db){if(!ob(db[k]))continue;m=SV[k]&&SV[k].merge;
      if(!ob(lb[k])){lb[k]=JSON.parse(JSON.stringify(db[k]));continue;}
      try{lb[k]=ob(m?m(lb[k],db[k]):B.mx(lb[k],db[k]))||lb[k];}catch(x){warn('merge '+k,x);}}
    for(k in SV)if(SV[k].fix)try{lb[k]=ob(SV[k].fix(ob(lb[k])||{}))||{};}catch(x){warn('fix '+k,x);}}
  B.saveSize=function(){var r=root(),o={},k,t=0;if(!r)return o;for(k in r){o[k]=JSON.stringify(r[k]).length;t+=o[k];}o._all=t;return o;};
  B.saveKeys=function(){var o={},k;for(k in SV)o[k]=(typeof SV[k].fix==='function'?1:0)+(typeof SV[k].merge==='function'?2:0);return o;}; /* 3 = обе части есть */

  /* ---------- 4. Догрузка по требованию.
     BB2.lazy('zab',['js/zab-core.js',…],function(){return typeof zabPlay==='function';}) — описать набор (третий довод — «уже загружено?», необязателен).
     BB2.need('zab') → Promise: грузит по порядку, каждый файл до 3 попыток (пауза 0,8 и 2,5 с), потом тихо сдаётся (reject) — игра живёт,
     следующий вызов need пробует заново. BB2.bg('zab') — то же в фоне: по одному файлу с передышкой, не лезет в разгар толпы; ошибок не бросает.
     Скрипты помечены data-lazy — предохранитель загрузки (index.html) их пропускает. Просто <script src> посреди игры НЕЛЬЗЯ. */
  var GAP=[800,2500];
  function stat(n,o){try{if(typeof STAT!=='undefined'&&STAT.ev)STAT.ev(n,o);}catch(e){}}
  B.stat=stat;
  function busy(){try{return typeof G!=='undefined'&&G&&!G.over&&!G.paused&&(G.en&&G.en.length>140||G.bossIn>0);}catch(e){return false;}}
  function load1(src,n){return new Promise(function(ok,no){var s=document.createElement('script'),done=0,t;
    function fin(y){if(done)return;done=1;clearTimeout(t);if(y)ok();else{try{s.parentNode.removeChild(s);}catch(e){}no(new Error('lazy '+src));}}
    s.async=false;s.setAttribute('data-lazy','1');s.onload=function(){fin(1);};s.onerror=function(){fin(0);};
    s.src=src+(n?(src.indexOf('?')<0?'?':'&')+'r='+n:'');t=setTimeout(function(){fin(0);},20000);document.head.appendChild(s);});}
  function loadTry(src,st){var n=0;return new Promise(function(ok,no){(function go(){load1(src,n).then(function(){st.a=Math.max(st.a,n+1);ok();},function(e){
    if(n>=GAP.length){st.a=n+1;no(e);return;}setTimeout(go,GAP[n++]);});})();});}
  function wait(ms){return new Promise(function(ok){setTimeout(ok,ms);});}
  function inRun(){try{return typeof G!=='undefined'&&!!G;}catch(e){return false;}}
  function calm(d){return new Promise(function(ok){var n=0;(function q(){if(d.fast||(d.menu?!inRun()&&lateOk():!busy()&&!hold1()||++n>60))ok();else setTimeout(q,d.menu?250:500);})();});} /* набор menu:1 выполняется только в меню (ждёт конца похода сколько угодно) */
  function hold1(){try{return B.on('fstl')&&typeof G!=='undefined'&&!!G&&!!G.first&&!G.over&&G.t<8;}catch(e){return false;}} /* BG-FIRST 29.10: фоновые наборы (чудеса, богатыри, дела…) не выполняются в первые 8 с первого похода — без подвисания на старте; выключить ?bb2=-fstl */
  var rdT=0;function lateOk(){try{return S.runs>0||Date.now()-rdT>4000;}catch(e){return true;}} /* новичка первые 4 с не трогаем: он уходит в первый поход */
  function loadSeq(d,bg){var i=0,f=d.f;return new Promise(function(ok,no){(function nx(){if(i>=f.length){ok();return;}
    var src=f[i++],p=bg&&!d.fast?calm(d):Promise.resolve();p.then(function(){return loadTry(src,d);}).then(function(){if(bg&&!d.fast)wait(d.menu?30:B.bgGap).then(nx);else nx();},no);})();});}
  B.bgGap=250;
  B.lazy=function(n,files,test){if(!LZ[n])LZ[n]={f:[],st:0,a:0,p:null};LZ[n].f=files||[];LZ[n].t=test;return B;};
  function need(n,bg){var d=LZ[n];if(!d)return Promise.reject(new Error('bb2: no lazy set '+n));
    if(d.st===2)return Promise.resolve();
    try{if(d.t&&d.t()){d.st=2;return Promise.resolve();}}catch(e){}
    if(d.st===1){if(!bg)d.fast=1;return d.p;}
    var t0=Date.now();d.st=1;d.a=0;
    d.p=loadSeq(d,bg).then(function(){d.st=2;d.p=null;stat('lazy',{n:n,ms:Date.now()-t0,a:d.a,ok:1,bg:bg?1:0});B.hk('lazy',n,true);},
      function(e){d.st=0;d.p=null;stat('lazy',{n:n,ms:Date.now()-t0,a:d.a,ok:0,bg:bg?1:0});B.hk('lazy',n,false);throw e;});
    return d.p;}
  /* ---------- 4б. Лёгкий старт (флаг 'lazy'): BB2.inc('набор',[файлы]) в index.html вместо тегов <script src>.
     Обычный игрок — файлы подключаются тут же, по порядку, как раньше (document.write). Новичок (сохранения ещё нет) — набор откладывается:
     файлы тихо скачиваются во время первого похода и выполняются в меню (BB2.bg, menu:1), потом вкладка перерисовывается.
     Всем сразу (проверка): ?bb2=lazyall. Третий довод true — «не нужен вовсе» (английские тексты в VK): при включённом lazy не грузится никогда. */
  var LATE=[],SYNC=/[?&](bot|promo|zab|fest|festday|i18ncheck|demo)\b/;
  B.lz=(function(){try{if(!B.on('lazy'))return false;if(B.opt('lazyall'))return true;return typeof S!=='undefined'&&!!S&&!S.ts&&!S.runs&&!SYNC.test(location.search);}catch(e){return false;}})();
  B.inc=function(n,files,never,flag){var i; /* flag — свой выключатель набора (темы земель: lazyth) */
    if((never?B.on('lazy'):B.lz)&&(!flag||B.on(flag))){B.lazy(n,(LZ[n]?LZ[n].f:[]).concat(files));LZ[n].menu=1;if(!never&&LATE.indexOf(n)<0)LATE.push(n);return;}
    for(i=0;i<files.length;i++)document.write('<script src="'+files[i]+'"><\/script>');};
  function lateDone(){try{if(typeof fixSave==='function')fixSave();}catch(e){warn('late fix',e);}
    try{if(!inRun()&&typeof openTab==='function'&&typeof curTab!=='undefined')openTab(curTab);}catch(e){warn('late tab',e);}B.hk('late');}
  var lateI=0,lateRun=0;
  function lateGo(){if(lateRun||lateI>=LATE.length)return;lateRun=1;B.bg(LATE[lateI]).then(function(y){lateRun=0;
    if(!y){setTimeout(lateGo,15000);return;}lateI++;lateDone();lateGo();});} /* после каждого набора — починка сохранения и перерисовка вкладки (земли на карте появляются сразу) */
  function lateFetch(){var a=[],i,k;for(i=0;i<LATE.length;i++)a=a.concat(LZ[LATE[i]].f);if(typeof fetch!=='function')return;
    k=0;(function nx(){if(k>=a.length)return;var u=a[k++];try{fetch(u).then(nx,nx);}catch(e){nx();}})();}
  /* BB2.late('um') — набор потока (описан BB2.lazy) сам догрузится в меню в фоне у ВСЕХ игроков: так код новинки не весит на старте.
     Поход, начатый до догрузки, идёт без новинки (её подписчики ещё не стоят) — это нормально. Второй довод true — в начало очереди. */
  B.late=function(n,first){var d=LZ[n];if(!d||d.st===2||LATE.indexOf(n)>=0)return;d.menu=1;if(first)LATE.splice(lateI+(lateRun?1:0),0,n);else LATE.push(n);if(rdT)setTimeout(lateGo,0);};
  /* карта: пока земли не приехали, «передовая» глава считалась по неполной кампании — после догрузки земель ставим настоящую (если игрок сам не выбрал другую) */
  var thF=-1;B.hook('map',function(){try{if(LZ.th&&!B.ready('th'))thF=mapFront();}catch(e){}});
  B.hook('lazy',function(n,y){try{if(n==='th'&&y&&thF>=0&&mapSel===thF)mapSel=mapFront();}catch(e){}},0);
  B.hook('cloud',function(){try{if(LZ.th&&!B.ready('th')&&S.runs>0&&!inRun()){LZ.th.fast=1;B.need('th').then(function(){lateDone();},function(){});}}catch(e){}});
  B.hook('ready',function(){rdT=Date.now();if(!LATE.length)return;setTimeout(lateGo,300);setTimeout(lateFetch,1500);});
  B.need=function(n){return need(n,0);};
  /* BB2.after('meta',fn) — выполнить, когда набор загружен: сразу, если уже есть; иначе после догрузки (набор «только в меню» дождётся меню).
     ВАЖНО: очередь живёт в памяти. Купленное/заработанное, что выдаёт догружаемый модуль, сначала записать в своё S.bb2.<поток> (долг),
     а в fn — выдать и стереть долг; при входе вызвать BB2.after ещё раз — тогда закрытая вкладка ничего не съест. */
  B.after=function(n,fn){var d=LZ[n];if(!d||B.ready(n)){try{fn();}catch(x){warn('after '+n,x);}return;}
    (d.q||(d.q=[])).push(fn);(d.menu?B.bg(n):B.need(n).then(function(){},function(){}));};
  B.hook('lazy',function(n,ok){var d=LZ[n],q,i;if(!ok||!d||!d.q)return;q=d.q;d.q=null;for(i=0;i<q.length;i++)try{q[i]();}catch(x){warn('after '+n,x);}},0);
  B.bg=function(n){return need(n,1).then(function(){return true;},function(){return false;});};
  B.ready=function(n){var d=LZ[n];if(!d)return false;if(d.st===2)return true;try{if(d.t&&d.t()){d.st=2;return true;}}catch(e){}return false;};
  B.lazyInfo=function(){var o={},k;for(k in LZ)o[k]={st:B.ready(k)?2:LZ[k].st,n:LZ[k].f.length};return o;};
  /* кнопка раздела, который ещё грузится: BB2.open('zab',function(){zabOpen();},кнопка) — полоска ожидания/«нажми ещё раз» текстом на кнопке */
  B.open=function(n,fn,btn,txt){if(B.ready(n)){fn();return;}var old=btn&&btn.innerHTML;
    if(btn){btn.disabled=true;btn.innerHTML=txt||L('Загружаю…','Loading…');}
    B.need(n).then(function(){if(btn){btn.disabled=false;btn.innerHTML=old;}fn();},function(){if(btn){btn.disabled=false;btn.innerHTML=old;}
      if(typeof toast==='function')toast(L('Не загрузилось — нажми ещё раз','Couldn’t load — tap again'));});};

  /* ---------- 5. Числа экономики: только из договора js/bb2-eco.js (BB2E). BB2.n('ev.quest.gold',100) — число по пути; нет в договоре → запасное (и пометка в BB2.miss) */
  B.miss={};
  B.n=function(path,def){var o=typeof BB2E==='object'?BB2E:null,p=path.split('.'),i;for(i=0;o&&i<p.length;i++)o=o[p[i]];
    if(o===undefined||o===null){B.miss[path]=def;return def;}return o;};

  /* ---------- 6. Гнёзда окон: BB2.put(окно,'top'|'btns'|'end',html,id) — вставить свой блок в окно (после заголовка / перед кнопками / в конец).
     Блок с тем же id заменяется. Вернёт элемент. Окно приходит в крючке 'modal' (вид, элемент). */
  B.put=function(m,where,html,id){if(!m)return null;var old=id&&m.querySelector('#'+id),d=document.createElement('div');
    d.className='bb2s';if(id)d.id=id;d.innerHTML=html;if(old){old.parentNode.replaceChild(d,old);return d;}
    var a=where==='top'?m.querySelector('h3'):where==='btns'?m.querySelector('.btns'):null;
    if(a&&where==='top')a.parentNode.insertBefore(d,a.nextSibling);else if(a)a.parentNode.insertBefore(d,a);else m.appendChild(d);return d;};
  /* начать поход в обход крючка 'march' (после своего окна «В поход») */
  B.go=function(chi,endless,wk,dr){B.going=1;try{startRun(chi,endless,wk,dr);}finally{B.going=0;}};

  /* ---------- 7. Старые крючки меты (META_MODS) → те же имена шины: run, kill, end, frame, draw, st, metaTab, vil, today, chips, x2 */
  if(typeof META_MODS!=='undefined')META_MODS.push({id:'bb2',
    RUN:function(g){B.hk('run',g);},KILL:function(e){if(H.kill)B.hk('kill',e);},END:function(g,w){B.win=!!w;B.hk('end',g,w);B.hk(w?'win':'lose',g);},
    FRAME:function(dt,g){if(H.frame)B.hk('frame',dt,g);},DRAW:function(c,g){if(H.draw)B.hk('draw',c,g);},ST:function(st){if(H.st)B.hk('st',st);},
    TAB:function(t){return B.hk('metaTab',t);},VIL:function(el){B.hk('vil',el);},TODAY:function(tl){B.hk('today',tl);},CHIPS:function(a){B.hk('chips',a);},
    X2:function(g,m){B.hk('x2',g,m);},FIX:function(){fixAll();},MERGE:function(d,o){mergeAll(d,o);}});
  /* золото: STAT.earn(откуда,сколько) и STAT.ev('spend',{k,c}) → события шины 'earn'(откуда,сколько) и 'spend'(на что,сколько) */
  try{if(typeof STAT!=='undefined'){var fe=STAT.earn,fv=STAT.ev;
    if(typeof fe==='function')STAT.earn=function(a,b){if(H.earn)B.hk('earn',a,b);return fe.apply(STAT,arguments);};
    if(typeof fv==='function')STAT.ev=function(n,o){if(n==='spend'&&H.spend&&o)B.hk('spend',o.k,o.c);return fv.apply(STAT,arguments);};}}catch(e){}
  /* ---------- 8. Статистика буста (STAT v1.6; флаг 'stat2'). События (≤8 полей, коды короткие):
     mv1 {t,ms,k}  — первое движение богатыря в первом походе (t — секунда похода, ms — от открытия страницы, k: p палец/мышь, k клавиши)
     pls {t,lv,hp,k,mv,w} — «пульс» раз в 10 с в первом походе (hp — % здоровья, k — одолено, mv — вёл ли богатыря за эти 10 с, w — открыто окно)
     rt  {t,l,lv,hp,f,mv,w} — секунда похода в момент ухода/сворачивания (рядом с pause, в той же пачке); l — место главы, f — первый поход
     up  {lv,t,p,a,b,c,d,rr} — окно уровня: что предложили (a…d) и что взяли (p; '-' — пропуск), rr — был перебор; не больше 25 за поход
     evo {w,t,n} — эволюция (w — оружие, n — какая по счёту в походе) · boss {a:in|kill|lose,b,t,hp,l[,bh]} · die {by,t,lv,n,b,l} — богатырь пал (n — какой раз)
     lazy {n,ms,a,ok,bg} — догрузка (раздел 4) · slow — переход дольше 0,3 с (вкладки, выход в поход; модуль STAT v1.6) */
  (function(){if(!B.on('stat2'))return;var up=null,pT=0,pMv=0,pN=0,upN=0,ev0=0;
    function hp(g){return g&&g.st&&g.st.maxHp?Math.round(100*Math.max(0,g.hero.hp)/g.st.maxHp):0;}
    function ps(g){try{return g.endless?'inf':g.daily?'day':chPos(g.chi);}catch(e){return -1;}}
    function win(){try{return document.getElementById('modal').classList.contains('on')?1:0;}catch(e){return 0;}}
    function cc(c){return !c?'-':c.t==='w'||c.t==='p'?c.t+c.id+c.lvl:c.t==='x'?'x'+String(c.x&&(c.x.id||c.x.name)||'').slice(0,12):c.t;}
    B.hook('run',function(g){pT=10;pMv=0;pN=0;upN=0;ev0=0;up=null;g.bb2mv=0;});
    B.hook('frame',function(dt,g){var H=g.hero;
      if(H.moving){pMv=1;if(!g.bb2mv){g.bb2mv=1;if(g.first){var k='p';try{for(var q in IN.keys)if(IN.keys[q])k='k';}catch(e){}stat('mv1',{t:Math.round(g.t*10)/10,ms:Math.round(performance.now()),k:k});}}}
      if(g.first&&g.t>=pT&&pN<30){pN++;pT+=10;stat('pls',{t:Math.round(g.t),lv:H.lvl,hp:hp(g),k:g.kills,mv:pMv,w:0});pMv=0;}
      var e=g.q&&g.q.evos||0;if(e>ev0){ev0=e;var w='',i;for(i=0;i<g.weapons.length;i++)if(g.weapons[i].lvl===6&&!g.weapons[i].bb2e){g.weapons[i].bb2e=1;w=g.weapons[i].id;}stat('evo',{w:w,t:Math.round(g.t),n:e});}});
    B.hook('upOffer',function(cards,g,rr){if(!up||rr!==1)up={rr:0};else up.rr=1;up.c=cards.slice(0,4).map(cc);});
    B.hook('upPick',function(c,cards,g){if(upN++>=25)return;var a=up&&up.c||[],o={lv:g.hero.lvl,t:Math.round(g.t),p:cc(c)};
      if(a[0])o.a=a[0];if(a[1])o.b=a[1];if(a[2])o.c=a[2];if(a[3])o.d=a[3];if(up&&up.rr)o.rr=1;stat('up',o);up=null;});
    B.hook('bossIn',function(e,g){stat('boss',{a:'in',b:e.bv||e.type,t:Math.round(g.t),hp:hp(g),l:ps(g)});});
    B.hook('bossDie',function(e,g){stat('boss',{a:'kill',b:e.bv||e.type,t:Math.round(g.t),hp:hp(g),l:ps(g)});});
    B.hook('down',function(g,by){stat('die',{by:by||'',t:Math.round(g.t),lv:g.hero.lvl,n:g.falls||1,b:g.boss&&!g.boss.dead?1:0,l:ps(g)});});
    B.hook('end',function(g,w){if(!w&&g.boss&&!g.boss.dead&&!g.endless)stat('boss',{a:'lose',b:g.boss.bv||g.boss.type,t:Math.round(g.t),hp:hp(g),l:ps(g),bh:Math.round(100*g.boss.hp/g.boss.max)});});
    /* уход посреди похода: на окне в фазе перехвата — раньше, чем STAT соберёт последнюю пачку (его слушатель — на документе) */
    window.addEventListener('visibilitychange',function(){try{if(document.visibilityState!=='hidden'||typeof G==='undefined'||!G||G.over)return;
      stat('rt',{t:Math.round(G.t),l:ps(G),lv:G.hero.lvl,hp:hp(G),f:G.first?1:0,mv:G.bb2mv?1:0,w:win()});}catch(e){}},true);
    /* медленные переходы: вкладки и выход в поход — от вызова до следующего кадра */
    B.hook('ready',function(){try{if(typeof STAT==='undefined'||!STAT.slow||typeof requestAnimationFrame!=='function')return;
      var wrap=function(nm,tag){var f=window[nm];if(typeof f!=='function')return;window[nm]=function(a){var t0=performance.now(),r=f.apply(this,arguments);
        requestAnimationFrame(function(){STAT.slow(tag+(nm==='openTab'?String(a).toLowerCase():''),performance.now()-t0);});return r;};};
      wrap('openTab','tab_');wrap('startRun','run');}catch(e){}});
  })();
  fixAll();
  B.info=function(){var hk={},k;for(k in H)hk[k]=H[k].length;return {flags:B.flags(),hooks:hk,lazy:B.lazyInfo(),save:B.saveSize(),keys:B.saveKeys(),miss:B.miss};};
  return B;})();
