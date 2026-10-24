/* b2-mg-core-ui.js — MGCORE: оболочка мини-игр (грузится по требованию: MG.play / MG.after / вход, если есть открытые игры). Договор — шапка js/b2-mg-core.js.
   Для авторов игр (MG.game(id,{…}).make(sh)):
     sh.S = {st:'demo'|'play'|'res', t (с от начала партии), left (с до конца, при dur), score, warm (разминка: штрафов нет), demo (показ: игра жмёт сама), pc}
     sh.add(n=1) — очки; sh.pen(с) — минус секунды (в разминке ничего); sh.end() — партия кончилась сама (dur:0 или «упал»);
     sh.say(html) — реплика героя в шапке; sh.fx(x,y,текст,цвет) — всплывающая надпись в мире; sh.snd('tap'|'coin'|'no'|'win'); sh.L(ru,en); sh.rr(c,x,y,w,h,r) — путь скруглённого прямоугольника.
     make(sh) → {reset(demo), step(dt), draw(c) (мир 360×520, уже вписан и обрезан), down(x,y), move(x,y), up(x,y), key(k,up), finger() → {x,y,down} | null — где 👆 в показе}.
   Необязательное в описи MG.add: lk:[ru,en] — что откроет игру (строка в полке «☕ Перерыв»).
   Здесь же: предложение «💪 Сделать самому» (offer), эффект по медали (fx), соседи и Топтыгин, «Мини-игра дня» (гнездо today), полка «☕ Перерыв» (гнездо cab),
   «Новая затея!» (окно входа prio 25 + строка гнезда morning). */
(function(root){'use strict';
if(root.MGUI||!root.MG||typeof document==='undefined')return;
const MG=root.MG,G=MG.G,ENG=MG.ENG,K=MG.K,SG=MG.SG,E=root.ECON;
const LL=(r,e)=>typeof L==='function'?L(r,e):r;
const T=a=>a?LL(a[0],a[1]):'';
const esc=s=>String(s==null?'':s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'})[c]);
const snd=k=>{try{if(root.SND&&SND[k])SND[k]();}catch(e){}};
const sv=()=>{try{if(typeof save==='function')save();}catch(e){}};
const sk=()=>B2.s('m');
function rn(s){s=String(s);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}h=Math.imul(h^h>>>15,1|h);h^=h+Math.imul(h^h>>>7,61|h);return ((h^h>>>14)>>>0)/4294967296;}
function unit(id,n){const u=G[id].u;n=Math.round(n);try{return pl(n,u[0][0],u[0][1],u[0][2],u[1][0],u[1][1]);}catch(e){return u[0][2];}}
function fmt(id,v){const g=G[id],e=ENG[id];if(e&&e.fmt)return e.fmt(v);if(g.lower)return (v/10).toFixed(1).replace('.',typeof LANG!=='undefined'&&LANG==='en'?'.':',');return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');}
function sc(id,v){const g=G[id];return fmt(id,v)+' '+(g.lower?LL('с','s'):unit(id,v));}
const MD=[['без медали','no medal'],['🥉 бронза','🥉 bronze'],['🥈 серебро','🥈 silver'],['🥇 золото','🥇 gold']];
/* ---------- соседи и Топтыгин ---------- */
const NB=[['bor','Борис Бобров','Boris Bobrov','Бориса','Boris',1.12],['son','Соня Совина','Sonya Sovina','Сони','Sonya',.9],['vit','Витя Козлов','Vitya Kozlov','Вити','Vitya',.72]];
const TOP=['top','Михаил Топтыгин','Mikhail Toptygin','Топтыгина','Toptygin'];
function topBase(id,b){const g=G[id],d=MG.dk(),j=1.05+.1*rn(id+'|t|'+d);
  if(g.lower){const v=b?Math.floor(b/j)-1:Math.round(g.mid/1.1);return Math.max(1,Math.min(v,Math.round(g.mid/1.1)));}
  return Math.max(Math.round(g.mid*1.1),b?Math.ceil(b*j)+1:0);}
function topNow(id){const r=MG.rec(id);return r[3]||topBase(id,r[0]);}
/* раз в день: если игрок впереди Топтыгина — с вероятностью 0,65 Топтыгин забирает рекорд на 5–15 % */
function tick(){const s=sk(),d=MG.dk();let best=null;
  for(const id in G){if(!MG.on(id))continue;const r=MG.rec(id);if(!r[0]||r[4]>=d)continue;const ahead=r[3]?!MG.better(G[id],r[3],r[0]):true;
    if(ahead&&rn(id+'|tk|'+d)<.65){r[3]=topBase(id,r[0]);if(!best||r[1]>best.n)best={id,n:r[1]};}r[4]=d;}
  if(best){s.nw=best.id;s.nd=d;}}
function news(){const s=sk();if(!s.nw||!G[s.nw]||MG.dn(MG.dk())-MG.dn(s.nd||0)>2)return null;const r=MG.rec(s.nw);return MG.better(G[s.nw],r[3],r[0])?{id:s.nw,v:r[3]}:null;}
function table(id){const g=G[id],r=MG.rec(id),w=MG.wk(),base=g.lower?Math.max(g.md[2],r[0]?Math.min(r[0],g.mid*1.2):g.mid*1.2):Math.min(g.md[2],Math.max(r[0],Math.round(g.mid*.8)));   /* соседи растут за игроком, но не выше золота — первое место достижимо */
  const out=NB.map(n=>{const k=n[5]*(.92+.16*rn(id+'|'+n[0]+'|'+w));return {who:n[0],nm:LL(n[1],n[2]),gen:LL(n[3],n[4]),v:Math.max(1,Math.round(g.lower?base/k:base*k))};});
  out.push({who:'top',nm:LL(TOP[1],TOP[2]),gen:LL(TOP[3],TOP[4]),v:topNow(id)});out.push({who:'me',nm:LL('Вы','You'),v:r[0],me:1});
  out.sort((a,b)=>{if(a.v===b.v)return a.me?-1:b.me?1:0;if(g.lower)return (a.v||1e9)-(b.v||1e9);return b.v-a.v;});return out;}
function gap(id){const L2=table(id),i=L2.findIndex(x=>x.me);if(i<=0)return null;const u=L2[i-1],g=G[id],me=L2[i].v;
  const d=g.lower?(me?me-u.v+1:0):u.v-me+1;return {who:u.who,gen:u.gen,d,me:!!me};}
function gapTxt(id){const g=gap(id);if(!g)return LL('Первое место! Топтыгин завтра попробует отыграться','First place! Toptygin will try to strike back tomorrow');
  if(!g.me)return LL('Сыграйте — соседи уже ждут','Play — the neighbours are waiting');
  return LL('До '+g.gen+' — ','To '+g.gen+' — ')+sc(id,g.d);}
function tblHtml(id,n){const L2=table(id),m=L2.findIndex(x=>x.me);let a=0,b=L2.length;if(n&&n<b){a=Math.max(0,Math.min(b-n,m-1));b=a+n;}
  return '<table class="mgx-tb">'+L2.slice(a,b).map((x,i)=>'<tr'+(x.me?' class="me"':'')+'><td>'+(a+i+1)+'</td><td>'+(x.who==='top'?'🐻 ':'')+esc(x.nm)+'</td><td>'+(x.v?esc(sc(id,x.v)):'—')+'</td></tr>').join('')+'</table>';}
/* ---------- рекорд партии ---------- */
function put(id,v,warm,src){const g=G[id],r=MG.rec(id),prev=r[0],t0=topNow(id);r[1]++;
  const res={sc:v,prev,rec:false,first:!prev,medal:MG.medal(id,v),md0:MG.medal(id,prev),beat:false,warm};
  if(!warm){if(MG.better(g,v,prev)){r[0]=v;res.rec=true;}if(MG.better(g,v,r[2])||!r[2])r[2]=v;if(!r[3])r[3]=t0;res.beat=!MG.better(g,prev,t0)&&MG.better(g,v,t0);
    if(res.beat&&sk().nw===id)sk().nw='';}
  if(src==='day'){const s=sk(),d=MG.dk();if(s.dd!==d){s.ds=s.dd&&MG.dn(d)-MG.dn(s.dd)===1?(s.ds|0)+1:1;s.dd=d;}}
  const L2=table(id);res.place=L2.findIndex(x=>x.me)+1;
  B2.ev('mgcore','mg',{id,sc:v,st:res.medal,w:warm?1:0,src:src||'',rec:res.rec?1:0,n:r[1]});sv();return res;}
/* ---------- эффект по медали: m 2 — серебро, 3 — золото; go — применить, иначе только текст ---------- */
function fx(o,m,id,go){const W=GAME.W;if(!W||!(m>=2)||!o||!o.kind)return null;const s=SG[m],t=o.t;
  if(o.kind==='gig'){const g=W.me&&W.me.gigs.find(x=>x.id===o.ref);if(!g)return null;const d=MG.dk(),p=sk();if(!B2.isObj(p.tp)||p.tp.d!==d)p.tp={d,n:0,rt:0};
    if(p.tp.n>=K('tip_n',3))return {txt:LL('Чаевые на сегодня кончились — играйте на рекорд','No more tips today — play for the record')};
    const a=Math.round(g.pay*K('tip'+s,0)/10)*10,x=m===3?Math.max(0,Math.min(K('rt_g',0),K('rt_max',.05)-p.tp.rt)):0;if(!(a>0)&&!(x>0))return null;
    if(go){if(a>0){p.tp.n++;GAME.act('b2mgTip',t,a);}if(x>0){p.tp.rt+=x;W.me.rt=Math.min(5,W.me.rt+x);}B2.ev('mgcore','fx',{id,k:'gig:'+t,m});}
    return {txt:(a>0?LL('Чаевые +','Tips +')+a+' ₽':'')+(x>0?' ⭐ +'+LL(String(x).replace('.',','),String(x)):'')};}
  if(o.kind!=='job'||!W.ow)return null;const j=W.ow.j.find(x=>x.id===o.ref);if(!j)return null;let txt='';
  if(t==='stand'){const n=Math.round(K('stand'+s,0));if(!(n>0))return null;txt=LL('«Как при вас» дольше на ','“As if you’re there” lasts longer by ')+n+LL(' дн.',' d');
    if(go){const b=W.biz.find(y=>y.id===j.a);if(b)b.st2=Math.max(b.st2||0,W.t)+n;}}
  else{const v=t==='fly'?K('fly'+s,1):t==='neg'?K('neg'+s,0):t==='check'?K('chk'+s,0):0;if(t==='fly'?v===1:!(v>0))return null;
    txt=t==='fly'?LL('Листовки сработают сильнее: ×','Flyers work better: ×')+String(v).replace('.',','):t==='neg'?LL('Скидка поставщика больше на ','Supplier discount up by ')+Math.round(v*1000)/10+' %':LL('Найдёте недостачу: вернётся ','You’ll find a shortfall: ')+Math.round(v*100)+LL(' % выручки точки',' % of the point’s revenue back');
    if(go){const w=B2.w(W,'mgcore');(w.j=w.j||[]).push([j.id,t,j.a,m]);}}
  if(go)B2.ev('mgcore','fx',{id,k:'job:'+t,m});return {txt};}
/* ---------- CSS ---------- */
function css(){if(document.getElementById('mgxCss'))return;const s=document.createElement('style');s.id='mgxCss';s.textContent=[
'.mgx{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:flex;flex-direction:column;background:#26313f;color:#1d2733;font-family:inherit;-webkit-user-select:none;user-select:none;touch-action:none}',
'.mgx-top{flex:none;display:flex;align-items:flex-start;padding:calc(env(safe-area-inset-top) + 8px) 8px 4px 10px;max-width:760px;width:100%;margin:0 auto;box-sizing:border-box}',
'.mgx-ava{flex:none;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:20px;margin-right:8px;box-shadow:0 2px 0 rgba(0,0,0,.3)}',
'.mgx-bub{flex:1;min-width:0;background:#fff;border-radius:16px 16px 16px 4px;padding:6px 12px;font-size:16px;line-height:1.3;min-height:36px}',
'.mgx-bub>b{display:block;font-size:13px;color:#5a6675;font-weight:600}',
'.mgx-x{flex:none;width:48px;height:48px;margin-left:8px;border:0;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;font-size:22px;cursor:pointer}',
'.mgx-info{flex:none;display:flex;justify-content:center;flex-wrap:wrap;padding:2px 8px 4px}',
'.mgx-info span{background:#fff3c4;border-radius:12px;padding:3px 12px;margin:0 4px;font-weight:700;font-size:17px;white-space:nowrap}.mgx-info span:empty{display:none}',
'.mgx-info .w{background:#2e7d32;color:#fff}',
'.mgx-fld{position:relative;flex:1;min-height:0;overflow:hidden}.mgx-fld canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none}',
'.mgx-ft{flex:none;display:flex;justify-content:center;padding:8px 10px calc(10px + env(safe-area-inset-bottom));max-width:760px;width:100%;margin:0 auto;box-sizing:border-box}.mgx-ft:empty{display:none}',
'.mgx-ft .btn{flex:1;max-width:420px;min-height:56px;font-size:19px;margin:0 4px}',
'.mgx-res{position:absolute;left:0;top:0;right:0;bottom:0;z-index:3;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(20,26,34,.6);overflow-y:auto;-webkit-overflow-scrolling:touch}',
'.mgx-pn{margin:auto;width:100%;max-width:420px;background:#fff;border-radius:20px;padding:14px 16px 10px;text-align:center;box-sizing:border-box}',
'.mgx-pn h3{margin:0;font-size:19px}.mgx-big{font-size:46px;font-weight:800;line-height:1.05;margin:4px 0 0}.mgx-u{color:#4f5d72;font-size:16px}',
'.mgx-rec{display:inline-block;margin:6px 0 2px;padding:3px 14px;border-radius:12px;background:#ffd84a;font-weight:800}',
'.mgx-md{font-weight:700;margin:6px 0 2px;font-size:17px}.mgx-fx{margin:6px 0;padding:6px 10px;border-radius:12px;background:#e7f4ea;color:#0a7a3a;font-weight:700;font-size:16px}',
'.mgx-gap{font-weight:700;color:#8a4b00;margin:6px 0 4px;font-size:17px}',
'.mgx-tb{width:100%;border-collapse:collapse;margin:4px 0;font-size:16px}.mgx-tb td{padding:3px 6px;text-align:left;white-space:nowrap}.mgx-tb td:first-child{width:22px;color:#4f5d72}.mgx-tb td:last-child{text-align:right;font-weight:700}',
'.mgx-tb tr.me td{background:#fff3bf;font-weight:800}',
'.mgx-bt .btn{display:block;width:100%;min-height:56px;font-size:20px;margin:8px 0 0}.mgx-row{display:flex;justify-content:space-between}',
'.mgx-lnk{flex:1;background:none;border:0;min-height:48px;font-size:17px;color:#1f5f99;text-decoration:underline;cursor:pointer;font-family:inherit}',
'.mgx-kc{display:inline-block;font-size:12px;border:1.5px solid currentColor;border-radius:5px;padding:1px 4px;margin-left:6px;opacity:.7;vertical-align:middle}.mgx:not(.pc) .mgx-kc{display:none}',
'.mgx-of{position:fixed;left:8px;right:8px;bottom:calc(140px + env(safe-area-inset-bottom));z-index:45;max-width:520px;margin:0 auto;background:#fff;border-radius:18px;box-shadow:0 6px 24px rgba(0,0,0,.25);padding:10px 12px;display:flex;align-items:center}',
'.mgx-of .i{font-size:30px;margin-right:10px}.mgx-of .f1{flex:1;min-width:0}.mgx-of b{display:block;font-size:17px}.mgx-of small{display:block;font-size:15px;color:#4f5d72}',
'.mgx-of .btn{min-height:48px;margin-left:8px;white-space:nowrap}.mgx-of .x{background:none;border:0;font-size:20px;width:44px;height:48px;color:#4f5d72;cursor:pointer}',
'.mgx-card{display:flex;align-items:center}.mgx-card .i{font-size:30px;margin-right:10px}.mgx-card .f1{flex:1;min-width:0}.mgx-card b{display:block}.mgx-card small{display:block;color:var(--muted,#4f5d72);font-size:15px}',
'.mgx-card .btn{min-height:48px;margin-left:8px;white-space:nowrap}.mgx-sh .mgx-card{padding:8px 0;border-top:1px solid var(--line,#d5dbe2)}.mgx-sh .mgx-card.lk{opacity:.75}',
'@media (min-width:900px){.mgx-of{bottom:90px}}',
'@media (max-height:600px){.mgx-big{font-size:36px}.mgx-tb{font-size:14px}.mgx-tb td{padding:1px 6px}.mgx-bt .btn{min-height:50px}.mgx-ava{width:40px;height:40px}}'
].join('\n');document.head.appendChild(s);}
/* ---------- партия ---------- */
const SES={};let cur=null;
function run(id,o){const g=G[id],e=ENG[id];if(!g||!e)return null;if(cur)cur.close(true);css();tick();o=o||{};
  const pc=window.innerWidth>=900&&!('ontouchstart' in window),fr=document.createElement('div');fr.className='mgx'+(pc?' pc':'');fr.id='mgx';
  const H=e.hero||{};
  fr.innerHTML='<div class="mgx-top"><div class="mgx-ava" style="background:'+esc(H.c||'#1f5f99')+'">'+esc(H.a||g.ico)+'</div><div class="mgx-bub"><b>'+esc(T(H.n)||T(g.n))+'</b><span class="mgx-tx"></span></div><button class="mgx-x" aria-label="✕">✕</button></div>'+
    '<div class="mgx-info"><span class="mgx-sc"></span><span class="mgx-tm"></span><span class="mgx-wm w"></span></div><div class="mgx-fld"><canvas></canvas></div><div class="mgx-ft"></div>';
  document.body.appendChild(fr);MG.busy=true;
  const q=c=>fr.querySelector(c),cv=q('canvas'),c=cv.getContext('2d'),fld=q('.mgx-fld'),tx=q('.mgx-tx'),ft=q('.mgx-ft');
  const Q={st:'demo',t:0,left:0,score:0,warm:false,demo:true,pc},fxs=[];let dead=false,bestM=0,again=0,lw=0,lh=0,dpr=1,k=1,ox=0,oy=0,last=0,raf=0;
  const sh={S:Q,L:LL,add(n){if(Q.st==='play'||Q.st==='demo')Q.score+=n==null?1:n;},pen(s){if(Q.st==='play'&&!Q.warm&&e.dur)Q.left=Math.max(0,Q.left-s);},
    end(){if(Q.st==='play')setTimeout(()=>{if(!dead&&Q.st==='play')finish();},400);},say(h){tx.innerHTML=h;},snd(k){if(Q.st==='play')snd(k);},
    fx(x,y,t,col){fxs.push({x,y,t:String(t),c:col||'#2e7d32',a:1});},
    rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}};
  const gm=e.make(sh);root.__mgx={Q,gm,sh,id};
  function fit(){const r=fld.getBoundingClientRect(),d=Math.min(2.5,window.devicePixelRatio||1);if(Math.abs(r.width-lw)<1&&Math.abs(r.height-lh)<1&&d===dpr)return;
    lw=r.width;lh=r.height;dpr=d;cv.width=Math.max(1,Math.round(lw*d));cv.height=Math.max(1,Math.round(lh*d));k=Math.min(lw/360,lh/520);ox=(lw-360*k)/2;oy=(lh-520*k)/2;}
  const P=ev=>{const r=cv.getBoundingClientRect();return [(ev.clientX-r.left-ox)/k,(ev.clientY-r.top-oy)/k];};
  function hud(){q('.mgx-sc').textContent=Q.st==='demo'?'':sc(id,Q.score);q('.mgx-tm').textContent=Q.st==='play'&&e.dur?Math.ceil(Q.left)+LL(' с',' s'):'';
    q('.mgx-wm').textContent=Q.st==='play'&&Q.warm?LL('разминка','warm-up'):'';}
  function btn(h,fn,cls){ft.innerHTML='';if(!h)return;const b=document.createElement('button');b.className='btn '+(cls||'green');b.innerHTML=h;b.onclick=()=>{snd('tap');fn();};ft.appendChild(b);}
  function demo(){Q.st='demo';Q.demo=true;Q.t=0;Q.score=0;try{gm.reset(true);}catch(x){console.error(x);}sh.say(T(e.how));const r=fr.querySelector('.mgx-res');if(r)r.remove();
    const w=!SES[id];btn('▶ '+(w?LL('Начать разминку','Start the warm-up'):LL('Играть','Play'))+'<span class="mgx-kc">Enter</span>',start);hud();}
  function start(){const r=fr.querySelector('.mgx-res');if(r)r.remove();Q.st='play';Q.demo=false;Q.t=0;Q.score=0;Q.left=e.dur||0;Q.warm=!SES[id];fxs.length=0;
    try{gm.reset(false);}catch(x){console.error(x);}sh.say(Q.warm?LL('Разминка: штрафов нет, в рекорд не идёт.','Warm-up: no penalties, it doesn’t count.'):T(e.go)||T(e.how));btn(e.btns?'':'',null);
    if(e.btns){ft.innerHTML='';e.btns.forEach(b=>{const x=document.createElement('button');x.className='btn';x.innerHTML=b[0];
      const dn=ev=>{ev.preventDefault();if(Q.st==='play')gm.key&&gm.key(b[1],false);},up=()=>{if(Q.st==='play')gm.key&&gm.key(b[1],true);};
      x.addEventListener('pointerdown',dn);x.addEventListener('pointerup',up);x.addEventListener('pointerleave',up);ft.appendChild(x);});}hud();}
  function finish(){if(Q.st!=='play')return;Q.st='res';const v=Math.max(0,Math.round(Q.score)),warm=Q.warm;SES[id]=(SES[id]|0)+1;
    const r=put(id,v,warm,o.src);if(!warm&&r.medal>bestM)bestM=r.medal;else if(warm&&r.medal>0&&bestM<1)bestM=1;snd(r.rec?'win':'coin');ft.innerHTML='';
    const f=fx(o,bestM,id,false),box=document.createElement('div');box.className='mgx-res';
    let h='<div class="mgx-pn"><h3>'+esc(g.ico+' '+T(g.n))+'</h3><div class="mgx-big">'+esc(fmt(id,v))+'</div><div class="mgx-u">'+esc(g.lower?LL('секунд — меньше лучше','seconds — lower is better'):unit(id,v))+'</div>';
    if(warm)h+='<p class="mgx-md">'+LL('Разминка готова! В рекорд не идёт. Теперь — по-настоящему: соседи ждут.','Warm-up done! It doesn’t count. Now for real: the neighbours are waiting.')+'</p>';
    else{h+=(r.rec&&!r.first?'<div class="mgx-rec">'+LL('Новый рекорд! Было ','New record! Was ')+esc(fmt(id,r.prev))+'</div>':'<div class="mgx-u">'+LL('Рекорд: ','Best: ')+esc(sc(id,MG.best(id)))+'</div>')+
      '<div class="mgx-md">'+LL('Медаль: ','Medal: ')+T(MD[r.medal])+(r.medal>r.md0?' — '+LL('новая!','new!'):'')+'</div>';
      if(f)h+='<div class="mgx-fx">'+esc(f.txt)+'</div>';
      h+='<div class="mgx-gap">'+(r.beat?LL('Топтыгин позади! Посмотрим, что он скажет завтра…','Toptygin is behind you! Let’s see what he says tomorrow…'):esc(gapTxt(id))+(gap(id)?LL('. Ещё разок?','. One more go?'):''))+'</div>'+tblHtml(id,(window.innerHeight||800)<700?3:0);
      if(!f&&o.kind&&bestM<2)h+='<div class="mgx-u">'+LL('Серебро и золото дают больше. Бронза — как обычно.','Silver and gold give more. Bronze is as usual.')+'</div>';}
    h+='<div class="mgx-bt"><button class="btn green" data-k="ag">'+(warm?'▶ '+LL('Играть на рекорд','Play for the record'):'↻ '+LL('Ещё разок','One more go'))+'<span class="mgx-kc">Enter</span></button>'+
      '<div class="mgx-row"><button class="mgx-lnk" data-k="ok">'+LL('Хватит','Enough')+'<span class="mgx-kc">Esc</span></button><button class="mgx-lnk" data-k="how">'+LL('Как играть?','How to play?')+'</button></div></div></div>';
    box.innerHTML=h;fld.appendChild(box);box.querySelector('[data-k=ag]').onclick=()=>{snd('tap');if(!warm){again++;B2.ev('mgcore','again',{id,n:again});}start();};
    box.querySelector('[data-k=ok]').onclick=()=>{snd('tap');close();};box.querySelector('[data-k=how]').onclick=()=>{snd('tap');demo();};hud();}
  function close(quiet){if(dead)return;dead=true;cancelAnimationFrame(raf);window.removeEventListener('keydown',kd,true);window.removeEventListener('keyup',ku,true);
    fr.remove();cur=null;MG.busy=false;let f=null;if(!quiet&&bestM>=2)f=fx(o,bestM,id,true);sv();
    if(f&&f.txt)try{toast('💪 '+f.txt,2000);}catch(x){}try{if(root.UI&&UI.refresh)UI.refresh();}catch(x){}if(o.done)try{o.done({id,m:bestM});}catch(x){}}
  function kd(ev){if(dead)return;const kk=ev.key;if(kk==='Escape'){ev.preventDefault();ev.stopPropagation();if(Q.st==='play'){Q.st='res';close();}else close();return;}
    if(kk==='Enter'||(kk===' '&&Q.st!=='play')){ev.preventDefault();ev.stopPropagation();if(Q.st==='demo')start();else if(Q.st==='res'){const b=fr.querySelector('[data-k=ag]');if(b)b.click();}return;}
    if(Q.st==='play'&&gm.key){ev.preventDefault();ev.stopPropagation();if(!ev.repeat)gm.key(kk,false);}}
  function ku(ev){if(!dead&&Q.st==='play'&&gm.key)gm.key(ev.key,true);}
  window.addEventListener('keydown',kd,true);window.addEventListener('keyup',ku,true);
  cv.addEventListener('pointerdown',ev=>{ev.preventDefault();if(Q.st!=='play')return;const p=P(ev);gm.down&&gm.down(p[0],p[1]);});
  cv.addEventListener('pointermove',ev=>{if(Q.st!=='play'||!gm.move)return;const p=P(ev);gm.move(p[0],p[1]);});
  cv.addEventListener('pointerup',ev=>{if(Q.st!=='play'||!gm.up)return;const p=P(ev);gm.up(p[0],p[1]);});
  q('.mgx-x').onclick=()=>{snd('tap');close();};
  function frame(now){if(dead)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,last?(now-last)/1000:0);last=now;if(document.hidden)return;fit();
    if(Q.st==='play'||Q.st==='demo'){Q.t+=dt;try{gm.step(dt);}catch(x){console.error(x);}
      if(Q.st==='play'&&e.dur){Q.left-=dt;if(Q.left<=0){Q.left=0;finish();}}if(Q.st==='demo'&&Q.t>(e.demoT||6)){Q.t=0;Q.score=0;try{gm.reset(true);}catch(x){}}}
    for(const f of fxs){f.a-=dt;f.y-=dt*30;}while(fxs.length&&fxs[0].a<=0)fxs.shift();
    c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#26313f';c.fillRect(0,0,lw,lh);c.translate(ox,oy);c.scale(k,k);c.save();c.beginPath();c.rect(0,0,360,520);c.clip();
    try{gm.draw(c);}catch(x){console.error(x);}
    c.textAlign='center';c.textBaseline='middle';for(const f of fxs){c.globalAlpha=Math.max(0,Math.min(1,f.a*1.5));c.font='bold 18px sans-serif';c.lineWidth=4;c.strokeStyle='#fff';c.strokeText(f.t,f.x,f.y);c.fillStyle=f.c;c.fillText(f.t,f.x,f.y);}c.globalAlpha=1;
    if(Q.st==='demo'){const fg=gm.finger&&gm.finger();if(fg){c.font='44px serif';c.fillText('👆',fg.x+6,fg.y+(fg.down?26:34));if(fg.down){c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=3;c.beginPath();c.arc(fg.x,fg.y,16,0,7);c.stroke();}}
      c.fillStyle='rgba(29,39,51,.8)';sh.rr(c,90,488,180,26,13);c.fill();c.fillStyle='#fff';c.font='bold 15px sans-serif';c.fillText(LL('Смотрите, как играть','Watch how to play'),180,501);}
    c.restore();if(Q.st==='play')hud();}
  demo();raf=requestAnimationFrame(frame);
  cur={id,close,Q};return cur;}
/* ---------- «💪 Сделать самому» — после «Взять»/«Начать» ---------- */
let ofEl=null,ofT=0;
function offer(id,o){css();const g=G[id];if(!g||MG.busy||typeof modalOn!=='undefined'&&modalOn)return;if(ofEl)ofEl.remove();clearTimeout(ofT);
  const s2=fx(o,2,id,false),s3=fx(o,3,id,false),hint=s3?LL('на золото: ','gold: ')+s3.txt:LL('медаль и рекорд','medal and record');
  const el=document.createElement('div');el.className='mgx-of';el.innerHTML='<span class="i">'+g.ico+'</span><span class="f1"><b>'+LL('Сделать самому?','Do it yourself?')+'</b><small>'+esc(T(g.n))+' · '+esc(hint)+'</small></span>'+
    '<button class="btn green noenter">💪 '+LL('Сам','Me')+'</button><button class="x" aria-label="✕">✕</button>';
  document.body.appendChild(el);ofEl=el;B2.ev('mgcore','offer',{id,k:o.kind});
  const kill=()=>{clearTimeout(ofT);if(ofEl===el){el.remove();ofEl=null;}};
  el.querySelector('.btn').onclick=()=>{snd('tap');kill();MG.play(id,o);};el.querySelector('.x').onclick=()=>{snd('tap');kill();};ofT=setTimeout(kill,9000);void s2;}
/* ---------- гнёзда: «Мини-игра дня», полка «☕ Перерыв», «Новая затея!» ---------- */
const opened=()=>Object.keys(G).filter(id=>MG.isOpen(id));
function dayId(){const a=opened().filter(id=>G[id].day!==0).sort();return a.length?a[MG.dn(MG.dk())%a.length]:null;}
function card(id,src,lab){const r=MG.rec(id),m=MG.medal(id);
  return '<div class="mgx-card"><span class="i">'+G[id].ico+'</span><span class="f1"><b>'+esc(lab||T(G[id].n))+'</b><small>'+(r[0]?LL('рекорд ','best ')+esc(sc(id,r[0]))+(m?' · '+T(MD[m]):'')+' · '+esc(gapTxt(id)):LL('ещё не играли · 30 секунд','not played yet · 30 seconds'))+'</small></span>'+
    '<button class="btn green noenter" data-b2="mgcore:play:'+id+':'+src+'">▶ '+LL('Играть','Play')+'</button></div>';}
B2.slot('today','mgcore',()=>{const nw=news();if(nw)return card(nw.id,'day','🐻 '+LL('Топтыгин побил ваш рекорд: ','Toptygin beat your record: ')+sc(nw.id,nw.v));
  const id=dayId();if(!id)return '';const s=sk(),d=MG.dk(),done=s.dd===d;
  return card(id,'day','🎯 '+LL('Мини-игра дня: ','Game of the day: ')+T(G[id].n)+(s.ds>1?' · '+LL('серия ','streak ')+s.ds:'')+(done?' ✓':''));},30);
B2.slot('cab','mgcore',()=>{const ids=Object.keys(G).filter(MG.on);if(!ids.length)return '';const op=opened();
  return '<div class="card mgx-sh"><h3 style="margin:0 0 4px">☕ '+LL('Перерыв — мини-игры','Break — mini-games')+'</h3><small style="color:var(--muted)">'+LL('Тренировка на рекорд, без наград. Награды — у подработок и дел: «💪 Сделать самому».','Practice for the record, no rewards. Rewards come with jobs and tasks: “💪 Do it yourself”.')+'</small>'+
    ids.map(id=>op.indexOf(id)>=0?card(id,'shelf'):'<div class="mgx-card lk"><span class="i">🔒</span><span class="f1"><b>'+esc(T(G[id].n))+'</b><small>'+esc(T(G[id].lk)||LL('откроется позже — с новым делом','opens later — with a new business'))+'</small></span></div>').join('')+'</div>';},20);
function fresh(){const a=String(sk().a||'').split(',');return opened().find(id=>a.indexOf(id)<0)||null;}
function seen(id){const s=sk(),a=String(s.a||'').split(',').filter(Boolean);if(a.indexOf(id)<0)a.push(id);s.a=a.join(',');sv();}
B2.slot('morning','mgcore',()=>{const id=fresh();if(!id)return '';seen(id);return '🆕 '+LL('Новая затея: ','New pastime: ')+esc(G[id].ico+' '+T(G[id].n))+' <button class="btn sm green noenter" data-b2="mgcore:play:'+id+':new">'+LL('Сыграть','Play')+'</button>';},30);
function news1(id){if(!id||!G[id])return;seen(id);const e=G[id];B2.ev('mgcore','new',{id});
  modal('<h2>'+LL('Новая затея!','Something new!')+'</h2><p style="font-size:44px;text-align:center;margin:6px 0">'+e.ico+'</p><p><b>'+esc(T(e.n))+'</b> — '+
    LL('мини-игра на 30 секунд. Сделайте дело своими руками: серебро и золото дают больше, бронза — как обычно. Соседи по классу уже соревнуются.','a 30-second mini-game. Do the job with your own hands: silver and gold give more, bronze is as usual. Your classmates are already competing.')+'</p>'+
    '<div class="row"><button class="btn green noenter" data-b2="mgcore:play:'+id+':new">▶ '+LL('Сыграть','Play')+'</button><button class="btn" data-esc onclick="hideModal()">'+LL('Потом','Later')+'</button></div>');}
B2.click('mgcore',(act,arg)=>{if(act!=='play')return;const p=arg.split(':');snd('tap');try{if(typeof modalOn!=='undefined'&&modalOn)hideModal();}catch(e){}MG.play(p[0],{src:p[1]||'shelf'});});
tick();
root.MGUI={run,offer,news1,fx,table,gap,tick,news,put,css,dayId,opened,get cur(){return cur;}};
try{if(root.UI&&UI.refresh)UI.refresh();}catch(e){}
})(typeof window!=='undefined'?window:globalThis);
