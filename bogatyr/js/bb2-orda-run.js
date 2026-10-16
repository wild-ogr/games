/* bb2 ORDA — «Орда» (набор 'orda', флаг orda). Тысяча мелкой нечисти одним слоем.
   Как сделано дёшево (08-perf.md, «Чего не было», п. 3):
   - участники орды — обычные враги в G.en с пометкой e.ob=1: оружие, сетка попаданий, «Подвиги», счёт убитых работают как всегда;
   - рисуются не по одному drawSpr (setTransform + сортировка всей толпы), а одним проходом из готового листа-картинки
     (повёрнуты заранее: лицом вправо/влево × шаг 0/1 × обычный/вспышка, тень и подсветка тёмных глав запечены) — крючок drawOb в render;
   - расталкиваются только между собой и через кадр (половина орды за кадр), общий расталкиватель их пропускает (e.ob в game.js);
   - сторож кадров: во время волны меряю настоящие кадры; провал ниже 42 к/с — новых не зову, лишних за краем экрана убираю;
     устройство запоминает свой предел (localStorage 'bb2orda', не S — облако общее для телефона и ПК); два провала на пределе 300 — орда на этом устройстве выключена.
   Где видно игроку: Бесконечная сеча (не Испытание недели) — первая волна на 2:00, дальше каждые 4 минуты, не при боссе.
   Награда — раз в день за разбитую орду (≥ 90 % одолено): BB2.n('orda.gold','m') по отрезку глав, BB2.n('orda.perDay',1).
   Для других потоков (TAIL — этаж Калинова моста, EVENT/LEAP — событие): BB2.after('orda',function(){BB2.orda.wave(G,{n:1000,dur:50,src:'most'});})
     → true, если волна пошла (false — флаг выключен, устройство не тянет, уже идёт волна). BB2.orda.on(G) — идёт ли волна; BB2.orda.budget() — предел устройства.
   События шины: BB2.hook('orda',function(e){}) e={a:'in'|'end',n,k,ok,src}; «Подвиги»: BB2.pdv('orda') за разбитую, BB2.pdv('orda.k',k,1) — рекорд.
   STAT: orda {a:'in',n,b,src} · {a:'end',k,n,ok,lo,pk,sh,src} · {a:'off',b}. Проверка у стенда: ?orda=1000 — волна на 5-й секунде любого похода. */
(function(){if(typeof BB2==='undefined'||BB2.orda)return;var B=BB2,O=B.orda={},LS='bb2orda',AT={},TST=/[?&]orda=(\d+)/.exec(location.search);
var DUR=50,SPAWN=8,FIRST=120,EVERY=240,XPN=120,HPK=.4,DMGK=.5,SCK=.8,FPS_LO=42,FPS_OK=52,MAXB=1200,MINB=300;
function dev(){try{var o=JSON.parse(localStorage.getItem(LS)||'{}');return o&&typeof o==='object'?o:{};}catch(e){return {};}}
function devSet(o){try{localStorage.setItem(LS,JSON.stringify(o));}catch(e){}}
function rn(a,b){return a+Math.random()*(b-a);}
O.budget=function(){var d=dev();if(d.off)return 0;var b=typeof d.b==='number'?d.b:def();if(typeof qLow==='function'&&qLow())b=Math.min(b,500);return Math.max(0,Math.min(MAXB,b));};
O.on=function(g){return !!(g&&g.ob&&!g.ob.done);};
function band(){var n=0,k,bd=B.n('base.band',[3,18]);try{for(k in S.done)if(S.done[k])n++;}catch(e){}return n<=bd[0]?0:n<=bd[1]?1:2;}
function gold(){var g=B.n('orda.gold','m'),t={s:'small',m:'mid',b:'big'}[g];if(t){var a=B.n('base.'+t,{s:[70,200,650],m:[350,950,3200],b:[1400,3800,12800]}[g]);return a[band()]||0;}return typeof g==='number'?g:0;}
function today(){try{return typeof dayIdx==='function'?dayIdx():Math.floor(dayMs()/864e5);}catch(e){return Math.floor(Date.now()/864e5);}}
/* кого звать в орду: самая слабая ближняя нечисть главы (без стрельбы, полёта, повадок) */
function kinds(g){var a=[],en=g.ch&&g.ch.en||[],i,d;for(i=0;i<en.length;i++){d=EN[en[i]];if(d&&!d.boss&&!d.prop&&!d.ranged&&!d.fly&&!d.beh&&en[i]!=='egg')a.push(en[i]);}
  if(!a.length&&en[0])a.push(en[0]);a.sort(function(x,y){return EN[x].hp-EN[y].hp;});return a.slice(0,2);}
/* лист-картинка вида: 4 столбца (вправо, влево, вправо-шаг, влево-шаг) × 2 строки (обычный, вспышка) */
function atlas(t,dark){var key=t+(dark?'d':''),k=Math.min(SPR_K,2),a=AT[key];if(a&&a.k===k)return a;var s=spr(t);if(!s)return null;
  var w=s.s*SCK,cs=Math.ceil(w*k),c=mkCanvas(cs*4,cs*2),x=c.getContext('2d'),r=EN[t].r*SCK*k,i,j,f;
  for(j=0;j<2;j++)for(i=0;i<4;i++){f=j?sprF(s):s.c;x.save();x.translate(i*cs+cs/2,j*cs+cs/2);
    if(dark){x.globalAlpha=.36;var gr=Math.min(r*2.3,cs/2);x.drawImage(glowSpr('#d6ccff'),-gr,-gr-2*k,gr*2,gr*2);x.globalAlpha=1;}
    x.fillStyle='rgba(20,30,20,.22)';x.beginPath();x.ellipse(0,Math.min(r*.9,cs/2-r*.38),r,r*.38,0,0,6.2832);x.fill();
    var sq=i>1?1.05:.96;x.scale(i&1?-1:1,1);x.scale(1/sq,sq);x.drawImage(f,-cs/2,-cs/2,cs,cs);x.restore();}
  return AT[key]={c:c,cs:cs,w:w,h:w/2,k:k};}
/* ---------- волна ---------- */
O.wave=function(g,o){o=o||{};if(!g||g.over||!B.on('orda')||O.on(g))return false;var b=O.budget(),n=Math.min(o.n||1000,b);if(TST)n=Math.min(+TST[1]||1000,2000);
  if(n<MINB&&!TST){if(!b)B.stat('orda',{a:'skip',b:b});return false;}var ks=kinds(g);if(!ks.length)return false;
  var H=g.hero,a0=Math.random()*6.2832;
  g.ob={n:n,sp:0,k:0,t:0,dur:o.dur||DUR,src:o.src||'sech',ks:ks,dirs:[a0,a0+2.1,a0+4.2],m:[],xpk:Math.max(1,Math.floor(n/XPN)),lo:99,pk:0,sh:0,fr:[],ft:0,done:0,par:0,cv:null,cn:-1,ct:0};
  banner(n>=1000?L('Орда! Тысяча нечисти!','The Horde! A thousand monsters!'):L('Орда идёт!','The Horde is coming!'),L('Руби — не считай!','Swing, don\'t count!'),4);
  try{G.shake=Math.max(G.shake,6);SND.boom();}catch(e){}
  B.stat('orda',{a:'in',n:n,b:b,src:g.ob.src});B.ev('orda',{a:'in',n:n,src:g.ob.src});return true;};
function add(g,o){var H=g.hero,dir=o.dirs[o.sp%3],a=dir+rn(-.38,.38),d=Math.min(VIEW.R+30+rn(0,170),VIEW.R*1.6),t=o.ks[o.sp%7?0:o.ks.length-1];
  var e=mkEnemy(t,H.x+Math.cos(a)*d,H.y+Math.sin(a)*d);e.ob=1;e.hp*=HPK;e.max=e.hp;e.r*=SCK;e.sc=SCK;e.dmg*=DMGK;e.spd*=rn(.82,1.02);e.ranged=0;e.fly=0;e.elite=0;
  e.xp=o.sp%o.xpk?0:e.xp;if(e.beh)delete e.beh;o.sp++;o.m.push(e);}
function stop(g,o,why){if(o.done)return;o.done=1;var i,e,ok=why==='win';
  for(i=0;i<o.m.length;i++){e=o.m[i];if(!e.dead)e.dead=true;} /* остаток орды разбегается — без награды и без счёта */
  o.m.length=0;var sv=B.s('orda'),pay=0;
  if(ok){sv.w=(sv.w||0)+1;if(sv.d!==today()&&B.n('orda.perDay',1)>0){pay=gold();if(pay>0){S.gold+=pay;ern('orda',pay);sv.d=today();}}
    banner(L('Орда разбита!','The Horde is broken!'),pay?L('+'+pay+' золота — раз в день','+'+pay+' gold — once a day'):L('Одолел '+o.k+' нечисти','Defeated '+o.k+' monsters'),4);
    try{SND.win();}catch(e){}if(B.pdv)B.pdv('orda');if(!sv.k&&B.ev)B.ev('kuplet',{c:'orda',src:'orda',t:L('Шла на богатыря орда несметная, тысяча голов — да ни одной умной. Вышло их поле — ушли поленом.','A horde of a thousand came — and not one of them could count. They came as a field and left as firewood.')});}
  else banner(L('Орда схлынула','The Horde fell back'),L('Одолел '+o.k+' из '+o.n,'Defeated '+o.k+' of '+o.n),3);
  sv.k=Math.max(sv.k||0,o.k);if(B.pdv)B.pdv('orda.k',o.k,1);g.obPay=(g.obPay||0)+pay;g.obN=(g.obN||0)+1;g.obK=(g.obK||0)+o.k;
  learn(o);B.stat('orda',{a:'end',k:o.k,n:o.n,ok:ok?1:0,lo:Math.round(o.lo),pk:o.pk,sh:o.sh,src:o.src});B.ev('orda',{a:'end',n:o.n,k:o.k,ok:ok?1:0,src:o.src});
  g.ob=null;}
/* устройство учится своему пределу */
function def(){var n=navigator,c=n.hardwareConcurrency||8,m=n.deviceMemory||8;return c<=4||m<=3?600:1000;} /* слабое железо — начинаем скромнее */
function learn(o){if(TST&&!/ordalearn/.test(location.search))return;var d=dev(),b=typeof d.b==='number'?d.b:def();
  if(o.sh){b=Math.max(MINB,Math.round(Math.min(b,o.pk)*Math.max(.3,Math.min(.8,o.lo/55))/50)*50);d.bad=(d.bad||0)+1;if(b<=MINB&&d.bad>=2){d.off=1;B.stat('orda',{a:'off',b:b});}}
  else if(o.lo>=FPS_OK+3&&o.pk>=b*.9)b=Math.min(MAXB,b+100);d.b=b;devSet(d);}
/* сторож кадров: настоящее время между кадрами логики (dt в игре обрезан до 1/30 — по нему провал не видно) */
function guard(o){if(O.raw)return;var t=performance.now(),gap=o.ft?t-o.ft:0;o.ft=t;if(document.hidden||!(gap>0&&gap<250))return;o.fr.push(gap);
  var s=0,i;for(i=0;i<o.fr.length;i++)s+=o.fr[i];if(s<500)return;var fps=o.fr.length*1000/s;o.fr.length=0;if(o.t<1.5)return;
  if(fps<o.lo)o.lo=fps;if(fps<FPS_LO){o.bad=(o.bad||0)+1;if(o.bad>=2){o.sh++;o.cut=1;}}else{o.bad=0;if(fps>=FPS_OK)o.cut=0;}}
/* расталкивание между своими — через кадр, половина орды за кадр; сетка 24 */
var GR=new Map(),GCs=24;
function sep(o){var m=o.m,i,j,e,q,kx,ky,a,p=o.par^=1;GR.forEach(function(v){v.length=0;});if(GR.size>4000)GR.clear();
  for(i=0;i<m.length;i++){e=m[i];if(e.dead)continue;kx=Math.floor(e.x/GCs);ky=Math.floor(e.y/GCs);q=kx*65536+ky;a=GR.get(q);if(!a){a=[];GR.set(q,a);}a.push(e);}
  for(i=p;i<m.length;i+=2){e=m[i];if(e.dead)continue;kx=Math.floor(e.x/GCs);ky=Math.floor(e.y/GCs);
    for(var cx=kx-1;cx<=kx+1;cx++)for(var cy=ky-1;cy<=ky+1;cy++){a=GR.get(cx*65536+cy);if(!a)continue;
      for(j=0;j<a.length;j++){q=a[j];if(q===e)continue;var dx=e.x-q.x,dy=e.y-q.y,mm=e.r+q.r,d2=dx*dx+dy*dy;
        if(d2<mm*mm&&d2>.01){var d=Math.sqrt(d2),f=(mm-d)*.5;e.x+=dx/d*f;e.y+=dy/d*f;}}}}}
B.hook('frame',function(dt,g){if(!B.on('orda'))return;var x=g.bb2o||(g.bb2o={next:TST?5:FIRST});
  if(!g.ob){if((g.endless&&!g.weekly||TST)&&!g.over&&!g.win&&g.t>=x.next&&!(g.boss&&!g.boss.dead)&&!(g.bossIn>0)){x.next=g.t+EVERY;O.wave(g,{src:TST?'test':'sech'});}return;}
  var o=g.ob,i,e,alive=0;o.t+=dt;guard(o);
  if(o.bench){}else if(o.sp<o.n&&!o.cut){var want=Math.min(o.n,Math.ceil(o.n*Math.min(1,o.t/SPAWN))),lim=40;while(o.sp<want&&lim-->0)add(g,o);}
  else if(o.sp<o.n&&o.cut)o.n=o.sp; /* устройство не тянет — больше не зовём */
  if(o.cut){var cut=Math.ceil(o.m.length*.2*dt);for(i=o.m.length-1;i>=0&&cut>0;i--){e=o.m[i];if(!e.dead&&!onScreen(e,40)){e.dead=true;e.obGone=1;cut--;}}}
  var m=o.m,w=0;for(i=0;i<m.length;i++){e=m[i];if(e.dead){if(e.obGone)o.n--;continue;}m[w++]=e;}m.length=w;alive=w;if(alive>o.pk)o.pk=alive;
  for(i=1;i<m.length;i++){e=m[i];if(e.y>=m[i-1].y)continue;var j=i-1;while(j>=0&&m[j].y>e.y){m[j+1]=m[j];j--;}m[j+1]=e;} /* почти отсортировано — вставками */
  if(o.t>.2)sep(o);
  if(o.bench)return;if(o.sp>=o.n&&(o.k>=o.n*.9||alive===0))stop(g,o,'win');else if(o.t>=o.dur)stop(g,o,'time');});
/* для стенда: O.raw=1 — сторож молчит; O.fill(G,N) — держать живыми N (замер кадров) */
O.fill=function(g,n){var o=g.ob;if(!o)return 0;o.bench=1;var lim=60;while(o.m.length<n&&lim-->0)add(g,o);o.n=o.sp;return o.m.length;};
B.hook('kill',function(e){var g=typeof G!=='undefined'&&G;if(e&&e.ob&&g&&g.ob)g.ob.k++;});
B.hook('drawOb',function(c,g){var o=g.ob;if(!o)return;worldT();var m=o.m,i,e,a,col,fl,dk=!!(g.ch&&g.ch.dark),t=g.t*6,cx=VIEW.cx,cy=VIEW.cy,ww=VIEW.ww+40,wh=VIEW.wh+40;
  for(i=0;i<m.length;i++){e=m[i];if(e.dead||Math.abs(e.x-cx)>ww||Math.abs(e.y-cy)>wh)continue;a=e.obA;if(!a||a.k!==Math.min(SPR_K,2)||a.dk!==dk){a=e.obA=atlas(e.type,dk);if(!a)continue;a.dk=dk;}
    col=(e.face<0?1:0)+(((t+e.ph)|0)&1?2:0);fl=e.flash>0?a.cs:0;c.drawImage(a.c,col*a.cs,fl,a.cs,a.cs,e.x-a.h,e.y-a.h-(col>1?1.5:0),a.w,a.w);}});
/* счётчик вверху: картинка перерисовывается не чаще 5 раз в секунду и только при смене числа */
B.hook('drawTop',function(c,g){var o=g.ob;if(!o||o.t<1)return;var left=Math.max(0,o.n-o.k),now=performance.now();
  if(!o.cv||(left!==o.cn&&now-o.ct>200)){o.cn=left;o.ct=now;var d=VIEW.dpr,W=150,Hh=22,v=o.cv||(o.cv=mkCanvas(W*d,Hh*d)),x=v.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,W,Hh);
    x.fillStyle='rgba(30,12,8,.72)';rr(x,0,0,W,Hh,11);x.fill();x.fillStyle='#c2410c';rr(x,2,2,(W-4)*Math.max(0,Math.min(1,left/o.n)),Hh-4,9);x.fill();
    x.fillStyle='#fff3d6';x.font='bold 12px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(L('Орда: ','Horde: ')+left,W/2,Hh/2+.5);}
  c.drawImage(o.cv,Math.round(VIEW.W/2-75),Math.round((window.__safeTop||0)+92),150,22);});
B.hook('modal',function(k,el){if(k!=='result'||typeof G==='undefined'||!G||!G.obN)return;
  B.put(el,'top','<div style="font-size:13px;margin:4px 0;color:#7a3b12">⚔ '+L('Орда: одолел ','Horde: defeated ')+G.obK+(G.obPay?' · +'+G.obPay+L(' золота',' gold'):'')+'</div>','orda');});
B.hook('end',function(g){if(g&&g.ob)stop(g,g.ob,'end');});
})();
