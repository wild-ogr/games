'use strict';
/* ================= zb-keys — клавиатура на компьютере (поток VIEW, 10.10.2026) =================
   Набор слова в уровне — как было (game.js: буквы, Enter — проверить, Backspace — стереть, Esc — сбросить, Пробел — перемешать, 1/2 — подсказки).
   Здесь — вне уровня, в новом виде:
     «Дом»: Enter или Пробел — «Играть»; 1…5 — кнопки нижней панели (Дом, Путь, Школа, Словарь, Перемена) и на других её экранах.
     Окна: цифры 1…9 нажимают кнопки с атрибутом data-key="N" (мини-игры, выбор ответа — MG-потоки ставят его сами);
           кнопки трат и рекламы клавишами не нажимаются (как Enter в game.js — только #mNext/#mGo).
   Подсказки клавиш (.kbd) видны только при (hover:hover) and (pointer:fine) — css/zb-view.css; в уровне на ПК — строка «Клавиши…»
   в боковой колонке (гнездо levelSlots zone 'side', id 'vw-keys'). */
(function(){
  if(typeof ZB==='undefined'||!ZB.vw)return;
  function $(id){return document.getElementById(id);}
  var fine=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
  ZB.keysFine=function(){return fine;};
  function cur(){var s=document.querySelector('.screen.on');return s?s.id:'';}
  function vis(e){return !!e&&e.offsetParent!==null&&!e.disabled;}
  document.addEventListener('keydown',function(e){if(e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
    var t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
    if(typeof adBusy!=='undefined'&&adBusy)return;
    var mo=$('modal')&&$('modal').classList.contains('on');
    if(mo){if(/^[1-9]$/.test(e.key)){var b=document.querySelector('#mcard [data-key="'+e.key+'"]');if(vis(b)){e.preventDefault();b.click();}}return;}
    var sc=cur();if(sc==='game')return; // в уровне — game.js
    if(sc==='menu'&&(e.key==='Enter'||e.key===' ')){var p=$('btnPlay');if(vis(p)){e.preventDefault();p.click();}return;}
    if(/^[1-5]$/.test(e.key)&&ZB.navOf&&ZB.navOf[sc]){var n=document.querySelectorAll('#zbNav .zbnav');var k=n[+e.key-1];if(k){e.preventDefault();k.click();}}
  });
  // подписи клавиш: «Играть» — Enter, панель — 1…5
  function marks(){if(!fine)return;var p=$('btnPlay');if(p&&!p.querySelector('.kbd'))p.insertAdjacentHTML('beforeend','<span class="kbd">Enter</span>');
    [].forEach.call(document.querySelectorAll('#zbNav .zbnav'),function(b,i){if(!b.querySelector('.kbd'))b.insertAdjacentHTML('beforeend','<span class="kbd">'+(i+1)+'</span>');});}
  ZB.on('screen',function(){setTimeout(marks,0);});ZB.on('ready',marks);ZB.on('home',function(){setTimeout(marks,0);});
  // уровень на ПК: памятка клавиш в боковой колонке (первые 30 уровней и задание дня; дальше — не мешаем)
  ZB.add(ZB.levelSlots,{id:'vw-keys',order:90,zone:'side',render:function(c){if(!fine||!(c.daily||c.l<=30))return '';
    return '<div class="zbkeys"><b>Клавиши:</b> буквы — набрать слово, <b>Enter</b> — проверить, <b>Backspace</b> — стереть букву, <b>Пробел</b> — перемешать, <b>1</b> / <b>2</b> — подсказка буквой / словом.</div>';}});
})();
