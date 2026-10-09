'use strict';
/* vy-mgc · мини-игра №11 «Найди поломку» (ведущий — Толик «Карбюратор»). Договор — шапка js/vymg-core.js (MG0); набор — js/vymg-mgckit.js (VYC).
   Соседи пригоняют машину и жалуются («стучит», «не заводится»). Капот открыт — тапни деталь, «🔧 Чинить». Ошиблся — Толик даёт следующую подсказку,
   примета поломки проступает ярче. 5 машин. Очки за машину: 3 — с первой подсказки, 2 — после одной ошибки/подсказки, 1 — после двух, 0 — Толик показал сам.
   Всего до 15; ступени 6/10/13. Без таймера. ПК: мышь (наведение — подпись), стрелки/WASD/ЦФЫВ — соседняя деталь по направлению (проверенные пропускаются), Enter/Пробел — «Чинить» / «Дальше», H/Р — подсказка. */
(function(){if(typeof VYMG_REG!=='function'||!window.VYC)return;
var K=window.VYC,ID='polomka',N=5,CUT=[6,10,13];
/* ---------- детали подкапотного (единицы отсека 100×80, перед машины — внизу) ---------- */
var P={
 tormoz:{n:'Бачок тормозов',x:14,y:13},
 akb:{n:'Аккумулятор',x:81,y:16},
 svechi:{n:'Свечи и провода',x:33,y:33},
 tramb:{n:'Трамблёр',x:23,y:55},
 karb:{n:'Карбюратор',x:49,y:33},
 masl:{n:'Крышка масла',x:61,y:19},
 remen:{n:'Ремень',x:49,y:62},
 gen:{n:'Генератор',x:63,y:57},
 radiator:{n:'Радиатор',x:50,y:71},
 patrubok:{n:'Патрубок',x:71,y:44},
 fara:{n:'Фара',x:10,y:73},
 omyv:{n:'Бачок омывателя',x:88,y:42}};
var ORDER=['masl','tramb','gen','fara','tormoz','omyv','akb','patrubok','remen','karb','svechi','radiator'];
function dist(px,py,ax,ay,bx,by){var dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l)):0;return Math.hypot(px-ax-t*dx,py-ay-t*dy);}
var HIT={
 masl:function(x,y){return Math.hypot(x-61,y-19)<5;},
 tramb:function(x,y){return Math.hypot(x-23,y-55)<6.5;},
 gen:function(x,y){return Math.hypot(x-63,y-57)<6.5;},
 fara:function(x,y){return y>67&&(x<19||x>81);},
 tormoz:function(x,y){return x>7&&x<21&&y>5&&y<22;},
 omyv:function(x,y){return x>81&&x<96&&y>30&&y<54;},
 akb:function(x,y){return x>69&&x<94&&y>6&&y<27;},
 patrubok:function(x,y){return dist(x,y,64,40,72,46)<4.5||dist(x,y,72,46,74,64)<4.5;},
 remen:function(x,y){return x>36&&x<70&&y>55&&y<67&&!(Math.hypot(x-63,y-57)<6.5);},
 karb:function(x,y){return Math.hypot(x-49,y-33)<12;},
 svechi:function(x,y){return x>26&&x<70&&y>11&&y<52;},
 radiator:function(x,y){return x>20&&x<80&&y>66&&y<78;}};
/* ---------- неисправности: жалоба, 3 подсказки Толика (от общей к прямой), что сделал ---------- */
var CASES=[
 {p:'akb',c:'Утром не завелась: стартер даже не щёлкнул, и лампочки на приборке еле светят.',h:['Раз всё электрическое еле живое — ищи, где хранится ток.','Ток живёт в тяжёлом ящике с двумя клеммами.','Глянь на клемму — видишь белый налёт? Окислилась!'],f:'Клемму почистил, подтянул — заведётся как миленькая!'},
 {p:'akb',c:'Неделю простояла у подъезда — теперь стартер еле крутит: «хрр… хрр…»',h:['Стартеру не хватает силы. Откуда он её берёт?','Тяжёлый ящик с плюсом и минусом.','Клемма вся в белой каше — контакта нет.'],f:'Почистил и зарядил. Ездить надо чаще!'},
 {p:'remen',c:'Под капотом свистит, как чайник, особенно когда газую.',h:['Свистит то, что крутится и проскальзывает.','Оно резиновое и бегает по колёсикам-шкивам впереди мотора.','Видишь — ремень провис и весь в трещинах.'],f:'Новый ремень натянул — свистеть больше не будет.'},
 {p:'svechi',c:'Мотор трясётся и «троит», будто кашляет.',h:['Один цилиндр не работает — ему не хватает искры.','Искра бежит по толстым проводам к свечам.','Один провод соскочил со свечи — болтается!'],f:'Провод на место надел — мотор зашептал ровненько.'},
 {p:'tramb',c:'В сырую погоду заводится через раз, а после дождя — совсем никак.',h:['Сырость любит электрику — где-то пробивает искру.','Искру по свечам раздаёт круглая крышка с проводами-щупальцами.','Крышка трамблёра треснула — туда и лезет сырость.'],f:'Крышку трамблёра поменял — теперь хоть в ливень.'},
 {p:'karb',c:'В салоне пахнет бензином, а бак пустеет, будто дыра.',h:['Где бензин смешивается с воздухом?','Под большой круглой «кастрюлей» наверху мотора.','Видишь мокрое пятно? Карбюратор подтекает.'],f:'Карбюратор — моя любимая штука! Прокладку сменил, жиклёры продул.'},
 {p:'karb',c:'Глохнет на холостых, стоит только отпустить газ.',h:['Мотору не хватает смеси, когда педаль отпущена.','Смесь готовит деталь, в честь которой меня прозвали.','Карбюратор! Видишь, весь в бензине.'],f:'Холостой ход подрегулировал. За это меня Карбюратором и зовут!'},
 {p:'radiator',c:'Стрелка температуры в красной зоне, из-под капота пар!',h:['Мотор перегрелся — значит, его плохо охлаждают.','Охлаждает большая решётка в самом носу.','Видишь пар? Радиатор потёк.'],f:'Радиатор запаял, тосолу долил. Остывай, родной.'},
 {p:'patrubok',c:'Под машиной зелёная лужица, а тосол всё время доливаю.',h:['Зелёное — это тосол. Ищи, где он течёт.','Тосол бегает по толстым резиновым шлангам от радиатора к мотору.','Капает с патрубка — он треснул.'],f:'Патрубок новый, хомуты затянул. Сухо!'},
 {p:'fara',c:'Ночью еду — а слева темнота, видно полдороги.',h:['Это вовсе не мотор. Что светит вперёд?','Их две, по углам спереди.','Левая фара не горит — лампочка перегорела.'],f:'Лампочку поменял. Теперь хоть в лес по грибы!'},
 {p:'omyv',c:'Жму на дворники — стекло не моет, только грязь размазывает.',h:['Чем моют стекло на ходу?','Прозрачный бачок с водичкой, сбоку.','Бачок омывателя сухой!'],f:'Водички налил. Мелочь, а приятно.'},
 {p:'masl',c:'Мотор весь в масле, и на капоте брызги.',h:['Масло брызжет, если где-то открыто.','Масло заливают сверху, в горловину на крышке мотора.','Крышку маслозаливной горловины забыли закрутить!'],f:'Крышку нашёл — она на аккумуляторе лежала. Закрутил!'},
 {p:'tormoz',c:'Педаль тормоза проваливается, тормозит еле-еле.',h:['Тормозам нужна своя жидкость.','Бачок с ней — у самого стекла, со стороны руля.','Видишь, уровень ниже метки MIN?'],f:'Жидкость долил, тормоза прокачал. Встаёт как вкопанная!'},
 {p:'gen',c:'Горит красная лампочка с батарейкой, а ремень вроде целый.',h:['Раз ремень цел, ищи то, что он крутит и что даёт ток.','Он сбоку мотора, круглый, с крыльчаткой.','Генератор! Чуешь — дымком тянет? Щётки стёрлись.'],f:'Щётки в генераторе поменял — зарядка пошла.'},
 {p:'gen',c:'Еду — а аккумулятор садится, к вечеру еле заводится.',h:['Аккумулятор в пути должен подзаряжаться. Кто его кормит?','Круглый, с крыльчаткой, ремень его крутит.','Генератор не заряжает — видишь дымок?'],f:'Генератор перебрал. Теперь заряжает, будь здоров!'}];
var OWN=[{w:'mihalych',n:'Михалыч',car:'«Волга»',col:'#2d3436'},{w:'mityai',n:'Дед Митяй',car:'«Запорожец»',col:'#c0d6a3'},{w:'shura',n:'Баба Шура',car:'внуков «Москвич»',col:'#3f8fe0'},
 {w:'valerka',n:'Валерка',car:'папина «Копейка»',col:'#e74c3c'},{w:'mihalych',n:'Сосед с пятого',car:'«Нива»',col:'#27ae60'},{w:'mityai',n:'Почтальонша Галя',car:'«Девятка»',col:'#7c4dff'}];
var SAY0={start:'Капот открыт. Слушай жалобу, смотри — и тыкай, что барахлит.',ok3:['С первого раза! Да ты механик!','Глаз-алмаз! Вот она, родимая.'],ok2:['Нашёл! Молодец.','Есть! Вот она.'],ok1:['Ну, нашёл — и ладно.','Дошло! Вот она.'],
 no:['Нет, тут порядок. ','Это в порядке. ','Не-а, тут всё живое. '],show:'Вот она! Смотри, где была. ',sel:'Это <b>%</b>? Жми «Чинить» — или выбери другое.'};
/* English (Яндекс ?lang=en): те же записи по порядку */
var P_EN={tormoz:'Brake fluid',akb:'Battery',svechi:'Plugs & leads',tramb:'Distributor',karb:'Carburettor',masl:'Oil cap',remen:'Fan belt',gen:'Alternator',radiator:'Radiator',patrubok:'Hose',fara:'Headlight',omyv:'Washer tank'};
var CASES_EN=[
 {c:'Wouldn’t start this morning: the starter didn’t even click, and the dash lights are barely on.',h:['If everything electric is half-dead, find where the power is stored.','The power lives in a heavy box with two terminals.','Look at the terminal — see that white crust? Corroded!'],f:'Cleaned the terminal, tightened it — she’ll start like a dream!'},
 {c:'Sat a week by the entrance — now the starter barely turns: “grr… grr…”',h:['The starter is short of strength. Where does it get it?','A heavy box with a plus and a minus.','The terminal is covered in white gunk — no contact.'],f:'Cleaned and charged. You should drive more often!'},
 {c:'Something under the bonnet whistles like a kettle, worst when I rev.',h:['What whistles is something spinning and slipping.','It’s rubber and runs over the pulleys at the front of the engine.','See — the belt is slack and cracked all over.'],f:'Fitted a new belt — no more whistling.'},
 {c:'The engine shakes and splutters, like it’s coughing.',h:['One cylinder isn’t working — it’s missing a spark.','The spark runs along thick leads to the plugs.','One lead has come off its plug — it’s dangling!'],f:'Pushed the lead back on — the engine purrs again.'},
 {c:'In damp weather it starts every other time, and after rain not at all.',h:['Damp loves electrics — the spark is leaking somewhere.','The round cap with lead “tentacles” shares the spark out.','The distributor cap is cracked — that’s where the damp gets in.'],f:'New distributor cap — now it starts even in a downpour.'},
 {c:'The car smells of petrol and the tank empties like it has a hole.',h:['Where does petrol mix with air?','Under the big round “pot” on top of the engine.','See the wet patch? The carburettor is leaking.'],f:'The carburettor is my favourite thing! New gasket, jets blown clean.'},
 {c:'It stalls at idle the moment I let go of the pedal.',h:['The engine runs short of mixture with the pedal released.','The mixture is made by the part I’m nicknamed after.','The carburettor! Look, it’s soaked in petrol.'],f:'Adjusted the idle. That’s why they call me Carburettor!'},
 {c:'The temperature needle is in the red and steam pours from the bonnet!',h:['The engine overheated — so it isn’t being cooled properly.','The big grille right at the front does the cooling.','See the steam? The radiator’s leaking.'],f:'Soldered the radiator, topped up the coolant. Cool down, old girl.'},
 {c:'There’s a green puddle under the car, and I keep topping up coolant.',h:['Green means coolant. Find where it leaks.','Coolant runs through thick rubber hoses from the radiator to the engine.','It drips from the hose — it’s cracked.'],f:'New hose, clamps tightened. Bone dry!'},
 {c:'Driving at night — it’s dark on the left, I see half the road.',h:['That’s not the engine at all. What shines ahead?','There are two, in the front corners.','The left headlight is out — the bulb’s blown.'],f:'Changed the bulb. Now you can drive to the woods for mushrooms!'},
 {c:'I press the washer — the screen isn’t washed, just smeared.',h:['What washes the windscreen on the move?','A see-through tank of water, at the side.','The washer tank is bone dry!'],f:'Topped up the water. Small thing, but nice.'},
 {c:'The engine is all oily, and there are splashes on the bonnet.',h:['Oil splashes out if something’s left open.','Oil goes in at the top, through a hole in the engine cover.','Somebody forgot to screw the oil cap back on!'],f:'Found the cap — it was lying on the battery. Screwed it on!'},
 {c:'The brake pedal sinks and the car barely stops.',h:['Brakes need a fluid of their own.','Its tank is right by the windscreen, on the driver’s side.','See, the level is below MIN?'],f:'Topped up the fluid and bled the brakes. Stops dead now!'},
 {c:'The red battery light is on, but the belt looks fine.',h:['If the belt’s fine, look at what it drives — the thing that makes power.','It’s on the side of the engine, round, with a fan.','The alternator! Smell the smoke? The brushes are worn.'],f:'Changed the alternator brushes — charging again.'},
 {c:'I drive and the battery runs down; by evening it barely starts.',h:['The battery should charge on the move. Who feeds it?','Round, with a fan, the belt turns it.','The alternator isn’t charging — see the smoke?'],f:'Rebuilt the alternator. It charges like mad now!'}];
var OWN_EN=[{n:'Mikhalych',car:'Volga'},{n:'Grandpa Mityai',car:'Zaporozhets'},{n:'Granny Shura',car:'her grandson’s Moskvich'},{n:'Valerka',car:'his dad’s Kopeyka'},{n:'The neighbour from the 5th floor',car:'Niva'},{n:'Galya the postwoman',car:'Devyatka'}];
var SAY_EN={start:'Bonnet’s up. Listen to the complaint, look — and tap what’s wrong.',ok3:['First try! You’re a real mechanic!','Eagle eye! There she is.'],ok2:['Found it! Well done.','Got it! There she is.'],ok1:['Well, found it — that’s what counts.','Got there! That’s the one.'],
 no:['No, that’s fine. ','That one’s OK. ','Nope, all good there. '],show:'Here it is! Look where it was. '};
function pickCases(R){var all=K.shuffle(CASES,R),out=[],used={},en=K.en();for(var i=0;i<all.length&&out.length<N;i++){if(used[all[i].p])continue;used[all[i].p]=1;out.push(en?Object.assign({},all[i],CASES_EN[CASES.indexOf(all[i])]):all[i]);}return out;}
function pts(miss){return Math.max(0,3-miss);}

function run(host,o){var R=o.rnd||Math.random,cs=pickCases(R),EN=K.en(),T=K.L,own=K.shuffle(OWN.map(function(x,i){return EN?Object.assign({},x,OWN_EN[i]):x;}),R),calm=K.calm(o),SAY=EN?SAY_EN:SAY0;
  function pn(id){return EN?P_EN[id]:P[id].n;}
  var f=K.frame(host,o,{who:'tolik'}),C=K.canvas(f.main),ctx=C.ctx;
  var st={i:0,res:[],score:0,miss:0,sel:null,hov:null,ok:{},found:false,shown:false,t:0,fx:0,fin:false};
  window.__vyc_polomka=st;st.cs=cs;
  var bFix=K.btn(T('🔧 Чинить','🔧 Fix')+K.kc('Enter',host),'acc',fix),bHint=K.btn('💡'+(K.pc(host)?T(' Подсказка',' Hint')+K.kc('H',host):''),'',hint),bNext=K.btn(T('Следующая машина','Next car'),'grn',next);
  bHint.style.flex='none';bFix.style.flex='1';bFix.style.maxWidth='420px';
  f.foot.appendChild(bHint);f.foot.appendChild(bFix);
  var view={s:1,x:0,y:0,top:54};
  function layout(){C.fit();var top=view.top,w=C.w-16,h=C.h-top-6,s=Math.min(w/100,h/88);view.s=s;view.x=(C.w-100*s)/2;view.y=top+(h-88*s)/2+8*s;}
  function toU(ex,ey){var r=C.cv.getBoundingClientRect();return {x:(ex-r.left-view.x)/view.s,y:(ey-r.top-view.y)/view.s};}
  function at(u){for(var i=0;i<ORDER.length;i++)if(HIT[ORDER[i]](u.x,u.y))return ORDER[i];return null;}
  function cur(){return cs[st.i];}
  function startCar(){st.miss=0;st.sel=null;st.ok={};st.found=false;st.shown=false;st.fx=0;
    f.prog(N,st.i,st.res);if(host.top)host.top(T('Машина ','Car ')+(st.i+1)+T(' из ',' of ')+N);
    var c=cur();f.say((st.i?'':SAY.start+'<br>')+'<i>'+c.h[0]+'</i>','norm');
    f.foot.innerHTML='';f.foot.appendChild(bHint);f.foot.appendChild(bFix);upd();}
  function upd(){bFix.disabled=!st.sel||st.found;bFix.innerHTML=st.sel?T('🔧 Чинить: ','🔧 Fix: ')+pn(st.sel)+K.kc('Enter',host):T('🔧 Выбери деталь','🔧 Pick a part')+K.kc('←↑→↓',host);bHint.disabled=st.found||st.miss>=2;}
  function choose(id){if(st.found||host.paused||!id)return;if(st.ok[id]){f.say(pn(id)+T(' — уже проверили, там порядок.',' — already checked, it’s fine.')+'<br><i>'+cur().h[Math.min(2,st.miss)]+'</i>','norm');return;}
    if(st.sel===id){fix();return;}st.sel=id;K.snd(host,'tap');upd();}
  function hint(){if(st.found||st.miss>=2)return;st.miss++;K.snd(host,'pick');f.say('<i>'+cur().h[st.miss]+'</i>','norm');upd();}
  function fix(){if(!st.sel||st.found||host.paused)return;var c=cur();
    if(st.sel===c.p){st.found=true;var p=pts(st.miss);st.res.push(p);st.score+=p;K.snd(host,'right');K.buzz(15);st.fx=0;
      f.say(K.pick(SAY['ok'+Math.max(1,p)],R)+' '+c.f,'happy');done();return;}
    st.ok[st.sel]=1;st.miss++;K.snd(host,'wrong');K.buzz(30);var nm=pn(st.sel);st.sel=null;
    if(st.miss>=3){st.found=true;st.shown=true;st.res.push(0);f.say(SAY.show+c.f,'sad');done();return;}
    f.say(nm+': '+K.pick(SAY.no,R)+'<br><i>'+c.h[st.miss]+'</i>','sad');upd();}
  function done(){f.prog(N,-1,st.res.concat(st.i<N-1?[]:[]));var last=st.i>=N-1;bNext.innerHTML=(last?T('Итоги','Results'):T('Следующая машина','Next car'))+K.kc('Enter',host);
    f.foot.innerHTML='';setTimeout(function(){if(st.fin)return;f.foot.appendChild(bNext);},calm?0:450);}
  function next(){if(!st.found||host.paused)return;if(st.i>=N-1){finish();return;}st.i++;startCar();}
  function finish(){if(st.fin)return;st.fin=true;var p3=st.res.filter(function(p){return p===3;}).length;
    host.done({score:st.score,tier:K.tier(st.score,CUT),label:T(st.score+' очк. из '+N*3+' · с первого раза: '+p3+' из '+N,st.score+' pts of '+N*3+' · first try: '+p3+' of '+N),extra:{max:N*3}});}
  /* ввод */
  C.cv.addEventListener('pointerdown',function(e){var u=toU(e.clientX,e.clientY);choose(at(u));});
  C.cv.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;var id=at(toU(e.clientX,e.clientY));st.hov=id;C.cv.style.cursor=id&&!st.found?'pointer':'';});
  C.cv.addEventListener('pointerleave',function(){st.hov=null;});
  K.keys(host,function(k,e,d){if(!d)return false;if(k==='Enter'||k===' '){if(st.found)next();else fix();return true;}if(k==='h'||k==='H'||k==='р'||k==='Р'){hint();return true;}
    var dr=K.dir(k);if(dr){if(st.found)return true;var it=Object.keys(P).filter(function(id){return !st.ok[id];}).map(function(id){return {id:id,x:P[id].x,y:P[id].y};});
      var id=K.near(it,st.sel,dr);if(id&&id!==st.sel){st.sel=id;K.snd(host,'tap');upd();}return true;}return false;});
  if(host.onResize)host.onResize(layout);
  /* ---------- рисование ---------- */
  function sev(){if(st.found&&!st.shown)return 0;return st.shown?1:[.35,.6,1][Math.min(2,st.miss)];}
  function draw(dt,t){st.t=t;st.fx+=dt;if(C.w!==f.main.clientWidth||C.h!==f.main.clientHeight)layout();
    var c=ctx,s=view.s,cs0=cur(),ow=own[st.i%own.length];c.clearRect(0,0,C.w,C.h);
    // карточка жалобы
    c.save();c.font='600 '+Math.max(12,Math.min(16,C.w/28))+'px Rubik,-apple-system,sans-serif';c.textBaseline='top';
    var cw=Math.min(C.w-16,740),cx=(C.w-cw)/2,tx=ow.n+' ('+ow.car+'): '+T('«','“')+cs0.c+T('»','”');var lines=wrap(c,tx,cw-20);var lh=Math.max(15,Math.min(20,C.w/22));
    K.rr(c,cx,4,cw,lines.length*lh+12,12);c.fillStyle='rgba(255,253,247,.94)';c.fill();c.fillStyle='#2d3436';
    lines.forEach(function(l,i){c.fillText(l,cx+10,10+i*lh);});c.restore();
    var need=lines.length*lh+20;if(Math.abs(need-view.top)>1){view.top=need;layout();}
    c.save();c.translate(view.x,view.y);c.scale(s,s);bay(c,ow.col,cs0,t);c.restore();}
  function wrap(c,t,w){var ws=t.split(' '),l=[],cu='';ws.forEach(function(x){var tt=cu?cu+' '+x:x;if(c.measureText(tt).width>w&&cu){l.push(cu);cu=x;}else cu=tt;});if(cu)l.push(cu);return l;}
  function bay(c,col,cs0,t){var br=sev(),bad=cs0.p,pulse=calm?1:(.75+.25*Math.sin(t*5));
    // капот поднят (вверху) и крылья в цвет машины
    c.fillStyle=shade(col,-.25);c.beginPath();c.moveTo(6,-2);c.lineTo(94,-2);c.lineTo(86,-9);c.lineTo(14,-9);c.closePath();c.fill();
    c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.moveTo(14,-3);c.lineTo(86,-3);c.lineTo(81,-7.5);c.lineTo(19,-7.5);c.closePath();c.fill();
    c.strokeStyle='#adb5bd';c.lineWidth=.8;c.beginPath();c.moveTo(8,8);c.lineTo(16,-5);c.stroke();
    c.fillStyle=col;K.rr(c,-2,-2,8,82,3);c.fill();K.rr(c,94,-2,8,82,3);c.fill();
    // отсек
    c.fillStyle='#3b3f45';K.rr(c,5,0,90,80,4);c.fill();c.fillStyle='#2c2f34';c.fillRect(5,0,90,5);
    // бампер
    c.fillStyle='#b8bec6';K.rr(c,-2,79,104,5,2.5);c.fill();
    // мотор
    c.fillStyle='rgba(0,0,0,.25)';K.rr(c,29,12,40,44,5);c.fill();
    c.fillStyle='#5b636d';K.rr(c,28,10,40,44,5);c.fill();var gv=c.createLinearGradient(31,13,65,51);gv.addColorStop(0,'#9aa3ad');gv.addColorStop(1,'#6c747e');c.fillStyle=gv;K.rr(c,31,13,34,38,4);c.fill();
    c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=.5;for(var rb=0;rb<5;rb++){c.beginPath();c.moveTo(37,16+rb*8);c.lineTo(61,16+rb*8);c.stroke();}
    c.fillStyle='rgba(255,255,255,.35)';c.font='bold 3px Rubik,sans-serif';c.fillText(T('ВАЗ','VAZ'),57,49);
    // свечи и провода
    var plugY=[18,27,36,45];plugY.forEach(function(py,i){var loose=bad==='svechi'&&i===2&&!(st.found&&!st.shown);
      c.fillStyle='#e9ecef';c.beginPath();c.arc(33,py,1.8,0,7);c.fill();
      c.strokeStyle='#c92a2a';c.lineWidth=1.6;c.beginPath();
      if(loose){var sw=calm?0:Math.sin(t*3)*1.5;c.moveTo(27+sw,py+5);c.quadraticCurveTo(27,py+10,23,52);}else{c.moveTo(33,py);c.quadraticCurveTo(26,py+6,23,52);}c.stroke();
      if(loose){c.fillStyle='rgba(255,212,59,'+(.5*br*pulse)+')';c.beginPath();c.arc(33,py,3.5,0,7);c.fill();}});
    // трамблёр
    c.fillStyle='#4a2f22';c.beginPath();c.arc(23,55,5,0,7);c.fill();c.fillStyle='#6b4636';c.beginPath();c.arc(23,55,3.6,0,7);c.fill();
    if(bad==='tramb'&&!(st.found&&!st.shown)){c.strokeStyle='rgba(255,255,255,'+(.4+.6*br)+')';c.lineWidth=.7;c.beginPath();c.moveTo(20,52);c.lineTo(23,55);c.lineTo(22,58);c.moveTo(23,55);c.lineTo(26,54);c.stroke();}
    // крышка масла
    var noCap=bad==='masl'&&!(st.found&&!st.shown);
    c.fillStyle=noCap?'#111':'#f2c94c';c.beginPath();c.arc(61,19,3,0,7);c.fill();
    if(noCap){c.fillStyle='rgba(60,40,10,'+(.35+.5*br)+')';for(var k=0;k<7;k++){c.beginPath();c.arc(58+((k*37)%9),14+((k*23)%12),.7+.4*(k%3),0,7);c.fill();}}
    // карбюратор с воздушным фильтром
    c.fillStyle='#9aa3ad';c.beginPath();c.arc(49,33,11,0,7);c.fill();c.fillStyle='#c4cad1';c.beginPath();c.arc(49,33,8.5,0,7);c.fill();
    c.fillStyle='#8a929b';c.beginPath();c.arc(49,33,2,0,7);c.fill();
    if(bad==='karb'&&!(st.found&&!st.shown)){c.fillStyle='rgba(120,90,30,'+(.3+.45*br)+')';c.beginPath();c.ellipse(55,44,5,2.4,0,0,7);c.fill();
      drops(c,55,42,t,br,'rgba(250,210,90,');}
    // шкивы и ремень
    var worn=bad==='remen'&&!(st.found&&!st.shown);
    c.fillStyle='#5b636d';c.beginPath();c.arc(40,61,4.5,0,7);c.fill();c.beginPath();c.arc(50,58,3.2,0,7);c.fill();
    c.strokeStyle='#1d1f22';c.lineWidth=1.8;c.beginPath();c.moveTo(40,56.5);c.lineTo(63,52.5);c.moveTo(40,65.5);
    if(worn)c.quadraticCurveTo(52,69+2*br,63,61.5);else c.lineTo(63,61.5);c.stroke();
    if(worn){c.strokeStyle='rgba(255,255,255,'+(.35+.5*br)+')';c.lineWidth=.5;for(var j=0;j<4;j++){var xx=45+j*4;c.beginPath();c.moveTo(xx,66+j*.3);c.lineTo(xx+.8,67.4+j*.3);c.stroke();}}
    // генератор
    c.fillStyle='#8f969e';c.beginPath();c.arc(63,57,5.5,0,7);c.fill();var ga=(bad==='gen'&&st.found&&!st.shown||bad==='remen'&&st.found&&!st.shown)&&!calm?t*6:0;c.fillStyle='#5b636d';for(var a=0;a<6;a++){var aa=a*1.047+ga;c.beginPath();c.moveTo(63,57);c.arc(63,57,4.6,aa,aa+.6);c.closePath();c.fill();}
    c.fillStyle='#c4cad1';c.beginPath();c.arc(63,57,1.4,0,7);c.fill();
    if(bad==='gen'&&!(st.found&&!st.shown))smoke(c,63,50,t,br);
    // радиатор
    var hot=bad==='radiator'&&!(st.found&&!st.shown);
    c.fillStyle='#8c6239';K.rr(c,21,67,58,10,2);c.fill();c.strokeStyle='#5e3f22';c.lineWidth=.6;for(var x=23;x<78;x+=2){c.beginPath();c.moveTo(x,68);c.lineTo(x,76);c.stroke();}
    if(hot){smoke(c,36,64,t,br);smoke(c,58,63,t+1.3,br);}
    // патрубок
    var leak=bad==='patrubok'&&!(st.found&&!st.shown);
    c.strokeStyle='#1d1f22';c.lineWidth=3.6;c.lineCap='round';c.beginPath();c.moveTo(64,40);c.quadraticCurveTo(74,42,74,66);c.stroke();c.lineCap='butt';
    if(leak){c.strokeStyle='rgba(255,255,255,'+(.3+.5*br)+')';c.lineWidth=.6;c.beginPath();c.moveTo(72.4,50);c.lineTo(73.6,52.5);c.stroke();drops(c,74,52,t,br,'rgba(80,220,120,');}
    // бачок тормозов
    var low=bad==='tormoz'&&!(st.found&&!st.shown);
    c.fillStyle='rgba(240,240,230,.9)';K.rr(c,9,7,10,13,2);c.fill();c.fillStyle='#e7c46b';K.rr(c,9,low?17:10.5,10,low?3:9.5,1.5);c.fill();
    c.fillStyle='#2b2b2b';c.fillRect(8.5,6,11,2.4);c.strokeStyle='#6c6c6c';c.lineWidth=.5;c.beginPath();c.moveTo(19,12);c.lineTo(21,12);c.moveTo(19,16);c.lineTo(21,16);c.stroke();
    if(low&&br>.5){c.fillStyle='rgba(224,49,49,'+pulse+')';c.font='bold 2.6px sans-serif';c.fillText('MIN',20.6,17);}
    // аккумулятор
    var ox=bad==='akb'&&!(st.found&&!st.shown);
    c.fillStyle='#2a2d31';K.rr(c,70,8,22,17,2);c.fill();c.fillStyle='#3a3f45';c.fillRect(71,10,20,4);
    c.fillStyle='#d9480f';c.beginPath();c.arc(75,9,2,0,7);c.fill();c.fillStyle='#1f6fb8';c.beginPath();c.arc(87,9,2,0,7);c.fill();
    c.fillStyle='#e9ecef';c.font='bold 4px sans-serif';c.fillText('+',73.6,20);c.fillText('−',85.6,20);
    if(ox){c.fillStyle='rgba(225,245,225,'+(.45+.55*br)+')';for(var m=0;m<6;m++){c.beginPath();c.arc(74+(m%3)*1.4,7.6+Math.floor(m/3)*1.6,.9+br*.6,0,7);c.fill();}}
    // бачок омывателя
    var dry=bad==='omyv'&&!(st.found&&!st.shown);
    c.fillStyle='rgba(230,240,250,.85)';K.rr(c,83,32,11,20,2);c.fill();if(!dry){c.fillStyle='rgba(51,154,240,.7)';K.rr(c,83,38,11,14,2);c.fill();}
    else{c.fillStyle='rgba(51,154,240,'+(.25*(1-br))+')';K.rr(c,83,49,11,3,1);c.fill();}
    c.fillStyle='#1f6fb8';c.fillRect(86,30,5,2.4);
    // фары
    var dark=bad==='fara'&&!(st.found&&!st.shown);
    [[4,69],[81,69]].forEach(function(p,i){c.fillStyle=shade(col,-.1);K.rr(c,p[0]-2,p[1]-2,19,12,3);c.fill();
      var off=dark&&i===0;c.fillStyle=off?'#4a4f55':'#fff6c8';c.beginPath();c.ellipse(p[0]+7.5,p[1]+4,6.5,4.2,0,0,7);c.fill();
      if(!off){c.fillStyle='rgba(255,246,200,.35)';c.beginPath();c.ellipse(p[0]+7.5,p[1]+4,9,6,0,0,7);c.fill();}
      else if(br>.5){c.strokeStyle='rgba(255,255,255,'+(.5*pulse)+')';c.lineWidth=.6;c.beginPath();c.moveTo(p[0]+5,p[1]+2);c.lineTo(p[0]+9,p[1]+6);c.moveTo(p[0]+9,p[1]+2);c.lineTo(p[0]+5,p[1]+6);c.stroke();}});
    // отметки «проверено» и выбор
    for(var id in st.ok){var q=P[id];c.fillStyle='rgba(43,138,62,.92)';c.beginPath();c.arc(q.x,q.y,3,0,7);c.fill();c.strokeStyle='#fff';c.lineWidth=.9;c.beginPath();c.moveTo(q.x-1.4,q.y);c.lineTo(q.x-.3,q.y+1.2);c.lineTo(q.x+1.6,q.y-1.2);c.stroke();}
    var lab=st.found?bad:(st.sel||st.hov);
    if(st.found){ring(c,P[bad],st.shown?'#e03131':'#2b8a3e',t);if(!st.shown)sparks(c,P[bad],st.fx);}
    else if(st.sel)ring(c,P[st.sel],'#ff7a45',t);
    if(st.miss>=2&&!st.found&&!calm){c.strokeStyle='rgba(255,212,59,'+(.25+.25*Math.sin(t*4))+')';c.lineWidth=1;c.setLineDash([2,2]);c.beginPath();c.arc(P[bad].x,P[bad].y,13,0,7);c.stroke();c.setLineDash([]);}
    if(lab)tag(c,P[lab],pn(lab));}
  function ring(c,q,col,t){c.strokeStyle=col;c.lineWidth=1.4;c.beginPath();c.arc(q.x,q.y,7.5+(calm?0:Math.sin(t*6)*.6),0,7);c.stroke();}
  function tag(c,q,nm){c.font='600 4.2px Rubik,sans-serif';var w=c.measureText(nm).width+5,x=Math.max(4,Math.min(96-w,q.x-w/2)),y=q.y<20?q.y+8.5:q.y-14;
    c.fillStyle='rgba(255,253,247,.96)';K.rr(c,x,y,w,6.4,2);c.fill();c.fillStyle='#2d3436';c.textBaseline='middle';c.fillText(nm,x+2.5,y+3.3);c.textBaseline='alphabetic';}
  function drops(c,x,y,t,br,rgb){var n=calm?1:3;for(var i=0;i<n;i++){var ph=((t*.8+i/n)%1);c.fillStyle=rgb+(br*(1-ph))+')';c.beginPath();c.arc(x,y+ph*9,.9+br*.5,0,7);c.fill();}}
  function smoke(c,x,y,t,br){var n=calm?2:4;for(var i=0;i<n;i++){var ph=((t*.5+i/n)%1);c.fillStyle='rgba(235,240,245,'+(.55*br*(1-ph))+')';c.beginPath();c.arc(x+Math.sin(ph*6+i)*2,y-ph*12,2+ph*4,0,7);c.fill();}}
  function sparks(c,q,ft){if(ft>1.2||calm)return;for(var i=0;i<8;i++){var a=i*.785,r=5+ft*14;c.fillStyle='rgba(255,212,59,'+(1-ft/1.2)+')';c.beginPath();c.arc(q.x+Math.cos(a)*r,q.y+Math.sin(a)*r,1,0,7);c.fill();}}
  function shade(hex,k){var n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,f2=function(v){return Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));};return 'rgb('+f2(r)+','+f2(g)+','+f2(b)+')';}
  layout();f.say(SAY.start,'happy');bFix.disabled=bHint.disabled=true;K.loop(host,draw);
  K.intro(host,{who:'tolik',text:T('Соседи пригнали машины — у всех что-то барахлит. Слушай жалобу, смотри под капот и находи поломку. Пять машин!','The neighbours brought their cars — they’ve all got trouble. Listen to the complaint, look under the bonnet and find the fault. Five cars!'),
    hint:K.pc(host)?T('Стрелки или мышь — выбрать деталь · Enter/Пробел — чинить · H — подсказка','Arrows or mouse — pick a part · Enter/Space — fix · H — hint'):T('Тапни деталь, потом «🔧 Чинить»','Tap a part, then “🔧 Fix”'),btn:T('Открыть капот','Open the bonnet')},startCar);
  st.api={choose:choose,fix:fix,hint:hint,next:next,P:P,toPx:function(id){var r=C.cv.getBoundingClientRect(),q=P[id];return {x:r.left+view.x+q.x*view.s,y:r.top+view.y+q.y*view.s};}};}
/* бот: k — умение 0..1; угадывает с вероятностью по подсказке (0,1 / 0,3 / 0,55) + 0,6·k */
function sim(o,k){var R=o.rnd||Math.random,s=0;k=k==null?.6:k;for(var i=0;i<N;i++){var m=0;while(m<3&&R()>Math.min(.95,[.1,.3,.55][m]+.6*k))m++;s+=pts(m);}return {score:s,tier:K.tier(s,CUT)};}
VYMG_REG({id:ID,n:K.L('Найди поломку','Find the Fault'),a:K.L('«Стучит!» — найди, что сломалось под капотом','“It’s knocking!” — find what broke under the bonnet'),run:run,sim:sim});
})();
