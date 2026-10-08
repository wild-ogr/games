/* Мини-игра №7 «Прикормка по рецепту» (поток MGB, 08.10.2026). Договор — js/mg-core.js (MG0), план — rybak-boost/00-plan.md §5, 09-minigames.md.
   Утро на мостках: Петрович читает рецепт под рыбу дня (лещ, плотва, карп…), четыре мешка — жмых, панировка, пшённая каша, ароматизатор.
   Ход: держишь палец — из мешка сыплется (сначала тонкой струйкой, потом гуще), отпускаешь у метки; можно досыпать, «Дальше» — следующий мешок.
   Таз — круг-«пирог»: каждая доля своего цвета, призрачная доля — сколько надо по рецепту. Потом — перемешать пальцем по кругу (3 оборота).
   Таймера нет. Очки — точность долей. Награда: монеты по MG_RW.prik (оболочка) + прикормка на следующую рыбалку: клёв рыбы дня ×1,3/1,6/2,0.
   КЛЁВ: игра не трогает pickFish. Даёт крючок MG_BAIT_MULT(place, fishId) → множитель веса вида (1 — нет прикормки). Хозяин клёва (NORTH)
   вызывает его в fishW одной строкой. В турнире недели, «Рыбалке дня», гостевом выезде и без активной прикормки — всегда 1.
   Сохранение — только S.mg.prik = {act:{f,k,d,n}|null, rec, t}: act — заряд на одну рыбалку (f — вид, k — множитель, d — день ГГГГММДД, срок 2 дня).
   Реклама — нет (09: «без рекламы»). */
(function(){
'use strict';
const ID='prik',W_=window;
const A=()=>W_.MGB_ART||{};
const T_=(ru,en)=>typeof L==='function'?L(ru,en):ru;
const ING=[
  {k:'zh',n:['Жмых','Seed cake'],c:'#7d5a32',c2:'#5e4224',dot:'#a98454'},
  {k:'pn',n:['Панировка','Breadcrumbs'],c:'#e0b45e',c2:'#c4923e',dot:'#f4d48e'},
  {k:'ks',n:['Пшённая каша','Millet porridge'],c:'#f1d76a',c2:'#d9b844',dot:'#fff0a8'},
  {k:'ar',n:['Анис','Anise'],c:'#9c74c4',c2:'#7a54a2',dot:'#d4b8ee'}];
// рецепты по рыбе (доли таза); остальное — «общий»
const RCP={bottom:[.3,.2,.4,.1],top:[.15,.5,.25,.1],carp:[.35,.15,.35,.15],gen:[.25,.3,.35,.1]};
const CLS={lesh:'bottom',gustera:'bottom',sinec:'bottom',beluga:'bottom',lin:'bottom',plotva:'top',ukleyka:'top',vobla:'top',chehon:'top',rybec:'top',yaz:'top',golavl:'top',
  karp:'carp',sazan:'carp',karas:'carp',karasz:'carp',amur:'carp',tolstolob:'carp'};
const K_TIER=[1,1.3,1.6,2]; // множитель клёва рыбы дня по ступени
const TIER_MIN=[0,0,65,88];
const STIR_TURNS=3;
const LIFE_D=2; // заряд живёт 2 дня

/* ---------- сохранение ---------- */
function dk(){try{return +todayKey();}catch(e){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function fixP(x){if(!x||typeof x!=='object')x={};x.rec=Math.max(0,+x.rec||0);x.t=Math.max(0,+x.t||0);
  const a=x.act;if(a&&!(typeof a==='object'&&typeof a.f==='string'&&a.k>1&&a.k<=2.5&&+a.d>0))x.act=null;if(x.act===undefined)x.act=null;return x;}
function st(){try{if(!S.mg||typeof S.mg!=='object')S.mg={};return S.mg.prik=fixP(S.mg.prik);}catch(e){return fixP({});}}
function mergeP(a,b){a=fixP(a&&typeof a==='object'?JSON.parse(JSON.stringify(a)):{});b=fixP(b&&typeof b==='object'?b:{});
  const r=a;r.rec=Math.max(a.rec,b.rec);if((b.t||0)>(a.t||0)){r.act=b.act;r.t=b.t;}return r;} // заряд — из более свежего (израсходован/новый)
function persist(){try{if(typeof save==='function')save();}catch(e){}}
function actNow(){const x=st(),a=x.act;if(!a)return null;if(daysBetween(a.d,dk())>LIFE_D){x.act=null;return null;}return a;}
function daysBetween(a,b){const f=n=>Date.UTC(Math.floor(n/10000),Math.floor(n/100)%100-1,n%100)/864e5;return Math.round(f(b)-f(a));}

/* ---------- крючок клёва для NORTH ----------
   MG_BAIT_MULT(place, fishId): place — номер в PLACES или id места. Вызывать в fishW (рыбалка), например:
     if(typeof MG_BAIT_MULT==='function')x*=MG_BAIT_MULT(pi,id);
   Возвращает 1 вне рыбалки, в турнире/«Рыбалке дня»/гостевом выезде, без заряда, для другой рыбы или места, где этой рыбы нет.
   Заряд тратится при первом вызове в рыбалке на месте, где рыба дня водится (G.prik = заряд, S.mg.prik.act = null). */
function bm(place,fishId){try{if(typeof G==='undefined'||!G||G.over||G.tourn||G.guest||G.demo)return 1;
    const P=typeof place==='number'?PLACES[place]:PLACES.find(p=>p.id===place);if(!P||PLACES[G.pi]!==P)return 1;
    if(G.prik===undefined){const a=actNow();G.prik=null;if(a&&P.fish.indexOf(a.f)>=0){G.prik={f:a.f,k:a.k};st().act=null;st().t=Date.now();persist();
        try{STAT.ev&&STAT.ev('mg',{id:ID,use:a.f,k:a.k});}catch(e){}
        setTimeout(()=>{try{const f=fishOf(a.f);toast(T_('Прикормка Петровича в деле: '+f.n.toLowerCase()+' клюёт лучше','Petrovich\'s groundbait works: '+(f.en||f.n)+' bites better'));}catch(e){}},1200);}}
    return G.prik&&G.prik.f===fishId?G.prik.k:1;}catch(e){return 1;}}
W_.MG_BAIT_MULT=bm;

/* ---------- рыба дня и рецепт ---------- */
function topPl(){try{return topPlace();}catch(e){return 0;}}
function fishOf0(id){try{return fishOf(id);}catch(e){return null;}}
function candidates(pi){const P=PLACES[pi];if(!P)return [];return P.fish.filter(id=>{const f=FISH[id];if(!f||f.leg)return false;const b=f.b||{};return (b.dough||0)+(b.corn||0)+(b.maggot||0)>=1&&f.w[1]>=.5;});}
function dayFish(seed){const R=A().mkRng?A().mkRng((seed|0)*13+5):Math.random;let pi=topPl();let c=candidates(pi);while(!c.length&&pi>0)c=candidates(--pi);if(!c.length)c=['karas'];
  return c[Math.floor(R()*c.length)%c.length];}
function placesWith(id){const out=[];try{PLACES.forEach((p,i)=>{if(S.open[i]&&p.fish.indexOf(id)>=0)out.push(i);});}catch(e){}return out;}
function recipe(fid,seed){const base=RCP[CLS[fid]||'gen'],R=A().mkRng?A().mkRng((seed|0)*7+11):Math.random;let a=base.map((v,i)=>Math.max(i===3?.07:.08,v+(R()-.5)*.08));const s=a.reduce((x,y)=>x+y,0);return a.map(v=>v/s);}

/* ---------- модель сыпания (общая с авто-игроком) ---------- */
function rateAt(th,calm){const mx=calm?.1:.16;return mx*Math.min(1,.3+th*.85);} // доля таза в секунду при удержании th с
function stepScore(act,tar,ex){return Math.max(0,Math.round(100-700*Math.abs(act-tar)-6*(ex||0)));} // ex — сколько раз досыпал (одним махом — лучше)
function tierOf(sc){return sc>=TIER_MIN[3]?3:sc>=TIER_MIN[2]?2:1;}
function bot(skill,seed,calm){const R=A().mkRng?A().mkRng(((seed|0)^0x2f1)+(skill==='good'?1:skill==='mid'?2:3)):Math.random,tar=recipe('lesh',seed||1);
  const sd={good:.07,mid:.2,bad:.42}[skill]||.2,bias={good:0,mid:.04,bad:.12}[skill]||0,gauss=()=>{let a=0;for(let i=0;i<6;i++)a+=R();return (a-3)/Math.sqrt(.5);};let sum=0;
  for(const t of tar){let ex=0,amt=0,th=0,dt=.02;while(amt<t){amt+=rateAt(th,calm)*dt;th+=dt;}const er=gauss()*sd+bias;let tt=Math.max(0,th+er);amt=0;th=0;while(th<tt){amt+=rateAt(th,calm)*dt;th+=dt;}
    if(skill!=='bad'&&amt<t-.04){ex=1;let th2=0;const need=t-amt-(skill==='mid'?.01:0);while(amt<t-.005&&th2<need/rateAt(0,calm)+gauss()*sd*.3){amt+=rateAt(th2,calm)*dt;th2+=dt;}} // досыпал
    sum+=stepScore(amt,t,ex);}
  const sc=Math.round(sum/tar.length);return {score:sc,tier:tierOf(sc)};}

/* ---------- рисунки ---------- */
function ell(g,x,y,rx,ry,r){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),r||0,0,7);}
function lg(g,x0,y0,x1,y1,a,b){const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,a);gr.addColorStop(1,b);return gr;}
function sack(g,x,y,s,ing,tilt,on,t){g.save();g.translate(x,y);g.rotate(tilt);
  g.fillStyle='rgba(0,0,0,.25)';ell(g,0,s*.02,s*.42,s*.08);g.fill();
  if(ing.k==='ar'){ // бутылочка аниса
    g.fillStyle=lg(g,-s*.2,0,s*.2,0,'#5a3f7a','#a07ad0');g.beginPath();g.moveTo(-s*.2,0);g.lineTo(-s*.2,-s*.5);g.quadraticCurveTo(-s*.2,-s*.62,-s*.07,-s*.66);g.lineTo(-s*.07,-s*.8);g.lineTo(s*.07,-s*.8);g.lineTo(s*.07,-s*.66);g.quadraticCurveTo(s*.2,-s*.62,s*.2,-s*.5);g.lineTo(s*.2,0);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-s*.14,-s*.48,s*.05,s*.4);g.fillStyle='#8a5a2e';g.fillRect(-s*.08,-s*.9,s*.16,s*.11);
    g.fillStyle='#f3e9d2';g.fillRect(-s*.16,-s*.38,s*.32,s*.2);g.fillStyle='#6a4a8a';for(let i=0;i<5;i++){const a=i*1.256;ell(g,Math.cos(a)*s*.05,-s*.28+Math.sin(a)*s*.05,s*.03,s*.012,a);g.fill();}}
  else{const w=s*.42,h=s*.78;g.fillStyle=lg(g,-w,0,w,0,'#a88a5a','#d9c08a');g.beginPath();g.moveTo(-w*.9,0);g.quadraticCurveTo(-w*1.05,-h*.5,-w*.75,-h*.85);g.lineTo(w*.75,-h*.85);g.quadraticCurveTo(w*1.05,-h*.5,w*.9,0);g.closePath();g.fill();
    g.strokeStyle='rgba(90,66,30,.35)';g.lineWidth=Math.max(1,s*.01);for(let i=1;i<6;i++){g.beginPath();g.moveTo(-w*.9+i*w*.3,-h*.05);g.lineTo(-w*.82+i*w*.28,-h*.8);g.stroke();}
    g.fillStyle=ing.c;ell(g,0,-h*.86,w*.75,h*.09);g.fill();g.fillStyle=ing.dot;for(let i=0;i<9;i++){ell(g,(i/8-.5)*w*1.2,-h*.86+Math.sin(i*2.1)*h*.04,s*.018,s*.012);g.fill();}
    g.strokeStyle='#8a6a3a';g.lineWidth=s*.04;g.beginPath();g.moveTo(-w*.8,-h*.8);g.quadraticCurveTo(-w*.95,-h*.95,-w*.7,-h*.98);g.moveTo(w*.8,-h*.8);g.quadraticCurveTo(w*.95,-h*.95,w*.7,-h*.98);g.stroke();
    // нашивка с рисунком содержимого
    g.fillStyle='rgba(250,240,215,.92)';g.beginPath();g.ellipse(0,-h*.42,w*.5,h*.2,0,0,7);g.fill();g.strokeStyle='rgba(90,66,30,.4)';g.lineWidth=Math.max(1,s*.012);g.stroke();
    if(ing.k==='zh'){g.fillStyle='#e8b830';for(let i=0;i<8;i++){const a=i*.785;ell(g,Math.cos(a)*w*.16,-h*.42+Math.sin(a)*h*.09,w*.07,h*.03,a);g.fill();}g.fillStyle='#5a3a1c';ell(g,0,-h*.42,w*.1,h*.06);g.fill();}
    else if(ing.k==='pn'){g.fillStyle='#d49a4a';g.beginPath();g.moveTo(-w*.28,-h*.36);g.quadraticCurveTo(-w*.3,-h*.56,0,-h*.56);g.quadraticCurveTo(w*.3,-h*.56,w*.28,-h*.36);g.closePath();g.fill();g.fillStyle='#f2d9a0';ell(g,0,-h*.42,w*.18,h*.07);g.fill();}
    else{g.fillStyle='#f0d050';for(let i=0;i<14;i++){ell(g,(Math.sin(i*2.4))*w*.25,-h*.42+Math.cos(i*1.7)*h*.1,w*.035,w*.035);g.fill();}}}
  g.restore();
  if(on){g.save();g.globalAlpha=.55+.25*Math.sin(t*4);g.strokeStyle='#ffd27a';g.lineWidth=Math.max(2,s*.03);ell(g,x,y+s*.01,s*.48,s*.1);g.stroke();g.restore();}}

/* ---------- игра ---------- */
const CSS=`
.mgp{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;background:#1b2430;color:#fff;font-family:var(--font,-apple-system,"Segoe UI",Roboto,sans-serif);-webkit-user-select:none;user-select:none;touch-action:none;-webkit-tap-highlight-color:transparent}
.mgp canvas.mgp-cv{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
.mgp-pn{background:var(--pn2,rgba(16,26,36,.66));border:1px solid var(--pnB,rgba(255,255,255,.2));-webkit-backdrop-filter:var(--blur,blur(16px));backdrop-filter:var(--blur,blur(16px));border-radius:var(--r,20px);box-shadow:var(--sh,0 8px 28px rgba(0,0,0,.18))}
.mgp-top{position:absolute;left:70px;right:12px;top:calc(10px + env(safe-area-inset-top,0px));display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;pointer-events:none}
.mgp.tr .mgp-top{left:12px;top:calc(68px + env(safe-area-inset-top,0px))}
.mgp-ttl{padding:8px 14px 9px 10px;display:flex;align-items:center;gap:10px;min-width:0}
.mgp-ttl canvas{flex:0 0 auto}.mgp-ttl b{display:block;font-size:20px;font-weight:600;line-height:1.15}.mgp-ttl small{display:block;font-size:15px;color:var(--gold,#ffd27a)}
.mgp-rc{display:flex;gap:6px;margin-left:auto;padding:7px 9px}
.mgp-ch{display:flex;align-items:center;gap:6px;padding:4px 10px 4px 5px;border-radius:14px;background:var(--in,rgba(255,255,255,.08));border:1.5px solid var(--inB,rgba(255,255,255,.14));font-size:15px;font-weight:600;opacity:.6;transition:.3s}
.mgp-ch i{width:16px;height:16px;border-radius:50%;display:block;border:1.5px solid rgba(0,0,0,.25)}.mgp-ch.on{opacity:1;border-color:var(--acc1,#ffcf7a);box-shadow:0 0 12px rgba(255,170,80,.45)}.mgp-ch.ok{opacity:1}
.mgp-ch em{font-style:normal;font-weight:600}.mgp-ch em.g{color:var(--ok,#6be3b0)}.mgp-ch em.y{color:var(--warn,#ffd36b)}.mgp-ch em.r{color:var(--bad,#ff9a8b)}
.mgp-say{position:absolute;left:14px;max-width:min(340px,calc(100% - 28px));padding:10px 15px 11px;background:var(--say,rgba(16,26,36,.72));border:1px solid var(--pnB,rgba(255,255,255,.2));-webkit-backdrop-filter:var(--blur,blur(14px));backdrop-filter:var(--blur,blur(14px));border-radius:18px;font-size:17px;line-height:1.3;opacity:0;transform:translateY(6px);transition:opacity .35s,transform .35s;pointer-events:none}
.mgp-say.on{opacity:1;transform:none}.mgp-say b{display:block;color:var(--sayN,#ffd27a);font-size:15px;margin-bottom:2px}
.mgp-bot{position:absolute;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;justify-content:center;gap:10px;align-items:stretch}
.mgp-tray{display:flex;align-items:center;gap:12px;padding:8px 16px;min-height:72px;max-width:460px;flex:1 1 auto;box-sizing:border-box;pointer-events:none}
.mgp-tray .tx b{display:block;font-size:20px;font-weight:600}.mgp-tray .tx span{display:block;font-size:17px;color:var(--tx2,rgba(255,255,255,.84));line-height:1.25}
.mgp-tray .pct{margin-left:auto;font-size:24px;font-weight:600;color:var(--gold,#ffd27a);white-space:nowrap}
.mgp-next{flex:0 0 auto;min-width:96px;min-height:72px;border-radius:20px;border:1px solid rgba(255,255,255,.35);background:linear-gradient(180deg,#7fe0a0,#3fae6c);color:#0c2a17;font:600 19px/1.1 var(--font,sans-serif);display:none;align-items:center;justify-content:center;gap:4px;padding:0 16px;box-shadow:0 6px 18px rgba(60,180,110,.35);cursor:pointer}
.mgp-next.on{display:flex}html.mg-pc .mgp-cv{cursor:pointer}html.mg-pc .mgp-next:hover{filter:brightness(1.08)}.mgp-tray .mg-k{margin:0 2px}
@media (max-width:560px){.mgp-ttl{flex:1 1 100%}.mgp-rc{margin:0 auto;padding:6px 7px}.mgp-ch{font-size:14px;padding:3px 8px 3px 4px}.mgp-tray .tx b{font-size:18px}.mgp-tray .tx span{font-size:17px}}
@media (max-width:380px){.mgp-rc{gap:4px;padding:5px}.mgp-ch{gap:4px;padding:3px 6px 3px 3px}.mgp-ch i{width:13px;height:13px}}
@media (min-width:700px) and (min-height:560px){.mgp-ttl b{font-size:24px}.mgp-say{left:28px;font-size:18px}}`;
function css(){if(document.getElementById('mgp-css'))return;const s=document.createElement('style');s.id='mgp-css';s.textContent=CSS;document.head.appendChild(s);}
function fishCv(id,px,h){const dp=Math.min(2,W_.devicePixelRatio||1),c=document.createElement('canvas');c.width=Math.round(px*dp);c.height=Math.round((h||px*.5)*dp);c.style.width=px+'px';c.style.height=(h||px*.5)+'px';
  const g=c.getContext('2d');g.scale(dp,dp);try{const f=fishOf0(id);drawFish(g,f.lk,px/2,(h||px*.5)/2,px*.92);}catch(e){}return c;}

function run(host,o){o=o||{};
  if(o.bot){const r=bot(o.bot,o.seed,o.calm);setTimeout(()=>host.done({score:r.score,tier:r.tier}),0);return;}
  css();const el=host.el,calm=!!o.calm,train=!!o.train,lowQ=typeof LOW!=='undefined'&&LOW,Ar=A();
  const seed=o.seed==null?(typeof dayNum==='function'?dayNum():1):o.seed,fid=dayFish(seed),fish=fishOf0(fid)||{n:'Рыба',en:'Fish'},tar=recipe(fid,seed),pls=placesWith(fid);
  const root=document.createElement('div');root.className='mgp'+(train||o.delo?' tr':'');
  root.innerHTML=`<canvas class="mgp-cv"></canvas>
    <div class="mgp-top"><div class="mgp-ttl mgp-pn"><span class="fc"></span><div><b>${T_('Прикормка','Groundbait')}</b><small>${T_('рыба дня: ','fish of the day: ')}${esc0(T_(fish.n.toLowerCase(),(fish.en||fish.n).toLowerCase()))}</small></div></div>
      <div class="mgp-rc mgp-pn">${ING.map((x,i)=>`<div class="mgp-ch" data-i="${i}"><i style="background:${x.c}"></i><em>${Math.round(tar[i]*100)}%</em></div>`).join('')}</div></div>
    <div class="mgp-say"><b>${T_('Петрович','Petrovich')}</b><span></span></div>
    <div class="mgp-bot"><div class="mgp-tray mgp-pn"><div class="tx"><b></b><span></span></div><div class="pct"></div></div><button class="mgp-next" type="button" data-enter>${T_('Дальше','Next')} ›${MG_KC('Enter')}</button></div>`;
  el.appendChild(root);const $q=s=>root.querySelector(s),cv=$q('canvas'),g=cv.getContext('2d'),chips=[...root.querySelectorAll('.mgp-ch')];
  $q('.mgp-ttl .fc').appendChild(fishCv(fid,64,34));
  const Z={t:0,ph:'intro',pt:0,i:0,amt:[0,0,0,0],hold:false,th:0,poured:false,stir:0,lastA:null,mix:0,parts:[],pops:[],res:[],blinkP:0,blinkC:0,over:false,fin:false,sayT:0};
  /* геометрия */
  function geo(){const r=el.getBoundingClientRect(),W=Math.max(240,r.width),H=Math.max(300,r.height),land=W>H*1.05,dp=Math.min(typeof lowDp==='function'?lowDp():2,W_.devicePixelRatio||1,2);
    Object.assign(Z,{W,H,dp,land});cv.width=Math.round(W*dp);cv.height=Math.round(H*dp);
    Z.hz=land?H*.33:H*.3;Z.py0=land?H*.45:H*.42; // начало мостков
    Z.rx=land?Math.min(H*.27,W*.2):Math.min(W*.36,H*.2);Z.ry=Z.rx*.5;Z.bx=W/2;Z.by=land?H*.56:H*.53;
    Z.ss=land?Math.min(H*.17,W*.1):Math.min(W*.2,H*.11);Z.sy=land?H*.86:H*.8;
    Z.sx=land?[W*.5-Z.ss*2.4,W*.5-Z.ss*.8,W*.5+Z.ss*.8,W*.5+Z.ss*2.4]:[W*.14,W*.38,W*.62,W*.86];
    if(land){const x0=Z.bx+Z.rx*1.15+Z.ss*.55,st=Math.min(Z.ss*1.15,(W-Z.ss*.6-x0));Z.sx=[x0,x0+st,x0,x0+st];Z.syA=[Z.by-Z.ry*.35,Z.by-Z.ry*.35,Z.by+Z.ry*1.25,Z.by+Z.ry*1.25];}else Z.syA=null;
    Z.ps=land?H*.42:Math.min(H*.25,W*.48);Z.px=land?Z.bx-Z.rx*1.65:W*.17;Z.pyy=land?Z.by+Z.ry*.1:Z.by-Z.ry*1.25;
    Z.cx=land?Z.bx-Z.rx*1.2:W*.82;Z.cy=land?Math.min(H*.92,Z.by+Z.ry*2.1):Z.by-Z.ry*.9;Z.cs=land?H*.11:Math.min(W*.13,H*.07);
    buildBg();const top=$q('.mgp-top').getBoundingClientRect(),rr=root.getBoundingClientRect();$q('.mgp-say').style.top=(top.bottom-rr.top+10)+'px';}
  function buildBg(){const W=Z.W,H=Z.H,dp=Z.dp,c=document.createElement('canvas');c.width=Math.round(W*dp);c.height=Math.round(H*dp);const q=c.getContext('2d');q.scale(dp,dp);
    const pi=pls.length?pls[pls.length-1]:topPl();let P=null;try{P=pal(PLACES[pi].look||'pond','morning','sun');paintBg(q,W,H,{hz:Z.hz,shY:Z.py0,yOf:d=>Z.hz+(Z.py0-Z.hz)*9/(9+d)},pi,P,true);}
    catch(e){q.fillStyle=lg(q,0,0,0,H,'#9cc6e0','#4f7f8a');q.fillRect(0,0,W,H);}
    const tn=x=>P&&P.tint?P.tint(x):x,u=Math.min(W,H)/100,R=Ar.mkRng?Ar.mkRng(77):Math.random;
    // камыш по краям
    q.lineCap='round';for(let i=0;i<30;i++){const left=i<15,x=left?R()*W*.18:W*(.82+R()*.18),h=u*(8+R()*10),y=Z.py0+u*(1+R()*3);q.strokeStyle=tn('#5d7a32');q.lineWidth=Math.max(1,u*.35);q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x,y-h*.6,x+(R()-.5)*u*2,y-h);q.stroke();
      if(i%3===0){q.fillStyle=tn('#6a4a2a');ell(q,x+(R()-.5)*u,y-h*.9,u*.5,u*1.6);q.fill();}}
    // мостки: доски в перспективе
    const y0=Z.py0,xl0=W*.5-W*(Z.land?.28:.36),xr0=W*.5+W*(Z.land?.28:.36),xl1=Z.land?W*.05:-W*.08,xr1=Z.land?W*.95:W*1.08;
    q.fillStyle='rgba(0,0,0,.25)';q.beginPath();q.moveTo(xl0,y0+u*1.5);q.lineTo(xr0,y0+u*1.5);q.lineTo(xr1,H);q.lineTo(xl1,H);q.fill();
    const n=Z.land?11:8;for(let i=0;i<n;i++){const a0=i/n,a1=(i+1)/n,x0a=xl0+(xr0-xl0)*a0,x0b=xl0+(xr0-xl0)*a1,x1a=xl1+(xr1-xl1)*a0,x1b=xl1+(xr1-xl1)*a1;
      const base=['#b48a58','#a87d4c','#bd9462','#a27848'][i%4];q.fillStyle=lg(q,0,y0,0,H,tn(base),tn('#7a5634'));q.beginPath();q.moveTo(x0a+1,y0);q.lineTo(x0b-1,y0);q.lineTo(x1b-2,H);q.lineTo(x1a+2,H);q.closePath();q.fill();
      q.strokeStyle='rgba(60,36,16,.35)';q.lineWidth=Math.max(1,u*.15);for(let k=0;k<3;k++){const yy=y0+(H-y0)*(.15+k*.3+R()*.1),f=(yy-y0)/(H-y0),xa=x0a+(x1a-x0a)*f,xb=x0b+(x1b-x0b)*f;q.beginPath();q.moveTo(xa+(xb-xa)*.2,yy);q.quadraticCurveTo(xa+(xb-xa)*.5,yy+u*.4,xa+(xb-xa)*.8,yy);q.stroke();}
      for(const yy of [y0+(H-y0)*.08,y0+(H-y0)*.62]){const f=(yy-y0)/(H-y0),xm=(x0a+(x1a-x0a)*f+x0b+(x1b-x0b)*f)/2;q.fillStyle='rgba(40,30,20,.55)';ell(q,xm,yy,u*.35*(.5+f),u*.2*(.5+f));q.fill();}}
    // столбики мостков в воде
    q.fillStyle=tn('#5a4026');for(const x of [xl0-u*.5,xr0-u*1]){q.fillRect(x,y0-u*3,u*1.5,u*4.5);}
    // ведро-«удочки» у края: подсак и удочка, прислонённые
    q.strokeStyle=tn('#3d2a18');q.lineWidth=Math.max(1.5,u*.4);q.beginPath();q.moveTo(xr0-u*2,y0+u*2);q.lineTo(xr0+u*6,Z.hz-u*12);q.stroke();q.strokeStyle='rgba(240,240,235,.5)';q.lineWidth=1;q.beginPath();q.moveTo(xr0+u*6,Z.hz-u*12);q.quadraticCurveTo(xr0+u*10,Z.hz,xr0+u*9,y0-u*2);q.stroke();
    Z.bg=c;
    const sp=document.createElement('canvas');sp.width=sp.height=64;const sq=sp.getContext('2d'),sg=sq.createRadialGradient(32,32,1,32,32,32);sg.addColorStop(0,'rgba(255,240,200,.55)');sg.addColorStop(1,'rgba(255,240,200,0)');sq.fillStyle=sg;sq.fillRect(0,0,64,64);Z.glow=sp;}

  function say(txt,ms){const s=$q('.mgp-say');s.querySelector('span').textContent=txt;s.classList.add('on');Z.sayT=(ms||2600)/1000;}
  function tray(){const i=Z.i,x=ING[i];if(Z.ph==='stir'){$q('.mgp-tray b').textContent=T_('Перемешать','Mix it');const sp=$q('.mgp-tray span');if(PC)sp.innerHTML=T_('Тяни мышкой по кругу в тазу или держи '+MG_KC('←')+'/'+MG_KC('→'),'Drag the mouse in circles or hold '+MG_KC('←')+'/'+MG_KC('→'));else sp.textContent=T_('Веди пальцем по кругу в тазу','Move your finger in circles in the basin');$q('.mgp-tray .pct').textContent=Math.min(STIR_TURNS,Math.floor(Z.stir/6.283))+'/'+STIR_TURNS;return;}
    if(!x)return;$q('.mgp-tray b').textContent=T_(x.n[0],x.n[1]);const sp=$q('.mgp-tray span');if(PC)sp.innerHTML=Z.poured?T_('Досыпать можно, но одним махом точнее. Или «Дальше» '+MG_KC('Enter'),'You can top up, but one pour is better. Or “Next” '+MG_KC('Enter')):T_('Держи кнопку мыши или '+MG_KC('Пробел')+' — сыплется. Отпусти у метки','Hold the mouse button or '+MG_KC('Space')+' to pour. Let go at the mark');
    else sp.textContent=Z.poured?T_('Досыпать можно, но одним махом точнее. Или «Дальше»','You can top up, but one pour is better. Or “Next”'):T_('Держи палец — сыплется. Отпусти у метки','Hold to pour. Let go at the mark');
    $q('.mgp-tray .pct').textContent=Math.round(Z.amt[i]*100)+' / '+Math.round(tar[i]*100)+'%';chips.forEach((c,k)=>c.classList.toggle('on',k===i));}
  const nextB=$q('.mgp-next');
  nextB.addEventListener('pointerdown',e=>{e.stopPropagation();});
  nextB.onclick=e=>{e.stopPropagation();if(Z.ph!=='pour'||!Z.poured||Z.hold)return;doneIng();};
  function doneIng(){const i=Z.i,sc=stepScore(Z.amt[i],tar[i],Math.max(0,(Z.holds||1)-1));Z.holds=0;Z.res.push(sc);const z=sc>=85?'g':sc>=60?'y':'r';const em=chips[i].querySelector('em');em.textContent=Math.round(Z.amt[i]*100)+'%';em.className=z;chips[i].classList.remove('on');chips[i].classList.add('ok');
    Z.pops.push({tx:z==='g'?T_('Точно по рецепту!','Spot on!'):z==='y'?T_('Почти','Close'):Z.amt[i]>tar[i]?T_('Пересыпал','Too much'):T_('Маловато','Too little'),c:z==='g'?'#8ff0c0':z==='y'?'#ffe08a':'#ffb0a0',t:0});
    Ar.snd&&Ar.snd(z==='g'?'coin':'tap');nextB.classList.remove('on');Z.poured=false;Z.i++;
    if(Z.i>=ING.length){Z.ph='stir';Z.pt=0;say(T_('Теперь перемешать как следует — кругами, без спешки.','Now mix it well — in circles, no rush.'),2600);tray();chips.forEach(c=>c.classList.remove('on'));return;}
    const lines=[,T_('Панировки — для пыли в воде, рыба её издалека чует.','Breadcrumbs make a cloud the fish smell from afar.'),T_('Каша — главное, на ней всё держится.','Porridge is the base, it holds everything.'),T_('Анису капельку — не перелей, а то распугаешь.','Just a drop of anise — too much scares them off.')];say(lines[Z.i],2600);tray();}
  /* ввод */
  function pos(e){const r=root.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function onDown(e){if(Z.over||Z.fin)return;if(e.target&&e.target.closest&&e.target.closest('.mgp-next'))return;e.preventDefault();try{root.setPointerCapture(e.pointerId);}catch(x){}
    if(Z.ph==='pour'){Z.hold=true;Z.th=0;Z.holds=(Z.holds||0)+1;Ar.snd&&Ar.snd('tap');}
    else if(Z.ph==='stir'){const p=pos(e);Z.lastA=Math.atan2((p.y-Z.by)/(Z.ry/Z.rx),p.x-Z.bx);Z.fp=p;}}
  function onMove(e){if(Z.ph!=='stir'||Z.lastA==null)return;const p=pos(e),dx=p.x-Z.bx,dy=(p.y-Z.by)/(Z.ry/Z.rx),d=Math.hypot(dx,dy);Z.fp=p;if(d<Z.rx*.12)return;
    const a=Math.atan2(dy,dx);let da=a-Z.lastA;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;Z.lastA=a;if(Math.abs(da)>1.2)return;addStir(da,p);}
  function addStir(da,p){Z.stir+=Math.abs(da);Z.mixRot=(Z.mixRot||0)+da;
    if(Math.random()<.3)Z.parts.push({k:'fleck',x:p.x,y:p.y,vx:(Math.random()-.5)*20,vy:-10-Math.random()*20,l:.5,t:0,c:ING[Math.floor(Math.random()*4)].dot});
    const n=Math.floor(Z.stir/6.283);if(n!==Z.sn){Z.sn=n;Ar.snd&&Ar.snd('tick');Ar.vib&&Ar.vib(12);tray();}
    if(Z.stir>=6.283*STIR_TURNS)finale();}
  function onUp(){if(Z.ph==='pour'&&Z.hold){Z.hold=false;Z.poured=true;nextB.classList.add('on');tray();}Z.lastA=null;Z.fp=null;}
  root.addEventListener('pointerdown',onDown,{passive:false});root.addEventListener('pointermove',onMove);root.addEventListener('pointerup',onUp);root.addEventListener('pointercancel',onUp);root.addEventListener('lostpointercapture',onUp);
  /* RB:MGPC клавиши: пробел держать — сыплется (отпустил — стоп), Enter — «Дальше» (data-enter), стрелки держать — мешать */
  const PC=!!host.pc;if(host.amb)host.amb('water','morning'); // утро на мостках — звуки утра у воды
  host.keys(k=>{if(Z.over||Z.fin)return false;
    if(k===' '){if(Z.ph==='pour'&&!Z.hold){Z.keyHold=true;onDown({preventDefault(){},target:cv,pointerId:-1});}return Z.ph!=='done';}
    if(k==='Enter')return Z.hold; // во время струйки Enter не жмёт «Дальше»
    if(k==='ArrowLeft'||k==='ArrowRight'){if(Z.ph==='stir')Z.kdir=k==='ArrowLeft'?-1:1;return true;}
    return false;});
  host.keysUp(k=>{if(k===' '&&Z.keyHold){Z.keyHold=false;onUp();return true;}if((k==='ArrowLeft'&&Z.kdir<0)||(k==='ArrowRight'&&Z.kdir>0)){Z.kdir=0;return true;}return false;});
  // подсказка клавиш — прямо в полоске снизу (значки MG.kc, только на ПК): отдельная плашка закрывала рецепт сверху или таз снизу
  function finale(){if(Z.ph!=='stir')return;Z.ph='final';Z.pt=0;$q('.mgp-bot').style.opacity='0';Ar.snd&&Ar.snd('catch');say(T_('Вот это прикормка! Скатаем шары — и на воду.','Now that\'s groundbait! Roll some balls — and off we go.'),2400);}
  /* итог — окно оболочки */
  function finish(){if(Z.fin)return;Z.fin=true;const sc=Math.round(Z.res.reduce((a,b)=>a+b,0)/ING.length),tier=tierOf(sc),k=K_TIER[tier],x=st();
    if(sc>x.rec)x.rec=sc;x.t=Date.now();persist();
    const head=[,T_('Сойдёт!','It\'ll do!'),T_('Хорошая прикормка!','Good groundbait!'),T_('Как по рецепту!','Just like the recipe!')][tier];
    let img='';try{img=fishCv(fid,120,60).toDataURL('image/png');}catch(e){}
    const plN=pls.map(i=>T_(PLACES[i].n,PLACES[i].en)).slice(-3).join(', ');
    const line=`<div class="mgp-rl" style="display:flex;gap:10px;align-items:center;justify-content:center;text-align:left;font-size:17px;line-height:1.35;margin:6px 0">${img?`<img src="${img}" alt="" style="width:110px;height:55px;flex:0 0 110px">`:''}<div>`+
      (train?T_('Тренировка — прикормка не сохраняется','Practice — groundbait isn\'t kept'):`<b style="color:var(--gold,#ffd27a)">${esc0(T_(fish.n,fish.en||fish.n))}: ${T_('клёв','bites')} ×${String(k).replace('.',LANG_RU()?',':'.')}</b><br>${T_('на следующей рыбалке','next fishing trip')}${plN?' — '+esc0(plN):''}`)+'</div></div>';
    const give=()=>{if(train)return;const y=st();y.act={f:fid,k,d:dk(),n:1};y.t=Date.now();persist();};
    Z.ph='done';$q('.mgp-top').style.opacity='0';$q('.mgp-say').classList.remove('on');
    try{host.done({score:sc,tier,rec:sc>(+o.rec||0),title:head,scoreTxt:T_('Точность','Accuracy')+': <b>'+sc+'%</b>',extra:{line,give,giveCapped:give,val:0,fish:fid,k}});}catch(e){console.error(e);}}
  /* кадр */
  function update(dt){Z.t+=dt;Z.pt+=dt;if(Z.sayT>0){Z.sayT-=dt;if(Z.sayT<=0)$q('.mgp-say').classList.remove('on');}
    for(const k of ['blinkP','blinkC']){Z[k]-=dt;if(Z[k]<-3-Math.random()*3)Z[k]=.14;}
    if(Z.ph==='intro'&&Z.pt>2.4){Z.ph='pour';Z.pt=0;tray();say(PC?T_('Жмыха — вот до метки. Держи кнопку, пока сыплется.','Seed cake — up to the mark. Hold the button to pour.'):T_('Жмыха — вот до метки. Держи палец, пока сыплется.','Seed cake — up to the mark. Hold your finger to pour.'),2800);}
    if(Z.ph==='pour'&&Z.hold){const r=rateAt(Z.th,calm);Z.amt[Z.i]+=r*dt;Z.th+=dt;const tot=Z.amt.reduce((a,b)=>a+b,0);if(tot>1.12){Z.amt[Z.i]-=tot-1.12;onUp();}
      const x=Z.sx[Z.i],y=(Z.syA?Z.syA[Z.i]:Z.sy)-Z.ss*.7;if(Math.random()<dt*(lowQ?30:60)*(.4+Z.th)){const end=angEnd(),tx=Z.bx+Math.cos(end-.12)*Z.rx*.55,ty=Z.by+Math.sin(end-.12)*Z.ry*.55;
        Z.parts.push({k:'grain',x0:x,y0:y,x1:tx+(Math.random()-.5)*Z.rx*.12,y1:ty+(Math.random()-.5)*Z.ry*.12,t:0,l:.45+Math.random()*.15,c:Math.random()<.5?ING[Z.i].dot:ING[Z.i].c});}
      if(Math.floor(Z.t*8)!==Z.tk){Z.tk=Math.floor(Z.t*8);tray();}}
    if(Z.ph==='stir'&&Z.kdir){const da=Z.kdir*dt*(calm?3.4:4.2);addStir(da,{x:Z.bx+Math.cos(Z.t*4)*Z.rx*.5,y:Z.by+Math.sin(Z.t*4)*Z.ry*.5});}
    if(Z.ph==='stir'){Z.mix=Math.min(1,Z.stir/(6.283*STIR_TURNS));}
    if(Z.ph==='final'){Z.mix=1;if(Z.pt>2.2)finish();}
    for(const p of Z.parts){p.t+=dt;if(p.k==='fleck'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;}}Z.parts=Z.parts.filter(p=>p.t<p.l);for(const p of Z.pops)p.t+=dt;Z.pops=Z.pops.filter(p=>p.t<1.3);
    if(Z.parts.length>260)Z.parts.splice(0,Z.parts.length-260);}
  function angEnd(){const s=Z.amt.reduce((a,b)=>a+b,0);return -Math.PI/2+Math.min(1.12,s)*Math.PI*2;}
  function render(){const W=Z.W,H=Z.H,t=Z.t,s=Z.rx;g.setTransform(Z.dp,0,0,Z.dp,0,0);g.clearRect(0,0,W,H);if(Z.bg)g.drawImage(Z.bg,0,0,W,H);
    // утренние блики на воде
    g.globalCompositeOperation='lighter';g.globalAlpha=.5;for(let i=0;i<6;i++){const x=(i*W/5+t*8)%(W+40)-20,y=Z.hz+(Z.py0-Z.hz)*(.2+.13*i%1);g.drawImage(Z.glow,x-20,y-4,40,8);}g.globalAlpha=1;g.globalCompositeOperation='source-over';
    // Петрович сидит на ящике, читает рецепт / показывает
    if(Ar.drawPetr){const ps=Z.ps,bx=Z.px,by=Z.pyy;g.fillStyle=lg(g,0,by-ps*.02,0,by+ps*.22,'#8a6a42','#5a4026');g.fillRect(bx-ps*.18,by-ps*.02,ps*.36,ps*.24);g.strokeStyle='rgba(40,25,10,.5)';g.lineWidth=Math.max(1,ps*.008);g.strokeRect(bx-ps*.18,by-ps*.02,ps*.36,ps*.24);
      Ar.drawPetr(g,bx,by,ps,t,Z.ph==='pour'&&Z.hold?.6:Z.ph==='final'?.8+.2*Math.sin(t*6):.15+.1*Math.sin(t*1.3),Z.blinkP>0,Z.sayT>0&&Math.sin(t*14)>0);}
    // таз
    const bx=Z.bx,by=Z.by,rx=Z.rx,ry=Z.ry;
    g.fillStyle='rgba(0,0,0,.28)';ell(g,bx+rx*.05,by+ry*.55,rx*1.08,ry*.75);g.fill();
    g.fillStyle=lg(g,bx-rx,0,bx+rx,0,'#7f8a90','#c9d2d6');g.beginPath();g.moveTo(bx-rx,by);g.bezierCurveTo(bx-rx*.92,by+ry*1.05,bx+rx*.92,by+ry*1.05,bx+rx,by);g.closePath();g.fill();
    g.fillStyle='#d9e0e3';ell(g,bx,by,rx*1.04,ry*1.06);g.fill();g.fillStyle=lg(g,0,by-ry,0,by+ry,'#6d777c','#9aa4a8');ell(g,bx,by,rx*.95,ry*.94);g.fill();
    // содержимое — «пирог» долей (вид сверху наискось)
    const inner=.9;g.save();g.translate(bx,by);g.scale(1,ry/rx);const R=rx*inner;
    let a0=-Math.PI/2;const rot=(Z.mixRot||0)*.6,mix=Z.mix;
    for(let i=0;i<ING.length;i++){const v=Z.amt[i];if(v<=0)continue;const a1=a0+Math.min(v,1.12)*Math.PI*2;g.fillStyle=ING[i].c;g.beginPath();g.moveTo(0,0);g.arc(0,0,R,a0+rot,a1+rot);g.closePath();g.fill();
      g.save();g.clip();g.fillStyle=ING[i].dot;const n=Math.min(70,Math.round(v*90));for(let k=0;k<n;k++){const aa=a0+rot+(k*0.618%1)*(a1-a0),rr=R*Math.sqrt(((k*0.381)%1)*.9+.05);g.beginPath();g.arc(Math.cos(aa)*rr,Math.sin(aa)*rr,R*.018,0,7);g.fill();}g.restore();a0=a1;}
    if(mix>0){const tot=Math.max(.01,Z.amt.reduce((a,b)=>a+b,0)),mc=[0,0,0];ING.forEach((x,i)=>{const h=x.c.replace('#','');[0,2,4].forEach((o,j)=>mc[j]+=parseInt(h.slice(o,o+2),16)*Z.amt[i]/tot);});
      g.globalAlpha=Math.min(1,mix*1.05);g.fillStyle='rgb('+mc.map(Math.round).join(',')+')';g.beginPath();g.arc(0,0,R,-Math.PI/2+rot,-Math.PI/2+rot+Math.min(1,tot)*Math.PI*2);g.lineTo(0,0);g.closePath();g.fill();
      g.fillStyle='rgba(255,255,255,.18)';for(let k=0;k<40;k++){const aa=k*2.4+rot*1.5,rr=R*(.15+((k*0.37)%1)*.8);g.beginPath();g.arc(Math.cos(aa)*rr,Math.sin(aa)*rr,R*.02,0,7);g.fill();}g.globalAlpha=1;}
    // призрачная доля и метка рецепта
    if(Z.ph==='pour'&&Z.i<ING.length){const done=Z.amt.slice(0,Z.i).reduce((a,b)=>a+b,0),s0=-Math.PI/2+done*Math.PI*2,s1=s0+tar[Z.i]*Math.PI*2,cur=s0+Z.amt[Z.i]*Math.PI*2;
      g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.moveTo(0,0);g.arc(0,0,R,Math.max(cur,s0),Math.max(cur,s1));g.closePath();g.fill();
      g.setLineDash([R*.05,R*.04]);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=R*.012;g.beginPath();g.moveTo(0,0);g.arc(0,0,R,s0,s1);g.closePath();g.stroke();g.setLineDash([]);
      const near=Math.abs(cur-s1)<.12,over=cur>s1+.04;g.strokeStyle=over?'#ff7b6b':near?'#7cf5bd':'#ffd27a';g.lineWidth=R*(near?.05:.035);g.lineCap='round';g.beginPath();g.moveTo(Math.cos(s1)*R*.08,Math.sin(s1)*R*.08);g.lineTo(Math.cos(s1)*R*1.1,Math.sin(s1)*R*1.1);g.stroke();
      g.fillStyle=g.strokeStyle;g.beginPath();g.arc(Math.cos(s1)*R*1.16,Math.sin(s1)*R*1.16,R*.06,0,7);g.fill();}
    // круговая стрелка «мешай»
    if(Z.ph==='stir'){g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=R*.04;g.lineCap='round';const st0=t*1.6;g.beginPath();g.arc(0,0,R*.62,st0,st0+4.4);g.stroke();
      const ea=st0+4.4;g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.moveTo(Math.cos(ea)*R*.62+Math.cos(ea+1.57)*R*.1,Math.sin(ea)*R*.62+Math.sin(ea+1.57)*R*.1);g.lineTo(Math.cos(ea)*R*.5,Math.sin(ea)*R*.5);g.lineTo(Math.cos(ea)*R*.74,Math.sin(ea)*R*.74);g.closePath();g.fill();
      g.strokeStyle='#ffd27a';g.lineWidth=R*.05;g.beginPath();g.arc(0,0,R*1.08,-Math.PI/2,-Math.PI/2+Z.mix*Math.PI*2);g.stroke();}
    g.restore();
    // шары прикормки в финале
    if(Z.ph==='final'||Z.ph==='done'){const n=Math.min(5,Math.floor(Z.pt*3));const mc=g.fillStyle;for(let k=0;k<n;k++){const x=bx-rx*.5+k*rx*.25,y=by+ry*1.25;g.fillStyle='#b99a5a';ell(g,x,y,rx*.1,rx*.09);g.fill();g.fillStyle='rgba(255,255,255,.25)';ell(g,x-rx*.03,y-rx*.03,rx*.04,rx*.025);g.fill();}}
    g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=Math.max(1.5,rx*.02);ell(g,bx,by,rx*1.04,ry*1.06);g.stroke();
    // мешки
    for(let i=0;i<ING.length;i++){const cur=i===Z.i&&Z.ph==='pour',used=i<Z.i,tilt=cur&&Z.hold?(Z.sx[i]<Z.bx?.55:-.55):0,lift=cur?-Z.ss*.08-(Z.hold?Z.ss*.15:0):0;
      g.save();g.globalAlpha=used?.55:1;sack(g,Z.sx[i],(Z.syA?Z.syA[i]:Z.sy)+lift,Z.ss*(cur?1.1:1),ING[i],tilt,cur&&!Z.hold,t);g.restore();}
    // струйка
    for(const p of Z.parts){if(p.k==='grain'){const k=p.t/p.l,x=p.x0+(p.x1-p.x0)*k,y=p.y0+(p.y1-p.y0)*k-Math.sin(k*Math.PI)*Z.ss*.6;g.fillStyle=p.c;g.beginPath();g.arc(x,y,Math.max(1.5,Z.rx*.014),0,7);g.fill();}
      else if(p.k==='fleck'){g.fillStyle=p.c;g.globalAlpha=1-p.t/p.l;g.beginPath();g.arc(p.x,p.y,2.5,0,7);g.fill();g.globalAlpha=1;}}
    // палец при перемешивании
    if(Z.fp&&Z.ph==='stir'){g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(Z.fp.x,Z.fp.y,26,0,7);g.fill();}
    // Васька принюхивается
    if(Ar.drawCat)Ar.drawCat(g,Z.cx,Z.cy,Z.cs,t,Z.blinkC>0);
    for(const p of Z.pops){const k=p.t/1.3,a=k<.15?k/.15:1-Math.max(0,(k-.6)/.4),sz=Math.max(20,Z.rx*.16);g.save();g.globalAlpha=a;g.font='600 '+Math.round(sz)+'px '+(getComputedStyle(root).getPropertyValue('--font')||'sans-serif');g.textAlign='center';g.lineJoin='round';
      g.lineWidth=Math.max(4,sz*.22);g.strokeStyle='rgba(20,14,8,.75)';const y=by-ry*1.35-k*Z.rx*.25;g.strokeText(p.tx,bx,y);g.fillStyle=p.c;g.fillText(p.tx,bx,y);g.restore();}}
  function frame(now){if(Z.over)return;if(!root.isConnected){Z.over=true;removeEventListener('resize',onRes);return;}Z.raf=requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(now-(Z.last||now))/1000));Z.last=now;
    if(document.hidden)return;
    if(host.paused){if(Z.hold)onUp();Z.kdir=0;Z.keyHold=false;try{render();}catch(e){}return;} // RB:MGPC пауза: время и струйка стоят
    update(dt);try{render();}catch(e){console.error(e);Z.over=true;}}
  let rT=0;function onRes(){clearTimeout(rT);rT=setTimeout(()=>{if(!Z.over)geo();},120);}addEventListener('resize',onRes);
  geo();say(train?T_('Тренировка: мешаем для себя, прикормка не сохранится.','Practice: groundbait won\'t be kept.'):T_('Сегодня на '+fish.n.toLowerCase()+' — смешаем по моему рецепту. Доли — сверху.','Today it\'s '+(fish.en||fish.n).toLowerCase()+' — let\'s mix my recipe. Shares are at the top.'),2600);
  $q('.mgp-tray b').textContent=T_('Рецепт Петровича','Petrovich\'s recipe');$q('.mgp-tray span').textContent=T_('Мешки уже на мостках…','The bags are on the pier…');
  Z.raf=requestAnimationFrame(frame);
  return W_.__mgPrik={Z,tar,fid,step:(n,dt)=>{for(let i=0;i<n;i++)update(dt||.05);render();},down:()=>onDown({preventDefault(){},target:cv,pointerId:1}),up:onUp,next:()=>{if(Z.ph==='pour'&&Z.poured)doneIng();},
    stirTo:a=>{Z.stir=a;Z.mixRot=a;Z.mix=Math.min(1,a/(6.283*STIR_TURNS));if(a>=6.283*STIR_TURNS)finale();tray();}};}
function MG_KC(k){try{return W_.MG&&MG.kc?MG.kc(k):'';}catch(e){return '';}}
function esc0(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);}
function LANG_RU(){return typeof LANG==='undefined'||LANG!=='en';}

const PIC='<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="30" rx="18" ry="8" fill="#aeb8bd"/><ellipse cx="24" cy="28" rx="16" ry="6.5" fill="#6d777c"/><path d="M24 28L24 21.5A16 6.5 0 0 1 39.5 26.5z" fill="#7d5a32"/><path d="M24 28L39.5 26.5A16 6.5 0 0 1 24 34.5z" fill="#e0b45e"/><path d="M24 28L24 34.5A16 6.5 0 0 1 8.5 27z" fill="#f1d76a"/><path d="M24 28L8.5 27A16 6.5 0 0 1 24 21.5z" fill="#9c74c4"/><path d="M33 6c-4 0-6 4-6 9l4 2 6-3c0-5-1-8-4-8z" fill="#c9a86a"/><path d="M28 16l2 4" stroke="#f1d76a" stroke-width="2.5" stroke-linecap="round"/></svg>';
const REG={id:ID,n:{ru:'Прикормка по рецепту',en:'Groundbait recipe'},icon:PIC,kind:'daily',run,fix:fixP,merge:mergeP,
  sim:bot,recipe,dayFish,rateAt,stepScore,tierOf,mult:bm,act:actNow};
W_.MGB_PRIK=REG;
if(typeof W_.MG_REG==='function')W_.MG_REG(REG);
})();
