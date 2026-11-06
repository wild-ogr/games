/* rv-home.js — П5 «ГЛАВНЫЙ И ПАНЕЛЬ» революции «Весь двор отвечает» (06.11.2026; план hobby-analytics/release-i/vk-rev-0611/PLAN-VK.md, разд. 2.2, 3, 7).
   Журнал — release-i/vk-rev-0611/RV-П5.md. Флаги: rv.home (главный, панель, «Награды»), rv.board (Табло с 3-го уровня, первая игра без окон).
   Грузится в <head> после ui-*.js. Сам ничего не рисует до вызова из ui-home.js (UIH.render) и board.js — только даёт им ответы:
   RVH.on()            — новый главный включён (rv.home);  RVH.boardOn() — новое Табло (rv.board)
   RVH.day()           — какой это день игрока с выхода революции (1, 2, …; новичку — с первого входа) — «по одной новинке в день» (PLAN 2.1, 4.3)
   RVH.newbie()        — пришёл уже после выхода революции (первый вход — с нулём лестниц)
   RVH.boardOpen()     — открыто ли Табло: с 5-го уровня как раньше ИЛИ с 3-го уровня на 4-й день
   RVH.say()           — живая реплика Михалыча на главном (каждый день другая; сначала спрашивает банк П1: RVSAY.pick('home',ctx) — строка или null)
   RVH.slots(list)     — какие плитки ленты остаются на главном: только листок дня П4 (homeSlots id 'rv-day'); без него — «Сегодня» и гостинец
   RVH.nav(list)       — нижняя панель: Темы · Затеи · Мой двор · Награды (кнопки других потоков берутся по id: doska/zatei, yard)
   RVH.awards()        — экран «Награды» (#scr-awards): звание и районы, марки, лига, медали тем; UI.go('awards'), UI.go('medals') → сюда же
   RVH.mus()           — музыка по умолчанию включена (решение владельца 06.11: «включена, тихо»), пока игрок сам не выключил в ⚙
   Сохранение: одно поле S.rvH = {d0: день первого входа с революцией (ГГГГММДД), nw: 1 — новичок, sd/si/pi: реплика главного (день, id сегодня, id прошлого дня),
   lv: день последнего входа, ab: дней отсутствия при этом входе}. Появляется только при первом показе главного с rv.home. */
(function(){'use strict';
var W=window,D=document;
// ---- флаги: каркас П0 (RV.on) если есть, иначе свои ?off=rv / ?off=rv.home и localStorage 'rv-off' ----
function offs(){var s='';try{var m=/[?&]off=([^&#]*)/.exec(location.search);if(m)s+=','+decodeURIComponent(m[1]);}catch(e){}try{s+=','+(localStorage.getItem('rv-off')||'');}catch(e){}
  return s.split(/[,\s]+/).filter(Boolean);}
var OFF=offs();
function flag(p){try{if(W.RV&&typeof RV.on==='function')return !!RV.on(p);}catch(e){}if(OFF.indexOf('rv')>=0)return false;return p==='rv'||OFF.indexOf('rv.'+p)<0;}
function $(id){return D.getElementById(id);}
function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function sv(){try{save();}catch(_){}}
function dk(o){try{return dayKey(o||0);}catch(_){var d=new Date();d.setDate(d.getDate()+(o||0));return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function k2t(k){return new Date(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100,12).getTime();}
function ddiff(a,b){return Math.round((k2t(b)-k2t(a))/864e5);}
function lvl(){try{return S.lvl||0;}catch(_){return 0;}}

// ---- день игрока с революцией ----
function st(){var h=null;try{h=S.rvH;}catch(_){return null;}
  if(!h||typeof h!=='object'||Array.isArray(h)){var t=dk(0);h={d0:t,nw:(S.games||0)>1||(S.lvl||0)>0||(S.fin||0)>0?0:1,lv:t,ab:0};S.rvH=h;sv();}
  if(typeof h.d0!=='number'||h.d0<20200101)h.d0=dk(0);
  var t=dk(0);if(h.lv!==t){h.ab=typeof h.lv==='number'&&h.lv<t?ddiff(h.lv,t):0;h.lv=t;sv();}
  return h;}
function day(){try{if(W.RV&&typeof RV.day==='function'){st();return Math.max(1,+RV.day()||1);}}catch(_){} var h=st();if(!h)return 1;return Math.max(1,ddiff(h.d0,dk(0))+1);}
function newbie(){var h=st();return !!(h&&h.nw);}
var BOARD_LVL=2,BOARD_OLD=4,BOARD_DAY=4; // уровень 3 (S.lvl ≥ 2) с 4-го дня; с 5-го уровня — как было, сразу
function boardOpen(){var l=lvl();if(l>=BOARD_OLD)return true;if(!flag('board'))return false;return l>=BOARD_LVL&&day()>=BOARD_DAY;}

// ---- живая реплика Михалыча на главном (баг VK-UX №16: два дня подряд одна и та же) ----
var BANK=[
 ['b1','Двор подмёл, клумбу полил. Осталось самое трудное — вопросы позаковыристей.'],
 ['b2','Баба Зина с утра у окна — болеет за тебя. Или за Валерку. Я не разобрал.'],
 ['b3','Валерка с утра столицы зубрит. Говорит, к пятнице всех обгонит. Ну-ну.'],
 ['b4','Дед Митяй вчера спорил с телевизором. Телевизор, говорит, проиграл.'],
 ['b5','Тётя Валя напекла пирожков. Сказала: кто возьмёт десятый вопрос — тому с капустой.'],
 ['b6','Чай налил, вопросы разложил. Садись — начнём с лёгкого.'],
 ['b7','Дядя Коля говорит: лучшая зарядка — десять вопросов до обеда. А потом можно и обед.'],
 ['b8','Кот с третьего этажа опять на лавочке. Ему вопросы не задаю — молчит, как партизан.'],
 ['b9','Вчера весь двор спорил, сколько ног у паука. Сошлись на восьми. Наука!'],
 ['b10','Погода сегодня самая вопросная: ни жарко, ни скучно.'],
 ['b11','Спросил Валерку, что такое авоська. Он полез в телефон. Эх, молодёжь.'],
 ['b12','Баба Зина говорит, память у неё как в молодости. Только очки опять ищет.'],
 ['b13','Новые вопросы с утра насобирал — полное ведро. Выбирай, с какого начнём.'],
 ['b14','Соседи спрашивают, кто у нас во дворе самый умный. Я говорю: сейчас проверим.']];
function cands(){var c=[],h=st()||{},yd=dk(-1),td=dk(0),ul=null,tn=null;try{ul=S.uiLast;tn=TK.indexOf(S.uiTopic)>=0?TN[S.uiTopic]:null;}catch(_){}
  // 1) банк П1 (rv-say.js) — читать, не править
  try{if(W.RVSAY&&typeof RVSAY.pick==='function'){var r=RVSAY.pick('home',{away:h.ab||0,day:day(),S:S});if(r){if(typeof r==='string')c.push(['p1:'+r.length+r.slice(0,12),r]);else if(r.t)c.push([r.id||('p1:'+r.t.slice(0,12)),r.t]);}}}catch(_){}
  // 2) вернулся после перерыва
  if(h.ab>=2){var n=h.ab;c.push(['ab',n>=7?'Неделю тебя не было! Я уж думал — на дачу укатили до весны. Садись, соскучился.':
    'Целых '+n+' '+pl(n,'день','дня','дней')+' тебя не было — я уж думал, на дачу укатили. Садись, соскучился.']);}
  // 3) вчерашняя лестница / сегодняшние успехи
  if(ul&&ul.k===yd&&ul.g>0&&ul.g<10)c.push(['yl','Вчера дошли до '+ul.g+'-й ступеньки. Сегодня — до самого верха?']);
  if(ul&&ul.k===td&&ul.g===10)c.push(['t10','Вся лестница — до верха! Вот это знаток. Ещё одну?']);
  else if(ul&&ul.k===td&&ul.g>=5)c.push(['t5','Хорошо идёшь! '+(tn?'Ещё «'+tn.n+'» или другую тему?':'Ещё лестницу?')]);
  // 4) вчерашняя викторина дня (у всех одна)
  try{var dv=S.daily&&S.daily[yd];if(typeof dv==='number'&&dv>0)c.push(['dy','Вчера в викторине дня у тебя было '+dv+' из 10. Сегодня вопросы новые — одни на весь двор.']);}catch(_){}
  // 5) новая тема на полке, сезон/праздник
  try{var nw=W.VT&&VT.list.filter(function(x){return VT.isNew(x.k,nowMs());})[0];if(nw)c.push(['nw_'+nw.k,'На полке новая тема — «'+nw.n+'»! Загляни в «Темы».']);}catch(_){}
  try{var sn=W.VT&&VT.seasonNow&&VT.seasonNow(nowMs());if(sn&&TK.indexOf(sn.k)>=0&&BYT[sn.k]&&BYT[sn.k].length>=10){var sN=VT.festName?VT.festName(sn.k):sn.n;
    c.push(['sn_'+sn.k,sn.kind==='sea'?'Сезон во дворе: «'+sN+'»! Вопросы про это — до '+(VT.festTill?VT.festTill(sn.k).replace('до ',''):'конца сезона')+'.':'Праздник во дворе: «'+sN+'»! Такие вопросы — только эти дни.']);}}catch(_){}
  // 6) банк на каждый день (по кругу)
  var i=Math.abs(ddiff(20260101,td))%BANK.length;c.push(BANK[i]);c.push(BANK[(i+1)%BANK.length]);
  return c;}
function say(){try{if(lcurOk()){var lc=S.lcur;return 'Лестница ждёт: вопрос '+(lc.i+1)+' из 10. Доиграем?';}}catch(_){}
  var h=st(),c=cands(),td=dk(0);if(!h)return c[0]?c[0][1]:null;
  if(h.sd!==td){h.pi=h.si||'';h.sd=td;h.si='';}
  var cur=h.si&&c.filter(function(x){return x[0]===h.si;})[0]; // сегодня уже выбрана и всё ещё к месту — держим
  if(!cur)cur=c.filter(function(x){return x[0]!==h.pi;})[0]||c[0];
  if(cur&&h.si!==cur[0]){h.si=cur[0];sv();}
  return cur?cur[1]:null;}

// ---- лента главного: остаётся только листок дня ----
var FALLBACK=['car-qday','ux-gift','car-fin','car-today'];
function slots(list){var day=list.filter(function(x){return x&&x.id==='rv-day';});if(day.length&&flag('day'))return day;
  // без листка П4 (rv.day выключен) — ОДНА карточка: первая, которой есть что сказать (вопрос дня → гостинец → финал района → «Сегодня»)
  if(newbie()&&day()<2)return []; // новичку в 1-й день — только лестница (листок и викторина дня — со 2-го)
  var c=FALLBACK.map(function(id){return list.filter(function(x){return x&&x.id===id;}).pop();}).filter(Boolean),ch=null;
  return [{id:'rv-fb',order:1,render:function(ctx){ch=null;for(var i=0;i<c.length;i++){var r=null;try{r=c[i].render?c[i].render(ctx):null;}catch(_){}if(r){ch=c[i];return r;}}return null;},
    mount:function(el,ctx){if(ch&&ch.mount)try{ch.mount(el,ctx);}catch(_){}}}];}

// ---- нижняя панель: Темы · Затеи · Мой двор · Награды ----
function navList(list){var by={};list.forEach(function(x){if(x&&x.id)by[x.id]=x;});var o=[],cur=W.UIH&&UIH.cur?UIH.cur():'';
  o.push({id:'topics',order:10,ic:'📚',t:'Темы',go:'topics',on:function(){return cur==='scr-topics';}});
  var dz=by.doska;if(dz&&!(dz.hide&&dz.hide()))o.push({id:'doska',order:20,ic:'🎲',t:'Затеи',go:dz.go,dot:dz.dot,on:function(){return cur==='scr-zatei'||cur==='scr-doska';}});
  var yd=by.yard;o.push({id:'yard',order:30,ic:'🏠',t:'Мой двор',go:yd&&yd.go&&yd.go!=='menu'?yd.go:'yard',dot:yd&&yd.dot,on:function(){return cur==='scr-yard';},hide:function(){return !UI.has('yard');}});
  o.push({id:'awards',order:40,ic:'🏅',t:'Награды',go:'awards',dot:awDot,on:function(){return cur==='scr-awards';}});
  return o;}
function awDot(){try{var f=W.CAR&&CAR.finState&&CAR.finState();return !!(f&&f.ready&&f.free);}catch(_){return false;}}

// ---- экран «Награды»: звание и районы, марки, лига + медали тем (было окно «Медали» — поломка №22: «Закрыть» внизу, панель не нажималась) ----
function look(){try{return UIH.look();}catch(_){return {t:'',s:''};}}
function ensure(){var sc=$('scr-awards');if(sc)return sc;sc=D.createElement('section');sc.id='scr-awards';sc.className='screen awS';
  sc.innerHTML='<header class="gh"><button class="icon" id="awBack" aria-label="Назад">←</button><div class="gt"><div>Награды</div><div class="sub" id="awSub"></div></div><button class="pill sm" id="awCoins">💰 0</button></header><div class="awBody" id="awBody"></div>';
  var app=$('app')||D.body,ref=$('modal');if(ref&&ref.parentNode===app)app.insertBefore(sc,ref);else app.appendChild(sc);
  $('awBack').onclick=function(){try{SND.tap();}catch(_){}openMenu();};
  $('awCoins').onclick=function(){try{openCoins(awards);}catch(_){}};
  try{UIH.navOn('scr-awards');}catch(_){}
  return sc;}
function row(id,ic,t,s,dot){return '<button class="awR noenter" id="'+id+'"><span class="awI">'+ic+'</span><span class="awT"><b>'+e(t)+'</b>'+(s?'<small>'+e(s)+'</small>':'')+'</span>'+(dot?'<span class="dot"></span>':'')+'<i class="go">›</i></button>';}
function awards(){ensure();try{hideModal();}catch(_){}
  try{STAT.screen('medals');}catch(_){}
  var c=look(),lk=W.LK&&LK.on&&LK.on(),av='valerka';try{av=S.uiAv&&(HELP[S.uiAv]||S.uiAv==='zina')?S.uiAv:'valerka';}catch(_){}
  var h='<div class="awTop">'+(lk?'<button class="awAv noenter" id="awAv" aria-label="Портрет"><span class="frm fr-'+e(c.fr||'wood')+'">'+LK.who(av,'happy')+'</span></button>':'')
    +'<div class="awRank"><small>Звание</small><b>'+e(c.t||'')+'</b><span>Уровень '+(lvl()+1)+'</span></div></div>';
  var rows='';
  if(W.CAR&&c.go)rows+=row('awCar','🏆','Звание и районы',c.dist?'район «'+c.dist+'» · '+(c.s||''):(c.s||''),!!c.fin);
  if(W.YD&&YD.stampCount){var n=YD.stampCount();rows+=row('awStp','📨','Марки',n?n+' '+pl(n,'марка','марки','марок')+' в альбоме':'альбом пока пустой');}
  if(W.YD&&YD.lgName)rows+=row('awLg','🥇','Лига двора',YD.lgName());
  if(rows)h+='<div class="awRows">'+rows+'</div>';
  // медали тем — как было в окне «Медали тем»
  var md='',nT=0,sum=0;
  try{for(var i=0;i<TOPICS.length;i++){var t=TOPICS[i],n0=tcOf(t.k);sum+=n0;if(!(n0>0||(TK.indexOf(t.k)>=0&&!t.season)))continue;if(!t.season)nT++;
      var nx=tcNext(t.k),top=nx?TCM.filter(function(v){return v>n0;})[0]:TCM[2],w=Math.min(100,Math.round(100*n0/top));
      md+='<div class="mdr">'+t.ic+'<span>'+e(t.n)+(S.tp[t.k]?' <small>⭐'+S.tp[t.k]+'</small>':'')+'<br><small>'+(n0?n0+' '+pl(n0,'верный','верных','верных'):'ещё не играли')+(nx?' · до '+nx.m+' '+nx.need:' · мастер!')+'</small><span class="bar"><i style="width:'+w+'%"></i></span></span><i>'+(TMEDAL(n0)||'')+'</i></div>';}
    var tot=Math.max(S.correct||0,sum); // поломка №3: у темы «17 верных», а внизу «верных ответов: 16» (S.correct не считал часть режимов) — берём не меньше суммы по темам
    h+='<h3 class="awH">🏅 Медали тем · '+medalsN()+' из '+nT+'</h3><p class="awP">Медаль темы — за верные ответы в ней: 🥉 '+TCM[0]+', 🥈 '+TCM[1]+', 🥇 '+TCM[2]+'. ⭐ — вся лестница 10 из 10.</p><div class="medals">'+md+'</div>'
      +'<p class="goal">Лестниц до верха: ⭐ '+(S.wins||0)+' · лучший результат: '+(S.best||0)+' из 10 · верных ответов: '+tot+'</p>';}catch(x){try{console.warn('awards',x);}catch(_){}}
  $('awBody').innerHTML=h;$('awSub').textContent='';$('awCoins').textContent='💰 '+(S.coins||0);
  try{if(W.LK&&LK.on()&&LK.scan)LK.scan($('scr-awards'));}catch(_){}
  var b=function(id,f){var x=$(id);if(x)x.onclick=function(){try{SND.tap();}catch(_){}f();};};
  b('awAv',function(){try{UIH.me();}catch(_){}});
  b('awCar',function(){try{c.go();}catch(_){}});
  b('awStp',function(){if(YD.open)YD.open('stamps',awards);else UI.go('yard-stamps');});
  b('awLg',function(){if(YD.open)YD.open('league',awards);else UI.go('yard-league');});
  try{__show('scr-awards');}catch(_){try{UI.show('scr-awards');}catch(__){}}
  try{if(W.LK&&LK.scene)LK.scene('dim');}catch(_){}
  $('awBody').scrollTop=0;}

// ---- шапка главного: уровень вместо звания (обрезалось «Слушатель лавоч…», поломка №10) ----
function header(){try{if(W.RV&&RV.mark)RV.mark('home');}catch(_){}var r=$('meRank'),n=$('meNext');if(!r)return;r.textContent='Уровень '+(lvl()+1);if(n)n.textContent='🏅 награды';var m=$('meCard');if(m)m.setAttribute('aria-label','Уровень и награды');}

// ---- музыка: по умолчанию включена тихо (S.music: true — вкл, false — игрок выключил, нет поля — как скажет флаг) ----
function mus(){return flag('mus');}

var RVH={on:function(){return flag('home');},boardOn:function(){return flag('board');},flag:flag,day:day,newbie:newbie,boardOpen:boardOpen,say:say,slots:slots,nav:navList,awards:awards,header:header,mus:mus,
  _bank:BANK,_cands:cands};
W.RVH=RVH;
function cls(){try{D.documentElement.classList.toggle('rvh',RVH.on());}catch(_){}}
cls();D.addEventListener('DOMContentLoaded',cls);
// «Награды» и прежние «Медали» — один экран (роутер UX); регистрируем после основного скрипта
function reg(){if(!W.UI||!UI.screen||!RVH.on())return;UI.screen('awards',awards);UI.screen('medals',awards);
  var m=$('meCard');if(m){var old=m.onclick;m.onclick=function(ev){if(!RVH.on()){if(old)return old.call(this,ev);return;}try{SND.tap();}catch(_){}awards();};}}
W.addEventListener('load',function(){setTimeout(reg,0);if(RVH.on())try{st();}catch(_){}}); // день 1 новичка — с первого входа (до первой лестницы)
// облако: старый игрок на новом устройстве (местно пусто → «новичок») — из облака приходит прошлое: не новичок, день — самый ранний
W.addEventListener('load',function(){var m=W.mergeSave;if(typeof m!=='function'||m.__rvh)return;
  var f=function(d){var l=null;try{l=S.rvH&&typeof S.rvH==='object'?{d0:S.rvH.d0,nw:S.rvH.nw}:null;}catch(_){}var r=m.apply(this,arguments);
    try{var h=S.rvH,c=d&&typeof d.rvH==='object'?d.rvH:null;if(l&&h&&typeof h==='object'){
      if(typeof l.d0==='number'&&(typeof h.d0!=='number'||l.d0<h.d0))h.d0=l.d0;
      if(c&&typeof c.d0==='number'&&c.d0>=20200101&&c.d0<h.d0)h.d0=c.d0;
      h.nw=(l.nw&&!(c&&c.nw===0)&&!(!c&&d&&((+d.games||0)>1||(+d.lvl||0)>0)))?1:0;}}catch(_){}return r;};
  f.__rvh=1;W.mergeSave=f;});
})();
