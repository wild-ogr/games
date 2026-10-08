/* ================= OB:META1 — «Застава дня» (Выпуск 1; план 03-meta.md §4.2, образец — Богатырь dailyDef(), data.js:433) =================
   Одна на всех застава по дате: карта genMap(зерно дня), вид главы и правило из DCH_RULES — по дате (у всех игроков одинаковые).
   Нечисть идёт без конца, как в осаде (endlessWave); счёт — сколько волн отбито. Золото — как в осаде (siegeGold) за каждый забег,
   плюс раз в день «награда заставы» dchGold(), если отбито DLY_GOAL волн. Рекорд осады (S.endBest) и таблицу осады не трогает.
   Открывается вместе с осадой (после 1-6). Карточка — первой во вкладке «Испытания» (крючок SIEGE). «Ещё попытки за рекламу» нет (честный счёт).
   Таблица дня: на Яндексе — лидерборд 'daily' (его надо создать в консоли; пока DLY_LB=false — не пишем), в VK таблицы нет (одна таблица — осада).
   Сейв: S.dlyO {day, best — лучшее за день, got — награда взята, runs}. Облако — свежий день, в тот же день — максимум. */
const DLY_GOAL=8;let DLY_LB=false;
function dlyDef(){const day=dayKey(),seed=+day.replace(/-/g,''),R=mulberry(seed*31+7);R();R();
  const th=Math.floor(R()*CH.length),rule=DCH_RULES[Math.floor(R()*DCH_RULES.length)].k;
  return {day,seed:seed%100000+9000,th,rule,river:R()<.5||!!CH[th].river,side:R()<.5};}
function dlyMine(){const d=dayKey(),o=S.dlyO;return o&&o.day===d?o:{day:d,best:0,got:0,runs:0};}
function dlyOpen(){return !!S.stars['0-5'];}
function dlyStart(){if(!dlyOpen())return;const D=dlyDef();hideModal();if(G&&!G.win&&!G.over){boostRefund(.5);save();}
  newBattle({endless:true,dly:D,rule:D.rule});enterBattle();
  const R=DCH_RULES.find(r=>r.k===D.rule)||DCH_RULES[0];
  voice(Lg('Застава дня — одна на всю Русь! Правило: «'+R.n+'». ','Outpost of the day — the same for all of Rus! Rule: “'+R.n+'”. ')+R.d,VOEV(),'voevoda',7);}
function dlyEnd(dq0){const P=G.paid,waves=Math.max(0,G.wave-1),M=dlyMine(),rec=waves>M.best;
  const total=siegeGold(waves),reward=total-(P.gold||0);P.gold=total;dqAdd('siege',waves-(P.waves||0));
  let bonus=0;if(waves>=DLY_GOAL&&!M.got){bonus=dchGold();M.got=1;}
  M.best=Math.max(M.best,waves);if(P.n===1)M.runs++;S.dlyO=M;S.gold+=reward+bonus;ern('lvl',reward);if(bonus)ern('quest',bonus);
  const sbst=Math.min(120,5*waves)-Math.min(120,5*(P.waves||0));boostAdd(sbst);G.win=true;P.waves=waves;save(); // ускорение как в осаде: +5 с за волну, до 2 мин
  if(DLY_LB&&ysdk)try{LB.set('daily',+M.day.replace(/-/g,'')%10000*1000+M.best);}catch(e){}
  try{STAT.ev('mod',{m:'dly',a:'end',w:waves,r:rec?1:0});}catch(e){}
  const D=G.dly,R=DCH_RULES.find(r=>r.k===G.rule)||DCH_RULES[0];
  showModal('<h3>'+Lg('Застава дня','Outpost of the day')+'</h3><p class="sub">'+(rec?Lg('🏆 Лучшее за сегодня!','🏆 Your best today!'):Lg('Нечисть прорвалась. Завтра — новая застава.','The monsters broke through. A new outpost tomorrow.'))+'</p>'+
    '<div class="stats"><div><b>'+waves+'</b>'+Lg('волн отбито','waves held')+'</div><div><b>'+M.best+'</b>'+Lg('лучшее сегодня','best today')+'</div><div><b>'+G.kills+'</b>'+Lg('одолели','defeated')+'</div></div>'+
    '<div class="card treasury" style="text-align:center"><b>+'+fmtGold(total+bonus)+'</b>'+(bonus?'<br><span style="font-size:13px">'+Lg('награда заставы дня: +','outpost of the day reward: +')+fmtGold(bonus)+'</span>':'')+
      (sbst>=1?'<br><span style="font-size:13px">'+Lg('⏩ Ускорение: +','⏩ Speed-up: +')+fmtBoost(sbst)+'</span>':'')+'</div>'+
    (M.got?'':'<p class="sub">'+Lg('Отбей '+DLY_GOAL+' волн — награда заставы дня: +'+fmtGold(dchGold()),'Hold '+DLY_GOAL+' waves for the outpost of the day reward: +'+fmtGold(dchGold()))+'</p>')+dqNote(dq0)+
    '<div class="btns stick"><button class="btn big" id="dlAgain">'+Lg('Ещё раз','Play again')+'</button><button class="btn ghost" id="dlMap">'+Lg('В меню','Menu')+'</button></div>');
  on('dlAgain',()=>afterAd(true,dlyStart));on('dlMap',()=>afterAd(true,()=>toMenu('Siege')));}
function dlyCard(el){if(!dlyOpen())return;const D=dlyDef(),M=dlyMine(),R=DCH_RULES.find(r=>r.k===D.rule)||DCH_RULES[0],ch=CH[D.th];
  const h='<h2>'+Lg('Застава дня','Outpost of the day')+'</h2><div class="card" id="dlyCard"><div class="row"><img class="ic" src="'+ic(ch.boss)+'" alt=""><div class="t"><b>'+ch.name+' · '+Lg('«'+R.n+'»','“'+R.n+'”')+'</b><span>'+
    Lg('Одна застава на всю Русь — у всех сегодня та же карта и правило. Нечисть идёт без конца: сколько волн удержишь? ','One outpost for all of Rus — everyone gets the same map and rule today. The monsters never stop: how many waves can you hold? ')+R.d+'</span></div></div>'+
    '<div class="stats"><div><b>'+M.best+'</b>'+Lg('лучшее сегодня','best today')+'</div><div><b>'+M.runs+'</b>'+plw(M.runs,'попытка','попытки','попыток','try','tries')+'</div><div><b>'+(M.got?'✓':'+'+fmtNum(dchGold()))+'</b>'+(M.got?Lg('награда взята','reward taken'):Lg('за '+DLY_GOAL+' волн','for '+DLY_GOAL+' waves'))+'</div></div>'+
    '<div class="btns" style="margin-top:0"><button class="btn big" id="dlyGo">'+swordImg()+Lg(' На заставу',' To the outpost')+'</button></div></div>';
  el.insertAdjacentHTML('afterbegin',h);on('dlyGo',dlyStart);}
function dlyFix(s){if(s.dlyO!=null&&(typeof s.dlyO!=='object'||Array.isArray(s.dlyO)))s.dlyO=null;}
META_MODS.push({id:'dly',
  FIX:dlyFix,
  MERGE(x,o){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:null,a=ob(o.dlyO),b=ob(x.dlyO);if(!b||!b.day)return;
    if(!a||!a.day||b.day>a.day)o.dlyO=b;else if(a.day===b.day)o.dlyO={day:a.day,best:Math.max(a.best|0,b.best|0),got:Math.max(a.got|0,b.got|0),runs:Math.max(a.runs|0,b.runs|0)};},
  SIEGE:dlyCard,
  TODAY(a){if(!dlyOpen())return;const M=dlyMine();if(!M.runs){const i=a.findIndex(c=>c.id==='wk');a.splice(i<0?a.length:i,0,{id:'dly',hot:1,t:Lg('🏰 Застава дня','🏰 Outpost of the day'),fn:()=>openTab('Siege')});}}});
dlyFix(S);
