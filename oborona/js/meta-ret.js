/* ================= OB:META1 — возврат (Выпуск 1, 08.10.2026; план hobby-analytics/release-i/oborona-boost/03-meta.md §4.2, §4.4, §6) =================
   1) Награда за вход — 30 дней вместо 7 (вехи: 7/21/28 — +10 мин ускорения, 14 — облик «Весенний» на все заставы, 30 — облик «Ярмарочный»).
      Серия рвётся после пропуска 2+ дней; порвалась (было ≥3 дней) — «🎬 Вернуть серию за рекламу», не чаще раза в 7 дней.
      Функции входа ui.js (loginAvail/loginGive/loginFirst/loginTomorrow/loginTomorrowDay/loginOffer) здесь ПЕРЕОПРЕДЕЛЕНЫ (файл грузится после ui.js).
   2) Сундук дня с серией: все три задания дня → сундук (золото × серия +10 %/день до +60 % и +5 мин ⏩, как было). Пропуск одного дня серию не рвёт.
      Крючок META_HK('CHEST',o) — другим модулям (трофеи и т. п.) дописать своё в сундук: o={gold,streak,txt:[]}.
   3) Окно «Пока тебя не было, казна собрала N» при входе (крючок MENU): «Забрать» / «🎬 ×2 за рекламу» (место away2; прятать до подгрузки ролика — adOn).
      Вместо вечных «Казна ×2», «+2 часа», «Гостинец» в деревне (их жали в ~1 % показов).
   Сейв (только свои ключи): S.login {day,n} — как было (n растёт дальше, день цикла = n%30), S.loginBk — день, когда серию вернули за ролик,
   S.dlyS {d — день последнего сундука, n — серия}, S.awayT — когда последний раз показали окно казны. Облако — позже/больше (MERGE). */
const LOGIN_N=30;
function retDayAgo(n){return dayKey(nowMs()-n*864e5);}
function lgGold(i){return i===LOGIN_N-1?300:LOGIN_GOLD[i%7]+20*Math.floor(i/7);}
/* веха дня i (0…29): {t:'boost'|'skin', id} */
function lgMile(i){return i===13?{t:'skin',id:'spring'}:i===LOGIN_N-1?{t:'skin',id:'fair'}:(i===6||i===20||i===27)?{t:'boost'}:null;}
function lgMileTxt(i,short){const m=lgMile(i);if(!m)return '';if(m.t==='boost')return short?Lg('+10 мин ⏩','+10 min ⏩'):Lg('+10 мин ускорения','+10 min of speed-up');
  const n=skinName(m.id);return short?Lg('облик','look'):Lg('облик «'+n+'» на все заставы','the “'+n+'” look for all outposts');}
/* облик на все роды застав; уже весь есть — false */
function retSkinAll(id){let nw=false;for(const t of TW_ORDER)if(!S.skins[t+'.'+id]){S.skins[t+'.'+id]=1;nw=true;}return nw;}

/* ---------- вход ---------- */
function loginAvail(){const L=S.login;if(!L||!L.day)return null;const d=dayKey();if(L.day===d)return null;const gap=dayDiff(L.day,d),cont=gap>=1&&gap<=2;
  return {idx:cont?(L.n||0)%LOGIN_N:0,cont,lost:!cont&&(L.n||0)>=3?(L.n||0):0};}
function loginGive(idx){const fx=typeof FEST!=='undefined'&&FEST.on('vyh26')?2:1,g=lgGold(idx)*fx,m=lgMile(idx);S.gold+=g;ern('gift',g);let x=fx>1?Lg(' (праздник: ×2)',' (holiday: ×2)'):'',tot=g; // 04.11 «Выходной во дворе» — вдвое
  if(m&&m.t==='boost'){boostAdd(600);x+=Lg(' и +10 мин ускорения',' and +10 min of speed-up');}
  if(m&&m.t==='skin'){if(retSkinAll(m.id)){x+=Lg(' и облик «'+skinName(m.id)+'»!',' and the “'+skinName(m.id)+'” look!');for(const t of TW_ORDER)if(!S.skin[t])S.skin[t]=m.id;}
    else{S.gold+=300;ern('gift',300);tot+=300;x+=Lg(' и ещё +300 (облик уже есть)',' and +300 more (you already have the look)');}}
  try{STAT.ev('mod',{m:'ret',a:'login',d:idx+1});}catch(e){}
  loginGive.x=x;return tot;}
function loginFirst(){S.login={day:dayKey(),n:1};return loginGive(0);}
function loginTomorrowDay(){const L=S.login,x=loginAvail();const n=L&&L.day===dayKey()?L.n:x&&x.cont?(L.n||0)+1:1;return n%LOGIN_N+1;}
function loginTomorrow(){return lgGold(loginTomorrowDay()-1);}
function loginTmrText(){const d=loginTomorrowDay(),m=lgMileTxt(d-1,true);
  return Lg('день '+d+' из '+LOGIN_N+' за вход: +'+fmtGold(loginTomorrow()),'login day '+d+' of '+LOGIN_N+': +'+fmtGold(loginTomorrow()))+(m?' + '+m:'');}
function lgRestOk(x){return !!(x&&x.lost&&adOk()&&(!S.loginBk||dayDiff(S.loginBk,dayKey())>=7));}
function loginOffer(){const x=loginAvail();if(!x||$('modal').classList.contains('on'))return false;
  const b0=Math.min(Math.floor(x.idx/7)*7,LOGIN_N-7),cells=[];
  for(let i=b0;i<b0+7;i++){const m=lgMile(i);cells.push('<div class="dcell'+(i<x.idx?' got':'')+(i===x.idx?' now':'')+'"><small>'+Lg((i+1)+' день','Day '+(i+1))+'</small><b>'+lgGold(i)+'</b>'+(m?'<small>'+(m.t==='skin'?'🎨 '+lgMileTxt(i,true):lgMileTxt(i,true))+'</small>':'')+'</div>');}
  const miles=[6,13,29].map(i=>'<div>'+(x.idx>i?'✅':'🎁')+' '+(i+1)+Lg(' дн. — ',' d — ')+lgMileTxt(i)+'</div>').join('');
  showModal('<h3>'+Lg('Награда за вход','Daily login reward')+'</h3><p class="sub">'+(x.cont?Lg('День '+(x.idx+1)+' из '+LOGIN_N+'. Заходи каждый день — награда растёт.','Day '+(x.idx+1)+' of '+LOGIN_N+'. Come back every day — the reward grows.'):Lg('Серия началась заново — заходи каждый день, награда растёт. Один пропуск прощаем.','The streak starts over — come back every day and the reward grows. One missed day is forgiven.'))+'</p>'+
    '<div class="days">'+cells.join('')+'</div><div class="sub" data-fit="2" style="font-size:13px;margin:0 0 6px;text-align:left">'+miles+'</div>'+
    (lgRestOk(x)?'<div class="card gift" style="margin:0 0 8px"><b>'+Lg('Серия прервалась','Streak broken')+'</b><br><span class="note">'+Lg('Было '+x.lost+' '+plural(x.lost,'день','дня','дней')+' подряд — вернуть и продолжить?','You had '+x.lost+' days in a row — restore it and go on?')+'</span><button class="btn ad" id="lgRest" style="width:100%;margin-top:6px">'+Lg('🎬 Вернуть за рекламу','🎬 Restore for an ad')+'</button></div>':'')+
    '<div class="btns"><button class="btn gold big" id="lgGet"><img src="'+ic('ingot',40)+'">'+Lg('Забрать +','Collect +')+lgGold(x.idx)+'</button></div>');
  on('lgGet',()=>{const L=S.login||{n:0};S.login={day:dayKey(),n:(x.cont?(L.n||0):0)+1};const g=loginGive(x.idx);save();SND.up();toast('+'+fmtGold(g)+(loginGive.x||''));hideModal();openTab(curTab);
    setTimeout(()=>{if(!G)awayOffer();},400);});
  const rest=()=>{const L=S.login;if(!L||!lgRestOk(loginAvail()))return false;S.login={day:retDayAgo(1),n:L.n};S.loginBk=dayKey();save();SND.up();return true;};
  {const lost=x.lost;adOn('lgRest','lgrest',()=>showRewarded(()=>{if(rest()){hideModal();toast(Lg('Серия возвращена: '+lost+' дн.','Streak restored: '+lost+' d'));loginOffer();}},null,
    ()=>{if(!rest())return adLateCoins();if(!G){hideModal();loginOffer();}return Lg('серия входа возвращена: '+lost+' дн.','login streak restored: '+lost+' d');}));}
  try{STAT.ev('mod',{m:'ret',a:'lgshow',d:x.idx+1,r:lgRestOk(x)?1:0});}catch(e){}
  return true;}

/* ---------- сундук дня с серией ---------- */
function dlyStreak(){const s=S.dlyS||{},d=dayKey();if(!s.d)return {n:1,cont:false};if(s.d===d)return {n:s.n||1,cont:true,today:true};const gap=dayDiff(s.d,d);
  return gap>=1&&gap<=2?{n:(s.n||0)+1,cont:true}:{n:1,cont:false};}
function dlyMult(n){return 1+.1*Math.min(6,Math.max(0,n-1));}
function dlyGold(n){return Math.round((60+20*Math.min(8,chaptersDone()))*dlyMult(n)/5)*5;}
function dlyChestRow(D){const st=dlyStreak(),ok=D.list.every(q=>q.got),g=dlyGold(st.n);
  return '<div class="qrow"><div class="t"><b>'+Lg('🎁 Сундук дня','🎁 Daily chest')+(st.n>1?' · 🔥 '+Lg('серия '+st.n+' дн.','streak '+st.n+' d'):'')+'</b><span>'+Lg('Все три задания: +'+fmtGold(g)+' и +5 мин ⏩','All three quests: +'+fmtGold(g)+' and +5 min ⏩')+
    (st.n>1?Lg(' (серия +'+Math.round((dlyMult(st.n)-1)*100)+'%)',' (streak +'+Math.round((dlyMult(st.n)-1)*100)+'%)'):Lg(' · каждый день подряд +10 %, до +60 %',' · +10% for each day in a row, up to +60%'))+'</span></div>'+
    '<button class="btn gold" id="dqBonus" '+(ok?'':'disabled')+'><img src="'+ic('ingot',40)+'">'+fmtNum(g)+'</button></div>';}
function dlyChestOpen(){const st=dlyStreak(),g=dlyGold(st.n),o={gold:g,streak:st.n,txt:[]};S.dlyS={d:dayKey(),n:st.n};
  META_HK('CHEST',o);S.gold+=o.gold;ern('chest',o.gold);boostAdd(DQ_BONUS);save();SND.up();
  try{STAT.ev('mod',{m:'ret',a:'chest',n:st.n});}catch(e){}
  toast(Lg('Сундук дня: +','Daily chest: +')+fmtGold(o.gold)+Lg(' и +5 мин ⏩',' and +5 min ⏩')+(o.txt.length?' · '+o.txt.join(' · '):'')+(st.n>1?Lg(' · серия '+st.n+' дн.',' · streak '+st.n+' d'):''));}

/* ---------- «Пока тебя не было, казна собрала…» ---------- */
let awayShown=false;
function awayOffer(){if(awayShown||G||!S.wins||$('modal').classList.contains('on'))return false;const g=afkGold(),away=nowMs()-(S.afkT||0);
  if(g<Math.max(30,afkReadyAt())||away<2*3600e3||nowMs()-(S.awayT||0)<3*3600e3)return false;
  awayShown=true;S.awayT=nowMs();save();const t0=S.afkT,x2=adOk()&&goldWanted();
  showModal('<h3>'+Lg('С возвращением, воевода!','Welcome back, commander!')+'</h3><div class="say"><img src="'+ic('tetka')+'" alt=""><div><b class="who">'+Lg('Тётушка Яга','Auntie Yaga')+'</b>'+
    Lg('Пока тебя не было, казна собрала '+fmtGold(g)+'. Забирай — пригодится на постройки!','While you were away, the treasury collected '+fmtGold(g)+'. Take it — it’ll come in handy for buildings!')+'</div></div>'+
    '<div class="card treasury" style="text-align:center"><b>+'+fmtGold(g)+'</b></div><div class="btns">'+
    (x2?'<button class="btn ad big" id="awX2">'+Lg('🎬 Забрать ×2 за рекламу: +','🎬 Collect ×2 for an ad: +')+fmtGold(g*2)+'</button>':'')+
    '<button class="btn gold'+(x2?'':' big')+'" id="awGet"><img src="'+ic('ingot',40)+'">'+Lg('Забрать +','Collect +')+fmtNum(g)+'</button></div>');
  const take=m=>{const v=afkGold();if(v<=0)return 0;afkTk={t:S.afkT,g:v,m:m};S.gold+=v*m;ern('chest',v);ern('ad',v*(m-1));S.afkT=nowMs();save();SND.coin();return v*m;};
  on('awGet',()=>{const v=take(1);hideModal();if(v)toast('+'+fmtGold(v)+Lg(' из казны',' from the treasury'));openTab(curTab);});
  adOn('awX2','away2',()=>showRewarded(()=>{const v=take(2);hideModal();if(v)toast('+'+fmtGold(v)+Lg(' из казны',' from the treasury'));openTab(curTab);},null,()=>afkLate(t0)));
  try{STAT.ev('mod',{m:'ret',a:'away',g:g});}catch(e){}
  return true;}

/* ---------- крючки ---------- */
function retFix(s){if(s.dlyS!=null&&(typeof s.dlyS!=='object'||Array.isArray(s.dlyS)))s.dlyS=null;if(s.login!=null&&(typeof s.login!=='object'||Array.isArray(s.login)))s.login=null;
  if(s.loginBk!=null&&typeof s.loginBk!=='string')s.loginBk='';if(s.awayT!=null&&!isFinite(+s.awayT))s.awayT=0;}
META_MODS.push({id:'ret',
  FIX:retFix,
  MERGE(x,o){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:null;
    {const a=ob(o.login),b=ob(x.login);if(b&&b.day&&(!a||!a.day||b.day>a.day||(b.day===a.day&&(b.n|0)>(a.n|0))))o.login=b;}   // вход: позже/больше
    {const a=ob(o.dlyS),b=ob(x.dlyS);if(b&&b.d&&(!a||!a.d||b.d>a.d||(b.d===a.d&&(b.n|0)>(a.n|0))))o.dlyS=b;}         // серия сундука
    if(typeof x.loginBk==='string'&&x.loginBk>(o.loginBk||''))o.loginBk=x.loginBk;o.awayT=Math.max(+o.awayT||0,+x.awayT||0);},
  TODAY(a){const c=a.find(q=>q.id==='login');if(c){const L=S.login,x=loginAvail(),day=x?x.idx+1:L&&L.n?((L.n-1)%LOGIN_N)+1:1;c.t=Lg('📅 День '+day+' из '+LOGIN_N,'📅 Day '+day+' of '+LOGIN_N);}
    const q=a.find(z=>z.id==='dq'),st=dlyStreak();if(q&&st.n>1&&st.cont)q.t+=' · 🔥'+st.n;},
  MENU(){return awayOffer();}});
retFix(S); // самая первая загрузка: FIX ещё не звали
