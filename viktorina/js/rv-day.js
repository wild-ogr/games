/* rv-day.js — «Листок дня» Михалыча (революция «Весь двор отвечает», поток П4; журнал hobby-analytics/release-i/vk-rev-0611/RV-П4.md, план PLAN-VK.md §2.2, §7).
   ОДНО окно-листок отрывного календаря вместо двух всплывашек («Серия входа» + «Михалыч у подъезда»):
     дата крупно · «листок N-й подряд» (= серия входа js/today.js) · пословица дня (VMB_POSL, js/vmg-posl-data.js) ·
     гостинец сам в копилку + маленькая «×2 за ролик» (#tdSerAd — уже в AD_BTN_SEL) · вопрос дня прямо на листке ·
     «вчера знали N из 10 соседей» (KNOW.of — П0) · после ответа «знают N из 10» и «Завтра спрошу про «…»» — обещание хранится и ВЫПОЛНЯЕТСЯ ·
     одна строка события (праздник → тема недели → новая тема) · строка «Дела дня N из 5 ›».
   На главном — карточка листка: homeSlots id 'rv-day' (место и вид — П5). На входе — не больше одного окна за день (листок):
     «Новая затея открыта» — только точкой на «Затеях», вопрос дня сам не всплывает (после Табло/Доски тоже).
   Флаг: RV.on('day') (каркас П0, js/rv-core.js); работает со 2-го дня нового вида (RV.day()>=2, PLAN 4.3); выключено → всё как v5.9.
   Поле сохранения — только S.rvDay (появляется при первом показе листка):
     {sh: день авто-показа, p:{d:день, i:id} обещанный вопрос, y:{d,i,ok} последний отвеченный, x2: день ×2 гостинца}.
   Наружу — window.RVDAY {act, open, card, pick}. Грузится ПОСЛЕ основного скрипта, today.js, fest-vik.js, vmg-board.js. */
(function(){'use strict';
var W=window;
function act(){try{if(W.RV&&RV.on){if(!RV.on('day'))return false;return RV.day()>=2;}return !/[?&]off=[^&]*\brv\b/.test(location.search);}catch(e){return false;}}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function dk(o){try{return dayKey(o||0);}catch(e){var d=new Date();d.setDate(d.getDate()+(o||0));return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function now(){try{return nowMs();}catch(e){return Date.now();}}
function C(){return CAR.CFG;}
function st(){if(!isO(S.rvDay))S.rvDay={};return S.rvDay;}
function td(){try{TD.fix();}catch(e){}return S.td;}
function tn(t){try{return TN[t].n;}catch(e){return t||'';}}
function tap(){try{SND.tap();}catch(e){}}
function sv(){try{save();}catch(e){}}

/* ---------- вопрос дня: трудный, одинаковый у всех по дате; по возможности — из вопросов с настоящими ответами (KNOW real) ---------- */
function qidK(t){var b=base(t-1),bt='';try{bt=QI[b].t;}catch(e){}return base(t,bt);}
// tema вчерашнего вопроса не повторяем (одинаково у всех: зависит только от даты)
function base(t,skip){try{var day={};try{seededSet(t*7919+13).qs.forEach(function(i){day[i]=1;});}catch(e){}
  var R=rng(t*104729+3),op=function(k){try{return typeof topicOpen!=='function'||topicOpen(k);}catch(e){return true;}};
  var c=QS.filter(function(q){return q.d===3&&!day[q.i]&&q.x&&op(q.t)&&q.t!==skip;});
  if(W.KNOW&&KNOW.has){var cr=c.filter(function(q){return KNOW.has(q.i);});if(cr.length>=30)c=cr;}
  if(!c.length)c=QS.filter(function(q){return q.d===3;});
  return c[Math.floor(R()*c.length)].i;}catch(e){return '';}}
// обещанный вопрос («Завтра спрошу про…») — держим слово, даже если игрок пропустил день
function pick(t){var r=st(),p=r.p;try{if(isO(p)&&p.i&&p.d<=t&&QI[p.i]&&!(isO(r.y)&&r.y.i===p.i))return p.i;}catch(e){}return qidK(t);}
function curQ(){var d=td(),q=null;if(!d)return null;try{q=QI[d.qi];}catch(e){}
  if(!q){d.qi=pick(d.d);try{q=QI[d.qi];}catch(e){}}return q||null;}
function promised(q){var r=st();return isO(r.p)&&q&&r.p.i===q.i&&r.p.d<=dk();}
function promise(q){var r=st(),t=dk(1);if(isO(r.p)&&r.p.d===t&&QI[r.p.i])return QI[r.p.i];
  var i=qidK(t);if(q&&i===q.i)i=qidK(t+1);if(!i||!QI[i])return null;r.p={d:t,i:i};return QI[i];}

/* ---------- «знают N из 10» (KNOW — П0; без него — оценка по цене) ---------- */
function know(q){try{if(W.KNOW&&KNOW.of)return KNOW.of(q);}catch(e){}
  var p=.7;try{p=PRICE.pOf(q);}catch(e){}return{n10:Math.max(0,Math.min(10,Math.round(p*10))),real:false};}
function win10(n){var h='';for(var i=0;i<10;i++)h+='<i'+(i<n?' class="on"':'')+'></i>';return '<span class="rvd-w" aria-hidden="true">'+h+'</span>';}
function knowTxt(k){return (k.real?'Знают ':'Обычно знают ')+'<b>'+k.n10+' из 10</b> соседей';}

/* ---------- пословица дня ---------- */
function posl(){try{var a=W.VMB_POSL;if(!a||!a.length)return '';var t=dk(),n=Math.floor(Date.UTC(Math.floor(t/1e4),Math.floor(t/100)%100-1,t%100)/864e5);
  var x=a[((n*37)%a.length+a.length)%a.length];return x[1]+' '+x[2];}catch(e){return '';}}

/* ---------- гостинец (серия входа) ---------- */
function ser(){try{return TD.serState();}catch(e){return null;}}
function gAmt(){try{var s=S.tdS;if(!s||s.d!==dk())return 0;return C().series[((s.n||0)-1+30)%30].c;}catch(e){return 0;}}
function leafNo(){try{var s=S.tdS;return (s.cy||0)*30+(s.n||0);}catch(e){return 0;}}
var restoreOk=false; // на этом показе листка предложено «вернуть счёт листков» (гостинец — при закрытии)
function claimNow(){try{var g=giftState();if(g.today)return 0;var a=TD.claimGift();try{SND.coin();}catch(e){}try{TD.flush();}catch(e){}return a;}catch(e){return 0;}}
function adOk(){try{return adBtnOk();}catch(e){return false;}}
function x2(){var r=st(),a=gAmt();if(!a||r.x2===dk())return;if(adHold('lx2'))return;hideModal();try{STAT.place('lx2');}catch(e){}var done=false;
  var give=function(){if(done)return '';done=true;r.x2=dk();try{S.coins+=a;STAT.earn('ad',a);updCoins();SND.coin();}catch(e){}sv();return 'гостинец ×2: +'+coinsTxt(a);};
  showRewarded(function(){var t=give();if(t)toast('🎁 '+t);open();},function(w){if(w==='wait')open();},give);}
function restore(){var x=ser();if(!x||!x.canRestore)return;if(adHold('ser'))return;hideModal();try{STAT.place('ser');}catch(e){}var done=false;
  var ok=function(){if(done)return '';done=true;var s=S.tdS;s.d=dk(-1);s.rs=dk();s.n=x.from;restoreOk=false;var a=claimNow();sv();return 'счёт листков возвращён'+(a?' · +'+coinsTxt(a):'');};
  showRewarded(function(){var t=ok();if(t)toast('🔥 '+t);open();},function(w){if(w==='wait')open();},ok);}

/* ---------- строка события: праздник → тема недели → новая тема ---------- */
function evt(){
  try{if(W.FESTV&&FESTV.tiles){var f=FESTV.tiles()[0];if(f){var nm=(W.VTOP&&VTOP.festName&&VTOP.festName(f.k))||f.n||tn(f.k);
    return{ic:f.ic||'🎉',t:(f.kind==='hol'?'Праздник':'Сезон')+' «'+nm+'» — особые вопросы',go:function(){FESTV.go(f.k);}};}}}catch(e){}
  try{var k=weekTopic(),w=TN[k];if(w&&TK.indexOf(k)>=0)return{ic:w.ic||'⭐',t:'Тема недели «'+w.n+'» — монеты ×2',go:function(){uiPreTopic(k);}};}catch(e){}
  try{var nw=W.VT&&VT.list.filter(function(x){return VT.isNew(x.k,now());})[0];if(nw)return{ic:nw.ic||'🆕',t:'Новая тема «'+nw.n+'»',go:function(){uiPreTopic(nw.k);}};}catch(e){}
  return null;}
// «Дела дня N из 5 ›» — и какое дело следующее (поломка VK-UX №21: непонятно, что считается делом)
function deals(){try{var a=TD.deals(),n=a.filter(function(x){return x.ok;}).length,nx=a.filter(function(x){return !x.ok&&x.k!=='qd';})[0],full=false;
  try{full=TD.stash()>=C().stash.max;}catch(e){}
  return{n:n,t:'Дела дня: '+n+' из 5'+(nx&&n<5?' · дальше «'+nx.n+'»':'')+(full?' · заначка полная':'')};}catch(e){return null;}}

/* ---------- Михалыч: короткие реплики листка (банк П1 RVSAY, если есть) ---------- */
function say(k,o){try{if(W.RVSAY&&RVSAY.pick){var s=RVSAY.pick(k,o);if(s)return s;}}catch(e){}
  var B={ok:['Вот это я понимаю — знаток!','В точку. Двор гордится.','Записываю тебе в листок пятёрку.'],
    bad:['Не беда — зато теперь знаешь.','Мимо, но вопрос был с подвохом.','Ничего, завтра отыграемся.']}[k]||[''];
  var R=rng(dk()*31+(k==='ok'?1:2));return B[Math.floor(R()*B.length)];}

/* ---------- сам листок ---------- */
var MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
    DNW=['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
function head(){var d=new Date(now()),n=leafNo();
  return '<div class="rvd-top"><div class="rvd-wd">'+DNW[d.getDay()]+'</div><div class="rvd-dn">'+d.getDate()+'</div><div class="rvd-mn">'+MON[d.getMonth()]+'</div>'+
    (n>0?'<div class="rvd-no">листок '+n+'-й подряд</div>':'')+'</div>';}
function giftRow(){var r=st(),g=null;try{g=giftState();}catch(e){}var a=gAmt(),h='';
  if(restoreOk){var x=ser();if(x&&x.canRestore&&adOk())return '<p class="rvd-g"><span>Были пропуски — листки пошли с '+(x.n+1)+'-го.</span><button class="btn rvd-ad" id="tdSerAd" type="button">📺 Вернуть '+(x.from+1)+'-й</button></p>';restoreOk=false;claimNow();a=gAmt();}
  if(!a)return '';
  h='<p class="rvd-g"><span>🎁 Гостинец <b>+'+coinsTxt(a)+'</b> в копилке'+(r.x2===dk()?' · ×2 ✓':'')+'</span>'+(r.x2!==dk()&&adOk()?'<button class="btn rvd-ad" id="tdSerAd" type="button">📺 ×2</button>':'')+'</p>';
  return h;}
function yRow(){var r=st(),y=r.y;if(!isO(y)||!y.i||y.d>=dk())return '';var q=null;try{q=QI[y.i];}catch(e){}if(!q)return '';var k=know(q);
  return '<p class="rvd-y">'+(y.d===dk(-1)?'Вчера':'В прошлый раз')+' «'+esc(tn(q.t))+'»: '+(k.real?'знали ':'обычно знают ')+'<b>'+k.n10+' из 10</b> — '+(y.ok?'и ты в их числе ✓':'в тот раз мимо')+'</p>';}
function body(){var d=td(),q=curQ(),h=head(),pl=posl();
  if(pl)h+='<p class="rvd-posl quote">«'+esc(pl)+'»</p>';
  h+=giftRow();
  if(!q)return h+'<div class="row"><button class="btn accent" id="rvdClose" type="button">Хорошо</button></div>';
  if(!d.q){var R=rng(d.d*17+5),perm=shuffle([0,1,2,3],R),b='';
    for(var a=0;a<4;a++)b+='<button class="btn td-a" data-k="'+a+'" data-ok="'+(perm[a]===0?1:0)+'" type="button">'+esc(q.a[perm[a]])+'</button>';
    h+=yRow();
    h+='<div class="rvd-qh"><span class="rvd-av">'+portrait('mihalych','norm')+'</span><span class="td-sub">'+(promised(q)?'Обещал спросить про «'+esc(tn(q.t))+'» — спрашиваю':'Вопрос дня · «'+esc(tn(q.t))+'» · трудный')+'</span></div>'+
      '<p class="td-q">'+esc(q.q)+'</p><div class="td-as">'+b+'</div>'+
      '<div class="row"><button class="btn" id="rvdClose" type="button">Потом</button></div>';
    return h;}
  var ok=d.q===1,k=know(q),tq=promise(q),ev=evt(),dl=deals();
  h+='<div class="rvd-res'+(ok?' ok':'')+'"><span class="rvd-av">'+portrait('mihalych',ok?'happy':'sad')+'</span><span><b>'+(ok?'Верно! +'+C().qday+' очков':'Эх, мимо…')+'</b><small>'+esc(say(ok?'ok':'bad'))+'</small></span></div>'+
    '<p class="rvd-a">Ответ: <b>'+esc(q.a[0])+'</b></p>'+
    '<p class="rvd-k">'+win10(k.n10)+knowTxt(k)+'</p>'+
    (q.x?'<p class="rvd-x quote">'+esc(q.x)+'</p>':'')+
    (tq?'<p class="goal tmr rvd-tm">Завтра спрошу про «'+esc(tn(tq.t))+'»</p>':'');
  if(ev)h+='<button class="rvd-ln" id="rvdEv" type="button"><span>'+esc(ev.ic)+'</span><span>'+esc(ev.t)+'</span><span>›</span></button>';
  if(dl)h+='<button class="rvd-ln" id="rvdDl" type="button"><span>📋</span><span>'+esc(dl.t)+'</span><span>›</span></button>';
  h+='<div class="row"><button class="btn accent" id="rvdPlay" type="button">▶ Играть</button><button class="btn" id="rvdClose" type="button">Закрыть</button></div>';
  return h;}
// своё ужатие листка: окно не должно уходить за экран (m.ok.ru 360×540) — убираем второстепенное по порядку
function fit(){var m=$('modal'),c=$('mcard');if(!m||!c)return;var ok=function(){return m.scrollHeight<=m.clientHeight+1;};if(ok())return;
  var L=['.rvd-posl','.rvd-x','.rvd-no','.rvd-qh','.rvd-y','#rvdEv','.rvd-res small','.rvd-av'];
  for(var i=0;i<L.length;i++){var e=c.querySelectorAll(L[i]);for(var j=0;j<e.length;j++)e[j].style.display='none';if(ok())return;}}
function close(){if(restoreOk){restoreOk=false;claimNow();}try{hideModal();}catch(e){}try{TD.render();}catch(e){}}
function play(){try{if(lcurOk()){resumeLadder();return;}}catch(e){}try{if(W.UIH&&UIH.play){UIH.play();return;}}catch(e){}try{openTopics();}catch(e){}}
function answer(btn){var d=td(),q=curQ();if(!q||d.q)return;var ok=btn.getAttribute('data-ok')==='1',r=st();
  d.q=ok?1:2;if(ok){try{CAR.add(C().qday,'qday');}catch(e){}try{SND.right();}catch(e){}}else try{SND.wrong();}catch(e){}
  try{CAR.fire({id:q.i,ok:ok,hint:0,mode:'qday',step:0,price:500});}catch(e){}
  r.y={d:dk(),i:q.i,ok:ok?1:0};if(isO(r.p)&&r.p.i===q.i)delete r.p;promise(q);
  try{STAT.ev('rvday',{a:'ans',ok:ok?1:0,pr:promised(q)?1:0});}catch(e){}
  try{TD.check();}catch(e){}sv();show();}
// П7: класс листка (.rvd-card: padding-top 0, overflow hidden) не должен оставаться на следующих окнах (итог лестницы и др.)
if(typeof modal==='function'){var md0=modal;modal=function(){try{$('mcard').classList.remove('rvd-card');}catch(e){}return md0.apply(this,arguments);};}
if(typeof hideModal==='function'){var hm0=hideModal;hideModal=function(){try{$('mcard').classList.remove('rvd-card');}catch(e){}return hm0.apply(this,arguments);};}
function show(){modal('<div class="rvd">'+body()+'</div>');var c=$('mcard');c.classList.add('rvd-card');
  try{fitCard();}catch(e){}fit();
  var bs=c.querySelectorAll('.td-a');for(var i=0;i<bs.length;i++)bs[i].onclick=function(){answer(this);};
  if($('tdSerAd')){try{STAT.offer(restoreOk?'ser':'lx2');}catch(e){}$('tdSerAd').onclick=function(){tap();if(restoreOk)restore();else x2();};}
  if($('rvdClose'))$('rvdClose').onclick=function(){tap();close();};
  if($('rvdPlay'))$('rvdPlay').onclick=function(){tap();close();play();};
  if($('rvdEv'))$('rvdEv').onclick=function(){tap();var e=evt();close();if(e)try{e.go();}catch(_){}};
  if($('rvdDl'))$('rvdDl').onclick=function(){tap();close();try{TD.openToday();}catch(_){}};}
function open(){if(typeof qReady!=='undefined'&&!qReady){try{qWait(open);}catch(e){}return;}
  try{STAT.screen('qday');}catch(e){}try{if(W.RV)RV.mark('day','show');}catch(e){}
  var d=td();if(d)d.ask=1;st().sh=dk(); // П7: листок, открытый любым путём (окно вопроса дня today.js, плитка), — уже показан сегодня: при возврате в меню второй раз не всплывает
  var g=null;try{g=giftState();}catch(e){}
  if(g&&!g.today){var x=ser();if(x&&x.canRestore&&adOk())restoreOk=true;else claimNow();}
  sv();show();}

/* ---------- на входе: листок сам — один раз в день (вместо «Серии входа» и вопроса дня) ---------- */
function autoOk(){try{if(G||W.__demo||modalOn||$('ad').classList.contains('on')||!onScr('scr-menu'))return false;}catch(e){return false;}
  return (S.games||0)>=1&&st().sh!==dk();}
function auto(){if(!act()||!autoOk())return;st().sh=dk();sv();open();}
if(typeof maybeStreak==='function'){var ms0=maybeStreak;maybeStreak=function(){if(!act())return ms0.apply(this,arguments);auto();};}
// «Новая затея открыта» — не окном, а точкой на «Затеях»/«Доске» (VMG сам ставит точку, пока затея не сыграна)
function hushZ(){try{if(!W.VMG||!VMG.Z||!VMG.isOpen)return;if(VMG.unlock)VMG.unlock();var z=VMG.Z(),ch=0;for(var n=1;n<=14;n++)if(VMG.isOpen(n)&&!z.s[n]){z.s[n]=1;ch=1;}if(ch&&VMG.touch)VMG.touch();}catch(e){}}
if(typeof openMenu==='function'){var om0=openMenu;openMenu=function(){if(act())hushZ();var r=om0.apply(this,arguments);
  // игра открыта со вчера (или вход был не в меню) — листок при первом возвращении в меню за день
  if(act()&&(S.games||0)>=1&&st().sh!==dk())setTimeout(auto,700);return r;};}

/* ---------- карточка листка на главном (homeSlots id 'rv-day'; место и вид — П5) ---------- */
function card(){if(!act()||(S.games||0)<1)return null;var d=td(),t=new Date(now()),dl=deals();if(!d)return null;
  return UI.tile({ic:'🗓',t:'Листок · '+t.getDate()+' '+MON[t.getMonth()],s:d.q?'вопрос дня '+(d.q===1?'— верно ✓':'— отвечен ✓')+(dl?' · дела '+dl.n+' из 5':''):'Михалыч ждёт с вопросом дня',tag:d.q?'':'+'+C().qday,cls:'yel rvd-tile'});}
if(!Array.isArray(W.homeSlots))W.homeSlots=[];
homeSlots.push({id:'rv-day',order:2,render:card,mount:function(el){var b=el.querySelector('button');if(b)b.onclick=function(){tap();open();};}});

// вход случился раньше, чем загрузился этот файл (sdkDone → maybeStreak до конца разбора страницы): окно «Серия входа» уже открыто — меняем на листок
try{if(act()&&modalOn&&$('gTake')&&$('mcard').querySelector('.ser30')&&(S.games||0)>=1&&st().sh!==dk()){hideModal();auto();}}catch(e){}
W.RVDAY={act:act,open:open,card:card,pick:pick,qid:qidK,know:know,promise:function(q){var r=promise(q);sv();return r;},seen:function(q,ok){if(q&&q.i){st().y={d:dk(),i:q.i,ok:ok?1:0};sv();}}};
})();
