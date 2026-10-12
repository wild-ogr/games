'use strict';
/* ================= gb-meta — мета «Образцовый»: разряды магазина, печати, «Проверка Торга», знамя ★N, отделы (данные), благодарности =================
   Поток META (журнал hobby-analytics/release-i/gastronom-boost/logs/META.md). Выключатель: GB.flag('meta') (window.GB_OFF={meta:1}) —
   тогда GBM есть, но молчит: rank()=0, ничего не рисует и не меняет (другие модули могут звать без проверок).
   ДОГОВОР (для VIEW, ART, ECO, LVL, MODE, MG0, NEWBIE, LEAGUE, TECH, FEST):
   GBM.rank()        → 0…9 — разряд магазина (0 «Захудалый» … 9 «Гастроном №1 города»)
   GBM.info(r)       → {r, name, short, title (звание Вали), sign (вывеска), l (уровней нужно), s (печатей нужно), torg (что за Проверка)}
   GBM.next()        → путь к следующему: {r, l, lHave, s, sHave, ready (условия есть — ждёт Проверку Торга), frac 0…1} | null на №1
   GBM.levels()      → пройдено уровней (S.unlocked-1)
   GBM.seals()       → всего печатей «План выполнен»; GBM.star() → «Знамя ★N» (после №1: каждые 8 печатей)
   GBM.torgReady()   → true — условия разряда выполнены, ждём «Проверку Торга»
   GBM.torg          → поставщик Проверки (LVL/MODE): GBM.torg={start:function(r){… startLevel своим режимом G.mode='torg' …}, name:function(r){}}
                       нет поставщика — Проверкой Торга считается ближайшая Ревизия (10-й уровень города) после выполнения условий.
                       Победа уровня с info.mode==='torg' (или Ревизии без поставщика) при torgReady() → новый разряд.
   GBM.dep(id)       → уровень отдела 0…3 (0 — закрыт/в лесах); id: bakaleya hleb steklo moloko gastro konditer ovoshi soki ryba zakaz
   GBM.depList()     → [{id, n, ic, r (разряд открытия), lv, open (разряд позволяет), price (след. улучшения | 0 — всё), gives (что даёт сейчас), next (что даст)}]
   GBM.depBuy(id)    → купить следующее улучшение (монеты; цены — GBECO.dep). true — куплено
   GBM.thanks(src)   → благодарность в «Книгу жалоб» (мини-игры: src='mg', не больше GBECO.book.mgDay=2 в день). true — записана
   GBM.thanksN()     → всего благодарностей
   GBM.branch()      → открытых филиалов (после №1)
   События: GB.emit('rank', r) — новый разряд; GB.emit('dep', {id, lv}) — улучшение отдела; GB.emit('thanks', {src, n}); 'seal' — у GBPL.
   ПОЛЯ сохранения (все с префиксом mt, сливает свой merge): mtR разряд, mtRs показан разряд (грамота), mtT ждёт Проверку (0/1),
     mtS печатей всего, mtSw [дни печатей, ≤14], mtSt знамя ★N объявлено, mtD {отдел: ур.}, mtF филиалов, mtK благодарностей, mtKd {d, mg} — сегодня от мини-игр,
     mtM — флаг пересчёта старых (gb-migrate.js). Строки — по-русски; в ?lang=en без перевода (GB_EN[строка]) — не показываются.
   Числа — из GBECO (ECO); здесь — запасные (04-meta-economy §2 А, модель 04-tools/meta_sim.py). */
(function(){
if(typeof GB==='undefined')return;
var ON=GB.flag('meta');
function num(x){x=+x;return isFinite(x)&&x>0?x:0;}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function S_(){return typeof S!=='undefined'?S:null;}
function E(path,def){try{var o=window.GBECO;var p=path.split('.');for(var i=0;i<p.length;i++){if(o==null)return def;o=o[p[i]];}return o==null?def:o;}catch(e){return def;}}
function dk(){try{return +todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function dnum(k){return Math.round(Date.UTC(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100)/864e5);}
function en(){try{return LANG==='en';}catch(e){return false;}}
// строка для экрана: по-русски; в английской версии — только переведённая (GB_EN от потока EN), иначе '' (прячем)
function R(s){if(!en())return s;var m=window.GB_EN;return m&&m[s]||'';}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function stat(ev,o){try{if(window.STAT&&STAT.ev)STAT.ev(ev,o);}catch(e){}}
function sv(){try{save();}catch(e){}}

/* ---------- 10 разрядов ---------- */
// l — пройдено уровней, s — печатей «План выполнен» (не больше одной в день). Темп — модель META-tools/meta_sim2.py → sim-meta2.txt:
// казуал (12 мин × 5 дн) — №1 на 15-й неделе, ядро (50 мин × 7) — на 9-й (тормоз — печати)
var RANKS=[
 {name:'Захудалый магазин',short:'Захудалый',title:'продавец',sign:'ГАС…ОНОМ',l:0,s:0,torg:''},
 {name:'Магазин 3-го разряда',short:'3-й разряд',title:'продавец',sign:'МАГАЗИН',l:10,s:2,torg:'Проверка Торга: без Столика'},
 {name:'Магазин 2-го разряда',short:'2-й разряд',title:'старший продавец',sign:'ПРОДУКТЫ',l:28,s:6,torg:'Проверка Торга: очередь из ревизоров'},
 {name:'Магазин 1-го разряда',short:'1-й разряд',title:'старший продавец',sign:'ПРОДУКТЫ',l:50,s:11,torg:'Проверка Торга: всё во льду'},
 {name:'Гастроном',short:'Гастроном',title:'заведующая отделом',sign:'ГАСТРОНОМ',l:75,s:17,torg:'Проверка Торга: без Столика'},
 {name:'Лучший в районе',short:'Лучший в районе',title:'заведующая отделом',sign:'ГАСТРОНОМ',l:105,s:24,torg:'Проверка Торга: очередь из ревизоров'},
 {name:'Образцовый магазин',short:'Образцовый',title:'заместитель директора',sign:'ГАСТРОНОМ',l:135,s:32,torg:'Проверка Торга: всё во льду'},
 {name:'Магазин высшего разряда',short:'Высший разряд',title:'заместитель директора',sign:'ГАСТРОНОМ',l:170,s:41,torg:'Проверка Торга: без Столика'},
 {name:'Универсам',short:'Универсам',title:'директор',sign:'УНИВЕРСАМ',l:210,s:51,torg:'Проверка Торга: очередь из ревизоров'},
 {name:'Гастроном №1 города',short:'Гастроном №1',title:'директор',sign:'ГАСТРОНОМ №1',l:250,s:60,torg:'Большая проверка Торга: всё во льду'}];
function needOf(r){var x=RANKS[r],o=E('rank.need',null);if(Array.isArray(o)&&Array.isArray(o[r]))return {l:num(o[r][0]),s:num(o[r][1])};return {l:x.l,s:x.s};}
var STAR_EVERY=8; // «Знамя ★N» после №1 — каждые 8 печатей
function starEvery(){return num(E('rank.starEvery',0))||STAR_EVERY;}

/* ---------- 10 отделов ---------- */
// r — разряд, с которого отдел можно открыть (0-based: 1 = «3-го разряда»), p — цена ур.1 (ур.2 ×2,5, ур.3 ×4 — GBECO.dep главнее)
var DEPS=[
 {id:'bakaleya',n:'Бакалея',ic:'🥫',r:1,p:150,g:['крупа и сахар на полках','полки до потолка','«Смешать» даром раз в день']},
 {id:'hleb',n:'Хлебный',ic:'🍞',r:2,p:200,g:['утренний завоз: первый уровень дня +30 %','утренний завоз +40 %','утренний завоз +50 %']},
 {id:'steklo',n:'Приём стеклотары',ic:'🍾',r:2,p:250,g:['копит 2 💰 в час (до 12 ч)','копит 3 💰 в час','копит 4 💰 в час']},
 {id:'moloko',n:'Молочный',ic:'🥛',r:3,p:300,g:['бидоны и треугольные пакеты','«Столик» даром раз в 2 дня','«Столик» даром каждый день']},
 {id:'gastro',n:'Гастрономия',ic:'🧀',r:4,p:400,g:['дефицит дня: +20 💰','дефицит дня: +35 💰','дефицит дня: +50 💰']},
 {id:'konditer',n:'Кондитерский',ic:'🎂',r:5,p:450,g:['праздничные карточки в альбом','торт к празднику: +15 💰 к авоське','торт к празднику: +30 💰 к авоське']},
 {id:'ovoshi',n:'Овощной',ic:'🥕',r:6,p:500,g:['осенний завоз: новые игры Подсобки','игры Подсобки: +5 💰','игры Подсобки: +10 💰']},
 {id:'soki',n:'Соки-воды',ic:'🧃',r:7,p:600,g:['автомат газировки: 10 💰 в день','газировка: 15 💰 в день','газировка: 20 💰 в день']},
 {id:'ryba',n:'Рыбный',ic:'🐟',r:8,p:650,g:['«Рыбный четверг»','рыбный четверг: +25 %','рыбный четверг: +50 %']},
 {id:'zakaz',n:'Стол заказов',ic:'📦',r:9,p:800,g:['заказы соседей: +10 💰','заказы: +20 💰','заказы: +30 💰 и праздничные наборы']}];
var DEPI={};DEPS.forEach(function(d,i){DEPI[d.id]=i;});
function branchK(){return num(E('dep.branchK',0))||1.5;}
function depPrice(id,lv){ // цена улучшения до уровня lv (1…3) в текущем магазине (филиал — дороже)
  var d=DEPS[DEPI[id]];if(!d||lv<1||lv>3)return 0;var t=E('dep.'+id,null),p;
  if(Array.isArray(t)&&num(t[lv-1]))p=num(t[lv-1]);else p=Math.round(d.p*[1,2.5,4][lv-1]);
  var f=num(S_()&&S_().mtF);if(f)p=Math.round(p*Math.pow(branchK(),f)/10)*10;return p;}

/* ---------- сохранение ---------- */
function fix(s){s=s||S_();if(!s)return;s.mtR=Math.min(9,Math.floor(num(s.mtR)));s.mtRs=Math.min(s.mtR,Math.floor(num(s.mtRs)));s.mtT=s.mtT?1:0;
  s.mtS=Math.floor(num(s.mtS));if(!Array.isArray(s.mtSw))s.mtSw=[];s.mtSw=s.mtSw.filter(function(x){return num(x)>2e7;}).slice(-14);
  if(s.mtSw.length>s.mtS)s.mtS=s.mtSw.length;
  if(!isO(s.mtD))s.mtD={};for(var k in s.mtD){if(DEPI[k]==null)delete s.mtD[k];else s.mtD[k]=Math.min(3,Math.floor(num(s.mtD[k])));}
  s.mtSt=Math.floor(num(s.mtSt));s.mtF=Math.floor(num(s.mtF));s.mtK=Math.floor(num(s.mtK));if(!isO(s.mtKd))s.mtKd={d:0,mg:0};s.mtKd.d=num(s.mtKd.d);s.mtKd.mg=num(s.mtKd.mg);}
function merge(s,d){fix(s);if(!d)return;
  s.mtR=Math.max(s.mtR,Math.min(9,Math.floor(num(d.mtR))));s.mtRs=Math.max(s.mtRs,Math.min(9,Math.floor(num(d.mtRs))));
  if(d.mtT&&s.mtR<=num(d.mtR))s.mtT=1;
  if(Array.isArray(d.mtSw))d.mtSw.forEach(function(x){x=num(x);if(x>2e7&&s.mtSw.indexOf(x)<0)s.mtSw.push(x);});s.mtSw.sort(function(a,b){return a-b;});s.mtSw=s.mtSw.slice(-14);
  s.mtS=Math.max(s.mtS,Math.floor(num(d.mtS)));
  // филиал — новый набор отделов: при разном числе филиалов берём отделы того устройства, где филиалов больше
  var df=Math.floor(num(d.mtF));if(df>s.mtF){s.mtF=df;s.mtD={};}
  if(isO(d.mtD)&&df>=s.mtF)for(var k in d.mtD)if(DEPI[k]!=null)s.mtD[k]=Math.max(num(s.mtD[k]),Math.min(3,Math.floor(num(d.mtD[k]))));
  s.mtK=Math.max(s.mtK,Math.floor(num(d.mtK)));s.mtSt=Math.max(num(s.mtSt),Math.floor(num(d.mtSt)));
  if(isO(d.mtKd)&&num(d.mtKd.d)===s.mtKd.d)s.mtKd.mg=Math.max(s.mtKd.mg,num(d.mtKd.mg));else if(isO(d.mtKd)&&num(d.mtKd.d)>s.mtKd.d)s.mtKd={d:num(d.mtKd.d),mg:num(d.mtKd.mg)};
  fix(s);}
GB.onSave({id:'meta',keys:['mtR','mtRs','mtT','mtS','mtSw','mtSt','mtD','mtF','mtK','mtKd'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});

/* ---------- разряд ---------- */
function rank(){var s=S_();if(!ON||!s)return 0;return Math.min(9,Math.floor(num(s.mtR)));}
function levels(){var s=S_();return s?Math.max(0,(+s.unlocked||1)-1):0;}
function seals(){var s=S_();return s?Math.floor(num(s.mtS)):0;}
function info(r){if(r==null)r=rank();r=Math.max(0,Math.min(9,Math.floor(+r||0)));var x=RANKS[r],n=needOf(r);
  return {r:r,name:vkN(R(tl('name',r)||x.name)),short:vkN(R(x.short)),title:R(tl('title',r)||x.title),sign:vkN(tl('sign',r)||x.sign),l:n.l,s:n.s,torg:R(x.torg)};}
// тексты TEXT (GBT.list('rank.*')[r]) главнее своих; в VK знак «№» нельзя (как NUMS()) — «номер один»
function tl(k,r){if(en())return '';try{if(window.GBT&&GBT.list){var a=GBT.list('rank.'+k);if(a&&a[r])return String(a[r]);}}catch(e){}return '';}
function vkN(t){t=String(t||'');try{if(PLAT!=='vk')return t;}catch(e){return t;}
  var up=/№\s?1(?![0-9])/.test(t)&&t===t.toUpperCase();return t.replace(/№\s?1(?![0-9])/g,up?'НОМЕР ОДИН':'номер один').replace(/№\s?/g,up?'НОМЕР ':'номер ');}
function next(){var r=rank();if(r>=9)return null;var n=needOf(r+1),lh=levels(),sh=seals();
  var fr=Math.min(1,(Math.min(lh,n.l)/Math.max(1,n.l)+Math.min(sh,n.s)/Math.max(1,n.s))/2);
  return {r:r+1,l:n.l,lHave:lh,s:n.s,sHave:sh,ready:lh>=n.l&&sh>=n.s,frac:fr};}
function torgReady(){var x=next();return !!(ON&&x&&x.ready);}
function star(){var s=S_();if(!s||rank()<9)return 0;var base=needOf(9).s;return Math.max(0,Math.floor((seals()-base)/starEvery()));}
// новый разряд: только по одному за раз (Проверка Торга на каждый)
function rankUp(why){var s=S_();if(!s||!torgReady())return false;s.mtR=rank()+1;s.mtT=0;fix(s);sv();try{cloudSoon();}catch(e){}
  stat('step',{r:s.mtR,d:dayOfPlayer(),w:String(why||'').slice(0,20),l:levels(),sl:seals()});
  GB.emit('rank',s.mtR);news.push({k:'rank',r:s.mtR});return true;}
function dayOfPlayer(){try{var s=S_();if(s&&s.soc&&s.soc.d0)return Math.max(0,Math.floor((nowMs()-s.soc.d0)/864e5));}catch(e){}return 0;}
// условия выполнены — Проверка «ждёт» (флаг для окна победы/главного), разряд — по победе Проверки
function checkReady(){var s=S_();if(!s)return;var r=torgReady()?1:0;if(r&&!s.mtT){s.mtT=1;sv();news.push({k:'torg'});GB.emit('torg',rank()+1);}else if(!r&&s.mtT){s.mtT=0;}}
var news=[]; // для окна победы: {k:'rank'|'torg'|'star'|'thanks'}
GB.levelHook.push(function(o){if(!ON||!o)return;checkReady();
  if(o.r!=='win'||o.daily)return;var isTorg=o.mode==='torg'||(!GBM.torg&&o.boss&&!o.mode);
  if(isTorg&&torgReady())rankUp(o.mode==='torg'?'torg':'rev');});
// печать от GBPL — проверить разряд и знамя
GB.on('seal',function(){if(!ON)return;checkReady();var s=S_(),n=star();
  if(s&&n>num(s.mtSt)){s.mtSt=n;sv();news.push({k:'star',n:n});stat('step',{r:10,st:n,sl:seals()});GB.emit('star',n);}});

/* ---------- отделы ---------- */
function dep(id){var s=S_();if(!ON||!s||!isO(s.mtD))return 0;return Math.min(3,Math.floor(num(s.mtD[id])));}
function depList(){var r=rank();return DEPS.map(function(d){var lv=dep(d.id);return {id:d.id,n:R(d.n),ic:d.ic,r:d.r,lv:lv,open:r>=d.r,
  price:lv<3?depPrice(d.id,lv+1):0,gives:lv>0?R(d.g[lv-1]):'',next:lv<3?R(d.g[lv]):''};});}
function depBuy(id){var s=S_(),d=DEPS[DEPI[id]];if(!ON||!s||!d)return false;var lv=dep(id);if(lv>=3||rank()<d.r)return false;var p=depPrice(id,lv+1);
  if((+s.coins||0)<p)return false;try{setCoins(s.coins-p);}catch(e){s.coins-=p;}s.mtD[id]=lv+1;sv();try{cloudSoon();}catch(e){}
  stat('dep',{id:id,lv:lv+1,p:p,f:num(s.mtF),r:rank()});GB.emit('dep',{id:id,lv:lv+1});return true;}
function depAll(){return DEPS.every(function(d){return dep(d.id)>=3;});}
function branch(){var s=S_();return s?Math.floor(num(s.mtF)):0;}
// филиал: после №1 и всех 30 улучшений — новый магазин в следующем городе (отделы с нуля, дороже ×1,5)
function openBranch(){var s=S_();if(!ON||!s||rank()<9||!depAll())return false;s.mtF=branch()+1;s.mtD={};sv();try{cloudSoon();}catch(e){}
  stat('dep',{id:'branch',lv:s.mtF});GB.emit('branch',s.mtF);return true;}

/* ---------- благодарности ---------- */
function thanks(src){var s=S_();if(!ON||!s)return false;fix(s);src=String(src||'');var t=dk();
  if(src==='mg'){if(s.mtKd.d!==t)s.mtKd={d:t,mg:0};if(s.mtKd.mg>=(num(E('book.mgDay',0))||2))return false;s.mtKd.mg++;}
  s.mtK++;sv();stat('book',{a:'thx',s:src.slice(0,12),n:s.mtK});news.push({k:'thanks',src:src});GB.emit('thanks',{src:src,n:s.mtK});return true;}
function thanksN(){var s=S_();return s?Math.floor(num(s.mtK)):0;}

/* ---------- вид: разряд на главном (zone rank; VIEW может заменить тем же id), «Касса» (zone seal), грамота ---------- */
function nextRev(){var s=S_(),i=Math.max(0,(+s.unlocked||1)-1);return i+(9-i%10)+1;} // номер ближайшей Ревизии (1-based)
function torgTxt(){if(GBM.torg&&GBM.torg.name){var n=GB.safe('torg-name',function(){return GBM.torg.name(rank()+1);});if(n)return R('Проверка Торга')+': '+n;}
  return R('Проверка Торга — на Ревизии, уровень')+' '+nextRev();}
function needTxt(x){var a=[];if(x.lHave<x.l)a.push(R('уровни')+' '+x.lHave+'/'+x.l);if(x.sHave<x.s)a.push(R('печати')+' '+x.sHave+'/'+x.s);return a.join(' · ');}
// «До 3-го разряда» — родительный падеж по-русски (POLISH, QA-RU Ф1); в en — как было: «До» + «короткое имя»
var RTO=['','До 3-го разряда','До 2-го разряда','До 1-го разряда','До «Гастронома»','До «Лучшего в районе»','До «Образцового»','До высшего разряда','До «Универсама»','До «Гастронома №1»'];
function toRank(r){return !en()&&RTO[r]?RTO[r]:R('До')+' «'+info(r).short+'»';}
function rankLine(){var r=rank(),inf=info(r),x=next();if(!inf.name)return null;
  if(!x){var st=star(),left=starEvery()-((seals()-needOf(9).s)%starEvery());return {t:inf.name,s:(st?'🚩 '+R('Знамя')+' ★'+st+' · ':'')+R('до следующей звезды печатей:')+' '+left,f:1-left/starEvery()};}
  var nx=info(x.r);return {t:inf.name+' · '+(r+1)+R(' из 10'),s:x.ready?torgTxt():toRank(x.r)+': '+needTxt(x),f:x.frac,ready:x.ready};}
GB.add(GB.homeSlots,{id:'mt-rank',order:10,zone:'rank',render:function(){if(!ON)return '';var L=rankLine();if(!L||!L.s)return '';
  return '<button type="button" class="mt-rank'+(L.ready?' hot':'')+'"><span class="mt-rk1">🏷 <b>'+esc(L.t)+'</b></span><i class="mt-pb"><b style="width:'+Math.round(100*L.f)+'%"></b></i>'+
    '<small>'+esc(L.s)+'</small></button>';},
  mount:function(el){var b=el.querySelector('.mt-rank');if(b)b.onclick=function(){try{SND.tap();}catch(e){}
    if(torgReady()&&GBM.torg&&GBM.torg.start){GB.safe('torg-start',function(){GBM.torg.start(rank()+1);});return;}openLadder();};cert();}});
// «Касса»: новый разряд / Торг едет / знамя
var WR=GB.add(GB.winSlots,{id:'mt-rank',order:10,zone:'seal',fit:0,render:function(){if(!ON)return '';var nn=news.splice(0),h='',th=0;
  nn.forEach(function(x){if(x.k==='thanks'){if(x.src!=='book')th++;return;} /* из Книги — свою строку пишет gb-book */
    if(x.k==='rank'){var i=info(x.r);if(i.name)h+='<div class="mt-wrank"><span class="mt-wri">🏆</span><span><b>'+esc(R('Новый разряд:'))+' «'+esc(i.name)+'»!</b><small>'+esc(R('Тётя Валя теперь'))+' — '+esc(i.title)+'</small></span></div>';}
    else if(x.k==='torg'&&R('Торг едет с проверкой!'))h+='<p class="mt-wl">📣 '+esc(R('Торг едет с проверкой!'))+' '+esc(torgTxt())+'</p>';
    else if(x.k==='star'&&R('Знамя'))h+='<p class="mt-wl">🚩 '+esc(R('Знамя'))+' ★'+x.n+'!</p>';
});
  // благодарности — одной строкой (после пересчёта их может прийти сразу много)
  if(th&&R('Благодарность в Книгу'))h+='<p class="mt-wl">📕 '+esc(th>1?R('Благодарности в Книгу жалоб и предложений:')+' +'+th:R('Благодарность в Книгу жалоб и предложений!'))+'</p>';return h;}});
// поверх уровня: это — Проверка Торга
GB.add(GB.levelSlots,{id:'mt-torg',order:5,zone:'top',render:function(c){if(!ON||!c||c.daily||!torgReady())return '';
  if(!(c.mode==='torg'||(!GBM.torg&&c.boss&&!c.mode)))return '';return R('Проверка Торга')?'<div class="mt-ltorg">📋 '+esc(R('Проверка Торга'))+' · '+esc(info(rank()+1).short)+'</div>':'';}});
// грамота: новый разряд — окно на главном (раз)
var certT=0;function cert(){clearTimeout(certT);certT=setTimeout(function(){var s=S_();try{if(modalOn)return;if(G&&!G.won)return;}catch(e){}
  if(!s||s.mtRs>=s.mtR||!R('Грамота'))return;if(window.GBMIG&&GBMIG.pending())return;if(window.GBPL&&GBPL.nbTurn&&!GBPL.nbTurn('cert'))return;s.mtRs=s.mtR;sv();var i=info(s.mtR),c=num(E('rank.coins.'+s.mtR,0));
  if(c)try{if(window.GBECO&&GBECO.give)GBECO.give('rank',c);else setCoins(S.coins+ern('rank',c));}catch(e){}
  try{STAT.screen('cert');}catch(e){}
  var fr='';try{fr=window.GBQP&&GBQP.look?String(GBQP.look().frame||''):'';}catch(e){} // сезон «Квартального плана» (LEAGUE) — золотая рамка
  modal('<div class="mt-cert'+(fr?' mt-gold':'')+'"'+(fr?' data-fr="'+esc(fr.slice(0,20))+'"':'')+'><div class="mt-cert-in"><small>'+esc(R('ГРАМОТА'))+'</small><h2>«'+esc(i.name)+'»</h2><div class="mt-sign">'+esc(i.sign)+'</div>'+
    '<p>'+esc(R('Торг постановил: магазину тёти Вали присвоить разряд'))+' «'+esc(i.name)+'». '+esc(R('Тётя Валя теперь'))+' — <b>'+esc(i.title)+'</b>.</p>'+
    (c?'<p class="coins-won">+'+c+' 💰</p>':'')+'<p class="mt-mut">'+esc(nextOpen(s.mtR))+'</p></div>'+
    '<div class="row"><button class="btn green" id="mtCertOk">'+esc(R('Служу торговле!'))+'</button></div></div>');try{SND.win();}catch(e){}
  var b=document.getElementById('mtCertOk');if(b)b.onclick=function(){hideModal();GB.refresh();};},700);}
function nextOpen(r){var L=DEPS.filter(function(d){return d.r===r;}).map(function(d){return d.ic+' '+R(d.n);});return L.length?R('Открылись отделы:')+' '+L.join(', '):'';}
GB.on('home',function(){cert();});
// лестница разрядов
function openLadder(){var r=rank(),x=next();try{STAT.screen('ladder');}catch(e){}
  modal('<h2>'+esc(R('Разряды магазина'))+'</h2><div class="mt-ladder">'+RANKS.map(function(k,i){var n=needOf(i);
    return '<div class="mt-lst'+(i<r?' done':i===r?' cur':'')+'"><b>'+(i+1)+'. '+esc(R(k.short))+'</b><small>'+(i?n.l+' '+R('ур.')+' · '+n.s+' '+R('печ.'):R('старт'))+'</small></div>';}).join('')+'</div>'+
    (x?'<p>'+esc(x.ready?torgTxt():R('Печать «План выполнен» — одна в день: 3 дела из 5 в «Плане на сегодня».'))+'</p>':'<p>'+esc(vkN(R('После №1 — филиалы и «Знамя ★N».')))+'</p>')+
    '<div class="row"><button class="btn" id="mtLadOk">'+esc(R('Понятно'))+'</button></div>');
  var b=document.getElementById('mtLadOk');if(b)b.onclick=function(){hideModal();};}

window.GBM={toRank:toRank,on:ON,RANKS:RANKS,DEPS:DEPS,rank:rank,info:info,next:next,levels:levels,seals:seals,star:star,torgReady:torgReady,torg:null,
  dep:dep,depList:depList,depBuy:depBuy,depPrice:depPrice,depAll:depAll,branch:branch,openBranch:openBranch,thanks:thanks,thanksN:thanksN,
  canRemont:function(){return !!(window.GBDEP&&GBDEP.canRemont&&GBDEP.canRemont());},look:function(id){return window.GBDEP&&GBDEP.look?GBDEP.look(id):dep(id);},
  rankUp:rankUp,checkReady:checkReady,news:news,openLadder:openLadder,cert:cert,nextRev:nextRev,R:R,E:E,dk:dk,dnum:dnum,esc:esc,pl:pl,num:num,isO:isO,stat:stat,fix:function(){fix();}};
})();
