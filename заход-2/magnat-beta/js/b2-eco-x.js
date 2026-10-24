/* b2-eco-x.js — ECO «Магнат 2.0»: стоки 💎 «знанием» (П11) и меценатство (П10, В13). Грузится по требованию (B2.need из b2-eco.js), с главы «Сеть».
   Мир: W.b2.eco = {spy:{m,t,c,k,v,g}, ins:{<id торгов>:предел}, geo:{<id участка>:'товар'|0}, mc:[ключи подарков городу]}. Устройство: S.b2o.mc — подарков за всё время.
   Числа — из договора (B2.eco.p, B2.eco.k). Деньги меценатства — ECON.b2Mec через GAME.act (БДР «прочие», ДДС «прочее», тег a.b2Mec.<ключ>). */
(function(){'use strict';
if(typeof B2==='undefined'||B2.off('eco')||typeof document==='undefined')return;
const T=(ru,en)=>typeof L==='function'?L(ru,en):ru,E=()=>window.ECON,M=x=>typeof FMT!=='undefined'?FMT.money(x):Math.round(x)+' ₽';
const o=W=>{const x=B2.w(W,'eco');if(!x.ins||typeof x.ins!=='object')x.ins={};if(!x.geo||typeof x.geo!=='object')x.geo={};if(!Array.isArray(x.mc))x.mc=[];return x;};
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const cityN=c=>{try{return E().REGS[c][typeof LANG!=='undefined'&&LANG==='en'?'ce':'city']||c;}catch(e){return c;}};
const bizN=t=>{try{const b=E().BIZ[t];return (b.ico?b.ico+' ':'')+T(b.n,b.en);}catch(e){return t;}};
const st=W=>W.ned?'nedra':W.st;
const refresh=()=>{try{UI.refresh();}catch(e){}};
const toastS=t=>{try{toast(t,2600);}catch(e){}};
const crBtn=(n,act,arg,dis)=>`<button class="btn cr noenter"${dis?' disabled':''} data-b2="eco:${act}${arg!=null?':'+arg:''}">${T('Узнать','Find out')} · ${n} 💎</button>`;
function payCr(key){if(B2.eco.pay(key))return true;const n=B2.eco.p(key);try{SND.no();}catch(e){}
  try{openShop('cr',{from:'b2eco',need:n});}catch(e){toastS(T('Не хватает 💎: нужно ','Not enough 💎: you need ')+n);}return false;}

/* ===== «Сеть»: Тайный покупатель — раз в игровой месяц: где сеть теряет больше всего из-за настройки точек ===== */
function spyFind(W){const Ec=E();let best=null,n=0;const seen={};
  for(const b of W.biz){if(!b||b.st==='b'||seen[b.t+'|'+b.c])continue;seen[b.t+'|'+b.c]=1;const B=Ec.BIZ[b.t];if(!B||b.t==='whs'||b.t==='tk'||b.t==='van'||b.t==='truck')continue;
    const pts=Ec.cityPts(W,b.t,b.c);n+=pts.length;let cur=0;for(const p of pts)cur+=Ec.bizForecast(W,p,p.k).prof;
    for(const K of [B.knob,B.k2].filter(Boolean)){const f=Ec.knobFore(W,b.t,b.c,K.k);if(!f||!f.o)continue;const bo=f.o.find(x=>x.v===f.best);if(!bo)continue;
      const g=Math.round(bo.prof-cur-(bo.pay||0)/12);if(g>0&&(!best||g>best.g)){const was=pts[0].k[K.k],wo=f.o.find(x=>x.v===was);best={t:b.t,c:b.c,k:K.k,v:bo.v,g,ru:bo.ru,en:bo.en,wru:wo?wo.ru:'',wen:wo?wo.en:''};}}}
  return {best,n};}
function spyCard(W,x){const s=x.spy;if(s&&s.m===W.m){if(!s.t)return dec('🕵',T('Тайный покупатель','Mystery shopper'),T('Проверил '+s.n+' точек: всё настроено как надо ✓','Checked '+s.n+' shops: everything is set up right ✓'),'');
    return dec('🕵',T('Тайный покупатель','Mystery shopper'),`${bizN(s.t)} · ${esc(cityN(s.c))}: ${esc(T(s.wru,s.wen))} → <b>${esc(T(s.ru,s.en))}</b> <em class="b2-pos">+${M(s.g)}${T('/мес','/mo')}</em>`,
      s.ok?`<small>✓ ${T('Сделано','Done')}</small>`:`<button class="btn green noenter" data-b2="eco:spygo">${T('Сделать так','Do it')}</button>`);}
  if(W.biz.length<3)return '';
  return dec('🕵',T('Тайный покупатель','Mystery shopper'),T('Какая точка теряет выручку и почему — раз в месяц','Which shop is losing revenue and why — once a month'),crBtn(B2.eco.p('eco.spy'),'spy'));}
function spy(W){const x=o(W);if(x.spy&&x.spy.m===W.m)return;if(!payCr('eco.spy'))return;const r=spyFind(W);
  x.spy=r.best?Object.assign({m:W.m,n:r.n},r.best):{m:W.m,n:r.n};B2.ev('eco','spy',{g:r.best?r.best.g:0});save1();refresh();}
function spyGo(W){const s=o(W).spy;if(!s||!s.t||s.ok)return;const r=GAME.act('bizKnobCity',s.t,s.c,s.k,s.v);
  if(r&&r.r==='cash'){toastS(T('Не хватает денег на переделку','Not enough money for the change'));return;}s.ok=1;save1();refresh();}

/* ===== «Карьер»: Знакомый в комиссии — предел соперников на идущих торгах ===== */
function insCard(W,x){const a=(W.opi||[]).filter(p=>p.st==='auc');if(!a.length)return '';const p=a[0],nm=Array.isArray(p.nm)?T(p.nm[0],p.nm[1]):p.nm;
  if(x.ins[p.id]!=null)return dec('🤝',T('Знакомый в комиссии','An insider at the auction'),x.ins[p.id]>0?T('«'+nm+'»: соперники дадут не больше ','“'+nm+'”: rivals will bid no more than ')+`<b>${M(x.ins[p.id])}</b>`:T('«'+nm+'»: соперники в торги не пойдут','“'+nm+'”: rivals won’t bid'),'');
  return dec('🤝',T('Знакомый в комиссии','An insider at the auction'),T('Узнать предел соперников на торгах «'+nm+'»','Find out the rivals’ limit at the “'+nm+'” auction'),crBtn(B2.eco.p('eco.insider'),'ins',p.id));}
function ins(W,id){const x=o(W),p=(W.opi||[]).find(q=>q.id===id&&q.st==='auc');if(!p||x.ins[id]!=null)return;if(!payCr('eco.insider'))return;
  let mx=0;for(const b of p.bots||[])mx=Math.max(mx,b.mx|0);x.ins[id]=mx;const ks=Object.keys(x.ins);if(ks.length>8)delete x.ins[ks[0]];B2.ev('eco','ins',{});save1();refresh();}

/* ===== «Недра»: Геолог-светило — пуст ли неразведанный участок ===== */
function hidPlots(W){const o2=[];try{for(const r of E().REG)for(const p of W.plots[r])if(p.st==='hid')o2.push(p);}catch(e){}return o2;}
function geoCard(W,x){const h=hidPlots(W);if(!h.length)return '';const known=h.filter(p=>x.geo[p.id]!=null).length;
  return dec('🔭',T('Геолог-светило','Star geologist'),T('Скажет до разведки, пуст ли участок','Tells you before exploring whether a plot is empty')+(known?' · '+T('известно: ','known: ')+known:''),
    `<button class="btn noenter" data-b2="eco:geoo">${T('Выбрать участок','Pick a plot')} · ${B2.eco.p('eco.geo')} 💎</button>`);}
function geoOpen(W){const x=o(W),h=hidPlots(W).slice(0,12),G=E().GOODS;
  const row=p=>{const v=x.geo[p.id],nm=esc(cityN(p.r))+' · '+T('участок ','plot ')+esc(String(p.id).replace(/^\D+/,'№'));
    if(v==null)return `<div class="b2-row b2e-r"><span>${nm}</span><button class="btn noenter" data-b2="eco:geo:${esc(p.id)}">${B2.eco.p('eco.geo')} 💎</button></div>`;
    return `<div class="b2-row b2e-r"><span>${nm}</span><b>${v?'✓ '+esc(T(G[v].n,G[v].en)):T('пусто — не разведывайте','empty — don’t explore')}</b></div>`;};
  modal(`<h2>🔭 ${T('Геолог-светило','Star geologist')}</h2><p>${T('Знаменитый геолог по старым картам скажет, есть ли что-то на участке, — до разведки. Сколько именно — покажет только разведка.','A famous geologist reads old maps and tells you whether a plot holds anything — before exploration. How much exactly — only exploration shows.')}</p>
    ${h.map(row).join('')}<div class="row"><button class="btn" data-esc onclick="hideModal()">${T('Закрыть','Close')}</button></div>`);}
function geo(W,id){const x=o(W);if(x.geo[id]!=null)return;const p=hidPlots(W).find(q=>q.id===id);if(!p)return;if(!payCr('eco.geo'))return;
  x.geo[id]=p.dep&&p.dep.g?p.dep.g:0;const ks=Object.keys(x.geo);if(ks.length>16)delete x.geo[ks[0]];B2.ev('eco','geo',{f:x.geo[id]?1:0});save1();geoOpen(W);refresh();}

/* ===== Меценатство (В13): подарок городу за большие деньги — видно на Улице, слава и значок; прибыль не ускоряет ===== */
const MEC=[{k:'park',ic:'🌳',ru:'Парк у реки',en:'Riverside park',c:50e6,s:'quarry',fun:['Скамейки с вашими инициалами — скромно','Benches with your initials — modest']},
  {k:'school',ic:'🏫',ru:'Новая школа',en:'A new school',c:150e6,s:'quarry',fun:['Ваш 11 «Б» прослезился','Your old class 11B shed a tear']},
  {k:'stad',ic:'🏟',ru:'Стадион',en:'Stadium',c:300e6,s:'nedra',fun:['Стадион имени себя — скромно','A stadium named after yourself — modest']},
  {k:'sci',ic:'🔬',ru:'Дворец науки',en:'Palace of science',c:500e6,s:'nedra',fun:['Детям — телескоп, Людмиле Санне — тишина','A telescope for kids, silence for Lyudmila Sanna']}];
const mecOk=(W,m)=>m.s==='quarry'?(st(W)==='quarry'||st(W)==='nedra'):st(W)==='nedra';
function profM(W){try{const h=(W.hist||[]).slice(-3);let s=0;for(const x of h)s+=x.np||0;return h.length?s/h.length:0;}catch(e){return 0;}}
function mecFree(W,c){try{const p=E().buildPlan(W,c,1);return p.kind==='ok';}catch(e){return W.cash>=c*2;}}
function mecCard(W,x){const left=MEC.filter(m=>mecOk(W,m)&&x.mc.indexOf(m.k)<0);if(!left.length||(W.hist||[]).length<12)return '';   // новый холдинг: стартовый капитал — не «лежащие» деньги
const pm=profM(W),idle=pm>0?W.cash/pm:0;
  if(idle<12)return '';const m=left[0];   // деньги «лежат»: на счёте больше годовой прибыли (02-money §3)
  return `<div class="b2c b2c-goal"><div class="b2c-h">🏛 <span>${T('Деньги лежат без дела','Money is sitting idle')}</span><b class="b2-num">${Math.round(idle)} ${T('мес.','mo')}</b></div>
    <small>${T('На счёте ','On the account ')}${M(W.cash)} — ${T('больше годовой прибыли. Подарите городу ','more than a year’s profit. Give the city ')}${m.ic} ${esc(T(m.ru,m.en))} · ${M(m.c)}</small>
    <button class="btn noenter" data-b2="eco:meco">${T('Меценатство','Patronage')}</button></div>`;}
function mecOpen(W){const x=o(W);const row=m=>{const has=x.mc.indexOf(m.k)>=0,ok=mecOk(W,m),can=ok&&!has&&mecFree(W,m.c);
    return `<div class="b2-row b2e-r"><span>${m.ic} <b>${esc(T(m.ru,m.en))}</b><br><small>${esc(T(m.fun[0],m.fun[1]))}</small></span>`+
      (has?`<b>✓ ${T('Подарено','Given')}</b>`:!ok?`<small>${T('с главы ','from ')}${m.s==='quarry'?T('«Карьер»','“Quarry”'):T('«Недра»','“Mining”')}</small>`
        :`<button class="btn noenter"${can?'':' disabled'} data-b2="eco:mec:${m.k}">${M(m.c)}</button>`)+'</div>';};
  modal(`<h2>🏛 ${T('Меценатство','Patronage')}</h2><p>${T('Подарок городу, где ваше дело: его увидят на Улице, в Кабинете — значок мецената. Прибыль от этого не растёт — это для души и славы.','A gift to the city where your business is: it shows on the Street, and a patron’s badge appears in the Office. It doesn’t raise profit — it’s for the soul and for fame.')}</p>
    ${MEC.map(row).join('')}<p><small>${T('Кнопка серая — после подарка не хватит денег на платежи месяца и стройки.','A grey button — after the gift there wouldn’t be enough for this month’s payments and construction.')}</small></p>
    <div class="row"><button class="btn" data-esc onclick="hideModal()">${T('Закрыть','Close')}</button></div>`);}
function mec(W,k){const m=MEC.find(q=>q.k===k),x=o(W);if(!m||!mecOk(W,m)||x.mc.indexOf(k)>=0||!mecFree(W,m.c))return;
  const r=GAME.act('b2Mec',k,m.c);if(r!=='ok')return;x.mc.push(k);const s=B2.s('o');s.mc=(s.mc|0)+1;
  try{SND.win();}catch(e){}hideModal();toastS(m.ic+' '+T(m.ru+' — подарок городу. Спасибо, меценат!',m.en+' — a gift to the city. Thank you, patron!'));B2.ev('eco','mec',{k});save1();refresh();}

/* ===== общее ===== */
(function(){if(document.getElementById('b2eCss'))return;const c=document.createElement('style');c.id='b2eCss';
  c.textContent='.b2e-r{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line);font-size:17px}.b2e-r>span{flex:1 1 auto;min-width:0;padding-right:10px}.b2e-r small{color:var(--muted);font-size:16px}.b2e-r>.btn{flex:none;width:auto;min-width:112px;min-height:48px;margin:0}.b2e-r>b{flex:none}';
  document.head.appendChild(c);})();
// Кабинет: значок мецената (подарков за всё время, S.b2o.mc)
B2.slot('cab','eco',()=>{const n=B2.s('o').mc|0;return n?`<div class="b2e-r"><span>🏛 <b>${T('Меценат','Patron')}</b><br><small>${T('подарков городам: ','gifts to cities: ')+n}</small></span></div>`:'';},20);
function dec(ic,h,p,btn){return `<div class="b2c b2c-dec"><h4>${ic} ${h}</h4><p>${p}</p>${btn?'<div class="b2c-opts">'+btn+'</div>':''}</div>`;}
function save1(){try{save();}catch(e){}}
function card(W){if(!W)return '';const x=o(W),s=st(W);let h='';
  try{if(s==='mid')h+=spyCard(W,x);else if(s==='quarry')h+=insCard(W,x);else if(s==='nedra')h+=geoCard(W,x);}catch(e){console.error(e);}
  try{h+=mecCard(W,x);}catch(e){console.error(e);}return h;}
function click(act,arg){const W=GAME.W;if(!W)return;
  if(act==='spy')spy(W);else if(act==='spygo')spyGo(W);else if(act==='ins')ins(W,arg);else if(act==='geoo')geoOpen(W);else if(act==='geo')geo(W,arg);
  else if(act==='meco')mecOpen(W);else if(act==='mec')mec(W,arg);}
// магазин → «Ускорения»: «знание» текущей главы (shop.js зовёт B2.eco.shopBoost)
function shopBoost(W,infoRow,cr){if(!W)return '';const s=st(W),r=[];
  if(s==='mid')r.push(infoRow('🕵',T('Тайный покупатель','Mystery shopper'),T('какая точка теряет выручку · раз в месяц · «Сегодня»','which shop is losing revenue · once a month · Today'),cr(B2.eco.p('eco.spy'))));
  if(s==='quarry')r.push(infoRow('🤝',T('Знакомый в комиссии','An insider at the auction'),T('предел соперников · раз на торги · «Сегодня»','rivals’ limit · once per auction · Today'),cr(B2.eco.p('eco.insider'))));
  if(s==='nedra')r.push(infoRow('🔭',T('Геолог-светило','Star geologist'),T('пуст ли участок до разведки · «Сегодня»','is a plot empty, before exploring · Today'),cr(B2.eco.p('eco.geo'))));
  return r.length?`<h4>🧠 ${T('Знание за 💎','Knowledge for 💎')}</h4>`+r.join(''):'';}
// для HOME (Улица): что подарено городу в этом мире
function mecList(W){if(!W)return [];const x=o(W);return MEC.filter(m=>x.mc.indexOf(m.k)>=0).map(m=>({k:m.k,ic:m.ic,ru:m.ru,en:m.en}));}

// модель: подарок городу — деньги уходят «прочими» (БДР oth, ДДС oth), баланс сходится (ECON.check)
if(window.ECON&&!ECON.b2Mec)ECON.b2Mec=function(W,k,c){c=Math.round(c);if(!(c>0)||W.cash<c)return 'cash';const P=ECON._;P.pay(W,c,'oth');P.pl(W,'oth',-c);return 'ok';};
B2.ecoX={card,click,shopBoost,mecList,spyFind,MEC};
Object.assign(B2.eco,{shopBoost,mec:mecList});
refresh();
})();
