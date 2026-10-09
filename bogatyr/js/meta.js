'use strict';
/* ================= МЕТА: «Подворье» — огород, пасека, печь → «узелок в дорогу» (ветка meta, 07.10) =================
   План — ~/Projects/hobby-analytics/release-i/bogatyr-meta/plan.md (разделы 4.1, 6–8). Журнал — log-podvorye.md там же.
   Правила: подворье НЕ платит золотом (только тратит: грядки, улей); бонус узелка — 1 блюдо на поход главы, ≤ 15 % к одной черте.
   Выключатель META_ON (выпущенные части меты, как THEMES_ON): пусто → игра ровно как была (S.meta не создаётся, хуки молчат).
   На своей машине (LOCAL): ?meta=all или ?meta=yard. Время — только nowMs() (сервер Яндекса / ограничение VK).
   Крючки в общих файлах (зовутся «если есть функция», ошибка → console.warn, игра идёт дальше):
     core.js fixSave → META_FIX() · mergeProgress → META_MERGE(d,o) · game.js computeStats → META_ST(st) · newRun → META_RUN(G)
     ui.js renderVillage → META_VIL(el) · todayList → META_TODAY(TL) (+ x.fn в openToday)
   Сейв: только S.meta.y (подворье) — {pl:[{c,t,d}|null…], hv, ht, st:{репа…}, ov:{k,t,d}|null, d:{блюдо:N}, bag, ad:{day,n}, in, c:{p,h,b,r}, ts} */
const META_ON=['yard','tro','slava','pet','wpn','terem']; // выпущенные части меты: 'yard' — Подворье (меняет главный при выпуске)
// ВЫПУСК всей меты (meta-all) — заменить строку выше на: const META_ON=['yard','tro','slava','pet','wpn','terem'];
function metaOn(k){if(META_ON.indexOf(k)>=0)return true;if(typeof LOCAL==='undefined'||!LOCAL)return false;
  const m=(location.search.match(/[?&]meta=([a-z,]+)/)||[])[1]||'';return m==='all'||m.split(',').indexOf(k)>=0;}
const YARD_ON=metaOn('yard');
function metaErr(w,x){metaErr.n=(metaErr.n||0)+1;if(metaErr.n<=5)console.warn('meta '+w+': '+(x&&x.message||x));}

/* ---------- данные ---------- */
const CROPS={ // t — секунды роста, n — урожай с грядки
  repa:{t:3600,n:2,ic:'m_repa',get name(){return L('Репа','Turnip');}},
  kap:{t:3*3600,n:2,ic:'m_kap',get name(){return L('Капуста','Cabbage');}},
  gor:{t:6*3600,n:3,ic:'m_gor',get name(){return L('Горох','Peas');}}};
const HONEY={ic:'m_honey',get name(){return L('Мёд','Honey');}};
const DISHES={ // need — что нужно, t — секунды в печи, fx — бонус на 1 поход главы
  pie:{need:{repa:2},t:20*60,ic:'pie',fx:{hp:.15},get name(){return L('Пирожок с репой','Turnip pie');},get fxT(){return L('+15% здоровья','+15% health');}},
  shchi:{need:{kap:2},t:40*60,ic:'m_shchi',fx:{spd:.1},get name(){return L('Щи','Cabbage soup');},get fxT(){return L('+10% скорости','+10% speed');}},
  kasha:{need:{gor:2},t:3600,ic:'m_kasha',fx:{xp:.1,rr:1},get name(){return L('Гороховая каша','Pea porridge');},get fxT(){return L('+10% опыта и +1 перебор','+10% XP and +1 reroll');}},
  medovik:{need:{med:1,repa:1},t:3600,ic:'m_medovik',fx:{might:.1},get name(){return L('Медовик','Honey cake');},get fxT(){return L('+10% урона','+10% damage');}}};
const YARD={plots:[0,0,1500,4000],hive:800,hiveH:8,hiveCap:2,store:20,dishCap:5,adDay:2,first:120,firstBake:60};
function ingName(k){return k==='med'?HONEY.name:CROPS[k].name;}
function ingIc(k){return k==='med'?HONEY.ic:CROPS[k].ic;}

/* ---------- сейв ---------- */
function yNew(){return {pl:[null,null],hv:0,ht:0,st:{},ov:null,d:{},bag:'',ad:{day:'',n:0},in:0,c:{p:0,h:0,b:0,r:0},ts:0};}
function yFix(y){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),n=v=>typeof v==='number'&&isFinite(v)?v:0;
  if(!Array.isArray(y.pl))y.pl=[null,null];while(y.pl.length<2)y.pl.push(null);if(y.pl.length>YARD.plots.length)y.pl.length=YARD.plots.length;
  y.pl=y.pl.map(p=>ob(p)&&CROPS[p.c]?{c:p.c,t:n(p.t),d:n(p.d)||CROPS[p.c].t*1000}:null);
  for(const k of['st','d','ad','c'])if(!ob(y[k]))y[k]={};
  for(const k in y.st)y.st[k]=Math.max(0,n(y.st[k])|0);for(const k in y.d)y.d[k]=Math.max(0,n(y.d[k])|0);for(const k in y.c)y.c[k]=n(y.c[k]);
  y.hv=n(y.hv)?1:0;y.ht=n(y.ht);y.in=n(y.in)?1:0;y.ts=n(y.ts);if(typeof y.bag!=='string'||y.bag&&!DISHES[y.bag])y.bag='';
  if(!ob(y.ov)||!DISHES[y.ov.k])y.ov=null;else{y.ov.t=n(y.ov.t);y.ov.d=n(y.ov.d);}
  return y;}
function META_FIX(){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);
  if(S.meta!=null&&!ob(S.meta))S.meta=null;
  if(!S.meta){if(!YARD_ON)return;S.meta={};}
  if(S.meta.y!=null||YARD_ON)S.meta.y=yFix(ob(S.meta.y)?S.meta.y:yNew());}catch(e){metaErr('fix',e);}}
// облако: подворье — целиком из более нового (ts), постоянное (грядки, улей, обучение, счётчики) — максимум
function META_MERGE(d,o){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),dm=ob(d)&&ob(d.meta)?d.meta:null;if(!dm)return;
  if(!ob(o.meta))o.meta={};const a=ob(o.meta.y)?o.meta.y:null,b=ob(dm.y)?dm.y:null;if(!b)return;
  if(!a){o.meta.y=JSON.parse(JSON.stringify(b));return;}
  const nw=JSON.parse(JSON.stringify((+b.ts||0)>(+a.ts||0)?b:a)),ol=nw===a?b:a;
  const la=Array.isArray(a.pl)?a.pl.length:2,lb=Array.isArray(b.pl)?b.pl.length:2;if(!Array.isArray(nw.pl))nw.pl=[];while(nw.pl.length<Math.max(la,lb))nw.pl.push(null);
  nw.hv=Math.max(+a.hv||0,+b.hv||0);nw.in=Math.max(+a.in||0,+b.in||0);if(nw.hv&&!nw.ht)nw.ht=+ol.ht||0;
  nw.c=ob(nw.c)?nw.c:{};const oc=ob(ol.c)?ol.c:{};for(const k in oc)nw.c[k]=Math.max(+nw.c[k]||0,+oc[k]||0);
  o.meta.y=nw;}catch(e){metaErr('merge',e);}}
META_FIX();
function Y(){return YARD_ON&&S.meta&&S.meta.y||null;}
function yTouch(){const y=Y();if(y)y.ts=Date.now();}

/* ---------- А/Б: показ новичку (STAT.ab — механизм core.js; буква уходит в cfg) ----------
   B — семена от бабушки сразу после 1-го похода; A и старые игроки — подворье открывается после 2-й освобождённой главы. */
let YARD_AB='';try{if(YARD_ON)YARD_AB=STAT.ab('yard1',2,true)||'';}catch(e){}
function yardOpen(){const y=Y();if(!y)return false;if(y.in)return true;if(!S.runs)return false;return YARD_AB==='B'&&!!S.village.forge||landsU()>=2;} /* группа B — после 1-го похода, но не поверх «Первым делом — кузница» (QA 07.10) */

/* ---------- время и состояние ---------- */
function yNow(){return nowMs();}
function fmtLeft(ms){const m=Math.max(1,Math.ceil(ms/60000));if(m<60)return m+L(' мин',' min');const h=Math.floor(m/60),r=m%60;return h+L(' ч',' h')+(r?' '+r+L(' мин',' min'):'');}
function plotLeft(p){return p?Math.max(0,p.t+p.d-yNow()):0;}
function hiveN(y){if(!y.hv)return 0;return Math.min(YARD.hiveCap,Math.floor((yNow()-y.ht)/(YARD.hiveH*3600e3)));}
function hiveLeft(y){return Math.max(0,y.ht+YARD.hiveH*3600e3-yNow());}
function ovLeft(y){return y.ov?Math.max(0,y.ov.t+y.ov.d-yNow()):0;}
function stTot(y){let n=0;for(const k in y.st)n+=y.st[k];return n;}
function canBake(y,k){const nd=DISHES[k].need;for(const i in nd)if((y.st[i]||0)<nd[i])return false;return true;}
function ripeN(y){return y.pl.filter(p=>p&&plotLeft(p)<=0).length;}
// что ждёт игрока (для «Дел на сегодня» и карточки в деревне)
function yardReady(y){return ripeN(y)>0||hiveN(y)>0||!!(y.ov&&ovLeft(y)<=0)||y.pl.some(p=>!p);}
function yardStatus(y){const r=ripeN(y),a=[];
  if(r)a.push(L('поспел урожай: ','harvest ready: ')+r);
  if(y.ov&&ovLeft(y)<=0)a.push(L('в печи готово','oven is done'));
  if(hiveN(y))a.push(L('мёд готов','honey ready'));
  if(!a.length){const e=y.pl.filter(p=>!p).length;if(e)a.push(L('свободных грядок: ','free beds: ')+e);}
  if(!a.length){let m=1e15;for(const p of y.pl)if(p)m=Math.min(m,plotLeft(p));if(y.ov)m=Math.min(m,ovLeft(y));a.push(L('поспеет через ','ready in ')+fmtLeft(m));}
  const b=y.bag&&y.d[y.bag]?' · 🧺 '+DISHES[y.bag].name:'';return a.join(' · ')+b;}

/* ---------- действия ---------- */
function yEv(a,k,x){try{const p={a:a};if(k)p.k=k;if(x)for(const i in x)p[i]=x[i];STAT.ev('yard',p);}catch(e){}}
function yPlant(i,k){const y=Y();if(!y||y.pl[i]||!CROPS[k])return;const first=!y.c.p&&k==='repa';
  y.pl[i]={c:k,t:yNow(),d:(first?YARD.first:CROPS[k].t)*1000};y.c.p=(y.c.p||0)+1;yTouch();save();SND.click();yEv('plant',k);}
function yHarv(i){const y=Y();if(!y)return;const p=y.pl[i];if(!p||plotLeft(p)>0)return;const cr=CROPS[p.c],room=YARD.store-stTot(y);
  if(room<=0){toast(L('Амбар полон — испеки что-нибудь в печи','The barn is full — bake something first'));return;}
  const n=Math.min(cr.n,room);y.st[p.c]=(y.st[p.c]||0)+n;y.pl[i]=null;y.c.h=(y.c.h||0)+1;yTouch();save();SND.coin();
  yEv('harv',p.c,{w:Math.round((yNow()-p.t)/1000)});toast(cr.name+': +'+n);}
function yHoney(){const y=Y();if(!y)return;const n=Math.min(hiveN(y),YARD.store-stTot(y));if(n<=0){if(hiveN(y))toast(L('Амбар полон — испеки что-нибудь в печи','The barn is full — bake something first'));return;}
  const w=Math.round((yNow()-y.ht)/1000);y.st.med=(y.st.med||0)+n;y.ht=yNow();yTouch();save();SND.coin();yEv('honey','med',{w:w});toast(HONEY.name+': +'+n);}
function yBake(k){const y=Y();if(!y||y.ov||!DISHES[k]||!canBake(y,k))return;const D=DISHES[k];if((y.d[k]||0)>=YARD.dishCap){toast(L('Этого блюда и так полно','You have plenty of that dish'));return;}
  for(const i in D.need)y.st[i]-=D.need[i];y.ov={k:k,t:yNow(),d:(y.c.b?D.t:YARD.firstBake)*1000};y.c.b=(y.c.b||0)+1;yTouch();save();SND.click();yEv('bake',k);}
function yTake(){const y=Y();if(!y||!y.ov||ovLeft(y)>0)return;const k=y.ov.k;y.d[k]=Math.min(YARD.dishCap,(y.d[k]||0)+1);y.ov=null;if(!y.bag||!y.d[y.bag])y.bag=k;yTouch();save();SND.chest();yEv('take',k);
  toast(DISHES[k].name+L(' — в узелке!',' — packed!'));}
function yBuyPlot(){const y=Y();if(!y)return;const i=y.pl.length,c=YARD.plots[i];if(c==null||S.gold<c)return;S.gold-=c;STAT.ev('spend',{k:'yard:plot'+(i+1),c:c});y.pl.push(null);yTouch();save();SND.chest();setGold();yEv('buy','plot'+(i+1));toast(L('Новая грядка!','New bed!'));}
function yBuyHive(){const y=Y();if(!y||y.hv||S.gold<YARD.hive)return;S.gold-=YARD.hive;STAT.ev('spend',{k:'yard:hive',c:YARD.hive});y.hv=1;y.ht=yNow();yTouch();save();SND.chest();setGold();yEv('buy','hive');toast(L('Улей поставлен — мёд через ','Hive set up — honey in ')+YARD.hiveH+L(' ч',' h'));}
function yAdLeft(y){return y.ad.day===dayKey()?Math.max(0,YARD.adDay-(y.ad.n||0)):YARD.adDay;}
function yBakeNow(){const y=Y();if(!y||!y.ov||ovLeft(y)<=0)return false;y.ov.d=Math.max(0,yNow()-y.ov.t);const dk=dayKey();y.ad={day:dk,n:(y.ad.day===dk?y.ad.n||0:0)+1};y.c.r=(y.c.r||0)+1;yTouch();save();yEv('adbake',y.ov.k);return true;}
function yBag(k){const y=Y();if(!y)return;y.bag=k&&DISHES[k]?k:'';yTouch();save();SND.click();yEv('bag',y.bag||'-');}

/* ---------- бабушка: обучение ≤ 20 с (семена репы → посадить) ---------- */
function yardIntro(){const y=Y();if(!y||y.in||!yardOpen())return;if($('modal').classList.contains('on')||document.body.classList.contains('run'))return;
  yEv('intro','show');STAT.screen('yard_in');
  showModal('<h3>'+L('Бабушка','Granny')+'</h3><div class="card"><div class="row"><img class="ic" src="'+ic('m_babka',120)+'" style="width:64px;height:64px"><div class="t"><b>'+L('«Внучек, держи семена репы!»','“Here, dear — turnip seeds!”')+'</b><span>'+
    L('Посади на грядке — к следующему походу испечём пирожок в дорогу. С ним в бою здоровья больше.','Plant them in the bed — by your next run we’ll bake a pie for the road. It gives you more health in battle.')+'</span></div></div></div>'+
    '<div class="btns"><button class="btn big" id="yInGo">'+L('🌱 Посадить репу','🌱 Plant turnips')+'</button></div>','yard');
  on('yInGo',()=>{y.in=1;yPlant(0,'repa');yEv('intro','ok');openYard(1);});}

/* ---------- экран подворья (окно) ---------- */
let yardT=0;
function yTip(y){const ripe=ripeN(y);
  if(y.c.h===0&&y.pl[0]&&plotLeft(y.pl[0])>0)return L('Репа поспеет через '+fmtLeft(plotLeft(y.pl[0]))+'. Пока сходи в поход — вернёшься, соберёшь.','The turnips will be ready in '+fmtLeft(plotLeft(y.pl[0]))+'. Go on a run meanwhile — collect them when you’re back.');
  if(ripe)return L('Урожай поспел — собирай!','The harvest is ready — collect it!');
  if(y.ov&&ovLeft(y)<=0)return L('В печи готово — доставай!','The oven is done — take it out!');
  if(!y.ov&&!y.c.b&&canBake(y,'pie'))return L('Репа есть — испеки пирожок: +15% здоровья в следующем походе.','You have turnips — bake a pie: +15% health on your next run.');
  if(y.bag&&y.d[y.bag])return L('Узелок собран: '+DISHES[y.bag].name+' пойдёт с тобой в следующий поход по главе.','Your bundle is packed: '+DISHES[y.bag].name+' goes with you on your next chapter run.');
  if(y.pl.some(p=>!p))return L('Грядка свободна — посади что-нибудь.','A bed is free — plant something.');
  return L('Всё растёт. Загляни попозже — бабушка ждёт.','Everything is growing. Come back later — Granny is waiting.');}
const ySec=t=>'<div style="font-weight:900;font-size:18px;margin:14px 4px 6px">'+t+'</div>';
function yardHTML(y){const now=yNow();let h='<h3>'+L('🌱 Подворье','🌱 Homestead')+'</h3><canvas id="yardC" style="width:100%;height:170px;display:block;border-radius:12px"></canvas>'+
  '<div class="card"><div class="row"><img class="ic" src="'+ic('m_babka',96)+'"><div class="t"><span style="font-size:15px;color:inherit" id="yTip">'+yTip(y)+'</span></div></div></div>';
  // грядки
  h+=ySec(L('Огород','Garden'));
  y.pl.forEach((p,i)=>{h+='<div class="card"><div class="row">';
    if(!p){h+='<img class="ic" src="'+ic('m_bed',96)+'"><div class="t"><b>'+L('Грядка ','Bed ')+(i+1)+L(' — пусто',' — empty')+'</b><span>'+L('Что посадим?','What shall we plant?')+'</span></div></div><div class="btns" style="flex-direction:row;flex-wrap:wrap">'+
      Object.keys(CROPS).map(k=>'<button class="btn ghost" style="flex:1;min-width:88px;display:flex;flex-direction:column;align-items:center;padding:6px 4px;line-height:1.15" data-yp="'+i+':'+k+'"><img src="'+ic(CROPS[k].ic,48)+'" width="28" height="28">'+CROPS[k].name+'<span style="font-size:14px;opacity:.8">'+fmtLeft((y.c.p||k!=='repa'?CROPS[k].t:YARD.first)*1000)+'</span></button>').join('')+'</div></div>';return;}
    const cr=CROPS[p.c],left=plotLeft(p);
    h+='<img class="ic" src="'+ic(left>0?'m_sprout':cr.ic,96)+'"><div class="t"><b>'+cr.name+'</b><span data-yl="p'+i+'">'+(left>0?L('поспеет через ','ready in ')+fmtLeft(left):L('поспела! урожай: ','ready! yield: ')+cr.n)+'</span>'+
      '<div class="bar"><i data-yb="p'+i+'" style="width:'+Math.round(Math.min(1,(now-p.t)/p.d)*100)+'%"></i></div></div>'+
      (left>0?'':'<button class="btn gold" data-yh="'+i+'">'+L('Собрать','Collect')+'</button>')+'</div></div>';});
  const nc=YARD.plots[y.pl.length];
  if(nc!=null)h+='<div class="card"><div class="row"><img class="ic" src="'+ic('m_bed',96)+'" style="opacity:.6"><div class="t"><b>'+L('Ещё грядка','One more bed')+'</b><span>'+L('Больше урожая — чаще с узелком.','More harvest — more runs with a bundle.')+'</span></div><button class="btn gold" id="yPlot" '+(S.gold<nc?'disabled':'')+'><img src="'+ic('coin',36)+'">'+fmtNum(nc)+'</button></div></div>';
  // пасека
  h+=ySec(L('Пасека','Apiary'))+'<div class="card"><div class="row"><img class="ic" src="'+ic('m_hive',96)+'"'+(y.hv?'':' style="opacity:.6"')+'><div class="t"><b>'+L('Улей','Beehive')+'</b><span data-yl="hv">'+
    (!y.hv?L('Мёд раз в '+YARD.hiveH+' ч — для медовика','Honey every '+YARD.hiveH+' h — for honey cake'):hiveN(y)?L('мёд готов: ','honey ready: ')+hiveN(y):L('мёд через ','honey in ')+fmtLeft(hiveLeft(y)))+'</span></div>'+
    (!y.hv?'<button class="btn gold" id="yHive" '+(S.gold<YARD.hive?'disabled':'')+'><img src="'+ic('coin',36)+'">'+fmtNum(YARD.hive)+'</button>':hiveN(y)?'<button class="btn gold" id="yHon">'+L('Собрать','Collect')+'</button>':'')+'</div></div>';
  // амбар
  const ks=Object.keys(CROPS).concat(['med']);
  h+='<div class="card" style="padding:8px 10px"><b style="font-size:15px">'+L('Амбар ','Barn ')+stTot(y)+' / '+YARD.store+'</b><div style="display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:4px;font-size:16px">'+
    ks.map(k=>'<span><img src="'+ic(ingIc(k),40)+'" width="24" height="24" style="vertical-align:middle"> '+(y.st[k]||0)+'</span>').join('')+'</div></div>';
  // печь
  h+=ySec(L('Печь','Oven'));
  if(y.ov){const D=DISHES[y.ov.k],left=ovLeft(y),al=yAdLeft(y);
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic('m_oven',96)+'"><div class="t"><b>'+D.name+'</b><span data-yl="ov">'+(left>0?L('испечётся через ','ready in ')+fmtLeft(left):L('готово!','done!'))+'</span><div class="bar"><i data-yb="ov" style="width:'+Math.round(Math.min(1,(now-y.ov.t)/Math.max(1,y.ov.d))*100)+'%"></i></div></div>'+
      (left>0?'':'<button class="btn gold" id="yTake">'+L('Достать','Take out')+'</button>')+'</div>'+
      (left>60e3&&al>0&&adOk()?'<div class="btns"><button class="btn ad" id="yAdBake">'+L('🎬 Испечь сразу за рекламу','🎬 Bake now for an ad')+' · '+al+'/'+YARD.adDay+'</button></div>':'')+'</div>';}
  else for(const k in DISHES){const D=DISHES[k],ok=canBake(y,k)&&(y.d[k]||0)<YARD.dishCap,need=Object.keys(D.need).map(i=>D.need[i]+'× '+ingName(i)).join(', ');
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic(D.ic,96)+'"><div class="t"><b>'+D.name+' <span style="display:inline;color:var(--cOk);font-size:14px">'+D.fxT+'</span></b><span>'+need+' · '+fmtLeft((y.c.b?D.t:YARD.firstBake)*1000)+'</span></div>'+
      '<button class="btn'+(ok?'':' ghost')+'" data-yk="'+k+'" '+(ok?'':'disabled')+'>'+L('Печь','Bake')+'</button></div></div>';}
  // узелок
  const has=Object.keys(DISHES).filter(k=>y.d[k]>0);
  h+=ySec(L('🧺 Узелок в дорогу','🧺 Bundle for the road'))+'<p class="sub">'+L('Одно блюдо на поход по главе (не в поход дня, неделю и сечу).','One dish per chapter run (not for Daily Run, Weekly Trial or Endless Battle).')+'</p>';
  if(!has.length)h+='<div class="card"><div class="row"><img class="ic" src="'+ic('m_bag',96)+'" style="opacity:.6"><div class="t"><span>'+L('Пусто — испеки что-нибудь в печи.','Empty — bake something in the oven.')+'</span></div></div></div>';
  else{h+='<div class="btns" style="flex-direction:row;flex-wrap:wrap">'+has.map(k=>'<button class="btn'+(y.bag===k?' gold':' ghost')+'" style="flex:1;min-width:120px" data-yg="'+k+'"><img src="'+ic(DISHES[k].ic,40)+'" width="24" height="24" style="vertical-align:middle"> '+DISHES[k].name+' ×'+y.d[k]+'</button>').join('')+
    '<button class="btn'+(!y.bag?' gold':' ghost')+'" style="flex:1;min-width:120px" data-yg="">'+L('Без узелка','No bundle')+'</button></div>';}
  h+='<div class="btns"><button class="btn big" id="yBack">'+L('Назад','Back')+'</button></div>';return h;}
function openYard(fromIntro){const y=Y();if(!y)return;if(!y.in){yardIntro();return;}STAT.screen('yard');
  const keep=$('modal').classList.contains('on')&&$('mBody').getAttribute('data-w')==='yard'?$('mBody').scrollTop:0;
  showModal(yardHTML(y),'yard');if(keep)$('mBody').scrollTop=keep;drawYard();
  const re=()=>openYard();
  on('yBack',closeYard);on('yPlot',()=>{yBuyPlot();re();});on('yHive',()=>{yBuyHive();re();});on('yHon',()=>{yHoney();re();});on('yTake',()=>{yTake();re();});
  for(const b of $('mBody').querySelectorAll('[data-yp]'))b.onclick=()=>{const a=b.dataset.yp.split(':');yPlant(+a[0],a[1]);re();};
  for(const b of $('mBody').querySelectorAll('[data-yh]'))b.onclick=()=>{yHarv(+b.dataset.yh);re();};
  for(const b of $('mBody').querySelectorAll('[data-yk]'))b.onclick=()=>{yBake(b.dataset.yk);re();};
  for(const b of $('mBody').querySelectorAll('[data-yg]'))b.onclick=()=>{yBag(b.dataset.yg);re();};
  onAd('yAdBake','bake',()=>{const k0=y.ov&&y.ov.k;showRewarded(()=>{if(yBakeNow()){SND.chest();}if(modalHas($('yBack')))re();},null,
    ()=>{const yy=Y();if(!yy||!yy.ov||yy.ov.k!==k0||!yBakeNow())return adLateGold(); /* upd0910: печь успела сама — золото */if(modalHas($('yBack')))re();else lateRe();return L('печь готова: ','oven is done: ')+DISHES[k0].name;});});
  clearInterval(yardT);yardT=setInterval(yardTick,1000);
  if(fromIntro)toast(L('Репа посажена! Поспеет через 2 мин','Turnips planted! Ready in 2 min'));}
function closeYard(){clearInterval(yardT);yardT=0;hideModal();if(typeof curTab!=='undefined'&&curTab==='Village'&&!G)try{renderVillage();}catch(e){}}
// раз в секунду: подписи времени и полоски; что-то созрело — перерисовать окно
function yardTick(){const y=Y();if(!y||!$('modal').classList.contains('on')||$('mBody').getAttribute('data-w')!=='yard'||!$('yBack')){clearInterval(yardT);yardT=0;return;}
  const now=yNow();let flip=false;
  y.pl.forEach((p,i)=>{if(!p)return;const l=plotLeft(p),el=$('mBody').querySelector('[data-yl="p'+i+'"]'),b=$('mBody').querySelector('[data-yb="p'+i+'"]');if(l<=0&&!$('mBody').querySelector('[data-yh="'+i+'"]'))flip=true;
    if(el&&l>0)el.textContent=L('поспеет через ','ready in ')+fmtLeft(l);if(b)b.style.width=Math.round(Math.min(1,(now-p.t)/p.d)*100)+'%';});
  if(y.ov){const l=ovLeft(y),el=$('mBody').querySelector('[data-yl="ov"]'),b=$('mBody').querySelector('[data-yb="ov"]');if(l<=0&&!$('yTake'))flip=true;if(el&&l>0)el.textContent=L('испечётся через ','ready in ')+fmtLeft(l);if(b)b.style.width=Math.round(Math.min(1,(now-y.ov.t)/Math.max(1,y.ov.d))*100)+'%';}
  if(y.hv){const el=$('mBody').querySelector('[data-yl="hv"]');if(hiveN(y)&&!$('yHon'))flip=true;else if(el&&!hiveN(y))el.textContent=L('мёд через ','honey in ')+fmtLeft(hiveLeft(y));}
  if(flip)openYard();}
// рисунок двора: небо, плетень, печь с бабушкой, грядки, улей (те же функции рисования, что у спрайтов)
function drawYard(){const c=$('yardC');if(!c)return;const y=Y();if(!y)return;const r=c.getBoundingClientRect(),W=r.width||320,H=r.height||170,d=Math.min(devicePixelRatio||1,2);
  c.width=W*d;c.height=H*d;const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';
  const sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#6ab8ff');sk.addColorStop(.36,'#cfeaff');sk.addColorStop(.37,'#8fcf6a');sk.addColorStop(1,'#5aa447');g.fillStyle=sk;g.fillRect(0,0,W,H);
  glow(g,W*.9,H*.1,28,'#fff2a8','#ffffff');
  for(let x=4;x<W;x+=14){rrect(g,x-3,H*.2,6,H*.2,2);g.fillStyle='#a8733d';g.fill();outline(g,'#a8733d',.8);} // плетень
  for(const yy of[H*.26,H*.33]){g.strokeStyle='#8a5a2e';g.lineWidth=2.4;g.beginPath();g.moveTo(0,yy);g.lineTo(W,yy);g.stroke();}
  const k=Math.min(1.25,H/170);
  metaArt(g,'m_oven',W*.13,H*.62,k*1.05);metaArt(g,'m_babka',W*.27,H*.72,k*.85);
  const n=y.pl.length,cols=n>2?2:n,x0=W*.47,dx=Math.min(W*.2,78*k),now=yNow();
  y.pl.forEach((p,i)=>{const cx=x0+(i%2)*dx+(n>2?0:dx*.0),cy=H*(n>2?(i<2?.52:.82):.68),s=k*(n>2?.85:1.05);metaArt(g,'m_bed',cx,cy,s);
    if(!p)return;const ripe=plotLeft(p)<=0,pr=Math.min(1,(now-p.t)/p.d);
    for(const ox of[-15,0,15])metaArt(g,ripe?CROPS[p.c].ic:'m_sprout',cx+ox*s,cy-3*s,s*(ripe?.75:.45+.4*pr));});
  if(y.hv)metaArt(g,'m_hive',W*.88,H*.66,k*.95);
  if(y.ov&&ovLeft(y)<=0)glow(g,W*.13,H*.66,22*k,'#ffd84a');
  const bag=y.bag&&y.d[y.bag];if(bag)metaArt(g,'m_bag',W*.34,H*.86,k*.75);}

/* ---------- крючки ---------- */
// деревня: карточка подворья сверху (под рисунком деревни) + обучение бабушки
function META_VIL(el){try{if(!YARD_ON||!el)return;const y=Y();if(!y||!yardOpen())return;
  const d=document.createElement('div');d.className='card'+(yardReady(y)||!y.in?' next':'');d.id='yardCard';
  d.innerHTML='<div class="row"><img class="ic" src="'+ic(y.in?'m_bed':'m_babka',96)+'"><div class="t"><b>'+L('🌱 Подворье','🌱 Homestead')+'</b><span>'+(y.in?yardStatus(y):L('Бабушка зовёт — у неё для тебя семена','Granny is calling — she has seeds for you'))+'</span></div><button class="btn gold" id="yardGo">'+L('Открыть','Open')+'</button></div>';
  const cv=el.querySelector('#village');if(cv&&cv.nextSibling)el.insertBefore(d,cv.nextSibling);else el.appendChild(d);
  on('yardGo',()=>openYard());
  if(!y.in)setTimeout(()=>{if(curTab==='Village'&&!G)yardIntro();},500);}catch(e){metaErr('vil',e);}}
// «Дела на сегодня»
function META_TODAY(TL){try{if(!YARD_ON)return;const y=Y();if(!y||!yardOpen())return;
  TL.push({k:'yard',ic:y.in?'m_bed':'m_babka',t:L('Подворье','Homestead'),s:y.in?yardStatus(y):L('Бабушка зовёт — у неё для тебя семена','Granny is calling — she has seeds for you'),ready:!y.in||ripeN(y)>0||hiveN(y)>0||!!(y.ov&&ovLeft(y)<=0),b:L('Открыть','Open'),always:1,fn:()=>{hideModal();openYard();}});}catch(e){metaErr('today',e);}}
// начало похода: узелок (только главы, не первый поход); STAT bag — для сравнения «с узелком / без»
function META_RUN(G){try{if(!YARD_ON||!G)return;const y=Y();if(!y||!y.in)return;if(G.endless||G.daily||G.weekly||G.first)return;
  let k='';if(y.bag&&y.d[y.bag]>0){k=y.bag;y.d[k]--;yTouch();save();}
  try{STAT.ev('bag',{k:k||'-',n:y.c.b||0});}catch(e){}
  if(!k)return;const D=DISHES[k],hp0=G.hero.hp,lock=G.hpLock===hp0;G.bag=k;if(D.fx.rr)G.rerolls+=D.fx.rr;computeStats();if(lock)G.hpLock=G.hero.hp;
  banner('🧺 '+D.name,D.fxT,2);}catch(e){metaErr('run',e);}}
// характеристики богатыря в походе (computeStats): бонус блюда из узелка
function META_ST(st){if(!G||!G.bag)return;const D=DISHES[G.bag];if(!D)return;const f=D.fx;
  if(f.hp)st.maxHp*=1+f.hp;if(f.spd)st.spd*=1+f.spd;if(f.might)st.might*=1+f.might;if(f.xp)st.xp*=1+f.xp;}

/* ---------- для проверки на своей машине: META.skip(сек) — «прошло время» ---------- */
const META={on:YARD_ON,get ab(){return YARD_AB;},open:openYard,intro:yardIntro,
  skip(sec){if(!LOCAL)return;const y=Y();if(!y)return;const ms=sec*1000;for(const p of y.pl)if(p)p.t-=ms;if(y.ov)y.ov.t-=ms;if(y.hv)y.ht-=ms;save();}};
