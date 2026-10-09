/* Дворовая викторина — АЛЬБОМ МАРОК и филателист дядя Коля (поток YARD, 09.10.2026). Журнал: viktorina-boost/logs/YARD.md, 04-meta-economy.md §2.8.
   Коллекция БЕЗ лутбоксов: у каждой марки заранее известно, как её получить (это написано прямо на пустом месте в альбоме).
   Серии: по 8 марок на каждую тему (верные ответы ценой 300+ в теме: 5/15/30/50/80/120, медаль темы — 50 верных, ⭐ — лестница 10 из 10),
   «Лига двора» (8), «Кубок выходного дня» (8), праздники «Страшилки у подъезда» (4) и «Новогодний двор» (4), сезонные (12 на сезон — js/season.js).
   Недостающую — у филателиста дяди Коли в киоске «Союзпечать» (постройка двора): 3 марки на витрине (4 — с киоском 3-го ур.), обновление раз в день, 100–300 💰.
   Сундук дня (CAR) зовёт YARD.stampPick(cb) — марка на выбор из 3. Собрана серия темы → приписка «Знаток …» и +1 💰 за каждый верный в лестнице этой темы.
   Сохранение: S.stp {серия: битовая маска 8 марок}, S.stpN {тема: верных ценой 300+}, S.stpH {праздник: [дни]} — слияние: ИЛИ / максимум. Рисунки марок — свои (SVG). */
(function(){
'use strict';
var YD=window.YD;if(!YD)return;
var esc=YD.esc,svg=YD.svg;
// названия марок тем (свои подписи; для новых тем — «Марка №k»)
var NM={
 ussr:['Радиола','Авоська','Сифон','Гранёный стакан','Пионерский значок','Телевизор «Рубин»','Трёхлитровая банка','Кеды «Два мяча»'],
 kino:['Кинопроектор','Хлопушка','Мультфильм','Кинобилет','Афиша','Кинолента','Звезда экрана','Золотой приз'],
 geo:['Байкал','Эльбрус','Волга','Камчатка','Карелия','Алтай','Урал','Сахалин'],
 world:['Глобус','Пирамида','Башня','Мост','Пальма','Маяк','Вулкан','Кругосветка'],
 nature:['Берёза','Лось','Подснежник','Снегирь','Ёж','Сосна','Рысь','Ландыш'],
 kitchen:['Пельмени','Блины','Самовар','Борщ','Оливье','Кулебяка','Квас','Пряник'],
 lang:['Букварь','Пословица','Перо','Азбука','Загадка','Словарь','Скороговорка','Чернильница'],
 history:['Кремль','Летопись','Ладья','Шлем','Грамота','Монета','Крепость','Орден'],
 sport:['Мяч','Шайба','Коньки','Шахматы','Лыжи','Ракетка','Медаль','Кубок'],
 tech:['«Москвич»','Трамвай','Паровоз','Радиоприёмник','Трактор','Самолёт','Мотороллер','Теплоход'],
 space:['Спутник','Восток','Луноход','Ракета','Орбита','Станция','Скафандр','Звезда'],
 dacha:['Морковка','Лейка','Яблоня','Тыква','Огурец','Клубника','Теплица','Грабли'],
 lit:['Сказка','Пушкин','Книжная полка','Закладка','Колобок','Жар-птица','Лукоморье','Библиотека'],
 art:['Скрипка','Гармонь','Балалайка','Пластинка','Палитра','Балет','Оркестр','Мольберт'],
 sci:['Микроскоп','Атом','Колба','Магнит','Лупа','Скелет','Таблица','Телескоп']};
var PAL=[['#3f8fe0','#d8ecff'],['#e5484d','#ffe0e1'],['#2fa84f','#dcf5e2'],['#ff7a1a','#ffe9d6'],['#7b4fb8','#ece2fa'],['#00a3a3','#d6f5f5'],['#c9765a','#f8e4da'],['#e0a800','#fff3c4']];
var TH=[5,15,30,50,80,120]; // верных ценой 300+ в теме → марки 1–6
var MINP=300;

/* ---------- серии ---------- */
var SER=[];YD.SER=SER;
function topics(){var a=[];try{(typeof TOPICS!=='undefined'?TOPICS:[]).forEach(function(t){if(t&&t.k&&t.k!=='all')a.push({k:t.k,ic:t.ic,n:t.n});});}catch(e){}return a;}
function initSeries(){SER.length=0;
  topics().forEach(function(t){var nm=NM[t.k]||[1,2,3,4,5,6,7,8].map(function(i){return 'Марка №'+i;});
    SER.push({k:t.k,n:t.n,ic:t.ic,top:1,cnt:8,names:nm,how:function(i){return i<6?TH[i]+' верных ответов ценой '+MINP+'+ в теме «'+t.n+'»':i===6?'Медаль темы: 50 верных в «'+t.n+'»':'⭐ Лестница 10 из 10 в теме «'+t.n+'»';},
      prog:function(i){var n=YD.num((S.stpN||{})[t.k]);return i<6?[Math.min(n,TH[i]),TH[i]]:i===6?[Math.min(YD.num((S.tc||{})[t.k]),50),50]:[YD.num((S.tp||{})[t.k])>0?1:0,1];},
      sell:function(i){return 100+Math.min(200,i*25+(i>=6?50:0));}});});
  SER.push({k:'lg',n:'Лига двора',ic:'🥇',cnt:8,names:['Первая неделя','Тройка бронзы','В серебро!','Тройка серебра','В золото!','Тройка золота','Чемпион двора','Трижды чемпион'],
    how:function(i){return ['Сыграть первую неделю Лиги двора','1–3 место в Бронзовой лиге','Подняться в Серебряную лигу','1–3 место в Серебряной лиге','Подняться в Золотую лигу','1–3 место в Золотой лиге','1 место в Золотой лиге','Три раза 1 место в Золотой лиге'][i];},sell:function(i){return i<2?200:i<5?250:300;}});
  SER.push({k:'cup',n:'Кубок выходного дня',ic:'🏆',cnt:8,names:['Первый матч','Четвертьфинал','Финалист','Кубок!','Два кубка','Четыре кубка','Семь кубков','Десять кубков'],
    how:function(i){return ['Сыграть первый матч Кубка','Выиграть четвертьфинал','Дойти до финала Кубка','Выиграть Кубок выходного дня','Выиграть Кубок 2 раза','Выиграть Кубок 4 раза','Выиграть Кубок 7 раз','Выиграть Кубок 10 раз'][i];},sell:function(i){return i<2?200:i<4?250:300;}});
  SER.push({k:'hw',n:'Страшилки у подъезда',ic:'🎃',cnt:4,hol:'hw',names:['Тыква','Летучая мышь','Чёрный кот','Привидение'],
    how:function(i){return ['Зайти во двор в дни «Страшилок у подъезда» (24.10–02.11)','Заходить 3 разных дня «Страшилок»','Заходить 5 разных дней «Страшилок»','Заходить все 7 дней «Страшилок»'][i];},sell:null});
  SER.push({k:'ny',n:'Новогодний двор',ic:'🎄',cnt:4,hol:'ny',names:['Ёлка','Снеговик','Дед Мороз','Бенгальский огонь'],
    how:function(i){return ['Зайти во двор в «Новогодний двор» (декабрь)','Заходить 5 разных дней «Новогоднего двора»','Заходить 12 разных дней','Заходить 20 разных дней'][i];},sell:null});
  (YD.SEASER||[]).forEach(function(s){SER.push(s);});}
YD.addSeries=function(s){(YD.SEASER=YD.SEASER||[]).push(s);if(SER.length)SER.push(s);};
YD.ser=function(k){for(var i=0;i<SER.length;i++)if(SER[i].k===k)return SER[i];return null;};

/* ---------- сохранение ---------- */
YD.fix(function(){if(!YD.isO(S.stp))S.stp={};for(var k in S.stp)if(typeof S.stp[k]!=='number'||!(S.stp[k]>=0))delete S.stp[k];
  var first=!YD.isO(S.stpN);YD.fObjNum('stpN');
  // старое сохранение: по верным ответам темы (S.tc) — примерно 45 % из них ценой 300+
  if(first&&YD.isO(S.tc))for(var t in S.tc)if(S.tc[t]>0)S.stpN[t]=Math.round(S.tc[t]*0.45);
  if(!YD.isO(S.stpH))S.stpH={};for(var h in S.stpH)if(!Array.isArray(S.stpH[h]))delete S.stpH[h];});
YD.merge(function(loc,d){if(YD.isO(d.stp)){if(!YD.isO(S.stp))S.stp={};for(var k in d.stp)if(typeof d.stp[k]==='number')S.stp[k]=(S.stp[k]||0)|d.stp[k];}
  YD.mObjMax(d,'stpN');if(YD.isO(d.stpH)){if(!YD.isO(S.stpH))S.stpH={};for(var h in d.stpH)if(Array.isArray(d.stpH[h])){var a=S.stpH[h]||[];d.stpH[h].forEach(function(x){if(a.indexOf(x)<0)a.push(x);});S.stpH[h]=a.slice(-40);}}});
YD.has=function(k,i){return !!(((S.stp||{})[k]||0)&(1<<i));};
YD.stampCount=function(){var n=0;for(var k in (S.stp||{})){var m=S.stp[k];while(m){n+=m&1;m>>>=1;}}return n;};
function serCount(s){var n=0;for(var i=0;i<s.cnt;i++)if(YD.has(s.k,i))n++;return n;}
YD.serDone=function(k){var s=YD.ser(k);return !!s&&serCount(s)>=s.cnt;};
var NEWQ=[]; // выданные в этом заходе (для тоста/подсветки)
YD.stampGive=function(k,i,how){if(YD.has(k,i))return false;if(!YD.isO(S.stp))S.stp={};S.stp[k]=(S.stp[k]||0)|(1<<i);NEWQ.push(k+':'+i);YD.save();
  YD.ev('stamp',{s:k,i:i,h:how||''});var s=YD.ser(k);
  if(!YD.quiet)YD.toast('📮 Новая марка: «'+(s?s.names[i]:k)+'»'+(s&&serCount(s)>=s.cnt?' — серия собрана!':''),3000);
  YD.fire('stamp',{k:k,i:i});return true;};
// проверка тематических марок (по счётчикам)
function checkTopic(t){var s=YD.ser(t);if(!s||!s.top)return;for(var i=0;i<8;i++){if(YD.has(t,i))continue;var p=s.prog(i);if(p[0]>=p[1])YD.stampGive(t,i,'play');}}
YD.checkAll=function(){YD.quiet=true;try{SER.forEach(function(s){if(s.top)checkTopic(s.k);});holCheck();}finally{YD.quiet=false;}};
// праздники: дни заходов в оформление
function holCheck(){var h=YD.hol();if(!h)return;var a=S.stpH[h]||(S.stpH[h]=[]),d=YD.dayNo();if(a.indexOf(d)<0){a.push(d);YD.save();}
  var n=a.length,need=h==='hw'?[1,3,5,7]:[1,5,12,20];for(var i=0;i<4;i++)if(n>=need[i])YD.stampGive(h,i,'hol');}

/* ---------- ответы: счётчик 300+ и бонус собранной серии ---------- */
YD.onAnswer(function(a,q){if(!a.ok||!a.t)return;
  if(a.price>=MINP){S.stpN[a.t]=YD.num(S.stpN[a.t])+1;checkTopic(a.t);}
  else if(a.mode!=='lad'||!a.step)checkTopic(a.t);
  if(a.mode==='lad'&&YD.serDone(a.t)){S.coins=YD.coins()+1;try{STAT.earn('quest',1);}catch(e){}}});
try{var fl0=window.finishLadder;if(typeof fl0==='function')window.finishLadder=function(){var r=fl0.apply(this,arguments);try{YD.checkAll();}catch(e){}return r;};}catch(e){}

/* ---------- рисунок марки ---------- */
// s — серия, i — номер, own — есть ли; sz — ширина px. Зубцы — кружки цвета фона по краю
YD.stampSvg=function(s,i,own,sz){var c=s.col||PAL[(i+(s.k.length*3))%8],w=60,h=74,o='';sz=sz||60;
  o+='<rect x="0" y="0" width="'+w+'" height="'+h+'" fill="'+(own?'#fffdf6':'#ebe6d8')+'"/>';
  for(var x=4;x<w;x+=7.4){o+='<circle cx="'+x+'" cy="0" r="2.4" class="zb"/><circle cx="'+x+'" cy="'+h+'" r="2.4" class="zb"/>';}
  for(var y=4;y<h;y+=7.6){o+='<circle cx="0" cy="'+y+'" r="2.4" class="zb"/><circle cx="'+w+'" cy="'+y+'" r="2.4" class="zb"/>';}
  if(own){o+='<rect x="6" y="6" width="48" height="52" rx="2" fill="'+c[1]+'" stroke="'+c[0]+'" stroke-width="2"/>';
    var ic='';try{if(s.top&&window.LK&&LK.IC&&LK.IC[s.k])ic='<svg x="12" y="11" width="36" height="36" viewBox="0 0 48 48" style="--i1:'+c[0]+';--i2:#ff7a1a;--i3:#fff;--il:#233247">'+LK.IC[s.k]+'</svg>';}catch(e){}
    if(!ic&&s.draw)ic=s.draw(i);
    if(!ic)ic='<text x="30" y="41" font-size="26" text-anchor="middle">'+(s.ic||'📮')+'</text>';
    o+=ic+'<path d="M8 50 q22 -6 44 0" fill="none" stroke="'+c[0]+'" stroke-width="1.2" opacity=".6"/>';
    o+='<text x="50" y="16" font-family="KF,Rubik,Arial,sans-serif" font-weight="800" font-size="8" fill="'+c[0]+'" text-anchor="end">'+[10,15,20,25,30,40,50,60][i%8]+'к</text>';
    o+='<text x="30" y="68" font-family="KF,Rubik,Arial,sans-serif" font-weight="700" font-size="6.4" fill="#5a6676" text-anchor="middle">ПОЧТА ДВОРА</text>';}
  else{o+='<rect x="6" y="6" width="48" height="52" rx="2" fill="none" stroke="#c9c3b2" stroke-width="1.6" stroke-dasharray="4 3"/><text x="30" y="40" font-family="KF,Rubik,Arial,sans-serif" font-weight="800" font-size="20" fill="#b5ae9c" text-anchor="middle">?</text>'+
    '<text x="30" y="68" font-family="KF,Rubik,Arial,sans-serif" font-weight="700" font-size="7" fill="#9a937f" text-anchor="middle">№'+(i+1)+'</text>';}
  return '<svg class="stp'+(own?' own':'')+'" width="'+sz+'" height="'+Math.round(sz*h/w)+'" viewBox="-3 -3 '+(w+6)+' '+(h+6)+'" aria-hidden="true">'+o+'</svg>';};

/* ---------- филателист: витрина дня ---------- */
YD.kioskLv=function(){return YD.lvl('kiosk');};
function showcase(){var n=YD.kioskLv()>=3?4:3,miss=[];SER.forEach(function(s){if(!s.sell)return;for(var i=0;i<s.cnt;i++)if(!YD.has(s.k,i))miss.push([s,i]);});
  if(!miss.length)return [];var R=rng(YD.dayNo()*7919+31),a=miss.slice();for(var j=a.length-1;j>0;j--){var x=Math.floor(R()*(j+1)),t=a[j];a[j]=a[x];a[x]=t;}
  return a.slice(0,n);}
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
// витрина сегодняшняя, но купленные уходят (на их место — не добавляем до завтра)
function todayCase(){var key=YD.dayNo();if(!S.stpV||S.stpV.d!==key){var c=showcase();S.stpV={d:key,a:c.map(function(x){return x[0].k+':'+x[1];})};}
  return (S.stpV.a||[]).map(function(id){var p=id.split(':'),s=YD.ser(p[0]);return s?[s,+p[1]]:null;}).filter(Boolean);}
YD.fix(function(){if(S.stpV!=null&&!(YD.isO(S.stpV)&&Array.isArray(S.stpV.a)))delete S.stpV;});

/* ---------- окно марки ---------- */
function stampInfo(s,i,back){var own=YD.has(s.k,i),p=s.prog?s.prog(i):null,price=s.sell?s.sell(i):0;
  var h='<h2>'+(s.ic||'📮')+' '+esc(s.n)+'</h2><div class="stbig">'+YD.stampSvg(s,i,own,120)+'</div><p class="sttl"><b>«'+esc(s.names[i])+'»</b> · марка №'+(i+1)+' из '+s.cnt+'</p>';
  h+='<p class="goal">'+(own?'✓ В альбоме. ':'Как получить: ')+esc(s.how(i))+(p&&!own?' <b>('+p[0]+' из '+p[1]+')</b>':'')+'</p>';
  if(!own&&s.sell)h+='<p class="ydnote">Или у филателиста дяди Коли в киоске «Союзпечать» — когда марка окажется на витрине ('+YD.ct(price)+').</p>';
  if(s.sea&&i>=6&&!own)h+='<p class="ydnote">Марка верхней дорожки «Абонемента» сезона.</p>';
  try{modal(h+'<div class="row"><button class="btn" id="mCancel">Закрыть</button></div>');}catch(e){return;}
  YD.Q('mCancel').onclick=function(){hideModal();if(back)back();};}

/* ---------- вкладка «Марки» ---------- */
function render(el){if(!SER.length)initSeries();YD.checkAll();var all=0,got=YD.stampCount();SER.forEach(function(s){all+=s.cnt;});
  var kl=YD.kioskLv(),h='';
  h+='<div class="stfil">'+YD.head('kolya',0,0,64).replace('<svg ','<svg class="stfav" ')+'<div class="stfw"><b>Дядя Коля, филателист</b>';
  if(!kl)h+='<small>Откроется, когда построишь киоск «Союзпечать» во дворе ('+YD.ct(YD.B[3].c[0])+').</small></div></div>';
  else{var cs=todayCase();h+='<small>'+(cs.length?'Сегодня на витрине — '+cs.length+' '+YD.pl(cs.length,'марка','марки','марок')+'. Завтра — новые.':'Витрина пуста до завтра — приходи!')+'</small></div></div>';
    if(cs.length)h+='<div class="stcase">'+cs.map(function(x){var s=x[0],i=x[1],own=YD.has(s.k,i),pr=s.sell(i),can=YD.coins()>=pr;
      return '<div class="stci">'+YD.stampSvg(s,i,true,64)+'<small>'+esc(s.names[i])+'<br><span>'+esc(s.n)+'</span></small>'+(own?'<i>куплено</i>':'<button class="btn '+(can?'accent':'')+' noenter stbuy" data-s="'+s.k+'" data-i="'+i+'"'+(can?'':' aria-disabled="true"')+'>'+YD.ct(pr)+'</button>')+'</div>';}).join('')+'</div>';}
  h+='<div class="stsum"><b>'+got+'</b> из '+all+' марок · собрано серий: '+SER.filter(function(s){return serCount(s)>=s.cnt;}).length+'</div>';
  var hol=YD.hol();
  var list=SER.filter(function(s){return !s.hol||s.hol===hol||serCount(s)>0;}).filter(function(s){return !s.sea||s.sea===YD.seaId()||serCount(s)>0;});
  // сначала начатые серии
  list.sort(function(a,b){var x=serCount(a)/a.cnt,y=serCount(b)/b.cnt,cs=YD.seaId();return (b.hol?1:0)-(a.hol?1:0)||((x>0)===(y>0)?0:(y>0?1:-1))||((b.sea===cs?1:0)-(a.sea===cs?1:0))||(y-x);});
  h+=list.map(function(s){var n=serCount(s),done=n>=s.cnt;
    return '<div class="stser'+(done?' done':'')+'"><div class="stsh"><b>'+(s.ic||'📮')+' '+esc(s.n)+'</b><span>'+n+'/'+s.cnt+(done&&s.top?' · Знаток!':'')+'</span></div><div class="stgrid">'+
      Array.apply(null,Array(s.cnt)).map(function(_,i){return '<button class="stc noenter" data-s="'+s.k+'" data-i="'+i+'" aria-label="'+esc(s.names[i])+'">'+YD.stampSvg(s,i,YD.has(s.k,i),52)+'</button>';}).join('')+'</div>'+
      (done&&s.top?'<small class="stbon">Серия собрана: ты — знаток темы, +1 💰 за каждый верный в лестнице этой темы</small>':'')+'</div>';}).join('');
  h+='<p class="ydnote">Марки не выпадают случайно: у каждой написано, как её получить. Сундук дня даёт марку на выбор из трёх.</p>';
  el.innerHTML=h;
  el.querySelectorAll('.stc').forEach(function(b){b.onclick=function(){stampInfo(YD.ser(b.dataset.s),+b.dataset.i,function(){YD.render();});};});
  el.querySelectorAll('.stbuy').forEach(function(b){b.onclick=function(){var s=YD.ser(b.dataset.s),i=+b.dataset.i,pr=s.sell(i);
    if(YD.coins()<pr){YD.toast('Не хватает '+YD.ct(pr-YD.coins()));return;}
    if(YD.spend(pr,'stamp')){YD.stampGive(s.k,i,'buy');YD.render();}};});}
YD.tab({id:'stamps',n:'Марки',ic:'📨',o:10,render:render,sub:function(){return YD.stampCount()+' марок в альбоме';}});

/* ---------- марка на выбор из 3 (сундук дня CAR) ---------- */
YD.stampPick=function(cb,title){if(!SER.length)initSeries();var miss=[];SER.forEach(function(s){if(s.paid||s.hol||s.sea)return;for(var i=0;i<s.cnt;i++)if(!YD.has(s.k,i))miss.push([s,i]);});
  if(!miss.length){if(cb)cb(null);return false;}
  // ближе к получению — выше (тематические по прогрессу), остальное — по порядку
  miss.sort(function(a,b){var pa=a[0].prog?a[0].prog(a[1]):[0,1],pb=b[0].prog?b[0].prog(b[1]):[0,1];return pb[0]/pb[1]-pa[0]/pa[1]||a[1]-b[1];});
  var R=rng(YD.dayNo()*131+7),pool=miss.slice(0,9),pick=[];while(pick.length<3&&pool.length)pick.push(pool.splice(Math.floor(R()*pool.length),1)[0]);
  var h='<h2>📮 '+esc(title||'Марка на выбор')+'</h2><p>Выбери одну — она сразу ляжет в альбом.</p><div class="stpick">'+pick.map(function(x,j){return '<button class="stpk noenter" data-j="'+j+'">'+YD.stampSvg(x[0],x[1],true,84)+'<b>'+esc(x[0].names[x[1]])+'</b><small>'+esc(x[0].n)+'</small></button>';}).join('')+'</div>';
  try{modal(h);}catch(e){if(cb)cb(null);return false;}
  document.querySelectorAll('#mcard .stpk').forEach(function(b){b.onclick=function(){var x=pick[+b.dataset.j];YD.stampGive(x[0].k,x[1],'chest');hideModal();YD.snd('coin');if(cb)cb(x[0].k+':'+x[1]);};});
  return true;};

YD.on('start',function(){initSeries();YD.checkAll();});
YD.homeLine({pri:70,f:function(){var h=YD.hol();if(!h)return null;return {ic:YD.HOL[h].ic,t:YD.HOL[h].n+': праздничные марки',a:'stamps'};}});
})();
