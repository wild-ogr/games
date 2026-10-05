/* ================= M39 «Опт» — интерфейс (этап 1 ТЗ M38-wholesale.md; модель — js/opt.js) =================
   Грузится после js/biz-ui.js (берёт его помощников BIZUI.h). window.OPTUI:
   - netBlock(W) — блок «Опт и доставка» во вкладке «Сеть»: три вида опта (открытые — строкой с прибылью и машинами, неоткрытые — с порогом и пользой связей),
     стройбазы с парком, самосвалы без хозяина (старые сейвы), долг покупателей; linksBtn(W) — кнопка «🔗 Связи +X/мес» вверху «Сети»;
   - card(W,b,V) — карточка опта / стройбазы / машины: сводка, «🚚 Доставка» со степпером «− N +» и ценой решения, настройки с ★, улучшения, «Кому помогаю», долги;
   - links(W) — экран «🔗 Как мои бизнесы помогают друг другу» (сумма, цепочки, серые подсказки); badge(W,b) — «🔗 +X» в строке точки;
   - openModal(kd,t) — окно открытия вида опта (вход + товар + долг, доставка, связи).
   Кнопки — атрибут data-op (свой обработчик на document), переходы — через BIZUI.openBiz/UI.render. Текст — L(ru,en), шрифт строк ≥ 17 px, кнопки ≥ 48 px. */
(function(){
'use strict';
const E=window.ECON;if(!E||!E.OPTK||!window.BIZUI||!BIZUI.h){window.OPTUI=null;return;}
const H=BIZUI.h,{w,esc,M,Mr,snd,days,mons,act,money0,prog,barsSvg,lastPm,bizState,ptRow,recCard,whsCard,whsOpt,whsWarn,cityN}=H;
const $$=id=>document.getElementById(id);
const K=kd=>E.OPTK[kd]||E.OPTK.food,kn=kd=>L(K(kd).n,K(kd).en),bnB=b=>H.bnB(b),bicoB=b=>H.bicoB(b);
const tk=x=>M(Math.round(x/1e3)*1e3);
const isVeh=t=>t==='van'||t==='truck';
const owners=W=>W.biz.filter(b=>b.t==='whs'||b.t==='base');
const cnt=(n,a,b,c,d,e)=>n+' '+pl(n,a,b,c,d,e);

/* ---------------- CSS (переменные темы; без inset и gap) ---------------- */
(function css(){if($$('opCss'))return;const s=document.createElement('style');s.id='opCss';s.textContent=`
.op-lnk{display:flex;align-items:center;width:100%;text-align:left;border:2px solid var(--accent);background:var(--card);border-radius:16px;padding:12px 14px;margin:12px 0 4px;min-height:56px;font:inherit;color:var(--ink);font-size:17px}
.op-lnk b{font-size:18px}.op-lnk small{display:block;color:var(--muted);font-size:15px;margin-top:2px}.op-lnk .chev{margin-left:auto}
.op-sum{font-size:17px;line-height:1.45;margin:10px 0 4px}.op-sum b{font-size:18px}
.op-bar{display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--line);margin:8px 0 4px}.op-bar i{display:block;height:100%}.op-bar .own{background:var(--good)}.op-bar .hire{background:var(--warn,#b8860b)}
.op-leg{margin:2px 0 6px;font-size:15px;color:var(--muted)}.op-leg .op-sq{display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:-2px;margin:0 6px 0 0}.op-leg .op-sq.own{background:var(--good)}.op-leg .op-sq.hire{background:var(--warn,#b8860b);margin-left:2px}
.op-st{display:flex;align-items:center;margin:12px 0 6px}.op-st .lab{flex:1;font-size:17px;font-weight:600}
.op-st button{min-width:52px;min-height:52px;border-radius:14px;border:2px solid var(--line);background:var(--card);color:var(--ink);font-size:24px;font-weight:700;margin-left:8px}
.op-st button.add{border-color:var(--good);color:var(--good)}.op-st button[disabled]{opacity:.45}
.op-st .n{min-width:44px;text-align:center;font-size:22px;font-weight:700;margin-left:8px}
.op-hint{font-size:16px;line-height:1.4;color:var(--ink);margin:4px 0 0}.op-hint.mut{color:var(--muted)}.op-hint.good{color:var(--good)}
.op-up{display:flex;align-items:center;padding:10px 0;border-top:1px solid var(--line);min-height:56px;font-size:17px}.op-up .lv{width:36px;height:36px;border-radius:18px;background:var(--line);text-align:center;line-height:36px;font-weight:700;margin-right:10px;flex:none}
.op-up.done .lv{background:var(--good);color:#fff}.op-up small{display:block;color:var(--muted);font-size:15px}
.op-ch{border:2px solid var(--line);border-radius:16px;padding:12px 14px;margin:10px 0;background:var(--card);font-size:17px;line-height:1.45}
.op-ch.off{border-style:dashed;color:var(--muted)}.op-ch .sum{float:right;font-weight:700;color:var(--good)}.op-ch.off .sum{color:var(--muted)}
.op-big{font-size:28px;font-weight:800;color:var(--good);margin:6px 0}
.op-k{display:block;width:100%;text-align:left;border:2px solid var(--line);background:var(--card);border-radius:14px;padding:10px 12px;margin:8px 0 0;min-height:52px;font:inherit;color:var(--ink);font-size:17px}
.op-k.on{border-color:var(--accent);background:var(--accent-t)}.op-k small{display:block;color:var(--muted);font-size:15px;margin-top:2px}
`;document.head.appendChild(s);})();

/* ---------------- помощники ---------------- */
let lsC=null;function lsum(W){if(lsC&&lsC.t===W.t&&lsC.n===W.biz.length&&lsC.W===W)return lsC.v;let v={sum:0,a:[]};try{v=E.linkSum(W);}catch(e){}lsC={t:W.t,n:W.biz.length,W,v};return v;}
function ptLink(W,b){const s=lsum(W);let a=0;for(const g of s.a)for(const x of g.to)if(x.id===b.id)a+=x.a;return a;}
function ownLink(W,o){const s=lsum(W);const g=s.a.find(x=>x.from===o.id);return g||{a:0,to:[]};}
const LOCK={eq:kd=>L(`откроется при капитале ${M(K(kd).eq)}`,`unlocks at equity ${M(K(kd).eq)}`),have:kd=>L(`сначала откройте «${kn(K(kd).need)}»`,`first open “${kn(K(kd).need)}”`),
  stage:()=>L('откроется в главе «Сеть»','unlocks in the Network chapter'),ip:()=>L('нужно ИП','needs sole-trader status'),max:()=>L('уже есть — один на всю сеть','already have one — one for the whole network'),nc:()=>L('2 года не открываем — договор с покупателем','not for 2 years — buyer’s deal')};
function why(W,kd,r){if(r==='cash')return L('не хватает ','short by ')+M(K(kd).cap-W.cash);return (LOCK[r]||LOCK.stage)(kd);}
const multi=W=>W.cities&&W.cities.length>1;
const homeTxt=W=>multi(W)?' · '+L('на всю сеть, стоит в ','serves the whole network, located in ')+cityN(W.home||'kuz'):'';
const typeIco=t=>H.bico(t);

/* ---------------- «Сеть»: кнопка связей и блок опта ---------------- */
function linksBtn(W){if(!W.ooo||W.ned)return '';const s=lsum(W),has=W.biz.some(b=>b.t==='whs');
  return `<button class="op-lnk noenter" data-op="links" id="opLnkBtn"><span class="f1"><b>🔗 ${L('Связи','Links')}${s.sum>0?' · +'+tk(s.sum)+L('/мес','/mo'):''}</b><small>${s.sum>0?L('как мои бизнесы помогают друг другу','how my businesses help each other'):has?L('свой опт снабжает свои точки дешевле — со второго месяца','your wholesale supplies your outlets cheaper — from month two'):L('свой опт снабжает свои точки дешевле — откройте опт','your own wholesale supplies your outlets cheaper — open one')}</small></span><span class="chev">›</span></button>`;}
function optRow(W,o){const p=lastPm(o),c=E.optCars(W,o),ln=ownLink(W,o).a,nv=E.fleet(W,o.id).length;
  const sub=o.st!=='w'?bizState(W,o):(o.oc&&W.optT>W.m?L('по старым правилам ещё ','old rules for ')+mons(W.optT-W.m)+' · ':'')+L(`газели ${nv} из ${Math.ceil(c.need-.05)}`,`vans ${nv} of ${Math.ceil(c.need-.05)}`)+(ln>0?' · 🔗 '+L('помогает +','helps +')+tk(ln):'');
  return `<button class="bz-li" data-b="bpt" data-from="net" data-id="${o.id}"><span class="bz-ic">${bicoB(o)}</span><span class="f1"><b>${esc(bnB(o))}</b><small>${esc(sub)}</small></span><span class="v ${p==null?'':p>=0?'good':'bad'}">${o.st==='w'&&p!=null?money0(p):'—'}<small>${o.st==='w'&&p!=null?L('за месяц','a month'):''}</small></span></button>`;}
function kdRow(W,kd){const r=E.bizCan(W,'whs',W.home||'kuz',kd),f=E.optFore(W,kd),lock=r!=='ok'&&r!=='cash'&&r!=='ip';const h=E.linkHint(W).find(x=>x.kd===kd);
  const line=L(`вложить ~${Mr(f.need)} · прибыль ~${Mr(f.prof)}/мес · окупится за ~${mons(Math.ceil(f.pay))}`,`invest ~${Mr(f.need)} · profit ~${Mr(f.prof)}/mo · pays back in ~${mons(Math.ceil(f.pay))}`);
  const hint=h&&h.a>0?L(`🔗 ваши ${cnt(h.n,'точка','точки','точек','outlet','outlets')} сэкономили бы ~${tk(h.a)}/мес`,`🔗 your ${cnt(h.n,'точка','точки','точек','outlet','outlets')} would save ~${tk(h.a)}/mo`):'';
  return `<button class="bz-li${lock?' lock':''}" data-op="open" data-kd="${kd}" id="opCat-${kd}"><span class="bz-ic">${K(kd).ico}</span><span class="f1"><b>${esc(kn(kd))}</b><small>${esc(line)}</small>${hint?`<small>${esc(hint)}</small>`:''}${r!=='ok'?`<small style="color:${lock?'var(--muted)':'var(--warn)'}">${lock?'🔒 ':''}${esc(why(W,kd,r))}${r==='eq'?L(' (сейчас ',' (now ')+M(E.equity(W))+')':''}</small>`:''}</span><span class="chev">›</span></button>`;}
function baseRow(W,b){const p=lastPm(b),x=E.bizEcon(W,b,b.k,null,true),n=E.fleet(W,b.id).length,need=Math.ceil(x.q/E.TRUCK_T-.05);
  const sub=b.st!=='w'?bizState(W,b):L(`самосвалы ${n} · нужно ${need} в этом месяце`,`trucks ${n} · ${need} needed this month`)+(x.fr>.5?' · '+L(`${num1(x.fr)} на частных заказах`,`${num1(x.fr)} on private jobs`):'');
  return `<button class="bz-li" data-b="bpt" data-from="net" data-id="${b.id}"><span class="bz-ic">🏗</span><span class="f1"><b>${esc(H.bn('base'))}${W.biz.filter(q=>q.t==='base').length>1?' №'+(W.biz.filter(q=>q.t==='base').indexOf(b)+1):''}</b><small>${esc(sub)}</small></span><span class="v ${p==null?'':p>=0?'good':'bad'}">${b.st==='w'&&p!=null?money0(p):'—'}<small>${b.st==='w'&&p!=null?L('за месяц','a month'):''}</small></span></button>`;}
const num1=x=>H.num(Math.round(x*10)/10,1);
function netBlock(W){let h=`<div class="bz-sec">${L('Опт и доставка','Wholesale & delivery')}${multi(W)?' · '+L('на всю сеть','for the whole network'):''}</div><div class="card bz-list" id="opNet">`;
  for(const kd of E.OPT_KD){const o=E.optOf(W,kd);h+=o?optRow(W,o):kdRow(W,kd);}
  for(const b of W.biz.filter(x=>x.t==='base'))h+=baseRow(W,b);
  h+=catBase(W);
  h+='</div>';
  for(const o of W.biz.filter(x=>x.t==='whs'&&x.st==='w')){const s=E.whsState(W,o);if(s.fill<.5)h+=`<div class="bz-warn bad">📦 ${esc(bnB(o))}: ${L(`полупустой — товара ${Mr(s.stk)} из ${Mr(s.norm)}${s.lack?', нет свободных денег сверх подушки ~'+Mr(s.pad):''}.`,`half-empty — stock ${Mr(s.stk)} of ${Mr(s.norm)}${s.lack?', no spare money above the ~'+Mr(s.pad)+' cushion':''}.`)}</div>`;}
  const mk=W.biz.filter(x=>x.t==='truck'&&x.at==='mkt');
  if(mk.length){h+=`<div class="card" id="opMkt"><b>🚛 ${L('Машины без хозяина','Vehicles with no owner')}: ${mk.length}</b><p class="bz-note">${L('Самосвал выгоден только в парке стройбазы: он возит её щебень и экономит на доставке. Пока они работают на частных заказах и почти не зарабатывают.','A truck pays off only in a builders’ yard fleet: it hauls the yard’s gravel and saves on delivery. For now they do private jobs and earn next to nothing.')}${mk.some(b=>b.mkS>W.m)?' '+L(`Ещё ${mons(mk[0].mkS-W.m)} их можно продать по балансовой цене — без потерь.`,`For ${mons(mk[0].mkS-W.m)} more you can sell them at book value — no loss.`):''}</p>
    ${W.biz.some(x=>x.t==='base')?`<button class="btn sm w noenter" data-op="tobase" style="margin-top:8px">🏗 ${L('Отдать все стройбазе','Give them all to the yard')}</button>`:`<button class="btn sm w noenter" data-b="bcat" data-t="base" style="margin-top:8px">🏗 ${L('Открыть стройбазу','Open a builders’ yard')} · ${M(E.BIZ.base.cap)}</button>`}
    ${mk.map(b=>`<button class="btn sm w noenter" data-op="vsell" data-id="${b.id}" style="margin-top:8px">${L('Продать самосвал за ','Sell a truck for ')+M(E.bizSellPrice(W,b))}</button>`).join('')}</div>`;}
  h+=recCard(W);
  return h;}
function catBase(W){const r=E.bizCan(W,'base',W.home||'kuz'),f=E.bizForecast(W,'base'),lock=r!=='ok'&&r!=='cash'&&r!=='ip';if(r==='max')return '';
  return `<button class="bz-li${lock?' lock':''}" data-b="bcat" data-t="base" id="bzCat-base"><span class="bz-ic">🏗</span><span class="f1"><b>${esc(H.bn('base'))}${W.biz.some(x=>x.t==='base')?' №2':''}</b><small>${esc(L(`вложения ${M(E.BIZ.base.cap)} · прибыль ~${Mr(f.prof)}/мес с наёмными самосвалами · свои — в её парке`,`invest ${M(E.BIZ.base.cap)} · profit ~${Mr(f.prof)}/mo with hired trucks · your own go into its fleet`))}</small>${r!=='ok'?`<small style="color:${lock?'var(--muted)':'var(--warn)'}">${lock?'🔒 ':''}${r==='cash'?L('не хватает ','short by ')+M(E.BIZ.base.cap-W.cash):L('пока недоступно','not available yet')}</small>`:''}</span><span class="chev">›</span></button>`;}

/* ---------------- карточка опта ---------------- */
function head(W,b,back){const nm=b.t==='whs'?bnB(b):b.t==='base'?H.bn('base'):H.bn(b.t);
  return `<div class="bz-back"><button class="back" data-b="bback">← ${back}</button></div><div class="card"><div class="bz-hd"><span class="bz-ic lg">${b.t==='whs'?bicoB(b):H.bico(b.t)}</span><div class="f1"><h2>${esc(nm)}</h2><small>${esc(cityN(b.c))}${b.wm?' · '+L('работает ','open ')+mons(b.wm):''}${esc(homeTxt(W))}</small></div></div>`;}
function pmBars(b){const pm=b.pm||[];return `<div class="bz-lab" style="margin-top:12px">${L('Прибыль по месяцам','Profit by month')}${pm.length?' · '+L('последний ','last ')+money0(pm[pm.length-1]):''}</div>`+(pm.length?barsSvg(pm):`<p class="bz-note">${L('Первые цифры — после закрытия месяца.','First figures at month end.')}</p>`);}
// степпер машин: «− N +» и цена решения
function stepper(W,o,lab){const t=o.t==='base'?'truck':'van',B=E.BIZ[t],fl=E.fleet(W,o.id),n=fl.length,g=E.fleetGain(W,o,1).gain,can=E.vehCan(W,o.id);
  const mx=t==='van'?E.VAN_MAX:E.TRUCK_MAX,pay=g>0?Math.ceil(B.cap/g):0;let hint;
  if(n>=mx)hint=`<p class="op-hint mut">${L(`Больше ${mx} в один парк не поставить.`,`No more than ${mx} in one fleet.`)}</p>`;
  else if(g>0)hint=`<p class="op-hint good">＋1 ${t==='van'?L('газель','van'):L('самосвал','truck')} (${M(B.cap)}) → ${L('прибыль больше на ','profit up by ')}<b>${tk(g)}${L('/мес','/mo')}</b>${pay?' · '+L('окупится за ~','pays back in ~')+mons(pay):''}</p>`;
  else hint=`<p class="op-hint mut">＋1 ${t==='van'?L('газель','van'):L('самосвал','truck')} ${L('будет стоять: ','would stand idle: ')}${tk(g)}${L('/мес','/mo')}</p>`;
  let mh='';if(n>0){const d=E.fleetGain(W,o,-1).gain;mh=`<p class="op-hint mut">−1: ${L('продать за ~','sell for ~')+M(E.bizSellPrice(W,fl[fl.length-1]))} · ${d>=0?L('прибыль не упадёт','profit won’t drop'):L('прибыль меньше на ','profit down by ')+tk(-d)+L('/мес','/mo')}</p>`;}
  const ls=fl.length?`<div class="pick" style="margin-top:8px">`+fl.map((v,i)=>`<button class="noenter" data-op="veh" data-id="${v.id}">${H.bico(t)} №${i+1}${v.st==='b'?' ⏳':''}</button>`).join('')+'</div>':'';
  return `<div class="op-st"><span class="lab">${lab}</span><button class="noenter" data-op="vdel" data-id="${o.id}" aria-label="${esc(L('Продать одну','Sell one'))}"${n?'':' disabled'}>−</button><span class="n" id="opN-${o.id}">${n}</span><button class="noenter add" data-op="vadd" data-id="${o.id}" aria-label="${esc(L('Купить ещё','Buy one more'))}"${can==='ok'||can==='cash'?'':' disabled'}>＋</button></div>${hint}${mh}${ls}`;}
function delivWhs(W,o){const c=E.optCars(W,o),need=c.need,own=Math.min(c.own,need),hire=c.hire,idle=Math.max(0,c.own-need),over=hire*(E.VAN_HIRE-E.VAN_OWN);
  const pc=need>0?Math.min(1,own/need):1;let h=`<div class="card" id="opDeliv"><b>🚚 ${L('Доставка','Delivery')}</b>
    <p class="op-sum">${L('Нужно машин в этом месяце: ','Vehicles needed this month: ')}<b>${num1(need)}</b>. ${L('Свои: ','Own: ')}<b>${c.own}</b> · ${L('наёмные: ','hired: ')}<b>${num1(hire)}</b>${hire>.05?L(` (переплата ~${tk(over)} в месяц)`,` (overpaying ~${tk(over)} a month)`):''}${idle>.5?' · '+L(`стоят без дела: ${num1(idle)}`,`idle: ${num1(idle)}`):''}</p>
    <div class="op-bar" role="img" aria-label="${esc(L(`свои ${Math.round(pc*100)} %`,`own ${Math.round(pc*100)}%`))}"><i class="own" style="width:${(pc*100).toFixed(0)}%"></i><i class="hire" style="width:${(100-pc*100).toFixed(0)}%"></i></div><p class="op-leg"><span class="op-sq own"></span>${L('свои','own')} ${Math.round(pc*100)} % · <span class="op-sq hire"></span>${L('наёмные','hired')} ${100-Math.round(pc*100)} %</p>
    <p class="bz-note">${L(`Своя газель — ${tk(E.VAN_OWN)} в месяц (водитель и топливо), наёмная — ${tk(E.VAN_HIRE)}. Свои машины работают только на этот опт.`,`Own van — ${tk(E.VAN_OWN)} a month (driver and fuel), hired — ${tk(E.VAN_HIRE)}. Own vans work only for this wholesale.`)}${K(o.kd).sea?' '+L('Летом машин нужно больше, зимой — меньше.','More vans are needed in summer, fewer in winter.'):''}</p>`;
  return h+stepper(W,o,L('Свои газели','Own vans'))+'</div>';}
// настройки с прогнозом и ★
function knobBlock(W,o){const kd=o.kd||'food',k=E.optKnobs(kd,o.k);let h=`<div class="card bz-knob" id="opKnob"><b>⚙ ${L('Настройки','Settings')}</b><p class="bz-note">${L('Менять можно когда угодно, бесплатно. ★ — выгоднее сейчас (прибыль в среднем за год).','Change any time, free. ★ — better right now (yearly average profit).')}</p>`;
  const fore=(kk,v)=>{const x=Object.assign({},o,{k:Object.assign({},o.k,{[kk]:v})});try{return E.bizForecast(W,x,x.k).prof;}catch(e){return 0;}};
  const grp=(kk,ttl,opts)=>{const pf=opts.map(x=>fore(kk,x[0]));let bi=0;pf.forEach((p,i)=>{if(p>pf[bi])bi=i;});
    return `<b style="display:block;margin-top:14px">${ttl}</b>`+opts.map((x,i)=>`<button class="op-k noenter${k[kk]===x[0]?' on':''}" data-op="knob" data-id="${o.id}" data-k="${kk}" data-v="${x[0]}"><b>${k[kk]===x[0]?'● ':''}${esc(L(x[1],x[2]))}${i===bi?' ★':''}</b><small>${L('прибыль ~','profit ~')+Mr(pf[i])+L('/мес','/mo')}${x[3]?' · '+esc(x[3]()):''}</small></button>`).join('');};
  const sd=E.OPTK[kd].sd;
  h+=grp('mk',L('Наценка для чужих покупателей','Mark-up for outside buyers'),E.BIZ.whs.kx[0].o.map(x=>[x[0],x[1],x[2],()=>L(`${Math.round(E.OPTK[kd].mk[x[0]]*100)} % к закупке, покупателей ×${H.num(E.MKD[x[0]],2)}`,`${Math.round(E.OPTK[kd].mk[x[0]]*100)}% on cost, buyers ×${E.MKD[x[0]]}`)]));
  h+=grp('sd',L('Запас на полке','Stock on the shelf'),E.BIZ.whs.kx[1].o.map(x=>[x[0],x[1],x[2],()=>sd[x[0]][1]<1?L(`меньше продаж: «нет товара» −${Math.round((1-sd[x[0]][1])*100)} %`,`fewer sales: “out of stock” −${Math.round((1-sd[x[0]][1])*100)}%`):sd[x[0]][2]>.005?L(`порча ~${H.num(sd[x[0]][2]*100,1)} % выручки`,`spoilage ~${(sd[x[0]][2]*100).toFixed(1)}% of revenue`):L('денег в товаре больше','more money tied up in stock')]));
  // отсрочка — как раньше (с деньгами у покупателей и окупаемостью)
  const n=E.whsNeed(W,o.k.def,null,o);h+=`<b style="display:block;margin-top:14px">${L('Отсрочка покупателям','Credit to buyers')}</b>`+E.BIZ.whs.knob.o.map(x=>whsOpt(W,x[0],o,o.k.def===x[0],`data-b="knob" data-id="${o.id}" data-k="def" data-v="${x[0]}"`)).join('')+whsWarn(W,n);
  if(E.OPTK[kd].dd)h+=`<p class="bz-note">${L('У хозтоваров норма рынка — отсрочка 30 дней: без неё покупателей заметно меньше.','For household goods 30-day credit is the market norm: without it buyers are noticeably fewer.')}</p>`;
  return h+'</div>';}
function upBlock(W,o){const kd=o.kd||'food',up=o.up||0,U=[E.UP1,E.OPTK[kd].u2];let h=`<div class="card" id="opUp"><b>⬆ ${L('Улучшения','Upgrades')}</b>`;
  U.forEach((u,i)=>{const lv=i+1,done=up>=lv;let r='';if(!done&&lv===up+1){const x=E.optUpInfo(W,o.id);r=x&&!x.max?`<button class="btn sm ${W.cash>=x.c?'green':''} noenter" data-op="up" data-id="${o.id}" style="margin-left:8px"${o.st==='w'?'':' disabled'}>${M(x.c)}<small style="display:block;font-weight:500">${x.gain>0?'+'+tk(x.gain)+L('/мес','/mo'):''}${x.pay?' · '+mons(Math.ceil(x.pay)):''}</small></button>`:'';}
    h+=`<div class="op-up${done?' done':''}"><span class="lv">${done?'✓':lv}</span><span class="f1"><b>${esc(L(u.n,u.en))}</b><small>${esc(L(u.t.ru,u.t.en))}</small></span>${r}</div>`;});
  return h+`<p class="bz-note">${L('Следующие ступени (адресное хранение, контракт с сетью, филиал) — в следующих обновлениях.','Further steps (address storage, chain contract, branch) come in later updates.')}</p></div>`;}
function helpBlock(W,o){const g=ownLink(W,o),L0=E.LINKS[o.kd||'food']||{};let h=`<div class="card" id="opHelp"><b>🔗 ${L('Кому помогаю','Who I help')}</b>`;
  if(o.st!=='w'||(o.wm||0)<1||W.optT>W.m){h+=`<p class="bz-note">${L('Связи включатся со следующего месяца после открытия: договоры и ассортимент. Тогда эти точки будут закупать дешевле: ','Links start the month after opening: contracts and range first. Then these outlets will buy cheaper: ')}${Object.keys(L0).map(t=>typeIco(t)+' '+H.bn(t)+' −'+H.num(L0[t]*100,1)+' %').join(', ')}.</p>`;return h+'</div>';}
  if(!g.to.length){h+=`<p class="bz-note">${L('Своих точек, которым он помогает, пока нет. Помогает: ','No own outlets to help yet. It helps: ')}${Object.keys(L0).map(t=>typeIco(t)+' '+H.bn(t)).join(', ')}.</p>`;return h+'</div>';}
  const by={};for(const x of g.to){const q=by[x.t]||(by[x.t]={n:0,a:0});q.n++;q.a+=x.a;}
  h+=`<p class="op-sum">${L('Своим точкам — дешевле: ','Cheaper for your outlets: ')}<b class="good">+${tk(g.a)}${L(' в месяц',' a month')}</b></p><div class="bz-list">`+Object.keys(by).map(t=>`<div class="bz-li" style="min-height:52px"><span class="bz-ic">${typeIco(t)}</span><span class="f1"><b>${esc(H.bn(t))} × ${by[t].n}</b><small>${L('закупка дешевле на ','purchases cheaper by ')+H.num(L0[t]*100,1)} %</small></span><span class="v good">+${tk(by[t].a)}</span></div>`).join('')+'</div>';
  return h+`<p class="bz-note">${L('Своим опт продаёт без наценки — выгода в том, что точки не платят чужую наценку. Всё — в «🔗 Связях».','Wholesale sells to your outlets at cost — the gain is that they don’t pay someone else’s mark-up. See all in “🔗 Links”.')}</p></div>`;}
function whsView(W,o){const x=E.bizEcon(W,o,o.k,null,true),f=E.bizForecast(W,o,o.k),g=ownLink(W,o).a;
  let h=head(W,o,L('Сеть','Network'));
  if(o.st==='b'){h+=`<p class="bz-note">${esc(bizState(W,o))}</p>${prog(((o.tot||E.BIZ.whs.days)-o.left)/(o.tot||E.BIZ.whs.days))}</div>`;}
  else{h+=`<p class="op-sum">${L('Сейчас: оборот ','Now: turnover ')}<b>${Mr(x.rev)}</b>${L('/мес · прибыль ','/mo · profit ')}<b class="${x.prof>=0?'good':'bad'}">${Mr(x.prof)}</b>${L('/мес','/mo')}${g>0?' · '+L('помогает своим ','helps your outlets ')+'<b class="good">+'+tk(g)+'</b>':''}</p>`+(Math.abs(x.prof-f.prof)>Math.max(3e4,Math.abs(f.prof)*.15)?`<p class="bz-note">${L('в среднем за год ~','yearly average ~')+Mr(f.prof)+L('/мес','/mo')}</p>`:'');
    if(o.oc&&W.optT>W.m)h+=`<div class="tip">🔄 ${L(`Склад пока работает по старым правилам — ещё ${mons(W.optT-W.m)}. Потом — новый расчёт: своя наценка, запас и доставка (своими газелями дешевле).`,`The warehouse runs on the old rules for ${mons(W.optT-W.m)} more. Then the new model kicks in: your own mark-up, stock and delivery (cheaper with own vans).`)}</div>`;
    h+=pmBars(o)+'</div>';}
  // M41: карточка короче — сверху сводка, доставка и настройки; улучшения, «Кому помогаю» и склад — под «▼ Ещё» (раскрытие помним по id)
  h+=delivWhs(W,o)+knobBlock(W,o)+`<details class="op-more" id="opWMore" data-id="${o.id}"${MO[o.id]?' open':''}><summary class="card" style="min-height:52px;font-weight:700;cursor:pointer;display:block;padding:14px 16px">${L('▼ Ещё: улучшения, кому помогаю, склад','▼ More: upgrades, who I help, warehouse')}</summary>`+upBlock(W,o)+helpBlock(W,o)+whsCard(W,o)+'</details>';
  h+=sellCard(W,o);return h;}
function sellCard(W,b){const n=E.fleet(W,b.id).length;return `<div class="card bz-list"><div class="bz-li"><span class="bz-ic">🤝</span><span class="f1"><b>${L('Продать','Sell')}</b><small>${L('покупатель даст ~','a buyer offers ~')+M(E.bizSellPrice(W,b))}${n?' · '+(b.t==='base'?L('самосвалы перейдут ','the trucks go ')+(W.biz.some(x=>x.t==='base'&&x.id!==b.id)?L('другой базе','to the other yard'):L('на частные заказы','to private jobs')):L('газели продадим вместе с ним','the vans are sold with it')):''}</small></span><button class="btn sm noenter" data-b="sell" data-id="${b.id}">${L('Продать','Sell')}</button></div></div>`;}
/* ---------------- карточка стройбазы ---------------- */
function baseView(W,b){const x=E.bizEcon(W,b,b.k,null,true),q=x.q,T=E.TRUCK_T,need=q/T,n=E.fleet(W,b.id).length,hireT=Math.max(0,q-x.own),over=hireT*(E.HIRE_T-E.OWN_T);
  let h=head(W,b,L('Сеть','Network'));
  if(b.st==='b')h+=`<p class="bz-note">${esc(bizState(W,b))}</p>${prog(((b.tot||30)-b.left)/(b.tot||30))}</div>`;
  else h+=`<p class="op-sum">${L('Сейчас: продаёт ','Now: sells ')}<b>${H.num(Math.round(q/100)*100,0)} ${L('т','t')}</b>${L(' щебня и песка в месяц · прибыль ',' of gravel and sand a month · profit ')}<b class="${x.prof>=0?'good':'bad'}">${Mr(x.prof)}</b>${L('/мес','/mo')}</p>`+pmBars(b)+'</div>';
  const pc=need>0?Math.min(1,x.own/q):1;
  h+=`<div class="card" id="opFleet"><b>🚛 ${L('Парк стройбазы','Builders’ yard fleet')}</b>
    <p class="op-sum">${L('Нужно самосвалов в этом месяце: ','Trucks needed this month: ')}<b>${num1(need)}</b>${L(' (по сезону: летом больше, зимой меньше). Свои: ',' (seasonal: more in summer, fewer in winter). Own: ')}<b>${n}</b>${hireT>50?L(` · наёмные везут ${H.num(Math.round(hireT/100)*100,0)} т (переплата ~${tk(over)})`,` · hired ones carry ${H.num(Math.round(hireT/100)*100,0)} t (overpaying ~${tk(over)})`):''}</p>
    <div class="op-bar" role="img" aria-label="${esc(L(`свои везут ${Math.round(pc*100)} %`,`own carry ${Math.round(pc*100)}%`))}"><i class="own" style="width:${(pc*100).toFixed(0)}%"></i><i class="hire" style="width:${(100-pc*100).toFixed(0)}%"></i></div><p class="op-leg"><span class="op-sq own"></span>${L('свои','own')} ${Math.round(pc*100)} % · <span class="op-sq hire"></span>${L('наёмные','hired')} ${100-Math.round(pc*100)} %</p>
    ${x.fr>.05?`<p class="op-hint good">❄ ${L(`Базе сейчас нужно ${Math.ceil(need-.05)}, ещё ${num1(x.fr)} — на частных заказах: +${tk(x.pr)} в месяц.`,`The yard needs ${Math.ceil(need-.05)} now; ${num1(x.fr)} more do private jobs: +${tk(x.pr)} a month.`)}</p>`:''}
    <p class="bz-note">${L(`Свой самосвал везёт ${H.num(T,0)} т в месяц по ${E.OWN_T} ₽/т (водитель ${tk(E.TRUCK_STAFF)} в месяц), наёмный — ${E.HIRE_T} ₽/т. Каждый следующий даёт меньше: летом его ещё ждут, зимой он на частных заказах.`,`An own truck carries ${H.num(T,0)} t a month at ${E.OWN_T} ₽/t (driver ${tk(E.TRUCK_STAFF)} a month), a hired one — ${E.HIRE_T} ₽/t. Each next one adds less: needed in summer, private jobs in winter.`)}</p>`+stepper(W,b,L('Свои самосвалы','Own trucks'));
  if(W.pc&&W.pc.a&&W.pc.a.length){const sp=E.pcTrSpare(W)*30;h+=`<p class="op-hint">📋 ${L(`Подряды: свободных своих самосвалов ~${num1(sp/T)} (остальные заняты на базе).`,`Contracts: ~${num1(sp/T)} own trucks are free (the rest work for the yard).`)}</p>`;}
  h+='</div>';
  // зимний запас щебня (настоящий с M39)
  const wq=E.BASE_WQ*(E.CITY[b.c]||E.CITY.kuz).dem,pr=E.pcBuyP(W,'grav'),save=wq*pr*E.BASE_WD,stor=wq*E.BASE_STOR*2,on=b.k.win==='yes',own=W.biz.some(q=>q.st==='w'&&E.BIZ[q.t].out==='grav');
  h+=`<div class="card bz-knob" id="opWin"><b>❄ ${L('Зимний запас щебня','Winter gravel stock')}</b>`+(own?`<p class="bz-note">${L('Щебень — со своего карьера по себестоимости: запас не нужен.','Gravel comes from your own quarry at cost: no stock needed.')}</p>`:
    `<p class="bz-note">${L(`1 февраля закупаем ${H.num(Math.round(wq/100)*100,0)} т на 15 % дешевле (вложить ~${Mr(wq*pr*.85)} в самый бедный месяц), храним до апреля (~${tk(stor)}), с апреля база берёт щебень из запаса. Выгода за сезон ≈ ${tk(save-stor)}.`,`On 1 February we buy ${H.num(Math.round(wq/100)*100,0)} t 15% cheaper (~${Mr(wq*pr*.85)} tied up in the leanest month), store it until April (~${tk(stor)}), and from April the yard uses the stock first. Season gain ≈ ${tk(save-stor)}.`)}${b.wq>0?' '+L(`Сейчас в запасе ${H.num(Math.round(b.wq),0)} т.`,`In stock now: ${H.num(Math.round(b.wq),0)} t.`):''}</p>`+
    E.BIZ.base.knob.o.map(o=>`<button class="op-k noenter${b.k.win===o[0]?' on':''}" data-b="knob" data-id="${b.id}" data-k="win" data-v="${o[0]}"><b>${b.k.win===o[0]?'● ':''}${esc(L(o[1],o[2]))}${o[0]==='yes'?' ★':''}</b></button>`).join(''))+'</div>';
  return h+sellCard(W,b);}
/* ---------------- карточка машины ---------------- */
function vehView(W,v,V){const u=E.vehUse(W,v),o=u&&u.o,t=v.t,nm=H.bn(t);const back=o?(o.t==='whs'?bnB(o):H.bn('base')):L('Сеть','Network');
  let h=head(W,v,back);
  if(v.st==='b')h+=`<p class="bz-note">${esc(bizState(W,v))}</p>`;
  else if(o){const wk=u.save>0;h+=`<p class="op-sum">${L('Работает в ','Works for ')}<b>${o.t==='whs'?bicoB(o)+' '+esc(bnB(o)):'🏗 '+esc(H.bn('base'))}</b>. ${wk?L('Без неё хозяину пришлось бы платить больше на ','Without it the owner would pay more by ')+'<b class="good">'+tk(u.save)+L(' в месяц',' a month')+'</b>':L('Сейчас машин больше, чем нужно: эта стоит, расходы ~','More vehicles than needed right now: this one is idle, costs ~')+tk(u.cost)+L(' в месяц',' a month')}.</p>
    <p class="bz-note">${L('Её расходы (водитель, топливо) и польза — в прибыли хозяина, поэтому своя прибыль у машины 0, а не минус.','Its costs (driver, fuel) and its benefit are in the owner’s profit, so the vehicle’s own profit is 0, not a loss.')}</p>`;}
  else{const x=E.bizEcon(W,v);h+=`<p class="op-sum">${L('Без хозяина — частные заказы: прибыль ~','No owner — private jobs: profit ~')}<b class="${x.prof>=0?'good':'bad'}">${Mr(x.prof)}</b>${L('/мес','/mo')}</p>`;}
  h+='</div><div class="card bz-list">';
  if(o)h+=`<button class="bz-li" data-b="bpt" data-from="net" data-id="${o.id}"><span class="bz-ic">${o.t==='whs'?bicoB(o):'🏗'}</span><span class="f1"><b>${L('К хозяину: ','To the owner: ')+esc(back)}</b><small>${L('там — сколько машин нужно и «− N +»','there — how many are needed and “− N +”')}</small></span><span class="chev">›</span></button>`;
  else if(t==='truck'&&W.biz.some(x=>x.t==='base'))h+=`<div class="bz-li"><span class="bz-ic">🏗</span><span class="f1"><b>${L('Отдать стройбазе','Give to the builders’ yard')}</b></span><button class="btn sm noenter" data-op="tobase" data-id="${v.id}">${L('Отдать','Give')}</button></div>`;
  h+=`<div class="bz-li"><span class="bz-ic">🤝</span><span class="f1"><b>${L('Продать','Sell')}</b><small>${L('покупатель даст ~','a buyer offers ~')+M(E.bizSellPrice(W,v))}</small></span><button class="btn sm noenter" data-op="vsell" data-id="${v.id}">${L('Продать','Sell')}</button></div></div>`;
  return h;}
function card(W,b,V){if(b.t==='whs')return whsView(W,b);if(b.t==='base')return baseView(W,b);if(isVeh(b.t))return vehView(W,b,V);return null;}

/* ---------------- экран связей ---------------- */
function links(W){const s=lsum(W),l=W.lnk||{};let h=`<div class="bz-back"><button class="back" data-b="bback">← ${L('Сеть','Network')}</button></div><div class="bz-top"><div class="bz-h1">🔗 ${L('Как мои бизнесы помогают друг другу','How my businesses help each other')}</div></div>`;
  h+=`<div class="card" id="opLinks"><div class="bz-lab">${L('Связи приносят','Links bring in')}</div><div class="op-big" id="opLnkSum">+${tk(s.sum)} ${L('в месяц','a month')}</div>`+(l.p>0&&Math.abs(s.sum-l.p)>=1e3?`<p class="bz-note">${s.sum>=l.p?L('больше на ','up by ')+tk(s.sum-l.p):L('меньше на ','down by ')+tk(l.p-s.sum)}${L(', чем в прошлом месяце',' versus last month')}</p>`:'')+
    `<p class="bz-note">${L('Свой опт продаёт своим точкам без наценки — они закупают дешевле. Скидка точке от всех связей — не больше 6 %, вместе со скидкой сети — не больше 10 %. Связь включается через месяц после открытия опта; в другом городе — вполсилы.','Your wholesale sells to your outlets at cost — they buy cheaper. An outlet gets at most 6% from all links, 10% together with the chain discount. A link starts a month after the wholesale opens; in another city it works at half strength.')}</p></div>`;
  for(const g of s.a){const o=W.biz.find(x=>x.id===g.from);if(!o)continue;const by={};for(const x of g.to){const q=by[x.t]||(by[x.t]={n:0,a:0});q.n++;q.a+=x.a;}
    h+=`<div class="op-ch"><span class="sum">+${tk(g.a)}</span><b>${bicoB(o)} ${esc(bnB(o))} →</b><br>`+Object.keys(by).map(t=>`${typeIco(t)} ${esc(H.bn(t))} × ${by[t].n}: +${tk(by[t].a)}`).join(' · ')+'</div>';}
  for(const o of W.biz.filter(x=>x.t==='whs'&&!s.a.some(g=>g.from===x.id)))h+=`<div class="op-ch off"><b>${bicoB(o)} ${esc(bnB(o))}</b><br>${o.st!=='w'||(o.wm||0)<1||W.optT>W.m?L('связи включатся со следующего месяца','links start next month'):L('своих точек, которым он помогает, пока нет','no own outlets for it to help yet')}</div>`;
  for(const x of E.linkHint(W)){const r=x.can,f=E.optFore(W,x.kd);const ok=r==='ok';
    h+=`<div class="op-ch off"><span class="sum">${x.a>0?'~+'+tk(x.a):''}</span><b>${K(x.kd).ico} ${esc(kn(x.kd))} ${L('ещё нет','not yet')}</b><br>${x.n?L(`ваши ${Object.keys(x.by).map(t=>typeIco(t)+' '+x.by[t]).join(' · ')} сэкономили бы ~${tk(x.a)} в месяц`,`your ${Object.keys(x.by).map(t=>typeIco(t)+' '+x.by[t]).join(' · ')} would save ~${tk(x.a)} a month`):L('помог бы: ','would help: ')+Object.keys(E.LINKS[x.kd]).map(t=>typeIco(t)+' '+H.bn(t)).join(', ')}
      <button class="btn sm w noenter${ok?' green':''}" data-op="open" data-kd="${x.kd}" style="margin-top:8px">${ok?L('Открыть · вложить ~','Open · invest ~')+Mr(f.need):'🔒 '+esc(why(W,x.kd,r))}</button></div>`;}
  return h;}
function badge(W,b){if(!W.ooo||E.SMALL.indexOf(b.t)<0||b.st!=='w')return '';const a=ptLink(W,b);return a>=500?' · 🔗 +'+tk(a):'';}

/* ---------------- окно открытия вида опта ---------------- */
function openModal(kd,t){const W=w();if(t&&t!=='whs')return vehModal(t);kd=E.OPTK[kd]?kd:(E.OPT_KD.find(x=>!E.optOf(W,x))||'food');
  const Kd=K(kd),r=E.bizCan(W,'whs',W.home||'kuz',kd),def=(OM.kd===kd&&OM.def)||Kd.k0.def,f=E.optFore(W,kd,{def}),pad=E.whsPad(W),have=W.cash,short=Math.max(0,f.need+pad-have);
  let h=`<div class="bz-hd"><span class="bz-ic lg">${Kd.ico}</span><div class="f1"><h2>${esc(kn(kd))}</h2><small>${multi(W)?L('на всю сеть · стоит в ','serves the whole network · located in ')+esc(cityN(W.home||'kuz')):esc(cityN(W.home||'kuz'))}</small></div></div>`;
  // M41: окно короче — сверху главное (всего нужно, прибыль, окупаемость), остальное — под «▼ Ещё» (раскрытие помним, пока окно перерисовывается)
  h+=`<div class="facts" style="margin-top:12px" id="opTop"><span><b>${L('Всего нужно','Needed in all')}</b></span><b class="${have>=f.need?'good':'bad'}">~${Mr(f.need)}</b><span>${L('Прибыль','Profit')}</span><b class="${f.prof>=0?'good':'bad'}">~${Mr(f.prof)}${L('/мес','/mo')}</b><span>${L('Окупится за','Pays back in')}</span><b>~${mons(Math.max(1,Math.ceil(f.pay)))}</b></div>`;
  let mo=`<p class="bz-note">${esc(L(CH[kd][0],CH[kd][1]))}</p>`;
  mo+=`<div class="facts" style="margin-top:12px"><span>${L('Вход: аренда, ремонт, техника','Entry: lease, fit-out, equipment')}</span><b>${M(Kd.cap)}</b><span>${L('Товар на запас','Stock')}</span><b>~${Mr(f.stk)}</b><span>${L('Деньги у покупателей (отсрочка)','Owed by buyers (credit)')}</span><b>${f.rec?'~'+Mr(f.rec):'0 ₽'}</b>
    <span><b>${L('Всего нужно','Needed in all')}</b></span><b class="${have>=f.need?'good':'bad'}">~${Mr(f.need)}</b><span>${L('Оборот','Turnover')}</span><b>~${Mr(f.rev)}${L('/мес','/mo')}</b><span>${L('Прибыль (с наёмной доставкой)','Profit (hired delivery)')}</span><b class="${f.prof>=0?'good':'bad'}">~${Mr(f.prof)}${L('/мес','/mo')}</b>
    <span>${L('Окупаемость (со всеми деньгами)','Payback (on all the money)')}</span><b>~${mons(Math.max(1,Math.ceil(f.pay)))}</b><span>${L('Откроется через','Opens in')}</span><b>${days(E.BIZ.whs.days)}</b></div>`;
  mo+=`<div class="tip">🚚 ${L(`Доставке нужно ~${num1(f.cars)} газели в месяц. Пока возят наёмные (${tk(E.VAN_HIRE)} за машину); свои газели (${M(E.VAN_CAP)}) покупаются внутри опта и экономят ~${tk(E.VAN_HIRE-E.VAN_OWN)} в месяц каждая.`,`Delivery needs ~${num1(f.cars)} vans a month. Hired ones (${tk(E.VAN_HIRE)} each) at first; own vans (${M(E.VAN_CAP)}) are bought inside the wholesale and save ~${tk(E.VAN_HIRE-E.VAN_OWN)} a month each.`)}</div>`;
  const hint=E.linkHint(W).find(x=>x.kd===kd),L0=E.LINKS[kd];
  mo+=`<div class="tip">🔗 ${L('Свои точки будут закупать дешевле: ','Your outlets will buy cheaper: ')}${Object.keys(L0).map(t=>typeIco(t)+' '+H.bn(t)+' −'+H.num(L0[t]*100,1)+' %').join(', ')}${hint&&hint.a>0?L(` — у вас это ~${tk(hint.a)} в месяц`,` — for you ~${tk(hint.a)} a month`):''}. ${L('Со второго месяца.','From month two.')}</div>`;
  mo+=`<b style="display:block;margin-top:14px">${L('Отсрочка покупателям','Credit to buyers')}</b>`+E.BIZ.whs.knob.o.map(o=>{const g=E.optFore(W,kd,{def:o[0]});return `<button class="op-k noenter${o[0]===def?' on':''}" data-op="mdef" data-kd="${kd}" data-v="${o[0]}"><b>${o[0]===def?'● ':''}${esc(L(o[1],o[2]))}</b><small>${L(`прибыль ~${Mr(g.prof)}/мес · нужно всего ~${Mr(g.need)} · окупится за ~${mons(Math.max(1,Math.ceil(g.pay)))}`,`profit ~${Mr(g.prof)}/mo · needs ~${Mr(g.need)} in all · pays back in ~${mons(Math.max(1,Math.ceil(g.pay)))}`)}</small></button>`;}).join('');
  const dn=(E.BIZ.whs.knob.o.find(o=>o[0]===def)||[0,'',''])[LANG==='en'?2:1];
  h+=`<details class="op-more" id="opMore"${OM.more?' open':''} style="margin-top:10px"><summary style="min-height:48px;font-weight:700;cursor:pointer;padding:12px 0">${L('▼ Ещё: из чего сумма, доставка, отсрочка','▼ More: what the sum is, delivery, credit')} <small class="mut">(${esc(dn)})</small></summary>${mo}</details>`;
  h+=whsWarn(W,E.whsNeed(W,def,kd));
  let wait=false,btn='';
  if(r==='ok'){wait=have<Kd.cap+f.stk*.5;if(short>0)h+=`<div class="bz-warn${wait?' bad':''}">${L(`Людмила: у вас ${M(have)}, а опту нужно ~${Mr(f.need)} и ещё ~${Mr(pad)} подушки на обязательные платежи. ${wait?'Сейчас он откроется полупустым.':'Хватит впритык.'}`,`Lyudmila: you have ${M(have)}, but the wholesale needs ~${Mr(f.need)} plus a ~${Mr(pad)} cushion for fixed payments. ${wait?'Right now it would open half-empty.':'It’s tight.'}`)}</div>`;
    else h+=`<div class="tip">${L(`Людмила: денег хватает — останется ~${Mr(have-f.need)}.`,`Lyudmila: you have enough — ~${Mr(have-f.need)} will remain.`)}</div>`;
    btn=`<button class="btn ${wait?'':'green '}noenter" id="opOpen">${(wait?L('Всё равно открыть за ','Open anyway for '):L('Открыть за ','Open for '))+M(Kd.cap)}</button>`;
    h+=`<p class="bz-note">${L(`Сразу спишется вход ${M(Kd.cap)}; товар на запас (~${Mr(f.stk)}) опт закупит сам с вашего счёта в первые дни.`,`The ${M(Kd.cap)} entry is paid now; the wholesale buys its stock (~${Mr(f.stk)}) from your account in the first days.`)}</p>`;}
  else h+=`<div class="tip">🔒 ${esc(why(W,kd,r))}${r==='eq'?L(' (сейчас ',' (now ')+M(E.equity(W))+')':''}</div>`;
  modal(h+`<div class="row">${btn}<button class="btn${wait?' green':''}" id="opNo" data-esc>${wait?L('Подожду','I’ll wait'):L('Закрыть','Close')}</button></div>`);
  OM.kd=kd;OM.def=def;
  $$('opNo').onclick=()=>{snd('tap');hideModal();};
  if($$('opOpen'))$$('opOpen').onclick=()=>{hideModal();const x=act('bizOpen','whs',{kd,k:{def}});if(x==='ok'){snd('build');const W2=w(),b=W2.biz[W2.biz.length-1];toast(Kd.ico+' '+L('Открываем: ','Opening: ')+kn(kd)+L(' — через ',' — in ')+days(E.BIZ.whs.days));BIZUI.openBiz(b.id,'net');}};}
const OM={kd:null,def:null},MO={};
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.id==='opWMore')MO[d.dataset.id]=d.open;},true);
// характер вида — одной фразой в окне открытия
const CH={food:['Большой оборот, маленькая наценка, сроки годности: лишний запас портится. Снабжает свои шаурмы, ларьки, кофейни, пекарни, столовую и фудтрак.','Big turnover, thin mark-up, shelf life: extra stock spoils. Supplies your shawarma, kiosks, coffee, bakeries, canteen and food truck.'],
  drink:['Сильный сезон: летом в полтора раза больше, зимой меньше; бой тары. Снабжает свои ларьки, кофейни, фудтрак и компьютерный клуб.','Strongly seasonal: half as much again in summer, less in winter; bottle breakage. Supplies your kiosks, coffee, food truck and computer club.'],
  home:['Ничего не портится, сезона почти нет, но товара нужно на 30–40 дней, а покупатели привыкли к отсрочке 30 дней. Снабжает свои хозмагазины, мойки и химчистки.','Nothing spoils, hardly any season, but you hold 30–40 days of stock and buyers expect 30-day credit. Supplies your hardware shops, car washes and dry cleaners.']};
function vehModal(t){const W=w();modal(`<h2>${H.bico(t)} ${esc(H.bn(t))}</h2><p>${t==='truck'?L('Самосвал покупается только внутри стройбазы — в её парке, кнопкой «＋». Так он сразу возит её щебень, и вопроса «куда его поставить» нет.','A truck is bought only inside a builders’ yard — in its fleet, with the “＋” button. It hauls the yard’s gravel at once, so there’s no “where do I put it”.'):L('Газель покупается только внутри опта — в блоке «🚚 Доставка», кнопкой «＋».','A van is bought only inside a wholesale business — in “🚚 Delivery”, with the “＋” button.')}</p><div class="row"><button class="btn" id="opNo" data-esc>${L('Понятно','Got it')}</button></div>`);$$('opNo').onclick=()=>{snd('tap');hideModal();};}

/* ---------------- действия ---------------- */
function vAdd(id){const W=w(),o=W.biz.find(x=>x.id===id);if(!o)return;const t=o.t==='base'?'truck':'van',g=E.fleetGain(W,o,1).gain,B=E.BIZ[t];
  const go=()=>{const r=act('vehAdd',id);if(r==='ok'){snd('coin');const nm=o.t==='whs'?bnB(o):H.bn('base');toast((t==='van'?'🚚 +1 '+L('газель','van'):'🚛 +1 '+L('самосвал','truck'))+' → '+nm+(g>0?': '+L('прибыль больше на ','profit up by ')+tk(g)+L('/мес','/mo'):''),2400);}else if(r==='max')toast(L('Парк полный','The fleet is full'));};
  if(g<=0)H.modalYes(L('Машина будет стоять','The vehicle would stand idle'),L(`Машин и так хватает: ещё одна будет стоять и стоить ~${tk(-g)} в месяц. Всё равно купить за ${M(B.cap)}?`,`You already have enough: one more would stand idle and cost ~${tk(-g)} a month. Buy anyway for ${M(B.cap)}?`),L('Купить','Buy'),go);
  // M41: покупка ≥ 1 млн ₽ одним касанием «＋» — только с вопросом (игрок 45+: случайное касание дорого стоит)
  else if(B.cap>=1e6){const nm=t==='van'?L('газель','a van'):L('самосвал','a truck');H.modalYes(L(`Купить ${nm} за ${M(B.cap)}?`,`Buy ${nm} for ${M(B.cap)}?`),L(`Даст +${tk(g)} в месяц к прибыли${g>0?' · окупится за ~'+mons(Math.max(1,Math.round(B.cap/g))):''}. Продать потом можно дешевле, чем купили.`,`Adds +${tk(g)} a month to profit${g>0?' · pays back in ~'+mons(Math.max(1,Math.round(B.cap/g))):''}. You can sell it later, for less than you paid.`),L('Купить за ','Buy for ')+M(B.cap),go,L('Нет','No'));}
  else go();}
function vDel(id){const W=w(),o=W.biz.find(x=>x.id===id);if(!o)return;const fl=E.fleet(W,o.id);if(!fl.length)return;const v=fl.find(x=>x.st==='b')||fl[fl.length-1],pr=E.bizSellPrice(W,v),d=E.fleetGain(W,o,-1).gain;
  H.modalYes(L('Продать машину?','Sell the vehicle?'),L(`Покупатель даст ~${M(pr)}.`,`A buyer offers ~${M(pr)}.`)+' '+(d>=0?L('Прибыль не упадёт: машина лишняя.','Profit won’t drop: it’s a spare.'):L(`Прибыль станет меньше на ~${tk(-d)} в месяц.`,`Profit will drop by ~${tk(-d)} a month.`)),L('Продать','Sell'),()=>{if(act('vehDel',v.id,'sell')==='ok'){snd('coin');toast(L('Продано: +','Sold: +')+M(pr));}});}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-op]');if(!b)return;const W=w();if(!W)return;const id=b.dataset.id,op=b.dataset.op;
  switch(op){
    case 'links':snd('tap');BIZUI.h.V.biz='links';UI.render();try{$$('main').scrollTop=0;}catch(x){}break;
    case 'open':snd('tap');OM.kd=null;OM.more=0;openModal(b.dataset.kd);break;
    case 'mdef':snd('tap');OM.def=b.dataset.v;OM.more=1;openModal(b.dataset.kd);break;
    case 'vadd':vAdd(id);break;
    case 'veh':snd('tap');openVeh(id);try{$$('main').scrollTop=0;}catch(x){}break;
    case 'vdel':snd('tap');vDel(id);break;
    case 'vsell':{const v=W.biz.find(x=>x.id===id);if(!v)break;const pr=E.bizSellPrice(W,v);H.modalYes(L('Продать машину?','Sell the vehicle?'),L(`Покупатель даст ~${M(pr)}.`,`A buyer offers ~${M(pr)}.`),L('Продать','Sell'),()=>{if(act('vehDel',id,'sell')==='ok'){snd('coin');toast(L('Продано: +','Sold: +')+M(pr));const V=BIZUI.h.V;if(V.biz==='pt'&&V.id===id){V.biz='list';UI.render();}}});break;}
    case 'tobase':{const base=W.biz.find(x=>x.t==='base');if(!base)break;const n0=E.fleet(W,base.id).length;if(act('vehTo',base.id,id||null)==='ok'){snd('coin');toast('🚛 '+L(`Самосвалов в парке стройбазы: +${E.fleet(W,base.id).length-n0}`,`Trucks added to the yard fleet: +${E.fleet(W,base.id).length-n0}`));const V=BIZUI.h.V;if(V.biz==='pt'&&V.id===id){V.biz='pt';V.id=base.id;V.from='net';}UI.render();}break;}
    case 'knob':{const r=act('bizKnob',id,b.dataset.k,b.dataset.v);if(r==='ok'){snd('tap');const o=W.biz.find(x=>x.id===id);let p=0;try{p=E.bizForecast(W,o,o.k).prof;}catch(x){}toast(L('Готово · прибыль ~','Done · profit ~')+Mr(p)+L('/мес','/mo'),2000);}break;}
    case 'up':{const u=E.optUpInfo(W,id);if(!u||u.max)break;const go=()=>{const r=act('optUp',id);if(r==='ok'){snd('build');toast('⬆ '+L(u.n,u.en)+(u.gain>0?': +'+tk(u.gain)+L('/мес','/mo'):''),2400);}};
      if(u.c>=1e6)H.modalYes(L(`${u.n} за ${M(u.c)}?`,`${u.en} for ${M(u.c)}?`),L(u.gain>0?`Даст +${tk(u.gain)} в месяц к прибыли.`:'Прибыль почти не изменится.',u.gain>0?`Adds +${tk(u.gain)} a month to profit.`:'Profit barely changes.'),L('Купить за ','Buy for ')+M(u.c),go,L('Нет','No'));else go();break;}}
  e.preventDefault();e.stopPropagation();},true);
// клик по машине из карточки хозяина: запомнить хозяина для «Назад» (nav: машина → хозяин)
function openVeh(id){const W=w(),v=W.biz.find(x=>x.id===id);if(!v)return;const V=BIZUI.h.V;V.own=v.at&&v.at!=='mkt'?v.at:null;V.biz='pt';V.id=id;V.from=V.own?'opt':'net';UI.go('net');}

window.OPTUI={netBlock,linksBtn,card,links,badge,openModal,openVeh};
})();
