'use strict';
/* zb2-mail-ui — окно «Написать бабе Зине» (TECH, буст_в2.0). Грузится по требованию: ZB.load из js/zb2-mail.js (вход, флаг, поле S.z2t — там).
   Текст ≤ 500 знаков (ссылки/почта/телефоны вычищаются) → mail {a:'send', f, n, l} + куски fb {m ≤ 40, n, of, k, l} (как «Книга жалоб»
   Гастронома; report.py склеивает «Отзывы игроков»; модуль STAT режет строки до 40 — отсюда кусок 40). Не чаще раза в 20 с. */
(function(){
  var M=window.ZB2MAIL;if(!M||M.open)return;
  var MAX=500,CH=40,sentT=0,z=M._z,day=M._day,st=M._st;
  function tap(){try{SND.tap();}catch(e){}}
  function el(id){return document.getElementById(id);}
  function scrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f]+/g,' ');
    t=t.replace(/\b(?:https?:\/\/|www\.)\S+/gi,'[ссылка]').replace(/\S+@\S+\.\S+/g,'[почта]').replace(/(?:\+?\d[\d\s()-]{5,}\d)/g,'#');
    return t.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').slice(0,MAX);}
  function send(txt,o){var t=scrub(txt),Z=window.STATZB,i,n=0,l=typeof S!=='undefined'?+S.lv||0:undefined;if(!t)return 0;
    if(Date.now()-sentT<20e3)return -1;sentT=Date.now();o=o||{};
    if(Z&&Z.z2)Z.z2('mail',{a:'send',f:o.f,n:t.length,l:l});
    for(i=0;i<t.length;i+=CH)n++;
    for(i=0;i<n;i++)if(Z&&Z.ev)Z.ev('fb',{m:t.slice(i*CH,i*CH+CH),n:i+1,of:n,k:i?undefined:o.k,l:i?undefined:l});
    try{if(window.STAT&&STAT.flush)STAT.flush();}catch(e){}
    return n;}
  var TOP=[['like','👍 Хвалю'],['bug','🐞 Ошибка'],['idea','💡 Идея'],['word','📖 Про слово']];

  // back — куда вернуться после письма (окно «Об игре» или окно победы); без него — просто закрыть
  function open(f,back){
    f=f==='win'?'win':'about';var k='',sent=0;
    try{STAT.screen('mail');}catch(e){}st('open',f);
    modal('<div class="ztm-mail"><h2>✉️ Письмо бабе Зине</h2>'+
      '<p class="ztm-say">Пиши как есть: что нравится, что не так, какое слово я зря не засчитала. Всё прочитаю — с лупой и чаем.</p>'+
      '<div class="ztm-top">'+TOP.map(function(t){return '<button class="ztm-chip" data-k="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div>'+
      '<textarea id="ztTxt" class="ztm-txt" maxlength="'+MAX+'" rows="5" placeholder="Дорогая баба Зина, …"></textarea>'+
      '<div class="ztm-cnt"><small>Имя, телефон и почту не пиши — я тебя и так по почерку узнаю.</small><b id="ztCnt">0 / '+MAX+'</b></div>'+
      '<div class="btns"><button class="btn green" id="ztSend" disabled>Отправить ✉️</button><button class="btn ghost" id="ztNo">Не сейчас</button></div></div>');
    var ta=el('ztTxt'),bs=el('ztSend'),cn=el('ztCnt');
    function upd(){var n=ta.value.replace(/^\s+|\s+$/g,'').length;cn.textContent=Math.min(ta.value.length,MAX)+' / '+MAX;bs.disabled=n<2;}
    ta.oninput=upd;
    [].slice.call(document.querySelectorAll('#mcard .ztm-chip')).forEach(function(b){b.onclick=function(){tap();
      var on=!b.classList.contains('on');[].slice.call(document.querySelectorAll('#mcard .ztm-chip')).forEach(function(x){x.classList.remove('on');});
      if(on)b.classList.add('on');k=on?b.getAttribute('data-k'):'';};});
    function done(){if(back)back();else hideModal();}
    el('ztNo').onclick=function(){tap();if(!sent)st('cancel',f);done();};
    bs.onclick=function(){tap();var t=ta.value.slice(0,MAX),r=0;
      try{r=send(t,{f:f,k:k});}catch(e){r=1;}
      if(r===-1){try{toast('Ять ещё на почте с прошлым письмом — подожди минутку',3500);}catch(e){}return;}
      if(!r)return;sent=1;var v=z();v.n=(+v.n||0)+1;v.d=day();try{save();}catch(e){}
      modal('<div class="ztm-mail ztm-ok"><h2>Письмо ушло!</h2><p class="ztm-say">Ять отнёс его на почту — и даже марку не съел. Спасибо, что написал'+
        '! Отвечать лично не умею, но каждое письмо прочитаю.</p><div class="btns"><button class="btn green" id="mNext">Пожалуйста!</button></div></div>');
      el('mNext').onclick=function(){tap();done();};};
  }
  // стили — вставкой (без отдельного файла: архив и так близок к 100 файлам на папку)
  (function(){if(el('ztmCss'))return;var c=document.createElement('style');c.id='ztmCss';c.textContent=
    '.ztm-mail h2{margin:0 0 6px}.ztm-say{font-size:16px;margin:0 0 10px}'+
    '.ztm-top{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 8px}'+
    '.ztm-chip{font:inherit;font-size:14.5px;font-weight:700;min-height:44px;padding:6px 12px;border-radius:999px;border:2px solid var(--edge,#c9cfe0);background:var(--card,#fff);color:var(--ink,#27324a);cursor:pointer}'+
    '.ztm-chip.on{border-color:#2563c9;background:#2563c9;color:#fff}'+
    '.ztm-txt{display:block;box-sizing:border-box;width:100%;min-height:110px;max-height:34vh;padding:10px 12px;border-radius:12px;border:2px solid var(--edge,#c9cfe0);font:inherit;font-size:16px;resize:vertical;background:#fff;color:#27324a;-webkit-user-select:text;user-select:text}'+
    '.ztm-txt:focus{outline:none;border-color:#2563c9}'+
    '.ztm-cnt{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin:6px 0 4px;font-size:13.5px}.ztm-cnt b{white-space:nowrap;font-size:13.5px}'+
    '.ztm-win{margin:6px 0 0;text-align:center}.ztm-link{font:inherit;font-size:14.5px;font-weight:700;min-height:44px;padding:6px 10px;border:0;background:none;color:#2563c9;text-decoration:underline;cursor:pointer}'+
    '@media (max-height:600px){.ztm-say{font-size:14.5px;margin-bottom:6px}.ztm-txt{min-height:80px}}';
    (document.head||document.documentElement).appendChild(c);})();
  M.open=open;M.send=send;M.scrub=scrub;

})();
