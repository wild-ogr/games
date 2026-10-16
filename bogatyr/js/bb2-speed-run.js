/* ===== bb2-speed-run.js — поток SPEED (супер-буст в2, 14.10.2026), догружается в меню (набор 'speed', BB2.late). Заглушка — js/bb2-speed.js.
   1) «Попроще» ступенями (флаг ql3). Ступень 0 — всё; 1 — плотность экрана 1,5, частиц вдвое меньше (≤200), цифр ≤10, без свечения мелочи (старое «мало»);
      2 — ещё частиц ≤120 и «умные цифры». Число и крепость нечисти не меняются (qLowF в core.js). Настройка «Эффекты»: авто = ступень по замеру,
      «много» = 0, «мало» = 2. Авто решает после каждого похода по его замеру: плохо (худшая секунда < 35 или обычные < 50 к/с) — ступень выше;
      3 хороших похода подряд (худшая ≥ 52 и обычные ≥ 57) — ниже. Внутри похода — один шаг вверх, если 5 секунд подряд < 30 к/с.
   2) «Беречь батарею» (флаг bat): ровные 30 к/с. Настройка: авто / вкл / выкл. Авто (только телефон) — включается на 5 походов, если поход на ступени 2
      всё равно шёл с провалами (худшая < 30 или обычные < 45) или худшая секунда < 20.
   3) «Умные цифры» (флаг numSum, и всегда на ступени 2): по одному врагу — одна цифра, растёт, пока по нему бьют; при добивании после 2+ ударов — «лопается» (золотая, заново подпрыгивает; без «!» — он только у крита).
   4) Значки заранее (флаг icw): какие значки игра пекла в меню — запоминаем (localStorage 'bogatyr-icw', до 160), в следующий заход печём их по одному
      в свободное время меню (плюс портреты богатырей): вкладка «Богатыри» открывается без выпечки.
   5) Замер скорости в каждом походе (флаг spd): STAT spd {fps обычные, lo худшая секунда, en больше всего нечисти, ql ступень, bt батарея, ch место, s секунд, pc}.
   6) Музыка земель (флаг musl): MUSL_T[настроение] = 'audio/файл.m4a' → в походе по этой земле играет он. Пусто — прежний battle.m4a. Записи выбирает владелец.
   Старый синтаксис: без ?. ?? .finally */
(function(){
  var P=window.SPDQ;if(!P||P.ok||typeof BB2!=='object')return;
  var q=P.q;
  function sv(){try{localStorage.setItem('bogatyr-q2',JSON.stringify(q));}catch(e){}}
  function ql3(){return BB2.on('ql3');}
  function st(){return QL.mode===1?0:QL.mode===2?2:ql3()?(q.st|0):(qLow()?1:0);} /* ступень сейчас */
  function batOn(){return BB2.on('bat')&&(q.bm===1||(!q.bm&&(q.ba|0)>0));}
  function nsOn(){return BB2.on('numSum')||(ql3()&&st()>=2);}
  P.st=st;P.batOn=batOn;
  function want(){return Math.min(window.devicePixelRatio||1,window.__dprMax||(qLow()?1.5:2));}
  function relay(){try{if(typeof layout==='function'&&VIEW.dpr!==want())layout();}catch(e){}}

  /* ---------- замер похода (зовётся из qFrame: только кадры самого боя, после 3-й секунды, без пауз и окон) ---------- */
  var M=null;
  P.f=function(t){var m=M;if(!m)return;var g=t-m.l;m.l=t;if(!(g>0&&g<250))return;m.c++;m.a+=g;
    if(typeof G!=='undefined'&&G&&G.en.length>m.en)m.en=G.en.length;
    if(m.a<1000)return;var f=Math.round(m.c*1000/m.a);m.a=0;m.c=0;m.h[f]=(m.h[f]||0)+1;m.s++;if(f<m.lo)m.lo=f;
    m.b=f<(P.bat?24:30)?m.b+1:0;
    if(m.b>=5&&!m.up&&ql3()&&QL.mode===0&&(q.st|0)<2){m.up=1;q.st=(q.st|0)+1;sv();relay();}};
  function med(h){var n=0,k,a=[];for(k in h){n+=h[k];a.push(+k);}a.sort(function(x,y){return x-y;});var c=0,i;for(i=0;i<a.length;i++){c+=h[a[i]];if(c*2>=n)return a[i];}return 0;}

  BB2.hook('run',function(g){P.bat=batOn();M={l:0,c:0,a:0,h:{},s:0,lo:999,en:0,b:0,up:0};relay();musRun(g);});
  BB2.hook('end',function(g,win){var m=M;M=null;if(!m||m.s<20)return;var f=med(m.h),lo=m.lo,s0=st(),bt=P.bat?1:0,bad,good;
    if(bt){bad=lo<22||f<27;good=0;}else{bad=lo<35||f<50;good=lo>=52&&f>=57;}
    if(ql3()&&QL.mode===0){
      if(bad&&!bt){if((q.st|0)<2&&!m.up)q.st=(q.st|0)+1;q.g=0;}
      else if(good){q.g=(q.g|0)+1;if(q.g>=3&&(q.st|0)>0){q.st=(q.st|0)-1;q.g=0;}}else q.g=0;}
    if(BB2.on('bat')&&!q.bm&&!P.pc){if(bt)q.ba=Math.max(0,(q.ba|0)-1);else if((s0>=2&&(lo<30||f<45))||lo<20)q.ba=5;}
    sv();
    if(BB2.on('spd'))BB2.stat('spd',{fps:f,lo:lo,en:m.en,ql:s0,bt:bt,ch:g.endless?'e':g.daily?'d':g.weekly?'w':g.chi,s:m.s,pc:P.pc?1:0});});

  /* ---------- «Беречь батарею»: пропускаем кадры браузера, рисуем не чаще ~30 раз в секунду (dt игры и так ≤ 1/30) ---------- */
  if(typeof loop==='function'){var L0=loop,lt=0;
    loop=function(t){if(P.bat&&typeof G!=='undefined'&&G&&!G.over&&t-lt<29){requestAnimationFrame(loop);return;}lt=t;return L0(t);};}

  /* ---------- частицы на ступени 2: не больше 120 ---------- */
  BB2.hook('frame',function(dt,g){if(ql3()&&st()>=2&&g.pt&&g.pt.length>120)g.pt.length=120;});

  /* ---------- «умные цифры»: одна растущая цифра на врага (game.js сам складывает удары в e.num — продлеваем ей жизнь) ---------- */
  if(typeof hitEnemy==='function'){var H0=hitEnemy;
    hitEnemy=function(e,d,kx,ky){if(!e||e.dead||!nsOn())return H0(e,d,kx,ky);var m=e.num,N=G.nums,l0=N[N.length-1],r,n,i;
      if(m){if(m.t<.6&&!m.cr&&N.indexOf(m)>=0){m.b=G.t;if(m.t>.2)m.t=.2;m.x=e.x;m.y=e.y-e.r*1.2;m.k=(m.k|0)+1;}else m=e.num=null;}
      r=H0(e,d,kx,ky);n=N[N.length-1];
      if(m&&n&&n!==l0&&n!==m&&n.cr&&typeof n.v==='number'&&(i=N.indexOf(m))>=0){m.v+=n.v;m.col='#ffd84a';m.t=Math.min(m.t,.12);N.splice(N.length-1,1);} /* крит — в ту же цифру */
      else if(!m&&n&&n!==l0&&n.cr&&typeof n.v==='number'&&!e.dead){n.cr=0;n.col='#ffd84a';e.num=n;} /* первый удар — крит: с него и начнётся цифра */
      return r;};}
  BB2.hook('kill',function(e){var m=e&&e.num;if(!m||!nsOn())return;e.num=null;
    if((m.k|0)>=1&&typeof m.v==='number'&&!m.cr&&G.nums.indexOf(m)>=0){m.t=0;m.col='#ffe14a';}});

  /* ---------- значки заранее ---------- */
  var seen=[],dirty=0;try{seen=JSON.parse(localStorage.getItem('bogatyr-icw')||'[]')||[];}catch(e){}
  if(typeof iconURL==='function'){var I0=iconURL;
    iconURL=function(k,px){px=px||96;var id=k+'@'+px;
      if(!ICONS[id]&&typeof G!=='undefined'&&!G&&seen.length<160&&seen.indexOf(id)<0&&ART[k]){seen.push(id);dirty=1;}
      return I0(k,px);};}
  /* «Богатыри» вхолостую: какие значки понадобятся — без выпечки (iconURL отдаёт пустую строку), вкладка скрыта и потом очищается */
  function dry(){var el=typeof $==='function'&&$('tabHeroes'),f=iconURL;if(!el||typeof renderHeroes!=='function'||curTab==='Heroes')return;
    iconURL=function(k,px){var id=k+'@'+(px||96);if(!ICONS[id]&&wq.indexOf(id)<0)wq.push(id);return '';};
    try{renderHeroes();}catch(e){}iconURL=f;el.innerHTML='';dryN=nSk();}
  var dryN=-1;function nSk(){return typeof SKINS!=='undefined'&&SKINS?SKINS.length:-1;} /* MERGE: облик, добавленный поздно догруженным набором (TAIL «Зарочный витязь»), — довыпекаем: новая холостая «Богатыри» при смене числа обликов */
  function icSave(){if(!dirty)return;dirty=0;try{localStorage.setItem('bogatyr-icw',JSON.stringify(seen));}catch(e){}}
  var wq=null,wt=0;
  function warm(){wt=0;if(!BB2.on('icw'))return;
    if(!wq){wq=seen.slice();dry();}
    if(typeof G!=='undefined'&&G||document.hidden){wt=setTimeout(warm,1500);return;}
    var t0=Date.now();while(wq.length&&Date.now()-t0<6){var id=wq.shift(),j=id.lastIndexOf('@'),k=id.slice(0,j);if(!ICONS[id]&&ART[k])try{I0(k,+id.slice(j+1));}catch(e){}}
    if(!wq.length&&nSk()!==dryN)dry();if(wq.length)wt=setTimeout(warm,60);}
  BB2.hook('menu',function(){icSave();if(wq&&!wq.length&&nSk()!==dryN&&BB2.on('icw'))dry();if(!wt&&wq&&wq.length)wt=setTimeout(warm,800);});
  BB2.hook('run',function(){icSave();});
  document.addEventListener('visibilitychange',function(){if(document.hidden)icSave();});

  /* ---------- настройки: ступень в «Эффектах» и «Беречь батарею» ---------- */
  if(typeof fxName==='function'){var F0=fxName;
    fxName=function(){if(!ql3()||QL.mode!==0)return F0();var s=q.st|0;
      return s?L('авто (сейчас попроще: '+s+' из 2)','auto (simpler now: '+s+' of 2)'):L('авто','auto');};}
  function batName(){return q.bm===1?L('вкл','on'):q.bm===2?L('выкл','off'):(q.ba|0)>0?L('авто (сейчас вкл)','auto (on now)'):L('авто','auto');}
  BB2.hook('modal',function(kind,m){if(!BB2.on('bat')||!m)return;var fx=m.querySelector('#fxBtn');if(!fx||m.querySelector('#batBtn'))return;
    var d=document.createElement('div');
    d.innerHTML='<button class="btn ghost" id="batBtn" style="width:100%;margin-top:8px">'+L('🔋 Беречь батарею: ','🔋 Battery saver: ')+batName()+'</button><p class="sub" style="margin:6px 2px 0;text-align:left">'+
      L('Ровные 30 кадров: телефон меньше греется в долгой игре. «Авто» включит само, если телефон не успевает.','Steady 30 FPS: the phone runs cooler in long sessions. “Auto” turns it on by itself if the phone lags.')+'</p>';
    var p=fx.nextElementSibling,at=p&&p.tagName==='P'?p.nextSibling:fx.nextSibling;while(d.firstChild)fx.parentNode.insertBefore(d.firstChild,at);
    m.querySelector('#batBtn').addEventListener('click',function(){q.bm=((q.bm|0)+1)%3;if(q.bm)q.ba=0;sv();P.bat=batOn()&&typeof G!=='undefined'&&!!G;
      if(typeof STAT!=='undefined'&&BB2.on('spd'))BB2.stat('bat',{m:q.bm});this.textContent=L('🔋 Беречь батарею: ','🔋 Battery saver: ')+batName();});});

  /* ---------- музыка земель: место под 3–4 мелодии (настроение земли → файл). Пусто = как было ---------- */
  var MUSL_L={les:'a',pole:'a',luk:'a',bol:'b',kosh:'b',vihr:'b',gory:'c',med:'c',more:'d',ogon:'d',lih:'d'}; /* a светлые, b жуткие, c студёные, d жаркие/последние */
  var MUSL_T={a:'',b:'',c:'',d:''}; /* сюда — 'audio/land-a.m4a' и т. д. после выбора владельца (+ подпись в «Благодарностях») */
  P.MUSL_L=MUSL_L;P.MUSL_T=MUSL_T;
  function land(chi){try{if(CHX[chi]&&CHX[chi].th)return CHX[chi].th;for(var i=0;i<TH_REG.length;i++)if(TH[TH_REG[i]].slot1===chi)return TH_REG[i];}catch(e){}return '';}
  P.land=land;
  function musRun(g){if(!BB2.on('musl')||typeof MUSK!=='object')return;var f=MUSL_T[MUSL_L[land(g.chi)]]||'';
    if(f&&!g.endless&&!g.daily&&!g.weekly){var k='land_'+MUSL_L[land(g.chi)];MUSF[k]=f;MUSK.run=k;}else MUSK.run='battle';}

  P.ok=1;
  if(typeof G!=='undefined'&&G&&!G.over){P.bat=batOn();M={l:0,c:0,a:0,h:{},s:0,lo:999,en:0,b:0,up:0};}else setTimeout(warm,800);
})();
