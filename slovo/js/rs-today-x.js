'use strict';
(function(){
if(!window.RSD)return;var D=document,sf=RSD.sf,esc=RSD.esc,tap=RSD.tap,EV=RSD.EV,home=RSD.home,wkEv=RSD.wkEv,evGo=RSE.go;
function $(id){return D.getElementById(id);}
function sv(){try{save();}catch(e){}}
function lv(){return+S.lv||0;}
function yard(id){var L=Z3.yard||[];for(var i=0;i<L.length;i++)if(L[i].id===id&&L[i].go){sf('yg',function(){L[i].go();});return true;}return false;}
function sect(id,scr){var R=window.RS;if(R&&R.sect&&R.sect.open&&sf('so',function(){return R.sect.open(id);})!==false)return;
if(scr&&ZB._scr[scr]){ZB.go(scr);return;}if(RSD.Y3[id]&&yard(id))return;home();}
var GO={today:function(){if(window.RST)RST.open();},school:function(){sect('school','school');},paper:function(){sect('paper','z3paper');},
mail:function(){sect('mail','z3mail');},mail2:function(){sect('mail','z3mail');},album:function(){sect('album','z3album');},kiosk:function(){sect('kiosk','z3kiosk');},
traty:function(){sect('kiosk','z3kiosk');},bench:function(){sect('bench');},build:function(){sect('build');},event:function(){var e=wkEv();if(e)evGo(e);},
news:function(){sect('paper','z3paper');},sto:function(){sect('paper','z3paper');}};
['games','interes','surprise','kuhnya','show','zabeg','igry','stol','kot'].forEach(function(k){GO[k]=function(){sect(k==='games'?'games':k,'mg');};});
function play(){try{startLevel(Math.min(lv(),LEVELS.length-1));}catch(e){home();}}
(function(){if($('rsxCss'))return;var s=D.createElement('style');s.id='rsxCss';s.textContent=
'.rsn{text-align:center}.rsn-z{width:96px;height:96px;margin:0 auto 4px}.rsn-z svg{width:100%;height:100%}.rsn small{font-size:15px;color:#8a6a3a;font-weight:700}'+
'.rsn h2{margin:2px 0 8px}.rsn p{font-size:18px;line-height:1.4;margin:0 0 14px}'+
'.rs-back{min-height:48px;padding:0 16px;border:0;border-radius:14px;background:#fff;color:#27324a;font:inherit;font-size:17px;font-weight:700;box-shadow:0 2px 8px rgba(39,50,74,.18);cursor:pointer}'+
'.rsx{padding:12px 16px 90px;max-width:640px;margin:0 auto}.rsx-h{margin:14px 0 6px;font-size:24px}.rsx-p{font-size:17px;line-height:1.4;color:#27324a}.rsx-c{margin:10px 0}.rsx-go{width:100%;min-height:56px;margin-top:12px}';D.head.appendChild(s);})();
var TX={home:['Мы навели порядок','Всё на месте, только удобнее. Игры — внизу. Газета и почта — во Дворе. Настройки — сверху слева.'],
today:['«Сегодня у Зины»','На Доме теперь «Сегодня у Зины»: листок календаря и три дела на день. Сделаете все — пятёрка в дневник!'],
school:['Школа','Открылась Школа — кнопка внизу. Там классы, Путь по главам и Словарь со всеми найденными словами.'],
paper:['Газета «Вечёрка»','Во Дворе теперь газета «Вечёрка». Каждый день — новый номер и головоломка дня.'],
mail:['Почта','Во Дворе открылась Почта. Я буду писать вам письма, а вы мне — кнопка «Написать Зине».'],
games:['Игры','Открылись Игры — кнопка внизу. Для начала три: «Зина загадала», «Найди Ять» и «Слово из слова».'],
album:['Комод','Во Дворе — Комод. Там всё, что вы собрали: открытки, альбом шуток, медали.'],
kiosk:['Ларёк','Во Дворе открылся Ларёк: наряды для меня, вещи для дома и подсказки.'],
bench:['Подъезд','Во Дворе открылся Подъезд — «Соседки недели». Посмотрим, кто в нашем доме больше слов нашёл!'],
build:['Стройка','Во Дворе — Стройка «Двор растёт». Звёзды за уровни идут в постройку.'],
event:['Событие недели','На Доме — плашка «Событие». Каждую неделю — новое. Первое — «Одна на всех».'],
news:['Новости двора','В газете теперь «Новости двора»: что творится у соседей, сериал про деда Семёна и мои чудачества.'],
interes:['Уровень на интерес','В Играх — «Уровень на интерес»: со счётом и пари. Только по желанию — обычные уровни остаются спокойными.'],
surprise:['Уровень с сюрпризом','В Играх — «Уровень с сюрпризом»: особые клетки, кот Ять и происшествия.'],
kuhnya:['Кухня и дача','В Играх — «Кухня и дача»: рецепты, банки с буквами и авоська.'],
show:['Телешоу у Зины','В Играх — «Телешоу у Зины»: Лото, Барабан, своя игра и песня.'],
zabeg:['Забеги и новые уровни','В Играх — «Забеги по пройденным» и «Новые виды уровней»: две тетради, мешок букв, половинки.'],
igry:['Новые виды уровней','В Играх — «Новые виды уровней»: две тетради, мешок букв, половинки.'],
stol:['За одним столом','В Играх — «За одним столом»: банка, скрэббл с Галей и игры с внуком.'],
traty:['Квартира Зины','В Ларьке — «Квартира Зины»: обновим мне квартиру и купим Ятю вещи.'],
sto:['Сто к одному','В газете — «Сто к одному: Великий спор». Угадайте, что ответили соседи.'],
kot:['Ять главный','«Ять главный»: кот бегает по уровням, ведёт тетрадку и ездит в санаторий.'],
mail2:['Новое на Почте','На Почте: сочинения из ваших слов, «письмо из прошлого» и чат дома.']};
function face(){try{return zinaSVG('happy');}catch(e){return'👵';}}
function newWin(id){var x=TX[id];if(!x)return false;try{STAT.ev('rsd',{a:'new',id:id,d:Math.min(RSD.day(),99),k:RSD.kind()});}catch(e){}
modal('<div class="rsn"><div class="rsn-z">'+face()+'</div><small>Новое у Зины</small><h2>'+esc(x[0])+'</h2><p>'+esc(x[1])+'</p><div class="btns">'+
(GO[id]?'<button type="button" class="btn green" id="rsnGo">Посмотреть</button><button type="button" class="btn ghost small" id="rsnNo">Потом</button>':
'<button type="button" class="btn green" id="rsnNo">Хорошо</button>')+'</div></div>');
var g=$('rsnGo');if(g)g.onclick=function(){tap();hideModal();sf('go:'+id,GO[id]);};$('rsnNo').onclick=function(){tap();hideModal();};return true;}
function cards(ids){var L=window.Z4&&Z4.card&&Z4.card.L||[],R=[];(ids||[]).forEach(function(id){L.forEach(function(c){if(c.id===id&&sf('c:'+id,function(){return c.show();}))R.push(c);});});return R;}
ZB.screen('rs-event',{title:'Событие недели',render:function(el,op){var e=EV.filter(function(x){return x.id===op.e;})[0]||wkEv()||EV[0],L=cards(e.c);
el.innerHTML='<div class="rsx"><button type="button" class="rs-back" id="rsxB">← Назад</button><h2 class="rsx-h">'+e.ic+' '+esc(e.t)+'</h2>'+
'<p class="rsx-p">Событие этой недели: '+esc(e.sub)+'. В воскресенье — итоги, с понедельника — новое.</p><div id="rsxC">'+
L.map(function(c,i){return'<div class="rsx-c" data-i="'+i+'">'+(sf('ch:'+c.id,function(){return c.html();})||'')+'</div>';}).join('')+'</div>'+
(e.scr&&ZB._scr[e.scr]?'<button type="button" class="btn green rsx-go" id="rsxS">Открыть</button>':'')+
(!L.length&&!(e.scr&&ZB._scr[e.scr])?'<p class="rsx-p">Сегодня тут тихо — загляните завтра. А пока — уровень!</p><button type="button" class="btn green rsx-go" id="rsxP">▶ Играть</button>':'')+'</div>';
[].forEach.call(el.querySelectorAll('.rsx-c'),function(b){var c=L[+b.dataset.i];if(c&&c.mount)sf('cm:'+c.id,function(){c.mount(b);});});
$('rsxB').onclick=function(){tap();home();};
var s=$('rsxS');if(s)s.onclick=function(){tap();ZB.go(e.scr);};var p=$('rsxP');if(p)p.onclick=function(){tap();play();};}});
var R=window.RST&&RST._;
if(R){var T=R.T,ids=R.ids,POOL=R.POOL,ALT=R.ALT,ready=R.ready,take=R.take,pfTxt=R.pfTxt,wd=R.wd,z4card=R.z4card,replace=R.replace,check=R.check,pl=R.pl,list=RST.list;
(function(){if($('rstxCss'))return;var s=D.createElement('style');s.id='rstxCss';s.textContent=
'.rst{padding:12px 16px 90px;max-width:640px;margin:0 auto;color:#27324a}.rst-hd{display:flex;align-items:baseline;justify-content:space-between;margin-top:12px}.rst-hd h2{margin:0;font-size:24px}'+
'.rst-n{font-size:20px;font-weight:800;color:#2563c9}.rst-dt{margin:2px 0 10px;font-size:16px;color:#5a6276}'+
'.rst-r{display:flex;align-items:center;gap:10px;min-height:64px;margin:8px 0;padding:8px 12px;border-radius:14px;background:#fbf7ec;box-shadow:0 2px 0 #e4d9c2}'+
'.rst-r.ok{opacity:.75}.rst-i{font-size:26px}.rst-b{flex:1;min-width:0;display:flex;flex-direction:column}.rst-b b{font-size:18px;line-height:1.25}.rst-b small{font-size:15px;color:#5a6276;line-height:1.3}'+
'.rst-go{min-height:48px;min-width:96px;margin:0;padding:0 14px;font-size:17px}.rst-v{font-size:26px;color:#237a3b;font-weight:900;min-width:48px;text-align:center}'+
'.rst-c4{margin:-2px 0 8px}.rst-sw{display:block;width:100%;min-height:48px;margin:6px 0;border:2px dashed #d8ccb2;border-radius:14px;background:none;color:#27324a;font:inherit;font-size:17px;cursor:pointer}'+
'.rst-f{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:12px 0;padding:12px;border-radius:14px;background:#fff;box-shadow:0 2px 8px rgba(39,50,74,.1);font-size:16px}'+
'.rst-5{font:italic 900 34px/1 Georgia,serif;color:#c62828;transform:rotate(-8deg)}.rst-5.off{color:#d8ccb2}.rst-take{width:100%;min-height:56px;margin:0}'+
'.rst-g{display:block;width:100%;min-height:48px;border:0;background:none;color:#2563c9;font:inherit;font-size:16px;text-align:left;cursor:pointer}.rst-m{font-size:15px;color:#5a6276}';D.head.appendChild(s);})();
function tk(){try{return todayKey();}catch(e){return 0;}}
function coin(){return'монет';}
var DN=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],MN=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function goal(){var G=window.ZB2GOAL,g=G&&G.goal?sf('goal',G.goal):null,c=+S.coins||0;return g&&g.p>c?{t:'Копите на: '+g.n+' — ещё '+(g.p-c)+' '+coin(),go:function(){G.open();}}:null;}
function render(el){sf('chk',check);var L=list(),n=L.filter(function(x){return x.ok;}).length,t=T(),k=tk(),c4=null,g=goal();RSD.css();
if(ids().indexOf('z4')>=0)c4=z4card();
var canSwap=!t.r&&ids().slice(1).some(function(id){return!sf('d:'+id,POOL[id].done);})&&ALT.some(function(id){return ids().indexOf(id)<0&&sf('av:'+id,POOL[id].av);});
el.innerHTML='<div class="rst"><button type="button" class="rs-back" id="rstB">← Назад</button>'+
'<div class="rst-hd"><h2>Сегодня у Зины</h2><span class="rst-n">'+n+' из '+L.length+'</span></div><p class="rst-dt">'+(k%100)+' '+MN[Math.floor(k/100)%100-1]+', '+DN[wd()]+'</p>'+
L.map(function(x,i){return'<div class="rst-r'+(x.ok?' ok':'')+'"><span class="rst-i">'+x.ic+'</span><span class="rst-b"><b>'+esc(x.t)+'</b><small>'+esc(x.h)+'</small></span>'+
(x.ok?'<span class="rst-v">✓</span>':'<button type="button" class="btn green rst-go" data-i="'+i+'">'+x.b+'</button>')+'</div>'+
(x.id==='z4'&&c4?'<div class="rst-c4" id="rstC4">'+(sf('c4h',function(){return c4.html();})||'')+'</div>':'');}).join('')+
(canSwap?'<button type="button" class="rst-sw" id="rstSw">🔁 Заменить дело</button>':'')+
(ready()?'<div class="rst-f"><span class="rst-5">5</span><span><b>Все дела сделаны — пятёрка в дневник!</b></span><button type="button" class="btn green rst-take" id="rstTake">Забрать: '+pfTxt()+'</button></div>':
t.f?'<div class="rst-f got"><span class="rst-5">5</span><span>Пятёрка за сегодня — в дневнике. Завтра — новые дела.</span></div>':
'<div class="rst-f"><span class="rst-5 off">5</span><span>Сделайте все дела — пятёрка в дневник и '+pfTxt()+'</span></div>')+
(g?'<button type="button" class="rst-g" id="rstG">'+esc(g.t)+' ›</button>':'')+
'<p class="rst-m">Пропустили день — ничего не сгорает.</p></div>';
[].forEach.call(el.querySelectorAll('.rst-go'),function(b){var x=L[+b.dataset.i];b.onclick=function(){tap();sf('go:'+x.id,x.go);};});
var c=$('rstC4');if(c&&c4){if(c4.mount)sf('c4m',function(){c4.mount(c);});c.addEventListener('click',function(){T().m.z4=1;sv();setTimeout(function(){sf('chk',check);},0);},true);}
$('rstB').onclick=function(){tap();home();};
var s=$('rstSw');if(s)s.onclick=function(){tap();replace();render(el);};
var tb=$('rstTake');if(tb)tb.onclick=function(){take(tb);render(el);try{if(typeof updCoins==='function')updCoins();}catch(e){}};
var gb=$('rstG');if(gb&&g)gb.onclick=function(){tap();sf('goal-go',g.go);};}
ZB.screen('rs-today',{title:'Сегодня у Зины',render:render});}
window.RSX={go:GO,newWin:newWin,today:function(el){if(R)render(el);}};
})();
