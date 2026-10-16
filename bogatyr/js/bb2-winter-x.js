/* ===== bb2-winter-x.js — поток WINTER супер-буста в2: зима Богатыря (догружается набором 'winter', заглушка — js/bb2-winter.js). =====
   Всё включается само по датам (день игры dayKey; на стенде — ?festday=ГГГГ-ММ-ДД). Флаг 'winter' (выключен → игра как v24.1; набор не грузится).
   • «Карачун» 15.12–14.01:
     – адвент: 17 клеток 15–31.12, подарок за ПОХОД (не за вход): сыграл сегодня — открывай сегодняшнюю; пропущенные — по одной в день до 14.01
       (не сгорают, но и пачкой не открываются); 31.12 — большой подарок; 13–14.01 «Старый Новый год» — 18-я, последняя клетка;
     – Снеговик-хулиган: в любой главе на 2-й минуте (если «гость недели» EVENT уже вышел — он и становится Снеговиком); одолел — снежок;
     – ёлка в деревне (рисунок кодом на картинке деревни): 5 ступеней по снежкам, за каждую — трофеи, на 5-й облик «Снежный» всем богатырям;
     – «Карачунова неделя» 28.12–03.01: в главах Лихой недели (поток TAIL, G.bb2lih) босс — Карачун (сила — как у босса главы);
     – 14.01 — прощание с ёлкой (окно один раз).
   • Каникулы 25.12–10.01: Поход дня — награда ×2 и каждый день другой богатырь (по кругу); Сход — «каникулярный», двойной сундук (итоги 28.12–11.01).
   • День богатырей 21–23.02: все 9 богатырей открыты на пробу (в дозор пробные не идут), Сход с двойной наградой (итог 22–28.02),
     куплет «Богатырская застава» в Былину, финал «Сказа о Святогоре» — очки Сказа ×2.
   • Масленица 08–14.03: в Лихой неделе босс — Чучело Масленицы; в печи Подворья — блины.
   • Сказы: №13 (31.12–27.01) «Сказ о Сивке-Бурке» (облик Ивана «Сивка-Бурка»), №14 (28.01–24.02) «Сказ о Святогоре» (облик Ильи «Святогоров»)
     — через BB2EV.sagaSet (поток EVENT, флаг saga2; №12 «Морозко» на декабрь ставит EVENT).
   Числа — BB2.n('winter.…') (договор ECO); чего там нет — помечено ECO? (журнал logs/WINTER.md «Для ECO»).
   Сохранение S.bb2.win: a — открытые клетки адвента (биты 0–17) · ac — день последнего «догона» · ad — день последней «сегодняшней» клетки ·
     r — день последнего похода · sb — снежки · e — ступень ёлки · sd — день последнего золота за Снеговика · x — биты разного · q — награды в очереди (Слава не приехала).
   STAT: mod {m:'win', a:'open'|'adv'|'sn'|'elka'|'boss'|'bye'|'bog'|'kan', …}. Подвиги: BB2.pdv('win.adv'|'win.sn'|'win.kar'|'win.chu').
   Для других: BB2W.on(id) (kar kan karw sng bog mas adv), BB2W.st(), BB2W.open(). */
var BB2W=(function(){
  var W={},RUN={};
  function on(){return BB2.on('winter');}
  function N(k,d){return BB2.n('winter.'+k,d);}
  function s(){return BB2.s('win');}
  function td(){return BB2.wd();}
  function st(m,a,o){o=o||{};o.m='win';o.a=a;BB2.stat('mod',o);}
  function fn(n){return fmtNum(n);}
  function has(f){return typeof window[f]==='function';}
  function inRun(){return document.body.classList.contains('run');}
  /* ---------- даты (2026/27; Масленица каждый год своя — на следующую зиму дописать строку) ---------- */
  var D={kar:['2026-12-15','2027-01-14'],adv:['2026-12-15','2026-12-31'],kan:['2026-12-25','2027-01-10'],karw:['2026-12-28','2027-01-03'],
    sng:['2027-01-13','2027-01-14'],bog:['2027-02-21','2027-02-23'],mas:['2027-03-08','2027-03-14'],kanS:['2026-12-28','2027-01-11'],bogS:['2027-02-22','2027-02-28']};
  function is(id,d){var r=D[id];d=d||td();return !!r&&on()&&d>=r[0]&&d<=r[1];}
  W.on=is;
  function dIdx(d){var x=d.split('-');return Math.round((Date.UTC(+x[0],x[1]-1,+x[2])-Date.UTC(2026,11,15))/864e5);} /* 15.12.2026 = 0 */
  function dOf(i){var t=new Date(Date.UTC(2026,11,15+i));return t.getUTCFullYear()+'-'+String(t.getUTCMonth()+1).padStart(2,'0')+'-'+String(t.getUTCDate()).padStart(2,'0');}
  function left(id){var r=D[id];return Math.max(1,dIdx(r[1])-dIdx(td())+1);}
  /* ---------- награды: золото по отрезку глав (как договор ECO), трофеи/свитки — через Славу (или в очередь, пока не приехала) ---------- */
  function gold(x){if(typeof x==='number')return x;var n=0,k;for(k in S.done)n++;var b=n<=3?0:n<=18?1:2,t=BB2.n('base.'+(x==='s'?'small':x==='m'?'mid':'big'),x==='s'?[70,200,650]:x==='m'?[350,950,3200]:[1400,3800,12800]);return t[b]||0;}
  function sl(){try{return has('SL')?SL():null;}catch(e){return null;}}
  function gv(r){if(!r)return;try{if(r.g){S.gold+=r.g;ern('quest',r.g);}var o={};for(var k in r)if(k!=='g')o[k]=r[k];if(!o.tr&&!o.it&&!o.sk)return;
    if(sl()&&has('rwGive'))rwGive(o,'win');else{var w=s();w.q=w.q||[];if(w.q.length<20)w.q.push(o);}}catch(e){}}
  function flush(){try{var w=s();if(sl()&&has('rwGive')&&w.q&&w.q.length){var q=w.q;w.q=[];q.forEach(function(r){rwGive(r,'win');});save();}}catch(e){}}
  function rtx(r){var a=[];if(r.g)a.push('+'+fn(r.g)+goldW());if(r.tr)a.push(L('трофеи ×','trophies ×')+r.tr);if(r.it)a.push((r.it==='rr'?L('свиток перебора','reroll scroll'):L('оберег изгнания','banish charm'))+(r.n>1?' ×'+r.n:''));if(r.sk)a.push(L('облик ','outfit ')+qt(skName(r.sk)));return a.join(', ');}

  /* ---------- облики: «Снежный» (всем, праздник ny27), «Сивка-Бурка» (Иван, Сказ №13), «Святогоров» (Илья, Сказ №14) ---------- */
  var SKN={snezh:[L('Снежный','Snowy'),L('ёлка «Карачуна» наряжена','the Karachun tree is dressed')],sivka:[L('Сивка-Бурка','Sivka-Burka'),L('«Сказ о Сивке-Бурке»: верхняя дорожка, ступень 30','“Tale of Sivka-Burka”: upper track, step 30')],
    svyat:[L('Святогоров','Svyatogor’s'),L('«Сказ о Святогоре»: верхняя дорожка, ступень 30','“Tale of Svyatogor”: upper track, step 30')]};
  function skName(k){var id=String(k).split('@')[1];return SKN[id]?SKN[id][0]:k;}
  function skin(id,hero,pal,fest){try{if(typeof SKINS==='undefined'||!HERO_ART[hero]||SKINS.some(function(x){return x.id===id&&x.hero===hero;}))return;
    var p={},k;for(k in pal)if(typeof HERO_ART[hero][k]==='string'&&HERO_ART[hero][k][0]==='#')p[k]=pal[k];
    var o={id:id,hero:hero,pal:p,fame:1};if(fest)o.fest=fest;Object.defineProperty(o,'name',{get:function(){return SKN[id][0];},enumerable:true});
    Object.defineProperty(o,'src',{get:function(){return SKN[id][1];},enumerable:true});SKINS.push(o);
    var h=Object.assign({},HERO_ART[hero],p),kk=hero+'@'+id;art('h_'+kk+'_0',80,function(g){drawHero(g,h,0);});art('h_'+kk+'_1',80,function(g){drawHero(g,h,1);});art('hp_'+kk,66,function(g){g.translate(0,3);drawHero(g,h,0);});}catch(e){console.warn('win skin',e);}}
  var SNZ={body:'#e8f2fb',cloak:'#7cc4ff',helm:'#ffffff',rim:'#9ad8ff',cap:'#dff0ff',fur:'#ffffff',kok:'#9ad8ff',belt:'#5aa0e6',boots:'#bcd8f0',hair:'#f4f8ff'};
  if(typeof HERO_ART!=='undefined')for(var hh in HERO_ART)skin('snezh',hh,SNZ,'ny27');
  skin('sivka','iva',{body:'#7a5a3a',hair:'#d8d8d8',belt:'#e6b53a',boots:'#3a2a1a'});
  skin('svyat','ily',{body:'#6a707e',cloak:'#2a3550',helm:'#b8bccb',rim:'#e6b53a',beard:'#dcdcdc',belt:'#3a2a1a'});
  function skinAll(id){S.skins=S.skins||{};for(var i=0;i<SKINS.length;i++)if(SKINS[i].id===id)S.skins[SKINS[i].hero+'@'+id]=1;}

  /* ---------- рисунки кодом (по требованию): ёлка 0–5, Снеговик-значок, чучело, блины ---------- */
  function elka(g,x,y,h,n){var w=h*.62,i,t=h/4;g.save();g.translate(x,y);
    g.fillStyle='#6a4426';g.fillRect(-h*.05,-h*.16,h*.1,h*.16);
    for(i=0;i<3;i++){var yb=-h*.12-i*t*.95,ww=w*(1-i*.24)/2;g.fillStyle=i%2?'#2f8a4e':'#277a44';g.beginPath();g.moveTo(-ww,yb);g.lineTo(0,yb-t*1.45);g.lineTo(ww,yb);g.closePath();g.fill();
      g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.moveTo(-ww,yb);g.quadraticCurveTo(0,yb-t*.25,ww,yb);g.lineTo(ww*.8,yb-t*.18);g.quadraticCurveTo(0,yb-t*.42,-ww*.8,yb-t*.18);g.closePath();g.fill();}
    if(n>=1){g.strokeStyle='#ffd84a';g.lineWidth=Math.max(1,h*.018);for(i=0;i<3;i++){var y2=-h*.25-i*t*.95,w2=w*(1-i*.24)*.36;g.beginPath();g.moveTo(-w2,y2-t*.2);g.quadraticCurveTo(0,y2+t*.1,w2,y2-t*.35);g.stroke();}}
    var B=[[-.18,-.3,'#e0332a'],[.16,-.42,'#2a7ad8'],[-.08,-.55,'#ffd84a'],[.2,-.22,'#b04ad8'],[-.22,-.18,'#ffd84a'],[.06,-.68,'#e0332a'],[0,-.36,'#ffffff'],[-.14,-.44,'#4ad89a']];
    if(n>=2)for(i=0;i<(n>=3?8:4);i++){g.fillStyle=B[i][2];g.beginPath();g.arc(B[i][0]*h,B[i][1]*h,h*.032,0,6.283);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(B[i][0]*h-h*.01,B[i][1]*h-h*.01,h*.01,0,6.283);g.fill();}
    if(n>=4){g.fillStyle='#ffe9a8';for(i=0;i<6;i++){var a=i*1.7;g.fillRect(Math.sin(a)*h*.2-h*.008,-h*.2-i*h*.09,h*.016,h*.04);}}
    if(n>=5){g.fillStyle='rgba(255,230,120,.35)';g.beginPath();g.arc(0,-h*.95,h*.13,0,6.283);g.fill();}
    if(n>=3||n>=5){g.fillStyle=n>=5?'#ffd84a':'#c8a040';g.beginPath();for(i=0;i<10;i++){var r=i%2?h*.035:h*.085,aa=-Math.PI/2+i*Math.PI/5;g.lineTo(Math.cos(aa)*r,-h*.93+Math.sin(aa)*r);}g.closePath();g.fill();}
    g.restore();}
  art('w_elka',96,function(g){elka(g,0,44,92,5);});
  art('chuch',110,function(g){ /* Чучело Масленицы: соломенная кукла в платке, руки-палка */
    g.strokeStyle='#7a5a2a';g.lineWidth=5;g.beginPath();g.moveTo(0,52);g.lineTo(0,-30);g.moveTo(-44,-8);g.lineTo(44,-8);g.stroke();
    g.fillStyle='#e8c060';for(var i=-1;i<=1;i+=2){g.beginPath();g.moveTo(i*44,-8);g.lineTo(i*54,-2);g.lineTo(i*52,-14);g.closePath();g.fill();}
    g.fillStyle='#e0332a';g.beginPath();g.moveTo(-14,-12);g.lineTo(14,-12);g.lineTo(30,40);g.quadraticCurveTo(0,50,-30,40);g.closePath();g.fill();
    g.fillStyle='#f2b233';for(i=0;i<5;i++){g.beginPath();g.arc(-18+i*9,30-(i%2)*8,3,0,6.283);g.fill();}
    g.fillStyle='#f4dca0';g.beginPath();g.arc(0,-30,16,0,6.283);g.fill();
    g.fillStyle='#f2b233';g.beginPath();g.moveTo(-19,-30);g.quadraticCurveTo(0,-56,19,-30);g.lineTo(24,-18);g.quadraticCurveTo(0,-26,-24,-18);g.closePath();g.fill();
    g.fillStyle='#3a2a1a';g.beginPath();g.arc(-6,-31,2.2,0,6.283);g.arc(6,-31,2.2,0,6.283);g.fill();g.fillStyle='#e0332a';g.beginPath();g.arc(-9,-24,3,0,6.283);g.arc(9,-24,3,0,6.283);g.fill();
    g.strokeStyle='#3a2a1a';g.lineWidth=1.6;g.beginPath();g.arc(0,-25,5,.3,2.8);g.stroke();});
  art('m_blin',48,function(g){for(var i=0;i<4;i++){g.fillStyle=i%2?'#e8a840':'#f2c060';g.beginPath();g.ellipse(0,10-i*5,18,6,0,0,6.283);g.fill();}g.fillStyle='#ffe27a';g.beginPath();g.ellipse(0,-8,7,3,0,0,6.283);g.fill();});

  /* ================= АДВЕНТ ================= */
  var NADV=18,DAYS=17; /* клетки 0–16 — 15…31.12, 17 — Старый Новый год */
  function bit(i){return (s().a|0)&(1<<i);}
  function cellRw(i){if(i===16)return {g:gold(N('advent.fin','b')),it:'rr',n:2,tr:N('elka.tro',3)*3}; /* 31.12 — большой подарок */
    if(i===17)return {g:gold(N('oldNY.gold','m')),tr:N('oldNY.tro',5)}; /* ECO v4 winter.oldNY — последняя клетка Старого Нового года */
    var k=i%5;return k===0?{g:gold(N('advent.day','s'))}:k===1?{it:'rr',n:1}:k===2?{tr:3}:k===3?{g:gold(N('advent.day','s'))}:{it:'ban',n:1};}
  function ranToday(){return s().r===td();}
  /* что можно открыть сейчас: {i, why:'day'|'catch'|'sng'} или null; why2 — почему нельзя */
  function advNext(){var d=td(),w=s(),i=dIdx(d),j;if(!is('kar'))return null;
    if(is('sng')&&!bit(17))return {i:17,why:'sng',run:ranToday()};
    if(i>=0&&i<DAYS&&!bit(i)&&w.ad!==d)return {i:i,why:'day',run:ranToday()};
    if(w.ac!==d)for(j=0;j<Math.min(i,DAYS);j++)if(!bit(j))return {i:j,why:'catch',run:ranToday()};
    return null;}
  function advCount(){var n=0;for(var i=0;i<NADV;i++)if(bit(i))n++;return n;}
  function advOpen(){var x=advNext();if(!x||!x.run)return null;var w=s(),r=cellRw(x.i);w.a=(w.a|0)|(1<<x.i);if(x.why==='catch')w.ac=td();else w.ad=td();
    gv(r);save();BB2.pdv('win.adv');st('adv',{n:x.i,w:x.why});return {i:x.i,r:r};}
  W.adv={next:advNext,open:advOpen,count:advCount,rw:cellRw};

  /* ================= ЁЛКА и СНЕЖКИ ================= */
  var STEP=N('elka.step',[3,7,12,18,25]); /* ECO v4 winter.elka.step */
  function elkaN(){var b=s().sb|0,n=0;for(var i=0;i<5;i++)if(b>=STEP[i])n=i+1;return n;}
  function elkaGive(){var w=s(),n=elkaN(),out=[];while((w.e|0)<n){w.e=(w.e|0)+1;var r={tr:N('elka.tro',3)};if(w.e>=5){skinAll('snezh');r.sk=(S.hero||'dob')+'@snezh';S.skin=S.skin||{};S.skin[S.hero||'dob']='snezh';}
      gv(r.sk?{tr:r.tr}:r);out.push(r);st('elka',{n:w.e});if(w.e>=5)BB2.pdv('win.elka');}if(out.length)save();return out;}
  W.elka={n:elkaN,step:STEP,draw:elka};

  /* ================= В ПОХОДЕ: Снеговик-хулиган, Карачун и Чучело в Лихой неделе ================= */
  function camp(g){return g&&!g.endless&&!g.daily&&!g.weekly&&!g.first&&!g.short&&!g.bb2most;}
  BB2.hook('run',function(g){RUN={};if(!on()||!g)return;
    if(is('kar')&&camp(g)&&(S.runs|0)>=1)RUN.sn=N('snow.t',120); /* ECO v4 winter.snow.t */
    if(g.bb2lih&&(is('karw')||is('mas'))){var v=g.ch.bv&&BOSS[g.ch.bv],t=v&&v.base&&EN[v.base]?v.base:g.ch.boss,nb=is('karw')?'karach':'chuch';
      if(nb==='chuch'&&!EN.chuch)EN.chuch={n:L('Чучело Масленицы','Shrovetide Effigy'),r:30,hp:9000,spd:34,dmg:22,boss:1,col:'#f2b233'};
      if(EN[t]&&t!==nb){RUN.b={t:nb,hp:EN[t].hp*(v&&v.hpK>0?v.hpK:1),dmg:EN[t].dmg*(v&&v.dmgK>0?v.dmgK:1)};g.ch=Object.assign({},g.ch,{boss:nb,bv:null});
        try{if(nb==='chuch'){PH.boss.chuch=PH.boss.chuch||{intro:L('Блинами накормлю — зиму провожу!','I’ll feed you pancakes and see winter off!'),lines:[L('Горяч блинок!','Hot pancake!'),L('Масленица идёт!','Shrovetide is coming!'),L('Прощай, зима!','Farewell, winter!')]};
          BOSS_TITLE.chuch=BOSS_TITLE.chuch||function(){return L('Проводы зимы','Seeing Winter Off');};}}catch(e){}
        banner(is('karw')?L('Карачунова неделя','Karachun’s Week'):L('Масленица','Shrovetide'),is('karw')?L('Босс главы — Карачун','The boss is Karachun'):L('Босс главы — Чучело Масленицы','The boss is the Shrovetide Effigy'),3);}}},70);
  function mkSnow(g,e){if(!e){var p=spawnPos();e=mkEnemy('snow',p[0],p[1],{elite:1});e.hp*=3;e.max=e.hp;}else{e.type='snow';e.ranged=1;e.fly=0;e.shootT=1;}
    e.wnSn=1;e.sc=(e.sc||1)*1.35;e.r=(EN.snow.r||13)*1.35;say(e,L('Лови снежок! Морковку не трожь!','Catch a snowball! Hands off my carrot!'),3);
    banner(L('Гость праздника','Holiday guest'),L('Снеговик-хулиган','Rowdy Snowman'),2);st('sn',{a:'in'});}
  BB2.hook('frame',function(dt,g){if(!RUN.sn||!g||g.over||g.win||(g.t||0)<RUN.sn-6)return;var a=g.en,i;
    for(i=Math.max(0,a.length-4);i<a.length;i++)if(a[i]&&a[i].evGost&&!a[i].wnSn){RUN.sn=0;mkSnow(g,a[i]);return;} /* «гость недели» EVENT — он и есть Снеговик */
    if((g.t||0)>=RUN.sn+2&&!(g.boss&&!g.boss.dead)){RUN.sn=0;try{mkSnow(g);}catch(x){}}},60);
  BB2.hook('kill',function(e){if(!e||!e.wnSn||!on())return;var w=s(),n0=elkaN();w.sb=(w.sb|0)+N('snow.perRun',1);RUN.sb=(RUN.sb|0)+N('snow.perRun',1);BB2.pdv('win.sn');
    var t=dIdx(td())+100;if((w.sd|0)!==t){w.sd=t;var gg=gold(N('snow.gold','s'));S.gold+=gg;ern('quest',gg);RUN.sg=gg;}
    if(G&&G.pt)burst(e.x,e.y,'#ffffff',18,200);st('sn',{a:'kill',n:w.sb});if(elkaN()>n0)RUN.up=1;});
  BB2.hook('bossIn',function(e,g){var b=RUN.b;if(!b||!e||e.type!==b.t)return;var d=EN[b.t];e.hp=b.hp*(e.hp/d.hp);e.max=e.hp;e.dmg*=b.dmg/d.dmg;e.wnB=1;st('boss',{a:'in',k:b.t});});
  /* Чучело: свой приём — кольцо горячих блинов и прыжок к богатырю (ИИ босса без своего case в game.js стоит на месте) */
  BB2.hook('frame',function(dt,g){var e=g&&g.boss;if(!e||e.dead||e.type!=='chuch'||e.intro>0)return;e.wA=(e.wA||2)-dt;e.wJ=(e.wJ||6)-dt;
    if(e.wA<=0){e.wA=3.2;for(var i=0;i<10;i++)eShoot(e,i/10*TAU+e.ph,150,'#f2b233',9,e.dmg*.6);if(Math.random()<.3)say(e,L('Горяч блинок!','Hot pancake!'),1.5);}
    if(e.wJ<=0){e.wJ=7;var H=g.hero,a=Math.atan2(H.y-e.y,H.x-e.x);G.fx.push({k:'poof',x:e.x,y:e.y,t:0,dur:.5});e.x=H.x-Math.cos(a)*150;e.y=H.y-Math.sin(a)*150;G.fx.push({k:'poof',x:e.x,y:e.y,t:0,dur:.5});}},65);
  BB2.hook('bossDie',function(e,g){if(!e||!e.wnB)return;RUN.bk=e.type;BB2.pdv(e.type==='karach'?'win.kar':'win.chu');st('boss',{a:'kill',k:e.type});
    if(e.type==='chuch')burst(e.x,e.y,'#ff8a2a',40,260);});
  BB2.hook('end',function(g,win){if(!on()||!g||(g.t||0)<30)return;var w=s(),h=[],x;if(is('kar')){w.r=td();var up=elkaGive();
      if(RUN.sb)h.push('⛄ '+L('Снеговик одолён: снежок','Snowman beaten: a snowball')+' · '+L('ёлка ','tree ')+elkaN()+'/5'+(RUN.sg?' · <b>+'+fn(RUN.sg)+goldW()+'</b>':''));
      up.forEach(function(r){h.push('🎄 <b>'+L('Ёлка наряднее!','The tree is brighter!')+'</b> '+rtx(r)+(r.sk?' — '+L('надет и есть у всех богатырей','worn now, every hero has it'):''));});
      x=advNext();if(x&&x.run)h.push('🎁 <b>'+L('Подарок «Карачуна» ждёт','A Karachun gift is waiting')+'</b> — '+L('в деревне у ёлки','at the tree in the village'));}
    if(RUN.bk&&win){var bk=RUN.bk==='karach'?4:8;if(!((w.x|0)&bk)){w.x=(w.x|0)|bk;var r={g:gold(N('festBoss.gold','m')),tr:N('festBoss.tro',5)};gv(r);h.push((RUN.bk==='karach'?'❄ '+L('Карачун одолён! ','Karachun defeated! '):'🔥 '+L('Чучело сожгли — зиме конец! ','The effigy is burnt — winter is over! '))+'<b>'+rtx(r)+'</b>');}} /*ECO? награда за праздничного босса (раз за праздник)*/
    if(is('bog')&&has('SL')&&sl()){try{var q=slSaga(),sp=10+(win?5:0);sagaDay(q);q.p+=sp;q.dp+=sp;if(sagaUd(q))q.u+=sp;slTouch();h.push('📜 '+L('Финал «Сказа о Святогоре»: очки Сказа ×2 (+'+sp+')','Finale of the Tale of Svyatogor: Tale points ×2 (+'+sp+')'));}catch(e){}}
    if(is('bog')&&!((w.x|0)&2)){w.x=(w.x|0)|2;BB2.ev('kuplet',{c:'zastava',src:'win',t:L('На заставе богатырской три дня пир горой: девять богатырей в строю, и '+(S.name||'наш герой')+' — с ними рядом, плечом к плечу.','At the heroes’ outpost there was a three-day feast: nine heroes in line, and '+(S.name||'our hero')+' among them, shoulder to shoulder.')});st('bog',{a:'kuplet'});}
    if(h.length)g.metaHtml=(g.metaHtml||'')+'<div class="evres wnres">'+h.map(function(t){return '<div>'+t+'</div>';}).join('')+'</div>';save();});

  /* ================= ДЕРЕВНЯ: снег, ёлка на картинке, карточка праздника ================= */
  function vilDraw(){var c=document.getElementById('village');if(!c||!is('kar'))return;var r=c.getBoundingClientRect(),Wd=r.width||360,H=r.height||230,d=Math.min(devicePixelRatio||1,2.5),g=c.getContext('2d');
    g.setTransform(d,0,0,d,0,0);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(0,H*.56,Wd,H*.44);
    g.fillStyle='rgba(255,255,255,.9)';for(var i=0;i<26;i++){var x=(i*97%Wd),y=(i*53%Math.round(H*.9));g.beginPath();g.arc(x,y,1.2+(i%3)*.6,0,6.283);g.fill();}
    elka(g,Math.max(24,Wd*.065),H*.98,H*.38,elkaN());if(advNext()&&advNext().run){g.font='bold '+Math.round(H*.08)+'px system-ui';g.textAlign='center';g.fillText('🎁',Math.max(24,Wd*.065)+H*.13,H*.96);}}
  if(has('drawVillage')&&!drawVillage.wn){var dv0=drawVillage;window.drawVillage=function(){dv0.apply(this,arguments);try{vilDraw();}catch(e){}};drawVillage.wn=1;}
  function card(){var a=[],x;
    if(is('kar')){x=advNext();a.push({ic:'w_elka',t:'🎄 '+L('«Карачун»','“Karachun”'),hot:!!(x&&x.run)||isBye(),
      s:isBye()?L('ёлка уходит — попрощайся','the tree is leaving — say goodbye'):x?(x.run?L('подарок ждёт — открой!','a gift is waiting — open it!'):L('сходи в поход — откроется подарок','go on a run — a gift will open')):L('ёлка ','tree ')+elkaN()+'/5 · '+L('подарков ','gifts ')+advCount()+'/'+NADV});}
    if(is('kan'))a.push({ic:'chest',t:'⛄ '+L('Каникулы','Winter holidays'),s:L('Поход дня — награда ×2','Daily Run — reward ×2')});
    if(is('bog'))a.push({ic:'hp_ily',t:'🛡 '+L('День богатырей','Heroes’ Day'),hot:1,s:L('все 9 богатырей открыты на пробу','all 9 heroes open to try')});
    if(is('mas'))a.push({ic:'m_blin',t:'🥞 '+L('Масленица','Shrovetide'),s:L('блины в печи, Чучело в Лихой неделе','pancakes in the oven, an effigy in Wild Week')});
    return a;}
  W.card=card;
  BB2.hook('vil',function(el){if(!on()||!el)return;var a=card();if(!a.length)return;var c=document.getElementById('village'),d=document.createElement('div'),h='';
    a.forEach(function(x,i){h+='<div class="card wnc'+(x.hot?' next':'')+'" data-wn="'+i+'" style="cursor:pointer"><div class="row"><img class="ic" src="'+ic(x.ic,96)+'" alt=""><div class="t"><b>'+x.t+'</b><span>'+x.s+'</span></div>'+(x.hot?'<span class="tag ok">'+L('Открыть','Open')+'</span>':'')+'</div></div>';});
    d.innerHTML=h;var n=c&&c.nextSibling;while(d.firstChild)el.insertBefore(d.firstChild,n||null);
    el.querySelectorAll('.wnc').forEach(function(b){b.onclick=function(){SND.click();W.open();};});});
  BB2.hook('today',function(TL){if(!on())return;card().forEach(function(x,i){TL.unshift({k:'win'+i,ic:x.ic,t:x.t,s:x.s,ready:!!x.hot,b:L('Открыть','Open'),always:1,fn:function(){hideModal();W.open();}});});});
  BB2.hook('utroTile',function(a){if(!on())return;var c=card();if(c.length)a.push({ic:c[0].ic,t:c[0].t,s:c[0].s,w:c[0].hot?88:55,fn:function(){W.open();}});});
  BB2.hook('chips',function(a){if(!on())return;var x=advNext();if(x&&x.run)a.push('<i class="hot">🎁 '+L('подарок','gift')+'</i>');else if(is('bog'))a.push('<i class="hot">🛡 '+L('День богатырей','Heroes’ Day')+'</i>');});

  /* ================= ОКНО ПРАЗДНИКА ================= */
  function isBye(){return is('kar')&&td()===D.kar[1]&&!((s().x|0)&1);}
  function grid(){var h='<div class="wng">',i,d=td(),ti=dIdx(d),x=advNext();
    for(i=0;i<NADV;i++){var o=bit(i),nx=x&&x.i===i,fut=i<DAYS?i>ti:!is('sng'),lb=i<DAYS?String(15+i):'13.01',cls=o?'dn':nx?'nw':fut?'fu':'ms';
      h+='<div class="'+cls+'"><b>'+lb+'</b>'+(o?'✓':nx?'🎁':fut?'·':'❄')+'</div>';}
    return h+'</div>';}
  W.open=function(){if(inRun())return;if(!on())return;flush();var a=[],w=s(),x=advNext(),n=elkaN(),h='';
    if(is('kar')){
      if(isBye()){w.x=(w.x|0)|1;save();st('bye',{n:n});h+='<div class="card wnbye"><b>🎄 '+L('Ёлка уходит','The tree is leaving')+'</b><span>'+(n>=5?L('Спасибо, богатырь! Ёлка была самой нарядной на всей Руси. Облик «Снежный» остаётся с тобой.','Thank you, hero! It was the brightest tree in all the land. The “Snowy” outfit stays with you.'):L('Спасибо за праздник! Сегодня последний день — забери подарок, что ждёт. А зима ещё вернётся.','Thanks for the holiday! Today is the last day — take the gift that’s waiting. Winter will be back.'))+'</span></div>';}
      h+='<div style="display:flex;align-items:center;gap:8px;margin:2px 0 4px"><canvas id="wnElka" width="160" height="150" style="flex:none;width:80px;height:75px"></canvas><div style="flex:1;min-width:0;font-size:12.5px;line-height:1.3">'+
        '<b style="font-size:13.5px">'+L('Ёлка: ','Tree: ')+n+' / 5 · ⛄ '+(w.sb|0)+(n<5?' / '+STEP[n]:'')+'</b><br>'+(n<5?L('Снеговик-хулиган заходит в любую главу на 2-й минуте. Одолей — снежок на ёлку; на 5-й ступени — облик «Снежный» всем.','The Rowdy Snowman drops into any chapter in the 2nd minute. Beat him for a snowball; step 5 gives everyone the “Snowy” outfit.'):L('Ёлка наряжена! Облик «Снежный» — у всех богатырей.','The tree is dressed! Every hero has the “Snowy” outfit.'))+'</div></div>'+
        '<b style="font-size:13px">'+L('Подарки «Карачуна» — за поход','Karachun gifts — one per run')+'</b>'+grid()+
        '<p class="sub" style="font-size:12px;margin:2px 0">'+(x?(x.run?(x.why==='catch'?L('Пропущенный подарок можно забрать — по одному в день.','You can take a missed gift — one per day.'):L('Сегодняшний подарок готов!','Today’s gift is ready!')):L('Сходи сегодня в поход — и подарок откроется.','Go on a run today and the gift will open.')):L('На сегодня всё. Завтра — новый подарок.','That’s all for today. A new gift tomorrow.'))+
        (is('karw')?'<br>❄ '+L('Карачунова неделя: в Лихой неделе босс — Карачун.','Karachun’s week: the Wild Week boss is Karachun.'):'')+'</p>';}
    if(is('kan'))h+='<p class="sub" style="font-size:12.5px;margin:4px 0 0">⛄ <b>'+L('Каникулы','Holidays')+'</b>: '+L('Поход дня ×2 и каждый день другой богатырь, Сход ×2 · ещё ','Daily Run ×2 with a new hero daily, Muster ×2 · ')+left('kan')+L(' дн.',' days left')+'</p>';
    if(is('bog'))h+='<div class="card" style="font-size:12.5px;padding:8px 10px;margin:6px 0 0">🛡 <b>'+L('День богатырей','Heroes’ Day')+'</b><br>'+L('Три дня все 9 богатырей открыты на пробу — выбирай во вкладке «Богатыри». Сход — двойная награда. Финал «Сказа о Святогоре»: очки Сказа ×2. Сыграй поход — Боян споёт куплет «Богатырская застава».','For three days all 9 heroes are open to try — pick in the Heroes tab. The Muster pays double. Finale of the Tale of Svyatogor: Tale points ×2. Play a run and Boyan sings the “Heroes’ Outpost” verse.')+'</div>';
    if(is('mas'))h+='<div class="card" style="font-size:12.5px;padding:8px 10px;margin:6px 0 0">🥞 <b>'+L('Масленица','Shrovetide')+'</b><br>'+L('В печи Подворья пекутся блины (горох + мёд). В главах Лихой недели босс — Чучело Масленицы: одолей — и прощай, зима!','Pancakes bake in the Homestead oven (peas + honey). In Wild Week chapters the boss is the Shrovetide Effigy: beat it — farewell, winter!')+'</div>';
    if(!h)return;
    var t=is('kar')?'🎄 '+L('«Карачун» — Новый год на Руси','“Karachun” — New Year in Rus'):is('bog')?'🛡 '+L('День богатырей','Heroes’ Day'):is('mas')?'🥞 '+L('Масленица','Shrovetide'):'⛄ '+L('Каникулы','Winter holidays');
    var btn=x&&x.run?'<button class="btn gold" id="wnOpen">🎁 '+L('Открыть подарок','Open the gift')+'</button>':'';
    showModal('<h3>'+t+'</h3>'+h+'<div class="btns">'+btn+'<button class="btn ghost" id="wnX">'+L('Закрыть','Close')+'</button></div>','win');
    var c=document.getElementById('wnElka');if(c){var g=c.getContext('2d');g.clearRect(0,0,160,150);elka(g,80,146,140,n);}
    var b=document.getElementById('wnOpen');if(b)b.onclick=function(){var o=advOpen();SND.click();if(o){toast('🎁 '+rtx(o.r));if(o.i===16&&typeof confetti==='function')try{confetti();}catch(e){}}W.open();};
    document.getElementById('wnX').onclick=function(){SND.click();hideModal();};st('open',{n:advCount(),e:n});};
  (function(){if(document.getElementById('wnCss'))return;var c=document.createElement('style');c.id='wnCss';c.textContent=
    '.wng{display:grid;grid-template-columns:repeat(6,1fr);gap:3px;margin:4px 0}.wng>div{text-align:center;padding:3px 0;border-radius:8px;background:rgba(255,255,255,.08);font-size:11px;line-height:1.15;border:1px solid transparent}'+
    '.wng>div b{display:block;font-size:12px}.wng>div.dn{background:rgba(74,222,106,.2)}.wng>div.nw{border-color:var(--gold,#ffc94a);background:rgba(255,201,74,.28)}.wng>div.fu{opacity:.5}.wng>div.ms{background:rgba(140,200,255,.18)}'+
    'html.lk .wng>div{background:rgba(110,67,31,.1)}html.lk .wng>div.dn{background:rgba(74,160,90,.22)}.wnbye{font-size:13px;line-height:1.35;padding:8px 10px}.wnbye span{display:block}';
    document.head.appendChild(c);})();

  /* ================= КАНИКУЛЫ: Поход дня ×2 и богатырь по кругу; Сход ×2 (и в День богатырей) ================= */
  if(has('dailyDef')&&!dailyDef.wn){var dd0=dailyDef;window.dailyDef=function(){var d=dd0.apply(this,arguments);try{if(is('kan')&&typeof HEROES!=='undefined')d.hero=HEROES[((dayIdx()%HEROES.length)+HEROES.length)%HEROES.length].id;}catch(e){}return d;};dailyDef.wn=1;}
  if(has('drReward')&&!drReward.wn){var dr0=drReward;window.drReward=function(){var v=dr0.apply(this,arguments);return is('kan')?Math.round(v*N('kanDr',2)):v;};drReward.wn=1;} /* ECO v4 winter.kanDr */
  BB2.hook('shodK',function(){if(is('kanS')||is('bogS'))return 2;}); /* MERGE: Сход ×2 в праздники — крючок EVENT вместо обёртки BB2.n */

  /* ================= ДЕНЬ БОГАТЫРЕЙ: все богатыри на пробу ================= */
  if(has('heroOpen')&&!heroOpen.wn){var ho0=heroOpen;window.heroOpen=function(h){return ho0.apply(this,arguments)||!!h&&is('bog');};heroOpen.wn=1;W.heroOwn=ho0;
    if(has('dzHeroes')){var dz0=dzHeroes;window.dzHeroes=function(){return dz0.apply(this,arguments).filter(function(h){return ho0(h);});};}}
  if(has('renderHeroes')&&!renderHeroes.wn){var rh0=renderHeroes;window.renderHeroes=function(){rh0.apply(this,arguments);try{var el=document.getElementById('tabHeroes'),h2=el&&el.querySelector('h2');if(!h2||!is('bog'))return;
    var d=document.createElement('div');d.className='card next';d.style.cssText='font-size:13px;line-height:1.35;padding:8px 10px';
    d.innerHTML='🛡 <b>'+L('День богатырей','Heroes’ Day')+'</b> — '+L('все 9 богатырей открыты на пробу до 23.02 — выбирай любого.','all 9 heroes are open to try until Feb 23 — pick any.');
    h2.parentNode.insertBefore(d,h2.nextSibling);}catch(e){}};renderHeroes.wn=1;}

  /* ================= МАСЛЕНИЦА: блины в печи ================= */
  try{if(typeof DISHES!=='undefined'&&!DISHES.blin){var BL={need:{gor:1,med:1},t:N('blin.min',30)*60,ic:'m_blin',fx:{hp:N('blin.hp',.08),spd:N('blin.spd',.05)}}; /* ECO v4 winter.blin: +8% здоровья и +5% скорости (не сильнее пирожка) */
    Object.defineProperty(BL,'name',{get:function(){return L('Блины с мёдом','Honey pancakes');},enumerable:true});Object.defineProperty(BL,'fxT',{get:function(){return L('+8% здоровья, +5% скорости','+8% health, +5% speed');},enumerable:true});
    DISHES.blin=BL;}}catch(e){}
  /* блины видны в печи только на Масленицу (испечённые раньше — в узелке и после) */
  function blinSync(){try{if(typeof DISHES==='undefined')return;var b=DISHES.blin||W.blin;if(!b)return;W.blin=b;var y=has('Y')?Y():null,keep=is('mas')||!!y&&(y.d&&y.d.blin>0||y.ov&&y.ov.k==='blin'||y.bag==='blin');
    if(keep)DISHES.blin=b;else delete DISHES.blin;}catch(e){}}
  blinSync();BB2.hook('metaTab',function(){blinSync();});

  /* ================= СКАЗЫ ЗИМЫ (поток EVENT, флаг saga2) ================= */
  function sagaSet(){try{if(typeof BB2EV==='undefined'||!BB2EV.sagaSet||typeof SAGA==='undefined')return;
    BB2EV.sagaSet(13,{nm:function(){return L('Сказ о Сивке-Бурке','Tale of Sivka-Burka');},sk:'iva@sivka'});
    BB2EV.sagaSet(14,{nm:function(){return L('Сказ о Святогоре','Tale of Svyatogor');},sk:'ily@svyat'});}catch(e){}}
  sagaSet();BB2.hook('lazy',function(){sagaSet();flush();});BB2.hook('late',function(){sagaSet();});
  W.st=function(){var w=s();return {d:td(),adv:advCount(),next:advNext(),sb:w.sb|0,elka:elkaN(),x:w.x|0,on:{kar:is('kar'),kan:is('kan'),karw:is('karw'),sng:is('sng'),bog:is('bog'),mas:is('mas')}};};
  W.D=D;W.ok=1;
  setTimeout(function(){try{flush();if(on()&&!inRun()){elkaGive();if(typeof curTab!=='undefined'&&curTab==='Village'&&has('renderVillage'))renderVillage();}}catch(e){}},300);
  return W;
})();
