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
   Большие сцены (кроме встреч, IPO, событий глав — BIG_FREE) идут по одной и не чаще раза в 20 дней. Модель сюжета по реальным дням — прогон в отчёте этапа 5 (день без большой сцены — 0 из 96). */
(function(root){
'use strict';
const E=root.ECON;if(!E||E.STORY)return;
const _=E._,{pay,recv,pl,rnd0,clamp}=_;
const FR=['owl','beav','bars','vit'],ALL=FR.concat(['bear']);
const TR0={owl:62,beav:57,bars:60,vit:64};
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
  for(const id of FR)F[id]={tr:TR0[id],k:tgt(id,0),c:0,no:0,cq:-9,cg:-9,ln:null,gu:-1};
  F.bear={k:3,seen:W.ned?1:0,c:0};
  if(W.ned)F.dn.pro=W.t;          // мир начат сразу с недр (старые сохранения, IPO): пролог «10 лет» пропускаем
  W.fr=F;for(const id of ALL)F[id].c=capOf(W,id);return F;}
function fr(W){return W.fr&&W.fr.v?W.fr:init(W);}
function storyMigrate(W,fx){if(!W.fr||typeof W.fr!=='object'||!W.fr.v){init(W);if(fx)fx.push('fr');return;}
  const F=W.fr,num=(o,k,d)=>{if(typeof o[k]!=='number'||!isFinite(o[k]))o[k]=d;};
  for(const k of ['q','fd','ch','jv','ln','rh'])if(!Array.isArray(F[k]))F[k]=[];if(!F.dn||typeof F.dn!=='object')F.dn={};
  num(F,'m0',W.m);num(F,'n',1);num(F,'rq',W.m+3);num(F,'nt',W.t);num(F,'rd',W.t);num(F,'ls',-99);num(F,'buy',-1);num(F,'vlg',-1);num(F,'gp',-1);
  num(F,'rs',9);num(F,'rags',0);num(F,'ld',-1);num(F,'lm',W.m);num(F,'cm',W.m-1);
  for(const id of FR){if(!F[id]||typeof F[id]!=='object')F[id]={};const x=F[id];num(x,'tr',TR0[id]);num(x,'k',tgt(id,0));num(x,'c',0);num(x,'no',0);num(x,'cq',-9);num(x,'cg',-9);num(x,'gu',-1);if(x.gu===0&&!F.gu1)x.gu=-1;if(x.ln===undefined)x.ln=null;}F.gu1=1;
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
function tr(F,id,d){if(FR.indexOf(id)<0||!F[id]||!d)return 0;const o=F[id].tr;F[id].tr=clamp(o+d,0,100);return F[id].tr-o;}
function hearts(t){return Math.max(1,Math.min(5,Math.ceil((t||0)/20)));}
function log(W,F,w,k,o,d,a){F.ch.push({t:W.t,m:W.m,w,k,o:o||'',d:d||0,a:a||null});if(F.ch.length>40)F.ch.splice(0,F.ch.length-40);}
function feed(W,F,w,k,a,c){F.fd.push({t:W.t,m:W.m,w,k,a:a||null,c:c?1:0,g:0});if(F.fd.length>30)F.fd.splice(0,F.fd.length-30);if(w==='bear')F.bear.seen=1;}
function yes(F,id){if(F[id])F[id].no=0;}
function no(F,id){if(!F[id])return 0;F[id].no++;if(F[id].no>=3){F[id].no=0;return tr(F,id,-10);}return 0;}
function eqOf(W){return Math.max(0,E.equity(W));}
function cashFree(W){return W.cash-(W.ned?20e6:Math.max(3000,Math.min(5e5,E.equity(W)*.02)));}

/* ---------------- займы: другу (актив) и от друга (W.loans k:'fr') ---------------- */
function lendMk(W,F,w,a,mo){if(!acctOk(W))return 'no';a=rnd0(a);if(a<=0)return 'no';if(cashFree(W)<a)return 'cash';
  payA(W,a,'lend');F.ln.push({id:'fl'+(F.n++),w,a,due:W.m+mo,m0:W.m});return 'ok';}
function frLoan(W,F,w,a,n){a=rnd0(a);n=Math.max(1,n|0);const l={id:'l'+(W.nid++),a,a0:a,r:0,n,n0:n,k:'fr',fr:w,gr:n-1};W.loans.push(l);recv(W,a,'loan');F[w].ln=l.id;return l;}
function frLoanMax(W,id){return nice(Math.max(5e3,capOf(W,id)*.1));}

/* ---------------- совместные предприятия (метод долевого участия) ---------------- */
// r — средняя доходность СП в месяц к его капиталу, s — разброс
const JV={trans:{r:.02,s:.012},base:{r:.018,s:.015},pit:{r:.024,s:.01},fund:{r:.013,s:.006},bshare:{r:.012,s:.008}};   // bshare — акции «Бобров и Ко» (якорный инвестор, второй сезон)
function jvCreate(W,w,t,sh,a){const F=fr(W);if(!acctOk(W)||!JV[t]||!F[w])return 'no';a=rnd0(a);sh=clamp(+sh||.5,.1,1);if(a<=0)return 'no';if(cashFree(W)<a)return 'cash';
  payA(W,a,'jvin');const j={id:'j'+(F.n++),w,t,sh,in0:a,inv:a,base:rnd0(a/sh),m0:W.m,d:.5,dm:-99,p:[]};F.jv.push(j);log(W,F,w,'jv',t,0,{a,sh});return 'ok';}
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
  vit1:{w:'vit',when:(W,F)=>F.rags&&si(W)===0&&W.t>=20&&!!W.me,prm:()=>({a:3000}),
    o:{a:{fx:(W,F,q)=>{if(W.me){const a=recv(W,q.a.a,'sales');pl(W,'rev',a);sgAdd(W,'gig',a,a);W.me.tb=(W.me.tb||0)+a;}yes(F,'vit');return tr(F,'vit',3);}},
       b:{fx:()=>0}}},
  owl1:{w:'owl',when:(W,F)=>F.rags&&si(W)<=1&&W.m-F.m0>=2&&!!E.cardLimit&&E.cardLimit(W)>0&&!W.loans.some(l=>l.card),prm:W=>({a:E.cardLimit(W)}),
    o:{a:{ok:W=>E.cardLimit&&E.cardLimit(W)>0&&!W.loans.some(l=>l.card)?true:'card',fx:(W,F)=>{E.cardTake(W);yes(F,'owl');return tr(F,'owl',3);}},
       b:{fx:(W,F)=>tr(F,'owl',2)}}},
  // Борис ставит ларёк напротив: событие точки «bobrov» (biz.js) или просто когда у вас уже есть точка
  beav1:{w:'beav',when:(W,F)=>F.rags&&!W.ned&&si(W)>=1&&W.biz&&W.biz.length>=1&&(F.bobk||W.m-F.m0>=8),
    o:{a:{fx:(W,F)=>tr(F,'beav',2)},b:{fx:(W,F)=>tr(F,'beav',2)}}},
  beav2:{w:'beav',when:(W,F)=>F.rags&&!W.ned&&F.dn.beav1>=0&&W.t-F.dn.beav1>=90&&si(W)<=2&&W.biz&&W.biz.some(b=>E.BIZ&&E.BIZ[b.t]&&E.BIZ[b.t].seg==='retail'),
    o:{a:{fx:(W,F)=>{F.buy=W.m+12;yes(F,'beav');return tr(F,'beav',8);}},b:{fx:()=>0}}},
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
const ORDER=['pro','vit1','owl1','first1','beav1','beav2','bars1','owl2','beav4','beav3','vit4','vit3','bars3','tpt1','lud1','owl4','bars2','tpt2','bars5','beav6','part','ned1','bear1','vit5','lud3','tpt4','mem',
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
  visit:{a:{fx:(W,F,q)=>{yes(F,q.w);return tr(F,q.w,5);}},b:{fx:(W,F,q)=>{yes(F,q.w);return 0;}}}};
function rqMake(W,F){const s=si(W),eq=eqOf(W),pool=[];
  for(const w of FR){if(F.q.some(x=>x.w===w))continue;
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
  if(F.rags&&W.ned){for(const k of ['beav1','beav2','bars1','beav3','vit3','bars2','owl2','beav4','bars3','tpt1','tpt2','part','first1','bars5','beav6'])if(F.dn[k]===undefined&&!F.q.some(x=>x.k===k))F.dn[k]=W.t;
    if(!F.part)F.part='owl';if(F.dn.tpt1!==undefined)F.bear.met=1;
    // неотвеченный выбор партнёра к моменту входа в недра — по умолчанию фонд Сони (как в окне главы 5)
    const pq=F.q.find(x=>x.k==='part');if(pq){F.q=F.q.filter(x=>x!==pq);F.dn.part=W.t;}}
  // просьбы: протухшая просьба уходит без штрафа («справился сам»)
  for(const x of F.q.slice())if(x.k==='rq'&&W.t>=x.x){F.q=F.q.filter(y=>y!==x);feed(W,F,x.w,'self',{r:x.r,v:x.a&&x.a.v});}}
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
  if(m>=F.rq&&!F.q.some(x=>x.k==='rq')&&(W.t>=40)){const q=rqMake(W,F);if(q)qPush(W,F,q);F.rq=m+2+Math.floor(rnd(F)*3);}}
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
    else if(n.k==='bizev'&&a.k==='bobrov'){F.bobk=1;if(F.dn.beav1!==undefined&&W.m-(F.k3m===undefined?-99:F.k3m)>=12){F.k3m=W.m;feed(W,F,'beav','kiosk3',{s:si(W)});}}}
  if(W.news.length)F.nt=Math.max(F.nt,W.news[W.news.length-1].t);}
function loansDay(W,F){for(const id of FR){const x=F[id];if(!x.ln)continue;if(!W.loans.some(l=>l.id===x.ln)){x.ln=null;const d=tr(F,id,5);log(W,F,id,'repaid','',d);feed(W,F,id,'thanks');}}}

/* ---------------- хуки ---------------- */
function storyDay(W,off,out){const F=fr(W);if(F.ld===W.t)return;F.ld=W.t;
  // пока игрока нет (офлайн), сроки ответа на просьбы и сцены не идут — «справился сам» не сыплется за ночь
  if(off)for(const x of F.q)if(x.x)x.x++;
  // месяцы «жизни» друзей (и пропущенные — после офлайна)
  if(F.lm<W.m){const from=Math.max(F.lm+1,W.m-12);for(let m=from;m<=W.m;m++)monthLite(W,F,m);F.lm=W.m;}
  loansDay(W,F);scanNews(W,F);
  const n0=F.q.length;scenesDay(W,F);if(out&&F.q.length>n0)out.push({k:'story'});}
// закрытие месяца: СП, возвраты займов друзьям, ретро-бонусы, поручительства. M — месяц, в который пишем; src — откуда брать закупки/логистику
function book(W,F,M,srcM){jvMonth(W,F);
  // займы друзьям: срок пришёл — друг возвращает (друзья не подводят)
  for(const x of F.ln.slice())if(W.m>=x.due){recvA(W,x.a,'lendb');F.ln=F.ln.filter(y=>y!==x);feed(W,F,x.w,'back2',{a:x.a});log(W,F,x.w,'lendback','',0,{a:x.a});}
  retro(W,srcM||M,F);
  // поручительство за Петра по ипотеке: при доверии ≥ 50 он платит всегда; ниже — изредка платёж ложится на вас
  if(F.gp>=W.m&&F.bars.tr<50&&rnd(F)<.05){const a=pay(W,45000,'oth');pl(W,'oth',-a);feed(W,F,'bars','gpay',{a});}
  // поручительство Сони: просрочка по такому кредиту (овердрафт) — доверие −50, один раз на кредит
  if(W.odM>0)for(const l of W.loans)if(l.gu==='owl'&&!l.guP){l.guP=1;const d=tr(F,'owl',-50);log(W,F,'owl','gulate','',d);}}
function storyClose(W,M,off){const F=fr(W);if(F.cm>=W.m)return;F.cm=W.m;book(W,F,M,null);}
// после закрытия, которое прошло без хука (мир недр без точек): пишем в новый месяц, закупки берём из отчёта
function storyAfter(W){const F=fr(W);const last=W.m-1;if(F.cm>=last)return;const n=Math.min(12,last-F.cm);
  const r=W.reps[W.reps.length-1];for(let i=0;i<n;i++)book(W,F,W.mon,i===n-1&&r?r:{cf:{}});F.cm=last;}
// ретро-бонусы: общая закупка с Борисом (−5 % товара, 12 мес.), машины Вити (−25 % доставки в месяц звонка; после выкупа доли у Топтыгина — −15 % всегда)
function retro(W,M,F){const cf=M&&M.cf||{};
  if(F.buy>=W.m){const a=rnd0(Math.max(0,-(cf.supp||0))*.05);if(a>0){recv(W,a,'supp');pl(W,'cogs',-a);sgAdd(W,'retail',0,a);}}
  const r=Math.max(F.vlg===W.m?.25:0,F.vit.disc||0);if(r>0){const a=rnd0(Math.max(0,-(cf.log||0))*r);if(a>0){recv(W,a,'log');pl(W,'log',-a);}}}
function storyBal(W){let jv=0,lend=0;const F=W.fr;if(F&&F.v){for(const j of F.jv)jv+=j.inv;for(const x of F.ln)lend+=x.a;}return {jv,lend};}
function storyGuar(W){const F=W.fr;return F&&F.v&&F.owl&&F.owl.gu>=W.m?{lim:1.3,dr:-.01}:null;}
function storyGuarUse(W,l){const F=W.fr;if(F&&F.v&&F.owl.gu>=W.m){l.gu='owl';F.owl.gu=-1;log(W,F,'owl','guse','',0,{a:l.a});}}

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
  // встреча выпускников: 💎 за место (один раз на встречу)
  if(q.k==='reu'||q.k==='pro'){const h=reuOf(F,q);if(h){r.place=reuPlace(h);r.y=h.y;if(!h.cr)r.cr=h.cr=REU_CR[r.place-1]||2;
    // переходящий кубок 11 «Б» — у того, кто дальше всех на встрече
    const lead=Object.keys(h.r).filter(id=>id!=='bear').sort((x,y)=>h.r[y]-h.r[x])[0];if(lead){r.cup0=F.cup||'beav';F.cup=lead;r.cup=lead;}}}
  log(W,F,q.w,q.k==='rq'?'rq_'+q.r:q.k,op.o,d,q.a);return r;}
// «📞 Позвонить»: что можно попросить у друга сейчас. → [{k, ok:true|код, need (доверие), a (сумма)}]
const CALL={beav:['loan'],vit:['loan','truck'],owl:['guar','check'],bars:['expert','build']};
const NEED={loan:40,truck:50,guar:60,check:30,expert:40,build:60};
function callOpts(W,w){const F=fr(W),x=F[w];if(!x||!CALL[w])return [];const q=Math.floor(W.m/3),out=[];
  for(const k of CALL[w]){let ok=true;
    if(x.tr<NEED[k])ok='trust';else if(x.cq===q&&k!=='check')ok='quarter';
    else if(k==='loan'&&x.ln)ok='owe';
    else if(k==='guar'&&(x.gu>=W.m||!(E.loanOffer&&E.loanOffer(W).max>0)))ok=x.gu>=W.m?'quarter':'bank';
    else if(k==='build'&&!buildList(W).length)ok='nobuild';
    else if(k==='expert'&&!expertList(W).length)ok='noauc';
    else if(k==='truck'&&F.vlg===W.m)ok='quarter';
    out.push({k,ok,need:NEED[k],a:k==='loan'?frLoanMax(W,w):0});}
  return out;}
function buildList(W){const a=[];for(const o of W.obj||[])if(o.st==='b'||o.up)a.push(o);for(const b of W.biz||[])if(b.st==='b')a.push(b);return a;}
function expertList(W){const a=[];for(const x of W.auc||[]){const p=E.plotById(W,x.p);if(p&&p.dep)a.push({r:x.r,g:x.g,res:p.dep.res,vc:p.dep.vc,V:x.V,p:x.p});}
  for(const p of W.opi||[])if(p.st==='auc'||p.st==='list')a.push({r:W.home||'kuz',g:p.g,V:p.V,res:p.res,opi:1});return a;}
// сводка «Проверю сделку» (Соня): сколько месяцев проживём на деньгах, долг к EBITDA, овердрафт
function checkOf(W){const r=W.reps&&W.reps[W.reps.length-1];let out=0,e=0;if(r){const c=r.cf;for(const k of ['supp','fix','log','adm','int','tax'])out+=Math.max(0,-(c[k]||0));e=E.ebitdaOf(r.pl);}
  let debt=0;for(const l of W.loans)if(l.k!=='fr')debt+=l.a;return {cashM:out>0?W.cash/out:99,lev:e>0?debt/(e*12):debt>0?99:0,od:W.odM>0,debt};}
function friendCall(W,w,k,arg){const F=fr(W),x=F[w];const op=callOpts(W,w).find(y=>y.k===k);if(!op)return {res:'no'};if(op.ok!==true)return {res:op.ok};
  arg=arg||{};const q=Math.floor(W.m/3);let r={res:'ok',k,w};
  if(k==='loan'){const a=Math.max(1000,Math.min(op.a,nice(arg.a||op.a))),n=arg.n===12?12:6;frLoan(W,F,w,a,n);r.a=a;r.n=n;}
  else if(k==='guar'){x.gu=W.m+3;}
  else if(k==='check'){r.c=checkOf(W);}
  else if(k==='expert'){r.list=expertList(W);}
  else if(k==='build'){let n=0;for(const o of buildList(W)){const j=o.up||o;if(j.left>1){j.left=Math.max(1,Math.ceil(j.left*.9));n++;}}r.n=n;}
  else if(k==='truck'){F.vlg=W.m;}
  if(k!=='check')x.cq=q;log(W,F,w,'call_'+k,'',0,r.a?{a:r.a,n:r.n}:null);return r;}
// «Поздравить» новость друга: +2 доверия, раз в квартал на друга
function congrats(W,idx){const F=fr(W),f=F.fd[idx];if(!f||!f.c||f.g||!F[f.w]||f.w==='bear')return 'no';const q=Math.floor(W.m/3);if(F[f.w].cg===q)return 'quarter';
  f.g=1;F[f.w].cg=q;const d=tr(F,f.w,2);log(W,F,f.w,'congr',f.k,d);return 'ok';}
function storyRead(W){const F=fr(W);F.rd=W.t;return 'ok';}
function storyTouch(W){fr(W);return 'ok';}   // пустое действие: сохранить мир через GAME.act
// IPO: новый холдинг — друзья те же (доверие, история, встречи), займы и СП остались в старой компании
// info — запись IPO {hold, eq} (для кадра «Фото на память»: «начинали с 5 000 ₽ — сегодня …»)
function storyCarry(W,F0,info){if(!F0||!F0.v)return fr(W);const F=init(W);F.m0=F0.m0;F.rags=F0.rags;
  for(const id of FR){F[id].tr=F0[id].tr;F[id].k=F0[id].k;for(const k of ['hlp','disc','plan','opi','solo','wed','intern'])if(F0[id]&&F0[id][k]!==undefined)F[id][k]=F0[id][k];}F.bear.seen=1;F.bear.met=F0.bear&&F0.bear.met?1:0;
  F.dn=Object.assign({},F0.dn);F.fd=F0.fd.slice(-15);F.ch=F0.ch.slice(-20);F.rh=F0.rh.slice();F.n=F0.n+1;F.rs=F0.rs;F.mn=F0.mn;
  // герой, Людмила, арка Топтыгина и выборы игрока идут с ним в новый холдинг
  F.hero=Object.assign(HERO0(),F0.hero||{});F.lud=Object.assign(lud0(),F0.lud||{});F.tp=Object.assign({},F0.tp||{});F.part=F0.part||'';
  F.mem=F0.mem||0;F.memM=F0.memM===undefined?-99:F0.memM;if(F0.b1m!==undefined)F.b1m=F0.b1m;F.cloth=F0.cloth;F.lt=(F0.lt||[]).slice();F.h0=W.m;F.cup=F0.cup;
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
  return {id,tr:x.tr||0,h:hearts(x.tr),cap:capOf(W,id),c0:x.c||0,owe,lent,jv:F.jv.filter(j=>j.w===id),q:F.q.filter(q=>q.w===id),bot:!!botOf(W,id),gu:x.gu>=W.m?x.gu:-1};}
// календарь телефона: ближайшие даты сюжета (встреча, возвраты займов, решения по СП)
function dates(W){const F=fr(W),a=[],nx=(Math.floor(W.m/60)+1)*60;a.push({m:nx,k:'reu',y:10+nx/12});
  for(const x of F.ln)a.push({m:x.due,k:'lendback',w:x.w,a:x.a});
  for(const l of W.loans)if(l.k==='fr')a.push({m:W.m+Math.max(0,l.n-1),k:'owe',w:l.fr,a:l.a});
  for(const j of F.jv)a.push({m:j.dm<0?W.m:j.dm+12,k:'jvdiv',w:j.w,t:j.t,id:j.id});
  if(F.owl.gu>=W.m)a.push({m:F.owl.gu,k:'guar',w:'owl'});
  return a.sort((p,q)=>p.m-q.m);}

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
  carry:storyCarry,reuOf,day:(W)=>storyDay(W,false,null),si,prologueDue,mm,MEM_N,LIFE_N,hero:W=>fr(W).hero};
Object.assign(E,{storyDay,storyClose,storyBal,storyMigrate,storyGuar,storyGuarUse,storyCarry,friendAnswer,friendCall,jvCreate,jvDiv,jvExit,congrats,storyRead,storyTouch,storyHero,storyPrologue,STORY});
root.STORY=STORY;
})(typeof window!=='undefined'?window:this);
