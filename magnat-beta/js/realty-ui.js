/* ================= «Из ларька в магнаты: бизнес» — экран «Недвижимость» (js/realty-ui.js) =================
   Модель — js/realty.js (ECON.re*). Спецификация — hobby-analytics/24-magnat-rags-to-riches.md §10.
   Встраивание без правки ui.js/biz-ui.js:
     • свой экран <section id="scr-re" class="screen"> в #main (создаём сами), показ — UI.go('re'), рисуем при появлении класса on;
     • REALTY_UI.open() — открыть экран (кнопку в меню/на экран «Бизнес» может поставить ведущий);
     • карточка-вход .re-entry — сами вставляем наверх экранов #scr-biz (если есть) и #scr-obj, когда недвижимость открыта;
     • REALTY_UI.render(el) — нарисовать экран в любой контейнер (например, вкладкой внутри «Бизнеса»);
     • REALTY_UI.newsText(n) — текст новости k:'re' (ADV.news дополняем сами, если он есть).
   Кнопки — атрибут data-ra (не data-a: тот ловит ui.js). Траты, реклама, 💎 — класс noenter. */
(function(){
'use strict';
const E=window.ECON;if(!E||!E.reBook)return;
const W=()=>window.GAME&&GAME.W;
const byId=id=>document.getElementById(id);
// до миллиона — точно, с пробелами (18 200 ₽), дальше — FMT.money (3,1 млн ₽)
function M(x){x=Math.round(x);if(Math.abs(x)>=1e6)return FMT.money(x);const r=Math.abs(x)>=1e4?Math.round(x/100)*100:Math.abs(x)>=1e3?Math.round(x/10)*10:x;return (r<0?'−':'')+String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g,LANG==='en'?',':'\u00a0')+'\u00a0₽';}
const snd=k=>{try{if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ICO={room:'🛏',studio:'🏠',one:'🏡',two:'🏘',prem:'🏙',ph:'🌆',shop:'🏪',office:'🏢',whs:'🏭'};
const cityN=c=>L(E.RE_CITY[c].n,E.RE_CITY[c].en);
const clsN=k=>L(E.RE_CLS[k].n,E.RE_CLS[k].en);
const pc=(x,d)=>(Math.round(x*100*(d?10:1))/(d?10:1)).toString().replace('.',LANG==='en'?'.':',')+' %';
const GROW=Math.pow(1.0055,12)-1;   // средний рост цен в год (модель: +0,55 %/мес.)
const RUSH=4;                       // 💎 за срочный ремонт (§10.8)
const STN=[['Карьера','Career'],['Своё дело','Own business'],['Сеть','Chain'],['Карьер','Quarry'],['Недра','Mining']];
const stN=i=>L(STN[i][0],STN[i][1]);
function yrs(m){if(!m||m<=0)return L('больше 50 лет','over 50 years');if(m<24)return m+' '+pl(m,'месяц','месяца','месяцев','month','months');const y=Math.round(m/12);return y+' '+pl(y,'год','года','лет','year','years');}
function days(n){return n+' '+pl(n,'день','дня','дней','day','days');}
function face(m){try{return window.UI&&UI.face?UI.face(m):'';}catch(e){return '';}}
function say(t,m){return `<div class="say">${face(m||'calm')}<div>${t}</div></div>`;}

const ST={tab:null,city:null,prev:'obj',buy:null};

/* ---------------- CSS (свой, внутри файла) ---------------- */
function css(){if(byId('re-css'))return;const s=document.createElement('style');s.id='re-css';s.textContent=`
.re-top{display:flex;align-items:center;margin:0 0 12px}
.re-top h2{margin:0 0 0 12px;flex:1;min-width:0}
.re-top .btn{flex:none}
.re-tabs{display:flex;padding:4px;border-radius:16px;background:var(--soft);margin:4px 0 14px}
.re-tabs button{flex:1 1 0;min-height:48px;border-radius:12px;font-weight:600;font-size:17px;color:var(--ink2)}
.re-tabs button.on{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(16,24,40,.14)}
.re-row,.card.tap.re-row{display:flex;align-items:center;width:100%;text-align:left}
.re-row .re-i{font-size:34px;line-height:1;width:48px;flex:none;margin-right:12px;text-align:center}
.re-row .re-t{flex:1;min-width:0}
.re-row .re-t b{display:block;font-size:18px}
.re-row .re-t span{display:block;font-size:16px;color:var(--muted)}
.re-row .re-v{text-align:right;flex:none;margin-left:10px;font-size:17px}
.re-row .re-v small{display:block;color:var(--muted);font-size:15px}
.re-row .re-v b.neg{color:var(--bad)}.re-row .re-v b.pos{color:var(--good)}
.card.tap.re-lock{opacity:.6}
.re-entry .re-go{font-size:26px;color:var(--muted);margin-left:8px;flex:none}
.re-ev{border-left:4px solid var(--warn)}
.re-ev p{margin:6px 0 4px}
.re-cmp{width:100%;border-collapse:collapse;font-size:16px;margin:8px 0}
.re-cmp th{font-weight:600;text-align:right;padding:6px 4px;font-size:15px;color:var(--ink2);vertical-align:bottom}
.re-cmp th:first-child{text-align:left}
.re-cmp td{padding:7px 4px;border-top:1px solid var(--line);text-align:right;white-space:nowrap}
.re-cmp td:first-child{text-align:left;white-space:normal;color:var(--ink2)}
.re-cmp td.neg{color:var(--bad);font-weight:600}.re-cmp td.pos{color:var(--good);font-weight:600}
.re-gray{color:var(--muted)}
.re-sec{font-weight:600;font-size:17px;margin:16px 0 4px}
.re-note{font-size:15px;color:var(--muted);margin:2px 0 6px}
.re-warn{background:var(--bad-t);color:var(--bad);border-radius:12px;padding:10px 12px;font-size:16px;margin:8px 0}
.re-set{display:flex;align-items:center;width:100%;min-height:52px;border-radius:14px;background:var(--soft);padding:8px 14px;margin:6px 0;text-align:left;font-size:17px}
.re-set span{flex:1;min-width:0}
.re-set small{display:block;color:var(--muted);font-size:15px}
.re-set i{font-style:normal;font-weight:600;color:var(--good);margin-left:10px;flex:none}
.re-set i.off{color:var(--muted)}
#mcard .re-pick button small{display:block;font-size:14px;opacity:.8}
#mcard .re-pick button{flex-direction:column}
.re-pick4 button{flex:1 1 20%}
.re-cmp th small{font-size:14px;font-weight:500}
.re-btns{display:flex;flex-direction:column;margin-top:8px}
.re-btns>.btn{margin:5px 0}
`;document.head.appendChild(s);}

/* ---------------- экран ---------------- */
function screen(){let el=byId('scr-re');if(el)return el;const m=byId('main');if(!m)return null;
  el=document.createElement('section');el.id='scr-re';el.className='screen';m.appendChild(el);
  new MutationObserver(()=>{if(el.classList.contains('on')&&!el.dataset.on){el.dataset.on='1';render(el);}else if(!el.classList.contains('on'))delete el.dataset.on;}).observe(el,{attributes:true,attributeFilter:['class']});
  return el;}
function curTab(){const s=document.querySelector('#main > .screen.on');return s?s.id.replace(/^scr-/,''):'map';}
function open(tab){const w=W();if(!w)return;css();const el=screen();if(!el)return;if(tab)ST.tab=tab;
  const c=curTab();if(c!=='re')ST.prev=c;
  // экраны переключаем сами, не через UI.go: ui.js/biz-ui.js не знают вкладки 're' (biz-ui уводит неизвестную вкладку на «Сегодня»);
  // «текущей» для ui.js остаётся вкладка, откуда пришли, — её кнопка в меню и подсвечена; любое нажатие меню нас закрывает
  document.querySelectorAll('#main > .screen').forEach(s=>s.classList.toggle('on',s===el));
  if(el.classList.contains('on'))render(el);const m=byId('main');if(m)m.scrollTop=0;}
function back(){snd('tap');const p=ST.prev&&ST.prev!=='re'?ST.prev:'obj';if(window.UI&&UI.go)UI.go(p);else{const el=byId('scr-re');if(el)el.classList.remove('on');const t=byId('scr-'+p);if(t)t.classList.add('on');}}

function render(el){const w=W();if(!w||!el)return;css();E.reMigrate(w,[]);const open=E.reOpen(w),S2=E.reSum(w);
  const host=el.id==='scr-re';
  let h=host?`<div class="re-top"><button class="btn sm" data-ra="back">← ${L('Назад','Back')}</button><h2>🏠 ${L('Недвижимость','Real estate')}</h2></div>`:`<h2>🏠 ${L('Недвижимость','Real estate')}</h2>`;
  if(!open){const st=E.stI?E.stI(w):4;
    h+=`<div class="card">${say(st<1?L('Квартиры покупать рано: сначала заработаем на первое дело. Недвижимость откроется в главе «Своё дело».','Too early for flats: first let’s earn for our first business. Real estate opens in the “Own business” chapter.'):L('В этом холдинге недвижимость пока не подключена.','Real estate isn’t available in this holding yet.'),'calm')}</div>`;
    el.innerHTML=h;return;}
  // события с выбором
  for(const e of w.reEv)h+=evCard(w,e);
  // сводка
  if(S2.n){h+=`<div class="tiles"><div class="tile"><span>${L('Объектов','Properties')}</span><b class="num">${S2.n}</b></div>
    <div class="tile ${S2.net>=0?'pos':'neg'}"><span>${L('Итог за месяц','Last month, net')}</span><b class="num">${S2.net>=0?'+':'−'}${M(Math.abs(S2.net))}</b></div>
    <div class="tile"><span>${L('Рыночная цена','Market value')}</span><b class="num">${M(S2.mv)}</b></div>
    <div class="tile"><span>${L('Долг по ипотеке','Mortgage debt')}</span><b class="num">${S2.debt?M(S2.debt):'—'}</b></div></div>
    <p class="re-note">${L('В балансе — по цене покупки','On the balance sheet at cost')}: ${M(S2.bk)}. ${S2.res>=0?L('Скрытый резерв','Hidden reserve'):L('Рынок ниже цены покупки','Market below cost')}: ${S2.res>=0?'+':'−'}${M(Math.abs(S2.res))} — ${L('попадёт в прибыль только при продаже.','counts as profit only when you sell.')}</p>`;}
  const tab=ST.tab||(S2.n?'my':'buy');ST.tab=tab;
  h+=`<div class="re-tabs"><button data-ra="tab" data-v="my" class="${tab==='my'?'on':''}">${L('Мои','Mine')}${S2.n?' ('+S2.n+')':''}</button><button data-ra="tab" data-v="buy" class="${tab==='buy'?'on':''}">${L('Купить','Buy')}</button></div>`;
  h+=tab==='my'?myList(w):market(w);
  h+=`<div class="tip">🏦 ${L('Недвижимость — тихая гавань: 6–10 % в год вместе с ростом цен. Бизнес приносит 40–60 %, зато здесь спокойнее. Ипотека под сдачу при ставке 16–20 % почти всегда в минус по деньгам.','Real estate is a safe harbour: 6–10% a year including price growth. Business makes 40–60%, but this is calmer. A buy-to-let mortgage at 16–20% almost always loses cash.')}</div>`;
  el.innerHTML=h;}

function stateTxt(w,o){const i=E.reObjInfo(w,o);
  switch(i.state){case 'sale':return [L('продаётся, ещё ','for sale, ')+days(o.sl.left)+L('',' left'),'st'];
    case 'ren':return [L('ремонт, ещё ','renovation, ')+days(o.ren.left)+L('',' left'),'st'];
    case 'live':return [L('живёте сами','you live here'),'go'];
    case 'day':return [L('посуточно','short-term let'),'go'];
    case 'vac':return [(E.RE_CLS[o.cls].com?L('ищем арендатора','looking for a tenant'):L('ищем жильца','looking for a tenant'))+', ~'+days(o.vac),'st'];
    case 'np':return [L('жилец не платит','tenant isn’t paying'),'no'];}
  return [L('сдана','let'),'go'];}
function myList(w){if(!w.re.length)return `<div class="card">${say(L('Пока ничего нет. Первая квартира — самый понятный пассивный доход: купили, сдали, получаете аренду каждый месяц. Откройте «Купить».','Nothing yet. A first flat is the simplest passive income: buy, let, collect rent monthly. Open “Buy”.'),'happy')}</div>`;
  let h='';for(const o of w.re){const [t,k]=stateTxt(w,o),net=o.lm?o.lm.net:null;
    h+=`<button class="card tap re-row" data-ra="obj" data-id="${o.id}"><span class="re-i">${ICO[o.cls]||'🏠'}</span><span class="re-t"><b>${esc(clsN(o.cls))}</b><span>${esc(cityN(o.c))} · <span class="tag ${k}">${esc(t)}</span></span></span>
      <span class="re-v">${net==null?`<b>—</b>`:`<b class="num ${net>=0?'pos':'neg'}">${net>=0?'+':'−'}${M(Math.abs(net))}</b>`}<small>${L('за месяц','per month')}</small></span></button>`;}
  return h;}

function cities(w){return E.RE_CL.filter(c=>E.RE_KL.some(k=>E.RE_CLS[k].p[c==='msk'?1:0]));}
function lockWhy(w,av,cls,c){if(av==='city')return L('в главе «Своё дело» — только в своём городе','in “Own business” — only your home city');
  if(av==='stage'){const need=Math.max(E.RE_CLS[cls].st,c==='msk'?3:0);return L('откроется в главе ','opens in the chapter ')+'«'+stN(need)+'»';}
  return L('в этом городе нет','not in this city');}
function market(w){const cs=cities(w);let c=ST.city&&cs.indexOf(ST.city)>=0?ST.city:(cs.indexOf(w.home)>=0?w.home:cs[0]);ST.city=c;
  let h=`<div class="pick">${cs.map(x=>`<button data-ra="city" data-v="${x}" class="${x===c?'on':''}">${esc(cityN(x))}</button>`).join('')}</div>`;
  // «сосед продаёт дёшево»
  for(const z of w.reOff){const left=Math.max(0,z.exp-w.t),mk=E.rePrice(w,z.cls,z.c);
    h+=`<button class="card tap re-row re-ev" data-ra="offer" data-id="${z.id}"><span class="re-i">🔥</span><span class="re-t"><b>${L('Сосед продаёт дёшево','A neighbour sells cheap')}</b><span>${esc(clsN(z.cls))}, ${esc(cityN(z.c))} · ${L('решить за ','decide within ')}${days(left)}</span></span>
      <span class="re-v"><b class="num">${M(z.pr)}</b><small class="num">−${Math.round((1-z.pr/Math.max(1,mk))*100)} %</small></span></button>`;}
  const res=E.RE_KL.filter(k=>E.RE_CLS[k].res),com=E.RE_KL.filter(k=>E.RE_CLS[k].com);
  const row=k=>{const C=E.RE_CLS[k];if(!C.p[c==='msk'?1:0])return '';const av=E.reAvail(w,k,c),P=E.rePrice(w,k,c),r=E.reRentC(w,k,c);
    return `<button class="card tap re-row${av==='ok'?'':' re-lock'}" data-ra="cls" data-v="${k}"><span class="re-i">${ICO[k]}</span><span class="re-t"><b>${esc(clsN(k))}</b><span>${C.m2} ${L('м²','m²')} · ${av==='ok'?L('аренда ','rent ')+M(r)+L('/мес.','/mo')+' · '+pc(r*12/P,1)+L(' в год',' a year'):esc(lockWhy(w,av,k,c))}</span></span>
      <span class="re-v"><b class="num">${M(P)}</b></span></button>`;};
  h+=`<div class="re-sec">${L('Жильё','Homes')}</div>`+res.map(row).join('');
  const hc=com.map(row).join('');if(hc)h+=`<div class="re-sec">${L('Коммерческая','Commercial')}</div><p class="re-note">${L('Доходнее (10–12 % в год), но арендатора ищут 3–9 месяцев.','Higher yield (10–12% a year), but a tenant takes 3–9 months to find.')}</p>`+hc;
  return h;}

/* ---------------- события ---------------- */
function evCard(w,e){const o=w.re.find(x=>x.id===e.re);if(!o)return '';const left=Math.max(0,e.exp-w.t),nm=esc(clsN(o.cls))+', '+esc(cityN(o.c));
  if(e.k==='flood')return `<div class="card re-ev"><b>💧 ${L('Соседи сверху затопили','The upstairs neighbours flooded you')}</b><p>${nm}. ${L('Ремонт','Repairs')}: <b>${M(e.a)}</b>. ${L('Страховки не было.','There was no insurance.')}</p>
    <p class="re-note">${L('Решить за ','Decide within ')}${days(left)}${L(', иначе заплатим сами.',', otherwise we just pay.')}</p>
    <div class="re-btns"><button class="btn noenter" data-ra="dec" data-id="${e.id}" data-v="pay">${L('Заплатить','Pay')} ${M(e.a)}</button>
    <button class="btn noenter" data-ra="dec" data-id="${e.id}" data-v="sue">⚖️ ${L('Судиться','Go to court')}<small>${L('вернут 70 % через 3 месяца, пошлина 5 000 ₽','70% back in 3 months, fee 5,000 ₽')}</small></button></div></div>`;
  if(e.k==='np')return `<div class="card re-ev"><b>😠 ${L('Жилец не платит','The tenant isn’t paying')}</b><p>${nm}. ${L('Долг за 2 месяца','Two months owed')}: <b>${M(e.a)}</b>.</p>
    <p class="re-note">${L('Решить за ','Decide within ')}${days(left)}${L(', иначе — рассрочка.',', otherwise — instalments.')}</p>
    <div class="re-btns"><button class="btn" data-ra="dec" data-id="${e.id}" data-v="deal">🤝 ${L('Договориться','Make a deal')}<small>${L('рассрочка: вернёт 70 % за 3 месяца','instalments: 70% back over 3 months')}</small></button>
    <button class="btn noenter" data-ra="dec" data-id="${e.id}" data-v="evict">🚪 ${L('Выселить','Evict')}<small>${L('месяц и 20 000 ₽, потом новый жилец','a month and 20,000 ₽, then a new tenant')}</small></button></div></div>`;
  return '';}

/* ---------------- покупка: «ипотека или свои» ---------------- */
function remain(a,r,pmt,k){const i=r/12;if(!a)return 0;if(!i)return Math.max(0,a-pmt*k);const q=Math.pow(1+i,k);return Math.max(0,a*q-pmt*(q-1)/i);}
function yearRet(f){const b1=f.loan?f.loan-remain(f.loan,f.rate,f.pmt,12):0;return f.own>0?(f.cf*12+f.P*GROW+b1)/f.own:0;}
function openBuy(cls,c,price,offId){const w=W();if(!w)return;snd('tap');
  const B=ST.buy&&ST.buy.cls===cls&&ST.buy.c===c&&ST.buy.offId===offId?ST.buy:(ST.buy={cls,c,price,offId,down:1,n:180});
  const av=E.reAvail(w,cls,c),C=E.RE_CLS[cls];
  const fo=E.reForecast(w,cls,c,1,180,price),dm=B.down<1?B.down:.2,fm=E.reForecast(w,cls,c,dm,B.n,price),f=B.down<1?fm:fo;
  const dayR=E.reDaily(cls,c)?E.reDayC(w,cls,c):0;
  let h=`<h2>${ICO[cls]} ${esc(clsN(cls))}</h2><p class="mut" style="text-align:center;margin-top:0">${esc(cityN(c))} · ${C.m2} ${L('м²','m²')} · ${M(Math.round(fo.P/C.m2/1e3)*1e3)} ${L('за м²','per m²')}</p>
    <div class="tiles"><div class="tile"><span>${L('Цена','Price')}</span><b class="num">${M(fo.P)}</b></div><div class="tile"><span>${L('Аренда в месяц','Rent per month')}</span><b class="num">${M(fo.rent)}</b></div></div>
    <p class="re-note">${L('Доходность аренды','Rental yield')}: ${pc(fo.gy,1)} ${L('в год до расходов','a year before costs')}, ${pc(fo.ny,1)} ${L('после','after')}. ${L('Цены растут в среднем на 7 % в год.','Prices grow about 7% a year on average.')}${dayR?' '+L('Посуточно','Short-term')+': '+M(dayR)+L(' за сутки.',' a night.'):''}${C.com?' '+L('Арендатора ищут 3–9 месяцев.','Finding a tenant takes 3–9 months.'):''}</p>`;
  h+=`<div class="re-sec">${L('Как платим','How we pay')}</div><div class="pick re-pick">${[[1,L('Всё своими','All cash')],[.5,L('Ипотека','Mortgage'),'50 %'],[.3,L('Ипотека','Mortgage'),'30 %'],[.2,L('Ипотека','Mortgage'),'20 %']].map(([d,t,s])=>`<button data-ra="down" data-v="${d}" class="${B.down===d?'on':''}">${t}${s?`<small>${L('взнос','down')} ${s}</small>`:''}</button>`).join('')}</div>`;
  if(B.down<1)h+=`<div class="pick re-pick4">${E.RE_TERMS.map(n=>`<button data-ra="term" data-v="${n}" class="${B.n===n?'on':''}">${n/12} ${pl(n/12,'год','года','лет','year','years')}</button>`).join('')}</div>`;
  // сравнение: всё своими / ипотека
  const cell=(v,sign)=>{if(v==null)return '<td class="re-gray">—</td>';if(!sign)return `<td class="num">${M(v)}</td>`;return `<td class="num ${v>=0?'pos':'neg'}">${v>=0?'+':'−'}${M(Math.abs(v))}</td>`;};
  const rt=x=>`<td class="num ${x>=0?'pos':'neg'}">${x>=0?'':'−'}${pc(Math.abs(x),1)}</td>`;
  h+=`<table class="re-cmp"><tr><th></th><th>${L('Свои','Cash')}</th><th>${L('Ипотека','Mortgage')}<br><small class="re-gray">${Math.round(dm*100)} % · ${pc(fm.rate,1)}</small></th></tr>
    <tr><td>${L('Нужно денег сейчас','Cash needed now')}</td>${cell(fo.own)}${cell(fm.own)}</tr>
    <tr><td>${L('Платёж банку в месяц','Monthly bank payment')}</td>${cell(null)}${cell(fm.pmt)}</tr>
    <tr><td>${L('Аренда на руки в месяц','Rent in hand per month')}<br><span class="re-note">${L('после простоя, налога на имущество, страховки','after vacancies, property tax, insurance')}</span></td>${cell(fo.rentNet)}${cell(fm.rentNet)}</tr>
    <tr><td><b>${L('Итого в месяц','Net per month')}</b></td>${cell(fo.cf,1)}${cell(fm.cf,1)}</tr>
    <tr><td>${L('Доход на свои деньги в год, с ростом цен','Return on own cash a year, with price growth')}</td>${rt(yearRet(fo))}${rt(yearRet(fm))}</tr>
    <tr><td>${L('Свои деньги вернутся — с ростом цен','Own cash back — with price growth')}</td><td>${yrs(fo.pb1)}</td><td>${yrs(fm.pb1)}</td></tr>
    <tr><td>${L('… если цены стоят на месте','… if prices stay flat')}</td><td class="re-gray">${yrs(fo.pb0)}</td><td class="re-gray">${yrs(fm.pb0)}</td></tr></table>`;
  // слово Людмилы (и Сони, если есть сюжет)
  if(fm.cf<0)h+=say(L(`Ипотека: каждый месяц доплачиваем <b>${M(-fm.cf)}</b> из своего кармана. Зарабатываем, только если квартира дорожает быстрее, чем мы доплачиваем. Выгодна ипотека, когда ставка упадёт, цены быстро растут или это коммерция с доходностью 11 %.`,`Mortgage: every month we top up <b>${M(-fm.cf)}</b> from our own pocket. We only earn if the flat gains value faster than we pay in. A mortgage pays off when rates fall, prices rise fast, or it’s commercial property yielding 11%.`),'worry');
  else h+=say(L('Ипотека здесь сама себя кормит: аренда покрывает платёж. Но помните про простой и ремонты.','Here the mortgage pays for itself: rent covers the payment. But remember vacancies and repairs.'),'calm');
  if(fm.rate>=.16&&w.fr&&w.fr.owl)h+=`<p class="re-note">🦉 ${L(`Соня: «Под ${pc(fm.rate,1)} сдавать — себе в убыток. Подождите снижения ставки». Льготной семейной ипотеки 6 % инвестору не положено.`,`Sonya: “Letting at ${pc(fm.rate,1)} is a loss. Wait for the rate to drop.” The 6% family mortgage isn’t for investors.`)}</p>`;
  // покупка
  let why='';if(av!=='ok')why=lockWhy(w,av,cls,c);else if(!E.reOpen(w))why=L('недвижимость пока закрыта','real estate is closed for now');
  else if(w.cash<f.own)why=L('не хватает денег: нужно ','not enough money: you need ')+M(f.own);
  else if(f.loan&&!f.ok)why=L(`банк не одобрит: платёж ${M(f.pmt)} больше, чем позволяет доход (до ${M(f.cap)} в месяц). Возьмите взнос больше или срок длиннее.`,`the bank won’t approve: the payment of ${M(f.pmt)} is more than your income allows (up to ${M(f.cap)} a month). Put more down or take a longer term.`);
  if(why)h+=`<div class="re-warn">${esc(why)}</div>`;
  h+=`<div class="row"><button class="btn accent noenter" data-ra="buy"${why?' disabled':''}>${L('Купить','Buy')} ${L('за','for')} ${M(f.P)}${f.loan?`<small>${L('своих','own cash')} ${M(f.own)} + ${L('ипотека','mortgage')} ${M(f.loan)}</small>`:`<small>${L('плюс оформление 1 %','plus 1% fees')}</small>`}</button>
    <button class="btn" data-ra="close" data-esc>${L('Закрыть','Close')}</button></div>`;
  modal(h);setRe(()=>openBuy(cls,c,price,offId));}
function doBuy(){const w=W(),B=ST.buy;if(!w||!B)return;
  const r=B.offId?GAME.act('reBuyOffer',B.offId,{down:B.down,n:B.n}):GAME.act('reBuy',B.cls,B.c,{down:B.down,n:B.n},B.price);
  if(r==='ok'){snd('coin');try{buzz&&buzz(30);}catch(e){}hideModal();ST.buy=null;ST.tab='my';rr();
    toast(E.RE_CLS[B.cls].com?L('Помещение ваше! Ищем арендатора — это может занять несколько месяцев.','The unit is yours! Looking for a tenant — it can take months.'):L('Квартира ваша! Ищем жильца: 2–6 недель.','The flat is yours! Looking for a tenant: 2–6 weeks.'));}
  else fail(r);}
function fail(r){snd('no');const t={cash:L('Не хватает денег','Not enough money'),bank:L('Банк не одобрил ипотеку','The bank declined the mortgage'),stage:L('Пока недоступно','Not available yet'),city:L('Пока только в своём городе','Only in your home city for now'),
  live:L('Жить можно только в одной квартире — и только до «Недр»','You can live in only one flat — and only before Mining'),ren:L('Сначала закончим ремонт','Finish the renovation first'),no:L('Не получилось','That didn’t work')};toast(t[r]||t.no);}

/* ---------------- мой объект ---------------- */
function setBtn(ra,id,on,t,sub,extra){return `<button class="re-set noenter" data-ra="${ra}" data-id="${id}"${extra||''}><span>${t}${sub?`<small>${sub}</small>`:''}</span><i class="${on?'':'off'}">${on?L('вкл','on'):L('выкл','off')}</i></button>`;}
function openObj(id){const w=W();if(!w)return;const o=w.re.find(x=>x.id===id);if(!o){hideModal();rr();return;}
  const C=E.RE_CLS[o.cls],i=E.reObjInfo(w,o),[st,stk]=stateTxt(w,o),lm=o.lm;
  let h=`<h2>${ICO[o.cls]} ${esc(clsN(o.cls))}</h2><p class="mut" style="text-align:center;margin-top:0">${esc(cityN(o.c))} · ${C.m2} ${L('м²','m²')} · <span class="tag ${stk}">${esc(st)}</span></p>`;
  h+=`<div class="tiles"><div class="tile ${lm?(lm.net>=0?'pos':'neg'):''}"><span>${L('Итог за месяц','Last month, net')}</span><b class="num">${lm?(lm.net>=0?'+':'−')+M(Math.abs(lm.net)):'—'}</b></div>
    <div class="tile"><span>${L('Рыночная цена','Market value')}</span><b class="num">${M(i.mv)}</b></div></div>`;
  h+=`<div class="facts"><span>${L('Куплено','Bought')}</span><b>${M(o.p0)} · ${FMT.date(o.m0)}</b>
    <span>${L('В балансе','On the books')}</span><b>${M(i.bk)} <span class="re-gray">(${i.res>=0?L('резерв +','reserve +'):L('ниже на ','below by ')}${M(Math.abs(i.res))})</span></b>
    <span>${o.mode==='day'?L('Доход посуточно','Short-let income'):L('Аренда в месяц','Rent per month')}</span><b>${o.mode==='live'?'—':'~'+M(i.rent)}</b>
    <span>${L('Свежесть ремонта','Condition')}</span><b>${Math.round(o.fr)} %${o.fr<60?' <span class="bad">'+L('аренда −15 %','rent −15%')+'</span>':''}</b>
    ${o.mode==='day'?`<span>${L('Рейтинг','Rating')}</span><b>${(o.rt||4.5).toFixed(1).replace('.',LANG==='en'?'.':',')} ★ · ${L('загрузка','occupancy')} ${pc(E.reOcc(o),0)}</b>`:''}
    ${i.loan?`<span>${L('Ипотека','Mortgage')}</span><b>${M(i.loan.a)} · ${pc(i.loan.r,1)}</b><span>${L('Платёж в месяц','Monthly payment')}</span><b>${M(i.pmt)}</b>`:''}</div>`;
  if(lm)h+=`<p class="re-note">${L('Прошлый месяц','Last month')}: ${o.mode==='live'?L('сэкономили на съёме ','saved on renting ')+M(lm.save):L('доход ','income ')+M(lm.rev)}, ${L('расходы ','costs ')}${M(lm.cost)}${lm.mi+lm.mb?', '+L('ипотека ','mortgage ')+M(lm.mi+lm.mb):''}.</p>`;
  const busy=!!(o.ren||o.sl);
  // режим
  if(!busy&&!C.com){const md=[['long',L('Долгосрочно','Long-term'),''],['day',L('Посуточно','Short-term'),E.reDaily(o.cls,o.c)?'':'x'],['live',L('Живу сам','Live here'),E.reLiveOk(w,o)?'':'x']];
    h+=`<div class="re-sec">${L('Как сдаём','How we let it')}</div><div class="pick">${md.map(([k,t,x])=>`<button data-ra="mode" data-id="${o.id}" data-v="${k}" class="${o.mode===k?'on':''}"${x&&o.mode!==k?' disabled':''}>${t}</button>`).join('')}</div>
      <p class="re-note">${o.mode==='day'?L('Посуточно: доход в 1,5–2 раза выше, но загрузка 50–55 % (с управляющей — 65–75 %), уборка 1 000 ₽ за заезд, площадка берёт 15 %, износ втрое быстрее.','Short-term: 1.5–2× the income, but 50–55% occupancy (65–75% with a manager), 1,000 ₽ cleaning per stay, the platform takes 15%, wear is 3× faster.')
        :o.mode==='live'?L(`Своё жильё — не доход, а экономия: не платим за съём ~${M(E.reLiveSave(o))} в месяц.`,`Your own home isn’t income but savings: ~${M(E.reLiveSave(o))} a month not spent on rent.`)
        :L('Долгосрочно: жилец платит каждый месяц, съезжает раз в 1–2 года, нового ищем 2–6 недель.','Long-term: the tenant pays monthly, moves out every 1–2 years, a new one takes 2–6 weeks.')}</p>`;}
  if(o.mode!=='live'){h+=`<div class="re-sec">${L('Решения','Decisions')}</div>`;
    h+=setBtn('uk',o.id,o.uk,L('Управляющая компания','Management company'),o.mode==='day'?L('берёт 20 % дохода, загрузка выше','takes 20% of income, higher occupancy'):L('берёт ~8 % аренды, жильца ищет быстрее','takes ~8% of rent, finds tenants faster'));
    h+=setBtn('ins',o.id,o.ins,L('Страховка','Insurance'),L('покрывает «затопили соседи» и порчу гостями','covers flooding by neighbours and guest damage'));}
  h+='<div class="re-btns">';
  if(E.RE_CLS[o.cls].res&&o.mode==='long'&&!busy){if(!o.chk){h+=`<button class="btn noenter" data-ra="chk" data-id="${o.id}">🔎 ${L('Проверить следующего жильца: 2 000 ₽','Check the next tenant: 2,000 ₽')}<small>${L('риск «не платит» 6 % → 1 %','“won’t pay” risk 6% → 1%')}</small></button>`;
      if(adOkS())h+=`<button class="btn noenter" data-ra="chkAd" data-id="${o.id}">📺 ${L('Людмила проверит жильца — за рекламу','Lyudmila checks the tenant — for an ad')}</button>`;}
    else h+=`<p class="re-note">✅ ${L('Следующего жильца проверим.','We’ll check the next tenant.')}</p>`;}
  if(E.reBoostOk(w,o.id)&&adOkS())h+=`<button class="btn noenter" data-ra="boost" data-id="${o.id}">📺 ${L('Поднять объявление — за рекламу','Boost the listing — for an ad')}<small>${L('жилец за 3 дня','a tenant in 3 days')}</small></button>`;
  // ремонт
  if(o.ren){h+=`<p class="re-note">🛠 ${L('Ремонт','Renovation')}: ${L('ещё ','')}${days(o.ren.left)}${L('',' left')}.</p>`;if(E.reRushOk(w,o.id))h+=`<button class="btn cr noenter" data-ra="rush" data-id="${o.id}">💎 ${RUSH} · ${L('Срочный ремонт — вдвое быстрее','Rush renovation — twice as fast')}</button>`;}
  else if(!o.sl){for(const k of ['cos','key','des'])if(E.reRenoOk(w,o,k)==='ok'){const c=E.reRenoCost(w,o,k),R=E.RE_RENO[k];
      const what=k==='cos'?L('свежесть 100 %, аренда +10 %','condition 100%, rent +10%'):k==='key'?L('класс выше: аренда +30 %, цена +15 %','a class up: rent +30%, price +15%'):L('аренда +50 %, цена +25 % к базе','rent +50%, price +25% over base');
      h+=`<button class="btn noenter" data-ra="reno" data-id="${o.id}" data-v="${k}"${w.cash<c?' disabled':''}>🛠 ${L(R.n,R.en)}: ${M(c)}, ${days(R.days)}<small>${what}${k==='cos'?L(' · расход месяца',' · an expense'):L(' · вложение в объект',' · added to the property')}</small></button>`;}}
  // ипотека: досрочно
  if(i.loan)h+=`<button class="btn noenter" data-ra="repay" data-id="${o.id}"${w.cash<i.loan.a?' disabled':''}>🏦 ${L('Погасить ипотеку целиком','Repay the mortgage in full')}: ${M(i.loan.a)}<small>${L('без штрафа; частично — в «Финансы → Банк»','no penalty; partial — in Finance → Bank')}</small></button>`;
  // продажа
  if(o.sl)h+=`<button class="btn" data-ra="unsell" data-id="${o.id}">${L('Снять с продажи','Take off the market')}<small>${L('покупателя ищем ещё ','buyer search: ')}${days(o.sl.left)}</small></button>`;
  else if(!o.ren)h+=`<button class="btn noenter" data-ra="sell" data-id="${o.id}">🏷 ${L('Продать','Sell')}<small>${L('≈ ','≈ ')}${M(i.mv)}, ${L('покупателя ищем 1–3 месяца','finding a buyer takes 1–3 months')}</small></button>`;
  h+=`</div><div class="row"><button class="btn" data-ra="close" data-esc>${L('Закрыть','Close')}</button></div>`;
  modal(h);setRe(()=>openObj(id));}
function confirmSell(id){const w=W(),o=w&&w.re.find(x=>x.id===id);if(!o)return;const i=E.reObjInfo(w,o);
  const tax=w.me&&w.taxm==='usn6'&&!(E.RE_CLS[o.cls].res&&w.m-o.m0>=60);
  modal(`<h2>🏷 ${L('Продать?','Sell?')}</h2><p>${esc(clsN(o.cls))}, ${esc(cityN(o.c))}. ${L('Цена — рыночная минус 0–5 % на торг: около ','Price is market minus 0–5% haggling: about ')}<b>${M(i.mv)}</b>. ${L('Покупателя ищем 1–3 месяца, жилец съезжает.','Finding a buyer takes 1–3 months; the tenant moves out.')}</p>
    ${i.loan?`<p>${L('Ипотеку','The mortgage')} (${M(i.loan.a)}) ${L('банк погасит из суммы сделки.','will be repaid from the sale.')}</p>`:''}
    <p class="re-note">${L('Прибыль к цене в балансе','Gain over book value')} (${M(i.bk)}) ${L('попадёт в «прочие доходы».','goes to “other income”.')} ${tax?L('УСН 6 % — с цены продажи (жильё, которым владели 5 лет, — без налога).','Simplified tax 6% on the sale price (homes held 5+ years are tax-free).'):''}</p>
    <div class="row"><button class="btn accent noenter" data-ra="sellOk" data-id="${id}">${L('Выставить на продажу','Put up for sale')}</button><button class="btn" data-ra="obj" data-id="${id}" data-esc>${L('Отмена','Cancel')}</button></div>`);
  setRe(()=>confirmSell(id));}
function confirmRepay(id){const w=W(),o=w&&w.re.find(x=>x.id===id),l=o&&o.mort&&w.loans.find(x=>x.id===o.mort);if(!l)return openObj(id);
  modal(`<h2>🏦 ${L('Погасить ипотеку?','Repay the mortgage?')}</h2><p>${L('Отдадим банку ','We pay the bank ')}<b>${M(l.a)}</b> ${L('сразу. Платёж и проценты больше не нужны, но деньги «заморозятся» в квартире.','now. No more payments or interest, but the money gets locked in the flat.')}</p>
    <div class="row"><button class="btn accent noenter" data-ra="repayOk" data-id="${id}">${L('Погасить','Repay')} ${M(l.a)}</button><button class="btn" data-ra="obj" data-id="${id}" data-esc>${L('Отмена','Cancel')}</button></div>`);
  setRe(()=>confirmRepay(id));}

/* ---------------- клики ---------------- */
function adOkS(){try{return typeof adOk==='function'&&adOk();}catch(e){return false;}}
function setRe(f){try{modalRe=f;}catch(e){}}
function rr(){const el=byId('scr-re');if(el&&el.classList.contains('on'))render(el);entries();}
function act(){let r;try{r=GAME.act.apply(GAME,arguments);}catch(e){console.error(e);r='no';}return r;}
function onClick(e){const b=e.target.closest&&e.target.closest('[data-ra]');if(!b||b.disabled)return;const a=b.dataset.ra,id=b.dataset.id,v=b.dataset.v,w=W();if(!w)return;
  switch(a){
    case 'open':snd('tap');open();break;
    case 'back':back();break;
    case 'close':snd('tap');hideModal();rr();break;
    case 'tab':snd('tap');ST.tab=v;rr();break;
    case 'city':snd('tap');ST.city=v;rr();break;
    case 'cls':openBuy(v,ST.city||w.home||'kuz');break;
    case 'offer':{const z=w.reOff.find(x=>x.id===id);if(z)openBuy(z.cls,z.c,z.pr,z.id);break;}
    case 'down':snd('tap');if(ST.buy){ST.buy.down=+v;openBuy(ST.buy.cls,ST.buy.c,ST.buy.price,ST.buy.offId);}break;
    case 'term':snd('tap');if(ST.buy){ST.buy.n=+v;openBuy(ST.buy.cls,ST.buy.c,ST.buy.price,ST.buy.offId);}break;
    case 'buy':doBuy();break;
    case 'obj':snd('tap');openObj(id);break;
    case 'mode':{const r=act('reMode',id,v);if(r!=='ok')fail(r);else snd('tap');openObj(id);break;}
    case 'uk':{const o=w.re.find(x=>x.id===id);if(o){act('reUK',id,!o.uk);snd('tap');}openObj(id);break;}
    case 'ins':{const o=w.re.find(x=>x.id===id);if(o){act('reIns',id,!o.ins);snd('tap');}openObj(id);break;}
    case 'chk':{const r=act('reChk',id,false);if(r==='ok'){snd('coin');toast(L('Следующего жильца проверим','We’ll check the next tenant'));}else fail(r);openObj(id);break;}
    case 'chkAd':if(adOkS()){STAT.place('rechk');showRewarded(()=>{const r=act('reChk',id,true);if(r==='ok'){snd('coin');toast(L('Людмила проверит жильца','Lyudmila will check the tenant'));}openObj(id);});}break;
    case 'boost':if(adOkS()){STAT.place('reboost');showRewarded(()=>{const r=act('reBoost',id);if(r==='ok'){snd('coin');toast(L('Объявление поднято: жилец через 3 дня','Listing boosted: a tenant in 3 days'));}openObj(id);});}break;
    case 'reno':{const r=act('reReno',id,v);if(r==='ok'){snd('build');toast(L('Ремонт начался','Renovation started'));}else fail(r);openObj(id);break;}
    case 'rush':{if(!E.reRushOk(w,id))break;if(!GAME.spend(RUSH,'rerush')){snd('no');toast(L('Не хватает 💎','Not enough 💎'));break;}act('reRush',id);snd('build');toast(L('Ремонт ускорен вдвое','Renovation sped up 2×'));openObj(id);break;}
    case 'repay':snd('tap');confirmRepay(id);break;
    case 'repayOk':{const o=w.re.find(x=>x.id===id),l=o&&o.mort&&w.loans.find(x=>x.id===o.mort);if(l){const r=act('repay',l.id,l.a);if(r==='ok'){snd('coin');toast(L('Ипотека погашена','Mortgage repaid'));}else fail(r);}openObj(id);break;}
    case 'sell':snd('tap');confirmSell(id);break;
    case 'sellOk':{const r=act('reSell',id);if(r==='ok'){snd('gavel');toast(L('Выставили на продажу: 1–3 месяца','Up for sale: 1–3 months'));hideModal();rr();}else fail(r);break;}
    case 'unsell':{act('reSellCancel',id);snd('tap');openObj(id);break;}
    case 'dec':{const r=act('reDecide',id,v);if(r==='ok'){snd(v==='pay'||v==='evict'?'coin':'tap');}rr();break;}
  }}

/* ---------------- вход: карточка наверху «Бизнеса»/«Объектов» ---------------- */
function entryHtml(w){const S2=E.reSum(w);
  return `<span class="re-i">🏠</span><span class="re-t"><b>${L('Недвижимость','Real estate')}</b><span>${S2.n?S2.n+' '+pl(S2.n,'объект','объекта','объектов','property','properties')+' · '+(S2.net>=0?'+':'−')+M(Math.abs(S2.net))+L(' в месяц',' a month'):L('квартиры и помещения: купить и сдавать','flats and units to buy and let')}${w.reEv.length?' · ⚠️':''}</span></span><span class="re-go">›</span>`;}
let entBusy=false,entT=0;
function entries(){if(entBusy)return;const w=W();if(!w)return;entBusy=true;try{E.reMigrate(w,[]);const on=E.reOpen(w);
  // до «Недр» — на экране «Бизнес» (если он есть), в «Недрах» — на «Объектах»
  const want=!w.ned&&byId('scr-biz')?'scr-biz':'scr-obj';
  for(const sid of ['scr-biz','scr-obj']){const s=byId(sid);if(!s)continue;let b=s.querySelector(':scope > .re-entry');
    if(!on||sid!==want){if(b)b.remove();continue;}
    const html=entryHtml(w);
    if(!b){b=document.createElement('button');b.className='card tap re-row re-entry';b.dataset.ra='open';
      // пока своей недвижимости нет — карточка внизу, под точками (на счёте мало денег — не главное действие)
      if(E.reSum(w).n)s.insertBefore(b,s.firstChild);else s.appendChild(b);}
    if(b.dataset.h!==html){b.innerHTML=html;b.dataset.h=html;}}}
  catch(e){console.error(e);}entBusy=false;}

/* ---------------- новости ---------------- */
function newsText(n){if(!n||n.k!=='re')return '';const a=n.a||{},nm=a.cls?clsN(a.cls)+(a.c?', '+cityN(a.c):''):'';
  switch(a.k){
    case 'buy':return L(`Куплено: ${nm} за ${M(a.pr)}${a.loan?`, ипотека ${M(a.loan)}`:''}.`,`Bought: ${nm} for ${M(a.pr)}${a.loan?`, mortgage ${M(a.loan)}`:''}.`);
    case 'sold':return L(`Продано: ${nm} за ${M(a.pr)} (${a.gain>=0?'прибыль':'убыток'} ${M(Math.abs(a.gain))}).`,`Sold: ${nm} for ${M(a.pr)} (${a.gain>=0?'gain':'loss'} ${M(Math.abs(a.gain))}).`);
    case 'reno':return L(`Ремонт закончен: ${nm}.`,`Renovation finished: ${nm}.`);
    case 'out':return L(`Жилец съехал: ${nm}. Ищем нового.`,`Tenant moved out: ${nm}. Looking for a new one.`);
    case 'ev_flood':return L(`Соседи затопили: ${nm}, ремонт ${M(a.a)}.`,`Flooded by neighbours: ${nm}, repairs ${M(a.a)}.`);
    case 'flood_ins':return L(`Соседи затопили: ${nm} — ремонт оплатила страховка.`,`Flooded by neighbours: ${nm} — insurance paid.`);
    case 'ev_np':return L(`Жилец не платит: ${nm}, долг ${M(a.a)}.`,`Tenant isn’t paying: ${nm}, owes ${M(a.a)}.`);
    case 'party':return L(`Посуточники устроили вечеринку: ${nm}${a.a?`, ремонт ${M(a.a)}`:''}. Рейтинг −0,3.`,`Short-let guests threw a party: ${nm}${a.a?`, repairs ${M(a.a)}`:''}. Rating −0.3.`);
    case 'cap':return L(`Капремонт дома: ${nm}, взнос ${M(a.a)}. Квартира подорожала на 3 %.`,`Building overhaul: ${nm}, fee ${M(a.a)}. Value +3%.`);
    case 'cheap':return L(`Сосед продаёт дёшево: ${nm} за ${M(a.pr)}. Две недели на решение.`,`A neighbour sells cheap: ${nm} for ${M(a.pr)}. Two weeks to decide.`);
    case 'court':return L(`Суд выигран: ${nm}, вернули ${M(a.a)}.`,`Court case won: ${nm}, ${M(a.a)} returned.`);
    case 'keydn':return L('Ключевую снизили — квартиры подорожали на 4 %.','The key rate was cut — property prices +4%.');
    case 'cool':return L('Рынок жилья остыл: полгода цены будут снижаться.','The housing market cooled: prices will slide for half a year.');
    case 'lgot':return L('Льготы на новостройки свернули — цены −3 %.','New-build subsidies ended — prices −3%.');
    case 'zhkh':return L('С 1 октября коммуналка подорожала на 9,9 %.','From 1 October utilities are up 9.9%.');
    case 'tolong':return L(`${nm}: в «Недрах» живём в другом месте — квартиру снова сдаём.`,`${nm}: in Mining we live elsewhere — the flat is let again.`);}
  return '';}
function hookAdv(){try{if(window.ADV&&typeof ADV.news==='function'&&!ADV.news._re){const f=ADV.news;const g=function(n){if(n&&n.k==='re'){const t=newsText(n);return t?FMT.mon(n.m)+' · '+t:'';}return f.apply(this,arguments);};g._re=1;ADV.news=g;}}catch(e){}}

/* ---------------- запуск ---------------- */
function init(){css();screen();hookAdv();
  document.addEventListener('click',onClick);
  if(window.GAME&&GAME.on){GAME.on('change',rr);GAME.on('day',rr);GAME.on('close',rr);}
  // карточка-вход: экраны перерисовывает ui.js/biz-ui.js — возвращаем её после каждой перерисовки
  const m=byId('main');if(m)new MutationObserver(muts=>{if(entBusy||entT)return;for(const x of muts){const t=x.target;if(t&&(t.id==='scr-obj'||t.id==='scr-biz')){entT=setTimeout(()=>{entT=0;entries();},0);break;}}}).observe(m,{childList:true,subtree:true});
  new MutationObserver(()=>rr()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  entries();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

window.REALTY_UI={open,render,newsText,entries,openObj,openBuy,navKey:s=>s==='re'?ST.tab||'':''};   // M37: navKey — подвид для памяти прокрутки
})();
