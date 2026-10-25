/* vy-mail — «✉️ Написать бабе Шуре» (письма 24.10, образец — Зина: slovo/js/zb2-mail.js + zb2-mail-ui.js; журнал hobby-analytics/release-i/letters-2410/LTG-VY.md).
   Входы: ⚙ → «Об игре» (строка-кнопка, обёртка openAbout) и окно победы — раз в 7 дней, с 15-го двора, обычный двор (не задание дня, не режим,
   не новая машина, не пройденный регион, не когда в окне «Перекур»/финал Автодрома или вопрос про напоминания). Поле сохранения S.vml {w,n,d}
   (w — день показа в окне победы, n — писем, d — день письма) — через UI.onSave: старое сохранение без поля получает {0,0,0}, облако — максимум.
   Статистика (общий STAT): mail {a:show|open|send|cancel, f:about|win, l:пройдено дворов, на send n:длина, k:тема} и куски fb {m ≤ 40, n, of, k, l}
   (STAT режет строки до 40). Текст ≤ 500, ссылки/домены/почта/ники → [ссылка]/[почта], телефоны (≥ 7 цифр) → #. Не чаще раза в 20 с.
   Все кнопки окна — noenter: обработчик клавиш index.html жмёт первую .btn без noenter на Enter и ПРОБЕЛ даже из поля ввода.
   Площадки: Яндекс (RU/EN через L), VK, ОК — одинаково. Старый синтаксис (var/function); не загрузился файл — игра как раньше. */
(function(){
  'use strict';
  var W=window,MAX=500,CH=40,sentT=0,KEYS=['w','n','d'];
  function $(id){return document.getElementById(id);}
  function Lx(ru,en){try{return L(ru,en);}catch(e){return ru;}}
  function Sv(){try{return typeof S!=='undefined'?S:null;}catch(e){return null;}}
  function z(){var s=Sv();if(!s)return {w:0,n:0,d:0};if(!s.vml||typeof s.vml!=='object')s.vml={w:0,n:0,d:0};return s.vml;}
  function fix(s){if(!s)return;var v=s.vml;if(!v||typeof v!=='object'||Array.isArray(v))v=s.vml={};
    KEYS.forEach(function(k){v[k]=Math.max(0,Math.floor(+v[k]||0));});}
  function merge(d){var s=Sv();if(!s)return;fix(s);var c=d&&d.vml;if(!c||typeof c!=='object')return;
    KEYS.forEach(function(k){s.vml[k]=Math.max(+s.vml[k]||0,Math.floor(+c[k]||0));});}
  try{if(W.UI&&UI.onSave)UI.onSave({id:'vml',keys:['vml'],fix:function(s){fix(s||Sv());},merge:function(S0,d){merge(d);}});}catch(e){}
  function day(){var t=Date.now();return Math.floor((t-new Date(t).getTimezoneOffset()*6e4)/864e5);}
  function lvl(){var s=Sv();return s?Math.max(0,(+s.unlocked||1)-1):0;}
  function st(a,f,x){try{var o={a:a,f:f,l:lvl()};if(x)for(var k in x)if(x[k]!==undefined&&x[k]!=='')o[k]=x[k];STAT.ev('mail',o);}catch(e){}}
  function tap(){try{SND.tap();}catch(e){}}
  function sv(){try{save();}catch(e){}}

  // ---- чистка текста: ничего личного в статистику ----
  function scrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f\u007f]+/g,' ');
    t=t.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g,'[почта]')
       .replace(/(?:https?:\/\/|www\.)\S+/gi,'[ссылка]')
       .replace(/(^|[^0-9a-zа-яё_@.\-])((?:[0-9a-zа-яё\-]+\.)+(?:ru|рф|com|net|org|su|me|io|рус|info|online|site|pro|by|kz|ua)(?:[\/:?#]\S*)?)(?![0-9a-zа-яё])/gi,'$1[ссылка]')
       .replace(/(^|\s)@[0-9a-z_]{3,}/gi,'$1[ссылка]')
       .replace(/\+?\d[\d\s().\-]{5,}\d/g,function(m){return m.replace(/\D/g,'').length>=7?'#':m;});
    return t.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').slice(0,MAX);}
  function send(txt,o){var t=scrub(txt),i,n=0,l=lvl();if(!t)return 0;
    if(Date.now()-sentT<20e3)return -1;sentT=Date.now();o=o||{};
    st('send',o.f,{n:t.length,k:o.k||undefined});
    for(i=0;i<t.length;i+=CH)n++;
    for(i=0;i<n;i++){var p={m:t.slice(i*CH,i*CH+CH),n:i+1,of:n};if(!i){if(o.k)p.k=o.k;p.l=l;}try{STAT.ev('fb',p);}catch(e){}}
    try{if(W.STAT&&STAT.flush)STAT.flush();}catch(e){}
    return n;}

  var TOP=[['like','👍 Хвалю','👍 Praise'],['bug','🐞 Ошибка','🐞 Bug'],['idea','💡 Идея','💡 Idea'],['yard','🚗 Про дворы','🚗 About yards']];
  css();
  // f — откуда ('about'|'win'); back — чем вернуться (без него — закрыть окно)
  function open(f,back){f=f==='win'?'win':'about';var k='',sent=0;
    try{STAT.screen('mail');}catch(e){}st('open',f);
    var sh=function(t){try{return shura(t);}catch(e){return '<p class="vml-say">'+t+'</p>';}};
    modal('<div class="vml"><h2>'+Lx('✉️ Письмо бабе Шуре','✉️ A letter to Granny Shura')+'</h2>'+
      sh(Lx('Пиши как есть: что нравится, что не так, какой двор замучил. Я всё прочитаю — на лавочке, с очками.','Write as it is: what you like, what’s wrong, which yard drove you mad. I’ll read it all — on my bench, with my glasses on.'))+
      '<div class="vml-top">'+TOP.map(function(t){return '<button class="vml-chip noenter" data-k="'+t[0]+'">'+Lx(t[1],t[2])+'</button>';}).join('')+'</div>'+
      '<textarea id="vmlTxt" class="vml-txt" maxlength="'+MAX+'" rows="5" placeholder="'+Lx('Дорогая баба Шура, …','Dear Granny Shura, …')+'"></textarea>'+
      '<div class="vml-cnt"><small>'+Lx('Имя, телефон и почту не пиши — я тебя и так узнаю.','Don’t write your name, phone or email — I’ll know it’s you anyway.')+'</small><b id="vmlCnt">0 / '+MAX+'</b></div>'+
      '<div class="row"><button class="btn green noenter" id="vmlSend" disabled>'+Lx('Отправить ✉️','Send ✉️')+'</button><button class="btn sec noenter" id="mCancel">'+Lx('Не сейчас','Not now')+'</button></div></div>');
    try{if(W.STATVY&&STATVY.wnd)STATVY.wnd('mail');}catch(e){}
    var ta=$('vmlTxt'),bs=$('vmlSend'),cn=$('vmlCnt');
    function upd(){var n=ta.value.replace(/^\s+|\s+$/g,'').length;cn.textContent=Math.min(ta.value.length,MAX)+' / '+MAX;bs.disabled=n<2;}
    ta.oninput=upd;
    var chips=[].slice.call(document.querySelectorAll('#mcard .vml-chip'));
    chips.forEach(function(b){b.onclick=function(){tap();var on=!b.classList.contains('on');
      chips.forEach(function(x){x.classList.remove('on');});if(on)b.classList.add('on');k=on?b.getAttribute('data-k'):'';};});
    function done(){if(back)back();else try{hideModal();}catch(e){}}
    $('mCancel').onclick=function(){tap();if(!sent)st('cancel',f);done();};
    bs.onclick=function(){tap();var r=0;try{r=send(ta.value.slice(0,MAX),{f:f,k:k});}catch(e){r=1;}
      if(r===-1){try{toast(Lx('Письмо только что ушло — подожди минутку','Your letter just went out — wait a minute'),3500);}catch(e){}return;}
      if(!r)return;sent=1;var v=z();v.n=(+v.n||0)+1;v.d=day();sv();
      modal('<div class="vml vml-ok"><h2>'+Lx('Спасибо, прочитаем!','Thank you, we’ll read it!')+'</h2>'+
        sh(Lx('Письмо у меня в кармане фартука. Лично ответить не смогу, но прочитаю всё — и дворнику передам, что надо подправить.','Your letter is in my apron pocket. I can’t answer personally, but I’ll read every word — and tell the caretaker what needs fixing.'))+
        '<div class="row"><button class="btn green noenter" id="vmlOk">'+Lx('Пожалуйста!','You’re welcome!')+'</button></div></div>');
      try{if(W.STATVY&&STATVY.wnd)STATVY.wnd('mail');}catch(e){}
      $('vmlOk').onclick=function(){tap();done();};};
    try{ta.focus({preventScroll:true});}catch(e){}
  }

  // ---- вход 1: «Об игре» ----
  function hook(){var oa=W.openAbout;if(typeof oa!=='function'||oa.__vml)return;
    var w=W.openAbout=function(){var r=oa.apply(this,arguments);try{addAbout();}catch(e){}return r;};w.__vml=1;}
  function addAbout(){var mc=$('mcard'),bk=$('abBack');if(!mc||!bk||$('abMail'))return;
    var p=document.createElement('div');p.className='vml-ab';
    p.innerHTML='<button class="btn noenter" id="abMail">'+Lx('✉️ Написать бабе Шуре','✉️ Write to Granny Shura')+'<small>'+Lx('похвалить, поругать, подсказать','praise, grumble or suggest')+'</small></button>';
    var first=mc.querySelector('p.about');if(first&&first.nextSibling)first.parentNode.insertBefore(p,first.nextSibling);else bk.parentNode.parentNode.insertBefore(p,bk.parentNode);
    $('abMail').onclick=function(){tap();open('about',function(){try{openAbout();}catch(e){try{hideModal();}catch(_){}}});};}
  hook();

  // ---- вход 2: окно победы, раз в 7 дней ----
  function want(c){if(!c||c.daily||c.newCar||c.regionDone||(c.mode&&c.mode!=='n'))return false;
    if((+c.lv||0)<15||lvl()<15||W.__demo)return false;
    try{if(W.SOC&&SOC.ntfDue&&SOC.ntfDue())return false;}catch(e){}
    var v=z(),d=day();return d-v.w>=7&&d-v.d>=7;}
  var BUSY=['vymg-perekur','vypark-fin'];
  if(W.winSlots)winSlots.push({id:'vml',order:90,zone:'extra',fit:3,
    render:function(c){return want(c)?'<p class="vml-win"><button class="vml-link noenter" id="vmlWin" data-st="mail">'+Lx('✉️ Напиши бабе Шуре пару слов','✉️ Drop Granny Shura a line')+'</button></p>':null;},
    mount:function(root){var b=root&&root.querySelector('#vmlWin');if(!b)return;
      // решаем после fitWin и вопроса про напоминания: не влезло или в окне уже что-то важное — строку убираем и не считаем показ
      setTimeout(function(){if(!b.isConnected){W.VYMAIL.last='fit';return;}var mc=$('mcard'),busy=false;
        BUSY.forEach(function(id){var e=mc&&mc.querySelector('[data-slot="'+id+'"]');if(e&&e.textContent.replace(/\s+/g,''))busy=true;});
        if(mc&&mc.querySelector('.soc, #socNtf'))busy=true;
        var w=b.closest?b.closest('[data-slot]'):null;if(busy){W.VYMAIL.last='busy';if(w)w.remove();else b.remove();return;}W.VYMAIL.last='shown';
        z().w=day();sv();st('show','win');},0);
      b.onclick=function(){tap();var mc=$('mcard'),mo=$('modal');if(!mc)return;
        // окно победы не перерисовываем (награда уже выдана): прячем его узлы и возвращаем как были — с обработчиками
        var frag=document.createDocumentFragment(),cls=mc.className,top=mo?mo.scrollTop:0;while(mc.firstChild)frag.appendChild(mc.firstChild);
        open('win',function(){mc.innerHTML='';mc.className=cls;mc.appendChild(frag);try{modal.k=null;}catch(e){}
          var x=$('vmlWin');if(x){var w=x.closest?x.closest('[data-slot]'):null;if(w)w.remove();else x.remove();}
          if(mo)mo.scrollTop=top;});};}});

  function css(){if($('vmlCss'))return;var c=document.createElement('style');c.id='vmlCss';c.textContent=
    '.vml h2{margin:0 0 6px}.vml .shura .sb{font-size:16px}.vml-say{font-size:16px;margin:0 0 10px}'+
    '.vml-top{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px 0 8px}'+
    '.vml-chip{font:inherit;font-size:15px;font-weight:700;min-height:44px;padding:6px 12px;border-radius:999px;border:2px solid #e3d9c6;background:#fff;color:#2d3436;cursor:pointer}'+
    '.vml-chip.on{border-color:#2b8a3e;background:#2b8a3e;color:#fff}'+
    '.vml-txt{display:block;box-sizing:border-box;width:100%;min-height:110px;max-height:34vh;padding:10px 12px;border-radius:12px;border:2px solid #e3d9c6;font:inherit;font-size:16px;line-height:1.35;resize:vertical;background:#fff;color:#2d3436;text-align:left;-webkit-user-select:text;user-select:text}'+
    '.vml-txt:focus{outline:none;border-color:#2b8a3e}'+
    '.vml-cnt{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin:6px 0 2px;font-size:14px;text-align:left;color:#57606f}.vml-cnt b{white-space:nowrap}'+
    '.vml .btn{min-height:48px;font-size:17px}.vml .btn[disabled]{opacity:.55}'+
    '.vml-ab{margin:10px 0 4px}.vml-ab .btn{width:100%;min-height:52px;font-size:17px;line-height:1.2}.vml-ab small{display:block;font-size:13.5px;font-weight:500;opacity:.75;margin-top:2px}'+
    '.vml-win{margin:6px 0 0;text-align:center}.vml-link{font:inherit;font-size:15.5px;font-weight:700;min-height:44px;padding:6px 10px;border:0;background:none;color:#2563c9;text-decoration:underline;cursor:pointer}'+
    '@media (max-height:600px){.vml .shura{margin:2px 0 4px}.vml-txt{min-height:80px}.vml-top{margin-bottom:4px}}';
    (document.head||document.documentElement).appendChild(c);}

  W.VYMAIL={open:open,send:send,scrub:scrub,_z:z,_day:day,_want:want};
})();
