/* ===== b3-gran.js — Богатырь 3.0 волна 1. П2 «Бой на грани» (набор b3x). Флаги: b3gran (всё ниже, кроме танца), b3tan (босс-танец). Без ?. ?? .finally
   1) «Сила по зову» — давление P (пол LO, потолок по месту): здоровье давно ≥ порога → P растёт (урон по богатырю ×P, новая нечисть крепче/чуть быстрее,
      добавочный спавн); еле жив → передышка (P×0,75, 7 с урон ×0,5 и без добавки). Где: НЕпройденные главы (на выбранной сложности, кроме главы 1),
      Сеча, Испытание недели, Калинов мост / «Мост без конца». Пройденные главы, Поход дня, Лихая неделя, первый поход — как было. Новичок гл.2–3 (Обычная) — мягко.
   2) Предупреждение орды — за 8 с до кольца/стаи/события главы/орды Сечи: полоса с того края + строка gran.warn {side}; стая приходит именно оттуда.
   3) Босс-танец (b3tan, B3.open('tan')) — главари мест 1–6 и Кощей там же, где «Сила по зову» (+ глава 1): удар по полосе/кругу с «⚠» за 1,2 с (G.warn bk:1 — бот обходит).
   4) «Последний вздох» — раз за поход при гибели (крючок down, очередь 55: после «Рано падать» 10, яйца-чуда 50; отвар знахарки — первым): 8 с бессмертия, одолей N — встанешь с 30 %.
   5) Свой богатырь виден: круг «я здесь» и обводка 2 px (поверх толпы; ×1,3 на телефоне; спокойный режим — без колыхания).
   6) Для П4: G.b3left — секунд до главаря в момент гибели (0 — главарь вышел или его нет), G.b3vzd=1 — «Последний вздох» был.
   7) Старому игроку в первый день 3.0 — строка gran.old в начале первого похода.
   STAT b3 {a:'gran', c место, p ×100 итог, mx ×100 пик, mn мин.здоровье %, w предупреждений, v вздох 0/1 встал/2 пал, tn "попал/увернулся"}.
   Сохранение S.bb2.b3g {s: стартовое P×100 следующего похода, o: день показа gran.old}. Отладка: B3G.g() — состояние похода. */
(function(){if(typeof B3==='undefined'||typeof BB2!=='object')return;var B=BB2;
  function fix(o){var r={};if(+o.s>=60&&+o.s<=300)r.s=Math.round(+o.s);if(+o.o>0)r.o=+o.o|0;return r;}
  function merge(a,b){var r={};if(a.s||b.s)r.s=Math.max(a.s||0,b.s||0);if(a.o||b.o)r.o=Math.max(a.o||0,b.o||0);return fix(r);}
  B.save('b3g',{fix:fix,merge:merge});
  /* запасной банк строк (основной кладёт П5 поверх) */
  B3.bank('gran.warn',{ru:['⚠ Идут {side}!','⚠ Нечисть {side} — готовься!','⚠ Гляди: {side} валят!'],en:['⚠ Incoming {side}!','⚠ Monsters {side} — get ready!','⚠ Look out: {side}!']}); // i18n:ru — запасной банк ru+en (B3.say выбирает язык)
  B3.bank('gran.angry',{ru:['Нечисть почуяла богатыря — злее лезет!','Ишь, разошёлся! Нечисть зовёт подмогу.','Почуяли силу — теперь держись!'],en:['The monsters smell a hero — they get angrier!','Showing off? They called for backup.','They felt your strength — hold on now!']}); // i18n:ru — запасной банк ru+en (B3.say выбирает язык)
  B3.bank('gran.rest',{ru:['Передышка! Отдышись, богатырь.','Нечисть отпрянула — переведи дух.'],en:['A breather! Catch your breath.','The monsters fall back — breathe.']}); // i18n:ru — запасной банк ru+en (B3.say выбирает язык)
  B3.bank('gran.vzd',{ru:['Последний вздох: одолей {n}!','Не падай! Одолей {n} — встанешь!'],en:['Last breath: defeat {n}!','Don\'t fall! Defeat {n} to rise!']}); // i18n:ru — запасной банк ru+en (B3.say выбирает язык)
  B3.bank('gran.up',{ru:['Встал богатырь — нечисти на горе!','Рано хоронили!'],en:['The hero rises — woe to the monsters!','Too early to bury me!']}); // i18n:ru — запасной банк ru+en (B3.say выбирает язык)
  B3.bank('gran.old',{ru:['Нечисть нынче злая пошла — гляди в оба.','Злее нечисть стала, богатырь. Не зевай!'],en:['The monsters got meaner — keep your eyes open.','They\'ve grown fiercer, hero. Stay sharp!']}); // i18n:ru — запасной банк ru+en (B3.say выбирает язык)
  B3.bank('tan.warn',{ru:['⚠ {boss} бьёт по полосе — уходи!','⚠ {boss} замахнулся — в сторону!'],en:['⚠ {boss} strikes along the line — move!','⚠ {boss} winds up — step aside!']}); // i18n:ru — запасной банк ru+en (B3.say выбирает язык)
  var SIDE={ru:{l:'слева',r:'справа',u:'сверху',d:'снизу',lr:'с двух сторон',all:'со всех сторон'},en:{l:'from the left',r:'from the right',u:'from above',d:'from below',lr:'from both sides',all:'from all sides'}}; // i18n:ru — запасной банк ru+en (B3.say выбирает язык)
  var K={up:.012,calm:15,thr:.8,lo:.8,hi:2.8,rest:7,restCd:35,warn:8,vzdT:8,tanW:1.2};
  var tanNow=0;
  function on(){return B3.on('gran');}
  function sv(){return B.s('b3g');}
  function en(){return typeof LANG!=='undefined'&&LANG==='en';}
  function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
  function phone(){return Math.min(VIEW.W,VIEW.H)<600;}
  /* место похода: '' — не трогаем; c1 — глава 1; nb — новичок гл.2–3; ch — непройденная; pa — пройденная; se/wk/mo — сеча/неделя/мост */
  function kind(g){if(g.first||g.nvm||g.daily||g.bb2lih)return '';if(g.bb2most)return 'mo';if(g.weekly)return 'wk';if(g.endless)return 'se';
    var pos=0;try{pos=chPos(g.chi);}catch(e){}if(!pos)return '';var d=g.dif||'n';if(difWon(g.chi,d))return 'pa';if(pos===1)return 'c1';if(pos<=3&&d==='n')return 'nb';return 'ch';}
  function live(k){return k==='ch'||k==='nb'||k==='se'||k==='wk'||k==='mo';}
  function day(){try{return B3.day();}catch(e){return 0;}}
  function init(g){var k=kind(g),s=sv(),o={k:k,live:live(k)&&on(),P:1,mx:1,calm:0,mn:1,rest:0,rcd:0,ang:0,w:0,v:0,th:0,td:0,acc:0,line:null,lines:[],warn:null,sk:0,
      hi:k==='nb'?1.6:k==='se'?3.4:K.hi,up:k==='se'?.02:K.up,thr:k==='nb'?.85:K.thr,low:k==='nb'?.45:.4};
    if(o.live&&k!=='nb'&&s.s)o.P=Math.max(1,Math.min(2,s.s/100));o.mx=o.P;
    o.tan=B3.open('tan')&&(o.live||k==='c1');
    if(on()&&B3.old()&&B3.age()===0&&s.o!==day()&&!g.first){s.o=day();o.old=1;}
    return o;}
  function st(g){return g.b3g||(g.b3g=init(g));}
  function line(o,key,v,sec){var t=B3.say(key,v);if(!t)return;o.line={s:t,t:0,d:sec||3.2};}
  /* ---------- 1. Сила по зову ---------- */
  function press(g,o,dt){var H=g.hero,f=H.hp/Math.max(1,g.st.maxHp);
    if(o.rest>0)o.rest-=dt;if(o.rcd>0)o.rcd-=dt;
    if(f<o.thr)o.calm=0;else o.calm+=dt;
    if(o.k==='se')o.hi=Math.min(6,2.4+g.t/150);if(o.calm>K.calm&&!g.win&&!(g.boss&&!g.boss.dead&&g.bossIn>0)){o.P=Math.min(o.hi,o.P+o.up*dt);
      if(o.P>=o.ang+1.3&&o.P<o.hi+.01){o.ang=o.P;line(o,'gran.angry');}}
    if(f<.6)o.P=Math.max(K.lo,o.P-(f<.45?.1:.05)*dt);
    if(f<o.low&&o.rcd<=0&&H.hp>0){o.P=Math.max(K.lo,Math.min(o.P,1+(o.P-1)*.5)*.9);o.rest=K.rest;o.rcd=K.restCd;o.ang=Math.min(o.ang,o.P);line(o,'gran.rest');}
    if(o.P>o.mx)o.mx=o.P;
    /* добавочный спавн: (P-1)×0,7 от обычного темпа, без передышки и без босса; потолок толпы тоже ×(1+…) */
    var sk=o.rest>0||g.win||g.sleepT>0?0:Math.max(0,(o.P-1)*.7);o.sk=sk;
    if(sk>0&&typeof spawnPos==='function'){var t=DT(),rate=(1.15+t/60*1.2)*(g.wk.spawn||1)*sk,cap=(48+t/60*56)*(g.wk.cap||1)*(1+sk*.5);if(g.boss&&!g.boss.dead)rate*=.35;
      o.acc+=rate*dt;var n=0;while(o.acc>=1&&n<4){o.acc-=1;n++;if(g.en.length>=cap){o.acc=0;break;}var p=spawnPos();mkEnemy(pickType(),p[0],p[1]);}}}
  /* новая нечисть: крепче и чуть быстрее по P (босс — вполовину по здоровью) */
  function fresh(g,o){var a=g.en,P=o.live?(o.rest>0?Math.min(1,o.P):o.P):1,se=o.k==='se',hk=1+(P-1)*(se?1:.5),sk=Math.min(se?1.35:1.2,1+(P-1)*.1),i,e;
    for(i=0;i<a.length;i++){e=a[i];if(e.b3)continue;e.b3=1;if(P===1||e.dead||e.prop||e.type==='egg'||e.bkF||e.ob&&P<1)continue;
      if(e.boss){e.hp*=1+(hk-1)*.5;e.max=Math.max(e.max,e.hp);continue;}e.hp*=hk;e.max=Math.max(e.max,e.hp);e.spd*=sk;}}
  /* ---------- 2. предупреждение орды ---------- */
  var EVK={ring:'all',swarm:'?',chev:'?'};
  function evSide(g,ev){if(ev.k==='ring')return 'all';var k='';if(ev.k==='chev')try{k=chEvK(ev.n);}catch(e){}
    if(k==='tide')return 'lr';if(k==='fog'||k==='night'||k==='shadows'||k==='barrows'||k==='firerain')return 'all';return ['l','r','u','d'][Math.floor(Math.random()*4)];}
  function warnTick(g,o){var i,ev,W=o.warn;
    if(W&&W.ev){if(g.ev.indexOf(W.ev)<0){if(W.side.length===1)turn(g,W.side);W.ev=null;}}
    if(W&&g.t>W.t1+1.5)o.warn=W=null;
    if(W)return;
    for(i=0;i<g.ev.length;i++){ev=g.ev[i];if(ev.t-g.t>K.warn)break;if(ev.b3w||!EVK[ev.k])continue;ev.b3w=1;if(ev.t-g.t<3)continue;
      o.warn={side:evSide(g,ev),t1:ev.t,ev:ev,t0:g.t};o.w++;mark(g);return;}
    var x=g.bb2o;if(g.endless&&!g.weekly&&x&&x.next&&!g.ob&&!x.b3w&&x.next-g.t<=K.warn&&x.next-g.t>3&&!(g.boss&&!g.boss.dead)){x.b3w=x.next;o.warn={side:'all',t1:x.next,t0:g.t};o.w++;}
    if(x&&x.b3w&&x.b3w!==x.next)x.b3w=0;}
  function mark(g){for(var i=0;i<g.en.length;i++)g.en[i].b3s=1;}
  /* стая пришла — поворачиваю новых (не помеченных) вокруг богатыря так, чтобы середина была с обещанного края */
  function turn(g,side){var H=g.hero,a=[],sx=0,sy=0,i,e,want={r:0,d:Math.PI/2,l:Math.PI,u:-Math.PI/2}[side];
    for(i=0;i<g.en.length;i++){e=g.en[i];if(e.b3s||e.dead||e.boss)continue;e.b3s=1;var dx=e.x-H.x,dy=e.y-H.y,d=Math.hypot(dx,dy)||1;sx+=dx/d;sy+=dy/d;a.push(e);}
    if(a.length<5||Math.hypot(sx,sy)/a.length<.45)return;var r=want-Math.atan2(sy,sx),c=Math.cos(r),s=Math.sin(r);
    for(i=0;i<a.length;i++){e=a[i];var x=e.x-H.x,y=e.y-H.y;e.x=H.x+x*c-y*s;e.y=H.y+x*s+y*c;}}
  /* ---------- 3. босс-танец ---------- */
  function tanBoss(g){var b=g.boss;if(!b||b.dead||b.intro>0||g.win||b.type==='egg')return null;if(b.type==='kosh')return b;var p=0;try{p=chPos(g.chi);}catch(e){}return p>=1&&p<=6?b:null;}
  function tanTick(g,o,dt){var b=tanBoss(g);if(!b){o.tb=null;return;}
    if(o.tb!==b){o.tb=b;o.tt=2.5;o.tn=0;o.tw=0;}
    o.tt-=dt;if(o.tt>0||b.invul)return;o.tt=(b.kit?9:6)+Math.random()*1.5;o.tn++;
    var H=g.hero,dmg=g.st.maxHp*(o.k==='nb'||o.k==='c1'?.16:.22)+g.st.armor,z;
    if(o.tn%2===1||b.type==='kosh'&&o.tn%3===0){var an=Math.atan2(H.y-b.y,H.x-b.x),ln=560,x2=b.x+Math.cos(an)*ln,y2=b.y+Math.sin(an)*ln;z={k:'tan',x:b.x,y:b.y,x2:x2,y2:y2,r:32};}
    else z={k:'tan',x:H.x,y:H.y,r:74};
    z.arm=K.tanW;z.e=0;z.t=z.arm;z.dur=z.arm+.25;z.own=b;z.src=b.type;z.bk=1;z.b3=1;z.dmg=dmg;
    (g.warn||(g.warn=[])).push(z);(o.tz||(o.tz=[])).push(z);
    if(!o.tw){o.tw=1;var nm='';try{nm=EN[b.type].n;var v=b.bv&&BOSS[b.bv];if(v&&v.n)nm=L(v.n,v.en&&v.en.n||v.n);}catch(e){}var s=B3.say('tan.warn',{boss:nm});if(s&&typeof say==='function')say(b,s,2.4);}}
  function inZ(z,x,y,pad){if(z.x2!=null){var vx=z.x2-z.x,vy=z.y2-z.y,l=vx*vx+vy*vy||1,u=Math.max(0,Math.min(1,((x-z.x)*vx+(y-z.y)*vy)/l)),qx=z.x+vx*u,qy=z.y+vy*u;return (x-qx)*(x-qx)+(y-qy)*(y-qy)<(z.r+pad)*(z.r+pad);}
    return (x-z.x)*(x-z.x)+(y-z.y)*(y-z.y)<(z.r+pad)*(z.r+pad);}
  function tanZones(g,o,dt){var a=o.tz,i,z,H=g.hero;if(!a||!a.length)return;
    for(i=0;i<a.length;i++){z=a[i];z.e+=dt;z.t=z.arm-z.e;if(z.own&&z.own.dead){z.e=z.dur;continue;}
      if(!z.hit&&z.e>=z.arm){z.hit=1;try{SND.boom();}catch(e){}g.shake=Math.max(g.shake,calm()?0:6);
        if(inZ(z,H.x,H.y,8)&&!(o.vz&&o.vz.on)){o.th++;tanNow=1;try{hurtHero(z.dmg,z.src);}finally{tanNow=0;}}else o.td++;}}
    o.tz=a.filter(function(z){return z.e<z.dur;});if(g.warn)g.warn=g.warn.filter(function(w){return !w.b3||w.e<w.dur;});}
  /* ---------- 4. Последний вздох ---------- */
  function vzdN(g){var tier=1;try{tier=chTier(g.chi)||1;}catch(e){}var n=g.endless?25+Math.min(8,(g.cyc|0)*2):Math.round(18+tier*2);n=Math.max(18,Math.min(34,n));
    var k=g.b3k||[],c=0,i;for(i=0;i<k.length;i++)if(g.t-k[i]<=10)c++;return Math.max(12,Math.min(n,Math.round(c*.9)));}
  function vzdStart(g,o){var H=g.hero;g.b3vzd=1;o.vt=Math.round(g.t);o.vz={on:1,t:K.vzdT,n:vzdN(g),k:0};o.vz.s=B3.say('gran.vzd',{n:o.vz.n});o.v=2;H.hp=1;H.inv=0;o.line=null;try{SND.boss();}catch(e){}g.shake=calm()?0:10;
    for(var i=0;i<g.en.length;i++){var e=g.en[i];if(e.dead||e.boss)continue;var dx=e.x-H.x,dy=e.y-H.y,d=Math.hypot(dx,dy)||1;if(d<150){e.kx+=dx/d*380;e.ky+=dy/d*380;}}}
  function vzdTick(g,o,dt){var v=o.vz;if(!v||!v.on)return;var H=g.hero;if(H.hp<1)H.hp=1;
    if(v.k>=v.n||g.win){v.on=0;o.v=1;H.hp=Math.max(H.hp,g.st.maxHp*.3);g.hpLock=H.hp;H.inv=2;o.calm=0;o.P=Math.max(K.lo,Math.min(o.P,1+(o.P-1)*.5));o.rest=K.rest;o.rcd=K.restCd;
      g.fx.push({k:'wave',x:H.x,y:H.y,t:0,dur:.6,r1:260,col:'#ffe07a',own:1});line(o,'gran.up',null,3);try{SND.level();}catch(e){}B.hk('revive',g,'vzd');return;}
    v.t-=dt;if(v.t<=0){v.on=0;H.hp=0;o.line=null;left(g);g.paused=true;IN.on=false;try{YG.stop();}catch(e){}openDeath();}}
  function left(g){var b=g.boss;g.b3left=0;try{if(!g.endless&&!(b&&!b.dead)&&!g.win&&LT()<bossT())g.b3left=Math.max(1,Math.round(bossT()-LT()));}catch(e){}}
  /* ---------- крючки ---------- */
  B.hook('frame',function(dt,g){if(!B3.on())return;var o=st(g);
    if(o.old&&g.t>3){o.old=0;line(o,'gran.old',null,4);}
    if(o.line){o.line.t+=dt;if(o.line.t>o.line.d)o.line=null;}
    if(o.vz&&o.vz.on)vzdTick(g,o,dt);
    if(o.live&&g.t>4&&!(o.vz&&o.vz.on))press(g,o,dt);
    fresh(g,o);
    if(on()&&!g.first)warnTick(g,o);
    if(o.tan)tanTick(g,o,dt);if(o.tz)tanZones(g,o,dt);
    var f=g.hero.hp/Math.max(1,g.st.maxHp);if(!(o.vz&&o.vz.on)&&f<o.mn&&g.t>1)o.mn=Math.max(0,f);},40);
  B.hook('kill',function(e){var g=typeof G!=='undefined'&&G;if(!g||!g.b3g||!e||e.prop||e.type==='egg')return;var k=g.b3k||(g.b3k=[]);k.push(g.t);if(k.length>200)k.splice(0,100);var v=g.b3g.vz;if(v&&v.on)v.k++;},85);
  /* урон: вздох — бессмертие (очередь 15); Сила по зову — множитель (60); удар танца — без множителя */
  B.hook('hurt',function(d,src,g){var o=g.b3g;if(o&&o.vz&&o.vz.on)return false;},15);
  B.hook('hurt',function(d,src,g){var o=g.b3g;if(!o||!o.live||tanNow)return;var P=1+(o.P-1)*.7;if(g.boss&&src===g.boss.type)P=1+(P-1)*.5;if(o.rest>0)P=Math.min(P,1)*.5;return d*P;},60);
  B.hook('down',function(g){left(g);},1);
  B.hook('down',function(g){var o=g.b3g;if(!o||o.k==='pa'||!on()||g.first||g.nvm||g.b3vzd||g.revives>0||g.wk&&g.wk.oneLife||!B3.on())return;vzdStart(g,o);return true;},55);
  B.hook('end',function(g,win){var o=g.b3g;if(!o)return;if(o.live&&o.k!=='nb'){var s=sv(),p=1+(o.P-1)*.5;s.s=Math.round(Math.max(1,Math.min(2,win||g.endless?p:Math.min(p,1.2)))*100);}
    if(o.live||o.v||o.w||o.th||o.td)B3.stat('gran',{c:o.k,p:Math.round(o.P*100),mx:Math.round(o.mx*100),mn:Math.round(o.mn*100),w:o.w,v:o.v,tn:o.th+'/'+o.td});});
  /* ---------- рисование ---------- */
  var SIL={};
  function sil(key){var s=SPR[key]||(typeof spr==='function'&&spr(key));if(!s||!s.c)return null;var q=SIL[key];if(q&&q.src===s.c)return q;
    var c=mkCanvas(s.c.width,s.c.height),x=c.getContext('2d');x.drawImage(s.c,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff6d0';x.fillRect(0,0,c.width,c.height);
    SIL[key]=q={c:c,src:s.c,s:s};return q;}
  function heroDraw(c,g){var H=g.hero,Bz=VIEW.B,wolf=g.wolfT>0,fr=H.moving?Math.floor(H.step)%2:0,bob=H.moving?Math.abs(Math.sin(H.step*Math.PI))*2:Math.sin(g.t*3)*.6,
      key=wolf?'wolf':'h_'+g.hkey+'_'+fr,q=sil(key);if(!q)return;var s=q.s,sx=wolf?H.flip*1.45:H.flip,sy=wolf?1.45:1+(H.moving?0:Math.sin(g.t*3)*.015),
      tx=(H.x-VIEW.cx)*Bz+cv.width/2,ty=(H.y-bob-VIEW.cy)*Bz+cv.height/2,px=2*VIEW.dpr,lo=typeof qLow==='function'&&qLow(),i,
      off=lo?[[1,1],[-1,1],[1,-1],[-1,-1]]:[[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]];
    c.globalAlpha=.9;for(i=0;i<off.length;i++){c.setTransform(Bz*sx,0,0,Bz*sy,tx+off[i][0]*px,ty+off[i][1]*px);c.drawImage(q.c,-s.s/2,-s.s/2,s.s,s.s);}
    c.globalAlpha=H.inv>0&&H.hurtT<=0?.55:1;c.setTransform(Bz*sx,0,0,Bz*sy,tx,ty);c.drawImage(H.hurtT>0&&typeof sprF==='function'?sprF(s):s.c,-s.s/2,-s.s/2,s.s,s.s);c.globalAlpha=1;
    worldT();}
  function ring(c,g){var H=g.hero,k=phone()?1.3:1,cl=calm(),a=cl?.75:.62+.18*Math.sin(g.t*3),rx=21*k,ry=8.5*k,y=H.y+22;
    c.fillStyle='rgba(255,226,120,'+(.14*a)+')';c.beginPath();c.ellipse(H.x,y,rx,ry,0,0,Math.PI*2);c.fill();
    c.strokeStyle='rgba(20,16,10,'+(.5*a)+')';c.lineWidth=4.5;c.beginPath();c.ellipse(H.x,y,rx,ry,0,0,Math.PI*2);c.stroke();
    c.strokeStyle='rgba(255,220,90,'+a+')';c.lineWidth=2.4;c.stroke();}
  function tanDraw(c,g,o){var a=o.tz,i,z,cl=calm();if(!a)return;
    for(i=0;i<a.length;i++){z=a[i];var q=Math.min(1,z.e/z.arm),pul=cl?.6:.5+.5*Math.sin(g.t*16),cx,cy;
      if(z.hit){var f=1-(z.e-z.arm)/Math.max(.05,z.dur-z.arm);c.globalAlpha=Math.max(0,f);c.fillStyle='#fff3d0';}
      else{c.globalAlpha=1;c.fillStyle='rgba(255,60,40,'+(.14+.22*q)+')';}
      c.beginPath();if(z.x2!=null){c.lineCap='round';c.lineWidth=z.r*2;c.strokeStyle=c.fillStyle;c.moveTo(z.x,z.y);c.lineTo(z.x2,z.y2);c.stroke();}else{c.arc(z.x,z.y,z.r,0,Math.PI*2);c.fill();}
      if(!z.hit){c.strokeStyle='rgba(255,90,60,'+(.55+.4*pul)+')';c.lineWidth=2.5;
        if(z.x2!=null){var vx=z.x2-z.x,vy=z.y2-z.y,l=Math.hypot(vx,vy)||1,nx=-vy/l*z.r,ny=vx/l*z.r;c.beginPath();c.moveTo(z.x+nx,z.y+ny);c.lineTo(z.x2+nx,z.y2+ny);c.moveTo(z.x-nx,z.y-ny);c.lineTo(z.x2-nx,z.y2-ny);c.stroke();
          c.lineWidth=z.r*2*q;c.strokeStyle='rgba(255,40,20,.28)';c.beginPath();c.moveTo(z.x,z.y);c.lineTo(z.x+vx*q,z.y+vy*q);c.stroke();var H=g.hero,u=Math.max(.15,Math.min(.9,((H.x-z.x)*vx+(H.y-z.y)*vy)/(l*l)));cx=z.x+vx*u;cy=z.y+vy*u;}
        else{c.beginPath();c.arc(z.x,z.y,z.r,0,Math.PI*2);c.stroke();c.beginPath();c.arc(z.x,z.y,z.r*q,0,Math.PI*2);c.stroke();cx=z.x;cy=z.y;}
        c.font='900 30px '+(CVL&&CVL.font||'sans-serif');c.textAlign='center';c.textBaseline='middle';c.lineWidth=5;c.strokeStyle='rgba(30,10,10,.85)';c.strokeText('⚠',cx,cy-z.r-14);c.fillStyle='#ffd23a';c.fillText('⚠',cx,cy-z.r-14);}
      c.globalAlpha=1;}c.lineCap='butt';c.textBaseline='alphabetic';}
  B.hook('draw',function(c,g){if(!B3.on())return;var o=g.b3g;if(o&&o.tz)tanDraw(c,g,o);if(!on())return;ring(c,g);if(!g.first&&!(g.hero.hp<=0&&!(o&&o.vz&&o.vz.on)))heroDraw(c,g);},70);
  function txt(c,s,x,y,size,col,al){var f=(CVL&&CVL.font||'sans-serif'),mw=VIEW.W-(al&&al!=='center'?d0(al):24);c.font='800 '+size+'px '+f;var w=c.measureText(s).width;if(w>mw&&size>16){size=Math.max(16,Math.floor(size*mw/w));c.font='800 '+size+'px '+f;}c.textAlign=al||'center';c.lineWidth=4;c.strokeStyle='rgba(10,14,30,.85)';c.strokeText(s,x,y);c.fillStyle=col||'#fff';c.fillText(s,x,y);}
  function wrap(c,s,mw){var a=String(s).split(' '),r=[],cur='',i;for(i=0;i<a.length;i++){var t=cur?cur+' '+a[i]:a[i];if(cur&&c.measureText(t).width>mw){r.push(cur);cur=a[i];}else cur=t;}if(cur)r.push(cur);return r;}
  function d0(al){return (phone()?30:52)+24;}
  function edge(c,g,o){var W=VIEW.W,Hh=VIEW.H,w=o.warn,cl=calm(),side=w.side,q=Math.min(1,(g.t-w.t0)/.4),a=(cl?.8:.6+.35*Math.sin(g.t*9))*q,d=phone()?30:52,top=(window.__safeTop||0),i,
      S=side==='all'?['l','r','u','d']:side==='lr'?['l','r']:[side];
    for(i=0;i<S.length;i++){var k=S[i],gr,x0=0,y0=0,x1=0,y1=0,rw=0,rh=0,rx=0,ry=0;
      if(k==='l'){x1=d;rw=d;rh=Hh;}else if(k==='r'){x0=W;x1=W-d;rx=W-d;rw=d;rh=Hh;}else if(k==='u'){y0=top;y1=top+d;ry=top;rw=W;rh=d;}else{y0=Hh;y1=Hh-d;ry=Hh-d;rw=W;rh=d;}
      gr=c.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,'rgba(255,60,30,'+(.9*a)+')');gr.addColorStop(1,'rgba(255,60,30,0)');c.fillStyle=gr;c.fillRect(rx,ry,rw,rh);c.fillStyle='rgba(255,90,40,'+a+')';if(k==='l')c.fillRect(0,0,5,Hh);else if(k==='r')c.fillRect(W-5,0,5,Hh);else if(k==='u')c.fillRect(0,top,W,5);else c.fillRect(0,Hh-5,W,5);}
    var lang=en()?'en':'ru',s=w.s||(w.s=B3.say('gran.warn',{side:SIDE[lang][side]||''}));if(!s)return;if(s.charAt(0)!=='⚠')s=w.s='⚠ '+s;var sz=phone()?18:22,x=W/2,y=Hh*.3,al='center';
    if(side==='l'){x=d+8;al='left';}else if(side==='r'){x=W-d-8;al='right';}else if(side==='d'){y=Hh-d-70;}else if(side==='u'){y=top+d+120;}
    c.globalAlpha=q;c.font='800 '+sz+'px '+(CVL&&CVL.font||'sans-serif');var ls=wrap(c,s,al==='center'?W-32:W-d-28),j;for(j=0;j<ls.length;j++)txt(c,ls[j],x,y+j*(sz+5),sz,'#ffd9a0',al);c.globalAlpha=1;}
  function vzdTop(c,g,o){var v=o.vz,W=VIEW.W,Hh=VIEW.H,cl=calm(),gr=c.createRadialGradient(W/2,Hh/2,Math.min(W,Hh)*.3,W/2,Hh/2,Math.max(W,Hh)*.75),a=cl?.45:.38+.12*Math.sin(g.t*6);
    gr.addColorStop(0,'rgba(120,0,0,0)');gr.addColorStop(1,'rgba(150,0,0,'+a+')');c.fillStyle=gr;c.fillRect(0,0,W,Hh);
    var y=Hh*.66,bw=Math.min(240,W*.6),x=W/2-bw/2,q=Math.max(0,v.t/K.vzdT);
    var fs=phone()?20:24;c.font='800 '+fs+'px '+(CVL&&CVL.font||'sans-serif');var ls=wrap(c,v.s||'',W-32),j;y-=(ls.length-1)*fs*.6;for(j=0;j<ls.length;j++)txt(c,ls[j],W/2,y+j*(fs+4),fs,'#ffe07a');y+=(ls.length-1)*(fs+4);txt(c,v.k+' / '+v.n,W/2,y+34,phone()?26:30,'#fff');
    c.fillStyle='rgba(10,14,30,.6)';rr(c,x,y+48,bw,10,5);c.fill();c.fillStyle='#ff5a3a';rr(c,x+2,y+50,(bw-4)*q,6,3);c.fill();}
  B.hook('drawTop',function(c,g){if(!B3.on()||!on())return;var o=g.b3g;if(!o)return;
    if(o.vz&&o.vz.on){vzdTop(c,g,o);return;}
    if(o.warn&&g.t<o.warn.t1+.3)edge(c,g,o);
    if(o.line){var l=o.line,f=Math.min(1,l.t/.25,(l.d-l.t)/.4),W=VIEW.W,y=(window.__safeTop||0)+(phone()?118:128),sz=phone()?16:18;
      c.globalAlpha=Math.max(0,f);c.font='800 '+sz+'px '+(CVL&&CVL.font||'sans-serif');var ls=wrap(c,l.s,W-48),tw=0,j;for(j=0;j<ls.length;j++)tw=Math.max(tw,c.measureText(ls[j]).width);tw=Math.min(W-16,tw+28);c.fillStyle='rgba(20,16,36,.72)';rr(c,W/2-tw/2,y-sz-4,tw,sz+16+(ls.length-1)*(sz+4),12);c.fill();
      for(j=0;j<ls.length;j++)txt(c,ls[j],W/2,y+2+j*(sz+4),sz,'#ffe9b0');c.globalAlpha=1;}});
  window.B3G={g:function(){return typeof G!=='undefined'&&G&&G.b3g;},K:K,kind:function(){return typeof G!=='undefined'&&G?kind(G):'';}};
})();
