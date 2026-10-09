/* ui-home.js — главный экран «Двор-студия» и нижняя панель (поток UX, буст 09.10.2026; макет viktorina-boost/06-mock/main-a-studia.html).
   Зовётся из openMenu() → uiHome() → UIH.render(). Встроенные плитки «Сегодня во дворе» — здесь (тема-новинка, сезон, тема недели, гостинец,
   «скоро на полке»); плитки других потоков — через homeSlots (js/ui-core.js). Кнопки нижней панели — navSlots (здесь пять своих).
   Поля сохранения UX: S.uiTopic — тема последней лестницы («Играть» = сразу она), S.uiLast — {g, k:день} итог последней лестницы (реплика Михалыча),
   S.uiAv — портрет игрока (персонаж). Звание и рамка — от CAR (CAR.look()), без него — по RANKS игры. */
(function(){'use strict';
  var W=window;
  function $(id){return document.getElementById(id);}
  function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var cur='scr-menu';
  // ---- нижняя панель: пять своих кнопок (другие потоки могут заменить go по тому же id или добавить свою) ----
  navSlots.push({id:'yard',order:10,ic:'🏠',t:'Двор',go:function(){if(W.UI.has('yard'))UI.go('yard');else UI.go('menu');},on:function(){return cur==='scr-menu';}});
  navSlots.push({id:'topics',order:20,ic:'📚',t:'Темы',go:'topics',on:function(){return cur==='scr-topics';}});
  navSlots.push({id:'doska',order:30,ic:'🎮',t:'Доска',go:'doska',hide:function(){return !UI.has('doska');},on:function(){return cur==='scr-doska';}});
  navSlots.push({id:'medals',order:40,ic:'🏅',t:'Медали',go:'medals'});
  navSlots.push({id:'shop',order:50,ic:'🛒',t:'Лавка',go:'shop'});
  var NAV_ON={'scr-menu':1,'scr-topics':1}; // на каких экранах видна панель (свои экраны-разделы добавляйте UIH.navOn('scr-yard'))
  UI.on('show',function(id){cur=id;var a=$('app');if(a)a.classList.toggle('navOn',!!NAV_ON[id]);if(NAV_ON[id])nav();});

  function nav(){var b=$('navBar');if(!b)return;var it=UI.list(navSlots).filter(function(x){try{return !(x.hide&&x.hide());}catch(_){return false;}}),h='';
    it.forEach(function(x){var d=false,o=false;try{d=x.dot?!!x.dot():false;o=x.on?!!x.on():false;}catch(_){}
      h+='<button class="nb'+(o?' on':'')+'" data-nav="'+e(x.id||'')+'">'+(d?'<span class="dot"></span>':'')+'<span class="nbI">'+e(x.ic||'')+'</span><span class="nbT">'+e(x.t||'')+'</span></button>';});
    b.innerHTML=h;
    [].forEach.call(b.querySelectorAll('[data-nav]'),function(el){el.onclick=function(){var x=it.filter(function(y){return (y.id||'')===el.getAttribute('data-nav');})[0];if(!x)return;
      try{SND.tap();}catch(_){}if(typeof hideModal==='function'&&modalOn)hideModal();if(typeof x.go==='function')x.go();else UI.go(x.go);};});}

  // ---- звание и рамка: CAR.look() → {t, s, f:0..1, fr:'wood'|'bronze'|'silver'|'gold'|'board', ic?}; без CAR — по уровням ----
  var FR=['wood','wood','bronze','bronze','silver','silver','gold','gold','board','board','board','board'];
  function look(){try{if(W.CAR&&typeof CAR.look==='function'){var c=CAR.look();if(c&&c.t)return c;}}catch(_){}
    var lv=S.lvl||0,r=rankOf(lv),i=RANKS.indexOf(r),nx=RANKS.filter(function(x){return x[0]>lv;})[0];
    return{t:r[1],s:'уровень '+(lv+1)+(nx?' · до «'+nx[1]+'» — '+(nx[0]-lv):' · высшее звание!'),
      f:nx?(lv-r[0])/Math.max(1,nx[0]-r[0]):1,fr:FR[Math.min(FR.length-1,Math.max(0,i))]};}
  W.UIH_frame=function(){return look().fr;};

  // ---- реплика Михалыча на главном (только новый вид; в «Классике» — прежняя) ----
  function say(){var lc=lcurOk()?S.lcur:null,t=TK.indexOf(S.uiTopic)>=0?TN[S.uiTopic]:null,ul=S.uiLast,yd=dayKey(-1),td=dayKey(0);
    if(lc)return 'Лестница ждёт: вопрос '+(lc.i+1)+' из 10. Доиграем?';
    var nw=VT&&VT.list.filter(function(x){return VT.isNew(x.k,nowMs());})[0];
    if(nw&&!(S.tips&&S.tips['nw_'+nw.k]))return 'На полке новая тема — «'+nw.n+'»! Загляни в «Темы».';
    var sn=VT&&VT.seasonNow&&VT.seasonNow(nowMs());if(sn&&TK.indexOf(sn.k)>=0&&BYT[sn.k]&&(BYT[sn.k].length>=10||!qReady)){var sN=VT.festName?VT.festName(sn.k):sn.n; // FIX1: время игры (?date=), имя по площадке, сезон — не «праздник»
      return sn.kind==='sea'?'Сезон во дворе: «'+sN+'»! Вопросы про это — до '+(VT.festTill?VT.festTill(sn.k).replace('до ',''):'конца сезона')+'.':'Праздник во дворе: «'+sN+'»! Такие вопросы — только эти дни.';}
    if(ul&&ul.k===yd&&ul.g>0&&ul.g<10)return 'Вчера ты дошёл до '+ul.g+'-й ступеньки. Сегодня — до верха?';
    if(ul&&ul.k===td&&ul.g===10)return 'Всю лестницу прошёл — вот это знаток! Ещё одну?';
    if(ul&&ul.k===td&&ul.g>=5)return 'Хорошо идёшь! '+(t?'Ещё «'+t.n+'» или другую тему?':'Ещё лестницу?');
    return null;}

  // ---- встроенные плитки «Сегодня во дворе» ----
  function wkTile(){var k=weekTopic(),t=TN[k];if(!t)return null;return UI.tile({ic:t.ic,t:'Тема недели',s:t.n+' — монеты ×2',tag:'×2',cls:'yel'});}
  var B=[
    {id:'ux-new',order:5,render:function(){if(!VT)return null;var nw=VT.list.filter(function(x){return VT.isNew(x.k,nowMs());})[0];if(!nw)return null;
      return UI.tile({ic:nw.ic,t:'Тема «'+nw.n+'»',s:'вышла в понедельник',tag:'новое',cls:'red'});},mount:function(el){el.firstChild.onclick=function(){SND.tap();openTopics();};}},
    {id:'ux-season',order:6,render:function(){if(W.FESTV)return null; // FIX1: плитки праздника и сезона рисует fest-vik.js (fest0/fest1) — эта дублировала «Осень во дворе»
      var sn=VT&&VT.seasonNow&&VT.seasonNow(nowMs());if(!sn||TK.indexOf(sn.k)<0)return null;
      return UI.tile({ic:sn.ic,t:sn.n,s:'только в эти дни',tag:'праздник',cls:'red'});},mount:function(el){el.firstChild.onclick=function(){SND.tap();var sn=VT.seasonNow(nowMs());uiPreTopic(sn.k);};}},
    {id:'ux-gift',order:15,render:function(){var g=giftState();if(g.today)return null;return UI.tile({ic:'🎁',t:'Гостинец',s:'от Михалыча — забрать',tag:'+'+g.next,cls:'grn'});},
      mount:function(el){el.firstChild.onclick=function(){SND.tap();showStreak();};}},
    {id:'ux-week',order:60,render:wkTile,mount:function(el){el.firstChild.onclick=function(){SND.tap();uiPreTopic(weekTopic());};}},
    {id:'ux-soon',order:90,render:function(){if(!VT||!VT.nextLocked)return null;var n=VT.nextLocked(nowMs())[0];if(!n)return null;var t=TN[n.k];
      return UI.tile({ic:'🔒',t:'Скоро: «'+t.n+'»',s:'откроется '+VT.dateTxt(n.from),cls:'soon'});},mount:function(el){el.firstChild.onclick=function(){SND.tap();openTopics();};}}
  ];

  function pips(n,on){var h='';for(var i=0;i<n;i++)h+='<i'+(i<on?' class="on"':'')+'></i>';return h;}
  function render(){var lk=W.LK&&LK.on(),lv=S.lvl||0;
    // шапка «кто я»
    var c=look(),av=S.uiAv&&(HELP[S.uiAv]||S.uiAv==='zina')?S.uiAv:'valerka';
    $('meAv').innerHTML=lk?LK.who(av,'happy'):'';$('meAv').className='frm fr-'+(c.fr||'wood');
    $('meRank').textContent=c.t;$('meNext').textContent=c.s||'';$('meBar').style.width=Math.round(100*Math.max(0,Math.min(1,c.f||0)))+'%';
    // реплика и зрители
    if(lk){var l=say();if(l&&!(lkSayG===S.games))$('hostSay').innerHTML='<b class="lk-o">Михалыч: </b>'+e(l);
      $('crowd').innerHTML='<span>'+LK.who('valya','happy')+'</span><span>'+LK.who('kolya','wow')+'</span><span>'+LK.who('zina','happy')+'</span>';}
    // «Играть»: продолжить / сразу тема последней лестницы
    var lc=lcurOk()?S.lcur:null,tp=TK.indexOf(S.uiTopic)>=0?S.uiTopic:null,pc=UI.pc();
    var sub=lc?'уровень '+(lv+1)+' · вопрос '+(lc.i+1)+' из 10':'уровень '+(lv+1)+(tp?' · '+(TN[tp].n):' · 10 вопросов');
    $('btnPlay').innerHTML='▶ '+(lc?'Продолжить':'Играть')+'<span class="cl-o"> — уровень '+(lv+1)+'</span><small class="lk-o">'+e(sub)+'</small><span class="pips lk-o">'+pips(10,lc?lc.i:0)+'</span>'+(pc?'<kbd class="kbd lk-o">Enter</kbd>':'');
    $('btnPlay').classList.toggle('loading',!qReady);
    // режимы
    var bd=$('btnBoard');if(UI.has('board')){bd.style.display='';$('boardSub').textContent=lv<4?'откроется с 5-го уровня':'выбирай тему и цену';bd.classList.toggle('lock',lv<4);}else bd.style.display='none';
    $('topicsSub').textContent=TK.filter(function(k){return !TN[k].season;}).length+' '+pl(TK.length,'тема','темы','тем')+' на полках';
    // лента «Сегодня»
    var n=UI.fill($('homeSlots'),B.concat(homeSlots),{S:S,lvl:lv},'hs');$('scr-menu').classList.toggle('hasHs',n>0);
    nav();if(W.UIF)UIF.menuCoins();}
  function play(){var t=S.uiTopic;if(t&&TK.indexOf(t)>=0&&(S.games||0)>0)uiPreTopic(t);else openTopics();}
  // «кто я»: звание, рамка, выбор портрета (S.uiAv)
  var AVS=['valerka','valya','kolya','mityai','zina'];
  function me(){var c=look(),cur=S.uiAv&&AVS.indexOf(S.uiAv)>=0?S.uiAv:'valerka',h='';
    AVS.forEach(function(id){h+='<button class="avp'+(id===cur?' on':'')+'" data-av="'+id+'"><span class="frm fr-'+(c.fr||'wood')+'">'+LK.who(id,'happy')+'</span></button>';});
    modal('<h2>'+e(c.t)+'</h2><p>'+e(c.s||'')+'</p><p class="about">Рамка у портрета — по званию: от дерева до меди, серебра, золота и «табло»; за победы — особые рамки. Выбери, кто ты во дворе:</p><div class="avpick">'+h+'</div><div class="row">'+(carGo()?'<button class="btn" id="mCar">🏅 Карьера</button>':'')+'<button class="btn green" id="mCancel">Готово</button></div>');
    if($('mCar'))$('mCar').onclick=function(){SND.tap();hideModal();var g=carGo();if(g)g();};
    [].forEach.call(document.querySelectorAll('#mcard [data-av]'),function(b){b.onclick=function(){SND.tap();S.uiAv=b.getAttribute('data-av');save();me();render();};});
    $('mCancel').onclick=hideModal;}
  function carGo(){try{var c=W.CAR&&CAR.look&&CAR.look();if(c&&typeof c.go==='function')return c.go;}catch(_){}return null;}
  // шапка: портрет → выбор портрета; остальное → «Карьера знатока» (CAR.look().go), без CAR — окно «кто я»
  document.addEventListener('DOMContentLoaded',function(){var m=$('meCard');if(m)m.onclick=function(ev){SND.tap();var g=carGo(),onAv=ev&&ev.target&&ev.target.closest&&ev.target.closest('#meAv');
    if(g&&!onAv){try{g();return;}catch(_){}}if(W.LK&&LK.on())me();};});
  W.UIH={me:me,render:render,nav:nav,play:play,look:look,navOn:function(id){NAV_ON[id]=1;}};
  // ПК: Enter на главном = «Играть»
  document.addEventListener('keydown',function(ev){if(ev.repeat||ev.ctrlKey||ev.metaKey||ev.altKey)return;if(typeof modalOn==='undefined'||modalOn)return;
    var m=$('scr-menu');if(!m||!m.classList.contains('on'))return;if(ev.key==='Enter'){ev.preventDefault();$('btnPlay').click();}});
})();
