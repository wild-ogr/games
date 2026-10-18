/* b2-first-am.js — FIRST: окно утром «☀️ Доброе утро», конверты недели новичка, строка «Что будет завтра» (грузится через B2.need из b2-first.js).
   Числа — только договор ECO: 💎 конвертов B2.eco.list('first.w'), подарки K first.bike/first.vitya/first.vitya_m. Конверт недели = подарок дня (вместо клетки CAL, крючок planGift). */
(function(){'use strict';
if(typeof window==='undefined'||typeof document==='undefined')return;   // jsc (симулятор): окно не нужно
const F=window.B2F;if(!F)return;
const E=window.ECON;
const M=v=>typeof FMT!=='undefined'?FMT.money(v):String(Math.round(v));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const mons=n=>n+' '+pl(n,'месяц','месяца','месяцев','month','months'),days=n=>n+' '+pl(n,'день','дня','дней','day','days');
const face=m=>{try{return window.UI&&UI.face?UI.face(m):'';}catch(e){return '';}};
const crTx=n=>n+' 💎';

/* ---- конверты недели новичка (договор ECO: 💎 — ряд list('first.w'), подарки — K first.bike / first.vitya / first.vitya_m) ---- */
const wcr=i=>{const a=window.B2&&B2.eco&&B2.eco.list?B2.eco.list('first.w'):[];const n=a[i]|0;return n>0?B2.eco.give('first.w',1,n):0;};
const kk=(k,d)=>window.B2&&B2.eco?B2.eco.k('first.'+k,d):d;
const noBike=W=>!!(W.me&&W.st==='gig'&&!(W.me.eq&&W.me.eq.bike));
// «Витя привёл клиентов» — лучшей работающей точке спрос ×first.vitya на first.vitya_m игровых месяцев; нет точек — талон до первой точки
function vit(W){const k=kk('vitya',1),m=Math.max(1,Math.round(kk('vitya_m',1)));if(!(k>1))return 0;
  const p=(W.biz||[]).filter(b=>b.st==='w'&&b.ev&&E&&E.BIZ&&E.BIZ[b.t]&&!E.BIZ[b.t].veh&&b.t!=='whs'&&b.t!=='base'&&b.t!=='tk').sort((a,b)=>((b.m&&b.m.r)||0)-((a.m&&a.m.r)||0))[0];
  if(!p){F.st().vt=1;return -1;}p.ev.b2vit=[W.m+m,k];F.st().vt=0;return 1;}
F.vit=vit;
const ENV=[
  {who:['Витя','Vitya'],t:['Велосипед за полцены','A bike at half price'],ok:W=>noBike(W),
    d:['Витя отдаёт свой старый велосипед за полцены. Купить можно, когда удобно — талон не сгорит.','Vitya sells his old bike at half price. Buy it whenever you like — the coupon won’t expire.'],
    give:()=>{if(kk('bike',1)<1)F.st().bk=1;return {bk:F.st().bk?1:0,cr:wcr(0)};}},
  {who:['Людмила','Lyudmila'],t:['Урок: деньги, долг, цель','Lesson: cash, debt, goal'],
    d:['Что я смотрю каждое утро: деньги, долг, цель. Остальное — потом.','What I check every morning: cash, debt, the goal. The rest can wait.'],give:()=>({cr:wcr(1)})},
  {who:['Витя','Vitya'],t:['Приведу клиентов','I’ll bring you customers'],
    d:['Месяц к вашей лучшей точке ходит больше людей — Витя всем рассказал. Нет точки — приведёт к первой.','For a month more people come to your best outlet — Vitya told everyone. No outlet yet — he’ll bring them to your first.'],
    give:W=>({vt:vit(W),cr:wcr(2)})},
  {who:['Соня','Sonya'],t:['Совет банкира','A banker’s tip'],
    d:['Не держите все деньги на счёте «на всякий случай» — запас на месяц, остальное в дело.','Don’t keep all your cash “just in case” — a month’s reserve, the rest goes to work.'],give:()=>({cr:wcr(3)})},
  {who:['Людмила','Lyudmila'],t:['Урок: что такое «прибыль»','Lesson: what “profit” is'],
    d:['Прибыль — это выручка минус все расходы. Деньги на счёте — не одно и то же.','Profit is revenue minus all costs. Cash in the account is not the same thing.'],give:()=>({cr:wcr(4)})},
  {who:['Борис','Boris'],t:['«Спорим?»','“Want to bet?”'],
    d:['Борис спорит, что вы не продержитесь неделю. Осталось два дня.','Boris bets you won’t last a week. Two days to go.'],give:()=>({cr:wcr(5)})},
  {who:['11 «Б»','Class 11B'],t:['«Свой человек»','“One of us”'],
    d:['Неделя в деле — вы свой человек. Гранитная рамка портрета навсегда.','A week in business — you are one of us. A granite portrait frame forever.'],
    give:()=>{let fr=0;try{if(GAME.cosHas&&!GAME.cosHas('fr_granite')){GAME.cosGive('fr_granite');fr=1;}}catch(e){}return {fr,cr:wcr(6)};}}];
// 1-й конверт без велосипеда (уже есть / не гл.1) — шпаргалка вместо него, порядок дней тот же
F.envAt=(i,W)=>i===0&&!(ENV[0].ok(W||GAME.W))?{who:['Людмила','Lyudmila'],t:['Добро пожаловать','Welcome'],d:['Я рядом: что непонятно — нажмите на моё лицо вверху.','I’m here: if something is unclear, tap my face at the top.'],give:()=>({cr:wcr(0)})}:ENV[i];
// талон на велосипед: купить за first.bike от цены (обычная покупка eqBuy по сниженной цене — учёт как всегда)
F.bikeBuy=function(){const W=GAME.W,q=E&&E.EQ&&E.EQ.bike;if(!q||!F.st().bk||!noBike(W))return 'no';const c0=q.c,c=Math.round(c0*kk('bike',1)/100)*100;
  if(W.cash<c)return 'cash';let r='no';try{q.c=c;r=GAME.act('eqBuy','bike');}finally{q.c=c0;}if(r==='ok'){F.st().bk=0;B2.ev('first','bike',{});}return r;};
F.bikeC=()=>{const q=E&&E.EQ&&E.EQ.bike;return q?Math.round(q.c*kk('bike',1)/100)*100:0;};
try{GAME.on('change',()=>{const W=GAME.W;if(W&&F.st().vt&&vit(W)>0)toast('🤝 '+L('Витя привёл клиентов к вашей первой точке','Vitya brought customers to your first outlet'));});}catch(e){}
F.ENV=ENV;
const envTxt=(e,i)=>`${L('Конверт','Envelope')} ${i+1} ${L('из 7','of 7')} · ${esc(L(e.who[0],e.who[1]))}: «${esc(L(e.t[0],e.t[1]))}»`;
F.gotTxt=o=>gotTxt(o);
const gotTxt=o=>{if(!o||!o.r)return '';const r=o.r,a=[];if(r.vt>0)a.push(L('+покупатели в лучшей точке на месяц','more customers at your best outlet for a month'));if(r.vt<0)a.push(L('Витя приведёт клиентов к первой точке','Vitya will bring customers to your first outlet'));if(r.bk)a.push(L('талон: велосипед за ','coupon: a bike for ')+M(F.bikeC()));
  if(r.fr)a.push(L('рамка «Гранит»','granite frame'));if(r.cr>0)a.push('+'+crTx(r.cr));return a.join(' · ');};

/* ---- новость дня: Борис — раз в реальный день (с главы 2; в главе 1 его ещё нет) ---- */
const BN=[['Борис открыл второй ларёк — у вокзала. Говорит, «там поток».','Boris opened a second kiosk — by the station. Says “that’s where the traffic is”.'],
  ['Борис поднял цены на шаурму на 10 %. Посмотрим, кто пойдёт.','Boris raised shawarma prices by 10%. We’ll see who comes.'],
  ['Борис хвастается новой вывеской: «Бобров и Ко». Пока это один ларёк.','Boris shows off a new sign: “Bobrov & Co”. So far it’s one kiosk.'],
  ['Борис взял кредит «на расширение». Соня качает головой.','Boris took a loan “for expansion”. Sonya shakes her head.'],
  ['У Бориса сбежал продавец. Стоит за прилавком сам.','Boris’s clerk quit. He’s behind the counter himself.'],
  ['Борис спрашивал у Вити, сколько вы зарабатываете. Витя не сказал.','Boris asked Vitya how much you make. Vitya didn’t tell.'],
  ['Борис купил подержанную «Газель». Теперь возит товар сам.','Boris bought a used Gazelle van. Now he hauls stock himself.'],
  ['Борис открыл точку напротив вашей. Совпадение?','Boris opened an outlet across from yours. Coincidence?'],
  ['Борис: «К Новому году у меня будет пять точек». Спорим?','Boris: “Five outlets by New Year”. Want to bet?'],
  ['Борис закрыл ларёк у рынка — не окупился.','Boris closed his market kiosk — it didn’t pay off.'],
  ['Борис нанял управляющего и уехал на рыбалку.','Boris hired a manager and went fishing.'],
  ['Борис зовёт на встречу 11 «Б» — «посмотреть, кто чего добился».','Boris invites Class 11B to meet up — “to see who made it”.']];
function news(W){if(!W||W.st==='gig')return '';const s=F.st(),d=F.dayN();if(s.bd!==d){s.bd=d;s.bn=s.bn==null?0:((s.bn|0)+1)%BN.length;}const x=BN[(s.bn|0)%BN.length];return '📰 '+esc(L(x[0],x[1]));}

/* ---- цель: одна плитка «до цели N %» ---- */
const GN={bike:['велосипед','a bicycle'],vend:['кофейный автомат','a coffee machine'],kiosk:['ларёк','a kiosk'],mgr:['первый управляющий','first manager'],ooo:['глава «Сеть»','the Network chapter'],
  base:['стройбаза','builders’ yard'],quarry:['торги за карьер','quarry auction'],nedra:['«Недра»','Mining']};
function goal(W){try{if(W.ned){const n=E.IPO_EQ,v=GAME.value();return n>0?{t:L('До IPO','To IPO'),p:v/n}:null;}
  const g=E.goal&&E.goal(W);if(!g||!GN[g.k]||g.k==='opi')return null;if(g.k==='mgr')return {t:L('Цель: ','Goal: ')+L(GN.mgr[0],GN.mgr[1]),p:-1};
  return {t:L('До цели: ','To the goal: ')+L(GN[g.k][0],GN[g.k][1]),p:g.need>0?g.cur/g.need:0};}catch(e){return null;}}

/* ---- если стали беднее — одна причина и одна кнопка ---- */
function why(W,s){if(!(s.np<0))return null;try{
  if(!W.ned){const hand=(W.biz||[]).filter(b=>b.st==='w'&&E.BIZ[b.t]&&E.BIZ[b.t].hand&&!b.mgr&&!(W.opd&&W.opd[b.t]));
    if(hand.length)return {t:L(`${hand.length} ${pl(hand.length,'точка','точки','точек','outlet','outlets')}, где вы стоите сами, без вас почти не работали, а аренда и зарплаты шли. Управляющий держит точку и без вас.`,`${hand.length} ${pl(hand.length,'outlet','outlets','outlets','outlet','outlets')} you run yourself barely worked without you, while rent and wages kept going. A manager keeps an outlet going when you’re away.`),b:L('👔 Нанять управляющих','👔 Hire managers'),go:()=>{if(window.BIZUI)BIZUI.open('biz');}};
    const loss=(W.biz||[]).filter(b=>b.st==='w'&&b.pm&&b.pm.length>=2&&b.pm.slice(-2).every(x=>x<0));
    if(loss.length)return {t:L(`${loss.length} ${pl(loss.length,'точка','точки','точек','outlet','outlets')} второй месяц в минусе — их стоит перенастроить или продать.`,`${loss.length} ${pl(loss.length,'outlet is','outlets are','outlets are','outlet is','outlets are')} in the red for a second month — retune or sell.`),b:L('🏪 К точкам','🏪 To outlets'),go:()=>{if(window.BIZUI)BIZUI.open('biz');}};}
  if(W.odM>0||s.debt1>(s.debt0||0)+1)return {t:L('Не хватало денег на платежи — банк дал овердрафт под высокий процент.','Cash ran short for payments — the bank gave an expensive overdraft.'),b:L('📅 Деньги на 30 дней','📅 Cash for 30 days'),go:()=>{if(window.CASHUI)CASHUI.open();else UI.go('fin');}};
  return {t:L('Обязательные расходы (жизнь, налоги, аренда) оказались больше выручки.','Fixed costs (living, taxes, rent) were bigger than revenue.'),b:L('📊 Из чего минус','📊 What caused it'),go:null};}catch(e){return null;}}

/* ---- окно ---- */
function hello(){const h=new Date().getHours();return h>=5&&h<12?L('Доброе утро','Good morning'):h>=12&&h<17?L('Добрый день','Good afternoon'):h>=17&&h<23?L('Добрый вечер','Good evening'):L('Доброй ночи','Good night');}
function giftRow(){try{const p=GAME.plan();if(p.got)return null;const n=GAME.CAL[p.cal];return {n,h:`🎁 ${L('Подарок дня','Daily gift')} — ${L('день','day')} ${p.cal+1} ${L('из 7','of 7')}: <b>${n?crTx(n):L('украшение','a decoration')}</b>`};}catch(e){return null;}}
let cur=null;
F.am={show(s,raw){const W=GAME.W;cur={s,raw};F.amC=Date.now();F.st().am=F.dayN();
  const mo=s.months||0,pass=mo?mons(mo):days(s.days||0),pos=s.np>=0,g=goal(W),y=why(W,s),nw=F.nw(),gf=nw&&nw.today?null:giftRow(),env=nw&&nw.today?F.envAt(nw.k,W):null,nws=news(W);
  let h=`<h2>☀️ ${hello()}</h2><div class="say">${face(pos?'happy':'worry')}<div><p>${L(`Вас не было — прошло ${pass}. Главное:`,`You were away — ${pass} went by. The main thing:`)}</p></div></div>
    <div class="tiles"><div class="tile ${pos?'pos':'neg'}"><span>${pos?L('Стали богаче','Richer by'):L('Стали беднее','Poorer by')}</span><b>${pos?'+':'−'}${M(Math.abs(s.np||0))}</b></div>
    ${g?`<div class="tile"><span>${esc(g.t)}</span><b>${g.p<0?'—':Math.max(0,Math.min(100,Math.floor(g.p*100)))+' %'}</b></div>`:`<div class="tile"><span>${L('Деньги','Cash')}</span><b>${M(W.cash)}</b></div>`}</div>`;
  if(y)h+=`<div class="b2f-why"><p>⚠ ${y.t}</p>${y.go?`<button class="btn noenter" id="b2fFix">${y.b}</button>`:''}</div>`;
  const rows=[];if(gf)rows.push(gf.h);if(env)rows.push('🎁 '+L('Подарок дня','Daily gift')+' — ✉️ '+envTxt(env,nw.k)+`<br><small class="mut">${esc(L(env.d[0],env.d[1]))}</small>`);if(nws)rows.push(nws);
  if(s.aucW&&s.aucW.length)rows.unshift('🔨 <b>'+L('Торги ждут вас','Auctions waiting for you')+'</b>: '+s.aucW.slice(0,3).map(a=>esc(NM.reg(a.r)+' — '+NM.good(a.g).toLowerCase()+', '+L('ещё ','')+days(Math.max(1,a.end-W.t))+L('',' left'))).join('; ')+'. '+L('Карта → регион.','Map → region.'));   /* b2-merge: торги своих находок (FIX Т-2) не теряются в окне утром */
  if(rows.length)h+=`<div class="clist b2f-rows">${rows.map(r=>`<div><span>${r}</span></div>`).join('')}</div>`;
  h+=B2.html('morning',{W,off:s});
  const more=GAME.offMore?GAME.offMore():0,mgr=typeof mgrOwn==='function'&&mgrOwn(),ad=typeof adOk==='function'&&adOk();
  const take=!!(gf||env);
  h+=`<div class="row"><button class="btn noenter" id="b2fMore">📊 ${L('Подробнее','Details')}</button>${more>0&&(mgr||ad)?`<button class="btn noenter" id="b2fExt">${mgr?'⏱ '+L('Продлить смену','Extend the shift'):'📺 '+L('Продлить смену за рекламу','Extend the shift for an ad')}<small> +${days(more)}</small></button>`:''}</div>
    <div class="row"><button class="btn green" id="b2fGo">${take?'🎁 '+L('Забрать и к делам','Take it and get to work'):L('К делам','Back to work')}</button></div>`;
  modalH(h);try{window.modalRe=null;}catch(e){}
  B2.ev('first','am',{np:pos?1:0,y:y?1:0,g:gf?1:0,e:env?nw.k+1:0});
  const $=id=>document.getElementById(id),done=()=>{F.amDone();};
  $('b2fGo').onclick=()=>{try{SND.tap();}catch(e){}let got=[];
    if(gf){const n=GAME.planGift();if(n)got.push('+'+crTx(n));}
    if(env){let o=null;if(!GAME.plan().got){F.amOpen=1;try{GAME.planGift();}finally{F.amOpen=0;}o=F.lastEnv;}else o=F.nwOpen();const t=gotTxt(o);got.push('✉️ '+(t||L('конверт открыт','envelope opened')));}
    hideModal();done();if(got.length)toast(got.join(' · '));if(!s.ext&&window.BIZUI&&BIZUI.offAd)BIZUI.offAd();};
  $('b2fMore').onclick=()=>{hideModal();done();B2.ev('first','amMore',{});raw();};
  if($('b2fFix'))$('b2fFix').onclick=()=>{hideModal();done();B2.ev('first','amFix',{});try{y.go();}catch(e){}};
  if($('b2fExt'))$('b2fExt').onclick=()=>{if(!mgr){if(typeof adHold==='function'&&adHold('shift'))return;hideModal();done();try{STAT.place('shift');}catch(e){}
      showRewarded(()=>{try{shiftStat('ad');}catch(e){}GAME.extendShift();},()=>{});}else{hideModal();done();try{shiftStat('mgr');}catch(e){}GAME.extendShift();}};},
  // карточки «Сегодня»: конверт (если утреннего окна не было) и талон на велосипед
  today(W){let h='';const x=F.nw();
    if(x&&x.today&&!(W.me&&W.st==='gig'&&(W.me.ng|0)<8))h+=`<button class="card tap noenter b2f-env" data-b2="first:env"><div class="bz-lab">✉️ ${L('Неделя новичка','Newcomer week')}</div><div class="gh"><b>${L('Конверт','Envelope')} ${x.k+1} ${L('из 7','of 7')}</b><span style="margin-left:10px">✉️ ${L('открыть','open')}</span></div><small>${L('Каждый день — новый конверт с подарком. Пропустили день — конверт подождёт.','A new envelope with a gift every day. Miss a day — it will wait.')}</small></button>`;
    if(F.st().bk&&noBike(W))h+=`<button class="card tap noenter b2f-bike" data-b2="first:bike"><div class="bz-lab">🚲 ${L('Талон от Вити','Vitya’s coupon')}</div><div class="gh"><b>${L('Велосипед за ','A bike for ')}${M(F.bikeC())}</b><span style="margin-left:10px">${L('купить','buy')}</span></div><small>${L('Полцены. Курьеру платят больше за смену. Талон не сгорит.','Half price. Couriers earn more per shift. The coupon won’t expire.')}</small></button>`;
    return h;},
  bike(){const r=F.bikeBuy();if(r==='ok'){try{SND.coin();}catch(e){}toast('🚲 '+L('Куплено: велосипед за полцены','Bought: a bike at half price'));}else if(r==='cash')toast(L('Пока не хватает: нужно ','Not enough yet: you need ')+M(F.bikeC()));try{UI.refresh();}catch(e){}},
  // конверт с карточки «Сегодня» (без утреннего окна)
  env(){const x=F.nw();if(!x||!x.today)return;const e=F.envAt(x.k);
    modal(`<h2>✉️ ${L('Неделя новичка','Newcomer week')}</h2><div class="say">${face('happy')}<div><p><b>${envTxt(e,x.k)}</b></p><p>${esc(L(e.d[0],e.d[1]))}</p></div></div>
      <p class="mut" style="font-size:16px">${L('Каждый реальный день — новый конверт, всего 7. Пропустили день — конверт подождёт.','A new envelope every real day, 7 in all. Miss a day — it will wait.')}</p>
      <div class="row"><button class="btn green" id="b2fEnv">✉️ ${L('Открыть','Open')}</button></div>`);
    document.getElementById('b2fEnv').onclick=()=>{let o=null;if(!GAME.plan().got){F.amOpen=1;try{GAME.planGift();}finally{F.amOpen=0;}o=F.lastEnv;}else o=F.nwOpen();hideModal();const t=gotTxt(o);toast('✉️ '+(t||L('Открыто','Opened')));try{UI.refresh();}catch(err){}};},
  // «Что будет завтра» — для окна закрытия месяца
  tomorrow(){const W=GAME.W;if(!W)return '';const a=[],nw=F.nw();
    if(nw&&nw.k<7){const i=nw.today?nw.k+1:nw.k;if(i<7)a.push(L('конверт','envelope')+` ${i+1} ${L('из 7','of 7')} — ${esc(L(F.envAt(i).who[0],F.envAt(i).who[1]))}: «${esc(L(F.envAt(i).t[0],F.envAt(i).t[1]))}»`);}
    else{try{const p=GAME.plan(),c=p.got?p.cal:(p.cal+1)%7,n=GAME.CAL[c];a.push(L('подарок дня','daily gift')+' '+(n?crTx(n):L('— украшение','— a decoration')));}catch(e){}}
    const hh=GAME.shiftH?GAME.shiftH():6;a.push(L(`управляющий держит дела ~${hh} ч — заходите вечером`,`the manager runs things for ~${hh} h — come back tonight`));
    return L('Завтра: ','Tomorrow: ')+a.join(' · ');}};
// свой стиль — один раз (вид — общий: .say .tiles .clist .row; тут только отступы)
try{const st=document.createElement('style');st.textContent='.b2f-why{background:var(--soft2,#f3f5f7);border-left:4px solid var(--bad,#c62828);border-radius:12px;padding:10px 12px;margin:8px 0}.b2f-why p{margin:0 0 8px;font-size:16px}.b2f-rows small{font-size:15px}';document.head.appendChild(st);}catch(e){}
})();
