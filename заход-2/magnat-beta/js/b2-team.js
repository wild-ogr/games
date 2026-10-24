/* b2-team.js — TEAM «Команда с характерами» (Магнат 2.0). Модель без DOM + крючки; окна — b2-team-ui.js (B2.need).
   Человек v=(имя*8+черта)*1e4+месяц найма. W.b2.team: p {точка:v} управляющие, d {вид:v} опердиректора. S.b2t: c — лучшие холдинга, v — ветераны (после IPO).
   Доля управляющего 30 % (mgrCut) не трогаем: черта — покупатели/товар/неприятности ±2–5 %. Числа — B2.eco.K 'team.*', пока пусто — KD (предложение ECO). */
(function(){'use strict';
B2.off.team=0;          // 1 — выключено по умолчанию
if(B2.off('team'))return;
const R0=typeof window!=='undefined'?window:globalThis,E=R0.ECON;if(!E||!E.bizMgr||!E.ptMod)return;
const TR=['fast','thrift','bonus','honest','care','rookie','soul'];
const KD={fast_d:1.025,fast_rk:1.3,thrift_v:.975,thrift_d:.99,bonus_hi:1.02,bonus_lo:.985,bonus_rt:4,honest_d:.98,honestD_v:.985,honestD_d:.99,care_rk:.6,care_d:.99,rookie_lo:.98,rookie_hi:1.03,rookie_m:6,soul_d:1.03,soul_v:1.02,dir_m:6,vet_m:12};
const K=k=>{const e=B2.eco,x=e&&e.K&&e.K['team.'+k];return typeof x==='number'?x:KD[k];};
const h32=s=>{let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
const tr=v=>Math.floor(v/1e4)%8,nm=v=>Math.floor(v/8e4),m0=v=>v%1e4;
const mk=(n,t,m)=>(n*8+t)*1e4+Math.max(0,Math.min(9999,m|0));
function T(W){return B2.w(W,'team');}
function rec(W,b){const o=W.b2&&W.b2.team;if(!o)return null;const v=W.opd[b.t]?(o.d&&o.d[b.t]):(b.mgr?o.p&&o.p[b.id]:null);return v==null?null:v;}
// 3 кандидата, своя случайность (RNG мира не трогаем)
function cands(W,key,n){n=n||3;const r=[],ts=[],ns=[];let s=h32(key+':'+W.t+':'+(W.hold||0));
  while(r.length<n){s=h32(s+'x');const t=s%7;if(ts.indexOf(t)>=0)continue;const q=Math.floor(s/7)%576;if(ns.indexOf(q)>=0)continue;ts.push(t);ns.push(q);r.push(mk(q,t,W.m));}return r;}
// эффект черты на точку: {d,p,v,rk}
function eff(W,b,v){const o={d:1,p:1,v:1,rk:1};if(v==null)return o;const k=TR[tr(v)],mo=W.m-m0(v);
  if(k==='fast'){o.d=K('fast_d');o.rk=K('fast_rk');}
  else if(k==='thrift'){o.v=K('thrift_v');o.d=K('thrift_d');}
  else if(k==='bonus')o.p=(b.rt||3.5)>=K('bonus_rt')?K('bonus_hi'):K('bonus_lo');
  else if(k==='honest'){if(W.opd[b.t]){o.v=K('honestD_v');o.d=K('honestD_d');}else o.d=K('honest_d');}
  else if(k==='care'){o.rk=K('care_rk');o.d=K('care_d');}
  else if(k==='rookie')o.d=mo>=K('rookie_m')?K('rookie_hi'):K('rookie_lo');
  else if(k==='soul'){o.d=K('soul_d');o.v=K('soul_v');}
  return o;}
const pm0=E.ptMod;
E.ptMod=function(W,b,m,noEv){const o=pm0(W,b,m,noEv);if(W.ned)return o;const v=rec(W,b);if(v==null)return o;const x=eff(W,b,v);o.d*=x.d;o.p*=x.p;o.v*=x.v;o.rk*=x.rk;return o;};
const rk0=E.ptRk;
E.ptRk=function(W,b,k){let x=rk0(W,b,k);if(x===1&&k&&{viral:1,fleet:1,order:1}[k])return x;if(!W.ned){const v=rec(W,b);if(v!=null)x*=eff(W,b,v).rk;}return x;};
function put(W,b,v){const o=T(W);(o.p||(o.p={}))[b.id]=v;if(TR[tr(v)]==='honest'){b.hon=5;b.th=0;}else if(b.hon===5&&o.h&&o.h[b.id])delete o.h[b.id];}
let pick=null;   // выбор игрока из окна (b2-team-ui): {id|t, v}
const bm0=E.bizMgr;
E.bizMgr=function(W,id,on){const r=bm0.apply(this,arguments);if(r!=='ok')return r;const b=W.biz.find(x=>x.id===id),o=T(W);
  if(on&&b){put(W,b,pick&&pick.id===id?pick.v:cands(W,id)[0]);}else if(o.p)delete o.p[id];pick=null;return r;};
const bf0=E.bizFire;
E.bizFire=function(W,id){const r=bf0.apply(this,arguments);if(r!=='ok')return r;const b=W.biz.find(x=>x.id===id);if(b)put(W,b,pick&&pick.id===id?pick.v:cands(W,id+'f')[0]);pick=null;return r;};
// опердиректор: по умолчанию — повышение лучшего управляющего этой сети (стаж ≥ dir_m мес.), иначе человек со стороны
function inside(W,t){const o=T(W),r=[];for(const b of W.biz)if(b.t===t&&b.mgr&&o.p&&o.p[b.id]!=null&&W.m-m0(o.p[b.id])>=K('dir_m'))r.push({id:b.id,v:o.p[b.id]});return r.sort((a,c)=>m0(a.v)-m0(c.v));}
const od0=E.opdHire;
E.opdHire=function(W,t,on){const ins=on&&!W.opd[t]?inside(W,t):[];const r=od0.apply(this,arguments);if(r!=='ok')return r;const o=T(W);
  if(on){if(!(o.d&&o.d[t]!=null)){const v=pick&&pick.t===t?pick.v:(ins.length?ins[0].v:cands(W,'d'+t)[0]);(o.d||(o.d={}))[t]=v;}
    if(o.p)for(const b of W.biz)if(b.t===t)delete o.p[b.id];}
  else if(o.d)delete o.d[t];pick=null;return r;};
// раз в месяц: без записи — человек по умолчанию; лишние — вон; лучшие — в S.b2t.c
function best(W){const o=T(W),r=[];for(const t in o.d||{})if(W.opd[t])r.push([o.d[t]-m0(o.d[t]),2,W.m-m0(o.d[t])]);
  for(const id in o.p||{}){const mo=W.m-m0(o.p[id]);if(mo>=K('vet_m'))r.push([o.p[id]-m0(o.p[id]),1,mo]);}
  return r.sort((a,c)=>c[1]-a[1]||c[2]-a[2]).slice(0,3);}
function fix(W){if(W.ned||!W.biz)return;const o=T(W);
  if(o.p){for(const id in o.p){const b=W.biz.find(x=>x.id===id);if(!b||!b.mgr||W.opd[b.t]||(TR[tr(o.p[id])]==='honest'&&b.hon!==5))delete o.p[id];}}
  if(o.d)for(const t in o.d)if(!W.opd[t])delete o.d[t];
  for(const b of W.biz)if(b.mgr&&b.st==='w'&&!W.opd[b.t]&&E.BIZ[b.t]&&E.BIZ[b.t].mw&&!(o.p&&o.p[b.id]!=null))put(W,b,cands(W,b.id)[0]);
  const s=B2.s('t'),c=best(W);if(c.length)s.c=c;}
const oc0=E.ownClose;
E.ownClose=function(W,M,off){oc0.apply(this,arguments);try{fix(W);}catch(e){}};
B2.mig('team',(W,o)=>{if(o.p&&typeof o.p!=='object')o.p={};if(o.d&&typeof o.d!=='object')o.d={};try{fix(W);}catch(e){}});
// IPO: лучшие этого холдинга переходят с вами (если в новом мире их нет — остаются прежние ветераны)
function onIpo(){const s=B2.s('t');if(Array.isArray(s.c)&&s.c.length){s.v=s.c.slice(0,3);s.c=[];s.n=(s.n|0)+1;}}
// ветераны в новом крае: множитель по ключу (для KRAI): 'build' срок стройки, 'cost' постоянные, 'prod' добыча, 'risk' аварии
const VK={fast:['build',.95],thrift:['cost',.97],bonus:['prod',1.03],honest:['cost',.98],care:['risk',.9],rookie:['prod',1.04],soul:['prod',1.02]};
function kk(W,key){B2.team.used=1;const s=B2.s('t');let x=1;if(!W||!W.ned||!Array.isArray(s.v))return 1;for(const p of s.v){const q=VK[TR[tr(p[0])]];if(q&&q[0]===key)x*=q[1];}return Math.max(.9,Math.min(1.06,x));}
B2.team={TR,K,KD,tr,nm,m0,mk,cands,eff,rec,inside,best,fix,kk,VK,onIpo,setPick(p){pick=p;},T};
if(typeof document==='undefined')return;
const ui=(f,...a)=>B2.need('b2-team-ui.js').then(()=>B2.teamUI&&B2.teamUI[f]&&B2.teamUI[f](...a)).catch(()=>{});
if(R0.GAME&&GAME.on)GAME.on('ipo',onIpo);
if(R0.GAME&&GAME.act){const a0=GAME.act;GAME.act=function(n,...a){const p=pick,r=a0.apply(this,[n,...a]);
  if(r==='ok'&&!p){if(n==='bizMgr'&&a[1]||n==='bizFire')setTimeout(()=>ui('hire',a[0],n==='bizFire'),60);else if(n==='opdHire'&&a[1])setTimeout(()=>ui('dir',a[0]),60);}return r;};}
B2.slot('cab','team',ctx=>{const W=ctx.W;if(!W||W.ned&&!(B2.s('t').v||[]).length)return '';const o=W.b2&&W.b2.team||{};
  const np=Object.keys(o.p||{}).length,nd=Object.keys(o.d||{}).length,nv=(B2.s('t').v||[]).length;if(!np&&!nd&&!nv)return '';
  const t=[np?np+' '+pl(np,'управляющий','управляющих','управляющих','manager','managers'):'',nd?nd+' '+pl(nd,'директор','директора','директоров','director','directors'):'',W.ned&&nv?L('ветеранов: ','veterans: ')+nv:''].filter(Boolean).join(' · ');
  return `<button class="b2c b2c-goal b2c-mini noenter" data-b2="team:open" style="width:100%;text-align:left">👥 <span>${L('Команда','Team')}</span> <small>${t}</small></button>`;},30);
B2.click('team',(a,arg)=>{if(a==='open')ui('open');else ui('act',a,arg);});
})();
