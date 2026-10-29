'use strict';
(function(){
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function env(t,b){return'<div class="zc-env"><b>'+t+'</b>'+esc(b)+'</div>';}
function mgPick(){try{if(!window.ZMG||!S.zmg)return'';var z=S.zmg;for(var n=1;n<=15;n++){var i=ZMG.INFO[n];if(!i||z.o[n]||(ZMG.OFF||[]).indexOf(i.id)>=0)continue;return i.id;}
for(var m=1;m<=15;m++){var j=ZMG.INFO[m];if(j&&z.o[m])return j.id;}}catch(e){}return'';}
function mgOpen(id){try{var n=ZMG.info(id).num;S.zmg.o[n]=1;S.zmg.s[n]=1;if(S.zmg.nw===id)S.zmg.nw='';save();ZMG.open(id,{mode:'home',back:function(){try{ZB.refresh();}catch(e){}}});}catch(e){}}
var T={
penal:function(){return env('✏️ Пенал','Внутри две буквы-подсказки 💡. Застрял в уроке — жми 💡: сначала буква дня даром, потом из пенала.');},
dnevnik:function(){return env('📒 Мой дневник «Сегодня у Зины»','Пять дел в день. Сделал три — «пятёрка» в дневник и портфель с гостинцем. Я строгая, но справедливая.');},
posylka:function(){var id=mgPick(),i=id&&ZMG.info(id);return env('📦 Посылка от внука',i?'Внук прислал игру на перемену — вне очереди: '+i.ic+' «'+i.t+'». Пишет: «Бабуля, только не жульничай!»':'Внук прислал письмо и букву-подсказку. Пишет: «Бабуля, держи хвост пистолетом!»');},
klyuch:function(){return env('🔑 Ключ от кабинета','Тётя Валя дала ключ от столовой — посмотреть, что ремонтировать. Копим на неё: столовая сама копит монеты, пока тебя нет!');},
zapiska:function(){return env('💌 Записка от соседки','«Соревнуемся, кто больше слов за неделю! Галя с третьего». Каждая буква — очко, итоги в понедельник.');},
lentochka:function(){return env('🎀 Ленточка','Первая ступенька четверти — твоя! Тридцать ступеней, на каждой подарок. А с «Абонементом» — ещё и красота сверху.');},
tabel:function(){var lv=+S.lv||0,w=0;try{w=wordsTotal();}catch(e){}var n=window.ZB2CAL?ZB2CAL.streak():0;
return env('📜 Табель первой недели','Уроков: '+lv+' · слов: '+w+(n?' · серия '+n+' '+pl(n,'день','дня','дней'):'')+'. Поведение — «примерное», почерк — «как курица лапой». А наряд «Первоклассница» — уже твой!');}};
var A={
dnevnik:function(){return window.ZBTD&&ZBTD.openDiary?{t:'📒 Открыть дневник',go:function(){ZBTD.openDiary();}}:null;},
posylka:function(){var id=mgPick();return id?{t:'▶ Сыграть',go:function(){mgOpen(id);}}:null;},
klyuch:function(){return window.ZB2GOAL&&ZB2GOAL.open?{t:'🎯 Цель: столовая',go:function(){ZB2GOAL.open();}}:ZB._scr&&ZB._scr.school?{t:'🏫 В Школу',go:function(){ZB.go('school');}}:null;},
zapiska:function(){return typeof openSosedki==='function'&&typeof sosOn==='function'&&sosOn()?{t:'🏠 Соседки по подъезду',go:function(){openSosedki('cal');}}:null;},
lentochka:function(){return window.ZBSEA&&ZBSEA.open?{t:'🎀 Посмотреть четверть',go:function(){ZBSEA.open();}}:null;},
tabel:function(){return window.ZBS&&ZBS.openClass?{t:'📒 Табель',go:function(){ZBS.openClass();}}:null;}};
function k(n){var g=window.ZB2CAL&&ZB2CAL.w1g(n);return g&&g.k;}
window.ZB2W1={after:function(n){var f=T[k(n)];
if(k(n)==='lentochka')try{if(window.ZBSEA&&ZBSEA.steps()<1){var e=window.ZBECO,sp=e&&e.school&&e.school.season&&+e.school.season.step;ZBSEA.addPts(sp||(ZBSEA.CFG&&ZBSEA.CFG.step)||15);}}catch(e){}
return f?f():'';},
act:function(n){var f=A[k(n)];return f?f():null;}};
})();
