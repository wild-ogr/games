/* ================= «Из ларька в магнаты: бизнес» — недвижимость (без DOM) =================
   Грузится сразу после biz.js (и в симуляторе). Спецификация — hobby-analytics/24-magnat-rags-to-riches.md, §10.
   Мир: W.re — объекты, W.rei — индексы цен и аренды по городам, W.reEv — события с выбором, W.reOff — «сосед продаёт дёшево»,
   W.reC — индекс коммуналки, W.reK — ключевая ставка, при которой последний раз пересчитывали рынок, W.reCool — «рынок остыл» (мес.).
   Учёт (как весь учёт игры — по первоначальной стоимости):
     покупка — capex (ДДС инвест.), оформление 1 % — в стоимость; ипотека — W.loans {k:'mort', re:id}, выдача — loan, тело — repay, проценты — int (их считает econ.close);
     аренда — rev/sales (сегмент 're'); коммуналка пустых дней, уборка, комиссия площадки — cogs/supp; УК, страховка, налог на имущество, косметика — fix/fix;
     «под ключ» и дизайнерский ремонт — capex, в стоимость объекта; амортизация 2 %/год — dep; «живу сам» — экономия «жизни» (adm со знаком −);
     продажа — asale, разница с балансовой — oth; затопили/вечеринка/капремонт/выселение — oth.
   Баланс: статья «Инвестиционная недвижимость» = Σ(g − dp) (reBook); рыночная стоимость — только для показа (reMV), в прибыль — при продаже.
   Хуки: если econ.js вызывает ECON.reDay/reClose/reBal/reMigrate сам — работаем через них; иначе оборачиваем хуки biz.js
   (bizDay/bizClose/bizBal/bizMigrate), а там, где econ их не зовёт («Недра» без точек), — ECON.tick (день и закрытие — до исходного tick).
   reDay/reClose срабатывают не больше раза за день/месяц (W.reT, W.reM), так что двойной вызов не страшен.
   Свой генератор случайностей W.reRs — ГСЧ мира (W.rs) не трогаем: без недвижимости игра и симулятор идут как раньше.
   Действия — f(W,…), через GAME.act('reBuy', …). */
(function(root){
'use strict';
const E=root.ECON;if(!E||E.reBook)return;
const _=E._,{pay,recv,pl,news,rnd0,clamp}=_;
// свой ГСЧ (W.reRs) на том же алгоритме, что econ
function R(W){const o={rs:W.reRs|0};const x=_.R(o);W.reRs=o.rs;return x;}
function RN(W){let u=0;while(!u)u=R(W);const v=R(W);return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function RR(W,a,b){return a+(b-a)*R(W);}
function pick(W,o){let s=0;for(const k in o)s+=o[k];let x=R(W)*s,acc=0;for(const k in o){acc+=o[k];if(x<acc)return k;}return null;}
const DAYS=30;

/* ---------------- справочники ---------------- */
// города: kp — к цене, kr — к аренде (Кемерово = 1); Москва — своими цифрами из таблицы
const RE_CITY={kuz:{n:'Кемерово',en:'Kemerovo',kp:1,kr:1},kar:{n:'Петрозаводск',en:'Petrozavodsk',kp:1.08,kr:1.05},ural:{n:'Екатеринбург',en:'Yekaterinburg',kp:1.3,kr:1.25},msk:{n:'Москва',en:'Moscow',kp:1,kr:1}};
const RE_CL=['kuz','kar','ural','msk'];
// классы: p/r/d — [регион (Кемерово), Москва]: цена, аренда в месяц, сутки; cm — коммуналка в месяц (Кемерово); st — с какой главы (1 «Своё дело», 2 «Сеть», 3 «Карьер»)
const RE_CLS={
  room:  {n:'Комната',en:'Room',m2:14,p:[1.5e6,5.5e6],r:[11e3,30e3],d:null,cm:2500,st:1,res:1,q:0},
  studio:{n:'Студия эконом',en:'Economy studio',m2:26,p:[3e6,13e6],r:[18e3,50e3],d:[2200,4000],cm:4000,st:1,res:1,q:0},
  one:   {n:'1-комн. комфорт',en:'1-bed comfort',m2:40,p:[4.8e6,16e6],r:[25e3,62e3],d:[3000,5500],cm:5500,st:2,res:1,q:1},
  two:   {n:'2-комн. бизнес',en:'2-bed business',m2:65,p:[11e6,40e6],r:[55e3,150e3],d:[5500,12000],cm:8000,st:2,res:1,q:2},
  prem:  {n:'Премиум в центре',en:'Premium downtown',m2:90,p:[0,90e6],r:[0,330e3],d:[0,25000],cm:14000,st:3,res:1,q:3},
  ph:    {n:'Пентхаус',en:'Penthouse',m2:250,p:[0,400e6],r:[0,1.3e6],d:null,cm:35000,st:3,res:1,q:3},
  shop:  {n:'Помещение под магазин',en:'Retail unit',m2:80,p:[12e6,45e6],r:[110e3,300e3],d:null,cm:12000,st:2,com:1},
  office:{n:'Офис',en:'Office',m2:200,p:[20e6,110e6],r:[180e3,850e3],d:null,cm:25000,st:2,com:1},
  whs:   {n:'Склад',en:'Warehouse',m2:1000,p:[40e6,110e6],r:[380e3,850e3],d:null,cm:45000,st:2,com:1}};
const RE_KL=Object.keys(RE_CLS);
// ремонт: ₽/м² (Кемерово; Москва ×1,5), дней, что даёт
const RE_RENO={cos:{n:'Косметический',en:'Cosmetic',m2:20000,days:20},key:{n:'Под ключ',en:'Full renovation',m2:50000,days:45},des:{n:'Дизайнерский',en:'Designer',m2:80000,days:60}};
const LVM=[1,1.15,1.25],LVR=[1,1.3,1.5];       // уровень отделки: к цене и к аренде
const FR0=80,FEE=.01,DEP_Y=.02,PTAX_Y=.002,UK_LONG=.08,UK_DAY=.2,PLAT_FEE=.15,CLEAN=1000,CHECK_FEE=2000,EVICT=20000,MOVE_P=1/540,EV_P=1/14,STAY=3;
// «живу сам»: сколько в месяц не платим за съём (по классу q: эконом, комфорт, бизнес, премиум)
const LIVE_SAVE=[18000,25000,32000,40000];
const MORT_ADD=.04,MORT_MIN_DOWN=.2,MORT_TERMS=[60,120,180,240];
const RE_ACH={re_first:2,re_10:5,re_com:3,re_ph:5};
if(E.BIZ_ACH)Object.assign(E.BIZ_ACH,RE_ACH);   // 💎 за грамоты — game.js берёт BIZ_ACH при загрузке

/* ---------------- мир ---------------- */
function reMigrate(W,fx){fx=fx||[];
  if(!Array.isArray(W.re)){W.re=[];if(W.fv)fx.push('re');}
  if(!W.rei||typeof W.rei!=='object')W.rei={};for(const c of RE_CL){const x=W.rei[c];if(!x||typeof x.p!=='number'||typeof x.r!=='number')W.rei[c]={p:1,r:1};}
  if(!Array.isArray(W.reEv))W.reEv=[];if(!Array.isArray(W.reOff))W.reOff=[];
  if(typeof W.reC!=='number')W.reC=1;if(typeof W.reRs!=='number')W.reRs=((W.rs|0)^0x5bd1e995)|0||7;if(typeof W.reT!=='number')W.reT=-1;if(typeof W.reM!=='number')W.reM=-1;if(typeof W.reK!=='number')W.reK=W.key||.14;if(typeof W.reCool!=='number')W.reCool=0;
  for(const o of W.re){if(!RE_CLS[o.cls]){o.cls='studio';}if(!RE_CITY[o.c])o.c='kuz';
    for(const k of ['g','dp','lv','fr','vac','np','m0','p0','vb','rt'])if(typeof o[k]!=='number')o[k]=k==='fr'?FR0:k==='vb'?1:k==='rt'?4.5:0;
    if(!o.mo)o.mo=mo0();if(!Array.isArray(o.pm))o.pm=[];if(['long','day','live'].indexOf(o.mode)<0)o.mode='long';
    if(o.mort&&!W.loans.some(l=>l.id===o.mort))o.mort=null;}
  return fx;}
function ens(W){if(!Array.isArray(W.re)||!W.rei||!Array.isArray(W.reEv)||typeof W.reRs!=='number')reMigrate(W,[]);return W;}
function mo0(){return {od:0,ed:0,npd:0,n:0,ci:0,lv:0};}
function stage(W){return E.stI?E.stI(W):4;}
function byId(W,id){ens(W);return W.re.find(o=>o.id===id);}
function mi(c){return c==='msk'?1:0;}
function isRes(cls){return !!RE_CLS[cls].res;}
function daily(cls,c){const d=RE_CLS[cls].d;return !!(d&&d[mi(c)]);}

/* ---------------- цены ---------------- */
function basePrice(cls,c){const C=RE_CLS[cls];return c==='msk'?C.p[1]:C.p[0]*RE_CITY[c].kp;}
function baseRent(cls,c){const C=RE_CLS[cls];return c==='msk'?C.r[1]:C.r[0]*RE_CITY[c].kr;}
function baseDay(cls,c){const C=RE_CLS[cls];if(!C.d)return 0;return c==='msk'?C.d[1]:C.d[0]*RE_CITY[c].kr;}
function comm(W,cls,c){return RE_CLS[cls].cm*(c==='msk'?1.5:RE_CITY[c].kp)*(W.reC||1);}
function renoRate(k,c){return RE_RENO[k].m2*(c==='msk'?1.5:RE_CITY[c].kp);}
function frM(fr){return (.92+.08*fr/100)/(.92+.08*FR0/100);}
function frR(fr){return fr<60?.85:fr>=90?1.1:1;}
// цена в каталоге (свежесть 80, без ремонта), с округлением до 10 тыс.
function rePrice(W,cls,c){ens(W);return Math.round(basePrice(cls,c)*W.rei[c].p/1e4)*1e4;}
function reDayC(W,cls,c){ens(W);return rnd0(baseDay(cls,c)*W.rei[c].r/50)*50;}
function reRentC(W,cls,c){ens(W);return rnd0(baseRent(cls,c)*W.rei[c].r/100)*100;}
function reMV(W,o){if(typeof o==='string')o=byId(W,o);if(!o)return 0;ens(W);return Math.round(basePrice(o.cls,o.c)*W.rei[o.c].p*LVM[o.lv|0]*frM(o.fr)*(o.vb||1)/1e4)*1e4;}
function reRent(W,o){return rnd0(baseRent(o.cls,o.c)*W.rei[o.c].r*LVR[o.lv|0]*frR(o.fr)/100)*100;}
function reDayRate(W,o){return rnd0(baseDay(o.cls,o.c)*W.rei[o.c].r*LVR[o.lv|0]*frR(o.fr)/50)*50;}
function occ(o,off){let x=(o.uk?.7:.525)*clamp(1+.1*((o.rt||4.5)-4.5),.7,1.05);if(off&&!o.uk)x-=.15;return clamp(x,.1,.9);}
function insY(o){return isRes(o.cls)?clamp(o.g*.0015,4000,8000):rnd0(o.g*.001);}
function srch(W,o){return Math.max(2,Math.round((isRes(o.cls)?RR(W,14,42):RR(W,90,270))*(o.uk?.6:1)));}
function reBook(W){let s=0;if(Array.isArray(W.re))for(const o of W.re)s+=o.g-o.dp;return s;}

/* ---------------- доступность ---------------- */
// 'ok' | 'stage' (глава ещё не та) | 'city' (в «Своём деле» — только свой город) | 'no' (такого нет в этом городе)
function reAvail(W,cls,c){const C=RE_CLS[cls],s=stage(W);if(!C||!RE_CITY[c])return 'no';if(!C.p[mi(c)])return 'no';
  if(s<1)return 'stage';if(C.st>s)return 'stage';if(c==='msk'&&s<3)return 'stage';if(s===1&&c!==(W.home||'kuz'))return 'city';return 'ok';}
// без своих хуков в econ баланс недвижимости считает обёртка bizBal, а econ зовёт её только при W.me (или точках) — в мире «сразу недра» без W.me рынок закрыт
function reOpen(W){return stage(W)>=1&&(HOOK.bal||!!W.me);}
// «живу сам» — только пока есть статья «жизнь» (до «Недр»)
function liveOk(W,o){return !!W.me&&!W.ned&&isRes(o.cls)&&!W.re.some(x=>x!==o&&x.mode==='live');}
function liveSave(o){return LIVE_SAVE[Math.min(3,RE_CLS[o.cls].q|0)+(o.lv>=1&&RE_CLS[o.cls].q<1?1:0)]||LIVE_SAVE[0];}

/* ---------------- ипотека ---------------- */
function annuity(a,r,n){const i=r/12;return i?a*i/(1-Math.pow(1+i,-n)):a/n;}
function chAdj(W){if(!E.chWord)return 0;return [.015,.015,.0075,0,-.015][E.chWord(W.ch||0)]||0;}
function sonya(W){const f=W.fr&&(W.fr.owl||W.fr.sonya);const tr=f&&(typeof f==='object'?(f.tr!=null?f.tr:f.trust):f);return typeof tr==='number'&&tr>=50?.005:0;}
function reMortRate(W,down){return clamp((W.key||.14)+MORT_ADD-(down>=.3?.01:0)+chAdj(W)-sonya(W),.05,.35);}
function e3(W){const h=(W.reps||[]).slice(-3);if(!h.length)return 0;let s=0;for(const x of h)s+=E.ebitdaOf(x.pl);return s/h.length;}
function mortPays(W){let s=0;for(const l of W.loans)if(l.k==='mort')s+=annuity(l.a,l.r,Math.max(1,l.n));return s;}
// сколько банк разрешит платить по ипотеке в месяц: половина EBITDA (среднее за 3 мес.) + 60 % будущей аренды + «подушка» капитала (1/60 в месяц) − уже идущие платежи
function reMortCap(W,rentNew){let eq=0;try{eq=Math.max(0,E.equity(W));}catch(e){}return Math.max(0,.5*Math.max(0,e3(W))+.6*(rentNew||0)+eq/60-mortPays(W));}
// прогноз «ипотека или свои»: down — доля своих (0,2…1), n — месяцев. Все суммы в месяц, до налога.
function reForecast(W,cls,c,down,n,price){ens(W);down=clamp(down==null?1:down,MORT_MIN_DOWN,1);n=n||180;
  const P=price||rePrice(W,cls,c),fee=rnd0(P*FEE),loan=down>=1?0:Math.round(P*(1-down)/1e4)*1e4,own=P-loan+fee,rate=loan?reMortRate(W,down):0;
  const pmt=loan?rnd0(annuity(loan,rate,n)):0,rent=reRentC(W,cls,c),res=!!RE_CLS[cls].res;
  const vac=res?.95:.8,g=P+fee;
  const costs=rnd0((insY({cls,g})+g*PTAX_Y)/12+comm(W,cls,c)*(1-vac)),rentNet=rnd0(rent*vac)-costs;
  const intM=loan?rnd0(loan*rate/12):0,cf=rentNet-pmt;
  // окупаемость своих денег: когда прибыль (поток + погашенное тело + рост цены) сравняется с вложенным
  const pb=grow=>{let a=loan,cum=0,mv=P,rn=rentNet;for(let m=1;m<=600;m++){const i=a*rate/12,b=loan&&m<=n?Math.min(a,pmt-i):0;a-=b;cum+=rn-(loan&&m<=n?pmt:0);
      if(grow){mv*=1.0055;rn*=1.004;}if(cum+(loan-a)+(mv-P)>=own)return m;}return 0;};
  return {P,fee,own,loan,rate,n,pmt,rent,rentNet,costs,cf,intM,gy:rent*12/P,ny:rentNet*12/P,coc:own>0?(cf*12)/own:0,pb0:pb(false),pb1:pb(true),cap:reMortCap(W,rent),ok:!loan||pmt<=reMortCap(W,rent)};}

/* ---------------- покупка и продажа ---------------- */
function newObj(W,cls,c,P,fee){const o={id:'h'+(W.nid++),cls,c,m2:RE_CLS[cls].m2,g:P+fee,dp:0,p0:P,m0:W.m,lv:0,fr:FR0,vb:1,rt:4.5,
    mode:'long',uk:0,ins:0,chk:0,vac:0,np:0,npAt:0,ren:null,sl:null,mort:null,mo:mo0(),pm:[],lm:null};o.vac=srch(W,o);return o;}
// o: {down (доля своих, 1 — без ипотеки), n (месяцев ипотеки)}; → 'ok' | 'stage' | 'city' | 'no' | 'cash' | 'bank'
function reBuy(W,cls,c,o,price,offId){ens(W);o=o||{};const av=reAvail(W,cls,c);if(av!=='ok')return av;if(!reOpen(W))return 'stage';
  const down=o.down==null?1:o.down,n=MORT_TERMS.indexOf(o.n)>=0?o.n:180,f=reForecast(W,cls,c,down,n,price);
  if(W.cash<f.own)return 'cash';if(f.loan&&!f.ok)return 'bank';
  const x=newObj(W,cls,c,f.P,f.fee);pay(W,f.P+f.fee,'capex');
  if(f.loan){const l={id:'l'+(W.nid++),a:f.loan,a0:f.loan,r:f.rate,n,n0:n,k:'mort',re:x.id};W.loans.push(l);recv(W,f.loan,'loan');x.mort=l.id;news(W,'loan',{a:f.loan,r:f.rate,n});}
  W.re.push(x);news(W,'re',{k:'buy',cls,c,pr:f.P,loan:f.loan});
  W.ach.re_first=1;if(W.re.length>=10)W.ach.re_10=1;if(RE_CLS[cls].com)W.ach.re_com=1;if(cls==='ph')W.ach.re_ph=1;
  if(offId)W.reOff=W.reOff.filter(z=>z.id!==offId);
  return 'ok';}
function reBuyOffer(W,id,o){ens(W);const z=W.reOff.find(x=>x.id===id);if(!z||z.exp<W.t)return 'no';return reBuy(W,z.cls,z.c,o,z.pr,id);}
// продажа: 1–3 месяца поиска покупателя, жилец съезжает; цена = рыночная × 0,95…1,0 в день сделки
function reSell(W,id){const o=byId(W,id);if(!o||o.sl)return 'no';if(o.ren)return 'ren';o.sl={left:Math.round(RR(W,30,90)),tot:0};o.sl.tot=o.sl.left;o.vac=0;o.np=0;o.npAt=0;return 'ok';}
function reSellCancel(W,id){const o=byId(W,id);if(!o||!o.sl)return 'no';o.sl=null;if(o.mode==='long')o.vac=srch(W,o);return 'ok';}
function saleDone(W,o,out){const pr=Math.round(reMV(W,o)*RR(W,.95,1)/1e4)*1e4,bk=o.g-o.dp;recv(W,pr,'asale');pl(W,'oth',pr-bk);
  const l=o.mort&&W.loans.find(x=>x.id===o.mort);let paid=0;if(l){paid=pay(W,l.a,'repay');l.a=0;W.loans=W.loans.filter(x=>x!==l);}
  // УСН 6 % — с цены продажи; жильё, которым владели 5 игровых лет и больше, — без налога
  if(W.me&&W.taxm==='usn6'&&!(isRes(o.cls)&&W.m-o.m0>=60))W.me.tb+=pr;
  W.re=W.re.filter(x=>x!==o);W.reEv=W.reEv.filter(e=>e.re!==o.id);news(W,'re',{k:'sold',cls:o.cls,c:o.c,pr,gain:pr-bk,mort:paid});if(out)out.push({k:'resold',id:o.id,pr});return pr;}

/* ---------------- режим, УК, страховка, проверка жильца ---------------- */
function reMode(W,id,m){const o=byId(W,id);if(!o||o.sl||['long','day','live'].indexOf(m)<0)return 'no';if(o.mode===m)return 'ok';
  if(m==='day'&&!daily(o.cls,o.c))return 'no';if(m==='live'&&!liveOk(W,o))return 'live';
  o.mode=m;o.np=0;o.npAt=0;o.vac=m==='long'&&!o.ren?srch(W,o):0;return 'ok';}
function reUK(W,id,on){const o=byId(W,id);if(!o)return 'no';o.uk=on?1:0;if(o.vac>0&&on)o.vac=Math.max(1,Math.round(o.vac*.6));return 'ok';}
function reIns(W,id,on){const o=byId(W,id);if(!o)return 'no';o.ins=on?1:0;return 'ok';}
// проверка жильца: за 2 000 ₽ или за рекламу (free=true); действует на следующего жильца
function reChk(W,id,free){const o=byId(W,id);if(!o||o.chk||!isRes(o.cls))return 'no';if(!free){if(W.cash<CHECK_FEE)return 'cash';pay(W,CHECK_FEE,'fix');pl(W,'fix',CHECK_FEE);sgAdd(W,0,-CHECK_FEE);}o.chk=1;return 'ok';}
// 📺 «Поднять объявление»: жилец за 3 дня (раз на простой)
function reBoostOk(W,id){const o=byId(W,id);return !!o&&o.mode==='long'&&o.vac>3&&!o.bst&&!o.ren&&!o.sl;}
function reBoost(W,id){if(!reBoostOk(W,id))return 'no';const o=byId(W,id);o.vac=3;o.bst=1;return 'ok';}
function tenantIn(W,o){o.vac=0;o.bst=0;o.npAt=R(W)<(o.chk?.01:.06)?W.t+Math.round(RR(W,30,150)):0;o.chk=0;}

/* ---------------- ремонт ---------------- */
function reRenoOk(W,o,k){if(typeof o==='string')o=byId(W,o);if(!o||o.ren||o.sl||!RE_RENO[k])return 'no';const C=RE_CLS[o.cls];
  if(k==='key'&&(C.q>=2||o.lv>=1))return 'no';if(k==='des'&&(C.com||o.lv>=2||C.q>=3||(C.q<1&&o.lv<1)))return 'no';return 'ok';}
function reRenoCost(W,o,k){return Math.round(o.m2*renoRate(k,o.c)/1e3)*1e3;}
function reReno(W,id,k){const o=byId(W,id),ok=reRenoOk(W,o,k);if(ok!=='ok')return ok;const c=reRenoCost(W,o,k);if(W.cash<c)return 'cash';
  if(k==='cos'){pay(W,c,'fix');pl(W,'fix',c);sgAdd(W,0,-c);}else{pay(W,c,'capex');o.g+=c;}
  o.ren={k,left:RE_RENO[k].days,tot:RE_RENO[k].days,c};o.vac=0;o.np=0;o.npAt=0;return 'ok';}
function reRushOk(W,id){const o=byId(W,id);return !!o&&!!o.ren&&!o.ren.sp&&o.ren.left>2;}
function reRush(W,id){if(!reRushOk(W,id))return 'no';const o=byId(W,id);o.ren.sp=1;o.ren.left=Math.ceil(o.ren.left/2);return 'ok';}
function renDone(W,o,out){const k=o.ren.k;o.fr=100;if(k==='key')o.lv=Math.max(o.lv,1);if(k==='des')o.lv=2;o.ren=null;if(o.mode==='long')o.vac=srch(W,o);
  news(W,'re',{k:'reno',cls:o.cls,c:o.c,rk:k});if(out)out.push({k:'reno',id:o.id});}

/* ---------------- события с выбором ---------------- */
// W.reEv: {id, k:'flood'|'np', re, a, exp}; выбор: flood — 'pay' | 'sue' (суд 3 мес., вернут 70 %, пошлина 5 000); np — 'deal' (рассрочка: долг ×0,7 тремя платежами) | 'evict' (месяц + 20 000 ₽, потом новый жилец)
function reDecide(W,id,ch){ens(W);const e=W.reEv.find(x=>x.id===id);if(!e)return 'no';const o=byId(W,e.re);W.reEv=W.reEv.filter(x=>x!==e);if(!o)return 'no';
  if(e.k==='flood'){const a=e.a+(ch==='sue'?5000:0);pay(W,a,'oth');pl(W,'oth',-a);if(ch==='sue')o.sue={a:rnd0(e.a*.7),t:W.t+90};}
  else if(e.k==='np'){if(ch==='evict'){o.np=Math.min(o.np,30);o.npk='evict';pay(W,EVICT,'oth');pl(W,'oth',-EVICT);}else{o.back={a:rnd0(e.a*.7/3),n:3};o.npk='deal';}}
  return 'ok';}
function evAdd(W,k,o,a,days){const e={id:'v'+(W.nid++),k,re:o.id,a,exp:W.t+days};W.reEv.push(e);news(W,'re',{k:'ev_'+k,cls:o.cls,c:o.c,a});return e;}

/* ---------------- день ---------------- */
function reDay(W,off,out,t){if(!Array.isArray(W.re)||!W.re.length&&!W.reEv.length&&!W.reOff.length)return;ens(W);out=out||[];
  t=t==null?W.t:t;if(W.reT===t)return;W.reT=t;
  for(const e of W.reEv.slice())if(W.t>=e.exp)reDecide(W,e.id,e.k==='flood'?'pay':'deal');
  if(W.reOff.length)W.reOff=W.reOff.filter(z=>z.exp>=W.t);
  for(const o of W.re.slice()){const m=o.mo;
    if(o.sue&&W.t>=o.sue.t){recv(W,o.sue.a,'oth');pl(W,'oth',o.sue.a);news(W,'re',{k:'court',cls:o.cls,c:o.c,a:o.sue.a});o.sue=null;}
    if(o.ren){o.ren.left--;m.ed++;if(o.ren.left<=0)renDone(W,o,out);continue;}
    if(o.sl){o.sl.left--;m.ed++;if(o.sl.left<=0)saleDone(W,o,out);continue;}
    if(o.mode==='live'){m.lv++;continue;}
    if(o.mode==='day'){if(R(W)<occ(o,off)){m.n++;m.ci+=1/STAY;}continue;}
    if(o.vac>0){o.vac--;m.ed++;if(o.vac<=0){tenantIn(W,o);out.push({k:'tenant',id:o.id});}continue;}
    if(o.np>0){o.np--;m.npd++;if(o.np<=0&&o.npk==='evict'){o.npk=null;o.vac=srch(W,o);}continue;}
    if(o.npAt&&W.t>=o.npAt){o.npAt=0;o.np=60;o.npk=null;evAdd(W,'np',o,reRent(W,o)*2,10);m.npd++;continue;}
    m.od++;
    if(R(W)<MOVE_P*(isRes(o.cls)?1:.6)){o.vac=srch(W,o);o.bst=0;news(W,'re',{k:'out',cls:o.cls,c:o.c});out.push({k:'moveout',id:o.id});}}}

/* ---------------- закрытие месяца ---------------- */
function sgAdd(W,rev,e){const s=W.mon.sg||(W.mon.sg={});const x=s.re||(s.re={rev:0,e:0});x.rev+=rev;x.e+=e;}
function objMonth(W,o){const m=o.mo,C=RE_CLS[o.cls];let rev=0,cg=0,fx=0,adm=0;
  const rm=reRent(W,o),cm=comm(W,o.cls,o.c);
  if(o.mode==='long'){rev+=rm*m.od/DAYS;if(o.back&&o.back.n>0&&m.od>0){rev+=o.back.a;o.back.n--;if(!o.back.n)o.back=null;}}
  let rd=0;if(o.mode==='day'){rd=m.n*reDayRate(W,o);rev+=rd;cg+=rd*PLAT_FEE+Math.round(m.ci)*CLEAN*(o.c==='msk'?1.5:1);}
  // коммуналка: посуточно — вся (она в цене суток), долгосрочно — только за пустые дни, «живу сам» — в «жизни»
  cg+=o.mode==='day'?cm:o.mode==='live'?cm*m.ed/DAYS:cm*(m.ed+m.npd)/DAYS;
  if(o.uk)fx+=o.mode==='day'?rd*UK_DAY:(rev-rd)*UK_LONG;
  if(o.ins)fx+=insY(o)/12;
  fx+=o.g*PTAX_Y/12;
  if(o.mode==='live'&&m.lv>0&&W.me&&!W.ned)adm-=liveSave(o)*m.lv/DAYS;
  rev=rnd0(rev);cg=rnd0(cg);fx=rnd0(fx);adm=rnd0(adm);
  if(rev){recv(W,rev,'sales');pl(W,'rev',rev);if(W.me&&(W.taxm==='usn6'||W.taxm==='npd'))W.me.tb+=rev;}
  if(cg){pay(W,cg,'supp');pl(W,'cogs',cg);}
  if(fx){pay(W,fx,'fix');pl(W,'fix',fx);}
  if(adm){recv(W,-adm,'adm');pl(W,'adm',adm);}
  sgAdd(W,rev,rev-cg-fx-adm);
  const d=Math.min(o.g-o.dp,rnd0(o.g*DEP_Y/12));if(d>0){o.dp+=d;pl(W,'dep',d);}
  const l=o.mort&&W.loans.find(x=>x.id===o.mort);if(o.mort&&!l)o.mort=null;
  const mi=l?rnd0(l.a*l.r/12):0,mb=l?Math.min(l.a,rnd0(E.loanPay(l))):0;
  o.lm={rev,cost:cg+fx,save:-adm,mi,mb,dep:d,net:rev-cg-fx-adm-mi-mb,od:m.od,ed:m.ed+m.npd,n:m.n};
  o.pm.push(o.lm.net);if(o.pm.length>12)o.pm.shift();
  if(!o.ren)o.fr=Math.max(0,o.fr-(o.mode==='day'&&m.n>0?3:1));
  o.mo=mo0();}
function objEvent(W,o,off){if(o.ren||o.sl||R(W)>EV_P)return;const res=isRes(o.cls),w={};
  if(res)w.flood=3;if(o.mode==='day')w.party=2;w.cap=1;if(!off&&reAvail(W,o.cls,o.c)==='ok'&&W.reOff.length<2)w.cheap=1;
  const k=pick(W,w);
  if(k==='flood'){const a=Math.round(RR(W,50e3,150e3)/1e3)*1e3;if(o.ins){news(W,'re',{k:'flood_ins',cls:o.cls,c:o.c,a});return;}
    if(off){pay(W,a,'oth');pl(W,'oth',-a);news(W,'re',{k:'ev_flood',cls:o.cls,c:o.c,a});return;}evAdd(W,'flood',o,a,14);}
  else if(k==='party'){const a=30000;if(!o.ins){pay(W,a,'oth');pl(W,'oth',-a);}o.rt=Math.max(3,Math.round((o.rt-.3)*10)/10);news(W,'re',{k:'party',cls:o.cls,c:o.c,a:o.ins?0:a});}
  else if(k==='cap'){const a=Math.round(RR(W,30e3,80e3)*(RE_CLS[o.cls].com?3:1)/1e3)*1e3;pay(W,a,'oth');pl(W,'oth',-a);o.vb=Math.round((o.vb||1)*1.03*1000)/1000;news(W,'re',{k:'cap',cls:o.cls,c:o.c,a});}
  else if(k==='cheap'){const pr=Math.round(rePrice(W,o.cls,o.c)*.88/1e4)*1e4;W.reOff.push({id:'q'+(W.nid++),cls:o.cls,c:o.c,pr,exp:W.t+14});news(W,'re',{k:'cheap',cls:o.cls,c:o.c,pr});}}
// рынок: +0,55 %/мес. с шумом, аренда +0,4 %/мес.; «рынок остыл» −5 % за полгода; ключевая снижена на 1 п. п. и больше — +4 %; «льготы свернули» −3 %; 1 октября ЖКХ +9,9 %
function market(W){for(const c of RE_CL){const x=W.rei[c];x.p=Math.round(x.p*(1+.0055+RN(W)*.004-(W.reCool>0?.0085:0))*1e4)/1e4;x.r=Math.round(x.r*1.004*1e4)/1e4;}
  if(W.reCool>0)W.reCool--;
  const k=W.key||.14;if(k<=W.reK-.01){for(const c of RE_CL)W.rei[c].p=Math.round(W.rei[c].p*1.04*1e4)/1e4;W.reK=k;news(W,'re',{k:'keydn'});}else if(k>=W.reK+.01)W.reK=k;
  const r=R(W);if(!W.reCool&&r<1/36){W.reCool=6;news(W,'re',{k:'cool'});}
  else if(r>1-1/60){for(const c of RE_CL)W.rei[c].p=Math.round(W.rei[c].p*.97*1e4)/1e4;news(W,'re',{k:'lgot'});}
  if(W.m%12===8){W.reC=Math.round(W.reC*1.099*1e4)/1e4;if(W.re.length)news(W,'re',{k:'zhkh'});}}   // закрываем сентябрь → с 1 октября
function reClose(W,M,off){if(!Array.isArray(W.re))return;ens(W);if(W.reM===W.m)return;W.reM=W.m;
  if(W.re.length||stage(W)>=1)market(W);
  // в «Недрах» статьи «жизнь» нет — своё жильё снова сдаём
  for(const o of W.re)if(o.mode==='live'&&(!W.me||W.ned)&&!o.ren&&!o.sl){o.mode='long';o.vac=srch(W,o);news(W,'re',{k:'tolong',cls:o.cls,c:o.c});}
  for(const o of W.re){objMonth(W,o);objEvent(W,o,off);}}

/* ---------------- для интерфейса, урока и советника ---------------- */
function reSum(W){ens(W);let bk=0,mv=0,debt=0,rev=0,net=0,n=W.re.length;
  for(const o of W.re){bk+=o.g-o.dp;mv+=reMV(W,o);const l=o.mort&&W.loans.find(x=>x.id===o.mort);if(l)debt+=l.a;if(o.lm){rev+=o.lm.rev;net+=o.lm.net;}}
  return {n,bk,mv,res:mv-bk,debt,rev,net};}
function reObjInfo(W,o){if(typeof o==='string')o=byId(W,o);if(!o)return null;const mv=reMV(W,o),l=o.mort&&W.loans.find(x=>x.id===o.mort);
  const rent=o.mode==='day'?rnd0(reDayRate(W,o)*DAYS*occ(o)):reRent(W,o),h=o.pm.slice(-6),avg=h.length?h.reduce((a,x)=>a+x,0)/h.length:0;
  const own=o.p0*(1+FEE)-(l?l.a0:0);
  return {mv,bk:o.g-o.dp,res:mv-(o.g-o.dp),rent,loan:l||null,pmt:l?rnd0(l.a*l.r/12+E.loanPay(l)):0,avg,gy:rent*12/Math.max(1,mv),own,
    state:o.sl?'sale':o.ren?'ren':o.mode==='live'?'live':o.mode==='day'?'day':o.vac>0?'vac':o.np>0?'np':'rent'};}
// урок 9 «Ипотека или свои»: числа — с первой квартиры в ипотеке, иначе пример студии в своём городе
function reLesson(W){ens(W);const o=W.re.find(x=>x.mort);const c=o?o.c:(W.home||'kuz'),cls=o?o.cls:'studio';
  const f=reForecast(W,cls,c,.2,180,o?o.p0:null);return {due:!!o||W.re.length>0,cls,c,P:f.P,own:f.own,loan:f.loan,rate:f.rate,pmt:f.pmt,rent:f.rent,gap:f.pmt-f.rentNet};}
function reAdvise(W){ens(W);const o=[];for(const e of W.reEv)o.push({k:'re_'+e.k,pri:72,a:{id:e.id,re:e.re,a:e.a}});
  for(const x of W.re)if(x.mort&&x.pm.length>=3&&x.pm.slice(-3).every(v=>v<0))o.push({k:'re_neg',pri:40,a:{id:x.id,gap:-rnd0(x.pm.slice(-3).reduce((a,v)=>a+v,0)/3)}});
  for(const z of W.reOff)o.push({k:'re_cheap',pri:45,a:{id:z.id,cls:z.cls,c:z.c,pr:z.pr}});
  return o;}

/* ---------------- хуки ---------------- */
const src=f=>{try{return String(f||'');}catch(e){return '';}};
const HOOK={day:/\breDay\b/.test(src(E.tick)),close:/\breClose\b/.test(src(E.close)),bal:/\breBal\b/.test(src(E.bal)),mig:/\breMigrate\b/.test(src(E.migrate))};
function reBal(W){return Array.isArray(W.re)?reBook(W):0;}
function wrap(k,fn){const f=E[k];const w=fn(f);w.toString=()=>src(f);E[k]=w;}   // toString — исходник: чужие проверки «econ уже зовёт хук?» (story.js) не ломаются
if(!HOOK.day)wrap('bizDay',f=>function(W,off,out){let r;if(f)r=f(W,off,out);reDay(W,off,out);return r;});
if(!HOOK.close)wrap('bizClose',f=>function(W,M,off){let r;if(f)r=f(W,M,off);reClose(W,M,off);return r;});
if(!HOOK.bal)wrap('bizBal',f=>function(W){const x=f?f(W):{inv:0,cip:0,fa:0,lic:0,rec:0};const b=reBal(W);x.fa+=b;x.re=b;return x;});
if(!HOOK.mig)wrap('bizMigrate',f=>function(W,fx){let r;if(f)r=f(W,fx);reMigrate(W,fx);return r;});
// econ зовёт bizDay только при (!W.ned || есть точки), bizClose — при (!W.ned || точки || дебиторка): в «Недрах» без точек — сами, до исходного tick
if((!HOOK.day||!HOOK.close)&&E.tick)wrap('tick',f=>function(W,off){const pre=[];
  if(W&&W.ned&&Array.isArray(W.re)&&!(W.biz&&W.biz.length)){
    if(!HOOK.day)reDay(W,off,pre,W.t+1);
    if(!HOOK.close&&!(W.rec&&W.rec.length)&&W.d+1>=DAYS)reClose(W,W.mon,off);}
  const out=f(W,off);if(pre.length&&Array.isArray(out))out.unshift.apply(out,pre);return out;});

Object.assign(E,{RE_CITY,RE_CL,RE_CLS,RE_KL,RE_RENO,RE_ACH,RE_TERMS:MORT_TERMS,RE_HOOK:HOOK,RE_LIVE:LIVE_SAVE,reLiveSave:liveSave,RE_K:{FEE,DEP_Y,UK_LONG,UK_DAY,PLAT_FEE,CLEAN,LIVE_SAVE,CHECK_FEE,EVICT,MORT_ADD,MORT_MIN_DOWN},
  reMigrate,reDay,reClose,reBal,reBook,reOpen,reAvail,rePrice,reRentC,reMV,reRent,reDayRate,reOcc:occ,reMortRate,reMortCap,reForecast,
  reDayC,reBuy,reBuyOffer,reSell,reSellCancel,reMode,reUK,reIns,reChk,reBoostOk,reBoost,reRenoOk,reRenoCost,reReno,reRushOk,reRush,reDecide,
  reSum,reObjInfo,reLesson,reAdvise,reLiveOk:(W,o)=>liveOk(ens(W),typeof o==='string'?byId(W,o):o),reDaily:daily});
})(typeof window!=='undefined'?window:this);
