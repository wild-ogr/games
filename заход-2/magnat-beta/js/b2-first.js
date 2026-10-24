/* b2-first.js — FIRST: первый заход и 2-й день (буст «Магнат 2.0», 18.10). Договоры — шапка js/b2-core.js; журнал — release-b/M50-boost/logs/FIRST-B.md.
   1) Одно окно утром «☀️ Доброе утро» вместо «Пока вас не было» (крючок ui.js openOffline): 2 плитки, подарок дня, конверт новичка, 1 новость,
      строки других потоков — гнездо B2.slot('morning','<id>',ctx=>html) (ctx {W, off}), одна кнопка «Забрать и к делам», «Подробнее» — старое окно.
      Само окно — js/b2-first-am.js (B2.need; грузится заранее на 'ready').
   2) После утра второстепенные окна (сцены story-ui, награды cab-ui, «Итоги недели», meta-ui) — не раньше 150 с и не чаще одного в 120 с: B2F.calm().
   3) Неделя новичка: 7 конвертов на реальные дни (S.b2f.nw = {k открыто, d день последнего}); пропуск дня — конверт ждёт.
   4) «Что будет завтра» — строка в окне закрытия месяца после 10+ минут захода (гнездо close).
   Устройство: S.b2f = {nw:{k,d}, am день последнего утра, bn номер новости Бориса, tm день строки «завтра»}.
   Флаг B2.off.first; части — B2F.OFF {am,calm,nw,tm}. */
(function(){'use strict';
B2.off.first=0;          // 1 — выключено по умолчанию
if(B2.off('first'))return;
const HAS=typeof document!=='undefined';
const OFF={am:0,calm:0,nw:0,tm:0};
const F={OFF,CALM_AFTER:150e3,CALM_GAP:120e3,CALM_FOR:15*60e3};
const now=()=>{try{return typeof nowMs==='function'?nowMs():Date.now();}catch(e){return Date.now();}};
const dayN=()=>{const d=new Date(now());return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);};
const st=()=>B2.s('f');
F.dayN=dayN;F.st=st;

/* ---- неделя новичка: кто новичок и есть ли конверт сегодня ---- */
// новичок — впервые увиден в главах 1–2 без прошлых холдингов; после 7-го конверта — обычный календарь
F.nw=function(){if(OFF.nw||typeof GAME==='undefined'||!GAME.W)return null;const s=st(),W=GAME.W;
  if(!B2.isObj(s.nw)){if(W.ned||!(W.st==='gig'||W.st==='small')||(typeof S!=='undefined'&&S.fame&&S.fame.length))return null;s.nw={k:0,d:-1};}
  const n=s.nw;if(!(n.k<7))return null;return {k:n.k,today:n.d!==dayN()};};
F.nwOpen=function(){const x=F.nw();if(!x||!x.today||!F.ENV)return null;const W=GAME.W,e=F.envAt(x.k,W);let r=null;try{r=e.give(W);}catch(err){r=null;}
  const n=st().nw;n.k++;n.d=dayN();B2.ev('first','nw',{k:n.k});try{if(typeof save==='function')save();}catch(err){}return F.lastEnv={i:x.k,e,r};};
// конверт недели = подарок дня (вместо клетки CAL; крючок в game.js planGift): 💎 конверта, клетка отмечена, ×2 за ролик — от 💎 конверта
F.calSwap=function(){const x=F.nw();if(!x||!x.today||!F.ENV)return null;const p=GAME.plan();if(p.got)return null;const o=F.nwOpen();const n=o&&o.r&&o.r.cr|0;
  p.got=1;p.gv=n;p.gc=p.cal;p.gi='';p.last=p.d;p.str=(p.str|0)+1;p.cal=(p.cal+1)%(GAME.CAL.length||7);if(!n)p.x2=1;try{save();GAME.emit('change');}catch(e){}
  if(o&&!F.amOpen)setTimeout(()=>{const t=F.gotTxt&&F.gotTxt(o);toast('✉️ '+(t||L('Конверт открыт','Envelope opened')));},300);return n;};

/* ---- окно утром: крючок из ui.js openOffline(s) ---- */
const amLoad=()=>B2.need('b2-first-am.js');
F.morning=function(s,raw){if(OFF.am||!s||s.ext||typeof GAME==='undefined'||!GAME.W)return false;
  if(F.am){F.am.show(s,raw);return true;}
  GAME.hold.add('b2am');amLoad().then(()=>{GAME.hold.delete('b2am');if(F.am)F.am.show(s,raw);else raw();}).catch(()=>{GAME.hold.delete('b2am');raw();});return true;};
F.amDone=function(){F.amC=Date.now();};

/* ---- спокойствие после утра: второстепенные окна ждут ---- */
let pass=0,secAt=0;
F.calm=function(){if(OFF.calm||!F.amC||(HAS&&window.__chk))return true;const n=Date.now();if(n-F.amC>F.CALM_FOR)return true;
  if(n-F.amC<F.CALM_AFTER)return false;if(secAt&&n-secAt<F.CALM_GAP)return false;pass=n;return true;};
if(HAS){window.b2Calm=()=>F.calm();
  B2.on('ready',()=>{const md=document.getElementById('modal');if(md)try{let was=md.classList.contains('on');new MutationObserver(()=>{const on=md.classList.contains('on');if(on&&!was&&Date.now()-pass<400)secAt=Date.now();was=on;}).observe(md,{attributes:true,attributeFilter:['class']});}catch(e){}
    // окно утром — заранее (без ожидания на входе), если игрока не было дольше минуты
    try{if(F.nw()||F.st().bk||F.st().vt||typeof S!=='undefined'&&S.lastT&&now()-S.lastT>60e3)amLoad().then(()=>{try{UI.refresh();}catch(e){}}).catch(()=>{});}catch(e){}
    // гл.1: тост не ложится на кнопки пузыря Людмилы — встаёт над пузырём
    const ad=document.getElementById('adv'),ts=document.getElementById('toast');
    if(ad&&ts)try{const fit=()=>{const up=!OFF.am&&ad.classList.contains('on')&&!(typeof modalOn!=='undefined'&&modalOn)&&ad.getBoundingClientRect().height>0;
        const b=up?Math.round(window.innerHeight-ad.getBoundingClientRect().top+8)+'px':'';if(ts.style.bottom!==b)ts.style.bottom=b;};
      new MutationObserver(fit).observe(ts,{attributes:true,attributeFilter:['class'],childList:true,characterData:true,subtree:true});new MutationObserver(fit).observe(ad,{attributes:true,attributeFilter:['class']});}catch(e){}
    // новичок (< 10 заказов, не бета): кнопки «скорость» нет — время и так идёт само
    try{const st2=document.createElement('style');st2.textContent='body.early1:not(.b2f-beta) #spdBtn{display:none!important}';document.head.appendChild(st2);if(B2.beta)document.body.classList.add('b2f-beta');}catch(e){}});}

/* ---- конверт новичка без утреннего окна (1-й день, короткий заход): карточка на «Сегодня» ---- */
const tutOn=()=>{try{if(GAME.hold&&GAME.hold.has('tut'))return true;if(window.BIZUI&&BIZUI.tutStep&&BIZUI.tutStep())return true;if(window.UI&&UI.tutStep&&UI.tutStep())return true;}catch(e){}return false;};
B2.slot('today','first',ctx=>tutOn()||!F.am?'':F.am.today(ctx.W),70);   // карточки — в b2-first-am.js
B2.click('first',act=>{amLoad().then(()=>{if(!F.am)return;if(act==='env')F.am.env();if(act==='bike')F.am.bike();}).catch(()=>{});});

/* ---- «Что будет завтра» в закрытии месяца: после 10+ минут захода, раз в реальный день ---- */
const t0=Date.now();
B2.slot('close','first',()=>{if(OFF.tm||Date.now()-t0<10*60e3||!F.am||st().tm===dayN())return '';const t=F.am.tomorrow();if(!t)return '';st().tm=dayN();
  return `<p class="mut b2f-tm" style="font-size:16px">🗓 ${t}</p>`;},20);
B2.on('ready',()=>{setTimeout(()=>{if(Date.now()-t0>=0)amLoad().catch(()=>{});},9*60e3);});   // к 10-й минуте окно-модуль уже есть (строка «завтра»)

if(HAS)window.B2F=F;
})();
