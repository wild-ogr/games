/* Выезд со двора — ЛИГА СОСЕДЕЙ (неделя) (поток YARD, 10.10.2026). Журнал: logs/YARD.md; 04 §2.6.
   Порт «Лиги двора» Рыбалки (~/Projects/rybak/js/meta-league.js) и Викторины (viktorina/js/league.js): 8 участников — ты и 7 соседей,
   неделя с понедельника; 4 лиги: подъезда → двора → района → города; 1–2 место — вверх, 7–8 — вниз; не играл неделю — остаёшься.
   Соседи — общие герои и имена серии (как в Рыбалке/Викторине), так и подписаны; их очки — честная модель (дни игры, умение),
   одинаковая у всех игроков (зерно — неделя и лига), таблица меняется в течение дня.
   Очки дня: за каждый пройденный двор 10 + 5×★ (+5 без аварий и подсказок), задание дня — ×2; не больше DAYCAP в день.
   Очки недели — сумма 5 лучших дней (два пропуска не вредят, «гриндом» не взять).
   Награда 1–3 места: монеты (растут с лигой и доской объявлений во дворе) + детали 🔩; первые три тройки — редкая машина в Автоальбом.
   Открывается с района «Квартал» карьеры (до CAR — с 20-го двора).
   Сохранение: S.lgaL (лига 0–3), S.lgaW (неделя), S.lgaP [очки 7 дней], S.lgaH {неделя: место·10+лига}, S.lgaT (троек всего), S.lgaR (итог прошлой недели — показать). */
(function(){
'use strict';
var MY=window.MY;if(!MY)return;
var esc=MY.esc,K=MY.svg.K;
var L=function(r,e){try{return LANG==='en'?e:r;}catch(x){return r;}};
var LG=[{n:'Лига подъезда',en:'Stairwell league',s:'Подъезд',se:'Stairwell',c:'#d9965a',c2:'#8a5528',pay:[150,90,60],pt:[20,14,10]},
        {n:'Лига двора',en:'Yard league',s:'Двор',se:'Yard',c:'#d3dbe2',c2:'#7d8a96',pay:[220,130,90],pt:[26,18,12]},
        {n:'Лига района',en:'District league',s:'Район',se:'District',c:'#ffcf40',c2:'#b8860b',pay:[300,180,120],pt:[32,22,15]},
        {n:'Лига города',en:'City league',s:'Город',se:'City',c:'#9fe0d0',c2:'#2a8a7a',pay:[400,240,160],pt:[40,28,18]}];
var DAYCAP=400,BEST=5,UP=2,DOWN=2;
// соседи: n — имя, h — привычка, m — очков в игровой день (среднее), a — дней игры [от, до], av — лицо [фон, кожа, убор, цвет убора, борода, очки, волосы]
var BOTS=[
 [{n:'Витька-школьник',en:'Vitka the schoolboy',h:'гоняет на велике между машинами',he:'rides his bike between the cars',m:150,a:[2,4],av:['#8fc1d4','#f0c29a','cap','#d9452b',0,0,'#6b4a2a']},
  {n:'Баба Нюра',en:'Granny Nyura',h:'паркует тележку с рассадой',he:'parks her seedling trolley',m:170,a:[2,5],av:['#f0d48a','#efc39f','scarf','#5a8a3a',0,1,'#bbbbbb']},
  {n:'Генка-дачник',en:'Genka the dacha man',h:'каждую пятницу — на дачу',he:'off to the dacha every Friday',m:140,a:[2,4],av:['#a9cf9a','#e7b48c','panama','#e8e0c8',0,0,'#3a2a1a']},
  {n:'Студентка Катя',en:'Katya the student',h:'учится на права',he:'learning to drive',m:160,a:[2,5],av:['#9ab8e8','#f2c8a0','none','',0,1,'#a85a2a']},
  {who:'valerka',n:'Валерка',en:'Valerka',h:'знает все машины во дворе',he:'knows every car in the yard',m:190,a:[3,5],av:['#ffd9a0','#f2c8a0','cap','#2f6fd0',0,0,'#7a4a22']},
  {who:'tolik',n:'Сосед Толик',en:'Tolik next door',h:'вечно под машиной',he:'always under a car',m:150,a:[2,4],av:['#d4b48a','#e2ad86','cap','#6b6f76',1,0,'#5a3a1a']},
  {n:'Галя из двенадцатой',en:'Galya from flat 12',h:'ставит «Оку» поперёк',he:'parks her Oka sideways',m:130,a:[2,4],av:['#b9a6d6','#eab894','none','',0,0,'#4a2e1e']}],
 [{who:'mihalych',n:'Михалыч',en:'Mikhalych',h:'дворник, гоняет машины с газона',he:'the janitor, chases cars off the lawn',m:220,a:[3,6],av:['#8ab0a0','#dca47e','ushanka','#5a4a3a',1,0,'#6a6a6a']},
  {n:'Таксист Гена',en:'Gena the taxi driver',h:'знает все дворы города',he:'knows every yard in town',m:250,a:[3,6],av:['#c8b080','#e0a880','cap','#6a3a2a',0,0,'#4a3a2a']},
  {who:'valya',n:'Тётя Валя',en:'Aunt Valya',h:'хлебный фургон к открытию',he:'the bread van by opening time',m:210,a:[3,5],av:['#e8a8b8','#f0c4a4','scarf','#c23b5a',0,0,'#4a2e1e']},
  {n:'Рыжий Серёга',en:'Ginger Seryoga',h:'выезжает задом с первого раза',he:'reverses out first time',m:230,a:[3,6],av:['#e8c080','#f2c4a0','none','',0,0,'#d2691e']},
  {n:'Дядя Гоша',en:'Uncle Gosha',h:'на «Ниве» до рассвета',he:'out in his Niva before dawn',m:240,a:[3,5],av:['#a0b4c8','#d8a07a','cap','#4a6a3a',1,0,'#2a2a2a']},
  {n:'Ольга-инструктор',en:'Olga the instructor',h:'учит парковаться всю улицу',he:'teaches the whole street to park',m:260,a:[3,6],av:['#c8a8d8','#f0c4a4','none','',0,1,'#a85a2a']},
  {n:'Кузьмич с гаража',en:'Kuzmich from the garages',h:'разбирает «Москвич» второй год',he:'two years rebuilding his Moskvich',m:200,a:[3,5],av:['#d4b48a','#dca47e','ushanka','#5a4a3a',1,0,'#6a6a6a']}],
 [{who:'mityai',n:'Дед Митяй',en:'Grandpa Mityai',h:'Запорожец «на рыбалку»',he:'Zaporozhets — off fishing',m:290,a:[4,6],av:['#c9a96e','#e2b48c','none','',1,0,'#eeeeee']},
  {n:'Шофёр Петрович',en:'Petrovich the driver',h:'тридцать лет за баранкой',he:'thirty years behind the wheel',m:310,a:[4,7],av:['#9ab0c0','#d8a07a','cap','#2f2f2f',1,0,'#cccccc']},
  {n:'Лидия Петровна',en:'Lidia Petrovna',h:'паркуется по линейке',he:'parks with a ruler',m:300,a:[4,6],av:['#c8a8d8','#f0c4a4','none','',0,1,'#8a8a8a']},
  {n:'Капитан Седов',en:'Captain Sedov',h:'командует всей стоянкой',he:'commands the whole car park',m:320,a:[4,7],av:['#7a9ab8','#dca47e','captain','#1f2f4a',1,0,'#dddddd']},
  {n:'Нина-водитель ПАЗика',en:'Nina the bus driver',h:'школьный рейс без опозданий',he:'never late on the school run',m:280,a:[4,6],av:['#88c0c0','#ecbc98','scarf','#2a7a6a',0,0,'#5a3a2a']},
  {n:'Анатолий-раллист',en:'Anatoly the rally driver',h:'чемпион района 1987 года',he:'district champion of 1987',m:330,a:[4,7],av:['#e0c070','#e0a880','panama','#f0f0e0',0,1,'#6a5a4a']},
  {n:'Егорыч тихий',en:'Quiet Egorych',h:'выезжает, пока все спят',he:'drives out while everyone sleeps',m:270,a:[4,6],av:['#eef3df','#e2b48c','straw','#e8c872',1,0,'#e3e6ea']}],
 [{who:'sansan',n:'Сан Саныч',en:'San Sanych',h:'чемпион города, физрук',he:'city champion, PE teacher',m:370,a:[5,7],av:['#b8c49a','#e3b08a','cap','#c0392b',0,0,'#9a9a9a']},
  {n:'Палыч-ветеран',en:'Palych the veteran',h:'возил ещё «Победу»',he:'drove a Pobeda back in the day',m:350,a:[5,7],av:['#9ab0c0','#d8a07a','ushanka','#3a3a3a',1,0,'#cccccc']},
  {n:'Инженер Смирнов',en:'Smirnov the engineer',h:'считает ходы на калькуляторе',he:'counts moves on a calculator',m:360,a:[5,7],av:['#7a9ab8','#dca47e','cap','#1f2f4a',0,1,'#4a4a4a']},
  {n:'Тамара-диспетчер',en:'Tamara the dispatcher',h:'знает, где какая машина',he:'knows where every car is',m:340,a:[5,7],av:['#88c0c0','#ecbc98','scarf','#2a7a6a',0,0,'#5a3a2a']},
  {n:'Полковник Громов',en:'Colonel Gromov',h:'командует всем двором',he:'commands the whole yard',m:380,a:[5,7],av:['#a0a890','#d8a07a','captain','#2f4a2f',0,0,'#8a8a8a']},
  {n:'Отличница Света',en:'Sveta the top student',h:'всё по правилам',he:'everything by the rules',m:330,a:[5,7],av:['#e0c070','#f2c8a0','none','',0,0,'#3a2a1a']},
  {n:'Дальнобойщик Вадим',en:'Vadim the trucker',h:'КамАЗ в любой двор',he:'a KamAZ into any yard',m:355,a:[5,7],av:['#c8b080','#e0a880','cap','#3a5a8a',1,0,'#4a3a2a']}]];
var NL=LG.length;MY.LG=LG;

/* ---------- сохранение ---------- */
MY.fix(function(){['lgaL','lgaW','lgaT'].forEach(MY.fNum);S.lgaL=Math.min(NL-1,Math.floor(S.lgaL));
  if(!Array.isArray(S.lgaP)||S.lgaP.length!==7)S.lgaP=[0,0,0,0,0,0,0];S.lgaP=S.lgaP.map(function(x){return typeof x==='number'&&x>0?Math.min(DAYCAP,Math.round(x)):0;});
  MY.fObjNum('lgaH');var hk=Object.keys(S.lgaH).sort(function(a,b){return a-b;});if(hk.length>12)hk.slice(0,hk.length-12).forEach(function(k){delete S.lgaH[k];});
  if(S.lgaR!=null&&!MY.isO(S.lgaR))delete S.lgaR;if(!S.lgaW)S.lgaW=MY.week();});
MY.merge(function(loc,d){var a=MY.num(loc.lgaW),b=MY.num(d.lgaW);
  if(b>a){S.lgaW=b;S.lgaL=Math.min(NL-1,MY.num(d.lgaL));S.lgaP=Array.isArray(d.lgaP)?d.lgaP.slice(0,7):[0,0,0,0,0,0,0];}
  else if(a===b){S.lgaL=Math.max(MY.num(loc.lgaL),MY.num(d.lgaL));if(Array.isArray(d.lgaP))for(var i=0;i<7;i++)S.lgaP[i]=Math.max(+S.lgaP[i]||0,+d.lgaP[i]||0);}
  MY.mObjMax(d,'lgaH');MY.mMax(d,'lgaT');});

/* ---------- открыта ли ---------- */
MY.lgOpen=function(){return MY.dist()>=1;};
/* ---------- очки игрока ---------- */
function roll(){var w=MY.week();if(w===S.lgaW)return;settle();S.lgaW=w;S.lgaP=[0,0,0,0,0,0,0];MY.save();}
function addDay(n){if(!(n>0)||!MY.lgOpen())return;roll();var d=MY.wday();S.lgaP[d]=Math.min(DAYCAP,(S.lgaP[d]||0)+Math.round(n));}
MY.lgAdd=addDay; /* vy-park: очки лиги за «Парковку дня» (js/vymg-avtodrom.js) */
MY.onYard(function(r){if(!r||!r.ok)return;var st=Math.max(1,Math.min(3,r.stars|0)),p=10+5*st+(!r.crash&&!r.hint?5:0);if(r.daily||r.mode==='daily')p*=2;addDay(p);MY.save();});
function myScore(P){var a=(P||S.lgaP).slice().sort(function(x,y){return y-x;}),s=0;for(var i=0;i<BEST;i++)s+=a[i]||0;return s;}
MY.lgScore=function(){roll();return myScore();};

/* ---------- соседи ---------- */
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
var CACHE={};
function botDays(w,l,j){var key=w+':'+l+':'+j;if(CACHE[key])return CACHE[key];var b=BOTS[l][j],R=rng(w*7919+l*104729+j*1299709+29);
  var n=b.a[0]+Math.floor(R()*(b.a[1]-b.a[0]+1)),days=[0,1,2,3,4,5,6];for(var i=6;i>0;i--){var x=Math.floor(R()*(i+1)),t=days[i];days[i]=days[x];days[x]=t;}
  var form=.8+R()*.4,out=[0,0,0,0,0,0,0];for(var q=0;q<n;q++){var v=b.m*form*(.6+R()*.8);out[days[q]]=Math.min(DAYCAP,Math.round(v/5)*5);}
  return (CACHE[key]=out);}
function botScore(w,l,j,upto,frac){var o=botDays(w,l,j),a=[];for(var i=0;i<7;i++)a.push(i<upto?o[i]:i===upto?Math.round(o[i]*frac/5)*5:0);return myScore(a);}
function table(w,l,upto,frac,mine){var rows=[];for(var j=0;j<7;j++)rows.push({j:j,s:botScore(w,l,j,upto,frac)});rows.push({me:1,s:mine});
  rows.sort(function(a,b){return b.s-a.s||(a.me?-1:b.me?1:a.j-b.j);});return rows;}
function place(rows){for(var i=0;i<rows.length;i++)if(rows[i].me)return i+1;return 8;}
function zone(p,l){return p<=UP&&l<NL-1?'up':p>8-DOWN&&l>0?'down':'';}
function frac(){var d=MY.date();return (d.getHours()*60+d.getMinutes())/1440;}
MY.lgTable=function(){roll();return table(S.lgaW,S.lgaL,MY.wday(),frac(),myScore());};
MY.lgPlace=function(){return place(MY.lgTable());};
MY.lgName=function(l){var x=LG[l==null?S.lgaL||0:l]||LG[0];return L(x.n,x.en);};
function pay(l,p){var k=1+MY.fn('board');return {c:Math.round(LG[l].pay[p-1]*k/5)*5,p:LG[l].pt[p-1]};}

/* ---------- итог недели ---------- */
function settle(){var w=S.lgaW;if(!w||MY.week()<=w)return;var mine=myScore(),l=S.lgaL||0;
  if(!(mine>0)){S.lgaR={w:w,l:l,p:0,z:'',c:0,pt:0,nl:l,s:0};return;}
  var rows=table(w,l,7,1,mine),p=place(rows),z=zone(p,l),pr=p<=3?pay(l,p):{c:0,p:0},car=null;
  S.lgaH[w]=p*10+l;if(z==='up')S.lgaL=l+1;else if(z==='down')S.lgaL=l-1;
  if(pr.c){S.coins=MY.coins()+pr.c;try{STAT.earn('quest',pr.c);}catch(e){}}
  if(pr.p)MY.prt.add(pr.p,'lg',true);
  if(p<=3){S.lgaT=(S.lgaT||0)+1;try{if(window.ALB)car=ALB.league();}catch(e){}}
  S.lgaR={w:w,l:l,p:p,z:z,c:pr.c,pt:pr.p,nl:S.lgaL,s:mine,car:car||''};
  if(p<=3)try{if(MY.seaAdd)MY.seaAdd(50,'lg');}catch(e){}
  MY.ev('lg',{w:w%1000,l:l,p:p,z:z||'-',c:pr.c,s:mine});}

/* ---------- лица (порт Рыбалки/Викторины) и значок лиги ---------- */
var BID=0;
function badge(l,sz){var x=LG[l]||LG[0],id='mylb'+(BID++);sz=sz||44;
  return '<svg class="lgbadge" width="'+sz+'" height="'+sz+'" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="'+x.c+'"/><stop offset="1" stop-color="'+x.c2+'"/></linearGradient></defs>'+
  '<path d="M20 4h10l4 14H24zM34 4h10l-4 14H30z" fill="'+['#2fa84f','#3f8fe0','#e5484d','#7a4ad0'][l]+'" stroke="'+K+'" stroke-width="2" stroke-linejoin="round"/>'+
  '<circle cx="32" cy="38" r="21" fill="url(#'+id+')" stroke="'+K+'" stroke-width="2.5"/><circle cx="32" cy="38" r="14.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/>'+
  '<path d="M22 42 v-6 q0 -3 3 -4 l3 -5 h8 l3 5 q3 1 3 4 v6 z" fill="#fff" stroke="'+x.c2+'" stroke-width="1.4" stroke-linejoin="round"/><circle cx="26" cy="43" r="2.4" fill="'+x.c2+'"/><circle cx="38" cy="43" r="2.4" fill="'+x.c2+'"/></svg>';}
MY.lgBadge=badge;
function face(av,sz){sz=sz||44;var bg=av[0],sk=av[1],hat=av[2],hc=av[3],beard=av[4],gl=av[5],hair=av[6],s='';
  s+='<circle cx="32" cy="32" r="31" fill="'+bg+'" stroke="'+K+'" stroke-width="2"/><path d="M11 58c3-11 10-15 21-15s18 4 21 15" fill="'+(hat==='scarf'?hc:'#4a5a6a')+'"/>';
  s+='<path d="M19 30c0-9 6-14 13-14s13 5 13 14" fill="'+hair+'"/><circle cx="32" cy="31" r="12.5" fill="'+sk+'" stroke="'+K+'" stroke-width="1.6"/>';
  if(hat==='cap')s+='<path d="M19 27c1-9 25-10 26 0z" fill="'+hc+'" stroke="'+K+'" stroke-width="1.4"/><path d="M38 26.5h11c0 1.8-2 2.8-5 2.8h-6z" fill="'+hc+'" stroke="'+K+'" stroke-width="1.2"/>';
  else if(hat==='ushanka')s+='<path d="M18 28c0-11 28-11 28 0v2H18z" fill="'+hc+'" stroke="'+K+'" stroke-width="1.4"/><rect x="17" y="27" width="5" height="12" rx="2.5" fill="'+hc+'"/><rect x="42" y="27" width="5" height="12" rx="2.5" fill="'+hc+'"/>';
  else if(hat==='captain')s+='<path d="M19 26c0-7 26-7 26 0z" fill="#f4f4f4" stroke="'+K+'" stroke-width="1.2"/><rect x="19" y="24" width="26" height="4" fill="'+hc+'"/><path d="M21 28h22l-2 3H23z" fill="#1a1a1a"/><circle cx="32" cy="26" r="1.8" fill="#ffcf40"/>';
  else if(hat==='scarf')s+='<path d="M18 30c0-12 28-12 28 0-3-4-7-6-14-6s-11 2-14 6z" fill="'+hc+'" stroke="'+K+'" stroke-width="1.2"/><path d="M19 30l-3 10 7-6zM45 30l3 10-7-6z" fill="'+hc+'"/>';
  else if(hat==='panama'||hat==='straw')s+='<ellipse cx="32" cy="24" rx="17" ry="4" fill="'+hc+'" stroke="'+K+'" stroke-width="1.2"/><path d="M22 24c0-8 20-8 20 0z" fill="'+hc+'" stroke="'+K+'" stroke-width="1.2"/>';
  s+='<circle cx="27.5" cy="32" r="1.6" fill="'+K+'"/><circle cx="36.5" cy="32" r="1.6" fill="'+K+'"/>';
  if(gl)s+='<circle cx="27.5" cy="32" r="3.6" fill="none" stroke="'+K+'" stroke-width="1.3"/><circle cx="36.5" cy="32" r="3.6" fill="none" stroke="'+K+'" stroke-width="1.3"/><path d="M31 32h2" stroke="'+K+'" stroke-width="1.3"/>';
  s+='<circle cx="24" cy="36" r="2.2" fill="#e88" opacity=".35"/><circle cx="40" cy="36" r="2.2" fill="#e88" opacity=".35"/>';
  if(beard)s+='<path d="M24 36.5c2 2.4 14 2.4 16 0-1 2.6-15 2.6-16 0z" fill="'+hair+'" stroke="'+K+'" stroke-width="1"/>';
  else s+='<path d="M28.5 38.5c2 1.6 5 1.6 7 0" stroke="#8a4a3a" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  return '<svg class="lgface" width="'+sz+'" height="'+sz+'" viewBox="0 0 64 64" aria-hidden="true">'+s+'</svg>';}
function hero(b){if(!b.who)return '';try{if(window.VYPEOPLE&&VYPEOPLE.face){var f=VYPEOPLE.face(b.who,'lgface lghero');if(f)return '<span class="lghw">'+f+'</span>';}}catch(e){}return '';}
var ME_AV=['#ffcf7a','#e8b48e','cap','#ff7a1a',0,0,'#5a3a22'];
var WD=L('пн вт ср чт пт сб вс','Mo Tu We Th Fr Sa Su').split(' ');
function leftTxt(){var d=6-MY.wday(),h=24-MY.date().getHours();return d>0?L('до итогов '+d+' '+MY.pl(d,'день','дня','дней'),d+(d>1?' days':' day')+' to the results'):L('итоги сегодня в полночь (через '+h+' ч)','results tonight at midnight (in '+h+' h)');}

/* ---------- итог прошлой недели ---------- */
function showResult(then){var r=S.lgaR;if(!r){if(then)then();return false;}delete S.lgaR;MY.save();
  var h='<h2>🥇 '+L('Итоги недели','Week results')+'</h2>';
  if(!r.p)h+='<div class="lgres">'+badge(r.l,56)+'<div><b>'+MY.lgName(r.l)+'</b><small>'+L('На прошлой неделе ты не играл — остаёшься в этой лиге. Новая неделя уже идёт!','You didn’t play last week — you stay in this league. A new week has begun!')+'</small></div></div>';
  else{var z=r.z==='up'?L('Повышение! Теперь — ','Promoted! Now — ')+MY.lgName(r.nl)+'.':r.z==='down'?L('Спускаешься: ','Relegated: ')+MY.lgName(r.nl)+L('. Отыграешься!','. You’ll bounce back!'):L('Остаёшься в лиге.','You stay in the league.');
    h+='<div class="lgres '+(r.z||'')+'">'+badge(r.nl,56)+'<div><b>'+MY.lgName(r.l)+': '+r.p+L(' место из 8',' place of 8')+'</b><small>'+z+' '+L('Очков за неделю: ','Points this week: ')+r.s+'.'+(r.c?' '+L('Награда: +','Reward: +')+MY.ct(r.c)+' '+L('и','and')+' +'+r.pt+' 🔩.':'')+'</small></div></div>';
    if(r.car&&window.ALB)h+='<div class="albbig rust">'+ALB.svg(r.car,{rust:true,big:1})+'</div><p>'+L('За тройку — редкая машина в альбом: ','For the top 3 — a rare car for your album: ')+'<b>'+esc(ALB.nm(r.car))+'</b>. '+L('Ржавая — неси Толику.','Rusty — take it to Tolik.')+'</p>';}
  try{modal(h+'<div class="row">'+(r.car?'<button class="btn green" id="lgGo">🔧 '+L('К Толику','To Tolik')+'</button>':'')+'<button class="btn accent" id="mCancel">'+L('Дальше','Next')+'</button></div>');if(r.c||r.z==='up'){try{SND.win();}catch(e){}try{if(!MY.calm()&&typeof confetti==='function')confetti();}catch(e){}}}catch(e){if(then)then();return false;}
  MY.Q('mCancel').onclick=function(){hideModal();if(then)then();};if(MY.Q('lgGo'))MY.Q('lgGo').onclick=function(){hideModal();MY.open('garage');};return true;}
MY.lgShowResult=showResult;

/* ---------- вкладка «Лига» ---------- */
function render(el){if(!MY.lgOpen()){el.innerHTML='<div class="lghead">'+badge(0,64)+'<div><b>'+L('Лига соседей','Neighbours’ league')+'</b><small>'+L('Неделя против 7 соседей: двор за двором — очки.','A week against 7 neighbours: every yard earns points.')+'</small></div></div><p class="goal">🔒 '+L('Откроется в районе «Квартал» карьеры.','Opens in the “Block” career district.')+'</p>';return;}
  roll();var DP=S.lgaP,w=S.lgaW,l=S.lgaL||0,d=MY.wday(),mine=myScore(),rows=table(w,l,d,frac(),mine),me=place(rows),z=zone(me,l),played=mine>0;
  var h='<div class="lghead">'+badge(l,64)+'<div><b>'+MY.lgName(l)+'</b><small>'+L('Неделя пн–вс · ','Week Mon–Sun · ')+leftTxt()+'</small><small>'+L('Твои очки: ','Your points: ')+'<b>'+mine+'</b> · '+L('сегодня ','today ')+(DP[d]||0)+L(' из ',' of ')+DAYCAP+'</small></div></div>';
  var zt=!played?L('Соседи уже выезжают. Каждый пройденный двор — очки недели!','The neighbours are already driving. Every yard you clear earns weekly points!')
    :z==='up'?L('Ты в зоне повышения: удержись до понедельника!','You’re in the promotion zone: hold on until Monday!')
    :z==='down'?L('Зона вылета: ещё пара дворов — и выберешься!','Relegation zone: a couple more yards and you’re out of it!')
    :me<=3?L('Ты в тройке призёров: ','You’re in the top 3: ')+MY.ct(pay(l,me).c)+' + '+pay(l,me).p+' 🔩!':L('До тройки призёров — ','To the top 3 — ')+(me-3)+' '+MY.pl(me-3,'место','места','мест')+'.';
  h+='<p class="goal lgzt '+(z||'')+'">'+zt+'</p><div class="lgt">'+rows.map(function(r,i){var p=i+1,zz=zone(p,l),b=r.me?null:BOTS[l][r.j];
    return '<div class="lgr'+(r.me?' lgme':'')+(zz?' '+zz:'')+'"><b class="lgp">'+p+'</b>'+(r.me?face(ME_AV,40):hero(b)||face(b.av,40))+'<span class="lgn"><b>'+(r.me?L('Ты','You'):esc(L(b.n,b.en)))+'</b><small>'+(r.me?(played?L('5 лучших дней недели','your 5 best days'):L('ещё не играл на этой неделе','not played this week yet')):L('сосед · ','neighbour · ')+esc(L(b.h,b.he)))+'</small></span><i class="lgg">'+(r.s||'—')+'</i></div>';}).join('')+'</div>';
  h+='<div class="lgdays">'+WD.map(function(n,i){return '<span class="'+(i===d?'on':'')+(i>d?' fu':'')+'"><small>'+n+'</small><b>'+(DP[i]?DP[i]:i<d?'·':'')+'</b></span>';}).join('')+'</div>';
  var cars=window.ALB?ALB.CARS.filter(function(c){return c.src==='lg'&&!ALB.st(c.id);}).length:0;
  h+='<p class="mynote">'+L('Очки недели — 5 лучших дней: за двор 10 + 5 за каждую ★ (+5 без аварий и подсказок), задание дня — вдвойне, до '+DAYCAP+' в день. Итог — в понедельник: 1–2 место — в лигу выше, 7–8 — ниже. Призы: ','Weekly points are your 5 best days: 10 per yard + 5 per ★ (+5 with no crashes or hints), the daily challenge counts double, up to '+DAYCAP+' a day. Results on Monday: places 1–2 go up, 7–8 go down. Prizes: ')+
    [1,2,3].map(function(p){var x=pay(l,p);return p+L(' место ',' place ')+x.c+' 💰 + '+x.p+' 🔩';}).join(' · ')+(cars?L('; первые тройки — ещё и редкая машина в альбом.','; your first top-3 finishes also bring a rare car.'):'.')+
    (MY.fn('board')?' '+L('Доска объявлений во дворе: +','Notice board in your yard: +')+Math.round(MY.fn('board')*100)+'% '+L('к монетам.','to coins.'):'')+' '+L('Соседи — жильцы округи, их очки считает честная модель, одинаковая у всех игроков.','The neighbours are local residents; their points come from a fair model, the same for every player.')+'</p>';
  el.innerHTML=h;}
MY.tab({id:'league',n:L('Лига','League'),ic:'🥇',o:30,title:L('Лига соседей','Neighbours’ league'),render:render,sub:function(){return MY.lgOpen()?MY.lgName():L('с района «Квартал»','from the “Block” district');},dot:function(){return !!S.lgaR;}});
MY.homeLine({pri:30,f:function(){if(!MY.lgOpen())return null;if(S.lgaR)return {ic:'🥇',t:L('Итоги недели в лиге — загляни!','League week results — take a look!'),a:'league'};var p=MY.lgPlace(),l=S.lgaL||0,z=zone(p,l);
  return {ic:'🥇',t:MY.lgName(l)+': '+L('ты ','you’re ')+p+L('-й из 8',' of 8')+(z==='up'?L(' · зона повышения',' · promotion zone'):z==='down'?L(' · зона вылета',' · relegation zone'):''),a:'league'};}});
// открыть вкладку лиги — сначала итог прошлой недели
var r0=MY.render;MY.render=function(){r0.apply(this,arguments);try{if(MY.cur()==='league'&&S.lgaR)showResult(function(){MY.render();});}catch(e){}};
MY.on('start',function(){roll();});
})();
