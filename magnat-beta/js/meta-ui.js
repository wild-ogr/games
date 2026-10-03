/* ================= «Из ларька в магнаты: бизнес» — интерфейс этапа 4 (META): Планёрка, вехи глав, цель квартала, «Доля основателя», украшения за 💎, буст продаж =================
   Логика — js/game.js (GAME.plan/planGift/planX2/planClaim, GAME.miles, GAME.qgPick, GAME.perkPick, GAME.cos*, GAME.boostOk). Здесь — только вид.
   Встраивание: META.card(el) — дорисовать карточки в el (экран «Сегодня», карта недр); повторный вызов перерисует их на месте.
   Прочее: META.openPlan(), META.openMiles(), META.openCos(), META.openPerks(), META.openPrestige(), META.starterHtml() (один раз — в окне главы «Своё дело»),
   META.ipoHtml() (строка для окна IPO: доля основателя и следующая планка). Реклама — только кнопками «📺 … за рекламу» при adOk(), награда — в колбэке досмотра. */
(function(){
'use strict';
const E=ECON;
const $m=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const T=(ru,en)=>L(ru,en);
const cr=n=>n+'\u00a0💎';
const snd=k=>{try{(SND[k]||SND.tap)();}catch(e){}};
const ad=()=>{try{return typeof adOk==='function'&&adOk();}catch(e){return false;}};
let lastEl=null,cssOn=false;
// «сочность»: 💎 летят в счётчик (UI.fly), салют (UI.salute) — если интерфейс их даёт
function flyCr(btn,n){try{if(!n||!window.UI||!UI.fly)return;const r=btn&&btn.getBoundingClientRect?btn.getBoundingClientRect():null;UI.fly(r?{x:r.left+r.width/2,y:r.top}:{x:innerWidth/2,y:innerHeight/2},n,'cr');}catch(e){}}
function salute(small){try{window.UI&&UI.salute&&UI.salute(small);}catch(e){}}

/* ---------- стиль (свой, с префиксом mt-): крупно для 45+, кнопки ≥ 48 px, без inset и без flex-gap ---------- */
function css(){if(cssOn)return;cssOn=true;const s=document.createElement('style');s.id='metaCss';s.textContent=`
.mt-wrap{margin:0 0 12px}
.mt-card{background:var(--card,#fff);color:var(--ink,#1d2733);border:1px solid var(--line,#e3e7ee);border-left:5px solid var(--sign,var(--accent,#c8641e));border-radius:var(--r2,16px);padding:12px 14px;margin:0 0 10px;font-size:17px;line-height:1.35}
.mt-card h4{margin:0 0 6px;font-size:18px;font-weight:700}
.mt-card p{margin:4px 0}
.mt-mut{color:var(--muted,#5a6675);font-size:16px}
.mt-row{display:flex;align-items:center;flex-wrap:wrap}
.mt-row>*{margin:4px 8px 4px 0}
.mt-f1{flex:1 1 180px;min-width:0}
.mt-btn{min-height:48px;padding:8px 14px;border-radius:12px;border:1px solid var(--line2,#d0d5dd);background:var(--card,#fff);color:var(--ink,#1d2733);font:inherit;font-size:17px;font-weight:600;cursor:pointer}
.mt-btn.go{background:var(--good,#2e7d32);border-color:var(--good,#2e7d32);color:#fff}
.mt-btn.x2,#mcard .btn.mt-x2b{background:#fff4d6;border:2px solid #f0a020;color:#7a3f05;box-shadow:none}
.mt-x2r{display:flex;justify-content:flex-end;margin-top:6px}
.mt-btn.ac{background:var(--accent,#c8641e);border-color:var(--accent,#c8641e);color:var(--on-accent,#fff)}
.mt-btn[disabled]{opacity:.5;cursor:default}
.mt-bar{height:10px;border-radius:6px;background:var(--track,#e4e7ec);overflow:hidden;margin:6px 0 2px}
.mt-bar i{display:block;height:100%;background:var(--good,#2e7d32);border-radius:6px}
.mt-cal{display:flex;flex-wrap:wrap;margin:6px 0}
.mt-cal>div{flex:1 0 11%;min-width:38px;margin:0 3px 6px 0;padding:6px 1px;text-align:center;border-radius:10px;background:var(--soft,#f2f4f7);font-size:14px;line-height:1.25;overflow:hidden}
.mt-cal>div b{display:block;font-size:17px}
.mt-cal>div.on{background:var(--accent,#c8641e);color:var(--on-accent,#fff)}
.mt-cal>div.ok{background:var(--good-t,#ecfdf3);color:var(--good,#2e7d32)}
.mt-task{padding:8px 0;border-top:1px solid var(--line,#e3e7ee)}
.mt-task:first-child{border-top:0}
.mt-mile{display:flex;align-items:center;padding:7px 0;border-top:1px solid var(--line,#e3e7ee)}
.mt-mile:first-child{border-top:0}
.mt-mile>span:first-child{flex:1 1 auto;min-width:0;padding-right:8px}
.mt-mile.done{color:var(--good,#2e7d32)}
.mt-opt{display:block;width:100%;text-align:left;margin:6px 0}
.mt-opt small{display:block;font-weight:400;color:var(--muted,#5a6675);font-size:15px}
.mt-cos{display:flex;flex-wrap:wrap}
.mt-cos>button{flex:0 0 31%;min-width:90px;min-height:64px;margin:0 6px 6px 0;padding:6px;border-radius:12px;border:2px solid var(--line,#e3e7ee);background:var(--card,#fff);color:var(--ink,#1d2733);font:inherit;font-size:15px;cursor:pointer;line-height:1.2}
.mt-cos>button.sel{border-color:var(--good,#2e7d32)}
.mt-cos>button b{display:block;font-size:22px}
.mt-sw{display:inline-block;width:26px;height:26px;border-radius:50%;vertical-align:middle}
#hName::before{content:var(--emb,"")}
body.mt-sg #hdr{box-shadow:inset 0 -4px 0 var(--sign)}
body.mt-fr #adv .ah>svg,body.mt-fr .mt-face{box-shadow:0 0 0 4px var(--frame);border-radius:50%}
.mt-pass{border-left-color:#b8860b}
/* тема «Ларёк 90-х» (покупка set90, класс ставит shell.js applyOffice): малиновые акценты, клетчатая клеёнка, неоновая вывеска в шапке */
body.th-90s{--bg:#f8efe4;--page:#efe1d0;--card:#fffdf9;--card2:#fdf6ee;--soft:#f6ebe0;--soft2:#fbf3ea;--track:#ead9c8;--line:#ead9c8;--line2:#d9c2ad;
  --accent:#b0174f;--accent-d:#8e1240;--accent-t:#fbe6ee;--on-accent:#fff;--blue:#b0174f;--hl:#b0174f;--hl2:rgba(176,23,79,.22);--tip-ln:#b0174f;--mk-sel:#b0174f;--aucb:#b0174f;
  --btnsh:0 6px 16px rgba(176,23,79,.28);--chart-rev:#b0174f;--sc-acc:#b0174f;
  --hd-bg:#241528;--hd-ink:#fff;--hd-mut:#f3c4dc;--hd-btn:#3a2342;--hdcash:#8dffc0;--hdneg:#ff8a9a;--hd-line:#3a2342;
  --nav-bg:#fffdf9;--nav-ink:#6b5560;--nav-on:#b0174f;--nav-onbg:#fbe6ee;
  background-color:#efe1d0;background-image:linear-gradient(45deg,rgba(176,23,79,.07) 25%,transparent 25%,transparent 75%,rgba(176,23,79,.07) 75%),linear-gradient(45deg,rgba(176,23,79,.07) 25%,transparent 25%,transparent 75%,rgba(176,23,79,.07) 75%);
  background-size:32px 32px;background-position:0 0,16px 16px}
body.th-90s #hName{text-shadow:0 0 6px rgba(255,64,160,.75)}
`;document.head.appendChild(s);}

/* ---------- украшения: эмблема перед названием холдинга, цвет вывесок (полоса шапки, карточки), рамка портрета Людмилы ---------- */
function applyCos(){if(!window.GAME||!GAME.cosCur)return;css();const r=document.documentElement.style,b=document.body;
  const em=GAME.cosCur('emb'),sg=GAME.cosCur('sign'),fr=GAME.cosCur('fr');
  r.setProperty('--emb',em?JSON.stringify(em.ic+' '):'""');
  if(sg&&!sg.free){r.setProperty('--sign',sg.c);b&&b.classList.add('mt-sg');}else{r.removeProperty('--sign');b&&b.classList.remove('mt-sg');}
  if(fr){r.setProperty('--frame',fr.c);b&&b.classList.add('mt-fr');}else{r.removeProperty('--frame');b&&b.classList.remove('mt-fr');}}

/* ---------- тексты ---------- */
function taskTxt(t){const n=t.need;switch(t.k){
  case 'close':return T(`Закройте ${n} ${plural(n,'месяц','месяца','месяцев')}`,`Close ${n} ${n===1?'month':'months'}`);
  case 'prof':return T('Закройте месяц с прибылью','Close a month in profit');
  case 'gigs':return T(`Выполните ${n} ${plural(n,'заказ','заказа','заказов')}`,`Complete ${n} ${n===1?'job':'jobs'}`);
  case 'pts':return GAME.W&&!GAME.W.biz.length?T('Откройте первое дело — кофейный автомат','Open your first business — a coffee machine'):T('Откройте новую точку','Open a new outlet');
  case 'ip':return T('Оформите ИП — без него своё дело не открыть','Register as a sole trader — you need it for a business');
  case 'bike':return T('Купите велосипед — курьеру платят больше','Buy a bicycle — couriers earn more');
  case 'city':return T('Откройте дело в новом городе','Expand to a new city');
  case 'eq':return T(`Увеличьте капитал на ${FMT.pct(n)}`,`Grow equity by ${FMT.pct(n)}`);
  case 'expl':return T('Разведайте участок','Explore a plot');
  case 'build':return T('Начните стройку','Start a construction');
  case 'sold':return T(`Продайте товара на ${FMT.money(n)}`,`Sell goods worth ${FMT.money(n)}`);
  case 'lic':return T('Получите лицензию на участок','Get a plot licence');}return '';}
function taskProg(t){const c=Math.max(0,GAME.taskCur(t));if(t.pct)return FMT.pct(Math.min(c,t.need),1)+' / '+FMT.pct(t.need);
  if(t.k==='sold')return FMT.money(Math.min(c,t.need))+' / '+FMT.money(t.need);return Math.min(c,t.need)+' / '+t.need;}
const QTX={np:['Спокойный квартал: прибыль больше нуля','A calm quarter: profit above zero'],eq:['Стоимость компании +6 % за квартал','Company value +6% this quarter'],
  rev:['Выручка на 10 % больше прошлого квартала','Revenue 10% above last quarter'],expl:['Разведать 2 участка','Explore 2 plots'],lic:['Новая лицензия на участок','A new plot licence'],
  build:['Начать стройку нового объекта','Start building a new site'],debt:['Снизить долг на 20 %','Cut debt by 20%']};
function qProg(g){const x=g.o[g.p],v=GAME.qgCur(g);switch(x.k){case 'np':return (v>0?'+':'')+FMT.money(v);case 'eq':return FMT.pct(v,1)+' / '+FMT.pct(x.need);
  case 'rev':return FMT.pct(v)+' / '+FMT.pct(x.need);case 'debt':return FMT.pct(Math.max(0,v))+' / '+FMT.pct(x.need);default:return Math.max(0,v)+' / '+x.need;}}
function qFrac(g){const x=g.o[g.p],v=GAME.qgCur(g);if(x.k==='np')return v>0?1:0;return Math.max(0,Math.min(1,v/(x.need||1)));}
const PK={geo:['Геолог','Geologist','Разведка дешевле на 15 % и быстрее на 10 %','Exploration 15% cheaper and 10% faster'],
  bank:['Связи в банке','Bank connections','Ставка по кредитам ниже на 1 п.','Loan rate 1 pt lower'],
  logi:['Логист','Logistician','Ж/д тариф ниже на 10 %','Rail tariff 10% lower'],
  brig:['Своя бригада','Own crew','Стройка быстрее на 10 %','Construction 10% faster'],
  vert:['Свой передел','Own processing','Заводы: постоянные расходы −10 %, переработка −20 %','Plants: fixed costs −10%, processing −20%'],
  heir:['Наследство','Legacy','Ещё один участок без торгов в начале холдинга','One more plot without an auction at the start of a holding']};
const pkName=k=>T(PK[k][0],PK[k][1]),pkDesc=k=>T(PK[k][2],PK[k][3]);
function mileTxt(m){return T(m.ru,m.en);}
function mileProg(m){if(m.done)return '✓';if(m.f==='p')return Math.round(Math.min(1,m.cur)*100)+' %';if(m.f==='m')return FMT.money(Math.max(0,m.cur))+' / '+FMT.money(m.need);if(m.f==='r')return FMT.num(m.cur,2)+' / '+FMT.num(m.need,1);return Math.floor(m.cur)+' / '+m.need;}
const bar=f=>`<div class="mt-bar"><i style="width:${(Math.max(0,Math.min(1,f))*100).toFixed(1)}%"></i></div>`;
function cosName(c){return c?T(c.ru,c.en):'';}

/* ---------- покупки 29.09: «Договор со спонсором» (×2 💎 за ролики), «Путёвка председателя» (посылки), «Лихие 90-е» (украшения) ---------- */
const sponsor=()=>{try{return typeof PAY!=='undefined'&&PAY.own('sponsor');}catch(e){return false;}};
const PASS_N=30,PASS_CR=15;
const pday=()=>typeof payDay==='function'?payDay():Math.floor(Date.now()/864e5);
// очередь путёвок: каждая следующая начинается после 30 дней предыдущей; открыто посылок = дней с начала (включая сегодня), не больше 30
function passQ(){const G=isO(S.psG)?S.psG:{},Tk=isO(S.psT)?S.psT:{},d=pday();let c=-1e9,left=0,av=0;const q=[];
  const ks=Object.keys(G).filter(k=>typeof G[k]==='number'&&isFinite(G[k])).sort((a,b)=>G[a]-G[b]||(a<b?-1:a>b?1:0));
  for(const k of ks){const st=Math.max(G[k],c);c=st+PASS_N;const t=Math.max(0,Math.min(PASS_N,Tk[k]|0)),op=Math.max(0,Math.min(PASS_N,d-st+1)),a=Math.max(0,op-t);
    q.push({k,a});left+=PASS_N-t;av+=a;}
  return {q,left,av,d,x2:Tk._c===d&&Tk._x!==d};}
const isO=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
// забрать все открытые посылки: +15 💎 за каждую
function passClaim(){const P=passQ();if(!P.av)return 0;if(!isO(S.psT))S.psT={};
  for(const x of P.q)if(x.a)S.psT[x.k]=(S.psT[x.k]|0)+x.a;S.psT._c=P.d;const n=P.av*PASS_CR;GAME.addCr(n,'pass');try{save();}catch(e){}return n;}
// «📺 удвоить посылку» — раз в день после того, как забрали; зовётся ТОЛЬКО из колбэка досмотра. Со спонсором — вдвое больше
function passX2(){const P=passQ();if(!P.x2)return 0;if(!isO(S.psT))S.psT={};S.psT._x=P.d;const n=PASS_CR*(sponsor()?2:1);GAME.addCr(n,'passx2');try{save();}catch(e){}return n;}
// подписи «📺 ×2»: сколько было и сколько станет (честно, как в Козле/Гастрономе/Зине)
const x2Lbl=(a,b)=>'📺 '+(b===2*a?T('×2 за рекламу','×2 for an ad'):T('За рекламу','For an ad'))+': +'+a+' → +'+cr(b);
const giftE=p=>(p&&p.got?(p.gv||10):(GAME.CAL[p.cal]||10))*(sponsor()?2:1);   // сколько добавит ролик к подарку дня
function passCard(){const P=passQ();if(!P.left&&!P.x2)return '';
  let h=`<div class="mt-card mt-pass"><h4>🎫 ${T('Путёвка председателя','Chairman’s voucher')}</h4><div class="mt-row"><span class="mt-f1">📦 ${P.av?T('Посылка ждёт','A parcel is waiting')+`: <b>+${cr(P.av*PASS_CR)}</b>`+(P.av>1?` (${pl(P.av,'посылка','посылки','посылок','parcel','parcels')})`:''):T('Сегодняшняя посылка получена','Today’s parcel is received')}<br><span class="mt-mut">${T('Осталось посылок','Parcels left')}: ${Math.max(0,P.left-P.av)}${P.av?'':' · '+T('следующая — завтра','next one tomorrow')}</span></span>`;
  const e=PASS_CR*(sponsor()?2:1);
  if(P.av){h+=`<button class="mt-btn go noenter" data-mt="pass">${T('Забрать','Take')} +${cr(P.av*PASS_CR)}</button></div>`;
    if(ad())h+=`<div class="mt-x2r"><button class="mt-btn x2 noenter" data-mt="passgx2">${x2Lbl(P.av*PASS_CR,P.av*PASS_CR+e)}</button></div>`;return h+'</div>';}
  if(P.x2&&ad())h+=`<button class="mt-btn x2 noenter" data-mt="passx2">📺 ${T('Ещё','Another')} +${cr(e)} ${T('за рекламу','for an ad')}</button>`;
  return h+'</div></div>';}
// 💎 за ролики ×2 при «Договоре со спонсором»: обёртки над GAME (лимиты и проверки — те же, считает исходная функция)
function wrapSponsor(){if(GAME.__sp)return;GAME.__sp=1;
  // «Ролики дня» (лесенка) удваивает сам game.js (grant QUEST)
  const x0=GAME.planX2;if(x0)GAME.planX2=function(){const n=x0.apply(this,arguments);if(n&&sponsor()){GAME.addCr(n,'sponsor');return n*2;}return n;};
  const g0=GAME.gift;if(g0)GAME.gift=function(x2){const p=S.pl,was=!!(p&&p.x2),n=g0.apply(this,arguments);
    if(x2&&sponsor()&&!was&&S.pl&&S.pl.x2){const e=S.pl.gv||10;GAME.addCr(e,'sponsor');return n+e;}return n;};}
// украшения из покупок: эмблема и рамка путёвки (выдаются в S.cos), коллекция «Лихие 90-е» (buy:'set90' — пока куплено)
const COS_ADD=[{id:'em_pass',k:'emb',ic:'🎖',ru:'Путёвка',en:'Voucher',cr:0},{id:'fr_sana',k:'fr',c:'#3f8f8a',ru:'Санаторная рамка',en:'Sanatorium frame',cr:0},
  {id:'em_pager',k:'emb',ic:'📟',ru:'Пейджер',en:'Pager',cr:0,buy:'set90'},{id:'em_case',k:'emb',ic:'💼',ru:'Дипломат',en:'Briefcase',cr:0,buy:'set90'},
  {id:'em_tape',k:'emb',ic:'📼',ru:'Кассета',en:'Cassette',cr:0,buy:'set90'},{id:'sg_raspb',k:'sign',c:'#b0174f',ru:'Малиновый пиджак',en:'Raspberry blazer',cr:0,buy:'set90'},
  {id:'fr_leather',k:'fr',c:'#5b3a29',ru:'Кожаная рамка',en:'Leather frame',cr:0,buy:'set90'},
  // M36: подарок за первую покупку (shell.js payFirst → S.cos.fr_mecen), «Набор сетевика» (net_pack), «Колокол биржи» (ipo_pack)
  {id:'fr_mecen',k:'fr',c:'#7b3fa0',ru:'Рамка «Меценат»',en:'“Patron” frame',cr:0},
  {id:'em_net',k:'emb',ic:'🏬',ru:'Универмаг',en:'Department store',cr:0,buy:'net_pack'},{id:'sg_firm',k:'sign',c:'#0e6f8f',ru:'Фирменный',en:'Signature',cr:0,buy:'net_pack'},
  {id:'em_bell',k:'emb',ic:'🔔',ru:'Колокол',en:'Bell',cr:0,buy:'ipo_pack'},{id:'fr_exch',k:'fr',c:'#1d6f42',ru:'Биржевая рамка',en:'Exchange frame',cr:0,buy:'ipo_pack'}];
function addCos(){if(!Array.isArray(GAME.COS))return;for(const c of COS_ADD)if(!GAME.COS.some(x=>x.id===c.id))GAME.COS.push(c);}

/* ---------- карточки для «Сегодня»/карты ---------- */
function planCard(){const p=GAME.plan(),ts=p.t||[],done=ts.filter(t=>t.ok==='got').length,ready=ts.filter(t=>t.ok!=='got'&&GAME.taskDone(t)).length;
  let h=`<div class="mt-card"><h4>📋 ${T('Планёрка у Людмилы Санны','Morning meeting with Lyudmila Sanna')}</h4>`;
  if(!p.got){const n=GAME.CAL[p.cal];h+=`<div class="mt-row"><span class="mt-f1">🎁 ${T('Подарок дня','Daily gift')} — ${T('день','day')} ${p.cal+1} ${T('из 7','of 7')}: <b>${n?cr(n):T('украшение','a decoration')}</b></span><button class="mt-btn go noenter" data-mt="gift">${T('Забрать','Take')}${n?' +'+cr(n):''}</button></div>`;
    if(ad())h+=`<div class="mt-x2r"><button class="mt-btn x2 noenter" data-mt="giftx2">${n?x2Lbl(n,n+giftE(p)):'📺 '+T('Украшение','Decoration')+' + '+cr(giftE(p))+' '+T('за рекламу','for an ad')}</button></div>`;}
  else if(ad()&&GAME.planX2Ok())h+=`<div class="mt-row"><span class="mt-f1 mt-mut">🎁 ${T('Подарок получен','Gift received')}${p.gv?': +'+cr(p.gv):''}</span><button class="mt-btn x2 noenter" data-mt="x2">${p.gv?x2Lbl(p.gv,p.gv+giftE(p)):'📺 +'+cr(giftE(p))+' '+T('за рекламу','for an ad')}</button></div>`;
  {const c=claimable();if(c.k>=2)h+=`<div class="mt-row"><span class="mt-f1">✨ ${T('Можно забрать','Ready to take')}: <b>${cr(c.n)}</b></span>${allBtn(c)}</div>`;}   // M34
  h+=`<div class="mt-row"><span class="mt-f1">✅ ${T('Поручения','Tasks')}: <b>${done} ${T('из','of')} ${ts.length}</b>${ready?` · <b style="color:var(--good,#2e7d32)">${T('можно забрать','ready to claim')}: ${ready}</b>`:''}${p.str>1?` · 🔥 ${pl(p.str,'день','дня','дней','day','days')} ${T('подряд','in a row')}`:''}</span><button class="mt-btn noenter" data-mt="plan">${T('Открыть','Open')}</button></div>${ladRow()}</div>`;
  return h;}
// «Ролики дня» (лесенка, game.js/QUEST): строка в карточке Планёрки — сколько пройдено и сколько даст следующий
function ladRow(){const x=GAME.lad?GAME.lad():null;if(!ad()||!x||!x.on)return '';
  return `<div class="mt-row"><span class="mt-f1">📺 ${x.flat?T('Бонус-ролик','Bonus video')+(x.fn?': <b>'+x.fn+'</b> '+T('сегодня','today'):'')+' · '+T('раз в ','every ')+Math.round(GAME.LAD_FLAT_GAP/60)+T(' мин',' min'):T('Ролики дня','Daily videos')+': <b>'+x.n+' '+T('из','of')+' '+x.max+'</b>'} · ${T('следующий','next')} <b>+${cr(x.next)}</b></span><button class="mt-btn x2 noenter" data-mt="lad">${x.wait>0&&x.flat?T('Через ','In ')+Math.max(1,Math.ceil(x.wait/6e4))+T(' мин',' min'):x.wait>0?T('Через ','In ')+Math.floor(Math.ceil(x.wait/1000)/60)+':'+String(Math.ceil(x.wait/1000)%60).padStart(2,'0'):T('Смотреть','Watch')}</button></div>`;}
function milesCard(){const a=GAME.miles();if(!a.length)return '';const left=a.filter(m=>!m.done),nx=left[0];const n=a.length-left.length;
  let h=`<div class="mt-card"><h4>🏅 ${T('Вехи главы — награды','Chapter milestones — rewards')}: ${n} ${T('из','of')} ${a.length}</h4>`;
  if(nx){const f=nx.f==='r'?(nx.cur-4)/(nx.need-4):nx.cur/nx.need;h+=`<div class="mt-row"><span class="mt-f1">${esc(mileTxt(nx))} — <b>${mileProg(nx)}</b> · +${cr(nx.cr)}${nx.cos?' + '+T('украшение','decoration'):''}</span></div>${bar(f)}`;}
  else h+=`<p>${T('Все вехи главы пройдены — молодец!','All chapter milestones done — well done!')}</p>`;
  return h+`<div class="mt-row"><button class="mt-btn noenter" data-mt="miles">${T('Все вехи','All milestones')}</button></div></div>`;}
function qgCard(){const W=GAME.W;if(!W||!W.ned)return '';const g=W.qg;let h='';
  if(g&&g.st==='pick'){h=`<div class="mt-card"><h4>🏛 ${T('Совет директоров: цель квартала','Board: goal for the quarter')}</h4><p class="mt-mut">${T('Выберите одну — чем смелее цель, тем больше награда. Итог — в конце квартала.','Pick one — the bolder the goal, the bigger the reward. Result at the end of the quarter.')}</p>`;
    g.o.forEach((x,i)=>{h+=`<button class="mt-btn mt-opt noenter" data-mt="qg:${i}">${esc(T(QTX[x.k][0],QTX[x.k][1]))} <b>+${cr(x.cr)}</b></button>`;});h+='</div>';}
  else if(g&&g.st==='run'){const x=g.o[g.p],ok=GAME.qgOk(g);h=`<div class="mt-card"><h4>🏛 ${T('Цель квартала','Quarter goal')}</h4><div class="mt-row"><span class="mt-f1">${esc(T(QTX[x.k][0],QTX[x.k][1]))} — <b>${qProg(g)}</b> · +${cr(x.cr)}</span></div>${bar(qFrac(g))}<p class="mt-mut">${ok?T('Пока выполняется — держите курс до конца квартала.','On track — hold the course till the quarter ends.'):T('Итог — при закрытии последнего месяца квартала.','Result — when the last month of the quarter closes.')}</p></div>`;}
  return h;}
function boostCard(){const W=GAME.W;if(!W||!W.ned)return '';
  if(GAME.boostOn())return `<div class="mt-card"><p>🤝 ${T('Людмила договорилась с покупателями: цены продаж +10 % до','Lyudmila struck a deal with buyers: sale prices +10% until')} <b>${FMT.date(Math.floor((W.bst-1)/30))}</b></p></div>`;
  if(!ad()||!GAME.boostOk())return '';const wt=GAME.adWait&&GAME.adWait('bst')>0;   // M31: пауза места вместо 1 в день
  const bn=Math.max(1,Math.round((E.boostD?E.boostD(W):90)/30));
  return `<div class="mt-card"><div class="mt-row"><span class="mt-f1">🤝 ${T(`Людмила может договориться с покупателями: +10 % к цене продаж на ${bn} ${bn===1?'месяц':bn<5?'месяца':'месяцев'}`,`Lyudmila can strike a deal with buyers: +10% on sale prices for ${bn} ${bn===1?'month':'months'}`)}${wt?'<br><small>📺 '+GAME.adTxt('bst')+'</small>':''}</span><button class="mt-btn noenter" data-mt="boost"${wt?' disabled':''}>📺 ${T('+10 % за рекламу','+10% for an ad')}</button></div></div>`;}
function perkCard(){if(!Array.isArray(S.pkP)||!S.pkP.length)return '';
  return `<div class="mt-card"><div class="mt-row"><span class="mt-f1">⭐ <b>${T('Доля основателя','Founder’s share')}</b>: ${T('выберите улучшение навсегда','choose a permanent upgrade')}</span><button class="mt-btn ac noenter" data-mt="perks">${T('Выбрать','Choose')}</button></div></div>`;}
// запасной вариант, если окно главы не показало предложение (META.starterHtml): один раз — карточка на «Сегодня» до конца этого захода
let starterSess=false;
function starterCard(){const W=GAME.W;if(!W||W.st!=='small'||!starterOk()||S.ask&&S.ask.starterC||shopOn())return '';
  if(!(W.me&&W.biz.length>=2))return '';if(!S.ask)S.ask={};if(S.ask.starter&&!starterSess)return '';
  if(!S.ask.starter){S.ask.starter=Date.now();starterSess=true;try{save();}catch(e){}}
  return `<div class="mt-card">${starterBody()}<div class="mt-row"><button class="mt-btn noenter" data-mt="starterNo">${T('Не сейчас','Not now')}</button></div></div>`;}
// M30: первые 10 заказов главы 1 — Планёрка одной строкой (подарок или поручения), без вех, Кабинета и путёвки (решение владельца 02.10)
function early(){try{return !!(window.BIZUI&&BIZUI.early&&BIZUI.early());}catch(e){return false;}}
function planMini(){const p=GAME.plan(),ts=p.t||[],done=ts.filter(t=>t.ok==='got').length;const n=!p.got?GAME.CAL[p.cal]:0;
  return `<div class="mt-card"><div class="mt-row"><span class="mt-f1">📋 <b>${T('Планёрка','Morning meeting')}</b>: ${!p.got?T('подарок дня','daily gift')+(n?' +'+cr(n):''):T('поручения','tasks')+' '+done+' '+T('из','of')+' '+ts.length}</span>${!p.got?`<button class="mt-btn go noenter" data-mt="gift">${T('Забрать','Take')}</button>`:`<button class="mt-btn noenter" data-mt="plan">${T('Открыть','Open')}</button>`}</div></div>`;}
// M34: «Забрать всё» — подарок дня, готовые поручения (с бонусом за все три) и посылки путёвки одной кнопкой (было 5–6 нажатий)
function claimable(){const p=GAME.plan(),ts=p.t||[];let n=0,k=0;if(!p.got){n+=GAME.CAL[p.cal]||0;k++;}const rd=ts.filter(t=>t.ok!=='got'&&GAME.taskDone(t));for(const t of rd){n+=t.cr;k++;}
  if(rd.length&&!p.all&&ts.every(t=>t.ok==='got'||GAME.taskDone(t)))n+=TASK_ALL();const P=passQ();if(P.av){n+=P.av*PASS_CR;k++;}return {n,k};}
function claimAll(){const p=GAME.plan();let n=0,dec='';if(!p.got){n+=GAME.planGift()||0;const q=GAME.plan();if(q.gi){const c=GAME.COS.find(x=>x.id===q.gi);if(c)dec=cosName(c);applyCos();}}
  (GAME.plan().t||[]).forEach((t,i)=>{n+=GAME.planClaim(i)||0;});n+=passClaim()||0;return {n,dec};}
function allBtn(c,cls){return `<button class="mt-btn go noenter${cls||''}" data-mt="all">${T('Забрать всё','Take all')}${c.n?' +'+cr(c.n):''}</button>`;}
function planLine(){const p=GAME.plan(),ts=p.t||[],done=ts.filter(t=>t.ok==='got').length,c=claimable();
  return `<div class="mt-card"><div class="mt-row"><span class="mt-f1">📋 <b>${T('Планёрка','Morning meeting')}</b>: ${c.k?`<b>${c.n?cr(c.n):'🎁'}</b> ${T('ждут','waiting')} · `:''}${T('поручения','tasks')} ${done} ${T('из','of')} ${ts.length}</span>${c.k?allBtn(c):`<button class="mt-btn noenter" data-mt="plan">${T('Открыть','Open')}</button>`}</div>${p.got&&ad()&&GAME.planX2Ok()?`<div class="mt-row"><span class="mt-f1 mt-mut">🎁 ${T('Подарок получен','Gift received')}${p.gv?': +'+cr(p.gv):''}</span><button class="mt-btn x2 noenter" data-mt="x2">${p.gv?x2Lbl(p.gv,p.gv+giftE(p)):'📺 +'+cr(giftE(p))+' '+T('за рекламу','for an ad')}</button></div>`:''}</div>`;}
function html(m){if(early())return planMini();if(m==='mini')return planLine()+hintCard();if(m==='rest')return perkCard()+passCard()+qgCard()+milesCard()+cabCard()+boostCard()+starterCard()+shopCard();const x=shopCard()+hintCard();return perkCard()+passCard()+planCard()+qgCard()+milesCard()+cabCard()+boostCard()+starterCard()+x;}
/* ---------- M36: магазин открылся (П1) и мягкие подсказки Людмилы/друзей (П2) — карточки на «Сегодня», не окна ---------- */
const ask=()=>{if(!S.ask||typeof S.ask!=='object')S.ask={};return S.ask;};
const payOn=()=>{try{return typeof PAY!=='undefined'&&PAY.on;}catch(e){return false;}};
const once={};function shown(k,w){if(once[k])return;once[k]=1;try{STAT.ev('offer',{k,w,a:'show'});}catch(e){}}
// плохой месяц (убыток, овердрафт, санация) — никаких предложений (как межэкранная в shell.js adDue)
function badMonth(){const W=GAME.W,r=W&&Array.isArray(W.reps)&&W.reps.length?W.reps[W.reps.length-1]:null;try{return !!(r&&(r.san||r.pl&&E.netOf(r.pl)<0))||!!(W&&W.odM>0);}catch(e){return false;}}
// «🛒 Магазин открыт» — один раз после 10 заказов главы 1, пока стартовый набор в продаже: честный остаток дней (shell.js starterLeft)
function shopOn(){const W=GAME.W;if(!W||W.ned||(W.st!=='gig'&&W.st!=='small')||!payOn()||!starterOk()||ask().shopC)return 0;const n=typeof starterLeft==='function'?starterLeft():0;return n;}
function shopCard(){const n=shopOn();if(!n)return '';shown('shop_open','today');
  return `<div class="mt-card"><h4>🛒 ${T('Магазин открыт','The shop is open')}</h4><p>🎁 ${T('Стартовый набор председателя (150 💎 и эмблема «Золотой молот») — в магазине ещё <b>'+n+' '+pl(n,'день','дня','дней','day','days')+'</b>. Потом его не будет.','The chairman’s starter pack (150 💎 and the “Golden hammer” emblem) stays in the shop for <b>'+n+' more '+pl(n,'день','дня','дней','day','days')+'</b>. After that it’s gone.')}</p>
    <div class="mt-row"><button class="mt-btn ac noenter" data-mt="shopGo">🛒 ${T('Открыть магазин','Open the shop')}</button><button class="mt-btn noenter" data-mt="shopNo">${T('Понятно','Got it')}</button></div></div>`;}
// подсказка — не чаще раза за главу (S.ask.hint[глава]), не в первые 2 игровых месяца главы, никогда после плохого месяца
function stNum(){try{return GAME.stN();}catch(e){return 1;}}
function hintPick(){const W=GAME.W;if(!W||!payOn()||badMonth())return null;const a=ask(),s=stNum();if(!a.hint||typeof a.hint!=='object')a.hint={};if(a.hint[s])return null;
  if(!a.hintT||typeof a.hintT!=='object')a.hintT={};if(a.hintT[s]==null){a.hintT[s]=W.t|0;return null;}if((W.t|0)-a.hintT[s]<60)return null;
  // Людмила: трижды продлевали смену роликом, а «Управляющего» нет (с ним — без рекламы)
  if((S.shAd|0)>=3&&!PAY.own('manager')&&PAY.item('manager'))return {k:'mgr',who:'lud',go:'manager',
    t:T('Вы уже '+(S.shAd|0)+' раза продлевали смену за ролик. Можно нанять управляющего: 8 часов вместо 6, и продлевать — без рекламы. Решать вам, я и так справляюсь.','You’ve extended the shift for a video '+(S.shAd|0)+' times. You could hire a manager: 8 hours instead of 6, and extensions without ads. Your call — I manage either way.')};
  // друг: набор этой главы (виден в магазине и ещё не куплен)
  const k={3:'net_pack',4:'nedra_pack',5:'ipo_pack'}[s];if(k&&window.SHOP&&SHOP.visible&&SHOP.visible(k)&&!PAY.own(k)){const it=PAY_ITEMS[k];
    return {k,who:'mar',go:k,t:T('Марина: «Видела в магазине «'+it.name+'» — '+it.ic+' прямо под вашу главу. Не обязательно, но красиво.»','Marina: “I saw “'+it.name+'” in the shop — '+it.ic+' just right for this chapter. Not a must, but it looks nice.”')};}
  return null;}
let hintNow=null;
function hintCard(){if(badMonth())return praiseCard();const h=hintNow&&hintNow.s===stNum()?hintNow:(hintNow=hintPick());if(!h)return praiseCard();if(!h.s){h.s=stNum();ask().hint[h.s]=1;try{save();}catch(e){}}shown('hint_'+h.k,'today');
  return `<div class="mt-card"><div class="mt-row"><span class="mt-f1">💬 ${esc(h.t)}</span></div><div class="mt-row"><button class="mt-btn noenter" data-mt="hintGo">${T('Посмотреть','Have a look')}</button><button class="mt-btn noenter" data-mt="hintNo">${T('Не надо','No, thanks')}</button></div></div>`;}
function hintDone(){if(!hintNow)return;ask().hint[hintNow.s||stNum()]=1;try{save();}catch(e){}}
// друзья замечают купленное оформление (не продают): один раз на покупку; что было куплено до этой версии — без реплики
const LOOKS={set90:['Марина: «Ого, малиновый пиджак на вывеске! Прямо как в девяностые.»','Marina: “Wow, a raspberry blazer on the sign! Just like the nineties.”'],
  office:['Борис: «Кабинет — как у министра. Я бы тут и чай пил.»','Boris: “An office fit for a minister. I’d drink my tea here.”'],
  th_poster:['Марина: «Тёплые цвета, как на старом плакате. Уютно!»','Marina: “Warm colours, like an old poster. Cosy!”'],
  livery:['Серёга: «Новые вывески видно с другого конца улицы!»','Seryoga: “The new signs are visible from the other end of the street!”'],
  net_pack:['Серёга: «Фирменные вывески — сразу видно, что сеть!»','Seryoga: “Signature signs — you can tell it’s a chain right away!”'],
  ipo_pack:['Борис: «Колокол уже висит? Солидно. Я надену галстук.»','Boris: “The bell is up already? Impressive. I’ll wear a tie.”']};
function praiseInit(){try{const a=ask();if(a.praised&&typeof a.praised==='object')return false;a.praised={};for(const k of Object.keys(LOOKS))if(PAY.own(k))a.praised[k]=1;return true;}catch(e){return false;}}
function praiseCard(){if(!payOn()||badMonth()||praiseInit())return '';const a=ask(),own=Object.keys(LOOKS).filter(k=>PAY.own(k));
  const k=own.find(x=>!a.praised[x]);if(!k)return '';
  return `<div class="mt-card"><div class="mt-row"><span class="mt-f1">💬 ${esc(T(LOOKS[k][0],LOOKS[k][1]))}</span><button class="mt-btn noenter" data-mt="praise:${k}">${T('Спасибо!','Thanks!')}</button></div></div>`;}
function cabCard(){try{return window.CAB&&CAB.card?CAB.card():'';}catch(e){console.error(e);return '';}}   // Кабинет (js/cab-ui.js): звание, мечта/вещь в продаже
// el — отдельный слот (например, #metaSlot на «Сегодня»): перерисовываем его целиком; через morphHTML (ui.js) — кнопки не пересоздаются под пальцем
function card(el){if(!el||!window.GAME||!GAME.W)return;css();applyCos();let h='';try{h=html(el.dataset&&el.dataset.mtm);}catch(e){console.error(e);}
  el.classList.add('mt-wrap');
  if(typeof window.morphHTML==='function'){try{window.morphHTML(el,h);}catch(e){el.innerHTML=h;}}else el.innerHTML=h;lastEl=el;if(els.indexOf(el)<0)els.push(el);}
const els=[];   // M34: на «Сегодня» главы 3 два слота (Планёрка строкой и остальное под «Ещё»)
function refresh(){for(let i=els.length-1;i>=0;i--){if(document.body.contains(els[i]))card(els[i]);else els.splice(i,1);}}

/* ---------- окна ---------- */
function openPlan(){const p=GAME.plan(),ts=p.t||[];snd('tap');
  let cal='<div class="mt-cal">';for(let i=0;i<7;i++){const n=GAME.CAL[i],today=p.got&&p.gc===i,past=p.got?i<p.gc:i<p.cal,next=!p.got&&i===p.cal;
    cal+=`<div class="${today||past?'ok':next?'on':''}">${i+1}<b>${n?n+'💎':'🎁'}</b>${today||past?'✓':next?'▲':'&nbsp;'}</div>`;}cal+=`</div><p class="mt-mut">${T('Дни календаря: ✓ — получено, ▲ — сегодняшний подарок.','Calendar days: ✓ — received, ▲ — today’s gift.')}</p>`;
  let tk='';ts.forEach((t,i)=>{const d=GAME.taskDone(t),got=t.ok==='got',f=t.pct?GAME.taskCur(t)/t.need:Math.max(0,GAME.taskCur(t))/t.need;
    tk+=`<div class="mt-task"><div class="mt-row"><span class="mt-f1">${got?'✅':d?'☑️':'▫️'} ${esc(taskTxt(t))} <span class="mt-mut">· ${got?T('получено','claimed'):taskProg(t)}</span></span>${got?'':`<button class="mt-btn ${d?'go':''} noenter" data-mt="claim:${i}"${d?'':' disabled'}>+${cr(t.cr)}</button>`}${!got&&!d&&GAME.planRerollOk&&GAME.planRerollOk()?`<button class="mt-btn noenter" data-mt="rr:${i}" aria-label="${T('Другое поручение','Another task')}">🔄 ${T('Другое','Swap')}</button>`:''}</div>${got?'':bar(f)}</div>`;});
  const all=ts.length&&ts.every(t=>t.ok==='got');
  modal(`<h2>📋 ${T('Планёрка','Morning meeting')}</h2>
    <p class="about">${T('Каждый день — подарок по календарю и три коротких поручения. Пропустили день — календарь отступит на шаг, а не сгорит.','Every day — a calendar gift and three short tasks. Miss a day and the calendar steps back one, it doesn’t burn.')}${p.str>1?` 🔥 ${T('Серия','Streak')}: <b>${pl(p.str,'день','дня','дней','day','days')}</b>.`:''}${p.miss?' '+T('(вчера пропустили — шаг назад)','(missed yesterday — one step back)'):''}</p>
    ${cal}
    ${(c=>c.k>=2?`<div class="row"><button class="btn green noenter" id="mtAll">✨ ${T('Забрать всё','Take all')} +${cr(c.n)}</button></div>`:'')(claimable())}
    <div class="row">${!p.got?(()=>{const n=GAME.CAL[p.cal];return `<button class="btn green noenter" id="mtGift">🎁 ${T('Забрать','Take')} ${n?'+'+cr(n):T('украшение','the decoration')}</button>${ad()?`<button class="btn noenter mt-x2b" id="mtGX2">${n?x2Lbl(n,n+giftE(p)):'📺 '+T('Украшение','Decoration')+' + '+cr(giftE(p))+' '+T('за рекламу','for an ad')}</button>`:''}`;})():ad()&&GAME.planX2Ok()?`<button class="btn noenter mt-x2b" id="mtX2">${p.gv?x2Lbl(p.gv,p.gv+giftE(p)):'📺 +'+cr(giftE(p))+' '+T('за рекламу','for an ad')}</button>`:''}</div>
    <h3>✅ ${T('Поручения на сегодня — до полуночи, по настоящему времени','Tasks for today — until midnight, real time')}</h3>${tk}${ladRow()?'<div class="mt-card" style="margin-top:10px">'+ladRow()+'</div>':''}
    <p class="mt-mut">${all?T('Все три выполнены — бонус получен. Завтра будут новые.','All three done — bonus received. New ones tomorrow.'):T(`Все три поручения — ещё +${TASK_ALL()} 💎.`,`All three tasks — another +${TASK_ALL()} 💎.`)}</p>
    <div class="row"><button class="btn noenter" id="mtCos">🎨 ${T('Украшения','Decorations')}</button>${S.fs||S.pk&&Object.keys(S.pk).length?`<button class="btn noenter" id="mtPres">⭐ ${T('Доля основателя','Founder’s share')}</button>`:''}<button class="btn" id="mtClose" data-esc="1">${T('Закрыть','Close')}</button></div>${typeof adDayHtml==='function'?adDayHtml():''}`);
  modalRe=openPlan;bindModal();
  const mc=$m('mcard');mc.querySelectorAll('[data-mt]').forEach(b=>b.onclick=()=>act(b.dataset.mt,true,b));
  if($m('mtAll'))$m('mtAll').onclick=()=>act('all',true,$m('mtAll'));if($m('mtGift'))$m('mtGift').onclick=()=>act('gift',true,$m('mtGift'));if($m('mtX2'))$m('mtX2').onclick=()=>act('x2',true,$m('mtX2'));if($m('mtGX2'))$m('mtGX2').onclick=()=>act('giftx2',true,$m('mtGX2'));
  $m('mtCos').onclick=openCos;if($m('mtPres'))$m('mtPres').onclick=openPrestige;$m('mtClose').onclick=close;}
const TASK_ALL=()=>3;
function openMiles(){const W=GAME.W,st=W&&W.st;snd('tap');const a=GAME.miles();
  const CH={gig:['Карьера','Career'],small:['Своё дело','My business'],mid:['Сеть','Network'],quarry:['Карьер','Quarry'],nedra:['Недра','Mining']};
  let h=`<h2>🎯 ${T('Вехи главы','Chapter milestones')}${CH[st]?' «'+T(CH[st][0],CH[st][1])+'»':''}</h2><p class="about">${T('Промежуточные цели на пути к следующей главе. За каждую — кристаллы, за последнюю — ещё и украшение.','Stepping stones to the next chapter. Crystals for each, and a decoration for the last one.')}</p><div class="mt-card">`;
  for(const m of a){const c=m.cos&&GAME.COS.find(x=>x.id===m.cos);h+=`<div class="mt-mile${m.done?' done':''}"><span>${m.done?'✅':'▫️'} ${esc(mileTxt(m))}<br><small class="mt-mut">+${cr(m.cr)}${c?' + '+esc(cosName(c)):''}</small></span><b>${mileProg(m)}</b></div>`;}
  if(!a.length)h+=`<p>${T('В этой главе вех нет.','No milestones in this chapter.')}</p>`;
  const g=W&&E.goal?E.goal(W):null,n=g&&g.need>g.cur&&(g.k==='ooo'||g.k==='quarry'||g.k==='opi'||g.k==='nedra')?GAME.eta(g.need,g.cur):null;
  h+=`</div>${n?`<p class="mt-mut">${T('До следующей главы при нынешнем темпе','To the next chapter at the current pace')}: <b>${GAME.etaTxt(n)}</b></p>`:''}<div class="row">${window.CAB?`<button class="btn noenter" id="mtWall">🖼 ${T('Прошлые главы — Стена почёта','Past chapters — Wall of fame')}</button>`:''}<button class="btn" id="mtClose" data-esc="1">${T('Закрыть','Close')}</button></div>`;
  modal(h);modalRe=openMiles;$m('mtClose').onclick=close;if($m('mtWall'))$m('mtWall').onclick=()=>{snd('tap');CAB.open('wall','miles');};}
function openCos(){snd('tap');const kinds=[['emb',T('Эмблема (перед названием холдинга)','Emblem (before the holding’s name)')],['sign',T('Цвет вывесок','Sign colour')],['fr',T('Рамка портрета Людмилы Санны','Frame for Lyudmila Sanna’s portrait')]];
  let h=`<h2>🎨 ${T('Украшения','Decorations')}</h2><p class="about">${T('Только для красоты — на деньги и рейтинг не влияют. У вас','Just for looks — they don’t affect money or the leaderboard. You have')} <b>${cr(GAME.cr())}</b>.</p>`;
  for(const [k,nm] of kinds){const cur=GAME.cosCur(k);h+=`<h3>${nm}</h3><div class="mt-cos">`;
    if(k!=='sign')h+=`<button class="noenter${!cur?' sel':''}" data-cs="${k}:"><b>—</b>${T('без','none')}</button>`;
    for(const c of GAME.COS.filter(x=>x.k===k)){const has=GAME.cosHas(c.id),sel=cur?cur.id===c.id:c.free;if(!has&&!c.cr)continue;
      const ic=k==='emb'?c.ic:`<span class="mt-sw" style="background:${c.c}"></span>`;
      h+=`<button class="noenter${sel?' sel':''}" data-cs="${k}:${c.id}"><b>${ic}</b>${esc(cosName(c))}${has?'':`<br><small>${cr(c.cr)}</small>`}</button>`;}
    h+='</div>';}
  const offer=typeof PAY!=='undefined'&&PAY.on&&PAY.item?['livery','set90'].filter(id=>PAY.item(id)&&!PAY.own(id)):[],lv=offer.length>0;
  h+=`${lv?payHtml(offer):''}<div class="row"><button class="btn" id="mtClose" data-esc="1">${T('Закрыть','Close')}</button></div>`;
  modal(h);modalRe=openCos;if(lv){PAY.bind($m('mcard'));PAY.re=openCos;}
  $m('mcard').querySelectorAll('[data-cs]').forEach(b=>b.onclick=()=>{const [k,id]=b.dataset.cs.split(':');const c=GAME.COS.find(x=>x.id===id);
    if(id&&!GAME.cosHas(id)){if(GAME.cr()<c.cr){toast(T('Не хватает кристаллов','Not enough crystals'));snd('no');return;}
      if(GAME.cosBuy(id)==='ok'){snd('coin');toast(T('Готово: ','Done: ')+cosName(c));}}
    else{GAME.cosSel(k,id||'');snd('tap');}applyCos();openCos();});
  $m('mtClose').onclick=close;}
function perkBtns(){if(!Array.isArray(S.pkP)||!S.pkP.length)return '';return S.pkP.map(k=>{const l=(S.pk&&S.pk[k])||0;return `<button class="mt-btn mt-opt noenter" data-pk="${k}">${esc(pkName(k))}${l?` · ${T('ур.','lvl')} ${l+1}`:''}<small>${esc(pkDesc(k))}</small></button>`;}).join('');}
function openPerks(){if(!Array.isArray(S.pkP)||!S.pkP.length){openPrestige();return;}snd('win');
  let h=`<h2>⭐ ${T('Доля основателя','Founder’s share')}</h2><p class="about">${T('Холдинг на бирже — а опыт остаётся с вами. Выберите одно улучшение: оно будет работать во всех следующих холдингах.','The holding is public — and the experience stays with you. Choose one upgrade: it will work in all your future holdings.')}</p>`;
  for(const k of S.pkP){const l=(S.pk&&S.pk[k])||0;h+=`<button class="mt-btn mt-opt noenter" data-pk="${k}">${esc(pkName(k))}${l?` · ${T('ур.','lvl')} ${l+1}`:''}<small>${esc(pkDesc(k))}</small></button>`;}
  h+=`<div class="row"><button class="btn noenter" id="mtLater" data-esc="1">${T('Решу позже','Decide later')}</button></div>`;
  modal(h);modalRe=openPerks;$m('mcard').querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{if(GAME.perkPick(b.dataset.pk)==='ok'){snd('coin');salute();toast('⭐ '+pkName(b.dataset.pk));openPrestige();}});
  $m('mtLater').onclick=close;}
function openPrestige(){snd('tap');const pk=S.pk||{},ks=Object.keys(E.PERKS).filter(k=>pk[k]>0),fame=Array.isArray(S.fame)?S.fame:[];
  let h=`<h2>⭐ ${T('Доля основателя','Founder’s share')}</h2><p class="about">${T('Доли основателя за все IPO','Founder shares from all IPOs')}: <b>${S.fs||0}</b> · IPO: <b>${fame.length}</b>. ${T('Следующая планка IPO','Next IPO bar')}: <b>${FMT.money(E.IPO_EQ)}</b>.</p><div class="mt-card">`;
  if(!ks.length)h+=`<p>${T('Улучшений пока нет — они появятся после первого IPO.','No upgrades yet — they come after your first IPO.')}</p>`;
  for(const k of ks)h+=`<div class="mt-mile"><span>${esc(pkName(k))}<br><small class="mt-mut">${esc(pkDesc(k))}</small></span><b>${T('ур.','lvl')} ${pk[k]}/${E.PERKS[k].max}</b></div>`;
  h+=`</div><div class="row">${Array.isArray(S.pkP)&&S.pkP.length?`<button class="btn accent noenter" id="mtPk">${T('Выбрать улучшение','Choose an upgrade')}</button>`:''}<button class="btn" id="mtClose" data-esc="1">${T('Закрыть','Close')}</button></div>`;
  modal(h);modalRe=openPrestige;if($m('mtPk'))$m('mtPk').onclick=openPerks;$m('mtClose').onclick=close;}
function close(){hideModal();refresh();try{window.uiRefresh&&window.uiRefresh();}catch(e){}}
function bindModal(){}

/* ---------- покупки: стартовый набор (магазин + один раз в окне главы «Своё дело») ---------- */
function starterOk(){try{return typeof PAY!=='undefined'&&PAY.on&&!!PAY.item('starter')&&!PAY.own('starter')&&(typeof starterOn!=='function'||starterOn());}catch(e){return false;}}   // M28: только первые 10 дней
function starterBody(){const pr=PAY.item('starter');return `<div class="mt-row"><span class="mt-f1">🎁 <b>${T('Стартовый набор председателя','Chairman’s starter pack')}</b><br><span class="mt-mut">${T('150 💎 и эмблема «Золотой молот» 🔨 перед названием. Один раз, только для удобства и красоты.','150 💎 and the “Golden hammer” 🔨 emblem before your name. One time, just for convenience and looks.')}</span></span><button class="mt-btn ac noenter" data-mt-buy="starter">${PAY.price(pr)}</button></div>`;}
// для окна главы «Своё дело» (biz-ui): html предложения или '' (показывается один раз: S.ask.starter)
function starterHtml(){if(!starterOk()||S.ask&&S.ask.starter)return '';if(!S.ask)S.ask={};S.ask.starter=Date.now();try{save();}catch(e){}css();return `<div class="mt-card">${starterBody()}</div>`;}
// строка для окна IPO: доли основателя сейчас и следующая планка
function ipoHtml(){if(!window.GAME||!GAME.W)return '';const W=GAME.W,nx=E.ipoEq({rep:Math.min(5,(W.rep||0)+1)});
  return `<p>⭐ ${T('Доля основателя, если выйти сейчас','Founder shares if you go public now')}: <b>${GAME.ipoShares()}</b>. ${T('После IPO — выбор одного улучшения навсегда. Планка следующего IPO','After the IPO — pick one permanent upgrade. The next IPO bar')}: <b>${FMT.money(nx)}</b>.</p>`;}

/* ---------- действия ---------- */
function act(a,inModal,btn){const re=()=>{if(inModal&&modalOn&&modalRe===openPlan)openPlan();refresh();};
  if(a==='gift'){const p=GAME.plan();const n=GAME.planGift();snd('coin');
    if(n){toast('🎁 +'+cr(n));flyCr(btn,n);}else{const c=GAME.COS.find(x=>x.id===p.gi);toast('🎁 '+(c?cosName(c):T('Подарок получен','Gift received')));applyCos();}re();}
  else if(a==='x2'){if(!ad()||!GAME.planX2Ok())return;STAT.place('planx2');showRewarded(()=>{const n=GAME.planX2();if(n){snd('coin');toast('📺 +'+cr(n));flyCr(btn,n);}re();},()=>{});}
  else if(a==='giftx2'){if(!ad()||GAME.plan().got)return;STAT.place('planx2');showRewarded(()=>{const p=GAME.plan();if(p.got)return re();const n=GAME.planGift(),m=GAME.planX2()||0;snd('coin');
      const c=!n&&GAME.COS.find(x=>x.id===GAME.plan().gi);toast('🎁 '+(c?cosName(c)+' + ':'+')+cr(n+m));flyCr(btn,n+m);if(c)applyCos();re();},()=>{});}
  else if(a==='passgx2'){if(!ad()||!passQ().av)return;STAT.place('passx2');showRewarded(()=>{const n=passClaim(),m=n?passX2():0;if(n){snd('coin');toast('📦 +'+cr(n+m));flyCr(btn,n+m);}refresh();},()=>{});}
  else if(a==='pass'){const n=passClaim();if(n){snd('coin');toast('📦 +'+cr(n));flyCr(btn,n);}refresh();}
  else if(a==='passx2'){if(!ad()||!passQ().x2)return;STAT.place('passx2');showRewarded(()=>{const n=passX2();if(n){snd('coin');toast('📺 +'+cr(n));flyCr(btn,n);}refresh();},()=>{});}
  else if(a==='all'){const r=claimAll();snd('coin');if(r.n){toast('✅ +'+cr(r.n)+(r.dec?' + '+r.dec:''));flyCr(btn,r.n);if(r.n>5)salute(true);}else if(r.dec)toast('🎁 '+r.dec);re();}   // M34
  else if(a==='plan')openPlan();
  else if(a==='lad'){if(inModal)hideModal();GAME.ladWatch();}
  else if(a==='miles')openMiles();
  else if(a==='perks')openPerks();
  else if(a==='boost'){if(!ad()||!GAME.boostOk()||GAME.adWait('bst')>0)return;STAT.place('boost');showRewarded(()=>{const r=GAME.adAct('bst','boost');
      if(r==='ok'){snd('coin');toast(T('Цены продаж +10 % на 3 месяца','Sale prices +10% for 3 months'));}else if(r==='wait')toast('📺 '+GAME.adTxt('bst'));refresh();},()=>{});}
  else if(a==='shopGo'){ask().shopC=1;try{save();STAT.ev('offer',{k:'shop_open',w:'today',a:'tap'});}catch(e){}refresh();openShop('pack',{from:'start',hl:'starter'});}
  else if(a==='shopNo'){ask().shopC=1;try{save();STAT.ev('offer',{k:'shop_open',w:'today',a:'close'});}catch(e){}refresh();}
  else if(a==='hintGo'){const h=hintNow;hintDone();hintNow=null;try{STAT.ev('offer',{k:'hint_'+(h&&h.k),w:'today',a:'tap'});}catch(e){}refresh();if(h)openShop('pack',{from:'hint',hl:h.go});}
  else if(a==='hintNo'){const h=hintNow;hintDone();hintNow=null;try{STAT.ev('offer',{k:'hint_'+(h&&h.k),w:'today',a:'close'});}catch(e){}refresh();}
  else if(a.indexOf('praise:')===0){ask().praised[a.slice(7)]=1;try{save();}catch(e){}refresh();}
  else if(a==='starterNo'){if(!S.ask)S.ask={};S.ask.starterC=1;try{save();}catch(e){}refresh();}
  else if(a.indexOf('claim:')===0){const n=GAME.planClaim(+a.slice(6));if(n){snd('coin');toast('✅ +'+cr(n));flyCr(btn,n);if(n>2)salute(true);}re();}
  else if(a.indexOf('rr:')===0){if(GAME.planReroll(+a.slice(3))){snd('tap');toast('🎩 '+T('Поручение заменено — это бонус набора «Солидный»','Task swapped — a “Respectable” set bonus'));}re();}
  else if(a.indexOf('qg:')===0){if(GAME.qgPick(+a.slice(3))==='ok'){snd('tap');toast(T('Цель квартала принята','Quarter goal accepted'));}refresh();}}
// клики по карточкам (делегирование: карточки живут внутри чужих экранов) и по кнопке покупки стартового набора в любом окне
document.addEventListener('click',e=>{const t=e.target&&e.target.closest?e.target.closest('[data-mt],[data-mt-buy]'):null;if(!t)return;
  const mc=$m('mcard');if(t.dataset.mtBuy){e.preventDefault();try{(SND.tap||SND.click)();}catch(x){}if(typeof PAY!=='undefined')PAY.buy(t.dataset.mtBuy);return;}
  if(mc&&mc.contains(t)&&t.onclick)return; // в окнах — свои обработчики
  if(t.closest('.mt-wrap')){e.preventDefault();act(t.dataset.mt,false,t);}},false);

/* ---------- события игры ---------- */
function hook(){if(!window.GAME||!GAME.on){setTimeout(hook,200);return;}
  addCos();wrapSponsor();praiseInit();
  GAME.on('mile',m=>{snd('win');salute(true);const c=m.cos&&GAME.COS.find(x=>x.id===m.cos);toast('🎯 '+T('Веха','Milestone')+': '+mileTxt(m)+' · +'+cr(m.cr)+(c?' + '+cosName(c):''),3500);applyCos();});
  GAME.on('qgoal',g=>{const x=g.o[g.p];if(g.st==='ok'){salute(true);}if(g.st==='ok')toast('🏛 '+T('Цель квартала выполнена','Quarter goal achieved')+' · +'+cr(x.cr),3500);});
  GAME.on('cos',applyCos);GAME.on('reset',applyCos);GAME.on('lad',()=>setTimeout(refresh,50));
  // запасной путь (сцен сюжета нет или их закрыли свайпом): «Доля основателя», когда окон нет; пока ждёт сцена IPO — до 15 с даём ей открыться первой
  GAME.on('ipo',()=>{let n=0;ipoQ.perks=0;ipoQ.wait=1;const tr=()=>{if(ipoQ.perks||!Array.isArray(S.pkP)||!S.pkP.length)return;
    if(!modalOn&&!document.hidden&&!(ipoScenePending()&&n<10)){ipoQ.perks=1;openPerks();return;}if(++n<200)setTimeout(tr,1500);};setTimeout(tr,1500);});
  GAME.on('day',borisLater);
  applyCos();}
/* ---------- очередь окон после IPO: три кадра сюжета → «Доля основателя» (выбор) → ответ Бориса «Новый холдинг, старые друзья» — в следующий спокойный момент ----------
   Ответ Бориса открывает js/story-ui.js сразу после «Спасибо всем!» (answer → open). Сюжет не трогаем: ловим этот клик, забираем готовое окно ответа
   и показываем вместо него выбор улучшения; само окно ответа — позже, на ближайшем игровом дне без окон, паузы и рекламы. */
const ipoQ={wait:0,arm:0,perks:0,boris:'',borisT:0};
function ipoScenePending(){try{const F=GAME.W&&GAME.W.fr;return !!(F&&Array.isArray(F.q)&&F.q.some(x=>x.k==='ipo'));}catch(e){return false;}}
document.addEventListener('click',e=>{if(!ipoQ.wait)return;const t=e.target&&e.target.closest?e.target.closest('[data-ok]'):null,mc=$m('mcard');
  if(t&&mc&&mc.contains(t)&&mc.querySelector('.st-photo'))ipoQ.arm=1;},true);
document.addEventListener('click',()=>{if(!ipoQ.arm)return;ipoQ.arm=0;const mc=$m('mcard');
  if(!modalOn||!mc||mc.querySelector('.st-photo'))return; // ответ не принят — окно сцены осталось
  ipoQ.wait=0;
  // M30: одно окно после IPO — ответ Бориса всегда позже (не стопкой), «Доля основателя» отдельно — только если не выбрали в окне сцены
  if(ipoQ.perks||!Array.isArray(S.pkP)||!S.pkP.length){ipoQ.boris=mc.innerHTML;ipoQ.borisT=Date.now()+120000;hideModal();return;}
  // не стопкой: окно ответа Бориса прячем, после короткой паузы (0,8 с) — «Доля основателя»; сам ответ Бориса — не раньше чем через 2 минуты
  ipoQ.boris=mc.innerHTML;ipoQ.perks=1;ipoQ.borisT=Date.now()+120000;hideModal();
  const go=()=>{if(modalOn){setTimeout(go,600);return;}openPerks();};setTimeout(go,800);},false);
function calmNow(){if(modalOn||(typeof paused!=='undefined'&&paused)||document.hidden)return false;try{if(GAME.hold&&GAME.hold.size)return false;}catch(e){}
  const a=$m('ad');return !(a&&a.classList.contains('on'));}
function borisLater(){if(!ipoQ.boris||Date.now()<ipoQ.borisT||!calmNow())return;const h=ipoQ.boris;ipoQ.boris='';modal(h);
  const c=$m('mcard');c&&c.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{snd('tap');close();});}
hook();
window.addEventListener('load',applyCos);
window.META={card,refresh,openPlan,openMiles,openCos,openPerks,perkBtns,pkName:k=>pkName(k),openPrestige,starterHtml,ipoHtml,applyCos,passQ,passClaim,passX2};
})();
