/* RB:UX — новый главный экран «Рыбалки с Петровичем» (буст 08.10.2026, поток UX).
   Слой поверх старой карты: старый openMap() отрабатывает как раньше (все его части живы и скрыты — их кнопки
   по-прежнему можно «нажать» из кода), а поверх рисуется новый экран #uiHome:
   - «Сегодня»: Петрович и его прогноз + большая «На рыбалку» (одно касание — сразу в советуемое место и время);
   - кольца «Цели · Турнир · Двор» (пока Двора нет — «Месяц»);
   - плитки мест 2 в ряд (ПК — сетка), группы по главам (данные глав — от NORTH, см. uiChapters);
   - новичку (до 3 рыбалок) — только места и «Снасти»;
   - снизу (ПК — вкладки сверху): Альбом · Снасти · Магазин · Почта; 💰 с «+» — в магазин.
   Крючки для других потоков: гнёзда mapSlots (index.html), window.uiDvor (кольцо «Двор», MG0), window.shopOpen (вход в магазин, SHOP),
   window.uiChapters (главы, NORTH). Поля сохранения UX — S.ui*. */
(function(){
'use strict';
if(typeof openMap!=='function')return;
var $=function(id){return document.getElementById(id);};
var NEWBIE=3; // до стольких рыбалок — упрощённый экран
function newbie(){return (S.sessions||0)<NEWBIE;}
function sh(i){return LANG==='en'?nm(PLACES[i]).replace(/^(Lake|The) /,''):(P_SH[i]||nm(PLACES[i]));} /*MERGE: в en короче («Ladoga» вместо «Lake Ladoga») — подпись под «Go fishing» на 390 не обрезается*/
function biteLv(m){return m>1.2?3:m>.95?2:1;}
function dots(n,of){var h='<span class="uh-dots" aria-label="'+L('клёв ','bite ')+n+'/'+of+'">';for(var k=1;k<=of;k++)h+='<i class="'+(k<=n?'on':'')+'"></i>';return h+'</span>';}
function biteWord(n){return n>=3?L('клёв сильный','strong bite'):n>=2?L('клёв хороший','good bite'):L('клёв слабый','weak bite');}

/* ---- магазин: вход даёт UX, полки делает SHOP (window.shopOpen(tab)). Без SHOP — старые окна ---- */
function payOn(){try{return fbSpecOn();}catch(e){return false;}}
window.uiShop=function(tab){SND.tap();if(typeof window.shopOpen==='function'){try{return window.shopOpen(tab);}catch(e){}}
  if(tab==='coins')return openCoins();if(payOn())return openShop('p');return openCoins();};

/* ---- главы: NORTH может задать window.uiChapters() → [{id,n,nE,places:[i…],lock:'текст или пусто'}]. Без него — одна группа ---- */
function chapters(){if(typeof window.uiChapters==='function'){try{var c=window.uiChapters();if(c&&c.length)return c;}catch(e){}}
  var ord=typeof PLACE_ORD!=='undefined'?PLACE_ORD.slice():PLACES.map(function(p,i){return i;});
  PLACES.forEach(function(p,i){if(ord.indexOf(i)<0)ord.push(i);});
  if(typeof CHAPTERS!=='undefined'&&CHAPTERS.length>1){var gs=CHAPTERS.map(function(c){return {id:c.id,n:c.n,nE:c.en,places:ord.filter(function(i){return PLACES[i].ch===c.id;})};});
    var rest=ord.filter(function(i){return !gs.some(function(g){return g.places.indexOf(i)>=0;});});if(rest.length)gs[gs.length-1].places=gs[gs.length-1].places.concat(rest);
    return gs.filter(function(g){return g.places.length;});}
  return [{id:'all',n:'',places:ord}];}
function prevOf(i){if(typeof prevPlace==='function')return prevPlace(i);return i-1;}

/* ---- прогноз «Сегодня» ---- */
function today(){var tod=window.__todForce||todOf(hourNow());
  if(newbie()||(S.caught||0)<1){var pi=0;PLACES.forEach(function(p,i){if(S.open[i]&&i<=1)pi=i;});var c=condFor(pi,tod);
    return {pi:pi,t:tod,m:a2BiteM(pi,tod,c.wx),f:'',nb:1};}
  var o=null;try{o=a3Fore(dayNum());}catch(e){}
  if(!o||!S.open[o.pi]){var c2=condFor(topPlace(),tod);return {pi:topPlace(),t:tod,m:a2BiteM(topPlace(),tod,c2.wx),f:''};}
  return o;}
function goalTrip(){var o=null;try{o=goalNext();}catch(e){}return o&&o.go==='p'&&S.coins>=o.p?o:null;}

function todayHtml(){var o=today(),P=PLACES[o.pi],bl=biteLv(o.m),gt=goalTrip(),say,go,sub;
  if(gt){say=L('Хватает на путёвку на «'+nm(PLACES[gt.i])+'» — поехали?','You can afford a trip to «'+nm(PLACES[gt.i])+'» — shall we go?');
    go=L('Купить путёвку','Buy the trip');sub=nm(PLACES[gt.i])+' · '+coinsTxt(gt.p);}
  else if(o.nb){say=(S.sessions||0)<1?L('Пойдём на '+(o.pi?'речку':'пруд')+' — карась сейчас клюёт. Я покажу, как забрасывать.','Let\'s go to the '+(o.pi?'stream':'pond')+' — I\'ll show you how to cast.')
      :L('Клюёт! Сходим ещё разок — каждая рыбалка даёт монеты на снасти.','They\'re biting! Let\'s go again — every trip earns coins for tackle.');
    go=L('На рыбалку','Go fishing');sub=nm(P)+' · '+L(TOD_N[o.t][0],TOD_N[o.t][1]).toLowerCase();}
  else{say=L('Сегодня <b>'+esc(nm(P))+', '+TOD_AT[o.t]+'</b>','Today: <b>'+esc(nm(P))+', '+TOD_N[o.t][1].toLowerCase()+'</b>')+(o.f?L(' — '+esc(nm(FISH[o.f]).toLowerCase())+' берёт хорошо. Поехали?',' — '+esc(nm(FISH[o.f]).toLowerCase())+' is biting. Shall we?'):L('. Поехали?','. Shall we?'));
    go=L('На рыбалку','Go fishing');sub=sh(o.pi)+' · '+L(TOD_N[o.t][0],TOD_N[o.t][1]).toLowerCase()+' · '+biteWord(bl);}
  var g=null;try{g=goalNext();}catch(e){}var gOk=g&&!gt&&S.coins>=g.p&&!newbie();
  // турнир недели позвать после 3–5 рыбалок, пока в нём не играл на этой неделе (сыгравшие в первый день возвращаются вдвое чаще)
  var tour=false;try{var wk=weekNum();tour=(S.sessions||0)>=3&&(S.sessions||0)<=12&&!(S.week&&S.week.w===wk&&S.week.best>0)&&S.uiTour!==wk&&!gt;}catch(e){}
  return '<section class="uh-today"><div class="uh-say"><span class="uh-av">'+(window.LOOK&&LOOK.av?LOOK.av('petr'):'')+'</span><p><b class="uh-who">'+L('Петрович','Petrovich')+'</b>'+(gt||o.nb?esc(say):say)+'</p>'
    +(o.nb?'':'<button class="uh-q noenter" id="uhFore" aria-label="'+L('Прогноз Петровича','Forecast')+'">🔮</button>')+'</div>'
    +'<button class="uh-go noenter" id="uhGo"><span class="uh-goi">'+(gt?'🎫':'🎣')+'</span><span><b>'+esc(go)+'</b><small>'+esc(sub)+'</small></span></button>'
    +(tour?'<button class="uh-row uh-tour noenter" id="uhTour"><span>🏆</span><span><b>'+L('Турнир недели','Weekly contest')+'</b> — '+L('у всех одна снасть, попробуй!','same tackle for all, give it a go!')+'</span><i>›</i></button>':'')
    +(gOk?'<button class="uh-row uh-goal noenter" id="uhGoal"><span>🛒</span><span><b>'+L('Хватает на: ','You can afford: ')+'</b>'+esc(g.s)+'</span><i>›</i></button>':'')
    +'</section>';}

/* ---- кольца ---- */
function ring(p,cls){p=Math.max(0,Math.min(1,p||0));var r=17,c=2*Math.PI*r;
  return '<svg class="uh-ring '+(cls||'')+'" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="'+r+'" class="bg"/><circle cx="22" cy="22" r="'+r+'" class="fg" stroke-dasharray="'+(c*p).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 22 22)"/></svg>';}
function ringsHtml(){var n=0;try{n=a3DoneN();}catch(e){}var wl=1;try{wl=weekLeft();}catch(e){}
  var items=[['uhDaily',ring(n/3,'g'),L('Цели дня','Daily goals'),n+' '+L('из','of')+' 3',n>=3?'':'dot'],
    ['uhWeek',ring((7-wl)/7,'b'),dayOn()?L('Турниры','Contests'):L('Турнир','Contest'),wl<=1?L('последний день','last day'):(LANG==='en'?'':'ещё ')+wl+' '+pl(wl,'день','дня','дней','day left','days left'),'']];
  var dv=null;if(typeof window.uiDvor==='function'){try{dv=window.uiDvor();}catch(e){dv=null;}}
  if(dv)items.push(['uhDvor',ring(dv.p,'o'),dv.n||L('Двор','Yard'),dv.sub||'',dv.dot?'dot':'']);
  else{var dn=0,ev='';try{dn=Object.keys(a3Mp().g).length;ev=a3Ev();}catch(e){}
    var mo=new Date(nowMs()).getMonth();items.push(['uhMonth',ring(dn/10,'o'),ev==='aut'?L('Осень','Autumn'):L('План','Plan'),dn+' '+L('из','of')+' 10','']);}
  return '<div class="uh-rings">'+items.map(function(x){return '<button class="uh-rb noenter" id="'+x[0]+'">'+x[1]+'<span><b>'+x[2]+'</b><small>'+x[3]+'</small></span>'+(x[4]?'<i class="dot"></i>':'')+'</button>';}).join('')+'</div>';}

/* ---- строки ПК-колонки: звание, заказы ---- */
function sideRows(){var r=rankOf(S.caught||0),i=RANKS.indexOf(r),nx=RANKS[i+1],p=nx?((S.caught||0)-r[0])/(nx[0]-r[0]):1,h='';
  h+='<button class="uh-row noenter" id="uhRank"><span>🏅</span><span><b>'+esc(L(r[1],r[2]))+'</b> · '+(S.caught||0)+' '+L('рыб','fish')+'<span class="gbar"><i style="width:'+Math.round(p*100)+'%"></i></span></span><i>›</i></button>';
  var left=0;try{left=a2OrdLeft();}catch(e){}
  h+='<button class="uh-row noenter" id="uhOrd2"><span>📋</span><span><b>'+L('Заказы соседей','Orders')+'</b> · '+(left?left:'✓')+'</span><i>›</i></button>';
  return h;}

/* ---- плитки мест ---- */
function tileHtml(i,tod,fo){var p=PLACES[i],open=!!S.open[i],pv=prevOf(i),prev=pv<0||!!S.open[pv],h='',cls='uh-pl';
  if(!open)cls+=' lock';if(!open&&prev&&S.coins>=p.p)cls+=' new';
  if(open){var c=condFor(i,tod),m=a2BiteM(i,c.tod,c.wx),bl=biteLv(m),sp=p.fish.filter(function(id){return S.alb[id];}).length,sr=0;try{sr=setsReady(i).length;}catch(e){}
    h='<b>'+esc(nm(p))+'</b><span class="uh-pm">'+dots(bl,3)+'<small>'+L('виды','species')+' '+sp+'/'+p.fish.length+'</small>'+(sr?'<small class="uh-gift">🎁</small>':'')+'</span>';}
  else if(prev){var ok=S.coins>=p.p;h='<b>'+esc(nm(p))+'</b><span class="uh-pr'+(ok?'':' no')+'">🎫 '+coinsTxt(p.p)+'</span>'+(ok?'':'<span class="gbar"><i style="width:'+Math.round(S.coins/p.p*100)+'%"></i></span>');}
  else h='<b>'+esc(nm(p))+'</b><small class="uh-lk">🔒 '+L('после «','after «')+esc(sh(pv))+'»</small>';
  var badge=fo&&fo.pi===i&&open&&!newbie()?'<span class="uh-badge">'+L('Петрович советует','Petrovich advises')+'</span>':'';
  return '<button class="'+cls+' noenter" data-pl="'+i+'"><span class="uh-th" data-th="'+i+'"></span>'+badge+'<span class="uh-pi">'+h+'</span></button>';}
function placesHtml(){var tod=window.__todForce||todOf(hourNow()),fo=today(),chs=chapters(),nOpen=PLACES.filter(function(p,i){return S.open[i];}).length,left=0;
  if(!newbie())try{left=a2OrdLeft();}catch(e){}
  var h='<div class="uh-ph"><span>'+L('Места','Places')+' · '+nOpen+' '+L('из','of')+' '+PLACES.length+'</span>'+(newbie()?'':'<button class="uh-lnk noenter" id="uhOrd">📋 '+L('Заказы соседей','Orders')+(left?': '+left:' ✓')+' ›</button>')+'</div>';
  chs.forEach(function(ch){if(chs.length>1)h+='<div class="uh-ch"><b>'+esc(L(ch.n||'',ch.nE||ch.n||''))+'</b>'+(ch.lock?'<small>'+esc(ch.lock)+'</small>':'')+'</div>';
    h+='<div class="uh-grid">'+ch.places.map(function(i){return tileHtml(i,tod,fo);}).join('')+'</div>';});
  return h;}

/* ---- навигация (телефон — снизу, ПК — вкладки сверху) ---- */
function navItems(){var nb=newbie(),it=[];
  if(!nb)it.push(['uhAlb','🐟',L('Альбом','Album'),anySetReady()]);
  var tkDot=false;try{tkDot=TK_KEYS.every(function(k){return !S.tk[k];})&&TK_KEYS.some(function(k){return S.coins>=TACKLE[k].p[1];});var g=goalNext();if(g&&g.go==='t'&&S.coins>=g.p)tkDot=true;}catch(e){}
  it.push(['uhTk','🎣',L('Снасти','Tackle'),tkDot]);
  if(!nb&&(payOn()||typeof window.shopOpen==='function'))it.push(['uhShop','🛒',L('Магазин','Shop'),false,'shop']);
  if(!nb||(S.caught||0)>=1&&(S.sessions||0)>=1){var mc=0;try{mc=a3MailCnt();}catch(e){}if((S.sessions||0)>=1)it.push(['uhMail','✉',L('Почта','Mail'),mc>0,'',mc]);}
  try{if(!nb&&SOC.can('more'))it.push(['uhMore','🎲',L('Игры','Games'),false]);}catch(e){}
  return it;}
function navHtml(cls){return navItems().map(function(x){return '<button class="uh-nb noenter '+(x[4]||'')+'" data-nv="'+x[0]+'">'+x[1]+'<small>'+x[2]+'</small>'+(x[5]?'<i class="uh-cnt">'+x[5]+'</i>':x[3]?'<i class="dot"></i>':'')+'</button>';}).join('');}

/* ---- сборка экрана ---- */
function build(){var wrap=$('mapWrap'),scr=$('scr-map');if(!wrap||!scr)return;document.body.classList.add('uih');
  document.body.classList.toggle('uh-new',newbie());
  var home=$('uiHome');if(!home){home=document.createElement('div');home.id='uiHome';wrap.insertBefore(home,wrap.firstChild);}
  var slots=$('mapSlotsB');
  home.innerHTML='<div class="uh-l">'+todayHtml()+(newbie()?'':ringsHtml())+'<div id="uhSlots"></div>'+(newbie()?'':'<div class="uh-side">'+sideRows()+'</div>')+'</div><div class="uh-r">'+placesHtml()+'</div>';
  if(slots){$('uhSlots').appendChild(slots);} // гнёзда mapSlots — под кольцами (заполнены старым openMap)
  // шапка: 💰 с «+», вкладки для ПК
  var pill=$('mCoins');if(pill&&!pill.querySelector('.uh-plus')){var pl_=document.createElement('span');pl_.className='uh-plus';pl_.textContent='+';pill.appendChild(pl_);}
  if(pill)pill.onclick=function(){uiShop('coins');};
  var hdr=scr.querySelector('.mh'),tabs=$('uhTabs');if(hdr&&!tabs){tabs=document.createElement('nav');tabs.id='uhTabs';tabs.className='uh-tabs';hdr.insertBefore(tabs,hdr.querySelector('.hdr-r'));}
  if(tabs)tabs.innerHTML='<button class="uh-nb on noenter" data-nv="uhPlaces">🗺<small>'+L('Места','Places')+'</small></button>'+navHtml();
  var nav=$('uhNav');if(!nav){nav=document.createElement('nav');nav.id='uhNav';nav.className='uh-nav';scr.appendChild(nav);}
  nav.innerHTML=navHtml();
  // картинки мест
  var tod=window.__todForce||todOf(hourNow());
  home.querySelectorAll('[data-th]').forEach(function(el){var i=+el.dataset.th;try{el.appendChild(placeThumb(i,condFor(i,tod)));}catch(e){}});
  bind(home);[nav,tabs].forEach(function(n){if(n)n.querySelectorAll('[data-nv]').forEach(function(b){b.onclick=function(){nv(b.dataset.nv);};});});
  if(window.LOOK&&LOOK.walk)try{LOOK.walk(home);LOOK.walk(nav);if(tabs)LOOK.walk(tabs);}catch(e){}}
function nv(k){if(k==='uhPlaces'){$('mapWrap').scrollTop=0;return;}SND.tap();
  if(k==='uhAlb')openAlb('f');else if(k==='uhTk')openShop('t');else if(k==='uhShop')uiShop();else if(k==='uhMail')openMail();else if(k==='uhMore')SOC.showMore();}
function bind(home){var o=today();
  var go=$('uhGo');if(go)go.onclick=function(){SND.tap();var gt=goalTrip();if(gt){buyPlace(gt.i);return;}try{STAT.ev('mod',{m:'home',a:'go'});}catch(e){}startFish(o.pi,{tod:o.t});};
  var f=$('uhFore');if(f)f.onclick=function(){SND.tap();openFore();};
  var sp=home.querySelector('.uh-say p');if(sp&&!o.nb)sp.onclick=function(){SND.tap();openFore();};
  var g=$('uhGoal');if(g)g.onclick=function(){goalGo();};
  var tr=$('uhTour');if(tr)tr.onclick=function(){SND.tap();try{S.uiTour=weekNum();save();STAT.ev('mod',{m:'home',a:'tour'});}catch(e){}openWeek();};
  var a;if((a=$('uhDaily')))a.onclick=function(){SND.tap();openDaily('d');};
  if((a=$('uhWeek')))a.onclick=function(){SND.tap();openWeek();};
  if((a=$('uhMonth')))a.onclick=function(){SND.tap();openDaily('m');};
  if((a=$('uhDvor')))a.onclick=function(){SND.tap();try{var d=window.uiDvor();d&&d.open&&d.open();}catch(e){}};
  if((a=$('uhRank')))a.onclick=function(){SND.tap();openRank();};
  ['uhOrd','uhOrd2'].forEach(function(id){var b=$(id);if(b)b.onclick=function(){SND.tap();openOrders();};});
  home.querySelectorAll('[data-pl]').forEach(function(b){var i=+b.dataset.pl;b.onclick=function(){SND.tap();S.open[i]?pickTime(i):buyPlace(i);};});}

// подсказки: старая «это прогноз» (fbMapFore) не нужна — прогноз теперь в «Сегодня»; она могла встать в очередь ещё при загрузке
var _toast=toast;toast=function(t){if(typeof t==='string'&&t.indexOf(L('Это прогноз Петровича','This is Petrovich'))>=0)return;return _toast.apply(this,arguments);};
var om=openMap;
openMap=function(){try{if(S.tips&&!S.tips.fbFore)S.tips.fbFore=1;}catch(e){}om.apply(this,arguments);try{build();}catch(e){try{console.error(e);}catch(_){}}};
// кнопки «назад» в магазине/альбоме были привязаны к старой функции — перепривязать
try{$('shBack').onclick=function(){openMap();};$('alBack').onclick=function(){openMap();};}catch(e){}
// подсказка «это прогноз» (fbMapFore) больше не нужна: прогноз — в «Сегодня» (флаг ставится в обёртке выше)
window.addEventListener('resize',function(){var s=$('scr-map');if(s&&s.classList.contains('on')&&$('uiHome'))try{build();}catch(e){}});
if($('scr-map')&&$('scr-map').classList.contains('on')&&!window.G)try{build();}catch(e){}
window.uiHomeBuild=build;
/* ПК: те же вкладки сверху и в «Альбоме», и в «Снастях» (экран не теряет навигацию) */
function subTabs(scrId,on){var scr=$(scrId);if(!scr)return;var hdr=scr.querySelector('.gh');if(!hdr)return;var t=hdr.querySelector('.uh-tabs');
  if(!t){t=document.createElement('nav');t.className='uh-tabs uh-sub';var c=hdr.querySelector('.pill');hdr.insertBefore(t,c||null);}
  t.innerHTML='<button class="uh-nb noenter" data-nv="uhPlaces">🗺<small>'+L('Места','Places')+'</small></button>'+navHtml();
  t.querySelectorAll('[data-nv]').forEach(function(b){if(b.dataset.nv===on)b.classList.add('on');b.onclick=function(){if(b.dataset.nv==='uhPlaces'){SND.tap();openMap();}else nv(b.dataset.nv);};});
  if(window.LOOK&&LOOK.walk)try{LOOK.walk(t);}catch(e){}}
// оборачиваем после всех файлов (альбом/магазин других слоёв переопределяют функции целиком)
function wrapSub(){var oa=openAlb;openAlb=function(){var r=oa.apply(this,arguments);try{subTabs('scr-alb','uhAlb');}catch(e){}return r;};
  var os=openShop;openShop=function(tab){var r=os.apply(this,arguments);try{subTabs('scr-shop',tab==='p'?'uhShop':'uhTk');}catch(e){}return r;};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wrapSub);else wrapSub();
try{$('btnAlb').onclick=function(){SND.tap();openAlb('f');};$('btnShop').onclick=function(){SND.tap();openShop('t');};}catch(e){}
})();
/* RB:UX — «Дело дня» Двора (MG0) засчитывается в «Неделю заданий»: день, в который сделано Дело дня, идёт в счёт недели,
   даже если задание дня не выполнено (награды недели WEEK_R/a3Week — те же, выдаются один раз). MG0 зовёт window.uiDeloDone() при выполнении. */
window.uiDeloDone=function(){try{var k=dailyTask().k;if(S.daily[k])return false;S.daily[k]=1;
  var w=weekNum(),n=weekDone(),tr=a3Trip(),c=0,wk='';if(!isObj(S.wkr)||S.wkr.w!==w)S.wkr={w:w,g:{}};if(!isObj(S.wkr.g))S.wkr.g={};
  WEEK_R.forEach(function(x,i){if(n>=x[0]&&!S.wkr.g[x[0]]){S.wkr.g[x[0]]=1;var r=a3Week(i,tr);c+=r;wk=L('неделя заданий '+n+'/7: +','weekly tasks '+n+'/7: +')+coinsTxt(r);}});
  if(c){a3Pay(c,L('неделя заданий','weekly tasks'));SND.coin();toast('📅 '+wk,3600);}save();updCoins();return true;}catch(e){return false;}};
