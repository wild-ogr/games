'use strict';
/* ================= OB:CH — тема «Лукоморье» (глава 9 в сохранении, 8-я по порядку — после Морского царства) =================
   Рисунки — js/ch-luk-art.js (из «Богатыря»). Повадки: рывок (ступа), след-подгонялка (невиданный зверь), кидается ракушками (русалка),
   строй в латах (морские витязи), носильщик (переносит соседей вперёд), морок (обманки). Событие «Там чудеса» — гости из пройденных земель.
   Вожаки: Кот учёный (рассказывает сказку — из неё лезут гости), Морок, Колдун-похититель. Босс — Черномор: борода-коса глушит заставы рядом,
   шапка-невидимка (видит только колдун), зовёт карл; на 50% борода отрезана — быстрее, без косы. Логово — Черномор ярый. */
(function(){
const LUK=9;
Object.assign(EN,{
  luk_kot:{n:'Цепной кот',hp:34,spd:68,gold:4,ch:LUK,about:'Ходит по цепи кругом… а сорвался — летит к воротам. Шустрый!'},
  luk_zver:{n:'Невиданный зверь',hp:60,spd:40,gold:8,ab:'haste',ch:LUK,about:'По его следам нечисть бежит быстрее. Бей его первым!'},
  luk_stupa:{n:'Ступа-самоходка',hp:54,spd:42,gold:8,ab:'dash',dashCd:4.5,dashL:80,ch:LUK,about:'Замирает, целится — и делает рывок вперёд.'},
  luk_rus:{n:'Русалка на ветвях',hp:46,spd:36,gold:8,mres:.2,ab:'lob',lobK:'shell',lobC:'#3ac8a0',lobCd:6.5,lobR:110,ch:LUK,about:'Кидается ракушками в заставы — та, в которую попали, ненадолго молчит.'},
  luk_vit:{n:'Морской витязь',hp:130,spd:26,gold:12,lives:2,armor:.45,iv:.5,sz:.85,ch:LUK,about:'Выходят из волн плотным строем, в латах. Пушка — по всему строю!'},
  luk_nosil:{n:'Колдун-носильщик',hp:70,spd:32,gold:10,mres:.3,ab:'carry',ch:LUK,about:'Хватает соседа и переносит его вперёд по дороге.'},
  luk_morok:{n:'Морок',hp:50,spd:46,gold:8,fly:1,pres:.3,ab:'decoy',decoyCd:7,ch:LUK,about:'Летучий обман: пускает обманки, и стрельцы тратят на них стрелы.'},
  luk_ten:{n:'Обманка',hp:1,spd:46,gold:0,lives:0,fly:1,art:'luk_morok',ch:LUK,about:'Пустышка: с одного удара тает.'},
  luk_karla:{n:'Карла',hp:20,spd:64,gold:2,sz:1.1,ch:LUK,about:'Слуга Черномора. Маленький, шустрый и бородатый.'},
  luk_uch:{n:'Кот учёный',hp:120,spd:22,gold:20,lives:2,ab:'tale',sz:.6,ch:LUK,about:'Не злой — рассказывает сказку. Только из сказки лезет нечисть из прошлых земель!'},
  luk_kold:{n:'Колдун-похититель',hp:140,spd:24,gold:20,lives:2,mres:.3,ab:'carry',carryCd:4,carryL:90,sz:.55,ch:LUK,about:'Похищает нечисть с дороги и переносит её поближе к воротам.'},
  luk_chern:{n:'Черномор',g:'m',hp:1300,spd:16,gold:310,lives:20,boss:1,sz:.66,ch:LUK,about:'Борода-коса глушит заставы рядом, в шапке-невидимке его видит только колдун. Зовёт карл.'}
});
const EN_EN={luk_kot:{n:'Chained Cat',about:'Walks round and round the chain… and once loose, it races to the gate. Quick!'},
  luk_zver:{n:'Unseen Beast',about:'Monsters on its trail run faster. Take it out first!'},
  luk_stupa:{n:'Runaway Mortar',about:'Freezes, takes aim — and dashes ahead.'},
  luk_rus:{n:'Branch Rusalka',about:'Throws shells at outposts — the one she hits goes quiet for a moment.'},
  luk_vit:{n:'Sea Knight',about:'They rise from the waves in a tight armored line. Cannon the whole line!'},
  luk_nosil:{n:'Porter Sorcerer',about:'Grabs a neighbor and carries it ahead along the road.'},
  luk_morok:{n:'Mirage',about:'A flying trick: it sends out decoys, and archers waste arrows on them.'},
  luk_ten:{n:'Decoy',about:'An empty shell: one hit and it melts.'},
  luk_karla:{n:'Dwarf',about:'Chernomor’s servant. Small, quick and bearded.'},
  luk_uch:{n:'The Learned Cat',about:'Not evil — he tells a tale. But monsters from earlier lands climb out of it!'},
  luk_kold:{n:'Thief Sorcerer',about:'Snatches monsters off the road and carries them closer to the gate.'},
  luk_chern:{n:'Chernomor',about:'His beard-scythe silences outposts nearby; in his cap of invisibility only the sorcerer can see him. Calls his dwarves.'}};
for(const k in EN_EN)langReg(EN[k],EN_EN[k]);
Object.assign(LORE,{luk_kot:'Цепной кот. Днём сказки сказывает, ночью — по цепи бегает. Сорвался — держись!',
  luk_zver:'Невиданный зверь. Никто его не видел, а следы — вот они. И по следам вся нечисть бежит вприпрыжку.',
  luk_stupa:'Ступа-самоходка. Бабы-яги нет, а ступа летает. Сама. Куда хочет.',
  luk_rus:'Русалка на ветвях. Сидит на дубе, поёт и кидается ракушками. Меткая.',
  luk_vit:'Морской витязь. Тридцать витязей прекрасных — и все в строю, и все в латах.',
  luk_nosil:'Колдун-носильщик. Колдовать ленится, зато носит — кого угодно и куда угодно.',
  luk_morok:'Морок. То ли есть, то ли нет. Скорее нет. Но бьёт больно.',
  luk_ten:'Обманка. Пустое место в виде нечисти.',luk_karla:'Карла. Носит Черномору бороду. Устал.',
  luk_uch:'Кот учёный. Идёт направо — песнь заводит, налево — сказку говорит. А из сказки — нечисть.',
  luk_kold:'Колдун-похититель. Украл бы Людмилу, да занят: таскает нечисть к твоим воротам.',
  luk_chern:'Черномор. Борода длиннее дороги, шапка-невидимка набекрень. Без бороды — никто.'});
chLang(LORE,{luk_kot:'Chained Cat. Tells tales by day, runs the chain by night. Once loose — look out!',
  luk_zver:'Unseen Beast. Nobody has seen it, but here are its tracks. And every monster runs along them at a gallop.',
  luk_stupa:'Runaway Mortar. No Baba Yaga, yet the mortar flies. By itself. Wherever it likes.',
  luk_rus:'Branch Rusalka. Sits on the oak, sings and throws shells. Good aim.',
  luk_vit:'Sea Knight. Thirty-three fine knights — all in line, all in armor.',
  luk_nosil:'Porter Sorcerer. Too lazy to cast spells, but he carries — anyone, anywhere.',
  luk_morok:'Mirage. Maybe it’s there, maybe not. Probably not. But it hits hard.',
  luk_ten:'Decoy. An empty space shaped like a monster.',luk_karla:'Dwarf. Carries Chernomor’s beard. Tired of it.',
  luk_uch:'The Learned Cat. Walks right — sings a song; walks left — tells a tale. And out of the tale come monsters.',
  luk_kold:'Thief Sorcerer. He’d kidnap a princess, but he’s busy hauling monsters to your gate.',
  luk_chern:'Chernomor. A beard longer than the road, a cap of invisibility askew. Without the beard — a nobody.'});
BOSS_SAY.luk_chern=['Борода моя — сила моя!','Карлы, за мной!','Ищи-свищи меня!'];
BOSS_TIP.luk_chern='Невидимого бьют только колдун и Гром Перуна — держи колдунов. Коса-борода глушит заставы рядом — расставь их вдоль дороги.';
chLang(BOSS_SAY,{luk_chern:['My beard is my power!','Dwarves, follow me!','Catch me if you can!']});
chLang(BOSS_TIP,{luk_chern:'When invisible, only the sorcerer and Perun’s Thunder can hit him — keep sorcerers. His beard silences outposts nearby — spread them along the road.'});
Object.assign(WAVE_NAMES,{luk_kot:['Кошачья цепь','Коты учёные и не очень'],luk_zver:['Следы невиданные','Зверьё неведомое'],luk_stupa:['Ступы без хозяйки','Рывок за рывком'],
  luk_rus:['Русалки на ветвях','Ракушечный обстрел'],luk_vit:['Тридцать витязей','Из волн — строем']});
chLang(WAVE_NAMES,{luk_kot:['The cat chain','Learned cats and not-so'],luk_zver:['Unseen tracks','Unknown beasts'],luk_stupa:['Mortars without a witch','Dash after dash'],
  luk_rus:['Rusalkas in the branches','Shell barrage'],luk_vit:['Thirty-three knights','In line from the waves']});
Object.assign(LEAD.at,{[LUK+'-2']:'luk_uch',[LUK+'-3']:'luk_morok',[LUK+'-4']:'luk_kold',[LUK+'-6']:'luk_uch'});
Object.assign(LEAD.n,{luk_uch:'Кот учёный',luk_morok:'Морок-вожак',luk_kold:'Колдун-похититель'});chLang(LEAD.n,{luk_uch:'The Learned Cat',luk_morok:'Mirage Leader',luk_kold:'Thief Sorcerer'});
Object.assign(LEAD.ab,{luk_uch:'Рассказывает сказку — из неё лезут гости из прошлых земель!',luk_morok:'Пускает обманки. Колдун цепью бьёт и их, и его!',luk_kold:'Переносит нечисть к самым воротам. Сбей его первым!'});
chLang(LEAD.ab,{luk_uch:'He tells a tale — and guests from earlier lands climb out of it!',luk_morok:'Sends out decoys. A chained bolt hits them and him!',luk_kold:'Carries monsters right up to the gate. Knock him down first!'});
Object.assign(LEAD.sayT,{luk_uch:['Мур-р… жили-были…','Слушайте сказку!','Там чудеса, там леший бродит…'],luk_morok:['Где я? Тут я!','Ищи меня!','Ха-ха!'],luk_kold:['Подвезу, подвезу!','Кого украсть?','Хвать!']});
chLang(LEAD.sayT,{luk_uch:['Purr… once upon a time…','Listen to my tale!','There are wonders, a leshy roams…'],luk_morok:['Where am I? Here!','Find me!','Ha-ha!'],luk_kold:['Hop on, hop on!','Whom shall I steal?','Grab!']});

// Кот учёный: раз в 7 с — трое «гостей из сказки» (нечисть пройденной раньше главы)
CHX.ab.tale=(e,dt,b,sp)=>{if(chBusy(e))return sp;e.abT-=dt;if(e.abT<=0){e.abT=7;const g=chGuests(G.ci,mulberry(G.t*100|0));if(g&&g.en.length){for(let i=0;i<3;i++){const o=spawnEnemy(g.en[i%g.en.length],e.pi,Math.max(0,e.d-12-i*12),minionHp()*.8);poof(o.x,o.y);}
    say(e,Lg('Жили-были…','Once upon a time…'),1.6);G.banner={title:Lg('Там чудеса!','Wonders abound!'),sub:Lg('Кот рассказывает сказку «','The Cat tells a tale of “')+CH[g.c].name+Lg('»','”'),t:0,wave:1};}}return sp;};
CHX.tip.tale=()=>Lg('рассказывает сказку — из неё лезет нечисть прошлых земель: сбей его поскорее','tells a tale that brings monsters from earlier lands — knock him down fast');
// Черномор
CHX.boss.luk_chern=(e,dt)=>{const k=e.yar?CH_YAR.cd:1;
  // коса-борода: кольцо-предупреждение 0,8 с, потом заставы рядом молчат 2,2 с (после «отрезанной бороды» — нет)
  if(!e.cut){if(e.sw){e.sw-=dt;if(e.sw<=0){e.sw=0;for(const t of towersNear(e.x,e.y,95)){t.stunT=Math.max(t.stunT,2.2);t.dizFx=2.2;}SND.whistle();G.fx.push({k:'wave',x:e.x,y:e.y,r:95,t:0,dur:.6,col:'#cfd8ff'});}}
    else if(e.abT<=0){e.abT=7*k;e.sw=.8;G.fx.push({k:'ring',x:e.x,y:e.y,r:95,t:0,dur:.8,col:'#ff5a3a'});say(e,Lg('Берегись бороды!','Mind the beard!'),1.2);}}
  if(e.ab2<=0){e.ab2=10*k;for(let i=0;i<(e.yar?5:4);i++)spawnEnemy('luk_karla',e.pi,Math.max(0,e.d-10-i*10),minionHp());}
  // шапка-невидимка: раз в 12 с на 4 с (0,8 с мерцает)
  e.clT=(e.clT==null?6:e.clT)-dt;if(e.cloak){if(e.clT<=0){e.cloak=0;e.clT=12*k;poof(e.x,e.y);}}else if(e.clT<=0){e.cloak=1;e.clT=4;poof(e.x,e.y);say(e,Lg('Ищи-свищи!','Catch me!'),1.2);}
  if(!e.cut&&e.hp<e.max*.5){e.cut=1;e.spd*=1.3;e.cloak=0;say(e,Lg('Ай, моя борода! Карлы, ко мне!','Ow, my beard! Dwarves, to me!'),2);G.shake=10;for(let i=0;i<6;i++)spawnEnemy('luk_karla',e.pi,Math.max(0,e.d-10-i*9),minionHp());}};

// Деревня II: Дуб у Лукоморья — чары сильнее (Гром +10% урона, Кот +0,3 с сна за уровень)
const dubl={id:'dubl',name:'Дуб у Лукоморья',ic:'luk_dub',about:'Чары сильнее: Гром Перуна +10% урона, Кот Баюн поёт дольше — за каждый уровень',cost:[3000,6000,12000],ch:LUK};
BLD.push(dubl);langReg(dubl,{name:'Lukomorye Oak',about:'Stronger spells: Perun’s Thunder +10% damage, Bayun sings longer — per level'});VIL_POS.dubl=[.33,.84];
chAdd({id:LUK,after:5,hp:7.4,coins:660,lmark:['luk_dub','luk_volna','d_shell'],book:['luk_nosil','luk_morok','luk_ten','luk_karla','luk_uch','luk_kold'],
  ach:{n:'Борода долой',en:'Off with the Beard',bossEn:'Chernomor'},
  banner:{id:'luk',n:'Знамя Лукоморья',cost:2200,c1:'#3a8a3a',c2:'#ffd84a',em:[7,.4],en:'Banner of Lukomorye'},
  fix:{'9-0':3,'9-1':1.8,'9-2':2.1,'9-3':1.9,'9-4':2,'9-5':1.5,'9-6':1.4},
  ch:{name:'Лукоморье',g:'n',sub:'У лукоморья дуб зелёный',boss:'luk_chern',en:['luk_kot','luk_zver','luk_stupa','luk_rus','luk_vit'],
    ground:{base:'#8fbf6a',hi:'#a2cc7c',lo:'#7fae5c',grass:'#6a9a4a',flow:['#ffffff','#ffd84a','#7fd0ff','#f6a0c0']},
    road:{edge:'#9a7a4a',fill:'#e2cc98',hi:'#efdcae',deco:'shells'},decor:['luk_cep','luk_sled','d_shell','d_bush','d_oak','luk_sled'],mc:'#e6b53a',lair:1,river:1,bossK:2,
    pw:[480,490,500,505,510,520,540],
    levels:['У дуба зелёного','Златая цепь','Неведомые дорожки','Следы невиданных зверей','Тридцать витязей','Сады Черномора','Борода Черномора'],
    intro:['Лукоморье! Дуб зелёный, златая цепь — а по цепи котов целая свора. Шустрые! А Невиданный зверь подгоняет соседей — бей его первым.',
      'Ступы-самоходки замирают — и делают рывок вперёд. Видишь красную стрелку — жди прыжка. Держи заставы и у ворот.',
      'Русалки на ветвях кидаются ракушками в заставы. А Кот учёный рассказывает сказку — и из неё лезут гости из прошлых земель!',
      'Колдуны-носильщики переносят соседей вперёд по дороге. И берегись Морока: пускает обманки — стрельцы тратят на них стрелы.',
      'Тридцать витязей прекрасных выходят из волн плотным строем, в латах. Пушка и Царь-пушка — бить по всему строю! И сбей Колдуна-похитителя.',
      'Черномор! Борода-коса глушит заставы рядом, а в шапке-невидимке его видит только колдун. Отрежь бороду — и он задаст стрекача.',
      'Логово Черномора — по желанию. Он тут ярый: коса чаще, карл больше.'],
    // «Там чудеса»: с 2-го уровня в 4-й волне (и в 7-й с 5-го) — гости из пройденной земли; носильщики — с 4-го уровня
    waveX(waves,li,ci){const R0=mulberry(ci*53+li*29+7);
      if(li>=1)for(const w of[3,6]){if(w===6&&li<4||!waves[w])continue;const g=chGuests(ci,R0);if(!g||!g.en.length)continue;const t=g.en[Math.floor(R0()*g.en.length)];
        waves[w].g.push({t,n:cnt(t,budget(li,w)*.35),iv:spacing(t),delay:4});waves[w].name=Lg('Там чудеса!','Wonders abound!');}
      if(li>=3)waves.forEach((w,i)=>{if(i%3===1)w.g.push({t:'luk_nosil',n:1+Math.floor(li/3),iv:2,delay:6});});}},
  en:{name:'Lukomorye',sub:'A green oak by the curved seashore',
    levels:['By the Green Oak','The Golden Chain','Unknown Paths','Tracks of Unseen Beasts','Thirty-Three Knights','Chernomor’s Gardens','Chernomor’s Beard'],
    intro:['Lukomorye! A green oak, a golden chain — and a whole pack of cats along it. Quick ones! And the Unseen Beast hurries its neighbors along — take it out first.',
      'Runaway mortars freeze — and then dash ahead. See a red arrow — expect a jump. Keep outposts near the gate too.',
      'Rusalkas in the branches throw shells at outposts. And the Learned Cat tells a tale — and guests from earlier lands climb out of it!',
      'Porter sorcerers carry their neighbors ahead along the road. And beware the Mirage: it sends out decoys, and archers waste arrows on them.',
      'Thirty-three fine knights rise from the waves in a tight armored line. Cannon and Tsar Cannon — hit the whole line! And knock down the Thief Sorcerer.',
      'Chernomor! His beard-scythe silences outposts nearby, and in his cap of invisibility only the sorcerer can see him. Cut off his beard — and he’ll run for it.',
      'Chernomor’s Lair — optional. Here he is raging: more scythe swings, more dwarves.']}});
})();
