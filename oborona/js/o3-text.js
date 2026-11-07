'use strict';
/* «Оборона 3.0» в1 — js/o3-text.js. Хозяин: поток П4 (O3-COMMON.md, журнал hobby-analytics/release-i/boost3-oborona/O3-П4.md). Каркас O3 — js/o3-hero.js § П0.
   Флаги: first — «первые 15 секунд» (волна с 1-й секунды, без окна вступления на 1-1…1-3, Потап знакомится, подарок Яги, «тык», знакомство с нечистью);
          hum — голос Потапа (банк HUMOR: окна победы/поражения O3T.win/lose, слово перед боем O3T.intro, голоса нечисти и боссов, Потап на действия игрока).
   Банк реплик утверждён владельцем 07.11 (boost3-oborona/HUMOR.md, humor-tools/lines-src.txt) — перенесён как есть + английский.
   Случайность боя не трогаем: выбор строк — O3.pick/O3.rnd, реплики в бою — O3.say (не G.bub). Без ?. ?? .at() — старые WebView.

   ДОГОВОР O3T (для П5 и других):
     O3T.win(G)  → {txt,face,who,k} | null — строка Потапа «по поводу» для окна победы (null — повода нет, флаг hum выключен или строка была недавно → старый текст).
     O3T.lose(G) → {txt,face,who,k,top,miss} | null — «Рапорт Потапа» для окна поражения; top — {type,n,name} кто прорвался больше всех (или null),
                   miss — строка «сколько не хватило» (всегда, если флаг hum включён, даже когда txt нет — тогда txt=null).
     O3T.intro(c,l,mode) → {txt,face,who,k} | null — свежее «слово воеводы» перед боем для повторов; mode: 'n'|'s'|'h'|'yar'|'dly' (не задан — режим главы, Ярь — если взведена).
     O3T.line(id) → {txt,face,who,k} | null — любая строка банка по id (список — O3T.ids()); O3T.bank — сам банк ([ru,en], кто, где).
     face — имя рисунка для ic()/art() ('voevoda', 'tetka', …), who — подпись («Воевода Потап»). Повтор одной строки — не чаще 1 из 30 показов (S.o2f.q). */
var O3T=(function(){
  /* ================= банк (HUMOR, lines-src.txt) — [ru, en] ================= */
  var P='voevoda';
  // кто говорит: подпись и рисунок
  var WHO={pot:['Воевода Потап','Commander Potap','voevoda'],yag:['Тётушка Яга','Auntie Yaga','tetka'],bay:['Кот Баюн','Bayun the Cat','sp_cat'],rat:['Воевода Ратибор','Commander Ratibor','voevoda']};
  // id: {w — кто, t:[ru,en], g — где (для справки)}
  var B={
    // --- Ю5 первая минута 1-1 ---
    f_hi:{t:['Я воевода Потап. Ткни в светлое место у дороги — поставим стрельцов. Меня самого так в первый день поставили.','I’m Commander Potap. Tap the bright spot by the road — we’ll put archers there. That’s how they put me in charge on my first day.'],g:'1-1, первые секунды'},
    f_tw:{t:['Стоят. Стрельцы обученные: в нечисть попадают, в своих — почти никогда.','There they stand. Trained archers: they hit monsters, and almost never their own.'],g:'первая застава'},
    f_coin:{t:['За каждую нечисть — монеты. Казна не моя, можно тратить.','Every monster drops coins. It’s not my treasury — spend away.'],g:'первая волна'},
    f_idle:{t:['Монеты лежат без дела. Нечисть взяток не берёт — я спрашивал.','The coins are just lying there. Monsters don’t take bribes — I asked.'],g:'монеты без дела'},
    f_win:{t:['Город цел. Пишу в рапорт: «Новобранец. Годен. Даже подозрительно».','The city is safe. Writing in my report: “Recruit. Fit for duty. Suspiciously so.”'],g:'первая победа 1-1'},
    f_aid:{t:['Дружина поставила заставу сама, на твои монеты. Не благодари — им стоять скучно было.','The guards built an outpost themselves, with your coins. Don’t thank them — they were bored standing around.'],g:'дружина сама поставила'},
    // --- Ю1 окно победы ---
    // --- Ю2 окно поражения ---
    // --- Ю6 слово перед боем для повторов ---
    // --- Ю8 Потап на действия игрока (не чаще раза в минуту) ---
    a_miss:{t:['Мимо. Перун говорит — это был предупредительный.','Missed. Perun says it was a warning shot.']},
    a_sell:{t:['Продал заставу. Стрельцы ушли с обидой и семьюдесятью процентами.','Sold the outpost. The archers left with hurt feelings and seventy percent.']},
    a_x3:{t:['Три скорости! Нечисть бежит, мы стреляем, я запыхался.','Triple speed! The monsters run, we shoot, I’m out of breath.']},
    a_cat:{t:['Баюн поёт, нечисть спит. Стрельцы тоже клюют носом — держитесь, братцы.','Bayun sings, the monsters sleep. The archers are nodding off too — hang in there, lads.']},
    a_life:{t:['Одна жизнь осталась. Без паники. Паника — после боя, в порядке очереди.','One life left. No panic. Panic comes after the battle, in an orderly queue.']},
    a_kolo:{t:['Колобок укатился с монетами. Не догоняем: он от всех уходит, у него опыт.','The Kolobok rolled off with the coins. We won’t chase him: he gets away from everyone, he’s experienced.']},
    a_gate:{t:['Застава у ворот — правильно. Последний рубеж. Предпоследний — это я, но я на совещании.','An outpost at the gate — good. The last line of defence. The one before last is me, but I’m in a meeting.']},
    a_mast:{t:['Мастера! Стрельцы теперь при значке. Требуют, чтобы их называли на «вы».','Masters! The archers have badges now. They insist on being addressed formally.']},
    a_early:{t:['Волна раньше — монеты за смелость. За безрассудство тоже дают, но потом.','Wave early — coins for courage. Recklessness pays too, but later.']},
    a_pie:{t:['Агафья передала пирожки. С запиской: «Не геройствуй». Поздно, Агафья.','Agafya sent pies. With a note: “Don’t play the hero.” Too late, Agafya.']},
    // o3:FIX п.6 — строки вне боя (победа/поражение/перед боем/вне боя/уведомления) — в ленивом банке js/o3-tropa.js § FIX (O3T.bank пополняется при загрузке)
  };
  // Ю3 нечисть: вид → строки; Ю4 боссы: выход и умения
  var EN3={};   // o3:FIX п.6 — строки в ленивой части js/o3-tropa.js § FIX
  var EN3_ALIAS={wolf_i:'wolf',vod_s:'vod',skel_f:'skel',idol_f:'idol'};
  var EN3_X={};   // o3:FIX п.6 — строки в ленивой части js/o3-tropa.js § FIX
  var BOSS={};   // o3:FIX п.6 — строки в ленивой части js/o3-tropa.js § FIX
  // сценки у ворот (Ю7 — для П5/следующих волн; здесь только данные): [кто, ru, en]
  var SC={};   // o3:FIX п.6 сценки — в ленивом банке js/o3-tropa.js § FIX

  /* ================= выбор строки: повтор не чаще 1 из 30 ================= */
  var F=null;   // S.o2f: {g: боёв с 3.0 (до 99), l: поражений (до 99), q: последние показанные id через «,», m: мастера уже хвалил, p: бой для пирожков}
  function f(){try{if(!S.o2f||typeof S.o2f!=='object')S.o2f={g:0,l:0,q:''};return S.o2f;}catch(e){return F||(F={g:0,l:0,q:''});}}
  function recent(){var q=f().q;return typeof q==='string'&&q?q.split(','):[];}
  function fresh(id){return recent().indexOf(id)<0;}
  function mark(id){var r=recent().filter(function(x){return x!==id;});r.push(id);while(r.length>30)r.shift();f().q=r.join(',');}
  function who(w){var x=WHO[w||'pot']||WHO.pot;return {who:Lg(x[0],x[1]),face:x[2]};}
  function mk(id,noMark){var b=B[id];if(!b)return null;var o=who(b.w);o.txt=Lg(b.t[0],b.t[1]);o.k=id;if(!noMark)mark(id);return o;}
  function first(ids){for(var i=0;i<ids.length;i++)if(B[ids[i]]&&fresh(ids[i]))return mk(ids[i]);return null;}
  function hum(){return O3.on('hum');}
  function tx(a){return a?Lg(a[0],a[1]):'';}

  /* ================= бой: что случилось (для поводов) ================= */
  // утечки по видам: оборачиваем leak (game.js) — без случайности, только счёт
  var lkT={};
  if(typeof window.leak==='function'){var oLeak=window.leak;window.leak=function(e){var g=G,n=g&&g.leaks;var r=oLeak.apply(this,arguments);
    try{if(g&&e&&g.leaks>n){var t=e.fly?'fly':(EN3_ALIAS[e.type]||e.type);lkT[t]=(lkT[t]||0)+(g.leaks-n);onLeak(e);}}catch(x){O3.err('leak',x);}return r;};}
  function topLeak(){var b=null,n=0;for(var k in lkT)if(lkT[k]>n){n=lkT[k];b=k;}return b?{type:b,n:n}:null;}
  O3.hook('run','hum',function(g){lkT={};});
  O3.hook('run','first',function(g){});   // (место для П4: сброс — ниже, в § первые 15 с)
  // номер попытки на уровне (до этого боя) — для «с третьего раза»; первая победа вообще
  META_MODS.push({id:'o3t',RUN:function(g){try{var key=typeof lvKey==='function'?lvKey(g.ci,g.li):g.ci+'-'+g.li,dm=g.dif||'n';
    g.o3n=1+(g.endless||g.wk||g.rule||g.dly?0:dm==='n'?+((S.lose||{})[key])||0:typeof DIF_LOSE!=='undefined'?+DIF_LOSE[dm+key]||0:0);g.o3w0=+S.wins||0;
    var F_=f();F_.g=Math.min(99,(+F_.g||0)+1);}catch(x){O3.err('o3t run',x);}},
    END:function(g,win){try{if(!win&&!g.o3lc){g.o3lc=1;g.o3l0=+f().l||0;f().l=Math.min(99,(+f().l||0)+1);}}catch(x){}}});

  /* ================= Ю1 окно победы ================= */
  function win(g){if(!hum()||!g)return null;if(g.o3W!==undefined)return g.o3W;return g.o3W=win0(g);}
  function win0(g){try{
    var c=g.ci,l=g.li,ids=[],camp=!g.endless&&!g.wk&&!g.rule&&!g.dly;
    if(camp&&l===5&&CH[c]){var bs=CH[c].boss;if(c===CH_FIN||bs==='liho')ids.push('w_liho');ids.push('w_'+bs);}
    if(camp&&c===0&&l===0&&!g.o3w0)ids.push('f_win');
    if(g.lives<=1)ids.push('w_last');
    if(camp&&g.o3n>=3)ids.push('w_try3');
    if(g.yar)ids.push('w_yar');
    if(camp&&g.dif==='h')ids.push('w_hell');
    if(camp&&g.dif==='s')ids.push('w_hard');
    if(!g.leaks)ids.push('w_clean');
    if(g.tw&&g.tw.some(function(t){return t&&(t.kills||0)>=100;}))ids.push('w_100');
    if(g.o3kolo||g.kolos)ids.push('w_kolo');
    var tw=(g.tw||[]).filter(Boolean);
    if(tw.length>=3&&tw.every(function(t){return t.type==='arch';})&&typeof towerUnlocked==='function'&&towerUnlocked('pushka'))ids.push('w_arch');
    if(!g.spells&&g.sp&&g.sp.thunder&&!g.sp.thunder.locked)ids.push('w_nospell');
    if(g.speed>=2)ids.push('w_fast');
    return first(ids);}catch(x){O3.err('win',x);return null;}}

  /* ================= Ю2 окно поражения («Рапорт Потапа») ================= */
  var LK_ID={muh:'l_muh',wolf:'l_wolf',fly:'l_fly',kik:'l_kik',upyr:'l_upyr'};
  function enName(t){if(t==='fly')return Lg('летучие','flyers');var e=typeof EN!=='undefined'&&EN[t];return e?e.n:t;}
  function lose(g){if(!hum()||!g)return null;if(g.o3L!==undefined)return g.o3L;return g.o3L=lose0(g);}
  function lose0(g){try{
    var ids=[],camp=!g.endless&&!g.wk&&!g.rule&&!g.dly,top=topLeak(),nw=g.waves?g.waves.length:0,held=Math.max(0,g.wave-1),lb=g.leakedBoss;
    var alive=(g.en||[]).filter(function(e){return !e.dead;}).length;
    if(g.endless&&!g.wk){if(g.quit)ids.push('l_quit');else if(!(g.wave-1>(S.endBest||0)))ids.push('l_siege');}
    else{
      if(!(g.o3l0>0))ids.push('l_first');
      if(lb&&lb.max&&lb.hp/lb.max<.08||nw&&g.wave>=nw&&!lb&&alive<=1)ids.push('l_shot');
      if(g.yar)ids.push('l_yar');
      if(camp&&g.dif==='h')ids.push('l_hell');
      if(camp&&g.o3n>=3)ids.push('l_try3');
      if(g.o3liho)ids.push('l_liho');
      if(g.o3gory)ids.push('l_gory');
      if(top&&LK_ID[top.type])ids.push(LK_ID[top.type]);
      // запасной: второй по счёту вид
      for(var k in lkT)if(LK_ID[k]&&ids.indexOf(LK_ID[k])<0)ids.push(LK_ID[k]);}
    var o=first(ids)||{txt:null,face:P,who:Lg('Воевода Потап','Commander Potap'),k:''};
    o.top=top?{type:top.type,n:top.n,name:enName(top.type)}:null;
    var m=[];
    if(top)m.push(Lg('больше всех прорвалось: ','most got through: ')+enName(top.type)+' ×'+top.n);
    if(g.endless&&!g.wk){var rk=Math.max(1,(S.endBest||0)-(g.wave-1)+1);m.push(Lg('до рекорда: ','to the record: ')+rk+' '+plw(rk,'волна','волны','волн','wave','waves'));}
    else if(lb&&lb.max)m.push(Lg('боссу оставалось ','the boss had ')+Math.ceil(lb.hp/lb.max*100)+Lg('% здоровья','% health left'));
    else if(nw)m.push(nw-held<=1?Lg('не хватило последней волны','just the final wave to go'):(function(k){return Lg('оставалось '+k+' ','short by '+k+' ')+plw(k,'волна','волны','волн','wave','waves');})(nw-held));
    o.miss=m.join(' · ');
    return o;}catch(x){O3.err('lose',x);return null;}}

  /* ================= Ю6 слово перед боем ================= */
  function intro(c,l,mode){if(!hum())return null;try{
    if(mode==null){mode=typeof difOf==='function'?difOf(c):'n';try{var a=window.YAR&&YAR.armed();if(a&&a.c===c&&a.l===l)mode='yar';}catch(e){}}
    var ids=[];
    if(mode==='dly')ids.push('i_dly');
    else if(mode==='yar'){var r=window.YAR&&YAR.rec?YAR.rec(c,l):0;ids.push(r>0?'i_yar2':'i_yar1',r>0?'i_yar1':'i_yar2');}
    else if(mode==='h'){if(CH[c]&&CH[c].boss==='kosh'&&l===5)ids.push('i_hkosh');ids.push('i_h'+c);}
    else if(mode==='s')ids.push('i_s'+c);
    return first(ids);}catch(x){O3.err('intro',x);return null;}}

  function line(id){var o=mk(id,true);if(o)mark(id);return o;}
  function ids(){return Object.keys(B);}
  function scene(k){var s=SC[k];if(!s)return null;return s.map(function(r){var w=WHO[r[0]],nm=w?Lg(w[0],w[1]):Lg(r[0].split('|')[0],r[0].split('|')[1]||r[0]);return {who:nm,face:w?w[2]:'',txt:Lg(r[1],r[2])};});}

  return {win:win,lose:lose,intro:intro,line:line,ids:ids,scene:scene,scenes:function(){return Object.keys(SC);},
    bank:B,sc:SC,en3:EN3,en3x:EN3_X,boss:BOSS,fresh:fresh,mark:mark,f:f,tx:tx,topLeak:topLeak,_lk:function(){return lkT;},_alias:EN3_ALIAS};
  function onLeak(e){if(typeof O3T_onLeak==='function')O3T_onLeak(e);}
})();
// поле сохранения П4: S.o2f (≤400 знаков: g — боёв, l — поражений, q — 30 последних id строк, m, p)
OB2.field('f',{id:'hum',def:function(){return {g:0,l:0,q:''};},fix:function(v){if(typeof v.q!=='string')v.q='';if(v.q.length>240)v.q=v.q.split(',').slice(-30).join(',').slice(-240);
  for(var k in v)if(['g','l','q','m','p'].indexOf(k)<0)delete v[k];}});

/* ================= § бой: первые 15 секунд (флаг first) и голоса в бою (флаг hum) ================= */
(function(){
  var T=O3T,st={};
  function camp(g){return g&&!g.endless&&!g.wk&&!g.rule&&!g.dly;}
  function early(g){return g&&camp(g)&&g.ci===0&&g.li<3;}
  function L(a){return a?Lg(a[0],a[1]):'';}
  function hero(){try{return window.O3H&&O3.on('hero')&&O3H.hero&&!O3H.hero.down?O3H.hero:null;}catch(e){return null;}}
  O3.hook('run','o3',function(g){st={sayT:-99,actT:-99,seen0:{},pl:[],tap:0,gift:null,gN:0,x3:0,life:0,gate:0,kolo:null,wave:0,pn:-1,nTw:0,boss:{},pie:0,dec:0,coin:0,mast:0,gap0:0};
    try{for(var k in (S.seen||{}))st.seen0[k]=1;}catch(e){}});

  /* ---------- первые 15 с ---------- */
  // волна новичка — с 1-й секунды (было 2,5 с)
  O3.hook('run','first',function(g){if(g.goNov&&g.goT>1)g.goT=1;
    var n=(+T.f().g||0)+1;if(camp(g)&&n>=1&&n<=3)st.gift={at:9,v:0};});   // подарок Яги — в первые 3 боя
  // «Ткни сюда» и первый удар: есть богатырь — он идёт навстречу первому волку; нет — воевода сам ставит стрельцов уже через 4 с без касания (было 6 с)
  O3.hook('frame','first',function(dt,g){
    if(g.goNov&&!st.dec&&g.t>.3){st.dec=1;if(!hero()&&!(g.nvTap>0))g.nvTap=-2;}
    if(g.goNov&&!st.hgo&&g.en.length){var h=hero();if(h)try{var e=g.en[0],P=g.map.paths[e.pi],p=pathPos(e.pi,Math.max(e.d+40,P.len*.4));var g0=h.go;O3H.goTo(p.x,p.y);h.go=g0;st.hgo=1;}catch(x){st.hgo=1;}}
    // «первая волна пошла»: в первом бою, когда первая нечисть упала и стоят 2 заставы
    if(g.goNov&&!st.coin&&g.kills>=1&&g.tw.filter(Boolean).length>=2){st.coin=1;try{voice(L(T.bank.f_coin.t),VOEV(),'voevoda',7);}catch(x){}}
    // подарок Яги
    var G_=st.gift;if(G_&&!G_.v&&g.started&&g.t>=G_.at){var P0=g.map.paths[0];if(P0){var q=pathPos(0,P0.len*.5);G_.v=1;G_.x=q.x+14;G_.y=q.y+4;G_.t=0;G_.life=12;}}
    if(G_&&G_.v===1){G_.t+=dt;if(G_.t>G_.life){G_.v=3;O3.ev('gift',{a:'miss'});}}
    if(G_&&G_.v===2){G_.t+=dt;if(G_.t>1)st.gift=null;}
    // знакомство с новой нечистью: плашка на холсте
    for(var i=0;i<g.en.length;i++){var e=g.en[i];if(e.o3s)continue;e.o3s=1;newEnemy(g,e);}
    if(st.pl.length&&g.tut!==1&&!(n11(g)&&g.banner)){st.pl[0].t+=dt;if(st.pl[0].t>st.pl[0].d)st.pl.shift();}   // o3:FIX на 1-1 плашка ждёт баннер волны
    if(st.tq&&n11(g)&&!busy(g)){var tq=st.tq;st.tq=null;try{toast(tq);}catch(x){}}
  });
  O3.hook('frame','hum',function(dt,g){humFrame(dt,g);});
  O3.hook('tap','first',function(p){var G_=st.gift;var g=G;
    if(G_&&G_.v===1&&(G_.x-p.x)*(G_.x-p.x)+(G_.y-6-p.y)*(G_.y-6-p.y)<34*34){var v=Math.max(20,Math.round((typeof buildCost==='function'?buildCost('arch'):70)*.6));
      g.coins+=v;G_.v=2;G_.t=0;G_.g=v;try{addNum(G_.x,G_.y-24,'+'+v,'#ffd84a');SND.coin();}catch(x){}O3.ev('gift',{a:'got',v:v,n:+T.f().g||0});return true;}
    return false;});
  // «тык»: касание по нечисти — 1–3 урона, каждое 20-е — маленькая молния. Место под заставу рядом открывается всё равно (false)
  O3.hook('tap','first',function(p){var g=G;if(!g||g.over||g.wk||g.dly)return false;var best=null,bd=1e9;
    for(var i=0;i<g.en.length;i++){var e=g.en[i];if(e.dead||e.invul)continue;var r=(e.r||10)+14,d=(e.x-p.x)*(e.x-p.x)+(e.y-6-p.y)*(e.y-6-p.y);if(d<r*r&&d<bd){bd=d;best=e;}}
    if(!best)return false;st.tap++;
    try{if(st.tap%20===0){st.zap={x:best.x,y:best.y,t:0};var z=[];for(var j=0;j<g.en.length;j++){var o=g.en[j];if(!o.dead&&(o.x-best.x)*(o.x-best.x)+(o.y-best.y)*(o.y-best.y)<46*46)z.push(o);}
        for(var k=0;k<z.length;k++)dmgEnemy(z[k],12,'true',null);addNum(best.x,best.y-(best.r||10)-8,'⚡12','#bfe6ff');try{SND.thunder();}catch(x){}}
      else{var n=1+Math.floor(O3.rnd()*3);dmgEnemy(best,n,'true',null);addNum(best.x,best.y-(best.r||10)-6,'−'+n,'#ffffff');}}catch(x){O3.err('tyk',x);}
    return false;});
  O3.hook('end','o3',function(g,win){if(st.tap&&!st.tapE){st.tapE=1;O3.ev('tyk',{n:st.tap});}});

  function newEnemy(g,e){var t=e.type,b=EN[t];if(!b)return;
    if(O3.on('first')&&!e.boss&&!e.lead&&!st.seen0[t]&&t!=='egg'&&t!=='snowb'){st.seen0[t]=1;var ln=T.en3[T._alias[t]||t],tx=ln?L(ln[0]):(b.about||'');
      st.pl.push({n:b.n,s:tx,t:0,d:Math.min(4,Math.max(1.5,tx.length*.05))});}
    if(O3.on('hum'))humSpawn(g,e);}

  // плашка «знакомство» — экранные координаты, под баннером волны
  O3.hook('draw','first',function(c,g){
    var G_=st.gift;if(G_&&(G_.v===1||G_.v===2))drawGift(c,G_,g);
    if(st.zap){st.zap.t+=1/60;var z=st.zap;if(z.t>.35)st.zap=null;else{c.save();c.globalAlpha=1-z.t/.35;c.strokeStyle='#dff4ff';c.lineWidth=3;c.beginPath();c.moveTo(z.x-6,z.y-90);c.lineTo(z.x+6,z.y-55);c.lineTo(z.x-4,z.y-45);c.lineTo(z.x+2,z.y-8);c.stroke();c.restore();}}
    if(!st.pl.length||g.tut===1||(n11(g)&&g.banner))return;var P=st.pl[0],q=P.t/P.d,a=q<.12?q/.12:q>.85?(1-q)/.15:1;
    c.save();try{var d=VIEW.dpr;c.setTransform(d,0,0,d,0,0);c.globalAlpha=Math.max(0,a);var W=Math.min(VIEW.W-24,380),x0=(VIEW.W-W)/2,y0=VIEW.top+64;
      c.font=cvF(600,15);var lines=wrap(c,P.s,W-24,3),h=34+lines.length*19;
      c.fillStyle='rgba(255,247,230,.97)';if(typeof rr==='function'){rr(c,x0,y0,W,h,12);c.fill();}else c.fillRect(x0,y0,W,h);
      c.strokeStyle='#8a5a2b';c.lineWidth=3;c.stroke();
      c.fillStyle='#a82c17';c.textAlign='center';c.textBaseline='middle';c.font=cvF(900,17);c.fillText(Lg('Новая нечисть: ','New monster: ')+P.n,VIEW.W/2,y0+17);
      c.fillStyle='#2b2117';c.font=cvF(600,16);for(var i=0;i<lines.length;i++)c.fillText(lines[i],VIEW.W/2,y0+36+i*19);}catch(x){}c.restore();});
  function wrap(c,s,w,max){var ws=String(s).split(' '),out=[],cur='';for(var i=0;i<ws.length;i++){var t=cur?cur+' '+ws[i]:ws[i];if(c.measureText(t).width>w&&cur){out.push(cur);cur=ws[i];}else cur=t;}
    if(cur)out.push(cur);if(out.length>max){out=out.slice(0,max);out[max-1]=out[max-1].replace(/\s*\S*$/,'')+'…';}return out;}
  function drawGift(c,G_,g){var t=G_.t,x=G_.x,y=G_.y;c.save();
    if(G_.v===1){var fall=Math.min(1,t/.5),yy=y-70*(1-fall)*(1-fall),pl=.5+.5*Math.sin(t*5),fade=G_.life-t<2?(G_.life-t)/2:1;c.globalAlpha=Math.max(0,fade);
      c.fillStyle='rgba(255,220,90,'+(.25+.25*pl)+')';c.beginPath();c.arc(x,yy-6,22+pl*4,0,Math.PI*2);c.fill();
      c.fillStyle='#b8322a';c.beginPath();c.arc(x,yy-4,11,0,Math.PI*2);c.fill();c.fillStyle='#fff3d6';for(var i=0;i<5;i++){var a=i*1.26;c.beginPath();c.arc(x+Math.cos(a)*6,yy-4+Math.sin(a)*5,1.6,0,Math.PI*2);c.fill();}
      c.fillStyle='#8a1f18';c.beginPath();c.moveTo(x-5,yy-14);c.lineTo(x,yy-10);c.lineTo(x+5,yy-14);c.lineTo(x+3,yy-19);c.lineTo(x,yy-15);c.lineTo(x-3,yy-19);c.closePath();c.fill();}
    else{c.globalAlpha=Math.max(0,1-t);c.strokeStyle='#ffd84a';c.lineWidth=3;c.beginPath();c.arc(x,y-6,12+t*30,0,Math.PI*2);c.stroke();}
    c.restore();}

  /* ---------- Потап знакомится (Ю5): подмена первой реплики обучения ---------- */
  if(typeof window.voice==='function'){var oV=window.voice;window.voice=function(text,who,img,dur){
    try{if(O3.on('first')&&G&&G.tut===1&&G.t<5&&/^(Нечисть идёт|Нечисть лезет|Monsters are)/.test(String(text)))text=L(T.bank.f_hi.t);}catch(x){}
    return oV.call(this,text,who,img,dur);};}

  /* ---------- без окна вступления на 1-1…1-3 (первый проход Обычного) ---------- */
  if(typeof window.openIntro==='function'){var oI=window.openIntro;window.openIntro=function(c,l){
    try{if(O3.on('first')&&!G&&c===0&&l<3&&(typeof difOf!=='function'||difOf(c)==='n')&&!(typeof difStars==='function'?difStars(c,l,'n'):(S.stars||{})[c+'-'+l])){
      O3.ev('first',{k:'nointro',l:l+1});startLevel(c,l);return;}}catch(x){O3.err('nointro',x);}
    var r=oI.apply(this,arguments);
    // Ю6: свежее слово воеводы для ⚔/🔥/Ярь
    try{if(O3.on('hum')){var dm=typeof difOf==='function'?difOf(c):'n';if(dm!=='n'){var mode=dm==='h'&&window.YAR&&YAR.open&&YAR.open(c,l)?'yar':dm,o=T.intro(c,l,mode);
      var d=o&&document.querySelector('#mBody .say div');if(d){d.innerHTML='<b class="who">'+o.who+'</b>'+o.txt;if(typeof fitModal==='function')fitModal();}}}}catch(x){O3.err('intro',x);}
    return r;};}

  /* ---------- голоса нечисти и боссов (Ю3/Ю4): свой список O3.say, не чаще раза в 8 с ---------- */
  function sayE(e,s,d){if(!s)return;O3.say(e.x,e.y,s,d||Math.min(9,3+s.length*.07));var b=O3.bub[O3.bub.length-1];if(b)b.e=e;}
  function can(g){return g.t-st.sayT>=st.gap0;}
  function said(g){st.sayT=g.t;st.gap0=8+O3.rnd()*6;}
  function later(sec,fn){(st.q=st.q||[]).push({t:sec,fn:fn});}
  function humSpawn(g,e){var t=e.type;
    if(e.boss){var B_=T.boss[t];if(B_&&B_.go){var bl=L(B_.go);later(3.2,function(){if(!e.dead){sayE(e,bl,5);said(G);}});}st.boss[t]={e:e,ab:e.abT,n:0};
      if(camp(g)&&!st.pie&&((+T.f().g||0)%10===0)&&g.ci+g.li>2){st.pie=1;act(g,'a_pie',1);}return;}
    if(e.lead&&t==='lesh'){var ll=L((T.en3x.lesh_lead||[])[0]);later(3.1,function(){if(!e.dead){sayE(e,ll,6);said(G);}});return;}
    if(g.tut===1||!can(g))return;var ln=T.en3[T._alias[t]||t];if(!ln||O3.rnd()>.3)return;
    var s=L(O3.pick(ln));said(g);later(1.5,function(){if(!e.dead){sayE(e,s);if(t==='voron')e.o3crow=1;}});}
  O3.hook('kill','hum',function(e){if(e&&e.o3crow&&G){var cw=L((T.en3x.crow||[])[0]);if(cw)O3.say(e.x,e.y,cw,3.5);}
    if(e&&e.type==='egg'&&G){var k=st.boss.kosh;if(k&&!k.n){k.n=1;var ke=k.e;var kt=L((T.boss.kosh||{}).ab);if(kt)later(2.2,function(){O3.say(ke.x,ke.y,kt,5);said(G);});}}});
  window.O3T_onLeak=function(e){var g=G;if(!g||!O3.on('hum')||e.boss||!can(g)||O3.rnd()>.35)return;var lt=L((T.en3x.leak||[])[0]);if(!lt)return;O3.say(e.x,e.y,lt,5);said(g);};
  function humFrame(dt,g){
    if(st.q)for(var i=st.q.length-1;i>=0;i--){st.q[i].t-=dt;if(st.q[i].t<=0){var f=st.q[i].fn;st.q.splice(i,1);try{f();}catch(x){}}}
    // приёмы боссов: перезарядка подскочила — приём был
    for(var k in st.boss){var b=st.boss[k],e=b.e;if(e.dead)continue;
      if(k==='gory'&&(e.ph||0)>(b.ph||0)){b.ph=e.ph;if(!b.hd){b.hd=1;later(2.1,function(){if(!st.boss.gory.e.dead){sayE(st.boss.gory.e,L((T.boss.gory||{}).ab),5);said(G);}});}}
      if(e.abT>b.ab+1){if(k==='liho')g.o3liho=1;if(k==='gory')g.o3gory=1;
        if(!b.n&&T.boss[k]&&T.boss[k].ab&&k!=='gory'&&k!=='kosh'){b.n=1;(function(ee,s){later(1.7,function(){if(!ee.dead){sayE(ee,s,5);said(G);}});})(e,L(T.boss[k].ab));}}
      b.ab=e.abT;}
    // «Ай! Я жаловаться буду!» — изредка у подбитой нечисти
    if(g.tut!==1&&can(g)&&O3.rnd()<.004){for(var j=0;j<g.en.length;j++){var o=g.en[j];if(!o.dead&&!o.boss&&o.flash>0&&o.hp<o.max){sayE(o,L((T.en3x.hit||[])[0]),4);said(g);break;}}}
    actFrame(dt,g);}

  /* ---------- Потап на действия игрока (Ю8): внизу (#voice.low), не чаще раза в 60 с, не на 1-1…1-3 ---------- */
  function act(g,id,force){if(!g||g.over||early(g)||g.tut)return false;if(!force&&g.t-st.actT<60)return false;if(g.t-st.actT<8)return false;
    var b=T.bank[id];if(!b)return false;st.actT=g.t;try{voice(L(b.t),VOEV(),'voevoda',7);O3.ev('act',{k:id});}catch(x){}return true;}
  function actFrame(dt,g){
    if(g.speed>=3&&!st.x3){st.x3=1;act(g,'a_x3');}
    if(g.lives===1&&g.maxLives>1&&!st.life){st.life=1;act(g,'a_life',1);}
    if(st.kolo&&!g.kolo&&!st.kolo.got)act(g,'a_kolo');st.kolo=g.kolo;
    if(g.wave>st.wave){if(st.wave>0&&st.pn>1.5)act(g,'a_early');st.wave=g.wave;}st.pn=g.nextT;
    var n=0;for(var i=0;i<g.tw.length;i++){var t=g.tw[i];if(!t)continue;n++;
      if(t.lvl===4&&!st.mast&&!T.f().m){st.mast=1;T.f().m=1;act(g,'a_mast',1);}
      if(!t.o3g){t.o3g=1;if(!st.gate&&st.nTw0){var P=g.map.paths[0],q=P&&pathPos(0,P.len);if(q&&(q.x-t.x)*(q.x-t.x)+(q.y-t.y)*(q.y-t.y)<85*85){st.gate=1;act(g,'a_gate');}}}}
    st.nTw0=1;}
  /* o3:FIX верх экрана на 1-1 — не больше одной надписи за раз. Порядок: баннер волны (игра) → плашка «Новая нечисть» (ждёт баннер) → «Волна N из M» (прячется под плашкой)
     → пузыри реплик в верхней полосе (прячутся, пока занято сверху) → тосты (ждут в очереди). Только 1-1; остальное как было. */
  function n11(g){try{return !!(g&&!g.over&&camp(g)&&g.ci===CH_ORDER[0]&&g.li===0);}catch(x){return false;}}
  function plOn(g){return !!(st.pl.length&&g.tut!==1&&!g.banner);}
  function busy(g){return !!(g.banner||plOn(g));}
  function scrY(c,y){try{var m=c.getTransform();return (m.d*y+m.f)/(VIEW.dpr||1);}catch(x){return 999;}}
  function topHide(c,y){var g=G;if(!n11(g))return false;var sy=scrY(c,y),T0=VIEW.top||0;return sy<T0+(busy(g)?170:52);}   // 52 — под «Волна N из M»
  (function(){var oB=window.drawBubble;if(typeof oB==='function')window.drawBubble=function(b){try{var e=b.e;if(e&&topHide(ctx,e.y-(e.r||10)*2.6-(e.fly?18:0)-46))return;}catch(x){}return oB.apply(this,arguments);};
    var oO=window.drawO3Bub;if(typeof oO==='function')window.drawO3Bub=function(c,b){try{var e=b.e&&!b.e.dead?b.e:null,y=e?e.y-(e.r||10)*2.6:b.y-30;if(topHide(c,y-46))return;}catch(x){}return oO.apply(this,arguments);};
    var oP=window.goNovPill;if(typeof oP==='function')window.goNovPill=function(c,W){try{if(n11(G)&&plOn(G))return;}catch(x){}return oP.apply(this,arguments);};
    var oT=window.toast;if(typeof oT==='function')window.toast=function(s){try{if(n11(G)&&document.body.classList.contains('run')&&busy(G)){st.tq=s;return;}}catch(x){}return oT.apply(this,arguments);};})();
  function wrapG(name,fn){var o=window[name];if(typeof o!=='function')return;window[name]=function(){var pre;try{pre=fn.pre?fn.pre.apply(null,arguments):null;}catch(x){}var r=o.apply(this,arguments);try{fn.post(pre,r,arguments);}catch(x){}return r;};}
  wrapG('castThunder',{pre:function(x,y){var g=G,n=0,r=(SPELLS.thunder.r||60)*1.2;if(g)for(var i=0;i<g.en.length;i++){var e=g.en[i];if(!e.dead&&(e.x-x)*(e.x-x)+(e.y-y)*(e.y-y)<(r+e.r)*(r+e.r))n++;}return n;},
    post:function(n){if(G&&O3.on('hum')&&n===0)act(G,'a_miss');}});
  wrapG('sellTower',{post:function(p,r){if(G&&O3.on('hum')&&r!==false)act(G,'a_sell');}});
  wrapG('castCat',{post:function(){if(G&&O3.on('hum'))act(G,'a_cat');}});
})();
// пузырь реплики волны 3.0 (переопределение П0): идёт за нечистью (b.e), перенос до 3 строк, шрифт как у G.bub (wfs 16 px)
function drawO3Bub(c,b){var e=b.e&&!b.e.dead?b.e:null,x=e?e.x:b.x,y=e?e.y-(e.r||10)*2.6-(e.fly?18:0)-(e.boss?e.r*.8:0):b.y-30;
  var q=b.t/b.d,a=q<.1?q/.1:q>.85?(1-q)/.15:1;if(b.e&&b.e.dead&&b.t>.3)a=Math.min(a,1);
  c.save();c.globalAlpha=Math.max(0,a);var CV=typeof CVL!=='undefined'?CVL:null,fs=typeof wfs==='function'?wfs(CV?16:13.5):14;c.font=(typeof cvF==='function'?cvF(CV?700:800,fs):'700 '+fs+'px sans-serif');
  var maxW=Math.min(260,(typeof WW!=='undefined'?WW:390)-16),ws=String(b.s).split(' '),L=[],cur='';
  for(var i=0;i<ws.length;i++){var t=cur?cur+' '+ws[i]:ws[i];if(c.measureText(t).width>maxW-fs&&cur){L.push(cur);cur=ws[i];}else cur=t;}if(cur)L.push(cur);if(L.length>3){L=L.slice(0,3);L[2]+='…';}
  var w=0;for(var j=0;j<L.length;j++)w=Math.max(w,c.measureText(L[j]).width);w+=fs;var lh=fs*1.25,h=L.length*lh+fs*.6;
  var bx=Math.max(4,Math.min((typeof WW!=='undefined'?WW:390)-w-4,x-w/2)),by=Math.max(4,y-h);try{if(typeof bubZone==='function'){var Z=bubZone();by=Math.max(by,(Z.top+(G&&G.boss&&!G.boss.dead?(CV?50:44):G&&G.goNov?40:6)-VIEW.oy)/VIEW.s);}}catch(x){}
  c.fillStyle=CV?CV.bub:'rgba(255,250,236,.95)';if(typeof rr==='function'){rr(c,bx,by,w,h,Math.min(14,h/2));c.fill();}else c.fillRect(bx,by,w,h);
  c.strokeStyle=CV?CV.bubE:'#8a5a2b';c.lineWidth=1.3;c.stroke();
  c.fillStyle=CV?CV.bubT:'#2b2117';c.textAlign='center';c.textBaseline='middle';for(var k=0;k<L.length;k++)c.fillText(L[k],bx+w/2,by+fs*.3+lh*(k+.5));c.restore();}
