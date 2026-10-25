'use strict';
/* ================= zb3-kiosk-x — экран «Ларёк „Учительская“» (поток KIOSK, 25.10.2026; журнал zina-boost3/Z3-KIOSK.md) =================
   Грузится лениво из js/zb3-kiosk.js (там флаги, поле S.z3s, товары, обёртки). Экраны: ZB.go('z3kiosk',{from}) и 'z3kiosk-sk' (сканворд подписчика).
   Плитка = картинка, заголовок, одна строка состояния, одна кнопка (правило владельца 24.10); описание — по нажатию на плитку (то же место экрана).
   Плитки: Подписка на «Вечёрку», Сканворд подписчика (только подписчикам, рубрика sk газеты), Копилка, Узелок новичка (3–9 день), Ярмарка (ZB2FAIR),
   Оформление (THEME), «Вся полка» (Учительская ZBSHOP). Платежей нет (Яндекс без товаров, VK на iPhone, мак) — только ярмарка и оформление.
   Рекламы в ларьке нет (решение: ролики — только где нужна помощь). Тексты — Z3T['kiosk-*'] (TEXT), до них — заглушки ниже. */
/* ===== ДОГОВОР СТАРТ-МОДУЛЯ js/zb3-kiosk.js (перенесено сюда ради веса старта) ===== zb3-KIOSK — «Ларёк „Учительская“» во дворе (деньги). 25.10.2026, ветка z3-kiosk =================
   Журнал: hobby-analytics/release-i/zina-boost3/Z3-KIOSK.md. Здесь — старт (флаги, поле S.z3s, товары, обёртки); экран — js/zb3-kiosk-x.js
   (лениво), рисунки — js/zb3-art-kiosk.js (Z3ART: kiosk, pig, vech, uz, look, shelf, fair).
   Флаги (?off=…): z3s — весь ларёк; z3s-sub — «Подписка на Вечёрку»; z3s-pig — копилка на подоконнике; z3s-uz — Узелок новичка в 3–9 день.
   Товары (PAY_ITEMS, цена vk в голосах, ОК = ×OK_PER_VOTE): vecherka 15 — 30 дней: без межэкранной (обёртка zbTiho), 💡 в день, сканворд подписчика,
     и что добавят MAIL/PAPER; продлевается, без автосписания. kopilka 7 — разбить копилку: все монеты из неё (не меньше PIG.min).
   Подписка для других потоков: window.Z3KIOSK.sub() → true/false, .subTo() → мс. Своя польза подписки в списке ларька:
     (window.Z3SUB=window.Z3SUB||[]).push({id:'mail',t:'Письмо от Зины каждый день'}) — в любой момент загрузки.
   Поле S.z3s {to конец подписки (мс), n куплено подписок, hd день последней 💡 подписчика, pg монет в копилке, pb разбито раз, sk день сканворда,
     u день «увидел узелок», v день последнего захода в ларёк}.
   STAT z3s {a: open|tile|buy|daily|pig|sk|full, k, …} — поля в журнале. Старые WebView (Chrome 92): без ?. ?? .at :has. */
/* Этап 3 (25.10): флаги z3s-pass (пропуск «Сезон двора», товар pass_s 20 гол., сезон = месяц; поле S.z3s.ps {k,p,f,g,b,n}), z3s-yat («Ять откроет слово», js/zb3-kiosk-yat.js; S.z3s.yd/yn — день и счёт),
   z3s-ab (Абонемент в Подписке); темы витрины THS: th_zima, th_osen (продаются, когда тема есть в THEMES). Тексты — js/zb3-kiosk-data.js (tools/zb3_kiosk_data.py). */
/* Этап 4 (25.10, АУДИТ круг 2): z3s-pigp — копилка «отсыпать часть» (M14): товар kopilka_p PIG.pvk=3 гол. — до PIG.part=400 монет, предлагается
   ранним шагом, пока в копилке PIG.min…PIG.pmax (300…999); дальше на плитке — «Разбить». z3s-mgad (M17) и z3s-train (M18) — ролики по кнопке,
   js/zb3-kiosk-ad.js (лениво; договор — его шапка). */
/* Заметки старт-модуля:
   - решение владельца 25.10: Абонемент в библиотеку слит с Подпиской — abon не продаём (id и выдача остаются), у кого Абонемент — польза подписки до его конца,
   - подписчику — дорожка четверти (ZBECO.abonOn). ?off=z3s-ab — как раньше: Абонемент продаётся отдельно
   - п.7 ДОБАВКИ 25.10: сезонный пропуск «Сезон двора» — сезон = календарный месяц; очки за уровни копятся здесь, награды забирают в ларьке (zb3-kiosk-x.js)
   - копилка: у кого больше разбитий — того и содержимое (разбил на другом устройстве — не вернётся); иначе больше. Остальное — максимум
   - пропуск: сезон новее — его; тот же — максимум; покупки (b, n — ключи месяцев) — максимум
   - платная тема двора (решение владельца 25.10: вместо «Советской открытки» — «Зимний двор» в стиле MIX; рисунок и THEMES-строку 'zima' делает SKIN).
   - Товар появляется, только когда тема есть в THEMES (до SKIN — не продаётся). id товара th_zima — в каталог hobby-pay (заявка в журнале)
   - 25.10 (п.9 ДОБАВКИ): + «Осенний двор» th_osen (11 гол./65 ОК) — тема 'osen' рисует SKIN; до неё не продаётся. KI.TH — первая (зимняя), как было
   - Абонемент не продаём: PAY.item('abon') → null (витрина, четверть, PAY.buy); восстановление старых покупок идёт по PAY_ITEMS — не задето
   - 💡 подписчику раз в день (запас полон — 35 монет)
   - межэкранная: подписчику — нет (тот же выключатель, что «Тихий час»: interDue, interWhy, intWant смотрят zbTiho)
   - покупки приходят после облака (payInit) — дописать товары и выдать 💡 дня */
(function(){
  var Z=window.Z3,KI=window.Z3KIOSK;if(!Z||!KI)return;
  function $(id){return document.getElementById(id);}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function tap(){try{SND.tap();}catch(e){}}
  function coinI(){try{return COIN_I;}catch(e){return '💰';}}
  function T(k,def,ctx){return Z.txt('kiosk-'+k,ctx)||def;}
  function pick(L){return L[Math.floor(Math.random()*L.length)];}
  var HI=['Ларёк открыт! Пятёрки не продаю. Валерка спрашивал. Трижды. С деньгами.',
    'Ценники писала красной ручкой. Две ошибки нашла. Обе — у себя, но исправила на чужих.',
    'Мой зашёл за газетой. Вышел с подпиской, копилкой и вопросом, кто тут главный.',
    'Галя говорит, у ворот всё дороже. Галя тут ни разу не была. Из принципа и экономии.',
    'Кассу открываю в девять. Ять — в восемь: проверяет, на месте ли колбаса.',
    'Подписчикам «Вечёрку» несут к порогу. Остальным — тоже, но через Галю и с пересказом.'];
  var view='',from='yard';

  /* ---------- плитки ---------- */
  function price(id){try{return PAY.price(PAY.item(id));}catch(e){return '';}}
  function buyBtn(id,txt,dis){return '<button type="button" class="btn green z3k-b'+(dis?'':' pbuy')+'"'+(dis?' disabled':' data-pid="'+id+'"')+'>'+txt+(dis?'':' · '+price(id))+'</button>';}
  function pigEarly(z){return !!(KI.F.pigp&&KI.has('kopilka_p')&&z.pg>=KI.PIG.min&&z.pg<KI.PIG.pmax);} // M14: ранний шаг
  function goBtn(k,txt,dis){return '<button type="button" class="btn blue z3k-b" data-k="'+k+'"'+(dis?' disabled':'')+'>'+txt+'</button>';}
  function rubSk(){try{return Z.rubGet&&Z.rubGet('sk')||null;}catch(e){return null;}}
  function perks(){var L=['🚫 Без рекламы между уровнями — все 30 дней','💡 Подсказка каждый день — почтальонка приносит сама'];
    if(rubSk())L.push('📰 Сканворд подписчика — каждый день, +'+KI.SK.c+' монет');
    if(KI.F.ab)L.push('🎟 Дорожка четверти в Школе — наклейки, рамки открыток, медаль');
    var X=window.Z3SUB||[],seen={};for(var i=0;i<X.length;i++){var p=X[i];if(p&&p.t&&!seen[p.id]){seen[p.id]=1;L.push(String(p.t));}}
    return L;}
  function tiles(){var z=KI.K(),L=[],pay=KI.payOn(),sub=KI.sub(),d=KI.tk();
    if(KI.F.sub&&KI.has('vecherka'))L.push({k:'sub',pic:'kiosk-vech',t:'Подписка на «Вечёрку»',s:sub?'до '+KI.dm(KI.subTo()):'месяц без рекламы',
      b:buyBtn('vecherka',sub?'Продлить':'Оформить')});
    if(sub&&rubSk())L.push({k:'sk',pic:'kiosk-vech',t:'Сканворд подписчика',s:z.sk===d?'сегодня решён ✓':'свежий ждёт',b:goBtn('sk',z.sk===d?'Завтра новый':'Решать',z.sk===d)});
    if(KI.F.pass){var pr=KI.psReady(),pst=KI.psSteps();L.push({k:'pass',pic:'kiosk-look',t:'Сезон двора',s:pr?'награды ждут: '+pr:'ступень '+pst+' из '+KI.PS.steps,
      b:goBtn('pass',pr?'Забрать':'Открыть'),hot:!!pr});}
    if(KI.pigShow()){var full=z.pg>=KI.PIG.cap;L.push({k:'pig',pic:'kiosk-pig',f:z.pg/KI.PIG.cap,t:'Копилка',s:full?'полная! '+z.pg+' монет':'внутри '+z.pg+' монет',
      b:pigEarly(z)?buyBtn('kopilka_p','Отсыпать '+KI.PIG.part):z.pg>=KI.PIG.min?buyBtn('kopilka','Разбить'):buyBtn('kopilka','Копится до '+KI.PIG.min,1),hot:full});}
    if(KI.uzShow()){L.push({k:'uz',pic:'kiosk-uz',t:'Узелок новичка',s:'только новосёлам',b:buyBtn('starter','Купить'),hot:1});if(z.u!==d){z.u=d;KI.sv();}}
    if(window.ZB2FAIR&&ZB2FAIR.open)L.push({k:'fair',pic:'kiosk-fair',t:'Ярмарка',s:'скидки за монеты',b:goBtn('fair','Зайти')});
    if(window.THEME&&THEME.open){var zt=KI.thNew();
      L.push({k:'look',pic:'kiosk-look',t:'Оформление',s:zt?'новое: «'+zt.n+'»':'другой вид игры',b:goBtn('look','Посмотреть'),hot:zt});}
    if(pay&&window.ZBSHOP&&ZBSHOP.has&&ZBSHOP.has())L.push({k:'shelf',pic:'kiosk-shelf',t:'Вся полка',s:'монеты, без рекламы, чай',b:goBtn('shelf','Открыть')});
    return L;}
  function tile(o){return '<div class="z3k-t'+(o.hot?' hot':'')+'" data-d="'+o.k+'"><div class="z3k-p">'+Z.art(o.pic,{f:o.f})+'</div><b>'+esc(o.t)+'</b><small>'+esc(o.s)+'</small>'+o.b+'</div>';}

  /* ---------- описание (по нажатию на плитку) ---------- */
  function detail(k){var z=KI.K(),h='',b='',pic='',t='';
    if(k==='sub'){t='Подписка на «Вечёрку»';pic='kiosk-vech';
      h='<ul class="z3k-ul">'+perks().map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul><p class="z3k-n">30 дней с покупки, продление добавляет ещё 30. Само не продлевается и ничего не списывает.'+(KI.sub()?' Сейчас — до '+KI.dm(KI.subTo())+'.':'')+'</p>'+
        '<p class="z3k-say">'+esc(T('sub','Подписка — как пенсия: приносят каждый день. И никто не спрашивает, заслужила ли.'))+'</p>';
      b=KI.has('vecherka')?buyBtn('vecherka',KI.sub()?'Продлить':'Оформить'):'';}
    else if(k==='pig'){t='Копилка на подоконнике';pic='kiosk-pig';
      h='<p>Внутри: <b>'+z.pg+'</b> '+coinI()+' из '+KI.PIG.cap+'.</p><p class="z3k-n">Копилка набирается сама: четверть монет за уровни и всё, что не влезло в дневные потолки. Разбить можно, когда в ней '+KI.PIG.min+' монет и больше, — все монеты твои.'+(pigEarly(z)?' Или отсыпать до '+KI.PIG.part+' монет подешевле — остальное копится дальше.':'')+'</p>'+
        '<p class="z3k-say">'+esc(T('pig','Свинка копит, пока ты разгадываешь. Мой бы так. Он копит только обиды и пакеты.'))+'</p>';
      b=(pigEarly(z)?buyBtn('kopilka_p','Отсыпать '+KI.PIG.part):'')+(KI.has('kopilka')?(z.pg>=KI.PIG.min?buyBtn('kopilka','Разбить'):buyBtn('kopilka','Копится до '+KI.PIG.min,1)):'');}
    else if(k==='uz'){var it=PAY_ITEMS.starter||{};t=it.name||'Узелок новичка';pic='kiosk-uz';
      h='<p class="z3k-n">'+esc(it.desc||'')+'</p><p class="z3k-say">'+esc(T('uz','Узелок собирала сама. Платок — от сердца. Пирожки не положила: Ять проверял.'))+'</p>';
      b=KI.uzShow()?buyBtn('starter','Купить'):'';}
    else return false;
    view=k;var el=$('z3kBody');if(!el)return false;
    el.innerHTML='<div class="z3k-d"><button type="button" class="btn ghost small z3k-x" data-k="list">‹ Ларёк</button><div class="z3k-dp">'+Z.art(pic,{f:z.pg/KI.PIG.cap})+'</div><h3>'+esc(t)+'</h3>'+h+b+'</div>';
    bind(el);KI.ev({a:'tile',k:k});return true;}

  /* ---------- экран ---------- */
  function list(){view='';var el=$('z3kBody');if(!el)return;var L=tiles();
    el.innerHTML=(KI.payOn()?'':'<p class="z3k-n z3k-c">'+esc(T('closed','Касса на переучёте: Зина пересчитывает пуговицы. Ярмарка и оформление — работают.'))+'</p>')+
      '<div class="z3k-g">'+L.map(tile).join('')+'</div><p class="z3k-f">Пятёрки, уровни и места в лиге не продаются — только честным трудом.</p>';
    bind(el);}
  function bind(el){try{PAY.bind(el);}catch(e){}
    [].forEach.call(el.querySelectorAll('[data-k]'),function(b){b.onclick=function(e){e.stopPropagation();tap();act(b.getAttribute('data-k'));};});
    [].forEach.call(el.querySelectorAll('.pbuy'),function(b){var f=b.onclick;b.onclick=function(e){e.stopPropagation();KI.ev({a:'try',k:b.getAttribute('data-pid')});if(f)f.call(b,e);};});
    [].forEach.call(el.querySelectorAll('.z3k-t[data-d]'),function(t){t.onclick=function(){var k=t.getAttribute('data-d');if(k==='sub'||k==='pig'||k==='uz'){tap();detail(k);}};});}
  function act(k){if(k==='list')return list();
    if(k==='fair')return ZB.safe('z3k:fair',function(){ZB2FAIR.open();});
    if(k==='look')return ZB.safe('z3k:look',function(){THEME.open(function(){ZB.go('z3kiosk',{from:from});});});
    if(k==='shelf')return ZB.safe('z3k:shelf',function(){ZBSHOP.open('kiosk');});
    if(k==='sk')return ZB.go('z3kiosk-sk',{});
    if(k==='pass')return ZB.go('z3kiosk-pass',{});}
  function render(el,op){css();if(op&&op.from)from=op.from;var z=KI.K(),d=KI.tk();
    el.innerHTML='<div class="z3k"><div class="z3k-hd"><button type="button" class="btn ghost small z3k-back">‹ Двор</button><div class="z3k-tt"><b>Ларёк «Учительская»</b><small>у ворот, с девяти</small></div>'+
      '<div class="coins"><span class="coin"></span><span class="cc">'+(+S.coins||0)+'</span></div></div>'+
      '<div class="z3k-sc"><div class="z3k-hero">'+Z.art('kiosk-front')+'<div class="z3k-zina"><div class="av">'+(typeof zinaSVG==='function'?zinaSVG('happy'):'')+'</div><p>'+esc(T('hi',pick(HI)))+'</p></div></div>'+
      '<div id="z3kBody"></div></div></div>';
    el.querySelector('.z3k-back').onclick=function(){tap();if(view)return list();if(typeof openMenu==='function')openMenu();};
    list();KI.daily();
    if(z.v!==d){z.v=d;KI.sv();}
    KI.ev({a:'open',f:from,d:Math.min(Z.day(),99),s:KI.sub()?1:0,p:+z.pg||0,u:KI.uzShow()?1:0,y:KI.payOn()?1:0});
    try{STAT.screen('z3kiosk');}catch(e){}}
  ZB.screen('z3kiosk',{title:'Ларёк',render:function(el,op){ZB.safe('z3kiosk',function(){render(el,op||{});});}});
  // после покупки — перерисовать ларёк (payAfter в pay.js знает только окно и «Облики»)
  function wrapPay(){var f=window.payAfter;if(typeof f!=='function'||f.__z3k)return;var w=function(){var r=f.apply(this,arguments);
      ZB.safe('z3k:after',function(){var s=$('zb-z3kiosk');if(s&&s.classList.contains('on')){if(view)detail(view)||list();else list();var c=s.querySelector('.cc');if(c)c.textContent=+S.coins||0;}});return r;};w.__z3k=1;window.payAfter=w;}
  wrapPay();

  /* ---------- сканворд подписчика (рубрика sk газеты; раз в день +SK.c монет) ---------- */
  function skRender(el){css();var r=rubSk(),z=KI.K(),d=KI.tk(),ended=0;
    el.innerHTML='<div class="z3k"><div class="z3k-hd"><button type="button" class="btn ghost small z3k-back">‹ Ларёк</button><div class="z3k-tt"><b>Сканворд подписчика</b><small>деда Семёна, только для своих</small></div></div><div class="z3k-skb"></div><div class="z3k-ske"></div></div>';
    el.querySelector('.z3k-back').onclick=function(){tap();ZB.go('z3kiosk',{from:from});};
    var body=el.querySelector('.z3k-skb'),end=el.querySelector('.z3k-ske');
    if(!r||!KI.sub()){body.innerHTML='<p class="z3k-n">Сканворд — для подписчиков «Вечёрки».</p>';return;}
    function done(res){if(ended)return;ended=1;var ok=!!(res&&res.ok),c=0;
      if(ok&&z.sk!==d){z.sk=d;c=KI.SK.c;try{addCoins(c,'quest');SND.coin();}catch(e){}KI.sv();}
      KI.ev({a:'sk',ok:ok?1:0,c:c,m:res&&+res.m||0,t:res&&+res.s||0});
      end.innerHTML='<p>'+(ok?'Решено!'+(c?' +'+c+' '+coinI():''):'Не беда — завтра новый.')+'</p><button type="button" class="btn green z3k-b z3k-ok">В ларёк</button>';
      end.querySelector('.z3k-ok').onclick=function(){tap();ZB.go('z3kiosk',{from:from});};}
    Promise.resolve(r.lazy?r.lazy():0).then(function(){ZB.safe('z3k:sk',function(){r.play(body,{seed:500000+d%100000,from:'level',done:done});});},
      function(){body.innerHTML='<p class="z3k-n">Не загрузилось — попробуй ещё раз.</p>';});}
  ZB.screen('z3kiosk-sk',{title:'Сканворд подписчика',render:function(el){ZB.safe('z3kiosk-sk',function(){skRender(el);});}});

  /* ---------- сезонный пропуск «Сезон двора» (п.7): 20 ступеней на месяц, бесплатная дорожка всем, платная — с пропуском pass_s; награды забирают здесь ---------- */
  var MN=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
  function hbI(){return '💡';}
  // что дать из существующего: самый дешёвый наряд/блюдце за монеты, которого ещё нет; всё есть — монеты (половина его цены, не меньше 300)
  function cheap(t){var L=t==='o'?(typeof OUTFITS!=='undefined'?OUTFITS:[]):(typeof SKINS!=='undefined'?SKINS:[]),own=S.own||{},b=null;
    for(var i=0;i<L.length;i++){var x=L[i];if(x&&x.p>0&&!own[t+':'+x.id]&&(!b||x.p<b.p))b=x;}return b;}
  function rw(i,paid){if(!paid)return i%5===0?{hb:1}:{c:10};
    if(i===10){var o=cheap('o');return o?{o:o}:{c:400};}
    if(i===20){var k=cheap('s');return k?{s:k,hb:2}:{c:400,hb:2};}
    return i%5===0?{hb:2}:{c:60};}
  function rwTxt(r){var a=[];if(r.c)a.push('+'+r.c+' '+coinI());if(r.hb)a.push(hbI()+' +'+r.hb);if(r.o)a.push('наряд «'+esc(r.o.n)+'»');if(r.s)a.push('блюдце «'+esc(r.s.n)+'»');return a.join(' ');} // готовый HTML (монета COIN_I — разметка)
  function rwGive(r,paid){if(r.c){if(paid)try{addCoins(r.c,'buy');}catch(e){}else try{ZBECO.give('pass',r.c,'quest');}catch(e){try{addCoins(r.c,'quest');}catch(e2){}}}
    if(r.hb)try{var room=Math.max(0,HB_MAX-hbN()),k=Math.min(room,r.hb);if(k)hbAdd(k,'pass');if(r.hb>k)addCoins(35*(r.hb-k),paid?'buy':'quest');}catch(e){} // запас 💡 полон — 35 монет за каждую
    if(r.o||r.s){S.own=S.own||{};S.own[(r.o?'o:':'s:')+(r.o||r.s).id]=1;}}
  function take(){var p=KI.P(),st=KI.psSteps(),f=0,g=0;
    while(p.f<st){p.f++;rwGive(rw(p.f,0),0);f++;}
    if(KI.psPaid())while(p.g<st){p.g++;rwGive(rw(p.g,1),1);g++;}
    if(f||g){KI.sv();try{cloudSoon();}catch(e){}try{SND.coin();}catch(e){}KI.ev({a:'pass_take',f:f,g:g,s:st,b:KI.psPaid()?1:0});
      try{toast('Забрано наград: '+(f+g),2200);}catch(e){}}}
  function passRender(el){css();var p=KI.P(),st=KI.psSteps(),paid=KI.psPaid(),left=KI.mLeft(),rd=KI.psReady(),mo=MN[p.k%100-1]||'',into=p.p-st*KI.PS.step,h='';
    for(var i=1;i<=KI.PS.steps;i++){var fr=rw(i,0),pr=rw(i,1),done=st>=i;
      h+='<div class="z3p-r'+(done?' on':'')+'"><span class="z3p-n">'+i+'</span><span class="z3p-c'+(p.f>=i?' got':'')+'">'+(p.f>=i?'✓ ':'')+rwTxt(fr)+'</span>'+
        '<span class="z3p-c pd'+(p.g>=i?' got':'')+'">'+(p.g>=i?'✓ ':paid?'':'🔒 ')+rwTxt(pr)+'</span></div>';}
    var canBuy=!paid&&KI.has('pass_s');
    el.innerHTML='<div class="z3k"><div class="z3k-hd"><button type="button" class="btn ghost small z3k-back">‹ Ларёк</button><div class="z3k-tt"><b>Сезон двора · '+esc(mo)+'</b><small>ещё '+left+' '+pl(left,'день','дня','дней')+'</small></div></div>'+
      '<div class="z3k-sc"><div class="z3k-d">'+
      '<p class="z3k-say">'+esc(T('pass','Пропуск в сезон: ступеньки за уровни, награды — забирай, пока месяц не кончился.'))+'</p>'+
      (st<KI.PS.steps?'<div class="z3p-bar"><i style="width:'+Math.round(100*into/KI.PS.step)+'%"></i><span>ступень '+st+' из '+KI.PS.steps+' · до следующей '+(KI.PS.step-into)+' '+pl(KI.PS.step-into,'очко','очка','очков')+'</span></div>':'<p><b>Все ступени сезона пройдены!</b></p>')+
      '<p class="z3k-n">Уровень впервые +'+KI.PS.pts.first+', повтор и задание дня +'+KI.PS.pts.lvl+'. Новый месяц — новый сезон, ступени с нуля.</p>'+
      (rd?'<button type="button" class="btn green z3k-b" data-k="take">Забрать награды ('+rd+')</button>':'')+
      (canBuy?'<button type="button" class="btn gold z3k-b pbuy" data-pid="pass_s">🎫 Пропуск до конца месяца · '+price('pass_s')+'</button>'+(left<=KI.PS.late?'<p class="z3k-n">До конца месяца мало дней — пропуск будет и на следующий.</p>':''):'')+
      (paid?'<p class="z3k-n">🎫 Пропуск есть — правая дорожка твоя.</p>':'')+
      '<div class="z3p-hd"><span></span><span>Всем</span><span>С пропуском</span></div><div class="z3p-l">'+h+'</div></div></div></div>';
    el.querySelector('.z3k-back').onclick=function(){tap();ZB.go('z3kiosk',{from:from});};
    var tb=el.querySelector('[data-k="take"]');if(tb)tb.onclick=function(){tap();take();passRender(el);};
    try{PAY.bind(el);}catch(e){}
    [].forEach.call(el.querySelectorAll('.pbuy'),function(b){var f=b.onclick;b.onclick=function(e){KI.ev({a:'try',k:'pass_s'});if(f)f.call(b,e);};});
    KI.ev({a:'pass_open',s:st,b:paid?1:0,r:rd});try{STAT.screen('z3kiosk-pass');}catch(e){}}
  function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
  ZB.screen('z3kiosk-pass',{title:'Сезон двора',render:function(el){ZB.safe('z3kiosk-pass',function(){passRender(el);});}});
  ZB.on('z3pass',function(){var s=$('zb-z3kiosk-pass');if(s&&s.classList.contains('on'))ZB.safe('z3kiosk-pass',function(){passRender(s);});});

  /* ---------- стили (префикс z3k-, цвета — только --z3-*) ---------- */
  var c0=0;function css(){if(c0)return;c0=1;var s=document.createElement('style');s.id='z3kCss';s.textContent=
    '.z3k{display:flex;flex-direction:column;height:100%;background:var(--z3-bg);color:var(--z3-ink);font-family:var(--z3-font)}'+
    '.z3k-hd{display:flex;align-items:center;gap:8px;padding:8px 12px;flex:none}.z3k-hd .btn{min-height:44px}.z3k-tt{flex:1;min-width:0;display:flex;flex-direction:column}'+
    '.z3k-tt b{font-family:var(--z3-font-head);font-size:19px;line-height:1.15}.z3k-tt small{font-size:13.5px;color:var(--z3-ink2)}'+
    '.z3k-sc{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 12px 18px}.z3k-hero{position:relative;max-width:620px;margin:0 auto}.z3k-hero>svg{display:block;width:100%;height:auto}'+
    '.z3k-zina{display:flex;align-items:center;gap:8px;background:var(--z3-paper);border-radius:var(--z3-r);box-shadow:var(--z3-shadow);padding:8px 10px;margin:6px 0 12px}'+
    '.z3k-zina .av{width:52px;height:52px;flex:none}.z3k-zina .av svg{width:100%;height:100%}.z3k-zina p{margin:0;font-size:14.5px;line-height:1.3;font-family:var(--z3-font-hand)}'+
    '.z3k-g{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:820px;margin:0 auto}'+
    '.z3k-t{background:var(--z3-paper);border-radius:var(--z3-r);box-shadow:var(--z3-shadow);padding:10px 10px 12px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;min-width:0;cursor:pointer}'+
    '.z3k-t.hot{box-shadow:0 0 0 3px var(--z3-y-lamp,#ffd27a),var(--z3-shadow)}.z3k-p{width:72px;height:72px}.z3k-p svg{width:100%;height:100%}'+
    '.z3k-t b{font-size:16px;line-height:1.2}.z3k-t small{font-size:13.5px;color:var(--z3-ink2);line-height:1.25;flex:1}'+
    '.z3k-b{width:100%;font-size:15px;padding:10px 6px;margin-top:4px;border-radius:var(--z3-rb)}.z3k-b[disabled]{opacity:.6;filter:grayscale(.6)}'+
    '.z3k-n{font-size:14px;color:var(--z3-ink2);line-height:1.35}.z3k-c{text-align:center;margin:0 0 10px}.z3k-f{text-align:center;color:var(--z3-ink2);font-size:13.5px;margin:16px 6px 0}'+
    '.z3k-d{max-width:520px;margin:0 auto;background:var(--z3-paper);border-radius:var(--z3-r);box-shadow:var(--z3-shadow);padding:12px 14px 16px;display:flex;flex-direction:column;gap:6px}'+
    '.z3k-d h3{margin:0;font-family:var(--z3-font-head);font-size:19px}.z3k-d p{margin:0;font-size:14.5px;line-height:1.35}.z3k-x{align-self:flex-start;min-height:44px}'+
    '.z3k-dp{width:96px;height:96px;align-self:center}.z3k-dp svg{width:100%;height:100%}.z3k-ul{margin:0;padding:0 0 0 4px;list-style:none;font-size:14.5px;line-height:1.5}'+
    '.z3k-say{font-family:var(--z3-font-hand);background:var(--z3-bg);border-radius:var(--z3-rb);padding:8px 10px}'+
    '.z3k-skb{flex:1;min-height:0;position:relative;overflow:auto}.z3k-ske{flex:none;text-align:center;padding:0 12px 12px}.z3k-ske:empty{display:none}.z3k-ske p{margin:6px 0;font-size:16px;font-weight:700}'+
    '.z3p-bar{position:relative;height:26px;border-radius:13px;background:var(--z3-bg);overflow:hidden}.z3p-bar i{position:absolute;left:0;top:0;bottom:0;background:var(--z3-y-lamp,#ffd27a)}'+
    '.z3p-bar span{position:relative;display:block;text-align:center;line-height:26px;font-size:13.5px}'+
    '.z3p-hd,.z3p-r{display:grid;grid-template-columns:32px 1fr 1fr;gap:6px;align-items:center}.z3p-hd{font-size:13.5px;color:var(--z3-ink2);margin-top:6px}'+
    '.z3p-r{padding:6px 0;border-top:1px solid var(--z3-bg);font-size:13.5px;line-height:1.25}.z3p-r.on .z3p-n{background:var(--z3-y-lamp,#ffd27a)}'+
    '.z3p-n{width:28px;height:28px;border-radius:14px;background:var(--z3-bg);display:flex;align-items:center;justify-content:center;font-weight:700}'+
    '.z3p-c{min-width:0;overflow-wrap:anywhere}.z3p-c .coin{width:15px;height:15px;vertical-align:-2px}.z3p-c.got{color:var(--z3-ink2)}.z3p-c.pd{font-weight:600}'+
    '@media (min-width:860px){.z3k-g{grid-template-columns:repeat(3,1fr)}}@media (max-width:340px){.z3k-g{gap:8px}.z3k-t{padding:8px 6px 10px}}';
    document.head.appendChild(s);}
  ZB.load('js/zb3-art-kiosk.js').then(function(){var s=$('zb-z3kiosk');if(s&&s.classList.contains('on')&&!view)ZB.safe('z3k:art',function(){render(s,{});});},function(){});
})();
