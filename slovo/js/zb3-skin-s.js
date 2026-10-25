'use strict';
/* ================= zb3-skin — кожа «Зины 3.0» в стиле MIX, ПОЗДНЯЯ часть (поток SKIN, 25.10.2026; журнал hobby-analytics/release-i/zina-boost3/Z3-SKIN.md) =================
   BUILD 25.10, диета: в старте js/zb3-skin.js — флаг z3time, Z3.scene/классы времени и сезона, Z3.fest, Z3.artLoad, догрузка этой части на старте уровня.
   Здесь — флаги z3season/z3fest (реестр), события двора z3ev, значки z3ic, фон «кухня» z3kit, пяльцы z3hoop. Грузится Z3.late (1-й день) / Z3.need ('start').
   Эталон — art/ART-MIX.html (ART-3 v4 «Тёплый двор» + ART-1). Цвета/шрифты — css/zb3-skin.css (--z3-*), рисунки — ленивые js/zb3-art-*.js.
   ВРЕМЯ И СЕЗОН: Z3.scene(qs) → {time:'day'|'eve'|'night', season:'win'|'spr'|'sum'|'aut'} по местному времени устройства
     (день 7–18, вечер 18–22, ночь 22–7; зима дек–фев, весна мар–май, лето июн–авг, осень сен–ноя). Классы html.z3t-<time> html.z3s-<season>;
     раз в 5 минут сверяется, сменилось — window 'resize' (двор перерисуется). qs {t,s} — стенд YARD (?yt/?ys).
     Флаги: ?off=z3time — всегда день и лето; ?time=day|eve|night, ?season=win|spr|sum|aut — стенд.
   РИСУНКИ: Z3.artLoad(id) → Promise (грузит js/zb3-art-<id>.js один раз), потом Z3.art(id, opts) (каркас).
     kitchen — фон уровня «кухня Зины» (?off=z3kit — прежний фон места главы), desk — стол для газеты/письма (Z3.art('desk',{kind:'paper'|'mail', w, h})),
     hoop — пяльцы с двором в окне победы (?off=z3hoop).
   Кухня: ZB.on('start') (после фона VIEW) → слой .z3kit в #zbLvBg под вуалью, класс #zbLvBg.z3k (VIEW снимает его при каждом старте; без него слой скрыт).
   ТЕМЫ ЛАРЬКА: html.th-zima — зима круглый год, html.th-osen — осень круглый год (Z3.scene; смена темы — наблюдатель классов, tick).
   праздники двора по ДАТАМ общего календаря FEST (таблица FEST.table(), по id; список games не важен — событие FEST не включаем, только картинка двора):
     Z3.fest() → ключи ny|hw|feb23|mar|mas|may|sep1|uch (их же берут газета/почта: Z3T fest-<ключ>-*). Стенд: ?fest=<id> (FEST, localhost) — только они.
   ЛЕГЕНДА css/zb3-skin.css (BUILD 25.10, диета: комментарии из CSS перенесены сюда):
     zb3 КОЖА «Зины 3.0» — стиль MIX (принят владельцем 25.10: основа ART-3 «Тёплый двор» + ART-1; эталон art/ART-MIX.html). Хозяин — поток SKIN.
     Здесь ТОЛЬКО переменные (+ шрифты). Все экраны zb3-* берут цвета/шрифты/радиусы/тени отсюда (var(--z3-…)); имена прежние — менять можно значения.
     Кнопки: текст на --z3-acc/--z3-blue/--z3-ok — контраст с белым ≥4,5 (правило игры); --z3-acc-grad — объёмная кнопка MIX с тем же контрастом.
     Шрифты: ZRubik (css/themes.css, кириллица), ZLobster — заголовок «Вечёрки», ZCaveat — почерк Зины (письма). Свои файлы, только русский набор
     (z3-skin-tools/fonts: subset), грузятся браузером, лишь когда шрифт где-то применён. Лицензии — css/fonts/OFL-*.txt.
     --z3-bg — фон экранов (тёплый крем MIX)
     --z3-paper — карточки, бумага
     --z3-card — карточка поверх рисунка
     --z3-ink — основной текст (чернильно-синий MIX)
     --z3-ink2 — второстепенный текст (контраст 5,3 на бумаге)
     --z3-line — линии, рамки
     --z3-acc — главная кнопка (терракота; «Помочь Зине»)
     --z3-acc-grad — она же объёмная (MIX), белый текст ≥4,5
     --z3-acc-edge — нижний «бортик» объёмной кнопки: box-shadow:0 5px 0 var(--z3-acc-edge)
     --z3-ok — успех
     --z3-blue — ссылки, второе действие
     --z3-gold — звёзды, монеты, отметки
     --z3-red — значки «новое», красная ручка
     --z3-wood — дерево (стол, доска, пяльцы)
     --z3-sky — небо двора
     --z3-grass — трава двора
     --z3-shadow — карточки, бирки
     --z3-r — радиус карточек
     --z3-rb — радиус кнопок
     --z3-font — текст интерфейса
     --z3-font-head — заголовки (900)
     --z3-font-paper — шапка газеты «Вечёрка»
     --z3-font-news — текст газетных заметок
     --z3-font-hand — почерк Зины (письма); крупно: ≥19 px
     время суток (классы ставит js/zb3-skin.js): фон под рисунком двора, пока он грузится
     HOUSE (25.10): стройка и подъезд — заглушки построек (js/zb3-art-build.js) и полоса хода стройки. SKIN заменит вместе с рисунками
     комод Зины (поток ALBUM, js/zb3-album-x.js): корпус и ящики, ручки, лён рушника и красная вышивка, открытка
     мини-игры «Перемена» (zmg-*, их стили — css/zmg.css на общих переменных игры): в мире zb3 — палитра MIX, только переменные; под платной темой — тема
   STAT: нет своих событий (вид).
*/
(function(){
  var Z=window.Z3;if(!Z||!Z.on||typeof ZB==='undefined'||Z.skinS)return;Z.skinS=1;
  var DE=document.documentElement;
  Z.reg('z3season',{t:'Двор: слои сезонов (снег, капель, клумбы); выкл — только палитра сезона',who:'SKIN'}); /* читает js/zb3-art-yard.js (ZB2.off) */
  Z.reg('z3fest',{t:'Двор: праздничные слои по FEST (НГ, День учителя…); по одному — ?off=z3f-<ny|hw|feb23|mar|mas|may|sep1|uch>',who:'SKIN'});
  /* ---------- живые события двора PAPER (Z3PAPER.evNow(), 12 событий): украшение двора на время события — js/zb3-art-ev.js лениво.
     Праздник главнее (при Z3.fest() не рисуется). ?off=z3ev; стенд: ?z3ev=<id> (только localhost). ---------- */
  if(Z.reg('z3ev',{t:'Двор: украшение к живому событию газеты (шахматы, выборы, субботник…)',who:'SKIN'})){
    var AE=window.Z3ART=window.Z3ART||{};AE.yardFx=AE.yardFx||[];
    AE.evId=function(){try{var m=/[?&]z3ev=([a-z]+)/.exec(location.search);if(m&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname))return m[1];
      var e=window.Z3PAPER&&Z3PAPER.evNow&&Z3PAPER.evNow();return e&&e.id||'';}catch(e){return '';}};
    AE.yardFx.push(function(c){if(!AE.evOn&&!(c.fk&&c.fk.length)&&AE.evId())Z.artLoad('ev').then(function(){if(AE.yardRedraw)AE.yardRedraw();},function(){});return '';});
    if(AE.yardRedraw&&AE.evId())AE.yardRedraw();} /* двор уже нарисован без этого крючка */
  function css(id,txt){if(!txt||document.getElementById(id))return;var s=document.createElement('style');s.id=id;s.textContent=txt;document.head.appendChild(s);}
  /* ---------- значки MIX вместо эмодзи в шапках экранов zb3 (js/zb3-art-icons.js лениво; эмодзи — скрытым текстом). ?off=z3ic ---------- */
  var IC=Z.reg('z3ic',{t:'Значки MIX вместо эмодзи (бирки двора, экраны zb3: шапки, рубрики)',who:'SKIN'}),HD='.z3m-hd,.z3p-hd,.z3h-hd,.z3a-hd,.z3k-hd,.vc-hd,.z3y-tag b';
  function icDo(){if(DE.classList.contains('th-x'))return;Z.artLoad('icons').then(function(){var A=window.Z3ART;if(!A.icDecor)return;css('z3icCss',A.icCss);
    [].forEach.call(document.querySelectorAll('.screen.on'),function(sc){if(/^zb-(z3|vech)/.test(sc.id))ZB.safe('z3ic',function(){A.icDecor(sc);});else [].forEach.call(sc.querySelectorAll(HD),function(h){ZB.safe('z3ic',function(){A.icDecor(h);});});});},function(){});}
  if(IC){ZB.on('screen',function(){setTimeout(icDo,60);setTimeout(icDo,700);});Z.whenReady(function(){setTimeout(icDo,0);});}
  /* ---------- уровень: кухня Зины (окно сквозное — за ним место главы VIEW/CORE). Задание дня — как было (фон VIEW) ---------- */
  var KIT=Z.reg('z3kit',{t:'Уровень: фон «кухня Зины», за окном — место главы',who:'SKIN'});
  function kitPaint(){var b=document.getElementById('zbLvBg'),A=window.Z3ART;if(!b||!A||!A.kitchen||/\bday\b/.test(b.className))return;
    css('z3kitCss',A.kitchenCss);var w=b.clientWidth,h=b.clientHeight;if(!w||!h)return;
    var pc=window.innerWidth>=860,t=Z.scene().time,key=w+'x'+h+t+pc,el=b.querySelector('.z3kit');
    if(!el){el=document.createElement('div');el.className='z3kit';b.insertBefore(el,b.querySelector('.veil'));}
    if(el.getAttribute('data-k')!==key){el.setAttribute('data-k',key);el.innerHTML=Z.art('kitchen',{w:w,h:h,pc:pc,time:t});}
    b.classList.add('z3k');}
  if(KIT){var kt=0;
    ZB.on('start',function(info){if(info&&info.daily)return;Z.artLoad('kitchen').then(function(){ZB.safe('z3kit',kitPaint);},function(){});});
    window.addEventListener('resize',function(){clearTimeout(kt);kt=setTimeout(function(){ZB.safe('z3kit',kitPaint);},250);});
    /* уровень уже идёт (эта часть догрузилась по 'start') — рисуем кухню сейчас */
    var st=ZB._st,gm=document.getElementById('game');if(st&&!st.daily&&gm&&gm.classList.contains('on'))Z.artLoad('kitchen').then(function(){ZB.safe('z3kit',kitPaint);},function(){});}
  /* ---------- финал главы: значок пройденной главы → пяльцы с вышитым местом главы (размер тот же 58×58 — окно и fitChap не меняются) ---------- */
  var HOOP=Z.reg('z3hoop',{t:'Финал главы: место главы в пяльцах',who:'SKIN'});
  if(HOOP)ZB.add(ZB.chapSlots,{id:'z3hoop',order:95,render:function(){return '<span hidden></span>';},mount:function(el,ctx){
    if(!ZB.vw||DE.classList.contains('th-x')||!ZB.placeInto)return;var m=document.getElementById('mcard'),e=m&&m.querySelector('.chfin .em:not(.nx)');if(!e||e.getAttribute('data-h'))return;
    css('z3hoopCss','.chfin .em.z3hoop{position:relative;overflow:hidden;border-radius:50%;border:5px solid #b97a48;box-shadow:0 0 0 2px #8a5530,inset 0 0 0 2px #e3b27c,0 6px 12px rgba(60,30,10,.3)}'+
      '.chfin .em.z3hoop .z3hp{position:absolute;top:0;left:0;right:0;bottom:0}.chfin .em.z3hoop .z3hp svg{width:100%;height:100%;display:block}'+
      '.chfin .em.z3hoop::after{content:"";position:absolute;left:50%;top:-1px;width:10px;height:7px;margin-left:-5px;border-radius:2px;background:#c9a25a}');
    e.setAttribute('data-h',1);var c=ctx&&ctx.c!=null?ctx.c:0,d=document.createElement('div');d.className='z3hp';e.appendChild(d);e.classList.add('z3hoop');
    ZB.safe('z3hoop',function(){ZB.placeInto(d,c,'xMidYMid slice');});}});
})();
