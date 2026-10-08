'use strict';
/* ================= МЕТА «tour»: турнир «Соседние заставы», этап 1 — без сервера (SLAVA, 08.10.2026) =================
   План — release-i/oborona-boost/04-tournament.md п. 3 (этап 1); образец расчёта — «Соседки по подъезду» Зины (slovo/js/sosedki.js, release-i/zina/w-sosedki.md).
   Игрок и 7 соседних воевод — ПЕРСОНАЖЕЙ сказки (так и подписано в окне). Неделя — пн–вс по местному времени (weekNo; на Яндексе часы сервера nowMs).
   Очки игрока — недельная Слава (slWeekPts из meta-slava.js: все дела недели, до 400 в день). Очки соседа = цель × доля его недели к моменту t
   (по весам дней — характер, внутри дня 8:00–23:00), цель = темп игрока P × множитель соседа × разброс ±15 % × (1 + 0,1·ступень). Внутри недели под игрока не подстраивается.
   Темп P = 0,6·Слава прошлой недели (неполная — пересчёт на полную) + 0,4·прошлый P; пропустил неделю — P×0,6. Вход — с 5 уровней со звёздами (и 3 побед).
   7 ступеней лиги (Застава → … → Богатырская дружина): 1–2 место — ступень выше (знамя ступени на ворота, навсегда), 7–8 — ниже (с первой не падают).
   Награды (выдаются при открытии окна итогов, один раз; не открыл — выдаются сами при следующем итоге): 1 — 300+50·ст. золота, +20 мин ⏩, грамота;
   2 — 200+30·ст., +10 мин, грамота; 3 — 120+20·ст., +5 мин, грамота; 4–8 — 50 (если Славы за неделю ≥ 100). 3 недели в призёрах — «Соседский стяг».
   Босс недели (с кузницей, как было — решение владельца) — частью Славы (meta-slava) + отдельная строка «лучший бой» и живая строка таблицы Яндекса `weekly`.
   ЭТАП 2 (сервер hobby-cup) НЕ делаем: точка подключения — TOUR_SERVER (null) и tourOnline(); при включении живая лига заменит персонажей в tourTable.
   Сейв — только S.tour: {w: неделя, s: начало участия (мс), P: темп, tr: ступень 0–6, c: последняя забранная неделя, g:{1,2,3}: грамоты, pz: недель в призёрах,
     r:{w,pl,pts,tr0,tr1,gold,bo,lead,bn}: итог, ещё не забранный, ts}. Облако — TOUR_MERGE. Статистика: STAT.ev('cup',{a:'join'|'view'|'pass'|'res'|'claim'|'lb',…}). */
const TOUR_ON=!/[?&]notour/.test(location.search);
const TOUR_SERVER=null;  // этап 2: адрес/модуль hobby-cup (CUP). Пока null — только персонажи
function tourOnline(){return !!TOUR_SERVER&&typeof CUP!=='undefined';}
const TOUR={from:5,min:100,P0:1500,Pmin:300,Pmax:8000,tierK:.1,plate:3,part:50,
  prize:[{g:300,gt:50,bo:1200},{g:200,gt:30,bo:600},{g:120,gt:20,bo:300}]};
function tourErr(w,x){tourErr.n=(tourErr.n||0)+1;if(tourErr.n<=5)console.warn('meta tour '+w+': '+(x&&x.message||x));}
function tourEv(a,p){try{STAT.ev('cup',Object.assign({a:a},p||{}));}catch(e){}}

/* ---------- ступени лиги (те же, что будут на сервере: RULES['oborona'].tiers) ---------- */
const TOUR_TIERS=[
  {n:'Застава',en:'Outpost'},{n:'Острог',en:'Stockade'},{n:'Крепость',en:'Fortress'},{n:'Удельный кремль',en:'Princely Kremlin'},
  {n:'Стольный град',en:'Capital City'},{n:'Тридевятое царство',en:'Thrice-Nine Kingdom'},{n:'Богатырская дружина',en:'Bogatyr Host'}];
const TOUR_BN=[null,{c1:'#7a5a3a',c2:'#f2e2b0',em:[3,.5]},{c1:'#5a6a7a',c2:'#e8eef6',em:[4,.5]},{c1:'#2f6a3a',c2:'#ffd84a',em:[5,.45]},
  {c1:'#8a1a2a',c2:'#ffd84a',em:[6,.5]},{c1:'#3a2a6a',c2:'#ffd84a',em:[8,.55]},{c1:'#b8862a',c2:'#8a1616',em:[12,.75]}];
TOUR_BN.forEach((b,i)=>{if(b&&typeof xbnAdd==='function')xbnAdd(Object.assign({id:'lg'+i,n:'Знамя ступени «'+TOUR_TIERS[i].n+'»',en:'“'+TOUR_TIERS[i].en+'” tier banner'},b));});
if(typeof xbnAdd==='function')xbnAdd({id:'sosed',n:'Соседский стяг',en:'Neighbours’ standard',c1:'#c0392b',c2:'#ffffff',em:[0,1]});
function tourTierN(i){const T=TOUR_TIERS[Math.max(0,Math.min(6,i|0))];return Lg(T.n,T.en);}

/* ---------- соседи: 7 воевод-персонажей. m — доля темпа игрока, d — веса дней пн…вс (характер) ---------- */
const TOUR_NB=[
  {n:'Воевода Ратибор',en:'Commander Ratibor',z:'Калинов мост',ze:'Kalinov Bridge',m:1.3,d:[1.9,1.3,1,.9,.8,.6,.5],t:'С понедельника — в дозор!',te:'On patrol from Monday!',
    h:{body:'#5a6a8a',cloak:'#8a1a2a',skin:'#eec39c',beard:'#5a3a22',hat:'helm',helm:'#c2ccd8',rim:'#e6b53a',belt:'#3a2a1a',boots:'#3a2416'}},
  {n:'Боярыня Марфа',en:'Boyarynya Marfa',z:'Белый камень',ze:'White Stone',m:1.1,d:[.5,.6,.7,.8,1,1.9,2],g:'f',t:'Всю неделю в хлопотах, зато в выходные — держись!',te:'Busy all week, but watch out on weekends!',
    h:{body:'#8a1a4a',cloak:'#c0392b',skin:'#f8d4b4',hair:'#4a2a1a',braid:1,hat:'kokosh',kok:'#e6b53a',belt:'#e6b53a',boots:'#5a1a2a'}},
  {n:'Дед Пахом',en:'Grandpa Pakhom',z:'Лесная засека',ze:'Forest Abatis',m:.95,d:[1,1,1,1,1,1,1],t:'Понемногу, но каждый день.',te:'A little, but every day.',
    h:{body:'#7a8a5a',skin:'#eec39c',beard:'#e8e4dc',long:1,hat:'felt',cap:'#5a4a3a',belt:'#8a5a2e',boots:'#4a3a2a'}},
  {n:'Атаманша Василиса',en:'Atamansha Vasilisa',z:'Ковыльная степь',ze:'Feather-Grass Steppe',m:.8,d:[.6,.6,.7,.8,2.4,1,.7],g:'f',t:'В пятницу — лихой набег.',te:'A daring raid every Friday.',
    h:{body:'#2d6fd6',skin:'#f6cfaa',hair:'#c86a2a',braid:1,hat:'cap',cap:'#c0392b',fur:'#5a3a22',belt:'#e6b53a',boots:'#3a2a2a'}},
  {n:'Микула-кузнец',en:'Mikula the Smith',z:'Медная гора',ze:'Copper Mountain',m:.65,d:[1.2,1.2,1.2,1.2,1.2,.4,.3],t:'Днём — в кузне, в выходные — отдыхает.',te:'Forging on weekdays, resting on weekends.',
    h:{body:'#c86a2a',skin:'#eec39c',beard:'#3b2819',hat:'felt',cap:'#3a3a44',belt:'#5a3a1a',boots:'#3a2a1a',big:1}},
  {n:'Звонарь Ерёма',en:'Yeryoma the Bell-ringer',z:'Колокольный острог',ze:'Bell Fort',m:.45,d:[.8,1.4,.6,1.4,.6,1,.6],t:'Звонит через день — и воюет так же.',te:'Rings every other day — and fights the same way.',
    h:{body:'#e8e0c8',skin:'#f4c9a3',hair:'#c8964a',messy:1,belt:'#c0392b',boots:'#6a4a2a'}},
  {n:'Кот Баюн',en:'Bayun the Cat',z:'Лукоморье',ze:'Lukomorye',m:.25,d:[1,1,1,1,1,1,1],t:'Кот. Больше спит, чем воюет.',te:'A cat. Sleeps more than he fights.',art:'kot'}];
TOUR_NB.forEach((b,i)=>{if(b.h)art('tour_nb'+i,66,g=>{g.translate(0,3);drawHero(g,b.h,0);});});
function tourFace(i){const b=TOUR_NB[i];return ic(b.art||'tour_nb'+i,64);}
function tourNbName(i){const b=TOUR_NB[i];return Lg(b.n,b.en);}

/* ---------- расчёт (как у Зины) ---------- */
function tourRnd(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return (h>>>0)/4294967296;}
// начало недели w (пн 00:00 местного) — weekNo считает недели от местной даты
function tourStart(w){const d=new Date((w*7-3)*864e5);return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()).getTime();}
function tourDays(w,i){return TOUR_NB[i].d.map((x,j)=>{const r=tourRnd(w+':'+i+':'+j);return r<.1?0:x*(.6+.8*r);});}
function tourCum(w,i,t){const st=tourStart(w),en=tourStart(w+1);if(t<=st)return 0;if(t>=en)return 1;
  const ds=tourDays(w,i),sum=ds.reduce((a,b)=>a+b,0)||1,d=new Date(t),j=Math.min(6,Math.floor((t-st)/864e5)),h=d.getHours()+d.getMinutes()/60;
  let c=0;for(let k=0;k<j;k++)c+=ds[k];c+=ds[j]*Math.min(1,Math.max(0,(h-8)/15));return Math.min(1,c/sum);}
function tourGoal(o,i){return Math.max(3,Math.round(o.P*TOUR_NB[i].m*(.85+.3*tourRnd(o.w+':T'+i))*(1+TOUR.tierK*(o.tr|0))));}
function tourNb(o,i,t){return Math.max(0,Math.floor(tourGoal(o,i)*(tourCum(o.w,i,t)-tourCum(o.w,i,o.s))));}
function tourPts(o){return typeof slWeekPts==='function'?slWeekPts(o.w):0;}
// таблица: [{i (-1 — игрок), pts}], по убыванию; при равенстве игрок выше
function tourTable(o,t){const rows=TOUR_NB.map((x,i)=>({i:i,pts:tourNb(o,i,t)}));rows.push({i:-1,pts:tourPts(o)});
  return rows.sort((a,b)=>b.pts-a.pts||(a.i<0?-1:b.i<0?1:a.i-b.i));}
const tourPlace=tb=>tb.findIndex(r=>r.i<0)+1;
function tourLvls(){let n=0;for(const k in S.stars)if(S.stars[k]&&/^\d+-\d+$/.test(k))n++;return n;}
function tourCanJoin(){return TOUR_ON&&!SHOT&&(S.wins|0)>=3&&tourLvls()>=TOUR.from&&typeof SL==='function'&&!!SL();}
const tourO=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
let tourLast=null;  // что видели в прошлый раз (для «+очки, кого обогнал») — только в памяти

/* ---------- неделя: создать, подвести итог прошлой ---------- */
function tourTick(){try{if(!tourCanJoin())return null;const w=weekNo(),now=nowMs();let o=S.tour,ch=false;
  if(!tourO(o)){o=S.tour={w:w,s:now,P:TOUR.P0,tr:0,c:0,g:{},pz:0,ts:0};ch=true;tourEv('join',{tr:0,w:w});}
  if(+o.w<w){tourRoll(o,w,now);ch=true;}
  if(ch){o.ts=Date.now();save();}return o;}catch(e){tourErr('tick',e);return null;}}
function tourRoll(o,w,now){const end=tourStart(+o.w+1),pts=tourPts(o),tb=tourTable(o,end),pl=tourPlace(tb),tr0=o.tr|0;
  if(tourPend(o))tourGive(o,true);   // старый итог так и не открыли — награда всё равно твоя
  if(pts>=TOUR.min){let tr1=tr0;if(pl<=2)tr1=Math.min(6,tr0+1);else if(pl>=7)tr1=Math.max(0,tr0-1);
    const P=TOUR.prize[pl-1],gold=P?P.g+P.gt*tr0:TOUR.part,bo=P?P.bo:0,bn=tr1>tr0&&typeof xbnOwn==='function'&&!xbnOwn('lg'+tr1)?'lg'+tr1:'';
    o.r={w:+o.w,pl:pl,pts:pts,tr0:tr0,tr1:tr1,gold:gold,bo:bo,lead:tb[0].i,bn:bn};o.tr=tr1;o.g=tourO(o.g)?o.g:{};if(pl<=3){o.g[pl]=(+o.g[pl]||0)+1;o.pz=(o.pz|0)+1;}}
  else if(o.r&&+o.r.w<=(+o.c||0))delete o.r;
  tourEv('res',{w:+o.w,pl:pl,pts:pts,P:o.P,tr0:tr0,tr1:o.tr,gap:+o.w===w-1?0:1});
  // темп: прошлая неделя целиком (неполная — пересчёт на полную); пропустил — соседи «сбавили»
  const f=Math.max(.25,Math.min(1,(end-Math.max(+o.s||0,tourStart(+o.w)))/(7*864e5)));let P=+o.P||TOUR.P0;P=+o.w===w-1?.6*pts/f+.4*P:.6*P;
  o.P=Math.round(Math.min(TOUR.Pmax,Math.max(TOUR.Pmin,P)));o.w=w;o.s=now;tourLast=null;}
const tourPend=o=>!!(o&&tourO(o.r)&&+o.r.w>(+o.c||0));
// выдать награду итога (золото, ускорение, знамя ступени, «Соседский стяг»); quiet — без окна (старый итог)
function tourGive(o,quiet){const r=o.r;if(!r)return null;o.c=Math.max(+o.c||0,+r.w);S.gold+=r.gold;ern('quest',r.gold);if(r.bo)boostAdd(r.bo);
  if(r.bn&&typeof xbnGive==='function')xbnGive(r.bn);let plate=false;if((o.pz|0)>=TOUR.plate&&typeof xbnOwn==='function'&&!xbnOwn('sosed')){xbnGive('sosed');plate=true;}
  tourEv('claim',{pl:r.pl,g:r.gold,auto:quiet?1:0});return {plate:plate};}
// облако: та же неделя — начало раньше, темп/ступень больше; новее неделя — главнее; забранное, грамоты, призёрство — максимум
function TOUR_MERGE(d,o){try{const b=d&&d.tour;if(!tourO(b))return;let a=tourO(o.tour)?o.tour:null;
  if(!a){o.tour=JSON.parse(JSON.stringify(b));return;}
  const c=Math.max(+a.c||0,+b.c||0),g={};for(const k of['1','2','3'])g[k]=Math.max(+(a.g||{})[k]||0,+(b.g||{})[k]||0);const pz=Math.max(+a.pz||0,+b.pz||0);
  const ra=a.r,rb=b.r;
  if(+b.w>+a.w)a=JSON.parse(JSON.stringify(b));
  else if(+b.w===+a.w){a=JSON.parse(JSON.stringify(a));a.s=Math.min(+a.s||nowMs(),+b.s||nowMs());a.P=Math.max(+a.P||0,+b.P||0)||TOUR.P0;a.tr=Math.max(+a.tr||0,+b.tr||0);}
  else a=JSON.parse(JSON.stringify(a));
  a.c=c;a.g=g;a.pz=pz;const r=[ra,rb].filter(x=>tourO(x)&&+x.w>c).sort((x,y)=>y.w-x.w)[0];if(r)a.r=JSON.parse(JSON.stringify(r));else delete a.r;
  o.tour=a;}catch(e){tourErr('merge',e);}}
function TOUR_FIX(s){s=s||S;if(s.tour!=null&&!tourO(s.tour))s.tour=null;const o=s.tour;if(!o)return;
  for(const k of['w','s','P','tr','c','pz','ts'])o[k]=typeof o[k]==='number'&&isFinite(o[k])?o[k]:0;o.tr=Math.max(0,Math.min(6,o.tr|0));if(!o.P)o.P=TOUR.P0;if(!tourO(o.g))o.g={};if(o.r!=null&&!tourO(o.r))delete o.r;}
TOUR_FIX(S);

/* ---------- тексты ---------- */
const tourPlTxt=n=>Lg(n+'-е место',n+(n===1?'st':n===2?'nd':n===3?'rd':'th')+' place');
const tourPlOn=n=>Lg(n+'-й',n+(n===1?'st':n===2?'nd':n===3?'rd':'th'));
function tourLeftTxt(){const ms=tourStart(weekNo()+1)-nowMs(),h=Math.max(0,Math.ceil(ms/3600e3));return h>=24?Math.floor(h/24)+Lg(' дн. ','d ')+(h%24)+Lg(' ч','h'):h+Lg(' ч','h');}
function tourWkBest(){const m=typeof wkMine==='function'?wkMine():null;if(!m||!m.best)return '';return fmtWeek(m.best);}

/* ---------- меню: плашка на карте (рядом со Славой) ---------- */
function tourMapBtn(){const o=tourTick();if(!o)return '';const pend=tourPend(o),tb=tourTable(o,nowMs()),pl=tourPlace(tb),pts=tourPts(o);tourLast={w:o.w,pts:pts,tb:tb};
  return '<button class="glbar mtile'+(pend?' hot':'')+'" id="tourGo"><img src="'+ic('tour_shield',64)+'" alt=""><span class="t"><b>'+(pend?Lg('🏆 Итоги!','🏆 Results!'):pts?tourPlTxt(pl):Lg('Соседи','Neighbours'))+'</b><small>'+(pend?Lg('забрать награду','collect the reward'):tourTierN(o.tr)+' · '+tourLeftTxt())+'</small></span></button>';}
function tourMapBind(){on('tourGo',()=>openTour('map'));}

/* ---------- окно итогов боя: строка (зовёт metaWIN из meta-slava) ---------- */
function tourWinHtml(G){const o=tourTick();if(!o)return '';
  if(!G.tourR){const tb=tourTable(o,nowMs()),pl=tourPlace(tb),pts=tourPts(o),L=tourLast&&tourLast.w===o.w?tourLast:null;let pass=-1;
    if(L){const was=L.tb.slice(0,L.tb.findIndex(x=>x.i<0)).map(x=>x.i),nw=tb.slice(pl).map(x=>x.i);const k=was.find(i=>nw.indexOf(i)>=0);if(k!=null)pass=k;}
    G.tourR={pl:pl,pass:pass,pend:tourPend(o)};tourLast={w:o.w,pts:pts,tb:tb};if(pass>=0)tourEv('pass',{n:pass,pl:pl});}
  const s=G.tourR,t=s.pend?Lg('🏆 итоги недели готовы','🏆 weekly results are ready'):s.pass>=0?Lg('🛡 '+tourNbName(s.pass)+' позади! Ты <b>'+tourPlOn(s.pl)+'</b>','🛡 '+tourNbName(s.pass)+' is behind you! You’re <b>'+tourPlOn(s.pl)+'</b>'):
    Lg('🛡 ты <b>'+tourPlOn(s.pl)+'</b> среди соседей','🛡 you’re <b>'+tourPlOn(s.pl)+'</b> among the neighbours');
  return '<span class="mline" id="mTour" style="cursor:pointer;text-decoration:underline dotted">'+t+' ›</span>';}
// нажатие — окно таблицы; «Назад» возвращает то же окно итогов (узлы переносим, обработчики живы)
function tourWinBind(){const e=$('mTour');if(!e)return;e.onclick=()=>{SND.click();const m=$('mBody'),fr=document.createDocumentFragment(),w=m.getAttribute('data-w'),rc=m.classList.contains('rc'),top=m.scrollTop;
  while(m.firstChild)fr.appendChild(m.firstChild);
  openTour('win',()=>{m.innerHTML='';m.appendChild(fr);m.setAttribute('data-w',w||'');m.classList.toggle('rc',rc);$('modal').classList.add('on');m.scrollTop=top;if(typeof fitModal==='function')fitModal();});};}

/* ---------- окно «Соседние заставы» ---------- */
function tourRowsHTML(o,tb){const tr=o.tr|0,me=typeof slRank==="function"?slRank():"";return '<div class="tourt">'+tb.map((x,j)=>{const my=x.i<0,nb=TOUR_NB[x.i],up=j<2,dn=j>=6&&tr>0;
  return '<div class="tourr'+(my?' me':'')+'"'+(my?'':' data-tnb="'+x.i+'"')+'><b class="tp">'+(j+1)+'</b><img src="'+(my?ic('voevoda',64):tourFace(x.i))+'" width="34" height="34" alt="">'+
    '<span class="tn"><b>'+(my?Lg('Ты','You')+(me?' · '+me:''):tourNbName(x.i))+'</b><small>'+(my?Lg('твоя застава','your outpost'):Lg(nb.z,nb.ze))+'</small></span>'+
    '<b class="ts">'+(!my&&!x.pts?'💤':fmtNum(x.pts))+'</b><span class="ta" style="color:'+(up?'#2f8a4a':dn?'#c0392b':'transparent')+'">'+(up?'▲':dn?'▼':'·')+'</span></div>';}).join('')+'</div>';}
// стили таблицы (свои)
(function(){try{const st=document.createElement('style');st.textContent='.tourt{margin:6px 0}.tourr{display:flex;align-items:center;gap:8px;padding:4px 8px;margin:3px 0;border-radius:12px;background:rgba(255,250,235,.75);box-shadow:0 0 0 1px rgba(120,80,40,.25) inset;cursor:pointer}'+
  '.tourr.me{background:#fff3c4;box-shadow:0 0 0 2px #e0a82a inset;cursor:default}.tourr img{flex:none}.tourr .tp{min-width:18px;text-align:center}.tourr .tn{flex:1;min-width:0;line-height:1.15}'+
  '.tourr .tn b,.tourr .tn small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tourr .tn small{font-size:12.5px;opacity:.8}.tourr .ts{min-width:42px;text-align:right}.tourr .ta{min-width:12px;font-size:12px}'+
  'html:not(.lk) .tourr{background:rgba(255,255,255,.07);color:inherit}html:not(.lk) .tourr.me{background:rgba(255,216,74,.18)}@supports not (inset:0){.tourr>*+*{margin-left:8px}}';document.head.appendChild(st);}catch(e){}})();
function openTour(from,back){const o=tourTick();if(!o)return;
  const tb0=tourTable(o,nowMs());STAT.screen('tour');tourEv('view',{f:from||'',pl:tourPlace(tb0),pts:tourPts(o)});
  if(tourPend(o)){tourResult(o,back);return;}
  const tb=tb0,pl=tourPlace(tb),pts=tourPts(o),zero=tb.every(x=>x.i<0||!x.pts),lead=tb[0].i<0?tb[1]:tb[0];
  const say=zero?Lg('Новая неделя! Соседи ещё точат топоры — самое время начать.','A new week! The neighbours are still sharpening their axes — a good time to start.'):
    pl===1?Lg('Ты впереди всей округи! '+tourNbName(tb[1].i)+' уже присылал гонца — спрашивает, как ты так.','You lead the whole land! '+tourNbName(tb[1].i)+' sent a messenger asking how you do it.'):
    pl<=3?Lg('Почти! '+tourNbName(lead.i)+' впереди — неделя длинная, догоним.','Almost! '+tourNbName(lead.i)+' is ahead — the week is long, we’ll catch up.'):
    Lg('Не спеши: соседи тоже не каждый день воюют. Пара побед — и подвинем их.','No rush: the neighbours don’t fight every day either. A couple of wins — and we’ll move them.');
  const g=o.g||{},gr=['1','2','3'].filter(k=>+g[k]).map(k=>['🥇','🥈','🥉'][k-1]+'×'+g[k]).join(' '),wb=tourWkBest();
  let h='<h3>'+Lg('🛡 Соседние заставы','🛡 Neighbouring Outposts')+'</h3><p class="sub" style="text-align:center;margin:0 0 4px">'+Lg('Ступень: ','Tier: ')+'<b>'+tourTierN(o.tr)+'</b> · '+Lg('до итогов ','results in ')+tourLeftTxt()+(gr?' · '+gr:'')+'</p>'+
    '<div class="say" data-fit="2"><img src="'+ic('voevoda')+'" alt=""><div>'+say+'</div></div>'+tourRowsHTML(o,tb)+
    '<p class="sub" data-fit="1">'+Lg('Очки — Слава недели: бои, осада, испытание дня, задания, Босс недели, заказы (до 400 в день). В понедельник итоги: 1–3 место — золото, ускорение и грамота, ▲ 1–2 — ступень выше, ▼ 7–8 — ниже.','Points are this week’s Fame: battles, the siege, the daily challenge, quests, the Boss of the Week, orders (up to 400 a day). Results on Monday: places 1–3 get gold, speed-up and a certificate, ▲ 1–2 move up a tier, ▼ 7–8 move down.')+
    ' <i>'+Lg('Соседние воеводы — персонажи сказки.','The neighbouring commanders are fairy-tale characters.')+'</i></p>'+
    '<div class="card"><div class="row"><img class="ic" src="'+ic(CH[weekCh()].boss)+'" alt=""><div class="t"><b>'+Lg('⚔ Лучший бой с Боссом недели','⚔ Best Boss of the Week battle')+'</b><span>'+(wb||Lg('ещё не сражался','not fought yet'))+'</span></div>'+
      (S.stars['0-5']?'<button class="btn" id="tourWk">'+Lg('В бой','Fight')+'</button>':'')+'</div><div id="tourLive"></div></div>'+
    '<div class="btns"><button class="btn big" id="tourOk">'+(back?Lg('Назад','Back'):Lg('Хорошо','OK'))+'</button></div>';
  showModal(h,'tour');
  for(const r of $('mBody').querySelectorAll('[data-tnb]'))r.onclick=()=>{const b=TOUR_NB[+r.dataset.tnb];SND.click();toast(tourNbName(+r.dataset.tnb)+': '+Lg(b.t,b.te));};
  on('tourOk',()=>{if(back)back();else{hideModal();metaRe();}});on('tourWk',()=>{if(typeof startWeekly==='function'){if(back&&typeof G!=='undefined'&&G)toMenu('Siege');startWeekly();}});
  tourLive();}
// итог недели: место, грамота, награда (выдаётся при открытии этого окна)
function tourResult(o,back){const r=o.r,top=r.pl<=3,lead=r.lead!=null&&r.lead>=0?tourNbName(r.lead):'',res=tourGive(o)||{};o.ts=Date.now();save();SND.up();setPills();
  const h=r.pl===1?Lg('🏆 Первая застава округи!','🏆 First outpost of the land!'):r.pl===2?Lg('🥈 Второе место среди соседей!','🥈 Second place among the neighbours!'):r.pl===3?Lg('🥉 Третье место среди соседей!','🥉 Third place among the neighbours!'):Lg('🛡 Итоги недели','🛡 Weekly results');
  const t=r.pl===1?Lg('Воевода Потап вывесил твою грамоту на воротах. Соседи ходят и вздыхают.','Commander Potap hung your certificate on the gate. The neighbours walk by and sigh.'):
    r.pl<=3?Lg((lead?lead+' '+(TOUR_NB[r.lead].g==='f'?'обошла':'обошёл')+' совсем чуть-чуть':'До первого места — совсем чуть-чуть')+'. На этой неделе покажем!',(lead?lead+' was just a little ahead':'First place was very close')+'. This week we’ll show them!'):
    Lg('За неделю — '+fmtNum(r.pts)+' Славы. Соседи старались, но и мы не лыком шиты. Держи за службу.','This week — '+fmtNum(r.pts)+' Fame. The neighbours tried hard, but we’re no slouches either. Here’s for your service.');
  const tierTxt=r.tr1>r.tr0?Lg('▲ Ступень выше: ','▲ Up a tier: ')+tourTierN(r.tr0)+' → <b>'+tourTierN(r.tr1)+'</b>':r.tr1<r.tr0?Lg('▼ Ступень ниже: ','▼ Down a tier: ')+tourTierN(r.tr0)+' → '+tourTierN(r.tr1):Lg('Ступень: ','Tier: ')+tourTierN(r.tr1);
  const bnB=r.bn&&typeof XBN!=='undefined'?XBN.find(b=>b.id===r.bn):null,plB=res.plate&&typeof XBN!=='undefined'?XBN.find(b=>b.id==='sosed'):null;
  showModal('<h3>'+h+'</h3><div class="say"><img src="'+ic('voevoda')+'" alt=""><div>'+t+'</div></div>'+
    (top?'<div class="goal" style="text-align:center">'+['🥇','🥈','🥉'][r.pl-1]+Lg(' Грамота за ',' Certificate for ')+tourPlTxt(r.pl)+' · '+fmtNum(r.pts)+Lg(' Славы',' Fame')+'</div>':'')+
    '<div class="card treasury" style="text-align:center"><b>+'+fmtGold(r.gold)+(r.bo?' · ⏩ +'+fmtBoost(r.bo):'')+'</b></div><p class="sub" style="text-align:center">'+tierTxt+'</p>'+
    (bnB?'<div class="card" style="text-align:center"><img src="'+xbnURL(bnB,96)+'" width="72" height="72" alt=""><br><b>'+xbnName(bnB)+'</b><br><span class="note">'+Lg('Твоё навсегда — поднять над воротами можно здесь или в «Деревне».','Yours forever — raise it over the gate here or in the “Village”.')+'</span><div class="btns">'+xbnRaiseBtn(bnB.id)+'</div></div>':'')+
    (plB?'<div class="card" style="text-align:center"><img src="'+xbnURL(plB,96)+'" width="72" height="72" alt=""><br>'+Lg('И <b>«Соседский стяг»</b> — за '+TOUR.plate+' недели в призёрах!','And the <b>“Neighbours’ standard”</b> — for '+TOUR.plate+' weeks among the winners!')+'<div class="btns">'+xbnRaiseBtn('sosed')+'</div></div>':'')+
    '<p class="sub">'+Lg('Новая неделя уже началась — соседи снова на стенах.','A new week has begun — the neighbours are back on the walls.')+'</p>'+
    '<div class="btns"><button class="btn big" id="tourNew">'+Lg('Посмотреть новую неделю','See the new week')+'</button>'+(back?'<button class="btn ghost" id="tourB">'+Lg('Назад','Back')+'</button>':'')+'</div>','tour');
  for(const b of $('mBody').querySelectorAll('[data-xbu]'))b.onclick=()=>{SND.click();S.bn=b.dataset.xbu;save();b.outerHTML='<span class="tag ok">'+Lg('Реет над воротами','Flying over the gate')+'</span>';};
  on('tourNew',()=>openTour('res',back));on('tourB',()=>back());}
// «Живые воеводы Яндекса»: таблица weekly (лучший бой Босса недели), только после удачного ответа и если там есть кто-то кроме тебя; 2 ошибки — выключаем
let tourLbErr=0;
function tourLive(){if(PLAT==='vk'||!LB.ok()||tourLbErr>=2)return;const wn=weekNo();
  LB.get('weekly').then(r=>{const box=$('tourLive');if(!box)return;if(!r){tourLbErr++;tourEv('lb',{r:'err'});return;}
    const es=(r.entries||[]).filter(e=>Math.floor((+e.score||0)/WEEK_SCORE)===wn),me=r.userRank|0;if(es.length<2||!me)return;
    box.innerHTML='<p class="sub" style="margin:6px 0 0;cursor:pointer;text-decoration:underline dotted" id="tourLb">'+Lg('👥 Живые воеводы Яндекса · ты на ','👥 Live commanders on Yandex · you’re ')+me+Lg('-м месте ›',' ›')+'</p>';tourEv('lb',{r:'ok',n:es.length});
    on('tourLb',()=>{lbSeg='weekly';if(typeof G!=='undefined'&&G)toMenu('Siege');else{hideModal();openTab('Siege');}setTimeout(()=>{const x=$('lbBox');if(x)x.scrollIntoView({block:'center'});},60);});}).catch(()=>{tourLbErr++;});}

/* ---------- «Испытания»: строка у Босса недели ---------- */
function tourSIEGE(el){try{const o=tourTick();if(!o||!el)return;const b=el.querySelector('#wkGo');if(!b)return;const pl=tourPlace(tourTable(o,nowMs()));
  const p=document.createElement('p');p.className='sub';p.style.cssText='margin:6px 4px 0;cursor:pointer;text-decoration:underline dotted';p.id='tourSg';
  p.innerHTML=(tourPts(o)?Lg('🛡 Среди соседних застав ты ','🛡 Among the neighbouring outposts you’re ')+tourPlOn(pl):Lg('🛡 Соседние заставы: новая неделя','🛡 Neighbouring Outposts: a new week'))+(tourPend(o)?Lg(' · итоги недели готовы!',' · weekly results are ready!'):'')+' ›';
  const box=b.closest('.btns')||b;box.parentNode.insertBefore(p,box.nextSibling);on('tourSg',()=>openTour('siege'));}catch(e){tourErr('siege',e);}}
// чип «Сегодня»: только когда ждут итоги
function tourTODAY(a){try{const o=tourTick();if(!o||!tourPend(o))return;a.push({id:'tour',hot:1,t:Lg('🏆 Итоги недели','🏆 Weekly results'),fn:()=>openTour('map')});}catch(e){tourErr('today',e);}}
function tourEND(){tourTick();}
// меню показано после запуска (крючок MENU): ждут итоги недели и окно свободно — показать их сразу (один раз за запуск)
let tourMenuShown=false;
function tourMENU(){try{if(tourMenuShown||typeof G!=='undefined'&&G||$('modal').classList.contains('on'))return;const o=tourTick();if(!o||!tourPend(o))return;tourMenuShown=true;openTour('menu');return true;}catch(e){tourErr('menu',e);}}
if(typeof META_MODS!=='undefined')META_MODS.push({id:'tour',FIX:TOUR_FIX,MERGE:TOUR_MERGE,END:tourEND,SIEGE:tourSIEGE,MENU:tourMENU});   // фишки «Сегодня» нет: плитка на карте

/* ---------- рисунок: щит с заставой ---------- */
art('tour_shield',64,g=>{shp(g,'#2f5ab0',{hl:.4},[-22,-24,22,26],()=>{g.moveTo(0,-24);g.quadraticCurveTo(14,-18,22,-20);g.quadraticCurveTo(24,10,0,26);g.quadraticCurveTo(-24,10,-22,-20);g.quadraticCurveTo(-14,-18,0,-24);});
  g.lineWidth=2.4;g.strokeStyle='#e6b53a';g.stroke();
  poly(g,[-10,10,-10,-4,-6,-4,-6,-8,-2,-8,-2,-4,2,-4,2,-8,6,-8,6,-4,10,-4,10,10],'#f2e2b0',{lw:.9});rrect(g,-3,2,6,8,2);g.fillStyle='#6a4a2a';g.fill();
  shine(g,-9,-12,4,2.2,.4);});

/* ---------- для проверки на своей машине: TOURX.open(), TOURX.skip(недель) — сдвиг недели назад ---------- */
const TOURX={on:TOUR_ON,open:openTour,tick:tourTick,skip(n){if(!LOCAL||!S.tour)return;S.tour.w-=n||1;S.tour.s-=(n||1)*7*864e5;if(S.sl&&S.sl.wk){S.sl.wk0={w:S.sl.wk.w-(n||1),p:S.sl.wk.p};}save();}};
