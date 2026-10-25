'use strict';
/* ================= gb-book — «Книга жалоб и предложений»: записи-цели → «Благодарности», страницы за благодарности, форма отзыва (поток META) =================
   Записи — данные (60): тексты от TEXT (window.GBT_BOOK или GBT.data('book') — [{id, t, w, th, g}]), до них — свои 20 ниже.
   g — цель, которая закрывает запись: {dep:'hleb', lv:3} | {rank:r} | {ord:N} (заказов соседей всего) | {seal:N} (печатей) | {card:N} (карточек в альбоме)
     | {glass:1} (сдана стеклотара) | {thx:N} (благодарностей от мини-игр). Закрытая запись = благодарность (GBM.thanks('book')).
   10 благодарностей = страница → вещь «за благодарности» в зал (id bk_* — рисует VIEW/ART, список BOOK_ITEMS) + открытка.
   Мини-игры пишут благодарности: GBM.thanks('mg') (≤2 в день) — в Книге видны строкой «Спасибо за …».
   Форма «Написать в Книгу жалоб и предложений» — кнопка окна письма js/gb-mail.js (GBMAIL, f:'book'); нет модуля — строки нет.
   Выключатели: GB.flag('book'), GB.flag('fb') (форма).
   Поля: S.mtBc — строка '0/1' по номерам записей (закрыта), S.mtBp — страниц получено, S.mtO — заказов соседей выполнено, S.mtBg — сдавал ли стеклотару. */
(function(){
if(typeof GB==='undefined'||!window.GBM)return;
var ON=GB.flag('book')&&GBM.on;
var M=GBM,num=M.num,isO=M.isO,R=M.R,esc=M.esc,pl=M.pl,stat=M.stat;
function S_(){return typeof S!=='undefined'?S:null;}
function sv(){try{save();}catch(e){}}
function tap(){try{SND.tap();}catch(e){}}
// свои 20 записей (до текстов TEXT): закрываются ремонтом отделов, разрядом, заказами, печатями, альбомом
var OWN=[
 {t:'Хлеб к обеду кончается! Безобразие!',w:'Пенсионерка Н., дом 5',th:'Хлеб теперь до вечера! Спасибо, Валечка.',g:{dep:'hleb',lv:1}},
 {t:'Крупа есть, а сахара нет. Или наоборот. Каждый раз!',w:'Нюра из дома напротив',th:'Крупа есть, сахар есть — живём!',g:{dep:'bakaleya',lv:1}},
 {t:'Бутылки не принимают! «Тары нет» — а у меня её полный балкон.',w:'Студент Лёша, общежитие на Садовой',th:'Бутылки наконец принимают. Стипендия спасена!',g:{dep:'steklo',lv:1}},
 {t:'У входа вечно лужа. Ноги промочил.',w:'Михалыч, дворник',th:'Лужу засыпали. Сам засыпал, но всё равно спасибо.',g:{rank:1}},
 {t:'Молоко бывает только в среду. А пью я каждый день!',w:'Школьник Вова, 4 «Б»',th:'Молоко каждый день! Мама довольна, я — нет: теперь пью каждый день.',g:{dep:'moloko',lv:1}},
 {t:'Колбасу «Докторскую» видел последний раз на Новый год.',w:'Рабочий Гена',th:'Колбаса есть! Взял два батона — один на работу.',g:{dep:'gastro',lv:1}},
 {t:'Почему нет газировки?! Жарко же!',w:'Школьник Вова, 4 «Б»',th:'Газировка с сиропом! За три копейки! Беру два.',g:{dep:'soki',lv:1}},
 {t:'Торт к юбилею заказывал за месяц — дали бисквитный вместо шоколадного.',w:'Интеллигент Аркадий Львович',th:'Шоколадный торт к юбилею — как в лучших домах!',g:{dep:'konditer',lv:1}},
 {t:'Картошка с землёй пополам. Землю я и на даче накопаю.',w:'Дачница Тамара',th:'Картошка чистая, крупная. Землю оставлю для дачи.',g:{dep:'ovoshi',lv:1}},
 {t:'Рыбный день — а рыбы нет. Это уже не рыбный день, а просто четверг.',w:'Милиционер Петров',th:'Рыбный четверг состоялся! Протокол не составляю.',g:{dep:'ryba',lv:1}},
 {t:'Заказ к празднику выдают «в порядке очереди». Очередь — с прошлого года.',w:'Пенсионерка Н., дом 5',th:'Заказ выдали вовремя. И даже банку горошка положили.',g:{dep:'zakaz',lv:1}},
 {t:'Продавщица одна, а очередь до угла!',w:'Интеллигент Аркадий Львович',th:'Обслуживают быстро и вежливо. Записываю в мемуары.',g:{ord:3}},
 {t:'Обещали заказ к выходным — внукам. Внуки ждут!',w:'Нюра из дома напротив',th:'Внуки сыты и довольны. Валечке — низкий поклон!',g:{ord:10}},
 {t:'Магазин «захудалый» — того и гляди на вывеске напишут.',w:'Ревизор Торга',th:'Магазину присвоен разряд. Замечаний не имею. Почти.',g:{rank:2}},
 {t:'План не выполняется! Где отчётность?',w:'Ревизор Торга',th:'Отчётность в порядке: печати стоят, план выполнен.',g:{seal:7}},
 {t:'Икру видел только на картинке в журнале «Работница».',w:'Рабочий Гена',th:'Дефицит выбросили — успел! Жена не поверила.',g:{card:3}},
 {t:'Бакалея — пять полок на весь район. Мало!',w:'Нюра из дома напротив',th:'Полки до потолка! Мука, крупа, сахар — всё есть.',g:{dep:'bakaleya',lv:2}},
 {t:'Хлеб утром тёплый, а к обеду — каменный.',w:'Пенсионерка Н., дом 5',th:'Утренний завоз — с пылу с жару!',g:{dep:'hleb',lv:3}},
 {t:'Гастроном — а гастрономия как в сельпо.',w:'Интеллигент Аркадий Львович',th:'Сервелат, сыр «Российский» — как в столичном гастрономе!',g:{rank:4}},
 {t:'Говорят, где-то есть «Образцовый магазин». Покажите!',w:'Михалыч, дворник',th:'Покажу: вот он. Сам мету у входа — гордость берёт.',g:{rank:6}}];
// вещи за страницы благодарностей (рисует VIEW/ART по id; пока нет рисунка — видна в Книге)
var BOOK_ITEMS=[{id:'bk_vase',n:'Ваза с гвоздиками',ic:'💐'},{id:'bk_frame',n:'Почётная грамота в рамке',ic:'🖼'},{id:'bk_mirror',n:'Зеркало в раме',ic:'🪞'},
  {id:'bk_flag',n:'Вымпел «Ударник торговли»',ic:'🚩'},{id:'bk_pal',n:'Пальма в кадке',ic:'🌴'},{id:'bk_bust',n:'Бюст писателя на шкафу',ic:'🗿'},
  {id:'bk_clock',n:'Часы с кукушкой',ic:'🕰'},{id:'bk_carpet',n:'Ковёр на стену',ic:'🟥'},{id:'bk_tv',n:'Телевизор с антенной-рогами в подсобке',ic:'📺'},{id:'bk_aq',n:'Аквариум с гуппи',ic:'🐠'}];
function entries(){var t=null;try{if(Array.isArray(window.GBT_BOOK))t=GBT_BOOK;else if(window.GBT&&typeof GBT.data==='function'){var x=GBT.data('book');if(Array.isArray(x))t=x;}}catch(e){}
  return (t&&t.length?t:OWN).slice(0,60);}

/* ---------- сохранение ---------- */
function fix(s){s=s||S_();if(!s)return;if(typeof s.mtBc!=='string'||!/^[01]*$/.test(s.mtBc))s.mtBc='';s.mtBc=s.mtBc.slice(0,60);s.mtBp=Math.floor(num(s.mtBp));s.mtO=Math.floor(num(s.mtO));s.mtBg=s.mtBg?1:0;}
function merge(s,d){fix(s);if(!d)return;var b=typeof d.mtBc==='string'?d.mtBc:'',a=s.mtBc,o='';for(var i=0;i<Math.max(a.length,b.length)&&i<60;i++)o+=(a.charAt(i)==='1'||b.charAt(i)==='1')?'1':'0';
  s.mtBc=o.replace(/0+$/,'');s.mtBp=Math.max(s.mtBp,Math.floor(num(d.mtBp)));s.mtO=Math.max(s.mtO,Math.floor(num(d.mtO)));if(d.mtBg)s.mtBg=1;}
GB.onSave({id:'book',keys:['mtBc','mtBp','mtO','mtBg'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});
function closed(i){var s=S_();return s.mtBc.charAt(i)==='1';}
function setClosed(i){var s=S_(),a=s.mtBc;while(a.length<=i)a+='0';s.mtBc=a.slice(0,i)+'1'+a.slice(i+1);}

/* ---------- цели ---------- */
function goalOk(g){if(!g)return false;var s=S_();
  if(g.dep)return M.dep(g.dep)>=(g.lv||1);if(g.rank!=null)return M.rank()>=g.rank;if(g.ord)return num(s.mtO)>=g.ord;if(g.seal)return M.seals()>=g.seal;
  if(g.card)return (s.album||[]).length>=g.card;if(g.glass)return !!s.mtBg;if(g.thx)return M.thanksN()>=g.thx;
  if(g.star)return M.star()>=1||!!GB.safe('bk-flag',function(){return window.GBLG&&typeof GBLG.flag==='function'&&GBLG.flag();});return false;}
function goalTxt(g){if(!g)return '';if(g.dep){var d=M.depList().filter(function(x){return x.id===g.dep;})[0];return d?R('закроется')+': '+d.ic+' '+d.n+' '+'★★★'.slice(0,g.lv||1):'';}
  if(g.rank!=null)return R('закроется')+': '+R('разряд')+' «'+M.info(g.rank).short+'»';if(g.ord)return R('закроется')+': '+g.ord+' '+pl(g.ord,'заказ','заказа','заказов')+' '+R('соседей');
  if(g.seal)return R('закроется')+': '+g.seal+' '+pl(g.seal,'печать','печати','печатей')+' «План выполнен»';if(g.card)return R('закроется')+': '+g.card+' '+pl(g.card,'карточка','карточки','карточек')+' «Дефицита»';
  if(g.glass)return R('закроется')+': '+R('сдать стеклотару');if(g.star)return R('закроется')+': '+R('знамя в зале');if(g.thx)return R('закроется')+': '+g.thx+' '+R('благодарностей');return '';}
var news=[];
// новичок: первая благодарность — не раньше победы на 5-м уровне (на 3-м и так фикус и План — NEWBIE)
var FROM=5;function lvOk(){if(M.levels()>=FROM)return true;try{return !!(G&&G.won&&!G.daily&&!G.mode&&G.idx>=FROM-1);}catch(e){return false;}}
function check(silent){if(!ON||!lvOk())return 0;var n0=news.length;var s=S_();fix(s);var L=entries(),n=0;
  L.forEach(function(e,i){if(!closed(i)&&goalOk(e.g)){setClosed(i);n++;news.push({k:'thx',i:i});M.thanks('book');stat('book',{a:'close',i:i,n:closedN()});}});
  pages();if(silent)news.splice(n0);if(n)sv();return n;}
function closedN(){var s=S_(),n=0;for(var i=0;i<s.mtBc.length;i++)if(s.mtBc.charAt(i)==='1')n++;return n;}
function pages(){var s=S_(),p=Math.floor(M.thanksN()/10);if(p>s.mtBp){for(var k=s.mtBp;k<p&&k<BOOK_ITEMS.length;k++){news.push({k:'page',it:BOOK_ITEMS[k]});stat('book',{a:'page',p:k+1,it:BOOK_ITEMS[k].id});}
  s.mtBp=Math.min(p,BOOK_ITEMS.length);sv();GB.emit('bookItem',s.mtBp);}}
function items(){var s=S_();return BOOK_ITEMS.slice(0,num(s.mtBp));}
GB.on('rank',function(){check();});GB.on('dep',function(){check();});GB.on('seal',function(){check();});GB.on('thanks',function(x){if(x&&x.src!=='book')pages();});
GB.on('plan',function(x){if(x&&x.id==='order'){var s=S_();s.mtO=num(s.mtO)+1;sv();check();}});
GB.on('glass',function(){var s=S_();if(!s.mtBg){s.mtBg=1;sv();check();}});
GB.levelHook.push(function(o){if(o&&o.r==='win')check();});
GB.on('ready',function(){check(1);}); // при загрузке (старый игрок, другое устройство) — молча

/* ---------- «Касса»: свежая благодарность / страница ---------- */
GB.add(GB.winSlots,{id:'mt-book',order:40,zone:'extra',fit:3,render:function(){if(!ON)return '';if(news.length&&window.GBPL&&GBPL.nbTurn&&!GBPL.nbTurn('thanks'))return ''; // дирижёр новичка: подождёт следующей победы
  var nn=news.splice(0),L=entries(),h='';
  var tx=nn.filter(function(x){return x.k==='thx';});if(tx.length>2){nn=nn.filter(function(x){return x.k!=='thx';});
    if(R('Благодарностей в Книгу'))h+='<p class="mt-wl">📕 '+esc(R('Благодарностей в Книгу'))+': +'+tx.length+'</p>';}
  nn.forEach(function(x){if(x.k==='thx'&&L[x.i]&&R('Благодарность'))h+='<p class="mt-wl">📕 '+esc(R('Благодарность'))+': «'+esc(R(L[x.i].th))+'»</p>';
    else if(x.k==='page'&&R('Страница благодарностей'))h+='<p class="mt-wl">'+x.it.ic+' '+esc(R('Страница благодарностей — в зал'))+': «'+esc(R(x.it.n))+'»</p>';});return h;}});

/* ---------- экран Книги ---------- */
var tab='open';
function render(el){var L=entries(),s=S_();check();var open=[],done=[];L.forEach(function(e,i){(closed(i)?done:open).push({e:e,i:i});});
  var mg=Math.max(0,M.thanksN()-closedN()),its=items(),nx=10-(M.thanksN()%10);
  var rows=tab==='open'?open.slice(0,12).map(function(x){return '<div class="mt-cm"><p>«'+esc(R(x.e.t))+'»</p><small>— '+esc(R(x.e.w))+'</small><em>'+esc(goalTxt(x.e.g))+'</em></div>';}).join('')||'<p class="mt-mut">'+esc(R('Жалоб нет! Невиданное дело.'))+'</p>'
    :done.slice().reverse().map(function(x){return '<div class="mt-cm thx"><p>«'+esc(R(x.e.th))+'»</p><small>— '+esc(R(x.e.w))+'</small></div>';}).join('')+
      mgRows(mg)||'<p class="mt-mut">'+esc(R('Благодарностей пока нет — закрывайте жалобы ремонтом отделов, заказами и разрядом.'))+'</p>';
  el.innerHTML='<div class="mt-scr"><div class="mt-book"><div class="mt-dh"><span><small>'+esc(R('КНИГА ЖАЛОБ И ПРЕДЛОЖЕНИЙ'))+'</small><b>'+esc(M.info().name)+'</b></span>'+
    '<span class="mt-date">📕 '+M.thanksN()+'</span></div>'+
    '<div class="mt-tabs"><button type="button" class="'+(tab==='open'?'on':'')+'" data-t="open">'+esc(R('Жалобы'))+' · '+open.length+'</button><button type="button" class="'+(tab==='done'?'on':'')+'" data-t="done">'+esc(R('Благодарности'))+' · '+M.thanksN()+'</button></div>'+
    rows+'<div class="mt-seal"><span>📄 '+esc(R('Каждые 10 благодарностей — страница и подарок в зал. До следующей:'))+' <b>'+nx+'</b>'+
    (its.length?'<br>'+its.map(function(x){return x.ic+' '+esc(R(x.n));}).join(' · '):'')+'</span></div>'+fbHtml()+'</div>'+
    '<div class="row"><button type="button" class="btn" id="mtBkBack">'+esc(R('← В магазин'))+'</button></div></div>';
  var tb=el.querySelectorAll('[data-t]');for(var i=0;i<tb.length;i++)tb[i].onclick=function(){tap();tab=this.getAttribute('data-t');render(el);};
  fbBind(el);el.querySelector('#mtBkBack').onclick=function(){tap();home();};}
function mgRows(n){if(!n)return '';var T=Array.isArray(window.GBT_BOOK_MG)&&GBT_BOOK_MG.length?GBT_BOOK_MG:['Спасибо за перерыв! Работать стало веселее.'],
  W=Array.isArray(window.GBT_BOOK_MGWHO)&&GBT_BOOK_MGWHO.length?GBT_BOOK_MGWHO:['Покупатель из очереди'],h='';
  for(var i=Math.min(n,8)-1;i>=0;i--)h+='<div class="mt-cm thx"><p>«'+esc(R(T[i%T.length]))+'»</p><small>— '+esc(R(W[i%W.length]))+'</small></div>';
  return h+(n>8?'<p class="mt-mut">'+esc(R('…и ещё благодарностей за перерывы:'))+' '+(n-8)+'</p>':'');}
function home(){try{if(GB.homeGo)return GB.homeGo();}catch(e){}try{openMap();}catch(e){}}
GB.screen('book',{render:render});
function open(){GB.go('book');try{STAT.screen('book');}catch(e){}}
GB.add(GB.navSlots,{id:'book',order:50,ic:'📕',get t(){return R('Книга');},on:function(){return ON&&!!R('Книга');},go:open,dot:function(){return news.length>0;}});

/* ---------- «Написать тёте Вале» (LTG-GB 24.10): окно письма — js/gb-mail.js (GBMAIL), события mail f:'book' + куски fb.
   Раньше форма ждала STAT.fb, а такой функции нет (fb — в STATGB.fb) → строки не видел никто; теперь — через GBMAIL. ---------- */
function T(ru,en){try{return L(ru,en);}catch(e){return ru;}}
function fbOn(){try{return ON&&GB.flag('fb')&&!!window.GBMAIL&&GBMAIL.on;}catch(e){return false;}}
function fbHtml(){if(!fbOn())return '';GB.safe('mail:book',function(){GBMAIL.showBook();});
  return '<div class="mt-fb"><b>✍️ '+esc(T('Написать в Книгу жалоб и предложений','Write in the Complaints and Suggestions Book'))+'</b><small>'+
    esc(T('Ваша жалоба или предложение тёте Вале — она прочитает всё.','Your complaint or suggestion to Aunt Valya — she reads them all.'))+'</small>'+
    '<button type="button" class="btn small" id="mtFbGo">'+esc(T('✉️ Написать тёте Вале','✉️ Write to Aunt Valya'))+'</button></div>';}
function fbBind(el){var b=el.querySelector('#mtFbGo');if(!b)return;b.onclick=function(){tap();GB.safe('mail:open',function(){GBMAIL.open('book');});};}

window.GBBOOK={on:ON,open:open,check:check,entries:entries,items:items,ITEMS:BOOK_ITEMS,closedN:closedN,fix:function(){fix();}};
})();
