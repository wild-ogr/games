'use strict';
/* ================= OB:CH — «Логова» старых глав (7-й уровень, ключ 'c-6'; необязательный, открывается после босса главы) =================
   Ярый босс главы (здоровье ×1,6, приёмы чаще — CH_YAR), вожак из нечисти главы в последней волне, два входа. Карты и волны старых уровней не меняются. */
(function(){
const E=LANG_DATA.find(x=>x[0]===CH);   // наложение en.js по главам: допишем 7-й уровень в обе копии (русскую и английскую)
function add7(c,key,ru,en){const R=E[2][c][key].concat([ru]),N=((E[1][c]&&E[1][c][key])||E[2][c][key]).concat([en]);E[2][c][key]=R;if(E[1][c])E[1][c][key]=N;
  const a=CH[c][key];a.length=0;for(const x of(LANG==='en'?N:R))a.push(x);}
const L=[
  [0,'Гнездо Соловья','Nightingale’s Nest','Логово Соловья — по желанию. Он тут ярый: свистит чаще, а с ним Леший-батюшка. Расставь заставы вдоль всей дороги!','Nightingale’s Lair — optional. Here he is raging: he whistles more often, and Father Leshy comes along. Spread outposts along the whole road!','lesh',1.5],
  [1,'Ступа Яги','Yaga’s Mortar','Логово Бабы-яги — по желанию. Ярая Яга летает чаще, котов больше, а из топи лезет Водяной-дед.','Baba Yaga’s Lair — optional. The raging Yaga flies more often, more cats, and Grandfather Vodyanoy climbs out of the bog.','vod',.9],
  [2,'Змеиное гнездо','The Serpent’s Nest','Логово Горыныча — по желанию. Ярый Змей жжёт заставы чаще, а Упырь-вожак ведёт голодную стаю.','Gorynych’s Lair — optional. The raging Zmey burns outposts more often, and the Upyr Leader brings a hungry pack.','upyr',.75],
  [3,'Кощеева сокровищница','Koschei’s Treasury','Логово Кощея — по желанию. Ярый Кощей зовёт скелетов чаще, а Призрак-воевода сквозит над полем. Яйцо — пальцем!','Koschei’s Lair — optional. The raging Koschei calls skeletons more often, and the Ghost Commander drifts over the field. Tap the egg!','prizr',.95],
  [4,'Ледяной трон','The Ice Throne','Логово Карачуна — по желанию. Ярый Карачун морозит чаще, а Дух метели летит прямо к воротам.','Karachun’s Lair — optional. The raging Karachun freezes more often, and the Blizzard Spirit flies straight at the gate.','ledyan',1.05],
  [5,'Пучина','The Abyss','Логово Морского царя — по желанию. Ярый прилив лечит нечисть чаще, а Русалка-царевна поёт громче всех.','The Sea Tsar’s Lair — optional. The raging tide heals monsters more often, and the Rusalka Princess sings the loudest.','rusalka',1.05],
  [6,'Огненное жерло','The Fiery Maw','Логово Тугарина — по желанию. Ярый Змей чаще прячется за щитом, а Огненный воевода ведёт чертей.','Tugarin’s Lair — optional. The raging Zmey hides behind his shield more often, and the Fire Commander leads the imps.','skel_f',1.05],
  [7,'Око Лиха','Likho’s Eye','Логово Лиха — по желанию. Ярое Лихо усыпляет заставы чаще, а Чёрный чародей лечит всю нечисть вокруг.','Likho’s Lair — optional. The raging Likho puts outposts to sleep more often, and the Black Warlock heals every monster around.','koldun',1.05]];
const N={vod:['Водяной-дед','Grandfather Vodyanoy'],upyr:['Упырь-вожак','Upyr Leader'],prizr:['Призрак-воевода','Ghost Commander'],ledyan:['Дух метели','Blizzard Spirit'],
  rusalka:['Русалка-царевна','Rusalka Princess'],skel_f:['Огненный воевода','Fire Commander'],koldun:['Чёрный чародей','Black Warlock']};
const AB={vod:['Толстый, в тине, и заживает. Пушка и яд!','Fat, slimy, and it heals. Cannon and poison!'],upyr:['Голодный и быстро заживает — бей кучно!','Hungry and heals fast — hit it together!'],
  prizr:['Стрелы сквозь него пролетают — нужен колдун!','Arrows fly right through — you need the sorcerer!'],ledyan:['Летит над полем — стрельцы и колдун, к бою!','It flies over the field — archers and sorcerer, to battle!'],
  rusalka:['Лечит соседей песней — сбей её первой!','Heals neighbors with her song — knock her down first!'],skel_f:['Кости в латах из копоти — бей колдовством!','Bones in armor of soot — use magic!'],
  koldun:['Лечит всю нечисть рядом — бей первым!','Heals every monster nearby — strike first!']};
const SAY={vod:[['Бульк!','Кто в моём пруду?!','Утоплю!'],['Glug!','Who’s in my pond?!','I’ll drown you!']],upyr:[['Есть хочу!','Кусь!','Ням!'],['I’m hungry!','Chomp!','Yum!']],
  prizr:[['У-у-у!','Бойтесь!','Сквозь стены хожу!'],['Ooooo!','Be afraid!','I walk through walls!']],ledyan:[['Фью-у-у!','Заморожу!','Бр-р-р!'],['Whooo!','I’ll freeze you!','Brrr!']],
  rusalka:[['Ля-ля-ля!','Споём, сёстры?','Плюх!'],['La-la-la!','Shall we sing, sisters?','Splash!']],skel_f:[['Горячо!','Пепел вам!','Жарко?'],['Hot!','Ashes to you!','Feeling warm?']],
  koldun:[['Заживай, братцы!','Колдую!','Ха-ха!'],['Heal up, brothers!','Casting!','Ha-ha!']]};
const n={},ne={},ab={},abe={},sy={},sye={};
for(const k in N){n[k]=N[k][0];ne[k]=N[k][1];ab[k]=AB[k][0];abe[k]=AB[k][1];sy[k]=SAY[k][0];sye[k]=SAY[k][1];}
Object.assign(LEAD.n,n);chLang(LEAD.n,ne);LEAD.ab=LEAD.ab||{};Object.assign(LEAD.ab,ab);chLang(LEAD.ab,abe);LEAD.sayT=LEAD.sayT||{};Object.assign(LEAD.sayT,sy);chLang(LEAD.sayT,sye);
for(const [c,ru,en,ir,ie,ld,fx] of L){CH[c].lair=1;add7(c,'levels',ru,en);add7(c,'intro',ir,ie);LEAD.at[c+'-6']=ld;LEVEL_FIX[c+'-6']=fx;}
})();
