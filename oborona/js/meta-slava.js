'use strict';
/* ================= МЕТА «slava»: «Слава воеводы» — очки за все дела, уровни и дорожка наград, звания, Древо воеводы, «Сказ месяца» (SLAVA, 08.10.2026) =================
   План — release-i/oborona-boost/03-meta.md п. 4.1-А, 4.4 (звания) и 04-tournament.md п. 3.4 (источники); образец — bogatyr/js/meta-slava.js; журнал — logs/SLAVA.md.
   Подключение: META_MODS.push({id:'slava',…}) (розетка META1). Грузится после meta-trf.js, до meta-tour.js.
   Слава — одни очки на всё: уровень (опыт), недельная Слава (очки турнира «Соседние заставы», meta-tour.js), очки «Сказа месяца».
   Источники (план 04 §3.4): победа 10×★ (новый рекорд звёзд уровня) / 5×★ (перепроход), поражение 3 (с 2-й волны), осада 1×волна + ещё 2× за волны сверх рекорда недели,
     испытание дня 50 за победу в первой попытке (проигрыш 10), все 3 задания дня 30, Босс недели — прирост лучшего за неделю % здоровья + 150 за первую победу,
     заказ жителя 20, сундук недели 50 (meta-trf.js). Множитель режима: G.slK (может задать DIF в newBattle), иначе «Богатырская» ×1,3.
   Новые главы (CH, номера 8+) — сами (по G.ci/G.li); новые бои и события — SLAVA_ADD(n,'src').
   Потолок: недельная Слава и Сказ — не больше SLV.cap (400) в день (защита турнира); уровень — без потолка.
   Таланты — только кампания (без испытания дня) и осада; не Босс недели. Сила вся ≈ ≤ +12 %. Сброс бесплатный.
   Облики застав (SKINS) — теперь награды дорожки Славы (ур. 5/12/20/30) на все роды застав сразу; купленное за золото остаётся (решение владельца 08.10).
   Знамёна-награды (Сказ, ступени турнира) — XBN ниже: владение в S.bns (как купленные), поднятое — S.bn; bnNow() в data.js спрашивает xbnNow().
   Сейв — только S.sl: {x: Слава всего, cl: дорожка забрана до ур., t:{талант:ранг}, ss:{id,p,cl}, wk:{w,p,sb,bb,bw}, wk0:{w,p}, d:{k,n}, qd, dd, c:{…}, ts}
   Новичку (меньше 3 побед) ничего не показываем (очки копятся). */
const SL_ON=!/[?&]noslava/.test(location.search);
function slErr(w,x){slErr.n=(slErr.n||0)+1;if(slErr.n<=5)console.warn('meta slava '+w+': '+(x&&x.message||x));}
function slEv(a,x){try{STAT.ev('slava',Object.assign({a:a},x||{}));}catch(e){}}

/* ---------- числа ---------- */
const SLV={base:40,step:8,tal:30,cap:400,max:999};
function slNeed(l){return SLV.base+SLV.step*l;}  // Славы с уровня l на l+1
function slLv(x){let l=1;x=Math.max(0,x|0);while(l<SLV.max&&x>=slNeed(l)){x-=slNeed(l);l++;}return {l:l,cur:x,need:slNeed(l)};}
const SL_SRC={win:5,star:5,retro:10,lose:3,dch:50,dchL:10,dq:30,wkWin:150,siegeRec:2};
// звания: по уровню Славы И звёздам (план 03 п. 4.4)
const SL_RANK=[
  {l:1,s:0,get n(){return Lg('Ратник','Warrior');}},
  {l:5,s:25,get n(){return Lg('Десятник','Sergeant');}},
  {l:12,s:60,get n(){return Lg('Сотник','Captain');}},
  {l:22,s:100,get n(){return Lg('Воевода','Commander');}},
  {l:35,s:135,get n(){return Lg('Богатырь','Bogatyr');}}];
// звёзды всех режимов: Обычный — S.stars, ⚔ Сложный / 🔥 Адский — S.dst (js/dif.js)
function slStars(){let n=0;for(const k in S.stars)n+=+S.stars[k]||0;for(const k in S.dst||{})n+=+S.dst[k]||0;return n;}
function slRankI(){const s=SL();if(!s)return 0;const l=slLv(s.x).l,st=slStars();let r=0;SL_RANK.forEach((R,i)=>{if(l>=R.l&&st>=R.s)r=i;});return r;}
function slRank(){return SL_RANK[slRankI()].n;}

/* ---------- таланты: Древо воеводы ---------- */
// b — ветка, m — рангов, q — нужно очков в ветке, f — развилка (из пары с одной f — только одна), x — за ранг:
// dmg — урон всех застав, rng — дальность, cd — перезарядка застав быстрее, dmA — урон стрельцов и колдуна, dmP — урон пушек и дуба, izba — урон избы,
// scd — чары быстрее, thc — Гром Перуна быстрее, cac — Кот Баюн быстрее, life — жизни, coin — монеты на старте, loot — монеты за нечисть
const SL_TAL=[
  {id:'udar',b:'r',m:10,q:0,x:{dmg:.003},get n(){return Lg('Крепкий удар','Heavy blow');}},
  {id:'zork',b:'r',m:4,q:0,x:{rng:.005},get n(){return Lg('Зоркие дозорные','Keen lookouts');}},
  {id:'strel',b:'r',m:3,q:5,f:'r1',x:{dmA:.012},get n(){return Lg('Стрелецкая удаль','Archers’ daring');}},
  {id:'pushk',b:'r',m:3,q:5,f:'r1',x:{dmP:.012},get n(){return Lg('Пушкарская сноровка','Cannoneers’ knack');}},
  {id:'skor',b:'r',m:2,q:10,f:'r2',x:{cd:.015},get n(){return Lg('Скорострел','Rapid fire');}},
  {id:'yad',b:'r',m:2,q:10,f:'r2',x:{izba:.04},get n(){return Lg('Злое зелье','Wicked brew');}},
  {id:'scd',b:'c',m:6,q:0,x:{scd:.015},get n(){return Lg('Скорые чары','Swift spells');}},
  {id:'life',b:'c',m:3,q:0,x:{life:1},get n(){return Lg('Крепкие ворота','Sturdy gate');}},
  {id:'thc',b:'c',m:2,q:4,f:'c1',x:{thc:.05},get n(){return Lg('Гром почаще','Thunder more often');}},
  {id:'cac',b:'c',m:2,q:4,f:'c1',x:{cac:.05},get n(){return Lg('Баюн почаще','Bayun more often');}},
  {id:'zast',b:'c',m:1,q:8,f:'c2',x:{life:2},get n(){return Lg('Заступа','Bulwark');}},
  {id:'ved',b:'c',m:1,q:8,f:'c2',x:{scd:.04},get n(){return Lg('Ведовство','Witchcraft');}},
  {id:'kazna',b:'h',m:6,q:0,x:{coin:.01},get n(){return Lg('Походная казна','Field treasury');}},
  {id:'loot',b:'h',m:5,q:0,x:{loot:.008},get n(){return Lg('Добыча','Plunder');}},
  {id:'zapas',b:'h',m:3,q:5,f:'h1',x:{coin:.012},get n(){return Lg('Запасливый','Thrifty');}},
  {id:'skup',b:'h',m:3,q:5,f:'h1',x:{loot:.012},get n(){return Lg('Скупщик','Trader');}}];
const SL_TB={};for(const t of SL_TAL)SL_TB[t.id]=t;
const SL_BR={r:{ic:'swords',get n(){return Lg('Ратное','Arms');},get d(){return Lg('урон, дальность, перезарядка застав','outpost damage, range, reload');}},
  c:{ic:'sp_thunder',get n(){return Lg('Чародейское','Magic');},get d(){return Lg('чары и жизни','spells and lives');}},
  h:{ic:'coin',get n(){return Lg('Хозяйское','Thrift');},get d(){return Lg('монеты в бою','coins in battle');}}};
function slPc(v){const a=Math.round(Math.abs(v)*1000)/10;return '+'+dnum(a)+' %';}
function slFxText(x,r){r=r||1;const a=[];for(const k in x){const v=x[k]*r;
  if(k==='dmg')a.push(slPc(v)+Lg(' урона всех застав',' damage of all outposts'));else if(k==='rng')a.push(slPc(v)+Lg(' дальности',' range'));
  else if(k==='cd')a.push(Lg('заставы стреляют чаще на ','outposts fire faster by ')+slPc(v).slice(1));else if(k==='dmA')a.push(slPc(v)+Lg(' урона стрельцов и колдуна',' archer and sorcerer damage'));
  else if(k==='dmP')a.push(slPc(v)+Lg(' урона пушки и дуба',' cannon and oak damage'));else if(k==='izba')a.push(slPc(v)+Lg(' урона избы Яги',' Yaga’s hut damage'));
  else if(k==='scd')a.push(Lg('чары быстрее на ','spells recharge faster by ')+slPc(v).slice(1));else if(k==='thc')a.push(Lg('Гром Перуна быстрее на ','Perun’s Thunder faster by ')+slPc(v).slice(1));
  else if(k==='cac')a.push(Lg('Кот Баюн быстрее на ','Bayun the Cat faster by ')+slPc(v).slice(1));else if(k==='life')a.push('+'+v+' '+plw(v,'жизнь','жизни','жизней','life','lives'));
  else if(k==='coin')a.push(slPc(v)+Lg(' монет на старте',' starting coins'));else if(k==='loot')a.push(slPc(v)+Lg(' монет за нечисть',' coins per monster'));}
  return a.join(', ');}

/* ---------- знамёна-награды (Сказ, ступени турнира): только вид, реют над воротами ---------- */
const XBN=[];
function xbnAdd(b){if(!XBN.some(x=>x.id===b.id))XBN.push(b);}
function xbnOwn(id){return !!(S.bns&&S.bns[id]);}
function xbnNow(){const b=XBN.find(x=>x.id===S.bn);return b&&xbnOwn(b.id)?b:null;}
function xbnGive(id){if(!S.bns)S.bns={};const had=!!S.bns[id];S.bns[id]=1;return !had;}
function xbnURL(b,px){px=px||96;const id='xbn_'+b.id+'@'+px;if(mapCache[id])return mapCache[id];const c=document.createElement('canvas');c.width=c.height=px;drawBanner(c.getContext('2d'),px*.26,px*.94,px*.8,b,0);return mapCache[id]=c.toDataURL();}
function xbnName(b){return Lg(b.n,b.en||b.n);}
// в деревне, под знамёнами дружины: полученные знамёна-награды (строки; поднять)
function xbnHTML(){const own=XBN.filter(b=>xbnOwn(b.id));if(!own.length)return '';
  return '<h2>'+Lg('Знамёна-награды','Reward banners')+'</h2><p class="sub">'+Lg('За Сказ месяца и ступени «Соседних застав». Только для красоты и славы.','For the Tale of the Month and the “Neighbouring Outposts” tiers. Just for beauty and glory.')+'</p><div class="blds">'+
    own.map(b=>'<div class="card bld has"><img src="'+xbnURL(b,112)+'" alt=""><b>'+xbnName(b)+'</b>'+(S.bn===b.id?'<span class="tag ok">'+Lg('Реет над воротами','Flying over the gate')+'</span>':'<button class="btn" data-xbu="'+b.id+'">'+Lg('Поднять','Raise')+'</button>')+'</div>').join('')+'</div>';}
function xbnBind(el){for(const b of (el||document).querySelectorAll('[data-xbu]'))b.onclick=()=>{SND.click();S.bn=b.dataset.xbu;save();metaRe();};}
function xbnRaiseBtn(id){if(!xbnOwn(id)||S.bn===id)return '';return '<button class="btn ghost" data-xbu="'+id+'">'+Lg('Поднять над воротами','Raise over the gate')+'</button>';}

/* ---------- Сказ месяца: 28 дней, 30 ступеней; очки = заработанная Слава; верх — знамя сказа ---------- */
const SAGA=[{n:'Сказ о Жар-птице',en:'Tale of the Firebird',bn:{c1:'#d8501e',c2:'#ffd84a',em:[7,.5]}},
  {n:'Сказ о Морозко',en:'Tale of Morozko',bn:{c1:'#2a6ab8',c2:'#e8f6ff',em:[6,.3]}},
  {n:'Сказ о Царевне-лягушке',en:'Tale of the Frog Princess',bn:{c1:'#3a8a3a',c2:'#f2e27a',em:[0,1]}},
  {n:'Сказ о Сивке-Бурке',en:'Tale of Sivka-Burka',bn:{c1:'#6a3a1a',c2:'#f4c070',em:[8,.6]}}];
SAGA.forEach((s,i)=>xbnAdd(Object.assign({id:'sg'+i,n:'Знамя: '+s.n,en:'Banner: '+s.en},s.bn)));
const SAGA_D=28,SAGA_N=30,SAGA_P=80;  // дней, ступеней, Славы на ступень
function slDayIdx(){const k=dayKey().split('-').map(Number);return Math.floor(Date.UTC(k[0],k[1]-1,k[2])/864e5);}
function slSagaId(){return Math.floor(slDayIdx()/SAGA_D);}
function slSagaLeft(){return SAGA_D-((slDayIdx()%SAGA_D+SAGA_D)%SAGA_D);}
function sagaStep(p){return Math.min(SAGA_N,Math.floor(p/SAGA_P));}
// награды ступеней: трофеи, ускорение; 30-я — знамя сказа
function sagaRw(i,id){if(i===SAGA_N)return {bn:'sg'+(((id|0)%SAGA.length)+SAGA.length)%SAGA.length};if(i%10===0)return {tr:10,i:i};if(i%5===0)return {bo:600};if(i%3===0)return {bo:300};return {tr:2+Math.floor(i/10),i:i};}
// текущий сказ; сменился — несобранное выдаём сами (ничего не пропадает)
function slSaga(){const s=SL();if(!s)return {id:0,p:0,cl:0};const q=s.ss,id=slSagaId();
  if(q.id!==id){if(q.id>=0){let n=0;for(let i=q.cl+1;i<=sagaStep(q.p);i++){slGive(sagaRw(i,q.id));n++;}if(n){s.c.auto=(s.c.auto||0)+n;slEv('saga',{k:'auto',n:n,s:q.id});}}
    s.ss={id:id,p:0,cl:0};slTouch();try{save();}catch(e){}}
  return s.ss;}
function sagaReady(q){return sagaStep(q.p)>q.cl;}
function sagaClaim(){const s=SL();if(!s)return 0;const q=slSaga();let n=0;for(let i=q.cl+1;i<=sagaStep(q.p);i++){slGive(sagaRw(i,q.id));n++;}q.cl=Math.max(q.cl,sagaStep(q.p));
  if(n)slEv('claim',{k:'saga',s:q.cl,n:n});slTouch();save();return n;}

/* ---------- дорожка наград по уровням ---------- */
const SL_SKIN_AT={5:'spring',12:'fair',20:'winter',30:'gold'};
function famRw(l){if(l<2)return null;if(SL_SKIN_AT[l])return {sk:SL_SKIN_AT[l]};if(l%5===0)return {bo:600};if(l%10===8)return {bo:300};return {tr:3+Math.floor(l/8),i:l};}
function slSkinLv(id){for(const l in SL_SKIN_AT)if(SL_SKIN_AT[l]===id)return +l;return 0;}
function slSkinAll(id){return TW_ORDER.every(t=>S.skins&&S.skins[t+'.'+id]);}
// выдать награду (сохраняет вызывающий); облик уже весь куплен — вместо него 10 трофеев и 5 мин
function slGive(r){if(!r)return;
  if(r.sk){if(slSkinAll(r.sk)){if(typeof TRF_ADD==='function')TRF_ADD(TRF_PICK(0),10);boostAdd(300);}else{if(!S.skins)S.skins={};for(const t of TW_ORDER)S.skins[t+'.'+r.sk]=1;}}
  else if(r.bo)boostAdd(r.bo);else if(r.bn)xbnGive(r.bn);else if(r.tr&&typeof TRF_ADD==='function')TRF_ADD(TRF_PICK(r.i),r.tr);}
function rwIc(r){return r.sk?'ti_arch_3~'+r.sk:r.bo?'sl_hour':r.bn?'':r.tr?(typeof trfIc==='function'?trfIc(TRF_PICK(r.i)):'trf_bag'):'sl_fame';}
function rwImg(r,px){if(r&&r.bn){const b=XBN.find(x=>x.id===r.bn);return '<img class="ic" src="'+(b?xbnURL(b,96):'')+'" alt="">';}return '<img class="ic" src="'+ic(r?rwIc(r):'sl_fame',px||72)+'" alt="">';}
function rwText(r){if(!r)return '—';if(r.sk)return Lg('облик застав «','outpost look “')+skinName(r.sk)+Lg('»','”');if(r.bo)return '⏩ +'+fmtBoost(r.bo);
  if(r.bn){const b=XBN.find(x=>x.id===r.bn);return b?xbnName(b):'';}return (typeof trfName==='function'?trfName(TRF_PICK(r.i)):'')+' ×'+r.tr;}

/* ---------- сейв ---------- */
function slNew(){return {x:0,st:0,cl:1,t:{},ss:{id:-1,p:0,cl:0},wk:{w:0,p:0,sb:0,bb:0,bw:0},wk0:{w:0,p:0},d:{k:'',n:0},qd:'',dd:'',c:{},ts:0};}
function slFixO(s){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),n=v=>typeof v==='number'&&isFinite(v)?v:0,nn=v=>Math.max(0,n(+v)|0);
  const d=slNew();for(const k in d)if(!ob(d[k])?!(k in s):!ob(s[k]))s[k]=JSON.parse(JSON.stringify(d[k]));
  s.x=nn(s.x);s.st=nn(s.st);s.cl=Math.max(1,nn(s.cl));s.ts=n(s.ts);for(const k of['qd','dd'])if(typeof s[k]!=='string')s[k]='';
  for(const k in s.t){const T=SL_TB[k];if(!T)delete s.t[k];else{s.t[k]=Math.min(T.m,nn(s.t[k]));if(!s.t[k])delete s.t[k];}}
  for(const k in s.c)s.c[k]=n(+s.c[k]);
  const q=s.ss;q.id=typeof q.id==='number'&&isFinite(q.id)?q.id|0:-1;q.p=nn(q.p);q.cl=nn(q.cl);
  for(const k of['w','p','sb','bb','bw'])s.wk[k]=nn(s.wk[k]);for(const k of['w','p'])s.wk0[k]=nn(s.wk0[k]);
  if(typeof s.d.k!=='string')s.d.k='';s.d.n=nn(s.d.n);
  if(!slTalOk(s))s.t={};   // очков меньше, чем вложено (облако/правка) — бесплатный сброс
  return s;}
function SL_FIX(s){try{s=s||S;const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);if(s.sl!=null&&!ob(s.sl))s.sl=null;
  if(!s.sl){if(!SL_ON)return;s.sl=slNew();}slFixO(s.sl);}catch(e){slErr('fix',e);}}
// облако: Слава/забранное/сказ/неделя — максимум; таланты — из более нового (ts)
function SL_MERGE(d,o){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),b=ob(d)&&ob(d.sl)?d.sl:null;if(!b)return;const a=ob(o.sl)?o.sl:null;
  if(!a){o.sl=slFixO(JSON.parse(JSON.stringify(b)));return;}
  const pk=(+b.ts||0)>(+a.ts||0)?b:a,ol=pk===a?b:a,nw=JSON.parse(JSON.stringify(pk));
  nw.x=Math.max(+a.x||0,+b.x||0);nw.st=Math.max(+a.st||0,+b.st||0);nw.cl=Math.max(+a.cl||1,+b.cl||1);
  const qa=ob(a.ss)?a.ss:{},qb=ob(b.ss)?b.ss:{};
  if((+qa.id|0)===(+qb.id|0))nw.ss={id:+qa.id|0,p:Math.max(+qa.p||0,+qb.p||0),cl:Math.max(+qa.cl||0,+qb.cl||0)};else nw.ss=JSON.parse(JSON.stringify((+qa.id|0)>(+qb.id|0)?qa:qb));
  for(const k of['wk','wk0']){const wa=ob(a[k])?a[k]:{},wb=ob(b[k])?b[k]:{};
    if((+wa.w|0)===(+wb.w|0)){const m={};for(const f of['w','p','sb','bb','bw'])m[f]=Math.max(+wa[f]||0,+wb[f]||0);nw[k]=m;}else nw[k]=JSON.parse(JSON.stringify((+wa.w|0)>(+wb.w|0)?wa:wb));}
  const da=ob(a.d)?a.d:{},db=ob(b.d)?b.d:{};if(da.k===db.k)nw.d={k:da.k,n:Math.max(+da.n||0,+db.n||0)};else nw.d=JSON.parse(JSON.stringify((da.k||'')>(db.k||'')?da:db));
  for(const k of['qd','dd'])nw[k]=(a[k]||'')>(b[k]||'')?a[k]:b[k]||'';
  const oc=ob(ol.c)?ol.c:{};nw.c=ob(nw.c)?nw.c:{};for(const k in oc)nw.c[k]=Math.max(+nw.c[k]||0,+oc[k]||0);
  o.sl=slFixO(nw);}catch(e){slErr('merge',e);}}
function SL(){return SL_ON&&S.sl||null;}
function slTouch(){const s=SL();if(s)s.ts=Date.now();}
function slVis(){return !!SL()&&(S.wins|0)>=3;}

/* ---------- начисление ---------- */
// неделя: смена недели — прошлая уходит в wk0 (её итог считает турнир)
function slWk(s){const w=weekNo();if(s.wk.w!==w){if(s.wk.w)s.wk0={w:s.wk.w,p:s.wk.p};s.wk={w:w,p:0,sb:0,bb:0,bw:0};}return s.wk;}
function slWeekPts(w){const s=SL();if(!s)return 0;slWk(s);if(s.wk.w===w)return s.wk.p;if(s.wk0.w===w)return s.wk0.p;return 0;}
/* SLAVA_ADD(n, src) — общий вход: уровень (без потолка), недельная Слава и Сказ (до SLV.cap в день). Возвращает начисленное (для подписи). */
function SLAVA_ADD(n,src){const s=SL();n=Math.round(+n||0);if(!s||n<=0)return 0;
  const l0=slLv(s.x).l;s.x+=n;const l1=slLv(s.x).l;for(let l=l0+1;l<=l1;l++)slEv('lvl',{l:l,k:src||''});
  const dk=dayKey();if(s.d.k!==dk)s.d={k:dk,n:0};const m=Math.max(0,Math.min(n,SLV.cap-s.d.n));s.d.n+=m;
  if(m){slWk(s).p+=m;const q=slSaga();q.p+=m;}
  s.c[src||'etc']=(s.c[src||'etc']||0)+n;slTouch();
  if(typeof G!=='undefined'&&G){G.slSum=(G.slSum||0)+n;if(l1>l0)G.slUp=l1;if(m<n)G.slCap=1;}
  return n;}
// звёзды, ещё не засчитанные Славой (старое сохранение до Славы или облако с прогрессом) — по 10 за звезду, только в уровень (не в турнир и не в Сказ)
function slRetro(){const s=SL();if(!s)return 0;const n=slStars();if(n<=s.st)return 0;const d=n-s.st;s.st=n;const l0=slLv(s.x).l;s.x+=SL_SRC.retro*d;s.c.retro=(s.c.retro||0)+SL_SRC.retro*d;
  if(slLv(s.x).l>l0)slEv('lvl',{l:slLv(s.x).l,k:'retro'});slTouch();try{save();}catch(e){}return d;}
// все три задания дня — +30 (раз в день); зовётся после боя и при открытии карты
function slQuestChk(){try{const s=SL();if(!s||s.qd===dayKey()||typeof dqToday!=='function')return 0;const D=dqToday();if(!D.list.length||!D.list.every(q=>q.n>=q.goal))return 0;
  s.qd=dayKey();return SLAVA_ADD(SL_SRC.dq,'dq');}catch(e){slErr('dq',e);return 0;}}
function slK(G){return typeof metaK==='function'?metaK(G):+G.slK||1;}

/* ---------- крючки боя ---------- */
function slRUN(G){try{if(!G)return;const s=SL();if(!s)return;const w=slWk(s);
  G.slSum=0;G.slUp=0;G.slCap=0;G.slP={v:0};
  G.slPrev=G.endless||G.rule?0:G.dif==='s'||G.dif==='h'?+(S.dst||{})[G.dif+G.ci+'-'+G.li]||0:+S.stars[G.ci+'-'+G.li]||0;G.slSb=w.sb;G.slBb=w.bb;   // звёзды до боя — в режиме боя (DIF: S.dst)
  // таланты: кампания (не испытание дня) и осада; не Босс недели
  G.slT=null;if(!G.wk&&!G.rule){const f=slFx(s);if(Object.keys(f).length){G.slT=f;
    if(f.coin)G.coins=Math.round(G.coins*(1+f.coin));if(f.life){G.lives+=f.life;G.maxLives+=f.life;}
    if(typeof refreshTowerStats==='function')refreshTowerStats();}}}catch(e){slErr('run',e);}}
// урон/дальность/перезарядка заставы (tstat → META_HK('ST',o,type))
function slTW(o,type){const f=typeof G!=='undefined'&&G&&G.slT;if(!f||!o)return;
  let k=1+(f.dmg||0);if(type==='arch'||type==='mag')k+=f.dmA||0;if(type==='pushka'||type==='dub')k+=f.dmP||0;if(type==='izba')k+=f.izba||0;
  if(o.dmg)o.dmg*=k;if(o.dps)o.dps*=k;if(o.fire)o.fire*=k;if(f.rng&&o.rng)o.rng*=1+f.rng;if(f.cd&&o.cd)o.cd*=1-f.cd;}
// перезарядка чар (spellCd → META_HK('SCD',k)): множитель
function slSCD(k){const f=typeof G!=='undefined'&&G&&G.slT;if(!f)return undefined;let m=1-(f.scd||0);if(k==='thunder')m-=f.thc||0;if(k==='cat')m-=f.cac||0;return m<1?m:undefined;}
// монеты за нечисть: добавка к тому, что дал killEnemy (та же формула)
function slKILL(e){try{const f=G&&G.slT;if(!f||!f.loot||!e||!e.gold)return;const base=e.gold*(G.endless?2*(1+G.wave*.03):(GOLD_MUL[G.ci]||1)),v=Math.round(base*f.loot);if(v>0){G.coins+=v;G.earned+=v;}}catch(x){slErr('kill',x);}}
// конец боя: сколько Славы стоит бой целиком; после «ещё попытки» доплачиваем разницу
function slEND(G,win){try{const s=SL();if(!s||!G)return;const P=G.slP||(G.slP={v:0}),w=slWk(s);let v=0,src='lvl';
  if(G.wk){src='week';const b=CH[G.ci].boss;let pct=G.wkKill?1:G.wkPct||0;if(!G.wkKill){const e=G.en.find(x=>!x.dead&&x.type===b);if(e)pct=Math.max(pct,1-e.hp/e.max);}
    const p1=Math.round(pct*100),p0=Math.round((G.slBb||0)/10);v=Math.max(0,p1-p0);w.bb=Math.max(w.bb,Math.round(pct*1000));
    if(G.wkKill&&!w.bw){w.bw=1;v+=SL_SRC.wkWin;}}
  else if(G.dly){src='dly';v=Math.max(0,G.wave-1);}   // OB:MERGE «Застава дня» (META1): Слава = отбитые волны, рекорд осады недели не трогаем
  else if(G.endless){src='siege';const wv=Math.max(0,G.wave-1);v=wv+SL_SRC.siegeRec*Math.max(0,wv-(G.slSb||0));w.sb=Math.max(w.sb,wv);}
  else if(G.rule){src='dch';if(G.dchPrize)v=win?SL_SRC.dch:SL_SRC.dchL;}
  else if(win){const st=typeof starsFor==='function'?starsFor():1,nw=Math.max(0,st-G.slPrev);v=Math.round((SL_SRC.win*st+SL_SRC.star*nw)*slK(G));if(nw>(P.st||0)){s.st+=nw-(P.st||0);P.st=nw;}}
  else if(!G.quit&&G.wave>=2)v=SL_SRC.lose;
  const add=v-P.v;if(add>0){P.v=v;SLAVA_ADD(add,src);}
  slQuestChk();slTouch();}catch(e){slErr('end',e);}}
// строка в окне итогов (зовёт metaWinHtml)
function slWinHtml(G){if(!slVis()||!G||!G.slSum)return '';
  return '<span class="mline">⭐ <b>+'+G.slSum+'</b> '+Lg('Славы','Fame')+(G.slUp?' · <b style="color:var(--cGold,#e0a82a)">'+Lg('уровень ','level ')+G.slUp+'!</b>':'')+'</span>';}

/* ---------- таланты: очки, проверки ---------- */
function slTalPts(s){return Math.min(SLV.tal,slLv(s.x).l-1);}
function slTalSpent(s,b){let n=0;for(const k in s.t)if(!b||SL_TB[k].b===b)n+=s.t[k];return n;}
function slTalOk(s){if(slTalSpent(s)>slTalPts(s))return false;for(const k in s.t){const T=SL_TB[k];if(T.f&&SL_TAL.some(o=>o.f===T.f&&o.id!==k&&s.t[o.id]))return false;}return true;}
function slTalWhy(s,T){const r=s.t[T.id]||0;if(r>=T.m)return 'max';if(T.f){const o=SL_TAL.find(o=>o.f===T.f&&o.id!==T.id);if(o&&s.t[o.id])return 'fork';}
  if(slTalSpent(s,T.b)<T.q)return 'q';if(slTalSpent(s)>=slTalPts(s))return 'pts';return '';}
function slTalAdd(id){const s=SL(),T=SL_TB[id];if(!s||!T||slTalWhy(s,T))return;s.t[id]=(s.t[id]||0)+1;slTouch();save();SND.click();slEv('tal',{k:id,r:s.t[id],t:slTalSpent(s)});}
function slTalReset(){const s=SL();if(!s)return;const n=slTalSpent(s);s.t={};slTouch();save();SND.click();slEv('reset',{t:n});}
function slFx(s){const f={};for(const k in s.t){const T=SL_TB[k],r=s.t[k];for(const x in T.x)f[x]=(f[x]||0)+T.x[x]*r;}return f;}
function famReady(s){const l=slLv(s.x).l;for(let i=s.cl+1;i<=l;i++)if(famRw(i))return true;return false;}
function famClaim(){const s=SL();if(!s)return 0;const l=slLv(s.x).l;let n=0;for(let i=s.cl+1;i<=l;i++){const r=famRw(i);if(r){slGive(r);n++;}}
  s.cl=Math.max(s.cl,l);if(n)slEv('claim',{k:'fam',l:l,n:n});slTouch();save();return n;}
function slReady(){const s=SL();if(!s||!slVis())return false;return famReady(s)||slTalSpent(s)<slTalPts(s)||sagaReady(slSaga());}

/* ---------- окно «Слава воеводы» ---------- */
let slSeg='fam',slBr='r',slRes=0;
function slBar(c,n){return '<div class="bar"><i style="width:'+Math.round(Math.min(1,c/Math.max(1,n))*100)+'%"></i></div>';}
function slFamHTML(s){const lv=slLv(s.x),fr=slTalPts(s)-slTalSpent(s),ri=slRankI(),nx=SL_RANK[ri+1],st=slStars();let h='';
  h+='<div class="card"><div class="row"><img class="ic" src="'+ic('sl_fame')+'" alt=""><div class="t"><b>'+Lg('Уровень Славы ','Fame level ')+lv.l+' · '+SL_RANK[ri].n+'</b><span>'+fmtNum(lv.cur)+' / '+fmtNum(lv.need)+Lg(' до следующего',' to next')+'</span>'+slBar(lv.cur,lv.need)+'</div></div>'+
    '<p class="sub" style="margin:6px 0 0">'+Lg('Слава копится за всё: бои (и проигранные), осаду, испытание дня, задания, Босса недели, заказы. Каждый уровень — награда и очко таланта (до '+SLV.tal+').','Fame grows with everything you do: battles (even lost ones), the siege, the daily challenge, quests, the Boss of the Week, orders. Each level gives a reward and a talent point (up to '+SLV.tal+').')+'</p></div>';
  if(nx)h+='<div class="goal"><b>'+Lg('🎖 Звание «','🎖 Rank “')+nx.n+Lg('»:','”:')+'</b> '+Lg('уровень Славы ','fame level ')+Math.min(lv.l,nx.l)+'/'+nx.l+' · ★ '+Math.min(st,nx.s)+'/'+nx.s+'</div>';
  if(famReady(s))h+='<div class="btns"><button class="btn big gold" id="slFamGet">'+Lg('🎁 Забрать награды','🎁 Collect rewards')+'</button></div>';
  if(fr>0)h+='<div class="btns"><button class="btn gold" id="slToTal">'+Lg('🌳 Свободных очков талантов: ','🌳 Free talent points: ')+fr+'</button></div>';
  h+='<h2>'+Lg('Дорожка наград','Reward track')+'</h2>';
  const a=Math.max(2,Math.min(s.cl,lv.l)-1),b=Math.max(a+6,lv.l+3);
  for(let l=a;l<=b;l++){const r=famRw(l),got=l<=s.cl,rch=l<=lv.l;
    h+='<div class="card'+(got?'':rch?' next':'')+'" style="'+(got?'opacity:.6':'')+'"><div class="row"><b style="min-width:30px;font-size:18px;text-align:center">'+l+'</b>'+rwImg(r)+'<div class="t"><b>'+rwText(r)+'</b>'+
      (l<=SLV.tal+1?'<span>'+Lg('+1 очко таланта','+1 talent point')+'</span>':'')+'</div><span class="tag'+(got?' ok':'')+'">'+(got?'✓':rch?'🎁':'🔒')+'</span></div></div>';}
  h+='<h2>'+Lg('Звания','Ranks')+'</h2><div class="card">'+SL_RANK.map((R,i)=>'<div style="display:flex;justify-content:space-between;gap:8px;padding:3px 0;'+(i===ri?'font-weight:900':'opacity:'+(i<ri?.6:.85))+'"><span>'+(i<=ri?'✓ ':'')+R.n+'</span><span>'+Lg('ур. ','lvl ')+R.l+' · ★ '+R.s+'</span></div>').join('')+'</div>';
  return h;}
function slTalHTML(s){const pts=slTalPts(s),sp=slTalSpent(s),fr=pts-sp;let h='';
  h+='<div class="card"><div class="row"><img class="ic" src="'+ic(SL_BR[slBr].ic)+'" alt=""><div class="t"><b>'+Lg('Очки талантов: ','Talent points: ')+fr+Lg(' свободно',' free')+'</b><span>'+Lg('вложено ','spent ')+sp+' / '+pts+Lg(' (1 очко за уровень Славы, до '+SLV.tal+')',' (1 per fame level, up to '+SLV.tal+')')+'</span></div></div>'+
    '<p class="sub" style="margin:6px 0 0">'+Lg('Таланты работают в кампании и в осаде (в Боссе недели и испытании дня — нет: там все равны). Развилки — «или–или». Передумал — сброс бесплатный.','Talents work in the campaign and the siege (not in the Boss of the Week or the daily challenge — everyone is equal there). Forks are either–or. Changed your mind? Reset is free.')+'</p></div>';
  h+='<div class="seg">'+Object.keys(SL_BR).map(b=>'<button class="'+(b===slBr?'on':'')+'" data-slb="'+b+'">'+SL_BR[b].n+' '+slTalSpent(s,b)+'</button>').join('')+'</div><p class="sub">'+SL_BR[slBr].d+'</p>';
  let lastF='';
  for(const T of SL_TAL.filter(t=>t.b===slBr)){const r=s.t[T.id]||0,w=slTalWhy(s,T);
    if(T.f&&T.f===lastF)h+='<p class="sub" style="text-align:center;margin:2px 0">'+Lg('— или —','— or —')+'</p>';else if(T.f)h+='<p class="sub" style="margin:8px 4px 2px"><b>'+Lg('Развилка: от ','Fork: from ')+T.q+Lg(' очков в ветке',' points in the branch')+'</b></p>';lastF=T.f||'';
    const why=w==='fork'?Lg('выбран другой путь','the other path is chosen'):w==='q'?Lg('нужно '+T.q+' очк. в ветке','needs '+T.q+' points in the branch'):'';
    h+='<div class="card'+(r?' next':'')+'" style="'+(w==='fork'||w==='q'?'opacity:.6':'')+'"><div class="row"><div class="t"><b>'+T.n+' <small>'+r+'/'+T.m+'</small></b><span>'+(T.m>1?Lg('за ранг: ','per rank: '):'')+slFxText(T.x)+
      (r&&T.m>1?'<br>'+Lg('сейчас: ','now: ')+slFxText(T.x,r):'')+(why?'<br><i>'+why+'</i>':'')+'</span></div>'+
      (w===''?'<button class="btn gold" data-slt="'+T.id+'">+1</button>':w==='max'?'<span class="tag ok">✓</span>':'')+'</div></div>';}
  if(sp)h+='<div class="btns"><button class="btn ghost" id="slReset">'+(slRes?Lg('Точно сбросить все таланты?','Really reset all talents?'):Lg('↺ Сбросить таланты (бесплатно)','↺ Reset talents (free)'))+'</button></div>';
  return h;}
function slSagaHTML(){const q=slSaga(),nm=SAGA[((q.id%SAGA.length)+SAGA.length)%SAGA.length],st=sagaStep(q.p);let h='';
  h+='<div class="card"><div class="row"><img class="ic" src="'+ic('sl_saga')+'" alt=""><div class="t"><b>'+Lg(nm.n,nm.en)+'</b><span>'+Lg('ступень ','step ')+st+' / '+SAGA_N+' · '+Lg('осталось дней: ','days left: ')+slSagaLeft()+'</span>'+
    (st<SAGA_N?slBar(q.p%SAGA_P,SAGA_P):slBar(1,1))+'</div></div><p class="sub" style="margin:6px 0 0">'+Lg('Каждые '+SAGA_P+' Славы — ступень Сказа (до '+SLV.cap+' Славы в день). На 30-й ступени — знамя сказа на ворота.','Every '+SAGA_P+' Fame is a step of the Tale (up to '+SLV.cap+' Fame a day). Step 30 gives the tale’s banner for your gate.')+'</p></div>';
  if(sagaReady(q))h+='<div class="btns"><button class="btn big gold" id="slSagaGet">'+Lg('🎁 Забрать награды','🎁 Collect rewards')+'</button></div>';
  const a=Math.max(1,q.cl),b=Math.min(SAGA_N,Math.max(a+6,st+3));
  const row=i=>{const r=sagaRw(i,q.id),got=i<=q.cl,rch=i<=st;return '<div class="card'+(got?'':rch?' next':'')+'" style="'+(got?'opacity:.6':'')+'"><div class="row"><b style="min-width:30px;font-size:18px;text-align:center">'+i+'</b>'+rwImg(r)+'<div class="t"><b>'+rwText(r)+'</b></div><span class="tag'+(got?' ok':'')+'">'+(got?'✓':rch?'🎁':'🔒')+'</span></div></div>';};
  for(let i=a;i<=b;i++)h+=row(i);if(b<SAGA_N)h+=row(SAGA_N);
  h+=xbnRaiseBtn('sg'+(((q.id%SAGA.length)+SAGA.length)%SAGA.length))?'<div class="btns">'+xbnRaiseBtn('sg'+(((q.id%SAGA.length)+SAGA.length)%SAGA.length))+'</div>':'';
  return h;}
function openSlava(seg){const s=SL();if(!s)return;if(seg)slSeg=seg;STAT.screen(slSeg==='tal'?'sl_tal':slSeg==='saga'?'sl_saga':'sl_fame');
  const keep=$('modal').classList.contains('on')&&$('mBody').getAttribute('data-w')==='slava'&&!seg?$('mBody').scrollTop:0;
  const T=[['fam',Lg('⭐ Слава','⭐ Fame')],['tal',Lg('🌳 Древо','🌳 Talents')],['saga',Lg('📜 Сказ','📜 Tale')]];
  let h='<h3>'+Lg('Слава воеводы','Commander’s Fame')+'</h3><div class="seg">'+T.map(([k,n])=>'<button class="'+(k===slSeg?'on':'')+'" data-sls="'+k+'">'+n+'</button>').join('')+'</div>';
  h+=slSeg==='tal'?slTalHTML(s):slSeg==='saga'?slSagaHTML():slFamHTML(s);
  h+='<div class="btns"><button class="btn big" id="slBack">'+Lg('Назад','Back')+'</button></div>';
  showModal(h,'slava');if(keep)$('mBody').scrollTop=keep;
  const re=()=>openSlava();
  on('slBack',()=>{slRes=0;hideModal();metaRe();});on('slToTal',()=>openSlava('tal'));
  on('slFamGet',()=>{const n=famClaim();if(n){SND.up();toast(Lg('Награды получены: ','Rewards collected: ')+n);}re();});
  on('slSagaGet',()=>{const n=sagaClaim();if(n){SND.up();toast(Lg('Награды Сказа: ','Tale rewards: ')+n);}re();});
  on('slReset',()=>{if(!slRes){slRes=1;re();return;}slRes=0;slTalReset();toast(Lg('Таланты сброшены — очки вернулись','Talents reset — points returned'));re();});
  for(const b of $('mBody').querySelectorAll('[data-sls]'))b.onclick=()=>{SND.click();slRes=0;openSlava(b.dataset.sls);$('mBody').scrollTop=0;};
  for(const b of $('mBody').querySelectorAll('[data-slb]'))b.onclick=()=>{SND.click();slBr=b.dataset.slb;slRes=0;re();};
  for(const b of $('mBody').querySelectorAll('[data-slt]'))b.onclick=()=>{slTalAdd(b.dataset.slt);re();};
  for(const b of $('mBody').querySelectorAll('[data-xbu]'))b.onclick=()=>{SND.click();S.bn=b.dataset.xbu;save();toast(Lg('Знамя реет над воротами!','The banner flies over the gate!'));re();};}
function slGoSeg(){const s=SL();return famReady(s)?'fam':slTalPts(s)>slTalSpent(s)?'tal':sagaReady(slSaga())?'saga':null;}
function slStatus(){const s=SL(),lv=slLv(s.x),a=[Lg('ур. ','lvl ')+lv.l+' · '+slRank()];if(famReady(s)||sagaReady(slSaga()))a.push(Lg('награда ждёт','reward waiting'));
  const f=slTalPts(s)-slTalSpent(s);if(f>0)a.push(Lg('таланты: ','talents: ')+f);return a.join(' · ');}

/* ---------- меню: плашка на карте, чип «Сегодня», карточка в деревне ---------- */
function slMapBtn(){if(!slVis())return '';const s=SL(),lv=slLv(s.x),rd=slReady();
  return '<button class="glbar mtile'+(rd?' hot':'')+'" id="slGo"><img src="'+ic('sl_fame',64)+'" alt=""><span class="t"><b>'+Lg('Слава ','Fame ')+lv.l+(rd?' 🎁':'')+'</b><small>'+slRank()+'</small><span class="bar"><i style="width:'+Math.round(lv.cur/lv.need*100)+'%"></i></span></span></button>';}
function slTODAY(a){try{if(!slVis()||!slReady())return;a.push({id:'slava',hot:1,t:Lg('⭐ Слава','⭐ Fame'),fn:()=>openSlava(slGoSeg())});}catch(e){slErr('today',e);}}
function slVIL(el){try{if(!slVis()||!el)return;slRetro();const d=document.createElement('div');d.className='card'+(slReady()?' next':'');d.id='slCard';
  d.innerHTML='<div class="row"><img class="ic" src="'+ic('sl_fame')+'" alt=""><div class="t"><b>'+Lg('⭐ Слава воеводы','⭐ Commander’s Fame')+'</b><span>'+slStatus()+'</span></div><button class="btn gold" id="slVGo">'+Lg('Открыть','Open')+'</button></div>';
  const at=el.querySelector('#bnBox');if(at)el.insertBefore(d,at);else el.appendChild(d);   // после построек, перед знамёнами (Торжок — выше)
  on('slVGo',()=>openSlava(slGoSeg()));}catch(e){slErr('vil',e);}}

if(typeof META_MODS!=='undefined')META_MODS.push({id:'slava',FIX:SL_FIX,MERGE:SL_MERGE,RUN:slRUN,ST:slTW,SCD:slSCD,KILL:slKILL,END:slEND,VIL:slVIL});   // фишки «Сегодня» нет: на карте своя плитка (MAP)
SL_FIX(S);  // первая загрузка: META_HK('FIX') ещё не знал модуля — чиним сами

/* ---------- общий блок меты в меню и в итогах (Слава + «Соседние заставы» + трофеи) ---------- */
// на «Карте» под «Сегодня»: зовёт META_HK('MAP',el) из renderMap
function metaMAP(el){try{const box=el&&el.querySelector('#tdBox');if(!box)return;slRetro();slQuestChk();let h=slMapBtn();if(typeof tourMapBtn==='function')h+=tourMapBtn();if(!h)return;
  const d=document.createElement('div');d.id='metaBox';d.className='metabox';d.innerHTML=h;box.parentNode.insertBefore(d,box.nextSibling);
  on('slGo',()=>openSlava(slGoSeg()));if(typeof tourMapBind==='function')tourMapBind();}catch(e){slErr('map',e);}}
// строки меты в окне итогов боя (META_HK('WIN',G,win) после показа окна): Слава · место среди соседей · трофеи
function metaWIN(G,win){try{const m=$('mBody');if(!m||!G||m.querySelector('.metaln'))return;
  const a=[slWinHtml(G),typeof tourWinHtml==='function'?tourWinHtml(G):'',G.trfHtml||''].filter(Boolean);if(!a.length)return;
  const d=document.createElement('div');d.className='goal metaln';d.setAttribute('data-fit','4');d.innerHTML=a.join(' · ');   // одной строкой: на низком экране убирается после «Завтра»/плашек
  const b=m.querySelector('.btns');if(b)m.insertBefore(d,b);else m.appendChild(d);
  if(typeof fitModal==='function')fitModal();
  // низкий экран: строку убрал fitModal — кладём её коротко внутрь плашки награды (её не убирают)
  const tr=m.querySelector('.treasury');if(d.style.display==='none'&&tr){d.remove();tr.insertAdjacentHTML('beforeend','<br><span class="note metaln">'+a.join(' · ')+'</span>');if(typeof fitModal==='function')fitModal();}
  if(typeof tourWinBind==='function')tourWinBind(G,win);}catch(e){slErr('win',e);}}
if(typeof META_MODS!=='undefined')META_MODS.push({id:'meta',MAP:metaMAP,WIN:metaWIN});
// стили плиток меты (свои, чтобы не трогать look.css): две плитки в ряд под «Сегодня»; строки меты в итогах
(function(){try{const st=document.createElement('style');st.textContent='.metabox{display:flex;gap:8px;margin:0 0 8px}.metabox .mtile{flex:1 1 0;min-width:0;margin:0}'+
  '.metabox .mtile .t{min-width:0}.metabox .mtile b,.metabox .mtile small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.metabox .mtile small{font-size:13px;opacity:.85;font-weight:700}'+
  '.metabox .mtile img{width:34px;height:34px}.metaln{font-size:15px;line-height:1.35}.metaln .mline{display:inline}'+
  '@supports not (inset:0){.metabox>*+*{margin-left:8px}}';document.head.appendChild(st);}catch(e){}})();

/* ---------- рисунки (стиль art.js) ---------- */
function slStar(g,r,r2,n){g.beginPath();for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,q=i%2?r2:r;g.lineTo(Math.cos(a)*q,Math.sin(a)*q);}g.closePath();}
art('sl_fame',64,g=>{for(const s of[-1,1])for(let i=0;i<6;i++){const a=Math.PI/2+s*(.35+i*.36),x=Math.cos(a)*22,y=Math.sin(a)*22;ell(g,x,y,5,2.6,'#5aa447',{rot:a+s*1.2,lw:.7});}
  glow(g,0,-2,24,'#ffe680');slStar(g,17,7.5,5);g.fillStyle=grad(g,0,-2,17,'#f2c230',.5,-.35);g.fill();outline(g,'#e0a82a',1.4);
  slStar(g,9,4,5);g.fillStyle='rgba(255,255,255,.35)';g.fill();shine(g,-4,-8,3,1.6,.6);});
art('sl_saga',64,g=>{for(const s of[-1,1])shp(g,'#f4e8c8',{hl:.25},[s<0?-26:0,-16,s<0?0:26,18],()=>{g.moveTo(0,-12);g.quadraticCurveTo(s*12,-18,s*25,-14);g.lineTo(s*25,16);g.quadraticCurveTo(s*12,12,0,18);g.closePath();});
  ln(g,[0,-12,0,18],'#a8733d',1.6);for(const s of[-1,1])for(const y of[-6,-1,4,9])ln(g,[s*5,y,s*20,y-2],'rgba(120,80,40,.5)',1.1);
  glow(g,12,-16,9,'#ffb347');poly(g,[10,-24,14,-16,20,-20,15,-12],'#e0453a',{lw:.7});});
art('sl_hour',40,g=>{glow(g,0,0,18,'#8ad0ff');for(const y of[-16,16]){rrect(g,-12,y-2,24,4,1.5);g.fillStyle='#8a5a2e';g.fill();}
  shp(g,'#e8f4ff',{hl:.4},[-10,-14,10,14],()=>{g.moveTo(-9,-14);g.lineTo(9,-14);g.quadraticCurveTo(9,-3,1.5,0);g.quadraticCurveTo(9,3,9,14);g.lineTo(-9,14);g.quadraticCurveTo(-9,3,-1.5,0);g.quadraticCurveTo(-9,-3,-9,-14);g.closePath();});
  poly(g,[-6,-9,6,-9,0,-1],'#f2c230',{ol:false});poly(g,[-7,13,7,13,0,6],'#f2c230',{ol:false});});

/* ---------- для проверки на своей машине: SLAVA.xp(n), SLAVA.open() ---------- */
const SLAVA={on:SL_ON,open:openSlava,lv:()=>SL()&&slLv(SL().x),xp(n){if(!LOCAL||!SL())return;SLAVA_ADD(n,'dev');save();}};
