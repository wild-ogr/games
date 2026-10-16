/* bb2 LAND — 12-я земля «Долгая ночь» (тема zima, слоты 33/34/35, tier 9 / 9.33 / 9.67). Набор догрузки 'land' (заглушка js/bb2-land.js).
   Марена украла молодое солнце-Коляду: святочная ночь не кончается, по Руси гуляет святочная нечисть. Открывается после «Логова Лиха» (слот 32).
   Общие файлы не правим: сами дописываем кампанию (TH_IDS, CAMP, CAMP_S, THEMES_ON), точки карты (MAP_LAND — змейка на 12 земель),
   Обычную по tier (DIF_NT), силу глав (BAL через balD), «Сила ≥» (BAL_PWT), трофей tr_zima (после меты) — и регистрируем тему THEME_ADD.
   Формат темы — ENGINE-API.md §3/§10. Старый синтаксис: без ?. ?? .finally */
(function(){
if(typeof THEME_ADD!=='function'||typeof CAMP==='undefined'||TH_IDS.indexOf('zima')>=0)return;
const ID='zima',SL=[33,34,35],TIER=[9,9.33,9.67];
const lo=(ru,en)=>({ru,en});

/* ---- кампания: 12-я земля в конец (номера слотов — навсегда, ключи сохранения) ---- */
TH_IDS.push(ID);if(THEMES_ON.indexOf(ID)<0)THEMES_ON.push(ID);
SL.forEach((s,i)=>{const r={slot:s,th:ID,n:i+1,tier:TIER[i]};CAMP.push(r);CAMP_S[s]=r;});

/* ---- карта: змейка на 12 земель (была 11: les .885 … lih .085) — шаг чуть меньше, Долгая ночь — сверху справа ---- */
if(typeof MAP_LAND==='object'&&MAP_LAND){const ids=TH_IDS.slice(),n=ids.length,y0=.885,y1=.072;
  ids.forEach((id,i)=>{MAP_LAND[id]=[i%2?.73:.27,+(y0-(y0-y1)*i/(n-1)).toFixed(3)];});}

/* ---- Обычная по tier: продолжение таблицы PACE после 8.67 (потолок 0,9 Сложной) ---- */
if(DIF_NT&&typeof DIF_NT==='object'){DIF_NT['9']={hp:.9,dmg:.861,eliteHp:.9,bossHp:.95,bossDmg:.95};DIF_NT['9.33']={hp:.9,dmg:.861,eliteHp:.9,bossHp:.95,bossDmg:.95};DIF_NT['9.67']={hp:.9,dmg:.861,eliteHp:.9,bossHp:.95,bossDmg:.95};}

/* ---- помощники событий ---- */
function room(G){return (G.warn||[]).filter(z=>!z.bk).length<17;}
function ring(G,n,ids,k){const H=G.hero,R=VIEW.R;for(let i=0;i<n;i++){const a=i/n*TAU,d=R*rand(k||.7,(k||.7)+.18);mkEnemy(ids[i%ids.length],H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);}}
/* звездопад: n звёзд по очереди (каждая 3-я — в богатыря), золотой круг ≥1 с → удар */
function stars(n){for(let i=0;i<n;i++)later(i*.5,()=>{if(!G||G.over||G.win||!room(G))return;const H=G.hero,aim=i%3===0,x=H.x+(aim?rand(-25,25):rand(-240,240)),y=H.y+(aim?rand(-25,25):rand(-200,200));
  (G.warn||(G.warn=[])).push({k:'lob',x,y,r:48,t:1.05,t0:1.05,life:0,c:'#ffd84a',fn(z){burst(z.x,z.y,'#fff6c0',qLow()?6:12,180);SND.boom();
    if(!CALM())G.fx.push({k:'boom',x:z.x,y:z.y,t:0,dur:.35,r:z.r*1.2});const Hh=G.hero;if((Hh.x-z.x)**2+(Hh.y-z.y)**2<(z.r+8)**2)hurtHero(9*G.ch.dmg*(G.emD||1),'zim_zvezd');}});});}

/* ---- свой приём Марены: «Долгая ночь» — тьма ~11 с ---- */
const noch={pass:1,start(b){G.fogT=12.5;G.fogK='night';say(b,L('Ночь будет вечной!','The night will last forever!'),1.6);},step(){return true;}};

THEME_ADD({id:ID,
 th:{name:'Долгая ночь',sub:'Марена украла солнце-Коляду',en:{name:'The Long Night',sub:'Marena has stolen Kolyada, the young sun'},
  ground:{base:'#c8d4ea',hi:'#dce6f6',lo:'#b4c2dc',grass:'#9aaccc',flow:['#ffffff','#ffd84a','#bfe6ff']},
  decor:['zim_d_izba','d_snowpine','zim_d_zvezda','zim_d_sugrob','d_snowpine'],tint:'rgba(40,50,120,.14)',dark:0,
  mc:'#6a7ad8',map:[.73,.072],ev:'zim_zvezd'},
 ch:[
  {slot:33,n:1,name:'Колядная дорога',sub:'Без колядок и нечисть гуляет',hook:'Колядовщиков разогнали — по дворам ходят шуликуны',
   en:{name:'The Carol Road',sub:'No carols — and the imps run free',hook:'The carolers were chased off — now imps go door to door'},
   w:[{id:'zim_shul',t:0,v:1},{id:'wolf_i',t:0,v:.5,e:120,g:1},{id:'zim_zlyd',t:25,v:.8},{id:'snow',t:70,v:.4,g:1},{id:'zim_zerk',t:120,v:.5},{id:'shatun',t:180,v:.3,g:1}],
   el:[{id:'zim_shul',fx:['fast']},{id:'zim_zlyd',fx:['tough']},{id:'zim_zerk',fx:['frost']}],
   ev:['zim_zvezd',{k:'zim_kolyad',t:150}],boss:'zim_chert'},
  {slot:34,n:2,name:'Гадальная баня',sub:'Набег',hook:'В святки девицы гадают в бане — а банник гостей не любит',
   en:{name:'The Fortune-Telling Bathhouse',sub:'The Raid',hook:'At Yuletide girls tell fortunes in the bathhouse — and the Bannik hates guests'},
   w:[{id:'zim_shul',t:0,v:1},{id:'zim_zlyd',t:0,v:.6},{id:'zim_obder',t:30,v:.8},{id:'zim_zerk',t:60,v:.6},{id:'kik',t:90,v:.4,g:1},{id:'wolf_i',t:150,v:.4,g:1}],
   el:[{id:'zim_obder',fx:['tough']},{id:'zim_zerk',fx:['frost']},{id:'zim_shul',fx:['bomb']}],
   ev:['zim_par',{k:'zim_zvezd',t:110}],boss:'zim_bannik'},
  {slot:35,n:3,name:'Ледяной терем Марены',sub:'Логово',hook:'Марена заперла солнце-Коляду в ледяную клетку. Пока не победишь — ночь не кончится',
   en:{name:"Marena's Ice Tower",sub:'The Lair',hook:'Marena has locked Kolyada the sun in an ice cage. Until you win, the night will not end'},
   w:[{id:'zim_shul',t:0,v:1},{id:'zim_zlyd',t:0,v:.6},{id:'zim_chuch',t:20,v:.8},{id:'zim_obder',t:60,v:.5},{id:'zim_zerk',t:90,v:.5},{id:'wolf_i',t:150,v:.3,g:1}],
   el:[{id:'zim_chuch',fx:['tough']},{id:'zim_obder',fx:['shield']},{id:'zim_zerk',fx:['frost']},{id:'zim_shul',fx:['fast']}],
   ev:['zim_noch',{k:'zim_zvezd',t:100}],mb:{id:'zim_chert',t:150},boss:'zim_marena',nt:1,dark:1,
   ground:{base:'#9aa6c8',hi:'#aeb8d8',lo:'#8a96ba',grass:'#7a86ac',flow:['#ffffff','#bfe6ff']},tint:'rgba(20,30,90,.2)'}],
 en:{
  zim_shul:{n:'Шуликун',r:11,hp:32,spd:70,dmg:8,xp:2,col:'#5a3a2a',beh:'lob',bp:{cd:3.6,r:38,pud:2,burn:.25,c:'#ff7a2a'},en:{n:'Shulikun Imp'},
   lore:lo('Святочный бесёнок: голова клином, ноги с копытцами, в руках сковородка с горячими угольками. Кидается ими, а потом дует на пальцы.','A Yuletide imp: a wedge-shaped head, little hooves, and a frying pan full of hot coals. Throws them, then blows on his fingers.'),
   ph:{ru:['Горячо — сырым не ешь!','С пылу с жару!'],en:['Hot! Don’t eat it raw!','Fresh off the pan!']}},
  zim_zlyd:{n:'Злыдень',r:8,hp:16,spd:92,dmg:4,xp:1,col:'#7a8070',beh:'latch',bp:{dps:.4,off:1.1,max:3},en:{n:'Little Misery'},
   lore:lo('Крошечный вредитель. Садится на плечи и приносит несчастья. Беги — и он свалится.','A tiny pest. Sits on your shoulders and brings bad luck. Run — and it falls off.'),
   ph:{ru:['Не повезло тебе!','Сижу-сижу!'],en:['Bad luck, friend!','Comfy up here!']}},
  zim_obder:{n:'Обдериха',g:'f',r:13,hp:52,spd:48,dmg:10,xp:2,col:'#c8c0b0',beh:'pull',bp:{cd:5.5,rng:280},en:{n:'Bathhouse Hag'},
   lore:lo('Банная хозяйка. Кто парится после полуночи — того тащит к себе веником. Рви в сторону от линии.','Mistress of the bathhouse. Whoever steams after midnight gets dragged in by her broom. Break sideways off the line.'),
   ph:{ru:['С лёгким паром!','Поддай-ка!'],en:['Enjoy your steam!','More heat!']}},
  zim_zerk:{n:'Зеркальный морок',r:11,hp:30,spd:56,dmg:10,xp:2,col:'#9ab4d8',beh:'decoy',bp:{n:2,cd:9},en:{n:'Mirror Phantom'},
   lore:lo('Из гадального зеркала вместо суженого вылезло вот это. Двоится — бей того, кто бьёт.','Instead of a sweetheart, this crawled out of the fortune-telling mirror. It doubles — hit the one that hits back.'),
   ph:{ru:['Суженый-ряженый!','Это не я!'],en:['Your true love is here!','That’s not me!']}},
  zim_chuch:{n:'Соломенное чучелко',r:13,hp:40,spd:44,dmg:9,xp:2,col:'#ecd27a',beh:'revive',bp:{t:3,hp:.5},en:{n:'Straw Effigy'},
   lore:lo('Маленькая Марена из соломы. Упадёт — и снова встаёт. Добивай, пока лежит.','A little straw Marena. Falls down — and gets up again. Finish it while it’s lying down.'),
   ph:{ru:['Не сожжёшь!','До Масленицы далеко!'],en:['You won’t burn me!','Shrovetide is far away!']}}},
 boss:{
  zim_chert:{n:'Чёрт-месяцекрад',r:32,hp:22000,spd:46,dmg:28,col:'#2a2228',mini:.1,
   title:lo('Украл месяц с неба','Stole the moon from the sky'),en:{n:'The Moon-Thief Devil'},
   ph:{ru:['Хи-хи! Месяц мой — и ночь моя!','Где месяц? Не видал!','Темно — и славно!','Пятачком чую богатыря!'],
       en:['Hee-hee! The moon is mine — and so is the night!','Moon? Never saw it!','Dark is good!','My snout smells a hero!']},
   lore:lo('Тот самый, что в святочную ночь сунул месяц в карман. Без месяца темно — нечисти раздолье. Прыгает рывками и прячется в темноте.','The very one who pocketed the moon on a Yuletide night. Without the moon it’s dark — a feast for monsters. Dashes in bursts and hides in the dark.'),
   kit:{a:[{k:'dash',cd:6,sp:540},{k:'fan',cd:5,n:5,col:'#ffe680'},{k:'summon',cd:12,id:'zim_shul',n:4,say:lo('Шуликуны, ко мне!','Imps, to me!')}],
        ph:[{hp:.5,add:[{k:'invis',cd:14,dur:5},{k:'ring',cd:8,n:12,col:'#ffe680'}],say:lo('Спрячу месяц поглубже — ищи меня в темноте!','I’ll hide the moon deeper — find me in the dark!')}]}},
  zim_bannik:{n:'Банник',r:34,hp:26000,spd:42,dmg:32,col:'#d86a4a',
   title:lo('Хозяин бани, гроза гадальщиц','Master of the bathhouse'),en:{n:'The Bannik'},
   ph:{ru:['Кто в мою баню без спросу?!','Поддам пару!','Веничком отхожу!','Третий пар — мой!'],
       en:['Who barged into my bathhouse?!','More steam!','A taste of my broom!','The third steam is mine!']},
   lore:lo('Старый банный дед: борода мокрая, веник берёзовый. Гостей не любит, особенно после полуночи. Паром жжёт, камнями кидается.','The old bathhouse spirit: soggy beard, birch broom. Hates guests, especially after midnight. Scalds with steam and throws hot stones.'),
   kit:{a:[{k:'zones',cd:6,n:3,r:62,col:'#f4f4ff'},{k:'fan',cd:5,n:6,col:'#ff8a4a'},{k:'trail',cd:12,dur:5,dmg:.2,col:'#ffb08a'},{k:'summon',cd:13,id:'zim_obder',n:3,say:lo('Обдериха, гостей встречай!','Hag, greet the guests!')}],
        ph:[{hp:.5,add:[{k:'pull',cd:9,dur:2.4}],say:lo('А ну, в парилку!','Into the steam room with you!')}]}},
  zim_marena:{n:'Марена',g:'f',r:38,hp:30000,spd:40,dmg:34,col:'#e8f0ff',
   title:lo('Зима, что не хочет уходить','The winter that won’t leave'),en:{n:'Marena'},
   ph:{ru:['Солнце моё — и ночь моя. Навсегда!','Мёрзни, богатырь!','Весны не будет!','Чучело моё жечь вздумали? Не дождётесь!','Зеркала, покажите ему зиму!'],
       en:['The sun is mine — and so is the night. Forever!','Freeze, hero!','There will be no spring!','Burn my effigy, will you? Not this year!','Mirrors, show him winter!']},
   lore:lo('Зима-Морена — та самая, чьё чучело жгут на Масленицу. Обиделась и украла новорождённое солнышко-Коляду. Победишь — наступит Новый год.','Winter-Marena — the very one whose effigy is burned at Shrovetide. She took offense and stole Kolyada, the newborn sun. Beat her and the New Year will come.'),
   kit:{a:[{k:'ring',cd:7,n:14,ice:1,col:'#bfe6ff'},{k:'zones',cd:6,n:3,r:60,slow:2,col:'#9ad8ff'},{k:'wall',cd:11,n:3,col:'#bfe6ff'},{k:'summon',cd:14,id:'zim_chuch',n:4,say:lo('Чучелки, вставайте!','Effigies, rise!')}],
        ph:[{hp:.66,add:[{k:'clone',cd:15,n:2,dur:9}],say:lo('Зеркала, покажите ему зиму!','Mirrors, show him winter!')},
            {hp:.4,add:[{k:'zim_t',cd:40}],sum:[{id:'zim_zlyd',n:4},{id:'zim_chuch',n:2}],say:lo('Ночь будет вечной!','The night will last forever!')},
            {hp:.2,rm:'wall',add:[{k:'rain',cd:8,n:9,col:'#bfe6ff'}],say:lo('Не отдам солнце! Не отдам!','I won’t give back the sun! I won’t!')}]}}},
 bk:{zim_t:noch},
 evs:{
  zim_zvezd:{t:lo('Звездопад!','Starfall!'),dur:0,start(G){stars(10);banner(L('Звездопад!','Starfall!'),L('Уходи из золотых кругов','Leave the golden circles'),3);}},
  zim_kolyad:{dur:0,start(G){ring(G,14,['zim_shul','zim_zlyd']);banner(L('Колядки!','Carolers!'),L('Нечисть пришла колядовать — с угольками','The imps came caroling — with hot coals'),4);}},
  zim_par:{dur:9,start(G){G.fogT=10;G.fogK='par';ring(G,12,['zim_obder','zim_zlyd','zim_shul']);banner(L('С лёгким паром!','Enjoy your steam!'),L('Пар из бани — обдерихи лезут','Steam pours out — the hags crawl in'),4);},
   step(G){if(G.fogT<8)G.fogT=8;}},
  zim_noch:{dur:7,start(G){G.fogT=12.5;G.fogK='night';ring(G,20,['zim_chuch','zim_zerk','zim_zlyd'],.6);
    banner(L('Долгая ночь','The Long Night'),L('Марена погасила звёзды — чучелки идут из мрака','Marena put out the stars — effigies walk out of the dark'),4);},
   step(G){if(G.fogT<12.5)G.fogT=12.5;}}}});

/* ---- сила глав (BAL, как bal.js: [Обычная, Сложная, Адская]); стартовые — от «Перепутья»/«Логова Лиха», подбор ботом — logs/LAND.md ---- */
if(typeof balD==='function'){const T={33:{K:[4.6,1.15,1.1],D:[.6,.9,.85],H:[1,1.02,.95],X:[1.15,.95,.9]},34:{K:[5.6,1.2,1.15],D:[.38,.85,.8],H:[1,1.04,.97],X:[1,.96,.9]},35:{K:[6.3,1.3,1.2],D:[.33,.5,.46],H:[1,1.05,.98],X:[1,.97,.9]}},v=a=>({n:a[0],s:a[1],h:a[2]});
  for(const s in T){const r=T[s];balD(+s,'bossHp',v(r.K));balD(+s,'bossDmg',v(r.D));balD(+s,'hpK',v(r.H));balD(+s,'dmgK',v(r.X));(BAL[s]||(BAL[s]={})).nt={hp:.9,dmg:.8,eliteHp:.9};}}
if(typeof BAL_PWT==='object'&&BAL_PWT){const P={n:[3300,3350,3400],s:[5100,5200,5300],h:[6250,6350,6450]};for(const k in P)if(BAL_PWT[k])SL.forEach((s,i)=>{BAL_PWT[k][s]=P[k][i];});}
/* мини-босс: Чёрт в Логове — доля здоровья босса Логова (как BAL_MINI у остальных) */
if(BOSS.zim_chert)Object.defineProperty(BOSS.zim_chert,'mini',{enumerable:true,configurable:true,get(){const d=typeof G!=='undefined'&&G&&G.dif;return d==='n'?.075:.117;}});
/* золото земли — договор ECO (land.goldMul, сейчас 1) */
const gm=BB2.n('land.goldMul',1);if(gm>0&&gm!==1)SL.forEach(s=>{if(CH[s])CH[s].gold=+(CH[s].gold*gm).toFixed(3);});

/* ---- трофей земли: «Звёздочка-снежинка» (мета «трофеи»; выпадает в главах земли как у остальных) ---- */
BB2.after('meta',function(){try{if(typeof TRO_DEF!=='object'||TRO_DEF.tr_zima)return;
  art('tr_zima',40,g=>{glow(g,0,0,18,'rgba(190,230,255,.5)','#ffffff');for(let i=0;i<3;i++){const a=i*Math.PI/3;ln(g,[-Math.cos(a)*15,-Math.sin(a)*15,Math.cos(a)*15,Math.sin(a)*15],'#9ad8ff',3.4);
    for(const q of[-1,1])ln(g,[Math.cos(a)*q*9,Math.sin(a)*q*9,Math.cos(a)*q*9+Math.cos(a+q*.9)*5*q,Math.sin(a)*q*9+Math.sin(a+q*.9)*5*q],'#9ad8ff',2.2);}
    ell(g,0,0,4,4,'#ffd84a',{hl:.7,lw:.7});});
  const d=TRO_DEF.tr_zima={th:ID,n:'Звёздочка-снежинка',en:'Starflake'};d.art=d.ic='tr_zima';Object.defineProperty(d,'name',{get(){return L(d.n,d.en);}});
  if(TRO_IDS.indexOf('tr_zima')<0)TRO_IDS.push('tr_zima');}catch(e){console.warn('bb2 land tro',e);}});

/* победа в Логове — солнце вернулось (строка в итогах) */
BB2.hook('modal',function(k,m){try{if(k==='result'&&G&&G.chi===35&&BB2.win&&!G.endless)BB2.put(m,'top','<div class="tutbox"><b>'+L('☀ Солнце-Коляда вернулось! С Новым годом, богатырь!','☀ Kolyada the sun is back! Happy New Year, hero!')+'</b></div>','land');}catch(e){}});

/* ---- после догрузки (зовёт заглушка): карта на первой главе земли, один раз окно «Новая земля!» прошедшим всё ---- */
(function(){var B=BB2;
  function done(again){if(!B.landOk||G)return;if(again){if(!B.s('land').s&&S.done[32]&&!S.done[33])setTimeout(function(){hello(0);},1800);return;}try{if(S.done[32]&&!S.done[33]&&(mapSel===32||!B.s('land').s))mapSel=33;openTab(curTab);}catch(e){}setTimeout(function(){hello(0);},1800);}
  function hello(n){var s=B.s('land');if(s.s||!S.done[32]||S.done[33]||n>40)return;
    if(G||document.getElementById('modal').classList.contains('on')){setTimeout(function(){hello(n+1);},1500);return;}
    s.s=1;save();B.stat('land',{a:'show'});
    showModal('<h3>'+L('❄ Новая земля!','❄ A new land!')+'</h3><p class="sub">'+L('«Долгая ночь»: Марена украла солнце-Коляду, и святочная нечисть гуляет по Руси. Три новые главы — дальше «Логова Лиха».','“The Long Night”: Marena has stolen Kolyada the sun, and Yuletide monsters roam the land. Three new chapters beyond Likho’s Lair.')+
      '</p><p style="text-align:center"><img src="'+ic('zim_marena',112)+'" width="112" height="112"></p><div class="btns"><button class="btn big" id="lnGo">'+L('В поход','March out')+'</button><button class="btn ghost" id="lnNo">'+L('Потом','Later')+'</button></div>','land');
    on('lnGo',function(){B.stat('land',{a:'go'});hideModal();mapSel=33;openTab('Map');});on('lnNo',function(){B.stat('land',{a:'later'});hideModal();});}
  B.landHi=done;})();

if(typeof BB2==='object')BB2.landOk=!!(TH[ID]&&TH[ID].reg);
})();
