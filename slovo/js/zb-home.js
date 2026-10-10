'use strict';
/* ================= zb-home — «Дом»: главный экран-хаб нового вида (поток VIEW, 10.10.2026) =================
   «Дом» — это старый экран #menu (openMenu() как был: гостинец, соседки, реплики, облако — всё прежнее), только разложен иначе:
     сцена — место текущей главы (рисунок ART через ZB.placeInto), на ней Зина с котом (#heroArt), реплика (#mSay), звание (#mRank),
             монеты и кнопки звука (.mtop);
     карточка главы — «🥕 Глава 3 · Рынок 6/20», полоска точками, «в конце главы — …» (гнёзда winSlots тут не участвуют);
     «Играть · урок N» (#btnPlay — старая кнопка, её обработчик);
     zone 'today' (SCHOOL — «Сегодня у Зины»; пусто — свои плитки), старые живые кнопки (#btnSos, #btnGift, #mTmr, #mGoal — переносятся сюда
     как есть, их обновляет старый код), zone 'school', zone 'side' (ПК — правая колонка), zone 'bottom'.
   Старые кнопки меню (Главы, Задание дня, Словарь, Облики, Рейтинг, Игры) спрятаны стилем — их входы: нижняя панель и «Школа» (ZB.vwMore).
   ZB.viewOn=false — ничего этого нет, #menu старый. */
(function(){
  if(typeof ZB==='undefined'||!ZB.vw)return;
  function $(id){return document.getElementById(id);}
  var esc=ZB.esc,built=false;
  function build(){var m=$('menu');if(!m||built)return !!built;built=true;
    var top=$('zbHomeTop'),mtop=m.querySelector('.mtop'),hero=$('heroArt'),say=$('mSay'),rank=$('mRank'),play=$('btnPlay');
    var wrap=document.createElement('div');wrap.className='zbh';wrap.id='zbHub';
    wrap.innerHTML='<div class="zbh-scene" id="zbScene"><div class="zbh-bg" id="zbSceneBg"></div><div class="zbh-veil"></div>'+
        '<div class="zbh-chip" id="zbRank"></div><div class="zbh-say" id="zbSayBox"></div><div class="zbh-hero" id="zbHero"></div></div>'+
      '<div class="zbh-col" id="zbCol"><div class="zbh-chap" id="zbChap"></div><div class="zbh-play" id="zbPlay"></div>'+
        '<div class="zbh-today" id="zbToday"></div><div class="zbh-old" id="zbOld"></div><div class="zbh-school" id="zbSchool"></div>'+
        '<div class="zbh-side" id="zbSide"></div><div class="zbh-bottom" id="zbBottom"></div></div>';
    m.insertBefore(wrap,m.firstChild);
    if(top)wrap.insertBefore(top,wrap.firstChild);
    var sc=$('zbScene');if(mtop)sc.appendChild(mtop);
    if(rank)$('zbRank').appendChild(rank);if(say)$('zbSayBox').appendChild(say);if(hero)$('zbHero').appendChild(hero);
    if(play)$('zbPlay').appendChild(play);
    // живые старые кнопки: соседки (её создаёт sosedki.js перед #btnGift — в том же родителе), гостинец, «Завтра», цель облика
    var old=$('zbOld');['mGoal','btnGift','mTmr'].forEach(function(id){var e=$(id);if(e)old.appendChild(e);});
    var sos=$('btnSos');if(sos)old.insertBefore(sos,old.firstChild);
    return true;}
  // плитка дела (свои, пока SCHOOL не дал «Сегодня у Зины»)
  function tile(o){return '<button type="button" class="zbtile'+(o.cls?' '+o.cls:'')+'" data-t="'+o.k+'"><span class="zi">'+o.ic+'</span><span class="zb"><b>'+esc(o.t)+'</b><small>'+o.s+'</small></span>'+(o.tag?'<em class="ztag'+(o.tagc?' '+o.tagc:'')+'">'+o.tag+'</em>':'')+'</button>';}
  function ownToday(){var L=[],done=!!(S.daily&&S.daily[todayKey()]),n=S.streak||0;
    L.push({k:'daily',ic:'📅',t:'Задание дня',s:done?'решено — приходи завтра':n>=2?'серия '+n+' '+plural(n,'день','дня','дней'):'новый кроссворд',tag:done?'✓':'+'+ECO.daily(1),tagc:done?'ok':'',cls:done?'done':'hot'});
    if(typeof DEFS!=='undefined'){var all=Object.keys(DEFS).length,got=Object.keys(S.dict||{}).filter(function(w){return DEFS[w];}).length;
      L.push({k:'dict',ic:'📖',t:'Словарь',s:got+' из '+all+' открыток',tag:''});}
    return '<div class="zbh-ttl">Сегодня у Зины</div><div class="zbtiles">'+L.map(tile).join('')+'</div>';}
  var TACT={daily:function(){openDaily();},dict:function(){try{dictTab='mine';}catch(e){}if(typeof SND!=='undefined')SND.tap();openDict();}};
  // карточка главы: точки 20 уровней, сейчас — оранжевая
  function chapHtml(){var idx=Math.min(S.lv,LEVELS.length-1),c=ZB.chapAt(idx),ch=ZB.chap(c),len=ch.to-ch.from+1,done=Math.max(0,Math.min(len,S.lv-ch.from)),all=S.lv>=LEVELS.length;
    if(all)return '<div class="zbh-ch"><div class="h"><b>🎓 Все '+LEVELS.length+' уровней пройдены!</b></div><small>Задание дня — каждый день новое.</small></div>';
    var dots='';for(var i=0;i<len;i++)dots+='<i class="'+(i<done?'d':i===done?'c':'')+'"></i>';
    var end=ZB.html(ZB.homeSlots,'chap',{c:c,ch:ch,done:done,len:len});
    return '<button type="button" class="zbh-ch" id="zbChapBtn"><div class="h"><b>'+ch.e+' Глава '+ch.n+' · '+esc(ch.name)+'</b><span class="n">'+done+' / '+len+'</span></div>'+
      '<div class="zdots">'+dots+'</div><small>'+(end||('сейчас — урок '+(S.lv+1)+' · в конце главы — подарок'+(typeof ECO!=='undefined'&&ECO.chap?' +'+ECO.chap+' '+COIN_I:'')))+'</small></button>';}
  var lastPl=-1;
  function render(){if(typeof S==='undefined'||!$('menu'))return;build();
    var ctx={hub:1},idx=Math.min(S.lv,LEVELS.length-1),c=ZB.chapAt(idx);
    ZB.placeInto($('zbSceneBg'),c,'xMidYMid slice');
    var pl=$('playLv');if(pl&&S.lv<LEVELS.length)pl.textContent='· урок '+(S.lv+1);
    var t=$('zbHomeTop');if(t){t.innerHTML=ZB.html(ZB.homeSlots,'top',ctx);ZB.mount(t,ZB.homeSlots.filter(function(s){return s.zone==='top';}),ctx);}
    var ch=$('zbChap');ch.innerHTML=chapHtml();var cb=$('zbChapBtn');if(cb)cb.onclick=function(){if(typeof SND!=='undefined')SND.tap();ZB.go('path');};
    var td=$('zbToday'),th=ZB.html(ZB.homeSlots,'today',ctx);td.innerHTML=th||ownToday();
    if(!th)[].forEach.call(td.querySelectorAll('[data-t]'),function(b){b.onclick=function(){ZB.safe('today',TACT[b.getAttribute('data-t')]);};});
    var z=['school','side','bottom'],ids={school:'zbSchool',side:'zbSide',bottom:'zbBottom'};
    z.forEach(function(k){var e=$(ids[k]);if(e)e.innerHTML=ZB.html(ZB.homeSlots,k,ctx);});
    ZB.mount($('zbHub'),ZB.homeSlots.filter(function(s){return s.zone!=='top';}),ctx);
    var sos=$('btnSos'),old=$('zbOld');if(sos&&old&&sos.parentNode!==old)old.insertBefore(sos,old.firstChild);
    if(ZB.navRender)ZB.navRender();}
  ZB.homeRender=function(){ZB.safe('vw:home',render);};
  // слот 'chap' (новый, необязательный): строка «в конце главы — …» в карточке главы (SCHOOL/CAB: сувенир в музей)
})();
