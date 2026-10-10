'use strict';
/* ================= zb-newbie — первые 10 минут новичка (буст «Школа бабы Зины», поток NEWBIE, 10.10.2026) =================
   Журнал — hobby-analytics/release-i/zina-boost/logs/NEWBIE.md. Старое обучение — js/newbie.js (тот же хозяин).
   Цель: до 5-го уровня — 70 %+ новичков (было 54 %), «ни одного слова на 1-м» — <12 % (было 24–26 %).
   Выключить всё — ZBNB.on=false (строка ниже); по частям — ZBNB.f.<часть>=false. Файл не загрузился — игра как раньше.

   1) 1-й уровень (новичок, G.tut): БЕЗ окна-знакомства (ui.js onReady спрашивает ZBNB.noIntro), Зина одной строкой у круга,
      кнопки «←» и подсказки спрятаны до победы 1-го уровня (класс body.nb1). 5 с без касания — повтор: строка, палец заново,
      буквы слова пульсируют. Промах — на буквах номера 1-2-3. После первого слова — 6 с без слова → палец на следующее слово.
   2) Уровни 2–3 (впервые): 12 с без нового слова — палец на самое короткое (раз за уровень). Уровни 3–20 (впервые, S.lv<20):
      💡 мигает через 25 с, кот Ять ставит букву через 40 с и снова каждые 40 с, до 3 раз (js/newbie.js, ZBNB.fast()).
      «Передышка»: прошлый уровень (1–20) шёл дольше 150 с — в следующем одна буква открыта с начала (не подсказка, «Отличник» цел).
      Монет меньше цены буквы, нет буквы дня и запаса — буква даром раз в N минут, не больше M в день (ZBECO.poor {every,below,perDay};
      нет ZBECO — 6 мин, 3 в день), любой уровень.
   3) ДИРИЖЁР — правило «одна новинка за победу» (для потоков VIEW, SCHOOL, MG0, CAB, ECO):
        перед тем как показать НОВОЕ окно/приглашение/строку-новинку после победы, спроси ZBNB.turn('<id>', ctx) → true — показывай,
        false — отложи до следующей победы (спросишь снова). Не новичок / повтор / задание дня — всегда true.
        Места по уровням (впервые пройденный уровень N): 3 'gift' (гостинец) · 4 'home' (первый показ Дома/хаба) · 5 'mg' (первая Перемена,
        Диктант Валерки) · 6 'tmr' + 'ask' («Завтра у Зины» и «Напомнить завтра?») · 10 'daily' (задание дня). На этих победах чужой id —
        false. На остальных — кто первый спросил, того и победа (например, 'five' — первая «5» в дневник, 'cab', 'chap'). Новичок — до
        12-го уровня включительно (S.lv<=12 после победы). Свои id не из списка — любые короткие строки.
        ZBNB.next(id) → номер уровня, на котором id точно получит место (для текста «Перемена — после 5-го уровня»), или 0.
   4) «Завтра у Зины» — гнездо winSlots (id 'nbtmr', zone 'tmr'): на 6-м уровне впервые и потом на 6-й победе каждого дня; пункты —
      гостинец, буква от Ятя, задание дня/серия + ZBNB.tmrItems (другие потоки кладут {id, order, t()→html|''} — КОРОТКО, 2–4 слова:
      «🍲 буфет +30», «🎒 портфель +40»). Одной строкой p.tmr.nbtm (до 4 пунктов). Старую строку «Завтра: …» в том же окне прячет.
   5) Статистика: nb {a: f1 (первое слово: s сек, m промахов, t касаний, r повторов) | rep | hand | rest | zero | tmr | gate}; stk cat с n.
   Сохранение: S.nbZ — когда последний раз давали «букву даром при нуле» (облако — более поздняя), S.nbZd {d: день, n: сколько за день}.
*/
(function(){
var NB=window.ZBNB={on:true,
  f:{l1:true,hand:true,fast:true,rest:true,zero:true,gate:true,tmr:true,ios:true},
  RES:{3:['gift'],4:['home'],5:['mg'],6:['tmr','ask'],10:['daily']},UPTO:12,
  tmrItems:[],zeroMin:6,restS:150};
function on(k){return NB.on&&NB.f[k]!==false;}
NB.noIntro=function(){return on('l1');};
function $(id){return document.getElementById(id);}
function ev(o){try{if(window.STAT&&STAT.ev)STAT.ev('nb',o);}catch(e){}}
function inGame(){return typeof G!=='undefined'&&G&&!G.won&&$('game')&&$('game').classList.contains('on')&&!$('modal').classList.contains('on')&&!document.hidden&&!(typeof paused!=='undefined'&&paused);}
function firstTime(){return G&&!G.daily&&G.idx===S.lv;}
function foundN(){return G.words.filter(function(w){return w.found;}).length;}
function shortestOpen(){var a=G.words.filter(function(w){return !w.found;}).sort(function(a,b){return a.w.length-b.w.length;});return a[0]||null;}
// индексы букв круга для слова (как в startTutorial)
function letIdx(w){var r=[],used={};for(var k=0;k<w.length;k++){for(var j=0;j<G.letters.length;j++)if(G.letters[j]===w[k]&&!used[j]){used[j]=1;r.push(j);break;}}return r;}
function upw(w){return w.toUpperCase().split('').join(' → ');}

/* ---------- стили ---------- */
(function(){var s=document.createElement('style');s.textContent=
  'body.nb1 #gBack,body.nb1 .wheelwrap .side{visibility:hidden;pointer-events:none}'+
  '.let .nbn{position:absolute;right:-4px;top:-4px;min-width:22px;height:22px;border-radius:11px;background:#c2410c;color:#fff;font:800 14px/22px Rubik,system-ui,sans-serif;'+
  'text-align:center;box-shadow:0 2px 5px rgba(0,0,0,.25);pointer-events:none;text-transform:none}'+
  '.let.nbp{animation:nbpl .9s ease-in-out 3}@keyframes nbpl{50%{transform:scale(1.18);box-shadow:0 0 0 7px rgba(255,138,61,.45)}}'+
  'p.nbtm{margin:6px auto 2px;max-width:360px;background:rgba(255,138,61,.12);border-radius:12px;padding:6px 10px;font-size:14.5px;line-height:1.35}'+
  'p.nbtm>b:first-child{color:#c2410c}'+
  '@media (prefers-reduced-motion:reduce){.let.nbp{animation:none;box-shadow:0 0 0 5px rgba(255,138,61,.5)}}'+
  // iPhone (вырез/полоска «домой»): у #game отступ safe-area считался дважды — у .screen и ещё раз у шапки .ghdr и круга .wheelwrap
  // (−80 px высоты на iPhone X+ в полноэкранном VK). Оставляем отступ только у шапки и круга. На экранах без выреза env()=0 — ничего не меняется.
  (NB.f.ios!==false?'html:not(.nbios0) #game.screen{padding-top:0;padding-bottom:0}':'');
  document.head.appendChild(s);})();

/* ---------- сохранение ---------- */
if(window.ZB&&ZB.onSave)ZB.onSave({id:'nb',keys:['nbZ','nbZd'],fix:function(S){S.nbZ=+S.nbZ||0;if(!S.nbZd||typeof S.nbZd!=='object')S.nbZd={d:0,n:0};},
  merge:function(S,d){S.nbZ=Math.max(+S.nbZ||0,+d.nbZ||0);var a=S.nbZd||{d:0,n:0},b=d.nbZd||{d:0,n:0};
    S.nbZd=+b.d>+a.d?{d:+b.d,n:+b.n||0}:+b.d===+a.d?{d:+a.d,n:Math.max(+a.n||0,+b.n||0)}:a;}});

/* ---------- состояние попытки ---------- */
var st={g:null,t0:0,touch:0,tn:0,miss:0,rep:0,repT:0,fT:0,fN:0,hand:{},w1:false},lastWin=null;
function reset(){st={g:G,t0:Date.now(),touch:0,tn:0,miss:0,rep:0,repT:0,fT:Date.now(),fN:foundN(),hand:{},w1:false};}
function touched(){if(!G)return;st.touch=Date.now();st.tn++;if(st.handOn){st.handOn=0;if(!G.tut&&typeof stopTutorial==='function')stopTutorial();}}
document.addEventListener('pointerdown',function(e){var w=$('wheel');if(w&&e.target&&w.contains(e.target))touched();},true);
document.addEventListener('keydown',function(e){if(/^[а-яё]$/i.test(e.key||''))touched();},true);

/* ---------- 1-й уровень ---------- */
function l1Line(){var w=shortestOpen();if(!w)return;
  zina((st.rep?'':'Я баба Зина! ')+((typeof TOUCH!=='undefined'&&TOUCH)?'Веди пальцем по буквам: ':'Веди мышкой с нажатой кнопкой или печатай: ')+upw(w.w),'happy',99);}
function pulse(w,num){var ix=letIdx(w),els=(typeof WH!=='undefined'&&WH.els)||[];
  ix.forEach(function(i,k){var e=els[i];if(!e)return;e.classList.remove('nbp');void e.offsetWidth;e.classList.add('nbp');
    if(num&&!e.querySelector('.nbn')){var b=document.createElement('i');b.className='nbn';b.textContent=k+1;e.appendChild(b);}});}
function unnum(){[].forEach.call(document.querySelectorAll('#wheel .nbn'),function(e){e.remove();});}
// палец на любое слово: startTutorial берёт shortestWord() — подменяем на миг
function hand(w){if(typeof startTutorial!=='function')return;var sw=shortestWord;shortestWord=function(){return w;};try{startTutorial();}finally{shortestWord=sw;}st.handOn=1;}

function onStart(){ZB.safe('nb:start',function(){
  reset();document.body.classList.toggle('nb1',!!(on('l1')&&G.tut));
  if(G.tut&&on('l1')){if(!S.tip.intro){S.tip.intro=1;save();}l1Line();}
  // передышка
  if(on('rest')&&lastWin&&!G.daily&&!G.tut&&firstTime()&&G.idx<20&&lastWin.idx===G.idx-1&&lastWin.s>NB.restS&&G.giftN===0){
    var w=shortestOpen(),c=w&&wordCells(w).find(function(c){return !c.open;});
    if(c){openCell(c,500,'cat');c.gift=true;if(typeof saveCur==='function')saveCur();
      zina('Прошлый был трудный — тут одну букву я уже открыла. Передохни!','happy',5);ev({a:'rest',l:G.idx+1,p:lastWin.s});}}
  lastWin=null;
});}
if(window.ZB){ZB.on('start',onStart);
  // 1-й уровень новичка стартует в ui.js onReady — до модулей: подхватываем на 'ready'
  ZB.on('ready',function(){if(typeof G!=='undefined'&&G&&!G.won&&st.g!==G&&$('game').classList.contains('on'))onStart();});}
if(window.ZB)ZB.levelHook.push(function(i){
  if(i.ok&&!i.daily){lastWin={idx:i.idx,s:i.s};}
  if(i.idx===0)document.body.classList.remove('nb1');
  if(i.ok){NB.win++;NB.cur=NB.isNovice(i)?i.l:0;NB.claim=null;}
});
NB.win=0;NB.cur=0;NB.claim=null;

// промахи на 1-м уровне — номера на буквах
if(typeof submit==='function'){var sub0=submit;submit=function(w){var g=G,tut=g&&g.tut,f0=g?foundN():0;var r=sub0.apply(this,arguments);
  if(tut&&on('l1')&&G===g&&g.tut&&w&&w.length>=2&&foundN()===f0){st.miss++;var sw=shortestOpen();
    if(sw){pulse(sw.w,true);zina(st.miss>1?'Смотри на цифры: сначала 1, потом 2, потом 3. Получится!':'Почти! По порядку: '+upw(sw.w)+'. Цифры подскажут.','happy',99);}}
  return r;};}

/* ---------- раз в секунду ---------- */
setInterval(function(){if(!NB.on||!inGame()||(typeof dragging!=='undefined'&&dragging))return;ZB.safe('nb:tick',function(){
  if(st.g!==G)reset();
  var now=Date.now(),f=foundN();
  if(f!==st.fN){ // новое слово
    if(!st.w1&&G.idx===0&&st.g&&!G.daily&&S.lv===0){st.w1=true;ev({a:'f1',s:Math.round((now-st.t0)/1000),m:st.miss,t:st.tn,r:st.rep});unnum();
      document.body.classList.toggle('nb1',on('l1')&&!G.won);}
    st.fN=f;st.fT=now;st.handOn=0;return;}
  // 1) 1-й уровень до первого слова: повтор через 5 с без касания
  if(G.tut&&on('l1')){var idle=now-Math.max(st.touch,st.t0,st.repT);
    if(idle>=(st.rep?7000:5000)){st.rep++;st.repT=now;l1Line();var w=shortestOpen();if(w){pulse(w.w,st.miss>0);if(typeof startTutorial==='function')startTutorial();}
      if(st.rep===1||st.rep===3)ev({a:'rep',n:st.rep});}
    return;}
  // 1-й уровень после первого слова и уровни 2–3: палец на следующее слово
  if(on('hand')&&!G.daily&&firstTime()&&G.idx<=2){var lim=G.idx===0?6000:12000,w2=shortestOpen();
    if(w2&&!st.hand[w2.w]&&now-st.fT>=lim&&now-st.touch>=3000&&!(G.idx>0&&Object.keys(st.hand).length)){
      st.hand[w2.w]=1;hand(w2.w);pulse(w2.w,false);
      zina(G.idx===0?'Ещё слово: '+upw(w2.w)+'!':'Смотри, как я: '+upw(w2.w)+'.','happy',6);ev({a:'hand',l:G.idx+1,w:w2.w.length});}}
});},1000);

/* ---------- для js/newbie.js: быстрая помощь первых 20 уровней и буква даром при нуле ---------- */
NB.fast=function(){return on('fast')&&G&&!G.daily&&!G.tut&&G.idx<20&&G.idx===S.lv;};
// числа — ZBECO.poor {every: мин, below: монет меньше, perDay} (поток ECO); нет ZBECO — 6 мин / цена буквы / 3 в день
function poor(){var p=window.ZBECO&&ZBECO.poor||{};return {every:+p.every||NB.zeroMin,below:+p.below||PRICE.letter,perDay:+p.perDay||3};}
NB.zeroMs=function(){return poor().every*60000;};
function zDay(){var tk=todayKey(),z=S.nbZd;return z&&+z.d===tk?+z.n||0:0;}
NB.zeroDue=function(){if(!on('zero')||!G||G.won||G.tut)return false;var o=poor();
  return S.coins<o.below&&S.coins<PRICE.letter&&!freeLeft()&&!hbN()&&zDay()<o.perDay&&Date.now()-(+S.nbZ||0)>=NB.zeroMs();};
NB.zeroTake=function(open){if(!NB.zeroDue())return false;S.nbZ=Date.now();S.nbZd={d:todayKey(),n:zDay()+1};S.hintsUsed=(S.hintsUsed||0)+1;save();
  ev({a:'zero',l:G.idx+1,c:S.coins});setTimeout(function(){if(typeof updPrices==='function')updPrices();},0);
  open('Монеток маловато — эту букву дарю. Такое — раз в '+Math.round(NB.zeroMs()/60000)+' минут.');return true;};
// цена на кнопке 💡: «даром», когда буква при нуле положена
if(typeof updPrices==='function'){var up0=updPrices;updPrices=function(){up0.apply(this,arguments);
  if(NB.zeroDue&&G&&NB.zeroDue()){var p=$('prLet');if(p)p.textContent='даром';}};}

/* ---------- дирижёр ---------- */
NB.isNovice=function(i){return on('gate')&&i&&i.first&&!i.daily&&i.l<=NB.UPTO;};
// статистика дирижёра — раз на (победа, id, ответ): MG0 спрашивает 'mgnew' повторно раз в 3 с
var gSeen={};function gEv(id,l,r){var k=NB.win+':'+id+':'+r;if(gSeen[k])return;gSeen[k]=1;ev({a:'gate',id:String(id).slice(0,12),l:l,r:r});}
NB.turn=function(id,ctx){var l=NB.cur;if(!on('gate')||!l)return true;
  var res=NB.RES[l];
  if(res){var ok=res.indexOf(id)>=0;if(ok)NB.claim=NB.claim||id;gEv(id,l,ok?'ok':'wait');return ok;}
  if(NB.claim&&NB.claim!==id){gEv(id,l,'wait');return false;}
  if(NB.claim!==id)gEv(id,l,'ok');NB.claim=id;return true;};
NB.next=function(id){for(var k in NB.RES)if(NB.RES[k].indexOf(id)>=0)return +k;return 0;};

/* ---------- «Завтра у Зины» ---------- */
function tmrDue(c){if(!on('tmr')||!c||!c.first||c.daily)return false;var tk=todayKey();
  if(+S.tip.nbT===tk)return false;
  if(c.idx===5)return NB.turn('tmr',c);
  var n=(S.tip.nbW&&+S.tip.nbW.d===tk)?+S.tip.nbW.n||0:0;return c.idx>5&&n>=6&&NB.turn('tmr',c);}
// победы за сегодня (для «6-й победы дня»)
if(window.ZB)ZB.levelHook.push(function(i){if(!i.ok||i.daily)return;var tk=todayKey(),w=S.tip.nbW;
  S.tip.nbW={d:tk,n:(w&&+w.d===tk?+w.n||0:0)+1};});
function items(){var L=[];
  if(S.lv>=LOGIN_FROM)L.push({o:10,t:'🎁 гостинец'+(lgTaken()?' '+lgNextTxt().replace(/ блюдце «[^»]*» и/,' блюдце и'):'')});
  if(ECO.freeLetter>0)L.push({o:20,t:'💡 буква от Ятя'});
  var tk=todayKey(),sk=S.streak||0,alive=S.lastDaily===String(tk)||S.lastDaily===dayKey(1),dn=S.daily[tk]?1:0;
  if(S.lv>=10)L.push({o:30,t:alive&&sk+dn>=1?'🔥 урок дня — серия '+(sk+dn+1):'📅 новый урок дня'});
  NB.tmrItems.forEach(function(x){var t=ZB.safe('tmr:'+x.id,function(){return x.t();});if(t)L.push({o:x.order||50,t:t});});
  return L.sort(function(a,b){return a.o-b.o;}).slice(0,4);}
// одной строкой (класс tmr — новый вид прячет её последней, если окно не влезает; в старом окне гнездо прячется по fit)
if(window.ZB)ZB.add(ZB.winSlots,{id:'nbtmr',order:60,zone:'tmr',fit:3,
  render:function(c){if(!tmrDue(c))return '';var L=items();if(!L.length)return '';this.fit=ZB.vw?0:3;
    return '<p class="tmr nbtm"><b>Завтра у Зины:</b> '+L.map(function(x){return x.t;}).join(' · ')+'</p>';},
  mount:function(el,c){[].forEach.call(document.querySelectorAll('#mcard p.tmr'),function(p){if(!p.classList.contains('nbtm'))p.style.display='none';});
    if(!c.again){S.tip.nbT=todayKey();save();ev({a:'tmr',l:c.idx+1});}
    // подгонка окна могла спрятать строку, пока ступеньки окна ещё появлялись: место есть — вернуть
    setTimeout(function(){var m=$('mcard'),p=el.querySelector('p.nbtm');if(!m||!p||!document.body.contains(p)||p.style.display!=='none')return;
      p.style.display='';if(m.scrollHeight>m.clientHeight+1)p.style.display='none';},1600);}});
})();
