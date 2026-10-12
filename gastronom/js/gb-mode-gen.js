'use strict';
/* ================= gb-mode-gen — раскладки режимов (буст «Образцовый», поток MODE). БЕЗ DOM: грузится в игре и в jsc (бот MODE-tools) =================
   Берёт ТОЛЬКО функции блока LOGIC (buildLevel, mkState, settle, solve, friendly, playout, rng) — сам блок не правит.
   Основные уровни 1–1500 и их зерно не трогает: у режимов своё зерно (день/неделя) и свои параметры P (копия цикла genLevel ниже).
   Тип ячейки / биты — как в LOGIC. Помехи OBST и товары GOODS сюда не входят (режимы — на старых правилах, раскладка v1-формата).
   GBMDG.priemka(day,k)          «Приёмка товара»: k=0..2, одна на всех (зерно — день); без очереди (K=0); lv.opt — «рекорд тёти Вали» (лучший
                                 из 160 «человеческих» решений + поиск), lv.lim — лимит ходов, lv.s2 — граница 2★
   GBMDG.rush(day)               «Час пик»: очередь из 20, терпение короче; одна на всех (зерно — день)
   GBMDG.marathon(week,step,tier) «Ревизия-марафон»: 5 Ревизий (step 0..4), сложность от «разряда» игрока tier 0..7
   GBMDG.week(week,step,tier)    «Задание недели»: 5 уровней, особое условие недели lv.cond (calm|nob|moves|ice)
   GBMDG.fish(day,tier,fishIds)  «Рыбный четверг»: обычная раскладка, типы переставлены так, чтобы рыбные товары были в каждой тройке, где можно
   Терпение (решение владельца 10.10 «средне»): 4 + 2,5·(ходов на тройку), множитель режима.
   lv.qs — зерно очереди (игра ставит G.q=qInit(lv,rng(lv.qs)) — та же очередь, что видел бот).
   day — ГГГГММДД (как todaySeed), week — ГГГГММДД понедельника недели. */
var GBMDG=(function(){
  var V=1; // версия раскладок режимов: менять — только если все режимы можно «перевыпустить» (это не основные уровни)
  var CONDS=['calm','nob','moves','ice'];
  function pat(lv,mul,add){var mp=Math.max(2.2,Math.min(4.5,lv.mpt||3));lv.P=Math.max(5,Math.round((4+2.5*mp)*mul)+(add||0));lv.pd=1+Math.round(mp/2);return lv;}
  // копия цикла genLevel (LOGIC не трогаем): свои параметры P, своё зерно
  function genP(P,i,seed,need,tries){var best=null;P=JSON.parse(JSON.stringify(P));
    for(var k=0;k<(tries||60);k++){var R=rng(seed+k*1013),lv=buildLevel(P,R,i,-1);if(!lv)continue;
      var st=mkState(lv);settle(lv,st,lv.sh.map(function(_,j){return j;}));var sol=solve(lv,st,30000);if(!sol)continue;
      lv.sol=sol.length;lv.try=k;lv.fr=friendly(lv,12,rng(seed+k));lv.P=99;lv.pd=0;
      if(lv.fr>=need)return lv;if(!best||lv.fr>best.fr)best=lv;
      if(k%20===19&&P.E<6)P.E++;}
    return best;}
  // «рекорд тёти Вали»: лучшее из многих «человеческих» решений и поиска в глубину (настоящий оптимум — не хуже; игрок, побивший рекорд, — 3★)
  function bestMoves(lv,seed,n){var st=mkState(lv);settle(lv,st,lv.sh.map(function(_,j){return j;}));var R=rng(seed+77),best=0;
    for(var k=0;k<(n||160);k++){var p=[];if(playout(lv,R,st,null,p)&&(!best||p.length<best))best=p.length;}
    var s=solve(lv,st,40000);if(s&&(!best||s.length<best))best=s.length;
    return best||lv.sol||30;}
  // проверка ботом при генерации (как «простой» отсев «Часа пик»): внимательный бот LOGIC (botPlay — решатель, отмены) с той же очередью,
  // что увидит игрок (lv.qs); не прошёл или ушло больше maxA — берём следующее зерно (до 6 попыток; иначе — лучшая из попыток)
  function botOk(lv,maxA){var l={};for(var k in lv)l[k]=lv[k];l.live=1;var b=botPlay(l,lv.qs);lv.bot=b.ok?b.angry:99;return b.ok&&b.angry<=maxA;}
  function pick6(make,maxA){var best=null;for(var a=0;a<6;a++){var lv=make(a);if(!lv)continue;if(botOk(lv,maxA))return lv;if(!best||lv.bot<best.bot)best=lv;}return best;}
  function tag(lv,md,step){if(lv.qs==null)lv.qs=(lv.idx|0)*31+(step|0)*7+(lv.try|0)+3;lv.md=md;lv.mdS=step||0;lv.mdV=V;lv.rare=0;return lv;}

  // ---- «Приёмка товара»: три головоломки в день, одна на всех. Без покупателей; звёзды — за ходы ----
  var PR=[{S:5,D:2,T:5,E:3,ice:0,box:0,i:22},{S:6,D:3,T:6,E:3,ice:1,box:0,i:35},{S:7,D:3,T:7,E:4,ice:2,box:1,i:47}];
  function priemka(day,k){k=Math.max(0,Math.min(2,k|0));var p=PR[k],seed=(day|0)*97+k*7919+3;
    var lv=genP({S:p.S,D:p.D,T:p.T,E:p.E,ice:p.ice,box:p.box,rare:false,K:0,pt:0,boss:false},p.i,seed,.5,40);if(!lv)return null;
    lv.K=0;lv.P=99;lv.pd=0;var b=bestMoves(lv,seed,160);lv.opt=b;lv.s2=b+Math.max(2,Math.ceil(b*.2));lv.lim=b+Math.max(4,Math.ceil(b*.5));
    return tag(lv,'priemka',k);}

  // ---- «Час пик»: большая витрина, очередь 20, терпение тает быстрее ----
  // смена «простым» игроком (лучший ход с учётом очереди, без отмен; упёрся — решение решателя): сколько обслужит из 20.
  // Смена идёт, пока не прошли все 20 (ушедшие смену не обрывают)
  function rushSim(lv0,seed){var lv={};for(var k in lv0)lv[k]=lv0[k];lv.live=1;var st=mkState(lv);settle(lv,st,lv.sh.map(function(_,j){return j;}));
    var q=qInit(lv,rng(seed));qFill(lv,st,q);var steps=0,plan=null,idle=0,R2=rng(seed+5),hist=new Set([keyOf(st)]);
    while(st.n>0&&steps<600&&(q.left>0||q.vis.length)){var m=null;
      if((!plan||!plan.length)&&idle<6){plan=null;var L=listMoves(lv,st,q.vis.map(function(v){return v.t;}));
        for(var j=0;j<L.length;j++){var x=L[j],s=cloneSt(st);doMove(lv,s,x[1],x[2],x[3],x[4]);if(!hist.has(keyOf(s))){m=[x[1],x[2],x[3],x[4]];break;}}}
      if(!m&&!(plan&&plan.length)){plan=solveFast(lv,st,R2,null,24);if(!plan||!plan.length)break;}
      if(!m)m=plan.shift();var ev=[];doMove(lv,st,m[0],m[1],m[2],m[3],ev);steps++;hist.add(keyOf(st));idle++;var cl=0;
      for(j=0;j<ev.length;j++)if(ev[j].k==='clear'){idle=0;cl++;plan=null;qClear(q,ev[j].t);}if(!cl)qTick(q);qFill(lv,st,q);}
    return q.served;}
  // одна на всех (зерно — день); раскладку, где «простой» игрок обслужит меньше 15 из 20, — пропускаем (следующее зерно)
  function rush(day){var best=null;
    for(var a=0;a<6;a++){var seed=(day|0)*131+29+a*100003;
      var lv=genP({S:8,D:4,T:10,E:5,ice:2,box:1,rare:false,K:20,pt:0,boss:false},57,seed,.5,40);if(!lv)continue;
      lv.K=20;pat(lv,.8,0);lv.qs=seed+1;lv.sim=rushSim(lv,lv.qs);if(!best||lv.sim>best.sim)best=lv;if(lv.sim>=15)break;}
    return best?tag(best,'rush',0):null;}

  // ---- «Ревизия-марафон»: 5 Ревизий подряд, без бустеров; сложность растёт к пятой ----
  function marathon(week,step,tier){step=Math.max(0,Math.min(4,step|0));tier=Math.max(0,Math.min(7,tier|0));
    var c=Math.min(7,Math.max(1,tier-1)+Math.floor(step/2)),i=c*10+9,P=levelParams(i);
    var lv=pick6(function(a){var seed=(week|0)*17+step*7919+tier*331+5+a*100003,lv=genP(P,i,seed,needFr(i),60);if(!lv)return null;
      lv.K=P.K;lv.boss=true;pat(lv,1.25,step>=3?0:1);lv.qs=seed+1;return lv;},1);
    return lv?tag(lv,'marathon',step):null;}

  // ---- «Задание недели»: 5 уровней с условием недели ----
  function cond(week){return CONDS[Math.floor((week|0)/7)%CONDS.length];}
  function week(wk,step,tier){step=Math.max(0,Math.min(4,step|0));tier=Math.max(0,Math.min(7,tier|0));var cd=cond(wk),k=[2,4,3,5,8][step],c=Math.max(1,tier),i=c*10+k,P=levelParams(i);
    if(cd==='ice')P.ice=Math.min(6,(P.ice||0)+3);P.rare=false;
    var lv=pick6(function(a){var seed=(wk|0)*23+step*7919+tier*331+11+a*100003,lv=genP(P,i,seed,needFr(i),60);if(!lv)return null;lv.K=P.K;lv.cond=cd;
      pat(lv,cd==='calm'?1.4:cd==='moves'?1.2:1.1,0);lv.qs=seed+1;
      if(cd==='moves'){var b=bestMoves(lv,seed,60);lv.opt=b;lv.lim=Math.ceil(b*1.6)+4;}return lv;},cd==='calm'?0:1);
    return lv?tag(lv,'week',step):null;}

  // ---- «Рыбный четверг»: перестановка типов — рыбные товары в раскладке (структура и решаемость те же) ----
  function remap(lv,ids){var ty=lv.types.slice(),sel=[];for(var j=0;j<ids.length&&sel.length<ty.length;j++)if(sel.indexOf(ids[j])<0)sel.push(ids[j]);
    var rest=ty.filter(function(t){return sel.indexOf(t)<0;}),nt=sel.concat(rest).slice(0,ty.length),m={};
    for(j=0;j<ty.length;j++)m[ty[j]]=nt[j];
    lv.sh=lv.sh.map(function(L){return L.map(function(r){return r.map(function(c){if(!c)return c;var t=c&255;return m[t]?(c&~255)|m[t]:c;});});});
    lv.types=ty.map(function(t){return m[t]||t;});return lv;}
  function fish(day,tier,ids){tier=Math.max(0,Math.min(7,tier|0));var i=Math.max(1,tier)*10+5,P=levelParams(i);P.rare=false;
    var lv=pick6(function(a){var seed=(day|0)*53+tier*331+17+a*100003,lv=genP(P,i,seed,needFr(i),60);if(!lv)return null;lv.K=P.K;pat(lv,1.2,0);lv.qs=seed+1;
      remap(lv,(ids&&ids.length?ids:[3,2]));return lv;},1);
    return lv?tag(lv,'fish',0):null;}

  // ---- «Проверка Торга» (для META: GBM.torg) — Ревизия с правилом разряда: notable «без Столика», revq «очередь из ревизоров», ice «всё во льду» ----
  function torg(r,tier,rule){r=Math.max(1,Math.min(9,r|0));tier=Math.max(0,Math.min(7,tier|0));var c=Math.min(7,Math.max(1,tier)),i=c*10+9,P=levelParams(i);P.rare=false;
    if(rule==='ice')P.ice=Math.min(7,(P.ice||0)+3);if(r>=9){P.S=Math.min(10,P.S+1);P.K=Math.min(14,P.K+1);}
    var lv=pick6(function(a){var seed=r*7919+tier*331+(rule==='ice'?1:rule==='revq'?2:3)*17+29+a*100003,lv=genP(P,i,seed,needFr(i),60);if(!lv)return null;
      lv.K=P.K;lv.boss=true;lv.rule=rule||'';pat(lv,rule==='revq'?1.1:1.2,0);lv.qs=seed+1;return lv;},1);
    return lv?tag(lv,'torg',r):null;}
  // ---- «Дефицит дня» (для META: GBPL.deficit) — один на всех: редкий товар дня rk (номер карточки) в коробке ----
  function deficit(day,rk){var i=25,P=levelParams(i);P.rare=true;P.box=Math.max(1,P.box||0);
    var lv=pick6(function(a){var seed=(day|0)*61+43+a*100003,R=null,best=null;
      for(var k=0;k<60;k++){R=rng(seed+k*1013);var x=buildLevel(P,R,i,rk|0);if(!x||!x.rare)continue;var st=mkState(x);settle(x,st,x.sh.map(function(_,j){return j;}));
        var sol=solve(x,st,30000);if(!sol)continue;x.sol=sol.length;x.try=k;x.fr=friendly(x,12,rng(seed+k));if(x.fr>=needFr(i)){best=x;break;}if(!best||x.fr>best.fr)best=x;}
      if(!best)return null;best.K=P.K;pat(best,1.2,0);best.qs=seed+1;return best;},1);
    if(!lv)return null;var rare=lv.rare;tag(lv,'deficit',0);lv.rare=rare;return lv;}

  return {V:V,CONDS:CONDS,cond:cond,torg:torg,deficit:deficit,priemka:priemka,rush:rush,marathon:marathon,week:week,fish:fish,genP:genP,bestMoves:bestMoves,remap:remap,pat:pat};
})();
