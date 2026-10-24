/* b2-rival-ui.js — RIVAL: вид (по требованию). Карточка хода соперника на «Сегодня» (гнездо today), строка в окне «Закрытие месяца» (close),
   блок «Соперники в городе» в «Финансы → Соперники и рейтинг» (гнездо riv, крючок в fin.js finRiv). Нажатия data-b2="rival:ans:<k>" / "rival:open".
   Без DOM на верхнем уровне (jsc грузит все b2-*). */
(function(){'use strict';
if(B2.off('rival'))return;
const E=typeof ECON!=='undefined'?ECON:null;
const Lx=(r,e)=>typeof L==='function'?L(r,e):r;
const M=n=>typeof FMT!=='undefined'?FMT.money(n):Math.round(n)+' ₽';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const X=()=>B2.rivalX;
function tn(t){const B=E&&E.BIZ[t];return B?Lx(B.n,B.en):t;}
function cn(c){const R=E&&E.REGS&&E.REGS[c];return R?Lx(R.city,R.ce||R.city):c;}
function fn(f){const x=B2.rivals.firm(f);return x?'«'+Lx(x.n,x.en)+'»':f;}
const CSS=`.rv-c{border-left:5px solid var(--bad,#c62828)}.rv-c h3{margin:0 0 6px;font-size:18px}.rv-c p{margin:4px 0;font-size:17px;line-height:1.35}
.rv-o{display:block;width:100%;min-height:52px;margin:8px 0 0;text-align:left;font-size:17px}.rv-o small{display:block;font-size:15px;opacity:.85}
.rv-o.best{outline:3px solid var(--good,#0a7a3a)}.rv-s{font-size:15px;color:var(--muted,#4f5d72)}.rv-r{display:flex;align-items:center;margin:6px 0;font-size:16px}
.rv-r i{display:inline-block;width:12px;height:12px;border-radius:6px;margin-right:8px;flex:none}.rv-r b{flex:1}.rv-bar{height:10px;border-radius:5px;background:var(--line,#d5dbe2);overflow:hidden;display:flex;margin:4px 0 10px}
.rv-bar span{display:block;height:100%}`;
let css=0;function st(){if(css||typeof document==='undefined')return '';css=1;const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);return '';}
const KT={open:['открыли точку прямо напротив вашей','opened an outlet right across from yours'],price:['снизили цены','cut their prices'],
  poach:['зовут к себе вашего управляющего','are luring away your manager'],sell:['уходят с рынка и продают свои точки','are leaving the market and selling their outlets']};
const OT={promo:['📣 Акция у себя','📣 Run a promotion'],cut:['🏷 Снизить цены на 3 месяца','🏷 Cut prices for 3 months'],pay:['💰 Удержать прибавкой','💰 Keep them with a raise'],
  buy:['🤝 Выкупить их точки','🤝 Buy their outlets'],none:['Не отвечать','Do nothing']};
function optSub(o,mv,R){if(o.k==='cut')return Lx('выручка вида −4 % на 3 мес. (≈ ','sales −4 % for 3 months (≈ ')+M(o.cost)+')'+(o.gain?Lx(', потом +',', then +')+M(o.gain)+Lx('/мес','/mo'):'');
  if(o.k==='none'){if(mv.k==='poach')return Lx('точка 3 месяца без хозяйского глаза: ','the outlet goes 3 months unattended: ')+M(o.gain)+Lx('/мес','/mo');
    if(mv.k==='sell')return Lx('их точки заберёт сеть «Рядышком»','the Nearby chain takes their outlets');return Lx('доля соперника останется','the rival keeps the share');}
  return M(o.cost)+(o.gain?Lx(' · вернёт ≈ +',' · brings back ≈ +')+M(o.gain)+Lx('/мес','/mo'):'');}
function card(W){const mv=W.b2&&W.b2.rival&&W.b2.rival.mv;if(!mv||!X())return '';st();const f=B2.rivals.firm(mv.f)||{},op=X().opts(W),bk=X().best(W);
  const left=Math.max(1,mv.end-W.t),b=mv.id&&W.biz.find(x=>x.id===mv.id),sh=((W.b2.rival.sh||{})[mv.c+'.'+mv.t]||{})[mv.f]|0;
  let h=`<div class="card rv-c" id="rvMove"><h3>⚔ ${esc(fn(mv.f))} ${Lx(KT[mv.k][0],KT[mv.k][1])}</h3>`
   +`<p>${esc(tn(mv.t))} · ${esc(cn(mv.c))}${b&&b.mgr?'':''}${sh?' · '+Lx('у них уже ','they already hold ')+Math.round(sh/10)+Lx(' % покупателей',' % of buyers'):''}</p>`
   +`<p class="rv-s">${Lx('Ответить — ещё ','Answer within ')+left+' '+(typeof pl==='function'?pl(left,'день','дня','дней','day','days'):'дн.')+Lx('. Молчание = «не отвечать».','. Silence = “do nothing”.')}</p>`;
  for(const o of op){const off=o.cost>W.cash&&o.k!=='cut'&&o.k!=='none';
    h+=`<button class="btn rv-o noenter${o.k===bk?' best':''}" data-b2="rival:ans:${o.k}"${off?' disabled':''}>${Lx(OT[o.k][0],OT[o.k][1])}${o.k===bk?' ★':''}<small>${esc(optSub(o,mv))}${off?Lx(' · не хватает денег',' · not enough cash'):''}</small></button>`;}
  return h+`<p class="rv-s">★ ${Lx('Людмила: так выгоднее за год','Lyudmila: best over a year')}</p></div>`;}
function today(W){const c=card(W);if(c)return c;const s=B2.rivals(W);if(!s.on||!s.mkt.length)return '';
  const t=s.mkt.filter(m=>Object.keys(m.rv).length).sort((a,b)=>a.me-b.me)[0];if(!t)return '';
  const r=Object.keys(t.rv).sort((a,b)=>t.rv[b]-t.rv[a]).map(id=>{const f=B2.rivals.firm(id);return Lx(f.sg,f.sge)+' '+Math.round(t.rv[id]*100)+' %';}).join(' · ');
  return `<div class="rv-s" style="margin:6px 2px">⚔ ${esc(tn(t.t))}: ${Lx('вы','you')} ${Math.round(t.me*100)} % · ${esc(r)}</div>`;}
function close(W){const o=W.b2&&W.b2.rival;if(!o||!o.lg)return '';const l=o.lg.filter(x=>x.m===W.m-1||x.m===W.m);if(!l.length)return '';st();
  const T={in:['пришли на рынок','entered the market'],open:KT.open,price:KT.price,poach:KT.poach,sell:KT.sell};
  return l.filter(x=>T[x.k]).map(x=>`<div class="rv-s">⚔ ${esc(fn(x.f))} ${Lx(T[x.k][0],T[x.k][1])} — ${esc(tn(x.t))}, ${esc(cn(x.c))}</div>`).join('');}
function riv(W){const s=B2.rivals(W);if(!s.on||!s.firms.length)return '';st();
  let h=`<div class="f-card"><b style="font-weight:600">⚔ ${Lx('Соперники в городе','Rivals in town')}</b>`;
  for(const f of s.firms)h+=`<div class="rv-r"><i style="background:${f.col}"></i><b>${esc(Lx(f.n,f.en))}</b><span>${esc(Lx(f.who,f.whoe))} · ${f.np} ${typeof pl==='function'?pl(f.np,'рынок','рынка','рынков','market','markets'):''}</span></div>`;
  for(const m of s.mkt.filter(m=>m.me<1).sort((a,b)=>a.me-b.me).slice(0,5)){const ids=Object.keys(m.rv);if(!ids.length)continue;
    h+=`<div class="rv-s">${esc(tn(m.t))} · ${esc(cn(m.c))}: ${Lx('вы','you')} ${Math.round(m.me*100)} %${ids.map(id=>{const f=B2.rivals.firm(id);return ' · '+esc(Lx(f.sg,f.sge))+' '+Math.round(m.rv[id]*100)+' %';}).join('')}</div>`
     +`<div class="rv-bar"><span style="width:${m.me*100}%;background:var(--good,#0a7a3a)"></span>${ids.map(id=>`<span style="width:${m.rv[id]*100}%;background:${B2.rivals.firm(id).col}"></span>`).join('')}</div>`;}
  return h+`<p class="f-note" style="margin-bottom:0">${Lx('Соперники отнимают у вида не больше 15 % покупателей. Раз в 4–6 месяцев кто-то делает ход — ответ на «Сегодня».','Rivals take at most 15 % of buyers of a type. Every 4–6 months someone makes a move — answer it on Today.')}</p></div>`;}
function click(a,g){if(a!=='ans'||!X()||typeof GAME==='undefined')return;const W=GAME.W,mv=W.b2.rival.mv;if(!mv)return;const r=X().ans(W,g);
  if(r==='cash'){if(typeof toast==='function')toast(Lx('Не хватает денег','Not enough cash'));return;}
  if(r==='ok'){if(typeof toast==='function')toast('⚔ '+Lx(OT[g][0],OT[g][1])+' ✓');if(typeof save==='function')save();if(GAME.emit)GAME.emit('change');if(typeof UI!=='undefined'&&UI.refresh)UI.refresh();}}
B2.rivalUI={card,today,close,riv,click};
if(typeof UI!=='undefined'&&UI.refresh)try{UI.refresh();}catch(e){}
})();
