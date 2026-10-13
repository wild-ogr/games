'use strict';
/* ob2-mail — окно «Написать воеводе Потапу» (поток VKT, буст_в2.0, бэклог Б5). Грузится по требованию: OB2.need из js/ob2-vkt.js (входы, флаг mail — там).
   Текст ≤ 500 знаков (ссылки, почта, телефоны вычищаются) → STAT mail {a:'send', f, n, l} + куски fb {m ≤ 40, n, of, k, l}
   (как у Зины и «Книги жалоб» Гастронома; report.py склеивает «Отзывы игроков»; модуль STAT режет строки до 40). Не чаще раза в 20 с. Без ?. ?? */
(function(){
  var M=window.OB2MAIL;if(!M||M.open)return;
  var MAX=500,CH=40,sentT=0;
  function el(id){return document.getElementById(id);}
  function click(){try{SND.click();}catch(e){}}
  function scrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f]+/g,' ');
    t=t.replace(/(?:https?:\/\/|www\.)\S+/gi,'[url]').replace(/\S+@\S+\.\S+/g,'[mail]').replace(/(?:\+?\d[\d\s()-]{5,}\d)/g,'#');
    return t.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').slice(0,MAX);}
  function send(txt,o){var t=scrub(txt),i,n=0,l=typeof S!=='undefined'?Math.floor(+S.wins||0):0;if(t.length<2)return 0;
    if(Date.now()-sentT<20e3)return -1;sentT=Date.now();o=o||{};
    M.st('send',o.f,{n:t.length});
    for(i=0;i<t.length;i+=CH)n++;
    for(i=0;i<n;i++){var p={m:t.slice(i*CH,i*CH+CH),n:i+1,of:n};if(!i){if(o.k)p.k=o.k;p.l=l;}try{STAT.ev('fb',p);}catch(e){}}
    try{if(STAT.flush)STAT.flush();}catch(e){}
    return n;}
  var TOP=[['like',Lg('👍 Хвалю','👍 Praise')],['bug',Lg('🐞 Ошибка','🐞 Bug')],['idea',Lg('💡 Идея','💡 Idea')],['hard',Lg('⚔ Трудно','⚔ Too hard')]];
  function css(){if(el('o2mCss'))return;var c=document.createElement('style');c.id='o2mCss';c.textContent=
    '.o2m-say{font-size:16px;margin:0 0 10px;text-align:left}'+
    '.o2m-top{display:flex;flex-wrap:wrap;justify-content:center;margin:0 0 8px}.o2m-top button{margin:3px}'+
    '.o2m-chip{font:inherit;font-size:14.5px;font-weight:700;min-height:44px;padding:6px 12px;border-radius:999px;border:2px solid #b89a6a;background:#fff8e8;color:#4a2f14;cursor:pointer}'+
    '.o2m-chip.on{border-color:#2f6a3a;background:#2f6a3a;color:#fff}'+
    '.o2m-txt{display:block;box-sizing:border-box;width:100%;min-height:110px;max-height:34vh;padding:10px 12px;border-radius:12px;border:2px solid #b89a6a;font:inherit;font-size:16px;resize:vertical;background:#fff;color:#2a1c0c;-webkit-user-select:text;user-select:text}'+
    '.o2m-txt:focus{outline:none;border-color:#2f6a3a}'+
    '.o2m-cnt{display:flex;justify-content:space-between;align-items:flex-start;margin:6px 0 4px;font-size:13.5px;text-align:left}.o2m-cnt b{white-space:nowrap;margin-left:8px}'+
    '@media (max-height:600px){.o2m-say{font-size:14.5px;margin-bottom:6px}.o2m-txt{min-height:80px}}';
    (document.head||document.documentElement).appendChild(c);}
  // f — откуда: set (Настройки) | win (окно победы); back — куда вернуться (без него — закрыть окно)
  function open(f,back){css();var k='',sent=0;
    try{STAT.screen('mail');}catch(e){}M.st('open',f);
    showModal('<h3>'+Lg('✉️ Письмо воеводе Потапу','✉️ A letter to Commander Potap')+'</h3>'+
      '<p class="o2m-say">'+Lg('Пиши как есть: что по душе, что не так, где нечисть совсем распоясалась. Прочитаю всё — между двумя набегами.',
        'Tell it straight: what you like, what is wrong, where the monsters got out of hand. I will read every word — between two raids.')+'</p>'+
      '<div class="o2m-top">'+TOP.map(function(t){return '<button class="o2m-chip" data-k="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div>'+
      '<textarea id="o2mTxt" class="o2m-txt" maxlength="'+MAX+'" rows="5" placeholder="'+Lg('Здравия желаю, воевода! …','Greetings, Commander! …')+'"></textarea>'+
      '<div class="o2m-cnt"><small>'+Lg('Имя, телефон и почту не пиши — гонец всё равно не запомнит.','No name, phone or e-mail, please — the messenger forgets them anyway.')+'</small><b id="o2mCnt">0 / '+MAX+'</b></div>'+
      '<div class="btns"><button class="btn ghost" id="o2mNo">'+Lg('Не сейчас','Not now')+'</button><button class="btn big" id="o2mSend" disabled>'+Lg('Отправить ✉️','Send ✉️')+'</button></div>','mail');
    var ta=el('o2mTxt'),bs=el('o2mSend'),cn=el('o2mCnt');
    function upd(){var n=ta.value.replace(/^\s+|\s+$/g,'').length;cn.textContent=Math.min(ta.value.length,MAX)+' / '+MAX;bs.disabled=n<2;}
    ta.oninput=upd;
    var chips=[].slice.call(document.querySelectorAll('#mBody .o2m-chip'));
    chips.forEach(function(b){b.onclick=function(){click();var on=!b.classList.contains('on');chips.forEach(function(x){x.classList.remove('on');});
      if(on)b.classList.add('on');k=on?b.getAttribute('data-k'):'';};});
    function done(){if(back)back();else hideModal();}
    el('o2mNo').onclick=function(){click();if(!sent)M.st('cancel',f);done();};
    bs.onclick=function(){click();var r=0;try{r=send(ta.value.slice(0,MAX),{f:f,k:k});}catch(e){r=1;}
      if(r===-1){try{toast(Lg('Гонец ещё в пути с прошлым письмом — подожди минутку','The messenger is still on the road — wait a minute'));}catch(e){}return;}
      if(!r)return;sent=1;M.mem('d',M.day());try{save();}catch(e){}
      showModal('<h3>'+Lg('Письмо ушло!','Letter sent!')+'</h3><p class="o2m-say" style="text-align:center">'+
        Lg('Гонец ускакал — даже коня не забыл. Спасибо, что написал! Лично ответить не смогу, но каждое письмо прочитаю.',
           'The messenger rode off — and even remembered his horse. Thank you for writing! I cannot answer in person, but I read every letter.')+
        '</p><div class="btns"><button class="btn big" id="o2mOk">'+Lg('Так точно!','Yes, sir!')+'</button></div>','mail');
      el('o2mOk').onclick=function(){click();done();};};
  }
  M.open=open;M.send=send;M.scrub=scrub;
})();
