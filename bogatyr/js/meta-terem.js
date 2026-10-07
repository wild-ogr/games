'use strict';
/* ================= Мета «Терем богатыря» — восстановление двора (11 уголков) + украшения двора (модуль terem, META_MODS, ENGINE-API §15) =================
   План — release-i/bogatyr-meta/plan.md п.8, п.10 (раздел 4.2). Журнал — release-h/bogatyr-chapters/logs/M-terem.md.
   Суть: СТОК золота и трофеев. Уголок — одна тема (Лесная опушка, Болотный мосток… Лунный садик), 5 шагов ремонта за золото (+ трофеи своей темы
   со 2-го шага); последний шаг — выбор 1 из 3 расцветок (потом перекрашивается бесплатно). Двор рисуется кодом слоями — с каждым шагом хорошеет.
   Награды — только красота: вымпел земли на плетне, украшения (петушок за первый уголок, золотой флюгер за все). Силы похода — НЕТ (ST/RUN не используются).
   Вход: карточка в деревне (VIL), строка в «Делах на сегодня» (TODAY), значок (CHIPS). Своей вкладки нет (кнопка в <nav> — только через index.html).
   Флаг: metaOn('terem') из meta.js — ?meta=all или ?meta=terem на своей машине; выключено → модуль молчит, S.terem не создаётся.
   Сейв: S.terem = {c:{тема:шагов 0–5}, v:{тема:расцветка 0–2}, d:{украшение:1}, h:{украшение:1 — спрятано}, sel:'тема', in:0|1, ts}
   STAT: scr terem · ev terem {a:step|deco|paint|hide, k, s, t(трофеев)} · ev spend {k:'terem:<тема><шаг>'|'terem:d_<id>', c} */
const TEREM_ON=typeof metaOn==='function'&&metaOn('terem');
function tmErr(w,x){tmErr.n=(tmErr.n||0)+1;if(tmErr.n<=5)console.warn('meta terem '+w+': '+(x&&x.message||x));}

/* ---------- уголки: имя, короткое имя (кнопка), цвет вымпела, 5 шагов, 3 расцветки последнего шага ---------- */
const TM_TH=['les','bol','pole','kosh','med','gory','more','luk','ogon','vihr','lih'];
const TM_C={
  les:{n:['Лесная опушка','Forest Edge'],sh:['Опушка','Edge'],col:'#3f9a3a',vc:['#d8382e','#3a6ab8','#e0a92e'],
    st:[['Убрать бурелом','Clear the windfall'],['Проложить тропку','Lay a path'],['Посадить ёлочки','Plant fir trees'],['Лавочка из пенька','Stump bench'],['Резной скворечник','Carved birdhouse']]},
  bol:{n:['Болотный мосток','Bog Bridge'],sh:['Мосток','Bridge'],col:'#4a8a6a',vc:['#c8743a','#d8382e','#3a6ab8'],
    st:[['Очистить пруд','Clean the pond'],['Мосток из досок','Plank bridge'],['Кувшинки','Water lilies'],['Камыш и рогоз','Reeds and cattails'],['Перила мостка','Bridge railings']]},
  pole:{n:['Цветущий луг','Flower Meadow'],sh:['Луг','Meadow'],col:'#d8b02a',vc:['#d8382e','#3a8ad8','#4ab83a'],
    st:[['Скосить бурьян','Mow the weeds'],['Стог сена','Haystack'],['Подсолнухи','Sunflowers'],['Весёлое пугало','Jolly scarecrow'],['Расписная телега','Painted cart']]},
  kosh:{n:['Кованая калитка','Wrought Gate'],sh:['Калитка','Gate'],col:'#8a6ad0',vc:['#ffc93a','#d8dce8','#e0864a'],
    st:[['Разобрать завал','Clear the rubble'],['Каменные столбы','Stone pillars'],['Кованая калитка','Wrought gate'],['Фонари на столбах','Pillar lanterns'],['Позолота калитки','Gilded gate']]},
  med:{n:['Медная горка','Copper Hill'],sh:['Горка','Hill'],col:'#d8803a',vc:['#2ab88a','#3a8ad8','#c86ad0'],
    st:[['Убрать валуны','Move the boulders'],['Ступени на горку','Steps up the hill'],['Медные колокольчики','Copper bells'],['Самоцветный ручей','Gem brook'],['Малахитовая чаша','Malachite bowl']]},
  gory:{n:['Горный родник','Mountain Spring'],sh:['Родник','Spring'],col:'#6a8ab8',vc:['#d8382e','#4ab83a','#3a6ab8'],
    st:[['Расчистить осыпь','Clear the scree'],['Каменная чаша','Stone basin'],['Пустить воду','Let the water run'],['Горные цветы','Mountain flowers'],['Резной навес','Carved canopy']]},
  more:{n:['Морская пристань','Sea Pier'],sh:['Пристань','Pier'],col:'#2a8ad8',vc:['#f4efe2','#d8382e','#ffc93a'],
    st:[['Вытащить коряги','Pull out the snags'],['Мостки-пристань','Wooden pier'],['Лодочка','Little boat'],['Ракушки и сети','Shells and nets'],['Парус','Sail']]},
  luk:{n:['Лукоморский дуб','Lukomorye Oak'],sh:['Дуб','Oak'],col:'#c8a03a',vc:['#4ab83a','#e8a82a','#e06a5a'],
    st:[['Вылечить дуб','Heal the oak'],['Златая цепь','Golden chain'],['Кот учёный','The Learned Cat'],['Сундук сказок','Chest of tales'],['Цвет листвы','Leaf color']]},
  ogon:{n:['Огненный очаг','Fire Hearth'],sh:['Очаг','Hearth'],col:'#e0502a',vc:['#ffc93a','#ff6a8a','#6ad0ff'],
    st:[['Вымести золу','Sweep the ashes'],['Каменный круг','Stone ring'],['Развести огонь','Light the fire'],['Котелок','Cooking pot'],['Фонарики','Lanterns']]},
  vihr:{n:['Ветряная горка','Windy Knoll'],sh:['Вертушка','Pinwheel'],col:'#5ac0d8',vc:['#d8382e','#3a6ab8','#e0a92e'],
    st:[['Поднять столб','Raise the pole'],['Ветряк-вертушка','Pinwheel'],['Воздушные змеи','Kites'],['Ленточки на ветру','Ribbons'],['Цвет крыльев','Wing colors']]},
  lih:{n:['Лунный садик','Moon Garden'],sh:['Садик','Garden'],col:'#6a5ab8',vc:['#ffe08a','#9ad8ff','#ffb0d8'],
    st:[['Разогнать туман','Clear the fog'],['Светлая тропка','Shining path'],['Светлячки','Fireflies'],['Лунные цветы','Moon flowers'],['Фонарь-звезда','Star lantern']]}};
// цена шага: золото растёт по теме (×1,3 на землю) и по шагу; трофеи своей темы — со 2-го шага
const TM_PR={g0:200,gk:1.3,gm:[1,1.25,1.5,1.8,2.2],tr:[0,4,8,12,20],trG:60};
// украшения двора: tr — трофеи по темам, g — золото; ev — за событие (first — первый готовый уголок, all — все уголки выпущенных земель)
const TM_D=[
  {id:'pet',n:['Петушок на плетне','Rooster on the fence'],ev:'first'},
  {id:'nal',n:['Резные наличники','Carved window frames'],tr:{les:15,bol:10},g:800},
  {id:'skv',n:['Скворечник','Birdhouse'],tr:{les:10,pole:10},g:600},
  {id:'kach',n:['Качели','Swing'],tr:{pole:15,bol:10},g:1200},
  {id:'sam',n:['Самовар на крыльце','Samovar on the porch'],tr:{kosh:10,med:15},g:2000},
  {id:'flag',n:['Флажки над двором','Bunting'],tr:{gory:15,more:10},g:2500},
  {id:'kot',n:['Кот на завалинке','Cat by the wall'],tr:{more:10,luk:15},g:3000},
  {id:'fon',n:['Фонарики под крышей','Eave lanterns'],tr:{ogon:20},g:3500},
  {id:'zm',n:['Воздушный змей','Kite'],tr:{vihr:20},g:4000},
  {id:'luna',n:['Лунный фонарь','Moon lantern'],tr:{lih:20},g:5000},
  {id:'fl',n:['Золотой флюгер','Golden weathervane'],ev:'all'}];
const TM_DB={};for(const d of TM_D)TM_DB[d.id]=d;
const tmL=a=>L(a[0],a[1]);

/* ---------- трофеи (виды задаёт модуль tro: TRO_DEF) ---------- */
const TM_TRC={les:['tr_les'],bol:['tr_bol'],pole:['tr_pole'],kosh:['tr_kosh'],med:['tr_med','tr_gory'],gory:['tr_gor2','tr_gory'],more:['tr_more'],luk:['tr_luk'],ogon:['tr_ogon'],vihr:['tr_vihr','tr_vih'],lih:['tr_lih']};
const TM_TRN={les:['клык','fang'],bol:['тина','duckweed'],pole:['перо','feather'],kosh:['косточка','bone'],med:['самоцвет','gem'],gory:['льдинка','ice shard'],more:['жемчуг','pearl'],luk:['жёлудь','acorn'],ogon:['уголёк','ember'],vihr:['облачко','cloud puff'],lih:['тень','shadow']};
function tmTroList(){let D=null;try{D=typeof TRO_DEF!=='undefined'?TRO_DEF:null;}catch(e){}if(!D||typeof D!=='object')return null;
  if(Array.isArray(D))return D.filter(x=>x&&x.id);const a=[];for(const k in D)if(D[k]&&typeof D[k]==='object')a.push({id:D[k].id||k,o:D[k]});return a.map(x=>x.o&&x.o!==x?Object.assign(Object.create(x.o),{id:x.id}):x);}
let tmTroC=null;
function tmTro(th){if(tmTroC&&th in tmTroC)return tmTroC[th];const l=tmTroList();if(!l)return null;tmTroC=tmTroC||{};
  let x=l.find(o=>(o.th||o.theme||o.t)===th);if(!x)for(const id of TM_TRC[th]||[]){x=l.find(o=>o.id===id&&!(o.th||o.theme||o.t)||o.id===id&&(o.th||o.theme||o.t)===th);if(x)break;}
  return tmTroC[th]=x?x.id:null;}
function tmTroO(id){const l=tmTroList();return l&&l.find(o=>o.id===id)||null;}
function tmTroName(th){const id=tmTro(th),o=id&&tmTroO(id);let n='';try{n=o&&(o.name||(o.ru?L(o.ru,o.en||o.ru):'')||(Array.isArray(o.n)?tmL(o.n):o.n))||'';}catch(e){}return n||tmL(TM_TRN[th]);}
function tmTroIc(th){const id=tmTro(th),o=id&&tmTroO(id);const k=o&&(o.ic||o.art||o.key);return k&&ART[k]?k:'tm_tro_'+th;}

/* ---------- цены ---------- */
const tmR10=x=>Math.round(x/10)*10;
// {g:золото, t:{id:n}, tt:{тема:n}} — трофей, которого нет в TRO_DEF, заменяется золотом
function tmPrice(o){const r={g:o.g||0,t:{},tt:{}};for(const th in o.tr||{}){const n=o.tr[th],id=tmTro(th);if(!n||!tmRel(th))continue; /* невыпущенная земля — её трофеи не просим */if(id){r.t[id]=(r.t[id]||0)+n;r.tt[th]=n;}else r.g+=n*TM_PR.trG;}r.g=tmR10(r.g);return r;}
function tmStepPrice(th,i){const k=TM_TH.indexOf(th);const tr={};if(TM_PR.tr[i])tr[th]=TM_PR.tr[i];return tmPrice({g:TM_PR.g0*Math.pow(TM_PR.gk,k)*TM_PR.gm[i],tr});}
function tmCan(p){if(S.gold<p.g)return false;for(const id in p.t)if(TRO_N(id)<p.t[id])return false;return true;}
function tmPay(p,key){if(!tmCan(p))return false;const tn=Object.keys(p.t).length;if(tn&&!TRO_SPEND(p.t))return false;S.gold-=p.g;
  try{if(p.g)STAT.ev('spend',{k:'terem:'+key,c:p.g});}catch(e){}setGold();return true;}

/* ---------- сейв ---------- */
function tmNew(){return {c:{},v:{},d:{},h:{},sel:'',in:0,ts:0};}
function tmFix(t){const ob=v=>v&&typeof v==='object'&&!Array.isArray(v),n=v=>typeof v==='number'&&isFinite(v)?v:0;
  for(const k of['c','v','d','h'])if(!ob(t[k]))t[k]={};
  for(const k in t.c)if(TM_C[k])t.c[k]=Math.max(0,Math.min(5,n(t.c[k])|0));else delete t.c[k];
  for(const k in t.v)if(TM_C[k])t.v[k]=Math.max(0,Math.min(2,n(t.v[k])|0));else delete t.v[k];
  for(const k of['d','h'])for(const i in t[k])if(TM_DB[i]&&t[k][i])t[k][i]=1;else delete t[k][i];
  if(typeof t.sel!=='string'||!TM_C[t.sel])t.sel='';t.in=n(t.in)?1:0;t.ts=n(t.ts);return t;}
function tmFixS(){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);if(S.terem!=null&&!ob(S.terem))S.terem=null;
  if(!S.terem){if(!TEREM_ON)return;S.terem=tmNew();}tmFix(S.terem);}catch(e){tmErr('fix',e);}}
// облако: шаги — максимум, украшения — объединение, расцветки/спрятанное/выбор — из более нового (ts)
function tmMerge(d,o){try{const ob=v=>v&&typeof v==='object'&&!Array.isArray(v);const b=ob(d)&&ob(d.terem)?d.terem:null;if(!b)return;
  const a=ob(o.terem)?o.terem:null;if(!a){o.terem=tmFix(JSON.parse(JSON.stringify(b)));return;}
  const A=tmFix(JSON.parse(JSON.stringify(a))),B=tmFix(JSON.parse(JSON.stringify(b))),nw=B.ts>A.ts?B:A,r=tmNew();
  for(const k in Object.assign({},A.c,B.c))r.c[k]=Math.max(A.c[k]|0,B.c[k]|0);
  r.d=Object.assign({},A.d,B.d);r.v=Object.assign({},nw===A?B.v:A.v,nw.v);r.h=Object.assign({},nw.h);r.sel=nw.sel;r.in=Math.max(A.in,B.in);r.ts=Math.max(A.ts,B.ts);
  o.terem=r;}catch(e){tmErr('merge',e);}}
tmFixS(); // самая первая загрузка: META_HK('FIX') ещё не объявлен — чиним сами
function TM(){return TEREM_ON&&S.terem||null;}
function tmTouch(){const t=TM();if(t)t.ts=Date.now();}
function tmEv(a,k,x){try{const p={a:a};if(k)p.k=k;if(x)for(const i in x)p[i]=x[i];STAT.ev('terem',p);}catch(e){}}

/* ---------- что открыто ---------- */
function tmSlot1(th){const r=CAMP.find(x=>x.th===th&&x.n===1);return r?r.slot:-1;}
function tmRel(th){const s=tmSlot1(th);return s>=0&&ORD.indexOf(s)>=0;}          // земля выпущена (есть в кампании)
function tmThOpen(th){const s=tmSlot1(th);return tmRel(th)&&!!S.done[s];}           // уголок открыт: освобождена 1-я глава земли
function tmOpen(){const t=TM();return !!t&&(S.runs|0)>=3&&!!S.done[0];}           // новичку (первые 3 похода) — ничего
function tmCorners(){return TM_TH.filter(tmRel);}
function tmStepsAll(){const t=TM();let n=0;if(t)for(const th of tmCorners())n+=t.c[th]|0;return n;}
function tmDoneN(){const t=TM();return t?tmCorners().filter(th=>(t.c[th]|0)>=5).length:0;}
function tmDecoOpen(d){if(d.ev)return true;for(const th in d.tr||{})if(tmRel(th)&&!tmThOpen(th))return false;return true;}
function tmDecoVis(d){return !!d.ev||Object.keys(d.tr||{}).some(tmRel);} // все земли украшения не выпущены — не показываем
// следующее дело, на которое уже хватает (для деревни и «Дел на сегодня»)
function tmAfford(){const t=TM();if(!t)return null;for(const th of tmCorners()){const i=t.c[th]|0;if(i<5&&tmThOpen(th)&&tmCan(tmStepPrice(th,i)))return {th,i};}
  for(const d of TM_D)if(!d.ev&&!t.d[d.id]&&tmDecoVis(d)&&tmDecoOpen(d)&&tmCan(tmPrice(d)))return {d:d.id};return null;}
function tmCur(){const t=TM();if(!t)return '';if(t.sel&&tmThOpen(t.sel))return t.sel;const o=tmCorners().filter(tmThOpen);return o.find(th=>(t.c[th]|0)<5)||o[0]||'les';}
function tmStatus(){const t=TM(),a=tmAfford(),th=tmCur();if(!t)return '';const s=t.c[th]|0;
  let r=L('Двор: ','Yard: ')+tmStepsAll()+'/'+tmCorners().length*5;
  if(a&&a.th)r+=' · '+L('хватает на «','you can afford “')+tmL(TM_C[a.th].st[a.i])+L('»','”');
  else if(a&&a.d)r+=' · '+L('можно взять: ','you can get: ')+tmL(TM_DB[a.d].n);
  else if(s<5)r+=' · '+tmL(TM_C[th].sh)+' '+s+'/5';
  return r;}

/* ---------- действия ---------- */
function tmStep(th,vi){const t=TM();if(!t||!tmThOpen(th))return false;const i=t.c[th]|0;if(i>=5)return false;const p=tmStepPrice(th,i);
  if(!tmPay(p,th+(i+1)))return false;t.c[th]=i+1;if(i===4)t.v[th]=Math.max(0,Math.min(2,vi|0));t.sel=th;tmTouch();
  const tn=Object.values(p.t).reduce((a,b)=>a+b,0);tmEv('step',th,{s:i+1,t:tn});
  if(i===4){tmEv('corner',th,{n:tmDoneN()});tmEvents();}save();SND.chest();
  toast(i===4?L('Уголок «'+tmL(TM_C[th].n)+'» готов! Вымпел — на плетне','“'+tmL(TM_C[th].n)+'” is restored! A pennant flies on the fence'):tmL(TM_C[th].st[i])+L(' — готово!',' — done!'));return true;}
function tmPaint(th,vi){const t=TM();if(!t||(t.c[th]|0)<5)return;t.v[th]=Math.max(0,Math.min(2,vi|0));tmTouch();save();SND.click();tmEv('paint',th,{v:t.v[th]});}
function tmDeco(id){const t=TM(),d=TM_DB[id];if(!t||!d||d.ev||t.d[id]||!tmDecoVis(d)||!tmDecoOpen(d))return false;const p=tmPrice(d);if(!tmPay(p,'d_'+id))return false;
  t.d[id]=1;delete t.h[id];tmTouch();save();SND.chest();tmEv('deco',id,{t:Object.values(p.t).reduce((a,b)=>a+b,0)});toast(tmL(d.n)+L(' — во дворе!',' — added to the yard!'));return true;}
function tmHide(id){const t=TM();if(!t||!t.d[id])return;if(t.h[id])delete t.h[id];else t.h[id]=1;tmTouch();save();SND.click();tmEv('hide',id,{h:t.h[id]?1:0});}
// украшения за события
function tmEvents(){const t=TM();if(!t)return;const give=id=>{if(t.d[id])return;t.d[id]=1;tmTouch();tmEv('deco',id,{ev:1});setTimeout(()=>toast(L('Подарок: ','Gift: ')+tmL(TM_DB[id].n)+'!'),1600);};
  const n=tmDoneN(),all=tmCorners().length;if(n>=1)give('pet');if(all&&n>=all)give('fl');}

/* ================= рисунки кодом (примитивы art.js: ell/shp/rrect/ln/glow/shine, стиль — мягкий контур и блики) ================= */
function tmArt(g,key,x,y,s){const a=ART[key];if(!a)return;g.save();g.translate(x,y);g.scale(s,s);g.lineJoin='round';g.lineCap='round';try{a.fn(g);}catch(e){}g.restore();}
// «выцветание»: запущенный уголок серый, с каждым шагом — ярче
function tmDesat(g,a,W,H){if(a<=0)return;g.save();g.globalCompositeOperation='saturation';g.globalAlpha=a;g.fillStyle='#808080';g.fillRect(-400,-400,W+800,H+800);g.restore();}
function tmSky(g,c1,c2,c3,c4,hz){const W=600,sk=g.createLinearGradient(0,0,0,110);sk.addColorStop(0,c1);sk.addColorStop(hz/110-.005,c2);sk.addColorStop(hz/110,c3);sk.addColorStop(1,c4);g.fillStyle=sk;g.fillRect(-200,-10,W,140);}
function tmFir(g,x,y,s,c){c=c||'#2f8a3a';ln(g,[x,y,x,y-4*s],'#7a4a26',2.2*s);for(let i=0;i<3;i++){const w=(11-i*3)*s,yy=y-4*s-i*7*s;shp(g,c,{hl:.35,lw:.8},[x-w,yy-11*s,x+w,yy],()=>{g.moveTo(x-w,yy);g.lineTo(x,yy-11*s);g.lineTo(x+w,yy);g.closePath();});}}
function tmFlower(g,x,y,c,s){s=s||1;ln(g,[x,y,x,y-6*s],'#3f8a2a',1.1*s);for(let i=0;i<5;i++){const a=i*TAU/5;ell(g,x+Math.cos(a)*2.2*s,y-6*s+Math.sin(a)*2.2*s,1.8*s,1.8*s,c,{ol:false,flat:true});}ell(g,x,y-6*s,1.3*s,1.3*s,'#ffd84a',{ol:false,flat:true});}
function tmStone(g,x,y,r,c){ell(g,x,y,r,r*.72,c||'#9a9aa6',{hl:.4,lw:.9});}
function tmGrass(g,x0,x1,y,c){g.strokeStyle=c||'#3f8a2a';g.lineWidth=1.1;for(let x=x0;x<x1;x+=5){const h=3+((x*37)%5);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+1,y-h*.6,x+2,y-h);g.stroke();}}
function tmLog(g,x,y,l,a){g.save();g.translate(x,y);g.rotate(a);rrect(g,-l/2,-4,l,8,4);g.fillStyle=grad(g,0,0,l/2,'#8a5a2e',.25,-.35);g.fill();outline(g,'#8a5a2e',1);ell(g,l/2-1,0,3,4,'#c8925a',{lw:.7});g.restore();}
function tmPost(g,x,y,h,c){rrect(g,x-2.5,y-h,5,h,1.5);g.fillStyle=grad(g,x,y-h/2,h/2,c||'#8a5a2e',.3,-.3);g.fill();outline(g,c||'#8a5a2e',.9);}
// ---- 11 уголков: поле 200×110, s — шагов сделано (0–5), v — цвет расцветки (после 5-го шага) ----
const TM_DRAW={
  les(g,s,v){tmSky(g,'#7ac0ff','#d8f0ff','#9ad46a','#5aa447',58);
    for(const [x,h] of[[-10,1],[14,1.3],[36,1.1],[170,1.2],[196,1.4],[218,1]])tmFir(g,x,58,h*1.1,'#2a6a32'); // лес позади
    if(s>=2){shp(g,'#e8c88a',{ol:false,flat:true},[60,58,150,112],()=>{g.moveTo(92,58);g.quadraticCurveTo(80,80,60,112);g.lineTo(110,112);g.quadraticCurveTo(108,82,104,58);g.closePath();});for(const [x,y] of[[86,70],[80,84],[74,98],[96,92]])tmStone(g,x,y,2.2,'#c8b08a');}
    tmGrass(g,-20,220,72,'#4a9a3a');
    if(s>=1)for(const [x,y,c] of[[30,86,'#ff6a8a'],[44,98,'#ffd84a'],[150,96,'#9a7aff'],[170,84,'#ff6a8a'],[126,104,'#fff']])tmFlower(g,x,y,c);
    if(s>=3)for(const [x,y,k] of[[22,82,1.2],[176,78,1.1],[148,72,.8]])tmFir(g,x,y,k);
    if(s>=4){ell(g,130,96,13,4,'rgba(0,0,0,.15)',{ol:false,flat:true});rrect(g,119,84,22,12,3);g.fillStyle=grad(g,130,90,12,'#a8733d',.3,-.3);g.fill();outline(g,'#a8733d',1);ell(g,130,84,11,3.4,'#e0b47a',{lw:.8});g.strokeStyle='rgba(120,70,30,.6)';g.lineWidth=.7;for(const r of[3,6,9]){g.beginPath();g.ellipse(130,84,r,r*.3,0,0,TAU);g.stroke();}}
    if(s>=5){tmPost(g,52,96,44,'#8a5a2e');const c=v||'#d8382e';shp(g,c,{hl:.4},[40,40,64,54],()=>{g.moveTo(40,54);g.lineTo(52,40);g.lineTo(64,54);g.closePath();});rrect(g,43,53,18,16,2);g.fillStyle=grad(g,52,60,10,'#e8c88a',.3,-.25);g.fill();outline(g,'#c8a06a',1);ell(g,52,60,3.4,3.4,'#3a2410',{ol:false});
      g.fillStyle='#fff';for(const x of[44,48,52,56,60]){g.beginPath();g.arc(x,54,1.3,0,TAU);g.fill();}ell(g,58,47,3,2.4,'#5a4a3a',{lw:.5});ell(g,60.5,46,1,.7,'#ffb52a',{ol:false});}
    if(s<1){tmLog(g,60,88,54,.15);tmLog(g,140,94,46,-.2);tmLog(g,100,80,36,.5);g.strokeStyle='#6a4a2a';g.lineWidth=2;for(const [x,y,a] of[[40,96,-.6],[160,82,.7],[118,102,-.3],[84,100,.4]]){g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*14,y+Math.sin(a)*14);g.moveTo(x+Math.cos(a)*7,y+Math.sin(a)*7);g.lineTo(x+Math.cos(a)*7+5,y+Math.sin(a)*7-5);g.stroke();}}},
  bol(g,s,v){tmSky(g,'#8ac8f0','#e0f2ff','#8ac06a','#5a9a4a',50);tmGrass(g,-20,220,62,'#4a8a3a');
    ell(g,100,86,82,20,s>=1?'#4aa8e0':'#6a7a3a',{hl:.25,lw:1.4});
    if(s>=1){g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1.1;for(const [x,y] of[[60,84],[130,90],[150,80]]){g.beginPath();g.moveTo(x-8,y);g.quadraticCurveTo(x,y-2,x+8,y);g.stroke();}}
    else{for(const [x,y,r] of[[60,88,2],[120,82,1.5],[140,92,2.2],[90,94,1.4]])ell(g,x,y,r,r,'#8a9a4a',{lw:.5});ln(g,[70,80,64,68,58,74],'#5a3a1a',2.4);ln(g,[136,84,142,70,150,66],'#5a3a1a',2.4);}
    if(s>=3)for(const [x,y,c] of[[40,92,'#fff'],[150,94,'#ffb0d8'],[164,82,'#fff']]){ell(g,x+2,y+1,6,2.4,'#4ab83a',{lw:.6});for(let i=0;i<5;i++)ell(g,x+Math.cos(i*TAU/5)*2,y-1.4+Math.sin(i*TAU/5)*1,2,1.4,c,{lw:.4});ell(g,x,y-1.6,1,1,'#ffd84a',{ol:false});}
    if(s>=4)for(const x of[14,22,28,178,186]){ln(g,[x,90,x+1,62],'#4a8a2a',1.4);rrect(g,x-1.6,62,3.6,10,1.6);g.fillStyle='#7a4a26';g.fill();}
    if(s>=2){shp(g,'#a8733d',{hl:.3},[40,70,160,84],()=>{g.moveTo(40,82);g.quadraticCurveTo(100,64,160,82);g.lineTo(160,88);g.quadraticCurveTo(100,70,40,88);g.closePath();});g.strokeStyle='rgba(80,40,10,.6)';g.lineWidth=.8;for(let x=48;x<156;x+=8){const yy=82-Math.sin((x-40)/120*Math.PI)*15;g.beginPath();g.moveTo(x,yy);g.lineTo(x,yy+6);g.stroke();}
      for(const x of[46,154]){tmPost(g,x,96,12,'#7a4a26');}}
    if(s>=5){const c=v||'#c8743a';for(let x=48;x<=152;x+=13){const yy=80-Math.sin((x-40)/120*Math.PI)*15;ln(g,[x,yy,x,yy-10],c,2.2);}g.beginPath();for(let x=44;x<=156;x+=2){const yy=70-Math.sin((x-40)/120*Math.PI)*15;x===44?g.moveTo(x,yy):g.lineTo(x,yy);}g.lineWidth=3;g.strokeStyle=c;g.stroke();g.lineWidth=1;g.strokeStyle=shade(c,-.5);g.stroke();}},
  pole(g,s,v){tmSky(g,'#6ab8ff','#d8f0ff','#c8d86a','#8ab84a',54);
    if(s>=1){tmGrass(g,-20,220,66,'#6aa83a');for(let i=0;i<16;i++)tmFlower(g,(i*53)%200,70+(i*29)%38,['#ff6a8a','#fff','#9a7aff','#ffd84a'][i%4],.8);}
    if(s>=2){ell(g,150,94,26,6,'rgba(0,0,0,.15)',{ol:false,flat:true});shp(g,'#e8c45a',{hl:.45},[126,52,174,94],()=>{g.moveTo(126,94);g.quadraticCurveTo(124,58,150,52);g.quadraticCurveTo(176,58,174,94);g.closePath();});g.strokeStyle='rgba(160,110,30,.55)';g.lineWidth=.9;for(const y of[64,74,84]){g.beginPath();g.moveTo(130,y);g.quadraticCurveTo(150,y-4,170,y);g.stroke();}ln(g,[150,52,150,44],'#8a5a2e',1.6);}
    if(s>=3)for(const [x,h] of[[14,40],[28,46],[186,38]]){ln(g,[x,96,x,96-h],'#4a8a2a',2);ell(g,x+4,96-h*.5,4,2,'#5ac83a',{rot:-.4,lw:.5});for(let i=0;i<10;i++){const a=i*TAU/10;ell(g,x+Math.cos(a)*6,96-h+Math.sin(a)*6,3,1.6,'#ffc72a',{rot:a,lw:.5});}ell(g,x,96-h,4.4,4.4,'#6a4022',{lw:.6});}
    if(s>=4){ln(g,[96,100,96,56],'#8a5a2e',2.4);ln(g,[82,66,110,66],'#8a5a2e',2.2);shp(g,'#3a6ab8',{hl:.3},[86,62,106,90],()=>{g.moveTo(88,64);g.lineTo(104,64);g.lineTo(108,90);g.lineTo(84,90);g.closePath();});
      ell(g,96,54,7,7,'#f2d8a0',{lw:.8});eye(g,93.5,53,1.5,{px:0});eye(g,98.5,53,1.5,{px:0});mouth(g,96,57,2.4,'#7a3a2a',1);shp(g,'#e8c45a',{hl:.4},[86,42,106,52],()=>{g.moveTo(86,50);g.quadraticCurveTo(96,38,106,50);g.closePath();});ell(g,82,66,2.4,2.4,'#e8c45a',{lw:.5});ell(g,110,66,2.4,2.4,'#e8c45a',{lw:.5});}
    if(s>=5){const c=v||'#d8382e';rrect(g,36,82,40,12,3);g.fillStyle=grad(g,56,88,20,c,.35,-.3);g.fill();outline(g,c,1);g.fillStyle='#fff';for(const x of[44,56,68]){g.beginPath();g.arc(x,88,2,0,TAU);g.fill();}
      for(const x of[42,70]){ell(g,x,96,6,6,'#8a5a2e',{lw:1});ln(g,[x-5,96,x+5,96],'#5a3a1a',.8);ln(g,[x,91,x,101],'#5a3a1a',.8);}ln(g,[76,86,92,80],'#8a5a2e',1.8);}
    if(s<1){for(let i=0;i<26;i++){const x=(i*41)%210-5,y=66+(i*23)%44;g.strokeStyle='#6a7a4a';g.lineWidth=1.3;g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y-14);g.moveTo(x,y);g.lineTo(x+4,y-12);g.moveTo(x,y);g.lineTo(x+1,y-18);g.stroke();}}},
  kosh(g,s,v){tmSky(g,'#8aa8e0','#e0e8ff','#9ac07a','#6a9a5a',62);tmGrass(g,-20,220,76,'#4a8a3a');
    // плетень по бокам — калитка в нём
    for(let x=-10;x<200;x+=9)if(x<64||x>136){rrect(g,x-2,54,4,26,1.5);g.fillStyle='#a8733d';g.fill();}ln(g,[-10,62,64,62],'#8a5a2e',2);ln(g,[136,62,210,62],'#8a5a2e',2);ln(g,[-10,72,64,72],'#8a5a2e',2);ln(g,[136,72,210,72],'#8a5a2e',2);
    if(s>=2)for(const x of[66,134]){rrect(g,x-7,36,14,48,2);g.fillStyle=grad(g,x,58,24,'#b8b4aa',.3,-.3);g.fill();outline(g,'#b8b4aa',1);rrect(g,x-9,32,18,6,2);g.fillStyle='#d0ccc2';g.fill();outline(g,'#b8b4aa',.8);g.strokeStyle='rgba(80,70,60,.4)';g.lineWidth=.7;for(const y of[46,58,70]){g.beginPath();g.moveTo(x-7,y);g.lineTo(x+7,y);g.stroke();}}
    if(s>=3){const c=s>=5?(v||'#ffc93a'):'#4a4a5a';g.strokeStyle=c;g.lineWidth=2.2;for(const x0 of[74,100]){g.strokeRect(x0,44,26,38);for(let x=x0+6;x<x0+26;x+=6){g.beginPath();g.moveTo(x,44);g.lineTo(x,82);g.stroke();}g.beginPath();g.arc(x0+13,58,6,0,TAU);g.stroke();}
      if(s>=5){g.lineWidth=.8;g.strokeStyle=shade(c,-.5);for(const x0 of[74,100])g.strokeRect(x0-1,43,28,40);}
      for(const x of[87,113]){g.beginPath();g.moveTo(x-6,44);g.quadraticCurveTo(x,34,x+6,44);g.lineWidth=2;g.strokeStyle=c;g.stroke();}}
    if(s>=4)for(const x of[66,134]){ln(g,[x,32,x,26],'#4a4a5a',1.4);glow(g,x,20,14,'#ffd84a');rrect(g,x-4,16,8,9,2);g.fillStyle='rgba(255,230,140,.9)';g.fill();outline(g,'#4a4a5a',1);shp(g,'#4a4a5a',{ol:false},[x-5,11,x+5,16],()=>{g.moveTo(x-5,16);g.lineTo(x,11);g.lineTo(x+5,16);g.closePath();});}
    if(s<1){for(const [x,y,r] of[[80,82,10],[100,78,13],[118,84,9],[92,92,8],[110,94,7],[70,94,6],[130,92,7]])tmStone(g,x,y,r,'#8a8a94');tmLog(g,100,70,40,-.3);}},
  med(g,s,v){tmSky(g,'#ffc88a','#ffeed8','#a8b46a','#7a9a4a',70);
    shp(g,'#c8743a',{hl:.25,lw:1.4},[30,30,170,90],()=>{g.moveTo(20,90);g.quadraticCurveTo(60,30,100,28);g.quadraticCurveTo(140,30,180,90);g.closePath();});
    g.strokeStyle='rgba(255,220,160,.45)';g.lineWidth=1.4;for(const [a,b,c,d] of[[50,70,80,50],[120,46,150,70],[90,40,110,44]]){g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();}
    tmGrass(g,-20,220,92,'#5a9a3a');
    if(s>=2)for(let i=0;i<5;i++){const y=86-i*11,w=26-i*3;rrect(g,100-w/2,y-4,w,5,1.5);g.fillStyle=grad(g,100,y,w/2,'#b8b4aa',.35,-.3);g.fill();outline(g,'#9a968a',.8);}
    if(s>=3){ln(g,[56,64,56,40],'#6a4022',2.2);ln(g,[84,46,84,30],'#6a4022',2.2);ln(g,[56,40,84,30],'#6a4022',2);for(const t of[.25,.55,.85]){const x=56+28*t,y=40-10*t;ln(g,[x,y,x,y+4],'#6a4022',.8);shp(g,'#e0864a',{hl:.5,lw:.7},[x-4,y+3,x+4,y+11],()=>{g.moveTo(x-3.5,y+11);g.quadraticCurveTo(x-3.5,y+3,x,y+3);g.quadraticCurveTo(x+3.5,y+3,x+3.5,y+11);g.closePath();});ell(g,x,y+11.5,1.1,1.1,'#8a4a1a',{ol:false});}}
    if(s>=4){g.beginPath();g.moveTo(150,44);g.quadraticCurveTo(140,70,160,96);g.lineWidth=6;g.strokeStyle='#5ac8e0';g.stroke();g.lineWidth=2;g.strokeStyle='rgba(255,255,255,.6)';g.stroke();
      for(const [x,y,c] of[[146,60,'#2ab88a'],[154,82,'#c86ad0'],[166,96,'#3a8ad8'],[140,96,'#2ab88a']]){g.save();g.translate(x,y);gem(g,3.2,c);g.restore();}}
    if(s>=5){const c=v||'#2ab88a';ell(g,40,98,16,4,'rgba(0,0,0,.15)',{ol:false,flat:true});shp(g,c,{hl:.5},[26,78,54,98],()=>{g.moveTo(26,80);g.quadraticCurveTo(28,94,40,94);g.quadraticCurveTo(52,94,54,80);g.closePath();});rrect(g,36,94,8,4,1);g.fillStyle=c;g.fill();ell(g,40,80,14,3.4,shade(c,.25),{lw:.8});shine(g,32,85,3,1.4,.6);}
    if(s<1)for(const [x,y,r] of[[60,88,11],[96,96,9],[140,90,12],[118,70,8],[76,64,7]])tmStone(g,x,y,r,'#8a7a6a');},
  gory(g,s,v){tmSky(g,'#9ad0ff','#eaf6ff','#9ac07a','#6a9a5a',74);
    shp(g,'#8a94a8',{hl:.25,lw:1.3},[60,12,200,90],()=>{g.moveTo(60,90);g.lineTo(96,30);g.lineTo(116,44);g.lineTo(140,12);g.lineTo(176,52);g.lineTo(200,40);g.lineTo(206,90);g.closePath();});
    shp(g,'#fff',{ol:false,flat:true},[128,12,154,28],()=>{g.moveTo(132,28);g.lineTo(140,12);g.lineTo(152,28);g.lineTo(146,24);g.lineTo(140,28);g.closePath();});
    tmGrass(g,-20,220,92,'#4a8a3a');
    if(s>=2){ell(g,92,96,24,6,'rgba(0,0,0,.15)',{ol:false,flat:true});shp(g,'#b8b4aa',{hl:.35},[68,80,116,98],()=>{g.moveTo(68,82);g.quadraticCurveTo(70,98,92,98);g.quadraticCurveTo(114,98,116,82);g.closePath();});ell(g,92,82,24,5,s>=3?'#6ac8f0':'#9a968a',{lw:1});}
    if(s>=3){rrect(g,104,56,6,4,1);g.fillStyle='#8a5a2e';g.fill();g.beginPath();g.moveTo(104,58);g.quadraticCurveTo(96,62,96,82);g.lineWidth=3.4;g.strokeStyle='#8ad8ff';g.stroke();g.lineWidth=1;g.strokeStyle='#fff';g.stroke();for(const [x,y] of[[90,80],[100,79],[94,78]])ell(g,x,y,1.4,1,'#fff',{ol:false});}
    if(s>=4)for(const [x,y] of[[30,96],[44,88],[150,100],[170,94],[130,92]]){for(let i=0;i<6;i++)ell(g,x+Math.cos(i*TAU/6)*2.6,y-5+Math.sin(i*TAU/6)*2.6,1.8,1.1,'#fff',{rot:i*TAU/6,lw:.4});ell(g,x,y-5,1.3,1.3,'#ffd84a',{ol:false});ln(g,[x,y,x,y-4],'#3f8a2a',1);}
    if(s>=5){const c=v||'#d8382e';for(const x of[66,118])tmPost(g,x,98,40,'#8a5a2e');shp(g,c,{hl:.35},[58,40,126,60],()=>{g.moveTo(58,60);g.lineTo(92,40);g.lineTo(126,60);g.lineTo(120,60);g.lineTo(92,46);g.lineTo(64,60);g.closePath();});g.fillStyle='#fff';for(let x=70;x<=114;x+=8){const yy=56-(14-Math.abs(x-92)*.6);g.beginPath();g.moveTo(x-3,yy);g.lineTo(x,yy+4);g.lineTo(x+3,yy);g.fill();}}
    if(s<1){for(const [x,y,r] of[[70,92,8],[84,86,6],[100,94,9],[114,88,6],[124,96,5],[90,100,5],[60,100,4]])tmStone(g,x,y,r,'#7a7a86');}},
  more(g,s,v){tmSky(g,'#6ab8ff','#d8f0ff','#3a8ad8','#2a6ab8',56);
    shp(g,'#e8d4a0',{ol:false,flat:true},[-20,70,220,112],()=>{g.moveTo(-20,78);g.quadraticCurveTo(80,66,220,80);g.lineTo(220,112);g.lineTo(-20,112);g.closePath();});
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.2;for(const [x,y] of[[20,62],[90,60],[150,64],[60,68],[180,58]]){g.beginPath();g.moveTo(x-8,y);g.quadraticCurveTo(x-4,y-3,x,y);g.quadraticCurveTo(x+4,y-3,x+8,y);g.stroke();}
    if(s>=2){for(const x of[118,134,150,166])tmPost(g,x,82,20,'#7a4a26');rrect(g,110,58,66,7,2);g.fillStyle=grad(g,143,61,34,'#a8733d',.3,-.3);g.fill();outline(g,'#a8733d',1);shp(g,'#a8733d',{hl:.3},[96,64,116,82],()=>{g.moveTo(110,58);g.lineTo(116,65);g.lineTo(100,84);g.lineTo(94,80);g.closePath();});}
    if(s>=3){shp(g,'#c8743a',{hl:.35},[136,40,196,58],()=>{g.moveTo(138,44);g.lineTo(194,44);g.quadraticCurveTo(186,58,166,58);g.quadraticCurveTo(146,58,138,44);});ln(g,[140,48,192,48],'#f4efe2',1.2);
      if(s>=5){const c=v||'#f4efe2';ln(g,[166,44,166,6],'#6a4022',1.8);shp(g,c,{hl:.4},[150,8,186,40],()=>{g.moveTo(168,8);g.quadraticCurveTo(190,22,184,40);g.lineTo(168,40);g.closePath();});shp(g,c,{hl:.4},[150,12,165,40],()=>{g.moveTo(164,12);g.quadraticCurveTo(150,28,152,40);g.lineTo(164,40);g.closePath();});}}
    if(s>=4){g.strokeStyle='rgba(90,60,30,.8)';g.lineWidth=.8;for(let i=0;i<5;i++){g.beginPath();g.moveTo(20+i*6,84);g.lineTo(26+i*6,104);g.stroke();g.beginPath();g.moveTo(18,88+i*4);g.lineTo(52,86+i*4);g.stroke();}
      for(const [x,y,c] of[[64,98,'#ffb0c8'],[80,104,'#fff0d8'],[44,106,'#ffc8a0']]){shp(g,c,{hl:.4,lw:.7},[x-5,y-5,x+5,y+2],()=>{g.moveTo(x-5,y+2);g.quadraticCurveTo(x-5,y-5,x,y-5);g.quadraticCurveTo(x+5,y-5,x+5,y+2);g.closePath();});for(const d of[-2.5,0,2.5])ln(g,[x,y+2,x+d,y-4],'rgba(160,80,60,.5)',.6);}}
    if(s<1){tmLog(g,40,92,44,.3);tmLog(g,120,98,50,-.15);ln(g,[150,90,160,74,172,70],'#5a3a1a',2.6);ln(g,[160,74,156,66],'#5a3a1a',2);for(const [x,y] of[[70,104],[96,92]])ell(g,x,y,4,2,'#6a8a3a',{lw:.5});}},
  luk(g,s,v){tmSky(g,'#7ac0ff','#e0f2ff','#9ad06a','#5aa447',80);
    shp(g,'#3a8ad8',{ol:false,flat:true},[-20,70,220,82],()=>{g.moveTo(-20,80);g.quadraticCurveTo(60,72,220,78);g.lineTo(220,82);g.lineTo(-20,84);g.closePath();});tmGrass(g,-20,220,90,'#4a9a3a');
    // ствол
    shp(g,'#7a4a26',{hl:.25,lw:1.2},[84,40,116,100],()=>{g.moveTo(84,100);g.quadraticCurveTo(92,80,92,44);g.lineTo(108,44);g.quadraticCurveTo(108,80,116,100);g.closePath();});
    if(s>=1){const c=s>=5?(v||'#4ab83a'):'#4ab83a';for(const [x,y,r] of[[70,36,22],[130,36,22],[100,22,26],[84,14,16],[118,14,16],[100,44,18]])ell(g,x,y,r,r*.8,c,{hl:.35,lw:1});if(s>=5&&v==='#e8a82a')for(const [x,y] of[[64,40],[136,30],[96,14]])ell(g,x,y,2,1.4,'#c8602a',{ol:false});}
    else{g.strokeStyle='#6a5a4a';g.lineWidth=2.4;for(const [a,b,c,d] of[[92,46,70,24],[108,46,132,22],[100,44,100,8],[80,32,66,30],[120,30,136,36]]){g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();}ell(g,72,26,6,3,'#8a8a6a',{lw:.5});}
    if(s>=2){for(const y of[58,66,74]){g.beginPath();g.ellipse(100,y,12+(y-58)*.15,3,0,0,Math.PI);g.lineWidth=2;g.strokeStyle='#ffc93a';g.setLineDash([2.4,1.4]);g.stroke();g.setLineDash([]);}}
    if(s>=3){const x=124,y=80;ell(g,x,y,7,8,'#6a6a7a',{hl:.4,lw:.8});ell(g,x,y-10,6,5.4,'#6a6a7a',{hl:.4,lw:.8});for(const d of[-1,1])shp(g,'#6a6a7a',{lw:.6},[x+d*6,y-18,x+d*2,y-12],()=>{g.moveTo(x+d*5.5,y-11);g.lineTo(x+d*5,y-18);g.lineTo(x+d*1.5,y-14);g.closePath();});
      eye(g,x-2.3,y-10.5,1.5,{px:0,col:'#3a8a3a'});eye(g,x+2.3,y-10.5,1.5,{px:0,col:'#3a8a3a'});ell(g,x,y-8,.9,.6,'#e88a9a',{ol:false});g.beginPath();g.moveTo(x+6,y+6);g.quadraticCurveTo(x+14,y+4,x+12,y-4);g.lineWidth=2;g.strokeStyle='#6a6a7a';g.stroke();}
    if(s>=4){const x=66,y=96;rrect(g,x-12,y-12,24,12,2);g.fillStyle=grad(g,x,y-6,12,'#a84a2a',.3,-.3);g.fill();outline(g,'#a84a2a',1);shp(g,'#c85a32',{hl:.3},[x-12,y-18,x+12,y-11],()=>{g.moveTo(x-12,y-11);g.quadraticCurveTo(x,y-20,x+12,y-11);g.closePath();});ln(g,[x-12,y-6,x+12,y-6],'#ffc93a',1.2);ell(g,x,y-8,2,2,'#ffc93a',{lw:.4});
      rrect(g,x-4,y-26,10,7,1);g.fillStyle='#f4efe2';g.fill();outline(g,'#c8b89a',.7);ln(g,[x+1,y-26,x+1,y-19],'#c8b89a',.6);}},
  ogon(g,s,v){tmSky(g,'#4a5aa8','#e8a07a','#8a9a5a','#5a7a3a',62);tmGrass(g,-20,220,74,'#4a7a3a');
    if(s>=5){const c=v||'#ffc93a';g.beginPath();g.moveTo(10,30);g.quadraticCurveTo(100,56,190,30);g.lineWidth=1;g.strokeStyle='#4a3a2a';g.stroke();for(let i=1;i<8;i++){const t=i/8,x=10+180*t,y=30+(1-Math.pow(2*t-1,2))*13;glow(g,x,y+5,8,c);rrect(g,x-3,y+1,6,8,2.5);g.fillStyle=c;g.fill();outline(g,c,.7);}}
    if(s>=2)for(let i=0;i<10;i++){const a=i*TAU/10;tmStone(g,100+Math.cos(a)*30,92+Math.sin(a)*9,5.4,'#9a968e');}
    if(s>=3){glow(g,100,84,34,'#ff8a1a','#ffe08a');for(const [x,h,c] of[[-8,16,'#ff7a1a'],[0,24,'#ffb03a'],[8,15,'#ff7a1a'],[0,12,'#ffe08a']])shp(g,c,{ol:false},[100+x-6,88-h,100+x+6,90],()=>{g.moveTo(100+x-6,90);g.quadraticCurveTo(100+x-5,90-h*.5,100+x,90-h);g.quadraticCurveTo(100+x+5,90-h*.5,100+x+6,90);g.closePath();});
      for(const a of[-.4,.4])tmLog(g,100,94,26,a);}
    if(s>=4){ln(g,[80,96,100,56,120,96],'#4a3a2a',1.8);ln(g,[100,56,100,64],'#4a3a2a',1);shp(g,'#3a3a44',{hl:.35},[90,62,110,78],()=>{g.moveTo(90,64);g.quadraticCurveTo(90,78,100,78);g.quadraticCurveTo(110,78,110,64);g.closePath();});g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.9;for(const x of[96,104]){g.beginPath();g.moveTo(x,60);g.quadraticCurveTo(x-3,54,x,48);g.stroke();}}
    if(s<1){ell(g,100,92,40,10,'#6a6a6a',{hl:.2,lw:1});for(const [x,y] of[[80,90],[110,88],[96,94],[124,94]])ell(g,x,y,5,2,'#3a3a3a',{ol:false});for(const [x,y] of[[30,96],[170,100],[150,84]])ell(g,x,y,8,3,'#5a5a5a',{ol:false});}},
  vihr(g,s,v){tmSky(g,'#5ab8f0','#e0f6ff','#9ad06a','#5aa447',74);
    shp(g,'#7ac05a',{hl:.25,lw:1.2},[20,60,180,100],()=>{g.moveTo(10,100);g.quadraticCurveTo(100,52,190,100);g.closePath();});tmGrass(g,-20,220,96,'#4a9a3a');
    g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.4;for(const [x,y] of[[20,20],[140,14],[60,40]]){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+14,y-5,x+28,y);g.quadraticCurveTo(x+34,y+3,x+30,y+6);g.stroke();}
    if(s>=3)for(const [x,y,c,c2] of[[40,20,'#d8382e','#ffc93a'],[160,30,'#3a6ab8','#fff']]){g.beginPath();g.moveTo(x,y+12);g.quadraticCurveTo(x+12,y+40,100,62);g.lineWidth=.7;g.strokeStyle='rgba(60,40,20,.6)';g.stroke();
      shp(g,c,{hl:.4,lw:.8},[x-8,y-10,x+8,y+12],()=>{g.moveTo(x,y-10);g.lineTo(x+8,y);g.lineTo(x,y+12);g.lineTo(x-8,y);g.closePath();});ln(g,[x,y-10,x,y+12],c2,.8);ln(g,[x-8,y,x+8,y],c2,.8);for(let i=0;i<3;i++)ell(g,x-3+i*4,y+16+i*4,2,1.2,c2,{lw:.4});}
    if(s>=1)tmPost(g,100,66,42,'#8a5a2e');
    if(s>=4)for(const [a,c] of[[.3,'#d8382e'],[.6,'#ffc93a'],[.9,'#3a8ad8']]){g.beginPath();g.moveTo(100,34+a*8);g.quadraticCurveTo(114,30+a*10,130,36+a*12);g.lineWidth=1.6;g.strokeStyle=c;g.stroke();}
    if(s>=2){const c=s>=5?(v||'#d8382e'):'#c8c0b0';for(let i=0;i<4;i++){const a=i*TAU/4+.3;g.save();g.translate(100,26);g.rotate(a);shp(g,i%2?c:shade(c,.35),{hl:.3,lw:.8},[0,-14,8,0],()=>{g.moveTo(0,0);g.lineTo(0,-16);g.quadraticCurveTo(8,-10,6,0);g.closePath();});g.restore();}ell(g,100,26,2.4,2.4,'#6a4022',{lw:.5});}
    if(s<1){tmLog(g,96,92,64,.08);for(const [x,y] of[[60,96],[140,98],[120,90]])ell(g,x,y,5,2,'#8a5a2e',{lw:.5});}},
  lih(g,s,v){tmSky(g,'#1a1a4a','#4a4a8a','#2a4a4a','#1a3a3a',64);glow(g,160,20,24,'#e8e8ff','#ffffff');ell(g,160,20,9,9,'#f4f0d8',{hl:.2,lw:.6});
    g.fillStyle='#fff';for(const [x,y] of[[20,14],[50,30],[80,10],[118,26],[188,40],[30,44],[136,8]]){g.beginPath();g.arc(x,y,.9,0,TAU);g.fill();}
    tmGrass(g,-20,220,76,'#3a6a5a');
    if(s>=2)for(let i=0;i<7;i++){const x=40+i*20,y=104-i*4+(i%2)*3;glow(g,x,y,8,'#9ad8ff');tmStone(g,x,y,4.4,'#d8e4ff');}
    if(s>=4)for(const [x,y] of[[30,88],[56,96],[150,92],[176,84],[122,100]]){glow(g,x,y-6,10,'#c8d8ff');tmFlower(g,x,y,'#f0f4ff',1.3);}
    if(s>=3)for(const [x,y] of[[30,54],[70,44],[96,66],[134,50],[176,64],[60,70],[150,74]]){glow(g,x,y,7,'#d8ff6a','#ffffc8');}
    if(s>=5){const c=v||'#ffe08a';tmPost(g,100,90,40,'#4a3a5a');glow(g,100,40,30,c);g.save();g.translate(100,40);g.fillStyle=c;g.beginPath();for(let i=0;i<10;i++){const r=i%2?4:10,a=i*Math.PI/5-Math.PI/2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();outline(g,c,1);g.restore();}
    if(s<1){g.fillStyle='rgba(20,10,40,.55)';for(const [x,y,r] of[[40,80,30],[110,74,40],[170,86,30],[80,96,26]]){g.beginPath();g.ellipse(x,y,r,r*.45,0,0,TAU);g.fill();}}}};
// уголок целиком: фон во всю ширину, поле 200×110 по центру
function tmDrawCorner(g,th,s,vi,W,H){const k=Math.min(W/200,H/110);g.save();g.translate((W-200*k)/2,(H-110*k)/2);g.scale(k,k);g.lineJoin=g.lineCap='round';
  const C=TM_C[th];try{TM_DRAW[th](g,s,s>=5?C.vc[vi|0]:null);}catch(e){tmErr('draw '+th,e);}g.restore();tmDesat(g,[.8,.5,.3,.15,.05,0][s|0],W,H);}

// ---- украшения (значки 48 px; на рисунке двора — те же функции) ----
art('tm_d_pet',48,g=>{ell(g,0,18,10,2.6,'rgba(0,0,0,.15)',{ol:false,flat:true});ln(g,[-2,10,-3,18],'#e0a02a',1.4);ln(g,[3,10,4,18],'#e0a02a',1.4);
  for(const [a,c] of[[-2.4,'#2a6a3a'],[-2,'#d8382e'],[-1.6,'#3a6ab8']])shp(g,c,{hl:.4,lw:.7},[-18,-12,-4,6],()=>{g.moveTo(-6,2);g.quadraticCurveTo(-14+Math.cos(a)*6,-6+Math.sin(a)*8,-18,-8+(a+2)*8);g.quadraticCurveTo(-12,0,-6,6);g.closePath();});
  ell(g,0,4,10,8,'#c8603a',{hl:.45});ell(g,5,-8,5.4,6,'#e8a03a',{hl:.45});shp(g,'#e0302a',{lw:.6},[2,-18,10,-12],()=>{g.moveTo(2,-13);g.quadraticCurveTo(3,-18,5,-15);g.quadraticCurveTo(7,-19,8,-15);g.quadraticCurveTo(11,-17,9,-12);g.closePath();});
  shp(g,'#ffc93a',{lw:.5},[9,-9,15,-5],()=>{g.moveTo(9.5,-9);g.lineTo(15,-7);g.lineTo(9.5,-5);g.closePath();});ell(g,9,-3,1.6,2.4,'#e0302a',{lw:.4});eye(g,6.5,-9,1.6,{px:.3});ell(g,-2,4,5,4,'#a84a2a',{rot:.3,lw:.6});});
art('tm_d_nal',48,g=>{rrect(g,-14,-16,28,30,2);g.fillStyle=grad(g,0,0,16,'#9ad8ff',.5,-.2);g.fill();outline(g,'#6a4022',1);ln(g,[0,-16,0,14],'#fff',2);ln(g,[-14,-2,14,-2],'#fff',2);
  shp(g,'#fff',{olc:'#9a8a7a',lw:.8},[-20,-26,20,-14],()=>{g.moveTo(-20,-14);g.lineTo(0,-26);g.lineTo(20,-14);g.lineTo(14,-14);g.lineTo(0,-21);g.lineTo(-14,-14);g.closePath();});
  rrect(g,-20,14,40,5,1.5);g.fillStyle='#fff';g.fill();outline(g,'#9a8a7a',.8);for(const s of[-1,1]){rrect(g,s*17-3,-14,6,28,1.5);g.fillStyle='#fff';g.fill();outline(g,'#9a8a7a',.8);}
  g.fillStyle='#d8382e';for(const x of[-12,-6,0,6,12]){g.beginPath();g.arc(x,17,1.2,0,TAU);g.fill();}g.beginPath();g.arc(0,-18,2,0,TAU);g.fill();});
art('tm_d_skv',48,g=>{tmPost(g,0,22,18,'#8a5a2e');rrect(g,-9,-10,18,18,2);g.fillStyle=grad(g,0,0,10,'#e8c88a',.3,-.25);g.fill();outline(g,'#c8a06a',1);
  shp(g,'#3a6ab8',{hl:.4},[-13,-22,13,-9],()=>{g.moveTo(-13,-9);g.lineTo(0,-22);g.lineTo(13,-9);g.closePath();});ell(g,0,-1,3.4,3.4,'#3a2410',{ol:false});ln(g,[-3,5,3,5],'#8a5a2e',1.6);
  ell(g,10,-18,3,2.4,'#5a4a3a',{lw:.5});ell(g,12.6,-19,1,.7,'#ffb52a',{ol:false});});
art('tm_d_kach',48,g=>{ln(g,[-18,22,-14,-20],'#8a5a2e',2.4);ln(g,[18,22,14,-20],'#8a5a2e',2.4);ln(g,[-16,-20,16,-20],'#6a4022',3);ln(g,[-7,-20,-8,10],'#c8b08a',1);ln(g,[7,-20,8,10],'#c8b08a',1);
  rrect(g,-11,9,22,4,1.5);g.fillStyle=grad(g,0,11,11,'#d8382e',.3,-.3);g.fill();outline(g,'#d8382e',.8);});
art('tm_d_sam',48,g=>{ell(g,0,20,12,3,'rgba(0,0,0,.15)',{ol:false,flat:true});rrect(g,-6,14,12,5,1);g.fillStyle='#c8803a';g.fill();outline(g,'#c8803a',.8);
  shp(g,'#e0a03a',{hl:.55},[-13,-8,13,15],()=>{g.moveTo(-9,15);g.quadraticCurveTo(-15,2,-10,-8);g.lineTo(10,-8);g.quadraticCurveTo(15,2,9,15);g.closePath();});
  for(const s of[-1,1])ln(g,[s*11,-4,s*16,-2,s*15,4],'#8a5a2e',1.6);ln(g,[10,6,17,10],'#c8803a',2);rrect(g,-4,-16,8,8,1.5);g.fillStyle='#e0a03a';g.fill();outline(g,'#e0a03a',.8);
  ell(g,0,-18,5,3,'#f4efe2',{lw:.6});ell(g,0,-21,3,2.4,'#3a6ab8',{hl:.5,lw:.5});shine(g,-6,0,2.4,5,.5);});
art('tm_d_flag',48,g=>{g.beginPath();g.moveTo(-22,-10);g.quadraticCurveTo(0,4,22,-10);g.lineWidth=1;g.strokeStyle='#6a4022';g.stroke();
  const cs=['#d8382e','#ffc93a','#3a8ad8','#4ab83a','#c86ad0'];for(let i=0;i<5;i++){const t=(i+.5)/5,x=-22+44*t,y=-10+(1-Math.pow(2*t-1,2))*7;shp(g,cs[i],{hl:.4,lw:.6},[x-4,y,x+4,y+10],()=>{g.moveTo(x-4,y);g.lineTo(x+4,y);g.lineTo(x,y+10);g.closePath();});}});
art('tm_d_kot',48,g=>{ell(g,0,18,13,3,'rgba(0,0,0,.15)',{ol:false,flat:true});ell(g,2,8,11,10,'#e8902a',{hl:.45});ell(g,-4,-6,9,8,'#e8902a',{hl:.45});
  for(const d of[-1,1])shp(g,'#e8902a',{lw:.7},[-4+d*8,-18,-4+d*3,-10],()=>{g.moveTo(-4+d*7.5,-9);g.lineTo(-4+d*7,-18);g.lineTo(-4+d*2,-12);g.closePath();});
  g.beginPath();g.moveTo(12,14);g.quadraticCurveTo(22,12,18,0);g.lineWidth=3;g.strokeStyle='#e8902a';g.stroke();
  for(const x of[-7,-1]){g.beginPath();g.moveTo(x-2,-6);g.quadraticCurveTo(x,-8,x+2,-6);g.lineWidth=1;g.strokeStyle='#3a2410';g.stroke();}ell(g,-4,-3,1,.7,'#e88a9a',{ol:false});
  g.strokeStyle='rgba(160,80,20,.6)';g.lineWidth=1.2;for(const y of[2,7,12]){g.beginPath();g.moveTo(-6,y);g.lineTo(-1,y+1);g.stroke();}});
art('tm_d_fon',48,g=>{g.beginPath();g.moveTo(-22,-14);g.quadraticCurveTo(0,0,22,-14);g.lineWidth=.9;g.strokeStyle='#4a3a2a';g.stroke();
  for(const [t,c] of[[.2,'#ff6a3a'],[.5,'#ffc93a'],[.8,'#ff6a8a']]){const x=-22+44*t,y=-14+(1-Math.pow(2*t-1,2))*7;ln(g,[x,y,x,y+3],'#4a3a2a',.8);glow(g,x,y+10,10,c);rrect(g,x-4,y+3,8,12,3.5);g.fillStyle=c;g.fill();outline(g,c,.8);ln(g,[x-4,y+9,x+4,y+9],shade(c,-.4),.6);}});
art('tm_d_zm',48,g=>{g.beginPath();g.moveTo(2,4);g.quadraticCurveTo(-6,16,-18,22);g.lineWidth=.8;g.strokeStyle='rgba(60,40,20,.7)';g.stroke();
  shp(g,'#d8382e',{hl:.4},[-8,-20,14,8],()=>{g.moveTo(4,-20);g.lineTo(14,-6);g.lineTo(2,6);g.lineTo(-8,-8);g.closePath();});ln(g,[4,-20,2,6],'#ffc93a',1);ln(g,[-8,-8,14,-6],'#ffc93a',1);
  for(let i=0;i<3;i++)shp(g,['#ffc93a','#3a8ad8','#4ab83a'][i],{lw:.4},[-4-i*5,8+i*4,0-i*5,14+i*4],()=>{const x=-1-i*5,y=10+i*4;g.moveTo(x,y);g.lineTo(x-3,y-2);g.lineTo(x-3,y+3);g.closePath();});});
art('tm_d_luna',48,g=>{tmPost(g,0,24,24,'#4a3a5a');glow(g,0,-8,18,'#c8d8ff');rrect(g,-7,-16,14,16,3);g.fillStyle='rgba(220,230,255,.9)';g.fill();outline(g,'#4a3a5a',1.2);
  shp(g,'#4a3a5a',{ol:false},[-9,-22,9,-16],()=>{g.moveTo(-9,-16);g.lineTo(0,-22);g.lineTo(9,-16);g.closePath();});g.beginPath();g.arc(0,-8,5,0,TAU);g.fillStyle='#ffe08a';g.fill();g.beginPath();g.arc(2,-9.5,4.4,0,TAU);g.fillStyle='rgba(220,230,255,1)';g.fill();});
art('tm_d_fl',48,g=>{ln(g,[0,22,0,-6],'#6a5a4a',1.6);ln(g,[-10,6,10,6],'#6a5a4a',1.2);g.font='bold 7px sans-serif';
  shp(g,'#ffc93a',{hl:.6,lw:.8},[-14,-24,16,-4],()=>{g.moveTo(-12,-6);g.lineTo(-14,-16);g.lineTo(-8,-12);g.lineTo(-4,-18);g.quadraticCurveTo(2,-14,4,-16);g.quadraticCurveTo(6,-24,10,-20);g.lineTo(16,-18);g.lineTo(10,-15);g.quadraticCurveTo(10,-6,0,-6);g.closePath();});
  ell(g,0,-6,2.4,2.4,'#ffc93a',{hl:.6,lw:.6});shine(g,-4,-12,3,1.4,.6);});
// значки: терем (деревня, «Дела») и трофей-заменитель (если в TRO_DEF нет рисунка)
art('tm_terem',64,g=>{ell(g,0,26,28,5,'rgba(0,0,0,.16)',{ol:false,flat:true});rrect(g,-20,-2,40,26,2);g.fillStyle=grad(g,0,10,22,'#c8823a',.3,-.3);g.fill();outline(g,'#c8823a',1.2);
  g.strokeStyle='rgba(90,50,20,.55)';g.lineWidth=1;for(let y=3;y<24;y+=5){g.beginPath();g.moveTo(-20,y);g.lineTo(20,y);g.stroke();}
  shp(g,'#d8382e',{hl:.4},[-26,-28,26,0],()=>{g.moveTo(-26,0);g.lineTo(0,-28);g.lineTo(26,0);g.closePath();});
  shp(g,'#fff',{olc:'#9a8a7a',lw:.6},[-26,-6,26,3],()=>{for(let i=0;i<8;i++){const x=-24+i*6.5;g.moveTo(x,0);g.lineTo(x+3.2,4);g.lineTo(x+6.5,0);}});
  rrect(g,-7,6,14,12,1.5);g.fillStyle=grad(g,0,12,8,'#9ad8ff',.5,-.2);g.fill();outline(g,'#fff',1.6);ln(g,[0,6,0,18],'#fff',1.2);
  ell(g,0,-12,4,4,'#ffe08a',{hl:.5,lw:.7});ln(g,[0,-28,0,-36],'#6a5a4a',1.2);shp(g,'#ffc93a',{lw:.6},[-5,-40,6,-34],()=>{g.moveTo(-5,-34);g.lineTo(-3,-40);g.lineTo(6,-37);g.lineTo(2,-34);g.closePath();});});
for(const th of TM_TH)art('tm_tro_'+th,40,g=>{const c=TM_C[th].col;ell(g,0,12,10,2.6,'rgba(0,0,0,.15)',{ol:false,flat:true});gem(g,11,c);shine(g,-4,-5,2.4,1.4,.6);});

/* ---- двор целиком: терем хорошеет с общим числом шагов, украшения, вымпелы готовых уголков на плетне ---- */
function tmDrawYard(c){if(!c)return;const t=TM();if(!t)return;const r=c.getBoundingClientRect(),W=r.width||300,H=r.height||180,d=Math.min(devicePixelRatio||1,2);
  c.width=W*d;c.height=H*d;const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';
  const all=tmCorners().length*5||1,p=Math.min(1,tmStepsAll()/all),sh=id=>t.d[id]&&!t.h[id];
  const sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,p>.5?'#6ab8ff':'#9ab4cc');sk.addColorStop(.6,'#dff0ff');sk.addColorStop(.61,'#9ad06a');sk.addColorStop(1,'#5aa447');g.fillStyle=sk;g.fillRect(0,0,W,H);
  glow(g,W*.9,H*.12,26,'#fff2a8','#ffffff');
  const k=Math.min(H/180,W/300)*1.05,cx=W*.5,by=H*.8;
  // берёзка справа (качели висят на ней)
  {const bx=W*.88;ln(g,[bx,by+6,bx,by-96*k],'#f4efe2',5*k);for(const y of[20,40,62,80])ln(g,[bx-2*k,by-y*k,bx+1*k,by-y*k],'#3a3a3a',1.2*k);
    for(const [x,y,rr] of[[-12,-92,16],[10,-96,16],[0,-108,18],[-16,-74,12],[14,-76,12]])ell(g,bx+x*k,by+y*k,rr*k,rr*.8*k,p>.15?'#6ac84a':'#a8a86a',{hl:.35,lw:.8});
    if(sh('kach')){ln(g,[bx-4*k,by-70*k,bx-26*k,by-70*k],'#6a4022',2.4*k);tmArt(g,'tm_d_kach',bx-16*k,by-34*k,k*1.1);}}
  if(sh('zm'))tmArt(g,'tm_d_zm',W*.13,H*.2,k*1.1);
  g.save();g.translate(cx,by);g.scale(k,k);
  // терем: сруб, светёлка, кровля, крыльцо
  const wallC=p>=.5?'#c8823a':'#8a7a62',logC=p>=.5?'rgba(110,60,20,.5)':'rgba(60,50,40,.55)';
  ell(g,0,4,86,8,'rgba(0,0,0,.18)',{ol:false,flat:true});
  rrect(g,-56,-62,112,64,3);g.fillStyle=grad(g,0,-30,60,wallC,.25,-.3);g.fill();outline(g,wallC,1.4);
  g.strokeStyle=logC;g.lineWidth=1.3;for(let y=-56;y<0;y+=7){g.beginPath();g.moveTo(-56,y);g.lineTo(56,y);g.stroke();}
  for(const s of[-1,1])for(let y=-58;y<0;y+=7)ell(g,s*58,y+3,3,3.2,p>=.5?'#e0a860':'#9a8a72',{lw:.6});
  if(sh('kot'))tmArt(g,'tm_d_kot',-40,-8,.8);
  // окна
  for(const x of[-30,0]){const glass=p>=.2;rrect(g,x-10,-46,20,24,2);g.fillStyle=glass?grad(g,x,-34,12,'#9ad8ff',.5,-.2):'#3a2a1a';g.fill();outline(g,'#6a4022',1);
    if(glass){ln(g,[x,-46,x,-22],'#fff',1.4);ln(g,[x-10,-34,x+10,-34],'#fff',1.4);if(p>=.7){g.fillStyle='rgba(255,220,120,.35)';g.fillRect(x-9,-45,18,22);}}
    else{ln(g,[x-11,-44,x+11,-24],'#8a6a4a',3);ln(g,[x-11,-24,x+11,-44],'#8a6a4a',3);}
    if(sh('nal')){shp(g,'#fff',{olc:'#9a8a7a',lw:.6},[x-14,-56,x+14,-46],()=>{g.moveTo(x-14,-46);g.lineTo(x,-56);g.lineTo(x+14,-46);g.lineTo(x+10,-46);g.lineTo(x,-52);g.lineTo(x-10,-46);g.closePath();});rrect(g,x-14,-22,28,4,1.2);g.fillStyle='#fff';g.fill();outline(g,'#9a8a7a',.6);
      for(const s of[-1,1]){rrect(g,x+s*12-2,-46,4,24,1);g.fillStyle='#fff';g.fill();outline(g,'#9a8a7a',.6);}g.fillStyle='#d8382e';g.beginPath();g.arc(x,-50,1.4,0,TAU);g.fill();}}
  // дверь
  rrect(g,22,-40,20,40,2);g.fillStyle=grad(g,32,-20,20,p>=.35?'#8a4a26':'#5a4a3a',.25,-.3);g.fill();outline(g,'#5a3a1a',1);ell(g,38,-20,1.4,1.4,'#ffc93a',{lw:.4});
  // крыльцо
  if(p>=.35){
    for(let i=0;i<3;i++){rrect(g,16+i*2,-4*i-4,32-i*4,4,1);g.fillStyle='#a8733d';g.fill();outline(g,'#8a5a2e',.7);}
    for(const x of[16,48])tmPost(g,x,-12,34,'#a8733d');shp(g,p>=.7?'#d8382e':'#8a6a4a',{hl:.35},[12,-58,52,-44],()=>{g.moveTo(12,-44);g.lineTo(32,-58);g.lineTo(52,-44);g.closePath();});
    if(sh('sam'))tmArt(g,'tm_d_sam',58,-14,.55);}
  else{ln(g,[18,0,46,-6],'#6a5a4a',2.4);ln(g,[24,2,40,4],'#6a5a4a',2);}
  // кровля
  const roofC=p>=.7?'#d8382e':p>=.08?'#8a5a3a':'#6a5a4a';
  shp(g,roofC,{hl:.3,lw:1.4},[-68,-118,68,-58],()=>{g.moveTo(-68,-58);g.lineTo(0,-118);g.lineTo(68,-58);g.closePath();});
  if(p>=.7){g.strokeStyle='rgba(120,20,10,.45)';g.lineWidth=1;for(let i=1;i<6;i++){const y=-58-i*10,w=68-i*11.3;g.beginPath();g.moveTo(-w,y);g.lineTo(w,y);g.stroke();}}
  if(p<.08)for(const [x,y,w,h] of[[-30,-74,14,8],[18,-86,12,10],[-8,-100,8,6]]){g.beginPath();g.ellipse(x,y,w/2,h/2,.3,0,TAU);g.fillStyle='#2a1a10';g.fill();}
  else if(p<.5)for(const [x,y] of[[-30,-74],[18,-86]]){rrect(g,x-8,y-5,16,10,1);g.fillStyle='#b8925a';g.fill();outline(g,'#8a6a4a',.7);}
  // светёлка с окошком
  if(p>=.5){shp(g,p>=.7?'#e8c88a':'#c8a06a',{hl:.3,lw:1},[-16,-100,16,-70],()=>{g.moveTo(-16,-70);g.lineTo(-16,-88);g.lineTo(0,-102);g.lineTo(16,-88);g.lineTo(16,-70);g.closePath();});ell(g,0,-82,6,7,'#9ad8ff',{hl:.5,lw:.9});ln(g,[0,-89,0,-75],'#fff',1);}
  // подзор (резьба под кровлей)
  if(p>=.5)shp(g,'#fff',{olc:'#9a8a7a',lw:.5},[-68,-60,68,-52],()=>{for(let i=0;i<10;i++){const a=-66+i*13.2;g.moveTo(a,-59+Math.abs(a)*.0);g.lineTo(a+6.6,-53);g.lineTo(a+13.2,-59);}});
  if(sh('fon'))for(const s of[-1,1])tmArt(g,'tm_d_fon',s*40,-50,.8);
  // конёк и флюгер
  if(p>=1){glow(g,0,-120,30,'#ffd84a');}
  if(p>=.85||sh('fl')){ln(g,[0,-118,0,-132],'#6a5a4a',1.6);}
  if(sh('fl'))tmArt(g,'tm_d_fl',0,-138,.8);else if(p>=.85)shp(g,'#c8823a',{hl:.4,lw:.8},[-8,-138,8,-126],()=>{g.moveTo(-8,-126);g.quadraticCurveTo(-6,-138,4,-138);g.lineTo(8,-132);g.lineTo(2,-130);g.quadraticCurveTo(2,-126,-8,-126);});
  // труба и дымок
  rrect(g,30,-108,10,24,1.5);g.fillStyle=grad(g,35,-96,10,p>=.2?'#d8d0bc':'#7a7064',.2,-.2);g.fill();outline(g,'#8a8070',.8);
  if(p>=.7){g.fillStyle='rgba(255,255,255,.65)';for(const [x,y,rr] of[[36,-116,4],[40,-124,5],[46,-133,6]]){g.beginPath();g.arc(x,y,rr,0,TAU);g.fill();}}
  if(sh('flag'))for(const s of[-1,1])tmArt(g,'tm_d_flag',s*34,-90,.9);
  g.restore();
  if(sh('skv'))tmArt(g,'tm_d_skv',W*.08,by-30*k,k*1.05);
  if(sh('luna'))tmArt(g,'tm_d_luna',W*.75,by-14*k,k*.9);
  // плетень и вымпелы готовых уголков
  const fy=H*.93;for(let x=4;x<W;x+=11){rrect(g,x-2.5,fy-22*k,5,24*k,2);g.fillStyle='#a8733d';g.fill();outline(g,'#a8733d',.8);}
  for(const yy of[fy-16*k,fy-7*k]){g.strokeStyle='#8a5a2e';g.lineWidth=2.2;g.beginPath();g.moveTo(0,yy);g.lineTo(W,yy);g.stroke();}
  const cs=tmCorners(),n=cs.length;cs.forEach((th,i)=>{if((t.c[th]|0)<5)return;const x=W*(.06+.88*(i+.5)/n),y=fy-22*k,col=TM_C[th].col;ln(g,[x,y+2,x,y-12*k],'#6a4022',1.2);
    shp(g,col,{hl:.4,lw:.6},[x,y-12*k,x+10*k,y-4*k],()=>{g.moveTo(x,y-12*k);g.lineTo(x+11*k,y-8*k);g.lineTo(x,y-4*k);g.closePath();});});
  if(sh('pet'))tmArt(g,'tm_d_pet',W*.24,fy-28*k,k*.9);
  tmDesat(g,Math.max(0,.6-p*1.2),W,H);}

/* ================= экран «Терем» (окно, как Подворье) ================= */
const tmSec=t=>'<div class="tm-sec">'+t+'</div>';
function tmPriceHTML(p){let h='<span class="tm-pr"><img src="'+ic('coin',36)+'">'+fmtNum(p.g)+'</span>';for(const th in p.tt){const id=tmTro(th),have=TRO_N(id),ok=have>=p.tt[th];
  h+='<span class="tm-pr'+(ok?'':' no')+'" title="'+tmTroName(th)+'"><img src="'+ic(tmTroIc(th),36)+'">'+Math.min(have,p.tt[th])+'/'+p.tt[th]+'</span>';}return h;}
function tmTip(){const t=TM(),a=tmAfford();
  if(!t.in)return L('Терем твой обветшал, пока ты бился с нечистью. Освобождай земли — в каждой свой уголок двора. Чини за золото и трофеи — двор оживёт!','Your terem fell into disrepair while you fought. Each freed land opens a corner of the yard. Restore it with gold and trophies — and watch it come alive!');
  if(a&&a.th)return L('Хватает на «'+tmL(TM_C[a.th].st[a.i])+'» — уголок «'+tmL(TM_C[a.th].n)+'».','You can afford “'+tmL(TM_C[a.th].st[a.i])+'” in “'+tmL(TM_C[a.th].n)+'”.');
  if(a&&a.d)return L('Можно украсить двор: '+tmL(TM_DB[a.d].n)+'.','You can decorate the yard: '+tmL(TM_DB[a.d].n)+'.');
  const nx=tmCorners().find(th=>!tmThOpen(th));const all=tmCorners().every(th=>(t.c[th]|0)>=5);
  if(all)return L('Весь двор как в сказке! Собирай украшения.','The whole yard is a fairy tale! Collect decorations.');
  return L('Копи золото и трофеи в походах — и возвращайся чинить.','Gather gold and trophies on runs — then come back to build.')+(nx?L(' Новый уголок откроет земля «'+TH[nx].name+'».',' The next corner opens with '+TH[nx].name+'.'):'');}
function tmHTML(){const t=TM(),th=tmCur(),C=TM_C[th],s=t.c[th]|0,all=tmCorners().length*5;
  let h='<h3>'+L('🏡 Терем богатыря','🏡 Hero’s Terem')+'</h3><canvas id="tmY" class="tm-cv" style="height:180px"></canvas>'+
    '<div class="tm-prog"><b>'+L('Двор восстановлен: ','Yard restored: ')+tmStepsAll()+' / '+all+'</b><div class="bar"><i style="width:'+Math.round(tmStepsAll()/Math.max(1,all)*100)+'%"></i></div></div>'+
    '<div class="card"><span class="tm-tip">'+tmTip()+'</span></div>';
  // выбор уголка
  h+=tmSec(L('Уголки двора','Yard corners'))+'<div class="tm-cs">'+tmCorners().map(k=>{const o=tmThOpen(k),n=t.c[k]|0,sel=k===th;
    return '<button class="btn '+(sel?'gold':'ghost')+(o?'':' tm-lock')+'" data-tc="'+k+'"'+(o?'':' aria-disabled="true"')+'><i class="tm-dot" style="background:'+TM_C[k].col+'"></i>'+(o?tmL(TM_C[k].sh):'🔒 '+tmL(TM_C[k].sh))+'<span>'+(o?(n>=5?'✓':n+'/5'):'')+'</span></button>';}).join('')+'</div>';
  // выбранный уголок: рисунок и следующий шаг
  h+='<div class="card tm-corner"><b class="tm-cn">'+tmL(C.n)+'</b><canvas id="tmK" class="tm-cv" style="height:150px"></canvas>'+
    '<div class="tm-steps">'+C.st.map((x,i)=>'<span class="'+(i<s?'ok':i===s?'cur':'')+'">'+(i<s?'✓ ':'')+tmL(x)+'</span>').join('')+'</div>';
  if(s<5){const p=tmStepPrice(th,s),ok=tmCan(p);
    h+='<div class="tm-next"><div class="t"><b>'+L('Шаг ','Step ')+(s+1)+'/5: '+tmL(C.st[s])+'</b><div class="tm-prs">'+tmPriceHTML(p)+'</div></div>';
    if(s<4)h+='<button class="btn '+(ok?'gold':'ghost')+'" id="tmGo" '+(ok?'':'disabled')+'>'+L('Сделать','Build')+'</button></div>';
    else h+='</div><p class="sub" style="margin:6px 2px 4px">'+L('Выбери цвет — потом можно перекрасить даром:','Pick a color — you can repaint it later for free:')+'</p><div class="tm-vc">'+C.vc.map((c,i)=>'<button class="btn '+(ok?'gold':'ghost')+'" data-tv="'+i+'" '+(ok?'':'disabled')+' aria-label="'+L('цвет ','color ')+(i+1)+'"><i class="tm-sw" style="background:'+c+'"></i>'+L('Сделать','Build')+'</button>').join('')+'</div>';}
  else h+='<div class="tm-next"><div class="t"><b>'+L('Уголок готов! Вымпел — на плетне.','Corner restored! Its pennant flies on the fence.')+'</b><span>'+L('Перекрасить:','Repaint:')+'</span></div></div><div class="tm-vc">'+C.vc.map((c,i)=>'<button class="btn '+((t.v[th]|0)===i?'gold':'ghost')+'" data-tp="'+i+'" aria-label="'+L('цвет ','color ')+(i+1)+'"><i class="tm-sw" style="background:'+c+'"></i>'+((t.v[th]|0)===i?'✓':'')+'</button>').join('')+'</div>';
  h+='</div>';
  // украшения
  h+=tmSec(L('Украшения двора','Yard decorations'))+'<p class="sub" style="margin:0 4px 8px">'+L('Только для красоты. Нажми на своё — спрятать или вернуть.','Just for looks. Tap one you own to hide or show it.')+'</p><div class="tm-ds">';
  for(const d of TM_D){if(!tmDecoVis(d)&&!t.d[d.id])continue;const own=t.d[d.id],op=tmDecoOpen(d);let b;
    if(own)b='<button class="btn ghost" data-th="'+d.id+'">'+(t.h[d.id]?L('Показать','Show'):L('✓ Во дворе','✓ In yard'))+'</button>';
    else if(d.ev)b='<span class="tm-ev">'+(d.ev==='first'?L('Подарок за первый готовый уголок','Gift for your first restored corner'):L('Подарок, когда готовы все уголки','Gift when all corners are restored'))+'</span>';
    else if(!op){const lk=Object.keys(d.tr).find(x=>tmRel(x)&&!tmThOpen(x));b='<span class="tm-ev">🔒 '+L('откроет земля «'+TH[lk].name+'»','opens with '+TH[lk].name)+'</span>';}
    else{const p=tmPrice(d),ok=tmCan(p);b='<div class="tm-prs">'+tmPriceHTML(p)+'</div><button class="btn '+(ok?'gold':'ghost')+'" data-tq="'+d.id+'" '+(ok?'':'disabled')+'>'+L('Взять','Get')+'</button>';}
    h+='<div class="tm-d'+(own?' own':'')+'"><img src="'+ic('tm_d_'+d.id,96)+'"'+(own||op?'':' style="opacity:.45"')+'><b>'+tmL(d.n)+'</b>'+b+'</div>';}
  h+='</div><div class="btns"><button class="btn big" id="tmBack">'+L('Назад','Back')+'</button></div>';return h;}
function openTerem(){const t=TM();if(!t||!tmOpen())return;STAT.screen('terem');
  const keep=$('modal').classList.contains('on')&&$('mBody').getAttribute('data-w')==='terem'?$('mBody').scrollTop:0;
  showModal(tmHTML(),'terem');if(keep)$('mBody').scrollTop=keep;
  if(!t.in){t.in=1;tmTouch();save();tmEv('intro');}
  try{tmDrawYard($('tmY'));const k=$('tmK'),th=tmCur();if(k){const r=k.getBoundingClientRect(),W=r.width||300,H=r.height||150,d=Math.min(devicePixelRatio||1,2);k.width=W*d;k.height=H*d;const g=k.getContext('2d');g.setTransform(d,0,0,d,0,0);tmDrawCorner(g,th,t.c[th]|0,t.v[th]|0,W,H);}}catch(e){tmErr('draw',e);}
  const re=()=>openTerem(),mb=$('mBody');
  on('tmBack',closeTerem);
  on('tmGo',()=>{if(tmStep(tmCur(),0))re();});
  for(const b of mb.querySelectorAll('[data-tc]'))b.onclick=()=>{SND.click();const k=b.dataset.tc;if(!tmThOpen(k)){const s=tmSlot1(k),c=CH[s];toast(L('Откроется, когда освободишь «','Opens once you free “')+(c?c.name:TH[k].name)+L('»','”'));return;}t.sel=k;tmTouch();save();re();};
  for(const b of mb.querySelectorAll('[data-tv]'))b.onclick=()=>{if(tmStep(tmCur(),+b.dataset.tv))re();};
  for(const b of mb.querySelectorAll('[data-tp]'))b.onclick=()=>{tmPaint(tmCur(),+b.dataset.tp);re();};
  for(const b of mb.querySelectorAll('[data-tq]'))b.onclick=()=>{if(tmDeco(b.dataset.tq))re();};
  for(const b of mb.querySelectorAll('[data-th]'))b.onclick=()=>{tmHide(b.dataset.th);re();};}
function closeTerem(){hideModal();if(typeof curTab!=='undefined'&&curTab==='Village'&&!G)try{renderVillage();}catch(e){}}

/* ================= крючки (META_MODS) ================= */
META_MODS.push({id:'terem',
  FIX(){tmFixS();},
  MERGE(d,o){tmMerge(d,o);},
  VIL(el){if(!TEREM_ON||!el||!tmOpen())return;const t=TM(),a=tmAfford(),d=document.createElement('div');
    d.className='card'+(a||!t.in?' next':'');d.id='tmCard';
    d.innerHTML='<div class="row"><img class="ic" src="'+ic('tm_terem',96)+'"><div class="t"><b>'+L('🏡 Терем','🏡 Terem')+'</b><span>'+(t.in?tmStatus():L('Терем обветшал — пора чинить двор','Your terem needs repairs — time to restore the yard'))+'</span></div><button class="btn gold" id="tmVGo">'+L('Открыть','Open')+'</button></div>';
    const after=el.querySelector('#yardCard')||el.querySelector('#village');if(after&&after.parentNode===el&&after.nextSibling)el.insertBefore(d,after.nextSibling);else el.appendChild(d);
    on('tmVGo',openTerem);},
  TODAY(TL){if(!TEREM_ON||!tmOpen())return;const t=TM(),a=tmAfford();if(!a&&t.in)return; // строка — только когда есть что делать
    TL.push({k:'terem',ic:'tm_terem',t:L('Терем','Terem'),s:t.in?tmStatus():L('Терем обветшал — пора чинить двор','Your terem needs repairs'),ready:true,b:L('Открыть','Open'),fn:()=>{hideModal();openTerem();}});},
  CHIPS(a){if(!TEREM_ON||!tmOpen())return;if(tmAfford())a.push('<i class="hot">🏡 '+L('терем','terem')+'</i>');}});

/* для проверки на своей машине: TEREM.give(золото, трофеев каждой темы), TEREM.set(тема, шагов) */
const TEREM={on:TEREM_ON,open:openTerem,
  give(gold,n){if(!LOCAL)return;S.gold+=gold|0;for(const th of TM_TH){const id=tmTro(th);if(id&&n)TRO_ADD(id,n);}save();setGold();},
  set(th,s,v){if(!LOCAL)return;const t=TM();if(!t)return;t.c[th]=s;if(v!=null)t.v[th]=v;tmEvents();save();},
  price:tmStepPrice,total(){let g=0,tr=0;for(const th of TM_TH)for(let i=0;i<5;i++){const p=tmStepPrice(th,i);g+=p.g;tr+=TM_PR.tr[i];}let dg=0;for(const d of TM_D)dg+=d.g||0;return {steps:g,trophies:tr,decoGold:dg};}};
