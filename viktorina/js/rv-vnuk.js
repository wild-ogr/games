'use strict';
/* RV-П6 «Проверь внука» (революция «Весь двор отвечает», план release-i/vk-rev-0611/PLAN-VK.md §2.2, §7). Флаг rv.vnuk; в ОК и Яндексе выключено (DUEL_ON).
   Дуэль переодета в разговор поколений, на её движке (G.mode 'duel' + G.vnuk, ссылка — appLink, разбор — parseVnuk в index.html):
   1) бабушка жмёт «📨 Отправить внуку» (строка в итоге лестницы по ностальгической теме / итоге викторины дня / листок на Доске / кнопка на главном)
      → ссылка #vnuk=<зерно36>; сама не играет — одно касание;
   2) внук открывает → 5 вопросов «из бабушкиного детства» (набор old) → счёт v → «📨 Отправить бабушке» #vnuk=<зерно>-<v>;
   3) бабушка открывает → «Ответить внуку»: 5 вопросов «из детства внука» (набор young) → открытка «Бабушка b : v Внук» → «📨 Отправить открытку внуку» #vnuk=<зерно>-<v>-<b>;
   4) внук открывает → та же открытка.
   Наборы — js/rv-vnuk-data.js (tools/rv_vnuk_sets.py). Наград за отправку нет (VK 2.6.2); монеты — за верные ответы, как в дуэли (общий счётчик S.dlc, DUEL_PAID в день).
   Сохранение: результаты — в S.duel (ключи 'vo'/'vy'+зерно, как у дуэли, ≤40 ключей), S.vnk = {f: день первого показа, n: новичок, d: день последней строки, s: отправок} —
   появляется только при первом показе. Строка в итоге — гнездо resultSlots id 'rv-vnuk', order 70 (договор с П3).
   STAT: lvl m='vnuk-o'|'vnuk-y'; ev 'mod' {m:'vnuk', a:'share'|'show'|'in', s:место}. */
(function(){
const W=window,N=5,ST={o:0x0a11e5,y:0x0b22d7};
const NOST={ussr:1,kino:1,school:1,toys:1,muz:1,trad:1,kitchen:1,vhs:1,moda:1};
function on(){return typeof DUEL_ON!=='undefined'&&DUEL_ON&&!!W.RVV_SETS&&(!W.RV||!RV.on||RV.on('vnuk'));}
const ev=(a,s)=>{try{STAT.ev('mod',{m:'vnuk',a,s:s||''});}catch(e){}};
const dnum=k=>{k=+k;return Math.floor(Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100)/864e5);};
const today=()=>dayKey(0);
const lnk=(seed,v,b)=>appLink('vnuk='+seed.toString(36)+(v!=null?'-'+v:'')+(b!=null?'-'+b:''));

/* ---------- наборы: 5 вопросов по зерну, одинаково у обоих ---------- */
function pickSet(seed,k){const R=rng((seed^ST[k])>>>0),ids=(RVV_SETS[k==='o'?'old':'young']||[]).filter(i=>QI[i]&&!isBad(QI[i]));
  const easy=ids.filter(i=>QI[i].d<=2),pool=(easy.length>=40?easy:ids).slice(),qs=[],tu={};
  for(let g=0;g<200&&qs.length<N&&pool.length;g++){const j=Math.floor(R()*pool.length),q=QI[pool[j]];pool.splice(j,1);
    if((tu[q.t]||0)>=2&&g<150)continue;tu[q.t]=(tu[q.t]||0)+1;qs.push(q.i);}
  return{qs,perms:qs.map(()=>shuffle([0,1,2,3],R))};}

/* ---------- игра (5 вопросов) поверх дуэли ---------- */
function start(seed,k,v){if(!qReady)return qWait(()=>start(seed,k,v));const set=pickSet(seed,k);if(set.qs.length<N){toast('Вопросы ещё не готовы — попробуй чуть позже');return;}
  try{STAT.lvl(0,'vnuk-'+k);STAT.screen('game');}catch(e){}
  G=newG('duel',set.qs,{perms:set.perms,seed,foe:null,vnuk:{k,v:v==null?null:v}});
  G.say={who:'mihalych',t:k==='o'?'Вопросы из бабушкиного детства. Посмотрим, что ты знаешь про её время!':'Внук проверяет тебя: вопросы из его детства. Не робей!'};
  show('scr-game');hideModal();renderQ();YG.start();}
const SAY=['Второй вопрос. Не торопись.','Третий. Половина позади.','Четвёртый. Почти всё!','Последний вопрос!'];
// renderQ дуэли рисует 10 ступеней и «из 10» — у «Проверь внука» их пять
const r0=W.renderQ;
W.renderQ=renderQ=function(){const nw=!!(G&&G.vnuk&&G.pi!==G.i);r0.apply(this,arguments);if(!G||!G.vnuk)return;const k=G.vnuk.k,ok=G.res.filter(x=>x===1).length;
  if(nw&&G.i>0){G.say={who:'mihalych',t:SAY[G.i-1]||''};const t=$('sayT');if(t)t.textContent=G.say.t;}
  $('gTitle').textContent=k==='o'?'От бабушки':'От внука';
  $('gSub').textContent=k==='o'?'её детство':'его детство';
  let lh='';for(let j=0;j<N;j++){const r=G.res[j];lh+='<span class="'+(r===1?'done':r===0?'bad':j===G.i?'cur':'')+'"><b>'+(r===1?'✓':r===0?'✗':j+1)+'</b><em class="lk-o"></em></span>';}
  $('ladder').innerHTML=lh;$('ladder').classList.add('rv-vnk5');
  $('ladInfo').innerHTML='<span>Вопрос '+(G.i+1)+' из '+N+'</span><span>Верно: <b>'+ok+'</b></span>';
  if(G.st==='done'&&G.i>=G.qs.length-1)$('btnNext').textContent='Итоги';
  if(W.LK&&LK.on&&LK.on()&&LK.scan)try{LK.scan($('scr-game'));}catch(e){}};
const n0=W.next;
W.next=next=function(){if(G&&G.vnuk&&G.st==='done'&&!G.over&&G.i>=G.qs.length-1){SND.tap();return finish();}return n0.apply(this,arguments);};
$('btnNext').onclick=()=>next();

function finish(){if(!G||G.over||!G.vnuk)return;G.over=true;YG.stop();
  const g=G,k=g.vnuk.k,good=g.res.filter(x=>x===1).length,key='v'+k+g.seed.toString(36),first=S.duel[key]==null,t=today();
  if(!isObj(S.dlc)||S.dlc.d!==t)S.dlc={d:t,n:0};const paid=first&&S.dlc.n<DUEL_PAID,coins=paid?good*2:0;
  try{STAT.end(good>=3?'win':'lose',{g:good});}catch(e){}
  if(first){S.duel[key]=good;S.coins+=coins;if(coins)try{STAT.earn('lvl',coins);}catch(e){}if(paid)S.dlc.n++;}S.adW=(S.adW||0)+1;save();updCoins();
  if(k==='o')afterO(g.seed,good,coins);else card(g.seed,g.vnuk.v,good,coins,true);}

/* ---------- окна ---------- */
const av=(w,m)=>'<div class="av">'+portrait(w||'mihalych',m||'happy')+'</div>';
const coinsP=c=>c?'<p class="coins-won">+'+coinsTxt(c)+'</p>':'';
function send(link,s,txt){ev('share',s);shareLink(link,'vnuk');
  if(VK&&txt)setTimeout(()=>toast(txt,3500),400);}
// внук ответил на бабушкины → его очередь задать свои
function afterO(seed,v,coins){const tx=v>=5?'Вот это внук! Бабушкино детство знаешь на отлично.':v>=3?'Неплохо! Кое-что бабушка тебе ещё расскажет.':'Есть о чём расспросить бабушку за чаем.';
  SND[v>=3?'win':'coin']();if(v>=3)confetti();
  modal(av('mihalych',v>=3?'happy':'norm')+'<h2>👵 Бабушкино детство</h2><p class="score">'+v+' из '+N+'</p><p>'+tx+'</p>'+coinsP(coins)+
    '<p class="goal">Теперь твоя очередь: задай бабушке 5 вопросов из своего детства — девяностые, телефоны, мультики.</p>'+
    '<div class="row" id="mWon"><button class="btn violet noenter" id="vkSend">📨 Отправить бабушке</button><button class="btn green" id="vkOk">В меню</button></div>');
  $('vkSend').onclick=()=>send(lnk(seed,v),'back','Как бабушка ответит — пришлёт открытку');party();fitCard();$('vkOk').onclick=()=>{hideModal();between(openMenu);};}
// открытка «Бабушка b : v Внук»; mine — бабушка только что ответила (кнопка «Отправить открытку внуку»)
function card(seed,v,b,coins,mine){const w=b>v?'Бабушка победила! Знает и своё время, и внуково.':b<v?'Внук победил — но бабушка ещё отыграется!':'Ничья! Вот это семья знатоков.';
  if(mine){if(b>=v){SND.win();confetti();}else SND.coin();}
  modal(av('mihalych',b>=v?'happy':'wow')+'<div class="rv-vnk-card"><small>Открытка от Михалыча</small><div class="rv-vnk-sc"><span><em>Бабушка</em><b>'+b+'</b></span><i>:</i><span><b>'+v+'</b><em>Внук</em></span></div><p>'+w+'</p></div>'+
    (mine?coinsP(coins):'')+'<div class="row" id="mWon">'+(mine?'<button class="btn violet noenter" id="vkSend">📨 Отправить открытку внуку</button>':'<button class="btn violet noenter" id="vkNew">👵 Ещё раунд</button>')+
    '<button class="btn green" id="vkOk">В меню</button></div>');
  if($('vkSend'))$('vkSend').onclick=()=>send(lnk(seed,v,b),'card','Внук увидит счёт '+b+' : '+v);
  if($('vkNew'))$('vkNew').onclick=()=>{hideModal();open('card');};
  party();fitCard();$('vkOk').onclick=()=>{hideModal();if(mine)between(openMenu);else openMenu();};}
// вход: «Проверь внука» — одно окно, одна кнопка
function open(src){if(!on())return;ev('show',src);try{STAT.screen('vnuk');}catch(e){}
  modal(av('mihalych','happy')+'<h2>👵 Проверь внука</h2><p>А внук знает, что такое авоська? Отправь ему 5 вопросов из твоего детства.</p>'+
    '<p class="about">Он ответит — и задаст тебе 5 из своего: девяностые, телефоны, мультики. Итог — открытка «Бабушка : Внук».</p>'+
    '<div class="row"><button class="btn violet noenter" id="vkSend">📨 Отправить внуку</button><button class="btn" id="mCancel">Потом</button></div>');
  $('vkSend').onclick=()=>{sendNew(src);hideModal();if(typeof onScr==='function'&&onScr('scr-menu'))openMenu();};$('mCancel').onclick=hideModal;}
function sendNew(src){const seed=1+Math.floor(Math.random()*2e9),z=vnk();z.s=(z.s|0)+1;z.d=today();save();
  send(lnk(seed),src,'Как внук ответит — придёт ссылка обратно');}
// пришла ссылка
function incoming(d){ev('in',d.b!=null?'card':d.v!=null?'back':'new');const sd=d.seed.toString(36);
  if(d.b!=null){card(d.seed,d.v,d.b,0,false);return true;}
  if(d.v!=null){const mine=S.duel['vy'+sd];if(mine!=null){card(d.seed,d.v,mine,0,true);return true;}
    modal(av('mihalych','wow')+'<h2>👵 Внук ответил!</h2><p>На твои вопросы — <b>'+d.v+' из '+N+'</b>.</p><p>Теперь он проверяет тебя: 5 вопросов из его детства — девяностые, телефоны, мультики.</p>'+
      '<div class="row"><button class="btn violet" id="vkGo">▶ Ответить внуку</button><button class="btn" id="mCancel">Потом</button></div>');
    $('vkGo').onclick=()=>{hideModal();start(d.seed,'y',d.v);};$('mCancel').onclick=hideModal;return true;}
  const mine=S.duel['vo'+sd];
  modal(av('mihalych','wow')+'<h2>👵 Бабушка проверяет тебя!</h2><p>Знаешь, что такое авоська? 5 вопросов из бабушкиного детства. Потом задашь ей 5 из своего.</p>'+
    (mine!=null?'<p class="goal">Ты уже ответил: '+mine+' из '+N+'</p>':'')+
    '<div class="row">'+(mine==null?'<button class="btn violet" id="vkGo">▶ Ответить</button>':'<button class="btn violet noenter" id="vkSend">📨 Отправить бабушке</button>')+'<button class="btn" id="mCancel">Потом</button></div>');
  if($('vkGo'))$('vkGo').onclick=()=>{hideModal();start(d.seed,'o');};
  if($('vkSend'))$('vkSend').onclick=()=>{send(lnk(d.seed,mine),'back');hideModal();};$('mCancel').onclick=hideModal;return true;}

/* ---------- когда предлагать (одна строка, не чаще раза в день) ---------- */
function vnk(){if(!isObj(S.vnk))S.vnk={f:today(),n:ladFin()<=3?1:0,d:0,s:0};return S.vnk;}
// старым игрокам — с 4-го дня после выпуска (PLAN 4.3), новичку — после 3-го итога
function due(){if(!on()||W.__demo||ladFin()<3)return false;const z=vnk();
  if(!z.n&&(W.RV&&RV.day?RV.day():dnum(today())-dnum(z.f)+1)<4)return false;return z.d!==today();}
const LINE='<p class="goal tipl rv-vnk-l">👵 А внук знает, что такое авоська? <button class="btn violet noenter" data-vnk="1">📨 Отправить внуку</button></p>';
function mountLine(el,src){const z=vnk();z.d=today();save();ev('show',src);try{if(W.RV&&RV.mark)RV.mark('vnuk','show');}catch(e){}
  const b=el&&el.querySelector('[data-vnk]');if(b)b.onclick=e=>{e.stopPropagation();SND.tap();sendNew(src);b.disabled=true;b.textContent='✓ Отправлено';};}
W.resultSlots.push({id:'rv-vnuk',order:70,render(ctx){if(!ctx||!ctx.G||ctx.G.mode!=='lad'||(ctx.kind!=='win'&&ctx.kind!=='pass'))return null;
    if(!(NOST[ctx.topic]||ctx.topic==='all')||!due())return null;return LINE;},mount(el){mountLine(el,'res');}});
// итог викторины дня — та же строка (если сегодня её ещё не было)
const fd0=W.finishDay;
W.finishDay=finishDay=function(){const r=fd0.apply(this,arguments);try{const w=$('mWon');
  if(w&&due()&&/Викторина дня/.test(($('mcard').querySelector('h2')||{}).textContent||'')){const d=document.createElement('div');d.className='rslot';d.innerHTML=LINE;
    w.parentNode.insertBefore(d,w);mountLine(d,'day');fitCard();}}catch(e){}return r;};

/* ---------- постоянная дверь: листок на Доске затей + кнопка дуэли на главном ---------- */
function leaf(){const el=$('vmgBoard');if(!el||!on()||el.querySelector('.rv-vnk-lf'))return;const lfs=el.querySelector('.vmg-lfs');if(!lfs)return;
  const b=document.createElement('button');b.className='vmg-lf rv-vnk-lf';b.style.setProperty('--r','1deg');
  b.innerHTML='<span class="vmg-pin"></span><span class="vmg-lfI">👵</span><b>Проверь внука</b><small>5 вопросов из твоего детства — по ссылке</small><span class="vmg-lfF">открытка «Бабушка : Внук»</span>';
  b.onclick=()=>{SND.tap();open('doska');};lfs.insertBefore(b,lfs.firstChild);}
if(W.MutationObserver){const mo=new MutationObserver(()=>{if($('vmgBoard')&&$('vmgBoard').style.display!=='none')leaf();});
  mo.observe($('app')||document.body,{childList:true,subtree:true});}
function btn(){const b=$('btnDuel');if(!b||!on()||b.dataset.vnk)return;b.dataset.vnk=1;const sub=$('duelSub');
  for(const c of Array.from(b.childNodes))if(c!==sub)b.removeChild(c);
  b.insertBefore(document.createTextNode('👵 Проверь внука'),sub);if(sub)sub.style.display='none';
  const s=document.createElement('small');s.className='rv-vnk-sub';s.textContent='5 вопросов из твоего детства';b.appendChild(s);
  if(W.LK&&LK.on&&LK.on()&&LK.scan)try{LK.scan(b);}catch(e){}}
btn();

W.RVV={on,open,incoming,finish,start,pickSet,link:lnk,due};
})();
