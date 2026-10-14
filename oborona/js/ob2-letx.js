'use strict';
/* ob2-LET (буст_в2.0, 12.10.2026) — по требованию (грузит js/ob2-let.js). План — hobby-analytics/release-i/oborona-boost2/03-events.md §3.1, 3.3, 3.4, 3.6; 05 §4–5.
   «Летопись заставы» (флаг let): ОДНО окно при входе (очередь каркаса OB2.enter) — календарь серии, «за вход сегодня — после любого боя», казна (+🎬 ×2),
     итог недели Соседей (в понедельник, награда сразу), свиток новичка, строка «что нового» (гнездо OB2.slot('let',id,fn(a)) — a.push({t:'html',fn})).
     День серии засчитывается за любой бой (победа или хоть одна одолетая нечисть) или доигранную мини-игру. Кот Баюн прощает 1 пропуск в календарную неделю.
     Соседи: строка «до Марфы 35» в окне победы, место — в Летописи. Сказ месяца — полоска на «Карте». «Сегодня» — в 2 ряда, лишнее под «ещё ›».
   «Неделя новичка» (флаг newb7): 7 свитков воеводы Потапа — один в день, в который сыгран бой; пропуск не сжигает; подарок сразу + кнопка «покажи где».
   События каркаса (для NAKAZ и др.): OB2.emit('let:enter',{d}) — Летопись показана; 'let:day',{d,g,n,nap} — день серии засчитан; 'let:play',dayKey — первая игра дня;
     'let:scroll',k — открыт свиток k (1…7). STAT: mod{m:'ret',a:'chron',d,k,t,x2} · mod{m:'ret',a:'nap',d} · nov{k,dn}. */
(function(){
const LON=()=>!OB2.off('let'),NON=()=>!OB2.off('newb7');
const O=()=>S.o2l&&typeof S.o2l==='object'?S.o2l:null;
const modalOn=()=>$('modal').classList.contains('on');
const STATe=(e,o)=>{try{STAT.ev(e,o);}catch(x){}};

/* ---------- серия входа: день за бой, Кот Баюн ---------- */
const la0=loginAvail;
// пропущенные дни (вчера … до последнего дня игры) — каждый в своей неделе, и не в неделе, где Баюн уже прощал (o.nw)
function avail(){if(!LON())return la0();const L=S.login;if(!L||!L.day)return null;const d=dayKey();if(L.day===d)return null;const gap=dayDiff(L.day,d),o=O()||{};
  let cont=gap===1,nap=0;
  if(gap===2||gap===3){const ws=[];for(let k=1;k<gap;k++)ws.push(weekNo(nowMs()-k*864e5));
    if(ws.every((w,j)=>w!==(o.nw|0)&&ws.indexOf(w)===j)){cont=true;nap=ws[0];}}
  return {idx:cont?(L.n||0)%LOGIN_N:0,cont:cont,lost:!cont&&(L.n||0)>=3?(L.n||0):0,nap:nap,gap:gap};}
window.loginAvail=avail;
// «Завтра» в окне итогов: день серии — за бой, а не за вход
{const tt0=loginTmrText;window.loginTmrText=function(){if(!LON())return tt0();const d=loginTomorrowDay(),m=lgMileTxt(d-1,true);
  return Lg('день '+d+' из '+LOGIN_N+' — за любой бой: +'+fmtGold(loginTomorrow()),'day '+d+' of '+LOGIN_N+' — for any battle: +'+fmtGold(loginTomorrow()))+(m?' + '+m:'');};}

let cr=null;   // что засчитали в этом бою: {G,d,g,x,nap,sc}
function credit(src,g,win){const o=O();if(!o)return;
  if(src==='b'&&!(win||g&&(g.kills|0)>0))return;   // открыл и вышел — не бой
  const d=dayKey();if(!o.pd&&!o.nb&&(S.wins|0)>=10)o.nx=1;   // 10+ побед до первой игры с модулем — не новичок (новое устройство, старое сохранение)
  const first=o.pd!==d;o.pd=d;let r=null;
  if(LON()&&S.login){const x=avail();if(x){const L=S.login;
    if(x.nap){o.nw=x.nap;STATe('mod',{m:'ret',a:'nap',d:x.idx+1});}
    S.login={day:d,n:(x.cont?(L.n||0):0)+1};const gg=loginGive(x.idx);
    r={d:x.idx+1,g:gg,x:loginGive.x||'',nap:!!x.nap};OB2.emit('let:day',{d:r.d,g:gg,n:S.login.n,nap:r.nap});OB2.emit('let',{n:S.login.n});/* ob2-MERGE: договор VKT */}}
  const sc=first&&nbReady();
  cr={G:g,src:src,r:r,sc:sc};
  if(first)OB2.emit('let:play',d);
  save();
  if(src==='m'&&(r||sc))setTimeout(()=>toast(r?Lg('📅 День '+r.d+' засчитан: +','📅 Day '+r.d+' counted: +')+fmtGold(r.g):Lg('📜 Свиток новичка ждёт на «Карте»','📜 A recruit scroll is waiting on the “Map”')),900);}
OB2.on('end',(g,win)=>{try{credit('b',g,win);}catch(e){console.warn('let end',e);}},'let');
if(!LON())OB2.on('end',(g,win)=>{try{credit('b',g,win);}catch(e){}},'newb7');
// мини-игра доиграна — тоже «игра дня» (MG_FIN в mg-core.js; если мини-игры подгружаются позже — оборачиваем при первом удобном случае)
function mgWrap(){if(typeof MG_FIN!=='function'||MG_FIN.let)return;const f0=MG_FIN;
  window.MG_FIN=function(){try{credit('m',null,true);}catch(e){}return f0.apply(this,arguments);};window.MG_FIN.let=1;}
mgWrap();OB2.on('menu',mgWrap);OB2.on('run',mgWrap);

// окно итогов: «📅 День 5 засчитан: +80» — в плашку награды (как прежнее «🎁 За вход: +N»), не занимая общую строку гнезда 'win'
META_MODS.push({id:'let',WIN(g){try{if(!LON()||!cr||cr.G!==g||cr.shown||!cr.r)return;cr.shown=1;const r=cr.r,m=$('mBody'),tr=m&&(m.querySelector('.treasury')||m.querySelector('.card'));if(!tr)return;
  tr.insertAdjacentHTML('beforeend','<br><span class="note letwin">'+Lg('📅 День '+r.d+' засчитан: +','📅 Day '+r.d+' counted: +')+fmtNum(r.g)+(r.nap?Lg(' · 😺 Баюн простил пропуск',' · 😺 Bayun forgave a missed day'):'')+'</span>');
  if(typeof fitModal==='function')fitModal();}catch(e){console.warn('let win',e);}}});
// гнездо 'win' (одна строка на окно, у кого выше prio): «свиток новичка ждёт на карте» — только в день, когда он открылся
OB2.slot('win','newb7',(g)=>{if(!cr||cr.G!==g||!cr.sc)return null;
  return {h:Lg('📜 Свиток '+nbNext()+' из 7 от воеводы Потапа ждёт на «Карте»','📜 Scroll '+nbNext()+' of 7 from Commander Potap is waiting on the “Map”')};},20);

/* ---------- Соседи: «до Марфы 35» в окне победы ---------- */
function tourNow(){try{if(typeof tourTick!=='function')return null;const o=tourTick();if(!o)return null;const tb=tourTable(o,nowMs()),pl=tourPlace(tb),me=tb[pl-1].pts;
  const up=pl>1?tb[pl-2]:null,dn=tb[pl];return {o:o,pl:pl,pts:me,up:up,gap:up?up.pts-me+1:0,lead:dn?me-dn.pts:0};}catch(e){return null;}}
if(typeof tourWinHtml==='function'){const tw0=tourWinHtml;
  window.tourWinHtml=function(g){const h=tw0(g);if(!h||!LON())return h;const t=tourNow();if(!t||tourPend(t.o))return h;
    const add=t.up&&t.up.i>=0&&t.up.i<100?Lg(' · до '+tourNbName(t.up.i).split(' ').pop()+' '+fmtNum(t.gap),' · '+fmtNum(t.gap)+' to '+tourNbName(t.up.i).split(' ').pop()):t.pl===1&&t.lead>0?Lg(' · отрыв '+fmtNum(t.lead),' · lead '+fmtNum(t.lead)):'';
    return add?h.replace(' ›</span>',add+' ›</span>'):h;};}

/* ---------- «Летопись заставы» ---------- */
function kzOk(force){const g=afkGold();return g>=Math.max(30,afkReadyAt())&&(force||nowMs()-(S.afkT||0)>=2*3600e3)?g:0;}
function offer(force){if(!LON()||(typeof G!=='undefined'&&G)||modalOn()||!S.wins)return false;const o=O();if(!o)return false;
  const d=dayKey(),x=avail(),L=S.login||{n:0},T=tourNow(),tp=!!(T&&tourPend(T.o)),kz=kzOk(force)&&(force||o.sh!==d||nowMs()-(S.awayT||0)>=3*3600e3)?afkGold():0;
  if(!force&&o.sh===d&&!kz&&!tp)return false;
  const idx=x?x.idx:Math.max(0,((L.n||1)-1)%LOGIN_N),b0=Math.min(Math.floor(idx/7)*7,LOGIN_N-7),cells=[];
  for(let i=b0;i<b0+7;i++){const m=lgMile(i);cells.push('<div class="dcell'+(i<idx||(!x&&i===idx)?' got':'')+(i===idx?' now':'')+'"><small>'+(i+1)+'</small><b>'+(!x&&i===idx?'✅':lgGold(i))+'</b>'+(m?'<small>'+(m.t==='skin'?'🎨':'⏩')+'</small>':'')+'</div>');}
  const rows=[];
  if(x&&x.nap)rows.push('<div class="letr" data-fit="5"><img class="letic" src="'+ic('sp_cat',64)+'" alt=""><span>'+Lg('<b>Кот Баюн:</b> «Ты пропустил денёк — я проспал за тебя, серия цела. Но на этой неделе — больше ни-ни!»',
    '<b>Bayun the Cat:</b> “You missed a day — I slept it off for you, the streak is safe. But no more this week!”')+'</span></div>');
  const rest=x&&lgRestOk(x);
  if(x&&!x.cont&&x.lost)rows.push('<div class="letr"><span>'+Lg('💔 Серия в '+x.lost+' '+plural(x.lost,'день','дня','дней')+' прервалась','💔 Your '+x.lost+'-day streak broke')+'</span>'+(rest?'<button class="btn ad" id="letRest">'+Lg('🎬 Вернуть за рекламу','🎬 Restore for an ad')+'</button>':'')+'</div>');
  rows.push('<div class="letr"><span>'+(x?Lg('📅 За вход сегодня — после любого боя','📅 Today’s login reward — after any battle'):Lg('📅 День '+(idx+1)+' засчитан ✅','📅 Day '+(idx+1)+' counted ✅'))+
    (x&&lgMile(x.idx)?'<small>'+lgMileTxt(x.idx)+'</small>':'')+'</span>'+(x?'<b>+'+fmtNum(lgGold(x.idx))+'</b>':'')+'</div>');
  const x2=kz&&adOk()&&goldWanted();
  if(kz)rows.push('<div class="letr" id="letKz"><span>'+Lg('💰 Казна собрала, пока тебя не было','💰 The treasury collected while you were away')+'</span><b>+'+fmtNum(kz)+'</b>'+(x2?'<button class="btn ad" id="letKz2">'+Lg('🎬 ×2 за рекламу','🎬 ×2 for an ad')+'</button>':'')+'</div>');
  if(tp){const r=T.o.r;rows.push('<div class="letr"><span>'+Lg('🛡 Соседи: неделя кончилась — ты ','🛡 Neighbours: the week is over — you’re ')+'<b>'+tourPlOn(r.pl)+'</b>!'+
      '<small>'+(r.pl<=3?Lg('грамота · ','certificate · '):'')+(r.tr1>r.tr0?Lg('▲ ступень «','▲ tier “')+tourTierN(r.tr1)+Lg('»','”'):Lg('ступень «','tier “')+tourTierN(r.tr1)+Lg('»','”'))+(r.bo?' · ⏩ +'+fmtBoost(r.bo):'')+'</small></span><b>+'+fmtNum(r.gold)+'</b></div>');}
  else if(T&&T.pts>0)rows.push('<div class="letr lk" data-fit="3" data-lt="tour"><span>'+Lg('🛡 Соседи: ты ','🛡 Neighbours: you’re ')+'<b>'+tourPlOn(T.pl)+'</b>'+(T.up&&T.up.i>=0?Lg(' · до '+tourNbName(T.up.i)+' '+fmtNum(T.gap),' · '+fmtNum(T.gap)+' to '+tourNbName(T.up.i)):'')+'</span><i>›</i></div>');
  if(nbOn())rows.push('<div class="letr lk" data-lt="nb"><span>'+(nbReady()?Lg('🎖 Неделя новичка: свиток '+nbNext()+' из 7 — открыть','🎖 Recruit week: scroll '+nbNext()+' of 7 — open it'):Lg('🎖 Свиток '+nbNext()+' из 7 откроется после боя'+(o.nd===d?' завтра':''),'🎖 Scroll '+nbNext()+' of 7 opens after a battle'+(o.nd===d?' tomorrow':'')))+'</span><i>›</i></div>');
  const news=[];OB2.fill('let',news);news.slice(0,2).forEach((n,j)=>{if(n&&n.t)rows.push('<div class="letr lk" data-fit="'+(1-j)+'" data-lt="n'+j+'"><span>'+n.t+'</span>'+(n.fn?'<i>›</i>':'')+'</div>');});
  const tot=(kz||0)+(tp?T.o.r.gold:0);
  showModal('<h3>'+Lg('Летопись заставы','Outpost Chronicle')+'</h3><p class="sub" data-fit="1">'+Lg('День '+(idx+1)+' из '+LOGIN_N+' · неделя '+(Math.floor(b0/7)+1),'Day '+(idx+1)+' of '+LOGIN_N+' · week '+(Math.floor(b0/7)+1))+'</p>'+
    '<div class="days letdays">'+cells.join('')+'</div><div class="letrows">'+rows.join('')+'</div>'+
    '<div class="btns"><button class="btn gold big" id="letGo">'+(tot?'<img src="'+ic('ingot',40)+'">'+Lg('Забрать всё: +','Collect all: +')+fmtNum(tot):Lg('В путь!','Let’s go!'))+'</button></div>','let');
  o.sh=d;if(kz)S.awayT=nowMs();save();
  STATe('mod',{m:'ret',a:'chron',d:idx+1,k:kz||0,t:tp?1:0,x2:x2?1:0,f:force?1:0});OB2.emit('let:enter',{d:idx+1});
  const t0=S.afkT;let kzDone=0;
  const take=m=>{if(kzDone)return 0;const v=afkGold();if(v<=0)return 0;kzDone=1;afkTk={t:S.afkT,g:v,m:m};S.gold+=v*m;ern('chest',v);ern('ad',v*(m-1));S.afkT=nowMs();save();SND.coin();return v*m;};
  const claim=()=>{let g=0,msg=[];if(kz){const v=take(1);if(v){g+=v;}}
    if(tp&&tourPend(T.o)){const res=tourGive(T.o)||{};T.o.ts=Date.now();g+=T.o.r.gold;if(res.plate)msg.push(Lg('«Соседский стяг»!','“Neighbours’ standard”!'));}
    save();setPills();return {g:g,msg:msg};};
  on('letGo',()=>{const c=claim();hideModal();if(c.g)toast('+'+fmtGold(c.g)+(c.msg.length?' · '+c.msg.join(' '):''));SND.up();openTab(curTab);});
  adOn('letKz2','away2',()=>showRewarded(()=>{const v=take(2);const e=$('letKz');if(e&&v)e.innerHTML='<span>'+Lg('💰 Казна ×2 — забрано','💰 Treasury ×2 — collected')+'</span><b>+'+fmtNum(v)+'</b>';
    const gb=$('letGo');if(gb&&!tp)gb.textContent=Lg('В путь!','Let’s go!');setPills();},null,()=>afkLate(t0)));
  if(rest)adOn('letRest','lgrest',()=>showRewarded(()=>{if(restore()){hideModal();toast(Lg('Серия возвращена','Streak restored'));offer(true);}},null,()=>restore()?Lg('серия входа возвращена','login streak restored'):adLateCoins()));
  for(const e of $('mBody').querySelectorAll('[data-lt]'))e.onclick=()=>{SND.click();const k=e.getAttribute('data-lt');claim();hideModal();
    if(k==='tour')openTour('map');else if(k==='nb')nbOpen();else{const n=news[+k.slice(1)];if(n&&n.fn)n.fn();}};
  return true;}
function restore(){const L=S.login;if(!L||!lgRestOk(avail()))return false;S.login={day:retDayAgo(1),n:L.n};S.loginBk=dayKey();save();SND.up();return true;}
LET.offer=offer;

/* ---------- «Неделя новичка»: 7 свитков воеводы Потапа ---------- */
// подарок: g золото, bo — секунды ⏩, tr — трофеи, sl — Слава, sk — облик «Дружинный» Стрельцам, bn — знамя «Новобранец»; go — куда ведёт урок
const NB=[
  {g:100,go:'Forge',ic:'b_forge',t:['Звёзды за победы — не для красоты. Неси их в кузницу: «Закалка» стрельцам — и нечисть заплачет!','Stars from victories aren’t just for show. Take them to the forge: “Tempering” for the archers — and the monsters will weep!'],
    l:['⚒ Кузница: купи «Закалку»','⚒ Forge: buy “Tempering”']},
  {g:150,go:'Village',ic:'b_vil',t:['Деревня кормит заставу. Поставь Частокол — и казна потечёт веселее.','The village feeds the outpost. Build the Palisade — and the treasury will flow faster.'],
    l:['🏡 Деревня: построй Частокол','🏡 Village: build the Palisade']},
  {g:200,bo:900,tr:5,go:'izba',ic:'b_siege',t:['Третий день держишься — значит, наш человек! Загляни в Дозорную избу: мини-игры дают силу на следующий бой.','Day three and still standing — you’re one of us! Drop by the Watch Hut: mini-games give power for the next battle.'],
    l:['🎲 Дозорная изба: сыграй мини-игру','🎲 Watch Hut: play a mini-game']},
  {g:200,sk:1,go:'skin',ic:'b_forge',t:['Держи облик «Дружинный» для Стрельцов. Его дают только новобранцам — потом не достать!','Here’s the “Druzhina” look for the Archers. Only recruits get it — you can’t get it later!'],
    l:['🎨 Надень облик на Стрельцов','🎨 Put the look on the Archers']},
  {sl:200,go:'tal',ic:'sl_fame',t:['Слава воеводы растёт за всё, что делаешь. За уровни — очки Древа: выбери, чем сильна твоя застава.','The commander’s Fame grows with everything you do. Levels give Talent points: choose what makes your outpost strong.'],
    l:['🌳 Древо воеводы','🌳 Commander’s Talents']},
  {g:150,bo:600,go:'Siege',ic:'b_siege',t:['Испытания: осада, Застава дня, Босс недели. Там золото и Слава — каждый день новые.','Trials: the siege, Outpost of the Day, Boss of the Week. Gold and Fame there — new every day.'],
    l:['🏰 Испытания','🏰 Trials']},
  {g:300,bo:600,bn:1,go:'bn',ic:'b_vil',t:['Неделя позади — ты уже не новобранец, а воевода! Держи знамя «Новобранец» на память.','A week behind you — you’re no recruit now, you’re a commander! Here’s the “Recruit” banner as a keepsake.'],
    l:['🚩 Знамя над воротами','🚩 The banner over the gate']}];
function nbOn(){const o=O();return !!(NON()&&o&&!o.nx&&o.pd&&(o.nb|0)<7);}
function nbNext(){const o=O()||{};return Math.min(7,(o.nb|0)+1);}
function nbReady(){const o=O();return !!(nbOn()&&o.pd===dayKey()&&o.nd!==dayKey());}
function nbGiftTxt(r){const a=[];if(r.g)a.push('+'+fmtGold(r.g));if(r.bo)a.push('⏩ +'+fmtBoost(r.bo));if(r.tr)a.push(Lg('🏆 трофеи +'+r.tr,'🏆 trophies +'+r.tr));if(r.sl)a.push(Lg('⭐ Слава +'+r.sl,'⭐ Fame +'+r.sl));
  if(r.sk)a.push(Lg('🎨 облик «Дружинный» Стрельцам','🎨 the “Druzhina” look for the Archers'));if(r.bn)a.push(Lg('🚩 знамя «Новобранец»','🚩 the “Recruit” banner'));return a.join(' · ');}
function nbGive(k){const r=NB[k-1],o=O();if(!r||!o)return;o.nb=k;o.nd=dayKey();
  if(r.g){S.gold+=r.g;ern('gift',r.g);}if(r.bo)boostAdd(r.bo);
  if(r.tr&&typeof slGive==='function')try{slGive({tr:r.tr,i:30+k});}catch(e){}
  if(r.sl&&typeof SLAVA_ADD==='function')SLAVA_ADD(r.sl,'nov');
  if(r.sk){S.skins=S.skins||{};S.skins['arch.druzh']=1;S.skin=S.skin||{};S.skin.arch='druzh';}
  if(r.bn&&typeof xbnGive==='function'){xbnGive('novb');S.bn='novb';}
  save();setPills();STATe('nov',{k:k,dn:typeof STAT!=='undefined'&&STAT.dn?STAT.dn:0});OB2.emit('let:scroll',k);OB2.emit('nb7',{n:k});/* ob2-MERGE: договор VKT */}
function nbGo(r){hideModal();if(r.go==='Forge'||r.go==='Village'||r.go==='Siege')openTab(r.go);
  else if(r.go==='izba'){if(typeof MG_IZBA==='function')MG_IZBA();else openTab('Siege');}
  else if(r.go==='skin'){openTab('Village');if(typeof openSkins==='function')openSkins('arch');}
  else if(r.go==='tal'){if(typeof openSlava==='function'&&typeof SL==='function'&&SL())openSlava('tal');else openTab('Village');}
  else if(r.go==='bn')openTab('Village');}
function nbOpen(){if(!nbOn()){toast(Lg('Неделя новичка пройдена!','Recruit week complete!'));return;}const o=O(),k=nbNext(),r=NB[k-1],rd=nbReady();
  const cells=NB.map((x,i)=>'<div class="dcell'+(i<(o.nb|0)?' got':'')+(i===k-1?' now':'')+'"><small>'+(i+1)+'</small><b>'+(i<(o.nb|0)?'✅':i===3?'🏹':i===6?'🚩':'📜')+'</b></div>').join('');
  showModal('<h3>'+Lg('🎖 Неделя новичка','🎖 Recruit week')+'</h3><p class="sub">'+Lg('Свиток '+k+' из 7 от воеводы Потапа','Scroll '+k+' of 7 from Commander Potap')+'</p><div class="days letdays">'+cells+'</div>'+
    (rd?'<div class="say letsay"><img src="'+ic('voevoda')+'" alt=""><div><b class="who">'+Lg('Воевода Потап','Commander Potap')+'</b>'+Lg(r.t[0],r.t[1])+'</div></div><div class="card treasury" style="text-align:center"><b>'+nbGiftTxt(r)+'</b></div>'+
      '<div class="btns"><button class="btn gold big" id="nbGet">'+Lg('Открыть свиток','Open the scroll')+'</button></div>':
      '<p class="sub">'+(o.nd===dayKey()?Lg('Сегодняшний свиток открыт. Следующий — завтра, после любого боя.','Today’s scroll is open. The next one — tomorrow, after any battle.'):Lg('Свиток откроется после любого боя сегодня.','The scroll opens after any battle today.'))+'</p>'+
      '<div class="goal">'+Lg('Дальше: ','Next: ')+nbGiftTxt(r)+'</div><div class="btns"><button class="btn big" id="nbOk">'+Lg('Ясно','Got it')+'</button></div>'),'nb');
  on('nbOk',()=>{hideModal();});
  on('nbGet',()=>{nbGive(k);SND.up();
    showModal('<h3>'+Lg('📜 Свиток '+k+' из 7','📜 Scroll '+k+' of 7')+'</h3><div class="card treasury" style="text-align:center"><b>'+nbGiftTxt(r)+'</b></div>'+
      (k<7?'<p class="sub">'+Lg('Следующий свиток — завтра, после любого боя.','The next scroll — tomorrow, after any battle.')+'</p>':'<p class="sub">'+Lg('Неделя новичка пройдена! Дальше — сам, воевода.','Recruit week complete! From here on — it’s all you, commander.')+'</p>')+
      '<div class="btns"><button class="btn gold big" id="nbGo">'+Lg(r.l[0],r.l[1])+' ›</button><button class="btn ghost" id="nbX">'+Lg('Позже','Later')+'</button></div>','nb');
    on('nbGo',()=>nbGo(r));on('nbX',()=>{hideModal();openTab(curTab);});});}
LET.nbOpen=nbOpen;

/* ---------- облик «Дружинный» (только Стрельцам, только новичкам): синь кафтанов, красные щиты по кромкам, стяг на верхушке ---------- */
if(typeof skinCanvas==='function'){const sk0=skinCanvas;
  window.skinCanvas=function(c,skin,k){if(skin!=='druzh')return sk0(c,skin,k);
    const W=c.width,H=c.height,g=c.getContext('2d');let d;try{d=g.getImageData(0,0,W,H).data;}catch(e){return c;}
    const A=(x,y)=>d[(y*W+x)*4+3],up=Math.max(2,Math.round(k*2));let x0=W,x1=0,y0=H,y1=0;const E=[];
    for(let y=up;y<H;y+=1)for(let x=0;x<W;x+=1)if(A(x,y)>170){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(A(x,y-up)<40)E.push([x,y]);}
    if(!E.length)return c;g.save();g.setTransform(1,0,0,1,0,0);
    const t=document.createElement('canvas');t.width=W;t.height=H;const tg=t.getContext('2d');tg.drawImage(c,0,0);tg.globalAlpha=.34;tg.globalCompositeOperation='color';tg.fillStyle='#2f5aa8';tg.fillRect(0,0,W,H);
    tg.globalAlpha=1;tg.globalCompositeOperation='destination-in';tg.drawImage(c,0,0);g.clearRect(0,0,W,H);g.drawImage(t,0,0);
    let top=E[0];for(const p of E)if(p[1]<top[1])top=p;const px=top[0],py=top[1],L=10*k;
    g.strokeStyle='#4a3020';g.lineWidth=.8*k;g.beginPath();g.moveTo(px,py);g.lineTo(px,py-L);g.stroke();
    g.beginPath();g.moveTo(px,py-L);g.lineTo(px+8*k,py-L+1.6*k);g.lineTo(px+6*k,py-L+3.2*k);g.lineTo(px+8*k,py-L+4.8*k);g.lineTo(px,py-L+5*k);g.closePath();g.fillStyle='#c8281e';g.fill();
    g.fillStyle='#ffd84a';g.beginPath();g.arc(px+3.2*k,py-L+2.5*k,1*k,0,Math.PI*2);g.fill();
    const mid=E.filter(p=>p[1]>y0+(y1-y0)*.3&&p[1]<y1-(y1-y0)*.25);
    for(let i=0;i<Math.min(3,mid.length);i++){const p=mid[Math.floor((i+.5)*mid.length/3)],r=2.3*k;
      g.beginPath();g.moveTo(p[0]-r,p[1]-r*.4);g.quadraticCurveTo(p[0],p[1]-r*1.1,p[0]+r,p[1]-r*.4);g.quadraticCurveTo(p[0]+r*.8,p[1]+r*.9,p[0],p[1]+r*1.5);g.quadraticCurveTo(p[0]-r*.8,p[1]+r*.9,p[0]-r,p[1]-r*.4);g.closePath();
      g.fillStyle='#c8281e';g.fill();g.strokeStyle='#ffd84a';g.lineWidth=.45*k;g.stroke();}
    g.restore();return c;};
  if(typeof skinHow==='function'){const h0=skinHow;window.skinHow=function(x){return x&&x.get==='newb'?Lg('награда «Недели новичка» — только новобранцам','a “Recruit week” reward — recruits only'):h0(x);};}}

/* ---------- «Карта»: полоска Сказа месяца и лента «Неделя новичка» ---------- */
OB2.slot('map','let',el=>{const at=el.querySelector('#glBox');if(!at)return;let h='';
  if(nbOn()){const rd=nbReady();h+='<button class="letbar'+(rd?' hot':'')+'" id="letNb"><b>'+Lg('🎖 Неделя новичка','🎖 Recruit week')+'</b><span>'+(rd?Lg('свиток '+nbNext()+' из 7 — открыть!','scroll '+nbNext()+' of 7 — open it!'):Lg('свиток '+nbNext()+' из 7 — после боя','scroll '+nbNext()+' of 7 — after a battle'))+'</span></button>';}
  if(LON()&&typeof slVis==='function'&&slVis()&&typeof slSaga==='function'){const q=slSaga(),nm=SAGA[((q.id%SAGA.length)+SAGA.length)%SAGA.length],st=sagaStep(q.p),rd=sagaReady(q);
    h+='<button class="letbar saga'+(rd?' hot':'')+'" id="letSaga"><b>📜 '+Lg(nm.n,nm.en)+(rd?' 🎁':'')+'</b><span>'+Lg('ступень '+st+'/'+SAGA_N+' · '+slSagaLeft()+' дн.','step '+st+'/'+SAGA_N+' · '+slSagaLeft()+' d')+'</span>'+
      '<i class="lb"><i style="width:'+Math.round((st>=SAGA_N?1:(q.p%SAGA_P)/SAGA_P)*100)+'%"></i></i></button>';}
  if(!h)return;const d=document.createElement('div');d.id='letMap';d.innerHTML=h;el.insertBefore(d,at);
  on('letNb',nbOpen);on('letSaga',()=>openSlava('saga'));},10);

/* ---------- «Сегодня»: фишка «📅 День» открывает Летопись; не больше 2 рядов, остальное — «ещё ›» ---------- */
const rt0=renderToday;let tdAll=false;
// сетка 3×2: больше 6 фишек — пять видно, шестая «ещё ›» раскрывает остальные
function chipsFit(){const box=$('tdBox'),w=box&&box.querySelector('.chips');if(!w||!LON())return;w.classList.add('let2');
  const cs=Array.from(w.querySelectorAll('.chip'));if(tdAll||cs.length<=6)return;for(let i=5;i<cs.length;i++)cs[i].style.display='none';
  const more=document.createElement('button');more.className='chip more';more.textContent=Lg('ещё '+(cs.length-5)+' ›',''+(cs.length-5)+' more ›');w.appendChild(more);
  more.onclick=()=>{SND.click();tdAll=true;for(const c of cs)c.style.display='';more.remove();};}
window.renderToday=function(){rt0.apply(this,arguments);try{if(!LON())return;const box=$('tdBox');if(!box)return;const w=box.querySelector('.chips');if(!w)return;
  const cs=Array.from(w.children),hot=cs.filter(c=>c.classList.contains('hot'));if(hot.length)hot.concat(cs.filter(c=>!c.classList.contains('hot'))).forEach(c=>w.appendChild(c));
  const lg=w.querySelector('[data-td=login]');if(lg)lg.onclick=()=>{SND.click();if(!offer(true))toast(Lg('Летопись откроется после первой победы','The Chronicle opens after your first victory'));};
  chipsFit();}catch(e){console.warn('let today',e);}};
window.addEventListener('resize',()=>{try{if(typeof G!=='undefined'&&G)return;const b=$('tdBox');if(b&&b.querySelector('.chips'))renderToday();}catch(e){}});

/* ---------- стили (только этого модуля) ---------- */
{const s=document.createElement('style');s.textContent=
'.chips.let2{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;overflow:visible}.chips.let2>*+*{margin-left:0}'+
'.chips.let2 .chip{min-width:0;white-space:normal;font-size:13.5px;line-height:1.15;padding:4px 5px;min-height:44px;text-align:center}.chips.let2 .chip.more{font-weight:800}'+
'.letdays{display:flex;gap:4px;margin:4px 0 8px}.letdays .dcell{flex:1 1 0;min-width:0;text-align:center;padding:3px 1px}.letdays .dcell b{display:block;font-size:16px}.letdays .dcell small{display:block;font-size:12px}'+
'.letrows{display:flex;flex-direction:column;gap:6px;margin:0 0 6px}.letr{display:flex;align-items:center;gap:4px 8px;background:rgba(255,255,255,.08);border:1.5px solid rgba(160,120,60,.45);border-radius:12px;padding:5px 9px;text-align:left;font-size:14.5px;line-height:1.2}'+
'.letr>span{flex:1 1 0;min-width:0}.letr .letic{width:34px;height:34px;flex:0 0 34px}.letr>span b{font-weight:800}.letr small{display:block;font-size:12.5px;opacity:.8}.letr>b{white-space:nowrap;color:var(--cGold,#e0a82a);font-size:16px}.letr{flex-wrap:wrap}.letr .btn{flex:1 0 100%;padding:4px 8px;font-size:14px;min-height:36px;margin:0}'+
'.letr.lk{cursor:pointer}.letr>i{font-style:normal;font-weight:800;opacity:.7}.letsay{margin:0 0 6px}'+
'#letMap{display:flex;flex-direction:column;gap:6px;margin:0 0 8px}.letbar{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;width:100%;text-align:left;border-radius:12px;padding:6px 10px;min-height:40px;'+
'background:var(--paper,#2a2440);border:2px solid var(--paperB,#6a5a3a);color:var(--ink,#fff);font:inherit;cursor:pointer}.letbar b{font-size:14.5px}.letbar span{font-size:13px;opacity:.85}'+
'.letbar.hot{border-color:#e0452b;box-shadow:0 0 0 2px #ffc93a}.letbar .lb{flex:1 0 100%;display:block;height:6px;border-radius:3px;background:rgba(120,100,60,.3);overflow:hidden}.letbar .lb i{display:block;height:100%;background:#e0a82a}';
document.head.appendChild(s);}

LET.ready=1;
// файл догрузился, когда «Карта» уже нарисована — перерисовать (Сказ, лента, «Сегодня»)
try{if(!(typeof G!=='undefined'&&G)&&$('tdBox')&&curTab==='Map')renderMap();}catch(e){}
})();
