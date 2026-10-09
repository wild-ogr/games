/* Праздники во дворе — обвязка «Выезда со двора» (поток FEST, буст 10.2026). Грузится сразу ПОСЛЕ основного скрипта index.html и js/fest.js.
   Модуль праздников (даты по МСК, классы body.fest-*, частицы снега/листьев, STAT fest) — общий js/fest.js (fest-sync.sh). Здесь — только Выезд:
   1) «Чёрная Волга» к «Неделе страшилок» (FEST hw26/hw27, 26.10–02.11): 7 ночных дворов, открываются по одному в день (пропущенные ждут);
      Волга — чёрная, без стрелки (куда едет — по фарам), фары-«глаза»; с 4-й ночи — ещё одна машина без стрелки; 5 ночей из 7 → «Чёрная Волга» в гараж навсегда;
      баба Шура рассказывает уютную страшилку по серии (новая серия за каждую пройденную ночь). На Яндексе праздник зовётся «Осенний вечер» (имя из FEST).
   2) Зима с 15.11 (FEST zima26 — deco snow): двор в снегу (газон, кусты, деревья, крыша пятиэтажки, снег на крышах стоящих машин), фон карты — зимний.
   3) «Ёлочный базар» 15–31.12 (первые 17 дней FEST ny27/ny28): адвент-двор на каждый день, ёлки вместо клумб и баков, гирлянда во дворе;
      12 дворов из 17 → «Буханка Деда Мороза» в гараж. 28.10 и 04.11 — подарок за вход (FEST bab26/vyh26).
   Вход: плашка над картой (или гнездо UX homeSlots, если есть), окно праздника; праздничные машины — в гараже (раздел «Праздничные машины») и в FESTVY.cars для альбома YARD.
   Сохранение: S.fest — общий модуль FEST; S.fst — своё: {y:{hw26:{1:3,…}}, car:{volga:1}, seen:{hw26:1}}. Слияние облака — обёртка mergeSave (объединение, максимум звёзд).
   Встраивание без переписывания чужого: обёртки глобальных функций startLevel/win/updHud/sideUpd/tipFor/winLine/openMap/openGarage/mergeSave/render/startExit
   (зовут исходные), свой вид двора — производный от текущего LOOK (хуки LOOK.ground/obst/veh). Модуль не загрузился → игра как раньше.
   Проверка без ожидания даты (только мак/LAN): ?date=2026-10-30 — «сегодня» для всей игры (часы игры и FEST вместе); ?fest=hw26 — только FEST. */
(function(){
'use strict';
if(typeof FEST==='undefined'||typeof startLevel!=='function'||typeof S==='undefined'||typeof LOOK==='undefined')return;
const D=document,$$=id=>D.getElementById(id);
const LOCAL=location.protocol==='file:'||/^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(location.hostname);

/* ---- 0. ?date=ГГГГ-ММ-ДД — сдвиг часов игры (только мак/LAN) ---- */
(function(){const m=/[?&]date=(\d{4})-(\d\d)-(\d\d)/.exec(location.search);if(!m||!LOCAL)return;
  const sh=Date.UTC(+m[1],+m[2]-1,+m[3],9,0,0)-Date.now(); // полдень по Москве этого дня
  const o=nowMs;nowMs=function(){return o()+sh;};window.DATE_SHIFT=sh;})();

/* ---- 1. данные ---- */
const RU=()=>typeof LANG==='undefined'||LANG!=='en';
const T=(ru,en)=>RU()?ru:en;
const CARS={
  volga:{id:'volga',name:'Чёрная Волга',en:'Black Volga',len:2,color:'#1b1e24',mdl:3,about:'Легенда двора — ездит без стрелки',aboutEn:'A yard legend — drives without an arrow',ev:'hw'},
  bukh:{id:'bukh',name:'Буханка Деда Мороза',en:'Grandpa Frost’s van',len:3,color:'#d42f36',mdl:5,about:'Везёт ёлки и подарки',aboutEn:'Carries trees and gifts',ev:'ny'}};
const EVS={
  hw:{ids:['hw26','hw27'],n:7,need:5,car:'volga',tod:'night',ic:'🌙',title:'Чёрная Волга',titleEn:'The Black Volga',unit:['ночь','ночи','ночей'],unitEn:['night','nights'],cls:'fvHw'},
  ny:{ids:['ny27','ny28'],n:17,need:12,car:'bukh',tod:'evening',ic:'🎄',title:'Ёлочный базар',titleEn:'Christmas tree market',unit:['двор','двора','дворов'],unitEn:['yard','yards'],cls:'fvNy'}};
// серии страшилки: k-я — после k-й пройденной ночи (5-я — ключи от Волги)
const TALE={
  intro:['Садись на лавочку, расскажу страшилку. Не бойся — у нас во дворе всё по-доброму.','Sit down on the bench, I’ll tell you a spooky story. Don’t worry — it’s a kind one.'],
  hw:[['Слыхал? По ночам в наш двор заезжает Чёрная Волга. Стрелки у неё нет — куда поедет, видно только по фарам: белые спереди, красные сзади.','They say a Black Volga drives into our yard at night. It has no arrow — watch its lights: white in front, red at the back.'],
    ['Валерка божится: Волга стояла у третьего подъезда, моргнула фарами — и пропала. Только кленовый листик на капоте остался.','Valerka swears the Volga stood by entrance three, blinked its lights — and vanished. Only a maple leaf was left.'],
    ['Дед Митяй говорит, Волга ищет хозяина. Кто её пять ночей со двора выпустит — тому она и достанется.','Grandpa Mitya says the Volga is looking for an owner. Whoever lets it out five nights — gets to keep it.'],
    ['Ночью под окнами кто-то посигналил — тихонько, два раза. Михалыч выглянул, а там она: чёрная, блестит, фары моргают…','Someone honked under the windows last night — twice, very softly. Mikhalych looked out — there it was, shiny and black…'],
    ['Раскрою секрет: Волга — Толика! Он её ночами обкатывает, чтобы соседей не будить. Говорит: «Раз ты её столько раз выручал — держи ключи!»','Here’s the secret: the Volga is Tolik’s! He drives it at night so as not to wake anyone. He says: “You helped it out so often — here are the keys!”'],
    ['Теперь по двору новый слух — уже про тебя: мол, ночью Чёрная Волга катает самого ловкого водителя района.','Now there’s a new rumour — about you: the Black Volga gives rides to the smartest driver around.'],
    ['Вот и вся страшилка. Жильцы вышли на лавочку посмотреть на твою Волгу. До следующей осени!','That’s the whole story. The neighbours came out to admire your Volga. See you next autumn!']],
  ny:['Ёлочный базар открылся! Каждый день — новый двор и подарок под ёлкой. Ёлки во дворе не сдвинуть — объезжай.','Толик привёз ёлку на крыше «Буханки». Говорит, Дед Мороз одолжил.',
    'Валерка развесил гирлянду. Половина лампочек мигает, половина — нет. Зато весело!','Михалыч ищет ёлку повыше — чтоб до потолка. А потолок у него — 2 метра 50.',
    'Мандарины привезли! Весь подъезд пахнет Новым годом.','Дед Митяй вырезает снежинки из газеты. Красота!','Кто-то слепил снеговика прямо на капоте Копейки. Хозяин не против.',
    'Тётя Валя из третьего режет оливье. Уже второй таз.','Дети катаются с горки на картонках. И Михалыч тоже.','На ёлке во дворе шары, сосульки и один огурец. Это Толик повесил.',
    'Я всем вяжу варежки. Тебе — красные.','Дед Мороз заглянул к Толику: «Хороший у вас водитель! Отдайте ему мою Буханку!» Держи ключи!',
    'Буханка Деда Мороза теперь твоя. Только мешок с подарками верни!','Под ёлкой нашёлся подарок без подписи. Наверное, тебе.','Снег идёт третий день. Дворник Петрович улыбается — значит, всё хорошо.',
    'Завтра последний день базара. Ёлки почти все разобрали.','С наступающим! Весь двор желает тебе ровной дороги и свободных выездов!'],
  nyEn:'Day {n} of the tree market — a new yard and a gift under the tree!'};
const BUB={hw:['Чёрная Волга опять во дворе!','Волга без стрелки — смотри на фары','Тихо… слышишь, мотор шепчет?','Ночь тёплая, страшилка добрая'],
  ny:['Ёлки не сдвинуть — объезжай!','Мандаринами пахнет!','С наступающим!','Гирлянда мигает — красота'],
  volga:['Укатила в ночь… до завтра!','Волга мигнула фарами — спасибо!','Вот она и уехала!']};
const BUB_EN={hw:['The Black Volga is back!','No arrow — watch its lights'],ny:['Trees don’t move — drive around!','Happy holidays!'],volga:['Off into the night!','The Volga blinked — thank you!']};
const bub=k=>{const a=(!RU()&&BUB_EN[k])||BUB[k];return a[Math.floor(Math.random()*a.length)];};
const FV_IDX=25; // «номер» двора для общего startLevel (не учебный, не босс); прогресс карты праздничные дворы не трогают

/* ---- 2. сохранение S.fst ---- */
const isO=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function fx(){if(!isO(S.fst))S.fst={};const f=S.fst;for(const k of ['y','car','seen','gift'])if(!isO(f[k]))f[k]={};return f;}
function rec(id){const f=fx();if(!isO(f.y[id]))f.y[id]={};return f.y[id];}
function fvMerge(d){if(!isO(d))return;const f=fx();
  if(isO(d.y))for(const id in d.y)if(isO(d.y[id])){const r=rec(id);for(const n in d.y[id]){const v=+d.y[id][n];if(v>0&&v<=3)r[n]=Math.max(r[n]||0,v);}}
  for(const k of ['car','seen','gift'])if(isO(d[k]))for(const x in d[k])if(d[k][x])f[k][x]=1;}
fx();

/* ---- 3. праздник сейчас ---- */
function cur(){for(const k in EVS){const e=EVS[k];for(const id of e.ids){if(!FEST.on(id))continue;const day=FEST.day(id);if(day<1||day>e.n+(k==='hw'?1:0))continue;
  return {k,e,id,day,open:Math.min(e.n,day),left:k==='hw'?FEST.left(id):Math.max(1,e.n-day+1)};}}return null;}
function done(id){const r=rec(id);let n=0;for(const k in r)if(r[k]>0)n++;return n;}
function nextOpen(c){for(let n=1;n<=c.open;n++)if(!rec(c.id)[n])return n;return 0;}
const winter=()=>/fest-snow/.test(FEST.deco()||'');
const evName=c=>RU()?c.e.title:c.e.titleEn;
const unitW=(c,n)=>RU()?plural(n,c.e.unit[0],c.e.unit[1],c.e.unit[2]):(n===1?c.e.unitEn[0]:c.e.unitEn[1]);
function dateOf(c,n){try{const r=FEST.get(c.id),t=Date.parse(r.from+'T12:00:00Z')+(n-1)*864e5,d=new Date(t);return ('0'+d.getUTCDate()).slice(-2)+'.'+('0'+(d.getUTCMonth()+1)).slice(-2);}catch(e){return '';}}
function dayNum(c,n){try{const r=FEST.get(c.id);return new Date(Date.parse(r.from+'T12:00:00Z')+(n-1)*864e5).getUTCDate();}catch(e){return n;}}
function tillTxt(c){const r=FEST.get(c.id);let to=r?r.to:'';if(c.k==='ny'&&r){const t=Date.parse(r.from+'T12:00:00Z')+(c.e.n-1)*864e5,d=new Date(t);to=d.toISOString().slice(0,10);}
  const p=to.split('-');return p.length===3?T('до ','till ')+p[2]+'.'+p[1]:'';}

/* ---- 4. праздничные дворы: параметры, зерно ---- */
function fvParams(k,n){const base=k==='hw'?12+2*n:5+n;const p=Object.assign({},levelParams(base));p.boss=false;p.police=false;p.easy=false;
  if(k==='hw')p.amb=n===3||n===6;else{p.amb=n%5===0;p.obst=Math.min(8,(p.obst||0)+2);}
  return p;}
function fvSeed(id,n){const y=+String(id).replace(/\D/g,'')||26;return y*1000+(id.indexOf('ny')===0?500:100)+n*37;}

/* ---- 5. вид двора: производный от текущего LOOK (зима — палитра в снегу), хуки ground/obst/veh ---- */
const WP={ // зимние замены цветов по времени суток (остальное — как в базовом виде)
  day:{sky:['#cfe4f4','#eef6fc'],lawn:['#f4f8fd','#dfeaf5'],bush:'#e6eef7',bush2:'#ffffff',roof:'#f3f7fb',walk:'#eaf0f6',asph:'#bcc7d4',asph2:'#cad4df',fl:['#ffffff','#d5e5f4','#ffffff','#c6dbef'],box:'#eef3f8'},
  morning:{lawn:['#f8f3f2','#e5e9f3'],bush:'#eeeef5',bush2:'#ffffff',roof:'#f6f2f3',walk:'#eeebea',fl:['#ffffff','#f1dfe0','#ffffff','#dfe6f3'],box:'#f3eef0'},
  evening:{lawn:['#e3e1f1','#c8cae3'],bush:'#d4d5ea',bush2:'#f0f0fa',roof:'#e8e7f4',walk:'#dcdbe9',fl:['#ffffff','#e8e2f4','#ffffff','#d4d9ee'],box:'#e4e3f1'},
  night:{lawn:['#5d6c9e','#4c5a8a'],bush:'#7180b0',bush2:'#97a4cf',roof:'#a4afd6',walk:'#8592bb',fl:['#d6def6','#aab6da','#e6ecfb','#b8c4e6'],box:'#8a96c2'}};
let BASE=null,CUR=null;
function derive(base,win){const L=Object.assign({},base);L.__fv=1;L.__fvW=win;
  if(win){L.tod={};for(const t in base.tod)L.tod[t]=Object.assign({},base.tod[t],WP[t]||{});L.name=base.name;}
  const g0=base.ground||groundSummer,o0=base.obst||drawObstacles,v0=base.veh||vehSummer;
  L.ground=function(g,R){g0(g,R);try{extraGround(g,win);}catch(e){}};
  L.obst=function(g){if(G&&G.fv&&G.fv.k==='ny'){try{drawFirs(g);return;}catch(e){}}o0(g);if(win&&G)try{snowObst(g);}catch(e){}};
  // снег и ёлка на крыше — ПОД стрелкой (стрелку рисуем сами после них, как в vehSummer)
  L.veh=function(ctx,v,s,toPx,cs,f){const tree=v.fvCar==='bukh'&&s>=v.bend,snow=win&&G&&!LOW&&v.state==='idle'&&s>=v.bend&&!v.fvCar&&!(f&&f.noArrow);
    if(!tree&&!snow)return v0(ctx,v,s,toPx,cs,f);const arrow=!(f&&f.noArrow)&&!v.noArrow;v0(ctx,v,s,toPx,cs,Object.assign({},f||{},{noArrow:true}));
    try{if(snow)snowCap(ctx,v,s,toPx,cs);if(tree)roofTree(ctx,v,s,toPx,cs);}catch(e){}if(arrow)arrowAt(ctx,v,s,toPx,cs);};
  return L;}
function applyLook(){try{if(!LOOK.__fv)BASE=LOOK;else if(!BASE)return;const w=winter()||!!(G&&G.fv&&G.fv.k==='ny');
  if(!CUR||CUR.__base!==BASE||CUR.__fvW!==w){CUR=derive(BASE,w);CUR.__base=BASE;}
  if(LOOK!==CUR){LOOK=CUR;if(G){groundV++;try{layout();}catch(e){}}}
  D.body.classList.toggle('fv-winter',w);}catch(e){}}
// рисунки
function roofBox(v,s,toPx,cs){const L=v.L,tr=v.track,he=s+L-1,Dd=DIRS[v.dir],hp=toPx(trackPt(tr,he)),tp=toPx(trackPt(tr,s)),hl=(L-1)/2+.42;
  return {cx:(hp[0]+tp[0])/2,cy:(hp[1]+tp[1])/2,fx:Dd[0],fy:Dd[1],car:L===2,hl};}
function snowCap(ctx,v,s,toPx,cs){const b=roofBox(v,s,toPx,cs),u0=b.car?-b.hl+.5:-b.hl+.16,u1=b.car?b.hl-.7:b.hl-.46;
  vbox(ctx,b.cx,b.cy+cs*.012,b.fx,b.fy,u0*cs,u1*cs,-.25*cs,.25*cs,.1*cs,'rgba(150,175,205,.55)');
  vbox(ctx,b.cx,b.cy,b.fx,b.fy,u0*cs,u1*cs,-.24*cs,.24*cs,.1*cs,'#fbfdff');}
function roofTree(ctx,v,s,toPx,cs){const b=roofBox(v,s,toPx,cs),x=b.cx-b.fx*cs*.25,y=b.cy-b.fy*cs*.25,r=cs*.26;
  ctx.save();ctx.fillStyle='#1f7a45';for(const k of [0,1,2]){ctx.beginPath();ctx.arc(x-b.fx*r*(k-1)*.7,y-b.fy*r*(k-1)*.7,r*(1-k*.18),0,7);ctx.fill();}
  ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.arc(x,y,r*.18,0,7);ctx.fill();ctx.fillStyle='#ff5a6e';ctx.beginPath();ctx.arc(x+r*.4,y-r*.2,r*.12,0,7);ctx.fill();ctx.restore();}
function extraGround(g,win){if(!G)return;const U=Math.max(30,Math.min(W>800?84:52,cs*1.05)),hy=G.anc&&G.anc.sky;
  // сугроб на крыше пятиэтажки
  if(win&&hy>4){const ry=hy-U*.12,P=LOOK.tod[G.tod]||LOOK.tod.day;g.fillStyle=G.tod==='night'?'#c4cdea':'#ffffff';
    for(let x=-U*.2;x<W+U*.4;x+=U*.42){g.beginPath();g.ellipse(x,ry+U*.02,U*.32,U*.13,0,Math.PI,0);g.fill();}
    g.fillRect(0,ry,W,U*.12);
    // сосульки
    g.fillStyle=G.tod==='night'?'rgba(200,215,245,.8)':'rgba(220,236,250,.95)';for(let x=U*.3;x<W;x+=U*.55){const h=U*(.1+((x*7)%5)/40);g.beginPath();g.moveTo(x-U*.04,ry+U*.11);g.lineTo(x+U*.04,ry+U*.11);g.lineTo(x,ry+U*.11+h);g.fill();}
    void P;}
  // осенние листья у «Чёрной Волги»
  if(G.fv&&G.fv.k==='hw'){const R=rng(G.fv.n*71+3),cols=['#d9772b','#c0392b','#e5a33a','#a0522d'];for(let i=0;i<W*H/9000;i++){const x=R()*W,y=R()*H;g.save();g.translate(x,y);g.rotate(R()*6);g.fillStyle=cols[i%4];g.globalAlpha=.55;g.beginPath();g.ellipse(0,0,3.4,1.8,0,0,7);g.fill();g.restore();}}
  // гирлянда над двором «Ёлочного базара»
  if(G.fv&&G.fv.k==='ny'&&typeof DECO!=='undefined'&&DECO.garland){const sm=cs*smK,bx=ox-sm,bw=G.p.w*cs+sm*2,y0=oy-sm-cs*.1;
    const bulbs=[];DECO.garland(g,[[bx+cs*.1,y0+cs*.05],[bx+bw*.5,y0+cs*.45],[bx+bw-cs*.1,y0+cs*.05]],Math.max(cs,30),bulbs);
    for(const [x,y,c] of bulbs){const n=parseInt(c.slice(1),16);glowAt(g,x,y,cs*.22,(n>>16)+','+(n>>8&255)+','+(n&255),.45);}}}
function snowObst(g){for(const [x,y] of G.obst){const cx=ox+(x+.5)*cs,cy=oy+(y+.5)*cs;g.fillStyle=G.tod==='night'?'rgba(215,224,248,.85)':'rgba(255,255,255,.92)';
  g.beginPath();g.ellipse(cx-cs*.05,cy-cs*.2,cs*.26,cs*.1,0,0,7);g.fill();}}
function drawFirs(g){const night=G.tod==='night'||G.tod==='evening',P=LOOK.tod[G.tod]||LOOK.tod.day;
  for(const [x,y] of G.obst){const cx=ox+(x+.5)*cs,cy=oy+(y+.5)*cs,r=cs*.44;
    g.fillStyle=P.sh;g.beginPath();g.ellipse(cx+cs*.06,cy+cs*.3,r*.8,r*.3,0,0,7);g.fill();
    g.fillStyle='#8a5a3a';g.fillRect(cx-cs*.05,cy+r*.45,cs*.1,r*.35);
    const tiers=[[.55,1],[.15,.78],[-.25,.55]];
    tiers.forEach(([dy,w],i)=>{g.fillStyle=i%2?'#2e9a57':'#237f48';g.beginPath();g.moveTo(cx,cy+r*(dy-.62));g.lineTo(cx+r*w,cy+r*dy);g.lineTo(cx-r*w,cy+r*dy);g.closePath();g.fill();
      g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.moveTo(cx,cy+r*(dy-.62));g.lineTo(cx+r*w*.35,cy+r*(dy-.4));g.lineTo(cx-r*w*.35,cy+r*(dy-.4));g.closePath();g.fill();});
    const bc=['#ff5a6e','#ffc233','#3f86ff','#ff8fc0'];[[-.4,.4],[.35,.32],[0,.0],[-.2,-.2],[.25,-.05]].forEach(([u,w],i)=>{const bx=cx+r*u,by=cy+r*w;if(night)glowAt(g,bx,by,cs*.14,'255,220,140',.35);g.fillStyle=bc[i%4];g.beginPath();g.arc(bx,by,cs*.05,0,7);g.fill();});
    g.fillStyle='#ffd23f';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?cs*.04:cs*.1;g.lineTo(cx+Math.cos(a)*rr,cy+r*(-.87)+Math.sin(a)*rr);}g.fill();}}

/* ---- 6. запуск праздничного двора ---- */
let pend=null;
const oStart=startLevel;
function fvStart(k,n){const c=cur();if(!c||c.k!==k||n<1||n>c.open){toast(T('Этот двор пока закрыт','This yard isn’t open yet'));return;}
  const p=fvParams(k,n),seed=fvSeed(c.id,n),oLP=levelParams,oGen=genLevel,oLvl=STAT.lvl,oTip=tipFor;
  levelParams=function(){return p;};genLevel=function(pp,s){return oGen(pp,seed);};
  STAT.lvl=function(){return oLvl.call(STAT,n,'fest',{e:c.id});};
  tipFor=function(){return k==='hw'?T('🌙 Чёрная Волга — без стрелки: белые фары спереди, красные огни сзади. Куда смотрят фары — туда и поедет.','🌙 The Black Volga has no arrow: white lights at the front, red at the back.'):T('🎄 Ёлки не сдвинуть — объезжай. В этом дворе — Буханка Деда Мороза!','🎄 Trees can’t be moved — drive around them.');};
  pend={k,n,id:c.id};
  try{if(oStart.length>=3)oStart(FV_IDX,false,{p,seed,mode:'fest'});else oStart(FV_IDX,false);}
  finally{levelParams=oLP;genLevel=oGen;STAT.lvl=oLvl;tipFor=oTip;pend=null;}
  if(!G)return;G.fv={k,n,id:c.id};try{FEST.use(c.id,'yd');}catch(e){}
  // время суток праздника: ночь для страшилки, вечер с огнями для базара
  G.tod=c.e.tod;applyLook();const Tt=TOD[G.tod],sg=$$('scr-game'),bg=lookBg(G.tod);sg.style.background=bg;D.body.style.background=bg;sg.classList.toggle('dark',!!Tt.dark);
  // своя машина праздника: самая «глубокая» подходящая (уезжает поздно)
  const vs=G.vs,{w,h}=G.p,occ=G.occ,sp=v=>v.kind||v.own||(G.amb&&G.amb.id===v.id)||G.police===v.id;
  const pick=len=>{let b=null,bs=-1;for(const v of vs){if(v.L!==len||sp(v))continue;const s2=closureOf(vs,occ,w,h,v.id).size;if(s2>bs){bs=s2;b=v;}}return b;};
  const car=CARS[c.e.car],cv=pick(car.len)||pick(2);
  if(cv){recolor(cv,car.color);cv.mdl=car.mdl;cv.fvCar=car.id;if(k==='hw')cv.noArrow=true;G.fvCarId=cv.id;}
  if(k==='hw'&&n>=4){const o=vs.filter(v=>v.L===2&&!sp(v)&&v!==cv&&!v.noArrow);if(o.length)o[n%o.length].noArrow=true;}
  carsKey='';groundV++;
  $$('gLevel').textContent=c.e.ic+' '+(k==='hw'?T('Ночь ','Night ')+n:dayNum(c,n)+T(' декабря',' Dec'));updHud();sideUpd();
  const g0=G;setTimeout(()=>{if(G===g0&&!g0.over)sayQuiet(bub(k),'bench');},1800);}
startLevel=function(idx,daily){
  if(!pend&&!daily&&G&&G.fv&&idx===G.idx){const f=G.fv;return fvStart(f.k,f.n);} // «Заново» в праздничном дворе
  if(!pend)applyLook();
  return oStart.apply(this,arguments);};
if(window.__test)window.__test.fvStart=fvStart;

/* ---- 7. по ходу двора: заголовок, панель ПК, реплики, фары-«глаза» Волги ---- */
const oHud=updHud;updHud=function(){oHud.apply(this,arguments);try{if(G&&G.fv){const left=G.vs.filter(v=>v.state==='idle'||v.state==='bump').length,c=cur();
  $$('gCity').textContent=TOD[G.tod].icon+' '+(c?evName(c):'')+' · 🚗 '+left;}}catch(e){}};
const oSide=sideUpd;sideUpd=function(){oSide.apply(this,arguments);try{const e=$$('gSide');if(e&&G&&G.fv){const c=cur();if(!c)return;
  e.innerHTML=`<p class="goal">${c.e.ic} ${goalTxt(c)}</p>`+(G.fv.k==='hw'?`<p class="goal">${T('Чёрная Волга — без стрелки: смотри на фары','The Black Volga has no arrow — watch its lights')}</p>`:'')
    +`<p class="keys">${T('H — подсказка · R — заново<br>колёсико — приблизить · Esc — карта','H — hint · R — restart<br>mouse wheel — zoom · Esc — map')}</p>`;}}catch(e){}};
const oLine=winLine;winLine=function(){if(G&&G.fv)return G.fv.k==='hw'?T('Ночь позади — двор свободен!','Night is over — the yard is clear!'):T('С наступающим! Двор свободен!','Happy holidays! The yard is clear!');return oLine.apply(this,arguments);};
const oExit=startExit;startExit=function(v){const r=oExit.apply(this,arguments);try{if(G&&G.fv&&v&&v.fvCar){const g0=G;setTimeout(()=>{if(G===g0&&!g0.over)say(v.fvCar==='volga'?bub('volga'):T('Буханка Деда Мороза поехала за подарками!','Grandpa Frost’s van is off for gifts!'),'win');},500);}}catch(e){}return r;};
const oRender=render;render=function(){oRender.apply(this,arguments);try{if(G&&G.fv&&G.fv.k==='hw'&&!LOW)eyes();}catch(e){}};
function eyes(){const v=G.vs[G.fvCarId];if(!v||v.state==='gone'||v.ap<1)return;const t=calm()?0:performance.now()/1000,a=.32+.18*Math.sin(t*2.2);
  ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.translate(cam.x,cam.y);ctx.scale(cam.z,cam.z);
  const he=v.s+v.L-1,Dd=DIRS[v.dir],hp=toPx(trackPt(v.track,Math.min(he,v.track.length-1.001))),fx=Dd[0],fy=Dd[1];
  for(const sd of [-1,1]){const x=hp[0]+fx*cs*.36-fy*sd*cs*.25,y=hp[1]+fy*cs*.36+fx*sd*cs*.25;glowAt(ctx,x,y,cs*.42,'255,214,110',a);}
  // лёгкий туман над двором
  if(!calm()){ctx.globalAlpha=.07;ctx.fillStyle='#dfe6ff';for(let i=0;i<3;i++){const x=((t*14+i*W*.4)%(W*1.4))-W*.2,y=oy+(i+.5)*G.p.h*cs/3;ctx.beginPath();ctx.ellipse(x,y,W*.28,cs*.5,0,0,7);ctx.fill();}}
  ctx.restore();}

/* ---- 8. победа и поражение в праздничном дворе ---- */
function goalTxt(c){const d=done(c.id),has=!!fx().car[c.e.car],car=CARS[c.e.car];
  if(has)return T('Пройдено: ','Cleared: ')+d+'/'+c.e.n+' · '+T('«'+car.name+'» уже в гараже','the '+car.en+' is in your garage');
  return `${T('«'+car.name+'»','The '+car.en)}: ${bar(Math.min(d,c.e.need),c.e.need)} ${d}/${c.e.need}`;}
function tale(c,k){if(c.k==='hw'){const a=TALE.hw[Math.max(0,Math.min(6,k-1))];return RU()?a[0]:a[1];}
  return RU()?TALE.ny[Math.max(0,Math.min(16,k-1))]:TALE.nyEn.replace('{n}',k);}
const oWin=win;win=function(){if(!(G&&G.fv))return oWin.apply(this,arguments);try{fvWin();}catch(e){try{STAT.err&&STAT.err(e);}catch(_){}oWin.apply(this,arguments);}};
function fvWin(){const g=G,f=g.fv,c=cur()||{k:f.k,e:EVS[f.k],id:f.id,open:0};g.over=true;YG.stop();SND.win();
  const st=Math.max(1,g.hearts),r=rec(f.id),first=!r[f.n];r[f.n]=Math.max(r[f.n]||0,st);
  const reward=(first?20+5*st:0)+(g.bonus||0);if(reward){S.coins+=reward;ern('quest',reward);}
  const d=done(f.id),car=CARS[c.e.car],F=fx();let carNew=false;
  if(d>=c.e.need&&!F.car[car.id]){F.car[car.id]=1;carNew=true;try{FEST.give(f.id,'main');}catch(e){}}
  STAT.end('win',{st:st,rv:g.stRv||0,hp:g.helps,cr:g.crashes,mv:g.moves});try{FEST.use(f.id,'win');}catch(e){}
  save();updCoins();if(reward)setTimeout(()=>SND.coin(),500);
  const nx=c.open?nextOpen(c):0,story=first?tale(c,d):'';
  const nextB=nx?`<button class="btn green" id="fvNext">${f.k==='hw'?T('Ночь ','Night ')+nx:dayNum(c,nx)+T(' декабря',' Dec')} →</button>`:'';
  modal(`<div class="fvW ${c.e.cls}"><h2>${f.k==='hw'?T('Ночь позади! 🌙','Night is over! 🌙'):T('Двор свободен! 🎄','Yard cleared! 🎄')}</h2><div class="big-stars">${starsHtml(st)}</div>
    ${story?shura(story):''}
    <div class="rew">${reward?`<p class="coins-won" id="mWon">+${reward} 💰</p>`:`<p class="goal">${T('Двор уже пройден — награда была в первый раз.','Already cleared — the reward was given the first time.')}</p>`}</div>
    ${carNew?`<div class="newcar fvCarNew"><p>${T('Новая машина в гараже:','New car in the garage:')} <b>${RU()?car.name:car.en}</b></p><canvas id="fvNc"></canvas></div>`:`<p class="goal">${goalTxt(c)}</p>`}
    ${!nx&&c.open&&c.open<c.e.n?`<p class="goal">${T('Следующий двор откроется завтра','The next yard opens tomorrow')} — ${dateOf(c,c.open+1)}</p>`:''}
    <div class="row">${nextB||`<button class="btn green" id="fvMap">🗺 ${T('На карту','To the map')}</button>`}<div class="row2"><button class="btn" id="fvEv">${c.e.ic} ${evName(c)}</button>${nextB?`<button class="btn" id="fvMap">${T('На карту','To the map')}</button>`:''}</div></div></div>`);
  fitWin('');
  const b1=$$('fvNext');if(b1)b1.onclick=()=>{hideModal();fvStart(f.k,nx);};
  $$('fvMap').onclick=()=>{hideModal();openMap();};$$('fvEv').onclick=()=>{hideModal();openMap();setTimeout(()=>openEv(),60);};
  if(carNew)requestAnimationFrame(()=>drawCar($$('fvNc'),car));
  coinFx(reward,$$('mWon'));}

/* ---- 9. окно праздника ---- */
function drawCar(canvas,car,col){if(!canvas)return;const dpr2=Math.min(2,window.devicePixelRatio||1),rc=canvas.getBoundingClientRect(),Wc=rc.width||150,Hc=rc.height||80;
  canvas.width=Wc*dpr2;canvas.height=Hc*dpr2;const c2=canvas.getContext('2d');c2.setTransform(dpr2,0,0,dpr2,0,0);
  const cells=[];for(let i=car.len-1;i>=0;i--)cells.push([i,0]);const v=makeVehicle(cells,1,car.color,car.len,1,'');v.mdl=car.mdl;v.fvCar=car.id;recolor(v,col||car.color);
  const s=Math.min(Wc/(car.len+.6),Hc/1.35),ox2=(Wc-car.len*s)/2,oy2=(Hc-s)/2+s*.08;
  if(car.id==='volga'){glowAt(c2,ox2+car.len*s-s*.1,oy2+s*.25,s*.5,'255,214,110',.5);glowAt(c2,ox2+car.len*s-s*.1,oy2+s*.75,s*.5,'255,214,110',.5);}
  drawVehicle(c2,v,0,([x,y])=>[ox2+(x+.5)*s,oy2+(y+.5)*s],s,{noArrow:true});}
function openEv(){const c=cur();if(!c){toast(T('Праздник закончился — до следующего!','The holiday is over — see you next time!'));return;}
  STAT.screen('fest');try{FEST.use(c.id,'open');}catch(e){}
  const r=rec(c.id),d=done(c.id),car=CARS[c.e.car],has=!!fx().car[car.id],nx=nextOpen(c);let tiles='';
  for(let n=1;n<=c.e.n;n++){const st=r[n]||0,op=n<=c.open,lab=c.k==='hw'?n:dayNum(c,n);
    tiles+=`<button class="fvT ${st?'done':op?'open':'lock'}${n===nx?' nx':''}" data-n="${n}"${op?'':' disabled'}><b>${lab}</b><small>${st?'★'.repeat(st):op?(c.k==='hw'?'🌙':'🎁'):'🔒 '+dateOf(c,n)}</small></button>`;}
  const intro=d?tale(c,d):(c.k==='hw'?(RU()?TALE.intro[0]:TALE.intro[1]):tale(c,1));
  modal(`<div class="fvE ${c.e.cls}"><h2>${c.e.ic} ${evName(c)}</h2><p class="fvSub">${esc(FEST.name(c.id))} · ${tillTxt(c)}</p>
    <div class="fvHero"><canvas id="fvHc"></canvas><span>${has?T('В твоём гараже','In your garage'):T('Награда: ','Reward: ')+c.e.need+' '+unitW(c,c.e.need)+T(' из ',' of ')+c.e.n}</span></div>
    ${shura(intro)}
    <div class="fvG${c.e.n>9?' many':''}">${tiles}</div>
    <p class="goal">${goalTxt(c)}</p>
    ${window.VYPARK&&VYPARK.festBtn?VYPARK.festBtn(c.k):''}<!-- vy-park: праздничная парковка -->
    <div class="row">${nx?`<button class="btn green" id="fvGo">${c.k==='hw'?T('Ночь ','Night ')+nx:dayNum(c,nx)+T(' декабря',' Dec')} →</button>`:`<p class="goal">${c.open<c.e.n?T('Новый двор — завтра','A new yard tomorrow')+' ('+dateOf(c,c.open+1)+')':T('Все дворы пройдены!','All yards cleared!')}</p>`}<button class="btn" id="mCancel">${T('Закрыть','Close')}</button></div></div>`);
  D.querySelectorAll('#mcard .fvT').forEach(b=>{if(!b.disabled)b.onclick=()=>{hideModal();fvStart(c.k,+b.dataset.n);};});
  const go=$$('fvGo');if(go)go.onclick=()=>{hideModal();fvStart(c.k,nx);};$$('mCancel').onclick=()=>{hideModal();};
  requestAnimationFrame(()=>drawCar($$('fvHc'),car));}
const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);

/* ---- 10. плашка (гнездо UX homeSlots или над картой) и однодневные подарки ---- */
const GIFTS=[{id:'bab26',k:'gift',c:50,ic:'👵',t:'День бабушек и дедушек: подарок от бабы Шуры и деда',en:'Grandparents’ Day: a gift from Granny Shura'},
  {id:'vyh26',k:'gift',c:40,ic:'🎁',t:'Выходной во дворе: гостинец за вход',en:'Day off in the yard: a little gift'},
  {id:'bab27',k:'gift',c:50,ic:'👵',t:'День бабушек и дедушек: подарок от бабы Шуры и деда',en:'Grandparents’ Day: a gift from Granny Shura'},
  {id:'vyh27',k:'gift',c:40,ic:'🎁',t:'Длинные выходные во дворе: гостинец за вход',en:'Long weekend: a little gift'}];
function gift(){for(const x of GIFTS)if(FEST.on(x.id)&&!FEST.got(x.id,x.k))return x;return null;}
function banHtml(){const c=cur(),gf=gift();let h='';
  if(c){const nx=nextOpen(c),d=done(c.id),has=!!fx().car[c.e.car];
    h+=`<button class="tday noenter fvBan ${c.e.cls}${nx?' hot':''}" data-fv="ev"><span class="fvI">${c.e.ic}</span><span><b>${evName(c)}</b> · ${nx?(c.k==='hw'?T('ночь ','night ')+nx+T(' ждёт',' awaits'):dayNum(c,nx)+T(' декабря — подарок под ёлкой',' Dec — a gift under the tree')):T('новый двор завтра','new yard tomorrow')}<small>${has?T('машина в гараже · ','car in garage · ')+d+'/'+c.e.n:`${RU()?CARS[c.e.car].name:CARS[c.e.car].en}: ${Math.min(d,c.e.need)}/${c.e.need}`} · ${tillTxt(c)}</small></span><i>›</i></button>`;}
  if(gf)h+=`<button class="tday noenter hot fvBan fvGift" data-fv="gift"><span class="fvI">${gf.ic}</span><span><b>${RU()?gf.t:gf.en}</b> — +${gf.c} 💰 ${T('забрать','collect')}</span><i>›</i></button>`;
  return h;}
function banBind(el){el.querySelectorAll('[data-fv]').forEach(b=>b.onclick=()=>{try{SND.tap();}catch(e){}if(b.dataset.fv==='ev')openEv();else takeGift();});}
function takeGift(){const gf=gift();if(!gf)return;if(FEST.give(gf.id,gf.k)){S.coins+=gf.c;ern('gift',gf.c);save();updCoins();SND.coin();toast('+'+gf.c+' 💰 — '+(RU()?gf.t:gf.en),2600);}refresh();}
const SLOTS=typeof homeSlots!=='undefined'&&Array.isArray(homeSlots);
if(SLOTS)homeSlots.push({id:'fest',order:3,zone:'top',/* vy-merge: широкая плашка — полосой под шапкой, не узкой плиткой ленты */render:function(){return banHtml()||null;},mount:function(el){banBind(el);}});
function mapBan(){if(SLOTS)return;const sc=$$('scr-map');if(!sc)return;let b=$$('fvBanW');const h=banHtml();
  if(!h){if(b)b.remove();return;}if(!b){b=D.createElement('div');b.id='fvBanW';const t=$$('mToday');if(t)t.parentNode.insertBefore(b,t);else sc.appendChild(b);}
  b.innerHTML=h;banBind(b);}
function refresh(){applyLook();try{mapBan();}catch(e){}try{if(SLOTS&&typeof uiHome==='function'&&$$('scr-menu')&&$$('scr-menu').classList.contains('on'))uiHome();}catch(e){}}
const oMap=openMap;openMap=function(){applyLook();const r=oMap.apply(this,arguments);try{mapBan();autoOpen();FEST.fx(true);}catch(e){}return r;};
// первый заход в праздник — окно само (один раз за праздник), если нет другого окна
function autoOpen(){const c=cur();if(!c||fx().seen[c.id]||window.__demo||!(S.levelsDone>0))return;
  setTimeout(()=>{if(modalOn||G||!$$('scr-map').classList.contains('on')||$$('ad').classList.contains('on'))return;fx().seen[c.id]=1;save();openEv();},1200);}

/* ---- 11. гараж: «Праздничные машины» (YARD: FESTVY.cars — для альбома) ---- */
const oGar=openGarage;openGarage=function(){const r=oGar.apply(this,arguments);try{garRow();}catch(e){}return r;};
function garRow(){if(typeof garTab!=='undefined'&&garTab!=='cars')return;const F=fx(),c=cur(),list=Object.keys(CARS).filter(k=>F.car[k]||(c&&c.e.car===k));if(!list.length)return;
  const g=$$('garGrid'),hd=D.createElement('div');hd.className='gsets fvGar';hd.innerHTML=`<h3>🎉 ${T('Праздничные машины','Holiday cars')}</h3>`;g.appendChild(hd);
  for(const k of list){const car=CARS[k],has=!!F.car[k],dv=D.createElement('div');dv.className='gcard '+(has?'own':'lock')+' fvCard';
    dv.innerHTML=`<canvas></canvas><b>${has?'':'🔒 '}${RU()?car.name:car.en}</b><small>${has?(RU()?car.about:car.aboutEn):EVS[car.ev].ic+' '+(RU()?EVS[car.ev].title:EVS[car.ev].titleEn)+': '+EVS[car.ev].need+T(' из ',' of ')+EVS[car.ev].n}</small>`;
    dv.onclick=()=>{if(has)toast((RU()?car.name:car.en)+' — '+(RU()?car.about:car.aboutEn),2400);else openEv();};g.appendChild(dv);
    requestAnimationFrame(()=>drawCar(dv.querySelector('canvas'),car));}}

/* ---- 12. облако ---- */
const oMerge=mergeSave;mergeSave=function(d){const kf=S.fest,kt=S.fst;oMerge.apply(this,arguments);
  try{if(kf)S.fest=kf;if(kt)S.fst=kt;if(isO(d)){fvMerge(d.fst);FEST.merge(d.fest);}}catch(e){}};

/* ---- 13. модуль FEST ---- */
// «Неделя страшилок» в общей таблице без Выезда — включаем только в этой игре (общий fest.js не трогаем)
try{for(const id of ['hw26','hw27']){const r=FEST.get(id);if(r&&r.games!=='*'&&(','+r.games+',').indexOf(',vyezd,')<0)r.games+=',vyezd';}}catch(e){}
try{FEST.init(S,{g:'vyezd',plat:PLAT,lang:typeof LANG!=='undefined'?LANG:'ru',save:function(){save();},now:function(){return nowMs();},cls:'btn noenter',
  modal:function(h){modal(h);return $$('mcard');},close:function(){hideModal();},low:function(){try{return LOW||calm();}catch(e){return false;}},
  change:function(){refresh();}});}catch(e){}
// листья осени во дворе мешают — частицы только на карте; снег идёт и во дворе
try{const oShow=show;show=function(id){oShow.apply(this,arguments);try{FEST.fx(id!=='scr-game'||winter());}catch(e){}};}catch(e){}

refresh();try{if($$('scr-map').classList.contains('on'))autoOpen();}catch(e){}
window.FESTVY={cars:CARS,events:EVS,cur:cur,open:openEv,start:fvStart,done:done,owned:k=>!!fx().car[k],
  draw:function(canvas,id,col){if(CARS[id])drawCar(canvas,CARS[id],col);},winter:winter};
})();
