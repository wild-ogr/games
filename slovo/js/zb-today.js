'use strict';
/* ================= zb-today — «Сегодня у Зины»: дневник на 5 дел, красная «5» (1 в день), портфель дня =================
   Поток SCHOOL (журнал hobby-analytics/release-i/zina-boost/logs/SCHOOL.md). Выключить: CFG.on=false (игра — как раньше).
   ДОГОВОР ДЕЛ (ZB.todayTasks, шапка zb-core.js): {id, order, t, ic, done()→bool, go(), hint()→str} + необязательные
     on()→bool / off()→bool (дела сегодня нет), prog()→[сделано, нужно] (полоска), sub — «предмет» в дневнике, alt — id, чьё место занять.
   Свои пять (тот же id у другого модуля — замена): 'lesson' 10 урок дня (задание дня) · 'dict' 20 диктант (бонусные слова) ·
     'errand' 30 поручение соседки · 'mg' 40 Перемена (регистрирует MG0; нет её или off — запасное 'mg-fb' «уровень без подсказок») · 'home' 50 домашка.
   Лишние дела (другие id: MODE 'mode', MG0 'zmg-paper'…) — не больше одного в день, на месте alt (по умолчанию 'home'): сделанное сегодня
     остаётся; иначе по кругу дней вместе с домашкой; сделанную домашку не вытесняем. В дневнике всегда 5 дел. 3 из 5 → ZBS.giveFive('td') + портфель дня (содержимое видно заранее, «Забрать»).
   Модуль сам отмечает дело: ZBTD.mark(id) (тогда done() можно не писать — по умолчанию done = отмечено сегодня). После своего дела зовите
   ZBTD.check() (или ZB.emit('today')) — дневник пересчитает «5». Пропуск дня ничего не отнимает.
   Поле сохранения S.td {d (день), m {id:1}, n {w, b, e, nh}, bk {ключ уровня: учтено бонусных}, ek {…: учтено слов поручения}, f, p, ask}.
   Числа (портфель, N) — ZBECO.school (ECO), здесь — запасные. */
(function(){
var CFG={on:true,from:3,           // дневник виден с 3-го пройденного уровня (до этого — только уровни, как у новичка)
  pf:{c:40,sun:60,hb:1},           // портфель: монеты (воскресенье — больше) и 💡 в запас по воскресеньям
  dictN:3,homeN:3,need:3};
window.ZBTD_CFG=CFG;
if(window.ZB_OFF&&ZB_OFF.school)CFG.on=false; // общий выключатель школы: window.ZB_OFF={school:1} до загрузки
if(!CFG.on||typeof ZB==='undefined')return;
function E(){var z=window.ZBECO,e=z&&(z.school||z.sc)||{};return e;}
function give(src,n,why){n=Math.floor(+n||0);if(n<=0)return 0;try{if(window.ZBECO&&typeof ZBECO.give==='function')return ZBECO.give(src,n,why);}catch(e){}try{addCoins(n,why||'quest');}catch(e){}return n;}
function pf(){try{if(window.ZBECO&&typeof ZBECO.bagOf==='function'){var b=ZBECO.bagOf(nowMs());if(b&&b.c>0)return {c:+b.c,hb:+b.hb||0};}}catch(e){}var e=E(),p=e.pf||e.portfel||{},sun=wd()===0;
  var c=sun?(num(p.sun)||num(e.pfSun)||CFG.pf.sun):(num(p.c)||num(typeof e.portfel==='number'?e.portfel:0)||CFG.pf.c);
  return {c:c,hb:sun?(p.hb!=null?num(p.hb):CFG.pf.hb):0};}
function nNeed(){return num(E().need)||CFG.need;}
function nDict(){return num(E().dictN)||CFG.dictN;}
function nHome(){return num(E().homeN)||CFG.homeN;}
function num(x){x=+x;return isFinite(x)&&x>0?x:0;}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function dk(){try{return todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function wd(){var k=dk();return new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100,12).getDay();} // 0 — воскресенье
function dn(){var k=dk();return Math.round(Date.UTC(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100)/864e5);}
function lvDone(){try{return num(S.lv);}catch(e){return 0;}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function coin(){try{return COIN_I;}catch(e){return '💰';}}
function tap(){try{SND.tap();}catch(e){}}

/* ---------- сохранение ---------- */
function fresh(){return {d:dk(),m:{},n:{},bk:{},ek:{},f:0,p:0,ask:0};}
function fix(s){s=s||S;if(!isO(s.td)||num(s.td.d)!==dk()){s.td=fresh();}var t=s.td;
  ['m','n','bk','ek'].forEach(function(k){if(!isO(t[k]))t[k]={};});t.f=t.f?1:0;t.p=t.p?1:0;t.ask=t.ask?1:0;}
function merge(s,d){fix(s);if(!d||!isO(d.td)||num(d.td.d)!==s.td.d)return;var a=s.td,b=d.td;
  if(isO(b.m))for(var k in b.m)if(b.m[k])a.m[k]=1;
  ['n','bk','ek'].forEach(function(f){if(isO(b[f]))for(var j in b[f])a[f][j]=Math.max(num(a[f][j]),num(b[f][j]));});
  a.f=a.f||b.f?1:0;a.p=a.p||b.p?1:0;a.ask=a.ask||b.ask?1:0;}
ZB.onSave({id:'today',keys:['td'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});
function sd(){if(!isO(S.td)||num(S.td.d)!==dk())fix();return S.td;}
function cnt(k){return num(sd().n[k]);}
function inc(k,v){var t=sd();t.n[k]=num(t.n[k])+(v==null?1:v);}

/* ---------- поручения соседок (по кругу, одно на день у всех) ---------- */
var LET='кпстбмдрвлгн';
var ERR=[
 {id:'galya',who:'Галя с третьего',ic:'💇',t:function(x){return 'найди 3 слова на букву «'+x.L.toUpperCase()+'»';},n:3,
   say:function(x){return 'Галя: «Мне для кроссворда в журнале не хватает слов на «'+x.L.toUpperCase()+'». Найдёшь три — расскажу, что у Тамары на балконе.»';}},
 {id:'tamara',who:'Тамара из 15-й',ic:'🌷',t:function(x){return 'найди 2 слова из '+x.m+'+ букв';},n:2,
   say:function(x){return 'Тамара: «Длинные слова — как длинные сериалы: всё самое интересное там. Найди два из '+x.m+' букв, не меньше.»';}},
 {id:'lyusya',who:'Люся-почтальонка',ic:'✉️',t:function(){return 'пройди 2 уровня без подсказок';},n:2,
   say:function(){return 'Люся: «Письма надо доставлять без помарок! Вот и ты — два уровня без подсказок, будь добр.»';}},
 {id:'semyon',who:'Дед Семён',ic:'🧓',t:function(){return 'найди 15 слов за день';},n:15,
   say:function(){return 'Дед Семён: «В сорок седьмом мы по пятнадцать слов в день находили! И ничего, выросли. Давай-ка.»';}},
 {id:'vp',who:'Валентина Петровна',ic:'👓',t:function(){return 'пройди уровень быстрее 3 минут';},n:1,
   say:function(){return 'Завуч Валентина Петровна: «Проверка! Один уровень — за три минуты. Время пошло. Шучу — пошло, когда начнёшь.»';}}];
function errand(){var i=dn()%ERR.length,e=ERR[i];return {e:e,L:LET[(dn()*7+3)%LET.length],m:lvDone()<40?5:6};}

/* ---------- итог уровня: счётчики дел ---------- */
function curG(o){try{return G&&G.key===o.key?G:null;}catch(e){return null;}}
function onLevel(o){if(!o)return;var t=sd(),key=String(o.key||o.l);
  // диктант: бонусные слова, прирост к уже учтённому на этом уровне
  var b=num(o.bonus),was=num(t.bk[key]);if(b>was){inc('b',b-was);t.bk[key]=b;}
  var x=errand(),g=curG(o);
  if(o.ok){if(!o.daily&&!o.mode)inc('w');if(!o.hinted)inc('nh');
    var ws=g?g.words.filter(function(w){return w.found;}).map(function(w){return w.w;}):[],add=0;
    if(x.e.id==='galya')add=ws.filter(function(w){return w.charAt(0)===x.L;}).length;
    else if(x.e.id==='tamara')add=ws.filter(function(w){return w.length>=x.m;}).length;
    else if(x.e.id==='lyusya')add=o.hinted?0:1;
    else if(x.e.id==='semyon')add=num(o.words);
    else if(x.e.id==='vp')add=num(o.s)>0&&num(o.s)<180?1:0;
    var ew=num(t.ek[key]);if(add>ew){inc('e',add-ew);t.ek[key]=add;}}
  // ключи уровней — не копим (день и так один)
  var ks=Object.keys(t.bk);if(ks.length>40)delete t.bk[ks[0]];ks=Object.keys(t.ek);if(ks.length>40)delete t.ek[ks[0]];
  check();}
ZB.levelHook.push(onLevel);

/* ---------- пять своих дел ---------- */
function startNext(){try{var i=Math.min(lvDone(),LEVELS.length-1);hideModal();if(typeof maybeInterstitial==='function')maybeInterstitial(function(){startLevel(i);});else startLevel(i);}catch(e){}}
function dailyDone(){try{return !!S.daily[dk()];}catch(e){return false;}}
var OWN=[
 {id:'lesson',order:10,sub:'Урок дня',ic:'📅',t:'Урок дня',done:dailyDone,
   hint:function(){return dailyDone()?'кроссворд дня решён':'кроссворд дня — один на всех';},go:function(){try{openDaily();}catch(e){}}},
 {id:'dict',order:20,sub:'Диктант',ic:'✍️',t:'Диктант',done:function(){return cnt('b')>=nDict();},prog:function(){return [Math.min(cnt('b'),nDict()),nDict()];},
   hint:function(){return 'найди '+nDict()+' лишних слова (их нет в кроссворде) · '+Math.min(cnt('b'),nDict())+' из '+nDict();},go:startNext},
 {id:'errand',order:30,sub:'Поручение',ic:'📮',t:'Поручение соседки',done:function(){return cnt('e')>=errand().e.n;},
   prog:function(){var x=errand();return [Math.min(cnt('e'),x.e.n),x.e.n];},
   hint:function(){var x=errand();return x.e.who+': '+x.e.t(x)+(x.e.n>1?' · '+Math.min(cnt('e'),x.e.n)+' из '+x.e.n:'');},
   go:function(){var x=errand();try{toast(x.e.say(x),6000);}catch(e){}startNext();}},
 {id:'mg-fb',order:40,sub:'Перемена',ic:'🔔',t:'Перемена: Отличник',done:function(){return cnt('nh')>0||!!sd().m['mg-fb'];},
   hint:function(){return 'уровень без единой подсказки';},go:startNext},
 {id:'home',order:50,sub:'Домашка',ic:'📚',t:'Домашка',done:function(){return cnt('w')>=nHome();},prog:function(){return [Math.min(cnt('w'),nHome()),nHome()];},
   hint:function(){return 'пройди '+nHome()+' уровня · '+Math.min(cnt('w'),nHome())+' из '+nHome();},go:startNext}];
// регистрируем, только если такого id ещё нет (MG0 мог прийти раньше — его 'mg' главнее)
OWN.forEach(function(x){x.own=1;for(var i=0;i<ZB.todayTasks.length;i++)if(ZB.todayTasks[i].id===x.id)return;ZB.todayTasks.push(x);});
// дело показывается, если on()!==false и off()!==true (MG0 пишет off)
function onOk(x){return x&&ZB.safe('td-on:'+x.id,function(){return (!x.on||x.on()!==false)&&!(x.off&&x.off());})!==false;}
var STD=['lesson','dict','errand','mg','home'];
function isDone(x){return !!ZB.safe('td-done:'+x.id,function(){return x.done?x.done():!!sd().m[x.id];});}
// лишние дела (MODE 'mode', MG0 'zmg-paper'…) — одно в день на месте своего alt (по умолчанию «домашка»): уже сделанное сегодня — остаётся;
// иначе по кругу дней вместе с самой домашкой; сделанную домашку не вытесняем
function pickL(){var L=ZB.todayTasks.filter(onOk),extra=L.filter(function(x){return STD.indexOf(x.id)<0&&x.id!=='mg-fb';});
  L=L.filter(function(x){return extra.indexOf(x)<0&&x.id!=='mg-fb';});
  // «Перемены» нет (MG0 не загрузился или сегодня игры нет) — запасное дело на её месте
  if(!L.some(function(x){return x.id==='mg';})){var fb=ZB.todayTasks.filter(function(x){return x.id==='mg-fb';})[0];if(fb)L.push(fb);}
  if(!extra.length)return L;
  var pick=extra.filter(isDone)[0];
  if(!pick){var home=L.filter(function(x){return x.id==='home';})[0];if(home&&isDone(home))return L;var k=dn()%(extra.length+1);pick=k<extra.length?extra[k]:null;}
  if(!pick)return L;var alt=pick.alt||'home',a=L.filter(function(y){return y.id===alt;})[0];
  if(a&&pick.order==null)pick.order=a.order;return L.filter(function(y){return y!==a;}).concat([pick]);}
function list(){return pickL()
  .sort(function(a,b){return (a.order||0)-(b.order||0);}).slice(0,5).map(function(x){
    var ok=!!ZB.safe('td-done:'+x.id,function(){return x.done?x.done():!!sd().m[x.id];});
    var r={x:x,id:x.id,ok:ok,t:x.t||x.id,ic:x.ic||'•',sub:x.sub||x.t||'',h:ZB.safe('td-hint:'+x.id,function(){return x.hint?x.hint():'';})||'',
      pr:x.prog?ZB.safe('td-prog:'+x.id,function(){return x.prog();}):null};
    if((x.id==='mg'||x.id==='mg-fb')&&tgDue())r=tgRow(r);return r;});}
// MGB: новая телеграмма от внука (ZMG.REG.by.telegramma.due() — договор MG0; есть, когда игра загружена) — строкой в «Перемене»; дело сделано — нажатие открывает телеграмму
function tgReg(){var g=window.ZMG&&ZMG.REG&&ZMG.REG.by&&ZMG.REG.by.telegramma;return g&&typeof g.due==='function'?g:(window.ZMGTG||null);}
function tgDue(){return !!ZB.safe('td-tg',function(){var g=tgReg();return g&&g.due&&g.due();});}
function tgGo(){ZB.safe('td-tg-go',function(){if(window.ZMG&&ZMG.open)ZMG.open('telegramma',{mode:'win'});});}
function tgRow(r){var tg='✉️ Новая телеграмма от Стёпы!';r.h=r.ok?tg:tg+(r.h?' · '+r.h:'');
  if(r.ok&&window.ZMG&&ZMG.open)r.x={id:r.id,go:tgGo};return r;}
function count(){return list().filter(function(x){return x.ok;}).length;}

/* ---------- «5» и портфель ---------- */
var news=[]; // для окна победы: 'five' — пятёрка только что
var lastN=-1;
function check(){if(lvDone()<CFG.from&&!dailyDone())return;var t=sd(),n=count();
  if(n!==lastN){if(lastN>=0)try{STAT.ev('today',{n:n});}catch(e){}lastN=n;}
  if(!t.f&&n>=nNeed()){t.f=1;var ok=window.ZBS?ZBS.giveFive('td'):true;news.push({k:'five',ok:ok});}
  try{save();}catch(e){}}
function mark(id){var t=sd();if(!t.m[id]){t.m[id]=1;check();}}
ZB.on('today',function(){check();});
function pfTxt(){var p=pf();return '+'+p.c+' '+coin()+(p.hb?' и 💡 +1':'');}
function pfReady(){var t=sd();return !!t.f&&!t.p;}
function takePf(el){var t=sd();if(!t.f||t.p)return 0;t.p=1;var p=pf();
  give('bag',p.c,'quest');if(p.hb)try{hbAdd(p.hb,'pf');}catch(e){}
  try{SND.coin();}catch(e){}try{if(el)coinBurst(el,p.c);}catch(e){}
  try{STAT.ev('pf',{c:p.c,h:p.hb});}catch(e){}try{save();cloudSoon();}catch(e){}return p.c;}
function openPf(){if(!pfReady())return;try{STAT.screen('pf');}catch(e){}var f=window.ZBS?ZBS.five():{all:0};
  modal('<div class="sc-pf"><h2>🎒 Портфель дня</h2><div class="sc-stamp">5</div>'+
    '<p>Три дела из пяти — красная пятёрка в дневник! '+esc(pick5())+'</p>'+
    '<div class="reward big" id="scPfW">'+pfTxt()+'</div>'+
    '<p class="sc-mut">Пятёрок в дневнике: <b>'+f.all+'</b>'+(window.ZBS?' · '+esc(ZBS.info().short):'')+'</p>'+
    '<div class="btns"><button class="btn green" id="scPfOk">Забрать портфель</button></div></div>');
  $('scPfOk').onclick=function(){takePf($('scPfW'));hideModal();refresh();};}
function pick5(){var a=['Валентина Петровна расписалась — значит, не подделка.','Ять сидел рядом и всё видел. Свидетель.',
  'Вот это я понимаю — ученик! Не то что Валерка.','Родителей в школу не вызываем. Сегодня.'];return a[dn()%a.length];}

/* ---------- дневник (экран) ---------- */
var DN=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
var MN=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
function dateTxt(){var k=dk();return (k%100)+' '+MN[Math.floor(k/100)%100-1]+', '+DN[wd()];}
function rowsHtml(L,big){return L.map(function(x,i){var pr=x.pr&&x.pr[1]>1&&!x.ok?'<i class="sc-pb"><b style="width:'+Math.round(100*x.pr[0]/x.pr[1])+'%"></b></i>':'';
  return '<button type="button" class="sc-row'+(x.ok?' ok':'')+'" data-i="'+i+'"><span class="sc-n">'+(i+1)+'</span><span class="sc-ic">'+x.ic+'</span>'+
    '<span class="sc-b"><b>'+esc(big?x.t:x.sub)+'</b><small>'+esc(x.h)+'</small>'+pr+'</span><span class="sc-mk">'+(x.ok?'<em class="sc-red">✓</em>':'›')+'</span></button>';}).join('');}
function weekHtml(){if(!window.ZBS)return '';var f=ZBS.five(),D=['пн','вт','ср','чт','пт','сб','вс'],t=dk();
  return '<div class="sc-week">'+D.map(function(d,i){return '<span class="'+(f.days[i]===t?'now':'')+'"><small>'+d+'</small><b>'+(f.week[i]?'5':'')+'</b></span>';}).join('')+'</div>';}
function sealHtml(n){var t=sd();
  if(t.f&&!t.p)return '<button type="button" class="btn green sc-take" id="scPf">🎒 Забрать портфель: '+pfTxt()+'</button>';
  if(t.f)return '<div class="sc-seal got"><span class="sc-stamp sm">5</span><span>Пятёрка за сегодня — в дневнике. Портфель забран. Завтра — новые дела.</span></div>';
  return '<div class="sc-seal"><span class="sc-stamp sm off">5</span><span>Ещё <b>'+Math.max(0,nNeed()-n)+'</b> '+pl(Math.max(0,nNeed()-n),'дело','дела','дел')+' — и «5» в дневник + портфель <b>'+pfTxt()+'</b></span></div>';}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function render(el){var L=list(),n=L.filter(function(x){return x.ok;}).length,inf=window.ZBS?ZBS.info():null;
  el.innerHTML='<div class="sc-scr"><div class="sc-diary"><div class="sc-dh"><span><small>ДНЕВНИК</small><b>'+(inf?esc(inf.short)+' · '+esc(inf.name):'Ученик бабы Зины')+'</b></span>'+
    '<span class="sc-date">'+dateTxt()+'</span></div>'+
    '<div class="sc-dt"><b>Сегодня у Зины</b><span class="sc-cnt">'+n+'/5</span></div>'+rowsHtml(L,true)+sealHtml(n)+weekHtml()+
    (inf?'<button type="button" class="sc-cls" id="scCls"><span>🎓 '+esc(inf.short)+'</span><i class="sc-pb"><b style="width:'+Math.round(100*inf.frac)+'%"></b></i><small>'+esc(nextTxt(inf))+'</small></button>':'')+
    '<p class="sc-mut">Пропустил день — ничего не сгорает. Пятёрка — одна в день.</p></div>'+
    '<div class="btns"><button type="button" class="btn blue" id="scBack">← Домой</button></div></div>';
  var rs=el.querySelectorAll('.sc-row');for(var i=0;i<rs.length;i++)rs[i].onclick=(function(x){return function(){tap();ZB.safe('td-go:'+x.id,function(){x.x.go&&x.x.go();});};})(L[+rs[i].dataset.i]);
  var b=el.querySelector('#scPf');if(b)b.onclick=function(){takePf(b);render(el);};
  var c=el.querySelector('#scCls');if(c)c.onclick=function(){tap();if(window.ZBS&&ZBS.openClass)ZBS.openClass();};
  el.querySelector('#scBack').onclick=function(){tap();home();};}
function nextTxt(inf){var x=inf.next;if(!x)return '';var a=[];
  if(inf.c<12){if(x.lLeft>0)a.push('контрольная — уровень '+x.l);if(x.fLeft>0)a.push('ещё '+x.fLeft+' '+pl(x.fLeft,'пятёрка','пятёрки','пятёрок'));
    return a.length?'До '+(x.c<12?x.c+' класса':'выпускного')+': '+a.join(' и '):'';}
  return 'До ★'+(x.c-12)+': ещё '+x.fLeft+' '+pl(x.fLeft,'пятёрка','пятёрки','пятёрок');}
function home(){try{if(ZB._scr.home)return ZB.go('home');}catch(e){}try{openMenu();}catch(e){}}
ZB.screen('diary',{title:'Дневник',render:render});
function openDiary(){check();ZB.go('diary');}
function refresh(){try{var on=document.querySelector('.screen.on');if(on&&on.id==='zb-diary')render(on);else if(on&&(on.id==='menu'||on.id==='zb-home'))ZB.refresh();}catch(e){}}

/* ---------- главный: строка «Сегодня у Зины» (зона today) ---------- */
ZB.add(ZB.homeSlots,{id:'sc-today',order:10,zone:'today',render:function(){if(lvDone()<CFG.from)return '';var L=list(),n=L.filter(function(x){return x.ok;}).length,t=sd(),inf=window.ZBS?ZBS.info():null;
  var line=t.f?(t.p?'«5» сегодня есть! Завтра — новые дела':'«5» есть! Портфель ждёт — забери'):'Ещё '+Math.max(0,nNeed()-n)+' — и «5» в дневник + портфель '+pfTxt();
  return '<button type="button" class="sc-home'+(t.f&&!t.p?' hot':'')+'"><span class="sc-hh"><span><small>ДНЕВНИК'+(inf?' · '+esc(inf.short.toUpperCase()):'')+'</small><b>Сегодня у Зины</b></span>'+
    (t.f?'<span class="sc-stamp sm">5</span>':'<span class="sc-cnt">'+n+'/5</span>')+'</span>'+
    '<span class="sc-chips">'+L.map(function(x){return '<i class="'+(x.ok?'ok':'')+'" title="'+esc(x.t)+'">'+x.ic+'</i>';}).join('')+'</span><span class="sc-hl">'+line+'</span></button>';},
  mount:function(el){var b=el.querySelector('.sc-home');if(b)b.onclick=function(){tap();if(pfReady())openPf();else openDiary();};auto();}});
// само: портфель готов и не забран — окно один раз за день (не поверх другого окна и не в уровне)
var autoT=0;function auto(){clearTimeout(autoT);autoT=setTimeout(function(){try{if($('modal').classList.contains('on'))return;if(G&&!G.won)return;}catch(e){}
  var t=sd();if(pfReady()&&!t.ask){if(window.ZBNB&&ZBNB.turn&&lvDone()<=12&&ZB.safe('nb-pf',function(){return ZBNB.turn('five');})===false)return;t.ask=1;openPf();}},700);}

/* ---------- окно победы (зона goal) ---------- */
var WS=ZB.add(ZB.winSlots,{id:'sc-today',order:20,zone:'goal',fit:2,render:function(ctx){WS.fit=2;if(lvDone()<CFG.from)return '';var nn=news.splice(0),h='',t=sd();
  if(pfReady()){var fresh5=nn.some(function(x){return x.k==='five';});
    // NEWBIE: первая «5» у новичка — только если дирижёр даёт место, иначе ждёт следующей победы
    if(fresh5&&window.ZBNB&&ZBNB.turn&&ZB.safe('nb-five',function(){return ZBNB.turn('five',ctx);})===false){[].push.apply(news,nn);return '';}if(fresh5)WS.fit=0; // свежую «5» окно не прячет
    return '<div class="sc-wpf'+(fresh5?' new':'')+'"><span class="sc-stamp sm">5</span><span><b>'+(fresh5?'Пятёрка в дневник!':'Портфель дня ждёт')+'</b><small>'+pfTxt()+'</small></span>'+
      '<button type="button" class="btn ghost small sc-wtake noenter" id="scWPf">Забрать</button></div>';}
  if(t.f)return '';var n=count();if(n<1)return '';
  return '<p class="goal sc-wl">📒 Сегодня '+n+' из 5 дел — ещё '+Math.max(0,nNeed()-n)+' до «5»</p>';},
  mount:function(el){var b=el.querySelector('#scWPf');if(b)b.onclick=function(){takePf(b);b.disabled=true;b.textContent='✓';b.parentNode.classList.add('got');};}});

// NEWBIE «Завтра у Зины» (гнездо nbtmr): пункт портфеля, если дневник уже виден
if(window.ZBNB&&ZBNB.tmrItems)ZBNB.tmrItems.push({id:'bag',order:15,t:function(){return lvDone()<CFG.from?'':'🎒 портфель за «5»: +'+pf().c+' '+coin();}});
else ZB.on('ready',function(){if(window.ZBNB&&ZBNB.tmrItems&&!ZBNB.tmrItems.some(function(x){return x.id==='bag';}))ZBNB.tmrItems.push({id:'bag',order:15,t:function(){return lvDone()<CFG.from?'':'🎒 портфель за «5»: +'+pf().c+' '+coin();}});});

window.ZBTD={CFG:CFG,list:list,count:count,check:check,mark:mark,openDiary:openDiary,openPf:openPf,takePf:takePf,pfReady:pfReady,pf:pf,errand:errand,
  fix:function(){fix();},render:refresh};
})();
