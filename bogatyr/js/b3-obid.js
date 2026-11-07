/* ===== b3-obid.js — Богатырь 3.0 волна 1, П3 «Обидчик» (07.11): кто сгубил — получает имя и звание, ждёт реванша вожаком с именем и полоской,
   повержен — баннер, трофей земли, простой суд строкой (пощадить/прогнать). Набор b3x. Без ?. ?? .finally
   Флаг части 'obid' (B3.open('obid'): новичку сразу, старому игроку с 3-го дня 3.0); ?bb2=-b3obid / ?bb2=-b3 — как было.
   Сохранение S.bb2.b3o (≤2000 знаков): {o:[{i,k,g,n,p,r,c,t,a,d,v,dt}], h, bd, ts}
     i — id, k — вид нечисти (EN), g — 1 женский род, n/p — номер имени/прозвища в банке, r — сколько раз сгубил (звание), c — глава (слот), t — день последней победы над тобой,
     a — день появления, d — 1 повержен, v — ''|'m' пощажён|'x' прогнан, dt — день, когда повержен; h — всего повержено; bd — день последнего хвастовства.
   Наружу (П4): window.B3O = {list(), brag(), killer(G)}; для П5 — B3O.names(ru,en,female) / B3O.nicks(ru,en) — дописать имена в конец банка (номера сохранённых не съезжают).
   STAT: B3.stat('obid_new'|'obid_rank'|'obid_rev'|'obid_meet'|'obid_down'|'obid_spare'|'obid_bye', {…}). */
(function(){
  if(typeof B3==='undefined'||typeof BB2!=='object')return;var B=BB2,MAX=3;
  /* ---------- банки имён (вид × имя-прозвище). Только дописывать в конец! ---------- */
  var NM={ru:['Гоша','Валера','Толик','Жора','Вася','Петя','Митя','Сеня','Федя','Гена','Стёпа','Кеша','Лёва','Боря','Гриша','Витя','Славик','Тёма','Фома','Ероша',
      'Тимоша','Прохор','Кузя','Савва','Филя','Еремей','Харитон','Лука','Никодим','Афоня','Мартын','Демьян','Игнат','Тихон','Аркаша','Пантелей','Ефим','Матвей','Сава','Нестор'],
    en:['Gosha','Valera','Tolik','Zhora','Vasya','Petya','Mitya','Senya','Fedya','Gena','Styopa','Kesha','Lyova','Borya','Grisha','Vitya','Slavik','Tyoma','Foma','Yerosha',
      'Timosha','Prokhor','Kuzya','Savva','Filya','Yeremey','Khariton','Luka','Nikodim','Afonya','Martyn','Demyan','Ignat','Tikhon','Arkasha','Panteley','Yefim','Matvey','Sava','Nestor']};
  var NF={ru:['Зина','Люся','Глаша','Нюра','Дуся','Клава','Фрося','Маня','Капа','Тоня','Шура','Галя','Зоя','Валя','Луша','Груня','Степанида','Агафья','Пелагея','Матрёна',
      'Акулина','Феня','Тома','Рая','Лида','Фёкла','Аглая','Марфа','Дарья','Прасковья','Евдокия','Ульяна','Устинья','Серафима','Олимпиада','Варвара','Ефросинья','Нина','Лукерья','Мила'],
    en:['Zina','Lyusya','Glasha','Nyura','Dusya','Klava','Frosya','Manya','Kapa','Tonya','Shura','Galya','Zoya','Valya','Lusha','Grunya','Stepanida','Agafya','Pelageya','Matryona',
      'Akulina','Fenya','Toma','Raya','Lida','Fyokla','Aglaya','Marfa','Darya','Praskovya','Yevdokiya','Ulyana','Ustinya','Serafima','Olimpiada','Varvara','Yefrosinya','Nina','Lukerya','Mila']};
  var NK={ru:['Диетолог','Заблуда','Зануда','Обжора','Соня','Растяпа','Неряха','Сластёна','Плакса','Недотрога','Непоседа','Тихоня','Ябеда','Всезнайка','Чистюля','Подлиза',
      'Растрёпа','Кривляка','Бука','Копуша','Пустомеля','Хапуга','Лакомка','Зевака','Простофиля','Жадина','Скряга','Неумёха','Забияка','Бедолага','Огородник','Танцор',
      'Поэт','Философ','Счетовод','Пирожник','Стихоплёт','Лежебока','Мечтатель','Шептун'],
    en:['the Dieter','the Lost','the Bore','the Glutton','the Sleepyhead','the Butterfingers','the Slob','the Sweet Tooth','the Crybaby','the Touchy','the Fidget','the Quiet One',
      'the Tattletale','the Know-It-All','the Neatnik','the Flatterer','the Tousled','the Show-Off','the Grump','the Slowpoke','the Windbag','the Grabber','the Gourmand','the Gawker',
      'the Simpleton','the Miser','the Penny-Pincher','the Bungler','the Brawler','the Poor Soul','the Turnip-Grower','the Dancer','the Poet','the Philosopher','the Bookkeeper',
      'the Pie-Maker','the Rhymester','the Couch Potato','the Dreamer','the Whisperer']};
  var TT={ru:['Задира','Богатыреборец','Гроза богатырей','Лихо Неминучее'],en:['Bully','Hero-Basher','Terror of Heroes','Woe Unavoidable']};
  /* запасные строки (П5 кладёт основной банк поверх) */
  B3.bank('obid.die',{ru:['«Передай кузнецу: пусть точит лучше.»','«Приходи ещё. Мне понравилось.»','«Я тебя записал в книжечку. Красивым почерком.»','«Не плачь, богатырь. Это я от радости рычу.»'],
    en:['“Tell your blacksmith to sharpen better.”','“Come again. I enjoyed that.”','“I wrote you down in my little book. In my best handwriting.”','“Don’t cry, hero. I’m only roaring with joy.”']});
  B3.bank('obid.yaga',{ru:['Яга: «Ишь, зазнался! Сходи, сбей с него спесь — я за тебя.»','Яга: «Триста лет живу — такого нахала не видала. Реванш, касатик!»','Яга: «Запомни его морду. Хотя её забудешь…»'],
    en:['Yaga: “Look how full of himself he is! Go knock him down a peg — I’m rooting for you.”','Yaga: “Three hundred years — never seen such cheek. Rematch, dearie!”','Yaga: “Remember that face. As if you could forget it…”']});
  B3.bank('obid.brag',{ru:['{name} хвастался всю ночь: «Сгубил богатыря! Уже {n} раз!» Ждёт реванша.','{name} рассказывает всему лесу, как одолел тебя ({n}). Лес устал слушать.','{name} заказал себе медаль за тебя ({n}). Пока из лопуха.'],
    en:['{name} bragged all night: “Took down a hero! {n} times now!” Awaiting a rematch.','{name} keeps telling the whole forest how they beat you ({n}). The forest is tired of it.','{name} ordered a medal for beating you ({n}). Made of burdock, for now.']});
  B3.bank('obid.down',{ru:['{name} повержен{a}!'],en:['{name} is down!']}); /* {a} — окончание рода: '' или 'а' */
  B3.bank('obid.come',{ru:['Опять ты? Я тебя помню!','Ну здравствуй. Скучал?','Реванш? Ну попробуй!'],en:['You again? I remember you!','Well, hello. Missed me?','A rematch? Go on, try!']});

  function on(){return B3.open('obid');}
  function day(){return B3.day();}
  function isO(o){return !!o&&typeof o==='object'&&!Array.isArray(o);}
  function n0(x,m){x=Math.floor(+x||0);return x<0?0:m&&x>m?m:x;}
  function fixO(q){if(!isO(q)||typeof q.k!=='string'||!q.k||q.k.length>24)return null;
    return {i:String(q.i||'').slice(0,10)||'o',k:q.k,g:q.g?1:0,n:n0(q.n,999),p:n0(q.p,999),r:n0(q.r,99)||1,c:n0(q.c,99),t:n0(q.t),a:n0(q.a),d:q.d?1:0,v:q.v==='m'||q.v==='x'?q.v:'',dt:n0(q.dt)};}
  function trim(a){/* не больше 3: первыми уходят поверженные (самые старые), потом самые старые */
    while(a.length>MAX){var j=-1,i;for(i=0;i<a.length;i++)if(a[i].d&&(j<0||a[i].a<a[j].a))j=i;if(j<0){j=0;for(i=1;i<a.length;i++)if(a[i].a<a[j].a)j=i;}a.splice(j,1);}return a;}
  function fix(s){var r={o:[],h:n0(s.h),bd:n0(s.bd),ts:+s.ts||0},i,q;if(Array.isArray(s.o))for(i=0;i<s.o.length&&i<10;i++){q=fixO(s.o[i]);if(q)r.o.push(q);}trim(r.o);return r;}
  function merge(a,b){var nw=(+b.ts||0)>(+a.ts||0)?b:a,od=nw===a?b:a,m={},l=[],i,q,x;
    function add(arr,newer){for(i=0;i<(arr||[]).length;i++){q=fixO(arr[i]);if(!q)continue;x=m[q.i];
      if(!x){m[q.i]=q;l.push(q);continue;}x.r=Math.max(x.r,q.r);x.t=Math.max(x.t,q.t);x.d=x.d||q.d;x.dt=Math.max(x.dt,q.dt);x.c=newer?q.c:x.c;if(q.v&&(newer||!x.v))x.v=q.v;}}
    add(od.o,0);add(nw.o,1);
    return fix({o:l,h:Math.max(n0(a.h),n0(b.h)),bd:Math.max(n0(a.bd),n0(b.bd)),ts:Math.max(+a.ts||0,+b.ts||0)});}
  B.save('b3o',{fix:fix,merge:merge});
  function SS(){return B.s('b3o');}
  function touch(){var s=SS();s.ts=Date.now();try{save();}catch(e){}}
  /* ---------- имена ---------- */
  function lg(){return typeof LANG!=='undefined'&&LANG==='en'?'en':'ru';}
  function pk(b,i){var a=b[lg()]||b.ru;return a[i%a.length];}
  /* основной банк П5 (B3.at/B3.cnt из b3-txt.js: obid.name/namef/nick/title); нет его — свой запасной */
  function at(k,b,i){try{if(B3.at&&B3.cnt&&B3.cnt(k)>0){var r=B3.at(k,i);if(r)return r;}}catch(e){}return pk(b,i);}
  function cnt(k,b){try{if(B3.cnt&&B3.cnt(k)>0)return B3.cnt(k);}catch(e){}return b.ru.length;}
  function ruName(k){try{if(typeof I18D!=='undefined')for(var i=0;i<I18D.length;i++)if(I18D[i][0]===EN[k]&&I18D[i][1]==='n')return String(I18D[i][2]);}catch(e){}return EN[k]?String(EN[k].n):'';}
  function fem(k){var d=EN[k];if(!d)return 0;if(d.g==='f')return 1;var w=ruName(k).split(/[\s\-]/)[0]||'';return /[ая]$/.test(w)?1:0;}
  function shortN(o){return at(o.g?'obid.namef':'obid.name',o.g?NF:NM,o.n)+(lg()==='en'?' ':'-')+at('obid.nick',NK,o.p);}           // «Гоша-Диетолог»
  function fullN(o){return (EN[o.k]?EN[o.k].n+' ':'')+shortN(o);}                             // «Упырь Гоша-Диетолог»
  function title(o){var n=cnt('obid.title',TT);return at('obid.title',TT,Math.min(n,o.r)-1);}
  function q(s){s=String(s||'');return !s||/^[«“"]/.test(s)?s:L('«'+s+'»','“'+s+'”');}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function find(id){var a=SS().o,i;for(i=0;i<a.length;i++)if(a[i].i===id)return a[i];return null;}
  function pub(o){return o?{id:o.i,k:o.k,name:fullN(o),short:shortN(o),rank:o.r,title:title(o),kills:o.r,ch:o.c,down:o.d,v:o.v}:null;}
  function camp(g){return !!g&&!!g.dif&&!g.endless&&!g.daily&&!g.weekly&&!g.first&&g.chi>0;}
  function face(k,px){try{return ic(k,px||120);}catch(e){return '';}}
  /* ---------- гибель: новый обидчик или звание выше ---------- */
  function onLose(g){var k=g.lastBy,s,a,o,i,ex=null;if(!(g.falls>0)||typeof k!=='string'||!EN[k]||EN[k].prop||k==='egg')return;
    s=SS();a=s.o;for(i=0;i<a.length;i++)if(a[i].k===k&&!a[i].d){ex=a[i];break;}
    if(ex){ex.r=Math.min(99,ex.r+1);ex.t=day();ex.c=g.chi;o=ex;B3.stat('obid_rank',{k:k,r:ex.r,c:g.chi});}
    else{o={i:(Date.now()%1e9).toString(36),k:k,g:fem(k),n:0,p:Math.floor(Math.random()*cnt('obid.nick',NK)),r:1,c:g.chi,t:day(),a:day(),d:0,v:'',dt:0};
      /* без одинаковых имён в списке */
      var nb=cnt(o.g?'obid.namef':'obid.name',o.g?NF:NM);o.n=Math.floor(Math.random()*nb);
      for(i=0;i<a.length;i++)if(a[i].n===o.n&&a[i].g===o.g)o.n=(o.n+5)%nb;
      a.push(o);trim(a);B3.stat('obid_new',{k:k,c:g.chi,n:a.length});}
    g.b3oK=o.i;touch();}
  /* ---------- в бою ---------- */
  var pend=null;                                                                             // Реванш: id обидчика для следующего похода
  B.hook('run',function(g){if(!on()||!camp(g)){pend=null;return;}var a=SS().o,o=null,i;
    if(pend){o=find(pend);if(o&&(o.d||o.c!==g.chi))o=null;}
    if(!o)for(i=0;i<a.length;i++)if(!a[i].d&&a[i].c===g.chi&&(!o||a[i].r>o.r))o=a[i];
    var rev=!!(pend&&o&&o.i===pend);pend=null;if(!o||!EN[o.k])return;
    var bt=bossT(),t=rev?Math.min(45,bt*.3):bt*.5;
    g.b3o={i:o.i,k:o.k,t:Math.max(8,Math.min(t,bt-20)),e:null,boss:!!EN[o.k].boss,sc:0,rev:rev};if(rev)B3.stat('obid_rev',{k:o.k,c:g.chi,r:o.r});});
  function spawn(g,x){var o=find(x.i);if(!o){x.e=-1;return;}var e,p;
    if(x.boss){/* босс/мини-босс: метим, когда сам выйдет */
      if((x.sc-=1)>0)return;x.sc=20;for(var i=0;i<g.en.length;i++){e=g.en[i];if(e.type===x.k&&!e.dead&&!e.b3o)break;e=null;}if(!e)return;e.hp*=1.15;e.max*=1.15;}
    else{if(g.t<x.t||g.win||g.over)return;p=spawnPos();e=mkEnemy(x.k,p[0],p[1],{elite:1});var m=1.4+.1*Math.min(4,o.r-1);e.hp*=m;e.max=e.hp;e.dmg*=1.1;
      try{banner('⚔ '+fullN(o),L('Твой обидчик вышел! Звание: ','Your nemesis is here! Rank: ')+title(o),3);}catch(er){}}
    e.b3o=o.i;x.e=e;try{say(e,B3.say('obid.come'),2.5);}catch(er){}B3.stat('obid_meet',{k:o.k,c:g.chi,r:o.r,b:x.boss?1:0});}
  B.hook('frame',function(dt,g){var x=g.b3o;if(!x||x.e)return;if(!on()){g.b3o=null;return;}spawn(g,x);});
  B.hook('kill',function(e){if(!e||!e.b3o||typeof G==='undefined'||!G)return;var o=find(e.b3o);if(!o||o.d)return;var s=SS(),tro=0,id;
    o.d=1;o.dt=day();s.h=n0(s.h)+1;G.b3oD=o.i;
    try{id=typeof troOfSlot==='function'?troOfSlot(G.chi):'';if(id&&typeof TRO_DEF!=='undefined'&&TRO_DEF[id]&&typeof TRO_ADD==='function'&&typeof metaOn==='function'&&metaOn('tro')){tro=3;TRO_ADD(id,tro);G.b3oTr=id;}}catch(er){tro=0;}
    try{banner(shortN(o)+L(o.g?' повержена!':' повержен!',' is down!'),tro?L('Трофей: ','Trophy: ')+troName(id)+' ×'+tro:L('Отомщён!','Avenged!'),4);}catch(er){}
    B3.stat('obid_down',{k:o.k,c:G.chi,r:o.r,tr:tro});touch();});
  /* имя над головой и своя полоска (координаты экрана, поверх всего) */
  B.hook('drawTop',function(c,g){var x=g.b3o,e,o;if(!x||!x.e||x.e===-1)return;e=x.e;if(e.dead||!onScreen(e,0))return;o=find(x.i);if(!o)return;
    var Bs=VIEW.B,d=VIEW.dpr||1,sx=(cv.width/2+(e.x-VIEW.cx)*Bs)/d,sy=(cv.height/2+(e.y-VIEW.cy)*Bs)/d-e.r*Bs/d*(e.boss?1.4:2.1)-6,w=Math.max(70,e.r*Bs/d*2.6),nm=shortN(o);
    c.save();c.textAlign='center';c.textBaseline='bottom';c.font='900 14px '+(typeof CVL!=='undefined'?CVL.font:'sans-serif');c.lineJoin='round';c.lineWidth=3.5;c.strokeStyle='rgba(0,0,0,.85)';
    c.strokeText(nm,sx,sy-9);c.fillStyle='#ffd45a';c.fillText(nm,sx,sy-9);
    c.fillStyle='rgba(0,0,0,.6)';rr(c,sx-w/2-2,sy-6,w+4,9,4.5);c.fill();c.fillStyle='#e8433a';rr(c,sx-w/2,sy-4,w*clamp(e.hp/e.max,0,1),5,2.5);c.fill();c.restore();});
  B.hook('end',function(g,win){if(!on()||!camp(g))return;if(!win)onLose(g);});
  /* ---------- окна итогов: Реванш (гибель) и суд строкой (повержен) ---------- */
  var CSS='.b3o{display:flex;align-items:center;gap:10px;background:rgba(255,70,60,.12);border:1px solid rgba(255,120,110,.4);border-radius:16px;padding:8px 10px;margin:8px 0;text-align:left;font-size:15px;line-height:1.3}'+
    '.b3o img{width:60px;height:60px;flex:none}.b3o .t{flex:1;min-width:0}.b3o b{display:block;font-size:16px}.b3o i{display:block;font-style:normal;color:#b0421a;font-size:14px;font-weight:800}.b3o small{display:block;color:var(--mut);font-size:14px;margin-top:2px}'+
    '.b3ob{width:100%;margin-top:6px;min-height:52px;font-size:18px}.b3os{display:flex;gap:8px;margin-top:6px}.b3os .btn{flex:1;min-height:48px;font-size:15px;white-space:normal;line-height:1.15}'+
    '.b3w{margin:0 0 10px}.b3w h4{margin:0 0 6px;font-size:16px}.b3w .row{display:flex;align-items:center;gap:8px;padding:4px 0;border-top:1px dashed var(--line)}.b3w .row:first-of-type{border-top:0}'+
    '.b3w img{width:48px;height:48px;flex:none}.b3w .t{flex:1;min-width:0;font-size:15px;line-height:1.25}.b3w .t i{display:block;font-style:normal;color:var(--mut);font-size:14px}.b3w .btn{flex:none;min-height:48px;font-size:15px}.b3w .dn{opacity:.6}';
  function css(){if(document.getElementById('b3oCss'))return;var st=document.createElement('style');st.id='b3oCss';st.textContent=CSS;document.head.appendChild(st);}
  function goRev(id,src){var o=find(id);if(!o||o.d)return;var ch=o.c;try{if(typeof chOpen==='function'&&!chOpen(ch))return;}catch(e){}
    pend=id;B3.stat('obid_rev',{k:o.k,c:ch,s:src});try{SND.click();}catch(e){}
    if(src==='die'&&typeof G!=='undefined'&&G){var ad=false;try{ad=interReady(G.t);}catch(e){}try{save();}catch(e){}try{mapSel=ch;}catch(e){}toMenu('Map');
      if(ad)showInterstitial(function(){startRun(ch);});else setTimeout(function(){startRun(ch);},60);}
    else{try{mapSel=ch;}catch(e){}startRun(ch);}}
  function sud(id,v){var o=find(id);if(!o||o.v)return;o.v=v;B3.stat(v==='m'?'obid_spare':'obid_bye',{k:o.k,c:o.c,r:o.r});touch();var el=document.getElementById('b3oSud');if(el)el.innerHTML=sudDone(o);}
  function sudDone(o){var n=esc(shortN(o));return '<div class="b3o b3keep"><img src="'+face(o.k,120)+'" alt=""><div class="t">'+(o.v==='m'?
    L(n+(o.g?' пощажена':' пощажён')+' — пашет у тебя в деревне. Ворчит, но пашет.',n+' is spared and now plows your village fields. Grumbling, but plowing.'):
    L(n+(o.g?' прогнана':' прогнан')+' за тридевять земель. Без тапок.',n+' is chased beyond thrice-nine lands. Without slippers.'))+'</div></div>';}
  B.hook('modal',function(kind,m){if(kind!=='result'||!on()||typeof G==='undefined'||!G||!camp(G))return;var o,h;css();
    if(G.b3oD&&(o=find(G.b3oD))){
      h=o.v?sudDone(o):'<div class="b3o b3keep"><img src="'+face(o.k,120)+'" alt=""><div class="t"><b>'+esc(B3.say('obid.down',{name:fullN(o),a:o.g?'а':''}))+'</b>'+
        '<small>'+(G.b3oTr?L('Трофей в тереме: ','Trophy in the Terem: ')+esc(troName(G.b3oTr))+' ×3. ':'')+L(o.g?'Что с ней делать?':'Что с ним делать?','What shall we do with them?')+'</small>'+
        '<div class="b3os"><button class="btn" id="b3oM">'+L('🤝 Пощадить — пусть пашет','🤝 Spare — let them plow')+'</button><button class="btn ghost" id="b3oX">'+L('👢 Прогнать','👢 Chase off')+'</button></div></div></div>';
      var d1=B.put(m,'top',h,'b3oSud');if(d1)d1.className='bb2s b3keep';
      var bm=document.getElementById('b3oM'),bx=document.getElementById('b3oX'),id=o.i;
      if(bm)bm.onclick=function(){sud(id,'m');};if(bx)bx.onclick=function(){sud(id,'x');};}
    if(G.b3oK&&!B.win&&(o=find(G.b3oK))&&!o.d){
      h='<div class="b3o b3keep"><img src="'+face(o.k,120)+'" alt=""><div class="t"><b>'+esc(fullN(o))+'</b><i>'+L('Звание: ','Rank: ')+esc(title(o))+(o.r>1?L(' · сгубил'+(o.g?'а':'')+' тебя '+o.r+' '+plu(o.r,'раз','раза','раз','',''),' · beat you '+o.r+' times'):'')+'</i>'+
        '<small>'+esc(q(B3.say('obid.die')))+'</small></div></div><button class="btn big b3ob" id="b3oRev">'+L('⚔ Реванш','⚔ Rematch')+'</button>';
      var d2=B.put(m,'top',h,'b3oDie');if(d2)d2.className='bb2s b3keep';var id2=o.i,br=document.getElementById('b3oRev');if(br)br.onclick=function(){goRev(id2,'die');};}});
  /* ---------- «Разыскивается» на вкладке «В поход» (П4 ставит 3-м блоком; без П4 — вверху #chInfo) ---------- */
  function wantHTML(){var a=SS().o,i,o,r='';if(!a.length)return '';
    for(i=0;i<a.length;i++){o=a[i];r+='<div class="row'+(o.d?' dn':'')+'"><img src="'+face(o.k,96)+'" alt=""><div class="t"><b>'+esc(shortN(o))+'</b><i>'+(EN[o.k]?esc(EN[o.k].n)+' · ':'')+
      (o.d?(o.g?L('✓ повержена','✓ defeated'):L('✓ повержен','✓ defeated'))+(o.v==='m'?L(' · пашет в деревне',' · plows the village'):o.v==='x'?(o.g?L(' · прогнана',' · chased off'):L(' · прогнан',' · chased off')):''):
        esc(title(o))+(typeof chPos==='function'?L(' · глава ',' · chapter ')+chPos(o.c):''))+'</i></div>'+
      (o.d?'':'<button class="btn" data-b3o="'+esc(o.i)+'">'+L('Реванш ›','Rematch ›')+'</button>')+'</div>';}
    return '<div class="card b3w"><h4>'+L('📜 Разыскивается','📜 Wanted')+'</h4>'+r+'</div>';}
  function want(host){if(!host)return;var old=document.getElementById('b3oWant');if(!on()||!SS().o.length){if(old&&old.parentNode)old.parentNode.removeChild(old);return;}css();
    var d=old||document.createElement('div');d.id='b3oWant';d.className='bb2s b3keep';d.innerHTML=wantHTML();
    if(!old)host.insertBefore(d,host.firstChild);
    d.onclick=function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-b3o]');if(b)goRev(b.getAttribute('data-b3o'),'want');};}
  B.hook('chInfo',function(slot,sel,info){if(document.getElementById('b3oWant')&&!(info&&info.contains(document.getElementById('b3oWant')))){want(document.getElementById('b3oWant').parentNode);return;}want(info);});
  B.hook('map',function(el){var w=document.getElementById('b3oWant');if(w)want(w.parentNode);});
  /* ---------- API для П4 и П5 ---------- */
  window.B3O={
    list:function(){if(!on())return [];var a=SS().o,r=[],i;for(i=0;i<a.length;i++)r.push(pub(a[i]));return r;},
    /* хвастовство для Сороки: не чаще 1 в день, только непобеждённый, сгубивший тебя не сегодня */
    brag:function(){if(!on())return '';var s=SS(),a=s.o,o=null,i,t=day();if(s.bd===t)return '';
      for(i=0;i<a.length;i++)if(!a[i].d&&a[i].t<t&&(!o||a[i].t>o.t))o=a[i];if(!o)return '';s.bd=t;touch();return B3.say('obid.brag',{name:fullN(o),n:o.r});},
    killer:function(g){g=g||(typeof G!=='undefined'?G:null);if(!g||!g.b3oK||!on())return null;return pub(find(g.b3oK));},
    html:wantHTML,                                                                                  // П4: блок «Разыскивается» строкой (или '')
    names:function(ru,en,f){var b=f?NF:NM;if(ru&&en&&ru.length===en.length){b.ru=b.ru.concat(ru);b.en=b.en.concat(en);}},
    nicks:function(ru,en){if(ru&&en&&ru.length===en.length){NK.ru=NK.ru.concat(ru);NK.en=NK.en.concat(en);}},
    _t:{onLose:onLose,find:find,full:fullN,fix:fix,merge:merge}};
})();
