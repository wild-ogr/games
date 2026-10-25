'use strict';
/* kr-mail (mail2410, 24.10.2026): «Написать деду Митяю» — по образцу «Бабы Зины» (slovo/js/zb2-mail*.js).
   Входы: ⚙ → «ℹ️ Об игре» (строка «✉️ Написать деду Митяю»); окно победы уровня с 15-го (раз в 7 дней, не в субботнике,
   не рядом с ×2 и вопросом о напоминаниях, не в вызове соседа); бесконечная — окно «Новый рекорд!» (тот же счётчик 7 дней).
   Поле S.krm {w — день последнего показа ссылки, n — писем всего, d — день последнего письма}: чинится здесь, облако — максимум (обёртка mergeSave).
   STAT: mail {a:'show'|'open'|'send'|'cancel', f:'about'|'win'|'rec', l:пройдено уровней, на send ещё n:длина, k:тема}
         fb {m:≤40 знаков, n:номер, of:всего, k:тема и l — на 1-м куске}; после письма — STAT.flush().
   Текст ≤ 500 знаков, ссылки/домены/почта/ники → [ссылка]/[почта], телефоны (≥ 7 цифр) → #. Не чаще раза в 20 с. Все площадки (VK, ОК, Яндекс). */
(function(){
  if(typeof S==='undefined'||typeof modal!=='function'||typeof L!=='function')return;
  var MAX=500,CH=40,GAP=7,WIN_LV=15,K=['w','n','d'],sentT=0;
  function el(id){return document.getElementById(id);}
  function tap(){try{SND.tap();}catch(e){}}
  function isO(x){return !!x&&typeof x==='object'&&!(x instanceof Array);}
  function fix(){var v=S.krm;if(!isO(v))v=S.krm={w:0,n:0,d:0};K.forEach(function(k){v[k]=Math.max(0,Math.floor(+v[k]||0));});return v;}
  fix(); // старое сохранение (без krm) грузится с умолчанием
  function z(){return isO(S.krm)?S.krm:fix();}
  function day(){var t=Date.now();return Math.floor((t-new Date(t).getTimezoneOffset()*6e4)/864e5);}
  function prog(){var n=0;try{for(var k in S.lv)if(+S.lv[k]>0)n++;}catch(e){}return n;}
  function st(a,f,x){try{var p={a:a,f:f,l:prog()},k;for(k in x||{})if(x.hasOwnProperty(k)&&x[k]!==undefined)p[k]=x[k];STAT.ev('mail',p);}catch(e){}}
  function sv(){try{save();}catch(e){}}

  // облако: поля krm — максимум из двух (mergeSave сам переносит только неизвестные/более новые ключи)
  if(typeof mergeSave==='function'){var m0=mergeSave;mergeSave=function(d){var a=isO(S.krm)?{w:+S.krm.w||0,n:+S.krm.n||0,d:+S.krm.d||0}:null;
    var r=m0.apply(this,arguments);try{var c=isO(d)&&isO(d.krm)?d.krm:{},v=S.krm=isO(S.krm)?S.krm:{};
      K.forEach(function(k){v[k]=Math.max(a?a[k]:0,+v[k]||0,+c[k]||0);if(!isFinite(v[k]))v[k]=0;});fix();}catch(e){}return r;};}

  function scrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f\u007f]+/g,' ');
    t=t.replace(/\b(?:https?:\/\/|www\.)\S+/gi,'[ссылка]')
      .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g,'[почта]')
      .replace(/(?:^|[^\wа-яё])@[a-z0-9_]{4,}/gi,function(m){return m.charAt(0)==='@'?'[ссылка]':m.charAt(0)+'[ссылка]';})
      .replace(/(?:[a-zа-яё0-9-]+\.)+(?:ru|рф|рус|com|net|org|su|me|io|info|online|site|ua|by|kz|tv|cc|gg|app|pro|link|xyz)(?![a-zа-яё0-9])(?:\/\S*)?/gi,'[ссылка]')
      .replace(/\+?\d[\d\s().-]*\d/g,function(m){return m.replace(/\D/g,'').length>=7?'#':m;});
    return t.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').slice(0,MAX);}
  function send(txt,o){var t=scrub(txt),i,n=0,l=prog();if(!t)return 0;
    if(Date.now()-sentT<20e3)return -1;sentT=Date.now();o=o||{};
    st('send',o.f,{n:t.length,k:o.k||undefined});
    for(i=0;i<t.length;i+=CH)n++;
    for(i=0;i<n;i++)try{var p={m:t.slice(i*CH,i*CH+CH),n:i+1,of:n};if(!i){if(o.k)p.k=o.k;p.l=l;}STAT.ev('fb',p);}catch(e){}
    try{if(window.STAT&&STAT.flush)STAT.flush();}catch(e){}
    return n;}
  var TOP=[['like','👍 '+L('Хвалю','Praise')],['bug','🐞 '+L('Ошибка','Bug')],['idea','💡 '+L('Идея','Idea')],['lvl','🧱 '+L('Про уровни','Levels')]];

  // back — куда вернуться после письма; без него — закрыть окно
  function open(f,back){var k='',sent=0;
    try{STAT.screen('mail');}catch(e){}st('open',f);
    modal('<div class="krm-mail"><h2>✉️ '+L('Письмо деду Митяю','A letter to Grandpa Mitya')+'</h2>'+
      '<p class="krm-say">'+L('Пиши как есть: что нравится, что мешает, какой уровень не даётся. Я очки надену и всё прочитаю — у нас во дворе каждое слово на счету.',
        'Write as it is: what you like, what bothers you, which level is too hard. I will put my glasses on and read it all.')+'</p>'+
      '<div class="krm-top">'+TOP.map(function(t){return '<button class="krm-chip noenter" data-k="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div>'+
      '<textarea id="krmTxt" class="krm-txt" maxlength="'+MAX+'" rows="5" placeholder="'+L('Дорогой дед Митяй, …','Dear Grandpa Mitya, …')+'"></textarea>'+
      '<div class="krm-cnt"><small>'+L('Имя, телефон и почту не пиши — двор тебя и так знает.','Please do not write your name, phone or email.')+'</small><b id="krmCnt">0 / '+MAX+'</b></div>'+
      '<div class="row"><button class="btn green" id="krmSend" disabled>'+L('Отправить','Send')+' ✉️</button><button class="btn" id="krmNo">'+L('Не сейчас','Not now')+'</button></div></div>');
    var ta=el('krmTxt'),bs=el('krmSend'),cn=el('krmCnt');
    function upd(){var n=ta.value.replace(/^\s+|\s+$/g,'').length;cn.textContent=Math.min(ta.value.length,MAX)+' / '+MAX;bs.disabled=n<2;}
    ta.oninput=upd;
    // клавиши игры (Enter — главная кнопка окна, Esc — назад) в поле письма не срабатывают; Esc — «Не сейчас»
    ta.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Escape'){e.preventDefault();el('krmNo').click();}});
    [].slice.call(document.querySelectorAll('#mcard .krm-chip')).forEach(function(b){b.onclick=function(){tap();
      var on=!b.classList.contains('on');[].slice.call(document.querySelectorAll('#mcard .krm-chip')).forEach(function(x){x.classList.remove('on');});
      if(on)b.classList.add('on');k=on?b.getAttribute('data-k'):'';};});
    function done(){if(back)back();else hideModal();}
    el('krmNo').onclick=function(){tap();if(!sent)st('cancel',f);done();};
    bs.onclick=function(){tap();var t=ta.value.slice(0,MAX),r=0;
      try{r=send(t,{f:f,k:k});}catch(e){r=1;}
      if(r===-1){try{toast(L('Погоди минутку — я ещё прошлое письмо читаю','Wait a minute — still reading your last letter'),3500);}catch(e){}return;}
      if(!r)return;sent=1;var v=z();v.n=(+v.n||0)+1;v.d=day();sv();
      modal('<div class="av">'+(typeof portrait==='function'?portrait('mityai','happy'):'')+'</div><div class="krm-mail krm-ok"><h2>'+L('Спасибо, прочитаем!','Thank you, we will read it!')+'</h2><p class="krm-say">'+
        L('Письмо у меня — положил под домино, чтобы ветром не унесло. Лично ответить не смогу, но прочитаю всё до последней строчки.',
          'Got your letter — tucked it under the dominoes so the wind will not take it. I cannot reply personally, but I will read every line.')+
        '</p><div class="row"><button class="btn green" id="krmOk">'+L('Пожалуйста!','You are welcome!')+'</button></div></div>');
      el('krmOk').onclick=function(){tap();done();};};
    setTimeout(upd,0);}

  // вход 1: «Об игре» — строка над кнопками
  if(typeof openAbout==='function'){var a0=openAbout;openAbout=function(){var r=a0.apply(this,arguments);
    try{var c=el('mcard'),rows=c&&c.querySelectorAll('.row'),row=rows&&rows[rows.length-1];if(!row||el('krmAb'))return r;
      var b=document.createElement('button');b.className='btn noenter krm-ab';b.id='krmAb';
      b.innerHTML='<span>✉️ '+L('Написать деду Митяю','Write to Grandpa Mitya')+'<small>'+L('похвалить, поругать, подсказать','praise, complain, suggest')+'</small></span>';
      row.parentNode.insertBefore(b,row);b.onclick=function(){tap();open('about',function(){openAbout();});};}catch(e){}
    return r;};}

  // вход 2: окно победы / рекорда — раз в 7 дней (и не раньше 7 дней после письма)
  function due(){var v=z(),d=day();return d-v.w>=GAP&&d-v.d>=GAP;}
  function link(id){return '<p class="krm-win"><button class="krm-link noenter" id="'+id+'">✉️ '+L('Черкни деду Митяю пару слов','Drop Grandpa Mitya a line')+'</button></p>';}
  // окно итога не перерисовываем: его узлы (с обработчиками кнопок) уносим и после письма ставим обратно
  function keep(){var c=el('mcard'),fr=document.createDocumentFragment(),cls=c.className;while(c.firstChild)fr.appendChild(c.firstChild);
    return function(my){if(G!==my){hideModal();return;}c.innerHTML='';c.className=cls;c.appendChild(fr);el('modal').classList.add('on');modalOn=true;
      var w=el('krmWin');if(w&&z().d===day())w.parentNode.removeChild(w);};}
  function put(my,f){var c=el('mcard');if(!c||G!==my||el('krmWin'))return;
    var rows=c.querySelectorAll('.row'),row=rows[rows.length-1];if(!row)return;
    var w=document.createElement('div');w.innerHTML=link('krmWin');w=w.firstChild;row.parentNode.insertBefore(w,row.nextSibling);
    el('krmWin').onclick=function(){tap();var back=keep();open(f,function(){back(my);});};}
  function wantWin(my){if(!my||my.mode!=='level'||my.chl||!my.cfg||my.cfg.boss||!(my.cfg.i>=WIN_LV)||(+S.wins||0)<WIN_LV)return false;
    var c=el('mcard');if(!c||el('wX2')||c.querySelector('.ntf,.tipl'))return false; // в окне уже есть важное: ×2, вопрос о напоминаниях, «открыто новое место»
    return due();}
  if(typeof levelWon==='function'){var w0=levelWon;levelWon=function(){var my=G,r=w0.apply(this,arguments);
    try{if(my&&my.krm===undefined){my.krm=wantWin(my)?1:0;if(my.krm){z().w=day();sv();st('show','win');}}
      if(my&&my.krm)put(my,'win');}catch(e){}
    return r;};}
  if(typeof endlessOver==='function'){var e0=endlessOver;endlessOver=function(){var my=G,prev=S.best||0,r=e0.apply(this,arguments);
    try{if(my&&my.krm===undefined){var c=el('mcard');my.krm=my.mode==='endless'&&my.st&&my.st.score>prev&&prev>0&&!my.chl&&(+S.games||0)>=10&&c&&!c.querySelector('.ntf')&&due()?1:0;
        if(my.krm){z().w=day();sv();st('show','rec');}}
      if(my&&my.krm)put(my,'rec');}catch(e){}
    return r;};}

  (function(){if(el('krmCss'))return;var c=document.createElement('style');c.id='krmCss';c.textContent=
    '.krm-mail h2{margin:0 0 6px}.krm-say{font-size:17px;line-height:1.35;margin:0 0 10px}'+
    '.krm-top{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 8px}'+
    '.krm-chip{font:inherit;font-size:15px;font-weight:700;min-height:44px;padding:6px 12px;border-radius:999px;border:2px solid #c9c2ae;background:#fff;color:#2b2a26;cursor:pointer}'+
    '.krm-chip.on{border-color:#2f7d32;background:#2f7d32;color:#fff}'+
    '.krm-txt{display:block;box-sizing:border-box;width:100%;min-height:110px;max-height:34vh;padding:10px 12px;border-radius:12px;border:2px solid #c9c2ae;font:inherit;font-size:17px;resize:vertical;background:#fff;color:#2b2a26;-webkit-user-select:text;user-select:text}'+
    '.krm-txt:focus{outline:none;border-color:#2f7d32}'+
    '.krm-cnt{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin:6px 0 6px;font-size:14px;text-align:left}.krm-cnt b{white-space:nowrap}'+
    '.krm-ab{display:block;width:100%;margin:6px 0 8px;text-align:left}.krm-ab small{display:block;font-weight:500;font-size:14px;opacity:.75}'+
    '.krm-win{margin:6px 0 0;text-align:center}.krm-link{font:inherit;font-size:16px;font-weight:700;min-height:44px;padding:6px 10px;border:0;background:none;color:#1d5fb8;text-decoration:underline;cursor:pointer}'+
    '@media (max-height:600px){.krm-say{font-size:15px;margin-bottom:6px}.krm-txt{min-height:80px}}';
    (document.head||document.documentElement).appendChild(c);})();
  window.KRMAIL={open:open,send:send,scrub:scrub,due:due,_z:z,_day:day};
})();
