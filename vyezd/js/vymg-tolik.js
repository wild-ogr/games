/* vy-mg0 — входы мини-игр и мастерская Толика (js/vymg-tolik.js). План: 05-minigames.md §4, 00-plan.md п.4.
   1) «Перекур у Толика» — карточка в окне победы (winSlots, zone 'extra'): раз в 3–4 двора (по очереди), первый раз — на 4-м дворе; одна кнопка «Сыграть»,
      пропуск — обычная «Дальше» окна. Не в задании дня, не после босса, не когда следом межэкранная (G.adNext), не больше VYMG.RW.pk Перекуров с наградой в день.
      Новая игра открылась на этой победе — карточка «Новая затея!» с ней (src 'new'). Новая машина — карточка «Фото у новой машины» (src 'auto') вместо Перекура.
   2) «Затея дня» — плитка в ленте «Сегодня» (homeSlots feed) и на карте (mapSlots top); VYMG.today() — для CAR.
   3) Мастерская Толика — экран 'tolik' (UI.screen): сборка «Москвич» → «Победа» → «Чайка» (следующая деталь видна), Затея дня, полка игр (тренировка без наград).
      Вход — окно Толика в пятиэтажке (homeSlots zone 'win'), плитка на карте.
   STAT: mg {a:'show'|'skip', id, m:src, l:двор}; screen 'tolik'. */
(function(){if(typeof VYMG==='undefined'||!window.UI)return;
const L0=(r,e)=>typeof L==='function'?L(r,e):r,E=VYMG.esc;
const SKIP=['foto'];   // не для Перекура: Фото — только при новой машине
let pend=null,lastNew=0;
function z(){return VYMG.Z();}
/* ---------- после каждого двора: счётчик побед до Перекура, открытие новой игры ---------- */
yardHook.push({id:'vymg',fn:info=>{if(!info||!info.ok||info.daily)return;const Z=z();Z.pw=(Z.pw|0)+1;lastNew=VYMG.unlock();VYMG.touch();}});
function perekurDue(ctx){const Z=z(),RW=VYMG.RW;if(ctx.daily||ctx.regionDone)return false;if(typeof G!=='undefined'&&G&&G.adNext)return false;
  if(Z.d.pk>=RW.pk)return false;if(VYMG.yards()<RW.first)return false;return Z.pw>=RW.every[(Z.pc|0)%RW.every.length];}
function pickGame(){const l=VYMG.openList().filter(g=>SKIP.indexOf(g.id)<0),Z=z();if(!l.length)return null;
  const fresh=l.filter(g=>!Z.d.p[g.num]);const a=fresh.length?fresh:l;a.sort((p,q)=>(Z.n[p.num]|0)-(Z.n[q.num]|0)||p.num-q.num);return a[0];}
function cardH(g,kind){const ci=VYMG.carInfo(),Z=z(),paid=kind!=='foto'||true;
  const t=kind==='new'?L0('🆕 Новая затея у Толика!','🆕 A new game at Tolik’s!'):kind==='foto'?L0('📷 Валерка: «Сфотографируемся с новой машиной?»','📷 Valerka: “Photo with the new car?”'):L0('☕ Перекур у Толика','☕ A break at Tolik’s');
  const rw=Z.d.pt<VYMG.RW.pt&&!ci.done?'🔩 '+L0('деталь №'+ci.k+' — '+ci.part,'part #'+ci.k+' — '+ci.part):'💰 '+L0('до +15','up to +15');
  return '<div class="vy0-pk"><span class="vy0-pkav">'+VYMG.face(kind==='foto'?'valerka':'tolik','happy')+'</span><span class="vy0-pkb"><b>'+t+'<span class="vy0-pkn"> · '+E(g.n)+'</span></b><small>'+g.ic+' '+E(g.n)+' · ~40 '+L0('с','s')+' · '+E(rw)+'</small></span>'+
    '<button class="btn sec sm noenter vy0-pkgo">'+(kind==='foto'?L0('📷 Снять','📷 Snap'):L0('Сыграть','Play'))+'</button></div>';}
winSlots.push({id:'vymg-perekur',order:5,zone:'extra',fit:0,render(ctx){pend=null;try{
  if(ctx.daily)return null;let g=null,kind='';
  if(ctx.newCar){const f=VYMG.REG.by.foto;if(f&&VYMG.isOpen(VYMG.IDS.foto)){g=f;kind='foto';}}
  else if(lastNew&&!ctx.regionDone&&!(typeof G!=='undefined'&&G&&G.adNext)){g=VYMG.REG.by[VYMG.INFO[lastNew].id];kind='new';}
  else if(perekurDue(ctx)){g=pickGame();kind='perekur';}
  if(!g)return null;const mi=ctx.newCar&&typeof MODELS!=='undefined'?MODELS.indexOf(ctx.newCar):-1;
  pend={id:g.id,kind,src:kind==='foto'?'auto':kind==='new'?'new':'win',idx:ctx.idx,car:mi,name:ctx.newCar?ctx.newCar.name:'',t:Date.now(),shown:0};
  return cardH(g,kind);}catch(e){console.warn('vymg perekur',e);return null;}},
  mount(el){const p=pend;if(!p)return;const Z=z();if(!p.shown){p.shown=1;if(p.kind!=='foto'){Z.pw=0;Z.pc=(Z.pc|0)+1;}if(p.kind==='new')lastNew=0;VYMG.touch();try{save();}catch(e){}
      VYMG.ev({a:'show',id:p.id,m:p.src,l:p.idx+1});}
    setTimeout(()=>{const mo=document.getElementById('modal');if(mo&&mo.scrollHeight>mo.clientHeight+1){const c=el.querySelector('.vy0-pk');if(c)c.classList.add('sm');}},0);   // не влезает — карточка в одну строку (Перекур не убираем: это главный вход)
    const b=el.querySelector('.vy0-pkgo');if(b)b.onclick=()=>{if(pend!==p)return;pend=null;try{SND.tap();}catch(e){}launchFromWin(p);};}});
function launchFromWin(p){const nxt=p.idx+1;try{hideModal();}catch(e){}
  const goNext=()=>{try{VY.start(nxt);}catch(e){UI.go('map');}};
  VYMG_OPEN(p.id,{mode:p.src,ctx:p.car>=0?{car:p.car,name:p.name}:{},next:{t:L0('Следующий двор →','Next yard →'),f:goNext},back:()=>UI.go('map')});}
// пропуск: карточка была, а игрок ушёл дальше (новый двор, карта, главный)
function skipChk(){if(pend&&pend.shown&&!VYMG.busy){VYMG.ev({a:'skip',id:pend.id,m:pend.src,l:pend.idx+1});pend=null;}}
UI.on('yard-start',skipChk);UI.on('screen',n=>{if(n!=='game')skipChk();});

/* ---------- жетон «Толик подтолкнёт»: бесплатный эвакуатор в следующем обычном дворе (кнопка эвакуатора есть с 5-го двора; не в задании дня) ---------- */
UI.on('yard-start',o=>{try{const Z=z();if(!o||o.daily||o.idx<4||!(Z.tk>0)||typeof G==='undefined'||!G||G.towFree)return;G.towFree=1;G.vyTk=1;
  if(typeof updCoins==='function')updCoins();setTimeout(()=>{if(G&&G.vyTk&&G.towFree&&typeof toast==='function')toast(L0('🚚 Толик подтолкнёт: эвакуатор в этом дворе — бесплатно','🚚 Tolik’s push: the tow truck is free in this yard'),2600);},900);}catch(e){console.warn('vymg tk',e);}});
// жетон потрачен — когда бесплатный эвакуатор этого двора использован (итог двора приходит ровно раз)
yardHook.push({id:'vymg-tk',fn:()=>{try{if(typeof G==='undefined'||!G||!G.vyTk)return;G.vyTk=0;if(G.towFree)return;const Z=z();if(Z.tk>0){Z.tk--;Z.tu=(Z.tu|0)+1;VYMG.touch();save();VYMG.ev({a:'tku',k:Z.tk});}}catch(e){}}});

/* ---------- Затея дня ---------- */
function today(){const id=VYMG.dayId();if(!id)return null;const g=VYMG.REG.by[id],Z=z();
  return {id,n:g.n,ic:g.ic,who:g.who,done:!!Z.d.z,rw:!Z.d.z,play:back=>openDay(back)};}
function openDay(back){const t=today();if(!t)return;VYMG.ev({a:'show',id:t.id,m:'day'});
  VYMG_OPEN(t.id,{mode:t.done?'cab':'day',back:back||(()=>UI.go(UI.cur==='tolik'?'tolik':'map'))});}
VYMG.today=today;VYMG.openDay=openDay;
const dayTile=()=>{const t=today();if(!t)return null;return UI.tile({ic:t.ic,t:L0('Затея дня: ','Game of the day: ')+t.n,s:t.done?L0('сыграно ✓ — завтра новая','done ✓ — new one tomorrow'):L0('🔩 деталь для «Москвича» · ~1 мин','🔩 a car part · ~1 min'),tag:t.done?'':'🔩',cls:'vy0-day'+(t.done?' done':'')});};
homeSlots.push({id:'vymg-day',order:40,zone:'feed',render:dayTile,mount(el){const b=el.querySelector('button');if(b)b.onclick=()=>openDay();}});
homeSlots.push({id:'vymg-tolik',order:30,zone:'win',render(){if(!VYMG.openList().length)return null;const c=VYMG.carInfo();
  return {who:'tolik',t:L0('Мастерская Толика','Tolik’s workshop'),s:c.done?L0('все машины собраны','all cars built'):c.n+' '+c.have+'/'+c.need,badge:z().d.pt<VYMG.RW.pt?'🔩':'',go:'tolik'};}});
mapSlots.push({id:'vymg-map',order:30,zone:'top',render(){if(!VYMG.openList().length)return null;const c=VYMG.carInfo(),t=today();
    return '<div class="vy0-mrow">'+(t?UI.tile({ic:t.ic,t:L0('Затея дня','Game of the day'),s:t.done?L0('сыграно ✓','done ✓'):t.n+' · 🔩',cls:'vy0-day'+(t.done?' done':'')}):'')+
      UI.tile({ic:'🔧',t:L0('Мастерская Толика','Tolik’s workshop'),s:c.done?L0('всё собрано','all built'):c.n+' '+c.have+'/'+c.need,prog:c.done?null:[c.have,c.need],cls:'vy0-ws'})+'</div>';},
  mount(el){const b=el.querySelectorAll('button');if(today()&&b[0])b[0].onclick=()=>openDay();const w=b[b.length-1];if(w)w.onclick=()=>UI.go('tolik');}});

/* ---------- экран «Мастерская Толика» ---------- */
let sec=null;
function carCanvas(cv,ci){const r=cv.getBoundingClientRect(),W=r.width||300,H=r.height||150,d=Math.min(2,window.devicePixelRatio||1);cv.width=W*d;cv.height=H*d;const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);
  const c=VYMG.CARS[Math.min(ci.i,VYMG.CARS.length-1)]||VYMG.CARS[0],w=Math.min(W*.86,H*2.3),o={cx:W/2,by:H-10,w,col:c.col,kind:c.id==='moskvich'?'sedan':'old'};
  x.save();x.globalAlpha=.16;VYMG.art.car(x,Object.assign({},o,{col:'#7d8796'}));x.restore();
  const p=ci.done?1:ci.have/ci.need;if(p>0){x.save();x.beginPath();x.rect(0,0,W/2-w*.55+w*1.1*p,H);x.clip();VYMG.art.car(x,o);x.restore();}
  if(!ci.done&&p<1){const gx=W/2-w*.55+w*1.1*p;x.strokeStyle='#f2a900';x.setLineDash([5,4]);x.lineWidth=2;x.beginPath();x.moveTo(gx,6);x.lineTo(gx,H-4);x.stroke();}}
function cabHtml(){const ci=VYMG.carInfo(),Z=z(),t=today(),RW=VYMG.RW,c=VYMG.CARS[Math.min(ci.i||0,VYMG.CARS.length-1)];
  let parts='';if(!ci.done)c.parts.forEach((p,i)=>{parts+='<i class="'+(i<ci.have?'ok':i===ci.have?'cur':'')+'" title="'+E(VYMG.partN(p))+'">'+(i<ci.have?'✓':i+1)+'</i>';});
  const built=VYMG.built().map(id=>VYMG.CARS.find(x=>x.id===id)).filter(Boolean);
  const games=Object.keys(VYMG.INFO).map(n=>+n).filter(n=>VYMG.REG.by[VYMG.INFO[n].id]).map(n=>{const i=VYMG.INFO[n],op=VYMG.isOpen(n);
    return '<button class="vy0-g'+(op?'':' lock')+'" data-n="'+n+'"'+(op?'':' disabled')+'><span class="vy0-gi">'+(op?i.ic:'🔒')+'</span><b>'+E(typeof LANG!=='undefined'&&LANG==='en'&&i.en?i.en:i.n)+'</b><small>'+E(op?(Z.b[n]?L0('рекорд ','best ')+Z.b[n]:VYMG.REG.by[i.id].a):VYMG.lockTxt(n))+'</small></button>';}).join('');
  return '<header class="vy0-ch"><button class="vy0-back" aria-label="'+L0('Назад','Back')+'">←</button><b>🔧 '+L0('Мастерская Толика','Tolik’s workshop')+'</b><span class="pill">💰 '+(+S.coins||0)+'</span></header>'+
   '<div class="vy0-cb">'+VYMG.say('tolik',ci.done?L0('Все машины собраны — золотые руки! Заходи на перекур, детали пригодятся.','All cars are built — golden hands! Drop by anyway.'):
      L0('Собираем '+E(ci.n)+'! Детали даю за мини-игры: Перекур в окне победы и Затею дня — до '+RW.pt+' в день. Соберём — машина твоя.','We’re building the '+E(ci.n)+'! I give parts for mini-games — up to '+RW.pt+' a day.'),'happy')+
   '<div class="vy0-car"><canvas class="vy0-ccv"></canvas><div class="vy0-cn"><b>'+(ci.done?L0('Всё собрано!','All built!'):E(ci.n)+' '+ci.have+'/'+ci.need)+'</b>'+
     (ci.done?'':'<small>'+L0('Следующая деталь: №'+ci.k+' — ','Next part: #'+ci.k+' — ')+E(ci.part)+(Z.d.pt>=RW.pt?L0(' (завтра — сегодня уже '+RW.pt+')',' (tomorrow)'):'')+'</small>')+'</div>'+
     (parts?'<div class="vy0-parts">'+parts+'</div>':'')+(built.length?'<p class="vy0-built">🏆 '+L0('Собрано: ','Built: ')+built.map(b=>E(VYMG.carN(b))).join(', ')+'</p>':'')+'</div>'+
   (t?'<div class="vy0-dayc"><span class="vy0-gi">'+t.ic+'</span><span><b>'+L0('Затея дня: ','Game of the day: ')+E(t.n)+'</b><small>'+(t.done?L0('сыграно ✓ — завтра новая','done ✓ — new tomorrow'):L0('одна раскладка на всех · 🔩 деталь с первой звезды','same for everyone · 🔩 part from one star'))+'</small></span><button class="btn green vy0-dgo">'+(t.done?L0('Ещё раз','Again'):L0('Играть','Play'))+'</button></div>':'')+
   '<h3 class="vy0-h">'+L0('Полка игр — тренировка без наград','Game shelf — practice, no rewards')+'</h3><div class="vy0-shelf">'+games+'</div></div>';}
function openCab(){if(!sec){sec=document.createElement('section');sec.className='screen vy0-cab';sec.id='scr-tolik';(document.getElementById('app')||document.body).appendChild(sec);}
  try{if(typeof leaveYard==='function')leaveYard();}catch(e){}
  sec.innerHTML=cabHtml();UI.show('scr-tolik');try{STAT.screen('tolik');}catch(e){}
  sec.querySelector('.vy0-back').onclick=()=>{try{SND.tap();}catch(e){}UI.go('home')||UI.go('map');};
  const d=sec.querySelector('.vy0-dgo');if(d)d.onclick=()=>openDay(()=>openCab());
  sec.querySelectorAll('.vy0-g[data-n]').forEach(b=>b.onclick=()=>{try{SND.tap();}catch(e){}const n=+b.dataset.n;VYMG_OPEN(VYMG.INFO[n].id,{mode:'cab',back:()=>openCab()});});
  if(VYMG.pc()){let n=0;sec.querySelectorAll('.vy0-g[data-n]:not([disabled]) b').forEach(e=>{if(++n<=9)e.insertAdjacentHTML('beforeend',' <kbd class="vymg-kc vymg-kn">'+n+'</kbd>');});
    if(d)d.insertAdjacentHTML('beforeend',' <kbd class="vymg-kc vymg-kn">Enter</kbd>');
    sec.querySelector('.vy0-ch b').insertAdjacentHTML('afterend','<span class="vy0-khd">'+VYMG.kc('Esc')+' '+L0('назад','back')+' '+VYMG.kc('←↑→↓')+' '+L0('выбор','select')+' '+VYMG.kc('1–9')+' '+L0('игра','game')+'</span>');}
  requestAnimationFrame(()=>{const cv=sec.querySelector('.vy0-ccv');if(cv)carCanvas(cv,VYMG.carInfo());});}
/* клавиатура мастерской (ПК): Esc/Backspace — назад; стрелки — выбор (Затея дня и полка игр); Enter/Пробел — выбранная или Затея дня; 1–9 — игра с полки по порядку */
function cabBtns(){return sec?[...sec.querySelectorAll('.vy0-dgo,.vy0-g[data-n]:not([disabled])')]:[];}
document.addEventListener('keydown',e=>{if(UI.cur!=='tolik'||!sec||!sec.classList.contains('on')||VYMG.busy||(typeof modalOn!=='undefined'&&modalOn)||e.ctrlKey||e.metaKey||e.altKey)return;
  const k=e.key,bs=cabBtns();let i=bs.findIndex(b=>b.classList.contains('vy0-kf'));
  if(k==='Escape'||k==='Backspace'){e.preventDefault();if(!e.repeat)sec.querySelector('.vy0-back').click();return;}
  if(k==='Enter'||k===' '){e.preventDefault();if(e.repeat)return;const b=bs[i]||sec.querySelector('.vy0-dgo');if(b)b.click();return;}
  if(/^[1-9]$/.test(k)){const g=bs.filter(b=>b.classList.contains('vy0-g'))[+k-1];if(g){e.preventDefault();if(!e.repeat)g.click();}return;}
  if(/^Arrow/.test(k)&&bs.length){e.preventDefault();
    if(i<0)i=0;else{const r=bs[i].getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      if(k==='ArrowLeft'||k==='ArrowRight')i=(i+(k==='ArrowRight'?1:bs.length-1))%bs.length;
      else{let best=-1,bd=1e9;bs.forEach((b,j)=>{const q=b.getBoundingClientRect(),y=q.top+q.height/2,dy=k==='ArrowDown'?y-cy:cy-y;if(dy<8)return;const d=dy*3+Math.abs(q.left+q.width/2-cx);if(d<bd){bd=d;best=j;}});if(best>=0)i=best;}}
    bs.forEach(b=>b.classList.remove('vy0-kf'));bs[i].classList.add('vy0-kf');try{bs[i].focus({preventScroll:true});bs[i].scrollIntoView({block:'nearest'});}catch(x){}}});
UI.screen('tolik',openCab);VYMG.openCab=openCab;
// стенды: ?vymg=tolik — мастерская; ?vymg=perekur — окно победы с Перекуром (двор 8)
VYMG.stand.tolik=()=>openCab();
VYMG.stand.perekur=q=>{const Z=z();const n=+(q.get('lv')||8);S.unlocked=Math.max(S.unlocked||1,n);Z.pw=9;Z.d.pk=0;if(!Z.o[1])Z.o[1]=1;try{VY.start(n-1);}catch(e){return;}
  setTimeout(()=>{try{win();}catch(e){console.warn(e);}},400);};
})();
