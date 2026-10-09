/* Дворовая викторина — «МОЙ ДВОР» и общее ядро потока YARD (буст 09.10.2026). Журнал: hobby-analytics/release-i/viktorina-boost/logs/YARD.md
   Источник: viktorina-boost/04-meta-economy.md §2.5, 2.7, 2.8, 3.2, 3.4. Файлы потока: js/yard.js (ядро + двор), js/stamps.js (марки, филателист),
   js/league.js (Лига двора, Кубок выходного дня), js/season.js (сезоны, Абонемент, Узелок новичка, наборы двора, праздники); css/yard.css.
   Подключение: <link css/yard.css> в <head>, скрипты — после основного скрипта игры (как js/themes.js). Код игры не меняем:
   - сохранение: свои поля S.yd*, S.stp*, S.lga* (S.lg — гостинцы main, не трогаем), S.sea*; починка — YD.fix(fn), слияние облака — YD.merge(fn)
     (обёртка над глобальной mergeSave: свои поля до слияния запоминаем, после — сливаем по своим правилам: максимум / объединение);
   - ответы: YD.answer({id, ok, mode, step, price}) — от гнезда answerHook (UX); пока гнезда нет — временная обёртка reveal (hookAnswers);
   - дата: YD.now() = nowMs() + сдвиг ?date=ГГГГ-ММ-ДД[ЧЧ:ММ] (только localhost / ?paytest) — сезоны, праздники, лига, кубок проверяются подменой даты;
   - покупки: новые строки в PAY_ITEMS/PAY_TEST добавляются отсюда (js/season.js), модуль PAY не трогаем.
   Экран «Двор» (#scr-yard): сцена двора (8 построек × 3 уровня, 9000 💰, рисунки свои, SVG в стиле «Дворовое шоу») + подвкладки
   Двор · Марки · Лига · Сезон (регистрируют stamps/league/season через YD.tab). Главный: YD.homeCard() (гнездо homeSlots UX), пока гнезда нет — сами
   вставляем карточку в меню (homeFallback). Наружу: window.YARD = YD (open, homeCard, dot, prg, stampPick, seasonAdd, boardDay, frames, lvl). */
(function(){
'use strict';
var YD=window.YD=window.YARD={v:1};
var Q=function(id){return document.getElementById(id);};
var isO=function(x){return !!x&&typeof x==='object'&&!Array.isArray(x);};
YD.isO=isO;YD.Q=Q;
YD.esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
YD.num=function(x){return typeof x==='number'&&isFinite(x)&&x>0?x:0;};
YD.pl=function(n,a,b,c){var x=Math.abs(n)%100,y=x%10;return x>10&&x<20?c:y===1?a:y>=2&&y<=4?b:c;};

/* ---------- дата игрока (+ подмена ?date= для проверки) ---------- */
var OFF=0;
YD.dev=/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname)||location.protocol==='file:'||/[?&]paytest=/.test(location.search);
(function(){var m=/[?&]date=(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):?(\d{2}))?/.exec(location.search);if(!m||!YD.dev)return;
  var t=new Date(+m[1],+m[2]-1,+m[3],m[4]?+m[4]:12,m[5]?+m[5]:0).getTime();OFF=t-Date.now();})();
YD.now=function(){var t=Date.now(),sh=false;try{if(typeof nowMs==='function'){t=nowMs();sh=!!window.DATE_SHIFT;}}catch(e){}return t+(sh?0:OFF);}; // FIX1 (аудит 🟡19): nowMs() уже сдвинут ?date= (DATE_SHIFT) — второй раз не прибавляем
YD.shifted=function(){return OFF!==0;};
YD.date=function(){return new Date(YD.now());};
YD.dayNo=function(t){t=t||YD.now();var d=new Date(t);return Math.floor((t-d.getTimezoneOffset()*60000)/864e5);}; // календарный день (местное время)
YD.dkey=function(t){var d=new Date(t||YD.now());return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();};
YD.week=function(){return Math.floor((YD.dayNo()+3)/7);};            // неделя с понедельника
YD.wday=function(){return ((YD.dayNo()+3)%7+7)%7;};                  // 0 — понедельник … 6 — воскресенье
YD.mon=function(t){var d=new Date(t||YD.now());return d.getFullYear()*100+d.getMonth()+1;}; // 202610
YD.md=function(){var d=YD.date();return (d.getMonth()+1)*100+d.getDate();};                   // 1024 — 24 октября
// праздничное оформление двора: «Страшилки у подъезда» 24.10–02.11 (как сезонный набор FEST hw), «Новогодний двор» 01.12–10.01
YD.hol=function(){var md=YD.md();if(md>=1024&&md<=1102)return 'hw';if(md>=1201||md<=110)return 'ny';return '';};
YD.HOL={hw:{n:'Страшилки у подъезда',ic:'🎃',t:'с 24 октября по 2 ноября'},ny:{n:'Новогодний двор',ic:'🎄',t:'весь декабрь и до 10 января'}};
try{var hwN=window.VTOP&&VTOP.festName&&VTOP.festName('hw');if(hwN)YD.HOL.hw.n=hwN;}catch(e){} // FIX1: на Яндексе — «Осенний вечер у подъезда», как набор FEST

/* ---------- сохранение: свои поля, починка и слияние облака ---------- */
var FIX=[],MRG=[],MINE=/^(yd|stp|sea|lga)/;
YD.fix=function(f){FIX.push(f);try{f();}catch(e){YD.err('fix',e);}};
YD.merge=function(f){MRG.push(f);};
YD.runFix=function(){FIX.forEach(function(f){try{f();}catch(e){YD.err('fix',e);}});};
(function(){var m0=window.mergeSave;if(typeof m0!=='function')return;
  window.mergeSave=function(d){var loc={};try{for(var k in S)if(MINE.test(k))loc[k]=JSON.parse(JSON.stringify(S[k]));}catch(e){}
    var r=m0.apply(this,arguments);
    if(isO(d)){for(var k2 in loc)S[k2]=loc[k2]; // наши поля сливаем сами (не «новее — целиком»)
      MRG.forEach(function(f){try{f(loc,d);}catch(e){YD.err('merge',e);}});YD.runFix();}
    return r;};})();
// слияние: число — максимум; список — объединение; строка цифр — по разрядам максимум
YD.mMax=function(d,k){if(typeof d[k]==='number'&&isFinite(d[k]))S[k]=Math.max(YD.num(S[k]),d[k]);};
YD.mList=function(d,k){if(!Array.isArray(d[k]))return;if(!Array.isArray(S[k]))S[k]=[];d[k].forEach(function(x){if(typeof x==='string'&&S[k].indexOf(x)<0)S[k].push(x);});};
YD.mObjMax=function(d,k){if(!isO(d[k]))return;if(!isO(S[k]))S[k]={};for(var x in d[k])if(typeof d[k][x]==='number')S[k][x]=Math.max(YD.num(S[k][x]),d[k][x]);};
YD.fList=function(k){if(!Array.isArray(S[k]))S[k]=[];S[k]=S[k].filter(function(x){return typeof x==='string'&&x.length<40;});};
YD.fObjNum=function(k){if(!isO(S[k]))S[k]={};for(var x in S[k])if(typeof S[k][x]!=='number'||!isFinite(S[k][x])||S[k][x]<0)delete S[k][x];};
YD.fNum=function(k){if(typeof S[k]!=='number'||!isFinite(S[k])||S[k]<0)S[k]=0;};

/* ---------- монеты, статистика, звук ---------- */
YD.save=function(){try{save();}catch(e){}};
YD.coins=function(){return YD.num(S.coins);};
YD.give=function(n,src){if(!(n>0))return;S.coins=YD.coins()+n;try{STAT.earn(src||'quest',n);}catch(e){}YD.save();try{updCoins();}catch(e){}};
YD.spend=function(n,k){if(!(n>0)||YD.coins()<n)return false;S.coins=YD.coins()-n;try{STAT.ev('spend',{k:k||'yard',c:n});}catch(e){}YD.save();try{updCoins();}catch(e){}try{SND.coin();}catch(e){}return true;};
YD.ev=function(n,p){try{STAT.ev(n,p||{});}catch(e){}};
YD.err=function(w,e){try{if(window.console)console.warn('YARD',w,e);}catch(x){}};
YD.snd=function(k){try{(SND[k]||SND.tap||function(){})();}catch(e){}};
YD.ct=function(n){try{return coinsTxt(n);}catch(e){return n+' 💰';}};
YD.toast=function(t,ms){try{toast(t,ms||2600);}catch(e){}};

/* ---------- район карьеры (CAR): 0 Лавочка, 1 Двор, 2 Улица, 3 Квартал, 4 Район, 5 Город ---------- */
YD.district=function(){try{if(window.CAR){var f=CAR.dist||CAR.district;if(typeof f==='function'){var d=+f.call(CAR);if(d>=0)return Math.min(5,d);}}}catch(e){}
  var l=YD.num(S.lvl);return l>=60?5:l>=35?4:l>=20?3:l>=10?2:l>=3?1:0;}; // прикидка до карьеры (уровни лестницы)
YD.DIST=['Лавочка','Двор','Улица','Квартал','Район','Город'];

/* ---------- цена вопроса (BOARD priceOf) ---------- */
YD.price=function(q){try{if(typeof window.priceOf==='function'){var p=+priceOf(q,{});if(p>0)return p;}}catch(e){}
  return q&&q.d?[0,100,300,500][q.d]||100:100;};

/* ---------- ответы: гнездо answerHook (UX), запасная обёртка reveal ---------- */
var AH=[];
YD.onAnswer=function(f){AH.push(f);};
YD.answer=function(a){if(!a||!a.id)return;var q=null;try{q=QI[a.id];}catch(e){}if(!a.price)a.price=YD.price(q);a.t=a.t||(q&&q.t)||'';
  AH.forEach(function(f){try{f(a,q);}catch(e){YD.err('ans',e);}});};
YD.hook='';
function hookAnswers(){
  try{var H=window.answerHook;
    if(H&&typeof H.add==='function'){H.add(YD.answer);return YD.hook='ux';}
    if(Array.isArray(H)){H.push({id:'yard',fn:YD.answer});return YD.hook='ux';}
    if(window.UI&&typeof UI.on==='function'){UI.on('answer',YD.answer);return YD.hook='ux';}}catch(e){}
  // временно (до гнезда UX): смотрим, чем кончился reveal — верно (st 'done', res=1) или мимо (wrongs выросли)
  var r0=window.reveal;if(typeof r0!=='function')return '';
  window.reveal=function(k){var g=null,q=null,i=0,w=0,st='';try{g=G;if(g){q=g.qs&&g.qs[g.i];i=g.i;w=g.wrongs?g.wrongs.size:0;st=g.st;}}catch(e){}
    var r=r0.apply(this,arguments);
    try{if(g&&st==='wait'&&q){var id=typeof q==='string'?q:q.i,ok=g.res&&g.res[i]===1&&g.st==='done',no=g.wrongs&&g.wrongs.size>w;
      if(ok||no)YD.answer({id:id,ok:ok?1:0,mode:g.mode||'',step:i+1,hint:''});}}catch(e){YD.err('rv',e);}
    return r;};
  return YD.hook='reveal';}
YD.hookAnswers=hookAnswers;

/* ---------- ПОСТРОЙКИ ---------- */
// c — цены уровней 1/2/3 (04 §2.7, всего 9000 💰, ×1,5 — решение владельца 09.10); g — что даёт каждый уровень (не ответы! удобства, дела, красота)
var B=[
 {k:'bench',n:'Лавочка у подъезда',ic:'🪑',c:[90,260,480],g:['Михалыч выходит во двор — его место','Скамейка со спинкой и урной','Фонарь над подъездом, вечерние посиделки']},
 {k:'gaz',n:'Беседка с домино',ic:'🎲',c:[120,280,510],g:['Стол для домино — соседи собираются','Крыша беседки — играют и в дождь','Фонарик и турнир по домино: Коля и Митяй']},
 {k:'dove',n:'Голубятня',ic:'🕊️',c:[140,320,560],g:['Голубятня на ножках','Голуби и флажок: почта соседей','Стая над двором — письма каждый день']},
 {k:'kiosk',n:'Киоск «Союзпечать»',ic:'📰',c:[150,330,600],g:['Киоск открыт: дядя Коля-филателист продаёт марки','Козырёк и витрина с газетами','Вывеска с подсветкой, витрина филателиста шире']},
 {k:'flow',n:'Палисадник и клумбы',ic:'🌷',c:[160,360,630],g:['Заборчик и грядка — место для украшений','Тюльпаны и ромашки','Лебедь из шины и пышные клумбы']},
 {k:'play',n:'Детская площадка',ic:'🛝',c:[180,390,680],g:['Песочница с грибком','Качели','Валерка на качелях — площадка ожила']},
 {k:'cups',n:'Полка кубков у окна',ic:'🏆',c:[210,420,720],g:['Кубки лиги и выходного дня — на окне','Полка и занавески','Гирлянда: кубки видны всему двору']},
 {k:'yard',n:'Двор целиком',ic:'🏡',c:[220,450,750],g:['Асфальт вместо грязи','Фонари вдоль двора','Турник и классики, рамка «Образцовый двор»']}];
YD.B=B;YD.BTOT=B.reduce(function(s,b){return s+b.c[0]+b.c[1]+b.c[2];},0); // 9010 (≈9000)
// уровень открывается районом карьеры: 1-й — «Двор» (лавочка — сразу), 2-й — «Квартал», 3-й — «Район»
YD.needDist=function(i,l){return l===1?(i===0?0:1):l===2?3:4;};

YD.fix(function(){if(typeof S.yd!=='string'||!/^[0-3]{8}$/.test(S.yd))S.yd='00000000';YD.fList('ydD');YD.fList('ydF');YD.fList('ydS');
  YD.fNum('ydT0');if(!S.ydT0)S.ydT0=YD.dayNo();if(S.ydH!=null&&!isO(S.ydH))S.ydH={};});
YD.merge(function(loc,d){if(typeof d.yd==='string'&&/^[0-3]{8}$/.test(d.yd)){var a=(typeof S.yd==='string'?S.yd:'00000000').split(''),o='';for(var i=0;i<8;i++)o+=Math.max(+a[i]||0,+d.yd[i]||0);S.yd=o;}
  YD.mList(d,'ydD');YD.mList(d,'ydF');YD.mList(d,'ydS');if(typeof d.ydT0==='number'&&d.ydT0>0)S.ydT0=S.ydT0?Math.min(S.ydT0,d.ydT0):d.ydT0;
  if(isO(d.ydH)){if(!isO(S.ydH))S.ydH={};for(var k in d.ydH)if(d.ydH[k])S.ydH[k]=1;}});
YD.lv=function(i){return +(S.yd||'00000000')[i]||0;};
YD.lvl=function(k){for(var i=0;i<8;i++)if(B[i].k===k)return YD.lv(i);return 0;};
YD.levels=function(){var a=[];for(var i=0;i<8;i++)a.push(YD.lv(i));return a;};
YD.total=function(){return YD.levels().reduce(function(s,x){return s+x;},0);};
YD.spent=function(){var s=0;for(var i=0;i<8;i++)for(var l=0;l<YD.lv(i);l++)s+=B[i].c[l];return s;};
function setLv(i,l){var a=(S.yd||'00000000').split('');a[i]=String(l);S.yd=a.join('');}
// следующая доступная постройка (самая дешёвая из открытых районом)
YD.nextB=function(){var best=null,d=YD.district();for(var i=0;i<8;i++){var l=YD.lv(i);if(l>=3)continue;var c=B[i].c[l],ok=d>=YD.needDist(i,l+1);
  if(!best||(ok&&!best.ok)||(ok===best.ok&&c<best.c))best={i:i,l:l+1,c:c,ok:ok};}return best;};
YD.build=function(i){var l=YD.lv(i);if(l>=3)return false;var c=B[i].c[l];
  if(YD.district()<YD.needDist(i,l+1)){YD.toast('Откроется в районе «'+YD.DIST[YD.needDist(i,l+1)]+'»');return false;}
  if(!YD.spend(c,'dvor'))return false;setLv(i,l+1);if(i===7&&l+1===3&&S.ydF.indexOf('obr')<0)S.ydF.push('obr');
  YD.save();YD.ev('dvor',{b:B[i].k,l:l+1,c:c,n:YD.total()});try{SND.safe();}catch(e){}YD.fire('build',{i:i,l:l+1});return true;};
var EV={};YD.on=function(n,f){(EV[n]=EV[n]||[]).push(f);};YD.fire=function(n,a){(EV[n]||[]).forEach(function(f){try{f(a);}catch(e){YD.err(n,e);}});};
YD.seaId=function(){return 's'+YD.mon();};
// награды от CAR: kind 'chest' (сундук дня — марка на выбор из 3), 'stamp' (марка за серию входа), 'deco' (украшение за 30-й день серии)
YD.gift=function(kind,cb,src){try{if(kind==='chest'||kind==='stamp')return YD.stampPick(function(id){if(cb)cb(id);},kind==='chest'?'Сундук дня: марка на выбор':'Марка за серию дней');
  if(kind==='deco'){YD.addDec('car-flag');YD.save();YD.toast('🚩 Во дворе — флаг «Образцовый жилец»!',3000);YD.ev('dvor',{dec:'car-flag',src:src||'car'});if(cb)cb('car-flag');return true;}}catch(e){YD.err('gift',e);}
  if(cb)cb(null);return false;};
YD.frames=function(){return (S.ydF||[]).slice();};
YD.prg=function(){var o={yd:YD.total()};try{if(YD.stampCount)o.mk=YD.stampCount();}catch(e){}return o;};

/* ---------- РИСУНОК ДВОРА (SVG 400×260, обводка #233247, плоские цвета «Дворового шоу») ---------- */
var K='#233247',SW=' stroke="'+K+'" stroke-width="2" stroke-linejoin="round"',SW1=' stroke="'+K+'" stroke-width="1.5" stroke-linejoin="round"';
function R(x,y,w,h,f,ex){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'"'+(ex==null?SW:ex)+'/>';}
function P(d,f,ex){return '<path d="'+d+'" fill="'+(f||'none')+'"'+(ex==null?SW:ex)+'/>';}
function C(x,y,r,f,ex){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"'+(ex==null?SW:ex)+'/>';}
function E(x,y,rx,ry,f,ex){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'"'+(ex==null?SW:ex)+'/>';}
function T(x,y,s,sz,f,ex){return '<text x="'+x+'" y="'+y+'" font-family="KF,Rubik,Arial,sans-serif" font-weight="800" font-size="'+sz+'" fill="'+(f||K)+'" text-anchor="middle"'+(ex||'')+'>'+s+'</text>';}
YD.svg={R:R,P:P,C:C,E:E,T:T,K:K,SW:SW,SW1:SW1};
// голова персонажа из js/look.js (перерисованные шесть) — вложенный svg
function head(id,x,y,s){try{if(window.LK&&LK.face){var f=LK.face(id);return f.replace('<svg ','<svg x="'+x+'" y="'+y+'" width="'+s+'" height="'+(s*150/132)+'" ').replace(/class="[^"]*"/,'');}}catch(e){}
  return C(x+s/2,y+s/2,s/2.3,'#f2c7a5');}
YD.head=head;
// пустое место под постройку: пунктир + колышек с табличкой
function plot(x,y,w,h,lab,dark){return '<g class="ydplot">'+R(x,y,w,h,dark?'rgba(255,255,255,.08)':'rgba(255,255,255,.28)',' stroke="'+(dark?'#c9d4ff':K)+'" stroke-width="1.6" stroke-dasharray="5 4" rx="6"')+
  P('M'+(x+w/2)+' '+(y+h-4)+'v-16',0,' stroke="#8a5a3a" stroke-width="3" stroke-linecap="round"')+R(x+w/2-15,y+h-30,30,14,'#fffaf0',' stroke="'+K+'" stroke-width="1.4" rx="3"')+T(x+w/2,y+h-19.5,lab,10)+'</g>';}

// дом-пятиэтажка (фон), окно с кубками — отдельно; win — светятся окна (вечер/ночь)
function house(lit,hol){var s='';
  s+=R(-6,14,312,114,hol==='ny'?'#e9dcc4':'#f3e3c6')+R(-10,6,320,10,'#c9765a')+P('M40 6v-6 M40 0h-6 M40 0h6 M250 6v-8',0,' stroke="'+K+'" stroke-width="1.6"');
  var W=[[14,24],[54,24],[94,24],[134,24],[174,24],[214,24],[254,24],[94,62],[134,62],[174,62],[214,62],[14,62]];
  var L=hol?[0,2,3,5,7,9,10,11]:lit?[1,4,8]:[];
  W.forEach(function(w,i){var on=L.indexOf(i)>=0;s+=R(w[0],w[1],24,28,on?(hol==='hw'?'#ffb347':'#ffd24a'):'#bfe0f2',' stroke="'+K+'" stroke-width="1.8" rx="2"')+P('M'+(w[0]+12)+' '+w[1]+'v28 M'+w[0]+' '+(w[1]+12)+'h24',0,' stroke="'+K+'" stroke-width="1.2"');});
  // подъезд: козырёк, дверь, табличка
  s+=R(48,82,44,46,'#d9c9a8')+R(56,92,28,36,'#7a9cc0',' stroke="'+K+'" stroke-width="1.8" rx="2"')+P('M70 92v36',0,' stroke="'+K+'" stroke-width="1.4"')+C(66,111,1.6,K,'')+C(74,111,1.6,K,'')+
    P('M42 82h56l-6 -8h-44z','#c9765a')+R(62,60,16,10,'#3f8fe0',' stroke="'+K+'" stroke-width="1.4" rx="2"')+T(70,68,'3',8,'#fff');
  return s;}
// тротуар, двор, проезд (уровни «Двора целиком»: 0 — грязь и лужа, 1 — асфальт, 2 — + фонари, 3 — + турник и классики)
function ground(l,hol){var g=hol==='ny'?'#eef5fb':'#8fd27a',g2=hol==='ny'?'#ffffff':'#a9e08f',s='';
  s+=R(-4,126,410,140,g,'')+P('M-4 140 q100 -10 200 0 t210 0 v-14 h-410z',g2,'');
  s+=R(-4,124,410,8,'#cfc8b6',' stroke="'+K+'" stroke-width="1.6"');
  var road=l>=1?(hol==='ny'?'#dfe6ee':'#b8b8b0'):(hol==='ny'?'#e6edf3':'#d9bf8f');
  s+=P('M58 128 v52 q0 8 8 8 h340 v18 h-344 q-22 0 -22 -22 v-56z',road,' stroke="'+K+'" stroke-width="1.8"');
  if(l<1&&hol!=='ny')s+=E(250,197,22,5,'#8fb8d8',' stroke="'+K+'" stroke-width="1.2"')+E(320,193,10,3,'#8fb8d8',' stroke="'+K+'" stroke-width="1"');
  if(l>=1)s+=P('M110 197 h20 M160 197 h20 M210 197 h20 M260 197 h20 M310 197 h20 M360 197 h20',0,' stroke="'+(hol==='ny'?'#c4ced8':'#f4f0e4')+'" stroke-width="2.2"');
  return s;}
// дерево-береза справа и тополь за домом
function trees(hol){var s='',lf=hol==='hw'?'#f0a23a':hol==='ny'?'#ffffff':'#5fbf5a',lf2=hol==='hw'?'#d9622b':hol==='ny'?'#e8f1f8':'#4aa84a';
  s+=R(318,40,8,90,'#f4f4ee',' stroke="'+K+'" stroke-width="1.6"')+P('M318 60h5 M321 80h5 M318 100h4',0,' stroke="'+K+'" stroke-width="1.6"');
  s+=P('M322 8 q-30 6 -26 34 q-14 18 6 32 q14 12 30 0 q22 -10 10 -34 q2 -28 -20 -32z',lf);
  s+=P('M306 30 q8 -6 14 0 M326 52 q8 -4 12 2',0,' stroke="'+lf2+'" stroke-width="2.4" stroke-linecap="round"');
  return s;}

/* --- постройки: i, уровень → svg; в каждой своя «горячая зона» --- */
var HOT=[[24,96,92,50],[150,104,104,72],[338,22,62,106],[268,100,62,80],[128,214,128,46],[2,200,118,60],[248,20,32,36],[150,186,30,10]];
YD.HOT=HOT;
function bBench(l,hol){if(!l)return plot(30,140,80,30,'60',hol==='ny');var s='';
  if(l>=3){s+=P('M26 128 v-34',0,' stroke="'+K+'" stroke-width="3"')+P('M26 96 q0 -8 10 -8',0,' stroke="'+K+'" stroke-width="2.4"')+P('M31 88 h12 l-3 7 h-6z','#ffd24a')+(hol?'':E(37,104,14,10,'rgba(255,230,120,.35)',''));}
  if(l>=2){s+=R(38,138,64,6,'#e0a85a',' stroke="'+K+'" stroke-width="1.6" rx="2"')+R(38,146,64,6,'#e0a85a',' stroke="'+K+'" stroke-width="1.6" rx="2"');
    s+=R(108,150,12,16,'#2fa84f',' stroke="'+K+'" stroke-width="1.6" rx="2"')+R(106,148,16,4,'#1d7a36',' stroke="'+K+'" stroke-width="1.4"');}
  // Михалыч на лавочке
  s+=R(56,142,26,18,'#3f6fb5',' stroke="'+K+'" stroke-width="1.6" rx="7"')+head('mihalych',52,118,34);
  s+=R(34,156,72,7,'#e0a85a',' stroke="'+K+'" stroke-width="1.8" rx="2"')+P('M40 163v12 M100 163v12',0,' stroke="'+K+'" stroke-width="3.2" stroke-linecap="round"');
  if(hol==='hw')s+=pumpkin(108,170,1);if(hol==='ny')s+=P('M54 125 q15 -16 30 0 z','#e5484d')+C(85,123,3,'#fff')+R(52,124,34,4,'#fff',' stroke="'+K+'" stroke-width="1.2" rx="2"');
  return s;}
function bGaz(l,hol){if(!l)return plot(160,126,86,46,'80',hol==='ny');var s='',x=200;
  if(l>=2){s+=P('M'+(x-42)+' 120 l42 -16 l42 16z',l>=3?'#e5484d':'#c9765a')+P('M'+(x-36)+' 120 v52 M'+(x+36)+' 120 v52',0,' stroke="'+K+'" stroke-width="3"');
    if(l>=3)s+=P('M'+(x-28)+' 117 l28 -10 l28 10',0,' stroke="#fff" stroke-width="1.6" stroke-dasharray="3 3"')+P('M'+x+' 120 v6',0,' stroke="'+K+'" stroke-width="1.4"')+C(x,129,3.5,'#ffd24a',' stroke="'+K+'" stroke-width="1.2"');}
  if(l>=3){s+=R(x-50,146,14,14,'#3f6fb5',' stroke="'+K+'" stroke-width="1.5" rx="6"')+head('kolya',x-58,124,28)+R(x+36,146,14,14,'#2fa84f',' stroke="'+K+'" stroke-width="1.5" rx="6"')+head('mityai',x+30,124,28);}
  s+=R(x-26,150,52,7,'#e0a85a',' stroke="'+K+'" stroke-width="1.8" rx="2"')+P('M'+(x-18)+' 157 v14 M'+(x+18)+' 157 v14',0,' stroke="'+K+'" stroke-width="3" stroke-linecap="round"');
  for(var i=0;i<4;i++)s+=R(x-16+i*9,146,7,4,'#fff',' stroke="'+K+'" stroke-width="1" rx="1"');
  s+=R(x-40,160,10,11,'#b9783a',' stroke="'+K+'" stroke-width="1.4" rx="2"')+R(x+30,160,10,11,'#b9783a',' stroke="'+K+'" stroke-width="1.4" rx="2"');
  if(hol==='ny')s+=P('M'+(x-44)+' 121 q22 6 44 -1 q22 7 44 1',0,' stroke="#ffd24a" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"');
  return s;}
function bDove(l,hol){if(!l)return plot(342,70,52,56,'90',hol==='ny');var s='',x=368;
  s+=P('M'+(x-16)+' 126 l4 -60 M'+(x+16)+' 126 l-4 -60 M'+(x-14)+' 100 h28 M'+(x-15)+' 112 l30 -20',0,' stroke="'+K+'" stroke-width="2.4"');
  s+=R(x-22,40,44,28,l>=2?'#3f8fe0':'#c99a62')+P('M'+(x-28)+' 42 l28 -20 l28 20z',l>=2?'#ffcf40':'#c9765a')+R(x-8,48,16,12,'#233247',' stroke="'+K+'" stroke-width="1.2" rx="2"')+R(x-26,66,52,4,'#e0a85a',' stroke="'+K+'" stroke-width="1.2"');
  if(l>=2){s+=P('M'+x+' 22 v-14',0,' stroke="'+K+'" stroke-width="1.6"')+P('M'+x+' 8 h12 l-3 4 l3 4 h-12z','#e5484d',' stroke="'+K+'" stroke-width="1.2"')+dove(x-14,36,1)+dove(x+10,35,-1);}
  if(l>=3){s+=dove(x-40,14,1)+dove(x-58,28,1)+dove(x-24,6,-1)+P('M'+(x+26)+' 126 l-6 -56 M'+(x+34)+' 126 l-6 -56 M'+(x+22)+' 114 h9 M'+(x+21)+' 102 h9 M'+(x+20)+' 90 h9 M'+(x+19)+' 78 h9',0,' stroke="#8a5a3a" stroke-width="1.8"');}
  if(hol==='ny')s+=P('M'+(x-28)+' 42 l28 -20 l28 20 q-28 -6 -56 0z','#fff',' stroke="'+K+'" stroke-width="1.2"');
  return s;}
function dove(x,y,d){return '<g transform="translate('+x+' '+y+') scale('+d+' 1)">'+E(0,0,6,3.6,'#f4f6fa',' stroke="'+K+'" stroke-width="1.2"')+C(5,-2.5,2.6,'#f4f6fa',' stroke="'+K+'" stroke-width="1.2"')+P('M-2 -1 l-4 -6 l6 3',0,' stroke="'+K+'" stroke-width="1.2" fill="#dfe6f0"')+P('M7.5 -2.5 l2.5 .8',0,' stroke="#ff7a1a" stroke-width="1.4"')+'</g>';}
function bKiosk(l,hol){if(!l)return plot(272,124,56,52,'100',hol==='ny');var s='',x=299;
  s+=R(x-26,124,52,52,'#3f8fe0')+R(x-20,134,40,22,'#bfe0f2',' stroke="'+K+'" stroke-width="1.6" rx="2"')+R(x-26,170,52,6,'#2a5d99',' stroke="'+K+'" stroke-width="1.4"');
  s+=R(x-28,108,56,16,l>=3?'#ffcf40':'#fffaf0',' stroke="'+K+'" stroke-width="1.8" rx="3"')+T(x,120,l>=3?'СОЮЗПЕЧАТЬ':'ПЕЧАТЬ',l>=3?7.4:9);
  if(l>=2){s+=P('M'+(x-30)+' 128 h60 l-4 8 h-52z','#e5484d')+P('M'+(x-22)+' 128 l-2 8 M'+(x-8)+' 128 v8 M'+(x+8)+' 128 v8 M'+(x+22)+' 128 l2 8',0,' stroke="#fff" stroke-width="2.4"');
    s+=R(x-16,140,10,13,'#fffaf0',' stroke="'+K+'" stroke-width="1" ')+R(x-4,140,10,13,'#ffe9a8',' stroke="'+K+'" stroke-width="1"')+R(x+8,140,10,13,'#fffaf0',' stroke="'+K+'" stroke-width="1"');}
  // дядя Коля в окошке (филателист)
  s+=head('kolya',x-15,136,30);
  if(l>=3)s+=(hol?'':E(x,116,34,10,'rgba(255,230,120,.35)',''))+R(x+18,150,8,10,'#fff',' stroke="'+K+'" stroke-width="1" stroke-dasharray="1.5 1.5"');
  if(hol==='ny')s+=P('M'+(x-28)+' 108 q28 -8 56 0 v3 h-56z','#fff',' stroke="'+K+'" stroke-width="1.2"');
  return s;}
function bFlow(l,hol){if(!l)return plot(134,218,118,40,'110',hol==='ny');var s='',fl=hol==='ny';
  s+=R(136,234,114,22,fl?'#f4f8fb':'#8a5a3a',' stroke="'+K+'" stroke-width="1.8" rx="4"');
  for(var x=138;x<=248;x+=10)s+=P('M'+x+' 258 v-24 l3 -4 l3 4 v24',fl?'#fff':'#fffaf0',' stroke="'+K+'" stroke-width="1.2"');
  if(l>=2&&!fl){var col=['#e5484d','#ffcf40','#ff7a1a','#fff','#e5484d','#c86dd7'];for(var i=0;i<8;i++){var fx=146+i*13;s+=P('M'+fx+' 236 v-10',0,' stroke="#2fa84f" stroke-width="2"')+C(fx,224,4,col[i%6],' stroke="'+K+'" stroke-width="1.2"');}}
  if(l>=3)s+=swan(226,226,fl);
  return s;}
function swan(x,y,fl){return E(x,y+6,16,7,fl?'#fff':'#f4f6fa')+P('M'+(x+10)+' '+(y+4)+' q8 -6 4 -16 q-2 -6 4 -8 l6 2',0,' stroke="'+K+'" stroke-width="3.4" stroke-linecap="round"')+P('M'+(x+10)+' '+(y+4)+' q8 -6 4 -16 q-2 -6 4 -8 l6 2',0,' stroke="#f4f6fa" stroke-width="1.6" stroke-linecap="round"')+P('M'+(x+20)+' '+(y-18)+' l4 1',0,' stroke="#ff7a1a" stroke-width="2"')+R(x-18,y+11,36,4,'#3a3a3a',' stroke="'+K+'" stroke-width="1" rx="2"');}
function bPlay(l,hol){if(!l)return plot(6,206,108,50,'120',hol==='ny');var s='',fl=hol==='ny';
  // песочница с грибком
  s+=R(10,236,46,18,'#e0a85a',' stroke="'+K+'" stroke-width="1.8" rx="2"')+R(14,238,38,10,fl?'#fff':'#f2d48a',' stroke="none"')+P('M33 236 v-26',0,' stroke="'+K+'" stroke-width="3"')+P('M15 214 q18 -18 36 0z','#e5484d')+C(25,208,2,'#fff','')+C(38,206,2.2,'#fff','')+C(44,211,1.6,'#fff','');
  if(l>=2)s+=P('M64 254 l8 -46 l8 46 M96 254 l8 -46 l8 46 M72 208 h32',0,' stroke="'+K+'" stroke-width="2.6"')+P('M84 208 v28 M92 208 v28',0,' stroke="'+K+'" stroke-width="1.2"')+R(80,236,16,4,'#3f8fe0',' stroke="'+K+'" stroke-width="1.2"');
  if(l>=3)s+=head('valerka',74,206,26)+R(80,226,14,10,'#ff7a1a',' stroke="'+K+'" stroke-width="1.2" rx="4"');
  if(hol==='ny')s+=snowman(122,236);
  return s;}
function bCups(l,hol,n){var s='',x=254,y=24;
  if(!l)return '<g class="ydplot">'+R(x-2,y-2,28,32,'none',' stroke="'+K+'" stroke-width="1.6" stroke-dasharray="4 3"')+'</g>';
  s+=R(x,y,24,28,l>=3?'#ffe9a8':'#cfe8f6',' stroke="'+K+'" stroke-width="1.8" rx="2"');
  if(l>=2)s+=P('M'+x+' '+y+' q6 10 2 28 h-2z M'+(x+24)+' '+y+' q-6 10 -2 28 h2z','#e5484d',' stroke="'+K+'" stroke-width="1"')+R(x-3,y+22,30,4,'#b9783a',' stroke="'+K+'" stroke-width="1.2"');
  var k=Math.max(1,Math.min(4,n||1));for(var i=0;i<k;i++)s+=cup(x+5+i*5.5,y+21,i%2?'#c9d2da':'#ffcf40',.42);
  if(l>=3)s+=P('M'+(x-4)+' '+(y-3)+' q16 8 32 0',0,' stroke="#ff7a1a" stroke-width="1.6" stroke-dasharray="1 4" stroke-linecap="round"');
  return s;}
function cup(x,y,c,k){k=k||1;return '<g transform="translate('+x+' '+y+') scale('+k+')">'+P('M-7 -18 h14 v6 q0 9 -7 10 q-7 -1 -7 -10z',c,' stroke="'+K+'" stroke-width="2"')+P('M-7 -15 q-5 0 -4 4 q1 3 4 3 M7 -15 q5 0 4 4 q-1 3 -4 3',0,' stroke="'+K+'" stroke-width="1.8"')+R(-2,-3,4,3,c,' stroke="'+K+'" stroke-width="1.6"')+R(-6,0,12,3,c,' stroke="'+K+'" stroke-width="1.6"')+'</g>';}
YD.cup=cup;
function bYard(l,hol){var s='';
  if(l>=2){[146,262].forEach(function(x){s+=P('M'+x+' 186 v-56 q0 -6 8 -6',0,' stroke="'+K+'" stroke-width="2.6"')+P('M'+(x+5)+' 124 h9 l-2 5 h-5z',hol||l>=2?'#ffd24a':'#fffaf0',' stroke="'+K+'" stroke-width="1.4"');});}
  if(l>=3){s+=P('M346 256 v-40 M386 256 v-40',0,' stroke="'+K+'" stroke-width="3"')+P('M346 218 h40',0,' stroke="#c9d2da" stroke-width="2.4"')+P('M346 218 h40',0,' stroke="'+K+'" stroke-width=".8"');
    var c=['#ff7a1a','#3f8fe0','#2fa84f','#e5484d','#ffcf40'];for(var i=0;i<5;i++)s+=R(184+i*14,203,12,9,'none',' stroke="'+c[i]+'" stroke-width="1.8"');}
  return s;}
function pumpkin(x,y,k){k=k||1;return '<g transform="translate('+x+' '+y+') scale('+k+')">'+E(0,0,9,7,'#ff7a1a')+P('M-3 -6 q3 6 0 12 M3 -6 q-3 6 0 12',0,' stroke="'+K+'" stroke-width="1"')+P('M0 -7 v-4',0,' stroke="#2fa84f" stroke-width="2.4"')+P('M-5 -1 l2 -2 l2 2z M1 -1 l2 -2 l2 2z M-4 3 q4 3 8 0',  '#ffe08a',' stroke="'+K+'" stroke-width=".8"')+'</g>';}
function snowman(x,y){return C(x,y,9,'#fff')+C(x,y-14,6.5,'#fff')+P('M'+(x-1)+' '+(y-14)+' h6',0,' stroke="#ff7a1a" stroke-width="2"')+R(x-5,y-25,10,6,K,'')+C(x-2,y-16,.9,K,'')+C(x+2,y-16,.9,K,'');}
YD.pumpkin=pumpkin;YD.snowman=snowman;YD.dove=dove;

/* --- украшения (сезон, наборы, узелок): id → рисунок на своём месте; YD.DEC регистрирует season.js --- */
YD.DEC={};
YD.decOwned=function(){return (S.ydD||[]).filter(function(k){return YD.DEC[k];});};
YD.decOn=function(k){return (S.ydD||[]).indexOf(k)>=0&&!(S.ydH&&S.ydH[k]);};
YD.addDec=function(k){if(!Array.isArray(S.ydD))S.ydD=[];if(S.ydD.indexOf(k)<0)S.ydD.push(k);};

/* --- праздничные слои --- */
function sky(hol){if(hol==='hw')return '<defs><linearGradient id="ydSkyH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a5c"/><stop offset=".7" stop-color="#c0566a"/><stop offset="1" stop-color="#f3a35a"/></linearGradient></defs>'+R(0,0,400,140,'url(#ydSkyH)','')+C(360,22,12,'#fff3b0','')+C(365,19,10,'#3b2a5c','');
  if(hol==='ny')return '<defs><linearGradient id="ydSkyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14224d"/><stop offset="1" stop-color="#3b5aa8"/></linearGradient></defs>'+R(0,0,400,140,'url(#ydSkyN)','')+
    '<g fill="#fff">'+[[330,10],[380,30],[300,6],[360,52],[392,8]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1.4"/>';}).join('')+'</g>';
  return '<defs><linearGradient id="ydSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3f4"/><stop offset="1" stop-color="#d8f1fb"/></linearGradient></defs>'+R(0,0,400,140,'url(#ydSky)','')+E(372,36,16,6,'#fff','')+E(386,30,10,6,'#fff','');}
function holTop(hol){var s='';
  if(hol==='hw'){s+=P('M0 0 q20 14 0 30 M0 0 q30 6 34 0 M0 0 l26 20 M8 6 q6 -2 6 -6 M12 15 q8 -2 9 -8 M4 18 q8 0 10 -6',0,' stroke="#fff" stroke-width="1" opacity=".8"');
    [[300,30],[340,50],[285,64]].forEach(function(b){s+='<path d="M'+b[0]+' '+b[1]+' q-6 -6 -12 -2 q4 2 4 6 q2 -3 8 -1 q6 -2 8 1 q0 -4 4 -6 q-6 -4 -12 2z" fill="#233247"/>';});
    s+=pumpkin(222,183,1.1)+pumpkin(98,183,.9)+pumpkin(282,182,.8);}
  if(hol==='ny'){var f='';for(var i=0;i<46;i++){var x=(i*53)%400,y=(i*37)%250;f+='<circle cx="'+x+'" cy="'+y+'" r="'+(i%3?1.3:2)+'"/>';}s+='<g fill="#fff" opacity=".85" class="ydsnow">'+f+'</g>';
    s+=P('M0 16 q50 12 100 0 q50 12 100 0 q50 12 100 0',0,' stroke="'+K+'" stroke-width="1"');var gl=['#e5484d','#ffcf40','#3f8fe0','#2fa84f'];
    for(var j=0;j<15;j++){var gx=10+j*20,gy=16+Math.sin((gx%100)/100*Math.PI)*6;s+=C(gx,gy+3,2.6,gl[j%4],' stroke="'+K+'" stroke-width=".8"');}}
  return s;}
YD.holTop=holTop;

// сцена двора целиком. o: {lv:[8], hol, dec:[ids], cups:n, hot:bool}
YD.scene=function(o){o=o||{};var lv=o.lv||YD.levels(),hol=o.hol!=null?o.hol:YD.hol(),s='';
  var dec=(o.dec||YD.decOwned().filter(YD.decOn)).map(function(k){return YD.DEC[k];}).filter(Boolean);
  s+=sky(hol)+trees(hol)+house(lv[0]>=3,hol)+ground(lv[7],hol);
  s+=bCups(lv[6],hol,o.cups!=null?o.cups:(YD.cupCount?YD.cupCount():0));
  dec.filter(function(d){return d.z===0;}).forEach(function(d){s+=d.d(hol);});
  s+=bDove(lv[2],hol)+bKiosk(lv[3],hol)+bGaz(lv[1],hol)+bBench(lv[0],hol)+bYard(lv[7],hol);
  dec.filter(function(d){return d.z===1;}).forEach(function(d){s+=d.d(hol);});
  s+=bPlay(lv[5],hol)+bFlow(lv[4],hol);
  dec.filter(function(d){return d.z!==0&&d.z!==1;}).forEach(function(d){s+=d.d(hol);});
  s+=holTop(hol);
  if(o.hot)HOT.forEach(function(h,i){s+='<rect class="ydhot" data-b="'+i+'" x="'+h[0]+'" y="'+h[1]+'" width="'+h[2]+'" height="'+h[3]+'" fill="rgba(0,0,0,0)" stroke="none"/>';});
  return '<svg class="ydscn" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Мой двор">'+s+'</svg>';};

/* ---------- ЭКРАН «ДВОР» (#scr-yard): сцена + подвкладки ---------- */
var TABS=[{id:'yard',n:'Двор',ic:'🏠'}],cur='yard',back=null;
YD.tab=function(t){TABS.push(t);TABS.sort(function(a,b){return (a.o||0)-(b.o||0);});};
function ensureScreen(){var sc=Q('scr-yard');if(sc)return sc;sc=document.createElement('section');sc.id='scr-yard';sc.className='screen ydscr';
  sc.innerHTML='<header class="gh"><button class="icon" id="ydBack" aria-label="Назад">←</button><div class="gt"><div id="ydTitle">Мой двор</div><div id="ydSub" class="sub"></div></div><button class="pill sm" id="ydCoins">💰 0</button></header>'+
    '<div class="ydbody"><div class="ydtabs" id="ydTabs" role="tablist"></div><div class="ydpane" id="ydPane"></div></div>';
  var app=Q('app')||document.body;app.appendChild(sc);
  Q('ydBack').onclick=function(){YD.snd('tap');YD.close();};
  Q('ydCoins').onclick=function(){try{openCoins(function(){YD.open(cur);});}catch(e){}};
  return sc;}
YD.close=function(){var b=back;back=null;if(typeof b==='function')b();else try{if(window.UI&&UI.has&&UI.has('menu'))UI.go('menu');else openMenu();}catch(e){try{openMenu();}catch(x){}}YD.homeRefresh();};
YD.open=function(tab,bk){ensureScreen();if(tab&&TABS.some(function(t){return t.id===tab;}))cur=tab;if(bk)back=bk;
  try{hideModal();}catch(e){}try{if(window.__show)__show('scr-yard');else show('scr-yard');}catch(e){try{show('scr-yard');}catch(x){}}try{if(window.LK)LK.scene('dim');}catch(e){}
  try{STAT.screen('yard');}catch(e){}YD.render();};
YD.render=function(){if(!Q('scr-yard'))return;try{Q('ydCoins').textContent='💰 '+YD.coins();}catch(e){}
  Q('ydTabs').innerHTML=TABS.map(function(t){var dot=t.dot&&t.dot();return '<button class="ydtab'+(t.id===cur?' on':'')+'" role="tab" data-t="'+t.id+'" aria-selected="'+(t.id===cur)+'">'+t.ic+' '+t.n+(dot?'<i class="yddot"></i>':'')+'</button>';}).join('');
  Q('ydTabs').querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){YD.snd('tap');cur=b.dataset.t;YD.render();};});
  var t=TABS.filter(function(x){return x.id===cur;})[0]||TABS[0],pane=Q('ydPane');Q('ydTitle').textContent=t.id==='yard'?'Мой двор':t.n;
  Q('ydSub').textContent=t.sub?t.sub():'';pane.className='ydpane yp-'+t.id;
  try{if(t.id==='yard')renderYard(pane);else t.render(pane);}catch(e){YD.err('render',e);pane.innerHTML='<p class="ydnote">Не получилось открыть. Попробуй ещё раз.</p>';}
  pane.scrollTop=0;try{if(window.LK&&LK.scan)LK.scan(pane);}catch(e){}};
YD.cur=function(){return cur;};
// обновление при смене монет (покупка, ролик)
try{var uc0=window.updCoins;if(typeof uc0==='function')window.updCoins=function(){var r=uc0.apply(this,arguments);try{if(Q('ydCoins'))Q('ydCoins').textContent='💰 '+YD.coins();}catch(e){}return r;};}catch(e){}

function renderYard(el){var lv=YD.levels(),d=YD.district(),tot=YD.total(),hol=YD.hol(),nb=YD.nextB();
  var h='<div class="ydstage" id="ydStage">'+YD.scene({hot:true})+(hol?'<div class="ydhol">'+YD.HOL[hol].ic+' '+YD.HOL[hol].n+'</div>':'')+'</div>';
  h+='<div class="ydprog"><div class="ydbar"><i style="width:'+Math.round(tot/24*100)+'%"></i></div><span><b>'+tot+'</b> из 24 улучшений<br><small>вложено '+YD.spent()+' из '+YD.ct(YD.BTOT)+'</small></span></div>';
  if(YD.extraTop)h+=YD.extraTop();
  h+='<div class="ydlist">'+B.map(function(b,i){var l=lv[i],nx=l<3?l+1:0,need=nx?YD.needDist(i,nx):0,lock=nx&&d<need,c=nx?b.c[l]:0,can=nx&&!lock&&YD.coins()>=c;
    var st='';for(var k=1;k<=3;k++)st+='<i class="'+(k<=l?'on':'')+'"></i>';
    return '<div class="ydb'+(l>=3?' done':'')+'" data-b="'+i+'"><span class="ydbi">'+bIcon(i,l)+'</span><span class="ydbt"><b>'+b.n+'</b><span class="ydst">'+st+'</span><small>'+
      (l?b.g[l-1]:'Ещё не построено')+'</small>'+(nx?'<small class="ydnx">Ур. '+nx+': '+b.g[nx-1]+'</small>':'')+'</span>'+
      (nx?(lock?'<span class="ydlock">🔒 район<br>«'+YD.DIST[need]+'»</span>':'<button class="btn '+(can?'accent':'')+' ydbuy noenter" data-buy="'+i+'"'+(can?'':' aria-disabled="true"')+'>'+YD.ct(c)+'</button>'):'<span class="ydok">✓ готово</span>')+'</div>';}).join('')+'</div>';
  if(YD.extraBottom)h+=YD.extraBottom();
  h+='<p class="ydnote">Постройки — для красоты и удобства: на ответы они не влияют. Новые уровни открываются карьерой знатока (ты сейчас: район «'+YD.DIST[d]+'»).</p>';
  el.innerHTML=h;
  el.querySelectorAll('[data-buy]').forEach(function(b){b.onclick=function(e){e.stopPropagation();buyAsk(+b.dataset.buy);};});
  el.querySelectorAll('.ydb').forEach(function(r){r.onclick=function(){bInfo(+r.dataset.b);};});
  el.querySelectorAll('.ydhot').forEach(function(r){r.addEventListener('click',function(){var i=+r.getAttribute('data-b');var row=el.querySelector('.ydb[data-b="'+i+'"]');if(row){row.classList.add('hl');setTimeout(function(){row.classList.remove('hl');},1200);}bInfo(i);});});
  if(YD.bindExtra)YD.bindExtra(el);}
function bIcon(i,l){var vb=['18 82 112 96','140 92 124 92','322 0 78 130','262 100 74 80','128 196 128 64','0 190 124 70','244 16 40 40','140 180 260 80'][i];
  var lv=[0,0,0,0,0,0,0,0];lv[i]=Math.max(1,l);var hol='';
  var s=i===0?bBench(lv[0],hol):i===1?bGaz(lv[1],hol):i===2?bDove(lv[2],hol):i===3?bKiosk(lv[3],hol):i===4?bFlow(lv[4],hol):i===5?bPlay(lv[5],hol):i===6?(R(244,16,40,40,'#f3e3c6','')+bCups(lv[6],hol,3)):(ground(Math.max(1,l),'')+bYard(Math.max(2,l),''));
  return '<svg viewBox="'+vb+'" class="'+(l?'':'ghost')+'" aria-hidden="true">'+s+'</svg>';}
function bInfo(i){var b=B[i],l=YD.lv(i),nx=l<3?l+1:0,need=nx?YD.needDist(i,nx):0,lock=nx&&YD.district()<need,c=nx?b.c[l]:0;
  var h='<h2>'+b.ic+' '+b.n+'</h2><div class="ydbig">'+bIcon(i,nx||3).replace('class="ghost"','')+'</div><div class="ydlvls">'+b.g.map(function(g,k){return '<div class="'+(k<l?'on':k===l?'nx':'')+'"><b>'+(k+1)+'</b><span>'+g+'</span><i>'+(k<l?'✓':YD.ct(b.c[k]))+'</i></div>';}).join('')+'</div>';
  if(i===3)h+='<p class="ydnote">Киоск открывает филателиста дяди Коли: недостающие марки за монеты (вкладка «Марки»).</p>';
  if(i===6)h+='<p class="ydnote">Кубки Лиги двора и Кубка выходного дня встают на окно — их видно со двора.</p>';
  var row='';
  if(nx){if(lock)row='<p class="goal">🔒 Уровень '+nx+' откроется в районе «'+YD.DIST[need]+'». Отвечай верно — очки знатока ведут по районам.</p>';
    else if(YD.coins()>=c)row='<div class="row"><button class="btn accent" id="ydDo">Построить · '+YD.ct(c)+'</button></div>';
    else{row='<p class="goal">Не хватает '+YD.ct(c-YD.coins())+'. Монеты — за лестницу, викторину дня, лигу и кубок.</p>';if(window.TD&&typeof TD.stashNeed==='function')row+='<div class="row"><button class="btn noenter" id="ydStash">Заначка Михалыча</button></div>';}}
  try{modal(h+row+'<div class="row"><button class="btn" id="mCancel">Закрыть</button></div>');}catch(e){return;}
  if(Q('ydDo'))Q('ydDo').onclick=function(){hideModal();doBuild(i);};
  if(Q('ydStash'))Q('ydStash').onclick=function(){hideModal();try{TD.stashNeed(c);}catch(e){}};
  Q('mCancel').onclick=function(){hideModal();};}
function buyAsk(i){var l=YD.lv(i),c=B[i].c[l];if(l>=3)return;if(YD.coins()<c){bInfo(i);return;}doBuild(i);}
function doBuild(i){if(!YD.build(i))return;YD.render();var st=Q('ydStage');if(st){st.classList.remove('bump');void st.offsetWidth;st.classList.add('bump');}
  var b=B[i],l=YD.lv(i);YD.toast(b.ic+' '+b.n+': уровень '+l+'!');
  try{var hot=document.querySelector('#ydStage .ydhot[data-b="'+i+'"]');if(hot&&window.FX&&FX.burst){var r=hot.getBoundingClientRect();FX.burst((r.left+r.width/2)/innerWidth,(r.top+r.height/2)/innerHeight,24,'coin');}}catch(e){}}

/* ---------- главный экран: карточка «Мой двор» (гнездо homeSlots UX; до гнезда — сами в меню) ---------- */
var HL=[]; // строки карточки от модулей: {pri, f()→{ic,t,a(tab)} | null}
YD.homeLine=function(o){HL.push(o);HL.sort(function(a,b){return (a.pri||50)-(b.pri||50);});};
YD.dot=function(){return TABS.some(function(t){try{return t.dot&&t.dot();}catch(e){return false;}});};
YD.homeCard=function(){var nb=YD.nextB(),lines=[];
  HL.forEach(function(o){try{var r=o.f();if(r)lines.push(r);}catch(e){}});
  if(nb)lines.push({ic:B[nb.i].ic,t:nb.ok?'Следующее: '+B[nb.i].n.toLowerCase()+' — '+YD.ct(nb.c):'Двор растёт с карьерой знатока',a:'yard'});
  lines=lines.slice(0,3);
  var h='<div class="ydhome" id="ydHome"><button class="ydhsc noenter" data-a="yard" aria-label="Мой двор">'+YD.scene({})+'<b class="ydhlab">🏡 Мой двор'+(YD.dot()?'<i class="yddot"></i>':'')+'</b></button>'+
    '<div class="ydhl">'+lines.map(function(x){return '<button class="ydhr noenter" data-a="'+x.a+'"><span>'+x.ic+'</span><em>'+YD.esc(x.t)+'</em><i>›</i></button>';}).join('')+'</div></div>';
  return {html:h,bind:function(el){(el||document).querySelectorAll('#ydHome [data-a]').forEach(function(b){b.onclick=function(){YD.snd('tap');YD.open(b.dataset.a);};});}};};
var HOMEMODE='';
YD.homeRefresh=function(){if(HOMEMODE!=='fb')return;var old=Q('ydHomeWrap'),ms=document.querySelector('#scr-menu .mscroll');if(!ms)return;
  var c=YD.homeCard(),w=old||document.createElement('div');w.id='ydHomeWrap';w.innerHTML=c.html;
  if(!old){var ref=Q('btnDaily')||Q('btnPlay');if(ref&&ref.parentNode===ms)ms.insertBefore(w,ref.nextSibling);else ms.appendChild(w);}
  c.bind(w);try{if(window.LK&&LK.scan)LK.scan(w);}catch(e){}};
function homeFallback(){var H=window.homeSlots;
  // гнёзда UX (js/ui-core.js): карточка в ленте главного, вкладка «Двор» в нижней панели, экраны для UI.go
  try{if(Array.isArray(H)){H.push({id:'yard',order:60,render:function(){return YD.homeCard().html;},mount:function(el){YD.homeCard().bind(el);}});
    if(Array.isArray(window.navSlots))navSlots.push({id:'yard',order:10,ic:'🏠',t:'Двор',go:'yard',dot:function(){try{return YD.dot();}catch(e){return false;}}});
    if(window.UI&&UI.screen){UI.screen('yard',function(o){YD.open(o&&o.tab||(typeof o==='string'?o:''));});['stamps','league','season'].forEach(function(t){UI.screen('yard-'+t,function(){YD.open(t);});});}
    HOMEMODE='ux';try{if(typeof uiHome==='function'&&Q('scr-menu')&&Q('scr-menu').classList.contains('on'))uiHome();}catch(e){}return;}}catch(e){}
  HOMEMODE='fb';var om=window.openMenu;if(typeof om==='function')window.openMenu=function(){var r=om.apply(this,arguments);try{YD.homeRefresh();}catch(e){}return r;};
  YD.homeRefresh();}

/* ---------- запуск: после остальных файлов потока (stamps/league/season регистрируются синхронно) ---------- */
YD.start=function(){if(YD.started)return;YD.started=true;hookAnswers();YD.fire('start');homeFallback();
  if(/[?&]yard=/.test(location.search)){var m=/[?&]yard=([a-z]+)/.exec(location.search);setTimeout(function(){YD.open(m&&m[1]);},50);}};
setTimeout(YD.start,0);
if(typeof window.__test==='object')try{window.__test.YD=YD;}catch(e){}
})();
