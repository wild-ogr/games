/* Дворовая викторина — ЛИГА ДВОРА и КУБОК ВЫХОДНОГО ДНЯ (поток YARD, 09.10.2026). Журнал: viktorina-boost/logs/YARD.md; 04-meta-economy.md §2.5.
   Механика лиги — порт «Лиги двора» Рыбалки (~/Projects/rybak/js/meta-league.js): 8 участников — ты и 7 соседей, неделя с понедельника,
   бронза → серебро → золото; 1–2 место — вверх, 7–8 — вниз; не играл неделю — остаёшься. Соседи — персонажи игры (так и подписаны),
   их очки — честная модель (умение и дни игры), одинаковая у всех игроков (зерно — неделя и лига); таблица меняется в течение дня.
   Очки дня = очки знатока за верные ответы (цена вопроса priceOf, табло — тоже) + бонус табло дня (YARD.boardDay), не больше 2500 в день.
   Очки недели = сумма 5 лучших дней (пропуск двух дней не вредит, «гриндом» не берётся) + бонус Кубка выходного дня.
   Награда 1–3 места: монеты по лиге (бронза 100/60/40, серебро 200/120/80, золото 400/240/160), марка серии «Лига двора», кубок на полку у окна.
   Кубок выходного дня (Сб–Вс, с района «Улица»): сетка 1/4 → 1/2 → финал против соседей нарастающей силы. Матч — на табло BOARD (BOARD.match),
   пока его нет — «быстрый матч» на 6 вопросов (свой модал). Один проход в день бесплатно; после проигрыша — «ещё попытка» за ролик (по нужде, 1 раз в день).
   VK «Таблица друзей» не делаем: таблица VK у приложения одна и уже занята рейтингом викторины дня.
   Сохранение: S.lgaL (лига 0–2), S.lgaW (неделя), S.lgaP [очки 7 дней], S.lgaQ (бонус кубка недели), S.lgaH {неделя: место·10+лига}, S.lgaT (кубков лиги),
   S.lgaR (итог прошлой недели — показать), S.lgaK {w, r, d, a, x, n, m} — кубок (неделя, пройдено кругов, день, попыток сегодня, ролик сегодня, кубков всего, матчей). */
(function(){
'use strict';
var YD=window.YD;if(!YD)return;
var esc=YD.esc,K=YD.svg.K;
var LG=[{n:'Бронзовая лига',s:'Бронза',c:'#d9965a',c2:'#8a5528',pay:[100,60,40],cup:150},
        {n:'Серебряная лига',s:'Серебро',c:'#d3dbe2',c2:'#7d8a96',pay:[200,120,80],cup:200},
        {n:'Золотая лига',s:'Золото',c:'#ffcf40',c2:'#b8860b',pay:[400,240,160],cup:300}];
var DAYCAP=2500,BEST=5,UP=2,DOWN=2;
// соседи: n — имя, h — привычка, m — очков в игровой день (среднее), a — дней игры [от, до], av — лицо [фон, кожа, убор, цвет убора, борода, очки, волосы]
var BOTS=[
 [{n:'Витька с пятого этажа',h:'отвечает, пока мама не позвала',m:520,a:[2,5],av:['#8fc1d4','#f0c29a','cap','#d9452b',0,0,'#6b4a2a']},
  {n:'Тётя Шура',h:'разгадывает кроссворды на балконе',m:640,a:[3,6],av:['#e6b8a2','#f2c7a5','scarf','#3f7fbf',0,0,'#8a8a8a']},
  {n:'Лёнька-велосипедист',h:'заглядывает между поездками',m:460,a:[2,4],av:['#a9cf9a','#e7b48c','cap','#2fa84f',0,0,'#3a2a1a']},
  {n:'Баба Нюра',h:'всё помнит про старое кино',m:720,a:[3,5],av:['#f0d48a','#efc39f','scarf','#5a8a3a',0,1,'#bbbbbb']},
  {n:'Студентка Катя',h:'играет в автобусе',m:600,a:[2,5],av:['#9ab8e8','#f2c8a0','none','',0,1,'#a85a2a']},
  {n:'Дворник Ильич',h:'знает каждый угол района',m:560,a:[3,6],av:['#d4b48a','#e2ad86','cap','#3a5a8a',1,0,'#5a3a1a']},
  {n:'Галя из двенадцатой',h:'спорит с телевизором',m:500,a:[2,5],av:['#b9a6d6','#eab894','none','',0,0,'#4a2e1e']}],
 [{n:'Пётр Семёнович',h:'читает энциклопедию за чаем',m:980,a:[3,6],av:['#7fb0c8','#eab48c','cap','#2f2f2f',0,1,'#9a9a9a']},
  {n:'Зоя-библиотекарь',h:'знает, где какая книга',m:1100,a:[4,6],av:['#e8a8b8','#f0c4a4','none','',0,1,'#6a4a3a']},
  {n:'Кузьмич с гаража',h:'разбирается в технике',m:900,a:[3,6],av:['#8ab0a0','#dca47e','ushanka','#5a4a3a',1,0,'#6a6a6a']},
  {n:'Таксист Гена',h:'слушает радиовикторины',m:1020,a:[3,6],av:['#c8b080','#e0a880','cap','#6a3a2a',0,0,'#4a3a2a']},
  {n:'Нина Павловна',h:'учительница географии',m:1180,a:[4,6],av:['#c8a8d8','#f0c4a4','none','',0,1,'#8a8a8a']},
  {n:'Шахматист Аркадий',h:'думает три хода вперёд',m:960,a:[3,5],av:['#a0b4c8','#d8a07a','none','',0,1,'#2a2a2a']},
  {n:'Рыжий Серёга',h:'угадывает — и попадает',m:880,a:[3,6],av:['#e8c080','#f2c4a0','none','',0,0,'#d2691e']}],
 [{n:'Профессор Лев Борисович',h:'тридцать лет читал лекции',m:1720,a:[4,7],av:['#9ab0c0','#d8a07a','none','',1,1,'#cccccc']},
  {n:'Тамара-кроссвордистка',h:'решает кроссворд за пять минут',m:1600,a:[5,7],av:['#88c0c0','#ecbc98','scarf','#2a7a6a',0,0,'#5a3a2a']},
  {n:'Дед Архип',h:'видел всё своими глазами',m:1500,a:[4,7],av:['#c9a96e','#e2b48c','ushanka','#4a3a2a',1,0,'#eeeeee']},
  {n:'Инженер Смирнов',h:'проверяет ответы расчётом',m:1680,a:[5,7],av:['#7a9ab8','#dca47e','cap','#1f2f4a',0,1,'#4a4a4a']},
  {n:'Отличница Света',h:'всё учит наизусть',m:1560,a:[4,7],av:['#e0c070','#f2c8a0','none','',0,0,'#3a2a1a']},
  {n:'Полковник Громов',h:'командует всем двором',m:1760,a:[5,7],av:['#a0a890','#d8a07a','captain','#2f4a2f',0,0,'#8a8a8a']},
  {n:'Эрудит Вадим',h:'знает понемногу обо всём',m:1640,a:[4,7],av:['#b8c49a','#e3b08a','none','',1,0,'#6a5a4a']}]];
YD.LG=LG;YD.BOTS=BOTS;

/* ---------- сохранение ---------- */
YD.fix(function(){['lgaL','lgaW','lgaQ','lgaT','lgaG'].forEach(YD.fNum);S.lgaL=Math.min(2,Math.floor(S.lgaL));
  if(!Array.isArray(S.lgaP)||S.lgaP.length!==7)S.lgaP=[0,0,0,0,0,0,0];S.lgaP=S.lgaP.map(function(x){return typeof x==='number'&&x>0?Math.min(DAYCAP,Math.round(x)):0;});
  YD.fObjNum('lgaH');var hk=Object.keys(S.lgaH).sort(function(a,b){return a-b;});if(hk.length>12)hk.slice(0,hk.length-12).forEach(function(k){delete S.lgaH[k];});
  if(S.lgaR!=null&&!YD.isO(S.lgaR))delete S.lgaR;
  if(!YD.isO(S.lgaK))S.lgaK={};['w','r','d','a','x','n','m'].forEach(function(k){if(typeof S.lgaK[k]!=='number'||!(S.lgaK[k]>=0))S.lgaK[k]=0;});
  if(!S.lgaW)S.lgaW=YD.week();});
YD.merge(function(loc,d){var a=YD.num(loc.lgaW),b=YD.num(d.lgaW);
  if(b>a){S.lgaW=b;S.lgaL=YD.num(d.lgaL);S.lgaP=Array.isArray(d.lgaP)?d.lgaP.slice(0,7):[0,0,0,0,0,0,0];S.lgaQ=YD.num(d.lgaQ);}
  else if(a===b){S.lgaL=Math.max(YD.num(loc.lgaL),YD.num(d.lgaL));if(Array.isArray(d.lgaP))for(var i=0;i<7;i++)S.lgaP[i]=Math.max(+S.lgaP[i]||0,+d.lgaP[i]||0);S.lgaQ=Math.max(YD.num(loc.lgaQ),YD.num(d.lgaQ));}
  YD.mObjMax(d,'lgaH');YD.mMax(d,'lgaT');
  if(YD.isO(d.lgaK)){var k=S.lgaK,e=d.lgaK;k.n=Math.max(k.n||0,e.n||0);k.m=Math.max(k.m||0,e.m||0);if((e.w||0)>(k.w||0)||(e.w===k.w&&(e.r||0)>(k.r||0))){k.w=e.w;k.r=e.r;}
    if((e.d||0)>(k.d||0)){k.d=e.d;k.a=e.a||0;k.x=e.x||0;}else if(e.d===k.d){k.a=Math.max(k.a||0,e.a||0);k.x=Math.max(k.x||0,e.x||0);}}});

/* ---------- очки игрока ---------- */
function roll(){var w=YD.week();if(w===S.lgaW)return;settle();S.lgaW=w;S.lgaP=[0,0,0,0,0,0,0];S.lgaQ=0;YD.save();}
function addDay(n){if(!(n>0))return;roll();var d=YD.wday();S.lgaP[d]=Math.min(DAYCAP,(S.lgaP[d]||0)+Math.round(n));}
YD.onAnswer(function(a){if(a.ok&&a.mode!=='bday'&&a.mode!=='bcup'&&a.mode!=='cup')addDay(a.price||100);});
YD.boardDay=function(score){if(!(score>0))return;addDay(Math.min(500,score/5));YD.save();};
// табло дня (BOARD.days(): {ГГГГММДД: очки}) — к очкам дня недели w
function bdays(w){var o=[0,0,0,0,0,0,0];try{if(window.BOARD&&typeof BOARD.days==='function'){var D=BOARD.days()||{},mon=w*7-3;for(var i=0;i<7;i++){var t=new Date((mon+i)*864e5),k=t.getUTCFullYear()*10000+(t.getUTCMonth()+1)*100+t.getUTCDate();o[i]=Math.max(0,+D[k]||+D[String(k)]||0);}}}catch(e){}return o;}
function dayPts(w,P){var b=bdays(w);return (P||S.lgaP).map(function(x,i){return Math.min(DAYCAP,(+x||0)+b[i]);});}
function myScore(P,q){var a=(P||dayPts(S.lgaW)).slice().sort(function(x,y){return y-x;}),s=0;for(var i=0;i<BEST;i++)s+=a[i]||0;return s+(q==null?S.lgaQ||0:q);}
YD.lgScore=function(){roll();return myScore();};

/* ---------- соседи ---------- */
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
var CACHE={};
// очки соседа по дням недели (7 чисел) — одинаково у всех: зерно — неделя, лига, сосед
function botDays(w,l,j){var key=w+':'+l+':'+j;if(CACHE[key])return CACHE[key];var b=BOTS[l][j],R=rng(w*7919+l*104729+j*1299709+17);
  var n=b.a[0]+Math.floor(R()*(b.a[1]-b.a[0]+1)),days=[0,1,2,3,4,5,6];for(var i=6;i>0;i--){var x=Math.floor(R()*(i+1)),t=days[i];days[i]=days[x];days[x]=t;}
  var form=.8+R()*.4,out=[0,0,0,0,0,0,0];for(var q=0;q<n;q++){var v=b.m*form*(.65+R()*.7);out[days[q]]=Math.min(DAYCAP,Math.round(v/10)*10);}
  var cup=R()<(.25+l*.15)?[100,200,400][Math.floor(R()*3)]:0;
  return (CACHE[key]={d:out,cup:cup});}
// очки соседа к моменту: дни до вчера — целиком, сегодня — по часам
function botScore(w,l,j,upto,frac){var o=botDays(w,l,j),a=[];for(var i=0;i<7;i++)a.push(i<upto?o.d[i]:i===upto?Math.round(o.d[i]*frac/10)*10:0);
  var s=myScore(a,0);if(upto>=6||(upto===5&&frac>.8))s+=o.cup;return s;}
function table(w,l,upto,frac,mine){var rows=[];for(var j=0;j<7;j++)rows.push({j:j,s:botScore(w,l,j,upto,frac)});rows.push({me:1,s:mine});
  rows.sort(function(a,b){return b.s-a.s||(a.me?-1:b.me?1:a.j-b.j);});return rows;}
function place(rows){for(var i=0;i<rows.length;i++)if(rows[i].me)return i+1;return 8;}
function zone(p,l){return p<=UP&&l<2?'up':p>8-DOWN&&l>0?'down':'';}
function frac(){var d=YD.date();return (d.getHours()*60+d.getMinutes())/1440;}
YD.lgTable=function(){roll();return table(S.lgaW,S.lgaL,YD.wday(),frac(),myScore());};
YD.lgPlace=function(){return place(YD.lgTable());};

/* ---------- итог недели ---------- */
function settle(){var w=S.lgaW;if(!w||YD.week()<=w)return;var mine=myScore(dayPts(w)),l=S.lgaL||0;
  if(!(mine>0)){S.lgaR={w:w,l:l,p:0,z:'',c:0,nl:l,s:0};return;}
  var rows=table(w,l,7,1,mine),p=place(rows),z=zone(p,l),c=p<=3?LG[l].pay[p-1]:0;
  S.lgaH[w]=p*10+l;if(z==='up')S.lgaL=l+1;else if(z==='down')S.lgaL=l-1;
  if(c){S.coins=YD.coins()+c;try{STAT.earn('quest',c);}catch(e){}}
  if(p<=3)S.lgaT=(S.lgaT||0)+1;if(l===2&&p===1)S.lgaG=(S.lgaG||0)+1;
  S.lgaR={w:w,l:l,p:p,z:z,c:c,nl:S.lgaL,s:mine};
  YD.quiet=true;try{YD.stampGive('lg',0,'lg');if(p<=3)YD.stampGive('lg',l===0?1:l===1?3:5,'lg');if(z==='up')YD.stampGive('lg',l===0?2:4,'lg');
    if(l===2&&p===1)YD.stampGive('lg',6,'lg');if((S.lgaG||0)>=3)YD.stampGive('lg',7,'lg');}finally{YD.quiet=false;}
  YD.ev('lg',{w:w%1000,l:l,p:p,z:z||'-',c:c,s:mine});try{if(window.SEASON_ADD)SEASON_ADD(p<=3?[100,70,60][p-1]:40,'lg');}catch(e){}}
YD.fix(function(){if(YD.isO(S.lgaR)||!S.lgaW)return;}); // (место для будущих полей)
YD.cupCount=function(){return YD.num(S.lgaT)+YD.num((S.lgaK||{}).n);};
YD.lgName=function(l,short){var x=LG[l==null?S.lgaL||0:l]||LG[0];return short?x.s:x.n;};

/* ---------- значки и лица (свои рисунки; лица — порт Рыбалки) ---------- */
var BID=0;
function badge(l,sz){var x=LG[l]||LG[0],id='ydlb'+(BID++);sz=sz||44;
  return '<svg class="lgbadge" width="'+sz+'" height="'+sz+'" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="'+x.c+'"/><stop offset="1" stop-color="'+x.c2+'"/></linearGradient></defs>'+
  '<path d="M20 4h10l4 14H24zM34 4h10l-4 14H30z" fill="'+(l===2?'#e5484d':l===1?'#3f8fe0':'#2fa84f')+'" stroke="'+K+'" stroke-width="2" stroke-linejoin="round"/>'+
  '<circle cx="32" cy="38" r="21" fill="url(#'+id+')" stroke="'+K+'" stroke-width="2.5"/><circle cx="32" cy="38" r="14.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/>'+
  '<path d="M32 27 l3.3 6.8 7.4 1 -5.4 5.2 1.3 7.4 -6.6 -3.5 -6.6 3.5 1.3 -7.4 -5.4 -5.2 7.4 -1z" fill="#fff" stroke="'+x.c2+'" stroke-width="1.2" stroke-linejoin="round"/></svg>';}
YD.lgBadge=badge;
function face(av,sz){sz=sz||44;var bg=av[0],sk=av[1],hat=av[2],hc=av[3],beard=av[4],gl=av[5],hair=av[6],s='';
  s+='<circle cx="32" cy="32" r="31" fill="'+bg+'" stroke="'+K+'" stroke-width="2"/><path d="M11 58c3-11 10-15 21-15s18 4 21 15" fill="'+(hat==='scarf'?hc:'#4a5a6a')+'"/>';
  s+='<path d="M19 30c0-9 6-14 13-14s13 5 13 14" fill="'+hair+'"/><circle cx="32" cy="31" r="12.5" fill="'+sk+'" stroke="'+K+'" stroke-width="1.6"/>';
  if(hat==='cap')s+='<path d="M19 27c1-9 25-10 26 0z" fill="'+hc+'" stroke="'+K+'" stroke-width="1.4"/><path d="M38 26.5h11c0 1.8-2 2.8-5 2.8h-6z" fill="'+hc+'" stroke="'+K+'" stroke-width="1.2"/>';
  else if(hat==='ushanka')s+='<path d="M18 28c0-11 28-11 28 0v2H18z" fill="'+hc+'" stroke="'+K+'" stroke-width="1.4"/><rect x="17" y="27" width="5" height="12" rx="2.5" fill="'+hc+'"/><rect x="42" y="27" width="5" height="12" rx="2.5" fill="'+hc+'"/>';
  else if(hat==='captain')s+='<path d="M19 26c0-7 26-7 26 0z" fill="#f4f4f4" stroke="'+K+'" stroke-width="1.2"/><rect x="19" y="24" width="26" height="4" fill="'+hc+'"/><path d="M21 28h22l-2 3H23z" fill="#1a1a1a"/><circle cx="32" cy="26" r="1.8" fill="#ffcf40"/>';
  else if(hat==='scarf')s+='<path d="M18 30c0-12 28-12 28 0-3-4-7-6-14-6s-11 2-14 6z" fill="'+hc+'" stroke="'+K+'" stroke-width="1.2"/><path d="M19 30l-3 10 7-6zM45 30l3 10-7-6z" fill="'+hc+'"/>';
  s+='<circle cx="27.5" cy="32" r="1.6" fill="'+K+'"/><circle cx="36.5" cy="32" r="1.6" fill="'+K+'"/>';
  if(gl)s+='<circle cx="27.5" cy="32" r="3.6" fill="none" stroke="'+K+'" stroke-width="1.3"/><circle cx="36.5" cy="32" r="3.6" fill="none" stroke="'+K+'" stroke-width="1.3"/><path d="M31 32h2" stroke="'+K+'" stroke-width="1.3"/>';
  s+='<circle cx="24" cy="36" r="2.2" fill="#e88" opacity=".35"/><circle cx="40" cy="36" r="2.2" fill="#e88" opacity=".35"/>';
  if(beard)s+='<path d="M21 35c0 12 22 12 22 0-3 5-19 5-22 0z" fill="'+hair+'" stroke="'+K+'" stroke-width="1.2"/>';
  else s+='<path d="M28.5 38.5c2 1.6 5 1.6 7 0" stroke="#8a4a3a" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  return '<svg class="lgface" width="'+sz+'" height="'+sz+'" viewBox="0 0 64 64" aria-hidden="true">'+s+'</svg>';}
YD.lgFace=face;
var ME_AV=['#ffcf7a','#e8b48e','cap','#ff7a1a',0,0,'#5a3a22'];
function myFace(sz){return face(ME_AV,sz);}
var WD=['пн','вт','ср','чт','пт','сб','вс'];
function leftTxt(){var d=6-YD.wday(),h=24-YD.date().getHours();return d>0?'до итогов '+d+' '+YD.pl(d,'день','дня','дней'):'итоги сегодня в полночь (через '+h+' ч)';}

/* ---------- окно итога прошлой недели ---------- */
function showResult(then){var r=S.lgaR;if(!r){if(then)then();return false;}delete S.lgaR;YD.save();
  var h='<h2>🥇 Итоги недели</h2>';
  if(!r.p)h+='<div class="lgres">'+badge(r.l,56)+'<div><b>'+LG[r.l].n+'</b><small>На прошлой неделе ты не играл — остаёшься в этой лиге. Новая неделя уже идёт!</small></div></div>';
  else h+='<div class="lgres '+(r.z||'')+'">'+badge(r.nl,56)+'<div><b>'+LG[r.l].s+': '+r.p+' место из 8</b><small>'+(r.z==='up'?'Повышение! Теперь — '+LG[r.nl].n.toLowerCase()+'.':r.z==='down'?'Спускаешься в '+LG[r.nl].n.toLowerCase().replace('лига','лигу')+'. Отыграешься!':'Остаёшься в лиге.')+
    ' Очков за неделю: '+r.s+'.'+(r.c?' Награда: +'+YD.ct(r.c)+(r.p<=3?' и кубок на полку у окна.':''):'')+'</small></div></div>';
  try{modal(h+'<div class="row"><button class="btn accent" id="mCancel">Дальше</button></div>');if(r.c||r.z==='up')try{FX.burst(.5,.3,30,'coin');}catch(e){}}catch(e){if(then)then();return false;}
  YD.Q('mCancel').onclick=function(){hideModal();if(then)then();};return true;}
YD.lgShowResult=showResult;

/* ---------- вкладка «Лига» ---------- */
function render(el){roll();var DP=dayPts(S.lgaW),w=S.lgaW,l=S.lgaL||0,d=YD.wday(),mine=myScore(),rows=table(w,l,d,frac(),mine),me=place(rows),z=zone(me,l),played=mine>0;
  var h='<div class="lghead">'+badge(l,64)+'<div><b>'+LG[l].n+'</b><small>Неделя '+WD[0]+'–'+WD[6]+' · '+leftTxt()+'</small><small>Твои очки: <b>'+mine+'</b> · сегодня '+(DP[d]||0)+' из '+DAYCAP+'</small></div></div>';
  var zt=!played?'Соседи уже отвечают. Сыграй лестницу или табло — каждый верный ответ идёт в очки недели!'
    :z==='up'?'Ты в зоне повышения: удержись до понедельника — и в '+LG[l+1].n.toLowerCase().replace('лига','лигу')+'!'
    :z==='down'?'Зона вылета: ещё немного верных ответов — и выберешься!'
    :me<=3?'Ты в тройке призёров: '+YD.ct(LG[l].pay[me-1])+' и кубок на полку!':'До тройки призёров — '+(me-3)+' '+YD.pl(me-3,'место','места','мест')+'.';
  h+='<p class="goal lgzt '+(z||'')+'">'+zt+'</p><div class="lgt">'+rows.map(function(r,i){var p=i+1,zz=zone(p,l),b=r.me?null:BOTS[l][r.j];
    return '<div class="lgr'+(r.me?' lgme':'')+(zz?' '+zz:'')+'"><b class="lgp">'+p+'</b>'+(r.me?myFace(40):face(b.av,40))+'<span class="lgn"><b>'+(r.me?'Ты':esc(b.n))+'</b><small>'+(r.me?(played?'5 лучших дней недели':'ещё не играл на этой неделе'):'сосед · '+esc(b.h))+'</small></span><i class="lgg">'+(r.s||'—')+'</i></div>';}).join('')+'</div>';
  h+='<div class="lgdays">'+WD.map(function(n,i){return '<span class="'+(i===d?'on':'')+(i>d?' fu':'')+'"><small>'+n+'</small><b>'+(DP[i]?DP[i]:i<d?'·':'')+'</b></span>';}).join('')+'</div>';
  h+='<p class="ydnote">Очки недели — сумма 5 лучших дней: за каждый верный ответ — его цена (100–500) и счёт табло дня, до '+DAYCAP+' в день; плюс Кубок выходного дня. Итог — в понедельник: 1–2 место — в лигу выше, 7–8 — ниже. Призы: '+LG[l].pay.map(function(c,i){return (i+1)+' место +'+YD.ct(c);}).join(' · ')+'. Соседи — персонажи игры, их очки считает честная модель, одинаковая у всех игроков.</p>';
  h+=cupBlock();
  el.innerHTML=h;bindCup(el);}
YD.tab({id:'league',n:'Лига',ic:'🥇',o:20,render:render,sub:function(){return YD.lgName();},dot:function(){return !!S.lgaR||cupDot();}});
YD.homeLine({pri:20,f:function(){if(S.lgaR)return {ic:'🥇',t:'Итоги недели в лиге — загляни!',a:'league'};var p=YD.lgPlace(),l=S.lgaL||0,z=zone(p,l);
  return {ic:'🥇',t:LG[l].s+': ты '+p+'-й из 8'+(z==='up'?' · зона повышения':z==='down'?' · зона вылета':''),a:'league'};}});
YD.homeLine({pri:10,f:function(){if(!cupOpen()||!cupDot())return null;return {ic:'🏆',t:'Кубок выходного дня — сегодня!',a:'league'};}});
// открыть вкладку лиги — сначала итог прошлой недели
var r0=YD.render;YD.render=function(){r0.apply(this,arguments);try{if(YD.cur()==='league'&&S.lgaR)showResult(function(){YD.render();});}catch(e){}};

/* ================= КУБОК ВЫХОДНОГО ДНЯ ================= */
var RN=['1/4 финала','1/2 финала','Финал'];
function cupWeekend(){var d=YD.wday();return d===5||d===6;}
function cupUnlocked(){return YD.district()>=2;}
function cupOpen(){return cupWeekend()&&cupUnlocked();}
function cupState(){var k=S.lgaK,w=YD.week(),dn=YD.dayNo();if(k.w!==w){k.w=w;k.r=0;}if(k.d!==dn){k.d=dn;k.a=0;k.x=0;}return k;}
function cupDot(){if(!cupOpen())return false;var k=cupState();return k.r<3&&k.a===0;}
var CH={valerka:'Валерка',valya:'Тётя Валя',kolya:'Дядя Коля',mityai:'Дед Митяй',zina:'Баба Зина'};
function rivals(){var w=YD.week(),l=S.lgaL||0,R=rng(w*31+l*7+3),ids=['valerka','valya','kolya','mityai'];for(var i=3;i>0;i--){var x=Math.floor(R()*(i+1)),t=ids[i];ids[i]=ids[x];ids[x]=t;}
  ids=ids.slice(0,2).concat(['zina']);
  return ids.map(function(id,r){return {id:id,n:CH[id],sk:Math.min(.2,r*.04+l*.04),qs:Math.min(.85,.46+r*.1+l*.06)};});}
function rvFace(r,sz){try{if(window.LK&&LK.face)return LK.face(r.id).replace('<svg ','<svg width="'+sz+'" height="'+sz+'" ');}catch(e){}return '<b>'+r.n[0]+'</b>';}
function cupBlock(){var h='<div class="cupb"><div class="cuph">'+YD.cup(20,26,'#ffcf40',1.25).replace(/^/,'<svg viewBox="0 0 40 30" width="44" height="34" aria-hidden="true">')+'</svg><div><b>Кубок выходного дня</b><small>Суббота и воскресенье · три матча против соседей</small></div></div>';
  if(!cupUnlocked())return h+'<p class="ydnote">🔒 Откроется в районе «Улица» карьеры знатока.</p></div>';
  var k=cupState(),rv=rivals(),l=S.lgaL||0;
  h+='<div class="cupbr">'+rv.map(function(r,i){var st=k.r>i?'win':k.r===i&&cupWeekend()?'now':'';return '<div class="cupm '+st+'"><small>'+RN[i]+'</small>'+rvFace(r,34)+'<b>'+esc(r.n)+'</b>'+(st==='win'?'<i>✓</i>':'')+'</div>';}).join('<span class="cupar">›</span>')+'</div>';
  if(!cupWeekend()){var dd=5-YD.wday();h+='<p class="goal">Кубок — в субботу и воскресенье'+(dd>0?' (через '+dd+' '+YD.pl(dd,'день','дня','дней')+')':'')+'. Победа: '+YD.ct(LG[l].cup)+', кубок на полку, редкая марка и +400 очков лиги.</p></div>';return h;}
  if(k.r>=3)return h+'<p class="goal">🏆 Кубок этой недели твой! Следующий — в субботу.</p></div>';
  if(k.a===0)h+='<div class="row"><button class="btn accent noenter" id="cupGo">🏆 '+(k.r?'Продолжить: '+RN[k.r]:'Играть кубок')+'</button></div>';
  else if(!k.x&&typeof adBtnOk==='function'&&adBtnOk())h+='<div class="row"><button class="btn noenter" id="ydAd">📺 Ещё попытка за ролик</button></div><p class="ydnote">Бесплатная попытка — раз в день. Завтра — снова даром'+(YD.wday()===6?' (в следующую субботу)':'')+'.</p>';
  else h+='<p class="ydnote">Попытки на сегодня закончились'+(YD.wday()===5?' — завтра можно ещё раз.':'.')+'</p>';
  h+='<p class="ydnote">Только бесплатные подсказки: монеты и покупки в кубке силы не дают. Выигранные круги сохраняются до конца выходных.</p></div>';return h;}
function bindCup(el){var b=el.querySelector('#cupGo');if(b)b.onclick=function(){var k=cupState();k.a++;YD.save();playRound();};
  var a=el.querySelector('#ydAd');if(a)a.onclick=function(){if(typeof adHold==='function'&&adHold('cup'))return;try{STAT.place('cup');}catch(e){}
    var go=function(){var k=cupState();if(k.x)return;k.x=1;YD.save();playRound();};
    try{showRewarded(go,function(w){if(w==='wait')YD.render();},function(){var k=cupState();if(!k.x){k.x=1;k.a=Math.max(0,k.a-1);YD.save();}return 'попытка кубка — можно играть';});}catch(e){}};}
function playRound(){var k=cupState(),r=k.r,rv=rivals()[r],l=S.lgaL||0;k.m++;if(k.m===1)YD.stampGive('cup',0,'cup');YD.save();
  var title='Кубок выходного дня · '+RN[r],seed=YD.week()*1000+r*10+k.a+k.x*5;
  var end=function(res){var k=cupState();YD.ev('cup',{r:r,w:res.win?1:0,me:res.me,rv:res.rv});
    if(res.win){k.r=r+1;var c=[30,60,LG[l].cup][r],pts=[100,200,400][r];S.lgaQ=(S.lgaQ||0)+pts;roll();YD.give(c,'quest');
      if(r===0)YD.stampGive('cup',1,'cup');if(r===1)YD.stampGive('cup',2,'cup');
      if(r===2){k.n=(k.n||0)+1;YD.stampGive('cup',3,'cup');if(k.n>=2)YD.stampGive('cup',4,'cup');if(k.n>=4)YD.stampGive('cup',5,'cup');if(k.n>=7)YD.stampGive('cup',6,'cup');if(k.n>=10)YD.stampGive('cup',7,'cup');try{if(window.SEASON_ADD)SEASON_ADD(80,'cup');}catch(e){}}
      else try{if(window.SEASON_ADD)SEASON_ADD(20,'cup');}catch(e){}}
    YD.save();cupResult(r,res,rv);};
  // матч на табло (BOARD.start): 3 темы (финал — 5), без подарка/торга, финал — без «Финала у подъезда»; соперник один
  if(window.BOARD&&typeof BOARD.start==='function'){try{BOARD.start({mode:'cup',title:title,sub:'против: '+rv.n,seed:YD.week()*1000+r*10+1,cols:r===2?5:3,mult:1,rivals:[{id:rv.id,n:rv.n,sk:rv.sk}],noGift:r<2,noBet:r<2,noFinal:r<2,
      onEnd:function(res){var my=+res.score||0,o=(res.rivals&&res.rivals[0])?+res.rivals[0].sc||0:0;end({win:!res.quit&&(res.win||my>=o)&&my>0,me:my,rv:o});}});return;}catch(e){YD.err('board',e);}}
  quick({title:title,rv:rv,seed:seed,end:end});}
function cupResult(r,res,rv){var k=cupState(),l=S.lgaL||0,h;
  if(res.win)h='<h2>'+(r===2?'🏆 Кубок твой!':'✓ Победа! '+RN[r])+'</h2><p class="cupsc"><b>'+res.me+'</b> : '+res.rv+'</p><p>'+(r===2?'Кубок выходного дня встаёт на полку у окна. Награда: +'+YD.ct(LG[l].cup)+', +400 очков лиги.':'Награда: +'+YD.ct([30,60][r])+', +'+[100,200][r]+' очков лиги. Дальше — '+RN[r+1]+'.')+'</p>';
  else h='<h2>Эх, '+esc(rv.n)+' сильнее…</h2><p class="cupsc"><b>'+res.me+'</b> : '+res.rv+'</p><p>Пройденные круги сохраняются: следующая попытка — с '+RN[r]+'.</p>';
  var nx=res.win&&r<2;
  try{modal(h+'<div class="row">'+(nx?'<button class="btn accent" id="cupNx">Дальше: '+RN[r+1]+'</button>':'')+'<button class="btn" id="mCancel">'+(nx?'Потом':'К лиге')+'</button></div>');if(res.win)try{FX.burst(.5,.3,res.win&&r===2?50:24,'coin');}catch(e){}}catch(e){}
  if(YD.Q('cupNx'))YD.Q('cupNx').onclick=function(){hideModal();playRound();};
  YD.Q('mCancel').onclick=function(){hideModal();YD.open('league');};}

/* --- «быстрый матч» на 6 вопросов (пока нет BOARD.match): цены 100…500, соперник отвечает честно по умению --- */
function openTopicKeys(){try{if(window.VTOP&&VTOP.openList){var a=VTOP.openList(YD.now()).map(function(t){return t.k||t;}).filter(function(k){return BYT[k]&&BYT[k].length;});if(a.length)return a;}}catch(e){}
  try{return TK.filter(function(k){return BYT[k]&&BYT[k].length;});}catch(e){return [];}}
function quick(o){var R=rng(o.seed),keys=openTopicKeys(),D=[1,1,2,2,3,3],qs=[],used={};
  for(var i=0;i<6;i++){for(var tr=0;tr<30;tr++){var t=keys[Math.floor(R()*keys.length)],pool=(BYT[t]||[]).filter(function(q){return q.d===D[i]&&!used[q.i];});if(!pool.length)continue;var q=pool[Math.floor(R()*pool.length)];used[q.i]=1;qs.push(q);break;}}
  var G2={i:0,me:0,rv:0,qs:qs,log:[]},rv=o.rv;
  function priceQ(q){return YD.price(q);}
  function ask(){var q=G2.qs[G2.i];if(!q){finish();return;}var p=priceQ(q),perm=[0,1,2,3];for(var j=3;j>0;j--){var x=Math.floor(R()*(j+1)),t=perm[j];perm[j]=perm[x];perm[x]=t;}
    var h='<div class="qm"><div class="qmh"><span class="qmme">'+myFace(36)+'<b>'+G2.me+'</b></span><span class="qmt">'+esc(o.title)+'<br><small>вопрос '+(G2.i+1)+' из '+G2.qs.length+'</small></span><span class="qmrv"><b>'+G2.rv+'</b>'+rvFace(rv,36)+'</span></div>'+
      '<div class="qmq"><i class="qmp">'+p+'</i><span>'+(TN[q.t]?TN[q.t].ic+' '+esc(TN[q.t].n):'')+'</span><p>'+esc(q.q)+'</p></div><div class="qma">'+perm.map(function(k,j){return '<button class="ans noenter" data-k="'+k+'"><i>'+'АБВГ'[j]+'</i><span>'+esc(q.a[k])+'</span></button>';}).join('')+'</div>'+
      '<p class="qmn" id="qmN">'+esc(rv.n)+' думает…</p></div>';
    try{modal(h);YD.Q('mcard').classList.add('ydqm');}catch(e){return;}
    var done=false;YD.Q('mcard').querySelectorAll('.qma .ans').forEach(function(b){b.onclick=function(){if(done)return;done=true;var k=+b.dataset.k,ok=k===0;
      var rk=q.d===1?rv.qs+.15:q.d===3?rv.qs-.15:rv.qs,rok=R()<rk;
      b.classList.add(ok?'ok':'no');if(!ok){var c=YD.Q('mcard').querySelector('.qma .ans[data-k="0"]');if(c)c.classList.add('ok');}
      if(ok)G2.me+=p;if(rok)G2.rv+=p;G2.log.push([ok,rok]);try{ok?SND.right():SND.wrong();}catch(e){}
      try{markSeen(q);}catch(e){}
      var A={id:q.i,ok:ok?1:0,mode:'bcup',step:G2.i+1,price:p,hint:'',t:q.t,d:q.d,n:1,fin:1};try{if(window.UI&&typeof UI.answered==='function'&&YD.hook==='ux')UI.answered(A);else YD.answer(A);}catch(e){}
      YD.Q('qmN').innerHTML=(ok?'✓ Верно! +'+p:'✗ Мимо.')+' · '+esc(rv.n)+(rok?' ответил верно':' ошибся')+'<br><button class="btn accent noenter" id="qmNx">'+(G2.i+1<G2.qs.length?'Дальше →':'Итог')+'</button>';
      YD.Q('qmNx').onclick=function(){G2.i++;ask();};};});}
  function finish(){try{YD.Q('mcard').classList.remove('ydqm');hideModal();}catch(e){}o.end({win:G2.me>=G2.rv&&G2.me>0,me:G2.me,rv:G2.rv});}
  ask();}
YD.quickMatch=quick;

YD.on('start',function(){roll();});
})();
