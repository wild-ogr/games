/* ================= FESTGB — праздники «Гастронома №1» (поток FEST буста «Образцовый», 10.10.2026) =================
   Грузится defer ПОСЛЕ основного скрипта и js/fest.js (строки под меткой <!-- gb:FEST -->). Общий модуль праздников —
   js/fest.js (копия ~/Projects/hobby-analytics/fest/fest.js через fest-sync.sh; сам общий файл НЕ правим) — здесь только Гастроном:
   1) «Ночная смена: ночь на переучёте» (FEST hw26/hw27, 26.10–02.11; на Яндексе — «Осенний завоз» без страшилок): 10 смен,
      открываются по одной в день (в первый день — 3); в зале темно, фонарик высвечивает 3 полки (js/gb-night.js — грузится лениво),
      тыквы, свечи, фонарики — товарами; «призрак завмага» (только VK/ОК). 3 смены → карточка «Дефицита», 7 → вторая карточка.
   2) День бабушек 28.10 (bab26/bab27): заказ от бабы Зины — один праздничный уровень, открытка и карточка.
   3) Осень → зима: листья до 14.11 и снег с 15.11 (FEST osen/zima — частицы на главном, на уровне — лёгкое неподвижное оформление).
   4) «Новогодний стол заказов» (ny27/ny28, 15.12–14.01): 15 заказов, «оливье» (горошек + майонез + докторская → бонус), гирлянда.
   5) Остальные праздники Гастронома из общей таблицы (День матери, 8 Марта, День торговли…) — подарок за вход, один раз.
   Праздничные товары — id 121–130 (биты ячейки 0–7; диапазон FEST 121–150 по COMMON). Уровни 1–1500 НЕ трогаем: праздничный уровень =
   genLevel(база, СВОЁ зерно) + перекраска типов (решаемость та же) — без правок LOGIC и GOOD_ORDER.
   Сохранение: S.fest — общий модуль; S.fs — своё {y:{hw26:{1:3}}, c:{hw1:1}, seen:{hw26:1}, ol:{ny27:{3:1}}} — слияние объединением (GB.onSave).
   Выключатели: GB.flag('fest') — всё, GB.flag('night') — «Ночная смена», GB.flag('ny') — «Новогодний стол заказов».
   Проверка без ожидания даты (только мак/LAN): ?date=2026-10-30 — «сегодня» для всей игры; ?fest=hw26 — только FEST.
   Для других потоков: FESTGB.now() — «сейчас» игры в мс (с подменой ?date=, для LEAGUE); FESTGB.event() — идущий большой праздник
   {k,id,name,from,to,day,left} или null; FESTGB.skin() — 'hw'|'ny'|'mar'|''
   (шкурки мини-игр, кот Пломбир в костюме); FESTGB.look() — оформление зала {night,leaves,snow,garland,tree,pumpkin};
   FESTGB.cards — сезонные карточки «Дефицита» (META: альбом), FESTGB.has(id), FESTGB.drawCard(canvas,id); GB.emit('festcard',{id}). */
(function(){
'use strict';
if(typeof FEST==='undefined'||typeof S==='undefined'||typeof startLevel!=='function'||typeof genLevel!=='function')return;
if(window.GB&&!GB.flag('fest'))return;
const D=document,$$=id=>D.getElementById(id);
const LOCAL=location.protocol==='file:'||/^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(location.hostname);
const RU=()=>typeof LANG==='undefined'||LANG!=='en';
const T=(ru,en)=>RU()?ru:en;
const YA=()=>typeof PLAT!=='undefined'&&PLAT==='yandex';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
const isO=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const flag=n=>!window.GB||GB.flag(n);

/* ---- 0. ?date=ГГГГ-ММ-ДД — «сегодня» для всей игры (только мак/LAN): часы игры и FEST вместе ---- */
(function(){const m=/[?&]date=(\d{4})-(\d\d)-(\d\d)/.exec(location.search);if(!m||!LOCAL)return;
  const sh=Date.UTC(+m[1],+m[2]-1,+m[3],9,0,0)-Date.now(); // полдень по Москве этого дня
  const o=nowMs;nowMs=function(){return o()+sh;};window.DATE_SHIFT=sh;})();

/* ---- 1. числа (ECO может переопределить: GBECO.fest = {lvl, st, card, main, bab, gift, giftBig, ol}) ---- */
const ECO_DEF={lvl:15,st:5,card:50,main:100,bab:60,gift:30,giftBig:50,ol:10};
const eco=k=>{try{const f=window.GBECO&&GBECO.fest;if(f&&typeof f[k]==='number')return f[k];}catch(e){}return ECO_DEF[k];};

/* ---- 2. праздничные товары 121–130: имя, «кого просят», рисунок кодом (как GOOD_DRAW) ---- */
const FG={
  121:{n:'Тыква',a:'тыкву',en:'Pumpkin',ea:'a pumpkin'},
  122:{n:'Свечи',a:'свечи',en:'Candles',ea:'some candles'},
  123:{n:'Фонарик',a:'фонарик',en:'Torch',ea:'a torch'},
  124:{n:'Мандарины',a:'мандаринов',en:'Tangerines',ea:'some tangerines'},
  125:{n:'Майонез',a:'майонез',en:'Mayonnaise',ea:'a jar of mayonnaise'},
  126:{n:'Мука',a:'муки',en:'Flour',ea:'a bag of flour'},
  127:{n:'Варенье',a:'варенья',en:'Jam',ea:'a jar of jam'},
  128:{n:'Торт',a:'торт',en:'Cake',ea:'a cake'},
  129:{n:'Ёлочные игрушки',a:'ёлочных игрушек',en:'Tree baubles',ea:'some tree baubles'},
  130:{n:'Игрушка «Космонавт»',a:'игрушку «Космонавт»',en:'Cosmonaut bauble',ea:'a cosmonaut bauble'}};
const FDRAW={
  121(g,cx,by,u){shadowE(g,cx,by,40*u,u);const h=52*u,cy=by-h/2-1*u;
    [[-20,20,'#c9561a'],[20,20,'#c9561a'],[-9,21,'#e8781f'],[9,21,'#e8781f'],[0,17,'#f39a35']].forEach(([dx,rx,c])=>ell(g,cx+dx*u,cy,rx*u,h/2,lin(g,0,cy-h/2,0,cy+h/2,[shade(c,.18),c,shade(c,-.22)])));
    g.strokeStyle='rgba(120,50,10,.35)';g.lineWidth=1.6*u;for(const dx of [-12,12]){g.beginPath();g.ellipse(cx+dx*u,cy,6*u,h*.46,0,0,Math.PI*2);g.stroke();}
    ell(g,cx-6*u,cy-h*.28,7*u,4*u,'rgba(255,230,170,.35)');
    rrect(g,cx-3.5*u,by-h-9*u,7*u,13*u,2.5*u);g.fillStyle='#6b4a1f';g.fill();
    g.fillStyle='#4f9a3a';g.beginPath();g.ellipse(cx+10*u,by-h-3*u,10*u,4.5*u,-.4,0,Math.PI*2);g.fill();},
  122(g,cx,by,u){shadowE(g,cx,by,30*u,u);
    for(const [dx,h] of [[-15,70],[0,78],[15,66]]){const x=cx+dx*u-6*u,top=by-h*u;rrect(g,x,top,12*u,h*u,3*u);g.fillStyle=lin(g,x,0,x+12*u,0,['#e9e3d2','#fffdf6','#d8d0bc']);g.fill();
      g.strokeStyle='rgba(120,110,90,.35)';g.lineWidth=1*u;g.stroke();g.strokeStyle='#2b2520';g.lineWidth=1.8*u;g.beginPath();g.moveTo(x+6*u,top);g.lineTo(x+6.5*u,top-6*u);g.stroke();}
    rrect(g,cx-24*u,by-34*u,48*u,14*u,2*u);g.fillStyle=lin(g,0,by-34*u,0,by-20*u,['#5b8fd6','#2f62a8']);g.fill();
    g.fillStyle='#fff';g.font='800 '+(9*u)+'px '+FNT;g.textAlign='center';g.textBaseline='middle';g.fillText(T('СВЕЧИ','CANDLES'),cx,by-27*u);},
  123(g,cx,by,u){shadowE(g,cx,by,26*u,u);
    rrect(g,cx-14*u,by-60*u,28*u,60*u,7*u);g.fillStyle=lin(g,cx-14*u,0,cx+14*u,0,['#1f5c3c','#3d9466','#174a30']);g.fill();
    poly(g,[cx-14*u,by-60*u,cx+14*u,by-60*u,cx+20*u,by-80*u,cx-20*u,by-80*u],'#c8ced2');
    g.fillStyle=lin(g,cx-20*u,0,cx+20*u,0,['rgba(0,0,0,.25)','rgba(255,255,255,.45)','rgba(0,0,0,.2)']);g.fillRect(cx-20*u,by-80*u,40*u,20*u);
    ell(g,cx,by-82*u,20*u,6*u,'#f7e27a');ell(g,cx-5*u,by-83*u,6*u,2*u,'rgba(255,255,255,.8)');
    rrect(g,cx-6*u,by-44*u,12*u,9*u,3*u);g.fillStyle='#d23b2e';g.fill();
    g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=2*u;g.beginPath();g.moveTo(cx-8*u,by-55*u);g.lineTo(cx-8*u,by-8*u);g.stroke();},
  124(g,cx,by,u){shadowE(g,cx,by,36*u,u);const P=[[-15,-13],[0,-14],[15,-13],[-8,-34],[8,-34],[0,-53]];
    const bag=()=>{g.beginPath();g.moveTo(cx-6*u,by-70*u);g.bezierCurveTo(cx-34*u,by-50*u,cx-34*u,by,cx,by);g.bezierCurveTo(cx+34*u,by,cx+34*u,by-50*u,cx+6*u,by-70*u);g.closePath();};
    for(const [dx,dy] of P){const x=cx+dx*u,y=by+dy*u;ell(g,x,y,12.5*u,11.5*u,lin(g,0,y-12*u,0,y+12*u,['#ffb347','#f07c12','#c75a06']));ell(g,x-4*u,y-5*u,3.5*u,2.5*u,'rgba(255,240,200,.7)');}
    g.save();bag();g.clip();g.strokeStyle='rgba(205,35,35,.8)';g.lineWidth=1.3*u;
    for(let k=-6;k<=6;k++){g.beginPath();g.moveTo(cx+k*8*u-30*u,by);g.lineTo(cx+k*8*u+30*u,by-72*u);g.stroke();g.beginPath();g.moveTo(cx+k*8*u+30*u,by);g.lineTo(cx+k*8*u-30*u,by-72*u);g.stroke();}
    g.restore();bag();g.strokeStyle='rgba(170,25,25,.85)';g.lineWidth=1.6*u;g.stroke();
    rrect(g,cx-6*u,by-76*u,12*u,8*u,2*u);g.fillStyle='#c0392b';g.fill();
    g.fillStyle='#3c8a2e';g.beginPath();g.ellipse(cx+12*u,by-66*u,8*u,3.5*u,-.5,0,Math.PI*2);g.fill();},
  125(g,cx,by,u){shadowE(g,cx,by,28*u,u);bottle(g,cx,by,48*u,58*u,40*u,6*u,4*u,'#fbf6e4',50*u);
    rrect(g,cx-22*u,by-66*u,44*u,11*u,3*u);g.fillStyle=lin(g,cx-22*u,0,cx+22*u,0,['#8f989e','#e7ecef','#8a9399']);g.fill();
    g.fillStyle='#f2c230';g.fillRect(cx-24*u,by-38*u,48*u,20*u);g.fillStyle='#2f8a3a';g.fillRect(cx-24*u,by-38*u,48*u,4*u);g.fillRect(cx-24*u,by-22*u,48*u,4*u);
    g.fillStyle='#7a3b0c';g.font='800 '+(7.5*u)+'px '+FNT;g.textAlign='center';g.textBaseline='middle';g.fillText(T('ПРОВАНСАЛЬ','PROVENCAL'),cx,by-28*u);},
  126(g,cx,by,u){shadowE(g,cx,by,34*u,u);box3(g,cx,by,52*u,70*u,16*u,'#f3ead6',(x,y,w,h)=>{g.fillStyle='#2f62a8';g.fillRect(x,y+h*.3,w,h*.3);
      g.fillStyle='#fff';g.font='800 '+(10*u)+'px '+FNT;g.textAlign='center';g.textBaseline='middle';g.fillText(T('МУКА','FLOUR'),x+w/2,y+h*.45);
      g.strokeStyle='#d9a441';g.lineWidth=2*u;g.beginPath();g.moveTo(x+w/2,y+h*.92);g.lineTo(x+w/2,y+h*.66);g.stroke();
      for(let k=0;k<3;k++){ell(g,x+w/2-4*u,y+h*(.86-k*.07),3.5*u,2*u,'#e0b452');ell(g,x+w/2+4*u,y+h*(.86-k*.07),3.5*u,2*u,'#e0b452');}},'#ffffff');},
  127(g,cx,by,u){shadowE(g,cx,by,28*u,u);bottle(g,cx,by,46*u,60*u,38*u,6*u,4*u,'#8e1b2c',52*u);
    ell(g,cx-8*u,by-30*u,4*u,4*u,'rgba(255,120,140,.5)');ell(g,cx+7*u,by-20*u,3*u,3*u,'rgba(255,120,140,.45)');
    g.fillStyle='#fff';poly(g,[cx-26*u,by-60*u,cx+26*u,by-60*u,cx+22*u,by-72*u,cx-22*u,by-72*u]);g.fill();
    g.fillStyle='#d8343a';for(let i=0;i<5;i++)for(let j=0;j<2;j++)if((i+j)%2===0)g.fillRect(cx-25*u+i*10*u,by-72*u+j*6*u,10*u,6*u);
    g.strokeStyle='#8a5a2b';g.lineWidth=2*u;g.beginPath();g.moveTo(cx-22*u,by-61*u);g.lineTo(cx+22*u,by-61*u);g.stroke();
    rrect(g,cx-16*u,by-42*u,32*u,14*u,3*u);g.fillStyle='#fff6e2';g.fill();g.fillStyle='#8e1b2c';g.font='800 '+(6.5*u)+'px '+FNT;g.textAlign='center';g.textBaseline='middle';g.fillText(T('ВАРЕНЬЕ','JAM'),cx,by-35*u);},
  128(g,cx,by,u){shadowE(g,cx,by,40*u,u);can(g,cx,by,76*u,34*u,'#f4c9d4',(x,y,w,h)=>{g.fillStyle='#fff3e4';g.fillRect(x,y+h*.42,w,h*.16);g.fillStyle='#9b5a33';g.fillRect(x,y+h*.78,w,h*.22);},'#fff6f0');
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2,x=cx+Math.cos(a)*24*u,y=by-34*u+Math.sin(a)*6*u;ell(g,x,y-2*u,5*u,4*u,'#ffffff');}
    ell(g,cx,by-38*u,5*u,5*u,'#c0172b');ell(g,cx-1.5*u,by-39.5*u,1.6*u,1.6*u,'rgba(255,255,255,.7)');},
  129(g,cx,by,u){shadowE(g,cx,by,40*u,u);box3(g,cx,by,74*u,30*u,22*u,'#c0392b',(x,y,w,h)=>{g.fillStyle='#f5d76e';g.fillRect(x,y+h*.4,w,h*.2);},'#7d1f17');
    const C=['#3f86ff','#ffc233','#2e9a57'];for(let k=0;k<3;k++){const x=cx+(k-1)*20*u,y=by-36*u;ell(g,x,y,10*u,10*u,lin(g,0,y-10*u,0,y+10*u,[shade(C[k],.3),C[k],shade(C[k],-.3)]));
      ell(g,x-3*u,y-4*u,2.6*u,2*u,'rgba(255,255,255,.8)');rrect(g,x-2.5*u,y-14*u,5*u,4*u,1*u);g.fillStyle='#d9d9d9';g.fill();}},
  130(g,cx,by,u){shadowE(g,cx,by,22*u,u);const y=by-40*u;
    ell(g,cx,y+12*u,15*u,22*u,lin(g,cx-15*u,0,cx+15*u,0,['#9aa6b5','#f4f7fb','#8794a5']));
    ell(g,cx,y-14*u,13*u,13*u,lin(g,cx-13*u,0,cx+13*u,0,['#c0392b','#ff6b5a','#a82a1f']));ell(g,cx,y-13*u,8*u,7*u,'#2c3e66');ell(g,cx-3*u,y-16*u,2.5*u,2*u,'rgba(255,255,255,.75)');
    g.fillStyle='#c0392b';g.font='800 '+(8*u)+'px '+FNT;g.textAlign='center';g.textBaseline='middle';g.fillText(T('СССР','USSR'),cx,y+12*u);
    g.strokeStyle='#c8a64a';g.lineWidth=1.6*u;g.beginPath();g.arc(cx,y-30*u,3.5*u,0,Math.PI*2);g.stroke();}};
(function regGoods(){for(const k in FG){const t=+k,f=FG[k];
  GOODS[t]={n:RU()?f.n:f.en,a:RU()?f.a:f.ea};GOOD_DRAW[t]=FDRAW[t];
  try{if(DATA_RU.GOODS)DATA_RU.GOODS[t]={n:f.n,a:f.a};if(EN_DATA.GOODS)EN_DATA.GOODS[t]={n:f.en,a:f.ea};}catch(e){}}})();

/* ---- 3. праздники Гастронома ---- */
// общая таблица без Гастронома в осени/Хэллоуине/28.10/04.11/снеге — включаем только в этой игре (общий fest.js не трогаем, как Выезд)
try{for(const id of ['osen26','hw26','bab26','vyh26','zima26','ves27','let27','osen27','hw27','bab27','vyh27','zima27']){const r=FEST.get(id);
  if(r&&r.games!=='*'&&(','+r.games+',').indexOf(',gastronom,')<0)r.games+=',gastronom';}}catch(e){}
// k — вид праздника; n — уровней; first — открыто в первый день, дальше +1 в день; base — номер уровня кампании (0-based), чьей сложности уровень;
// goods — праздничные товары (перекрашиваются самые частые типы раскладки); cards — [ключ карточки, сколько уровней нужно]
const EVS={
  hw:{ids:['hw26','hw27'],flag:'night',n:10,first:3,ic:'🌙',icY:'🍂',night:1,
    t:'Ночная смена: ночь на переучёте',tY:'Осенний завоз',en:'Night shift: stocktaking',enY:'Autumn delivery',
    sh:'Ночная смена',shY:'Осенний завоз',shEn:'Night shift',shEnY:'Autumn delivery',
    unit:['смена','смены','смен'],unitEn:['shift','shifts'],
    base:[7,8,11,12,13,15,16,17,20,21],goods:[121,122,123],cards:[['hw1',3],['hw2',7]],main:7,cls:'fsHw'},
  bab:{ids:['bab26','bab27'],flag:'fest',n:1,first:1,ic:'👵',t:'Заказ бабы Зины',en:'Granny Zina’s order',sh:'Заказ бабы Зины',shEn:'Granny Zina’s order',
    unit:['заказ','заказа','заказов'],unitEn:['order','orders'],base:[12],goods:[126,127,16],cards:[['bab1',1]],main:1,cls:'fsBab',coin:'bab'},
  ny:{ids:['ny27','ny28'],flag:'ny',n:15,first:3,ic:'🎄',t:'Новогодний стол заказов',en:'New Year order desk',sh:'Стол заказов',shEn:'Order desk',
    unit:['заказ','заказа','заказов'],unitEn:['order','orders'],base:[7,8,11,12,13,15,16,17,20,21,23,24,25,27,28],goods:[124,125,4,9],ol:[4,9,125],
    cards:[['ny1',5],['ny2',10]],main:10,cls:'fsNy'}};
const evT=e=>RU()?(YA()&&e.tY||e.t):(YA()&&e.enY||e.en);
const evSh=e=>RU()?(YA()&&e.shY||e.sh):(YA()&&e.shEnY||e.shEn);
const evIc=e=>YA()&&e.icY||e.ic;
// сезонные карточки «Дефицита» (2 в месяц; альбом рисует META — данные отсюда)
const CARDS=[
  {id:'hw1',ev:'hw',t:121,n:'Тыква «Богатырская»',en:'“Bogatyr” pumpkin',c:'Осенний завоз! Одной тыквы хватает на кашу всему подъезду.',ce:'The autumn delivery! One pumpkin makes porridge for the whole block.'},
  {id:'hw2',ev:'hw',t:123,n:'Фонарик «Дозор»',en:'“Patrol” torch',c:'С ним тётя Валя провела ночной переучёт и не потеряла ни одной банки.',ce:'Aunt Valya did the night stocktaking with it and didn’t lose a single tin.'},
  {id:'bab1',ev:'bab',t:127,n:'Варенье «Бабушкино»',en:'“Granny’s” jam',c:'Баба Зина варит его по рецепту, который никому не говорит. Даже тёте Вале.',ce:'Granny Zina makes it from a secret recipe. Not even Aunt Valya knows it.'},
  {id:'mam1',ev:'mam',t:128,n:'Торт «Мамин»',en:'“Mum’s” cake',c:'Такой несли домой двумя руками и не дышали, чтобы не помять розочки.',ce:'You carried it home with both hands, holding your breath so as not to squash the roses.'},
  {id:'ny1',ev:'ny',t:125,n:'Майонез «Провансаль»',en:'“Provencal” mayonnaise',c:'Без него оливье не режут. Брали две банки — вдруг гости.',ce:'No Olivier salad without it. People bought two jars — just in case guests came.'},
  {id:'ny2',ev:'ny',t:130,n:'Игрушка «Космонавт»',en:'“Cosmonaut” bauble',c:'Висела на ёлке каждый год. Тётя Валя помнит её с детства.',ce:'It hung on the tree every year. Aunt Valya remembers it from her childhood.'}];
const cardOf=id=>CARDS.filter(c=>c.id===id)[0]||null;
// подарок за вход в праздник из общей таблицы (один раз; монеты — ECO)
const GIFTS={bab:null, // День бабушек — заказ, не подарок
  vyh26:['gift','🎁','Выходной: гостинец от тёти Вали','Day off: a little gift from Aunt Valya'],vyh27:['gift','🎁','Длинные выходные: гостинец от тёти Вали','Long weekend: a little gift from Aunt Valya'],
  mam26:['gift','💐','День матери: открытка и торт «Мамин»','Mother’s Day: a card and “Mum’s” cake',['mam1']],mam27:['gift','💐','День матери: открытка и торт «Мамин»','Mother’s Day: a card and “Mum’s” cake',['mam1']],
  kan27:['giftBig','⛄','Каникулы: главный подарок года','Winter holidays: the gift of the year'],kan28:['giftBig','⛄','Каникулы: главный подарок года','Winter holidays: the gift of the year'],
  sng27:['gift','🎁','Старый Новый год: последний подарок','Old New Year: one last gift'],sng28:['gift','🎁','Старый Новый год: последний подарок','Old New Year: one last gift'],
  lub27:['gift','💌','День всех влюблённых: валентинка от тёти Вали','Valentine’s Day: a card from Aunt Valya'],
  mar27:['giftBig','🌷','8 Марта: тюльпаны и подарок всем-всем','Women’s Day: tulips and a gift for everyone'],
  mas27:['gift','🥞','Масленица: блины за счёт заведения','Pancake week: pancakes on the house'],
  sm27:['gift','😄','День смеха: тётя Валя шутит — подарок настоящий','April Fools: Aunt Valya is joking, but the gift is real'],
  kos27:['gift','🚀','День космонавтики: подарок с орбиты','Cosmonautics Day: a gift from orbit'],
  may27:['gift','🌷','Майские: подарок к шашлыкам и рассаде','May holidays: a gift for the dacha season'],
  sem27:['gift','🌼','День семьи: ромашки и подарок','Family Day: daisies and a gift'],
  trg27:['giftBig','🛒','День торговли — наш праздник! Премия передовику','Trade Workers’ Day — our holiday! A bonus for the best'],
  urj27:['gift','🍎','Сбор урожая: яблоки из сада бабы Зины','Harvest: apples from Granny Zina’s garden'],
  poz27:['gift','🎂','День пожилых людей: баба Зина — именинница','Elders’ Day: Granny Zina is celebrating']};

/* ---- 4. сохранение S.fs ---- */
function fsx(){if(!isO(S.fs))S.fs={};const f=S.fs;for(const k of ['y','c','seen','ol'])if(!isO(f[k]))f[k]={};return f;}
function rec(id){const f=fsx();if(!isO(f.y[id]))f.y[id]={};return f.y[id];}
function fsMerge(d){if(!isO(d))return;const f=fsx();
  for(const k of ['y','ol'])if(isO(d[k]))for(const id in d[k])if(isO(d[k][id])){if(!isO(f[k][id]))f[k][id]={};const r=f[k][id];
    for(const n in d[k][id]){const v=+d[k][id][n];if(v>0&&v<=3)r[n]=Math.max(+r[n]||0,v);}}
  for(const k of ['c','seen'])if(isO(d[k]))for(const x in d[k])if(d[k][x])f[k][x]=1;}
if(window.GB)GB.onSave({id:'fest',keys:['fest'],prefix:'fs',fix:function(){fsx();if(!isO(S.fest))S.fest={};},
  merge:function(s,d){try{fsMerge(d.fs);FEST.merge(d.fest);}catch(e){}}});
fsx();

/* ---- 5. какой праздник идёт ---- */
function cur(k0){for(const k in EVS){if(k0&&k!==k0)continue;const e=EVS[k];if(!flag(e.flag))continue;
  for(const id of e.ids){if(!FEST.on(id))continue;const day=Math.max(1,FEST.day(id)||1);return {k,e,id,day,open:Math.min(e.n,e.first+day-1),left:FEST.left(id)};}}return null;}
function done(id){const r=rec(id);let n=0;for(const k in r)if(r[k]>0)n++;return n;}
function nextOpen(c){for(let n=1;n<=c.open;n++)if(!rec(c.id)[n])return n;return 0;}
const unitW=(e,n)=>RU()?plural(n,e.unit[0],e.unit[1],e.unit[2]):(n===1?e.unitEn[0]:e.unitEn[1]);
function ddmm(s){const p=String(s||'').split('-');return p.length===3?p[2]+'.'+p[1]:'';}
function dateOf(c,n){try{const r=FEST.get(c.id),d=new Date(Date.parse(r.from+'T12:00:00Z')+(n-c.e.first)*864e5);return ('0'+d.getUTCDate()).slice(-2)+'.'+('0'+(d.getUTCMonth()+1)).slice(-2);}catch(e){return '';}}
function tillTxt(c){const r=FEST.get(c.id);return r?T('до ','till ')+ddmm(r.to):'';}
const lvTitle=(c,n)=>c.k==='bab'?evSh(c.e):(c.k==='hw'?(YA()?T('Смена ','Shift '):T('Смена ','Shift ')):T('Заказ ','Order '))+n;
function gift(){if(!flag('fest'))return null;for(const id in GIFTS){const g=GIFTS[id];if(!g||!FEST.on(id)||FEST.got(id,'gift'))continue;return {id,g};}return null;}

/* ---- 6. праздничный уровень: своя раскладка (генератор кампании, СВОЁ зерно) + перекраска товаров ---- */
const LVC={};
function fsSeed(id,n){let h=2166136261;const s='gbfest:'+id+':'+n;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return 100000+h%800000;}
function remap(lv,want){const cnt={};lv.sh.forEach(L=>L.forEach(r=>r.forEach(c=>{if(!c)return;const t=tOf(c);if(t&&t<RARE0)cnt[t]=(cnt[t]||0)+1;})));
  const have=Object.keys(cnt).map(Number).sort((a,b)=>cnt[b]-cnt[a]||a-b),map={},used={};
  for(const t of have)if(want.indexOf(t)>=0)used[t]=1; // уже есть нужный товар (горошек, докторская) — остаётся сам собой
  for(const w of want){if(used[w])continue;const src=have.filter(t=>!map[t]&&want.indexOf(t)<0)[0];if(src==null)break;map[src]=w;used[w]=1;}
  lv.sh=lv.sh.map(L=>L.map(r=>r.map(c=>{if(!c)return c;const t=tOf(c);return map[t]?(c&~255)|map[t]:c;})));
  lv.types=(lv.types||have).map(t=>map[t]||t);return lv;}
function lvFor(k,id,n){const key=id+':'+n;if(LVC[key])return LVC[key];const e=EVS[k],base=e.base[Math.max(0,Math.min(e.base.length-1,n-1))];
  const lv0=genLevel(base,fsSeed(id,n),-1);const lv=Object.assign({},lv0,{sh:lv0.sh.map(L=>L.map(r=>r.slice())),boss:false,fs:k});
  remap(lv,e.goods);LVC[key]=lv;return lv;}
let pend=null;
const oStart=startLevel,oLvFor=levelFor;
function fsStart(k,n,quiet){const c=cur(k);if(!c||n<1||n>c.open){if(!quiet)toast(T('Этот уровень пока закрыт','This level isn’t open yet'));return false;}
  const lv=lvFor(k,c.id,n),e=c.e,base=e.base[Math.max(0,Math.min(e.base.length-1,n-1))],oLvl=STAT.lvl;
  pend={k,n,id:c.id};levelFor=function(){return lv;};STAT.lvl=function(){return oLvl.call(STAT,n,'fest',{e:c.id});};
  try{oStart(base,false);}finally{levelFor=oLvFor;STAT.lvl=oLvl;pend=null;}
  if(!G)return false;try{FEST.use(c.id,'lv');}catch(x){}
  G.fsOl={};D.body.classList.toggle('fsNightLv',!!e.night);D.body.classList.add('fsLv');
  if(e.night)night(); // темнота и фонарик — js/gb-night.js (сам смотрит G.fs)
  updHud();
  const g0=G;setTimeout(()=>{if(G===g0&&!g0.over)say(line(k,'start'),'valya');},1700);
  return true;}
// G.mode/G.fs — ДО хуков начала уровня (другие потоки видят mode:'fest' и не считают уровень кампанией)
if(window.GB){const oLs=GB._lvStart;GB._lvStart=function(){if(pend&&G){G.mode='fest';G.fs={k:pend.k,n:pend.n,id:pend.id};}return oLs.apply(this,arguments);};}
startLevel=function(idx,daily){
  if(!pend&&!daily&&G&&G.fs&&idx===G.idx){const f=G.fs;if(fsStart(f.k,f.n,true))return;} // «Заново» в праздничном уровне
  if(!pend){D.body.classList.remove('fsLv','fsNightLv');}
  return oStart.apply(this,arguments);};

/* ---- 7. реплики (тексты — данными; TEXT/владелец правят строки) ---- */
const TX={
  hw:{start:['Свет отключили — работаем с фонариком!','Переучёт ночью — дело серьёзное. Не шуметь!','Кто брал ключи от склада? Признавайтесь!','Посветите на полку, а то я тут ничего не вижу!'],
    startY:['Свет отключили — работаем с фонариком!','Осенний завоз! Тыквы — в первый ряд.','Посветите на полку, а то ничего не вижу!'],
    win:['Смена сдана! Недостачи нет.','Всё сошлось до последней свечки!','Переучёт закончен — можно и чайку.'],
    ghost:['Сорок лет за прилавком — ни одной недостачи!','Килька — к кильке, шпроты — к шпротам!','Кто опять трогал мои счёты?','Обвес не пройдёт! У меня всё записано.','Я тут с пятьдесят седьмого. Всё помню!','Тыквы по накладной — двенадцать. А где тринадцатая?'],
    ghostEn:['Forty years behind the counter — never a shortage!','Sprats with sprats, tins with tins!','Who touched my abacus again?','No short weight on my watch!','Pumpkins on the invoice — twelve. Where is the thirteenth?'],
    startEn:['The power is out — we work by torchlight!','Night stocktaking is serious business. Quiet!','Shine the torch on the shelf — I can’t see a thing!'],
    winEn:['Shift done! Nothing missing.','Every candle is accounted for!']},
  bab:{start:['Баба Зина заказ передала: «Только всё свежее!»','Для бабы Зины — как для родной!'],win:['Заказ собран — баба Зина будет довольна!'],
    startEn:['Granny Zina sent an order: “Everything fresh!”'],winEn:['Order ready — Granny Zina will be pleased!']},
  ny:{start:['Новогодний заказ! Горошек, майонез, докторская — и оливье готов!','Мандарины привезли — весь магазин пахнет Новым годом!','До Нового года успеем всё!','Граждане, без паники — майонеза хватит всем!'],
    win:['Заказ собран! С наступающим!','Стол заказов работает как часы!','Вот это праздничный план!'],ol:['Оливье собран! Хоть сейчас на стол!','Горошек, майонез, докторская — оливье готов!'],
    startEn:['New Year order! Peas, mayonnaise, sausage — and the salad is ready!','Tangerines have arrived — the whole shop smells of New Year!'],
    winEn:['Order complete! Happy New Year!'],olEn:['Olivier salad is ready!']}};
// разделы TEXT (GBT, вычитка владельца): night.<w> / ny.<w> / babushki.<w>; старт — сами разделы night / ny / babushki. На Яндексе для hw — только свои (без страшилок)
const GBTK={hw:'night',ny:'ny',bab:'babushki'};
function line(k,w){try{if(window.GBT&&RU()&&!(k==='hw'&&YA())){const key=GBTK[k]+(w==='start'?'':'.'+w);if(GBT.has(key)){const t=GBT.say(key);if(t)return t;}}}catch(e){}
  const x=TX[k]||{};let a=RU()?(YA()&&x[w+'Y'])||x[w]:x[w+'En'];if(!a||!a.length)a=RU()?x[w]:null;return a&&a.length?pick(a):'';}

/* ---- 8. по ходу уровня: шапка, «оливье», оформление ---- */
const oHud=updHud;updHud=function(){oHud.apply(this,arguments);try{if(G&&G.fs){const c=cur(G.fs.k),e=EVS[G.fs.k];const w=window.innerWidth||400,cnt=w<=340?G.served+'/'+G.lv.K:G.served+T(' из ',' of ')+G.lv.K;
  $$('gLevel').textContent=evIc(e)+' '+(w<=400?lvTitle({k:G.fs.k,e},G.fs.n):evSh(e)+' · '+lvTitle({k:G.fs.k,e},G.fs.n));
  $$('gCity').textContent=T('Обслужено ','Served ')+cnt+(e.ol&&G.fsOlOk?' · 🥗':'');void c;}}catch(x){}};
const oAfter=afterMove;afterMove=function(ev){try{if(G&&G.fs&&EVS[G.fs.k].ol&&!G.fsOlOk){const ol=EVS[G.fs.k].ol;for(const e of ev||[])if(e.k==='clear'&&ol.indexOf(e.t)>=0)G.fsOl[e.t]=1;
  if(ol.every(t=>G.fsOl[t])){G.fsOlOk=1;const g0=G;setTimeout(()=>{if(G!==g0)return;say(line('ny','ol'),'valya');toast('🥗 '+T('Оливье собран! +','Olivier salad done! +')+eco('ol')+' 💰 '+T('в конце','at the end'),2600);},900);}}}catch(x){}
  return oAfter.apply(this,arguments);};
// лёгкое неподвижное оформление уровня: листья осенью, снег зимой, гирлянда в Новый год (поверх зала, по верхнему краю)
const oRender=render;render=function(){oRender.apply(this,arguments);try{if(G&&HALL)decoLevel();}catch(x){}};
function decoLevel(){const d=FEST.deco()||'',R=HALL,g=ctx;if(!/fest-(leaves|snow|garland)/.test(d)&&!(G.fs&&G.fs.k==='ny'))return;
  g.save();g.setTransform(dpr,0,0,dpr,0,0);const w=R.w,x0=R.x,y0=R.y,s=Math.max(10,Math.min(18,w*.03));
  if(/fest-snow/.test(d)||(G.fs&&G.fs.k==='ny')){g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.moveTo(x0,y0);for(let x=0;x<=w+s;x+=s*1.3)g.quadraticCurveTo(x0+x+s*.65,y0+s*.95,x0+x+s*1.3,y0+s*.25);g.lineTo(x0+w,y0);g.closePath();g.fill();}
  else if(/fest-leaves/.test(d)){const cols=['#d9772b','#c0392b','#e5a33a','#a0522d'],R2=rng(77);for(let i=0;i<Math.max(5,Math.round(w/70));i++){const x=x0+R2()*w,y=y0+3+R2()*s*.8;
    g.save();g.translate(x,y);g.rotate(R2()*6);g.fillStyle=cols[i%4];g.globalAlpha=.85;g.beginPath();g.ellipse(0,0,s*.42,s*.2,0,0,Math.PI*2);g.fill();g.restore();}}
  if(/fest-garland/.test(d)||(G.fs&&G.fs.k==='ny')){if(typeof hasDecor==='function'&&hasDecor('ny')){g.restore();return;} // своя гирлянда игрока уже висит — не дублируем
    const n=Math.max(5,Math.round(w/48)),C=['#ff5a6e','#ffc233','#3f86ff','#4cd97b'];g.strokeStyle='rgba(60,60,60,.55)';g.lineWidth=1.2;g.beginPath();
    for(let i=0;i<=n;i++){const x=x0+i*w/n;if(i===0)g.moveTo(x,y0+4);else g.quadraticCurveTo(x-w/n/2,y0+4+s*.9,x,y0+4);}g.stroke();
    for(let i=0;i<n;i++){const x=x0+(i+.5)*w/n,y=y0+4+s*.48;ell(g,x,y,s*.22,s*.28,C[i%4]);ell(g,x-s*.06,y-s*.08,s*.06,s*.06,'rgba(255,255,255,.8)');}}
  g.restore();}
let NIGHT=null;function night(){if(NIGHT)return NIGHT;if(!window.GB)return null;NIGHT=GB.load('js/gb-night.js').then(()=>{try{if(G&&HALL)render();}catch(e){}}).catch(()=>{NIGHT=null;});return NIGHT;}

/* ---- 9. победа в праздничном уровне — своя «Касса» ---- */
const oWin=win;win=function(){if(!(G&&G.fs))return oWin.apply(this,arguments);try{fsWin();}catch(e){try{console.error('[fest]',e);}catch(_){}G.fs=null;G.won=false;oWin.apply(this,arguments);}};
function fsWin(){const g=G,f=g.fs,e=EVS[f.k],c=cur(f.k)||{k:f.k,e,id:f.id,open:0,day:0};if(g.won)return;g.won=true;if(modalOn)hideModal();g.over=true;YG.stop();SND.win();
  const st=Math.max(1,3-g.angry),r=rec(f.id),first=!r[f.n];r[f.n]=Math.max(r[f.n]||0,st);
  try{qEnd(true,st);}catch(x){}STAT.end('win',Object.assign({st},typeof stEnd==='function'?stEnd():{}));
  if(window.GB)GB._lvEnd('win',{st,first,mode:'fest',fs:f.id+':'+f.n});
  let reward=first?(e.coin?eco(e.coin):eco('lvl')+eco('st')*st):0,olB=0;
  if(g.fsOlOk){const o=fsx().ol;if(!isO(o[f.id]))o[f.id]={};if(!o[f.id][f.n]){o[f.id][f.n]=1;olB=eco('ol');}}
  const d=done(f.id),F=fsx(),newC=[];
  for(const [cid,need] of e.cards)if(d>=need&&!F.c[cid]){F.c[cid]=1;newC.push(cid);reward+=eco('card');try{FEST.give(f.id,cid);}catch(x){}try{if(window.GB)GB.emit('festcard',{id:cid});}catch(x){}}
  let mainNew=false;if(d>=e.main&&!FEST.got(f.id,'main')){try{mainNew=FEST.give(f.id,'main');}catch(x){}if(mainNew&&e.main>1)reward+=eco('main');}
  const tot=reward+olB;if(tot>0){S.coins+=tot;try{ern('fest',tot);}catch(x){}}
  try{FEST.use(f.id,'win');}catch(x){}save();updCoins();if(tot)setTimeout(()=>SND.coin(),500);
  const nx=c.open?nextOpen(c):0,vl=line(f.k,'win');
  const cardH=newC.map(id=>{const cd=cardOf(id);return `<div class="newcard fsCard"><p>${T('⭐ Сезонная карточка «Дефицита»:','⭐ Seasonal rare-goods card:')} <b>${esc(RU()?cd.n:cd.en)}</b></p><canvas id="fsC_${id}"></canvas></div>`;}).join('');
  const nextB=nx?`<button class="btn green big" id="fsNext">${esc(lvTitle(c,nx))} →</button>`:'';
  modal(`<div class="fsW ${e.cls}"><h2>${f.k==='hw'?T('Смена сдана! ','Shift done! ')+evIc(e):f.k==='bab'?T('Заказ собран! 👵','Order ready! 👵'):T('Заказ собран! 🎄','Order ready! 🎄')}</h2><div class="big-stars">${starsHtml(st)}</div>
    ${vl?valyaHtml(QQ(vl)):''}
    ${f.k==='bab'&&first?babCard():''}
    ${tot?`<p class="coins-won" id="mWon">+${tot} 💰</p>`:`<p class="fsGoal">${T('Уже пройдено — награда была в первый раз.','Already done — the reward was given the first time.')}</p>`}
    ${olB?`<p class="fsGoal">🥗 ${T('Оливье собран: +','Olivier salad: +')+olB} 💰</p>`:''}
    ${cardH}
    ${e.n>1?`<p class="fsGoal">${goalTxt(c.id?c:{k:f.k,e,id:f.id})}</p>`:''}
    ${!nx&&c.open&&c.open<e.n?`<p class="fsGoal">${T('Следующий откроется завтра','The next one opens tomorrow')} — ${dateOf(c,c.open+1)}</p>`:''}
    <div class="row">${nextB}${e.n>1?`<button class="btn" id="fsEv">${evIc(e)} ${esc(evSh(e))}</button>`:''}<button class="btn" id="fsMap">${T('На главный','Home')}</button></div></div>`);
  if(f.k==='bab'&&first)bustDraw();
  const b1=$$('fsNext');if(b1)b1.onclick=()=>{hideModal();fsStart(f.k,nx);};
  $$('fsMap').onclick=()=>{hideModal();openMap();};const be=$$('fsEv');if(be)be.onclick=()=>{hideModal();openMap();setTimeout(()=>openEv(f.k),60);};
  if(vl)valyaDraw();newC.forEach(id=>drawCard($$('fsC_'+id),id));
  try{if(typeof coinFx==='function')coinFx(tot,$$('mWon'));}catch(x){}}
function goalTxt(c){const e=c.e,d=done(c.id),F=fsx();const nx=e.cards.filter(x=>!F.c[x[0]])[0];
  if(!nx)return T('Пройдено: ','Done: ')+d+'/'+e.n+' · '+T('все карточки собраны','all cards collected');
  const cd=cardOf(nx[0]);return `${T('Карточка','Card')}: ${esc(RU()?cd.n:cd.en)} ${bar(Math.min(d,nx[1]),nx[1])} ${Math.min(d,nx[1])}/${nx[1]}`;}
function bar(a,b){let s='<span class="fsBar">';for(let i=0;i<b;i++)s+='<i'+(i<a?' class="on"':'')+'></i>';return s+'</span>';}
// открытка от бабы Зины (облик — ART GBP.zina, если есть; иначе — без портрета)
function babCard(){return `<div class="fsPost"><span id="fsZina"></span><p>${T('«Спасибо, Валечка! Всё свежее, всё как я люблю. Приходи на пирожки!»<br><small>— баба Зина</small>','“Thank you, Valya dear! Everything fresh, just how I like it. Come over for pies!”<br><small>— Granny Zina</small>')}</p></div>`;}
function bustDraw(){const c=$$('fsZina');if(!c)return;try{if(window.GBP&&typeof GBP.bust==='function'){const h=GBP.bust('zina','happy');if(h){c.innerHTML=h;return;}}}catch(e){}c.style.display='none';}

/* ---- 10. карточки: рисунок (для альбома META и окон) ---- */
function drawCard(cv,id){if(!cv)return;const cd=cardOf(id);if(!cd)return;requestAnimationFrame(()=>{const r=cv.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1),w=r.width||120,h=r.height||90;
  cv.width=Math.round(w*d);cv.height=Math.round(h*d);const g=cv.getContext('2d');g.setTransform(d,0,0,d,0,0);
  g.fillStyle=lin(g,0,0,0,h,['#fff7e0','#f3d9a4']);rrect(g,1,1,w-2,h-2,10);g.fill();g.strokeStyle='#d9a441';g.lineWidth=2;g.stroke();
  const s=Math.min(w*.8,h*.8);drawGood(g,cd.t,w/2,h*.9,s);});}

/* ---- 11. окно праздника ---- */
function openEv(k){const c=cur(k);if(!c){toast(T('Праздник закончился — до следующего!','The holiday is over — see you next time!'));return;}
  try{STAT.screen('fest');FEST.use(c.id,'open');}catch(e){}
  const e=c.e,r=rec(c.id),nx=nextOpen(c);let tiles='';
  for(let n=1;n<=e.n;n++){const st=r[n]||0,op=n<=c.open;
    tiles+=`<button class="fsT ${st?'done':op?'open':'lock'}${n===nx?' nx':''}" data-n="${n}"${op?'':' disabled'}><b>${n}</b><small>${st?'★'.repeat(st):op?evIc(e):'🔒 '+dateOf(c,n)}</small></button>`;}
  const F=fsx(),cards=e.cards.map(([cid,need])=>{const cd=cardOf(cid),has=!!F.c[cid];return `<div class="fsCd${has?' has':''}"><canvas data-card="${cid}"></canvas><small>${has?'✓ ':'🔒 '}${esc(RU()?cd.n:cd.en)}${has?'':'<br>'+need+' '+unitW(e,need)}</small></div>`;}).join('');
  const intro=e.night?(YA()?T('Свет отключили, а завоз пришёл. Работаем с фонариком: он высвечивает три полки — водите им по витрине. Тыквы, свечи и фонарики — сегодня в ходу!','The power is out, but the delivery is here. Work by torchlight: it lights three shelves — move it along the display.'):T('Ночь на переучёте! Свет отключили, а работа не ждёт. Фонарик высвечивает три полки — водите им по витрине. Говорят, по ночам в зал заглядывает призрак завмага… но он безобидный, только всех пересчитывает.','Night stocktaking! The power is out, but work can’t wait. The torch lights three shelves — move it along the display. They say the ghost of the old manager drops by at night… but he only counts the stock.'))
    :c.k==='ny'?T('До Нового года — заказ за заказом! Соберите горошек, майонез и докторскую — тётя Валя нарежет оливье (бонус в конце уровня).','New Year orders one after another! Collect peas, mayonnaise and sausage — Aunt Valya will make an Olivier salad (bonus at the end).')
    :T('Баба Зина заказала к празднику муку, варенье и яйца — для пирогов. Соберите заказ!','Granny Zina ordered flour, jam and eggs for her pies. Get the order ready!');
  const mg=mgBtn(c);
  modal(`<div class="fsE ${e.cls}"><h2>${evIc(e)} ${esc(evT(e))}</h2><p class="fsSub">${tillTxt(c)}</p>
    ${valyaHtml(intro)}
    ${e.n>1?`<div class="fsG${e.n>10?' many':''}">${tiles}</div>`:''}
    <div class="fsCds">${cards}</div>
    <div class="row">${nx?`<button class="btn green big" id="fsGo">${esc(lvTitle(c,nx))} →</button>`:`<p class="fsGoal">${c.open<e.n?T('Новый — завтра','A new one tomorrow')+' ('+dateOf(c,c.open+1)+')':T('Всё пройдено! Спасибо за работу!','All done! Thank you for your work!')}</p>`}${mg}<button class="btn" id="fsClose">${T('Закрыть','Close')}</button></div></div>`);
  D.querySelectorAll('#mcard .fsT').forEach(b=>{if(!b.disabled)b.onclick=()=>{hideModal();fsStart(c.k,+b.dataset.n);};});
  D.querySelectorAll('#mcard canvas[data-card]').forEach(cv=>drawCard(cv,cv.dataset.card));
  const go=$$('fsGo');if(go)go.onclick=()=>{hideModal();fsStart(c.k,nx);};$$('fsClose').onclick=()=>{hideModal();};
  const m=$$('fsMg');if(m)m.onclick=()=>{hideModal();try{GMG.open(m.dataset.id,{mode:'fest',fest:mgFest()});}catch(x){}};
  valyaDraw();}
// праздничная мини-игра (шкурка — у потоков MGA/MGB/MGC; оболочка MG0 — GMG.open)
// праздничная шкурка (шкурки — потоки MGA/MGB/MGC; id 'halloween'|'ny' по договору MG0: host.fest={id,t}); на Яндексе Хэллоуина нет
const MGF={hw:['kot','vybrosili'],ny:['zakaz','piramida','vybrosili']};
function mgFest(){const hw=cur('hw'),ny=cur('ny');if(hw&&!YA())return {id:'halloween',t:evT(hw.e)};if(ny)return {id:'ny',t:evT(ny.e)};return null;}
function mgBtn(c){try{if(!window.GMG||typeof GMG.open!=='function'||!MGF[c.k]||!mgFest()||(window.GB&&!GB.flag('mg')))return '';
  const a=MGF[c.k].filter(id=>{const i=GMG.info&&GMG.info(id);return !!i&&(!GB.flag||GB.flag('mg_'+id));});if(!a.length)return '';
  const id=a[(c.day||0)%a.length],i=GMG.info(id);return `<button class="btn" id="fsMg" data-id="${esc(id)}">☕ ${esc(T('Перерыв: ','Break: ')+(i.t||id))}</button>`;}catch(e){return '';}}
function mgHook(){try{if(window.GMG&&!GMG.festFn)GMG.festFn=mgFest;}catch(e){}}
/* ---- 12. плашка на главном (гнездо GB.homeSlots zone top) и подарки ---- */
function banHtml(){if(!(S.levelsDone>=3))return ''; // новичку — сначала обучение
  let h='';for(const k in EVS){const c=cur(k);if(!c)continue;const e=c.e,nx=nextOpen(c),d=done(c.id),F=fsx(),cd=e.cards.filter(x=>!F.c[x[0]])[0];
    const sub=e.n>1?(cd?`${esc(RU()?cardOf(cd[0]).n:cardOf(cd[0]).en)}: ${Math.min(d,cd[1])}/${cd[1]}`:T('пройдено ','done ')+d+'/'+e.n):(d?T('заказ собран — спасибо!','order done — thank you!'):T('ждёт вас','waiting for you'));
    h+=`<button class="fsBan noent ${e.cls}${nx?' hot':''}" data-fs="${k}"><span class="fsI">${evIc(e)}</span><span class="fsTx"><b>${esc(evT(e))}</b>${nx&&e.n>1?' · '+esc(lvTitle(c,nx))+T(' ждёт',' awaits'):''}<small>${sub} · ${tillTxt(c)}</small></span><i>›</i></button>`;}
  const gf=gift();if(gf)h+=`<button class="fsBan noent hot fsGift" data-fs="gift"><span class="fsI">${gf.g[1]}</span><span class="fsTx"><b>${esc(T(gf.g[2],gf.g[3]))}</b><small>+${eco(gf.g[0])} 💰 — ${T('забрать','collect')}</small></span><i>›</i></button>`;
  return h;}
function banBind(el){el.querySelectorAll('[data-fs]').forEach(b=>b.onclick=()=>{try{SND.tap();}catch(e){}const k=b.dataset.fs;if(k==='gift')takeGift();else openEv(k);});}
function takeGift(){const gf=gift();if(!gf)return;if(FEST.give(gf.id,'gift')){const n=eco(gf.g[0]);S.coins+=n;try{ern('fest',n);}catch(e){}
  const F=fsx(),nc=(gf.g[4]||[]).filter(id=>!F.c[id]);nc.forEach(id=>{F.c[id]=1;try{FEST.give(gf.id,id);if(window.GB)GB.emit('festcard',{id});}catch(e){}});
  save();updCoins();try{SND.coin();}catch(e){}
  if(nc.length){const cd=cardOf(nc[0]);modal(`<div class="fsW"><h2>${gf.g[1]} ${esc(T(gf.g[2],gf.g[3]))}</h2><p class="coins-won">+${n} 💰</p><div class="newcard fsCard"><p>${T('⭐ Сезонная карточка «Дефицита»:','⭐ Seasonal rare-goods card:')} <b>${esc(RU()?cd.n:cd.en)}</b></p><canvas id="fsGc"></canvas></div><div class="row"><button class="btn green" id="fsOk">${T('Спасибо!','Thanks!')}</button></div></div>`);
    drawCard($$('fsGc'),nc[0]);$$('fsOk').onclick=()=>hideModal();}
  else toast('+'+n+' 💰 — '+T(gf.g[2],gf.g[3]),2600);}
  refresh();}
if(window.GB)GB.add(GB.homeSlots,{id:'fest',order:5,zone:'top',render:function(){return banHtml();},mount:function(el){banBind(el);}});
function refresh(){try{if(window.GB&&GB.isReady)GB.refresh();}catch(e){}}
// первый заход в праздник — окно само (один раз за праздник), если нет другого окна
function autoOpen(){if(window.__demo||!(S.levelsDone>=3))return;let c=null;for(const k in EVS){const x=cur(k);if(x&&!fsx().seen[x.id]){c=x;break;}}if(!c)return;
  setTimeout(()=>{if(modalOn||G||!$$('scr-map').classList.contains('on')||($$('ad')&&$$('ad').classList.contains('on')))return;fsx().seen[c.id]=1;save();openEv(c.k);},1300);}
const oMap=openMap;openMap=function(){D.body.classList.remove('fsLv','fsNightLv');const r=oMap.apply(this,arguments);try{autoOpen();}catch(e){}return r;};

/* ---- 12б. зал Вали на главном (договор VIEW: GB.hallLayers) — лёгкое оформление по празднику ---- */
function hallWall(g,R){const L=look(),w=R.w,y0=R.wallTop||0,s=Math.max(10,Math.min(20,w*.025));
  if(L.snow){g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.moveTo(0,y0);for(let x=0;x<=w+s;x+=s*1.3)g.quadraticCurveTo(x+s*.65,y0+s*.9,x+s*1.3,y0+s*.25);g.lineTo(w,y0);g.closePath();g.fill();}
  else if(L.leaves||L.autumn){const C=['#d9772b','#c0392b','#e5a33a','#a0522d'],R2=rng(91);for(let i=0;i<Math.max(5,Math.round(w/60));i++){const x=R2()*w,y=y0+3+R2()*s;
    g.save();g.translate(x,y);g.rotate(R2()*6);g.fillStyle=C[i%4];g.globalAlpha=.85;g.beginPath();g.ellipse(0,0,s*.45,s*.22,0,0,Math.PI*2);g.fill();g.restore();}}
  if(L.garland&&!(typeof hasDecor==='function'&&hasDecor('ny'))){const n=Math.max(6,Math.round(w/52)),C=['#ff5a6e','#ffc233','#3f86ff','#4cd97b'];g.strokeStyle='rgba(60,60,60,.55)';g.lineWidth=1.3;g.beginPath();
    for(let i=0;i<=n;i++){const x=i*w/n;if(i===0)g.moveTo(x,y0+5);else g.quadraticCurveTo(x-w/n/2,y0+5+s,x,y0+5);}g.stroke();
    for(let i=0;i<n;i++){const x=(i+.5)*w/n,y=y0+5+s*.52;ell(g,x,y,s*.24,s*.3,C[i%4]);ell(g,x-s*.07,y-s*.09,s*.07,s*.07,'rgba(255,255,255,.8)');}}}
function hallFront(g,R){const L=look(),w=R.w,h=R.h,cy=R.cy||h*.7,s=Math.max(24,Math.min(56,w*.07));
  if(L.night){const gr=g.createRadialGradient(w*.5,h*.6,Math.min(w,h)*.25,w*.5,h*.55,Math.max(w,h)*.75);gr.addColorStop(0,'rgba(16,14,44,0)');gr.addColorStop(1,'rgba(16,14,44,.5)');g.fillStyle=gr;g.fillRect(0,0,w,h);}
  if(L.pumpkin){try{drawGood(g,121,s*.8,cy+2,s);drawGood(g,121,w-s*.8,cy+2,s*.8);if(L.night)drawGood(g,122,w-s*1.7,cy+2,s*.7);}catch(e){}}
  if(L.tree){const d=R.door,x=d?Math.min(w-s,d.x+d.w+s*.9):s*1.1,by=R.ty||h*.86,th=s*2.4;
    g.fillStyle='#8a5a3a';g.fillRect(x-s*.08,by-th*.18,s*.16,th*.18);
    [[0,1],[.28,.78],[.52,.56]].forEach(([k,ww],i)=>{const yb=by-th*.15-k*th*.6;g.fillStyle=i%2?'#2e9a57':'#237f48';g.beginPath();g.moveTo(x,yb-th*.42);g.lineTo(x+s*.7*ww,yb);g.lineTo(x-s*.7*ww,yb);g.closePath();g.fill();});
    const C=['#ff5a6e','#ffc233','#3f86ff','#ff8fc0'];[[-.3,.82],[.25,.74],[0,.5],[-.18,.36],[.2,.3]].forEach(([u,v],i)=>ell(g,x+u*s,by-v*th,s*.07,s*.07,C[i%4]));
    g.fillStyle='#ffd23f';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?s*.06:s*.14;g.lineTo(x+Math.cos(a)*rr,by-th*1.02+Math.sin(a)*rr);}g.fill();}}
if(window.GB&&Array.isArray(GB.hallLayers)){GB.add(GB.hallLayers,{id:'fest-w',order:60,layer:'wall',draw:function(g,R){try{hallWall(g,R);}catch(e){}}});
  GB.add(GB.hallLayers,{id:'fest-f',order:60,layer:'front',draw:function(g,R){try{hallFront(g,R);}catch(e){}}});}

/* ---- 13. модуль FEST ---- */
try{FEST.init(S,{g:'gastronom',plat:PLAT,lang:RU()?'ru':'en',save:function(){save();},now:function(){return nowMs();},cls:'btn noent',
  modal:function(h){modal(h);return $$('mcard');},close:function(){hideModal();},low:function(){try{return calm()||D.body.classList.contains('lite');}catch(e){return false;}},
  change:function(){refresh();try{if(GB.hallRedraw)GB.hallRedraw();}catch(e){}}});}catch(e){}
// частицы (листья/снег) — только вне уровня: на уровне оформление неподвижное (decoLevel)
try{const oShow=show;show=function(id){oShow.apply(this,arguments);try{FEST.fx(id!=='scr-game');D.body.classList.toggle('fsGame',id==='scr-game');}catch(e){}};FEST.fx(!($$('scr-game')&&$$('scr-game').classList.contains('on')));}catch(e){}
mgHook();if(window.GB)GB.on('ready',mgHook);
if(cur('hw'))night(); // заранее: «Ночная смена» идёт — модуль темноты подгружаем сразу (на уровне он нужен без задержки)
if(window.GB)GB.on('ready',function(){try{if($$('scr-map').classList.contains('on'))autoOpen();}catch(e){}});

/* ---- 14. для других потоков ---- */
function event(){for(const k of ['hw','ny','bab']){const c=cur(k);if(c){const r=FEST.get(c.id);return {k,id:c.id,name:evT(c.e),from:r.from,to:r.to,day:c.day,left:c.left};}}return null;}
function skin(){const c=cur('hw')||cur('ny');if(c)return c.k==='hw'&&YA()?'autumn':c.k;if(FEST.on('mar27'))return 'mar';return '';}
function look(){const d=FEST.deco()||'',hw=cur('hw'),ny=cur('ny');return {night:!!hw&&!YA(),autumn:!!hw,leaves:/fest-leaves/.test(d),snow:/fest-snow/.test(d)||!!ny,garland:/fest-garland/.test(d)||!!ny,tree:!!ny,pumpkin:!!hw,hat:hw&&!YA()?'witch':ny?'santa':''};}
window.FESTGB={v:1,now:()=>nowMs(),event,skin,look,cur,events:EVS,cards:CARDS.map(c=>({id:c.id,ev:c.ev,t:c.t,get n(){return RU()?c.n:c.en;},get c(){return RU()?c.c:c.ce;}})),
  has:id=>!!fsx().c[id],drawCard,open:openEv,start:fsStart,done,goods:FG,lv:lvFor,tx:TX,line,eco,
  ghost:()=>!YA()}; // призрак завмага — только VK/ОК («Осенний завоз» на Яндексе — без страшилок)
})();
