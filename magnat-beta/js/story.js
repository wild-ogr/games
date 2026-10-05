/* ================= «Из ларька в магнаты: бизнес» — сюжет «4 друга из 11 „Б“» (модель без DOM) =================
   Спецификация — hobby-analytics/24-magnat-rags-to-riches.md §9. Грузится после econ.js и biz.js (и в симуляторе, JavaScriptCore). Тексты — js/story-ui.js.
   Друзья: owl — Соня Совина (банк → фонд «Сова Инвест»), beav — Борис Бобров (друг-соперник, ларёк → «Бобров и Ко»),
   bars — Пётр Барсуков (горный инженер → «Барсуков и сыновья»), vit — Витя Козлов (такси → «ВитТранс»); чужой — bear, Михаил Топтыгин.
   Друзья и боты: в «Недрах» owl/beav/bars/bear — это боты ECON.BOTS (капитал = ECON.botValue, торги и рынок — как у ботов, параметры не меняем);
   до «Недр» — 4 числа в месяц по «опорной кривой» §6.2 × личный множитель пути (крах Бориса в 5-й год, рывок Петра с 8-го). Витя — не бот: в «Недрах» его
   капитал не ниже 30 % среднего бота. Доверие переносится в W.bots[i].tr. В торгах ОПИ «Бобров и Ко» — из biz.js (RIVALS), проигрыш другу доверие не снижает.
   Состояние — W.fr (заводит storyMigrate / лениво любой хук):
     {v, m0 (месяц старта), rags (1 — начинали с подработки), rs (свой ГСЧ — W.rs экономики не трогаем), n (счётчик id), ld (день), lm (месяц «жизни»), cm (закрытый месяц),
      owl|beav|bars|vit: {tr доверие 0–100, k (множитель пути), c (капитал на 1-е число), no (отказов подряд), cq (квартал звонка), cg (квартал «Поздравить»), ln (id займа от друга), gu (поручительство до месяца)},
      bear: {k, seen, c}, q: [сцены и просьбы {id,k,w,t,a,x,big,ph}], dn: {сцена: день ответа}, fd: [лента {t,m,w,k,a,c,g}], ch: [история {t,m,w,k,o,d,a}],
      jv: [СП {id,w,t,sh,in0,inv,base,m0,d,dm,p:[]}], ln: [займы друзьям {id,w,a,due,m0}], rh: [встречи {m,y,r:{you,owl,…},cr}], rq (месяц след. просьбы), nt (последняя новость), rd (прочитано до t), ls (день последней сцены), buy, vlg, gp}
   Учёт (баланс и ДДС сходятся всегда, ECON.check = 0):
     • займ ОТ друга — W.loans {k:'fr', r:0, fr:id, gr:n-1}: деньги — ДДС loan, возврат одним платежом в конце срока — repay (закрытие месяца econ.js);
     • займ ДРУГУ — актив «Займы выданные», вклад в СП — актив «Вложения в СП» (метод долевого участия): доля прибыли СП увеличивает вложение, дивиденды — уменьшают;
     • «родной» учёт (когда econ.js зовёт storyBal/storyClose и знает статьи pl.jv, cf.jvin/div/lend — NAT.cf): статьи jv / jvin, div, lend;
       «совместимый» (econ.js не трогали): активы идут через хук biz.js (bizBal: СП — в fa, займы — в rec), деньги — в существующие строки ДДС
       (вклад и выкуп доли — capex, продажа доли — asale, займ другу и его возврат, дивиденды — oth), доля прибыли СП — pl.oth.
       Хук bizBal вызывается при W.me (история «с нуля»), поэтому в мире «сразу недра» без родных хуков займов другу и СП нет (acctOk(W) = false).
     • скидки друзей — ретро-бонусы (уменьшают cogs/log, деньги — в те же строки ДДС); подарки — oth.
   Время: обёртки ECON.tick (день, и «после закрытия», если закрытие прошло без хука) и ECON.offline (догоняем пропущенные месяцы),
   ECON.bizClose (закрытие месяца до налога) и ECON.bizMigrate (миграция) — если econ.js не зовёт хуки сам. Всё идемпотентно (F.ld, F.lm, F.cm).
   Действия (через GAME.act): friendAnswer, friendCall, jvCreate, jvDiv, jvExit, congrats, storyRead, storyHero (пол и имя героя), storyPrologue (пролог сыгран/пропущен).
   Этап 5 (28.09, отчёт 27): пролог «Пари 11 „Б“» вместо таблицы «10 лет» (F.hero), переходящий кубок (F.cup), арка Топтыгина tpt1 → tpt2 → bear1 → tpt4 (→ tpt5 во втором сезоне),
   выбор партнёра для недр (part), Людмила: first1, lud1, mem (90-е, 6 историй), lud2 (пенсия), ludcall; друзья: owl2, owl4, beav4, beav6, bars3, bars5, vit4, vit5; второй сезон
   (холдинг №2+): beav5 (якорный инвестор «Бобров и Ко» — СП bshare 10 %), bars4, owl3 (СП fund), tpt5. Просьбы: займов меньше, «сходи со мной» (visit) без денег.
   Большие сцены (кроме встреч, IPO, событий глав — BIG_FREE) идут по одной и не чаще раза в 20 дней. Модель сюжета по реальным дням — прогон в отчёте этапа 5 (день без большой сцены — 0 из 96).
   M18 (01.10, hobby-analytics/release-b/M18-magnat-friends2.md): отношения F[id].rel −100…+100 и 5 уровней (lvOf), tr = (rel+100)/2 — для старого кода; миграция tr·2−100.
   Польза в числах — таблица PK (по уровням); «📞 Позвонить» — friendChat, «🏠 Сходить в гости» — friendVisit(W,id,src) (src='econ' — визит уже оплачен делом хозяина),
   «🙏 Попросить помощь» — callOpts/friendCall (NEED — уровень, CD — откат в мес.); предложения друзей (RQ offer), пари с Борисом (RQ pari), «точка Бориса рядом» при холоде,
   возврат к нейтралу без общения, счёт «кто кому» F[id].st, события для STAT — очередь F.sx (забирает js/stat-hooks.js). Проверка баланса пользы — tools/sim-friends.sh. */
(function(root){
'use strict';
const E=root.ECON;if(!E||E.STORY)return;
const _=E._,{pay,recv,pl,rnd0,clamp}=_;
const FR=['owl','beav','bars','vit'],ALL=FR.concat(['bear']);
const TR0={owl:62,beav:57,bars:60,vit:64};
// M18: отношения rel −100…+100 (tr 0–100 — производное, для старого кода); уровни 0 «в ссоре», 1 «прохладно», 2 «приятели», 3 «друзья», 4 «не разлей вода»
const REL0={owl:20,beav:10,bars:16,vit:24},REL_HOME=10,LV_MIN=[-100,-49,-15,30,70];
function lvOf(r){return r<=-50?0:r<=-16?1:r<30?2:r<70?3:4;}
const relTr=r=>Math.round((r+100)/2);
// польза друзей в числах (по уровням 0…4) — одна таблица для модели и окна «Друзья»
const PK={
  guarDr:[0,0,0,-.02,-.03],rateUp:[.01,.005,0,0,0],guarLim:1.15,bridgeK:2,           // Соня: поручительство −2/−3 п. п. и лимит ×1,15; плохие отношения: ставка +1/+0,5 п. п.; «перекрою платёж» — 2 платежа банку без процентов
  buyD:.03,buyM:[0,0,0,2,3],pari:.01,rival:[.88,.92,1,1,1],                          // Борис: общая закупка −3 % на 2/3 мес.; пари на 1 % капитала (до 500 тыс.); прохладно — «точка рядом» −8 % покупателей (в ссоре −12 %) на 3 мес.
  build:[0,0,.15,.2,.25],rep:[0,0,0,.4,.6],cap:[0,0,0,.03,.05],                         // Пётр: стройка −15/−20/−25 % оставшихся дней (заводы недр — не больше −10 %); ремонт −40/−60 %; новая точка −3/−5 % цены
  sup:[0,0,0,.01,.015],logd:[0,0,0,.03,.05],logUp:[.1,0,0,0,0],move:[0,0,0,.5,.75],gig:1.5,ship:.04,cap1:5e4,capL:3e4,   // Витя (до «Недр»): закупка −1/−1,5 %, доставка −3/−5 %; переезд точки −50/−75 %; заказ ×1,5; «везу товар» −4 % на 2 мес.; скидки на закупку — до 50 тыс. ₽ в месяц, на доставку — до 30 тыс.
  fixM:3,visitE:20,visit:4,call:1,peace:15};   // звонок +1, в гостях +4 (от +50 — вдвое меньше: крепкую дружбу делают поступки), помириться +15
// M20 (решение владельца 01.10): пари с Борисом — ставка на выбор: деньги (PK.pari) или 💎. 💎 живут вне мира (S.cr): модель копит «к зачислению» F.crp (+/−),
// окно друзей (friends-ui.js) переводит их в GAME.addCr/spend. Ставка 💎 списывается сразу, выигрыш — вдвое; частота — как у пари (раз в 4 мес.)
const PARI_CR=5;
const crN=()=>{const f=root.STORY&&root.STORY.crHave;try{return typeof f==='function'?f():1e9;}catch(e){return 1e9;}};
function crAdd(F,n){F.crp=(F.crp||0)+n;}
const STG=['gig','small','mid','quarry','nedra'];
const si=W=>W.ned?4:Math.max(0,STG.indexOf(W.st||'gig'));

/* ---------------- что умеет econ.js сам (проверяем до обёрток) ---------------- */
const src=f=>{try{return String(f||'');}catch(e){return '';}};
const NAT=(function(){let m={pl:{},cf:{}};try{m=_.emptyMon({cash:0});}catch(e){}
  const C=E.CFG||{i:[]};
  return {bal:/\bstoryBal\b/.test(src(E.bal)),close:/\bstoryClose\b/.test(src(E.close)),day:/\bstoryDay\b/.test(src(E.tick)),mig:/\bstoryMigrate\b/.test(src(E.migrate)),
    guar:/\bstoryGuar\b/.test(src(E.loanOffer)),
    cf:C.i.indexOf('jvin')>=0&&C.i.indexOf('div')>=0&&C.i.indexOf('lend')>=0&&('jv' in m.pl)&&/\.jv\b/.test(src(E.netOf))};})();
// статьи: родные или совместимые (см. шапку)
const CFK=NAT.cf?{jvin:'jvin',jvout:'jvin',lend:'lend',lendb:'lend',div:'div'}:{jvin:'capex',jvout:'asale',lend:'oth',lendb:'oth',div:'oth'};
const PLJV=NAT.cf?'jv':'oth';
// займы другу и СП возможны, только если их активы попадут в баланс
function acctOk(W){return NAT.bal||!!(W&&W.me);}

/* ---------------- свой генератор (сюжет не сдвигает случайность экономики) ---------------- */
function rnd(F){let a=F.rs=(F.rs+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;}
function nrm(F){let u=0;while(!u)u=rnd(F);return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*rnd(F));}
// «красивая» сумма: 12 345 → 12 000, 3 456 789 → 3 500 000
function nice(x){x=Math.max(0,x);const u=x<2e4?1e3:x<2e5?5e3:x<2e6?5e4:x<2e7?5e5:x<2e8?5e6:5e7;return Math.max(u,Math.round(x/u)*u);}

/* ---------------- капитал друзей: опорная кривая (§6.2, медиана игрока) × личный множитель по «пути» ---------------- */
const REF=[[0,.15e6],[12,.6e6],[24,2e6],[48,6e6],[72,15e6],[96,35e6],[120,75e6],[144,150e6],[168,285e6],[240,1.2e9]];
function ref(mm){if(mm<=0)return REF[0][1];for(let i=1;i<REF.length;i++)if(mm<=REF[i][0]){const [a,x]=REF[i-1],[b,y]=REF[i];return x*Math.pow(y/x,(mm-a)/(b-a));}
  const [a,x]=REF[REF.length-1];return x*Math.pow(1.02,mm-a);}
// цель множителя по году от старта (y): Соня ровно, Борис быстро и рвано (крах в 5-й год), Пётр медленно — рывок с 8-го, Витя средне; Топтыгин — втрое выше медианы
function tgt(id,y){if(id==='owl')return .9;
  if(id==='beav')return y<4.5?1.35:y<5.5?.25:y<9?.25+(y-5.5)/3.5*.85:1.1;
  if(id==='bars')return y<7.5?.35:y<10?.35+(y-7.5)/2.5*.65:1;
  if(id==='vit')return y<4?.7:.95;return 3;}
const SD={owl:.025,beav:.07,bars:.03,vit:.045,bear:.05};
function botOf(W,id){return W.ned&&W.bots?W.bots.find(b=>b.id===id):null;}
function capOf(W,id){const F=W.fr;if(id==='you')return rnd0(E.equity(W));const b=botOf(W,id);if(b)return rnd0(E.botValue(W,b));
  if(!F||!F[id])return 0;let v=ref(W.m-F.m0)*F[id].k;
  if(W.ned&&id==='vit'&&W.bots&&W.bots.length){let s=0;for(const x of W.bots)s+=E.botValue(W,x);v=Math.max(v,.3*s/W.bots.length);}
  return rnd0(v);}
// друзья — это боты недр: помечаем справочник (только данные, поведение ботов не меняется)
const NICK={owl:['Соня','Sonya'],beav:['Борис','Boris'],bars:['Пётр','Pyotr'],vit:['Витя','Vitya']};
for(const b of E.BOTS||[]){b.fr=NICK[b.id]?1:0;if(NICK[b.id]){b.nick=NICK[b.id][0];b.nicke=NICK[b.id][1];}}

/* ---------------- состояние ---------------- */
// этап 5 (28.09): hero — герой {g:'m'|'f', n:ключ имени (m1…f3) | '', nc:своё имя, set:1 — выбрал сам}; lud — Людмила {loyal, ret (на пенсии), rm (отложила до месяца), cm (последний звонок)};
// tp — арка Топтыгина {ask, pine:'join'|'solo', anchor:1|2, paid, end}; part — партнёр для недр 'owl'|'bear'; mem/memM — воспоминания о 90-х; lt — отложенная лента [{m,w,k,a}];
// aw — последний офлайн {t0,t1}; h0 — месяц старта текущего холдинга; lb — день последней «большой» сцены
const HERO0=()=>({g:'m',n:'',nc:'',set:0});
function lud0(){return {loyal:0,ret:0,rm:-1,cm:-99,n:0,gift:0};}
function init(W){const F={v:1,m0:W.m,rags:W.ned?0:1,rs:((W.seed||7)^0x5f3759df)>>>0||9,n:1,ld:-1,lm:W.m,cm:W.m-1,q:[],dn:{},fd:[],ch:[],jv:[],ln:[],rh:[],rq:W.m+3,nt:W.t,rd:W.t,ls:-99,buy:-1,vlg:-1,gp:-1,
    hero:HERO0(),lud:lud0(),tp:{},part:'',mem:0,memM:-99,lt:[],aw:null,h0:W.m,lb:-99,lbm:W.m};
  for(const id of FR)F[id]=Object.assign({tr:relTr(REL0[id]),k:tgt(id,0),c:0,no:0,cq:-9,cg:-9,ln:null,gu:-1},fr0(W,REL0[id]));
  F.om=W.m+3;F.sx=[];F.lvq=[];
  F.bear={k:3,seen:W.ned?1:0,c:0};
  if(W.ned)F.dn.pro=W.t;          // мир начат сразу с недр (старые сохранения, IPO): пролог «10 лет» пропускаем
  W.fr=F;for(const id of ALL)F[id].c=capOf(W,id);return F;}
// M18: поля отношений друга — rel, lc (месяц последнего общения), vm (в гостях), km (звонок), ms (уже ворчал), rm (месяц «точки рядом»), pm (пари), fx (профилактика до месяца), ga (польза для письма), cd (откаты просьб), st — счёт «кто кому»
// st: g — вы помогли, h — он помог, n — отказов, sv — он сэкономил вам ₽, ln — вы одолжили ему ₽, bk — он вернул ₽, lt — задержек возврата
function fr0(W,rel){return {rel,lc:W.m,vm:-9,km:-9,ms:0,rm:-99,pm:-99,fx:-99,ga:0,cd:{},st:{g:0,h:0,n:0,sv:0,ln:0,bk:0,lt:0}};}
function fr(W){return W.fr&&W.fr.v?W.fr:init(W);}
// старый сейв: «счёт дружбы» восстанавливаем по истории F.ch (последние 40 событий)
function stBack(F,id,st){for(const c of F.ch||[]){if(!c||c.w!==id)continue;const a=c.a||{};
  if(c.k.indexOf('rq_')===0){if(c.o==='a'){st.g++;if(c.k==='rq_loan'&&a.a)st.ln+=a.a;}else if(c.k!=='rq_advice'&&c.k!=='rq_visit')st.n++;}
  else if(c.k==='lendback'&&a.a)st.bk+=a.a;else if(c.k.indexOf('call_')===0)st.h++;else if(c.k==='congr')st.g++;}}
function storyMigrate(W,fx){if(!W.fr||typeof W.fr!=='object'||!W.fr.v){init(W);if(fx)fx.push('fr');return;}
  const F=W.fr,num=(o,k,d)=>{if(typeof o[k]!=='number'||!isFinite(o[k]))o[k]=d;};
  for(const k of ['q','fd','ch','jv','ln','rh'])if(!Array.isArray(F[k]))F[k]=[];if(!F.dn||typeof F.dn!=='object')F.dn={};
  num(F,'m0',W.m);num(F,'n',1);num(F,'rq',W.m+3);num(F,'nt',W.t);num(F,'rd',W.t);num(F,'ls',-99);num(F,'buy',-1);num(F,'vlg',-1);num(F,'gp',-1);
  num(F,'rs',9);num(F,'rags',0);num(F,'ld',-1);num(F,'lm',W.m);num(F,'cm',W.m-1);
  for(const id of FR){if(!F[id]||typeof F[id]!=='object')F[id]={};const x=F[id];num(x,'tr',TR0[id]);num(x,'k',tgt(id,0));num(x,'c',0);num(x,'no',0);num(x,'cq',-9);num(x,'cg',-9);num(x,'gu',-1);if(x.gu===0&&!F.gu1)x.gu=-1;if(x.ln===undefined)x.ln=null;
    // M18: доверие 0–100 → отношения −100…+100 (57 → +14, 80 → +60); недостающие поля — по умолчанию
    if(typeof x.rel!=='number'||!isFinite(x.rel)){x.rel=clamp(Math.round(x.tr*2-100),-100,100);if(fx)fx.push('fr.rel');}
    const d0=fr0(W,x.rel);for(const k in d0)if(k!=='st'&&k!=='cd')num(x,k,d0[k]);if(!x.cd||typeof x.cd!=='object')x.cd={};
    if(!x.st||typeof x.st!=='object'){x.st=d0.st;stBack(F,id,x.st);}for(const k in d0.st)num(x.st,k,0);x.tr=relTr(x.rel);}F.gu1=1;
  num(F,'om',W.m+2);num(F,'crp',0);if(!Array.isArray(F.sx))F.sx=[];if(!Array.isArray(F.lvq))F.lvq=[];if(F.pari&&typeof F.pari!=='object')F.pari=null;
  if(!F.bear||typeof F.bear!=='object')F.bear={k:3,seen:W.ned?1:0,c:0};
  if(!F.hero||typeof F.hero!=='object')F.hero=HERO0();if(F.hero.g!=='f')F.hero.g='m';if(typeof F.hero.nc!=='string')F.hero.nc='';if(typeof F.hero.n!=='string')F.hero.n='';
  if(!F.lud||typeof F.lud!=='object')F.lud=lud0();{const l=F.lud,d=lud0();for(const k in d)num(l,k,d[k]);}
  if(!F.tp||typeof F.tp!=='object')F.tp={};if(typeof F.part!=='string')F.part='';if(!Array.isArray(F.lt))F.lt=[];
  num(F,'mem',0);num(F,'memM',-99);num(F,'lbm',W.m);num(F,'h0',W.hold>=2?W.m:F.m0);num(F,'lb',-99);if(F.aw&&typeof F.aw!=='object')F.aw=null;
  for(const f of F.fd)if(f&&f.k==='life'&&f.c&&!f.g&&!lifeCg(f.w,(f.a&&f.a.v)||0))f.c=0;
  F.q=F.q.filter(x=>x&&typeof x==='object'&&x.id&&x.k);for(const x of F.q)if(!x.a||typeof x.a!=='object')x.a={};
  // займы другу и СП в мире, где их нет в балансе (без W.me и без родных хуков), учёт не держит — такого быть не должно, чистим
  if(!acctOk(W)&&(F.jv.length||F.ln.length)){F.jv=[];F.ln=[];if(fx)fx.push('fr.acct');}}
// статьи, которых может не быть в старом месяце
function cfK(W,k){if(typeof W.mon.cf[k]!=='number')W.mon.cf[k]=0;}
function plK(W,k){if(typeof W.mon.pl[k]!=='number')W.mon.pl[k]=0;}
function payA(W,a,k){const c=CFK[k]||k;cfK(W,c);return pay(W,a,c);}
function recvA(W,a,k){const c=CFK[k]||k;cfK(W,c);return recv(W,a,c);}
function sgAdd(W,seg,rev,e){const s=W.mon.sg||(W.mon.sg={});const x=s[seg]||(s[seg]={rev:0,e:0});x.rev+=rev;x.e+=e;}

/* ---------------- доверие, история, лента ---------------- */
// d — в единицах шкалы −100…+100; nc — «без общения» (молчание, забытая просьба): месяц последнего контакта не трогаем
function tr(F,id,d,nc){if(FR.indexOf(id)<0||!F[id]||!d)return 0;const x=F[id];if(typeof x.rel!=='number')x.rel=clamp(Math.round((x.tr||60)*2-100),-100,100);
  const o=x.rel,l0=lvOf(o);x.rel=clamp(Math.round(o+d),-100,100);x.tr=relTr(x.rel);if(!nc){x.lc=F.lm;x.ms=0;}
  const l1=lvOf(x.rel);if(l1!==l0){if(!F.lvq)F.lvq=[];F.lvq.push({w:id,a:l0,b:l1});}
  if(x.rel!==o&&nc!==2)sx(F,{k:'rel',w:id,d:x.rel-o,l:l1});return x.rel-o;}   // nc=2 — медленный возврат к нейтралу, в статистику не шлём
function lv(F,id){return F&&F[id]&&typeof F[id].rel==='number'?lvOf(F[id].rel):2;}
function stc(F,id,k,n){const x=F[id];if(x&&x.st)x.st[k]=(x.st[k]||0)+(n||1);}
// статистика STAT: очередь событий (js/stat-hooks.js забирает), не больше 20
function sx(F,e){if(!F.sx)F.sx=[];F.sx.push(e);if(F.sx.length>20)F.sx.shift();}
// польза от друга деньгами: копим «он сэкономил вам» и сумму для письма «итоги» (раз в квартал)
function gain(F,id,a){if(!(a>0)||!F[id])return;stc(F,id,'sv',a);F[id].ga=(F[id].ga||0)+a;const g=F.gw||(F.gw={});g[id]=(g[id]||0)+a;}
// M20: итог пользы за месяц для окна «Закрытие месяца» — F.gh {m, a, w:{друг: ₽}} (копится в F.gw с прошлого закрытия)
function ghSnap(F,m){const g=F.gw||{};let a=0;for(const k in g)a+=g[k];F.gh={m,a:rnd0(a),w:g};F.gw={};}
function hearts(t){return Math.max(1,Math.min(5,Math.ceil((t||0)/20)));}
function log(W,F,w,k,o,d,a){F.ch.push({t:W.t,m:W.m,w,k,o:o||'',d:d||0,a:a||null});if(F.ch.length>40)F.ch.splice(0,F.ch.length-40);}
function feed(W,F,w,k,a,c){F.fd.push({t:W.t,m:W.m,w,k,a:a||null,c:c?1:0,g:0});if(F.fd.length>30)F.fd.splice(0,F.fd.length-30);if(w==='bear')F.bear.seen=1;}
function yes(F,id){if(F[id]){F[id].no=0;stc(F,id,'g');}}
// отказ — мягко: −5, три отказа подряд — ещё −10
function no(F,id){if(!F[id])return 0;F[id].no++;stc(F,id,'n');let d=tr(F,id,-5);if(F[id].no>=3){F[id].no=0;d+=tr(F,id,-10);}return d;}
function eqOf(W){return Math.max(0,E.equity(W));}
function cashFree(W){return W.cash-(W.ned?20e6:Math.max(3000,Math.min(5e5,E.equity(W)*.02)));}

/* ---------------- займы: другу (актив) и от друга (W.loans k:'fr') ---------------- */
function lendMk(W,F,w,a,mo){if(!acctOk(W))return 'no';a=rnd0(a);if(a<=0)return 'no';if(cashFree(W)<a)return 'cash';
  payA(W,a,'lend');F.ln.push({id:'fl'+(F.n++),w,a,due:W.m+mo,m0:W.m});stc(F,w,'ln',a);sx(F,{k:'lend',w,a:Math.round(a/1e3)});return 'ok';}
function frLoan(W,F,w,a,n){a=rnd0(a);n=Math.max(1,n|0);const l={id:'l'+(W.nid++),a,a0:a,r:0,n,n0:n,k:'fr',fr:w,gr:n-1};W.loans.push(l);recv(W,a,'loan');F[w].ln=l.id;stc(F,w,'h');sx(F,{k:'help',w,p:'loan'});return l;}
function frLoanMax(W,id){return nice(Math.max(5e3,capOf(W,id)*.1));}

/* ---------------- совместные предприятия (метод долевого участия) ---------------- */
// r — средняя доходность СП в месяц к его капиталу, s — разброс
const JV={trans:{r:.02,s:.012},base:{r:.018,s:.015},pit:{r:.024,s:.01},fund:{r:.013,s:.006},bshare:{r:.012,s:.008},pnt:{r:.03,s:.015},gaz:{r:.02,s:.01}};   // M20: gaz — «Газель на двоих» с Витей (глава «Своё дело»/«Сеть»): ~2 % в месяц к вложению, без рук   // pnt — «точка на двоих» с Борисом (M18, глава «Своё дело»): без рук, ~4 % в месяц к вложению   // bshare — акции «Бобров и Ко» (якорный инвестор, второй сезон)
function jvCreate(W,w,t,sh,a){const F=fr(W);if(!acctOk(W)||!JV[t]||!F[w])return 'no';a=rnd0(a);sh=clamp(+sh||.5,.1,1);if(a<=0)return 'no';if(cashFree(W)<a)return 'cash';
  payA(W,a,'jvin');const j={id:'j'+(F.n++),w,t,sh,in0:a,inv:a,base:rnd0(a/sh),m0:W.m,d:.5,dm:-99,p:[]};F.jv.push(j);log(W,F,w,'jv',t,0,{a,sh});sx(F,{k:'jv',w,t,a:Math.round(a/1e3)});return 'ok';}
// правило дивидендов (0 / 50 / 100 % прибыли) — раз в год вместе с другом
function jvDiv(W,id,pct){const F=fr(W),j=F.jv.find(x=>x.id===id);if(!j)return 'no';if(j.dm>=0&&W.m-j.dm<12)return 'wait';
  j.d=pct>=1?1:pct>=.5?.5:0;j.dm=W.m;log(W,F,j.w,'jvdiv',j.t,0,{d:j.d});return 'ok';}
// оценка выхода: 6 × месячная прибыль × доля, но не меньше вложенного
function jvPrice(j,how){let m=0;for(const x of j.p)m+=x;m=j.p.length?m/j.p.length:0;
  const own=Math.max(j.inv,j.in0,rnd0(6*m*j.sh));return how==='buy'?rnd0(own*(1-j.sh)/j.sh):rnd0(own);}
function jvExit(W,id,how){const F=fr(W),j=F.jv.find(x=>x.id===id);if(!j||!acctOk(W))return 'no';
  if(how==='buy'){if(j.sh>=1)return 'no';const p=jvPrice(j,'buy');if(cashFree(W)<p)return 'cash';payA(W,p,'jvin');j.inv+=p;j.in0+=p;j.base=rnd0(j.base);j.sh=1;log(W,F,j.w,'jvbuy',j.t,0,{a:p});return 'ok';}
  const p=jvPrice(j,'sell');recvA(W,p,'jvout');if(p!==j.inv)pl(W,'oth',p-j.inv);F.jv=F.jv.filter(x=>x!==j);
  const d=W.m-j.m0<12?tr(F,j.w,-15):0;log(W,F,j.w,'jvsell',j.t,d,{a:p});return 'ok';}
function jvMonth(W,F){for(const j of F.jv){const P=JV[j.t]||JV.trans;const r=P.r+P.s*nrm(F),pr=rnd0(j.base*r),s=rnd0(pr*j.sh);
  plK(W,PLJV);pl(W,PLJV,s);j.inv+=s;j.p.push(pr);if(j.p.length>12)j.p.shift();
  if(s>0&&j.d>0){const dv=Math.min(j.inv,rnd0(s*j.d));recvA(W,dv,'div');j.inv-=dv;}
  const age=W.m-j.m0+1;if(age>0&&age%12===0){let y=0;for(const x of j.p)y+=x;if(y>0){const d=tr(F,j.w,5);log(W,F,j.w,'jvyear',j.t,d,{p:rnd0(y*j.sh)});}}}}

/* ---------------- сцены и развилки (тексты — js/story-ui.js) ----------------
   when(W,F) — когда сцена встаёт в очередь; prm — параметры (суммы); o — варианты: ok(W,F,q) → true | 'код причины', fx(W,F,q) → изменение доверия.
   Нет «плохого» ответа: отказ — не больше −10 и только там, где друг правда в беде. big — окно-сцена (STORYUI.big), остальное — сообщение в телефон. */
const partA=W=>Math.floor(Math.max(0,cashFree(W))*.5/1000)*1000;
const okCash=(W,F,q)=>!acctOk(W)?'no':cashFree(W)>=q.a.a?true:'cash';
const SC={
  pro:{w:'all',big:1,kind:'reu',when:(W,F)=>F.rags&&W.t>=6,prm:(W,F)=>({i:reuSnap(W,F,10),y:10,m:W.m})},
  vit1:{w:'vit',when:(W,F)=>F.rags&&si(W)===0&&W.t>=20&&!!W.me&&!(W.me.out>0)&&!(W.me.rest>0),   // M46: подработку не зовут на больничном/выходном
   prm:()=>({a:3000}),
    o:{a:{fx:(W,F,q)=>{if(W.me){const a=recv(W,q.a.a,'sales');pl(W,'rev',a);sgAdd(W,'gig',a,a);W.me.tb=(W.me.tb||0)+a;}yes(F,'vit');return tr(F,'vit',3);}},
       b:{fx:()=>0}}},
  owl1:{w:'owl',when:(W,F)=>F.rags&&si(W)<=1&&W.m-F.m0>=2&&!!E.cardLimit&&E.cardLimit(W)>0&&!W.loans.some(l=>l.card),prm:W=>({a:E.cardLimit(W)}),
    o:{a:{ok:W=>E.cardLimit&&E.cardLimit(W)>0&&!W.loans.some(l=>l.card)?true:'card',fx:(W,F)=>{E.cardTake(W);yes(F,'owl');return tr(F,'owl',3);}},
       b:{fx:(W,F)=>tr(F,'owl',2)}}},
  // Борис ставит ларёк напротив: событие точки «bobrov» (biz.js) или просто когда у вас уже есть точка
  beav1:{w:'beav',when:(W,F)=>F.rags&&!W.ned&&si(W)>=1&&W.biz&&W.biz.length>=1&&(F.bobk||W.m-F.m0>=8),
    o:{a:{fx:(W,F)=>tr(F,'beav',2)},b:{fx:(W,F)=>tr(F,'beav',2)}}},
  beav2:{w:'beav',when:(W,F)=>F.rags&&!W.ned&&F.dn.beav1>=0&&W.t-F.dn.beav1>=90&&si(W)<=2&&W.biz&&W.biz.some(b=>E.BIZ&&E.BIZ[b.t]&&E.BIZ[b.t].seg==='retail'),
    o:{a:{fx:(W,F)=>{F.buy=W.m+12;F.buyR=.05;yes(F,'beav');return tr(F,'beav',8);}},b:{fx:()=>0}}},
  bars1:{w:'bars',when:(W,F)=>F.rags&&!W.ned&&si(W)>=1&&W.m-F.m0>=26,prm:()=>({a:45000}),
    o:{a:{fx:(W,F)=>{F.gp=W.m+24;yes(F,'bars');return tr(F,'bars',15);}},b:{fx:(W,F)=>no(F,'bars')}}},
  beav3:{w:'beav',big:1,when:(W,F)=>F.rags&&!W.ned&&si(W)>=1&&W.m-F.m0>=54,prm:W=>({a:nice(clamp(eqOf(W)*.1,3e4,4e6))}),
    o:{a:{ok:okCash,fx:(W,F,q)=>{lendMk(W,F,'beav',q.a.a,12);F.beav.hlp=1;yes(F,'beav');return tr(F,'beav',30);}},
       b:{ok:okCash,fx:(W,F,q)=>{jvCreate(W,'beav','base',.5,q.a.a);yes(F,'beav');return 0;}},
       // денег на полную сумму нет — «займу сколько могу» (половина свободных денег); лучшая сцена не должна кончаться «не могу»
       d:{ok:(W,F,q)=>!acctOk(W)?'no':cashFree(W)>=q.a.a?'skip':partA(W)>=5000?true:'skip',fx:(W,F)=>{lendMk(W,F,'beav',partA(W),12);F.beav.hlp=1;yes(F,'beav');return tr(F,'beav',20);}},
       c:{fx:(W,F)=>tr(F,'beav',-10)}}},
  vit3:{w:'vit',when:(W,F)=>F.rags&&!W.ned&&si(W)>=2&&W.m-F.m0>=40&&acctOk(W),prm:W=>({a:nice(clamp(eqOf(W)*.08,3e5,3e7))}),
    o:{a:{ok:okCash,fx:(W,F,q)=>{jvCreate(W,'vit','trans',.5,q.a.a);yes(F,'vit');return tr(F,'vit',10);}},b:{fx:(W,F)=>no(F,'vit')}}},
  // проект Петра «в синей папке» (bars3) — доля в «Сосновом логе» 65 % вместо 60 %
  bars2:{w:'bars',when:(W,F)=>F.rags&&!W.ned&&W.st==='quarry'&&acctOk(W),prm:(W,F)=>({a:nice(clamp(eqOf(W)*.12,1e6,6e7)),sh:F.bars.plan?.65:.6,pl:F.bars.plan?1:0}),
    o:{a:{ok:okCash,fx:(W,F,q)=>{jvCreate(W,'bars','pit',q.a.sh||.6,q.a.a);F.bars.opi=1;yes(F,'bars');return tr(F,'bars',10);}},
       b:{fx:(W,F)=>{F.bars.solo=1;return 0;}},c:{fx:()=>0}}},
  ned1:{w:'all',big:1,when:(W,F)=>F.rags&&W.ned,o:{a:{fx:()=>0}}},
  bear1:{w:'vit',big:1,when:(W,F)=>W.ned&&(F.rags?F.dn.ned1>=0&&W.m-(F.mn===undefined?W.m:F.mn)>=6:W.m-F.m0>=18)&&acctOk(W),prm:W=>({a:nice(clamp(eqOf(W)*.02,5e6,1e8))}),
    o:{a:{ok:okCash,fx:(W,F,q)=>{lendMk(W,F,'vit',q.a.a,24);F.vit.disc=.15;F.b1m=W.m;yes(F,'vit');return tr(F,'vit',20);}},b:{fx:()=>0}}},
  /* ---- этап 5: новые сцены (отчёт 27, § 3) — равномерно по главам; тексты — story-ui.js ---- */
  // «Первая выручка» — Людмила, когда заработала первая точка
  first1:{w:'lud',big:1,when:(W,F)=>F.rags&&!W.ned&&W.hold===1&&bizW(W)>=1,o:{a:{fx:(W,F)=>{F.cloth=1;return 0;}},b:{fx:()=>0}}},
  // Соня зовёт на пироги к маме
  owl2:{w:'owl',when:(W,F)=>F.rags&&!W.ned&&si(W)>=1&&mm(W,F)>=28,o:{a:{fx:(W,F)=>{yes(F,'owl');return tr(F,'owl',5);}},b:{fx:()=>0}}},
  // «Сибирская лыжня»: точка против точки. Победа — Борис неделю закупается у вас (выручка без затрат: ДДС «продажи», БДР «выручка»); поражение — без штрафа
  beav4:{w:'beav',when:(W,F)=>F.rags&&!W.ned&&F.dn.beav1!==undefined&&bizW(W)>=2&&mm(W,F)>=34,prm:W=>({a:nice(clamp(eqOf(W)*.01,5e3,3e5))}),
    o:{a:{fx:(W,F,q)=>{const en=W.me&&typeof W.me.en==='number'?W.me.en:60;const p=clamp(.45+(en-50)/250,.3,.65);q.a.win=rnd(F)<p?1:0;
        if(q.a.win){const a=recv(W,q.a.a,'sales');pl(W,'rev',a);sgAdd(W,'retail',a,a);}yes(F,'beav');return tr(F,'beav',3);}},b:{fx:()=>0}}},
  // Пётр: проект разреза — «сохрани для меня» (посаженное ружьё: в «Сосновом логе» доля 65 %)
  bars3:{w:'bars',when:(W,F)=>F.rags&&!W.ned&&si(W)>=2&&mm(W,F)>=76,o:{a:{fx:(W,F)=>{F.bars.plan=1;yes(F,'bars');return tr(F,'bars',3);}},b:{fx:(W,F)=>tr(F,'bars',3)}}},
  // Свадьба Вити (❤ Вити ≥ 3): свидетель — подарок 0,2 % капитала (прочие расходы)
  vit4:{w:'vit',when:(W,F)=>F.rags&&W.hold===1&&mm(W,F)>=62&&F.vit.tr>=41,prm:W=>({a:nice(clamp(eqOf(W)*.002,3e3,2e6))}),
    o:{a:{ok:(W,F,q)=>W.cash>=q.a.a?true:'cash',fx:(W,F,q)=>{const a=pay(W,q.a.a,'oth');pl(W,'oth',-a);F.vit.wed=1;later(W,F,2,'vit','wed2',{o:'a'});yes(F,'vit');return tr(F,'vit',10);}},
       b:{fx:(W,F)=>{F.vit.wed=2;later(W,F,2,'vit','wed2',{o:'b'});return tr(F,'vit',5);}}}},
  // Топтыгин, шаг 1: звонит сам и хочет купить сеть (продать нельзя — это не конец игры)
  tpt1:{w:'bear',big:1,when:(W,F)=>F.rags&&!W.ned&&si(W)>=2&&mm(W,F)>=84,prm:W=>({n:(W.biz||[]).length,a:turnover(W)}),
    o:{a:{fx:(W,F)=>{F.bear.met=1;return 0;}},b:{fx:(W,F)=>{F.bear.met=1;F.tp.ask=1;return 0;}}}},
  // Соня уходит из банка и открывает фонд — зовёт на презентацию (день 5)
  owl4:{w:'owl',big:1,when:(W,F)=>F.rags&&W.hold===1&&si(W)>=2&&mm(W,F)>=104,o:{a:{fx:(W,F)=>{yes(F,'owl');return tr(F,'owl',5);}},b:{fx:()=>0}}},
  // Пётр зовёт на первый взрыв на новом уступе (глава «Карьер», день 7)
  bars5:{w:'bars',when:(W,F)=>F.rags&&!W.ned&&W.st==='quarry'&&mm(W,F)>=140,o:{a:{fx:(W,F)=>{yes(F,'bars');return tr(F,'bars',5);}},b:{fx:()=>0}}},
  // Борис слышал про письма Роснедр: «идём вместе?» (перед недрами)
  beav6:{w:'beav',when:(W,F)=>F.rags&&!W.ned&&W.st==='quarry'&&mm(W,F)>=150,o:{a:{fx:(W,F)=>{yes(F,'beav');return tr(F,'beav',3);}},b:{fx:()=>0}}},
  // Людмилу переманивает Топтыгин
  lud1:{w:'lud',big:1,when:(W,F)=>F.rags&&W.hold===1&&F.dn.tpt1!==undefined&&W.t-F.dn.tpt1>=150,o:{a:{fx:(W,F)=>{F.lud.loyal=1;return 0;}},b:{fx:(W,F)=>{F.lud.loyal=2;return 0;}}}},
  // Топтыгин, шаг 2: торги за «Каменный ручей» — друзья против Медведя (только сюжет, деньги не двигаются)
  tpt2:{w:'all',big:1,when:(W,F)=>F.rags&&!W.ned&&W.st==='quarry'&&F.dn.tpt1!==undefined&&(F.dn.bars2!==undefined&&W.t-F.dn.bars2>=40||mm(W,F)>=140),
    o:{a:{fx:(W,F)=>{F.tp.pine='join';let d=0;for(const id of ['owl','beav','bars'])d+=tr(F,id,5);return d;}},b:{fx:(W,F)=>{F.tp.pine='solo';return 0;}}}},
  // выбор партнёра для недр: Соня или Топтыгин (экономика та же — взнос считает biz.js; разница — в сюжете и на IPO)
  part:{w:'lud',big:1,when:(W,F)=>F.rags&&!W.ned&&!!E.nedraOk&&E.nedraOk(W),o:{a:{fx:(W,F)=>{F.part='owl';return tr(F,'owl',10);}},b:{fx:(W,F)=>{F.part='bear';F.bear.met=1;return 0;}}}},
  // юбилей Людмилы Санны (недра, через 2,5 года): путёвка в санаторий (0,05 % капитала, прочие расходы) или торт своими руками
  lud3:{w:'lud',big:1,when:(W,F)=>W.ned&&W.hold===1&&F.mn!==undefined&&W.m-F.mn>=30,prm:W=>({a:nice(clamp(eqOf(W)*.0005,1e5,2e6))}),
    o:{a:{ok:(W,F,q)=>W.cash>=q.a.a?true:'cash',fx:(W,F,q)=>{const a=pay(W,q.a.a,'oth');pl(W,'oth',-a);F.lud.gift=1;return 0;}},b:{fx:(W,F)=>{F.lud.gift=2;return 0;}}}},
  // Витя через год после выкупа «ВитТранса»: «Мне стыдно» (спасибо)
  vit5:{w:'vit',when:(W,F)=>F.dn.bear1!==undefined&&F.vit.disc>0&&F.b1m!==undefined&&W.m-F.b1m>=12,o:{a:{fx:(W,F)=>tr(F,'vit',5)}}},
  // Топтыгин, шаг 4: якорный инвестор перед IPO (a — +10 💎 на IPO и он в совете; b — друзья докупают акции, ❤ всем +5)
  tpt4:{w:'bear',big:1,when:(W,F)=>W.ned&&W.hold===1&&E.equity(W)>=(E.IPO_EQ||2.2e9)*.7,
    o:{a:{fx:(W,F)=>{F.tp.anchor=1;F.bear.met=1;return 0;}},b:{fx:(W,F)=>{F.tp.anchor=2;F.bear.met=1;let d=0;for(const id of FR)d+=tr(F,id,5);return d;}}}},
  // Людмила вспоминает 90-е: 6 историй, не чаще раза в игровой год, к событиям игры
  // …или раньше, если больших сцен не было 14 месяцев (у неспешного игрока реальный день короче) — чтобы в каждом дне была заметная сцена
  mem:{w:'lud',big:1,rep:1,when:(W,F)=>F.rags&&F.mem<MEM_N&&W.m-F.memM>=10&&(memDue(W,F)||W.m-F.lbm>=14&&(W.biz||[]).length>0),prm:(W,F)=>({v:F.mem}),o:{a:{fx:(W,F)=>{F.mem++;F.memM=W.m;return 0;}}}},
  /* ---- M20: «плохие» развилки (M15 §4.3) — когда друг обижен (уровень ≤ 1). Экономика не меняется (минусы — те же PK), это голос минуса:
     друг объясняет, что случилось; a — попробовать помириться (❤ +8, как полвизита-примирения), b — оставить как есть (0). По одному разу. ---- */
  // Соня отказывает в поручительстве (прохладно/ссора, есть банк и кредиты)
  owlno:{w:'owl',when:(W,F)=>F.rags&&!W.ned&&si(W)>=1&&lv(F,'owl')<=1&&(W.loans||[]).some(l=>l.k!=='fr'&&l.k!=='od'),o:{a:{fx:(W,F)=>tr(F,'owl',8)},b:{fx:()=>0}}},
  // Борис: «на торгах уступать не буду» (прохладно/ссора, глава «Сеть» или «Карьер»)
  beavno:{w:'beav',when:(W,F)=>F.rags&&!W.ned&&si(W)>=2&&lv(F,'beav')<=1,o:{a:{fx:(W,F)=>tr(F,'beav',8)},b:{fx:()=>0}}},
  // Пётр уходит к Топтыгину (глава «Карьер», прохладно/ссора) — помирились: остаётся; нет — работает на «Медведь Капитал» (F.bars.tpt)
  barsno:{w:'bars',when:(W,F)=>F.rags&&!W.ned&&W.st==='quarry'&&lv(F,'bars')<=1,o:{a:{fx:(W,F)=>{F.bars.stay=1;return tr(F,'bars',8);}},b:{fx:(W,F)=>{F.bars.tpt=1;return 0;}}}},
  // Витя: «машины заняты — ищи другого перевозчика» (прохладно/ссора, есть точки с товаром)
  vitno:{w:'vit',when:(W,F)=>F.rags&&!W.ned&&si(W)>=1&&lv(F,'vit')<=1&&supOn(W),o:{a:{fx:(W,F)=>tr(F,'vit',8)},b:{fx:()=>0}}},
  // встреча у Петра без вас: двое и больше друзей обижены
  partyno:{w:'owl',when:(W,F)=>F.rags&&!W.ned&&si(W)>=1&&FR.filter(id=>lv(F,id)<=1).length>=2,o:{a:{fx:(W,F)=>{let d=0;for(const id of FR)if(lv(F,id)<=1){const x=tr(F,id,5);if(id==='owl')d=x;}return d;}},b:{fx:()=>0}}},   // в ответе — только Соня (она пишет), остальным обиженным тоже +5
  /* ---- второй сезон: холдинг №2 и дальше ---- */
  // Борис идёт на биржу и зовёт в якорные инвесторы: 10 % «Бобров и Ко» (совместное дело по методу долевого участия)
  beav5:{w:'beav',when:(W,F)=>W.hold>=2&&W.m-F.h0>=6&&acctOk(W),prm:W=>({a:nice(clamp(eqOf(W)*.03,5e6,1e8))}),
    o:{a:{ok:okCash,fx:(W,F,q)=>{jvCreate(W,'beav','bshare',.1,q.a.a);yes(F,'beav');return tr(F,'beav',8);}},b:{fx:(W,F)=>tr(F,'beav',3)}}},
  // старший сын Петра просится стажёром
  bars4:{w:'bars',when:(W,F)=>W.hold>=2&&W.m-F.h0>=12,o:{a:{fx:(W,F)=>{F.bars.intern=1;later(W,F,6,'bars','intern2');return tr(F,'bars',10);}},b:{fx:(W,F)=>tr(F,'bars',2)}}},
  // фонд на двоих с Соней (СП fund, 50 %)
  owl3:{w:'owl',when:(W,F)=>W.hold>=2&&W.m-F.h0>=18&&acctOk(W),prm:W=>({a:nice(clamp(eqOf(W)*.05,1e7,3e8))}),
    o:{a:{ok:okCash,fx:(W,F,q)=>{jvCreate(W,'owl','fund',.5,q.a.a);yes(F,'owl');return tr(F,'owl',10);}},b:{fx:()=>0}}},
  // Топтыгин, финал: «ход конём» — предлагает объединиться; любой ответ — рукопожатие
  tpt5:{w:'bear',big:1,when:(W,F)=>W.hold>=2&&W.m-F.h0>=30,o:{a:{fx:(W,F)=>{F.tp.end=1;return 0;}},b:{fx:(W,F)=>{F.tp.end=2;return 0;}}}},
  // Людмила Санна уходит на пенсию (b — «ещё годик?»: откладывает на 5 игровых лет)
  lud2:{w:'lud',big:1,rep:1,when:(W,F)=>W.hold>=2&&W.m-F.h0>=24&&!F.lud.ret&&(F.lud.rm<0||W.m>=F.lud.rm),
    o:{a:{fx:(W,F)=>{F.lud.ret=1;F.lud.cm=W.m;return 0;}},b:{fx:(W,F)=>{F.lud.rm=W.m+60;return 0;}}}},
  // на пенсии Людмила звонит раз в игровой год — праздник
  ludcall:{w:'lud',big:1,rep:1,when:(W,F)=>F.lud.ret&&W.m-F.lud.cm>=12,prm:(W,F)=>({v:F.lud.n}),o:{a:{fx:(W,F)=>{F.lud.cm=W.m;F.lud.n++;return 0;}}}},
  // Борис при доверии ≥ 80 (или если вы выручили его в крах) сам приходит в трудную минуту (овердрафт): займ без процентов
  help:{w:'beav',rep:1,when:(W,F)=>W.odM>0&&(F.beav.tr>=80||F.beav.hlp)&&!F.beav.ln&&W.m-(F.hm===undefined?-99:F.hm)>=12,prm:W=>({a:frLoanMax(W,'beav'),n:6}),
    o:{a:{fx:(W,F,q)=>{F.hm=W.m;frLoan(W,F,'beav',q.a.a,q.a.n);return tr(F,'beav',2);}},b:{fx:(W,F)=>{F.hm=W.m;return 0;}}}}
};
const ORDER=['pro','vit1','owl1','first1','beav1','beav2','bars1','owl2','beav4','beav3','vit4','vit3','bars3','tpt1','lud1','owl4','bars2','tpt2','bars5','beav6','part','ned1','bear1','vit5','lud3','tpt4','owlno','vitno','beavno','barsno','partyno','mem',
  'beav5','bars4','owl3','lud2','tpt5','ludcall','help'];
// «большие» сцены, которые не ждут очереди (встречи, IPO и события глав); остальные большие — по одной и не чаще раза в BIG_GAP дней
const BIG_FREE={pro:1,beav3:1,ned1:1,part:1,help:1};const BIG_GAP=20;
function mm(W,F){return W.m-F.m0;}
function bizW(W){let n=0;for(const b of W.biz||[])if(b.st==='w')n++;return n;}
// «полтора годовых оборота» (для Топтыгина): выручка за 12 месяцев × 1,5
function turnover(W){let r=0;for(const h of (W.hist||[]).slice(-12))r+=h.rev||0;return nice(Math.max(1e6,r*1.5));}
// отложенная лента: через n месяцев друг напишет (свадьба, стажёр)
function later(W,F,n,w,k,a){F.lt.push({m:W.m+n,w,k,a:a||null});if(F.lt.length>10)F.lt.shift();}
// воспоминания Людмилы: к какому событию приходит следующая история
const MEM_N=8;
function memDue(W,F){const i=F.mem,m=mm(W,F);
  if(i===0)return F.dn.first1!==undefined?W.t-F.dn.first1>=60:m>=12&&(W.biz||[]).length>0;   // ларёк у рынка, 94-й
  if(i===1)return (W.loans||[]).some(l=>l.k!=='fr'&&l.k!=='od'&&!l.card)||m>=40;             // кредит в долларах, 98-й
  if(i===2)return W.odM>0||m>=46;                                                            // зарплата кастрюлями
  if(i===3)return si(W)>=2||m>=80;                                                           // платье Соне — реинвестирование
  if(i===4)return !!W.ned||m>=130;                                                           // бухгалтерия разреза
  if(i===5)return m>=165;                                                                    // 2008-й, подушка
  if(i===6)return m>=200;                                                                    // ваучеры 90-х
  return m>=230;}                                                                            // 2014-й, валюта                                                                            // 2008-й, подушка
// просьбы друзей (раз в 2–4 месяца): loan — займ (вернут через 3–6 мес.), gift — день рождения/свадьба (подарок), watch — присмотреть за точкой, advice — совет
const RQ={
  loan:{a:{ok:okCash,fx:(W,F,q)=>{lendMk(W,F,q.w,q.a.a,q.a.n);yes(F,q.w);return tr(F,q.w,10);}},b:{fx:(W,F,q)=>no(F,q.w)}},
  gift:{a:{ok:(W,F,q)=>W.cash>=q.a.a?true:'cash',fx:(W,F,q)=>{const a=pay(W,q.a.a,'oth');pl(W,'oth',-a);yes(F,q.w);return tr(F,q.w,5);}},b:{fx:(W,F,q)=>no(F,q.w)}},
  watch:{a:{fx:(W,F,q)=>{yes(F,q.w);return tr(F,q.w,5);}},b:{fx:(W,F,q)=>no(F,q.w)}},
  advice:{a:{fx:(W,F,q)=>{yes(F,q.w);return tr(F,q.w,3);}},b:{fx:(W,F,q)=>{yes(F,q.w);return tr(F,q.w,3);}}},   // совет: оба ответа хороши
  // «сходи со мной» (первое сентября у сына Петра, футбол с Борисом…): без денег, отказ без штрафа
  visit:{a:{fx:(W,F,q)=>{yes(F,q.w);return tr(F,q.w,5);}},b:{fx:(W,F,q)=>{yes(F,q.w);return 0;}}},
  // M18: друг сам предлагает помощь или дело (раз в 3–5 месяцев); отказ — без штрафа
  offer:{a:{ok:(W,F,q)=>q.a.p==='jv'?okCash(W,F,q):offerOk(W,F,q.w,q.a.p)?true:'no',fx:(W,F,q)=>{perkOn(W,F,q.w,q.a.p,q.a);return tr(F,q.w,3);}},b:{fx:()=>0}},
  // пари с Борисом: «выручка следующего месяца будет выше на 10 %?»; не принял — не беда
  pari:{a:{fx:(W,F,q)=>{F.pari={w:q.w,a:q.a.a,m:W.m+1,base:q.a.base,tg:q.a.tg};F[q.w].pm=W.m;sx(F,{k:'pari',w:q.w,r:'on'});return tr(F,q.w,2);}},
    c:{ok:()=>crN()>=PARI_CR?true:'crno',fx:(W,F,q)=>{F.pari={w:q.w,a:0,cr:PARI_CR,m:W.m+1,base:q.a.base,tg:q.a.tg};crAdd(F,-PARI_CR);F[q.w].pm=W.m;sx(F,{k:'pari',w:q.w,r:'on',cr:1});return tr(F,q.w,2);}},   // M20: на 💎
    b:{fx:(W,F,q)=>{F[q.w].pm=W.m;return tr(F,q.w,-1);}}}};   // M20: отказ от пари — −1 («скучный ты стал»)
/* ---------------- M18: польза друзей ---------------- */
// сколько платим банку в месяц (проценты + тело) — для «Перекрою платёж» Сони
function bankPay(W){let s=0;for(const l of W.loans||[])if(l.k!=='fr'){try{s+=l.a*l.r/12+Math.min(l.a,E.loanPay(l));}catch(e){}}return rnd0(s);}
function repairsOn(W){return (W.biz||[]).some(b=>b.st==='w');}
function supOn(W){return (W.biz||[]).some(b=>b.st==='w'&&E.BIZ&&E.BIZ[b.t]&&(E.BIZ[b.t].sd||E.BIZ[b.t].v));}
// лучший заказ на доске, который можно «усилить» от друга (глава 1)
function gigSrc(W,w){const M=W.me;if(!M||W.ned||si(W)>1||!Array.isArray(M.board))return null;const ok=w==='bars'?['loader','handy','courier']:['courier','taxi','loader','handy','tutor'];
  let best=null;for(const g of M.board){if(g.fr||ok.indexOf(g.t)<0||!(g.G>0))continue;try{if(E.gigOk&&!E.gigOk(W,g.t))continue;}catch(e){}if(!best||g.pay>best.pay)best=g;}return best;}
function gigGive(W,F,w){const g0=gigSrc(W,w);if(!g0)return 0;const g=JSON.parse(JSON.stringify(g0));g.id='g'+(W.nid++);g.G=rnd0(g0.G*PK.gig);g.pay=rnd0((g.G-(g0.C||0)-g.G*.04)/50)*50;g.exp=W.t+6;g.fr=w;g.prem=1;
  W.me.board.unshift(g);gain(F,w,Math.max(0,g.pay-g0.pay));return g.pay;}
function offerOk(W,F,w,p){const x=F[w];if(!x)return false;
  if(p==='ship')return !W.ned&&supOn(W)&&!(F.vship>=W.m);if(p==='gig')return !!gigSrc(W,w);if(p==='prof')return repairsOn(W)&&!(x.fx>=W.m);
  if(p==='rate')return !(x.gu>=W.m)&&!!(E.loanOffer&&E.loanOffer(W).max>0);if(p==='buy')return !W.ned&&supOn(W)&&!(F.buy>=W.m);if(p==='jv')return acctOk(W)&&(w==='owl'||!W.ned);return false;}
// включить помощь (из предложения друга или звонка «Попросить помощь»)
function perkOn(W,F,w,p,a){const x=F[w],L=lv(F,w);a=a||{};let v=0;
  if(p==='ship')F.vship=W.m+1;
  else if(p==='gig')v=gigGive(W,F,w);
  else if(p==='prof')x.fx=W.m+PK.fixM-1;
  else if(p==='rate'||p==='guar')x.gu=W.m+3;
  else if(p==='buy'){F.buy=W.m+Math.max(3,PK.buyM[L])-1;F.buyR=PK.buyD;}
  else if(p==='jv')jvCreate(W,w,JVT[w]||'pnt',w==='owl'?.5:.5,a.a);
  stc(F,w,'h');sx(F,{k:'help',w,p});log(W,F,w,'perk',p,0,v?{a:v}:null);return v;}
// предложение от друга: кто и что (самое полезное из доступного по уровню)
// M20: совместные дела по предложению друга (§9): Борис — точка на двоих, Витя — «Газель на двоих», Соня — доля в фонде «Сова Инвест» (после её презентации owl4, ещё в первом холдинге)
const JVT={beav:'pnt',vit:'gaz',owl:'fund'};
function jvAmt(W,w){const eq=eqOf(W);return w==='vit'?nice(clamp(eq*.08,1e5,8e5)):w==='owl'?nice(clamp(eq*.05,1e6,5e7)):nice(clamp(eq*.15,5e4,2e7));}
function offerMake(W,F){const s=si(W),c=[];
  for(const w of FR){if(F.q.some(q=>q.w===w))continue;const L=lv(F,w);if(L<2)continue;const add=(p,wt)=>{if(offerOk(W,F,w,p))c.push([w,p,wt*(L>=3?1.5:1)]);};
    if(w==='vit'){add('ship',2);if(s===0)add('gig',3);if(L>=3&&s>=1&&s<=2&&!F.jv.some(j=>j.w==='vit'&&(j.t==='gaz'||j.t==='trans'))&&eqOf(W)>=3e5)add('jv',1.5);}
    if(w==='bars'){add('prof',2);if(s===0)add('gig',2);}
    if(w==='owl'){add('rate',s>=1?1.5:0);if(L>=3&&W.hold===1&&F.dn.owl4!==undefined&&!F.jv.some(j=>j.w==='owl')&&eqOf(W)>=2e7)add('jv',1.5);}
    if(w==='beav'&&L>=3){if(s>=1&&s<=2&&!F.jv.some(j=>j.w==='beav'&&j.t==='pnt')&&eqOf(W)>=3e5)add('jv',2);add('buy',1.5);}}
  if(!c.length)return null;let tot=0;for(const x of c)tot+=x[2];let r=rnd(F)*tot,pk=c[0];for(const x of c){r-=x[2];if(r<=0){pk=x;break;}}
  const [w,p]=pk,a={p};if(p==='jv')a.a=jvAmt(W,w);
  return {id:'q'+(F.n++),k:'rq',r:'offer',w,t:W.t,a,x:W.t+45};}
function pariMake(W,F){const r=W.reps&&W.reps[W.reps.length-1];const base=r&&r.pl?r.pl.rev:0;if(!(base>0))return null;
  return {id:'q'+(F.n++),k:'rq',r:'pari',w:'beav',t:W.t,a:{a:nice(clamp(eqOf(W)*PK.pari,2e3,5e5)),base:rnd0(base),tg:rnd0(base*1.1)},x:W.t+30};}
function rqMake(W,F){const s=si(W),eq=eqOf(W),pool=[];
  // M20: пари и предложение друга слот просьб не занимают (раньше пари Бориса вытесняло его просьбы — минус почти не срабатывал)
  for(const w of FR){if(F.q.some(x=>x.w===w&&x.r!=='pari'&&x.r!=='offer'))continue;
    // займов меньше (вес 3 → 1,5): просьбы «сходи со мной» (visit) — без денег
    if(w!=='owl'&&acctOk(W)&&eq>=2e4)pool.push([w,'loan',1.5]);
    pool.push([w,'gift',1]);
    if(w!=='owl'&&s>=1&&s<=2)pool.push([w,'watch',1.2]);
    if(w==='owl'||w==='bars')pool.push([w,'advice',1.5]);
    if(w!=='owl'||s>=1)pool.push([w,'visit',1.5]);}
  if(!pool.length)return null;let tot=0;for(const p of pool)tot+=p[2];let x=rnd(F)*tot,pk=pool[0];for(const p of pool){x-=p[2];if(x<=0){pk=p;break;}}
  const [w,k]=pk,a={};
  if(k==='loan'){a.a=nice(clamp(eq*.03,5e3,5e7));a.n=3+Math.floor(rnd(F)*4);a.v=Math.floor(rnd(F)*3);}
  if(k==='gift'){a.a=nice(clamp(eq*.002,2e3,5e5));a.v=Math.floor(rnd(F)*3);}
  if(k==='watch'||k==='advice'||k==='visit')a.v=Math.floor(rnd(F)*3);
  return {id:'q'+(F.n++),k:'rq',r:k,w,t:W.t,a,x:W.t+60};}
function reuSnap(W,F,y){const r={you:rnd0(E.equity(W))};for(const id of ALL){if(id==='bear'&&!F.bear.seen)continue;r[id]=capOf(W,id);}
  const prev=F.rh.length?F.rh[F.rh.length-1].r:null;
  F.rh.push({m:W.m,y,r,p:prev?Object.assign({},prev):null,cr:0});if(F.rh.length>8)F.rh.shift();return F.rh.length-1;}
// место на встрече и 💎 за него (не за деньги): 1-е — 10, 2-е — 6, 3-е — 4, дальше — 2
function reuPlace(h){const a=Object.keys(h.r).filter(id=>id!=='bear').map(id=>({id,v:h.r[id]})).sort((x,y)=>y.v-x.v);return a.findIndex(x=>x.id==='you')+1;}
const REU_CR=[10,6,4,2,2,2,2];
// снимок встречи для сцены (по месяцу; индекс — запасной путь)
function reuOf(F,q){const a=q&&q.a||{};return F.rh.find(h=>a.m!==undefined&&h.m===a.m)||F.rh[a.i]||null;}
function qPush(W,F,o){F.q.push(o);if(o.big)F.lbm=W.m;return o;}
const SC_X=45;   // срок ответа на обычную сцену (дней онлайн): потом друг решает сам, мягко, без штрафа — очередь идёт дальше
function scenesDay(W,F){
  for(const x of F.q.slice())if(x.k!=='rq'&&!x.big){if(!x.x)x.x=x.t+SC_X;if(W.t>=x.x){F.q=F.q.filter(y=>y!==x);F.dn[x.k]=W.t;if(x.w!=='all')feed(W,F,x.w,'self',{sc:x.k});}}
  // сюжетные сцены: одна обычная в очереди, между ответами ≥ 30 дней; большие (встречи, крах Бориса) — без паузы
  // большие сцены (кроме встреч, IPO и событий глав — BIG_FREE) не толпятся: одна неотвеченная (моложе 60 дней) и не чаще раза в BIG_GAP дней
  const bigBusy=F.q.some(x=>x.big&&!BIG_FREE[x.k]&&x.k!=='reu'&&x.k!=='ipo'&&W.t-x.t<60)||W.t-F.lb<BIG_GAP;
  for(const k of ORDER){const s=SC[k];if(F.dn[k]!==undefined&&!s.rep)continue;if(F.q.some(x=>x.k===k))continue;
    if(!s.big&&(F.q.some(x=>!x.big&&x.k!=='rq')||W.t-F.ls<30))continue;
    if(s.big&&!BIG_FREE[k]&&bigBusy)continue;
    let ok=false;try{ok=s.when(W,F);}catch(e){ok=false;}if(!ok)continue;
    qPush(W,F,{id:'s'+(F.n++),k,w:s.w,t:W.t,a:s.prm?s.prm(W,F):{},big:s.big?1:0});
    if(s.w==='bear')F.bear.seen=1;
    if(s.big&&!BIG_FREE[k]){F.lb=W.t;break;}
    if(!s.big)break;}
  // глава прошла, а сцена не успела (кредитка в «Сети», ларёк Бориса в «Недрах») — больше не нужна
  if(F.dn.owl1===undefined&&F.rags&&si(W)>=2)F.dn.owl1=W.t;
  // «первая выручка» — только пока точек немного (старое сохранение с сетью её не получит)
  if(F.dn.first1===undefined&&(W.biz||[]).length>3&&!F.q.some(x=>x.k==='first1'))F.dn.first1=W.t;
  if(F.rags&&W.ned){for(const k of ['beav1','beav2','bars1','beav3','vit3','bars2','owl2','beav4','bars3','tpt1','tpt2','part','first1','bars5','beav6','owlno','vitno','beavno','barsno','partyno'])if(F.dn[k]===undefined&&!F.q.some(x=>x.k===k))F.dn[k]=W.t;
    if(!F.part)F.part='owl';if(F.dn.tpt1!==undefined)F.bear.met=1;
    // неотвеченный выбор партнёра к моменту входа в недра — по умолчанию фонд Сони (как в окне главы 5)
    const pq=F.q.find(x=>x.k==='part');if(pq){F.q=F.q.filter(x=>x!==pq);F.dn.part=W.t;}}
  // просьбы: протухшая просьба уходит без штрафа («справился сам»)
  for(const x of F.q.slice())if(x.k==='rq'&&W.t>=x.x){F.q=F.q.filter(y=>y!==x);feed(W,F,x.w,'self',{r:x.r,v:x.a&&x.a.v});
    // M18: оставили просьбу без ответа — чуть прохладнее (−3); предложение и пари — без штрафа
    if(x.r!=='offer'&&x.r!=='pari'){const d=tr(F,x.w,-3,1);log(W,F,x.w,'ign',x.r,d);}}}
// месяц «жизни» друзей: капитал, встреча выпускников, лента, просьбы
function monthLite(W,F,m){const y=(m-F.m0)/12,mm=m-F.m0;
  for(const id of ALL){const x=F[id];x.k=clamp(x.k+(tgt(id,y)-x.k)*.25+SD[id]*nrm(F),.05,5);x.c=capOf(W,id);}
  if(W.ned&&W.bots)for(const b of W.bots)if(F[b.id]&&F[b.id].tr!==undefined)b.tr=F[b.id].tr;
  if(W.ned&&F.mn===undefined)F.mn=m;
  // встреча выпускников — каждые 5 лет по календарю: январь 2032 («15 лет»), 2037, 2042…
  if(m>0&&m%60===0&&!F.q.some(x=>x.k==='reu'&&x.a.m===m)&&!F.rh.some(h=>h.m===m)){const yy=10+m/12;qPush(W,F,{id:'s'+(F.n++),k:'reu',w:'all',t:W.t,a:{i:reuSnap(W,F,yy),m,y:yy},big:1});}
  // лента: события «пути» друзей по годам (только в истории «с нуля») и мелочи жизни
  if(F.rags)for(const f of TL)if(f[0]===mm&&(!f[3]||f[3](W,F)))feed(W,F,f[1],f[2],null,f[4]);
  // отложенные письма (свадьба Вити, стажёр Петра)
  for(const x of F.lt.slice())if(m>=x.m){F.lt=F.lt.filter(y=>y!==x);feed(W,F,x.w,x.k,x.a,0);}
  // мелочи жизни: 12 реплик на друга, без повтора последних
  if(rnd(F)<.45){const w=FR[Math.floor(rnd(F)*4)];let v=Math.floor(rnd(F)*LIFE_N);rnd(F);
    const seen=F.fd.slice(-12).filter(f=>f.k==='life'&&f.w===w).map(f=>f.a&&f.a.v);for(let i=0;i<LIFE_N&&seen.indexOf(v)>=0;i++)v=(v+5)%LIFE_N;
    feed(W,F,w,'life',{v},lifeCg(w,v));}
  if((W.ned||F.bear.seen)&&rnd(F)<.2){feed(W,F,'bear','bearnews',{v:Math.floor(rnd(F)*3)});}
  // просьбы друзей: раз в 2–4 месяца
  if(m>=F.rq&&!F.q.some(x=>x.k==='rq')&&(W.t>=40)){const q=rqMake(W,F);if(q)qPush(W,F,q);F.rq=m+2+Math.floor(rnd(F)*3);}
  relMonth(W,F,m);}
// M18: месяц отношений — молчание, «обогнал Бориса», «точка рядом» при холоде, предложения и пари, письма «итоги пользы»
function relMonth(W,F,m){
  for(const w of FR){const x=F[w],idle=m-x.lc;
    // 4+ месяца без общения — к нейтралу (+10): плюс тает на 1 в месяц, обида проходит на 1 раз в 2 месяца (быстрее — помириться: позвонить, зайти в гости, помочь)
    if(idle>=4){if(x.rel>REL_HOME)tr(F,w,-1,2);else if(x.rel<REL_HOME&&m%2===0)tr(F,w,1,2);}
    if(idle>=4&&x.rel>=30&&!x.ms){x.ms=1;feed(W,F,w,'miss');}
    if(m%3===0&&(x.ga||0)>=500){feed(W,F,w,'sav',{a:rnd0(x.ga)});x.ga=0;}}
  // обогнали Бориса по капиталу (с запасом 10 %, чтобы не мигало) — он ворчит (−3) и зовёт на реванш-пари
  if(!W.ned){const you=eqOf(W),bv=capOf(W,'beav');if(F.ob===undefined)F.ob=you>bv?1:0;
    else if(!F.ob&&you>bv*1.1&&you>2e4){F.ob=1;const d=tr(F,'beav',-3,1);log(W,F,'beav','ovt','',d);feed(W,F,'beav','ovt');F.pq=1;}
    else if(F.ob&&you<bv*.9){F.ob=0;feed(W,F,'beav','ovt2');}}
  // прохладно с Борисом: раз в год может поставить точку рядом с вашей — −8 % покупателей (в ссоре −12 %) на 3 месяца
  const B=F.beav,Lb=lv(F,'beav');
  if(!W.ned&&Lb<=1&&m-B.rm>=12&&rnd(F)<.35){const pts=(W.biz||[]).filter(b=>b.st==='w'&&E.BIZ&&E.BIZ[b.t]&&E.BIZ[b.t].st==='small'&&b.ev);
    if(pts.length){const b=pts[Math.floor(rnd(F)*pts.length)];b.ev.bfr=[m+3,PK.rival[Lb]];B.rm=m;feed(W,F,'beav','rival',{bt:b.t,p:Math.round((1-PK.rival[Lb])*100)});log(W,F,'beav','rival',b.t,0);sx(F,{k:'minus',w:'beav',p:'rival'});}}
  // друг сам предлагает помощь или дело — раз в 4–6 месяцев
  if(m>=F.om&&W.t>=40&&!F.q.some(x=>x.r==='offer')){const q=offerMake(W,F);if(q){qPush(W,F,q);sx(F,{k:'offer',w:q.w,p:q.a.p});}F.om=m+4+Math.floor(rnd(F)*3);}
  // пари с Борисом: не чаще раза в 4 месяца (после «обгона» — сразу); его просьбы пари не ждут (M20)
  if(!W.ned&&W.st!=='quarry'&&Lb>=1&&!F.pari&&m-B.pm>=4&&m-F.m0>=3&&!F.q.some(x=>x.r==='pari')&&(F.pq||rnd(F)<.3)){const q=pariMake(W,F);if(q){qPush(W,F,q);F.pq=0;B.pm=m;}}}
// «Поздравить» у бытовых новостей — только у настоящих поводов (забег, день рождения), не у «пробки»
const LIFE_N=12;
const LCG={owl:[2,8],beav:[0,9],vit:[2,7],bars:[6,10]};
function lifeCg(w,v){return (LCG[w]||[]).indexOf(v)>=0?1:0;}
// лента по годам (мм от старта, кто, ключ, условие, можно поздравить)
const TL=[[2,'vit','gazel'],[5,'owl','best',null,1],[7,'bars','shift'],[20,'beav','kiosk2'],[30,'bars','son1',null,1],[40,'owl','head',null,1],[45,'vit','cars5',null,1],
  [50,'bars','project',null,1],[52,'bear','plant'],[66,'beav','back'],[75,'owl','leave'],[90,'bars','son2',null,1],[100,'bear','vitlook'],[110,'vit','wagons',null,1],[125,'owl','fund',null,1]];
function scanNews(W,F){for(const n of W.news){if(n.t<=F.nt)continue;const a=n.a||{};
    if(n.k==='lost'&&FR.indexOf(a.b)>=0)feed(W,F,a.b,'gg',{g:a.g});
    else if(n.k==='biz'&&a.k==='opilost'&&FR.indexOf(a.who)>=0)feed(W,F,a.who,'gg',{g:a.pg});
    else if(n.k==='biz'&&a.k==='bobr')feed(W,F,'beav','bobr');
    else if(n.k==='bizev'&&a.c>0&&REPK[a.k])repHelp(W,F,a);
    else if(n.k==='bizev'&&a.k==='demol'&&a.c>0)moveHelp(W,F,a);
    else if(n.k==='biz'&&a.k==='open')capHelp(W,F,a);
    else if(n.k==='bizev'&&a.k==='bobrov'){F.bobk=1;if(F.dn.beav1!==undefined&&W.m-(F.k3m===undefined?-99:F.k3m)>=12){F.k3m=W.m;feed(W,F,'beav','kiosk3',{s:si(W)});}}}
  if(W.news.length)F.nt=Math.max(F.nt,W.news[W.news.length-1].t);}
// M18: Пётр — ремонт поломок дешевле (−40/−60 %; «профилактика» — бесплатно) и простой короче; Витя — переезд точки (снос НТО) за полцены; Пётр — монтаж новой точки дешевле
const REPK={brk:1,pump:1,oven:1,pcbrk:1,warr:1};
function repHelp(W,F,a){const L=lv(F,'bars'),r=F.bars.fx>=W.m?1:PK.rep[L];if(!(r>0))return;const x=rnd0(a.c*r);if(x<=0)return;
  recv(W,x,'oth');pl(W,'oth',x);gain(F,'bars',x);const b=(W.biz||[]).find(q=>q.id===a.id);if(b&&b.down>1)b.down=Math.max(1,b.down-1);
  log(W,F,'bars','rep',a.bt||'',0,{a:x});if(W.t-(F.bars.rt||-99)>=20){F.bars.rt=W.t;feed(W,F,'bars','rep',{a:x,bt:a.bt,c:a.c});}}
function moveHelp(W,F,a){const r=PK.move[lv(F,'vit')];if(!(r>0))return;const x=rnd0(a.c*r);recv(W,x,'oth');pl(W,'oth',x);gain(F,'vit',x);log(W,F,'vit','move',a.bt||'',0,{a:x});feed(W,F,'vit','move',{a:x,bt:a.bt});}
function capHelp(W,F,a){const r=PK.cap[lv(F,'bars')];if(!(r>0)||!E.BIZ||!E.BIZ[a.bt]||E.BIZ[a.bt].st!=='small')return;const b=(W.biz||[]).slice().reverse().find(q=>q.t===a.bt&&q.st==='b'&&!q.tot&&!q.frd);if(!b)return;b.frd=1;
  const x=rnd0(b.paid*r);if(x<=0)return;recv(W,x,'capex');b.paid-=x;b.cost-=x;if(lv(F,'bars')>=4&&b.left>1)b.left--;gain(F,'bars',x);log(W,F,'bars','cap',a.bt,0,{a:x});feed(W,F,'bars','cap',{a:x,bt:a.bt});}
function loansDay(W,F){for(const id of FR){const x=F[id];if(!x.ln)continue;if(!W.loans.some(l=>l.id===x.ln)){x.ln=null;const d=tr(F,id,5);log(W,F,id,'repaid','',d);feed(W,F,id,'thanks');}}}

/* ---------------- хуки ---------------- */
function storyDay(W,off,out){const F=fr(W);if(F.ld===W.t)return;F.ld=W.t;
  // пока игрока нет (офлайн), сроки ответа на просьбы и сцены не идут — «справился сам» не сыплется за ночь
  if(off)for(const x of F.q)if(x.x)x.x++;
  // месяцы «жизни» друзей (и пропущенные — после офлайна)
  if(F.lm<W.m){const from=Math.max(F.lm+1,W.m-12);for(let m=from;m<=W.m;m++)monthLite(W,F,m);F.lm=W.m;}
  loansDay(W,F);scanNews(W,F);
  // M18: сменился уровень отношений — друг пишет (не чаще раза в 30 дней на друга)
  if(F.lvq&&F.lvq.length){for(const e of F.lvq){const x=F[e.w];if(!x||W.t-(x.lvt||-99)<30)continue;x.lvt=W.t;feed(W,F,e.w,e.b>e.a?'lvup':'lvdn',{a:e.a,b:e.b});}F.lvq=[];}
  const n0=F.q.length;scenesDay(W,F);if(out&&F.q.length>n0)out.push({k:'story'});}
// закрытие месяца: СП, возвраты займов друзьям, ретро-бонусы, поручительства. M — месяц, в который пишем; src — откуда брать закупки/логистику
function book(W,F,M,srcM){jvMonth(W,F);
  // займы друзьям: срок пришёл — друг возвращает (друзья не подводят)
  // M18: вернут или задержат? Надёжность — от друга и отношений (Борис в год краха — хуже); задержка — один раз на 2 месяца, потом вернут с «процентом» 5 %. Не пропадает никогда
  for(const x of F.ln.slice())if(W.m>=x.due){const L=lv(F,x.w),y=(W.m-F.m0)/12,crash=x.w==='beav'&&y>=4.5&&y<6;
    const p=clamp(.72+.06*L-(crash?.35:0)+(x.w==='owl'||x.w==='bars'?.1:0),.3,.97);
    if(!x.dl&&rnd(F)>p){x.dl=1;x.due=W.m+2;stc(F,x.w,'lt');feed(W,F,x.w,'late',{a:x.a});log(W,F,x.w,'lendlate','',0,{a:x.a});continue;}
    const bon=x.dl?rnd0(x.a*.05):0;recvA(W,x.a,'lendb');if(bon){recv(W,bon,'oth');pl(W,'oth',bon);}F.ln=F.ln.filter(y=>y!==x);stc(F,x.w,'bk',x.a+bon);
    const d=tr(F,x.w,x.dl?3:5);feed(W,F,x.w,'back2',{a:x.a,b:bon});log(W,F,x.w,'lendback','',d,{a:x.a+bon});}
  pariClose(W,F,M);
  retro(W,srcM||M,F);
  // поручительство за Петра по ипотеке: при доверии ≥ 50 он платит всегда; ниже — изредка платёж ложится на вас
  if(F.gp>=W.m&&F.bars.tr<50&&rnd(F)<.05){const a=pay(W,45000,'oth');pl(W,'oth',-a);feed(W,F,'bars','gpay',{a});}
  // поручительство Сони: просрочка по такому кредиту (овердрафт) — доверие −50, один раз на кредит
  if(W.odM>0)for(const l of W.loans)if(l.gu==='owl'&&!l.guP){l.guP=1;const d=tr(F,'owl',-20);log(W,F,'owl','gulate','',d);}}
// пари с Борисом: закрывается месяц спора — выручка ≥ цели → Борис платит ставку, иначе платите вы (прочие доходы/расходы). Честная игра: ❤ Бориса +3 в любом случае
function pariClose(W,F,M){const P=F.pari;if(!P||W.m<P.m)return;F.pari=null;if(W.m>P.m||!M||!M.pl){if(P.cr)crAdd(F,P.cr);return;}   // пропущенный месяц — ставку 💎 возвращаем
  const rev=M.pl.rev||0,win=rev>=P.tg,a=P.a,cr=P.cr||0;
  if(cr){if(win)crAdd(F,2*cr);}   // 💎: ставка уже списана — выигрыш возвращает её вдвое
  else if(win){recv(W,a,'oth');pl(W,'oth',a);gain(F,P.w,a);}else{const x=pay(W,Math.min(a,Math.max(0,W.cash)),'oth');pl(W,'oth',-x);}
  const d=tr(F,P.w,3);feed(W,F,P.w,win?'pwin':'plose',{a,cr,r:rnd0(rev),tg:P.tg});log(W,F,P.w,win?'pwin':'plose','',d,cr?{a:0,cr}:{a});sx(F,{k:'pari',w:P.w,r:win?'win':'lose'});}
function storyClose(W,M,off){const F=fr(W);if(F.cm>=W.m)return;F.cm=W.m;book(W,F,M,null);ghSnap(F,W.m);}
// после закрытия, которое прошло без хука (мир недр без точек): пишем в новый месяц, закупки берём из отчёта
function storyAfter(W){const F=fr(W);const last=W.m-1;if(F.cm>=last)return;const n=Math.min(12,last-F.cm);
  const r=W.reps[W.reps.length-1];for(let i=0;i<n;i++)book(W,F,W.mon,i===n-1&&r?r:{cf:{}});F.cm=last;ghSnap(F,last);}
// ретро-бонусы: общая закупка с Борисом (−5 % товара, 12 мес.), машины Вити (−25 % доставки в месяц звонка; после выкупа доли у Топтыгина — −15 % всегда)
function retro(W,M,F){const cf=M&&M.cf||{},supp=Math.max(0,-(cf.supp||0)),lg=Math.max(0,-(cf.log||0)),Lv=lv(F,'vit');
  // закупки: общая закупка с Борисом (−4…5 %), Витя «везу товар» (−6 %, 2 мес.), Витя-друг (−1/−2 % всегда); вместе не больше 8 %
  const ned=!!W.ned,rb=F.buy>=W.m&&!ned?(F.buyR||.05):0,rv=ned?0:Math.max(F.vship>=W.m?PK.ship:0,PK.sup[Lv]),rs=Math.min(.05,rb+rv);   // в «Недрах» — только прежние скидки (доля Топтыгина, машины на месяц)
  if(rs>0&&supp>0){const a=Math.min(PK.cap1,rnd0(supp*rs));if(a>0){recv(W,a,'supp');pl(W,'cogs',-a);sgAdd(W,'retail',0,a);if(rb)gain(F,'beav',rnd0(a*rb/rs));if(rv)gain(F,'vit',rnd0(a*rv/rs));}}
  // доставка: машины Вити (−25 % в месяц звонка), Витя-друг (−10/−15 %), после выкупа доли у Топтыгина — −15 % всегда; в ссоре — +10 %
  const r=Math.max(F.vlg===W.m?.25:0,F.vit.disc||0,ned?0:PK.logd[Lv]);if(r>0&&lg>0){const a=rnd0(lg*r>PK.capL&&!F.vit.disc&&F.vlg!==W.m?PK.capL:lg*r);if(a>0){recv(W,a,'log');pl(W,'log',-a);gain(F,'vit',a);}}
  else if(PK.logUp[Lv]>0&&lg>0&&!ned){const a=rnd0(lg*PK.logUp[Lv]);if(a>0&&W.cash>a){pay(W,a,'log');pl(W,'log',a);}}}
function storyBal(W){let jv=0,lend=0;const F=W.fr;if(F&&F.v){for(const j of F.jv)jv+=j.inv;for(const x of F.ln)lend+=x.a;}return {jv,lend};}
// поручительство Сони (−2/−3 п. п. и лимит ×1,3 на один кредит); в холоде — ставка +0,5 п. п. (в ссоре +1): «в банке про вас наслышаны»
function storyGuar(W){const F=W.fr;if(!F||!F.v||!F.owl)return null;const L=lv(F,'owl');
  if(F.owl.gu>=W.m)return {lim:PK.guarLim,dr:PK.guarDr[L]||-.01};if(PK.rateUp[L]>0&&!W.ned)return {lim:1,dr:PK.rateUp[L]};return null;}
function storyGuarUse(W,l){const F=W.fr;if(F&&F.v&&F.owl.gu>=W.m){l.gu='owl';F.owl.gu=-1;const dr=-(PK.guarDr[lv(F,'owl')]||-.01);
  gain(F,'owl',rnd0(l.a*dr*Math.min(3,(l.n||12)/12)));log(W,F,'owl','guse','',0,{a:l.a,r:dr});}}   // «сэкономила вам» — проценты за срок (до 3 лет), оценка

/* ---------------- действия игрока ---------------- */
// ответ на сцену/просьбу: qid — id из W.fr.q, o — 'a'|'b'|'c'. → {res:'ok', d (доверие), k, w, o, cr?} | {res:'no'|'cash'|…}
function scOf(q){return q.k==='rq'?{o:RQ[q.r]}:q.k==='reu'||q.k==='ipo'?{o:{a:{fx:()=>0}}}:SC[q.k];}
function optsOf(W,q){const F=fr(W);const s=scOf(q);const out=[];if(!s||!s.o)return [{o:'a',ok:true}];
  for(const k in s.o){const x=s.o[k];let ok=true;try{ok=x.ok?x.ok(W,F,q):true;}catch(e){ok='no';}if(ok==='skip'||ok==='no'&&!acctOk(W))continue;out.push({o:k,ok});}return out;}
function friendAnswer(W,qid,o){const F=fr(W),q=F.q.find(x=>x.id===qid||x.k===qid);if(!q)return {res:'no'};
  const op=optsOf(W,q).find(x=>x.o===(o||'a'));if(!op)return {res:'no'};if(op.ok!==true)return {res:op.ok};
  const s=scOf(q);
  const d=(s.o&&s.o[op.o]?s.o[op.o].fx(W,F,q):0)||0;
  F.q=F.q.filter(x=>x!==q);if(q.k!=='rq'&&q.k!=='reu')F.dn[q.k]=W.t;if(!q.big)F.ls=W.t;
  const r={res:'ok',d,k:q.k,w:q.w,o:op.o,r:q.r,a:q.a};
  // M18: пришли на встречу выпускников — ❤ всем друзьям +5
  if(q.k==='reu'){for(const id of FR)tr(F,id,5);r.all=5;}
  if(q.k==='rq')sx(F,{k:'ans',w:q.w,r:q.r,o:op.o});
  // встреча выпускников: 💎 за место (один раз на встречу)
  if(q.k==='reu'||q.k==='pro'){const h=reuOf(F,q);if(h){r.place=reuPlace(h);r.y=h.y;if(!h.cr)r.cr=h.cr=REU_CR[r.place-1]||2;
    // переходящий кубок 11 «Б» — у того, кто дальше всех на встрече
    const lead=Object.keys(h.r).filter(id=>id!=='bear').sort((x,y)=>h.r[y]-h.r[x])[0];if(lead){r.cup0=F.cup||'beav';F.cup=lead;r.cup=lead;}}}
  log(W,F,q.w,q.k==='rq'?'rq_'+q.r:q.k,op.o,d,q.a);return r;}
// «📞 Позвонить»: что можно попросить у друга сейчас. → [{k, ok:true|код, need (доверие), a (сумма)}]
// M18: «🙏 Попросить помощь» — у каждого своё, открывается по уровню отношений (NEED — индекс уровня), у каждой просьбы свой откат (CD, мес.)
const CALL={owl:['check','guar','bridge'],beav:['pari','loan','buy'],bars:['build','fix','expert'],vit:['gig','loan','truck']};
const NEED={check:1,guar:3,bridge:3,pari:1,loan:2,buy:3,build:2,fix:2,expert:2,gig:1,truck:3};
const CD={check:0,guar:6,bridge:6,pari:4,loan:3,buy:6,build:6,fix:6,expert:1,gig:1,truck:3};
function cdOf(x,k,m){const c=x.cd&&typeof x.cd[k]==='number'?x.cd[k]:-99;return Math.max(0,c-m);}
function callOpts(W,w){const F=fr(W),x=F[w];if(!x||!CALL[w])return [];if(!x.cd||typeof x.cd!=='object')x.cd={};const L=lv(F,w),out=[];
  for(const k of CALL[w]){let ok=true;const cd=cdOf(x,k,W.m);
    if(k==='gig'&&(W.ned||si(W)>1||!W.me))continue;                                  // заказы от друга — только в главе «Карьера» и в начале «Своего дела»
    if(k==='expert'&&!W.ned&&W.st!=='quarry'&&!(W.opi||[]).some(p=>p.st==='auc'||p.st==='list'))continue;
    if(k==='pari'&&(W.ned||W.st==='quarry'))continue;
    if(L<NEED[k])ok='trust';else if(cd>0)ok='cd';
    else if(k==='loan'&&x.ln)ok='owe';
    else if(k==='bridge'&&x.ln)ok='owe';
    else if(k==='bridge'&&bankPay(W)<=0)ok='nobank';
    else if(k==='guar'&&x.gu>=W.m)ok='active';
    else if(k==='guar'&&!(E.loanOffer&&E.loanOffer(W).max>0))ok='bank';
    else if(k==='pari'&&(F.pari||F.q.some(q=>q.r==='pari')))ok='active';
    else if(k==='pari'&&!(W.reps&&W.reps.length&&W.reps[W.reps.length-1].pl.rev>0))ok='norev';
    else if(k==='buy'&&(W.ned||!supOn(W)))ok='nosup';
    else if(k==='buy'&&F.buy>=W.m)ok='active';
    else if(k==='build'&&!buildList(W).length)ok='nobuild';
    else if(k==='fix'&&!repairsOn(W))ok='nopts';
    else if(k==='fix'&&x.fx>=W.m)ok='active';
    else if(k==='expert'&&!expertList(W).length)ok='noauc';
    else if(k==='gig'&&!gigSrc(W,w))ok='nogig';
    else if(k==='truck'&&F.vlg===W.m)ok='active';
    const o={k,ok,need:NEED[k],cd,a:0,w};
    if(k==='loan')o.a=frLoanMax(W,w);if(k==='bridge')o.a=bridgeA(W);if(k==='pari')o.a=nice(clamp(eqOf(W)*PK.pari,2e3,5e5));
    if(k==='gig'){const g=gigSrc(W,w);o.a=g?rnd0(g.pay*PK.gig):0;}if(k==='build')o.a=PK.build[L];
    out.push(o);}
  return out;}
function bridgeA(W){return Math.min(frLoanMax(W,'owl'),Math.max(1e4,nice(bankPay(W)*PK.bridgeK)));}
// совет по налогу (Соня): что дешевле по вашим месяцам — УСН 6 % или 15 %, и можно ли сменить сейчас
function taxAdv(W){if(!W.ip||W.ned||!E.taxCmp)return null;const c=E.taxCmp(W);if(!c||c.n<2)return {n:c?c.n:0};const best=c.usn15<c.usn6?'usn15':'usn6';
  return {n:c.n,cur:W.taxm,best,diff:rnd0(Math.abs(c.usn6-c.usn15)/c.n*12),can:!!(E.taxOk&&E.taxOk(W))};}
function buildList(W){const a=[];for(const o of W.obj||[])if(o.st==='b'||o.up)a.push(o);for(const b of W.biz||[])if(b.st==='b')a.push(b);return a;}
function expertList(W){const a=[];for(const x of W.auc||[]){const p=E.plotById(W,x.p);if(p&&p.dep)a.push({r:x.r,g:x.g,res:p.dep.res,vc:p.dep.vc,V:x.V,p:x.p});}
  for(const p of W.opi||[])if(p.st==='auc'||p.st==='list')a.push({r:W.home||'kuz',g:p.g,V:p.V,res:p.res,opi:1});return a;}
// сводка «Проверю сделку» (Соня): сколько месяцев проживём на деньгах, долг к EBITDA, овердрафт
function checkOf(W){const r=W.reps&&W.reps[W.reps.length-1];let out=0,e=0;if(r){const c=r.cf;for(const k of ['supp','fix','log','adm','int','tax'])out+=Math.max(0,-(c[k]||0));e=E.ebitdaOf(r.pl);}
  let debt=0;for(const l of W.loans)if(l.k!=='fr')debt+=l.a;return {cashM:out>0?W.cash/out:99,lev:e>0?debt/(e*12):debt>0?99:0,od:W.odM>0,debt};}
function friendCall(W,w,k,arg){const F=fr(W),x=F[w];const op=callOpts(W,w).find(y=>y.k===k);if(!op)return {res:'no'};if(op.ok!==true)return {res:op.ok};
  arg=arg||{};const L=lv(F,w);let r={res:'ok',k,w};
  if(k==='loan'){const a=Math.max(1000,Math.min(op.a,nice(arg.a||op.a))),n=arg.n===12?12:6;frLoan(W,F,w,a,n);r.a=a;r.n=n;}
  else if(k==='bridge'){const a=op.a;frLoan(W,F,w,a,3);r.a=a;r.n=3;gain(F,w,rnd0(a*((E.bizLoanRate?E.bizLoanRate(W):.2)/4)));}   // «перекрою платёж»: 3 месяца без процентов (экономия — как проценты банка за квартал)
  else if(k==='guar'){x.gu=W.m+3;r.dr=-PK.guarDr[L];stc(F,w,'h');}
  else if(k==='check'){r.c=checkOf(W);r.tax=taxAdv(W);}
  else if(k==='pari'){const q=pariMake(W,F);if(!q)return {res:'norev'};const cr=arg.cr?PARI_CR:0;if(cr&&crN()<cr)return {res:'crno'};
    F.pari={w,a:cr?0:q.a.a,cr,m:W.m+1,base:q.a.base,tg:q.a.tg};if(cr)crAdd(F,-cr);x.pm=W.m;r.a=F.pari.a;r.cr=cr;r.tg=q.a.tg;r.base=q.a.base;sx(F,{k:'pari',w,r:'on',cr:cr?1:0});}
  else if(k==='buy'){perkOn(W,F,w,'buy');r.m=Math.max(3,PK.buyM[L]);}
  else if(k==='expert'){r.list=expertList(W);stc(F,w,'h');}
  else if(k==='build'){let n=0;const f=PK.build[L]||.1;for(const o of buildList(W)){const j=o.up||o;if(j.left>1){const c=Math.max(1,Math.round(j.left*(o.t&&E.OBJ&&E.OBJ[o.t]?Math.min(.1,f):f)));j.left=Math.max(1,j.left-c);n++;}}r.n=n;r.f=f;stc(F,w,'h');}
  else if(k==='fix'){perkOn(W,F,w,'prof');r.m=PK.fixM;}
  else if(k==='gig'){r.a=perkOn(W,F,w,'gig');}
  else if(k==='truck'){F.vlg=W.m;stc(F,w,'h');}
  if(!x.cd||typeof x.cd!=='object')x.cd={};if(CD[k])x.cd[k]=W.m+CD[k];x.lc=W.m;x.ms=0;
  if(k!=='check')sx(F,{k:'ask',w,p:k});log(W,F,w,'call_'+k,'',0,r.a?{a:r.a,n:r.n}:null);return r;}
// M18: «📞 Позвонить» — просто поговорить: раз в месяц на друга ❤ +1
function friendChat(W,w){const F=fr(W),x=F[w];if(!x||FR.indexOf(w)<0)return {res:'no'};if(x.km===W.m)return {res:'month',w};
  x.km=W.m;const d=tr(F,w,x.rel>=50?.5:PK.call);log(W,F,w,'chat','',d);return {res:'ok',w,k:'chat',d,L:lv(F,w)};}
// «🏠 Сходить в гости» — раз в месяц на друга: ❤ +4 (от +50 — +2), а если в ссоре или прохладно — «помирились» (+15). Силы ⚡ −20 в главах 1–2.
// src='econ' — визит уже «оплачен» делом хозяина (руки, силы) в biz.js/«Дела хозяина»: здесь только отношения
function friendVisit(W,w,src){const F=fr(W),x=F[w];if(!x||FR.indexOf(w)<0)return {res:'no'};if(x.vm===W.m)return {res:'month',w};
  if(src!=='econ'&&W.me&&!W.ned){if((W.me.en||0)<PK.visitE)return {res:'en',w};W.me.en-=PK.visitE;}
  const L=lv(F,w),peace=L<=1;x.vm=W.m;const d=tr(F,w,peace?PK.peace:x.rel>=50?PK.visit/2:PK.visit);stc(F,w,'g');log(W,F,w,peace?'peace':'visit','',d);sx(F,{k:'visit',w,p:peace?1:0});
  if(peace)feed(W,F,w,'peace');return {res:'ok',w,k:'visit',d,peace:peace?1:0,L:lv(F,w)};}
// «Поздравить» новость друга: +2 доверия, раз в квартал на друга
function congrats(W,idx){const F=fr(W),f=F.fd[idx];if(!f||!f.c||f.g||!F[f.w]||f.w==='bear')return 'no';const q=Math.floor(W.m/3);if(F[f.w].cg===q)return 'quarter';
  f.g=1;F[f.w].cg=q;const d=tr(F,f.w,2);log(W,F,f.w,'congr',f.k,d);return 'ok';}
function storyRead(W){const F=fr(W);F.rd=W.t;return 'ok';}
function storyTouch(W){fr(W);return 'ok';}   // пустое действие: сохранить мир через GAME.act
// IPO: новый холдинг — друзья те же (доверие, история, встречи), займы и СП остались в старой компании
// info — запись IPO {hold, eq} (для кадра «Фото на память»: «начинали с 5 000 ₽ — сегодня …»)
function storyCarry(W,F0,info){if(!F0||!F0.v)return fr(W);const F=init(W);F.m0=F0.m0;F.rags=F0.rags;
  for(const id of FR){F[id].tr=F0[id].tr;F[id].k=F0[id].k;if(typeof F0[id].rel==='number')F[id].rel=F0[id].rel;if(F0[id].st)F[id].st=Object.assign({},F0[id].st);for(const k of ['hlp','disc','plan','opi','solo','wed','intern'])if(F0[id]&&F0[id][k]!==undefined)F[id][k]=F0[id][k];}F.bear.seen=1;F.bear.met=F0.bear&&F0.bear.met?1:0;
  F.dn=Object.assign({},F0.dn);F.fd=F0.fd.slice(-15);F.ch=F0.ch.slice(-20);F.rh=F0.rh.slice();F.n=F0.n+1;F.rs=F0.rs;F.mn=F0.mn;
  // герой, Людмила, арка Топтыгина и выборы игрока идут с ним в новый холдинг
  F.hero=Object.assign(HERO0(),F0.hero||{});F.lud=Object.assign(lud0(),F0.lud||{});F.tp=Object.assign({},F0.tp||{});F.part=F0.part||'';
  F.mem=F0.mem||0;F.memM=F0.memM===undefined?-99:F0.memM;if(F0.b1m!==undefined)F.b1m=F0.b1m;F.cloth=F0.cloth;F.lt=(F0.lt||[]).slice();F.h0=W.m;F.cup=F0.cup;F.crp=(F0.crp||0)+(F0.pari&&F0.pari.cr?F0.pari.cr:0);   // 💎 к зачислению и ставка 💎 незакрытого пари — с игроком
  info=info||{};qPush(W,F,{id:'s'+(F.n++),k:'ipo',w:'all',t:W.t,a:{h:W.hold,h0:info.hold||W.hold-1,eq:info.eq||0,m:W.m,st:F0.rags?1:0},big:1});return F;}
// герой: пол и имя (пролог, настройки)
function storyHero(W,h){const F=fr(W),x=F.hero;h=h||{};
  if(h.g==='m'||h.g==='f')x.g=h.g;
  if(typeof h.n==='string')x.n=/^[mf][1-3]$/.test(h.n)?h.n:'';
  if(typeof h.nc==='string')x.nc=h.nc.replace(/[<>&"`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,16);
  x.set=1;return 'ok';}
// пролог «Пари 11 „Б“» сыгран (или пропущен): встреча «10 лет» — это он и есть; снимок капиталов — для «15 лет»
function storyPrologue(W,h){const F=fr(W);if(h)storyHero(W,h);
  if(F.dn.pro===undefined){F.dn.pro=W.t;F.q=F.q.filter(x=>x.k!=='pro');if(!F.rh.length){reuSnap(W,F,10);F.rh[F.rh.length-1].cr=1;}}
  F.cup=F.cup||'beav';return 'ok';}
function prologueDue(W){const F=fr(W);return !!F.rags&&!W.ned&&W.hold===1&&F.dn.pro===undefined&&W.t<90;}

/* ---------------- чтение для интерфейса (телефон, карточки, встреча) ---------------- */
// «Кто из нас дальше»: [{id, v}] по убыванию; Топтыгин — только когда уже появился
function standings(W){const F=fr(W),r=[{id:'you',v:rnd0(E.equity(W))}];for(const id of ALL){if(id==='bear'&&!F.bear.seen)continue;r.push({id,v:capOf(W,id)});}return r.sort((a,b)=>b.v-a.v);}
function place(W){return standings(W).findIndex(x=>x.id==='you')+1;}
function unread(W){const F=fr(W);let n=F.q.length;for(const f of F.fd)if(f.t>F.rd)n++;return n;}
// переписка с другом: события истории, лента и ожидающие ответа сцены, по времени
function thread(W,w){const F=fr(W),a=[];for(const x of F.ch)if(x.w===w||x.w==='all')a.push({t:x.t,m:x.m,type:'log',x});
  F.fd.forEach((x,i)=>{if(x.w===w)a.push({t:x.t,m:x.m,type:'feed',x,i});});for(const x of F.q)if(x.w===w||x.w==='all')a.push({t:x.t,type:'ask',x});
  return a.sort((p,q)=>p.t-q.t);}
function friend(W,id){const F=fr(W),x=F[id]||{};let owe=0,lent=0;for(const l of W.loans)if(l.k==='fr'&&l.fr===id)owe+=l.a;for(const y of F.ln)if(y.w===id)lent+=y.a;
  const rel=typeof x.rel==='number'?x.rel:0,L=lvOf(rel);
  // что сейчас действует от друга (для окна «Друзья»): активные скидки и сроки
  const on={};if(id==='vit'){if(F.vship>=W.m)on.ship=F.vship;if(F.vlg===W.m)on.truck=W.m;if(F.vit.disc)on.disc=F.vit.disc;}
  if(id==='beav'){if(F.buy>=W.m)on.buy=F.buy;if(F.pari)on.pari=F.pari;}if(id==='bars'&&x.fx>=W.m)on.fix=x.fx;if(id==='owl'&&x.gu>=W.m)on.guar=x.gu;
  return {id,tr:x.tr||0,h:hearts(x.tr),rel,lv:L,next:L<4?LV_MIN[L+1]:null,st:Object.assign({g:0,h:0,n:0,sv:0,ln:0,bk:0,lt:0},x.st||{}),idle:W.m-(typeof x.lc==='number'?x.lc:W.m),
    chat:x.km===W.m?0:1,visit:x.vm===W.m?0:1,on,cap:capOf(W,id),c0:x.c||0,owe,lent,jv:F.jv.filter(j=>j.w===id),q:F.q.filter(q=>q.w===id),bot:!!botOf(W,id),gu:x.gu>=W.m?x.gu:-1,
    log:F.ch.filter(c=>c.w===id).slice(-8).reverse()};}
// календарь телефона: ближайшие даты сюжета (встреча, возвраты займов, решения по СП)
// M20: «💬 Друзья за месяц: сэкономили N ₽» — для окна закрытия месяца (m — месяц отчёта)
function monthGain(W,m){const F=fr(W),g=F.gh;if(!g||g.m!==m||!(g.a>0))return null;let top='',tv=0;for(const k in g.w||{})if(g.w[k]>tv){tv=g.w[k];top=k;}return {a:g.a,top,tv:rnd0(tv)};}
function dates(W){const F=fr(W),a=[],nx=(Math.floor(W.m/60)+1)*60;a.push({m:nx,k:'reu',y:10+nx/12});
  for(const x of F.ln)a.push({m:x.due,k:'lendback',w:x.w,a:x.a});
  for(const l of W.loans)if(l.k==='fr')a.push({m:W.m+Math.max(0,l.n-1),k:'owe',w:l.fr,a:l.a});
  for(const j of F.jv)a.push({m:j.dm<0?W.m:j.dm+12,k:'jvdiv',w:j.w,t:j.t,id:j.id});
  if(F.owl.gu>=W.m)a.push({m:F.owl.gu,d:29,k:'guar',w:'owl'});
  // M20: итог пари, конец профилактики Петра, общей закупки с Борисом и «везу товар» Вити (d — день месяца: действует до конца месяца m)
  if(F.pari&&F.pari.m>=W.m)a.push({m:F.pari.m,d:29,k:'pari',w:F.pari.w||'beav',a:F.pari.a,cr:F.pari.cr||0,tg:F.pari.tg});
  if(F.bars.fx>=W.m)a.push({m:F.bars.fx,d:29,k:'prof',w:'bars'});
  if(F.buy>=W.m&&!W.ned)a.push({m:F.buy,d:29,k:'buy',w:'beav'});
  if(F.vship>=W.m&&!W.ned)a.push({m:F.vship,d:29,k:'ship',w:'vit'});
  return a.sort((p,q)=>p.m-q.m||(p.d||0)-(q.d||0));}

/* ---------------- подключение к ходу времени (если econ.js не зовёт хуки сам) ---------------- */
function safe(f){return function(){try{return f.apply(null,arguments);}catch(e){try{console.error('story',e);}catch(x){}}};}
if(!NAT.bal){const f=E.bizBal;E.bizBal=function(W){const x=f?f(W):{inv:0,cip:0,fa:0,lic:0,rec:0};const s=storyBal(W);x.fa+=s.jv;x.rec+=s.lend;x.jv=s.jv;x.lend=s.lend;return x;};}
if(!NAT.close){const f=E.bizClose;E.bizClose=function(W,M,off){let r;if(f)r=f(W,M,off);storyClose(W,M,off);return r;};}
if(!NAT.mig){const f=E.bizMigrate;E.bizMigrate=function(W,fx){let r;if(f)r=f(W,fx);storyMigrate(W,fx);return r;};}
const sDay=safe(storyDay),sAfter=safe(storyAfter);
if(!NAT.day){const t0=E.tick;E.tick=function(W,off){const out=t0(W,off);if(out&&out.some(e=>e.k==='close'))sAfter(W);sDay(W,off,out);return out;};}
// офлайн: запоминаем, с какого дня игрока не было — для блока «📱 Пока вас не было» (новости друзей)
{const o0=E.offline;if(o0)E.offline=function(W,days){const t0=W.t;const r=o0(W,days);sAfter(W);sDay(W,true,null);try{fr(W).aw={t0,t1:W.t};}catch(e){}return r;};}
// поручительство Сони без родного хука: ставка −1 п. п. по следующему кредиту (лимит +30 % — только с хуком в econ.js)
if(!NAT.guar&&E.loanOffer&&E.takeLoan){const lo=E.loanOffer,tk=E.takeLoan;
  E.loanOffer=function(W){const o=lo(W);const g=storyGuar(W);return g?Object.assign({},o,{rate:Math.max(.01,o.rate+g.dr),gu:1}):o;};
  E.takeLoan=function(W){const g=storyGuar(W),n0=W.loans.length;const r=tk.apply(null,arguments);
    if(g&&r==='ok'&&W.loans.length>n0){const l=W.loans[W.loans.length-1];l.r=Math.max(.01,l.r+g.dr);storyGuarUse(W,l);}return r;};}

const STORY={FR,ALL,SC,ORDER,RQ,CALL,NEED,JV,REF,NAT,partA,init:fr,acctOk,capOf,hearts,standings,place,unread,thread,friend,dates,callOpts,optsOf,checkOf,expertList,buildList,jvPrice,frLoanMax,nice,ref,reuPlace,
  carry:storyCarry,reuOf,day:(W)=>storyDay(W,false,null),si,prologueDue,mm,MEM_N,LIFE_N,hero:W=>fr(W).hero,
  PK,CD,LV_MIN,PARI_CR,monthGain,crHave:null,REL_HOME,lvOf,lv:(W,id)=>lv(fr(W),id),taxAdv,bankPay,bridgeA,offerOk:(W,w,p)=>offerOk(W,fr(W),w,p)};
Object.assign(E,{storyDay,storyClose,storyBal,storyMigrate,storyGuar,storyGuarUse,storyCarry,friendAnswer,friendCall,friendChat,friendVisit,jvCreate,jvDiv,jvExit,congrats,storyRead,storyTouch,storyHero,storyPrologue,STORY});
root.STORY=STORY;
})(typeof window!=='undefined'?window:this);
