'use strict';
/* ================= gb-mode — режимы магазина (буст «Образцовый», поток MODE, 10.10.2026) =================
   «Приёмка товара» (3 головоломки в день, одна на всех, звёзды за ходы), «Час пик» (сб–вс: очередь из 20, терпение короче, счёт —
   обслуженные → GB.emit('rush', n) для «Соцсоревнования»), «Ревизия-марафон» (5 Ревизий подряд без бустеров, набор — на неделю),
   «Задание недели» (5 уровней с условием недели), «Рыбный четверг» (по четвергам, если построен Рыбный отдел — GBM.dep('ryba')>0),
   «Сверхплан» (после 1500-го: вход и счёт; уровни — LVL).
   Раскладки — js/gb-mode-gen.js (GBMDG, без DOM; бот — gastronom-boost/MODE-tools/md_bot.sh). Основные уровни, S.unlocked/S.stars — не трогает.
   УСТРОЙСТВО: уровень режима — обычный startLevel с номером BASE+… (1 000 000+, с основными не пересекается); обёртка levelFor отдаёт
     раскладку режима, точка «gb-MODE» в startLevel зовёт GBMD._g(G) (G.mode, Ревизия, очередь со своим зерном) ДО очереди и хуков.
     Обёртки (только при G.mode, иначе — как было): win, lose, stuck, useBoost, tryMove, updHud; openMap/startLevel(основной) — сброс режима.
   ДОГОВОР:
     GBMD.start(id,{step}) — начать режим (id: priemka|rush|marathon|week|fish); GBMD.can(id) — открыт и включён; GBMD.list() — что показать.
     GBMD.next() — «Дальше» из «Кассы» режима (следующий шаг режима); GBMD.res — итог последней попытки режима (для «Кассы» VIEW).
     GBMD.sp() — {n, st} «Сверхплан»: уровней сверх 1500 и звёзд за них.
     levelHook/STAT: у режима info.mode = id, info.first = false, info.l = 1 000 000+ (не основной уровень!).
     GB.emit('rush', n) — конец смены «Час пик», n обслуженных (LEAGUE). GB.emit('md', {id, r, st, sc}) — исход шага режима (META, NEWBIE).
   ГНЁЗДА: homeSlots zone 'side' (затеи магазина), pathSlots zone 'top' (то же полосой), winSlots zone 'extra' (строки режима и «Сверхплан»),
     экран GB.go('modes') — все режимы.
   ВЫКЛЮЧЕНИЕ: GB.flag('md_<id>') — режим; GB.flag('md') — все (входы прячутся, игра как раньше).
   СОХРАНЕНИЕ (prefix 'md'): mdP {d,s:[★×3],m:[ходы×3]} · mdR {d,n,b} · mdM {w,b,ok} · mdW {w,s,ok} · mdF {d,st} · mdSp {n,st} · mdH {подсказки}.
   Числа наград — GBECO.md (поток ECO), умолчания — DEF. Тексты — T (по-русски; EN — поток EN: GBMD.EN = {ключ: строка}; без перевода в ?lang=en
   режимы спрятаны). STAT: md {a: open|go|end, id, sc, st}. Монеты — GBECO.give('md', n) или ern('md', n).
   Старые WebView: без ?. ?? .at :has structuredClone inset. */
(function(){
  if(typeof GB==='undefined'||typeof GBMDG==='undefined')return;
  var BASE=1000000,IDS=['priemka','rush','marathon','week','fish'],NO={priemka:1,rush:2,marathon:3,week:4,fish:5,torg:6,deficit:7};
  var DEF={open:{priemka:12,rush:20,marathon:40,week:25,fish:10,sp:1500},
    pr:[[3,5,8],[4,7,11],[5,9,14]],   // «Приёмка»: монеты за 1/2/3★ по головоломке (за улучшение — доплата)
    rush:{per:1,all:10,runs:3},        // «Час пик»: за обслуженного, за всех 20, оплачиваемых смен в день
    mar:{step:8,all:80},               // «Ревизия-марафон»: за каждую новую дальнюю Ревизию недели, за все 5
    week:{step:10,all:50},             // «Задание недели»: за шаг (впервые), за все 5
    fish:[8,12,20]};                   // «Рыбный четверг»: за 1/2/3★ (за улучшение — доплата)
  var T={
    priemka:'Приёмка товара',rush:'Час пик',marathon:'Ревизия-марафон',week:'Задание недели',fish:'Рыбный четверг',sp:'Сверхплан',
    d_priemka:'Разложите завоз за меньшее число ходов',d_rush:'20 покупателей, терпение короче — обслужите побольше',
    d_marathon:'5 Ревизий подряд, без бустеров',d_week:'5 уровней с особым условием',d_fish:'Свежая рыба — только по четвергам',d_sp:'Уровни сверх плана — без конца',
    c_calm:'Ни один покупатель не уйдёт недовольным',c_nob:'Без бустеров',c_moves:'Уложиться в ходы',c_ice:'Неделя заморозки: много льда',
    open:'Откроется после уровня ',wkend:'По субботам и воскресеньям',thu:'По четвергам',
    play:'Играть',cont:'Продолжить',again:'Ещё раз',back:'← Назад',next:'Дальше →',out:'К затеям',map:'На карту',restart:'↻ Заново',
    hall:'Затеи магазина',all:'Все затеи',
    moves:'Ходов ',of:' из ',rec:'Рекорд тёти Вали — ',star3:'★★★ — за ',star2:'★★ — за ',mv:' ход.',
    served:'Обслужено ',left:'ушли ',queue:'в очереди ',step:'Шаг ',rev:'Ревизия ',
    w_pr:'Завоз принят!',w_rush:'Смена окончена!',w_mar:'Ревизия пройдена!',w_marAll:'Марафон пройден! 🏆',w_week:'Шаг выполнен!',w_weekAll:'Задание недели выполнено! 🏆',w_fish:'Рыба распродана! 🐟',
    l_moves:'Ходы кончились',l_mar:'Марафон прерван',l_cond:'Условие не выполнено',l_jam:'Полки забиты',
    l_moves_t:'Завоз не разложен в лимит ходов. Попробуем ещё раз — тётя Валя подскажет: сначала тройки!',
    l_mar_t:'Ревизия не пройдена. Марафон начинается сначала — Ревизор ждёт.',
    l_cond_t:'Условие недели нарушено. Шаг можно переиграть.',
    l_jam_t:'Ставить некуда, а бустеры в этом режиме не положены.',l_jamp_t:'Ставить некуда. Отмените ход или разложите завоз заново.',
    nob:'В этом режиме без бустеров',nob_t:'Тут некогда — без бустеров',
    v_pr:'Принимаем завоз: всё по полкам, тройками. Лимит ходов — ',v_rush:'Час пик! Двадцать человек — успеть бы всех!',
    v_mar:'Ревизия-марафон: пять подряд, без поблажек.',v_fish:'Рыбный день! Кильку берут ящиками.',v_week:'Задание недели: ',
    best:'Лучший итог: ',today:'Сегодня: ',rushN:'Сегодня смен: ',done:'Выполнено',sp_n:'Сверх плана: ',lv:' ур.',
    prDone:'Все три приёмки на сегодня разложены',runs:'Смены с наградой кончились — дальше играем на счёт',
    marStep:'Ревизия ',weekStep:'Уровень ',fresh:'Новый набор — в понедельник',
    torg:'Проверка Торга',deficit:'Дефицит дня',r_notable:'без Столика',r_revq:'очередь из ревизоров',r_ice:'всё во льду',
    w_torg:'Проверка пройдена! 📋',w_def:'Дефицит распродан!',v_torg:'Торг с проверкой! Сегодня — ',v_def:'Выбросили ',v_def2:'! Только сегодня — берите, пока есть.',
    card:'⭐ Новое в коллекции «Дефицит»: ',
    pr_s:'Приёмка',n_priemka:'Приёмка',n_rush:'Час пик',n_marathon:'Марафон',n_week:'Неделя',n_fish:'Рыбный день',n_torg:'Проверка',n_deficit:'Дефицит дня',prS:['Всё по полкам — тройками!','Завоз принимаем по накладной.','Ящик к ящику — красота!','Сначала тройки, потом остальное.','Аккуратно, тут стекло!','Полки не резиновые — бережём ходы.'],z_sched:'Распорядок недели',z_say:'Скучать некогда! Выбирайте затею — за каждую доплачиваю.',z_days:'пн вт ср чт пт сб вс',
    z_today:'Сегодня',z_daily:'Каждый день',z_week:'До конца недели',z_always:'Всегда открыто',z_last:'Последний день недели',z_cond:'Условие недели: ',z_prize:'Награда: ',z_upto:'до ',
    z_day:' в день',z_shift:' за смену',z_rev:' за Ревизию, ',z_step:' за шаг, ',z_all5:' за все 5',
    z_cap:'За затеи — не больше ',z_cap2:'в день. Новые наборы недели — в понедельник.',
    acc:['икру красную','растворимый кофе','сервелат','бананы','мандарины','наборы конфет','ананасы в банках','крабов','жевательную резинку','торты с кремом']};
  var GBMD=window.GBMD={v:1,BASE:BASE,IDS:IDS,T:T,EN:null,cur:null,res:null,_lv:{}};
  function cfg(){var z=(window.GBECO&&GBECO.md)||{},o={};for(var k in DEF)o[k]=z[k]!=null?z[k]:DEF[k];return o;}
  GBMD.cfg=cfg;
  function $i(id){return document.getElementById(id);}
  function tr(k){if(isEn())return (GBMD.EN&&GBMD.EN[k])||'';return T[k]||'';}
  function isEn(){return typeof LANG!=='undefined'&&LANG==='en';}
  function enOk(){return !isEn()||!!(GBMD.EN&&GBMD.EN.priemka);}
  function stat(a,o){try{if(window.STAT&&STAT.ev){o=o||{};var e={a:a};for(var k in o)e[k]=o[k];STAT.ev('md',e);}}catch(x){}}
  function Sx(){return typeof S!=='undefined'?S:null;}
  function Gx(){return typeof G!=='undefined'?G:null;}
  var loc=/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname);
  function qp(n){var m=new RegExp('[?&]'+n+'=([^&]*)').exec(location.search);return loc&&m?decodeURIComponent(m[1]):null;}
  // день и неделя — по времени площадки (nowMs); на маке ?mdday=ГГГГММДД — подменить «сегодня» (проверка четверга/выходных)
  function now(){var f=qp('mdday');if(f&&/^\d{8}$/.test(f))return new Date(+f.slice(0,4),+f.slice(4,6)-1,+f.slice(6,8),12).getTime();
    return typeof nowMs==='function'?nowMs():Date.now();}
  function ymd(d){return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
  function day(){return ymd(new Date(now()));}
  function dow(){return new Date(now()).getDay();}
  function week(){var d=new Date(now());d.setDate(d.getDate()-(d.getDay()+6)%7);return ymd(d);}
  GBMD.day=day;GBMD.week=week;GBMD.dow=dow;
  function lvl(){var s=Sx();return s?(s.unlocked||1):1;}
  function tier(){return Math.max(0,Math.min(7,Math.floor((lvl()-1)/25)));}

  /* ---------- сохранение ---------- */
  function num(x){x=+x;return isFinite(x)&&x>0?x:0;}
  function arr3(a,f){var r=[0,0,0];if(Array.isArray(a))for(var i=0;i<3;i++)r[i]=f(a[i]);return r;}
  function o(x){return x&&typeof x==='object'&&!Array.isArray(x)?x:null;}
  GB.onSave({id:'mode',prefix:'md',
    fix:function(S){var p=o(S.mdP);S.mdP=p?{d:num(p.d),s:arr3(p.s,function(v){return Math.min(3,num(v));}),m:arr3(p.m,num)}:{d:0,s:[0,0,0],m:[0,0,0]};
      var r=o(S.mdR);S.mdR=r?{d:num(r.d),n:num(r.n),b:num(r.b)}:{d:0,n:0,b:0};
      var m=o(S.mdM);S.mdM=m?{w:num(m.w),b:Math.min(5,num(m.b)),ok:m.ok?1:0}:{w:0,b:0,ok:0};
      var w=o(S.mdW);S.mdW=w?{w:num(w.w),s:Math.min(5,num(w.s)),ok:w.ok?1:0}:{w:0,s:0,ok:0};
      var f=o(S.mdF);S.mdF=f?{d:num(f.d),st:Math.min(3,num(f.st))}:{d:0,st:0};
      var sp=o(S.mdSp);S.mdSp=sp?{n:num(sp.n),st:num(sp.st)}:{n:0,st:0};
      var dd=o(S.mdD);S.mdD=dd?{d:num(dd.d)}:{d:0};
      if(!o(S.mdH))S.mdH={};},
    // облако: по каждому полю — у кого день/неделя свежее, тот и прав; тот же день — максимум (звёзды, счёт), минимум ходов
    merge:function(S,d){var a,b;
      a=S.mdP;b=o(d.mdP);if(b){if(num(b.d)>num(a&&a.d))S.mdP=b;else if(a&&num(b.d)===num(a.d)){for(var i=0;i<3;i++){var bs=arr3(b.s,num),bm=arr3(b.m,num);
        a.s[i]=Math.max(a.s[i]||0,bs[i]);if(bm[i]&&(!a.m[i]||bm[i]<a.m[i]))a.m[i]=bm[i];}}}
      a=S.mdR;b=o(d.mdR);if(b){if(num(b.d)>num(a&&a.d))S.mdR=b;else if(a&&num(b.d)===num(a.d)){a.n=Math.max(a.n||0,num(b.n));a.b=Math.max(a.b||0,num(b.b));}}
      a=S.mdM;b=o(d.mdM);if(b){if(num(b.w)>num(a&&a.w))S.mdM=b;else if(a&&num(b.w)===num(a.w)){a.b=Math.max(a.b||0,num(b.b));a.ok=a.ok||b.ok?1:0;}}
      a=S.mdW;b=o(d.mdW);if(b){if(num(b.w)>num(a&&a.w))S.mdW=b;else if(a&&num(b.w)===num(a.w)){a.s=Math.max(a.s||0,num(b.s));a.ok=a.ok||b.ok?1:0;}}
      a=S.mdF;b=o(d.mdF);if(b){if(num(b.d)>num(a&&a.d))S.mdF=b;else if(a&&num(b.d)===num(a.d))a.st=Math.max(a.st||0,num(b.st));}
      a=S.mdD;b=o(d.mdD);if(b&&num(b.d)>num(a&&a.d))S.mdD={d:num(b.d)};
      a=S.mdSp;b=o(d.mdSp);if(b){if(!a)S.mdSp=b;else{a.n=Math.max(a.n||0,num(b.n));a.st=Math.max(a.st||0,num(b.st));}}
      a=S.mdH;b=o(d.mdH);if(b){if(!o(a))S.mdH=a={};for(var k in b)if(b[k])a[k]=1;}}});
  // сегодняшние/недельные записи (старые — как пустые)
  function P(){var s=Sx(),p=s.mdP;if(p.d!==day()){p.d=day();p.s=[0,0,0];p.m=[0,0,0];}return p;}
  function R(){var s=Sx(),r=s.mdR;if(r.d!==day()){r.d=day();r.n=0;r.b=0;}return r;}
  function M(){var s=Sx(),m=s.mdM;if(m.w!==week()){m.w=week();m.b=0;m.ok=0;}return m;}
  function W(){var s=Sx(),w=s.mdW;if(w.w!==week()){w.w=week();w.s=0;w.ok=0;}return w;}
  function F(){var s=Sx(),f=s.mdF;if(f.d!==day()){f.d=day();f.st=0;}return f;}
  function sv(){if(typeof save==='function')save();}

  /* ---------- открыт ли режим ---------- */
  function on(id){return GB.flag('md')&&GB.flag('md_'+id)&&enOk();}
  function dep(){try{return !!(window.GBM&&GBM.dep&&GBM.dep('ryba')>0);}catch(e){return false;}}
  var ALL=!!qp('mdall'); // на маке: все режимы открыты (снимки, проверки)
  function lvOk(id){return ALL||lvl()>cfg().open[id];}
  function today(id){if(ALL)return true;if(id==='rush'){var w=dow();return w===0||w===6;}if(id==='fish')return dow()===4;return true;}
  GBMD.can=function(id){if(!on(id)||!Sx())return false;if(id==='torg'||id==='deficit')return lvl()>3;if(id==='fish'&&!dep()&&!ALL)return false;return lvOk(id)&&today(id);};
  // показывать ли вход (открыт по уровню, даже если сегодня не его день)
  GBMD.shown=function(id){if(!on(id)||!Sx())return false;if(id==='fish')return (dep()||ALL)&&lvOk(id);return lvOk(id);};
  GBMD.sp=function(){var s=Sx();return s&&s.mdSp?s.mdSp:{n:0,st:0};};
  function spOn(){return GB.flag('md')&&GB.flag('md_sp')&&enOk()&&lvl()>cfg().open.sp;}

  /* ---------- раскладки (кэш на сеанс) ---------- */
  function fishIds(){var ids=[3,2];try{for(var k in GOODS){var id=+k,g=GOODS[k];if(id<23||id>=RARE0||!g)continue;
      if((g.dep==='ryba'||g.d==='ryba'||/рыб|кильк|шпрот|сельд|селёд|скумбр|минтай|треск|икр|сайр|горбуш|хек|салак/i.test(g.n||''))&&GOOD_DRAW[id])ids.push(id);}}catch(e){}
    return ids;}
  // «Проверка Торга»: правило разряда r — из GBM.info(r).torg (META), иначе по кругу
  function rule(r){var t='';try{t=window.GBM&&GBM.info?String(GBM.info(r).torg||''):'';}catch(e){}
    if(/Столик/i.test(t))return 'notable';if(/ревизор/i.test(t))return 'revq';if(/льд|лёд/i.test(t))return 'ice';return ['notable','revq','ice'][(r+2)%3];}
  // «Дефицит дня»: номер карточки дня — один на всех (из тех, что игра умеет рисовать)
  function rkList(){var L=[];try{for(var k=0;k<RARE.length&&k<56;k++)if(RARE[k]&&GOOD_DRAW[RARE0+k])L.push(k);}catch(e){}return L.length?L:[0];}
  function rk(d){var L=rkList();return L[(+d||day())%L.length];} /* gb-MERGE: rk(день) — для «Завтра» */
  GBMD.rule=rule;GBMD.rk=rk;
  function build(id,step){var key=id+':'+step+':'+(id==='marathon'||id==='week'||id==='torg'?week()+':'+tier():id==='fish'?day()+':'+tier():day());
    if(GBMD._lv[key])return GBMD._lv[key];var lv=null;
    if(id==='priemka')lv=GBMDG.priemka(day(),step);
    else if(id==='rush')lv=GBMDG.rush(day());
    else if(id==='marathon')lv=GBMDG.marathon(week(),step,tier());
    else if(id==='week')lv=GBMDG.week(week(),step,tier());
    else if(id==='fish')lv=GBMDG.fish(day(),tier(),fishIds());
    else if(id==='torg')lv=GBMDG.torg(step,tier(),rule(step));
    else if(id==='deficit')lv=GBMDG.deficit(day(),rk());
    if(lv)GBMD._lv[key]=lv;return lv;}
  GBMD.build=build;

  /* ---------- запуск ---------- */
  function stepOf(id){if(id==='priemka'){var p=P();for(var k=0;k<3;k++)if(!p.s[k])return k;return 0;}
    if(id==='marathon')return 0;if(id==='week'){var w=W();return w.s>=5?0:w.s;}return 0;}
  GBMD.start=function(id,opt){opt=opt||{};if(!GBMD.can(id)){if(typeof toast==='function')toast(tr(id));return false;}
    var step=opt.step!=null?opt.step:stepOf(id),lv=build(id,step);if(!lv){if(typeof toast==='function')toast(tr(id));return false;}
    GBMD.cur={id:id,step:step,lv:lv};GBMD.res=null;stat('go',{id:id,st:step});
    if(typeof startLevel==='function')startLevel(BASE+NO[id]*1000+step);return true;};
  // точка в startLevel (после G.vetId, до очереди): уровень режима — свой G.mode, Ревизия, очередь со своим зерном
  GBMD._g=function(g){if(!g||!(g.idx>=BASE)||!GBMD.cur)return;var c=GBMD.cur,lv=g.lv;
    g.mode=c.id;g.md={id:c.id,step:c.step,cond:lv.cond||'',lim:lv.lim||0,opt:lv.opt||0,s2:lv.s2||0};
    g.boss=!!lv.boss;g.vetId=-1;g.q=qInit(lv,rng(lv.qs!=null?lv.qs:g.idx*31+3));
    if(c.id==='rush')g.hearts=99;
    g.md.rule=lv.rule||''; // смена не обрывается на ушедших: идёт, пока не пройдут все 20
  };
  function noBoost(g,k){if(!g||!g.mode)return false;var m=g.mode,c=g.md&&g.md.cond;
    if(m==='marathon'||(m==='week'&&c==='nob'))return !(k==='undo'&&g.freeUndo); // «без бустеров»: только первая бесплатная отмена (промах пальцем)
    if(m==='priemka')return k==='mix'||k==='table'; // головоломка: перестановка и лишнее место ломают счёт ходов
    if(m==='torg'&&g.md&&g.md.rule==='notable')return k==='table'; // Проверка Торга «без Столика»
    return false;}
  GBMD.noBoost=noBoost;

  /* ---------- обёртки игры (только при G.mode) ---------- */
  function wrap(name,f){var o=window[name];if(typeof o!=='function'||o._md)return;var w=function(){return f.call(this,o,arguments);};w._md=1;window[name]=w;}
  function hook(){
    // «Приёмка» — покупателей нет: реплики Вали про очередь/покупателей заменяем на свои, про завоз (POLISH)
    wrap('say',function(o,a){var g=Gx();if(g&&g.mode==='priemka'&&a[1]==='valya'&&typeof PH!=='undefined'&&PH.valya){var t=a[0],q=false;
        ['start','clear','angry','kassa','mama'].forEach(function(k){if(PH.valya[k]&&PH.valya[k].indexOf(t)>=0)q=true;});
        var L=isEn()?(GBMD.EN&&GBMD.EN.prS):T.prS;if(q&&L&&L.length){a=[L[Math.floor(Math.random()*L.length)]].concat([].slice.call(a,1));}}
      return o.apply(this,a);});
    wrap('levelFor',function(o,a){var i=a[0];if(i>=BASE&&!a[1]){var c=GBMD.cur;if(c&&c.lv)return c.lv;
        var no=Math.floor((i-BASE)/1000),id=IDS[no-1],lv=id&&build(id,(i-BASE)%1000);if(lv){GBMD.cur={id:id,step:(i-BASE)%1000,lv:lv};return lv;}}
      return o.apply(this,a);});
    wrap('startLevel',function(o,a){if(!(a[0]>=BASE)||a[1])GBMD.cur=null;return o.apply(this,a);});
    wrap('openMap',function(o,a){var r=o.apply(this,a);GBMD.cur=null;return r;});
    wrap('win',function(o,a){var g=Gx();if(g&&g.mode&&NO[g.mode])return GB.safe('md:win',function(){mdWin(g);});return o.apply(this,a);});
    wrap('lose',function(o,a){var g=Gx();if(g&&g.mode&&NO[g.mode]){
        if(g.mode==='marathon')return mdLose(g,'mar');if(g.mode==='priemka')return mdLose(g,'moves');if(g.mode==='week'&&g.md.cond==='nob')return mdLose(g,'cond');}
      return o.apply(this,a);});
    wrap('stuck',function(o,a){var g=Gx();if(g&&g.mode&&!g.over&&(g.mode==='marathon'||(g.mode==='week'&&g.md.cond==='nob')))return mdLose(g,'jam');
      if(g&&g.mode==='priemka'&&!g.over)return mdLose(g,'jamp');return o.apply(this,a);});
    wrap('useBoost',function(o,a){var g=Gx();if(noBoost(g,a[0])){if(typeof toast==='function')toast(tr('nob'));return;}return o.apply(this,a);});
    wrap('tryMove',function(o,a){var r=o.apply(this,a),g=Gx();if(r&&g&&g.mode)GB.safe('md:move',function(){afterMv(g);});return r;});
    wrap('kindFor',function(o,a){var g=Gx();if(g&&g.mode==='torg'&&g.md&&g.md.rule==='revq')return 'revizor';return o.apply(this,a);});
    wrap('updHud',function(o,a){var r=o.apply(this,a),g=Gx();if(g&&g.mode)GB.safe('md:hud',function(){hud(g);});return r;});}
  hook();GB.on('ready',hook); // кто-то (LVL) обернул levelFor позже — оборачиваем поверх

  function afterMv(g){var m=g.md||{};
    // лимит ходов: «Приёмка» и неделя «Уложиться в ходы»
    if(m.lim&&(g.mode==='priemka'||m.cond==='moves')&&g.moves>=m.lim&&g.st.n>0&&!g.over){g.over=true;g.mdFail=1;later(function(){mdLose(g,g.mode==='priemka'?'moves':'cond');},900);}
    // неделя «Ни один не уйдёт недовольным»
    if(m.cond==='calm'&&g.angry>0&&!g.mdFail){g.over=true;g.mdFail=1;later(function(){mdLose(g,'cond');},1100);}
    // «Час пик»: прошли все 20 — смена окончена (товар ещё есть — не важно)
    if(g.mode==='rush')later(function(){if(!g.over&&g.q.left<=0&&!g.q.vis.length&&!g.queue.some(function(c){return c.st==='wait'||c.st==='in';})){g.over=true;mdWin(g);}},1500);}
  function hud0(g){var m=g.md||{},a=$i('gLevel'),b=$i('gCity');if(!a||!b)return;var t=tr(g.mode);
    if(g.mode==='priemka'){a.textContent='📦 '+(tr('pr_s')||t)+' · '+(m.step+1)+'/3';b.textContent=tr('moves')+g.moves+tr('of')+m.lim+' · ★★★ ≤ '+m.opt;}
    else if(g.mode==='rush'){a.textContent='🏃 '+t;b.textContent=tr('served')+g.served+' · '+tr('left')+g.angry+' · '+tr('queue')+Math.max(0,g.lv.K-g.served-g.angry);}
    else if(g.mode==='marathon'){a.textContent='🔥 '+t+' · '+(m.step+1)+'/5';b.textContent=tr('served')+g.served+tr('of')+g.lv.K;}
    else if(g.mode==='week'){a.textContent='📋 '+t+' · '+(m.step+1)+'/5';b.textContent=(m.cond==='moves'?tr('moves')+g.moves+tr('of')+m.lim:tr('c_'+m.cond))+' · '+g.served+'/'+g.lv.K;}
    else if(g.mode==='fish'||g.mode==='deficit'){a.textContent=(g.mode==='fish'?'🐟 ':'🍌 ')+t;b.textContent=tr('served')+g.served+tr('of')+g.lv.K;}
    else if(g.mode==='torg'){a.textContent='📋 '+t;b.textContent=tr('r_'+m.rule)+' · '+g.served+'/'+g.lv.K;}}
  // телефон (≤560): короткое имя без значка, номер шага — в строку счёта (она переносится в две строки) — шапка без обрезки
  function hud(g){hud0(g);var m=g.md||{},a=$i('gLevel'),b=$i('gCity');if(!a||!b||!(innerWidth<=560))return;var sh=tr('n_'+g.mode);if(!sh)return;
    var n=g.mode==='priemka'?3:g.mode==='marathon'||g.mode==='week'?5:0;a.textContent=sh;
    if(n)b.textContent=tr('step')+(m.step+1)+'/'+n+' · '+b.textContent;}
  // вид уровня режима: спрятать запрещённые бустеры и сердца «Часа пик»; подсказка Вали — правило режима
  GB.startHook.push(function(info){var el=$i('scr-game');if(!el)return;var g=Gx();
    el.setAttribute('data-md',info.mode&&NO[info.mode]?info.mode:'');
    el.setAttribute('data-mdno',g&&g.mode?['hint','mix','table','undo'].filter(function(k){return k!=='undo'&&noBoost(g,k);}).join(' '):'');
    if(g&&g.mode&&NO[g.mode]){var m=g.md,t='';
      if(g.mode==='priemka')t=tr('v_pr')+m.lim+'. '+tr('rec')+m.opt+'.';else if(g.mode==='rush')t=tr('v_rush');else if(g.mode==='marathon')t=tr('v_mar');
      else if(g.mode==='fish')t=tr('v_fish');else if(g.mode==='torg')t=tr('v_torg')+tr('r_'+m.rule)+'.';else if(g.mode==='deficit')t=tr('v_def')+defAcc()+tr('v_def2');else if(g.mode==='week')t=tr('v_week')+tr('c_'+m.cond)+'.';
      if(t&&typeof later==='function')later(function(){if(typeof say==='function')say(t,'valya');},1700);}});

  /* ---------- монеты ---------- */
  function give(n){n=Math.max(0,Math.round(n||0));if(!n)return 0;var s=Sx();
    if(window.GBECO&&GBECO.give){var x=GBECO.give('md',n);n=typeof x==='number'?x:n;}
    else{s.coins+=typeof ern==='function'?ern('md',n):n;}
    sv();if(typeof updCoins==='function')updCoins();return n;}

  /* ---------- исход ---------- */
  function mdWin(g){if(!g||g.won)return;g.won=true;if(typeof modalOn!=='undefined'&&modalOn&&typeof hideModal==='function')hideModal();g.over=true;
    if(typeof YG!=='undefined')YG.stop();if(typeof SND!=='undefined')SND.win();var C=cfg(),m=g.md,id=g.mode,res={id:id,step:m.step,ok:1,coins:0,lines:[],next:null};
    var st=Math.max(1,3-g.angry);
    if(id==='priemka'){var p=P(),k=m.step,prev=p.s[k]||0;st=g.moves<=m.opt?3:g.moves<=m.s2?2:1;p.s[k]=Math.max(prev,st);if(!p.m[k]||g.moves<p.m[k])p.m[k]=g.moves;
      var pay=C.pr[k]||DEF.pr[k];res.coins=give(st>prev?(pay[st-1]||0)-(prev?pay[prev-1]||0:0):0);
      res.title=tr('w_pr');res.lines.push(tr('moves')+g.moves+' · '+tr('rec')+m.opt);
      if(st<3)res.lines.push(tr('star3')+m.opt+tr('mv')+' '+tr('star2')+m.s2+tr('mv'));
      if(k<2)res.next={id:id,step:k+1,t:tr('next')};else if(p.s.every(function(x){return x>0;}))res.lines.push(tr('prDone'));}
    else if(id==='rush'){var r=R(),sc=g.served;st=sc>=20?3:sc>=15?2:1;r.n++;r.b=Math.max(r.b,sc);
      if(r.n<=C.rush.runs)res.coins=give(sc*C.rush.per+(sc>=20?C.rush.all:0));else res.lines.push(tr('runs'));
      res.title=tr('w_rush');res.sc=sc;res.lines.unshift(tr('served')+sc+tr('of')+'20 · '+tr('best')+r.b);
      GB.emit('rush',sc);res.next={id:id,step:0,t:tr('again')};}
    else if(id==='marathon'){var mm=M(),n=m.step+1;if(n>mm.b){if(n<5)res.coins=give(C.mar.step);mm.b=n;}
      if(n>=5){res.title=tr('w_marAll');if(!mm.ok){mm.ok=1;res.coins+=give(C.mar.all);}}
      else{res.title=tr('w_mar');res.next={id:id,step:n,t:tr('next')};}
      res.lines.push(tr('marStep')+n+tr('of')+'5');}
    else if(id==='week'){var w=W(),n2=m.step+1;if(m.step===w.s){w.s=n2;res.coins=give(C.week.step);}
      if(n2>=5){res.title=tr('w_weekAll');if(!w.ok&&w.s>=5){w.ok=1;res.coins+=give(C.week.all);}}
      else{res.title=tr('w_week');res.next={id:id,step:n2,t:tr('next')};}
      res.lines.push(tr('weekStep')+n2+tr('of')+'5 · '+tr('c_'+m.cond));}
    else if(id==='fish'){var f=F(),pf=f.st;f.st=Math.max(pf,st);res.coins=give(st>pf?(C.fish[st-1]||0)-(pf?C.fish[pf-1]||0:0):0);res.title=tr('w_fish');
      res.lines.push(tr('served')+g.served+tr('of')+g.lv.K);}
    else if(id==='torg'){res.title=tr('w_torg');res.lines.push(tr('torg')+': '+tr('r_'+m.rule));res.next={home:1,t:tr('next')};}
    else if(id==='deficit'){Sx().mdD={d:day()};res.title=tr('w_def');res.lines.push(tr('served')+g.served+tr('of')+g.lv.K);res.next={home:1,t:tr('next')};}
    if(g.newCard>=0&&typeof RARE!=='undefined'&&RARE[g.newCard])res.lines.push(tr('card')+RARE[g.newCard].n);
    res.st=st;GBMD.res=res;sv();
    try{if(window.STAT&&STAT.end)STAT.end('win',Object.assign({st:st},typeof stEnd==='function'?stEnd():{}));}catch(e){}
    GB._lvEnd('win',{st:st,first:false});stat('end',{id:id,st:m.step,sc:id==='rush'?g.served:st,r:'win'});GB.emit('md',{id:id,r:'win',st:m.step,sc:id==='rush'?g.served:st});
    var line=''; /* POLISH (QA-RU Ф5): реплика по исходу — кто-то ушёл → «win.angry», иначе «win.any» (не «План перевыполнен!» при 16 из 20) */
    try{if(window.GBT&&GBT.say)line=GBT.say(g.angry>0?'win.angry':'win.any',{})||'';}catch(e){}
    if(!line&&!(g.angry>0))line=typeof PH!=='undefined'&&PH.valya&&PH.valya.win?pick(PH.valya.win):'';if(line&&typeof say==='function')say(line,'valya');
    kassa(g,res,line);}
  function kassa(g,res,line){if(typeof modal!=='function')return;var ctx=GB.winCtx({st:res.st,card:-1,first:false,busy:true,mode:res.id,md:res});
    var h='<h2>'+res.title+'</h2><div class="big-stars">'+(typeof starsHtml==='function'?starsHtml(res.st):'')+'</div>'+
      (line&&typeof valyaHtml==='function'?valyaHtml(QQ(line)):'')+
      (res.coins?'<p class="coins-won">+'+res.coins+' 💰</p>':'')+GB.winHtml(ctx)+
      '<div class="row">'+(res.next?'<button class="btn green big" id="mdNext">'+res.next.t+'</button>':'')+
      (NO[res.id]<=5?'<button class="btn" id="mdOut">'+tr('out')+'</button>':'')+'<button class="btn" id="mdMap">'+tr('map')+'</button></div>';
    modal(h);GB.winMount(ctx);if(typeof valyaDraw==='function'&&line)valyaDraw();
    var n=$i('mdNext');if(n)n.onclick=function(){n.disabled=true;GBMD.next();};
    var oo=$i('mdOut');if(oo)oo.onclick=function(){hideModal();GBMD.open();};$i('mdMap').onclick=function(){hideModal();openMap();};}
  GBMD.next=function(){var r=GBMD.res;if(r&&r.next&&r.next.home){if(typeof hideModal==='function')hideModal();openMap();return;}if(r&&r.next){if(typeof hideModal==='function')hideModal();GBMD.start(r.next.id,{step:r.next.step});}else{if(typeof hideModal==='function')hideModal();GBMD.open();}};
  // строки режима в «Кассе» (zone extra) — и в своей, и в «Кассе» VIEW, если она возьмёт режимы
  GB.add(GB.winSlots,{id:'md',order:50,zone:'extra',on:function(){var g=Gx();return !!(g&&((g.mode&&NO[g.mode])||(!g.mode&&g.idx>=1500)));},
    render:function(ctx){var g=Gx();if(g&&g.mode&&GBMD.res)return '<div class="md-lines">'+GBMD.res.lines.map(function(t){return '<p>'+t+'</p>';}).join('')+'</div>';
      if(g&&!g.mode&&g.idx>=1500&&spOn()){var sp=GBMD.sp();return '<div class="md-lines"><p>📈 '+tr('sp')+': '+tr('sp_n')+sp.n+tr('lv')+'</p></div>';}return '';}});
  function mdLose(g,why){if(!g||g.mdEnd)return;g.mdEnd=1;g.over=true;if(typeof YG!=='undefined')YG.stop();if(typeof SND!=='undefined')SND.stuck();
    try{if(window.STAT&&STAT.end)STAT.end('lose',typeof stEnd==='function'?stEnd():{});}catch(e){}
    GB._lvEnd('lose');var id=g.mode,m=g.md;stat('end',{id:id,st:m.step,sc:id==='rush'?g.served:0,r:why});GB.emit('md',{id:id,r:'lose',st:m.step});
    if(id==='marathon'){var mm=M();mm.b=Math.max(mm.b,m.step);sv();}
    var t=why==='mar'?tr('l_mar'):why==='moves'?tr('l_moves'):why==='jam'||why==='jamp'?tr('l_jam'):tr('l_cond'),
      d=why==='mar'?tr('l_mar_t'):why==='moves'?tr('l_moves_t'):why==='jam'?tr('l_jam_t'):why==='jamp'?tr('l_jamp_t'):tr('l_cond_t');
    var restart=id==='marathon'?0:m.step,undo=id==='priemka'&&g.undo&&g.undo.length&&(why==='jamp'||g.moves<m.lim);
    var ctx=GB.winCtx({rev:false,mode:id});
    modal('<h2>'+t+'</h2><p>'+d+'</p>'+(id==='marathon'?'<p class="md-lines">'+tr('marStep')+(m.step+1)+tr('of')+'5</p>':'')+GB.loseHtml(ctx)+
      '<div class="row">'+(undo?'<button class="btn accent buy" id="mdUndo">↶ '+(typeof BNAME!=='undefined'?BNAME.undo:'')+'</button>':'')+
      '<button class="btn green" id="mdRe">'+tr('restart')+'</button><button class="btn" id="mdOut">'+tr('out')+'</button><button class="btn" id="mdMap">'+tr('map')+'</button></div>');
    GB.loseMount(ctx);
    var u=$i('mdUndo');if(u)u.onclick=function(){hideModal();g.mdEnd=0;GB._lvRevive();g.over=false;useBoost('undo');};
    $i('mdRe').onclick=function(){GBMD.start(id,{step:restart});};$i('mdOut').onclick=function(){hideModal();GBMD.open();};$i('mdMap').onclick=function(){hideModal();openMap();};}
  GBMD._lose=mdLose;GBMD._win=mdWin;

  /* ---------- поставщики для META: «Проверка Торга» (GBM.torg) и «Дефицит дня» (GBPL.deficit) ---------- */
  function defAcc(d){var k=rk(d),a=T.acc[k]; /* gb-MERGE: GBPL.defName(день) */return a||(typeof RARE!=='undefined'&&RARE[k]?String(RARE[k].n).toLowerCase():'');}
  GBMD.defDone=function(){var s=Sx();return !!(s&&s.mdD&&s.mdD.d===day());};
  function prov(){if(!enOk())return;
    if(window.GBM&&!GBM.torg&&GB.flag('md')&&GB.flag('md_torg'))GBM.torg={by:'MODE',start:function(r){GBMD.start('torg',{step:r});},name:function(r){return tr('r_'+rule(r));}};
    if(window.GBPL&&!GBPL.deficit&&GB.flag('md')&&GB.flag('md_deficit'))GBPL.deficit={by:'MODE',start:function(){GBMD.start('deficit');},name:defAcc,done:GBMD.defDone};}
  prov();GB.on("ready",prov);GBMD._prov=prov;

  /* ---------- «Сверхплан»: счёт уровней сверх 1500 (уровни — LVL) ---------- */
  GB.levelHook.push(function(i){if(i.mode||i.daily||i.r!=='win'||!(i.l>1500))return;var s=Sx();if(!s||!s.mdSp)return;
    if(i.first){s.mdSp.n++;s.mdSp.st+=i.st||0;stat('end',{id:'sp',sc:s.mdSp.n,st:i.st||0,r:'win'});}});

  /* ---------- входы: список, гнёзда, экран ---------- */
  var IC={priemka:'📦',rush:'🏃',marathon:'🔥',week:'📋',fish:'🐟',sp:'📈'};
  function status(id){if(!Sx())return '';
    if(id==='priemka'){var p=P();return tr('today')+p.s.map(function(x){return '★'.repeat(x)+'☆'.repeat(3-x);}).join(' ');}
    if(id==='rush'){var r=R();return today('rush')?(r.n?tr('best')+r.b+'/20':tr('d_rush')):tr('wkend');}
    if(id==='marathon'){var m=M();return m.ok?tr('done')+' ✓':m.b?tr('best')+m.b+'/5':tr('d_marathon');}
    if(id==='week'){var w=W();return (w.ok?tr('done')+' ✓ · ':w.s?w.s+'/5 · ':'')+tr('c_'+GBMDG.cond(week()));}
    if(id==='fish'){var f=F();return today('fish')?(f.st?tr('today')+'★'.repeat(f.st):tr('d_fish')):tr('thu');}
    if(id==='sp'){return tr('sp_n')+GBMD.sp().n+tr('lv');}return '';}
  GBMD.list=function(){var L=[];IDS.forEach(function(id){if(GBMD.shown(id))L.push({id:id,ic:IC[id],t:tr(id),s:status(id),can:GBMD.can(id)});});
    if(spOn())L.push({id:'sp',ic:IC.sp,t:tr('sp'),s:status('sp'),can:true});return L;};
  GBMD.go=function(id){if(id==='sp'){stat('go',{id:'sp'});startLevel(Math.max(1500,lvl()-1));return;}if(GBMD.can(id))GBMD.start(id);else GBMD.open();};
  function chips(cls){var L=GBMD.list();if(!L.length)return '';
    return '<div class="md-chips '+cls+'"><b class="md-h">'+tr('hall')+'</b>'+L.map(function(x){return '<button type="button" class="md-chip'+(x.can?'':' off')+'" data-md="'+x.id+'"><i>'+(SVG[x.id]?pic(x.id,'md-cpic'):x.ic)+'</i><span>'+x.t+'<small>'+x.s+'</small></span></button>';}).join('')+
      '<button type="button" class="md-chip md-all" data-md="all"><span>'+tr('all')+' →</span></button></div>';}
  function bind(el){var b=el.querySelectorAll('[data-md]');for(var i=0;i<b.length;i++)(function(x){x.onclick=function(){if(typeof SND!=='undefined'&&SND.tap)SND.tap();
      var id=x.getAttribute('data-md');stat('open',{id:id});if(id==='all')GBMD.open();else GBMD.go(id);};})(b[i]);}
  GB.add(GB.homeSlots,{id:'md',order:60,zone:'side',on:function(){return GBMD.list().length>0;},render:function(){return chips('md-home');},mount:bind});
  GB.add(GB.pathSlots,{id:'md',order:20,zone:'top',on:function(){return GBMD.list().length>0;},render:function(){return chips('md-path');},mount:bind});
  // экран «Затеи магазина» (POLISH 11.10): доска объявлений в зале — вывеска, тётя Валя, распорядок недели, карточки-листки
  // с рисунком режима, наградой и сроком («сегодня» / «до конца недели»); на ПК — сетка в 2 колонки
  var SVG={ // рисунки режимов, viewBox 0 0 64 64, без внешних картинок
    priemka:'<rect x="8" y="30" width="48" height="26" rx="3" fill="#b9814a"/><path d="M8 38h48M8 47h48" stroke="#8a5a2e" stroke-width="2.5"/><rect x="12" y="14" width="16" height="18" rx="2" fill="#e8c27a"/><path d="M12 20h16" stroke="#c99a4a" stroke-width="2"/><rect x="31" y="10" width="10" height="22" rx="3" fill="#5f9e6e"/><rect x="33" y="6" width="6" height="6" rx="1" fill="#3f7a4e"/><circle cx="49" cy="24" r="8" fill="#d8573a"/><path d="M49 16c1-3 4-4 6-3" stroke="#3f7a4e" stroke-width="2.5" fill="none"/>',
    rush:'<circle cx="46" cy="14" r="9" fill="#fffaf0" stroke="#7a4a1e" stroke-width="2.5"/><path d="M46 9v5l4 2" stroke="#c8401c" stroke-width="2.5" fill="none" stroke-linecap="round"/><g fill="#7a4a1e"><circle cx="14" cy="28" r="6"/><path d="M5 56c0-12 4-20 9-20s9 8 9 20z"/></g><g fill="#a0673a"><circle cx="30" cy="32" r="5.5"/><path d="M22 58c0-11 3-18 8-18s8 7 8 18z"/></g><g fill="#c99a6a"><circle cx="46" cy="35" r="5"/><path d="M39 58c0-10 3-16 7-16s7 6 7 16z"/></g>',
    marathon:'<rect x="12" y="8" width="40" height="50" rx="4" fill="#a0673a"/><rect x="16" y="14" width="32" height="40" rx="2" fill="#fffaf0"/><rect x="24" y="5" width="16" height="8" rx="2" fill="#7a4a1e"/><path d="M20 24l3 3 5-6M20 34l3 3 5-6M20 44l3 3 5-6" stroke="#2b8a3e" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M32 25h11M32 35h11M32 45h11" stroke="#b9a07a" stroke-width="2.5"/><circle cx="46" cy="48" r="11" fill="none" stroke="#c8401c" stroke-width="3" transform="rotate(-15 46 48)"/><text x="46" y="53" font-size="13" font-weight="900" text-anchor="middle" fill="#c8401c" font-family="sans-serif">5</text>',
    week:'<rect x="8" y="12" width="48" height="44" rx="4" fill="#fffaf0" stroke="#7a4a1e" stroke-width="2.5"/><rect x="8" y="12" width="48" height="12" rx="4" fill="#c8401c"/><path d="M20 8v9M44 8v9" stroke="#7a4a1e" stroke-width="3" stroke-linecap="round"/><g fill="#e3cfa8"><rect x="14" y="30" width="8" height="8" rx="1"/><rect x="28" y="30" width="8" height="8" rx="1"/><rect x="42" y="30" width="8" height="8" rx="1"/><rect x="14" y="43" width="8" height="8" rx="1"/><rect x="28" y="43" width="8" height="8" rx="1"/><rect x="42" y="43" width="8" height="8" rx="1"/></g><path d="M15 34l3 3 5-6M29 34l3 3 5-6" stroke="#2b8a3e" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    fish:'<ellipse cx="32" cy="48" rx="26" ry="8" fill="#e8d9b8"/><path d="M10 34c8-12 26-14 38-4l8-7v22l-8-7c-12 10-30 8-38-4z" fill="#7fa6b8"/><path d="M10 34c8 8 26 10 38 0" fill="#a9c6d3"/><circle cx="18" cy="32" r="2.5" fill="#26323a"/><path d="M28 26c2 4 2 10 0 14M35 25c2 4 2 12 0 16" stroke="#5f8799" stroke-width="2" fill="none"/>',
    sp:'<rect x="8" y="8" width="48" height="48" rx="4" fill="#fffaf0" stroke="#7a4a1e" stroke-width="2.5"/><path d="M14 48h36M14 48V14" stroke="#b9a07a" stroke-width="2"/><rect x="18" y="36" width="6" height="12" fill="#e3b04b"/><rect x="28" y="30" width="6" height="18" fill="#e3b04b"/><rect x="38" y="22" width="6" height="26" fill="#e3b04b"/><path d="M16 38l12-8 8 4 14-14" stroke="#c8401c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M44 18h7v7" stroke="#c8401c" stroke-width="3" fill="none" stroke-linecap="round"/>'};
  function pic(id,cls){return '<svg class="'+(cls||'md-pic')+'" viewBox="0 0 64 64" aria-hidden="true">'+(SVG[id]||'')+'</svg>';}
  function prize(id){var C=cfg(),c=' 💰';
    if(id==='priemka'){var s=0;(C.pr||DEF.pr).forEach(function(x){s+=x[2]||0;});return tr('z_upto')+s+c+tr('z_day');}
    if(id==='rush')return tr('z_upto')+(20*C.rush.per+C.rush.all)+c+tr('z_shift');
    if(id==='marathon')return C.mar.step+c+tr('z_rev')+C.mar.all+c+tr('z_all5');
    if(id==='week')return C.week.step+c+tr('z_step')+C.week.all+c+tr('z_all5');
    if(id==='fish')return tr('z_upto')+C.fish[2]+c;return '';}
  // срок: что сегодня можно, а что ждёт своего дня
  function when(id){var w=dow(),real=id==='rush'?(w===0||w===6):id==='fish'?w===4:true;
    if(id==='marathon'||id==='week')return {t:w===0?tr('z_last'):tr('z_week'),c:'wk'};
    if(id==='sp')return {t:tr('z_always'),c:'td'};
    if(real)return {t:id==='priemka'?tr('z_daily'):tr('z_today'),c:'td'}; // метка — по настоящему календарю (и с ?mdall)
    return {t:id==='rush'?tr('wkend'):tr('thu'),c:'wait'};}
  function week7(ids){var nm=tr('z_days').split(' '),t=(dow()+6)%7,h='';
    for(var i=0;i<7;i++){var L=ids.filter(function(id){return id==='rush'?i>=5:id==='fish'?i===3:id!=='sp';});
      h+='<div class="md-d'+(i===t?' on':'')+'"><b>'+nm[i]+'</b><span>'+L.map(function(id){return pic(id,'md-mini');}).join('')+'</span></div>';}
    return '<div class="md-week" title="'+tr('z_sched')+'">'+h+'</div>';}
  GB.screen('modes',{render:function(el){var L=[],ids=[];IDS.concat(['sp']).forEach(function(id){
      if(id==='sp'?!spOn():!GBMD.shown(id))return;ids.push(id);var can=id==='sp'||GBMD.can(id),st=id==='priemka'?stepOf(id):id==='week'?W().s:0,
        wn=when(id),s=status(id),pz=prize(id);if(id==='week'&&s)s=tr('z_cond')+s;if(s===wn.t)s='';
      L.push('<div class="md-card'+(can?'':' off')+'"><div class="md-ph">'+pic(id)+'</div><div class="md-tx"><b>'+tr(id)+'</b><small>'+tr('d_'+id)+'</small>'+
        '<span class="md-tag '+wn.c+'">'+wn.t+'</span></div>'+
        '<div class="md-ft">'+(s&&s!==tr('d_'+id)?'<small class="md-st">'+s+'</small>':'')+(pz?'<small class="md-pz">'+tr('z_prize')+pz+'</small>':'')+
        (can?'<button type="button" class="btn green" data-md="'+id+'">'+(st>0&&st<5?tr('cont'):tr('play'))+'</button>':'')+'</div></div>');});
    // ещё не открытые — без кнопки, с уровнем открытия (не «скоро»: правило и номер уровня)
    IDS.forEach(function(id){if(GBMD.shown(id)||!on(id)||(id==='fish'&&!dep()))return;
      L.push('<div class="md-card off lock"><div class="md-ph">'+pic(id)+'</div><div class="md-tx"><b>'+tr(id)+'</b><small>'+tr('d_'+id)+'</small>'+
        '<span class="md-tag wait">🔒 '+tr('open')+cfg().open[id]+'</span></div></div>');});
    var va='';try{if(window.GBP&&GBP.bust)va=GBP.bust('valya','happy')||'';}catch(e){}
    el.innerHTML='<div class="md-scr"><div class="md-top"><button type="button" class="btn small" id="mdBack">'+tr('back')+'</button></div>'+
      '<div class="md-board"><div class="md-hero"><div class="md-sign"><h2>'+tr('hall')+'</h2><small>'+tr('z_sched')+'</small></div>'+
        (va?'<div class="md-va">'+va+'</div>':'')+'<div class="md-say">'+tr('z_say')+'</div></div>'+
        (ids.length?week7(ids):'')+'<div class="md-grid">'+L.join('')+'</div>'+
        '<p class="md-note">'+tr('z_cap')+((window.GBECO&&GBECO.cap&&GBECO.cap.md)||60)+' 💰 '+tr('z_cap2')+'</p></div></div>';
    bind(el);$i('mdBack').onclick=function(){openMap();};}});
  GBMD.open=function(){if(typeof G!=='undefined'&&G&&typeof openMap==='function'){openMap();}stat('open',{id:'scr'});GB.go('modes');};
})();
