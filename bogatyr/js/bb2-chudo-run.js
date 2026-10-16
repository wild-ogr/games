/* ===== bb2-chudo-run.js — «Чудеса» (поток CHUDO, супер-буст в2, 13.10.2026). Догружается: BB2.need('chudo') / BB2.bg('chudo') — см. js/bb2-chudo.js.
   24 редкие карточки, меняющие ПРАВИЛА боя (у каждой — цена), из сундука вожака: 1 из 3, не больше chudo.perRun за поход; «Книга чудес»; «чудо дня».
   Перемешанное расписание событий (флаг evmix) — с места chudo.mixCh кампании. Общие файлы не правятся: только крючки BB2.
   В бою всё рисуется готовыми спрайтами (art → spr/drawSpr), без текста и градиентов на кадр. Числа экономики — BB2.n('chudo.*'). Без ?. ?? .finally */
(function(){
'use strict';
if(typeof BB2!=='object'||!BB2||BB2.chudo&&BB2.chudo.ok)return;
function N(k,d){return BB2.n('chudo.'+k,d);}
function on(){return BB2.on('chudo');}
var IDS=['boots','cap','anchor','broom','sword','kolobok','blyudo','bells','pipe','ruble','whistle','egg','mirror','rooster','bayun','skatert','feather','apple','candle','eye','honey','shoe','mitten','key'];
var PG=8; /* чудес на странице книги */
/* тексты: n — имя, d — что делает, p — цена, s — что говорит богатырь */
var TX=null,TXL='';
function defs(){if(TX&&TXL===LANG)return TX;TXL=LANG;TX={
  boots:{n:L('Сапоги-самоплясы','Dancing Boots'),d:L('Бежишь — урон растёт до +15%. Встал — падает до −20%.','Run and your damage climbs to +15%. Stand still and it drops to −20%.'),p:L('здоровье −10%','health −10%'),s:L('Ноги сами в пляс идут!','My feet dance by themselves!')},
  cap:{n:L('Шапка-невидимка','Cap of Invisibility'),d:L('Постой 1,5 с — исчезнешь, нечисть не тронет. Шагнул — удар из засады ×2.','Stand for 1.5 s to vanish: monsters can’t hurt you. Step out and strike from ambush for ×2.'),p:L('надо стоять в толпе','you must stand in the crowd'),s:L('Где я? А нет меня!','Where am I? Nowhere!')},
  anchor:{n:L('Якорь Садко','Sadko’s Anchor'),d:L('Стоишь — тебя не сдвинуть, удары по тебе вдвое слабее.','While standing you can’t be pushed and take half damage.'),p:L('на ходу ты медленнее на 12%','12% slower on the move'),s:L('Встал как вкопанный!','Rooted to the spot!')},
  broom:{n:L('Помело Яги','Yaga’s Broom'),d:L('Скорость +25%, за тобой огненный след — жжёт нечисть.','Speed +25% and a trail of fire behind you burns monsters.'),p:L('удары по тебе больнее на 20%','you take 20% more damage'),s:L('Эх, прокачу!','Hold on tight!')},
  sword:{n:L('Меч-самосек','Self-Swinging Sword'),d:L('Сам рубит туда, куда идёшь, — широко и часто.','Slashes wide and often in the direction you walk.'),p:L('оружие бьёт на 12% реже','other weapons attack 12% slower'),s:L('Руби, меч, сам!','Swing, sword, swing!')},
  kolobok:{n:L('Колобок','Kolobok'),d:L('Катится следом и сшибает нечисть. Быстрее бежишь — больнее бьёт.','Rolls behind you and bowls monsters over. The faster you run, the harder it hits.'),p:L('простоишь 4 с — укатится на 8 с','stand for 4 s and it rolls away for 8 s'),s:L('Я от бабушки ушёл!','I ran away from Grandma!')},
  blyudo:{n:L('Блюдечко с яблочком','Saucer and Apple'),d:L('Показывает, где вожак. Самоцветы и монеты летят к тебе издалека.','Shows where the chieftain is. Gems and coins fly to you from afar.'),p:'',s:L('Катись, яблочко, показывай!','Roll, apple, show me!')},
  bells:{n:L('Бубенцы','Sleigh Bells'),d:L('Каждые 700 шагов — звон: волна бьёт всех вокруг.','Every 700 steps they ring: a wave hits everyone around.'),p:L('нечисти на 10% больше','the ringing draws 10% more monsters'),s:L('С бубенцами веселей!','Merrier with bells!')},
  pipe:{n:L('Дудочка-погудка','Piper’s Reed'),d:L('Каждый восьмой побеждённый 10 с пляшет на твоей стороне.','Every eighth monster you defeat gets up and dances on your side for 10 s.'),p:L('опыта на 10% меньше','10% less XP'),s:L('Попляшите-ка, нечистые!','Dance, you fiends!')},
  ruble:{n:L('Неразменный рубль','Unspendable Ruble'),d:L('Три монеты кружат вокруг и бьют нечисть.','Three coins circle you and strike monsters.'),p:L('золота за поход на 20% меньше','20% less gold this run'),s:L('Не имей сто рублей — имей один, да неразменный!','Better one coin that never runs out!')},
  whistle:{n:L('Свисток Соловья','Nightingale’s Whistle'),d:L('Каждые 60 побеждённых — свист: волна по всему экрану.','Every 60 defeated monsters — a robber’s whistle: a wave across the whole screen.'),p:L('нечисти на 12% больше','12% more monsters'),s:L('Эх, свистну!','Here comes the whistle!')},
  egg:{n:L('Яйцо Кощея','Koschei’s Egg'),d:L('Одна гибель за поход не считается: встаёшь сам.','One death per run doesn’t count: you get back up.'),p:L('здоровье −30%','health −30%'),s:L('Смерть моя не здесь!','My death is not here!')},
  mirror:{n:L('Зеркальце','Magic Mirror'),d:L('Удар по тебе возвращается обидчикам рядом — вшестеро.','Every hit you take bounces back at nearby attackers sixfold.'),p:L('удары по тебе больнее на 10%','you take 10% more damage'),s:L('Свет мой, зеркальце, дай сдачи!','Mirror, mirror, hit them back!')},
  rooster:{n:L('Золотой петушок','Golden Cockerel'),d:L('Раз в 22 с кричит — нечисть на экране цепенеет на 2 с.','Crows every 22 s — monsters on screen freeze for 2 s.'),p:L('нечисть бегает на 8% быстрее','woken monsters run 8% faster'),s:L('Ку-ка-ре-ку!','Cock-a-doodle-doo!')},
  bayun:{n:L('Кот Баюн','Bayun the Cat'),d:L('Нечисть, подойдя к тебе, засыпает на 1,3 с — каждая один раз.','Monsters that come close fall asleep for 1.3 s — once each.'),p:L('зеваешь и ты: оружие бьёт на 10% реже','you yawn too: weapons attack 10% slower'),s:L('Баю-баюшки-баю…','Hush-a-bye…')},
  skatert:{n:L('Скатерть-самобранка','Magic Tablecloth'),d:L('Пирожки-ловушки: нечисть наступит — взрыв.','Pie traps: a monster steps on one — boom.'),p:L('обычные пирожки лечат вдвое слабее','ordinary pies heal half as much'),s:L('Кушать подано!','Dinner is served!')},
  feather:{n:L('Перо Жар-птицы','Firebird Feather'),d:L('Здоровья меньше трети — вспышка: нечисть отлетает, ты лечишься. Раз в 40 с.','Below a third of health — a flash: monsters are thrown back and burn, you heal a quarter. Once per 40 s.'),p:L('здоровье −10%','health −10%'),s:L('Горю — не сгораю!','I burn but don’t burn out!')},
  apple:{n:L('Молодильное яблоко','Apple of Youth'),d:L('Каждый новый уровень лечит 12% здоровья.','Every level-up heals 12% of your health.'),p:L('само здоровье не восстанавливается','health no longer regenerates on its own'),s:L('Молодею на глазах!','Getting younger by the minute!')},
  candle:{n:L('Неугасимая свеча','Undying Candle'),d:L('Вокруг тебя круг света: нечисть в нём горит.','A circle of light around you: monsters inside it burn.'),p:L('за кругом — тьма; ты медленнее на 8%','darkness beyond the circle; you are 8% slower'),s:L('Гори-гори ясно!','Burn bright!')},
  eye:{n:L('Глаз Лиха','Eye of Likho'),d:L('Урон +15%.','Damage +15%.'),p:L('удары по тебе больнее на 20%','you take 20% more damage'),s:L('Лихо со мной — кому хуже?','Likho is with me — who’s worse off?')},
  honey:{n:L('Бочка мёда','Barrel of Honey'),d:L('За тобой остаются медовые лужи: нечисть в них вязнет.','You leave honey puddles behind: monsters get stuck in them.'),p:L('ложка дёгтя: в луже вязнешь и ты','a fly in the ointment: you get stuck too'),s:L('Сладко ли вам, нечистые?','Sweet enough for you, fiends?')},
  shoe:{n:L('Подкова на счастье','Lucky Horseshoe'),d:L('Удача +50%: чаще криты и добыча. Самоцветы летят издалека.','Luck +50%: more crits and loot. Gems fly to you from afar.'),p:L('тяжела: скорость −8%','it’s heavy: speed −8%'),s:L('На счастье!','For luck!')},
  mitten:{n:L('Рукавица Морозко','Frost’s Mitten'),d:L('Кто ударил тебя — замерзает на 2 с вместе с соседями.','Whoever hits you freezes for 2 s along with its neighbours.'),p:L('зябко: оружие бьёт на 8% реже','you’re chilly too: weapons attack 8% slower'),s:L('Тепло ли вам, нечистые?','Warm enough, fiends?')},
  key:{n:L('Ключ от темницы','Dungeon Key'),d:L('В каждом сундуке вожака — на одну награду больше.','One more reward in every chieftain chest.'),p:L('вожаки крепче в полтора раза','chieftains are 1.5× tougher'),s:L('Отворяйся, ларчик!','Open up, little chest!')}};
  return TX;}
function pgName(i){return [L('Ходовые','Wandering'),L('Боевые','Fighting'),L('Заветные','Cherished')][i]||'';}
function day(){return IDS[((dayIdx()*5+7)%IDS.length+IDS.length)%IDS.length];}
function per(){return Math.max(1,N('perRun',2));}
function ok(g){return on()&&!!g&&!g.first&&!g.daily&&!g.weekly&&(S.runs||0)>=1&&(g.endless||chPos(g.chi)>=N('fromCh',2));}
function sv(){var s=BB2.s('chudo');if(!BB2.ob(s.b))s.b={};if(!BB2.ob(s.pg))s.pg={};return s;}
function init(g){if(!g.cu)g.cu={l:[],h:{},q:0,ec:0,of:0,nw:0,al:[],pz:[],hp:[],tr:[]};return g.cu;}

/* ---------- рисунки (стиль art.js; ключи cu_*) ---------- */
function A(id,fn){art('cu_'+id,40,fn);}
function note(g,x,y,c){ell(g,x,y,2.6,2,c||'#ffe07a',{ol:false,flat:true});ln(g,[x+2.2,y,x+2.2,y-8,x+6,y-6.5],c||'#ffe07a',1.4);}
function boot(g,x,y,r){g.save();g.translate(x,y);g.rotate(r);shp(g,'#d8392f',{},[-6,-12,10,9],function(){g.moveTo(-5,-12);g.lineTo(3,-12);g.lineTo(3,1);g.quadraticCurveTo(11,1,11,7);g.lineTo(-6,9);g.closePath();});ln(g,[-5,-8.5,3,-8.5],'#ffd84a',2);g.restore();}
A('boots',function(g){boot(g,-7,4,-.35);boot(g,7,0,.3);note(g,-12,-12);note(g,9,-14);});
A('cap',function(g){g.save();g.setLineDash([2.5,3]);g.beginPath();g.arc(0,2,15,Math.PI,0);g.lineWidth=1.6;g.strokeStyle='rgba(190,215,255,.85)';g.stroke();g.restore();
  shp(g,'#5a6ad8',{},[-12,-12,2,6],function(){g.moveTo(-13,5);g.quadraticCurveTo(-13,-13,0,-13);g.lineTo(0,5);g.closePath();});
  g.globalAlpha=.38;shp(g,'#5a6ad8',{ol:false},[0,-12,13,6],function(){g.moveTo(0,-13);g.quadraticCurveTo(13,-13,13,5);g.lineTo(0,5);g.closePath();});g.globalAlpha=1;
  rrect(g,-15,3,15,7,3);g.fillStyle='#efe6d4';g.fill();outline(g,'#efe6d4',1);g.globalAlpha=.4;rrect(g,0,3,15,7,3);g.fillStyle='#efe6d4';g.fill();g.globalAlpha=1;shine(g,-6,-7,3,1.5,.5);});
A('anchor',function(g){g.lineCap='round';g.beginPath();g.arc(0,-12,3.6,0,TAU);g.lineWidth=2.6;g.strokeStyle='#8a94a6';g.stroke();ln(g,[0,-8,0,13],'#5d6676',5);ln(g,[0,-8,0,13],'#aab4c2',3);ln(g,[-8,-4,8,-4],'#aab4c2',3);
  g.beginPath();g.arc(0,2,12,.15,Math.PI-.15);g.lineWidth=5;g.strokeStyle='#5d6676';g.stroke();g.lineWidth=3;g.strokeStyle='#aab4c2';g.stroke();poly(g,[-15,1,-9,3,-14,8],'#aab4c2');poly(g,[15,1,9,3,14,8],'#aab4c2');});
A('broom',function(g){g.rotate(-.6);ln(g,[0,-17,0,4],'#5a3a1e',4.4);ln(g,[0,-17,0,4],'#9a6a3a',2.6);shp(g,'#e0b040',{},[-8,3,8,17],function(){g.moveTo(-3.5,3);g.lineTo(3.5,3);g.lineTo(8,17);g.lineTo(-8,17);g.closePath();});
  ln(g,[-3,7,-5,16],'#a8781a',1);ln(g,[0,7,0,16],'#a8781a',1);ln(g,[3,7,5,16],'#a8781a',1);ln(g,[-4,6,4,6],'#b8322e',2);glow(g,0,19,6,'#ff7a1a','#ffe07a');});
A('sword',function(g){g.rotate(.78);g.beginPath();g.arc(0,2,15,-2.4,-.7);g.lineWidth=2.4;g.strokeStyle='rgba(255,224,122,.85)';g.stroke();poly(g,[-3,-15,3,-15,3,5,-3,5],'#dce4ee');poly(g,[-3,-15,3,-15,0,-20],'#dce4ee');ln(g,[0,-17,0,4],'#ffffff',1.2);
  rrect(g,-8,5,16,3.6,1.5);g.fillStyle='#e6b53a';g.fill();outline(g,'#e6b53a',1);ln(g,[0,9,0,15],'#7a4a22',3.6);ell(g,0,16,2.6,2.6,'#e6b53a');});
A('kolobok',function(g){ell(g,0,1,14,14,'#f2b83a',{hl:.5});ell(g,-7,5,3,2.2,'rgba(240,110,70,.55)',{ol:false,flat:true});ell(g,7,5,3,2.2,'rgba(240,110,70,.55)',{ol:false,flat:true});
  eye(g,-5,-2,3.2);eye(g,5,-2,3.2);mouth(g,0,5,4.5,'#7a3a14',true);shine(g,-6,-8,4,2,.5);});
A('blyudo',function(g){ell(g,0,7,16,7,'#c8d2e0',{hl:.6});ell(g,0,6,11,4.2,'#e8eef6',{ol:false});g.save();g.translate(1,-3);g.scale(.72,.72);ART.p_apple.fn(g);g.restore();});
A('bells',function(g){g.beginPath();g.arc(0,12,22,-2.45,-.69);g.lineWidth=4;g.strokeStyle='#b8322e';g.stroke();g.lineWidth=1.2;g.strokeStyle='#ffd84a';g.stroke();
  for(var i=-1;i<=1;i++){var x=i*10,y=-1+Math.abs(i)*4;ln(g,[x,y-7,x,y-3],'#7a4a22',1.4);ell(g,x,y+1,5,5.4,'#f0c23a',{hl:.6});ln(g,[x-3,y+2,x+3,y+2],'#8a5a10',1.2);ell(g,x,y+5.6,1.4,1.4,'#8a5a10',{ol:false,flat:true});}});
A('pipe',function(g){g.rotate(-.5);rrect(g,-16,-3.2,32,6.4,3);g.fillStyle=grad(g,0,0,16,'#c8a05a');g.fill();outline(g,'#c8a05a',1.2);for(var x=-6;x<=10;x+=5.3)ell(g,x,0,1.3,1.3,'#4a2e12',{ol:false,flat:true});
  ln(g,[-12,-3,-12,3],'#b8322e',2);g.rotate(.5);note(g,6,-9);note(g,-3,-14,'#fff0a8');});
A('ruble',function(g){g.beginPath();g.arc(0,0,16,.5,5.2);g.lineWidth=2.2;g.strokeStyle='rgba(255,240,170,.9)';g.stroke();poly(g,[13,-11,17,-3,9,-5],'#fff0aa',{flat:true,ol:false});
  ell(g,0,0,11,11,'#f5c33a',{hl:.6});ell(g,0,0,7.4,7.4,'#e0a620',{ol:false});ln(g,[0,-4.5,0,4.5],'#fff0a8',2);ln(g,[-2,-2.5,0,-4.5],'#fff0a8',1.6);shine(g,-4,-5,3,1.4,.6);});
A('whistle',function(g){ell(g,-2,2,11,8,'#c8643a',{hl:.5});poly(g,[7,-1,17,-6,17,3],'#c8643a');ell(g,-10,-5,5.5,5,'#c8643a',{hl:.5});poly(g,[-14,-6,-20,-4,-14,-2],'#f0c23a');
  ell(g,-11,-6,1.3,1.3,'#1d1b2a',{ol:false,flat:true});ell(g,0,1,1.5,1.5,'#4a1e10',{ol:false,flat:true});ell(g,5,3,1.5,1.5,'#4a1e10',{ol:false,flat:true});ln(g,[-6,6,3,8],'#ffe07a',1.4);
  g.lineWidth=1.5;g.strokeStyle='rgba(255,255,255,.75)';for(var i=0;i<2;i++){g.beginPath();g.arc(15,-12,4+i*4,-2.2,-.6);g.stroke();}});
A('egg',function(g){glow(g,0,0,18,'#7a4ae0','#c8b0ff');g.beginPath();g.ellipse(0,1,10,13,0,0,TAU);g.fillStyle=grad(g,0,1,13,'#f0ead8',.6);g.fill();outline(g,'#b0a890',1.2);
  ln(g,[-15,9,15,-9],'#5d6676',2.4);ln(g,[-15,9,15,-9],'#e8eef6',1);ell(g,-15,9,1.8,1.8,'#e8eef6',{ol:false,flat:true});shine(g,-4,-6,3,1.6,.6);});
A('mirror',function(g){ln(g,[0,7,0,18],'#8a5a10',5);ln(g,[0,7,0,18],'#e6b53a',3);ell(g,0,-4,12,13,'#e6b53a',{hl:.5});ell(g,0,-4,8.6,9.6,'#bfe6ff',{hl:.7,ol:false});ln(g,[-4,-9,2,-1],'rgba(255,255,255,.8)',1.6);ln(g,[1,-9,5,-4],'rgba(255,255,255,.6)',1.2);});
A('rooster',function(g){poly(g,[-4,-12,-1,-18,2,-13,5,-18,7,-12,10,-15,10,-8],'#d8313d');ell(g,2,-3,10,10,'#f0c23a',{hl:.55});poly(g,[-7,-5,-16,-2,-7,1],'#f08a1a');ell(g,-5,5,3,4.5,'#d8313d');eye(g,0,-5,2.8,{px:-.6});
  shp(g,'#e08a1a',{},[2,2,14,16],function(){g.moveTo(3,6);g.quadraticCurveTo(15,2,13,16);g.quadraticCurveTo(6,16,3,6);});});
A('bayun',function(g){poly(g,[-13,-5,-11,-17,-4,-10],'#2a2a36');poly(g,[13,-5,11,-17,4,-10],'#2a2a36');ell(g,0,2,14,12,'#2a2a36',{hl:.25});eye(g,-5.5,0,3.4,{white:'#9aff6a',col:'#14301a',px:0});eye(g,5.5,0,3.4,{white:'#9aff6a',col:'#14301a',px:0});
  poly(g,[-1.6,5,1.6,5,0,7],'#f0a0b0',{flat:true,ol:false});mouth(g,0,8,3,'#e8e0d0',true);ln(g,[-6,6,-15,4],'#e8e0d0',.8);ln(g,[-6,8,-15,9],'#e8e0d0',.8);ln(g,[6,6,15,4],'#e8e0d0',.8);ln(g,[6,8,15,9],'#e8e0d0',.8);});
A('skatert',function(g){shp(g,'#f4efe2',{hl:.3},[-16,-2,16,16],function(){g.moveTo(-13,-1);g.lineTo(13,-1);g.lineTo(16,14);g.quadraticCurveTo(8,17,0,14);g.quadraticCurveTo(-8,11,-16,14);g.closePath();});
  g.save();g.setLineDash([2,2]);ln(g,[-14,9,-6,8,0,10,7,12,14,10],'#d8313d',1.8);g.restore();g.save();g.translate(0,-6);ART.pie.fn(g);g.restore();});
A('feather',function(g){glow(g,0,0,18,'#ff7a1a','#ffe07a');g.rotate(.6);shp(g,'#ff9a2a',{hl:.6},[-7,-17,7,10],function(){g.moveTo(0,-18);g.quadraticCurveTo(10,-6,3,10);g.lineTo(-3,10);g.quadraticCurveTo(-10,-6,0,-18);});
  ln(g,[0,-14,0,17],'#fff0a8',1.4);ell(g,0,-7,3,4,'#d8313d',{ol:false});ell(g,0,-7,1.4,2,'#ffe07a',{ol:false,flat:true});});
A('apple',function(g){glow(g,0,2,19,'#ffd84a','#fff6c8');ART.p_apple.fn(g);g.strokeStyle='rgba(255,246,200,.9)';g.lineWidth=1.3;for(var i=0;i<4;i++){var a=i*1.57+.5,x=Math.cos(a)*15,y=2+Math.sin(a)*15;g.beginPath();g.moveTo(x-2.5,y);g.lineTo(x+2.5,y);g.moveTo(x,y-2.5);g.lineTo(x,y+2.5);g.stroke();}});
A('candle',function(g){glow(g,0,-10,13,'#ffb02a','#fff6c8');rrect(g,-5,-4,10,19,2.5);g.fillStyle=grad(g,0,6,11,'#f4ecd8');g.fill();outline(g,'#c8b890',1.1);ell(g,-3,-1,2,3,'#f4ecd8',{ol:false,flat:true});ln(g,[0,-4,0,-7],'#3a2a1a',1.2);
  shp(g,'#ffb02a',{hl:.7,ol:false},[-4,-17,4,-6],function(){g.moveTo(0,-18);g.quadraticCurveTo(5,-11,0,-6);g.quadraticCurveTo(-5,-11,0,-18);});ell(g,0,16,9,2.6,'#8a5a10');});
A('eye',function(g){ell(g,0,0,16,11,'#6a7a4a',{hl:.3});g.beginPath();g.ellipse(0,0,11.5,7.5,0,0,TAU);g.fillStyle='#fdf6e6';g.fill();g.lineWidth=1;g.strokeStyle='rgba(30,20,10,.6)';g.stroke();
  ln(g,[-10,1,-5,2],'#d8313d',.8);ln(g,[10,-1,5,-2],'#d8313d',.8);ell(g,0,0,5.6,5.6,'#c84a1a',{hl:.5});ell(g,0,0,2.6,3.6,'#1d1b2a',{ol:false,flat:true});shine(g,-2,-2,1.6,1,.9);ln(g,[-13,-9,13,-13],'#2a2a1a',2.6);});
A('honey',function(g){shp(g,'#9a5a2a',{},[-12,-10,12,16],function(){g.moveTo(-10,-10);g.lineTo(10,-10);g.quadraticCurveTo(15,3,10,16);g.lineTo(-10,16);g.quadraticCurveTo(-15,3,-10,-10);});
  ln(g,[-12,-3,12,-3],'#5a3414',2);ln(g,[-12,9,12,9],'#5a3414',2);shp(g,'#ffb52a',{hl:.7,ol:false},[-11,-14,11,-2],function(){g.moveTo(-11,-10);g.quadraticCurveTo(0,-17,11,-10);g.lineTo(11,-7);g.quadraticCurveTo(8,2,6,-6);g.quadraticCurveTo(2,-4,-2,-7);g.quadraticCurveTo(-5,5,-8,-6);g.lineTo(-11,-7);g.closePath();});shine(g,-4,-11,3,1.2,.7);});
A('shoe',function(g){g.lineCap='round';g.beginPath();g.arc(0,-1,11,2.25,7.17);g.lineWidth=8;g.strokeStyle='#8a5a10';g.stroke();g.lineWidth=5.6;g.strokeStyle='#f0c23a';g.stroke();g.lineWidth=1.3;g.strokeStyle='rgba(255,246,200,.8)';g.beginPath();g.arc(0,-1,12.4,3.4,5.2);g.stroke();
  for(var i=0;i<5;i++){var a=2.7+i*.98;ell(g,Math.cos(a)*11,-1+Math.sin(a)*11,1.1,1.1,'#5a3a0a',{ol:false,flat:true});}});
A('mitten',function(g){glow(g,0,0,18,'#8ad0ff','#e8f6ff');shp(g,'#3a8ae0',{hl:.5},[-9,-15,10,8],function(){g.moveTo(-8,6);g.lineTo(-8,-8);g.quadraticCurveTo(-8,-16,0,-16);g.quadraticCurveTo(8,-16,8,-8);g.lineTo(8,6);g.closePath();});
  ell(g,10,-1,4,6.5,'#3a8ae0',{hl:.5,rot:.5});rrect(g,-10,5,20,8,3);g.fillStyle='#f4f8ff';g.fill();outline(g,'#c8d8ee',1);g.strokeStyle='#e8f6ff';g.lineWidth=1.2;for(var i=0;i<3;i++){var a=i*1.047;g.beginPath();g.moveTo(Math.cos(a)*5,-6+Math.sin(a)*5);g.lineTo(-Math.cos(a)*5,-6-Math.sin(a)*5);g.stroke();}});
A('key',function(g){g.rotate(-.7);g.beginPath();g.arc(0,-10,6,0,TAU);g.lineWidth=6;g.strokeStyle='#8a5a10';g.stroke();g.lineWidth=3.8;g.strokeStyle='#f0c23a';g.stroke();ln(g,[0,-4,0,16],'#8a5a10',5.6);ln(g,[0,-4,0,16],'#f0c23a',3.4);
  ln(g,[0,9,7,9],'#8a5a10',5);ln(g,[0,9,7,9],'#f0c23a',3);ln(g,[0,15,6,15],'#8a5a10',5);ln(g,[0,15,6,15],'#f0c23a',3);});
/* спрайты поля боя */
art('cu_fire',32,function(g){glow(g,0,0,15,'#ff7a1a','#ffe9a0');});
art('cu_note',20,function(g){note(g,-3,4,'#ffe07a');});
art('cu_honeyP',128,function(g){g.beginPath();g.ellipse(0,0,60,46,0,0,TAU);g.fillStyle='rgba(255,176,32,.36)';g.fill();g.lineWidth=3;g.strokeStyle='rgba(150,84,10,.55)';g.stroke();
  g.beginPath();g.ellipse(-16,-14,22,9,-.3,0,TAU);g.fillStyle='rgba(255,236,170,.4)';g.fill();ell(g,24,16,7,5,'rgba(255,214,110,.5)',{ol:false,flat:true});});
art('cu_ring',128,function(g){var gr=g.createRadialGradient(0,0,34,0,0,62);gr.addColorStop(0,'rgba(255,200,90,0)');gr.addColorStop(.8,'rgba(255,190,70,.22)');gr.addColorStop(1,'rgba(255,170,50,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,62,0,TAU);g.fill();});
art('cu_arr',32,function(g){poly(g,[13,0,-7,-9,-3,0,-7,9],'#ff8a3a',{flat:true,olc:'#3a1a0a',lw:1.6});});
var DARK=null;
function dark(){if(DARK)return DARK;var c=mkCanvas(256,256),g=c.getContext('2d'),gr=g.createRadialGradient(128,128,34,128,128,128);
  gr.addColorStop(0,'rgba(8,6,20,0)');gr.addColorStop(.55,'rgba(8,6,20,.5)');gr.addColorStop(1,'rgba(8,6,20,.72)');g.fillStyle=gr;g.fillRect(0,0,256,256);return DARK=c;}
var CHIP={};
function chip(id){if(CHIP[id])return CHIP[id];var c=mkCanvas(64,64),g=c.getContext('2d');g.beginPath();g.arc(32,32,30,0,TAU);g.fillStyle='rgba(20,22,48,.72)';g.fill();g.lineWidth=3;g.strokeStyle='#e6b53a';g.stroke();
  g.drawImage(drawArt('cu_'+id,52),6,6);return CHIP[id]=c;}

/* ---------- бой: помощники ---------- */
function hitR(g,x,y,r,d,key,cd,kx,ky){forNear(x,y,r+24,function(e){if(e.dead)return;var dx=e.x-x,dy=e.y-y,m=r+e.r;if(dx*dx+dy*dy>m*m)return;if((e.hk[key]||0)>g.t)return;e.hk[key]=g.t+cd;hitEnemy(e,d,kx||0,ky||0);});}
function nova(g,R,d,col,kn){var H=g.hero;g.fx.push({k:'wave',own:1,x:H.x,y:H.y,t:0,dur:.45,r1:R,col:col});
  forNear(H.x,H.y,R+24,function(e){if(e.dead)return;var dx=e.x-H.x,dy=e.y-H.y,dd=Math.sqrt(dx*dx+dy*dy)||1;if(dd>R+e.r)return;hitEnemy(e,d,dx/dd*(kn||0),dy/dd*(kn||0));});}
function setup(g,id){var C=g.cu,H=g.hero;
  if(id==='ruble')g.goldMul*=.8;
  if(id==='bells')g.wk=Object.assign({},g.wk,{spawn:(g.wk.spawn||1)*1.1});
  if(id==='whistle')g.wk=Object.assign({},g.wk,{spawn:(g.wk.spawn||1)*1.12});
  if(id==='kolobok')C.kb={x:H.x-40,y:H.y,st:0,aw:0,r:0,v:0};
  if(id==='apple')C.lv=H.lvl;
  if(id==='boots')C.bt=.5;
  if(id==='bells'){C.px=H.x;C.py=H.y;C.bd=0;}
  if(id==='rooster')C.rt=8;if(id==='skatert')C.sk=3;if(id==='honey')C.ht=1;if(id==='feather')C.fc=0;if(id==='whistle')C.wn=0;if(id==='pipe')C.pk=4;}
function take(g,id,src){var C=init(g);if(C.h[id]||IDS.indexOf(id)<0)return false;var T=defs()[id],s=sv(),nw=!s.b[id],H=g.hero;
  C.h[id]=1;C.l.push(id);s.b[id]=(s.b[id]||0)+1;s.n=(s.n||0)+1;setup(g,id);C.sr=null;
  try{computeStats();banner(L('Чудо!','A wonder!'),T.n+(nw?L(' — новое в книге!',' — new in the book!'):''),4);heroSay(T.s);SND.chest();vib(50,1);
    g.fx.push({k:'pulse',own:1,t:0,dur:.8,r1:VIEW.R*.7,evo:1});g.fx.push({k:'wave',own:1,x:H.x,y:H.y,t:0,dur:.6,r1:220,col:'#ffe07a'});}catch(e){}
  var tro=0,pgDone=-1;
  if(nw){C.nw++;try{var n=N('bookTro',2);if(n>0&&typeof TRO_ADD==='function'&&typeof TR==='function'&&TR()){TRO_ADD(g.troId||troTopId(),n);tro=n;}}catch(e){}
    var p=Math.floor(IDS.indexOf(id)/PG),full=1,i;for(i=p*PG;i<p*PG+PG&&i<IDS.length;i++)if(!s.b[IDS[i]])full=0;
    if(full&&!s.pg[p]){s.pg[p]=1;pgDone=p;try{var t=typeof TR==='function'&&TR();if(t){t.rr=(t.rr||0)+N('pageScroll',3/*ECO?*/);trTouch();}}catch(e){}}
    C.tro=(C.tro||0)+tro;try{if(pgDone>=0)toast('✨ '+L('Страница Книги чудес собрана: +3 свитка перебора!','Book of Wonders page complete: +3 reroll scrolls!'));save();}catch(e){}}
  BB2.stat('cu_pick',{k:id,nw:nw?1:0,d:id===day()?1:0,n:C.l.length,t:Math.round(g.t),c:g.endless?'inf':chPos(g.chi),s:src||'chest'});
  BB2.ev('chudo',id,g,nw);return true;}

/* ---------- окно «Сундук вожака: чудо!» ---------- */
function roll(g){var C=g.cu,pool=[],out=[],d=day(),i,w,tot,r;
  for(i=0;i<IDS.length;i++)if(!C.h[IDS[i]])pool.push(IDS[i]);
  if(!C.of&&pool.indexOf(d)>=0){out.push(d);pool.splice(pool.indexOf(d),1);}
  while(out.length<3&&pool.length){tot=0;for(i=0;i<pool.length;i++)tot+=pool[i]===d?N('dayBoost',3):1;r=Math.random()*tot;
    for(i=0;i<pool.length-1;i++){w=pool[i]===d?N('dayBoost',3):1;r-=w;if(r<=0)break;}out.push(pool.splice(i,1)[0]);}
  C.of++;return out;}
function cardH(id,i,g){var T=defs()[id],s=sv(),isDay=id===day();
  return '<button class="upc cuc" data-cu="'+id+'" data-i="'+i+'"><img src="'+ic('cu_'+id,104)+'" alt=""><div><b>'+T.n+(isDay?'<em>'+L('чудо дня','wonder of the day')+'</em>':'')+(s.b[id]?'':'<em class="new">'+L('новое','new')+'</em>')+'</b><span>'+T.d+(T.p?' <i class="cupr">'+L('Цена: ','Price: ')+T.p+'.</i>':'')+'</span></div></button>';}
function openOffer(g){var cards=roll(g),C=g.cu;if(!cards.length)return;
  g.paused=true;IN.on=false;try{YG.stop();}catch(e){}try{SND.chest();}catch(e){}guardModal();
  var fin=function(){hideModal();if(G===g&&!g.over){g.paused=false;try{YG.start();}catch(e){}}};
  showModal('<h3>'+L('Чудо из сундука!','A wonder from the chest!')+'</h3><p class="cusub">'+L('Выбери одно — до конца похода.','Pick one — it lasts the whole run.')+(per()>1?' <b style="white-space:nowrap">'+(C.l.length+1)+L('-е из ',' of ')+per()+'</b>':'')+'</p>'+
    '<div class="cards cucards">'+cards.map(function(id,i){return cardH(id,i,g);}).join('')+'</div><button class="cuno" id="cuNo">'+L('Обойдусь без чудес','I’ll manage without')+'</button>','chudo');
  BB2.stat('cu_offer',{c:g.endless?'inf':chPos(g.chi),n:C.of,d:cards.indexOf(day())>=0?1:0,t:Math.round(g.t)});
  var bs=document.querySelectorAll('#mBody .cuc'),i;
  for(i=0;i<bs.length;i++)bs[i].onclick=function(){try{SND.click();}catch(e){}var id=this.getAttribute('data-cu');fin();take(g,id,'chest');};
  on2('cuNo',function(){BB2.stat('cu_pick',{k:'',n:C.l.length,t:Math.round(g.t),c:g.endless?'inf':chPos(g.chi)});fin();});}
function on2(id,fn){var el=document.getElementById(id);if(el)el.onclick=function(e){try{SND.click();}catch(x){}fn(e);};}

/* ---------- крючки боя ---------- */
var mixLast=-1;
function mix(g){ /* перемешанное расписание: только главы кампании с места mixCh, не лесенка; число вожаков (3), Жар-птиц (2) и камней (1) прежнее */
  if(!BB2.on('evmix')||g.endless||g.daily||g.weekly||g.short||g.first||chPos(g.chi)<N('mixCh',7))return;
  var k=Math.floor(Math.random()*5);if(k===mixLast)k=(k+1+Math.floor(Math.random()*3))%5;mixLast=k;g.cuMix=k;if(!k){BB2.stat('evmix',{k:0,c:chPos(g.chi)});return;}
  var P=[null,
    {el:[45,165,250],st:100,rg:135,sw:[215],n:L('Вожак спешит','The chieftain is in a hurry')},
    {el:[100,195,262],st:170,rg:0,sw:[60,150],n:L('Две стаи','Two swarms')},
    {el:[80,140,235],st:50,rg:110,sw:[190],n:L('Камень у самой дороги','A stone right by the road')},
    {el:[120,215,268],st:95,rg:165,sw:[232],n:L('Тихое начало — жаркий конец','Quiet start, hot finish')}][k],ei=0,ev=[],i,e;
  for(i=0;i<g.ev.length;i++){e=g.ev[i];
    if(e.k==='elite'){if(ei<P.el.length)ev.push({t:P.el[ei++]+g.t0,k:'elite'});}
    else if(e.k==='stone')ev.push({t:P.st+g.t0,k:'stone'});
    else if(e.k==='ring'){if(P.rg)ev.push({t:P.rg+g.t0,k:'ring'});}
    else ev.push(e);}
  for(i=0;i<P.sw.length;i++)ev.push({t:P.sw[i]+g.t0,k:'swarm'});
  ev.sort(function(a,b){return a.t-b.t;});g.ev=ev;
  later(7,function(){if(G===g&&!g.over)banner(L('Примета похода','Omen of the run'),P.n,1);});
  BB2.stat('evmix',{k:k,c:chPos(g.chi)});}
function run(g){if(!g)return;try{mix(g);}catch(e){}if(ok(g))init(g);}
function kill(e){var g=typeof G!=='undefined'?G:null,C=g&&g.cu;if(!C||!e)return;
  if(e.elite)C.ec++;
  if(!C.l.length||e.prop||e.type==='egg')return;
  if(C.h.whistle&&++C.wn>=60){C.wn=0;C.wq=1;}
  if(C.h.pipe&&!e.boss&&!e.elite&&!e.mini&&++C.pk>=8&&C.al.length<6){C.pk=0;C.al.push({type:e.type,x:e.x,y:e.y,t:10,c:.3,a:0,ph:Math.random()*6,r:e.r||12,f:1,tg:null});}}
function pick(p,g){var C=g&&g.cu;if(!C||!p)return;
  if(p.k==='pie'&&C.h.skatert){var H=g.hero;H.hp=Math.min(g.st.maxHp,H.hp+15);try{SND.heal();addNum(H.x,H.y-30,15,'#6aff8a');}catch(e){}return true;}
  if(p.k==='chest'&&!(p.v>=2)&&C.ec>0){C.ec--;
    if(C.h.key)try{var c=rollCards(1)[0];if(c){applyCard(c);toast('🗝 '+L('Ключ от темницы: ещё награда — ','Dungeon Key: one more reward — ')+cardInfo(c).name);}}catch(e){}
    if(C.l.length+C.q<per()&&ok(g))C.q++;}}
function hurt(d,src,g){var C=g&&g.cu;if(!C||!C.l.length)return;var h=C.h,k=1;
  if(h.anchor&&!g.hero.moving)k*=.5;if(h.broom)k*=1.2;if(h.eye)k*=1.2;if(h.mirror){k*=1.1;C.mq=d;}if(h.mitten)C.fq=1;
  if(k!==1)return d*k;}
function down(g){var C=g&&g.cu;if(!C||!C.h.egg||C.eg)return;C.eg=1;revive(L('Яйцо-то целое!','The egg is still whole!'));BB2.stat('cu_use',{k:'egg',t:Math.round(g.t)});return true;}
function stHook(st){var g=typeof G!=='undefined'?G:null,h=g&&g.cu&&g.cu.h;if(!h||!st)return;
  if(h.boots)st.maxHp*=.9;if(h.egg)st.maxHp*=.7;if(h.feather)st.maxHp*=.9;
  if(h.sword)st.cd*=1.12;if(h.bayun)st.cd*=1.1;if(h.mitten)st.cd*=1.08;
  if(h.pipe)st.xp*=.9;if(h.blyudo)st.magnet*=1.7;if(h.shoe){st.luck*=1.5;st.magnet*=1.6;}}
function frame(dt,g){var C=g&&g.cu;if(!C)return;
  if(C.q>0&&!g.paused&&!g.over&&!g.win&&g.hero.hp>0&&!(g.lvlQ>0)){C.q--;if(C.l.length<per()&&ok(g)){openOffer(g);return;}}
  if(!C.l.length)return;
  var H=g.hero,st=g.st,h=C.h,mv=H.moving,mm=1,sm=1,M,i,a,x,y,dx,dy,dd,e,T;
  if(C.sr!==st){C.sr=st;C.m0=st.might;C.s0=st.spd;if(h.apple)st.regen=0;}
  M=C.m0;
  if(h.boots){C.bt=clamp(C.bt+(mv?dt/4:-dt/1.2),0,1);mm*=.8+.35*C.bt;}
  if(h.cap){C.cw=(C.cw||0)-dt;if(C.ca>0)C.ca-=dt;
    if(C.ci>0){C.ci-=dt;H.inv=Math.max(H.inv,.15);if(mv||C.ci<=0){C.ci=0;C.ca=2.5;C.cw=10;g.fx.push({k:'wave',own:1,x:H.x,y:H.y,t:0,dur:.35,r1:90,col:'#bfd8ff'});}}
    else{C.cs=mv?0:(C.cs||0)+dt;if(C.cs>=1.5&&C.cw<=0&&!(C.ca>0)){C.ci=3.5;C.cs=0;burst(H.x,H.y,'#bfd8ff',10,90);}}
    if(C.ca>0)mm*=2;}
  if(h.anchor){if(mv)sm*=.88;else{H.kx=0;H.ky=0;}}
  if(h.broom){sm*=1.25;T=C.tr;C.tt=(C.tt||0)-dt;if(mv&&C.tt<=0){C.tt=.16;if(T.length>=16)T.shift();T.push({x:H.x,y:H.y+8,t:0});}
    for(i=0;i<T.length;i++)T[i].t+=dt;while(T.length&&T[0].t>2.4)T.shift();
    C.tk=(C.tk||0)-dt;if(C.tk<=0){C.tk=.3;for(i=0;i<T.length;i+=2)hitR(g,T[i].x,T[i].y,26,6*M,'cb',.28);}}
  if(h.sword){C.sw=(C.sw||0)-dt;if(mv&&C.sw<=0){C.sw=1.1;slash(Math.atan2(H.fy,H.fx),84*st.area,(14+H.lvl*.4)*M,false);}}
  if(h.kolobok){var K=C.kb;K.st=mv?0:K.st+dt;
    if(K.aw>0){K.aw-=dt;if(K.aw<=0){K.x=H.x-H.fx*70;K.y=H.y-H.fy*70;heroSay(L('Вернулся, румяный!','He’s back, the rosy one!'));}}
    else if(K.st>4){K.aw=8;K.st=0;heroSay(L('Колобок укатился… Не стой!','Kolobok rolled off… Keep moving!'));}
    else{dx=H.x-H.fx*46-K.x;dy=H.y-H.fy*46+8-K.y;dd=Math.sqrt(dx*dx+dy*dy)||1;a=Math.min(dd,Math.min(dd*6,340)*dt);K.x+=dx/dd*a;K.y+=dy/dd*a;K.v=a/Math.max(dt,.001);K.r+=K.v*dt/11*(dx<0?-1:1);
      if(K.v>30)hitR(g,K.x,K.y,15,7*M*(.5+Math.min(1.5,K.v/150)),'ck',.4,dx/dd*160,dy/dd*160);}}
  if(h.bells){dx=H.x-C.px;dy=H.y-C.py;C.px=H.x;C.py=H.y;C.bd+=Math.min(40,Math.sqrt(dx*dx+dy*dy));if(C.bd>=700){C.bd=0;nova(g,150*st.area,24*M,'#ffe07a',180);try{SND.combo();}catch(z){}}}
  if(h.pipe){for(i=0;i<C.al.length;i++){a=C.al[i];a.t-=dt;a.c-=dt;a.a-=dt;
      if(a.a<=0||!a.tg||a.tg.dead){a.a=.4;a.tg=nearest(a.x,a.y,320);}
      e=a.tg;x=e?e.x:H.x+Math.cos(a.ph)*50;y=e?e.y:H.y+Math.sin(a.ph)*50;dx=x-a.x;dy=y-a.y;dd=Math.sqrt(dx*dx+dy*dy)||1;
      if(dd>(e?a.r+e.r:8)){a.x+=dx/dd*150*dt;a.y+=dy/dd*150*dt;a.f=dx<0?-1:1;}
      else if(e&&a.c<=0){a.c=.5;hitEnemy(e,10*M,dx/dd*120,dy/dd*120);}
      if(a.t<=0)burst(a.x,a.y,'#ffe07a',6,90);}
    compact(C.al,function(q){return q.t>0;});}
  if(h.ruble){C.ra=(C.ra||0)+dt*3.2;C.rc=C.rc||[0,0,0,0,0,0];for(i=0;i<3;i++){a=C.ra+i*TAU/3;x=H.x+Math.cos(a)*58*st.area;y=H.y+Math.sin(a)*58*st.area;C.rc[i*2]=x;C.rc[i*2+1]=y;hitR(g,x,y,13,8*M,'cr',.42,Math.cos(a)*120,Math.sin(a)*120);}}
  if(C.wq){C.wq=0;try{SND.whistle();}catch(z){}g.shake=Math.max(g.shake,5);g.fx.push({k:'wave',own:1,x:H.x,y:H.y,t:0,dur:.6,r1:VIEW.R,col:'#d8f0ff'});
    for(i=0;i<g.en.length;i++){e=g.en[i];if(e.dead||!onScreen(e,20))continue;dx=e.x-H.x;dy=e.y-H.y;dd=Math.sqrt(dx*dx+dy*dy)||1;hitEnemy(e,30*M,dx/dd*260,dy/dd*260);}}
  if(C.mq){a=Math.min(C.mq*6,45*M);C.mq=0;nova(g,105,a,'#bfeaff',200);}
  if(C.fq){C.fq=0;g.fx.push({k:'wave',own:1,x:H.x,y:H.y,t:0,dur:.35,r1:80,col:'#bfeaff'});forNear(H.x,H.y,104,function(q){if(q.dead||q.prop)return;var ux=q.x-H.x,uy=q.y-H.y;if(ux*ux+uy*uy>(80+q.r)*(80+q.r))return;q.stun=Math.max(q.stun||0,q.boss?.4:2);q.flash=.2;});}
  if(h.rooster){C.rt-=dt;if(C.rt<=0){C.rt=22;try{SND.whistle();}catch(z){}heroSay(L('Ку-ка-ре-ку!','Cock-a-doodle-doo!'));g.fx.push({k:'pulse',own:1,t:0,dur:.7,r1:VIEW.R});
      for(i=0;i<g.en.length;i++){e=g.en[i];if(e.dead||e.prop||!onScreen(e,10))continue;e.stun=Math.max(e.stun||0,e.boss?.5:e.elite?1:2);}}}
  if(h.rooster||h.bayun||h.key){for(i=0;i<g.en.length;i++){e=g.en[i];if(e.dead||e.prop)continue;
      if(!e.cuS){e.cuS=1;if(h.rooster&&!e.boss)e.spd*=1.08;if(h.key&&e.elite){e.hp*=1.5;e.max*=1.5;}}
      if(h.bayun&&!e.cuB&&!e.boss){dx=e.x-H.x;dy=e.y-H.y;if(dx*dx+dy*dy<13225){e.cuB=1;e.stun=Math.max(e.stun||0,e.elite?.5:1.3);}}}}
  if(h.skatert){C.sk-=dt;if(C.sk<=0){C.sk=10;if(C.pz.length<5)C.pz.push({x:H.x+rand(-70,70),y:H.y+rand(-70,70),t:0});}
    for(i=0;i<C.pz.length;i++){a=C.pz[i];a.t+=dt;if(a.t<.7)continue;T=0;forNear(a.x,a.y,36,function(q){if(q.dead||q.prop||T)return;var ux=q.x-a.x,uy=q.y-a.y;if(ux*ux+uy*uy<(q.r+12)*(q.r+12))T=1;});
      if(T){a.t=99;explode(a.x,a.y,80*st.area,34*M);}}
    compact(C.pz,function(q){return q.t<40;});}
  if(h.feather){C.fc-=dt;if(C.fc<=0&&H.hp>0&&H.hp<st.maxHp*.33){C.fc=40;H.hp=Math.min(st.maxHp,H.hp+st.maxHp*.25);H.inv=Math.max(H.inv,1.2);nova(g,190,28*M,'#ff9a2a',520);burst(H.x,H.y,'#ffb02a',18,220);
      try{SND.heal();}catch(z){}heroSay(L('Горю — не сгораю!','I burn but don’t burn out!'));BB2.stat('cu_use',{k:'feather',t:Math.round(g.t)});}}
  if(h.apple&&H.lvl>C.lv){a=st.maxHp*.12*(H.lvl-C.lv);C.lv=H.lvl;if(H.hp>0&&H.hp<st.maxHp){H.hp=Math.min(st.maxHp,H.hp+a);addNum(H.x,H.y-30,a,'#6aff8a');}}
  if(h.candle){sm*=.92;C.ck=(C.ck||0)-dt;if(C.ck<=0){C.ck=.5;hitR(g,H.x,H.y,118*st.area,6*M,'cc',.45);}}
  if(h.eye)mm*=1.15;
  if(h.honey){C.ht-=dt;T=C.hp;if(mv&&C.ht<=0){C.ht=4.5;if(T.length>=4)T.shift();T.push({x:H.x,y:H.y+6,t:0});}
    C.hk=(C.hk||0)-dt;for(i=0;i<T.length;i++){a=T[i];a.t+=dt;if(a.t>.8&&(H.x-a.x)*(H.x-a.x)+(H.y-a.y)*(H.y-a.y)<3000)H.slowT=Math.max(H.slowT||0,.15);
      if(C.hk<=0)forNear(a.x,a.y,84,function(q){if(q.dead||q.boss)return;var ux=q.x-a.x,uy=q.y-a.y;if(ux*ux+uy*uy<(60+q.r)*(60+q.r))q.slow=.45;});}
    if(C.hk<=0)C.hk=.25;while(T.length&&T[0].t>7)T.shift();}
  if(h.shoe)sm*=.92;
  st.might=C.m0*mm;st.spd=C.s0*sm;}

/* ---------- рисование ---------- */
function draw(c,g){var C=g&&g.cu;if(!C||!C.l.length)return;var h=C.h,H=g.hero,i,a,q,T;
  if(h.honey)for(i=0;i<C.hp.length;i++){a=C.hp[i];q=Math.min(1,a.t*4,(7-a.t)*2);if(onScreen(a,70))drawSpr('cu_honeyP',a.x,a.y,1,1,0,0,q);}
  if(h.candle)drawSpr('cu_ring',H.x,H.y,118*g.st.area/60,118*g.st.area/60,0,0,.9);
  if(h.broom)for(T=C.tr,i=0;i<T.length;i++){a=T[i];q=1-a.t/2.4;drawSpr('cu_fire',a.x,a.y,.5+q*.6,.5+q*.6,0,0,q);}
  if(h.skatert)for(i=0;i<C.pz.length;i++){a=C.pz[i];if(a.t>40||!onScreen(a,30))continue;q=1+Math.sin(g.t*5+i)*.08;drawSpr('pie',a.x,a.y,q,q,0,0,Math.min(1,a.t*3));}
  if(h.ruble&&C.rc)for(i=0;i<3;i++)drawSpr('coin',C.rc[i*2],C.rc[i*2+1],1.25,1.25);
  if(h.kolobok&&C.kb&&!(C.kb.aw>0))drawSpr('cu_kolobok',C.kb.x,C.kb.y,.62,.62,0,C.kb.r);
  if(h.pipe)for(i=0;i<C.al.length;i++){a=C.al[i];if(!onScreen(a,30))continue;q=a.t<1?a.t:1;drawSpr('cu_fire',a.x,a.y+a.r*.6,.9,.45,0,0,.55*q);
    drawSpr(a.type,a.x,a.y+Math.abs(Math.sin(g.t*7+a.ph))*-5,a.f,1,0,Math.sin(g.t*7+a.ph)*.22,q);drawSpr('cu_note',a.x+8,a.y-a.r-10-Math.sin(g.t*4+a.ph)*3,1,1,0,0,q);}}
function prog(id,C){ /* заполнение полоски под значком: 0…1; -1 — нет; -2 — «потрачено» */
  if(id==='boots')return C.bt;if(id==='bells')return C.bd/700;if(id==='whistle')return C.wn/60;if(id==='rooster')return 1-C.rt/22;
  if(id==='egg')return C.eg?-2:-1;if(id==='feather')return C.fc>0?1-C.fc/40:1;if(id==='cap')return C.ci>0?1:C.cw>0?1-C.cw/10:Math.min(1,(C.cs||0)/1.5);
  if(id==='kolobok')return C.kb&&C.kb.aw>0?-2:-1;if(id==='pipe')return C.pk/8;return -1;}
function chipXY(i){return [12,(window.__safeTop||0)+8+94+i*34];}
function drawTop(c,g){var C=g&&g.cu;if(!C||!C.l.length)return;var W=VIEW.W,Hh=VIEW.H,i,id,p,q,xy;
  if(C.h.candle){q=Math.sqrt(W*W+Hh*Hh)*1.08;c.drawImage(dark(),W/2-q/2,Hh/2-q/2,q,q);}
  if(C.h.blyudo){var s=spr('cu_arr');for(i=0;s&&i<g.en.length;i++){var e=g.en[i];if(e.dead||!e.elite)continue;var sx=(e.x-VIEW.cx)*VIEW.zoom+W/2,sy=(e.y-VIEW.cy)*VIEW.zoom+Hh/2;if(sx>0&&sx<W&&sy>0&&sy<Hh)continue;
      var an=Math.atan2(sy-Hh/2,sx-W/2),ex=clamp(sx,28,W-28),ey=clamp(sy,130,Hh-28);c.save();c.translate(ex,ey);c.rotate(an);c.drawImage(s.c,-16,-16,32,32);c.restore();}}
  for(i=0;i<C.l.length;i++){id=C.l[i];p=prog(id,C);xy=chipXY(i);if(p===-2)c.globalAlpha=.35;c.drawImage(chip(id),xy[0],xy[1],30,30);c.globalAlpha=1;
    if(p>=0){c.fillStyle='rgba(20,22,48,.72)';c.fillRect(xy[0]+32,xy[1]+11,22,6);c.fillStyle=p>=1?'#ffd84a':'#8ad0ff';c.fillRect(xy[0]+33,xy[1]+12,20*clamp(p,0,1),4);}}}
function tap(e,g){var C=g&&g.cu;if(!C||!C.l.length||!e)return;var i,xy;for(i=0;i<C.l.length;i++){xy=chipXY(i);
    if(e.clientX>=xy[0]-4&&e.clientX<=xy[0]+36&&e.clientY>=xy[1]-2&&e.clientY<=xy[1]+32){toast(tipOf(C.l[i]));return true;}}}

/* ---------- окна: привал, итоги, книга ---------- */
function listH(g){var C=g.cu,h='';if(!C||!C.l.length)return '';
  for(var i=0;i<C.l.length;i++)h+='<button class="cupi" data-cp="'+C.l[i]+'"><img src="'+ic('cu_'+C.l[i],72)+'" alt=""></button>';
  return '<div class="curow"><span>✨ '+L('Чудеса похода:','Wonders of the run:')+'</span>'+h+'</div>';}
function tipOf(id){var T=defs()[id];return T?T.n+': '+T.d+(T.p?' '+L('Цена: ','Price: ')+T.p+'.':''):'';}
function modal(kind,el){if(kind!=='pause'||typeof G==='undefined'||!G||!G.cu||!G.cu.l.length)return;var d=BB2.put(el,'top',listH(G),'cuP'),bs=d?d.querySelectorAll('[data-cp]'):[],i;for(i=0;i<bs.length;i++)bs[i].onclick=function(){toast(tipOf(this.getAttribute('data-cp')));};}
function end(g,win){var C=g&&g.cu;if(!C)return;var T=defs(),a=[],i;if(!C.l.length&&!C.of)return;
  for(i=0;i<C.l.length;i++)a.push(T[C.l[i]].n);
  if(a.length)g.metaHtml=(g.metaHtml||'')+'<p class="sub">✨ '+L('Чудеса: ','Wonders: ')+'<b>'+a.join(', ')+'</b>'+(C.nw?L(' · в книгу +',' · book +')+C.nw:'')+'</p>';
  BB2.stat('cu_end',{l:C.l.join(','),w:win?1:0,o:C.of,nw:C.nw,c:g.endless?'inf':chPos(g.chi),m:g.cuMix||0});}
function count(){var b=BB2.s('chudo').b||{},n=0,i;for(i=0;i<IDS.length;i++)if(b[IDS[i]])n++;return n;}
var bookPg=0,bookSel='';
function openBook(src){var s=sv(),T=defs(),d=day(),n=count(),i,id,h,g='',tabs='';
  if(src){BB2.stat('cu_book',{n:n,s:src});bookPg=Math.floor(IDS.indexOf(d)/PG);bookSel=d;}
  for(i=0;i<3;i++){var c=0,j;for(j=i*PG;j<i*PG+PG;j++)if(s.b[IDS[j]])c++;tabs+='<button data-pg="'+i+'" class="'+(i===bookPg?'on':'')+'">'+pgName(i)+' '+c+'/'+PG+(s.pg[i]?' ✓':'')+'</button>';}
  for(i=bookPg*PG;i<bookPg*PG+PG;i++){id=IDS[i];var has=!!s.b[id];g+='<button class="cucell'+(has?'':' lock')+(id===d?' day':'')+(id===bookSel?' sel':'')+'" data-cb="'+id+'"><img src="'+ic('cu_'+id,96)+'" alt=""><b>'+(has||id===d?T[id].n:'???')+'</b>'+(has?'<small>×'+s.b[id]+'</small>':'')+'</button>';}
  id=bookSel&&IDS.indexOf(bookSel)>=0?bookSel:'';
  h='<h3>'+L('Книга чудес','Book of Wonders')+'</h3><p class="cusub">'+L('Собрано: ','Collected: ')+'<b>'+n+' / '+IDS.length+'</b>'+(n>=IDS.length?' · '+L('ты — Чудотворец!','you are a Wonderworker!'):'')+'</p>'+
    '<div class="seg cuseg">'+tabs+'</div><div class="cug">'+g+'</div>'+
    '<div class="cuinfo">'+(id?(s.b[id]||id===d?'<b>'+T[id].n+(id===d?' · '+L('чудо дня','wonder of the day'):'')+'</b><span>'+T[id].d+(T[id].p?' <i class="cupr">'+L('Цена: ','Price: ')+T[id].p+'.</i>':'')+'</span>':'<b>???</b><span>'+L('Ещё не найдено. Ищи в сундуках вожаков.','Not found yet. Look in chieftain chests.')+'</span>'):'<span>'+L('Нажми на чудо, чтобы прочитать.','Tap a wonder to read about it.')+'</span>')+'</div>'+
    '<p class="cunote">'+L('Чудо дня (красная рамка) точно будет в первом сундуке вожака. Первая находка — трофеи, целая страница — 3 свитка перебора.','The wonder of the day (red frame) is always in the first chieftain chest. First find — trophies, a full page — 3 reroll scrolls.')+'</p>'+
    '<div class="btns"><button class="btn big" id="cuX">'+L('Закрыть','Close')+'</button></div>';
  showModal(h,'cubook');
  var bs=document.querySelectorAll('#mBody [data-pg]');for(i=0;i<bs.length;i++)bs[i].onclick=function(){try{SND.click();}catch(e){}bookPg=+this.getAttribute('data-pg');bookSel='';openBook();};
  bs=document.querySelectorAll('#mBody [data-cb]');for(i=0;i<bs.length;i++)bs[i].onclick=function(){try{SND.click();}catch(e){}bookSel=this.getAttribute('data-cb');openBook();};
  on2('cuX',hideModal);}
/* вход в книгу: вкладка «Задания» (рядом с Книгой нечисти) и строка «чудо дня» в карточке главы */
function unlocked(){return on()&&(S.runs||0)>=1;}
function questBtn(el){if(!el||!unlocked())return;if(el.querySelector('#cuBk'))return;var d=document.createElement('button');d.className='btn ghost cubk';d.id='cuBk';
  d.innerHTML='<img src="'+ic('cu_'+day(),72)+'" alt=""><span><b>✨ '+L('Книга чудес ','Book of Wonders ')+count()+'/'+IDS.length+'</b><small>'+L('Чудо дня: ','Wonder of the day: ')+defs()[day()].n+'</small></span>';
  d.onclick=function(){try{SND.click();}catch(e){}openBook('quests');};var seg=el.querySelector('.seg');if(seg&&seg.parentNode===el)el.insertBefore(d,seg.nextSibling);else el.insertBefore(d,el.firstChild);}
var mo=null;
function tab(t,el){if(t!=='Quests'||!el)return;questBtn(el);
  if(!mo&&typeof MutationObserver==='function'){mo=new MutationObserver(function(){try{questBtn(el);}catch(e){}});mo.observe(el,{childList:true});}}
function chInfo(slot,sel,info){if(!unlocked()||!sel||chPos(slot)<N('fromCh',2))return;var old=sel.querySelector('#cuDay');if(old)return;
  var d=document.createElement('button');d.id='cuDay';d.className='cuday';d.innerHTML='<img src="'+ic('cu_'+day(),56)+'" alt=""><span>'+L('Чудо дня: ','Wonder of the day: ')+'<b>'+defs()[day()].n+'</b></span>';
  d.onclick=function(e){e.stopPropagation();try{SND.click();}catch(x){}openBook('map');};sel.appendChild(d);}

/* ---------- стили окон (свои классы cu*) ---------- */
(function(){var s=document.createElement('style');s.textContent=
  '.upc.cuc{border:2px solid #e6b53a;box-shadow:0 0 0 1px rgba(255,216,74,.35),0 4px 14px rgba(230,150,30,.25);padding:7px 10px;gap:10px}.upc.cuc img{width:46px;height:46px}'+
  '.upc.cuc b{font-size:15px;line-height:1.15}.upc.cuc b em{position:absolute;top:-8px;left:12px;margin:0;font-size:10.5px;line-height:1.3;padding:1px 7px;white-space:nowrap;z-index:1}.upc.cuc b em.new{left:auto;right:12px}.upc.cuc span{font-size:12.5px;line-height:1.2;margin-top:1px}.upc.cuc .cupr{display:inline}.cucards{gap:9px;margin:9px 0 4px}'+
  '#mBody[data-w="chudo"]>h3,#mBody[data-w="cubook"]>h3{font-size:18px;padding:5px 18px;margin-bottom:6px}'+
  '.cusub{text-align:center;font-size:13.5px;line-height:1.25;margin:0 0 4px;font-weight:700}'+
  '.cuno{display:block;margin:0 auto;padding:6px 16px;min-height:38px;background:none;border:0;color:inherit;font:inherit;font-size:13.5px;font-weight:700;text-decoration:underline;opacity:.8}'+
  '.cupr{display:block;font-style:normal;font-weight:800;margin-top:2px;color:var(--cBad,#ff9a8a)}'+
  '.curow{display:flex;gap:6px;align-items:center;justify-content:center;margin:0 0 6px;font-size:13.5px;font-weight:800}.cupi{background:none;border:0;padding:0;min-width:40px;min-height:40px}.cupi img{width:36px;height:36px;display:block;margin:auto}'+
  '.cuseg{display:flex;gap:4px;margin:4px 0 6px}.cuseg button{flex:1;font-size:12.5px;padding:8px 2px;min-height:40px}'+
  '.cug{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}'+
  '.cucell{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px 5px;border-radius:14px;background:var(--card,rgba(255,255,255,.07));border:1px solid var(--line,rgba(255,255,255,.16));min-width:0;color:inherit}'+
  '.cucell img{width:42px;height:42px}.cucell b{font-size:11px;line-height:1.1;text-align:center;min-height:24px;display:flex;align-items:center}.cucell small{position:absolute;right:5px;top:3px;font-size:10.5px;font-weight:800;opacity:.75}'+
  '.cucell.lock img{filter:brightness(0) opacity(.4)}.cucell.day{border:2px solid #d8313d}.cucell.sel{box-shadow:0 0 0 2px #e6b53a}'+
  '.cuinfo{min-height:78px;margin:6px 0 2px;padding:6px 10px;border-radius:12px;background:var(--card,rgba(255,255,255,.07));text-align:left}.cuinfo b{display:block;font-size:15px}.cuinfo span{display:block;font-size:13.5px;line-height:1.3}'+
  '.cunote{font-size:12px;line-height:1.2;margin:5px 0 6px;text-align:center;opacity:.85}'+
  '.btn.cubk{display:flex;align-items:center;gap:10px;width:100%;text-align:left;margin:10px 0 4px;padding:8px 12px}.btn.cubk img{width:40px;height:40px;flex:none}.btn.cubk b{display:block;font-size:15px}.btn.cubk small{display:block;font-size:12.5px;font-weight:600;opacity:.9}'+
  '.cuday{display:flex;align-items:center;gap:6px;margin:6px auto 0;padding:3px 10px 3px 4px;border-radius:999px;border:1px solid #e6b53a;background:rgba(230,181,58,.14);color:inherit;font-size:12.5px;min-height:30px}.cuday img{width:24px;height:24px}';
  document.head.appendChild(s);})();

/* ---------- подписка и наружу ---------- */
BB2.hook('run',run);BB2.hook('kill',kill);BB2.hook('pick',pick);BB2.hook('hurt',hurt,60);BB2.hook('down',down,50);BB2.hook('st',stHook);BB2.hook('frame',frame);
BB2.hook('draw',draw);BB2.hook('drawTop',drawTop);BB2.hook('tap',tap);BB2.hook('modal',modal);BB2.hook('end',end);BB2.hook('tab',tab);BB2.hook('chInfo',chInfo);
/* BB2.chudo — для других потоков: ids — все id; name(id); day() — чудо дня; list(G) — чудеса похода (id по порядку); has(G,id);
   give(G,id) — выдать чудо (сверх предела, напр. «Дуракам везёт»); offer(G) — открыть окно выбора; book() — открыть книгу. Событие шины: BB2.ev('chudo',id,G,новоеВКниге) */
BB2.chudo={ok:1,ids:IDS,name:function(id){var T=defs()[id];return T?T.n:'';},desc:function(id){var T=defs()[id];return T?T.d:'';},day:day,count:count,
  list:function(g){return g&&g.cu?g.cu.l.slice():[];},has:function(g,id){return !!(g&&g.cu&&g.cu.h[id]);},
  give:function(g,id){if(!g||!on())return false;init(g);return take(g,id,'give');},offer:function(g){if(!g||!on())return;init(g);openOffer(g);},
  late:function(g){if(ok(g))init(g);},book:function(){openBook('api');}};
try{var t0=document.getElementById('tabQuests');if(t0&&t0.classList.contains('on'))tab('Quests',t0);}catch(e){}
})();
