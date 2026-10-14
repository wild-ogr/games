/* rb2-cup-ui — окна «🌐 Живой лиги» (онлайн-турниры hobby-cup), лениво: cupUi() = R2.need('js/rb2-cup-ui.js').
   Крючки рыбалки, сохранение, cupOn/cupLive — блок CUPG в index.html; карточка в «Турнирах» и строки в настройках — блок CUPG2 в конце index.html.
   Журнал: hobby-analytics/release-i/cup-rybak/CUP-RB.md. Местный турнир недели, «Лига двора», кубки и S.week здесь НЕ трогаем.
   Глобальные функции cup* (их зовёт index.html): cupOpen, cupSubmit, cupRowNm, cupTop, cupLeague, cupCh. */
// лестница живой лиги приходит с сервера (lad: лиги снизу вверх, подгрупп s; 4 — низшая): «Деревянная 4» … «Алмазная 1». Цвет — по лиге.
const CUP_LAD0={n:['Деревянная','Каменная','Медная','Бронзовая','Серебряная','Золотая','Алмазная'],ne:['Wooden','Stone','Copper','Bronze','Silver','Gold','Diamond'],s:4};
const CUP_LGC=['#9c6b3c','#8e959c','#c4703a','#cd7f32','#c3ccd4','#f2c94c','#7fd8f5'];
let cupPend=null,cupLast=null,cupWarned=false,cupLgR=null,cupTag=0;
function cupMsk(){const d=new Date(nowMs()+3*3600e3);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();}
const CUP_REST=()=>L('Общая таблица сейчас отдыхает. Игра работает как обычно — загляни попозже.','The shared leaderboard is resting. The game works as usual — try again later.');
function cupOff(){if(cupWarned)return;cupWarned=true;toast(L('Живая лига сейчас недоступна — играй в турнир недели, как обычно','The live league is unavailable — play the weekly contest as usual'),4500);}
// подпись строки: «Иван П.» (если игрок сам включил показ имени) или «Игрок 4821»; соседи-персонажи — с пометкой
function cupRowNm(o){if(!o)return '';if(o.bot)return (LANG==='en'&&o.nm_en?o.nm_en:o.nm)+' ('+L('сосед','neighbour')+')';return o.nm||(L('Игрок ','Player ')+(o.tg||''));}
function cupLad(){const a=cupLgR&&cupLgR.lad,b=CUP.me()&&CUP.me().lad;return a||b||CUP_LAD0;}
function cupTierP(i){const d=cupLad(),s=Math.max(1,d.s||1),n=d.n||[],li=clamp(Math.floor((i||0)/s),0,Math.max(0,n.length-1));return {li:li,sub:s>1?s-(i||0)%s:0,nm:(LANG==='en'&&d.ne?d.ne:n)[li]||''};}
function cupTier(i){const t=cupTierP(i);return t.nm+(t.sub?' '+t.sub:'');}
// значок ступени: кружок цвета лиги + «Медная 3»
function cupTierH(i){const t=cupTierP(i);return `<span style="white-space:nowrap"><span class="cuplg" style="background:${CUP_LGC[t.li%CUP_LGC.length]}"></span>${esc(cupTier(i))}</span>`;}
function cupPlaceN(n){return LANG==='en'?'#'+n:n+'-е место';}
// имя VK — один раз за запуск, когда игрок впервые открывает живую лигу (в сохранение не пишем; сервер хранит «Иван П.», показывает — только если игрок разрешил)
function cupName(cb){if(PLAT!=='vk'||cupVkAsked||!VK)return cb();cupVkAsked=true;
  vkSend('VKWebAppGetUserInfo',{},4000).then(u=>{cupVkNm=(String(u&&u.first_name||'')+' '+String(u&&u.last_name||'')).trim();cb();},()=>cb());}
// вход + лига одним заходом (ответ лиги помним 10 минут); не ответил за 9 с — онлайна нет
const CUP_LGT=600e3;
function cupLogin(cb){if(cupLgR&&CUP.me()&&Date.now()-cupLgR._t<CUP_LGT)return cb(cupLgR);
  cupName(()=>{let done=false;const tm=setTimeout(()=>{if(!done){done=true;cb(null);}},9000);
    CUP.league(r=>{if(done)return;done=true;clearTimeout(tm);if(r){r._t=Date.now();cupLgR=r;if(r.joined)cupTierSet(r.tier||0);}
      else if(cupLgR&&CUP.me()&&CUP.state()==='ok'){cupLgR._t=Date.now()-CUP_LGT+60e3;r=cupLgR;}
      cb(r);});});}

/* --- результат онлайн-рыбалки: строка в итогах, кнопки «Таблица» и «Вызвать друга» --- */
function cupSubmit(g){if(!g||!g.cup)return;const t=g.cup.t,log=cupLog(g),v=log.reduce((s,c)=>s+(c[2]||0),0),d=Date.now()-g.cup.t0;
  const rows=$('mcard')?$('mcard').querySelectorAll('.row'):[],row=rows.length?rows[rows.length-1]:null;
  if(row){const p=document.createElement('p');p.className='goal tipl';p.id='cupRes';p.textContent='📡 '+L('Записываем улов в общую таблицу…','Saving your catch to the shared leaderboard…');
    const cw=$('mcard').querySelector('.coins-won'),at=cw?(cw.nextElementSibling&&cw.nextElementSibling.classList.contains('brk')?cw.nextElementSibling:cw).nextSibling:null;
    if(at&&at.parentNode)at.parentNode.insertBefore(p,at);else row.parentNode.insertBefore(p,row);}
  const job={t:t,v:v,log:log,d:d,g:g};
  // сервер не верит рыбалке быстрее 20 с — придерживаем сдачу до 22 с от выдачи путёвки
  setTimeout(()=>cupSend(job,false),Math.max(0,22000-(Date.now()-(t.got||0))));}
function cupSend(job,late){CUP.submit(job.t,job.v,{log:job.log,d:job.d},r=>{const g=job.g,e=late?null:$('cupRes');
  if(!r){if(!late)cupPend=job;cupEv('sub','net');if(e)e.textContent='📡 '+L('Нет связи с общей таблицей — улов отправим позже.','No connection to the leaderboard — we will send your catch later.');return;}
  if(cupPend===job)cupPend=null;
  if(r.no){cupEv('sub',r.no);if(e)e.textContent='📡 '+L('Общая таблица этот улов не приняла.','The leaderboard did not accept this catch.');return;}
  cupEv('sub','ok');cupLast={v:job.v,mode:job.t.mode};
  if(r.lg&&CUP.me()&&CUP.me().wk){const cs=cupSave();if(!cs.jw){try{STAT.ev('lg',{a:'in',t:r.lg.tr||0});}catch(e){}} // впервые в группе лиги — стартовая ступень
    if((cs.jw||0)<CUP.me().wk){cs.jw=CUP.me().wk;save();}cupTierSet(r.lg.tr||0);} // неделя, в которой игрок в группе лиги (для «Итогов недели» при входе)
  if(g.tourn==='week'&&!g.cup.from&&r.rank>0&&!r.approx){const b=cupWb();b.rk=r.rank;save();}
  if(!e)return;let s='';
  if(r.ch){const mine=(r.ch.ans||[]).filter(a=>a.me)[0],w=mine?mine.win:null,own=cupRowNm(r.ch.own)+' — '+kgTxt((r.ch.own.v||0)/1000);
    s='🤝 '+(w===1?L('Вызов выигран! ','You won the challenge! '):w===0?L('В вызове пока впереди друг: ','Your friend is still ahead: '):L('В вызове ничья! ','The challenge is a draw! '))+own;}
  else{s='📡 '+L('Общая таблица: ','Leaderboard: ')+(r.rank>0?(r.approx?L('примерно ','about '):'')+cupPlaceN(r.rank):L('улов записан','catch saved'));
    if(r.rank>0&&!r.best&&r.bv>0)s+=' · '+L('твой лучший улов — ','your best — ')+kgTxt(r.bv/1000);
    if(r.lg&&r.lg.pts>=0)s+=' · 🏅 '+L('очки лиги: ','league points: ')+r.lg.pts;}
  e.textContent=s;
  const b=document.createElement('div');b.className='row2 cuprb';b.innerHTML=`<button class="btn blue noenter" id="cupRT">🏆 ${L('Таблица','Leaderboard')}</button>`+(r.ch?'':`<button class="btn blue noenter" id="cupRC">🤝 ${L('Вызвать друга','Challenge a friend')}</button>`);
  e.parentNode.insertBefore(b,e.nextSibling);const back=()=>afterRes(g,'again');
  $('cupRT').onclick=()=>cupTop(job.t.mode==='week'?'week':'day',back);if($('cupRC'))$('cupRC').onclick=()=>cupCh(back,true);});}
function cupFlush(){const p=cupPend;if(p&&Date.now()-(p.t.got||0)<((p.t.exp||0)*1000-60e3))cupSend(p,true);else cupPend=null;}

/* --- окно «Живая лига» --- */
function cupOpen(){STAT.screen('week');const tag=++cupTag,fresh=!!(cupLgR&&CUP.me()&&Date.now()-cupLgR._t<CUP_LGT);
  if(!fresh){modal(`<h2>🌐 ${L('Живая лига','Live league')}</h2><p id="cupLoad">${L('Загружаем общую таблицу…','Loading the shared leaderboard…')}</p><div class="row"><button class="btn" id="mCancel">${L('Закрыть','Close')}</button></div>`);$('mCancel').onclick=hideModal;}
  cupLogin(r=>{if(tag!==cupTag)return;if(!fresh&&!(modalOn&&$('cupLoad')))return; // игрок закрыл окно или ушёл в другое
    if(!r){cupEv('open','no');cupOff();cupFb=true;try{openWeek();}finally{cupFb=false;}return;}
    cupEv('open','ok');cupFlush();
    if(!cupSave().ask)return cupIntro();
    const cl=(r.claims||[]).filter(c=>c&&c.wk>(cupSave().lgw||0));if(cl.length)return cupClaim(cl[0]);
    if(cupHash){const c=cupHash;cupHash='';return cupCh(cupOpen,false,c);}
    cupWin();});}
// знакомство: имя по умолчанию скрыто (политика 13.10), показать — только если игрок сам выберет
function cupIntro(){const me=CUP.me()||{},tg=me.tg||4821,nmS=me.nm?'«'+esc(me.nm)+'»':L('«Иван П.»','"Ivan P."');
  modal(`<h2>🌐 ${L('Живая лига','Live league')}</h2>
    <p>${L('Здесь ты соревнуешься с живыми рыбаками: общая Рыбалка дня, общий турнир недели, лига по 30 человек и вызов другу. Условия у всех одинаковые — место, снасть и даже рыба в воде.','Compete with real anglers: a shared daily contest, a shared weekly contest, leagues of 30 and friend challenges. Everyone gets the same place, tackle and even the same fish.')}</p>
    <p class="about">${L('В таблицах ты — ','On leaderboards you appear as ')}<b>«${L('Игрок','Player')} ${tg}»</b>. ${L('Можно показывать имя и первую букву фамилии: ','You can show your first name and surname initial instead: ')}<b>${nmS}</b>. ${L('Поменять можно в настройках ⚙.','Change it any time in ⚙ Settings.')}</p>
    <p class="about">${L('Если в группе мало людей, её добивают соседи — персонажи игры, они подписаны «(сосед)».','If a group has few people, game characters fill it — they are marked «(neighbour)».')}</p>
    ${CUP.shown()?'<p class="goal tipl">'+L('Сейчас в таблицах видно твоё имя — так ты выбрал раньше.','Your name is currently shown — you chose this before.')+'</p><div class="row"><button class="btn green" id="cupNmY">'+L('Оставить имя','Keep my name')+'</button><button class="btn noenter" id="cupNmN">'+L('Скрыть имя','Hide my name')+'</button></div>'
      :`<div class="row"><button class="btn green" id="cupNmN">${L('Без имени — дальше','Stay anonymous')}</button><button class="btn noenter" id="cupNmY">${L('Показывать имя','Show my name')}</button></div>`}`);
  const go=on=>{cupSave().ask=1;save();if(!!CUP.shown()!==on)CUP.showName(on,()=>{});cupEv('name',on?1:0);cupOpen();};
  $('cupNmY').onclick=()=>go(true);$('cupNmN').onclick=()=>go(false);}
// награда за неделю (п.11): число «рыбалок» с сервера (ступень недели и итог в группе) × монеты одной рыбалки на самом дальнем месте игрока
function cupRwC(rw){if(!(rw>0))return 0;let t=30;try{t=TRIP_C[topPlace()]||30;}catch(e){}return Math.max(5,Math.round(rw*t/5)*5);}
// статистика рангов (п.12, обезличенная STAT): итог недели — один раз на неделю; «забрал» — отдельным событием
function cupTierSet(t,mv){const cs=cupSave();if(t>=0&&(cs.tr!==t||(mv&&cs.mv!==mv))){cs.tr=t;if(mv)cs.mv=mv;save();}}
function cupClaim(c,back){const up=c.res==='up',dn=c.res==='down',top=c.res==='top',got=c.wk<=(cupSave().lgw||0),coins=got?0:cupRwC(c.rw);back=back||cupOpen;
  if(!got&&(cupSave().sw||0)<c.wk){cupSave().sw=c.wk;save();try{STAT.ev('lg',{a:'wk',f:c.tr,t:c.to,p:c.pl,o:c.pts||0,r:coins,h:c.nh||0,m:c.res});}catch(e){}}
  cupTierSet(c.to,c.res);
  modal(`<h2>🏅 ${L('Итоги недели','Week results')}</h2><div class="cupbig">${up||top?'🥇':'🏅'}</div>
    <p>${L('Живая лига, прошлая неделя: ','Live league, last week: ')}<b>${cupPlaceN(c.pl)}</b> ${L('в группе','in your group')} · ${cupTierH(c.tr)}</p>
    <p class="goal tipl">${up?L('Ты поднимаешься: ','You move up: ')+cupTierH(c.to)+'!':top?L('Ты на вершине лестницы — держись!','You are at the top — hold on!'):dn?L('Спуск: ','Down to: ')+cupTierH(c.to)+L('. Ничего, отыграемся!','. We will win it back!'):L('Остаёшься: ','You stay: ')+cupTierH(c.to)+'.'}</p>
    ${coins?`<p class="coins-won" id="cupClC">+${coinsTxt(coins)}</p><p class="about">${L('Награда за неделю: чем выше ступень, тем больше; за подъём — больше, за спуск — меньше.','Weekly reward: the higher the step, the more; more for moving up, less for moving down.')}</p>`:''}
    <div class="row"><button class="btn green" id="cupClOk">${coins?'💰 '+L('Забрать','Take'):L('Понятно','OK')}</button></div>`);
  if(up||top){try{SND.trophy();FX.burst(.5,.3,30);}catch(e){}}
  $('cupClOk').onclick=()=>{const cs=cupSave();if(c.wk>(cs.lgw||0)){cs.lgw=c.wk;const n=cupRwC(c.rw);if(n){S.coins+=ern('quest',n);try{SND.coin();}catch(e){}}save();try{updCoins();}catch(e){}cupEv('rw',n);try{STAT.ev('lg',{a:'take',t:c.to,r:n});}catch(e){}} // один раз на неделю (lgw), числа — только с сервера
    CUP.claim(c.wk);if(cupLgR&&cupLgR.claims)cupLgR.claims=cupLgR.claims.filter(x=>x.wk!==c.wk);cupEv('claim',c.res);if(back==='none')hideModal();else back();};}
function cupWin(){const me=CUP.me(),ok=!!(me&&me.sd&&me.day===cupMsk()),s=dayState(),t=TOURN_TK,lg=cupLgR||{};
  const dc=ok&&me.sd.day!=null?cupCond(me.sd.day):null,wc=ok&&me.sd.week!=null?cupCond(me.sd.week):null;
  const cond=c=>c?`<b>${esc(nm(PLACES[c.pi]))}</b> · ${L(TOD_N[c.tod][0],TOD_N[c.tod][1]).toLowerCase()} · ${WX_IC[c.wx]} ${L(WX_N[c.wx][0],WX_N[c.wx][1]).toLowerCase()}`:L('Место объявят на старте','The place is announced at the start');
  const can=s.n<1,canAd=!can&&!s.ad&&adOk();if(canAd)STAT.offer('day');
  const wb=cupWb().best||0,rk=cupWb().rk||0;
  modal(`<h2 id="cupWin">🌐 ${L('Живая лига','Live league')}</h2>
    <div class="row2 cuprb"><button class="btn blue noenter" id="cupLgB">🏅 ${L('Лига','League')}${lg.joined||lg.tier?': '+cupTierH(lg.tier):''}</button><button class="btn blue noenter" id="cupChB">🤝 ${L('Вызов другу','Challenge')}</button></div>
    <div class="tcard"><h3>📅 ${L('Рыбалка дня','Fishing of the day')}</h3><p>${cond(dc)}. ${L('Сегодня у всех одно место, одна снасть и одна и та же рыба в воде.','Today everyone gets the same place, tackle and the same fish in the water.')}</p>
      <p>${L('Твой улов сегодня','Your catch today')}: <b>${s.best?kgTxt(s.best/1000):'—'}</b> · ${L('попыток','tries')}: ${can?L('1 бесплатная','1 free'):canAd?L('ещё 1 за рекламу','1 more for an ad'):L('на сегодня всё','none left today')}</p>
      <div class="row">${can?`<button class="btn green" id="dyGo">🎣 ${L('Ловить','Go fishing')}</button>`:canAd?`<button class="btn accent noenter" id="dyAd">📺 ${L('Ещё попытка за рекламу','One more try for an ad')}</button>`:''}<button class="btn blue noenter" id="dyLb">🏆 ${L('Таблица дня','Today\'s board')}</button></div></div>
    <div class="tcard"><h3>🏆 ${L('Общий турнир недели','Shared weekly contest')}</h3><p>${cond(wc)} · <b>${weekLeftTxt()}</b></p>
      <p class="about">${L('Пять забросов, в зачёт — общий вес улова. Снасть казённая: ','Five casts, total weight counts. Same tackle for all: ')}${esc(L(TACKLE.rod.lv[t.rod][0],TACKLE.rod.lv[t.rod][1]).toLowerCase())}, ${esc(L(TACKLE.line.lv[t.line][0],TACKLE.line.lv[t.line][1]).toLowerCase())}, ${esc(L(TACKLE.reel.lv[t.reel][0],TACKLE.reel.lv[t.reel][1]))}; ${L('наживка — червь. Считается лучшая попытка, попыток — 20.','bait — worms. Your best attempt counts; 20 tries.')}</p>
      <p class="about">${L('Очки идут в живую лигу: в понедельник лучшие в группе поднимаются выше. Местный турнир недели и «Лига двора» — отдельно, как прежде.','Points go to the live league: on Monday the best in each group move up. The local weekly contest and the yard league stay as before.')}</p>
      <p>${L('Твой лучший улов','Your best')}: <b>${wb?kgTxt(wb/1000):'—'}</b>${rk?' · '+cupPlaceN(rk):''}</p>
      <div class="row"><button class="btn green" id="wGo">🎣 ${L('Участвовать','Take part')}</button><button class="btn blue noenter" id="wLb">🏆 ${L('Таблица недели','Weekly board')}</button><button class="btn blue noenter" id="wLt">🏅 ${L('Моя лига','My league')}</button></div></div>
    <div class="row"><button class="btn noenter" id="cupBk">🏆 ${L('Турнир недели','Weekly contest')}</button><button class="btn" id="mCancel">${L('Закрыть','Close')}</button></div>`);
  $('mCancel').onclick=hideModal;$('cupBk').onclick=()=>{cupFb=true;try{openWeek();}finally{cupFb=false;}};
  $('wGo').onclick=()=>cupGo('week',false);$('wLb').onclick=()=>cupTop('week');$('wLt').onclick=()=>cupTop('tier');$('dyLb').onclick=()=>cupTop('day');
  if($('dyGo'))$('dyGo').onclick=()=>cupGo('day',false);if($('dyAd'))$('dyAd').onclick=()=>cupGo('day',true);
  $('cupLgB').onclick=()=>cupLeague();$('cupChB').onclick=()=>cupCh();}
function cupSay(msg){modal(`<h2>🌐 ${L('Живая лига','Live league')}</h2><p>${msg}</p><div class="row"><button class="btn green" id="mCancel">${L('Понятно','OK')}</button></div>`);$('mCancel').onclick=()=>cupOpen();}
function cupStart(t,from){startFish(0,{tourn:t.mode==='week'?true:'day',cup:t,from:from||null});} // место/время/погоду поставит крючок startFish по зерну
function cupGo(mode,ad){const s=dayState();if(mode==='day'&&(ad?(s.ad||s.n<1):s.n>=1))return;
  const run=()=>{modal(`<h2>🎣 ${L('Берём путёвку…','Getting your ticket…')}</h2><p id="cupTk">${L('Секунду — сверяемся с общей таблицей.','One moment — checking with the leaderboard.')}</p>`);
    CUP.ticket(mode,t=>{if(!$('cupTk'))return;
      if(t&&t.no){cupEv('tk',t.no);if(t.no==='limit'&&mode==='day'){const s2=dayState();s2.n=Math.max(s2.n,2);s2.ad=1;save();}
        return cupSay(t.no==='limit'?(mode==='day'?L('На сегодня попытки закончились. Завтра — новая Рыбалка дня!','No tries left for today. A new daily contest starts tomorrow!'):L('На этой неделе попытки закончились. В понедельник — новый турнир!','No tries left this week. A new contest starts on Monday!')):L('Чуть-чуть подожди и нажми ещё раз.','Please wait a moment and tap again.'));}
      if(!t){cupEv('tk','net');cupOff();hideModal();cupFb=true;try{openWeek();}finally{cupFb=false;}return;} // сервер молчит — попытку не тратим, обычные турниры
      if(mode==='day'){const s2=dayState();if(ad)s2.ad=1;s2.n++;save();}
      cupEv('tk','ok');cupStart(t,null);});};
  if(ad){if(adHold('day'))return;hideModal();STAT.place('day');showRewarded(run,()=>cupOpen());}else run();}

/* --- таблицы --- */
function cupRows(list){return (list||[]).map(o=>`<div class="lbr${o.me?' me':''}${o.z?' z'+o.z:''}"><b>${o.z==='up'?'▲':o.z==='down'?'▼':''}${o.i}</b><span></span><i>${o.kg?kgTxt(o.v/1000):o.v}</i></div>`).join('');}
function cupFill(box,list){const sp=box.querySelectorAll('.lbr span');for(let i=0;i<sp.length&&i<list.length;i++)sp[i].textContent=cupRowNm(list[i]);}
// таблицы: «Сегодня» (Рыбалка дня), «Неделя» (общий турнир недели), «Моя лига» (тот же турнир недели — только рыбаки твоей ступени лиги, доска w@t)
function cupTop(mode,back){back=back||cupOpen;const dy=mode==='day',tr=mode==='tier',tag=++cupTag;cupEv('top',mode);
  const lg=cupLgR||{},ti=lg.tier||((CUP.me()||{}).tier)||0,tn=cupTier(ti);
  modal(`<h2>${dy?'📅 '+L('Рыбалка дня','Fishing of the day'):tr?'🏅 '+L('Турнир лиги ','League contest ')+cupTierH(ti):'🏆 '+L('Общий турнир недели','Shared weekly contest')}</h2>
    <div class="cuptabs"><button class="btn${dy?' green':''} noenter" id="cupTd">${L('Сегодня','Today')}</button><button class="btn${!dy&&!tr?' green':''} noenter" id="cupTw">${L('Неделя','Week')}</button><button class="btn${tr?' green':''} noenter" id="cupTt">${L('Моя лига','My league')}</button></div>
    <p id="cupLoad">${L('Загружаем…','Loading…')}</p><div class="lb" id="cupLb"></div>${tr?'<p class="about">'+L('Турнир недели внутри своей ступени: только рыбаки лиги «'+esc(tn)+'». Попытки те же, что в общем турнире недели.','The weekly contest within your league tier only. Same tries as the shared weekly contest.')+'</p>':''}<div class="row"><button class="btn" id="mCancel">${L('Назад','Back')}</button></div>`);
  $('mCancel').onclick=back;$('cupTd').onclick=()=>{if(!dy)cupTop('day',back);};$('cupTw').onclick=()=>{if(dy||tr)cupTop('week',back);};$('cupTt').onclick=()=>{if(!tr)cupTop('tier',back);};
  CUP.top(dy?'day':'week',dy?'d':tr?'w@t':'w',r=>{if(tag!==cupTag||!$('cupLb'))return;const e=$('cupLoad');
    if(!r){e.textContent=CUP_REST();return;}
    const top=r.top||[],ar=(r.around||[]).filter(o=>!top.some(x=>x.i===o.i&&x.me===o.me&&x.v===o.v)),all=top.concat(ar);all.forEach(o=>o.kg=1);
    $('cupLb').innerHTML=cupRows(top)+(ar.length?'<div class="lbgap">· · ·</div>'+cupRows(ar):'');cupFill($('cupLb'),all);
    const m=r.me;e.textContent=!top.length?L('Пока пусто — будь первым!','Empty so far — be the first!'):!m?L('Сыграй турнир — и появишься в таблице.','Play the contest to appear here.')
      :m.approx?L('Ты примерно на '+m.i+'-м месте из ≈ '+m.n,'You are at about #'+m.i+' of ≈ '+m.n)+(m.gap?L('. До таблицы не хватает ','. To reach the board you need ')+kgTxt(m.gap/1000):'')+'.'
      :L('Твоё место: ','Your place: ')+m.i+' · '+kgTxt(m.v/1000);
    if(!dy&&!tr&&m&&!m.approx&&m.i>0){const b=cupWb();if(b.rk!==m.i){b.rk=m.i;save();}}});}
function cupLeague(back){back=back||cupOpen;const tag=++cupTag;cupEv('lg','');
  modal(`<h2 id="cupLgT">🏅 ${L('Живая лига','Live league')}</h2><p id="cupLoad">${L('Загружаем…','Loading…')}</p><div class="lb" id="cupLb"></div><p class="about" id="cupLgN"></p><div class="row"><button class="btn" id="mCancel">${L('Назад','Back')}</button></div>`);
  $('mCancel').onclick=back;
  CUP.league(r=>{if(tag!==cupTag||!$('cupLb'))return;const e=$('cupLoad');
    if(!r){e.textContent=CUP_REST();return;}r._t=Date.now();cupLgR=r;
    $('cupLgT').innerHTML='🏅 '+L('Лига ','League ')+cupTierH(r.tier);
    if(!r.joined){e.textContent=L('Сыграй общую Рыбалку дня или общий турнир недели — и попадёшь в группу из 30 рыбаков. В понедельник лучшие поднимаются в лигу выше.','Play the shared daily or weekly contest to join a group of 30 anglers. On Monday the best move up a league.');return;}
    e.textContent=L('Твоя группа на этой неделе. Очки — за общие Рыбалку дня и турнир недели: чем ближе улов к золотому нормативу, тем больше. Соседи — персонажи игры, добивают группу, пока людей мало.','Your group this week. Points come from the shared daily and weekly contests. Neighbours are game characters who fill the group while there are few people.');
    if(r.rwd&&r.rwd.k){const k=r.rwd.k[clamp(r.tier||0,0,r.rwd.k.length-1)],z=r.rwd.z||{};e.insertAdjacentHTML('afterend','<p class="goal tipl" id="cupRwL">💰 '+L('Награда за неделю на этой ступени: ','Weekly reward at this step: ')+'<b>'+coinsTxt(cupRwC(k))+'</b> · '+L('подъём','moving up')+' '+coinsTxt(cupRwC(k*(z.up||1.5)))+' · '+L('спуск','moving down')+' '+coinsTxt(cupRwC(k*(z.down||.5)))+'</p>');}
    $('cupLb').innerHTML=cupRows(r.rows);cupFill($('cupLb'),r.rows||[]);
    $('cupLgN').textContent=L('Неделя: ','Week: ')+weekLeftTxt()+'. '+(r.up?'▲ — '+L('поднимутся на ступень выше','move up a step'):'')+(r.up&&r.down?', ':'')+(r.down?'▼ — '+L('опустятся на ступень','move down a step'):'')+(r.up||r.down?'.':'');});}

/* --- вызов другу: код по последнему результату; друг играет ту же рыбалку (то же зерно) --- */
function cupCopy(txt){try{if(PLAT==='vk'&&VK){vkSend('VKWebAppCopyText',{text:txt}).catch(()=>{});return true;}}catch(e){}
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).catch(()=>{});return true;}}catch(e){}
  try{const i=document.createElement('input');i.value=txt;document.body.appendChild(i);i.select();const ok=document.execCommand('copy');document.body.removeChild(i);return ok;}catch(e){}return false;}
function cupCh(back,make,code){back=back||cupOpen;const mine=cupSave().ch||'';cupEv('ch',make?'make':code?'link':'open');
  modal(`<h2>🤝 ${L('Вызов другу','Challenge a friend')}</h2>
    <div class="tcard"><h3>${L('Позвать друга','Invite a friend')}</h3><p>${L('Сыграй общий турнир, получи код и отправь другу. Он поймает ту же рыбу в том же месте — у кого улов больше?','Play a shared contest, get a code and send it to a friend. They fish the same fish at the same place — whose catch is bigger?')}</p>
      <div id="cupChMk">${cupLast?`<div class="row"><button class="btn green noenter" id="cupMk">🤝 ${L('Получить код вызова','Get a challenge code')}</button></div>`:`<p class="about">${L('Сначала сыграй общую Рыбалку дня или общий турнир недели.','Play the shared daily or weekly contest first.')}</p>`}
      ${mine?`<div class="row"><button class="btn noenter" id="cupMy">${L('Кто ответил на вызов','Who answered')} ${esc(mine)}</button></div>`:''}</div></div>
    <div class="tcard"><h3>${L('Друг прислал код?','Got a code from a friend?')}</h3><input class="cupin" id="cupCode" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" aria-label="${L('Код вызова','Challenge code')}" value="${esc(code||'')}">
      <div class="row"><button class="btn green noenter" id="cupAcc">🎣 ${L('Принять вызов','Accept the challenge')}</button></div><p class="about" id="cupChMsg"></p></div>
    <div class="row"><button class="btn" id="mCancel">${L('Назад','Back')}</button></div>`);
  $('mCancel').onclick=back;
  const showCode=c=>{$('cupChMk').innerHTML=`<p>${L('Отправь другу этот код. Он введёт его в «Живая лига» → «Вызов другу».','Send this code to your friend. They enter it in «Live league» → «Challenge».')}</p><div class="cupcode" id="cupCodeV"></div>
      <div class="row"><button class="btn noenter" id="cupCp">📋 ${L('Скопировать код','Copy the code')}</button>${PLAT==='vk'&&VK?`<button class="btn blue noenter" id="cupSh">📤 ${L('Отправить другу','Send to a friend')}</button>`:''}</div>`;
    $('cupCodeV').textContent=c;$('cupCp').onclick=()=>toast(cupCopy(c)?L('Код скопирован','Code copied'):L('Запиши код: ','Write the code down: ')+c);
    if($('cupSh'))$('cupSh').onclick=()=>{const app=(/[?&]vk_app_id=(\d+)/.exec(location.search)||[])[1]||'54794412';vkSend('VKWebAppShare',{link:'https://vk.com/app'+app+'#ch='+c},60000).catch(()=>{});};};
  const mk=()=>{const b=$('cupMk');if(b)b.disabled=true;CUP.challenge(r=>{if(!$('cupChMk'))return;if(!r){$('cupChMk').innerHTML='<p class="about">'+CUP_REST()+'</p>';return;}cupSave().ch=r.code;save();showCode(r.code);});};
  if($('cupMk'))$('cupMk').onclick=mk;if(make&&cupLast)mk();
  if($('cupMy'))$('cupMy').onclick=()=>{CUP.chres(mine,r=>{if(!$('cupChMk'))return;const box=$('cupChMk');
    if(!r){box.innerHTML='<p class="about">'+L('Этот вызов уже закончился (вызов живёт неделю) или таблица отдыхает.','This challenge has expired (it lasts a week) or the leaderboard is resting.')+'</p>';return;}
    const a=r.ans||[];a.forEach(o=>o.kg=1);
    box.innerHTML=`<p>${L('Твой улов','Your catch')}: <b>${kgTxt((r.own.v||0)/1000)}</b>. ${a.length?L('Ответили:','Answers:'):L('Пока никто не ответил.','Nobody has answered yet.')}</p><div class="lb" id="cupChL">${a.map(o=>`<div class="lbr"><b>${o.win===1?'▲':o.win===0?'▼':'='}</b><span></span><i>${kgTxt(o.v/1000)}</i></div>`).join('')}</div>`;
    cupFill(box,a);});};
  $('cupAcc').onclick=()=>{const c=String($('cupCode').value||'').replace(/[^A-Za-z0-9]/g,'').toUpperCase(),m=$('cupChMsg');
    if(c.length<6){m.textContent=L('В коде 6 букв и цифр.','The code has 6 letters and digits.');return;}
    m.textContent=L('Проверяем код…','Checking the code…');$('cupAcc').disabled=true;
    CUP.accept(c,t=>{if(!$('cupChMsg'))return;const b=$('cupAcc');if(b)b.disabled=false;
      if(!t){$('cupChMsg').textContent=CUP_REST();return;}
      if(t.no){cupEv('acc',t.no);$('cupChMsg').textContent=t.no==='self'?L('Это твой собственный вызов — отправь код другу.','This is your own challenge — send the code to a friend.')
        :t.no==='done'?L('Ты уже отвечал на этот вызов.','You have already answered this challenge.'):t.no==='limit'||t.no==='often'?L('Чуть-чуть подожди и нажми ещё раз.','Please wait a moment and tap again.'):L('Такого кода нет. Проверь буквы и цифры.','No such code. Please check the letters and digits.');return;}
      cupEv('acc','ok');cupStart(t,t.from||{});});};}

/* «Итоги недели» при входе: игрок был в группе живой лиги (S.cup.jw), неделя закрылась, награда ещё не забрана (S.cup.lgw) → тихий вход и окно.
   Сервер молчит — ничего не показываем и ничего не даём. Номер недели — как на сервере (ISO-неделя по МСК, ГГГГНН). */
function cupWkKey(){const d=new Date(nowMs()+3*3600e3),t=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())),wd=(t.getUTCDay()+6)%7;
  t.setUTCDate(t.getUTCDate()-wd+3);const y=t.getUTCFullYear(),f=new Date(Date.UTC(y,0,4));return y*100+1+Math.round(((t-f)/864e5-3+((f.getUTCDay()+6)%7))/7);}
function cupWeekCheck(){const cs=cupSave(),jw=cs.jw||0;if(!jw||jw<=(cs.lgw||0)||cupWkKey()<=jw)return;
  cupLogin(r=>{if(!r)return;const cl=(r.claims||[]).filter(c=>c&&c.wk>(cs.lgw||0));
    if(cl.length){let n=0;const tm=setInterval(()=>{if(++n>180){clearInterval(tm);return;}if(G||modalOn)return;clearInterval(tm);if(cl[0].wk>(cs.lgw||0))cupClaim(cl[0],'none');},1000);return;} // дождаться, пока игрок закроет другие окна (почта и т. п.)
    if(CUP.me()&&CUP.me().wk>jw+1){cs.lgw=Math.max(cs.lgw||0,jw);save();}});} // через неделю после — итогов нет (скрыт за подделки и т. п.): больше не спрашиваем
