/* b2-rival-x.js — RIVAL: модель соперников (по требованию; в jsc грузится сразу). Без DOM.
   Доли: W.b2.rival.sh['город.вид'] = {фирма: ‰ рынка}; сумма ≤ rival.share_max (15 %). Фирмы входят в рынки игрока («Сеть», «Карьер»),
   растут к своей цели; раз в 4–6 игровых месяцев — ход (open/price/poach/sell) с ответом (promo/cut/pay/buy/none) за 20 дней; без ответа — none.
   Случайность — своя (хеш от seed мира, дня и ключа): поток W.rs не трогаем, прогноз денег = факт.
   API (B2.rivalX): close(W,off) — шаг в закрытие месяца; mod(W,b,m,o) — временные эффекты (цена после «снизить», точка без управляющего);
   opts(W,mv) — варианты с ценой и пользой ₽/мес; ans(W,k) → 'ok'|'cash'|'no'; best(W) — выгоднейший ответ; tick(W) — срок ответа. */
(function(){'use strict';
if(typeof ECON==='undefined'||B2.off('rival'))return;   // грузится и раньше b2-rival.js (jsc: по алфавиту)
const E=ECON,_=E._,MAIN=['beav','bear','ryad'];
// куда тянется фирма (вид → вес): Борис — еда и киоски, Топтыгин — крупное (мойки, сервис), «Рядышком» — розница у дома
const LIKE={beav:{kiosk:3,shaw:3,coffee:2,flow:2,bakery:2,truckf:2,vend:1,canteen:1},bear:{wash:3,sto:3,tire:3,club:2,canteen:2,clean:2,gazel:2,barber:1},
  ryad:{kiosk:2,pharm:3,hard:3,bakery:2,pvz:3,vend:2,clean:1,barber:2,flow:1}};
const TGT={beav:60,bear:55,ryad:50};   // ‰ — к чему растёт фирма в рынке без ответа игрока
const DAYS=20;
function hash(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;}
const rnd=(W,s)=>hash((W.seed|0)+'|'+W.t+'|'+s);
const cap=()=>Math.round(1000*(B2.eco?B2.eco.k('rival.share_max',.15):.15));
const O=W=>B2.w(W,'rival');
const sum=m=>{let x=0;for(const i in m)x+=m[i];return x;};
function mkts(W){const r={};for(const b of W.biz){if(b.st!=='w'||!E.OWN_TR||!E.OWN_TR[b.t])continue;const k=b.c+'.'+b.t;(r[k]||(r[k]=[])).push(b);}return r;}
function rev(W,key){let r=0,p=0;for(const b of W.biz)if(b.c+'.'+b.t===key&&b.st==='w'){r+=b.lr||0;p+=b.pm&&b.pm.length?b.pm[b.pm.length-1]:0;}return {r,p};}
function add(o,key,f,d){const m=o.sh[key]||(o.sh[key]={});const c=cap(),oth=sum(m)-(m[f]||0);m[f]=Math.max(0,Math.min(c-oth,(m[f]||0)+d));if(!m[f])delete m[f];if(!Object.keys(m).length)delete o.sh[key];}
function log(o,W,f,k,key,a){const [c,t]=key.split('.');o.lg.push({m:W.m,f,k,c,t,a:a||''});if(o.lg.length>6)o.lg.shift();}
function who(t,W,key){let best=null,bw=0;for(const f of MAIN){const w=(LIKE[f][t]||.5)*(.5+rnd(W,key+f));if(w>bw){bw=w;best=f;}}return best;}
// ---- закрытие месяца
function close(W,off){const o=O(W);if(!o.sh)o.sh={};if(!o.lg)o.lg=[];if(!o.md)o.md={};const st=E.stI(W);if(st<2)return;
  const M=mkts(W);
  for(const key in o.sh)if(!M[key])delete o.sh[key];   // ушли из рынка — соперник нам больше не мешает (и не помним)
  for(const key in M){const t=key.split('.')[1],m=o.sh[key];
    if(!m){if(rnd(W,'in'+key)<.12+.04*M[key].length){const f=who(t,W,key);add(o,key,f,20);log(o,W,f,'in',key);}continue;}
    for(const f in m)if(m[f]<(TGT[f]||40))add(o,key,f,4);}
  if(o.cut)for(const k in o.cut)if(o.cut[k][0]<=W.m)delete o.cut[k];
  if(o.pn)for(const k in o.pn)if(o.pn[k][0]<=W.m)delete o.pn[k];
  if(o.mv&&o.mv.end<=W.t)ans(W,'none',1);
  if(o.nx==null)o.nx=W.m+2+Math.floor(rnd(W,'nx0')*3);
  if(!o.mv&&W.m>=o.nx){mvNew(W,o,M);o.nx=W.m+4+Math.floor(rnd(W,'nx')*3);}
  for(const f of MAIN)o.md[f]=o.mv&&o.mv.f===f?(o.mv.k==='sell'?'sell':'war'):'calm';}
function mvNew(W,o,M){const ks=Object.keys(M);if(!ks.length)return;
  ks.sort((a,b)=>rev(W,b).r-rev(W,a).r);const key=ks[Math.floor(rnd(W,'mk')*Math.min(3,ks.length))],[c,t]=key.split('.'),m=o.sh[key]||{};
  let f=Object.keys(m).sort((a,b)=>m[b]-m[a])[0]||who(t,W,key);const r=rnd(W,'k');let k;
  const mgr=M[key].find(b=>b.mgr);
  if(m[f]>=(TGT[f]||40)&&r<.35)k='sell';else if(mgr&&r<.5)k='poach';else k=r<.75?'open':'price';
  const mv={f,k,c,t,end:W.t+DAYS,m:W.m};if(k==='poach')mv.id=mgr.id;
  if(k==='open')add(o,key,f,30);else if(k==='price')add(o,key,f,20);
  o.mv=mv;log(o,W,f,k,key);if(B2.emit)B2.emit('rival',k);}
// ---- варианты ответа с ценой и пользой (₽ в месяц на год вперёд)
function opts(W,mv){mv=mv||O(W).mv;if(!mv)return [];const key=mv.c+'.'+mv.t,R=rev(W,key),s=((O(W).sh[key]||{})[mv.f])|0,g=d=>Math.round(d/1000*R.r*.45/1000)*1000;
  const ck=B2.eco?B2.eco.k('rival.cut_k',1):1,bk=B2.eco?B2.eco.k('rival.buy_k',1):1;
  if(mv.k==='sell')return [{k:'buy',cost:Math.max(50e3,Math.round(s/1000*R.r*4*bk/1000)*1000),gain:g(s)},{k:'none',cost:0,gain:0}];
  if(mv.k==='poach'){const b=W.biz.find(x=>x.id===mv.id);return [{k:'pay',cost:Math.max(30e3,Math.round(((b&&b.mp)||40e3)*2/1000)*1000),gain:0},{k:'none',cost:0,gain:-Math.round(((b&&b.lr)||0)*.1*.45/1000)*1000,mo:3}];}
  const a=Math.min(60,s),c=Math.min(50,s);
  return [{k:'promo',cost:Math.max(30e3,Math.round(R.r*.25/1000)*1000),gain:g(a)},{k:'cut',cost:Math.round(R.r*.04*3*ck/1000)*1000,gain:g(c),pr:1},{k:'none',cost:0,gain:0}];}
function best(W){const p=opts(W);let b=null,bv=-1e18;for(const x of p){if(x.cost>W.cash&&!x.pr)continue;const v=x.gain*(x.mo||12)-x.cost;if(v>bv){bv=v;b=x;}}return b?b.k:'none';}
// ---- ответ игрока (или авто по сроку)
function ans(W,k,auto){const o=O(W),mv=o.mv;if(!mv)return 'no';const key=mv.c+'.'+mv.t,x=opts(W,mv).find(z=>z.k===k);if(!x)return 'no';
  if(x.cost>0&&!x.pr){if(W.cash<x.cost)return 'cash';const p=E.tg('a.rival');E.bizCost(W,x.cost,k==='buy'?'oth':'adm',k==='buy'?'oth':'adm','retail');E.tg(p);}
  if(k==='promo')add(o,key,mv.f,-60);
  else if(k==='cut'){(o.cut||(o.cut={}))[key]=[W.m+3,.04];add(o,key,mv.f,-50);}
  else if(k==='buy'){add(o,key,mv.f,-1000);if(B2.eco)B2.eco.give('rival.win');}
  else if(k==='none'&&mv.k==='sell'){const s=((o.sh[key]||{})[mv.f])|0;add(o,key,mv.f,-1000);add(o,key,'ryad',Math.round(s/2));}
  else if(k==='none'&&mv.k==='poach')(o.pn||(o.pn={}))[mv.id]=[W.m+3,.1];
  if(!auto&&typeof S!=='undefined'&&B2.s){const r=B2.s('r');r.a=(r.a|0)+1;r[k]=(r[k]|0)+1;}
  o.mv=null;o.la={k:mv.k,a:k,f:mv.f,m:W.m,auto:auto?1:0};log(o,W,mv.f,'a',key,k);
  if(B2.ev)try{B2.ev('rival','ans',{k:mv.k,a:k,au:auto?1:0});}catch(e){}if(B2.emit)B2.emit('rival','ans');return 'ok';}
function mod(W,b,m,o){const R=W.b2.rival;if(R.cut){const c=R.cut[b.c+'.'+b.t];if(c&&c[0]>W.m)o.p*=1-c[1];}if(R.pn){const p=R.pn[b.id];if(p&&p[0]>W.m)o.d*=1-p[1];}}
B2.rivalX={close,mod,opts,ans,best,hash};E.rivAns=(W,k)=>ans(W,k);
})();
