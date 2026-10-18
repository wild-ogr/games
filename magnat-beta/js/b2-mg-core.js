/* b2-mg-core.js — MGCORE: оболочка мини-игр «💪 Сделать самому» (тяжёлое — b2-mg-core-ui.js). Журнал M50-boost/logs/MGCORE.md
 ДОГОВОР MG (образец — js/b2-mg-flyer.js «Листовки у метро»; подробно о sh — шапка b2-mg-core-ui.js):
 1. ОПИСЬ — в стартовом файле потока: if(window.MG)MG.add({id:'shaw',o:'mg1',n:[ru,en],ico,u:[[1,2,5],[en1,enN]],md:[бр,сер,зол],mid,lower,hook:{gig:[],job:[]},open(W),day})
    id a-z 2–10 → игра js/b2-mg-<id>.js; o — поток (его B2.off выключает игру); md — золото с 1-го раза почти недостижимо; mid — «хорошая рука»;
    lower:1 — меньше лучше (время в десятых); hook — GIGS (biz.js) / JOBS neg fly check stand (owner.js); open(W) — открыта ли; day:0 — не в «Мини-игру дня».
 2. ИГРА — js/b2-mg-<id>.js (по требованию): MG.game(id,{hero:{n,a,c,l},how:[ru,en],hand:'tap'|'hold'|'swipe',dur:30|0,fmt,btns,make(sh)→{reset(demo),step(dt),draw(c),down(x,y),move,up,key(k,up),finger()}})
    Мир 360×520. sh: S{st,t,left,score,warm,demo}, add(n), pen(с), end(), say(html), fx(x,y,txt,col), snd(k), L, rr(c,x,y,w,h,r). В показе (S.demo) игра жмёт сама.
 3. ЗАПУСК: MG.play(id,{src:'gig'|'job'|'day'|'new'|'shelf',kind,t,ref}): показ пальцем, разминка (1-я партия захода: не проиграть, не в рекорд), итог — медаль, рекорд,
    соседи (Борис, Соня, Витя, Топтыгин отбирает рекорд раз в день), «↻ Ещё разок» Enter / «Хватит» Esc. Время стоит.
    Крючки biz-ui takeGig и owner-ui 'job' зовут MG.after(kind,t,ref) → предложение «💪 Сделать самому» — играм ничего не нужно.
 4. ЭФФЕКТ — один на запуск, по лучшей медали (разминка ≤ бронзы). Бронза = как без игры. Числа — только B2.eco.k('mgcore.<ключ>'), нет ключа — нет эффекта; 💎 НЕ даём (В6).
    _s/_g — серебро/золото: gig — чаевые tip × оплата (≤ tip_n смен в день), золото ⭐ +rt_g (≤ rt_max/день); fly — сила × fly; neg — скидка + neg; check — chk × выручка точки; stand — + stand дней.
 5. РЕКОРДЫ — S.b2m.r{id:[рекорд,партий,за неделю,Топтыгин,его день]}; MG.best/medal/isOpen. Своё — S.b2x (mg1) / S.b2y (mg2). STAT b2mgcore_mg/_again/_fx. Флаг B2.off.mgcore. */
(function(root){'use strict';
B2.off.mgcore=0;
if(B2.off('mgcore'))return;
const E=root.ECON,G={},ENG={},SG=['','','_s','_g'];
const K=(k,d)=>B2.eco&&B2.eco.k?B2.eco.k('mgcore.'+k,d):d;
const sk=()=>B2.s('m');
function dk(){const d=new Date(typeof nowMs==='function'?nowMs():Date.now());return d.getFullYear()*1e4+(d.getMonth()+1)*100+d.getDate();}
function dn(k){return Math.floor(Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100)/864e5);}
const wk=()=>Math.floor((dn(dk())+3)/7);
const better=(g,a,b)=>g&&g.lower?(a>0&&(!b||a<b)):a>b;
function rec(id){const s=sk();if(!B2.isObj(s.r))s.r={};if(s.wk!==wk()){for(const k in s.r)if(Array.isArray(s.r[k]))s.r[k][2]=0;s.wk=wk();}
  let x=s.r[id];if(!Array.isArray(x)||x.length<5)x=s.r[id]=[0,0,0,0,0];return x;}
function medal(id,v){const g=G[id];if(v==null)v=rec(id)[0];if(!g||!v)return 0;let k=0;for(let i=0;i<3;i++)if(g.lower?v<=g.md[i]:v>=g.md[i])k=i+1;return k;}
function on(id){const g=G[id];return !!g&&!B2.off(g.o);}
function hookOf(kind,t){for(const id in G)if(on(id)&&G[id].hook&&(G[id].hook[kind]||[]).indexOf(t)>=0)return id;return null;}
function isOpen(id,W){const g=G[id];W=W||(root.GAME&&GAME.W);if(!on(id)||!W)return false;if(rec(id)[1]>0)return true;
  if(g.open)try{return !!g.open(W);}catch(e){return false;}
  const M=W.me,h=g.hook||{};if(M&&(h.gig||[]).some(t=>(M.n&&M.n[t])>0))return true;
  return !!(W.ow&&(h.job||[]).length&&E.stI&&E.stI(W)>=1);}
function ui(){return B2.need('b2-mg-core-ui.js').then(()=>root.MGUI);}
function play(id,o){if(!on(id))return Promise.resolve(null);o=o||{};
  return Promise.all([ui(),B2.need('b2-mg-'+id+'.js')]).then(a=>a[0].run(id,o)).catch(e=>{try{console.error('MG',e);}catch(x){}try{toast(L('Игра не загрузилась — попробуйте ещё раз','The game failed to load — try again'));}catch(x){}});}
// «💪 Сделать самому» после «Взять»/«Начать»: дело уже идёт как обычно, игра — по желанию сверху
function after(kind,t,ref){const id=hookOf(kind,t),W=root.GAME&&GAME.W;if(!id||!W||!isOpen(id,W))return;
  if(kind==='gig'&&!(W.me&&W.me.gigs.some(g=>g.id===ref)))return;
  if(kind==='job'){const j=W.ow&&W.ow.j.filter(x=>x.k===t&&x.a===ref).pop();if(!j)return;ref=j.id;}
  ui().then(U=>U.offer(id,{src:kind,kind,t,ref})).catch(()=>{});}
// отложенные эффекты дел: применяются, когда дело закончилось (в т. ч. офлайн)
function due(W){const w=W&&W.b2&&W.b2.mgcore;if(!w||!Array.isArray(w.j)||!w.j.length||!W.ow)return;
  w.j=w.j.filter(p=>{if(W.ow.j.some(j=>j.id===p[0]))return true;const s=SG[p[3]],b=W.biz.find(y=>y.id===p[2]);
    if(p[1]==='fly'&&b){const x=(b.mc||[]).filter(c=>c.k==='fly'&&c.u>W.t).pop();if(x)x.e*=K('fly'+s,1);}
    else if(p[1]==='neg'){const n=W.ow.neg[p[2]];if(n&&n[0]>W.m)n[1]+=K('neg'+s,0);}
    else if(p[1]==='check'&&b){const a=Math.round((b.lr||0)*K('chk'+s,0));if(a>0)E.b2mgTip(W,'check',a,1);}
    return false;});}
// чаевые/возврат — выручка (как inc biz.js), НПД — у подработок
if(E)E.b2mgTip=function(W,t,a,biz){a=Math.round(+a||0);if(!(a>0))return 0;const _=E._,t0=E.tg?E.tg((biz?'b.':'gig.')+t):'';
  try{_.recv(W,a,'sales');_.pl(W,'rev',a);if(!biz&&W.me)W.me.tb=(W.me.tb||0)+a;}finally{if(E.tg)E.tg(t0);}return a;};
B2.mig('mgcore',(W,o)=>{if(o.j&&!Array.isArray(o.j))delete o.j;});
B2.sMerge('m',(a,b)=>{const r=B2.isObj(a.r)?a.r:{},q=B2.isObj(b.r)?b.r:{};
  for(const id in q){const x=r[id],y=q[id];if(!Array.isArray(y))continue;if(!Array.isArray(x)){r[id]=y.slice();continue;}
    x[0]=better(G[id],y[0],x[0])?y[0]:x[0];x[1]=Math.max(x[1],y[1]);x[2]=b.wk>a.wk?y[2]:b.wk<a.wk?x[2]:better(G[id],y[2],x[2])?y[2]:x[2];if(y[4]>x[4]){x[3]=y[3];x[4]=y[4];}}
  const o=Object.assign({},b,a);o.r=r;o.wk=Math.max(a.wk|0,b.wk|0);o.ds=Math.max(a.ds|0,b.ds|0);o.dd=Math.max(a.dd|0,b.dd|0);
  o.a=Array.from(new Set(String(a.a||'').split(',').concat(String(b.a||'').split(',')).filter(Boolean))).join(',');return o;});
if(root.GAME&&GAME.on){GAME.on('day',()=>due(GAME.W));GAME.on('offline',()=>due(GAME.W));}
const fresh=()=>Object.keys(G).find(id=>isOpen(id)&&String(sk().a||'').split(',').indexOf(id)<0);
B2.on('enter',()=>{due(GAME.W);if(Object.keys(G).some(id=>isOpen(id)))ui().catch(()=>{});});
B2.win({id:'mg-new',o:'mgcore',prio:25,ok:()=>!!fresh(),show:()=>ui().then(U=>U.news1(fresh()))});
let busy=false;B2.busy(()=>busy);
const MG={v:1,G,ENG,K,SG,dk,dn,wk,better,rec,medal,on,hookOf,isOpen,play,after,due,ui,
  add(o){if(o&&/^[a-z]{2,10}$/.test(o.id)&&o.md)G[o.id]=o;},game(id,e){ENG[id]=e;},best:id=>rec(id)[0],
  get busy(){return busy;},set busy(v){busy=!!v;try{if(v)GAME.hold.add('mg');else GAME.hold.delete('mg');}catch(e){}}};
root.MG=MG;
/* образец: «Листовки у метро» (js/b2-mg-flyer.js) — подработка гл. 1 со 2-го заказа и дело «Листовки своими руками» */
MG.add({id:'flyer',o:'mgcore',n:['Листовки у метро','Flyers at the metro'],ico:'📄',u:[['листовка','листовки','листовок'],['flyer','flyers']],
  md:[14,22,30],mid:18,hook:{gig:['flyer'],job:['fly']},open:W=>!!(W.me&&W.me.ng>=1)});
})(typeof window!=='undefined'?window:globalThis);
