'use strict';
/* ================= gb-newbie — первые 10 минут новичка (буст «Гастроном №1: Образцовый», поток NEWBIE, 10.10.2026) =================
   Журнал — hobby-analytics/release-i/gastronom-boost/logs/NEWBIE.md. Образец — Зина js/zb-newbie.js (дирижёр ZBNB.turn).
   Цель: медиана первого захода 2,5 → 6–8 мин, D1 5–10 % → 15 %+. Уходят «между уровнями» на 1, 4, 6, 10-м (08-behavior §2).
   Выключить всё — window.GB_OFF={newbie:1} (или ?gboff=newbie на маке); по частям — GBNB.f.<часть>=false. Файл не загрузился —
   игра как раньше. Старый игрок (на момент первого запуска модуля пройдено 10+ уровней) — S.nb0=2: ничего из этого не видит; прошедший 1–9
   уровней — новичок без обучения 1-го уровня (бустеры не прячем: он их уже видел).

   1) Ур.1 (новичок): тётя Валя крупно представляется одной фразой в подсказке (лицо Вали слева, крупный шрифт) — вместо прежней
      подсказки; её обычная «стартовая» реплика на 1-м уровне молчит. Палец тащит полупрозрачную банку (не просто двигается);
      5 с без хода — подсказка вздрагивает. Бустеры (нижняя полоса) спрятаны на 1–2-м уровне новичка (visibility — раскладка не прыгает).
   2) Новинка каждые 2–3 уровня (только первая победа уровня, только новичок):
      ур.3 — подарок «это вам, на счастье — фикус» (decor бесплатно; фикус уже куплен — следующая дешёвая вещь, всё есть — 60 💰),
      ур.4 — новый покупатель с шуткой (мама с малышом «без очереди», +5 💰 — правило старого ветерана G.vetId, облик — OBST/ART) и новый товар (Валя называет товар, которого
      не было на прошлых уровнях), ур.5 — Перерыв «Весы» (MG0) и первая благодарность (META) — место держит дирижёр,
      ур.6 — одно окно: межэкранной на победах-новинках 3–6 нет (долг не сгорает — покажется на следующей «Дальше»),
      вопрос про напоминания (SOC ntf) — только на победе без новинки.
   3) Ур.8–9: «Ревизор едет! Ещё N уровня» (реплика на старте + строка в «Кассе»), ур.10 — Ревизия, после неё — грамота города
      строкой в «Кассе» и «Дальше» ведёт СРАЗУ в 11-й уровень (без VIEW — обёртка openMap; с GB.viewOn переход делает VIEW).
   4) «Завтра: …» — гнездо winSlots (id 'nbtmr', zone 'tmr'; в новом виде заменяет строку VIEW): с 5-го уровня на каждой победе и в задании дня —
      ОДНА конкретная фраза по главному пункту: стеклотара (GBDEP) > дефицит завтра (GBPL.deficit.name(день)) > затея завтра (GMG) > серия дней >
      печать (GBPL) > задание дня > TEXT tmr.any. Тексты — GBT tmr.* (TEXT), запасные — GBNB.TX. Другие потоки могут добавить пункт:
      GBNB.tmrItems.push({id, order, say()→'Завтра: …'|'', ask()→'вопрос про напоминание'|''}) (order меньше — главнее; стеклотара 10).
      Просьба «Напомнить» (SOC ntf, 1-й показ) — вопрос по тому же главному пункту («Бутылки сдадут — за ночь наберётся 36 💰. Напомнить?»).
   ДИРИЖЁР (договор для VIEW, META, MG0, ECO, TECH): перед тем как показать НОВОЕ окно/приглашение/предложение после победы,
      спроси GBNB.turn('<id>') → true — показывай, false — отложи до следующей победы. Не новичок / повтор / задание дня — всегда true.
      Места (впервые пройденный уровень N): 3 'gift' · 4 'new' · 5 'mg','thanks' · 6 'daily','plan' · 10 'city'. На этих победах чужой id —
      false. На остальных до 12-го — кто первый спросил, того и победа. Строки, а не окна ('tmr', 'seal', 'goal', 'rev') — не спрашивают.
      GBNB.next(id) → номер уровня, где id точно получит место (для текста «Перерыв — после 5-го уровня»), или 0. GBNB.isNew() — новичок ли.
   STAT: tut {s}: 7 подарок (ур.3), 8 новинка ур.4, 9 победа ур.5, 10 победа ур.6, 11 «Ревизор едет» (ур.8), 12 Ревизия пройдена,
      13 начат ур.11; nb {a: l1 (s сек до первого хода, r повторов) | help (l уровень, m ходов, n который раз; v14.1) | gift (i) | new (g товар, v мама с малышом) | rev (l) | city | tmr (n) | gate (id, l) | ntf}.
   Сохранение (GB.onSave 'nb'): S.nb0 (1 новичок / 2 старый), S.nbT (день последнего показа «Завтра» — для статистики);
      разовые отметки — S.tips.nb_* (сливаются максимумом).
*/
(function(){
if(typeof GB==='undefined')return;
var NB=window.GBNB={on:GB.flag('newbie'),
  f:{l1:true,help:true,bst:true,gift:true,nw:true,rev:true,one:true,city:true,tmr:true,ntf:true},
  RES:{3:['gift'],4:['new'],5:['mg','thanks'],6:['daily','plan'],10:['city']},UPTO:12,BST:3,TMR:5,
  tmrItems:[],TX:null};
// тексты — отдельными данными (TEXT вычитывает, EN переводит; GBT.say('nb.<ключ>') главнее, если есть)
NB.TX={
  help:'Вот этот — сюда! Тащите туда, где светится.',
  l1:'Сгущёнку выбросили! Тащите банку к двум таким же — покупатель уже тут.', // v14.1: зацепка вместо правила (было «Я тётя Валя! Тащите сгущёнку к двум таким же — три одинаковых, и покупатель доволен!»)
  gift_t:'Подарок от тёти Вали',gift:'Это вам, на счастье — {n}!',gift_c:'В зал — подарок: {c} 💰',
  gift_say:'Фикус в зале — теперь как дома!',
  new_good:'Новинка на витрине — {n}!',new_mom:'Мама с малышом — без очереди! Обслужите её первой — +5 💰.',
  rev_s2:'Ревизор едет! Ещё 2 уровня — чтоб всё блестело!',rev_s1:'Ревизор на подходе! Ещё один уровень.',
  rev_w2:'🔥 Ревизор едет! Ещё 1 уровень — и Ревизия',rev_w1:'🔥 Следующий — Ревизия! Ревизор уже у дверей',
  rev_go:'Ревизия! Покупатели строгие — не торопитесь.',
  city:'📜 {c} — образцово! Ревизор доволен, грамота города — ваша',city_say:'{n}! Новый город — новые покупатели.',
  tmr:'Завтра:',tmr_daily:'Завтра: задание дня — +{c} 💰 и подарок за серию дней.',tmr_streak:'Завтра: серия дней — день {d}, +{c} 💰 сверху.',
  tmr_glass:'Завтра: стеклотары наберётся на {n} 💰.',tmr_def:'Завтра дефицит — {name}! Не проспите.',tmr_mg:'Завтра игра дня — «{name}».',
  tmr_seal:'Завтра новый план — новая печать.',
  ntf_glass:'Бутылки сдадут — за ночь наберётся {n} 💰. Напомнить вам заглянуть?',ntf_def:'Завтра выбросят {name}! Напомнить вам с утра?',
  ntf_mg:'Завтра в Подсобке — «{name}». Напомнить вам?',ntf_streak:'Завтра серия дней продолжится — монеты сверху. Напомнить вам?',
  ntf_daily:'Завтра новое задание дня — +{c} 💰. Напомнить вам заглянуть?'};
function tx(k,o){var s=null;try{if(window.GBT&&GBT.say)s=GBT.say('nb.'+k,o);}catch(e){}
  if(!s)s=NB.TX[k]||'';if(typeof LANG!=='undefined'&&LANG==='en'&&s===NB.TX[k])return ''; // по-английски — только переведённое (EN)
  if(o)for(var x in o)s=s.split('{'+x+'}').join(o[x]);return s;}
function on(k){return NB.on&&NB.f[k]!==false;}
function $(id){return document.getElementById(id);}
function ev(o){try{if(window.STAT&&STAT.ev)STAT.ev('nb',o);}catch(e){}}
function tut(s){try{if(window.STAT&&STAT.ev)STAT.ev('tut',{s:s});}catch(e){}}
function tips(){if(typeof S==='undefined')return {};if(!S.tips||typeof S.tips!=='object')S.tips={};return S.tips;}
function once(k){var t=tips();if(t['nb_'+k])return false;t['nb_'+k]=1;return true;}
function had(k){return !!tips()['nb_'+k];}
function sv(){try{save();}catch(e){}}
function dayN(){try{return +todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
NB.isNew=function(){return NB.on&&typeof S!=='undefined'&&S.nb0===1;};
var isNew=NB.isNew;
// уровень впервые (не задание дня, ещё без звёзд)
function firstStart(){return typeof G!=='undefined'&&G&&!G.daily&&!G.mode&&!(S.stars&&S.stars[G.idx]>0);}

/* ---------- сохранение ---------- */
GB.onSave({id:'nb',keys:['nb0','nbT'],
  fix:function(s){if(s.nb0!==1&&s.nb0!==2)s.nb0=(s.levelsDone||0)>=10?2:1; // до первой Ревизии — ещё новичок: новинки 3–9-го уровня ему на пользу (обучение 1-го уровня он уже прошёл)
    // облако принесло прогресс дальше «новичковых» уровней — значит, старый игрок на новом устройстве
    if(s.nb0===1&&(s.levelsDone||0)>NB.UPTO+3&&!s.tips.nb_l1)s.nb0=2;
    if(typeof s.nbT!=='number')s.nbT=0;},
  merge:function(s,d){['nb0','nbT'].forEach(function(k){if(typeof d[k]==='number'&&!(s[k]>=d[k]))s[k]=d[k];});}});

/* ---------- стили ---------- */
(function(){var st=document.createElement('style');st.textContent=
  'body.nbnob #scr-game .gf{visibility:hidden}body.nbnob #scr-game .gf #bHint{visibility:visible}'+ /* v14.1: «Подсказка» новичку видна */
  '#tip.nbv{font-size:19px;line-height:1.28;text-align:left;padding:10px 14px 10px 80px;min-height:66px;display:flex;align-items:center}'+
  '#tip.nbv::before{content:"";position:absolute;left:10px;top:50%;margin-top:-30px;width:60px;height:60px;border-radius:50%;background:#f6dcb0 var(--nbva) center/cover no-repeat;box-shadow:0 0 0 3px #fff,0 2px 6px rgba(0,0,0,.2)}'+
  '#tip.nbp{animation:nbtp .7s ease-in-out 2}@keyframes nbtp{50%{transform:scale(1.04);box-shadow:0 0 0 6px rgba(255,176,59,.55),0 4px 14px rgba(0,0,0,.2)}}'+
  '.nbgift{display:flex;align-items:center;gap:10px;background:#fff6e0;border:2px dashed #e0a43a;border-radius:14px;padding:6px 10px;margin:6px auto;max-width:380px;text-align:left}'+
  '.nbgift canvas{width:84px;height:56px;flex:0 0 84px;border-radius:8px}.nbgift b{display:block;color:#b3261e;font-size:15px}.nbgift span{font-size:15px;line-height:1.25}'+
  'p.nbl{margin:6px auto 2px;max-width:380px;border-radius:12px;padding:6px 10px;font-size:15px;line-height:1.3;font-weight:700}'+
  'p.nbl.rev{background:rgba(179,38,30,.1);color:#8e1b14}p.nbl.city{background:rgba(224,164,58,.18);color:#5a3a06}'+
  'p.nbl.tmr{background:rgba(46,125,50,.1);color:#2b4a1c;font-weight:600}p.nbl.tmr>b{color:#2e7d32}'+
  '@media (max-height:600px){p.nbl{font-size:13.5px;padding:4px 8px;margin:3px auto}.nbgift{padding:4px 8px;margin:3px auto}.nbgift canvas{width:64px;height:44px;flex-basis:64px}}'+
  '@media (prefers-reduced-motion:reduce){#tip.nbp{animation:none}}';
  document.head.appendChild(st);})();

/* ---------- дирижёр: одна новинка за победу ---------- */
var W={l:0,first:false,tok:null,res:null,busy:false}; // текущая победа
NB.turn=function(id,ctx){if(!NB.on||!on('one')||!isNew())return true;
  if(!W.first||W.l>NB.UPTO)return true;
  var r=NB.RES[W.l];if(r){var ok=r.indexOf(id)>=0;if(ok)W.busy=true;else ev({a:'gate',id:String(id).slice(0,20),l:W.l});return ok;}
  if(W.tok&&W.tok!==id){ev({a:'gate',id:String(id).slice(0,20),l:W.l});return false;}W.tok=id;W.busy=true;return true;};
NB.next=function(id){for(var l in NB.RES)if(NB.RES[l].indexOf(id)>=0)return +l;return 0;};
NB.busy=function(){return !!(isNew()&&W.first&&(W.busy||NB.RES[W.l]));};

/* ---------- исход уровня ---------- */
GB.levelHook.push(function(i){
  if(i.r!=='win'){return;}
  W={l:i.l,first:!!i.first&&!i.daily&&!i.mode,tok:null,busy:false};
  if(!isNew()||!W.first)return;
  if(i.l===5)tut(9);if(i.l===6)tut(10);if(i.l===10)tut(12);
  if(i.l===3&&on('gift'))gift();
});
GB.startHook.push(function(i){
  W={l:0,first:false,tok:null,busy:false};
  if(i.l===11&&isNew()&&once('l11'))tut(13);
});

/* ---------- 1) уровень 1: Валя представляется, палец тащит банку, бустеры спрятаны ---------- */
var avaURL='';
function ava(){if(avaURL)return avaURL;try{var d=2,w=60,c=document.createElement('canvas');c.width=w*d;c.height=w*d;var g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);
  g.fillStyle='#f6dcb0';g.fillRect(0,0,w,w);drawPerson(g,'valya',w/2,w*1.62,w*1.55,1,0,0);avaURL=c.toDataURL('image/png');}catch(e){avaURL='';}return avaURL;}
function l1Card(){var e=$('tip');if(!e)return;var t=tx('l1');if(!t)return;
  var u=ava();if(u)e.style.setProperty('--nbva','url('+u+')');e.classList.add('nbv');
  // подсказка уровня 1 — пара [ru,en]: по-русски наша фраза, английская остаётся прежней
  if(G.tipCur&&G.tipCur[0]&&G.tipCur[0].indexOf('сгущёнку')>=0){G.tipCur=[t,G.tipCur[1]];tip(L(G.tipCur[0],G.tipCur[1]));}
  G.nbL1={t0:Date.now(),r:0,last:Date.now()};once('l1');
  if(G.speech&&G.speech.who==='valya')G.speech=null;}
function l1Off(){var e=$('tip');if(e){e.classList.remove('nbv','nbp');}}
function l1Apply(){if(!on('l1')||!isNew()||typeof G==='undefined'||!G||!G.tutor||G.daily||G.idx!==0)return;if(G.nbL1)return;l1Card();}
// v14.1: на ВСЁМ 1-м уровне новичка Валя молчит пузырём (он закрывал верхние полки на 360×640) — говорит подсказка с её лицом.
// («Вот это — сюда!» из подсказки на 1-м уровне тоже молчит: помощь новичку пишет строкой — helpTick)
if(typeof say==='function'){var say0=say;window.say=function(t,who){if(who==='valya'&&G&&isNew()&&!G.daily&&!G.mode&&G.idx===0&&(G.nbL1||G.tutor))return;return say0.apply(this,arguments);};}
// палец тащит полупрозрачную товар (c) из (x0,y0) в (x1,y1); k — 0..1 фаза
function finger(x0,y0,x1,y1,c,k){var e=ease(k),x=x0+(x1-x0)*e,y=y0+(y1-y0)*e-Math.sin(e*Math.PI)*U*.25,a=Math.min(1,k*5,(1-k)*5);
  if(c&&k>.05){ctx.globalAlpha=a*.75;drawCell(c,x,y-U*.08,1.1,false);}
  ctx.globalAlpha=a*.85;ctx.fillStyle='rgba(255,255,255,.75)';ctx.strokeStyle='#e07a1f';ctx.lineWidth=Math.max(2,U*.06);ctx.beginPath();ctx.arc(x,y-U*.42,U*.22,0,6.2832);ctx.fill();ctx.stroke();
  ctx.globalAlpha=a;ctx.fillStyle='#000';ctx.font=Math.round(U*.85)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('👆',x+U*.18,y-U*.42);ctx.globalAlpha=1;}
// палец тащит полупрозрачную банку и крупнее
if(typeof drawTutor==='function'){var dt0=drawTutor;window.drawTutor=function(){
  if(!on('l1')||!G||!G.nbL1||!G.units||!G.units[1]||!G.st||!G.st.F||!G.st.F[1])return dt0.apply(this,arguments);
  try{var k=(G.t%1.9)/1.6;if(k>1)return;finger(slotX(1,1),G.units[1].pt,slotX(0,2),G.units[0].pt,G.st.F[1][1],k);}
  catch(err){ctx.globalAlpha=1;return dt0.apply(this,arguments);}};}
// бустеры — с 3-го уровня (новичок, первый проход 1–2-го)
function bst(){var b=document.body;if(!b)return;var hide=on('bst')&&isNew()&&typeof G!=='undefined'&&G&&!G.daily&&!G.mode&&G.idx<NB.BST-1&&(S.levelsDone||0)<NB.BST-1&&(had('l1')||G.nbL1);
  b.classList.toggle('nbnob',!!hide);}
// повтор: 5 с без хода — подсказка вздрагивает (до 6 раз)
setInterval(function(){if(typeof G==='undefined'||!G||!G.nbL1)return;
  if(!G.tutor){if(!G.nbL1.done){G.nbL1.done=1;l1Off();ev({a:'l1',s:Math.round((Date.now()-G.nbL1.t0)/1000),r:G.nbL1.r});}return;}
  if(typeof modalOn!=='undefined'&&modalOn||document.hidden||typeof paused!=='undefined'&&paused)return;
  if(Date.now()-G.nbL1.last>=5000&&G.nbL1.r<6){G.nbL1.last=Date.now();G.nbL1.r++;var e=$('tip');if(e){e.classList.remove('nbp');void e.offsetWidth;e.classList.add('nbp');}}},1000);

/* ---------- v14.1: помощь новичку на ур.1–2 — 4 с без хода (после 1-го хода; на ур.2 до 1-го хода — 8 с) → бесплатная подсказка
   (doHint: рамки и дуга) + палец тащит товар по ней + строка Вали «Вот этот — сюда!». Раньше неверный 1-й ход снимал обучение,
   а кнопки новичку спрятаны — на экране не оставалось ни одной подсказки (разбор 13.10, gastronom-fix1310/FIX.md). Не чаще раза в 8 с, до 8 раз за уровень. ---------- */
var HL={g:null,mv:-1,t:0,at:0,n:0,tx:''};
function helpOff(){var e=$('tip');if(HL.tx&&e&&e.textContent===HL.tx){tip('');e.classList.remove('nbv');}HL.tx='';if(typeof G!=='undefined'&&G)G.nbHelp=0;}
function helpTick(){if(typeof G==='undefined'||!G)return;var now=Date.now();
  if(HL.g!==G){HL.g=G;HL.n=0;HL.mv=G.moves;HL.t=now;HL.tx='';return;}
  if(HL.mv!==G.moves){HL.mv=G.moves;HL.t=now;if(G.nbHelp)helpOff();return;}
  if(!on('help')||!isNew()||G.daily||G.mode||G.idx>1||G.over||G.won||G.tutor||G.drag||G.sel)return;
  if(typeof modalOn!=='undefined'&&modalOn||document.hidden||typeof paused!=='undefined'&&paused){HL.t=now;return;}
  var wait=G.idx===1&&G.moves===0?8000:4000;
  if(now-HL.t<wait||now-HL.at<8000||HL.n>=8||G.hint&&G.hint.t<5)return;
  HL.at=now;HL.n++;try{doHint();}catch(e){return;}
  if(!G.hint)return;G.nbHelp=1;
  var t=typeof LANG!=='undefined'&&LANG==='en'?'This one goes here! Drag it to the glowing spot.':tx('help'),e=$('tip');if(t&&e){tip(t);HL.tx=e.textContent;var u=ava();if(u){e.style.setProperty('--nbva','url('+u+')');e.classList.add('nbv');}}
  ev({a:'help',l:G.idx+1,m:G.moves,n:HL.n});}
setInterval(helpTick,1000);
if(typeof render==='function'){var rn0=render;window.render=function(){rn0.apply(this,arguments);
  try{var h=G&&G.nbHelp&&G.hint;if(h&&h.t<5&&G.units&&G.units[h.a]&&G.units[h.b]){var k=(h.t%1.8)/1.4;if(k<=1)finger(slotX(h.a,h.sa),G.units[h.a].pt,slotX(h.b,h.sb),G.units[h.b].pt,G.st.F[h.a][h.sa],k);}}catch(e){ctx.globalAlpha=1;}};}

/* ---------- 2) новинки: подарок на 3-м, мама с малышом и новый товар на 4-м ---------- */
function gift(){if(!NB.turn('gift'))return;if(!once('gift'))return;
  var pick=null;if(!hasDecor('ficus'))pick='ficus';else{var cheap=DECOR.filter(function(d){return !hasDecor(d.id)&&d.p<=100;}).sort(function(a,b){return a.p-b.p;})[0];if(cheap)pick=cheap.id;}
  if(pick){S.decor[pick]=1;W.gift={id:pick};}else{var c=60;S.coins+=ern('gift',c);W.gift={c:c};try{updCoins();}catch(e){}}
  sv();tut(7);ev({a:'gift',i:pick||'coins'});}
GB.add(GB.winSlots,{id:'nbgift',order:5,zone:'extra',fit:9,on:function(){return !!(W.gift&&W.l===3);},
  render:function(){var g=W.gift,d=g.id?DECOR.concat(typeof QDECOR!=='undefined'?QDECOR:[]).filter(function(x){return x.id===g.id;})[0]:null;
    var t=g.id?tx('gift',{n:d?d.n.charAt(0).toLowerCase()+d.n.slice(1):g.id}):tx('gift_c',{c:g.c});if(!t)return '';
    return '<div class="nbgift">'+(g.id?'<canvas id="nbGiftCv"></canvas>':'<b style="font-size:34px">🎁</b>')+'<span><b>🎁 '+tx('gift_t')+'</b>'+t+'</span></div>';},
  mount:function(el){var c=el.querySelector('#nbGiftCv');if(c&&W.gift&&W.gift.id)requestAnimationFrame(function(){try{decorPreview(c,W.gift.id);}catch(e){}});}});

// ур.4 (новичок, впервые): мама с малышом без очереди — 2-й покупатель (правило G.vetId; облик — OBST/ART: только кто стоит первым; раскладку не меняет)
if(typeof syncQueue==='function'){var sq0=syncQueue;window.syncQueue=function(first){
  if(first&&G&&G.nbVet===undefined){G.nbVet=0;if(on('nw')&&isNew()&&!G.daily&&!G.mode&&!G.boss&&G.idx===3&&firstStart()&&G.vetId<0&&G.lv&&G.lv.K>=2&&!had('new')){G.vetId=1;G.nbVet=1;}}
  return sq0.apply(this,arguments);};}
// товар, которого не было на прошлых уровнях (по раскладкам 1…N-1 — сохранять ничего не надо)
function goodsOf(lv){var t={};lv.sh.forEach(function(L){L.forEach(function(r){r.forEach(function(c){var x=c&255;if(c&&x>0&&x<200)t[x]=1;});});});return t;}
function newGood(idx){try{var seen={};for(var j=0;j<idx;j++){var s=goodsOf(levelFor(j));for(var k in s)seen[k]=1;}var cur=goodsOf(G.lv);
  for(var x in cur)if(!seen[x]&&GOODS[x])return +x;}catch(e){}return 0;}
GB.startHook.push(function(i){if(!isNew()||i.daily||i.mode)return;
  bst();
  var g=G;if(!g||!firstStart())return;
  if(i.l===4&&on('nw')&&!had('new')){var ng=newGood(g.idx),vet=g.nbVet===1;
    if(ng||vet){once('new');if(ng)once('newg');sv();tut(8);ev({a:'new',g:ng,v:vet?1:0});
      later(function(){var n=ng?GOODS[ng].n:'';var t=ng?tx('new_good',{n:n.charAt(0).toLowerCase()+n.slice(1)}):'';if(t)say0(t,'valya');},650);
      if(vet)later(function(){var t=tx('new_mom');if(t&&typeof toast==='function')toast(t);},ng?3200:1200);}}
  /* gb-MERGE: на уровнях v2 у ур.4 может не быть нового товара — тогда «Новинка» на 5-м или 6-м (первый уровень с новым товаром) */
  if((i.l===5||i.l===6)&&on('nw')&&had('new')&&!had('newg')){var ng2=newGood(g.idx);
    if(ng2){once('newg');sv();ev({a:'new',g:ng2,v:0});later(function(){var n=GOODS[ng2].n;var t=tx('new_good',{n:n.charAt(0).toLowerCase()+n.slice(1)});if(t)say0(t,'valya');},650);}}
  // подарок с 3-го: Валя радуется на следующем уровне
  if(i.l===4&&W0gift&&hasDecor('ficus')){W0gift=false;later(function(){var t=PH.valya.decor&&PH.valya.decor.ficus;if(t&&g===G&&!g.speech)say0(t,'valya');},4200);}
  if(on('rev')&&(i.l===8||i.l===9)&&once('rs'+i.l)){if(i.l===8)tut(11);ev({a:'rev',l:i.l});
    later(function(){var t=tx(i.l===8?'rev_s2':'rev_s1');if(t)say0(t,'valya');},650);}
  if(on('rev')&&i.l===10&&once('rs10'))later(function(){var t=tx('rev_go');if(t)say0(t,'valya');},2600);
});
var W0gift=false;GB.on('win',function(){if(W.gift&&W.gift.id==='ficus')W0gift=true;});

/* ---------- 3) Ревизор едет, грамота, сразу 11-й ---------- */
GB.add(GB.winSlots,{id:'nbrev',order:6,zone:'goal',fit:5,on:function(){return on('rev')&&isNew()&&W.first&&(W.l===8||W.l===9);}, // в новом виде заменяет строку города VIEW на 8–9-м новичка (META занимает zone goal — город VIEW и так не рисуется)
  render:function(){var t=tx(W.l===8?'rev_w2':'rev_w1');return t?'<p class="nbl rev">'+t+'</p>':'';}});
// грамоту города рисует META/VIEW, если завели своё гнездо (id с «gram»/«city») — тогда наша строка молчит; старое окно с монетами за грамоту — тоже
function gramOther(){return GB.winSlots.some(function(x){return x.id!=='nbcity'&&/gram|city/i.test(x.id);})||!!(S.chest&&S.chest[0]);}
GB.add(GB.winSlots,{id:'nbcity',order:4,zone:'seal',fit:8,on:function(){return on('city')&&isNew()&&W.first&&W.l===10&&!GB.viewOn&&!gramOther();}, // в новом виде — неоновое окно Ревизии VIEW
  render:function(){var c=cityOf(9)[0],n=cityOf(10)[0],t=tx('city',{c:c,n:n});return t?'<p class="nbl city">'+t+'</p>':'';}});
// без нового вида (VIEW) «Дальше» после Ревизии ведёт на карту — новичка ведём сразу в первый уровень нового города
if(typeof openMap==='function'){var om0=openMap;window.openMap=function(o){
  if(o&&o.city===1&&on('city')&&isNew()&&!GB.viewOn&&!had('city')&&S.unlocked>=11){once('city');sv();ev({a:'city'});
    var c=cityOf(10)[0];startLevel(10);later(function(){var t=tx('city_say',{n:c});if(t)say0(t,'valya');},650);return;}
  return om0.apply(this,arguments);};}

/* ---------- одно окно: межэкранной и вопроса про напоминания нет на победах-новинках ---------- */
if(typeof adDue==='function'){var ad0=adDue;window.adDue=function(){if(on('one')&&NB.busy())return false;return ad0.apply(this,arguments);};}
if(typeof socEarly==='function'){var se0=socEarly;window.socEarly=function(full){if(on('one')&&!NB.turn('ntf'))return;return se0.apply(this,arguments);};}

/* ---------- 4) «Завтра: …» — одна конкретная фраза (с 5-го уровня, каждая победа; задание дня — тоже) ---------- */
// пункт: {id, order, say()→'Завтра: …' (полная фраза) | '', ask()→'вопрос про напоминание с выгодой' | ''} — меньше order = главнее
function gbt(k,o){try{if(window.GBT&&GBT.say){var r=GBT.say(k,o)||'';if(typeof LANG!=='undefined'&&LANG==='en'&&/[А-яЁё]/.test(r))return '';return r;}}catch(e){}return '';} /* gb-MERGE: в en — только переведённое */
function tomorrowWday(){try{return (new Date(nowMs()+864e5)).getDay();}catch(e){return (new Date().getDay()+1)%7;}}
var OWN=[
  // стеклотара (META, отдел «Приём стеклотары» открыт): за ночь наберётся до потолка
  {id:'glass',order:10,say:function(){var D=window.GBDEP,g=D&&D.glass?D.glass():null;if(!g||!g.r)return '';NB._gn=Math.round(g.r*g.cap);
     return gbt('tmr.glass',{n:NB._gn})||tx('tmr_glass',{n:NB._gn});},
   ask:function(){return NB._gn?tx('ntf_glass',{n:NB._gn}):'';}},
  // дефицит дня завтра (LVL/MODE через META: GBPL.deficit.name(день))
  {id:'deficit',order:20,say:function(){var P=window.GBPL&&GBPL.deficit;if(!P||!P.name)return '';var d=dayN(),t=0;try{var x=new Date(nowMs()+864e5);t=x.getFullYear()*10000+(x.getMonth()+1)*100+x.getDate();}catch(e){}
     var n=P.name.length?P.name(t||d+1):'';if(!n)return '';NB._dn=n;return gbt('tmr.deficit',{name:n})||tx('tmr_def',{name:n});},
   ask:function(){return NB._dn?tx('ntf_def',{name:NB._dn}):'';}},
  // затея дня завтра (MG0: по дню недели, только открытая игра)
  {id:'mg',order:30,say:function(){var M=window.GMG;if(!M||!M.WEEK||!M.avail||!M.info)return '';var id=M.WEEK[tomorrowWday()];if(!id||!M.avail(id))return '';
     var i=M.info(id);if(!i||!i.t)return '';NB._mn=i.t;return gbt('tmr.mg',{name:i.t})||tx('tmr_mg',{name:i.t});},
   ask:function(){return NB._mn?tx('ntf_mg',{name:NB._mn}):'';}},
  // серия дней (задание дня сегодня сделано)
  {id:'streak',order:40,say:function(){var sk=typeof streakNow==='function'?streakNow():0;if(!(sk>0&&S.daily&&S.daily[todayKey()]))return '';var d=sk%7+1;
     return tx('tmr_streak',{d:d,c:STREAK[d-1]});},ask:function(){return tx('ntf_streak');}},
  // печать «План выполнен» (META): сегодня уже есть — завтра новая
  {id:'seal',order:50,say:function(){var P=window.GBPL;if(!P||!P.seal||!P.seal())return '';return gbt('tmr.seal')||tx('tmr_seal');},ask:function(){return '';}},
  // задание дня (откроется после 6-го уровня — новичку на 5-м обещаем его)
  {id:'daily',order:60,say:function(){if((S.unlocked||1)<NB.TMR)return '';return tx('tmr_daily',{c:typeof DAILY_REWARD!=='undefined'?DAILY_REWARD:30});},ask:function(){return tx('ntf_daily',{c:typeof DAILY_REWARD!=='undefined'?DAILY_REWARD:30});}},
  {id:'any',order:90,say:function(){return gbt('tmr.any');},ask:function(){return '';}}];
function tmrPick(){var L=NB.tmrItems.concat(OWN).sort(function(x,y){return (x.order||0)-(y.order||0);});
  for(var i=0;i<L.length;i++){var it=L[i],t=GB.safe('tmr:'+it.id,function(){return it.say?it.say():(it.t?it.t():'');});if(t)return {id:it.id,t:t,it:it};}return null;}
NB.tmrPick=tmrPick;
var TM={k:'',v:null}; // одна фраза на окно (окно может перерисовываться примеркой)
function tmrNow(){var k=W.l+':'+(typeof G!=='undefined'&&G?G.idx:'')+':'+dayN();if(TM.k!==k){TM.k=k;TM.v=tmrPick();}return TM.v;}
function tmrOn(ctx){if(!on('tmr'))return false;var l=ctx&&ctx.l||W.l;return !!(ctx&&ctx.daily)||l>=NB.TMR;}
GB.on('start',function(){TM.k='';});
GB.add(GB.winSlots,{id:'nbtmr',order:5,zone:'tmr',fit:3,on:function(){var g=typeof G!=='undefined'?G:null;if(g&&!g.daily&&TM.lastL!=null&&g.idx!==TM.lastL&&Math.abs(g.idx-TM.lastL)<3)return false; /* POLISH (QA-RU): «Завтра…» — не чаще раза в 3 победы */
    var ok=tmrOn({l:g?g.idx+1:0,daily:g&&g.daily})&&!!tmrNow();if(ok&&g)TM.lastL=g.idx;return ok;},
  render:function(){var p=tmrNow();if(!p)return '';var t=p.t,h=/^Завтра/i.test(t)?t.replace(/^(Завтра:?)/i,'<b>$1</b>'):'<b>'+tx('tmr')+'</b> '+t;
    if(S.nbT!==dayN()){S.nbT=dayN();sv();ev({a:'tmr',i:p.id,l:W.l});}
    return GB.viewOn?'<div class="vw-tmr">📅 '+h+'</div>':'<p class="nbl tmr">📅 '+h+'</p>';}});
// «Напомнить» — с выгодой: вопрос по главному пункту «Завтра» (тексты SOC/ntf — TECH; здесь только слова первого вопроса)
if(typeof ntfText==='function'){var nt0=ntfText;window.ntfText=function(n){
  if(on('ntf')&&n<=1){var p=tmrPick(),q=p&&p.it.ask?GB.safe('tmr-ask',function(){return p.it.ask();}):'';if(q){ev({a:'ntf',i:p.id});return q;}}
  return nt0.apply(this,arguments);};}

/* ---------- готово: уровень 1 уже на экране (основной скрипт открыл его до модулей) ---------- */
function l1Fix(){if(typeof G==='undefined'||!G||!G.nbL1)l1Off();l1Apply();bst();}
GB.on('ready',l1Fix);GB.on('start',function(){setTimeout(l1Fix,0);});
GB.on('screen',function(){bst();});
})();
