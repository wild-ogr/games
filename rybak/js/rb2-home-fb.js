'use strict';
/* rb2-home-fb — окно «Написать Петровичу» (поток HOME, буст 2.0; флаг hfb). Грузится по требованию: R2.need из js/rb2-home.js (строка в ⚙ Настройках).
   Образец — «Написать бабе Зине» (slovo js/zb2-mail-ui.js). Текст ≤ 500 знаков (ссылки/почта/телефоны вычищаются) →
   STAT mod {m:'pmail', a:'send', k, n} + куски fb {m ≤ 40, n, of, k} (как «Книга жалоб» Гастронома и письма Зины; STAT режет строки до 40).
   Не чаще раза в 20 с. День письма — S.r2h.fd. */
(function(){
if(window.R2HFB)return;
var MAX=500,CH=40,sentT=0;
function $(id){return document.getElementById(id);}
function tap(){try{SND.tap();}catch(e){}}
function st(a,o){try{var p={m:'pmail',a:a};for(var k in o)if(o[k]!==undefined)p[k]=o[k];STAT.ev('mod',p);}catch(e){}}
function scrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f]+/g,' ');
  t=t.replace(/\b(?:https?:\/\/|www\.)\S+/gi,'[ссылка]').replace(/\S+@\S+\.\S+/g,'[почта]').replace(/(?:\+?\d[\d\s()-]{5,}\d)/g,'#');
  return t.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').slice(0,MAX);}
function send(txt,k){var t=scrub(txt),i,n=0;if(!t)return 0;if(Date.now()-sentT<20e3)return -1;sentT=Date.now();
  st('send',{k:k||undefined,n:t.length});
  for(i=0;i<t.length;i+=CH)n++;
  for(i=0;i<n;i++)try{STAT.ev('fb',i?{m:t.slice(i*CH,i*CH+CH),n:i+1,of:n}:{m:t.slice(0,CH),n:1,of:n,k:k||'',s:S.sessions||0});}catch(e){}
  try{STAT.flush();}catch(e){}
  return n;}
var TOP=[['like','👍 Хвалю'],['bug','🐞 Ошибка'],['idea','💡 Идея'],['fish','🐟 Про рыбу']];
function open(back){var k='',sent=0;
  try{STAT.screen('pmail');}catch(e){}st('open');
  modal('<div class="r2fb"><h2>✉️ Письмо Петровичу</h2>'+
    '<p class="r2fb-say">Пиши как есть: что нравится, что не так, какой рыбы не хватает. Всё прочитаю — вечером, у костра, с чаем.</p>'+
    '<div class="r2fb-top">'+TOP.map(function(t){return '<button class="r2fb-chip noenter" data-k="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div>'+
    '<textarea id="r2fbTxt" class="r2fb-txt" maxlength="'+MAX+'" rows="5" placeholder="Петрович, привет! …"></textarea>'+
    '<div class="r2fb-cnt"><small>Имя, телефон и почту не пиши — я тебя и так по улову узнаю.</small><b id="r2fbCnt">0 / '+MAX+'</b></div>'+
    '<div class="row"><button class="btn green noenter" id="r2fbSend" disabled>Отправить ✉️</button><button class="btn" id="mCancel">Не сейчас</button></div></div>');
  var ta=$('r2fbTxt'),bs=$('r2fbSend'),cn=$('r2fbCnt');
  function upd(){var n=ta.value.replace(/^\s+|\s+$/g,'').length;cn.textContent=Math.min(ta.value.length,MAX)+' / '+MAX;bs.disabled=n<2;}
  ta.oninput=upd;
  [].slice.call(document.querySelectorAll('#mcard .r2fb-chip')).forEach(function(b){b.onclick=function(){tap();
    var on=!b.classList.contains('on');[].slice.call(document.querySelectorAll('#mcard .r2fb-chip')).forEach(function(x){x.classList.remove('on');});
    if(on)b.classList.add('on');k=on?b.getAttribute('data-k'):'';};});
  function done(){if(back)back();else hideModal();}
  $('mCancel').onclick=function(){tap();if(!sent)st('cancel');done();};
  bs.onclick=function(){tap();var r=0;try{r=send(ta.value.slice(0,MAX),k);}catch(e){r=1;}
    if(r===-1){try{toast('Письмо ещё в пути — подожди минутку',3000);}catch(e){}return;}
    if(!r)return;sent=1;try{if(S.r2h)S.r2h.fd=dayNum();save();}catch(e){}
    modal('<div class="r2fb"><h2>Письмо ушло!</h2><p class="r2fb-say">Митяй отнёс его на почту на велосипеде — даже в лужу не уронил. Спасибо, что написал! Отвечать лично не умею, но каждое письмо прочитаю.</p>'+
      '<div class="row"><button class="btn green noenter" id="r2fbOk">Пожалуйста!</button></div></div>');
    $('r2fbOk').onclick=function(){tap();done();};};}
window.R2HFB={open:open,_scrub:scrub};
})();
