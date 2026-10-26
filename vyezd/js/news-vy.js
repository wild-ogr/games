/* news-vy — встройка общего модуля NEWS («объявление игрокам при входе», hobby-analytics/news/README.md; журнал hobby-analytics/release-i/news-2610/NEWS.md) в «Выезд».
   Карточка «Вести со двора» (не «Новости двора» — так в SOC называется кнопка сообщества VK) поверх главного экрана: не раньше 15 с после запуска, только на главном («Наш двор»), без открытого окна/рекламы,
   и не новичку — только после 1-го двора (S.unlocked ≥ 2). Пока объявление висит — строчка «📰 …» первой в полосе под шапкой (homeSlots, zone top),
   по ней — открыть снова. Статистика — общий STAT: news {a:show|open|close, id}. Не загрузился news.js — ничего. Старый синтаксис. */
(function(){
  'use strict';
  var W=window;
  if(!W.NEWS||!W.UI||!W.homeSlots)return;
  function $(id){return document.getElementById(id);}
  function Sv(){try{return typeof S!=='undefined'?S:null;}catch(e){return null;}}
  function lang(){try{return LANG;}catch(e){return 'ru';}}
  function on(id){var e=$(id);return !!(e&&e.classList.contains('on'));}
  function ready(){var s=Sv();
    return UI.cur==='home'&&!on('modal')&&!on('ad')&&!document.querySelector('.uxtut')&&!!s&&(+s.unlocked||1)>=2;}
  /* строчка «📰 заголовок ›» — первой в полосе под шапкой (zone top, над «правами»): видна без прокрутки; нажатие ловит сам модуль (data-nws-line) */
  homeSlots.push({id:'news',order:1,zone:'top',render:function(){return NEWS.lineHtml()||null;}});
  NEWS.init({g:'vyezd',lang:lang,ready:ready,cls:'noenter',
    hero:{i:'👵',n:VY.L('Выезд со двора','Yard Exit')},head:VY.L('Вести со двора','Yard news'),
    theme:{card:'#fff',ink:'#17324a',sub:'#4d6a80',accent:'#ff5a6e',accentInk:'#fff',line:'#e2edf2',btnShadow:'0 4px 0 #d63d52',lineBg:'#fff',
      font:'Rubik,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'},
    onList:function(){UI.refresh();},onClose:function(){UI.refresh();}});
})();
