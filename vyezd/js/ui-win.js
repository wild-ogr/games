/* ui-win.js — оформление окна победы/поражения (поток UX): жильцы хлопают над окном, реплика ДРУГОГО жильца каждый раз
   (пул по героям, подряд не повторяется), запасная строка «Завтра во дворе». Кнопки и порядок — в win() index.html (/* vy-ux *\/).
   UI.winTop(ctx) → html, UI.winSay(ctx) → html, UI.winTmr(ctx) → html. Нет файла — окно как раньше. */
(function(){'use strict';
  if(!window.UI)return;
  var L=function(a,b){return VY.L(a,b);};
  var POOL={
    shura:[['Ловко! Я из окна всё видела.','Nicely done! I saw it all from my window.'],['Вот это я понимаю — водитель!','Now that’s what I call a driver!'],['Двор чистый — можно и чай пить.','Yard’s clear — time for tea.'],['Без единой царапины, молодец!','Not a scratch — well done!'],['Ну всё, теперь и бельё можно вешать.','There, now I can hang out the washing.']],
    tolik:[['Мой «Москвич» так бы не сумел.','My Moskvich couldn’t have done that.'],['Сцепление чувствуешь — уважаю.','You’ve got a feel for the clutch — respect.'],['Заезжай в гараж, покажу кое-что.','Drop by the garage, I’ll show you something.'],['Чисто вышло. Как по учебнику.','Clean as a textbook.']],
    mihalych:[['Вот и дорогу освободили — подмету.','Road’s clear — I’ll sweep up.'],['Клумбы целы — уважаю!','Flower beds intact — respect!'],['Порядок во дворе — порядок в голове.','Tidy yard, tidy mind.'],['Так держать, водитель!','Keep it up, driver!']],
    valerka:[['Я посчитал — ходов почти без лишних!','I counted — barely a wasted move!'],['Можно я тоже так научусь?','Can you teach me that?'],['Пятёрка тебе за этот двор!','Top marks for this yard!']],
    mityai:[['Помню, в восемьдесят седьмом так же выезжали.','Back in ’87 we got out just like that.'],['Хорошо пошла! Как карась на мотыля.','Smooth! Like a carp on a bloodworm.'],['Терпение, внучок, — и любой двор твой.','Patience, sonny — and any yard is yours.']]};
  var WHO=['shura','tolik','mihalych','valerka','mityai'],last={who:'',i:-1},n=0;
  function pick(){n++;var who=WHO[(n+Math.floor(Math.random()*3))%WHO.length];if(who===last.who)who=WHO[(WHO.indexOf(who)+1)%WHO.length];
    var a=POOL[who],i=Math.floor(Math.random()*a.length);last={who:who,i:i};return {who:who,t:L(a[i][0],a[i][1])};}
  // три жильца хлопают над окном (для первой победы и нового региона — тоже)
  UI.winTop=function(ctx){var w=['shura',last.who&&last.who!=='shura'?last.who:'tolik','mityai'];if(w[1]==='mityai')w[2]='mihalych';
    return '<div class="wTop" aria-hidden="true">'+w.map(function(x,i){return '<span class="wTp" style="animation-delay:'+(i*.12)+'s">'+UI.who(x,'clap')+'</span>';}).join('')+'</div>';};
  UI.winSay=function(ctx){var r=pick();return '<div class="wSay" data-fit="2"><span class="wSp">'+UI.who(r.who,'happy')+'</span><p><b>'+UI.whoName(r.who)+'</b>'+UI.esc(r.t)+'</p></div>';};
  UI.winTmr=function(ctx){var dl=false;try{dl=dailyLocked();}catch(e){}
    return '<div class="wTmr"><b>'+L('Завтра во дворе','Tomorrow in the yard')+'</b><span>🎁 '+L('новый гостинец бабы Шуры','a new gift from Granny Shura')+(dl?'':' · 📅 '+L('новое задание дня','a new daily challenge'))+'</span></div>';};
})();
