'use strict';
/* ================= «Оборона 3.0», волна 1 (07.11.2026; план hobby-analytics/release-i/boost3-oborona/PLAN-3.0.md, правила стройки O3-COMMON.md) =================
   Файл грузится ПОСЛЕ ob2-core/game/ui (метка <!-- o3 --> в index.html). Без ?. ?? .at() — старые WebView (Chrome 92).
   Разделы файла (каждый поток правит ТОЛЬКО свой раздел; П0 — общий каркас, его правит ведущий):
     § П0 каркас — O3: флаги, крючки, своя ГСЧ, STAT, поле сохранения S.o2h.
     § П1 богатырь на поле — O3H (герой: движение, бой, умение, пенёк, выбор, Дружина).
     § П2 удаль, Потап из ворот, серия без прорыва — O3U (с o3:FIX п.6 — в ленивой части js/o3-tropa.js; здесь осталась калибровка силы).
   Другие файлы волны: js/o3-text.js (П4: первые 15 с, банк реплик HUMOR — по требованию), js/o3-tropa.js (П3: Тропа Кощея — по требованию),
   js/o3-ui.js (П5: Рапорт, Карта, итог боя). Новых файлов больше НЕТ (архив ≤100 файлов — GitHub за раз).
   ВАЖНО: случайность боя (rand/Math.random, длина G.bub) НЕ трогать — у волны своя ГСЧ O3.rnd(); реплики героя — свой список O3.bub, не G.bub. */

/* ================= § П0 каркас (ведущий) ================= */
var O3=(function(){
  // флаги частей (OB2.off): выключить — ?off=hero,udal,tropa,first,hum,raport,home,o3int (?off=o3 — всё «3.0»)
  var FL={hero:'П1 богатырь на поле',udal:'П2 удаль, Потап из ворот, серия',tropa:'П3 Тропа Кощея',first:'П4 первые 15 секунд',hum:'П4 голос Потапа (реплики HUMOR)',
    raport:'П5 Рапорт воеводы вместо Летописи',home:'П5 Карта ≤6 блоков, итог ≤4 блоков',o3int:'межэкранная 5 мин после 1-й главы'};
  var all=false;try{all=/[?&]off=[^&#]*\bo3\b/.test(location.search);}catch(e){}
  for(var k in FL)OB2.reg(k,{s:'O3',t:FL[k]});
  function on(id){return !all&&!OB2.off(id);}
  // своя ГСЧ: не трогает rand()/Math.random боя. Зерно — от боя (G.t старта не годится) — сбрасывается в 'run'
  var seed=(Date.now()&0x7fffffff)||1,R=mulberry(seed);
  function rnd(a,b){var x=R();return a==null?x:b==null?x*a:a+x*(b-a);}
  function pick(arr){return arr[Math.floor(R()*arr.length)];}
  // крючки (вызываются из движка, см. «O3.hk» в game.js/ui.js): каждый — список {id,fn}; выключенный флаг молчит
  var H={};
  function hook(name,id,fn){(H[name]=H[name]||[]).push({id:id,fn:fn});}
  // call: первый вернувший true «съедает» событие (для касаний); остальные значения игнорируются
  function call(name,a,b,c){var L=H[name];if(!L)return false;for(var i=0;i<L.length;i++){if(!on(L[i].id))continue;
    try{if(L[i].fn(a,b,c)===true)return true;}catch(x){err(name+'/'+L[i].id,x);}}return false;}
  var en=0;function err(w,x){en++;if(en<=5)console.warn('o3 '+w+': '+(x&&x.message||x));try{if(en<=3)STAT.ev('o3',{a:'err',w:String(w).slice(0,30),m:String(x&&x.message||x).slice(0,80)});}catch(e){}}
  function ev(a,o){try{o=o||{};o.a=a;STAT.ev('o3',o);}catch(e){}}
  // реплики героев/Потапа в бою — СВОЙ список (G.bub не трогаем): {x,y,t,d,s}
  var bub=[];
  function say(x,y,s,d){if(bub.length>2)bub.shift();bub.push({x:x,y:y,s:s,t:0,d:d||Math.min(12,4+s.length*.08)});}
  // движок → крючки (через розетку META: RUN/FRAME/DRAW/END/KILL/ST — уже зовутся в game.js/ui.js)
  META_MODS.push({id:'o3',
    RUN:function(G){R=mulberry((seed=(seed*1103515245+12345)&0x7fffffff)||1);bub.length=0;call('run',G);},
    FRAME:function(dt,G){for(var i=bub.length-1;i>=0;i--){bub[i].t+=dt;if(bub[i].t>bub[i].d)bub.splice(i,1);}call('frame',dt,G);},
    DRAW:function(c,G){call('draw',c,G);if(bub.length&&typeof drawBubble==='function')for(var i=0;i<bub.length;i++){try{drawO3Bub(c,bub[i]);}catch(x){}}},
    END:function(G,win){call('end',G,win);},
    KILL:function(e,src){call('kill',e,src);},
    ST:function(st,type){call('st',st,type);}});
  return {FL:FL,on:on,rnd:rnd,pick:pick,hook:hook,call:call,err:err,ev:ev,say:say,bub:bub};
})();
// пузырь реплики волны 3.0 (не G.bub). П4 может заменить отрисовку — переопределив drawO3Bub в своём файле.
function drawO3Bub(c,b){c.save();c.globalAlpha=Math.min(1,b.t*4,(b.d-b.t)*2);c.font=(typeof cvF==='function'?cvF(700,13):'700 13px sans-serif');
  var w=Math.min(220,c.measureText(b.s).width+16),x=Math.max(4,Math.min(WW-w-4,b.x-w/2)),y=Math.max(4,b.y-46);
  c.fillStyle='rgba(255,250,236,.95)';c.strokeStyle='#8a5a2b';c.lineWidth=1.5;if(typeof rr==='function'){rr(c,x,y,w,24,8);c.fill();c.stroke();}else c.fillRect(x,y,w,24);
  c.fillStyle='#2b2117';c.textAlign='left';c.textBaseline='middle';c.fillText(b.s.length>34?b.s.slice(0,33)+'…':b.s,x+8,y+12);c.restore();}
// поле сохранения Дружины: S.o2h {h:{id:{xp,lv}}, a:'dob' — кто идёт в бой, o:'порядок прихода', d:'ГГГГ-ММ-ДД' первого дня 3.0, n: открыто новинок старому игроку}
OB2.field('h',{id:'hero',def:function(){return {h:{},a:'dob'};}});

/* ================= § П1 богатырь на поле (O3H) ================= */
/* ДОГОВОР O3H (для П2/П3/П4/П5; меняется только добавлением):
   O3H.hero  — герой текущего боя или null (флаг hero выкл., Босс недели, вне боя):
               {hero:1, id:'dob'|'vas'|'ale', x,y (координаты поля, как у нечисти), hp,hpMax, pow (урон за удар — уже с mul/buf/злостью), r (радиус удара),
                cd (до умения, с), cdMax (20), down (>0 — сидит на пеньке, с), rage (>0 — злой ×1,5, с), tg (цель-враг|null),
                kills (убито за бой), sk (умений за бой), go (тапов «иди сюда»), fall (падений), kills/dmgd — считает движок (src)}
   O3H.mul   — множитель силы героя (калибровка П2; по умолчанию 1; можно ставить в крючке 'run' по месту главы)
   O3H.buf   — временный множитель (Тропа «богатырь +30 %» — П3 ставит после 'run'); сам сбрасывается в 1 на каждом 'run'
   O3H.cur() — id богатыря, идущего в бой; O3H.list() — открытые ['dob',…]; O3H.name(id[,вин.]) — имя на языке игры
   O3H.base(id) — {dmg,cd,r,hp,kind} без mul (сила уже от Славы); O3H.on(G) — будет ли герой в этом бою; O3H.stats(id) — {xp: боёв}
   O3H.goTo(x,y) — «иди сюда» (к ближайшей точке дороги); O3H.heal(n); O3H.hurt(n) — ударить героя
   Убийство героем: крючок O3 'kill' получает src===O3H.hero (src.hero===1); проще — O3H.onKill(fn(e,hero)).
   STAT: o3 {a:'hero',k:'end',h,go,sk,dn,kl,w} — раз за бой итогом. */
var O3H=(function(){
  var NM={dob:['Добрыня','Dobrynya','Добрыню'],vas:['Василиса','Vasilisa','Василису'],ale:['Алёша','Alyosha','Алёшу']};
  // сила на старте ≈ одна застава стрельцов 1-го ур. (6 урона / 0,8 с ≈ 7,5 в секунду): Обычный — слабая подмога, не «за тебя»
  var B={dob:{dmg:7,cd:1,r:46,hp:130,kind:'phys',air:0,sp:62},vas:{dmg:6,cd:1.1,r:84,hp:85,kind:'magic',air:1,sp:58},ale:{dmg:6,cd:.85,r:112,hp:85,kind:'phys',air:1,sp:66}};
  var CDM=20,KL=[];
  // o3:FIX калибровка «вратаря» (п.1 FIX): hold — замедление нечисти вплотную к герою, post — где стоит у ворот (px пути до ворот)
  var K={hold:.95,post:100,low:1,lowAt:.5};   // low — множитель силы, когда жизней ≤ lowAt от начала («последний рубеж»: спасает от поражения, не от 3★)
  function L(a,b){return typeof Lg==='function'?Lg(a,b):a;}
  function D(){return (typeof S!=='undefined'&&S&&S.o2h)||null;}
  function list(){var d=D(),o=d&&d.o?String(d.o).split(','):['dob'];return o.filter(function(x){return !!B[x];});}
  function cur(){var d=D(),a=d&&d.a,l=list();return l.indexOf(a)>=0?a:l[0];}
  function name(id,acc){var n=NM[id]||NM.dob;return acc?L(n[2],n[1]):L(n[0],n[1]);}
  function slK(){try{if(typeof SL==='function'&&typeof slLv==='function'){var s=SL();if(s)return 1+Math.min(2,(slLv(s.x).l-1)*.04);}}catch(e){}return 1;}
  function base(id){var b=B[id]||B.dob,k=slK();return {dmg:b.dmg*k,cd:b.cd,r:b.r,hp:Math.round(b.hp*(1+(k-1)*.5)),kind:b.kind,air:b.air};}
  function newsOk(id){try{if(typeof O3.newsOk==='function')return O3.newsOk(id)!==false;}catch(e){}return true;}
  // Босс недели — без героя: честная таблица (у всех одни условия; герой разной силы от Славы сломал бы сравнение)
  function on(g){g=g||G;return !!(g&&O3.on('hero')&&!g.wk&&D()&&newsOk('hero'));}
  function stats(id){var d=D(),h=d&&d.h&&d.h[id];return {xp:h&&h.xp|0};}
  var api={hero:null,mul:1,buf:1,cur:cur,list:list,name:name,base:base,on:on,stats:stats,
    goTo:goTo,heal:function(n){var h=api.hero;if(h&&!h.down)h.hp=Math.min(h.hpMax,h.hp+n);},hurt:function(n){hurt(n);},onKill:function(fn){KL.push(fn);},B:B,NM:NM,K:K};
  // ---------- реплики ----------
  var SAY={
    tap:{dob:[['Не бойся, застава, я тут!','Fear not, outpost, I’m here!'],['Щит при мне, рука крепка.','Shield in hand, arm is strong.'],['Кто к воротам — тот ко мне.','Whoever comes to the gate meets me.']],
         vas:[['Заморожу — не оттают!','I’ll freeze them solid!'],['Холодно? Это я.','Feeling chilly? That’s me.'],['Колдую, не мешай.','Casting. Don’t distract me.']],
         ale:[['Стрела летит — нечисть плачет.','Arrow flies, monster cries.'],['Кто там летает? Сейчас приземлю.','Something flying? I’ll bring it down.'],['Глаз зоркий, лук тугой.','Sharp eye, tight bow.']]},
    go:[['Иду!','On my way!'],['Есть!','Aye!'],['Бегу, бегу!','Running!'],['Туда? Сделаю.','Over there? Done.']],
    sk:{dob:['Стоять!','Halt!'],vas:['Мороз, кусай!','Frost, bite!'],ale:['Град стрел!','Arrow hail!']},
    down:[['Ох, спина… Посижу на пеньке.','Oof, my back… I’ll sit on this stump.'],['Вот я вам сейчас… только отдышусь.','Just you wait… let me catch my breath.'],['Пенёк удобный. Но я злой.','Comfy stump. Still angry.']],
    grum:[['Ворчу. Имею право.','Grumbling. I’ve earned it.'],['Ещё чуть-чуть посижу…','Just a little longer…'],['Кто ж так толкается!','Who pushes like that!']],
    up:[['Ну всё, я злой!','That’s it, I’m angry!'],['Встал! Держитесь!','I’m up! Look out!']]};
  function sayL(h,p){if(!h||!p)return;O3.say(h.x,h.y-36,L(p[0],p[1]),2.6);}
  // ---------- дорога ----------
  function nearRoad(x,y){var best=null,bd=1e18;var P=G.map.paths;for(var pi=0;pi<P.length;pi++){var p=P[pi],n=p.xs.length;for(var i=0;i<n;i+=3){var dx=p.xs[i]-x,dy=p.ys[i]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;best={x:p.xs[i],y:p.ys[i],d2:d,pi:pi,d:i*STEP};}}}return best;}
  // развилки: где путь a ближе 12 к пути b — пары {a:d на a, b:d на b} (кэш на карту)
  var JC={},JM=null;function junc(a,b){if(JM!==G.map){JM=G.map;JC={};}var k=a+'>'+b;if(JC[k])return JC[k];var P=G.map.paths,A=P[a],Bp=P[b],L2=[];
    for(var i=0;i<A.xs.length;i+=4)for(var j=0;j<Bp.xs.length;j+=4){var dx=A.xs[i]-Bp.xs[j],dy=A.ys[i]-Bp.ys[j];if(dx*dx+dy*dy<144){L2.push({a:i*STEP,b:j*STEP});break;}}return JC[k]=L2;}
  // шаг по дороге к точке пути (pi2,d2); последний шаг до нечисти (fin) — с дороги напрямую, не дальше 34
  function walk(h,pi2,d2,fin,st){var dx,dy,dl;
    if(!h.on&&fin){dx=fin.x-h.x;dy=fin.y-h.y;dl=Math.sqrt(dx*dx+dy*dy);if(dl<40){if(dl>4){h.x+=dx/dl*Math.min(st,dl-4);h.y+=dy/dl*Math.min(st,dl-4);h.mv=1;}return false;}}
    if(!h.on){var q=nearRoad(h.x,h.y);dx=q.x-h.x;dy=q.y-h.y;dl=Math.sqrt(dx*dx+dy*dy);
      if(dl<=st+.5){h.on=1;h.pi=q.pi;h.pd=q.d;}else{h.x+=dx/dl*st;h.y+=dy/dl*st;h.mv=1;if(Math.abs(dx)>.5)h.face=dx>0?1:-1;}return false;}
    if(h.pi!==pi2){var J=junc(h.pi,pi2),bj=null,bv=1e18;for(var i=0;i<J.length;i++){var v=Math.abs(J[i].a-h.pd)+Math.abs(J[i].b-d2);if(v<bv){bv=v;bj=J[i];}}
      if(!bj){h.on=0;return walk(h,pi2,d2,fin,st);}   // развилки нет — сойти с дороги (редко)
      if(Math.abs(bj.a-h.pd)<=st){h.pi=pi2;h.pd=bj.b;}else h.pd+=bj.a>h.pd?st:-st;}
    else if(Math.abs(d2-h.pd)>st)h.pd+=d2>h.pd?st:-st;
    else{h.pd=d2;if(!fin)return true;}
    var p=pathPos(h.pi,h.pd),ox=h.x;h.x=p.x;h.y=p.y;h.mv=1;if(Math.abs(h.x-ox)>.05)h.face=h.x>ox?1:-1;
    if(fin&&h.pi===pi2&&Math.abs(d2-h.pd)<1){dx=fin.x-h.x;dy=fin.y-h.y;dl=Math.sqrt(dx*dx+dy*dy);if(dl>4&&dl<34){h.on=0;h.x+=dx/dl*Math.min(st,dl-4);h.y+=dy/dl*Math.min(st,dl-4);}}
    return false;}
  function post(){var p=G.map.paths[0],d=Math.max(0,p.len-K.post),q=pathPos(0,d);return {x:q.x,y:q.y,pi:0,d:d};}
  function goTo(x,y){var h=api.hero;if(!h||!G||G.over)return false;var q=nearRoad(x,y);if(!q||q.d2>95*95)return false;
    h.tx=q.x;h.ty=q.y;h.tpi=q.pi;h.td=q.d;h.cmdT=G.t;h.go++;if(h.down<=0&&(G.t-(h.goSay||-9))>6){h.goSay=G.t;sayL(h,O3.pick(SAY.go));}
    G.fx.push({k:'ring',x:q.x,y:q.y,r:16,t:0,dur:.45,col:'#ffd84a'});return true;}
  // ---------- бой ----------
  function canHit(h,e){return !e.dead&&!e.under&&!e.invul&&(!e.fly||B[h.id].air)&&!(e.cloak&&B[h.id].kind!=='magic');}
  function d2(a,b){return (a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y);}
  function pickT(h,r){var best=null,bv=1e18,r2=(r+0)*(r+0);for(var i=0;i<G.en.length;i++){var e=G.en[i];if(!canHit(h,e))continue;var dd=d2(h,e);if(dd>r2)continue;
      var v=dd-(h.id==='ale'&&e.fly?1e6:0);if(v<bv){bv=v;best=e;}}return best;}
  function hit(h,e,k){if(!e||e.dead)return;dmgEnemy(e,h.pow*(k||1),B[h.id].kind,h);}
  function hurt(n){var h=api.hero;if(!h||h.down>0)return;h.hp-=n;if(h.hp<=0){h.hp=0;h.down=10;h.fall++;h.tg=null;h.tx=h.ty=null;sayL(h,O3.pick(SAY.down));h.grT=3.5;}}
  function skill(h){var t=null,i,e;
    if(h.id==='dob'){var bv=-1;for(i=0;i<G.en.length;i++){e=G.en[i];if(!canHit(h,e)||d2(h,e)>(h.r+50)*(h.r+50))continue;var v=(e.boss?3e6:0)+(e.lead?2e6:0)+e.hp;if(v>bv){bv=v;t=e;}}
      if(!t)return false;t.stunT=Math.max(t.stunT||0,t.boss?1.2:3);hit(h,t,3);h.fxS={k:'shield',x:t.x,y:t.y,t:0};}
    else if(h.id==='vas'){var bn=0;for(i=0;i<G.en.length;i++){e=G.en[i];if(!canHit(h,e)||d2(h,e)>130*130)continue;var n=0;for(var j=0;j<G.en.length;j++){var o=G.en[j];if(!o.dead&&d2(o,e)<70*70)n++;}if(n>bn){bn=n;t=e;}}
      if(!t||bn<2&&!t.boss&&!t.lead)return false;h.frost={x:t.x,y:t.y,t:5,r:72};}
    else{var a=[];for(i=0;i<G.en.length;i++){e=G.en[i];if(canHit(h,e)&&d2(h,e)<170*170)a.push(e);}if(!a.length)return false;
      a.sort(function(p,q){return (q.fly?1e6:0)+q.hp-((p.fly?1e6:0)+p.hp);});for(i=0;i<5;i++){e=a[i%a.length];hit(h,e,2.2);h.shots.push({x:e.x,y:e.y-(e.fly?16:6),t:0});}}
    h.cd=CDM;h.sk++;O3.say(h.x,h.y-36,L(SAY.sk[h.id][0],SAY.sk[h.id][1]),1.8);return true;}
  function frame(dt,g){var h=api.hero;if(!h||g.over)return;var b=B[h.id],i,e;
    h.ft+=dt;for(i=h.shots.length-1;i>=0;i--){h.shots[i].t+=dt;if(h.shots[i].t>.22)h.shots.splice(i,1);}if(h.fxS){h.fxS.t+=dt;if(h.fxS.t>.6)h.fxS=null;}
    if(h.frost){var f=h.frost;f.t-=dt;for(i=0;i<G.en.length;i++){e=G.en[i];if(e.dead||d2(e,f)>f.r*f.r)continue;e.slow=Math.max(e.slow||0,e.boss?.3:.55);dmgEnemy(e,h.pow*.25*dt,'magic',h);}if(f.t<=0)h.frost=null;}
    if(h.down>0){h.down-=dt;h.grT-=dt;if(h.grT<=0){h.grT=4;if(h.down>1.5)sayL(h,O3.pick(SAY.grum));}
      if(h.down<=0){h.down=0;h.hp=h.hpMax;h.rage=8;sayL(h,O3.pick(SAY.up));}return;}
    if(h.rage>0)h.rage-=dt;
    var bs=base(h.id);h.r=bs.r;h.pow=bs.dmg*(+api.mul||1)*(+api.buf||1)*(h.rage>0?1.5:1)*(g.maxLives&&g.lives<=g.maxLives*K.lowAt?K.low:1);
    if(!g.started){return;}
    if(h.cd>0)h.cd-=dt;
    // цель и движение
    var tg=pickT(h,h.r);h.tg=tg;var idle=g.t-h.cmdT>10;
    if(h.tx==null&&!tg&&idle){var ne=null,nd=1e18;for(i=0;i<G.en.length;i++){e=G.en[i];if(!canHit(h,e))continue;var dd=d2(h,e);if(dd<nd){nd=dd;ne=e;}}
      if(ne){h.chase=ne;}else if(!h.chase||h.chase.dead){h.chase=null;var p0=post();if(d2(h,p0)>24*24&&g.t-h.lastHit>3){h.tx=p0.x;h.ty=p0.y;h.tpi=0;h.td=p0.d;h.home=1;}}}
    if(tg&&!h.cmd2)h.chase=null;
    h.mv=0;var st=b.sp*(h.rage>0?1.25:1)*dt;
    if(h.tx!=null){if(walk(h,h.tpi,h.td,null,st)){h.tx=h.ty=null;}}
    else if(h.chase&&!h.chase.dead&&!tg){var ce=h.chase;walk(h,ce.pi,ce.d,ce,st);}
    // удар
    h.hcd-=dt;if(tg){if(Math.abs(tg.x-h.x)>.5&&!h.mv)h.face=tg.x>h.x?1:-1;
      if(h.hcd<=0){h.hcd=b.cd;hit(h,tg);h.lastHit=g.t;h.sw=.18;if(h.id!=='dob')h.shots.push({x:tg.x,y:tg.y-(tg.fly?16:6),t:0});}}
    if(h.sw>0)h.sw-=dt;
    if(h.cd<=0&&tg)skill(h);
    // держит одну наземную нечисть вплотную; бьют его те, кто рядом
    var near=0,hd=null,hdd=1e18;for(i=0;i<G.en.length;i++){e=G.en[i];if(e.dead||e.fly||e.under)continue;var q=d2(h,e);if(q<30*30){near+=e.boss?10:e.lead?5:2.5;if(!e.boss&&q<hdd){hdd=q;hd=e;}}}
    if(hd&&K.hold)hd.slow=Math.max(hd.slow||0,K.hold);
    if(near)hurt(near*dt*(g.hpK>1?Math.min(2,g.hpK):1));else if(h.hp<h.hpMax)h.hp=Math.min(h.hpMax,h.hp+4*dt);}
  function run(g){api.hero=null;api.buf=1;if(!on(g))return;var id=cur(),bs=base(id),p=post();
    api.hero={hero:1,id:id,x:p.x,y:p.y,on:1,pi:0,pd:p.d,tpi:0,td:0,hp:bs.hp,hpMax:bs.hp,pow:bs.dmg,r:bs.r,cd:10,cdMax:CDM,down:0,rage:0,tg:null,kills:0,dmgd:0,sk:0,go:0,fall:0,
      tx:null,ty:null,cmdT:0,chase:null,face:-1,ft:0,hcd:0,sw:0,shots:[],frost:null,fxS:null,lastHit:0,mv:0,grT:0};bindPC();}
  function end(g,win){var h=api.hero;if(!h)return;try{var d=D();if(d){d.h=d.h||{};var r=d.h[h.id]=d.h[h.id]||{xp:0,lv:1};r.xp=(r.xp|0)+1;}}catch(e){}
    O3.ev('hero',{k:'end',h:h.id,go:h.go,sk:h.sk,dn:h.fall,kl:h.kills,w:win?1:0});}
  function kill(e,src){if(src&&src.hero===1)for(var i=0;i<KL.length;i++){try{KL[i](e,src);}catch(x){O3.err('onKill',x);}}}
  // касание по герою — реплика (съедаем, только если герой ближе ближайшего места под заставу)
  function tap(p){var h=api.hero;if(!h)return false;var dd=(h.x-p.x)*(h.x-p.x)+(h.y-16-p.y)*(h.y-16-p.y);if(dd>30*30)return false;
    var sp=G.map.spots;for(var i=0;i<sp.length;i++){if((sp[i].x-p.x)*(sp[i].x-p.x)+(sp[i].y-p.y)*(sp[i].y-p.y)<dd)return false;}
    if(h.down>0)sayL(h,O3.pick(SAY.grum));else sayL(h,O3.pick(SAY.tap[h.id]));return true;}
  function tapm(p){if(typeof ringI!=='undefined'&&ringI>=0)return false;goTo(p.x,p.y);return false;}
  var pcB=0;function bindPC(){if(pcB||typeof cv==='undefined'||!cv)return;pcB=1;
    cv.addEventListener('contextmenu',function(e){if(!G||!api.hero||!O3.on('hero'))return;e.preventDefault();var p=toWorld(e.clientX,e.clientY);goTo(p.x,p.y);});}
  // ---------- рисунок (мировые координаты) ----------
  function draw(c,g){var h=api.hero;if(!h)return;var S0=.85,i;
    if(h.frost){var f=h.frost;c.save();c.globalAlpha=.22+.08*Math.sin(h.ft*6);c.fillStyle='#9fd8ff';c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();c.globalAlpha=.7;c.strokeStyle='#e8f6ff';c.lineWidth=2;c.stroke();c.restore();}
    if(h.fxS){c.save();c.globalAlpha=1-h.fxS.t/.6;c.strokeStyle='#ffd84a';c.lineWidth=4;c.beginPath();c.arc(h.fxS.x,h.fxS.y,14+h.fxS.t*30,0,TAU);c.stroke();c.restore();}
    for(i=0;i<h.shots.length;i++){var s=h.shots[i],q=s.t/.22;c.save();c.strokeStyle=h.id==='vas'?'#bfe8ff':'#f5e2a8';c.lineWidth=h.id==='vas'?3:2;c.globalAlpha=1-q*.6;c.beginPath();
      var sx=h.x+(s.x-h.x)*Math.max(0,q-.35),sy=h.y-16+(s.y-h.y+16)*Math.max(0,q-.35);c.moveTo(sx,sy);c.lineTo(h.x+(s.x-h.x)*q,h.y-16+(s.y-h.y+16)*q);c.stroke();c.restore();}
    c.save();c.translate(h.x,h.y);
    // золотой круг под ногами (злой — красноватый)
    c.globalAlpha=.75;c.strokeStyle=h.rage>0?'#ff7a3a':'#ffd84a';c.lineWidth=2.5;c.beginPath();c.ellipse(0,10,20,7.5,0,0,TAU);c.stroke();c.globalAlpha=.2;c.fillStyle=c.strokeStyle;c.fill();c.globalAlpha=1;
    if(h.down>0){c.fillStyle='#7a4a24';c.beginPath();c.ellipse(0,8,13,5,0,0,TAU);c.fill();c.fillStyle='#9a6434';c.fillRect(-13,-1,26,9);c.fillStyle='#c89458';c.beginPath();c.ellipse(0,-1,13,4.5,0,0,TAU);c.fill();
      c.strokeStyle='#8a5a2b';c.lineWidth=1;c.beginPath();c.ellipse(0,-1,7,2.4,0,0,TAU);c.stroke();}
    var sc=S0*(h.down>0?.8:1);c.translate(0,h.down>0?-4-22*sc:10-25*sc);c.scale(sc*(h.face>0?1:-1),sc);
    if(h.sw>0&&h.id==='dob')c.rotate(-.12);if(h.rage>0){c.shadowColor='#ff5a2a';c.shadowBlur=10;}
    try{drawHero(c,HERO_ART[h.id],h.mv?((h.ft*6|0)%2===0):false);}catch(x){}
    c.restore();
    // полоска здоровья / пенёк
    var bw=34,by=h.y-(h.down>0?44:50);c.fillStyle='rgba(0,0,0,.55)';c.fillRect(h.x-bw/2-1,by-1,bw+2,6);
    if(h.down>0){c.fillStyle='#c8a060';c.fillRect(h.x-bw/2,by,bw*(1-h.down/10),4);}else{c.fillStyle=h.hp/h.hpMax>.35?'#ffd84a':'#ff6a3a';c.fillRect(h.x-bw/2,by,bw*h.hp/h.hpMax,4);}
    c.fillStyle='#9fd8ff';c.fillRect(h.x-bw/2,by+4,bw*(1-Math.max(0,h.cd)/CDM),1.5);
    if(VIEW&&VIEW.wide)panel(c,h);}
  // ПК (широкий экран): портрет и полоска умения у поля, без кнопок (экранные координаты)
  function panel(c,h){var ox=VIEW.ox,sz=64,x,y;c.save();c.setTransform(VIEW.dpr,0,0,VIEW.dpr,0,0);
    if(ox>=sz+40){x=ox-sz-24;y=Math.round(VIEW.H*.42);}else{sz=52;x=Math.max(8,ox+8);y=Math.max(70,VIEW.H-310);}c.fillStyle='rgba(30,20,12,.72)';if(typeof rr==='function'){rr(c,x-6,y-6,sz+12,sz+46,12);c.fill();}
    c.save();c.translate(x+sz/2,y+sz/2+6);c.scale(sz/51,sz/51);try{drawHero(c,HERO_ART[h.id],false);}catch(e){}c.restore();
    c.font=cvF(800,16);c.textAlign='center';c.fillStyle='#ffe7a0';c.fillText(name(h.id),x+sz/2,y+sz+18);
    c.fillStyle='rgba(0,0,0,.5)';c.fillRect(x,y+sz+26,sz,6);c.fillStyle=h.down>0?'#c8a060':'#9fd8ff';c.fillRect(x,y+sz+26,sz*(h.down>0?1-h.down/10:1-Math.max(0,h.cd)/CDM),6);c.restore();}
  O3.hook('run','hero',run);O3.hook('frame','hero',frame);O3.hook('draw','hero',draw);O3.hook('end','hero',end);O3.hook('kill','hero',kill);
  O3.hook('tap','hero',tap);O3.hook('tapm','hero',tapm);
  // ---------- приход богатырей и выбор ----------
  function won(c,l){try{return !!(S.stars&&S.stars[lvKey(c,l)]);}catch(e){return false;}}
  function add(id){var d=D();if(!d)return;var l=list();if(l.indexOf(id)<0){l.push(id);d.o=l.join(',');}d.a=id;try{save();}catch(e){}}
  function winSlot(g,win){var d=D();if(!d||!win||!O3.on('hero'))return null;var l=list();
    if(l.length===1&&won(CH_ORDER[0],0)&&newsOk('hero2')){var A=(typeof OK!=='undefined'&&OK)?['vas','ale']:['ale','vas'];
      var bt=function(id){return '<button class="btn gold" data-o3h="'+id+'" style="padding:6px 14px;min-height:48px;font-size:16px;margin:2px 4px">'+name(id,1)+'</button>';};
      return {h:'<span style="font-size:16px">🛡 '+L('Кого позовём — ','Who shall we call — ')+name(A[0],1)+L(' или ',' or ')+name(A[1],1)+'?</span><div>'+bt(A[0])+bt(A[1])+'</div>',
        bind:function(el){el.removeAttribute('data-fit');/* o3:QA выбор богатыря — не прятать fitModal'ом (360×640: иначе второй богатырь не приходит никогда; кнопки окна липкие) */var B2=el.querySelectorAll('[data-o3h]');for(var i=0;i<B2.length;i++)B2[i].onclick=function(){var id=this.getAttribute('data-o3h');try{SND.click();}catch(e){}add(id);
          O3.ev('hero',{k:'pick',h:id});el.innerHTML='🛡 '+name(id)+L(' придёт в следующий бой!',' will join the next battle!');if(typeof fitModal==='function')fitModal();};}};}
    if(l.length===2&&won(CH_ORDER[1],5)&&newsOk('hero3')){var nx=['vas','ale'].filter(function(x){return l.indexOf(x)<0;})[0];if(!nx)return null;add(nx);O3.ev('hero',{k:'pick',h:nx,auto:1});
      return {h:'<span style="font-size:16px">🛡 '+L('Пришёл','Joined:')+' '+name(nx)+'! '+L('Кого брать в бой — выбери перед боем.','Pick who fights in the window before battle.')+'</span>'};}
    return null;}
  OB2.slot('win','hero',winSlot,70);
  // плашка «Богатырь: Добрыня ▸» в окне перед боем (нажатие — следующий)
  function plq(){var l=list();if(l.length<2||!O3.on('hero'))return;var mb=document.getElementById('mBody');if(!mb||mb.querySelector('.o3hp'))return;
    var d=document.createElement('button');d.className='btn ghost o3hp';d.style.cssText='display:block;width:100%;min-height:48px;font-size:16px;margin:6px 0;text-align:left;padding:6px 12px';
    var put=function(){d.innerHTML='🛡 '+L('Богатырь: ','Hero: ')+'<b>'+name(cur())+'</b> ▸';};put();
    d.onclick=function(){var l2=list(),i=l2.indexOf(cur()),D2=D();if(D2){D2.a=l2[(i+1)%l2.length];try{save();}catch(e){}}try{SND.click();}catch(e){}put();};
    var say=mb.querySelector('.say'),bt=mb.querySelector('.btns');if(say&&say.nextSibling)mb.insertBefore(d,say.nextSibling);else if(bt)mb.insertBefore(d,bt);else mb.appendChild(d);if(typeof fitModal==='function')fitModal();}
  try{var oI=window.openIntro;if(typeof oI==='function')window.openIntro=function(){var r=oI.apply(this,arguments);try{plq();}catch(x){O3.err('intro/hero',x);}return r;};}catch(e){}
  return api;
})();

/* ================= § П2 калибровка силы богатыря (в старте; удаль/Потап/серия O3U — в ленивой части js/o3-tropa.js § FIX, o3:FIX п.6) ================= */
(function(){
  // калибровка силы богатыря по месту земли (CH_ORDER): O3H.mul ставится на каждом бою (флаг hero — калибровка часть героя; ?off=udal её не трогает)
  var MUL=[1,1,1,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9];   // места 1–3 — как есть (герой и так заметен: 28→8 % урона), дальше растёт: доля ≥3–4 %, «слабый игрок» с 1-й ≤95 %
  /* o3:FIX (FIX-O3 п.1) Обычный в кампании — герой слабее: с ним обычный бот набирал ~190★ против ~125 без героя (звёзды → кузница → всё легче).
     MULN — сила по месту (места 1–3 ×0,4, к 11-му ×2,2: помогает там, где слабый игрок проигрывает); удержание у ворот (hold) выкл.; Потап из ворот — только при ≤50 % жизней (POT.lvN).
     ⚔/🔥, Тропа, Застава дня, осада — как было (MUL, hold .95, Потап сразу). Итог: обычный бот ★ ≈142 (v5.7 ≈125), слабый с 1-й ≈92 % (FIX-O3 журнал). */
  var MULN=[.4,.4,.4,.5,.6,.8,1.1,1.4,1.7,2,2.2,2.4];
  function nrm(G){return !!(G&&!G.endless&&!G.wk&&!G.dly&&!G.rule&&(G.dif||'n')==='n');}
  O3.hook('run','hero',function(G){if(typeof O3H==='undefined')return;var pl=0;try{pl=Math.max(0,CH_ORDER.indexOf(G.ci));}catch(e){}
    var n=nrm(G),M=window.__o3mul||(n?MULN:MUL);O3H.mul=M[Math.min(pl,M.length-1)];if(O3H.K)O3H.K.hold=n?0:.95;});
  O3H.MUL=MUL;O3H.MULN=MULN;O3H.nrm=nrm;
})();
