/* b2-krai.js — KRAI «Империя»: движок края = профиль над «Недрами» (ECON.REGS/KM/GOODS/OBJ/DEP/BOTS на месте; снимок B — обычному миру).
   Описание — logs/KRAI.md; вид, звёзды, IPO — b2-krai-ui.js; ФОРМАТ КРАЯ — b2-krai-data.js. TEAM — tkey; миссии VK — внизу. */
(function(root){'use strict';
const E=root.ECON,B2=root.B2;if(!E||!B2)return;
const KR=root.KRAI={v:1,ord:[]};
const KEYS=['kuz','ural','kar'],cl=o=>JSON.parse(JSON.stringify(o));
function setO(d,s){for(const k of Object.keys(d))delete d[k];Object.assign(d,s);}
const DF='b2-krai-data.js';
function loadSync(){if(root.KRAI_DATA)return;if(typeof document==='undefined'){try{B2.need(DF);}catch(e){}return;}
  try{const x=new XMLHttpRequest();x.open('GET','js/'+DF,false);x.send(null);if(x.status===200||(x.status===0&&x.responseText))(0,eval)(x.responseText);}catch(e){try{console.error('KRAI data',e);}catch(z){}}}
function data(id){if(!id)return null;if(!root.KRAI_DATA)loadSync();const D=root.KRAI_DATA&&root.KRAI_DATA[id];return D&&D.reg?D:null;}
KR.data=data;KR.list=()=>{if(!root.KRAI_DATA)loadSync();const K=root.KRAI_DATA||{};return Object.keys(K).filter(k=>K[k]&&K[k].no).sort((a,b)=>K[a].no-K[b].no);};
let B=null,cur='',P=null;
function snap(){if(B)return;B={reg:{},km:cl(E.KM),gl:E.GL.slice(),goods:Object.keys(E.GOODS),obj:{},mine:cl(E.MINE_OF),dep:cl(E.DEP),sg:cl(E.SEG_G),bots:E.BOTS.slice(),bar:E.IPO_BAR.slice()};
  for(const r of KEYS)B.reg[r]=cl(E.REGS[r]);for(const t in E.OBJ)B.obj[t]=cl(E.OBJ[t]);}
function restore(){for(const r of KEYS)setO(E.REGS[r],cl(B.reg[r]));setO(E.KM,cl(B.km));
  for(const g of Object.keys(E.GOODS))if(B.goods.indexOf(g)<0)delete E.GOODS[g];E.GL.length=0;for(const g of B.gl)E.GL.push(g);
  for(const t of Object.keys(E.OBJ)){if(!B.obj[t])delete E.OBJ[t];else setO(E.OBJ[t],cl(B.obj[t]));}
  setO(E.MINE_OF,cl(B.mine));setO(E.DEP,cl(B.dep));setO(E.SEG_G,cl(B.sg));E.BOTS.length=0;for(const b of B.bots)E.BOTS.push(b);
  for(let i=0;i<B.bar.length;i++)E.IPO_BAR[i]=B.bar[i];KR.ord=[];}
function apply(key){if(key===cur)return;snap();restore();cur='';P=null;if(!key)return;
  const p=key.split('|'),id=p[0],cs=p[1]?p[1].split(','):[],tm=p[2]?p[2].split(',').map(Number):[1,1,1,1],D=data(id);if(!D)return;
  for(const r in D.reg)setO(E.REGS[r],cl(D.reg[r]));setO(E.KM,cl(D.km));
  for(const g in D.goods||{}){E.GOODS[g]=cl(D.goods[g]);E.GL.push(g);}
  Object.assign(E.DEP,cl(D.dep||{}));Object.assign(E.MINE_OF,D.mine||{});Object.assign(E.SEG_G,D.sg||{});for(const t in D.obj||{})E.OBJ[t]=cl(D.obj[t]);
  KR.ord=(D.ord||[]).slice();if(D.rival)E.BOTS.push(cl(D.rival));if(D.ipo)for(let i=0;i<E.IPO_BAR.length;i++)E.IPO_BAR[i]=D.ipo;
  if(cs.indexOf('north')>=0){for(const k in E.KM)E.KM[k]=Math.round(E.KM[k]*1.4);for(const r of KEYS)E.REGS[r].ex=Math.round(E.REGS[r].ex*1.2);}
  if(cs.indexOf('green')>=0)for(const t in E.OBJ)if(E.OBJ[t].dep)E.OBJ[t].fix=Math.round(E.OBJ[t].fix*1.15);
  if(tm[0]!==1)for(const t in E.OBJ)E.OBJ[t].capex=Math.round(E.OBJ[t].capex*tm[0]);if(tm[1]!==1)for(const g in E.DEP)E.DEP[g].vc=E.DEP[g].vc.map(v=>Math.round(v*tm[1]));   /* TEAM: стройка, себестоимость новых участков */
  const R=D.rule||{};P={id,D,cs,sale:R.sale||null,prod:R.prod||null,px:R.px||null,ev:R.ev||null,e:null,tp:tm[2],tr:tm[3]};cur=key;}
const keyOf=W=>{const k=W&&W.b2&&W.b2.krai;return k&&k.id?k.id+'|'+(k.c||[]).join(','):'';};
const tc={w:null,m:-1,v:''};function tkey(W){const f=B2.team&&B2.team.kk;if(!f||!keyOf(W))return '';if(tc.w!==W||tc.m!==W.m){tc.w=W;tc.m=W.m;let v='';try{v='|'+['build','cost','prod','risk'].map(x=>Math.round((+f(W,x)||1)*100)/100).join(',');}catch(e){}tc.v=v==='|1,1,1,1'?'':v;}return tc.v;}
KR.use=function(W){if(!W)return;const key=keyOf(W)+tkey(W);if(key!==cur)apply(key);if(P&&key){const k=W.b2.krai;acc(W,k);P.e=k.e&&W.m<k.e.u&&P.ev?P.ev[k.e.i]:null;}};
KR.on=()=>!!P;KR.cur=()=>P;
const mo=W=>((W.m%12)+12)%12;
function hit(W,o,x){if(x.dep&&!E.OBJ[o.t].dep)return false;if(x.t&&x.t.indexOf(o.t)<0)return false;return true;}
KR.pk=function(W,o){if(!P||!(P.prod||P.e||P.tp!==1))return 1;let k=P.tp;   /* TEAM: выпуск */const m=mo(W);
  if(P.prod)for(const x of P.prod)if(x.m.indexOf(m)>=0&&hit(W,o,x))k*=x.x;
  if(P.e&&P.e.prod&&hit(W,o,P.e.prod))k*=P.e.prod.x;return k;};
KR.px=function(W,r,g){if(!P||!(P.px||P.e))return 1;let k=1;const m=mo(W);
  if(P.px)for(const x of P.px)if(x.m.indexOf(m)>=0&&x.g.indexOf(g)>=0&&(!x.r||x.r.indexOf(r)>=0))k*=x.x;
  if(P.e&&P.e.px&&P.e.px.g.indexOf(g)>=0)k*=P.e.px.x;return k;};
KR.no=function(W,r,g){const s=P&&P.sale;if(!s)return false;return s.r.indexOf(r)>=0&&s.open.indexOf(mo(W))<0&&!(s.free&&s.free.indexOf(g)>=0);};
KR.bst=()=>P&&P.D.bots?cl(P.D.bots):null;
KR.closed=(W,r)=>{const s=P&&P.sale;return !!s&&s.r.indexOf(r)>=0&&s.open.indexOf(mo(W))<0;};
KR.pre=function(o){let id=o.kr,c=o.krc;if(!id&&KR.pend&&!o.rags&&!o.tut){id=KR.pend.id;c=KR.pend.c;}
  const D=!o.rags&&data(id);if(!D){apply('');return null;}c=(c||[]).filter(x=>(D.cond||[]).indexOf(x)>=0);apply(id+'|'+c.join(','));if(D.cap)o.cap=D.cap;
  return W=>{const k=B2.w(W,'krai');k.id=id;if(c.length)k.c=c;k.m0=W.m;if(D.home)W.home=D.home;W.nx={cu:1};if(c.indexOf('money')>=0)W.key=Math.round((W.key+.03)*1000)/1000;};};
function hr(W,n){let x=((W.seed>>>0)^Math.imul(n+7,0x9E3779B1))>>>0;x^=x>>>16;x=Math.imul(x,0x85ebca6b)>>>0;x^=x>>>13;x=Math.imul(x,0xc2b2ae35)>>>0;x^=x>>>16;return (x>>>0)/4294967296;}
function acc(W,k){const r=W.reps&&W.reps[W.reps.length-1];if(!r||r.m===k.lm)return;k.lm=r.m;
  for(const g in P.D.goods||{}){const q=r.sold&&r.sold[g];if(q>0){if(!k.s)k.s={};k.s[g]=Math.round((k.s[g]||0)+q);}}
  let mr=0;for(const l of W.loans)if(!l.frp&&l.k!=='od'&&!l.san)mr=Math.max(mr,l.r);if(mr>(k.lr||0))k.lr=Math.round(mr*1e4)/1e4;
  if(P.ev&&!(k.e&&W.m<k.e.u)&&W.m-(k.m0||0)>=3&&hr(W,W.m)<(P.ev[0].p||.12)*P.tr){let s=0;for(const e of P.ev)s+=e.w||1;let x=hr(W,W.m+999)*s,i=0;for(;i<P.ev.length-1;i++){x-=P.ev[i].w||1;if(x<0)break;}
    const e=P.ev[i];k.e={i,u:W.m+(e.mo||1)};if(e.cash){const a=Math.round(-e.cash),t=E.tg('ev');try{if(a>0){E._.pay(W,a,'oth');E._.pl(W,'oth',-a);}else{E._.recv(W,-a,'oth');E._.pl(W,'oth',-a);}}finally{E.tg(t);}}
    E._.news(W,'krai',{k:e.k});}}
B2.off.krai=0;          // 1 — выключено по умолчанию
if(B2.off('krai'))return;
let uiP=null;
function needUI(){if(!uiP)uiP=B2.need('b2-krai-ui.js').then(()=>{if(root.UI&&UI.refresh)UI.refresh();}).catch(()=>{uiP=null;});return uiP;}
KR.needUI=needUI;
const ui=(n,ctx)=>{if(KR.UI&&KR.UI[n])return KR.UI[n](ctx||{});const W=root.GAME&&GAME.W;if(W&&W.ned)needUI();return '';};
B2.slot('today','krai',ctx=>ui('today',ctx),70);
B2.slot('ipo','krai',ctx=>ui('ipo',ctx),50);
B2.slot('cab','krai',ctx=>ui('cab',ctx),30);B2.slot('reg','krai',ctx=>ui('reg',ctx),50);
B2.click('krai',(a,arg,el,ev)=>{if(KR.UI&&KR.UI.click)KR.UI.click(a,arg,el,ev);else needUI();});
function boot(){const W=root.GAME&&GAME.W;if(!W||typeof document==='undefined')return;
  if(W.ned)needUI();if(!keyOf(W))return;if(root.KRAI_DATA){KR.use(W);return;}
  GAME.hold.add('krai');B2.need(DF).then(()=>KR.use(GAME.W),()=>{}).then(()=>{GAME.hold.delete('krai');if(root.UI&&UI.refresh)UI.refresh();});}
{const sk=()=>B2.s('k'),st=()=>sk().st||{},n3=b=>(b&1)+(b>>1&1)+(b>>2&1),ks=()=>Object.keys(st());
const ok=k=>{const W=root.GAME&&GAME.W,c=keyOf(W).split('|')[0],L=KR.list();return k==='map'?!!c||ks().length>0:L.indexOf(k)>=0?c===k||!!st()[k]:k==='star3'?ks().some(x=>st()[x]===7):
  k==='star10'?ks().reduce((a,x)=>a+n3(st()[x]),0)>=10:k==='starall'?L.length>0&&L.every(x=>st()[x]===7):k==='rival'?!!sk().rv:typeof S!=='undefined'&&(S.fame||[]).some(f=>f.kr);};
B2.vkm('krai','map:10,yak:20,nor:20,sah:25,alt:25,corp:50,star3:12,star10:20,starall:40,rival:10,fame:15'.split(',').map(x=>{const q=x.split(':');return {id:'kr_'+q[0],p:+q[1],ok:()=>ok(q[0])};}));}
if(root.KRAI_UI)root.KRAI_UI();
if(typeof document!=='undefined'){boot();if(root.GAME&&GAME.on)GAME.on('ipo',()=>{needUI();});}
})(typeof window!=='undefined'?window:globalThis);
