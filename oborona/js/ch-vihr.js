'use strict';
/* ================= OB:CH — тема «Царство Вихря» (глава 10 в сохранении, 10-я по порядку — после Огненной земли) =================
   Рисунки — js/ch-vihr-art.js (из «Богатыря»). Тема «про летучих»: гуси-рывки, грозовые тучки (молнией по заставе), птица Сирин
   (подгоняет летучих), ветреник (сдувает лужи Яги), облачный барашек (рассыпается на клочки), вихрёнок (рывки по земле).
   Вожаки: Вожак гусей-лебедей, Гром-баба. Босс — Вихорь: подхватывает нечисть и уносит вперёд, «Ураган» — летучие ×1,5 быстрее,
   зовёт вихрят. Логово — Вихорь ярый. */
(function(){
const VIH=10;
Object.assign(EN,{
  vihr_vihrenok:{n:'Вихрёнок',hp:34,spd:56,gold:4,ab:'dash',dashCd:3.5,dashL:70,ch:VIH,about:'Маленький смерч: крутится, замирает — и рывком вперёд.'},
  vihr_gus:{n:'Небесный гусь',hp:34,spd:52,gold:6,fly:1,ab:'dash',dashCd:5,dashL:90,ch:VIH,about:'Летает и рвётся вперёд рывками. Только стрельцы и колдун достанут!'},
  vihr_baran:{n:'Облачный барашек',hp:130,spd:24,gold:12,lives:2,mres:.25,split:'vihr_klok',sz:.9,ch:VIH,about:'Пушистый и упрямый. Разбили — рассыпался на облачные клочки.'},
  vihr_klok:{n:'Облачный клочок',hp:34,spd:40,gold:2,art:'vihr_baran',sz:.5,ch:VIH,about:'Кусочек барашка. Бодается.'},
  vihr_tuchka:{n:'Грозовая тучка',hp:64,spd:30,gold:9,fly:1,ab:'lob',lobK:'bolt',lobC:'#ffd84a',lobR:115,lobCd:6,ch:VIH,about:'Летучая и сердитая: бьёт молнией в заставу — та замолкает.'},
  vihr_sirin:{n:'Птица Сирин',hp:76,spd:32,gold:10,fly:1,pres:.3,ab:'haste',hasteFly:1,ch:VIH,about:'Поёт — и летучие рядом летят быстрее. Бей её первой!'},
  vihr_vetr:{n:'Ветреник',hp:52,spd:40,gold:8,fly:1,pres:.3,ab:'wind',ch:VIH,about:'Дует и сдувает лужи тётушки Яги. Изба против него слаба.'},
  vihr_vozhak:{n:'Вожак гусей-лебедей',hp:120,spd:30,gold:20,lives:2,fly:1,ab:'dash',dashCd:4,dashL:100,sz:.55,ch:VIH,about:'Ведёт стаю рывками — сбей, пока не долетел.'},
  vihr_grom:{n:'Гром-баба',hp:150,spd:22,gold:20,lives:2,ab:'lob',lobK:'bolt',lobC:'#ffe060',lobR:140,lobCd:6,lobS:2,sz:.55,ch:VIH,about:'Гремит и сердится: молнии летят по заставам часто и далеко.'},
  vihr_vihor:{n:'Вихорь',g:'m',hp:1400,spd:16,gold:360,lives:20,boss:1,sz:.62,ch:VIH,about:'Подхватывает нечисть и уносит вперёд, зовёт ураган — летучие мчатся быстрее.'}
});
const EN_EN={vihr_vihrenok:{n:'Little Whirlwind',about:'A tiny twister: spins, freezes — and dashes ahead.'},
  vihr_gus:{n:'Sky Goose',about:'It flies and lunges ahead in dashes. Only archers and the sorcerer can reach it!'},
  vihr_baran:{n:'Cloud Ram',about:'Fluffy and stubborn. Break it and it falls apart into cloud tufts.'},
  vihr_klok:{n:'Cloud Tuft',about:'A bit of the ram. Butts.'},
  vihr_tuchka:{n:'Storm Cloud',about:'Flying and grumpy: it strikes an outpost with lightning and silences it.'},
  vihr_sirin:{n:'Sirin Bird',about:'She sings — and flyers nearby fly faster. Take her out first!'},
  vihr_vetr:{n:'Wind Sprite',about:'Blows away Auntie Yaga’s pools. The hut is weak against it.'},
  vihr_vozhak:{n:'Swan-Goose Leader',about:'Leads the flock in dashes — shoot it down before it arrives.'},
  vihr_grom:{n:'Thunder Hag',about:'She rumbles and fumes: lightning hits outposts often and from afar.'},
  vihr_vihor:{n:'Vikhor the Whirlwind',about:'Snatches monsters up and carries them ahead, calls a hurricane — flyers rush faster.'}};
for(const k in EN_EN)langReg(EN[k],EN_EN[k]);
Object.assign(LORE,{vihr_vihrenok:'Вихрёнок. Сын Вихоря. Пока маленький — крутится на месте и пыль поднимает.',
  vihr_gus:'Небесный гусь. Летит выше туч, гогочет громче грома.',vihr_baran:'Облачный барашек. Пасётся на тучах, шерсть — чистый туман.',
  vihr_klok:'Облачный клочок. Был барашком — стал облачком.',vihr_tuchka:'Грозовая тучка. Сердится по любому поводу и мечет молнии.',
  vihr_sirin:'Птица Сирин. Поёт так сладко, что вся летучая нечисть мчится на песню.',vihr_vetr:'Ветреник. Щёки надул — и нет твоей лужи.',
  vihr_vozhak:'Вожак гусей-лебедей. Носил когда-то детей к Бабе-яге, теперь носит стаю к тебе.',vihr_grom:'Гром-баба. Седые клубы, косы-молнии, характер — гроза.',
  vihr_vihor:'Вихорь. Ветер-разбойник: кого подхватит — унесёт за тридевять земель.'});
chLang(LORE,{vihr_vihrenok:'Little Whirlwind. Vikhor’s son. Still small — spins on the spot and kicks up dust.',
  vihr_gus:'Sky Goose. Flies above the clouds, honks louder than thunder.',vihr_baran:'Cloud Ram. Grazes on clouds, its fleece is pure mist.',
  vihr_klok:'Cloud Tuft. It was a ram — now it’s a cloudlet.',vihr_tuchka:'Storm Cloud. Gets angry at anything and hurls lightning.',
  vihr_sirin:'Sirin Bird. Sings so sweetly that every flying monster rushes to the song.',vihr_vetr:'Wind Sprite. Puffs out its cheeks — and your pool is gone.',
  vihr_vozhak:'Swan-Goose Leader. Once carried children to Baba Yaga, now carries the flock to you.',vihr_grom:'Thunder Hag. Grey billows, lightning braids, a stormy temper.',
  vihr_vihor:'Vikhor the Whirlwind. A robber wind: whomever he snatches, he carries beyond thrice-nine lands.'});
BOSS_SAY.vihr_vihor=['Унесу-у-у!','Ураган, ко мне!','Держись за шапку, воевода!'];
BOSS_TIP.vihr_vihor='Ураган гонит летучих — держи стрельцов и колдунов у ворот. Подхваченную нечисть добивай у самого города.';
chLang(BOSS_SAY,{vihr_vihor:['I’ll blow you away!','Hurricane, to me!','Hold on to your hat, commander!']});
chLang(BOSS_TIP,{vihr_vihor:'The hurricane drives flyers — keep archers and sorcerers near the gate. Finish off the monsters he carries right by the city.'});
Object.assign(WAVE_NAMES,{vihr_vihrenok:['Вихрята','Пыльная буря'],vihr_gus:['Гуси-лебеди','Небесная стая'],vihr_baran:['Облачное стадо','Барашки на тучах'],
  vihr_tuchka:['Грозовой фронт','Тучи сгущаются'],vihr_sirin:['Песня Сирина','Птичий хор']});
chLang(WAVE_NAMES,{vihr_vihrenok:['Little whirlwinds','A dust storm'],vihr_gus:['Swan-geese','The sky flock'],vihr_baran:['A cloud herd','Rams on the clouds'],
  vihr_tuchka:['A storm front','Clouds gather'],vihr_sirin:['The Sirin’s song','A bird choir']});
Object.assign(LEAD.at,{[VIH+'-2']:'vihr_vozhak',[VIH+'-3']:'vihr_grom',[VIH+'-6']:'vihr_grom'});
Object.assign(LEAD.n,{vihr_vozhak:'Вожак гусей-лебедей',vihr_grom:'Гром-баба'});chLang(LEAD.n,{vihr_vozhak:'Swan-Goose Leader',vihr_grom:'Thunder Hag'});
Object.assign(LEAD.ab,{vihr_vozhak:'Ведёт стаю рывками — сбей стрельцами и колдуном!',vihr_grom:'Бьёт молниями по заставам часто и далеко — держи заставы порознь.'});
chLang(LEAD.ab,{vihr_vozhak:'Leads the flock in dashes — bring it down with archers and the sorcerer!',vihr_grom:'Hits outposts with lightning often and from afar — keep outposts apart.'});
Object.assign(LEAD.sayT,{vihr_vozhak:['Га-га-га!','Стая, за мной!','Выше туч!'],vihr_grom:['Гром гремит!','Ух, рассержусь!','Бах-тарарах!']});
chLang(LEAD.sayT,{vihr_vozhak:['Honk-honk!','Flock, follow me!','Above the clouds!'],vihr_grom:['Thunder rolls!','Oh, I’ll get angry!','Ka-boom!']});

// Вихорь
CHX.boss.vihr_vihor=(e,dt)=>{const k=e.yar?CH_YAR.cd:1;
  // подхватил: 0,8 с кольца над теми, кого унесёт (до 3 сзади), потом — вперёд, к нему
  if(e.wh){e.wh.t-=dt;if(e.wh.t<=0){const P=G.map.paths[e.pi];for(const o of e.wh.os)if(!o.dead){poof(o.x,o.y);o.pi=e.pi;o.d=Math.min(P.len-50,e.d+30+Math.random()*30);const q=pathPos(o.pi,o.d);o.x=q.x;o.y=q.y;}e.wh=null;}}
  else if(e.abT<=0){e.abT=8*k;const os=G.en.filter(o=>o!==e&&!o.dead&&!o.boss&&o.pi===e.pi&&o.d<e.d&&e.d-o.d<220).slice(0,e.yar?4:3);if(os.length){e.wh={t:.8,os};say(e,Lg('Унесу-у-у!','Whoosh!'),1.2);}}
  if(e.ab2<=0){e.ab2=10*k;for(let i=0;i<(e.yar?4:3);i++)spawnEnemy('vihr_vihrenok',e.pi,Math.max(0,e.d-10-i*12),minionHp());}
  e.huT=(e.huT==null?6:e.huT)-dt;
  if(e.huW>0){e.huW-=dt;if(e.huW<=0){for(const o of G.en)if(o.fly&&!o.dead){o.hasteT=4;o.hasteK=1.5;}G.fx.push({k:'wave',x:e.x,y:e.y,r:180,t:0,dur:.9,col:'#cfeefa'});}}
  else if(e.huT<=0){e.huT=14*k;e.huW=.8;G.banner={title:Lg('Ураган!','Hurricane!'),sub:Lg('Летучие мчатся быстрее — стрельцы, не зевай!','Flyers rush faster — archers, look sharp!'),t:0,wave:1};SND.whistle();}
  if(!e.ph&&e.hp<e.max*.5){e.ph=1;e.spd*=1.2;e.huT=0;say(e,Lg('Разозлили вы меня!','Now you’ve made me angry!'),2);G.shake=10;}};

// Деревня II: Ветряная мельница — +10% золота за победы за уровень
const mel={id:'mel',name:'Ветряная мельница',ic:'vihr_d_mel',about:'+10% золота за победы в кампании за каждый уровень',cost:[4000,8000,15000],ch:VIH};
BLD.push(mel);langReg(mel,{name:'Windmill',about:'+10% gold for campaign victories per level'});VIL_POS.mel=[.78,.86];
chAdd({id:VIH,after:6,hp:9.1,coins:740,lmark:['vihr_d_mel','vihr_d_terem','vihr_d_raduga'],book:['vihr_klok','vihr_vetr','vihr_vozhak','vihr_grom'],
  ach:{n:'Тише, ветер',en:'Hush, Wind',bossEn:'Vikhor the Whirlwind'},
  banner:{id:'vihr',n:'Знамя Царства Вихря',cost:2800,c1:'#6a8ad0',c2:'#ffffff',em:[9,.6],en:'Banner of the Whirlwind Realm'},
  fix:{'10-0':3.3,'10-1':1.8,'10-2':2,'10-3':1.8,'10-4':1.5,'10-5':1.5,'10-6':1.2},
  ch:{name:'Царство Вихря',g:'n',sub:'Ветер воет — гуси летят',boss:'vihr_vihor',en:['vihr_vihrenok','vihr_gus','vihr_baran','vihr_tuchka','vihr_sirin'],
    ground:{base:'#d8b4cc',hi:'#e6c4d8',lo:'#c8a2bc',grass:'#b48aa8',flow:['#fff6d0','#ffffff','#ffc890']},
    road:{edge:'#a888b4',fill:'#f4ecf6',hi:'#ffffff',deco:'stones'},decor:['vihr_d_oblak','d_bush','d_stone','d_dry','vihr_d_oblak','d_stone'],mc:'#8fb0ff',bright:1,lair:1,bossK:1.8,
    pw:[560,570,580,585,590,600,620],
    levels:['Облачные мостки','Гусиный путь','Грозовая туча','Терем на туче','Радужный мост','Око бури','Сердце смерча'],
    intro:['Царство Вихря! Тут ходят по тучам. Вихрята крутятся и рвутся вперёд, а небесных гусей достанут только стрельцы и колдун.',
      'Облачные барашки упрямые: разобьёшь — рассыплются на клочки. Пушка по стаду — самое то.',
      'Грозовые тучки бьют молнией по заставам — те замолкают. И веди счёт гусям: Вожак гусей-лебедей ведёт стаю рывками!',
      'Ветреники сдувают лужи тётушки Яги. А Гром-баба мечет молнии далеко и часто — держи заставы порознь.',
      'Птица Сирин поёт — и вся летучая нечисть мчится быстрее. Сбей певунью первой!',
      'Вихорь! Подхватывает нечисть и уносит вперёд, а «Ураган» гонит летучих. Стрельцов и колдунов — к самым воротам!',
      'Логово Вихоря — по желанию. Он тут ярый: ураганы чаще, вихрят больше.'],
    // ветреники — с 3-го уровня, в каждой 3-й волне
    waveX(waves,li){if(li<2)return;waves.forEach((w,i)=>{if(i%3===2)w.g.push({t:'vihr_vetr',n:2+Math.floor(li/2),iv:1.2,delay:4});});}},
  en:{name:'Realm of the Whirlwind',sub:'The wind howls, the geese fly',
    levels:['Cloud Bridges','The Goose Path','Storm Cloud','Tower on a Cloud','Rainbow Bridge','Eye of the Storm','Heart of the Twister'],
    intro:['The Realm of the Whirlwind! Here they walk on clouds. Little whirlwinds spin and dash ahead, and only archers and the sorcerer can reach the sky geese.',
      'Cloud rams are stubborn: break one and it falls apart into tufts. Cannon the herd — just right.',
      'Storm clouds strike outposts with lightning and silence them. And count the geese: the Swan-Goose Leader leads the flock in dashes!',
      'Wind sprites blow away Auntie Yaga’s pools. And the Thunder Hag hurls lightning far and often — keep outposts apart.',
      'The Sirin bird sings — and every flying monster rushes faster. Shoot the songbird down first!',
      'Vikhor! He snatches monsters and carries them ahead, and his “Hurricane” drives the flyers. Archers and sorcerers — right by the gate!',
      'Vikhor’s Lair — optional. Here he is raging: more hurricanes, more little whirlwinds.']}});
})();
