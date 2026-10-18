/* b2-st-beta.js — ST: супер-статистика беты «Магнат 2.0» (грузит js/b2-st.js через B2.need, только в бете и только с DOM).
   Задача — M49-nedra/ST-TASK.md; журнал — release-b/M50-boost/logs/ST.md; разбор — python3 ~/Projects/hobby-analytics/stat/magnat-beta.py.
   Чужие файлы НЕ правятся: обёртки глобальных функций shell.js (save, cloudLoad, cloudFlush, vkSaveCloud, YP.setData), STAT.screen;
   наблюдатели (MutationObserver) за #modal/#mcard (окна), #adv (Людмила, обучение), #toast; опрос раз в 1 с (телефон, словарик, время, скорость);
   GAME.on(change/day/close/ipo/ruin/rollback); один click-слушатель на document (захват, passive).
   Все события — B2.ev('st',имя,{…}) → b2st_<имя>; ≤ 8 полей, строки ≤ 40 (модуль режет сам). Деньги — тыс. ₽ (c, db, v…), t — игровой день W.t.
   СОБЫТИЯ:
    hd   {ch,h,t,c,v,db,cr,sp}  «шапка»: глава 1–5, холдинг, день, деньги, капитал, долг (тыс. ₽), 💎, скорость — на старте, смене главы/холдинга, закрытии месяца
    ld   {src,sz,rl,d,t,ms,hp,nv} загрузка: src ls|new|cl (облако подменило), размер сейва (знаков), rl=1 перезагрузка, d — день месяца, ms — от начала страницы, hp — МБ кучи, nv — вид перехода
    clk  {k,x,w,n,t}            нажатие: k — id/data-атрибут, x — текст кнопки (24), w — где (экран | w:<окно> | ph | adv), n — подряд одинаковых
    go   {n,t}                  переход экрана (STAT.screen, каждый, не только первый)
    win  {w,s,by,r,n,h,t}       окно закрыто: заголовок, секунд висело, чем закрыли (b:<кнопка>|x|bg|esc|auto|next|hid|quit), r=1 — то же окно < 60 с назад, n — сколько раз за 60 с, h=1 — держит время
    winx {w,n}                  то же окно больше 10 раз за минуту — дальше только счёт
    adv  {x,who,s,by,tu,r,n,t}  совет/сообщение Людмилы (пузырь #adv): текст 40, кто, секунд, чем закрыли (ok|go|off|auto|next), tu=1 обучение, r — повтор < 60 с, n — показов этого текста за сеанс
    tst  {x,n,w,t}              тост: текст, n — подряд одинаковых, w=1 — при открытом окне
    pho  {s,u0,u1,q,nc,t}       телефон закрыт: секунд, непрочитанных до/после, ждут ответа, нажатий внутри
    glc  {s,t}                  карточка словарика закрыта (открытие — gl из stat-hooks)
    a    {n,r,a0,a1,a2,c,t}     любое действие GAME.act: имя, итог, аргументы, деньги после (тыс. ₽)
    bid  {n,r,g,pr,st,lim,c,t}  ставка на торгах (недра bidRaise/bidPass, карьер opi*): цена, шаг, предел (тыс. ₽)
    aend {g,r,pr,you,why,V,t}   торги кончились: won|lost|none, цена, участвовал ли, why=cash — не хватило денег (вы лидировали)
    ipo  {h,eq,pf,db,c,fs,dv,ch} IPO: капитал, прибыль 12 мес., долг, деньги (млн ₽), доли, дивиденды (тыс./мес), направлений
    h2   {h,c,cr,fm,pk,dv,rep}  начало холдинга №N: деньги, 💎, прошлых холдингов, уровней улучшений, дивиденды, репутация
    ruin {m,db,c,t} / rb {m,bk,pay,t} / san {m,db,t}   разорение (окно отката), откат, принятая санация
    spd  {v,was,t}              скорость/пауза: 0 — своя ⏸, 1, 2, 4
    tm   {m,run,fx,win,rd,adv,hl,ps} за игровой месяц (секунды при открытой вкладке): шло (из них fx — на ×2/×4), стояло: окно, «читаю», Людмила/обучение/пролог/словарик, прочие hold, пауза (своя/площадка)
    sys  {m,sz,sv,svx,dom,ob,lt,ltm} раз в игровой месяц: размер сейва, save() ср./макс. мс, узлов DOM, точек+объектов, длинных задач и худшая (мс)
    lt   {ms,w,t,lg}            длинная задача ≥ 300 мс (≤ 40 за сеанс): где (экран/окно); lg=1 — замер по опозданию таймера (нет longtask)
    err  {m,s1..s6}             ошибка JS со стеком (≤ 10 разных за сеанс)
    cld  {r,ms,sz,k}            загрузка облака: ok|err|ok0 (раньше этого файла)|none; k — yp|vk
    cw   {ok,er,ms,sz,m}        записи в облако за игровой месяц (и сразу при первых ошибках)
    end  {s,cl,w,a}             уход со страницы: секунд сеанса, нажатий, окон, действий */
(function(){'use strict';
if(typeof window==='undefined'||typeof document==='undefined'||window.__b2st||!window.GAME||!window.B2||!B2.beta)return;
const Z=window.B2ST||{q:[]};
const G=()=>window.GAME&&GAME.W,STG=['gig','small','mid','quarry','nedra'];
const ev=(n,p)=>{try{B2.ev('st',n,p);}catch(e){}N.ev++;};
const N={ev:0,clk:0,win:0,act:0,t0:Date.now()};
const k1=x=>Math.round((+x||0)/1e3),m1=x=>Math.round((+x||0)/1e5)/10;
const day=()=>{const w=G();return w?w.t|0:-1;};
const tx=(s,n)=>String(s==null?'':s).replace(/\s+/g,' ').trim().slice(0,n||40);
const nrm=s=>String(s||'').replace(/[0-9\s.,:+−%()₽×-]+/g,'').slice(0,60);
const mOn=()=>typeof modalOn!=='undefined'&&modalOn;
let curScr=(function(){try{const e=document.querySelector('#main>.screen.on');return e?e.id.replace(/^scr-/,''):'';}catch(x){return '';}})();
function stI(){try{return STG.indexOf(GAME.stage())+1;}catch(e){return 0;}}
function debt(w){try{return ECON.debtOf?ECON.debtOf(w):0;}catch(e){return 0;}}
function eq(w){try{return ECON.equity?ECON.equity(w):GAME.value();}catch(e){return 0;}}
function spd(){try{return GAME.speed();}catch(e){return 1;}}
function arg(v){if(v==null)return '';if(typeof v==='boolean')return v?1:0;
  if(typeof v==='number'){const a=Math.abs(v);return a>=1e6?(v/1e6).toFixed(1)+'м':a>=1e4?Math.round(v/1e3)+'т':Math.round(v*100)/100;}
  if(typeof v==='string')return v.slice(0,16);try{return JSON.stringify(v).slice(0,24);}catch(e){return '?';}}

/* ---------- шапка ---------- */
let hdK='';
function hd(force){const w=G();if(!w)return;const k=stI()+'|'+(w.hold||1);if(!force&&k===hdK)return;hdK=k;
  let cr=0;try{cr=GAME.cr();}catch(e){}
  ev('hd',{ch:stI(),h:w.hold||1,t:w.t|0,c:k1(w.cash),v:k1(eq(w)),db:k1(debt(w)),cr,sp:spd()});}

/* ---------- загрузка ---------- */
function ld(){const w=G();let sz=0,nv='';try{sz=(localStorage.getItem(SKEY)||'').length;}catch(e){}
  try{const n=performance.getEntriesByType('navigation')[0];nv=n?n.type:'';}catch(e){}
  let hp=0;try{if(performance.memory)hp=Math.round(performance.memory.usedJSHeapSize/1048576);}catch(e){}
  ev('ld',{src:sz?'ls':'new',sz,rl:nv==='reload'?1:0,d:w?w.d|0:-1,t:day(),ms:Math.round(performance.now()),hp,nv:String(nv).slice(0,8)});}

/* ---------- нажатия ---------- */
const SEL='button,a,summary,label,select,input,abbr.gl,[role=button],[role=tab],[data-a],[data-b],[data-o],[data-ow],[data-op],[data-mt],[data-ra],[data-cb],[data-th],[data-b2],[data-gl],[data-fr],[data-rb],[data-cash],[data-mx],[data-id],[data-r],.btn,.set';
let last={t:0},cq=null,cqT=0;
function where(el){if(el.closest('#mcard')||el.id==='modal')return 'w:'+tx(win.cur?win.cur.w:'',14);if(el.closest('#adv'))return 'adv';if(el.closest('#phone'))return 'ph';if(el.closest('#glPop'))return 'gl';if(el.closest('#hdr'))return 'hdr';if(el.closest('#nav'))return 'nav';return curScr||'?';}
function keyOf(b){if(b.id)return '#'+b.id;const d=b.dataset||{};const ks=Object.keys(d);
  if(ks.length){let s='';for(let i=0;i<ks.length&&i<2;i++)s+=(i?' ':'')+ks[i]+'='+String(d[ks[i]]).slice(0,14);return s.slice(0,40);}
  const c=typeof b.className==='string'?b.className.split(' ')[0]:'';return b.tagName.toLowerCase()+(c?'.'+c:'');}
function cFlush(){if(!cq)return;if(cq.n)ev('clk',cq);cq=null;}
function onClick(e){try{const t=e.target;if(!t||!t.closest)return;N.clk++;
    if(t.id==='modal'){last={t:Date.now(),by:'bg'};cFlush();ev('clk',{k:'#modal',x:'фон',w:where(t),t:day()});return;}
    const b=t.closest(SEL)||t;const k=keyOf(b);let x=tx(b.getAttribute&&b.getAttribute('aria-label')||b.textContent,24);
    const inW=!!b.closest('#mcard'),cls=/^[×✕✖]$/.test(x)||/(^|\s)(x|mx|close|glx)(\s|$)/.test(b.className||'')||/Закрыть|Close/.test(b.getAttribute&&b.getAttribute('aria-label')||'');
    last={t:Date.now(),by:inW?(cls?'x':'b:'+tx(x,16)):'',adv:b.closest('#adv')?(b.id==='advOk'?'ok':b.id==='advGo'?'go':b.id==='advOff'?'off':'b'):''};
    const w=where(b),now=Date.now();
    if(cq&&cq.k===k&&cq.x===x&&cq.w===w&&now-cqT<1500){cq.n=(cq.n||0)+1;cqT=now;return;}   // одинаковые подряд — одной строкой-счётом (rp:1, n — сколько ещё)
    cFlush();if(N.clk>4000)return;   // разумный потолок сеанса
    ev('clk',{k,x,w,t:day()});cq={k,x,w,t:day(),rp:1};cqT=now;
  }catch(x){}}
document.addEventListener('click',onClick,{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')last={t:Date.now(),by:'esc'};},{capture:true,passive:true});
setInterval(()=>{if(cq&&Date.now()-cqT>1500)cFlush();},1000);

/* ---------- экраны ---------- */
try{if(window.STAT&&STAT.screen&&!STAT.screen.__st){const s0=STAT.screen;let gT=0,gS='';STAT.screen=function(n){const r=s0.apply(this,arguments);try{n=String(n||'').slice(0,16);if(n){curScr=n;clearTimeout(gT);gT=setTimeout(()=>{if(curScr!==gS){gS=curScr;ev('go',{n:curScr,t:day()});}},250);}}catch(e){}return r;};STAT.screen.__st=1;}}catch(e){}

/* ---------- окна (#modal / #mcard) ---------- */
const win={cur:null,rec:{},sup:{}};
function wTitle(){const c=document.getElementById('mcard');if(!c)return '';const h=c.querySelector('h2,h3,h4,.bz-hd b,b,strong');return tx(h?h.textContent:c.textContent,40);}
function by(){if(Date.now()-last.t<800&&last.by)return last.by;return 'auto';}
function wOpen(){const w=wTitle(),k=nrm(w)||'?',now=Date.now(),a=(win.rec[k]||[]).filter(x=>now-x<60000);a.push(now);win.rec[k]=a;
  win.cur={w,k,t0:now,h:typeof modalHold!=='undefined'&&modalHold?1:0,d:day(),r:a.length>1?1:0,n:a.length};N.win++;}
function wClose(b){const c=win.cur;if(!c)return;win.cur=null;const s=Math.round((Date.now()-c.t0)/100)/10;
  if(c.n>10){win.sup[c.k]=(win.sup[c.k]||{w:c.w,n:0});win.sup[c.k].n++;return;}
  ev('win',{w:c.w,s,by:b,r:c.r,n:c.n,h:c.h,t:c.d});}
function wSync(){try{const on=mOn();if(win.cur){if(!on)wClose(by());else{const k=nrm(wTitle())||'?';if(k!==win.cur.k){wClose('next');wOpen();}}}else if(on)wOpen();}catch(e){}}
setInterval(()=>{for(const k in win.sup){ev('winx',{w:win.sup[k].w,n:win.sup[k].n});delete win.sup[k];}},30000);

/* ---------- Людмила (#adv) ---------- */
const adv={cur:null,seen:{},rec:{}};
function aText(){const a=document.getElementById('adv');const t=a&&a.querySelector('.at');return tx(t?t.textContent:a?a.textContent:'',40);}
function aSync(){try{const a=document.getElementById('adv');const on=!!(a&&a.classList.contains('on'));
    if(adv.cur){const k=on?nrm(aText()):'';if(!on||k!==adv.cur.k){const c=adv.cur;adv.cur=null;
        const b=!on?(Date.now()-last.t<800&&last.adv?last.adv:'auto'):'next';
        ev('adv',{x:c.x,who:c.who,s:Math.round((Date.now()-c.t0)/1000),by:b,tu:c.tu,r:c.r,n:c.n,t:c.d});}}
    if(on&&!adv.cur){const x=aText(),k=nrm(x),now=Date.now();adv.seen[k]=(adv.seen[k]||0)+1;const r=adv.rec[k]&&now-adv.rec[k]<60000?1:0;adv.rec[k]=now;
      const an=a.querySelector('.an');adv.cur={x,k,who:tx(an?an.textContent:'',16),t0:now,tu:a.querySelector('#advOff')?1:0,r,n:adv.seen[k],d:day()};}}catch(e){}}

/* ---------- тосты ---------- */
let tq=null,tqT=0;
function tSync(){try{const e=document.getElementById('toast');if(!e||!e.classList.contains('on'))return;const x=tx(e.textContent,40);if(!x)return;const now=Date.now();
    if(tq&&tq.x===x){if(now-tqT>2500){tq.n=(tq.n||1)+1;}tqT=now;return;}
    if(tq)ev('tst',tq);tq={x,w:mOn()?1:0,t:day()};tqT=now;}catch(x){}}
setInterval(()=>{if(tq&&Date.now()-tqT>6000){ev('tst',tq);tq=null;}},2000);

function obs(id,o,f){const el=document.getElementById(id);if(!el)return false;try{new MutationObserver(f).observe(el,o);}catch(e){return false;}return true;}
obs('modal',{attributes:true,attributeFilter:['class']},wSync);obs('mcard',{childList:true},wSync);
obs('adv',{attributes:true,attributeFilter:['class'],childList:true},aSync);
obs('toast',{attributes:true,attributeFilter:['class'],childList:true,characterData:true,subtree:true},tSync);

/* ---------- действия, торги, IPO, разорение ---------- */
let aq=null,aqT=0,pre=null;
const AUC=/^(bid|opi)/i;
function aFlush(){if(aq&&aq.k)ev('a',aq);aq=null;}
function aucOf(w,id){if(!w||!id)return null;let a=(w.auc||[]).find(x=>x.id===id);if(a)return {g:a.g,pr:a.pr,st:a.step,V:a.V,lead:a.lead,k:'n'};
  a=(w.opi||[]).find(x=>x.id===id);if(a)return {g:a.g,pr:a.pr,st:a.step,V:a.V,lead:a.lead,k:'q',s:a.st};return null;}
const aucs={};
function aucScan(){const w=G();if(!w)return;const now={};
  for(const a of w.auc||[])if(!a.done)now[a.id]={g:a.g,pr:a.pr,lead:a.lead,you:a.you||a.lead==='you',V:a.V};
  for(const a of w.opi||[])if(a.st==='auc')now[a.id]={g:a.g,pr:a.pr,lead:a.lead,you:a.lead==='you',V:a.V};
  for(const id in aucs){if(now[id])continue;const o=aucs[id];delete aucs[id];
    let r='lost';const op=(w.opi||[]).find(x=>x.id===id),pl=op?null:(function(){for(const k in w.plots||{})for(const p of w.plots[k]||[])if(p.auc===id)return p;return null;})();
    if(op)r=op.own==='you'?'won':op.st==='bot'||op.own?'lost':'none';else if(pl)r=pl.own==='you'?'won':pl.own?'lost':'none';
    ev('aend',{g:String(o.g||''),r,pr:k1(o.pr),you:o.you?1:0,why:o.lead==='you'&&r!=='won'&&w.cash<o.pr?'cash':'',V:k1(o.V),t:day()});}
  for(const id in now){const o=now[id],p=aucs[id];aucs[id]=Object.assign(p||{},o,{you:(p&&p.you)||o.you});}}
GAME.on('change',(n,r,a)=>{try{if(!n)return;N.act++;const w=G();a=Array.isArray(a)?a:[];
    if(AUC.test(n)){const A=aucOf(w,a[0])||{};let lim='';try{if(A.k==='q'&&ECON.opiLim){const L=ECON.opiLim(w,a[0]);lim=L?k1(L.lim):'';}else if(A.V)lim=k1(A.V*.6);}catch(e){}
      ev('bid',{n:String(n).slice(0,10),r:String(r).slice(0,8),g:String(A.g||''),pr:k1(A.pr),st:k1(A.st),lim,c:k1(w&&w.cash),t:day()});aucScan();}
    const o={n:String(n).slice(0,16),r:String(typeof r==='object'?(r&&r.r||'obj'):r).slice(0,10),a0:arg(a[0]),a1:arg(a[1]),a2:arg(a[2]),c:k1(w&&w.cash),t:day()};
    const now=Date.now();if(aq&&aq.n===o.n&&aq.r===o.r&&aq.a0===o.a0&&now-aqT<2000){aq.k=(aq.k||0)+1;aq.c=o.c;aqT=now;return;}   // одинаковые подряд — строкой-счётом (rp:1, k — сколько ещё)
    aFlush();ev('a',o);aq={n:o.n,r:o.r,a0:o.a0,c:o.c,t:o.t,rp:1};aqT=now;}catch(e){}hd();});
setInterval(()=>{if(aq&&Date.now()-aqT>2000)aFlush();},1000);
function preSnap(){const w=G();if(!w)return;let pf=0;try{for(const h of (w.hist||[]).slice(-12))pf+=h.np||0;}catch(e){}pre={c:w.cash,db:debt(w),pf};}
GAME.on('day',()=>{preSnap();aucScan();hd();});
GAME.on('ipo',rec=>{try{const p=pre||{};ev('ipo',{h:rec.hold||1,eq:m1(rec.eq),pf:m1(p.pf),db:m1(p.db),c:m1(p.c),fs:rec.fs|0,dv:k1(rec.dv),ch:rec.ch|0});
    setTimeout(()=>{try{const w=G();let pk=0;for(const k in S.pk||{})pk+=+S.pk[k]||0;
      ev('h2',{h:w.hold||1,c:k1(w.cash),cr:GAME.cr(),fm:(S.fame||[]).length,pk,dv:k1(w.dv),rep:w.rep|0});hd(1);}catch(e){}},500);}catch(e){}});
GAME.on('ruin',rep=>{try{const w=G();ev('ruin',{m:rep&&rep.m,db:k1(debt(w)),c:k1(w.cash),t:day()});}catch(e){}});
GAME.on('rollback',x=>{try{ev('rb',{m:x&&x.m,bk:x&&x.back,pay:String(x&&x.pay||''),t:day()});hd(1);}catch(e){}});
GAME.on('reset',()=>setTimeout(()=>hd(1),300));

/* ---------- время, скорость, телефон, словарик (раз в 1 с) ---------- */
const tm={};let spd0=spd(),ph=null,gl=null;
function cat(){const w=G();if(!w)return '';let run=false;try{run=GAME.running();}catch(e){}
  if(run)return spd()>1?'fx':'run';if(mOn())return 'win';
  try{if(GAME.hold&&GAME.hold.size){const h=Array.from(GAME.hold)[0];return h==='read'?'rd':/^(advb|tut|pro|gl)$/.test(h)?'adv':'hl';}}catch(e){}
  return 'ps';}
setInterval(()=>{try{
  if(!document.hidden){const c=cat();if(c)tm[c]=(tm[c]||0)+1;}
  const v=spd();if(v!==spd0){ev('spd',{v,was:spd0,t:day()});spd0=v;}
  const P=window.PHONE;if(P){const on=!!P.isOpen;
    if(on&&!ph){let u=0,q=0;try{u=P.unread();q=P.wait?P.wait():0;}catch(e){}ph={t0:Date.now(),u,q,c:N.clk};}
    else if(!on&&ph){let u=0;try{u=P.unread();}catch(e){}ev('pho',{s:Math.round((Date.now()-ph.t0)/1000),u0:ph.u,u1:u,q:ph.q,nc:N.clk-ph.c,t:day()});ph=null;}}
  const g=window.GLOSS&&GLOSS.isOpen&&GLOSS.isOpen();if(g&&!gl)gl=Date.now();else if(!g&&gl){ev('glc',{s:Math.round((Date.now()-gl)/1000),t:day()});gl=null;}
  if(Z.q&&Z.q.length){const q=Z.q.splice(0);for(const x of q)err(x[1]);}
  ytap();}catch(e){}},1000);

/* ---------- сохранение, облако ---------- */
let svN=0,svS=0,svX=0;
try{const s0=window.save;if(typeof s0==='function'&&!s0.__st){window.save=function(){const a=performance.now();try{return s0.apply(this,arguments);}finally{const d=performance.now()-a;svN++;svS+=d;if(d>svX)svX=d;}};window.save.__st=1;}}catch(e){}
const cw={ok:0,er:0,ms:0,sz:0,e0:0};
function cwRes(ok,t0){if(ok)cw.ok++;else{cw.er++;if(cw.e0<3){cw.e0++;ev('cw',{ok:cw.ok,er:cw.er,ms:Math.round(performance.now()-t0),sz:lsz(),m:-1});}}cw.ms+=performance.now()-t0;}
function lsz(){try{return (localStorage.getItem(SKEY)||'').length;}catch(e){return 0;}}
function ytap(){try{if(typeof YP!=='undefined'&&YP&&YP.setData&&!YP.setData.__st){const f=YP.setData;YP.setData=function(){const t0=performance.now(),p=f.apply(this,arguments);try{p.then(()=>cwRes(1,t0),()=>cwRes(0,t0));}catch(e){}return p;};YP.setData.__st=1;}}catch(e){}}
try{const v0=window.vkSaveCloud;if(typeof v0==='function'&&!v0.__st){window.vkSaveCloud=function(){const t0=performance.now(),p=v0.apply(this,arguments);try{if(p&&p.then)p.then(r=>cwRes(r!==false,t0),()=>cwRes(0,t0));}catch(e){}return p;};window.vkSaveCloud.__st=1;}}catch(e){}
const ck=()=>typeof YP!=='undefined'&&YP?'yp':typeof VK!=='undefined'&&VK?'vk':'';
let cl0=null;
try{const c0=window.cloudLoad;if(typeof c0==='function'&&!c0.__st){window.cloudLoad=async function(){const tr=typeof cloudTry!=='undefined'?cloudTry:0,t0=performance.now();
    try{return await c0.apply(this,arguments);}finally{try{if(typeof cloudTry!=='undefined'&&cloudTry!==tr)ev('cld',{r:cloudReady?'ok':'err',ms:Math.round(performance.now()-t0),sz:lsz(),k:ck()});}catch(e){}}};window.cloudLoad.__st=1;}}catch(e){}
// облако, начатое ДО этого файла (первая загрузка): дождаться и записать
try{if(typeof cloudReady!=='undefined'){if(cloudReady)ev('cld',{r:'ok0',ms:Math.round(performance.now()),sz:lsz(),k:ck()});
  else if(typeof cloudBusy!=='undefined'&&cloudBusy){cl0=setInterval(()=>{if(!cloudBusy){clearInterval(cl0);ev('cld',{r:cloudReady?'ok':'err',ms:Math.round(performance.now()),sz:lsz(),k:ck()});}},250);}
  else if(!ck())ev('cld',{r:'none',ms:Math.round(performance.now()),sz:lsz(),k:''});}}catch(e){}

/* ---------- длинные задачи ---------- */
let ltN=0,ltX=0,ltE=0,hasLT=false;
function lt(ms,lg){ms=Math.round(ms);ltN++;if(ms>ltX)ltX=ms;if(ms>=300&&ltE<40){ltE++;ev('lt',{ms,w:mOn()?'w:'+tx(win.cur?win.cur.w:'',20):curScr,t:day(),lg:lg?1:0});}}
try{if(window.PerformanceObserver&&PerformanceObserver.supportedEntryTypes&&PerformanceObserver.supportedEntryTypes.indexOf('longtask')>=0){
  new PerformanceObserver(l=>{for(const e of l.getEntries())if(e.duration>=200)lt(e.duration);}).observe({entryTypes:['longtask']});hasLT=true;}}catch(e){}
if(!hasLT){let ex=performance.now()+500;setInterval(()=>{const n=performance.now(),d=n-ex;ex=n+500;if(!document.hidden&&d>=200)lt(d,1);},500);}

/* ---------- закрытие месяца: время, система, облако, шапка ---------- */
GAME.on('close',rep=>{try{const m=rep&&rep.m;let tot=0;for(const k in tm)tot+=tm[k];
    if(rep&&rep.san)ev('san',{m,db:k1(debt(G())),t:day()});
    if(tot>=20){ev('tm',{m,run:(tm.run|0)+(tm.fx|0),fx:tm.fx|0,win:tm.win|0,rd:tm.rd|0,adv:tm.adv|0,hl:tm.hl|0,ps:tm.ps|0});
      const w=G();let ob=0;try{ob=(w.obj||[]).length+(w.biz||[]).length;}catch(e){}
      ev('sys',{m,sz:lsz(),sv:svN?Math.round(svS/svN):0,svx:Math.round(svX),dom:document.getElementsByTagName('*').length,ob,lt:ltN,ltm:ltX});
      if(cw.ok||cw.er)ev('cw',{ok:cw.ok,er:cw.er,ms:Math.round(cw.ms/Math.max(1,cw.ok+cw.er)),sz:lsz(),m});
      for(const k in tm)delete tm[k];svN=svS=svX=0;ltN=ltX=0;cw.ok=cw.er=cw.ms=0;}
    hd(1);}catch(e){}});

/* ---------- ошибки со стеком ---------- */
const eSeen={};let eN=0;
function frames(st){return String(st||'').split('\n').map(l=>{l=l.trim().replace(/^at\s+/,'');const m=/^(.*?)\s*\(?((?:https?|file|blob):\/\/[^)\s]*|[\w./<>-]+:\d+:\d+)\)?$/.exec(l)||/^(.*?)@(.*)$/.exec(l);
  if(!m)return '';const f=String(m[2]||'').replace(/^.*\//,'').replace(/\?[^:]*/,'');return (m[1]?m[1].replace(/@$/,'').replace(/^Object\.|^HTMLDocument\.|^async\s+/,'').slice(0,18)+'@':'')+f;}).filter(Boolean).join(' ');}
function err(e){try{if(!e)return;const msg=tx(e.message||e,80),st=frames(e.stack);const k=msg+'|'+st.slice(0,40);if(eSeen[k])return;eSeen[k]=1;if(++eN>10)return;
  const p={m:msg.slice(0,40)};let s=(msg.length>40?msg.slice(40)+' | ':'')+st;for(let i=1;i<=6&&s;i++){p['s'+i]=s.slice(0,40);s=s.slice(40);}p.t=day();ev('err',p);}catch(x){}}
window.removeEventListener('error',Z.onErr);window.removeEventListener('unhandledrejection',Z.onRej);
window.addEventListener('error',e=>err(e&&(e.error||{message:e.message,stack:(e.filename||'')+':'+(e.lineno||0)+':'+(e.colno||0)})));
window.addEventListener('unhandledrejection',e=>err(e&&e.reason));
if(Z.q&&Z.q.length){const q=Z.q.splice(0);for(const x of q)err(x[1]);}

/* ---------- вкладка: свернул / вернулся / ушёл ---------- */
function hideAll(b){if(win.cur){wClose(b);}if(adv.cur){const c=adv.cur;adv.cur=null;ev('adv',{x:c.x,who:c.who,s:Math.round((Date.now()-c.t0)/1000),by:b,tu:c.tu,r:c.r,n:c.n,t:c.d});}cFlush();aFlush();if(tq){ev('tst',tq);tq=null;}}
document.addEventListener('visibilitychange',()=>{if(document.hidden){hideAll('hid');try{STAT.flush();}catch(e){}}else{wSync();aSync();}});
window.addEventListener('pagehide',()=>{hideAll('quit');ev('end',{s:Math.round((Date.now()-N.t0)/1000),cl:N.clk,w:N.win,a:N.act});try{STAT.flush();}catch(e){}});

/* ---------- старт ---------- */
ld();hd(1);preSnap();aucScan();wSync();aSync();
window.__b2st={N,win,adv,tm,aucs,hd,err,cw:()=>cw,lt:()=>({ltN,ltX,ltE,hasLT})};
})();
