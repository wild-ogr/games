'use strict';
/* ================= zb3-PAPER — «Газета» (доска у подъезда, «Вечёрка у Зины»), поздняя часть (BUILD 25.10: вынесено из старта js/zb3-paper.js — там флаги, поле S.z3p, доска двора). 25.10.2026, ветка z3-paper =================
   Журнал: hobby-analytics/release-i/zina-boost3/Z3-PAPER.md. Ленивая часть — js/zb3-paper-x.js (номер, вечерний выпуск, архив, рубрики),
   данные — js/zb3-paper-data.js (tools/zb3_paper_data.py из z3-text), поля Филворда — js/zb3-paper-fw.js (tools/zb3_paper_fw.py).
   Флаги: 'paper' — доска во дворе и номер; 'z3rub' — рубрики в реестре Z3.rubAdd (их же берёт CORE для смешанных уровней).
   ДОСКА: Z3.yardAdd({id:'paper'}) → экран ZB.go('z3paper', {dn?, arch?, ev?, r?}). Открывается по «Неделе новосёла» (Z3.OPEN.paper = 2-й день).
   РУБРИКИ (Z3.rubAdd, play(el,o) → o.done({ok,m,s}) ровно раз): sv Связи, sh Шифровка, rp Красная ручка (NUM — обёрткой ZBNUM.rub),
     fw Филворд с главным словом (среда), vy Вышивка-нонограмма (четверг), bb Барабан (пятница, мини-игра 'baraban'),
     sk Сканворд деда Семёна (Сб–Вс, мини-игра 'vecherka' — по выходным она большая), zg «Зина загадала» (слово дня, мини-игра 'zagadala').
     o.from: 'paper' (номер дня), 'level' (CORE: смешанный уровень, seed — зерно уровня), 'arch' (архив, o.dn — день).
   ПОЛЕ S.z3p (≤1,5 КБ): k день, o биты прочитано (1 утро, 2 вечер, 4 эфир, 8 серия, 16 «двор говорит», 32 загадки), s биты решено сегодня
     (fw 1, vy 2, ef 4, bb 8, sk 16, zg 32, sv 64, sh 128, rp 256), w биты «награда выдана» сегодня, rc разгадано загадок сегодня, q загадано сегодня,
     n номеров прочитано всего, d1 первый прочитанный день (стаж), d последний, r серия дней, b рекорд, t рубрик решено всего, qn загадано всего,
     vf/vo — мой голос в развилке сериала (id, вариант), e/ec/eg/pe/pc/pg — события двора (js/zb3-paper-ev.js), ar — день и счёт архивных наград {d,c}, gp — побед в «Золотом пере», gm — месяц последней (ГГГГММ).
   Для ALBUM (подшивка, стаж): window.Z3PAPER.stat() → {n, d1, r, b, t, qn}.
   STAT: z3p {a: show|open|read|ev|rub|solve|fail|rew|vote|rid|sol|ef|arch, r, t, m, ...} — список полей в журнале.
   Старые WebView (Chrome 92): без ?. ?? .at :has. */
(function(){
if(typeof ZB==='undefined'||typeof S==='undefined'||!window.Z3||!Z3.on||!window.Z3PAPER||Z3PAPER.Z)return;
var P0=window.Z3PAPER,ON=P0.ON,RON=P0.RON,DEF=P0.DEF;
function Z(){if(!S.z3p)S.z3p=JSON.parse(JSON.stringify(DEF));var z=S.z3p,t=Z3.tk();
  if(t&&z.k!==t){z.k=t;z.o=0;z.s=0;z.w=0;z.rc=0;z.q=0;}return z;}
var BIT={fw:1,vy:2,ef:4,bb:8,sk:16,zg:32,sv:64,sh:128,rp:256,ff:512};
/* рубрика дня недели: 0 Вс … 6 Сб (день — todayKey, как у остальных «дневных» игр) */
var DOW=['sk','sv','sh','fw','vy','bb','sk'];
function dow(k){k=k||Z3.tk();return new Date(Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100)).getUTCDay();}
function ev(a,p){var o={a:a},k;for(k in p||{})o[k]=p[k];Z3.ev('z3p',o);}
var P=P0;var PX={Z:Z,BIT:BIT,DOW:DOW,dow:dow,ev:ev,on:function(){return ON&&Z3.open('paper');},
  x:function(){return P.ui?Promise.resolve(P):ZB.load('js/zb3-paper-x.js').then(function(){return P;});},
  stat:function(){var z=Z();return {n:z.n,d1:z.d1,r:z.r,b:z.b,t:z.t,qn:z.qn,gp:z.gp};},
  /* «Золотое перо»: сколько раз игрок выиграл конкурс загадок месяца (для звания ALBUM) */
  pero:function(){return Z().gp;},
  /* для двора: что сегодня ещё не сделано в номере */
  left:function(){var z=Z(),r=DOW[dow()],n=0;if(!(z.s&BIT[r]))n++;if(!(z.s&BIT.zg))n++;if(!(z.s&BIT.rp))n++;return n;}};
for(var pk in PX)P[pk]=PX[pk];

/* ---------- экран номера (ленивый) ---------- */
ZB.screen('z3paper',{title:'Вечёрка у Зины',render:function(el,op){
  if(P.ui){ZB.safe('z3p-scr',function(){P.render(el,op||{});});return;}
  el.innerHTML='<div class="z3p-wait" style="padding:40px 16px;text-align:center;color:var(--z3-ink2,#6b5f4c)">📰 Люся несёт номер…</div>';
  P.x().then(function(){if(ZB.cur==='z3paper')ZB.safe('z3p-scr',function(){P.render(el,op||{});});},
    function(){try{if(typeof toast==='function')toast('Номер не загрузился — попробуй ещё раз',3000);}catch(e){}try{if(typeof openMenu==='function')openMenu();}catch(e){}});}});

/* ---------- доска у подъезда во дворе ---------- */
/* ---------- доска у подъезда во дворе (предмет — в старте; здесь его функции) ---------- */
P.go=function(){ev('open',{s:'yard',d:Math.min(Z3.day(),99)});ZB.go('z3paper',{});};
P.badge=function(){if(!Z3.open('paper'))return '';var z=Z();return z.o&1?(P.left()?String(P.left()):''):'!';};
P.note=function(){var z=Z(),h=0;try{h=new Date(typeof nowMs==='function'?nowMs():Date.now()).getHours();}catch(e){}
    if(!(z.o&1))return 'свежий номер';if(h>=19&&!(z.o&2))return 'вечерний выпуск';var l=P.left();if(l)return 'номер не дочитан';var e=P.evNow&&P.evNow();return e&&!e.done?e.ic+' '+e.sh:'номер прочитан ✓';};
P.hot=function(){var z=Z();return Z3.open('paper')&&!(z.o&1);};

/* ---------- рубрики в реестре (CORE смешивает их в уровни) ---------- */
var RUBS=[['sv','Связи','🧩'],['sh','Шифровка','🔢'],['rp','Красная ручка','🖍'],['fw','Филворд','🔤'],['vy','Вышивка','🧵'],
  ['bb','Барабан','🎡'],['sk','Сканворд деда Семёна','📰'],['zg','Зина загадала','🟩']];
if(RON)RUBS.forEach(function(x,i){Z3.rubAdd({id:x[0],order:i+1,t:x[1],ic:x[2],
  lazy:function(){return P.x().then(function(){return P.lazy(x[0]);});},
  play:function(el,o){var once=0,o2={};for(var k in o||{})o2[k]=o[k];
    o2.done=function(res){if(once++)return;try{if(o&&o.done)o.done(res||{ok:false,m:0,s:0});}catch(e){console.error(e);}};
    P.x().then(function(){P.play(x[0],el,o2);},function(){el.innerHTML='<p style="padding:16px">Не загрузилось — попробуй ещё раз.</p>';o2.done({ok:false,m:0,s:0,err:1});});}});});

/* ---------- «Загадать это слово» — одна маленькая кнопка в окне победы (не чаще: 1-я победа дня и потом каждая 4-я, пока не загадано сегодня) ---------- */
function ridDue(c){if(!ON||!Z3.open('paper')||!c||c.daily||c.again)return false;var z=Z();if(z.q>=1)return false;
  var lv=+S.lv||0;return lv>=10&&lv%4===1;}
function ridWord(){try{if(typeof G==='undefined'||!G||!G.words)return '';var L=G.words.map(function(w){return w.w;}).filter(function(w){return /^[а-я]{4,10}$/.test(w);});
  L.sort(function(a,b){return b.length-a.length;});var d=window.GLOSS||(typeof GLOSS!=='undefined'?GLOSS:null);
  for(var i=0;i<L.length;i++)if(!d||d[L[i]])return L[i];return L[0]||'';}catch(e){return '';}}
ZB.add(ZB.winSlots,{id:'z3p-rid',order:90,zone:'extra',fit:1,
  render:function(c){if(!ridDue(c))return '';var w=ridWord();if(!w)return '';c.z3pw=w;
    return '<div class="z3p-wr" style="text-align:center;margin-top:4px"><button type="button" class="btn ghost small z3p-wrb">✍ Загадать «'+w.toUpperCase()+'» соседям</button></div>';},
  mount:function(el,c){var b=el&&el.querySelector('.z3p-wrb');if(!b||!c.z3pw)return;ev('rid',{s:'show'});
    b.onclick=function(ev2){if(ev2&&ev2.stopPropagation)ev2.stopPropagation();try{SND.tap();}catch(e){}var w=c.z3pw;
      P.x().then(function(){P.mk(w,function(sent){if(sent){b.disabled=true;b.textContent='✓ Загадка в номере';}});},function(){});};}});
/* живые события двора — тоже поздно, после газеты */
ZB.load('js/zb3-paper-ev.js').then(function(){ZB.emit('z3late');},function(){});
})();
