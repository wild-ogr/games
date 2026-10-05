/* M25 — раскрытие строк отчётов (БДР, ДДС, баланс) и «Аналитика моих дел» (окно на паузе, как отчёты).
   Данные: rep.dt (строки БДР/ДДС по тегам «чьи деньги», js/econ.js — pay/recv/pl), rep.bd (баланс по активам), rep.tx (из чего налог), rep.nm (проданное за месяц).
   Подробности живут в памяти игры: после перезапуска — с первого закрытого после него месяца (старые отчёты — только итоги).
   API: window.FDT = {has(rep), det(rep,tag,key), rowHtml(rep,tag,key,val), recon(rep,prev), taxHtml(rep), openAn(tab), btnHtml()} — зовёт js/fin.js. */
(function(){
const E=window.ECON;if(!E||!E.tg){window.FDT=null;return;}
const Wd=()=>GAME.W;
const en=()=>typeof LANG!=='undefined'&&LANG==='en';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const T=a=>a?L(a[0],a[1]):'';
const M=x=>FMT.money(x);
const pn=(n,a,b,c,e1,e2)=>n+' '+pl(n,a,b,c,e1,e2);   // «3 месяца» (pl даёт только слово)
const sgn=x=>(x>0?'+':'')+FMT.money(x);
const snd=k=>{try{typeof SND!=='undefined'&&SND[k]&&SND[k]();}catch(e){}};

/* ---------------- имена тегов ---------------- */
const SEG={gig:['Подработка и зарплата','Side jobs & wage'],retail:['Розница и общепит','Retail & food'],serv:['Услуги','Services'],trade:['Опт и стройматериалы','Wholesale & building materials'],logi:['Грузоперевозки','Haulage'],
  quarry:['Карьеры','Quarries'],mine:['Добыча','Mining'],wood:['Лес','Timber'],steel:['Металлургия','Steel'],copper:['Медь','Copper'],infra:['Склады','Storage'],hq:['Общие расходы','Overheads'],re:['Недвижимость','Real estate']};
const NAMED={life:['Жизнь героя (еда, жильё, мелочи)','Living costs (food, rent, everyday)'],ipf:['Взносы ИП (пенсия и медицина)','Sole-trader contributions (pension, health)'],acc:['Бухгалтер ООО','LLC accountant'],
  job:['Зарплата на складе (основная работа)','Warehouse wage (main job)'],office:['Офис холдинга','Holding office'],wag:['Вагоны','Wagons'],fr:['Друзья: совместные дела, займы, подарки','Friends: joint ventures, loans, gifts'],
  re:['Недвижимость','Real estate'],own:['Маркетинг, события, дела хозяина','Marketing, events, owner errands'],pen:['Штрафы по контрактам','Contract penalties'],tax:['Налог','Tax'],od:['Овердрафт (нет денег на закрытии)','Overdraft (no cash at month end)'],
  ev:['События месяца','Events of the month'],san:['Санация: банк продал имущество','Restructuring: the bank sold assets'],eq:['Имущество для работы','Work equipment'],resale:['Товар для перепродажи','Stock for resale'],
  rec:['Нам должны покупатели (опт с отсрочкой)','Owed by buyers (wholesale on credit)'],_:['Прочее (без подробностей)','Other (no details)'],_rl:['Раньше в этом месяце — до перезапуска игры','Earlier this month — before the game restarted'],
  cash:['Деньги на счёте','Cash in the account']};
const ACT={bizOpen:['Открытие точек','Opening outlets'],vehAdd:['Покупка машин (газели опта, самосвалы базы)','Buying vehicles (wholesale vans, yard trucks)'],vehDel:['Продажа машин','Selling vehicles'],optUp:['Улучшения опта, стройбазы и ТК','Wholesale, yard and haulage upgrades'],vehTO:['ТО машин','Vehicle service'],ptUp:['Улучшения точек','Outlet upgrades'],ptUpAll:['Улучшения точек','Outlet upgrades'],ptUpAllMax:['Улучшения точек','Outlet upgrades'],mxAct:['Решения по делам (уборка, смены, помощники, акции)','Business decisions (cleaning, shifts, helpers, promos)'],pcTake:['Подряды стройбазы','Building-yard contracts'],fsTake:['Продажа точек федеральной сети','Selling outlets to a national chain'],breath:['Второе дыхание','Second wind'],mkRun:['Реклама и маркетинг','Advertising & marketing'],edStart:['Учёба героя','Owner’s courses'],
  stTrain:['Обучение персонала','Staff training'],jobStart:['Дела хозяина','Owner errands'],eqBuy:['Покупка вещей для работы','Buying work equipment'],cityOpen:['Выход в новый город','Opening a new city'],
  factor:['Факторинг: долги покупателей — сразу деньгами','Factoring: buyers’ debts turned into cash'],cardTake:['Кредитная карта','Credit card'],microLoan:['Микрозайм','Microloan'],takeLoan:['Кредит банка','Bank loan'],
  repay:['Досрочное погашение','Early repayment'],bizSell:['Продажа точек','Selling outlets'],bizKnob:['Смена настроек точки','Changing outlet settings'],bizAudit:['Ревизия кассы','Cash audit'],
  opiBid:['Торги за участок','Plot auction'],opiPass:['Торги за участок','Plot auction'],pitBuild:['Стройка карьера','Quarry construction'],regIP:['Регистрация ИП','Registering as sole trader'],regOOO:['Регистрация ООО','Registering an LLC'],
  build:['Стройка объектов','Construction'],upgrade:['Модернизация','Upgrades'],explore:['Разведка','Exploration'],buyDirect:['Лицензии на участки','Plot licences'],bidRaise:['Торги за участки','Plot auctions'],
  bidPass:['Торги за участки','Plot auctions'],sell:['Продажа товара','Selling goods'],buy:['Закупка товара','Buying goods'],buyWagons:['Покупка вагонов','Buying wagons'],ship:['Перевозки','Shipping'],
  reBuy:['Покупка недвижимости','Buying property'],reBuyOffer:['Покупка недвижимости','Buying property'],reSell:['Продажа недвижимости','Selling property'],jvExit:['Выход из совместного дела','Leaving a joint venture'],
  jvCreate:['Совместное дело с другом','Joint venture with a friend'],jvDiv:['Дивиденды совместного дела','Joint-venture dividends'],friendAnswer:['Друзья','Friends'],friendVisit:['Друзья','Friends'],evAns:['Решения по событиям','Decisions on events'],
  gigTake:['Заказы на подработке','Side-job orders'],urgentGig:['Срочный заказ','Urgent order'],dealChk:['Проверка сделки','Deal check'],acceptOffer:['Контракты','Contracts'],opdHire:['Операционный директор','Operations director'],
  bizMgr:['Управляющие','Managers'],taxSet:['Смена налога','Changing tax regime'],bizSpeed:['Ускорение стройки','Speeding up construction'],bizPromo:['Реклама точки','Outlet promotion'],mothball:['Консервация','Mothballing']};
const LOANK={ann:['Кредит банка','Bank loan'],eq:['Кредит банка','Bank loan'],od:['Овердрафт','Overdraft'],mort:['Ипотека','Mortgage'],fr:['Заём друга (без процентов)','Loan from a friend (interest-free)']};
function bizN(t){const B=E.BIZ&&E.BIZ[t];return B?(B.ico?B.ico+' ':'')+(en()?B.en:B.n):t;}
function cityN(c){try{return NM.reg(c);}catch(e){return c||'';}}
function ptOf(w,id,rep){const b=(w.biz||[]).find(x=>x.id===id);if(b)return {t:b.t,c:b.c,b};const v=rep&&rep.nm&&rep.nm[id];if(v){const [t,c]=v.split('.');return {t,c,gone:1};}return null;}
function ptName(w,id,rep){const p=ptOf(w,id,rep);if(!p)return L('Точка (уже продана)','Outlet (already sold)');
  let n='';if(p.b){const same=w.biz.filter(x=>x.t===p.t&&x.c===p.c);if(same.length>1)n=' №'+(same.indexOf(p.b)+1);}
  return bizN(p.t)+n+' · '+cityN(p.c)+(p.gone?' — '+L('продана','sold'):'');}
function objName(w,id,rep){const o=w.obj.find(x=>x.id===id);const v=!o&&rep&&rep.nm&&rep.nm[id];const t=o?o.t:v?v.split('.')[0]:null;if(!t)return L('Объект (уже продан)','Site (already sold)');
  return NM.obj(t)+' · '+NM.reg(o?o.r:v.split('.')[1])+(o?'':' — '+L('продан','sold'));}
function loanName(w,id,rep){const l=w.loans.find(x=>x.id===id),s=rep&&rep.bd&&rep.bd.ln&&rep.bd.ln[id];
  if(!l&&!s)return L('Кредит (погашен)','Loan (repaid)');const k=l?l.k:String(s[3]).replace(/[mcs]$/,''),r=l?l.r:s[1];
  const nm=l&&l.mfo||s&&/m$/.test(s[3])?L('Микрозайм','Microloan'):l&&l.card||s&&/c$/.test(s[3])?L('Кредитная карта','Credit card'):l&&l.san||s&&/s$/.test(s[3])?L('Кредит санации','Restructuring loan'):T(LOANK[k]||LOANK.ann);
  const n=l?l.n:s[2];return nm+(r>0?' · '+FMT.pct(r,1):'')+(n>1&&k!=='od'?' · '+L('ещё ','')+pn(n,'месяц','месяца','месяцев','month left','months left'):'');}
function reName(w,id){const o=Array.isArray(w.re)?w.re.find(x=>x.id===id):null;const C=E.RE_CLS&&o&&E.RE_CLS[o.cls];return C?(en()?C.en:C.n)+' · '+cityN(o.c):L('Недвижимость','Property');}
function plotName(w,id){let p=null;try{p=E.plotById(w,id);}catch(e){}if(p&&p.dep)return L('Участок','Plot')+': '+NM.good(p.dep.g)+' · '+NM.reg(p.r);
  const q=(w.opi||[]).find(x=>x.id===id);if(q)return L('Участок недр','Mineral plot')+(q.nm?' «'+esc(en()?q.nm[1]||q.nm[0]:q.nm[0])+'»':'')+' · '+(q.g==='sand'?L('песок','sand'):L('щебень','gravel'));return L('Участок','Plot');}
// тег → {g: ключ группы, gn: название группы, n: название строки}
function tagInfo(w,tag,rep){let m;
  if(NAMED[tag])return {g:tag,gn:T(NAMED[tag]),n:T(NAMED[tag])};
  if(/^z\d+$/.test(tag)){const p=ptOf(w,tag,rep);return {g:'bt.'+(p?p.t:'?'),gn:p?bizN(p.t):L('Проданные точки','Sold outlets'),n:ptName(w,tag,rep)};}
  if((m=/^m\.(z\d+)$/.exec(tag))){let sh=.3;try{sh=E.mgrSh(w);}catch(e){}return {g:'mgr',gn:L(`Управляющие (${Math.round(sh*100)} % прибыли точки)`,`Managers (${Math.round(sh*100)}% of outlet profit)`),n:ptName(w,m[1],rep)};}
  if(/^o\d+$/.test(tag)){const o=w.obj.find(x=>x.id===tag),v=rep&&rep.nm&&rep.nm[tag],t=o?o.t:v?v.split('.')[0]:'';return {g:'ot.'+t,gn:t?NM.obj(t):L('Объекты','Sites'),n:objName(w,tag,rep)};}
  if(/^l\d+$/.test(tag))return {g:'loan',gn:L('Кредиты и займы','Loans'),n:loanName(w,tag,rep)};
  if(/^h\d+$/.test(tag))return {g:'re',gn:L('Недвижимость','Real estate'),n:reName(w,tag)};
  if(/^(kuz|ural|kar)\d+$/.test(tag)||/^q\d+$/.test(tag))return {g:'plot',gn:L('Участки и лицензии','Plots & licences'),n:plotName(w,tag)};
  if(/^j\d+$/.test(tag))return {g:'jv',gn:L('Совместные дела с друзьями','Joint ventures with friends'),n:L('Совместное дело','Joint venture')+' '+tag.slice(1)};
  if(/^fl\d+$/.test(tag))return {g:'lend',gn:L('Займы друзьям','Loans to friends'),n:L('Заём другу','Loan to a friend')};
  if((m=/^g\.(\w+)$/.exec(tag)))return {g:'goods',gn:L('Товары','Goods'),n:NM.good(m[1])};
  if((m=/^ship\.(\w+)$/.exec(tag)))return {g:'ship',gn:L('Перевозки по железной дороге','Rail shipping'),n:NM.good(m[1])};
  if((m=/^tr\.(\w+)$/.exec(tag)))return {g:'tr',gn:L('Товар в пути','Goods in transit'),n:NM.good(m[1])};
  if((m=/^i\.(\w+)\.(\w+)$/.exec(tag)))return {g:'inv',gn:L('Склады недр','Mining warehouses'),n:NM.good(m[2])+' · '+NM.reg(m[1])};
  if((m=/^gig\.(\w+)$/.exec(tag))){const G=E.GIGS&&E.GIGS[m[1]];return {g:'gig',gn:L('Подработка (заказы)','Side jobs (orders)'),n:G?(G.ico?G.ico+' ':'')+(en()?G.en:G.n):m[1]};}
  if((m=/^opd\.(\w+)$/.exec(tag)))return {g:'opd',gn:L('Операционные директора сетей','Chain operations directors'),n:bizN(m[1])};
  if((m=/^eq\.(\w+)$/.exec(tag))){const q=E.EQ&&E.EQ[m[1]];return {g:'eq',gn:T(NAMED.eq),n:q?(q.ico||'')+' '+(en()?q.en:q.n):m[1]};}
  if((m=/^s\.(\w+)$/.exec(tag)))return {g:'s.'+m[1],gn:T(SEG[m[1]])||m[1],n:T(SEG[m[1]])||m[1]};
  if((m=/^a\.(\w+)(?:\.(.+))?$/.exec(tag))){const a=ACT[m[1]],gn=a?T(a):L('Ваши прочие действия','Your other actions');let n=gn;const x=m[2];
    if(x){if(/^z\d+$/.test(x))n=ptName(w,x,rep);else if(/^o\d+$/.test(x))n=objName(w,x,rep);else if(/^l\d+$/.test(x))n=loanName(w,x,rep);else if(/^h\d+$/.test(x))n=reName(w,x);
      else if(E.BIZ&&E.BIZ[x])n=bizN(x);else if(E.OBJ&&E.OBJ[x])n=NM.obj(x);else if(E.GOODS&&E.GOODS[x])n=NM.good(x);else if(/^(kuz|ural|kar)\d+$/.test(x)||/^q\d+$/.test(x))n=plotName(w,x);}
    return {g:'a.'+m[1],gn,n};}
  return {g:'_',gn:T(NAMED._),n:T(NAMED._)};}

/* ---------------- данные раскрытия ---------------- */
const PLS={rev:1,cogs:-1,fix:-1,log:-1,adm:-1,expl:-1,dep:-1,oth:1,int:-1,tax:-1,jv:1};
const PLC={marg:['rev','cogs'],ebitda:['rev','cogs','fix','log','adm','expl'],ebt:['rev','cogs','fix','log','adm','expl','dep','oth','int'],net:['rev','cogs','fix','log','adm','expl','dep','oth','int','tax','jv']};
function curDt(w){return w.mon?(E.dtOf?E.dtOf(w):w.mon.dt):null;}
function repDt(rep){const w=Wd();return rep.cur?curDt(w):rep.dt;}
function repBd(rep){const w=Wd();if(rep.cur)return E.balDt(w);return rep.bd;}
function has(rep){return !!(rep&&(rep.cur?true:rep.dt));}
function addTo(o,src,k){if(!src)return;for(const t in src)o[t]=(o[t]||0)+src[t]*k;}
// {тег: ₽} строки отчёта (знак — как в строке отчёта); null — подробностей нет
function det(rep,tag,key){const w=Wd();
  if(tag==='pl'){const d=repDt(rep);if(!d)return null;const o={};
    if(PLS[key])addTo(o,d.p[key],PLS[key]);else if(PLC[key])for(const k of PLC[key])addTo(o,d.p[k],PLS[k]);else return null;return o;}
  if(tag==='cf'){const d=repDt(rep);if(!d)return null;const o={};const sec=/^_([oif])$/.exec(key);
    if(sec)for(const k of E.CFG[sec[1]])addTo(o,d.c[k],1);else if(key==='_all')for(const s of ['o','i','f'])for(const k of E.CFG[s])addTo(o,d.c[k],1);
    else if(E.CFG.o.concat(E.CFG.i,E.CFG.f).indexOf(key)>=0)addTo(o,d.c[key],1);else return null;return o;}
  if(tag==='bs'){if(key==='cash')return {cash:rep.bal.cash};
    if(key==='cap'||key==='ret'||key==='E')return eqDet(w,rep,key);
    const bd=repBd(rep);if(!bd)return null;if(key==='debt'){const o={};for(const id in bd.ln)o[id]=bd.ln[id][0];return o;}
    if(bd[key])return Object.assign({},bd[key]);return null;}
  return null;}
// капитал: вложено (старт, партнёр) + накопленная прибыль по годам − личные покупки
function eqDet(w,rep,key){const b=rep.bal,o={};
  if(key==='cap'||key==='E'){const pa=w.partner&&w.partner.a||0;if(pa&&pa<=b.cap){o.$pa=pa;o.$st=b.cap-pa;}else o.$st=b.cap;}
  if(key==='ret'||key==='E'){let s=0;for(const h of w.hist||[])if(h.m<=rep.m&&(!rep.cur||h.m<rep.m)){const y='$y'+Math.floor(h.m/12);o[y]=(o[y]||0)+h.np;s+=h.np;}
    if(rep.cur){const c=E.netOf(w.mon.pl);if(c){o.$cur=c;s+=c;}}const r=Math.round(b.ret-s);if(r)o.$old=(o.$old||0)+r;}
  if(key==='E'&&b.drw)o.$drw=-b.drw;
  for(const k in o)if(!Math.round(o[k]))delete o[k];return o;}
const EQN={$pa:['Взнос партнёра (фонд «Сибирский капитал»)','Partner’s contribution (Siberian Capital fund)'],$st:['Вложено при старте','Paid in at the start'],$cur:['Прибыль этого месяца (пока идёт)','This month’s profit (still running)'],
  $old:['Раньше (прошлые холдинги, давние месяцы)','Earlier (past holdings, old months)'],$drw:['Изъято на личные покупки','Taken out for personal purchases']};
function eqInfo(t){if(EQN[t])return {g:t,gn:T(EQN[t]),n:T(EQN[t])};const y=+t.slice(2);const n=L('Прибыль за ','Profit in ')+(2027+y)+L(' год','');return {g:t,gn:n,n};}

// разбивка → группы [{g,gn,v,items:[{n,v,tag}]}] по убыванию
function groups(w,o,rep){const G={};for(const t in o){const v=Math.round(o[t]);if(!v)continue;const i=t.charAt(0)==='$'?eqInfo(t):tagInfo(w,t,rep);const g=G[i.g]||(G[i.g]={g:i.g,gn:i.gn,v:0,items:[]});g.v+=v;
    const same=g.items.find(x=>x.n===i.n);if(same)same.v+=v;else g.items.push({n:i.n,v,tag:t});}
  const a=Object.values(G).filter(g=>g.v||g.items.some(x=>x.v));for(const g of a)g.items.sort((x,y)=>Math.abs(y.v)-Math.abs(x.v));return a.sort((x,y)=>Math.abs(y.v)-Math.abs(x.v));}
function firstDt(w){for(const r of w.reps)if(r.dt)return r;return null;}

/* ---------------- вёрстка раскрытия под строкой ---------------- */
const MAXI=8;
function listHtml(w,o,total,rep,neg){const gs=groups(w,o,rep);if(!gs.length)return `<div class="dt-e">${L('В этом месяце по строке ничего не было.','Nothing on this line this month.')}</div>`;
  let s=0,h='<div class="dt-l">';for(const g of gs){s+=g.v;const one=g.items.length===1;
    h+=`<div class="dt-g"><span>${esc(one?g.items[0].n:g.gn)}${g.items.length>1?` <i>· ${g.items.length}</i>`:''}</span><b class="${g.v<0?'neg':''}">${sgnV(g.v,neg)}</b></div>`;
    if(!one){const it=g.items.slice(0,MAXI);for(const x of it)h+=`<div class="dt-i"><span>${esc(x.n)}</span><b class="${x.v<0?'neg':''}">${sgnV(x.v,neg)}</b></div>`;
      if(g.items.length>MAXI){let r=0;for(const x of g.items.slice(MAXI))r+=x.v;h+=`<div class="dt-i"><span>${L('ещё','more')} ${g.items.length-MAXI}</span><b>${sgnV(r,neg)}</b></div>`;}}}
  const ok=Math.round(s)===Math.round(total);
  h+=`<div class="dt-s ${ok?'ok':'bad'}"><span>${ok?'✓ '+L('Вместе — ровно строка','Together — exactly the line'):'⚠ '+L('Не сходится','Mismatch')}</span><b>${sgnV(s,neg)}</b></div></div>`;return h;}
const sgnV=(v,neg)=>FMT.money(v);
// подписи «что это» для строк (расширение «?»): ключ → [ru,en]
const WHAT={
  'pl:rev':['Все деньги за проданное за месяц: товар, услуги, заказы. Ниже — какая точка или товар сколько принёс.','All money for what was sold this month. Below — how much each outlet or product brought in.'],
  'pl:cogs':['Сколько стоил сам проданный товар: закупка, сырьё, добыча. Остаток на полках сюда не входит — он в «Запасах» баланса.','What the goods sold actually cost: purchases, materials, mining. Stock still on shelves is not here — it is in “Inventory”.'],
  'pl:fix':['Аренда, зарплаты продавцов и мастеров, доля управляющих, содержание объектов. Платим каждый месяц, даже когда продаж мало.','Rent, staff wages, managers’ share, site upkeep. Paid every month, even when sales are low.'],
  'pl:adm':['Расходы «на всё дело»: жизнь героя, взносы, бухгалтер, реклама, учёба, офис.','Costs of the whole business: living costs, contributions, accountant, advertising, courses, office.'],
  'pl:dep':['Износ: дорогая вещь (точка, завод, ноутбук) «списывается» частями каждый месяц. Денег при этом не уходит — они ушли при покупке.','Wear and tear: an expensive item is expensed bit by bit each month. No cash leaves now — it left at purchase.'],
  'pl:oth':['Разовые доходы и расходы: штрафы, поломки, подарки, продажа точек (плюс — если продали дороже, чем она числилась).','One-off income and costs: fines, breakdowns, gifts, selling outlets (a plus if sold above book value).'],
  'pl:tax':['Налог зависит от формы дела: самозанятый — 4 % с доходов, ИП на УСН — 6 % с доходов или 15 % с прибыли, ООО в «Недрах» — 25 % с прибыли. Ниже — расчёт этого месяца по шагам.','Tax depends on the business form: self-employed — 4% of income, sole trader on simplified tax — 6% of income or 15% of profit, LLC in “Mining” — 25% of profit. Below — this month’s calculation step by step.'],
  'pl:log':['Доставка товара: свои и наёмные грузовики, железная дорога, вагоны.','Delivery: own and hired trucks, rail, wagons.'],
  'pl:jv':['Ваша доля прибыли в совместных делах с друзьями. Налог с неё платит само дело.','Your share of profit in joint ventures with friends. The venture pays tax on it itself.'],
  'pl:int':['Плата банку за деньги в долг — по каждому кредиту.','What the bank charges for borrowed money — by loan.'],
  'pl:marg':['Выручка минус стоимость товара. Ниже — сколько оставляет каждая точка до аренды и зарплат.','Revenue minus cost of goods. Below — what each outlet keeps before rent and wages.'],
  'pl:ebitda':['Прибыль от самой работы, до износа, процентов и налога. Ниже — по делам: видно, какое дело кормит, а какое тянет вниз.','Profit from operations, before wear, interest and tax. Below — by business: which one feeds you and which drags you down.'],
  'pl:ebt':['С этой суммы считается налог (при УСН 6 % и НПД — с выручки).','Tax is calculated from this (for 6% simplified and self-employed — from revenue).'],
  'pl:net':['Что осталось после всех расходов и налога. Ниже — чистый вклад каждого дела.','What is left after all costs and tax. Below — each business’s net contribution.'],
  'cf:_o':['Деньги от обычной работы: продажи минус все текущие платежи.','Cash from ordinary operations: sales minus all running payments.'],
  'cf:_i':['Покупки на будущее: точки, улучшения, стройка, лицензии, недвижимость. Минус здесь — нормально, если вкладываете с умом.','Buying for the future: outlets, upgrades, construction, licences, property. A minus here is fine if you invest wisely.'],
  'cf:_f':['Деньги от банка и собственника: взяли кредит (+), вернули (−), личные покупки (−).','Money from the bank and the owner: borrowed (+), repaid (−), personal purchases (−).'],
  'cf:_all':['На сколько денег на счёте стало больше или меньше за месяц.','How much the cash in the account went up or down this month.'],
  'cf:sales':['Живые деньги от покупателей. Отличаются от выручки, если продали в долг (опт) или получили старый долг.','Actual cash from buyers. Differs from revenue when you sold on credit or collected an old debt.'],
  'cf:supp':['Закупка товара и сырья. Может быть больше себестоимости — значит, деньги ушли в запас на полках.','Buying goods and materials. Can exceed cost of goods — the money went into stock on the shelves.'],
  'cf:fix':['Аренда, зарплаты, доли управляющих — по точкам.','Rent, wages, managers’ shares — by outlet.'],
  'cf:capex':['Покупка точек и улучшений, платежи строителям.','Buying outlets and upgrades, payments to builders.'],
  'cf:asale':['Деньги за проданные точки и объекты.','Cash for outlets and sites sold.'],
  'cf:oth':['Разовые платежи: штрафы, поломки, подарки, выигрыши.','One-off payments: fines, breakdowns, gifts, winnings.'],
  'cf:tax':['Налог, который ушёл с расчётного счёта в этом месяце.','Tax paid from the account this month.'],
  'cf:int':['Проценты банку — по каждому кредиту.','Interest to the bank — by loan.'],
  'cf:adm':['Жизнь героя, взносы, бухгалтер, реклама, учёба, офис.','Living costs, contributions, accountant, advertising, courses, office.'],
  'cf:lic':['Покупка лицензий на участки.','Buying plot licences.'],
  'cf:eqin':['Деньги, которые собственники вложили в уставный капитал.','Money the owners put into share capital.'],
  'cf:jvin':['Вложили в совместное дело с другом (минус) или вышли из него (плюс).','Put into a joint venture (minus) or left it (plus).'],
  'cf:div':['Дивиденды от совместных дел.','Dividends from joint ventures.'],
  'cf:lend':['Дали взаймы другу (минус) или он вернул (плюс).','Lent to a friend (minus) or got it back (plus).'],
  'bs:rec':['Опт с отсрочкой: товар отдали, деньги придут позже. Часть долгов может не вернуться.','Wholesale on credit: goods delivered, cash comes later. Some debts may not come back.'],
  'bs:re':['Квартиры и помещения — по цене покупки минус износ.','Flats and premises — at cost minus wear.'],
  'bs:jv':['Сколько вложено в совместные дела с друзьями.','What you have put into joint ventures with friends.'],
  'bs:lend':['Сколько друзья вам должны.','What friends owe you.'],
  'bs:ret':['Вся прибыль, которую дело заработало и не вывело. Ниже — по годам.','All profit the business earned and kept. Below — by year.'],
  'bs:cash':['Деньги на счёте на конец месяца.','Cash in the account at month end.'],
  'bs:inv':['Товар на полках и складах — по цене закупки. Ниже — где он лежит.','Goods on shelves and in warehouses — at purchase cost. Below — where they are.'],
  'bs:fa':['Точки, заводы, вагоны, вещи для работы — по цене покупки минус износ. Ниже — каждая с остаточной стоимостью.','Outlets, plants, wagons, work equipment — at cost minus wear. Below — each with its book value.'],
  'bs:cip':['Что уже заплачено за то, что ещё строится.','What has been paid for things still under construction.'],
  'bs:lic':['Лицензии на участки недр — по цене покупки минус износ.','Mineral plot licences — at cost minus wear.'],
  'bs:debt':['Сколько осталось вернуть по каждому кредиту.','What is still owed on each loan.'],
  'bs:cap':['Деньги, вложенные в дело собственниками: ваши стартовые и взнос партнёра.','Money the owners put in: your starting money and the partner’s contribution.'],
  'bs:E':['Чего стоит дело для собственника: вложено + заработано − изъято. Это и есть «стоимость компании».','What the business is worth to its owner: paid in + earned − taken out. This is the “company value”.']};
function whatOf(tag,key){const h=WHAT[tag+':'+key];return h?T(h):'';}
// HTML раскрытия строки (или '' — раскрывать нечего)
function rowHtml(rep,tag,key,val){const w=Wd();if(!w)return '';let h='';
  if(tag==='pl'&&key==='tax')h+=taxHtml(rep);
  if(tag==='cf'&&key==='_all')h+=recon(rep);
  const o=det(rep,tag,key);
  if(o)h+=`<div class="dt-cap">${tag==='bs'?L('Из чего состоит','What it is made of'):L('Откуда эта сумма','Where this amount comes from')}${rep.cur&&tag!=='bs'?' · '+L('месяц ещё идёт','month still running'):''}</div>`+listHtml(w,o,val,rep);
  else if(tag!=='bs'||!/^(A|LE)$/.test(key)){if(!rep.cur&&(tag==='pl'||tag==='cf')){const f=firstDt(w);h+=`<div class="dt-e">${f?L('Подробности по строкам есть с ','Line details are available from ')+FMT.date(f.m)+'.':L('Подробности по строкам появятся с ближайшего закрытия месяца: игра собирает их, пока открыта.','Line details appear from the next month close: the game collects them while it is open.')}</div>`;}}
  return h;}
function canOpen(tag,key){if(tag==='pl')return !!(PLS[key]||PLC[key]);if(tag==='cf')return key!=='_c1';if(tag==='bs')return !/^(A|LE)$/.test(key);return false;}

/* ---------------- налог: с какой базы и по какой ставке ---------------- */
const TXN={osno:['Налог на прибыль (ООО на общей системе)','Corporate profit tax (LLC, general regime)'],npd:['Налог самозанятого (НПД)','Self-employed tax (NPD)'],usn6:['УСН «Доходы» 6 %','Simplified tax “Income” 6%'],usn15:['УСН «Доходы минус расходы» 15 %','Simplified tax “Income minus costs” 15%']};
function ln(a,b,c){return `<div class="tx-r"><span>${a}</span><b${c?` class="${c}"`:''}>${b}</b></div>`;}
// M30: налог с оплаты (УСН, НПД — кассовый метод): отгрузки в долг попадают в доходы, когда покупатель заплатил
function taxPaid(x){if(!x||!(x.cs||x.cr))return '';let h=`<div class="dt-cap">${L('Налог с оплаченного, а не с отгруженного','Tax on cash received, not on goods shipped')}</div>`;
  if(x.cs)h+=ln(L('Склад отгрузил в долг (в выручке есть, в доходах для налога — нет, пока не заплатят)','Warehouse shipped on credit (in revenue, not in taxable income until paid)'),'−'+M(x.cs));
  if(x.cr)h+=ln(L('Покупатели заплатили за прошлые отгрузки (в доходах для налога)','Buyers paid for earlier shipments (in taxable income)'),'+'+M(x.cr));
  return h+`<p class="tx-n">${L('На упрощёнке, как в жизни, доход — это деньги, которые пришли. Поэтому налог с долга покупателей платится, когда долг вернут.','On the simplified system, as in real life, income is the money received. So tax on what buyers owe is paid when they pay.')}</p>`;}
function taxHtml(rep){const x=rep.tx,w=Wd();if(!x){if(rep.cur)return `<div class="tx"><div class="tx-h">${T(TXN[w.taxm]||TXN.osno)}</div><div class="dt-e">${L('Налог считается при закрытии месяца — тогда здесь будет весь расчёт.','Tax is calculated at month end — the full calculation will be here then.')}</div></div>`;
    return `<div class="tx"><div class="dt-e">${L('Расчёт налога хранится в двух последних отчётах. Здесь — только итог.','The tax calculation is kept in the last two reports. Only the total here.')}</div></div>`;}
  let h=`<div class="tx"><div class="tx-h">${T(TXN[x.k]||TXN.osno)}</div>`;
  if(x.k==='osno'){
    h+=ln(L('Прибыль до налога','Profit before tax'),M(x.ebt));
    if(x.ebt<=0)h+=`<p>${L('Прибыли нет — налога нет. Убыток запомнили: он уменьшит налог в прибыльные месяцы (не больше чем наполовину).','No profit — no tax. The loss is remembered: it will cut tax in profitable months (by no more than half).')}</p>`;
    else{if(x.use)h+=ln(L('− убыток прошлых месяцев (можно списать до половины прибыли)','− past losses (up to half the profit)'),'−'+M(x.use));
      h+=ln(L('= база','= tax base'),M(x.b))+ln('× '+L('ставка','rate'),FMT.pct(x.r))+ln(L('= налог','= tax'),M(x.t),'neg');}
    if(x.lc1>0)h+=`<p>${L('Ещё не списанный убыток прошлых месяцев: ','Past losses not yet used: ')}<b>${M(x.lc1)}</b>.</p>`;
    h+=`<p class="tx-n">${L('Почему так: налог берут с прибыли, а не с выручки. Износ, проценты и зарплаты — расходы, они базу уменьшают. Стройка и покупки — нет: они списываются износом частями.','Why: tax is on profit, not revenue. Wear, interest and wages are costs and reduce the base. Construction and purchases don’t — they are expensed as wear over time.')}</p>`;}
  else if(x.k==='npd'){h+=taxPaid(x)+ln(L('Доход от заказов','Income from orders'),M(x.tb))+ln('× '+L('ставка','rate'),'4 %')+ln(L('= налог','= tax'),M(x.t),'neg');
    if(x.sal)h+=`<p class="tx-n">${L('Зарплата на складе ','The warehouse wage ')}(${M(x.sal)})${L(' — не доход самозанятого: налог с неё уже удержал работодатель.',' is not self-employed income: the employer has already withheld tax on it.')}</p>`;
    h+=`<p class="tx-n">${L('НПД берут с каждого полученного рубля дохода — расходы его не уменьшают.','NPD is charged on every rouble of income — costs don’t reduce it.')}</p>`;}
  else if(x.k==='usn6'){const t6=Math.round(x.tb*.06),cap=x.ooo?Math.round(t6*.5):t6,ded=Math.min(x.ipf,cap);
    h+=taxPaid(x)+ln(L('Доходы дела (оплаченные)','Business income (received)'),M(x.tb))+ln('× 6 %',M(t6));if(ded)h+=ln(L('− взносы ИП (уменьшают налог','− sole-trader contributions (reduce the tax')+(x.ooo?L(', не больше половины)',', up to half)'):')'),'−'+M(ded));h+=ln(L('= налог','= tax'),M(x.t),'neg');
    h+=`<p class="tx-n">${L('УСН 6 % — с выручки: аренда, зарплаты и износ его не уменьшают. Выгоден, когда расходов мало. При 15 % было бы ','6% simplified is on revenue: rent, wages and wear don’t reduce it. Good when costs are low. At 15% it would have been ')}<b>${M(x.u15)}</b>.</p>`;}
  else if(x.k==='usn15'&&x.yb!=null){   // M30: с оплаченного; авансы с начала года, минимум 1 % — по итогам года (в декабре)
    h+=ln(L('Прибыль до налога','Profit before tax'),M(x.ebt))+taxPaid(x);if(x.sal)h+=ln(L('− зарплата на складе (не доход дела)','− warehouse wage (not business income)'),'−'+M(x.sal));if(x.life)h+=ln(L('+ жизнь героя (не расход дела)','+ living costs (not a business cost)'),'+'+M(x.life));
    h+=ln(L('= база месяца (доходы − расходы)','= month base (income − costs)'),M(x.b15))+ln(L('База с начала года','Base since January'),M(x.yb))+ln('× 15 %',M(Math.round(Math.max(0,x.yb)*.15)));
    if(x.dec)h+=ln(L('минимум за год: 1 % доходов (оплаченных) ','annual minimum: 1% of income (received) ')+M(x.yi),M(Math.round(x.yi*.01)));
    h+=ln(L('− уже заплачено с начала года','− already paid this year'),'−'+M(x.yp))+ln(x.dec?L('= налог за год (доплата)','= tax for the year (top-up)'):L('= налог месяца (аванс)','= tax this month (advance)'),M(x.t),'neg');
    h+=`<p class="tx-n">${L('УСН 15 % — с прибыли: аренда, зарплаты, износ и проценты базу уменьшают, а жизнь героя — нет. Считается нарастающим итогом с января: убыточный месяц уменьшает налог следующих. Минимальный налог 1 % от оплаченных доходов сравнивают с 15 % только по итогам года. При 6 % было бы ','15% simplified is on profit: rent, wages, wear and interest reduce the base, living costs don’t. It runs cumulatively from January: a loss month lowers the next months’ tax. The 1% minimum on income received is compared with 15% only for the whole year. At 6% it would have been ')}<b>${M(x.u6)}</b>.</p>`;}
  else if(x.k==='usn15'){   // отчёты до M30: минимум 1 % — каждый месяцconst base=Math.max(0,x.ebt-x.sal+x.life);
    h+=ln(L('Прибыль до налога','Profit before tax'),M(x.ebt));if(x.sal)h+=ln(L('− зарплата на складе (не доход дела)','− warehouse wage (not business income)'),'−'+M(x.sal));if(x.life)h+=ln(L('+ жизнь героя (не расход дела)','+ living costs (not a business cost)'),'+'+M(x.life));
    h+=ln(L('= база (доходы − расходы)','= base (income − costs)'),M(base))+ln('× 15 %',M(Math.round(base*.15)))+ln(L('минимум: 1 % доходов','minimum: 1% of income'),M(Math.round(x.tb*.01)))+ln(L('= налог (большее из двух)','= tax (the larger)'),M(x.t),'neg');
    h+=`<p class="tx-n">${L('УСН 15 % — с прибыли: аренда, зарплаты, износ и проценты базу уменьшают, а жизнь героя — нет. При 6 % было бы ','15% simplified is on profit: rent, wages, wear and interest reduce the base, living costs don’t. At 6% it would have been ')}<b>${M(x.u6)}</b>.</p>`;}
  const by=taxBy(w,rep);if(by)h+=`<div class="dt-cap">${L('На какие дела приходится налог (примерно, по доле в базе)','Which businesses the tax falls on (approx., by share of the base)')}</div>`+listHtml(w,by,-x.t,rep);
  return h+'</div>';}
// налог месяца по делам: НПД/УСН 6 % — по выручке, иначе — по прибыли (только тем, кто в плюсе); сумма = налогу до рубля
function taxBy(w,rep){const x=rep.tx,d=repDt(rep);if(!x||!d||!(x.t>0))return null;const wt={};
  if(x.k==='npd'||x.k==='usn6'){for(const t in d.p.rev||{})if(t!=='job'&&d.p.rev[t]>0)wt[t]=d.p.rev[t];}
  else{const o={};for(const k of PLC.ebt)addTo(o,d.p[k],PLS[k]);for(const t in o)if(o[t]>0)wt[t]=o[t];}
  return split(x.t,wt);}
function split(tot,wt){const ks=Object.keys(wt);let s=0;for(const k of ks)s+=wt[k];if(!(s>0))return null;const v=ks.map(k=>tot*wt[k]/s),fl=v.map(Math.floor);let r=tot-fl.reduce((a,b)=>a+b,0);
  const ord=ks.map((k,i)=>i).sort((a,b)=>(v[b]-fl[b])-(v[a]-fl[a]));for(let j=0;r>0&&j<ord.length;j++,r--)fl[ord[j]]++;const o={};ks.forEach((k,i)=>{if(fl[i])o[k]=-fl[i];});return o;}

/* ---------------- сверка: почему прибыль ≠ изменение денег ---------------- */
function reconRows(rep,prev){const net=E.netOf(rep.pl),dc=rep.c1-rep.c0,dep=rep.pl.dep||0;
  const pb=prev&&prev.bal,dInv=pb?rep.bal.inv-pb.inv:null,dRec=pb?(rep.bal.rec||0)-(pb.rec||0):null,inv=E.sumCF(rep.cf,'i'),fin=E.sumCF(rep.cf,'f');
  const a=[[L('Чистая прибыль за месяц','Net profit for the month'),net,'n'],[L('+ износ: расход без денег','+ wear: a cost without cash'),dep]];
  if(dInv!=null)a.push([dInv>0?L('− деньги ушли в товар на полках','− cash went into stock on shelves'):L('+ товар с полок продан (запас меньше)','+ stock sold off (inventory down)'),-dInv]);
  if(dRec)a.push([dRec>0?L('− продали в долг: деньги придут позже','− sold on credit: cash comes later'):L('+ покупатели вернули долги','+ buyers paid their debts'),-dRec]);
  a.push([inv<=0?L('− вложения: точки, улучшения, стройка','− investments: outlets, upgrades, construction'):L('+ продали точки и объекты','+ sold outlets and sites'),inv]);
  a.push([fin>=0?L('+ кредиты и взносы','+ loans and contributions'):L('− вернули банку, личные покупки','− repaid the bank, personal purchases'),fin]);
  let s=0;for(const x of a)s+=x[1];const r=Math.round(dc-s);if(r)a.push([L('± прочее: продажа точек дороже/дешевле учёта, расчёты','± other: outlet sales above/below book, settlements'),r]);
  for(let i=a.length-1;i>0;i--)if(!Math.round(a[i][1]))a.splice(i,1);
  a.push([dc>=0?L('= денег на счёте стало больше на','= cash went up by'):L('= денег на счёте стало меньше на','= cash went down by'),dc,'t']);return a;}
function recon(rep){const w=Wd(),list=w.reps.slice();if(rep.cur)list.push(rep);const i=rep.cur?w.reps.length:list.indexOf(rep);const prev=i>0?(rep.cur?w.reps[w.reps.length-1]:list[i-1]):null;
  const a=reconRows(rep,prev);return `<div class="tx"><div class="tx-h">${L('Почему прибыль не равна изменению денег','Why profit is not the same as the change in cash')}</div>`+a.map(([n,v,k])=>ln(n,(k==='t'||k==='n'?'':v>0?'+':'')+M(v),k==='t'?(v<0?'neg':'pos'):v<0?'neg':'')).join('')
    +`<p class="tx-n">${L('Прибыль — это «заработали», деньги — это «есть на счёте». Их разводят покупки на будущее, кредиты, запасы на полках и износ.','Profit is what you earned, cash is what is in the account. Investments, loans, stock on shelves and wear make them differ.')}</p></div>`;}

/* ---------------- CSS ---------------- */
const CSS=`
.f-rr .dt-m{display:inline-block;width:22px;color:var(--accent,#c8641e);font-weight:700;font-size:18px}
.f-rr.open{background:var(--sub,#fafbfc)}
.f-rr .dtx{flex-basis:100%;margin-top:8px;cursor:default}
.dt-cap{font-size:15px;color:var(--muted,#5a6675);margin:10px 0 4px;font-weight:600}
.dt-l{border:1px solid var(--line,#d5dbe2);border-radius:10px;overflow:hidden;background:var(--card,#fff)}
.dt-g,.dt-i,.dt-s{display:flex;justify-content:space-between;align-items:baseline;padding:8px 10px;font-size:16px;line-height:1.3}
.dt-g{font-weight:600;border-top:1px solid var(--line,#d5dbe2)}.dt-l>.dt-g:first-child{border-top:0}
.dt-g i{font-style:normal;color:var(--muted,#5a6675);font-weight:400}
.dt-i{padding-left:24px;color:var(--ink,#1d2733);font-size:15px}.dt-i span,.dt-g span{flex:1;min-width:0;padding-right:10px}
.dt-g b,.dt-i b,.dt-s b,.tx-r b{white-space:nowrap;font-variant-numeric:tabular-nums}
.dt-l b.neg,.tx b.neg{color:var(--bad,#c62828)}.tx b.pos{color:var(--good,#2e7d32)}
.dt-s{border-top:2px solid var(--line,#d5dbe2);font-weight:600;background:var(--bg,#f5f6f8)}.dt-s.ok span{color:var(--good,#2e7d32)}.dt-s.bad span{color:var(--bad,#c62828)}
.dt-e{font-size:15px;color:var(--muted,#5a6675);padding:6px 2px}
.tx{margin-top:8px;padding:10px 12px;border-radius:10px;background:var(--bg,#f5f6f8);font-size:16px}
.tx-h{font-weight:700;font-size:17px;margin-bottom:6px}
.tx-r{display:flex;justify-content:space-between;align-items:baseline;padding:4px 0;border-bottom:1px dashed var(--line,#d5dbe2)}.tx-r span{flex:1;padding-right:10px}
.tx p{margin:8px 0 0;font-size:15px;line-height:1.4}.tx-n{color:var(--muted,#5a6675)}
.f-rr .exp b{color:var(--ink,#1d2733)}
.f-rr .dtx .exp{font-size:16px;color:var(--ink,#1d2733);line-height:1.4}
/* аналитика */
#anWin h2{margin:0 0 6px}
.an-tabs{display:flex;flex-wrap:wrap;margin:6px -3px 10px}
.an-tabs button{flex:1 1 30%;min-height:48px;margin:3px;border-radius:10px;border:1px solid var(--line,#d5dbe2);background:var(--card,#fff);font:inherit;font-size:16px;color:var(--ink,#1d2733);padding:6px 8px;cursor:pointer}
.an-tabs button.on{background:var(--blue,#1f5f99);color:#fff;border-color:var(--blue,#1f5f99)}
.an-c{border:1px solid var(--line,#d5dbe2);border-radius:12px;background:var(--card,#fff);margin:0 0 10px;overflow:hidden}
.an-p{display:block;width:100%;text-align:left;font:inherit;color:inherit;background:none;border:0;border-top:1px solid var(--line,#d5dbe2);padding:10px 12px;min-height:56px;cursor:pointer}
.an-c>.an-p:first-child{border-top:0}
.an-p .t{display:flex;justify-content:space-between;align-items:baseline;font-size:17px}.an-p .t span{flex:1;min-width:0;padding-right:8px}.an-p .t b{white-space:nowrap}
.an-p .s{font-size:15px;color:var(--muted,#5a6675);margin-top:3px;line-height:1.35}
.an-p .bar{height:8px;border-radius:4px;background:var(--line,#d5dbe2);margin-top:6px;overflow:hidden}.an-p .bar i{display:block;height:8px;background:var(--good,#2e7d32)}
.an-p .bar i.neg{background:var(--bad,#c62828)}
.an-x{padding:4px 12px 12px;font-size:16px;background:var(--bg,#f5f6f8)}
.an-x .tx-r{font-size:16px}
.an-m{display:flex;align-items:flex-end;height:64px;margin:8px 0 2px}.an-m div{flex:1;margin:0 2px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:64px;font-size:14px;color:var(--muted,#5a6675)}
.an-m i{display:block;width:100%;background:var(--good,#2e7d32);border-radius:3px 3px 0 0;min-height:2px}.an-m i.neg{background:var(--bad,#c62828)}
.an-say{display:flex;align-items:flex-start;margin:0 0 10px}.an-say .ph{flex:none;width:56px;height:56px;margin-right:10px}.an-say .ph svg{width:56px;height:56px}
.an-say div.tx2{flex:1;font-size:17px;line-height:1.4;background:var(--card,#fff);border:1px solid var(--line,#d5dbe2);border-radius:12px;padding:10px 12px}
.an-adv{padding:10px 12px;border-top:1px solid var(--line,#d5dbe2);font-size:17px;line-height:1.4}.an-c>.an-adv:first-child{border-top:0}
.an-adv .k{font-size:15px;color:var(--muted,#5a6675);margin-top:4px}
.an-chips{display:flex;flex-wrap:wrap;margin:0 -3px 8px}.an-chips button{min-height:48px;margin:3px;padding:6px 12px;border-radius:24px;border:1px solid var(--line,#d5dbe2);background:var(--card,#fff);font:inherit;font-size:16px;color:var(--ink,#1d2733);cursor:pointer}
.an-chips button.on{background:var(--accent,#c8641e);border-color:var(--accent,#c8641e);color:#fff}
.an-why{margin:6px 0 0;padding-left:20px;font-size:16px;line-height:1.4}.an-why li{margin:3px 0}
.an-best{color:var(--good,#2e7d32);font-weight:600}.an-worst{color:var(--bad,#c62828);font-weight:600}
.f-anb{display:flex;align-items:center;width:100%;min-height:56px;text-align:left;font:inherit;font-size:17px;color:inherit;background:var(--card,#fff);border:1px solid var(--line,#d5dbe2);border-radius:12px;padding:10px 14px;margin:0 0 10px;cursor:pointer}
.f-anb .i{font-size:24px;margin-right:12px}.f-anb .li{flex:1}.f-anb b{display:block;font-weight:600}.f-anb small{display:block;color:var(--muted,#5a6675);font-size:15px;margin-top:2px}
`;
function css(){if(document.getElementById('fdtCss'))return;const s=document.createElement('style');s.id='fdtCss';s.textContent=CSS;document.head.appendChild(s);}
try{css();}catch(e){}

/* ================= «Аналитика моих дел» ================= */
const avg=a=>a&&a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
function lastRep(w){return w.reps[w.reps.length-1]||null;}
function pts(w){return (w.biz||[]).filter(b=>b.st==='w'&&E.BIZ[b.t]);}
// данные точки: прибыль по месяцам (после аренды, зарплат и доли управляющего; до износа и налога), выручка, вложено, окупаемость
function ptData(w,b){const pm=(b.pm||[]).slice(),a6=avg(pm),last=pm.length?pm[pm.length-1]:0,rev=b.lr||0,g=b.g||0,wm=b.wm||0;
  const pay=a6>0?g/a6:Infinity,earned=Math.max(0,a6)*wm;let sell=0;try{sell=E.bizSellPrice(w,b);}catch(e){}
  return {b,pm,a6,last,rev,mrg:rev>0?last/rev:null,g,wm,pay,left:a6>0?Math.max(0,Math.ceil(pay-wm)):null,earned,sell,book:(b.g-b.dp)+(b.stk||0)};}
function shareOf(list){let s=0;for(const x of list)if(x.a6>0)s+=x.a6;return s;}
function monBars(pm,mEnd){if(!pm.length)return '';const mx=Math.max(1,...pm.map(Math.abs));return '<div class="an-m">'+pm.map((v,i)=>{const m=mEnd-(pm.length-1-i);
  return `<div><i class="${v<0?'neg':''}" style="height:${Math.max(2,Math.round(Math.abs(v)/mx*46))}px" title="${esc(M(v))}"></i>${FMT.mon(m)}</div>`;}).join('')+'</div>';}
function ptRowX(w,x,rep){const b=x.b,d=rep&&rep.dt?rep.dt.p:null,g=t=>d&&d[t]&&d[t][b.id]||0,mg=d&&d.fix&&d.fix['m.'+b.id]||0;
  let h='<div class="an-x">'+monBars(x.pm,w.m-1);
  h+=`<div class="dt-cap">${L('Прибыль по месяцам: после аренды, зарплат и доли управляющего, до износа и налога','Profit by month: after rent, wages and manager’s share, before wear and tax')}</div>`;
  if(d&&g('rev')&&!(d.rev&&d.rev._rl)){h+=ln(L('Выручка за ','Revenue in ')+FMT.mon(rep.m),M(g('rev')))+ln(L('− товар и сырьё','− goods & materials'),'−'+M(g('cogs')))+ln(L('− аренда и зарплаты','− rent & wages'),'−'+M(g('fix')));
    if(mg)h+=ln(L('− доля управляющего','− manager’s share'),'−'+M(mg));if(g('adm'))h+=ln(L('− реклама, учёба, ревизии','− advertising, training, audits'),'−'+M(g('adm')));if(g('oth'))h+=ln(L('± разовые (поломки, штрафы)','± one-offs (breakdowns, fines)'),M(g('oth')));
    h+=ln(L('− износ','− wear'),'−'+M(g('dep')));}
  h+=ln(L('Вложено в точку (покупка + улучшения)','Invested (purchase + upgrades)'),M(x.g))+ln(L('Работает','Working for'),pn(x.wm,'месяц','месяца','месяцев','month','months'));
  h+=ln(L('Сейчас за неё дадут','Would sell now for'),M(x.sell));
  return h+'</div>';}
const st={tab:'biz',open:null,cmp:null};
function tabBiz(w){const rep=lastRep(w),ps=pts(w).map(b=>ptData(w,b)).sort((a,b)=>b.a6-a.a6),tot=shareOf(ps);let h='';
  if(!ps.length)return nedSeg(w,rep)||`<div class="an-c"><div class="an-adv">${L('Своих точек пока нет. Аналитика появится, когда откроете первое дело.','No outlets yet. Analytics appear once you open your first business.')}</div></div>`;
  const best=ps[0],worst=ps[ps.length-1];let top=0,acc=0;for(const x of ps){if(x.a6<=0)break;acc+=x.a6;top++;if(acc>=tot*.8)break;}
  h+=say(L(`У вас <b>${ps.length}</b> ${pl(ps.length,'точка','точки','точек','','')}. В среднем приносят <b>${M(ps.reduce((s,x)=>s+x.a6,0))}</b> в месяц. `+(ps.length>2&&top<ps.length?`<b>${top}</b> лучших дают 80 % прибыли.`:''),
    `You have <b>${ps.length}</b> outlet${ps.length===1?'':'s'}. On average they bring <b>${M(ps.reduce((s,x)=>s+x.a6,0))}</b> a month. `+(ps.length>2&&top<ps.length?`The best <b>${top}</b> give 80% of the profit.`:''))
    +(worst.a6<0?' '+L(`Тянет вниз: ${esc(ptName(w,worst.b.id))} (${M(worst.a6)} в месяц).`,`Dragging you down: ${esc(ptName(w,worst.b.id))} (${M(worst.a6)} a month).`):''));
  h+='<div class="an-c">';for(const x of ps){const sh=tot>0&&x.a6>0?x.a6/tot:0,op=st.open===x.b.id;
    h+=`<button class="an-p" data-an="open" data-v="${x.b.id}" aria-expanded="${op}"><div class="t"><span>${op?'▾':'▸'} ${esc(ptName(w,x.b.id))}</span><b class="${x.a6<0?'f-dn':''}">${M(x.a6)}</b></div>
      <div class="s">${L('в среднем за месяц','avg a month')}${x.pm.length<6?' ('+pn(x.pm.length,'месяц','месяца','месяцев','month','months')+')':''} · ${L('доля в прибыли','share of profit')} ${FMT.pct(sh)}${x.mrg!=null?' · '+L('маржа','margin')+' '+FMT.pct(x.mrg):''}</div>
      <div class="bar"><i class="${x.a6<0?'neg':''}" style="width:${Math.round(Math.min(1,Math.abs(x.a6)/Math.max(1,Math.abs(best.a6)))*100)}%"></i></div></button>`;
    if(op)h+=ptRowX(w,x,rep);}
  h+='</div>'+`<p class="dt-e">${L('Маржа — сколько копеек прибыли с каждого рубля выручки. Доля — какая часть общей прибыли точек приходится на эту.','Margin — profit per rouble of revenue. Share — what part of all outlets’ profit this one makes.')}</p>`;
  return w.ned?nedSeg(w,rep)+h:h+nedSeg(w,rep);}
// недра и всё остальное — по направлениям (сегменты отчёта месяца)
function nedSeg(w,rep){if(!rep||!rep.sg||!w.ned)return '';const ks=Object.keys(rep.sg).filter(k=>rep.sg[k].rev||rep.sg[k].e).sort((a,b)=>rep.sg[b].e-rep.sg[a].e);if(!ks.length)return '';
  let tot=0;for(const k of ks)if(rep.sg[k].e>0)tot+=rep.sg[k].e;
  return `<div class="dt-cap">${L('По направлениям за ','By segment in ')}${FMT.date(rep.m)} · ${L('прибыль от работы (EBITDA)','operating profit (EBITDA)')}</div><div class="an-c">`+ks.map(k=>{const s=rep.sg[k];
    return `<div class="an-p" style="cursor:default"><div class="t"><span>${esc(T(SEG[k])||k)}</span><b class="${s.e<0?'f-dn':''}">${M(s.e)}</b></div><div class="s">${L('выручка','revenue')} ${M(s.rev)}${s.rev>0?' · '+L('маржа','margin')+' '+FMT.pct(s.e/s.rev):''} · ${L('доля','share')} ${FMT.pct(tot>0&&s.e>0?s.e/tot:0)}</div></div>`;}).join('')+'</div>';}
// сравнение точек одного вида: лучшая/худшая и почему
function whyList(w,x,best){const b=x.b,B=best.b,a=[];const C=E.CITY||{},cd=c=>(C[c]||{dem:1}).dem;
  if(b.c!==B.c&&cd(b.c)<cd(B.c))a.push(L(`место: ${cityN(b.c)} — покупателей меньше (спрос ×${FMT.num(cd(b.c),1)} против ×${FMT.num(cd(B.c),1)})`,`location: ${cityN(b.c)} has fewer buyers (demand ×${FMT.num(cd(b.c),1)} vs ×${FMT.num(cd(B.c),1)})`));
  if((b.lv||1)<(B.lv||1))a.push(L(`уровень ${b.lv||1} против ${B.lv||1}: улучшения добавляют покупателей и снижают расходы`,`level ${b.lv||1} vs ${B.lv||1}: upgrades bring buyers and cut costs`));
  if((b.rt||0)+.2<(B.rt||0))a.push(L(`рейтинг ${FMT.num(b.rt,1)} ⭐ против ${FMT.num(B.rt,1)} ⭐ — к лучшей идут охотнее`,`rating ${FMT.num(b.rt,1)} ⭐ vs ${FMT.num(B.rt,1)} ⭐ — people prefer the better one`));
  if(b.mgr&&!B.mgr){let sh=.3;try{sh=E.mgrSh(w);}catch(e){}a.push(L(`управляющий забирает ${Math.round(sh*100)} % прибыли (у лучшей хозяйничаете сами)`,`the manager takes ${Math.round(sh*100)}% of profit (you run the best one yourself)`));}
  if(E.satOf){try{const s1=E.satOf(w,b.t,b.c,b),s0=E.satOf(w,B.t,B.c,B);if(s1.pct>s0.pct+.03)a.push(L(`в городе тесно: своих точек вида — ${s1.n}, каждая отнимает покупателей у соседних (−${FMT.pct(s1.pct)})`,`the city is crowded: ${s1.n} of your outlets of this type take buyers from each other (−${FMT.pct(s1.pct)})`));}catch(e){}}
  const ks=Object.keys(b.k||{}).filter(k=>B.k&&b.k[k]!==B.k[k]);if(ks.length)a.push(L('другие настройки точки (место, наценка, ассортимент) — сравните с лучшей','different settings (location, mark-up, range) — compare with the best one'));
  if(x.wm<3)a.push(L('работает меньше трёх месяцев — ещё набирает покупателей','open for less than three months — still gaining customers'));
  if(b.down>0)a.push(L('сейчас стоит (ремонт или проверка)','currently closed (repair or inspection)'));
  if(!a.length)a.push(L('явной причины нет: разница — случайный разброс месяца (погода, сезон)','no clear reason: the difference is the month’s random spread (weather, season)'));return a;}
function tabCmp(w){const ps=pts(w),ty={};for(const b of ps)(ty[b.t]||(ty[b.t]=[])).push(b);const ts=Object.keys(ty).filter(t=>ty[t].length>=2);
  if(!ts.length)return `<div class="an-c"><div class="an-adv">${L('Сравнивать есть что, когда точек одного вида две и больше.','Comparison needs two or more outlets of the same type.')}</div></div>`;
  if(!st.cmp||ts.indexOf(st.cmp)<0)st.cmp=ts[0];let h=`<div class="an-chips">${ts.map(t=>`<button class="${t===st.cmp?'on':''}" data-an="cmp" data-v="${t}">${esc(bizN(t))} · ${ty[t].length}</button>`).join('')}</div>`;
  const xs=ty[st.cmp].map(b=>ptData(w,b)).sort((a,b)=>b.a6-a.a6),best=xs[0],worst=xs[xs.length-1];
  h+='<div class="an-c">'+xs.map((x,i)=>{const b=x.b;return `<div class="an-p" style="cursor:default"><div class="t"><span>${i===0?'<span class="an-best">▲ '+L('лучшая','best')+'</span> ':i===xs.length-1?'<span class="an-worst">▼ '+L('слабее всех','weakest')+'</span> ':''}${esc(ptName(w,b.id))}</span><b class="${x.a6<0?'f-dn':''}">${M(x.a6)}</b></div>
    <div class="s">${L('уровень','level')} ${b.lv||1} · ${FMT.num(b.rt||0,1)} ⭐ · ${b.mgr?L('управляющий','manager'):L('сами','self-run')} · ${L('маржа','margin')} ${x.mrg!=null?FMT.pct(x.mrg):'—'} · ${L('окупаемость','payback')} ${isFinite(x.pay)?pn(Math.round(x.pay),'месяц','месяца','месяцев','month','months'):'—'}</div></div>`;}).join('')+'</div>';
  if(worst!==best){const d=best.a6-worst.a6;h+=`<div class="an-c"><div class="an-adv"><b>${L('Почему','Why')} ${esc(ptName(w,worst.b.id))} ${L('приносит на','makes')} ${M(d)} ${L('в месяц меньше лучшей','a month less than the best')}:</b><ul class="an-why">${whyList(w,worst,best).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>`;}
  return h;}
function tabPay(w){const ps=pts(w).map(b=>ptData(w,b)).sort((a,b)=>(a.left==null?1e9:a.left)-(b.left==null?1e9:b.left));if(!ps.length)return tabBiz(w);
  let h=say(L('Окупаемость — за сколько месяцев точка вернёт вложенное (покупку и улучшения) при нынешней средней прибыли.','Payback — how many months an outlet needs to return what you put in (purchase and upgrades) at its current average profit.'));
  h+='<div class="an-c">'+ps.map(x=>{const done=x.a6>0&&x.earned>=x.g,st2=x.a6<=0?`<span class="an-worst">${L('не окупается — в минусе','not paying back — loss-making')}</span>`:done?`<span class="an-best">✓ ${L('уже окупилась','already paid back')}</span>`:L('ещё ≈ ','≈ ')+pn(x.left,'месяц','месяца','месяцев','month','months')+L('',' to go');
    const pr=x.g>0?Math.min(1,x.earned/x.g):0;
    return `<div class="an-p" style="cursor:default"><div class="t"><span>${esc(ptName(w,x.b.id))}</span><b>${st2}</b></div><div class="s">${L('вложено','invested')} ${M(x.g)} · ${L('приносит','brings')} ${M(x.a6)}/${L('мес.','mo')} · ${L('работает','working')} ${pn(x.wm,'месяц','месяца','месяцев','month','months')} · ${L('вернула ≈','returned ≈')} ${M(Math.min(x.g,x.earned))}</div>
      <div class="bar"><i style="width:${Math.round(pr*100)}%"></i></div></div>`;}).join('')+'</div>'
    +`<p class="dt-e">${L('«Вернула» — примерно: средняя прибыль × месяцы работы. Полоска — какая часть вложенного уже вернулась.','“Returned” is approximate: average profit × months worked. The bar shows how much of the investment has come back.')}</p>`;
  return h;}
function tabTax(w){const rep=lastRep(w);if(!rep)return `<div class="an-c"><div class="an-adv">${L('Налог появится после первого закрытого месяца.','Tax appears after the first month closes.')}</div></div>`;
  let h=say(L(`Налог за ${FMT.date(rep.m)}: <b>${M(rep.pl.tax)}</b>`,`Tax for ${FMT.date(rep.m)}: <b>${M(rep.pl.tax)}</b>`)+(rep.pl.rev>0?L(` — это ${FMT.pct(rep.pl.tax/rep.pl.rev,1)} выручки`,` — that is ${FMT.pct(rep.pl.tax/rep.pl.rev,1)} of revenue`):'')+'.');
  h+=`<div class="an-c"><div class="an-x" style="background:none">${taxHtml(rep)}</div></div>`;
  if(E.taxCmp&&w.ip&&!w.ned){try{const c=E.taxCmp(w);if(c.n>=2)h+=`<div class="an-c"><div class="an-adv">${L(`За последние ${pn(c.n,'месяц','месяца','месяцев','','')} при УСН 6 % налог был бы <b>${M(c.usn6)}</b>, при 15 % — <b>${M(c.usn15)}</b>.`,`Over the last ${c.n} months: 6% simplified tax would be <b>${M(c.usn6)}</b>, 15% — <b>${M(c.usn15)}</b>.`)}</div></div>`;}catch(e){}}
  return h;}
// советы Людмилы с числами: продать убыточную, улучшить лучшую, налог, управляющий в минусе
function advList(w){const a=[],ps=pts(w).map(b=>ptData(w,b));
  for(const x of ps.filter(x=>x.pm.length>=3&&avg(x.pm.slice(-3))<0).sort((a,b)=>a.a6-b.a6).slice(0,2))
    a.push({t:L(`Продать «${ptName(w,x.b.id)}»: за 3 месяца в минусе в среднем на ${M(-avg(x.pm.slice(-3)))}. Сейчас за неё дадут ${M(x.sell)}.`,`Sell “${ptName(w,x.b.id)}”: over 3 months it lost ${M(-avg(x.pm.slice(-3)))} a month on average. It would fetch ${M(x.sell)} now.`),
      k:L('Сначала проверьте: может, её тянет вниз управляющий или настройки (вкладка «Сравнить»).','First check: maybe the manager or settings drag it down (the “Compare” tab).')});
  if(E.lvGain&&E.ptUpOk){const ups=[];for(const x of ps){try{const g=E.lvGain(w,x.b);if(g&&g.g>0&&g.pay<=24)ups.push({x,g});}catch(e){}}
    ups.sort((p,q)=>p.g.pay-q.g.pay);for(const u of ups.slice(0,2)){const ok=E.ptUpOk(w,u.x.b.id)==='ok';
      a.push({t:L(`Улучшить «${ptName(w,u.x.b.id)}» до уровня ${u.g.x.n}: стоит ${M(u.g.x.c)}, даст ≈ +${M(u.g.g)} в месяц — окупится за ${pn(Math.ceil(u.g.pay),'месяц','месяца','месяцев','','')}.`,`Upgrade “${ptName(w,u.x.b.id)}” to level ${u.g.x.n}: costs ${M(u.g.x.c)}, adds ≈ +${M(u.g.g)} a month — pays back in ${Math.ceil(u.g.pay)} months.`),
        k:ok?L('Денег хватает — улучшение в карточке точки.','You can afford it — the upgrade is in the outlet card.'):L('Пока не хватает денег — отложите на это.','Not enough cash yet — save up for it.')});}}
  for(const x of ps.filter(x=>x.b.mgr&&x.b.mp>0&&x.last<0).slice(0,1))a.push({t:L(`«${ptName(w,x.b.id)}» в минусе даже без учёта износа, а управляющему уходит ${M(x.b.mp)} в месяц.`,`“${ptName(w,x.b.id)}” loses money even before wear, and the manager takes ${M(x.b.mp)} a month.`),k:L('Возьмите точку на себя (если есть свободное время) или смените управляющего.','Run it yourself (if you have free hands) or change the manager.')});
  if(E.taxAdv&&w.ip&&!w.ned&&(w.taxm==='usn6'||w.taxm==='usn15')){try{const t=E.taxAdv(w),cur=w.taxm==='usn6'?t.u6:t.u15,oth=w.taxm==='usn6'?t.u15:t.u6;if(t.best!==w.taxm&&cur-oth>12000)
    a.push({t:L(`Налог: по прогнозу на год ${w.taxm==='usn6'?'УСН 15 %':'УСН 6 %'} выйдет на ${M(cur-oth)} дешевле (${M(oth)} против ${M(cur)}).`,`Tax: for the year ${w.taxm==='usn6'?'15%':'6%'} simplified tax would be ${M(cur-oth)} cheaper (${M(oth)} vs ${M(cur)}).`),k:E.taxOk&&E.taxOk(w)?L('Сменить можно сейчас — в карточке ИП.','You can switch now — in the sole-trader card.'):L('Сменить можно раз в год, в январе.','You can switch once a year, in January.')});}catch(e){}}
  return a;}
function tabAdv(w){const a=advList(w);if(!a.length)return say(L('Пока всё разумно: убыточных точек нет, выгодных улучшений под рукой нет. Загляну сюда после следующего месяца.','All sensible for now: no loss-making outlets, no quick-win upgrades. I’ll look again after next month.'),'happy');
  return say(L('Вот что я бы сделала — с цифрами:','Here is what I would do — with numbers:'))+'<div class="an-c">'+a.map(x=>`<div class="an-adv">${esc(x.t)}<div class="k">${esc(x.k)}</div></div>`).join('')+'</div>';}
function say(t,mood){let f='';try{f=(window.UI&&UI.face)?UI.face(mood||'calm'):typeof advisorSvg==='function'?advisorSvg(mood||'calm'):'';}catch(e){}return `<div class="an-say"><div class="ph">${f}</div><div class="tx2">${t}</div></div>`;}
const TABS=[['biz',['Кто сколько приносит','Who earns what']],['cmp',['Сравнить точки','Compare outlets']],['pay',['Окупаемость','Payback']],['tax',['Налоги','Taxes']],['adv',['Советы Людмилы','Lyudmila’s advice']]];
function openAn(tab){const w=Wd();if(!w)return;css();if(tab)st.tab=tab;
  const draw=()=>{const body=st.tab==='cmp'?tabCmp(w):st.tab==='pay'?tabPay(w):st.tab==='tax'?tabTax(w):st.tab==='adv'?tabAdv(w):tabBiz(w);
    modal(`<div id="anWin" class="fin"><h2>📈 ${L('Аналитика моих дел','My business analytics')}</h2><p class="dt-e" style="margin:0">${L('Время стоит, пока окно открыто.','Time is paused while this window is open.')}</p>
      <div class="an-tabs">${TABS.map(([k,t])=>`<button class="${k===st.tab?'on':''}" data-an="tab" data-v="${k}">${T(t)}</button>`).join('')}</div>${body}
      <div class="row"><button class="btn" id="anClose" data-esc>${L('Закрыть','Close')}</button></div></div>`);
    try{modalRe=()=>openAn();}catch(e){}
    const box=document.getElementById('anWin');box.onclick=e=>{const b=e.target.closest('[data-an]');if(!b)return;snd('tap');const a=b.dataset.an,v=b.dataset.v;
      if(a==='tab'){st.tab=v;st.open=null;draw();}else if(a==='open'){st.open=st.open===v?null:v;draw();}else if(a==='cmp'){st.cmp=v;draw();}};
    document.getElementById('anClose').onclick=e=>{e.stopPropagation();hideModal();};};
  draw();}
function btnHtml(){const w=Wd();if(!w||!(pts(w).length||w.ned&&w.reps.length))return '';
  return `<button class="f-anb" data-an0="1"><span class="i">📈</span><span class="li"><b>${L('Аналитика моих дел','My business analytics')}</b><small>${L('прибыль по точкам, сравнение, окупаемость, налоги, советы','profit by outlet, comparison, payback, taxes, advice')}</small></span><span class="chev">›</span></button>`;}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-an0]');if(!b)return;e.preventDefault();e.stopPropagation();snd('tap');openAn();},true);

window.FDT={has,det,rowHtml,canOpen,whatOf,recon,reconRows,taxHtml,taxBy,openAn,btnHtml,groups,tagInfo,advList,ptData,css};
})();
