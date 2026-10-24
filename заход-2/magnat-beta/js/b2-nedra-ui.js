/* b2-nedra-ui.js — вид NEDRA (грузится b2-nedra.js по требованию, когда мир в «Недрах»). Модель — b2-nedra-m.js. Договор — logs/NEDRA.md.
   • Тексты советов b2up / b2dz / b2idle и chain (честные цифры) — обёртка ADV.text; новости b2deep / b2dz / b2dzok / b2buy — ADV.news.
   • Тексты событий с новыми параметрами (export k %, eco вероятность, refi пункты, union все рудники, rail скидка, tip окупаемость) и новое sell — window.NEDTXT.
   • Куда ведут советы — WHY_GO (ui.js отдаёт его в B2.nedra.go, крючок «b2-nedra»).
   • Кнопки: «🔎 Доразведать запас» в карточке рудника, «🔎 Искать глубже» на пустом участке, строка «окупится за N мес.» у модернизации,
     «Людмила советует» сверху окна «Завод» (и ⚠-карточки без зелёной кнопки), окно «💡 Куда вложить» (дела с окупаемостью), строка на «Сегодня» (гнездо today).
   Для 45+: шрифт ≥ 16 px, кнопки ≥ 48 px. Нажатия — data-b2="nedra:…". */
(function(){'use strict';
if(typeof window==='undefined'||typeof document==='undefined')return;   // jsc (симуляторы грузят все b2-*): вид не нужен
const E=window.ECON,N=window.B2&&B2.nedra;if(!E||!N||!N.M||N.UI)return;
const w=()=>GAME.W,$$=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const M=x=>FMT.money(x),Q=(q,g)=>FMT.qty(q,g),low=s=>{s=String(s||'');return s.charAt(0).toLowerCase()+s.slice(1);};
const days=n=>n+' '+pl(n,'день','дня','дней','day','days'),mons=n=>n+' '+pl(n,'месяц','месяца','месяцев','month','months');
const snd=k=>{try{if(SND&&SND[k])SND[k]();}catch(e){}};
const face=m=>{try{return UI.face(m);}catch(e){return '';}};
const RIN={kuz:['в Кузбассе','in Kuzbass'],ural:['на Урале','in the Urals'],kar:['в Карелии','in Karelia']};
const rin=r=>RIN[r]?L(RIN[r][0],RIN[r][1]):NM.reg(r);
const on=W=>!!W&&W.ned&&W.n5&&!B2.off('nedra');
function act(name,...a){try{return GAME.act(name,...a);}catch(e){console.error(e);return null;}}

/* ---------- дело одной строкой ---------- */
function dealTxt(d){const nm=low(NM.obj(d.t||''));
  if(d.k==='up')return L(`⬆ Модернизация: ${nm} ${rin(d.r)} — +${M(d.m)} в месяц, окупится ≈ за ${mons(d.pb)}`,`⬆ Upgrade the ${nm} ${rin(d.r)}: +${M(d.m)} a month, pays back in ≈ ${mons(d.pb)}`);
  if(d.k==='mine')return L(`⛏ Построить: ${nm} ${rin(d.r)} на своей лицензии — +${M(d.m)} в месяц, окупится ≈ за ${mons(d.pb)}`,`⛏ Build a ${nm} ${rin(d.r)} on your licence: +${M(d.m)} a month, pays back in ≈ ${mons(d.pb)}`);
  if(d.k==='plant')return L(`🏭 Завод: ${nm} ${rin(d.r)} — +${M(d.m)} в месяц, окупится ≈ за ${mons(d.pb)}${d.pbF&&d.pbF<d.pb?`, с займом ФРП — за ${mons(d.pbF)}`:''}${d.far?' (своё сырьё — поездом: понадобится маршрут)':''}`,`🏭 Plant: ${nm} ${rin(d.r)}: +${M(d.m)} a month, pays back in ≈ ${mons(d.pb)}${d.pbF&&d.pbF<d.pb?`, with the IDF loan in ${mons(d.pbF)}`:''}${d.far?' (own raw by rail: needs a route)':''}`);
  if(d.k==='dz')return L(`🔎 Доразведать запас: ${nm} ${rin(d.r)} — ещё ≈ ${mons(d.mon)} работы`,`🔎 Survey more reserves at the ${nm} ${rin(d.r)}: ≈ ${mons(d.mon)} more work`);
  if(d.k==='expl')return L(`🧭 Разведать участок ${rin(d.r)} (свободных: ${d.n})`,`🧭 Explore a plot ${rin(d.r)} (${d.n} left)`);
  if(d.k==='deep')return L(`🔎 Искать глубже на пустом участке ${rin(d.r)}: шанс найти ≈ ${Math.round(d.ch*100)} %`,`🔎 Dig deeper on an empty plot ${rin(d.r)}: ≈ ${Math.round(d.ch*100)}% chance to find something`);
  return '';}
function kindTxt(d){return d.kind==='loan'?L(' · нужен проектный кредит',' · needs a project loan'):'';}
function goDeal(d){snd('tap');hideModal();const G=B2.whyGo&&B2.whyGo.hl;
  if(d.k==='up'||d.k==='dz'){if(G)G('obj',null,'#ob-'+d.o+(d.k==='up'?' [data-a="up"]':''))();else UI.go('obj');if(d.k==='dz')setTimeout(()=>dzOpen(d.o),400);return;}
  if(d.k==='mine'){if(G)G('reg',d.r,'#pl-'+d.pid+' [data-a="bmine"]')();else UI.openRegion(d.r);return;}
  if(d.k==='plant'){UI.openRegion(d.r);setTimeout(()=>{try{UI.openFac(d.r);}catch(e){}},250);return;}
  if(d.k==='expl'){if(G)G('reg',d.r,'#pl-'+d.pid+' [data-a="expl"]')();else UI.openRegion(d.r);return;}
  if(d.k==='deep'){UI.openRegion(d.r);setTimeout(()=>deepOpen(d.pid),300);return;}}

/* ---------- окно «💡 Куда вложить» ---------- */
let last=[];
function dealsOpen(){const W=w();if(!on(W))return;const id=N.idle(W),ds=N.deals(W,3);last=ds;snd('tap');
  let h=`<h2>💡 ${L('Куда вложить','Where to invest')}</h2>`;
  if(id)h+=`<p>${L(`Свободно ≈ <b>${M(id.free)}</b> — это ${mons(id.months)} прибыли. Деньги на счёте ничего не зарабатывают.`,`About <b>${M(id.free)}</b> is free — ${mons(id.months)} of profit. Cash on the account earns nothing.`)}</p>`;
  if(!ds.length)h+=`<div class="say">${face('calm')}<div><p><b>${L('Людмила Санна','Lyudmila Sanna')}:</b> ${L('Сейчас выгодных дел нет — всё, что окупается за 3 года, уже идёт. Можно погасить дорогой кредит.','No good deals right now — everything that pays back within 3 years is already under way. We could repay an expensive loan.')}</p></div></div>`;
  else{h+=`<div class="say">${face('happy')}<div><p><b>${L('Людмила Санна','Lyudmila Sanna')}:</b> ${L('Посчитала с учётом того, что наш выпуск собьёт цену. Начните с первого.','I’ve counted in that our own output will push the price down. Start with the first one.')}</p></div></div>`;
    ds.forEach((d,i)=>{h+=`<button class="btn ${i===0?'green':''} w noenter" data-b2="nedra:go:${i}" style="margin-top:8px;text-align:left">${esc(dealTxt(d))}<small>${d.c?M(d.c):''}${kindTxt(d)}</small></button>`;});}
  h+=`<div class="row"><button class="btn" data-esc onclick="hideModal()">${L('Закрыть','Close')}</button></div>`;
  modal(h);B2.ev('nedra','deals',{n:ds.length,k:ds[0]?ds[0].k:''});}

/* ---------- доразведка своего рудника ---------- */
function dzOpen(oid){const W=w(),x=N.M.dzOk(W,oid);if(!x){toast(L('Доразведка сейчас не нужна','No extra survey needed now'));return;}snd('tap');
  modal(`<h2>🔎 ${L('Доразведать запас','Survey more reserves')}</h2>
    <p>${L(`${NM.obj(x.o.t)} ${rin(x.o.r)}: запаса осталось на ≈ ${mons(x.left)}. Геологи пройдут глубже за <b>${M(x.c)}</b> и ${days(x.days)} — запас вырастет примерно на ${Q(x.add,x.p.dep.g)} (≈ ${mons(x.months)} работы). Стройка не нужна.`,`The ${low(NM.obj(x.o.t))} ${rin(x.o.r)} has ≈ ${mons(x.left)} of reserves left. Geologists will go deeper for <b>${M(x.c)}</b> in ${days(x.days)} — reserves grow by about ${Q(x.add,x.p.dep.g)} (≈ ${mons(x.months)} of work). No construction needed.`)}</p>
    <div class="say">${face(x.v>x.c*2?'happy':'calm')}<div><p><b>${L('Людмила Санна','Lyudmila Sanna')}:</b> ${x.v>x.c*2?L(`Рудник и так стоит — каждый лишний месяц даёт ≈ ${M(x.m)}. Берём.`,`The mine is already built — each extra month brings ≈ ${M(x.m)}. Let’s do it.`):L('Рудник сейчас почти ничего не приносит — я бы не торопилась.','The mine earns almost nothing now — I’d wait.')}</p></div></div>
    <div class="row"><button class="btn ${x.v>x.c*2?'green':''} noenter" data-b2="nedra:dzy:${oid}">${L('Доразведать','Survey')} · ${M(x.c)}</button><button class="btn" data-esc onclick="hideModal()">${L('Отмена','Cancel')}</button></div>`);}
function deepOpen(pid){const W=w(),x=N.M.deepOk(W,pid);if(!x){toast(L('Этот участок уже искали глубже','This plot was already surveyed deeper'));return;}snd('tap');
  modal(`<h2>🔎 ${L('Искать глубже','Dig deeper')}</h2>
    <p>${L(`Обычная разведка тут ничего не нашла. Глубокая — <b>${M(x.c)}</b> и ${days(x.days)}: шанс найти месторождение ≈ ${Math.round(x.ch*100)} % (обычно скромнее прежних). Найдём — торги, мы первооткрыватели. Пусто — деньги не вернут.`,`A normal survey found nothing here. A deep one costs <b>${M(x.c)}</b> and ${days(x.days)}: ≈ ${Math.round(x.ch*100)}% chance of a deposit (usually smaller than before). If found — an auction, we’re the finders. If empty — the money is gone.`)}</p>
    <div class="row"><button class="btn accent noenter" data-b2="nedra:deepy:${pid}">${L('Искать','Survey')} · ${M(x.c)}</button><button class="btn" data-esc onclick="hideModal()">${L('Отмена','Cancel')}</button></div>`);}
B2.click('nedra',(a,arg,el,ev)=>{const W=w();if(!W)return;
  if(a==='deals')return dealsOpen();
  if(a==='go'){const d=last[+arg];if(d)goDeal(d);return;}
  if(a==='dz')return dzOpen(arg);
  if(a==='deep')return deepOpen(arg);
  if(a==='dzy'||a==='deepy'){hideModal();const r=act(a==='dzy'?'b2dz':'b2deep',arg);
    if(r==='ok'){snd('coin');toast('🔎 '+L('Геологи выехали','The geologists are on their way'));B2.ev('nedra',a==='dzy'?'dz':'deep',{});try{UI.refresh();}catch(e){}}
    else if(r==='cash'){snd('no');toast(L('Не хватает денег','Not enough money'));}else{snd('no');toast(L('Сейчас нельзя','Not possible now'));}}});

/* ---------- кнопки в карточках (дорисовываем после перерисовки, как nedra-ui) ---------- */
function cards(){const W=w();if(!on(W))return;
  const so=$$('scr-obj');if(so&&so.classList.contains('on'))for(const o of W.obj){const c=$$('ob-'+o.id);if(!c||!c.classList.contains('open'))continue;
    const ub=c.querySelector('[data-a="up"]');if(ub&&!c.querySelector('.b2n-up')){const f=N.M.upFore(W,o);if(f){const p=document.createElement('p');p.className='b2n-up';p.style.cssText='font-size:16px;margin:6px 0 0';
      p.innerHTML=f.m>0&&f.pb<999?L(`📈 Модернизация даст ≈ <b>+${M(f.m)}</b> в месяц (своя добыча собьёт цену на ${FMT.pct(f.drop)}), окупится ≈ за <b>${mons(f.pb)}</b>.`,`📈 The upgrade adds ≈ <b>+${M(f.m)}</b> a month (your output pushes the price down ${FMT.pct(f.drop)}), pays back in ≈ <b>${mons(f.pb)}</b>.`)
        :f.m>0?L('⚠ Запаса не хватит, чтобы модернизация окупилась — сначала доразведка.','⚠ Not enough reserves for the upgrade to pay back — survey more first.'):L('⚠ Модернизация сейчас в убыток: рынок не возьмёт больше по хорошей цене.','⚠ The upgrade would lose money now: the market won’t take more at a good price.');
      ub.parentNode.parentNode.insertBefore(p,ub.parentNode.nextSibling);}}
    if(!c.querySelector('[data-b2^="nedra:dz"]')){const x=N.M.dzOk(W,o.id);if(x){const b=document.createElement('button');b.className='btn noenter w';b.style.marginTop='8px';b.setAttribute('data-b2','nedra:dz:'+o.id);
      b.innerHTML=`🔎 ${L('Доразведать запас','Survey more reserves')}<small>${M(x.c)} · ${L('осталось на','left for')} ${mons(x.left)}</small>`;c.appendChild(b);}}}
  const sr=$$('scr-reg');if(sr&&sr.classList.contains('on'))for(const x of N.M.deepList(W)){const c=$$('pl-'+x.p.id);if(!c||c.querySelector('[data-b2]'))continue;
    const b=document.createElement('button');b.className='btn sm noenter';b.setAttribute('data-b2','nedra:deep:'+x.p.id);b.innerHTML=`🔎 ${L('Искать глубже','Dig deeper')}<small>${M(x.c)} · ${L('шанс','chance')} ${Math.round(x.ch*100)} %</small>`;c.appendChild(b);}}
try{GAME.on('change',()=>setTimeout(cards,50));GAME.on('day',()=>setTimeout(cards,50));document.addEventListener('click',()=>setTimeout(cards,90));}catch(x){}
// окно «Завод»: сверху совет Людмилы по региону; на карточках с ⚠ кнопка не зелёная
function facFix(){const mc=$$('mcard');if(!mc||!mc.querySelector('[data-fac]')||mc.querySelector('.b2n-fac'))return;const W=w();if(!on(W))return;
  const h2=mc.querySelector('h2');const r=E.REG.find(x=>h2&&h2.textContent.indexOf(rin(x))>=0)||UI.reg;if(!r)return;
  let best=null;for(const t in E.OBJ){if(!E.OBJ[t].in)continue;const f=N.fore(W,t,r);if(f&&f.m>0&&(!best||f.pb<best.pb))best=f;}
  let txt;if(best&&best.pb<=60)txt=L(`Здесь выгоднее всего — ${low(NM.obj(best.t))}: ≈ +${M(best.m)} в месяц, окупится ≈ за ${mons(best.pb)}${best.pbF&&best.pbF<best.pb?` (с займом ФРП — за ${mons(best.pbF)})`:''}. Я считала со своим сырьём и с тем, что наш выпуск собьёт цену.`,`The best option here is a ${low(NM.obj(best.t))}: ≈ +${M(best.m)} a month, pays back in ≈ ${mons(best.pb)}${best.pbF&&best.pbF<best.pb?` (with the IDF loan in ${mons(best.pbF)})`:''}. I counted our own raw materials and the price drop from our output.`);
  else{const d=N.deals(W,1)[0];txt=L(`В этом регионе заводы сейчас не окупятся. ${d?'Выгоднее: '+dealTxt(d).replace(/^\S+\s/,'')+'.':'Сначала — свои рудники: со своим сырьём завод считается иначе.'}`,`Plants won’t pay back in this region now. ${d?'Better: '+dealTxt(d).replace(/^\S+\s/,'')+'.':'Mines first: with your own raw materials a plant adds up differently.'}`);}
  const s=document.createElement('div');s.className='say b2n-fac';s.innerHTML=`${face(best&&best.pb<=36?'happy':'calm')}<div><p><b>${L('Людмила советует','Lyudmila advises')}:</b> ${esc(txt)}</p></div>`;
  const p=mc.querySelector('h2+p');(p||h2).insertAdjacentElement('afterend',s);
  mc.querySelectorAll('[data-fac]').forEach(b=>{const card=b.closest('.card');if(card&&card.textContent.indexOf('⚠')>=0)b.classList.remove('green');});}
try{const mc=$$('mcard');if(mc&&window.MutationObserver)new MutationObserver(()=>facFix()).observe(mc,{childList:true});}catch(x){}

/* ---------- тексты советов и новостей ---------- */
function advTxt(it){const a=it.a||{};
  if(it.k==='b2up')return L(`Модернизация окупится быстрее нового рудника: ${low(NM.obj(a.t))} ${rin(a.r)} — +${M(a.m)} в месяц, вернём ${M(a.c)} ≈ за ${mons(a.pb)}.`,`An upgrade pays back faster than a new mine: the ${low(NM.obj(a.t))} ${rin(a.r)} adds +${M(a.m)} a month, the ${M(a.c)} comes back in ≈ ${mons(a.pb)}.`);
  if(it.k==='b2dz')return L(`${NM.obj(a.t)} ${rin(a.r)}: запаса на ≈ ${mons(a.left)}. Доразведка за ${M(a.c)} даст ещё ≈ ${mons(a.mon)} работы.`,`The ${low(NM.obj(a.t))} ${rin(a.r)} has ≈ ${mons(a.left)} of reserves. A ${M(a.c)} survey adds ≈ ${mons(a.mon)} of work.`);
  if(it.k==='b2idle'){const d=a.d&&a.d[0];return L(`Свободно ≈ ${M(a.free)} — ${mons(a.months)} прибыли лежат без дела.${d?' Лучшее дело: '+dealTxt(d).replace(/^\S+\s/,'')+'.':''}`,`About ${M(a.free)} is free — ${mons(a.months)} of profit sitting idle.${d?' Best move: '+dealTxt(d).replace(/^\S+\s/,'')+'.':''}`);}
  if(it.k==='chain')return L(`${NM.obj(a.t)} ${rin(a.r)} на своём сырье: ≈ +${M(a.m)} в месяц, окупится ≈ за ${mons(a.pb)}${a.pbF&&a.pbF<a.pb?` (с займом ФРП — за ${mons(a.pbF)})`:''}. Я учла, что наш выпуск собьёт цену.`,`A ${low(NM.obj(a.t))} ${rin(a.r)} on your own raw materials: ≈ +${M(a.m)} a month, pays back in ≈ ${mons(a.pb)}${a.pbF&&a.pbF<a.pb?` (with the IDF loan in ${mons(a.pbF)})`:''}. I counted the price drop from our output.`);
  return null;}
function newsTxt(n){const a=n.a||{},d=FMT.mon(n.m)+' · ';
  if(n.k==='b2deep')return d+L(`🔎 Глубокая разведка на пустом участке ${rin(a.r)} — ${M(a.c)}.`,`🔎 Deep survey on an empty plot ${rin(a.r)}: ${M(a.c)}.`);
  if(n.k==='b2dz')return d+L(`🔎 Доразведка: ${low(NM.obj(a.t))} ${rin(a.r)} — ${M(a.c)}.`,`🔎 Extra survey at the ${low(NM.obj(a.t))} ${rin(a.r)}: ${M(a.c)}.`);
  if(n.k==='b2dzok')return d+L(`🔎 Запас вырос: ${low(NM.obj(a.t))} ${rin(a.r)} +${Q(a.a,a.g)}.`,`🔎 Reserves grew at the ${low(NM.obj(a.t))} ${rin(a.r)}: +${Q(a.a,a.g)}.`);
  if(n.k==='b2buy')return d+L(`🤝 Куплен рудник у «${NM.bot(a.b)}»: ${low(NM.obj(a.t))} ${rin(a.r)} — ${M(a.c)}.`,`🤝 Bought a mine from ${NM.bot(a.b)}: the ${low(NM.obj(a.t))} ${rin(a.r)} for ${M(a.c)}.`);
  return null;}
(function wrap(){const A=window.ADV;if(!A||A.__b2n){if(!A)setTimeout(wrap,300);return;}A.__b2n=1;const t0=A.text,n0=A.news;
  A.text=function(it){const x=it&&advTxt(it);return x!=null?x:t0.apply(this,arguments);};A.news=function(n){const x=n&&newsTxt(n);return x!=null?x:n0.apply(this,arguments);};})();
// куда ведут советы
(function go(){const G=B2.whyGo&&B2.whyGo.go;if(!G){setTimeout(go,500);return;}G.b2up=x=>goDeal(Object.assign({k:'up'},x.a));G.b2dz=x=>{UI.go('obj');setTimeout(()=>dzOpen(x.a.o),300);};G.b2idle=()=>dealsOpen();})();

/* ---------- события: тексты под новые параметры ---------- */
function evText(k,t){const T=window.NEDTXT;if(!T)return;T[k]=Object.assign(T[k]||{},t);}
const T0=window.NEDTXT||{};
function patch(){const T=window.NEDTXT;if(!T||T.__b2n)return;T.__b2n=1;const P=Object.assign({},T);
  T.export=Object.assign({},P.export,{d:a=>a.k==null?P.export.d(a):L(`«Восточный терминал» купит ${Q(a.q,a.g)} (${low(NM.good(a.g))}) за ${days(a.days)} по ${FMT.num(a.p)} ₽ — на ${a.k} % выше цены на месте. Мы делаем ≈ ${Q(a.cap,a.g)} в месяц. Недопоставка — штраф 20 %.`,`Eastern Terminal will buy ${Q(a.q,a.g)} of ${low(NM.good(a.g))} within ${days(a.days)} at ${FMT.num(a.p)} ₽ — ${a.k}% above the local price. We make ≈ ${Q(a.cap,a.g)} a month. A shortfall costs 20%.`),
    why:(a,i)=>a.k==null?P.export.why(a,i):i===0?L(`Наш выпуск это покрывает — ≈ +${M(a.gain)} сверху. Подписываем.`,`Our output covers it — about +${M(a.gain)} extra. Let’s sign.`):a.sh>0?L(`Не успеем: не хватит ≈ ${Q(a.sh,a.g)}, штраф съест надбавку. Откажемся.`,`We can’t make it: ≈ ${Q(a.sh,a.g)} short, the penalty eats the premium. Let’s decline.`):L('Выгода копеечная — не стоит связывать выпуск.','The gain is tiny — not worth tying up our output.')});
  T.eco=Object.assign({},P.eco,{d:a=>a.pr==null?P.eco.d(a):L(`Природнадзор едет на наши рудники. Новые фильтры заранее — <b>${M(a.c)}</b>. Если не готовиться — с вероятностью ${Math.round(a.pr*100)} % штраф ${M(a.f)} и 10 дней простоя одного рудника (≈ ${M(a.loss)}).`,`The environmental agency is coming. New filters in advance cost <b>${M(a.c)}</b>. Unprepared — a ${Math.round(a.pr*100)}% chance of a ${M(a.f)} fine and 10 days of one mine idle (≈ ${M(a.loss)}).`),
    why:(a,i)=>a.pr==null?P.eco.why(a,i):i===0?L(`Риск ≈ ${M(a.risk)} (штраф и простой с учётом вероятности) — больше цены фильтров. Ставим.`,`The risk is ≈ ${M(a.risk)} (fine and downtime times the chance) — more than the filters. Let’s install them.`):L(`Фильтры ${M(a.c)} дороже риска ≈ ${M(a.risk)}. Рискнём.`,`Filters at ${M(a.c)} cost more than the ≈ ${M(a.risk)} risk. Let’s take the chance.`)});
  T.refi=Object.assign({},P.refi,{d:a=>a.cut==null?P.refi.d(a):L(`Банк снизит ставку по нашим кредитам (${M(a.d)}) на ${FMT.num(a.cut*100,1)} процентного пункта. Комиссия — <b>${M(a.fee)}</b> сразу.`,`The bank will cut the rate on our loans (${M(a.d)}) by ${FMT.num(a.cut*100,1)} percentage points. Fee: <b>${M(a.fee)}</b> up front.`)});
  T.union=Object.assign({},P.union,{d:a=>a.pr==null?P.union.d(a):L(`Горняки просят +${a.k} % к зарплате на год — это <b>${M(a.x)}</b> в месяц, всего ${M(a.tot)}. Откажем — с вероятностью ${Math.round(a.pr*100)} % забастовка: все рудники встанут на ${days(a.d)}.`,`The miners want +${a.k}% pay for a year — <b>${M(a.x)}</b> a month, ${M(a.tot)} in total. Refuse — a ${Math.round(a.pr*100)}% chance of a strike: all mines stop for ${days(a.d)}.`),
    o:a=>a.pr==null?P.union.o(a):[L(`Согласиться · +${M(a.x)} в месяц`,`Agree · +${M(a.x)} a month`),L('Отказать','Refuse')],
    why:(a,i)=>a.pr==null?P.union.why(a,i):i===0?L(`Забастовка обойдётся ≈ в ${M(a.loss)} (с учётом вероятности) — дороже прибавки ${M(a.tot)}. Соглашаемся.`,`A strike would cost ≈ ${M(a.loss)} (times the chance) — more than the ${M(a.tot)} rise. Let’s agree.`):L(`Прибавка за год ${M(a.tot)}, а забастовка — ≈ ${M(a.loss)} с учётом вероятности. Откажем вежливо.`,`The rise is ${M(a.tot)} a year; a strike ≈ ${M(a.loss)} times the chance. Let’s politely refuse.`)});
  T.rail=Object.assign({},P.rail,{d:a=>a.k==null?P.rail.d(a):L(`Железная дорога продаёт ${a.n} крепких вагонов по ${M(a.p)} — на ${a.k} % дешевле нового. Свои вагоны возят без аренды.`,`The railway is selling ${a.n} sturdy wagons at ${M(a.p)} — ${a.k}% below new. Own wagons carry goods without rent.`)});
  T.tip=Object.assign({},P.tip,{why:(a,i)=>a.pb==null?P.tip.why(a,i):i===0?L(`Рудник там окупится ≈ за ${mons(a.pb)}, а разведка — малая часть оценки ${M(a.v)}. Берём.`,`A mine there pays back in ≈ ${mons(a.pb)}, and the survey is a small part of the ${M(a.v)} estimate. Let’s go.`):a.pb>=999?L('Такой рудник сейчас был бы в убыток — рынок этого сырья насыщен. Пропустим.','Such a mine would lose money now — this market is saturated. Let’s skip.'):L(`Рудник окупится только ≈ за ${mons(a.pb)} или денег сейчас впритык. Пропустим.`,`A mine would pay back only in ≈ ${mons(a.pb)}, or cash is tight. Let’s skip.`)});
  T.sell={ico:'🤝',t:a=>L(`${a&&a.b?'«'+NM.bot(a.b)+'»':'Соперник'} продаёт рудник`,`${a&&a.b?NM.bot(a.b):'A rival'} is selling a mine`),
    d:a=>L(`${NM.who?NM.who(a.b):''} предлагает купить работающий рудник — ${low(NM.obj(a.t))} ${rin(a.r)} (${low(NM.good(a.g))}) за <b>${M(a.c)}</b>. Стройка не нужна: он даёт ≈ ${M(a.m)} в месяц уже сейчас.`,`${NM.who?NM.who(a.b):''} offers to sell a working mine — the ${low(NM.obj(a.t))} ${rin(a.r)} (${low(NM.good(a.g))}) for <b>${M(a.c)}</b>. No construction: it earns ≈ ${M(a.m)} a month right now.`),
    o:a=>[L(`Купить · ${M(a.c)}`,`Buy · ${M(a.c)}`),L('Отказаться','Decline')],
    why:(a,i)=>i===0?L(`Окупится ≈ за ${mons(a.pb)} — и без стройки. Хорошая цена.`,`Pays back in ≈ ${mons(a.pb)} — with no construction. A good price.`):L(`Окупится только ≈ за ${mons(a.pb)} или денег и кредита не хватит. Откажемся.`,`It would pay back only in ≈ ${mons(a.pb)}, or we lack cash and credit. Let’s decline.`)};
  for(const k in N.evt)evText(k,N.evt[k]);}
patch();

/* ---------- строка на «Сегодня» (гл.5 — карта): деньги без дела → «Куда вложить». HOME может забрать: B2.nedra.homeCard = true ---------- */
B2.slot('today','nedra',ctx=>{const W=ctx&&ctx.W||w();if(!on(W)||N.homeCard)return '';const id=N.idle(W);if(!id||!id.deals.length)return '';
  return `<button class="card tap noenter" data-b2="nedra:deals" style="display:flex;align-items:center;width:100%;text-align:left;border-left:5px solid var(--good)"><span style="font-size:26px;margin-right:12px">💡</span><span style="flex:1;min-width:0"><b style="display:block;font-size:18px">${L('Деньги без дела','Idle money')}: ${M(id.free)}</b><small class="mut" style="font-size:16px">${esc(dealTxt(id.deals[0]))}</small></span><span class="chev">›</span></button>`;},30);

N.UI={evText,dealsOpen,dzOpen,deepOpen,dealTxt,cards,facFix};
try{UI.refresh();}catch(e){}
})();
