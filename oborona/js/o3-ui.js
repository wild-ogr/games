'use strict';
/* «Оборона 3.0» в1 — js/o3-ui.js. Хозяин: см. O3-COMMON.md (hobby-analytics/release-i/boost3-oborona). Каркас O3 — js/o3-hero.js § П0. */

/* ================= § П5 Рапорт, Карта, итог боя, точные правки (O3R) ================= */
/* --- Регистр «новое по одной вещи в день» (для П1/П3) ---
   O3.newsOk(id) → true, если новинку id уже можно показывать этому игроку.
     Новичок (до 3.0 побед не было) — всегда true (новинки открываются сами по ходу игры).
     Старый игрок (были победы до 3.0) — по одной вещи в ИГРОВОЙ день (дни захода, не календарь):
       день 1 'hero' (Добрыня), день 2 'raport' (Рапорт воеводы), день 3 'tropa' (Тропа Кощея — и её собственное условие открытия),
       день 4+ 'hero2' (второй богатырь: Василиса/Алёша). Прочие id — true.
   O3.newsDay() — номер игрового дня 3.0 (1…), O3.newsOld() — старый ли игрок, O3.newsFresh(id) — новинка открылась именно сегодня (для «Новое!»).
   Поле S.o2r {o:1 старый, n:день 3.0, d:'ГГГГ-ММ-ДД' последний день захода, …Рапорт} — слияние «максимум». Флаг: работает всегда (это правило, не новинка);
   с ?off=o3 — всё true (как без регистра). */
(function(){
  var ORD={hero:1,raport:2,tropa:3,hero2:4,hero3:5};
  function wins(s){s=s||S;return (+s.wins||0)+Object.keys((s&&s.stars)||{}).length;}
  OB2.field('r',{id:'raport',def:function(){return {o:wins()>0?1:0,n:0,d:''};},
    fix:function(v){if(v.n==null)v.n=0;var t=dayKey();if(v.d!==t){v.d=t;v.n=(+v.n||0)+1;}}});
  // облако: старое сохранение (до 3.0, без S.o2r) с победами → игрок старый, даже если тут свежая копия
  META_MODS.push({id:'o2r-old',MERGE:function(x,o){try{if(x&&!x.o2r&&wins(x)>0&&o.o2r&&typeof o.o2r==='object')o.o2r.o=1;}catch(e){}}});
  function rr(){var v=S&&S.o2r;if(!v||typeof v!=='object'){v=S.o2r={o:wins()>0?1:0,n:1,d:dayKey()};}return v;}
  O3.newsDay=function(){return +rr().n||1;};
  O3.newsOld=function(){return !!rr().o;};
  O3.newsOk=function(id){if(!O3.on('raport')&&!O3.on('home')&&!O3.on('hero'))return true;var k=ORD[id];if(!k)return true;var v=rr();return !v.o||(+v.n||1)>=k;};
  O3.newsFresh=function(id){var k=ORD[id];if(!k)return false;var v=rr();return v.o?(+v.n||1)===k:false;};
})();

/* --- Межэкранная 5 мин (флаг o3int; решение владельца 07.11): INTER_MIN 8 → 5. Остальные правила interReady прежние —
   в т. ч. «только после 1-й главы» (S.stars['0-5']), не первые 5 мин захода, не новичку, no_ads. Флаг Яндекса inter_min главнее:
   applyFlags приходит из SDK позже загрузки этого файла и перезаписывает INTER_MIN сам. */
(function(){try{if(O3.on('o3int')&&typeof INTER_MIN!=='undefined'&&INTER_MIN===8)INTER_MIN=5;}catch(e){O3.err('o3int',e);}})();

/* --- Точные правки вида (VIS.md «ТОЧНЫЕ ПРАВКИ ВИДА В ВОЛНУ 1», п. 1–4; флаг home) — без правок game.js/ch-noch.js: обёртки глобальных функций --- */
(function(){
  if(!O3.on('home'))return;
  try{document.documentElement.classList.add('o3h');}catch(e){}
  // п.1 зелёные «+» лечения: один «+» на место раз в 0,5 с, «+» на поле ≤6, всех надписей ≤12 (plus — только вид, случайность боя не трогает)
  var plus0=window.plus;
  if(typeof plus0==='function')window.plus=function(x,y){try{if(!G||!G.nums)return;var n=0,np=0;for(var i=0;i<G.nums.length;i++){var q=G.nums[i];n++;
      if(q.v==='+'){np++;if(q.t<.5&&Math.abs(q.x-x)<18&&Math.abs(q.y-y)<18)return;}}
    if(np>=6||n>=12)return;}catch(e){}return plus0(x,y);};
  // п.2 тосты меню гаснут при входе в бой; тост в бою — под шапкой, ≤3 с
  O3.hook('run','home',function(){try{var t=$('toast');t.classList.remove('on','o3b');clearTimeout(toastT);}catch(e){}});
  var toast0=window.toast;
  if(typeof toast0==='function')window.toast=function(s){var r=toast0.apply(this,arguments);try{var t=$('toast'),b=!!(G&&!G.over&&document.body.classList.contains('run'));
      t.classList.toggle('o3b',b);if(b){clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on');},3000);}}catch(e){}return r;};
  // п.3 «тьма» Долгой ночи: 0,32 → 0,62 тёмно-синяя, круги света у застав, ворот и богатыря, глаза нечисти
  var oc=null;
  function dark(c,f,q){var a=.62*Math.min(1,q*6,(1-q)*6);if(a<=0){worldT();return;}var L=[],i;
    for(i=0;i<G.tw.length;i++){var t=G.tw[i];if(t)L.push([t.x,t.y,58]);}
    if(G.map&&G.map.gate)L.push([G.map.gate.x,G.map.gate.y-10,70]);
    try{if(typeof O3H!=='undefined'&&O3H.hero)L.push([O3H.hero.x,O3H.hero.y,50]);}catch(e){}
    // тьма — на своём холсте, круги света вычитаются (destination-out), чтобы перекрытия не темнели
    var cv=c.canvas,W=cv.width,H=cv.height;if(!oc){oc=document.createElement('canvas');}if(oc.width!==W||oc.height!==H){oc.width=W;oc.height=H;}
    var o=oc.getContext('2d');o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,W,H);o.globalCompositeOperation='source-over';o.fillStyle=rgba('#070c26',a);o.fillRect(0,0,W,H);
    try{o.setTransform(c.getTransform());}catch(e){}o.globalCompositeOperation='destination-out';
    for(i=0;i<L.length;i++){var g=o.createRadialGradient(L[i][0],L[i][1],L[i][2]*.5,L[i][0],L[i][1],L[i][2]);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');
      o.fillStyle=g;o.beginPath();o.arc(L[i][0],L[i][1],L[i][2],0,TAU);o.fill();}
    o.globalCompositeOperation='source-over';c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(oc,0,0);c.restore();c.save();
    var p=.7+.3*Math.sin(G.t*6);c.fillStyle=rgba('#ffe066',Math.min(1,a*1.5)*p);
    for(i=0;i<G.en.length;i++){var e=G.en[i];if(e.dead||e.under)continue;var dy=e.boss?22:11;c.beginPath();c.arc(e.x-3,e.y-dy,1.8,0,TAU);c.arc(e.x+3,e.y-dy,1.8,0,TAU);c.fill();}
    c.restore();worldT();}
  O3.hook('run','home',function(){try{if(typeof CHX!=='undefined'&&CHX.fx&&CHX.fx.noch_dark&&CHX.fx.noch_dark!==dark)CHX.fx.noch_dark=dark;}catch(e){}});
  // п.4 шапка боя на ширине <380: плашки уже; «⏩» прячется, пока запас не кончается (×1 и запас — в одной кнопке скорости: при пустом запасе она сама зовёт окно запаса)
  var css='#toast.o3b{top:calc(var(--st) + 64px);bottom:auto}html.lk #modal.on~#toast.o3b{top:calc(var(--st) + 64px)}'+
    '@media (max-width:379px){html.o3h.lk #hud{gap:2px;padding-left:4px;padding-right:4px}html.o3h.lk .hp{padding:0 4px 0 3px}html.o3h.lk .hp img{width:19px;height:19px}'+
    'html.o3h.lk .hp.wv{padding:0 4px}html.o3h #boostBtn:not(.hot){display:none!important}html.o3h.lk .rb.spd{width:52px}}';
  try{var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);}catch(e){}
})();

var O3R={};
/* --- o3:FIX п.6 вес старта: итог боя ≤4 блока, Карта ≤12 мест, Рапорт воеводы и банк реплик вне боя (O3T) — в ленивой части js/o3-tropa.js § FIX.
   Грузится сразу после старта (OB2.need), без ожидания в первом бою новичка; меню (Карта/Рапорт) ждёт её до 2,5 с (ui.js go(), «o3:FIX»), чтобы не мигать.
   Не загрузилась — игра как v5.7 в этих местах (старый итог/Карта/Летопись), бой не страдает. O3LZ.ok — загружена. */
var O3LZ=(function(){var z={ok:0,fail:0,p:null};
  function need(){if(!O3.on('home')&&!O3.on('raport')&&!O3.on('hum'))return null;if(!z.p)z.p=OB2.need('js/o3-tropa.js').then(function(){z.ok=1;
      try{if((typeof G==='undefined'||!G)&&typeof curTab!=='undefined'&&curTab==='Map'&&typeof openTab==='function'&&document.getElementById('loading').style.display==='none')openTab('Map');}catch(e){}},
    function(e){z.fail=1;z.p=null;O3.err('lazy',e);});return z.p;}
  z.need=need;z.wait=function(){return !!z.p&&!z.ok&&!z.fail;};
  try{need();}catch(e){O3.err('lazy0',e);}return z;})();

/* ================= § П3-вход: «Тропа Кощея» (поток П3; сам режим — js/o3-tropa.js по требованию; флаг tropa) ================= */
var O3TR=(function(){
  // S.o2t {b — дальше всех (волн отбито), n — походов, w — неделя «Тропы недели», wb — её лучшее}; слияние: max, неделя — свежая
  OB2.field('t',{id:'tropa',def:function(){return {b:0,n:0};},merge:function(x,y){x.b=Math.max(x.b|0,y.b|0);x.n=Math.max(x.n|0,y.n|0);
    if((y.w|0)>(x.w|0)){x.w=y.w;x.wb=y.wb|0;}else if((y.w|0)===(x.w|0))x.wb=Math.max(x.wb|0,y.wb|0);}});
  function key(){return CH_ORDER[7];}   // открыта после босса 8-го места в CH_ORDER (у ветерана — сразу)
  function done(){var c=key();return c!=null&&!!S.stars[c+'-5'];}
  // o3:QA старому игроку новинки — по одной в день (O3.newsOk: Тропа — 3-й день 3.0); раньше кнопка/карточка/Застава царя появлялись в 1-й день
  function open(){return O3.on('tropa')&&done()&&(typeof O3.newsOk!=='function'||O3.newsOk('tropa'));}
  function soon(){return O3.on('tropa')&&!done()&&chaptersDone()>=5;}
  function lockTxt(){var c=key();return Lg('🔒 Тропа Кощея откроется после босса земли «','🔒 Koschei’s Trail opens after the boss of “')+(CH[c]?CH[c].name:'')+Lg('»','”');}
  function go(wk){if(!open()){toast(lockTxt());return;}OB2.need('js/o3-tropa.js').then(function(){TRP.start(!!wk);},function(){toast(Lg('Тропа не загрузилась — проверь связь','The trail failed to load — check your connection'));});}
  function zw(v){return Lg('земля '+(Math.floor(v/3)+1)+' · волна '+(v%3+1),'land '+(Math.floor(v/3)+1)+' · wave '+(v%3+1));}
  function isNew(){return !(S.o2t&&S.o2t.n)&&(typeof O3.newsOk!=='function'||O3.newsOk('tropa'));}
  // 4-я кнопка «Тропа» в переключателе Обычный/⚔/🔥 на Карте
  var inMap=0,dr=difRowHTML;difRowHTML=function(c){var h=dr.apply(this,arguments);if(!inMap||!(open()||soon()))return h;
    return h.replace('</div>','<button data-o3t="1" class="'+(open()?'':'lock')+'"'+(open()&&isNew()?' style="box-shadow:0 0 0 2px #e0a82a inset"':'')+'>'+(open()?'':'🔒 ')+Lg('Тропа','Trail')+'</button></div>');};
  var rc=renderChCard;renderChCard=function(){inMap=1;try{rc.apply(this,arguments);}finally{inMap=0;}
    var L=document.querySelectorAll('[data-o3t]');for(var i=0;i<L.length;i++)L[i].onclick=function(){SND.click();go(0);};};
  // строка в «Испытаниях» — после карточки осады
  function card(el){if(!O3.on('tropa')||done()&&!open())return;   // o3:QA пройдено, но Тропа старому ещё не открылась (newsOk) — карточки нет, а не «🔒 откроется после босса»
  var b=$('endGo'),cd=b&&b.closest?b.closest('.card'):null,t=S.o2t||{},wn=weekNo(),wb=t.w===wn?t.wb|0:0,op=open();
    var h='<div class="card" id="o3tCard"><div class="row"><img class="ic" src="'+ic('kosh')+'" alt=""><div class="t"><b>'+Lg('Тропа Кощея','Koschei’s Trail')+'</b><span>'+
      (op?Lg('Земли подряд по 3 волны, жизни не лечатся, после земли — гостинец с дороги. ','Lands in a row, 3 waves each, lives don’t heal, a gift from the road after each land. ')+(t.b?Lg('Дальше всех: ','Farthest: ')+zw(t.b)+'.':''):lockTxt())+'</span></div></div>'+
      (op?'<div class="btns" style="margin-top:0"><button class="btn big" id="o3tGo">'+swordImg()+Lg(' В поход',' Set out')+'</button><button class="btn ghost" id="o3tWk">'+Lg('Тропа недели','Trail of the week')+(wb?' · '+zw(wb):'')+'</button></div>':'')+'</div>';
    if(cd)cd.insertAdjacentHTML('afterend',h);else el.insertAdjacentHTML('beforeend',h);on('o3tGo',function(){go(0);});on('o3tWk',function(){go(1);});}
  // «Застава царя»: кнопка осады → осада с узелками каждые 10 волн (когда Тропа открыта; флаг o3tsar). Рекорд и таблица осады — прежние
  OB2.reg('o3tsar',{s:'O3',t:'П3 Застава царя: осада с гостинцами'});function tsOn(){return open()&&!OB2.off('o3tsar');}
  var sE0=startEndless;startEndless=function(){var a=arguments,self=this;if(!tsOn())return sE0.apply(self,a);
    OB2.need('js/o3-tropa.js').then(function(){TRP.tsar();},function(){sE0.apply(self,a);});};
  function tsCard(){var b=$('endGo'),cd=b&&b.closest?b.closest('.card'):null,p=cd&&cd.previousElementSibling,h=p&&p.previousElementSibling;if(!tsOn()||!p||!h||h.tagName!=='H2')return;
    h.textContent=Lg('Застава царя','The Tsar’s Outpost');p.insertAdjacentHTML('beforeend',Lg(' Каждые 10 волн — узелки с гостинцами.',' Every 10 waves — bundles with gifts.'));}
  META_MODS.push({id:'o3t',SIEGE:function(el){card(el);tsCard();}});
  return {open:open,go:go,zw:zw,lockTxt:lockTxt};   // o3:FIX lockTxt — строка «🔒 Тропа…» на Карте (запертые режимы строкой)
})();
