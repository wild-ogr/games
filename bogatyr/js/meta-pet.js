'use strict';
/* ================= МЕТА «Питомцы-помощники» (plan п.19) и «Дозор» (plan п.5) — модуль pet (META_MODS, ENGINE-API §15) =================
   Журнал — ~/Projects/hobby-analytics/release-h/bogatyr-chapters/logs/M-pet.md.
   Питомец: по одному на тему (11), открывается победой в «Логове» темы (глава 3; если тема ещё не выпущена — её последней главой в ORD);
     у кого уже пройдено — сразу. В поход по главе (не первый поход, не сеча/поход дня/неделя) идёт один выбранный питомец, делает одно простое дело.
     Сила — «полезный, но слабый»: урон 7–14 × сила богатыря раз в 2,5–4 с (≈ 2–5 % урона богатыря в середине кампании), ур. 20 — ×1,855 и откат −25,65 % (было ур. 10 — ×1,9 и −27 %).
     Прокачка (ур. 1–20; растяжка 07.10, PROG.md) — СТОК: трофеи своей темы (TRO_SPEND, всего 239, было 119) + золото с 8-го уровня (64 400, было 12 000).
     Старый сейв (без pv) — уровень L → наименьший новый с той же или большей силой (petMigL: 2→4, 5→10, 10→20).
   Дозор: свободный богатырь (не выбранный для похода) уходит в пройденную землю на 1/4/8 ч → трофеи этой земли (TRO_ADD) и чуть золота (4/8 ч).
   Флаг: ?meta=all или ?meta=pet (metaOn из meta.js; при выпуске — 'pet' в META_ON). Без флага модуль молчит и S.pet не создаёт.
   Новичку (S.runs<3) ничего не показываем. Сейв — только S.pet: {own:[th…], cur:th|'', lv:{th:n}, seen:[th…], dz:{h,th,t,d,n}|null, ad:{day,n}, c:{dz,lv}, ts}.
   В бою: такт — крючок FRAME(dt,G) (в паузе не зовётся), рисунок — крючок DRAW(c,G) в мировых координатах (общая тряска/сортировка с полем). */
const PET_ON=typeof metaOn==='function'&&metaOn('pet');
function petErr(w,x){petErr.n=(petErr.n||0)+1;if(petErr.n<=5)console.warn('meta pet.'+w+': '+(x&&x.message||x));}

/* ---------- данные ---------- */
/* th — тема; cd — откат (с); a — что делает; v — число действия (урон/радиус/…) */
const PETS={
  les:{k:'pt_wolf',cd:2.5,a:'bite',v:10,get n(){return L('Волчонок','Wolf Cub');},get d(){return L('Кусает ближнюю нечисть','Bites the nearest monster');}},
  bol:{k:'pt_ezh',cd:5,a:'gems',v:170,get n(){return L('Ёжик','Hedgehog');},get d(){return L('Носит самоцветы опыта к богатырю','Carries XP gems to the hero');}},
  pole:{k:'pt_konek',cd:6,a:'coins',v:220,get n(){return L('Конёк','Humpy Pony');},get d(){return L('Собирает монетки вокруг','Gathers nearby coins');}},
  kosh:{k:'pt_voron',cd:3.2,a:'peck',v:13,get n(){return L('Воронёнок','Raven Chick');},get d(){return L('Клюёт вожаков и боссов','Pecks leaders and bosses');}},
  med:{k:'pt_yasch',cd:20,a:'gem',v:3,get n(){return L('Ящерка','Little Lizard');},get d(){return L('Находит самоцвет опыта','Finds an XP gem');}},
  gory:{k:'pt_medv',cd:60,a:'pie',v:30,get n(){return L('Медвежонок','Bear Cub');},get d(){return L('Приносит пирожок (+30 здоровья)','Brings a pie (+30 health)');}},
  more:{k:'pt_cher',cd:45,a:'shell',v:1.2,get n(){return L('Черепашка','Little Turtle');},get d(){return L('Когда здоровья меньше 40 %, прячет в панцирь (неуязвимость)','Below 40% health, hides you in a shell (invulnerable)');}},
  luk:{k:'pt_bayun',cd:8,a:'sleep',v:110,get n(){return L('Кот Баюн','Bayun the Cat');},get d(){return L('Убаюкивает нечисть рядом — она замедляется','Lulls nearby monsters — they slow down');}},
  ogon:{k:'pt_ptah',cd:4,a:'burn',v:7,get n(){return L('Жар-птенчик','Firebird Chick');},get d(){return L('Обжигает трёх ближних','Scorches the three nearest');}},
  vihr:{k:'pt_sokol',cd:3.2,a:'hawk',v:12,get n(){return L('Соколёнок','Falcon Chick');},get d(){return L('Бьёт стрелков и дальнюю нечисть','Strikes archers and far-off monsters');}},
  lih:{k:'pt_sova',cd:10,a:'hoot',v:100,get n(){return L('Совёнок','Owlet');},get d(){return L('Ухает — отталкивает нечисть','Hoots — pushes monsters away');}}};
const PET_MAX=20;
const PET_TRO=[2,3,4,5,6,7,8,9,10,11,12,14,15,17,19,21,23,25,28];                                    /* трофеев своей темы за ур. L→L+1 (всего 239) */
const PET_GOLD=[0,0,0,0,0,0,800,1200,1600,2000,2600,3200,4000,5000,6000,7200,8600,10200,12000]; /* золота за ур. L→L+1 (всего 64 400 на питомца) */
const DZ={h:[1,4,8],tro:[1,3,5],gold:[0,40,80],adDay:1}; /* дозор: часы → трофеи и золото (×(1+0,1·landsU)) */
const PET_LAND={les:['Лес','Forest'],bol:['Болото','Swamp'],pole:['Поле','Field'],kosh:['Кощеево царство','Koschei’s realm'],med:['Медная гора','Copper Mountain'],
  gory:['Горы','Mountains'],more:['Море','Sea'],luk:['Лукоморье','Lukomorye'],ogon:['Огненная земля','Land of Fire'],vihr:['Вихрь','Whirlwind'],lih:['Лихо','Likho']};
const PET_K=.045;                                    /* за уровень: сила +4,5 %, откат −1,35 %, панцирь +0,045 с (было 10 % / 3 % / 0,1 с) */
function petF(l){return 1+PET_K*(l-1);}             /* сила действия */
function petCd(p,l){return p.cd*(1-.3*PET_K*(l-1));} /* откат */
function petMigL(l){l=Math.max(1,l|0);return Math.min(PET_MAX,1+Math.ceil((l-1)*.1/PET_K-1e-9));} /* старый ур. (1–10) → новый с силой не меньше */
function landName(th){return TH[th]&&TH[th].name||L(PET_LAND[th][0],PET_LAND[th][1]);}
function petTroId(th){return 'tr_'+th;}
function petTroName(th){const d=typeof TRO_DEF!=='undefined'&&TRO_DEF[petTroId(th)];return d?L(d.n,d.en||d.n):L('трофей: ','trophy: ')+landName(th);}
function petTroIc(th){const id=petTroId(th),d=typeof TRO_DEF!=='undefined'&&TRO_DEF[id];const k=d&&d.ic&&ART[d.ic]?d.ic:ART[id]?id:ART['m_'+id]?'m_'+id:'pt_tro';return k;}

/* ---------- рисунки (стиль art.js; смотрят вправо; размер 34) ---------- */
function ptEyes(g,x,y,r){eye(g,x-r*1.3,y,r,{px:r*.25});eye(g,x+r*1.3,y,r,{px:r*.25});}
function ptCheek(g,x,y){g.beginPath();g.ellipse(x,y,2.2,1.3,0,0,TAU);g.fillStyle='rgba(240,110,110,.5)';g.fill();}
art('pt_wolf',34,g=>{ell(g,-7,11,2.4,3.4,'#6b7280');ell(g,5,11,2.4,3.4,'#6b7280');ln(g,[-11,3,-16,-2,-15,-6],'#7d8594',3.4);
  ell(g,-2,5,9.5,6.5,'#8a93a3');ell(g,-2,8,6,2.6,'#cfd4de',{ol:false});
  poly(g,[3,-9,4,-17,9,-10],'#7d8594');poly(g,[9,-9,13,-16,14,-7],'#7d8594');poly(g,[4.5,-10,5.3,-14,7.6,-10],'#e9a8a8',{ol:false});
  ell(g,8,-3,8,7,'#8a93a3');ell(g,13,0,4.2,3,'#cfd4de');ell(g,16.6,-.8,1.5,1.2,'#222',{ol:false,flat:true});
  ptEyes(g,8.5,-5,1.9);ptCheek(g,6,0);shine(g,-5,1,4,1.6,.3);});
art('pt_ezh',34,g=>{ell(g,-5,11,2.2,2,'#6a4a30');ell(g,5,11,2.2,2,'#6a4a30');
  g.fillStyle='#5a3e28';for(let i=0;i<9;i++){const a=Math.PI*(1.05+i*.11),x=-2+Math.cos(a)*11,y=3+Math.sin(a)*10;g.beginPath();g.moveTo(-2+Math.cos(a)*6,3+Math.sin(a)*5);g.lineTo(x+Math.cos(a)*5,y+Math.sin(a)*5);g.lineTo(-2+Math.cos(a+.2)*7,3+Math.sin(a+.2)*6);g.closePath();g.fill();}
  ell(g,-2,4,11,8,'#7a5638');ell(g,8,6,6,5,'#e8c9a0');ell(g,13.5,6.5,1.5,1.3,'#222',{ol:false,flat:true});
  g.save();g.translate(-4,-3);gem(g,2.4,'#3aa8f0');g.restore();g.save();g.translate(1,-4);gem(g,2,'#5ad86a');g.restore();
  eye(g,8.5,4,1.7,{px:.5});ptCheek(g,9,8.5);});
art('pt_konek',34,g=>{ell(g,-8,10,2,4.5,'#9a6a3a');ell(g,-2,11,2,4,'#8a5a2e');ell(g,4,11,2,4,'#8a5a2e');ell(g,9,10,2,4.5,'#9a6a3a');
  ln(g,[-11,0,-15,4,-14,9],'#5a3418',2.6);
  ell(g,-1,3,10,6.5,'#c8894a');ell(g,-3,-3,4.5,4,'#c8894a'); /* горбик */
  ell(g,10,-6,5,5.5,'#c8894a');ell(g,14,-3,3.6,3,'#e0b07a');poly(g,[7,-10,7,-17,11,-11],'#c8894a');poly(g,[9.5,-10,12,-17,13,-9],'#c8894a');
  ln(g,[6,-11,4,-5,5,0],'#5a3418',2.4);ell(g,15.6,-3.6,.9,.8,'#3a2010',{ol:false,flat:true});
  eye(g,10.5,-7,1.8,{px:.5});ptCheek(g,11,-3.5);shine(g,-4,0,4,1.6,.3);});
art('pt_voron',34,g=>{ell(g,-3,12,2,1.2,'#d8a020',{ol:false});ell(g,3,12,2,1.2,'#d8a020',{ol:false});ln(g,[-3,7,-3,11],'#d8a020',1.3);ln(g,[3,7,3,11],'#d8a020',1.3);
  poly(g,[-9,2,-17,6,-10,7],'#2e2a3a');ell(g,0,3,9,7.5,'#3a3550');ell(g,-3,4,6,4.5,'#2e2a3a',{rot:.3});
  ell(g,5,-5,6.5,6,'#3a3550');poly(g,[10,-6,17,-4,10,-2],'#e0b030');
  eye(g,6,-7,2,{px:.5});shine(g,-2,0,4,1.6,.25);});
art('pt_yasch',34,g=>{ln(g,[-8,4,-14,6,-17,2,-15,-1],'#3aa86a',3);ell(g,-6,8,1.8,2.2,'#2a8a54');ell(g,4,8,1.8,2.2,'#2a8a54');
  ell(g,-1,4,9,4.5,'#46c27a');g.fillStyle='#ffd84a';for(const x of[-6,-2,2])g.fillRect(x,1.5,1.6,1.6);
  ell(g,9,1,5.5,4.2,'#46c27a');eye(g,10,-1,1.8,{px:.4});ln(g,[13,3,15,3],'#1a5a34',.8);
  g.save();g.translate(14,7);gem(g,2.6,'#3aa8f0');g.restore();});
art('pt_medv',34,g=>{ell(g,-6,11,3,3,'#6a4428');ell(g,6,11,3,3,'#6a4428');ell(g,0,5,9.5,8,'#8a5a32');ell(g,0,8,5.5,3.6,'#c89a6a',{ol:false});
  ell(g,-6,-8,3.2,3.2,'#8a5a32');ell(g,6,-8,3.2,3.2,'#8a5a32');ell(g,0,-3,8,7,'#8a5a32');ell(g,0,0,3.8,2.8,'#d8b080');ell(g,0,-1,1.4,1,'#2a1a10',{ol:false,flat:true});
  ptEyes(g,0,-4,1.7);ptCheek(g,-5,0);ptCheek(g,5,0);
  g.save();g.translate(9,6);g.scale(.42,.42);shp(g,'#d8903a',{hl:.5},[-10,-7,10,6],()=>{g.moveTo(-10,5);g.quadraticCurveTo(-10,-8,0,-8);g.quadraticCurveTo(10,-8,10,5);g.closePath();});g.restore();});
art('pt_cher',34,g=>{ell(g,-7,9,2.6,2,'#6ab86a');ell(g,6,9,2.6,2,'#6ab86a');ell(g,13,2,4.5,3.8,'#7ac87a');
  ell(g,-1,3,11,7.5,'#4a8a4a');g.strokeStyle='rgba(30,60,30,.6)';g.lineWidth=1;for(const x of[-5,3]){g.beginPath();g.moveTo(x,-3.5);g.lineTo(x+1,9);g.stroke();}
  g.beginPath();g.moveTo(-10,3);g.lineTo(9,3);g.stroke();shine(g,-4,-1,4,1.6,.35);
  eye(g,14,0,1.6,{px:.4});mouth(g,15.5,4,1.4,'#2a5a2a',1);});
art('pt_bayun',34,g=>{ln(g,[-9,4,-15,-2,-13,-8],'#6a6a7a',3);ell(g,-6,11,2.4,2.4,'#5a5a6a');ell(g,5,11,2.4,2.4,'#5a5a6a');
  ell(g,-1,5,9.5,6.5,'#7a7a8e');g.strokeStyle='rgba(40,40,60,.5)';g.lineWidth=1.2;for(const x of[-5,-1,3]){g.beginPath();g.moveTo(x,0);g.lineTo(x-1,5);g.stroke();}
  poly(g,[2,-8,3,-16,8,-9],'#7a7a8e');poly(g,[9,-8,14,-15,14,-6],'#7a7a8e');ell(g,8,-3,7.5,6.5,'#8a8aa0');
  ln(g,[13,-1,19,-2],'#fff',.6);ln(g,[13,0,19,1],'#fff',.6);ell(g,12.6,-1,1.1,.8,'#e88',{ol:false,flat:true});
  for(const x of[5.5,10]){g.beginPath();g.arc(x,-4,1.6,.1*Math.PI,.9*Math.PI);g.lineWidth=1;g.strokeStyle='#2a2a3a';g.stroke();} /* жмурится */
  ell(g,-1,-6,3,1.2,'#ffd84a',{rot:-.2,lw:.4});ptCheek(g,7,0);});
art('pt_ptah',34,g=>{glow(g,0,2,14,'#ff9a2a','#ffe8a0');poly(g,[-8,0,-17,-6,-15,2,-17,7,-8,5],'#ff6a1a');
  ell(g,-1,3,8,7,'#ffb02a');ell(g,-3,4,5,4,'#ff7a1a',{rot:.4});ell(g,5,-4,5.5,5,'#ffc23a');poly(g,[9,-5,14,-3,9,-2],'#e07a10');
  poly(g,[3,-9,4,-14,6,-9],'#ff4a1a');poly(g,[5,-9,8,-13,8,-8],'#ff6a1a');ln(g,[-2,9,-2,12],'#c06010',1.2);ln(g,[2,9,2,12],'#c06010',1.2);
  eye(g,6,-5,1.7,{px:.4});});
art('pt_sokol',34,g=>{ln(g,[-2,9,-2,12],'#d8a020',1.3);ln(g,[2,9,2,12],'#d8a020',1.3);poly(g,[-8,3,-16,8,-9,8],'#7a5a3a');
  ell(g,-1,3,8.5,7,'#9a7450');ell(g,1,5,5,4.4,'#efe2c8',{ol:false});g.fillStyle='rgba(90,60,30,.6)';for(const [x,y] of[[0,4],[2.5,6],[-1,7]]){g.fillRect(x,y,1.2,.8);}
  ell(g,-3,2,6,4.4,'#7a5a3a',{rot:.4});ell(g,5,-5,5.5,5,'#9a7450');poly(g,[9,-6,13,-4,9.5,-2.5],'#e0b030');ell(g,6,-3,2.4,1.6,'#efe2c8',{ol:false});
  eye(g,6,-6,1.8,{px:.4});});
art('pt_sova',34,g=>{ln(g,[-3,9,-3,12],'#d8a020',1.2);ln(g,[3,9,3,12],'#d8a020',1.2);
  ell(g,0,3,9,9,'#8a7aa8');ell(g,0,6,5.5,5,'#d8d0e8',{ol:false});poly(g,[-7,-6,-6,-12,-3,-7],'#8a7aa8');poly(g,[7,-6,6,-12,3,-7],'#8a7aa8');
  ell(g,-3.4,-2,3.6,3.6,'#f4f0ff',{lw:.5});ell(g,3.4,-2,3.6,3.6,'#f4f0ff',{lw:.5});
  for(const x of[-3.4,3.4]){g.beginPath();g.arc(x,-2,1.8,0,TAU);g.fillStyle='#ffb02a';g.fill();g.beginPath();g.arc(x+.3,-2,1,0,TAU);g.fillStyle='#1d1b2a';g.fill();}
  poly(g,[-1,0,1,0,0,2.4],'#e0a020');ell(g,-6,4,2.6,5,'#6a5a88',{rot:.2});ell(g,6,4,2.6,5,'#6a5a88',{rot:-.2});});
art('pt_tro',28,g=>{ell(g,0,4,8.5,7.5,'#b07a44');poly(g,[-4,-3,4,-3,6,-8,-6,-8],'#c08a54');ln(g,[-5,-3,5,-3],'#7a4a20',1.6);
  shine(g,-3,1,3,1.4,.35);g.save();g.translate(0,5);gem(g,2.6,'#ffd84a');g.restore();});
art('pt_paw',28,g=>{ell(g,0,4,6,5,'#b07a44');for(const [x,y] of[[-6,-3],[-2,-7],[2,-7],[6,-3]])ell(g,x,y,2.4,2.8,'#b07a44');});

/* ---------- сейв ---------- */
const petOb=v=>v&&typeof v==='object'&&!Array.isArray(v),petNum=v=>typeof v==='number'&&isFinite(v)?v:0;
function petNew(){return {pv:2,own:[],cur:'',lv:{},seen:[],dz:null,ad:{day:'',n:0},c:{dz:0,lv:0},ts:0};}
function petFix(p){const ids=a=>Array.isArray(a)?a.filter((x,i)=>PETS[x]&&a.indexOf(x)===i):[];
  p.own=ids(p.own);p.seen=ids(p.seen);if(!PETS[p.cur]||p.own.indexOf(p.cur)<0)p.cur='';
  if(!petOb(p.lv))p.lv={};if((p.pv|0)<2){for(const k in p.lv)p.lv[k]=petMigL(petNum(p.lv[k]));p.pv=2;}
  for(const k in p.lv){if(!PETS[k])delete p.lv[k];else p.lv[k]=Math.max(1,Math.min(PET_MAX,petNum(p.lv[k])|0));}
  if(!petOb(p.ad))p.ad={day:'',n:0};if(!petOb(p.c))p.c={};for(const k in p.c)p.c[k]=petNum(p.c[k]);
  const z=p.dz;if(!petOb(z)||!PETS[z.th]||typeof z.h!=='string'||DZ.h.indexOf(z.n)<0)p.dz=null;else{z.t=petNum(z.t);z.d=petNum(z.d)||z.n*3600e3;}
  p.ts=petNum(p.ts);return p;}
function petFixS(s){try{s=s||S;if(s.pet!=null&&!petOb(s.pet))s.pet=null;if(!s.pet){if(!PET_ON)return;s.pet=petNew();}petFix(s.pet);}catch(e){petErr('fix',e);}}
/* облако: открытые/увиденные — объединение, уровни — максимум; выбор и дозор — из более нового (ts) */
function petMerge(d,o){try{let b=petOb(d)&&petOb(d.pet)?d.pet:null;if(!b)return;if((b.pv|0)<2)b=petFix(JSON.parse(JSON.stringify(b))); /* облако старой версии — сначала уровни в новые */const a=petOb(o.pet)?o.pet:null;
  if(!a){o.pet=petFix(JSON.parse(JSON.stringify(b)));return;}
  const bn=(+b.ts||0)>(+a.ts||0),nw=JSON.parse(JSON.stringify(bn?b:a)),ol=bn?a:b,un=(x,y)=>(Array.isArray(x)?x:[]).concat(Array.isArray(y)?y:[]);
  nw.own=un(a.own,b.own);nw.seen=un(a.seen,b.seen);nw.lv={};for(const s of[a.lv,b.lv])if(petOb(s))for(const k in s)nw.lv[k]=Math.max(nw.lv[k]|0,s[k]|0);
  nw.c=petOb(nw.c)?nw.c:{};const oc=petOb(ol.c)?ol.c:{};for(const k in oc)nw.c[k]=Math.max(+nw.c[k]||0,+oc[k]||0);
  o.pet=petFix(nw);}catch(e){petErr('merge',e);}}
petFixS(); /* первая загрузка: META_HK('FIX') в fixSave ещё не объявлен — чиним сами (как meta.js) */
function P(){return PET_ON&&S.pet||null;}
function petTouch(){const p=P();if(p)p.ts=Date.now();}
function petEv(a,x){try{const o={a:a};if(x)for(const k in x)o[k]=x[k];STAT.ev('pet',o);}catch(e){}}

/* ---------- кто открыт ---------- */
function petThemes(){return TH_IDS.filter(t=>TH[t]&&PETS[t]);}      /* выпущенные темы (без ?th — только 8 старых) */
function lairSlot(th){let r=null;for(const c of CAMP)if(c.th===th&&ORD.indexOf(c.slot)>=0&&(!r||c.n>r.n))r=c;return r?r.slot:-1;} /* «Логово» = глава 3; тема не выпущена — её последняя глава в ORD */
function petEarned(th){const s=lairSlot(th);return s>=0&&!!S.done[s];}
/* дописать в own всё заработанное; вернуть новые (для «Новый друг!») */
function petSync(){const p=P();if(!p)return [];const nw=[];for(const th of petThemes())if(p.own.indexOf(th)<0&&petEarned(th)){p.own.push(th);p.lv[th]=p.lv[th]||1;nw.push(th);}
  if(nw.length){if(!p.cur)p.cur=nw[0];petTouch();for(const th of nw)petEv('new',{k:th});}return nw;}
function petShow(){return !!P()&&(S.runs||0)>=3;}                   /* новичку (первые 3 похода) — ничего */
function petLv(th){const p=P();return p&&p.lv[th]||1;}
function petUnseen(){const p=P();return p?p.own.filter(t=>p.seen.indexOf(t)<0):[];}

/* ---------- прокачка (сток) ---------- */
function petCost(th){const l=petLv(th);if(l>=PET_MAX)return null;return {tro:PET_TRO[l-1],gold:PET_GOLD[l-1]};}
function petCanUp(th){const c=petCost(th);return !!c&&TRO_N(petTroId(th))>=c.tro&&S.gold>=c.gold;}
function petUp(th){const p=P();if(!p||p.own.indexOf(th)<0)return;const c=petCost(th);if(!c||S.gold<c.gold)return;
  const o={};o[petTroId(th)]=c.tro;if(!TRO_SPEND(o)){toast(L('Не хватает трофеев','Not enough trophies'));return;}
  if(c.gold){S.gold-=c.gold;STAT.ev('spend',{k:'pet:'+th+(p.lv[th]+1),c:c.gold});}
  p.lv[th]=(p.lv[th]||1)+1;p.c.lv=(p.c.lv||0)+1;petTouch();save();SND.chest();setGold();petEv('lvl',{k:th,l:p.lv[th]});
  toast(PETS[th].n+L(': уровень ',': level ')+p.lv[th]);}
function petPick(th){const p=P();if(!p||th&&p.own.indexOf(th)<0)return;p.cur=th||'';petTouch();save();SND.click();petEv('pick',{k:th||'-'});}

/* ---------- дозор ---------- */
function petNow(){return nowMs();}
function petLeftTxt(ms){const m=Math.max(1,Math.ceil(ms/60000));if(m<60)return m+L(' мин',' min');const h=Math.floor(m/60),r=m%60;return h+L(' ч',' h')+(r?' '+r+L(' мин',' min'):'');}
function dzHeroes(){return HEROES.filter(h=>heroOpen(h)&&h.id!==S.hero);}  /* свободные — открытые, кроме выбранного для похода */
function dzLands(){return petThemes().filter(th=>CAMP.some(c=>c.th===th&&ORD.indexOf(c.slot)>=0&&S.done[c.slot]));}
function dzLeft(){const p=P();return p&&p.dz?Math.max(0,p.dz.t+p.dz.d-petNow()):0;}
function dzGain(n,th){const i=DZ.h.indexOf(n),k=1+.1*landsU(),dn=CAMP.filter(c=>c.th===th&&S.done[c.slot]).length;
  return {tro:DZ.tro[i]+(dn>=3&&n>=4?1:0),gold:Math.round(DZ.gold[i]*k/5)*5};}           /* вся земля пройдена — +1 трофей за 4/8 ч */
function dzGo(h,th,n){const p=P();if(!p||p.dz||!HERO_BY[h]||dzHeroes().indexOf(HERO_BY[h])<0||dzLands().indexOf(th)<0||DZ.h.indexOf(n)<0)return;
  p.dz={h,th,n,t:petNow(),d:n*3600e3};p.c.dz=(p.c.dz||0)+1;petTouch();save();SND.click();petEv('dz_go',{k:th,h:n});
  toast(HERO_BY[h].name+L(' ушёл в дозор: ',' went on patrol: ')+landName(th));}
function dzAdLeft(){const p=P();if(!p)return 0;return p.ad.day===dayKey()?Math.max(0,DZ.adDay-(p.ad.n||0)):DZ.adDay;}
/* забрать добычу дозора; x2 — за ролик (1 в день) */
function dzTake(x2){const p=P();if(!p||!p.dz||dzLeft()>0)return '';const z=p.dz,g=dzGain(z.n,z.th),m=x2?2:1;
  TRO_ADD(petTroId(z.th),g.tro*m);if(g.gold){S.gold+=g.gold;ern('oth',g.gold);}
  if(x2){const dk=dayKey();p.ad={day:dk,n:(p.ad.day===dk?p.ad.n||0:0)+1};}
  p.dz=null;petTouch();save();SND.chest();setGold();petEv('dz_take',{k:z.th,h:z.n,n:g.tro*m,g:g.gold,x:m});
  const t=petTroName(z.th)+' +'+g.tro*m+(g.gold?' · '+L('золото','gold')+' +'+g.gold:'');toast(t);return t;}

/* ---------- окно «Питомцы и дозор» ---------- */
const petUI={h:'',th:'',n:4};let petT=0;
const pSec=t=>'<div style="font-weight:900;font-size:18px;margin:14px 4px 6px">'+t+'</div>';
function petTip(p){if(p.dz&&dzLeft()<=0)return L('Дозорный вернулся — забери добычу!','Your scout is back — collect the loot!');
  if(!p.own.length)return L('Победи «Логово» земли — и у тебя появится друг-помощник.','Beat a land’s Lair — and a little helper will join you.');
  if(p.cur&&petCanUp(p.cur))return L('Хватает трофеев — '+PETS[p.cur].n+' может подрасти!','You have the trophies — '+PETS[p.cur].n+' can grow!');
  if(!p.dz&&dzHeroes().length&&dzLands().length)return L('Свободный богатырь может сходить в дозор за трофеями.','A free hero can go on patrol for trophies.');
  return p.cur?L(PETS[p.cur].n+' пойдёт с тобой в поход по главе.',PETS[p.cur].n+' joins you on chapter runs.'):L('Выбери, кто пойдёт с тобой в поход.','Choose who joins you on runs.');}
function petHTML(p){let h='<h3>'+L('🐾 Питомцы','🐾 Pets')+'</h3><canvas id="petC" style="width:100%;height:130px;display:block;border-radius:12px"></canvas>'+
  '<div class="card"><div class="row"><img class="ic" src="'+ic(p.cur?PETS[p.cur].k:'pt_paw',96)+'"><div class="t"><span style="font-size:15px;color:inherit">'+petTip(p)+'</span></div></div></div>';
  // выбранный питомец
  if(p.cur){const th=p.cur,P0=PETS[th],l=petLv(th),c=petCost(th),have=TRO_N(petTroId(th));
    h+=pSec(P0.n+' · '+L('ур. ','lv ')+l+'/'+PET_MAX)+'<div class="card"><div class="row"><img class="ic" src="'+ic(P0.k,96)+'"><div class="t"><b>'+P0.d+'</b><span>'+petFx(th,l)+'</span>'+
      '<div class="bar"><i style="width:'+Math.round(l/PET_MAX*100)+'%"></i></div></div></div>';
    if(c){const ok=petCanUp(th);h+='<div class="row" style="margin-top:6px"><img class="ic" src="'+ic(petTroIc(th),64)+'" style="width:40px;height:40px"><div class="t"><b style="font-size:15px">'+have+'/'+c.tro+(c.gold?' · '+fmtNum(c.gold)+L(' зол.',' gold'):'')+'</b><span style="font-size:13px">'+petTroName(th)+'</span><span style="color:var(--cOk);font-size:13px">'+L('станет: ','next: ')+petFx(th,l+1)+'</span></div>'+
      '<button class="btn'+(ok?' gold':' ghost')+'" id="petUp" '+(ok?'':'disabled')+'>'+L('Растить','Level up')+'</button></div>';}
    else h+='<p class="sub">'+L('Вырос! Самый сильный помощник.','Fully grown! The best helper.')+'</p>';
    h+='</div>';}
  // все питомцы
  h+=pSec(L('Друзья земель','Friends of the lands'))+'<div style="display:flex;flex-wrap:wrap;gap:6px">';
  for(const th of petThemes()){const own=p.own.indexOf(th)>=0,sel=p.cur===th,nw=own&&p.seen.indexOf(th)<0;
    h+='<button class="btn'+(sel?' gold':' ghost')+'" style="flex:1 1 88px;min-width:88px;max-width:100%;display:flex;flex-direction:column;align-items:center;padding:6px 4px;line-height:1.15;position:relative;white-space:normal;text-align:center;overflow:hidden" data-pp="'+(own?th:'')+'" data-pl="'+th+'">'+
      '<img src="'+ic(PETS[th].k,64)+'" width="40" height="40"'+(own?'':' style="filter:brightness(0);opacity:.3"')+'>'+
      '<span style="font-size:14px">'+(own?PETS[th].n:'?')+'</span><span style="font-size:'+(own?13:11)+'px;opacity:.8;overflow-wrap:anywhere;hyphens:auto">'+(own?L('ур. ','lv ')+petLv(th):landName(th))+'</span>'+
      (nw?'<span style="position:absolute;top:2px;right:6px;color:var(--cBad);font-weight:900">●</span>':'')+'</button>';}
  h+='</div>';
  if(p.cur)h+='<div class="btns"><button class="btn ghost" id="petNone">'+L('В поход без питомца','Go without a pet')+'</button></div>';
  h+='<p class="sub">'+L('Питомец ходит только в походы по главам (не в первый поход, поход дня, неделю и сечу).','Pets join chapter runs only (not the first run, Daily Run, Weekly Trial or Endless Battle).')+'</p>';
  // дозор
  h+=pSec(L('🛡 Дозор','🛡 Patrol'));
  if(p.dz){const z=p.dz,left=dzLeft(),g=dzGain(z.n,z.th),al=dzAdLeft(),hr=HERO_BY[z.h];
    h+='<div class="card"><div class="row"><img class="ic" src="'+ic('hp_'+skinKey(z.h),96)+'"><div class="t"><b>'+(hr?hr.name:'')+' · '+landName(z.th)+'</b><span data-pl2="dz">'+(left>0?L('вернётся через ','back in ')+petLeftTxt(left):L('вернулся!','is back!'))+'</span>'+
      '<span>'+petTroName(z.th)+' +'+g.tro+(g.gold?' · '+L('золото','gold')+' +'+g.gold:'')+'</span><div class="bar"><i data-pb="dz" style="width:'+Math.round(Math.min(1,(petNow()-z.t)/z.d)*100)+'%"></i></div></div>'+
      (left>0?'':'<button class="btn gold" id="dzTake">'+L('Забрать','Collect')+'</button>')+'</div>'+
      (left<=0&&al>0&&adOk()?'<div class="btns"><button class="btn ad" id="dzAd">'+L('🎬 ×2 трофеев за рекламу','🎬 ×2 trophies for an ad')+'</button></div>':'')+'</div>';}
  else{const hs=dzHeroes(),ls=dzLands();
    if(!hs.length)h+='<div class="card"><div class="row"><img class="ic" src="'+ic('pt_paw',96)+'" style="opacity:.6"><div class="t"><span>'+L('В дозор ходит свободный богатырь — не тот, с кем идёшь в поход. Позови второго богатыря.','A free hero goes on patrol — not the one you take on runs. Recruit a second hero.')+'</span></div></div></div>';
    else if(!ls.length)h+='<div class="card"><div class="row"><div class="t"><span>'+L('Сначала освободи хотя бы одну главу.','Free at least one chapter first.')+'</span></div></div></div>';
    else{if(!hs.some(x=>x.id===petUI.h))petUI.h=hs[0].id;if(ls.indexOf(petUI.th)<0)petUI.th=ls[ls.length-1];if(DZ.h.indexOf(petUI.n)<0)petUI.n=4;
      const g=dzGain(petUI.n,petUI.th);
      h+='<p class="sub">'+L('Богатырь сходит в освобождённую землю и принесёт трофеи этой земли.','A hero visits a freed land and brings back its trophies.')+'</p>'+
        '<div class="btns" style="flex-direction:row;flex-wrap:wrap">'+hs.map(x=>'<button class="btn'+(x.id===petUI.h?' gold':' ghost')+'" style="flex:1 1 120px;min-width:110px;font-size:15px" data-dh="'+x.id+'"><img src="'+ic('hp_'+skinKey(x.id),48)+'" width="24" height="24" style="vertical-align:middle"> '+x.name.split(' ')[0]+'</button>').join('')+'</div>'+
        '<div class="btns" style="flex-direction:row;flex-wrap:wrap">'+ls.map(t=>'<button class="btn'+(t===petUI.th?' gold':' ghost')+'" style="flex:1 1 120px;min-width:110px;font-size:15px" data-dl="'+t+'"><img src="'+ic(petTroIc(t),40)+'" width="22" height="22" style="vertical-align:middle"> '+landName(t)+'</button>').join('')+'</div>'+
        '<div class="btns" style="flex-direction:row">'+DZ.h.map(n=>'<button class="btn'+(n===petUI.n?' gold':' ghost')+'" style="flex:1" data-dn="'+n+'">'+n+L(' ч',' h')+'</button>').join('')+'</div>'+
        '<div class="card"><div class="row"><img class="ic" src="'+ic(petTroIc(petUI.th),64)+'" style="width:40px;height:40px"><div class="t"><b>'+L('Добыча: +','Loot: +')+g.tro+(g.gold?' · '+L('золото','gold')+' +'+g.gold:'')+'</b><span style="font-size:13px">'+petTroName(petUI.th)+'</span></div>'+
        '<button class="btn" id="dzGo">'+L('В дозор','Send')+'</button></div></div>';}}
  h+='<div class="btns"><button class="btn big" id="petBack">'+L('Назад','Back')+'</button></div>';return h;}
/* текст силы на уровне l */
function petFx(th,l){const d1=v=>{v=Math.round(v*10)/10;return dec(v,v%1?1:0);},p=PETS[th],f=petF(l),cd=petCd(p,l).toFixed(1).replace('.',LANG==='en'?'.':',');
  switch(p.a){case 'bite':case 'peck':case 'hawk':return L('урон ','damage ')+d1(p.v*f)+L(' × сила, раз в ',' × might, every ')+cd+L(' с',' s');
    case 'burn':return L('3 × урон ','3 × damage ')+d1(p.v*f)+L(', раз в ',', every ')+cd+L(' с',' s');
    case 'gems':case 'coins':return L('радиус ','radius ')+Math.round(p.v*f)+L(', раз в ',', every ')+cd+L(' с',' s');
    case 'gem':return L('самоцвет ×','gem ×')+Math.round(p.v*f)+L(' опыта, раз в ',' XP, every ')+cd+L(' с',' s');
    case 'pie':return L('пирожок раз в ','a pie every ')+Math.round(petCd(p,l))+L(' с',' s');
    case 'shell':return L('панцирь ','shell ')+(p.v+PET_K*(l-1)).toFixed(2).replace('.',LANG==='en'?'.':',')+L(' с, раз в ',' s, every ')+Math.round(petCd(p,l))+L(' с',' s');
    case 'sleep':case 'hoot':return L('радиус ','radius ')+Math.round(p.v*Math.sqrt(f))+L(', раз в ',', every ')+cd+L(' с',' s');}return '';}
function openPets(){const p=P();if(!p)return;petSync();STAT.screen('pet');
  const keep=$('modal').classList.contains('on')&&$('mBody').getAttribute('data-w')==='pet'?$('mBody').scrollTop:0;
  showModal(petHTML(p),'pet');if(keep)$('mBody').scrollTop=keep;
  const un=petUnseen();if(un.length){for(const t of un)p.seen.push(t);petTouch();save();}
  drawPetScene();const re=()=>openPets();
  on('petBack',closePets);on('petUp',()=>{petUp(p.cur);re();});on('petNone',()=>{petPick('');re();});
  on('dzGo',()=>{dzGo(petUI.h,petUI.th,petUI.n);re();});on('dzTake',()=>{dzTake(false);re();});
  for(const b of $('mBody').querySelectorAll('[data-pl]'))b.onclick=()=>{SND.click();const th=b.dataset.pp;if(th){petPick(th);re();}else toast(L('Победи «Логово» земли «','Beat the Lair of ')+landName(b.dataset.pl)+L('»',''));};
  for(const b of $('mBody').querySelectorAll('[data-dh]'))b.onclick=()=>{SND.click();petUI.h=b.dataset.dh;re();};
  for(const b of $('mBody').querySelectorAll('[data-dl]'))b.onclick=()=>{SND.click();petUI.th=b.dataset.dl;re();};
  for(const b of $('mBody').querySelectorAll('[data-dn]'))b.onclick=()=>{SND.click();petUI.n=+b.dataset.dn;re();};
  onAd('dzAd','patrol2',()=>{const t0=p.dz&&p.dz.t;showRewarded(()=>{dzTake(true);if(modalHas($('petBack')))re();},null,
    ()=>{const q=P();if(!q||!q.dz||q.dz.t!==t0||dzLeft()>0)return '';const t=dzTake(true);if(modalHas($('petBack')))re();else lateRe();return t;});});
  clearInterval(petT);petT=setInterval(petTick,1000);}
function closePets(){clearInterval(petT);petT=0;hideModal();if(typeof curTab!=='undefined'&&curTab==='Village'&&!G)try{renderVillage();}catch(e){}}
function petTick(){const p=P();if(!p||!$('modal').classList.contains('on')||$('mBody').getAttribute('data-w')!=='pet'||!$('petBack')){clearInterval(petT);petT=0;return;}
  if(!p.dz)return;const l=dzLeft(),el=$('mBody').querySelector('[data-pl2="dz"]'),b=$('mBody').querySelector('[data-pb="dz"]');
  if(l<=0&&!$('dzTake')){openPets();return;}if(el&&l>0)el.textContent=L('вернётся через ','back in ')+petLeftTxt(l);if(b)b.style.width=Math.round(Math.min(1,(petNow()-p.dz.t)/p.dz.d)*100)+'%';}
/* сценка: поляна, богатырь и выбранный питомец рядом */
function drawPetScene(){const c=$('petC');if(!c)return;const p=P();if(!p)return;const r=c.getBoundingClientRect(),W=r.width||300,H=r.height||130,d=Math.min(devicePixelRatio||1,2);
  c.width=W*d;c.height=H*d;const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);g.lineJoin=g.lineCap='round';
  const sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#7ec4ff');sk.addColorStop(.45,'#d8efff');sk.addColorStop(.46,'#94d070');sk.addColorStop(1,'#5aa447');g.fillStyle=sk;g.fillRect(0,0,W,H);
  glow(g,W*.1,H*.14,22,'#fff2a8','#ffffff');
  for(let i=0;i<7;i++){const x=(i*53+17)%W,y=H*.55+((i*37)%30);g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(x,y,2,0,TAU);g.fill();g.fillStyle='#ffd84a';g.beginPath();g.arc(x,y,.9,0,TAU);g.fill();}
  const k=Math.min(1.3,H/130),hk='h_'+skinKey(HERO_BY[S.hero]&&heroOpen(HERO_BY[S.hero])?S.hero:'dob')+'_0';
  if(typeof metaArt==='function'){metaArt(g,hk,W*.42,H*.6,k*1.05);
    if(p.cur){metaArt(g,PETS[p.cur].k,W*.62,H*.78,k*1.25);}
    else{let i=0;for(const th of p.own.slice(0,3))metaArt(g,PETS[th].k,W*(.62+.12*i++),H*.8,k);}
    if(p.dz)metaArt(g,'pt_paw',W*.88,H*.3,k*.7);}}

/* ---------- в бою: такт (крючок FRAME) и рисунок (крючок DRAW) ---------- */
function petNear(R){const H=G.hero,a=[];for(const e of G.en){if(e.dead||e.prop||e.invul)continue;const d=Math.hypot(e.x-H.x,e.y-H.y);if(d<R)a.push([d,e]);}a.sort((x,y)=>x[0]-y[0]);return a.map(x=>x[1]);}
function petHit(e,v){const M=G.petM,H=G.hero,dx=e.x-H.x,dy=e.y-H.y,d=Math.hypot(dx,dy)||1;hitEnemy(e,v*(G.st.might||1),dx/d*60,dy/d*60);spark(e.x,e.y,M.col,5);M.go={x:e.x,y:e.y,t:0};}
function petAct(M){const H=G.hero,f=petF(M.l),p=PETS[M.th];let did=true;
  switch(p.a){
    case 'bite':{const e=petNear(150)[0];if(e)petHit(e,p.v*f);else did=false;break;}
    case 'peck':{const a=petNear(240);if(!a.length){did=false;break;}let e=a.find(x=>x.boss||x.elite||x.mini);if(!e)e=a.reduce((m,x)=>x.hp>m.hp?x:m,a[0]);petHit(e,p.v*f);break;}
    case 'hawk':{const a=petNear(280);if(!a.length){did=false;break;}petHit(a.find(x=>x.ranged)||a[a.length-1],p.v*f);break;}
    case 'burn':{const a=petNear(140).slice(0,3);if(!a.length){did=false;break;}for(const e of a)petHit(e,p.v*f);break;}
    case 'gems':{const R=p.v*f;let n=0;for(const g of G.gems)if(!g.mag&&(g.x-H.x)**2+(g.y-H.y)**2<R*R){g.mag=true;n++;}did=n>0;break;}
    case 'coins':{const R=p.v*f;let n=0;for(const q of G.picks)if(q.k==='coin'&&!q.mag&&(q.x-H.x)**2+(q.y-H.y)**2<R*R){q.mag=true;n++;}did=n>0;break;}
    case 'gem':{dropGem(M.x,M.y,Math.round(p.v*f));spark(M.x,M.y,'#5ac8ff',6);break;}
    case 'pie':{drop('pie',M.x,M.y);spark(M.x,M.y,'#ffd84a',6);break;}
    case 'shell':{if(H.hp>0&&H.hp<G.st.maxHp*.4&&!(H.inv>0)){H.inv=p.v+PET_K*(M.l-1);G.fx.push({k:'pulse',own:1,t:0,dur:.6,r1:70});SND.heal();}else did=false;break;}
    case 'sleep':{const R=p.v*Math.sqrt(f),a=petNear(R);if(!a.length){did=false;break;}for(const e of a)e.slow=Math.max(e.slow||0,2);G.fx.push({k:'wave',x:H.x,y:H.y,t:0,dur:.5,r1:R,col:'#b08aff'});break;}
    case 'hoot':{const R=p.v*Math.sqrt(f),a=petNear(R).filter(e=>!e.boss);if(!a.length){did=false;break;}for(const e of a){const dx=e.x-H.x,dy=e.y-H.y,d=Math.hypot(dx,dy)||1;e.kx+=dx/d*380;e.ky+=dy/d*380;}G.fx.push({k:'wave',x:H.x,y:H.y,t:0,dur:.5,r1:R,col:'#d8d0ff'});break;}}
  if(did)M.n=(M.n||0)+1;return did;}
function petStep(dt){if(!G||!G.petM||G.over)return;const M=G.petM,H=G.hero;dt=Math.max(0,Math.min(.1,dt||0));
  try{if(dt>0){const side=H.flip||1,tx=M.go?M.go.x:H.x-30*side,ty=M.go?M.go.y:H.y+14,k=Math.min(1,dt*(M.go?14:6));
      const ox=M.x;M.x+=(tx-M.x)*k;M.y+=(ty-M.y)*k;if(Math.abs(M.x-ox)>.2)M.flip=M.x>ox?1:-1;else if(!M.go)M.flip=side;
      if(M.go&&(M.go.t+=dt)>.22)M.go=null;M.mv=Math.hypot(tx-M.x,ty-M.y)>4;
      if(!G.win&&H.hp>0){M.cd-=dt;if(M.cd<=0){M.cd=petAct(M)?petCd(PETS[M.th],M.l):.5;}}}}catch(e){petErr('step',e);}}
/* рисунок — крючок DRAW: мировые координаты, после сущностей (движок сам вернёт worldT) */
function petDraw(c){if(!G||!G.petM||G.over)return;const M=G.petM,s=SPR[PETS[M.th].k]||spr(PETS[M.th].k);if(!s)return;
  const bob=M.mv?Math.abs(Math.sin(G.t*12))*2.4:Math.sin(G.t*3)*.6,sc=.9;
  c.save();c.globalAlpha=.22;c.fillStyle='#000';c.beginPath();c.ellipse(M.x,M.y+10,10*sc,3*sc,0,0,TAU);c.fill();c.globalAlpha=1;
  c.translate(M.x,M.y-bob);c.scale(sc*(M.flip||1),sc);c.drawImage(s.c,-s.s/2,-s.s/2,s.s,s.s);c.restore();}

/* ---------- крючки (META_MODS) ---------- */
META_MODS.push({id:'pet',
  /* сила богатыря (powerScore): выбранный питомец — постоянная прибавка +2 % (ур. 1) … +3,8 % (ур. 10) — «полезный, но слабый» */
  PW(h){if(!PET_ON)return 1;const p=P();if(!p||!p.cur||(S.runs||0)<3)return 1;return 1+.01*petF(petLv(p.cur));},
  FIX(s){petFixS(s);},
  MERGE(d,o){if(PET_ON||petOb(d&&d.pet)||petOb(o.pet))petMerge(d,o);},
  RUN(G){if(!PET_ON||!G)return;const p=P();if(!p||(S.runs||0)<3)return;if(G.endless||G.daily||G.weekly||G.first)return;
    petSync();const th=p.cur;try{STAT.ev('pet',{a:'run',k:th||'-',l:th?petLv(th):0});}catch(e){}
    if(!th||!PETS[th])return;const H=G.hero;
    G.petM={th,l:petLv(th),x:H.x-24,y:H.y+12,flip:1,cd:2,go:null,mv:false,col:{les:'#cfd4de',kosh:'#8a7ac8',vihr:'#efe2c8',ogon:'#ff9a2a'}[th]||'#ffffff'};},
  FRAME(dt,G0){if(PET_ON&&G0&&G0.petM)petStep(dt);},
  DRAW(c,G0){if(PET_ON&&G0&&G0.petM)try{petDraw(c);}catch(e){petErr('draw',e);}},
  END(G,win){if(!PET_ON||!G)return;const nw=petSync();if(!nw.length)return;save();
    /* fix-v23 (задача 8): ПЕРВЫЙ питомец — крупно, с картинкой и кнопкой «К питомцу» (итоги → деревня → окно питомцев); дальше — строкой, как было */
    if(P().own.length===nw.length&&(S.runs||0)>=3){const t=nw[0];G.metaHtml=(G.metaHtml||'')+'<div class="unlock"><img src="'+ic(PETS[t].k,160)+'"><div><b>'+L('🐾 Новый друг: ','🐾 New friend: ')+PETS[t].n+'</b><span>'+
      L('Питомец ходит с тобой в походы и помогает в бою. Прокачивай его в деревне.','Your pet joins your runs and helps in battle. Level it up in the village.')+'</span></div></div><button class="btn gold" id="rPet" style="width:100%;margin-top:6px">'+L('🐾 К питомцу','🐾 Meet your pet')+'</button>';return;}
    G.metaHtml=(G.metaHtml||'')+'<p class="sub">🐾 '+L('Новый друг: ','New friend: ')+'<b>'+nw.map(t=>PETS[t].n).join(', ')+'</b>'+L(' — загляни в деревню, «Питомцы»',' — see Pets in the village')+'</p>';},
  VIL(el){if(!petShow()||!el)return;const p=P();petSync();if(!p.own.length&&!p.dz&&!dzHeroes().length)return;
    const un=petUnseen().length,dzr=p.dz&&dzLeft()<=0,d=document.createElement('div');d.className='card'+(un||dzr?' next':'');d.id='petCard';
    d.innerHTML='<div class="row"><img class="ic" src="'+ic(p.cur?PETS[p.cur].k:'pt_paw',96)+'"><div class="t"><b>'+L('🐾 Питомцы и дозор','🐾 Pets & patrol')+'</b><span>'+petStatus(p)+'</span></div><button class="btn gold" id="petGo">'+L('Открыть','Open')+'</button></div>';
    const y=el.querySelector('#yardCard'),cvv=el.querySelector('#village'),ref=y||cvv;if(ref&&ref.nextSibling)el.insertBefore(d,ref.nextSibling);else el.appendChild(d);
    on('petGo',()=>openPets());},
  TODAY(TL){if(!petShow())return;const p=P();petSync();if(!p.own.length&&!p.dz)return;const un=petUnseen().length,dzr=!!(p.dz&&dzLeft()<=0);
    TL.push({k:'pet',ic:p.cur?PETS[p.cur].k:'pt_paw',t:L('Питомцы и дозор','Pets & patrol'),s:petStatus(p),ready:dzr||!!un,b:L('Открыть','Open'),fn:()=>{hideModal();openPets();}});},
  CHIPS(a){if(!petShow())return;const p=P();if(p.dz&&dzLeft()<=0)a.push('<i class="hot">🛡 '+L('дозор вернулся','patrol is back')+'</i>');else if(petUnseen().length)a.push('<i class="hot">🐾 '+L('новый питомец','new pet')+'</i>');}});
function petStatus(p){const a=[];if(p.dz){const l=dzLeft();a.push(l>0?L('дозор: ','patrol: ')+petLeftTxt(l):L('дозор вернулся!','patrol is back!'));}
  if(petUnseen().length)a.push(L('новый друг!','new friend!'));
  if(p.cur)a.push(PETS[p.cur].n+' · '+L('ур. ','lv ')+petLv(p.cur));else if(p.own.length)a.push(L('питомцев: ','pets: ')+p.own.length);
  if(!p.dz&&dzHeroes().length&&dzLands().length)a.push(L('дозор свободен','patrol available'));
  if(!p.own.length&&!p.dz)a.push(L('друга даст «Логово» земли','beat a Lair to get a friend'));return a.join(' · ');}

/* ---------- для проверки на своей машине: PET.skip(сек), PET.give() ---------- */
const PET={on:PET_ON,open:openPets,
  skip(sec){if(!LOCAL)return;const p=P();if(p&&p.dz){p.dz.t-=sec*1000;save();}},
  give(all){if(!LOCAL)return;const p=P();if(!p)return;for(const th of petThemes())if(all||petEarned(th)){if(p.own.indexOf(th)<0)p.own.push(th);p.lv[th]=p.lv[th]||1;}if(!p.cur&&p.own.length)p.cur=p.own[0];save();}};
