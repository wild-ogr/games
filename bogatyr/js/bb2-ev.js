/* ===== bb2-ev.js — поток EVENT супер-буста в2: ЗАГЛУШКА НА СТАРТЕ (шина «Подвигов», сохранение S.bb2.ev, догрузка). =====
   Сам движок событий — js/bb2-ev-pdv.js (Подвиги) и js/bb2-ev-ui.js (Утро, Месяцеслов, Дары, Сход, Сказ, календарь) — грузится по требованию (набор 'ev').
   Старый синтаксис: без ?. ?? .finally.

   ШИНА «ПОДВИГОВ» — как любой поток сообщает о событии для задания:
     BB2.pdv('ключ')            — случилось 1 раз              BB2.pdv('zab')         сыграна Забава
     BB2.pdv('ключ',n)          — случилось n раз (n>0)        BB2.pdv('sud',1)       суд свершён
     BB2.pdv('ключ',n,1)        — «лучшее значение» (рекорд)   BB2.pdv('lov.rec',1840,1)
   Звать можно когда угодно (в бою, в меню, до догрузки движка — копится в очереди). Ключ — короткое латинское имя, чужие — 'поток.что'.
   Свой шаблон подвига (чтобы Боян давал задание на ваше событие):
     BB2.pdvDef({id:'um10',key:'um',s:1,n:[5,10,20],t:function(n){return L('Примени умения: '+n,'Use skills: '+n);},
                 ok:function(){return true;},go:function(){openTab('Map');},max:0,min:0});
       id — имя шаблона (латиница, ≤8 знаков, не менять после выпуска) · key — ключ шины · s — место: 1 короткий (один поход), 2 средний (2–3 похода или другое место игры)
       n — цель по трём ступеням роста игрока (земель <2 / <5 / дальше) · t(n) — текст · ok() — доступен ли сейчас · go() — куда вести по нажатию
       max:1 — считать лучшее за один раз, а не сумму · min:1 — счёт в секундах, цель в минутах.
   Что шлёт сам EVENT (подписка BB2.hook):
     'pdvDone'(p)   — подвиг выполнен: {id,key,n,s,c:связка или '',gold,run:1 если в бою,vow:1 если с зароком}
     'kuplet'(k)    — допет куплет «Былины о тебе»: {c:id связки,n:номер куплета,t:текст,src:'pdv'|'shod'|'dary'|…}; любой поток может дописать свой: BB2.ev('kuplet',{c:'sud',t:'…',src:'sud'})
     'utroRow'(a)   — строки «Утра богатыря»: a.push({ic:'значок',t:'заголовок',s:'строка',fn:function(){},hot:1})
     'utroTile'(a)  — плитки «Утра» (видны первые три): a.push({ic,t,s,fn,w:вес})
     'zavtra'(a)    — обещание на завтра в итогах: a.push({w:вес 0…100,t:'текст'}) — показывается одно, самое весомое
     'evRes'(a,G,win) — строки событий в итогах похода: a.push('<html>')
   Зарок (поток TAIL): если в походе G.bb2vow>0 — подвиг, выполненный в этом походе, платит ×2 (флаг 'pdv'). Победный поход с зароком: BB2.pdv('vow').
   Ключи, которые EVENT считает сам (слать не надо): kills boss time lvl gold chest dar evo run win drun endless star3 nores hard zab harv bake honey order forge bld */
(function(){
  if(typeof BB2==='undefined')return;
  var Q={},DEFS=[];
  BB2.pdvQ=Q;BB2.pdvDefs=DEFS;
  BB2.pdv=function(key,n,max){n=n==null?1:+n;if(!key||!(n>0))return;
    if(BB2.pdvIn){try{BB2.pdvIn(String(key),n,max?1:0);}catch(e){}return;}
    var q=Q[key]||(Q[key]=[0,0]);if(max)q[1]=Math.max(q[1],n);else q[0]+=n;};
  BB2.pdvDef=function(d){if(!d||!d.id||!d.key)return;if(BB2.pdvAdd)BB2.pdvAdd(d);else DEFS.push(d);};

  /* ---------- сохранение S.bb2.ev: p подвиги · cal месяцеслов · dary дары дружины · shod сход · saga хвост сказа · fest лесенки праздников · m разное ---------- */
  function ob(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
  function num(o,k,d){o[k]=typeof o[k]==='number'&&isFinite(o[k])?o[k]:d||0;}
  function str(o,k){o[k]=typeof o[k]==='string'?o[k]:'';}
  function fix(o,full){o=ob(o);if(!full&&!o.v){for(var e in o)if(e!=='v'){full=1;break;}if(!full)return o;} /* пусто = «как у новичка»: поля появятся, когда движок событий впервые возьмёт узел */o.v=1;var k,a=['p','cal','dary','shod','saga','fest','m'];for(k=0;k<a.length;k++)o[a[k]]=ob(o[a[k]]);
    var p=o.p;if(!Array.isArray(p.a))p.a=[];p.a=p.a.filter(function(x){return x&&typeof x.t==='string'&&x.n>0;}).slice(0,3);
    for(k=0;k<p.a.length;k++){num(p.a[k],'p');num(p.a[k],'n',1);num(p.a[k],'s',1);}
    num(p,'k');num(p,'dn');num(p,'dg');num(p,'ci');num(p,'cs');num(p,'cn');num(p,'tut');str(p,'d');str(p,'ch');str(p,'sw');
    if(!Array.isArray(p.h))p.h=[];p.h=p.h.slice(-6);if(!Array.isArray(p.ku))p.ku=[];p.ku=p.ku.slice(0,40);
    var c=o.cal;num(c,'d');num(c,'n');num(c,'fw');num(c,'sh');num(c,'mig');str(c,'last');
    num(o.dary,'n');num(o.dary,'on');str(o.dary,'last');
    var s=o.shod;num(s,'w');num(s,'x0');num(s,'pace');num(s,'wins');num(s,'lw');num(s,'lp');num(s,'ln');num(s,'seen');
    num(o.saga,'id',-1);num(o.saga,'t');
    return o;}
  /* слияние с облаком: у кого больше «счётчик прогресса» узла — тот узел целиком (дни и недели внутри узла связаны между собой); счётчики-итоги — максимум */
  function later(a,b,f){a=ob(a);b=ob(b);return f(b)>f(a)?b:a;}
  function merge(a,b){a=fix(a,1);b=fix(b,1);var o={v:1};
    o.p=later(a.p,b.p,function(x){return x.k*100+x.dn;});o.p.cn=Math.max(a.p.cn,b.p.cn);o.p.k=Math.max(a.p.k,b.p.k);if(b.p.ku.length>a.p.ku.length)o.p.ku=b.p.ku;else o.p.ku=a.p.ku;
    if(a.p.ch>o.p.ch)o.p.ch=a.p.ch;if(b.p.ch>o.p.ch)o.p.ch=b.p.ch;
    o.cal=later(a.cal,b.cal,function(x){return +(x.last.replace(/\D/g,''))||0;});o.cal.sh=Math.max(a.cal.sh,b.cal.sh);
    o.dary=later(a.dary,b.dary,function(x){return x.n;});if(a.dary.on<0||b.dary.on<0)o.dary.on=-1;
    o.shod=later(a.shod,b.shod,function(x){return x.w*8+(x.seen?1:0);});o.shod.wins=Math.max(a.shod.wins,b.shod.wins);o.shod.pace=Math.max(a.shod.pace,b.shod.pace);
    o.saga=later(a.saga,b.saga,function(x){return x.id*1000+x.t;});
    o.fest=BB2.mx(a.fest,b.fest);o.m=BB2.mx(a.m,b.m);return fix(o,1);}
  BB2.evFix=function(o){return fix(o,1);};
  BB2.save('ev',{fix:fix,merge:merge});

  /* ---------- облики событий (рисунки те же, цвета другие; силы не дают). На старте — чтобы надетый облик рисовался сразу. Видны только тем, у кого есть ---------- */
  try{if(typeof SKINS!=='undefined'&&typeof HERO_ART!=='undefined'&&typeof art==='function'&&typeof drawHero==='function'){
    var reg=function(id,h,pal,nm,src){var o={id:id,hero:h,pal:pal,fest:'ev'},hh=Object.assign({},HERO_ART[h],pal),k=h+'@'+id;
      Object.defineProperty(o,'name',{get:nm,enumerable:true});Object.defineProperty(o,'src',{get:src,enumerable:true});SKINS.push(o);
      [0,1].forEach(function(f){art('h_'+k+'_'+f,80,function(g){drawHero(g,hh,f);});});art('hp_'+k,66,function(g){g.translate(0,3);drawHero(g,hh,0);});};
    reg('grid','dob',{body:'#6f7f96',cloak:'#9a2a2a',helm:'#c9ced8',rim:'#e6b53a'},function(){return L('Гридень','Squire');},function(){return L('дар Ильи Муромца — «Семь даров дружины»','a gift from Ilya Muromets — “Seven Gifts of the Squad”');});
    var KZ={body:'#3a3020',cloak:'#c9a227',helm:'#e6c84a',rim:'#fff0a0',cap:'#8a6a1a',fur:'#c9a227',kok:'#e6c84a',belt:'#fff0a0',boots:'#2a2010',hair:'#2a2a36'},h,k,pal;
    for(h in HERO_ART){pal={};for(k in KZ)if(typeof HERO_ART[h][k]==='string'&&HERO_ART[h][k].charAt(0)==='#')pal[k]=KZ[k];
      reg('koshz',h,pal,function(){return L('Кощеев золотой','Gilded Deathless');},function(){return L('Кощеева неделя: 60 000 нечисти за праздник','Spooky week: 60,000 monsters during the holiday');});}}}catch(e){}

  /* облик с меткой fest виден только владельцу — правило из meta-fest.js; если тот ещё не приехал (догрузка меты), держим то же правило сами */
  if(typeof window.festSkinVis!=='function')window.festSkinVis=function(sk,key){return !sk.fest||!!((typeof S!=='undefined'&&S&&S.skins)||{})[key]||typeof FEST!=='undefined'&&FEST.on(sk.fest);};

  /* ---------- догрузка: движок событий — не на старте ---------- */
  BB2.lazy('ev',['js/bb2-ev-pdv.js','js/bb2-ev-ui.js'],function(){return typeof BB2EV!=='undefined'&&!!BB2EV.ui;});
  function any(){return BB2.on('pdv')||BB2.on('utro')||BB2.on('cal')||BB2.on('dary')||BB2.on('shod')||BB2.on('saga2')||BB2.on('zavtra')||BB2.on('fest2')||BB2.on('gost');}
  function load(){if(any())BB2.bg('ev');}
  BB2.hook('ready',load);BB2.hook('run',load);BB2.hook('menu',load);
  /* «Утро богатыря» вместо автоокна «Дела на сегодня»: движок ещё едет — подождём его (не дольше 4 с), не вышло — старое окно */
  BB2.hook('morning',function(){if(!BB2.on('utro'))return;
    if(BB2.ready('ev'))return BB2EV.utroAuto()?true:undefined;
    var done=0,t=setTimeout(function(){if(!done){done=1;try{openToday();}catch(e){}}},4000);
    BB2.need('ev').then(function(){if(done)return;done=1;clearTimeout(t);if(!BB2EV.utroAuto())try{openToday();}catch(e){}},function(){if(!done){done=1;clearTimeout(t);try{openToday();}catch(e){}}});
    return true;});

  /* ---------- события старых модулей → ключи шины (без правки чужих файлов): статистика уже знает, что игрок сделал ---------- */
  try{if(typeof STAT!=='undefined'&&typeof STAT.ev==='function'){var f0=STAT.ev;
    STAT.ev=function(n,o){try{var k=0;o=o||{};
      if(n==='zab')k=o.a==='end'?'zab':0;else if(n==='yard')k=o.a==='harv'?'harv':o.a==='bake'?'bake':o.a==='honey'?'honey':0;
      else if(n==='tro_ord')k='order';else if(n==='spend'&&typeof o.k==='string')k=o.k.indexOf('forge:')===0?'forge':o.k.indexOf('bld:')===0?'bld':0;
      if(k)BB2.pdv(k,1);}catch(e){}
      return f0.apply(STAT,arguments);};}}catch(e){}
})();
