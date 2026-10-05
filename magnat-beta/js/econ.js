/* ================= «Из ларька в магнаты: бизнес» — экономическая модель (без DOM) =================
   Один модуль на игру и симулятор (tools/sim.js гоняет его в JavaScriptCore, node не нужен).
   Мир W — обычный объект (JSON): сохраняется целиком, случайность — своя (W.rs), поэтому прогон воспроизводим.
   Время: день — шаг tick(W,off); 30 дней = месяц, в конце — закрытие месяца (close): постоянные расходы, амортизация,
   проценты и тело кредитов, налог на прибыль 25 % (перенос убытка — не больше 50 % базы), боты, рынок, контракты, события, отчёт.
   Деньги — целые рубли. Учёт — «директ-костинг»: в запасы идут переменные затраты (добыча, передел, сырьё),
   постоянные — расходы периода; логистика — коммерческие расходы. Баланс обязан сходиться всегда: check(W).bal === 0.
   Активы: деньги + запасы (склады и в пути) + незавершённое строительство + ОС (первоначальная − амортизация) + лицензии (НМА).
   Пассивы: кредиты (включая овердрафт); капитал: уставный + нераспределённая прибыль прошлых месяцев + прибыль текущего.
   ДДС: операционный (выручка, закупки, производство, постоянные, логистика, офис, разведка, прочие, проценты, налог),
   инвестиционный (стройка, лицензии, вагоны, продажа активов), финансовый (кредиты, погашение, взнос в капитал).
   Проценты — в операционном потоке (как в РСБУ). */
(function(root){
'use strict';
const DAYS=30,TAX=.25,LOSS_CAP=.5;
// регионы MVP: k — коэффициент цены «на месте» (нетбэк: чем дальше от потребителя, тем ниже); p — что лежит в недрах
const REGS={
  kuz:{n:'Кузбасс',en:'Kuzbass',city:'Кемерово',ce:'Kemerovo',ex:25e6,xy:[87,54],
    k:{coal:.85,ore:.92,lime:.97,wood:.88,lumber:.9,pig:.92,steel:.92,roll:.93,cuore:.9,cucon:.95,cu:.97,wire:.97},p:{coal:.58,lime:.12,ore:.05,wood:.05}},
  ural:{n:'Урал',en:'Urals',city:'Екатеринбург',ce:'Yekaterinburg',ex:25e6,xy:[60.6,56.8],
    k:{coal:1,ore:1,lime:1,wood:.92,lumber:.97,pig:1,steel:1,roll:1,cuore:1,cucon:1,cu:1,wire:1},p:{ore:.33,cuore:.15,lime:.18,coal:.07,wood:.07}},
  kar:{n:'Карелия',en:'Karelia',city:'Петрозаводск',ce:'Petrozavodsk',ex:20e6,xy:[34.3,61.8],
    k:{coal:.93,ore:.86,lime:.97,wood:.95,lumber:1.05,pig:.95,steel:.96,roll:.96,cuore:.9,cucon:.97,cu:.98,wire:.98},p:{wood:.38,ore:.3,lime:.12}}
};
const REG=['kuz','ural','kar'];
// ж/д: расстояние, км. Тариф ₽/т = 250 + 1,05·км; свои вагоны — без арендной ставки (650 ₽/т); в пути ⌈км/650⌉+1 дней
const KM={'kuz-ural':1900,'kar-ural':2300,'kar-kuz':4000};
const RENT=650,WAG_T=70,WAG_COST=3.2e6,WAG_FIX=20000,WAG_LIFE=240;
// товары: p — базовая цена ₽ за единицу, V — объём рынка в месяц (сколько «переваривает» страна без падения цены), s — дневной шум
const GOODS={
  // цены ₽ без НДС, близки к рынку РФ 2026 (источники — CLAUDE.md); мощности и CAPEX заводов упрощены под игру
  coal:{n:'Уголь коксующийся',en:'Coking coal',u:'т',ue:'t',p:9500,V:400000,s:.008},
  ore:{n:'Железорудный концентрат',en:'Iron ore concentrate',u:'т',ue:'t',p:8500,V:400000,s:.008},
  lime:{n:'Известняк',en:'Limestone',u:'т',ue:'t',p:1200,V:150000,s:.004},
  wood:{n:'Лес (пиловочник)',en:'Sawlogs',u:'м³',ue:'m³',p:4500,V:420000,s:.007},
  lumber:{n:'Пиломатериалы',en:'Lumber',u:'м³',ue:'m³',p:16000,V:160000,s:.007},
  pig:{n:'Чугун',en:'Pig iron',u:'т',ue:'t',p:32000,V:120000,s:.006},
  steel:{n:'Сталь (заготовка)',en:'Steel billet',u:'т',ue:'t',p:42000,V:120000,s:.006},
  roll:{n:'Прокат',en:'Rolled steel',u:'т',ue:'t',p:50000,V:100000,s:.006},
  cuore:{n:'Медная руда',en:'Copper ore',u:'т',ue:'t',p:2500,V:600000,s:.01},
  cucon:{n:'Медный концентрат',en:'Copper concentrate',u:'т',ue:'t',p:145000,V:15000,s:.011},
  cu:{n:'Медь катодная',en:'Copper cathode',u:'т',ue:'t',p:850000,V:4000,s:.012},
  wire:{n:'Медная катанка',en:'Copper wire rod',u:'т',ue:'t',p:960000,V:2500,s:.012}
};
const GL=Object.keys(GOODS);
// объекты: capex ₽, mo — месяцев стройки, cap — выпуск в месяц, fix — постоянные ₽/мес, vc — переменные ₽ на единицу (у добычи — из месторождения),
// life — срок полезного использования, мес.; dep — какое месторождение нужно; in — сырьё на единицу продукции
const OBJ={
  // CAPEX подобран под окупаемость по базовым ценам: добыча ~20–24 мес., переделы ~28–32 мес. (игровые, месяц = 5 минут)
  coalpit:{seg:'mine',n:'Угольный разрез',en:'Coal pit',dep:'coal',out:'coal',capex:430e6,mo:3,cap:12000,fix:6e6,life:120},
  orepit:{seg:'mine',n:'Железорудный ГОК',en:'Iron ore mine',dep:'ore',out:'ore',capex:610e6,mo:4,cap:15000,fix:9e6,life:150},
  limepit:{seg:'mine',n:'Известняковый карьер',en:'Limestone quarry',dep:'lime',out:'lime',capex:155e6,mo:2,cap:20000,fix:2e6,life:120},
  logging:{seg:'wood',n:'Лесозаготовка',en:'Logging camp',dep:'wood',out:'wood',capex:200e6,mo:2,cap:9000,fix:3e6,life:96},
  sawmill:{seg:'wood',n:'Лесопильный завод',en:'Sawmill',out:'lumber',in:{wood:1.8},capex:430e6,mo:3,cap:5000,vc:4500,fix:5e6,life:180},
  furnace:{seg:'steel',n:'Доменная печь',en:'Blast furnace',out:'pig',in:{ore:1.6,coal:.6,lime:.3},capex:1450e6,mo:6,cap:10000,vc:5000,fix:18e6,life:240},
  steel:{seg:'steel',n:'Сталеплавильный цех',en:'Steel shop',out:'steel',in:{pig:1.1},capex:560e6,mo:4,cap:10000,vc:3500,fix:12e6,life:240},
  rolling:{seg:'steel',n:'Прокатный стан',en:'Rolling mill',out:'roll',in:{steel:1.05},capex:780e6,mo:4,cap:10000,vc:2000,fix:8e6,life:240},
  cupit:{seg:'copper',n:'Медный рудник',en:'Copper mine',dep:'cuore',out:'cuore',capex:740e6,mo:4,cap:60000,fix:12e6,life:150},
  cuconc:{seg:'copper',n:'Обогатительная фабрика',en:'Concentrator',out:'cucon',in:{cuore:45},capex:620e6,mo:4,cap:1300,vc:8000,fix:8e6,life:200},
  smelter:{seg:'copper',n:'Медеплавильный завод',en:'Copper smelter',out:'cu',in:{cucon:4.6},capex:700e6,mo:5,cap:300,vc:60000,fix:10e6,life:240},
  wiremill:{seg:'copper',n:'Кабельный завод',en:'Wire rod mill',out:'wire',in:{cu:1.02},capex:360e6,mo:3,cap:300,vc:30000,fix:5e6,life:240},
  store:{seg:'infra',n:'Склад',en:'Warehouse',capex:40e6,mo:1,stor:30000,fix:4e5,life:240}
};
// сегменты портфеля (для отчётов по сегментам и будущих «Розница и услуги»): mine, wood, steel, copper, infra
const SEGS=['gig','retail','serv','trade','logi','quarry','mine','wood','steel','copper','infra','hq'];
const MINE_OF={coal:'coalpit',ore:'orepit',lime:'limepit',wood:'logging',cuore:'cupit'};
const DEP={coal:{res:[900e3,2500e3],vc:[5000,6400]},ore:{res:[1200e3,3000e3],vc:[4800,6600]},lime:{res:[1500e3,3500e3],vc:[500,800]},wood:{res:[600e3,1500e3],vc:[2300,3100]},cuore:{res:[4e6,9e6],vc:[1400,1900]}};
const STOR0=40000,UP_CAP=.5,UP_FIX=.3,UP_MAX=2,UP_COST=.6,PLOTS0=8,PLOTS_MAX=11;
const LIFE_LIC=120,ADM0=2.5e6,ADM_OBJ=5e5,EXPL_DAYS=20,AUC_DAYS=10,OFFER_DAYS=30;
// компании-боты (вымышленные): f — до какой доли оценки участка готовы торговаться, ex — тяга к разведке, lev — сколько годовых EBITDA долга терпят
const BOTS=[
  {id:'bars',n:'Барсуков и сыновья',en:'Barsukov & Sons',who:'Пётр Барсуков',whoe:'Pyotr Barsukov',ch:'cautious',col:'#8e6b3a',f:.35,ex:.25,lev:1,max:5,like:['ore','lime'],reg:['ural']},
  {id:'bear',n:'Медведь Капитал',en:'Bear Capital',who:'Михаил Топтыгин',whoe:'Mikhail Toptygin',ch:'bold',col:'#b03a2e',f:.7,ex:.5,lev:3,max:9,like:['coal','ore'],reg:['kuz','ural']},
  {id:'owl',n:'Сова Инвест',en:'Owl Invest',who:'Софья Совина',whoe:'Sofia Sovina',ch:'calc',col:'#5b4b8a',f:.55,ex:.35,lev:2,max:7,like:['coal','ore','lime','cuore'],reg:['kuz','ural','kar']},
  {id:'beav',n:'Бобров и Ко',en:'Beaver & Co',who:'Борис Бобров',whoe:'Boris Bobrov',ch:'wood',col:'#2e7d5b',f:.6,ex:.3,lev:1.5,max:5,like:['wood'],reg:['kar','ural']}
];
const BUYERS=[['ТЭЦ «Заречная»','Riverside Power Plant'],['Металлобаза «Восток»','East Metal Depot'],['Стройтрест № 7','Construction Trust No. 7'],['Завод «Прогресс»','Progress Works'],
  ['Мебельная фабрика «Уют»','Cosy Furniture Factory'],['Порт «Северный»','North Port'],['Кирпичный завод «Горн»','Horn Brickworks'],['Вагоностроительный «Рельс»','Rail Carriage Works'],['Трубный завод «Магистраль»','Mainline Pipe Works']];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const rnd0=Math.round;

/* ---------------- случайность (mulberry32, состояние в мире) ---------------- */
function R(W){let a=W.rs=(W.rs+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;}
function RN(W){let u=0,v=0;while(!u)u=R(W);v=R(W);return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function RR(W,a,b){return a+(b-a)*R(W);}
function pick(W,o){let s=0;for(const k in o)s+=o[k];let x=R(W)*Math.max(1,s),acc=0;for(const k in o){acc+=o[k];if(x<acc)return k;}return null;}

/* ---------------- мир ---------------- */
function emptyMon(W){return {c0:W.cash,pl:{rev:0,cogs:0,fix:0,log:0,adm:0,expl:0,dep:0,oth:0,int:0,tax:0,jv:0},
  cf:{sales:0,supp:0,prod:0,fix:0,log:0,adm:0,expl:0,oth:0,int:0,tax:0,capex:0,lic:0,wag:0,asale:0,jvin:0,div:0,lend:0,loan:0,repay:0,eqin:0,drw:0},prod:{},sold:{},bought:{},rev:{},cg:{},sg:{}};}
function newDeposit(W,r,force){const g=force||pick(W,Object.assign({},REGS[r].p,{_:.2}));if(!g||g==='_')return null;const d=DEP[g],q=R(W);
  return {g,res:rnd0(RR(W,d.res[0],d.res[1])/1000)*1000,vc:rnd0((d.vc[0]+(d.vc[1]-d.vc[0])*q)/10)*10,cm:Math.round(RR(W,1,1.3)*100)/100};}
function freshMk(W){for(const g of GL){W.mk[g]={i:1,tg:1,s30:0,p0:0,sh:0,shT:0,V:GOODS[g].V,ph:[]};W.own[g]=0;}}
// мир: o.rags — «из грязи в князи» (старт с 5 000 ₽, глава «Карьера», части «недра» ещё нет — её создаст initNedra при переходе);
// без rags — как раньше: сразу недра (IPO, симулятор, старые игроки)
function newWorld(o){o=o||{};const seed=(o.seed>>>0)||((Math.random()*4e9)>>>0)||7;const rags=!!o.rags;
  const W={v:1,fv:FMT_V,seed,rs:seed,t:0,m:o.m0||0,d:0,rep:o.rep||0,hold:o.hold||1,tut:rags?false:o.tut!==false,
    cash:0,cap:0,ret:0,lossCF:0,inv:{},tr:[],obj:[],nid:1,plots:{},auc:[],loans:[],wag:{n:0,g:0,dep:0,busy:[]},
    mk:{},own:{},key:.16,auto:{},routes:[],offers:[],cons:[],bots:[],ev:[],news:[],hist:[],reps:[],od:0,odM:0,san:0,ach:{},stat:{sold:0,built:0,expl:0},
    st:rags?'gig':'nedra',ned:false,home:o.home||'kuz',me:null,biz:[],rec:[],taxm:rags?'npd':'osno',ch:rags?0:60,les:{},partner:null,
    pk:Object.assign({},o.pk||{}),bst:0,bstN:0,qg:null,lx:{},use:{},drw:0};
  freshMk(W);
  for(const r of REG){W.inv[r]={};W.auto[r]={};for(const g of GL){W.inv[r][g]={q:0,v:0};W.auto[r][g]=true;}W.plots[r]=[];}
  W.mon=emptyMon(W);
  if(rags){W.bs={};W.bd={};for(const g of GL){W.bs[g]=0;W.bd[g]=0;}W.key=.14;
    const c=o.cap||5000;W.cap=c;recv(W,c,'eqin');if(root.ECON&&root.ECON.bizInit)root.ECON.bizInit(W,o);news(W,'start',{c,rags:1});return W;}
  initNedra(W,{cap:o.cap||(800e6+200e6*W.rep)});
  return W;}
// часть мира «недра»: участки (учебный — в Кузбассе), боты со стартовыми активами, рынок металлов; o.cap — взнос в уставный капитал (ДДС: eqin)
function initNedra(W,o){o=o||{};W.ned=true;W.st='nedra';freshMk(W);W.bots=[];W.auc=[];
  for(const r of REG){W.plots[r]=[];for(let i=0;i<PLOTS0;i++)W.plots[r].push({id:r+i,r,st:'hid',dep:newDeposit(W,r),own:null});}
  // учебный участок: в Кузбассе, хороший уголь (первая лицензия — без торгов)
  if(W.tut){const p=W.plots.kuz[0];p.dep={g:'coal',res:1300e3,vc:5300,cm:1};p.tut=1;}
  // «наследство репутации»: второй и следующие холдинги (без обучения) — найденный участок в родном регионе без торгов за 25–35 % оценки (+1 за улучшение «Наследство»)
  else if(W.rep>0)for(let i=0;i<1+pkL(W,'heir');i++)legacy(W);
  // боты: стартовые активы на своих участках
  const start={bars:[['orepit','ural'],['limepit','ural']],bear:[['coalpit','kuz'],['coalpit','kuz']],owl:[['coalpit','kuz'],['orepit','kar']],beav:[['logging','kar'],['sawmill','kar']]};
  for(const b of BOTS){const B={id:b.id,cash:rnd0(RR(W,900e6,1200e6)),debt:0,rate:W.key+.035,as:[],ex:[],v:[]};W.bots.push(B);
    for(const [t,r] of start[b.id]){const O=OBJ[t];let plot=null;
      if(O.dep){plot=W.plots[r].find(p=>p.st==='hid'&&!p.tut&&p.dep&&p.dep.g===O.dep)||W.plots[r].find(p=>p.st==='hid'&&!p.tut);
        if(!plot)continue;if(!plot.dep||plot.dep.g!==O.dep)plot.dep=newDeposit(W,r,O.dep);plot.st='lic';plot.own=b.id;}
      B.as.push(botAsset(W,t,r,plot,0));}}
  // рынок: доля ботов в начале — «норма», цена = 1
  const sup=botFlows(W);for(const g of GL){W.mk[g].p0=sup.s[g]/W.mk[g].V-sup.d[g]/W.mk[g].V;W.mk[g].s30=sup.s[g]-sup.d[g];}
  W.bs=sup.s;W.bd=sup.d;
  W.n5=1;W.n5m=W.m;   // M30: новая экономика главы 5 (участки по ходу главы, события с выбором, контракты по сроку); старые эталонные миры без флага не меняются
  const c=rnd0(o.cap||0);if(c>0){W.cap+=c;recv(W,c,'eqin');}
  news(W,'start',o.pa?{c,pa:1}:{c});   // pa — это взнос партнёра при входе в «Недра» (не уставный капитал нового холдинга)
  return W;}
/* ---------------- престиж: «Доля основателя» (улучшения навсегда, W.pk — копия S.pk игрока на момент создания мира) ----------------
   geo — разведка −15 % цены и −10 % срока за уровень; bank — ставка −1 п. (недра); logi — ж/д тариф −10 %; brig — стройка −10 % срока;
   vert — заводы на своём переделе: постоянные −10 %, переработка −20 %; heir — ещё один участок «наследства» в начале холдинга */
const PERKS={geo:{max:3},bank:{max:3},logi:{max:3},brig:{max:3},vert:{max:3},heir:{max:2}};
function pkL(W,k){const x=W&&W.pk&&W.pk[k];return typeof x==='number'&&x>0?Math.min(x,PERKS[k]?PERKS[k].max:0):0;}
// участок «наследства»: хороший уголь/руда в родном регионе (или любом), найден, лицензия без торгов за 25–35 % оценки
function legacy(W){const home=W.home&&W.plots[W.home]?W.home:'kuz',regs=[home].concat(REG.filter(r=>r!==home));
  for(const r of regs){const p=W.plots[r].find(x=>x.st==='hid'&&!x.tut&&!x.leg);if(!p)continue;
    const g=REGS[r].p.coal>=.3?'coal':REGS[r].p.wood>=.3?'wood':'ore';let best=null;
    for(let i=0;i<4;i++){const d=newDeposit(W,r,g);if(d&&(!best||depVal(W,r,d)>depVal(W,r,best)))best=d;}
    if(!best)continue;p.dep=best;p.st='found';p.leg=1;p.direct=Math.max(1e6,rnd0(depVal(W,r,best)*RR(W,.25,.35)/1e6)*1e6);news(W,'found',{p:p.id,r,g:best.g,leg:1});return p;}
  return null;}
// применить улучшения к уже стоящим объектам (после выбора в окне IPO) и к новым (build)
function applyPerks(W){const l=pkL(W,'vert');for(const o of W.obj){const O=OBJ[o.t];if(!O||!O.in)continue;o.fk=l?1-.1*l:undefined;if(!o.fk)delete o.fk;o.vc=rnd0((O.vc||0)*(1-.2*l));}}
// планка IPO растёт с репутацией (номер холдинга): 2,2 → 2,6 → 3,2 → 4 → 5 → 6 млрд
const IPO_BAR=[2.2e9,2.6e9,3.2e9,4e9,5e9,6e9];
function ipoEq(W){const r=W&&typeof W.rep==='number'?W.rep:0;return IPO_BAR[Math.max(0,Math.min(IPO_BAR.length-1,r))];}
// «📺 Людмила договорилась с покупателями»: +10 % к цене продаж на 3 игровых месяца, следующий — не раньше чем через 3 месяца после конца
const BOOST_K=.1,BOOST_D=90,BOOST_GAP=90;
function boostOn(W){return !!W&&W.ned&&(W.bst||0)>W.t;}
function boostOk(W){return !!W&&W.ned&&!boostOn(W)&&W.t>=(W.bstN||0);}
// M30: в мирах с новой главой 5 (W.n5) событий и участков больше — буст за рекламу короче (2 месяца вместо 3), чтобы реклама не давала больше +5 % к капиталу
function boostD(W){return W&&W.n5?60:BOOST_D;}
function boost(W){if(!boostOk(W))return 'no';const d=boostD(W);W.bst=W.t+d;W.bstN=W.bst+BOOST_GAP;news(W,'boost',{d});return 'ok';}
/* ---------------- миграция сохранений ----------------
   ПРАВИЛО: любой новый товар, объект, регион или поле мира — только вместе с шагом миграции здесь (и тестом в check.py).
   FMT_V — версия формата мира; migrate(W) доводит старый мир до текущего и возвращает список исправлений. */
const FMT_V=6;   // M39: 5 — опт по видам (b.kd), машины у хозяина (b.at), W.lnk; M44: 6 — износ машин (wr), смены/закупка к сезону опта, ТК
function migrate(W){const fx=[];if(!W||typeof W!=='object')throw new Error('мир пуст');
  const num=(o,k,d)=>{if(typeof o[k]!=='number'||!isFinite(o[k])){o[k]=d;fx.push(k);}};
  for(const k of ['t','m','d','cash','cap','ret','lossCF','od','odM','san','rep','hold','nid'])num(W,k,k==='hold'||k==='nid'?1:0);
  num(W,'key',.16);if(typeof W.rs!=='number')W.rs=(W.seed>>>0)||7;
  for(const k of ['obj','tr','auc','loans','routes','offers','cons','bots','ev','news','hist','reps'])if(!Array.isArray(W[k])){W[k]=[];fx.push(k);}
  for(const k of ['inv','plots','mk','auto','ach','stat','own'])if(!W[k]||typeof W[k]!=='object'||Array.isArray(W[k])){W[k]={};fx.push(k);}
  if(!W.wag||typeof W.wag!=='object')W.wag={n:0,g:0,dep:0,busy:[]};if(!Array.isArray(W.wag.busy))W.wag.busy=[];
  for(const g of GL){if(!W.mk[g]){W.mk[g]={i:1,tg:1,s30:0,p0:0,sh:0,shT:0,V:GOODS[g].V,ph:[]};fx.push('mk.'+g);}
    const M=W.mk[g];num(M,'i',1);num(M,'tg',1);num(M,'s30',0);num(M,'p0',0);num(M,'sh',0);num(M,'shT',0);num(M,'V',GOODS[g].V);if(!Array.isArray(M.ph))M.ph=[];
    if(typeof W.own[g]!=='number')W.own[g]=0;}
  for(const r of REG){if(!W.inv[r])W.inv[r]={};if(!W.auto[r])W.auto[r]={};if(!Array.isArray(W.plots[r])){W.plots[r]=[];fx.push('plots.'+r);}
    for(const g of GL){const x=W.inv[r][g];if(!x||typeof x.q!=='number'||typeof x.v!=='number'){W.inv[r][g]={q:0,v:0};if(x!==undefined)fx.push('inv.'+r+'.'+g);}
      if(typeof W.auto[r][g]!=='boolean')W.auto[r][g]=true;}}
  // объекты неизвестного типа (из будущих/сломанных версий) не трогаем — их просто не будет в производстве
  for(const o of W.obj){num(o,'lv',0);num(o,'dp',0);num(o,'g',0);num(o,'paid',0);num(o,'sp',0);}
  if(!W.bs||typeof W.bs!=='object')W.bs={};if(!W.bd||typeof W.bd!=='object')W.bd={};for(const g of GL){num(W.bs,g,0);num(W.bd,g,0);}
  for(const b of W.bots){if(!Array.isArray(b.as))b.as=[];if(!Array.isArray(b.ex))b.ex=[];if(!Array.isArray(b.v))b.v=[];num(b,'cash',0);num(b,'debt',0);num(b,'rate',W.key+.035);}
  if(!W.mon||typeof W.mon!=='object'){W.mon=emptyMon(W);fx.push('mon');}
  const M0=emptyMon(W);for(const k of ['pl','cf'])for(const x in M0[k])num(W.mon[k],x,0);for(const k of ['prod','sold','bought','rev'])if(!W.mon[k])W.mon[k]={};
  if(typeof W.mon.c0!=='number')W.mon.c0=W.cash;
  for(const k of ['cg','sg'])if(!W.mon[k]||typeof W.mon[k]!=='object')W.mon[k]={};
  // v4 («из грязи в князи»): мир до этой версии — это уже «Недра»; экономика для него не меняется ни на рубль
  if(typeof W.ned!=='boolean'){W.ned=true;W.st='nedra';fx.push('ned');}
  if(typeof W.st!=='string')W.st=W.ned?'nedra':'gig';
  if(!Array.isArray(W.biz))W.biz=[];if(!Array.isArray(W.rec))W.rec=[];if(!W.les||typeof W.les!=='object')W.les={};
  if(W.me===undefined)W.me=null;if(W.partner===undefined)W.partner=null;if(typeof W.home!=='string')W.home='kuz';
  if(typeof W.taxm!=='string')W.taxm=W.ned?'osno':'npd';num(W,'ch',W.ned?60:0);
  // этап 4 (28.09): улучшения «Доли основателя», буст продаж, цель квартала — у старых миров их нет (экономика не меняется)
  // M30: флаг новой экономики главы 5 — всем мирам «из ларька» (живые игроки); мир до этой версии без «ларька» (эталон v3) — как был
  if(W.n5===undefined&&W.fr&&W.fr.rags){W.n5=1;if(typeof W.n5m!=='number')W.n5m=W.partner&&typeof W.partner.m==='number'?W.partner.m:W.m;}
  if(!W.pk||typeof W.pk!=='object'||Array.isArray(W.pk))W.pk={};num(W,'bst',0);num(W,'bstN',0);if(W.qg===undefined||(W.qg!==null&&typeof W.qg!=='object'))W.qg=null;
  if(root.ECON&&root.ECON.storyMigrate)root.ECON.storyMigrate(W,fx);
  if(root.ECON&&root.ECON.bizMigrate)root.ECON.bizMigrate(W,fx);
  if(root.ECON&&root.ECON.reMigrate)root.ECON.reMigrate(W,fx);
  if(root.ECON&&root.ECON.nedMig)root.ECON.nedMig(W,fx);
  if((W.fv||1)<FMT_V)fx.push('v'+(W.fv||1)+'→'+FMT_V);W.fv=FMT_V;
  return fx;}
function botAsset(W,t,r,plot,build){const O=OBJ[t];return {t,r,plot:plot?plot.id:null,vc:plot&&plot.dep?plot.dep.vc:(O.vc||0),
  g:rnd0(O.capex*(plot&&plot.dep?plot.dep.cm:1)),b:build?O.mo:0,lv:0};}
function news(W,k,a){W.news.push({t:W.t,m:W.m,k,a:a||{}});if(W.news.length>40)W.news.splice(0,W.news.length-40);}

/* ---------------- деньги и учёт ---------------- */
function pay(W,a,cf){a=rnd0(a);W.cash-=a;W.mon.cf[cf]-=a;if(a)dtA(W,'c',cf,-a);return a;}
function recv(W,a,cf){a=rnd0(a);W.cash+=a;W.mon.cf[cf]+=a;if(a)dtA(W,'c',cf,a);return a;}
function pl(W,k,a){a=rnd0(a);W.mon.pl[k]+=a;if(a)dtA(W,'p',k,a);}
// M25: раскрытие строк отчётов. Каждая сумма pay/recv/pl ещё раз пишется в W.mon.dt = {p:{строка БДР:{тег:₽}}, c:{статья ДДС:{тег:₽}}} —
// та же округлённая сумма, поэтому раскрытие в сумме всегда равно строке. Тег — «чьи деньги»: TG (кто сейчас считает: точка z12, объект o5,
// кредит l3, действие игрока a.ptUp…), иначе мягкий TS (сегмент из biz.js: s.gig, s.retail…), иначе '_' (общее).
// Подробности живут только в памяти (неперечисляемые поля: в сохранение и упаковку не попадают — размер сейва и симулятор не меняются ни на знак).
// После перезапуска игры то, что было в месяце раньше, — одной строкой '_rl' («до перезапуска»), поэтому сумма всё равно сходится.
let TG='',TS='';
function tg(x){const p=TG;TG=x==null?'':String(x);return p;}
function ts(x){const p=TS;TS=x==null?'':String(x);return p;}
function hid(o,k,v){Object.defineProperty(o,k,{value:v,writable:true,configurable:true,enumerable:false});return v;}
function dtNew(M){const d={p:{},c:{}};for(const k in M.pl)if(M.pl[k])d.p[k]={_rl:M.pl[k]};for(const k in M.cf)if(M.cf[k])d.c[k]={_rl:M.cf[k]};return hid(M,'dt',d);}
function dtA(W,s,k,a){const M=W.mon;let d=M.dt;if(!d||typeof d!=='object'){d=dtNew(M);const x=d[s][k];if(x){x._rl-=a;if(!x._rl)delete d[s][k];}}const o=d[s]||(d[s]={}),r=o[k]||(o[k]={}),t=TG||TS||'_';r[t]=(r[t]||0)+a;}
// перенести сумму тега from строки k в теги parts {тег:вес} (наибольший остаток — сумма не меняется до рубля)
function dtMove(W,s,k,from,parts){const d=W.mon.dt&&W.mon.dt[s]&&W.mon.dt[s][k];if(!d||!d[from])return;const tot=d[from];let wsum=0;for(const t in parts)wsum+=parts[t];if(!(wsum>0))return;
  const ks=Object.keys(parts),v=ks.map(t=>tot*parts[t]/wsum),fl=v.map(x=>Math.trunc(x));let rest=tot-fl.reduce((a,b)=>a+b,0);
  const ord=ks.map((t,i)=>i).sort((a,b)=>Math.abs(v[b]-fl[b])-Math.abs(v[a]-fl[a]));for(let j=0;rest!==0&&j<ord.length*2;j++){const i=ord[j%ord.length],st=rest>0?1:-1;fl[i]+=st;rest-=st;}
  delete d[from];ks.forEach((t,i)=>{if(fl[i])d[t]=(d[t]||0)+fl[i];});}
function netOf(p){return p.rev-p.cogs-p.fix-p.log-p.adm-p.expl-p.dep+p.oth-p.int-p.tax+(p.jv||0);}   // jv — доля прибыли совместных дел (story.js), без налога
function ebitdaOf(p){return p.rev-p.cogs-p.fix-p.log-p.adm-p.expl;}
function invTake(W,r,g,q){const s=W.inv[r][g];if(q>=s.q-1e-9){const v=s.v;s.q=0;s.v=0;return v;}const v=rnd0(s.v*q/s.q);s.q-=q;s.v-=v;return v;}
function invAdd(W,r,g,q,v){const s=W.inv[r][g];s.q+=q;s.v+=rnd0(v);}
function stockR(W,r){let s=0;for(const g of GL)s+=W.inv[r][g].q;return s;}
function storR(W,r){let s=STOR0;for(const o of W.obj)if(o.t==='store'&&o.r===r&&o.st==='w')s+=OBJ.store.stor;return s;}
function bal(W){let inv=0;for(const r of REG)for(const g of GL)inv+=W.inv[r][g].v;for(const x of W.tr)inv+=x.v;
  let cip=0,fa=0,lic=0;for(const o of W.obj){if(o.st==='b')cip+=o.paid;else fa+=o.g-o.dp;if(o.up)cip+=o.up.paid;}
  fa+=W.wag.g-W.wag.dep;for(const r of REG)for(const p of W.plots[r])if(p.own==='you'&&p.lic)lic+=p.lic.g-p.lic.am;
  let rec=0;if(W.biz&&W.biz.length+(W.rec?W.rec.length:0)+(W.me?1:0)&&root.ECON.bizBal){const x=root.ECON.bizBal(W);inv+=x.inv;cip+=x.cip;fa+=x.fa;lic+=x.lic;rec=x.rec;}
  // сюжет (story.js): вложения в совместные дела и займы друзьям; недвижимость (realty.js) — по цене покупки
  let jv=0,lend=0,re=0;if(root.ECON.storyBal){const s=root.ECON.storyBal(W);jv=s.jv;lend=s.lend;}if(root.ECON.reBal)re=root.ECON.reBal(W);
  let debt=0;for(const l of W.loans)debt+=l.a;
  const cur=netOf(W.mon.pl),A=W.cash+inv+cip+fa+lic+rec+jv+lend+re,drw=W.drw||0,E=W.cap+W.ret+cur-drw;   // drw — изъято собственником на личные вещи (капитал меньше, прибыль не трогаем)
  return {cash:W.cash,inv,rec,cip,fa,lic,jv,lend,re,A,debt,L:debt,cap:W.cap,ret:W.ret,cur,drw,E,diff:A-debt-E};}
function check(W){const b=bal(W);let cf=0;for(const k in W.mon.cf)cf+=W.mon.cf[k];return {bal:b.diff,cf:W.mon.c0+cf-W.cash};}
function equity(W){const b=bal(W);return b.E;}
// M25: раскрытие баланса — каждая статья по «чьим» активам {тег:₽}; что не разложилось (новые активы других модулей) — в '_' («прочее»),
// поэтому сумма раскрытия всегда равна статье. ln — кредиты {id:[остаток, ставка, осталось мес., вид]}
const DT_KEEP=2;   // «из чего налог» (rep.tx) сохраняем в 2 последних отчётах (размер сейва); подробности строк — в памяти, во всех отчётах этой игры
function balDt(W){const b=bal(W),o={inv:{},rec:{},cip:{},fa:{},lic:{},jv:{},lend:{},re:{}},ad=(k,t,v)=>{v=rnd0(v);if(v)o[k][t]=(o[k][t]||0)+v;};
  for(const r of REG)for(const g of GL)ad('inv','i.'+r+'.'+g,W.inv[r][g].v);for(const x of W.tr)ad('inv','tr.'+x.g,x.v);
  for(const x of W.obj){if(x.st==='b')ad('cip',x.id,x.paid);else ad('fa',x.id,x.g-x.dp);if(x.up)ad('cip',x.id,x.up.paid);}
  ad('fa','wag',W.wag.g-W.wag.dep);for(const r of REG)for(const p of W.plots[r])if(p.own==='you'&&p.lic)ad('lic',p.id,p.lic.g-p.lic.am);
  for(const x of W.biz||[]){if(x.st==='b')ad('cip',x.id,x.paid);else ad('fa',x.id,x.g-x.dp);ad('inv',x.id,x.stk||0);}
  if(W.me){ad('inv','resale',W.me.stk||0);for(const k in W.me.eq||{}){const q=W.me.eq[k];ad('fa','eq.'+k,q.g-q.dp);}}
  for(const p of W.opi||[])if(p.own==='you'&&p.lic)ad('lic',p.id,p.lic.g-p.lic.am);
  for(const x of W.rec||[])ad('rec','rec',x.a);
  const F=W.fr;if(F&&F.v){for(const j of F.jv||[])ad('jv',j.id,j.inv);for(const x of F.ln||[])ad('lend',x.id,x.a);}
  for(const x of Array.isArray(W.re)?W.re:[])ad('re',x.id,x.g-x.dp);
  for(const k in o){let s=0;for(const t in o[k])s+=o[k][t];const d=rnd0((b[k]||0)-s);if(d)o[k]._=(o[k]._||0)+d;}
  const ln={};for(const l of W.loans)ln[l.id]=[l.a,Math.round(l.r*1e4)/1e4,l.n,l.k+(l.mfo?'m':l.card?'c':l.san?'s':'')];o.ln=ln;return o;}
// в отчёт месяца: dt (строки БДР/ДДС по тегам), tx (налог), bd (баланс по активам), nm (что было у проданных/закрытых за месяц: id → вид)
function dtRep(W,M,rep){const d=M.dt||dtNew(M),nm={},live={};for(const x of W.obj)live[x.id]=1;for(const x of W.biz||[])live[x.id]=1;for(const x of Array.isArray(W.re)?W.re:[])live[x.id]=1;
  for(const s of ['p','c'])for(const k in d[s]){const r=d[s][k];for(const t in r){if(!r[t])delete r[t];else if(!live[t]&&M.nm&&M.nm[t])nm[t]=M.nm[t];}if(!Object.keys(r).length)delete d[s][k];}
  hid(rep,'dt',d);hid(rep,'bd',balDt(W));if(Object.keys(nm).length)hid(rep,'nm',nm);if(M.tx)rep.tx=M.tx;}
// перед продажей/сносом точки или объекта модуль может сказать, чем это было (иначе в отчёте — «продано»): ECON.dtName(W,id,'kiosk.kuz')
function dtName(W,id,v){const M=W.mon;(M.nm||hid(M,'nm',{}))[id]=v;}
function debtOf(W){let d=0;for(const l of W.loans)d+=l.a;return d;}

/* ---------------- рынок ---------------- */
function price(W,r,g){return rnd0(GOODS[g].p*REGS[r].k[g]*W.mk[g].i);}
function sellPrice(W,r,g,q){return price(W,r,g)*(1-.1*q/W.mk[g].V)*(boostOn(W)?1+BOOST_K:1);}
function buyPrice(W,r,g,q){return price(W,r,g)*1.06*(1+.1*q/W.mk[g].V);}
function mkSupply(W,g,q){const M=W.mk[g];M.s30+=q;M.i=clamp(M.i-.15*q/M.V,.5,1.7);}
// продать q со склада региона r: ₽ выручки; how — 'spot' (игрок), 'auto' (автопродажа), 'c' (контракт, цена задана)
function sell(W,r,g,q,cp){const s=W.inv[r][g];q=Math.min(q,s.q);if(q<=1e-6)return 0;
  const p=cp||sellPrice(W,r,g,q),rev=rnd0(p*q),cost=invTake(W,r,g,q);
  // продажа уменьшает «свою продукцию» в той доле, в какой она есть в общем запасе товара
  {let tot=0;for(const rr of REG)tot+=W.inv[rr][g].q+q*(rr===r?1:0);const ow=W.own[g]||0;W.own[g]=Math.max(0,ow-(cp?q:q*Math.min(1,ow/Math.max(1e-9,tot))));}
  const t0=tg('g.'+g);recv(W,rev,'sales');pl(W,'rev',rev);pl(W,'cogs',cost);tg(t0);W.mon.cg[g]=(W.mon.cg[g]||0)+cost;W.mon.sold[g]=(W.mon.sold[g]||0)+q;W.mon.rev[g]=(W.mon.rev[g]||0)+rev;W.stat.sold+=rev;
  mkSupply(W,g,q);return rev;}
function buy(W,r,g,q){if(q<=0)return 0;const p=buyPrice(W,r,g,q),c=rnd0(p*q);if(c>W.cash)return 0;
  const t0=tg('g.'+g);pay(W,c,'supp');tg(t0);invAdd(W,r,g,q,c);W.mon.bought[g]=(W.mon.bought[g]||0)+q;const M=W.mk[g];M.s30-=q;M.i=clamp(M.i+.15*q/M.V,.5,1.7);return c;}
function cycle(W,g){const m=W.m,mo=m%12;let c=0;
  if(g==='steel'||g==='roll'||g==='pig')c=.07*Math.sin(2*Math.PI*m/40+1);
  else if(g==='lumber'||g==='wood')c=.06*Math.sin(2*Math.PI*m/36+2);
  else if(g==='coal')c=(mo===11||mo<2)?.05:mo>=5&&mo<=7?-.03:0;
  else if(g==='ore')c=.05*Math.sin(2*Math.PI*m/40+1.4);
  else if(g==='cu'||g==='wire'||g==='cucon'||g==='cuore')c=.09*Math.sin(2*Math.PI*m/30+.5);
  return c;}
function mkDay(W){for(const g of GL){const M=W.mk[g];
    M.s30=M.s30*(29/30)+(W.bs[g]||0)/DAYS-(W.bd[g]||0)/DAYS;
    M.tg=clamp((1+M.sh+cycle(W,g))*(1-.8*(M.s30/M.V-M.p0)),.55,1.6);
    M.i=clamp(M.i+.05*(M.tg-M.i)+GOODS[g].s*RN(W),.5,1.7);}}

/* ---------------- участки, разведка, торги ---------------- */
function mineCap(O,dep){return O.cap;}
// оценка участка «по-бухгалтерски»: годовая EBITDA разреза по средней цене минус половина стройки
function depVal(W,r,dep){if(!dep)return 0;const O=OBJ[MINE_OF[dep.g]],m=GOODS[dep.g].p*REGS[r].k[dep.g]-dep.vc,E=(m*O.cap-O.fix)*(1-TAX);
  const n=Math.min(120,dep.res/O.cap),i=(W.key+.06)/12,af=(1-Math.pow(1+i,-n))/i;return Math.max(3e6,E*af-O.capex*dep.cm);}
function depValOld(W,r,dep){if(!dep)return 0;const O=OBJ[MINE_OF[dep.g]],m=GOODS[dep.g].p*REGS[r].k[dep.g]-dep.vc,E=m*O.cap-O.fix;
  return Math.max(3e6,E*12-O.capex*dep.cm*.5);}
function explCost(W,r){return rnd0(REGS[r].ex*(1-.1*W.rep)*(1-.15*pkL(W,'geo')));}
function explDays(W){return Math.max(6,Math.round(EXPL_DAYS*(1-.1*W.rep)*(1-.1*pkL(W,'geo'))));}
function plotById(W,id){for(const r of REG)for(const p of W.plots[r])if(p.id===id)return p;return null;}
function explore(W,pid,fast,free){const p=plotById(W,pid);if(!p||p.st!=='hid')return 'no';const c=free?0:explCost(W,p.r);if(W.cash<c)return 'cash';
  if(W.obj.length===0&&!W.ach.expl&&p.tut)fast=fast||6;
  if(c){const t0=tg(p.id);pay(W,c,'expl');pl(W,'expl',c);tg(t0);}p.st='exp';p.left=fast===true?0:fast||explDays(W);p.ec=c;W.stat.expl++;if(p.left<=0)explDone(W,p);return 'ok';}
function explDone(W,p){p.left=0;if(!p.dep){p.st='empty';news(W,'empty',{p:p.id,r:p.r});return;}
  p.st='found';news(W,'found',{p:p.id,r:p.r,g:p.dep.g});W.ach.expl=1;
  if(p.tut&&!W.ach.lic){p.direct=rnd0(depVal(W,p.r,p.dep)*.1/1e6)*1e6;return;}
  auction(W,p,'you');}
function auction(W,p,finder){const V=depVal(W,p.r,p.dep),a={id:'a'+(W.nid++),p:p.id,r:p.r,g:p.dep.g,V,st:rnd0(V*.1/1e6)*1e6||1e6,
    step:Math.max(1e6,rnd0(V*.04/1e6)*1e6),end:W.t+(W.n5?15:AUC_DAYS),finder,bots:[],pr:0,lead:null,you:false,done:false};
  a.pr=a.st;
  for(const b of W.bots){const d=BOTS.find(x=>x.id===b.id),cnt=b.as.length;if(cnt>=d.max+Math.floor(W.m/24))continue;
    let f=d.f*(d.like.indexOf(p.dep.g)>=0?1:.45)*(d.reg.indexOf(p.r)>=0?1:.7)*RR(W,.8,1.2);
    const room=b.cash+Math.max(0,botLimit(W,b)-b.debt)-OBJ[MINE_OF[p.dep.g]].capex*p.dep.cm;
    if(R(W)<.25&&finder!==b.id)continue; // не заметил
    const mx=Math.min(V*f,room);if(mx>=a.st)a.bots.push({id:b.id,mx:rnd0(mx)});}
  p.st='auc';p.auc=a.id;W.auc.push(a);news(W,'auction',{a:a.id,p:p.id,r:p.r,g:p.dep.g,finder});return a;}
function aucById(W,id){return W.auc.find(a=>a.id===id);}
// игрок вступает / поднимает цену: лидер — вы; боты отвечают по одному (сильнейший), пока их предел выше
function bidRaise(W,id){const a=aucById(W,id);if(!a||a.done)return null;
  const np=a.lead?a.pr+a.step:a.pr;if(W.cash<np)return 'cash';
  a.pr=np;a.lead='you';a.you=true;
  const alive=a.bots.filter(b=>b.mx>=a.pr+a.step).sort((x,y)=>y.mx-x.mx);
  if(alive.length){a.pr+=a.step;a.lead=alive[0].id;a.last=alive[0].id;return 'bot';}
  return aucWin(W,a,'you');}
function bidPass(W,id){const a=aucById(W,id);if(!a||a.done)return null;
  if(a.lead==='you')return aucWin(W,a,'you');
  const alive=a.bots.filter(b=>b.mx>=a.pr).sort((x,y)=>y.mx-x.mx);
  if(!alive.length){aucClose(W,a,null);return 'none';}
  return aucWin(W,a,alive[0].id);}
// без участия игрока: побеждает бот с большим пределом по цене второго (английский аукцион)
function aucAuto(W,a){const s=a.bots.slice().sort((x,y)=>y.mx-x.mx);if(a.lead==='you'&&W.cash<a.pr){a.lead=null;a.pr=Math.max(a.st,a.pr-a.step);}if(a.lead==='you'){const al=s.filter(b=>b.mx>=a.pr+a.step);if(al.length)return aucWin(W,Object.assign(a,{pr:a.pr+a.step}),al[0].id);return aucWin(W,a,'you');}
  if(!s.length){aucClose(W,a,null);return 'none';}
  a.pr=Math.max(a.pr,s[1]?Math.min(s[0].mx,s[1].mx+a.step):a.st);return aucWin(W,a,s[0].id);}
function aucWin(W,a,who){const p=plotById(W,a.p);
  if(who==='you'){if(W.cash<a.pr){return 'cash';}const t0=tg(p.id);pay(W,a.pr,'lic');tg(t0);p.lic={g:a.pr,am:0};p.own='you';p.st='lic';W.ach.lic=1;news(W,'won',{p:p.id,r:p.r,g:p.dep.g,pr:a.pr});}
  else{const b=W.bots.find(x=>x.id===who);b.cash-=a.pr;p.own=who;p.st='lic';news(W,'lost',{p:p.id,r:p.r,g:p.dep.g,pr:a.pr,b:who});
    // возмещение затрат на геологоразведку первооткрывателю
    if(a.finder==='you'&&p.ec){const t0=tg(p.id);recv(W,p.ec,'oth');pl(W,'oth',p.ec);tg(t0);news(W,'reimb',{p:p.id,c:p.ec});}
    else if(a.finder&&a.finder!=='you'&&a.finder!==who){const f=W.bots.find(x=>x.id===a.finder);if(f)f.cash+=REGS[p.r].ex;}}
  a.done=true;a.win=who;W.auc=W.auc.filter(x=>x!==a);return who==='you'?'won':'lost';}
function aucClose(W,a,who){const p=plotById(W,a.p);a.done=true;W.auc=W.auc.filter(x=>x!==a);
  // никто не пришёл: первооткрыватель получает лицензию по стартовой цене, если хочет (игрок — кнопкой; бот — сам)
  if(a.finder==='you'){p.st='found';p.direct=a.st;news(W,'nobid',{p:p.id});}
  else{p.st='found';p.direct=a.st;}}
function buyDirect(W,pid){const p=plotById(W,pid);if(!p||p.st!=='found'||!p.direct)return 'no';if(W.cash<p.direct)return 'cash';
  const t0=tg(p.id);pay(W,p.direct,'lic');tg(t0);p.lic={g:p.direct,am:0};p.own='you';p.st='lic';W.ach.lic=1;news(W,'won',{p:p.id,r:p.r,g:p.dep.g,pr:p.direct});delete p.direct;return 'ok';}
function passDirect(W,pid){const p=plotById(W,pid);if(!p||p.st!=='found')return;delete p.direct;auction(W,p,null);}

/* ---------------- стройка ---------------- */
function capexOf(W,t,r,pid){const O=OBJ[t];let c=O.capex;if(O.dep){const p=plotById(W,pid);c*=p&&p.dep?p.dep.cm:1;}return rnd0(c);}
function canBuild(W,t,r,pid){const O=OBJ[t];if(!O)return 'no';
  if(O.dep){const p=plotById(W,pid);if(!p||p.own!=='you'||p.st!=='lic'||p.dep.g!==O.dep||W.obj.some(o=>o.plot===pid))return 'plot';}
  const c=capexOf(W,t,r,pid);if(W.cash<c*.2)return 'cash';return 'ok';}
function build(W,t,r,pid){const ok=canBuild(W,t,r,pid);if(ok!=='ok')return ok;const O=OBJ[t],p=pid?plotById(W,pid):null;
  let mo=O.mo;if(W.tut&&t==='coalpit'&&!W.obj.length)mo=1; // первый разрез — по упрощённой схеме
  const bd=Math.max(DAYS,Math.round(mo*DAYS*(1-.1*pkL(W,'brig'))));
  const o={id:'o'+(W.nid++),t,r,plot:pid||null,st:'b',cost:capexOf(W,t,r,pid),paid:0,left:bd,tot:bd,g:0,dp:0,lv:0,vc:p&&p.dep?p.dep.vc:(O.vc||0),sp:0};
  W.obj.push(o);if(O.in&&pkL(W,'vert'))applyPerks(W);W.stat.built++;news(W,'build',{o:o.id,t,r});return 'ok';}
function upCost(W,o){return rnd0(OBJ[o.t].capex*UP_COST*(o.lv+1)*(o.plot?(plotById(W,o.plot).dep||{cm:1}).cm:1));}
function upgrade(W,oid){const o=W.obj.find(x=>x.id===oid);if(!o||o.st!=='w'||o.up||o.lv>=UP_MAX||o.t==='store')return 'no';const c=upCost(W,o);if(W.cash<c*.2)return 'cash';
  const mo=Math.ceil(OBJ[o.t].mo/2)+1;o.up={cost:c,paid:0,left:mo*DAYS,tot:mo*DAYS};news(W,'upgrade',{o:o.id,t:o.t,r:o.r});return 'ok';}
// кристаллы: ускорить стройку на 15 дней (один раз на объект), разведку — сразу
function speed(W,oid){const o=W.obj.find(x=>x.id===oid);if(!o)return 'no';const j=o.st==='b'?o:o.up;if(!j||o.sp>=1)return 'no';
  o.sp=(o.sp||0)+1;const cut=Math.min(15,j.left-1);j.left-=cut;return 'ok';}
function speedExpl(W,pid){const p=plotById(W,pid);if(!p||p.st!=='exp')return 'no';p.left=0;explDone(W,p);return 'ok';}
// платёж по стройке в день: равными долями; денег нет — стройка стоит (в минус из-за стройки не уходим)
function buildDay(W,j,o,off){const need=Math.max(0,Math.min(j.cost-j.paid,rnd0((j.cost-j.paid)/Math.max(1,j.left))));
  if(need>W.cash-duty(W)*(off?2:1)){j.halt=1;return false;}j.halt=0;const t0=tg(o.id);j.paid+=pay(W,need,'capex');tg(t0);j.left--;return true;}
// сколько денег нужно на обязательства ближайшего закрытия месяца: постоянные, офис, проценты и тело кредитов (стройка их не трогает)
function duty(W){let s=ADM0;for(const o of W.obj)if(o.st==='w'){s+=objFix(o)+ADM_OBJ;}for(const l of W.loans)s+=l.a*l.r/12+loanPay(l);const lr=W.reps[W.reps.length-1];if(lr)s+=lr.pl.tax;return s*1.2+10e6;}
/* M30: стройка без денег — общий план для глав 4–5 (решение владельца 02.10: Людмила не даёт начать то, на что не хватит, и предлагает проектный кредит).
   buildRest — неоплаченная стройка всех идущих объектов (недра W.obj и upgrade, карьеры/точки W.biz); buildFlow — свободные деньги в месяц ≈ (операционный поток
   за 3 закрытия − тело кредитов сейчас); buildPlan — хватит ли на эту стройку вместе с идущими; projLoan — проектный кредит (36 мес., тело — после стройки). */
function buildRest(W){let s=0;for(const o of W.obj||[]){if(o.st==='b')s+=Math.max(0,o.cost-o.paid);if(o.up)s+=Math.max(0,o.up.cost-o.up.paid);}
  for(const b of W.biz||[]){if(b.st==='b'&&b.tot&&b.cost>b.paid)s+=b.cost-b.paid;if(b.xu)s+=Math.max(0,b.xu.cost-b.xu.paid);}return rnd0(s);}
function buildRes(W){return W.ned||!root.ECON.bizDuty?duty(W):root.ECON.bizDuty(W);}
function buildFlow(W){const h=(W.reps||[]).slice(-3);if(!h.length)return 0;let o=0;for(const r of h)o+=sumCF(r.cf,'o')+(r.cf.drw||0);o/=h.length;let b=0;for(const l of W.loans)if(l.k!=='od')b+=loanPay(l);return rnd0(o-b);}
function buildLoanMax(W,cost){W._pjX=cost||0;let m=0;try{m=loanOffer(W).max;}finally{delete W._pjX;}return m;}
function buildPlan(W,cost,days){cost=rnd0(cost);days=Math.max(1,days|0);const mo=days/DAYS,rest=buildRest(W),res=rnd0(buildRes(W)),flow=buildFlow(W);
  const inflow=rnd0(Math.max(0,flow)*mo*.7),have=rnd0(W.cash-res+inflow),need=cost+rest,short=Math.max(0,need-have),up=rnd0(cost*.2);
  const loan=buildLoanMax(W,cost),ok=short<=0&&W.cash>=up;
  return {cost,days,mo,up,perDay:rnd0(cost/days),rest,need,cash:W.cash,res,flow,inflow,have,short:Math.max(short,ok?0:up-W.cash),loan,ok,kind:ok?'ok':loan>=Math.max(short,up-W.cash)?'loan':'no'};}
// сколько не хватает, чтобы достроить всё начатое (для карточки «стройка стоит»): null — ничего не стоит
function buildHalt(W){let h=0,left=0;for(const o of W.obj||[]){const j=o.st==='b'?o:o.up;if(j&&j.halt){h++;left=Math.max(left,j.left);}}
  for(const b of W.biz||[]){if(b.st==='b'&&b.halt){h++;left=Math.max(left,b.left);}if(b.xu&&b.xu.halt){h++;left=Math.max(left,b.xu.left);}}if(!h)return null;
  const rest=buildRest(W),res=rnd0(buildRes(W)),flow=buildFlow(W),have=rnd0(W.cash-res),short=Math.max(0,rest-Math.max(0,have));
  return {n:h,rest,res,have,flow,short,left,mo:flow>0?Math.ceil(short/flow):null,loan:loanOffer(W).max};}
// сумма проектного кредита под нехватку: +10 % запаса, вверх до 1 млн (недра) / 100 тыс. (малый бизнес), не больше лимита банка
function projLoanAmt(W,short,cost){const u=W.ned?1e6:1e5,m=cost?buildLoanMax(W,cost):loanOffer(W).max;return Math.min(Math.floor(m/loanUnit(W))*loanUnit(W),Math.ceil(short*1.1/u)*u);}
// проектный кредит: 36 мес., тело не платится стройку + 3 мес. (не больше 12); cost — под какую стройку (лимит банка учитывает 70 % её цены)
function projLoan(W,a,days,cost){if(cost)W._pjX=cost;let r;try{r=takeLoan(W,a,36,'ann',Math.min(12,Math.ceil((days||DAYS)/DAYS)+3));}finally{delete W._pjX;}if(r==='ok')W.loans[W.loans.length-1].pj=1;return r;}
function objCap(o){return OBJ[o.t].cap*(1+UP_CAP*o.lv);}
function objFix(o){return OBJ[o.t].fix*(1+UP_FIX*o.lv)*(o.off?.3:1)*(o.fk||1);}
function autoBuy(W,oid,on){const o=W.obj.find(x=>x.id===oid);if(o&&OBJ[o.t].in)o.ab=!!on;}
function mothball(W,oid,on){const o=W.obj.find(x=>x.id===oid);if(o&&o.st==='w'&&o.t!=='store'){o.off=!!on;news(W,on?'off':'on',{o:o.id,t:o.t,r:o.r});}}

/* ---------------- логистика ---------------- */
function km(a,b){if(a===b)return 0;return KM[[a,b].sort().join('-')]||3000;}
function transitDays(W,a,b){let d=Math.ceil(km(a,b)/650)+1;for(const e of W.ev)if(e.k==='flood'&&(e.r===a||e.r===b))d+=3;return d;}
function tariff(W,a,b){let t=250+1.05*km(a,b);for(const e of W.ev)if(e.k==='tariff')t*=1.05;return t*(1-.1*pkL(W,'logi'));}
function rentRate(W){let r=RENT;for(const e of W.ev)if(e.k==='wagons')r*=1.5;return r;}
function wagFree(W){let b=0;for(const x of W.wag.busy)b+=x.n;return Math.max(0,W.wag.n-b);}
function freightCost(W,a,b,q){const n=Math.ceil(q/WAG_T),own=Math.min(n,wagFree(W));const rented=q*Math.max(0,n-own)/n;return {c:rnd0(q*tariff(W,a,b)+rented*rentRate(W)),own};}
function ship(W,g,a,b,q){if(a===b)return 0;q=Math.min(q,W.inv[a][g].q);if(q<1)return 0;const fc=freightCost(W,a,b,q);
  if(fc.c>W.cash)return 0;const t0=tg('ship.'+g);pay(W,fc.c,'log');pl(W,'log',fc.c);tg(t0);const v=invTake(W,a,g,q),days=transitDays(W,a,b);
  W.tr.push({g,q,v,from:a,to:b,arr:W.t+days});if(fc.own)W.wag.busy.push({n:fc.own,ret:W.t+2*days});return q;}
function inbound(W,r,g){let s=0;for(const x of W.tr)if(x.to===r&&x.g===g)s+=x.q;return s;}
function addRoute(W,g,a,b,q){if(a===b||!(q>0))return 'no';const x=W.routes.find(z=>z.g===g&&z.from===a&&z.to===b);if(x){x.q=q;return 'ok';}
  W.routes.push({id:'r'+(W.nid++),g,from:a,to:b,q,acc:0});return 'ok';}
function delRoute(W,id){W.routes=W.routes.filter(z=>z.id!==id);}
function buyWagons(W,n){const c=n*WAG_COST;if(W.cash<c)return 'cash';const t0=tg('wag');pay(W,c,'wag');tg(t0);W.wag.n+=n;W.wag.g+=c;news(W,'wagons',{n});return 'ok';}

/* ---------------- кредиты ---------------- */
function ebitda3(W){const h=W.reps.slice(-3);if(!h.length)return 0;let s=0;for(const x of h)s+=ebitdaOf(x.pl);return s/h.length;}
function loanLimit(W){if(!W.ned&&root.ECON.bizLoanLimit)return root.ECON.bizLoanLimit(W);const e=Math.max(0,ebitda3(W))*12,eq=Math.max(0,equity(W));let pj=0;for(const o of W.obj){if(o.st==='b')pj+=o.cost-o.paid;if(o.up)pj+=o.up.cost-o.up.paid;}pj+=W._pjX||0;
  return Math.max(0,Math.min(Math.max(300e6,3.5*e)+.7*pj,1.5*eq));}
function loanRate(W){if(!W.ned&&root.ECON.bizLoanRate)return root.ECON.bizLoanRate(W);const e=Math.max(1,ebitda3(W)*12),lev=debtOf(W)/e;return clamp(W.key+.03+.01*Math.max(0,Math.min(5,lev-1))-.005*W.rep-.01*pkL(W,'bank'),.04,.4);}
function loanUnit(W){return W.ned?1e6:1e4;}
// лимит банка: ипотека (realty.js) и займы друзей (story.js) кредит бизнесу не уменьшают; поручительство Сони — лимит ×1,3, ставка −1 п. п.
function loanOffer(W){const g=root.ECON.storyGuar&&root.ECON.storyGuar(W);const lim=loanLimit(W)*(g?g.lim:1),u=loanUnit(W);let d=0;for(const l of W.loans)if(l.k!=='mort'&&l.k!=='fr')d+=l.a;
  const o={max:Math.max(0,(W.ned?rnd0:Math.floor)((lim-d)/u)*u),rate:loanRate(W)};if(g){o.rate=Math.max(.01,o.rate+g.dr);o.gu=1;}return o;}
function takeLoan(W,a,n,kind,grace){const o=loanOffer(W),u=loanUnit(W);a=Math.min(rnd0(a/u)*u,o.max);if(a<u)return 'limit';grace=Math.max(0,Math.min(12,grace|0,n-6));
  W.loans.push({id:'l'+(W.nid++),a,a0:a,r:o.rate,n,n0:n,k:kind==='eq'?'eq':'ann',gr:grace});if(o.gu&&root.ECON.storyGuarUse)root.ECON.storyGuarUse(W,W.loans[W.loans.length-1]);const t0=tg(W.loans[W.loans.length-1].id);recv(W,a,'loan');tg(t0);news(W,'loan',{a,r:o.rate,n});return 'ok';}
function repay(W,id,a){const l=W.loans.find(x=>x.id===id);if(!l)return 'no';a=Math.min(a,l.a,W.cash);if(a<=0)return 'cash';const t0=tg(l.id);pay(W,a,'repay');tg(t0);l.a-=a;if(l.a<=0)W.loans=W.loans.filter(x=>x!==l);return 'ok';}
function loanPay(l){const i=l.r/12;if(l.k==='od')return l.a;if(l.gr>0)return 0;if(l.k==='eq')return l.a/Math.max(1,l.n);if(l.n<=1)return l.a;return l.a*i/(1-Math.pow(1+i,-l.n))-l.a*i;}

/* ---------------- контракты ---------------- */
function mkOffer(W,g,urgent){let rb='ural',qb=-1;for(const r of REG)if(W.inv[r][g].q>qb){qb=W.inv[r][g].q;rb=r;}for(const o of W.obj)if(o.st==='w'&&OBJ[o.t].out===g){rb=o.r;break;}
  const base=price(W,rb,g);/* от цены на месте, где товар у игрока (контракт — франко-склад) */let q=0;const pr=(W.reps[W.reps.length-1]||{}).prod||{};q=Math.max(pr[g]||0,W.mon.prod[g]||0);
  if(urgent){q=Math.min(Math.max(q,W.own[g]||0),Math.max(q*.5,1000));}
  if(q<500)return null;const b=BUYERS[Math.floor(R(W)*BUYERS.length)];
  const days=urgent?DAYS:DAYS*(1+Math.floor(R(W)*3));q=Math.max(500,Math.round(q*RR(W,.5,1.4)*days/DAYS/500)*500);
  const o={id:'c'+(W.nid++),g,q,p:rnd0(base*(urgent?RR(W,1.06,1.09):RR(W,1.04,1.12))),days,pen:.2,b:b[0],be:b[1],exp:W.t+OFFER_DAYS,urg:!!urgent};
  W.offers.push(o);return o;}
function acceptOffer(W,id){const o=W.offers.find(x=>x.id===id);if(!o)return 'no';W.offers=W.offers.filter(x=>x!==o);
  W.cons.push(Object.assign(o,{end:W.t+o.days,done:0}));news(W,'contract',{g:o.g,q:o.q,p:o.p});return 'ok';}
function urgentOk(W){return !(W.urgM>=0&&W.m-W.urgM<3);}
function urgent(W){if(!urgentOk(W))return null;const gs=GL.filter(g=>(W.own[g]||0)>=500||(W.mon.prod[g]||0)>=500);if(!gs.length)return null;const o=mkOffer(W,gs[Math.floor(R(W)*gs.length)],true);if(o)W.urgM=W.m;return o;}

/* ---------------- резерв для заводов и маршрутов (автопродажа его не трогает) ---------------- */
function reserve(W,r,g){let s=0;for(const o of W.obj){const O=OBJ[o.t];if(o.r===r&&O.in&&O.in[g]&&o.st==='w'&&!o.off)s+=objCap(o)*O.in[g]/2;}
  for(const z of W.routes)if(z.from===r&&z.g===g)s+=z.q/3;return s;}

/* ---------------- день ---------------- */
function tick(W,off){const out=[];W.t++;W.d++;TG='';TS='';mkDay(W);
  // прибытие поездов, возврат вагонов
  const arr=W.tr.filter(x=>x.arr<=W.t);if(arr.length){for(const x of arr)invAdd(W,x.to,x.g,x.q,x.v);W.tr=W.tr.filter(x=>x.arr>W.t);}
  W.wag.busy=W.wag.busy.filter(x=>x.ret>W.t);
  // разведка
  for(const r of REG)for(const p of W.plots[r])if(p.st==='exp'&&--p.left<=0){explDone(W,p);out.push({k:'found',p:p.id});}
  // торги: срок вышел — решают без игрока
  for(const a of W.auc.slice())if(W.t>=a.end){const res=aucAuto(W,a);out.push({k:'auc',a:a.id,res});}
  // стройка и модернизация
  for(const o of W.obj){
    if(o.st==='b'){if(buildDay(W,o,o,off)&&o.left<=0){o.st='w';o.g=o.paid;o.paid=0;news(W,'built',{o:o.id,t:o.t,r:o.r});out.push({k:'built',o:o.id});W.ach['b_'+o.t]=1;}}
    else if(o.up){const j=o.up;if(buildDay(W,j,o,off)&&j.left<=0){o.g+=j.paid;o.lv++;delete o.up;news(W,'upgraded',{o:o.id,t:o.t,r:o.r,lv:o.lv});out.push({k:'upgraded',o:o.id});}}}
  // малый и средний бизнес, подработка (js/biz.js): заказы, точки, дневная выручка и затраты
  if(root.ECON.bizDay&&(!W.ned||W.biz.length))root.ECON.bizDay(W,off,out);
  TG='fr';if(root.ECON.storyDay)root.ECON.storyDay(W,off,out);
  TG='re';if(root.ECON.reDay)root.ECON.reDay(W,off,out);TG='';
  if(W.n5&&root.ECON.nedDay)root.ECON.nedDay(W,off,out);   // M30: глава 5 — события с выбором, доплаты (js/nedra.js)
  // автозакупка сырья для заводов (включается на заводе): держим запас на 3 дня, пока денег больше 20 млн
  for(const o of W.obj){const O=OBJ[o.t];if(!o.ab||!O.in||o.st!=='w'||o.off)continue;const d=objCap(o)/DAYS;
    for(const g in O.in){const need=d*O.in[g]*3-W.inv[o.r][g].q-inbound(W,o.r,g);if(need>d*O.in[g]*.5&&W.cash-buyPrice(W,o.r,g,need)*need>20e6)buy(W,o.r,g,need);}}
  // производство: сначала добыча, потом заводы по цепочке
  const order=['coalpit','orepit','limepit','logging','cupit','sawmill','furnace','steel','rolling','cuconc','smelter','wiremill'];
  for(const t of order)for(const o of W.obj){if(o.t!==t||o.st!=='w'||o.off)continue;const O=OBJ[t];o.why='';
    if(o.stop&&o.stop>W.t){o.why='acc';continue;}
    let q=objCap(o)/DAYS;const room=storR(W,o.r)-stockR(W,o.r);
    if(O.dep){const p=plotById(W,o.plot);q=Math.min(q,p.dep.res);if(p.dep.res<=0){o.why='empty';continue;}
      for(const e of W.ev)if(e.k==='flood'&&e.r===o.r&&o.t==='logging')q*=.5;
      if(room<q){q=Math.max(0,room);o.why='full';}
      if(q<=0)continue;const c=q*o.vc;p.dep.res-=q;TG=o.id;pay(W,c,'prod');TG='';invAdd(W,o.r,O.out,q,c);}
    else{let lim=q,short=null;for(const g in O.in){const can=W.inv[o.r][g].q/O.in[g];if(can<lim){lim=can;short=g;}}
      if(lim<q)o.why='in:'+short;q=Math.max(0,lim);
      if(q<=1e-6)continue;const c=q*o.vc;
      let v=0;for(const g in O.in)v+=invTake(W,o.r,g,q*O.in[g]);TG=o.id;pay(W,c,'prod');TG='';invAdd(W,o.r,O.out,q,v+c);}
    W.mon.prod[O.out]=(W.mon.prod[O.out]||0)+q;W.own[O.out]=(W.own[O.out]||0)+q;}
  // маршруты (каждый день — 1/30 месячного объёма; не хватает на складе — сколько есть)
  for(const z of W.routes){z.acc+=z.q/DAYS;const have=W.inv[z.from][z.g].q;const q=Math.min(z.acc,have);if(q>=Math.min(WAG_T,z.q/DAYS*.99)){const s=ship(W,z.g,z.from,z.to,q);z.acc-=s;}if(z.acc>z.q/3)z.acc=z.q/3;}
  // контракты: отгрузка из любых складов (сверх резерва заводов); M30 (W.n5): после срока не отгружаем, выполненный снимаем сразу
  for(const c of W.cons){if(c.done>=c.q)continue;if(W.n5&&W.t>=c.end)continue;for(const r of REG){const av=W.inv[r][c.g].q-reserve(W,r,c.g);if(av<=0)continue;
    const need=c.q-c.done;const q=Math.min(av,need,W.own[c.g]||0,Math.max(c.q/Math.max(1,c.days)*3,need/Math.max(1,c.end-W.t)));
    if(q>0){sell(W,r,c.g,q,c.p);c.done+=q;}}}
  if(W.n5)for(const c of W.cons.slice())if(c.done>=c.q-1){news(W,'cdone',{g:c.g,q:c.q});W.cons=W.cons.filter(x=>x!==c);}
  // автопродажа (офлайн — всё сверх резерва)
  for(const r of REG)for(const g of GL){if(!(off||W.auto[r][g]))continue;const s=W.inv[r][g].q;if(s<=0)continue;
    const q=s-reserve(W,r,g);if(q>1)sell(W,r,g,q);}
  // срок предложений
  W.offers=W.offers.filter(o=>o.exp>W.t);
  if(W.d>=DAYS){out.push({k:'close',rep:close(W,off)});}
  return out;}

/* ---------------- боты: помесячно ---------------- */
function botLimit(W,b){const e=Math.max(0,b.e3||0)*12;const d=BOTS.find(x=>x.id===b.id);return Math.max(100e6,d.lev*e);}
function botFlows(W){const s={},d={};for(const g of GL){s[g]=0;d[g]=0;}
  for(const b of W.bots)for(const a of b.as){if(a.b>0)continue;const O=OBJ[a.t];if(!O.out)continue;const q=objCap({t:a.t,lv:a.lv})*(a.idle?.4:.92);s[O.out]+=q;
    if(O.in)for(const g in O.in)d[g]+=q*O.in[g];}
  return {s,d};}
function botValue(W,b){let g=0;for(const a of b.as)g+=a.g;return b.cash+g-b.debt;}
function botMonth(W){for(const b of W.bots){const d=BOTS.find(x=>x.id===b.id);let e=0,dep=0;
    for(const a of b.as){const O=OBJ[a.t];
      if(a.b>0){const pay1=O.capex*(a.lv?UP_COST:1)/O.mo;b.cash-=pay1;a.b--;continue;}
      if(!O.out){e-=O.fix;continue;}
      const q=objCap({t:a.t,lv:a.lv})*.92;let pr=price(W,a.r,O.out),cost=a.vc;
      if(O.in)for(const g in O.in)cost+=O.in[g]*price(W,a.r,g)*1.03;
      const m=(pr-cost)*q-O.fix;a.idle=m<0&&O.in?1:0;e+=a.idle?(pr-cost)*q*.4-O.fix*.6:m;
      dep+=Math.min(a.g,a.g/O.life);a.g-=Math.min(a.g,a.g/O.life);}
    const int=b.debt*b.rate/12,ebt=e-dep-int,tax=ebt>0?ebt*TAX:0;b.cash+=e-int-tax;b.e3=((b.e3||e)*2+e)/3;
    // разведка
    for(const x of b.ex.slice()){if(--x.left<=0){b.ex=b.ex.filter(y=>y!==x);const p=plotById(W,x.p);if(!p||p.st!=='bex')continue;
      if(!p.dep){p.st='empty';continue;}p.st='found';auction(W,p,b.id);}}
    // решения
    const lim=botLimit(W,b),room=b.cash+Math.max(0,lim-b.debt),n=b.as.length,cap=d.max+Math.floor(W.m/24);
    // лицензия без рудника — строить
    for(const r of REG)for(const p of W.plots[r])if(p.own===b.id&&p.st==='lic'&&!b.as.some(a=>a.plot===p.id)&&p.dep){const t=MINE_OF[p.dep.g],c=OBJ[t].capex*p.dep.cm;
      if(room>c*.5){const a=botAsset(W,t,r,p,1);a.b=OBJ[t].mo;b.as.push(a);news(W,'botbuild',{b:b.id,t,r});}}
    if(n<cap&&room>150e6&&R(W)<d.ex&&b.ex.length<1){const rs=d.reg.filter(r=>W.plots[r].some(p=>p.st==='hid'&&!p.n5));if(rs.length){const r=rs[Math.floor(R(W)*rs.length)];   // M30: участки, открытые по ходу главы (n5), — подсказка геологов игроку, боты их не разведывают
        const cand=W.plots[r].filter(p=>p.st==='hid'&&!p.n5);const p=cand[Math.floor(R(W)*cand.length)];p.st='bex';b.cash-=REGS[r].ex;b.ex.push({p:p.id,left:1});}}
    // заводы: смелые и расчётливые — металлургия на Урале, Бобров — лесопилка в Карелии
    if(n<cap&&W.m>=6&&R(W)<(d.ch==='bold'?.18:d.ch==='calc'?.12:d.ch==='wood'?.1:.04)){
      const chain=d.ch==='wood'?['sawmill']:['furnace','steel','rolling'];const have=t=>b.as.filter(a=>a.t===t).length;
      let t=chain.find((x,i)=>i===0?have(x)<1+Math.floor(W.m/30):have(x)<have(chain[i-1]));
      if(t){const O=OBJ[t],r=d.ch==='wood'?'kar':'ural';let m=0;{let c=O.vc;for(const g in O.in)c+=O.in[g]*GOODS[g].p*REGS[r].k[g]*W.mk[g].i;m=(price(W,r,O.out)-c)*O.cap-O.fix;}
        if(m>0&&room>O.capex*.6){const a=botAsset(W,t,r,null,1);a.b=O.mo;b.as.push(a);news(W,'botbuild',{b:b.id,t,r});}}}
    // долги: не хватает — занять; лишнее — погасить; совсем плохо — продать актив (участок уходит на торги)
    if(b.cash<0){const take=Math.min(-b.cash+20e6,Math.max(0,lim-b.debt));b.debt+=take;b.cash+=take;
      if(b.cash<0&&b.as.length>1){const a=b.as.sort((x,y)=>x.g-y.g).shift();b.cash+=a.g*.6;news(W,'botsell',{b:b.id,t:a.t,r:a.r});
        if(a.plot){const p=plotById(W,a.plot);if(p){p.own=null;p.st='found';auction(W,p,null);}}}}
    else if(b.debt>0&&b.cash>400e6){const x=Math.min(b.debt,b.cash-300e6);b.debt-=x;b.cash-=x;}
    b.rate=W.key+.035;b.v.push(rnd0(botValue(W,b)/1e6));if(b.v.length>60)b.v.shift();}
  const f=botFlows(W);W.bs=f.s;W.bd=f.d;}

/* ---------------- события ---------------- */
const EVENTS=[
  {k:'steelup',w:3,g:['steel','roll','pig'],sh:.12,mo:3},{k:'steeldn',w:2,g:['steel','roll','pig'],sh:-.1,mo:3},
  {k:'buildup',w:2,g:['lumber','wood','lime'],sh:.12,mo:3},{k:'winter',w:2,g:['coal'],sh:.14,mo:2},
  {k:'export',w:2,g:['wood'],sh:-.12,mo:3},{k:'grid',w:2,g:['cu','wire','cucon','cuore'],sh:.14,mo:3},{k:'cudn',w:2,g:['cu','wire','cucon','cuore'],sh:-.13,mo:3},{k:'orecn',w:2,g:['ore'],sh:.1,mo:3},
  {k:'keyup',w:2},{k:'keydn',w:2},{k:'acc',w:2},{k:'flood',w:2,mo:1},{k:'tariff',w:1,mo:12},{k:'wagons',w:1,mo:2},{k:'plot',w:2}];
function event(W,off){if(R(W)>.3)return null;const tot=EVENTS.reduce((a,e)=>a+e.w,0);let x=R(W)*tot,E=null;for(const e of EVENTS){x-=e.w;if(x<0){E=e;break;}}if(!E)return null;
  const a={};
  if(E.g){for(const g of E.g){W.mk[g].sh=E.sh;W.mk[g].shT=W.m+E.mo;}}
  else if(E.k==='keyup')W.key=clamp(W.key+.015,.08,.24);
  else if(E.k==='keydn')W.key=clamp(W.key-.015,.08,.24);
  else if(E.k==='acc'){const ms=W.obj.filter(o=>o.st==='w'&&OBJ[o.t].dep&&!o.off);if(!ms.length)return null;const o=ms[Math.floor(R(W)*ms.length)];o.stop=W.t+10;
    const c=rnd0(o.g*.02);pay(W,c,'oth');pl(W,'oth',-c);a.o=o.id;a.t=o.t;a.r=o.r;a.c=c;}
  else if(E.k==='flood'){const r=R(W)<.5?'kar':'kuz';W.ev.push({k:'flood',r,until:W.m+1});a.r=r;}
  else if(E.k==='tariff'||E.k==='wagons')W.ev.push({k:E.k,until:W.m+E.mo});
  else if(E.k==='plot'){const rs=REG.filter(r=>W.plots[r].length<PLOTS_MAX);if(!rs.length)return null;const r=rs[Math.floor(R(W)*rs.length)];
    W.plots[r].push({id:r+W.plots[r].length,r,st:'hid',dep:newDeposit(W,r),own:null});a.r=r;}
  a.k=E.k;news(W,'ev',a);return a;}

/* ---------------- закрытие месяца ---------------- */
function close(W,off){const M=W.mon;TG='';TS='';const bz=!!root.ECON.bizClose&&(!W.ned||W.biz.length>0||W.rec.length>0);
  // точки, подработка, жизнь, дебиторка, кредитная история (js/biz.js) — до постоянных расходов и налога
  if(bz)root.ECON.bizClose(W,M,off);
  TG='fr';TS='';if(root.ECON.storyClose)root.ECON.storyClose(W,M,off);
  TG='re';if(root.ECON.reClose)root.ECON.reClose(W,M,off);TG='';
  // постоянные: объекты (законсервированные — 30 %), склады, офис, обслуживание вагонов
  let fix=0,nObj=0;for(const o of W.obj){if(o.st!=='w')continue;fix+=objFix(o);nObj++;}
  if(fix){TG='_of';pay(W,fix,'fix'),pl(W,'fix',fix);TG='';const pw={};for(const o of W.obj)if(o.st==='w')pw[o.id]=(pw[o.id]||0)+objFix(o);dtMove(W,'c','fix','_of',pw);dtMove(W,'p','fix','_of',pw);}
  if(W.ned){const adm=ADM0+ADM_OBJ*nObj;TG='office';pay(W,adm,'adm');pl(W,'adm',adm);TG='';}
  if(W.wag.n){const w=W.wag.n*WAG_FIX;TG='wag';pay(W,w,'log');pl(W,'log',w);TG='';}
  // амортизация ОС и лицензий
  let dp=0;const dw={};for(const o of W.obj){if(o.st!=='w')continue;const d=Math.min(o.g-o.dp,rnd0(o.g/OBJ[o.t].life));o.dp+=d;dp+=d;if(d)dw[o.id]=d;}
  {const d=Math.min(W.wag.g-W.wag.dep,rnd0(W.wag.g/WAG_LIFE));W.wag.dep+=d;dp+=d;if(d)dw.wag=d;}
  for(const r of REG)for(const p of W.plots[r])if(p.own==='you'&&p.lic){const d=Math.min(p.lic.g-p.lic.am,rnd0(p.lic.g/LIFE_LIC));p.lic.am+=d;dp+=d;if(d)dw[p.id]=d;}
  TG='_dp';pl(W,'dep',dp);TG='';dtMove(W,'p','dep','_dp',dw);
  // кредиты: проценты и тело по графику
  let od=false;for(const l of W.loans.slice()){TG=l.id;const i=rnd0(l.a*l.r/12);pay(W,i,'int');pl(W,'int',i);
    const pr=Math.min(l.a,rnd0(loanPay(l)));pay(W,pr,'repay');l.a-=pr;l.n--;if(l.gr>0)l.gr--;if(l.k==='od')od=true;if(l.a<=0||l.n<=0){if(l.a>0){pay(W,l.a,'repay');l.a=0;}}}
  TG='pen';W.loans=W.loans.filter(l=>l.a>0);
  // контракты: срок вышел — штраф 20 % от недопоставки
  for(const c of W.cons.slice())if(W.t>=c.end||c.done>=c.q){if(c.done<c.q-1){const pen=rnd0((c.q-c.done)*c.p*c.pen);pay(W,pen,'oth');pl(W,'oth',-pen);news(W,'penalty',{g:c.g,q:rnd0(c.q-c.done),pen});}
    else news(W,'cdone',{g:c.g,q:c.q});W.cons=W.cons.filter(x=>x!==c);}
  // санация (только при игроке): второй месяц подряд нужен овердрафт
  TG='san';let san=null;if(W.ned&&W.cash<0&&od&&W.odM>=2&&!off){const e=ebitda3(W)*12,dt=debtOf(W);if((e<=0||dt>4*e)&&dt>.25*Math.max(1,equity(W)))san=sanation(W);}
  // налог на прибыль: 25 %, убыток прошлых лет уменьшает базу не больше чем наполовину
  TG='tax';const p=M.pl,ebt=p.rev-p.cogs-p.fix-p.log-p.adm-p.expl-p.dep+p.oth-p.int;let tax=0;
  const lc0=W.lossCF;let use=0;if(ebt<0)W.lossCF+=-ebt;else if(ebt>0){use=Math.min(W.lossCF,ebt*LOSS_CAP);W.lossCF-=use;tax=rnd0((ebt-use)*TAX);}
  M.tx={k:'osno',ebt,lc0:rnd0(lc0),use:rnd0(use),lc1:rnd0(W.lossCF),b:rnd0(Math.max(0,ebt-use)),r:TAX,t:tax};   // M25: из чего налог (для раскрытия в отчёте)
  if(W.taxm&&W.taxm!=='osno'&&root.ECON.bizTax){tax=0;root.ECON.bizTax(W,M,ebt);}  // НПД / УСН — по своим правилам (js/biz.js)
  if(tax>0){pay(W,tax,'tax');pl(W,'tax',tax);}
  TG='od';
  // нет денег — овердрафт до следующего месяца (ключевая + 8 %)
  const odGive=()=>{const a=rnd0(-W.cash+(W.ned?5e6:Math.min(5e6,Math.max(1e4,-W.cash*.1))));W.loans.push({id:'l'+(W.nid++),a,a0:a,r:W.key+.08,n:1,n0:1,k:'od'});recv(W,a,'loan');news(W,'od',{a});};
  let odNow=false;if(W.cash<0){odGive();W.odM++;odNow=true;}else W.odM=0;
  TG='ev';
  // рынок и мир
  if(W.ned)botMonth(W);
  for(const g of GL){const Mk=W.mk[g];if(Mk.shT&&W.m>=Mk.shT){Mk.sh=0;Mk.shT=0;}Mk.V*=1.0025;Mk.ph.push(Math.round(Mk.i*1000)/1000);if(Mk.ph.length>24)Mk.ph.shift();}
  W.key=clamp(W.key+(R(W)<.15?(R(W)<.5?-.0025:.0025):0),.08,.24);
  W.ev=W.ev.filter(e=>e.until>W.m+1);
  const ev=W.ned?event(W,off):null;
  if(W.n5&&W.ned&&root.ECON.nedClose)root.ECON.nedClose(W,M,off);   // M30: новые участки, банкротство соперников, события с выбором (js/nedra.js)
  // M30: событие недр (авария и т. п.) списывается уже после овердрафта — не хватило, банк докладывает овердрафт (было: месяц закрывался с минусом на счёте)
  if(W.cash<0){TG='od';odGive();if(!odNow)W.odM++;TG='ev';}
  // предложения контрактов
  TG='';const gs=GL.filter(g=>(M.prod[g]||0)>=500);for(const g of gs)if(W.offers.length<3&&R(W)<.45)mkOffer(W,g,false);
  // отчёт
  const b=bal(W),net=netOf(p),cf={};for(const k in M.cf)cf[k]=M.cf[k];const sg=segsOf(W,M);
  const rep={m:W.m,pl:Object.assign({},p),cf,c0:M.c0,c1:W.cash,bal:{cash:b.cash,inv:b.inv,rec:b.rec,cip:b.cip,fa:b.fa,lic:b.lic,jv:b.jv,lend:b.lend,re:b.re,A:b.A,debt:b.debt,cap:b.cap,ret:b.ret+net,E:b.E,diff:b.diff},
    prod:Object.assign({},M.prod),sold:Object.assign({},M.sold),bought:Object.assign({},M.bought),revg:Object.assign({},M.rev),key:W.key,ev,san,off:!!off,sg,st:W.st};
  dtRep(W,M,rep);
  W.ret+=net;W.reps.push(rep);if(W.reps.length>13)W.reps.shift();for(let i=0;i<W.reps.length-DT_KEEP;i++)delete W.reps[i].tx;
  const px={};for(const g of GL)px[g]=Math.round(W.mk[g].i*1000)/1000;
  W.hist.push(W.ned?{m:W.m,rev:p.rev,np:net,e:ebitdaOf(p),cash:W.cash,eq:b.E,debt:b.debt,cfo:sumCF(cf,'o'),px}:{m:W.m,rev:p.rev,np:net,e:ebitdaOf(p),cash:W.cash,eq:b.E,debt:b.debt,cfo:sumCF(cf,'o')});if(W.hist.length>72)W.hist.shift();  // до «Недр» цены металлов в истории не нужны
  // достижения за год
  W.m++;W.d=0;W.mon=emptyMon(W);
  return rep;}
// сегменты месяца: {seg:{rev,e}} (e — EBITDA сегмента). Точки и подработка пишут в W.mon.sg сами (js/biz.js);
// недра — по товарам (выручка и себестоимость проданного) и постоянным расходам объектов; всё нераспределённое (офис, вагоны, разведка) — «Корпоративный центр» (hq).
// Сумма по сегментам всегда равна выручке и EBITDA месяца.
const SEG_G={coal:'mine',ore:'mine',lime:'mine',cuore:'copper',cucon:'copper',cu:'copper',wire:'copper',wood:'wood',lumber:'wood',pig:'steel',steel:'steel',roll:'steel'};
function segsOf(W,M){const o={};const add=(k,r,e)=>{const x=o[k]||(o[k]={rev:0,e:0});x.rev+=r;x.e+=e;};
  for(const k in M.sg)add(k,M.sg[k].rev||0,M.sg[k].e||0);
  for(const g in M.rev)add(SEG_G[g]||'hq',M.rev[g],M.rev[g]-(M.cg[g]||0));
  for(const ob of W.obj)if(ob.st==='w')add(OBJ[ob.t].seg||'hq',0,-objFix(ob));
  let rv=0,e=0;for(const k in o){rv+=o[k].rev;e+=o[k].e;}const p=M.pl;add('hq',p.rev-rv,ebitdaOf(p)-e);
  for(const k in o){o[k].rev=rnd0(o[k].rev);o[k].e=rnd0(o[k].e);if(!o[k].rev&&!o[k].e)delete o[k];}return o;}
const CFG={o:['sales','supp','prod','fix','log','adm','expl','oth','int','tax'],i:['capex','lic','wag','asale','jvin','div','lend'],f:['loan','repay','eqin','drw']};   // drw — личные покупки собственника (вещи героя, biz.js LUX)
function sumCF(cf,k){let s=0;for(const x of CFG[k])s+=cf[x]||0;return s;}
// санация: банк продаёт активы за 60 % балансовой стоимости (сначала стройки и вагоны, потом заводы, рудники — последними)
// и сводит долги в один кредит на 5 лет. Игра продолжается
function sanation(W){const sold=[];const need=()=>-W.cash+20e6;
  const bookOf=o=>o.st==='b'?o.paid:(o.g-o.dp)+(o.up?o.up.paid:0);
  const ord=W.obj.slice().sort((a,b)=>(a.st==='b'?0:OBJ[a.t].dep?2:1)-(b.st==='b'?0:OBJ[b.t].dep?2:1)||bookOf(a)-bookOf(b));
  if(W.wag.n&&W.cash<0){const bk=W.wag.g-W.wag.dep,pr=rnd0(bk*.6);recv(W,pr,'asale');pl(W,'oth',pr-bk);W.wag={n:0,g:0,dep:0,busy:[]};sold.push('wagons');}
  for(const o of ord){if(W.cash>=0&&W.obj.length<=1)break;if(W.cash>=0)break;const bk=bookOf(o);let lic=0;
    if(o.plot){const p=plotById(W,o.plot);if(p&&p.lic){lic=p.lic.g-p.lic.am;p.lic=null;}if(p){p.own=null;p.st='found';p.direct=0;}}
    const pr=rnd0((bk+lic)*.6);recv(W,pr,'asale');pl(W,'oth',pr-bk-lic);W.obj=W.obj.filter(x=>x!==o);sold.push(o.t);
    if(o.plot){const p=plotById(W,o.plot);if(p)auction(W,p,null);}}
  // долги — в один кредит на 60 месяцев
  let d=0;for(const l of W.loans)d+=l.a;const add=W.cash<0?rnd0(-W.cash+20e6):0;if(add)recv(W,add,'loan');
  W.loans=d+add>0?[{id:'l'+(W.nid++),a:d+add,a0:d+add,r:W.key+.02,n:60,n0:60,k:'ann',san:1}]:[];
  W.san++;W.odM=0;news(W,'san',{sold,debt:d+add});return {sold,debt:d+add};}

/* ---------------- показатели и советник ---------------- */
function metrics(W){const r=W.reps[W.reps.length-1];if(!r)return null;const p=r.pl,E=ebitdaOf(p),net=netOf(p);
  const h=W.reps.slice(-12);let e12=0,n12=0,eqA=0;for(const x of h){e12+=ebitdaOf(x.pl);n12+=netOf(x.pl);eqA+=x.bal.E;}eqA/=h.length||1;
  const ann=12/h.length,cogs=p.cogs||1;
  return {em:p.rev?E/p.rev:0,nm:p.rev?net/p.rev:0,roe:eqA>0?n12*ann/eqA:0,de:e12>0?r.bal.debt/(e12*ann):(r.bal.debt>0?99:0),icr:p.int?E/p.int:99,
    invd:r.bal.inv/(cogs/DAYS),e:E,net,e12:e12*ann,n12:n12*ann};}
// советы: коды с приоритетом; текст — в интерфейсе (по-русски и по-английски)
function advise(W){if(!W.ned)return root.ECON.bizAdvise?root.ECON.bizAdvise(W):[];const r=W.reps[W.reps.length-1],o=[];if(!r)return o;const p=r.pl,net=netOf(p),prev=W.reps[W.reps.length-2],mt=metrics(W);
  let debtPay=0;for(const l of W.loans)debtPay+=l.a*l.r/12+loanPay(l);
  const burn=Math.max(0,-(sumCF(r.cf,'o'))+debtPay);
  if(r.san)o.push({k:'san',pri:100});
  if(W.odM>0)o.push({k:'od',pri:95});
  if(burn>0&&W.cash<burn*2)o.push({k:'cash',pri:90,a:{n:Math.max(0,Math.floor(W.cash/Math.max(1,burn)))}});
  for(const rg of REG){const s=stockR(W,rg),c=storR(W,rg);if(s>c*.9)o.push({k:'full',pri:80,a:{r:rg}});}
  for(const ob of W.obj)if(ob.st==='w'&&ob.why&&ob.why.indexOf('in:')===0)o.push({k:'input',pri:75,a:{t:ob.t,r:ob.r,g:ob.why.slice(3)}});
  for(const ob of W.obj)if(ob.st==='w'&&!ob.off&&ob.why==='empty')o.push({k:'depleted',pri:70,a:{t:ob.t,r:ob.r}});
  for(const ob of W.obj)if((ob.st==='b'&&ob.halt)||(ob.up&&ob.up.halt))o.push({k:'halt',pri:72,a:{t:ob.t,r:ob.r}});
  for(const z of W.routes){const c=price(W,z.from,z.g)+tariff(W,z.from,z.to)+(wagFree(W)>0?0:rentRate(W));if(c>buyPrice(W,z.to,z.g,z.q)){o.push({k:'route',pri:68,a:{g:z.g,from:z.from,to:z.to}});break;}}
  if(mt&&mt.de>3.5&&debtOf(W)>0)o.push({k:'lev',pri:65,a:{x:mt.de}});
  for(const c of W.cons)if(c.done<c.q&&c.end-W.t<=DAYS&&c.done<c.q*.6)o.push({k:'cons',pri:60,a:{g:c.g}});
  if(W.auc.some(a=>!a.done&&a.finder!=='you'))o.push({k:'auc',pri:40});
  const plan=W.auc.find(a=>a.finder==='you');if(plan)o.push({k:'myauc',pri:85,a:{g:plan.g}});
  if(prev){const n0=netOf(prev.pl);if(net>0&&n0>0&&net>n0*1.15)o.push({k:'grow',pri:30,a:{x:net/n0-1}});
    if(net<0&&p.rev>0)o.push({k:'loss',pri:50});
    for(const g of ['steel','roll','pig','coal','ore','lumber','wood']){const ph=W.mk[g].ph;if(ph.length>=2){const d=ph[ph.length-1]/ph[ph.length-2]-1;if(Math.abs(d)>.06&&(r.prod[g]||0)>0)o.push({k:d>0?'up':'down',pri:45,a:{g,x:d}});}}}
  if(r.ev)o.push({k:'ev_'+r.ev.k,pri:55,a:r.ev});
  if(!W.obj.length&&W.m>=1)o.push({k:'idle',pri:60});
  if(W.cash>1e9&&W.obj.length&&!W.obj.some(x=>x.st==='b'||x.up))o.push({k:'lazy',pri:35});
  // честный совет про заводы: передел окупается 2+ года, рудник — около года; пока рудников мало и капитал меньше 2 млрд, завод тормозит рост
  {const mines=W.obj.filter(x=>OBJ[x.t]&&OBJ[x.t].dep).length,pb=W.obj.find(x=>x.st==='b'&&OBJ[x.t]&&OBJ[x.t].in&&x.t!=='sawmill');
    if(pb&&mines<3&&equity(W)<2e9)o.push({k:'plant',pri:42,a:{t:pb.t,n:mines}});}
  if(net>0)o.push({k:'ok',pri:10});else o.push({k:'meh',pri:9});
  o.sort((a,b)=>b.pri-a.pri);return o;}

/* ---------------- IPO и итоги офлайна ---------------- */
const IPO_EQ=2.2e9;
function ipoReady(W){const h=W.hist.slice(-12);return equity(W)>=ipoEq(W)&&h.length>=12&&h.reduce((a,x)=>a+x.np,0)>0;}
function snap(W){const b=bal(W);return {t:W.t,m:W.m,cash:W.cash,eq:b.E,debt:b.debt,sold:W.stat.sold};}
// офлайн: автопилот days дней — производит и продаёт всё сверх нужд заводов, новых решений нет, кредитов не берёт (только овердрафт)
function offline(W,days){const s0=snap(W),prod={},sold={},ev=[],built=[],sg={};let closes=0,rev=0,np=0,gigs=0,gigNet=0;
  for(let i=0;i<days;i++){const out=tick(W,true);for(const e of out){if(e.k==='close'){closes++;rev+=e.rep.pl.rev;np+=netOf(e.rep.pl);for(const g in e.rep.prod)prod[g]=(prod[g]||0)+e.rep.prod[g];for(const g in e.rep.sold)sold[g]=(sold[g]||0)+e.rep.sold[g];if(e.rep.ev)ev.push(e.rep.ev);
        for(const k in e.rep.sg||{}){const x=sg[k]||(sg[k]={rev:0,e:0});x.rev+=e.rep.sg[k].rev;x.e+=e.rep.sg[k].e;}}
      else if(e.k==='built'||e.k==='upgraded'||e.k==='bizopen')built.push(e.o||e.id);else if(e.k==='gig'){gigs++;gigNet+=e.net||0;}}}
  // предложения, торги за время отсутствия: торги решились без игрока (это видно в новостях)
  const s1=snap(W);rev=s1.sold-s0.sold;np=s1.eq-s0.eq;return {days,months:closes,prod,sold,rev,np,ev,built,sg,gigs,gigNet,cash0:s0.cash,cash1:s1.cash,eq0:s0.eq,eq1:s1.eq,debt0:s0.debt,debt1:s1.debt,auc:W.news.filter(n=>n.t>s0.t&&(n.k==='lost'||n.k==='won'||n.k==='nobid'))};}

root.ECON={FMT_V,buildRes,buildRest,buildFlow,buildPlan,buildHalt,projLoanAmt,projLoan,migrate,initNedra,segsOf,SEG_G,loanUnit,ownQ:(W,g)=>W.own[g]||0,SEGS,DAYS,TAX,REGS,REG,GOODS,GL,OBJ,MINE_OF,BOTS,KM,WAG_T,WAG_COST,STOR0,UP_MAX,IPO_EQ,CFG,EVENTS,
  newWorld,tick,close,bal,check,equity,debtOf,price,sellPrice,buyPrice,sell,buy,explore,explCost,explDays,depVal,plotById,
  aucById,bidRaise,bidPass,buyDirect,passDirect,build,canBuild,capexOf,upgrade,upCost,speed,speedExpl,mothball,autoBuy,inbound,objCap,objFix,
  km,transitDays,tariff,rentRate,wagFree,freightCost,ship,addRoute,delRoute,buyWagons,
  loanOffer,loanLimit,loanRate,takeLoan,repay,loanPay,ebitda3,duty,acceptOffer,urgent,urgentOk,reserve,stockR,storR,
  netOf,ebitdaOf,sumCF,metrics,advise,botValue,ipoReady,offline,snap,R,
  PERKS,pkL,legacy,applyPerks,IPO_BAR,ipoEq,BOOST_K,BOOST_D,BOOST_GAP,boostOn,boostOk,boost,boostD,
  tg,ts,dtMove,balDt,dtName,DT_KEEP,dtOf:W=>W.mon.dt||dtNew(W.mon),
  _:{pay,recv,pl,news,R,RR,RN,pick,rnd0,clamp,invAdd,invTake,emptyMon,objFix,ebitda3}};
// E.IPO_EQ — планка текущего мира (интерфейс берёт её как число); без игры (симулятор) — базовая 2,2 млрд
Object.defineProperty(root.ECON,'IPO_EQ',{get(){const G=root.GAME;return ipoEq(G&&G.W);},enumerable:true,configurable:true});
})(typeof window!=='undefined'?window:this);
