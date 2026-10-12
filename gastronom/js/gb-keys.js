'use strict';
/* ================= gb-keys — клавиатура ПК (поток VIEW, 11.10.2026) =================
   ПК — главная платформа новичков (окно VK 920×800). Прежние клавиши игры не трогаем (Enter/Пробел в окне — первая обычная
   кнопка: в «Кассе» это «Дальше»; Esc в окне — «В магазин»/закрыть; в уровне H — подсказка, U — отмена, R — заново, Esc — домой).
   Добавлено: на главном Enter/Пробел — «Работать»; в уровне 1–4 — бустеры (Отменить, Подсказка, Смешать, Столик);
   на экранах «Путь», «Подсобка», «Книга» Esc — домой. Подсказки клавиш (значки 1–4, Enter) — только там, где есть мышь (hover:hover). */
(function(){
  if(!window.GB||!GB.viewOn)return;
  function $(id){return document.getElementById(id);}
  function on(id){var e=$(id);return !!(e&&e.classList.contains('on'));}
  document.addEventListener('keydown',function(e){if(!GB.viewOn)return;var k=e.key;if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
    if($('ad')&&$('ad').classList.contains('on'))return;if(typeof adWaitOn==='function'&&adWaitOn())return;if(typeof modalOn!=='undefined'&&modalOn)return;
    var t=document.activeElement;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
    if(on('scr-map')){if(k==='Enter'||k===' '){var w=$('vwWork');if(w){e.preventDefault();e.stopImmediatePropagation();w.click();}}return;}
    if(GB.cur&&on('gb-'+GB.cur)&&document.querySelector('.gb-scr.on')){if(k==='Escape'){e.preventDefault();e.stopImmediatePropagation();GB.homeGo();}return;}
    if(on('scr-game')&&typeof G!=='undefined'&&G&&!G.over){var b={'1':'bUndo','2':'bHint','3':'bMix','4':'bTable'}[k];
      if(b){var x=$(b);if(x&&x.offsetParent!==null&&!x.disabled){e.preventDefault();x.click();}}}},true);
  // значки клавиш — только при мыши
  GB.on('ready',function(){if(!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches))return;
    document.documentElement.classList.add('vw-keys');
    [['bUndo','1'],['bHint','2'],['bMix','3'],['bTable','4']].forEach(function(p){var b=$(p[0]);if(b&&!b.querySelector('.vw-kbd'))b.insertAdjacentHTML('beforeend','<kbd class="vw-kbd">'+p[1]+'</kbd>');});});
  GB.on('refresh',function(){var w=$('vwWork');if(w&&document.documentElement.classList.contains('vw-keys'))setTimeout(function(){if(w&&!w.querySelector('.vw-kbd'))w.insertAdjacentHTML('beforeend','<kbd class="vw-kbd vw-kbd-e">Enter</kbd>');},0);});
})();
