/* ===== bb2-vkt-x.js — VKT (супер-буст в2, 14.10.2026), набор 'vkt': догружается в меню у всех (BB2.late) и по кнопке Челобитной.
   ЗАГЛУШКА js/bb2-vkt.js (на старте, первой после bb2-eco.js): флаги pult, mail, vkm2; кэш пульта localStorage bb2pult применяется сразу (off — BB2.off, n — числа BB2E того же вида,
   раздел rules не трогается); BB2.pult('путь',запасное) — свободные данные пульта (поле x) для потоков; весть пульта (msg) — первой строкой «Утра» (крючок utroRow);
   кнопка «✉️ Челобитная князю Владимиру» в ⚙; в ОК — строка «Поддержка» со ссылкой на группу ОК в «Благодарностях» (правила ОК п. 1.6).
   1) «Челобитная князю Владимиру» (флаг mail; образец — «Написать бабе Зине», slovo js/zb2-mail*.js; доводка 24.10, ветка mail2410): текст ≤ 500 знаков
      (ссылки, «голые» домены, ники, почта, телефоны вычищаются), 4 темы, не чаще раза в 20 с. Входы: ⚙ (f:'about') и ссылка в итогах похода (f:'win'|'lose', раздел 1а).
      Поле S.bb2.vkt {w,n,d} (заглушка). Уходит через STAT: mail {a:'show'|'tap'|'open'|'cancel'|'send', f, l — глав пройдено; на send ещё n,k,i,pp,rp} + куски fb {m ≤ 40,n,of,k,l,i} (stat/letters.py, report.py),
      «паспорт» mailp {i,c,h,pw,r1,r2,r3,dv} — глава, сила, три последних похода, кадры/с, устройство (без личных данных; игрок видит, что приложено, и может снять галочку),
      запись последнего похода (REPLAY, если есть) mailr {i,n,of,m1…m5} кусками по 200 знаков. i — метка письма (склеить всё одного письма).
   2) Счётчики миссий VK новинок буста (флаг vkm2): VKM_CNT.b(ключ) — по S.bb2.<поток> (условия — tools/missions.py, линия «буст»). Только VK. Без ?. ?? .finally */
(function(){
  var V=BB2.vkt;if(!V||V.mail)return;
  var MAX=500,CH=40,sentT=0,ls=window.localStorage;
  function el(id){return document.getElementById(id);}
  function click(){try{SND.click();}catch(e){}}
  function rj(k){try{return JSON.parse(ls.getItem(k)||'null');}catch(e){return null;}}
  function day(){var t=Date.now();return Math.floor((t-new Date(t).getTimezoneOffset()*6e4)/864e5);}
  function vs(){var v=BB2.s('vkt');VKF.forEach(function(k){v[k]=Math.max(0,Math.floor(+v[k]||0));});return v;}var VKF=['w','n','d'];
  /* ---------- 0. последние 3 похода для «паспорта» (localStorage bb2vkt): глава, сложность, исход, время, одолено, уровень, кадров/с, сила и нужная сила ---------- */
  var fc=0,ft=0,pw=0;
  BB2.hook('run',function(){fc=0;ft=0;try{pw=powerNow();}catch(e){pw=0;}},90);
  BB2.hook('frame',function(dt){if(dt>0&&dt<.25){fc++;ft+=dt;}});
  BB2.hook('end',function(g,w){var a=rj('bb2vkt'),r;if(!Array.isArray(a))a=[];r={c:g.chi,d:g.dif||'n',w:w?1:0,t:Math.round(g.t||0),k:g.kills|0,l:g.hero&&g.hero.lvl|0,f:ft>3?Math.round(fc/ft):0,p:pw};
    try{r.q=mapPw(g.chi,r.d);}catch(e){}if(g.endless)r.e=1;if(g.daily)r.y=1;try{if(BB2.rp&&BB2.rp.key)r.rk=BB2.rp.key(g);}catch(e){}a.unshift(r);try{ls.setItem('bb2vkt',JSON.stringify(a.slice(0,3)));}catch(e){};},90);
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  /* чистка как у Зины + «голые» домены и мессенджеры (vk.com/…, t.me/…, ok.ru, что-то.рф) → [ссылка], ники @… → [ссылка], почта → [почта], телефоны (≥ 7 цифр) → # */
  var DOM=/(^|[^\w@.\-\/а-яё])((?:[a-zа-яё0-9](?:[a-zа-яё0-9\-]*[a-zа-яё0-9])?\.)+(?:ru|рф|рус|su|com|net|org|me|io|info|ua|by|kz|cc|ly|gg|app|site|online|xyz|tk|link|pro|biz|club|shop|tv)(?:[\/:?#][^\s,;!»"')]*)?)(?=$|[^\w\-а-яё])/gi;
  function scrub(t){t=String(t==null?'':t).replace(/[\u0000-\u001f]+/g,' ');
    t=t.replace(/\b(?:https?:\/\/|www\.)\S+/gi,'[ссылка]').replace(/\S+@\S+\.\S+/g,'[почта]').replace(DOM,'$1[ссылка]').replace(/(^|\s)@[\w.]{3,}/g,'$1[ссылка]') // i18n:ru — метки в тексте письма для статистики, игроку не показываются
      .replace(/(?:\+?\d[\d\s()-]{5,}\d)/g,'#');
    return t.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').slice(0,MAX);}
  function ev(n,p){try{STAT.ev(n,p);}catch(e){}}
  function nDone(){var n=0,k;for(k in S.done||{})if(S.done[k])n++;return n;}
  function dev(){var u=navigator.userAgent||'',o=/iPhone|iPad|iPod/.test(u)?'ios':/Android/.test(u)?'and':/Mac/.test(u)?'mac':/Win/.test(u)?'win':'oth',
    m=navigator.deviceMemory,c=navigator.hardwareConcurrency;return o+' '+(screen.width||0)+'x'+(screen.height||0)+(m?' m'+m:'')+(c?' c'+c:'')+' '+innerWidth+'x'+innerHeight;}
  function runs(){var a=rj('bb2vkt');return Array.isArray(a)?a.slice(0,3):[];}
  function rs(r){return (r.e?'E':r.y?'D'+r.c:r.c+r.d)+' '+(r.w?'W':'L')+' '+Math.floor(r.t/60)+':'+('0'+r.t%60).slice(-2)+' k'+r.k+' v'+r.l+' f'+r.f+' p'+r.p+(r.q?'/'+r.q:'');}
  /* паспорт: что видит игрок и что уходит */
  function pass(){var a=runs(),h=S.hero||'',p=0,o;try{p=powerNow();}catch(e){}
    o={c:nDone(),h:String(h).slice(0,12),pw:p,dv:dev().slice(0,40)};if(a[0])o.r1=rs(a[0]).slice(0,40);if(a[1])o.r2=rs(a[1]).slice(0,40);if(a[2])o.r3=rs(a[2]).slice(0,40);return o;}
  function passTxt(){var a=runs(),r=a[0],u=navigator.userAgent||'',p=0,t;try{p=powerNow();}catch(e){}
    t=L('пройдено глав: ','chapters done: ')+nDone()+', '+L('сила ','power ')+p;
    if(r)t+=', '+L('последний поход: ','last run: ')+(r.w?L('победа','win'):L('поражение','loss'))+(r.q?', '+L('нужная сила ','recommended ')+r.q:'')+(r.f?', '+r.f+L(' кадров/с',' fps'):'');
    return t+', '+(/iPhone|iPad/.test(u)?'iPhone':/Android/.test(u)?'Android':L('компьютер','computer'))+(a.length>1?L(' и ещё '+(a.length-1)+' '+(a.length===2?'поход':'похода'),' and '+(a.length-1)+' more runs'):'');}
  function rpLast(cb){var a=runs(),k=a[0]&&a[0].rk;if(!k||!BB2.after||!BB2.on('rec')||!BB2.rp){cb('');return;}
    try{BB2.after('rp',function(){var r=null;try{r=BB2.rp.last(k);cb(r?String(BB2.rp.pack(r)||'').slice(0,2400):'');}catch(e){cb('');}});}catch(e){cb('');}}
  function send(txt,o){var t=scrub(txt),i,n=0,id=Math.random().toString(36).slice(2,7),p;if(t.length<2)return 0;
    if(Date.now()-sentT<20e3)return -1;sentT=Date.now();o=o||{};
    for(i=0;i<t.length;i+=CH)n++;
    ev('mail',{a:'send',f:o.f||'',l:nDone(),n:t.length,k:o.k||'',i:id,pp:o.pp?1:0,rp:o.rp?o.rp.length:0});
    for(i=0;i<n;i++){p={m:t.slice(i*CH,i*CH+CH),n:i+1,of:n,i:id};if(!i){if(o.k)p.k=o.k;p.l=nDone();}ev('fb',p);}
    if(o.pp){p=pass();p.i=id;ev('mailp',p);}
    if(o.rp){var R=200,m=Math.ceil(o.rp.length/R),j,q;for(j=0;j<m;j++){q={i:id,n:j+1,of:m};for(i=0;i<5;i++)q['m'+(i+1)]=o.rp.substr(j*R+i*CH,CH);ev('mailr',q);}}
    try{if(STAT.flush)STAT.flush();}catch(e){}
    return n;}
  var TOP=[['like',L('👍 Хвалю','👍 Praise')],['bug',L('🐞 Ошибка','🐞 Bug')],['idea',L('💡 Идея','💡 Idea')],['hard',L('⚔ Трудно','⚔ Too hard')]];
  function css(){if(el('vktCss'))return;var c=document.createElement('style');c.id='vktCss';c.textContent=
    '.vkm-say{font-size:15.5px;margin:0 0 10px;text-align:left}.vkm-top{display:flex;flex-wrap:wrap;justify-content:center;margin:0 0 8px}.vkm-top button{margin:3px}'+
    '.vkm-chip{font:inherit;font-size:14.5px;font-weight:700;min-height:44px;padding:6px 12px;border-radius:999px;border:2px solid #b89a6a;background:#fff8e8;color:#4a2f14;cursor:pointer}'+
    '.vkm-chip.on{border-color:#a3271c;background:#a3271c;color:#fff}'+
    '.vkm-txt{display:block;box-sizing:border-box;width:100%;min-height:104px;max-height:30vh;padding:10px 12px;border-radius:12px;border:2px solid #b89a6a;font:inherit;font-size:16px;resize:vertical;background:#fff;color:#2a1c0c;-webkit-user-select:text;user-select:text}'+
    '.vkm-txt:focus{outline:none;border-color:#a3271c}.vkm-cnt{display:flex;justify-content:space-between;align-items:flex-start;margin:6px 0 4px;font-size:13px;text-align:left}.vkm-cnt b{white-space:nowrap;margin-left:8px}'+
    '.vkm-pp{display:flex;gap:8px;align-items:flex-start;text-align:left;font-size:13px;margin:6px 0 0;cursor:pointer}.vkm-pp input{width:20px;height:20px;flex:none;margin:1px 0 0}'+
    '.vkm-win{width:100%;flex:1 1 100%;text-align:center}.vkm-link{font:inherit;font-size:15px;font-weight:700;min-height:44px;padding:4px 10px;margin:2px 0 0;border:0;background:none;color:#8a2a14;text-decoration:underline;cursor:pointer}'+
    '@media (max-height:720px){.vkm-say{font-size:14px;margin-bottom:4px}.vkm-top{margin-bottom:4px}.vkm-chip{min-height:40px;padding:4px 10px;font-size:13.5px}.vkm-txt{min-height:60px}.vkm-cnt{margin:4px 0 2px;font-size:12px}.vkm-pp{font-size:12px;margin-top:4px}}';
    (document.head||document.documentElement).appendChild(c);}
  /* f — откуда: about (⚙ — «Об игре» Богатыря) | win | lose (итоги похода); back(sent) — вернуть прежнее окно (без него — ⚙ или закрыть) */
  function open(f,back){css();f=f==='win'||f==='lose'?f:'about';var k=f==='lose'?'hard':'',sent=0,rp='';
    try{STAT.screen('mail');}catch(e){}ev('mail',{a:'open',f:f,l:nDone()});
    showModal('<h3>'+L('✉️ Челобитная князю Владимиру','✉️ A petition to Prince Vladimir')+'</h3>'+
      '<p class="vkm-say">'+(f==='lose'?L('Нечисть одолела? Расскажи князю, где было тяжко: какая глава, кто бил больнее всех. Князь читает каждую челобитную.',
        'Monsters won? Tell the Prince where it got tough: which chapter, who hit hardest. The Prince reads every petition.')
       :f==='win'?L('Славный поход! Расскажи князю, что по душе, что не так, чего в Руси не хватает. Князь читает каждую челобитную.',
        'A glorious run! Tell the Prince what you like, what is wrong, what Rus is missing. The Prince reads every petition.')
       :L('Пиши князю как есть: что по душе, что не так, чего в Руси не хватает. Каждую челобитную князь прочтёт — между пиром и советом.',
        'Write to the Prince straight: what you like, what is wrong, what Rus is missing. The Prince reads every petition — between a feast and a council.'))+'</p>'+
      '<div class="vkm-top">'+TOP.map(function(t){return '<button class="vkm-chip'+(t[0]===k?' on':'')+'" data-k="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div>'+
      '<textarea id="vkmTxt" class="vkm-txt" maxlength="'+MAX+'" rows="3" placeholder="'+L('Здрав будь, княже! …','Hail, my Prince! …')+'"></textarea>'+
      '<div class="vkm-cnt"><small>'+L('Имя, телефон и почту не пиши — гонец всё равно не запомнит. Ответить лично князь не сможет.','No name, phone or e-mail — the messenger forgets them anyway. The Prince cannot answer in person.')+'</small><b id="vkmCnt">0 / '+MAX+'</b></div>'+
      '<label class="vkm-pp"><input type="checkbox" id="vkmPp" checked><span>'+L('Приложить грамоту о походах: ','Attach a note about my runs: ')+esc(passTxt())+'.</span></label>'+
      '<label class="vkm-pp" id="vkmRpW" style="display:none"><input type="checkbox" id="vkmRp" checked><span>'+L('Приложить запись последнего похода (где ходил богатырь и сколько одолел).','Attach a recording of my last run (where the hero went and how many he defeated).')+'</span></label>'+
      '<div class="btns"><button class="btn ghost" id="vkmNo">'+L('Не сейчас','Not now')+'</button><button class="btn big" id="vkmSend" disabled>'+L('Отправить гонца ✉️','Send the messenger ✉️')+'</button></div>','mail');
    var ta=el('vkmTxt'),bs=el('vkmSend'),cn=el('vkmCnt');
    rpLast(function(s){rp=s;var w=el('vkmRpW');if(s&&w&&!sent)w.style.display='';});
    function upd(){var n=ta.value.replace(/^\s+|\s+$/g,'').length;cn.textContent=Math.min(ta.value.length,MAX)+' / '+MAX;bs.disabled=n<2;}
    ta.oninput=upd;
    var chips=[].slice.call(document.querySelectorAll('#mBody .vkm-chip'));
    chips.forEach(function(b){b.onclick=function(){click();var on=!b.classList.contains('on');chips.forEach(function(x){x.classList.remove('on');});
      if(on)b.classList.add('on');k=on?b.getAttribute('data-k'):'';};});
    function done(){if(back)back(sent);else if(f==='about'&&typeof openSettings==='function')openSettings();else hideModal();}
    el('vkmNo').onclick=function(){click();if(!sent)ev('mail',{a:'cancel',f:f,l:nDone()});done();};
    bs.onclick=function(){click();var r=0,pp=el('vkmPp'),rq=el('vkmRp'),w=el('vkmRpW');
      try{r=send(ta.value.slice(0,MAX),{f:f,k:k,pp:pp&&pp.checked,rp:rp&&rq&&rq.checked&&w&&w.style.display!=='none'?rp:''});}catch(e){r=1;}
      if(r===-1){try{toast(L('Гонец ещё в пути с прошлой челобитной — подожди минутку','The messenger is still on the road — wait a minute'));}catch(e){}return;}
      if(!r)return;sent=1;var v=vs();v.n=(+v.n||0)+1;v.d=day();try{save();}catch(e){}
      showModal('<h3>'+L('Гонец ускакал!','The messenger is off!')+'</h3><p class="vkm-say" style="text-align:center">'+
        L('Челобитная у князя. Владимир Красно Солнышко велел передать: «Спасибо, прочитаем! Лично ответить не смогу, но каждую челобитную прочту на совете».',
          'The petition is with the Prince. Vladimir the Fair Sun says: “Thank you, we will read it! I cannot answer in person, but I read every petition at the council.”')+
        '</p><div class="btns"><button class="btn big" id="vkmOk">'+L('Служу Руси!','I serve Rus!')+'</button></div>','mail');
      el('vkmOk').onclick=function(){click();done();};};
  }
  V.mail=open;V.send=send;V.scrub=scrub;V.pass=pass;

  /* ---------- 3. «Пульт владельца» (флаг pult): свежий pult.json. VK — с сайта (https://wild-ogr.github.io/games/bogatyr/pult.json; на самом сайте и стенде — рядом с игрой),
     Яндекс — из архива (внешние запросы там запрещены). Метка времени в адресе меняется раз в 10 мин. Удачный — в localStorage bb2pult (применится и при следующем запуске);
     off применяется сразу, только если не идёт поход (иначе — со следующего запуска); n и прочее — сразу. ?pult=0 — пульт выключен, ?pult=<адрес> — свой файл (стенд).
     Формат: {"v":1,"id":"метка","until":"ГГГГ-ММ-ДД"(после — файл не действует),"off":["флаг",…],"n":{"раздел.имя":число|[числа]},"msg":{"ic":"📜","t":"заголовок","s":"строка","until":"…"},"x":{…для потоков}}
     STAT pult {a:'ok'|'bad'|'net', id, s:код ответа}. ---------- */
  var lt=0;
  V.url=function(){var m=/[?&]pult=([^&#]+)/.exec(location.search);if(m)return m[1]==='0'?'':decodeURIComponent(m[1]);
    return typeof PLAT!=='undefined'&&PLAT==='vk'&&!/github\.io$|^localhost$|^127\./.test(location.hostname)?'https://wild-ogr.github.io/games/bogatyr/pult.json':'pult.json';};
  V.get=function(cb){var u=V.url(),x;if(!u||!BB2.on('pult'))return;lt=Date.now();try{x=new XMLHttpRequest();x.open('GET',/^data:/.test(u)?u:u+(u.indexOf('?')<0?'?':'&')+'t='+Math.floor(Date.now()/6e5));x.timeout=6000;
    x.onload=function(){var p=null,r=x.status===200&&String(x.responseText||'');if(r&&r.length<6000)try{p=JSON.parse(r);}catch(e){}
      BB2.stat('pult',{a:V.ok(p)?'ok':r?'bad':'net',id:p&&String(p.id||'').slice(0,16)||'',s:x.status});if(!V.ok(p))return;
      try{ls.setItem('bb2pult',JSON.stringify(p));}catch(e){}V.use(p,typeof G!=='undefined'&&!!G);if(cb)cb(p);};
    x.onerror=x.ontimeout=function(){BB2.stat('pult',{a:'net',s:0});};x.send();}catch(e){}};
  if(BB2.on('pult')&&V.url()){setTimeout(V.get,1500);BB2.hook('menu',function(){if(Date.now()-lt>18e5)V.get();});}

  /* ---------- 1а. Ссылка на Челобитную в итогах похода (победа или поражение в главе; f win|lose): с 15-го похода, раз в 7 дней (общий счёт для обоих)
     и не раньше 7 дней после письма; не в сече/походе дня/испытании недели и не когда в окне важное (открытия, кузница, Сложная, Забавы, «Друзья», мост).
     Ссылка — в прижатом к низу блоке кнопок (видна без прокрутки). До 24.10 кнопка стояла под «Подробнее», ниже края экрана: 40 показов — 0 нажатий.
     Решение — через кадр после окна (когда итоги дорисованы, в т. ч. предложение «Друзья»); перерисовка того же окна ссылку сохраняет.
     «Не сейчас»/«Служу Руси» возвращают то же окно итогов (узлы с обработчиками кнопок откладываются и ставятся обратно). ---------- */
  var BUSY='.unlock,.difbox,#rForge,#rZab,#rSocBox,#tlFin,#land';
  function want(g){if(!BB2.on('mail')||!g||g.endless||g.daily||g.weekly||(+S.runs||0)<15)return false;var v=vs(),d=day();return d-v.w>=7&&d-v.d>=7;}
  var rg=null,rOn=0,rF='win';
  function keep(m){var ns=[].slice.call(m.childNodes),w=m.getAttribute('data-w'),c=m.className,sc=m.scrollTop;
    return function(sent){m.innerHTML='';ns.forEach(function(n){m.appendChild(n);});m.setAttribute('data-w',w||'');m.className=c;el('modal').classList.add('on');m.scrollTop=sc;
      if(sent){rOn=0;var x=m.querySelector('#vktHdW');if(x)x.parentNode.removeChild(x);}};}
  function link(m){var bt=m.querySelector('.btns.stick')||m.querySelector('.btns'),d;if(!bt||m.querySelector('#vktHd'))return;css();
    d=document.createElement('div');d.className='bb2s vkm-win';d.id='vktHdW';
    d.innerHTML='<button class="vkm-link" id="vktHd">'+(rF==='win'?L('✉️ Напиши князю пару слов','✉️ Write the Prince a few words'):L('✍️ Трудно? Напиши князю','✍️ Too hard? Write to the Prince'))+'</button>';
    bt.appendChild(d);d.firstChild.onclick=function(){click();BB2.stat('mail',{a:'tap',f:rF,l:nDone()});open(rF,keep(m));};}
  function decide(g){var m=el('mBody');rOn=0;if(typeof G==='undefined'||G!==g||!m||m.getAttribute('data-w')!=='result'||!el('modal').classList.contains('on'))return;
    if(!want(g)||m.querySelector(BUSY))return;rOn=1;rF=BB2.win?'win':'lose';var v=vs();v.w=day();try{save();}catch(e){}
    BB2.stat('mail',{a:'show',f:rF,l:nDone()});link(m);}
  BB2.hook('modal',function(k,m){if(k!=='result'||typeof G==='undefined'||!G)return;
    if(rg!==G){rg=G;rOn=0;var g=G;setTimeout(function(){decide(g);},0);return;}
    if(rOn===1)link(m);});
  V.want=want;

  /* ---------- 2. Счётчики миссий VK новинок буста. Условие в missions.py: mf(код,'b',порог,…,arg='ключ'). Всё — из S.bb2 (облако сливает максимумом/объединением). ---------- */
  function o(v){return v&&typeof v==='object'?v:{};}
  function nk(v){var n=0,k;for(k in o(v))if(o(v)[k])n++;return n;}
  function b(k){return o(o(S.bb2)[k]);}
  var LOV=['uvern','dub','palica','ivpech','plecho','shchit','smorod','svist','bulavy','chuchela'];
  function sm(v){var n=0,k;for(k in o(v))n+=+o(v)[k]||0;return n;}
  function cn(v,f){var n=0,k;for(k in o(v))if(f(o(v)[k]))n++;return n;}
  function bits(x){var n=0;x=x|0;for(;x;x>>>=1)n+=x&1;return n;}
  function lv(m){var r=o(b('zab').r),n=0,i;for(i=0;i<LOV.length;i++)if((o(r[LOV[i]]).m|0)>=m)n++;return n;}
  var C={pdv:function(){return o(b('ev').p).k;},kup:function(){return o(b('ev').p).cn;},dary:function(){return o(b('ev').dary).n;},cal:function(){return o(b('ev').cal).sh;},
    shod:function(){return o(b('ev').shod).wins;},fhw:function(){return o(b('ev').fest).hw;},bp:function(){return b('byl').n;},
    sud:function(){return nk(b('sud').b);},sudmx:function(){var x=b('sud').b;return cn(x,function(v){return v&1;})&&cn(x,function(v){return v&2;})?1:0;},
    udar:function(){return b('hero').f;},umlv:function(){return sm(b('um').lv);},um5:function(){return cn(b('um').lv,function(v){return v>=5;});},
    chu:function(){return b('chudo').n;},chub:function(){return nk(b('chudo').b);},
    vowg:function(){return nk(b('tail').v);},vows:function(){return sm(b('tail').v);},race:function(){return b('tail').rn;},lihs:function(){return b('tail').ls;},
    lihn:function(){return b('tail').ln;},most:function(){return b('tail').mb;},hq:function(){return cn(b('tail').h,function(v){return (v|0)===31;});},
    lovm:function(){return lv(1);},lovg:function(){return lv(3);},glvs:function(){return b('glove').s;},glvp:function(){return b('glove').p;},
    nchn:function(){return b('nech').n;},nchb:function(){return nk(b('nech').b);},nchg:function(){return cn(b('nech').b,function(v){return v>=150;});},
    ordw:function(){return b('orda').w;},wadv:function(){return bits(b('win').a);},wel:function(){return b('win').e;},
    wkar:function(){return (b('win').x|0)&4?1:0;},wmas:function(){return (b('win').x|0)&8?1:0;}};
  V.cnt=C;
  if(typeof VKM_CNT==='object'&&VKM_CNT)VKM_CNT.b=function(a){if(!BB2.on('vkm2'))return 0;var f=C[a];return f?+f()||0:0;};
  if(typeof vkmCheck==='function')setTimeout(vkmCheck,500);
})();
