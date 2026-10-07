/* темы глав (сборка tools/thpack.sh): les bol pole kosh med gory more luk ogon vihr lih */

/* ---- les-art.js ---- */
try{(function(){
/* рисунки темы les (T-les, A30): только art()/artTint() из js/art.js */
artTint('les_volkolak','wolf','#5a4636');
artTint('les_dymok','muh','#8a5ac8');
artTint('les_putanik','lesh','#5a7a9a');
art('les_svolk',90,g=>{g.save();g.scale(1.8,1.8);ART.wolf.fn(g);g.restore(); /* Серый волк: большой волк, шрам, красные глаза */
  ln(g,[15,-22,25,-8],'#3a2a2a',2.2);ln(g,[17,-17,22,-19],'#3a2a2a',1.4);ln(g,[19,-12,24,-14],'#3a2a2a',1.4);
  ell(g,21.6,-14.4,3,3.4,'#ff3b2a',{ol:false,flat:true});ell(g,22.4,-14.4,1.3,1.9,'#3a0a0a',{ol:false,flat:true});
  for(const [x,y] of[[-14,-12],[-6,-15],[2,-15]])poly(g,[x-4,y+4,x,y-5,x+4,y+4],'#9aa3b3',{ol:false});});
art('les_solovyonok',48,g=>{g.translate(0,3); /* Соловьёнок: маленький Соловей с рогаткой */
  ell(g,-4,16,3.5,2.2,'#3a2416');ell(g,4,16,3.5,2.2,'#3a2416');
  ell(g,0,7,10,9,'#8a5a2e');ell(g,0,9,6.5,5.5,'#b98a52',{ol:false});rrect(g,-9.5,8,19,2.4,1);g.fillStyle='#3a2416';g.fill();
  ell(g,-11,5,3.2,3.2,'#8a5a2e');ell(g,11,4,3.2,3.2,'#8a5a2e');
  ln(g,[12,3,15,-6],'#5a3a22',2);ln(g,[15,-6,13,-11],'#5a3a22',1.6);ln(g,[15,-6,18,-10],'#5a3a22',1.6);ln(g,[13,-11,15.5,-8,18,-10],'#c9a070',.8);
  ell(g,0,-5,7.5,7,'#e9bb90');
  shp(g,'#231710',{},[-8,-5,8,5],()=>{g.moveTo(-6.5,-4);g.quadraticCurveTo(-8,4,0,5);g.quadraticCurveTo(8,4,6.5,-4);g.quadraticCurveTo(3,-1,0,-2);g.quadraticCurveTo(-3,-1,-6.5,-4);});
  ell(g,0,-1.8,1.8,1.8,'#c0392b');
  eye(g,-2.6,-7,1.6,{angry:1,px:0});eye(g,2.6,-7,1.6,{angry:1,flipB:1,px:0});
  shp(g,'#3a2a5a',{},[-8,-17,8,-10],()=>{g.moveTo(-8,-10);g.quadraticCurveTo(-7,-17,1,-17);g.quadraticCurveTo(8,-16,8,-10);g.closePath();});
  for(const [x,c] of[[-2,'#e8433a'],[3,'#f5b83a']])shp(g,c,{},[x-2,-25,x+3,-16],()=>{g.moveTo(x,-16);g.quadraticCurveTo(x-2,-22,x+3,-25);g.quadraticCurveTo(x+3,-20,x+1.5,-16);g.closePath();});
  shine(g,-4,-9,3,1.4,.35);});
art('les_dub',104,g=>{ART.d_oak.fn(g); /* дуб с гнездом Соловья */
  ell(g,2,-30,14,6,'#7a5230');for(const [a,b,c,d] of[[-11,-31,13,-27],[-9,-27,14,-33],[-12,-29,10,-34]])ln(g,[a,b,c,d],'#5a3a1e',1.4);
  ell(g,2,-33,10,3,'#3a2414',{ol:false,flat:true});for(const x of[-2,3,8]){ell(g,x,-34,2.2,2.6,'#f4ead2');}});

})();}catch(e){console.warn("th les-art.js",e);}

/* ---- les.js ---- */
try{(function(){
/* тема les «Дремучий лес» (T-les, A30): главы 2 (слот 8) и 3 (слот 9). Формат — release-h/bogatyr-chapters/ENGINE-API.md §3, §10.
   Повадки (dash, bomb, lob, decoy), особенности вожаков (aura, fast, tough) и приёмы (dash, summon, wave, cone, nest) — из библиотек BEH/BK (A20/A21); пока их нет — движок пишет warn «unknown», игра идёт. */
(function(){
/* клин волков: n зверей, вершина ближе к богатырю; каждый k-й — волколак */
function wedge(G,a,n,k){const H=G.hero,R=VIEW.R,ux=Math.cos(a),uy=Math.sin(a),bx=H.x+ux*R,by=H.y+uy*R;
  for(let i=0;i<n;i++){const row=Math.ceil(i/2),side=i%2?1:-1,e=mkEnemy(k&&i%k===k-1?'les_volkolak':'wolf',bx+ux*row*34-uy*row*44*side,by+uy*row*34+ux*row*44*side);e.spd*=1.3;}}
const tip=()=>banner(L('Волчья стая!','Wolf pack!'),L('Идут широким клином — уходи вбок!','A wide wedge is charging — step aside!'),4);
THEME_ADD({id:'les',
 ch:[
  {slot:8,n:2,name:'Волчья тропа',sub:'Набег',hook:'Серый волк ведёт стаю по лесной тропе',
   en:{name:'Wolf Trail',sub:'The Raid',hook:'The Grey Wolf leads his pack down the forest trail'},
   w:[{id:'wolf',t:0,v:1},{id:'muh',t:0,v:.8},{id:'bat',t:30,v:.8},{id:'les_volkolak',t:70,v:.7},{id:'les_dymok',t:120,v:.5}],
   el:[{id:'wolf',fx:['aura','fast']},{id:'les_volkolak',fx:['tough']},{id:'les_dymok',fx:['tough']}],
   ev:['les_staya'],boss:'les_svolk'},
  {slot:9,n:3,name:'Гнездо Соловья',sub:'Логово',hook:'Соловей засел в гнезде на девяти дубах',
   en:{name:"Nightingale's Nest",sub:'The Lair',hook:'The Nightingale has perched in his nest on nine oaks'},
   w:[{id:'wolf',t:0,v:1},{id:'les_volkolak',t:0,v:.6},{id:'les_solovyonok',t:40,v:.7},{id:'les_dymok',t:60,v:.5},{id:'les_putanik',t:100,v:.5},{id:'lesh',t:150,v:.3},{id:'bat',t:0,v:.5,e:150}],
   el:[{id:'les_volkolak',fx:['aura','fast']},{id:'les_putanik',fx:['tough']},{id:'les_solovyonok',fx:['fast']}],
   ev:['les_oblava',{k:'les_staya',t:100}],mb:{id:'les_svolk',t:150},boss:'solo',bv:'solo_r',nt:1,dark:1,
   ground:{base:'#3f6e3a',hi:'#4d7f45',lo:'#355f31',grass:'#2e5a2a',flow:['#e8f4c8','#f5b83a']},tint:'rgba(20,30,10,.18)',
   decor:['d_pine','les_dub','d_oak','d_stump','d_shroom']}],
 en:{
  les_volkolak:{n:'Волколак',r:13,hp:18,spd:70,dmg:7,xp:2,col:'#5a4636',beh:'dash',bp:{cd:4,warn:.8,spd:320},en:{n:'Werewolf'},
   lore:{ru:'Днём — мельник, ночью — волк. Мельницу забросил, зато бегает рывками, как на пожар.',en:'A miller by day, a wolf by night. Gave up the mill, but dashes about as if his tail were on fire.'},
   ph:{ru:['Р-р-рывок!','Ау-у!'],en:['Dash-sh-sh!','Awoo!']}},
  les_dymok:{n:'Мухомор-дымок',r:11,hp:10,spd:38,dmg:4,xp:1,col:'#8a5ac8',beh:'bomb',bp:{r:60,warn:1,slow:.5,dur:3},en:{n:'Drowsy Toadstool'},
   lore:{ru:'Лопнет — и вокруг сонное облачко. Кто вдохнул, тот еле ноги переставляет. Сам же потом и обижается.',en:'Pops into a sleepy cloud. Breathe it in and your feet turn to porridge. Then it sulks about it.'},
   ph:{ru:['Пф-ф-ф…','Баю-бай!'],en:['Pfff…','Sleepy-bye!']}},
  les_solovyonok:{n:'Соловьёнок',r:10,hp:10,spd:60,dmg:5,xp:2,col:'#8a5a2e',beh:'lob',bp:{cd:3,r:240,warn:.8,dmg:5},en:{n:'Little Nightingale'},
   lore:{ru:'Сын Соловья-разбойника. Свистеть ещё не умеет, зато из рогатки — метко и без спросу.',en:"The Nightingale's son. Can't whistle yet, but his slingshot never misses, and never asks."},
   ph:{ru:['Батька, гляди!','Фьють!'],en:['Look, Dad!','Fweet!']}},
  les_putanik:{n:'Леший-путаник',r:16,hp:44,spd:36,dmg:8,xp:3,col:'#5a7a9a',beh:'decoy',bp:{cd:6,n:2},en:{n:'Muddling Leshy'},
   lore:{ru:'Водит кругами и себя в два счёта двоит. Какой настоящий — не знает и он сам.',en:"Leads you in circles and splits into copies. Which one's real? He isn't sure either."},
   ph:{ru:['Ау-у! Я тут!','Нет, я тут!'],en:["Yoo-hoo! I'm here!","No, I'm here!"]}}},
 boss:{
  les_svolk:{n:'Серый волк',g:'m',mini:.12,r:26,hp:3100,spd:56,dmg:15,col:'#8a93a3',title:{ru:'Вожак всех стай',en:'Leader of every pack'},en:{n:'The Grey Wolf'},
   ph:{ru:['Ау-у-у! Чую богатыря!','Стая, ко мне!','Царевичей катал — теперь сам поохочусь!','Не догонишь!','Зубы-то у меня побольше твоих!'],
       en:['Awooo! I smell a hero!','Pack, to me!','I used to carry princes — now I hunt!',"You'll never catch me!",'My teeth are bigger than yours!']},
   lore:{ru:'Тот самый Серый волк. Царевичей возить надоело — собрал стаю и решил сам стать сказкой.',en:'The very Grey Wolf. Tired of carrying princes, he gathered a pack to star in his own tale.'},
   kit:{a:[{k:'dash',cd:5,warn:.9},{k:'summon',cd:12,id:'wolf',n:4}]}},
  solo_r:{base:'solo',rage:1,n:'Соловей ярый',en:{n:'Raging Nightingale'},title:{ru:'Засел на девяти дубах',en:'Perched on nine oaks'},hpK:1.4,
   kit:{a:[{k:'wave',cd:7},{k:'cone',cd:6,warn:.9},{k:'summon',cd:14,id:'les_solovyonok',n:3}],
        ph:[{hp:.5,add:[{k:'nest',cd:8}],sum:{id:'les_solovyonok',n:4},say:{ru:'Детки, к батьке! Я — в гнездо!',en:'Kids, to Daddy! Into the nest!'}}]}}},
 evs:{
  les_staya:{t:{ru:'Волчья стая!',en:'Wolf pack!'},dur:0,start(G){wedge(G,rand(0,TAU),28,7);tip();}},
  les_oblava:{t:{ru:'Облава!',en:'Round-up!'},dur:0,start(G){const a=rand(0,TAU);wedge(G,a,20,5);wedge(G,a+Math.PI,20,5);
   banner(L('Облава!','Round-up!'),L('Стаи с двух сторон — уходи вбок!','Packs from both sides — step aside!'),4);}}}});
})();

})();}catch(e){console.warn("th les.js",e);}

/* ---- bol-art.js ---- */
try{(function(){
/* рисунки темы bol («Гиблое болото», T-bol): только art()/artTint() из js/art.js; помощники — внутри (function(){…})() */
(function(){
// перекрасить уже нарисованное (только то, что есть на холсте спрайта)
function over(g,col,a){g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(-60,-60,120,120);g.restore();}
// Болотник: водяной поменьше, в тине и грязи
art('bol_bolot',48,g=>{g.save();g.scale(.8,.8);ART.vod.fn(g);g.restore();over(g,'#5a5a22',.42);
  ell(g,0,-17,7,3.6,'#4a3a1e',{ol:false});ell(g,-6,-15,5,2.6,'#4a3a1e',{ol:false});ell(g,4,-14,6,2.8,'#4a3a1e',{ol:false});
  ln(g,[-9,-14,-11,-21],'#5f7a2a',1.6);ln(g,[1,-15,2,-23],'#5f7a2a',1.6);ln(g,[7,-14,10,-20],'#5f7a2a',1.6);
  ell(g,-11,9,2,3.4,'#4a3a1e',{ol:false});ell(g,12,6,1.8,3,'#4a3a1e',{ol:false});});
// Пиявка-присоска: пиявка потемнее, с присоской-кольцом
art('bol_piyav',30,g=>{g.save();g.scale(1.05,1.05);ART.piy.fn(g);g.restore();over(g,'#3a1a5a',.45);
  g.beginPath();g.arc(10,-1,3.2,0,TAU);g.lineWidth=1.6;g.strokeStyle='#d07ab0';g.stroke();});
// Водяной-дед: большой водяной с бородой-тиной и кувшинкой на макушке
art('bol_ded',84,g=>{g.save();g.scale(1.35,1.35);ART.vod.fn(g);g.restore();over(g,'#1f5a6a',.22);
  shp(g,'#5f8a4a',{},[-13,3,13,30],()=>{g.moveTo(-13,4);g.quadraticCurveTo(-12,22,-4,30);g.lineTo(0,24);g.lineTo(4,31);g.quadraticCurveTo(12,22,13,4);g.quadraticCurveTo(0,10,-13,4);});
  ln(g,[-6,9,-5,22],'#3f6a32',1.2);ln(g,[0,10,0,24],'#3f6a32',1.2);ln(g,[6,9,5,22],'#3f6a32',1.2);
  for(const a of[-1.9,-1.25,-.6,0,.6,1.25,1.9])ell(g,Math.sin(a)*5,-27-Math.cos(a)*4,2.2,4.6,'#f2a6c4',{rot:a,lw:.7});
  ell(g,0,-26,2.6,2.2,'#ffd84a',{lw:.6});});
// Гусь-лебедь Яги (ключ gus — его же берёт «Вихрь» тинтом); смотрит вправо
art('gus',36,g=>{ln(g,[-2,9,-3,15],'#e07a1e',1.6);ln(g,[3,9,4,15],'#e07a1e',1.6);
  poly(g,[-11,1,-17,-4,-15,4],'#c9d0da');ell(g,-2,3,11,7,'#eef1f5');
  shp(g,'#9aa4b4',{},[-12,-4,6,6],()=>{g.moveTo(6,0);g.quadraticCurveTo(-2,-6,-12,-3);g.quadraticCurveTo(-4,6,6,0);});
  ln(g,[5,-1,8,-7,10,-11],'#5a6470',5.4);ln(g,[5,-1,8,-7,10,-11],'#eef1f5',3.6);
  ell(g,11,-12,4.2,3.6,'#eef1f5');poly(g,[14,-13.5,20,-11,14,-9.5],'#f08a2a',{lw:.7});
  eye(g,11.5,-13,1.5,{px:.5,angry:1});shine(g,-5,0,4,1.6,.35);});
// Избушка на курьих ножках (небольшая; выходит у «Яги ярой» на половине здоровья)
art('bol_izba',70,g=>{for(const s of[-1,1]){ln(g,[s*9,12,s*13,22,s*10,30],'#e0a43a',3.4);
    ln(g,[s*10,30,s*10-6,33],'#e0a43a',2);ln(g,[s*10,30,s*10+6,33],'#e0a43a',2);ln(g,[s*10,30,s*10,34],'#e0a43a',2);}
  shp(g,'#8a5a32',{},[-17,-8,17,14],()=>{rrect(g,-17,-8,34,22,3);});
  for(const y of[-3,2,7])ln(g,[-16,y,16,y],'#5a3a1e',1);
  poly(g,[-22,-6,0,-27,22,-6],'#6a6a3a');ln(g,[-14,-12,14,-12],'#4a4a26',1);ln(g,[-7,-19,7,-19],'#4a4a26',1);
  g.fillStyle='#5a3a1e';g.fillRect(-3,-15,6,4);
  shp(g,'#ffd86a',{flat:1,olc:'#5a3a1e',lw:1.2},[-6,-4,6,6],()=>{rrect(g,-6,-4,12,10,1.5);});
  ln(g,[0,-4,0,6],'#5a3a1e',1.2);ln(g,[-6,1,6,1],'#5a3a1e',1.2);glow(g,0,1,10,'rgba(255,210,90,.35)','rgba(255,240,180,.5)');});
})();

})();}catch(e){console.warn("th bol-art.js",e);}

/* ---- bol.js ---- */
try{(function(){
/* тема bol «Гиблое болото» (T-bol, A31): главы 2 «Трясина» (слот 10) и 3 «Избушка на курьих ножках» (слот 11). Формат — ENGINE-API.md §3/§10.
   Повадки (burrow/latch/dash), особенности вожаков (heal/tough/fast) и приёмы боссов (pull/summon/wave/dash/trail/zones) — из js/beh.js и js/bk.js (A20/A21), здесь только имена. */
(function(){
// болотный туман: как старый «fog», но гуще — держим полную мглу h секунд и зовём n нечисти кольцом вокруг богатыря
function fog(G,n,ids){G.fogT=14;G.fogK='fog';const H=G.hero,R=VIEW.R;
  for(let i=0;i<n;i++){const a=rand(0,TAU),d=R*rand(.55,.8);mkEnemy(ids[i%ids.length],H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);}}
function hold(G,t,h){if(t<h&&G.fogT<12.5)G.fogT=12.5;} /* fogT>14 рисуется прозрачным (game.js: (14-fogT)/1.5) — держим 12,5 */
THEME_ADD({id:'bol',
  ch:[
    {slot:10,n:2,name:'Трясина',sub:'Тина по колено, а дед — по уши',
      en:{name:'The Quagmire',sub:'Knee-deep in mud, ear-deep in trouble'},
      w:[{id:'piy',t:0,v:1},{id:'kik',t:0,v:.8},{id:'bol_bolot',t:35,v:1},{id:'bol_piyav',t:95,v:.9},{id:'wolf',t:165,v:.3,g:1}],
      el:[{id:'kik',fx:['heal']},{id:'bol_bolot',fx:['tough']}],
      ev:['bol_tuman'],
      boss:'bol_ded'},
    {slot:11,n:3,name:'Избушка на курьих ножках',sub:'Логово Бабы-Яги',
      hook:'Изба на курьих ножках бегает по болоту, а хозяйка — дома',
      en:{name:'Hut on Chicken Legs',sub:"Baba Yaga's Lair",hook:'The hut on chicken legs roams the swamp, and its mistress is home'},
      w:[{id:'kik',t:0,v:1},{id:'piy',t:0,v:.7},{id:'bol_bolot',t:35,v:.9},{id:'bol_piyav',t:35,v:.6},{id:'gus',t:95,v:1},{id:'ogon',t:165,v:.4}],
      el:[{id:'gus',fx:['fast']},{id:'bol_bolot',fx:['tough']},{id:'kik',fx:['heal']}],
      ev:['bol_tuman2'],
      mb:{id:'bol_ded',t:150},
      boss:'yaga',bv:'yaga_r',dark:1,nt:1}],
  en:{
    bol_bolot:{n:'Болотник',r:14,hp:30,spd:46,dmg:9,xp:2,col:'#5a6a3a',beh:'burrow',bp:{cd:4,warn:1},en:{n:'Bog Dweller'},
      lore:{ru:'Ныряет в трясину и выныривает прямо под ногами. Пузыри на тине — значит, сейчас вылезет.',en:'Dives into the mire and pops up right under your feet. Bubbles in the mud mean he is coming.'},
      ph:{ru:['Бульк!','Из тины — да в глаз!'],en:['Blub!','Out of the mud — right at you!']}},
    bol_piyav:{n:'Пиявка-присоска',r:8,hp:10,spd:90,dmg:3,xp:1,col:'#4a2a5a',beh:'latch',bp:{cd:3},en:{n:'Sucker Leech'},
      lore:{ru:'Прилипает к богатырю и не отстаёт. Стряхни — отбеги подальше или прихлопни.',en:'Sticks to the hero and won’t let go. Run to shake it off, or swat it.'}},
    gus:{n:'Гусь-лебедь',r:11,hp:16,spd:84,dmg:7,xp:2,col:'#eef1f5',fly:1,beh:'dash',bp:{cd:3,warn:.9},en:{n:'Swan-Goose'},
      lore:{ru:'Слуга Бабы-Яги. Летит клином и с разгону щиплется — отойди с его прямой.',en:'Baba Yaga’s servant. Flies in a wedge and pecks as it swoops — step off its line.'},
      ph:{ru:['Га-га-га!','Щипну!'],en:['Honk-honk!','Peck!']}},
    bol_izba:{n:'Избушка на курьих ножках',r:26,hp:400,spd:70,dmg:14,xp:6,col:'#8a5a32',beh:'dash',bp:{cd:3,warn:1},en:{n:'Chicken-Leg Hut'},
      lore:{ru:'Дом Бабы-Яги. Когда хозяйку разозлят, изба вскакивает и топчет всех подряд.',en:'Baba Yaga’s home. Make the mistress angry, and the hut jumps up and stomps on everyone.'}}},
  boss:{
    bol_ded:{n:'Водяной-дед',mini:.11,r:26,hp:4000,spd:34,dmg:16,col:'#2f6a7a',
      title:{ru:'Хозяин трясины',en:'Lord of the Quagmire'},en:{n:'Old Vodyanoy'},
      ph:{ru:['Буль-буль! Кто в моё болото без спросу?','В омут затяну!','Пиявочки, ко мне!','Тиной обмотаю!'],
          en:['Blub-blub! Who comes to my swamp uninvited?','Into the pool with you!','Leeches, to me!','I’ll wrap you in weeds!']},
      lore:{ru:'Самый старый водяной болота. Борода из тины, на макушке кувшинка. Тянет в водоворот и зовёт пиявок.',en:'The oldest water spirit of the swamp, with a beard of weeds and a lily on his head. Pulls you into a whirlpool and calls his leeches.'},
      kit:{a:[{k:'pull',cd:7},{k:'summon',cd:9,id:'bol_piyav',n:4}],
           ph:[{hp:.5,add:[{k:'wave',cd:8}],sum:{id:'bol_bolot',n:3},say:{ru:'Болото, вставай!',en:'Rise, swamp!'}}]}},
    yaga_r:{base:'yaga',rage:1,n:'Яга ярая',en:{n:'Baba Yaga the Furious'},hpK:1.1,
      title:{ru:'Хозяйка избушки',en:'Mistress of the Hut'},
      kit:{a:[{k:'dash',cd:5},{k:'trail',cd:1},{k:'summon',cd:10,id:'gus',n:3}],
           ph:[{hp:.5,add:[{k:'dash',cd:3},{k:'zones',cd:6}],sum:{id:'bol_izba',n:1},say:{ru:'Избушка, ко мне! Топчи его!',en:'Hut, to me! Stomp him flat!'}}]}}},
  evs:{
    bol_tuman:{t:{ru:'Болотный туман сгустился!',en:'The swamp fog thickens!'},dur:6,
      start(G){fog(G,26,['kik','kik','bol_bolot'])},step(G,dt,t){hold(G,t,6)}},
    bol_tuman2:{t:{ru:'Туман над избушкой!',en:'Fog over the hut!'},dur:8,
      start(G){fog(G,30,['kik','gus','bol_bolot'])},step(G,dt,t){hold(G,t,8)}}}
});
})();

})();}catch(e){console.warn("th bol.js",e);}

/* ---- pole-art.js ---- */
try{(function(){
/* рисунки темы pole («Дикое поле», T-pole): только art()/artTint() из js/art.js; помощники — внутри (function(){…})() */
(function(){
function over(g,col,a){g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(-60,-60,120,120);g.restore();}
// Скелет-подъёмыш: скелет с лиловым курганным налётом
artTint('pole_podym','skel','#9a84c8');
// Знаменосец: скелет со стягом на древке
art('pole_znam',50,g=>{ln(g,[-13,20,-13,-24],'#6a4222',2.4);
  shp(g,'#c0392b',{},[-13,-24,7,-8],()=>{g.moveTo(-13,-24);g.quadraticCurveTo(-3,-27,7,-22);g.quadraticCurveTo(3,-16,6,-10);g.quadraticCurveTo(-4,-12,-13,-9);g.closePath();});
  ell(g,-3,-17,3.4,3.4,'#ffd84a',{lw:.6});ART.skel.fn(g);over(g,'#d8b070',.18);});
// Степной лучник: скелет в меховой шапке, с луком
art('pole_luk',44,g=>{ART.skel.fn(g);over(g,'#c8a060',.22);
  shp(g,'#7a5230',{},[-10,-22,10,-12],()=>{g.moveTo(-10,-12);g.quadraticCurveTo(-8,-22,0,-23);g.quadraticCurveTo(8,-22,10,-12);g.closePath();});
  ell(g,0,-12,11,2.6,'#d8c8a0',{lw:.7});
  g.beginPath();g.arc(10,3,11,-1.25,1.25);g.lineWidth=2;g.strokeStyle='#5a3a1e';g.stroke();ln(g,[13.5,-7.5,13.5,13.5],'#efe8d6',.7);});
// Змеёныш: маленький Горыныч, посветлее
art('pole_zmey',46,g=>{g.save();g.translate(0,1);g.scale(.3,.3);ART.gory.fn(g);g.restore();over(g,'#9ad86a',.2);});
// Змеиное яйцо: пятнистое, с трещинкой и тёплым свечением
art('pole_yaico',34,g=>{glow(g,0,2,15,'rgba(255,170,60,.35)','rgba(255,220,140,.4)');ell(g,0,10,10,3,'rgba(60,40,20,.35)',{ol:false,flat:true});
  ell(g,0,1,9,11.5,'#c8e09a');for(const [x,y,r] of[[-4,-4,2.2],[3,-1,1.8],[-2,5,1.6],[4,6,2],[1,-8,1.4]])ell(g,x,y,r,r*.8,'#5a9a3a',{ol:false});
  ln(g,[-6,-2,-3,0,-4,3,-1,4],'#3a5a22',1);shine(g,-3,-6,3,1.6,.45);});
// Полкан: конь-богатырь из лубка — тело коня, торс в кафтане, лук; смотрит вправо
art('pole_polkan',100,g=>{
  ln(g,[-30,4,-40,14,-38,26],'#5a3a1e',5);ln(g,[-30,4,-42,10],'#6a4626',3);
  for(const [x,d] of[[-22,-2],[-12,2],[12,-2],[22,2]]){ln(g,[x,16,x+d,30,x+d*.5,40],'#8a5a2a',5);ell(g,x+d*.5,41,4.4,2.4,'#3a2414');}
  ell(g,-2,10,30,14,'#b07a3a');ell(g,-2,15,22,7,'#d0a060',{ol:false});
  for(const x of[-20,-8,4])ell(g,x,6,3,2,'#8a5a2a',{ol:false});
  shp(g,'#c0392b',{},[8,-24,30,10],()=>{g.moveTo(8,8);g.quadraticCurveTo(10,-20,20,-24);g.quadraticCurveTo(30,-20,30,8);g.quadraticCurveTo(19,12,8,8);});
  ln(g,[10,-4,29,-4],'#ffd84a',2);ln(g,[19,-22,19,8],'#8a1f2a',1);
  ln(g,[27,-16,38,-10],'#c0392b',4.4);g.beginPath();g.arc(36,-10,15,-1.3,1.3);g.lineWidth=2.4;g.strokeStyle='#5a3a1e';g.stroke();ln(g,[40,-24,40,4],'#efe8d6',.8);
  ell(g,19,-31,7.5,8,'#e9bb90');
  shp(g,'#c9a070',{},[11,-30,28,-14],()=>{g.moveTo(12,-29);g.quadraticCurveTo(12,-16,19,-14);g.quadraticCurveTo(27,-16,26,-29);g.quadraticCurveTo(19,-25,12,-29);});
  ell(g,19,-24,1.6,1.2,'#e08a6a',{ol:false});
  eye(g,16.4,-33,1.7,{angry:1,px:.4});eye(g,22,-33,1.7,{angry:1,flipB:1,px:.4});
  shp(g,'#3a6aa0',{},[10,-48,28,-36],()=>{g.moveTo(10,-36);g.quadraticCurveTo(12,-46,19,-48);g.quadraticCurveTo(26,-46,28,-36);g.closePath();});
  ell(g,19,-36,10,2.6,'#e8dcc0',{lw:.7});ell(g,19,-49,2,2,'#ffd84a',{lw:.6});shine(g,-10,2,10,4,.25);});
})();

})();}catch(e){console.warn("th pole-art.js",e);}

/* ---- pole.js ---- */
try{(function(){
/* тема pole «Дикое поле» (T-pole): слоты 12, 13. Своё: повадки pole_luk (залп веером), pole_egg (3 удара, через 20 с — змеёныш) */
(function(){
const R=()=>VIEW.R,ring=(G,id,n,k)=>{const H=G.hero;for(let i=0;i<n;i++){const a=i/n*TAU+rand(-.2,.2),d=R()*k;mkEnemy(id,H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);}};
/* яйца: тикер в G.evA до босса */
function eggs(G){let T=16,first=1;(G.evA||(G.evA=[])).push({k:'pole_yaica',t:0,v:{dur:1e9,step(G,dt){
  if(G.win||G.boss&&!G.boss.dead)return;if((T-=dt)>0)return;T=rand(22,28);const H=G.hero,n=G.t>150?3:2;
  for(let i=0;i<n;i++){const a=rand(0,TAU),d=Math.min(VIEW.ww,VIEW.wh)*rand(.22,.4);mkEnemy('pole_yaico',H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);}
  if(first){first=0;banner(L('Змеиные яйца!','Serpent eggs!'),L('Разбей, пока не вылупились!','Smash them before they hatch!'),2);}}}});}
/* тень Змея: полоса огня поперёк богатыря */
function sweep(G){if(typeof bzZ!=='function')return;const H=G.hero,a=rand(0,TAU),ux=Math.cos(a),uy=Math.sin(a),dm=12*(G.ch.dmg||1);
  for(let i=0;i<6;i++){const o=(i-2.5)*95;bzZ({k:'bomb',x:H.x+ux*o,y:H.y+uy*o,r:44,t:1.2+i*.08,dmg:dm,src:'gory',c:'#ff7a1a',fn:bzBoom});}}
THEME_ADD({id:'pole',
 ch:[
  {slot:12,n:2,name:'Степная застава',sub:'Набег',hook:'Полкан сторожит заставу посреди Дикого поля',
   en:{name:'Steppe Outpost',sub:'The Raid',hook:'Polkan guards the outpost in the middle of the Wild Field'},
   w:[{id:'skel',t:0,v:1},{id:'voron',t:0,v:.7},{id:'pole_podym',t:30,v:1},{id:'pole_luk',t:70,v:.8},{id:'pole_znam',t:120,v:.5},{id:'kik',t:165,v:.4,g:1}],
   el:[{id:'pole_znam',fx:['tough']},{id:'pole_podym',fx:['fast']},{id:'pole_luk',fx:['shield']}],
   ev:['pole_kurgan'],boss:'pole_polkan'},
  {slot:13,n:3,name:'Логово Змея',sub:'Логово',hook:'Змей Горыныч высиживает яйца на огненном кургане',
   en:{name:"Serpent's Lair",sub:'The Lair',hook:'Zmey Gorynych is hatching eggs on a fiery barrow'},
   w:[{id:'skel',t:0,v:1},{id:'pole_podym',t:0,v:.7},{id:'voron',t:0,v:.5,e:150},{id:'pole_luk',t:40,v:.7},{id:'pole_zmey',t:60,v:.6},{id:'pole_znam',t:100,v:.4},{id:'upyr',t:120,v:.5},{id:'idol',t:165,v:.3}],
   el:[{id:'pole_zmey',fx:['fast']},{id:'pole_znam',fx:['aura','tough']},{id:'idol',fx:['shield']}],
   ev:['pole_ten',{k:'pole_kurgan',t:100}],mb:{id:'pole_polkan',t:150},boss:'gory',bv:'gory_r',nt:1,on:eggs,
   ground:{base:'#a88f55',hi:'#b89f62',lo:'#957d48',grass:'#7a6a3a',flow:['#ffb03a','#e86a2a']},tint:'rgba(255,90,30,.08)',
   decor:['d_bones','d_stone','d_firerock','d_dry','d_bones']}],
 en:{
  pole_podym:{n:'Скелет-подъёмыш',r:12,hp:26,spd:52,dmg:8,xp:2,col:'#9a84c8',beh:'revive',bp:{t:3,hp:.5},en:{n:'Rising Skeleton'},
   lore:{ru:'Упал — полежит, подумает и встанет снова. Добей, пока он думает: думает он медленно.',en:'Falls down, has a think, and gets back up. Finish him while he thinks. He thinks slowly.'},
   ph:{ru:['Я ещё встану!','Бряк… и снова тут!'],en:["I'll be back up!",'Clatter… and back again!']}},
  pole_znam:{n:'Знаменосец',r:13,hp:40,spd:44,dmg:8,xp:3,col:'#c0392b',beh:'aura',bp:{r:140,spd:1.3,reg:.04},en:{n:'Banner Bearer'},
   lore:{ru:'Машет стягом — и всем вокруг бодрее. Без него остальные скисают. Бей первым.',en:'Waves his banner and everyone nearby perks up. Without him the rest lose heart. Hit him first.'},
   ph:{ru:['За мной, кости!','Выше стяг!'],en:['Follow me, bones!','Banner high!']}},
  pole_luk:{n:'Степной лучник',r:12,hp:18,spd:54,dmg:7,xp:2,col:'#c8a060',beh:'pole_luk',en:{n:'Steppe Archer'},
   lore:{ru:'Пускает три стрелы веером и отбегает. Стоять на месте — плохая мысль, подойти вплотную — хорошая.',en:'Looses three arrows in a fan and backs off. Standing still is a bad idea; getting close is a good one.'},
   ph:{ru:['Три стрелы — три дырки!','Лови!'],en:['Three arrows, three holes!','Catch!']}},
  pole_zmey:{n:'Змеёныш',r:11,hp:22,spd:70,dmg:8,xp:2,col:'#7ac85a',beh:'split',bp:{n:2,sc:.62,hp:.4},en:{n:'Serpent Hatchling'},
   lore:{ru:'Три головки, и все голодные. Разрубишь — станет два змеёныша поменьше. Яйца лучше бить заранее.',en:'Three little heads, all hungry. Chop one and you get two smaller ones. Better to smash the eggs early.'},
   ph:{ru:['Пш-ш!','Мама Горыныч!'],en:['Pssh!','Mommy Gorynych!']}},
  pole_yaico:{n:'Змеиное яйцо',r:12,hp:30,spd:0,dmg:0,xp:2,col:'#c8e09a',beh:'pole_egg',en:{n:'Serpent Egg'},
   lore:{ru:'Тёплое, пятнистое и тикает. Три удара — и нет яйца. Не успел — встречай змеёныша.',en:'Warm, spotty and ticking. Three hits and it’s gone. Too slow — say hello to a hatchling.'}}},
 boss:{
  pole_polkan:{n:'Полкан',g:'m',r:34,hp:6800,spd:52,dmg:20,col:'#b07a3a',title:{ru:'Конь-богатырь Дикого поля',en:'Horse-hero of the Wild Field'},en:{n:'Polkan'},
   ph:{ru:['Иго-го! Кто на мою заставу без спросу?','Скачу — не догонишь!','Три стрелы — и все в тебя!','Лучники, ко мне!','Копытом — да по шлему!'],
       en:['Neigh! Who rides to my outpost uninvited?',"I gallop — you'll never catch me!",'Three arrows, all for you!','Archers, to me!','A hoof right on your helmet!']},
   lore:{ru:'Полкан из лубка: наполовину конь, наполовину богатырь. Скачет рывками и стреляет веером.',en:'Polkan from the old folk prints: half horse, half hero. Charges in bursts and shoots arrows in a fan.'},
   kit:{a:[{k:'dash',cd:5,w:.9},{k:'fan',cd:4,n:5,col:'#c8a060'}],
        ph:[{hp:.5,add:[{k:'summon',cd:12,id:'pole_luk',n:3}],sum:{id:'pole_luk',n:3},spd:1.2,say:{ru:'Лучники, ко мне! Залпом!',en:'Archers, to me! Volley!'}}]}},
  gory_r:{base:'gory',rage:1,n:'Горыныч ярый',en:{n:'Gorynych the Furious'},hpK:1.2,title:{ru:'Три головы — три дыхания',en:'Three heads, three breaths'},
   kit:{a:[{k:'tele',cd:10,n:10,col:'#ff7a1a'},{k:'rain',cd:8,col:'#ff7a1a'},{k:'beam',cd:12,col:'#ffb03a'},{k:'ring',cd:9,n:14,ice:1,col:'#9ad8ff'}],
        ph:[{hp:.5,add:[{k:'fan',cd:5,n:7,col:'#ff8a2a'}],sum:{id:'pole_zmey',n:4},say:{ru:'Детушки, вылупляйтесь! Все три головы — в бой!',en:'Hatch, my little ones! All three heads, attack!'}}]}}},
 beh:{
  pole_luk:{on(e){e.sT=rand(1.5,2.5);},
   step(e,dt,G){const H=G.hero,dx=H.x-e.x,dy=H.y-e.y,d=Math.hypot(dx,dy)||1,sp=e.spd*(e.slow>0?.55:1);let mx=dx/d,my=dy/d;
    if(d<170){mx=-mx*.6;my=-my*.6;}else if(d<250){const t=mx;mx=-my*.5;my=t*.5;}
    if((e.sT-=dt)<=0&&d<340){const f=G.soft,q=G.df,a=Math.atan2(dy,dx),v=150*(f?f.shotSpd:1)*(q?q.shotSpd:1),k=(f?f.shot:1)*(q?q.shot:1);
     e.sT=rand(3,3.8)*(f?f.cd:1)*(q?q.cd:1);for(const s of[-.24,0,.24])eShoot(e,a+s,v,'#c8a060',5,e.dmg*.7*k);}
    e.x+=(mx*sp+e.kx)*dt;e.y+=(my*sp+e.ky)*dt;e.kx*=Math.pow(.004,dt);e.ky*=Math.pow(.004,dt);e.face=dx<0?-1:1;return true;},
   warn(e,c){if(!(e.sT<.6))return;const H=G.hero,a=Math.atan2(H.y-e.y,H.x-e.x);c.strokeStyle='rgba(255,200,90,.55)';c.lineWidth=1.5;
    for(const s of[-.24,0,.24]){c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x+Math.cos(a+s)*90,e.y+Math.sin(a+s)*90);c.stroke();}}},
  pole_egg:{on(e){e.spd=0;e.dmg=0;e.hT=20;},hit(e){return e.max*.34+.01;},
   step(e,dt){e.kx=e.ky=0;if((e.hT-=dt)<=0){e.dead=true;burst(e.x,e.y,'#9ad86a',10,140);const z=mkEnemy('pole_zmey',e.x,e.y);say(z,L('Ш-ш-ш!','Hiss!'));}return true;},
   die(e){dropGem(e.x,e.y,2);},
   warn(e,c){const p=Math.max(0,e.hT/20);c.strokeStyle=p<.25?'rgba(255,70,40,.9)':'rgba(255,210,90,.8)';c.lineWidth=3;c.beginPath();c.arc(e.x,e.y,e.r+6,-Math.PI/2,-Math.PI/2+TAU*p);c.stroke();}}},
 evs:{
  pole_kurgan:{t:{ru:'Курганы ожили!',en:'The barrows awaken!'},dur:0,start(G){ring(G,'pole_podym',12,.6);ring(G,'pole_luk',4,.9);}},
  pole_ten:{t:{ru:'Тень Змея над полем!',en:"The Serpent's shadow!"},dur:6.6,start(G){ring(G,'pole_zmey',8,.75);G.poleN=0;},
   step(G,dt,t){if(G.poleN<3&&t>=G.poleN*2.2){G.poleN++;sweep(G);}}}}});
})();

})();}catch(e){console.warn("th pole.js",e);}

/* ---- kosh-art.js ---- */
try{(function(){
/* рисунки темы kosh (T-kosh): мимик, щитоносец, тень, Ворон Воронович, дуб, сундук, заяц, утка */
(function(){
function over(g,col,a){g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(-90,-90,180,180);g.restore();}
function sc(g,k,key,x,y){g.save();g.translate(x||0,y||0);g.scale(k,k);ART[key].fn(g);g.restore();}
art('kosh_mimik',42,g=>{sc(g,1.05,'chest');ell(g,0,-3.4,12.5,3.4,'#5a0e1e',{ol:false,flat:1});
  for(let i=-5;i<=5;i++){const x=i*2.3;poly(g,[x-1.1,-5.6,x+1.1,-5.6,x,-2.6],'#f4eedc',{ol:false,flat:1});poly(g,[x-1.1,-1.2,x+1.1,-1.2,x,-3.8],'#f4eedc',{ol:false,flat:1});}
  ell(g,4,-1.6,3.4,1.4,'#e0506a',{ol:false,flat:1});
  eye(g,-5,-9.5,2.2,{col:'#d0203a',angry:1});eye(g,5,-9.5,2.2,{col:'#d0203a',angry:1,flipB:1});});
art('kosh_shit',58,g=>{sc(g,1,'rycar');over(g,'#cdbf98',.38);
  ell(g,-15,5,10,13,'#8a7a5a',{hl:.3});ell(g,-15,5,6.5,9,'#b8a882',{ol:false});
  ln(g,[-19,1,-11,9],'#f1ebdc',2.2);ln(g,[-11,1,-19,9],'#f1ebdc',2.2);ell(g,-15,5,2.4,2.4,'#f1ebdc',{lw:.6});});
art('kosh_ten',42,g=>{sc(g,1,'prizr');over(g,'#2a1a4a',.62);glow(g,-4,-4,3,'#ff3a5a');glow(g,4,-4,3,'#ff3a5a');});
art('kosh_voron',86,g=>{sc(g,2.2,'voron',0,2);
  for(const a of[-.5,-.15,.2])ln(g,[17,-17,17+Math.cos(a-1.5)*9,-17+Math.sin(a-1.5)*11],'#1e1c2c',3);
  g.beginPath();g.arc(13,-2,8,.6,2.4);g.lineWidth=2.2;g.strokeStyle='#ffd84a';g.stroke();
  ell(g,10,6.5,2.6,2.6,'#ffd84a',{lw:.6});shine(g,-8,-2,7,3,.18);});
art('kosh_dub',84,g=>{sc(g,.76,'d_oak');over(g,'#2a1a3a',.55);
  ln(g,[10,-14,10,4],'#9aa0b0',1.4);sc(g,.5,'chest',10,9);});
art('kosh_sunduk',40,g=>{sc(g,1,'chest');over(g,'#4a4a6a',.55);
  ln(g,[-13,-12,13,10],'#aab0c4',1.6);ln(g,[13,-12,-13,10],'#aab0c4',1.6);
  rrect(g,-3.5,-1,7,7,1.5);g.fillStyle='#c9cfdc';g.fill();outline(g,'#8a90a4',.8);ell(g,0,2.2,1,1.4,'#2a2a3a',{ol:false,flat:1});});
art('kosh_zayac',34,g=>{ln(g,[-6,6,-9,11],'#8a7a66',2.4);ln(g,[5,7,7,11],'#8a7a66',2.4);
  ell(g,-10,1,3,3,'#f4f0e8');ell(g,-2,2,9,6.5,'#a8987e');
  ell(g,5,-11,2,7,'#a8987e',{rot:.25});ell(g,9,-10,2,7,'#a8987e',{rot:.5});ell(g,5.6,-11,.9,4.6,'#e8b0b0',{ol:false,rot:.25});
  ell(g,8,-3,5.5,4.8,'#b0a086');eye(g,9.5,-4.5,1.6,{px:.5});ell(g,13,-2.6,1,.8,'#d07a8a',{ol:false});shine(g,-4,-1,4,1.6,.3);});
art('kosh_utka',34,g=>{ell(g,-2,3,10,6,'#8a6a4a');poly(g,[-11,2,-16,-1,-15,5],'#6a4a32');
  shp(g,'#6a5a46',{},[-8,-12,5,2],()=>{g.moveTo(4,0);g.quadraticCurveTo(-2,-14,-8,-11);g.quadraticCurveTo(-6,-2,4,0);});
  ell(g,8,-4,4.6,4.2,'#2f7a4a');ln(g,[5,0,10,0],'#f4f0e8',1.2);poly(g,[12,-5,17,-3,12,-1.5],'#f0a020',{lw:.6});eye(g,9,-5,1.3,{px:.4});});
})();

})();}catch(e){console.warn("th kosh-art.js",e);}

/* ---- kosh.js ---- */
try{(function(){
/* тема kosh (T-kosh): слоты 14/15. Своё: повадки kosh_mimik, kosh_ten, kosh_igla, kosh_cep; приём kosh_smert. Смерть Кощея ярого: дуб→сундук→заяц→утка→яйцо */
(function(){
const NEXT={kosh_dub:'kosh_sunduk',kosh_sunduk:'kosh_zayac',kosh_zayac:'kosh_utka',kosh_utka:'egg'};
const TIP={kosh_dub:['Смерть Кощеева — на дубу!','Руби дуб!','Koschei’s death is on the oak!','Chop the oak!'],kosh_sunduk:['На дубу — сундук!','Бей!','A chest hangs on the oak!','Smash it!'],
  kosh_zayac:['Из сундука — заяц!','Догоняй!','A hare jumps out of the chest!','Catch it!'],
  kosh_utka:['Из зайца — утка!','Сбивай!','A duck flies out of the hare!','Bring it down!'],
  egg:['Из утки — яйцо!','Разбей яйцо — в нём игла','The duck drops an egg!','Smash it — the needle is inside']};
const HPF={kosh_dub:.06,kosh_sunduk:.05,kosh_zayac:.04,kosh_utka:.04};
function link(G,id,x,y){const k=mkEnemy(id,x,y),b=G.boss;if(id!=='egg'){k.elite=1;if(b)k.hp=k.max=Math.max(k.hp,b.max*HPF[id]);}G.egg=k;G.fx.push({k:'poof',x,y,t:0,dur:.5});
  const t=TIP[id];if(t)banner(L(t[0],t[2]),L(t[1],t[3]),5);return k;}
function wake(e){if(!e.sl)return;e.sl=0;e.bc=.3;say(e,L('Клац-клац!','Snap-snap!'),1.4);burst(e.x,e.y,'#ffd84a',qLow()?4:8,90);}
const dash=()=>BEH.dash;
function klad(G,n,m){const H=G.hero,R=VIEW.R;for(let i=0;i<n;i++){const a=i/n*TAU+rand(-.2,.2),d=R*rand(.38,.55),e=mkEnemy('kosh_mimik',H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);e.sl=1;}
  for(let i=0;i<m;i++){const p=spawnPos();mkEnemy('kosh_shit',p[0],p[1]);}
  banner(L('Клад ожил!','The treasure wakes!'),L('Сундуки кусаются!','The chests bite!'),4);}
function teni(G,n){const H=G.hero,R=VIEW.R;for(let i=0;i<n;i++){const a=i/n*TAU,e=mkEnemy(i%3?'kosh_ten':'prizr',H.x+Math.cos(a)*R*.9,H.y+Math.sin(a)*R*.9);e.shade=1;e.spd*=1.15;e.bc=1.5+i*.3;}
  banner(L('Тени сгустились!','The shadows gather!'),L('Видны лишь вблизи','Visible only up close'),4);}
THEME_ADD({id:'kosh',
  ch:[
    {slot:14,n:2,name:'Кощеева сокровищница',sub:'Набег',hook:'Над златом Кощей чахнет, а сторожит его Ворон Воронович',
      en:{name:"Koschei's Treasury",sub:'The Raid',hook:'Koschei pines over his gold, and Raven Ravenson guards it'},
      w:[{id:'skel',t:0,v:1},{id:'prizr',t:0,v:.7},{id:'kosh_mimik',t:30,v:.6},{id:'kosh_shit',t:70,v:.7},{id:'koldun',t:120,v:.45},{id:'upyr',t:150,v:.4,g:1},{id:'rycar',t:200,v:.3}],
      el:[{id:'koldun',fx:['summon']},{id:'kosh_shit',fx:['tough']},{id:'kosh_mimik',fx:['fast']}],
      ev:['kosh_klad'],
      boss:'kosh_voron'},
    {slot:15,n:3,name:'Смерть Кощеева',sub:'Логово',
      hook:'Смерть Кощея — на конце иглы, игла — в яйце, яйцо — в утке, утка — в зайце, заяц — в сундуке, сундук — на дубу',
      en:{name:"Koschei's Death",sub:'The Lair',hook:"Koschei's death is at the tip of a needle, the needle in an egg, the egg in a duck, the duck in a hare, the hare in a chest, the chest on an oak"},
      w:[{id:'skel',t:0,v:1},{id:'kosh_ten',t:0,v:.7},{id:'prizr',t:0,v:.5,e:150},{id:'kosh_shit',t:35,v:.7},{id:'koldun',t:60,v:.45},{id:'kosh_mimik',t:95,v:.5},{id:'rycar',t:150,v:.4}],
      el:[{id:'kosh_shit',fx:['tough','shield']},{id:'koldun',fx:['summon']},{id:'kosh_ten',fx:['fast']}],
      ev:['kosh_teni',{k:'kosh_klad',t:115}],
      mb:{id:'kosh_voron',t:150},
      boss:'kosh',bv:'kosh_r',dark:1,nt:1}],
  en:{
    kosh_mimik:{n:'Сундук-мимик',r:13,hp:40,spd:40,dmg:10,xp:2,col:'#b06a34',beh:'kosh_mimik',bp:{cd:3.2,warn:.9,spd:3.6,len:220},en:{n:'Mimic Chest'},
      lore:{ru:'Стоит как сундук, а подойдёшь — кусается. Побьёшь — золото на землю.',en:'Looks like a chest, but bites. Beat it, and gold spills out.'},
      ph:{ru:['Клац!','Я не сундук!'],en:['Snap!','I am not a chest!']}},
    kosh_shit:{n:'Костяной щитоносец',r:15,hp:70,spd:38,dmg:12,xp:3,col:'#cdbf98',beh:'shield',bp:{k:.25,turn:1.2},en:{n:'Bone Shieldbearer'},
      lore:{ru:'Страж со щитом. В лоб не возьмёшь — обойди.',en:'A guard with a shield. Go around it.'},
      ph:{ru:['Не пройдёшь!','Бряк!'],en:['You shall not pass!','Clank!']}},
    kosh_ten:{n:'Кощеева тень',r:12,hp:22,spd:62,dmg:10,xp:2,col:'#4a3a7a',fly:1,beh:'kosh_ten',bp:{cd:4,warn:1,spd:4},en:{n:"Koschei's Shade"},
      lore:{ru:'Видна лишь вблизи. Бросок выдаёт красная полоса.',en:'Seen only up close. A red line gives its lunge away.'},
      ph:{ru:['Ш-ш-ш…'],en:['Hsss…']}},
    kosh_dub:{n:'Кощеев дуб',r:24,hp:140,spd:0,dmg:0,xp:4,col:'#5a4a3a',beh:'kosh_cep',en:{n:"Koschei's Oak"},
      lore:{ru:'На дубу сундук, в сундуке — смерть Кощеева.',en:"A chest hangs on it, Koschei's death inside."}},
    kosh_sunduk:{n:'Кованый сундук',r:14,hp:110,spd:0,dmg:0,xp:3,col:'#6a6a8a',beh:'kosh_cep',en:{n:'Iron Chest'},
      lore:{ru:'Окован железом. Внутри шуршит.',en:'Bound in iron. Something rustles inside.'}},
    kosh_zayac:{n:'Заяц',r:10,hp:45,spd:150,dmg:0,xp:3,col:'#a8987e',beh:'kosh_cep',en:{n:'Hare'},
      lore:{ru:'Удирает. Догони — в нём утка.',en:'Runs away. Catch it — a duck is inside.'}},
    kosh_utka:{n:'Утка',r:10,hp:40,spd:120,dmg:0,xp:3,col:'#2f7a4a',fly:1,beh:'kosh_cep',en:{n:'Duck'},
      lore:{ru:'Кружит. Сбей — в ней яйцо.',en:'Circles around. Knock it down — the egg is inside.'}}},
  boss:{
    kosh_voron:{n:'Ворон Воронович',r:30,hp:8800,spd:58,dmg:20,col:'#2a2838',fly:1,mini:.35,
      title:{ru:'Сторож Кощеева злата',en:"Keeper of Koschei's Gold"},en:{n:'Raven Ravenson'},
      ph:{ru:['Кар-р! Кто к Кощееву злату?','Заклюю!'],
          en:["Caw! Who comes for Koschei's gold?",'I will peck you!']},
      lore:{ru:'Ворон Кощея с золотой цепью. Зовёт стаю, пикирует.',en:"Koschei's raven with a golden chain. Calls his flock and dives."},
      kit:{a:[{k:'dash',cd:5,sp:540},{k:'summon',cd:9,id:'voron',n:5,say:{ru:'Вороньё, ко мне!',en:'Ravens, to me!'}},{k:'fan',cd:6,n:5,col:'#5a4a8a'}],
           ph:[{hp:.5,add:[{k:'rain',cd:8,n:7,col:'#5a4a8a'}],sum:{id:'voron',n:6},say:{ru:'Перья — дождём!',en:'A rain of feathers!'}}]}},
    kosh_r:{base:'kosh',rage:1,n:'Кощей ярый',en:{n:'Koschei the Furious'},hpK:1.1,
      title:{ru:'Смерть его — на конце иглы',en:'His death is at a needle’s tip'},
      kit:{a:[{k:'kosh_smert',cd:.4},{k:'ring',cd:6,n:16,col:'#5cff9a'},{k:'zones',cd:8,n:4,r:50,col:'#ffd84a'},{k:'tele',cd:9,n:10}],
           ph:[{hp:.6,add:[{k:'summon',cd:12,id:'kosh_shit',n:4}],say:{ru:'Злато моё, сторожа, ко мне!',en:'Guards, protect my gold!'}},
               {hp:.3,add:[{k:'ring',cd:4,n:20,col:'#5cff9a'}],sum:{id:'kosh_ten',n:6},say:{ru:'Иголочку мою сломать? Не бывать!',en:'Break my needle? Never!'}}]}}},
  beh:{
    kosh_mimik:{on(e,G){dash().on(e,G);},
      step(e,dt,G){if(e.sl){const H=G.hero;if(e.hp<e.max||(H.x-e.x)**2+(H.y-e.y)**2<120*120)wake(e);else return bzStay(e,dt);}return dash().step(e,dt,G);},
      die(e,G){for(let i=0;i<3;i++)drop('coin',e.x+rand(-14,14),e.y+rand(-14,14),randi(2,4));}},
    kosh_ten:{on(e,G){e.shade=1;dash().on(e,G);},step(e,dt,G){return dash().step(e,dt,G);}},
    kosh_igla:{hit(e,d,G){if(e.phase!==0||e.hp-d>0)return d;e.hp=1;e.invul=true;e.phase=1;e.kch=1;G.shake=8;const H=G.hero,a=rand(0,TAU);
      say(e,L('Смерть моя далеко — не найдёшь!','My death is far away — you won’t find it!'),3);link(G,'kosh_dub',H.x+Math.cos(a)*300,H.y+Math.sin(a)*300);return 0;}},
    kosh_cep:{on(e){e.ax=e.x;e.ay=e.y;e.an=rand(0,TAU);e.zt=0;},
      step(e,dt,G){const H=G.hero,hs=(G.st&&G.st.spd||118)*.72;e.zt+=dt;
        if(e.type==='kosh_zayac'){const dx=e.x-H.x,dy=e.y-H.y,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx)+Math.sin(e.zt*2.6)*.7,
            sp=(d<320?hs:d<440?hs*.25:-hs*.5)*(.55+.9*Math.abs(Math.sin(e.zt*5)));return bzMv(e,Math.cos(a),Math.sin(a),sp,dt,1);}
        if(e.type==='kosh_utka'){const dx=e.ax-H.x,dy=e.ay-H.y,d=Math.hypot(dx,dy)||1;if(d<220){e.ax+=dx/d*30*dt;e.ay+=dy/d*30*dt;}
          e.an+=dt*1.1;const x=e.ax+Math.cos(e.an)*110,y=e.ay+Math.sin(e.an)*110;e.face=Math.sin(e.an)>0?-1:1;e.x=x+e.kx*.02;e.y=y+e.ky*.02;e.kx*=.9;e.ky*=.9;return true;}
        return bzStay(e,dt);},
      die(e,G){e.elite=0;const n=NEXT[e.type];if(n)link(G,n,e.x,e.y);}}},
  bk:{
    kosh_smert:{pass:1,start(b,G){const g=G.egg;if(!b.beh)b.beh='kosh_igla'; /* hit ловит смерть раньше яйца; ниже — запас */
      if(b.phase===1&&!b.kch&&g&&g.type==='egg'&&!g.dead){b.kch=1;g.dead=true;link(G,'kosh_dub',g.x,g.y);}},
      step(){return true;}}},
  evs:{
    kosh_klad:{dur:0,start(G){klad(G,9,6);}},
    kosh_teni:{dur:0,start(G){teni(G,27);}}}
});
})();

})();}catch(e){console.warn("th kosh.js",e);}

/* ---- med-art.js ---- */
try{(function(){
/* рисунки темы med «Медной горы царство» (T-med, A34): только art()/artTint() из js/art.js; помощники — внутри (function(){…})(). Все смотрят вправо */
(function(){
const MAL='#2f9a62',MALD='#1f6a46',CU='#d8843a',CUL='#f0b070';
// малахитовые прожилки (волнистые полосы) поверх уже нарисованной формы
function veins(g,x,y,w,n,col,gp){gp=gp||4;g.save();g.globalCompositeOperation='source-atop';g.strokeStyle=col||MALD;g.lineWidth=1.3;
  for(let i=0;i<n;i++){const yy=y+i*gp;g.beginPath();g.moveTo(x-w,yy);g.bezierCurveTo(x-w/3,yy-4,x+w/3,yy+4,x+w,yy-1);g.stroke();}g.restore();}
function gm(g,x,y,s,col){g.save();g.translate(x,y);glow(g,0,0,s*2,col);gem(g,s,col);g.restore();}
// Ящерка-самоцветка: зелёная ящерка с самоцветами на спине
art('med_yash',38,g=>{ln(g,[-6,3,-13,6,-17,2,-15,-3],'#2a7a4a',3.2);
  for(const [x,s] of[[-5,1],[5,1]]){ln(g,[x,4,x-3,10],'#2a7a4a',2.2);ln(g,[x+2,4,x+4,10],'#2a7a4a',2.2);}
  ell(g,0,2,9,5,'#3fbf7f');ell(g,10,-1,5.5,4,'#3fbf7f');ell(g,1,4,6,2,'#9ae0b0',{ol:false});
  eye(g,11.5,-2.5,1.7,{white:'#ffe14a',col:'#1a2a10',px:.4});gm(g,-3,-2.6,1.8,'#7ae0ff');gm(g,2.5,-3,1.6,'#ff6a8a');shine(g,-2,-1,4,1.4,.35);});
// Каменный глыбник: валун с малахитовыми жилами и кулаками-камнями
art('med_glyb',48,g=>{ell(g,-14,8,6,5,'#6a7068');ell(g,15,7,6,5,'#6a7068');
  poly(g,[-14,-6,-8,-16,6,-17,15,-7,15,10,6,17,-9,17,-15,9],'#7a8078',{hl:.35});veins(g,0,-9,15,3,'#3a9a6a',7);
  ell(g,-6,9,2.2,1.6,CU,{ol:false});ell(g,7,12,1.8,1.3,CUL,{ol:false});
  ell(g,-4.5,-6,2.8,2,'#1a1a14',{ol:false,flat:true});ell(g,4.5,-6,2.8,2,'#1a1a14',{ol:false,flat:true});glow(g,-4.5,-6,4,'#ffa040');glow(g,4.5,-6,4,'#ffa040');
  ln(g,[-8,-10,-2,-8],'#3a3a34',2);ln(g,[8,-10,2,-8],'#3a3a34',2);ln(g,[-4,1,4,1],'#3a3a34',1.6);shine(g,-7,-12,5,2,.3);});
// Чудь белоглазая: маленький рудокоп в капюшоне, глаза-фонарики, кирка
function chud(g){ln(g,[6,4,15,-12],'#6a4422',2.2);poly(g,[9,-15,15,-12,21,-15,15,-11],CU,{lw:.8});
  ell(g,-4,15,3.5,2,'#3a2a1a');ell(g,4,15,3.5,2,'#3a2a1a');
  shp(g,'#6a5a46',{},[-11,-14,11,15],()=>{g.moveTo(0,-14);g.quadraticCurveTo(11,-12,11,14);g.quadraticCurveTo(0,17,-11,14);g.quadraticCurveTo(-11,-12,0,-14);});
  ell(g,0,-4,6.5,6,'#d8d2c0');ell(g,8,3,3,3,'#d8d2c0');
  for(const x of[-2.5,2.5]){glow(g,x,-5,4,'#e8fff8');ell(g,x,-5,1.8,2,'#ffffff',{ol:false,flat:true});}
  ln(g,[-6,-11,0,-14,6,-11],'#4a3e30',1.4);}
art('med_chud',42,chud);
// Медная змейка: изгиб буквой S
art('med_zmei',32,g=>{g.lineCap='round';ln(g,[-14,6,-8,1,-2,6,4,2,9,-3],'#6a3a14',6.4);ln(g,[-14,6,-8,1,-2,6,4,2,9,-3],CU,4.6);ln(g,[-12,5,-8,2.5,-2,5],CUL,1.2);
  ell(g,11,-4,4.6,3.6,CU);ln(g,[15,-4,18,-4,19,-5.5],'#e03a3a',.9);eye(g,12,-5.4,1.4,{white:'#ffe14a',px:.3});});
// Рудничный упырь — перекраска упыря в зелень
artTint('med_upyr','upyr','#4a8a6a');
// Самоцветный жук: панцирь-самоцвет
art('med_zhuk',32,g=>{for(const y of[-4,1,6]){ln(g,[-3,y,-10,y+3],'#1a1a24',1.6);ln(g,[3,y,10,y+3],'#1a1a24',1.6);}
  ell(g,0,-9,4.5,3.6,'#2a2a3a');ln(g,[-2,-11,-5,-15],'#2a2a3a',1);ln(g,[2,-11,5,-15],'#2a2a3a',1);
  ell(g,0,2,8,9.5,'#3a2a5a');poly(g,[0,-6,7,0,4,9,-4,9,-7,0],'#4ad0c8',{hl:.8});ln(g,[0,-6,0,9],'rgba(255,255,255,.5)',1);
  eye(g,-2,-10,1.2,{px:0});eye(g,2,-10,1.2,{px:0});shine(g,-3,-1,2.5,1.2,.6);});
// Чудь-старшина: большой чудь с бородой и медной каской-фонарём
art('med_chst',86,g=>{g.save();g.scale(1.9,1.9);chud(g);g.restore();
  shp(g,'#eeeae0',{},[-10,0,10,22],()=>{g.moveTo(-10,0);g.quadraticCurveTo(-8,16,0,22);g.quadraticCurveTo(8,16,10,0);g.quadraticCurveTo(0,6,-10,0);});
  shp(g,CU,{},[-14,-31,14,-18],()=>{g.moveTo(-14,-18);g.quadraticCurveTo(-13,-31,0,-31);g.quadraticCurveTo(13,-31,14,-18);g.closePath();});
  glow(g,0,-27,10,'#ffe48a');ell(g,0,-27,3,3,'#fff6c8',{ol:false});});
// Великий Полоз: голова в золотой короне над кольцом тела
art('med_poloz',104,g=>{ell(g,-6,26,30,14,'#a8661e');ell(g,-6,24,22,8,'#c88a3a',{ol:false});veins(g,-6,20,30,3,'#7a4a12');
  shp(g,'#c88a3a',{},[-14,-30,12,26],()=>{g.moveTo(-14,26);g.quadraticCurveTo(-18,-2,-2,-18);g.lineTo(12,-12);g.quadraticCurveTo(0,0,8,26);g.closePath();});
  shp(g,'#f0d8a0',{ol:false},[-6,-14,4,26],()=>{g.moveTo(-6,26);g.quadraticCurveTo(-10,0,2,-14);g.lineTo(5,-11);g.quadraticCurveTo(-4,4,2,26);g.closePath();});
  ell(g,8,-24,20,13,'#d8963a',{rot:.15});ell(g,22,-19,9,6,'#d8963a',{rot:.3});ln(g,[24,-15,34,-14,36,-17],'#e03a3a',1.4);
  mouth(g,22,-16,7,'#4a1a0a',0);fangs(g,23,-16,1.4);
  eye(g,10,-29,3.4,{white:'#ffe14a',col:'#1a1a0a',px:1.2,angry:1,flipB:1});
  poly(g,[-6,-34,-8,-46,-2,-39,3,-49,8,-39,14,-45,13,-33],'#ffd84a',{hl:.6});for(const x of[-2,3,9])gm(g,x,-38,1.8,'#3fdf8f');shine(g,2,-30,7,2.6,.35);});
// хвост Полоза — звено
art('med_hvost',52,g=>{ell(g,0,0,20,17,'#c88a3a');ell(g,0,4,13,9,'#f0d8a0',{ol:false});veins(g,0,-9,20,3,'#8a5a1a',6);
  for(const x of[-9,0,9])poly(g,[x-3,-14,x,-20,x+3,-14],MAL,{lw:.6});shine(g,-6,-7,6,2.4,.35);});
// Хозяйка Медной горы: малахитовое платье, коса, кокошник с самоцветами
art('med_hoz',112,g=>{
  shp(g,MAL,{},[-30,-18,30,50],()=>{g.moveTo(-9,-18);g.lineTo(9,-18);g.quadraticCurveTo(20,14,30,48);g.quadraticCurveTo(0,54,-30,48);g.quadraticCurveTo(-20,14,-9,-18);});
  veins(g,0,-10,30,7,MALD,8.5);ln(g,[-28,44,28,44],CU,2.2);ln(g,[0,-18,0,48],'rgba(240,176,112,.7)',1.6);
  ln(g,[-9,-36,-17,-10,-15,16,-19,34],'#3a2414',6.4);ln(g,[-9,-36,-17,-10,-15,16,-19,34],'#5a3a20',4.2);
  for(const y of[-14,0,14])ln(g,[-19,y,-13,y+3],'#2a180c',1.4);poly(g,[-19,34,-24,42,-14,40],'#e04a5a');
  ln(g,[8,-14,18,4,24,0],MAL,6.4);ln(g,[-8,-14,-16,4],MAL,6.4);ell(g,24,0,3.2,3,'#f2d2b4');ell(g,-16,5,3.2,3,'#f2d2b4');
  ell(g,0,-28,10,11.5,'#f2d2b4');eye(g,-3.6,-29,2.2,{col:'#1a7a4a',px:.2});eye(g,3.6,-29,2.2,{col:'#1a7a4a',px:.2});mouth(g,0,-22,2.6,'#b0404a',1);
  ell(g,-6,-25,2,1.2,'rgba(240,120,120,.4)',{ol:false,flat:true});ell(g,6,-25,2,1.2,'rgba(240,120,120,.4)',{ol:false,flat:true});
  shp(g,MAL,{},[-14,-54,14,-36],()=>{g.moveTo(-13,-36);g.quadraticCurveTo(-15,-52,0,-54);g.quadraticCurveTo(15,-52,13,-36);g.quadraticCurveTo(0,-41,-13,-36);});
  ln(g,[-13,-37,0,-42,13,-37],CUL,1.6);gm(g,0,-47,3.2,'#ff5a7a');gm(g,-7,-43,2,'#7ae0ff');gm(g,7,-43,2,'#7ae0ff');gm(g,0,-6,2.4,'#3fdf8f');shine(g,-12,10,6,3,.25);});
// Каменный цветок (фаза Хозяйки)
art('med_cvet',64,g=>{ln(g,[0,26,0,6],MALD,3);ell(g,-7,18,6,2.6,MAL,{rot:-.5});ell(g,7,16,6,2.6,MAL,{rot:.5});
  for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.45;ell(g,Math.cos(a)*12,Math.sin(a)*12+2,5,11,i%2?'#3fbf7f':'#2f9a62',{rot:a+Math.PI/2});}
  veins(g,0,-12,20,3,'#1f6a46',7);gm(g,0,0,4.4,'#ffe48a');});
// декор: малахит, медная руда, кристаллы, сталагмит, крепь с фонарём
art('med_d1',44,g=>{ell(g,3,8,16,6,'rgba(0,0,0,.2)',{ol:false,flat:true});poly(g,[-15,8,-11,-6,-1,-11,10,-7,15,8],MAL,{hl:.5});veins(g,0,-7,15,4,MALD);shine(g,-6,-5,4,1.6,.4);});
art('med_d2',42,g=>{ell(g,3,7,15,6,'rgba(0,0,0,.2)',{ol:false,flat:true});ell(g,-2,1,12,9,'#5a5a5e');ell(g,7,4,8,6,'#66666a');
  for(const [x,y,s] of[[-5,-1,2.6],[2,3,2],[8,2,1.8],[-1,-5,1.5]])ell(g,x,y,s,s*.8,CU,{hl:.8});shine(g,-6,-4,4,1.6,.3);});
art('med_d3',48,g=>{glow(g,0,2,22,'#3fdf8f');poly(g,[-4,14,-9,-2,-4,-17,1,-3,0,14],'#2fbf7f',{hl:.7});poly(g,[2,14,4,-7,10,-13,12,3,8,14],'#5ae0a8',{hl:.7});poly(g,[-12,14,-15,4,-9,6],'#7ae0ff',{hl:.7});});
art('med_d4',44,g=>{ell(g,0,16,11,4,'rgba(0,0,0,.2)',{ol:false,flat:true});poly(g,[-9,16,-3,-18,0,-20,4,-12,9,16],'#6a5e50',{hl:.4});ln(g,[-3,6,3,4],CU,1.4);poly(g,[8,16,12,2,15,16],'#5a5044');});
art('med_d5',52,g=>{ln(g,[-14,20,-14,-14],'#5a3a1e',4.4);ln(g,[14,20,14,-14],'#5a3a1e',4.4);ln(g,[-18,-14,18,-14],'#6a4422',5);
  ln(g,[4,-14,4,-6],'#2a2a2a',1);glow(g,4,-1,10,'#ffc84a');ell(g,4,-1,3,4,'#ffe48a',{lw:.8});});
})();

})();}catch(e){console.warn("th med-art.js",e);}

/* ---- med.js ---- */
try{(function(){
/* тема med «Медной горы царство» (T-med, A34): главы 1 «Малахитовые штольни» (16), 2 «Тропа Полоза» (17), 3 «Каменный цветок» (18). Формат — ENGINE-API.md §3/§10/§13.
   Повадки/AFX/приёмы — из js/beh.js и js/bk.js по именам; свои: повадки med_glyb (щит+дробление), med_seg (звено хвоста Полоза), приёмы med_tail (хвост), med_yashD (рывок ящеркой), med_cvet (каменный цветок = гнёзда BK.nest с рисунком цветка). */
(function(){
// обвал: глыбы падают сверху (тень-круг ≥1 с, потом удар), каждая третья — в богатыря; на старте — n нечисти кольцом
function ring(G,n,ids){const H=G.hero,R=VIEW.R;for(let i=0;i<n;i++){const a=i/n*TAU+rand(-.2,.2),d=R*rand(.6,.85);mkEnemy(ids[i%ids.length],H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);}}
function rocks(G,dt,gap){if((G.medO=(G.medO||0)-dt)>0)return;G.medO=gap;G.medI=(G.medI||0)+1;const H=G.hero,aim=G.medI%3===0,x=H.x+(aim?rand(-20,20):rand(-240,240)),y=H.y+(aim?rand(-20,20):rand(-200,200));
  bzZ({k:'lob',x,y,r:46,t:1.1,sx:x+rand(-30,30),sy:y-340,fn:bzHitZ,dmg:13*G.ch.dmg*(G.emD||1),src:'med_glyb',pc:'#8a8078'});}
function hide(e,h){if(h===e.hid)return;e.hid=h;e.sc=h?.01:e.sc0;e.dmg=h?0:e.dmg0;e.invul=h;}
THEME_ADD({id:'med',
  th:{name:'Медной горы царство',sub:'Малахит светится, медь звенит',en:{name:'Copper Mountain Realm',sub:'Malachite glows, copper rings'},
    ground:{base:'#2a3832',hi:'#34463c',lo:'#222e29',grass:'#3f8a62',flow:['#3fdf8f','#e0904a','#7ae0ff']},
    decor:['med_d1','med_d2','med_d3','med_d4','med_d5'],tint:'rgba(20,70,45,.16)',dark:1,map:[.27,.58],mc:'#2f9a62',ev:'med_obval'},
  ch:[
    {slot:16,n:1,name:'Малахитовые штольни',sub:'Где чудь стучит кирками',
      en:{name:'Malachite Mines',sub:'Where the Chud tap their picks'},
      w:[{id:'med_yash',t:0,v:1},{id:'med_glyb',t:35,v:.8},{id:'med_chud',t:95,v:.9},{id:'prizr',t:165,v:.35,g:1}],
      el:[{id:'med_glyb',fx:['tough']},{id:'med_chud',fx:['fast']}],
      ev:['med_obval'],boss:'med_chst'},
    {slot:17,n:2,name:'Тропа Полоза',sub:'Где прополз Полоз — там золото',
      en:{name:"Great Serpent's Path",sub:'Where the Serpent crawled, gold remains'},
      w:[{id:'med_yash',t:0,v:1},{id:'med_glyb',t:0,v:.5},{id:'med_upyr',t:35,v:1},{id:'med_zmei',t:95,v:1},{id:'med_chud',t:165,v:.6}],
      el:[{id:'med_upyr',fx:['tough']},{id:'med_glyb',fx:['shield']},{id:'med_zmei',fx:['fast']}],
      ev:['med_obval2'],boss:'med_poloz'},
    {slot:18,n:3,name:'Каменный цветок',sub:'Логово Хозяйки Медной горы',
      hook:'Хозяйка Медной горы стережёт каменный цветок — подойди, коли не боишься',
      en:{name:'The Stone Flower',sub:'Lair of the Mistress of Copper Mountain',hook:'The Mistress of Copper Mountain guards the stone flower — come closer, if you dare'},
      w:[{id:'med_chud',t:0,v:1},{id:'med_yash',t:0,v:.7},{id:'med_zmei',t:35,v:.8},{id:'med_zhuk',t:35,v:.5},{id:'med_upyr',t:95,v:.8},{id:'med_glyb',t:95,v:.7}],
      el:[{id:'med_glyb',fx:['tough','shield']},{id:'med_upyr',fx:['vamp']},{id:'med_chud',fx:['summon']}],
      ev:['med_obval2',{k:'med_klad',t:100}],mb:{id:'med_chst',t:150},
      boss:'med_hoz',dark:1,nt:1}],
  en:{
    med_yash:{n:'Ящерка-самоцветка',r:10,hp:14,spd:70,dmg:7,xp:1,col:'#3fbf7f',beh:'burrow',bp:{cd:5,warn:1,r:44},en:{n:'Gem Lizard'},
      lore:{ru:'Слуга Хозяйки. Ныряет в камень, как в воду, и выскакивает под ногами. Самоцветы на спине — для красоты.',en:'The Mistress’s servant. Dives into stone like water and pops up under your feet. The gems on its back are just for show.'},
      ph:{ru:['Шмыг!','Из камня — прыг!'],en:['Zip!','Out of the rock!']}},
    med_glyb:{n:'Каменный глыбник',r:15,hp:60,spd:34,dmg:11,xp:3,col:'#7a8078',beh:'med_glyb',bp:{k:.3,turn:1.2,n:2,sc:.6,hp:.4},en:{n:'Boulder Brute'},
      lore:{ru:'Валун с кулаками. В лоб его не возьмёшь — заходи сбоку. Разбил — рассыпается на два камешка поменьше.',en:'A boulder with fists. Head-on it shrugs off blows — go round the side. Smash it and it crumbles into two smaller pebbles.'},
      ph:{ru:['Бум!','Камнем стою!'],en:['Boom!','Solid as rock!']}},
    med_chud:{n:'Чудь белоглазая',r:12,hp:26,spd:44,dmg:8,xp:2,col:'#d8d2c0',beh:'lob',bp:{cd:3.4,warn:1,r:40},en:{n:'White-eyed Chud'},
      lore:{ru:'Подземный рудокоп с глазами-фонариками. Света не любит, гостей тоже: кидается кирками издалека.',en:'An underground miner with lantern eyes. Dislikes daylight and guests alike — throws picks from afar.'},
      ph:{ru:['Тук-тук!','Не ходи в штольню!'],en:['Tap-tap!','Stay out of the mine!']}},
    med_upyr:{n:'Рудничный упырь',r:12,hp:30,spd:62,dmg:8,xp:2,col:'#4a8a6a',beh:'latch',bp:{cd:3},en:{n:'Mine Ghoul'},
      lore:{ru:'Цепляется к богатырю и тянет силы. Стряхнуть просто — беги без оглядки.',en:'Clings to the hero and drains strength. Easy to shake off — just run.'}},
    med_zmei:{n:'Медная змейка',r:9,hp:10,spd:90,dmg:5,xp:1,col:'#d8843a',beh:'orbit',bp:{R:200,shrink:14},en:{n:'Copper Snakelet'},
      lore:{ru:'Детки Полоза. Водят хоровод вокруг богатыря и сжимают кольцо — прорывайся, пока не поздно.',en:'The Serpent’s little ones. They circle the hero and tighten the ring — break out while you can.'},
      ph:{ru:['Ш-ш-ш!'],en:['Hiss!']}},
    med_zhuk:{n:'Самоцветный жук',r:9,hp:18,spd:96,dmg:0,xp:2,col:'#4ad0c8',beh:'thief',bp:{n:4,mul:2},en:{n:'Gem Beetle'},
      lore:{ru:'Не кусается, зато ворует самоцветы прямо из-под носа. Догонишь — отдаст вдвое.',en:'Never bites, but steals gems right under your nose. Catch it and it pays back double.'},
      ph:{ru:['Моё!','Чур, не отдам!'],en:['Mine!','Finders keepers!']}},
    med_hvost:{n:'Хвост Полоза',r:16,hp:1e6,spd:0,dmg:12,xp:0,col:'#c88a3a',beh:'med_seg',en:{n:"Serpent's Tail"},
      lore:{ru:'Чешуя крепкая: удар по хвосту отзывается Полозу лишь слегка. Бей в голову!',en:'Tough scales: a blow to the tail barely reaches the Serpent. Strike the head!'}}},
  boss:{
    med_chst:{n:'Чудь-старшина',r:30,hp:9000,spd:46,dmg:22,col:'#d8d2c0',
      title:{ru:'Старший над штольнями',en:'Elder of the Mines'},en:{n:'Chud Elder'},
      ph:{ru:['Кто в наши штольни без фонаря?','Кирка — не игрушка!','Чудь, за мной!','Под землю тебя спрячу!'],
          en:['Who enters our mines without a lantern?','A pick is no toy!','Chud, follow me!','I’ll hide you underground!']},
      lore:{ru:'Самый старый чудь: борода до пояса, на каске — фонарь. Носится по штольням и мечет кирки веером.',en:'The oldest Chud, with a beard to his belt and a lantern on his helmet. Charges through the mines and throws picks in a fan.'},
      kit:{a:[{k:'dash',cd:5,col:'#d8843a'},{k:'fan',cd:6,n:3,arc:.6,col:'#d8843a'}],
           ph:[{hp:.5,add:[{k:'summon',cd:9,id:'med_chud',n:3}],say:{ru:'Чудь, на подмогу!',en:'Chud, to my aid!'}}]}},
    med_poloz:{n:'Великий Полоз',r:34,hp:10000,spd:52,dmg:24,col:'#d8963a',
      title:{ru:'Хранитель золотых жил',en:'Keeper of the Gold Veins'},en:{n:'The Great Serpent Poloz'},
      ph:{ru:['Ш-ш-ш… кто топчет мою тропу?','Где я прополз — там золото!','Под землю нырну — не сыщешь!','Детки, в хоровод!','Кольцом обовьюсь!'],
          en:['Hiss… who treads my path?','Where I crawl, gold remains!','I dive underground — you won’t find me!','Little ones, circle him!','I’ll coil around you!']},
      lore:{ru:'Огромный змей в золотой короне. Где проползёт — остаются золотые жилы. Хвост длинный, но бить надо в голову.',en:'A huge serpent in a golden crown; gold veins appear where he crawls. His tail is long, but strike the head.'},
      kit:{a:[{k:'med_tail',cd:2,n:8},{k:'burrow',cd:9,r:74},{k:'dash',cd:6,col:'#e0b060'}],
           ph:[{hp:.5,add:[{k:'ring',cd:7,n:14,col:'#ffd84a'}],sum:{id:'med_zmei',n:6},say:{ru:'Детки, в хоровод!',en:'Little ones, circle him!'}}]}},
    med_hoz:{n:'Хозяйка Медной горы',g:'f',r:34,hp:11000,spd:46,dmg:24,col:'#3fbf7f',eye:[.85,0,.12],
      title:{ru:'Владычица малахита',en:'Lady of Malachite'},en:{n:'Mistress of Copper Mountain'},
      ph:{ru:['Ну что, мастер, поглядел на мою каменную красоту?','Стенами малахитовыми обнесу!','Ящеркой обернусь — не поймаешь!','Каменный цветок не всякому даётся!','Медь звенит — гостя дразнит!'],
          en:['Well, master, have you seen my stone beauty?','I’ll wall you in with malachite!','I turn into a lizard — you won’t catch me!','The stone flower is not for everyone!','Copper rings to tease a guest!']},
      lore:{ru:'Хозяйка подземных богатств: малахитовое платье, коса до пят. Строит малахитовые стены, оборачивается ящеркой, а прячется в каменном цветке.',en:'Mistress of underground treasures, in a malachite dress with a braid to her heels. Raises malachite walls, turns into a lizard and hides in the stone flower.'},
      kit:{a:[{k:'wall',cd:9,n:3,col:'#2f9a62'},{k:'med_yashD',cd:5,col:'#3fbf7f'},{k:'summon',cd:12,id:'med_yash',n:4}],
           ph:[{hp:.5,add:[{k:'ring',cd:6,n:14,col:'#3fdf8f'},{k:'med_cvet',cd:16,n:3,col:'#3fdf8f'}],rm:'summon',
             say:{ru:'Расцветай, каменный цветок!',en:'Bloom, stone flower!'}}]}}},
  beh:{
    // Каменный глыбник: щит спереди (BEH.shield) + дробится при гибели (BEH.split)
    med_glyb:{on(e){BEH.split.on(e);const a=e.bp;BEH.shield.on(e);e.bp=Object.assign(a,e.bp);},
      step:(e,dt)=>BEH.shield.step(e,dt),hit:(e,d)=>BEH.shield.hit(e,d),die:e=>BEH.split.die(e),warn:(e,c)=>BEH.shield.warn(e,c)},
    // звено хвоста Полоза: идёт по следу головы; удар по звену — 10 % урона голове (звеньев 8, по площади — до 80 %) (добить можно только в голову); голова под землёй — хвост тоже
    med_seg:{on(e){e.fly=1;e.xp=0;},
      step(e,dt){const b=e.lead;if(!b||b.dead){e.dead=true;return true;}const h=b.mh||(b.mh=[]);
        if(e.si===0){const p=h[0];if(!p||Math.hypot(b.x-p[0],b.y-p[1])>5){h.unshift([b.x,b.y]);if(h.length>80)h.pop();}}
        const p=h[Math.min(h.length-1,(e.si+1)*6)];if(p){e.x=p[0];e.y=p[1];e.face=b.face;}e.kx=e.ky=0;hide(e,b.sc<.5||!!b.invul);return true;},
      hit(e,d){const b=e.lead,k=d*.1;if(b&&!b.dead&&!b.invul){b.hp=Math.max(1,b.hp-k);b.flash=.06;}return k;}}},
  bk:{
    // хвост: один раз (и заново, если звенья пропали) — n звеньев за головой
    med_tail:{pass:1,start(b,G,a){if(b.mt&&b.mt.some(e=>!e.dead))return;b.mt=[];b.mh=[];const n=Math.min(a.n||8,12);
        for(let i=0;i<n;i++){const e=mkEnemy('med_hvost',b.x,b.y);e.lead=b;e.si=i;e.sc0=e.sc=1-i*.05;e.r*=e.sc;e.dmg0=e.dmg=b.dmg*.5;e.hid=0;b.mt.push(e);}},
      step(){return true;}},
    // рывок ящеркой: прицел как у BK.dash, на самом рывке Хозяйка — большая ящерка
    med_yashD:{x:1,start(b,G,a){say(b,L('Ящеркой обернусь!','I turn into a lizard!'),1.2);BK.dash.start(b,G,a);},
      step(b,dt,G,a){const m=b.bk.m,r=BK.dash.step(b,dt,G,a);if(m.st==='go'&&!m.lz){m.lz=b.sc;b.sc=.01;G.fx.push({k:'poof',x:b.x,y:b.y,t:0,dur:.4});}
        if(r&&m.lz){b.sc=m.lz;m.lz=0;G.fx.push({k:'poof',x:b.x,y:b.y,t:0,dur:.4});}return r;},
      draw(c,b,G,a){const m=b.bk.m;if(m.lz){drawSpr('med_yash',b.x,b.y,b.face*2.6,2.6);worldT();}else BK.dash.draw(c,b,G,a);}},
    // каменный цветок: гнёзда BK.nest (Хозяйка в одном, неуязвима; цветок разбит — ей урон), над каждым — цветок
    med_cvet:{x:1,inv:1,start(b,G,a){BK.nest.start(b,G,a);const i=G.en.indexOf(b);if(i>=0){G.en.splice(i,1);G.en.push(b);}}, /* босс — в конец списка: цветы рисуются поверх гнёзд */
      step:(b,dt,G,a)=>BK.nest.step(b,dt,G,a),
      draw(c,b,G,a){BK.nest.draw(c,b,G,a);worldT();for(const e of G.en)if(!e.dead&&e.nest&&e.bkB===b&&onScreen(e,60))drawSpr('med_cvet',e.x,e.y-14,1.25,1.25);worldT();}}},
  evs:{
    med_obval:{t:{ru:'Обвал! Береги голову!',en:'Rockfall! Mind your head!'},dur:8,
      start(G){G.medO=0;ring(G,20,['med_yash','med_yash','med_glyb'])},step(G,dt){rocks(G,dt,.5)}},
    med_obval2:{t:{ru:'Гора гудит — обвал!',en:'The mountain rumbles — rockfall!'},dur:10,
      start(G){G.medO=0;ring(G,22,['med_yash','med_upyr','med_zmei'])},step(G,dt){rocks(G,dt,.4)}},
    med_klad:{t:{ru:'Самоцветная россыпь! Жуки уже тут как тут',en:'A scatter of gems! The beetles are already here'},dur:1,
      start(G){const H=G.hero;for(let i=0;i<24;i++){const a=rand(0,TAU),d=rand(90,260);dropGem(H.x+Math.cos(a)*d,H.y+Math.sin(a)*d,3);}ring(G,5,['med_zhuk'])},step(){}}}
});
})();

})();}catch(e){console.warn("th med.js",e);}

/* ---- gory-art.js ---- */
try{(function(){
/* рисунки темы gory («Студёные горы», T-gory): только art()/artTint() из js/art.js; помощники — внутри (function(){…})() */
(function(){
function over(g,col,a){g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(-70,-70,140,140);g.restore();}
function icl(g,x,y,h,w){poly(g,[x-w,y,x+w,y,x,y+h],'#e8f8ff',{hl:.6,olc:'#7ab0d8',lw:.8});}
// Снежный ком: комья снега с прилипшими ветками и злыми глазками
art('gory_kom',36,g=>{ell(g,0,13,13,3.5,'rgba(60,90,130,.25)',{ol:false,flat:true});
  ell(g,0,1,13,12.5,'#f4f9ff',{hl:.25,dk:-.25,olc:'#8aa8c8'});ell(g,-8,-6,4.5,4,'#ffffff',{olc:'#a8c0d8',lw:.8});ell(g,9,5,4,3.6,'#eef4fb',{olc:'#a8c0d8',lw:.8});
  ln(g,[-11,6,-17,10],'#6a4a2a',1.4);ln(g,[10,-6,16,-10,18,-8],'#6a4a2a',1.4);ell(g,4,9,2,1.6,'#6a6a7a',{ol:false});
  eye(g,-4,-2,2,{col:'#2a5a9a',angry:1});eye(g,4,-2,2,{col:'#2a5a9a',angry:1,flipB:1});ln(g,[-3,4,0,3,3,4],'#3a4a6a',1.1);});
// Метелица: призрак-вьюга с белыми вихрями
art('gory_metel',42,g=>{g.save();ART.prizr.fn(g);g.restore();over(g,'#bfe6ff',.35);
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.6;for(const [x,y,r,a] of[[-9,6,6,0],[8,9,5,2],[0,-12,7,4]]){g.beginPath();g.arc(x,y,r,a,a+4.2);g.stroke();}
  for(const [x,y] of[[-16,-6],[15,-3],[-13,15],[14,16]]){g.fillStyle='#fff';g.beginPath();g.arc(x,y,1.4,0,TAU);g.fill();}});
// Ледяная дева: дочка Карачуна в голубом сарафане, кокошник из сосулек
art('gory_deva',46,g=>{shp(g,'#7ab8e8',{hl:.4,olc:'#3a6aa8'},[-13,-4,13,21],()=>{g.moveTo(-5,-4);g.lineTo(5,-4);g.lineTo(13,21);g.quadraticCurveTo(0,24,-13,21);g.closePath();});
  ln(g,[0,-3,0,21],'#e8f8ff',1.4);for(const y of[6,13])ln(g,[-6-y*.3,y,6+y*.3,y],'#e8f8ff',1);
  ln(g,[-5,-1,-11,8],'#dff0ff',3);ln(g,[5,-1,11,8],'#dff0ff',3);
  shp(g,'#f4fbff',{olc:'#a8c8e8'},[-9,-15,9,6],()=>{g.moveTo(-8,-12);g.quadraticCurveTo(-11,0,-7,6);g.lineTo(-5,-6);g.lineTo(5,-6);g.lineTo(7,6);g.quadraticCurveTo(11,0,8,-12);g.closePath();});
  ell(g,0,-10,6,6.5,'#eaf2fa');eye(g,-2.4,-10.5,1.7,{col:'#2a7ad8',px:0});eye(g,2.4,-10.5,1.7,{col:'#2a7ad8',px:0});ln(g,[-1.5,-6.5,1.5,-6.5],'#6a9ad0',1);
  shp(g,'#9ad8ff',{hl:.5,olc:'#3a6aa8'},[-9,-24,9,-14],()=>{g.moveTo(-8,-14);g.quadraticCurveTo(0,-26,8,-14);g.closePath();});
  for(const x of[-5,0,5])poly(g,[x-1.6,-17,x+1.6,-17,x,-23-(x?0:3)],'#ffffff',{olc:'#7ab0d8',lw:.7});glow(g,0,-19,9,'rgba(190,230,255,.4)','rgba(255,255,255,.6)');});
// Ледяной великан: Идолище, промёрзшее насквозь — иней, сосульки, снежная борода
art('gory_velikan',96,g=>{g.save();g.scale(1.42,1.42);ART.idol.fn(g);g.restore();over(g,'#4a8ac8',.5);
  for(const [x,y,h] of[[-22,-6,9],[-14,-14,7],[14,-14,8],[22,-6,10],[-28,8,7],[28,8,8]])icl(g,x,y,h,2.4);
  shp(g,'#ffffff',{hl:.2,olc:'#9ab8d0'},[-12,-8,12,10],()=>{g.moveTo(-11,-8);g.quadraticCurveTo(-10,6,0,10);g.quadraticCurveTo(10,6,11,-8);g.quadraticCurveTo(0,-4,-11,-8);});
  ell(g,0,-31,13,4,'#f4fbff',{olc:'#a8c8e8'});shine(g,-14,4,10,4,.3);});
})();

})();}catch(e){console.warn("th gory-art.js",e);}

/* ---- gory.js ---- */
try{(function(){
/* тема gory «Студёные горы» (T-gory, A35): главы 2 «Ледяной перевал» (слот 19) и 3 «Чертог Карачуна» (слот 20). Формат — ENGINE-API.md §3/§10.
   Готовые: повадки dash/wind/aura (BEH), особенности frost/tough/fast (AFX), приёмы wave/zones/rain/wall (BK). Свои: повадки gory_kom, gory_deva; приём gory_led; события gory_lavina, gory_sosulki.
   Скользкий лёд — лужа G.warn (k:'pud', без замедления) со своим on(): инерция богатыря (BEH_FRAME идёт после его шага). */
(function(){
const ICE='#8ad0ff';
// пятно льда: на нём богатырь разгоняется и тормозит с запаздыванием
function slide(z,dt,G){const H=G.hero;if(G.iceF===G.t||(H.x-z.x)**2+(H.y-z.y)**2>z.r*z.r)return;G.iceF=G.t;
  const hs=G.st.spd*(H.slowT>0?.6:1),ux=H.moving?H.fx*hs:0,uy=H.moving?H.fy*hs:0;let v=G.iceV;
  if(!v||G.t-G.iceL>.2)v=G.iceV={x:ux,y:uy};G.iceL=G.t;const k=Math.min(1,dt*2);v.x+=(ux-v.x)*k;v.y+=(uy-v.y)*k;
  H.x+=(v.x-ux)*dt;H.y+=(v.y-uy)*dt;}
function ice(G,x,y,r,life){const z={k:'pud',x,y,r,t:0,life,c:ICE,on:slide,ice:1};if(typeof bzZ==='function')return bzZ(z);(G.warn||(G.warn=[])).push(z);return z;}
const dmg=G=>10*(G.ch.dmg||1)*(G.emD||1)*(G.K?G.K.dmg:1);
// сосулька: круг ≥1,1 с → удар, на месте — пятно льда (через раз)
function sosHit(z,G){burst(z.x,z.y,'#eaf8ff',qLow()?4:9,150);if((G.hero.x-z.x)**2+(G.hero.y-z.y)**2<(z.r+8)**2)hurtHero(z.dmg,'karach');if(z.ice)ice(G,z.x,z.y,z.r*1.2,6);}
function sos(G,x,y,n){const z={k:'sos',x,y,r:44,t:1.1,fn:sosHit,c:'#5aa8ff',dmg:dmg(G),src:'karach',ice:n%2};if(typeof bzZ==='function')bzZ(z);}
// лавина: строй ледяных волков и снежных комьев сверху или снизу
function lav(G,s,n){const H=G.hero;for(let i=0;i<n;i++){const e=mkEnemy(i%4===3?'gory_kom':'wolf_i',H.x+(i-(n-1)/2)*32,H.y+s*(VIEW.wh+40)+rand(-12,12));e.spd*=1.5;}}
THEME_ADD({id:'gory',
 ch:[
  {slot:19,n:2,name:'Ледяной перевал',sub:'Набег',hook:'Ледяной великан стережёт перевал',
   en:{name:'Ice Pass',sub:'The Raid',hook:'The Ice Giant guards the mountain pass'},
   w:[{id:'wolf_i',t:0,v:1},{id:'ledyan',t:0,v:.8},{id:'gory_kom',t:30,v:.9},{id:'gory_metel',t:80,v:.7},{id:'snow',t:140,v:.4},{id:'med_yash',t:165,v:.3,g:1}],
   el:[{id:'wolf_i',fx:['frost']},{id:'gory_kom',fx:['tough']},{id:'gory_metel',fx:['fast']}],
   ev:['gory_lavina'],boss:'gory_velikan'},
  {slot:20,n:3,name:'Чертог Карачуна',sub:'Логово',hook:'Карачун застудил свой чертог — пол как зеркало',
   en:{name:"Karachun's Hall",sub:'The Lair',hook:'Karachun has frozen his hall — the floor is a mirror'},
   w:[{id:'wolf_i',t:0,v:1},{id:'gory_kom',t:0,v:.7},{id:'ledyan',t:0,v:.6},{id:'gory_metel',t:40,v:.6},{id:'gory_deva',t:70,v:.6},{id:'snow',t:100,v:.5},{id:'shatun',t:160,v:.3}],
   el:[{id:'gory_deva',fx:['tough']},{id:'shatun',fx:['frost']},{id:'gory_kom',fx:['fast']}],
   ev:['gory_sosulki',{k:'gory_lavina',t:110}],mb:{id:'gory_velikan',t:150},boss:'karach',bv:'karach_r',nt:1,dark:1,
   ground:{base:'#9db8d4',hi:'#b8d0e8',lo:'#86a2c0',grass:'#7a96b4',flow:['#ffffff','#bfe6ff']},tint:'rgba(30,50,110,.14)'}],
 en:{
  gory_kom:{n:'Снежный ком',r:12,hp:26,spd:46,dmg:8,xp:2,col:'#eef6ff',beh:'gory_kom',bp:{cd:4,warn:.9,spd:300,len:300},en:{n:'Rolling Snowball'},
   lore:{ru:'Скатился с горы и решил, что он главный. Чем дальше катится, тем больше и злее — бей, пока маленький.',en:'Rolled down a mountain and decided he’s the boss. The farther he rolls, the bigger and grumpier — hit him while he’s small.'},
   ph:{ru:['Качу-у-усь!','Посторонись!'],en:['Rolli-i-ing!','Make way!']}},
  gory_metel:{n:'Метелица',r:11,hp:18,spd:60,dmg:6,xp:2,col:'#cfeaff',fly:1,beh:'wind',bp:{cd:5.5,warn:1,dur:1.8,f:.55},en:{n:'Blizzard Sprite'},
   lore:{ru:'Дует так, что шапку уносит вместе с богатырём. Встань боком к ветру — и не улетишь.',en:'Blows so hard your hat flies off, hero and all. Stand sideways to the wind and you stay put.'},
   ph:{ru:['У-у-у-ух!','Сдую!'],en:['Whoo-oosh!',"I'll blow you away!"]}},
  gory_deva:{n:'Ледяная дева',r:13,hp:60,spd:40,dmg:9,xp:3,col:'#9ad8ff',beh:'gory_deva',bp:{r:150,spd:1.25,reg:.03},en:{n:'Ice Maiden'},
   lore:{ru:'Дочка Карачуна. Рядом с ней нечисть бодрее, а у богатыря стынут ноги. Бей её первой.',en:"Karachun's daughter. Near her the monsters perk up and the hero's feet go numb. Hit her first."},
   ph:{ru:['Холодно? А мне хорошо!','Заморожу!'],en:['Cold? I feel lovely!',"I'll freeze you!"]}}},
 boss:{
  gory_velikan:{n:'Ледяной великан',g:'m',r:30,hp:10500,spd:32,dmg:24,col:'#9ad8ff',title:{ru:'Страж перевала',en:'Guardian of the Pass'},en:{n:'The Ice Giant'},
   ph:{ru:['Кто топчет мой перевал?','Топну — горы дрогнут!','Лови глыбу!','Я ледяной, мне не больно!','Стой! Дальше — Карачун!'],
       en:['Who stomps on my pass?','I stomp — the mountains shake!','Catch a boulder!',"I'm made of ice, it doesn't hurt!",'Halt! Beyond lies Karachun!']},
   lore:{ru:'Был когда-то Идолищем, да застыл на перевале. Теперь сторожит путь к Карачуну и топает так, что сыплются лавины.',en:'Once he was Idolishche, but he froze solid on the pass. Now he guards the road to Karachun and stomps so hard avalanches fall.'},
   kit:{a:[{k:'wave',cd:8,col:'#3a8ae0'},{k:'zones',cd:6,n:3,r:60,col:'#2a6ad0'}],
        ph:[{hp:.5,add:[{k:'rain',cd:9,n:8,col:'#3a8ae0'}],sum:{id:'gory_kom',n:4},say:{ru:'Ком за комом — завалю!',en:"Snowball after snowball — I'll bury you!"}}]}},
  karach_r:{base:'karach',rage:1,n:'Карачун ярый',en:{n:'Karachun the Furious'},title:{ru:'Хозяин ледяного чертога',en:'Master of the Ice Hall'},hpK:1.2,
   kit:{a:[{k:'wall',cd:10,at:'line',n:3,col:'#6ab8ff'},{k:'gory_led',cd:9}],
        ph:[{hp:.5,add:[{k:'rain',cd:8,col:'#3a8ae0'}],sum:{id:'snow',n:6},say:{ru:'Снеговики, ко мне! Заморозим гостя!',en:"Snowmen, to me! Let's freeze our guest!"}}]}}},
 beh:{
  gory_kom:{on(e,G){BEH.dash.on(e,G);e.s0=e.sc;e.r0=e.r;e.d0=e.dmg;e.lx=e.x;e.ly=e.y;},
   step(e,dt,G){const r=BEH.dash.step(e,dt,G),d=Math.hypot(e.x-e.lx,e.y-e.ly);e.lx=e.x;e.ly=e.y;
    if(d<40&&e.sc<e.s0*1.8){e.sc+=d*.002*e.s0;const q=e.sc/e.s0;e.r=e.r0*q;e.dmg=e.d0*q;}return r;},
   warn(e,c){if(BEH.dash.warn)BEH.dash.warn(e,c);}},
  gory_deva:{on(e,G){BEH.aura.on(e,G);},
   step(e,dt,G){BEH.aura.step(e,dt,G);const H=G.hero,r=e.bp.r*.75;if((H.x-e.x)**2+(H.y-e.y)**2<r*r)H.slowT=Math.max(H.slowT||0,.25);return false;},
   warn(e,c){c.strokeStyle='rgba(150,210,255,.6)';c.lineWidth=2.5;c.setLineDash([8,8]);c.lineDashOffset=CALM()?0:-G.t*24;c.beginPath();c.arc(e.x,e.y,e.bp.r,0,TAU);c.stroke();c.setLineDash([]);
    c.fillStyle='rgba(150,210,255,.10)';c.fill();}}},
 bk:{
  gory_led:{pass:1,start(b,G,a){const H=G.hero,n=a.n||4,r=a.r||90,l=a.life||7;ice(G,H.x,H.y,r,l);
    for(let i=1;i<n;i++){const an=i/(n-1)*TAU+rand(0,1);ice(G,H.x+Math.cos(an)*170,H.y+Math.sin(an)*170,r*.8,l);}
    say(b,L('Скользко? То-то же!','Slippery? Serves you right!'),1.4);},step(){return true;}}},
 evs:{
  gory_lavina:{t:{ru:'Лавина!',en:'Avalanche!'},dur:3,start(G){G.lvS=Math.random()<.5?-1:1;G.lvD=0;lav(G,G.lvS,22);
    banner(L('Лавина!','Avalanche!'),L('Волки и комья катятся с двух сторон — уходи вбок!','Wolves and snowballs roll in from both sides — step aside!'),4);},
   step(G,dt,t){if(!G.lvD&&t>=2.5){G.lvD=1;lav(G,-G.lvS,18);}}},
  gory_sosulki:{t:{ru:'Сосульки!',en:'Icicles!'},dur:8,start(G){G.sosT=0;G.sosN=0;
    banner(L('Сосульки!','Icicles!'),L('Падают с потолка — уходи из кругов! Где упали — скользко','Falling from the ceiling — leave the circles! Where they land, it’s slippery'),4);},
   step(G,dt){if((G.sosT-=dt)>0)return;G.sosT=qLow()?.6:.45;const H=G.hero,n=G.sosN++,aim=n%3===0;sos(G,H.x+(aim?0:rand(-260,260)),H.y+(aim?0:rand(-200,200)),n);}}}});
})();

})();}catch(e){console.warn("th gory.js",e);}

/* ---- more-art.js ---- */
try{(function(){
/* рисунки темы more («Морское царство», T-more): только art()/artTint() из js/art.js */
(function(){
// Медуза: розовый колокол со щупальцами, светится
art('more_meduza',36,g=>{glow(g,0,-4,15,'#f0a0ff','#fff0ff');
  for(const x of[-7,-2.5,2.5,7])ln(g,[x,2,x+2,8,x-1,13,x+1,17],'#e08ad0',1.5);
  shp(g,'#d070e0',{hl:.55},[-12,-13,12,4],()=>{g.moveTo(-12,3);g.quadraticCurveTo(-13,-14,0,-14);g.quadraticCurveTo(13,-14,12,3);g.quadraticCurveTo(6,0,0,3);g.quadraticCurveTo(-6,0,-12,3);});
  eye(g,-3.8,-5,2,{px:0});eye(g,3.8,-5,2,{px:0});mouth(g,0,-1.2,1.8,'#6a1a5a',1);shine(g,-5,-10,3.4,1.6,.55);});
// Краб-щитник: широкий панцирь, клешни подняты
art('more_krab',42,g=>{for(const s of[-1,1])for(const y of[1,5,9])ln(g,[s*10,y,s*17,y+3,s*19,y+8],'#a83a1a',1.8);
  for(const s of[-1,1]){ln(g,[s*9,-3,s*15,-9],'#c84a22',2.6);
    shp(g,'#e8683a',{},[s*15-6,-20,s*15+6,-6],()=>{g.moveTo(s*14,-7);g.quadraticCurveTo(s*23,-12,s*17,-20);g.lineTo(s*15,-13);g.lineTo(s*11,-17);g.quadraticCurveTo(s*9,-10,s*14,-7);});}
  ell(g,0,2,15,9.5,'#d8602a');ln(g,[-4,-5,-5,-11],'#a83a1a',1.4);ln(g,[4,-5,5,-11],'#a83a1a',1.4);
  eye(g,-5,-12,2.3,{px:0,angry:1});eye(g,5,-12,2.3,{px:0,angry:1,flipB:1});mouth(g,0,5,3,'#5a1a0a',0);
  for(const x of[-8,0,8]){g.beginPath();g.arc(x,-1,1.4,0,TAU);g.fillStyle='rgba(255,220,180,.6)';g.fill();}shine(g,-6,-2,5,2,.35);});
// Спрут: лиловая голова, щупальца завитками
art('more_sprut',48,g=>{for(let i=0;i<6;i++){const x=-12+i*4.8,s=i<3?-1:1;ln(g,[x*.6,6,x,14,x+s*5,19,x+s*3,22],'#7a3a9a',3.4);}
  ell(g,0,-4,13,14,'#9a4ab8');ell(g,0,6,11,4,'#8a3aa8',{ol:false});
  eye(g,-5,-3,3.2,{col:'#e8b010',angry:1});eye(g,5,-3,3.2,{col:'#e8b010',angry:1,flipB:1});
  for(const p of[[-6,-12],[3,-14],[7,-9]]){g.beginPath();g.arc(p[0],p[1],1.5,0,TAU);g.fillStyle='rgba(255,200,255,.45)';g.fill();}
  mouth(g,0,4,2.4,'#3a0a4a',0);shine(g,-5,-12,5,2.4,.35);});
// Морской чёрт: чертёнок в морской зелени
artTint('more_chert','chert','#1f9a8a');
// Пузырь-бомба (его выдувают морские черти)
art('more_puz',28,g=>{glow(g,0,0,13,'#8ae0ff','#e8fbff');g.beginPath();g.arc(0,0,9,0,TAU);g.fillStyle='rgba(160,230,255,.5)';g.fill();
  g.lineWidth=1.4;g.strokeStyle='#3a9ac8';g.stroke();shine(g,-3,-4,3.4,1.8,.8);
  eye(g,-2.6,1,1.5,{px:0,angry:1});eye(g,2.6,1,1.5,{px:0,angry:1,flipB:1});g.beginPath();g.arc(4,-5,1.6,0,TAU);g.fillStyle='rgba(255,255,255,.75)';g.fill();});
// Рыба-кит: на спине избушка и ёлочки, фонтан; смотрит вправо
art('more_kit',124,g=>{shp(g,'#3a6a9a',{},[-60,-22,-38,14],()=>{g.moveTo(-38,2);g.quadraticCurveTo(-48,-6,-60,-22);g.quadraticCurveTo(-51,-4,-58,13);g.quadraticCurveTo(-47,6,-38,8);});
  ell(g,2,4,43,25,'#4a7ab0');shp(g,'#dfeaf2',{hl:.2},[-30,6,42,29],()=>{g.moveTo(-30,14);g.quadraticCurveTo(0,33,42,10);g.quadraticCurveTo(10,22,-30,14);});
  for(const x of[-8,6,20])ln(g,[x,15,x+2,23],'#9ab0c8',1);ln(g,[26,11,43,6],'#1a2a4a',1.8);
  ell(g,-4,15,9,4,'#3a6a9a',{rot:.5});eye(g,27,-4,4.2,{col:'#1a2a4a',angry:1,flipB:1});
  for(const d of[-1,0,1])ln(g,[12,-20,12+d*8,-36,12+d*15,-31],'#bfe8ff',2.4);
  for(const x of[-24,-16])poly(g,[x-4,-15,x,-28,x+4,-15],'#3a8a4a');
  g.fillStyle='#8a5a32';g.fillRect(-7,-25,11,9);poly(g,[-9,-25,-1.5,-32,6,-25],'#b8322e');g.fillStyle='#ffd86a';g.fillRect(-4,-23,4,3.5);
  shine(g,-12,-6,15,4,.3);});
})();

})();}catch(e){console.warn("th more-art.js",e);}

/* ---- more.js ---- */
try{(function(){
/* тема more «Морское царство» (T-more): слоты 21, 22. Свои: повадка more_bok (краб боком под щитом), приём more_wave2 (двойная волна); плашки событий — свои, с подсказкой */
(function(){
// прилив: строй нечисти из-за края экрана; dir 0/1 — слева-справа, 2/3 — сверху-снизу
function line(G,id,n,dir){const H=G.hero,s=dir%2?1:-1,v=dir>1;
  for(let i=0;i<n;i++){const o=(i-(n-1)/2)*36;mkEnemy(id,v?H.x+o:H.x+s*(VIEW.ww+30),v?H.y+s*(VIEW.wh+30):H.y+o);}}
// чернила спрута: тёмная мгла (как тьма Лиха) + спруты кругом
function ink(G,n){G.fogT=12.5;G.fogK='night';const H=G.hero,R=VIEW.R;
  for(let i=0;i<n;i++){const a=rand(0,TAU),d=R*rand(.55,.8);mkEnemy(i%3?'ryba':'more_sprut',H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);}}
const SH=()=>BEH.shield;
THEME_ADD({id:'more',
  ch:[
    {slot:21,n:2,name:'Коралловый лес',sub:'Набег',hook:'Рыба-кит проснулась и ищет, кого проглотить',
      en:{name:'Coral Forest',sub:'The Raid',hook:'The Whale-Fish has woken up and is looking for someone to swallow'},
      w:[{id:'ryba',t:0,v:1},{id:'more_meduza',t:0,v:.8},{id:'rak',t:30,v:.7},{id:'more_krab',t:60,v:.7},{id:'more_sprut',t:110,v:.6},{id:'gory_metel',t:170,v:.3,g:1}],
      el:[{id:'more_krab',fx:['tough']},{id:'more_meduza',fx:['fast']},{id:'rak',fx:['heal']}],
      ev:['more_priliv',{k:'more_chernila',t:115}],
      boss:'more_kit'},
    {slot:22,n:3,name:'Палаты Морского царя',sub:'Логово',hook:'Морской царь ждёт в подводных палатах — и он не в духе',
      en:{name:"Sea Tsar's Halls",sub:'The Lair',hook:'The Sea Tsar waits in his underwater halls — and he is in a foul mood'},
      w:[{id:'more_krab',t:0,v:1},{id:'ryba',t:0,v:.8},{id:'more_meduza',t:20,v:.7},{id:'rusalka',t:40,v:.5},{id:'more_chert',t:60,v:.7},{id:'more_sprut',t:100,v:.6},{id:'vod_s',t:170,v:.35}],
      el:[{id:'more_chert',fx:['tough']},{id:'more_krab',fx:['shield','tough']},{id:'more_sprut',fx:['fast']},{id:'vod_s',fx:['heal']}],
      ev:['more_priliv2',{k:'more_chernila',t:100}],
      mb:{id:'more_kit',t:150},
      boss:'morcar',bv:'morcar_r',dark:1,nt:1,
      ground:{base:'#1f5a7a',hi:'#286a8a',lo:'#194c68',grass:'#3a8aa0',flow:['#ffd0e0','#ffe89a']},tint:'rgba(10,30,80,.24)'}],
  en:{
    more_meduza:{n:'Медуза',r:10,hp:16,spd:62,dmg:6,xp:1,fly:1,col:'#d070e0',beh:'orbit',bp:{R:200,min:60,shrink:14},en:{n:'Jellyfish'},
      lore:{ru:'Водит хороводы вокруг богатыря и жжётся. Кольцо сжимается — прорывайся, пока не поздно.',en:'Dances in rings around the hero and stings. When the ring tightens, break out!'},
      ph:{ru:['Хоровод!','Ж-жжах!'],en:['Round we go!','Zzzap!']}},
    more_krab:{n:'Краб-щитник',r:14,hp:60,spd:40,dmg:10,xp:2,col:'#d8602a',beh:'more_bok',bp:{k:.25,turn:1.6},en:{n:'Shield Crab'},
      lore:{ru:'Клешню держит щитом и ходит только боком. В лоб не возьмёшь — заходи сбоку.',en:'Holds his claw like a shield and only walks sideways. Head-on is hopeless — hit him from the side.'},
      ph:{ru:['Щёлк-щёлк!','Боком, боком!'],en:['Snip-snap!','Sideways, sideways!']}},
    more_sprut:{n:'Спрут',r:15,hp:50,spd:42,dmg:10,xp:2,col:'#9a4ab8',beh:'burrow',bp:{cd:5,warn:1,r:52},en:{n:'Octopus'},
      lore:{ru:'Прячется в песок и хватает щупальцем снизу. А рассердится — пускает чернила, и в море темно, как в погребе.',en:'Hides in the sand and grabs from below. Make him cross, and he squirts ink — the sea goes dark as a cellar.'},
      ph:{ru:['Обниму всеми восемью!','Буль!'],en:['A hug with all eight!','Blub!']}},
    more_chert:{n:'Морской чёрт',r:11,hp:22,spd:66,dmg:7,xp:2,col:'#1f9a8a',beh:'summon',bp:{cd:7,n:3,id:'more_puz'},en:{n:'Sea Imp'},
      lore:{ru:'Дальний родич огненных чертят, только мокрый. Выдувает пузыри, а пузыри лопаются с грохотом.',en:'A soggy cousin of the fire imps. Blows bubbles, and the bubbles pop with a bang.'},
      ph:{ru:['Пузырики!','Хи-хи, бабах!'],en:['Bubbles!','Tee-hee, kaboom!']}},
    more_puz:{n:'Пузырь-бомба',r:9,hp:6,spd:76,dmg:5,xp:1,fly:1,col:'#8ae0ff',beh:'bomb',bp:{r:70,warn:1,dmg:2,trig:60,ek:.5},en:{n:'Bubble Bomb'},
      lore:{ru:'Подлетает, надувается — и бах! Лопни его заранее или отойди: соседей-нечисть тоже задевает.',en:'Floats up, puffs up — and bang! Pop it early or step away: it hits nearby monsters too.'}}},
  boss:{
    more_kit:{n:'Рыба-кит',r:34,hp:15500,spd:40,dmg:26,col:'#4a7ab0',
      title:{ru:'Чудо-юдо морское',en:'Wonder of the Sea'},en:{n:'The Whale-Fish'},
      ph:{ru:['Кто это у меня на спине топчется?','Проглочу и не замечу!','Рыбки, ко мне!','Посторонись — плыву!','Тридцать лет лежал — хватит!'],
          en:["Who's stomping on my back?","I'll swallow you without noticing!",'Little fish, to me!','Make way — I am swimming!','Thirty years of lying still — enough!']},
      lore:{ru:'Та самая Рыба-кит: на спине — деревня и ёлки. Плывёт через всё море одним рывком — смотри на полосу и уходи с дороги.',en:'The very Whale-Fish with a village and fir trees on its back. Crosses the sea in one dash — watch the stripe and get out of the way.'},
      kit:{a:[{k:'dash',cd:5,w:1.1,sp:640,dur:1.1,dmg:1.2,col:'#bfe8ff'},{k:'summon',cd:11,id:'ryba',n:6},{k:'wave',cd:9}],
           ph:[{hp:.5,add:[{k:'dash',cd:4,w:1,sp:700,dur:1,rep:2,col:'#bfe8ff'}],sum:{id:'more_meduza',n:5},say:{ru:'Ох, разозлили кита!',en:'Now the whale is angry!'}}]}},
    morcar_r:{base:'morcar',rage:1,n:'Морской царь ярый',en:{n:'Sea Tsar the Furious'},hpK:1.3,
      title:{ru:'Гроза подводных палат',en:'Terror of the Deep Halls'},
      kit:{a:[{k:'pull',cd:9,dur:2.5,f:120},{k:'fan',cd:6,n:7,arc:1.1},{k:'summon',cd:12,id:'rak',n:3},{k:'summon',cd:16,id:'more_meduza',n:4,at:'hero'}],
           ph:[{hp:.5,add:[{k:'more_wave2',cd:7}],sum:[{id:'rak',n:3},{id:'more_meduza',n:3}],say:{ru:'Море, вставай двумя валами!',en:'Sea, rise in twin waves!'}}]}}},
  beh:{
    more_bok:{on(e,G){SH().on(e,G);e.sd=Math.random()<.5?-1:1;e.st2=rand(1,2);},
      step(e,dt,G){SH().step(e,dt,G);e.st2-=dt;if(e.st2<=0){e.sd=-e.sd;e.st2=rand(1.2,2);}
        const H=G.hero,dx=H.x-e.x,dy=H.y-e.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
        return bzMv(e,ux*.55-uy*.84*e.sd,uy*.55+ux*.84*e.sd,bzSp(e),dt);},
      hit(e,d,G){return SH().hit(e,d,G);},
      warn(e,c){SH().warn(e,c);}}},
  bk:{
    more_wave2:{start(b,G,a){const m=b.bk.m;m.w=bkW(a);m.hold=1;m.i=0;},
      step(b,dt,G,a){const m=b.bk.m;if(m.T<m.w)return false;bkSnd('boom');G.shake=Math.max(G.shake,6);
        G.fx.push({k:'wave',x:b.x,y:b.y,t:0,dur:a.dur||.9,r1:a.r||360,col:'#3ac8e0',dmg:bkD(b,a,1)});
        if(++m.i>=2)return true;m.T=m.w-.75;return false;},
      draw(c,b,G,a){if(!b.bk.m.i)BK.wave.draw(c,b,G,a);}}},
  evs:{
    more_priliv:{dur:0,
      start(G){line(G,'ryba',12,0);line(G,'ryba',12,1);line(G,'more_krab',7,2);
        banner(L('Большой прилив!','Great high tide!'),L('Рыбы с боков, крабы сверху — уходи в угол!','Fish from the sides, crabs from above — head for a corner!'),4);}},
    more_priliv2:{dur:0,
      start(G){for(let k=0;k<4;k++)line(G,k<2?'ryba':'more_krab',k<2?12:8,k);
        banner(L('Девятый вал!','The Ninth Wave!'),L('Нечисть со всех четырёх сторон!','Monsters from all four sides!'),4);}},
    more_chernila:{dur:4,
      start(G){ink(G,18);banner(L('Спруты пустили чернила!','The octopuses squirt ink!'),L('Темно, как в погребе — не стой на месте!','Dark as a cellar — keep moving!'),4);},
      step(G,dt,t){if(t<4&&G.fogT<12.5)G.fogT=12.5;}}}
});
})();

})();}catch(e){console.warn("th more.js",e);}

/* ---- luk-art.js ---- */
try{(function(){
/* рисунки темы luk «Лукоморье» (T-luk/ART-luk, A37/A14): только art()/artTint() из js/art.js; помощники — внутри (function(){…})() */
(function(){
function over(g,col,a){g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(-80,-80,160,160);g.restore();}
/* золотая цепь: звенья по ломаной p */
function chain(g,p,s){for(let i=0;i+3<p.length;i+=2){const n=Math.max(2,Math.round(Math.hypot(p[i+2]-p[i],p[i+3]-p[i+1])/(s*2.2)));
  for(let j=0;j<n;j++){const q=j/n,x=p[i]+(p[i+2]-p[i])*q,y=p[i+1]+(p[i+3]-p[i+1])*q;ell(g,x,y,s,s*.62,'#f2c23a',{rot:Math.atan2(p[i+3]-p[i+1],p[i+2]-p[i])+(j%2?1.57:0),lw:.6,olc:'#7a5a10'});}}}
/* кошачья голова (полосатая) */
function cat(g,x,y,s,col){poly(g,[x-7*s,y-3*s,x-6*s,y-12*s,x-1*s,y-6*s],col);poly(g,[x+7*s,y-3*s,x+6*s,y-12*s,x+1*s,y-6*s],col);
  ell(g,x,y,8*s,7*s,col);for(const d of[-3,0,3])ln(g,[x+d*s,y-7*s,x+d*s*.7,y-4*s],'#5a4a3a',.9*s);
  ell(g,x,y+3*s,4*s,2.6*s,'#f4ead2',{ol:false});ell(g,x,y+1.4*s,1.3*s,.9*s,'#e07a8a',{ol:false,flat:1});
  for(const d of[-1,1])ln(g,[x+d*3*s,y+3*s,x+d*10*s,y+2*s],'#fff',.5*s);}
/* Невиданный зверь: синий, в рыжих пятнах, с рожком и лапищами */
art('luk_zver',50,g=>{for(const x of[-10,-3,5,12])ell(g,x,15,3.6,4.6,'#2e3f7a');
  ln(g,[-15,4,-21,-2,-19,-9],'#3a56a8',3.4);ell(g,-19,-10,2.6,2.6,'#ff8a3a');
  ell(g,0,5,16,11,'#3a56a8');for(const [x,y,r] of[[-7,2,3],[2,8,2.4],[6,0,2],[-2,-1,1.6]])ell(g,x,y,r,r*.8,'#ff9a3a',{ol:false});
  ell(g,13,-6,9,8,'#4a68c0');poly(g,[11,-13,14,-23,17,-12],'#ffd84a');
  eye(g,10,-7,2.4,{px:.6,angry:1});eye(g,16,-7,2,{px:.6,angry:1,flipB:1});ln(g,[12,-1,19,-2],'#1a1a3a',1.2);fangs(g,15,-1.6,1);shine(g,-6,-1,6,2.4,.3);});
/* Русалка на ветвях: русалка сидит на ветке дуба */
art('luk_rus',48,g=>{ln(g,[-22,17,22,13],'#6a4a2a',4.4);for(const [x,y] of[[-17,13],[16,9],[-6,18]])ell(g,x,y,4.6,2.6,'#4a9a3e',{rot:.4});
  g.save();g.scale(.95,.95);ART.rusalka.fn(g);g.restore();for(const x of[-14,12])ell(g,x,15,2.4,2.2,'#f4e2c0',{lw:.5});});
/* Цепной кот: серый полосатый, на золотой цепи */
art('luk_kot',38,g=>{ln(g,[-6,6,-14,0,-13,-7],'#7a7a8a',3);ell(g,-1,6,9,6,'#9a9aa8');for(const x of[-5,-1,3])ln(g,[x,1,x+1,5],'#5a5a6a',1.2);
  ell(g,-5,11,2.2,2.6,'#7a7a8a');ell(g,4,11,2.2,2.6,'#7a7a8a');cat(g,8,-4,.8,'#9a9aa8');
  eye(g,6,-5,1.7,{white:'#ffe14a',px:0});eye(g,10,-5,1.6,{white:'#ffe14a',px:0});chain(g,[4,2,-4,13,-16,15],1.6);});
/* Кот учёный (босс гл.1): большой рыжий кот в очках, на задних лапах, с книгой и цепью */
art('luk_uch',92,g=>{ell(g,0,34,22,6,'rgba(0,0,0,.18)',{ol:false,flat:1});
  ln(g,[14,22,30,14,32,-2,26,-8],'#c8742a',5);ln(g,[30,10,32,0],'#8a4a1a',2);
  ell(g,-7,31,6,3.6,'#b8641e');ell(g,7,31,6,3.6,'#b8641e');
  ell(g,0,12,17,20,'#e08a3a');ell(g,0,15,10,14,'#f8e4c0',{ol:false});for(const y of[0,8,16])ln(g,[-15,y,-11,y+2],'#9a4a14',1.6),ln(g,[15,y,11,y+2],'#9a4a14',1.6);
  chain(g,[-12,-2,0,4,12,-2],1.8);
  shp(g,'#2a6aa8',{},[-15,6,15,22],()=>{g.moveTo(-15,8);g.lineTo(0,12);g.lineTo(15,8);g.lineTo(15,20);g.lineTo(0,23);g.lineTo(-15,20);g.closePath();});
  ln(g,[0,12,0,23],'#1a3a6a',1.4);for(const y of[13,16,19])ln(g,[-12,y-2,-3,y],'#fff6dc',.8),ln(g,[3,y,12,y-2],'#fff6dc',.8);
  ell(g,-14,13,3.4,3,'#e08a3a');ell(g,14,13,3.4,3,'#e08a3a');
  cat(g,0,-14,1.6,'#e08a3a');for(const x of[-5,5]){g.beginPath();g.arc(x,-16,3.6,0,TAU);g.fillStyle='rgba(220,240,255,.35)';g.fill();g.lineWidth=1.2;g.strokeStyle='#5a3a1e';g.stroke();}
  ln(g,[-1.4,-16,1.4,-16],'#5a3a1e',1.2);eye(g,-5,-16,2,{white:'#c8f070',px:0});eye(g,5,-16,2,{white:'#c8f070',px:0});
  shp(g,'#3a3a5a',{},[-12,-36,12,-24],()=>{g.moveTo(-11,-25);g.lineTo(0,-30);g.lineTo(11,-25);g.lineTo(0,-21);g.closePath();});ln(g,[9,-25,11,-18],'#ffd84a',1.2);shine(g,-6,6,5,2.4,.3);});
/* Книжка-сказка (её бьют, пока Кот учёный рассказывает) */
art('luk_kniga',40,g=>{glow(g,0,-2,18,'rgba(255,220,120,.45)','rgba(255,250,220,.7)');
  shp(g,'#b8322e',{},[-16,-8,16,12],()=>{g.moveTo(-16,-6);g.quadraticCurveTo(-8,-10,0,-6);g.quadraticCurveTo(8,-10,16,-6);g.lineTo(16,10);g.quadraticCurveTo(8,6,0,11);g.quadraticCurveTo(-8,6,-16,10);g.closePath();});
  shp(g,'#fff6dc',{lw:.6},[-14,-8,14,8],()=>{g.moveTo(-14,-6);g.quadraticCurveTo(-7,-9,0,-5);g.lineTo(0,9);g.quadraticCurveTo(-7,5,-14,8);g.closePath();g.moveTo(14,-6);g.quadraticCurveTo(7,-9,0,-5);g.lineTo(0,9);g.quadraticCurveTo(7,5,14,8);g.closePath();});
  for(const y of[-3,0,3])ln(g,[-11,y,-3,y+1],'#8a7a5a',.7),ln(g,[3,y+1,11,y],'#8a7a5a',.7);ell(g,0,-12,2.4,2.4,'#ffd84a',{lw:.5});});
/* Ступа-самоходка: ступа с пестом, глазастая */
art('luk_stupa',46,g=>{ln(g,[8,-20,-6,8],'#c8a070',3.4);ell(g,9,-21,3,2.6,'#c8a070');
  shp(g,'#8a5a32',{},[-14,-10,14,18],()=>{g.moveTo(-14,-10);g.lineTo(14,-10);g.lineTo(10,16);g.quadraticCurveTo(0,20,-10,16);g.closePath();});
  ell(g,0,-10,14,3.6,'#5a3a1e');for(const y of[-3,6])ln(g,[-12,y,12,y],'#5a3a1e',1.2);
  eye(g,-5,2,2.6,{angry:1,px:1});eye(g,5,2,2.6,{angry:1,flipB:1,px:1});mouth(g,0,10,3,'#3a1a10');shine(g,-8,-4,3,5,.25);
  for(const x of[-9,9])ell(g,x,20,3.4,1.6,'rgba(120,100,70,.4)',{ol:false,flat:1});});
/* Колдун-носильщик: колдун с мешком за спиной */
art('luk_nosil',48,g=>{ell(g,-12,0,10,12,'#a8885a');ln(g,[-14,-12,-10,-14,-6,-11],'#6a5030',1.6);ln(g,[-6,-6,6,2],'#6a5030',1.6);
  ART.koldun.fn(g);over(g,'#3a6aa8',.18);});
/* Колдун-похититель (босс гл.2): большой колдун с бородой и арканом */
art('luk_kold',96,g=>{g.save();g.scale(1.9,1.9);ART.koldun.fn(g);g.restore();over(g,'#2a2a6a',.18);
  shp(g,'#d8d8e0',{},[-9,-4,9,26],()=>{g.moveTo(-9,-4);g.quadraticCurveTo(-8,16,0,26);g.quadraticCurveTo(8,16,9,-4);g.quadraticCurveTo(0,2,-9,-4);});
  g.beginPath();g.ellipse(-30,8,9,13,.3,0,TAU);g.lineWidth=2.4;g.strokeStyle='#c8a060';g.stroke();ln(g,[-24,0,-14,14],'#c8a060',2.4);});
/* Морок (вожак, морочит копиями) */
artTint('luk_morok','prizr','#9a7aff');
/* Морской витязь: в золотой чешуе, шлем-шишак, круглый щит */
art('luk_vit',56,g=>{ell(g,-6,22,6,3.4,'#5a3a22');ell(g,6,22,6,3.4,'#5a3a22');
  ell(g,0,7,14,15,'#e0b13f');for(const y of[0,6,12])for(const x of[-8,-2,4])g.beginPath(),g.arc(x+(y%12?3:0),y,3,0,Math.PI),g.strokeStyle='#9a7010',g.lineWidth=.9,g.stroke();
  ln(g,[13,4,22,-22],'#9aa3b0',2.4);poly(g,[19,-20,22,-30,25,-19],'#e6eef6');
  ell(g,-14,8,9,10,'#2a7ab0');ell(g,-14,8,3,3.4,'#ffd84a');
  ell(g,0,-10,8,8,'#f4c9a3');ell(g,0,-5,7,4,'#8a5a2a',{ol:false});eye(g,-3,-11,1.6,{px:0});eye(g,3,-11,1.6,{px:0});
  shp(g,'#c2ccd8',{},[-9,-26,9,-12],()=>{g.moveTo(-9,-12);g.quadraticCurveTo(-8,-22,0,-26);g.quadraticCurveTo(8,-22,9,-12);g.closePath();});ln(g,[-9,-13,9,-13],'#e6b53a',2);
  for(const [x,y] of[[-20,-6],[18,12]])ell(g,x,y,1.6,2.4,'#8ad0ff',{ol:false});shine(g,-5,2,5,2.4,.3);});
/* Карла (свита Черномора): маленький бородач в красном колпаке */
art('luk_karla',30,g=>{ell(g,-3,11,3,1.8,'#5a3a22');ell(g,3,11,3,1.8,'#5a3a22');ell(g,0,4,7,7,'#6a4aa8');
  ell(g,0,-4,5.4,5,'#f4c9a3');shp(g,'#e8e0d0',{},[-5,-3,5,9],()=>{g.moveTo(-5,-3);g.quadraticCurveTo(-3,6,0,9);g.quadraticCurveTo(3,6,5,-3);g.quadraticCurveTo(0,0,-5,-3);});
  eye(g,-2,-5,1.2,{angry:1,px:0});eye(g,2,-5,1.2,{angry:1,flipB:1,px:0});poly(g,[-6,-7,6,-7,3,-15,-1,-13],'#d8313d');});
/* Черномор (главный босс): крошечный старичок, борода-коса до земли, высокая шапка-невидимка */
art('luk_chern',112,g=>{ell(g,0,40,30,7,'rgba(0,0,0,.18)',{ol:false,flat:1});
  ell(g,-8,30,6,3.6,'#6a1a2a');ell(g,8,30,6,3.6,'#6a1a2a');
  shp(g,'#8a1a5a',{},[-17,-6,17,30],()=>{g.moveTo(-8,-6);g.lineTo(8,-6);g.quadraticCurveTo(16,14,17,30);g.lineTo(-17,30);g.quadraticCurveTo(-16,14,-8,-6);});
  for(const x of[-10,0,10])ell(g,x,22,2,2,'#ffd84a',{lw:.4});
  const bp=[0,-6,-4,10,2,24,14,32,30,33,42,30,50,34];ln(g,bp,'#6a6e80',11);ln(g,bp,'#eceef4',8);
  for(let i=2;i<bp.length-2;i+=2)ln(g,[bp[i]-3,bp[i+1]-2,bp[i]+3,bp[i+1]+2],'#a8acc0',1.4);
  shp(g,'#eceef4',{},[-11,-10,11,12],()=>{g.moveTo(-10,-10);g.quadraticCurveTo(-9,6,0,12);g.quadraticCurveTo(9,6,10,-10);g.closePath();});
  ell(g,0,-14,9,8.6,'#f4c9a3');ell(g,-8,-12,3,2.4,'#f4c9a3');ell(g,8,-12,3,2.4,'#f4c9a3');
  eye(g,-3.4,-15,2,{angry:1,px:0});eye(g,3.4,-15,2,{angry:1,flipB:1,px:0});ell(g,0,-11,2.6,2,'#e8a080');
  ln(g,[-7,-8,-1,-6],'#eceef4',3);ln(g,[7,-8,1,-6],'#eceef4',3);
  shp(g,'#3a2a8a',{},[-12,-50,12,-20],()=>{g.moveTo(-12,-21);g.quadraticCurveTo(-6,-40,4,-50);g.quadraticCurveTo(4,-36,12,-21);g.closePath();});
  ell(g,0,-21,13,3.2,'#e6b53a');for(const [x,y] of[[-3,-31],[3,-38],[5,-27]])ell(g,x,y,1.6,1.6,'#ffe88a',{ol:false});shine(g,-6,-30,2.4,5,.3);});
/* декор: золотой дуб с цепью, пенная волна, цепь в песке, следы невиданных зверей */
art('luk_dub',120,g=>{ell(g,8,44,34,10,'rgba(0,0,0,.18)',{ol:false,flat:1});
  shp(g,'#7a5230',{},[-10,-4,10,46],()=>{g.moveTo(-8,-4);g.quadraticCurveTo(-6,30,-14,46);g.lineTo(14,46);g.quadraticCurveTo(6,30,8,-4);g.closePath();});
  for(const [x,y,r] of[[-24,-10,20],[24,-12,21],[0,-30,24],[-10,-2,18],[12,0,18]])ell(g,x,y,r,r*.88,'#4a9a3e');ell(g,-6,-22,15,10,'#63b552',{ol:false});
  for(const [x,y] of[[-18,-16],[8,-34],[20,-6],[-4,-6],[26,-22]])ell(g,x,y,2.2,2.8,'#e6b53a',{lw:.5});
  chain(g,[-12,28,0,34,12,28],1.8);chain(g,[-11,18,0,22,11,18],1.8);shine(g,-12,-36,9,4,.28);});
art('luk_volna',72,g=>{shp(g,'#5ab0d8',{ol:false},[-34,-6,34,12],()=>{g.moveTo(-34,12);g.quadraticCurveTo(-20,-6,-4,2);g.quadraticCurveTo(10,-8,22,0);g.quadraticCurveTo(30,4,34,12);g.closePath();});
  for(const [x,y,r] of[[-20,2,5],[-12,-1,4],[-4,2,4.4],[8,-2,5],[18,0,4],[26,4,3.4]])ell(g,x,y,r,r*.7,'#ffffff',{lw:.6,olc:'#8ac8e8'});
  for(const x of[-26,-6,14])ln(g,[x,9,x+8,8],'rgba(255,255,255,.7)',1.2);});
art('luk_cep',44,g=>{ell(g,1,4,16,6,'rgba(0,0,0,.14)',{ol:false,flat:1});chain(g,[-14,2,-6,-4,4,-2,8,6,-2,8,-10,4,0,0,12,-6,16,-2],2.4);});
art('luk_sled',40,g=>{for(const [x,y,a] of[[-9,8,.3],[4,-2,.2],[-4,-12,.4],[10,-16,.3]]){g.save();g.translate(x,y);g.rotate(a);
  ell(g,0,0,3.6,4.4,'rgba(110,90,50,.45)',{ol:false,flat:1});for(const d of[-3,0,3])ell(g,d,-6,1.4,2,'rgba(110,90,50,.45)',{ol:false,flat:1});g.restore();}});
})();

})();}catch(e){console.warn("th luk-art.js",e);}

/* ---- luk.js ---- */
try{(function(){
/* тема luk «Лукоморье» (T-luk, A37): главы 1 «У дуба зелёного» (слот 23), 2 «Неведомые дорожки» (24), 3 «Сады Черномора» (25). Формат — ENGINE-API.md §3/§10.
   Повадки (trail/lob/orbit/dash/pull/decoy/march), вожаки (tough/fast/shield/vamp) и приёмы (fan/ring/pull/clone/spin/invis/summon/dash) — из js/beh.js и js/bk.js.
   Своё: событие «Там чудеса» (гости из уже пройденных земель), повадка luk_kn (книжка-сказка стоит на месте; разбита — Коту учёному урон), приём luk_skaz (Кот рассказывает сказку). */
(function(){
const ok=k=>EN[k]&&!EN[k].boss&&!EN[k].prop&&k!=='egg'&&k.indexOf('luk_')!==0;
let last=-1;
/* сказка: глава, пройденная раньше этой (каждый раз другая), и её нечисть */
function tale(G){const p=chPos(G.chi),all=[],done=[];for(let i=0;i<(p>0?p-1:ORD.length);i++){const s=ORD[i],c=CH[s];if(!c||!c.en||CAMP_S[s]&&CAMP_S[s].th==='luk')continue;
    const k=c.en.filter(ok);if(!k.length)continue;all.push([s,k]);if(S.done&&S.done[s])done.push([s,k]);}
  let a=done.length>1?done:all;if(a.length>1)a=a.filter(x=>x[0]!==last);if(!a.length)return null;const t=pick(a);last=t[0];return t;}
function guests(G,n,ring,el){const t=tale(G);if(!t)return null;const H=G.hero,R=VIEW.R;
  for(let i=0;i<n;i++){const a=i/n*TAU+rand(-.2,.2),d=R*(ring||rand(.6,.85)),x=H.x+Math.cos(a)*d,y=H.y+Math.sin(a)*d;
    mkEnemy(t[1][i%t[1].length],x,y,el&&i===0?{elite:1}:null);G.fx.push({k:'poof',x,y,t:0,dur:.5});}return CH[t[0]];}
function chud(G,n,two){const c=guests(G,n,0,two),c2=two&&guests(G,Math.round(n*.7),.95);
  if(c)banner(L('Там чудеса!','Wonders abound!'),L('Кот рассказывает сказку ','The Cat tells a tale of ')+qt(c.name)+(c2?L(' и ',' and ')+qt(c2.name):''),4);}
THEME_ADD({id:'luk',
 th:{name:'Лукоморье',sub:'У лукоморья дуб зелёный',en:{name:'Lukomorye',sub:'A green oak by the curved seashore'},
  ground:{base:'#a9cf7e',hi:'#bcdc90',lo:'#97bf6c',grass:'#7aa856',flow:['#ffffff','#ffd84a','#7fd0ff','#f6a0c0']},
  decor:['luk_dub','luk_volna','d_shell','luk_cep','luk_sled'],tint:'rgba(255,220,120,.06)',dark:0,bright:0,
  mc:'#e6b53a',map:[.73,.34],ev:'luk_chudesa',
  reward:{k:'bld',id:'luk_dub',ru:'Дуб у Лукоморья',en:'Oak by the Seashore'}},
 ch:[
  {slot:23,n:1,name:'У дуба зелёного',sub:'Разведка',hook:'Кот учёный ходит по цепи и рассказывает сказки — да не простые',
   en:{name:'By the Green Oak',sub:'Scouting',hook:'The Learned Cat walks his chain and tells tales — not ordinary ones'},
   w:[{id:'luk_kot',t:0,v:1},{id:'luk_zver',t:35,v:1},{id:'luk_rus',t:95,v:.7},{id:'rak',t:165,v:.3,g:1}],
   el:[{id:'luk_zver',fx:['tough']},{id:'luk_kot',fx:['fast']}],
   ev:['luk_chudesa'],boss:'luk_uch'},
  {slot:24,n:2,name:'Неведомые дорожки',sub:'Набег',hook:'Там на неведомых дорожках — следы невиданных зверей',
   en:{name:'Unknown Paths',sub:'The Raid',hook:'Along the unknown paths — tracks of unseen beasts'},
   w:[{id:'luk_zver',t:0,v:1},{id:'luk_kot',t:0,v:.7},{id:'luk_stupa',t:35,v:1},{id:'luk_nosil',t:95,v:.8},{id:'luk_rus',t:130,v:.5},{id:'ryba',t:165,v:.3,g:1}],
   el:[{id:'luk_morok',fx:['tough']},{id:'luk_stupa',fx:['fast']},{id:'luk_nosil',fx:['shield']}],
   ev:['luk_chudesa'],boss:'luk_kold'},
  {slot:25,n:3,name:'Сады Черномора',sub:'Логово',hook:'Черномор надел шапку-невидимку — ищи его следы на песке',
   en:{name:"Chernomor's Gardens",sub:'The Lair',hook:'Chernomor has put on his cap of invisibility — look for his tracks in the sand'},
   w:[{id:'luk_kot',t:0,v:1},{id:'luk_zver',t:0,v:.7},{id:'luk_stupa',t:35,v:.8},{id:'luk_vit',t:70,v:.45},{id:'luk_nosil',t:95,v:.6},{id:'luk_rus',t:120,v:.5},{id:'rak',t:165,v:.3,g:1}],
   el:[{id:'luk_vit',fx:['shield']},{id:'luk_morok',fx:['tough']},{id:'luk_zver',fx:['vamp']}],
   ev:['luk_chudesa2',{k:'luk_chudesa',t:100}],mb:{id:'luk_uch2',t:150},
   boss:'luk_chern',tint:'rgba(255,120,60,.10)',nt:1}],
 en:{
  luk_kot:{n:'Цепной кот',r:10,hp:16,spd:96,dmg:6,xp:1,col:'#9a9aa8',beh:'orbit',bp:{R:180,min:60,shrink:14},en:{n:'Chained Cat'},
   lore:{ru:'Ходит по цепи кругом — и тебя водит по кругу. Кольцо сжимается: прорывайся, пока не поздно.',en:'Walks round and round on his chain — and leads you round too. The ring tightens: break out in time.'},
   ph:{ru:['Мур-р, по кругу!','Цепь звенит!'],en:['Purr, round we go!','The chain jingles!']}},
  luk_zver:{n:'Невиданный зверь',r:13,hp:34,spd:58,dmg:9,xp:2,col:'#3a56a8',beh:'trail',bp:{cd:.8,r:24,life:3.5,slow:1,burn:.4},en:{n:'Unseen Beast'},
   lore:{ru:'Никто его раньше не видел, а следы видели все. По следам не ходи — вязнут ноги и щиплет пятки.',en:'Nobody has seen it, but everyone has seen its tracks. Don’t step in them — they stick and sting.'}},
  luk_rus:{n:'Русалка на ветвях',r:12,hp:28,spd:46,dmg:8,xp:2,col:'#3ac8a0',beh:'lob',bp:{cd:3.4,warn:1,r:40,rng:320},en:{n:'Branch Rusalka'},
   lore:{ru:'Сидит на ветке дуба и кидается ракушками. Как она туда залезла с хвостом — загадка.',en:'Sits on an oak branch and throws seashells. How she climbed up there with a tail is a mystery.'},
   ph:{ru:['Ракушку хочешь?','Ля-ля!'],en:['Want a seashell?','La-la!']}},
  luk_stupa:{n:'Ступа-самоходка',r:13,hp:30,spd:60,dmg:10,xp:2,col:'#8a5a32',beh:'dash',bp:{cd:3,warn:.9,spd:4.5,len:300},en:{n:'Runaway Mortar'},
   lore:{ru:'Ступа сама идёт, сама бредёт — хозяйку где-то забыла. Целится и несётся по прямой: шагни в сторону.',en:'The mortar runs about by itself — it left its mistress somewhere. It aims and rushes straight: step aside.'},
   ph:{ru:['Тук-тук-тук!','Посторонись!'],en:['Thump-thump!','Make way!']}},
  luk_nosil:{n:'Колдун-носильщик',r:13,hp:40,spd:44,dmg:9,xp:2,col:'#3a6aa8',beh:'pull',bp:{cd:5,warn:1,rng:300},en:{n:'Porter Sorcerer'},
   lore:{ru:'Таскает мешки за Колдуном и арканом ловит богатырей. Видишь линию — рвись в сторону.',en:'Carries sacks for the Sorcerer and lassoes heroes. See the line? Dash aside.'}},
  luk_morok:{n:'Морок',r:12,hp:24,spd:70,dmg:8,xp:2,col:'#9a7aff',fly:1,beh:'decoy',bp:{n:2,cd:8},en:{n:'Mirage'},
   lore:{ru:'Морок морочит: пускает копии и меняется с ними местами. Настоящий — тот, что бьёт.',en:'The Mirage plays tricks: makes copies and swaps places with them. The real one is the one that hits.'}},
  luk_vit:{n:'Морской витязь',r:15,hp:70,spd:50,dmg:12,xp:3,col:'#d8a83a',beh:'march',bp:{n:5,gap:2.4,k:.25,warn:1.2},en:{n:'Sea Knight'},
   lore:{ru:'Выходят из моря шеренгой, в чешуе, как жар горят. Чары Черномора гонят их — обойди строй сбоку.',en:'They march out of the sea in a row, scales gleaming like fire. Chernomor’s spell drives them — go round the flank.'},
   ph:{ru:['Шагом марш!','Строй держи!'],en:['Forward, march!','Hold the line!']}},
  luk_karla:{n:'Карла',r:8,hp:10,spd:100,dmg:5,xp:1,col:'#6a4aa8',en:{n:'Dwarf'},
   lore:{ru:'Слуга Черномора: ростом с валенок, бегает быстрее зайца.',en:'Chernomor’s servant: no taller than a boot, faster than a hare.'}},
  luk_kniga:{n:'Книжка-сказка',r:16,hp:20,spd:0,dmg:0,xp:1,col:'#b8322e',beh:'luk_kn',en:{n:'Fairy-Tale Book'},
   lore:{ru:'Пока книжка открыта, сказка идёт. Захлопни все — и Кот учёный собьётся.',en:'While the book is open, the tale goes on. Shut them all — and the Learned Cat loses his place.'}}},
 boss:{
  luk_uch:{n:'Кот учёный',r:28,hp:17000,spd:40,dmg:28,col:'#e08a3a',title:{ru:'Сказочник у дуба',en:'Storyteller of the Oak'},en:{n:'The Learned Cat'},
   ph:{ru:['Мур-р… Садись, богатырь, расскажу сказку!','Идёт направо — песнь заводит!','Налево — сказку говорит!','Не перебивай!','Сказка — ложь, да в ней намёк!'],
       en:['Purr… Sit down, hero, I’ll tell you a tale!','Walking right, he sings a song!','Walking left, he tells a tale!','Don’t interrupt!','A tale is a fib, but there’s a hint in it!']},
   lore:{ru:'Не злой — просто очень любит рассказывать. Только из его сказок вылезает всякая нечисть. Закрой книжки — и он собьётся.',en:'Not wicked — just loves telling stories. But all sorts of monsters climb out of his tales. Shut the books and he loses his place.'},
   kit:{a:[{k:'luk_skaz',cd:18,dur:16,n:4,g:8},{k:'fan',cd:6,n:5,col:'#ffd84a'}],
        ph:[{hp:.5,add:[{k:'ring',cd:7,n:12,col:'#ffd84a'}],say:{ru:'Ещё сказочку? Слушай!',en:'Another tale? Listen!'}}]}},
  luk_uch2:{art:'luk_uch',n:'Кот учёный',r:28,hp:17000,spd:44,dmg:26,col:'#e08a3a',mini:1,title:{ru:'Короткая сказка',en:'A Short Tale'},en:{n:'The Learned Cat'},
   ph:{ru:['Мур! Сказочка коротенькая!','Слушай, пока не кончилась!'],en:['Purr! A short little tale!','Listen before it ends!']},
   kit:{a:[{k:'luk_skaz',cd:14,dur:9,n:3,g:6},{k:'fan',cd:6,n:5,col:'#ffd84a'}]}},
  luk_kold:{n:'Колдун-похититель',r:30,hp:18000,spd:44,dmg:29,col:'#4a2a7a',title:{ru:'Ловец богатырей',en:'Catcher of Heroes'},en:{n:'The Kidnapper Sorcerer'},
   ph:{ru:['Унесу тебя за леса, за горы!','Аркан мой длинный!','Который я настоящий? Угадай!','Мешок-то пустой — полезай!'],
       en:['I’ll carry you off beyond the forests and hills!','My lasso is long!','Which one is really me? Guess!','My sack is empty — climb in!']},
   lore:{ru:'Ворует богатырей арканом и прячет в мешок. Морочит копиями — бей того, кто бьёт в ответ.',en:'Steals heroes with his lasso and hides them in a sack. Fools you with copies — hit the one that hits back.'},
   kit:{a:[{k:'pull',cd:7},{k:'clone',cd:12,n:2}],
        ph:[{hp:.5,add:[{k:'fan',cd:6,n:5}],sum:{id:'luk_nosil',n:3},say:{ru:'Носильщики, ко мне!',en:'Porters, to me!'}}]}},
  luk_chern:{n:'Черномор',r:32,hp:19500,spd:46,dmg:30,col:'#3a2a8a',title:{ru:'Карла с бородой',en:'The Bearded Dwarf'},en:{n:'Chernomor'},
   ph:{ru:['В моей бороде — вся моя сила!','Шапка-невидимка, выручай!','Ищи-свищи!','Борода, крути!','Карлы, несите меня!'],
       en:['All my power is in my beard!','Cap of invisibility, help me!','Catch me if you can!','Beard, spin!','Dwarves, carry me!']},
   lore:{ru:'Сам с вершок, борода — семь саженей. Крутит бородой, как мельница, и прячется под шапкой-невидимкой: смотри на следы.',en:'Tiny himself, with a beard seven fathoms long. Spins his beard like a windmill and hides under his cap of invisibility: watch for tracks.'},
   kit:{a:[{k:'spin',cd:7,r:120,n:2},{k:'invis',cd:13,dur:6},{k:'summon',cd:12,id:'luk_karla',n:5}],
        ph:[{hp:.5,rm:'spin',add:[{k:'dash',cd:3.2,rep:2}],sum:{id:'luk_karla',n:8},spd:1.3,say:{ru:'Ай, моя борода! Карлы, ко мне!',en:'Ow, my beard! Dwarves, to me!'}}]}}},
 evs:{
  luk_chudesa:{t:{ru:'Там чудеса!',en:'Wonders abound!'},dur:0,start(G){chud(G,16)}},
  luk_chudesa2:{t:{ru:'Сказка за сказкой!',en:'Tale after tale!'},dur:0,start(G){chud(G,16,1)}}},
 beh:{
  luk_kn:{step(e){e.kx=e.ky=0;return true;},
   die(e){const b=e.lukB;if(!b||b.dead)return;const h=Math.min(b.hp-1,b.max*.035);if(h>0){b.hp-=h;b.flash=.1;addNum(b.x,b.y-b.r*1.2,h,'#ffd84a');}}}},
 bk:{
  luk_skaz:{x:1,inv:1,
   start(b,G,a){const m=b.bk.m,H=G.hero,n=Math.min(a.n||4,6),d=a.d||190,a0=rand(0,TAU);m.k=(b.lukK=(b.lukK||0)+1);m.g=a.gap||5;m.wv=0;
    for(let i=0;i<n;i++){const an=a0+i/n*TAU,x=H.x+Math.cos(an)*d,y=H.y+Math.sin(an)*d,e=mkEnemy('luk_kniga',x,y);
     e.hp=e.max=Math.max(5,b.max*(a.hp||.02));e.lukB=b;e.lukK=m.k;e.xp=0;G.fx.push({k:'poof',x,y,t:0,dur:.5});}
    b.invul=true;say(b,L('Слушай сказку! Закроешь книжки — собьюсь!','Listen to my tale! Shut the books and I’ll lose my place!'),2);guests(G,a.g||8);},
   step(b,dt,G,a){const m=b.bk.m;let left=0;for(const e of G.en)if(!e.dead&&e.lukB===b&&e.lukK===m.k)left++;
    if(m.T>m.g*(m.wv+1)&&m.wv<1){m.wv++;guests(G,a.g||8);}
    if(left&&m.T<(a.dur||16))return false;b.invul=false;
    if(!left){b.stun=a.stun||3;say(b,L('Ой, где же я остановился?..','Oh, where was I?..'),1.6);}
    else{for(const e of G.en)if(!e.dead&&e.lukB===b&&e.lukK===m.k){e.dead=true;G.fx.push({k:'poof',x:e.x,y:e.y,t:0,dur:.5});}say(b,L('Вот и сказке конец!','And that’s the end of the tale!'),1.6);}
    return true;},
   draw(c,b,G,a){const m=b.bk.m;c.strokeStyle='rgba(255,216,74,.55)';c.lineWidth=2;
    for(const e of G.en)if(!e.dead&&e.lukB===b&&e.lukK===m.k){c.beginPath();c.moveTo(b.x,b.y);c.lineTo(e.x,e.y);c.stroke();}}}}
});
})();

})();}catch(e){console.warn("th luk.js",e);}

/* ---- ogon-art.js ---- */
try{(function(){
/* рисунки темы ogon (T-ogon, A38): art()/artTint() из js/art.js; смотрят вправо */
(function(){
function over(g,col,a){g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(-60,-60,120,120);g.restore();}
function flame(g,x,y,h,c1,c2){shp(g,c1,{ol:false},[x-h*.4,y-h,x+h*.4,y],()=>{g.moveTo(x-h*.35,y);g.quadraticCurveTo(x-h*.4,y-h*.55,x,y-h);g.quadraticCurveTo(x+h*.4,y-h*.55,x+h*.35,y);g.closePath();});
  shp(g,c2,{ol:false,flat:1},[x-h*.2,y-h*.6,x+h*.2,y],()=>{g.moveTo(x-h*.18,y);g.quadraticCurveTo(x-h*.2,y-h*.35,x,y-h*.6);g.quadraticCurveTo(x+h*.2,y-h*.35,x+h*.18,y);g.closePath();});}
// Саламандра: огненная ящерка, пятнистая, по хребту — язычки пламени
art('ogon_salam',40,g=>{ln(g,[-8,3,-15,5,-19,1,-17,-3],'#c0401a',3.4);
  for(const [x,y] of[[-8,8],[4,8]]){ln(g,[x,y-3,x-3,y+3],'#a0301a',2.4);ln(g,[x+4,y-3,x+7,y+3],'#a0301a',2.4);}
  ell(g,-1,2,11,5.5,'#e8501e');for(const x of[-6,-1,4])flame(g,x,-2,7,'#ffb03a','#fff0a0');
  for(const [x,y] of[[-5,3],[1,4],[5,2]])ell(g,x,y,1.4,1.1,'#ffd84a',{ol:false,flat:1});
  ell(g,11,-1,6,4.6,'#e8501e');eye(g,12,-3,1.8,{col:'#3a0a00',angry:1,flipB:1});ln(g,[13,1,17,1],'#5a1a0a',.9);
  shine(g,-3,0,5,1.6,.3);});
// Бес-взрывник: чертёнок потемнее с бомбой-горшком и искрой на фитиле
art('ogon_bes',38,g=>{ART.chert.fn(g);over(g,'#5a1a3a',.28);
  ell(g,12,6,6,6,'#3a3040');ln(g,[12,0,14,-4,12,-7],'#8a6a3a',1.2);glow(g,12,-8,5,'#ffb03a','#fff6c0');shine(g,10,4,2,1.2,.4);});
// Лавовый валун: камень с огненными трещинами и сердитыми глазами
art('ogon_val',46,g=>{glow(g,0,2,22,'rgba(255,90,20,.5)','rgba(255,160,60,.6)');ell(g,0,2,16,14,'#4a3030',{hl:.25});
  for(const p of[[-12,-2,-5,1,-7,8],[3,-11,5,-3,11,-1],[2,6,7,10,4,15],[-4,-8,-1,-4]])ln(g,p,'#ff7a1a',2.2);
  for(const p of[[-12,-2,-5,1,-7,8],[3,-11,5,-3,11,-1]])ln(g,p,'#ffe07a',.8);
  eye(g,-4,-1,2.4,{col:'#ff4a1a',angry:1,white:'#ffd84a'});eye(g,4,-1,2.4,{col:'#ff4a1a',angry:1,flipB:1,white:'#ffd84a'});
  shine(g,-6,-7,4,1.8,.25);});
// Огненный щитоносец: костяной витязь в огне
artTint('ogon_shit','rycar','#c8502a');
// Огненный конь: вороной конь с огненной гривой и хвостом, копыта-угли
art('ogon_kon',96,g=>{
  for(const [y,c] of[[-4,'#ff4a1a'],[0,'#ff9a2a'],[4,'#ffd84a']])shp(g,c,{ol:false},[-44,-14,-20,14],()=>{g.moveTo(-22,y-6);g.quadraticCurveTo(-36,y-16,-44,y-6);g.quadraticCurveTo(-34,y+2,-40,y+12);g.quadraticCurveTo(-28,y+4,-22,y+2);g.closePath();});
  for(const [x,k] of[[-15,-1],[-8,1],[10,-1],[17,1]]){ln(g,[x,8,x+k*3,22,x+k*2,31],'#2a1a1a',5);ell(g,x+k*2,32,4,2.6,'#ff6a1a',{lw:.8});}
  ell(g,0,0,23,13,'#3a2224');ell(g,-2,6,15,4,'#5a3434',{ol:false});
  shp(g,'#3a2224',{},[10,-34,30,4],()=>{g.moveTo(12,-6);g.quadraticCurveTo(14,-26,24,-33);g.lineTo(30,-24);g.quadraticCurveTo(24,-14,22,4);g.closePath();});
  shp(g,'#3a2224',{},[22,-36,44,-18],()=>{g.moveTo(22,-33);g.quadraticCurveTo(30,-38,40,-28);g.quadraticCurveTo(46,-22,40,-18);g.quadraticCurveTo(30,-18,24,-22);g.closePath();});
  poly(g,[24,-33,25,-42,29,-34],'#3a2224');ell(g,42,-22,1.2,1,'#ff6a1a',{ol:false,flat:1});
  for(let i=0;i<6;i++)flame(g,8+i*3.4,-6-i*5.2,10+i%2*4,i%2?'#ffb03a':'#ff5a1a','#fff0a0');
  eye(g,32,-29,2.4,{col:'#ff4a1a',angry:1,flipB:1,white:'#ffe9a0'});
  glow(g,44,-20,6,'rgba(255,140,40,.6)','rgba(255,230,160,.5)');shine(g,-6,-6,10,3,.2);});
})();

})();}catch(e){console.warn("th ogon-art.js",e);}

/* ---- ogon.js ---- */
try{(function(){
/* тема ogon «Огненная земля» (T-ogon, A38): слоты 26/27. Формат — ENGINE-API §3/§10/§13. Своё: AFX ogon_zhar, приём ogon_oblet, события ogon_reka/2. */
(function(){
/* лавовая река: n полос возле богатыря, 1,5 с предупреждение, 7 с жжёт; вдоль — нечисть */
function reka(G,n,ids){const H=G.hero,R=VIEW.R,a=rand(0,TAU),ux=Math.cos(a),uy=Math.sin(a),o0=rand(-40,40)+(n%2?0:75);
  for(let i=0;i<n;i++){const o=o0+(i-(n-1)/2)*150,cx=H.x-uy*o,cy=H.y+ux*o;let tk=0;
    bzZ({k:'lava',x:cx-ux*R*1.3,y:cy-uy*R*1.3,x2:cx+ux*R*1.3,y2:cy+uy*R*1.3,r:24,t:1.5,life:7,c:'#ff5a1a',src:'ogon_salam',
      on(z,dt){if(heroIn(z,0)){G.hero.slowT=Math.max(G.hero.slowT||0,.25);if((tk-=dt)<=0){tk=.5;hurtHero(6*((G.ch&&G.ch.dmg)||1),'ogon_salam');}}}});}
  for(let i=0;i<ids.length*4;i++){const d=rand(-R,R),s=(i%2?1:-1)*rand(60,120);mkEnemy(ids[i%ids.length],H.x+ux*d-uy*(o0+s),H.y+uy*d+ux*(o0+s));}
  banner(L('Огненная река!','River of fire!'),L('Лава течёт — не стой на красных полосах!','Lava is flowing — get off the red stripes!'),4);}
THEME_ADD({id:'ogon',
 ch:[
  {slot:26,n:2,name:'Огненная река',sub:'Набег',hook:'Огненный конь скачет по лавовой реке',
   en:{name:'River of Fire',sub:'The Raid',hook:'The Fire Horse gallops along the lava river'},
   w:[{id:'chert',t:0,v:1},{id:'ogon_salam',t:0,v:.8},{id:'ognev',t:30,v:.6},{id:'ogon_bes',t:70,v:.6},{id:'skel_f',t:110,v:.5},{id:'luk_kot',t:165,v:.3,g:1}],
   el:[{id:'ogon_salam',fx:['ogon_zhar']},{id:'chert',fx:['ogon_zhar','fast']},{id:'skel_f',fx:['tough']}],
   ev:['ogon_reka'],boss:'ogon_kon'},
  {slot:27,n:3,name:'Шатёр Тугарина',sub:'Логово',hook:'Тугарин раскинул огненный шатёр посреди лавы',
   en:{name:"Tugarin's Tent",sub:'The Lair',hook:'Tugarin has pitched his fiery tent amid the lava'},
   w:[{id:'chert',t:0,v:1},{id:'ogon_salam',t:0,v:.6},{id:'ogon_val',t:35,v:.7},{id:'ogon_shit',t:70,v:.6},{id:'ogon_bes',t:100,v:.5},{id:'idol_f',t:150,v:.3}],
   el:[{id:'ogon_shit',fx:['ogon_zhar']},{id:'ogon_val',fx:['tough']},{id:'ogon_bes',fx:['fast']}],
   ev:['ogon_reka2','firerain'],mb:{id:'ogon_kon',t:150},boss:'tugar',bv:'tugar_r',nt:1}],
 en:{
  ogon_salam:{n:'Саламандра',r:10,hp:20,spd:68,dmg:7,xp:1,col:'#e8501e',beh:'trail',bp:{cd:.6,r:22,life:3,slow:1,burn:.3,c:'#ff6a1a'},en:{n:'Salamander'},
   lore:{ru:'Огненная ящерка. Где пробежит — там горит. Хвост греет, лапы жгут, обниматься не лезет — и на том спасибо.',en:'A fiery little lizard. Wherever it runs, the ground burns. Warm tail, hot paws, never asks for hugs — thank goodness.'},
   ph:{ru:['Ш-ш-ш!','Горячо-горячо!'],en:['Hsss!','Hot-hot-hot!']}},
  ogon_bes:{n:'Бес-взрывник',r:10,hp:12,spd:84,dmg:6,xp:1,col:'#a0283a',beh:'bomb',bp:{r:80,warn:1,dmg:2.5,ek:.6},en:{n:'Bomb Imp'},
   lore:{ru:'Таскает горшок с искрами и всё норовит подарить его богатырю. Отойди — пусть дарит своим.',en:'Lugs a pot of sparks and keeps trying to gift it to the hero. Step back — let him gift it to his friends.'},
   ph:{ru:['Подарочек!','Бу-бух!'],en:['Present for you!','Ka-boom!']}},
  ogon_val:{n:'Лавовый валун',r:14,hp:46,spd:30,dmg:9,xp:2,col:'#4a3030',beh:'lob',bp:{cd:3.4,warn:1,r:44,pud:3,burn:.25,c:'#ff5a1a'},en:{n:'Lava Boulder'},
   lore:{ru:'Камень, который так разозлился, что раскалился. Плюётся лавой издалека, а ходит еле-еле.',en:'A rock that got so angry it turned red-hot. Spits lava from afar, but waddles along at a crawl.'},
   ph:{ru:['Пых!','Растоплю!'],en:['Pff!',"I'll melt you!"]}},
  ogon_shit:{n:'Огненный щитоносец',r:16,hp:110,spd:38,dmg:13,xp:3,col:'#c8502a',beh:'shield',bp:{k:.25,turn:1.4},en:{n:'Fire Shieldbearer'},
   lore:{ru:'Костяной витязь из Тугаринова шатра. Щит раскалён докрасна — в лоб не бей, заходи сбоку.',en:"A bone knight from Tugarin's tent. His shield is red-hot — don't hit it head-on, go round the side."},
   ph:{ru:['Щит горит!','Не пройдёшь!'],en:['My shield burns!',"You shan't pass!"]}}},
 boss:{
  ogon_kon:{n:'Огненный конь',r:28,hp:21000,spd:58,dmg:28,col:'#ff5a1a',title:{ru:'Скакун Тугарина',en:"Tugarin's Steed"},en:{n:'The Fire Horse'},
   ph:{ru:['И-го-го! Копыта горят!','С дороги — растопчу!','Где проскачу — там лава!','Искры из-под копыт!','Не догонишь!'],
       en:['Neigh! My hooves are ablaze!',"Out of my way — I'll trample you!",'Where I gallop, lava flows!','Sparks from my hooves!',"You'll never catch me!"]},
   lore:{ru:'Конь Змея Тугарина. Грива — пламя, копыта — угли. Пьёт только из огненной реки, а потом долго икает искрами.',en:"Tugarin's steed. Mane of flame, hooves of embers. Drinks only from the river of fire — then hiccups sparks for ages."},
   kit:{a:[{k:'dash',cd:4.5,w:1,col:'#ff7a2a'},{k:'trail',cd:1,dur:6,r:28,life:4.5,dmg:.2,col:'#ff6a1a'}],
        ph:[{hp:.5,add:[{k:'fan',cd:6,n:5,col:'#ff7a2a'}],sum:{id:'ogon_salam',n:4},spd:1.2,say:{ru:'Саламандры, за мной — галопом!',en:'Salamanders, follow me — gallop!'}}]}},
  tugar_r:{base:'tugar',rage:1,n:'Тугарин ярый',en:{n:'Tugarin the Furious'},title:{ru:'Хозяин огненного шатра',en:'Master of the Fiery Tent'},hpK:1.2,
   kit:{a:[{k:'wall',cd:9,fire:1,at:'line',n:3,dur:5},{k:'ogon_oblet',cd:12,R:230,dur:3.2}],
        ph:[{hp:.5,add:[{k:'rain',cd:6,n:18,gap:.22}],sum:{id:'ogon_bes',n:4},say:{ru:'Небо, гори! Лейся, огненный дождь!',en:'Burn, sky! Pour down, rain of fire!'}}]}}},
 afx:{ /* огненный вожак: крепче, оставляет горящие лужи */
  ogon_zhar:{t:{ru:'Вожак-огневик!',en:'Fire Elite!'},c:'#ff5a1a', // i18n:ru — перевод в t.en
  on(e){afxBase(e);e.hp*=1.3;e.afZ=0;},
  step(e,dt){if((e.afZ-=dt)>0)return;e.afZ=.45;if(onScreen(e,60))bzZ({k:'pud',x:e.x,y:e.y+e.r*.5,r:26,t:0,life:3,slow:1,burn:e.dmg*.3,src:e.type,c:'#ff5a1a',on:bzPud});}}},
 bk:{
  /* облёт: кружит вокруг богатыря, роняет огонь (0,8 с предупреждение) */
  ogon_oblet:{x:1,start(b,G,a){const m=b.bk.m,H=G.hero;m.a=Math.atan2(b.y-H.y,b.x-H.x);m.d=.3;m.s=Math.random()<.5?-1:1;say(b,L('Облечу — подпалю!',"I'll circle you — and singe you!"),1.4);},
   step(b,dt,G,a){const m=b.bk.m,H=G.hero,R=a.R||230,q=Math.min(1,dt*4);m.a+=m.s*dt*1.5;
     const tx=H.x+Math.cos(m.a)*R,ty=H.y+Math.sin(m.a)*R;b.face=tx<b.x?-1:1;b.x+=(tx-b.x)*q;b.y+=(ty-b.y)*q;
     if((m.d-=dt)<=0){m.d=.4;bkO(b,{k:'trail',x:b.x,y:b.y+b.r*.4,r:30,arm:.8,dur:4.5,dmg:b.dmg*.25,col:'#ff6a1a'});}
     return m.T>=(a.dur||3.2);}}},
 evs:{
  ogon_reka:{t:{ru:'Огненная река!',en:'River of fire!'},dur:0,start(G){reka(G,2,['ogon_salam','chert','chert'])}},
  ogon_reka2:{t:{ru:'Лава у шатра!',en:'Lava by the tent!'},dur:0,start(G){reka(G,3,['ogon_salam','ogon_bes','chert'])}}}});
})();

})();}catch(e){console.warn("th ogon.js",e);}

/* ---- vihr-art.js ---- */
try{(function(){
/* рисунки темы vihr «Царство Вихря» (T-vihr/A39 + ART-vihr/A15): только art()/artTint() из js/art.js; помощники — внутри (function(){…})().
   Боссы — только art() (карта рисует ART[босс].fn — у artTint нет fn). Гусь `gus` — из bol-art.js; нет его (Болото не в сборке) — основа «нетопырь». */
(function(){
const B=ART.gus?'gus':'bat';
function over(g,col,a){g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(-90,-90,180,180);g.restore();}
// пушистое облачко из кругов: [[x,y,r],…]
function puff(g,p,col,o){for(const [x,y,r] of p)ell(g,x,y,r,r*.9,col,o);for(const [x,y,r] of p)ell(g,x-r*.2,y-r*.25,r*.55,r*.45,'rgba(255,255,255,.45)',{ol:false,flat:true});}
// молния-зигзаг
function bolt(g,x,y,s,col){poly(g,[x,y,x+4*s,y,x+1*s,y+6*s,x+5*s,y+6*s,x-2*s,y+16*s,x,y+9*s,x-4*s,y+9*s],col||'#ffd84a',{lw:.8,olc:'#a06a00'});}
// смерч: стопка овалов сверху вниз
function funnel(g,y0,y1,w0,w1,col,n){for(let i=0;i<n;i++){const k=i/(n-1),y=y0+(y1-y0)*k,w=w0+(w1-w0)*k;ell(g,(i%2?1:-1)*w*.12,y,w,w*.32+1.5,col,{lw:.9});}}

// Гусь-лебедь Вихря: небесно-голубой
artTint('vihr_gus',B,'#8fb0ff');
// Облачный барашек: шерсть-облако, тёмная мордочка, рожки-завитки
art('vihr_baran',40,g=>{for(const x of[-7,-2,3,8])ln(g,[x,8,x,15],'#5a5a6a',2.2);
  puff(g,[[-9,2,7],[-3,-3,8],[5,-2,8],[9,4,6],[0,5,8]],'#f4f6ff',{lw:1});
  ell(g,13,-3,5.5,6.5,'#5a5a72');for(const s of[-1,1]){g.beginPath();g.arc(13+s*4,-8,3,0,TAU*.8);g.lineWidth=2;g.strokeStyle='#c9a46a';g.stroke();}
  eye(g,11.5,-4,1.5,{px:.4});eye(g,15.5,-4,1.5,{px:.4});ell(g,14,1,1.6,1,'#f2a6c4',{ol:false,flat:true});});
// Ветреник: дух-сквозняк, щёки надул, дует
art('vihr_vetr',42,g=>{for(const [y,w] of[[10,9],[15,6],[19,3.5]])ell(g,-4+w*.3,y,w,2.6,'#bfe6f4',{lw:.8});
  ell(g,-2,-1,12,11,'#cfeefa');ell(g,-8,1,4.5,4,'#ffc0d0',{ol:false});ell(g,4,1,4.5,4,'#ffc0d0',{ol:false});
  eye(g,-6,-5,1.9,{px:.6,angry:1});eye(g,1,-5,1.9,{px:.6,angry:1,flipB:1});ell(g,9,1,2.6,2.2,'#4a6a8a');
  for(const [y,l] of[[-3,10],[1,13],[5,9]])ln(g,[13,y,13+l,y-1],'#e8f6ff',1.6);
  ln(g,[-14,-12,-8,-15,-2,-12],'#9ad0e8',1.4);shine(g,-6,-8,4,2,.5);});
// Грозовая тучка: сердитая туча с молнией
art('vihr_tuchka',44,g=>{bolt(g,0,6,1);puff(g,[[-10,0,7],[-3,-6,9],[6,-4,8],[11,2,6],[0,3,9]],'#6a7290',{lw:1.1});
  eye(g,-4,-3,2.1,{px:0,angry:1,brow:'#22263a'});eye(g,4,-3,2.1,{px:0,angry:1,flipB:1,brow:'#22263a'});mouth(g,0,3,3,'#22263a');});
// Птица Сирин: птица с девичьим личиком и венчиком, поёт
art('vihr_sirin',46,g=>{ln(g,[-3,12,-4,18],'#e0a43a',1.6);ln(g,[3,12,4,18],'#e0a43a',1.6);
  for(const [x,c] of[[-12,'#8a4ad0'],[-9,'#f0b84a'],[-6,'#4a8ad0']])poly(g,[-6,8,x-6,16,x,6],c,{lw:.7});
  for(const s of[-1,1])shp(g,'#7a4ac0',{},[s*4,-6,s*20,10],()=>{g.moveTo(s*4,0);g.quadraticCurveTo(s*18,-8,s*20,4);g.quadraticCurveTo(s*12,6,s*4,8);g.closePath();});
  ell(g,0,4,8,9,'#9a62e0');ell(g,0,7,5,5,'#f0c060',{ol:false});
  ell(g,0,-8,6.5,6.5,'#f6d2b0');shp(g,'#5a3a2a',{},[-7,-15,7,-6],()=>{g.moveTo(-7,-6);g.quadraticCurveTo(-8,-15,0,-15);g.quadraticCurveTo(8,-15,7,-6);g.quadraticCurveTo(0,-12,-7,-6);});
  poly(g,[-6,-13,-4,-19,-1,-15,0,-20,1,-15,4,-19,6,-13],'#ffd84a',{lw:.7});
  ln(g,[-4,-8,-1.5,-8.5],'#3a2a2a',1);ln(g,[1.5,-8.5,4,-8],'#3a2a2a',1);ell(g,0,-4.5,1.4,1.7,'#c04060',{ol:false,flat:true});
  for(const [x,y] of[[9,-14],[12,-10]]){ell(g,x,y,1.4,1.1,'#4a2a6a',{ol:false,flat:true});ln(g,[x+1.2,y,x+1.2,y-4.5],'#4a2a6a',.8);}});
// Вихрёнок: маленький смерч с глазками
art('vihr_vihrenok',34,g=>{funnel(g,-8,11,11,2.5,'#c8d4ec',6);eye(g,-3,-6,1.8,{px:.3});eye(g,3,-6,1.8,{px:.3});
  ln(g,[-10,-11,-4,-13,3,-12],'#ffffff',1.2);shine(g,-5,-10,3,1.4,.5);});

// Вожак гусей-лебедей: большой гусь, золотой хохолок и венчик
art('vihr_vozhak',96,g=>{g.save();g.scale(2,2);ART[B].fn(g);g.restore();over(g,'#6a8cff',.25);
  for(const a of[-.5,-.15,.2])ell(g,22+Math.cos(a-1.6)*6,-33+Math.sin(a-1.6)*6,1.8,5,'#ffd84a',{rot:a,lw:.6});
  poly(g,[14,-29,16,-34,19,-30,22,-36,25,-30,28,-34,29,-28],'#ffc94a',{lw:.8});
  for(const [x,y] of[[-16,4],[-8,10],[-22,-2]])ell(g,x,y,3,1.4,'#ffd84a',{rot:.4,ol:false});});
// Гром-баба: туча-баба, седые клубы, косы-молнии
art('vihr_grom',104,g=>{for(const s of[-1,1]){g.save();g.translate(s*15,8);g.rotate(s*.25);bolt(g,0,0,1.4);g.restore();}
  puff(g,[[-26,4,14],[-14,-10,16],[14,-10,16],[26,4,14],[0,12,18],[-14,16,12],[14,16,12]],'#5a6688',{lw:1.4});
  puff(g,[[-12,-24,9],[0,-30,10],[12,-24,9]],'#e8ecf6',{lw:1});
  ell(g,0,-6,17,16,'#c4cee6');ell(g,-10,-1,4.4,3,'#f2a6c4',{ol:false});ell(g,10,-1,4.4,3,'#f2a6c4',{ol:false});
  eye(g,-6.5,-10,3.8,{px:0,angry:1,col:'#2a3a8a'});eye(g,6.5,-10,3.8,{px:0,angry:1,flipB:1,col:'#2a3a8a'});
  shp(g,'#3a2a3a',{},[-6,-1,6,7],()=>{g.moveTo(-6,0);g.quadraticCurveTo(0,9,6,0);g.closePath();});});
// Вихорь: тело-смерч, лицо в раструбе, борода уходит в вихрь
art('vihr_vihor',120,g=>{funnel(g,-6,48,34,6,'#9aa4c8',9);
  for(const y of[2,16,30])ln(g,[-20+y*.3,y,0,y+5,20-y*.3,y],'rgba(255,255,255,.55)',1.6);
  ell(g,0,-26,36,13,'#b8c0dc',{lw:1.4});ell(g,0,-22,15,14,'#e6d6c8');
  shp(g,'#eef0f8',{},[-14,-16,14,20],()=>{g.moveTo(-13,-18);g.quadraticCurveTo(-14,4,-2,20);g.quadraticCurveTo(0,10,4,18);g.quadraticCurveTo(14,2,13,-18);g.quadraticCurveTo(0,-10,-13,-18);});
  for(const s of[-1,1])ell(g,s*6,-25,6.5,2.8,'#eef0f8',{rot:-s*.25,lw:.8});
  eye(g,-5.5,-23,3,{px:0,angry:1,col:'#4a2a8a',brow:'#c8ccdc'});eye(g,5.5,-23,3,{px:0,angry:1,flipB:1,col:'#4a2a8a',brow:'#c8ccdc'});
  ell(g,0,-12,3,2.2,'#4a2a3a',{ol:false});for(const a of[-.9,-.3,.3,.9])ln(g,[Math.sin(a)*30,-34,Math.sin(a)*44,-46],'#cfd6ec',2.4);
  poly(g,[-12,-36,-9,-46,-4,-39,0,-49,4,-39,9,-46,12,-36],'#ffd84a',{lw:1});ell(g,0,-42,2,2,'#4ad0ff',{lw:.6});});

// декор: облачко, небесный мосток, теремок на туче, радуга, ветряная мельница
art('vihr_d_oblak',70,g=>{puff(g,[[-16,4,11],[-4,-4,14],[12,0,12],[22,6,8],[2,8,12]],'#fff6fa',{ol:false});});
art('vihr_d_most',80,g=>{puff(g,[[-30,8,9],[30,8,9]],'#fff6fa',{ol:false});ln(g,[-30,-6,0,-1,30,-6],'#8a5a32',1.4);
  for(let x=-24;x<=24;x+=8)shp(g,'#c08a50',{lw:.8},[x-3.5,-2,x+3.5,4],()=>{rrect(g,x-3.5,-2+Math.abs(x)*-.12,7,6,1.2);});
  for(const x of[-28,28])ln(g,[x,6,x,-10],'#7a4a26',2.4);});
art('vihr_d_terem',90,g=>{puff(g,[[-20,22,11],[-6,26,13],[10,25,12],[22,20,9]],'#fff0f4',{ol:false});
  shp(g,'#c86a4a',{},[-12,-6,12,20],()=>{rrect(g,-12,-6,24,26,2);});for(const y of[0,7,14])ln(g,[-11,y,11,y],'#8a3a2a',.9);
  poly(g,[-16,-5,0,-26,16,-5],'#3a7ac8');poly(g,[-2,-26,0,-34,2,-26],'#ffd84a',{lw:.6});
  shp(g,'#ffe08a',{flat:1,olc:'#6a2a1a',lw:1.2},[-5,1,5,10],()=>{rrect(g,-5,1,10,9,4);});});
art('vihr_d_raduga',96,g=>{for(const [r,c] of[[34,'#ff7a7a'],[30,'#ffb84a'],[26,'#ffe66a'],[22,'#7ad07a'],[18,'#7ab0ff'],[14,'#b07aff']]){g.beginPath();g.arc(0,12,r,Math.PI,0);g.lineWidth=4.2;g.strokeStyle=c;g.globalAlpha=.75;g.stroke();}
  g.globalAlpha=1;puff(g,[[-28,12,9],[-18,16,7],[28,12,9],[18,16,7]],'#ffffff',{ol:false});});
art('vihr_d_mel',90,g=>{ell(g,4,30,18,6,'rgba(0,0,0,.12)',{ol:false,flat:true});
  poly(g,[-10,30,-7,-6,7,-6,10,30],'#b08050');poly(g,[-12,-5,0,-18,12,-5],'#7a4a2a');shp(g,'#5a3a1e',{flat:1},[-3,14,3,30],()=>{rrect(g,-3,18,6,12,2.5);});
  for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;g.save();g.translate(0,-10);g.rotate(a);shp(g,'#f4ead2',{lw:.8},[3,-4,30,4],()=>{rrect(g,6,-4,24,8,1);});ln(g,[0,0,30,0],'#6a4a2a',1.6);g.restore();}
  ell(g,0,-10,2.6,2.6,'#5a3a1e');});
})();

})();}catch(e){console.warn("th vihr-art.js",e);}

/* ---- vihr.js ---- */
try{(function(){
/* тема vihr «Царство Вихря» (T-vihr, A39): новая земля, главы 1–3 = слоты 28/29/30. Формат — ENGINE-API.md §3/§10.
   Повадки (dash/split/wind/lob/aura/orbit), особенности вожаков (fast/tough/frost/summon/shield) и приёмы боссов (dash/fan/summon/zones/beam/rain/pull/split/ring) — из js/beh.js и js/bk.js.
   Свои события: «Ураган» (ветер сносит богатыря 10 с; полоса-предупреждение 1,2 с) и «Гроза» (молнии по кругам ≥1 с) — зоны в G.warn (рисует и тикает BEH_FRAME, бот видит). */
(function(){
const WARN=1.2;
function room(G){return (G.warn||[]).filter(z=>!z.bk).length<17;}
/* ураган: зона-полоса ветра едет вместе с богатырём; f — доля его скорости; rot — поворот ветра, рад/с; n врагов налетают с наветренной стороны */
function gale(G,f,rot,n,ids,dur){const H=G.hero,a=rand(0,TAU),R=VIEW.R;G.vihrU={a,f,rot,z:null};
  if(room(G)){const z={k:'wind',x:H.x,y:H.y,x2:H.x,y2:H.y,r:150,t:WARN,t0:WARN,life:dur-WARN+.1,dx:1,dy:0};(G.warn||(G.warn=[])).push(z);G.vihrU.z=z;}
  const ux=Math.cos(a),uy=Math.sin(a);
  for(let i=0;i<n;i++){const o=(i/(n-1||1)-.5)*R*1.6,e=mkEnemy(ids[i%ids.length],H.x-ux*R*.95-uy*o,H.y-uy*R*.95+ux*o);e.spd*=1.25;}}
function blow(G,dt,t,dur){const U=G.vihrU;if(!U)return;const H=G.hero;U.a+=U.rot*dt;const ux=Math.cos(U.a),uy=Math.sin(U.a),z=U.z;
  if(z){z.x=H.x-ux*260;z.y=H.y-uy*260;z.x2=H.x+ux*260;z.y2=H.y+uy*260;z.dx=ux;z.dy=uy;if(t>=dur-.05){z.dead=1;z.life=0;z.t=0;}}
  if(t>WARN&&t<dur){const k=G.st.spd*U.f*dt;H.x+=ux*k;H.y+=uy*k;}}
/* гроза: n молний по очереди (каждая 3-я — в богатыря): жёлтый круг ≥1 с → удар */
function storm(_,n){for(let i=0;i<n;i++)later(i*.55,()=>{if(!G||G.over||G.win||!room(G))return;const H=G.hero,aim=i%3===0,x=H.x+(aim?rand(-25,25):rand(-240,240)),y=H.y+(aim?rand(-25,25):rand(-200,200));
  (G.warn||(G.warn=[])).push({k:'lob',x,y,r:50,t:1.05,t0:1.05,life:0,c:'#ffd84a',fn(z){burst(z.x,z.y,'#fff3a0',qLow()?6:14,190);SND.boom();
    if(!CALM())G.fx.push({k:'boom',x:z.x,y:z.y,t:0,dur:.35,r:z.r*1.2});const Hh=G.hero;if((Hh.x-z.x)**2+(Hh.y-z.y)**2<(z.r+8)**2)hurtHero(9*G.ch.dmg*(G.emD||1),'vihr_tuchka');}});});}
THEME_ADD({id:'vihr',
 th:{name:'Царство Вихря',sub:'Ветер воет — гуси летят',en:{name:'Realm of the Whirlwind',sub:'The wind howls, the geese fly'},
  ground:{base:'#efc4d2',hi:'#f8d6e0',lo:'#e2b0c2',grass:'#d095b2',flow:['#fff6d0','#ffffff','#ffc890']},
  decor:['vihr_d_oblak','vihr_d_most','vihr_d_terem','vihr_d_raduga','vihr_d_mel'],tint:'rgba(255,190,120,.06)',bright:1,dark:0,
  mc:'#f0a8c8',map:[.73,.18],ev:'vihr_uragan',reward:{k:'bld',id:'mel',ru:'Ветряная мельница',en:'Windmill'}},
 ch:[
  {slot:28,n:1,name:'Облачные мостки',sub:'Тут ходят по тучам, а падают — в сказку',
   en:{name:'Cloud Bridges',sub:'Here you walk on clouds — and fall into a fairy tale'},
   w:[{id:'vihr_gus',t:0,v:1},{id:'vihr_baran',t:30,v:.9},{id:'vihr_vetr',t:90,v:.7},{id:'ognev',t:165,v:.3,g:1}],
   el:[{id:'vihr_gus',fx:['fast']},{id:'vihr_baran',fx:['tough']}],
   ev:['vihr_uragan'],boss:'vihr_vozhak'},
  {slot:29,n:2,name:'Грозовая туча',sub:'Гром гремит — баба сердится',
   en:{name:'Thunderhead',sub:'Thunder rumbles — someone is cross'},
   w:[{id:'vihr_gus',t:0,v:1},{id:'vihr_baran',t:0,v:.6},{id:'vihr_tuchka',t:30,v:.9},{id:'vihr_vetr',t:60,v:.6},{id:'vihr_sirin',t:100,v:.5},{id:'ognev',t:165,v:.3,g:1}],
   el:[{id:'vihr_sirin',fx:['frost']},{id:'vihr_tuchka',fx:['tough']},{id:'vihr_gus',fx:['fast']}],
   ev:['vihr_uragan',{k:'vihr_groza',t:115}],boss:'vihr_grom'},
  {slot:30,n:3,name:'Терем Вихря',sub:'Логово',hook:'Вихорь унёс царицу в свой терем на тучах',
   en:{name:"Whirlwind's Tower",sub:'The Lair',hook:'The Whirlwind carried the tsaritsa off to his tower in the clouds'},
   w:[{id:'vihr_gus',t:0,v:1},{id:'vihr_baran',t:0,v:.6},{id:'vihr_vetr',t:30,v:.6},{id:'vihr_tuchka',t:60,v:.6},{id:'vihr_vihrenok',t:90,v:.9},{id:'vihr_sirin',t:120,v:.5}],
   el:[{id:'vihr_vihrenok',fx:['summon']},{id:'vihr_sirin',fx:['frost']},{id:'vihr_baran',fx:['tough']},{id:'vihr_tuchka',fx:['shield']}],
   ev:['vihr_uragan2',{k:'vihr_groza',t:100}],mb:{id:'vihr_vozhak',t:150},boss:'vihr_vihor',nt:1,bright:0,
   ground:{base:'#cfa4c6',hi:'#dcb4d4',lo:'#c094b8',grass:'#a87aa4',flow:['#ffe9a8','#ffffff']},tint:'rgba(70,30,120,.12)'}],
 en:{
  vihr_gus:{n:'Небесный гусь',r:11,hp:16,spd:84,dmg:7,xp:2,col:'#8fb0ff',fly:1,beh:'dash',bp:{cd:3.5,warn:.9},en:{n:'Sky Goose'},
   lore:{ru:'Из стаи гусей-лебедей, только летает выше и щиплется больнее. Пикирует по прямой — шагни вбок.',en:'One of the swan-geese, but flies higher and pecks harder. Dives in a straight line — step aside.'},
   ph:{ru:['Га-га!','С неба — щип!'],en:['Honk!','A peck from the sky!']}},
  vihr_baran:{n:'Облачный барашек',r:12,hp:22,spd:50,dmg:6,xp:2,col:'#f4f6ff',beh:'split',bp:{n:2},en:{n:'Cloud Lamb'},
   lore:{ru:'Пушистый, как облако, и такой же упрямый. Стукнешь — разлетится на клочки, и клочки тоже бодаются.',en:'Fluffy as a cloud and just as stubborn. Hit it and it bursts into tufts — and the tufts butt too.'},
   ph:{ru:['Бе-е!','Бодну!'],en:['Baa!','Headbutt!']}},
  vihr_vetr:{n:'Ветреник',r:12,hp:24,spd:52,dmg:7,xp:2,col:'#cfeefa',fly:1,beh:'wind',bp:{cd:5.5,dur:1.6,f:.55},en:{n:'Draught Sprite'},
   lore:{ru:'Надувает щёки и дует так, что шапку уносит вместе с богатырём. Иди против ветра — сдуется сам.',en:'Puffs up his cheeks and blows your hat away — hero included. Walk into the wind; he runs out of puff.'},
   ph:{ru:['Фу-у-у!','Сдую!'],en:['Whooo!',"I'll blow you away!"]}},
  vihr_tuchka:{n:'Грозовая тучка',r:13,hp:26,spd:44,dmg:8,xp:2,col:'#6a7290',fly:1,beh:'lob',bp:{cd:3.6,warn:1,r:46,c:'#ffd84a'},en:{n:'Storm Cloudlet'},
   lore:{ru:'Маленькая, а хмурится, как большая. Метит место жёлтым кругом и бьёт туда молнией — не стой под тучей.',en:'Small, but frowns like a big one. Marks a spot with a yellow circle and strikes it with lightning — don’t stand under it.'},
   ph:{ru:['Бабах!','Гр-р-ром!'],en:['Ka-boom!','Rumble!']}},
  vihr_sirin:{n:'Птица Сирин',r:13,hp:40,spd:46,dmg:7,xp:3,col:'#9a62e0',fly:1,beh:'aura',bp:{r:150},en:{n:'Sirin Bird'},
   lore:{ru:'Поёт так сладко, что нечисть рядом бодрее, а богатырь заслушивается. Бей певунью первой.',en:'Sings so sweetly that nearby monsters perk up and heroes forget to move. Hit the singer first.'},
   ph:{ru:['Ля-ля-а-а…','Слушай меня!'],en:['La-la-la…','Listen to me!']}},
  vihr_vihrenok:{n:'Вихрёнок',r:10,hp:14,spd:88,dmg:6,xp:1,col:'#c8d4ec',beh:'orbit',bp:{R:180},en:{n:'Little Twister'},
   lore:{ru:'Сынок Вихря. Кружит хороводом всё ближе и ближе — прорывайся, пока кольцо не сжалось.',en:'The Whirlwind’s little son. Circles you closer and closer — break out before the ring closes.'},
   ph:{ru:['Кругом-кругом!','Закружу!'],en:['Round and round!',"I'll spin you!"]}}},
 boss:{
  vihr_vozhak:{n:'Вожак гусей-лебедей',r:28,hp:22000,spd:50,dmg:30,col:'#8fb0ff',fly:1,
   title:{ru:'Ведёт клин под самые тучи',en:'Leads the wedge up to the clouds'},en:{n:'Swan-Goose Leader'},
   ph:{ru:['Га-га-га! Стая, клином!','Перьями закидаю!','С неба виднее!','Ущипну так ущипну!','Летим, летим!'],
       en:['Honk-honk! Wedge formation!',"I'll bury you in feathers!",'Everything looks smaller from the sky!',"Here comes a proper peck!",'Fly, fly!']},
   lore:{ru:'Старший гусь в стае. Носит золотой хохолок и важничает. Налетает клином и сыплет перьями веером.',en:'The eldest goose of the flock, proud of his golden crest. Charges in a wedge and showers feathers in a fan.'},
   kit:{a:[{k:'dash',cd:5,rep:2},{k:'fan',cd:6,n:7},{k:'summon',cd:12,id:'vihr_gus',n:5}],
        ph:[{hp:.5,add:[{k:'fan',cd:4,n:9,rep:2}],sum:{id:'vihr_gus',n:6},say:{ru:'Все за мной — клином!',en:'Everyone, follow me — wedge!'}}]}},
  vihr_grom:{n:'Гром-баба',g:'f',r:32,hp:23000,spd:40,dmg:31,col:'#5a6688',
   title:{ru:'Хозяйка грозовой тучи',en:'Mistress of the Thunderhead'},en:{n:'Thunder Granny'},
   ph:{ru:['Кто тут по моей туче топает?','Сейчас как громыхну!','Тучки, ко мне!','Ух, молнией причешу!','Не стой под тучей, кому говорят!'],
       en:['Who’s stomping on my cloud?',"I'll give you a thunderclap!",'Cloudlets, to me!',"I'll comb you with lightning!","Don't stand under the cloud, I said!"]},
   lore:{ru:'Ворчливая хозяйка грозы. Косы — молнии, голос — гром. Ставит тучи-ловушки и бьёт молнией лучом.',en:'The grumpy mistress of storms: lightning for braids, thunder for a voice. Sets cloud traps and fires lightning beams.'},
   kit:{a:[{k:'zones',cd:6,n:4},{k:'beam',cd:9},{k:'summon',cd:13,id:'vihr_tuchka',n:3}],
        ph:[{hp:.5,add:[{k:'rain',cd:8,n:9}],sum:{id:'vihr_tuchka',n:4},say:{ru:'Ну, держись — гроза идёт!',en:'Brace yourself — here comes the storm!'}}]}},
  vihr_vihor:{n:'Вихорь',r:36,hp:25000,spd:44,dmg:32,col:'#9aa4c8',
   title:{ru:'Унёс царицу на край неба',en:'Carried the tsaritsa off to the sky’s edge'},en:{n:'The Whirlwind'},
   ph:{ru:['У-у-у! Кто посмел подняться в моё царство?','Закружу-завью!','Царицу не отдам!','Все ветра — ко мне!','Нас трое — угадай, где я!'],
       en:['Whooo! Who dares climb into my realm?',"I'll spin you and twirl you!","You won't get the tsaritsa!",'All winds, to me!','There are three of us — guess which is me!']},
   lore:{ru:'Сам Вихорь: тело — смерч, борода — облако. Утащил царицу и думает, что никто не догонит. Тянет в воронку, а битый делится на три смерча.',en:'The Whirlwind himself: a tornado for a body, a cloud for a beard. Stole the tsaritsa and thinks nobody can catch him. Pulls you into his funnel and, when hurt, splits into three twisters.'},
   kit:{a:[{k:'pull',cd:8,dur:2.6},{k:'zones',cd:6,n:4,r:64},{k:'summon',cd:14,id:'vihr_vihrenok',n:5}],
        ph:[{hp:.6,add:[{k:'split',cd:16,n:3}],say:{ru:'Нас трое — угадай, где я!',en:'There are three of us — guess which is me!'}},
            {hp:.3,add:[{k:'ring',cd:6,n:14}],sum:{id:'vihr_vetr',n:3},say:{ru:'Все ветра — ко мне!',en:'All winds, to me!'}}]}}},
 evs:{
  vihr_uragan:{t:{ru:'Ураган!',en:'Hurricane!'},dur:10+WARN,
   start(G){gale(G,.42,.12,16,['vihr_gus','vihr_gus','vihr_vetr'],10+WARN);banner(L('Иди против ветра!','Walk against the wind!'),L('Ветер сносит богатыря','The wind is blowing the hero away'),3);},
   step(G,dt,t){blow(G,dt,t,10+WARN)}},
  vihr_uragan2:{t:{ru:'Ураган Вихря!',en:"The Whirlwind's Hurricane!"},dur:12+WARN,
   start(G){gale(G,.5,.3,22,['vihr_gus','vihr_vihrenok','vihr_vetr'],12+WARN);banner(L('Ветер крутит!','The wind is turning!'),L('Держись против ветра','Keep walking against it'),3);},
   step(G,dt,t){blow(G,dt,t,12+WARN)}},
  vihr_groza:{t:{ru:'Гроза!',en:'Thunderstorm!'},dur:0,
   start(G){storm(G,14);banner(L('Молнии!','Lightning!'),L('Уходи из жёлтых кругов','Leave the yellow circles'),3);}}}
});
})();

})();}catch(e){console.warn("th vihr.js",e);}

/* ---- lih-art.js ---- */
try{(function(){
/* рисунки темы lih (T-lih): Кот Баюн, Кривда, Лихо-морок, камень */
art('lih_bayun',112,g=>{
  ln(g,[24,30,44,22,49,0,42,-14],'#5e6272',9);ln(g,[24,30,44,22,49,0,42,-14],'#7a7f8f',5);
  ell(g,0,20,31,29,'#7a7f8f');ell(g,0,26,17,19,'#d4d7e0',{ol:false});
  for(const s of[-1,1])for(let i=0;i<3;i++)ln(g,[s*30,6+i*11,s*20,10+i*11],'#4a4e5c',3);
  ell(g,-13,46,10,6.5,'#8a8f9f');ell(g,13,46,10,6.5,'#8a8f9f');
  for(const s of[-1,1]){poly(g,[s*24,-28,s*22,-52,s*6,-38],'#8a8f9f');poly(g,[s*20,-32,s*19,-46,s*10,-38],'#e8a0b0',{ol:false});}
  ell(g,0,-20,27,22,'#8a8f9f');for(const x of[-6,0,6])ln(g,[x,-40,x*.7,-32],'#4a4e5c',2.6);
  for(const s of[-1,1]){eye(g,s*10,-22,5.4,{white:'#c8f06a',col:'#141414',px:0});ln(g,[s*15.5,-25,s*4.5,-24],'#5e6272',3.4);
    for(const d of[-3,1,5])ln(g,[s*9,-10+d*.4,s*30,-14+d*1.2],'rgba(240,240,250,.85)',1);}
  poly(g,[-3,-14,3,-14,0,-10],'#e87a9a',{ol:false});ln(g,[-6,-7,-3,-5,0,-8,3,-5,6,-7],'#3a2a30',1.6);
  ln(g,[-20,0,-8,6,8,6,20,0],'#e6b53a',3.4);for(const x of[-14,-4,4,14])ell(g,x,x<-8||x>8?3.4:5.6,2.2,2,'#ffd84a',{lw:.6});
  ell(g,0,10,4,4,'#ffd84a');shine(g,-12,10,10,5,.22);});
art('lih_krivda',44,g=>{
  ln(g,[13,-12,16,20],'#6a4a2a',2.4);ln(g,[13,-12,10,-16,13,-19],'#6a4a2a',2.4);
  shp(g,'#6a3a6a',{},[-14,-8,13,20],()=>{g.moveTo(-3,-8);g.quadraticCurveTo(10,-2,13,20);g.quadraticCurveTo(0,22,-14,19);g.quadraticCurveTo(-12,2,-3,-8);});
  ell(g,-1,-9,8,8,'#e0cfa8');shp(g,'#8a4a8a',{},[-11,-20,10,-4],()=>{g.moveTo(-11,-6);g.quadraticCurveTo(-12,-20,1,-20);g.quadraticCurveTo(12,-18,9,-10);g.quadraticCurveTo(0,-15,-6,-8);g.lineTo(-10,-2);});
  eye(g,-4,-9,2.6,{col:'#2a1a2a',px:.4});eye(g,2.5,-10,1.6,{col:'#2a1a2a',px:.4});poly(g,[0,-8,5,-4,1,-5],'#d0b090');
  g.beginPath();g.moveTo(-5,-3);g.quadraticCurveTo(0,-1,4,-5);g.lineWidth=1.3;g.strokeStyle='#3a1a24';g.stroke();});
art('lih_morok',46,g=>{
  g.globalAlpha=.78;g.save();g.scale(.31,.31);ART.liho.fn(g);g.restore();g.globalAlpha=1;
  g.globalCompositeOperation='source-atop';g.fillStyle='rgba(150,100,230,.38)';g.fillRect(-23,-23,46,46);g.globalCompositeOperation='source-over';});
art('lih_kamen',70,g=>{
  ell(g,4,22,26,8,'rgba(0,0,0,.18)',{ol:false,flat:true});poly(g,[-18,22,-16,-14,-6,-24,10,-22,18,-8,20,22],'#8a8a98',{hl:.5});
  for(const y of[-10,-2,6,14])ln(g,[-10,y,10,y-1],'rgba(40,30,60,.55)',1.6);});

})();}catch(e){console.warn("th lih-art.js",e);}

/* ---- lih.js ---- */
try{(function(){
/* тема lih (T-lih, A40): слоты 31 «Перепутье», 32 «Логово Лиха» (финал). Своё: повадка lih_krivda, приёмы lih_song, lih_t. */
(function(){
const H_=()=>G.hero;
/* колыбельная: круг r, потом пояс r…r2; задело — сон a.sl с */
const song={start(b,G,a){const m=b.bk.m;m.w=Math.max(.8,a.w||1.2);m.hold=1;m.x=b.x;m.y=b.y;m.st=0;m.z=0;
    bkO(b,{k:'song',x:b.x,y:b.y,r:a.r||170,arm:m.w,dur:m.w+.3});say(b,L('Баю-баюшки-баю…','Hush-a-bye, hero…'),1.4);},
  step(b,dt,G,a){const m=b.bk.m,H=H_(),r=a.r||170,d=Math.hypot(H.x-m.x,H.y-m.y),t2=m.w*2+.4;
    if(m.z>0){m.z-=dt;H.x=m.hx;H.y=m.hy;H.kx=H.ky=0;}
    const nap=()=>{if(m.z>0)return;m.z=a.sl||1;m.hx=H.x;m.hy=H.y;bkPt(10,'#c8a8ff',H.x,H.y-20,60,.8);bkSnd('zap');};
    if(m.st===0&&m.T>=m.w){m.st=1;if(d<r)nap();}
    if(m.st===1&&m.T>=t2){m.st=2;if(d>=r&&d<(a.r2||330))nap();}
    return m.st===2&&m.z<=0;},
  draw(c,b,G,a){const m=b.bk.m,H=H_(),r=a.r||170,r2=a.r2||330,cm=CALM(),f=(q,o)=>{c.fillStyle='rgba(170,130,255,'+(cm?.2:.12+.18*q)+')';c.fill(o);};
    const q1=Math.min(1,m.T/m.w),q2=clamp((m.T-m.w-.4)/m.w,0,1);
    if(m.st===0){c.beginPath();c.arc(m.x,m.y,r,0,TAU);f(q1);c.strokeStyle='rgba(200,170,255,.9)';c.lineWidth=2;c.beginPath();c.arc(m.x,m.y,r*q1,0,TAU);c.stroke();}
    else if(m.st===1&&m.T>m.w+.4){c.beginPath();c.arc(m.x,m.y,r2,0,TAU);c.arc(m.x,m.y,r,0,TAU,true);f(q2,'evenodd');c.strokeStyle='rgba(200,170,255,.9)';c.lineWidth=2;c.beginPath();c.arc(m.x,m.y,r+(r2-r)*q2,0,TAU);c.stroke();}
    c.font='800 18px '+CVL.font;c.textAlign='center';c.fillStyle='#e8d8ff';
    for(let i=0;i<6;i++){const an=i/6*TAU+G.t*(cm?0:.8),R=m.st?r2-30:r-20;c.fillText('♪',m.x+Math.cos(an)*R,m.y+Math.sin(an)*R);}
    if(m.z>0)for(let i=0;i<3;i++)c.fillText('z',H.x+8+i*7,H.y-34-i*9-(cm?0:(G.t*20%9)));}};
/* тьма ~11 с */
const dark={pass:1,start(){G.fogT=12.5;G.fogK='night';},step(){return true;}};
/* Кривда: dash + decoy; копии без урона, но тоже рвутся */
const krivda={on(e){BEH.dash.on(e);e.kc=rand(2,4);if(BZ.dc){e.dc=1;e.hp=1e6;e.dmg=0;e.xp=0;e.dl=6;}},
  step(e,dt){if(e.dc){e.dl-=dt;if(e.dl<=0){bzPuff(e);e.dead=true;return true;}return BEH.dash.step(e,dt);}
    e.kc-=dt;if(e.kc<=0&&!e.bs&&onScreen(e,0)){e.kc=e.bp.cd*2+3;const n=Math.min(2,bzRoom());
      if(n>0)later(0,()=>{if(e.dead)return;const ks=[];for(let i=0;i<n;i++){const a=rand(0,TAU);BZ.dc=1;let k;try{k=bzKid(e.type,e.x+Math.cos(a)*40,e.y+Math.sin(a)*40);}finally{BZ.dc=0;}
        k.sc=e.sc;k.r=e.r;k.max=k.hp;ks.push(k);bzPuff(k);}bzPuff(e);const s=ks[Math.floor(Math.random()*ks.length)];if(s){const x=s.x,y=s.y;s.x=e.x;s.y=e.y;e.x=x;e.y=y;}});}
    return BEH.dash.step(e,dt);},
  hit(e,d){return BEH.decoy.hit(e,d);}};
/* три ватаги гостей с трёх сторон */
function gosti(G,n){const H=G.hero,R=VIEW.R,a=rand(0,TAU),grp=[['wolf','les_volkolak'],['lih_vityaz','skel'],['chert','lih_chert']];
  grp.forEach((g,j)=>{const an=a+(j-1)*2.1;for(let i=0;i<n;i++){const id=EN[g[i%2]]?g[i%2]:g[0],d=R*rand(.7,.9),s=an+rand(-.25,.25);mkEnemy(id,H.x+Math.cos(s)*d,H.y+Math.sin(s)*d);}});
  banner(L('Все дороги — сюда!','All roads lead here!'),L('Налево — волки, прямо — латники, направо — черти','Wolves left, knights ahead, imps right'),4);}
const lo=(ru,en)=>({ru,en});
THEME_ADD({id:'lih',
 ch:[
  {slot:31,n:2,name:'Перепутье',sub:'Набег',hook:'Все дороги сказки сошлись у одного камня',
   en:{name:'The Crossroads',sub:'The Raid',hook:'Every road of the tale meets at one stone'},
   w:[{id:'wolf',t:0,v:1,e:80,g:1},{id:'kik',t:0,v:.6,e:80,g:1},{id:'les_volkolak',t:10,v:.6,e:90,g:1},{id:'bol_piyav',t:20,v:.5,e:90,g:1},
      {id:'lih_morok',t:30,v:.5},{id:'skel',t:65,v:1,e:155,g:1},{id:'voron',t:65,v:.5,e:155,g:1},{id:'lih_vityaz',t:75,v:.5,e:160,g:1},
      {id:'wolf_i',t:140,v:1,e:225,g:1},{id:'rak',t:140,v:.5,e:225,g:1},{id:'lih_snow',t:145,v:.6,e:230,g:1},
      {id:'chert',t:210,v:1,g:1},{id:'skel_f',t:215,v:.5,g:1},{id:'lih_chert',t:215,v:.6,g:1},{id:'prizr',t:240,v:.4}],
   el:[{id:'lih_morok',fx:['tough']},{id:'lih_vityaz',fx:['shield']},{id:'lih_snow',fx:['frost']},{id:'lih_chert',fx:['bomb']}],
   ev:['lih_gosti'],boss:'lih_bayun',decor:['lih_kamen','d_crystal','d_dead','d_grave','d_crystal']},
  {slot:32,n:3,name:'Логово Лиха',sub:'Логово',hook:'Лихо проснулось. Последняя дорога Руси — к нему',
   en:{name:"Likho's Lair",sub:'The Lair',hook:"Likho has woken. The last road of the tale leads to it"},
   w:[{id:'chert',t:0,v:1},{id:'lih_morok',t:0,v:.6},{id:'prizr',t:20,v:.6},{id:'lih_krivda',t:40,v:.7},{id:'koldun',t:90,v:.5},
      {id:'lih_vityaz',t:120,v:.4},{id:'shatun',t:165,v:.3},{id:'lih_chert',t:200,v:.5}],
   el:[{id:'lih_krivda',fx:['fast']},{id:'lih_morok',fx:['tough']},{id:'koldun',fx:['heal']},{id:'shatun',fx:['vamp']}],
   ev:['lih_tma',{k:'lih_gosti',t:100}],mb:{id:'lih_bayun',t:150},boss:'liho',bv:'liho_r',nt:1,dark:1}],
 en:{
  lih_morok:{n:'Лихо-морок',r:12,hp:22,spd:60,dmg:9,xp:2,col:'#9a7ad8',beh:'decoy',bp:{n:2,cd:8},en:{n:'Likho Mirage'},
   lore:lo('Маленькое Лихо из тумана. Двоится, а настоящее — одно.','A little Likho of mist. It doubles, but only one is real.'),
   ph:{ru:['Я тут… или там?','Угадай!'],en:['Here… or there?','Guess!']}},
  lih_krivda:{n:'Кривда',g:'f',r:12,hp:40,spd:56,dmg:11,xp:2,col:'#8a4a8a',beh:'lih_krivda',bp:{cd:4,warn:1},en:{n:'Falsehood'},
   lore:lo('Сестра Правды наоборот. Рвётся напрямик, а копии — понарошку. Какая полоса не врёт?','Truth’s backwards sister. Her copies only pretend to dash. Which line is true?'),
   ph:{ru:['Правду говорю!','Честное кривое!'],en:['I’m telling the truth!','Cross my crooked heart!']}},
  lih_vityaz:{n:'Костяной латник',r:15,hp:60,spd:40,dmg:12,xp:2,col:'#5b5f82',art:'rycar',beh:'march',bp:{n:4},en:{n:'Bone Guardsman'},
   lore:lo('Гость от Кощея. Ходит строем и только прямо.','Koschei’s guest. Marches in line, straight ahead only.')},
  lih_snow:{n:'Снежный озорник',r:13,hp:30,spd:36,dmg:8,xp:2,col:'#f4f8ff',art:'snow',beh:'lob',bp:{cd:3.4},en:{n:'Snow Prankster'},
   lore:lo('Гость со Студёных гор. Кидает снежки навесом.','From the Frosty Mountains. Lobs snowballs high.')},
  lih_chert:{n:'Чертёнок-поджигатель',r:10,hp:20,spd:84,dmg:6,xp:1,col:'#d0302a',art:'chert',beh:'trail',bp:{burn:.4,c:'#ff7a2a'},en:{n:'Firebug Imp'},
   lore:lo('Гость из Огненной земли. Где пробежит — там горит.','From the Fiery Land. Wherever he runs, it burns.')}},
 boss:{
  lih_bayun:{n:'Кот Баюн',r:34,hp:24000,spd:44,dmg:30,col:'#7a7f8f',title:lo('Сказочник-усыпитель','The Lulling Storyteller'),en:{n:'Bayun the Cat'},
   ph:{ru:['Мур-р… Садись, богатырь, расскажу сказку — про то, как ты уснул!','Баю-бай, богатырь!','Глазки закрываются…','Мур-р-р… зевни разок!'],
       en:['Purr… Sit down, hero, I’ll tell you a tale — about how you fell asleep!','Hush-a-bye, hero!','Your eyes are closing…','Purr… just one little yawn!']},
   lore:lo('Сказочник Тридевятого царства. Поёт — богатыри засыпают в доспехах. От песни отойди — или подойди, смотря какое кольцо.','Storyteller of the Thrice-Nine Kingdom. His songs put heroes to sleep in their armor. Step out of the song — or in, depending on the ring.'),
   kit:{a:[{k:'lih_song',cd:10,r:170,r2:330,w:1.2},{k:'summon',cd:13,id:'kot',n:4,say:lo('Котики, ко мне!','Kitties, to me!')},{k:'fan',cd:7,n:5,col:'#b89aff'}],
        ph:[{hp:.5,add:[{k:'tele',cd:9}],sum:{id:'kot',n:5},say:lo('Мур-р! А теперь сказка станет страшной…','Purr! Now the tale gets scary…')}]}},
  liho_r:{base:'liho',rage:1,n:'Лихо ярое',en:{n:'Likho the Furious'},title:lo('Последнее Лихо Руси','The Last Woe of the Realm'),
   kit:{a:[{k:'clone',cd:16,n:2,dur:9,w:1}],
        ph:[{hp:.75,add:[{k:'lih_t',cd:40}],say:lo('Закрою глаз — и станет тьма!','I close my eye — and darkness falls!')},
            {hp:.5,sum:[{id:'rycar',n:2},{id:'koldun',n:2},{id:'skel_f',n:2},{id:'chert',n:3}],say:lo('Слуги Кощея и Тугарина — ко мне! Ваши хозяева мне должны!','Servants of Koschei and Tugarin, to me! Your masters owe me!')},
            {hp:.25,rm:'clone',add:[{k:'clone',cd:10,n:2,dur:8},{k:'wave',cd:9}],say:lo('Лихо — оно одно! А глаз — три!','There’s only one Likho! But three eyes!')}]}}},
 bk:{lih_song:song,lih_t:dark},
 beh:{lih_krivda:krivda},
 evs:{
  lih_gosti:{dur:0,start(G){gosti(G,9)}},
  lih_tma:{dur:7,
   start(G){G.fogT=12.5;G.fogK='night';const H=G.hero,R=VIEW.R;for(let i=0;i<24;i++){const a=i/24*TAU,d=R*rand(.6,.85);mkEnemy(['lih_krivda','lih_morok','chert'][i%3],H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);}
    banner(L('Лихо закрыло глаз','Likho shut its eye'),L('Тьма — Кривда и мороки лезут из мрака','Darkness! Falsehood and mirages crawl out of the gloom'),4);},
   step(G,dt,t){if(G.fogT<12.5)G.fogT=12.5;}}}});
})();

})();}catch(e){console.warn("th lih.js",e);}
