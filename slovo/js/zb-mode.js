'use strict';
/* ================= zb-mode — режимы на пройденных уровнях (буст «Школа бабы Зины», поток MODE, 11.10.2026) =================
   Три режима на уже пройденных уровнях (1–500 и 501+), 0 новых кроссвордов:
     last  «До последнего слова»   — кроссворд открыт, ищешь все слова, которые знает Зина (бонусные из словаря уровня); ★ за все слова
     scan  «Сканворд деда Семёна»  — кроссворд заново, но ищешь по толкованиям (GLOSS, иначе DEFS); ★ «знаток»
     train «Электричка»            — на время «до отправления 3:00», без проигрыша: не успел — просто без бонуса; ★ «успел»
   ВЫКЛЮЧЕНИЕ: MD.ON[m]=0 (каждый режим) или MD.OFF=1 (все) — входы прячутся, игра как раньше.
   ДОГОВОР:
     MD.play(m, idx)      — начать уровень idx (0-based, пройденный) в режиме m. G.mode = m (видят levelHook/STAT/SCHOOL).
     MD.can(m)            — режим включён и открыт игроку (уровень S.lv ≥ MD.open(m)).
     MD.star(m, idx)      — звезда режима на уровне; MD.stars(m) — сколько всего; MD.next(m) — следующий уровень без звезды (-1 — нет).
     MD.today()           — сыграно (выиграно) уровней в режимах сегодня — для «Сегодня у Зины».
     ZB.pathSlots         — гнездо «Пути» (если VIEW ещё не завёл — создаём массив сами): {id:'mode', render(ctx), mount(el,ctx)}; ctx.c — глава (0-based).
     Экран ZB.go('modes') — «Повторение»: три режима, звёзды, «Играть» / «Выбрать уровень» (главы → уровни с вкладкой режима).
   В levelHook режимы идут с first:false (повтор — не новый уровень для SCHOOL), своё «впервые звезда» — res.mdNew.
   СОХРАНЕНИЕ (S.md*, ZB.onSave prefix 'md'): mdL/mdS/mdT — звёзды режимов битовой строкой (6 бит на символ, base64url, хвост 'A' обрезан;
     слияние — побитовое ИЛИ); mdc — незаконченный «До последнего слова» {i, w:'слово слово'}; mdd — сегодня {d, c: монет, n: побед};
     mdh — показанные объяснения {last,scan,train,u30,u60,u100}. 500 пройденных и все звёзды — 3×84 символа.
   Числа наград — ZBECO.mode (поток ECO), умолчания — DEF ниже. Старые WebView: без ?. ?? .at :has structuredClone. */
(function(){
  if(typeof ZB==='undefined')return;
  var DEF={open:{last:30,scan:60,train:100},last:15,scan:8,scanEx:4,train:10,replay:1,cap:60,trainSec:180,trainBig:240,trainBigW:12,lastMax:40};
  var MD=window.MD={v:1,OFF:0,ON:{last:1,scan:1,train:1},pend:null,tab:'',
    NAME:{last:'До последнего слова',scan:'Сканворд деда Семёна',train:'Электричка'},
    SHORT:{last:'Все слова',scan:'Сканворд',train:'Электричка'},
    IC:{last:'🔎',scan:'📰',train:'🚆'},
    STAR:{last:'все слова',scan:'знаток',train:'успел'}};
  var IDS=['last','scan','train'],KEY={last:'mdL',scan:'mdS',train:'mdT'};
  /* zb-MERGE: G.mode бывает и чужим (FEST ставит 'fest') — свои обёртки только для режимов MODE */
  function mine(g){return !!g&&(g.mode==='last'||g.mode==='scan'||g.mode==='train');}
  function cfg(){var z=(window.ZBECO&&ZBECO.mode)||{},o={};for(var k in DEF)o[k]=z[k]!=null?z[k]:DEF[k];return o;}
  MD.cfg=cfg;
  function $i(id){return document.getElementById(id);}
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function tk(){return typeof todayKey==='function'?todayKey():0;}
  function stat(a,o){try{if(window.STAT&&STAT.ev){o=o||{};o.a=a;STAT.ev('md',o);}}catch(e){}}

  /* ---------- звёзды: битовая строка ---------- */
  var AB='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function bClean(s){return typeof s==='string'?s.replace(/[^A-Za-z0-9_-]/g,'A').replace(/A+$/,''):'';}
  function bGet(s,i){var c=(s||'').charAt(Math.floor(i/6));return c?(AB.indexOf(c)>>(i%6))&1:0;}
  function bSet(s,i){s=s||'';var k=Math.floor(i/6);while(s.length<=k)s+='A';return s.slice(0,k)+AB.charAt(AB.indexOf(s.charAt(k))|(1<<(i%6)))+s.slice(k+1);}
  function bOr(a,b){a=bClean(a);b=bClean(b);var n=Math.max(a.length,b.length),r='';
    for(var k=0;k<n;k++){var x=AB.indexOf(a.charAt(k)),y=AB.indexOf(b.charAt(k));r+=AB.charAt((x<0?0:x)|(y<0?0:y));}return r.replace(/A+$/,'');}
  function bCnt(s){var n=0;s=s||'';for(var k=0;k<s.length;k++){var v=AB.indexOf(s.charAt(k));while(v>0){n+=v&1;v>>=1;}}return n;}
  MD._b={get:bGet,set:bSet,or:bOr,cnt:bCnt,clean:bClean};
  MD.star=function(m,i){return typeof S!=='undefined'&&!!bGet(S[KEY[m]],i);};
  MD.stars=function(m){return typeof S!=='undefined'?bCnt(S[KEY[m]]):0;};
  MD.open=function(m){return +cfg().open[m]||DEF.open[m];};
  MD.on=function(m){return !MD.OFF&&!!MD.ON[m];};
  MD.can=function(m){return MD.on(m)&&typeof S!=='undefined'&&(S.lv||0)>=MD.open(m);};
  MD.any=function(){for(var j=0;j<IDS.length;j++)if(MD.can(IDS[j]))return true;return false;};
  MD.today=function(){return typeof S!=='undefined'&&S.mdd&&+S.mdd.d===tk()?+S.mdd.n||0:0;};

  /* ---------- сохранение ---------- */
  ZB.onSave({id:'mode',prefix:'md',
    fix:function(S){['mdL','mdS','mdT'].forEach(function(k){S[k]=bClean(S[k]);if(!S[k])delete S[k];});
      if(S.mdc&&(typeof S.mdc!=='object'||typeof S.mdc.w!=='string'||!(S.mdc.i>=0)))delete S.mdc;
      if(S.mdd&&(typeof S.mdd!=='object'||!S.mdd.d))delete S.mdd;
      if(S.mdh&&typeof S.mdh!=='object')delete S.mdh;},
    merge:function(S,d,newer){
      ['mdL','mdS','mdT'].forEach(function(k){var v=bOr(S[k],d[k]);if(v)S[k]=v;});
      if(d.mdd&&typeof d.mdd==='object'){var a=S.mdd;if(!a||+d.mdd.d>+a.d)S.mdd={d:d.mdd.d,c:+d.mdd.c||0,n:+d.mdd.n||0};
        else if(+d.mdd.d===+a.d){a.c=Math.max(+a.c||0,+d.mdd.c||0);a.n=Math.max(+a.n||0,+d.mdd.n||0);}}
      if(d.mdh&&typeof d.mdh==='object'){S.mdh=S.mdh||{};for(var k in d.mdh)if(d.mdh[k])S.mdh[k]=1;}
      if(d.mdc&&typeof d.mdc==='object'&&typeof d.mdc.w==='string'){
        if(!S.mdc||(newer&&S.mdc.i!==d.mdc.i))S.mdc={i:+d.mdc.i,w:d.mdc.w};
        else if(S.mdc.i===+d.mdc.i){var u={};(S.mdc.w+' '+d.mdc.w).split(' ').forEach(function(w){if(w)u[w]=1;});S.mdc.w=Object.keys(u).join(' ');}}}});
  function tip(k){if(!S.mdh)S.mdh={};if(S.mdh[k])return false;S.mdh[k]=1;return true;}

  /* ---------- монеты режимов: потолок в день ---------- */
  function dayRec(){var d=tk();if(!S.mdd||+S.mdd.d!==d)S.mdd={d:d,c:0,n:0};return S.mdd;}
  // ZBECO.give('mode') держит общий потолок дня и пишет STAT earn; без ZBECO — свой потолок S.mdd.c
  function give(n){var r=dayRec(),E=window.ZBECO;n=Math.max(0,Math.floor(n)||0);if(!n)return 0;
    if(E&&E.give){var k=+E.give('mode',n,'mode')||0;r.c=(+r.c||0)+k;return k;}
    var left=Math.max(0,cfg().cap-(+r.c||0));n=Math.min(n,left);r.c=(+r.c||0)+n;if(n)addCoins(n,'mode');return n;}

  /* ---------- слова Зины на уровне (то же, что засчитывает submit/isWord, без ответов кроссворда) ---------- */
  var WL=null,WC={};
  function wl(){if(WL)return WL;if(typeof dictReady!=='function'||!dictReady())return null;
    var a=DICT_MAIN.split(' ').concat(DICT_EXTRA.split(' '));if(typeof ZINA_MORE==='string'&&ZINA_MORE)a=a.concat(ZINA_MORE.split(' '));
    var u={},r=[];for(var i=0;i<a.length;i++){var w=a[i];if(w&&w.length>=3&&w.length<=9&&!u[w]){u[w]=1;r.push(w);}}return (WL=r);}
  // lv — данные уровня (levelData): l — буквы, w — [слово,x,y,d]. null — словарь ещё не загружен
  MD.words=function(lv){var key=lv.l+'|'+lv.w.map(function(x){return x[0];}).join(',');if(WC[key])return WC[key];
    var L=wl();if(!L){if(typeof ensureDict==='function')ensureDict();return null;}
    var cnt={},n=lv.l.length,i,j;for(i=0;i<n;i++)cnt[lv.l[i]]=(cnt[lv.l[i]]||0)+1;
    var cw={};lv.w.forEach(function(x){cw[x[0]]=1;});var r=[];
    for(i=0;i<L.length;i++){var w=L[i];if(w.length>n||cw[w])continue;var c={},ok=true;
      for(j=0;j<w.length;j++){var ch=w[j];c[ch]=(c[ch]||0)+1;if(!cnt[ch]||c[ch]>cnt[ch]){ok=false;break;}}
      if(ok&&isWord(w))r.push(w);}
    r.sort(function(a,b){return a.length-b.length||(a<b?-1:1);});
    var keys=Object.keys(WC);if(keys.length>40)delete WC[keys[0]];
    return (WC[key]=r);};
  // толкование для сканворда: настоящее (GLOSS) лучше шутки; само слово и его основа в тексте закрываются «…»
  var CL={};
  MD.clue=function(w){if(CL[w]!=null)return CL[w];var t=(typeof GLOSS!=='undefined'&&GLOSS[w])||(typeof DEFS!=='undefined'&&DEFS[w])||'';if(!t)return '';
    // закрываем само слово и его формы (основа + до 3 букв окончания), только с начала слова: «быка», «шутке», но не «грохот» у «грома»
    var st=w.replace(/ё/g,'е'),base=st.length>3&&/[аяоеиыуюьй]$/.test(st)?st.slice(0,-1):st;
    t=t.replace(new RegExp('(^|[^а-яё])'+base.replace(/е/g,'[её]')+'[а-яё]{0,3}(?![а-яё])','gi'),'$1…');
    return (CL[w]=t.charAt(0).toUpperCase()+t.slice(1));};
  // уровни 501+ лениво (LVL: ZBCH.load/loaded/total): пока файла нет — уровень «годится», проверка после подгрузки
  function nLoaded(){return typeof LEVELS!=='undefined'?LEVELS.length:0;}
  function lazy(){return typeof ZBCH!=='undefined'&&ZBCH.load&&ZBCH.loaded&&!ZBCH.loaded();}
  function eligible(m,i){if(typeof levelData!=='function')return false;if(i>=nLoaded())return lazy();var lv=levelData(i,false);if(!lv)return false;
    if(m==='last'){var ws=MD.words(lv);return ws===null||ws.length>0;}
    if(m==='scan'){for(var k=0;k<lv.w.length;k++)if(!MD.clue(lv.w[k][0]))return false;return true;}
    return true;}
  MD.ok=eligible;
  // цель «До последнего слова»: все слова Зины, но не больше lastMax (на 7-буквенных их бывает до 100 — это уже каторга)
  function goal(g){return g.mdW?Math.min(g.mdW.length,+cfg().lastMax||40):0;}
  function gotN(g){return g.mdW?g.mdW.filter(function(w){return g.bonus.has(w);}).length:0;}
  MD.goal=function(){return G&&G.mode==='last'?{got:gotN(G),goal:goal(G),all:G.mdW?G.mdW.length:0}:null;};
  // следующий уровень без звезды: с начала (ex — пропустить этот)
  MD.next=function(m,ex){var n=Math.min(S.lv||0,nLoaded());
    for(var i=0;i<n;i++)if(i!==ex&&!MD.star(m,i)&&eligible(m,i))return i;
    if((S.lv||0)>n&&lazy()){ZBCH.load().then(function(){if(ZB.cur==='modes'&&document.getElementById('zb-modes').classList.contains('on'))ZB.go('modes');},function(){});for(i=n;i<(S.lv||0);i++)if(i!==ex&&!MD.star(m,i))return i;}
    return -1;};

  /* ---------- начало уровня в режиме ---------- */
  MD.play=function(m,i){if(!MD.can(m)){toast('«'+MD.NAME[m]+'» откроется с '+MD.open(m)+'-го уровня');return false;}
    if(!(i>=0)||i>=(S.lv||0)){toast('Сначала пройди уровень '+((S.lv||0)+1));return false;}
    if(i>=nLoaded()&&lazy()){ZBCH.load().then(function(){MD.play(m,i);},function(){toast('Не удалось загрузить уровень — проверь интернет');});return true;}
    if(!eligible(m,i)){toast(m==='last'?'Тут Зина других слов не знает — выбери другой уровень':'Этот уровень для режима не годится — выбери другой');return false;}
    var key='L'+i,st=S.curs&&S.curs[key];if(st)delete S.curs[key];
    // «До последнего слова»: кроссворд открыт сразу — новые клетки (LVL, ZBCELL) там ни к чему
    var cel=m==='last'&&typeof ZBCELL!=='undefined'&&ZBCELL.ON;if(cel)ZBCELL.ON=false;
    MD.pend=m;try{startLevel(i,false);}finally{MD.pend=null;if(cel)ZBCELL.ON=true;if(st)S.curs[key]=st;else if(S.curs)delete S.curs[key];save();}
    return true;};
  function clean(){document.body.classList.remove('md-last','md-scan','md-train');}
  ZB.startHook.push(function(info){
    if(!MD.pend||info.daily||!G){clean();return;}
    var m=MD.pend;G.mode=m;info.mode=m;G.mdT0=Date.now();clean();document.body.classList.add('md-'+m);
    $i('gTitle').textContent=MD.IC[m]+' Уровень '+(G.idx+1);
    var gs=$i('gSub');if(gs){gs.dataset.full=MD.IC[m]+' '+MD.SHORT[m];gs.dataset.short=MD.IC[m];}
    if(G.rid){wordCells(G.rid).forEach(function(c){if(c.el)c.el.classList.remove('rid');});G.rid=null;}
    stat('start',{m:m,l:G.idx+1});
    SETUP[m](G);updCount();});

  var SETUP={
    last:function(g){
      g.cells.forEach(function(c){if(!c.open){c.open=true;c.el.textContent=c.ch;c.el.classList.add('open');}});
      g.words.forEach(function(w){w.found=true;});
      var mc=S.mdc;if(mc&&+mc.i===g.idx&&mc.w){mc.w.split(' ').forEach(function(w){if(w)g.bonus.add(w);});}
      else S.mdc={i:g.idx,w:''};
      g.mdW=MD.words(g.lv);if(g.mdW)g.bonus.forEach(function(w){if(g.mdW.indexOf(w)<0)g.bonus.delete(w);});
      var left=Math.max(0,goal(g)-gotN(g)),all=g.mdW?g.mdW.length:0;
      zina(tip('last')?'Кроссворд ты уже сдал. А я в этих буквах знаю ещё '+all+' '+plural(all,'слово','слова','слов')+'! '+(left<all?'Найдёшь '+left+' — ':'Найдёшь все — ')+'три звезды. 💡 подскажет начало слова.'
        :pick(['Ну-ка, что тут ещё спряталось? Я знаю ещё '+left+'.','Слова тут ещё есть, я их чую. Ищи!','Кто ищет — тот найдёт. Особенно если букв хватает.']),'happy',left?6:3);},
    scan:function(g){g.mdSel=-1;selNext(g,0);
      zina(tip('scan')?'Сканворд деда Семёна! Букв не подскажу — только что слово значит. Семён так сорок лет «Вечёрку» решал. Нажми на клетку — покажу её вопрос.'
        :pick(['Дед Семён говорит: сканворд — это гимнастика для головы. Разминайся!','Читай вопрос — ищи по смыслу. Семён бы уже решил, хвастун.','Букв не дам, только вопросы. Как в газете!']),'happy',6);},
    train:function(g){var n=g.words.length,c=cfg();g.mdLim=(n>=c.trainBigW?c.trainBig:c.trainSec);g.mdEl=0;g.mdLate=0;g.mdLast=Date.now();
      zina(tip('train')?'Электричка через '+Math.round(g.mdLim/60)+' минуты! Успеешь все слова — бонус. Не успеешь — не беда, доиграешь и так. Я на ней сорок лет в школу ездила!'
        :pick(['По вагонам! Электричка ждать не будет.','Билет купил? Поехали! До отправления — '+fmt(g.mdLim)+'.','Контролёр идёт — решай быстрее!']),'happy',5);
      tickOn();}};

  /* ---------- полоса режима над кроссвордом (ZB.levelSlots) ---------- */
  ZB.add(ZB.levelSlots,{id:'mode',zone:'top',order:1,
    render:function(){return mine(G)?'<div id="mdBar" class="mdbar md-'+G.mode+'"></div>':'';},
    mount:function(){bar();}});
  function fmt(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}
  function bar(){var e=$i('mdBar');if(!e||!mine(G))return;var m=G.mode,h='';
    if(m==='last'){var W=G.mdW||(G.mdW=MD.words(G.lv));
      if(!W){h='<div class="mdtx">Зина ищет тетрадку со словами…</div>';}
      else{var got=gotN(G),gl=goal(G),left=Math.max(0,gl-got);
        h='<div class="mdtx">'+(!left?'<b>Все слова найдены!</b>':gl<W.length?'До звезды ещё <b>'+left+'</b> '+plural(left,'слово','слова','слов'):'Зина знает ещё <b>'+left+'</b> '+plural(left,'слово','слова','слов'))+'</div>'+
          '<div class="mdpg"><i style="width:'+(gl?Math.round(Math.min(got,gl)/gl*100):100)+'%"></i></div><div class="mdn">'+Math.min(got,gl)+'/'+gl+'</div>'+
          (G.mdHint?'<div class="mdh" title="Подсказка Зины">'+hintTxt(G.mdHint)+'</div>':'');}}
    else if(m==='scan'){var wd=G.words[G.mdSel];
      if(!wd||wd.found)h='<div class="mdtx"><b>Сканворд решён!</b></div>';
      else{var un=G.words.filter(function(w){return !w.found;}),k=un.indexOf(wd)+1;
        h='<button class="mdar" data-d="-1" aria-label="Предыдущий вопрос">‹</button><div class="mdclue" id="mdClue"><b>'+k+'/'+un.length+' · '+wd.w.length+' '+plural(wd.w.length,'буква','буквы','букв')+(wd.d?' ↓':' →')+'</b> '+esc(MD.clue(wd.w))+'</div>'+
          '<button class="mdar" data-d="1" aria-label="Следующий вопрос">›</button>';}}
    else if(m==='train'){var rest=G.mdLim-G.mdEl,p=Math.max(0,Math.min(1,rest/G.mdLim));
      h='<div class="mdtx">'+(G.won?'':G.mdLate?'Электричка ушла — <b>доиграй спокойно</b>':'До отправления <b class="mdclock">'+fmt(rest)+'</b>')+'</div>'+
        '<div class="mdpg'+(rest<=30&&!G.mdLate?' hot':'')+'"><i style="width:'+Math.round(p*100)+'%"></i></div><div class="mdn">🚆</div>';}
    if(e.innerHTML!==h)e.innerHTML=h;
    if(m==='scan'){[].forEach.call(e.querySelectorAll('.mdar'),function(b){b.onclick=function(){SND.tap();lowHide();selNext(G,+b.dataset.d);};});
      var cl=$i('mdClue');if(cl)cl.onclick=function(){var w=G.words[G.mdSel];if(w&&!w.found){SND.tap();zina(MD.clue(w.w),'norm',Math.max(5,MD.clue(w.w).length*.07));highlightWord(w);}};}
    if(typeof layoutGrid==='function'&&e.offsetHeight!==+e.dataset.h){e.dataset.h=e.offsetHeight;layoutGrid();}}
  MD.bar=bar;
  // ленту «Слов: 2 из 5» в режиме «До последнего слова» считаем по словам Зины; полосу — освежаем на каждом слове
  var _upd=window.updCount;
  if(typeof _upd==='function')window.updCount=function(){_upd.apply(this,arguments);if(!mine(G))return;
    if(G.mode==='last'&&G.mdW){var c=$i('gCnt'),got=gotN(G),gl=goal(G);
      c.dataset.full='Слов: '+got+' из '+gl;c.dataset.short=got+' из '+gl;c.textContent=c.dataset.full;fitSub();}
    if(G.mode==='scan'&&G.words[G.mdSel]&&G.words[G.mdSel].found)selNext(G,1,true);
    bar();};

  /* ---------- сканворд: выбор вопроса ---------- */
  // низкий экран: реплика Зины лежит поверх шапки и вопроса — игрок листает вопросы, реплику убираем
  function lowHide(){if(typeof isSmallH==='function'&&isSmallH()&&typeof zinaHide==='function')zinaHide(true);}
  function mark(g){g.cells.forEach(function(c){if(c.el)c.el.classList.remove('mdsel');});var w=g.words[g.mdSel];
    if(w&&!w.found)wordCells(w).forEach(function(c){if(c&&c.el)c.el.classList.add('mdsel');});}
  function selNext(g,d,quiet){var un=[];g.words.forEach(function(w,i){if(!w.found)un.push(i);});if(!un.length){g.mdSel=-1;mark(g);if(!quiet)bar();return;}
    var k=un.indexOf(g.mdSel);k=k<0?0:(k+d+un.length)%un.length;
    g.mdSel=un[k];mark(g);if(!quiet)bar();}
  MD.sel=function(i){if(!G||G.mode!=='scan')return;G.mdSel=i;mark(G);bar();};
  // нажатие на закрытую клетку — вопрос её слова (на пересечении — по очереди)
  var grid=$i('grid');if(grid)grid.addEventListener('click',function(e){if(!G||G.mode!=='scan'||G.won)return;
    var el=e.target&&e.target.closest?e.target.closest('.cell'):null;if(!el)return;var cell=null;G.cells.forEach(function(c){if(c.el===el)cell=c;});if(!cell)return;
    var ws=[];G.words.forEach(function(w,i){if(!w.found&&wordCells(w).indexOf(cell)>=0)ws.push(i);});if(!ws.length)return;
    var k=ws.indexOf(G.mdSel);G.mdSel=ws[(k+1)%ws.length];SND.tap();lowHide();mark(G);bar();});
  // компьютер: ← → — вопросы сканворда
  document.addEventListener('keydown',function(e){if(!G||G.mode!=='scan'||G.won||$i('modal').classList.contains('on')||!$i('game').classList.contains('on'))return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();selNext(G,e.key==='ArrowLeft'?-1:1);}});

  /* ---------- электричка: часы (идут только в игре, без окон и не в фоне) ---------- */
  var tickT=0;
  function tickOn(){if(tickT)return;tickT=setInterval(tick,250);}
  function tick(){var g=G;if(!g||g.mode!=='train'||g.won){clearInterval(tickT);tickT=0;return;}var now=Date.now(),dt=Math.min(1000,now-(g.mdLast||now));g.mdLast=now;
    var run=$i('game').classList.contains('on')&&!$i('modal').classList.contains('on')&&!document.hidden&&!(typeof adBusy!=='undefined'&&adBusy);
    if(!run)return;g.mdEl+=dt/1000;
    if(!g.mdLate&&g.mdEl>=g.mdLim){g.mdLate=1;stat('late',{m:'train',l:g.idx+1});
      zina(pick(['Ту-ту! Электричка ушла. Ничего — доиграй спокойно, следующая будет.','Опоздали! Зато не толкались. Доиграй без спешки.','Ушла, родимая. Ну и пусть — слова никуда не денутся.']),'norm',5);}
    var s=Math.ceil(g.mdLim-g.mdEl);if(s!==g.mdS){g.mdS=s;bar();if(!g.mdLate&&s===30)zina('Полминуты до отправления! Шевелись, внучок!','wow',3);}}

  /* ---------- «До последнего слова»: слова, подсказки, победа ---------- */
  var _sub=window.submit;
  if(typeof _sub==='function')window.submit=function(w){var g=G,had=g&&g.mode==='last'?g.bonus.size:0;var r=_sub.apply(this,arguments);
    if(g&&G===g&&g.mode==='last'&&!g.won){if(g.bonus.size!==had){S.mdc={i:g.idx,w:Array.from(g.bonus).join(' ')};save();
        if(g.mdHint&&g.bonus.has(g.mdHint.w))g.mdHint=null;updCount();}
      if(g.mdW&&g.mdW.length&&gotN(g)>=goal(g))setTimeout(function(){if(G===g&&!g.won)checkWin();},300);}
    return r;};
  function hintTxt(h){return h.w.slice(0,h.n).toUpperCase()+'<span>'+new Array(h.w.length-h.n+1).join('•')+'</span>';}
  function hintNext(g){var W=g.mdW||[];var left=W.filter(function(w){return !g.bonus.has(w);});if(!left.length)return null;
    if(g.mdHint&&!g.bonus.has(g.mdHint.w)){if(g.mdHint.n<g.mdHint.w.length-1)g.mdHint.n++;return g.mdHint;}
    return (g.mdHint={w:left[0],n:1});}
  function lastHint(){var g=G;if(!g.mdW||!g.mdW.length)return;
    var show=function(){if(G!==g||g.won)return;var h=hintNext(g);if(!h)return;S.hintsUsed=(S.hintsUsed||0)+1;SND.open();
      zina('Есть слово на «'+h.w.slice(0,h.n).toUpperCase()+'» — '+h.w.length+' '+plural(h.w.length,'буква','буквы','букв')+'. Ищи!','norm',4.5);bar();stat('hint',{m:'last'});};
    if(freeLeft()){useFree();updPrices();show();return;}
    if(hbN()){S.hb=hbN()-1;save();updPrices();show();return;}
    pay('letter',show);}
  function lastWord(){var g=G;var left=(g.mdW||[]).filter(function(w){return !g.bonus.has(w);});if(!left.length)return;
    pay('word',function(){if(G!==g||g.won)return;var w=(g.mdHint&&!g.bonus.has(g.mdHint.w))?g.mdHint.w:left.slice().sort(function(a,b){return b.length-a.length;})[0];
      S.hintsUsed=(S.hintsUsed||0)+1;g.mdHint=null;stat('hint',{m:'last',k:'w'});window.submit(w);});}
  var _hl=window.hintLetter,_hw=window.hintWord;
  if(typeof _hl==='function')window.hintLetter=function(){if(G&&G.mode==='last'&&!G.won){poke();lastHint();return;}return _hl.apply(this,arguments);};
  if(typeof _hw==='function')window.hintWord=function(){if(G&&G.mode==='last'&&!G.won){poke();lastWord();return;}return _hw.apply(this,arguments);};
  // ui.js bind() привязал кнопки к самим функциям до модулей — перепривязываем по имени (тогда работают и обёртки других модулей)
  ZB.safe('mode:btn',function(){var a=$i('hLet'),b=$i('hWord');if(a)a.onclick=function(){hintLetter();};if(b)b.onclick=function(){hintWord();};});
  // незаконченный уровень режима не пишем в S.curs (там — обычная игра); «До последнего слова» помнит свои слова в S.mdc
  var _sc=window.saveCur;
  if(typeof _sc==='function')window.saveCur=function(){if(mine(G))return;return _sc.apply(this,arguments);};

  /* ---------- победа в режиме: награда и окно ---------- */
  var _fin=window.finishLevel;
  if(typeof _fin==='function')window.finishLevel=function(g){if(!mine(g))return _fin.apply(this,arguments);
    var m=g.mode,i=g.idx,c=cfg();if(m==='train'&&g.mdEl>=g.mdLim)g.mdLate=1;var had=MD.star(m,i),got=m!=='train'||!g.mdLate,isNew=got&&!had;
    if(isNew)S[KEY[m]]=bSet(S[KEY[m]],i);
    var base=isNew?(+c[m]||0):(+c.replay||0),ex=m==='scan'&&isNew&&!g.hinted?(+c.scanEx||0):0,want=base+ex,reward=give(want);
    var r=dayRec();r.n=(+r.n||0)+1;if(m==='last')delete S.mdc;
    save();if(typeof cloudSoon==='function')cloudSoon();
    stat('win',{m:m,l:i+1,s:Math.round((Date.now()-(g.mdT0||Date.now()))/1000),st:isNew?1:had?2:0,c:reward});
    return {first:false,mdNew:isNew,star:got||had,mode:m,reward:reward,want:want,ex:ex,cap:reward<want,late:m==='train'&&g.mdLate,
      sec:m==='train'?Math.round(g.mdEl):0,words:m==='last'?gotN(g):g.words.length,dw:null,base:reward};};
  var _win=window.winModal;
  if(typeof _win==='function')window.winModal=function(g,r,again){if(!mine(g))return _win.apply(this,arguments);return winMode(g,r,again);};
  var SAY={last:['Все до единого! Даже я бы не нашла… ну ладно, нашла бы.','Вот это словарный запас! Кот Ять завидует.','Ни одного слова не оставил. Пять с плюсом!'],
    scan:['Знаток! Дед Семён сказал бы: «Ну, голова!» — и пошёл бы курить на балкон.','Решил по смыслу — это высший пилотаж.','Сканворд сдан. Семён проверил — не придерёшься.'],
    train:['Успел! Двери закрываются, следующая станция — «Пятёрка».','Вскочил в последний вагон! Молодец.','Электричка ещё стоит, а ты уже всё решил!'],
    late:['Электричка ушла, но кроссворд решён. Это главное!','Опоздал, зато всё правильно. В следующий раз — бегом!']};
  function starsHtml(i){return '<div class="mdst">'+'<span class="on" title="Кроссворд">★</span>'+
    '<span class="'+(exGet(i)?'on':'')+'" title="Без подсказок">★</span><span class="'+(MD.star('last',i)?'on':'')+'" title="Все слова">★</span></div>';}
  function winMode(g,r,again){var m=g.mode,title=r.title||(r.title=r.late?'Электричка ушла':m==='last'?'Все слова найдены!':m==='scan'?'Сканворд решён!':'Успел!');
    var nxt=MD.next(m,g.idx),say=r.say||(r.say=pick(r.late?SAY.late:SAY[m]));
    var line=m==='last'?'Уровень '+(g.idx+1)+': найдено '+r.words+' '+plural(r.words,'слово','слова','слов')+' Зины':
      m==='scan'?'Уровень '+(g.idx+1)+(g.hinted?'':' — без подсказок'):'Уровень '+(g.idx+1)+': '+fmt(r.sec)+(r.late?' — опоздал':' — успел');
    var badge=r.mdNew?'<p class="mdnew">⭐ '+(m==='last'?'Третья звезда уровня!':m==='scan'?'Звезда «знаток» на пути главы!':'Звезда «успел»!')+'</p>':'';
    var money=r.cap?'<p class="money">На сегодня режимы своё отдали — завтра снова по полной</p>':r.ex?'<p class="money">+'+(r.want-r.ex)+' за звезду · +'+r.ex+' без подсказок</p>':'';
    var zbc={g:g,r:r,first:false,daily:false,idx:g.idx,light:false,again:!!again,mode:m},zbw=ZB.html(ZB.winSlots,'',zbc);
    modal('<div class="'+(again?'':'win')+' mdwin"><h2>'+MD.IC[m]+' '+title+'</h2>'+
      '<div style="width:96px;height:96px;margin:2px auto">'+zinaSVG(r.late?'norm':'happy')+'</div>'+
      (m==='last'?starsHtml(g.idx):'')+badge+'<p class="mdline">'+line+'</p><p class="exsay" style="font-size:15px">'+say+'</p>'+
      '<div class="reward big" id="mRew">+'+r.reward+' <span class="coin"></span></div>'+money+zbw+
      '<div class="btns">'+(nxt>=0?'<button class="btn green" id="mNext">Ещё уровень ▶</button>':'<button class="btn green" id="mNext">Все режимы</button>')+
      (nxt>=0?'<button class="btn ghost small" id="mdAll">Все режимы</button>':'')+'<button class="wmenu" id="mMenu">В меню</button></div></div>');
    if(zbw)ZB.mount($i('mcard'),ZB.winSlots,zbc);
    if(typeof fitWin==='function')fitWin();
    if(!again&&r.reward){SND.coin();coinBurst($i('mRew'),r.reward);}
    $i('mNext').onclick=function(){hideModal();SND.tap();maybeInterstitial(function(){if(nxt>=0)MD.play(m,nxt);else ZB.go('modes');});};
    var a=$i('mdAll');if(a)a.onclick=function(){hideModal();SND.tap();maybeInterstitial(function(){ZB.go('modes');});};
    $i('mMenu').onclick=function(){hideModal();SND.tap();maybeInterstitial(openMenu);};}

  /* ---------- экран «Повторение» ---------- */
  var DESC={last:'Кроссворд уже решён — найди все слова, которые знает Зина. Третья звезда уровня.',
    scan:'Тот же уровень, но вместо букв — вопросы, как в газете. Ищешь по смыслу.',
    train:'Решай на время: до отправления 3 минуты. Не успел — не беда, просто без бонуса.'};
  ZB.screen('modes',{title:'Повторение',render:function(el){
    var h='<div class="hdr"><button class="ibtn" id="mdBk" aria-label="Назад">←</button><div class="t"><b>🔁 Повторение — мать учения</b><small>Режимы на пройденных уровнях</small></div></div><div class="scroll mdlist">';
    h+='<div class="mdsay"><div class="av">'+zinaSVG('happy')+'</div><p>'+pick(['Пройденное повторить — не грех. Я сорок лет повторяла, и ничего — бодрая!','Уровни ты прошёл, а слова в них ещё остались. Проверим?','Кто повторяет — у того пятёрки. Это я как учительница говорю.'])+'</p></div>';
    IDS.forEach(function(m){if(!MD.on(m))return;var can=MD.can(m),n=MD.stars(m),nx=can?MD.next(m):-1;
      h+='<div class="mdcard'+(can?'':' lock')+'"><div class="mdic">'+(can?MD.IC[m]:'🔒')+'</div><div class="mdct"><b>'+MD.NAME[m]+'</b><small>'+DESC[m]+'</small>'+
        (can?'<div class="mdcn">⭐ '+n+' из '+(S.lv||0)+' · звезда «'+MD.STAR[m]+'»'+(nx>=0?'<br><span class="mdnx">Следующий — уровень '+(nx+1)+'</span>':'')+'</div><div class="mdbt">'+
          (nx>=0?'<button class="btn green small" data-p="'+m+'">Играть ▶</button>':'<span class="mdall">Все пройденные — со звездой!</span>')+
          '<button class="btn ghost small" data-c="'+m+'">Выбрать уровень</button></div>'
        :'<div class="mdcn">Откроется с '+MD.open(m)+'-го уровня · ты на '+((S.lv||0)+1)+'-м</div>')+'</div></div>';});
    el.innerHTML=h+'</div>';
    $i('mdBk').onclick=function(){SND.tap();openMenu();};
    [].forEach.call(el.querySelectorAll('[data-p]'),function(b){b.onclick=function(){var m=b.dataset.p,i=MD.next(m);SND.tap();if(i>=0)maybeInterstitial(function(){MD.play(m,i);});};});
    [].forEach.call(el.querySelectorAll('[data-c]'),function(b){b.onclick=function(){SND.tap();MD.tab=b.dataset.c;openChapters();};});
    stat('scr');}});
  MD.go=function(){ZB.go('modes');};

  /* ---------- уровни главы: вкладки режимов и звёзды (обёртка openLevels) ---------- */
  var _ol=window.openLevels;
  if(typeof _ol==='function')window.openLevels=function(c){_ol.apply(this,arguments);ZB.safe('mode:levels',function(){lvTabs(c);});};
  function lvTabs(c){var list=$i('lvList');if(!list)return;var old=$i('mdTabs');if(old)old.remove();
    if(!MD.any()){MD.tab='';return;}if(MD.tab&&!MD.can(MD.tab))MD.tab='';
    var t=document.createElement('div');t.id='mdTabs';t.className='mdtabs';
    t.innerHTML='<button data-t=""'+(MD.tab?'':' class="on"')+'>Уровни</button>'+IDS.filter(MD.on).map(function(m){var can=MD.can(m);
      return '<button data-t="'+m+'"'+(MD.tab===m?' class="on"':'')+(can?'':' aria-disabled="true"')+'>'+(can?MD.IC[m]:'🔒')+' '+MD.SHORT[m]+'</button>';}).join('');
    list.parentNode.insertBefore(t,list);
    [].forEach.call(t.querySelectorAll('button'),function(b){b.onclick=function(){var m=b.dataset.t;if(m&&!MD.can(m)){toast('«'+MD.NAME[m]+'» откроется с '+MD.open(m)+'-го уровня');return;}
      SND.tap();MD.tab=m;openLevels(c);};});
    if(!MD.tab)return;var m=MD.tab;
    [].forEach.call(list.querySelectorAll('.lv'),function(b){var i=+b.dataset.i;b.classList.add('mdm');
      if(i<(S.lv||0)){var s=document.createElement('span');s.className='mds'+(MD.star(m,i)?' on':'');s.textContent='★';b.appendChild(s);}
      b.onclick=function(){if(i>=(S.lv||0)){toast('Сначала пройди уровень '+((S.lv||0)+1));return;}SND.tap();maybeInterstitial(function(){MD.play(m,i);});};});}

  /* ---------- входы: главный (до VIEW), «Путь» (VIEW), окно победы (открылся режим), «Сегодня у Зины» ---------- */
  function entryHtml(){if(!MD.any())return '';var n=0;IDS.forEach(function(m){if(MD.can(m))n+=MD.stars(m);});
    return '<button type="button" class="mdentry" data-md="go"><b>🔁</b><span>Повторение<small>'+IDS.filter(MD.can).map(function(m){return MD.IC[m];}).join(' ')+(n?' · ⭐ '+n:'')+'</small></span></button>';}
  function entryMount(el){var b=el.querySelector('[data-md="go"]');if(b)b.onclick=function(){SND.tap();ZB.go('modes');};}
  ZB.add(ZB.homeSlots,{id:'mode',zone:'bottom',order:60,render:entryHtml,mount:entryMount});
  ZB.pathSlots=ZB.pathSlots||[];
  ZB.add(ZB.pathSlots,{id:'mode',order:60,
    render:function(ctx){if(!MD.any())return '';var c=ctx&&ctx.c>=0?ctx.c:-1;if(c<0)return entryHtml();
      var from=c*CH_LEN,to=Math.min(from+CH_LEN,S.lv||0);if(to<=from)return '';var h='';
      IDS.forEach(function(m){if(!MD.can(m))return;var n=0;for(var i=from;i<to;i++)if(MD.star(m,i))n++;h+='<span title="'+MD.NAME[m]+'">'+MD.IC[m]+n+'/'+(to-from)+'</span>';});
      return '<button type="button" class="mdchap" data-md="ch" data-c="'+c+'">'+h+'</button>';},
    mount:function(el){entryMount(el);var b=el.querySelector('[data-md="ch"]');if(b)b.onclick=function(){SND.tap();var m=IDS.filter(MD.can)[0];MD.tab=m||'';openLevels(+b.dataset.c);};}});
  // окно победы: только что открылся режим (уровень 30 / 60 / 100) — одной строкой и кнопкой «Попробовать»
  ZB.add(ZB.winSlots,{id:'mode',zone:'extra',order:50,fit:3,
    render:function(ctx){if(!ctx||ctx.mode||ctx.daily||!ctx.first)return '';var m=null;
      IDS.forEach(function(k){if(MD.on(k)&&ctx.idx+1===MD.open(k))m=k;});if(!m)return '';
      return '<p class="mdun">🔓 Открылся режим <b>'+MD.IC[m]+' «'+MD.NAME[m]+'»</b> — в «Повторении»</p><button class="btn ghost small" data-md="try" data-m="'+m+'">Попробовать</button>';},
    mount:function(el){var b=el.querySelector('[data-md="try"]');if(b)b.onclick=function(){var m=b.dataset.m,i=MD.next(m);hideModal();SND.tap();
      stat('try',{m:m});maybeInterstitial(function(){if(i>=0)MD.play(m,i);else ZB.go('modes');});};}});
  // дело дня: «Повтори уровень в режиме» — только когда хоть один режим открыт (SCHOOL сам решает, показывать ли)
  var TASK={id:'mode',order:60,ic:'🔁',sub:'Повторение',t:'Повтори уровень в режиме',on:function(){return MD.any();},done:function(){return MD.today()>0;},go:function(){ZB.go('modes');},
    hint:function(){return 'Любой режим «Повторения»: все слова, сканворд или электричка';}};
  function task(){var i=ZB.todayTasks.indexOf(TASK),on=MD.any();if(on&&i<0)ZB.add(ZB.todayTasks,TASK);else if(!on&&i>=0)ZB.todayTasks.splice(i,1);}
  ZB.on('ready',task);ZB.on('level',task);ZB.on('cloud',task);

  // стили — своим файлом (index.html — зона VIEW)
  ZB.safe('mode:css',function(){if(document.querySelector('link[data-md]'))return;var l=document.createElement('link');l.rel='stylesheet';l.href='css/zb-mode.css';l.setAttribute('data-md','1');document.head.appendChild(l);});
})();
