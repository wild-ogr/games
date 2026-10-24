/* b2-vkm-mail.js — VKT: окно «✉️ Написать Людмиле Санне» (бэклог Б19). Грузится по требованию (B2.need из js/b2-vkm.js, строка в ⚙).
   Текст ≤ 500 знаков (ссылки, почта, телефоны вычищаются до отправки) → STAT b2vkt_mail {a:'send', f, k, n} + куски fb {m ≤ 40, n, of, k, s}
   (как «Письмо воеводе» Обороны и отзывы Зины: report.py склеивает «Отзывы игроков»; модуль STAT режет строки до 40). Не чаще раза в 20 с.
   Имя, телефон и почту не просим и не храним. Все площадки (VK, Яндекс, ОК), ru/en. Старые WebView: без ?. и ??. */
(function(){'use strict';
if(typeof window==='undefined'||window.VKMAIL)return;   // jsc (симуляторы грузят все b2-*.js) — без DOM молчим
var MAX=500,CH=40,sentT=0;
function $i(id){return document.getElementById(id);}
function ev(a,o){try{B2.ev('vkt','mail',Object.assign({a:a},o||{}));}catch(e){}}
function stage(){try{return GAME.W?(GAME.W.hold>=2?5:ECON.stI(GAME.W)+1):0;}catch(e){return 0;}}
function scrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f]+/g,' ');
  t=t.replace(/(?:https?:\/\/|www\.)\S+/gi,'[url]').replace(/\S+@\S+\.\S+/g,'[mail]').replace(/(?:\+?\d[\d\s()-]{5,}\d)/g,'#');
  return t.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').slice(0,MAX);}
function send(txt,o){var t=scrub(txt),i,n=0,s=stage();if(t.length<2)return 0;
  if(Date.now()-sentT<20e3)return -1;sentT=Date.now();o=o||{};
  for(i=0;i<t.length;i+=CH)n++;
  ev('send',{f:o.f||'',k:o.k||'',n:t.length});
  for(i=0;i<n;i++){var p={m:t.slice(i*CH,i*CH+CH),n:i+1,of:n};if(!i){if(o.k)p.k=o.k;p.s=s;}try{STAT.ev('fb',p);}catch(e){}}
  try{if(STAT.flush)STAT.flush();}catch(e){}
  return n;}
var TOP=[['like',['👍 Нравится','👍 I like it']],['bug',['🐞 Ошибка','🐞 Bug']],['idea',['💡 Идея','💡 Idea']],['hard',['🤔 Непонятно','🤔 Confusing']]];
function css(){if($i('vkmCss'))return;var c=document.createElement('style');c.id='vkmCss';c.textContent=
  '.vkm-say{font-size:17px;line-height:1.4;margin:0 0 10px;text-align:left}'+
  '.vkm-top{display:flex;flex-wrap:wrap;justify-content:center;margin:0 0 8px}.vkm-top button{margin:3px}'+
  '.vkm-chip{font:inherit;font-size:16px;font-weight:700;min-height:48px;padding:6px 14px;border-radius:999px;border:2px solid var(--line,#d5dbe2);background:var(--card,#fff);color:var(--ink,#1d2733);cursor:pointer}'+
  '.vkm-chip.on{border-color:var(--accent,#c8641e);background:var(--accent,#c8641e);color:#fff}'+
  '.vkm-txt{display:block;box-sizing:border-box;width:100%;min-height:120px;max-height:34vh;padding:10px 12px;border-radius:12px;border:2px solid var(--line,#d5dbe2);font:inherit;font-size:17px;resize:vertical;background:#fff;color:#1d2733;-webkit-user-select:text;user-select:text}'+
  '.vkm-txt:focus{outline:none;border-color:var(--accent,#c8641e)}'+
  '.vkm-cnt{display:flex;justify-content:space-between;align-items:flex-start;margin:6px 0 4px;font-size:15px;text-align:left;color:var(--muted,#4f5d72)}.vkm-cnt b{white-space:nowrap;margin-left:8px}'+
  '.vkm-row{display:flex;flex-wrap:wrap;justify-content:center;margin-top:10px}.vkm-row .btn{margin:4px;min-height:48px;font-size:17px}'+
  '@media (max-height:600px){.vkm-say{font-size:15px;margin-bottom:6px}.vkm-txt{min-height:84px}}';
  (document.head||document.documentElement).appendChild(c);}
function face(m){try{return typeof advisorSvg==='function'?'<span style="display:inline-block;width:56px;height:56px;vertical-align:middle;margin-right:8px">'+advisorSvg(m||'calm')+'</span>':'';}catch(e){return '';}}
// f — откуда открыли (set — ⚙); back — куда вернуться (без него — закрыть окно)
function open(f,back){css();var k='',sent=0;
  try{STAT.screen('mail');}catch(e){}ev('open',{f:f||''});
  modal('<h2>'+face('happy')+L('✉️ Письмо Людмиле Санне','✉️ A letter to Lyudmila Sanna')+'</h2>'+
    '<p class="vkm-say">'+L('Пишите как есть: что нравится, что мешает, где непонятно, чего не хватает. Я всё прочитаю и передам — так игра и становится лучше.',
      'Tell it straight: what you like, what gets in the way, what is unclear, what is missing. I will read it all and pass it on — that is how the game gets better.')+'</p>'+
    '<div class="vkm-top">'+TOP.map(function(t){return '<button class="vkm-chip noenter" data-k="'+t[0]+'">'+L(t[1][0],t[1][1])+'</button>';}).join('')+'</div>'+
    '<textarea id="vkmTxt" class="vkm-txt" maxlength="'+MAX+'" rows="5" placeholder="'+L('Людмила Санна, …','Lyudmila Sanna, …')+'"></textarea>'+
    '<div class="vkm-cnt"><small>'+L('Имя, телефон и почту не пишите — ответить лично не сможем, а письмо прочитаем.','Please no name, phone or e-mail — we cannot reply in person, but we will read it.')+'</small><b id="vkmCnt">0 / '+MAX+'</b></div>'+
    '<div class="vkm-row"><button class="btn noenter" id="vkmNo" data-esc>'+L('← Не сейчас','← Not now')+'</button><button class="btn accent noenter" id="vkmSend" disabled>'+L('Отправить ✉️','Send ✉️')+'</button></div>');
  var ta=$i('vkmTxt'),bs=$i('vkmSend'),cn=$i('vkmCnt');if(!ta||!bs)return;
  function upd(){var n=ta.value.replace(/^\s+|\s+$/g,'').length;cn.textContent=Math.min(ta.value.length,MAX)+' / '+MAX;bs.disabled=n<2;}
  ta.oninput=upd;
  var chips=[].slice.call(document.querySelectorAll('#mcard .vkm-chip'));
  chips.forEach(function(b){b.onclick=function(){try{SND.tap();}catch(e){}var on=!b.classList.contains('on');chips.forEach(function(x){x.classList.remove('on');});
    if(on)b.classList.add('on');k=on?b.getAttribute('data-k'):'';};});
  function done(){if(back)back();else hideModal();}
  $i('vkmNo').onclick=function(){try{SND.tap();}catch(e){}if(!sent)ev('cancel',{f:f||''});done();};
  bs.onclick=function(){try{SND.tap();}catch(e){}var r=0;try{r=send(ta.value.slice(0,MAX),{f:f,k:k});}catch(e){r=1;}
    if(r===-1){try{toast(L('Прошлое письмо ещё в пути — подождите минутку','The last letter is still on its way — wait a minute'));}catch(e){}return;}
    if(!r)return;sent=1;
    modal('<h2>'+face('wow')+L('Письмо ушло!','Letter sent!')+'</h2><p class="vkm-say" style="text-align:center">'+
      L('Спасибо! Подшила в папку «Самое важное». Лично ответить не смогу, но каждое письмо прочитаем.',
        'Thank you! I filed it under “Most important”. I cannot reply in person, but every letter will be read.')+
      '</p><div class="vkm-row"><button class="btn accent noenter" id="vkmOk" data-esc>'+L('Хорошо','OK')+'</button></div>');
    var ok=$i('vkmOk');if(ok)ok.onclick=function(){try{SND.tap();}catch(e){}done();};};
}
window.VKMAIL={open:open,send:send,scrub:scrub};
})();
