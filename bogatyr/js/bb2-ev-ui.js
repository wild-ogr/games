/* ===== bb2-ev-ui.js — поток EVENT: окна и календарь (догружается набором 'ev' после bb2-ev-pdv.js) =====
   Флаги: pdv — вид «Подвигов» (вкладка, полоска на «В поход», итоги) · utro — «Утро богатыря» (одно окно в один экран) · cal — «Месяцеслов» (28 дней, день за поход)
   dary — «Семь даров дружины» · shod — «Сход богатырей» · saga2 — Сказ на виду, по календарю и с хвостом · zavtra — одно обещание на завтра · fest2 — лесенка Кощеевой недели
   gost — «гость недели» в походе. Числа — BB2.n('ev.…'). Общие файлы не правятся: подменяются глобальные функции ui.js (с вызовом старой, если флаг выключен):
   renderQuests, questBadge, loginState, openLogin, openToday, tomorrowLine. */
(function(E){
  var N=E.N,ev=E.ev,fn=E.fn,can=E.can,RES={};
  function has(f){return typeof window[f]==='function';}
  function on(f){return BB2.on(f);}
  function today(){return dayKey();}
  function sl(){try{return has('SL')?SL():null;}catch(e){return null;}}
  function inRun(){return document.body.classList.contains('run');}
  function mst(m,a,o){o=o||{};o.m=m;o.a=a;BB2.stat('mod',o);}
  function icn(k,px){return typeof ART!=='undefined'&&ART[k]?ic(k,px||96):ic('chest',px||96);}
  /* Слава/Сказ могут догружаться позже (каркас, этап 2): «модуль есть у игрока, но ещё не приехал» — награду кладём в очередь S.bb2.ev.m.q и выдаём, когда приедет */
  function slE(){return !!sl()||(typeof SL==='undefined'&&!!S.slava&&typeof S.slava==='object');}
  function gv(r,src){try{if(sl()){rwGive(r,src);return true;}if(slE()){var m=ev().m;if(!Array.isArray(m.q))m.q=[];if(m.q.length<30)m.q.push(r);return true;}}catch(e){}return false;}
  function gvFlush(){try{var m=ev().m;if(sl()&&Array.isArray(m.q)&&m.q.length){var q=m.q;m.q=[];q.forEach(function(r){rwGive(r,'ev');});save();}}catch(e){}}
  function rtx(r){try{if(has('rwText'))return rwText(r);}catch(e){}return r.it?(r.it==='rr'?L('Свиток перебора','Reroll scroll'):L('Оберег изгнания','Banish charm'))+' ×'+r.n:r.fx?L('слава +','fame +')+r.fx:r.tr?L('трофеи ×','trophies ×')+r.tr:'';}
  E.gv=gv;
  function dnum(k){return +(String(k).replace(/\D/g,''))||0;}
  function dgap(a,b){if(!a||!b)return 99;var x=a.split('-'),y=b.split('-');return Math.round((new Date(+y[0],y[1]-1,+y[2])-new Date(+x[0],x[1]-1,+x[2]))/864e5);}
  function dms(k){var x=k.split('-');return new Date(+x[0],x[1]-1,+x[2],12).getTime();}

  /* ---------- стили (на переменных вида «Живая сказка», запас — тёмный вид) ---------- */
  (function(){if(document.getElementById('evCss'))return;var s=document.createElement('style');s.id='evCss';s.textContent=
    '.evl{display:flex;align-items:center;gap:8px;padding:5px 10px;margin:5px 0 0;border-radius:12px;background:rgba(0,0,0,.18);font-size:13px;line-height:1.25;cursor:pointer}'+
    'html.lk .evl{background:rgba(110,67,31,.12);color:var(--ink)}.evl b{font-weight:800}.evl .g{flex:1;min-width:0}.evl .g small{display:block;opacity:.8;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '.evl .bar{height:6px;margin-top:3px}.evl.hot{box-shadow:0 0 0 1.5px rgba(255,201,74,.7) inset}.evl img{width:26px;height:26px;flex:none}.evl .r{flex:none;font-weight:800;font-size:12.5px}'+
    'body.ev-pdv #todayBtn .chips{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}body.ev-pdv #todayBtn .chips::-webkit-scrollbar{display:none}'+
    '.evwk{display:flex;gap:3px;margin:6px 0}.evwk>div{flex:1;min-width:0;text-align:center;padding:5px 1px;border-radius:9px;background:rgba(255,255,255,.07);font-size:10.5px;line-height:1.2;border:1px solid transparent}'+
    'html.lk .evwk>div{background:rgba(110,67,31,.1)}.evwk>div.dn{background:rgba(74,222,106,.2)}.evwk>div.nw{border-color:var(--gold,#ffc94a);background:rgba(255,201,74,.25)}.evwk>div b{display:block;font-size:12px}.evwk img{width:20px;height:20px;display:block;margin:1px auto}'+
    '.evt{display:flex;gap:6px;margin:8px 0}.evt>button{flex:1;min-width:0;padding:7px 3px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(0,0,0,.2);color:inherit;font:inherit;text-align:center;cursor:pointer}'+
    'html.lk .evt>button{background:rgba(110,67,31,.1);border-color:var(--goldB,#c9a227);color:var(--ink)}.evt img{width:34px;height:34px;display:block;margin:0 auto 2px}.evt b{display:block;font-size:12.5px;line-height:1.15}.evt small{display:block;font-size:11px;opacity:.85;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '.evu .sub{margin:2px 0 4px}.evu .btns{margin-top:8px}.evu .evall{display:flex;gap:6px}.evu .evall .btn{flex:1}.evu a.more{display:block;text-align:center;font-size:12.5px;opacity:.85;margin-top:6px;text-decoration:underline;cursor:pointer}'+
    '.evg{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin:4px 0}.evg>div{text-align:center;padding:2px 0;border-radius:8px;background:rgba(255,255,255,.07);font-size:10.5px;line-height:1.15;border:1px solid transparent}'+
    'html.lk .evg>div{background:rgba(110,67,31,.1)}.evg>div.dn{background:rgba(74,222,106,.2)}.evg>div.nw{border-color:var(--gold,#ffc94a);background:rgba(255,201,74,.25)}.evg>div.ms{font-weight:800}.evg img{width:15px;height:15px;display:block;margin:0 auto}'+
    '.evsh{display:flex;align-items:center;gap:8px;padding:2px 8px;border-radius:10px;font-size:13px}.evsh.me{background:rgba(255,201,74,.22);font-weight:800}.evsh img{width:25px;height:25px}.evsh i{font-style:normal;width:18px;text-align:center;font-weight:800}.evsh span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '.evres{font-size:13px;line-height:1.35;text-align:left;margin:6px 0;padding:6px 10px;border-radius:12px;background:rgba(138,240,160,.1);border:1px solid rgba(138,240,160,.3)}html.lk .evres{background:rgba(60,130,60,.1);color:var(--ink)}.evres div+div{margin-top:3px}'+
    '.evku{font-size:13.5px;line-height:1.45;font-style:italic;margin:6px 0;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.15)}html.lk .evku{background:rgba(110,67,31,.1)}';
    document.head.appendChild(s);})();
  function bar(q){return '<div class="bar"><i style="width:'+Math.round(Math.max(0,Math.min(1,q))*100)+'%"></i></div>';}

  /* ================= «МЕСЯЦЕСЛОВ»: лист на 28 дней, день — за поход от 30 с, конь прощает один пропуск в календарную неделю ================= */
  var MILE={7:1,14:1,21:1,28:1};
  function C(){var c=ev().cal;if(!c.mig){c.mig=1;var LG=S.login||{},t=today();
      if(LG.n>0&&dgap(LG.last,t)<=2){c.d=LG.n;c.last=LG.last;var st=S.streak||{};c.n=Math.max(LG.n,dgap(st.last,t)<=2?st.n|0:0);}}
    return c;}
  function calSt(){var c=C(),t=today(),g=dgap(c.last,t);if(c.last&&g<=0)return {done:1,day:c.d||1,next:c.d%28+1,n:c.n};
    if(c.last&&g===1)return {day:c.d%28+1,n:c.n+1};
    if(c.last&&g===2){var miss=dms(dayPrev(t));if(c.fw!==weekNo(miss))return {day:c.d%28+1,n:c.n+1,skip:weekNo(miss)};}
    return {day:1,n:1,lost:c.n>1&&g<9?c.n:0};}
  E.calSt=calSt;
  function calRw(d){if(d===7){var sk=LOGIN_SKINS.find(function(k){return !S.skins[k];});return sk?{sk:sk}:{g:N('cal.d7gold',1000)/*ECO? как в игре: 1000, если облики за вход кончились*/};}
    if(d===14)return slE()?{it:[['rr',N('cal.d14.scroll',3)],['ban',N('cal.d14.ban',1)]]}:{g:E.gold('m')};
    if(d===21)return slE()?{tr:N('cal.d21.tro',10)}:{g:E.gold('m')};
    if(d===28)return {g:E.gold(N('cal.d28.chest','b'))}; /* большой сундук месяца — золото по отрезку глав (договор ECO) */
    return {g:loginReward((d-1)%7+1)};}
  function calTxt(r){var a=[];if(r.g)a.push('+'+fn(r.g)+goldW());if(r.sk)a.push(rewardText(r.sk));if(r.it)r.it.forEach(function(x){a.push(rtx({it:x[0],n:x[1]}));});if(r.tr)a.push(rtx({tr:r.tr,i:0}));if(r.fx)a.push(rtx({fx:r.fx}));return a.join(' · ');}
  function calGive(r){if(r.g){S.gold+=r.g;ern('gift',r.g);}if(r.sk)S.skins[r.sk]=1;if(r.it)r.it.forEach(function(x){gv({it:x[0],n:x[1]},'cal');});if(r.tr)gv({tr:r.tr,i:0},'cal');if(r.fx)gv({fx:r.fx},'cal');}
  function calCredit(){if(!on('cal'))return;var st=calSt();if(st.done)return;var c=C(),t=today(),r=calRw(st.day);
    c.d=st.day;c.last=t;c.n=st.n;if(st.skip){c.fw=st.skip;mst('cal','skip',{d:st.day});}if(st.day===28)c.sh++;
    calGive(r);S.login={last:t,n:(st.day-1)%7+1}; /* старое поле входа — чтобы без флага серия продолжилась с того же места */
    mst('cal',MILE[st.day]?'mile':'day',{d:st.day,n:st.n});
    RES.cal='📅 '+L('День '+st.day+' Месяцеслова засчитан: ','Calendar day '+st.day+' counted: ')+'<b>'+calTxt(r)+'</b>'+(st.skip?L(' · Сивка-Бурка довёз: пропуск прощён',' · Sivka-Burka carried you: the missed day is forgiven'):'');}
  function calCell(d,st){var r=calRw(d),dn=st.done?d<=st.day:d<st.day,nw=!st.done&&d===st.day;
    return '<div class="'+(dn?'dn':nw?'nw':'')+(MILE[d]?' ms':'')+'"><b>'+d+'</b>'+(r.sk?'<img src="'+icn('hp_'+r.sk,60)+'" alt="">':MILE[d]?'<img src="'+icn('chest',60)+'" alt="">':'<img src="'+icn('coin',48)+'" alt="">')+(dn?'✓':r.g&&!MILE[d]?fn(r.g):'★')+'</div>';}
  E.calOpen=function(){if(inRun())return;var st=calSt(),h='',d;STAT.screen('cal');for(d=1;d<=28;d++)h+=calCell(d,st);var cur=st.done?st.next:st.day;
    showModal('<h3>'+L('Месяцеслов','The Calendar')+'</h3><p class="sub">'+L('День — за любой поход от 30 секунд. Серия: ','A day counts for any 30+ second run. Streak: ')+'<b>'+(st.done?st.n:Math.max(0,st.n-1))+L(' дн.',' d')+'</b></p>'+
      '<div class="evg">'+h+'</div>'+
      '<div class="card" style="font-size:12.5px;line-height:1.35;padding:8px 10px;margin:0">'+(st.done?L('✓ Сегодня засчитано. Завтра — день '+st.next+': ','✓ Counted today. Tomorrow — day '+st.next+': ')+'<b>'+calTxt(calRw(st.next))+'</b>':L('Сегодня — день '+cur+': ','Today — day '+cur+': ')+'<b>'+calTxt(calRw(cur))+'</b>'+L(' — сходи в любой поход.',' — go on any run.'))+
        '<br>🐴 '+L('Сивка-Бурка довезёт: один пропущенный день в неделю серию не рвёт.','Sivka-Burka has your back: one missed day a week won’t break the streak.')+
        '<br>★ '+L('7-й день — облик, 14-й — свитки, 21-й — трофеи, 28-й — сундук месяца.','Day 7 — an outfit, 14 — scrolls, 21 — trophies, 28 — the chest of the month.')+'</div>'+
      '<div class="btns"><button class="btn big" id="evCalGo">'+(st.done?L('Хорошо','OK'):L('В бой!','To battle!'))+'</button></div>','evcal');
    document.getElementById('evCalGo').onclick=function(){SND.click();hideModal();openTab('Map');};mst('cal','open',{d:cur});};
  function wkRibbon(){var st=calSt(),cur=st.done?st.day:st.day,w0=Math.floor((cur-1)/7)*7,h='',d;for(d=w0+1;d<=w0+7;d++)h+=calCell(d,st);return '<div class="evwk" id="evWk">'+h+'</div>';}
  /* без правки ui.js: старое окно входа и его «готово» молчат, пока включён Месяцеслов */
  var _ls=window.loginState,_ol=window.openLogin;
  if(has('loginState'))loginState=function(){if(!on('cal')||!(S.runs|0))return _ls.apply(this,arguments);var st=calSt();return {ready:false,n:((st.done?st.day:Math.max(1,st.day-1))-1)%7+1};};
  if(has('openLogin'))openLogin=function(){if(!on('cal')||!(S.runs|0))return _ol.apply(this,arguments);E.calOpen();};

  /* ================= «СЕМЬ ДАРОВ ДРУЖИНЫ»: неделя новичка — дар за каждый календарный день с походом ================= */
  var DARY=[
    {h:'dob',who:function(){return L('Добрыня','Dobrynya');},say:function(){return L('«На первую ковку. Кузнец сдачи не даёт — проверено.»','“For your first forging. The smith gives no change — I checked.”');},r:function(){return {g:N('dary.d1.gold',150)};}},
    {h:'ale',who:function(){return L('Алёша Попович','Alyosha Popovich');},say:function(){return L('«Не нравятся карточки — перебери. Я так всю жизнь живу.»','“Don’t like the cards? Reroll. That’s how I live.”');},r:function(){return slE()?{it:[['rr',N('dary.d2.scroll',2)]]}:{g:E.gold('s')};}},
    {h:'vas',who:function(){return L('Василиса','Vasilisa');},say:function(){return L('«Лишнюю карточку — с глаз долой. Премудрость начинается с порядка.»','“An unwanted card — out of sight. Wisdom begins with tidiness.”');},r:function(){return slE()?{it:[['ban',N('dary.d3.ban',1)]]}:{g:E.gold('s')};}},
    {h:'ily',who:function(){return L('Илья Муромец','Ilya Muromets');},say:function(){return L('«Носи, гридень. Я в твои годы ещё на печи лежал.»','“Wear it, squire. At your age I was still lying on the stove.”');},r:function(){return {sk:'dob@grid'};}},
    {h:'mik',who:function(){return L('Микула','Mikula');},say:function(){return L('«На пирожки в дорогу. Голодный богатырь — пол-богатыря.»','“For pies on the road. A hungry hero is half a hero.”');},r:function(){return {g:N('dary.d5gold',120)/*ECO? в договоре — 3 пирожка; пока золотом «на пирожки»*/};}},
    {h:'sad',who:function(){return L('Садко','Sadko');},say:function(){return L('«Трофеи — тот же товар. Староста берёт оптом.»','“Trophies are goods too. The elder buys wholesale.”');},r:function(){return slE()?{tr:N('dary.d6.tro',5)}:{g:E.gold('s')};}},
    {h:'vol',who:function(){return L('Вольга','Volga');},say:function(){return L('«Неделю выстоял — пора и в былину. Боян, запевай!»','“A week on your feet — time for a ballad. Boyan, strike up!”');},r:function(){return slE()?{g:N('dary.d7.gold',300),it:[['rr',N('dary.d7.scroll',3)]]}:{g:N('dary.d7.gold',300)};},ku:1}];
  function Dr(){var d=ev().dary;if(!d.on){d.on=(S.runs|0)<=3&&!d.n?1:-1;}return d;}
  function daryOn(){return on('dary')&&Dr().on>0&&Dr().n<7;}
  function daryRun(){if(!daryOn())return;var d=Dr(),t=today();if(d.last===t)return;var g=DARY[d.n],r=g.r();if(r.sk&&S.skins[r.sk])r={g:E.gold('s')};
    d.n++;d.last=t;calGive(r);mst('dary','gift',{n:d.n});
    RES.dary='🎁 '+L('Дар дружины '+d.n+' из 7 — '+g.who()+': ','Squad gift '+d.n+' of 7 — '+g.who()+': ')+'<b>'+calTxt(r)+'</b>'+((window.innerHeight||640)>=700?'<br><i>'+g.say()+'</i>':''); /* на низком экране реплика не влезает над кнопками итогов */
    if(g.ku){var k={c:'zapev',n:0,t:L('Как пришёл на Русь новый богатырь — семь дней дружина его дарила, на восьмой нечисть сама подарки понесла: откупиться.','A new hero came to the land — for seven days the squad gave him gifts; on the eighth the monsters brought their own: to buy him off.'),src:'dary'};
      RES.ku=k;BB2.ev('kuplet',k);}}
  function daryNext(){var d=Dr();return DARY[Math.min(6,d.n)];}
  BB2.hook('cloud',function(){try{var d=ev().dary;if(d.on>0&&!d.n&&(S.runs|0)>=N('dary.oldRuns',10))d.on=-1;}catch(e){}}); /* «старый на новом устройстве» — ленты нет */

  /* ================= «СХОД БОГАТЫРЕЙ»: неделя, игрок и 7 былинных соперников (не из играбельных), счёт — Слава за неделю ================= */
  var RIV=[[function(){return L('Святогор','Svyatogor');},'hp_ily',200,0],[function(){return L('Дунай Иванович','Dunai Ivanovich');},'hp_dob',120,2],[function(){return L('Ставр Годинович','Stavr Godinovich');},'hp_sad',300,0],[function(){return L('Чурила Пленкович','Churila Plenkovich');},'hp_ale',60,1],
    [function(){return L('Дюк Степанович','Dyuk Stepanovich');},'hp_iva',260,1],[function(){return L('Михайло Потык','Mikhailo Potyk');},'hp_vol',160,0],[function(){return L('Василий Буслаев','Vasily Buslaev');},'hp_mik',330,2],[function(){return L('Настасья Микулишна','Nastasya Mikulishna');},'hp_mar',90,0],[function(){return L('Сухман','Sukhman');},'hp_dob',220,1]];
  function shodOpen(){if(!on('shod')||!slE())return false;var n=0,k;for(k in S.done)n++;return n>=N('shod.openCh',3)||ev().shod.w>0;}
  function X(){var s=sl()||S.slava;return s?s.x|0:0;}
  function wkFrac(){var d=new Date(dayMs()),dow=(d.getDay()+6)%7;return Math.min(1,(dow*24+d.getHours()+d.getMinutes()/60)/168);}
  function rivals(w,pace,fr,hc){if(hc>0&&hc<1){fr=Math.max(0,(fr-hc)/(1-hc));pace=pace*(1-hc);}var R=mulberry(w*7919+13),ix=[0,1,2,3,4,5,6,7,8],i,j,t,F=[1.15,1.05,.95,.85,.78,.7,.6],out=[];
    for(i=8;i>0;i--){j=Math.floor(R()*(i+1));t=ix[i];ix[i]=ix[j];ix[j]=t;}
    for(i=0;i<7;i++){var r=RIV[ix[i]],f=N('shod.f'+i,F[i])*(.96+.08*R()),g=r[3]===1?Math.pow(fr,2.2):r[3]===2?1-Math.pow(1-fr,2.2):fr;
      out.push({nm:r[0](),ic:r[1],hue:r[2],n:Math.round(pace*f*g)});}
    return out;}
  function table(w,pace,fr,my,hc){var a=rivals(w,pace,fr,hc);a.push({nm:L('Ты','You'),me:1,ic:'hp_'+(typeof skinKey==='function'?skinKey(S.hero||'dob'):'dob'),n:my});
    a.sort(function(x,y){return y.n-x.n||(x.me?-1:1);});for(var i=0;i<a.length;i++)a[i].pl=i+1;return a;}
  function shNow(){var sh=ev().shod,a=table(sh.w,sh.pace,wkFrac(),Math.max(0,X()-sh.x0),sh.h),me=null,i;for(i=0;i<a.length;i++)if(a[i].me)me=a[i];return {a:a,me:me,up:me.pl>1?a[me.pl-2]:null};}
  function shRw(pl){var t=N('shod.weekTro',[8,5,3])[pl-1]|0;t=Math.round(t*(+BB2.hk('shodK',pl)||1));return t?{tr:t}:{};} /* крючок shodK(место) → множитель трофеев Схода (WINTER: праздники ×2) */ /* награды — трофеи за 1–3-е место (договор ECO), золота Сход не платит */
  function shRoll(){if(!shodOpen())return;var sh=ev().shod,w=weekNo();if(sh.w===w)return;
    if(!sh.pace)sh.pace=N('shod.pace0',260);
    if(sh.w>0){var my=Math.max(0,X()-sh.x0),a=table(sh.w,sh.pace,1,my,sh.h),me=null,i;for(i=0;i<a.length;i++)if(a[i].me)me=a[i];
      if(w-sh.w>1||my<=0){sh.pace=Math.max(N('shod.paceMin',150),Math.round(sh.pace*N('shod.skip',.85)));if(my>0){sh.lw=sh.w;sh.lp=me.pl;sh.ln=my;sh.seen=0;sh.up=me.pl>1?a[me.pl-2].nm:'';sh.gap=me.pl>1?a[me.pl-2].n-my:0;}}
      else{sh.lw=sh.w;sh.lp=me.pl;sh.ln=my;sh.seen=0;sh.up=me.pl>1?a[me.pl-2].nm:'';sh.gap=me.pl>1?a[me.pl-2].n-my:0;
        sh.pace=Math.max(N('shod.paceMin',150),Math.round(sh.pace*(1-N('shod.ema',.4))+my*N('shod.ema',.4)));}
      if(sh.lw===sh.w&&!sh.seen){calGive(shRw(sh.lp));if(sh.lp===1){sh.wins++;BB2.pdv('shod.win');}mst('shod','week',{pl:sh.lp,n:sh.ln});}}
    sh.h=sh.w>0?0:Math.round(wkFrac()*100)/100;sh.w=w;sh.x0=X();try{save();}catch(e){}} /* sh.h: вступил посреди недели — соперники считают с этого же часа */
  E.shodOpen=function(){if(inRun()||!shodOpen())return;shRoll();var sh=ev().shod,q=shNow(),h='',i,r,d=new Date(dayMs()),left=7-(d.getDay()+6)%7;STAT.screen('shod');
    for(i=0;i<q.a.length;i++){r=q.a[i];h+='<div class="evsh'+(r.me?' me':'')+'"><i>'+r.pl+'</i><img src="'+icn(r.ic,72)+'" alt=""'+(r.me?'':' style="filter:hue-rotate('+r.hue+'deg)"')+'><span>'+r.nm+'</span><b>'+fn(r.n)+'</b></div>';}
    var last=sh.lw>0?'<div class="card" style="font-size:12.5px;line-height:1.35;margin:6px 0 0;padding:8px 10px">'+L('Прошлая неделя: ты <b>'+sh.lp+'-й</b> из 8 ('+fn(sh.ln)+' Славы)','Last week: you placed <b>#'+sh.lp+'</b> of 8 ('+fn(sh.ln)+' Fame)')+(sh.lp>1&&sh.up?L(', до соперника «'+sh.up+'» не хватило '+fn(sh.gap+1),', '+fn(sh.gap+1)+' short of '+sh.up):'')+(calTxt(shRw(sh.lp))?L('. Награда: ','. Reward: ')+'<b>'+calTxt(shRw(sh.lp))+'</b>':L('. Награды — первым трём.','. Rewards go to the top three.'))+'</div>':'';
    sh.seen=1;
    showModal('<h3>'+L('Сход богатырей','The Heroes’ Muster')+'</h3><p class="sub">'+L('У кого за неделю больше Славы. До итога — '+left+' дн.','Most Fame in a week wins. '+left+' d to go.')+'</p>'+h+last+
      '<p class="sub" style="font-size:12.5px;margin:6px 0 0">'+L('Итог в понедельник. За 1-е место: ','Results on Monday. 1st place: ')+calTxt(shRw(1))+L(' и куплет в Былину.',' and a verse in the Ballad.')+'</p>'+
      '<div class="btns"><button class="btn big" id="evShGo">'+L('В бой!','To battle!')+'</button></div>','evshod');
    document.getElementById('evShGo').onclick=function(){SND.click();hideModal();openTab('Map');};mst('shod','open',{pl:q.me.pl,n:q.me.n});try{save();}catch(e){}};

  /* ================= СКАЗ МЕСЯЦА: по календарю (таблица по номеру сказа), хвост после 30-й ступени, «Удалая» на день за Поход дня ================= */
  function sagaTable(){if(!on('saga2')||typeof SAGA==='undefined'||SAGA.ev)return;var b=SAGA.slice(0,3),i;if(b.length<3)return;
    for(i=0;i<60;i++)SAGA[i]=b[i%3];SAGA[12]=b[1]; /* №12 (03.12–30.12) — «Морозко» под Новый год; №13 «Сивка-Бурка» и №14 «Святогор» ставит поток WINTER: BB2EV.sagaSet(13,{nm:function(){…},sk:'герой@облик'}) */
    SAGA.ev=1;}
  E.sagaSet=function(id,o){sagaTable();if(typeof SAGA!=='undefined'&&SAGA.ev&&o&&typeof o.nm==='function'&&o.sk&&id>=0&&id<60)SAGA[id]=o;};
  function sagaVis(){return on('saga2')&&!!sl()&&can('slVis');}
  function sagaTail(){if(!sagaVis())return 0;var q=slSaga(),sg=ev().saga,st=N('saga.tailStep',50),n=0;if(sg.id!==q.id){sg.id=q.id;sg.t=0;}
    var have=Math.floor(Math.max(0,q.p-SAGA_N*SAGA_P)/st);
    while(sg.t<have&&n<20){sg.t++;n++;gv(sg.t%3===0?{it:'rr',n:1}:{tr:N('saga.tailTro',3),i:sg.t},'saga');}
    if(n){mst('saga2','tail',{n:sg.t});RES.saga='📜 '+L('Сказ допет до конца — малый сундук сказителя','The Tale is told to the end — a teller’s small chest')+(n>1?' ×'+n:'');}return n;}
  function sagaLine(){var q=slSaga(),nm=SAGA[q.id%SAGA.length].nm(),st=sagaStep(q.p),tail=st>=SAGA_N;
    return {t:nm,s:tail?L('хвост: до сундука ','tail: to the next chest ')+(N('saga.tailStep',50)-Math.max(0,q.p-SAGA_N*SAGA_P)%N('saga.tailStep',50)):st+L(' из ',' of ')+SAGA_N,d:slSagaLeft(),q:tail?1:(q.p%SAGA_P)/SAGA_P,hot:sagaReady(q)};}

  /* ================= ЛЕСЕНКА КОЩЕЕВОЙ НЕДЕЛИ: 2 500 (облик — как было) → 10 000 → 25 000 → 60 000 ================= */
  var HW='hw26';
  function hwK(){return (S.festK&&S.festK[HW])|0;}
  function hwRungs(){var K=N('kosh',[2500,10000,25000,60000]);return [[K[1],slE()?{it:[['rr',N('koshRw.rr',2)/*ECO?*/],['ban',N('koshRw.ban',1)/*ECO?*/]]}:{g:E.gold('s')}],[K[2],slE()?{tr:N('koshRw.tro',20)/*ECO?*/}:{g:E.gold('m')}],[K[3],{skAll:'koshz'}]];}
  function hwOn(){return on('fest2')&&typeof FEST!=='undefined'&&(FEST.on(HW)||hwK()>=N('kosh',[2500])[0]&&(ev().fest.hw|0)<3&&hwK()>=hwRungs()[ev().fest.hw|0][0]);}
  function hwCheck(){if(!hwOn())return;var f=ev().fest,R=hwRungs(),k=hwK(),n=0;f.hw=f.hw|0;
    while(f.hw<3&&k>=R[f.hw][0]){var r=R[f.hw][1];f.hw++;n++;
      if(r.skAll){for(var i=0;i<SKINS.length;i++)if(SKINS[i].id===r.skAll)S.skins[SKINS[i].hero+'@'+r.skAll]=1;RES.fest='🌙 '+L('Кощеева неделя: облик «Кощеев золотой» — твой, для всех богатырей!','Spooky week: the “Gilded Deathless” outfit is yours, for every hero!');}
      else{calGive(r);RES.fest='🌙 '+L('Кощеева неделя, ступень '+(f.hw+1)+': ','Spooky week, step '+(f.hw+1)+': ')+'<b>'+calTxt(r)+'</b>';}
      mst('fest2','rung',{n:f.hw});}
    return n;}
  function hwHTML(){var R=hwRungs(),k=hwK(),f=ev().fest.hw|0,h='',i;for(i=0;i<3;i++){var r=R[i],got=f>i;
      h+='<div class="evl'+(got?'':k>=2500&&i===f?' hot':'')+'" style="cursor:default"><div class="g"><b>'+fn(r[0])+'</b> — '+(r[1].skAll?L('облик «Кощеев золотой» всем богатырям','the “Gilded Deathless” outfit for every hero'):calTxt(r[1]))+(got?'':bar(k/r[0]))+'</div><span class="r">'+(got?'✓':fn(Math.min(k,r[0]))+' / '+fn(r[0]))+'</span></div>';}
    return '<p class="sub" style="margin:8px 0 0">'+L('Лесенка праздника — облик это только первая ступень:','The holiday ladder — the outfit is just the first step:')+'</p>'+h;}

  /* ================= «ГОСТЬ НЕДЕЛИ» и календарь на 16 недель (с 26.10.2026) ================= */
  var GOST={liho:function(){return L('Лихо одноглазое','One-Eyed Likho');},sluga:function(){return L('Кощеев слуга','Koschei’s Servant');},sneg:function(){return L('Снеговик-хулиган','Rowdy Snowman');},kar:function(){return L('Карачун','Karachun');}};
  /* [понедельник недели, гость, событие] — праздники включаются своими датами (FEST), тут — что показать в «Что впереди» */
  var WK=[['2026-10-26','sluga',function(){return L('Кощеева неделя: лесенка до 60 000 нечисти','Spooky week: the ladder up to 60,000 monsters');}],
    ['2026-11-02','liho',function(){return L('04.11 — награда дня ×2; 05.11 — новый Сказ','Nov 4 — daily reward ×2; Nov 5 — a new Tale');}],
    ['2026-11-09','liho',function(){return L('Подвиги, Сход богатырей и Месяцеслов','Deeds, the Heroes’ Muster and the Calendar');}],
    ['2026-11-16','liho',function(){return L('Первый итог Схода — в понедельник','First Muster results — on Monday');}],
    ['2026-11-23','liho',function(){return L('Сход на выходных: Слава в счёт недели','Weekend Muster: Fame counts for the week');}],
    ['2026-11-30','liho',function(){return L('03.12 — «Сказ о Морозко»','Dec 3 — the Tale of Morozko');}],
    ['2026-12-07','liho',function(){return L('Морозко идёт; скоро Карачун','Morozko goes on; Karachun is near');}],
    ['2026-12-14','sneg',function(){return L('15.12 — «Карачун»: снег, подарки за походы, ёлка в деревне','Dec 15 — Karachun: snow, gifts for runs, a tree in the village');}],
    ['2026-12-21','sneg',function(){return L('25.12 — Каникулы: Поход дня с наградой ×2','Dec 25 — Holidays: Daily Run with ×2 reward');}],
    ['2026-12-28','kar',function(){return L('Карачунова неделя; 31.12 — большой подарок и новый Сказ','Karachun’s week; Dec 31 — the big gift and a new Tale');}],
    ['2027-01-04','sneg',function(){return L('Каникулы до 10.01 — догоняй подарки','Holidays until Jan 10 — catch up on gifts');}],
    ['2027-01-11','sneg',function(){return L('13–14.01 — Старый Новый год, ёлка уходит','Jan 13–14 — Old New Year, the tree goes');}],
    ['2027-01-18','liho',function(){return L('Сход на выходных','Weekend Muster');}],
    ['2027-01-25','liho',function(){return L('28.01 — «Сказ о Святогоре»','Jan 28 — the Tale of Svyatogor');}],
    ['2027-02-01','liho',function(){return L('Двойные куплеты у Бояна','Double verses from Boyan');}],
    ['2027-02-08','liho',function(){return L('Подготовка ко Дню богатырей','Getting ready for Heroes’ Day');}],
    ['2027-02-15','liho',function(){return L('21–23.02 — День богатырей','Feb 21–23 — Heroes’ Day');}]];
  function wkRow(w){for(var i=0;i<WK.length;i++)if(weekNo(dms(WK[i][0]))===w)return WK[i];return null;}
  E.week=function(w){w=w||weekNo();var r=wkRow(w),rule=WEEKLY[(w*3)%WEEKLY.length];return {w:w,gost:r?r[1]:'liho',gostName:GOST[r?r[1]:'liho'](),note:r?r[2]():'',rule:rule};};
  E.gost=function(){return on('gost')?E.week().gost:'';};
  E.aheadOpen=function(){if(inRun())return;var w=weekNo(),h='',i,x,d=new Date(dayMs()),mon=new Date(d.getFullYear(),d.getMonth(),d.getDate()-(d.getDay()+6)%7);
    for(i=0;i<4;i++){x=E.week(w+i);var a=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+i*7),b=new Date(a.getFullYear(),a.getMonth(),a.getDate()+6),f=function(q){return String(q.getDate()).padStart(2,'0')+'.'+String(q.getMonth()+1).padStart(2,'0');};
      h+='<div class="card" style="font-size:13px;line-height:1.4;margin-bottom:6px"><b>'+(i?f(a)+'–'+f(b):L('Эта неделя','This week'))+'</b> · '+qt(x.rule.name)+(x.note?'<br>'+x.note:'')+(on('gost')?'<br>👁 '+L('Гость недели в походах: ','Guest of the week on runs: ')+x.gostName:'')+'</div>';}
    showModal('<h3>'+L('Что впереди','What’s Ahead')+'</h3><p class="sub">'+L('Каждую неделю — своё правило и свой гость. Ничего не сгорает: не успел — будет ещё.','Every week has its own rule and guest. Nothing expires: miss it — it comes around again.')+'</p>'+h+
      '<div class="btns"><button class="btn ghost" id="evAhBack">'+L('Назад','Back')+'</button></div>','evahead');document.getElementById('evAhBack').onclick=function(){SND.click();E.utro();};mst('utro','ahead');};
  /* гость в походе: один раз за поход главы, на 2-й минуте — вожак с именем гостя недели; одолел — трофеи раз в день и ключ шины 'gost' */
  var gT=0;
  BB2.hook('run',function(g){gT=0;if(!on('gost')||!g||g.first||g.endless||g.daily||g.weekly||(S.runs|0)<N('gost.fromRun',5)||g.short)return;gT=N('gost.t',115);});
  BB2.hook('frame',function(dt,g){if(!gT||!g||g.over||g.win||(g.t||0)<gT||g.boss&&!g.boss.dead)return;gT=0;
    try{var p=spawnPos(),en=g.ch.en,e=mkEnemy(en[Math.min(en.length-1,3)],p[0],p[1],{elite:1});e.evGost=1;var nm=E.week().gostName;say(e,L('Я — '+nm+'. В гости!','I’m '+nm+'. Just visiting!'));banner(L('Гость недели','Guest of the week'),nm,2);mst('gost','in',{k:E.week().gost});}catch(x){}});
  BB2.hook('kill',function(e){if(!e||!e.evGost)return;try{var m=ev().m,t=dnum(today());BB2.pdv('gost');mst('gost','kill',{k:E.week().gost});
    if((m.gd|0)!==t){m.gd=t;var gg=E.gold(N('guest.gold','s'));S.gold+=gg;ern('quest',gg);RES.gost='👁 '+L('Гость недели одолён: ','Guest of the week defeated: ')+'<b>+'+fn(gg)+goldW()+'</b>';}
    else RES.gost='👁 '+L('Гость недели одолён ещё раз — награда за него раз в день.','Guest of the week beaten again — the reward is once a day.');}catch(x){}});

  /* ================= конец похода: всё, что считается «за поход» ================= */
  BB2.hook('run',function(){RES={};});
  BB2.hook('end',function(g,win){try{if(!g||(g.t||0)<30||!(S.runs|0))return;
    calCredit();daryRun();
    if(on('saga2')&&sl()&&g.daily&&g.t>=60){var q=slSaga();if(q.ad!==today()){q.ad=today();q.an=Math.max(1,q.an|0);RES.ud='📜 '+L('За Поход дня «Удалая» дорожка Сказа открыта до конца дня.','For the Daily Run the Daring track of the Tale is open until the day ends.');mst('saga2','ud');}}
    if(shodOpen()){shRoll();RES.x0=X();}
    hwCheck();}catch(e){try{console.warn('bb2 ev end',e);}catch(x){}}});
  function resHTML(g,win){var a=[],i,d=E.runDone(),p=ev().p,ku=0,add=function(w,t){a.push({w:w,t:t});};
    if(RES.dary)add(100,RES.dary);if(RES.ku&&RES.ku.src==='dary')add(40,'<div class="evku">🎶 «'+RES.ku.t+'»</div>');
    if(on('pdv')&&E.on()){for(i=0;i<Math.min(2,d.length);i++)add(90-i*45,'📜 '+L('Подвиг выполнен: ','Deed done: ')+d[i].text+(d[i].rw?' · <b>'+d[i].rw+'</b>':'')+(d[i].vow?L(' · зарок ×2',' · vow ×2'):''));
      if(d.length>2)add(44,'📜 '+L('…и ещё подвигов: ','…and more deeds: ')+(d.length-2));
      for(i=0;i<d.length;i++)if(d[i].ku){add(85,'<div class="evku">🎶 '+L('Куплет № ','Verse No. ')+d[i].ku.n+': «'+d[i].ku.t+'»</div>');ku=1;break;}
      if(d.length&&!ku)add(42,'🎶 '+L('До куплета — подвигов: ','Deeds to the next verse: ')+E.toKu()+' · '+E.chainNow().nm());
      if(E.chestReady())add(70,'🎁 '+L('Три подвига за день — сундук дня ждёт во вкладке «Подвиги»: ','Three deeds today — the daily chest waits in the Deeds tab: ')+'<b>+'+fn(E.chestGold())+'</b>');}
    if(RES.cal)add(80,RES.cal);
    try{if(shodOpen()&&RES.x0!=null&&(g.t||0)>=30){var q=shNow(),gain=g.slX|0;add(60,'🏆 '+L('Сход: ','Muster: ')+(gain?'+'+gain+L(' Славы · ',' Fame · '):'')+L('ты '+q.me.pl+'-й из 8','you’re #'+q.me.pl+' of 8')+(q.up?L(', до соперника «'+q.up.nm+'» — ',', to pass '+q.up.nm+' — ')+fn(q.up.n-q.me.n+1):L(' — держи первое место!',' — hold first place!')));}}catch(e){}
    if(RES.fest)add(75,RES.fest);if(RES.gost)add(65,RES.gost);if(RES.ud)add(30,RES.ud);if(RES.saga)add(35,RES.saga);
    var ex=[];BB2.ev('evRes',ex,g,win);ex.forEach(function(t){add(50,t);});a.sort(function(x,y){return y.w-x.w;});
    var top=(window.innerHeight||640)>=700?3:2,w=function(l){return l.length?'<div class="evres">'+l.map(function(x){return '<div>'+x.t+'</div>';}).join('')+'</div>':'';};
    return [w(a.slice(0,top)),w(a.slice(top,top+6))];} /* главное — сразу под золотом (2 строки, на высоком экране 3), остальное — ниже, перед «Дальше/Завтра» */
  BB2.hook('modal',function(kind,m){try{
    if(kind==='result'&&typeof G!=='undefined'&&G){sagaTail();var h=resHTML(G,BB2.win),gr=m.querySelector('.goldrow'),gb=m.querySelector('.goalbox'),old,d;
      ['evRes','evRes2'].forEach(function(id){old=m.querySelector('#'+id);if(old)old.parentNode.removeChild(old);});
      if(h[0]){d=document.createElement('div');d.id='evRes';d.innerHTML=h[0];if(gr&&gr.parentNode)gr.parentNode.insertBefore(d,gr.nextSibling);else if(gb)gb.parentNode.insertBefore(d,gb);else BB2.put(m,'btns',h[0],'evRes');}
      if(h[1]){d=document.createElement('div');d.id='evRes2';d.innerHTML=h[1];if(gb)gb.parentNode.insertBefore(d,gb);else BB2.put(m,'btns',h[1],'evRes2');}}
    else if(!kind&&m.querySelector('#fsX')&&on('fest2')&&typeof FEST!=='undefined'&&FEST.on(HW)){hwCheck();BB2.put(m,'btns',hwHTML(),'evFest');}
  }catch(e){try{console.warn('bb2 ev modal',e);}catch(x){}}});

  /* ================= «ЗАВТРА»: одно обещание — самое сильное из доступных ================= */
  var _tl=window.tomorrowLine;
  function zavtra(){var a=[],st=calSt(),d=new Date(dayMs());
    if(daryOn()&&Dr().n<7){var g=DARY[Dr().n];a.push({w:90,t:L(g.who()+' уже готовит тебе дар — получишь после первого похода','A gift from '+g.who()+' is waiting — yours after the first run')});}
    if(on('cal')){var nx=st.done?st.next:st.day;if(st.done&&MILE[nx])a.push({w:80,t:L(nx+'-й день Месяцеслова — ','Calendar day '+nx+' — ')+calTxt(calRw(nx))});else if(st.done)a.push({w:20,t:L('день '+nx+' Месяцеслова: ','Calendar day '+nx+': ')+calTxt(calRw(nx))+L(' за любой поход',' for any run')});}
    try{if(shodOpen()&&d.getDay()===0){var q=shNow();a.push({w:70,t:L('итог Схода — ты '+q.me.pl+'-й','Muster results — you’re #'+q.me.pl)+(q.up?L(', до соперника «'+q.up.nm+'» '+fn(q.up.n-q.me.n+1)+' Славы',', '+fn(q.up.n-q.me.n+1)+' Fame behind '+q.up.nm):'')});}}catch(e){}
    if(on('pdv')&&E.on()&&E.toKu()===1)a.push({w:60,t:L('ещё один подвиг — и Боян допоёт куплет: ','one more deed — and Boyan finishes the verse: ')+E.chainNow().nm()});
    if(can('drOpen'))a.push({w:10,t:L('новый Поход дня — другой богатырь и другое правило','a new Daily Run — another hero and another rule')});
    BB2.ev('zavtra',a);a.sort(function(x,y){return y.w-x.w;});return a[0]||null;}
  if(has('tomorrowLine'))tomorrowLine=function(short){if(!on('zavtra'))return _tl.apply(this,arguments);var z=null;try{z=zavtra();}catch(e){}if(!z)return _tl.apply(this,arguments);mst('zavtra','see',{w:z.w});return z.t;};

  /* ================= вкладка «Подвиги» (вместо «Заданий дня») ================= */
  function pdvHTML(){var a=E.list(),p=ev().p,h='<h2>'+L('Подвиги','Deeds')+'</h2><p class="sub">'+L('Их записывает гусляр Боян. Всегда три: выполнил — тут же новый, и в бою тоже. Ничего не сгорает.','Boyan the bard writes them down. Always three: finish one — a new one appears, even mid-run. Nothing expires.')+'</p>',i,x;
    for(i=0;i<a.length;i++){x=a[i];var c=x.d.chain,go=x.a.t!=='c'&&x.d.go;
      h+='<div class="card"><div class="row">'+(c?'<img class="ic" src="'+icn(c.ic,96)+'" alt="">':'')+'<div class="t"><b>'+x.t+'</b><span>'+(c?c.nm()+' · '+(x.a.i+1)+L(' из 5',' of 5')+'<br>':'')+fn(x.v)+' / '+fn(x.n)+L(' · награда ',' · reward ')+E.rwPreview(x.a)+'</span>'+bar(x.q)+'</div>'+
        (go?'<button class="btn" data-evgo="'+i+'">'+L('Идти','Go')+'</button>':'')+(x.a.s!==3&&E.swapOk()?'<button class="btn ghost" data-evsw="'+i+'" title="'+L('Заменить','Swap')+'" style="flex:none;padding:8px 10px">↻</button>':'')+'</div></div>';}
    if(E.swapOk())h+='<p class="sub" style="margin:-2px 0 8px;font-size:12.5px">↻ '+L('Не по душе? Один подвиг в день Боян заменит даром — «струна порвалась».','Not to your taste? Boyan swaps one deed a day for free — “a string snapped”.')+'</p>';
    var need=N('pdv.chest',3),got=E.chestGot(),rd=E.chestReady();
    h+='<div class="card treasury"><div class="row"><img class="ic" src="'+ic('chest',96)+'"><div class="t"><b>'+L('Сундук дня: ','Daily chest: ')+fn(E.chestGold())+goldW()+'</b><span>'+L('За любые '+need+' подвига за день. Сегодня: ','For any '+need+' deeds in a day. Today: ')+Math.min(p.dn,need)+' / '+need+'</span>'+bar(p.dn/need)+'</div>'+
      (got?'<span class="tag ok">'+L('Получено','Collected')+'</span>':rd?'<button class="btn gold" id="evChest">'+L('Открыть','Open')+'</button>':'<span class="tag">🔒</span>')+'</div></div>';
    h+='<div class="card"><div class="row"><div class="t"><b>🎶 '+L('Былина о тебе: куплетов — ','The Ballad of You: verses — ')+p.cn+'</b><span>'+L('Сейчас поётся: ','Now singing: ')+E.chainNow().nm()+L(' · до куплета подвигов: ',' · deeds to the verse: ')+E.toKu()+'</span></div>'+(p.ku.length?'<button class="btn ghost" id="evKuAll">'+L('Читать','Read')+'</button>':'')+'</div></div>';
    return h;}
  function pdvPatch(){var el=$('tabQuests');if(!el||!on('pdv')||!E.on()||typeof qSeg==='undefined'||qSeg!=='q')return;var hs=el.querySelectorAll('h2');if(!hs.length)return;
    var first=hs[0],stop=hs[1]||null,n=first,nx;while(n&&n!==stop){nx=n.nextSibling;el.removeChild(n);n=nx;}
    var d=document.createElement('div');d.id='evPdvTab';d.innerHTML=pdvHTML();el.insertBefore(d,stop);var sg=$('sgQ');if(sg)sg.textContent=L('Подвиги','Deeds');
    var list=E.list();
    [].forEach.call(d.querySelectorAll('[data-evgo]'),function(b){b.onclick=function(){SND.click();var x=list[+b.getAttribute('data-evgo')];try{x.d.go();}catch(e){}};});
    [].forEach.call(d.querySelectorAll('[data-evsw]'),function(b){b.onclick=function(){SND.click();if(E.swap(+b.getAttribute('data-evsw'))){toast(L('Боян порвал струну — держи другой подвиг','Boyan snapped a string — here’s another deed'));renderQuests();}};});
    var c=document.getElementById('evChest');if(c)c.onclick=function(){var g=E.chestTake();if(g){toast(L('Сундук дня: +','Daily chest: +')+fn(g)+L(' золота!',' gold!'));setGold();renderQuests();questBadge();}};
    var k=document.getElementById('evKuAll');if(k)k.onclick=function(){SND.click();var p=ev().p,h='',i;for(i=0;i<p.ku.length;i++)h+='<div class="evku">'+(i+1)+'. «'+E.kuText(p.ku[i])+'»</div>';
      showModal('<h3>'+L('Былина о тебе','The Ballad of You')+'</h3><p class="sub">'+L('Куплет — за каждую связку из пяти подвигов.','A verse for every chain of five deeds.')+'</p>'+h+'<div class="btns"><button class="btn ghost" id="evKuX">'+L('Закрыть','Close')+'</button></div>','evku');document.getElementById('evKuX').onclick=function(){SND.click();hideModal();};};}
  var _rq=window.renderQuests,_qb=window.questBadge;
  if(has('renderQuests'))renderQuests=function(){var r=_rq.apply(this,arguments);try{pdvPatch();}catch(e){try{console.warn('bb2 ev quests',e);}catch(x){}}return r;};
  if(has('questBadge'))questBadge=function(){var r=_qb.apply(this,arguments);try{if(on('pdv')&&E.on()){var b=$('navQ');if(b)b.classList.toggle('dot',E.chestReady());}}catch(e){}return r;};

  /* ================= «В поход»: полоска подвига, Сказа и даров под «Делами на сегодня»; значки — в один ряд ================= */
  function line(icon,t,s,q,r,id,hot){return '<div class="evl'+(hot?' hot':'')+'" id="'+id+'">'+(icon?'<img src="'+icon+'" alt="">':'')+'<div class="g"><b>'+t+'</b>'+(s?'<small>'+s+'</small>':'')+(q==null?'':bar(q))+'</div>'+(r?'<span class="r">'+r+'</span>':'')+'</div>';}
  function mapPatch(el){if(!el||!(S.runs|0))return;var tb=el.querySelector('#todayBtn');if(!tb)return;var old=el.querySelector('#evMap');if(old)old.parentNode.removeChild(old);var h='',p=ev().p;
    document.body.classList.toggle('ev-pdv',on('pdv')&&E.on());
    if(on('pdv')&&E.on()){var a=E.list(),b=a[0],i;for(i=1;i<a.length;i++)if(a[i].q>b.q)b=a[i];
      h+=line(icn('i_sword',60),'📜 '+b.t,L('Подвиги · сегодня ','Deeds · today ')+Math.min(p.dn,3)+'/3'+(E.chestReady()?L(' · сундук дня ждёт!',' · the daily chest is waiting!'):''),b.q,fn(b.v)+' / '+fn(b.n),'evMapP',E.chestReady());}
    if(sagaVis()){var s=sagaLine();h+=line(icn('sl_fame',60),'📜 '+s.t,null,s.q,s.s+' · '+s.d+L(' дн.',' d'),'evMapS',s.hot);}
    if(daryOn()){var d=Dr(),g=daryNext();h+=line(icn('hp_'+g.h,60),'🎁 '+L('Дары дружины: '+d.n+' из 7','Squad gifts: '+d.n+' of 7'),d.last===today()?L('Сегодняшний дар получен. Завтра — '+g.who(),'Today’s gift collected. Tomorrow — '+g.who()):L(g.who()+' ждёт: дар после любого похода',g.who()+' is waiting: a gift after any run'),null,'','evMapD',d.last!==today());}
    hwCheck();
    if(shodOpen()){shRoll();var q=shNow();h+=line(icn('e_perun',60),'🏆 '+L('Сход богатырей: ты '+q.me.pl+'-й из 8','Heroes’ Muster: you’re #'+q.me.pl+' of 8'),null,null,q.up?L('до ','to pass: ')+fn(q.up.n-q.me.n+1):'','evMapH',!ev().shod.seen&&ev().shod.lw>0);}
    if(!h)return;var dv=document.createElement('div');dv.id='evMap';dv.innerHTML=h;tb.parentNode.insertBefore(dv,tb.nextSibling);
    var f=function(id,fnc){var x=dv.querySelector('#'+id);if(x)x.onclick=function(){SND.click();fnc();};};
    f('evMapP',function(){qSeg='q';openTab('Quests');});f('evMapS',function(){openSlava('saga');});f('evMapD',function(){toast(L('Сходи в любой поход — дар дадут в итогах','Go on any run — the gift comes with the results'));});f('evMapH',E.shodOpen);}
  BB2.hook('map',function(el){try{mapPatch(el);}catch(e){try{console.warn('bb2 ev map',e);}catch(x){}}});
  BB2.hook('chips',function(a){try{if(!Array.isArray(a))return;var i,st;
    if(on('cal')&&(S.runs|0)){st=calSt();for(i=0;i<a.length;i++)if(a[i].indexOf('📅')>=0){a[i]='<i class="'+(st.done?'':'hot')+'">📅 '+L('день ','day ')+(st.done?st.day:st.day)+L(' из 28',' of 28')+(st.done?' ✓':'')+'</i>';break;}}
    if(on('pdv')&&E.on()){var p=ev().p;for(i=0;i<a.length;i++)if(a[i].indexOf('🎁')>=0){a[i]='<i class="'+(E.chestReady()?'hot':'')+'">🎁 '+(E.chestGot()?L('сундук дня взят','daily chest taken'):L('сундук дня ','daily chest ')+Math.min(p.dn,3)+'/3')+'</i>';break;}
      for(i=0;i<a.length;i++)if(a[i].indexOf('🔥')>=0&&on('cal')){a.splice(i,1);break;}}
    if(on('cal')&&(S.runs|0)){st=calSt();var n=st.done?st.n:st.n-1;if(n>1)a.splice(Math.min(2,a.length),0,'<i>🔥 '+L('серия ','streak ')+n+L(' дн.',' d')+'</i>');}}catch(e){}});

  /* ================= «УТРО БОГАТЫРЯ»: одно окно в один экран на 360×640 ================= */
  var utroShown=0,_ot=window.openToday;
  function tiles(){var a=[];
    try{if(can('drOpen')){var m=drMine(),d=dailyDef();a.push({k:'dr',w:60,ic:'hp_'+d.hero,t:L('Поход дня','Daily Run'),s:m.got?(m.best?L('очки: ','score: ')+fn(m.best):L('сделано ✓','done ✓')):HERO_BY[d.hero].name.split(' ')[0],hot:!m.got,fn:function(){openDaily();}});}}catch(e){}
    try{if(can('endOpen')){var w=wkMine();a.push({k:'wk',w:50,ic:'e_perun',t:L('Испытание недели','Weekly Trial'),s:w.got?L('сделано ✓','done ✓'):weekly().name,hot:!w.got,fn:function(){hideModal();startRun(0,true,true);}});}}catch(e){}
    try{if(sagaVis()||sl()&&can('slVis')){var s=sagaLine();a.push({k:'saga',w:40,ic:'sl_fame',t:L('Сказ месяца','Tale of the Month'),s:s.s+' · '+s.d+L(' дн.',' d'),hot:s.hot,fn:function(){hideModal();openSlava('saga');}});}}catch(e){}
    try{if(shodOpen()){var q=shNow();a.push({k:'shod',w:35,ic:'e_perun',t:L('Сход','Muster'),s:L('ты '+q.me.pl+'-й из 8','you’re #'+q.me.pl+' of 8'),fn:E.shodOpen});}}catch(e){}
    try{if(can('zabOpen')&&has('zabScreen'))a.push({k:'zab',w:20,ic:'chest',t:L('Забавы','Fun & Games'),s:L('мини-игры','mini-games'),fn:function(){hideModal();window.ZAB_SRC='day';zabScreen();}});}catch(e){}
    BB2.ev('utroTile',a);a.sort(function(x,y){return (y.w||0)-(x.w||0);});return a.slice(0,3);}
  function rows(){var a=[],sh=ev().shod,p=ev().p;
    try{if(shodOpen()&&sh.lw>0&&!sh.seen)a.push({w:95,ic:'e_perun',t:L('Итог Схода: ты '+sh.lp+'-й из 8','Muster results: you placed #'+sh.lp+' of 8'),s:(sh.lp>1&&sh.up?L('До соперника «'+sh.up+'» не хватило '+fn((sh.gap|0)+1)+'. ',fn((sh.gap|0)+1)+' short of '+sh.up+'. '):'')+(calTxt(shRw(sh.lp))?L('Награда: ','Reward: ')+calTxt(shRw(sh.lp)):L('Награды — первым трём','Rewards go to the top three')),hot:1,fn:E.shodOpen});}catch(e){}
    if(daryOn()&&Dr().last!==today()){var g=daryNext();a.push({w:90,ic:'hp_'+g.h,t:L('Дар дружины: '+g.who(),'Squad gift: '+g.who()),s:L('Ждёт после любого похода · '+Dr().n+' из 7','Waiting after any run · '+Dr().n+' of 7'),hot:1,fn:function(){hideModal();openTab('Map');}});}
    if(on('pdv')&&E.on()){var l=E.list(),b=l[0],i;for(i=1;i<l.length;i++)if(l[i].q>b.q)b=l[i];
      if(E.chestReady())a.push({w:85,ic:'chest',t:L('Сундук дня ждёт','The daily chest is waiting'),s:'+'+fn(E.chestGold())+goldW(),hot:1,fn:function(){hideModal();qSeg='q';openTab('Quests');}});
      a.push({w:70,ic:'i_sword',t:L('Подвиг: ','Deed: ')+b.t,s:fn(b.v)+' / '+fn(b.n)+' · '+(E.toKu()===1?L('до куплета — 1','1 to the verse'):L('сегодня '+Math.min(p.dn,3)+'/3','today '+Math.min(p.dn,3)+'/3')),fn:function(){hideModal();qSeg='q';openTab('Quests');}});}
    BB2.ev('utroRow',a);a.sort(function(x,y){return (y.w||0)-(x.w||0);});return a.slice(0,2);}
  E.utro=function(auto){if(inRun()||!(S.runs|0))return false;if(auto&&(utroShown||$('modal').classList.contains('on')))return false;
    shRoll();hwCheck();sagaTail();
    var st=calSt(),cal=on('cal'),ls=cal?null:_ls(),dayN=cal?(st.done?st.day:st.day):ls.n,afk=S.village&&S.village.mill?afkGold():0,T=tiles(),RW=rows(),TL=[],more=0,i;
    try{TL=todayList();more=TL.filter(function(x){return x.ready&&['login','quests','afk','dr','wk','slava'].indexOf(x.k)<0;}).length;}catch(e){}
    if(auto&&utroShown)return false;utroShown=1;STAT.screen('utro');
    var top=cal?wkRibbon()+'<p class="sub" style="font-size:13px">'+(st.done?L('✓ День '+st.day+' засчитан. Завтра: ','✓ Day '+st.day+' counted. Tomorrow: ')+'<b>'+calTxt(calRw(st.next))+'</b>':L('Сегодня: ','Today: ')+'<b>'+calTxt(calRw(st.day))+'</b>'+L(' — сходи в любой поход',' — go on any run')+(st.lost?L(' · серия началась заново',' · the streak starts over'):''))+'</p>'
      :'<p class="sub" style="font-size:13px">'+(ls.ready?L('Награда за вход, день '+ls.n+': ','Login reward, day '+ls.n+': ')+'<b>'+rewardText(loginReward(ls.n))+'</b>':L('Награда за вход получена ✓','Login reward collected ✓'))+'</p>';
    var allTxt=[],can1=!cal&&ls.ready,can2=afk>=30;if(can1)allTxt.push(L('вход','login'));if(can2)allTxt.push(L('казна +','treasury +')+fn(afk));
    var h='<div class="evu"><h3>'+L('Утро, богатырь! День ','Morning, hero! Day ')+dayN+'</h3>'+top+
      (allTxt.length?'<div class="evall"><button class="btn gold" id="evAll">'+L('Забрать всё: ','Collect all: ')+allTxt.join(' · ')+'</button></div>':'')+
      (T.length?'<div class="evt">'+T.map(function(x,i){return '<button data-evt="'+i+'"'+(x.hot?' style="box-shadow:0 0 0 1.5px rgba(255,201,74,.7) inset"':'')+'><img src="'+icn(x.ic,72)+'" alt=""><b>'+x.t+'</b><small>'+x.s+'</small></button>';}).join('')+'</div>':'')+
      RW.map(function(x,i){return line(x.ic?icn(x.ic,60):'',x.t,x.s,null,'›','evRow'+i,x.hot);}).join('')+
      '<div class="btns"><button class="btn big" id="evGo">'+L('В бой!','To battle!')+'</button></div>'+
      '<a class="more" id="evMore">'+(more?L('Ещё дела: '+more+' · ','More to do: '+more+' · '):'')+L('все дела · что впереди','all tasks · what’s ahead')+'</a></div>';
    showModal(h,'evutro');mst('utro','open',{d:dayN});
    var q=function(id,f){var x=document.getElementById(id);if(x)x.onclick=function(){SND.click();f();};};
    q('evGo',function(){hideModal();openTab('Map');});
    q('evAll',function(){mst('utro','all');if(can1){hideModal();_ol();return;}if(can2)takeAfk(1,function(){E.utro();if(typeof curTab!=='undefined'&&curTab==='Village')renderVillage();});});
    q('evWk',E.calOpen);
    q('evMore',function(){showModal('<h3>'+L('Ещё','More')+'</h3><div class="btns"><button class="btn" id="evM1">'+L('Все дела на сегодня','All of today’s tasks')+'</button><button class="btn" id="evM2">'+L('Что впереди: недели и праздники','What’s ahead: weeks and holidays')+'</button>'+(cal?'<button class="btn" id="evM3">'+L('Месяцеслов','The Calendar')+'</button>':'')+'<button class="btn ghost" id="evM0">'+L('Назад','Back')+'</button></div>','evmore');
      q('evM1',function(){_ot();});q('evM2',E.aheadOpen);q('evM3',E.calOpen);q('evM0',function(){E.utro();});});
    [].forEach.call(document.querySelectorAll('[data-evt]'),function(b){b.onclick=function(){SND.click();var x=T[+b.getAttribute('data-evt')];mst('utro','tile',{k:x.k||''});try{x.fn();}catch(e){}};});
    RW.forEach(function(x,i){q('evRow'+i,function(){mst('utro','row');try{(x.fn||function(){})();}catch(e){}});});
    return true;};
  E.utroAuto=function(){try{if(!on('utro')||!(S.runs|0))return false;return E.utro(true);}catch(e){try{console.warn('bb2 ev utro',e);}catch(x){}return false;}};
  if(has('openToday'))openToday=function(auto){if(auto===true||!on('utro')||!(S.runs|0)||inRun())return _ot.apply(this,arguments); /* кнопки «Назад» старых окон зовут openToday(событие) — это не автооткрытие */try{if(E.utro())return;}catch(e){try{console.warn('bb2 ev utro',e);}catch(x){}}return _ot.apply(this,arguments);};

  /* ================= запуск ================= */
  function boot(){try{sagaTable();gvFlush();if(!(S.runs|0))return;if(on('pdv')&&E.on())E.ensure();E.flush();shRoll();hwCheck();
    if(!inRun()&&typeof curTab!=='undefined'&&(curTab==='Map'||curTab==='Quests')&&!$('modal').classList.contains('on'))openTab(curTab);}catch(e){try{console.warn('bb2 ev boot',e);}catch(x){}}}
  BB2.hook('menu',function(){try{gvFlush();if(on('pdv')&&E.on())E.ensure();shRoll();hwCheck();}catch(e){}});
  BB2.hook('cloud',function(){try{sagaTable();if(on('pdv')&&E.on())E.ensure();}catch(e){}});
  BB2.hook('lazy',function(n,ok){if(!ok||n==='ev')return;try{sagaTable();gvFlush();if(!inRun()&&typeof curTab!=='undefined'&&curTab==='Map'&&!$('modal').classList.contains('on'))openTab('Map');}catch(e){}}); /* приехала мета — выдать отложенное, показать полоску Сказа */
  E.ui=1;boot();
})(BB2EV);
