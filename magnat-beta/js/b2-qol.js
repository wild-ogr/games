/* b2-qol.js — QOL (M52, бета-15): удобства по тесту беты-14 (стартовый ≤ 8 КБ; окна — b2-qol-ui.js по требованию). Устройство — S.b2Q.
   1) «🥂 Встреча 11 «Б»» — B2.qol.meetBtn(W) в окне «Друзья» (крючок friends-ui open): раз в игровой месяц звонок и визит ко всем сразу, ответы — одним окном.
   2) «Погасить все» — B2.qol.rallBtn(W) в «Финансы → Банк» (крючок fin.js finBank): дорогие сначала, без ухода в минус по прогнозу денег.
   3) Тихое «Закрытие месяца» — B2.qol.quiet(rep) (крючок ui.js openClose): спокойный месяц — полоска-итог без остановки времени; ⚙ «Отчёт месяца».
   4) Соперники: новый ход — карточка окном (очередь окон showQ, время стоит). Нажатия — data-b2="qol:<действие>". */
(function(root){'use strict';
const B2=root.B2;if(!B2||B2.off('qol'))return;
const T=(r,e)=>typeof L==='function'?L(r,e):r,HAS=typeof document!=='undefined';
const st=()=>B2.s('Q'),GW=()=>root.GAME&&GAME.W;
const FR=['owl','beav','bars','vit'];
let uiP=null;const ui=()=>{if(!uiP)uiP=B2.need('b2-qol-ui.js').catch(e=>{uiP=null;throw e;});return uiP;};
const Q=B2.qol={};
/* ---- 1. встреча ---- */
Q.meetLeft=W=>{if(!W||!W.fr)return 0;let n=0;for(const id of FR){const x=W.fr[id];if(x&&(x.km!==W.m||x.vm!==W.m))n++;}return n;};
Q.meetBtn=W=>{if(!W||!W.fr)return '';const n=Q.meetLeft(W);
  return `<div class="row"><button class="btn w ${n?'accent':''} noenter" data-b2="qol:meet"${n?'':' style="opacity:.55"'}>🥂 ${T('Встреча 11 «Б» — ко всем сразу','Class 11B get-together — everyone at once')}<small style="display:block;font-size:15px;font-weight:400">${n?T('звонок и визит каждому, ответы — одним окном','a call and a visit to each, replies in one window'):T('в этом месяце уже виделись','already met this month')}</small></button></div>`;};
/* ---- 2. погасить все ---- */
Q.rallBtn=W=>{if(!W||!W.loans||W.loans.length<2||W.cash<=0)return '';
  return `<button class="btn w noenter" data-b2="qol:rall" style="margin:0 0 10px">💸 ${T('Погасить все кредиты…','Repay all loans…')}</button>`;};
/* ---- 3. тихое закрытие месяца ---- */
let offN=-1;
Q.mode=()=>st().mr==='all'?'all':'calm';
Q.calm=(W,rep)=>{if(!W||!rep||Q.mode()==='all')return false;const p=rep.pl||{},net=root.ECON&&ECON.netOf?ECON.netOf(p):0;
  const on=(W.offers||[]).length,newOff=offN>=0&&on>offN;offN=on;
  if(rep.san||rep.ev||newOff||net<0||rep.c1<0||(W.odM|0)>0||W.m<4||(rep.m+1)%12===0)return false;
  if(W.tut&&W.hold===1)return false;
  if(W.ow&&W.ow.ev||W.b2&&W.b2.rival&&W.b2.rival.mv||W.fr&&W.fr.q&&W.fr.q.length)return false;
  try{if(typeof tutStep==='function'&&tutStep())return false;}catch(e){}
  return true;};
Q.quiet=rep=>{const W=GW();if(!HAS||!Q.calm(W,rep))return false;bar(W,rep);B2.ev('qol','calm',{m:rep.m});return true;};
function bar(W,rep){let el=document.getElementById('qolBar');if(!el){el=document.createElement('div');el.id='qolBar';document.body.appendChild(el);
    const s=document.createElement('style');s.textContent=`#qolBar{position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;width:min(440px,calc(100% - 24px));display:none}
#qolBar.on{display:block}#qolBar button{width:100%;min-height:54px;border:0;border-radius:16px;background:#1c274c;color:#fff;font:600 17px/1.25 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:8px 14px;text-align:left;box-shadow:0 8px 22px -8px rgba(0,0,0,.5)}
#qolBar small{display:block;font-weight:400;font-size:15px;opacity:.85}`;document.head.appendChild(s);}
  const net=ECON.netOf(rep.pl),M=v=>root.FMT?FMT.money(v):Math.round(v)+' ₽',mn=root.FMT&&FMT.date?FMT.date(rep.m):'';
  el.innerHTML=`<button class="noenter" data-b2="qol:rep:${rep.m}">📅 ${T('Месяц закрыт','Month closed')}${mn?': '+mn:''} · <b>${net>0?'+':''}${M(net)}</b><small>${T('Спокойный месяц. Полный отчёт ›','A calm month. Full report ›')}</small></button>`;
  el.classList.add('on');clearTimeout(bar.t);bar.t=setTimeout(()=>el.classList.remove('on'),9000);}
B2.slot('settings','qol',()=>`<button class="set noenter" data-b2="qol:mr"><span>📅 ${T('Отчёт месяца','Month report')}<br><small>${Q.mode()==='all'?T('всегда окном','always as a window'):T('окном — только важные, спокойные — полоской','window only when important, calm months — a strip')}</small></span><i class="go">›</i></button>`,40);
/* ---- 4. соперники: ход — окном ---- */
let rvSeen='';
B2.on('rival',k=>{if(!HAS||['open','price','poach','sell'].indexOf(k)<0)return;const W=GW(),mv=W&&W.b2&&W.b2.rival&&W.b2.rival.mv;if(!mv)return;const key=mv.f+mv.end;if(key===rvSeen)return;rvSeen=key;
  ui().then(()=>{const go=()=>Q.ui&&Q.ui.rival();if(root.UI&&UI.showQ)UI.showQ(go);else go();}).catch(()=>{});});
B2.click('qol',(a,arg,el)=>{try{if(typeof snd==='function')snd('tap');}catch(e){}
  if(a==='rep'){const W=GW(),r=W&&W.reps.find(x=>x.m===+arg);const b=document.getElementById('qolBar');if(b)b.classList.remove('on');if(r&&root.UI&&UI.openClose)UI.openClose(r,true);return;}
  if(a==='mr'){st().mr=Q.mode()==='all'?'calm':'all';try{save();}catch(e){}try{if(typeof modalRe==='function')modalRe();}catch(e){}if(typeof toast==='function')toast('📅 '+(Q.mode()==='all'?T('Отчёт месяца — всегда окном','Month report — always a window'):T('Спокойный месяц — полоской','Calm month — a strip')));return;}
  ui().then(()=>Q.ui&&Q.ui.click(a,arg,el)).catch(()=>{if(typeof toast==='function')toast(T('Нет связи — попробуйте ещё раз','No connection — try again'));});});
})(typeof window!=='undefined'?window:globalThis);
