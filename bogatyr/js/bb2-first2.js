/* ===== bb2-first2.js — поток NOVICE, по требованию (BB2.need('nv2')): «Наскок на 60 секунд» (флаг naskok) и «Реванш босса» (флаг revansh). =====
   Оба — обычный бой главы со своими правилами (G.nvm={k:'nk'|'rv'}); итог свой: endRun не зовётся — звёзды, «пройдено», задания, рекорды глав, «боевой дух» не трогаются.
   Статистика: lvl/end с режимом m='nk'|'rv'; nk_open, nk_end {k,r,w}; rv_open, rv_end {b,n,w,t}. Числа наград — BB2.n('novice.…') (ECO?). */
(function(){
  var o=NV,NK={t:60,ts:4,xp:4,min:20},RV={lo:25,hi:55,n:7,dmg:.08};
  function sv(){return BB2.s('novice');}
  function st(n,x){BB2.stat(n,x);}
  function nkGold(){return BB2.n('novice.nkGold',40);/*ECO?*/}
  function rvGold(n){var a=BB2.n('novice.rvGold',[30,40,50,60,70,80,100]);/*ECO?*/return a[Math.min(a.length,Math.max(1,n))-1]||0;}
  function start(k,chi){var f=STAT.lvl;STAT.lvl=function(l,m,x){return f.call(STAT,l,k,x);};BB2.nvMode={k:k};try{BB2.go(chi);}finally{STAT.lvl=f;BB2.nvMode=null;}}
  function gold(n,x,y){if(!(n>0))return;S.gold+=n;try{ern('lvl',n);}catch(e){}}
  function auto(g){var c;while(g.lvlQ>0){c=rollCards(1)[0];if(c)applyCard(c);g.lvlQ--;}}
  var ax0=addXp;addXp=function(v){ax0(v);if(G&&G.nvm&&!G.over)auto(G);}; /* окно уровня открывается в конце того же кадра — забираем уровень сразу */
  function fin(g,win,html,again){g.over=true;g.paused=true;IN.on=false;try{YG.stop();}catch(e){}musicPlay(null);tipHide();
    try{STAT.end(win?'win':'lose',{t:Math.floor(g.t),k:g.kills,hr:g.heroId});}catch(e){}try{save();}catch(e){}
    if(win)SND.win();else SND.lose();
    setTimeout(function(){if(G!==g)return;showModal(html+'<div class="btns">'+(again?'<button class="btn big" id="nvA">'+again+'</button>':'')+'<button class="btn '+(again?'ghost':'big')+'" id="nvM">'+L('В меню','Menu')+'</button></div>','nv');
      on('nvM',function(){toMenu('Map');});on('nvA',function(){var k=g.nvm.k,c=g.chi;toMenu('Map');start(k,c);});},win&&g.nvm.k==='rv'?900:60);}

  /* ---------- окна перед боем ---------- */
  function openNk(){var s=sv(),d=dayIdx(),x=s.nk&&s.nk.d===d?s.nk:null;st('nk_open',{});
    showModal('<h3>'+L('Наскок на 60 секунд','60-second Raid')+'</h3><p class="sub">'+L('Ровно минута боя в Дремучем лесу. Умения приходят сами — только веди богатыря. Счёт — сколько нечисти одолел.','Exactly one minute of battle in the Deep Forest. Skills come on their own — just lead the hero. Score: monsters defeated.')+'</p>'+
      '<div class="stats s3"><div><b>'+(x?x.b:'—')+'</b>'+L('сегодня','today')+'</div><div><b>'+(s.nk&&s.nk.r|0||'—')+'</b>'+L('рекорд','record')+'</div><div><b>60</b>'+L('секунд','seconds')+'</div></div>'+
      (x&&x.g?'':'<p class="sub">🎁 '+L('Первый наскок дня (от '+NK.min+' одолённых): +'+nkGold()+' золота','First raid of the day ('+NK.min+'+ defeated): +'+nkGold()+' gold')+'</p>')+
      '<div class="btns"><button class="btn big" id="nvGo">'+L('⚡ В наскок','⚡ Raid')+'</button><button class="btn ghost" id="nvBk">'+L('Назад','Back')+'</button></div>','nv');
    on('nvGo',function(){start('nk',ORD[0]);});on('nvBk',function(){hideModal();});}
  function openRv(){var r=sv().rv;if(!r||!EN[r.b]||!CH[r.c]){hideModal();return;}var n=EN[r.b].n,p=PH.boss[r.b];st('rv_open',{b:r.b,n:r.n});
    showModal('<h3>'+L('Реванш: ','Rematch: ')+n+'</h3><div class="unlock"><img src="'+ic(r.b,160)+'"><div><b>'+(p?'«'+p.intro+'»':n)+'</b><span>'+
      L('Зализал раны и стоит у твоих ворот'+(r.n>1?' — и привёл подмогу':'')+'. Поединок один на один, не дольше минуты.','He licked his wounds and stands at your gates'+(r.n>1?' — with backup':'')+'. A duel, one minute at most.')+'</span></div></div>'+
      '<p class="sub">🎁 '+L('День '+r.n+' из '+RV.n+': +'+rvGold(r.n)+' золота за победу. Не одолеешь — не беда, он подождёт.','Day '+r.n+' of '+RV.n+': +'+rvGold(r.n)+' gold for a win. If you lose, no worries — he will wait.')+'</p>'+
      '<div class="btns"><button class="btn big" id="nvGo">'+L('⚔ На бой','⚔ Fight')+'</button><button class="btn ghost" id="nvBk">'+L('Назад','Back')+'</button></div>','nv');
    on('nvGo',function(){start('rv',r.c);});on('nvBk',function(){hideModal();});}
  o.go=function(k){if(k==='nk')openNk();else openRv();};

  /* ---------- начало ---------- */
  BB2.hook('run',function(g){var m=BB2.nvMode,r,i,w;if(!m)return;g.nvm=m;g.nv=null;g.adRevive=false;g.revives=0;g.novHeal=0;g.tut=null;tipHide();g.banner=null;g.bq=[];
    g.nvB={pity:S.pity,best:S.best[g.chi],runs:S.runs,lair:S.lairL?JSON.stringify(S.lairL):''};
    if(m.k==='nk'){g.rng=mulberry(dayIdx()*7919+17);g.short={boss:NK.t,ts:NK.ts,xp0:NK.xp,xp:NK.xp,bossSpd:1,pack:0,coin:0,kill:0,prop:9};g.propT=9;
      g.ev=[{t:14,k:'elite'},{t:30,k:'ring'},{t:44,k:'elite'}];for(i=0;i<6;i++)mkEnemy(g.ch.en[0],Math.cos(i)*VIEW.R*.55,Math.sin(i)*VIEW.R*.55);
      banner(L('Наскок!','Raid!'),L('60 секунд — одолей побольше','60 seconds — defeat as many as you can'),4);return;}
    r=sv().rv||{n:1};m.n=r.n|0||1;g.short={boss:2,ts:1,xp0:1,xp:1,bossSpd:1.15,pack:0,coin:0,kill:0,prop:999};g.propT=999;g.ev=[{t:2,k:'boss'}];if(m.n>1)g.ev.push({t:7,k:'elite'});
    w=g.weapons[0];for(i=0;i<3&&w.lvl<5;i++)applyCard({t:'w',id:w.id,lvl:w.lvl+1});for(i=0;i<3;i++){w=rollCards(1)[0];if(w)applyCard(w);}g.banner=null;g.bq=[];});
  BB2.hook('bossIn',function(e,g){var m=g.nvm;if(!m||m.k!=='rv')return;e.dmg*=1+RV.dmg*(Math.min(RV.n,m.n)-1);m.t0=g.t;m.e=e;});

  /* ---------- кадр ---------- */
  BB2.hook('frame',function(dt,g){var m=g.nvm,e,t,k;if(!m||g.over)return;auto(g);
    if(m.k==='nk'){if(g.t>=NK.t)nkEnd(g,'time');return;}
    e=m.e;if(!e||e.dead||m.t0==null)return;t=g.t-m.t0;k=e.max*Math.max(.02,1-t/RV.lo);if(e.hp<k)e.hp=k;
    if(t>10){k=e.max*(1-(t-10)/(RV.hi-10));if(k<=0){e.invul=0;hitEnemy(e,e.hp+e.max);if(!e.dead&&t>RV.hi+8)rvEnd(g,true);}else if(e.hp>k)e.hp=k;}});
  BB2.hook('pick',function(p,g){if(!g.nvm||p.k!=='chest')return;var c=rollCards(1)[0];if(c)applyCard(c);SND.chest();return true;});
  BB2.hook('down',function(g){var m=g.nvm;if(!m)return;if(m.k==='nk')nkEnd(g,'dead');else rvEnd(g,false);return true;},10);
  BB2.hook('bossDie',function(e,g){var m=g.nvm;if(m&&m.k==='rv')rvEnd(g,true);});
  BB2.hook('drawTop',function(c,g){var m=g.nvm;if(!m||m.k!=='nk'||g.over)return;var t=Math.max(0,Math.ceil(NK.t-g.t)),W=VIEW.W,k=t<=10?'#ff6a5a':'#ffd84a';
    c.font='900 30px '+CVL.font;c.textAlign='center';c.textBaseline='middle';c.lineWidth=6;c.lineJoin='round';c.strokeStyle='rgba(30,10,0,.85)';c.strokeText(t,W/2,(window.__safeTop||0)+96);c.fillStyle=k;c.fillText(t,W/2,(window.__safeTop||0)+96);});

  /* ---------- итоги ---------- */
  function nkEnd(g,why){if(g.over)return;var s=sv(),d=dayIdx(),sc=g.kills,x=s.nk&&s.nk.d===d?s.nk:{d:d,b:0,g:0,r:s.nk&&s.nk.r|0},rec=sc>(x.r|0),gd=0;
    if(!x.g&&sc>=NK.min){x.g=1;gd=nkGold();gold(gd);}x.b=Math.max(x.b|0,sc);x.r=Math.max(x.r|0,sc);x.n=(x.n|0)+1;s.nk=x;st('nk_end',{k:sc,r:rec?1:0,w:why,n:x.n});
    fin(g,why==='time','<h3>'+(rec?L('🏆 Новый рекорд!','🏆 New record!'):why==='dead'?L('Наскок прерван','Raid cut short'):L('Наскок окончен','Raid over'))+'</h3>'+
      '<div class="stats s3"><div><b>'+sc+'</b>'+L('одолено','defeated')+'</div><div><b>'+x.b+'</b>'+L('лучший сегодня','best today')+'</div><div><b>'+x.r+'</b>'+L('рекорд','record')+'</div></div>'+
      (gd?'<div class="goldrow"><img src="'+ic('coin',68)+'" alt=""><b>'+fmtNum(gd)+'</b><small>'+L('золота <br>за наскок дня','gold <br>daily raid')+'</small></div>':'')+
      '<p class="sub">'+(why==='dead'?L('Богатырь пал — счёт засчитан. Попробуй обойти толпу по кругу.','The hero fell — the score counts. Try circling around the crowd.'):rec?L('Так держать! Завтра расклад будет новый.','Well done! Tomorrow brings a new layout.'):L('До рекорда не хватило: ','Short of the record by: ')+(x.r-sc))+'</p>',L('⚡ Ещё разок','⚡ Once more'));}
  function rvEnd(g,win){if(g.over)return;var s=sv(),m=g.nvm,r=s.rv,n=m.n,nm=EN[g.ch.boss]?EN[g.ch.boss].n:'',gd=0,last=n>=RV.n;
    if(win&&r){gd=rvGold(n);gold(gd);if(last)delete s.rv;else s.rv={b:r.b,c:r.c,d:dayIdx()+1,n:n+1};}st('rv_end',{b:g.ch.boss,n:n,w:win?1:0,t:Math.floor(g.t)});
    fin(g,win,'<h3>'+(win?L('Реванш за тобой!','The rematch is yours!'):L('Он устоял','He held his ground'))+'</h3><div class="unlock"><img src="'+ic(g.ch.boss,160)+'"><div><b>'+nm+'</b><span>'+
      (win?(last?L('Больше не сунется. Ищи нового недруга на карте!','He won’t be back. Find a new foe on the map!'):L('Ушёл зализывать раны. Завтра вернётся — злее и с подмогой.','Off to lick his wounds. He returns tomorrow — angrier and with backup.')):L('Ничего, он никуда не денется — попробуй ещё раз.','No worries, he isn’t going anywhere — try again.'))+'</span></div></div>'+
      (gd?'<div class="goldrow"><img src="'+ic('coin',68)+'" alt=""><b>'+fmtNum(gd)+'</b><small>'+L('золота <br>за реванш','gold <br>rematch')+'</small></div>':''),win?'':L('⚔ Ещё раз','⚔ Try again'));}
  /* ушёл с привала («Уйти») — обычный endRun: вернуть как было (дух, рекорд главы, счёт походов, Логово) и не платить */
  BB2.hook('end',function(g){var b=g.nvB;if(!g.nvm||!b)return;S.pity=b.pity;if(b.best==null)delete S.best[g.chi];else S.best[g.chi]=b.best;S.runs=b.runs;if(b.lair)S.lairL=JSON.parse(b.lair);
    if(g.reward>0){S.gold-=g.reward;try{ern('lvl',-g.reward);}catch(e){}g.reward=0;g.rw={};}},1);
})();
