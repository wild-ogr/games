'use strict';
/* zb2-cal-ui — окно «Отрывной календарь бабы Зины» (грузится лениво из zb2-cal.js, поток CAL, буст_в2.0).
   Одно окно при входе: листок дня с советом, 🔥 серия, неделя из 7 листков (или 7 конвертов «Недели первоклассника»), подарок «Забрать»,
   прощение/спасение/подарок вернувшемуся, итог недели Соседок (понедельник), строка «Сегодня в Школе», строки других потоков (ZB2CAL.add),
   задание дня «Начать». Стили — css/zb2-cal.css (вставляется сюда же). */
(function(){
var C=window.ZB2CAL;if(!C)return;
var D=document,$$=function(id){return D.getElementById(id);};
(function(){if($$('zcCss'))return;var l=D.createElement('link');l.id='zcCss';l.rel='stylesheet';l.href='css/zb2-cal.css';D.head.appendChild(l);})();
var MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
  WD=['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function coin(){try{return COIN_I;}catch(e){return '💰';}}
function face(m){try{return zinaSVG(m||'happy');}catch(e){return '👵';}}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function tap(){try{SND.tap();}catch(e){}}
function E(){return window.ZBECO||{};}
// совет на обороте листка: номер дня в году (данные — zb2-cal-data.js, лениво)
function doy(k){var y=Math.floor(k/10000);return C.dn(k)-C.dn(y*10000+101);}
var TIPS=null;function tips(){return TIPS||(TIPS=ZB.load('js/zb2-cal-data.js').then(function(){return window.ZB2CAL_TIPS||[];},function(){return [];}));}
function tipFill(k){tips().then(function(L){var e=$$('zcTip');if(!e||!L.length)return;e.innerHTML='<i>Совет бабы Зины на обороте:</i> '+esc(L[doy(k)%L.length]);e.style.display='';});}

/* ---------- что за подарок сегодня ---------- */
function today(){var o=C.c(),k=C.day(),w=o.g===C.tk()?(C.w1on&&o.w>0&&o.w<=7&&o.k<=7?o.w:0):C.w1(),g=w?C.w1g(w):C.gift(k),cf=C.cfg(),mul=C.fest()?2:1,
  back=o.q==='l'&&o.m>=(cf.backDays||2)?(cf.back||50):0;return {k:k,w:w,g:g,mul:mul,back:back,c:(g.c||0)*mul+back};}
function giftLine(t){var g=t.g,a=[];
  if(t.w){var env=C.ENV[g.k]||'✉️ Конверт';a.push('<b>'+env+'</b>');}
  else if(g.box)a.push('<b>'+C.BOX[g.box]+'</b>');
  if(t.c)a.push('+'+t.c+' '+coin());if(g.hb)a.push('💡 +'+g.hb);
  if(g.part===1)a.push('🧵 часть наряда ('+Math.min((C.c().p||0)+1,C.cfg().parts||4)+'/'+(C.cfg().parts||4)+')');
  if(g.part==='bant')a.push('👗 наряд «Первоклассница»');
  return a.join(' · ');}
// неделя: 7 листков дня серии или 7 конвертов
function week(t,taken){var h='',o=C.c();
  if(t.w){for(var i=1;i<=7;i++){var e=C.w1g(i),nm=C.ENV[e.k]||'✉️',ic=nm.split(' ')[0],done=i<t.w||taken&&i===t.w,now=i===t.w&&!taken,nx=i===t.w+1;
      h+='<div class="zc-d'+(done?' got':'')+(now?' now':'')+(nx?' nx':'')+'"><small>'+i+'-й</small><b>'+(done?'✓':now||nx?ic:'✉️')+'</b>'+(nx?'<em>завтра</em>':'')+'</div>';}
    return '<div class="zc-wk w1">'+h+'</div>';}
  var k=t.k,b=Math.floor((k-1)/7)*7;
  for(var j=1;j<=7;j++){var n=b+j,g=C.gift(n),done=n<k||taken&&n===k,cur=n===k&&!taken,ic=g.box==='posylka'?'📦':g.box==='sunduk'?'🧰':g.c?'+'+g.c:g.hb?'💡':'·';
    h+='<div class="zc-d'+(done?' got':'')+(cur?' now':'')+(g.box?' box':'')+'"><small>'+n+'-й</small><b>'+(done?'✓':ic)+'</b></div>';}
  return '<div class="zc-wk">'+h+'</div>';}
// реплика Зины: прощение / сгорела / вернувшийся / праздник / обычная
function sayTxt(t){var o=C.c(),n=C.streak();
  if(C.fest())return 'Сегодня выходной во дворе! Даже кот не работает — а подарок двойной.';
  if(o.q==='f')return pick(['Ять отрывал листки за тебя, но один съел. Серия цела — на этой неделе он больше не прикроет!','Кот Ять караулил календарь, пока тебя не было. Листок пожевал, но серию сберёг. Один раз в неделю — не чаще!']);
  if(o.q==='s')return 'Ять уже прикрывал тебя на этой неделе — второй раз сам не может. Серия '+o.n+' '+pl(o.n,'день','дня','дней')+' вот-вот сгорит!';
  if(o.q==='l'&&t.back)return pick(['Прогульщик! Начинаем заново — держи на тетрадку.','Сколько лет, сколько зим! Серия сгорела, зато гостинец тебе отложила.']);
  if(o.q==='l')return 'Серия прервалась — не беда. Начнём новую: заходи каждый день, подарки будут расти!';
  if(t.w===1)return 'Первая неделя в моей школе! Каждый день — новый конверт. Что в нём — увидишь, когда откроешь.';
  if(t.w)return pick(['Ещё конверт! Я их по порядку подписала — не перепутай.','Почтальонка Люся принесла конверт. Говорит, для тебя лично.']);
  if(t.g.box==='sunduk')return 'Седьмой день подряд! Открываю сундук недели — там кое-что для наряда.';
  if(t.g.box==='posylka')return 'Внук прислал посылку! Пишет: «Бабуля, раздели с тем, кто разгадывает».';
  return n?pick(['Пришёл! Отрываю листок — серия '+(n+1)+' '+pl(n+1,'день','дня','дней')+'.','Каждый день заходишь — вот это внук! Держи листок.','Я знала, что придёшь. Кот — не верил.']):'Отрываю листок! Заходи каждый день и проходи хоть один урок — подарок будет расти.';}
// строка «Сегодня в Школе: …» — первое несделанное дело дня (SCHOOL) и строки других потоков
function lines(){var h='',L=[];
  try{if(window.ZBTD&&ZBTD.list){var x=ZBTD.list().filter(function(i){return !i.done;})[0];if(x)L.push('Сегодня в Школе: '+(x.ic||'📒')+' '+esc(x.t||''));}}catch(e){}
  // записки ZAP: «Ять повесил записку» (по нажатию — холодильник)
  try{var Zp=window.ZB2ZAP,zl=Zp&&Zp.list?Zp.list():[];if(zl&&zl.length)L.push('<a href="#" class="zc-zap" id="zcZap">📌 Ять повесил '+(zl.length>1?zl.length+' записки':'новую записку')+' на холодильник'+(zl[0].t?': «'+esc(String(zl[0].t).replace(/<[^>]+>/g,'').slice(0,40))+'»':'')+' ›</a>');}catch(e){}
  C.lines().slice().sort(function(a,b){return (a.order||0)-(b.order||0);}).forEach(function(x){var v=ZB.safe('cal-add-'+x.id,function(){return typeof x.html==='function'?x.html():x.html;});if(v)L.push(v);});
  L.slice(0,3).forEach(function(x){h+='<p class="zc-ln">'+x+'</p>';});return h;}
// итог недели Соседок (понедельник) — внутри окна (sosedki.js: sosCalHtml / sosCalTake)
function sosHtml(){try{if(typeof sosCalHtml==='function')return sosCalHtml()||'';}catch(e){}return '';}

/* ---------- окно ---------- */
var then=null;
// zfix: что дальше после окна (из окна победы — следующий уровень); один раз
function go(){var t=then;then=null;if(t)try{t();}catch(e){}}
if(C.w1()&&!window.ZB2W1)ZB.load('js/zb2-week1.js').catch(function(){});
function open(o){o=o||{};then=o.then||null;var c=C.c(),T=C.tk(),taken=c.g===T,t=today();
  var d=new Date(Math.floor(T/10000),Math.floor(T/100)%100-1,T%100,12),n=C.streak();
  if(!o.view&&!taken)C.ev({a:'show',n:t.k,w:Math.floor((t.k-1)/7)+1,f:t.w?'w1':''});
  var save=c.q==='s'&&!taken;
  var head='<div class="zc-top"><div class="zc-leaf"><small>'+MON[d.getMonth()]+'</small><b>'+d.getDate()+'</b><span>'+WD[d.getDay()]+'</span></div>'+
    '<div class="zc-hd"><h2>'+(t.w?'Неделя первоклассника':'Отрывной календарь')+'</h2><p class="zc-fire2">'+(n?'🔥 Серия: <b>'+n+' '+pl(n,'день','дня','дней')+'</b>':'🔥 Серия начнётся с первого урока')+
    (c.b>1?'<small> · лучшая '+Math.max(c.b,n)+'</small>':'')+'</p></div></div>';
  var body=taken?'<div class="zc-say"><div class="av">'+face('happy')+'</div><p>Сегодняшний листок уже оторван.'+(C.tomorrow()?' '+C.tomorrow().replace(/^Завтра у Зины: /,'Завтра: '):'')+'</p></div>'+week(t,true)
    :'<div class="zc-say"><div class="av">'+face(c.q==='s'?'wow':'happy')+'</div><p>'+esc(sayTxt(t))+'</p></div>'+
      (save?'<div class="zc-save" id="zcSave"><button type="button" class="btn green zbad" id="zcAd">🎬 Спасти серию за рекламу</button><button type="button" class="btn ghost small" id="zcNo">Начать заново</button></div>':'')+
      '<div id="zcBody"'+(save?' style="display:none"':'')+'>'+week(t,false)+'<div class="zc-gift" id="zcGift">'+(t.w?'<small>Сегодня в конверте:</small>':'<small>Подарок '+t.k+'-го дня:</small>')+giftLine(t)+
      (t.mul>1?'<em>×2 — выходной во дворе</em>':'')+(t.back?'<em>+'+t.back+' за возвращение</em>':'')+'</div>'+sosHtml()+'</div>';
  var tip='<p class="zc-tip" id="zcTip" style="display:none"></p>';
  modal('<div class="zc-win">'+head+body+tip+'<div id="zcLn">'+(taken?'':lines())+'</div><div class="btns" id="zcBtns">'+
    (taken?'<button type="button" class="btn blue" id="zcOk">Хорошо</button>':'<button type="button" class="btn green" id="zcTake"'+(save?' style="display:none"':'')+'>🎁 Забрать</button>')+'</div></div>');
  tipFill(T);
  bindZap();
  var b=$$('zcTake');if(b)b.onclick=function(){take(t);};
  var ok=$$('zcOk');if(ok)ok.onclick=function(){tap();hideModal();go();};
  var ad=$$('zcAd');if(ad){try{STAT.offer('calsave');}catch(e){}ad.onclick=function(){if(ad.disabled)return;ad.disabled=true;tap();try{STAT.place('calsave');}catch(e){}
    showRewarded(function(){ad.disabled=false;rescue(true);},function(){ad.disabled=false;},
      // поздний зачёт (adt): то же окно открыто — серию спасаем; иначе — монеты по цене ролика
      function(){if(C.c().q==='s'&&$$('zcAd')){rescue(true);return 'серия спасена!';}return adLateCoins();});};}
  var no=$$('zcNo');if(no)no.onclick=function(){tap();rescue(false);};
  try{if(typeof fitWin==='function')fitWin();}catch(e){}}
// после решения о спасении — показать подарок (пересчитанный)
function rescue(yes){C.saved(yes);var t=today(),bd=$$('zcBody'),s=$$('zcSave'),p=D.querySelector('.zc-say p');
  if(s)s.parentNode.removeChild(s);if(p)p.textContent=yes?'Спасли! Кот отдувается, серия цела.':sayTxt(t);
  if(bd){bd.innerHTML=week(t,false)+'<div class="zc-gift" id="zcGift"><small>Подарок '+t.k+'-го дня:</small>'+giftLine(t)+(t.back?'<em>+'+t.back+' за возвращение</em>':'')+'</div>'+sosHtml();bd.style.display='';}
  var fr=D.querySelector('.zc-fire2');if(fr){var n=C.streak();fr.innerHTML=n?'🔥 Серия: <b>'+n+' '+pl(n,'день','дня','дней')+'</b>':'🔥 Серия начнётся с первого урока';}
  var b=$$('zcTake');if(b){b.style.display='';b.onclick=function(){take(t);};}}
function give(n){if(n<=0)return 0;var e=E();try{if(e.give)return e.give('cal',n,'gift');}catch(x){}try{addCoins(n,'gift');}catch(x){}return n;}
function take(t){var o=C.c(),T=C.tk();if(o.g===T)return;tap();var g=t.g,got=give(t.c),extra=[];
  if(g.hb)try{hbAdd(g.hb,'cal');}catch(e){}
  if(g.part===1){o.p++;if(o.p>=(C.cfg().parts||4)&&!(S.own||{})['o:modnica']){C.own('o','modnica');extra.push('👗 Наряд «Модница с рынка» собран — он в «Обликах»!');}}
  if(g.part==='bant'&&!(S.own||{})['o:perv']){C.own('o','perv');extra.push('👗 Наряд «Первоклассница» — в «Обликах»!');}
  if(g.box==='sunduk'&&!(S.own||{})['s:guest']){C.own('s','guest');extra.push('🍽️ И блюдце «С голубой каёмочкой» — за неделю у бабы Зины.');}
  if(t.w)o.w=t.w;
  o.g=T;o.k++;o.q='';o.m=0;S.lg={d:T,n:(S.lg&&+S.lg.n||0)+1};
  try{if(typeof sosCalTake==='function')sosCalTake();}catch(e){}
  try{if(window.ZB2ZAP)ZB2ZAP.hook('cal',1,{id:t.w?'w1':'cal'});}catch(e){}
  C.ev({a:'take',n:t.k,w:Math.floor((t.k-1)/7)+1,f:t.w?'w1':t.mul>1?'x2':'',c:got});
  try{save();cloudSoon();vkmCheck();updGift();updCoins();}catch(e){}
  var gf=$$('zcGift');if(gf){gf.classList.add('got');try{SND.coin();if(got)coinBurst(gf,got);}catch(e){}}
  var wk=D.querySelector('.zc-wk');if(wk){var nw=wk.querySelector('.now');if(nw){nw.classList.remove('now');nw.classList.add('got');nw.querySelector('b').textContent='✓';}}
  var h='';extra.forEach(function(x){h+='<p class="zc-ex">'+esc(x)+'</p>';});
  var W=window.ZB2W1;if(t.w&&W&&W.after)h+=ZB.safe('w1-after',function(){return W.after(t.w);})||'';
  var tm=C.tomorrow();if(tm)h+='<p class="tmr zc-tm">'+tm+'</p>';
  var ln=$$('zcLn');if(ln)ln.insertAdjacentHTML('afterbegin',h);bindZap();
  var dl=(+S.lv||0)>=10&&!(S.daily&&S.daily[T]),bt=$$('zcBtns'),act=t.w&&W&&W.act?ZB.safe('w1-act',function(){return W.act(t.w);}):null;
  bt.innerHTML=(act?'<button type="button" class="btn green" id="zcAct">'+act.t+'</button>':'')+
    (dl?'<button type="button" class="btn '+(act?'blue':'green')+'" id="zcDay">📅 Задание дня — начать</button>':'')+
    '<button type="button" class="btn '+(act||dl?'ghost small':'green')+'" id="zcGo">'+(act||dl?'Потом':'Спасибо, баба Зина!')+'</button>';
  if(act)$$('zcAct').onclick=function(){tap();hideModal();ZB.safe('w1-go',act.go);};
  if(dl)$$('zcDay').onclick=function(){hideModal();try{openDaily();}catch(e){}};
  $$('zcGo').onclick=function(){tap();hideModal();go();};
  try{if(typeof fitWin==='function')fitWin();}catch(e){}
  try{ZB.refresh();C.paint();}catch(e){}}
function bindZap(){var z=$$('zcZap');if(z)z.onclick=function(e){e.preventDefault();tap();hideModal();try{ZB2ZAP.open();}catch(x){}};}
window.ZB2CALUI={open:open,today:today,tips:tips};
})();
