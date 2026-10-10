/* STATZB — статистика буста «Школа бабы Зины» (поток TECH, 10.10.2026; журнал hobby-analytics/release-i/zina-boost/logs/TECH.md).
   Дополняет общий модуль STAT v1.4 (блок STAT в js/core.js; сам модуль не меняем). Без личных данных: номер уровня и ход игры.
   Все события ≤ 8 полей, порядок = приоритет (STAT пропускает всё после 8-го), пустые поля не шлём. Файл грузится ПОСЛЕДНИМ из модулей
   (под меткой <!-- zb:TECH -->); не загрузился — игра и старые события работают как раньше.

   ДОГОВОР СОБЫТИЙ (новое и дополненное; старые события — как были):
     end   win  {l, r, s, m, h, f, ms, ct, bw, ex} — m: режим ('daily' | G.mode: 'last'|'scan'|'train' | праздник), ms — промахов за попытку (всего,
                а не подряд), ct:1 — кот Ять помог. При 8+ полях последними отрезаются bw/ex (как и раньше, ex = без подсказок).
           quit {l, r, s, m, h, idle, fw, tw, ms, ct} — fw — найдено слов кроссворда, tw — всего слов (просьба NEWBIE: мерить 1-й уровень).
     lvh   {l, fw, tw, ms, s, m} — свернули игру посреди уровня (пишется ДО pause модуля STAT; в pause модуль сам кладёт pl и l).
     hnt   {l, k, s, n, of, t, m} — каждая подсказка: k = letter | word | cat (кот сам поставил букву); s — откуда: learn (ур. 1–2 даром),
           nb1 (первая даром новичку), day (буква дня), hb (запас 💡), coins, ad (ролик), adf (ролик не пришёл — даром раз в день), zero (NEWBIE: буква даром при нехватке монет),
           idle/miss (кот: простой / 3 промаха); n — найдено слов на момент подсказки, of — всего, t — секунда попытки.
     stk   {l, a:'idle', n, of, t, w, m} — раз за попытку: 40 с игры без нового слова кроссворда (окна/пауза/свёрнуто не считаются);
           w — длина самого короткого из оставшихся слов. (NEWBIE шлёт свои stk a:'blink'|'cat'|'zero' — разные a.)
     wbtn  {l, b, m} — первое нажатие в окне победы: next | menu | box | ask | dly | go | … (id кнопки без «m», data-st, в гнезде — zb:<id гнезда>).
     scr   {n, k, d} — ПОВТОРНЫЙ заход на экран в том же сеансе (первый пишет сам STAT, без k): k — какой по счёту, d — секунд на прошлом экране.
     mdw   {w, l} — свернули игру с открытым окном w (win/hint/shop/…; '?' — неизвестное окно), l — уровень, если шёл.
     def   {a:'tap', l, n} — нажали на разгаданное слово (толкование/шутка «Толкового словаря»), n — длина слова.
     look  {k:'o'|'s', id} — надели наряд (o) / выбрали блюдце (s) (покупка — как раньше spend).
     unlock {k, id, l} — открытие: k = cls (новый класс, id 1–11, 12 выпускной, 13+ Академия) | chap (новая глава id) | five (пятёрка, id = всего);
           источники — ZB.emit('class'), ZB.emit('five') (SCHOOL), смена главы ZBCH.of на первой победе.
     ezb   {mg, mode, cell, buf, cab, cls, season, card, shelf, quest, …} — монеты по источникам буста за заход (общий STAT.earn знает только
           lvl|ad|gift|chest|buy|quest, остальное кладёт в 'oth' — там они и остаются для итога earn; ezb — расшифровка 'oth'), шлётся при сворачивании.
     prg   {w, h, cls, ch, f5, sr, cb, sz} — прохождение раз за загрузку (и после перерыва 30 мин, если изменилось): w — всего слов, h — подсказок,
           cls — класс ZBS.cls(), ch — глава ZBCH, f5 — пятёрок ZBS.five(), sr — серия заданий дня, cb — шагов кабинетов ZBCAB.steps() (0–24),
           sz — размер сохранения в тыс. символов (бюджет облака VK — 54 тыс.).
     ldf   {n, f, w} — прошлая загрузка сорвалась и предохранитель перезагрузил игру: n — попытка, f — файл (js/levels.js), w — net (не скачался) |
           cut (пришёл обрезанным, SyntaxError) | none (после всех файлов нет уровней); шлётся после удачного запуска.
     cloud {a:'big', n} — (core.js) сохранение не влезает в облако VK (n кусков по 900 > 120), раз за сеанс.
     mus   {on} — музыка вкл./выкл., раз за сеанс (cfg модуля STAT берёт только th/snd/calm); {a:'err', c} — трек не загрузился (core.js).
     pl    — STAT.pl(S.lv) после каждой победы (v1.4: поле pl в pause и в start следующего сеанса).
     perf  — плавность: STAT.frame() раз в 0,5 с, пока открыт уровень или мини-игра (модуль сам меряет кадры браузера).
   Свои события других потоков (шлют сами, разделы в hobby-analytics/stat/README.md «Зина буст»): md (MODE: режимы — имя совпадает с «окном при
   сворачивании» Выезда, у Зины md = режимы, окно при сворачивании — mdw), nb (NEWBIE), cab/spend/sos (CAB), mg/note (MG0), ctl (SCHOOL).
   Вход для других потоков: STATZB.wnd('имя') — назвать своё окно (сразу после modal()); кнопкам окна победы — атрибут data-st="имя".
   Старый синтаксис (var/function), без ?. ?? .at :has. Выключение — window.STATZB_ON=false до загрузки файла. */
(function(){
  'use strict';
  if(window.STATZB_ON===false||window.STATZB)return;
  function S_(){return typeof STAT!=='undefined'&&STAT&&STAT.ev?STAT:null;}
  function ev(n,p){var s=S_();if(!s)return;var o={},k;for(k in p)if(p.hasOwnProperty(k)&&p[k]!==undefined&&p[k]!==null&&p[k]!=='')o[k]=p[k];try{s.ev(n,o);}catch(e){}}
  function g(){try{return typeof G!=='undefined'?G:null;}catch(e){return null;}}
  function sv(){try{return typeof S!=='undefined'?S:null;}catch(e){return null;}}
  function now(){return Date.now();}
  function $(id){return document.getElementById(id);}
  function on(id){var e=$(id);return !!(e&&e.classList.contains('on'));}
  function modalOn(){return on('modal');}
  function skNow(){try{var d=STAT._dbg();return d&&d.hdr&&d.hdr.sk||'';}catch(e){return '';}}
  function wrapFn(name,after,before){var f=window[name];if(typeof f!=='function'||f.__zbs)return false;
    var w=function(){var x;try{if(before)x=before.apply(this,arguments);}catch(e){}var r=f.apply(this,arguments);
      try{if(after)after.apply(this,[x,r].concat([].slice.call(arguments)));}catch(e){}return r;};
    w.__zbs=1;w.__orig=f;window[name]=w;return true;}
  function wrapStat(name,fn){var s=S_();if(!s||typeof s[name]!=='function'||s[name].__zbs)return;var f0=s[name];var w=function(){return fn(f0,s,arguments);};w.__zbs=1;s[name]=w;}

  // ---- текущая попытка: промахи (всего), кот, слово, подсказки ----
  var cur={g:null,ms:0,ct:0,lw:0,act:0,stk:0},pend=null;
  function att(){var G_=g();if(G_&&cur.g!==G_)cur={g:G_,ms:0,ct:0,lw:now(),act:0,stk:0};return G_;}
  function mode(G_){if(!G_)return '';if(G_.daily)return 'daily';return String(G_.mode||'').slice(0,10);}
  function found(G_){var n=0,i;if(!G_||!G_.words)return 0;for(i=0;i<G_.words.length;i++)if(G_.words[i].found)n++;return n;}
  function secOf(G_){return G_&&G_.t0?Math.round((now()-G_.t0)/1000):undefined;}
  function L(G_){return G_?G_.idx+1:undefined;}
  wrapFn('flashPreview',function(x,r,w,kind){if(kind==='bad'&&att())cur.ms++;});
  wrapFn('foundWord',function(x,r,wd,byHint){if(!byHint&&att()){cur.lw=now();cur.act=0;}});
  wrapFn('catHelp',function(x,r,force){if(r&&att()){var G_=g();cur.ct=1;ev('hnt',{l:L(G_),k:'cat',s:force?'miss':'idle',n:found(G_),of:G_.words.length,t:secOf(G_),m:mode(G_)});}});
  // источник подсказки: состояние до вызова (даром/день/запас), дальше окно оплаты уточняет (spend → coins, place → ad, adf → adf)
  wrapFn('hintLetter',null,function(){var G_=att();if(!G_||G_.won)return;var s='pay';
    try{if(typeof learnFree==='function'&&learnFree())s='learn';else if(typeof hfFree==='function'&&hfFree())s='nb1';
      else if(typeof freeLeft==='function'&&freeLeft())s='day';else if(typeof hbN==='function'&&hbN())s='hb';}catch(e){}
    pend={k:'letter',s:s};});
  wrapFn('hintWord',null,function(){if(att())pend={k:'word',s:'pay'};});
  // кнопки 💡/📜 привязаны в ui.js к самим функциям (до этого файла) — перепривязать к обёрткам
  (function(){var a=$('hLet'),b=$('hWord');try{if(a&&window.hintLetter.__orig&&a.onclick===window.hintLetter.__orig)a.onclick=window.hintLetter;
    if(b&&window.hintWord.__orig&&b.onclick===window.hintWord.__orig)b.onclick=window.hintWord;}catch(e){}})();
  wrapStat('ev',function(f0,s,a){try{var n=a[0],p=a[1]||{};if(pend&&n==='spend'&&(p.k==='letter'||p.k==='word'))pend.s='coins';else if(pend&&n==='adf')pend.s='adf';else if(pend&&n==='nb'&&p.a==='zero')pend.s='zero'; /* NEWBIE: буква даром при нехватке (nb zero шлётся до открытия буквы) */}catch(e){}return f0.apply(s,a);});
  wrapStat('place',function(f0,s,a){try{if(pend&&(a[0]==='letter'||a[0]==='word'))pend.s='ad';}catch(e){}return f0.apply(s,a);});
  wrapStat('use',function(f0,s,a){try{if(a[0]==='hint'){var G_=att(),p=pend||{k:'letter',s:'?'};pend=null;
      if(G_)ev('hnt',{l:L(G_),k:p.k,s:p.s==='pay'?'?':p.s,n:found(G_),of:G_.words.length,t:secOf(G_),m:mode(G_)});}}catch(e){}return f0.apply(s,a);});

  // ---- итог попытки: дополняем end (порядок полей = приоритет) ----
  wrapStat('end',function(f0,s,a){var r=a[0],p=a[1]||{},o={},k;try{var G_=att()||(cur.g&&!cur.g.won?cur.g:null); /* «назад» в уровне обнуляет G до openMenu — берём попытку из памяти */
      if(G_){var m=mode(G_);if(m&&m!=='daily')o.m=m;
        if(r==='win'){if(p.f!==undefined)o.f=p.f;if(cur.ms)o.ms=cur.ms;if(cur.ct)o.ct=1;}
        else{o.fw=found(G_);o.tw=G_.words.length;if(cur.ms)o.ms=cur.ms;if(cur.ct)o.ct=1;}}
      for(k in p)if(p.hasOwnProperty(k)&&o[k]===undefined)o[k]=p[k];}catch(e){o=p;}
    return f0.call(s,r,o);});

  if(typeof ZB!=='undefined'&&ZB.startHook)ZB.startHook.push(function(){att();});
  // ---- застревание: 40 с ИГРЫ без нового слова (окно, пауза, свёрнуто — не в счёт), раз за попытку ----
  var STK_S=40;
  setInterval(function(){var G_=g();if(!G_||G_.won||!on('game')||modalOn()||document.hidden)return;try{if(typeof paused!=='undefined'&&paused)return;}catch(e){}
    att();cur.act++;if(cur.stk||cur.act<STK_S)return;cur.stk=1;var w=99,i;for(i=0;i<G_.words.length;i++)if(!G_.words[i].found&&G_.words[i].w.length<w)w=G_.words[i].w.length;
    ev('stk',{l:L(G_),a:'idle',n:found(G_),of:G_.words.length,t:secOf(G_),w:w<99?w:undefined,m:mode(G_)});},1000);

  // ---- плавность: STAT.frame(), пока открыт уровень или мини-игра ----
  setInterval(function(){var s=S_();if(!s||!s.frame||document.hidden)return;var G_=g(),mg=document.querySelector&&document.documentElement.classList.contains('zmg-open');
    if((G_&&!G_.won&&on('game'))||mg)s.frame();},500);

  // ---- окна: какое открыто сейчас ----
  var wName='',wEl=null,wClick=null;
  function wnd(n){wName=String(n||'?').slice(0,12);var c=$('mcard');wEl=c&&c.firstElementChild;}
  function curWnd(){if(!modalOn())return '';var c=$('mcard');return c&&wEl&&c.firstElementChild===wEl?wName:'?';}
  function bName(b){var z=b.closest&&b.closest('[data-zb]');var x=b.getAttribute('data-st')||b.id||'';x=x.replace(/^m(?=[A-Z])/,'').toLowerCase();
    if(!b.getAttribute('data-st')&&z&&!b.id)x='zb:'+z.getAttribute('data-zb');return (x||'btn').slice(0,14);}
  wrapFn('winModal',function(x,r,G0){wnd('win');wClick=G0||g();});
  wrapFn('pay',function(){if(modalOn())wnd('hint');});
  wrapFn('openShop',function(){wnd('shop');});
  document.addEventListener('click',function(e){var t=e.target;if(!t||!t.closest)return;
    var b=t.closest('#mcard button');
    if(b&&wClick&&curWnd()==='win'){var G0=wClick;wClick=null;ev('wbtn',{l:L(G0),b:bName(b),m:mode(G0)});}
    var c=t.closest('#grid .cell');if(c&&!(g()&&g().hintMode)){var G_=g();if(G_){var ws=0,i;
      try{for(i=0;i<G_.words.length;i++){var wd=G_.words[i];if(wd.found&&typeof wordCells==='function'&&wordCells(wd).some(function(q){return q.el===c;})){ws=wd.w.length;break;}}}catch(x){}
      if(ws&&now()-defT>1500){defT=now();ev('def',{a:'tap',l:L(G_),n:ws});}}}
  },true);
  var defT=0;

  // ---- экраны: каждый заход (не только первый за сеанс) ----
  var sk0='',cnt={},lastScr='',lastT=now();
  wrapStat('screen',function(f0,s,a){var r=f0.apply(s,a);try{var n=String(a[0]).slice(0,16),sk=skNow();if(sk!==sk0){sk0=sk;cnt={};}
      if(n!==lastScr){var d=Math.round((now()-lastT)/1000);cnt[n]=(cnt[n]||0)+1;if(cnt[n]>=2&&n!=='game')ev('scr',{n:n,k:cnt[n],d:d});lastScr=n;lastT=now();}}catch(e){}return r;});

  // ---- свернули: окно и уровень (слушаем на window в фазе захвата — раньше модуля STAT, его pause идёт после) ----
  window.addEventListener('visibilitychange',function(){if(document.visibilityState!=='hidden')return;
    var w=curWnd(),G_=g(),lv=G_&&!G_.won&&on('game');
    if(w)ev('mdw',{w:w,l:lv?L(G_):undefined});
    if(lv){att();ev('lvh',{l:L(G_),fw:found(G_),tw:G_.words.length,ms:cur.ms||undefined,s:secOf(G_),m:mode(G_)});}
    earnOut();},true);

  // ---- монеты: источники буста (общий STAT.earn их кладёт в 'oth' — оставляем, плюс своя расшифровка ezb) ----
  var eZ=null,KNOWN=/^(lvl|ad|gift|chest|buy|quest)$/;
  wrapStat('earn',function(f0,s,a){try{var src=String(a[0]||''),n=+a[1];if(n>0&&!KNOWN.test(src)){src=src.replace(/[^a-z0-9]/gi,'').slice(0,8)||'oth';eZ=eZ||{};eZ[src]=(eZ[src]||0)+n;}}catch(e){}
    return f0.apply(s,a);});
  function earnOut(){if(!eZ)return;var p=eZ,k=Object.keys(p),i,o;eZ=null;for(i=0;i<k.length;i+=8){o={};k.slice(i,i+8).forEach(function(x){o[x]=p[x];});ev('ezb',o);}} /* ≤8 полей в событии — источников больше 8 → несколько ezb */

  // ---- наряды/блюдца: надели (сравнение после save) ----
  var lk=null;
  wrapFn('save',function(){var s=sv();if(!s)return;var o=s.outfit||'',k=s.skin||'';if(!lk){lk={o:o,s:k};return;}
    if(o!==lk.o){lk.o=o;ev('look',{k:'o',id:String(o).slice(0,12)});}if(k!==lk.s){lk.s=k;ev('look',{k:'s',id:String(k).slice(0,12)});}});
  (function(){var s=sv();if(s)lk={o:s.outfit||'',s:s.skin||''};})();

  // ---- открытия и победы: класс, пятёрка, глава; STAT.pl ----
  function num(v){return typeof v==='number'&&isFinite(v);}
  if(typeof ZB!=='undefined'&&ZB.on){
    ZB.on('class',function(n){ev('unlock',{k:'cls',id:+n||0,l:+(sv()||{}).lv||0});});
    ZB.on('five',function(d){ev('unlock',{k:'five',id:d&&num(d.all)?d.all:undefined,l:+(sv()||{}).lv||0});});
    ZB.levelHook.push(function(i){if(!i||!i.ok)return;var s=S_(),st=sv();try{if(s&&s.pl&&st)s.pl(+st.lv||0);}catch(e){}
      try{if(i.first&&!i.daily&&window.ZBCH&&ZBCH.of){var a=ZBCH.of(i.l),b=ZBCH.of(i.l+1);if(a&&b&&b.n!==a.n)ev('unlock',{k:'chap',id:b.n,l:i.l});}}catch(e){}});
  }

  // ---- prg: прохождение ----
  var prgK='',prgOn=0,musK='';
  function call(o,f){try{var v=o&&typeof o[f]==='function'?o[f]():undefined;return num(v)?Math.round(v):undefined;}catch(e){return undefined;}}
  function prg(){var s=sv();if(!S_()||!s)return;prgOn=1;var w,ch,sz;
    try{w=typeof wordsTotal==='function'?wordsTotal():undefined;}catch(e){}
    try{if(window.ZBCH&&ZBCH.of)ch=ZBCH.of(Math.max(1,(+s.lv||0)+1)).n;}catch(e){}
    try{sz=Math.round(JSON.stringify(s).length/1000);}catch(e){}
    var f5=window.ZBS?ZBS.five:null;f5=typeof f5==='function'?call(window.ZBS,'five'):undefined;
    var p={w:num(w)?w:undefined,h:+s.hintsUsed||0,cls:call(window.ZBS,'cls'),ch:ch,f5:f5,sr:+s.streak||0,cb:call(window.ZBCAB,'steps'),sz:sz};
    var mk=skNow();if(mk!==musK){musK=mk;ev('mus',{on:s.music?1:0});}
    var j=JSON.stringify(p);if(j===prgK)return;prgK=j;ev('prg',p);}
  var hidT=0;
  document.addEventListener('visibilitychange',function(){if(document.hidden){hidT=now();return;}if(prgOn&&hidT&&now()-hidT>30*60e3)setTimeout(prg,500);});
  // statProg (core.js) зовётся через 2,5 с после запуска — prg чуть позже, когда модули буста готовы
  // ldf: прошлый запуск не загрузился (предохранитель в <head> перезагрузил) — что и сколько раз; шлём после удачного запуска
  function ldf(){try{if(typeof LEVELS==='undefined'||document.getElementById('ldfail'))return; /* запуск не удался — запись оставляем следующему */var x=sessionStorage.getItem('ldlog');if(!x)return;sessionStorage.removeItem('ldlog');var o=JSON.parse(x)||{};ev('ldf',{n:+o.n||1,f:o.f,w:o.w});}catch(e){}}
  function boot(){setTimeout(prg,3000);setTimeout(ldf,1500);}
  if(typeof ZB!=='undefined'&&ZB.isReady)boot();else if(typeof ZB!=='undefined'&&ZB.on)ZB.on('ready',boot);else window.addEventListener('load',boot);

  window.STATZB={wnd:wnd,prg:prg,_set:function(o){if(o&&o.stk)STK_S=+o.stk;},_dbg:function(){return {cur:{ms:cur.ms,ct:cur.ct,act:cur.act,stk:cur.stk},pend:pend,wnd:curWnd(),cnt:cnt,prg:prgK,eZ:eZ};}};
})();
