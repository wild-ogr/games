'use strict';
/* ================= zb-win — окно победы «лесенка наград» (поток VIEW, 10.10.2026) =================
   Зовётся из winModal (ui.js), если новый вид включён (ZB.vw): ZBW.html(p) → разметка окна, ZBW.after(g,r,again) → анимации.
   Расчёты (награда, корзинка, вопрос, «Дальше») — прежние, в winModal; id кнопок те же (mNext, mDly, mBox, mAsk, mShare, mGoalW),
   обработчики — общие в winModal. Порядок ступенек (появляются по очереди, «Дальше» — сразу и всегда на одном месте, внизу):
     1) заголовок + штамп «5+» (без подсказок) / «5» (с подсказкой)
     2) открытка «Толкового словаря» с номером в коллекции («открытка 49»)
     3) монеты (летят в счётчик — coinBurst), «Отличник», бонусные слова в банку — фишками в ряд
     4) zone 'ladder' (гнёзда)
     5) шаг полоски главы (точки, новая — подпрыгивает) + zone 'goal' (сувенир, класс — SCHOOL/CAB)
     6) Зина и Ять реагируют (ZB.say('win') от TEXT, запас — свои 10 реплик)
     7) ОДНО предложение (см. ниже) + Соседки + zone 'extra'
     8) кнопки: «Дальше» · задание дня (10-й ур.) · предложение-кнопка · «В меню» (winMenu)
     9) «Завтра…» — zone 'tmr' или своя строка (tmrHtml)
   ПРАВИЛО ОДНОГО ПРЕДЛОЖЕНИЯ (MG0, NEWBIE, ECO — по нему): в окне не больше одного «зова» сверх «Дальше». Приоритет:
     конец главы (своё окно openChapFinale) / все уровни > вопрос «Напомнить…»/избранное (ask, SOC) > Перемена (winSlots zone 'mg')
     > корзинка (box) > цель облика (goal, раз в 5 побед). Занято — ctx.busy=true, zone 'mg' не рисуется вовсе (render не зовётся —
     MG0 не считает показ). Корзинка, уступившая место, не сгорает: S.box снова «полный» — придёт со следующей победой.
   fitWin (ui.js) в новом виде убирает лишнее по очереди: гнёзда data-fit → фраза «Отличника» → расшифровка монет → реакция Зины →
     Соседки → цель → шапка открытки → … — окно без прокрутки на 320×568. */
(function(){
  if(typeof ZB==='undefined'||!ZB.vw)return;
  var esc=ZB.esc;
  var WIN_SAY=['Сам, всё сам! Ять, неси пирожок — заслужил.','Вот это голова! Пойду соседке расскажу.','Ять, видал? Учись, пока я жива.',
    'Пятёрка! В журнал — красной ручкой, с нажимом.','Молодец! Даже кот проснулся похлопать.','Ну, профессор! Очки протру — не верится.',
    'Так держать! Завуч Валентина Петровна обзавидуется.','Умница! Ять говорит «мяу» — это «браво» по-кошачьи.','Отлично! Ставлю тебе пять и пирожок сверху.',
    'Вот это скорость! Я так только за пенсией бегаю.'];
  function dots(len,done,first){var h='';for(var i=0;i<len;i++)h+='<i class="'+(i<done?'d':i===done?'c':'')+(first&&i===done-1?' nw':'')+'"></i>';return '<div class="zdots">'+h+'</div>';}
  function cardNo(){var n=0;if(typeof S!=='undefined'&&S.dict)for(var k in S.dict)if(S.dict[k])n++;return n;}
  // открытка: как defCardHtml, плюс номер в коллекции
  function card(w,isNew){var h=defCardHtml(w,isNew,true),no=cardNo();
    return no?h.replace(/(<div class="word">[^<]*)<\/div>/,'$1<small class="no">открытка № '+no+'</small></div>'):h;}
  var T_EX=['Пять с плюсом!','Садись, пять!','Без единой ошибки!','Пять с плюсом!'],T_OK=['Садись, пять!','Молодец!','Вот это голова!','Отлично!','Пятёрка!'];
  function pick1(L){return L[Math.floor(Math.random()*L.length)];}
  var ZBW=window.ZBW={};
  ZBW.html=function(p){var g=p.g,r=p.r,zbc=p.zbc,again=p.again;
    // одно предложение
    // дирижёр новичка NEWBIE (ZBNB.turn(id) — можно ли показать новинку сейчас); спрашиваем только у кандидата, до которого дошла очередь
    var turn=function(id){return !window.ZBNB||!ZBNB.turn||ZB.safe('ZBNB.turn',function(){return ZBNB.turn(id);})!==false;};
    var ask=p.ask;if(ask&&!again&&!r.zbAskOk){if(!turn('ask'))ask=null;else r.zbAskOk=1;}
    var busy=!!(r.chap&&!r.chapSeen)||p.last||!!ask;zbc.busy=busy;
    var mg=busy||g.daily&&!p.r.first||(!again&&!turn('mg'))?'':ZB.html(ZB.winSlots,'mg',zbc);
    var holdBox=r.box==='on'&&!r.boxGot&&(!!p.ask||!!mg);
    if(holdBox&&!again){if(typeof BOX!=='undefined'&&(+S.box||0)<BOX.every){S.box=BOX.every;save();}r.box=0;r.boxHeld=1;}
    var E=window.ZBECO,nox2=!!(E&&E.x2===false); // ECO: «×2/корзинка за ролик» убраны — не рисуем
    var box=r.box==='on'&&!nox2?(r.boxGot?'<button class="btn gold" disabled>✅ '+boxTxt()+'</button>':'<button class="btn gold box" id="mBox">🎬 🧺 Корзинка за рекламу: <span class="nw">'+boxTxt()+'</span></button>'):'';
    var askH=ask?(ask.soc?'<div class="soc-o"><span>'+ask.soc+'</span><button class="btn ghost small" id="mAsk">'+ask.t+'</button></div>':'<button class="btn ghost small" id="mAsk">'+ask.t+'</button>'):'';
    var goal=p.light||p.chapDone||p.last||g.daily||r.dly||ask||mg||box||(S.wins||0)%5!==1||(!again&&!turn('goal'))?'':'<div class="goal'+(goalCan()?' can':'')+'" id="mGoalW">'+p.ch.e+' '+p.ch.n+': <b>'+p.chDone+'/'+CH_LEN+'</b> · '+goalHtml()+'</div>';
    // штамп: без подсказок — «5+», с подсказкой — «5»
    var stamp='<div class="zbw-stamp'+(r.exc?' plus':'')+'" aria-hidden="true">5'+(r.exc?'<sup>+</sup>':'')+'</div>';
    // фишки: монеты, Отличник, банка
    var bw=g.bonus&&g.bonus.size||0;
    var chips='<div class="zbw-chips"><div class="zc coins" id="mRew">+'+p.reward+' <span class="coin"></span></div>'+
      (r.exc&&!p.light?'<div class="zc ex">🏅 <b>Отличник</b>'+(r.exBonus?'<small>+'+r.exBonus+' '+COIN_I+'</small>':'<small>без подсказок</small>')+'</div>':'')+
      (bw&&!p.light?'<div class="zc jar">🍯 <b>+'+bw+'</b><small>'+plural(bw,'слово','слова','слов')+' в банку</small></div>':'')+'</div>';
    // полоска главы
    var chH='';if(!g.daily){var c=ZB.chapAt(g.idx),ch=ZB.chap(c),len=ch.to-ch.from+1,done=Math.max(0,Math.min(len,S.lv-ch.from)),left=len-done;
      var gl=ZB.html(ZB.winSlots,'goal',zbc);
      chH='<div class="zbw-chap"><div class="h"><b>'+ch.e+' '+esc(ch.name)+'</b><span>'+done+' / '+len+'</span></div>'+dots(len,done,p.r.first)+
        (gl||'<small>'+(left>0?'ещё '+left+' '+plural(left,'урок','урока','уроков')+' — и подарок за главу':'глава пройдена — подарок ждёт!')+'</small>')+'</div>';}
    // заголовок — короткий (длинная фраза Зины — в её реплику ниже); конец главы / всех уровней — как было
    var title=p.lastAll||p.chapDone||p.last?p.title:(r.zbTitle||(r.zbTitle=pick1(r.exc?T_EX:T_OK)));
    var line=r.zbSay||(r.zbSay=ZB.say('win',{g:g,r:r,exc:r.exc,daily:g.daily},WIN_SAY.concat([p.title,p.title])));
    var react=p.light?'':'<div class="zbw-react"><div class="zz">'+zinaSVG(r.exc?'wow':'happy')+'</div><div class="bb">'+esc(line)+'</div><div class="kt">'+catSVG()+'</div></div>';
    var tmrS=ZB.html(ZB.winSlots,'tmr',zbc),tmr=tmrS||(p.tmr&&!ask?'<p class="tmr">'+p.tmr+'</p>':'');
    return '<div class="'+(again?'':'win ')+'zbw'+(p.light?' light':'')+'">'+
      '<div class="zbw-top"><h2>'+title+'</h2>'+stamp+'</div>'+
      (p.lastAll?'<p>Все '+LEVELS.length+'! Вот это голова. А задание дня — каждый день новое.</p>':'')+
      (p.hasDef?card(p.dw,p.isNew):'<div class="zbw-zina">'+zinaSVG('happy')+'</div>')+
      chips+
      (r.exLoud&&!p.light?'<p class="exsay" style="font-size:15px">'+(r.exSay||(r.exSay=say('excellent')))+'</p>':'')+
      (r.rankUp?'<p class="rankup">🎓 Новое звание: <b>'+r.rankUp+'</b>!</p>':'')+
      p.streakTxt+
      (p.money&&!p.light?'<p class="money">'+p.money+'</p>':'')+
      (g.daily&&r.first?weekHtml(r.dk):'')+p.tomorrow+
      (r.dly?'<p class="dly">📅 Открылось <b>задание дня</b>: каждый день — новый кроссворд с подарком.</p>':'')+
      ZB.html(ZB.winSlots,'ladder',zbc)+chH+react+mg+goal+
      (typeof sosWinHtml==='function'?sosWinHtml(g,r,p.light):'')+ZB.html(ZB.winSlots,'extra',zbc)+
      '<div class="btns"><button class="btn green" id="mNext">'+p.nextTxt+'</button>'+
        (r.dly&&!S.daily[todayKey()]?'<button class="btn blue" id="mDly">📅 Сыграть задание дня</button>':'')+box+askH+'</div>'+tmr+'</div>';};
  // после показа: подскок счётчика монет, реакция кота
  ZBW.after=function(g,r,again){if(again)return;
    // пока ступеньки «въезжают» (сдвиг вниз до 22 px), полоса прокрутки не мигает
    var m=document.getElementById('mcard');if(m){m.style.overflowY='hidden';clearTimeout(ZBW._t);ZBW._t=setTimeout(function(){m.style.overflowY='';},2200);}var k=document.querySelector('#mcard .zbw-react .kt');if(k)setTimeout(function(){k.classList.add('hop');},1300);};
})();
