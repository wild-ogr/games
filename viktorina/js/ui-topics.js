/* ui-topics.js — экран тем «полками» (поток UX, буст 09.10; макет 06-mock/topics-polki.html). Данные — js/topics.js (CONTENT, window.VTOP).
   Полки: праздник (сезонная тема — только в свои дни), Ностальгия / Дом и двор / Знания / Мир и природа. Открытые темы — плитками,
   ближайшая закрытая — плиткой с замком и датой, остальные закрытые — строкой «Скоро на полке». Новинка (7 дней) — метка «новое»
   до первого захода в тему (S.tips['nw_<тема>']). Нажатие — uiPreTopic(тема) (карточка «Разминка · Сразу играть», если её дали гнёзда). */
(function(){'use strict';
  var W=window;
  function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function tile(t,o){o=o||{};var k=t.k,st=topicStat(k),c=S.cyc[k]||0,m=TMEDAL(tcOf(k)),w=k===o.wk,nw=o.nw;
    return '<button class="tp'+(w?' wk':'')+(nw?' nw':'')+(o.rec?' rec':'')+'" data-k="'+k+'"><span class="ti">'+t.ic+'</span>'+(m?'<span class="md">'+m+'</span>':'')
      +'<b><span class="tnl">'+e(t.n)+'</span><span class="tns">'+e((o.till&&t.sh)||TSH[k]||t.sh||t.n)+'</span></b>'
      +(o.till?'<span class="tag ft">'+e(o.till)+'</span>':nw?'<span class="tag nwt">'+L('новое','new')+'</span>':w?'<span class="tag"><span class="cl-o">⭐ '+L('тема недели · ','week topic · ')+'</span>×2</span>':o.rec?'<span class="tag rc">👍<span class="cl-o"> '+L('для начала','good start')+'</span></span>':'')
      +'<small>'+(c?L('круг ','round ')+(c+1)+' · ':'')+st.s+' '+L('из','of')+' '+st.n+'</small><span class="bar"><i style="width:'+(st.n?Math.round(100*st.s/st.n):0)+'%"></i></span></button>';}
  function lockTile(t){return '<button class="tp lock" data-lock="'+t.k+'"><span class="ti">'+t.ic+'</span><span class="md">🔒</span><b><span class="tnl">'+e(t.n)+'</span><span class="tns">'+e(TSH[t.k]||t.sh||t.n)+'</span></b><small class="when">'+e(VTOP.dateTxt(t.from))+'</small><span class="when lk-o">'+e(VTOP.dateTxt(t.from))+'</span></button>';}
  // полка «Праздник»: наборы FEST (VTOP.festNow — сначала праздник, потом сезон; имя/подпись/главный день — от FEST), без FEST — VTOP.seasonNow
  function fnow(){try{return typeof nowMs==='function'?nowMs():Date.now();}catch(_){return Date.now();}}
  function festShelf(wk){var ms=fnow(),ks=[];
    if(VTOP.festNow){try{VTOP.festNow(ms).forEach(function(t){if(ks.length<3)ks.push(t.k);});}catch(_){}}
    else{var sn=VTOP.seasonNow&&VTOP.seasonNow(ms);if(sn)ks.push(sn.k);}
    ks=ks.filter(function(k){return TN[k]&&TK.indexOf(k)>=0&&(BYT[k]||[]).length>=10;});if(!ks.length)return '';
    var pk=VTOP.festPeak&&ks.some(function(k){return VTOP.festPeak(k,ms);});
    var h='<div class="shelf fest"><div class="shh"><h4>'+e((TN[ks[0]].ic||'🎉')+' '+L('Праздник во дворе','Holiday'))+'</h4><span>'+(pk?'<b class="fpk">'+L('Сегодня праздник!','Holiday today!')+'</b>':L('только в эти дни','these days only'))+'</span></div><div class="shg">';
    ks.forEach(function(k){var t=TN[k],o={n:VTOP.festName&&VTOP.festName(k)||t.n,sh:VTOP.festSh&&VTOP.festSh(k)||t.sh,till:VTOP.festTill&&VTOP.festTill(k,ms)||''};
      h+=tile({k:k,ic:t.ic,n:o.n,sh:o.sh},{wk:wk,till:o.till});});
    return h+'</div></div>';}
  function html(){var wk=weekTopic(),rec=S.games?[]:['ussr','kino','kitchen'],now=(typeof nowMs==="function"?nowMs():Date.now()),h='';
    h+='<button class="tp all" data-k="all"><span class="ti">🎲</span><span><b>'+L('Всё подряд','Mixed')+'</b><small>'+L('вопросы из всех тем','questions from every topic')+(S.tp.all?' · ⭐ '+S.tp.all:'')+'</small></span></button>';
    if(!W.VTOP){h+='<div class="shg">';TOPICS.forEach(function(t){if(TK.indexOf(t.k)>=0)h+=tile(t,{wk:wk,rec:rec.indexOf(t.k)>=0});});return h+'</div>';}
    var nl=VTOP.nextLocked?VTOP.nextLocked(now):[],first=nl[0]&&nl[0].k;
    h+=festShelf(wk);
    VTOP.shelves.forEach(function(sh){var ts=VTOP.list.filter(function(t){return t.shelf===sh.k;}),open=[],soon=[],big='';
      ts.forEach(function(t){if(TK.indexOf(t.k)>=0&&(BYT[t.k]||[]).length>=10||TK.indexOf(t.k)>=0&&!qReady)open.push(t);else if(t.from&&!VTOP.isOpen(t.k,now))(t.k===first?(big=lockTile(t)):soon.push(t));});
      // новинка — первой на полке
      open.sort(function(a,b){return (VTOP.isNew(b.k,now)?1:0)-(VTOP.isNew(a.k,now)?1:0);});
      var qn=0;open.forEach(function(t){qn+=(BYT[t.k]||[]).length;});
      h+='<div class="shelf"><div class="shh"><h4>'+e(sh.n)+'</h4><span>'+open.length+' '+pl(open.length,'тема','темы','тем','topic','topics')+(qn?' · '+qn+' '+pl(qn,'вопрос','вопроса','вопросов','question','questions'):'')+'</span></div><div class="shg">';
      open.forEach(function(t){h+=tile(t,{wk:wk,rec:rec.indexOf(t.k)>=0,nw:VTOP.isNew(t.k,now)&&!(S.tips&&S.tips['nw_'+t.k])});});
      h+=big+'</div>';
      if(soon.length)h+='<div class="soonl">🔒 '+L('Скоро на полке: ','Coming soon: ')+soon.map(function(t){return '<span>'+e(t.n)+' <i>'+e(VTOP.dateTxt(t.from))+'</i></span>';}).join(' · ')+'</div>';
      h+='<div class="plank lk-o"></div></div>';});
    return h;}
  function bind(g){[].forEach.call(g.querySelectorAll('.tp[data-k]'),function(b){b.onclick=function(){SND.tap();var k=b.getAttribute('data-k');
      if(k!=='all'&&b.classList.contains('nw')){if(!isObj(S.tips))S.tips={};S.tips['nw_'+k]=1;save();}uiPreTopic(k);};});
    [].forEach.call(g.querySelectorAll('.tp[data-lock]'),function(b){b.onclick=function(){SND.tap();var t=TN[b.getAttribute('data-lock')];
      toast(L('Тема «','Topic «')+t.n+L('» откроется ','» opens ')+VTOP.dateTxt(t.from)+L(' — Михалыч уже пишет вопросы!',''),3000);};});}
  W.UIT={html:html,bind:bind};
})();
