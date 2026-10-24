/* ===== bb2-first.js — поток NOVICE (буст в2, 13.10.2026): первый поход заново — СТАРТОВАЯ часть (≤6 КБ сжатых). Грузится после bal.js, до game.js. =====
   Сам первый поход (мир ждёт, «иди туда», автоход, кольцо, свист, звёзды) — js/bb2-first1.js: грузится сразу, но только новичку (место 1 не пройдено или походов < 3).
   Флаги (BB2.on): first2 — мир ждёт первого движения, уровни без окна, первая карточка из двух, «страшно, но погибнуть нельзя», свист конусом, честные звёзды;
   tap1 (UP 24.10) — мир НЕ ждёт: живой с первой секунды, нажатие = богатырский «Хрясь!», рука-подсказка на ближайшей нечисти (выключает заморозку first2);
   tapgo — нажатие без ведения = «иди туда»; autowalk — рука сама ведёт после 6 с; pchint — подсказка управления для ПК; short — походы мест 2–6 короче;
   lair — Логово Кощея (место 12) и Чертог Карачуна (место 18) мягче; pw — «сила на карте» по настоящим победителям; res2 — «Завтра» в итогах на виду, окно уровня с 4 карточками;
   naskok / revansh / nedob — «Наскок на 60 секунд», «Реванш босса», «Недобитый» (бой и окна — js/bb2-first2.js, по требованию).
   Сохранение: S.bb2.novice {nk:{d,b,r,g}, rv:{b,c,d,n}, nd:{c,d,t,b,q}}. Событие шины для других потоков (UM): BB2.hook('nv',function(что,G){…}) — wake, lvl, card, ring, boss, end. */
var NV=(function(){
  var o={},PC=!!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);
  /* числа первого захода (не экономика). LAD — место в кампании → секунда босса и поправки (x — опыт, bh — здоровье босса): подобрано ботом, журнал logs/NOVICE.md */
  /* tap1 (UP 24.10): мир живой с 0 с, нажатие = «Хрясь!» (рывок до hitDash и удар радиусом hitR, вожаку/боссу hitBig) первые hitT с первого похода; рука на ближайшей нечисти, пока ударов < hitHint */
  var K=o.K={tapRuns:3,idle:6,waitMax:20,noWin:20,autoLv:2,still:.7,ringHit:.07,ringDur:14,whFirst:2.2,whCd:5.5,whWarn:1,whAng:.55,whR:340,whDmg:.34,
    hitT:25,hitCd:.55,hitR:120,hitDash:90,hitBig:40,hitHint:2},
    LAD=o.LAD={2:{boss:78,x:.85,bh:.55},3:{boss:90,x:.85,bh:.55},4:{boss:120,x:.85,bh:1},5:{boss:140,x:.85,bh:.65},6:{boss:160,x:.85,bh:.4}},
    LAIR={k15:.675,mini20:.8}, /* слот 15 (место 12): здоровье Кощея и мини-босса на Обычной ×0,675; слот 20 (место 18): мини-босс ×0,8, лавина реже и медленнее */
    PWN={7:200,8:200,9:220,10:230,11:240,12:250,13:250,14:250,15:300,16:350,17:550,18:600,19:800,20:950,21:1000,22:1000,23:1000,24:1050,25:1700,26:2000,27:2000,28:2600}; /* место → сила победителей (FIRST-tools/walls.txt), не выше старой */
  function on(f){return BB2.on(f);}
  function st(n,x){BB2.stat(n,x);}
  function sv(){return BB2.s('novice');}
  function PCT(){return L('Клавиши W A S D или стрелки. Можно мышью: зажми и веди. Бьёт он сам!','Use W A S D or the arrow keys. Or the mouse: hold and drag. He attacks on his own!');}
  o.pc=PC;
  BB2.save('novice',{fix:function(s){['nk','rv','nd'].forEach(function(k){if(s[k]!=null&&!BB2.ob(s[k]))delete s[k];});return s;},
    merge:function(a,b){var m=BB2.mx(a,b);['nk','rv','nd'].forEach(function(k){var x=a[k],y=b[k];if(x&&y)m[k]=(y.d|0)>(x.d|0)?y:x;});
      if(m.nk)m.nk.r=Math.max(a.nk&&a.nk.r||0,b.nk&&b.nk.r||0);return m;}});
  BB2.lazy('nv2',['js/bb2-first2.js'],function(){return !!o.go;});
  o.on=on;o.st=st;o.sv=sv;o.PCT=PCT;
  BB2.lazy('nv1',['js/bb2-first1.js'],function(){return !!o.f1;});
  function nov(){try{return !S.done[ORD[0]]||(S.runs|0)<K.tapRuns;}catch(e){return true;}}
  try{if(nov()&&(on('first2')||on('tapgo')))BB2.need('nv1').then(function(){},function(){});}catch(e){}
  /* новичок жмёт «в поход» раньше, чем догрузился первый поход: ждём до 2,5 с, потом идём как есть (старый первый поход) */
  BB2.hook('march',function(chi,q){if(BB2.ready('nv1')||!nov()||!on('first2')||q&&(q.endless||q.wk||q.dr)||o.mw)return;o.mw=1;var done=0,go=function(){if(done)return;done=1;BB2.go(chi);};
    BB2.need('nv1').then(go,go);setTimeout(go,2500);return true;});

  /* ---------- подсказка управления по устройству ---------- */
  try{if(PC&&on('pchint')&&typeof TUT!=='undefined')TUT[0].t=PCT();}catch(e){}
  BB2.hook('hint',function(){if(PC&&on('pchint'))return L('Клавиши W A S D или стрелки, можно мышью: зажми и веди.','W A S D or arrows, or hold and drag the mouse.');});

  /* ---------- короткие походы мест 2–6 (первый проход, Обычная) ---------- */
  function ladder(g,pos){var d=LAD[pos],b=g.short,ob=b?b.boss:RUN_BOSS_T;if(!d||d.boss>=ob)return;var k=d.boss/ob,r=1/k,s={ts:1,xp0:1,xp:1,bossSpd:1,pack:0,coin:1,kill:1,prop:28},i,df=g.df;
    if(b)for(i in b)s[i]=b[i];else s.nvE=1;
    var cur=Math.min(b&&b.bossHp||9,df&&df.bossHp||9);if(cur===9)cur=1;
    s.boss=d.boss;s.ts*=r;s.xp0=s.xp=Math.max(s.xp,df&&df.xp||1)*r*d.x;s.coin*=r;s.kill*=r;s.prop*=k;s.bossHp=cur*d.bh;
    for(i=0;i<g.ev.length;i++)g.ev[i].t=g.t0+(g.ev[i].t-g.t0)*k;g.short=s;g.propT=s.prop;g.nvL=pos;}

  /* ---------- начало похода ---------- */
  BB2.hook('run',function(g){g.nv=null;if(BB2.nvMode)return; /* «Наскок»/«Реванш» — свой подписчик в bb2-first2.js */
    var camp=g.dif==='n'&&!g.endless&&!g.daily&&!g.weekly,pos=chPos(g.chi);
    if(camp&&!S.done[g.chi]&&pos>1&&on('short'))ladder(g,pos);});
  BB2.hook('frame',function(dt,g){nedobTick(g,dt);});

  /* ---------- окна: уровень (2 карточки без цифр; 4 карточки — кнопки не ниже края), итоги (звёзды, «Завтра») ---------- */
  function fit(m){var t=m.querySelector('.lvtools'),i,cl=['nv4','nv4b'];if(!t)return;
    for(i=0;i<cl.length;i++){if(t.getBoundingClientRect().bottom<=Math.min(window.innerHeight,m.getBoundingClientRect().bottom)-14&&m.scrollHeight<=m.clientHeight+1)return;m.classList.add(cl[i]);}}
  BB2.hook('modal',function(kind,m){var g=typeof G!=='undefined'?G:null;m.classList.remove('nv2','nv4','nv4b');
    if(kind==='level'&&on('res2')&&m.querySelectorAll('.upc').length>3)fit(m);
    if(kind==='result'&&g&&on('res2')&&!g.endless&&!g.daily&&!g.weekly&&!g.nvm){var t=tmr(g);if(t)BB2.put(m,'top','<div class="nvtm"><b>'+L('📅 Завтра:','📅 Tomorrow:')+'</b> '+t+'</div>','nvTm');}});
  function tmr(g){var s=sv(),r=s.rv,a=[];try{if(r&&EN[r.b]&&on('revansh')&&r.d>dayIdx())a.push(L(qt(EN[r.b].n)+' вернётся за реваншем','the '+EN[r.b].n+' returns for a rematch'));
      else if(!g.win&&s.nd&&on('nedob'))a.push(L(qt(EN[CH[s.nd.c].boss].n)+' будет ждать','the '+EN[CH[s.nd.c].boss].n+' will be waiting'));a.push(tomorrowLine(1).split(' · ')[0]);}catch(e){}return a.join(' · ');}
  try{var css=document.createElement('style');css.textContent='.nvtm{background:rgba(255,216,74,.14);border:1px solid rgba(255,216,74,.45);border-radius:12px;padding:6px 9px;margin:0 0 8px;font-size:13.5px;line-height:1.3;text-align:left}'+
    '#mBody.nv4 .invmini{display:none}#mBody.nv4 .upc{padding:5px 9px}#mBody.nv4 .upc img{width:36px;height:36px}#mBody.nv4 .upc b{font-size:15px}#mBody.nv4 .upc span{font-size:12.5px;line-height:1.2}#mBody.nv4 .cards{gap:5px;margin:6px 0}#mBody.nv4 .lvtools{margin-top:6px;gap:5px}#mBody.nv4 .lvtools .btn{min-height:36px;padding:3px 6px;font-size:12.5px}#mBody.nv4>h3{margin-bottom:6px}'+
    '#mBody.nv4b .upc .delta,#mBody.nv4b .tutbox{display:none}#mBody.nv4b .upc img{width:30px;height:30px}#mBody.nv4b .upc{padding:3px 8px}';document.head.appendChild(css);}catch(e){}

  /* ---------- итог похода: честные звёзды первой главы, золото мест 5–6, «Недобитый», «Реванш» ---------- */
  BB2.hook('end',function(g,win){var s=sv(),k;
    if(g.short&&g.short.nvE&&g.reward>0&&ECO.early>0&&ECO.early!==1){var f=1/ECO.early,add=0,q;for(k in g.rw){q=Math.round(g.rw[k]*f);add+=q-g.rw[k];g.rw[k]=q;}g.reward+=add;S.gold+=add;try{ern('lvl',add);}catch(e){}} /* места 5–6: короткий поход, золото как раньше (без ×ECO.early лесенки мест 1–4) */
    if(g.nvm||g.endless||g.daily||g.weekly)return;
    if(win){if(s.nd&&s.nd.c===g.chi)delete s.nd;if(on('revansh')&&(g.fw||!s.rv)&&EN[g.ch.boss])s.rv={b:g.ch.boss,c:g.chi,d:dayIdx()+1,n:1};}
    else if(on('nedob')&&g.t>=5)s.nd={c:g.chi,d:dayIdx(),t:Math.floor(g.t),b:g.bossLeft!=null?Math.max(1,Math.round(g.bossLeft*100)):-1,q:g.quit?1:0};});
  /* поход брошен закрытием игры: в первых походах раз в 15 с запоминаем, где был */
  function nedobTick(g,dt){if((S.runs|0)>=3||g.nvm||g.over||g.endless||g.daily||g.weekly||!on('nedob'))return;g.nvS=(g.nvS||0)+dt;if(g.nvS<15)return;g.nvS=0;
    sv().nd={c:g.chi,d:dayIdx(),t:Math.floor(g.t),b:g.boss&&!g.boss.dead?Math.max(1,Math.round(g.boss.hp/g.boss.max*100)):-1,q:2};try{save();}catch(e){}}

  /* ---------- «Дела на сегодня»: Недобитый, Реванш, Наскок (первыми строками) ---------- */
  function open2(fn,btn){BB2.open('nv2',fn,btn);}
  o.rows=function(){var s=sv(),a=[],d=dayIdx(),x,b;
    x=s.nd;if(x&&on('nedob')&&x.d<d&&CH[x.c]&&!S.done[x.c]&&EN[CH[x.c].boss]){b=EN[CH[x.c].boss].n;var left=Math.max(5,bossTFor(x.c)-x.t),pt=S.pity&&S.pity.c===x.c?(S.pity.n|0)*10:0;
      a.push({k:'nvNd',ic:CH[x.c].boss,t:L('Недобитый: ','Unfinished: ')+b,s:(x.b>0?L('Вчера ему оставалось '+x.b+' % здоровья.','He had '+x.b+'% health left.'):L('Вчера не хватило '+left+' с.','You were '+left+' s short.'))+(pt?L(' Нечисть бьёт на '+pt+' % слабее.',' Monsters hit '+pt+'% weaker.'):L(' Он ждёт.',' He is waiting.')),ready:1,b:L('Добить','Finish him'),
        fn:function(){st('nd_go',{c:x.c});hideModal();startRun(x.c);}});if(s.ndS!==d){s.ndS=d;st('nd_show',{c:x.c,b:x.b});}}
    x=s.rv;if(x&&on('revansh')&&x.d<=d&&EN[x.b]&&CH[x.c]){a.push({k:'nvRv',ic:x.b,t:L('Реванш: ','Rematch: ')+EN[x.b].n,s:L('Ждёт у ворот. День '+x.n+'.','At your gates. Day '+x.n+'.'),ready:1,b:L('На бой','Fight'),fn:function(){var t=this;open2(function(){o.go('rv');},t&&t.tagName?t:null);}});
      if(s.rvS!==d){s.rvS=d;st('rv_show',{b:x.b,n:x.n});}}
    if(on('naskok')&&S.done[ORD[0]]){x=s.nk&&s.nk.d===d?s.nk:null;a.push({k:'nvNk',ic:'i_sword',t:L('Наскок на 60 секунд','60-second Raid'),s:x?L('Сегодня одолено: '+x.b+' · рекорд '+(s.nk.r|0),'Today: '+x.b+' · record '+(s.nk.r|0)):L('Минута боя на рекорд','A minute of battle for a record'),ready:!x,always:1,b:x?L('Ещё разок','Once more'):L('В наскок','Raid'),fn:function(){open2(function(){o.go('nk');});}});}
    return a;};
  function bossTFor(c){var p=chPos(c),d=LAD[p];return p===1?FIRST.boss:d&&on('short')?d.boss:RUN_BOSS_T;}
  BB2.hook('today',function(TL){var a=o.rows(),i;for(i=a.length-1;i>=0;i--)TL.unshift(a[i]);});
  BB2.hook('utroRow',function(A){try{o.rows().forEach(function(r){var w={nvNd:92,nvRv:88,nvNk:30}[r.k]||30;A.push({k:r.k,w:w,ic:r.ic,t:r.t,s:r.s,hot:r.k!=='nvNk'?1:0,fn:r.fn});});}catch(e){}}); /* MERGE: Недобитый/Реванш/Наскок — и в «Утре богатыря» EVENT (флаг utro подменяет «Дела на сегодня») */
  BB2.hook('chips',function(a){var s=sv(),d=dayIdx();if(s.rv&&on('revansh')&&s.rv.d<=d&&EN[s.rv.b])a.push('<i class="hot">⚔ '+L('реванш: ','rematch: ')+EN[s.rv.b].n+'</i>');
    else if(on('naskok')&&S.done[ORD[0]]&&!(s.nk&&s.nk.d===d))a.push('<i class="hot">⚡ '+L('наскок 60 с','60 s raid')+'</i>');});

  /* ---------- Логова (места 12 и 18) и «сила на карте» ---------- */
  try{if(typeof BAL_T!=='undefined'&&typeof BAL!=='undefined'){var r15=BAL_T[15],b15=BAL[15];
      if(r15&&r15.K&&b15)Object.defineProperty(b15,'bossHp',{enumerable:true,configurable:true,get:function(){var d=typeof G!=='undefined'&&G&&G.dif,v=r15.K;return d==='n'?v[0]*(on('lair')?LAIR.k15:1):d==='h'?v[2]:v[1];}});
      var gv=typeof BOSS!=='undefined'&&BOSS.gory_velikan,m0=typeof BAL_MINI!=='undefined'&&BAL_MINI.gory_velikan;
      if(gv&&m0)Object.defineProperty(gv,'mini',{enumerable:true,configurable:true,get:function(){var d=typeof G!=='undefined'&&G&&G.dif;return d==='h'?m0[2]:d==='n'?m0[0]*(on('lair')?LAIR.mini20:1):m0[1];}});
      var lv=typeof EVS!=='undefined'&&EVS.gory_lavina;
      if(lv)['start','step'].forEach(function(f){var old=lv[f];lv[f]=function(g,a,b){var n0=g.en.length,i,e;old.call(lv,g,a,b);if(g.chi!==20||g.dif!=='n'||!on('lair'))return;for(i=n0;i<g.en.length;i++){e=g.en[i];if((i-n0)%3===2)e.dead=true;else{e.spd/=1.3;e.dmg*=.7;}}};});}
    if(typeof BAL_PW==='function'){var pw0=BAL_PW;BAL_PW=function(slot,k){var n=pw0(slot,k),v;if(k&&k!=='n'||!on('pw'))return n;v=PWN[chPos(slot)];return v&&n>0?Math.min(n,v):n;};}}catch(e){try{console.warn('bb2 nv: '+e.message);}catch(x){}}
  /* ---------- tmrw (UP 24.10) «Завтра в деревне»: одно окно после первого законченного похода (VK и ОК, PLAT==='vk'; на Яндексе — нет) ----------
     Подарок за вход завтра, серия 7 дней (облик), новые дела и сундук дня, «Реванш» (если есть); «🔔 Напомнить завтра» (SOC.ntf, только VK — SOC.can('ntf'),
     показ считается показом №1 вопроса SOC: S.soc.ntf={n:1,t}) и «⭐ В избранное» (SOC.fav, со 2-го сеанса — правило VK 2.6.3; в ОК SOC.can('fav') — нет).
     Один раз: S.bb2.novice.tw. Флаг tmrw (?bb2=-tmrw — выключить). Статистика: nv_tmrw {a: show|ntf|ntfok|fav|favok|go, n,f}. */
  function twDue(){try{return on('tmrw')&&PLAT==='vk'&&typeof G!=='undefined'&&!G&&(S.runs|0)>=1&&!!S.done[ORD[0]]&&!sv().tw&&!$('modal').classList.contains('on')&&!adShowing&&!adBusy;}catch(e){return false;}}
  function twNtf(){try{return typeof SOC!=='undefined'&&SOC.ok()&&SOC.can('ntf')&&SOC.ntfDue()&&!(S.soc&&S.soc.ntf&&+S.soc.ntf.n);}catch(e){return false;}}
  function twFav(){try{return typeof SOC!=='undefined'&&SOC.ok()&&SOC.can('fav')&&(S.soc&&S.soc.ses|0)>=2;}catch(e){return false;}}
  function twRow(ic,t,sub){return '<div class="tmw"><span>'+ic+'</span><div><b>'+t+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div></div>';}
  function twShow(){var s=sv(),ls,n,r,rows='',nb,fb,rv=s.rv;s.tw=1;try{save();}catch(e){}
    try{ls=loginState();n=ls.n%7+1;r=loginReward(n);rows+=twRow('🎁',L('Подарок за вход — день ','Login gift — day ')+n,rewardText(r));
      if(n<7&&typeof loginReward(7)==='string')rows+=twRow('🔥',L('7 дней подряд — облик богатыря','7 days in a row — a hero outfit'),L('Не потеряй серию: пропустишь день — начнёшь сначала','Keep the streak: miss a day and it starts over'));}catch(e){}
    rows+=twRow('📋',L('Новые задания и сундук дня','New quests and the daily chest'),'');
    try{if(rv&&EN[rv.b]&&on('revansh'))rows+=twRow('⚔',L(qt(EN[rv.b].n)+' вернётся за реваншем','The '+EN[rv.b].n+' returns for a rematch'),'');}catch(e){}
    nb=twNtf();fb=twFav();
    if(nb){try{S.soc.ntf={n:1,t:Date.now()};save();STAT.ev('soc',{a:'ntf',r:'show',n:1,d:SOC.ntfDay(),w:'tmrw'});}catch(e){}}
    showModal('<h3>'+L('📅 Завтра в деревне','📅 Tomorrow in the village')+'</h3><p class="tmwq">'+L('Нечисть ещё вернётся, богатырь! Приходи завтра — тебя ждёт подарок.','The fiends will be back, hero! Come tomorrow — a gift awaits you.')+'</p>'+rows+
      ((nb||fb)?'<div class="btns tmwb">'+(nb?'<button class="btn ghost" id="twNtf">'+L('🔔 Напомнить завтра','🔔 Remind me')+'</button>':'')+(fb?'<button class="btn ghost" id="twFav">'+L('⭐ В избранное','⭐ Favourite')+'</button>':'')+'</div>':'')+
      '<div class="btns"><button class="btn big" id="twGo">'+L('Дальше','Continue')+'</button></div>','tmrw');
    st('nv_tmrw',{a:'show',n:nb?1:0,f:fb?1:0});
    var b=$('twNtf');if(b)b.onclick=function(){b.disabled=true;st('nv_tmrw',{a:'ntf'});Promise.resolve(SOC.ntf(1)).then(function(y){if(y){st('nv_tmrw',{a:'ntfok'});b.textContent=L('✓ Напомню','✓ Will remind');}else b.disabled=false;},function(){b.disabled=false;});};
    var f=$('twFav');if(f)f.onclick=function(){f.disabled=true;st('nv_tmrw',{a:'fav'});Promise.resolve(SOC.fav()).then(function(y){if(y){st('nv_tmrw',{a:'favok'});f.textContent=L('✓ В избранном','✓ In favourites');}else f.disabled=false;},function(){f.disabled=false;});};
    $('twGo').onclick=function(){try{SND.click();}catch(e){}st('nv_tmrw',{a:'go'});hideModal();};}
  o.tw={due:twDue,show:twShow};
  BB2.hook('menu',function(){if(!on('tmrw')||PLAT!=='vk'||sv().tw||(S.runs|0)<1)return;var k=0,tm=setInterval(function(){if(++k>60||sv().tw){clearInterval(tm);return;}if(twDue()){clearInterval(tm);twShow();}},700);});
  try{var cs2=document.createElement('style');cs2.textContent='.tmwq{margin:0 0 8px;font-size:14.5px;line-height:1.35}.tmw{display:flex;gap:10px;align-items:center;text-align:left;background:rgba(255,216,74,.12);border:1px solid rgba(255,216,74,.4);border-radius:12px;padding:7px 10px;margin:0 0 6px}.tmw>span{font-size:24px}.tmw b{display:block;font-size:14.5px}.tmw small{display:block;font-size:12.5px;opacity:.85;line-height:1.25}.tmwb{gap:6px}.tmwb .btn{flex:1;font-size:14px}';document.head.appendChild(cs2);}catch(e){}

  return o;})();