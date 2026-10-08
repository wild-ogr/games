/* МЕТА: ЛИГИ турнира недели — «Лига двора» (поток META, 08.10.2026). Журнал: rybak-boost/logs/META.md
   Поверх существующего турнира недели (казённая снасть TOURN_TK и червь, лучшая попытка недели S.week.best — НИЧЕГО в нём не меняем).
   В лиге 8 участников: игрок и 7 соседей-ботов. Соседи ловят ЧЕСТНО той же моделью игры (botCast, казённая снасть, червь, 5 забросов),
   у каждого своё умение и число выездов за неделю; выезды раскиданы по дням недели — таблица живёт в течение недели. Одинаково у всех игроков (зерно — неделя и лига).
   Итог недели — вместе с кубком (обёртка weekClaim): 1–2 место — вверх (бронза → серебро → золото), 7–8 — вниз; не ловил — остаёшься где был.
   Награда за 1–3 место: доля заработка рыбалки на дальнем месте × множитель лиги (выдаётся в окне итогов недели, вне рыбалки).
   VK: «Таблица друзей» — VKWebAppShowLeaderBoardBox (LB.show, как в Богатыре; в кабинете VK включить таблицу «по очкам»). Яндекс-таблицы и онлайн (cup1) не трогаем.
   Сохранение: S.lgL (лига 0..2), S.lgW (последняя подсчитанная неделя), S.lgH {неделя: место·10+лига}, S.lgG (золотых кубков лиги). */
(function(){
'use strict';
var M=META;
var LG=[{n:'Бронзовая лига',en:'Bronze league',s:'Бронза',se:'Bronze',c:'#c98a4a',c2:'#8a5528'},
        {n:'Серебряная лига',en:'Silver league',s:'Серебро',se:'Silver',c:'#c9d2da',c2:'#7d8a96'},
        {n:'Золотая лига',en:'Gold league',s:'Золото',se:'Gold',c:'#f2c94c',c2:'#b8860b'}];
var LG_PAY=[1,.6,.4],LG_K=[1,1.5,2],UP=2,DOWN=2;
// соседи: n — имя, h — привычка, sk — умение (как у бота проверок: 0,35…0,8), a — выездов за неделю [от, до], av — лицо [фон, кожа, головной убор, цвет убора, борода, очки, волосы]
var BOTS=[
 [ // бронза
  {n:'Витька-школьник',en:'Vitka the schoolboy',h:'ловит после уроков, вечно торопится',he:'fishes after school, always in a hurry',sk:0.24,a:[1,1],av:['#8fc1d4','#f0c29a','cap','#d9452b',0,0,'#6b4a2a']},
  {n:'Зинаида с поплавком',en:'Zinaida with a float',h:'сидит с поплавком с самой зорьки',he:'sits by her float from dawn',sk:0.32,a:[1,2],av:['#e6b8a2','#f2c7a5','scarf','#3f7fbf',0,0,'#8a8a8a']},
  {n:'Тётя Валя-проводница',en:'Aunt Valya',h:'рыбачит между рейсами',he:'fishes between train shifts',sk:0.28,a:[1,1],av:['#b9a6d6','#eab894','scarf','#c23b5a',0,0,'#4a2e1e']},
  {n:'Генка-дачник',en:'Genka the dacha man',h:'больше жарит шашлык, чем ловит',he:'grills more than he fishes',sk:0.22,a:[1,1],av:['#a9cf9a','#e7b48c','panama','#e8e0c8',0,0,'#3a2a1a']},
  {n:'Баба Нюра',en:'Granny Nyura',h:'ловит коту — и всегда с уловом',he:'fishes for her cat — never empty-handed',sk:0.34,a:[1,2],av:['#f0d48a','#efc39f','scarf','#5a8a3a',0,1,'#bbbbbb']},
  {n:'Студент Лёша',en:'Lyosha the student',h:'взял удочку впервые, но везучий',he:'first time with a rod, but lucky',sk:0.27,a:[1,1],av:['#9ab8e8','#f2c8a0','none','',0,1,'#2a2a2a']},
  {n:'Сосед Толик',en:'Tolik next door',h:'вечно проспит утреннюю зорьку',he:'always oversleeps the dawn bite',sk:0.3,a:[1,1],av:['#d4b48a','#e2ad86','cap','#3a5a8a',1,0,'#5a3a1a']}],
 [ // серебро
  {n:'Колька-спиннингист',en:'Kolka the spinner',h:'ворчит на червя, мечтает о блесне',he:'grumbles about worms, dreams of lures',sk:0.44,a:[1,2],av:['#7fb0c8','#eab48c','cap','#2f2f2f',0,1,'#3a2a1a']},
  {n:'Сан Саныч',en:'San Sanych',h:'терпеливый, как цапля',he:'patient as a heron',sk:0.49,a:[1,2],av:['#b8c49a','#e3b08a','panama','#7a8a5a',1,0,'#9a9a9a']},
  {n:'Ольга-фидеристка',en:'Olga the feeder angler',h:'записывает каждую поклёвку в тетрадку',he:'logs every bite in a notebook',sk:0.46,a:[1,2],av:['#e8a8b8','#f0c4a4','none','',0,1,'#a85a2a']},
  {n:'Михалыч с лодкой',en:'Mikhalych with a boat',h:'знает все ямы на плёсе',he:'knows every pit on the reach',sk:0.5,a:[1,2],av:['#8ab0a0','#dca47e','ushanka','#5a4a3a',1,0,'#6a6a6a']},
  {n:'Кум Петровича',en:'Petrovich\'s pal',h:'спорит с Петровичем о каждой рыбе',he:'argues with Petrovich about every fish',sk:0.44,a:[1,2],av:['#c8b080','#e0a880','cap','#6a3a2a',1,0,'#4a3a2a']},
  {n:'Рыжий Серёга',en:'Ginger Seryoga',h:'у него клюёт, когда никто не смотрит',he:'gets bites when nobody is looking',sk:0.42,a:[1,2],av:['#e8c080','#f2c4a0','none','',0,0,'#d2691e']},
  {n:'Дядя Гоша',en:'Uncle Gosha',h:'приезжает на «Ниве» до рассвета',he:'arrives in his old jeep before dawn',sk:0.47,a:[1,2],av:['#a0b4c8','#d8a07a','cap','#4a6a3a',1,0,'#2a2a2a']}],
 [ // золото
  {n:'Палыч-ветеран',en:'Palych the veteran',h:'сорок лет на воде',he:'forty years on the water',sk:0.62,a:[2,3],av:['#9ab0c0','#d8a07a','ushanka','#3a3a3a',1,0,'#cccccc']},
  {n:'Лидия Петровна',en:'Lidia Petrovna',h:'учительница, ловит по науке',he:'a teacher, fishes by the book',sk:0.58,a:[2,3],av:['#c8a8d8','#f0c4a4','none','',0,1,'#8a8a8a']},
  {n:'Капитан Седов',en:'Captain Sedov',h:'бывший речник, читает воду как книгу',he:'ex-river captain, reads water like a book',sk:0.64,a:[2,3],av:['#7a9ab8','#dca47e','captain','#1f2f4a',1,0,'#dddddd']},
  {n:'Дед Митяй',en:'Grandpa Mityai',h:'трижды ловил Карпа Бориса',he:'caught Boris the Carp three times',sk:0.66,a:[2,3],av:['#c9a96e','#e2b48c','none','',1,0,'#eeeeee']},
  {n:'Анатолий-чемпион',en:'Anatoly the champion',h:'чемпион района 1987 года',he:'district champion of 1987',sk:0.6,a:[2,3],av:['#e0c070','#e0a880','panama','#f0f0e0',0,1,'#6a5a4a']},
  {n:'Нина-волжанка',en:'Nina from the Volga',h:'выросла на Волге, рыбачит с детства',he:'grew up on the Volga, fishing since childhood',sk:0.61,a:[2,3],av:['#88c0c0','#ecbc98','scarf','#2a7a6a',0,0,'#5a3a2a']},
  {n:'Егорыч-тихий',en:'Quiet Yegorych',h:'молчит и таскает',he:'says nothing, catches plenty',sk:0.68,a:[2,3],av:['#a0a890','#d8a07a','cap','#5a5a4a',1,0,'#8a8a8a']}]];

/* ---------- сохранение ---------- */
M.fix(function(){M.fNum('lgL');M.fNum('lgW');M.fNum('lgG');M.fObj('lgH');S.lgL=Math.min(2,Math.floor(S.lgL));
  // старое сохранение: кубок прошлой недели уже забран — эту неделю в лиге не считаем
  if(M.isO(S.week)&&S.cups&&S.cups[S.week.w])S.lgW=Math.max(S.lgW,S.week.w||0);});
M.merge(function(loc,d){var a=M.num(loc.lgW),b=M.num(d.lgW);
  if(b>a){S.lgW=b;S.lgL=M.num(d.lgL);}else if(a>b){S.lgW=a;S.lgL=M.num(loc.lgL);}else{S.lgW=a;S.lgL=Math.max(M.num(loc.lgL),M.num(d.lgL));}
  M.mMax(loc,d,'lgG');M.mObj(loc,d,'lgH');});

/* ---------- соседи ловят ---------- */
function wDay(){return ((dayNum()+3)%7+7)%7;} // 0 — понедельник
var CACHE={};
// выезды соседа за неделю: [{d: день недели, g: граммы}] — одинаково у всех (зерно: неделя, лига, сосед)
function botTrips(w,l,j){var k=w+':'+l+':'+j;if(CACHE[k])return CACHE[k];
  var b=BOTS[l][j],R=rng(w*7919+l*104729+j*1299709+17),n=b.a[0]+Math.floor(R()*(b.a[1]-b.a[0]+1)),days=[0,1,2,3,4,5,6],out=[],pi=weekPlace(w);
  for(var i=6;i>0;i--){var x=Math.floor(R()*(i+1)),t=days[i];days[i]=days[x];days[x]=t;}
  M.botting=true;
  try{for(var q=0;q<n;q++){var tod=TODS[Math.floor(R()*4)],wx=WXS[Math.floor(R()*5)],g=0;
    for(var c=0;c<5;c++){var r=botCast(pi,'worm',tod,wx,TOURN_TK,false,b.sk,R);if(r&&r.kind==='fish'&&r.f&&!r.f.leg)g+=Math.round(r.w*1000);}
    out.push({d:days[q],g:g});}}catch(e){}
  M.botting=false;out.sort(function(a,c){return a.d-c.d;});return (CACHE[k]=out);}
// таблица недели w в лиге l на день недели upto (7 — вся неделя): [{me, j, g, last}]
function table(w,l,upto,myG){var rows=[];
  for(var j=0;j<7;j++){var tr=botTrips(w,l,j),g=0,last=null;for(var i=0;i<tr.length;i++)if(tr[i].d<=upto){if(tr[i].g>g)g=tr[i].g;last=tr[i];}rows.push({j:j,g:g,last:last,n:tr.filter(function(t){return t.d<=upto;}).length});}
  rows.push({me:1,g:myG||0});
  rows.sort(function(a,b){return b.g-a.g||(a.me?-1:b.me?1:a.j-b.j);});return rows;}
function myBest(w){return M.isO(S.week)&&S.week.w===w?S.week.best||0:0;}
function myPlace(rows){for(var i=0;i<rows.length;i++)if(rows[i].me)return i+1;return 8;}
function zone(p,l){return p<=UP&&l<2?'up':p>8-DOWN&&l>0?'down':'';}
function lgName(l,short){var x=LG[l]||LG[0];return short?L(x.s,x.se):L(x.n,x.en);}
function rew(place,l){return place>=1&&place<=3?M.r5(M.tripC()*LG_PAY[place-1]*LG_K[l]):0;}

/* ---------- значки и лица (свои рисунки) ---------- */
function badge(l,sz){var x=LG[l]||LG[0],id='lgb'+l+'_'+Math.floor(Math.random()*1e6);sz=sz||44;
  return '<svg class="lgbadge" width="'+sz+'" height="'+sz+'" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="'+x.c+'"/><stop offset="1" stop-color="'+x.c2+'"/></linearGradient></defs>'+
  '<path d="M20 4h10l4 14H24zM34 4h10l-4 14H30z" fill="'+(l===2?'#c23b3b':l===1?'#2f6fb3':'#3a8a4a')+'"/><path d="M27 4h3l3 12h-3z" fill="#fff" opacity=".5"/>'+
  '<circle cx="32" cy="38" r="22" fill="url(#'+id+')" stroke="'+x.c2+'" stroke-width="2.5"/><circle cx="32" cy="38" r="15.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/>'+
  '<path d="M17 40c4.5-6 12-7.5 18-3l5-4v12l-5-4c-6 4.5-13.5 3-18-1z" fill="'+x.c2+'" opacity=".9"/><circle cx="22.5" cy="39" r="1.4" fill="#fff"/>'+
  '<path d="M44 21l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z" fill="#fff" opacity=".85"/></svg>';}
function face(av,sz){sz=sz||44;var bg=av[0],sk=av[1],hat=av[2],hc=av[3],beard=av[4],gl=av[5],hair=av[6],s='';
  s+='<circle cx="32" cy="32" r="32" fill="'+bg+'"/><path d="M10 64c2-14 10-20 22-20s20 6 22 20z" fill="'+(hat==='scarf'?hc:'#4a5a6a')+'" opacity="'+(hat==='scarf'?.85:1)+'"/>';
  s+='<path d="M19 30c0-9 6-14 13-14s13 5 13 14" fill="'+hair+'"/><circle cx="32" cy="31" r="12.5" fill="'+sk+'"/>';
  if(hat==='cap')s+='<path d="M19 27c1-9 25-10 26 0z" fill="'+hc+'"/><path d="M38 26.5h11c0 1.8-2 2.8-5 2.8h-6z" fill="'+hc+'"/><circle cx="32" cy="18.5" r="1.3" fill="#fff" opacity=".6"/>';
  else if(hat==='panama')s+='<path d="M21 26c0-8 22-8 22 0z" fill="'+hc+'"/><ellipse cx="32" cy="26.5" rx="16" ry="3" fill="'+hc+'"/><path d="M22 24.5h20" stroke="#8a7a5a" stroke-width="1.6"/>';
  else if(hat==='ushanka')s+='<path d="M18 28c0-11 28-11 28 0v2H18z" fill="'+hc+'"/><rect x="17" y="27" width="5" height="12" rx="2.5" fill="'+hc+'"/><rect x="42" y="27" width="5" height="12" rx="2.5" fill="'+hc+'"/><path d="M20 24h24" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>';
  else if(hat==='captain')s+='<path d="M19 26c0-7 26-7 26 0z" fill="#f4f4f4"/><rect x="19" y="24" width="26" height="4" fill="'+hc+'"/><path d="M21 28h22l-2 3H23z" fill="#1a1a1a"/><circle cx="32" cy="26" r="1.8" fill="#f2c94c"/>';
  else if(hat==='scarf')s+='<path d="M18 30c0-12 28-12 28 0-3-4-7-6-14-6s-11 2-14 6z" fill="'+hc+'"/><path d="M19 30l-3 10 7-6zM45 30l3 10-7-6z" fill="'+hc+'"/><circle cx="26" cy="22" r="1.2" fill="#fff" opacity=".7"/><circle cx="36" cy="21" r="1.2" fill="#fff" opacity=".7"/>';
  s+='<circle cx="27.5" cy="32" r="1.5" fill="#2a2a2a"/><circle cx="36.5" cy="32" r="1.5" fill="#2a2a2a"/>';
  if(gl)s+='<circle cx="27.5" cy="32" r="3.6" fill="none" stroke="#2a2a2a" stroke-width="1.3"/><circle cx="36.5" cy="32" r="3.6" fill="none" stroke="#2a2a2a" stroke-width="1.3"/><path d="M31 32h2" stroke="#2a2a2a" stroke-width="1.3"/>';
  s+='<circle cx="24" cy="36" r="2.2" fill="#e88" opacity=".35"/><circle cx="40" cy="36" r="2.2" fill="#e88" opacity=".35"/>';
  if(beard)s+='<path d="M21 35c0 12 22 12 22 0-3 5-19 5-22 0z" fill="'+hair+'"/><path d="M28.5 39.5c2 1.3 5 1.3 7 0" stroke="#5a3a2a" stroke-width="1.2" fill="none"/>';
  else s+='<path d="M28.5 38.5c2 1.6 5 1.6 7 0" stroke="#8a4a3a" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
  return '<svg class="lgface" width="'+sz+'" height="'+sz+'" viewBox="0 0 64 64" aria-hidden="true">'+s+'</svg>';}
var ME_AV=['#ffcf7a','#e8b48e','cap','#e07a3a',0,0,'#5a3a22'];
function myFace(sz){return face(ME_AV,sz);}
function g2(g){return g?kgTxt(g/1000):'—';}
var WDS=[['пн','Mon'],['вт','Tue'],['ср','Wed'],['чт','Thu'],['пт','Fri'],['сб','Sat'],['вс','Sun']];

/* ---------- окно лиги ---------- */
function openLeague(back){var w=weekNum(),l=S.lgL||0,d=wDay(),rows=table(w,l,d,myBest(w)),me=myPlace(rows),pi=weekPlace(w),P=PLACES[pi],played=myBest(w)>0;
  M.stat('lg','open',{l:l,p:me});
  var list=rows.map(function(r,i){var p=i+1,z=zone(p,l),b=r.me?null:BOTS[l][r.j];
    return '<div class="lgr'+(r.me?' me':'')+(z?' '+z:'')+'"><b class="lgp">'+p+'</b>'+(r.me?myFace(40):face(b.av,40))+
      '<span class="lgn"><b>'+(r.me?L('Ты','You'):esc(L(b.n,b.en)))+'</b><small>'+(r.me?(played?L('лучшая попытка недели','your best this week'):L('ещё не ловил на этой неделе','no catch this week yet')):
      esc(L(b.h,b.he))+(r.last?' · '+L(WDS[r.last.d][0],WDS[r.last.d][1]):''))+'</small></span><i class="lgg">'+g2(r.g)+'</i></div>';}).join('');
  var z=zone(me,l),zt=!played?L('Соседи уже ловят. Сыграй турнир — и ты в таблице!','The neighbours are fishing already. Take part — and you are on the board!')
    :z==='up'?L('Ты в зоне повышения: удержись до понедельника — и в '+lgName(l+1).toLowerCase()+'!','You are in the promotion zone — hold on till Monday!')
    :z==='down'?L('Зона вылета: ещё попытка — и выберешься!','Relegation zone: one more try and you are out of it!')
    :L('До зоны повышения — '+Math.max(0,me-UP)+' '+pl(Math.max(0,me-UP),'место','места','мест','place','places')+'. Лучшая попытка недели идёт в зачёт.','Your best attempt of the week counts.');
  var rw=[1,2,3].map(function(p){return p+' '+L('место','place')+' +'+coinsTxt(rew(p,l));}).join(' · ');
  var vk=PLAT==='vk'&&LB.ok();
  M.win('<div class="lgscene" id="lgScene"></div>'+M.head('league',lgName(l),esc(nm(P))+' · '+weekLeftTxt())+
    '<p class="goal lgzt '+(z||'')+'">'+zt+'</p><div class="lgt">'+list+'</div>'+
    '<p class="about">'+L('Соседи ловят честно — той же казённой снастью и на червя, что и ты. Выезжают в разные дни недели: таблица меняется каждый день.','The neighbours play fair — same tackle and worms as you. They fish on different days, so the board changes daily.')+
    '<br>'+L('Итог в понедельник: 1–2 место — в лигу выше, 7–8 — ниже. ','Results on Monday: places 1–2 go up, 7–8 go down. ')+rw+'</p>'+
    '<div class="row"><button class="btn green" id="lgGo">🎣 '+(played?L('Ещё попытка','Try again'):L('Участвовать','Take part'))+'</button>'+
    (vk?'<button class="btn blue noenter" id="lgFr">'+M.MI('friends')+' '+L('Таблица друзей','Friends board')+'</button>':'')+'</div>'+
    '<div class="row"><button class="btn" id="mCancel">'+L('Закрыть','Close')+'</button></div>');
  try{drawScene($('lgScene'),pi,rows,l);}catch(e){}
  $('lgGo').onclick=function(){M.stat('lg','go',{l:l});startFish(pi,{tourn:true});};
  if($('lgFr'))$('lgFr').onclick=function(){M.stat('lg','vk');LB.show(function(){openLeague(back);});};
  $('mCancel').onclick=back||hideModal;}
// сцена: вечерний берег места недели, пьедестал из досок, три лидера
function drawScene(el,pi,rows,l){if(!el)return;var o=M.canv(el,132),g=o.g,W=o.W,H=o.H;M.sceneBg(g,W,H,pi,'evening');
  var gr=g.createLinearGradient(0,H*.45,0,H);gr.addColorStop(0,'rgba(10,20,30,0)');gr.addColorStop(1,'rgba(10,20,30,.55)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  var cx=W/2,base=H-10,ws=[[0,46],[-1,34],[1,24]];
  for(var k=0;k<3;k++){var x=cx+ws[k][0]*74,h=ws[k][1],y=base-h;
    var wg=g.createLinearGradient(0,y,0,base);wg.addColorStop(0,'#c99a62');wg.addColorStop(1,'#7a5530');g.fillStyle=wg;g.fillRect(x-32,y,64,h);
    g.strokeStyle='rgba(60,35,15,.55)';g.lineWidth=1;for(var s=1;s<3;s++){g.beginPath();g.moveTo(x-32,y+h*s/3);g.lineTo(x+32,y+h*s/3);g.stroke();}
    g.fillStyle='#fff';g.font='700 17px '+(getComputedStyle(document.body).fontFamily||'sans-serif');g.textAlign='center';g.fillText(String(k+1),x,y+h/2+6);
    var r=rows[k];if(!r)continue;var img=new Image();(function(x,y,r){img.onload=function(){g.save();g.beginPath();g.arc(x,y-22,20,0,7);g.closePath();g.clip();g.drawImage(this,x-20,y-42,40,40);g.restore();
      g.strokeStyle=k===0?LG[2].c:k===1?LG[1].c:LG[0].c;g.lineWidth=3;g.beginPath();g.arc(x,y-22,20,0,7);g.stroke();};})(x,y,r);
    var svg=r.me?face(ME_AV):face(BOTS[l][r.j].av);
    if(svg.indexOf('xmlns')<0)svg=svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);}
  var bx=document.createElement('div');bx.className='lgsb';bx.innerHTML=badge(l,54);el.appendChild(bx);}

/* ---------- итог недели: вместе с кубком (weekClaim) ---------- */
function settle(w,best){if(!(w>0)||S.lgW>=w)return null;var l=S.lgL||0,rows=table(w,l,7,best),p=myPlace(rows),z=best>0?zone(p,l):'',c=best>0?rew(p,l):0;
  S.lgW=w;S.lgH[w]=p*10+l;if(z==='up')S.lgL=l+1;else if(z==='down')S.lgL=l-1;if(l===2&&p===1)S.lgG=(S.lgG||0)+1;
  if(c)S.coins+=ern('quest',c);save();M.stat('lg','week',{l:l,p:p,z:z||'-',c:c});return {l:l,p:p,z:z,c:c,nl:S.lgL};}
var wc0=weekClaim;
weekClaim=function(){var w=weekPending(),r=wc0.apply(this,arguments);
  if(r&&w){var s=null;try{s=settle(w.w,w.best);}catch(e){}if(s)try{var mc=$('mcard'),at=mc.querySelector('.coins-won');
    var h='<div class="lgres '+(s.z||'')+'">'+badge(s.nl,48)+'<div><b>'+lgName(s.l)+': '+s.p+' '+L('место','place')+'</b><small>'+
      (s.z==='up'?L('Повышение! Теперь — '+lgName(s.nl).toLowerCase()+'.','Promoted to the '+lgName(s.nl)+'!'):s.z==='down'?L('Вылет в '+lgName(s.nl).toLowerCase()+'. Отыграешься!','Down to the '+lgName(s.nl)+'. You will be back!'):L('Остаёшься в лиге.','You stay in the league.'))+
      (s.c?' +'+coinsTxt(s.c):'')+'</small></div></div>';
    if(at)at.insertAdjacentHTML('afterend',h);else mc.insertAdjacentHTML('beforeend',h);updCoins();if(s.z==='up')try{FX.burst(.5,.25,30,'coin');}catch(e){}}catch(e){}}
  return r;};

/* ---------- окно турнира недели: строка лиги ---------- */
var ow0=openWeek;
openWeek=function(){ow0.apply(this,arguments);try{var w=weekNum(),l=S.lgL||0,rows=table(w,l,wDay(),myBest(w)),p=myPlace(rows),mc=$('mcard');
  var b=document.createElement('button');b.className='btn lgwk noenter';b.id='lgWk';b.innerHTML=badge(l,36)+'<span><b>'+lgName(l)+'</b><small>'+L('ты','you are')+' '+p+L('-й из 8 · таблица соседей',' of 8 · neighbours\' board')+'</small></span>'+(window.LOOK?LOOK.I('fwd'):'›');
  var h2=mc.querySelector('h2');if(h2&&h2.nextSibling)mc.insertBefore(b,h2.nextSibling);else mc.appendChild(b);b.onclick=function(){openLeague(openWeek);};}catch(e){}};

/* ---------- гнёзда UX: главный экран и итоги ---------- */
function mapLine(){var w=weekNum(),l=S.lgL||0,d=wDay(),rows=table(w,l,d,myBest(w)),p=myPlace(rows),played=myBest(w)>0;
  var top=null;for(var i=0;i<rows.length;i++)if(!rows[i].me&&rows[i].g){top=rows[i];break;}
  var t=played?L('ты '+p+'-й из 8','you are #'+p+' of 8')+(zone(p,l)==='up'?' · '+L('зона повышения','promotion zone'):zone(p,l)==='down'?' · '+L('зона вылета','relegation zone'):'')
    :top?L(BOTS[l][top.j].n+' уже поймал '+g2(top.g)+'. Твой ход!',L(BOTS[l][top.j].n,BOTS[l][top.j].en)+' caught '+g2(top.g)+'. Your turn!'):L('Соседи собираются на турнир. Твой ход!','The neighbours are getting ready. Your turn!');
  return {t:t,l:l,p:p,played:played};}
slotAdd(mapSlots,{id:'meta-league',pri:45,when:function(){return (S.sessions||0)>=1;},
  html:function(){var m=mapLine();return '<button class="mtslot lgslot" data-a="lg">'+badge(m.l,44)+'<span class="mtst"><b>'+lgName(m.l)+'</b><small>'+esc(m.t)+'</small></span>'+(window.LOOK?LOOK.I('fwd'):'›')+'</button>';},
  bind:function(el){el.querySelector('[data-a=lg]').onclick=function(){openLeague();};}});
slotAdd(resultSlots,{id:'meta-league',pri:60,when:function(c){return !!(c&&c.g&&c.g.tourn&&c.g.tourn!=='day');},
  html:function(){var m=mapLine();return '<button class="mtslot lgslot noenter" data-a="lg">'+badge(m.l,40)+'<span class="mtst"><b>'+lgName(m.l)+': '+L('ты','you are')+' '+m.p+L('-й из 8',' of 8')+'</b><small>'+L('Таблица соседей','Neighbours\' board')+'</small></span>'+(window.LOOK?LOOK.I('fwd'):'›')+'</button>';},
  bind:function(el){el.querySelector('[data-a=lg]').onclick=function(){openLeague(function(){hideModal();openMap();});};}});

M.league={open:openLeague,table:table,bots:BOTS,settle:settle,badge:badge,face:face,name:lgName,trips:botTrips};
if(typeof __test!=='undefined')try{window.__test.meta=M;}catch(e){}
M.mapRefresh();
})();
