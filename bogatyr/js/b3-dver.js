/* ===== b3-dver.js — Богатырь 3.0 волна 1, П4 «Одна дверь и окна» (набор b3x). Журнал — hobby-analytics/release-i/boost3-bogatyr/REVIEW-1107/П4-ДВЕРЬ.md. Без ?. ?? .finally
   Флаг части 'dver' (выкл. ?bb2=-b3dver, всё 3.0 — ?bb2=-b3). Вкладка «В поход», окно победы/гибели — B3.on('dver') (старому сразу: перестановка);
   Сорока и страж окон при входе — B3.open('dver') (старому игроку со 2-го дня 3.0; новичку — со 2-го дня и после главы 3 (B3P.quiet)).
   1) СТРАЖ: обёртка showModal — последним перед окном. В «фазе входа» (заход, пока не начат поход) окна без касания игрока не показываются,
      кроме Сороки (b3sor); land/yard/evutro/login/today/cup — режутся всегда в фазе входа; tmrw («Завтра в деревне») — всегда (строкой и 🔔 у Сороки).
   2) СОРОКА: крючок morning (очередь 10, раньше «Утра богатыря» bb2-ev) — первая за день карточка: 1–3 строки «пока тебя не было» (B3O.brag П3,
      Новая земля, Реванш/Недобитый), дар дня сам в казну (вход — если Месяцеслов выкл.; казна мельницы), ×2 за рекламу маленькой кнопкой, «Дела дня N из M ›»
      (= openToday, как кнопка «Дела на сегодня» на карте), крупно «В поход». ПК/ОК (isWide) — без окна: карточкой справа на вкладке.
   3) ВКЛАДКА «В поход»: поход главы (карта + панель: Разведка/Набег/Логово, сложность одной кнопкой ▾, умения одной кнопкой, Чудо дня, «Выступить») ·
      Сорока · .b3keep («Разыскивается» П3) · событие (зима / праздник FEST / Сказ — одна плитка) · «Все походы ›» (вся прежняя лента, перенос узлов,
      первыми Ночь нечисти и Калинов мост). renderChInfo обёрнут: перед перерисовкой убирает старые перенесённые узлы (иначе id дублируются).
   4) ОКНО ПОБЕДЫ (кампания): реплика Яги по поводу (win.retry/low/boss/fast/yaga) · добыча (звёзды, золото, ×2 #rX2 внутри, «Подробнее») ·
      ≤1 новость (очередь; остальные скрыты + точка «новое» на вкладке) · крупно «Дальше: глава N» (#rNext) первой. B3P.quiet() — 0 новостей, «Дальше» по B3P.next().
      Поражение — та же раскладка с die.yaga. ОКНО ГИБЕЛИ: die.yaga + die.near {left} (G.b3left П2), .b3keep П3 над кнопками. id кнопок не меняются.
   5) Этаж 0: облачко в бою — одно за раз, не за краем (drawBubble с ограничением ширины и низа; говорящий за краем — облачко не рисуем).
   STAT b3: sor {k:show|card|go|del|x2|line|bell|held}, win {k:show|next|x2}, tab {k:show|all|back|sor|ev|dif}. Сохранение b3d. */
(function(){
  if(typeof B3==='undefined'||typeof BB2!=='object'||!BB2)return;
  var B=BB2;
  function on(){return B3.on('dver');}
  function op(){try{return B3.open('dver');}catch(e){return false;}}
  function T(ru,en){return typeof L==='function'?L(ru,en):ru;}
  function $i(id){return document.getElementById(id);}
  function inRun(){return (typeof G!=='undefined'&&!!G)||document.body.classList.contains('run');}
  function quiet(){try{return !!(window.B3P&&B3P.quiet&&B3P.quiet());}catch(e){return false;}}
  function qnext(){try{var n=window.B3P&&B3P.next?B3P.next():-1;return typeof n==='number'?n:-1;}catch(e){return -1;}}
  function st(a,o){try{B3.stat(a,o);}catch(e){}}
  function warn(w,e){try{console.warn('b3 dver '+w,e);}catch(x){}}
  function sv(){return B.s('b3d');}
  function sav(){try{save();}catch(e){}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function nm(v){return +v>0?Math.floor(+v):0;}

  /* ---------- сохранение b3d: sd день Сороки, dd/dn счёт дней, gx день ×2, ld Новая земля отложена, t попытки непройденных глав, dot точки «новое» ---------- */
  var TABS={Village:1,Forge:1,Map:1,Heroes:1,Quests:1};
  function fix(o){var r={},k,n=0;o=o||{};['sd','dd','dn','gx'].forEach(function(k){if(nm(o[k]))r[k]=nm(o[k]);});if(o.ld)r.ld=1;
    if(o.t&&typeof o.t==='object')for(k in o.t)if(o.t.hasOwnProperty(k)&&nm(o.t[k])&&n<4){r.t=r.t||{};r.t[k]=Math.min(99,nm(o.t[k]));n++;}
    if(o.dot&&typeof o.dot==='object')for(k in o.dot)if(TABS[k]&&o.dot[k]){r.dot=r.dot||{};r.dot[k]=1;}
    return r;}
  function merge(a,b){var x=fix(a),y=fix(b),k;['sd','dd','dn','gx'].forEach(function(k){if(x[k]||y[k])x[k]=Math.max(x[k]|0,y[k]|0);});if(y.ld)x.ld=1;
    if(y.t){x.t=x.t||{};for(k in y.t)x.t[k]=Math.max(x.t[k]|0,y.t[k]);}if(y.dot){x.dot=x.dot||{};for(k in y.dot)x.dot[k]=1;}return fix(x);}
  B.save('b3d',{fix:fix,merge:merge});

  /* ---------- тексты ---------- */
  /* строки win.* {hero} {boss} {t} {n}, die.yaga, die.near {left}, sor.night/calm/done — основной банк П5 (b3-txt.js, тот же набор b3x, грузится раньше; en — b3-txt-en.js). Свой запасной банк убран ради веса набора */
  var SAY={},SAYD=0;
  function say1(k,v){var d=B3.day();if(d!==SAYD){SAY={};SAYD=d;}if(SAY[k]==null)SAY[k]=B3.say(k,v)||'';return SAY[k];}
  var MAG='<svg class="b3mag" viewBox="0 0 64 64" aria-hidden="true"><path d="M2 54h60M2 60h60" stroke="#8a5a2b" stroke-width="4"/><path d="M10 50v14M30 50v14M50 50v14" stroke="#6b4320" stroke-width="4"/>'+
    '<path d="M30 40 L6 50 L9 44 Z" fill="#1f2a44"/><ellipse cx="36" cy="34" rx="13" ry="10" fill="#141824"/><ellipse cx="38" cy="37" rx="8" ry="6" fill="#f4f1e8"/><path d="M30 31 q6 -6 14 -2 q-6 2 -10 8z" fill="#2c4a8a"/>'+
    '<circle cx="47" cy="23" r="7" fill="#141824"/><circle cx="49" cy="21.5" r="1.6" fill="#fff"/><path d="M53 23 l8 1.5 -8 2z" fill="#3a3020"/><path d="M38 44v6M42 44v6" stroke="#3a3020" stroke-width="2"/></svg>';
  function yagaImg(){try{return '<img class="b3ya" src="'+ic('yaga',96)+'" alt="">';}catch(e){return '';}}

  /* ================= 1. СТРАЖ ОКОН ПРИ ВХОДЕ ================= */
  var tIn=0,ran=0,AUTO={land:1,yard:1,evutro:1,login:1,today:1,cup:1};
  ['pointerdown','touchstart','mousedown','keydown'].forEach(function(t){try{document.addEventListener(t,function(){tIn=Date.now();},true);}catch(e){}});
  function userNow(){var e=window.event;return !!(e&&e.isTrusted!==false&&/^(click|pointerup|pointerdown|touchend|touchstart|mouseup|mousedown|keydown|keyup)$/.test(e.type));}
  function hold(k,html){var t=(/<h3[^>]*>([\s\S]*?)<\/h3>/.exec(html||'')||[])[1]||'';t=t.replace(/<[^>]+>/g,'').slice(0,30);
    if(k==='land'){sv().ld=1;sav();}st('sor',{k:'held',w:k,t:t});
    /* вызвавший код сразу ищет свои кнопки по id ($('twGo').onclick=…) — кладём вёрстку в скрытый держатель на 1,5 с, чтобы он не упал */
    try{var hd=$i('b3Hold');if(!hd){hd=document.createElement('div');hd.id='b3Hold';hd.style.display='none';document.body.appendChild(hd);}hd.innerHTML=html||'';clearTimeout(hold.t);hold.t=setTimeout(function(){hd.innerHTML='';},1500);}catch(e){}}
  /* «Завтра в деревне» (bb2-first tmrw) — у Сороки: отмечаем показанным заранее, окно не собирается */
  function twOff(){try{if(on()&&op()&&S.bb2&&S.bb2.novice&&!S.bb2.novice.tw){S.bb2.novice.tw=1;st('sor',{k:'held',w:'tmrw0'});}}catch(e){}}
  B.hook('menu',twOff,1);B.hook('ready',twOff,1);
  function gate(html,kind){kind=kind||'';
    if(!on()||!op())return true;
    if(kind==='tmrw'){hold(kind,html);return false;}   /* «Завтра в деревне» — строкой и 🔔 у Сороки */
    if(ran||inRun()||!(S.runs|0)||kind==='b3sor')return true;
    if(userNow())return true;
    if(!AUTO[kind]&&Date.now()-tIn<2500)return true;
    hold(kind,html);return false;}
  var _sm=window.showModal;
  if(typeof _sm==='function')window.showModal=function(html,kind){var ok=true;try{ok=gate(html,kind);}catch(e){warn('gate',e);}if(!ok)return;return _sm.apply(this,arguments);};
  B.hook('run',function(g){ran=1;allMode=0;
    try{if(on()&&g&&!g.endless&&!g.daily&&!g.weekly&&!g.nvm&&!g.bb2most&&!S.done[g.chi]){var s=sv();s.t=s.t||{};s.t[g.chi]=(s.t[g.chi]|0)+1;g.b3tr=s.t[g.chi];
      var ks=Object.keys(s.t);if(ks.length>4)delete s.t[ks[0]];}}catch(e){}},5);
  B.hook('end',function(g,w){try{var s=sv();if(w&&g&&s.t&&s.t[g.chi]!=null)delete s.t[g.chi];}catch(e){}});

  /* ================= 2. СОРОКА ================= */
  var GIFT=null,BR={d:0,s:''};
  function lgOk(){try{return PLAT!=='yandex'||LOCAL||sdkDone;}catch(e){return true;}}
  function takeGift(){var g=0,x=0,r,ls,a,sk='';
    try{ls=loginState();if(ls.ready){r=loginReward(ls.n);S.login={last:dayKey(),n:ls.n};if(typeof r==='number'){S.gold+=r;ern('gift',r);g+=r;if(typeof lgX2Day==='undefined'||lgX2Day!==dayKey())x+=r;}else{S.skins=S.skins||{};S.skins[r]=1;sk=r;}}}catch(e){warn('login',e);}
    try{if(S.village&&S.village.mill&&lgOk()){a=afkGold();if(a>=30){S.gold+=a;ern('oth',a);S.afkT=nowMs();g+=a;if(afk2Left()>0)x+=a;GIFT={af:a};}}}catch(e){warn('afk',e);}
    GIFT=GIFT||{};GIFT.g=g;GIFT.x=x;GIFT.sk=sk;GIFT.lg=ls&&ls.ready&&typeof r==='number'?r:0;GIFT.d=B3.day();
    if(g||sk){sav();try{setGold();}catch(e){}}}
  function x2Ok(){return !!(GIFT&&GIFT.d===B3.day()&&GIFT.x>0&&sv().gx!==B3.day())&&typeof adOk==='function'&&adOk();}
  function x2Run(after){if(!x2Ok())return;var x=GIFT.x,lg=GIFT.lg,af=GIFT.af,give=function(){if(sv().gx===B3.day())return 0;sv().gx=B3.day();S.gold+=x;ern('ad',x);if(lg)lgX2Day=dayKey();if(af)afk2Use();sav();try{setGold();SND.chest();}catch(e){}return x;};
    st('sor',{k:'x2'});
    try{STAT.place('b3sor2');}catch(e){}
    showRewarded(function(){if(give()){toast('+'+fmtNum(x)+goldW());}if(after)after();},null,function(){var a=give();if(!a)return '';try{lateRe();}catch(e){}return T('дар дня ×2: +','daily gift ×2: +')+fmtNum(a);});}
  function rows(){var a=[],TL=[];try{TL=todayList();}catch(e){}
    var b='',d=B3.day();if(BR.d!==d){BR.d=d;BR.s='';try{if(window.B3O&&B3O.brag)BR.s=B3O.brag()||'';}catch(e){}}b=BR.s; /* brag() П3 отдаёт строку раз в день — держим её весь день */
    if(b)a.push({k:'obid',t:esc(b),f:function(){hideModal();openTab('Map');}});
    try{if(sv().ld&&S.done[32]&&!S.done[33])a.push({k:'land',t:T('❄ Новая земля «Долгая ночь»: Марена украла солнце — три новые главы!','❄ A new land, “The Long Night”: Marena stole the sun — three new chapters!'),f:function(){hideModal();mapSel=33;openTab('Map');}});}catch(e){}
    TL.forEach(function(x){if((x.k==='nvRv'||x.k==='nvNd')&&x.ready)a.push({k:x.k,t:esc(x.t)+' — '+esc(x.s),f:function(){try{x.fn.call(x);}catch(e){warn('row',e);}}});});
    try{if(BB2.on('cal')&&window.BB2EV&&BB2EV.calSt){var c=BB2EV.calSt();if(c&&!c.done&&c.day)a.push({k:'cal',t:T('📅 Месяцеслов, день '+c.day+': награда за любой поход','📅 Calendar, day '+c.day+': a reward for any run'),f:function(){hideModal();openTab('Map');}});}}catch(e){}
    var dn=0;TL.forEach(function(x){if(!x.ready)dn++;});
    return {a:a.slice(0,3),dn:dn,all:TL.length};}
  function bellOk(){try{return PLAT==='vk'&&typeof SOC!=='undefined'&&SOC.ok()&&SOC.can('ntf')&&SOC.ntfDue()&&(S.soc&&S.soc.ses|0)>=2&&!(S.soc&&S.soc.ntf&&+S.soc.ntf.n);}catch(e){return false;}}
  function delaTxt(R){return R.all&&R.dn>=R.all?say1('sor.done'):T('📋 Дела дня: '+R.dn+' из '+R.all,'📋 Today’s tasks: '+R.dn+' of '+R.all);}
  function giftHTML(btn){if(!GIFT||GIFT.d!==B3.day()||!(GIFT.g||GIFT.sk))return '';
    return '<div class="b3sg"><span>🎁 '+(GIFT.g?T('Дар дня <b>+'+fmtNum(GIFT.g)+'</b> — уже в казне','Daily gift <b>+'+fmtNum(GIFT.g)+'</b> — already in the treasury'):'')+(GIFT.sk?T(' Новый облик — уже твой!',' A new outfit — yours now!'):'')+'</span>'+
      (btn&&x2Ok()?'<button class="btn ad b3x2" id="'+btn+'">'+T('🎬 ×2 за рекламу','🎬 ×2 for an ad')+'</button>':'')+'</div>';}
  function sorModal(){var R=rows(),bell=bellOk(),h='<div class="b3s"><div class="b3sh">'+MAG+'<div><b>'+T('Сорока на плетне','The magpie on the fence')+'</b><small>'+(R.a.length?say1('sor.night'):say1('sor.calm'))+'</small></div></div>';
    R.a.forEach(function(x,i){h+='<button class="b3sr" data-b3s="'+i+'">'+x.t+' <i>›</i></button>';});
    h+=giftHTML('b3SorX2')+'<button class="b3sr b3sd" id="b3SorDel">'+delaTxt(R)+' <i>›</i></button>';
    if(bell)h+='<div class="b3sb"><span>'+T('📅 Завтра: ','📅 Tomorrow: ')+esc((function(){try{return tomorrowLine(1).split(' · ')[0];}catch(e){return '';}})())+'</span><button class="btn ghost" id="b3SorBell">'+T('🔔 Напоминать','🔔 Remind me')+'</button></div>';
    h+='<div class="btns"><button class="btn big" id="b3SorGo">'+T('⚔ В поход','⚔ March out')+'</button></div></div>';
    css();showModal(h,'b3sor');var m=$i('mBody');if(!m||m.getAttribute('data-w')!=='b3sor')return;
    st('sor',{k:'show',n:R.a.length,g:GIFT&&GIFT.g|0,x:x2Ok()?1:0,b:bell?1:0});
    if(bell){try{S.soc.ntf={n:1,t:Date.now()};sav();STAT.ev('soc',{a:'ntf',r:'show',n:1,d:SOC.ntfDay(),w:'b3sor'});}catch(e){}}
    [].forEach.call(m.querySelectorAll('[data-b3s]'),function(b){b.onclick=function(){try{SND.click();}catch(e){}var x=R.a[+b.getAttribute('data-b3s')];st('sor',{k:'line',w:x.k});x.f();};});
    var q=function(id,f){var x=$i(id);if(x)x.onclick=function(){try{SND.click();}catch(e){}f(x);};};
    q('b3SorGo',function(){st('sor',{k:'go'});hideModal();openTab('Map');});
    q('b3SorDel',function(){st('sor',{k:'del'});hideModal();openToday();});
    q('b3SorX2',function(b){b.disabled=true;x2Run(function(){var g=m.querySelector('.b3sg');if(g&&modalHas(g))g.outerHTML=giftHTML('');});});
    q('b3SorBell',function(b){b.disabled=true;st('sor',{k:'bell'});Promise.resolve(SOC.ntf(1)).then(function(y){if(y)b.textContent=T('✓ Напомню','✓ Will remind');else b.disabled=false;},function(){b.disabled=false;});});}
  function sor(){var s=sv(),d=B3.day();if(s.dd!==d){s.dd=d;s.dn=(s.dn|0)+1;sav();}
    if(quiet()||s.sd===d||(!B3.old()&&B3.age()<1))return;
    s.sd=d;takeGift();sav();
    if(isWide()){st('sor',{k:'card',g:GIFT&&GIFT.g|0});try{if(curTab==='Map')pass();}catch(e){}return;}
    sorModal();}
  B.hook('morning',function(){if(!on()||!op()||!(S.runs|0))return;try{sor();}catch(e){warn('sor',e);}return true;},10);

  /* ================= 3. ВКЛАДКА «В ПОХОД» ================= */
  var allMode=0,tabSeen=0,pT=0;
  function mk(id,tag,cls,parent,before){var e=$i(id);if(!e){e=document.createElement(tag||'div');e.id=id;}if(cls)e.className=cls;if(parent){if(before)parent.insertBefore(e,before);else parent.appendChild(e);}return e;}
  function pri(e){var id=e.id||'',q=function(s){try{return !!e.querySelector(s);}catch(x){return false;}};
    if(id==='nechBar')return 0;
    if(id==='tlCard'){var m=e.querySelector('#tlRM'),f=e.querySelector('.tlr');if(m&&f&&m!==f)f.parentNode.insertBefore(m,f);return 1;}
    if(q('#endBtn'))return 2;if(/\bwkcard\b/.test(e.className||''))return 3;if(id==='evMap')return 4;if(id==='cupCard')return 5;
    if(q('[data-cu]'))return 7;if(id==='todayBtn')return 8;if(q('#chgHero'))return 9;return 6;}
  var PN=[T('Ночь нечисти','Night of Monsters'),T('Калинов мост','Kalinov Bridge'),T('Сеча','Endless Battle'),T('Испытание недели','Weekly Trial'),T('Подвиги','Deeds'),T('Лига','League')];
  function evTile(box){var TL=[],i,x,f,h='',sg0=$i('evMapS');if(sg0&&box.contains(sg0))box.removeChild(sg0);box.innerHTML='';
    try{TL=todayList();}catch(e){}
    for(i=0;i<TL.length;i++)if(/^win\d/.test(TL[i].k||'')){x=TL[i];break;}
    if(x){h='<button class="b3ev" id="b3EvB"><img src="'+ic(x.ic,72)+'" alt=""><span><b>'+x.t+'</b><small>'+x.s+'</small></span><i>›</i></button>';box.innerHTML=h;
      $i('b3EvB').onclick=function(){try{SND.click();}catch(e){}st('tab',{k:'ev',w:'win'});try{x.fn();}catch(e){}};return 1;}
    try{if(typeof FEST!=='undefined'&&FEST.list){f=FEST.list().filter(function(r){return r.kind==='ev'||r.kind==='day';})[0];
      if(f){box.innerHTML='<button class="b3ev" id="b3EvB"><span class="b3ei">'+(f.icon||'🎉')+'</span><span><b>'+esc(FEST.name(f))+'</b><small>'+esc(f.txt||'')+'</small></span><i>›</i></button>';
        $i('b3EvB').onclick=function(){try{SND.click();}catch(e){}st('tab',{k:'ev',w:f.id});openTab('Village');};return 1;}}}catch(e){}
    var sg=$i('evMapS')||sg0;if(sg){sg.classList.add('b3evs');box.appendChild(sg);return 1;}
    return 0;}
  function sorCard(box){if(quiet()||!(S.runs|0)){box.innerHTML='';return;}var R=rows(),t=R.a.length?R.a[0].t:say1('sor.calm'),wide=isWide();
    box.innerHTML='<button class="b3sc" id="b3SorC">'+MAG+'<span><b>'+T('Сорока','Magpie')+'</b>'+t+'<em>'+delaTxt(R)+' ›</em></span></button>'+(wide?giftHTML('b3SorCX'):'');
    $i('b3SorC').onclick=function(){try{SND.click();}catch(e){}st('tab',{k:'sor'});openToday();};
    var x=$i('b3SorCX');if(x)x.onclick=function(){x.disabled=true;x2Run(function(){try{pass();}catch(e){}});};}
  /* перед renderChInfo: убрать только узлы, пришедшие из #chInfo (он их нарисует заново); строки ленты (#evMap, #todayBtn, #nechBar) живут до renderMap */
  function purge(){var a=$i('b3AllL'),i,k;if(!a)return;k=[].slice.call(a.children);for(i=0;i<k.length;i++)if(k[i].b3ci)a.removeChild(k[i]);}
  function pass(){if(!on())return;var el=$i('tabMap');if(!el)return;var cv=el.querySelector('#mapCv'),gb=el.querySelector('.gobar');if(!cv||!gb)return;css();
    var wide=!!el.querySelector('.mapwrap'),root=wide?el.querySelector('.mapR'):el,ci=el.querySelector('#chInfo');if(!root)return;
    el.classList.add('b3t');el.classList.toggle('b3A',!!allMode);
    var top=mk('b3Top','div','b3m');
    /* телефон: закреплённая панель закрывала 330 px из ~495 — Сорока/Разыскивается/событие не помещались. Порядок: поход главы (панель, не закреплённая) → верхние блоки → карта */
    if(!wide&&cv.parentNode===root){if(gb.parentNode!==root||gb.nextSibling!==top||top.nextSibling!==cv){root.insertBefore(gb,cv);root.insertBefore(top,cv);}}
    else if(wide&&(top.parentNode!==root||top.previousSibling!==gb))root.insertBefore(top,gb.nextSibling);
    var sc=mk('b3Sor','div','',null),ev=mk('b3Ev','div',''),ab=mk('b3AllBtn','button','b3ab');
    if(sc.parentNode!==top)top.appendChild(sc);
    var all=mk('b3All','div','b3al');if(all.parentNode!==root||all.nextSibling)root.appendChild(all);
    var lst=mk('b3AllL','div','');if(!$i('b3AllX')){all.innerHTML='<button class="b3ab b3bk" id="b3AllX">‹ '+T('Назад к походу','Back to the march')+'</button>';all.appendChild(lst);}
    $i('b3AllX').onclick=function(){try{SND.click();}catch(e){}allMode=0;el.classList.remove('b3A');st('tab',{k:'back'});el.scrollTop=0;};
    sorCard(sc);
    [].forEach.call(el.querySelectorAll('.b3keep,#b3oWant'),function(k){if(k.parentNode!==top)top.insertBefore(k,ev.parentNode===top?ev:null);});
    if(ev.parentNode!==top)top.appendChild(ev);
    var hasEv=0;try{hasEv=evTile(ev);}catch(e){warn('ev',e);}ev.style.display=hasEv?'':'none';
    /* всё прочее — в «Все походы ›» по порядку */
    var c=[],i,x,ch;
    for(ch=root.firstElementChild;ch;ch=ch.nextElementSibling)if(ch!==cv&&ch!==gb&&ch!==ci&&ch!==top&&ch!==all&&!/\b(mapL|mapwrap)\b/.test(ch.className||'')&&!/\bb3keep\b/.test(ch.className||''))c.push(ch);
    if(wide)for(ch=el.firstElementChild;ch;ch=ch.nextElementSibling)if(!/\bmapwrap\b/.test(ch.className||'')&&ch!==all)c.push(ch);
    if(ci)for(ch=ci.firstElementChild;ch;ch=ch.nextElementSibling)if(ch.id!=='b3oWant'&&!/\bb3keep\b/.test(ch.className||'')){ch.b3ci=1;c.push(ch);}
    for(ch=lst.firstElementChild;ch;ch=ch.nextElementSibling)if(c.indexOf(ch)<0)c.push(ch);
    for(i=0;i<c.length;i++)c[i].b3p=pri(c[i])*100+i;
    c.sort(function(a,b){return a.b3p-b.b3p;});
    for(i=0;i<c.length;i++)lst.appendChild(c[i]);
    var names=[];[].forEach.call(lst.children,function(e){var p=Math.floor(e.b3p/100);if(p<PN.length&&names.indexOf(PN[p])<0)names.push(PN[p]);});
    ab.innerHTML='<span><b>🗺 '+T('Все походы','All marches')+'</b><small>'+(names.length?names.slice(0,3).join(' · ')+(lst.children.length>3?' …':''):T('Сеча, Подвиги, Лига и другие','Endless Battle, Deeds, League and more'))+'</small></span><i>›</i>';
    ab.style.display=lst.children.length?'':'none';if(ab.parentNode!==top)top.appendChild(ab);
    ab.onclick=function(){try{SND.click();}catch(e){}allMode=1;el.classList.add('b3A');st('tab',{k:'all',n:lst.children.length});el.scrollTop=0;try{window.scrollTo(0,0);}catch(e){}};
    gb.classList.add('b3m');if(!wide)cv.classList.add('b3m');
    /* панель: сложность одной кнопкой ▾, умения — одной кнопкой (окно умений), строка силы — сведения */
    var dr=el.querySelector('#difRow');if(dr&&!dr.b3){dr.b3=1;dr.classList.add('b3dc');
      dr.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('button'):null;if(!b||dr.classList.contains('b3x'))return;e.stopPropagation();dr.classList.add('b3x');try{SND.click();}catch(x){}st('tab',{k:'dif'});},false);}
    if(!tabSeen){tabSeen=1;setTimeout(function(){try{st('tab',{k:'show',n:places(el),w:wide?1:0,e:hasEv,l:lst.children.length});}catch(e){}},300);}}
  function places(el){var n=0,all=el.querySelectorAll('button,canvas,a,[data-ms]');for(var i=0;i<all.length;i++){var r=all[i].getBoundingClientRect();if(r.width>4&&r.height>4&&all[i].offsetParent!==null&&!all[i].closest('#b3All'))n++;}return n;}
  function later(){clearTimeout(pT);pT=setTimeout(function(){try{if(typeof curTab!=='undefined'&&curTab==='Map')pass();}catch(e){warn('pass',e);}},0);}
  B.hook('map',function(el){try{pass();}catch(e){warn('map',e);}later();
    /* телефон: карта прокручивается к выбранной земле (mapFocus) — Сорока уезжала за верх; держим верх вкладки (панель «Выступить» закреплена внизу) */
    if(on()&&!isWide()&&!allMode)setTimeout(function(){var t=$i('tabMap');if(t&&t.classList.contains('on'))t.scrollTop=0;},60);},99);
  B.hook('chInfo',later,99);
  if(typeof window.renderChInfo==='function'){var _rc=window.renderChInfo;window.renderChInfo=function(){if(on()){try{purge();}catch(e){}}var r=_rc.apply(this,arguments);if(on())later();return r;};}
  B.hook('tab',function(t){if(t!=='Map')allMode=0;try{dots(t);}catch(e){}});
  B.hook('menu',function(){try{dots();}catch(e){}});
  B.hook('late',function(){later();});

  /* точки «новое» на вкладках — для новостей, скрытых в окне победы */
  function dots(t){if(!on())return;var s=sv(),d=s.dot||{},k,b;if(t&&d[t]){delete d[t];sav();}
    for(k in TABS){b=document.querySelector('nav button[data-tab="'+k+'"]');if(b)b.classList.toggle('b3dot',!!d[k]&&k!==t);}}

  /* ================= 4. ОКНО ПОБЕДЫ / ПОРАЖЕНИЯ И ГИБЕЛИ ================= */
  function heroNm(){try{return (HERO_BY[S.hero]||HEROES[0]).name.split(' ')[0];}catch(e){return '';}}
  function rep(g,w){if(g.b3rep&&g.b3rep.w===w)return g.b3rep;var k='win.yaga',v={hero:heroNm(),boss:'',t:fmtTime(g.t||0),n:g.b3tr|0},mn=g.b3mn!=null?g.b3mn:1;
    try{v.boss=(EN[g.ch.boss]||{}).n||'';}catch(e){}
    if(!w)k='die.yaga';else if((g.b3tr|0)>=3)k='win.retry';else if(mn<=.25)k='win.low';else if(g.fw&&v.boss)k='win.boss';else if(g.t>0&&g.t<STAR_T*.7)k='win.fast';
    g.b3rep={w:w,k:k,s:B3.say(k,v)};return g.b3rep;}
  function txtOf(e){return (e.textContent||'').replace(/\s+/g,' ');}
  function npri(e,loss){var id=e.id||'',c=typeof e.className==='string'?e.className:'',t=txtOf(e);
    if(/\bkiller\b/.test(c))return 0;
    if(e.querySelector('#rHard'))return 1;
    if(/\bunlock\b/.test(c)){if(t.indexOf(T('Новый богатырь','New hero'))>=0)return 2;if(t.indexOf(T('Подъёмные','A gift from'))>=0)return 2;if(t.indexOf(T('Открыта глава','Chapter'))>=0)return 3;return 4;}
    if(/\btutbox\b/.test(c)&&!/\bdifbox\b/.test(c))return loss?1:9;
    if(e.querySelector('#rUp'))return 5;if(/\bwpn-res\b/.test(c))return 6;if(id==='rZabBox')return 8;
    if(id==='evRes'||id==='evRes2')return 10;if(id==='bylRow')return 11;if(/\bslRes\b/.test(c))return 12;if(id==='tlRes')return 13;if(id==='nvTm')return 14;return 7;}
  function dotFor(e){var t=txtOf(e),c=typeof e.className==='string'?e.className:'';
    if(t.indexOf(T('богатырь','hero'))>=0||t.indexOf(T('облик','outfit'))>=0)return 'Heroes';if(/\bwpn-res\b/.test(c))return 'Forge';
    if(e.id==='evRes'||/\bslRes\b/.test(c)||e.id==='evRes2')return 'Quests';if(e.querySelector('#rUp')||/\bunlock\b/.test(c)||e.id==='nvTm'||e.id==='tlRes')return 'Map';return 'Village';}
  var SKIP=/\b(confetti|rstars|stats|goldrow|rmore|btns|socof|prog|b3w0|b3rep)\b/;
  function resWin(m){var g=typeof G!=='undefined'?G:null;if(!g||!g.over||g.endless||g.daily||g.weekly||g.nvm||g.bb2most)return;
    var w=!!BB2.win,h3=m.querySelector('h3');if(!h3)return;css();m.classList.add('b3w');
    var R=rep(g,w),r=$i('b3Rep');if(!r){r=document.createElement('div');r.id='b3Rep';r.className='b3rep';h3.parentNode.insertBefore(r,h3.nextSibling);}
    r.innerHTML=yagaImg()+'<p>'+esc(R.s||(w?T('Победа!','Victory!'):T('Не беда — ещё разок!','No matter — once more!')))+'</p>';
    var sub=null,c,nx;for(c=r.nextElementSibling;c;c=c.nextElementSibling)if(c.tagName==='P'&&/\bsub\b/.test(c.className)&&!/\bslRes\b/.test(c.className)){sub=c;break;}
    var lt=$i('b3Loot');if(!lt){lt=document.createElement('div');lt.id='b3Loot';lt.className='b3w0';}r.parentNode.insertBefore(lt,r.nextSibling);
    var keep=[].slice.call(m.querySelectorAll(':scope>.b3keep'));keep.forEach(function(k){r.parentNode.insertBefore(k,lt);});
    ['.rstars','.goldrow','.stats','.prog'].forEach(function(s){var e=m.querySelector(':scope>'+s);if(e)lt.appendChild(e);});
    if(sub){if(w)sub.classList.add('b3hid');else lt.appendChild(sub);}
    var x2=$i('rX2');if(x2){x2.classList.add('b3x2');lt.appendChild(x2);if(!x2.b3l){x2.b3l=1;x2.addEventListener('click',function(){st('win',{k:'x2'});});}}
    var mo=$i('rMore');if(mo){mo.classList.add('b3mo');lt.appendChild(mo);var rm=m.querySelector(':scope>.rmore');if(rm)lt.appendChild(rm);}
    var bt=m.querySelector(':scope>.btns'),main=$i('rNext')||$i('rForge')||$i('rOk');
    if(bt&&main){if(bt.firstElementChild!==main)bt.insertBefore(main,bt.firstElementChild);main.classList.add('big');bt.classList.add('b3bt');
      var qn=quiet()?qnext():-1;
      try{nx=qn>=0?ORD[qn-1]:(main.id==='rNext'?chNext(g.chi):-1);if(nx>=0&&CH[nx]&&(main.id==='rNext'||qn>=0))main.innerHTML=T('Дальше: глава ','Next: Chapter ')+chPos(nx)+' ➜<small>'+esc(CH[nx].name)+'</small>';}catch(e){}
      /* тишина П1: «Дальше» — сразу в следующую главу (B3P.go), кнопку П1 #b3pNext прячем — крупная «Дальше» одна */
      if(qn>=0){if(main.classList.contains('ghost')){main.classList.remove('ghost');main.classList.add('gold');} /* П6: без кузницы rNext — «призрачная»; в тишине она главная */
        var pn=$i('b3pNext');if(pn&&pn!==main)pn.classList.add('b3hid');[].forEach.call(bt.children,function(x){if(x!==main)x.classList.add('b3hid');});['rSocBox','rMore'].forEach(function(i){var x=$i(i);if(x)x.classList.add('b3hid');});
        /* ui.js вешает свой on('rNext') ПОСЛЕ крючка modal (перезаписывает onclick) — перехват в фазе захвата на .btns (П6) */
        if(!bt.b3q){bt.b3q=1;var mid=main.id;bt.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('button'):null,q2=quiet()?qnext():-1;if(!b||b.id!==mid||q2<0)return;
          e.stopPropagation();e.preventDefault();try{SND.click();}catch(x){}st('win',{k:'next',q:1});
          try{if(window.B3P&&B3P.go){hideModal();B3P.go();}else{hideModal();toMenu('Map');mapSel=ORD[q2-1];setTimeout(function(){if(!inRun())startRun(ORD[q2-1]);},60);}}catch(x){warn('go',x);}},true);}}
      else if(!main.b3l){main.b3l=1;main.addEventListener('click',function(){st('win',{k:'next',q:0});});}}
    /* новости: ≤1 по очереди; при тишине П1 — ни одной */
    var cand=[],i,best=null,bp=99,hid=0;
    for(c=m.firstElementChild;c;c=c.nextElementSibling){if(c===h3||c===r||c===lt||c===sub||c===bt||/\bb3keep\b/.test(c.className||'')||SKIP.test(c.className||'')||c.id==='rSocBox'||c.id==='b3Rep'||c.id==='rMore')continue;cand.push(c);}
    var kp=m.querySelector(':scope>.b3keep,#b3oDie');if(kp)cand=cand.filter(function(x){if(/\bkiller\b/.test(x.className||'')){x.classList.add('b3hid');return false;}return true;});
    var q=quiet();for(i=0;i<cand.length;i++){var p=npri(cand[i],!w);cand[i].b3n=p;if(!q&&p<bp){bp=p;best=cand[i];}}
    var s=sv(),dd=0;for(i=0;i<cand.length;i++){if(cand[i]===best){cand[i].classList.remove('b3hid');continue;}if(!cand[i].classList.contains('b3hid')){cand[i].classList.add('b3hid');}hid++;
      if(!g.b3dots){var t=dotFor(cand[i]);s.dot=s.dot||{};if(!s.dot[t]){s.dot[t]=1;dd=1;}}}
    if(best&&bt&&best.nextElementSibling!==bt)m.insertBefore(best,bt);
    if(!g.b3dots){g.b3dots=1;if(dd)sav();st('win',{k:'show',w:w?1:0,r:R.k,n:best?(best.id||String(best.className).split(' ')[0]||'x'):'-',h:hid,q:q?1:0});}}
  function resDie(m){var g=typeof G!=='undefined'?G:null;if(!g)return;css();m.classList.add('b3w');var h3=m.querySelector('h3'),d=$i('b3Die');
    if(h3&&!d){d=document.createElement('div');d.id='b3Die';d.className='b3rep';h3.parentNode.insertBefore(d,h3.nextSibling);
      var left=+g.b3left>0?B3.say('die.near',{left:fmtTime(Math.round(+g.b3left))}):'';d.innerHTML=yagaImg()+'<p>'+esc(B3.say('die.yaga',{})||'')+(left?'<small>'+esc(left)+'</small>':'')+'</p>';}
    var bt=m.querySelector(':scope>.btns'),k=m.querySelectorAll(':scope>.b3keep,:scope>#b3oDie');if(bt&&k.length){[].forEach.call(k,function(x){m.insertBefore(x,bt);});var kl=m.querySelector(':scope>.killer');if(kl)kl.classList.add('b3hid');}}
  B.hook('modal',function(kind,m){if(!on()||!m)return;try{if(kind==='result')resWin(m);else if(kind==='death')resDie(m);}catch(e){warn('res',e);}},97);

  /* ================= 5. ОБЛАЧКО В БОЮ: одно за раз, не за краем ================= */
  B.hook('frame',function(dt,g){if(!g||!g.hero)return;var hp=g.hero.max>0?g.hero.hp/g.hero.max:1;if(g.b3mn==null||hp<g.b3mn)g.b3mn=hp;
    if(on()&&g.bub&&g.bub.length>1)g.bub.splice(0,g.bub.length-1);});
  if(typeof window.drawBubble==='function'){var _db=window.drawBubble;window.drawBubble=function(b){if(!on())return _db(b);try{return bub(b);}catch(e){return _db(b);}};}
  function bub(b){var c=ctx,e=b.e,H=G.hero;if(e!==H&&!onScreen(e,0))return; /* говорящий за краем — облачко не рисуем (раньше висело за краем) */
    var x=e.x,y=e.y-(e.r||16)*(e.sc||1)-(e===H?40:18),q=b.t/b.dur,a=q<.1?q/.1:q>.85?(1-q)/.15:1,fs=Math.round(Math.max(14,13.5/VIEW.zoom)),pad=8/VIEW.zoom,mw=Math.min(fs*12,VIEW.ww*2-2*pad-18);
    worldT();c.globalAlpha=a;c.font='700 '+fs+'px '+CVL.font;
    if(!b.lines||b.fs!==fs||b.mw!==mw){b.fs=fs;b.mw=mw;b.lines=wrapText(c,b.s,mw);b.w=Math.min(VIEW.ww*2-2*pad,Math.max.apply(null,b.lines.map(function(l){return c.measureText(l).width;}))+18);}
    var lh=fs*1.2,h=b.lines.length*lh+8,w=b.w,topY=VIEW.cy-VIEW.wh+((window.__safeTop||0)+(G.boss&&!G.boss.dead?136:92))/VIEW.zoom,botY=VIEW.cy+VIEW.wh-pad;
    var bx=clamp(x,VIEW.cx-VIEW.ww+w/2+pad,Math.max(VIEW.cx-VIEW.ww+w/2+pad,VIEW.cx+VIEW.ww-w/2-pad)),by=clamp(Math.max(y,topY+h),topY+h,Math.max(topY+h,botY));
    if(G.banner&&G.banR){var s1=(by-VIEW.cy)*VIEW.zoom+VIEW.H/2,s0=s1-h*VIEW.zoom;if(s1>G.banR[0]-4&&s0<G.banR[1]+4)by=Math.min(botY,e.y+(e===H?40:(e.r||16)*(e.sc||1)+10)+h);}
    var tx=clamp(x,bx-w/2+10,bx+w/2-10);
    c.fillStyle=CVL.bub;rr(c,bx-w/2,by-h,w,h,10);c.fill();if(CVL.bubE){c.lineWidth=1.6/VIEW.zoom;c.strokeStyle=CVL.bubE;c.stroke();}
    if(by===y&&Math.abs(tx-x)<1){c.beginPath();c.moveTo(tx-5,by-1);c.lineTo(tx+5,by-1);c.lineTo(tx,by+6);c.fill();}
    c.fillStyle=CVL.bubT;c.textAlign='center';c.textBaseline='middle';b.lines.forEach(function(l,i){c.fillText(l,bx,by-h+4+lh*(i+.5));});c.globalAlpha=1;}

  /* ================= стили (≥16 px, кнопки ≥48 px) ================= */
  var cssOk=0;
  function css(){if(cssOk)return;cssOk=1;var s=document.createElement('style');s.id='b3DverCss';s.textContent=
    '.b3mag{width:52px;height:52px;flex:none}.b3ya{width:52px;height:52px;flex:none;object-fit:contain}'+
    '.b3s{text-align:left}.b3sh{display:flex;gap:10px;align-items:center;margin:0 0 8px}.b3sh b{display:block;font-size:20px}.b3sh small{display:block;font-size:16px;opacity:.85;line-height:1.3}'+
    '.b3sr{display:flex;align-items:center;gap:8px;width:100%;min-height:48px;margin:0 0 6px;padding:8px 12px;border-radius:12px;border:1px solid rgba(255,216,74,.45);background:rgba(255,216,74,.12);color:inherit;font:600 16px/1.3 inherit;text-align:left;cursor:pointer}'+
    '.b3sr i{margin-left:auto;font-style:normal;font-size:20px;opacity:.7}.b3sd{background:rgba(120,200,255,.12);border-color:rgba(120,200,255,.45)}'+
    '.b3sg{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 6px;padding:8px 12px;border-radius:12px;background:rgba(138,240,160,.14);font-size:16px;line-height:1.3}.b3sg span{flex:1 1 150px}'+
    '.b3x2{min-height:48px!important;font-size:16px!important;padding:6px 12px!important;flex:none;width:auto!important;margin:0!important}'+
    '.b3sb{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 6px;font-size:16px}.b3sb span{flex:1 1 150px}.b3sb .btn{min-height:48px;font-size:16px;width:auto;margin:0}'+
    '#tabMap.b3t>.gobar{position:static;margin:0 0 10px;padding:0;background:none}'+
    '#b3Top{display:flex;flex-direction:column;gap:8px;margin:0 0 10px}.mapR #b3Top{margin:10px 0}'+
    '.b3sc,.b3ab,.b3ev{display:flex;align-items:center;gap:10px;width:100%;min-height:52px;padding:8px 12px;border-radius:14px;border:2px solid var(--wood,#c9a45a);background:var(--parch,#2a2238);color:var(--ink,#fff);font:600 16px/1.3 inherit;text-align:left;cursor:pointer;box-sizing:border-box}'+
    '.b3sc .b3mag{width:44px;height:44px}.b3sc span,.b3ab span,.b3ev span{flex:1;min-width:0}.b3sc b,.b3ev b,.b3ab b{display:block;font-size:16px}.b3sc em{display:block;font-style:normal;font-size:16px;opacity:.85}'+
    '.b3ab small,.b3ev small{display:block;font-size:16px;opacity:.8;font-weight:500}.b3ab i,.b3ev i{font-style:normal;font-size:22px;opacity:.7}.b3ev img{width:40px;height:40px}.b3ei{font-size:30px;flex:none}'+
    '#b3Ev .evl{margin:0}.b3bk{margin:0 0 10px}'+
    '#tabMap.b3A .b3m{display:none!important}#tabMap:not(.b3A) #b3All{display:none}#b3AllL>*{margin-bottom:10px}'+
    '.b3t #chStars{cursor:default}.b3t #umRow{cursor:pointer}.b3t #umRow .umb{pointer-events:none}'+
    '#difRow.b3dc:not(.b3x) .difseg>button:not(.on){display:none}#difRow.b3dc:not(.b3x) .difseg>button.on::after{content:" ▾"}#difRow.b3dc:not(.b3x) .difseg{justify-content:flex-start}'+
    'nav button.b3dot::after{content:"";position:absolute;top:4px;right:18%;width:10px;height:10px;border-radius:50%;background:#ff4a4a;box-shadow:0 0 0 2px #fff}'+
    '#mBody.b3w .b3hid{display:none!important}.b3rep{display:flex;gap:10px;align-items:center;text-align:left;margin:0 0 8px;padding:8px 10px;border-radius:12px;background:rgba(184,107,255,.14)}'+
    '.b3rep p{margin:0;font-size:16px;line-height:1.35;font-weight:600}.b3rep small{display:block;margin-top:4px;font-size:16px;color:#a33a12}'+
    '#b3Loot{margin:0 0 8px}#b3Loot>*{margin-bottom:6px}#b3Loot .b3x2{display:block;max-width:92%;white-space:normal;margin:4px auto 0!important;font-size:16px!important}#b3Loot .b3mo{display:block;margin:2px auto 0;min-height:44px;font-size:16px}'+
    '.b3bt .btn.big{flex-wrap:wrap;justify-content:center}.b3bt .btn.big small{display:block;flex-basis:100%;font-size:16px;font-weight:600;opacity:.9}.b3bt>.btn:not(.big){min-height:48px;font-size:16px}';
    document.head.appendChild(s);}
})();
