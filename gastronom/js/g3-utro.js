'use strict';
/* ================= g3-utro — G3-П3 «Утро и люди» (Гастроном 3.0, волна 1; план REVIEW-1106/PLAN-3.0.md, опора 4; журнал G3W1/П3.md) =================
   Ядро не трогаем. Крючки — обёртки глобальных функций и гнёзда GB (winSlots / homeSlots / startHook / levelHook); в index.html — только
   строки <script> под меткой «G3-П3».
   1) «ОТЛОЖИЛА ДО УТРА» (g3.utro): после победы обычного уровня (с 5-го; раз в день, если ничья просьба не ждёт) — одна строка в «Кассе»
      (zone 'tmr'): постоянная покупательница просит отложить товар → «✓ Отложила». Наутро (в любой следующий день) она первая в очереди
      первого обычного уровня, просит этот товар (если он есть тройкой), говорит свою строку; ушла довольной — строка «спасибо» и +REG_GIFT 💰.
      Нити: Анна Петровна (3 шага), потом (g3.regs, с 3-го дня) Лев Борисович, Степаныч, Петя — по 2–3 шага, дальше по кругу.
   2) «УТРО У ВАЛИ» (g3.utro, с 2-го дня захода в 3.0): ОДНО окно-открытка в день при входе на главный: что отложено и кто ждёт,
      гостинец сам в копилке (+GIFT; сюда слиты «Завтра — подарок» gb-up и «С возвращением» gb-back), «📺 ×2», «Витрина дня»,
      «Дела дня N из 5 ›» (gb-plan), «🔔 Напоминать» (SOC, со 2-го захода), «▶ За прилавок». Пока после «Утра» не начат уровень,
      другие окна входа ждут (обёртка GBNB.turn: back, cert, grown, mail, bag, mgnew).
   3) «ВИТРИНА ДНЯ» (g3.vitr, с 3-го дня; задание дня переодето): без отмены хода; Валя проходит её за N ходов (решатель: лучший из 40
      «человеческих» прогонов, кэш на день); в «Кассе» — «Витрина №312 — за 14 ходов. Тётя Валя — за 11» + «↻ Ещё раз — за 11?».
   4) КАРТОЧКА НА ГЛАВНОМ — самостоятельный блок G3U.card {render(ctx)→html, mount(el,ctx)} (ctx.mini — одна строка). Сейчас стоит
      гнездом homeSlots 'g3-utro' (zone 'plan', order 5) и прячет mt-plan («План на сегодня» живёт внутри как «Дела дня»). П4 вставляет
      G3U.card в новый главный (блок 4 из 6) и может снять гнездо: G3U.slot=false до 'ready' или GB.homeSlots без 'g3-utro'.
   5) Время дня: G3U.timeLine() — строка Вали по часам (после 23:00 — «гонит спать»); ночью раз за сеанс — в начале уровня.
   Банк реплик — js/g3-lines.js (G3LINES). Поля — в S.g3 (плоские числа, общий merge каркаса = максимум):
     na/nc — сколько просьб/приходов (ждёт = na>nc), ua/uc — день просьбы/прихода, um — день «Утра», ug/ux — день гостинца/×2,
     vk/vn — день и ходы Вали на витрине, vd/vq — день и 1000−лучшие ходы игрока.
   STAT: mod g3.utro {a: ask|come|served|angry|show|x2|vitr|plan|ntf|work} · g3.vitr {a: start|win, m, v}.
*/
(function(){
if(!window.G3||!window.GB)return;
var U=window.G3U={GIFT:20,REG_GIFT:10,slot:true,hold:false};
var LN=window.G3LINES||{};
var L=G3.L;
function $(id){return document.getElementById(id);}
function S_(){try{return typeof S!=='undefined'&&S?S:null;}catch(e){return null;}}
function G_(){try{return typeof G!=='undefined'?G:null;}catch(e){return null;}}
function sv(){try{save();}catch(e){}}
function tap(){try{SND.tap();}catch(e){}}
function g3(){return G3.st()||{};}
function n(v){v=+v;return isFinite(v)&&v>0?v:0;}
function today(){return G3.today();}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function q(s){try{return typeof QQ==='function'?QQ(s):'«'+s+'»';}catch(e){return '«'+s+'»';}}
function tx(p,o){var s=L(p[0],p[1]);if(o)for(var k in o)s=s.split('{'+k+'}').join(o[k]);return s;}
function pick(a){return a&&a.length?a[Math.floor(Math.random()*a.length)]:['',''];}
U.line=function(k,o){return tx(pick(LN[k]),o);};
function hour(){return new Date().getHours();}
function tod(){var h=hour();return h>=23||h<5?'n':h<11?'m':h<17?'d':'e';}
U.timeLine=function(){return U.line(tod());};
function inDemo(){try{return !!window.__demo;}catch(e){return false;}}
function lang(){try{return typeof LANG!=='undefined'?LANG:'ru';}catch(e){return 'ru';}}
/* дата открытки: «пятница, 6 ноября» */
function dateStr(){var d=new Date();
  if(lang()==='en')return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]+', '+['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()]+' '+d.getDate();
  return ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'][d.getDay()]+', '+d.getDate()+' '+['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'][d.getMonth()];}
function hello(){var k=tod();return k==='m'?L('Доброе утро!','Good morning!'):k==='d'?L('Добрый день!','Good afternoon!'):k==='e'?L('Добрый вечер!','Good evening!'):L('Доброй ночи!','Good night!');}

/* ---------- нити постоянных ---------- */
var SEQ=[];(LN.REGS||[]).forEach(function(r,ri){r.steps.forEach(function(s,si){SEQ.push({r:r,s:s,ri:ri,si:si});});});
function stepAt(i){return SEQ.length?SEQ[i%SEQ.length]:null;}
function pending(){var g=g3();return n(g.na)>n(g.nc)?stepAt(n(g.na)-1):null;}
U.pending=pending;
function regOk(x){return x&&(x.ri===0||G3.open('regs'));}
function canAsk(){var g=g3();if(!G3.on('utro')||!SEQ.length)return null;if(n(g.na)>n(g.nc))return null;if(n(g.ua)>=today())return null;
  var x=stepAt(n(g.na));return regOk(x)?x:null;}
function who(x){return L(x.r.n[0],x.r.n[1]);}
function what(x){return L(x.s.a[0],x.s.a[1]);}
var W={ask:null};
GB.levelHook.push(function(i){W.ask=null;if(i.r!=='win'||i.daily||i.mode||i.boss||i.idx<4)return;var x=canAsk(); /* П5: не на Ревизии — там своя новость (грамота, город) */if(!x)return;
  var g=g3();g.na=n(g.na)+1;g.ua=today();sv();W.ask=x;G3.mark('utro','ask',{w:x.r.id,s:g.na});});
GB.startHook.push(function(){W.ask=null;});
/* «Касса»: строка просьбы (одна новость; «Завтра…» gb-newbie в этот раз молчит) */
GB.add(GB.winSlots,{id:'g3-ask',order:1,zone:'tmr',fit:7,on:function(){return !!W.ask;},render:function(){var x=W.ask;if(!x)return '';
  return '<p class="g3u-ask"><b>'+esc(who(x))+':</b> '+esc(q(L(x.s.ask[0],x.s.ask[1])))+' <span class="g3u-ok">✓ '+esc(L('Отложила','Put aside'))+'</span></p>';}});

/* приход: первая в очереди первого обычного уровня в следующий день */
GB.startHook.push(function(info){GB.safe('g3u:come',function(){var g=G_(),s3=g3();if(!g||info.daily||info.mode||!G3.on('utro'))return; /* Ревизия — тоже: ревизор последний, она первая */
  var x=pending();if(!x||n(s3.ua)>=today()||!g.lv||g.lv.K<2||!g.q)return;
  var v=null;for(var k=0;k<g.q.vis.length;k++){var c0=g.q.vis[k];if(c0.id!==g.vetId&&!(g.boss&&c0.id===g.lv.K-1)){v=c0;break;}}if(!v)return;
  var c=null;for(var j=0;j<g.queue.length;j++)if(g.queue[j].id===v.id){c=g.queue[j];break;}if(!c)return;
  try{var t=x.s.t,rem=remCounts(g.lv,g.st)[t]||0,res=0;g.q.vis.forEach(function(o){if(o!==v&&o.t===t)res++;});
    if(v.t!==t&&Math.floor(rem/3)-res>0){v.t=t;c.t=t;}}catch(e){}
  c.kind=x.r.kind;g.g3r={id:v.id,x:x};s3.nc=n(s3.nc)+1;s3.uc=today();sv();G3.mark('utro','come',{w:x.r.id});
  later(function(){var cc=null;for(var j=0;j<G.queue.length;j++)if(G.queue[j].id===v.id&&(G.queue[j].st==='wait'||G.queue[j].st==='in'))cc=G.queue[j];
    if(cc&&!G.over)say(L(x.s.come[0],x.s.come[1]),cc);},3000);});});
GB.on('ready',function(){
  if(typeof window.custLeave==='function'&&!window.custLeave.g3u){var cl=window.custLeave;window.custLeave=function(v,happy){var r=cl.apply(this,arguments); /* G3-П3: постоянная уходит */
    GB.safe('g3u:leave',function(){var g=G_();if(!g||!g.g3r||g.g3r.done||!v||v.id!==g.g3r.id)return;g.g3r.done=1;var x=g.g3r.x;
      if(!happy){G3.mark('utro','angry',{w:x.r.id});return;}
      var c=null;for(var j=0;j<g.queue.length;j++)if(g.queue[j].id===v.id)c=g.queue[j];
      say(L(x.s.thx[0],x.s.thx[1]),c||'valya');try{setCoins(S.coins+ern('gift',U.REG_GIFT));SND.coin();}catch(e){}G3.mark('utro','served',{w:x.r.id});});return r;};window.custLeave.g3u=1;}});

/* ---------- окно «Утро у Вали» ---------- */
function backDue(){try{return window.GBBACK&&GBBACK.due?GBBACK.due():null;}catch(e){return null;}}
function upDue(){var s=S_();try{return !!(s&&s.upTm&&n(s.upTm.s)&&!n(s.upTm.g)&&today()>n(s.upTm.s));}catch(e){return false;}}
function giveGift(){var s=S_(),g=g3(),c=U.GIFT,parts=[];if(n(g.ug)>=today())return {c:0};
  if(upDue()){var up=window.GBUP&&GBUP.GIFT||50;c+=up;s.upTm.g=today();try{STAT.ev('mod',{m:'tmrw',a:'gift'});}catch(e){}}
  var b=backDue();if(b&&b.c){c+=b.c;try{s.mtV.g=today();}catch(e){}try{STAT.ev('ret',{m:b.miss,c:b.c});}catch(e){}parts.push(b);}
  g.ug=today();try{setCoins(s.coins+ern('gift',c));}catch(e){s.coins=(s.coins||0)+c;}sv();return {c:c,back:b};}
function vitrOpen(){var s=S_();return G3.open('vitr')&&s&&(+s.unlocked||1)>=7;}
function vitrDone(){var s=S_();try{return !!s.daily[todayKey()];}catch(e){return false;}}
function planOn(){return !!(window.GBPL&&GBPL.on);}
function planN(){try{return GBPL.count();}catch(e){return 0;}}
function ntfCan(){try{return !OK&&typeof SOC==='object'&&SOC.ok()&&SOC.can('ntf')&&SOC.ntfDue()&&!(S.soc&&S.soc.ntf&&+S.soc.ntf.n)&&ses2();}catch(e){return false;}}
function adCan(){try{return adOk()&&adLikely()&&!adBusy;}catch(e){return false;}}
function work(){try{var w=$('vwWork');if(w){w.click();return;}}catch(e){}try{startLevel(Math.max(0,(+S.unlocked||1)-1));}catch(e){}}
function due(){var g=g3();if(!G3.open('utro')||inDemo()||n(g.um)>=today())return false;var s=S_();if(!s||!(s.levelsDone>0))return false;return true;}
U.open=function(force){if(!force&&!due())return false;var g=g3();g.um=today();var gf=giveGift(),x=pending(),waiting=x&&n(g.ua)<today();
  U.hold=true;G3.mark('utro','show',{p:waiting?1:0,c:gf.c||0});
  var vl=waiting?U.line('come',{a:what(x),w:who(x)}):gf.back?L('Где пропадали? Без вас очередь до угла!','Where have you been? Without you the queue reaches the corner!'):U.timeLine();
  var h='<div class="g3u-win"><h2>'+esc(hello())+'</h2><p class="g3u-date">'+esc(dateStr())+'</p>'+(typeof valyaHtml==='function'?valyaHtml(vl):'<p>'+esc(vl)+'</p>');
  if(gf.c)h+='<div class="g3u-gift"><span>🎁 '+esc(L('Гостинец','A treat'))+' <b>+'+gf.c+' 💰</b><small>'+esc(gf.back?L('Вас не было '+gf.back.miss+' дн. — гостинец побольше','You were away '+gf.back.miss+' days — a bigger treat'):U.line('gift'))+'</small></span>'+
    (adCan()?'<button type="button" class="btn small rw noent" id="g3uX2">'+esc(L('📺 ×2 за рекламу','📺 ×2 for an ad'))+'</button>':'')+'</div>';
  var row='';
  if(vitrOpen()&&!vitrDone())row+='<button type="button" class="btn g3u-b" id="g3uVit">🥫 '+esc(L('Витрина дня','Display of the day'))+'</button>';
  if(planOn())row+='<button type="button" class="btn g3u-b" id="g3uPlan">📋 '+esc(L('Дела дня','Today\'s jobs'))+' '+planN()+' '+esc(L('из','of'))+' 5 ›</button>';
  if(ntfCan())row+='<button type="button" class="btn g3u-b noent" id="g3uNtf">🔔 '+esc(L('Напоминать','Remind me'))+'</button>';
  if(row)h+='<div class="g3u-row2">'+row+'</div>';
  h+='<div class="row"><button type="button" class="btn green big" id="g3uGo">▶ '+esc(L('За прилавок','To the counter'))+'</button></div></div>';
  modal(h);try{valyaDraw();}catch(e){}if(gf.c)try{SND.coin();}catch(e){}
  var bx=$('g3uX2');if(bx)bx.onclick=function(){var c=gf.c;STAT.place('utro');G3.mark('utro','x2');
    var pay=function(){var g2=g3();if(n(g2.ux)>=today())return false;g2.ux=today();try{setCoins(S.coins+ern('ad',c));SND.coin();}catch(e){}sv();return true;};
    showRewarded(function(){if(pay()&&document.body.contains(bx)){bx.disabled=true;bx.textContent='✓ +'+c+' 💰';}},function(){},function(){return pay()?'+'+c+' 💰':'';});};
  var bv=$('g3uVit');if(bv)bv.onclick=function(){tap();G3.mark('utro','vitr');hideModal();startLevel(0,true);};
  var bp=$('g3uPlan');if(bp)bp.onclick=function(){tap();G3.mark('utro','plan');hideModal();try{GBPL.open();}catch(e){}};
  var bn=$('g3uNtf');if(bn)bn.onclick=function(){bn.disabled=true;G3.mark('utro','ntf');try{S.soc.ntf={n:1,t:typeof nowMs==='function'?nowMs():Date.now()};sv();STAT.ev('soc',{a:'ntf',r:'show',n:1,d:SOC.ntfDay(),w:'utro'});}catch(e){}
    Promise.resolve(SOC.ntf(1)).then(function(y){if(y){bn.textContent='✓ '+L('Напомню','Will remind');}else bn.disabled=false;},function(){bn.disabled=false;});};
  $('g3uGo').onclick=function(){tap();G3.mark('utro','work');hideModal();work();};
  try{GB.refresh();}catch(e){}return true;};
var t0=0;function atHome(){clearTimeout(t0);t0=setTimeout(function(){GB.safe('g3u:open',function(){try{if(modalOn)return;var g=G_();if(g&&!g.won)return;}catch(e){}
  if(window.GBMIG&&GBMIG.pending())return;var m=$('scr-map');if(m&&!m.classList.contains('on'))return;U.open();});},250);}
GB.on('home',atHome);GB.on('ready',function(){var m=$('scr-map');if(m&&m.classList.contains('on'))atHome();});
GB.on('start',function(){U.hold=false;});
var HOLD={back:1,cert:1,grown:1,mail:1,bag:1,mgnew:1};
GB.on('ready',function(){
  /* G3-П3: одно окно при входе — остальные ждут, пока не начат уровень */
  if(window.GBNB&&typeof GBNB.turn==='function'&&!GBNB.turn.g3u){var tn=GBNB.turn;GBNB.turn=function(id){if(U.hold&&HOLD[id])return false;return tn.apply(this,arguments);};GBNB.turn.g3u=1;}
  /* «Завтра — подарок» (окно gb-up) слито в «Утро»: окно и тост-подарок молчат, подарок выдаёт «Утро» */
  if(G3.on('utro')&&window.GBUP)GBUP.tmr=false;
  /* «Завтра…» gb-newbie молчит, когда в «Кассе» просьба постоянной */
  GB.winSlots.forEach(function(sl){if(sl.id==='nbtmr'&&!sl.g3u){var o=sl.on;sl.on=function(){if(W.ask)return false;return o?o.apply(this,arguments):true;};sl.g3u=1;}});
  /* «План на сегодня» живёт в карточке «Утро» как «Дела дня» */
  GB.homeSlots.forEach(function(sl){if(sl.id==='mt-plan'&&!sl.g3u){var o=sl.on;sl.on=function(){if(cardOn())return false;return o?o.apply(this,arguments):true;};sl.g3u=1;}});
  /* Витрина дня: без отмены хода, своё имя в шапке уровня */
  if(typeof window.useBoost==='function'&&!window.useBoost.g3u){var ub=window.useBoost;window.useBoost=function(k){var g=G_();if(k==='undo'&&g&&g.daily&&g.g3v)return;return ub.apply(this,arguments);};window.useBoost.g3u=1;}
  if(typeof window.updHud==='function'&&!window.updHud.g3u){var uh=window.updHud;window.updHud=function(){var r=uh.apply(this,arguments);var g=G_();
    if(g&&g.daily&&g.g3v){var e=$('gLevel');if(e)e.textContent='🥫 '+L('Витрина дня №','Display No. ')+vNo();}return r;};window.updHud.g3u=1;}
  GB.todayTasks.forEach(function(t){if(t.id==='daily'&&vitrOn0()){t.t='Витрина дня';t.ic='🥫';}});
  if(!U.slot)GB.homeSlots=GB.homeSlots.filter(function(s){return s.id!=='g3-utro';});});

/* ---------- Витрина дня ---------- */
function vitrOn0(){return G3.open('vitr');}
function vNo(){var t=today(),d=new Date(Math.floor(t/10000),Math.floor(t/100)%100-1,t%100,12),z=new Date(2025,11,29,12);return Math.max(1,Math.round((d-z)/864e5));}
U.vNo=vNo;
function valyaN(lv){var best=+lv.sol||99,ok=[];try{var st=mkState(lv);settle(lv,st,lv.sh.map(function(_,j){return j;}));var seed=today()*7+3;
  for(var k=0;k<40;k++){var p=[],m=playout(lv,rng(seed+k*977),st,null,p);if(m)ok.push(m);}}catch(e){}
  /* Валя — «хорошая продавщица», а не решатель: четверть лучших «человеческих» прогонов (достижимо, но надо постараться) */
  if(ok.length){ok.sort(function(a,b){return a-b;});best=ok[Math.floor(ok.length/4)];}return best;}
U.valyaN=valyaN;
GB.startHook.push(function(info){var g=G_();try{document.body.classList.toggle('g3-vitr',!!(g&&info.daily&&vitrOn0()));}catch(e){}
  if(!g||!info.daily||!vitrOn0())return;g.g3v=1;var s3=g3();
  if(n(s3.vk)!==today()||!n(s3.vn)){s3.vn=valyaN(g.lv);s3.vk=today();sv();}
  G3.mark('vitr','start',{v:s3.vn});try{updHud();}catch(e){}
  later(function(){if(!G.speech&&!G.over)say(U.line('vs',{v:s3.vn}),'valya');},2200);});
var VW={m:0,v:0};
GB.levelHook.push(function(i){VW.m=0;var g=G_();if(i.r!=='win'||!i.daily||!g||!g.g3v)return;var s3=g3();VW.m=g.moves||i.moves||0;VW.v=n(s3.vn)||VW.m;
  if(n(s3.vd)!==today()){s3.vd=today();s3.vq=0;}s3.vq=Math.max(n(s3.vq),1000-VW.m);sv();G3.mark('vitr','win',{m:VW.m,v:VW.v});});
function pl(k,a,b,c,ea,eb){try{return typeof window.pl==='function'?window.pl(k,a,b,c,ea,eb):a;}catch(e){return a;}}
GB.add(GB.winSlots,{id:'g3-vitr',order:1,zone:'check',fit:9,on:function(){return !!VW.m;},render:function(){var m=VW.m,v=VW.v;if(!m)return '';
  var k=m<v?'vbeat':m===v?'vtie':'vworse';
  return '<div class="g3u-vit"><b>🥫 '+esc(L('Витрина №','Display No. ')+vNo()+' — '+L('за ','in ')+m+' '+pl(m,'ход','хода','ходов','move','moves'))+'. '+esc(L('Тётя Валя — за ','Aunt Valya — in ')+v)+'.</b>'+
    '<small>'+esc(U.line(k,{m:m,v:v}))+'</small>'+(m>v?'<button type="button" class="btn small noent" id="g3uVre">↻ '+esc(L('Ещё раз — за '+v+'?','Again — in '+v+'?'))+'</button>':'')+'</div>';},
  mount:function(el){var b=el.querySelector('#g3uVre');if(b)b.onclick=function(){tap();G3.mark('vitr','again');startLevel(0,true);};}});

/* ---------- карточка «Утро у Вали» на главном (самостоятельный блок для П4) ---------- */
function cardOn(){var s=S_();return G3.open('utro')&&!!s&&s.levelsDone>0;}
U.cardOn=cardOn;
U.card={
  render:function(ctx){if(!cardOn())return '';ctx=ctx||{};var g=g3(),x=pending(),rows=[],todo=0;
    if(x)rows.push('<div class="g3u-l">🧺 '+esc(n(g.ua)<today()?L('Отложено: ','Put aside: ')+what(x)+' — '+who(x)+L(' ждёт в очереди',' is waiting in the queue'):L('Отложила ','Put aside ')+what(x)+' — '+who(x)+L(' придёт завтра',' comes tomorrow'))+'</div>');
    if(vitrOpen()){var d=vitrDone();if(!d)todo++;var vq=n(g.vd)===today()?1000-n(g.vq):0;
      rows.push(d?'<div class="g3u-l ok">🥫 '+esc(L('Витрина дня','Display of the day'))+(vq>0&&vq<1000?esc(L(' — за '+vq+' (Валя — '+n(g.vn)+')',' — in '+vq+' (Valya — '+n(g.vn)+')')):'')+' ✓</div>'
        :'<button type="button" class="g3u-l g3u-go" data-g3u="vitr">🥫 '+esc(L('Витрина дня','Display of the day'))+'<span>›</span></button>');}
    if(planOn()){var k=planN(),pd=false;try{pd=GBPL.seal();}catch(e){}if(!pd)todo++;
      rows.push('<button type="button" class="g3u-l g3u-go'+(pd?' ok':'')+'" data-g3u="plan">📋 '+esc(L('Дела дня','Today\'s jobs'))+' '+k+' '+esc(L('из','of'))+' 5'+(pd?' ✓':'')+'<span>›</span></button>');}
    if(ctx.mini){var t=x?'🧺 '+who(x):'';return '<button type="button" class="g3u-card mini g3u-go" data-g3u="'+(planOn()?'plan':'vitr')+'">☀️ '+esc(L('Утро у Вали','Morning at Valya\'s'))+(t?' · '+esc(t):'')+(planOn()?' · 📋 '+planN()+'/5':'')+(todo?'':' ✓')+'<span>›</span></button>';}
    return '<div class="g3u-card"><div class="g3u-h">☀️ '+esc(L('Утро у Вали','Morning at Valya\'s'))+(todo?'':' <i class="g3u-done">'+esc(L('готово ✓','done ✓'))+'</i>')+'</div>'+rows.join('')+
      (todo||rows.length?'':'<div class="g3u-l">'+esc(U.line('card'))+'</div>')+'</div>';},
  mount:function(el){if(!el)return;Array.prototype.forEach.call(el.querySelectorAll('[data-g3u]'),function(b){b.onclick=function(){tap();var k=b.getAttribute('data-g3u');
    G3.mark('utro','card',{k:k});if(k==='vitr'){if(vitrOpen()&&!vitrDone())startLevel(0,true);else if(planOn())GBPL.open();}else if(k==='plan'){try{GBPL.open();}catch(e){}}};});}};
GB.add(GB.homeSlots,{id:'g3-utro',order:5,zone:'plan',on:function(){return U.slot&&cardOn();},render:function(ctx){return U.card.render(ctx);},mount:function(el,ctx){U.card.mount(el,ctx);}});

/* ---------- ночью Валя гонит спать (раз за сеанс, в начале уровня) ---------- */
var night=0;GB.startHook.push(function(info){if(night||info.daily||!G3.on('utro')||tod()!=='n'||(G3.isNew()&&G3.lvDone()<5))return;night=1;
  later(function(){if(!G.speech&&!G.over)say(U.line('n'),'valya');},4200);});

/* ---------- стили ---------- */
(function(){var st=document.createElement('style');st.textContent=
  '.g3u-ask{margin:6px auto 2px;max-width:400px;background:rgba(46,125,50,.1);border-radius:12px;padding:7px 10px;font-size:16px;line-height:1.3;color:#2b3a1c;text-align:left}'+
  '.g3u-ask b{color:#7a3b10}.g3u-ok{display:inline-block;margin-left:4px;color:#2e7d32;font-weight:800;white-space:nowrap}'+
  '.g3u-win .g3u-date{margin:-4px 0 4px;font-size:16px;color:#7a5a3a}'+
  '.g3u-gift{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;background:#fff6e0;border:2px dashed #e0a43a;border-radius:14px;padding:8px 10px;margin:8px 0;text-align:left;font-size:17px}'+
  '.g3u-gift small{display:block;font-size:16px;color:#6a4a2a;font-weight:600}.g3u-gift .btn.small{min-height:48px}'+
  '.g3u-row2{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:6px 0}.g3u-row2 .btn{min-height:48px;font-size:16px;margin:0}'+
  '.g3u-card{background:#fffaf0;border:2px solid #e8cf9e;border-radius:16px;padding:8px 10px;text-align:left;color:#3b2a1a}'+
  '.g3u-h{font-weight:800;font-size:17px;margin:0 0 4px}.g3u-done{font-style:normal;color:#2e7d32;font-size:16px;margin-left:6px}'+
  '.g3u-l{display:flex;align-items:center;gap:6px;width:100%;min-height:48px;font-size:16px;line-height:1.25;padding:4px 6px;border-radius:10px;box-sizing:border-box;text-align:left;color:#3b2a1a}'+
  'button.g3u-l{background:#fff;border:1px solid #e8cf9e;margin:4px 0;font:inherit;font-size:16px;font-weight:700;cursor:pointer}'+
  '.g3u-l span{margin-left:auto;font-size:20px;color:#b3261e}.g3u-l.ok{color:#2e7d32}'+
  'button.g3u-card.mini{display:flex;align-items:center;width:100%;min-height:48px;font:inherit;font-size:16px;font-weight:700;cursor:pointer}button.g3u-card.mini span{margin-left:auto;color:#b3261e;font-size:20px}'+
  '.g3u-vit{margin:6px auto;max-width:400px;background:#fff3d6;border-radius:12px;padding:8px 10px;text-align:left;font-size:16px;line-height:1.3}'+
  '.g3u-vit small{display:block;font-size:16px;font-weight:600;color:#6a4a2a;margin:2px 0 4px}.g3u-vit .btn.small{min-height:48px}'+
  'body.g3-vitr #bUndo{display:none}'+
  '@supports not (inset:0){.g3u-row2 .btn{margin:4px}.g3u-gift>*{margin:2px}}';
  document.head.appendChild(st);})();
})();
