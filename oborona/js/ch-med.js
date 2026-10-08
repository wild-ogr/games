'use strict';
/* ================= OB:CH — тема «Медной горы царство» (глава 8 в сохранении, 5-я по порядку — после Царства Кощея) =================
   Рисунки — js/ch-med-art.js (из «Богатыря»). Повадки: подкоп (ящерка), бросок кирки (чудь), щит + дробление (глыбник),
   присоска (рудничный упырь), воришка (самоцветный жук). Вожаки: Чудь-старшина (3-й ур.), Великий Полоз (4-й ур.).
   Босс — Хозяйка Медной горы: малахитовые стены (замуровывает заставы), зовёт ящерок, раненая растит каменные цветы (лечат её; жми пальцем).
   7-й уровень — «Логово»: Хозяйка ярая (здоровье ×1,6, приёмы чаще). Награды темы: Кузница II, Самоцветная копь, знамя. */
(function(){
const MED=8;
/* ---------- нечисть (hp — в единицах 1-й главы, дальше ×HP_MUL главы) ---------- */
Object.assign(EN,{
  med_yash:{n:'Ящерка-самоцветка',hp:40,spd:46,gold:6,sz:.95,ab:'burrow',ch:MED,about:'Ныряет под камень и выныривает дальше. Под землёй её не достать.'},
  med_chud:{n:'Чудь белоглазая',hp:58,spd:34,gold:7,ab:'lob',ch:MED,about:'Кидает кирки в заставы — та, в которую попали, ненадолго молчит.'},
  med_glyb:{n:'Каменный глыбник',hp:170,spd:24,gold:14,lives:2,ab:'shield',split:'med_kam',sz:.8,ch:MED,about:'Спереди — каменный щит: бей сбоку и в спину. Разбитый рассыпается на камешки.'},
  med_kam:{n:'Камешек',hp:36,spd:42,gold:2,art:'med_glyb',sz:.5,ch:MED,about:'Осколок глыбника. Мелкий, да твёрдый.'},
  med_upyr:{n:'Рудничный упырь',hp:72,spd:40,gold:9,regen:.02,ab:'latch',latchT:5,ch:MED,about:'Цепляется к заставе — та стреляет вдвое реже, пока упыря не собьют.'},
  med_zmei:{n:'Медная змейка',hp:28,spd:62,gold:4,ch:MED,about:'Шустрая, медная, ходит стайкой.'},
  med_zhuk:{n:'Самоцветный жук',hp:44,spd:58,gold:14,lives:0,ab:'thief',steal:15,ch:MED,about:'Воришка: дошёл до ворот — утащит монеты. Сбитый платит щедро.'},
  med_chst:{n:'Чудь-старшина',hp:110,spd:22,gold:20,lives:2,ab:'chst',lobCd:5,lobR:130,lobS:1.8,sz:.55,ch:MED,about:'Старший над чудью: кирки летят чаще и дальше, раненый зовёт подмогу.'},
  med_poloz:{n:'Великий Полоз',hp:140,spd:28,gold:20,lives:2,armor:.2,ab:'burrow',under:2,sz:.5,ch:MED,about:'Ныряет под землю, а выныривает со змейками. Где прополз — там золото.'},
  med_hoz:{n:'Хозяйка Медной горы',g:'f',hp:1200,spd:16,gold:260,lives:20,boss:1,sz:.66,ch:MED,about:'Замуровывает заставы в малахит и зовёт ящерок. Раненая растит каменные цветы — они её лечат.'},
  med_cvet:{n:'Каменный цветок',hp:200,spd:0,gold:0,lives:0,sz:.85,ab:'cvet',owner:'med_hoz',ch:MED,about:'Пока цветёт — Хозяйка заживает. Жми на цветок пальцем!'}
});
const EN_EN={
  med_yash:{n:'Gem Lizard',about:'Dives under the rock and pops up further on. Nothing can reach it underground.'},
  med_chud:{n:'White-Eyed Chud',about:'Throws picks at outposts — the one it hits goes quiet for a moment.'},
  med_glyb:{n:'Boulder Brute',about:'A stone shield in front: hit it from the side and behind. Broken, it crumbles into pebbles.'},
  med_kam:{n:'Pebble',about:'A chip off the Boulder Brute. Small but hard.'},
  med_upyr:{n:'Mine Upyr',about:'Latches onto an outpost — it fires half as often until the upyr is knocked off.'},
  med_zmei:{n:'Copper Snake',about:'Quick, coppery, travels in little packs.'},
  med_zhuk:{n:'Gem Beetle',about:'A thief: if it reaches the gate it steals coins. Shot down, it pays well.'},
  med_chst:{n:'Chud Elder',about:'Boss of the Chud: picks fly more often and further, and when hurt he calls for help.'},
  med_poloz:{n:'Great Serpent',about:'Dives underground and surfaces with little snakes. Where he crawls, gold remains.'},
  med_hoz:{n:'Mistress of Copper Mountain',about:'Walls outposts up in malachite and calls her lizards. Wounded, she grows stone flowers that heal her.'},
  med_cvet:{n:'Stone Flower',about:'While it blooms, the Mistress heals. Tap the flower!'}};
for(const k in EN_EN)langReg(EN[k],EN_EN[k]);

/* ---------- присказки, реплики, имена волн ---------- */
const LORE_RU={med_yash:'Ящерка-самоцветка. На спине — изумруды, в голове — ветер. Хозяйке служит, а сама всё в норку норовит.',
  med_chud:'Чудь белоглазая. Живёт под землёй, света не любит, а кирку кидает метко — тренировалась на сталактитах.',
  med_glyb:'Каменный глыбник. Думает медленно, зато щит у него — гора. В прямом смысле.',
  med_kam:'Камешек. Был частью глыбника, теперь сам по себе. Гордый.',
  med_upyr:'Рудничный упырь. Позеленел от малахитовой пыли и прилипчив, как смола.',
  med_zmei:'Медная змейка. Звенит, когда ползёт. Говорят, к богатству. Врут.',
  med_zhuk:'Самоцветный жук. Ничего не ломает, только всё тащит. Особенно монеты.',
  med_chst:'Чудь-старшина. Носит каску с фонарём и командует всеми кирками в округе.',
  med_poloz:'Великий Полоз. Где проползёт — там золотая жила. Где не проползёт — там тоже, но поглубже.',
  med_hoz:'Хозяйка Медной горы. Платье малахитовое, нрав каменный. Мастеров любит, воевод — не очень.',
  med_cvet:'Каменный цветок. Красоты небывалой — и лечит Хозяйку, пока цветёт.'};
const LORE_EN={med_yash:'Gem Lizard. Emeralds on its back, wind in its head. Serves the Mistress, but always heads for a burrow.',
  med_chud:'White-Eyed Chud. Lives underground, hates daylight, and throws a pick with deadly aim — it practiced on stalactites.',
  med_glyb:'Boulder Brute. Slow-witted, but its shield is a mountain. Literally.',
  med_kam:'Pebble. Used to be part of a Boulder Brute, now it’s on its own. Proud of it.',
  med_upyr:'Mine Upyr. Turned green from malachite dust and sticks like tar.',
  med_zmei:'Copper Snake. Jingles as it crawls. They say it brings riches. They lie.',
  med_zhuk:'Gem Beetle. Breaks nothing, steals everything. Especially coins.',
  med_chst:'Chud Elder. Wears a helmet with a lantern and bosses every pick around.',
  med_poloz:'Great Serpent. Where he crawls, a gold vein appears. Where he doesn’t — there too, just deeper.',
  med_hoz:'Mistress of Copper Mountain. Malachite dress, heart of stone. Loves craftsmen, not so fond of commanders.',
  med_cvet:'Stone Flower. Beautiful beyond words — and it heals the Mistress while it blooms.'};
Object.assign(LORE,LORE_RU);chLang(LORE,LORE_EN);
BOSS_SAY.med_hoz=['Моё царство — мои правила!','Малахит, держи их!','Ко мне, ящерки!'];
BOSS_TIP.med_hoz='Замурованная застава молчит — держи несколько сильных. Вырастут каменные цветы — жми на них пальцем!';
chLang(BOSS_SAY,{med_hoz:['My realm — my rules!','Malachite, hold them!','To me, my lizards!']});
chLang(BOSS_TIP,{med_hoz:'A walled-up outpost goes quiet — keep several strong ones. When stone flowers grow, tap them!'});
Object.assign(WAVE_NAMES,{med_yash:['Ящерки-самоцветки','Изумрудный ручеёк'],med_chud:['Чудь из штолен','Кирки к бою'],med_glyb:['Каменный обвал','Глыбы на марше'],
  med_upyr:['Рудничные упыри','Зелёная напасть'],med_zmei:['Медный звон','Змейки-шустрилки']});
chLang(WAVE_NAMES,{med_yash:['Gem lizards','An emerald trickle'],med_chud:['Chud from the mines','Picks at the ready'],med_glyb:['Rockslide','Boulders on the march'],
  med_upyr:['Mine upyrs','The green plague'],med_zmei:['Copper chime','Speedy snakes']});

/* ---------- вожаки ---------- */
Object.assign(LEAD.at,{[MED+'-2']:'med_chst',[MED+'-3']:'med_poloz',[MED+'-6']:'med_chst'});
LEAD.n.med_chst='Чудь-старшина';LEAD.n.med_poloz='Великий Полоз';chLang(LEAD.n,{med_chst:'Chud Elder',med_poloz:'Great Serpent'});
LEAD.ab=LEAD.ab||{};LEAD.ab.med_chst='Кидает кирки дальше всех. Раненый зовёт чудь на подмогу!';LEAD.ab.med_poloz='То под землёй, то наверху — со змейками. Держи заставы вдоль всей дороги!';
chLang(LEAD.ab,{med_chst:'Throws picks further than anyone. Wounded, he calls the Chud for help!',med_poloz:'Now underground, now on top — with snakes. Keep outposts along the whole road!'});
LEAD.sayT=LEAD.sayT||{};LEAD.sayT.med_chst=['А ну, кирки к бою!','Чудь, за мной!','Свету не люблю!'];LEAD.sayT.med_poloz=['Ш-ш-ш… золото моё!','Кто по моей тропе идёт?','Сс-с-с!'];
chLang(LEAD.sayT,{med_chst:['Picks at the ready!','Chud, follow me!','I hate daylight!'],med_poloz:['Hsss… the gold is mine!','Who walks my path?','Ssss!']});

/* ---------- приёмы ---------- */
// Чудь-старшина: кирки + раненый (50%) зовёт трёх чудинов
CHX.ab.chst=(e,dt,b,sp)=>{chLob(e,dt,b);if(!e.cs&&e.hp<e.max*.5){e.cs=1;say(e,Lg('Чудь, на подмогу!','Chud, to me!'),1.6);for(let i=0;i<3;i++)spawnEnemy('med_chud',e.pi,Math.max(0,e.d-14-i*14),minionHp());}return sp;};
CHX.tip.chst=CHX.tip.lob;
// Великий Полоз: вынырнул — две змейки
CHX.surf.med_poloz=e=>{for(let i=0;i<2;i++)spawnEnemy('med_zmei',e.pi,Math.max(0,e.d-10-i*12),minionHp());};
// Хозяйка Медной горы
CHX.boss.med_hoz=(e,dt)=>{const k=e.yar?CH_YAR.cd:1;
  if(e.wp){e.wp.t-=dt;if(e.wp.t<=0){for(const t of e.wp.ts)if(G.tw[t.i]===t){t.stunT=Math.max(t.stunT,3);t.wallFx=3;t.wallW=0;}SND.roots();G.fx.push({k:'ring',x:e.x,y:e.y,r:160,t:0,dur:.6,col:'#3fdf8f'});e.wp=null;}}
  else if(e.abT<=0){e.abT=8*k;const ts=towersNear(e.x,e.y,175).filter(t=>!(t.stunT>0)).sort((a,b)=>b.inv-a.inv).slice(0,e.yar?3:2);
    if(ts.length){for(const t of ts)t.wallW=.8;e.wp={t:.8,ts};say(e,Lg('Малахит, держи их!','Malachite, hold them!'),1.4);}}
  if(e.ab2<=0){e.ab2=10*k;for(let i=0;i<(e.yar?4:3);i++)spawnEnemy('med_yash',e.pi,Math.max(0,e.d-12-i*12),minionHp());}
  if(!e.flw&&e.hp<e.max*.5){e.flw=1;const d1=eggD(e),P=G.map.paths[e.pi];
    for(const d of[d1,Math.min(P.len-70,d1+56)]){const f=spawnEnemy('med_cvet',e.pi,d,minionHp());f.spd=0;}
    say(e,Lg('Расти, мой цветок!','Grow, my flower!'),2);G.banner={title:Lg('Каменные цветы!','Stone flowers!'),sub:Lg('Пока цветут — Хозяйка заживает. Жми на них пальцем!','While they bloom, the Mistress heals. Tap them!'),t:0};SND.boss();}
  if(e.flw&&G.en.some(o=>o.type==='med_cvet'&&!o.dead)){e.hp=Math.min(e.max,e.hp+e.max*.012*dt);if(Math.random()<dt*2)plus(e.x,e.y-20);}};

/* ---------- глава ---------- */
// здоровье волн по уровням (LEVEL_FIX): подобрано ботом 08.10 под «целевую трудность Обычного» — вход в главу без прокачки ≈ 50% побед,
// с прокачкой (всё накопленное потрачено) — победа с первой попытки, но на 1–2★. Босс (Хозяйка) — без поправки, Логово — ×1,75 и ярая.
chAdd({id:MED,after:3,hp:4.2,coins:500,fix:{'8-0':1.9,'8-1':1.7,'8-2':1.55,'8-3':1.5,'8-4':1.45,'8-5':1.4,'8-6':1.75},lmark:['med_d5','med_d3','d_crystal'],book:['med_kam','med_zhuk','med_chst','med_poloz'],bossBook:['med_cvet'],
  ach:{n:'Каменный цветок',en:'The Stone Flower',bossEn:'Mistress of Copper Mountain'},
  banner:{id:'med',n:'Знамя Медной горы',cost:1200,c1:'#2f9a62',c2:'#f0b070',em:[6,.5],en:'Banner of Copper Mountain'},
  ch:{name:'Медной горы царство',g:'n',sub:'Малахит светится, медь звенит',boss:'med_hoz',en:['med_yash','med_chud','med_glyb','med_upyr','med_zmei'],
    ground:{base:'#4a6656',hi:'#567462',lo:'#3e584a',grass:'#2f7a52',flow:['#3fdf8f','#e0904a','#7ae0ff']},
    road:{edge:'#5a3a1e',fill:'#b08458',hi:'#c49868',deco:'stones'},decor:['med_d1','med_d2','med_d3','med_d4','d_stone','med_d1'],mc:'#2f9a62',dark:1,lair:1,
    // пороги силы («Сила застав», powerNow): подобраны ботом — см. журнал CH
    pw:[340,350,360,365,370,380,395],
    levels:['Малахитовые штольни','Медный рудник','Чудские копи','Тропа Полоза','Самоцветная пещера','Палаты Хозяйки','Каменный цветок'],
    intro:['Медной горы царство! Ящерки-самоцветки ныряют под камень — пока под землёй, их не достать. А чудь кидает кирки в заставы. Держи заставы и подальше по дороге.',
      'Каменные глыбники прикрываются щитом: спереди почти не пробить. Ставь заставы по обе стороны поворота — бей в бок и в спину! Разбитый рассыпается на камешки.',
      'Рудничные упыри цепляются к заставам — та стреляет вдвое реже, пока упыря не собьют соседи. Ставь заставы парами. И берегись Чуди-старшины!',
      'Тропа Полоза. Великий Полоз то ныряет под землю, то выныривает со змейками. Где он прополз — там золото!',
      'Самоцветные жуки — воришки: в город не рвутся, а дошли до ворот — утащат монеты. Сбитый жук платит щедро. А медные змейки шустрые — стрельцов побольше!',
      'Хозяйка Медной горы! Замуровывает заставы в малахит, а раненая растит каменные цветы — они её лечат. Жми на цветы пальцем!',
      'Логово Хозяйки — по желанию. Тут она ярая: стены чаще, ящерок больше. Зато слава какая!'],
    // воришки — с 5-го уровня, в каждой второй волне начиная с третьей
    waveX(waves,li){if(li<4)return;waves.forEach((w,i)=>{if(i>=2&&i%2===0)w.g.push({t:'med_zhuk',n:2+Math.floor(li/2),iv:.9,delay:5});});}},
  en:{name:'Copper Mountain Realm',sub:'Malachite glows, copper rings',
    levels:['Malachite Mines','Copper Pit','Chud Diggings','Serpent’s Path','Gem Cave','The Mistress’s Halls','The Stone Flower'],
    intro:['The Copper Mountain Realm! Gem lizards dive under the rock — while underground, nothing can reach them. And the Chud throw picks at outposts. Keep outposts further down the road too.',
      'Boulder Brutes hide behind a shield: from the front they’re nearly unbreakable. Put outposts on both sides of a bend — hit them in the side and back! Broken, they crumble into pebbles.',
      'Mine upyrs latch onto outposts — those fire half as often until a neighbor knocks the upyr off. Build outposts in pairs. And beware the Chud Elder!',
      'The Serpent’s Path. The Great Serpent dives underground and surfaces with little snakes. Where he crawls, gold remains!',
      'Gem beetles are thieves: they don’t storm the city, but if they reach the gate they steal coins. A beetle shot down pays well. And copper snakes are quick — more archers!',
      'The Mistress of Copper Mountain! She walls outposts up in malachite, and when wounded grows stone flowers that heal her. Tap the flowers!',
      'The Mistress’s Lair — optional. Here she is raging: more walls, more lizards. But what glory!']}});
// тот же рисунок босса для полосы/карточки — Хозяйка смотрит вправо, как вся нечисть
/* ---------- Кузница II (медные мастера): по 3 ступени у каждой заставы, открываются после Хозяйки ---------- */
Object.assign(FORGE_T,{dmg3:{n:'Медная закалка',d:'+8% урона',s:Lg('урон +8%','damage +8%'),lock:MED},sp2:{n:'',d:'',lock:MED},gem:{n:'Самоцветный прицел',d:'стреляют на 8% чаще',lock:MED}});
chLang(FORGE_T,{dmg3:{n:'Copper Tempering',d:'+8% damage'},gem:{n:'Gem Sight',d:'fire 8% more often'}});
Object.assign(FORGE_SP2,{arch:{n:'Медные наконечники',d:'+10% к шансу двойного урона'},pushka:{n:'Медное ядро',d:'+15% радиус взрыва'},
  izba:{n:'Малахитовое варево',d:'лужа замедляет сильнее'},mag:{n:'Самоцветный посох',d:'+1 цель для молнии'},dub:{n:'Каменные корни',d:'оглушение +0,2 с'}});
chLang(FORGE_SP2,{arch:{n:'Copper Arrowheads',d:'+10% double-damage chance'},pushka:{n:'Copper Shot',d:'+15% blast radius'},
  izba:{n:'Malachite Brew',d:'the pool slows harder'},mag:{n:'Gem Staff',d:'+1 lightning target'},dub:{n:'Stone Roots',d:'stun +0.2 s'}});
for(const t of TW_ORDER)FORGE_ORDER[t].push(['dmg3',3],['sp2',4],['gem',5]);
FORGE2_FIRST='dmg3';
const F2S={dmg3:()=>Lg('урон +8%','damage +8%'),gem:()=>Lg('чаще на 8%','8% faster'),
  sp2:t=>({arch:Lg('крит +10%','crit +10%'),pushka:Lg('взрыв +15%','blast +15%'),izba:Lg('замедл. +8%','slow +8%'),mag:Lg('+1 цель','+1 target'),dub:Lg('оглуш. +0,2 с','stun +0.2 s')})[t]};
forgeShort2=(t,k)=>F2S[k](t);
CHX.tstat=(type,o,F)=>{if(F('dmg3')){if(o.dmg!=null)o.dmg*=1.08;if(o.dps!=null)o.dps*=1.08;if(o.fire)o.fire*=1.08;}
  if(F('gem'))o.cd*=.92;
  if(F('sp2')){if(type==='arch')o.crit+=.1;else if(type==='pushka')o.splash*=1.15;else if(type==='izba')o.slow=Math.min(.8,o.slow+.08);else if(type==='mag')o.chain+=1;else if(type==='dub')o.stun+=.2;}};

/* ---------- деревня: Самоцветная копь (казна +15% за уровень), открывается после Хозяйки ---------- */
const kop={id:'kop',name:'Самоцветная копь',ic:'med_d3',about:'Казна копит на 15% больше за каждый уровень',cost:[2000,5000,10000],ch:MED};
BLD.push(kop);langReg(kop,{name:'Gem Mine',about:'The treasury fills 15% faster per level'});
VIL_POS.kop=[.56,.86];
})();
