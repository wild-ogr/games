'use strict';
/* ================= gb-lvl — уровни v2 в игре (поток LVL) =================
   Флаг GB.flag('lvl2') (выключен или нет GBL2 → всё как раньше, уровни v1). Только обёртки функций игры, index.html не правится.
   1) levelFor(i, daily) → генератор v2 (GBL2.gen / GBL2.day) — те же раскладки, что проверяет сторож tools/freeze.sh.
      Редкий товар уровня (карточка «Дефицита» k): сначала ещё не собранные карточки СВОЕЙ республики (GBR2 от GOODS, если META
      дописала RARE[k] и рисунок есть), потом общие (rep −1), потом старые 0–9 — как rareFor().
   2) «Отменить ход» не возвращает ушедшего недовольным покупателя (сердце не возвращается). Первая отмена бесплатно — как была.
   3) Тихая помощь: 2 проигрыша подряд на том же уровне → в следующей попытке терпение +5 и Валя: «Ладно, придержу очередь».
      На Ревизии, «Главке» и в задании дня — нет. Поле сохранения S.l2L = {i: уровень, n: проигрышей подряд}.
   4) Город в заголовке уровня и «Дальше — …» — из GBU (точка cityOf с меткой gb-LVL в index.html → window.GB_CITY).
   Событие STAT: l2help {l}.
*/
(function(){
  if(typeof window==='undefined'||!window.GB)return;
  function on(){return GB.flag('lvl2')&&!!window.GBL2;}
  var HELP=5;
  GB.onSave({id:'lvl',keys:['l2L'],fix:function(S){if(!S.l2L||typeof S.l2L!=='object')S.l2L={i:-1,n:0};},
    merge:function(S,d){if(d&&d.l2L&&!(S.l2L&&S.l2L.i>=0))S.l2L=d.l2L;}});
  function helpDue(i,daily){if(daily||GBU.isRev(i))return false;var x=S.l2L;return !!(x&&x.i===i&&x.n>=2);}
  // карточка «Дефицита» для уровня i: своя республика → общие → старые (как rareFor)
  function rareFor2(i,daily){try{
      for(var o=0;o<NRARE;o++)if(S.album.indexOf(o)<0)return o; // сначала старые 10 (как было)
      if(!daily&&window.GBR2&&GBR2.list&&typeof RARE!=='undefined'){var r=GBU.rep(i),L=GBR2.list,pick=-1,pick2=-1;
        for(var k=0;k<L.length;k++){var c=L[k];if(!c||!(c.id>=RARE0)||!(c.k<56)||!RARE[c.k]||!GOOD_DRAW[RARE0+c.k])continue;if(S.album.indexOf(c.k)>=0)continue;
          if(c.rep===r&&pick<0)pick=c.k;else if(c.rep===-1&&pick2<0)pick2=c.k;}
        if(pick<0)pick=pick2;if(pick>=0)return pick;}
    }catch(e){}
    return rareFor();}
  // город уровня для заголовка/«Дальше — …» (точка cityOf в index.html): GBU, по-английски — старые CITIES
  window.GB_CITY=function(i){try{if(!on()||LANG==='en'||!window.GBU)return null;var u=GBU.of(i);return [u.name,u.color];}catch(e){return null;}};
  var old=window.levelFor;
  window.levelFor=function(i,daily){if(!on())return old(i,daily);
    var rid=rareFor2(i,daily),h=helpDue(i,daily),key='v2:'+(daily?'d'+todaySeed():i)+':'+rid;
    if(!LV_CACHE[key])LV_CACHE[key]=daily?GBL2.day(todaySeed(),rid):GBL2.gen(i,rid);
    var lv=LV_CACHE[key];if(!h||!lv)return lv;
    var c=LV_CACHE[key+':h'];if(!c){c=Object.assign({},lv,{P:lv.P+HELP,help:1});LV_CACHE[key+':h']=c;}return c;};
  // исходы: считаем проигрыши подряд на одном уровне (после «Ещё попытки» второй проигрыш той же попытки не считаем)
  GB.levelHook.push(function(x){if(!on()||x.daily||x.mode)return;var L=S.l2L||(S.l2L={i:-1,n:0});
    if(x.r==='lose'&&!x.rev){if(L.i===x.idx)L.n++;else{L.i=x.idx;L.n=1;}}
    else if(x.r==='win'){L.i=-1;L.n=0;}});
  GB.startHook.push(function(x){if(!on()||!G||!G.lv||!G.lv.help)return;
    try{STAT.ev('l2help',{l:x.l});}catch(e){}
    setTimeout(function(){if(!G||!G.lv||!G.lv.help||LANG==='en')return;
      var t=window.GBT&&GBT.say?GBT.say('help'):'';say(t||'Ладно, придержу очередь — не торопитесь.','valya');},900);});
  // «Отменить ход»: ушедший недовольным не возвращается
  var oldUndo=window.doUndo;
  window.doUndo=function(){if(!on()||!G)return oldUndo.apply(this,arguments);
    var ids={},k;for(k=0;k<G.q.vis.length;k++)ids[G.q.vis[k].id]=1;var ang=G.angry,hearts=G.hearts,qa=G.q.angry;
    oldUndo.apply(this,arguments);
    if(!G||G.angry>=ang)return;
    G.angry=ang;G.hearts=hearts;G.q.angry=qa;
    G.q.vis=G.q.vis.filter(function(v){return ids[v.id];}); // кто был в очереди до отмены — остаётся; ушедшие — ушли
    qFill(G.lv,G.st,G.q);syncQueue(true);renderHearts();updHud();
    if(G.hearts<=0)G.over=true;};
})();
