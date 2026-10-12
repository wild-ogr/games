'use strict';
/* ================= gb-win — окно победы «Касса» (поток VIEW, 11.10.2026) =================
   win() в index.html считает всё как раньше (награда, серия, грамота, карточка, межэкранная) и, если вид включён, берёт разметку
   окна отсюда: GB.kassaHtml(p) → html; после обработчиков кнопок зовёт GB.kassaAfter(p) (анимации и «примерка» под экран).
   id кнопок прежние (mNext, mX2, mRes, mLb, mDaily, mShop, mMap, mWon, mStreak) — обработчики общие, в win().
   ПОРЯДОК (сверху вниз; «Дальше · N» — всегда внизу, на одном месте; «В магазин» — ссылкой под ней):
     заголовок (плакатный) → чек (что продано, ИТОГО; печать «ОПЛАЧЕНО», у Ревизии — «РЕВИЗИЯ ПРОЙДЕНА») + zone 'check' →
     «Довольных N из M» + монеты (летят в счётчик со звоном) → мама с малышом/грамота/серия/карточка/«открылось задание дня» →
     zone 'seal' (печать «План выполнен» — META) → zone 'goal' (нет гнёзд — город: точки 10 магазинов, «до Ревизии N · потом X»,
     и цель обстановки) → zone 'mg' (ОДНО предложение — Перерыв, MG0) → zone 'tmr' (нет гнёзд — своя строка «Завтра: …» с 5-го
     уровня) → zone 'extra' → реплика Вали → кнопки.
   ОДНО ПРЕДЛОЖЕНИЕ: ctx.busy (Ревизия, карточка, грамота, серия, «открылось задание дня», следом межэкранная) — zone 'mg' не рисуется;
     «Обставить магазин» (mShop) — только если окно не занято и Перерыва нет.
   ПРИМЕРКА (окно без прокрутки, 320×568): прячем по data-fit (1 — первым): реплика Вали 1, строки чека 2, гнёзда — их fit,
     цель обстановки 6, точки города 7, шапка чека 8.
   Тосты (например, «Задание выполнено — заберите награду!») пока «Касса» открыта — не поверх окна: ждут её закрытия.
   После Ревизии «Дальше» ведёт в уровень (не на карту): новый город показывается в уровне плашкой (levelSlots zone 'top'). */
(function(){
  if(!window.GB||!GB.viewOn)return;
  var K=window.GBKASSA={};
  function $(id){return document.getElementById(id);}
  function Lx(ru,en){return typeof L==='function'?L(ru,en):ru;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function isCalm(){return typeof calm==='function'&&calm();}

  /* ---------- что продано: считаем тройки по ходу уровня ---------- */
  GB.on('start',function(){if(typeof G!=='undefined'&&G)G.vwSold={};});
  if(typeof afterMove==='function'){var am=afterMove;window.afterMove=function(ev,delay,isMove){
    GB.safe('kassa:sold',function(){if(typeof G!=='undefined'&&G&&ev){if(!G.vwSold)G.vwSold={};for(var i=0;i<ev.length;i++)if(ev[i].k==='clear')G.vwSold[ev[i].t]=(G.vwSold[ev[i].t]||0)+3;}});
    return am.apply(this,arguments);};}
  // цены 80-х (копейки за штуку) — только для чека; нет в списке — «как-нибудь»
  var PR={1:55,2:180,3:35,4:42,5:28,6:30,7:22,8:13,9:110,10:85,11:20,12:30,13:38,14:52,15:1,16:90,17:16,18:24,19:72,20:40,21:94,22:48};
  var PRR=[450,320,290,110,180,420,195,400,50,340];
  function price(t){if(typeof RARE0!=='undefined'&&t>=RARE0)return PRR[t-RARE0]||300;return PR[t]||(t*37%180+20);}
  function rub(k){return (k/100).toFixed(2);}
  function gn(t){try{return gName(t);}catch(e){var x=window.GBG&&GBG.get&&GBG.get(t);return x?(typeof LANG!=='undefined'&&LANG==='en'&&x.en?x.en:x.n):'?';}}
  function receipt(p,g){var sold=g&&g.vwSold||{},ids=Object.keys(sold).map(Number).sort(function(a,b){return sold[b]*price(b)-sold[a]*price(a);});
    var tot=0,ln='',show=3;ids.forEach(function(t){tot+=sold[t]*price(t);});
    ids.slice(0,show).forEach(function(t){ln+='<div class="vw-ln" data-fit="2"><span>'+esc(gn(t))+' ×'+sold[t]+'</span><b>'+rub(sold[t]*price(t))+'</b></div>';});
    if(ids.length>show){var rest=0;ids.slice(show).forEach(function(t){rest+=sold[t]*price(t);});
      ln+='<div class="vw-ln" data-fit="2"><span>'+Lx('…ещё ','…and ')+(ids.length-show)+Lx(' наимен.',' more')+'</span><b>'+rub(rest)+'</b></div>';}
    var f=GB.lvInfo(p.i),d=new Date(),dd=('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.1984';
    var st=p.cityDone?Lx('РЕВИЗИЯ<br>ПРОЙДЕНА','INSPECTION<br>PASSED'):Lx('ОПЛАЧЕНО','PAID');
    return '<div class="vw-rcpt'+(isCalm()?'':' print')+'"><div class="vw-rh" data-fit="8">'+esc(Lx('ГАСТРОНОМ','GASTRONOM'))+(p.daily?'':' · '+esc(String(f.city).toUpperCase()))+'<br>'+Lx('КАССА 1','TILL 1')+' · '+dd+'</div>'+ln+
      '<div class="vw-ln vw-tot"><b>'+Lx('ИТОГО','TOTAL')+'</b><b>'+rub(tot)+'</b></div>'+
      '<div class="vw-stamp vw-rst'+(isCalm()?'':' on')+'">'+st+'</div></div>';}

  /* ---------- «до Ревизии» и город ---------- */
  function cityGoal(p){if(p.daily)return '';var f=GB.lvInfo(p.i),h='',n=f.n,dots='';
    for(var k=1;k<=10;k++)dots+='<i class="'+(k<n?'d':k===n?'c':'')+(k===10?' r':'')+'"></i>';
    if(p.cityDone)h='<b>'+(f.glavk?Lx('«Главк» принят! ','Head office approves! '):Lx('Город пройден! ','Town done! '))+'</b>'+Lx('Дальше — ','Next: ')+'<b>'+esc(f.next)+'</b>'+(f.nextRep?' · '+esc(f.nextRep):'')+' 🚂';
    else if(f.toRev===1)h=Lx('Следующий — <b>Ревизия!</b> Потом ','Next is the <b>Inspection!</b> Then ')+esc(f.next);
    else h=Lx('До Ревизии — '+(f.toRev)+' · потом ',(f.toRev)+' to the Inspection · then ')+esc(f.next);
    return '<div class="vw-city-g"><div class="vw-dots" data-fit="7">'+dots+'</div><div class="vw-s">'+h+'</div></div>';}
  // реплика Вали в «Кассе»: TEXT (GBT.win по исходу уровня — Главк > Ревизия > после помощи > …), без него — прежняя из PH
  function vLine(p){var g=typeof G!=='undefined'?G:null;if(window.GBT&&GBT.win&&g&&g.gbInfo&&!(typeof LANG!=='undefined'&&LANG==='en')){
    var w=GB.safe('GBT.win',function(){return GBT.win(g.gbInfo);});if(w&&w.valya)return w.valya;}return p.vline;}
  function tmrLine(p){if(p.i<4&&!p.daily)return '';var s=typeof S!=='undefined'?S:{},t;
    var sn=typeof streakNow==='function'?streakNow():0;
    if((s.unlocked||0)>=7)t=Lx('новое задание дня','a new daily task')+(sn?Lx(' · серия '+(sn+(p.daily?0:1))+' 🔥',' · streak '+(sn+(p.daily?0:1))+' 🔥'):'');
    else t=Lx('откроется задание дня — после 6-го уровня','the daily task unlocks after level 6');
    return '<div class="vw-tmr"><b>📅 '+Lx('Завтра:','Tomorrow:')+'</b> '+t+'</div>';}

  /* ---------- окно ---------- */
  K.open=false;
  function Z(z,ctx){var x=GB.html(GB.winSlots,z,ctx);return x?'<div class="gbw gbw-'+z+'">'+x+'</div>':'';}
  GB.kassaHtml=function(p){var g=typeof G!=='undefined'?G:null,ctx=p.gbW||GB.winCtx({});ctx.kassa=1;
    var has=function(z){return GB.winSlots.some(function(s){return s&&s.zone===z&&(!s.on||GB.safe(s.id,s.on)!==false);});};
    var f=GB.lvInfo(p.i),title=p.cityDone?(f.glavk?Lx('«Главк» принят!','Head office approves!'):Lx('Ревизия пройдена!','Inspection passed!')):p.daily?Lx('Задание дня выполнено!','Daily task done!'):Lx('Всё продано!','All sold out!');
    var tot=(p.served||0)+(p.angry||0),sm='';for(var k=0;k<Math.min(8,p.served||0);k++)sm+='🙂';for(var k2=0;k2<Math.min(3,p.angry||0);k2++)sm+='😟';
    var stars='';for(var k3=0;k3<3;k3++)stars+=k3<p.st?'★':'<span class="e">☆</span>';
    var c0=typeof S!=='undefined'?(+S.coins||0)-(p.reward+p.bonus):0;
    var h='<div class="vw-kassa'+(p.cityDone?' vw-neon':'')+'" id="gbWin"><div class="vw-khead"><h2 class="vw-poster vw-kt">'+title+'</h2><div class="pill vw-kcoin" id="vwKcoin">💰 <b>'+c0+'</b></div></div>';
    h+=receipt(p,g)+Z('check',ctx);
    h+='<div class="vw-kline'+(isCalm()?'':' step')+'" style="animation-delay:1.1s"><div><b>'+Lx('Довольных ','Happy: ')+(p.served||0)+Lx(' из ',' of ')+tot+'</b><span class="vw-sm">'+sm+'</span><span class="vw-kst">'+stars+'</span></div>'+
      '<div class="coins-won" id="mWon">+'+(p.reward+p.bonus)+' 💰</div></div>';
    if(p.vet)h+=/* p.vet — имя старое, смысл «мама с малышом» (решение владельца 10.10) */'<p class="vw-small">'+Lx('👶 Маме с малышом — спасибо: +','👶 A mum with a baby thanks you: +')+(typeof VET_BONUS!=='undefined'?VET_BONUS:5)+' 💰</p>';
    if(p.chest)h+='<div class="chest">'+Lx('📜 Грамота «Лучший магазин города»','📜 "Best Store in Town" certificate')+': '+p.cs+'★ — +'+p.chest+' 💰</div>';
    else if(p.cityDone&&p.nextT)h+='<p class="vw-small">'+Lx('📜 Грамота города: соберите '+p.nextT[0]+'★ (сейчас '+p.cs+'★)','📜 Town certificate: collect '+p.nextT[0]+'★ (now '+p.cs+'★)')+'</p>';
    if(p.sk)h+='<div id="mStreak">'+streakHtml(p.sk.day)+'</div>';
    if(p.card>=0)h+='<div class="newcard"><p>'+Lx('⭐ Новое в коллекции «Дефицит»:','⭐ New in the Rare Goods collection:')+' <b>'+esc(RARE[p.card].n)+'</b></p><canvas id="ncv"></canvas></div>';
    if(p.dOpen)h+='<div class="chest">'+Lx('📅 Открылось задание дня: каждый день +'+DAILY_REWARD+' 💰 и подарок за серию дней!','📅 Daily task unlocked: +'+DAILY_REWARD+' 💰 every day and a gift for a streak!')+'</div>';
    h+=Z('seal',ctx);
    if(has('goal'))h+=Z('goal',ctx);else{h+=cityGoal(p);if(!p.daily&&!ctx.busy&&typeof goalHtml==='function')h+=goalHtml().replace('class="goal"','class="goal" data-fit="6"');}
    var mg=ctx.busy?'':Z('mg',ctx);h+=mg;
    h+=has('tmr')?Z('tmr',ctx):tmrLine(p);
    h+=Z('extra',ctx);
    if(typeof valyaHtml==='function')h+=valyaHtml(QQ(vLine(p))).replace('class="vsay"','class="vsay" data-fit="1"');
    // кнопки: «Дальше» — главная, всегда здесь; одно предложение рядом; «В магазин» — ссылкой
    var row='';
    if(!p.daily)row+='<button class="btn green big vw-next" id="mNext">'+(p.cityDone?Lx('Дальше · ','Next · ')+esc(f.next):Lx('Дальше · ','Next · ')+(p.i+2))+'</button>';
    if(p.x2)row+='<button class="btn x2b rw" id="mX2">'+Lx('📺 ×2 монеты за рекламу','📺 ×2 coins for an ad')+' <span class="nw">(+'+p.reward+'&nbsp;💰)</span></button>';
    if(p.sk&&p.sk.lost&&adOk())row+='<button class="btn accent rw" id="mRes">'+Lx('📺 Вернуть серию за рекламу','📺 Restore streak for an ad')+' <span class="nw">('+Lx('день','day')+' '+(p.sk.lost+1)+')</span></button>';
    if(p.lb)row+='<button class="btn accent" id="mLb">'+Lx('🏆 Рейтинг','🏆 Leaderboard')+'</button>';
    if(p.dOpen)row+='<button class="btn x2b noent" id="mDaily">'+Lx('📅 К заданию дня','📅 Go to the daily task')+'</button>';
    if(p.canBuy&&!ctx.busy&&!mg&&(!window.GBNB||!GBNB.turn||GB.safe('nb:turn',function(){return GBNB.turn('shop');})!==false))row+='<button class="btn noent vw-sec" id="mShop">'+Lx('🛋 Обставить зал','🛋 Furnish the hall')+'</button>';
    if(p.daily)row+='<button class="btn green big vw-next" id="mMap">'+Lx('В магазин','To the store')+'</button>';
    h+='<div class="row vw-krow">'+row+'</div>';
    if(!p.daily)h+='<button class="vw-klink noent" id="mMap">'+Lx('В магазин','To the store')+'</button>';
    return h+'</div>';};

  /* ---------- после показа: примерка, монеты в счётчик, анимации ---------- */
  var PRI={nbgift:9,'mt-album':8,'mt-depnews':7,'mt-book':6,nbtmr:5,league:4,season:3}; // важность справки (подарок, карточка, отдел, Книга, «Завтра», лига, план квартала)
  function pri(e){var k=e.getAttribute('data-gb');return PRI[k]!=null?PRI[k]:+e.getAttribute('data-fit')||0;}
  function fit(){var mo=$('modal'),c=$('gbWin');if(!mo||!c)return;var cd=$('mcard');if(cd)cd.classList.add('vw-measure'); // меряем без анимаций (чек «печатается» с нулевой высоты)
    /* POLISH (QA-RU): справок внизу «Кассы» (зоны tmr/extra) — не больше двух: оставляем важные (PRI; без fit — всегда) */
    var X=[].slice.call(c.querySelectorAll('.gbw-tmr>.gbs,.gbw-extra>.gbs')).filter(function(e){return e.style.display!=='none'&&e.hasAttribute('data-fit');})
      .sort(function(a,b){return pri(a)-pri(b);});
    var keepNoFit=c.querySelectorAll('.gbw-tmr>.gbs:not([data-fit]),.gbw-extra>.gbs:not([data-fit])').length;
    for(var j=0;j<X.length-Math.max(0,2-keepNoFit);j++)X[j].style.display='none';
    var L0=[].slice.call(c.querySelectorAll('[data-fit]')).sort(function(a,b){return (+a.getAttribute('data-fit'))-(+b.getAttribute('data-fit'));});
    for(var i=0;i<L0.length&&mo.scrollHeight>mo.clientHeight+1;i++)L0[i].style.display='none';
    if(cd){void cd.offsetWidth;cd.classList.remove('vw-measure');}}
  K.fit=fit;
  function coins(p){var mo=$('modal'),won=$('mWon');if(!mo||!won||typeof S==='undefined')return;var add=p.reward+p.bonus,to=+S.coins||0,from=to-add;
    var pill=$('vwKcoin');if(!pill)return;
    if(isCalm()||add<=0){pill.querySelector('b').textContent=to;return;}
    setTimeout(function(){if(!$('gbWin'))return;var a=won.getBoundingClientRect(),b=pill.getBoundingClientRect(),n=Math.min(8,Math.max(3,add>>1));
      for(var k=0;k<n;k++)(function(k){var e=document.createElement('div');e.className='vw-fly';e.textContent='💰';e.style.left=(a.left+a.width/2-10+k*3)+'px';e.style.top=(a.top)+'px';
        e.style.setProperty('--dx',(b.left+12-(a.left+a.width/2-10+k*3))+'px');e.style.setProperty('--dy',(b.top-a.top)+'px');e.style.animationDelay=(k*.07)+'s';document.body.appendChild(e);
        setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},1300+k*70);})(k);
      var t0=performance.now(),dur=900;setTimeout(function(){if(typeof SND!=='undefined'&&SND.coin)SND.coin();},650);
      (function step(){var x=Math.min(1,(performance.now()-t0-500)/dur);if(x<0)x=0;var b2=pill.querySelector('b');if(b2)b2.textContent=Math.round(from+add*x);if(x<1&&pill.parentNode)requestAnimationFrame(step);else pill.classList.add('pop');})();},1300);}
  GB.kassaAfter=function(p){K.open=true;document.documentElement.classList.add('vw-kopen');GB.safe('kassa:fit',fit);GB.safe('kassa:coins',function(){coins(p);});
    if(p.cityDone){var f=GB.lvInfo(p.i+1);K.newCity={idx:p.i+1,city:f.city,rep:f.rep,col:f.col,newRep:!!GB.lvInfo(p.i).nextRep};}};
  // окно закрылось/сменилось — счётчик убрать, отложенные тосты показать
  var Q=[];
  function closed(){if(!K.open)return;K.open=false;document.documentElement.classList.remove('vw-kopen');
    if(Q.length){var t=Q[Q.length-1];Q=[];setTimeout(function(){if(typeof toast==='function')toast(t[0],t[1]);},250);}}
  if(typeof hideModal==='function'){var hm=hideModal;window.hideModal=function(){closed();return hm.apply(this,arguments);};}
  if(typeof modal==='function'){var md=modal;window.modal=function(html){if(K.open&&String(html).indexOf('class="vw-kassa')<0)closed();return md.apply(this,arguments);};}
  if(typeof toast==='function'){var ts=toast;window.toast=function(t,ms){if(K.open&&document.querySelector('#mcard .vw-kassa')&&typeof modalOn!=='undefined'&&modalOn){Q.push([t,ms]);return;}return ts.apply(this,arguments);};}

  /* ---------- новый город — плашкой в уровне (после Ревизии «Дальше» ведёт прямо в уровень) ---------- */
  GB.add(GB.levelSlots,{id:'vwCity',order:1,zone:'top',render:function(c){var n=K.newCity;if(!n||n.idx!==c.idx||c.daily)return '';K.newCity=null;
    return '<div class="vw-cityin" style="background:'+esc(n.col)+'"><small>🚂 '+(n.newRep?Lx('Новая республика · ','New republic · ')+esc(n.rep):Lx('Новый город','New town'))+'</small><b class="vw-poster">'+esc(n.city)+'</b></div>';},
    mount:function(el){setTimeout(function(){if(el.parentNode)el.innerHTML='';},isCalm()?2500:3600);}});
})();
