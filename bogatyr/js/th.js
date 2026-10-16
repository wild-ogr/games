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
