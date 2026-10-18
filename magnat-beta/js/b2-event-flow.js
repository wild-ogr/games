/* b2-event-flow.js — EVENT: движок Потока заданий, табель 28, сезон, тема недели + вид («Сегодня», строки окна утром, окно «Планёрка»).
   Грузится по требованию (B2.need из b2-event.js). Работает и без DOM (jsc): вид строится строками, документ трогаем только в обработчиках.
   Хранение — S.b2e (B2.s('e')):
     k  {вид: счётчик}             — действия/интерфейс/x: (b2-event.js)
     f  {s:[слот×3], c:{герой: 0..4 в связке}, r:{герой: сундуков}, l:{герой: последнее задание}, d: день, n: забрано сегодня, t: всего, rr: день замены, ud: день «Ударника»}
        слот {h герой, id задание|цепочка, k вид, n нужно, b база, w мир, c 1 — праздничная, i шаг цепочки, ok 1 — уже сказали «готово»}
     fc {цепочка: сделано 0..5}     z {i сезон, p очки, d день, dp очки за день, g ступеней забрано, gd день подарка табеля, zc сезонов закрыто}
     og неделя отгула (b2-event.js)  g  подарков табеля всего
   💎 — только B2.eco.give('event.task'|'event.chest'|'event.tab_t'|'event.season'); ключи заполняет ECO (нет ключа — 0 💎). */
(function(root){'use strict';
if(typeof B2==='undefined'||B2.off('event')||!B2.evt)return;
const EV=B2.evt,HAS=typeof document!=='undefined';
const T=(r,e)=>typeof L==='function'?L(r,e):r;
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const safe=(f,...a)=>{try{return f(...a);}catch(e){return undefined;}};
const E=()=>root.ECON;
const now=()=>typeof nowMs==='function'?nowMs():Date.now();
const dayN=()=>{const d=new Date(now());return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);};
const D0=Math.floor(Date.UTC(2026,10,16)/864e5);   // пн 16.11.2026 — неделя 1, сезон 1 (03-events §4); раньше — те же круги назад
const HER=['lud','son','bor','pet','vit'];
const FID={lud:'lud',son:'owl',bor:'beav',pet:'bars',vit:'vit'};
const HN={lud:['Людмила Санна','Lyudmila Sanna'],son:['Соня','Sonya'],bor:['Борис','Boris'],pet:['Пётр','Pyotr'],vit:['Витя','Vitya']};
const HG={lud:['Людмилы Санны','Lyudmila’s'],son:['Сони','Sonya’s'],bor:['Бориса','Boris’s'],pet:['Петра','Pyotr’s'],vit:['Вити','Vitya’s']};
const HT={lud:['отчёты и термины','reports and terms'],son:['деньги','money'],bor:['соперничество','rivalry'],pet:['стройка','construction'],vit:['доставка','delivery']};
const HI={lud:'📒',son:'💰',bor:'🥊',pet:'🏗',vit:'🚚'};
const BADGE={lud:['Грамотный руководитель','Literate manager'],son:['Финансово грамотный','Financially savvy'],bor:['Обогнал Бориса','Beat Boris'],pet:['Крепкий хозяйственник','Solid builder'],vit:['Король логистики','Logistics king']};
const THEME=['vit','bor','pet','son','lud','vit','lud','bor','pet','vit','son','bor','lud','pet','vit','lud'];   // тема недели по календарю 03-events §4
const THX={vit:['Неделя Вити: доставка и опт','Vitya’s week: delivery and wholesale'],bor:['Неделя Бориса: перегони «Бобров и Ко»','Boris’s week: beat Beaver & Co'],pet:['Неделя Петра: стройка','Pyotr’s week: construction'],
  son:['Неделя Сони: деньги','Sonya’s week: money'],lud:['Неделя Людмилы Санны: отчёты','Lyudmila’s week: reports']};
const SEAS=[['🍂','Осенняя ярмарка','Autumn fair'],['🎄','Зимний базар','Winter bazaar'],['❄','Крещенские морозы','Epiphany frost'],['🌷','Весенняя распродажа','Spring sale'],['💧','Мартовская оттепель','March thaw'],
  ['🔨','Апрельская стройка','April build'],['🌳','Майские','May holidays'],['☀','Летний сезон','Summer season'],['🍉','Июльская жара','July heat'],['🍎','Дачный август','Dacha August'],
  ['🍁','Бабье лето','Indian summer'],['📋','Октябрьская ревизия','October audit'],['🎁','Предновогодний','Pre-New Year']];
const SS_N=20,SDEC=['fr_wood','em_eagle','sg_gold','fr_gold'];   // ступени сезона; украшения на 5/10/15/20-й (есть — 💎 по ключу ECO)
const PITS=['sandpit','gravpit'];
const eco=()=>B2.eco||{give:()=>0,cr:()=>0,k:(x,d)=>d==null?1:d};
const give=k=>k?(eco().give(k)|0):0;
const md=(x,n)=>((x%n)+n)%n;
const wk=()=>Math.floor((dayN()-D0)/7);
const theme=()=>THEME[md(wk(),16)];
const sIdx=()=>Math.floor((dayN()-D0)/28);
const sName=i=>{const s=SEAS[md(i,13)];return {ico:s[0],n:T(s[1],s[2])};};
const SS=()=>typeof S!=='undefined'&&S?S:null;
const wid=()=>{const W=GAME.W,s=SS();return W?W.hold+':'+((s&&s.rst)||0):'';};
function st(){const o=B2.s('e');if(!B2.isObj(o.f))o.f={};const f=o.f;if(!Array.isArray(f.s))f.s=[];if(f.s.some(x=>!B2.isObj(x)))f.s=f.s.filter(x=>B2.isObj(x));
  for(const k of ['c','r','l'])if(!B2.isObj(f[k]))f[k]={};for(const k of ['fc','k','z'])if(!B2.isObj(o[k]))o[k]={};return o;}

/* ---------- счётчики и условия ---------- */
const plc=k=>{const p=SS()&&S.pl;return p&&p.c?(p.c[k]|0):0;};
const small=W=>{const e=E();return (W.biz||[]).filter(b=>e&&e.SMALL&&e.SMALL.indexOf(b.t)>=0);};
const C={close:()=>plc('close'),prof:()=>plc('prof'),gigs:W=>W.me?(W.me.ng|0):0,pts:W=>small(W).length,biz:W=>(W.biz||[]).length,city:W=>W.cities?W.cities.length:1,
  build:W=>W.stat?(W.stat.built|0):0,expl:W=>W.stat?(W.stat.expl|0):0,sold:W=>W.stat?(+W.stat.sold||0):0,eq:W=>{const e=E();return e?e.equity(W):0;}};
function val(k,W){if(EV.KND[k])return +safe(EV.KND[k],W)||0;const p=k.indexOf(':'),a=k.slice(0,p),b=k.slice(p+1);
  if(a==='c')return C[b]?(+safe(C[b],W)||0):0;return st().k[k]|0;}
const mr=W=>{const r=W.reps&&W.reps[W.reps.length-1];return r&&r.pl?r.pl.rev:0;};
const has=(W,f)=>(W.biz||[]).some(f);
const COND={
  ip0:W=>!W.ip&&!W.reg&&W.cash>=20e3,
  gig:W=>W.st==='gig'||W.st==='small'&&W.me&&!W.me.out,
  loan:W=>Array.isArray(W.loans)&&W.loans.some(l=>l.a>0&&l.k!=='od')&&W.cash>0,
  rec:W=>!W.ned&&Array.isArray(W.rec)&&W.rec.length>0,
  mgr:W=>small(W).length>0,
  ooo0:W=>{const e=E();if(!W.ip||W.ooo||W.reg||!e.oooReq)return false;const q=e.oooReq(W);return !!(q&&q.eq&&q.pts&&q.mgr&&q.ch);},
  cheap:W=>{const e=E();if(!W.ip||!e.SMALL)return false;const c=Math.min(...e.SMALL.map(t=>e.BIZ[t].cap));return W.cash>=c*.6;},
  pts:W=>small(W).length>0,
  c3:W=>W.ooo&&W.cities&&W.cities.length<3&&W.cash>=1.5e6,
  opt:W=>has(W,b=>b.t==='whs'),
  veh:W=>has(W,b=>b.t==='van'||b.t==='truck'),
  pit:W=>has(W,b=>PITS.indexOf(b.t)>=0),
  lic:W=>{const e=E();return !!W.ned&&(e.REG.some(r=>W.plots[r].some(p=>p.own==='you'&&p.st==='lic'&&!W.obj.some(x=>x.plot===p.id)))||W.cash>=300e6);},
  obj:W=>!!W.ned&&W.obj.some(o=>o.st==='w'&&(o.lv|0)<(E().UP_MAX||2)&&!o.up),
  inv:W=>!!W.ned&&W.obj.some(o=>o.st==='w'),
  wag:W=>!!W.ned&&W.cash>=50e6,
  sold:W=>!!W.ned&&mr(W)>0,
  hid:W=>{const e=E();return !!W.ned&&e.REG.some(r=>W.plots[r].some(p=>p.st==='hid'))&&W.cash>=e.explCost(W,'kuz')*1.5;},
  frp:W=>{const e=E();return !!W.ned&&!!e.frpOk&&W.obj.some(o=>!!safe(e.frpOk,W,o.id));},
  auc:W=>Array.isArray(W.opi)&&W.opi.some(p=>p.st==='auc'),
  pplot:W=>Array.isArray(W.opi)&&W.opi.some(p=>p.own==='you'&&p.st==='lic'),
  base:W=>has(W,b=>b.t==='base')};
const stg=W=>W.ned?'n':({gig:'g',small:'s',mid:'m',quarry:'q'})[W.st]||'n';
const task=id=>(B2.evData||[]).find(t=>t[0]===id);
const chains=()=>EV.Q.filter(c=>c&&c.id&&!B2.off(c.o||'fest')&&Array.isArray(c.t)&&c.t.length>=5);
const chain=id=>EV.Q.find(c=>c&&c.id===id);
// праздничная цепочка сейчас: активна, не закрыта; из нескольких — у кого раньше конец
function festNow(){const o=st();const l=chains().filter(c=>(o.fc[c.id]|0)<5&&safe(()=>!!(c.on&&c.on())));l.sort((a,b)=>(a.to||9e15)-(b.to||9e15));return l[0]||null;}

/* ---------- слоты Потока ---------- */
function prog(s,W){const v=val(s.k,W);return s.k==='c:eq'?(s.b>0?v/s.b-1:0):v-s.b;}
function isDone(s,W){return W&&prog(s,W)>=s.n-1e-9;}
function mk(h,id,k,n,W){const s={h,id,k,n,b:val(k,W),w:wid()};if(k==='c:sold')s.n=Math.max(1e6,Math.round(mr(W)*.6/1e6)*1e6);return s;}
function mkC(c,i,W){const t=c.t[i];const s=mk(c.who||'lud',c.id,t.k,t.need||1,W);s.c=1;s.i=i;return s;}
function pick(h,W,ex){const sg=stg(W),f=st().f,last=f.l[h],ks=f.s.map(s=>s.k);
  const a=(B2.evData||[]).filter(t=>t[1]===h&&t[2].indexOf(sg)>=0&&ex.indexOf(t[0])<0&&(!t[5]||(COND[t[5]]&&safe(COND[t[5]],W))));
  const b=a.filter(t=>t[0]!==last&&ks.indexOf(t[3])<0);const l=b.length?b:a;return l.length?l[Math.floor(Math.random()*l.length)]:null;}
function fill(){const W=GAME.W;if(!W)return [];const o=st(),f=o.f,sg=stg(W),w=wid(),ch=festNow();let S3=f.s;
  // мир сменился (IPO, «заново»): счётчики мира — от нового мира
  for(const s of S3)if(s.w!==w){if(s.k.indexOf('c:')===0||EV.KND[s.k])s.b=val(s.k,W);s.w=w;}
  S3=S3.filter(s=>{if(s.c)return !!ch&&ch.id===s.id&&(o.fc[s.id]|0)===s.i;const t=task(s.id);if(!t)return false;
    if(t[2].indexOf(sg)<0&&!isDone(s,W))return false;return true;});
  f.s=S3;
  if(ch&&!S3.some(s=>s.c)){S3.unshift(mkC(ch,o.fc[ch.id]|0,W));if(S3.length>3){let j=-1;for(let i=S3.length-1;i>0;i--)if(!isDone(S3[i],W)){j=i;break;}if(j>0)S3.splice(j,1);}}
  let guard=0;while(S3.length<3&&guard++<12){const used=S3.filter(s=>!s.c).map(s=>s.h),hs=HER.filter(h=>used.indexOf(h)<0),th=theme();
    let order=hs.slice().sort(()=>Math.random()-.5);if(hs.indexOf(th)>=0&&Math.random()<.65)order=[th].concat(order.filter(h=>h!==th));
    let t=null,h=null;for(const x of order){t=pick(x,W,S3.map(s=>s.id));if(t){h=x;break;}}if(!t)break;S3.push(mk(h,t[0],t[3],t[4],W));}
  f.s=S3;return S3;}
function roll(){const o=st(),f=o.f,d=dayN();if(f.d!==d){f.d=d;f.n=0;}season();return o;}

/* ---------- забрать задание ---------- */
function claim(i){const W=GAME.W;if(!W)return null;const o=roll(),f=o.f;fill();const s=f.s[i];if(!s||!isDone(s,W))return null;
  f.n=(f.n|0)+1;f.t=(f.t|0)+1;let cr=0,pts=s.c||s.h===theme()?2:1,chest=null;
  if(f.n<=eco().k('event.task_n',6))cr+=give('event.task');
  if(s.c){const c=chain(s.id)||{};const n=(o.fc[s.id]|0)+1;o.fc[s.id]=n;B2.emit('flow:task',{c:s.id,h:c.who,n,k:s.k});
    if(n>=5){cr+=give(c.prize&&c.prize.cr);B2.emit('flow:chain',{c:s.id,o:c.o||'fest',h:c.who});chest={c};}}
  else{const n=(f.c[s.h]|0)+1;f.l[s.h]=s.id;B2.emit('flow:task',{c:'',h:s.h,n,k:s.k});
    if(n>=5){f.c[s.h]=0;f.r[s.h]=(f.r[s.h]|0)+1;cr+=give('event.chest');pts+=3;chest={h:s.h,r:f.r[s.h]};B2.ev('event','chest',{h:s.h,r:f.r[s.h]});}else f.c[s.h]=n;}
  f.s.splice(i,1);sAdd(pts);
  if(f.n===3&&f.ud!==f.d){f.ud=f.d;safe(()=>GAME.plDay&&GAME.plDay());}   // «Ударник» недели — 3 задания Потока за день (как «все поручения»)
  B2.ev('event','qf',{h:s.c?'fest':s.h,k:s.id,n:s.c?(o.fc[s.id]|0):(chest?5:f.c[s.h])});
  fill();sv();return {cr,chest,pts,s};}
function rrOk(){const o=roll();return o.f.rr!==o.f.d;}
function reroll(i,paid){const W=GAME.W,o=roll(),f=o.f;fill();const s=f.s[i];if(!W||!s||s.c||isDone(s,W))return false;if(!paid&&!rrOk())return false;
  const t=pick(s.h,W,f.s.map(x=>x.id));let h=s.h,nt=t;if(!nt){for(const x of HER){if(f.s.some(y=>y.h===x&&!y.c))continue;nt=pick(x,W,f.s.map(y=>y.id));if(nt){h=x;break;}}}
  if(!nt)return false;f.s[i]=mk(h,nt[0],nt[3],nt[4],W);if(!paid)f.rr=f.d;B2.ev('event','rr',{p:paid?1:0});sv();return true;}

/* ---------- сезон ---------- */
function season(){const o=st(),z=o.z,d=dayN(),i=sIdx();if(z.i!==i){if(typeof z.i==='number'&&(z.p|0)>=SS_N*step())o.zc=(o.zc|0)+1;z.i=i;z.p=0;z.g=0;}if(z.d!==d){z.d=d;z.dp=0;}
  const p=SS()&&S.pl;if(p&&p.got&&p.d===d&&z.gd!==d){z.gd=d;o.g=(o.g|0)+1;sAdd0(z,1);if(p.gc===27&&(p.gv|0)>0)eco().give('event.tab_t',1,Math.max(0,eco().cr('event.tab_t')-(p.gv|0)));}   // 28-я клетка: всё есть — до ECO 'event.tab_t'   // подарок табеля: +1 очко (и 28-й день — ключ ECO)
  return z;}
const step=()=>Math.max(1,eco().k('event.ss_step',7));
function sAdd0(z,n){const cap=eco().k('event.season_pts',8),m=Math.max(0,Math.min(n,cap-(z.dp|0)));z.dp=(z.dp|0)+m;z.p=(z.p|0)+m;return m;}
function sAdd(n){return sAdd0(season(),n);}
const sLv=z=>Math.min(SS_N,Math.floor((z.p|0)/step()));
function sPrize(lv){const c=lv%5===0?SDEC[lv/5-1]:null;const has=c&&GAME.cosHas&&GAME.cosHas(c);
  if(c&&!has){const x=(GAME.COS||[]).find(y=>y.id===c);return {cos:c,txt:x?(x.ic?x.ic+' ':'')+T(x.ru,x.en):c};}
  const ev=eco().k('event.season_every',4),n=lv<SS_N&&lv%ev===0?eco().cr('event.season'):0;return n>0?{key:'event.season',n,txt:n+'\u00a0💎'}:null;}   // ECO: 💎 — каждая 4-я ступень; 5/10/15/20 — украшения
function sClaim(){const z=season();let cr=0,got=[];while((z.g|0)<sLv(z)){z.g=(z.g|0)+1;const p=sPrize(z.g);if(!p)continue;
    if(p.cos){GAME.cosGive(p.cos);got.push(p.txt);}else{cr+=give(p.key);}}
  if(got.length||cr)B2.ev('event','ss',{g:z.g});sv();return {cr,got};}

const sv=()=>{try{if(typeof save==='function')save();}catch(e){}};

/* ---------- вид ---------- */
const cr=n=>n+' 💎';
function hName(h){return T(HN[h][0],HN[h][1]);}
function face(h,px){px=px||40;let svg='';try{svg=h==='lud'?(typeof advisorSvg==='function'?advisorSvg('calm'):''):(typeof friendSvg==='function'?friendSvg(FID[h],'calm'):'');}catch(e){}
  return `<span class="ev-face" style="width:${px}px;height:${px}px">${svg||HI[h]}</span>`;}
function tTxt(s){if(s.c){const c=chain(s.id),t=c&&c.t[s.i];return t?T(t.ru,t.en||t.ru):'';}const t=task(s.id);return t?T(t[6],t[7]):'';}
function pTxt(s,W){const v=Math.max(0,prog(s,W));if(s.k==='c:eq')return (typeof FMT!=='undefined'?FMT.pct(Math.min(v,s.n),1)+' / '+FMT.pct(s.n):Math.round(v*100)+'% / '+Math.round(s.n*100)+'%');
  if(s.k==='c:sold')return typeof FMT!=='undefined'?FMT.money(Math.min(v,s.n))+' / '+FMT.money(s.n):'';return Math.min(Math.floor(v),s.n)+' / '+s.n;}
const bar=f=>`<div class="mt-bar"><i style="width:${(Math.max(0,Math.min(1,f))*100).toFixed(1)}%"></i></div>`;
function chestTxt(h){const f=st().f,r=(f.r[h]|0)+1,n=eco().cr('event.chest');
  return (n>0?cr(n)+' + ':'')+T('значок','badge')+' «'+T(BADGE[h][0],BADGE[h][1])+'» '+'★'.repeat(Math.min(3,r))+(r>3?' ×'+r:'');}
function dots(h){const n=st().f.c[h]|0;let s='';for(let i=0;i<5;i++)s+=i<n?'●':'○';return `<span class="ev-dots" aria-label="${n} ${T('из 5','of 5')}">${s}</span>`;}
function giftInfo(){const p=GAME.plan();let n=GAME.CAL[p.cal],env=0;
  try{const x=!p.got&&window.B2F&&B2F.nw&&B2F.ENV&&B2F.nw();if(x&&x.today){env=1;const l=B2.eco&&B2.eco.list&&B2.eco.list('first.w');n=l&&l[x.k]|0;}}catch(e){}   /* b2-merge: неделя новичка FIRST — сегодня конверт, а не клетка табеля */
  return {p,n,env,day:(p.got?p.gc:p.cal)+1};}
const adOn=()=>{try{return typeof adOk==='function'&&adOk();}catch(e){return false;}};
const early=()=>{try{return !!(root.BIZUI&&BIZUI.early&&BIZUI.early());}catch(e){return false;}};
function slotMini(s,i,W){const d=isDone(s,W),c=s.c&&chain(s.id);
  return `<div class="ev-t1${d?' ok':''}${s.c?' fest':''}"><span class="mt-f1">${esc(c?(c.ico||'🎉'):HI[s.h])} ${d?'✅ ':''}${esc(tTxt(s))}${d?'':` <span class="mt-mut">· ${pTxt(s,W)}</span>`}</span>`
    +(d?`<button class="mt-btn go noenter" data-b2="event:claim:${i}">${T('Забрать','Take')}</button>`:'')+'</div>';}
function slotRow(s,i,W,big){const d=isDone(s,W),c=s.c&&chain(s.id),f=s.n?(s.k==='c:eq'?prog(s,W)/s.n:Math.max(0,prog(s,W))/s.n):0,th=!s.c&&s.h===theme();
  const who=c?(c.ico||'🎉')+' '+esc(T(c.ru,c.en||c.ru))+` · ${s.i+1}/5`:esc(hName(s.h))+(big?' '+dots(s.h):'')+(th?' · ⭐':'');
  return `<div class="ev-t${d?' ok':''}${s.c?' fest':''}">${big?face(c?c.who||'lud':s.h,44):''}<div class="ev-tb"><div class="mt-mut">${who}</div><div>${d?'✅ ':''}${esc(tTxt(s))}</div>`
    +(d?'':`${bar(f)}<div class="mt-mut">${pTxt(s,W)}</div>`)+`</div><div class="ev-tc">`
    +(d?`<button class="mt-btn go noenter" data-b2="event:claim:${i}">${T('Забрать','Take')}${eco().cr('event.task')>0&&(st().f.n|0)<eco().k('event.task_n',6)?' +'+cr(eco().cr('event.task')):''}</button>`
      :big&&!s.c?`<button class="mt-btn noenter ev-rr" data-b2="event:rr:${i}" aria-label="${T('Другое задание','Another task')}">🔄${rrOk()?'':' 📺'}</button>`:'')+`</div></div>`;}
function seasonHtml(mini){const z=season(),i=sIdx(),sn=sName(i),lv=sLv(z),stp=step(),f=lv>=SS_N?1:((z.p|0)%stp)/stp,nx=lv<SS_N?sPrize(lv+1):null,ready=(z.g|0)<lv;
  let h=`<div class="ev-ss"><div class="mt-row"><span class="mt-f1">${sn.ico} <b>${esc(sn.n)}</b> · ${T('ступень','step')} ${lv}/${SS_N}</span>`
    +(ready?`<button class="mt-btn go noenter" data-b2="event:ss">${T('Забрать','Take')}</button>`:'')+`</div>${bar(f)}`;
  if(!mini)h+=`<p class="mt-mut">${lv>=SS_N?T('Сезон закрыт — отличная работа!','Season complete — great work!'):T(`До ступени ${lv+1}: ${stp-(z.p|0)%stp} очк`,`To step ${lv+1}: ${stp-(z.p|0)%stp} pts`)+(nx?' · '+T('награда','reward')+': '+esc(nx.txt):'')}. ${T('Очки: подарок дня +1, задание +1 (у героя недели и праздничное +2), сундук +3; не больше 8 в день.','Points: daily gift +1, task +1 (week hero’s and holiday tasks +2), chest +3; up to 8 a day.')}</p>`;
  return h+'</div>';}
function calHtml(p,env){let h='<div class="mt-cal ev-cal">';for(let i=0;i<28;i++){const n=GAME.CAL[i],today=p.got&&p.gc===i,past=p.got?i<p.gc:i<p.cal,next=!p.got&&i===p.cal;
    h+=`<div class="${today||past?'ok':next?'on':''}">${i+1}<b>${next&&env?'✉️':n?n:'🎁'}</b></div>`;}
  return h+`</div><p class="mt-mut">${T('Табель на 4 недели: зелёные — получено, выделенная — сегодня. Один пропуск в неделю — «отгул»: табель не отступает. Второй — шаг назад, не в ноль.','A 4-week register: green — received, highlighted — today. One missed day a week is a “day off”: no step back. A second one — one step back, never to zero.')}${p.og?' 🏖 '+T('Вчера был отгул — табель на месте.','Yesterday was your day off — the register stayed put.'):p.miss?' '+T('(пропуск — шаг назад)','(missed — one step back)'):''}</p>`;}
function giftBtns(p,n,cls,env){const g=cls==='btn'?'btn green':'mt-btn go',x=cls==='btn'?'btn mt-x2b':'mt-btn x2';
  if(!p.got)return `<button class="${g} noenter" data-b2="event:gift">${env?'✉️ '+T('Открыть конверт','Open the envelope')+(n?' +'+cr(n):''):'🎁 '+T('Забрать','Take')+' '+(n?'+'+cr(n):T('украшение','decoration'))}</button>`+(adOn()?`<button class="${x} noenter" data-b2="event:giftx2">📺 ${n?'+'+cr(n*2)+' '+T('за рекламу','for an ad'):'×2'}</button>`:'');
  if(adOn()&&GAME.planX2Ok())return `<button class="${x} noenter" data-b2="event:x2">📺 +${cr(p.gv||10)} ${T('за рекламу','for an ad')}</button>`;return '';}
function today(){const W=GAME.W;if(!W)return '';css();roll();const S3=fill(),g=giftInfo();
  if(early())return `<div class="mt-card ev-card"><div class="mt-row"><span class="mt-f1">📋 <b>${T('Планёрка','Morning meeting')}</b>: ${!g.p.got?T('подарок дня','daily gift')+(g.n?' +'+cr(g.n):''):T('задания','tasks')+' '+S3.filter(s=>isDone(s,W)).length+'/'+S3.length}</span>${!g.p.got?`<button class="mt-btn go noenter" data-b2="event:gift">${T('Забрать','Take')}</button>`:`<button class="mt-btn noenter" data-b2="event:open">${T('Открыть','Open')}</button>`}</div></div>`;
  let h=`<div class="mt-card ev-card"><div class="mt-row"><span class="mt-f1">📋 <b>${T('Планёрка','Morning meeting')}</b> · ${T('табель','register')} ${g.day}/28</span>${giftBtns(g.p,g.n,'mt-btn',g.env)}<button class="mt-btn noenter" data-b2="event:open">${T('Открыть','Open')}</button></div>`;
  h+=`<div class="ev-th mt-mut">⭐ ${esc(T(THX[theme()][0],THX[theme()][1]))}</div>`;
  S3.forEach((s,i)=>{h+=slotMini(s,i,W);});
  return h+seasonHtml(true)+'</div>';}
function morning(){const W=GAME.W;if(!W)return '';roll();const S3=fill(),g=giftInfo();
  let h=`<div class="ev-mr">🎁 ${T('Табель','Register')}: ${T('день','day')} ${g.day} ${T('из','of')} 28${!g.p.got?' — '+(g.n?'+'+cr(g.n):T('украшение','decoration')):' ✓'}${g.p.og?' · 🏖 '+T('отгул засчитан','day off counted'):''}</div>`;
  h+=`<div class="ev-mr">📋 ${T('Поток заданий','Task flow')}: `+S3.map(s=>esc(s.c?(chain(s.id)||{}).ico||'🎉':HI[s.h])+' '+esc(tTxt(s))).join(' · ')+'</div>';
  return h;}
function win(){const W=GAME.W;if(!W||!HAS)return;css();roll();const S3=fill(),g=giftInfo(),th=theme(),c=st().f;
  let tk='';S3.forEach((s,i)=>{tk+=slotRow(s,i,W,true);});
  let hb='';for(const x of HER)hb+=`<div class="ev-hb">${face(x,30)} <span class="mt-f1">${esc(hName(x))} ${dots(x)}${(c.r[x]|0)?' · ★'+(c.r[x]|0):''}<br><span class="mt-mut">${T('сундук','chest')}: ${esc(chestTxt(x))}</span></span></div>`;
  modal(`<div class="ev-win"><h2>📋 ${T('Планёрка','Morning meeting')}</h2>
    <p class="about">${face('lud',36)} ${T('Людмила Санна: «Табель, задания от наших и сезон — всё здесь. Пять заданий одного человека — его сундук, содержимое видно заранее».','Lyudmila Sanna: “Register, tasks from our people and the season — all here. Five tasks from one person — their chest, contents shown in advance.”')}</p>
    <h3>🗓 ${T('Табель','Register')} — ${T('день','day')} ${g.day} ${T('из','of')} 28</h3>${calHtml(g.p,g.env)}<div class="row">${giftBtns(g.p,g.n,'btn',g.env)}</div>
    <h3>📋 ${T('Поток заданий','Task flow')}</h3><p class="mt-mut">⭐ ${esc(T(THX[th][0],THX[th][1]))} — ${T('его задания дают ×2 очков сезона.','their tasks give ×2 season points.')}</p>${tk}
    <details class="ev-more"><summary>${T('Сундуки героев','Heroes’ chests')}</summary>${hb}</details>
    <h3>🏁 ${T('Сезон','Season')}</h3>${seasonHtml(false)}
    <div class="row"><button class="btn noenter" data-b2="event:cos">🎨 ${T('Украшения','Decorations')}</button><button class="btn" data-b2="event:close" data-esc="1">${T('Закрыть','Close')}</button></div></div>`);
  try{modalRe=win;}catch(e){}}
let cssOn=0;function css(){if(cssOn||!HAS)return;cssOn=1;const s=document.createElement('style');s.id='b2evCss';s.textContent=`
.ev-t{display:flex;align-items:center;padding:8px 0;border-top:1px solid var(--line,#e3e7ee)}
.ev-t .ev-tb{flex:1 1 auto;min-width:0;margin:0 8px}.ev-t .ev-tc{flex:0 0 auto}
.ev-t.ok .ev-tb>div:nth-child(2){color:var(--good,#0a7a3a);font-weight:600}
.ev-t.fest{background:var(--accent-t,#fff4e8);border-radius:12px;padding:8px 6px}
.ev-face{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border-radius:50%;overflow:hidden;background:var(--soft,#f2f4f7);font-size:22px;vertical-align:middle}
.ev-face>svg{width:100%;height:100%}
.ev-dots{letter-spacing:2px;color:var(--accent,#c8641e);font-size:15px}
.ev-ss{margin-top:8px}.ev-th{margin:4px 0}.ev-mr{margin:4px 0}
.ev-hb{display:flex;align-items:center;padding:6px 0}.ev-hb .ev-face{margin-right:8px}
.ev-cal>div{flex:1 0 12%;min-width:36px}
.ev-rr{min-width:48px;padding:8px 10px}
.ev-t1{display:flex;align-items:center;padding:6px 0;border-top:1px solid var(--line,#e3e7ee)}.ev-t1>button{margin-left:8px}.ev-t1.ok .mt-f1{color:var(--good,#0a7a3a);font-weight:600}
.ev-more summary{min-height:48px;line-height:48px;cursor:pointer;font-weight:600}`;document.head.appendChild(s);}
function rf(){try{if(modalOn&&document.querySelector('#mcard .ev-win'))win();}catch(e){}try{if(root.UI&&UI.refresh)UI.refresh();}catch(e){}}
function fly(el,n){try{if(n&&root.UI&&UI.fly){const r=el&&el.getBoundingClientRect?el.getBoundingClientRect():null;UI.fly(r?{x:r.left+r.width/2,y:r.top}:null,n,'cr');}}catch(e){}}
const snd=k=>{try{(SND[k]||SND.tap)();}catch(e){}};
function giftDone(el,n){const p=GAME.plan();snd('coin');if(n){toast('🎁 +'+cr(n));fly(el,n);}else{const c=(GAME.COS||[]).find(x=>x.id===p.gi);toast('🎁 '+(c?T(c.ru,c.en):T('Подарок получен','Gift received')));try{META.applyCos();}catch(e){}}season();sv();rf();}
function click(a,arg,el){const W=GAME.W;if(!W)return;
  if(a==='open'){snd('tap');win();}
  else if(a==='close'){try{hideModal();}catch(e){}}
  else if(a==='cos'){try{hideModal();META.openCos();}catch(e){}}
  else if(a==='gift'){if(GAME.plan().got)return;const n=GAME.planGift();giftDone(el,n);}
  else if(a==='giftx2'){if(!adOn()||GAME.plan().got)return;STAT.place('planx2');showRewarded(()=>{if(GAME.plan().got)return rf();const n=GAME.planGift(),m=GAME.planX2()||0;giftDone(el,n+m);},()=>{});}
  else if(a==='x2'){if(!adOn()||!GAME.planX2Ok())return;STAT.place('planx2');showRewarded(()=>{const n=GAME.planX2();if(n){snd('coin');toast('📺 +'+cr(n));fly(el,n);}rf();},()=>{});}
  else if(a==='claim'){const r=claim(+arg);if(!r)return rf();snd('coin');
    if(r.chest){try{UI.salute(true);}catch(e){}const c=r.chest;toast(c.c?'🎉 '+T(c.c.ru,c.c.en||c.c.ru)+': '+T('цепочка закрыта','chain complete')+(r.cr?' +'+cr(r.cr):''):'🎁 '+T('Сундук','Chest')+' '+T(HG[c.h][0],HG[c.h][1])+(r.cr?': +'+cr(r.cr):'')+' · 🏅 «'+T(BADGE[c.h][0],BADGE[c.h][1])+'» ★'+c.r,3500);}
    else toast('✅ '+(r.cr?'+'+cr(r.cr)+' · ':'')+'+'+r.pts+' '+T('очк. сезона','season pts'));fly(el,r.cr);rf();}
  else if(a==='rr'){const i=+arg;if(rrOk()){if(reroll(i,false))snd('tap');rf();}else if(adOn()){STAT.place('flowrr');showRewarded(()=>{reroll(i,true);rf();},()=>{});}else toast(T('Замена — раз в день; завтра снова','One swap a day; again tomorrow'));}
  else if(a==='ss'){const r=sClaim();snd('coin');toast('🏁 '+[r.cr?'+'+cr(r.cr):'',...r.got].filter(Boolean).join(' · ')||T('Ступень пройдена','Step reached'));if(r.got.length)try{META.applyCos();}catch(e){}fly(el,r.cr);rf();}}
// «готово» — один тост, когда задание выполнилось по ходу игры
let tT=0;function watch(){const W=GAME.W;if(!W||Date.now()-tT<1500)return;tT=Date.now();const o=st();let n=0;for(const s of o.f.s)if(!s.ok&&isDone(s,W)){s.ok=1;n++;
    if(HAS&&typeof toast==='function')toast('✅ '+(s.c?T('Праздничное задание','Holiday task'):hName(s.h))+': '+T('выполнено — заберите в Планёрке','done — collect it in the Meeting'));}
  if(n)rf();}
if(typeof GAME!=='undefined'&&GAME.on){GAME.on('change',watch);GAME.on('day',watch);GAME.on('close',()=>{tT=0;watch();});GAME.on('ipo',()=>{fill();});GAME.on('reset',()=>{fill();});}
// значки героев — в Кабинете
B2.slot('cab','event',()=>{const f=st().f;const l=HER.filter(h=>f.r[h]|0);if(!l.length)return '';
  return `<div class="mt-card"><h4>🏅 ${T('Значки Потока заданий','Task flow badges')}</h4>`+l.map(h=>`<p>${face(h,28)} ${esc(T(BADGE[h][0],BADGE[h][1]))} ★${f.r[h]|0}</p>`).join('')+'</div>';},40);
B2.evF={today,morning,click,claim,reroll,fill,season,sClaim,sAdd,win,theme,festNow,isDone,prog,st,
  ui:k=>k==='open'?(win(),''):'',_:{val,COND,stg,D0,THEME,SEAS}};
if(typeof GAME!=='undefined'&&GAME.W)fill();
})(typeof window!=='undefined'?window:globalThis);
