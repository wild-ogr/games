'use strict';
/* ================= fest-zb — праздники «Школы бабы Зины» (поток FEST, буст 10.2026) → window.FESTZB =================
   Общий модуль дат/оформления/STAT — js/fest.js (FEST, fest-sync.sh; сам не правим). Здесь — только Зина:
   1) «Осенние каникулы: Страшилки в пионерлагере» (FEST hw26/hw27, 26.10–02.11): 10 праздничных уровней с клеткой-«паутинкой»
      (lv.z.w — сметаешь своим словом: +монета; подсказкой/котом — паутинка остаётся), открываются по одному в день (с первого дня — 3),
      все 10 → наряд «Ведьма в платочке» (на Яндексе — «Осенний платочек»; праздник там — «Осенний вечер» без страшилок в названиях).
      Мини-игры праздника — «Вечерка-страшилки» (MGA, vecherka) и «Ять ловит тыквы» (MGC, lovit) через ZMG.open(id,{mode:'fest'}) — если MG0 есть.
   2) День бабушек 28.10 (FEST bab26/bab27): окно «Открытка для бабы Зины» в главном, раз в год — подарок.
   3) Листья (FEST osen26 до 14.11) → снег (zima26 с 15.11): оформление главного и уровня (css/fest-zb.css; частицы — модуль FEST, в уровне выключены).
   4) «Новогодний утренник» (FEST ny27/ny28, 15.12–14.01): 20 уровней (с первого дня — 4, потом +1 в день), все 20 → блюдце «Новогоднее»;
      «Новогодний кроссворд» (MGA, vecherka) и «Телеграмма Деда Мороза» (MGB, telegramma).
   5) Четверти/каникулы для SCHOOL: FESTZB.quarter() → {id,n,from,to,fest,ic} | null; FESTZB.quarters — вся таблица; FESTZB.now() → идущий праздник Зины.
   Уровни — js/fest-levels-zb.js (генерирует tools/fest_zb.py; грузится лениво ZB.load при первом входе в праздник).
   Встраивание без переписывания чужого: обёртки глобальных функций levelData/levelKey/ribbon/finishLevel/winModal/wordInfo/foundWord/openShop/
   mergeSave-нет (облако — ZB.onSave). Праздничный уровень: G.fest={k,id,n}, G.mode='fest', STAT.lvl(n,'fest',{e:id}); ZB.startHook/levelHook видят mode:'fest'
   (SCHOOL/MODE/ECO: праздничный уровень не считать «уроком»/уровнем пути, если не нужно). Прогресс пути (S.lv), «Отличник», главы — не трогаются.
   Сохранение: S.fest — модуль FEST; S.fs = {hw26:{d:'1101…' пройдено, w:сметено паутинок, p:1 приз}, bab26:{c:номер открытки}, …} (ZB.onSave 'fest', объединение).
   Выключение: window.FESTZB_ON=false (до загрузки) — ничего не делает; FESTZB.OFF.hw / .ny / .bab / .deco = true — по частям.
   Проверка без ожидания даты (только мак/LAN): ?date=2026-10-30 — «сегодня» для всей игры (часы игры и FEST вместе); ?fest=hw26 — только FEST.
*/
(function(){
if(window.FESTZB_ON===false||typeof FEST==='undefined'||typeof startLevel!=='function'||typeof S==='undefined'||typeof ZB==='undefined')return;
var D=document,$$=function(id){return D.getElementById(id);};
(function(){if($$('fzCss'))return;var l=D.createElement('link');l.id='fzCss';l.rel='stylesheet';l.href='css/fest-zb.css';D.head.appendChild(l);})();
var LOC=location.protocol==='file:'||/^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(location.hostname);

/* ---- 0. ?date=ГГГГ-ММ-ДД — сдвиг часов игры (только мак/LAN) ---- */
(function(){var m=/[?&]date=(\d{4})-(\d\d)-(\d\d)/.exec(location.search);if(!m||!LOC||/[?&]vk_app_id=/.test(location.search))return;
  var sh=Date.UTC(+m[1],+m[2]-1,+m[3],9,0,0)-Date.now(); // полдень по Москве этого дня
  var o=nowMs;nowMs=function(){return o()+sh;};window.DATE_SHIFT=sh;})();

/* ---- 1. данные ---- */
var YA=typeof PLAT!=='undefined'&&PLAT!=='vk'; // Яндекс: «Осенний вечер» без страшилок в названиях
var OFF={};
var EVS={
  hw:{k:'hw',ids:['hw26','hw27'],n:10,start:3,lvPrize:50,
    title:YA?'Осенний вечер':'Страшилки в пионерлагере',short:YA?'Осенний вечер':'Страшилки',one:YA?'Вечер':'Страшилка',sub:'Осенние каникулы',ic:YA?'🍂':'🌙',
    unit:YA?['вечер','вечера','вечеров']:['страшилка','страшилки','страшилок'],
    names:YA?['Комариный писк','Скрип половицы','Пионерский костёр','Рыжий кот на заборе','Летучая мышка','Ровно в полночь','Тёмный вечер','Утренний горн','Паутинка на чердаке','Сказка за печкой']
      :['Комариный писк','Скрип половицы','Пионерская клятва','Ведьма из третьего отряда','Вампир в столовой','Ровно в полночь','Тёмная-тёмная палата','Горнист-призрак','Паутинка на чердаке','Кикимора за печкой'],
    say:YA?['Осенний вечер, чай с вареньем и кроссворд — что ещё надо?','За окном листья летят, а у нас — слова.','Паутинку сметай своим словом — паук не обидится.','Листопад — дело хорошее. Только дворник не согласен.']
      :['Слушай страшилку, только не пугайся — это я так, для настроения.','В одном тёмном-тёмном лагере жила-была… баба Зина. Ищи слова!','Фонарик у тебя? А у меня кот. Тоже светится — глазами.','Паутинку сметай своим словом — паук спасибо скажет.','Не бойся, это не привидение, это Ять в простыне.'],
    prize:{t:'o',id:'fwitch'},mg:[['vecherka',YA?'Осенняя «Вечерка»':'«Вечерка-страшилки»'],['lovit','Ять ловит тыквы']],skin:YA?'autumn':'halloween',cls:'fzhw',web:true},
  ny:{k:'ny',ids:['ny27','ny28'],n:20,start:4,lvPrize:100,
    title:'Новогодний утренник',short:'Утренник',one:'Номер',sub:'Ёлка в актовом зале',ic:'🎄',unit:['номер','номера','номеров'],
    names:['Сосна в сугробе','Тазик оливье','Ледяная горка','Холодец на балконе','Дрова для печки','Дедушкин подарок','Морозко в лесу','Зимушка-зима','Варежки на резинке','Поленья у печки',
      'Коляда под окном','Ледянка с горки','Бой курантов','Снежинка в марле','Баранки к чаю','Печурка трещит','Мандарины в сетке','Заливное к столу','Снегурка опаздывает','Снеговик у подъезда'],
    say:['Ёлку нарядили, теперь и кроссворд нарядим!','На утреннике я всегда была Снежинкой. Ну, почти всегда.','Мандарин почистить или сначала слово найти? Давай слово.','Дед Мороз опаздывает — он в пробке. Решим пока номер!','Кто расскажет стишок — тому конфета. Кто найдёт все слова — две!'],
    prize:{t:'s',id:'fny'},mg:[['vecherka','Новогодний кроссворд'],['telegramma','Телеграмма Деда Мороза']],skin:'ny',cls:'fzny',web:false}};
var BAB=['bab26','bab27'];
// четверти и каникулы (для SCHOOL: сезон-четверть). from/to — по Москве, включительно
var Q=[
  {id:'osk26',n:'Осенние каникулы',ic:'🍂',from:'2026-10-26',to:'2026-11-02',fest:'hw26'},
  {id:'zk27',n:'Новогодний утренник',ic:'🎄',from:'2026-12-15',to:'2027-01-14',fest:'ny27'},
  {id:'mar27',n:'8 Марта',ic:'🌼',from:'2027-03-06',to:'2027-03-08',fest:'mar27'},
  {id:'zv27',n:'Последний звонок',ic:'🔔',from:'2027-05-25',to:'2027-05-25',fest:''},
  {id:'osk27',n:'Осенние каникулы',ic:'🍂',from:'2027-10-25',to:'2027-11-01',fest:'hw27'},
  {id:'zk28',n:'Новогодний утренник',ic:'🎄',from:'2027-12-15',to:'2028-01-14',fest:'ny28'}];
var MIN_LV=3; // праздник виден с 4-го уровня (первые три — знакомство)
var E=function(){return window.ZBECO||{};};
var num=function(path,def){var e=E().fest||{};return e[path]!=null?+e[path]:def;}; // числа — ZBECO.fest {lv,web,hw,ny,bab} (просьба ECO), запасные — здесь
var pick=function(a){return a[Math.floor(Math.random()*a.length)];};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};

/* ---- 2. наряд и блюдце-награды (в «Обликах» видны, только когда получены или праздник идёт) ---- */
var PRIZE={
  fwitch:{t:'o',it:{id:'fwitch',n:YA?'Осенний платочек':'Ведьма в платочке',gift:'fest',
    d:YA?'Тёмная кофта и рыжий платок в горошек. Для долгих осенних вечеров и походов за опятами.':'Тёмная кофта, рыжий платок и брошь-паучок. Страшно только соседке Гале — она тоже такую хотела.',
    c1:'#4a2d6b',c2:'#2f1a47',f:'#1f1030',beads:'amber',scarf:{c:'#ef7d1a',dot:'#2b1640'},brooch:1},ev:'hw'},
  fny:{t:'s',it:{id:'fny',n:'Новогоднее',gift:'fest',d:'Блюдце с ёлочками. Достаётся тем, кто прошёл весь «Новогодний утренник».',
    lc:'#b3202a',lb:'rgba(230,80,80,.12)',on:'#2f7d3a',onc:'#fff',line:'#2f7d3a',sh:'#c9e3c9'},ev:'ny'}};
function hasPrize(id){return !!(S.own||{})[PRIZE[id].t+':'+id];}
function prizeVisible(id){return hasPrize(id)||!!cur(PRIZE[id].ev);}
function addPrizes(){for(var id in PRIZE){var p=PRIZE[id],L=p.t==='o'?(typeof OUTFITS!=='undefined'?OUTFITS:null):(typeof SKINS!=='undefined'?SKINS:null);if(!L)continue;
  var at=-1;for(var i=0;i<L.length;i++)if(L[i].id===id)at=i;
  if(prizeVisible(id)){if(at<0)L.push(p.it);}else if(at>=0)L.splice(at,1);}
  // наряд надет, а рисунок появился позже первого кадра меню/уровня — перерисовать
  var ha=$$('heroArt');if(ha&&S.outfit==='fwitch'&&ha.dataset.o==='fwitch'&&!ha.dataset.fz){ha.dataset.fz=1;ha.dataset.o='';}
  var av=$$('zAv');if(av&&S.outfit==='fwitch'&&!av.dataset.fz){av.dataset.fz=1;av.dataset.o='';}}

/* ---- 3. состояние ---- */
function fs(id){S.fs=S.fs||{};var x=S.fs[id];if(!x||typeof x!=='object')x=S.fs[id]={};return x;}
function doneStr(id){return String(fs(id).d||'');}
function isDone(id,n){return doneStr(id)[n]==='1';}
function doneN(id){return (doneStr(id).match(/1/g)||[]).length;}
function setDone(id,n){var d=doneStr(id);while(d.length<=n)d+='0';fs(id).d=d.slice(0,n)+'1'+d.slice(n+1);}
// идущий праздник ключа k ('hw'|'ny'): id из таблицы FEST или null
function cur(k){var ev=EVS[k];if(!ev||OFF[k])return null;for(var i=0;i<ev.ids.length;i++)if(FEST.on(ev.ids[i]))return ev.ids[i];return null;}
function avail(k,id){var ev=EVS[k];if(/[?&]fest=/.test(location.search)&&LOC)return ev.n;return Math.min(ev.n,ev.start+Math.max(0,(FEST.day(id)||1)-1));}
function nextN(k,id){var ev=EVS[k];for(var i=0;i<ev.n;i++)if(!isDone(id,i))return i;return -1;}
function canPlay(k,id,n){return n<avail(k,id)&&(n===0||isDone(id,n-1));}
function lvlOk(){return (S.lv||0)>=MIN_LV;}
function now(){var r=null;['hw','ny'].forEach(function(k){var id=cur(k);if(id&&!r)r={k:k,id:id,title:EVS[k].title,ic:EVS[k].ic,left:FEST.left(id),day:FEST.day(id)};});return r;}
function quarter(){var t=FEST.today();for(var i=0;i<Q.length;i++)if(Q[i].from<=t&&t<=Q[i].to)return Q[i];return null;}

/* ---- 4. уровни праздника (лениво) ---- */
var LV=null;
function loadLv(){if(window.FESTZB_LV)return Promise.resolve(LV=window.FESTZB_LV);
  return ZB.load('js/fest-levels-zb.js').then(function(){LV=window.FESTZB_LV;if(!LV)throw new Error('нет уровней');return LV;});}
var P=null; // запускаемый праздничный уровень {k,id,n,lv,arm}
var oLevelData=levelData;levelData=function(idx,daily){if(P&&P.arm)return P.lv;return oLevelData.apply(this,arguments);};
var oLevelKey=levelKey;levelKey=function(idx,daily){if(P&&P.arm)return 'F'+P.id+'_'+P.n;return oLevelKey.apply(this,arguments);};
var oRibbon=ribbon;ribbon=function(idx,daily){oRibbon.apply(this,arguments);var f=P&&P.arm?P:G&&G.fest;if(!f)return;
  var r=$$('gRib'),gs=$$('gSub'),ev=EVS[f.k],c=f.k==='hw'?'#e7dcf5':'#dcefe0';if(!r||!gs)return;
  r.style.setProperty('--rc',c);r.style.setProperty('--rb',typeof shade==='function'?shade(c,.28):c);
  gs.dataset.full=ev.ic+' '+ev.short+' '+(f.n+1)+'/'+ev.n;var gt=$$('gTitle');if(gt)gt.textContent=ev.one+' '+(f.n+1);gs.dataset.short=ev.ic+' '+(f.n+1)+'/'+ev.n;gs.title=ev.names[f.n]||'';if(typeof fitSub==='function')fitSub();};
// ZB.start видит праздник (стоит первым в очереди хуков)
ZB.startHook.unshift(function(info){if(P&&P.arm){info.mode='fest';info.fest=P.id;}});
function play(k,n){var id=cur(k);if(!id){toast('Праздник уже закончился — до следующего года!');return;}
  if(!canPlay(k,id,n)){toast(n>=avail(k,id)?'Этот номер откроется завтра':'Сначала пройди предыдущий');return;}
  loadLv().then(function(L){var lv=L[k]&&L[k][n];if(!lv)return;
    var go=function(){P={k:k,id:id,n:n,lv:lv,arm:true};var oL=STAT.lvl;STAT.lvl=function(){return oL.call(STAT,n+1,'fest',{e:id});};
      try{startLevel(Math.max(0,Math.min((S.lv||0),LEVELS.length-1)),false);}finally{STAT.lvl=oL;if(P)P.arm=false;}
      if(!G||G.lv!==lv)return;
      G.fest={k:k,id:id,n:n};G.mode='fest';
      if(G.rid){try{wordCells(G.rid).forEach(function(c){c.el.classList.remove('rid');});}catch(e){}G.rid=null;}
      D.body.classList.add('fzlv',EVS[k].cls);webStart(G);FEST.use(id,'lvl');
      zina('«'+EVS[k].names[n]+'». '+pick(EVS[k].say),'happy',6);
      ribbon(G.idx,false);};
    if(typeof maybeInterstitial==='function')maybeInterstitial(go);else go();
  },function(){toast('Не удалось загрузить праздник — проверь интернет');});}
// ушли с уровня — снимаем праздничный вид
ZB.on('screen',function(sc){if(sc!=='game'){D.body.classList.remove('fzlv','fzhw','fzny');}try{FEST.fx(sc!=='game');}catch(e){}});
ZB.on('start',function(info){if(!info||info.mode!=='fest')D.body.classList.remove('fzlv','fzhw','fzny');});
// толкования праздничных слов, которых нет в словаре
var oWordInfo=wordInfo;wordInfo=function(w){var t=oWordInfo.apply(this,arguments);if(t)return t;var g=window.FESTZB_FG||{};
  return g[w]?w[0].toUpperCase()+w.slice(1)+' — '+g[w]+'.':'';};

/* ---- 5. паутинка: клетки lv.z.w затянуты; слово найдено своим — паутинка сметена (+монета), подсказкой — остаётся ---- */
function webStart(g){g.fw={};var z=g.lv.z;if(!z||!z.w||!EVS[g.fest.k].web)return;
  z.w.forEach(function(k){var c=g.cells.get(k);if(!c)return;
    var wds=g.words.filter(function(wd){return wordCells(wd).indexOf(c)>=0;}),found=wds.some(function(wd){return wd.found;});
    if(found)g.fw[k]=1;else{g.fw[k]=0;c.fzw=1;c.el.classList.add('fzw');}});
  if(String(S.fsT||'').indexOf('w')<0){S.fsT=String(S.fsT||'')+'w';save();setTimeout(function(){if(G===g&&!g.won)zina(YA?'Видишь паутинку на клетках? Найди это слово сам — сметёшь её и получишь монетку. Подсказка паутину не берёт!':'Паутинка на клетках! Найди слово сам — сметёшь её и получишь монетку. Подсказка паутину не берёт — пауки упрямые.','wow',8);},6500);}}
function webSweep(wd,byHint){var g=G;if(!g||!g.fest||!g.fw)return;wordCells(wd).forEach(function(c){var k=cellKey(c.x,c.y);if(g.fw[k]!==0)return;
  if(byHint)return; // подсказка/кот — паутинка остаётся (её сметёт только своё слово)
  g.fw[k]=1;c.fzw=0;var e=c.el;if(e){e.classList.add('fzws');setTimeout(function(){e.classList.remove('fzw','fzws');},CALM()?0:450);}});}
var oFound=foundWord;foundWord=function(wd,byHint){if(G&&G.fest)ZB.safe('fest-web',function(){webSweep(wd,byHint);});return oFound.apply(this,arguments);};
function webCount(g){var n=0,all=0;for(var k in g.fw||{}){all++;if(g.fw[k]===1)n++;}return {n:n,all:all};}

/* ---- 6. победа праздничного уровня ---- */
var oFinish=finishLevel;finishLevel=function(g){if(!g||!g.fest)return oFinish.apply(this,arguments);
  var f=g.fest,ev=EVS[f.k],first=!isDone(f.id,f.n),w=webCount(g),reward=0,web=0,bonus=0,prize=null;
  if(first){reward=num('lv',15);web=w.n*num('web',1);setDone(f.id,f.n);fs(f.id).w=(+fs(f.id).w||0)+w.n;}
  else reward=typeof ECO!=='undefined'?ECO.replay||1:1;
  if(first&&doneN(f.id)>=ev.n&&FEST.give(f.id,'main')){var pid=ev.prize.id;S.own=S.own||{};S.own[ev.prize.t+':'+pid]=1;fs(f.id).p=1;prize=pid;bonus=num(f.k,ev.lvPrize);addPrizes();}
  // слова уровня с шутками — в «Толковый словарь», как обычно (основа праздника — нет: её шутка живёт в празднике)
  delete S.curs[g.key];addCoins(reward+web+bonus,'fest');save();if(typeof cloudSoon==='function')cloudSoon();
  if(first)S.wins=(S.wins||0)+1;if(typeof vkmCheck==='function')vkmCheck();
  return {first:first,reward:reward+web+bonus,base:reward,web:web,bonus:bonus,webAll:w.all,dw:null,isNew:false,streak:0,sbonus:0,exc:!g.hinted,exBonus:0,exLoud:false,week:0,chap:0,dk:0,rankUp:'',test:false,
    fest:f,prize:prize,done:doneN(f.id)};};
var oWin=winModal;winModal=function(g,r,again){if(!g||!g.fest)return oWin.apply(this,arguments);return festWin(g,r,again);};
function festWin(g,r,again){var f=g.fest,ev=EVS[f.k],base=g.lv.d,fd=(window.FESTZB_FD||{})[base]||'',nx=nextN(f.k,f.id),can=nx>=0&&cur(f.k)===f.id&&canPlay(f.k,f.id,nx);
  var pz=r.prize?PRIZE[r.prize].it:null;
  var title=r.title||(r.title=r.prize?(f.k==='hw'?(YA?'Все вечера позади!':'Все страшилки рассказаны!'):'Утренник удался!'):r.first?pick(f.k==='hw'?(YA?['Тёплый вечер!','Вот это вечер!','Уютненько!']:['Не страшно!','Страшилка побеждена!','Ух, пронесло!']):['С праздником!','Ёлочка, гори!','Номер удался!']):'Ещё раз — и снова вышло!');
  modal('<div class="'+(again?'':'win')+' fzwin '+ev.cls+'"><h2>'+title+'</h2>'+
    (pz?'<div class="fzprize"><div class="fzpv">'+(PRIZE[r.prize].t==='o'?zinaSVG('happy',pz.id):'<div class="mini" id="fzPlate" style="width:96px;height:96px;--lc:'+pz.lc+'"><div class="plate"></div></div>')+'</div>'+
      '<p><b>'+(PRIZE[r.prize].t==='o'?'Наряд':'Блюдце')+' «'+esc(pz.n)+'» — твоё!</b> Оно уже в «Обликах».</p></div>'
      :fd?'<div class="defcard fzcard"><div class="tag">'+ev.ic+' '+(f.k==='hw'&&!YA?'Страшилки бабы Зины':'Праздничный словарь бабы Зины')+'</div><div class="word">'+esc(base)+'</div><div class="def">'+esc(fd)+'</div><div class="sig"><span>— баба Зина</span></div></div>'
      :'<div style="width:110px;height:110px;margin:4px auto">'+zinaSVG('happy')+'</div>')+
    '<div class="reward big" id="mRew">+'+r.reward+' <span class="coin"></span></div>'+
    '<p class="money">'+[r.first?'+'+r.base+' за '+(f.k==='hw'?(YA?'вечер':'страшилку'):'номер'):'+'+r.base+' за повтор',r.bonus?'🎁 +'+r.bonus+' за весь праздник':'',r.web?'🕸 +'+r.web+' за паутинки ('+r.web+' из '+r.webAll+')':r.webAll&&r.first?'🕸 паутинки остались — смети в другой раз своим словом':''].filter(Boolean).join(' · ')+'</p>'+
    '<p class="fzprog">'+ev.ic+' '+esc(ev.title)+': <b>'+r.done+' из '+ev.n+'</b>'+(r.done<ev.n&&!pz?' · за все — '+(ev.prize.t==='o'?'наряд':'блюдце')+' «'+esc(PRIZE[ev.prize.id].it.n)+'»':'')+'</p>'+
    (nx>=0&&!can&&cur(f.k)===f.id?'<p class="tmr">Следующий номер откроется завтра — заходи!</p>':'')+
    '<div class="btns"><button class="btn green" id="mNext">'+(can?'Дальше ▶':'К празднику')+'</button><button class="wmenu" id="mMenu">В меню</button></div></div>');
  if(typeof fitWin==='function')fitWin();
  var pl=$$('fzPlate');if(pl&&typeof applySkin==='function')ZB.safe('fest-plate',function(){applySkin(pl,'fny');});
  if(!again){SND.coin();if(typeof coinBurst==='function')coinBurst($$('mRew'),r.reward);}
  $$('mNext').onclick=function(){hideModal();SND.tap();if(can)play(f.k,nx);else{if(typeof openMenu==='function')openMenu();openEv(f.k);}};
  $$('mMenu').onclick=function(){hideModal();SND.tap();if(typeof maybeInterstitial==='function')maybeInterstitial(openMenu);else openMenu();};}

/* ---- 7. окно праздника ---- */
function openEv(k){var id=cur(k),ev=EVS[k];if(!id){toast('Праздник уже закончился');return;}
  STAT.ev('fest',{e:id,a:'win'});var av=avail(k,id),nx=nextN(k,id),left=FEST.left(id),pz=PRIZE[ev.prize.id].it,got=hasPrize(ev.prize.id);
  var cells='';for(var i=0;i<ev.n;i++){var d=isDone(id,i),lk=i>=av,on=!d&&canPlay(k,id,i);
    cells+='<button class="fzl'+(d?' done':'')+(on?' cur':'')+(lk?' lock':'')+'" data-n="'+i+'" title="'+esc(ev.names[i])+'">'+(d?'✓':lk?'🔒':i+1)+'</button>';}
  var mg='';if(window.ZMG&&ZMG.open)ev.mg.forEach(function(m){if(ZMG.info&&!ZMG.info(m[0]))return;if(ZMG.OFF&&ZMG.OFF.indexOf(m[0])>=0)return; /* выключенная к отсечке игра (ZMG_OFF) — не предлагаем */mg+='<button class="btn blue small fzmg" data-g="'+m[0]+'">🎲 '+esc(m[1])+'</button>';});
  modal('<div class="fzev '+ev.cls+'"><h2>'+ev.ic+' '+esc(ev.title)+'</h2>'+
    '<p class="fzsub">'+esc(ev.sub)+' · '+(left<=1?'последний день':'ещё '+left+' '+plural(left,'день','дня','дней'))+'</p>'+
    '<div class="fzz"><div class="fzzav">'+zinaSVG('happy')+'</div><p>'+esc(k==='hw'?(YA?'Осенний вечер у бабы Зины: чай, плед и '+ev.n+' кроссвордов. Каждый день открываю новый.':'Пионерлагерь «Зинуля», отбой! А мы — под одеялом с фонариком: '+ev.n+' страшилок, по одной новой в день.'):'Ёлка в актовом зале, Валентина Петровна в короне — утренник! '+ev.n+' праздничных номеров, каждый день — новый.')+'</p></div>'+
    '<div class="fzls">'+cells+'</div>'+
    '<p class="fzprog">Пройдено <b>'+doneN(id)+' из '+ev.n+'</b> · '+(got?'✓ '+(ev.prize.t==='o'?'наряд':'блюдце')+' «'+esc(pz.n)+'» у тебя':'за все — '+(ev.prize.t==='o'?'наряд':'блюдце')+' «'+esc(pz.n)+'»')+'</p>'+
    (mg?'<div class="fzmgs">'+mg+'</div>':'')+
    '<div class="btns">'+(nx>=0&&canPlay(k,id,nx)?'<button class="btn green" id="fzGo">▶ '+(doneN(id)?'Дальше: ':'Начать: ')+ev.one.toLowerCase()+' '+(nx+1)+'</button>':nx>=0?'<p class="tmr">Следующий откроется завтра — заходи!</p>':'')+
    '<button class="btn ghost small" id="fzX">Закрыть</button></div></div>');
  var c=$$('mcard');[].forEach.call(c.querySelectorAll('.fzl'),function(b){b.onclick=function(){var n=+b.dataset.n;if(isDone(id,n)||canPlay(k,id,n)){hideModal();SND.tap();play(k,n);}else{SND.bad();toast(n>=av?'Откроется '+(n-av+1===1?'завтра':'через '+(n-av+1)+' '+plural(n-av+1,'день','дня','дней')):'Сначала пройди предыдущий');}};});
  [].forEach.call(c.querySelectorAll('.fzmg'),function(b){b.onclick=function(){hideModal();SND.tap();FEST.use(id,'mg_'+b.dataset.g);
    ZB.safe('fest-mg',function(){ZMG.open(b.dataset.g,{mode:'fest',fest:skin(k),back:function(){openEv(k);}});});};});
  var g=$$('fzGo');if(g)g.onclick=function(){hideModal();SND.tap();play(k,nx);};
  $$('fzX').onclick=function(){hideModal();SND.tap();};}
function skin(k){var ev=EVS[k];return {id:ev.skin,t:ev.title};}
// мини-игры: тема праздника для «Перемены» и Затеи дня (MG0 спрашивает ZMG.festFn)
function festFn(){var n=now();return n?skin(n.k):null;}

/* ---- 8. День бабушек: открытка для Зины ---- */
var CARDS=[{ic:'💐',t:'С букетом',w:'Баба Зина, спасибо за слова и пирожки! Вы — лучшая учительница двора.'},
  {ic:'🍰',t:'С тортиком',w:'Дорогая баба Зина! Здоровья, терпения и чтобы все ученики писали без ошибок!'},
  {ic:'🐈',t:'С котом',w:'Баба Зина, с праздником! Ять просил передать: «Мяу». Мы перевели: «Люблю».'}];
var BABSAY=['Ой… Это мне? Сорок лет детям открытки подписывала, а мне — впервые от ученика. Сейчас заплачу. Ять, неси платок!',
  'Открытка! Повешу на сервант, рядом с грамотой «Отличник просвещения». Держи и ты подарочек.',
  'Ну спасибо, внучок! Я её соседке Гале покажу — пусть позавидует. А это тебе, не спорь.'];
function babId(){if(OFF.bab)return null;for(var i=0;i<BAB.length;i++)if(FEST.on(BAB[i]))return BAB[i];return null;}
function openBab(auto){var id=babId();if(!id)return;var x=fs(id);if(x.c){toast('Открытку ты уже подарил — баба Зина её на сервант поставила!');return;}
  if(auto)STAT.ev('fest',{e:id,a:'auto'});
  modal('<div class="fzbab"><h2>👵 День бабушек!</h2><div class="fzz"><div class="fzzav">'+zinaSVG('wow')+'</div><p>Сегодня День бабушек и дедушек. Баба Зина делает вид, что забыла, но сама третий раз почтовый ящик проверяет…</p></div>'+
    '<p><b>Выбери открытку для бабы Зины:</b></p><div class="fzcards">'+CARDS.map(function(c,i){return '<button class="fzc" data-i="'+i+'"><b>'+c.ic+'</b><small>'+esc(c.t)+'</small></button>';}).join('')+'</div>'+
    '<div class="btns"><button class="btn ghost small" id="fzX">Потом</button></div></div>');
  [].forEach.call($$('mcard').querySelectorAll('.fzc'),function(b){b.onclick=function(){var c=CARDS[+b.dataset.i];x.c=+b.dataset.i+1;
    var n=0,hb=0;if(FEST.give(id,'main')){n=num('bab',30);addCoins(n,'fest');if(typeof hbAdd==='function'){hbAdd(1,'fest');hb=1;}}
    save();if(typeof cloudSoon==='function')cloudSoon();FEST.use(id,'card');SND.win();if(typeof confetti==='function'&&!CALM())confetti();
    var say=window.ZBT&&ZBT.say?ZB.safe('fest-bab',function(){return ZBT.say('babushki',{card:c.t});}):'';
    modal('<div class="fzbab"><h2>'+c.ic+' Открытка доставлена!</h2><div class="fzpost"><b>'+c.ic+'</b><p>'+esc(c.w)+'</p></div>'+
      '<div class="fzz"><div class="fzzav">'+zinaSVG('happy')+'</div><p>'+esc(say||pick(BABSAY))+'</p></div>'+
      (n?'<div class="reward big" id="mRew">+'+n+' <span class="coin"></span>'+(hb?' и 💡':'')+'</div>':'')+
      '<div class="btns"><button class="btn green" id="fzX">Спасибо, баба Зина!</button></div></div>');
    if(n&&typeof coinBurst==='function')coinBurst($$('mRew'),n);updCoins();
    $$('fzX').onclick=function(){hideModal();SND.tap();ZB.refresh();};};});
  $$('fzX').onclick=function(){hideModal();SND.tap();};}

/* ---- 8а. 8 Марта (задел, без уровней): плашка, поздравление и подарок, «Рецепт тёти Вали» (MGC, recept) — если MG0 есть ---- */
var MAR=['mar27','mar28'];
function marId(){if(OFF.mar)return null;for(var i=0;i<MAR.length;i++)if(FEST.on(MAR[i]))return MAR[i];return null;}
function openMar(){var id=marId();if(!id)return;var x=fs(id),n=0;
  if(FEST.give(id,'main')){n=num('mar',20);addCoins(n,'fest');x.c=1;save();FEST.use(id,'card');}
  var mg=window.ZMG&&ZMG.open&&!(ZMG.OFF&&ZMG.OFF.indexOf('recept')>=0)&&(!ZMG.info||ZMG.info('recept'));
  modal('<div class="fzbab"><h2>🌼 С 8 Марта!</h2><div class="fzz"><div class="fzzav">'+zinaSVG('happy')+'</div><p>'+esc(pick(['Мимоза на столе, тётя Валя печёт «Наполеон», Толик принёс тюльпаны — правда, с соседской клумбы. С праздником, дорогие!','В школе 8 Марта — святое: мальчики дарят открытки, девочки делают вид, что не ждали. С праздником!']))+'</p></div>'+
    (n?'<div class="reward big" id="mRew">+'+n+' <span class="coin"></span></div><p class="money">подарок от бабы Зины</p>':'')+
    '<div class="btns">'+(mg?'<button class="btn blue" id="fzMg">🎲 Рецепт тёти Вали</button>':'')+'<button class="btn green" id="fzX">Спасибо!</button></div></div>');
  if(n&&typeof coinBurst==='function')coinBurst($$('mRew'),n);updCoins();
  var b=$$('fzMg');if(b)b.onclick=function(){hideModal();SND.tap();ZB.safe('fest-mg',function(){ZMG.open('recept',{mode:'fest',fest:{id:'mar',t:'8 Марта'},back:function(){ZB.refresh();}});});};
  $$('fzX').onclick=function(){hideModal();SND.tap();ZB.refresh();};}

/* ---- 9. плашка в главном (homeSlots zone top) ---- */
function plaque(){var h='';if(!lvlOk())return '';
  ['hw','ny'].forEach(function(k){var id=cur(k);if(!id||h)return;var ev=EVS[k],d=doneN(id),nx=nextN(k,id),ready=nx>=0&&canPlay(k,id,nx);
    h='<button class="fzpl '+ev.cls+'" data-k="'+k+'"><b>'+ev.ic+'</b><span><i>'+esc(ev.title)+'</i><small>'+(nx<0?'всё пройдено ✓':ready?(d?'новый номер ждёт · ':'')+d+' из '+ev.n:d+' из '+ev.n+' · новый — завтра')+' · '+(FEST.left(id)<=1?'последний день':'ещё '+FEST.left(id)+' '+plural(FEST.left(id),'день','дня','дней'))+'</small></span>'+(ready?'<em class="dot on"></em>':'')+'</button>';});
  var m=marId();if(m)h+='<button class="fzpl fzbabp" data-k="mar"><b>🌼</b><span><i>8 Марта</i><small>'+(fs(m).c?'с праздником!':'подарок от бабы Зины')+'</small></span>'+(fs(m).c?'':'<em class="dot on"></em>')+'</button>';
  var b=babId();if(b&&!fs(b).c)h+='<button class="fzpl fzbabp" data-k="bab"><b>👵</b><span><i>День бабушек</i><small>подари бабе Зине открытку</small></span><em class="dot on"></em></button>';
  return h;}
var babShown=false;
ZB.add(ZB.homeSlots,{id:'fest',order:5,zone:'top',render:function(){return ZB.safe('fest-pl',plaque)||'';},
  mount:function(el){[].forEach.call(el.querySelectorAll('.fzpl'),function(b){b.onclick=function(){SND.tap();var k=b.dataset.k;if(k==='bab')openBab();else if(k==='mar')openMar();else openEv(k);};});
    // День бабушек — окно само, раз за сеанс, если открытку ещё не дарили (после гостинца: он открывается через 0,5 с)
    var id=babId();if(id&&!fs(id).c&&!babShown&&lvlOk()&&!(typeof SHOT!=='undefined'&&SHOT)){babShown=true;setTimeout(function(){var m=$$('menu');if(m&&m.classList.contains('on')&&!$$('modal').classList.contains('on'))openBab(true);},1600);}}});
// старый вид (без VIEW): у плашки FEST своё место — #zbHomeTop (каркас); VIEW рисует zone top сам

/* ---- 10. «Облики»: подпись праздничного подарка вместо «Седьмой гостинец» ---- */
if(typeof openShop==='function'){var oShop=openShop;openShop=function(){addPrizes();var r=oShop.apply(this,arguments);ZB.safe('fest-shop',function(){
  for(var id in PRIZE){var it=PRIZE[id].it;if(hasPrize(id))continue;[].forEach.call(D.querySelectorAll('#shopList .item'),function(e){var b=e.querySelector('b');if(!b||b.textContent!==it.n)return;
    var o=e.querySelector('.ok');if(o){var ev=EVS[PRIZE[id].ev];o.innerHTML=ev.ic+' '+esc(ev.title)+'<br>(пройди все '+ev.n+')';}});}});return r;};}

/* ---- 11. сохранение и облако ---- */
function mergeFs(d){if(!d||typeof d!=='object')return;S.fs=S.fs||{};for(var id in d){var a=d[id],b=S.fs[id];if(!a||typeof a!=='object')continue;
  if(!b||typeof b!=='object'){S.fs[id]=JSON.parse(JSON.stringify(a));continue;}
  var x=String(b.d||''),y=String(a.d||''),o='';for(var i=0;i<Math.max(x.length,y.length);i++)o+=x[i]==='1'||y[i]==='1'?'1':'0';if(o)b.d=o;
  ['w','p','c'].forEach(function(k){if(a[k]!=null&&!(+b[k]>=+a[k]))b[k]=a[k];});}}
ZB.onSave({id:'fest',keys:['fest','fs','fsT'],
  fix:function(S){if(!S.fs||typeof S.fs!=='object')S.fs={};if(!S.fest||typeof S.fest!=='object')S.fest={};},
  merge:function(S,d){ZB.safe('fest-merge',function(){if(d.fest)FEST.merge(d.fest);mergeFs(d.fs);
    if(typeof d.fsT==='string'){var t=String(S.fsT||'');for(var i=0;i<d.fsT.length;i++)if(t.indexOf(d.fsT[i])<0)t+=d.fsT[i];S.fsT=t;}addPrizes();});}});

/* ---- 12. модуль FEST ---- */
try{FEST.init(S,{g:'slovo',plat:PLAT,lang:'ru',save:function(){save();},now:function(){return nowMs();},cls:'btn noenter',
  modal:function(h){modal(h);return $$('mcard');},close:function(){hideModal();},low:function(){try{return CALM()||D.body.classList.contains('lite');}catch(e){return false;}},
  change:function(){addPrizes();ZB.refresh();}});}catch(e){}
try{if(window.ZMG)ZMG.festFn=festFn;}catch(e){}
ZB.on('ready',function(){addPrizes();try{if(window.ZMG&&!ZMG.festFn)ZMG.festFn=festFn;}catch(e){}});

window.FESTZB={v:1,OFF:OFF,ev:EVS,quarters:Q,now:now,quarter:quarter,cur:cur,open:openEv,play:play,bab:openBab,done:isDone,doneN:doneN,avail:avail,
  prizes:PRIZE,festFn:festFn,load:loadLv,mar:openMar};
addPrizes();
})();
