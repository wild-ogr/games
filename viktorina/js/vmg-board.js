'use strict';
/* MG0 «Затеи двора» — входы в пути игрока и «Доска объявлений» (js/vmg-board.js). План: 05-minigames.md §4.1. Только через гнёзда UX (js/ui-core.js):
   1) «Переменка» — resultSlots: в окне итога КАЖДОЙ 2-й доигранной лестницы карточка «☕ Переменка: <затея> · до +15 💰» → одно нажатие = игра;
      после неё «▶ Следующая лестница». Если на этой лестнице открылась новая затея — вместо Переменки «Новая затея открыта!» с кнопкой «Сыграть».
   2) «Затея дня» — homeSlots (плитка на главном) + VMG.today() для «Сегодня» CAR: по дню недели (Пн Правда/байка · Вт Анаграммы · Ср Угадай год ·
      Чт Пары · Пт Что лишнее · Сб Кроссвордик · Вс По трём подсказкам; закрыта — ближайшая открытая). Одна на всех (зерно дня). 3★ → жетон Михалыча.
   3) «Разминка» — preTopicSlots: перед лестницей «💪 Разминка → жетон подсказки» (раз в день, пока за Разминку сегодня не наградили).
   4) Окно «Новая затея открыта — сыграть?» — один раз на затею, на главном (если игрок не сыграл её из окна итога).
   5) «Доска объявлений» — экран 'zatei' (UI.go('zatei')), вкладка «Доска» нижней панели (navSlots id 'doska'): листки открытых затей (штамп ✓ — сыграно
      сегодня), 2 ближайшие закрытые «откроется …», «Грамоты двора» (уровень и 5 грамот — только оформление), тренировка.
   6) Жетон Михалыча на лестнице — обёртка useLife: в окне «Ещё раз подсказку?» кнопка «🎟 Жетоном» (только лестница; не день/дуэль/рейтинг).
   STAT: ev 'mg' {a:'show', id, m:'pause'|'day'|'warm'|'new'} — когда предложили; 'board' — открыл Доску; 'tku' — потратил жетон. */
(function(){
if(!window.VMG)return;
const W=window,I=VMG.INFO,id=n=>I[n].id,G0=()=>typeof G!=='undefined'?G:null;
const WEEK=[9,1,3,5,7,8,10];   // вс..сб: Вс По трём подсказкам · Пн Правда · Вт Анаграммы · Ср Угадай год · Чт Пары · Пт Что лишнее · Сб Кроссвордик
const FALL=[1,3,4,6];
const opened=()=>{const o=[];for(let n=1;n<=14;n++)if(VMG.isOpen(n))o.push(n);return o;};
const capLeft=()=>Math.max(0,VMG.RW.cap-VMG.Z().d.c);
const rwMax=n=>(VMG.RW.per[n]||VMG.RW.c)[3];
const st=(a,n,m)=>{try{STAT.ev('mg',{a,id:id(n),m});}catch(e){}};

/* ---------- Затея дня ---------- */
function dayNum(){const d=new Date(nowMs());for(let i=0;i<7;i++){const n=WEEK[(d.getDay()+i)%7];if(VMG.isOpen(n))return n;}
  for(const n of FALL)if(VMG.isOpen(n))return n;return 0;}
function today(){const n=dayNum();if(!n)return null;const z=VMG.Z(),g=VMG.REG.by[id(n)];
  return {id:id(n),num:n,n:g.n,ic:g.ic,a:g.a,done:!!z.d.z,rw:rwMax(n),tk:!z.d.t&&z.tk<VMG.RW.tkMax,play:playDay};}
function playDay(back){const n=dayNum();if(!n)return;hideModal();st('go',n,'day');
  VMG_OPEN(id(n),{mode:VMG.Z().d.z?'train':'day',back:back||(()=>{if(typeof openMenu==='function')openMenu();})});}

/* ---------- новая затея: окно один раз ---------- */
function unseen(){const z=VMG.Z();for(let n=1;n<=14;n++)if(VMG.isOpen(n)&&!z.s[n])return n;return 0;}
function seenN(n){const z=VMG.Z();if(!z.s[n]){z.s[n]=1;VMG.touch();save();}}
function newWin(n){const g=VMG.REG.by[id(n)];seenN(n);st('show',n,'new');
  modal('<div class="av">'+portrait(g.who,'happy')+'</div><h2>Новая затея открыта!</h2><div class="vmg-nwc"><span class="vmg-nwi">'+g.ic+'</span><b>'+esc(g.n)+'</b><small>'+esc(g.a)+'</small></div>'+
    '<p class="goal">Минута-две, без спешки'+(capLeft()?' · до +'+Math.min(rwMax(n),capLeft())+' 💰':'')+'. Все затеи — на «Доске объявлений».</p>'+
    '<div class="row"><button class="btn accent" id="vmgNwGo">▶ Сыграть сейчас</button><button class="btn" id="mCancel">Потом</button></div>');
  $('vmgNwGo').onclick=()=>{SND.tap();hideModal();VMG_OPEN(id(n),{mode:'new',back:()=>openMenu()});};$('mCancel').onclick=()=>{SND.tap();hideModal();};}
// на главном, когда никакого окна нет (гостинцы/серия могут быть первыми — ждём их закрытия, до 30 с)
let mcT=0;function menuCheck(k){clearTimeout(mcT);if(W.__vmgStand||W.__demo||VMG.cur||typeof onScr==='function'&&!onScr('scr-menu'))return;
  if(typeof modalOn!=='undefined'&&modalOn){if((k|0)<20)mcT=setTimeout(()=>menuCheck((k|0)+1),1500);return;}
  VMG.unlock();const n=unseen();if(n&&n!==2)newWin(n);else if(n===2)seenN(2);}

/* ---------- 1) Переменка в окне итога лестницы ---------- */
function pausePick(){const z=VMG.Z(),L=VMG.lads();const c=opened().filter(n=>n!==2&&!z.d.p[n]);if(!c.length||!capLeft())return 0;
  c.sort((a,b)=>(z.n[a]|0)-(z.n[b]|0)||a-b);return c[L%Math.min(2,c.length)];}
W.resultSlots.push({id:'vmg-pause',order:60,render(ctx){if(!ctx||!ctx.G||ctx.G.mode!=='lad'||W.__demo)return null;
    const nw=VMG.unlock(),L=VMG.lads();let n=0,m='pause';
    if(nw&&nw!==2){n=nw;m='new';seenN(nw);}else if(L%2===0&&L>=2)n=pausePick();
    if(!n)return null;const g=VMG.REG.by[id(n)],cap=capLeft(),rw=Math.min(rwMax(n),cap);
    return '<button class="vmg-pz'+(m==='new'?' nw':'')+'" data-vmg="'+n+'" data-m="'+m+'"><span class="vmg-pzI">'+(m==='new'?'🆕':'☕')+'</span><span class="vmg-pzB"><b>'+(m==='new'?'Новая затея: ':'Переменка: ')+esc(g.n)+'</b>'+
      '<small>'+(m==='new'?esc(g.a):'минутка'+(rw?' · до +'+rw+' 💰':''))+'</small></span><span class="vmg-pzG">▶</span></button>';},
  mount(el,ctx){const b=el.querySelector('[data-vmg]');if(!b)return;const n=+b.dataset.vmg,m=b.dataset.m,pass=ctx.pass,topic=ctx.topic;
    // окно итога без прокрутки: после fitCard — плотная карточка, не влезла и так — убираем (показ не засчитан)
    setTimeout(()=>{const md=$('modal'),over=()=>md.scrollHeight>md.clientHeight+1;if(over()){b.classList.add('sm');if(over()){el.style.display='none';return;}}st('show',n,m);},0);
    b.onclick=()=>{SND.tap();hideModal();
      const nextL=()=>{if(pass||typeof startLadder!=='function')openTopics();else startLadder(topic);};
      VMG_OPEN(id(n),{mode:m,next:{t:'▶ Следующая лестница',f:nextL},back:()=>openTopics()});};}});

/* ---------- 2) Затея дня — плитка главного ---------- */
W.homeSlots.push({id:'vmg-day',order:25,render(){const t=today();if(!t)return null;
    return '<button class="vmg-dt'+(t.done?' done':'')+'"><span class="vmg-dtI">'+t.ic+'</span><span class="vmg-dtB"><em>Затея дня</em><b>'+esc(t.n)+'</b><small>'+
      (t.done?'сыграно ✓ · завтра новая':'одна на весь двор · до +'+Math.min(t.rw,capLeft()||t.rw)+' 💰'+(t.tk?' и 🎟':''))+'</small></span><span class="vmg-pzG">'+(t.done?'✓':'▶')+'</span></button>';},
  mount(el){const b=el.querySelector('.vmg-dt');if(b){const t=today();if(t&&!t.done&&!W.__showDay){W.__showDay=1;st('show',t.num,'day');}b.onclick=()=>{SND.tap();playDay();};}}});

/* ---------- 3) Разминка перед темой ---------- */
W.preTopicSlots.push({id:'vmg-warm',order:10,when(){const z=VMG.Z();return VMG.isOpen(2)&&!z.d.p[2]&&!VMG.cur;},
  render(topic){const z=VMG.Z(),tk=!z.d.t&&z.tk<VMG.RW.tkMax;st('show',2,'warm');
    return '<button class="vmg-pz warm" data-warm="1"><span class="vmg-pzI">💪</span><span class="vmg-pzB"><b>Разминка перед темой</b><small>3 карточки и 2 вопроса'+(tk?' → 🎟 жетон подсказки':'')+'</small></span><span class="vmg-pzG">▶</span></button>';},
  mount(el,topic,start){const b=el.querySelector('[data-warm]');if(!b)return;b.onclick=()=>{SND.tap();hideModal();
    const go=()=>{if(typeof start==='function')start();else startLadder(topic);};
    VMG_OPEN('razminka',{mode:'warm',ctx:{topic},next:{t:'▶ К лестнице',f:go},back:r=>{if(r)go();}});};}});

/* ---------- 5) Доска объявлений ---------- */
function board(){if(VMG.cur)VMG.close();hideModal();let el=$('vmgBoard');if(!el){el=document.createElement('div');el.id='vmgBoard';el.className='vmg';($('app')||document.body).appendChild(el);}
  try{STAT.screen('zatei');STAT.ev('mg',{a:'board'});}catch(e){}VMG.unlock();
  const z=VMG.Z(),op=opened(),t=today(),lv=VMG.lv(z.x),cap=capLeft();
  const leaf=(n,i)=>{const g=VMG.REG.by[id(n)],done=!!z.d.p[n],rot=[-2,1.5,-1,2,-1.5,1][i%6];
    return '<button class="vmg-lf'+(done?' done':'')+'" data-n="'+n+'" style="--r:'+rot+'deg"><span class="vmg-pin"></span><span class="vmg-lfI">'+g.ic+'</span><b>'+esc(g.n)+'</b><small>'+esc(g.a)+'</small>'+
      '<span class="vmg-lfF">'+(done?'<i class="vmg-stamp">✓ сыграно</i>'+(z.b[n]?' · рекорд '+z.b[n]:''):'до +'+rwMax(n)+' 💰')+'</span>'+(!z.s[n]?'<em class="vmg-new">новое</em>':'')+'</button>';};
  let locked=[];for(let n=1;n<=14&&locked.length<2;n++)if(!VMG.isOpen(n)&&VMG.REG.by[id(n)])locked.push(n);
  const lockH=locked.map(n=>{const g=VMG.REG.by[id(n)];return '<div class="vmg-lf lock"><span class="vmg-lfI">🔒</span><b>'+esc(g.n)+'</b><small>откроется: '+esc(VMG.lockTxt(n))+'</small></div>';}).join('');
  const gr=VMG.GR.map(g=>'<div class="vmg-gr'+(z.g[g.l]?' got':'')+'"><span>'+g.ic+'</span><b>'+esc(g.n.replace('Грамота ',''))+'</b><small>'+(z.g[g.l]?'получена':'уровень '+g.l)+'</small></div>').join('');
  el.innerHTML='<div class="vmg-head"><span class="vmg-ic">📌</span><b class="vmg-nm">Доска объявлений</b><button class="vmg-xb" aria-label="Закрыть">✕</button></div><div class="vmg-bd">'+
    '<p class="vmg-bsum">Сегодня с затей: <b>'+z.d.c+'/'+VMG.RW.cap+'\u00a0💰</b> · жетоны 🎟 <b>'+z.tk+'/'+VMG.RW.tkMax+'</b></p>'+
    (t?'<button class="vmg-lf day'+(t.done?' done':'')+'" data-day="1"><span class="vmg-pin"></span><em class="vmg-dayL">Затея дня</em><span class="vmg-lfI">'+t.ic+'</span><b>'+esc(t.n)+'</b><small>одна на весь двор'+(t.done?'':' · 3★ — 🎟 жетон')+'</small><span class="vmg-lfF">'+(t.done?'<i class="vmg-stamp">✓ сыграно</i>':'до +'+t.rw+' 💰')+'</span></button>':'')+
    (op.length?'<div class="vmg-lfs">'+op.map(leaf).join('')+lockH+'</div>':'<p class="vmg-bsum">Сыграй первую лестницу — и Михалыч повесит сюда первую затею.</p>')+
    '<h3 class="vmg-bh">📜 Грамоты двора</h3><div class="vmg-xpb"><span>Знаток двора · ур. '+lv.l+'</span><span class="vmg-bar"><i style="width:'+Math.round(100*lv.cur/lv.need)+'%"></i></span><span>'+lv.cur+'/'+lv.need+'</span></div>'+
    '<div class="vmg-grs">'+gr+'</div><p class="vmg-bnote">Очки Грамот — за каждую затею с наградой. Сыгранную сегодня затею можно повторить для тренировки и рекорда.</p></div>';
  el.style.display='';const close=()=>{el.style.display='none';try{STAT.screen('menu');}catch(e){}openMenu();};
  el.querySelector('.vmg-xb').onclick=()=>{SND.tap();close();};
  el.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{SND.tap();const n=+b.dataset.n;seenN(n);VMG_OPEN(id(n),{mode:z.d.p[n]?'train':'board',back:board});});
  const db=el.querySelector('[data-day]');if(db)db.onclick=()=>{SND.tap();playDay(board);};
  if(W.LK&&LK.on&&LK.on()&&LK.scan)try{LK.scan(el);}catch(e){}}
function boardHide(){const el=$('vmgBoard');if(el)el.style.display='none';}
if(W.UI){UI.screen('zatei',board);UI.on&&UI.on('screen',n=>{if(n!=='zatei')boardHide();});}
const dotNow=()=>{const z=VMG.Z();if(!capLeft())return false;const t=today();return !!(t&&!t.done)||opened().some(n=>!z.d.p[n]&&n!==2)||!!unseen();};
W.navSlots.push({id:'doska',order:30,ic:'📌',t:'Доска',go:'zatei',dot:dotNow});
// любой показ экрана игры прячет Доску (меню, темы, лестница)
// главный: открыть новую затею по дням игры и показать окно «Новая затея» (старому игроку — №1 сразу)
if(typeof openMenu==='function'){const m0=openMenu;openMenu=function(){const r=m0.apply(this,arguments);setTimeout(menuCheck,400);return r;};}
if(typeof show==='function'){const s0=show;show=function(){boardHide();return s0.apply(this,arguments);};}

/* ---------- 6) жетон Михалыча на лестнице ---------- */
if(typeof useLife==='function'){const u0=useLife;useLife=function(k,fn){const r=u0.apply(this,arguments);
  try{const g=G0();if(g&&g.mode==='lad'&&g.life[k]&&typeof modalOn!=='undefined'&&modalOn&&$('lCoin')&&S.vmg&&S.vmg.tk>0&&!$('vmgTk')){
    const b=document.createElement('button');b.className='btn green noenter';b.id='vmgTk';b.innerHTML='🎟 Жетоном Михалыча <small>есть '+S.vmg.tk+' из '+VMG.RW.tkMax+'</small>';
    const row=$('lCoin').parentNode;row.insertBefore(b,row.firstChild);
    b.onclick=()=>{if(!(S.vmg.tk>0))return;hideModal();S.vmg.tk--;S.vmg.tu++;VMG.touch();save();try{STAT.use('hint');STAT.ev('mg',{a:'tku',k,n:S.vmg.tk});}catch(e){}fn(false);};
    if(W.LK&&LK.on&&LK.on()&&LK.scan)LK.scan(b);}}catch(e){console.warn('vmg tk',e);}return r;};}

/* ---------- наружу (для CAR «Сегодня»: VMG.today() → {id,num,n,ic,done,rw,tk,play()}) ---------- */
Object.assign(VMG,{today,playDay,board,newWin,dayNum,menuCheck,pausePick});
})();
