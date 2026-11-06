/* SHR-0611 (06.11): межэкранная ВНЕ партии/уровня — «второй путь» (образцы: Зина Z4-REKLAMA, Рыбалка R3-REKLAMA, Оборона olad).
   Один и тот же текст во всех играх; игра даёт переходник window.SHR_A ДО этого файла:
     inGame()  — идёт партия/уровень (раздел, открытый в партии, считается партией)
     busy()    — что-то на экране мешает (реклама, покупка, окно, «Загрузка…»)
     ok()      — игроку вообще можно (не «без рекламы», не новичок, не обучение) → '' или причина
     ready()   — общий таймер межэкранной игры прошёл (от запуска и ЛЮБОЙ рекламы) → true/false
     show()    — показать межэкранную тем же путём, что между партиями («Загрузка…» + showInterstitial); передумала до показа — SHR.cancel()
     modals    — css-селекторы окон (класс on/открыто); skip — экраны, где не показываем (покупки, монеты, настройки, правила…)
     btn       — css-селектор кнопок «за рекламу»/покупки (после нажатия 3 с не показываем)
     open(el)  — (необяз.) окно el сейчас открыто? по умолчанию класс 'on'
   Когда: смена раздела вне партии (STAT.screen: меню ↔ карта/раздел), раздел был открыт ≥ dwell с; закрытие окна вне партии (окно было ≥ dwell с).
   Показ — через delay мс, если экран тот же, окна нет, партия не началась.
   Флаги: ?off=shr (или window.SHR_CFG={on:0}); SHR_CFG={gap,retry,dwell,delay,hold}; Яндекс-флаги scr_ad/scr_gap — через SHR.flags(f) из applyFlags игры.
   STAT: ev shr {a:'try',k:'s'|'m',s:экран}; сам показ — общий ad int … с полем w:'scr'. */
(function(){
  var A=window.SHR_A;if(!A||!window.STAT)return;
  var C={on:1,gap:180,retry:60,dwell:8,delay:450,hold:3},k,u=window.SHR_CFG||{};for(k in u)C[k]=u[k];
  if(/[?&]off=[^&#]*\bshr\b/.test(location.search))C.on=0;
  var cur='',curT=Date.now(),curG=false,lastTry=0,btnT=0,tm=0,W=0,mo={},N={t:0,s:0};
  function now(){return Date.now();}
  function isOpen(el){return A.open?A.open(el):el.classList.contains('on');}
  function skip(s){return !s||(A.skip||[]).indexOf(s)>=0;}
  function why(){
    if(!C.on)return 'off';
    if(A.inGame())return 'game';
    if(A.busy())return 'busy';
    if(now()-btnT<C.hold*1000)return 'btn';
    var y=A.ok();if(y)return y;
    if(!A.ready())return 'gap';
    var g=A.last?now()-A.last():1e12;if(g<C.gap*1000)return 'gap';
    if(now()-lastTry<Math.max(C.retry,C.gap)*1000)return 'try';
    return '';}
  function kick(kind,s){clearTimeout(tm);var s0=cur;
    tm=setTimeout(function(){if(cur!==s0||why())return;lastTry=now();
      N.t++;try{STAT.ev('shr',{a:'try',k:kind,s:String(s||s0).slice(0,16)});}catch(e){}
      W=1;try{A.show();}catch(e){W=0;}},C.delay);}
  /* смена раздела: обёртка STAT.screen (сама статистика пишет экран раз за сеанс — нам нужен каждый переход) */
  var os=STAT.screen;
  /* «в партии» ли раздел, решаем после смены экрана (STAT.screen зовут ДО show(): «В меню» из партии — ещё виден экран игры) */
  function mark(n){setTimeout(function(){if(cur===n&&A.inGame())curG=true;},0);}
  STAT.screen=function(n){var r=os.apply(this,arguments);n=String(n);
    var g=n==='game';
    if(n!==cur){var o=cur,oG=curG,d=now()-curT;cur=n;curT=now();curG=g;mark(n);
      if(!g&&!oG&&o&&!skip(o)&&!skip(n)&&d>=C.dwell*1000)kick('s',o);}
    else mark(n);
    return r;};
  /* метка показа второго пути в общем событии ad */
  var oa=STAT.ad;
  STAT.ad=function(f,r,c,x){if(f==='int'&&W&&r!=='hold'){W=0;x=x||{};x.w='scr';N[r]=(N[r]||0)+1;}return oa.call(this,f,r,c,x);};
  /* закрытие окна вне партии */
  /* s0 — раздел, в котором окно открыто (наблюдатель срабатывает уже после синхронного кода: окно закрыли и сразу сменили раздел — смотрим на оба) */
  function watch(el,key){var on=isOpen(el),t0=now(),g=false,s0=cur;
    new MutationObserver(function(){var o=isOpen(el);if(o===on)return;on=o;
      if(o){t0=now();g=curG||A.inGame();s0=cur;return;}
      if(!g&&!curG&&!skip(cur)&&!skip(s0)&&now()-t0>=C.dwell*1000)kick('m',s0);}).observe(el,{attributes:true,attributeFilter:['class','style','hidden']});}
  function hook(){(A.modals||[]).forEach(function(s){var e=document.querySelector(s);if(e&&!mo[s]){mo[s]=1;watch(e,s);}});}
  hook();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);
  if(A.btn)document.addEventListener('pointerdown',function(e){var t=e.target;if(t&&t.closest&&t.closest(A.btn))btnT=now();},true);
  window.SHR={cfg:C,n:N,why:why,kick:kick,cancel:function(){W=0;},cur:function(){return cur;},
    flags:function(f){if(!f)return;var a=parseInt(f.scr_ad,10),g=parseInt(f.scr_gap,10);if(a===0||a===1)C.on=a;if(g>=120&&g<=600)C.gap=g;},
    _reset:function(){lastTry=0;btnT=0;}};
})();
