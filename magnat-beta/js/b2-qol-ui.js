/* b2-qol-ui.js — QOL: окна (по требованию из b2-qol.js). B2.qol.ui = {click, rival}.
   meet — «🥂 Встреча 11 «Б»»: friendChat + friendVisit каждому из 4 друзей (те же действия и те же правила, что по одному: раз в месяц, силы на визит в гл.1–2),
     итог и вопросы друзей с вариантами ответа в одном окне (ответ — friendAnswer, текст — STORYUI.after), ручной обход остаётся.
   rall — «Погасить все»: дорогие кредиты сначала (овердрафт, банк по ставке; заём ФРП и друга — последними), сумма ≤ min(деньги, минимум «своих денег» по прогнозу 35 дней).
   rival — ход соперника окном (modalH: время стоит), карточка — B2.rivalUI.card. */
(function(root){'use strict';
const B2=root.B2,Q=B2&&B2.qol;if(!Q)return;
const T=(r,e)=>typeof L==='function'?L(r,e):r,GW=()=>root.GAME&&GAME.W,FR=['owl','beav','bars','vit'];
const M=v=>root.FMT?FMT.money(v):Math.round(v)+' ₽',esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SU=()=>root.STORYUI||{},nm=id=>{try{return SU().nm?SU().nm(id):id;}catch(e){return id;}};
const tst=t=>{try{toast(t);}catch(e){}},sn=k=>{try{snd(k);}catch(e){}};
/* ---------------- встреча ---------------- */
let MR=null;   // итоги последней встречи {m, rows:[{id,c,v}], ans:{qid:текст}}
function meet(){const W=GW();if(!W||!W.fr)return;if(!Q.meetLeft(W)){if(MR&&MR.m===W.m)return meetWin();tst('🥂 '+T('В этом месяце уже виделись — ждём следующего','Already met this month — see you next month'));return;}
  const rows=[];let n=0;
  for(const id of FR){const x=W.fr[id];if(!x)continue;const o={id,c:null,v:null};
    if(x.km!==W.m){try{o.c=GAME.act('friendChat',id);}catch(e){o.c=null;}}
    if(x.vm!==W.m){try{o.v=GAME.act('friendVisit',id);}catch(e){o.v=null;}}
    if(o.c&&o.c.res==='ok'||o.v&&o.v.res==='ok')n++;rows.push(o);}
  sn(n?'coin':'no');MR={m:W.m,rows,ans:{}};B2.ev('qol','meet',{n,q:qs(W).length});meetWin();}
function qs(W){return ((W.fr&&W.fr.q)||[]).filter(q=>FR.indexOf(q.w)>=0&&!q.big&&['reu','pro','ipo'].indexOf(q.k)<0);}
function rowTx(o){const a=[];const d=r=>r&&r.res==='ok'?'❤ +'+r.d:'';
  if(o.c)a.push(o.c.res==='ok'?'📞 '+d(o.c):'📞 '+T('уже звонили','already called'));
  if(o.v)a.push(o.v.res==='ok'?'🏠 '+d(o.v)+(o.v.peace?' · '+T('помирились!','made up!'):''):o.v.res==='en'?'🏠 '+T('не хватило сил на визит','too tired to visit'):'🏠 '+T('уже были в гостях','already visited'));
  if(!o.c&&!o.v)a.push(T('в этом месяце уже виделись','already met this month'));return a.join(' · ');}
function meetWin(){const W=GW();if(!W||!MR)return;let h=`<h2>🥂 ${T('Встреча 11 «Б»','Class 11B get-together')}</h2><p class="mut" style="font-size:16px;margin-top:-4px">${T('Позвонили и зашли ко всем. Дальше — просьбы и вопросы друзей.','You called and visited everyone. Below — your friends’ requests and questions.')}</p><div class="card" style="padding:10px 14px">`;
  for(const o of MR.rows){let L0='';try{const f=root.STORY.friend(W,o.id);L0=SU().lvName?SU().lvName(f.lv):'';}catch(e){}
    h+=`<p style="margin:6px 0;font-size:17px"><b>${esc(nm(o.id))}</b>${L0?` <span class="mut">· ${esc(L0)}</span>`:''}<br><span style="font-size:16px">${esc(rowTx(o))}</span></p>`;}
  h+='</div>';
  for(const qid in MR.ans)h+=`<div class="card" style="padding:10px 14px"><p style="margin:0;font-size:16px">✓ ${esc(MR.ans[qid])}</p></div>`;
  const Qs=qs(W);
  for(const q of Qs){let s=null,ops=[];try{s=SU().ask(W,q);ops=root.STORY.optsOf(W,q);}catch(e){s=null;}if(!s)continue;const wh=SU().speaker?SU().speaker(q):q.w;
    h+=`<div class="card" style="padding:10px 14px"><p style="margin:0 0 6px;font-size:17px">✉️ <b>${esc(nm(wh))}:</b> ${esc(s.tx)}</p>`;
    for(const op of ops){const x=s.o[op.o]||[T('Да','Yes'),''],ok=op.ok===true;
      h+=`<button class="btn w noenter${op.o==='a'&&ok?' accent':''}" data-b2="qol:ans:${esc(q.id)}:${op.o}"${ok?'':' disabled'} style="margin:4px 0">${esc(x[0])}${ok?'':`<small style="display:block;font-size:14px">${esc(SU().why?SU().why(op.ok):'')}</small>`}${x[1]?`<small style="display:block;font-size:14px;font-weight:400">${esc(x[1])}</small>`:''}</button>`;}
    h+='</div>';}
  if(!Qs.length)h+=`<p class="mut" style="font-size:16px">${T('Вопросов от друзей сейчас нет.','No questions from friends right now.')}</p>`;
  h+=`<div class="row"><button class="btn w noenter" data-b2="qol:fr">👥 ${T('К друзьям','Friends')}</button><button class="btn w green" data-esc onclick="hideModal()">${T('Готово','Done')}</button></div>`;
  modal(h);try{modalRe=meetWin;}catch(e){}}
function ans(qid,o){const W=GW();const q=W&&W.fr&&W.fr.q.find(x=>x.id===qid);if(!q)return meetWin();let r;try{r=GAME.act('friendAnswer',qid,o);}catch(e){r=null;}
  if(!r||r.res!=='ok'){sn('no');tst(SU().why?SU().why(r&&r.res||'no'):T('Не получилось','Didn’t work'));return meetWin();}
  sn('tap');let af={tx:''};try{af=SU().after(W,r)||af;}catch(e){}if(MR)MR.ans[qid]=nm(SU().speaker?SU().speaker(q):q.w)+': '+(af.tx||T('Договорились.','Deal.'));if(af.toast)tst(af.toast);
  B2.ev('qol','ans',{k:String(q.k).slice(0,8)});meetWin();}
/* ---------------- погасить все ---------------- */
function plan(W){const ord=l=>l.k==='od'?0:l.frp?3:l.k==='fr'?2:1;const Ls=(W.loans||[]).filter(l=>l.a>0).slice().sort((a,b)=>ord(a)-ord(b)||b.r-a.r);
  let free=Math.max(0,W.cash);try{const p=ECON.cashPlan(W,35);if(p&&p.min)free=Math.min(free,Math.max(0,Math.floor(p.min.a)));}catch(e){}
  const pick=[];let s=0,tot=0;for(const l of Ls){tot+=l.a;const a=Math.min(l.a,free-s);if(a<1)continue;pick.push({id:l.id,a:Math.round(a),full:a>=l.a});s+=Math.round(a);}
  return {pick,s,tot,free,n:Ls.length,nf:pick.filter(x=>x.full).length};}
function rall(){const W=GW();if(!W)return;const p=plan(W);
  let h=`<h2>💸 ${T('Погасить все кредиты','Repay all loans')}</h2><div class="card" style="padding:10px 14px;font-size:17px"><p style="margin:4px 0">${T('Долг всего','Total debt')}: <b>${M(p.tot)}</b> · ${p.n} ${typeof pl==='function'?pl(p.n,'кредит','кредита','кредитов','loan','loans'):''}</p><p style="margin:4px 0">${T('На счёте','In the account')}: <b>${M(W.cash)}</b></p></div>`;
  if(p.s<1)h+=`<p style="font-size:17px">${T('Свободных денег нет: по прогнозу они понадобятся на платежи до 30-го. Гасить сейчас — уйти в минус (овердрафт под высокий процент).','No spare cash: the forecast needs it for payments before the 30th. Repaying now would push you into an expensive overdraft.')}</p><div class="row"><button class="btn w" data-esc onclick="hideModal()">${T('Понятно','OK')}</button></div>`;
  else{h+=p.s>=p.tot?`<p style="font-size:17px">${T(`Погасим всё: <b>${M(p.s)}</b>. Останется ≈ ${M(W.cash-p.s)}, прогноз денег не уходит в минус.`,`We repay everything: <b>${M(p.s)}</b>. About ${M(W.cash-p.s)} stays; the cash forecast stays above zero.`)}</p>`
      :`<p style="font-size:17px">${T(`Всё сразу — нельзя без минуса. Погасим самые дорогие на <b>${M(p.s)}</b> из ${M(p.tot)} (закроем ${p.nf} из ${p.n}) — столько свободно по прогнозу до 30-го.`,`All at once would go below zero. We repay the most expensive ones for <b>${M(p.s)}</b> of ${M(p.tot)} (closing ${p.nf} of ${p.n}) — that’s what the forecast leaves free.`)}</p>`;
    h+=`<p class="mut" style="font-size:15px">${T('Сначала — овердрафт и самые высокие ставки; льготный заём ФРП и заём друга — в последнюю очередь.','Overdraft and the highest rates first; the soft IDF loan and a friend’s loan last.')}</p><div class="row"><button class="btn w green noenter" data-b2="qol:rallgo">💸 ${T('Погасить ','Repay ')}${M(p.s)}</button><button class="btn w" data-esc onclick="hideModal()">${T('Отмена','Cancel')}</button></div>`;}
  modal(h);B2.ev('qol','rall',{n:p.n,a:Math.round(p.s/1e3)});}
function rallGo(){const W=GW();if(!W)return;const p=plan(W);let n=0,s=0;for(const x of p.pick){const r=GAME.act('repay',x.id,x.a);if(r==='ok'){n++;s+=x.a;}}
  hideModal();if(n){sn('coin');tst(T('Погашено: ','Repaid: ')+M(s)+' · '+n+' '+(typeof pl==='function'?pl(n,'кредит','кредита','кредитов','loan','loans'):''));}else sn('no');
  try{if(root.FIN&&FIN.refresh)FIN.refresh();}catch(e){}B2.ev('qol','rallgo',{n,a:Math.round(s/1e3)});}
/* ---------------- соперник: окно хода ---------------- */
function rival(){const W=GW(),mv=W&&W.b2&&W.b2.rival&&W.b2.rival.mv;if(!mv)return;
  B2.need('b2-rival-x.js').then(()=>B2.need('b2-rival-ui.js')).then(()=>{const W2=GW();if(!W2.b2.rival.mv||!B2.rivalUI)return;const c=B2.rivalUI.card(W2);if(!c)return;
    const h=`${c}<p class="mut" style="font-size:15px">${T('Ответ можно дать и позже — карточка на «Сегодня», вывеска соперника на Улице мигает.','You can answer later too — the card is on Today, the rival’s sign on the Street blinks.')}</p><div class="row"><button class="btn w" data-esc onclick="hideModal()">${T('Решить позже','Decide later')}</button></div>`;
    (typeof modalH==='function'?modalH:modal)(h);B2.ev('qol','rvwin',{k:mv.k});
    const mc=document.getElementById('mcard');if(mc)mc.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-b2^="rival:ans"]'))setTimeout(()=>{const W3=GW();if(!(W3&&W3.b2.rival.mv))hideModal();},80);});}).catch(()=>{});}
function click(a,arg){if(a==='meet')meet();else if(a==='ans'){const p=String(arg).split(':'),o=p.pop();ans(p.join(':'),o);}else if(a==='fr'){try{hideModal();FRUI.open('meet');}catch(e){}}
  else if(a==='rall')rall();else if(a==='rallgo')rallGo();}
Q.ui={click,rival,plan,meet};
})(typeof window!=='undefined'?window:globalThis);
