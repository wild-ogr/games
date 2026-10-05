/* ================= «Из ларька в магнаты: бизнес» — клей между моделью и интерфейсом (GAME, FMT, NM) =================
   Время: онлайн 1 игровой день = 10 с (месяц = 5 мин; в главах gig/small — 20/15 с, «Спокойный день»); идёт, когда нет паузы/окна/скрытой вкладки и GAME.hold пуст.
   Офлайн: автопилот 1 месяц за 1 час отсутствия (день — 2 мин), не больше смены: 6 ч (6 мес.); «Управляющий» удлиняет смену до 8 ч, темп тот же. Время — nowMs() (сервер SDK),
   защита от перевода часов назад — S.maxT. 💎 — за достижения, годы, рекламу, IPO; тратятся на ускорения.
   Рейтинг недели: рост стоимости компании (собственный капитал) с начала ISO-недели, IPO не обнуляет (carry). */
(function(){
'use strict';
const E=ECON;
const MON_RU=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  MON_EN=['January','February','March','April','May','June','July','August','September','October','November','December'],
  MS_RU=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],MS_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const en=()=>typeof LANG!=='undefined'&&LANG==='en';
function num(n,d){const s=Math.abs(n).toFixed(d||0).split('.');const sep=en()?',':' ';s[0]=s[0].replace(/\B(?=(\d{3})+(?!\d))/g,sep);return (n<0?'−':'')+s[0]+(s[1]?(en()?'.':',')+s[1]:'');}
const FMT={num,
  money(x){x=Math.round(x||0);let a=Math.abs(x);const s=x<0?'−':'';if(a>=999.5e6&&a<1e9)a=1e9;else if(a>=999.5e3&&a<1e6)a=1e6;
    if(a>=1e9)return s+num(a/1e9,a>=1e11?0:a>=1e10?1:2)+(en()?' bn ₽':' млрд ₽');
    if(a>=1e6)return s+num(a/1e6,a>=1e8?0:1)+(en()?' m ₽':' млн ₽');
    if(a>=1e3)return s+num(a/1e3,0)+(en()?' k ₽':' тыс. ₽');return s+a+' ₽';},
  // таблицы и графики (M16): единица — по самому большому числу таблицы/графика, подпись берётся из той же единицы:
  // до 100 тыс. — рубли, до 100 млн — тыс. ₽, до 100 млрд — млн ₽, дальше — млрд ₽ (в выбранной единице числа не длиннее «99 999»)
  unit(mx){mx=Math.abs(mx||0);return mx<1e5?1:mx<1e8?1e3:mx<1e11?1e6:1e9;},
  unitOf(a){let m=0;for(const x of a||[])if(x!=null&&isFinite(x))m=Math.max(m,Math.abs(x));return FMT.unit(m);},
  uName(u){return u===1?'₽':u===1e3?(en()?'k ₽':'тыс. ₽'):u===1e6?(en()?'m ₽':'млн ₽'):(en()?'bn ₽':'млрд ₽');},
  // число в единице u; ненулевая сумма никогда не превращается в «0,0»: 2 знака, а если и так ноль — «<0,01»
  inU(x,u){x=Math.round(x||0);u=u||1;if(!x)return '0';if(u===1)return num(x,0);const v=x/u,a=Math.abs(v);let d=a>=99.95?0:1;
    if(x&&+a.toFixed(d)===0)d=2;if(x&&+a.toFixed(d)===0)return (x<0?'−':'')+'<'+num(.01,2);return num(v,d);},
  mln(x){return num((x||0)/1e6,Math.abs(x)>=1e8?0:1);},   // устарело: в интерфейсе — FMT.money или FMT.inU/uName
  qty(q,g){const u=NM.unit(g),a=Math.abs(q||0);
    if(a>=1e6)return num(q/1e6,2)+(en()?' m ':' млн ')+u;if(a>=1e3)return num(q/1e3,a>=1e4?0:1)+(en()?'k ':' тыс. ')+u;return num(q,0)+' '+u;},
  pct(x,d){return num((x||0)*100,d||0)+(en()?'%':' %');},
  date(m){return (en()?MON_EN:MON_RU)[m%12]+' '+(2027+Math.floor(m/12));},
  mon(m){return (en()?MS_EN:MS_RU)[m%12]+' '+String(2027+Math.floor(m/12)).slice(2);},
  price(r,g){return num(E.price(GAME.W,r,g),0)+' ₽/'+NM.unit(g);}};
// товары вне ECON.GOODS (щебень и песок карьеров «от ларька») — запасные названия, чтобы советник не падал (TypeError в окне закрытия месяца)
const GX={grav:['Щебень','Gravel','т','t'],sand:['Песок','Sand','т','t']},gx=(g,i)=>{const x=GX[g];return x?x[en()?i+1:i]:String(g||'');};
const NM={good:g=>E.GOODS[g]?(en()?E.GOODS[g].en:E.GOODS[g].n):gx(g,0),unit:g=>E.GOODS[g]?(en()?E.GOODS[g].ue:E.GOODS[g].u):gx(g,2),obj:t=>en()?E.OBJ[t].en:E.OBJ[t].n,
  reg:r=>en()?E.REGS[r].en:E.REGS[r].n,city:r=>en()?E.REGS[r].ce:E.REGS[r].city,
  bot:id=>{const b=E.BOTS.find(x=>x.id===id);return b?(en()?b.en:b.n):'';},who:id=>{const b=E.BOTS.find(x=>x.id===id);return b?(en()?b.whoe:b.who):'';}};

// «Спокойный день» (решение владельца 28.09): в ранних главах время идёт медленнее — день главы 1 «Карьера» 20 с (месяц 10 мин — первый отчёт и урок Людмилы к 10-й минуте), главы 2 «Своё дело» 15 с; дальше 10 с. Ускорить — кнопкой ×2
const DAY_MS0=10000,DAY_ST={gig:20000,small:15000},OFF_DAY_MS=120000,SHIFT=6*3600e3,SHIFT_MGR=8*3600e3;
const CR={speed:10,expl:4,urgent:6},AD_CR=3,AD_CR_MAX=5;
// награды за рекламу (M31, 02.10, «сами рубим доход»): дневных лимитов мест нет — пауза между роликами одного места в РЕАЛЬНЫХ минутах (по nowMs())
// + игровые ограничения действием в модели (js/biz.js, econ.js: раз в игровой месяц/неделю, раз на точку/заказ/объект/контракт, «пока стройка идёт»).
// Места: ×2 за заказ, реклама точки, проверка сделки, второе дыхание, ускорить открытие точки/карьера, срочный заказ, ревизия, ускорить стройку (недра),
// экспресс-поезд, отсрочка по контракту, rw — ×2 в окне награды (M8), bst — +10 % к цене продаж. Цифры — tools/sim-rags.js (net_ad, net4_ad, net4_all), tools/sim.js (smart_ad, smart_bst)
const GIFT=2;
const AD_GAP={x2:8,promo:15,chk:5,breath:8,open:10,urg:10,audit:5,build:2,exp:5,con:3,rw:3,bst:120};   // минуты; bst 120 — как прежний «1 в реальный день» в sim.js (буст уже был на пределе +5 %)
// 💎 за первые шаги (один раз на игрока)
// 💎 за главы «из грязи в князи» — ECON.BIZ_ACH (js/biz.js)
const ACH={expl:3,lic:3,b_coalpit:3,b_orepit:3,b_limepit:3,b_logging:3,b_sawmill:5,b_furnace:8,b_steel:8,b_rolling:10,b_store:2,profit:3,year:5};
if(E.BIZ_ACH)Object.assign(ACH,E.BIZ_ACH);
// новый игрок начинает с подработки (глава «Карьера»), если модель малого бизнеса подключена; иначе — сразу недра с обучением
function newPlayer(){const pk=S.pk&&typeof S.pk==='object'?S.pk:{};return E.bizInit?E.newWorld({rags:true,pk}):E.newWorld({tut:true,pk});}
let W=null,acc=0,lastRT=0,timer=0,offDone=false,saveT=0;const subs={};
function emit(n,...a){for(const f of subs[n]||[]){try{f(...a);}catch(e){console.error(e);}}}
function valid(w){return !!w&&typeof w==='object'&&w.v===1&&w.inv&&Array.isArray(w.obj)&&w.mon&&w.plots;}
function todayKey(){const d=new Date(nowMs());return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function isoWeek(ms){const d=new Date(ms);const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const dn=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-dn);
  const y=t.getUTCFullYear(),w=Math.ceil(((t-Date.UTC(y,0,1))/864e5+1)/7);return y+'-W'+(w<10?'0':'')+w;}
function value(){return W?E.equity(W):0;}
function weekUpd(){const k=isoWeek(nowMs());if(!S.wk||typeof S.wk!=='object'||S.wk.k!==k){if(S.wk&&typeof S.wk==='object'&&S.wk.k&&W&&GAME.wkClose)GAME.wkClose(S.wk);const v=value();S.wk={k,base:v,carry:0,b0:v};}else if(typeof S.wk.b0!=='number')S.wk.b0=S.wk.base;}
function checkAch(){if(!W)return;if(!S.crE||typeof S.crE!=='object')S.crE={};
  for(const k in ACH){let got=!!W.ach[k];if(k==='profit')got=W.hist.some(h=>h.np>0);if(k==='year')got=W.m>=12;
    if(got&&!S.crE[k]){S.crE[k]=1;S.cr=(S.cr||0)+ACH[k];emit('cr',ACH[k],k);}}
  checkMiles();if(GAME.wallSync){GAME.wallSync();GAME.colSync();GAME.rankSync();}}
function persist(force){S.w=W;const n=Date.now();if(force||n-saveT>4000){saveT=n;save();}}
function onClose(rep,off){if(!off)S.adW=(S.adW||0)+1;
  if((rep.m+1)%12===0&&rep.m>=11){S.cr=(S.cr||0)+2;emit('cr',2,'yearclose');}
  metaClose(rep,off);checkAch();weekUpd();persist(true);
  if(!off&&typeof LB!=='undefined'&&LB.submit){try{LB.submit();}catch(e){}}}
function handle(out,off){for(const e of out){
  if(e.k==='close'){onClose(e.rep,off);if(!off)emit('close',e.rep);}
  else if(e.k==='own'){emit('own',e);if(e.w==='visit')emit('ownVisit',{fr:e.a,off:!!off,r:e.fr||null});}   // M17: дела хозяина (js/owner.js); ownVisit — хук для модуля друзей: «сходил в гости к другу» (fr — owl|beav|bars|vit)
  else if(!off){if(e.k==='found')emit('found',e.p);else if(e.k==='built')emit('built',e.o);else if(e.k==='upgraded')emit('upgraded',e.o);else if(e.k==='auc')emit('auc',e.a,e.res);else if(e.k==='gig')emit('gig',e);}}}
function dayStep(){let out;try{out=E.tick(W,false);}catch(e){broken(e);return;}handle(out,false);persist();emit('day');}
// сломанное сохранение: не затираем молча — копия в резерв, окно «исправить / начать заново»
let brokenOn=false;
function broken(e){if(brokenOn)return;brokenOn=true;GAME.hold.add('broken');try{console.warn('magnat: мир не грузится',e);}catch(x){}
  try{localStorage.setItem('magnat-backup-'+Date.now(),JSON.stringify(S));}catch(x){}
  const show=()=>{if(typeof modal!=='function')return setTimeout(show,300);
    modal(`<h2>${L('Не удалось загрузить сохранение','Could not load your save')}</h2><p class="about">${L('После обновления игры сохранение прочиталось не полностью. Копия отложена в резерв — ничего не потеряно.','After the game update your save was not read completely. A backup copy is kept — nothing is lost.')}</p>
      <div class="row"><button class="btn green" id="brFix">🔧 ${L('Попробовать исправить','Try to repair')}</button><button class="btn noenter" id="brNew">${L('Начать заново','Start over')}</button></div>`);
    document.getElementById('brFix').onclick=()=>{try{E.migrate(W);E.tick(W,false);brokenOn=false;GAME.hold.delete('broken');hideModal();persist(true);emit('change');}catch(x){toast(L('Не получилось — можно начать заново','That didn’t work — you can start over'));}};
    document.getElementById('brNew').onclick=()=>{W=S.w=newPlayer();S.tut={};brokenOn=false;GAME.hold.delete('broken');hideModal();persist(true);emit('change');};};
  show();}
function dayBase(){return (W&&DAY_ST[W.st])||DAY_MS0;}
function spd(){const v=S.spd;return v===0||v===2?v:1;}
function loop(){const now=performance.now(),dt=Math.min(3000,now-lastRT)*(spd()===2?2:1);lastRT=now;if(!W)return;
  if(!document.hidden){const t=nowMs();S.lastT=t;S.maxT=Math.max(S.maxT||0,t);}
  if(GAME.running()){acc+=dt;let dm=dayBase();while(acc>=dm&&GAME.running()){acc-=dm;dayStep();dm=dayBase();}}}
function shiftMs(){return typeof PAY!=='undefined'&&PAY.own&&PAY.own('manager')?SHIFT_MGR:SHIFT;}
function runOffline(el){const cap=shiftMs(),use=Math.min(el,cap),days=Math.floor(use/OFF_DAY_MS);if(days<1)return null;
  let sum;try{sum=E.offline(W,days);}catch(e){broken(e);return null;}checkAch();weekUpd();sum.el=el;sum.cap=cap;
  S.offMore=Math.floor(Math.min(Math.max(0,el-cap),cap)/OFF_DAY_MS);sum.more=S.offMore;S.lastT=nowMs();persist(true);emit('offline',sum);emit('change');return sum;}
function offlineCheck(){if(offDone||!W)return;offDone=true;const now=nowMs(),last=S.lastT||0;
  if(S.maxT&&now<S.maxT-60000){S.lastT=now;return;}         // часы перевели назад — ничего не начисляем
  const el=now-last;if(!last||el<60000){S.lastT=now;return;}
  runOffline(el);}
document.addEventListener('visibilitychange',()=>{if(!W)return;if(!document.hidden){lastRT=performance.now();const now=nowMs(),el=now-(S.lastT||now);
  if(S.maxT&&now<S.maxT-60000){S.lastT=now;return;}if(el>=60000)runOffline(el);S.lastT=now;}else persist(true);});

const GAME={get DAY_MS(){const b=dayBase();return spd()===2?b/2:b;},get DAY_BASE(){return dayBase();},OFF_DAY_MS,
  speed:spd,setSpeed(v){S.spd=v===0||v===2?v:1;persist(true);emit('change');},CR,AD_CR,AD_CR_MAX,hold:new Set(),
  get W(){return W;},
  on(n,f){(subs[n]=subs[n]||[]).push(f);},emit,
  start(){if(!valid(S.w))S.w=newPlayer();W=S.w;
    try{pkSync();const fx=E.migrate(W);if(fx.length)try{console.info('magnat: сохранение обновлено',fx.join(','));}catch(e){}E.check(W);E.bal(W);}catch(e){broken(e);}weekUpd();checkAch();lastRT=performance.now();
    if(!timer)timer=setInterval(loop,250);
    if(window.__sdkDone)offlineCheck();else setTimeout(offlineCheck,1500);
    persist(true);emit('change');},
  running(){return !!W&&spd()!==0&&!(typeof paused!=='undefined'&&paused)&&!(typeof modalOn!=='undefined'&&modalOn)&&!document.hidden&&GAME.hold.size===0;},
  dayFrac(){return Math.min(1,acc/dayBase());},
  // проверки и снимки: прокрутить n дней «онлайн» сразу (события приходят как обычно)
  fast(n){for(let i=0;i<n;i++)dayStep();},
  act(name,...a){if(!W)return null;let r;
    if(name==='setAuto')r=(W.auto[a[0]][a[1]]=!!a[2]);
    else{if(typeof E[name]!=='function')throw new Error('нет действия '+name);
      // M25: деньги действия игрока — под тегом «a.действие[.кто]» (раскрытие строк отчётов); проданное — запомнить, чем было
      const a0=typeof a[0]==='string'&&a[0].length<24?a[0]:'',t0=E.tg?E.tg('a.'+name+(a0?'.'+a0:'')):'';
      if(a0&&/sell|Sell/.test(name)&&E.dtName){const b=(W.biz||[]).find(x=>x.id===a0)||W.obj.find(x=>x.id===a0)||(Array.isArray(W.re)?W.re:[]).find(x=>x.id===a0);if(b)E.dtName(W,b.id,(b.t||b.cls)+'.'+(b.c||b.r||''));}
      try{r=E[name](W,...a);}finally{if(E.tg)E.tg(t0);}}
    checkAch();persist(true);emit('change',name,r,a);return r;},
  cr(){return S.cr||0;},
  addCr(n,why){S.cr=(S.cr||0)+n;persist(true);emit('cr',n,why);emit('change');},
  spend(n,k){if((S.cr||0)<n)return false;S.cr-=n;persist(true);emit('cr',-n,'spend');if(typeof STAT!=='undefined')STAT.ev('spend',{k:k||'?',c:n});return true;}, // k — на что (для статистики)
  speedBuild(oid){const o=W.obj.find(x=>x.id===oid);if(!o||o.sp||!(o.st==='b'||o.up))return 'no';if(!GAME.spend(CR.speed,'speed'))return 'cr';E.speed(W,oid);persist(true);emit('change');return 'ok';},
  instantExpl(pid){const p=E.plotById(W,pid);if(!p||p.st!=='exp')return 'no';if(!GAME.spend(CR.expl,'expl'))return 'cr';E.speedExpl(W,pid);persist(true);emit('found',pid);emit('change');return 'ok';},
  urgent(){if((S.cr||0)<CR.urgent)return 'cr';const o=E.urgent(W);if(!o)return null;GAME.spend(CR.urgent,'urgent');persist(true);emit('change');return o;},
  AD_GAP,GIFT,
  // «🎁 Подарок дня» (раз в реальный день по nowMs()): +2 💎 кнопкой или +4 💎 — «📺 удвоить за рекламу» (зовётся из колбэка досмотра)
  // подарок дня — клетка календаря «Планёрки» (см. ниже, planGift); x2 — сразу удвоить (зовётся из колбэка досмотра)
  giftOk(){return !!W&&!PL().got;},
  gift(x2){const n=planGift();if(n&&x2)planX2();return n*(x2?2:1);},
  // M31: S.adT = {место: мс последнего ролика}; adWait — мс до следующего (часы назад — не дольше самой паузы), adLeft — 1/0 (старый смысл «можно сейчас»)
  adWait(k){if(!S.adT||typeof S.adT!=='object')S.adT={};const g=(AD_GAP[k]||3)*6e4,t=+S.adT[k]||0;return t?Math.max(0,Math.min(g,t+g-nowMs())):0;},
  adLeft(k){return GAME.adWait(k)>0?0:1;},
  adMin(k){return Math.max(1,Math.ceil(GAME.adWait(k)/6e4));},
  adTxt(k){const n=GAME.adMin(k);return L('следующий через ','next in ')+n+L(' мин',' min');},   // «следующий через 4 мин»
  // награда за рекламу: зовётся ТОЛЬКО из колбэка досмотра showRewarded; действие модели + пауза места. Пауза не прошла — 'wait' (кнопки до показа проверяют adWait)
  adUse(k){GAME.adWait(k);S.adT[k]=nowMs();S.adN=(S.adN|0)+1;persist(true);},   // засчитать ролик места k (окна наград ×2 — 'rw')
  adAct(k,name,...a){if(!W||GAME.adWait(k)>0)return 'wait';const r=GAME.act(name,...a);if(r&&r!=='no'&&r!=='cash')GAME.adUse(k);return r;},
  freeExplOk(){return S.freeM!==W.m+'_'+W.hold;},
  freeExplore(pid){if(!GAME.freeExplOk())return 'no';const r=E.explore(W,pid,0,true);if(r==='ok')S.freeM=W.m+'_'+W.hold;persist(true);emit('change');return r;},
  offMore(){return S.offMore||0;},
  extendShift(){const d=S.offMore||0;S.offMore=0;if(d<1)return null;const sum=E.offline(W,d);sum.ext=true;checkAch();persist(true);emit('offline',sum);emit('change');return sum;},
  value,
  // рост за неделю: gain — ₽, pct — доля от стоимости на начало недели (новичок с 5 000 ₽ тоже растёт), score — очки рейтинга: номер недели × 100 000 + сотые доли процента (до 999,99 %)
  weekGain(){weekUpd();const gain=value()-S.wk.base+(S.wk.carry||0),b0=Math.max(5000,S.wk.b0||S.wk.base||0),pct=Math.max(0,gain/b0);
    return {gain,key:S.wk.k,pct,score:weekNo(nowMs())*1e5+Math.min(99999,Math.round(pct*1e4))};},
  weekNo(){return weekNo(nowMs());},
  ipoReady(){return !!W&&E.ipoReady(W);},
  doIpo(){if(!GAME.ipoReady())return null;weekUpd();const v=value();if(!Array.isArray(S.fame))S.fame=[];
    const rec={hold:W.hold,m:W.m,eq:v,rep:W.rep,t:nowMs()};S.fame.push(rec);S.wk.carry=(S.wk.carry||0)+v-S.wk.base;
    rec.fs=GAME.ipoShares();S.fs=(S.fs||0)+rec.fs;if(!S.pk||typeof S.pk!=='object')S.pk={};S.pkP=perkOffer();
    const lx0=Object.assign({},W.lx||{}),use0=Object.assign({},W.use||{});   // вещи — у героя: переезжают в новый холдинг (в новый баланс не попадают — уже оплачены)
    W=S.w=E.newWorld({rep:Math.min(5,W.rep+1),hold:W.hold+1,m0:W.m,tut:false,pk:S.pk});W.lx=lx0;W.use=use0;S.wk.base=value();
    S.cr=(S.cr||0)+20;emit('cr',20,'ipo');persist(true);emit('ipo',rec);emit('change');return rec;},
  // переход «Карьер → Недра» (глава 5): взнос партнёра, ОСНО, мир недр, обучение недр для первого холдинга
  // «Начать игру заново» (настройки): резерв → новый мир; 💎, покупки, зал славы остаются; номер сброса S.rst побеждает старый мир в облаке
  reset(mode){try{localStorage.setItem('magnat-backup-'+Date.now(),JSON.stringify(S));}catch(e){}
    const pk=S.pk&&typeof S.pk==='object'?S.pk:{};W=S.w=mode==='nedra'?E.newWorld({tut:true,pk}):mode==='rags'&&E.bizInit?E.newWorld({rags:true,pk}):newPlayer();
    S.rst=(S.rst||0)+1;S.tut={};S.offMore=0;delete S.freeM;delete S.pendRep;S.lastT=nowMs();acc=0;S.wk={k:isoWeek(nowMs()),base:value(),carry:0,b0:value()};
    try{if(GAME.rankSync)GAME.rankSync();}catch(e){}persist(true);try{cloudFlush();}catch(e){}emit('change');emit('reset');return W;},   // звание — сразу по ★ и главе нового мира, не ждать первого действия
  goNedra(){if(!W||W.ned||!E.bizGoNedra)return null;const r=E.bizGoNedra(W);if(!r||r.err)return r;
    if(W.tut){S.tut={};}checkAch();weekUpd();if(S.wk)S.wk.carry=(S.wk.carry||0)-(r.partner||0);persist(true);emit('nedra',r);emit('change');return r;},
  stage(){return W?(W.st||'nedra'):'nedra';},
  shiftH(){return shiftMs()/3600e3;},
  SHIFT_H:SHIFT/3600e3,SHIFT_MGR_H:SHIFT_MGR/3600e3,
  isoWeek};
/* ================= этап 4 (28.09): «Планёрка», вехи глав, цели квартала, «Доля основателя», украшения за 💎, буст продаж =================
   Всё, что здесь дают, — 💎 и украшения (сила не продаётся); экономику меняют только улучшения «Доли основателя» (выбор после IPO) и буст за рекламу.
   Интерфейс — js/meta-ui.js (META). Сохранение: S.pl — «Планёрка», S.cos/S.cosSel — украшения, S.pk — улучшения, S.pkP — предложенные на выбор, S.fs — доли основателя. */
const dayN=()=>{const d=new Date(nowMs());return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);};
// номер недели для очков рейтинга: недели с понедельника 5 января 2026 (растёт — старые рекорды уходят вниз)
function weekNo(ms){const d=new Date(ms),t=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()),dn=(new Date(t).getUTCDay()+6)%7;return Math.max(1,Math.floor((t-dn*864e5-Date.UTC(2026,0,5))/(7*864e5))+1);}
// календарь подарков на 7 дней: 💎 по дням, 7-й — украшение (если все есть — 15 💎). Пропуск дня — шаг назад, не в ноль
const CAL=[3,3,5,5,8,8,0],CAL7_CR=15,CAL7=['em_star','fr_ribbon','fr_silver','em_pick','sg_teal'],TASK_CR=2,TASK_ALL=3,X2_ITEM=10;
function PL(){let p=S.pl;if(!p||typeof p!=='object'||Array.isArray(p))p=S.pl={};if(typeof p.cal!=='number')p.cal=0;if(typeof p.str!=='number')p.str=0;
  if(!p.c||typeof p.c!=='object')p.c={close:0,prof:0};if(!Array.isArray(p.t))p.t=[];planRoll(p);return p;}
function planRoll(p){const d=dayN();if(p.d===d)return;
  if(typeof p.last==='number'&&d-p.last>=2){p.cal=Math.max(0,p.cal-1);p.str=Math.floor(p.str/2);p.miss=1;}else p.miss=0;
  p.d=d;p.got=0;p.gv=0;p.x2=0;p.all=0;p.t=W?planTasks():[];p.h=wid();}
function wid(){return W?W.hold+':'+(S.rst||0):'';}
// забрать подарок дня: вернёт число 💎 (украшение — 0, его id в p.gi)
function planGift(){if(!W)return 0;const p=PL();if(p.got)return 0;const c=p.cal;let n=CAL[c]||0;p.gi='';
  if(!n){const id=CAL7.find(x=>!cosHas(x));if(id){cosGive(id);p.gi=id;}else n=CAL7_CR;}
  p.got=1;p.gv=n;p.gc=c;p.last=p.d;p.str++;p.cal=(c+1)%CAL.length;if(n)GAME.addCr(n,'gift');else{persist(true);emit('change');}return n||0;}
// «📺 удвоить подарок» — раз в день, после подарка; зовётся ТОЛЬКО из колбэка досмотра. За украшение — +10 💎
function planX2Ok(){const p=PL();return !!p.got&&!p.x2;}
function planX2(){if(!planX2Ok())return 0;const p=PL();p.x2=1;const n=p.gv||X2_ITEM;GAME.addCr(n,'giftx2');return n;}
/* поручения дня: 3 штуки под текущую главу, выполнимы за 1–2 захода. m — счётчик (прогресс = m − база на момент выдачи), need — сколько нужно */
const TM={ip:W=>W.ip||W.reg&&W.reg.k==='ip'?1:0,bike:W=>W.me&&W.me.eq&&W.me.eq.bike?1:0,gigs:W=>W.me?W.me.ng:0,close:()=>S.pl.c.close,prof:()=>S.pl.c.prof,pts:W=>W.biz.filter(b=>E.SMALL.indexOf(b.t)>=0).length,city:W=>W.cities?W.cities.length:1,
  expl:W=>W.stat.expl,build:W=>W.stat.built,lic:W=>{let n=0;for(const r of E.REG)for(const p of W.plots[r])if(p.own==='you')n++;return n;},sold:W=>W.stat.sold,eq:W=>E.equity(W)};
function taskPool(){const st=W.st||'nedra',c=W.cash,eq=Math.max(1,E.equity(W)),o=[];
  const mr=()=>{const r=W.reps[W.reps.length-1];return r?r.pl.rev:0;};
  // глава 1: месяц = 10 мин — «закрыть 2 месяца» слишком долго для поручения на сегодня
  o.push({k:'close',need:st==='gig'?1:2,cr:TASK_CR});o.push({k:'prof',need:1,cr:TASK_CR});
  if(st==='gig'||st==='small'&&W.me&&!W.me.out){o.push({k:'gigs',need:3,cr:TASK_CR});}
  // глава 1: шаги к первому делу (велосипед → ИП → автомат) — поручения ведут к экономике, а не к выживанию
  if(st==='gig'){if(W.me&&!(W.me.eq&&W.me.eq.bike)&&c>=10e3)o.push({k:'bike',need:1,cr:TASK_CR});if(!W.ip&&!W.reg&&c>=20e3)o.push({k:'ip',need:1,cr:TASK_CR});}
  if(!W.ned){const cheap=Math.min(...E.SMALL.map(t=>E.BIZ[t].cap));if(W.ip&&c>=cheap*.6)o.push({k:'pts',need:1,cr:TASK_CR});
    if(W.ooo&&W.cities.length<3&&c>=1.5e6)o.push({k:'city',need:1,cr:TASK_CR});
    o.push({k:'eq',need:st==='gig'?.2:.1,cr:TASK_CR,pct:1});}
  else{if(E.REG.some(r=>W.plots[r].some(p=>p.st==='hid'))&&c>=E.explCost(W,'kuz')*1.5)o.push({k:'expl',need:1,cr:TASK_CR});
    if(E.REG.some(r=>W.plots[r].some(p=>p.own==='you'&&p.st==='lic'&&!W.obj.some(x=>x.plot===p.id)))||c>=300e6)o.push({k:'build',need:1,cr:TASK_CR});
    if(mr()>0)o.push({k:'sold',need:Math.max(1e6,Math.round(mr()*.6/1e6)*1e6),cr:TASK_CR});
    o.push({k:'eq',need:.03,cr:TASK_CR,pct:1});}
  return o;}
function planTasks(){if(!W)return [];const pool=taskPool(),out=[];const first=pool.shift();out.push(first); // «закрыть 2 месяца» — всегда
  while(out.length<3&&pool.length){const i=Math.floor(Math.random()*pool.length);out.push(pool.splice(i,1)[0]);}
  for(const t of out){t.b=TM[t.k](W);t.ok=0;}return out;}
function taskCur(t){if(!W)return 0;const v=TM[t.k](W);return t.pct?(t.b>0?v/t.b-1:0):v-t.b;}
function taskDone(t){return t.ok||taskCur(t)>=t.need-1e-9;}
function planTasksNow(){const p=PL();if(!W)return p.t;
  if(p.h!==wid()){for(const t of p.t)if(!t.ok)t.b=TM[t.k](W);p.h=wid();}
  // глава сменилась посреди дня (например, «Карьер» → «Недра»): невыполненные поручения прошлой главы — заменить на поручения новой
  const st=W.st||'nedra';if(p.s&&p.s!==st){const have=p.t.filter(t=>t.ok==='got'||taskDone(t)),ks=have.map(t=>t.k),pool=taskPool().filter(t=>ks.indexOf(t.k)<0);
    while(have.length<3&&pool.length){const t=pool.splice(Math.floor(Math.random()*pool.length),1)[0];t.b=TM[t.k](W);t.ok=0;have.push(t);}p.t=have;}
  p.s=st;return p.t;}
// набор «Солидный» (M8 §3.5): раз в день можно заменить одно невыполненное поручение на другое (удобство, не ₽)
function planRerollOk(){const p=PL();return !!(S.col&&S.col.solid)&&!p.rr;}
function planReroll(i){if(!planRerollOk())return false;const p=PL(),ts=planTasksNow(),t=ts[i];if(!t||t.ok==='got'||taskDone(t))return false;
  const ks=ts.map(x=>x.k),pool=taskPool().filter(x=>ks.indexOf(x.k)<0);if(!pool.length)return false;const n=pool[Math.floor(Math.random()*pool.length)];n.b=TM[n.k](W);n.ok=0;ts[i]=n;p.rr=1;persist(true);emit('change');return true;}
function planClaim(i){const p=PL(),t=planTasksNow()[i];if(!t||t.ok==='got'||!taskDone(t))return 0;t.ok='got';let n=t.cr;
  if(!p.all&&p.t.every(x=>x.ok==='got')){p.all=1;n+=TASK_ALL;if(GAME.plDay)GAME.plDay();}GAME.addCr(n,'task');return n;}
/* вехи глав: достигнута — W.ach['ms_'+k]; награда один раз на игрока (S.crE) — 💎 и украшение за последнюю веху главы */
function checkMiles(){if(!W||!E.bizMiles)return;const i=E.stI(W);   // в «Недрах» — свои вехи (MILES.nedra), вехи прошлых глав bizMiles в мире недр не считает
  for(const st of E.STAGES.slice(0,Math.max(0,i)+1)){for(const m of E.bizMiles(W,st)){if(!m.done)continue;const k='ms_'+m.k;
    if(!W.ach[k])W.ach[k]=1;if(S.crE[k])continue;S.crE[k]=1;S.cr=(S.cr||0)+m.cr;if(m.cos)cosGive(m.cos);emit('cr',m.cr,'mile');emit('mile',m);}}}
/* цели квартала (недра): в начале квартала совет директоров предлагает 3 цели — игрок выбирает одну (развилка «спокойно / рискованно»).
   Итог — при закрытии 3-го месяца квартала: выполнено — 💎 и строчка в новостях. W.qg = {q, o:[{k,need,cr}], p (выбранная, −1), b (база), st:'pick'|'run'|'ok'|'fail'} */
const QG={np:{cr:2},eq:{cr:3},rev:{cr:3},expl:{cr:2},lic:{cr:3},build:{cr:3},debt:{cr:3}};   // M8 §3.6 (решение владельца 30.09): вдвое меньше — это был самый щедрый и незаметный кран 💎 в «Недрах»
function qRev(W,q){let s=0,n=0;for(const r of W.reps)if(Math.floor(r.m/3)===q){s+=r.pl.rev;n++;}return n?s:0;}
function qNet(W,q){let s=0;for(const r of W.reps)if(Math.floor(r.m/3)===q)s+=E.netOf(r.pl);return s;}
function qgNew(q){const o=[{k:'np',need:0}],pool=[{k:'eq',need:.06}];const pr=qRev(W,q-1),debt=E.debtOf(W);
  if(pr>0)pool.push({k:'rev',need:1.1,base:pr});pool.push({k:'expl',need:2});pool.push({k:'lic',need:1});
  if(W.cash>=250e6||E.REG.some(r=>W.plots[r].some(p=>p.own==='you'&&p.st==='lic'&&!W.obj.some(x=>x.plot===p.id))))pool.push({k:'build',need:1});
  if(debt>50e6)pool.push({k:'debt',need:.2});
  while(o.length<3&&pool.length){const i=Math.floor(Math.random()*pool.length);o.push(pool.splice(i,1)[0]);}
  for(const x of o)x.cr=QG[x.k].cr;return {q,o,p:-1,b:null,st:'pick'};}
function qgBase(g){return {eq:E.equity(W),expl:W.stat.expl,lic:TM.lic(W),build:W.stat.built,debt:E.debtOf(W)};}
function qgCur(g){if(!g||g.p<0||!W)return 0;const x=g.o[g.p],b=g.b||{};
  switch(x.k){case 'np':return qNet(W,g.q)+(Math.floor(W.m/3)===g.q?E.netOf(W.mon.pl):0);case 'eq':return b.eq>0?E.equity(W)/b.eq-1:0;
    case 'rev':return x.base>0?(qRev(W,g.q)+(Math.floor(W.m/3)===g.q?W.mon.pl.rev:0))/x.base:0;case 'expl':return W.stat.expl-b.expl;case 'lic':return TM.lic(W)-b.lic;
    case 'build':return W.stat.built-b.build;case 'debt':return b.debt>0?1-E.debtOf(W)/b.debt:0;}return 0;}
function qgOk(g){const x=g.o[g.p],v=qgCur(g);return x.k==='np'?v>0:v>=x.need-1e-9;}
function qgPick(i){const g=W&&W.qg;if(!g||g.st!=='pick'||!g.o[i])return 'no';g.p=i;g.b=qgBase(g);g.st='run';persist(true);emit('change');return 'ok';}
function metaClose(rep,off){const p=PL();p.c.close++;if(E.netOf(rep.pl)>0)p.c.prof++;
  if(!W||!W.ned)return;const q=Math.floor(rep.m/3),end=(rep.m+1)%3===0;let g=W.qg;
  if(g&&g.q===q&&end&&g.st==='run'){const ok=qgOk(g);g.st=ok?'ok':'fail';if(ok){const n=g.o[g.p].cr;S.cr=(S.cr||0)+n;emit('cr',n,'quarter');}
    W.news.push({t:W.t,m:W.m,k:'qgoal',a:{ok:ok?1:0,g:g.o[g.p].k,cr:ok?g.o[g.p].cr:0}});if(W.news.length>40)W.news.shift();emit('qgoal',g);}
  if(!g||g.q<(end?q+1:q))W.qg=qgNew(end?q+1:q);}
/* «Доля основателя»: при IPO — доли √(капитал/1 млрд)×10 (почёт, в зал славы) и выбор 1 из 3 улучшений навсегда (E.PERKS) */
function perkOffer(){const pk=S.pk||{},ids=Object.keys(E.PERKS).filter(k=>(pk[k]||0)<E.PERKS[k].max),o=[];
  while(o.length<3&&ids.length)o.push(ids.splice(Math.floor(Math.random()*ids.length),1)[0]);return o.length?o:null;}
function perkPick(id){if(!Array.isArray(S.pkP)||S.pkP.indexOf(id)<0||!E.PERKS[id])return 'no';if(!S.pk||typeof S.pk!=='object')S.pk={};
  S.pk[id]=Math.min(E.PERKS[id].max,(S.pk[id]||0)+1);S.pkP=null;if(W){W.pk=Object.assign({},S.pk);if(id==='heir'&&W.ned)E.legacy(W);E.applyPerks(W);}
  persist(true);emit('perk',id);emit('change');return 'ok';}
/* украшения за 💎 (только вид): эмблема перед названием холдинга, цвет вывесок, рамка портрета Людмилы Санны.
   cr — цена в 💎 (0 — не продаётся: награда, календарь, покупка); lv — входит в покупку «Вывески и цвета сети» (livery) */
const COS=[
  {id:'em_hammer',k:'emb',ic:'🔨',ru:'Золотой молот',en:'Golden hammer',cr:0,buy:'starter'},
  {id:'em_pick',k:'emb',ic:'⛏',ru:'Кирка',en:'Pickaxe',cr:20,lv:1},{id:'em_factory',k:'emb',ic:'🏭',ru:'Завод',en:'Factory',cr:25,lv:1},
  {id:'em_train',k:'emb',ic:'🚂',ru:'Паровоз',en:'Locomotive',cr:25,lv:1},{id:'em_bear',k:'emb',ic:'🐻',ru:'Медведь',en:'Bear',cr:30,lv:1},
  {id:'em_eagle',k:'emb',ic:'🦅',ru:'Орёл',en:'Eagle',cr:30,lv:1},{id:'em_crown',k:'emb',ic:'👑',ru:'Корона',en:'Crown',cr:40,lv:1},
  {id:'em_shop',k:'emb',ic:'🏪',ru:'Первая лавка',en:'First shop',cr:0},{id:'em_star',k:'emb',ic:'⭐',ru:'Звезда планёрки',en:'Meeting star',cr:0},
  {id:'sg_copper',k:'sign',c:'#c8641e',ru:'Медь',en:'Copper',cr:0,free:1},{id:'sg_blue',k:'sign',c:'#1f5f99',ru:'Синий',en:'Blue',cr:25,lv:1},
  {id:'sg_green',k:'sign',c:'#2e7d32',ru:'Зелёный',en:'Green',cr:25,lv:1},{id:'sg_wine',k:'sign',c:'#8e2443',ru:'Бордо',en:'Burgundy',cr:25,lv:1},
  {id:'sg_gold',k:'sign',c:'#b8860b',ru:'Золото',en:'Gold',cr:30,lv:1},{id:'sg_graphite',k:'sign',c:'#37474f',ru:'Графит',en:'Graphite',cr:25,lv:1},
  {id:'sg_teal',k:'sign',c:'#00796b',ru:'Бирюза',en:'Teal',cr:25,lv:1},
  {id:'fr_silver',k:'fr',c:'#9aa4ae',ru:'Серебряная рамка',en:'Silver frame',cr:30},{id:'fr_gold',k:'fr',c:'#d4a017',ru:'Золотая рамка',en:'Gold frame',cr:40},
  {id:'fr_wood',k:'fr',c:'#8d5a2b',ru:'Деревянная рамка',en:'Wooden frame',cr:30},{id:'fr_granite',k:'fr',c:'#6d6d6d',ru:'Гранитная рамка',en:'Granite frame',cr:0},
  {id:'fr_ribbon',k:'fr',c:'#c62828',ru:'Рамка с лентой',en:'Ribbon frame',cr:0}];
const payOwn=id=>typeof PAY!=='undefined'&&PAY.own&&PAY.own(id);
function cosHas(id){const c=COS.find(x=>x.id===id);if(!c)return false;if(c.free)return true;if(S.cos&&S.cos[id])return true;
  if(c.lv&&payOwn('livery'))return true;if(c.buy&&payOwn(c.buy))return true;return false;}
function cosGive(id){if(!S.cos||typeof S.cos!=='object')S.cos={};S.cos[id]=1;}
function cosBuy(id){const c=COS.find(x=>x.id===id);if(!c||!c.cr||cosHas(id))return 'no';if(!GAME.spend(c.cr,'cos'))return 'cr';cosGive(id);cosSel(c.k,id);return 'ok';}
function cosSel(k,id){if(!S.cosSel||typeof S.cosSel!=='object')S.cosSel={};if(id&&!cosHas(id))return 'no';S.cosSel[k]=id||'';persist(true);emit('cos');emit('change');return 'ok';}
function cosCur(k){const id=S.cosSel&&S.cosSel[k];return id&&cosHas(id)?COS.find(x=>x.id===id):null;}
// срок до цели без скачков: средний рост стоимости за последние 6 месяцев; null — если не растёт
function eta(need,cur){if(!W)return null;const h=W.hist.slice(-7);if(h.length<3)return null;const sl=(h[h.length-1].eq-h[0].eq)/(h.length-1);cur=cur==null?value():cur;
  if(cur>=need)return 0;if(!(sl>0))return null;return Math.ceil((need-cur)/sl);}
function etaTxt(n){if(n==null)return '';if(n<=1)return L('меньше месяца','under a month');if(n<=6)return '≈ '+pl(n,'месяц','месяца','месяцев','month','months');
  if(n<=9)return L('≈ полгода','≈ half a year');if(n<=15)return L('≈ год','≈ a year');const y=Math.round(n/12);return '≈ '+pl(y,'год','года','лет','year','years');}
// GAME.GIFT — сколько 💎 даст сегодняшняя клетка календаря (старая карточка «Подарок дня» в biz-ui/ui показывает верную сумму)
Object.defineProperty(GAME,'GIFT',{get(){if(!W)return GIFT;const p=PL();const c=p.got?p.gc:p.cal;return CAL[c]||(CAL7.some(x=>!cosHas(x))?X2_ITEM:CAL7_CR);},configurable:true});
/* покупки за 💎 навсегда (28.09, владелец: «руки 4 и 5 за кристаллы», «энергии больше 100»): 4-я и 5-я рука ✋ (E.HAND_CR 60/150 💎), запас сил ⚡ +20 ступенями до 160 (E.EN_CR 40/80/140 💎).
   Хранятся в S.pk (hand, enx) — облако берёт больший уровень, переживают IPO и «начать заново» (как «Доля основателя»); в мире — копия W.pk (модель: E.hx, E.enMax). */
function pkSync(){if(!W)return;if(!S.pk||typeof S.pk!=='object')S.pk={};if(!W.pk||typeof W.pk!=='object')W.pk={};
  for(const k of ['hand','enx','reg']){const v=Math.max(S.pk[k]|0,W.pk[k]|0);if(v){S.pk[k]=v;W.pk[k]=v;}}}   // reg — «Режим дня» (M17, E.REG_CR)
function pkLv(k){pkSync();return (S.pk&&S.pk[k])|0;}
function buyPk(k,prices){const l=pkLv(k);if(!prices||l>=prices.length)return 'max';if(!GAME.spend(prices[l],k))return 'cr';S.pk[k]=l+1;pkSync();persist(true);emit('change');return 'ok';}
Object.assign(GAME,{handLv:()=>pkLv('hand'),enLv:()=>pkLv('enx'),handNext:()=>{const l=pkLv('hand');return E.HAND_CR&&l<E.HAND_CR.length?E.HAND_CR[l]:0;},
  enNext:()=>{const l=pkLv('enx');return E.EN_CR&&l<E.EN_CR.length?E.EN_CR[l]:0;},buyHand:()=>buyPk('hand',E.HAND_CR),buyEn:()=>buyPk('enx',E.EN_CR),
  regLv:()=>pkLv('reg'),regNext:()=>{const l=pkLv('reg');return E.REG_CR&&l<E.REG_CR.length?E.REG_CR[l]:0;},buyReg:()=>buyPk('reg',E.REG_CR),pkSync});
Object.assign(GAME,{planRerollOk,planReroll,plan:()=>{const p=PL();planTasksNow();return p;},CAL,CAL7_CR,planGift,planX2,planX2Ok,planClaim,taskCur,taskDone,
  miles:st=>W&&E.bizMiles?E.bizMiles(W,st):[],qgPick,qgCur,qgOk,
  ipoShares(){return Math.max(1,Math.floor(Math.sqrt(Math.max(0,value())/1e9)*10));},perkOffer,perkPick,
  COS,cosHas,cosBuy,cosSel,cosCur,cosGive,eta,etaTxt,
  boostOk:()=>!!W&&E.boostOk(W),boostOn:()=>!!W&&E.boostOn(W)});
/* ================= M8: вещи героя, Кабинет — Стена почёта, звание магната (★), наборы, итоги недели =================
   Модель вещей — ECON.LUX (js/biz.js), интерфейс — js/cab-ui.js (CAB, REW). Здесь — то, что живёт у игрока (S), а не у мира:
   S.wall = {ключ:{m,h}} — грамоты (ключи S.crE: достижения ACH и вехи ms_*), фото (ph_*), кубки (cup_*), особые грамоты (g_*). Переживает «Начать заново» и IPO.
   S.lxE — вещи, купленные хоть раз (★ за них не пропадают), S.lxc — украшения вещей за 💎, S.col — собранные наборы, S.rk — звание (не падает), S.rkG — до какого звания выданы награды,
   S.wN — новое на стене (красная точка на ★ в шапке), S.plW — дни недели со всеми поручениями Планёрки, S.wkR — итог прошлой недели (ждёт окна).
   ★ = вещи (ECON.LUX st) + грамота 1 + фото 3 (+3 за золотую рамку — все грамоты главы) + кубки 2–5 + набор 5. */
const isO=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function so(k){if(!isO(S[k]))S[k]={};return S[k];}
const PH=[ // фото на стене: k, эмодзи сцены, кто на фото (лица друзей), глава, условие
  {k:'ph_gig1',ico:'📦',who:['lud'],ch:1,ok:()=>!!(S.crE&&S.crE.z_gig1)},
  {k:'ph_small',ico:'☕',who:['lud'],ch:2,ok:()=>!!(S.crE&&S.crE.z_biz1)},
  {k:'ph_mid',ico:'🎀',who:['lud','owl'],ch:3,ok:()=>!!(S.crE&&S.crE.z_ooo)},
  {k:'ph_truck',ico:'🚛',who:['vit'],ch:3,ok:()=>!!(S.crE&&S.crE.z_truck)},
  {k:'ph_quarry',ico:'⛑',who:['bars'],ch:4,ok:()=>!!(S.crE&&(S.crE.z_opi||S.crE.z_quarry))},
  {k:'ph_home',ico:'🏠',who:['lud','beav'],ch:4,ok:()=>!!(S.lxE&&S.lxE.house)},
  {k:'ph_nedra',ico:'⛏',who:['bars','lud'],ch:5,ok:()=>stN()>=5},
  {k:'ph_ipo',ico:'🔔',who:['lud','owl','beav','bars','vit'],ch:5,ok:()=>Array.isArray(S.fame)&&S.fame.length>0}];
const stN=()=>W?(W.hold>=2?5:E.stI(W)+1):1;
const PH_ST={ph_small:'small',ph_mid:'mid',ph_quarry:'quarry',ph_nedra:'nedra'};
// звания: ★, награда (эмблема/цвет/рамка — украшение cr 0 «не продаётся», 💎, рамка стены)
const RK=[{s:0,ru:'Подработчик',en:'Odd-jobber'},{s:4,ru:'Самозанятый со стажем',en:'Seasoned freelancer',cos:'em_bike'},{s:10,ru:'Хозяин автомата',en:'Vending machine owner',cos:'fr_check'},
  {s:18,ru:'Ларёчник',en:'Kiosk keeper',cos:'em_shawa'},{s:28,ru:'Предприниматель',en:'Entrepreneur',cr:10},{s:40,ru:'Уважаемый человек района',en:'Respected local figure',cos:'sg_cherry'},
  {s:52,ru:'Хозяин сети',en:'Chain owner',cos:'em_tie'},{s:66,ru:'Генеральный директор',en:'CEO',cos:'wf_silver'},{s:82,ru:'Человек с карьером',en:'The one with a quarry',cr:10},
  {s:98,ru:'Щебёночный король',en:'Gravel king',cos:'em_rock'},{s:115,ru:'Недропользователь',en:'Mineral rights holder',cos:'sg_malach'},{s:132,ru:'Промышленник',en:'Industrialist',cos:'em_gfact'},
  {s:150,ru:'Магнат',en:'Tycoon',cr:15},{s:170,ru:'Гордость 11 «Б»',en:'Pride of class 11B',cos:'wf_velvet'},{s:195,ru:'Легенда Кузбасса',en:'Legend of Kuzbass',cr:20,cos:'em_geagle'}];
// женский род званий (герой — женщина): только там, где слово меняется
const RK_F={0:'Подработчица',1:'Самозанятая со стажем',2:'Хозяйка автомата',3:'Ларёчница',4:'Предпринимательница',5:'Уважаемая женщина района',6:'Хозяйка сети',8:'Женщина с карьером',9:'Щебёночная королева',11:'Промышленница'};
// украшения-награды (не продаются) и рамки стены: дерево бесплатно, серебро 20 💎, золото 30, бархат 40
const COS_M8=[{id:'em_bike',k:'emb',ic:'🚲',ru:'Велосипед',en:'Bicycle',cr:0},{id:'fr_check',k:'fr',c:'#6b8e23',ru:'Клетчатая рамка',en:'Checked frame',cr:0},
  {id:'em_shawa',k:'emb',ic:'🌯',ru:'Шаурма с ларька',en:'Kiosk shawarma',cr:0},{id:'sg_cherry',k:'sign',c:'#9b1b30',ru:'Вишня',en:'Cherry',cr:0},
  {id:'em_tie',k:'emb',ic:'👔',ru:'Галстук',en:'Tie',cr:0},{id:'em_rock',k:'emb',ic:'⛰',ru:'Гора щебня',en:'Gravel mountain',cr:0},{id:'sg_malach',k:'sign',c:'#0b6e4f',ru:'Малахит',en:'Malachite',cr:0},
  {id:'em_gfact',k:'emb',ic:'🏭',ru:'Золотой завод',en:'Golden plant',cr:0},{id:'em_geagle',k:'emb',ic:'🦅',ru:'Золотой орёл',en:'Golden eagle',cr:0},
  {id:'em_sun',k:'emb',ic:'🌻',ru:'Подсолнух дачника',en:'Gardener’s sunflower',cr:0},{id:'em_anchor',k:'emb',ic:'⚓',ru:'Якорь',en:'Anchor',cr:0},{id:'em_bell',k:'emb',ic:'🔔',ru:'Биржевой колокол',en:'Stock exchange bell',cr:0},
  {id:'wf_wood',k:'wf',c:'#8d5a2b',ru:'Дерево',en:'Wood',cr:0,free:1},{id:'wf_silver',k:'wf',c:'#9aa4ae',ru:'Серебро',en:'Silver',cr:20},{id:'wf_gold',k:'wf',c:'#d4a017',ru:'Золото',en:'Gold',cr:30},
  {id:'wf_velvet',k:'wf',c:'#7b1f3a',ru:'Бархат с кистями',en:'Velvet with tassels',cr:40}];
for(const c of COS_M8)if(!COS.some(x=>x.id===c.id))COS.push(c);
// наборы вещей: ★5 и награда (один раз на игрока); вещи — ECON.LUX_SET
const COL={dacha:{ico:'🌻',ru:'Дачник',en:'Dacha lover',cr:10,cos:'em_sun'},solid:{ico:'🎩',ru:'Солидный',en:'Respectable',cr:0},auto:{ico:'🚗',ru:'Автопарк',en:'Car fleet',cr:0},
  hobby:{ico:'⚓',ru:'Хобби',en:'Hobbies',cr:10,cos:'em_anchor'},patron:{ico:'🏛',ru:'Меценат',en:'Patron of the arts',cr:10}};
// украшения вещей за 💎 (только вид): на какие вещи, цена
const LXC={plate:{ids:['car1','car2','car2b','suv'],cr:40,ico:'7️⃣',ru:'Номер «777» на все машины',en:'“777” plates on all cars'},engrave:{ids:['watch1','watch2','watch3'],cr:20,ico:'✍',ru:'Гравировка на часах',en:'Engraving on the watches'},
  flag:{ids:['yacht'],cr:30,ico:'🚩',ru:'Флаг холдинга на яхте',en:'Holding flag on the yacht'},kennel:{ids:['dog'],cr:15,ico:'🏠',ru:'Будка-терем для Барона',en:'A carved kennel for Baron'},
  gframe:{ids:['paint1','paint2'],cr:20,ico:'🖼',ru:'Золочёная рама для картин',en:'Gilded frames for the paintings'},plaque:{ids:['gym11'],cr:25,ico:'🏅',ru:'Табличка «Почётный спонсор» на спортзале',en:'“Honorary sponsor” plaque on the gym'}};
function wallAdd(k,o){const w=so('wall');if(w[k])return false;wsMig();w[k]=Object.assign({m:W?W.m:null,h:W?W.hold:1},o||{});S.wN=wallNew().length;return true;}
// M43: «новое на Стене» — не счётчик, а список увиденного S.wS={ключ:1} (облако — объединение): новое = есть на стене, но не увидено.
// Миграция: всё, что на стене, кроме последних S.wN (старый счётчик), — уже увидено. S.wN оставлен как число для старых версий.
function wsMig(){const s=so('wS');if(!S.wsV){const ks=Object.keys(so('wall')),n=Math.min(ks.length,Math.max(0,S.wN|0));for(const k of ks.slice(0,ks.length-n))s[k]=1;S.wsV=1;}return s;}
function wallNew(){const s=wsMig(),w=so('wall');return Object.keys(w).filter(k=>!s[k]);}
// все грамоты: достижения ACH (глав и недр) и вехи всех глав
function wallGrams(){const o=[];for(const k in ACH)o.push({k,ach:1});if(E.MILES)for(const st in E.MILES)for(const m of E.MILES[st])o.push({k:'ms_'+m[0],st,m});return o;}
// синхронизация стены с тем, что уже заработано; первый запуск после обновления — молча (без «новое»), старые сейвы сразу видят полстены
function wallSync(silent){if(!W)return [];wsMig();const w=so('wall'),crE=so('crE'),nw=[];const first=!S.wallV;
  for(const g of wallGrams())if(crE[g.k]&&!w[g.k]){w[g.k]={m:first?null:W.m,h:W.hold};nw.push(g.k);}
  for(const p of PH)if(p.ok()&&!w[p.k]){w[p.k]={m:first?null:W.m,h:W.hold};nw.push(p.k);}
  // встречи выпускников (сюжет): фото каждой встречи и «Кубок 11 „Б“», если капитал больше, чем у Бориса
  try{const F=W.fr;if(F&&Array.isArray(F.rh))for(const h of F.rh){const k='ph_meet_'+h.y;if(!w[k]){w[k]={m:h.m,h:W.hold,y:h.y};nw.push(k);}
    const c='cup_11b_'+h.y;if(h.r&&h.r.beav!=null&&h.r.you>h.r.beav&&!w[c]){w[c]={m:h.m,h:W.hold,y:h.y,t:4};nw.push(c);}}}catch(e){}
  if(!first)for(const k of nw)if(k.indexOf('ph_')===0)try{STAT.ev('ph',{k});}catch(e){}
  if(first||silent){const s=so('wS');for(const k of nw)s[k]=1;}
  if(first){S.wallV=1;}else if(nw.length&&!silent){emit('wall',nw);}S.wN=wallNew().length;
  return nw;}
// фото главы в золотой рамке: собраны все грамоты (вехи) этой главы
function phGold(k){const st=PH_ST[k];if(!st||!E.MILES||!E.MILES[st])return false;const crE=so('crE');return E.MILES[st].every(m=>crE['ms_'+m[0]]);}
function stars(){const w=so('wall'),lxE=so('lxE'),col=so('col');let lx=0,gr=0,ph=0,cu=0,co=0;
  for(const id in lxE){const x=E.luxOf&&E.luxOf(id);if(x&&x.st)lx+=x.st;}
  for(const k in w){if(k.indexOf('ph_')===0){ph+=3;if(phGold(k))ph+=3;}else if(k.indexOf('cup_')===0)cu+=(w[k].t|0)||2;else gr+=1;}
  for(const k in col)if(col[k])co+=5;
  return {n:lx+gr+ph+cu+co,lx,gr,ph,cu,co};}
// звание — не только ★, но и глава: «Хозяин автомата» — со своим делом, «Ларёчник» — со второй точкой, «Хозяин сети» — с ООО… (иначе ★ за грамоты главы 1 давали «Хозяина автомата» без автомата)
const RK_CH=[1,1,2,2,2,2,3,3,4,4,5,5,5,5,5];
function rkLock(j){const c=RK_CH[j]||1,n=stN();if(n<c)return c;if(j===3&&n===2&&W&&W.biz.filter(b=>E.SMALL.indexOf(b.t)>=0).length<2)return 2;return 0;}
function rkLockTxt(j){const c=rkLock(j);if(!c||!RK[j]||stars().n<RK[j].s)return '';const N={2:['Своё дело','My business'],3:['Сеть','Network'],4:['Карьер','Quarry'],5:['Недра','Mining']};
  return ' · '+(j===3&&c===2?L('нужна вторая точка','needs a second outlet'):L('откроется в главе «'+N[c][0]+'»','unlocks in the “'+N[c][1]+'” chapter'));}
function rankOf(n){let i=0;for(let j=0;j<RK.length;j++)if(n>=RK[j].s&&!rkLock(j))i=j;else if(n>=RK[j].s)break;return i;}
// звание не падает: S.rk = max; новое — событие rank (окно награды — cab-ui, очередь REWQ)
function rankSync(){const n=stars().n,i=Math.max(rankOf(n),S.rk|0);if(typeof S.rkG!=='number')S.rkG=0;   // старые игроки: награды за звания, заработанные до обновления, приходят одним окном
  if(i>(S.rk|0)){const was=S.rk|0;S.rk=i;emit('rank',i,was);try{STAT.ev('rank',{n:i+1,s:stN(),d:realDay()});}catch(e){}}else if(S.rk==null)S.rk=i;return i;}
function realDay(){const t0=S.t0||(S.t0=nowMs());return Math.round((nowMs()-t0)/864e5*10)/10;}
// выдать награды званий (S.rkG+1 … S.rk): 💎 (×2 за ролик — отдельно) и украшения; вернёт {cr, cos:[…], lv:[…]}
function rkClaim(){const out={cr:0,cos:[],lv:[]};for(let i=(S.rkG|0)+1;i<=(S.rk|0);i++){const r=RK[i];out.lv.push(i);if(r.cr)out.cr+=r.cr;if(r.cos){cosGive(r.cos);out.cos.push(r.cos);}}
  S.rkG=Math.max(S.rkG|0,S.rk|0);if(out.cr)GAME.addCr(out.cr,'rew');else{persist(true);emit('change');}return out;}
// наборы: собраны все вещи набора хоть раз (S.lxE)
function colSync(){if(!E.LUX_SET)return [];const col=so('col'),lxE=so('lxE'),nw=[];for(const k in E.LUX_SET)if(!col[k]&&E.LUX_SET[k].every(id=>lxE[id])){col[k]=1;nw.push(k);
    if(k==='patron')wallAdd('g_patron');try{STAT.ev('col',{k});}catch(e){}}
  if(nw.length)emit('col',nw);return nw;}
function colClaim(k){const c=COL[k];if(!c||!(S.col&&S.col[k])||(S.colG&&S.colG[k]))return 0;so('colG')[k]=1;if(c.cos)cosGive(c.cos);if(k==='auto')so('lxc').plate=1;
  if(c.cr)GAME.addCr(c.cr,'rew');else{persist(true);emit('change');}return c.cr||0;}
// вещи: купить (правило Людмилы, изъятие; рейтинг недели не страдает — S.wk.carry += цена, как взнос партнёра), пересесть/переехать, украсить за 💎
function luxBuy(id){if(!W||!E.luxBuy)return 'no';const s=E.luxState(W,id);const r=E.luxBuy(W,id);
  if(r==='ok'){const x=s.x;weekUpd();S.wk.carry=(S.wk.carry||0)+x.p;so('lxE')[id]=1;try{STAT.ev('lx',{i:id,s:stN(),p:Math.round(x.p/1e4)/100,d:realDay()});}catch(e){}
    wallSync();colSync();rankSync();persist(true);emit('lux',id);emit('change');}
  else if(r==='cash'||r==='lud'){try{STAT.ev('lxno',{i:id,w:r});}catch(e){}}
  return r;}
function luxUse(id){if(!W||!E.luxUse)return 'no';const r=E.luxUse(W,id);if(r==='ok'){persist(true);emit('luxuse',id);emit('change');}return r;}
function lxcBuy(k){const c=LXC[k];if(!c||so('lxc')[k])return 'no';if(!GAME.spend(c.cr,'lxcos'))return 'cr';S.lxc[k]=1;persist(true);emit('change');return 'ok';}
function wfBuy(id){const c=COS.find(x=>x.id===id);if(!c||c.k!=='wf')return 'no';if(cosHas(id)){cosSel('wf',id);return 'ok';}if(!c.cr)return 'no';
  if(!GAME.spend(c.cr,'wallfr'))return 'cr';cosGive(id);cosSel('wf',id);return 'ok';}
/* итоги недели (M8 §3.2): при первом заходе в новой ISO-неделе — окно с кубком за рост капитала (в %) и грамотой «Ударник» за Планёрку ≥ 5 дней */
const WK_CUP=[{p:.05,t:1,cr:4},{p:.15,t:2,cr:7},{p:.30,t:3,cr:10}],WK_UD=6,WK_PL=5;
function plDay(){const k=isoWeek(nowMs()),p=so('plW');if(p.k!==k){p.k=k;p.d=[];}if(!Array.isArray(p.d))p.d=[];const d=dayN();if(p.d.indexOf(d)<0)p.d.push(d);}
function wkClose(old){if(!old||!old.k||typeof old.base!=='number')return;const gain=value()-old.base+(old.carry||0),b0=Math.max(5000,old.b0||old.base||0),pct=Math.max(0,gain/b0);
  const pd=S.plW&&S.plW.k===old.k&&Array.isArray(S.plW.d)?S.plW.d.length:0;let cup=null;for(const c of WK_CUP)if(pct>=c.p)cup=c;
  if(!cup&&pd<WK_PL)return;S.wkR={k:old.k,pct:Math.round(pct*1e4)/1e4,pd,t:cup?cup.t:0,cr:(cup?cup.cr:0)+(pd>=WK_PL?WK_UD:0),got:0};}
// забрать итог недели: кубок и грамота на стену, 💎; «Кубок Планёрки» — 4 недели подряд «Ударник»
function wkClaim(){const r=S.wkR;if(!r||r.got)return 0;r.got=1;if(r.t)wallAdd('cup_w_'+r.k,{t:[0,2,3,5][r.t],w:r.t});
  if(r.pd>=WK_PL){wallAdd('g_ud_'+r.k);S.udN=(S.udN|0)+1;if(S.udN%4===0)wallAdd('cup_plan_'+r.k,{t:5});}else S.udN=0;
  try{STAT.ev('wk',{t:r.t,pd:r.pd,c:r.cr});}catch(e){}
  if(r.cr)GAME.addCr(r.cr,'rew');else{persist(true);emit('change');}rankSync();return r.cr;}
Object.assign(GAME,{wkClose,plDay,PH,PH_ST,RK,RK_F,COL,LXC,stars,rankOf,rkLock,rkLockTxt,rankSync,rkClaim,wallSync,wallGrams,phGold,colSync,colClaim,luxBuy,luxUse,lxcBuy,wfBuy,wkClaim,
  wallSeen:ks=>{const s=wsMig();for(const k of (ks||Object.keys(so('wall'))))s[k]=1;S.wN=wallNew().length;persist(true);},wallNew,stN,realDay});
/* «Ролики дня» (M8 п. 3.1, модуль QUEST, механика Б): лесенка 2 → 3 → 3 → 4 → 6 💎 вместо плоских «+3 💎 × 5», пауза 120 с, сброс в полночь по nowMs().
   ok/adOk = adOk() shell.js (общего предела роликов нет с 01.10). Цепочку QUEST не включаем — её роль играет Планёрка.
   «Договор со спонсором» удваивает ступеньку. Состояние — S.quest (облако: QUEST.merge в mergeSave). STAT: place('ladder') перед роликом, lad {n} после. */
const LAD=[2,3,3,4,6],LAD_GAP=120;
// M31: после 5 ступеней — «бонус-ролик» +LAD_FLAT 💎 (со спонсором ×2) раз в LAD_FLAT_GAP с, весь день без предела; S.adF = {d:день, n:сколько, t:мс последнего}
const LAD_FLAT=1,LAD_FLAT_GAP=1200;   // M31: подбор симулятором (2 💎 / 15 мин и паузы мест вдвое короче давали net_ad +18 % — выше предела 15 %)
const sponsorOn=()=>payOwn('sponsor');
function questInit(){if(typeof QUEST==='undefined')return;
  QUEST.init(S,{save:()=>{try{save();}catch(e){}},toast:t=>toast(t),now:()=>nowMs(),ok:()=>typeof adOk==='function'&&adOk(),adOk:()=>typeof adOk==='function'&&adOk(),
    ad:(ok,fail)=>{try{STAT.place('ladder');}catch(e){}showRewarded(ok,fail);},
    grant:r=>{const n=typeof r==='number'?r:(r&&r.c)||0,x=n*(sponsorOn()?2:1);let i=0;try{i=QUEST._dbg().q.n;}catch(e){}
      GAME.addCr(x,'ad');try{STAT.ev('lad',{n:i});}catch(e){}try{SND.coin();}catch(e){}toast('📺 +'+x+'\u00a0💎'+(i<LAD.length?' · '+L('следующий ролик — ','next video — ')+'+'+LAD[i]*(sponsorOn()?2:1)+'\u00a0💎':''),3000);emit('lad',i);},
    cur:n=>n*(sponsorOn()?2:1)+'\u00a0💎',cls:'btn noenter',chainOn:false,ladder:{r:LAD,gap:LAD_GAP},
    modal:h=>{if(!document.getElementById('ladCss')){const st=document.createElement('style');st.id='ladCss';st.textContent='#mcard.lad-card .qhint{font-size:16px;opacity:.85}#mcard.lad-card .qlad div{font-size:16px}#mcard.lad-card .qlad div b{font-size:19px}';document.head.appendChild(st);}h=h.replace(/^<h2>[^]*?<\/h2>/,'').replace('<h3>','<h2>').replace('</h3>','</h2>');const fh=flatHtml();if(fh!==null)h=h.replace(/<div class="qhint">[^<]*<\/div>/,fh).replace(/<div class="qhint opt">[^<]*<\/div>/,'');   // M31: «На сегодня всё» → бонус-ролики
      modal(h.replace('<div class="row">',(typeof adDayHtml==='function'?adDayHtml():'')+'<div class="row">'));const c=document.getElementById('mcard');if(c){c.classList.add('lad-card');const fb=document.getElementById('ladFlat');if(fb)fb.onclick=()=>{fb.disabled=true;flatWatch();};}return c;},
    close:()=>hideModal(),onChange:()=>emit('change')});}
// состояние лесенки для кнопок: on — можно смотреть сейчас или после паузы; n — пройдено ступенек; next — сколько даст следующая (со спонсором); wait — мс до следующей
function adF(){const d=todayKey();if(!S.adF||typeof S.adF!=='object'||S.adF.d!==d)S.adF={d,n:0,t:0};return S.adF;}
function flatWait(q){const f=adF(),t0=Math.max(+f.t||0,+q.t||0),g=(f.t&&f.t>=(q.t||0)?LAD_FLAT_GAP:LAD_GAP)*1000;return t0?Math.max(0,Math.min(g,t0+g-nowMs())):0;}
function lad(){if(typeof QUEST==='undefined'||!QUEST.ok())return {on:false,n:0,max:LAD.length,next:0,wait:0};let d;try{d=QUEST._dbg();}catch(e){return {on:false,n:0,max:LAD.length,next:0,wait:0};}
  const n=d.q.n|0,sp=sponsorOn()?2:1;if(n>=LAD.length)return {on:typeof adOk==='function'&&adOk(),flat:true,n,max:LAD.length,next:LAD_FLAT*sp,wait:flatWait(d.q),fn:adF().n|0};
  return {on:true,n,max:LAD.length,next:LAD[n]*sp,wait:d.wait|0};}
// бонус-ролик после лесенки: только по кнопке игрока, награда названа на кнопке; пауза не прошла — ничего не показываем
function flatWatch(){const x=lad();if(!x.on||!x.flat||x.wait>0)return false;try{STAT.place('ladder');}catch(e){}
  showRewarded(()=>{const f=adF(),x2=lad();if(!x2.flat||x2.wait>0)return;f.n=(f.n|0)+1;f.t=nowMs();GAME.addCr(x2.next,'ad');try{STAT.ev('lad',{n:LAD.length+f.n});}catch(e){}try{SND.coin();}catch(e){}
    toast('📺 +'+x2.next+'\u00a0💎 · '+L('следующий бонус-ролик — через ','next bonus video in ')+Math.round(LAD_FLAT_GAP/60)+L(' мин',' min'),3000);emit('lad',LAD.length+f.n);try{if(document.getElementById('ladFlat')||document.getElementById('ladFlatW'))QUEST.open();}catch(e){}},()=>{});return true;}
// окно лесенки после 5 ступеней: вместо «На сегодня всё» — бонус-ролик (кнопка или «следующий через N мин»)
function flatHtml(){const x=lad();if(!x.flat||!x.on)return null;
  return '<div class="qhint" style="opacity:1;font-size:16px">'+L('Лесенка на сегодня пройдена. Дальше — бонус-ролики: +','Ladder done for today. Now — bonus videos: +')+x.next+'\u00a0💎 '+L('раз в ','every ')+Math.round(LAD_FLAT_GAP/60)+L(' мин',' min')+'</div>'+
    (x.wait>0?'<div class="qhint" id="ladFlatW">'+L('Следующий через ','Next in ')+Math.max(1,Math.ceil(x.wait/6e4))+L(' мин',' min')+'</div>':'<div class="row"><button class="btn noenter" id="ladFlat">📺 '+L('Бонус-ролик','Bonus video')+' +'+x.next+'\u00a0💎</button></div>');}
// кнопка ролика: пауза — открыть окно лесенки (там обратный отсчёт), иначе — сразу ролик
function ladWatch(){const x=lad();if(!x.on)return false;if(x.wait>0)QUEST.open();else if(x.flat)flatWatch();else QUEST.watch();return true;}
const mmss=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
// подпись кнопки: «📺 +3 💎 · ролик 2 из 5» или «📺 Ролики дня · через 1:45»; после лесенки — «📺 +2 💎 · бонус-ролик» / «📺 Бонус-ролик · через 12 мин»
function ladLabel(){const x=lad();if(!x.on)return '';if(x.flat)return x.wait>0?'📺 '+L('Бонус-ролик','Bonus video')+' · '+L('через ','in ')+Math.max(1,Math.ceil(x.wait/6e4))+L(' мин',' min'):'📺 +'+x.next+'\u00a0💎 · '+L('бонус-ролик','bonus video');
  return x.wait>0?'📺 '+L('Ролики дня','Daily videos')+' · '+L('через ','in ')+mmss(x.wait):'📺 +'+x.next+'\u00a0💎 · '+L('ролик ','video ')+(x.n+1)+L(' из ',' of ')+x.max;}
Object.assign(GAME,{LAD,LAD_FLAT,LAD_FLAT_GAP,lad,ladWatch,flatWatch,ladLabel,ladOpen:b=>{if(typeof QUEST!=='undefined')QUEST.open(b);},
  adCrLeft:()=>{const x=lad();return x.on&&!x.wait?1:0;},adCrN:()=>lad().next||LAD[0]});
questInit();
window.GAME=GAME;window.FMT=FMT;window.NM=NM;
// облако подменило S (другое устройство) — берём его мир
window.onCloud=function(){questInit();if(valid(S.w)&&S.w!==W){try{E.migrate(S.w);}catch(e){}W=S.w;acc=0;}else if(W)S.w=W;try{pkSync();}catch(e){}emit('change');};
window.onSdkReady=function(){offlineCheck();};
})();
