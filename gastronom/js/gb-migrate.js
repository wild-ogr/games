'use strict';
/* ================= gb-migrate — «Пока вас не было — магазин подрос»: старые игроки — пересчётом, а не обнулением (поток META) =================
   Один раз (флаг S.mtM): разряд — по пройденным уровням (печати за прошлое не требуем: засчитываем дни с заданием дня и не меньше
   порога своего разряда), обстановка (decor, 20 вещей) — вся остаётся «Торговым залом», альбом, талоны (qTal), монеты, покупки — как были.
   ОДНО окно тёти Вали на главном. Ничего старого не трогаем. Выключатель: GB.flag('migrate') (или 'meta').
   Поле S.mtM {b:1 — начал уже в бусте | need:1 — нужен пересчёт, done:1 — пересчитан, shown:1 — окно показано, r — разряд после пересчёта, s — печатей за прошлое}. */
(function(){
if(typeof GB==='undefined'||!window.GBM)return;
var ON=GB.flag('migrate')&&GBM.on;
var M=GBM,num=M.num,isO=M.isO,R=M.R,esc=M.esc,pl=M.pl;
function S_(){return typeof S!=='undefined'?S:null;}
function sv(){try{save();}catch(e){}}
function oldProg(s){return (+s.unlocked||1)>1||num(s.levelsDone)>0;}
function fix(s){s=s||S_();if(!s)return;if(!isO(s.mtM))s.mtM=oldProg(s)?{need:1}:{b:1};var m=s.mtM;['b','need','done','shown'].forEach(function(k){m[k]=m[k]?1:0;});m.r=num(m.r);m.s=num(m.s);}
function merge(s,d){fix(s);var m=s.mtM;if(!d)return;
  if(isO(d.mtM)){var b=d.mtM;['done','shown'].forEach(function(k){if(b[k])m[k]=1;});m.r=Math.max(m.r,num(b.r));m.s=Math.max(m.s,num(b.s));if(b.need&&!m.done){m.need=1;m.b=0;}}
  // старое облако (без mtM) с прогрессом пришло на «новое» устройство — пересчитать
  else if(((+d.unlocked||1)>1||num(d.levelsDone)>0)&&!m.done){m.need=1;m.b=0;}}
GB.onSave({id:'migrate',keys:['mtM'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});
function demo(){try{return !!window.__demo;}catch(e){return false;}}
function pending(){if(!ON||demo())return false;var s=S_();fix(s);return !!(s.mtM.need&&!s.mtM.shown);}
function oldSeals(s){var n=0;try{for(var k in s.daily)if(s.daily[k])n++;}catch(e){}return n;}
// пересчёт молча (без монет): разряд по уровням, печати за прошлое
function run(){var s=S_();fix(s);var m=s.mtM;if(!ON||!m.need||m.done)return false;var lv=M.levels(),r=0;
  for(var i=1;i<10;i++){var x=M.info(i);if(lv>=x.l)r=i;}
  var sd=oldSeals(s),need=r?M.info(r).s:0;s.mtS=Math.max(num(s.mtS),sd,need);
  if(r>num(s.mtR))s.mtR=r;s.mtRs=Math.max(num(s.mtRs),s.mtR); // грамоту отдельно не показываем — всё в одном окне
  m.done=1;m.r=s.mtR;m.s=sd;M.fix();M.checkReady();
  M.stat('mtm',{r:s.mtR,s:sd,l:lv,dc:decorN(s),al:(s.album||[]).length,t:num(s.qTal)});sv();try{cloudSoon();}catch(e){}return true;}
function decorN(s){var n=0;try{for(var k in s.decor)if(s.decor[k])n++;}catch(e){}return n;}
function open(then){if(!pending()){if(then)then();return false;}run();var s=S_(),m=s.mtM;m.shown=1;sv();
  var i=M.info(),dc=decorN(s),al=(s.album||[]).length,t=num(s.qTal),x=M.next();try{STAT.screen('mtm');}catch(e){}
  var L=['🏷 '+R('Разряд')+': <b>«'+esc(i.name)+'»</b> — '+R('по пройденным уровням')+' ('+M.levels()+')',
    dc?'🪴 '+R('Торговый зал')+': <b>'+dc+'</b> '+(typeof LANG!=='undefined'&&LANG==='en'?R('вещей обстановки — всё на месте'):pl(dc,'вещь','вещи','вещей')+' обстановки — всё на месте'):'',
    al?'⭐ '+R('Альбом «Дефицит»')+': <b>'+al+'</b> '+pl(al,'карточка','карточки','карточек'):'',
    t?'🎫 '+R('Талоны ударника')+': <b>'+t+'</b>':'',
    '💰 '+R('Монеты и покупки — как были')].filter(Boolean);
  if(!R('Пока вас не было — магазин подрос')){if(then)then();return false;}
  modal('<div class="mt-mig"><h2>'+esc(R('Пока вас не было — магазин подрос!'))+'</h2>'+
    (typeof valyaHtml==='function'?valyaHtml(QQ(R('Торг хотел закрыть наш магазин — не дам! Посмотрите, что мы с вами уже заработали. Дальше — отделы, план и печати.'))):'')+
    '<div class="mt-migl">'+L.map(function(x){return '<span>'+x+'</span>';}).join('')+'</div>'+
    '<p class="mt-mut">'+esc(R('Каждый день — «План на сегодня»: 3 дела из 5 → печать «План выполнен». Уровни и печати поднимают разряд, монеты — ремонт отделов.'))+
    (x?' '+esc(M.toRank?M.toRank(x.r):R('До')+' «'+M.info(x.r).short+'»')+': '+Math.min(x.lHave,x.l)+'/'+x.l+' '+esc(R('ур.'))+' · '+Math.min(x.sHave,x.s)+'/'+x.s+' '+esc(R('печ.')):'') /* POLISH: прогресс не больше цели (было «4/2 печ.») */+'</p>'+
    '<div class="row"><button type="button" class="btn green" id="mtMigOk">'+esc(R('За работу!'))+'</button></div></div>');
  try{valyaDraw();}catch(e){}try{SND.win();}catch(e){}
  document.getElementById('mtMigOk').onclick=function(){hideModal();try{SND.tap();}catch(e){}if(then)then();else GB.refresh();
    /* POLISH (QA-RU Ф3): подарок «С возвращением» — сразу следом, в тот же запуск (раньше ждал следующего захода) */
    setTimeout(function(){try{if(!modalOn&&window.GBBACK&&GBBACK.due())GBBACK.open();}catch(e){}},400);};return true;}
GB.on('ready',function(){var s=S_();fix(s);if(s.mtM.need&&!s.mtM.done)run();});
GB.on('cloud',function(){var s=S_();fix(s);if(s.mtM.need&&!s.mtM.done)run();});
// окно — на главном, раньше прочих (грамоты, авоськи, подарка вернувшемуся)
function atHome(fn){GB.on('home',fn);GB.on('ready',function(){var m=document.getElementById('scr-map');if(m&&m.classList.contains('on'))fn();});}
var t0=0;atHome(function(){clearTimeout(t0);t0=setTimeout(function(){try{if(modalOn)return;if(G&&!G.won)return;}catch(e){}if(pending()&&(!window.GBPL||!GBPL.nbTurn||GBPL.nbTurn('grown')))open();},600);});
window.GBMIG={pending:pending,run:run,open:open,fix:function(){fix();}};
})();
