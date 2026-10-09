/* «Карьера водителя» — 6 районов (Двор → Квартал → Микрорайон → Район → Город → Область) × 5 званий, очки водителя,
   путевые листы (1 в день — за 3 дела из 5 ленты «Сегодня», js/today.js), финалы районов (поток CAR буста «Наш двор», 10.10.2026).
   Журнал: hobby-analytics/release-i/vyezd-boost/logs/CAR.md; замысел — 04-meta-economy.md §2.1; модель — tools/econ_car.py (читает блок CFG ниже).
   Грузится ПОСЛЕ основного скрипта index.html (нужны S, save, modal, hideModal, toast, L, pl, coinsTxt, startLevel, levelName…; всё — в момент вызова).
   Наружу — только window.CAR. Поле сохранения — S.car = {v, op, l, ld, fw, hi, fin, od, old} (+ CAR.fix / CAR.merge из fixSave/mergeSave).
   Как растёт:
   - Очки водителя (ОВ) — за ПЕРВОЕ прохождение двора: first + star×★ (босс ×boss); перепрошёл на больше ★ — star за каждую новую ★;
     дела ленты: двор дня, задание, заказ жильца, затея (TD/ORD зовут CAR.add). Поражения очков не снимают.
   - Звание: 5 на район (30 всего). 2–5-е звание района — очками (CFG.need), 1-е звание следующего района — ФИНАЛОМ района.
   - Финал района d→d+1: пройден двор CFG.dist[d+1].y (босс), путевых листов ≥ CFG.dist[d+1].l, есть 5-е звание района.
     Тогда финальный двор (тот же босс-двор, с героем района: плитка «Финал района» или карта) — попыток сколько угодно.
     Прошёл босс-двор впервые, когда всё остальное уже есть, — это и есть финал (окно победы празднует сразу).
   - После «Области»: «Область ★N» — каждые CFG.star путевых листов, без конца.
   Данные регионов (если LVL дал VYREG) — только для подписи «где ты» (район карьеры региона); финальные дворы — CFG.dist[].y.
   Вставка в экран — только через гнёзда UX: homeSlots (плитка «Финал района», «Права водителя»), winSlots (очки карьеры), yardHook (итог двора). */
(function(){
'use strict';
var CFG=/*CFG*/{"short":["Двор","Квартал","Микрорайон","Район","Город","Область"],"dist":[{"y":0,"l":0},{"y":20,"l":3},{"y":60,"l":9},{"y":120,"l":20},{"y":200,"l":40},{"y":300,"l":60}],"need":[0,30,250,500,830,830,1050,1270,1580,1980,1980,2440,2760,3190,3760,3760,4640,5250,6080,7190,7190,8630,9100,9750,10610,10610,12970,14300,16110,18530],"pts":{"first":5,"star":3,"boss":2,"daily":20,"task":10,"order":15,"mg":10},"star":7,"finCoins":[0,150,200,250,300,500],"chest":{"c":30,"p":5,"sun":50},"task":{"c":10,"p":2,"all":10},"order":{"c":15,"p":2},"daily":{"p":3},"ordFrom":8,"ret":[[3,100,3],[7,200,6],[14,300,10]],"night":{"mul":2,"cap":40}}/*CFG*/;

/* ---------- районы, звания, герои финалов ---------- */
var DIST=[
 {id:'dvor',n:'Двор',en:'Yard',ic:'🏠',open:L2('«Сегодня во дворе», гараж Толика, Мой двор','“Today in the yard”, Tolik’s garage, My yard')},
 {id:'kv',n:'Квартал',en:'Block',ic:'🏘',open:L2('Лига соседей, второй двор','Neighbours’ league, a second yard'),fin:{id:'mihalych',t:'Субботник',te:'Clean-up day'}},
 {id:'mkr',n:'Микрорайон',en:'Estate',ic:'🏢',open:L2('Барахолка Толика, третий двор','Tolik’s flea market, a third yard'),fin:{id:'valerka',t:'Свадьба во дворе',te:'Wedding in the yard'}},
 {id:'rn',n:'Район',en:'District',ic:'🏙',open:L2('Кубок выходного дня, четвёртый двор','Weekend cup, a fourth yard'),fin:{id:'valya',t:'Рынок в воскресенье',te:'Sunday market'}},
 {id:'gor',n:'Город',en:'City',ic:'🌆',open:L2('«Час пик» и «Гололёд», пятый двор','“Rush hour” and “Black ice”, a fifth yard'),fin:{id:'tolik',t:'Час пик у вокзала',te:'Rush hour at the station'}},
 {id:'obl',n:'Область',en:'Region',ic:'🛣',open:L2('Шестой двор, «Область ★N» без конца','A sixth yard, “Region ★N” forever'),fin:{id:'sansan',t:'Трасса на дачу',te:'Road to the dacha'}}];
var NAMES=[
 ['Новичок двора','Yard rookie'],['Сосед с правами','Neighbour with a licence'],['Водитель со двора','Yard driver'],['Шофёр подъезда','Stairwell chauffeur'],['Гроза парковки','Terror of the car park'],
 ['Шофёр квартала','Block driver'],['Водитель-любитель','Hobby driver'],['Знаток дворов','Yard expert'],['Мастер разъезда','Master of the squeeze'],['Хозяин квартала','Boss of the block'],
 ['Шофёр микрорайона','Estate driver'],['Водитель третьего класса','Driver, 3rd class'],['Ас парковки','Parking ace'],['Таксист со стажем','Veteran cabbie'],['Гордость микрорайона','Pride of the estate'],
 ['Водитель района','District driver'],['Водитель второго класса','Driver, 2nd class'],['Диспетчер двора','Yard dispatcher'],['Начальник колонны','Convoy chief'],['Легенда района','District legend'],
 ['Городской водитель','City driver'],['Водитель первого класса','Driver, 1st class'],['Король разъезда','King of the squeeze'],['Почётный шофёр','Honoured chauffeur'],['Гроза пробок','Terror of traffic jams'],
 ['Водитель области','Regional driver'],['Дальнобойщик','Long-hauler'],['Мастер трассы','Master of the road'],['Ветеран автобазы','Depot veteran'],['Шофёр всей области','Driver of the whole region']];
// герои финалов: только общие персонажи (реестр ~/Brain/hobby/characters.md). Облик — ART (VYPPL.svg), потом UX (UI.who), запасной — значок
var CH={
 mihalych:{n:'Михалыч',en:'Mikhalych',ic:'🧹',who:L2('дворник','the caretaker'),
   hi:[['Субботник у нас! Все машины — со двора, мести буду. Справишься до обеда?','Clean-up day! Every car out of the yard — I’m sweeping. Done by lunch?']],
   win:[['Вот это я понимаю — порядок! Квартал теперь твой, водитель.','Now that’s order! The block is yours, driver.']],
   lose:[['Эх, опять всё заставили… Завтра субботник повторим.','Blocked again… We’ll redo the clean-up tomorrow.']]},
 valerka:{n:'Валерка',en:'Valerka',ic:'🎒',who:L2('школьник, мечтает о правах','a schoolboy dreaming of a licence'),
   hi:[['Свадьба во дворе! Надо выпустить Волгу с лентами, а тут всё забито. Поможешь?','A wedding in the yard! The Volga with ribbons has to get out, and it’s all jammed. Help?']],
   win:[['Ура! Жених успел! Ты лучший водитель микрорайона, честно!','Hooray! The groom made it! Best driver on the estate, honest!']],
   lose:[['Ой… Невеста ждёт. Давай завтра ещё раз?','Oops… The bride is waiting. Try again tomorrow?']]},
 valya:{n:'Тётя Валя',en:'Aunt Valya',ic:'🛒',who:L2('из гастронома','from the grocery'),
   hi:[['Воскресенье, рынок! ПАЗики, Газели, всё вперемешку. Разведёшь — с меня пирожок.','Sunday market! Buses and vans all mixed up. Sort it out and there’s a pie for you.']],
   win:[['Ну надо же! Весь район про тебя говорит. Держи пирожок!','Well I never! The whole district is talking about you. Here’s your pie!']],
   lose:[['Не серчай, рынок — дело такое. Завтра свежий завоз.','Don’t be cross, markets are like that. Fresh delivery tomorrow.']]},
 tolik:{n:'Толик',en:'Tolik',ic:'🔧',who:L2('«Карбюратор», гаражный мастер','“Carburettor”, the garage man'),
   hi:[['Час пик у вокзала, браток. Тут не на глазок — как карбюратор перебрать: по порядку.','Rush hour at the station, mate. Like stripping a carburettor — one part at a time.']],
   win:[['Как по маслу! Город твой. Заезжай в гараж — чаю налью.','Smooth as oil! The city is yours. Drop by the garage for tea.']],
   lose:[['Заглох, бывает. Завтра заведём.','Stalled — happens. We’ll start her up tomorrow.']]},
 sansan:{n:'Сан Саныч',en:'San Sanych',ic:'🧢',who:L2('из соседнего района, чемпион города','from the next district, city champion'),
   hi:[['Здоро́во, сосед! Трасса на дачу — дорога длинная. Посмотрим, каков ты за городом.','Hi, neighbour! The road to the dacha is a long one. Let’s see you out of town.']],
   win:[['Признаю — вся область твоя. Приезжай на дачу, огурцы дам.','I admit it — the whole region is yours. Come to the dacha, I’ll give you cucumbers.']],
   lose:[['Не обижайся, сосед. Трасса — она такая. Завтра реванш?','No hard feelings, neighbour. Rematch tomorrow?']]}};
function L2(ru,en){return [ru,en];}
function T(x){if(Array.isArray(x))return tr(x[0],x[1]);return x;}
function tr(ru,en){try{return L(ru,en);}catch(e){return ru;}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function face(id,mood){var m=mood==='sad'?'sad':mood==='happy'?'happy':'norm';try{if(window.VYPPL&&VYPPL.svg){var v=VYPPL.svg(id,m);if(v)return v;}}catch(e){}
  try{if(window.UI&&UI.who&&(id!=='valya'&&id!=='sansan'||window.VYPPL))return UI.who(id,m);}catch(e){}
  if(id==='shura')try{return shuraSvg(mood==='sad'?'sad':'ok');}catch(e){}
  return '<span class="car-fc">'+(CH[id]?CH[id].ic:'🙂')+'</span>';}
function cname(id){var c=CH[id];return c?tr(c.n,c.en):id;}
function dname(d){return tr(DIST[d].n,DIST[d].en);}

/* ---------- сохранение ---------- */
function dk(){try{return dayKey(0);}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function num(x){return typeof x==='number'&&isFinite(x)&&x>=0?x:0;}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function passed(){try{return Math.max(0,(S.unlocked||1)-1);}catch(e){return 0;}}
// перенос старого игрока: очки — за уже пройденные дворы (по звёздам), листы — дни заданий дня (не больше 1 в день); финалы районов — нет (их играют)
function oldPts(){var op=0;try{for(var i in S.stars){var st=num(S.stars[i]);if(st>0)op+=ptsYard(+i,st);}}catch(e){}return Math.round(op);}
function migrate(){var op=oldPts(),days=0;
  try{for(var k in S.daily)if(num(S.daily[k])>0)days++;}catch(e){}
  S.car={v:1,op:Math.round(op),l:Math.min(days,CFG.dist[2].l-1),ld:0,fw:0,hi:0,fin:0,old:1};
  S.car.hi=rankOf(S.car).i;}
function fix(){if(!isO(S.car)){migrate();return;}var c=S.car;c.v=1;c.op=num(c.op);c.l=Math.floor(num(c.l));c.ld=num(c.ld);c.fw=Math.min(5,Math.floor(num(c.fw)));
  c.hi=Math.min(29,Math.floor(num(c.hi)));c.fin=num(c.fin);}
// облако: всё — максимум (очки, листы, финалы)
function merge(d){try{if(d&&isO(d.stars))for(var k in d.stars)seen[k]=Math.max(num(seen[k]),num(d.stars[k]));}catch(e){}
  if(!d)return;fix();if(S.car.old)S.car.op=Math.max(S.car.op,oldPts()); // старое сохранение пришло из облака на новое устройство
  if(!isO(d.car))return;var a=S.car,b=d.car;
  a.op=Math.max(a.op,num(b.op));a.l=Math.max(a.l,Math.floor(num(b.l)));a.ld=Math.max(a.ld,num(b.ld));a.fw=Math.max(a.fw,Math.min(5,Math.floor(num(b.fw))));
  a.hi=Math.max(a.hi,Math.min(29,Math.floor(num(b.hi))));}
function st(){if(!isO(S.car))fix();return S.car;}

/* ---------- звание ---------- */
function ptsYard(idx,stars){var p=CFG.pts,b=(idx%10===9)?p.boss:1;return (p.first+p.star*stars)*b;}
function rankOf(c){var r=0;for(var i=1;i<30;i++){if(i%5===0)continue;if(c.op>=CFG.need[i])r=i;}
  r=Math.min(r,c.fw*5+4);if(c.fw>=1)r=Math.max(r,c.fw*5);return{i:r};}
function rank(){var c=st(),i=rankOf(c).i,d=Math.floor(i/5),stars=0;
  if(c.fw>=5)stars=Math.floor(Math.max(0,c.l-CFG.dist[5].l)/CFG.star);
  var nx=i<29?i+1:-1,fin=nx>=0&&nx%5===0;
  var lo=CFG.need[i],hi=nx>=0&&!fin?CFG.need[nx]:lo,frac=fin||nx<0?1:Math.max(0,Math.min(1,(c.op-lo)/Math.max(1,hi-lo)));
  return{i:i,d:d,dist:DIST[d],name:tr(NAMES[i][0],NAMES[i][1])+(stars?' ★'+stars:''),stars:stars,op:Math.round(c.op),lists:c.l,
    next:nx>=0?{i:nx,name:tr(NAMES[nx][0],NAMES[nx][1]),need:CFG.need[nx],left:fin?0:Math.max(0,Math.ceil(CFG.need[nx]-c.op)),fin:fin}:null,frac:frac};}
// финал следующего района: что есть и чего не хватает
function finState(){var c=st();if(c.fw>=5)return null;var d=c.fw+1,need=CFG.dist[d],h=DIST[d].fin,r=rank();
  var yOk=passed()>=need.y,lOk=c.l>=need.l,rOk=r.i>=c.fw*5+4;
  return{d:d,idx:need.y-1,hero:h.id,title:tr(h.t,h.te),yOk:yOk,yLeft:Math.max(0,need.y-passed()),lOk:lOk,lists:c.l,lNeed:need.l,rOk:rOk,
    ready:yOk&&lOk&&rOk};}

/* ---------- очки и новости ---------- */
var news=[];     // новости для окна победы / тоста: {k, t}
var gain=0;      // очки за последний двор (окно победы)
function add(pts,why){if(!(pts>0))return 0;var c=st(),r0=rank().i;c.op+=pts;var t=dk();if(!isO(c.od)||c.od.d!==t)c.od={d:t,n:0};c.od.n+=pts;var r1=rank();
  if(r1.i>r0){c.hi=Math.max(c.hi,r1.i);news.push({k:'rank',t:'🎖 '+tr('Новое звание: ','New rank: ')+r1.name+'!'});try{STAT.ev('rank',{r:r1.i,d:r1.d,op:Math.round(c.op)});}catch(e){}}
  var f=finState();if(f&&f.ready&&!c.fin){c.fin=1;news.push({k:'fin',t:'🏆 '+tr('Открыт финал района: ','District final unlocked: ')+cname(f.hero)+' — «'+f.title+'»'});}
  return pts;}
// путевой лист — 1 в день (TD зовёт, когда сделано 3 дела из 5)
function list(){var c=st(),t=dk();if(c.ld===t)return false;c.ld=t;c.l++;var r=rank();
  try{STAT.ev('list',{n:c.l,d:c.fw});}catch(e){}
  if(c.fw>=5&&c.l>CFG.dist[5].l&&(c.l-CFG.dist[5].l)%CFG.star===0)news.push({k:'star',t:'⭐ '+tr('Шофёр всей области ★','Driver of the whole region ★')+r.stars+'!'});
  var f=finState();if(f&&f.ready&&!c.fin){c.fin=1;news.push({k:'fin',t:'🏆 '+tr('Открыт финал района: ','District final unlocked: ')+cname(f.hero)});}
  try{save();}catch(e){}return true;}

/* ---------- итог двора (yardHook UX: {lv, ok, stars, moves, sec, hint, undo, mode, region, fails}) ---------- */
var finRun=null; // идёт финал: {d, idx}
var last=null;   // последний двор: {idx, first} — для TD/ORD (впервые ли пройден)
var seen={};     // звёзды дворов, какие CAR уже видел (очки — только за новые ★; гнездо зовут уже после записи S.stars)
function snap(){seen={};try{for(var k in S.stars)seen[k]=num(S.stars[k]);}catch(e){}}
function isDaily(o){return !!o.daily||o.mode==='daily'||o.mode==='day';}
var NORM=/^(n|norm|yard|fin)?$/; // обычный двор (UX: mode 'n'); остальное — режимы LVL
function onYard(o){try{if(!o)return;st();gain=0;
  if(isDaily(o)||!NORM.test(o.mode||''))return; // двор дня, режимы LVL, мини-игры — очки даёт лента (TD)
  var idx=o.idx!=null?+o.idx:(+o.lv||1)-1,was=num(seen[idx]),f=finState();
  if(o.ok&&o.first===true)was=0;
  if(o.ok){var s=Math.max(1,Math.min(3,+o.stars||1)),b=(idx%10===9)?CFG.pts.boss:1;
    last={idx:idx,first:!was};
    if(!was)gain=ptsYard(idx,s);else if(s>was)gain=CFG.pts.star*(s-was)*b;
    seen[idx]=Math.max(was,s);if(gain)add(gain,'yard');}
  // финал района: идёт финал этого двора — или финальный двор пройден впервые, когда листы и звание уже есть
  // финал района = финальный (босс-)двор района, пройденный, когда листы и звание уже есть (из плитки «Финал района» или с карты — всё равно)
  if(f&&idx===f.idx){
    if(o.ok){var f2=finState();if(f2&&f2.ready){finRun=null;finWin(f2);}}
    else if(finRun&&finRun.idx===idx&&!finRun.l){finRun.l=1;finLose(f);}}
  else if(finRun&&finRun.idx!==idx)finRun=null;
  try{save();}catch(e){}
}catch(e){try{console.warn('CAR yard',e);}catch(_){}}}
function finWin(f){var c=st();c.fw=f.d;c.fin=0;var coins=CFG.finCoins[f.d]||0;
  try{S.coins+=coins;ern('fin',coins);updCoins();}catch(e){}
  c.hi=Math.max(c.hi,rank().i);
  news.push({k:'dist',t:'🏆 '+tr('Ты теперь водитель района «','You are now a driver of the “')+dname(f.d)+tr('»! +',' ” district! +')+coinsTxt2(coins)});
  finJust={d:f.d,hero:f.hero,coins:coins};
  try{STAT.ev('dist',{d:f.d,l:c.l,y:passed()});}catch(e){}
  try{if(window.YARD&&YARD.onDist)YARD.onDist(f.d);}catch(e){} // YARD: новый «Мой двор» района, 4 машины в альбом
  try{save();}catch(e){}}
var finJust=null;
function finLose(f){news.push({k:'finl',t:'🏁 '+cname(f.hero)+': «'+T(CH[f.hero].lose[0])+'»'});}
function coinsTxt2(n){try{return coinsTxt(n);}catch(e){return n+' 💰';}}

/* ---------- финал: окно героя перед стартом ---------- */
function openFinal(){var f=finState();if(!f||!f.ready)return openCareer();var h=CH[f.hero];
  try{STAT.screen('final');}catch(e){}
  modal('<div class="car-hero">'+face(f.hero)+'</div><h2>🏆 '+tr('Финал района','District final')+': «'+esc(f.title)+'»</h2>'+
    '<p class="car-q"><b>'+esc(cname(f.hero))+'</b> · '+esc(T(h.who))+'<br>«'+esc(T(h.hi[0]))+'»</p>'+
    '<p class="goal">'+tr('Пройди двор ','Clear yard ')+(f.idx+1)+tr(' — и ты водитель района «',' — and you are a driver of the “')+esc(dname(f.d))+tr('»: +',' ” district: +')+coinsTxt2(CFG.finCoins[f.d])+'</p>'+
    '<div class="row"><button class="btn green" id="carGo">▶ '+tr('Начать финал','Start the final')+'</button><button class="btn" id="mCancel">'+tr('Потом','Later')+'</button></div>');
  $('mCancel').onclick=function(){hideModal();};
  $('carGo').onclick=function(){var f2=finState();if(!f2||!f2.ready)return hideModal();finRun={d:f2.d,idx:f2.idx};
    try{STAT.ev('fin',{d:f2.d});}catch(e){}hideModal();startLevel(f2.idx);};}

/* ---------- экран «Права водителя» (лестница карьеры) ---------- */
function openCareer(){try{STAT.screen('career');}catch(e){}var r=rank(),c=st(),f=finState(),h='';
  for(var d=0;d<6;d++){var cur=d===r.d,done=d<c.fw||(d===c.fw&&false),open=d<=c.fw;
    h+='<div class="car-d'+(cur?' cur':'')+(d<c.fw?' done':'')+(open?'':' lock')+'"><span class="car-di">'+DIST[d].ic+'</span><span class="car-dn"><b>'+esc(dname(d))+'</b><small>'+
      (d===0?tr('начало пути','the start'):(d<=c.fw?'✓ '+tr('финал пройден','final won'):tr('двор ','yard ')+CFG.dist[d].y+' · 📄 '+CFG.dist[d].l+' · '+esc(cname(DIST[d].fin.id))))+
      '</small>'+(DIST[d].fin?'<small class="car-op">🏆 '+tr('финал «','final “')+esc(tr(DIST[d].fin.t,DIST[d].fin.te))+tr('» · +','” · +')+coinsTxt2(CFG.finCoins[d])+'</small>':'')+'</span>'+(cur?'<em>'+tr('ты здесь','you are here')+'</em>':'')+'</div>';}
  var nx=r.next,line='';
  if(nx&&!nx.fin)line=tr('До звания «','To the rank “')+esc(nx.name)+tr('» — ещё ','” — ')+nx.left+tr(' очков',' more points');
  else if(f)line=f.ready?tr('Финал района открыт!','The district final is open!'):tr('Финал района «','District final “')+esc(f.title)+'»: '+finNeed(f);
  modal('<h2>🪪 '+tr('Права водителя','Driver’s licence')+'</h2>'+
    '<div class="car-lic"><span class="car-lr">'+r.dist.ic+'</span><span><b>'+esc(r.name)+'</b><small>'+tr('Район: ','District: ')+esc(dname(r.d))+' · '+tr('очков ','points ')+r.op+' · 📄 '+r.lists+'</small>'+
      '<span class="bar"><i style="width:'+Math.round(r.frac*100)+'%"></i></span></span></div>'+
    (line?'<p class="goal">'+line+'</p>':'')+'<div class="car-ds">'+h+'</div>'+
    '<p class="goal car-how">📄 '+tr('Путевой лист — один в день: сделай 3 дела из 5 в ленте «Сегодня во дворе».','A trip sheet a day: do 3 of the 5 jobs in “Today in the yard”.')+'</p>'+
    '<div class="row">'+(f&&f.ready?'<button class="btn green" id="carFin">🏆 '+tr('Финал района','District final')+'</button>':'')+'<button class="btn" id="mCancel">'+tr('Закрыть','Close')+'</button></div>');
  if($('carFin'))$('carFin').onclick=openFinal;$('mCancel').onclick=hideModal;}
function finNeed(f){var a=[];if(!f.yOk)a.push(tr('пройди двор ','clear yard ')+(f.idx+1));if(!f.lOk)a.push('📄 '+f.lists+'/'+f.lNeed);if(!f.rOk)a.push(tr('звание «','rank “')+esc(tr(NAMES[st().fw*5+4][0],NAMES[st().fw*5+4][1]))+tr('»','”'));return a.join(' · ');}

/* ---------- окно победы (winSlots): +очки, звание, финал ---------- */
function winHtml(ctx){var h='',r=rank(),nx=r.next;
  if(finJust){var fj=finJust;finJust=null;
    h+='<div class="car-win fin"><span class="car-hero sm">'+face(fj.hero,'ok')+'</span><p><b>🏆 '+tr('Финал выигран! Ты — водитель района «','Final won! You drive the “')+esc(dname(fj.d))+tr('» · +','” district · +')+coinsTxt2(fj.coins)+'</b><br>«'+esc(T(CH[fj.hero].win[0]))+'»</p></div>';}
  if(gain>0){h+='<p class="goal car-pts">🪪 +'+gain+' '+tr('очков карьеры','career points')+(nx&&!nx.fin?' · '+tr('до «','to “')+esc(nx.name)+tr('» ещё ','” ')+nx.left:'')+'</p>';}
  gain=0;
  var nn=news.splice(0);for(var i=0;i<nn.length;i++)if(nn[i].k!=='dist')h+='<p class="goal gift car-news">'+esc(nn[i].t)+'</p>';
  return h||null;}

/* ---------- плитки главного (homeSlots) ---------- */
function look(){var r=rank(),f=finState();
  return{ic:r.dist.ic,name:r.name,dist:dname(r.d),lists:r.lists,op:r.op,frac:r.frac,fin:!!(f&&f.ready),
    s:f&&f.ready?tr('Финал района ждёт!','The district final awaits!'):r.next&&!r.next.fin?tr('до «','to “')+r.next.name+tr('» ',' ” ')+r.next.left:f?finNeed(f):'',go:function(){if(f&&f.ready)openFinal();else openCareer();}};}
function tile(o){try{return UI.tile(o);}catch(e){return '<button class="hsT '+(o.cls||'')+'"><span class="hsI">'+esc(o.ic)+'</span><span class="hsB"><b>'+esc(o.t)+'</b><small>'+esc(o.s||'')+'</small></span>'+(o.tag?'<em class="hsTag">'+esc(o.tag)+'</em>':'')+'</button>';}}
function first(el,fn){var b=el.querySelector('button')||el.firstChild;if(b)b.onclick=function(){try{SND.tap&&SND.tap();}catch(e){}fn();};}

/* ---------- регистрация в гнёздах UX (договор — шапка js/ui-core.js) ---------- */
['homeSlots','winSlots','yardHook','saveHook'].forEach(function(n){if(!Array.isArray(window[n]))window[n]=[];});
try{if(window.UI&&UI.onSave)UI.onSave({id:'car',keys:['car'],fix:function(){fix();},merge:function(S0,d){merge(d);}});}catch(e){}
homeSlots.push({id:'car-fin',order:0,zone:'feed',render:function(){if(passed()<1)return null;var f=finState();if(!f||!f.ready)return null;
  return tile({ic:'🏆',t:tr('Финал района','District final'),s:cname(f.hero)+' · «'+f.title+'»',tag:tr('ждёт','ready'),cls:'hot car-tfin'});},mount:function(el){first(el,openFinal);}});
// права водителя — полоса под шапкой главного (UX: zone 'top', тот же id 'prava' — заменяет заглушку)
homeSlots.push({id:'prava',order:10,zone:'top',render:function(){var r=rank(),f=finState(),nx=r.next,line;
  if(f&&f.ready)line='🏆 '+tr('Финал района ждёт: ','District final: ')+cname(f.hero);
  else if(nx&&!nx.fin)line=tr('до «','to “')+nx.name+tr('» — ещё ','” — ')+nx.left+tr(' очк.',' pts');
  else if(f)line=tr('финал «','final “')+f.title+tr('»: ','”: ')+finNeed(f).replace(/<[^>]*>/g,'');
  else line=tr('путевых листов ','trip sheets ')+r.lists;
  return '<div class="hPrava car-prava'+(f&&f.ready?' hot':'')+'"><span class="hpPh car-ph">'+r.dist.ic+'</span><span class="hpB"><small>'+tr('ВОДИТЕЛЬСКОЕ УДОСТОВЕРЕНИЕ','DRIVER’S LICENCE')+' · '+esc(dname(r.d).toUpperCase())+'</small><b>'+esc(r.name)+'</b>'+
    '<i class="hsP"><b style="width:'+Math.round(100*r.frac)+'%"></b></i><em>'+esc(line)+'</em></span><span class="hpSt">'+tr('листов','sheets')+'<b>📄'+r.lists+'</b></span></div>';},
  mount:function(el){var b=el.querySelector('.hPrava')||el;b.onclick=function(){try{SND.tap&&SND.tap();}catch(e){}if(finState()&&finState().ready)openFinal();else openCareer();};}});
winSlots.push({id:'car-pts',order:8,zone:'goal',fit:0,render:function(ctx){return winHtml(ctx);}});
yardHook.push({id:'car',order:1,fn:onYard});


window.CAR={CFG:CFG,DIST:DIST,NAMES:NAMES,CH:CH,fix:fix,merge:merge,rank:rank,finState:finState,add:add,list:list,onYard:onYard,
  openCareer:openCareer,openFinal:openFinal,look:look,face:face,cname:cname,dname:dname,winHtml:winHtml,news:news,ptsYard:ptsYard,
  finRun:function(){return finRun;},last:function(){return last;},
  prg:function(){var r=rank();return {rk:r.i,ds:r.d};}}; /* vy-merge: для STAT prg (просьба TECH) */
try{fix();snap();}catch(e){}
})();
