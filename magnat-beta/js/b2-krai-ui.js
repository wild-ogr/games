/* b2-krai-ui.js — KRAI: звёзды края, IPO в выбранный край, вид «Империи» (по требованию из b2-krai.js; грузится и в jsc — без DOM на верхнем уровне).
   Звёзды: KRAI.prog(W) → [{k,ok,now,need}], KRAI.bits(W) — биты на момент IPO; S.b2k.st[край] — набранные (ИЛИ по всем проходам).
   Вид: гнёзда today (карточка края на карте «Недр»), ipo (выбор края и «Условия холдинга» в окне IPO), cab (кнопка «Империя»); KRAI.mapSvg — карта края;
   окно «🗺 Империя» — карта страны, края со звёздами, «Зал славы» (все холдинги, рекорды). Нажатия — data-b2="krai:<действие>:<арг>". */
(function(root){'use strict';
if(!root.KRAI){root.KRAI_UI=()=>{delete root.KRAI_UI;go(root);};return;}go(root);   // в jsc файлы идут по алфавиту — этот раньше b2-krai.js
function go(root){
const KR=root.KRAI,B2=root.B2,E=root.ECON;if(!KR||!B2||!E||B2.off('krai'))return;
const data=KR.data,cl=o=>JSON.parse(JSON.stringify(o)),nb=b=>(b&1)+(b>>1&1)+(b>>2&1);
const kOf=W=>W&&W.b2&&W.b2.krai&&W.b2.krai.id?W.b2.krai:null;
/* ================= звёзды ================= */
function rival(W,D){return D.rival?W.bots.find(b=>b.id===D.rival.id)||null:null;}
KR.prog=function(W){const k=kOf(W),D=k&&data(k.id);if(!D)return [];const mon=W.m-(k.m0||0);
  return D.stars.map(s=>{let ok=false,now=0,need=0;
    if(s.k==='ipo'){now=E.equity(W);need=E.ipoEq(W);ok=E.ipoReady(W);}
    else if(s.k==='mo'){now=mon;need=s.n;ok=mon<=s.n;}
    else if(s.k==='rival'){const b=rival(W,D);now=E.equity(W);need=b?E.botValue(W,b):0;ok=!b||now>need;}
    else if(s.k==='sold'){now=(k.s&&k.s[s.g])||0;need=s.q;ok=now>=need;}
    else if(s.k==='built'){ok=W.obj.some(o=>o.t===s.t&&o.st==='w');now=ok?1:0;need=1;}
    else if(s.k==='noloan'){now=k.lr||0;need=s.r;ok=now<=s.r;}
    return {k:s.k,s,ok,now,need};});};
KR.bits=W=>{let b=0;KR.prog(W).forEach((x,i)=>{if(i===0||x.ok)b|=1<<i;});return b;};
const SK=()=>B2.s('k');
/* b2-fix15 Б4: в окне IPO и при выборе следующего края звёзды текущего края (IPO гарантирована) уже считаются — иначе после Якутии снова Якутия */
KR.stP=()=>{const st=Object.assign({},SK().st||{}),W=root.GAME&&GAME.W,k=kOf(W);try{if(k&&k.id&&E.ipoReady(W))st[k.id]=(st[k.id]||0)|KR.bits(W);}catch(e){}return st;};
KR.total=p=>{const s=p?KR.stP():SK().st||{};let n=0;for(const k in s)n+=nb(s[k]);return n;};
KR.open=(id,p)=>{const D=data(id);if(!D)return false;const n=D.need||{},st=p===true?KR.stP():SK().st||{};if(n.st&&KR.total(p===true)<n.st)return false;if(n.all&&n.all.some(x=>!((st[x]||0)&1)))return false;return true;};
KR.next=()=>{const s=SK(),Ls=KR.list().filter(x=>KR.open(x,true));if(s.nx&&Ls.indexOf(s.nx)>=0)return s.nx;const st=KR.stP();
  return Ls.find(x=>!((st[x]||0)&1))||Ls.find(x=>nb(st[x]||0)<3)||Ls[0]||null;};
/* ================= IPO: звёзды старого края, новый холдинг — в выбранном крае ================= */
if(root.GAME&&GAME.doIpo&&!GAME.doIpo.kr){const d0=GAME.doIpo;GAME.doIpo=function(){const W0=GAME.W;if(!GAME.ipoReady())return d0.apply(this,arguments);
  const k0=kOf(W0),id0=k0?k0.id:null,bits=id0?KR.bits(W0):0,rvOk=id0&&KR.prog(W0).some(x=>x.k==='rival'&&x.ok),s=SK(),nx=KR.next(),c=(s.c||[]).slice(),mon=W0.m-(k0&&k0.m0||0);
  KR.pend=nx?{id:nx,c}:null;let r;try{r=d0.apply(this,arguments);}finally{KR.pend=null;}
  if(r){if(id0){r.mo=mon;r.kr=id0;r.ks=bits;const st=s.st||(s.st={}),n=s.n||(s.n={}),bs=s.b||(s.b={});const was=st[id0]||0;st[id0]=was|bits;n[id0]=(n[id0]||0)+1;r.kn=nb(st[id0])-nb(was);
      const b=bs[id0];if(!b||mon<b.mo)bs[id0]={mo:mon,eq:Math.round(r.eq/1e6)};
      const nc=(k0.c||[]).length;if(nc&&r.fs>0){const add=Math.round(r.fs*.15*nc);if(add>0){S.fs=(S.fs||0)+add;r.fs+=add;r.fsc=add;}}}
    if(rvOk)s.rv=1;if(nx)r.nx=nx;s.c=[];delete s.nx;B2.ev('krai','ipo',{k:id0||'-',s:bits,n:nx||'-'});}
  return r;};GAME.doIpo.kr=1;}
if(typeof document==='undefined')return;
/* ================= вид ================= */
const T=(r,e)=>typeof L==='function'?L(r,e):r,t2=a=>a?T(a[0],a[1]):'';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const M=v=>root.FMT?FMT.money(v):Math.round(v)+' ₽',Q=(q,g)=>root.FMT?FMT.qty(q,g):String(Math.round(q));
const MON=[['январь','January'],['февраль','February'],['март','March'],['апрель','April'],['май','May'],['июнь','June'],['июль','July'],['август','August'],['сентябрь','September'],['октябрь','October'],['ноябрь','November'],['декабрь','December']];
const MONG=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const star=(on)=>`<span class="kr-st${on?' on':''}">★</span>`;
function css(){if(document.getElementById('krCss'))return;const st=document.createElement('style');st.id='krCss';st.textContent=`
.kr-c{border-left:5px solid var(--kr,#2f6fb3)}.kr-h{display:flex;align-items:center;gap:8px;margin:0 0 6px}.kr-h b{font-size:19px}.kr-h small{color:var(--muted);font-size:15px}
.kr-st{color:#b9c1cc;font-size:20px;letter-spacing:1px;opacity:.28;-webkit-filter:grayscale(1);filter:grayscale(1)}.kr-st.on{color:#e0a800;opacity:1;-webkit-filter:none;filter:none}.kr-r{margin:6px 0;padding:8px 10px;border-radius:10px;background:rgba(127,140,160,.10);font-size:16px}
.kr-r.cl{background:rgba(70,140,220,.14)}.kr-r.op{background:rgba(46,125,50,.12)}.kr-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:16px;margin:4px 0}
.kr-row .ok{color:var(--good)}.kr-pick{display:block;width:100%;text-align:left;margin:8px 0;padding:10px 12px;border-radius:12px;border:2px solid var(--line);background:var(--card);color:var(--ink);font-size:16px;min-height:48px}
.kr-pick.on{border-color:var(--kr,#2f6fb3);box-shadow:0 0 0 2px var(--kr,#2f6fb3) inset}.kr-pick.lock{opacity:.75;background:transparent}.kr-pick b{font-size:18px}
.kr-cond{display:flex;align-items:center;gap:10px;width:100%;text-align:left;margin:6px 0;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:16px;min-height:48px}
.kr-cond i{font-style:normal;min-width:26px;font-size:20px}.kr-cond.on{border-color:var(--good);background:rgba(46,125,50,.10)}
.kr-map svg{width:100%;height:auto;display:block}.kr-fame td{padding:4px 6px;font-size:15px;border-bottom:1px solid var(--line)}.kr-fame{width:100%;border-collapse:collapse}
@supports not (gap:8px){.kr-h>*{margin-right:8px}}`;document.head.appendChild(st);}
css();
/* ---- значки товаров и объектов края в общие таблицы ui.js ---- */
function icons(){const K=root.KRAI_DATA;if(!K||!root.UI||!UI.GD)return;for(const g in K.ico||{})if(!UI.GD[g])UI.GD[g]=K.ico[g];for(const t in K.oico||{})if(!UI.OG[t]){const o=K.oico[t];UI.OG[t]=()=>[o.c,o.p];}}
function gIco(g,R){const G=root.UI&&UI.GD&&UI.GD[g];let s='<circle cx="20" cy="20" r="20" style="fill:var(--icbg)"/>';if(!G)return s;s+='<g transform="translate(6.8 6.8) scale(.66)">';
  for(const [t,p] of G.p)s+=`<path d="${p}" fill="${t==='l'?G.c:'none'}" fill-opacity="${t==='l'?.3:0}" style="stroke:var(--icln)" stroke-width="1.8" stroke-linejoin="round"/>`;return s+'</g>';}
/* ---- правило края: строка состояния ---- */
function ruleLine(W,D){const R=D.rule||{},m=((W.m%12)+12)%12,nm=t2(R.n);
  if(R.ss&&root.KRAI2){const z=KRAI2.sea(W,D);if(z)return z;}   /* b2-krai2: сезоны края (rule.ss) */
  if(R.sale){const pxm=(R.px||[]).reduce((a,x)=>a.concat(x.m),[]),stOf=mm=>R.sale.open.indexOf(mm)<0?0:pxm.indexOf(mm)>=0?2:1,s0=stOf(m);let n=0,mm=m;while(n<12&&stOf(mm)===s0){mm=(mm+1)%12;n++;}
    const rs=R.sale.r.map(r=>T(E.REGS[r].ng||E.REGS[r].n,E.REGS[r].en)).join(T(' и ',' and ')),un=T(`до 1 ${MONG[mm]}`,`until ${MON[mm][1]} 1`),px=(R.px||[])[0],pc=px?Math.round((1-px.x)*100):0;
    let st='';for(const r of R.sale.r){const q=E.stockR(W,r),c=E.storR(W,r);if(q>=1)st+=` · ${root.NM?NM.reg(r):r}: ${T('склад','stock')} ${Math.round(q/c*100)} %`;}
    if(s0===1)return {c:'op',h:`❄ ${T(`${nm} открыт ${un}: вывозите склады из ${rs} по полной цене.`,`The ${nm.toLowerCase()} is open ${un}: ship stock out of ${rs} at full price.`)}${st}`};
    if(s0===2)return {c:'op',h:`🚢 ${T(`Навигация ${un}: из ${rs} — только рекой, тяжёлое дешевле на ${pc} %. Можно держать до зимника.`,`River season ${un}: ${rs} ship by river only, heavy goods ${pc}% cheaper. Or hold until the winter road.`)}${st}`};
    return {c:'cl',h:`⛔ ${T(`Распутица ${un}: из ${rs} тяжёлое не вывезти, склад копится. Золото летит самолётом.`,`Mud season ${un}: heavy goods can’t leave ${rs}; stock piles up. Gold flies out.`)}${st}`};}
  if(R.prod||R.px){const on=(R.prod||[]).some(x=>x.m.indexOf(m)>=0)||(R.px||[]).some(x=>x.m.indexOf(m)>=0);const ms=(R.prod||R.px)[0].m;let n=0,mm=m;while(n<12&&(ms.indexOf(mm)>=0)===on){mm=(mm+1)%12;n++;}
    return on?{c:'cl',h:`🌙 ${T(`${nm} — до 1 ${MONG[mm]}.`,`${nm} — until ${MON[mm][1]} 1.`)} ${t2(R.t).split('. ').slice(1).join('. ')}`}:{c:'op',h:`☀ ${T(`${nm} начнётся 1 ${MONG[mm]}.`,`${nm} starts on ${MON[mm][1]} 1.`)} ${t2(R.t).split('. ').slice(1).join('. ')}`};}
  return {c:'',h:t2(R.t)};}
/* ---- звёзды строками ---- */
function starRows(W,D){const P=KR.prog(W);return P.map((x,i)=>{let t='',v='';const s=x.s;
  if(s.k==='ipo'){t=T('IPO края','IPO in this region');v=`${M(x.now)} ${T('из','of')} ${M(x.need)}`;}
  else if(s.k==='mo'){t=T(`IPO не дольше ${s.n} мес.`,`IPO within ${s.n} months`);v=x.ok?T(`идёт ${x.now + 1}-й`,`month ${x.now+1}`):T('уже не успеть — в другой раз','too late — next time');}
  else if(s.k==='rival'){t=T(`Обогнать «${D.rival.n}»`,`Beat ${D.rival.en}`);v=`${M(x.now)} / ${M(x.need)}`;}
  else if(s.k==='sold'){t=i===2&&D.t.st3?t2(D.t.st3):T(`Продать ${Q(s.q,s.g)}`,`Sell ${Q(s.q,s.g)}`);v=`${Q(x.now,s.g)} / ${Q(s.q,s.g)}`;}
  else if(s.k==='built'){t=T(`Построить: ${NM.obj(s.t)}`,`Build: ${NM.obj(s.t)}`);v=x.ok?'✓':'—';}
  else if(s.k==='noloan'){t=T(`Без кредитов дороже ${Math.round(s.r*100)} %`,`No loans above ${Math.round(s.r*100)}%`);v=x.ok?'✓':T('был дороже','was dearer');}
  return `<div class="kr-row"><span>${star(x.ok&&(s.k!=='mo'||P[0].ok))} ${t}</span><b class="${x.ok?'ok':''}">${v}</b></div>`;}).join('');}
/* ---- карточка края (гнездо today, карта «Недр») ---- */
function today(ctx){const W=ctx.W||GAME.W;if(!W||!W.ned)return '';icons();const k=kOf(W),D=k&&data(k.id);
  if(!D){const nx=KR.next(),N=nx&&data(nx);if(!N)return '';
    return `<div class="card kr-c" style="--kr:${N.col}"><div class="kr-h">🗺 <b>${T('Империя','Empire')}</b></div><p style="margin:0">${T(`После IPO — новый край: <b>${t2(N.n)}</b> (${t2(N.sub).toLowerCase()}). Свой товар, своё правило, свои соперники.`,`After the IPO — a new region: <b>${t2(N.n)}</b> (${t2(N.sub).toLowerCase()}). Its own goods, its own rule, its own rivals.`)}</p>
      <button class="btn w noenter" data-b2="krai:emp">🗺 ${T('Карта Империи','Empire map')}</button></div>`;}
  const st=(SK().st||{})[k.id]||0,mon=W.m-(k.m0||0),rl=ruleLine(W,D),nw=mon<2;
  let h=`<div class="card kr-c" style="--kr:${D.col}"><div class="kr-h">🧭 <b>${T(`Край №${D.no}: ${t2(D.n)}`,`Region ${D.no}: ${t2(D.n)}`)}</b> <span>${star(st&1)}${star(st&2)}${star(st&4)}</span></div>
    <small class="mut">${t2(D.sub)}${(k.c||[]).length?' · '+k.c.map(c=>CN[c][0]).join(' '):''}</small>`;
  if(nw)h+=`<div class="say" style="margin:8px 0">${root.UI&&UI.face?UI.face('happy'):''}<div><p>${t2(D.t.hi)}</p></div></div>`;
  h+=`<div class="kr-r ${rl.c}">${rl.h}</div>`;
  const P=k.e&&W.m<k.e.u&&D.rule.ev?D.rule.ev[k.e.i]:null;if(P)h+=`<div class="kr-r">⚡ ${t2(P.n)} · ${T('до','until')} ${FMT.date(k.e.u)}</div>`;
  h+=`<div style="margin-top:6px"><b>${T('Звёзды края','Region stars')}</b>${starRows(W,D)}</div>`;
  const b=(SK().b||{})[k.id];if(b)h+=`<p class="mut" style="margin:4px 0;font-size:15px">🏆 ${T(`Ваш рекорд здесь: IPO за ${b.mo} мес. — побьёте?`,`Your record here: IPO in ${b.mo} months — can you beat it?`)}</p>`;
  return h+`<button class="btn w noenter" data-b2="krai:emp">🗺 ${T('Империя и Зал славы','Empire & Hall of Fame')}</button></div>`;}
/* ---- выбор края в окне IPO ---- */
const CN={money:['💸',['Дорогие деньги','Dear money'],['ставка банка +3 п.','bank rate +3 pts']],north:['🚛',['Северный завоз','Northern haul'],['дороги ×1,4, разведка +20 %','routes ×1.4, exploration +20%']],green:['🌲',['Бережный надзор','Strict eco-watch'],['постоянные рудников +15 %','mine fixed costs +15%']]};
function ipo(ctx){const W=ctx.W||GAME.W;if(!W)return '';const Ls=KR.list();if(!Ls.length)return '';const s=SK(),nx=KR.next(),D=data(nx);
  let h=`<div class="card" style="text-align:left"><h3 style="margin:0 0 4px">🗺 ${T('Куда дальше? Новый холдинг — в новом крае','Where next? The new holding — in a new region')}</h3>`;
  for(const id of Ls){const X=data(id),op=KR.open(id,true),st=(s.st||{})[id]||0;
    const need=X.need&&X.need.st?T(`нужно ★ ${X.need.st} (у вас ${KR.total(true)})`,`needs ★ ${X.need.st} (you have ${KR.total(true)})`):X.need&&X.need.all?T('нужно IPO во всех краях','needs an IPO in every region'):'';
    h+=`<button class="kr-pick noenter${id===nx?' on':''}${op?'':' lock'}" style="--kr:${X.col}" ${op?`data-b2="krai:pick:${id}"`:'disabled'}><b>${op?'':'🔒 '}${t2(X.n)}</b> ${star(st&1)}${star(st&2)}${star(st&4)}<br>
      <span>${t2(X.sub)}</span>${op?`<br><small class="mut">${t2(X.rule.n)}: ${esc(t2(X.rule.t).split('. ')[0])}. ${T('Капитал','Capital')} ${M(X.cap||800e6+200e6*(W.rep+1))}</small>`:`<br><small class="mut">${need}</small>`}</button>`;}
  if(D&&(D.cond||[]).length){const c=s.c||[];h+=`<p style="margin:10px 0 2px"><b>${T('Условия холдинга','Holding conditions')}</b> <span class="mut">${T('— по желанию: сложнее, но каждое +15 % долей основателя при следующем IPO','— optional: harder, but each gives +15% founder shares at the next IPO')}</span></p>`;
    for(const k of D.cond){const x=CN[k],on=c.indexOf(k)>=0;h+=`<button class="kr-cond noenter${on?' on':''}" data-b2="krai:cond:${k}"><i>${on?'☑':'☐'}</i><span>${x[0]} <b>${t2(x[1])}</b> — ${t2(x[2])}</span></button>`;}}
  return h+'</div>';}
function rerender(el){const box=el&&el.closest&&el.closest('[data-b2s="krai"]');if(!box)return;box.innerHTML=ipo({W:GAME.W});}
/* ---- кабинет ---- */
function cab(){return KR.list().length&&(S.fame||[]).length?`<button class="btn w noenter" data-b2="krai:emp">🗺 ${T('Империя и Зал славы','Empire & Hall of Fame')} · ★ ${KR.total()}</button>`:'';}
/* ---- карта края ---- */
function sm(P){const n=P.length,f=p=>p[0].toFixed(1)+','+p[1].toFixed(1),t=.17;let d='M'+f(P[0]);for(let i=0;i<n;i++){const p0=P[(i-1+n)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n];
  d+='C'+f([p1[0]+(p2[0]-p0[0])*t,p1[1]+(p2[1]-p0[1])*t])+' '+f([p2[0]-(p3[0]-p1[0])*t,p2[1]-(p3[1]-p1[1])*t])+' '+f(p2);}return d+'Z';}
KR.mapSvg=function(W){const k=kOf(W),D=k&&data(k.id);if(!D||!D.map)return null;icons();const Mp=D.map,mw=(document.getElementById('main')||{}).clientWidth||360;
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const lat0=Math.cos((Mp.c.reduce((a,p)=>a+p[1],0)/Mp.c.length)*Math.PI/180);
  const pr=p=>[p[0]*lat0,-p[1]];for(const p of Mp.c){const q=pr(p);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}
  const W0=480,H0=300,pad=18,sc=Math.min((W0-2*pad)/(x1-x0),(H0-2*pad-30)/(y1-y0)),ox=(W0-(x1-x0)*sc)/2,oy=30+(H0-30-(y1-y0)*sc)/2;
  const PX=p=>{const q=pr(p);return [ox+(q[0]-x0)*sc,oy+(q[1]-y0)*sc];},u=v=>+(v*W0/Math.max(280,Math.min(mw-28,700))).toFixed(1);
  const m=((W.m%12)+12)%12,R=D.rule||{},ss=R.ss&&root.KRAI2?KRAI2.sea(W,D):null/* b2-krai2 */,dark=ss?ss.dk:(R.prod||R.px)&&((R.prod||R.px)[0].m.indexOf(m)>=0),zimO=R.sale&&R.sale.open.indexOf(m)>=0,rivN=!!(R.px&&R.sale&&R.px.some(x=>x.m.indexOf(m)>=0));
  let s=`<svg viewBox="0 0 ${W0} ${H0}" role="img" aria-label="${esc(T('Карта края','Region map'))}"><defs><linearGradient id="krSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark?'#1d2540':Mp.bg}"/><stop offset="1" stop-color="${dark?'#3a4670':'var(--map-bg,#fff)'}"/></linearGradient></defs>`;
  s+=`<rect width="${W0}" height="${H0}" fill="url(#krSky)" opacity="${dark?1:.55}"/>`;
  if(dark)s+=`<path d="M0 46 Q120 10 240 40 T480 30" stroke="#5be3a6" stroke-width="${u(9)}" fill="none" opacity=".35"/><path d="M0 60 Q140 26 260 54 T480 48" stroke="#8a7cf0" stroke-width="${u(6)}" fill="none" opacity=".25"/>`;
  s+=`<path d="${sm(Mp.c.map(PX))}" class="map-land" stroke-width="${u(1.4)}" stroke-linejoin="round"/>`;
  for(const rv of Mp.rv||[])s+=`<path d="M${rv.map(p=>PX(p).map(v=>v.toFixed(1)).join(',')).join(' L')}" fill="none" stroke="#7fb3e6" stroke-width="${u(2.2)}" stroke-linecap="round" stroke-linejoin="round" opacity="${rivN?1:.7}"${rivN?'':` stroke-dasharray="${u(1.5)} ${u(3.5)}"`}/>`;
  const XY={};for(const r of E.REG)XY[r]=PX(E.REGS[r].xy);   // маркеры не налезают: раздвигаем, держим в рамке
  for(let it=0;it<40;it++)for(const a of E.REG)for(const b of E.REG){if(a>=b)continue;const A=XY[a],Bq=XY[b],dx=Bq[0]-A[0],dy=Bq[1]-A[1],d=Math.hypot(dx,dy)||1,mn=u(78);if(d<mn){const k=(mn-d)/2/d;A[0]-=dx*k;A[1]-=dy*k;Bq[0]+=dx*k;Bq[1]+=dy*k;}}
  for(const r of E.REG){const p=XY[r];p[0]=Math.max(u(40),Math.min(W0-u(40),p[0]));p[1]=Math.max(u(70),Math.min(H0-u(52),p[1]));}
  let lbs='';  for(const [a,b,kd] of Mp.rd||[]){const A=XY[a],Bp=XY[b],zim=kd==='zim',off=zim&&R.sale&&(!zimO||rivN),col=zim?(off?'#a9b6c6':'#3d8fe0'):kd==='sea'?'#3d8fe0':'var(--rail,#3a414b)';
    s+=`<path d="M${A[0].toFixed(1)},${A[1].toFixed(1)} L${Bp[0].toFixed(1)},${Bp[1].toFixed(1)}" stroke="${col}" stroke-width="${u(zim?3:2.4)}" stroke-linecap="round"${zim||kd==='sea'?` stroke-dasharray="${u(zim?7:3)} ${u(5)}"`:''} fill="none"/>`;
    const dx=Bp[0]-A[0],dy=Bp[1]-A[1],ln=Math.hypot(dx,dy)||1;if(ln<u(120))continue;const mx=(A[0]+Bp[0])/2-dy/ln*u(14),my=(A[1]+Bp[1])/2+dx/ln*u(14),lb=(zim?(off?'☀ ':'❄ '):kd==='sea'?'⚓ ':'')+`${root.FMT?FMT.num(E.km(a,b)):E.km(a,b)} ${T('км','km')}`,tw=u(lb.length*6.6+14);
    lbs+=`<g transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})"><rect x="${-tw/2}" y="${-u(11)}" width="${tw}" height="${u(21)}" rx="${u(10)}" class="map-tag" stroke-width="${u(1)}"/><text y="${u(4)}" text-anchor="middle" class="map-tagt" font-size="${u(11.5)}">${lb}</text></g>`;}
  for(const r of E.REG){const P=XY[r],Rr=u(21),objs=W.obj.filter(o=>o.r===r).length,auc=W.auc.some(a=>a.r===r&&!a.done),cls=KR.closed(W,r);
    const g=Object.keys(E.REGS[r].p).sort((x,y)=>E.REGS[r].p[y]-E.REGS[r].p[x])[0];
    s+=`<g class="rg${auc?' sel':''}" data-a="reg" data-r="${r}"><circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="${(Rr+u(11)).toFixed(1)}" class="map-halo"/><circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="${Rr}" class="map-mk" stroke-width="${u(2.4)}"${cls?' style="stroke:#7fb3e6"':''}/>`;
    s+=`<svg x="${(P[0]-Rr*.78).toFixed(1)}" y="${(P[1]-Rr*.78).toFixed(1)}" width="${(Rr*1.56).toFixed(1)}" height="${(Rr*1.56).toFixed(1)}" viewBox="0 0 40 40">${gIco(g)}</svg>`;
    if(objs)s+=`<circle cx="${(P[0]+Rr*.82).toFixed(1)}" cy="${(P[1]-Rr*.82).toFixed(1)}" r="${u(10)}" class="map-badge" stroke-width="${u(2)}"/><text x="${(P[0]+Rr*.82).toFixed(1)}" y="${(P[1]-Rr*.82+u(4.5)).toFixed(1)}" text-anchor="middle" font-size="${u(13)}" class="map-badget">${objs}</text>`;
    if(cls)s+=`<text x="${(P[0]-Rr*.95).toFixed(1)}" y="${(P[1]-Rr*.6).toFixed(1)}" font-size="${u(15)}" text-anchor="middle">🔒</text>`;
    if(auc)s+=`<g transform="translate(${(P[0]).toFixed(1)} ${(P[1]-Rr*1.55).toFixed(1)})"><rect x="${-u(32)}" y="${-u(12)}" width="${u(64)}" height="${u(22)}" rx="${u(6)}" class="map-aucb"/><text y="${u(4.5)}" text-anchor="middle" font-size="${u(12)}" class="map-auct">${T('ТОРГИ','AUCTION')}</text></g>`;
    s+=`<text x="${P[0].toFixed(1)}" y="${(P[1]+Rr+u(18)).toFixed(1)}" text-anchor="middle" font-size="${u(15)}" class="map-rgn">${esc(root.NM?NM.reg(r):r)}</text></g>`;}
  s+=lbs;  const riv=rivN,rl=ss?ss.lb/* b2-krai2 */:R.sale?(!zimO?T('⛔ Распутица','⛔ Mud season'):riv?T('🚢 Навигация','🚢 River season'):T('❄ Зимник открыт','❄ Winter road open')):dark?T('🌙 Полярная ночь','🌙 Polar night'):T('☀ Полярный день','☀ Polar day');
  s+=`<g transform="translate(10 8)"><rect width="${u(rl.length*8.4+26)}" height="${u(26)}" rx="${u(13)}" fill="${dark?'#2b3560':'#fff'}" stroke="${D.col}" stroke-width="${u(1.4)}"/><text x="${u(10)}" y="${u(17.5)}" font-size="${u(14)}" fill="${dark?'#fff':D.col}" font-weight="700">${rl}</text></g>`;
  s+=`<text x="${W0-10}" y="${u(26)}" text-anchor="end" font-size="${u(13)}" fill="${dark?'#cdd6f0':'var(--muted,#5a6675)'}">${esc(t2(D.n))}</text>`;
  return s+'</svg>';};
/* ---- окно «Империя»: карта страны + края + Зал славы ---- */
const OUT=[[30,69.5],[41,67],[44,68],[54,68.5],[60,69.8],[68,72.5],[80,73.5],[90,75.5],[104,77.7],[113,73.8],[130,71.5],[140,72.5],[160,69.8],[180,68.8],[190,65.5],[179,62.5],[170,60],[163,58.5],[156.7,51],[156,57],[152,59.5],[141,59],[135,55],[141,52],[140,48],[132,43],[131,45],[134,48.5],[127,49.5],[120,53.3],[116,50],[107,50],[98,50],[88,49.5],[82,50.5],[69,55],[61,54],[60,51],[52,51.5],[48,46.5],[47.5,41.5],[40,43.5],[37,45],[39.5,47.5],[40,50],[35,52],[32,52.5],[31.5,55.5],[28,56.5],[27.5,58],[28,59.5],[30,61],[29.5,63]];
function empMap(){const PX=p=>[(p[0]-26)*2.9,(78-p[1])*6.2],Ls=KR.list(),st=SK().st||{};
  let s=`<svg viewBox="-6 0 490 240" role="img" aria-label="${esc(T('Карта Империи','Empire map'))}"><path d="${sm(OUT.map(PX))}" class="map-land" stroke-width="1.2"/>`;
  const home=PX([60.6,56.8]);let prev=home;
  for(const id of Ls){const D=data(id),P=PX(D.xy);s+=`<path d="M${prev[0].toFixed(1)},${prev[1].toFixed(1)} L${P[0].toFixed(1)},${P[1].toFixed(1)}" stroke="#9aa6b4" stroke-width="1.6" stroke-dasharray="4 4" fill="none"/>`;prev=P;}
  s+=`<circle cx="${home[0].toFixed(1)}" cy="${home[1].toFixed(1)}" r="9" fill="#c8641e"/><text x="${home[0].toFixed(1)}" y="${(home[1]+22).toFixed(1)}" text-anchor="middle" font-size="12" class="map-rgn">${T('Акт 1','Act 1')}</text>`;
  for(const id of Ls){const D=data(id),P=PX(D.xy),op=KR.open(id),b=st[id]||0;
    s+=`<g><circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="13" fill="${op?D.col:'#b9c1cc'}" stroke="#fff" stroke-width="2.5"/><text x="${P[0].toFixed(1)}" y="${(P[1]+5).toFixed(1)}" text-anchor="middle" font-size="13" fill="#fff" font-weight="700">${op?D.no:'🔒'}</text>
      <text x="${P[0].toFixed(1)}" y="${(P[1]+30).toFixed(1)}" text-anchor="middle" font-size="12.5" class="map-rgn">${esc(t2(D.n))}</text><text x="${P[0].toFixed(1)}" y="${(P[1]+45).toFixed(1)}" text-anchor="middle" font-size="12" fill="#e0a800">${'★'.repeat(nb(b))}<tspan fill="#b9c1cc">${'★'.repeat(3-nb(b))}</tspan></text></g>`;}
  return s+'</svg>';}
function openEmp(){if(typeof modal!=='function')return;const Ls=KR.list(),s=SK(),st=s.st||{},F=(S.fame||[]).slice().sort((a,b)=>(a.hold||0)-(b.hold||0));
  let h=`<h2>🗺 ${T('Империя','Empire')} · ★ ${KR.total()}</h2><div class="card kr-map">${empMap()}</div>`;
  for(const id of Ls){const D=data(id),op=KR.open(id),b=st[id]||0,bs=(s.b||{})[id];
    h+=`<div class="card kr-c" style="--kr:${D.col}"><div class="kr-h"><b>${op?'':'🔒 '}${T(`№${D.no} ${t2(D.n)}`,`No. ${D.no} ${t2(D.n)}`)}</b> ${star(b&1)}${star(b&2)}${star(b&4)}</div><small class="mut">${t2(D.sub)} · ${t2(D.rule.n)}</small>
      <div class="kr-row"><span>${star(b&1)} IPO</span></div><div class="kr-row"><span>${star(b&2)} ${t2(D.t.st2)}</span></div><div class="kr-row"><span>${star(b&4)} ${t2(D.t.st3)}</span></div>
      ${bs?`<p class="mut" style="margin:4px 0;font-size:15px">🏆 ${T(`Лучший проход: IPO за ${bs.mo} мес., ${M(bs.eq*1e6)}`,`Best run: IPO in ${bs.mo} months, ${M(bs.eq*1e6)}`)}</p>`:''}
      ${op?'':`<p class="mut" style="margin:4px 0;font-size:15px">${D.need&&D.need.st?T(`Откроется с ★ ${D.need.st}`,`Opens at ★ ${D.need.st}`):T('Откроется после IPO во всех краях','Opens after an IPO in every region')}</p>`}</div>`;}
  h+=`<h3>🏛 ${T('Зал славы','Hall of Fame')}</h3>`;
  if(F.length){let best=null,big=null;for(const f of F){if(f.mo!=null&&(!best||f.mo<best.mo))best=f;if(!big||f.eq>big.eq)big=f;}
    h+=`<div class="card"><table class="kr-fame"><tr><td><b>№</b></td><td><b>${T('Где','Where')}</b></td><td><b>${T('Мес.','Mo.')}</b></td><td><b>${T('Стоимость','Value')}</b></td></tr>`+F.map(f=>{const D=f.kr&&data(f.kr);
      return `<tr><td>${f.hold||'—'}</td><td>${D?esc(t2(D.n))+' '+'★'.repeat(nb(f.ks||0)):T('Акт 1','Act 1')}</td><td>${f.mo!=null?f.mo:'—'}</td><td>${M(f.eq||0)}</td></tr>`;}).join('')+`</table>
      ${best?`<p style="margin:8px 0 0">⏱ ${T(`Самое быстрое IPO: ${best.mo} мес. (холдинг №${best.hold})`,`Fastest IPO: ${best.mo} months (holding No. ${best.hold})`)}</p>`:''}${big?`<p style="margin:4px 0 0">💰 ${T(`Самый дорогой холдинг: ${M(big.eq)} (№${big.hold})`,`Most valuable holding: ${M(big.eq)} (No. ${big.hold})`)}</p>`:''}</div>`;}
  else h+=`<p class="mut">${T('Здесь будут все ваши холдинги после IPO.','All your holdings will appear here after an IPO.')}</p>`;
  h+=`<div class="row"><button class="btn green" data-b2="krai:x" data-esc>${T('Закрыть','Close')}</button></div>`;
  modal(h);B2.ev('krai','emp',{n:KR.total()});}
KR.openEmp=openEmp;
function click(a,arg,el){const s=SK();
  if(a==='pick'&&KR.open(arg,true)){s.nx=arg;s.c=(s.c||[]).filter(c=>(data(arg).cond||[]).indexOf(c)>=0);if(typeof SND!=='undefined'&&SND.tap)SND.tap();rerender(el);if(typeof save==='function')save();}
  else if(a==='cond'){const c=s.c||(s.c=[]),i=c.indexOf(arg);if(i>=0)c.splice(i,1);else c.push(arg);if(typeof SND!=='undefined'&&SND.tap)SND.tap();rerender(el);if(typeof save==='function')save();}
  else if(a==='emp'){if(typeof SND!=='undefined'&&SND.tap)SND.tap();openEmp();}
  else if(a==='x'){if(typeof hideModal==='function')hideModal();}}
function reg(ctx){const W=ctx.W||GAME.W,k=kOf(W),D=k&&data(k.id);if(!D)return '';const r=ctx.r,R=D.rule||{};
  if(R.sale&&R.sale.r.indexOf(r)<0)return `<div class="kr-r op">🚂 ${T('Сюда железная дорога — вывоз круглый год.','There’s a railway here — shipping all year round.')}</div>`;
  const rl=ruleLine(W,D);return `<div class="kr-r ${rl.c}">${rl.h}</div>`;}
KR.UI={today,ipo,cab,reg,click};
icons();
}
})(typeof window!=='undefined'?window:globalThis);
