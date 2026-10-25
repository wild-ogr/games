'use strict';
/* mlm-mail (24.10, LTG-VK; образец — «Баба Зина» js/zb2-mail.js + zb2-mail-ui.js): окно «Написать Михалычу».
   Входы: «ℹ Об игре» (f:'about'), окно итога пройденной лестницы с 15-го уровня раз в 7 дней (f:'win').
   Метка S.mlm {w — день показа в итоге, n — писем, d — день письма} (NUMOBJ: в облаке — максимум по полям; старое сохранение → {}).
   STAT: mail {a:show|open|send|cancel, f, l:S.lvl, на send n:длина, k:тема, q:id вопроса (тема «Про вопрос»)} + куски fb {m ≤ 40, n, of, k, l}.
   Текст ≤ 500 знаков, ссылки/домены/почта/телефоны вычищаются; не чаще раза в 20 с. Тексты — по-русски на всех площадках (LANG всегда 'ru'). */
(function(){
  var W=window,MAX=500,CH=40,sentT=0,lastQ='',FORCE=/[?&]mail=1/.test(location.search)&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  function el(id){return document.getElementById(id);}
  function tap(){try{SND.tap();}catch(e){}}
  function lvl(){return +S.lvl||0;}
  function z(){if(!S.mlm||typeof S.mlm!=='object'||Array.isArray(S.mlm))S.mlm={};var v=S.mlm;['w','n','d'].forEach(function(k){v[k]=Math.max(0,Math.floor(+v[k]||0));});return v;}
  function day(){var t=nowMs();return Math.floor((t-new Date(t).getTimezoneOffset()*6e4)/864e5);}
  function st(a,f,o){try{var p={a:a,f:f,l:lvl()},k;for(k in o||{})if(o[k]!==undefined&&o[k]!=='')p[k]=o[k];STAT.ev('mail',p);}catch(e){}}
  function esc2(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

  // последний вопрос: идущая лестница/день/дуэль — текущий, иначе последний отвеченный
  if(!Array.isArray(W.answerHook))W.answerHook=[];
  W.answerHook.push({id:'mlm',fn:function(i){if(i&&i.id)lastQ=String(i.id);}});
  function qNow(){try{if(G&&G.qs&&!G.over&&G.qs[G.i]!=null)return String(G.qs[G.i]);}catch(e){}return lastQ;}

  function scrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f]+/g,' ');
    t=t.replace(/\b(?:https?:\/\/|www\.)\S+/gi,'[ссылка]').replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g,'[почта]').replace(/\S+@\S+\.\S+/g,'[почта]')
      .replace(/(?:[\wа-яё-]+\.)+(?:ru|рф|com|net|org|su|me|io|cc|info|online)(?![\wа-яё])(?:\/\S*)?/gi,'[ссылка]')
      .replace(/\+?\d[\d\s().-]{5,}\d/g,function(m){return m.replace(/\D/g,'').length>=7?'#':m;});
    return t.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').slice(0,MAX);}
  function send(txt,o){var t=scrub(txt),i,n=0,l=lvl();o=o||{};if(!t)return 0;
    if(Date.now()-sentT<20e3)return -1;sentT=Date.now();
    st('send',o.f,{n:t.length,k:o.k||undefined,q:o.k==='q'&&o.q?o.q:undefined});
    for(i=0;i<t.length;i+=CH)n++;
    for(i=0;i<n;i++)try{STAT.ev('fb',i?{m:t.slice(i*CH,i*CH+CH),n:i+1,of:n}:{m:t.slice(0,CH),n:1,of:n,k:o.k||undefined,l:l});}catch(e){}
    try{if(STAT.flush)STAT.flush();}catch(e){}
    return n;}

  // окно поверх текущего: содержимое карточки уносим целиком (с обработчиками) и возвращаем после письма
  function stash(){var c=el('mcard'),m=el('modal'),s={on:m.classList.contains('on'),cc:c.className,mc:m.className,kids:[]};
    while(c.firstChild)s.kids.push(c.removeChild(c.firstChild));return s;}
  function unstash(s){if(!s.on){hideModal();return;}var c=el('mcard'),m=el('modal');modal('');c.innerHTML='';
    s.kids.forEach(function(k){c.appendChild(k);});c.className=s.cc;m.className=s.mc;}

  var TOP=[['like','👍 Хвалю'],['bug','🐞 Ошибка'],['q','❓ Про вопрос'],['idea','💡 Идея']];
  function open(f,o){o=o||{};var k=o.k||'',sent=0,q=o.q||qNow(),back=stash();
    try{STAT.screen('mail');}catch(e){}st('open',f);
    modal('<div class="mlm"><h2>✉️ '+L('Письмо Михалычу','A letter to Mikhalych')+'</h2>'+
      '<p class="mlm-say">'+L('Пиши как есть, сосед: что нравится, что не так, в каком вопросе ошибка. Я всё прочитаю — между метлой и чаем.','Write as it is: what you like, what is wrong. I read everything.')+'</p>'+
      '<div class="mlm-top">'+TOP.map(function(t){return '<button class="mlm-chip noenter'+(t[0]===k?' on':'')+'" data-k="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div>'+
      '<p class="mlm-q" id="mlmQ"'+(k==='q'&&q?'':' hidden')+'>'+L('Номер вопроса приложу к письму: ','Question number attached: ')+'<b>№ '+esc2(q)+'</b></p>'+
      '<textarea id="mlmTxt" class="mlm-txt" maxlength="'+MAX+'" rows="5" placeholder="'+L('Михалыч, тут такое дело…','Mikhalych, here is the thing…')+'"></textarea>'+
      '<div class="mlm-cnt"><small>'+L('Имя, телефон и почту не пиши — письмо и так дойдёт.','Do not write your name, phone or e-mail.')+'</small><b id="mlmCnt">0 / '+MAX+'</b></div>'+
      '<div class="row"><button class="btn green" id="mlmSend" disabled>'+L('Отправить','Send')+' ✉️</button><button class="btn" id="mCancel">'+L('Не сейчас','Not now')+'</button></div></div>');
    var ta=el('mlmTxt'),bs=el('mlmSend'),cn=el('mlmCnt'),qq=el('mlmQ');
    function upd(){cn.textContent=Math.min(ta.value.length,MAX)+' / '+MAX;bs.disabled=ta.value.replace(/^\s+|\s+$/g,'').length<2;}
    ta.oninput=upd;ta.addEventListener('keydown',function(e){e.stopPropagation();}); // Enter/пробел в поле — текст, а не «нажать кнопку окна»
    [].slice.call(document.querySelectorAll('#mcard .mlm-chip')).forEach(function(b){b.onclick=function(){tap();
      var on=!b.classList.contains('on');[].slice.call(document.querySelectorAll('#mcard .mlm-chip')).forEach(function(x){x.classList.remove('on');});
      if(on)b.classList.add('on');k=on?b.getAttribute('data-k'):'';qq.hidden=!(k==='q'&&q);};});
    function done(){unstash(back);}
    el('mCancel').onclick=function(){tap();if(!sent)st('cancel',f);done();};
    bs.onclick=function(){tap();var r=0;try{r=send(ta.value.slice(0,MAX),{f:f,k:k,q:q});}catch(e){r=1;}
      if(r===-1){try{toast(L('Михалыч ещё читает прошлое письмо — подожди минутку','Please wait a minute'),3500);}catch(e){}return;}
      if(!r)return;sent=1;var v=z();v.n++;v.d=day();try{save();}catch(e){}
      modal('<div class="mlm mlm-ok"><div class="av">'+portrait('mihalych','happy')+'</div><h2>'+L('Спасибо, прочитаем!','Thank you, we will read it!')+'</h2>'+
        '<p class="mlm-say">'+L('Письмо у Михалыча. Лично ответить не смогу, но каждое письмо прочитаю — и про вопросы, и про двор.','Mikhalych has your letter. I cannot reply personally, but I read every letter.')+'</p>'+
        '<div class="row"><button class="btn green" id="mlmOk">'+L('Пожалуйста!','You are welcome!')+'</button></div></div>');
      el('mlmOk').onclick=function(){tap();done();};};
    if(W.LK&&LK.on&&LK.on()&&LK.scan)try{LK.scan(el('mcard'));}catch(e){}}

  // 1) «Об игре»
  var oa=W.openAbout;if(typeof oa==='function')W.openAbout=function(){oa.apply(this,arguments);var bk=el('abBack'),row=bk&&bk.parentNode;if(!row||el('abMail'))return;
    var p=document.createElement('div');p.className='mlm-ab';p.innerHTML='<button class="btn noenter" id="abMail">✉️ '+L('Написать Михалычу','Write to Mikhalych')+'<small>'+L('похвалить, поругать, подсказать','praise, complain, suggest')+'</small></button>';
    row.parentNode.insertBefore(p,row);el('abMail').onclick=function(){tap();open('about');};};

  // 2) окно итога пройденной лестницы: с 15-го уровня, раз в 7 дней, не в «полном» окне и не рядом с вопросом про напоминания
  function want(c){if(FORCE)return true;if(W.__demo||!c||!c.pass||!c.G||c.G.mode!=='lad'||lvl()<15)return false;
    if(c.G.newM&&c.G.newM.length)return false;try{if(W.CAR&&CAR.hasNews())return false;}catch(e){}
    var v=z(),d=day();return d-v.w>=7&&d-v.d>=7;}
  if(!Array.isArray(W.resultSlots))W.resultSlots=[];
  W.resultSlots.push({id:'mlm-mail',order:90,render:function(c){return want(c)?'<p class="mlm-win"><button class="mlm-link noenter" id="mlmWin">✉️ '+L('Напиши Михалычу пару слов','Write Mikhalych a few words')+'</button></p>':null;},
    mount:function(box){var b=box.querySelector('#mlmWin');if(!b)return;
      // показ засчитываем после подгонки окна: не влезло без прокрутки или рядом вопрос «🔔 Напоминать» — убираем, неделя не тратится
      setTimeout(function(){var md=el('modal'),c=el('mcard');if(!FORCE&&(md.scrollHeight>md.clientHeight+1||(c&&c.querySelector('.soc-o.ntf')))){box.style.display='none';return;}
        z().w=day();try{save();}catch(e){}st('show','win');},0);
      b.onclick=function(){tap();open('win');};}});

  (function(){if(el('mlmCss'))return;var c=document.createElement('style');c.id='mlmCss';c.textContent=
    '.mlm h2{margin:0 0 6px}.mlm-say{font-size:16px;margin:0 0 10px;line-height:1.35}'+
    '.mlm-top{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 8px}'+
    '.mlm-chip{font:inherit;font-size:15px;font-weight:700;min-height:44px;padding:6px 12px;border-radius:999px;border:2px solid #c9cfe0;background:#fff;color:#27324a;cursor:pointer}'+
    '.mlm-chip.on{border-color:#2563c9;background:#2563c9;color:#fff}'+
    '.mlm-q{margin:0 0 8px;font-size:14.5px}'+
    '.mlm-txt{display:block;box-sizing:border-box;width:100%;min-height:110px;max-height:34vh;padding:10px 12px;border-radius:12px;border:2px solid #c9cfe0;font:inherit;font-size:17px;resize:vertical;background:#fff;color:#27324a;-webkit-user-select:text;user-select:text}'+
    '.mlm-txt:focus{outline:none;border-color:#2563c9}'+
    '.mlm-cnt{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin:6px 0 8px;font-size:14px;text-align:left}.mlm-cnt b{white-space:nowrap}'+
    '.mlm .row .btn{min-height:48px}'+
    '.mlm-ab{margin:10px 0 4px}.mlm-ab .btn{width:100%;min-height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.mlm-ab small{font-size:13.5px;font-weight:400;opacity:.8}'+
    '.mlm-win{margin:6px 0 0;text-align:center}.mlm-link{font:inherit;font-size:15px;font-weight:700;min-height:44px;padding:6px 10px;border:0;background:none;color:#2563c9;text-decoration:underline;cursor:pointer}'+
    '@media (max-height:600px){.mlm-say{font-size:15px;margin-bottom:6px}.mlm-txt{min-height:80px}}'+
    '@media (max-height:440px){.mlm-say{display:none}.mlm h2{font-size:19px;margin-bottom:4px}.mlm-chip{min-height:40px;padding:4px 10px;font-size:14px}.mlm-txt{min-height:64px}.mlm-cnt{margin:4px 0}}';  // открыта клавиатура
    (document.head||document.documentElement).appendChild(c);})();
  W.MLM={open:open,send:send,scrub:scrub,_z:z,_day:day,_q:qNow};
})();
