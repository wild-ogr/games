/* ===== bb2-hero-run.js — ГЕРОИ В БОЮ (поток HERO; догружается набором 'hero', заглушка и справка — js/bb2-hero.js) =====
   1. «Свои приёмы» — по 3 именные карточки у каждого богатыря (окно уровня, своя карточка t:'x'), флаг HERO_X
   2. вторые именные умения (договор UM: BB2.um.hero), флаг HERO_UM2
   3. кино-выход босса вместо плашки, флаг HERO_KINO
   4. «Богатырский удар» — добивание босса на кнопке именного умения / касанием / пробелом, флаг HERO_FIN
   5. лубок победы (стоп-кадр в рамке), флаг HERO_LUBOK
   Всё на поле — готовыми картинками (плашки с текстом рисуются один раз на сцену).
   ---------------- СПРАВКА (другим потокам) ----------------
   Флаги: HERO_X  — «Свои приёмы»: по 3 именные карточки героя в окне уровня
          HERO_UM2 — вторые именные умения (со звания hero.second; нужен UM_ON)
          HERO_KINO — кино-выход босса вместо плашки
          HERO_FIN — «Богатырский удар»: добивание босса на кнопке именного умения (или касанием / пробелом)
          HERO_LUBOK — стоп-кадр-лубок победы
   Все выключены → бой как v24.1.
   Сохранение S.bb2.hero = {x:{id карточки: сколько раз взята}, f: ударов рукой, a: ударов «сам», k: кино показано раз}
   Новый крючок каркаса (одна вставка в hitEnemy, game.js): bossLow(e,G) — смертельный удар по боссу; true — гибель отложена (сам потом вызови killEnemy).
   Шина (другим потокам):
     BB2.hook('heroWin',function(o){})  o={boss:'solo', bv:вариант|null, hero:'dob', t:сек, hand:1 рукой|0 сам|-1 без удара} — босс главы побеждён (перед лубком; итоги — как раньше, по крючку end)
     BB2.hook('heroX',function(id,G){}) — взята карточка «своего приёма»
     BB2.hero.cards([герой]) → [{id,name,desc}] · BB2.hero.um2([герой]) → id второго именного · BB2.hero.busy() → идёт сцена (кино/удар) — своё окно не открывать */
(function(){
  'use strict';
  var HR=BB2.hero;if(!HR||HR.rt)return;
  var U=BB2.um,PI2=Math.PI*2;
  /*ECO? числа «Своих приёмов» и сцен — в одном месте; в договоре раздела hero их нет (записка в logs/HERO.md «Для ECO») */
  var NUM={xP:.3,xLvl:3,xPity:4,          /* шанс своей карточки в окне уровня; с какого уровня; не было столько окон подряд — будет наверняка */
    finWait:4,kinoT:2.6,                   /* удар: ждём нажатия 4 с, потом богатырь бьёт сам; кино-выход 2,6 с */
    d1Max:.3,d1Up:.03,d2Stun:1,d3Hp:.35,d3Arm:3,d3Mt:1.2,
    a1T:3,a1N:6,a1Dmg:10,a2Cd:12,a3N:25,a3T:3,
    i1Dmg:30,i1R:150,i2Hp:1.25,i2Spd:.92,i3N:40,i3T:1.5,
    v1N:20,v1Dmg:14,v1T:8,v1Max:3,v2Mag:1.6,v3Hp:.3,v3Heal:.3,
    s1Xp:2,s2R:130,s3Cd:25,s3Dmg:10,
    m1Dmg:9,m2Arm:2,m2Spd:.94,m3N:60,
    o1Cd:14,o2Spd:1.1,o2Hp:.9,o3Dmg:18,
    r1Dmg:20,r1T:12,r2Area:1.15,r3Dmg:9,
    k1N:6,k2Reg:.02,k3Cd:20,k3Dmg:60,
    /* вторые именные: откат, длительность, урон (сила P = мощь × (1+0,3×звание), «Сами» ×0,8 — считает UM) */
    u_dob:[30,6,1.5],u_ale:[18,1.2,28],u_ily:[24,0,45],u_vas:[30,8,12],u_sad:[30,2.5,0],u_mik:[26,1.6,40],u_vol:[20,1.2,45],u_mar:[30,5,1.5],u_iva:[32,3,25]};
  function N(k){return BB2.n('hero.'+k,NUM[k]);}
  function ev(n,o){BB2.stat(n,o);}
  function on(f){return BB2.on(f);}
  function calm(){return typeof CALM==='function'&&CALM();}
  var PC=false;try{PC=!('ontouchstart' in window)&&window.matchMedia&&window.matchMedia('(pointer:fine)').matches;}catch(e){}

  /* ---------- рисунки ---------- */
  art('hx_frog',30,function(g){ell(g,-7,7,4.5,3,'#3f8a3a');ell(g,7,7,4.5,3,'#3f8a3a');ell(g,0,2,10,8,'#5cb84a');ell(g,-4.5,-6,3.6,3.6,'#5cb84a');ell(g,4.5,-6,3.6,3.6,'#5cb84a');
    eye(g,-4.5,-6.5,2.2);eye(g,4.5,-6.5,2.2);mouth(g,0,3,5,'#2a5a22',1);poly(g,[-3,-11,0,-15,3,-11],'#e6b53a');});
  art('hx_bor',40,function(g){ell(g,0,0,17,8,'#6a4424',{ol:false});ell(g,-3,-2,10,4,'#8a5a2e',{ol:false});ell(g,6,2,5,2.4,'#4a2c1c',{ol:false});});
  art('hx_ring',96,function(g){g.lineWidth=5;g.strokeStyle='rgba(255,216,74,.9)';g.beginPath();g.arc(0,0,40,0,PI2);g.stroke();g.lineWidth=1.6;g.strokeStyle='#fff';g.beginPath();g.arc(0,0,40,0,PI2);g.stroke();
    g.fillStyle='#fff3b0';for(var i=0;i<6;i++){var a=i/6*PI2;poly(g,[Math.cos(a)*40,Math.sin(a)*40,Math.cos(a+.12)*47,Math.sin(a+.12)*47,Math.cos(a-.12)*47,Math.sin(a-.12)*47],'#ffd84a',{flat:1,ol:false});}});
  art('hx_slash',120,function(g){g.rotate(-.5);g.beginPath();g.moveTo(-58,0);g.quadraticCurveTo(0,-13,58,0);g.quadraticCurveTo(0,5,-58,0);g.fillStyle='#fff';g.fill();
    g.beginPath();g.moveTo(-58,0);g.quadraticCurveTo(0,-22,58,0);g.quadraticCurveTo(0,-9,-58,0);g.fillStyle='rgba(255,216,74,.85)';g.fill();});
  art('hx_chain',30,function(g){g.lineWidth=2.6;g.strokeStyle='#9aa3ad';for(var i=-1;i<=1;i++){g.beginPath();g.ellipse(i*8,0,5.5,3.6,i?0:1.57,0,PI2);g.stroke();}});
  function icon(k,alt){return ART[k]?k:alt;}
  var BIG={};
  function big(key,px){if(!ART[key])return null;var k=Math.min(3,VIEW.dpr||1),id=key+'@'+px+'@'+k;return BIG[id]||(BIG[id]=drawArt(key,Math.ceil(px*k)));}
  function fnt(sz,w){return (w||800)+' '+sz+'px '+((typeof CVL!=='undefined'&&CVL.font)||'sans-serif');}
  function wrap(x,t,mw){var ws=String(t).split(' '),ls=[],l='',i,q;for(i=0;i<ws.length;i++){q=l?l+' '+ws[i]:ws[i];if(l&&x.measureText(q).width>mw){ls.push(l);l=ws[i];}else l=q;}if(l)ls.push(l);return ls;}
  /* плашка с текстом: rows=[{t,s размер,c цвет,w жирность}] → готовая картинка (.w/.h в CSS-пикселях) */
  function plate(rows,mw,o){o=o||{};var k=Math.min(3,VIEW.dpr||1),c=mkCanvas(4,4),x=c.getContext('2d'),LS=[],i,j,ls,w=0,h=9,r;
    for(i=0;i<rows.length;i++){r=rows[i];if(!r.t)continue;x.font=fnt(r.s,r.w);ls=wrap(x,r.t,mw-24);
      for(j=0;j<ls.length;j++){w=Math.max(w,x.measureText(ls[j]).width);LS.push({t:ls[j],r:r,y:h+r.s*.62});h+=Math.round(r.s*1.24);}h+=3;}
    w=Math.ceil(w)+24;h+=6;c=mkCanvas(w*k,h*k);x=c.getContext('2d');x.setTransform(k,0,0,k,0,0);
    rrect(x,1.5,1.5,w-3,h-3,o.rad||12);x.fillStyle=o.bg||'rgba(26,15,10,.93)';x.fill();x.lineWidth=2;x.strokeStyle=o.bd||'#ffd84a';x.stroke();
    x.textAlign='center';x.textBaseline='middle';for(i=0;i<LS.length;i++){x.font=fnt(LS[i].r.s,LS[i].r.w);x.fillStyle=LS[i].r.c||'#fff3c8';x.fillText(LS[i].t,w/2,LS[i].y);}
    c.w=w;c.h=h;return c;}

  function near(x,y,r,fn){forNear(x,y,r,function(e){if(e.dead||e.prop)return;var dx=e.x-x,dy=e.y-y,d=Math.hypot(dx,dy)||1;if(d<r+e.r)fn(e,dx/d,dy/d,d);});}
  function hname(h){return heroDef(h).name;}
  function fem(h){return h==='vas'||h==='mar';}

  /* ====================== 1. «СВОИ ПРИЁМЫ»: 27 карточек ====================== */
  function X(id,nm,ds){return {id:id,name:nm,desc:ds};}
  var CARDS={
    dob:[X('d1',()=>L('Заклятый враг','Sworn Foe'),()=>L('Босса бьёшь всё больнее: до +30 % урона','Your hits on a boss keep growing: up to +30% damage')),
         X('d2',()=>L('Клич побратимов','Brothers’ Call'),()=>L('После каждого умения нечисть рядом на секунду столбенеет','After every skill, nearby monsters freeze for a second')),
         X('d3',()=>L('Стоять насмерть','Last Stand'),()=>L('Здоровья меньше трети — броня +3 и урон +20 %','Below a third of health: armour +3 and damage +20%'))],
    ale:[X('a1',()=>L('На скаку','On the Run'),()=>L('Бежишь три секунды без остановки — залп стрел во все стороны','Run for three seconds without stopping — a volley of arrows flies in all directions')),
         X('a2',()=>L('Попович хитёр','Sly Popovich'),()=>L('Раз в 12 секунд удар нечисти проходит мимо','Once every 12 seconds a monster’s blow simply misses')),
         X('a3',()=>L('Насмешка','Taunt'),()=>L('Каждый 25-й побеждённый — нечисть вокруг разевает рты и еле шевелится','Every 25th defeated monster — those around gape and barely move'))],
    ily:[X('i1',()=>L('Силушка копится','Gathering Strength'),()=>L('Стоишь — копишь удар (до трёх секунд). Шагнул — бьёшь оземь вокруг','Stand still to charge a blow (up to three seconds). Step — and slam the ground around you')),
         X('i2',()=>L('Тридцать лет и три года','Thirty Years and Three'),()=>L('Здоровье +25 %, но ходишь чуть медленнее','Health +25%, but you walk a little slower')),
         X('i3',()=>L('Раззудись, плечо','Shoulder to the Wheel'),()=>L('Каждые 40 побеждённых — нечисть вокруг оглушена','Every 40 defeated monsters — everything around you is stunned'))],
    vas:[X('v1',()=>L('В лягушку','Into a Frog'),()=>L('Каждый 20-й побеждённый становится лягушкой и дерётся за тебя','Every 20th defeated monster turns into a frog and fights for you')),
         X('v2',()=>L('Премудрая','The Wise'),()=>L('Самоцветы летят к тебе издалека','Gems fly to you from far away')),
         X('v3',()=>L('Куколка-помощница','Helper Doll'),()=>L('Раз за поход: здоровья меньше трети — куколка лечит на 30 %','Once per run: below a third of health, the doll heals you by 30%'))],
    sad:[X('s1',()=>L('Торг','Haggling'),()=>L('Каждая поднятая монета даёт ещё и опыт','Every coin you pick up also gives XP')),
         X('s2',()=>L('Гусли-самогуды','Self-playing Gusli'),()=>L('Нечисть рядом с тобой заслушалась и идёт медленнее','Monsters near you listen in and move slower')),
         X('s3',()=>L('Должок Морского царя','The Sea King’s Debt'),()=>L('Раз в 25 секунд волна отбрасывает нечисть от тебя','Every 25 seconds a wave throws monsters away from you'))],
    mik:[X('m1',()=>L('Сошка','The Plough'),()=>L('Тянешь за собой борозду: нечисть в ней получает урон','You drag a furrow behind you: monsters in it take damage')),
         X('m2',()=>L('Тяга земная','Weight of the Earth'),()=>L('Броня +2, но ходишь чуть медленнее','Armour +2, but you walk a little slower')),
         X('m3',()=>L('Урожай','Harvest'),()=>L('Каждые 60 побеждённых — пирожок под ноги','Every 60 defeated monsters — a pirozhok at your feet'))],
    vol:[X('o1',()=>L('Соколом','As a Falcon'),()=>L('Раз в 14 секунд вместо удара взмываешь соколом — и ты невредим','Once every 14 seconds you soar up as a falcon instead of taking a hit')),
         X('o2',()=>L('Горностаем','As a Stoat'),()=>L('Быстрее на 10 %, но здоровья на 10 % меньше','10% faster, but 10% less health')),
         X('o3',()=>L('Туром','As an Aurochs'),()=>L('Разбежался — бодаешь всех, кого задел','Get up to speed — and you ram everyone you touch'))],
    mar:[X('r1',()=>L('Полон','Captive'),()=>L('Побеждённый вожак 12 секунд ходит в цепях и бьётся за тебя','A defeated chieftain walks in chains for 12 seconds and fights for you')),
         X('r2',()=>L('Королевна','The Queen'),()=>L('Все удары и чары шире на 15 %','All blows and spells reach 15% wider')),
         X('r3',()=>L('Мечи-кладенцы','Charmed Swords'),()=>L('Два меча кружат рядом с тобой всегда','Two swords circle beside you at all times'))],
    iva:[X('k1',()=>L('Дуракам везёт','Fool’s Luck'),()=>L('Каждый шестой удар нечисти — мимо','Every sixth monster blow misses')),
         X('k2',()=>L('На печи','On the Stove'),()=>L('Стоишь две секунды — здоровье потихоньку возвращается','Stand still for two seconds — health slowly comes back')),
         X('k3',()=>L('Конёк-горбунок','The Little Humpbacked Horse'),()=>L('Раз в 20 секунд Конёк лягает ближнего','Every 20 seconds the Little Horse kicks the nearest monster'))]};
  var CBY={};(function(){for(var h in CARDS)for(var i=0;i<CARDS[h].length;i++){CARDS[h][i].h=h;CBY[CARDS[h][i].id]=CARDS[h][i];}})();

  function mkCard(g,d){return {t:'x',hx:d.id,x:{icon:'hp_'+g.hkey,name:d.name(),desc:d.desc(),tag:L('Свой приём','Signature'),
    apply:function(G1){var s=G1.hx;if(!s||s.c[d.id])return;s.c[d.id]=1;s.n++;var o=HR.sv(),x=o.x||(o.x={});x[d.id]=Math.min(9999,(x[d.id]|0)+1);
      computeStats();G1.fx.push({k:'pulse',own:1,t:0,dur:.7,r1:120});BB2.hk('heroX',d.id,G1);}}};}
  BB2.hook('upOffer',function(cards,g){var s=g&&g.hx;if(!s||!on('HERO_X')||g.first||g.daily||g.hero.lvl<N('xLvl')||!cards||cards.length<2)return;
    var a=(CARDS[g.heroId]||[]).filter(function(d){return !s.c[d.id];}),i,d;if(!a.length)return;
    for(i=0;i<cards.length;i++)if(cards[i].t==='gold'||cards[i].t==='heal')return;
    s.xo++;if(s.xo<N('xPity')&&rnd()>=N('xP'))return;
    for(i=0;i<cards.length;i++)if(!(cards[i].t==='w'&&cards[i].lvl===6))break;if(i>=cards.length)return;
    d=a[Math.floor(rnd()*a.length)%a.length];cards[i]=mkCard(g,d);s.xo=0;ev('hero_x',{a:'see',c:d.id,h:g.heroId,lv:g.hero.lvl});});
  BB2.hook('upPick',function(c,cards,g){if(c&&c.hx)ev('hero_x',{a:'pick',c:c.hx,h:g.heroId,lv:g.hero.lvl,t:Math.round(g.t)});
    else if(cards)for(var i=0;i<cards.length;i++)if(cards[i].hx)ev('hero_x',{a:'no',c:cards[i].hx,h:g.heroId});});

  BB2.hook('st',function(st){if(typeof G==='undefined'||!G||!G.hx)return;var c=G.hx.c;
    if(c.d3&&G.hx.low){st.armor+=N('d3Arm');st.might*=N('d3Mt');}
    if(c.i2){st.maxHp*=N('i2Hp');st.spd*=N('i2Spd');}
    if(c.v2)st.magnet*=N('v2Mag');
    if(c.m2){st.armor+=N('m2Arm');st.spd*=N('m2Spd');}
    if(c.o2){st.spd*=N('o2Spd');st.maxHp*=N('o2Hp');}
    if(c.r2)st.area*=N('r2Area');});

  BB2.hook('hurt',function(d,src,g){var s=g.hx;if(!s)return;var c=s.c,H=g.hero;
    if(s.sc&&s.sc.k!=='in')return false; /* «Богатырский удар»: пока идёт сцена, богатыря не задеть */
    if(c.a2&&g.t>=s.a2){s.a2=g.t+N('a2Cd');H.inv=Math.max(H.inv,.6);spark(H.x,H.y-10,'#bfe0ff',8);heroSay(L('Мимо!','Missed!'));return false;}
    if(c.o1&&g.t>=s.o1){s.o1=g.t+N('o1Cd');H.inv=Math.max(H.inv,1.2);g.dashT=Math.max(g.dashT,1.2);burst(H.x,H.y,'#c8d0dc',12,180);heroSay(L('Соколом!','As a falcon!'));return false;}
    if(c.k1){s.hn++;if(s.hn%N('k1N')===0){H.inv=Math.max(H.inv,.4);spark(H.x,H.y-10,'#ffe14a',8);heroSay(L('Авось пронесло!','Phew, lucky!'));return false;}}},20);

  BB2.hook('kill',function(e){if(typeof G==='undefined'||!G||!G.hx||e.prop||e.boss)return;var g=G,s=g.hx,c=s.c,H=g.hero;if(!s.n)return;s.k++;
    if(c.a3&&s.k%N('a3N')===0){near(H.x,H.y,200,function(q){q.slow=Math.max(q.slow||0,N('a3T'));});g.fx.push({k:'pulse',own:1,t:0,dur:.6,r1:200});}
    if(c.i3&&s.k%N('i3N')===0){near(H.x,H.y,200,function(q){q.stun=Math.max(q.stun||0,q.boss?N('i3T')/2:N('i3T'));});g.fx.push({k:'wave',own:1,t:0,dur:.5,r1:200,col:'#c8a070'});g.shake=Math.max(g.shake,6);SND.boom();}
    if(c.v1&&s.k%N('v1N')===0&&cnt(s,'hx_frog')<N('v1Max'))ally(g,{k:'hx_frog',x:e.x,y:e.y,t:N('v1T'),d:N('v1Dmg')*g.st.might,sc:1.1});
    if(c.m3&&s.k%N('m3N')===0&&!(g.wk&&g.wk.noHeal))drop('pie',H.x+rand(-40,40),H.y+rand(-40,40));
    if(c.r1&&e.elite&&!e.mini&&!cnt(s,0,1)){ally(g,{k:e.type,x:e.x,y:e.y,t:N('r1T'),d:N('r1Dmg')*g.st.might,sc:1.15,ch:1});heroSay(L('В полон!','Into chains!'));}});

  BB2.hook('pick',function(p,g){var s=g.hx;if(s&&s.c.s1&&p.k==='coin')addXp(N('s1Xp'));});

  /* союзники: лягушки Василисы, пленный вожак Марьи */
  function cnt(s,k,ch){var n=0,i;for(i=0;i<s.al.length;i++)if(ch?s.al[i].ch:s.al[i].k===k)n++;return n;}
  function ally(g,a){a.cd=.3;a.f=1;a.um=a.um||0;g.hx.al.push(a);burst(a.x,a.y,'#8fe07a',10,140);}
  function allies(g,s,dt){var H=g.hero,i,a,e,tx,ty,dx,dy,d;
    for(i=s.al.length-1;i>=0;i--){a=s.al[i];a.t-=dt;a.cd-=dt;if(a.t<=0){burst(a.x,a.y,'#cfd8e0',8,120);s.al.splice(i,1);continue;}
      e=nearest(a.x,a.y,260);if(e&&(e.x-H.x)*(e.x-H.x)+(e.y-H.y)*(e.y-H.y)>340*340)e=null;
      tx=e?e.x:H.x+(i%2?44:-44);ty=e?e.y:H.y+14;dx=tx-a.x;dy=ty-a.y;d=Math.hypot(dx,dy)||1;
      if(d>(e?e.r+14:10)){a.x+=dx/d*Math.min(d,210*dt);a.y+=dy/d*Math.min(d,210*dt);}if(Math.abs(dx)>2)a.f=dx<0?-1:1;
      if(e&&d<e.r+22&&a.cd<=0){a.cd=.5;if(a.um&&U)U.hit(e,a.d,dx/d*140,dy/d*140);else hitEnemy(e,a.d,dx/d*140,dy/d*140);}}}

  /* ====================== 2. ВТОРЫЕ ИМЕННЫЕ УМЕНИЯ ====================== */
  var UM2={dob:'dob2',ale:'ale2',ily:'ily2',vas:'vas2',sad:'sad2',mik:'mik2',vol:'vol2',mar:'mar2',iva:'iva2'};
  function u2(h,i){return BB2.n('hero.u_'+h,NUM['u_'+h])[i];}
  function reg2(h,nm,ds,ic,o){if(!U||!U.hero)return;var rk=BB2.n('hero.second',3);o.id=UM2[h];o.rank=rk;o.name=nm;o.desc=ds;o.icon=ic;o.cd=u2(h,0);o.dur=u2(h,1);
    o.from=function(){return L(hname(h)+': звание «'+RANKS[rk]+'»',hname(h)+': rank “'+RANKS[rk]+'”');};
    if(on('HERO_UM2'))U.hero(h,o);}
  function strong(g,fn){var a=g.en,i,e;for(i=0;i<a.length;i++){e=a[i];if(!e.dead&&!e.prop&&(e.boss||e.elite||e.mini)&&onScreen(e,40))fn(e);}}
  function mark(g,e,t,k){if(e.umF>g.t&&e.umK>k)return;e.umF=g.t+t;e.umK=k;}
  /* договор UM живёт в догружаемом наборе 'um' — регистрируем после него (BB2.after); UM выключен — не грузим его ради этого */
  function regAll(){U=BB2.um;if(!U||!U.hero)return;
  reg2('dob',()=>L('Змееборец','Dragonslayer'),()=>L('6 секунд боссы и вожаки получают в полтора раза больше урона','For 6 seconds bosses and chieftains take one and a half times more damage'),'gory',{
    auto:function(g){var n=0;strong(g,function(){n++;});return n>0;},
    use:function(g,P,x){var n=0;strong(g,function(){n++;});if(!n)return false;x.st.on=u2('dob',1);x.st.q=0;g.fx.push({k:'wave',own:1,t:0,dur:.5,r1:160,col:'#ff7a2a'});SND.level();},
    tick:function(g,dt,st){st.q-=dt;if(st.q>0)return;st.q=.2;strong(g,function(e){mark(g,e,.35,u2('dob',2));});},
    draw:function(c,g,st){strong(g,function(e){drawSpr('hx_ring',e.x,e.y,e.r/34,e.r/34,0,g.t*2,.8);});}});
  reg2('ale',()=>L('Бей-беги','Hit and Run'),()=>L('Рывок сквозь толпу и залп стрел веером вперёд','A dash through the horde and a fan of arrows ahead'),'i_bow',{
    use:function(g,P,x){var H=g.hero,l=Math.hypot(H.fx,H.fy)||1,ux=H.fx/l,uy=H.fy/l,d=u2('ale',1),i,a;H.inv=Math.max(H.inv,d);g.dashT=Math.max(g.dashT,d);x.st.on=d;
      near(H.x,H.y,300,function(e,ex,ey){if(ex*ux+ey*uy>.75)U.hit(e,u2('ale',2)*P,ex*260,ey*260);});
      for(i=0;i<28&&g.pt.length<400;i++){a=Math.atan2(uy,ux)+rand(-.42,.42);d=rand(260,620);g.pt.push({x:H.x,y:H.y-6,vx:Math.cos(a)*d,vy:Math.sin(a)*d,t:0,dur:rand(.25,.45),col:'#fff3b0',s:rand(2,3.5),add:1});}SND.shoot();}});
  reg2('ily',()=>L('Сиднем сидел','Thirty Years of Rest'),()=>L('Тридцать лет копил — один удар раскидывает всех вокруг','Thirty years in the making — one blow scatters everyone around'),'i_mace',{
    use:function(g,P,x){var H=g.hero,R=210*g.st.area;g.fx.push({k:'wave',own:1,t:0,dur:.55,r1:R,col:'#e0a43a'});g.shake=Math.max(g.shake,12);SND.boom();
      near(H.x,H.y,R,function(e,ux,uy){U.hit(e,u2('ily',2)*P,ux*640,uy*640);});}});
  reg2('vas',()=>L('В лягушку','Into a Frog'),()=>L('Пять ближних — в лягушек: 8 секунд они дерутся за тебя','The five nearest become frogs and fight for you for 8 seconds'),'hx_frog',{
    auto:function(g){var n=0;near(g.hero.x,g.hero.y,220,function(e){if(!e.boss&&!e.elite&&!e.mini)n++;});return n>=5;},
    use:function(g,P,x){var H=g.hero,a=[],i,e;near(H.x,H.y,260,function(q,ux,uy,d){if(!q.boss&&!q.elite&&!q.mini&&!q.invul)a.push([d,q]);});if(!a.length)return false;
      a.sort(function(p,q){return p[0]-q[0];});for(i=0;i<a.length&&i<5;i++){e=a[i][1];ally(g,{k:'hx_frog',x:e.x,y:e.y,t:u2('vas',1),d:u2('vas',2)*P,sc:1.1,um:1});U.hit(e,e.hp+1,0,0);}
      g.fx.push({k:'pulse',own:1,t:0,dur:.7,r1:260,evo:1});SND.heal();}});
  reg2('sad',()=>L('Торг','Haggling'),()=>L('Вся нечисть на экране торгуется и не дерётся две с половиной секунды','Every monster on screen stops to haggle for two and a half seconds'),'p_coin',{
    use:function(g,P,x){var d=u2('sad',1)*(x.auto?BB2.n('um.autoK',.8):1),k=BB2.n('um.bossStun',.5),a=g.en,i,e;
      for(i=0;i<a.length;i++){e=a[i];if(e.dead||e.prop||!onScreen(e,30))continue;e.stun=Math.max(e.stun||0,e.boss?d*k:d);}
      g.eproj.length=0;x.st.on=d;g.fx.push({k:'pulse',own:1,t:0,dur:.9,r1:VIEW.R,evo:1});SND.coin();}});
  reg2('mik',()=>L('Тяга земная','Weight of the Earth'),()=>L('Стягивает нечисть в кучу и встряхивает землю','Pulls monsters into a heap and shakes the earth'),'d_stone',{
    auto:function(g){var n=0;near(g.hero.x,g.hero.y,220,function(){n++;});return n>=6;},
    use:function(g,P,x){var H=g.hero,st=x.st;st.on=u2('mik',1);st.P=P;st.x=H.x;st.y=H.y;st.A=g.st.area;g.fx.push({k:'pulse',own:1,t:0,dur:.6,r1:240});SND.crack();},
    tick:function(g,dt,st){forNear(st.x,st.y,240,function(e){if(e.dead||e.boss||e.prop)return;var dx=st.x-e.x,dy=st.y-e.y,d=Math.hypot(dx,dy)||1;if(d>240||d<e.r+18)return;e.x+=dx/d*Math.min(d,260*dt);e.y+=dy/d*Math.min(d,260*dt);});},
    off:function(g,st){var R=120*(st.A||1);g.fx.push({k:'wave',x:st.x,y:st.y,t:0,dur:.5,r1:R,col:'#8a5a2e'});g.shake=Math.max(g.shake,9);SND.boom();
      near(st.x,st.y,R,function(e,ux,uy){e.stun=Math.max(e.stun||0,e.boss? .4:.8);U.hit(e,u2('mik',2)*st.P,ux*260,uy*260);});},
    draw:function(c,g,st){drawSpr('hx_bor',st.x,st.y,3.2,3.2,0,g.t*3,.75);}});
  reg2('vol',()=>L('Соколом','As a Falcon'),()=>L('Взмываешь над толпой — не задеть; приземлился — удар вокруг','You soar above the horde, untouchable, then land with a blow around you'),'bird',{
    use:function(g,P,x){var H=g.hero,d=u2('vol',1);H.inv=Math.max(H.inv,d+.1);g.dashT=Math.max(g.dashT,d);x.st.on=d;x.st.P=P;x.st.A=g.st.area;burst(H.x,H.y,'#c8d0dc',12,180);SND.swing();},
    off:function(g,st){var H=g.hero,R=130*(st.A||1);g.fx.push({k:'wave',own:1,t:0,dur:.4,r1:R,col:'#c8d0dc'});g.shake=Math.max(g.shake,7);SND.boom();
      near(H.x,H.y,R,function(e,ux,uy){U.hit(e,u2('vol',2)*st.P,ux*480,uy*480);});},
    draw:function(c,g,st){var H=g.hero;drawSpr('bird',H.x,H.y-34-Math.sin(g.t*14)*4,H.flip*.8,.8);}});
  reg2('mar',()=>L('Полон','Captive'),()=>L('Самый сильный рядом — в цепи: стоит и получает в полтора раза больше урона','The strongest nearby goes into chains: it stands still and takes one and a half times more damage'),'hx_chain',{
    auto:function(g){var n=0;strong(g,function(){n++;});return n>0;},
    use:function(g,P,x){var H=g.hero,t=null,bd=1e9,d=u2('mar',1);strong(g,function(e){var q=(e.x-H.x)*(e.x-H.x)+(e.y-H.y)*(e.y-H.y);if(q<bd&&q<340*340&&!e.invul){bd=q;t=e;}});
      if(!t)t=nearest(H.x,H.y,260);if(!t||t.invul)return false;d=t.boss?d*BB2.n('um.bossStun',.5):d;t.stun=Math.max(t.stun||0,d);t.umF=g.t+d;t.umK=u2('mar',2);x.st.on=d;x.st.e=t;SND.crack();},
    draw:function(c,g,st){var e=st.e;if(e&&!e.dead)drawSpr('hx_chain',e.x,e.y+e.r*.3,e.r/11,e.r/11);}});
  reg2('iva',()=>L('На печи','On the Stove'),()=>L('Три секунды едешь на печи: не задеть, печь давит нечисть и греет бока','Ride the stove for three seconds: untouchable, it crushes monsters and warms your sides'),icon('m_oven','loaf'),{
    use:function(g,P,x){var H=g.hero,d=u2('iva',1);H.inv=Math.max(H.inv,d);H.hp=Math.min(g.st.maxHp,H.hp+g.st.maxHp*.08);x.st.on=d;x.st.P=P;burst(H.x,H.y,'#e0a43a',12,150);SND.heal();},
    tick:function(g,dt,st){var H=g.hero;H.inv=Math.max(H.inv,Math.min(st.on,.2));near(H.x,H.y,34,function(e,ux,uy){if((e.hk.hp2||0)>g.t)return;e.hk.hp2=g.t+.3;U.hit(e,u2('iva',2)*st.P,ux*380,uy*380);});},
    draw:function(c,g,st){var H=g.hero,k=icon('m_oven','chest');drawSpr(k,H.x,H.y+14,56/ART[k].size,56/ART[k].size);}});

  }
  if(on('UM_ON')&&on('HERO_UM2'))BB2.after('um',regAll);

  /* ====================== 3–5. СЦЕНЫ: кино-выход, «Богатырский удар», лубок ====================== */
  var REPLY={dob:()=>L('Змеев бивал — и тебя одолею!','I’ve beaten dragons — you’re next!'),ale:()=>L('Пока ты грозишься, я уже целюсь.','While you boast, I’m already aiming.'),
    ily:()=>L('Тридцать лет на печи силу копил — получай!','Thirty years of rest — here comes the interest!'),vas:()=>L('Я таких в лягушек превращаю.','I turn your kind into frogs.'),
    sad:()=>L('Спою тебе отходную. Недорого.','I’ll sing you a farewell. Cheap.'),mik:()=>L('Землю пахал — и тебя перепашу.','I ploughed the land — I’ll plough you too.'),
    vol:()=>L('Хоть волком, хоть соколом — догоню.','As a wolf or a falcon — I’ll catch you.'),mar:()=>L('В цепи тебя — да в чулан!','Into chains with you — and into the closet!'),
    iva:()=>L('Авось пронесёт! Меня — точно.','Maybe luck will hold! Mine will.'),
    dob_gory:()=>L('Здравствуй, Горыныч. Головы-то отросли?','Hello, Gorynych. Heads grown back, have they?'),ily_solo:()=>L('Не свисти, Соловей, — денег не будет!','Don’t whistle, Nightingale — it’s bad luck!'),
    iva_kosh:()=>L('А я знаю, где твоя иголка!','I know where your needle is!'),mar_kosh:()=>L('Ты у меня уже висел в чулане. Повисишь ещё.','You’ve hung in my closet before. You’ll hang again.'),
    vas_yaga:()=>L('Бабушка, я твои загадки с детства знаю.','Granny, I’ve known your riddles since I was little.'),sad_morcar:()=>L('Ваше величество, я за расчётом!','Your Majesty, I’ve come to settle up!'),
    ale_tugar:()=>L('Тугарин! Опять за чужим столом?','Tugarin! At someone else’s table again?')};
  function reply(h,type){return (REPLY[h+'_'+type]||REPLY[h]||REPLY.dob)();}
  function bname(e){var v=e.bv&&BOSS[e.bv];return v&&v.n?L(v.n,v.en&&v.en.n||v.n):EN[e.type].n;}
  function btitle(e){var v=e.bv&&BOSS[e.bv];return v&&v.title?L(v.title.ru,v.title.en||v.title.ru):BOSS_TITLE[e.type]?BOSS_TITLE[e.type]():'';}

  BB2.hook('bossIn',function(e,g){var s=g.hx;if(!s)return;
    if(!on('HERO_KINO'))return;
    var pb=PH.boss[e.type],mw=Math.min(300,VIEW.W-150);
    if(g.banner&&g.banner.pri===5)g.banner=null;compact(g.bub,function(b){return b.e!==e;});
    s.sc={k:'in',t:0,e:e,T:N('kinoT'),bp:plate([{t:bname(e),s:19,c:'#ffd84a',w:900},{t:btitle(e),s:12.5,c:'#e8d3a8',w:700},{t:pb?'— '+pb.intro:'',s:14.5,c:'#fff',w:800}],mw),
      hp:plate([{t:hname(g.heroId),s:13,c:'#ffd84a',w:800},{t:'— '+reply(g.heroId,e.type),s:14.5,c:'#fff',w:800}],mw,{bd:'#bfe0ff'})};
    var o=HR.sv();o.k=Math.min(99999,(o.k|0)+1);ev('hero_kino',{b:e.bv||e.type,h:g.heroId,t:Math.round(g.t)});});

  function finStart(g,s,b){var o={id:'fin',name:function(){return L('Богатырский удар','Bogatyr’s Blow');},icon:'i_sword',use:function(G1){strike(G1,0);}};
    s.sc={k:'fin',t:0,e:b,q:0,tp:plate([{t:L('Богатырский удар!','Bogatyr’s Blow!'),s:22,c:'#ffd84a',w:900},{t:bname(b)+L(' еле стоит',' can barely stand'),s:13,c:'#e8d3a8',w:700}],Math.min(330,VIEW.W-24)),
      pp:plate([{t:PC?L('Жми ПРОБЕЛ!','Press SPACE!'):L('Жми!','Tap!'),s:20,c:'#3a1408',w:900}],240,{bg:'#ffd84a',bd:'#fff',rad:16})};
    b.invul=true;s.sc.inv=1;g.eproj.length=0;if(U&&U.over)U.over(0,o);if(!calm())g.shake=Math.max(g.shake,6);SND.boss();vib(40,1);
    ev('hero_fin',{a:'see',b:b.bv||b.type,h:g.heroId,t:Math.round(g.t)});}
  function strike(g,auto){var s=g&&g.hx,sc=s&&s.sc;if(!sc||sc.k!=='fin'||(!auto&&sc.t<.3))return false;
    sc.k='hit';sc.hand=auto?0:1;sc.ms=Math.round(sc.t*1000);sc.t=0;sc.clr=1;SND.swing();vib(30,1);heroSay(L('Эх, раззудись, плечо!','Here comes the blow!'));return true;}
  function finEnd(g,s){var sc=s.sc,b=sc.e,o=HR.sv();s.sc=null;if(U&&U.over)U.over(0,null);s.hand=sc.hand;if(sc.hand)o.f=Math.min(99999,(o.f|0)+1);else o.a=Math.min(99999,(o.a|0)+1);
    ev('hero_fin',{a:sc.hand?'hand':'auto',b:b.bv||b.type,h:g.heroId,ms:sc.ms});if(sc.hand&&typeof BB2.pdv==='function')BB2.pdv('hero.fin');if(sc.hand&&BB2.byl&&BB2.byl.fact)BB2.byl.fact('udar',1); /* MERGE: «Богатырский удар» — в былину похода */
    if(b.dead)return;b.invul=false;b.stun=0;b.hp=0;if(!calm())g.shake=Math.max(g.shake,14);killEnemy(b);}
  function scene(g,s,dt){var sc=s.sc,H=g.hero,b=sc.e,rt=g.slowT>0&&!calm()?dt/.4:dt,a,i,e; /* rt — «настоящие» секунды: кадр логики при замедлении идёт ×0,4 */
    if(sc.k==='in'){sc.t+=dt;if(sc.t>=sc.T||b.dead||g.win)s.sc=null;return;}
    sc.t+=rt;
    if(b.dead||g.win||g.over){if(sc.inv&&!b.dead)b.invul=false;if(U&&U.over)U.over(0,null);s.sc=null;return;}
    if(sc.clr){sc.clr=0;if(U&&U.over)U.over(0,null);} /* подмену кнопки снимаем в следующем кадре: UM после use ещё читает её */
    b.invul=true;b.stun=Math.max(b.stun||0,.4);H.inv=Math.max(H.inv,.4);if(!calm())g.slowT=Math.max(g.slowT||0,.2);
    sc.q-=rt;if(sc.q<=0){sc.q=.2;a=g.en;for(i=0;i<a.length;i++){e=a[i];if(!e.dead&&!e.prop)e.stun=Math.max(e.stun||0,.6);}g.eproj.length=0;}
    if(sc.k==='fin'){if(sc.t>=N('finWait'))strike(g,1);}
    else if(sc.t>=.28)finEnd(g,s);}

  /* смертельный удар по боссу главы (крючок bossLow в hitEnemy): вместо гибели — сцена удара. Босс получил весь свой урон сполна — бой не короче и не легче */
  BB2.hook('bossLow',function(e,g){var s=g&&g.hx;if(!s||!on('HERO_FIN')||g.endless||g.win||g.over||e!==g.boss||e.mini||e.hxF)return;
    e.hxF=1;e.hp=1;s.sc=null;finStart(g,s,e);return true;});
  BB2.hook('bossDie',function(e,g){var s=g.hx;if(!s||g.endless)return;var hand=s.hand==null?-1:s.hand;
    BB2.hk('heroWin',{boss:e.type,bv:e.bv||null,hero:g.heroId,t:Math.round(g.t),hand:hand});
    if(!on('HERO_LUBOK'))return;
    s.lub={t:0,type:e.type,title:defeated(e.type,e),cap:hname(g.heroId)+' · '+fmtTime(g.t),
      sub:hand===1?L('Богатырский удар!','Bogatyr’s Blow!'):fem(g.heroId)?L('Слава богатырше!','Glory to the heroine!'):L('Слава богатырю!','Glory to the hero!'),im:null,b:0};});
  function lubImg(g,o){var W=Math.min(330,VIEW.W-28),Hh=200,k=Math.min(3,VIEW.dpr||1),c=mkCanvas(W*k,Hh*k),x=c.getContext('2d'),im,f=17;
    x.setTransform(k,0,0,k,0,0);rrect(x,2,2,W-4,Hh-4,10);x.fillStyle='#f3e4bf';x.fill();x.lineWidth=4;x.strokeStyle='#7a2a1a';x.stroke();
    rrect(x,8,8,W-16,Hh-16,6);x.lineWidth=1.5;x.strokeStyle='#c08a2e';x.stroke();
    x.fillStyle='#e9d29c';x.fillRect(14,112,W-28,30);x.fillStyle='#c08a2e';x.fillRect(14,141,W-28,2);
    x.fillStyle='#d8452e';for(var i=0;i<4;i++){x.beginPath();x.arc(i%2?W-16:16,i<2?16:Hh-16,4,0,PI2);x.fill();}
    im=big(o.type,108);if(im){x.save();x.translate(W-78,98);x.rotate(1.05);x.globalAlpha=.9;x.drawImage(im,-54,-54,108,108);x.restore();}
    im=big('i_sword',46);if(im){x.save();x.translate(W/2-4,96);x.rotate(.5);x.drawImage(im,-23,-23,46,46);x.restore();}
    im=big('hp_'+g.hkey,104);if(im)x.drawImage(im,20,36,104,104);
    x.textAlign='center';x.textBaseline='middle';x.fillStyle='#7a2a1a';x.font=fnt(f,900);while(f>12&&x.measureText(o.title).width>W-34){f--;x.font=fnt(f,900);}x.fillText(o.title,W/2,25);
    x.font=fnt(14,800);x.fillStyle='#3a2416';x.fillText(o.cap,W/2,Hh-40);x.font=fnt(12.5,800);x.fillStyle='#a0401a';x.fillText(o.sub,W/2,Hh-21);
    c.w=W;c.h=Hh;return c;}

  /* ---------- кадр логики ---------- */
  BB2.hook('frame',function(dt,g){var s=g.hx;if(!s)return;var H=g.hero,c=s.c,M=g.st.might,b,e,i,p,x,y,a;
    if(s.sc)scene(g,s,dt);
    if(s.lub){s.lub.t+=dt;if(!s.lub.b){s.lub.b=1;g.banner=null;if(g.bq)g.bq.length=0;}}
    if(g.win||g.over)return;
    if(s.al.length)allies(g,s,dt);
    if(!s.n)return;
    s.mv=H.moving?s.mv+dt:0;s.sd=H.moving?0:s.sd+dt;
    if(c.d1){b=g.boss&&!g.boss.dead?g.boss:g.mb&&!g.mb.dead?g.mb:null;
      if(b){if(s.bh!=null&&b.hp<s.bh)s.bt=.6;s.bt-=dt;s.bk=Math.max(0,Math.min(N('d1Max'),s.bk+(s.bt>0?N('d1Up'):-.06)*dt));s.bh=b.hp;if(s.bk>.01)mark(g,b,.3,1+s.bk);}else{s.bh=null;s.bk=0;}}
    if(c.d2&&g.q.dars>s.qd)near(H.x,H.y,170,function(q){q.stun=Math.max(q.stun||0,q.boss?N('d2Stun')*.4:N('d2Stun'));});
    s.qd=g.q.dars;
    if(c.d3){a=H.hp<g.st.maxHp*(s.low?N('d3Hp')+.07:N('d3Hp'));if(a!==s.low){s.low=a;computeStats();if(a)heroSay(L('Стоять насмерть!','Stand to the last!'));}}
    if(c.a1&&s.mv>=s.a1n){s.a1n=s.mv+N('a1T');for(i=0;i<N('a1N');i++){a=i/N('a1N')*PI2+g.t;g.proj.push({k:'arrow',id:g.pid++,x:H.x,y:H.y-6,vx:Math.cos(a)*520,vy:Math.sin(a)*520,a:a,life:.8,dmg:N('a1Dmg')*M,pierce:2,hit:new Set()});}}
    if(!H.moving)s.a1n=N('a1T');
    if(c.i1){if(!H.moving)s.ch=Math.min(3,s.ch+dt);else if(s.ch>=.8){x=N('i1R')*g.st.area;y=N('i1Dmg')*s.ch*M;s.ch=0;g.fx.push({k:'wave',own:1,t:0,dur:.45,r1:x,col:'#c8a070'});g.shake=Math.max(g.shake,7);SND.boom();
        near(H.x,H.y,x,function(q,ux,uy){q.stun=Math.max(q.stun||0,q.boss? .2:.6);hitEnemy(q,y,ux*300,uy*300);});}else s.ch=0;}
    if(c.v3&&!s.v3&&H.hp>0&&H.hp<g.st.maxHp*N('v3Hp')){s.v3=1;H.hp=Math.min(g.st.maxHp,H.hp+g.st.maxHp*N('v3Heal'));g.fx.push({k:'pulse',own:1,t:0,dur:.8,r1:120});SND.heal();heroSay(L('Спасибо, куколка!','Thank you, little doll!'));}
    s.q4-=dt;if(s.q4<=0){s.q4=.25;
      if(c.s2)near(H.x,H.y,N('s2R'),function(q){q.slow=Math.max(q.slow||0,.4);});
      if(c.m1)for(i=0;i<s.tr.length;i++){p=s.tr[i];near(p.x,p.y,24,function(q){if((q.hk.hb||0)>g.t)return;q.hk.hb=g.t+.5;hitEnemy(q,N('m1Dmg')*M,0,0);});}}
    if(c.s3&&g.t>=s.s3){a=0;near(H.x,H.y,180,function(){a++;});if(a>=3){s.s3=g.t+N('s3Cd');g.fx.push({k:'wave',own:1,t:0,dur:.5,r1:180,col:'#3ac8e0'});SND.swing();near(H.x,H.y,180,function(q,ux,uy){hitEnemy(q,N('s3Dmg')*M,ux*560,uy*560);});}}
    if(c.m1){for(i=s.tr.length-1;i>=0;i--){s.tr[i].t-=dt;if(s.tr[i].t<=0)s.tr.splice(i,1);}
      if(H.moving&&(!s.tl||(H.x-s.tl[0])*(H.x-s.tl[0])+(H.y-s.tl[1])*(H.y-s.tl[1])>26*26)){s.tl=[H.x,H.y];s.tr.push({x:H.x,y:H.y+12,t:2.4,a:Math.atan2(H.fy,H.fx)});if(s.tr.length>16)s.tr.shift();}}
    if(c.o3&&s.mv>=1.5)near(H.x,H.y,26,function(q,ux,uy){if((q.hk.ot||0)>g.t)return;q.hk.ot=g.t+.5;hitEnemy(q,N('o3Dmg')*M,ux*420,uy*420);});
    if(c.r3)for(i=0;i<2;i++){a=g.t*3.2+i*Math.PI;x=H.x+Math.cos(a)*70;y=H.y+Math.sin(a)*70;near(x,y,16,function(q){if((q.hk.rs||0)>g.t)return;q.hk.rs=g.t+.4;hitEnemy(q,N('r3Dmg')*M,Math.cos(a)*100,Math.sin(a)*100);});}
    if(c.k2&&s.sd>=2&&H.hp>0)H.hp=Math.min(g.st.maxHp,H.hp+g.st.maxHp*N('k2Reg')*dt);
    if(c.k3&&g.t>=s.k3){e=nearest(H.x,H.y,120);if(e){s.k3=g.t+N('k3Cd');x=e.x-H.x;y=e.y-H.y;a=Math.hypot(x,y)||1;hitEnemy(e,N('k3Dmg')*M,x/a*620,y/a*620);spark(e.x,e.y,'#ffe14a',8);SND.boom();}}
  });

  /* ---------- рисование на поле (координаты мира) ---------- */
  BB2.hook('draw',function(c,g){var s=g.hx,i,a,p,H=g.hero;if(!s)return;
    for(i=0;i<s.tr.length;i++){p=s.tr[i];drawSpr('hx_bor',p.x,p.y,1,1,0,p.a,Math.min(1,p.t)*.85);}
    for(i=0;i<s.al.length;i++){a=s.al[i];drawSpr(a.k,a.x,a.y-Math.abs(Math.sin(g.t*9+i))*(a.ch?2:6),a.f*a.sc,a.sc,0,0,Math.min(1,a.t*2)*(a.ch? .85:1));if(a.ch)drawSpr('hx_chain',a.x,a.y+6,1,1);}
    if(s.c.r3&&!g.win)for(i=0;i<2;i++){a=g.t*3.2+i*Math.PI;drawSpr('i_sword',H.x+Math.cos(a)*70,H.y+Math.sin(a)*70,.9,.9,false,a+Math.PI*.75);}
    if(s.sc&&s.sc.k!=='in'&&!s.sc.e.dead)drawSpr('hx_ring',s.sc.e.x,s.sc.e.y,s.sc.e.r/30,s.sc.e.r/30,0,g.t*2.5);});

  /* ---------- поверх всего (CSS-пиксели) ---------- */
  function ease(t){t=Math.max(0,Math.min(1,t));return 1-(1-t)*(1-t);}
  BB2.hook('drawTop',function(c,g){var s=g.hx;if(!s)return;var W=VIEW.W,Hh=VIEW.H,sc=s.sc,o=s.lub,top=(window.__safeTop||0),bh=Math.round(Hh*.12),a,t,sz,im,x,y,w,q;
    if(sc&&sc.k==='in'){t=sc.t;a=ease(t/.25)*ease((sc.T-t)/.3);c.fillStyle='rgba(8,5,12,.88)';c.fillRect(0,0,W,bh*a+top);c.fillRect(0,Hh-bh*a,W,bh*a);
      sz=Math.min(150,Math.round(W*.38));im=big(sc.e.type,sz);q=ease(t/.35);c.globalAlpha=a;
      x=W-sz-8+(1-q)*sz;y=top+Math.max(bh+16,140);if(im)c.drawImage(im,x,y,sz,sz);
      w=sc.bp.w;c.drawImage(sc.bp,Math.max(8,W-sz-18-w)-(1-q)*40,y+Math.max(0,(sz-sc.bp.h)/2),w,sc.bp.h);
      if(t>.95){q=ease((t-.95)/.3);sz=Math.min(112,Math.round(W*.3));im=big('hp_'+g.hkey,sz);c.globalAlpha=a*q;x=8-(1-q)*sz;y=Hh-bh-sz-78;if(im)c.drawImage(im,x,y,sz,sz);
        c.drawImage(sc.hp,Math.min(W-sc.hp.w-8,sz+18)+(1-q)*40,y+Math.max(0,(sz-sc.hp.h)/2),sc.hp.w,sc.hp.h);}
      c.globalAlpha=1;return;}
    if(sc){t=sc.t;a=sc.k==='fin'?ease(t/.2):1;c.fillStyle='rgba(8,5,12,.82)';c.fillRect(0,0,W,(bh*.8)*a+top);c.fillRect(0,Hh-bh*.45*a,W,bh*.45*a);
      if(sc.k==='fin'){w=sc.tp.w;c.globalAlpha=a;c.drawImage(sc.tp,(W-w)/2,top+Math.max(bh*.8+14,140),w,sc.tp.h);
        q=1+(calm()?0:Math.sin(t*9)*.06);w=sc.pp.w*q;y=Hh*.7;c.drawImage(sc.pp,(W-w)/2,y-sc.pp.h*q/2,w,sc.pp.h*q);
        q=Math.max(0,1-t/N('finWait'));c.fillStyle='rgba(255,216,74,.9)';c.fillRect((W-160)/2,y+sc.pp.h/2+10,160*q,5);c.globalAlpha=1;}
      else{q=Math.min(1,t/.28);if(!calm()){c.fillStyle='rgba(255,255,255,'+(.55*(1-q)).toFixed(2)+')';c.fillRect(0,0,W,Hh);}
        im=big('hx_slash',Math.min(W,520));if(im){w=Math.min(W,520)*(.7+q*.6);c.globalAlpha=1-q*.7;c.drawImage(im,(W-w)/2,Hh*.42-w/2,w,w);c.globalAlpha=1;}}
      return;}
    if(o){if(!o.im)o.im=lubImg(g,o);t=o.t;if(t<.5)return;q=ease((t-.5)/.35);w=o.im.w*(1.5-.5*q);a=o.im.h*(1.5-.5*q);c.globalAlpha=q;
      c.save();c.translate(W/2,top+Hh*.34);c.rotate(-.035*q);c.drawImage(o.im,-w/2,-a/2,w,a);c.restore();c.globalAlpha=1;}});

  /* ---------- нажатия: касание по полю и клавиши (кнопку умения ведёт UM через BB2.um.over) ---------- */
  BB2.hook('tap',function(e,g){var s=g.hx;if(!s||!s.sc||s.sc.k==='in')return;if(s.sc.k==='fin')strike(g,0);return true;},10);
  window.addEventListener('keydown',function(e){if(typeof G==='undefined'||!G||!G.hx||!G.hx.sc||G.hx.sc.k!=='fin'||G.paused||G.over||e.repeat)return;
    if(e.code==='Space'||e.code==='Enter'){e.preventDefault();strike(G,0);}});

  /* ---------- поход ---------- */
  var R={};
  R.run=function(g){if(g.hx)return;g.hx={h:g.heroId,c:{},n:0,k:0,xo:0,al:[],tr:[],tl:null,sc:null,lub:null,hand:null,
    mv:0,sd:0,qd:g.q?g.q.dars:0,q4:0,a1n:N('a1T'),a2:0,o1:0,hn:0,ch:0,bk:0,bt:0,bh:null,low:false,v3:0,s3:8,k3:6};};
  R.busy=function(){return typeof G!=='undefined'&&!!(G&&G.hx&&G.hx.sc);};
  R.cards=function(h){return (CARDS[h||S.hero]||[]).map(function(d){return {id:d.id,name:d.name(),desc:d.desc()};});};
  R.um2=function(h){return UM2[h||S.hero]||'';};
  R.strike=strike;R.CARDS=CARDS;R.NUM=NUM;

  /* ---------- вкладка «Богатыри»: строка «Свои приёмы» у каждого ---------- */
  function heroLines(el){if(!el||!on('HERO_X')&&!on('HERO_UM2'))return;var cs=el.querySelectorAll('.hero-card[data-h]'),i,h,t,d,a,sp,rk=BB2.n('hero.second',3);
    for(i=0;i<cs.length;i++){h=cs[i].getAttribute('data-h');t=cs[i].querySelector('.t');if(!t||t.querySelector('.hxl')||!CARDS[h])continue;
      a=on('HERO_X')?L('Свои приёмы: ','Signature cards: ')+CARDS[h].map(function(q){return q.name();}).join(' · '):'';
      d=U&&U.def&&on('HERO_UM2')&&on('UM_ON')?U.def(UM2[h]):null;
      if(d)a+=(a?'<br>':'')+L('Второе умение: ','Second skill: ')+U.tx(d.name)+(((S.rank||{})[h]||0)>=rk?'':L(' — со звания «',' — from rank “')+RANKS[rk]+L('»','”'));
      if(!a)continue;sp=document.createElement('span');sp.className='hxl';sp.style.cssText='display:block;font-size:12px;color:var(--cOk,#bfe8b0);margin-top:3px';sp.innerHTML=a;
      d=t.querySelector('.tag');if(d)t.insertBefore(sp,d);else t.appendChild(sp);}}
  BB2.hook('tab',function(t,el){if(t!=='Heroes')return;heroLines(el);
    if(el&&!el.hxObs&&typeof MutationObserver!=='undefined'){el.hxObs=new MutationObserver(function(){if(typeof curTab!=='undefined'&&curTab==='Heroes')heroLines(el);});el.hxObs.observe(el,{childList:true});}});

  HR.rt=R;
  try{if(typeof G!=='undefined'&&G&&!G.over&&!G.hx&&HR.any())R.run(G);}catch(e){}
  try{if(typeof curTab!=='undefined'&&curTab==='Heroes'&&!document.body.classList.contains('run'))heroLines(document.getElementById('tabHeroes'));}catch(e){}
})();
