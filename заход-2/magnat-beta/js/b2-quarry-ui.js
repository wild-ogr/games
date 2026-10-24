/* b2-quarry-ui.js — QUARRY, вид (по требованию из b2-quarry.js; модель — b2-quarry-m.js, B2.qx).
   Гнёзда: today (решения карьера на «Сегодня»), close (окно месяца: те же кнопки, ответ → «✓ Решено»), pit (вкладка «Карьер»: всё + итоги и разведка).
   Нажатия: data-b2="quarry:bid:<0..3>" | "quarry:mix:<карьер>|<0..2>" | "quarry:drill:<участок>". Разрез карьера для Улицы — B2.qu.svg(W,{w,h}). */
(function(){'use strict';
if(typeof B2==='undefined'||B2.off('quarry')||!B2.qx||typeof document==='undefined')return;
const X=B2.qx,E=ECON;
const M=x=>FMT.money(x),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=x=>FMT.num?FMT.num(x,0):String(Math.round(x));
const tn=q=>L(num(q)+' т',num(q)+' t'),rpt=p=>L(num(p)+' ₽/т',num(p)+' ₽/t');
const days=n=>n+' '+pl(n,'день','дня','дней','day','days');
const sg=x=>(x>0?'+':x<0?'−':'')+M(Math.abs(x));
const G={grav:['щебень','gravel'],sand:['песок','sand']};
const CL=[['ЖК «Северный»','“Northern” housing estate'],['Дорожное управление','Road department'],['Завод ЖБИ','Concrete products plant'],['Коттеджный посёлок «Сосны»','“Pines” cottage village'],
  ['Застройщик «Новый квартал»','“New Quarter” developer'],['Мост через реку','Bridge over the river'],['Логистический центр','Logistics centre'],['Школа и детский сад','School and kindergarten']];
const GRN={grav:[['М800 — слабее обычного','M800 — weaker than usual'],['М1000 — обычный','M1000 — standard'],['М1200 — крепкий','M1200 — strong']],
  sand:[['мелкий, пылеватый','fine and silty'],['обычный','standard'],['крупный, чистый','coarse and clean']]};
const QN=[['январь–март','January–March'],['апрель–июнь','April–June'],['июль–сентябрь','July–September'],['октябрь–декабрь','October–December']];
const T=a=>L(a[0],a[1]),pct=x=>Math.round(Math.abs(x)*100)?(x>=0?'+':'−')+Math.round(Math.abs(x)*100)+' %':L('как обычно','as usual');
const BTN='btn w noenter',ST='margin-top:8px;text-align:left;min-height:48px';
function pname(W,b){const p=W.opi.find(x=>x.id===b.pid);return (p?L('«'+p.nm[0]+'»','“'+p.nm[1]+'”')+' · ':'')+T(G[E.BIZ[b.t].out]);}
function rivTxt(W){return X.rivs(W).map(r=>L(r.n,r.en||r.n)).join(', ');}
function css(){if(document.getElementById('b2qCss'))return;const s=document.createElement('style');s.id='b2qCss';
  s.textContent='.b2q small{display:block;font-size:15px;color:var(--muted);margin-top:2px}.b2q .b2q-h{font-size:18px;font-weight:700}.b2q .b2q-n{font-size:16px;margin:6px 0}.b2q .btn.accent small{color:inherit;opacity:.92}.b2q .b2q-ok{color:var(--good);font-weight:600}.b2q .b2q-bad{color:var(--bad);font-weight:600}';
  document.head.appendChild(s);}

/* ---------- тендер ---------- */
function tender(W,box){const o=X.O(W),t=o.t;if(!t)return '';const g=T(G[t.g]),cl=T(CL[t.cl%CL.length]);
  if(t.my!=null&&t.my<3){const p=Math.round(t.cap*X.TF[t.my]/10)*10;
    return `<div class="card b2q"><div class="b2q-h">📋 ${L('Тендер: ','Tender: ')+esc(cl)}</div><p class="b2q-n">${L(`Заявка подана: ${g} по ${rpt(p)}. Итог — через ${days(Math.max(1,t.end-W.t))}.`,`Bid sent: ${g} at ${rpt(p)}. Result in ${days(Math.max(1,t.end-W.t))}.`)}</p></div>`;}
  const A=X.qtAdv(W),dl=Math.max(1,t.exp-W.t);
  const nm=[L('Высокая цена','High price'),L('Средняя цена','Middle price'),L('Низкая цена','Low price')];
  let h=`<div class="card b2q${box?' b2q-box':''}"><div class="b2q-h">📋 ${L('Тендер стройки: ','Construction tender: ')+esc(cl)}</div>
    <p class="b2q-n">${L(`Нужен ${g}: ${tn(t.qm)} в месяц × ${t.n} ${pl(t.n,'месяц','месяца','месяцев','month','months')}, с доставкой. Цена — не выше ${rpt(t.cap)}. Кто дешевле — тот и везёт. Соперники: ${esc(rivTxt(W))}. Ответить — за ${days(dl)}.`,
      `They need ${g}: ${tn(t.qm)} a month × ${t.n} months, delivered. Price no higher than ${rpt(t.cap)}. The cheapest bid wins. Rivals: ${esc(rivTxt(W))}. Reply within ${days(dl)}.`)}</p>`;
  for(const x of A.a){const ok=x.tot>0;h+=`<button class="${BTN} ${x.i===A.best?'accent':''}" data-b2="quarry:bid:${x.i}" style="${ST}"><b>${nm[x.i]}: ${rpt(x.p)}</b><small>${L(`шанс ≈ ${Math.round(x.ch*100)} % · выиграем — ${ok?'прибыль ≈ '+sg(x.tot):'в минус '+M(-x.tot)}`,`chance ≈ ${Math.round(x.ch*100)}% · if we win — ${ok?'profit ≈ '+sg(x.tot):'a loss of '+M(-x.tot)}`)}</small></button>`;}
  h+=`<button class="${BTN} ${A.best===3?'accent':''}" data-b2="quarry:bid:3" style="${ST}"><b>${L('Не участвуем','Skip it')}</b></button>`;
  const b=A.best<3?A.a[A.best]:null;
  h+=`<div class="tip">${esc(b?L(`Я бы дала ${['высокую','среднюю','низкую'][b.i]} цену: шанс × прибыль здесь больше всего (≈ ${M(b.ev)}). Своя тонна считается по тому, что она принесла бы у карьера, плюс доставка.`,`I’d go with the ${['high','middle','low'][b.i]} price: chance × profit is highest here (≈ ${M(b.ev)}). Our own tonne is valued at what it would fetch at the pit, plus delivery.`)
    :L('Я бы не участвовала: даже по высокой цене подряд не окупит доставку и упущенные продажи у карьера.','I’d skip it: even at the high price the contract won’t cover delivery and lost sales at the pit.'))}</div></div>`;return h;}
function result(W){const r=X.O(W).r;if(!r||r.no)return '';const cl=T(CL[r.cl%CL.length]);
  if(r.w)return `<p class="bz-note b2q"><span class="b2q-ok">✓ ${L('Тендер выигран: ','Tender won: ')+esc(cl)}</span> — ${L(`${tn(r.q)} по ${rpt(r.p)}. Поставки идут подрядом (ниже, «Подряды»).`,`${tn(r.q)} at ${rpt(r.p)}. Deliveries run as a contract (below).`)}</p>`;
  const f=r.who&&B2.rivals&&B2.rivals.firm?B2.rivals.firm(r.who):X.rivs(W).find(x=>x.id===r.who);
  return `<p class="bz-note b2q"><span class="b2q-bad">✗ ${L('Тендер проигран: ','Tender lost: ')+esc(cl)}</span> — ${L(`забрал ${esc(f?f.n:'соперник')} за ${rpt(r.wp)}, наша цена была ${rpt(r.p)}.`,`${esc(f?(f.en||f.n):'a rival')} took it at ${rpt(r.wp)}; ours was ${rpt(r.p)}.`)}</p>`;}

/* ---------- что добываем в квартале ---------- */
function plan(W,box){const ps=X.qpPend(W);if(!ps.length)return '';const q=Math.floor(W.m/3)%4,o=X.O(W);let h='';
  for(const b of ps){const P=X.qpOpts(W,b),dl=Math.max(1,o.qa.exp-W.t);
    h+=`<div class="card b2q${box?' b2q-box':''}"><div class="b2q-h">🗓 ${L('Что добываем: ','What we produce: ')+T(QN[q])}</div><small>${esc(pname(W,b))}${b.pid&&X.gradeK(W,b)!==1?' · '+esc(T(GRN[P.g][X.grade(W,b.pid)])):''}</small>
      <p class="b2q-n">${L(`Стройкам в этом квартале больше всего нужен «${P.P[P.hot].ru}» (цена ${pct(P.a[P.hot]-1)}), а «${P.P[P.cold].ru}» в избытке (${pct(P.a[P.cold]-1)}). Выбрать — за ${days(dl)}, иначе добываем как сейчас.`,
        `This quarter builders want “${P.P[P.hot].en}” most (price ${pct(P.a[P.hot]-1)}), and “${P.P[P.cold].en}” is in oversupply (${pct(P.a[P.cold]-1)}). Choose within ${days(dl)}, or we keep the current one.`)}</p>`;
    P.P.forEach((p,i)=>{h+=`<button class="${BTN} ${i===P.best?'accent':''}" data-b2="quarry:mix:${b.id}|${i}" style="${ST}"><b>${i===P.best?'★ ':''}${esc(L(p.ru,p.en))}${i===P.cur?L(' · сейчас',' · current'):''}</b><small>${esc(L(`для ${p.wr} · цена ${pct(P.a[i]-1)}${p.v?`, ${p.v>0?'доплата':'экономия'} ${Math.abs(p.v)} ₽/т`:''} · ≈ ${sg(P.val[i])} в месяц`,`for ${p.we} · price ${pct(P.a[i]-1)}${p.v?`, ${p.v>0?'extra':'saves'} ${Math.abs(p.v)} ₽/t`:''} · ≈ ${sg(P.val[i])} a month`))}</small></button>`;});
    h+=`<div class="tip">${esc(P.best===P.cur?L('Я бы оставила как есть — сейчас это и так выгоднее всего.','I’d keep it — that’s already the best option.'):L(`Я бы перешла на «${P.P[P.best].ru}»: выйдет на ${M(P.gain)} в месяц больше, чем сейчас.`,`I’d switch to “${P.P[P.best].en}”: ${M(P.gain)} a month more than now.`))}</div></div>`;}
  return h;}

/* ---------- разведка участков ---------- */
function drill(W,one){const ps=W.opi.filter(p=>X.qxOk(W,p)).sort((a,b)=>(a.st==='auc'?-1:a.day)-(b.st==='auc'?-1:b.day));if(!ps.length)return '';let h='';
  for(const p of one?ps.slice(0,1):ps){if(one&&p.st==='list'&&p.day-W.t>60)break;const c=X.qxCost(p),g=T(G[p.g]),nm=L('«'+p.nm[0]+'»','“'+p.nm[1]+'”');
    h+=`<div class="card b2q"><div class="b2q-h">🔍 ${L('Разведка до торгов: ','Survey before the auction: ')+esc(nm)} · ${g}</div>
      <p class="b2q-n">${L(`Марка ${p.g==='grav'?'камня':'песка'} неизвестна: от неё цена тонны −8 % … +8 %, а оценка участка — до ±24 %. Бурение стоит ${M(c)} — узнаем до торгов, сколько он стоит на самом деле. ${p.st==='auc'?'Торги идут сейчас.':'Торги через '+days(Math.max(1,p.day-W.t))+'.'}`,
        `The ${p.g==='grav'?'stone':'sand'} grade is unknown: it moves the price per tonne by −8% … +8% and the plot’s estimate by up to ±24%. Drilling costs ${M(c)} — we’ll know its real worth before the auction. ${p.st==='auc'?'The auction is on now.':'Auction in '+days(Math.max(1,p.day-W.t))+'.'}`)}</p>
      <button class="${BTN} accent" data-b2="quarry:drill:${p.id}" style="${ST}"${W.cash<c?' disabled':''}><b>🔍 ${L('Пробурить за ','Drill for ')+M(c)}</b></button></div>`;}
  return h;}
function surveyed(W){const o=X.O(W),a=W.opi.filter(p=>(','+(o.d||'')+',').indexOf(','+p.id+',')>=0&&(p.st==='list'||p.st==='auc'));
  return a.map(p=>{const g=X.grade(W,p.id);return `<p class="bz-note b2q">🔍 ${esc(L('«'+p.nm[0]+'»','“'+p.nm[1]+'”'))}: ${esc(T(GRN[p.g][g]))} — ${g===2?L('<span class="b2q-ok">оценка выше</span>','<span class="b2q-ok">worth more</span>'):g===0?L('<span class="b2q-bad">оценка ниже</span>','<span class="b2q-bad">worth less</span>'):L('оценка прежняя','estimate unchanged')}: ${M(p.V)}, ${L('разумный предел ','sensible limit ')+M(Math.round(p.V*E.OPI_ADV))}.</p>`;}).join('');}

/* ---------- гнёзда ---------- */
function today(c){const W=c&&c.W;if(!W||!X.live(W))return '';css();return tender(W)+plan(W)+drill(W,1);}
function close(c){const W=c&&c.W;if(!W||!X.live(W))return '';css();const o=X.O(W);let h=(o.t&&o.t.my==null?tender(W,1):'')+plan(W,1);if(!h)h=result(W);return h;}
function pit(c){const W=c&&c.W;if(!W||!X.live(W))return '';css();return tender(W)+result(W)+plan(W)+drill(W)+surveyed(W);}
function click(a,arg,el){if(typeof GAME==='undefined'||!GAME.act)return;let r;const box=el&&el.closest&&el.closest('.b2q-box');const nm=el&&el.querySelector('b')?el.querySelector('b').textContent:'';
  if(a==='bid'){r=GAME.act('qtBid',+arg);if(r==='ok'){B2.ev('quarry','tender',{i:+arg});toast(+arg===3?L('Не участвуем','Skipped'):L('Заявка подана — итог через несколько дней','Bid sent — result in a few days'));}}
  else if(a==='mix'){const p=String(arg).split('|');r=GAME.act('qpSet',p[0],+p[1]);if(r==='ok'){B2.ev('quarry','mix',{k:+p[1]});toast(L('Решено: ','Decided: ')+nm.replace(/^★ /,''));}}
  else if(a==='drill'){r=GAME.act('qxDrill',arg);if(r==='ok'){B2.ev('quarry','drill',{});const p=W0().opi.find(x=>x.id===arg),g=p?X.grade(W0(),arg):1;toast(L('Разведали: ','Surveyed: ')+(p?T(GRN[p.g][g]):''));}
    else if(r==='cash')toast(L('Не хватает денег — нужны и на платежи месяца','Not enough money — we need some for this month’s bills'));}
  if(r==='ok'){try{if(typeof SND!=='undefined'&&SND.tap)SND.tap();}catch(e){}
    if(box)box.innerHTML='✓ '+esc(L('Решено: ','Decided: ')+nm.replace(/^★ /,''));else if(window.UI&&UI.render)UI.render();}}
const W0=()=>GAME.W;

/* ---------- разрез карьера (для Улицы — HOME) ---------- */
// уступы по числу карьеров и расширений; песок — жёлтый, гранит — серый; без своих карьеров — ровное поле с флажком участка
function svg(W,o){o=o||{};const w=o.w||160,h=o.h||90;if(!W)return '';const ps=(W.biz||[]).filter(b=>E.PITS.indexOf(b.t)>=0);
  const gr=ps.some(b=>b.t==='gravpit'),sd=ps.some(b=>b.t==='sandpit'),wk=ps.filter(b=>b.st==='w');let lv=0;for(const b of wk)lv+=1+(b.xl||0);
  const n=Math.max(0,Math.min(5,lv)),top=h*.38,stH=(h*.5)/Math.max(1,n),stW=w*.07;let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(L('Разрез карьера','Quarry cross-section'))}">`;
  s+=`<rect width="${w}" height="${top}" fill="#cfe4f2"/><rect y="${top}" width="${w}" height="${h-top}" fill="#8a6a4a"/><rect y="${top}" width="${w}" height="${h*.06}" fill="#6b8f3a"/>`;
  if(!n){s+=`<line x1="${w*.5}" y1="${top}" x2="${w*.5}" y2="${top-h*.2}" stroke="#444" stroke-width="2"/><path d="M${w*.5} ${top-h*.2}h${w*.12}l-${w*.03} ${h*.05}h${w*.03}l-${w*.12} ${h*.03}z" fill="#c8641e"/></svg>`;return s;}
  const col=gr&&sd?'#9aa0a6':gr?'#8d9399':'#e3c47a',x0=w*.15,x1=w*.85;let d=`M${x0} ${top}`;
  for(let i=0;i<n;i++){d+=` L${x0+stW*i} ${top+stH*(i+1)} L${x0+stW*(i+1)} ${top+stH*(i+1)}`;}
  d+=` L${x1-stW*n} ${top+stH*n}`;for(let i=n;i>0;i--){d+=` L${x1-stW*(i-1)} ${top+stH*i} L${x1-stW*(i-1)} ${top+stH*(i-1)}`;}d+=` L${x1} ${top} Z`;
  s+=`<path d="${d}" fill="${col}" stroke="#5b4a38" stroke-width="1"/>`;
  if(gr&&sd)s+=`<path d="M${w*.86} ${top} q${w*.06} -${h*.16} ${w*.12} 0z" fill="#e3c47a" stroke="#b08a3e" stroke-width="1"/>`;   // песок — кучей у края
  const by=top+stH*n,bx=w*.5;s+=`<rect x="${bx-w*.09}" y="${by-h*.09}" width="${w*.1}" height="${h*.06}" rx="2" fill="#f2b33d"/><circle cx="${bx-w*.07}" cy="${by-h*.02}" r="${h*.025}" fill="#333"/><circle cx="${bx}" cy="${by-h*.02}" r="${h*.025}" fill="#333"/>`;
  s+=`<rect x="${bx+w*.04}" y="${by-h*.1}" width="${w*.06}" height="${h*.05}" fill="#c8641e"/><path d="M${bx+w*.1} ${by-h*.08} l${w*.08} -${h*.08}" stroke="#c8641e" stroke-width="3"/></svg>`;return s;}

B2.qu={today,close,pit,click,svg,tender,plan,drill};
})();
