/* ===== bb2-cup-ui.js — «🌐 Живая лига» Богатыря (поток CUP-BG супер-буста в2, 14.10.2026). Набор 'cup' (после js/cup.js), догружается:
   у вошедших в лигу — в меню (BB2.late), у остальных — по кнопке «Открыть» карточки на карте. Заглушка на старте — js/bb2-cup.js (флаг 'cup').
   Сервер — общее ядро hobby-cup (~/Projects/hobby-analytics/online, адаптер games/bogatyr.py); модуль js/cup.js — копия online/cup.js, НЕ править тут.
   Что делает:
   - вход и знакомство (имя в таблицах по умолчанию скрыто — «Игрок NNNN»; показывать — только если игрок сам выбрал);
   - Поход дня, Испытание недели и Сеча вошедшего игрока сами берут путёвку в начале похода (крючок run) и сдают счёт в конце (end);
     строка «🌐 Живая лига: …» в окне итогов; очки лиги дают Поход дня и Испытание недели, Сеча — только рекорды;
   - окно лиги: ступень (кружок цвета лиги + «Медная 3»), группа по 30 (соседи-богатыри подписаны «(сосед)»), таблицы дня/недели/своей ступени/Сечи,
     строка «Награда за неделю на этой ступени»;
   - «Итоги недели» с «Забрать»: ступень, место и награда — только с сервера; выдаётся один раз на номер недели (S.bb2.cup.lgw), сервер помечает (claim);
   - ⚙ «Показывать моё имя» (выкл.) и «Удалить мои данные турниров».
   Сервер молчит — окон нет, ошибок нет, игра как прежде. Награда: «походы» с сервера × base.run[отрезок глав] (ECO) × cup.k (ECO?).
   STAT: lg {a:in|wk|take|ses …} (как у Рыбалки, п.12 ядра), cupo {a,k} — нажатия и ответы сервера. Старый синтаксис: без ?. ?? .finally */
(function(){
  if(typeof BB2!=='object'||!BB2||typeof CUP==='undefined')return;
  var X=BB2.cupS,U=BB2.cup={ok:1},vkNm='',vkAsk=0,lgR=null,tag=0,pend=null,LGT=600e3,warned=0;
  var LAD0={n:['Деревянная','Каменная','Медная','Бронзовая','Серебряная','Золотая','Алмазная'],ne:['Wooden','Stone','Copper','Bronze','Silver','Gold','Diamond'],s:4}; // i18n:ru
  var LGC=['#9c6b3c','#8e959c','#c4703a','#cd7f32','#c3ccd4','#f2c94c','#7fd8f5'];
  function C(){return BB2.s('cup');}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function ev(a,k){BB2.stat('cupo',{a:a,k:k==null?'':k});}
  function sig(cb){if(CUP._dbg().dev)return cb('dev');
    try{if(!ysdk||!YP||!YP.getMode||YP.getMode()==='lite')return cb('');var done=0,t=setTimeout(function(){if(!done){done=1;cb('');}},8000);
      ysdk.getPlayer({signed:true}).then(function(p){if(!done){done=1;clearTimeout(t);cb(p&&p.signature||'');}},function(){if(!done){done=1;clearTimeout(t);cb('');}});}catch(e){cb('');}}
  CUP.init({g:'bogatyr',plat:PLAT==='vk'?'vk':'yandex',url:CUP_URL,lang:function(){return LANG;},name:function(){return vkNm;},sig:sig});
  if(!document.getElementById('cupCss')){var st=document.createElement('style');st.id='cupCss';
    st.textContent='.cuplg{display:inline-block;width:.8em;height:.8em;border-radius:50%;margin:0 .3em 0 .1em;vertical-align:-.05em;box-shadow:0 0 0 2px rgba(255,255,255,.35)}'
      +'#cupLb{max-height:44vh;overflow:auto;overscroll-behavior:contain;text-align:left}#cupLb .lbrow b{min-width:34px;width:auto;white-space:nowrap}#cupLb .zup b{color:#4ade6a}#cupLb .zdown b{color:#ff7a6a}'
      +'.cupseg{gap:3px}.cupseg button{font-size:13px;padding:9px 1px;line-height:1.1}.cupbig{font-size:60px;line-height:1.1;text-align:center;margin:4px 0}.cupgold{font-size:22px;font-weight:900;color:var(--gold);text-align:center;margin:8px 0}'
      +'.cupgap{text-align:center;opacity:.6;padding:2px 0}#mBody .cupbtns{display:flex;flex-direction:row;gap:8px;flex-wrap:wrap}#mBody .cupbtns .btn{flex:1;min-width:130px}';
    document.head.appendChild(st);}

  /* --- лестница и подписи --- */
  function lad(){return (lgR&&lgR.lad)||(CUP.me()&&CUP.me().lad)||LAD0;}
  function tierP(i){var d=lad(),s=Math.max(1,d.s||1),n=d.n||[],li=Math.max(0,Math.min(Math.floor((i||0)/s),n.length-1));return {li:li,sub:s>1?s-(i||0)%s:0,nm:(LANG==='en'&&d.ne?d.ne:n)[li]||''};}
  function tier(i){var t=tierP(i);return t.nm+(t.sub?' '+t.sub:'');}
  function tierH(i){var t=tierP(i);return '<span style="white-space:nowrap"><span class="cuplg" style="background:'+LGC[t.li%LGC.length]+'"></span>'+esc(tier(i))+'</span>';}
  U.tier=tier;U.tierH=tierH;
  function rowNm(o){if(!o)return '';if(o.bot)return (LANG==='en'&&o.nm_en?o.nm_en:o.nm)+' ('+L('сосед','neighbour')+')';return o.nm||(L('Игрок ','Player ')+(o.tg||''));}
  function val(mode,v){return mode==='day'?fmtNum(v||0):fmtTime(v||0);}
  function wkLeft(){var h=weekLeftH();return h>=24?Math.floor(h/24)+L(' дн. ','d ')+(h%24)+L(' ч','h'):h+L(' ч','h');}
  function setTr(t,mv){var c=C();if(t>=0&&(c.tr!==t||(mv&&c.mv!==mv))){c.tr=t;if(mv)c.mv=mv;save();}}
  function rest(){return L('Живая лига сейчас отдыхает. Игра работает как обычно — загляни попозже.','The live league is resting. The game works as usual — try again later.');}

  /* --- награда: «походы» с сервера × золото одного похода по отрезку глав (ECO base.run) --- */
  function band(){try{if(BB2.eco&&BB2.eco.band)return BB2.eco.band();}catch(e){}var n=0,k,b=BB2.n('base.band',[3,18]);try{for(k in S.done)if(S.done[k])n++;}catch(e){}return n<=b[0]?0:n<=b[1]?1:2;}
  function gold(rw){if(!(rw>0))return 0;var run=BB2.n('base.run',[700,1900,6400])[band()]||700;return Math.max(10,Math.round(rw*run*BB2.n('cup.k',.5)/10)*10);}
  U.gold=gold;

  /* --- вход + лига одним заходом (ответ помним 10 мин); не ответил за 9 с — онлайна нет --- */
  function vkName(cb){if(PLAT!=='vk'||vkAsk||!VK)return cb();vkAsk=1;
    vkSend('VKWebAppGetUserInfo',{},4000).then(function(u){vkNm=(String(u&&u.first_name||'')+' '+String(u&&u.last_name||'')).trim();cb();},function(){cb();});}
  function login(cb){if(lgR&&CUP.me()&&Date.now()-lgR._t<LGT)return cb(lgR);
    vkName(function(){var done=0,tm=setTimeout(function(){if(!done){done=1;cb(null);}},9000);
      CUP.league(function(r){if(done)return;done=1;clearTimeout(tm);if(r){r._t=Date.now();lgR=r;if(r.joined){setTr(r.tr!=null?r.tr:r.tier||0);if(r.wk&&C().jw!==r.wk){C().jw=r.wk;save();}}else setTr(r.tier||0);}
        cb(r);});});}

  /* --- окно --- */
  function win(html){showModal(html,'cup');}
  function btns(a){return '<div class="btns cupbtns">'+a+'</div>';}
  function loading(t){win('<h3>🌐 '+L('Живая лига','Live league')+'</h3><p class="sub" id="cupLoad">'+(t||L('Загружаем общую таблицу…','Loading the shared leaderboard…'))+'</p>'+btns('<button class="btn ghost" id="cupX">'+L('Закрыть','Close')+'</button>'));on('cupX',hideModal);}
  U.open=function(){STAT.screen('cup');var tg=++tag,fresh=!!(lgR&&CUP.me()&&Date.now()-lgR._t<LGT);if(!fresh)loading();
    login(function(r){if(tg!==tag)return;if(!fresh&&!$('cupLoad'))return;
      if(!r){ev('open','no');hideModal();if(!warned){warned=1;toast(L('Живая лига сейчас недоступна — играй как обычно','The live league is unavailable — play as usual'));}return;}
      ev('open','ok');flush();
      if(C().ask!==1)return intro();
      var cl=(r.claims||[]).filter(function(c){return c&&c.wk>(C().lgw||0);});if(cl.length)return claim(cl[0]);
      main('lg');});};
  /* знакомство: имя по умолчанию скрыто (политика 13.10) */
  function intro(){var me=CUP.me()||{},tg=me.tg||4821,nm=me.nm?'«'+esc(me.nm)+'»':L('«Иван П.»','"Ivan P."'),sh=!!CUP.shown();
    win('<h3>🌐 '+L('Живая лига','Live league')+'</h3>'
      +'<p class="sub" style="color:#e8e4f4">'+L('Здесь ты бьёшься рядом с живыми богатырями: общий Поход дня, Испытание недели и Сеча, лига по 30 человек. Играй как обычно — счёт уйдёт сам. Каждую неделю лучшие в группе поднимаются на ступень выше и получают награду побольше.','Fight alongside real heroes: a shared Daily Run, Weekly Trial and Endless Battle, leagues of 30. Play as usual — your score is sent by itself. Every week the best in each group move up a step and get a bigger reward.')+'</p>'
      +'<p class="sub">'+L('В таблицах ты — ','On leaderboards you appear as ')+'<b>«'+L('Игрок','Player')+' '+tg+'»</b>. '+L('Можно показывать имя и первую букву фамилии: ','You can show your first name and surname initial instead: ')+'<b>'+nm+'</b>. '+L('Поменять можно в настройках ⚙.','Change it any time in ⚙ Settings.')+'</p>'
      +'<p class="sub">'+L('Если в группе мало людей, её добивают соседи — богатыри из игры, они подписаны «(сосед)».','If a group has few people, heroes from the game fill it — they are marked “(neighbour)”.')+'</p>'
      +btns(sh?'<button class="btn" id="cupNmY">'+L('Оставить имя','Keep my name')+'</button><button class="btn ghost" id="cupNmN">'+L('Скрыть имя','Hide my name')+'</button>'
        :'<button class="btn" id="cupNmN">'+L('Без имени — дальше','Stay anonymous')+'</button><button class="btn ghost" id="cupNmY">'+L('Показывать имя','Show my name')+'</button>'));
    function go(y){var c=C();c.ask=1;save();if(!!CUP.shown()!==y)CUP.showName(y,function(){});ev('name',y?1:0);BB2.stat('lg',{a:'in',t:(CUP.me()||{}).tier||0});BB2.late('cup');U.open();}
    on('cupNmY',function(){go(true);});on('cupNmN',function(){go(false);});}

  /* главное окно: вкладки «Лига · День · Неделя · Ступень · Сеча» */
  var SEG=[['lg',['Группа','Group']],['day',['День','Day']],['week',['Неделя','Week']],['tier',['Моя лига','My league']],['endless',['Сеча','Endless']]]; // i18n:ru
  function main(seg){var r=lgR||{},ti=r.tier||0,h='';
    for(var i=0;i<SEG.length;i++)h+='<button data-cs="'+SEG[i][0]+'" class="'+(SEG[i][0]===seg?'on':'')+'">'+L(SEG[i][1][0],SEG[i][1][1])+'</button>';
    win('<h3>🌐 '+L('Живая лига','Live league')+'</h3><p class="sub" style="margin-bottom:6px">'+L('Ступень: ','Step: ')+tierH(ti)+' · '+L('до итогов недели ','week ends in ')+wkLeft()+'</p>'
      +'<div class="seg cupseg">'+h+'</div><p class="sub" id="cupLoad">'+L('Загружаем…','Loading…')+'</p><div id="cupLb"></div><p class="sub" id="cupNote" style="margin-top:8px"></p>'
      +btns('<button class="btn" id="cupDay">⚔️ '+L('Поход дня','Daily Run')+'</button>'+(endOpen()?'<button class="btn" id="cupWk">🏆 '+L('Испытание','Weekly Trial')+'</button>':'')+'<button class="btn ghost" id="cupX">'+L('Закрыть','Close')+'</button>'));
    var bs=document.querySelectorAll('[data-cs]');for(i=0;i<bs.length;i++)bs[i].onclick=function(){SND.click();main(this.getAttribute('data-cs'));};
    on('cupX',hideModal);on('cupDay',function(){ev('go','day');openDaily();});on('cupWk',function(){ev('go','week');hideModal();startRun(0,true,true);});
    ev('tab',seg);if(seg==='lg')league();else top(seg);}
  function rows(list,mode){var h='';for(var i=0;i<list.length;i++){var o=list[i];
      h+='<div class="lbrow'+(o.me?' me':'')+(o.z?' z'+o.z:'')+'"><b>'+(o.z==='up'?'▲':o.z==='down'?'▼':'')+o.i+'</b><span></span><strong>'+(mode?val(mode,o.v):fmtNum(o.v))+'</strong></div>';}return h;}
  function fill(box,list){var sp=box.querySelectorAll('.lbrow span');for(var i=0;i<sp.length&&i<list.length;i++)sp[i].textContent=rowNm(list[i]);}
  function league(){var tg=++tag;
    CUP.league(function(r){if(tg!==tag||!$('cupLb'))return;var e=$('cupLoad'),n=$('cupNote');if(!r){e.textContent=rest();return;}
      r._t=Date.now();lgR=r;if(r.joined&&r.wk&&C().jw!==r.wk){C().jw=r.wk;save();}
      var k=r.rwd&&r.rwd.k?r.rwd.k[Math.max(0,Math.min(r.tier||0,r.rwd.k.length-1))]:0,z=(r.rwd&&r.rwd.z)||{};
      var rw=k?'💰 '+L('Награда за неделю на этой ступени: ','Weekly reward at this step: ')+'<b>'+fmtNum(gold(k))+goldW()+'</b> · '+L('подъём ','moving up ')+fmtNum(gold(k*(z.up||1.5)))+' · '+L('спуск ','moving down ')+fmtNum(gold(k*(z.down||.5))):'';
      if(!r.joined){e.innerHTML=L('Сыграй Поход дня или Испытание недели — и попадёшь в группу из 30 богатырей. В понедельник лучшие поднимаются на ступень выше.','Play the Daily Run or the Weekly Trial to join a group of 30 heroes. On Monday the best move up a step.')+(rw?'<br>'+rw:'');return;}
      e.innerHTML=L('Твоя группа на этой неделе. Очки — за Поход дня (лучший за каждый день) и Испытание недели.','Your group this week. Points come from the Daily Run (best of each day) and the Weekly Trial.')+(rw?'<br>'+rw:'');
      $('cupLb').innerHTML=rows(r.rows||[]);fill($('cupLb'),r.rows||[]);
      n.textContent=(r.up?'▲ — '+L('поднимутся на ступень выше','move up a step'):'')+(r.up&&r.down?', ':'')+(r.down?'▼ — '+L('опустятся на ступень','move down a step'):'')+(r.up||r.down?'. ':'')+L('Соседи — богатыри из игры: вверх и вниз переходят только люди.','Neighbours are heroes from the game: only people move up or down.');});}
  function top(seg){var tg=++tag,mode=seg==='tier'?'week':seg,per=seg==='tier'?'w@t':seg==='day'?'d':'w';
    CUP.top(mode,per,function(r){if(tg!==tag||!$('cupLb'))return;var e=$('cupLoad'),n=$('cupNote');if(!r){e.textContent=rest();return;}
      var t=r.top||[],ar=(r.around||[]).filter(function(o){for(var i=0;i<t.length;i++)if(t[i].i===o.i&&t[i].v===o.v)return false;return true;}),m=r.me;
      e.textContent=seg==='day'?L('Поход дня: одна глава, богатырь и правило у всех. Очки — одолено нечисти + 500 за босса.','Daily Run: same chapter, hero and rule for all. Score — monsters defeated + 500 for the boss.')
        :seg==='week'?L('Испытание недели «','Weekly Trial “')+weekly().name+L('»: кто дольше продержится.','”: who survives longest.')
        :seg==='tier'?L('То же Испытание недели — только богатыри твоей ступени ','The same Weekly Trial — only heroes of your step ')+tier((lgR||{}).tier||0)+'.'
        :L('Бесконечная сеча: рекорды недели. В лигу не идёт.','Endless Battle: records of the week. Does not count for the league.');
      $('cupLb').innerHTML=rows(t,mode)+(ar.length?'<div class="cupgap">· · ·</div>'+rows(ar,mode):'');fill($('cupLb'),t.concat(ar));
      n.textContent=!t.length?L('Пока пусто — будь первым!','Empty so far — be the first!'):!m?L('Сыграй — и появишься в таблице.','Play to appear here.')
        :m.approx?L('Ты примерно на '+m.i+'-м месте из ≈ '+m.n+'.','You are at about #'+m.i+' of ≈ '+m.n+'.'):L('Твоё место: ','Your place: ')+m.i+' · '+val(mode,m.v);});}

  /* --- «Итоги недели» --- */
  function claim(c,back){var up=c.res==='up',dn=c.res==='down',tp=c.res==='top',got=c.wk<=(C().lgw||0),g=got?0:gold(c.rw);
    if(!got&&(C().sw||0)<c.wk){C().sw=c.wk;save();BB2.stat('lg',{a:'wk',f:c.tr,t:c.to,p:c.pl,o:c.pts||0,r:g,h:c.nh||0,m:c.res});}
    setTr(c.to,c.res);
    win('<h3>🏅 '+L('Итоги недели','Week results')+'</h3><div class="cupbig">'+(up||tp?'🥇':'🏅')+'</div>'
      +'<p class="sub" style="text-align:center;color:#e8e4f4">'+L('Живая лига, прошлая неделя: ','Live league, last week: ')+'<b>'+(LANG==='en'?'#'+c.pl:c.pl+'-е место')+'</b> '+L('в группе','in your group')+' · '+tierH(c.tr)+'</p>' // i18n:ru
      +'<p class="sub" style="text-align:center">'+(up?L('Ты поднимаешься: ','You move up: ')+tierH(c.to)+'!':tp?L('Ты на вершине лестницы — держись!','You are at the top — hold on!'):dn?L('Спуск: ','Down to: ')+tierH(c.to)+L('. Ничего, отыграемся!','. We will win it back!'):L('Остаёшься: ','You stay: ')+tierH(c.to)+'.')+'</p>'
      +(g?'<div class="cupgold" id="cupClG">+'+fmtNum(g)+goldW()+'</div><p class="sub" style="text-align:center">'+L('Чем выше ступень, тем больше награда; за подъём — больше, за спуск — меньше.','The higher the step, the bigger the reward; more for moving up, less for moving down.')+'</p>':'')
      +btns('<button class="btn big" id="cupClOk">'+(g?'💰 '+L('Забрать','Take'):L('Понятно','OK'))+'</button>'));
    if(up||tp){try{SND.level();}catch(e){}}
    on('cupClOk',function(){var cs=C();if(c.wk>(cs.lgw||0)){cs.lgw=c.wk;var n=gold(c.rw);if(n){S.gold+=n;ern('cup',n);try{SND.coin();}catch(e){}}save();setGold();ev('rw',n);BB2.stat('lg',{a:'take',t:c.to,r:n});} /* один раз на неделю; числа — только с сервера */
      CUP.claim(c.wk);if(lgR&&lgR.claims)lgR.claims=lgR.claims.filter(function(x){return x.wk!==c.wk;});ev('claim',c.res);if(back==='none')hideModal();else U.open();});}
  /* тихая проверка при входе в меню: был в группе (jw), награда не забрана (lgw) — когда меню свободно */
  function idle(){return typeof G!=='undefined'&&!G&&!$('modal').classList.contains('on')&&!document.body.classList.contains('run');}
  U.check=function(){var c=C();if(!X.on()||c.ask!==1||!(c.jw>(c.lgw||0)))return;var n=0,tm=setInterval(function(){if(++n>80){clearInterval(tm);return;}if(!idle())return;clearInterval(tm);
    login(function(r){if(!r||!idle())return;var cl=(r.claims||[]).filter(function(x){return x&&x.wk>(C().lgw||0);});if(cl.length)claim(cl[0],'none');});},1500);};
  BB2.hook('menu',function(){setTimeout(U.check,800);});

  /* --- поход: путёвка в начале, счёт в конце --- */
  var MIN={day:30,week:60,endless:30};
  U.run=function(g){if(g.cupT||g.cupAsk)return;g.cupAsk=1;CUP.ticket(g.cupM,function(t){if(t&&!t.no){g.cupT=t;ev('tk','ok');}else{g.cupNo=t?t.no:'net';ev('tk',g.cupNo);}
    if(g.over&&g.cupEnd)U.end(g,g.cupW);});};
  U.end=function(g,w){g.cupEnd=1;g.cupW=w;var t=g.cupT;if(!t){if(g.cupNo==='limit'){g.cupS='limit';line(g);}return;} /* сервер молчит — строки нет: лиги просто нет */if(g.cupSent)return;g.cupSent=1;
    var m=g.cupM,v=m==='day'?(g.drScore|0):Math.min(Math.floor(g.t),Math.floor((Date.now()-(t.got||0))/1000)+4);
    if(g.t<MIN[m]||v<=0){g.cupS='short';line(g);return;}
    send({t:t,v:v,d:Math.round(g.t*1000),g:g});};
  function send(job,late){CUP.submit(job.t,job.v,{d:job.d},function(r){var g=job.g;
    if(!r){if(!late)pend=job;g.cupS='net';ev('sub','net');line(g);return;}
    if(pend===job)pend=null;if(r.no){g.cupS='no';ev('sub',r.no);line(g);return;}
    ev('sub','ok');g.cupS='ok';g.cupR=r;if(r.lg&&CUP.me()&&CUP.me().wk&&C().jw!==CUP.me().wk){C().jw=CUP.me().wk;save();}if(r.lg&&lgR)lgR._t=0;line(g);});}
  function flush(){var p=pend;if(p&&Date.now()-(p.t.got||0)<((p.t.exp||0)*1000-60e3))send(p,true);else pend=null;}
  /* строка в окне итогов */
  function lineH(g){var s=g.cupS,r=g.cupR||{};
    if(!s)return '📡 '+L('Записываем в живую лигу…','Sending to the live league…');
    if(s==='ok')return '🌐 '+L('Живая лига: ','Live league: ')+(r.rank?(r.approx?'≈ ':'')+r.rank+L('-е место',' place')+' · ':'')+(r.lg?L('очки лиги за неделю: ','league points this week: ')+fmtNum(r.lg.pts):g.cupM==='endless'?L('рекорды Сечи','Endless records'):'')+(r.best?' · '+L('лучший результат!','your best!'):'');
    if(s==='short')return '🌐 '+L('Живая лига: слишком короткий поход — не в зачёт.','Live league: the run was too short to count.');
    if(s==='limit')return '🌐 '+L('Живая лига: попытки на этот срок кончились — в зачёт идут лучшие.','Live league: no attempts left for now — your best ones count.');
    if(s==='no')return '🌐 '+L('Живая лига этот результат не приняла.','The live league did not accept this result.');
    return '🌐 '+L('Живая лига сейчас не отвечает — отправим позже.','The live league is not responding — we will send it later.');}
  function line(g){try{if(typeof G==='undefined'||G!==g)return;var m=$('mBody');if(!m||m.getAttribute('data-w')!=='result')return;
    BB2.put(m,'btns','<p class="sub" style="text-align:center;margin:6px 0">'+lineH(g)+'</p>','cupRes');}catch(e){}}
  U.res=function(m){if(typeof G!=='undefined'&&G&&G.cupM)line(G);};

  /* --- ⚙ настройки: показ имени и удаление данных --- */
  U.set=function(m){if(!$('setOk')||$('stCupG'))return;var sh=!!CUP.shown(),tg=(CUP.me()&&CUP.me().tg)||'NNNN';
    var d=BB2.put(m,'btns','<div class="card" id="stCupG" style="margin:10px 0 0"><b style="font-size:14px">🌐 '+L('Живая лига','Live league')+'</b>'
      +'<button class="btn ghost" id="stCupN" style="width:100%;margin-top:8px">👤 '+L('Показывать моё имя: ','Show my name: ')+(sh?L('вкл','on'):L('выкл','off'))+'</button>'
      +'<p class="sub" style="margin:6px 2px 0;text-align:left">'+L('В общих таблицах: «Имя Ф.» вместо «Игрок '+tg+'».','On shared boards: first name and initial instead of “Player '+tg+'”.')+'</p>'
      +'<button class="btn ghost" id="stCupD" style="width:100%;margin-top:8px">🗑 '+L('Удалить мои данные турниров','Delete my contest data')+'</button>'
      +'<p class="sub" id="stCupM" style="margin:6px 2px 0;text-align:left">'+L('Результаты, место в лиге и вызовы на сервере — во всех играх.','Scores, league place and challenges on the server — in all games.')+'</p></div>','cupSet');
    if(!d)return;
    on('stCupN',function(){CUP.showName(!sh,function(){});lgR=null;ev('name',sh?0:1);openSettings();});
    on('stCupD',function(){var b=$('stCupD'),e=$('stCupM');if(!b.getAttribute('data-sure')){b.setAttribute('data-sure','1');e.textContent=L('Нажми ещё раз — результаты, лига и вызовы будут удалены с сервера. Золото и прогресс в игре останутся.','Tap again to delete your scores, league and challenges from the server. Gold and progress stay.');return;}
      e.textContent=L('Удаляем…','Deleting…');CUP.forget(function(x){if(!$('stCupM'))return;b.removeAttribute('data-sure');
        if(x){var c=C();delete c.ask;delete c.jw;delete c.tr;delete c.mv;save();lgR=null;pend=null;ev('forget','ok');}
        $('stCupM').textContent=x?L('Готово: данные турниров удалены. Живая лига снова спросит, показывать ли имя.','Done: your contest data is deleted. The live league will ask about your name again.'):L('Сервер сейчас не отвечает — попробуй позже.','The server is not responding — try again later.');});});};

  /* --- карточка на карте: ступень --- */
  U.card=function(el){var c=C(),t=$('cupCardT');if(!t||c.ask!==1||c.tr==null)return;
    t.innerHTML=L('Твоя ступень: ','Your step: ')+tierH(c.tr)+(c.jw>(c.lgw||0)?' · 🏅 '+L('итоги недели!','week results!'):'');};
  (function(){var el=$('cupCard');if(el)U.card(el);})();
  /* статистика рангов: ступень и итог прошлой недели — раз за запуск, у вошедших */
  try{var c0=C();if(c0.ask===1&&c0.tr!=null&&CUP.on)BB2.stat('lg',{a:'ses',t:c0.tr,m:c0.mv||''});}catch(e){}
  setTimeout(U.check,1500);
})();
