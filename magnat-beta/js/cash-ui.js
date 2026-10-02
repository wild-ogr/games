/* ================= «Из ларька в магнаты: бизнес» — 📅 Календарь денег (M30): вид =================
   window.CASHUI. Модель — ECON.cashPlan (js/cash.js). Свой CSS — внутри файла. Кнопки — атрибут data-cash (общий обработчик на document).
   Где показывается (хуки — одна строка в чужих файлах):
     • «Сегодня» (biz-ui todayHtml) и карта в «Недрах» (ui.js rMap) — todayLine(W): «💰 К 30-му ≈ X · ближайшее: …», предупреждение «⚠ Через N дней не хватит X: причина» и 1–3 кнопки-решения;
     • «Этот месяц» (biz-ui monthCard; в «Недрах» — mapCard) — monthTail(W): пришло с начала месяца / ещё придёт / ещё спишется до 30-го (по статьям) / к 30-му ≈;
     • «Финансы → 📅 Деньги на 30 дней» (fin.js view 'cash') — finHtml(W): график по дням (приход зелёным, расход красным, остаток линией), лента по дням с раскрытием «откуда»;
     • карточка склада и «Покупатели должны» (biz-ui) — recLine(W): «у покупателей N: придут 14-го X, 28-го Y»;
     • календарь телефона (phone-ui cal) — calDates(W): крупные поступления и платежи, день разрыва;
     • окно закрытия месяца (ui.js openClose) — closeOd(rep): честно про овердрафт (долг, ставка, когда вернуть);
     • тексты советов Людмилы: z_cash, z_factor, z_od — advTxt/odWhy (называет настоящую причину). */
(function(){
'use strict';
const E=window.ECON;if(!E||!E.cashPlan)return;
E.cpAdvOn=true;   // советы z_cash / z_factor — только в игре (в симуляторе выключены)
const W=()=>window.GAME&&GAME.W;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const en=()=>typeof LANG!=='undefined'&&LANG==='en';
const T=(ru,e)=>typeof L==='function'?L(ru,e):ru;
const M=a=>{try{return FMT.money(a);}catch(e){return Math.round(a)+' ₽';}};
const S1=a=>(a>0?'+':a<0?'':'')+M(a);
const rk=a=>Math.abs(a)>=1e4?Math.round(a/1e3)*1e3:Math.round(a/10)*10;
const nb=s=>String(s).replace(/(\d) (\d)/g,'$1 $2');
// виды строк: значок, подпись (в ленте и в «Этот месяц»)
const K={rec:['🧾','От покупателей','From buyers'],sale:['🏪','Выручка точек','Outlet takings'],job:['🏭','Зарплата','Wages'],gig:['📋','Заказы','Gigs'],supp:['📦','Товар точек','Outlet stock'],
  whs:['🏬','Закупка склада','Warehouse buying'],rent:['🏢','Аренда и зарплаты точек','Outlet rent & wages'],mgr:['👔','Управляющим','Managers’ share'],opd:['💼','Опердиректорам','Operations directors'],
  life:['🏠','Жизнь','Living costs'],ipf:['📄','Взносы ИП','Sole-trader contributions'],acc:['📒','Бухгалтер','Accountant'],tax:['🏛','Налог','Tax'],int:['🏦','Проценты банку','Bank interest'],
  loan:['🏦','Платёж по кредиту','Loan repayment'],od:['⚠','Овердрафт','Overdraft'],build:['🏗','Стройка','Construction'],fix:['🏭','Постоянные расходы объектов','Sites’ fixed costs'],
  adm:['🏢','Офис','Head office'],log:['🚂','Перевозки и доставка','Freight & delivery'],con:['🤝','Контракты','Contracts'],mkt:['📈','Продажи на рынке','Market sales'],prod:['⛏','Добыча и передел','Production'],
  fr:['👥','Друзья и совместные дела','Friends & joint ventures'],re:['🏡','Недвижимость и ипотека','Property & mortgage'],own:['🎓','Дела хозяина','Owner’s affairs'],act:['✋','Ваши действия','Your actions'],oth:['📝','Прочее','Other']};
const kN=k=>{const x=K[k]||K.oth;return T(x[1],x[2]);},kI=k=>(K[k]||K.oth)[0];
const lc=t=>{t=String(t);return /^[A-ZА-ЯЁ]{2}/.test(t)?t:t.charAt(0).toLowerCase()+t.slice(1);};   // «Взносы ИП» → «взносы ИП»
// «каждодневные» виды — в ленте сворачиваются в строку «за день»
const DK={sale:1,supp:1,whs:1,prod:1,mkt:1,gig:1,build:1,log:1,con:1,own:1};
const MG=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],ME=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// день от сегодня → число месяца (закрытие — 30-е) и месяц
function dOf(w,d){const x=w.d+d-1,dm=x%30+1,m=w.m+Math.floor(x/30);return {dm,m};}
function dLab(w,d,full){if(d<=0)return T('сегодня','today');const o=dOf(w,d);if(!full&&o.m===w.m)return T(o.dm+'-го',(o.dm===1?'1st':o.dm===2?'2nd':o.dm===3?'3rd':o.dm+'th'));return en()?ME[o.m%12]+' '+o.dm:o.dm+' '+MG[o.m%12];}
function inN(d){return d<=0?T('сегодня','today'):d===1?T('завтра','tomorrow'):T('через '+d+' '+(typeof pl==='function'?pl(d,'день','дня','дней','day','days').replace(/^\d+\s*/,''):'дн.'),'in '+d+' '+(d===1?'day':'days'));}
function plan(w,n){try{return E.cashPlan(w||W(),n||35);}catch(e){console.error(e);return null;}}   // «Сегодня», карта, советы — 35 дней; лента и календарь — 60
// сумма строк по видам за дни (d1..d2]
function sumBy(p,d1,d2,f){const o={};for(const x of p.items)if(x.d>d1&&x.d<=d2&&(!f||f(x))){o[x.k]=(o[x.k]||0)+x.a;}return o;}
const eomD=p=>p.eom?p.eom.d:Math.min(p.days,30);

/* ---------------- причина разрыва — словами Людмилы ---------------- */
function why(w,p,g){const a=g.amt||{};switch(g.why){
  case 'whs':{const wg=E.cpWhs?E.cpWhs(w):null,rc=p.rec.filter(x=>x.d>0&&x.a>=1).slice(0,2),ra=a.rec>=1?a.rec:0;
    const r1=rc.length?T(' Придут: '+rc.map(x=>M(x.a)+' '+dLab(w,x.d)).join(', ')+'.',' Due: '+rc.map(x=>M(x.a)+' on '+dLab(w,x.d)).join(', ')+'.'):'';
    const pad=!!E.whsPad,B=E.BIZ&&E.BIZ.whs,fx=B?B.rent+B.staff:0;   // с fx3 склад не трогает подушку — тогда причина: полка пустая, продаж мало, а аренда и зарплаты склада — полностью
    const shelf=wg&&wg.need>0?(pad?T(`на полке не хватает товара на ${M(wg.need)} — склад продаёт вполсилы, а аренда и зарплаты склада (${M(fx)} в месяц) списываются целиком`,`the shelf is ${M(wg.need)} short — the warehouse sells at half strength while its rent and wages (${M(fx)} a month) are charged in full`)
      :T(`до нормы на полке не хватает товара на ${M(wg.need)} — пока полка не полная, склад докупает на всё, что приходит`,`the shelf is ${M(wg.need)} short of its norm — until it fills up, the warehouse spends everything that comes in`)):'';
    return T(`Деньги ушли в склад: ${shelf}${shelf&&ra?'; ':''}${ra?'у покупателей ещё '+M(ra):''}.${r1}`,`The money is tied up in the warehouse: ${shelf}${shelf&&ra?'; ':''}${ra?'buyers still owe '+M(ra):''}.${r1}`);}
  case 'buy':return T(`В этом месяце вложено ${M(a.buy)} в новое дело, а 30-го спишутся аренда, зарплаты и жизнь — на них не осталось.`,`${M(a.buy)} went into a new business this month, and rent, wages and living costs are due on the 30th — nothing is left for them.`);
  case 'build':return T(`Стройка забирает деньги каждый день (${M(a.build)} до этого дня), а на обязательные платежи месяца должно оставаться.`,`Construction takes money every day (${M(a.build)} by then), and the month’s required payments still need cover.`);
  case 'loan':return T(`Платежи банку — ${M(a.loan)}: больше, чем успеет прийти.`,`Bank payments of ${M(a.loan)} — more than will come in by then.`);
  case 'tax':return T(`Налог ${M(a.tax)} спишется 30-го, а денег к этому дню не хватит.`,`Tax of ${M(a.tax)} is due on the 30th, and cash won’t cover it.`);
  default:{let s=T(`Расходы месяца (аренда, зарплаты, жизнь — ${M(a.rent||0)}) больше, чем успеет прийти.`,`The month’s costs (rent, wages, living — ${M(a.rent||0)}) exceed what comes in by then.`);
    if(w.me&&!w.ned&&E.stI&&E.stI(w)<=1&&g.a>0){const n=Math.ceil(g.a/3400);s+=T(` Это примерно ${n} ${typeof pl==='function'?pl(n,'смена','смены','смен','shift','shifts').replace(/^\d+\s*/,''):'смен'} курьером.`,` That’s about ${n} courier shifts.`);}return s;}}}
function head(w,g){if(g.k==='halt')return g.now?T(`⚠ Стройка стоит: «${g.ru}» — не хватает ${M(g.a)}`,`⚠ Construction stopped: “${g.en}” — ${M(g.a)} short`):T(`⚠ ${inN(g.d).replace(/^./,c=>c.toUpperCase())} встанет стройка «${g.ru}»: не хватит ${M(g.a)}`,`⚠ ${inN(g.d).replace(/^./,c=>c.toUpperCase())} construction of “${g.en}” stops: ${M(g.a)} short`);
  if(g.k==='zero')return T(`⚠ Склад забирает все деньги на закупку — точкам не на что докупать товар`,`⚠ The warehouse takes all the cash for stock — outlets can’t restock`);
  if(g.now){const e=g.eomShort||0;return e>0?T(`⚠ Сейчас долг банку (овердрафт) ${M(g.odNow||0)}; к 30-му минус ≈ ${M(e)}`,`⚠ You owe the bank ${M(g.odNow||0)} now (overdraft); by the 30th the minus is ≈ ${M(e)}`)
    :T(`⚠ Сейчас долг банку (овердрафт) ${M(g.odNow||0)} — к 30-му его можно закрыть`,`⚠ You owe the bank ${M(g.odNow||0)} now (overdraft) — it can be cleared by the 30th`);}
  const pk=g.peak&&g.peak.a>g.a*1.3?T(` (дальше — до ${M(g.peak.a)} к ${dLab(w,g.peak.d,true)})`,` (then up to ${M(g.peak.a)} by ${dLab(w,g.peak.d,true)})`):'';
  return T(`⚠ ${inN(g.d).replace(/^./,c=>c.toUpperCase())} не хватит ${M(g.a)}${pk} — банк закроет минус овердрафтом под ${Math.round(((w.key||.16)+.08)*100)} %`,`⚠ ${inN(g.d).replace(/^./,c=>c.toUpperCase())} you’ll be ${M(g.a)} short${pk} — the bank will cover it with an overdraft at ${Math.round(((w.key||.16)+.08)*100)}%`);}
function fixBtn(w,p,g,f,i,gi){const lbl=T(f.ru,f.en).replace('{m}',M(f.a));let sub='';const af=f.after;
  if(f.k==='loan')sub=T(`${Math.round((f.rate||0)*100)} % на ${f.n} мес.${f.gr?', первые '+f.gr+' мес. — только проценты':''}`,`${Math.round((f.rate||0)*100)}% for ${f.n} months${f.gr?', interest only for the first '+f.gr:''}`);
  if(f.k==='factor')sub=T(`банк возьмёт 3 % — ${M(f.fee)}`,`the bank keeps 3% — ${M(f.fee)}`);
  if(f.k==='whs')sub=T('продаж станет меньше, но деньги — сразу','fewer sales, but cash comes at once');
  let res='';if(af){const e=af.eom!=null?af.eom:af.end;res=f.ok?T(`→ без минуса, к 30-му ≈ ${M(af.eom!=null?af.eom:af.min)}`,`→ no shortfall, ≈ ${M(af.eom!=null?af.eom:af.min)} by the 30th`)
    :af.end!=null&&p.end&&af.end>p.end.own?T(`→ через 2 месяца ≈ ${M(af.end)} (без этого ${M(p.end.own)})`,`→ in 2 months ≈ ${M(af.end)} (otherwise ${M(p.end.own)})`):T(`→ не хватит меньше: ${M(Math.max(0,-af.min))}`,`→ a smaller gap: ${M(Math.max(0,-af.min))}`);}
  return `<button class="btn ${f.ok?'green':''} cp-fix noenter" data-cash="fix" data-g="${gi}" data-i="${i}" data-n="${p.days}"><b>${esc(nb(lbl))}</b><small>${esc(nb(sub))}${res?'<br>'+esc(nb(res)):''}</small></button>`;}
function warnHtml(w,p,full){const g=p.gaps[0];if(!g||g.d>45)return '';let h=`<div class="cp-warn"><b>${esc(nb(head(w,g)))}</b>`;
  if(g.k!=='halt')h+=`<p>${esc(nb(why(w,p,g)))}</p>`;else h+=`<p>${esc(nb(T('По правилу банка стройка идёт, только пока на счёте остаётся запас на обязательные платежи месяца. ','By the bank’s rule construction goes on only while the account keeps a reserve for the month’s required payments. ')+(p.gaps.find(x=>x.k==='od')?'':T('Без денег стройка встанет и будет ждать.','Without cash it will stop and wait.'))))}</p>`;
  const g2=p.gaps[1];if(g2&&g2.k==='od'&&g2.why!==g.why&&g2.d<=60)h+=`<p><b>${esc(T('Дальше: ','Next: ')+inN(g2.d))}</b> — ${esc(nb(lc(why(w,p,g2))))}</p>`;
  const fx=g.fix||[];if(fx.length)h+=`<div class="cp-fixes">${fx.map((f,i)=>fixBtn(w,p,g,f,i,0)).join('')}</div>`;
  else if(g.why==='whs'||g.k==='zero')h+=`<p class="cp-mut">${esc(T('Кредит здесь не спасёт: склад докупит товар и на эти деньги.','A loan won’t help here: the warehouse would spend it on stock too.'))}</p>`;
  return h+'</div>';}

/* ---------------- «Сегодня» / карта: одна строка + предупреждение ---------------- */
const LUMP=k=>!DK[k];
function nearest(w,p){// ближайшее крупное: не каждодневное, заметное на фоне оборота месяца
  let turn=0;for(const x of p.items)if(x.d<=eomD(p))turn+=Math.abs(x.a);const thr=Math.max(1000,turn*.03);const by={};
  for(const x of p.items){if(!LUMP(x.k)||x.k==='od')continue;const kk=x.d+'|'+x.k;by[kk]=(by[kk]||0)+x.a;}
  const ks=Object.keys(by).map(s=>{const [d,k]=s.split('|');return {d:+d,k,a:by[s]};}).filter(x=>Math.abs(x.a)>=thr).sort((a,b)=>a.d-b.d||Math.abs(b.a)-Math.abs(a.a));return ks[0]||null;}
function nearTxt(w,n){if(!n)return '';const s=S1(n.a);const nm=n.k==='rec'?T('от покупателей','from buyers'):n.k==='job'?T('зарплата','wages'):lc(kN(n.k));return T(`${s} ${nm} ${dLab(w,n.d)}`,`${s} ${nm} on the ${dLab(w,n.d)}`);}
function todayLine(w){w=w||W();if(!w)return '';const p=plan(w);if(!p||!p.eom)return '';const e=p.eom,n=nearest(w,p);
  const neg=e.own<0;const val=neg?T(`≈ ${M(e.own)}`,`≈ ${M(e.own)}`):`≈ ${M(e.own)}`;
  let h=`<div class="card cp-today" id="cpToday"><button class="cp-line noenter" data-cash="open"><span class="cp-ic">💰</span><span class="f1"><b>${esc(T('К 30-му','By the 30th'))} <span class="${neg?'cp-neg':'cp-pos'}">${esc(nb(val))}</span></b>${n?`<small>${esc(T('ближайшее: ','next: ')+nb(nearTxt(w,n)))}</small>`:''}</span><span class="chev">›</span></button>`;
  h+=warnHtml(w,p);
  return h+'</div>';}

/* ---------------- «Этот месяц»: пришло / ещё придёт / ещё спишется ---------------- */
function monthRows(w,p){const cf=w.mon&&w.mon.cf||{};let inn=0,out=0;for(const k in cf){if(cf[k]>0)inn+=cf[k];else out+=cf[k];}
  const D=eomD(p),by=sumBy(p,0,D);let fin=0,fout=0;const plus=[],minus=[];for(const k in by){if(k==='od')continue;if(by[k]>0){fin+=by[k];plus.push([k,by[k]]);}else if(by[k]<0){fout+=by[k];minus.push([k,by[k]]);}}
  plus.sort((a,b)=>b[1]-a[1]);minus.sort((a,b)=>a[1]-b[1]);
  const li=a=>a.slice(0,3).map(x=>lc(kN(x[0]))+' '+(x[0]==='tax'?'≈ ':'')+M(x[1])).join(', ')+(a.length>3?T(' и др.',' etc.'):'');
  const row=(ic,t,s,v,cls)=>`<div class="mr"><span class="bz-ic">${ic}</span><span class="f1"><b>${esc(t)}</b>${s?`<small>${esc(nb(s))}</small>`:''}</span><span class="v ${cls||''}">${esc(nb(v))}</span></div>`;
  let h=row('💰',T('Пришло с начала месяца','In since the 1st'),T('ушло ','out ')+M(out),S1(inn),'good');
  if(fin)h+=row('📅',T('Ещё придёт до 30-го','Still to come by the 30th'),li(plus),S1(fin),'good');
  if(fout)h+=row('🧾',T('Ещё спишется до 30-го','Still to go out by the 30th'),li(minus),M(fout),'bad');
  return h;}
function monthTail(w){w=w||W();if(!w)return '';const p=plan(w);if(!p||!p.eom)return '';const e=p.eom;
  return `<div class="cp-mt">${monthRows(w,p)}<button class="mt cp-tot noenter" data-cash="open"><span>${esc(T('К 30-му останется ≈','Left by the 30th ≈'))}</span><b class="${e.own>=0?'good':'bad'}">${esc(nb(M(e.own)))}</b></button>${e.own<0?`<p class="cp-mut">${esc(T('Минус банк закроет овердрафтом — это долг под высокий процент.','The bank will cover the minus with an overdraft — an expensive debt.'))}</p>`:''}</div>`;}
// «Недра»: на карте — строка + «Этот месяц» одной карточкой
function mapCard(w){w=w||W();if(!w)return '';const p=plan(w);if(!p||!p.eom)return '';
  return todayLine(w)+`<div class="card bz-month cp-mc"><div class="mh"><span class="bz-lab">💰 ${esc(T('Этот месяц','This month'))} · ${esc(T('день ','day '))}${w.d+1}${esc(T(' из ',' of '))}30</span></div><div class="mrs">${monthTail(w)}</div></div>`;}

/* ---------------- Финансы → 📅 Деньги на 30 дней ---------------- */
let H=30;   // горизонт ленты: 30 или 60 дней
function chartSvg(w,p,n){const d=p.byDay.slice(0,n);if(!d.length)return '';const Wd=340,Hh=170,pad=8,bw=(Wd-2*pad)/d.length;
  let mxF=1,mn=Math.min(0,p.own0),mx=Math.max(0,p.own0);for(const x of d){mxF=Math.max(mxF,x.inn,-x.out);mn=Math.min(mn,x.own);mx=Math.max(mx,x.own);}
  const top=pad,bot=Hh-pad,mid=(top+bot)/2;   // столбики — от средней линии; линия остатка — своя шкала
  const fy=v=>mid-(v/mxF)*(mid-top-4),ly=v=>bot-((v-mn)/Math.max(1,mx-mn))*(bot-top);
  let s=`<svg class="cp-ch" viewBox="0 0 ${Wd} ${Hh}" role="img" aria-label="${esc(T('Приход, расход и остаток по дням','In, out and balance by day'))}">`;
  if(mn<0)s+=`<rect x="0" y="${ly(0).toFixed(1)}" width="${Wd}" height="${(bot-ly(0)).toFixed(1)}" class="cp-negz"/>`;
  s+=`<line x1="0" x2="${Wd}" y1="${mid}" y2="${mid}" class="cp-ax"/>`;
  d.forEach((x,i)=>{const X=pad+i*bw+bw*.15,bw2=Math.max(1,bw*.7);if(x.inn>0)s+=`<rect x="${X.toFixed(1)}" y="${fy(x.inn).toFixed(1)}" width="${bw2.toFixed(1)}" height="${(mid-fy(x.inn)).toFixed(1)}" class="cp-in" rx="1.5"/>`;
    if(x.out<0)s+=`<rect x="${X.toFixed(1)}" y="${mid}" width="${bw2.toFixed(1)}" height="${(fy(x.out)-mid).toFixed(1)}" class="cp-out" rx="1.5"/>`;
    if(x.cl)s+=`<line x1="${(X+bw2/2).toFixed(1)}" x2="${(X+bw2/2).toFixed(1)}" y1="${top}" y2="${bot}" class="cp-cl"/>`;});
  const pts=[[pad,ly(p.own0)]].concat(d.map((x,i)=>[pad+(i+1)*bw,ly(x.own)]));s+=`<polyline points="${pts.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ')}" class="cp-bal"/>`;
  if(mn<0)s+=`<line x1="0" x2="${Wd}" y1="${ly(0).toFixed(1)}" y2="${ly(0).toFixed(1)}" class="cp-zero"/>`;
  return s+'</svg>';}
// одна строка ленты (вид за день или за отрезок) с раскрытием «откуда»
let RID=0;
function rowHtml(k,a,list,lbl){const id='cpr'+(++RID);const det=list.slice().sort((x,y)=>Math.abs(y.a)-Math.abs(x.a));
  const dh=det.length>1||det.length===1&&det[0].t!==lbl?`<div class="cp-det" id="${id}" hidden>`+det.slice(0,12).map(x=>`<div><span>${esc(x.t)}</span><b class="${x.a>=0?'cp-pos':'cp-neg'}">${esc(nb(S1(x.a)))}</b></div>`).join('')+(det.length>12?`<div class="cp-mut">${esc(T('и ещё ','and ')+(det.length-12))}</div>`:'')+'</div>':'';
  return `<button class="cp-r noenter" ${dh?`data-cash="tg" data-id="${id}"`:'data-cash="nop"'}><span class="cp-ic">${kI(k)}</span><span class="f1">${esc(lbl)}${dh?' <i class="cp-more">▸</i>':''}</span><b class="${a>=0?'cp-pos':'cp-neg'}">${esc(nb(S1(a)))}</b></button>${dh}`;}
function srcList(its,byK){const o={};for(const x of its){const kk=byK?x.k:x.src+'|'+x.k;const y=o[kk]||(o[kk]={t:byK?kN(x.k):T(x.ru,x.en),a:0});y.a+=x.a;}return Object.keys(o).map(k=>o[k]).filter(x=>x.a);}
// «всплеск» каждодневного вида (первая закупка склада, крупная стройка) — тоже отдельной строкой: сумма за день > 4 × обычного дня этого вида
function spikes(p,n){const dk={};for(const x of p.items)if(x.d<=n&&DK[x.k]){const o=dk[x.k]||(dk[x.k]={});o[x.d]=(o[x.d]||0)+x.a;}const sp={};
  for(const k in dk){const v=Object.keys(dk[k]).map(d=>Math.abs(dk[k][d])).sort((a,b)=>a-b);const med=v[v.length>>1]||0;for(const d in dk[k])if(v.length>=3&&Math.abs(dk[k][d])>Math.max(4*med,1000))sp[d+'|'+k]=1;}return sp;}
function dayBlocks(w,p,n){const by={};for(const x of p.items)if(x.d<=n)(by[x.d]||(by[x.d]=[])).push(x);const out=[];let run=null;const sp=spikes(p,n);
  for(let d=1;d<=n;d++){const its=by[d]||[],lumps=its.filter(x=>LUMP(x.k)||sp[d+'|'+x.k]),bd=p.byDay[d-1];
    if(!lumps.length){if(!run){run={d1:d,d2:d,its:[],own:bd?bd.own:0};out.push(run);}run.d2=d;run.its=run.its.concat(its);run.own=bd?bd.own:run.own;continue;}
    run=null;out.push({d1:d,d2:d,its,lumps,own:bd?bd.own:0,cl:bd&&bd.cl});}
  return out;}
function ribbon(w,p,n){let h='';RID=0;
  for(const b of dayBlocks(w,p,n)){const lk={};for(const x of b.lumps||[])lk[x.k]=1;const daily=b.its.filter(x=>DK[x.k]&&!lk[x.k]);let dn=0;for(const x of daily)dn+=x.a;
    const ttl=b.d1===b.d2?dLab(w,b.d1,true)+(b.cl?T(' · закрытие месяца',' · month close'):''):T(`${dLab(w,b.d1,true)} — ${dLab(w,b.d2,true)}`,`${dLab(w,b.d1,true)} – ${dLab(w,b.d2,true)}`);
    h+=`<div class="cp-day${b.own<0?' neg':''}"><div class="cp-dh"><b>${esc(ttl)}</b><span>${esc(T('остаток ','balance '))}<b class="${b.own>=0?'':'cp-neg'}">${esc(nb(M(b.own)))}</b></span></div>`;
    if(b.lumps){const g={};for(const x of b.lumps)(g[x.k]||(g[x.k]=[])).push(x);
      for(const k of Object.keys(g).sort((a,c)=>Math.abs(g[c].reduce((s,x)=>s+x.a,0))-Math.abs(g[a].reduce((s,x)=>s+x.a,0)))){const s=g[k].reduce((q,x)=>q+x.a,0);if(!s)continue;h+=rowHtml(k,s,srcList(g[k]),kN(k)+(k==='tax'?T(' (оценка по модели)',' (model estimate)'):''));}}
    if(daily.length&&dn){const days=b.d2-b.d1+1;const kk={};for(const x of daily)kk[x.k]=(kk[x.k]||0)+Math.abs(x.a);const ks=Object.keys(kk).sort((a,c)=>kk[c]-kk[a]).slice(0,3).map(k=>lc(kN(k))).join(', ');
      const lbl=b.lumps?T('За день: ','For the day: ')+ks:T(`Каждый день ≈ ${S1(rk(dn/days))}: `,`Every day ≈ ${S1(rk(dn/days))}: `)+ks;
      h+=rowHtml(dn>=0?'sale':'supp',dn,srcList(daily,true),lbl);}
    h+='</div>';}
  return h;}
function finHtml(w){w=w||W();if(!w)return '';const p=plan(w,60);if(!p)return '';const n=Math.min(H,p.days);const e=p.eom,last=p.byDay[n-1];
  let h=`<div class="cp-fin" id="cpFin">`;
  h+=`<div class="card cp-sum"><div class="cp-k"><span>${esc(T('Сейчас на счёте','In the account now'))}</span><b>${esc(nb(M(w.cash)))}</b>${p.own0!==w.cash?`<small class="cp-neg">${esc(T('из них долг банку ','incl. owed to bank ')+nb(M(w.cash-p.own0)))}</small>`:''}</div>
    ${e?`<div class="cp-k"><span>${esc(T('К 30-му ≈','By the 30th ≈'))}</span><b class="${e.own>=0?'cp-pos':'cp-neg'}">${esc(nb(M(e.own)))}</b></div>`:''}
    <div class="cp-k"><span>${esc(T('Через '+n+' дн. ≈','In '+n+' days ≈'))}</span><b class="${last&&last.own>=0?'cp-pos':'cp-neg'}">${esc(nb(M(last?last.own:0)))}</b></div>
    <div class="cp-k"><span>${esc(T('Меньше всего','Lowest'))}</span><b class="${p.min.a>=0?'':'cp-neg'}">${esc(nb(M(p.min.a)))}</b><small>${esc(p.min.d?dLab(w,p.min.d,true):T('сейчас','now'))}</small></div></div>`;
  h+=warnHtml(w,p,true)?`<div class="card">${warnHtml(w,p,true)}</div>`:'';
  h+=`<div class="card"><div class="cp-tabs"><button class="f-tab${H===30?' on':''} noenter" data-cash="h" data-v="30">${esc(T('30 дней','30 days'))}</button><button class="f-tab${H===60?' on':''} noenter" data-cash="h" data-v="60">${esc(T('60 дней','60 days'))}</button></div>${chartSvg(w,p,n)}
    <div class="cp-leg"><span><i class="in"></i>${esc(T('приход','in'))}</span><span><i class="out"></i>${esc(T('расход','out'))}</span><span><i class="bal"></i>${esc(T('остаток (свои деньги)','balance (own money)'))}</span></div>
    <p class="cp-mut">${esc(T('Прогноз — если ничего не менять: новые точки, заказы и покупки не учтены. Налог — оценка по нынешней прибыли.','Forecast if nothing changes: new outlets, gigs and purchases aren’t included. Tax is estimated from the current profit.'))}</p></div>`;
  if(p.rec.length)h+=`<div class="card">${recLine(w,1)}</div>`;
  h+=`<div class="card cp-rib"><div class="bz-lab">${esc(T('По дням: что придёт и что уйдёт','Day by day: what comes in and goes out'))}</div>${ribbon(w,p,n)}</div>`;
  return h+'</div>';}

/* ---------------- склад: дебиторка по датам ---------------- */
function recLine(w,big){w=w||W();if(!w||!w.rec||!w.rec.length)return '';let s=0;for(const x of w.rec)s+=x.a;const p=plan(w);const rc=p?p.rec:[];
  const li=rc.slice(0,4).map(x=>`<li><span>${esc(dLab(w,x.d,true))}</span><b>+${esc(nb(M(x.a)))}</b></li>`).join('');
  return `<div class="cp-rec"><b>🧾 ${esc(T('У покупателей ','Buyers owe ')+nb(M(s)))}</b><small>${esc(T('придут по датам (минус 1–3 % безнадёжных):','due by date (minus 1–3% bad debts):'))}</small><ul>${li}</ul>${big?'':`<button class="btn sm noenter" data-cash="open">📅 ${esc(T('Деньги на 30 дней','Money for 30 days'))}</button>`}</div>`;}

/* ---------------- календарь телефона ---------------- */
function calDates(w){w=w||W();if(!w)return [];const p=plan(w,60);if(!p)return [];const o=[];let turn=0;for(const x of p.items)if(x.d<=30)turn+=Math.abs(x.a);const thr=Math.max(5000,turn*.04);
  const by={};for(const x of p.items){if(x.d>45||!LUMP(x.k)||x.k==='od')continue;const kk=x.d+'|'+(x.a>0?'+':'-');const y=by[kk]||(by[kk]={d:x.d,a:0,ks:{}});y.a+=x.a;y.ks[x.k]=(y.ks[x.k]||0)+x.a;}
  for(const kk in by){const y=by[kk];if(Math.abs(y.a)<thr)continue;const ks=Object.keys(y.ks).sort((a,b)=>Math.abs(y.ks[b])-Math.abs(y.ks[a])).slice(0,3).map(k=>lc(kN(k))).join(', ');
    o.push({d:y.d,ru:(y.a>0?'Придёт ':'Спишется ')+FMT.money(Math.abs(y.a))+': '+ks,en:(y.a>0?'In: ':'Out: ')+FMT.money(Math.abs(y.a))+' — '+ks,w:y.a>0?'lud':'elv',imp:y.a<0&&Math.abs(y.a)>Math.max(0,w.cash)*.5,key:'cp'+kk});}
  const g=p.gaps[0];if(g&&g.d>0&&g.d<=45)o.push({d:g.d,ru:'⚠ Не хватит денег: '+FMT.money(g.a),en:'⚠ Cash shortfall: '+FMT.money(g.a),w:'lud',imp:true,key:'cpgap'});
  return o.sort((a,b)=>a.d-b.d);}

/* ---------------- окно закрытия месяца: честно про овердрафт ---------------- */
function closeOd(rep){const w=W();if(!w)return '';const od=(w.loans||[]).filter(l=>l.k==='od');if(!od.length)return '';let a=0,r=0;for(const l of od){a+=l.a;r=Math.max(r,l.r);}
  const mo=(rep.m+1)%12,mn=en()?ME[mo]+' 30':'30 '+MG[mo];
  return `<div class="cp-od"><b>⚠ ${esc(T(`Деньги на конец ${M(rep.c1)} — это заём банка`,`Cash at month end ${M(rep.c1)} is a bank loan`))}</b><p>${esc(nb(T(`Овердрафт: долг ${M(a)} под ${Math.round(r*100)} % годовых. Вернуть — до ${mn} (спишется с процентами при закрытии месяца). Каждый месяц в овердрафте портит кредитную историю.`,`Overdraft: ${M(a)} owed at ${Math.round(r*100)}% a year. It’s due by ${mn} (taken with interest at the month close). Every month in overdraft hurts your credit history.`)))}</p><button class="btn sm noenter" data-cash="openc">📅 ${esc(T('Что будет с деньгами дальше','What happens to the money next'))}</button></div>`;}

/* ---------------- советы Людмилы ---------------- */
function advTxt(a){const w=W();if(!w)return '';const p=plan(w);const g=p&&p.gaps[0];if(!g)return '';return nb(head(w,g).replace(/^⚠\s*/,'')+'. '+(g.k==='halt'?'':why(w,p,g)));}
function factorTxt(a){const w=W();a=a||{};let s=0;for(const x of (w&&w.rec)||[])s+=x.a;return nb(T(`Покупатели должны ${M(s)}, а к ${a.d?dLab(w,a.d):'30-му'} денег не хватит. Факторинг: банк отдаст их сразу за 3 % (${M(Math.round(s*.03))}).`,`Buyers owe ${M(s)}, and cash runs short by ${a.d?'the '+dLab(w,a.d):'the 30th'}. Factoring: the bank pays it now for 3% (${M(Math.round(s*.03))}).`));}
function odWhy(w){w=w||W();if(!w)return '';const p=plan(w);const g=p&&p.gaps.find(x=>x.k==='od');if(!g)return '';return lc(nb(why(w,p,g)));}

/* ---------------- перед покупкой: «если открыть сейчас» (тот же прогон тени после настоящего действия) ---------------- */
const BW={};
function buyWarn(w,act,args){w=w||W();if(!w)return null;const k=w.t+'|'+w.cash+'|'+act+'|'+JSON.stringify(args);if(BW.k===k)return BW.v;let v=null;
  try{const q=E.cpWhatIf(w,act,args,act==='bizOpen'?60:35);if(q&&q.res==='ok'&&q.p){const p=q.p,neg=p.byDay.find(x=>x.own<0),hl=p.halt.find(h=>!h.now);const e=p.eom?p.eom.own:null;
    if(neg&&neg.d<=45){let pk=0,pd=neg.d;for(const x of p.byDay)if(x.d>=neg.d&&-x.own>pk){pk=-x.own;pd=x.d;}
      v={bad:true,need:Math.round(pk),html:`<div class="tip bad cp-bw">⚠ ${esc(nb(T(`Если открыть сейчас — ${inN(neg.d)} не хватит ${M(-neg.own)}${pk>-neg.own*1.3?' (дальше — до '+M(pk)+' к '+dLab(w,pd,true)+')':''}: банк закроет минус овердрафтом. Отложите покупку, пока не накопится ещё ≈ ${M(pk)}, или сначала возьмите кредит.`,
        `If you open now — ${inN(neg.d)} you’ll be ${M(-neg.own)} short${pk>-neg.own*1.3?' (then up to '+M(pk)+' by '+dLab(w,pd,true)+')':''}: the bank will cover it with an overdraft. Put the purchase off until you have ≈ ${M(pk)} more, or take a loan first.`)))}</div>`};}
    else if(hl&&hl.d<=60)v={bad:true,html:`<div class="tip bad cp-bw">⚠ ${esc(nb(T(`Если начать сейчас — ${inN(hl.d)} стройка встанет: денег не хватит на ежедневный платёж и запас на платежи месяца. Нужен кредит или отложить.`,`If you start now — ${inN(hl.d)} construction stops: not enough for the daily payment plus the month’s reserve. You need a loan, or wait.`)))}</div>`};
    else if(e!=null)v={bad:false,html:`<div class="tip cp-bw">📅 ${esc(nb(T(`После покупки к 30-му ≈ ${M(e)} — на платежи месяца хватает.`,`After the purchase ≈ ${M(e)} by the 30th — the month’s payments are covered.`)))}</div>`};}}catch(x){console.error(x);}
  BW.k=k;BW.v=v;return v;}

/* ---------------- открыть «Финансы → Деньги на 30 дней» ---------------- */
function open(){try{if(typeof hideModal==='function'&&typeof modalOn!=='undefined'&&modalOn)hideModal();}catch(e){}
  try{if(window.PHONE&&PHONE.isOpen)PHONE.close();}catch(e){}
  try{UI.go('fin');const el=document.getElementById('scr-fin');if(el&&window.FIN)FIN.renderFin(el,'cash');}catch(e){console.error(e);}}
function rerender(){const el=document.getElementById('cpFin');if(el&&el.offsetParent){const html=finHtml();const d=document.createElement('div');d.innerHTML=html;const nw=d.firstElementChild;if(nw)el.replaceWith(nw);}}
function doFix(gi,i,n){const w=W();const p=plan(w,n);const g=p&&p.gaps[gi];const f=g&&g.fix&&g.fix[i];if(!f)return;
  const go=()=>{const r=GAME.act.apply(null,[f.act].concat(f.args));if(r==='ok'||r===undefined){try{SND.coin();}catch(e){}E.cpReset();const q=plan();const e=q&&q.eom;
      toast(T('Готово. ','Done. ')+(e?T('К 30-му теперь ≈ ','Now ≈ ')+M(e.own)+T('',' by the 30th'):''));try{if(window.UI&&UI.refresh)UI.refresh();}catch(x){}rerender();}
    else{try{SND.no();}catch(e){}toast(T('Не получилось: ','Didn’t work: ')+r);}};
  const lbl=T(f.ru,f.en).replace('{m}',M(f.a));
  const txt=f.k==='loan'?T(`Кредит ${M(f.a)} под ${Math.round(f.rate*100)} % на ${f.n} мес.${f.gr?' Первые '+f.gr+' мес. — только проценты.':''} Платёж каждый месяц, долг виден в «Финансах» → «Банк».`,`A loan of ${M(f.a)} at ${Math.round(f.rate*100)}% for ${f.n} months.${f.gr?' Interest only for the first '+f.gr+' months.':''} Monthly payments; the debt is in Finance → Bank.`)
    :f.k==='factor'?T(`Банк заплатит сейчас ${M(f.a)} за долги покупателей и оставит себе 3 % — ${M(f.fee)}.`,`The bank pays ${M(f.a)} now for what buyers owe and keeps 3% — ${M(f.fee)}.`)
    :T('Новые покупатели склада будут платить сразу. Продаж станет меньше (без отсрочки берут реже), но деньги не зависают. Вернуть отсрочку можно в карточке склада.','New warehouse buyers pay at once. Sales drop (fewer buy without credit), but cash doesn’t get stuck. You can switch credit back in the warehouse card.');
  if(typeof modal!=='function')return go();
  modal(`<h2>${esc(nb(lbl))}</h2><p class="about">${esc(nb(txt))}</p><div class="row"><button class="btn green noenter" id="cpYes">${esc(T('Да, сделать','Yes, do it'))}</button><button class="btn noenter" id="cpNo">${esc(T('Нет','No'))}</button></div>`);
  const y=document.getElementById('cpYes'),no=document.getElementById('cpNo');if(y)y.onclick=()=>{hideModal();go();};if(no)no.onclick=()=>{try{SND.tap();}catch(e){}hideModal();};}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cash]');if(!b)return;const a=b.dataset.cash;if(a==='nop')return;
  e.stopPropagation();try{SND.tap();}catch(x){}
  if(a==='open')open();
  else if(a==='openc'){try{delete S.pendRep;save();}catch(x){}open();}
  else if(a==='tg'){const d=document.getElementById(b.dataset.id);if(d){d.hidden=!d.hidden;const i=b.querySelector('.cp-more');if(i)i.textContent=d.hidden?'▸':'▾';}}
  else if(a==='h'){H=+b.dataset.v===60?60:30;rerender();}
  else if(a==='fix')doFix(+b.dataset.g||0,+b.dataset.i||0,+b.dataset.n||35);},true);
if(window.GAME&&GAME.on){GAME.on('change',()=>E.cpReset());GAME.on('day',()=>{rerender();});}
// тексты советов в «Недрах» (fin.js ADV.text): z_cash / z_factor
if(window.ADV&&ADV.text&&!ADV.text.__cp){const t0=ADV.text;ADV.text=function(item){if(item&&item.k==='z_cash')return advTxt(item.a);if(item&&item.k==='z_factor')return factorTxt(item.a);return t0.apply(this,arguments);};ADV.text.__cp=1;}

/* ---------------- стиль (вид «Мягкий объём»: переменные look-a) ---------------- */
const css=`.cp-today{padding:0;overflow:hidden}.cp-line{display:flex;align-items:center;width:100%;min-height:64px;padding:12px 16px;background:none;border:0;text-align:left;font:inherit;color:var(--ink);cursor:pointer}
.cp-line .f1{flex:1;min-width:0}.cp-line b{display:block;font-size:19px}.cp-line small{display:block;color:var(--muted);font-size:16px;margin-top:2px}.cp-ic{font-size:22px;width:34px;flex:none;text-align:center}
.cp-pos{color:var(--good)}.cp-neg{color:var(--bad)}.cp-mut{color:var(--muted);font-size:15px;margin:8px 0 0}
.cp-warn{background:var(--bad-t,#fdeeee);border-radius:var(--r2,16px);padding:14px 16px;margin:0 10px 10px;color:var(--ink)}.cp-fin .cp-warn{margin:0}.cp-warn>b{display:block;font-size:18px;color:var(--bad)}.cp-warn p{margin:6px 0 0;font-size:16px;line-height:1.4}
.cp-fixes{display:flex;flex-direction:column;margin-top:10px}.cp-fixes>*+*{margin-top:8px}.cp-fix{display:block;width:100%;min-height:56px;text-align:left;padding:10px 14px;white-space:normal;height:auto}.cp-fix b{display:block;font-size:17px}.cp-fix small{display:block;font-size:15px;opacity:.85;margin-top:2px;font-weight:400}
.cp-mt .mt{width:100%;border:0;background:none;font:inherit;color:inherit;cursor:pointer;display:flex;justify-content:space-between;align-items:center;min-height:48px}
.cp-sum{display:grid;grid-template-columns:1fr 1fr;padding:14px}.cp-k{padding:8px}.cp-k span{display:block;color:var(--muted);font-size:15px}.cp-k b{display:block;font-size:21px;font-variant-numeric:tabular-nums}.cp-k small{display:block;font-size:14px;color:var(--muted)}
.cp-tabs{display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:14px;background:var(--soft,#eef0f4);margin-bottom:10px}.cp-tabs .f-tab{min-height:48px;border:0;border-radius:11px;background:none;font:inherit;font-size:17px;color:var(--ink2,var(--ink))}.cp-tabs .f-tab.on{background:var(--card,#fff);box-shadow:var(--sh);font-weight:700}
.cp-ch{display:block;width:100%;height:auto}.cp-in{fill:var(--good)}.cp-out{fill:var(--bad);opacity:.8}.cp-bal{fill:none;stroke:var(--accent,#3355ff);stroke-width:2.5;stroke-linejoin:round}.cp-ax{stroke:var(--line2,#d3dae6);stroke-width:1}
.cp-zero{stroke:var(--bad);stroke-width:1.2;stroke-dasharray:4 3}.cp-negz{fill:var(--bad-t,#fdeeee)}.cp-cl{stroke:var(--line2,#d3dae6);stroke-dasharray:2 3}
.cp-leg{display:flex;flex-wrap:wrap;font-size:15px;color:var(--muted);margin-top:8px}.cp-leg span{margin-right:14px}.cp-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:-1px}.cp-leg i.in{background:var(--good)}.cp-leg i.out{background:var(--bad)}.cp-leg i.bal{background:var(--accent,#3355ff);height:3px;vertical-align:3px}
.cp-day{border-top:1px solid var(--line);padding:10px 0}.cp-day.neg .cp-dh>b{color:var(--bad)}.cp-dh{display:flex;justify-content:space-between;align-items:baseline;font-size:16px;margin-bottom:4px}.cp-dh span{color:var(--muted);font-size:15px;margin-left:10px;white-space:nowrap}
.cp-r{display:flex;align-items:center;width:100%;min-height:48px;padding:6px 2px;border:0;background:none;font:inherit;font-size:17px;color:var(--ink);text-align:left;cursor:pointer}.cp-r .f1{flex:1;min-width:0;padding-right:8px}.cp-r>b{font-variant-numeric:tabular-nums;white-space:nowrap}.cp-more{font-style:normal;color:var(--muted)}
.cp-det{margin:0 0 6px 34px;padding:6px 10px;border-radius:12px;background:var(--soft2,#f4f7fc)}.cp-det div{display:flex;justify-content:space-between;font-size:15px;padding:3px 0}.cp-det div span{padding-right:8px}
.cp-rec b{display:block;font-size:17px}.cp-rec small{display:block;color:var(--muted);font-size:15px;margin:2px 0 6px}.cp-rec ul{list-style:none;margin:0 0 8px;padding:0}.cp-rec li{display:flex;justify-content:space-between;font-size:16px;padding:4px 0;border-bottom:1px dashed var(--line)}
.cp-od{background:var(--bad-t,#fdeeee);border-radius:var(--r2,16px);padding:12px 14px;margin:10px 0}.cp-od b{color:var(--bad);font-size:17px}.cp-od p{margin:6px 0 8px;font-size:16px}
body.th-dark .cp-warn,body.th-dark .cp-od{background:rgba(224,70,75,.16)}body.th-dark .cp-det{background:rgba(255,255,255,.06)}`;
try{const s=document.createElement('style');s.id='cpCss';s.textContent=css;document.head.appendChild(s);}catch(e){}

function finSub(w){const p=plan(w);if(!p||!p.eom)return '';const g=p.gaps[0];return esc(nb(T('к 30-му ≈ ','by the 30th ≈ ')+M(p.eom.own)+(g&&g.d<=45?(g.k==='halt'?T(' · ⚠ стройка встанет',' · ⚠ construction stops'):T(' · ⚠ не хватит ',' · ⚠ short by ')+M(g.a)):'')));}
window.CASHUI={buyWarn,finSub,K,todayLine,monthTail,monthRows,mapCard,finHtml,recLine,calDates,closeOd,advTxt,factorTxt,odWhy,open,plan,rerender};
})();
