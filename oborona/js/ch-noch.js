'use strict';
/* ================= OB:BK-OB 24.10 — 12-я земля «Долгая ночь» (глава 11 в сохранении, 12-я по порядку — после Тридевятого царства) =================
   Хвост для быстрых: 77 уровней проходят за 4–5 дней (журнал hobby-analytics/release-i/backlog-2410/BK-OB.md).
   Тема и рисунки — 12-я земля «Богатыря» (js/bb2-land-art.js → js/ch-noch-art.js). Марена украла солнце-Коляду, святочная нечисть гуляет.
   Повадки: Шуликун кидает угольки в заставы (lob), Злыдень цепляется к заставе (latch), Обдериха переносит соседей (carry),
   Зеркальный морок пускает обманки (decoy), Соломенное чучелко встаёт после смерти (revive — своя повадка здесь).
   Вожаки: Чёрт-месяцекрад (рывки), Банник (пар — глушит заставы далеко и часто). Босс — Марена: «Ледяное дыхание» (заставы рядом стреляют
   вдвое реже), зовёт чучелок, «Долгая ночь» — темно, нечисть смелеет (быстрее). Логово — Марена ярая.
   Выключить: ?off=noch (OB2.off) — земли нет, ключи S.stars['11-*'] у прошедших просто лежат. */
(function(){
if(typeof OB2!=='undefined'&&OB2.off&&OB2.off('noch'))return;
const NOC=11;
Object.assign(EN,{
  zim_shul:{n:'Шуликун',hp:40,spd:50,gold:6,ab:'lob',lobK:'coal',lobC:'#ff7a2a',lobCd:6.5,lobR:105,lobS:1.4,ch:NOC,about:'Святочный бесёнок со сковородкой: кидает угольки в заставы — та ненадолго замолкает.'},
  zim_zlyd:{n:'Злыдень',hp:22,spd:74,gold:3,ab:'latch',latchT:4,sz:.8,ch:NOC,about:'Крошечный и шустрый: садится на заставу — та стреляет вдвое реже.'},
  zim_obder:{n:'Обдериха',g:'f',hp:90,spd:30,gold:10,mres:.25,ab:'carry',carryCd:6,carryL:70,ch:NOC,about:'Банная хозяйка: хватает соседа веником и переносит его вперёд по дороге.'},
  zim_zerk:{n:'Зеркальный морок',hp:56,spd:44,gold:8,pres:.3,ab:'decoy',decoy:'noch_ten',decoyCd:7,ch:NOC,about:'Вылез из гадального зеркала: двоится, и заставы тратят выстрелы на обманки.'},
  noch_ten:{n:'Отражение',hp:1,spd:44,gold:0,lives:0,art:'zim_zerk',ch:NOC,about:'Пустое отражение: с одного удара тает.'},
  zim_chuch:{n:'Соломенное чучелко',hp:120,spd:24,gold:12,lives:2,ab:'revive',sz:.9,ch:NOC,about:'Маленькая Марена из соломы: упадёт — и через пару секунд снова встаёт. Добивай, пока лежит!'},
  zim_chert:{n:'Чёрт-месяцекрад',hp:140,spd:30,gold:20,lives:2,ab:'dash',dashCd:4,dashL:100,sz:.55,ch:NOC,about:'Украл месяц с неба. Замирает — и рывком вперёд.'},
  zim_bannik:{n:'Банник',hp:170,spd:22,gold:20,lives:2,ab:'lob',lobK:'steam',lobC:'#f4f4ff',lobR:140,lobCd:5.5,lobS:2,sz:.55,ch:NOC,about:'Хозяин бани: обдаёт заставы паром часто и далеко — те замолкают.'},
  zim_marena:{n:'Марена',g:'f',hp:1500,spd:15,gold:400,lives:20,boss:1,sz:.62,ch:NOC,about:'Зима, что не хочет уходить: дышит льдом на заставы, зовёт чучелок и наводит долгую ночь.'}
});
const EN_EN={zim_shul:{n:'Shulikun Imp',about:'A Yuletide imp with a frying pan: throws hot coals at outposts — the one hit goes quiet for a moment.'},
  zim_zlyd:{n:'Little Misery',about:'Tiny and quick: sits on an outpost and halves its fire rate.'},
  zim_obder:{n:'Bathhouse Hag',about:'Mistress of the bathhouse: grabs a neighbor with her broom and carries it ahead along the road.'},
  zim_zerk:{n:'Mirror Phantom',about:'Crawled out of a fortune-telling mirror: it doubles, and outposts waste shots on the copies.'},
  noch_ten:{n:'Reflection',about:'An empty reflection: one hit and it melts.'},
  zim_chuch:{n:'Straw Effigy',about:'A little straw Marena: falls down — and gets up again a moment later. Finish it while it’s lying down!'},
  zim_chert:{n:'Moon-Thief Devil',about:'Stole the moon from the sky. Freezes — then dashes ahead.'},
  zim_bannik:{n:'The Bannik',about:'Master of the bathhouse: scalds outposts with steam often and from afar — they go quiet.'},
  zim_marena:{n:'Marena',about:'The winter that won’t leave: breathes ice on outposts, calls up effigies and brings the long night.'}};
for(const k in EN_EN)langReg(EN[k],EN_EN[k]);
Object.assign(LORE,{zim_shul:'Шуликун. Голова клином, ноги с копытцами, в руках сковородка с горячими угольками. Кидается ими, а потом дует на пальцы.',
  zim_zlyd:'Злыдень. Садится на плечи и приносит несчастья. Сбей — и он свалится.',zim_obder:'Обдериха. Кто парится после полуночи — того тащит к себе веником.',
  zim_zerk:'Зеркальный морок. Из гадального зеркала вместо суженого вылезло вот это.',noch_ten:'Отражение. Было в зеркале — вылезло на дорогу.',
  zim_chuch:'Соломенное чучелко. До Масленицы далеко — не сожжёшь.',zim_chert:'Чёрт-месяцекрад. Тот самый, что в святочную ночь сунул месяц в карман.',
  zim_bannik:'Банник. Борода мокрая, веник берёзовый. Гостей не любит, особенно после полуночи.',
  zim_marena:'Марена. Зима, чьё чучело жгут на Масленицу. Обиделась и украла новорождённое солнышко-Коляду. Победишь — наступит Новый год.'});
chLang(LORE,{zim_shul:'Shulikun. A wedge-shaped head, little hooves, and a frying pan full of hot coals. Throws them, then blows on its fingers.',
  zim_zlyd:'Little Misery. Sits on your shoulders and brings bad luck. Knock it down — and it falls off.',zim_obder:'Bathhouse Hag. Whoever steams after midnight gets dragged in by her broom.',
  zim_zerk:'Mirror Phantom. Instead of a sweetheart, this crawled out of the fortune-telling mirror.',noch_ten:'Reflection. It was in the mirror — now it’s on the road.',
  zim_chuch:'Straw Effigy. Shrovetide is far away — you won’t burn it.',zim_chert:'Moon-Thief Devil. The very one who pocketed the moon on a Yuletide night.',
  zim_bannik:'The Bannik. Soggy beard, birch broom. Hates guests, especially after midnight.',
  zim_marena:'Marena. Winter, whose effigy is burned at Shrovetide. She took offense and stole Kolyada, the newborn sun. Beat her — and the New Year comes.'});
BOSS_SAY.zim_marena=['Солнце моё — и ночь моя!','Мёрзни, воевода!','Весны не будет!','Чучелки, вставайте!'];
BOSS_TIP.zim_marena='Ледяное дыхание морозит заставы рядом с ней — ставь их вдоль всей дороги. В долгую ночь нечисть бежит быстрее: пушку и колдуна — ближе к воротам.';
chLang(BOSS_SAY,{zim_marena:['The sun is mine — and so is the night!','Freeze, commander!','There will be no spring!','Effigies, rise!']});
chLang(BOSS_TIP,{zim_marena:'Her icy breath freezes outposts near her — spread them along the whole road. In the long night monsters run faster: keep the cannon and sorcerer near the gate.'});
Object.assign(WAVE_NAMES,{zim_shul:['Шуликуны колядуют','Угольки со сковородки'],zim_zlyd:['Злыдни','Несчастья гурьбой'],zim_obder:['Банный пар','Обдерихи с вениками'],
  zim_zerk:['Гадание у зеркала','Суженые-ряженые'],zim_chuch:['Соломенный хоровод','Чучелки встают']});
chLang(WAVE_NAMES,{zim_shul:['Imps go caroling','Coals from the pan'],zim_zlyd:['Little miseries','Bad luck in a crowd'],zim_obder:['Bathhouse steam','Hags with brooms'],
  zim_zerk:['Mirror fortune-telling','Masked sweethearts'],zim_chuch:['A straw round dance','The effigies rise']});
Object.assign(LEAD.at,{[NOC+'-2']:'zim_chert',[NOC+'-3']:'zim_bannik',[NOC+'-4']:'zim_chert',[NOC+'-6']:'zim_bannik'});
Object.assign(LEAD.n,{zim_chert:'Чёрт-месяцекрад',zim_bannik:'Банник'});chLang(LEAD.n,{zim_chert:'Moon-Thief Devil',zim_bannik:'The Bannik'});
Object.assign(LEAD.ab,{zim_chert:'Прыгает рывками к воротам — держи заставы и в конце дороги!',zim_bannik:'Обдаёт заставы паром часто и далеко — держи их порознь.'});
chLang(LEAD.ab,{zim_chert:'Dashes toward the gate — keep outposts near the end of the road too!',zim_bannik:'Scalds outposts with steam often and from afar — keep them apart.'});
Object.assign(LEAD.sayT,{zim_chert:['Хи-хи! Месяц мой!','Темно — и славно!','Где месяц? Не видал!'],zim_bannik:['Кто в мою баню?!','Поддам пару!','Веничком отхожу!']});
chLang(LEAD.sayT,{zim_chert:['Hee-hee! The moon is mine!','Dark is good!','Moon? Never saw it!'],zim_bannik:['Who’s in my bathhouse?!','More steam!','A taste of my broom!']});

// угольки и пар — свои виды броска (общий chLob в ch-engine): уголёк — светящаяся точка по дуге, пар — облачко
CH_LOBSAY.coal=()=>Lg(['С пылу с жару!','Горячо!','Лови уголёк!'],['Fresh off the pan!','Hot!','Catch a coal!']);
CH_LOBSAY.steam=()=>Lg(['С лёгким паром!','Поддай-ка!','Пш-ш-ш!'],['Enjoy your steam!','More heat!','Psssh!']);
{const fx0=CHX.fx.chpick;CHX.fx.chpick=(c,f,q)=>{if(f.kind!=='coal'&&f.kind!=='steam')return fx0(c,f,q);
  const x=lerp(f.x,f.x1,q),y=lerp(f.y,f.y1,q)-Math.sin(q*Math.PI)*(f.kind==='coal'?34:20);
  if(f.kind==='coal')glowDot(c,x,y,7,f.col,.9);
  else{c.fillStyle=rgba('#ffffff',.75);for(const [dx,dy,r] of[[-5,0,6],[4,-2,7],[0,4,5]]){c.beginPath();c.arc(x+dx,y+dy,r*(.6+q*.6),0,TAU);c.fill();}}
  c.strokeStyle=rgba('#ff5a3a',.5*(1-q)+.2);c.lineWidth=1.6;c.beginPath();c.arc(f.x1,f.y1+18,16+4*(1-q),0,TAU);c.stroke();worldT();};}

// повадка «встаёт»: чучелко упало — 2,5 с лежит соломой (видно), потом встаёт с половиной здоровья (один раз; второй раз — насовсем)
CHX.killT.zim_chuch=e=>{if(e.rv||!G||G.over)return;const b=EN[e.type],hpm=e.max/b.hp/(G.hpK||1)/(e.lead?LEAD.hp:1)*.5,pi=e.pi,d=e.d,x=e.x,y=e.y;
  G.fx.push({k:'noch_straw',x,y,t:0,dur:2.5});
  later(2.5,()=>{if(!G||G.over)return;const o=spawnEnemy('zim_chuch',pi,d,hpm);o.rv=1;o.gold=Math.round(o.gold*.5);poof(o.x,o.y);if(Math.random()<.5)say(o,Lg('Не сожжёшь!','You won’t burn me!'),1.2);});};
CHX.fx.noch_straw=(c,f,q)=>{const a=q>.8?(1-q)*5:1;c.globalAlpha=a;c.strokeStyle='#c8a040';c.lineWidth=2;
  for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(f.x+i*3,f.y+6);c.lineTo(f.x+i*4+(i%2?3:-3),f.y-2);c.stroke();}
  c.fillStyle='#ecd27a';c.beginPath();c.ellipse(f.x,f.y+5,13,4,0,0,TAU);c.fill();
  if(q>.6){const p=.5+.5*Math.sin(G.t*20);c.strokeStyle=rgba('#ff5a3a',.4+.4*p);c.lineWidth=1.6;c.beginPath();c.arc(f.x,f.y,14,0,TAU);c.stroke();}
  c.globalAlpha=1;worldT();};
CHX.tip.revive=()=>Lg('упало — встаёт снова через пару секунд: держи заставы и дальше по дороге','falls down — and gets up again a moment later: keep outposts further down the road');
// тьма «Долгой ночи» поверх поля
CHX.fx.noch_dark=(c,f,q)=>{const a=.32*Math.min(1,q*6,(1-q)*6);c.fillStyle=rgba('#0a1030',a);c.fillRect(-2000,-2000,6000,6000);worldT();};

// Марена
CHX.boss.zim_marena=(e,dt)=>{const k=e.yar?CH_YAR.cd:1;
  // ледяное дыхание: кольцо 0,9 с, потом заставы рядом стреляют вдвое реже 4 с
  if(e.br){e.br-=dt;if(e.br<=0){e.br=0;for(const t of towersNear(e.x,e.y,110))t.frostT=Math.max(t.frostT||0,4);SND.whistle();G.fx.push({k:'wave',x:e.x,y:e.y,r:110,t:0,dur:.6,col:'#bfe6ff'});}}
  else if(e.abT<=0){e.abT=8*k;e.br=.9;G.fx.push({k:'ring',x:e.x,y:e.y,r:110,t:0,dur:.9,col:'#ff5a3a'});say(e,Lg('Мёрзни!','Freeze!'),1.2);}
  if(e.ab2<=0){e.ab2=11*k;for(let i=0;i<(e.yar?3:2);i++)spawnEnemy('zim_chuch',e.pi,Math.max(0,e.d-12-i*14),minionHp()*.6);say(e,Lg('Чучелки, вставайте!','Effigies, rise!'),1.4);}
  // долгая ночь: раз в 16 с — 5 с темно, вся нечисть ×1,25 быстрее (0,8 с — предупреждение надписью)
  e.ntT=(e.ntT==null?7:e.ntT)-dt;
  if(e.ntW>0){e.ntW-=dt;if(e.ntW<=0){G.fx.push({k:'noch_dark',x:0,y:0,t:0,dur:5});e.ntOn=5;}}
  else if(e.ntT<=0){e.ntT=16*k;e.ntW=.8;G.banner={title:Lg('Долгая ночь!','The long night!'),sub:Lg('В темноте нечисть смелеет — бегут быстрее','In the dark the monsters grow bold — they run faster'),t:0,wave:1};SND.whistle();}
  if(e.ntOn>0){e.ntOn-=dt;for(const o of G.en)if(!o.dead&&o!==e){o.hasteT=Math.max(o.hasteT||0,.25);o.hasteK=Math.max(o.hasteK||1,1.25);}}
  if(!e.ph&&e.hp<e.max*.5){e.ph=1;e.spd*=1.15;e.ab2=0;say(e,Lg('Не отдам солнце! Не отдам!','I won’t give back the sun! I won’t!'),2);G.shake=10;
    for(let i=0;i<4;i++)spawnEnemy('zim_zlyd',e.pi,Math.max(0,e.d-10-i*10),minionHp());}};

// трудность Обычного (поверх hp и LEVEL_FIX): подбор ботом bk-ob-tools/cal12.py — «ветеран» (все ★ 11 земель + вся деревня, сила ≈615) почти не проходит,
// с «Мастерством» ≈3 ступени на всё (сила ≈775) — 60–85 %, с 6+ (≈930) — почти всё. Живые прошедшие 77 уровней — сила 830–1250 (STAT prg 13–24.10).
Object.assign(DIF_NRM,{'11-0':1.75,'11-1':2.3,'11-2':2.2,'11-3':2.3,'11-4':2.4,'11-5':2.3,'11-6':2.3});
chAdd({id:NOC,after:7,hp:11,coins:820,lmark:['zim_d_izba','zim_d_zvezda','zim_d_sugrob'],book:['noch_ten','zim_chert','zim_bannik'],
  ach:{n:'Солнце вернулось',en:'The Sun Is Back',bossEn:'Marena'},
  banner:{id:'noch',n:'Знамя Долгой ночи',cost:3200,c1:'#2a3a8a',c2:'#ffd84a',em:[9,.6],en:'Banner of the Long Night'},
  fix:{'11-0':3.3,'11-1':2,'11-2':2,'11-3':1.9,'11-4':1.7,'11-5':1.7,'11-6':1.4},
  ch:{name:'Долгая ночь',g:'f',sub:'Марена украла солнце-Коляду',boss:'zim_marena',en:['zim_shul','zim_zlyd','zim_obder','zim_zerk','zim_chuch'],
    ground:{base:'#c8d4ea',hi:'#dce6f6',lo:'#b4c2dc',grass:'#9aaccc',flow:['#ffffff','#ffd84a','#bfe6ff']},
    road:{edge:'#7a88b0',fill:'#e8eef8',hi:'#ffffff',deco:'stones'},decor:['d_snowpine','zim_d_sugrob','d_snowpine','zim_d_izba','d_snowpine','zim_d_zvezda','d_stone'],mc:'#6a7ad8',bright:1,lair:1,bossK:1.8,
    trf:{n:'Звёздочка-снежинка',en:'Starflake',sh:'flake'},
    pw:[760,780,780,790,800,800,820],
    levels:['Колядная дорога','Святочные дворы','Гадальная баня','Зеркальная горница','Соломенный хоровод','Ледяной терем Марены','Клетка солнца-Коляды'],
    intro:['Долгая ночь! Марена украла солнце-Коляду, и святочная нечисть гуляет по Руси. Шуликуны кидают угольки в заставы — не ставь их кучей.',
      'Злыдни садятся на заставы — те стреляют вдвое реже. Сбивай мелочь, пока не добежала. А вот и Чёрт-месяцекрад — прыгает рывками!',
      'Гадальная баня: Обдериха хватает соседей веником и переносит вперёд, а Банник обдаёт заставы паром издалека.',
      'Зеркальный морок двоится — заставы тратят выстрелы на отражения. Колдун и пушка бьют сразу по нескольким!',
      'Соломенные чучелки падают — и снова встают. Держи заставы и дальше по дороге, добивай лежачих.',
      'Марена! Ледяным дыханием морозит заставы рядом, зовёт чучелок, а в долгую ночь нечисть бежит быстрее. Победишь — солнце вернётся!',
      'Клетка солнца-Коляды — по желанию. Марена тут ярая: дышит льдом чаще, чучелок больше.'],
    // чучелки — с 3-го уровня, в каждой 4-й волне
    waveX(waves,li){if(li<2)return;waves.forEach((w,i)=>{if(i%4===3)w.g.push({t:'zim_chuch',n:1+Math.floor(li/3),iv:1.6,delay:3});});}},
  en:{name:'The Long Night',sub:'Marena has stolen Kolyada, the young sun',
    levels:['The Carol Road','Yuletide Yards','The Fortune-Telling Bathhouse','The Mirror Chamber','The Straw Round Dance',"Marena's Ice Tower",'The Cage of Kolyada the Sun'],
    intro:['The Long Night! Marena has stolen Kolyada the sun, and Yuletide monsters roam the land. Shulikun imps throw coals at outposts — don’t bunch them up.',
      'Little Miseries sit on outposts and halve their fire rate. Shoot the small fry before it arrives. And here is the Moon-Thief Devil — he dashes ahead!',
      'The fortune-telling bathhouse: the Bathhouse Hag grabs neighbors with her broom and carries them ahead, and the Bannik scalds outposts with steam from afar.',
      'The Mirror Phantom doubles — outposts waste shots on reflections. The sorcerer and the cannon hit several at once!',
      'Straw effigies fall — and rise again. Keep outposts further down the road and finish them while they lie.',
      'Marena! Her icy breath freezes nearby outposts, she calls up effigies, and in the long night monsters run faster. Win — and the sun comes back!',
      'The Cage of Kolyada the Sun — optional. Marena is raging here: icy breath more often, more effigies.']}});
// ⚔/🔥 (место 12 в CH_ORDER): bk-ob-tools/k12.py — ⚔ ≈75 % при мастерстве 8 (сила ≈1040), 🔥 ≈50 % при мастерстве 12 (≈1250)
DIF_MUL.s[chPos(NOC)]=.97;DIF_MUL.h[chPos(NOC)]=1;
// загрузилась (по требованию из index.html, bk:NOCH): перерисовать карту; прошедшим Лихо и ещё не ходившим сюда — один раз тост и выбор земли на карте
window.nochReady=function(){try{const st=S.stars||{};
  if(st['7-5']&&!chAny(NOC)){let seen=0;try{seen=+localStorage.getItem('oborona-noch')||0;}catch(e){}
    if(!seen){try{localStorage.setItem('oborona-noch','1');}catch(e){}mapSel=NOC;if(typeof STAT!=='undefined'&&STAT.ev)STAT.ev('noch',{a:'show'});
      setTimeout(()=>toast(Lg('❄ Новая земля — «Долгая ночь»! Марена украла солнце-Коляду. Ищи на карте выше Тридевятого царства.','❄ A new land — “The Long Night”! Marena has stolen Kolyada the sun. Find it on the map above the Thrice-Nine Kingdom.')),600);}}
  if(!G&&curTab==='Map'&&typeof renderMap==='function')renderMap();}catch(e){console.warn('nochReady',e);}};
})();
