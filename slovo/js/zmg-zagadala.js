'use strict';
/* zb2-MGW мини-игра №16 «Зина загадала» (буст_в2.0, 12.10.2026). Слово дня из 5 букв (по воскресеньям — из 6) за 6 попыток — одно на весь подъезд.
   Зина проверяет красной ручкой: буква на месте — подчёркнута зелёным, есть в слове, но не тут — жёлтым, мимо — зачёркнута красным; реплики по ходу.
   Несуществующее слово попыткой не считается (Зина объясняет — whyNot). Попытки дня сохраняются (host.mem: {k день, g 'слово,…', e 0|1|2}) — вышел и вернулся — продолжаешь.
   Награда — оболочка, раз в день: монеты ZBECO.wd.win[попытка] через подпотолок 'wd' (g.want/g.src), звёзды: 1–2 попытки ★★★, 3–4 ★★, 5–6 ★; серия — ZBWD (js/zb2-wordday.js).
   Слово сегодня уже разгадано: в тренировке (Уголок, «Ещё раз») — слово из архива прошлых дней, без серии. Тренировка, а сегодняшнее не сыграно — открываем сегодняшнее с наградой (mode home).
   «Похвастаться» — сетка квадратиков (VK — стена, ОК/Яндекс — копировать). Данные — js/zmg-zagadala-data.js (tools/zmg_zagadala.py). Классы — zmw-. Флаг: ?off=zagadala. */
(function(){
if(typeof ZMG_REG!=='function')return;
const ID='zagadala',TRIES=6;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const nrm=w=>String(w||'').toLowerCase().replace(/ё/g,'е');
const E0=Date.UTC(2026,0,5);
const tk=()=>typeof todayKey==='function'?+todayKey():20261012;
const dn=k=>Math.round((Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100)-E0)/864e5);
const D=()=>window.ZMG_ZAGADALA;
function wordOf(d){const Z=D(),A5=Z.a5.split(' '),A6=Z.a6.split(' '),w=Math.floor(d/7),k=((d%7)+7)%7;
  return k===6?A6[((w%A6.length)+A6.length)%A6.length]:A5[(((w*6+k)%A5.length)+A5.length)%A5.length];}
const okWord=w=>{try{return typeof isWord==='function'?isWord(w):false;}catch(e){return false;}};
/* оценка попытки: 2 — на месте, 1 — есть в слове, 0 — нет (повторы букв — честно, как в «Wordle») */
function score(g,a){const n=a.length,r=new Array(n).fill(0),left={};
  for(let i=0;i<n;i++){if(g[i]===a[i])r[i]=2;else left[a[i]]=(left[a[i]]||0)+1;}
  for(let i=0;i<n;i++)if(r[i]!==2&&left[g[i]]){r[i]=1;left[g[i]]--;}return r;}
const tierOf=(won,n)=>!won?0:n<=2?3:n<=4?2:1;
const WIN=['','С первого раза?! Ять, признавайся — подглядывал в тетрадку?','Две попытки! Садись, пять — и пирожок сверху.',
  'Три попытки — голова варит, как мой борщ!','Четыре — крепкая четвёрка. Почти как у меня в молодости.','Пять попыток — со скрипом, но вытянул!',
  'На последней! Как в школе — звонок спас.'];
const WHY={adj:'Это «какой», а мне нужно «что» — предмет.',verb:'Это глагол. Мне нужен предмет, а не дело.',plural:'Мне одну штуку, а не охапку.',name:'Имена и города не загадываю.',
  rude:'Ять, закрой уши! Такое в тетрадку не пишем.',pron:'Это местоимение — слово-заместитель. Мне нужен сам предмет.',num:'Это число, а не предмет.',adv:'Это «как», а мне нужно «что».',
  func:'Это служебное слово — клей для фраз.',form:'Мне нужно слово в начальной форме — «кто? что?».'};
function sayFor(r,n,L){const g=r.filter(x=>x===2).length,y=r.filter(x=>x===1).length;
  if(g===0&&y===0)return ['Мимо кассы! Ни одной буквы — вычёркиваю.','Пусто! Красная ручка устала зачёркивать.','Ни одной не угадал — зато теперь знаем, чего там нет.'][n%3];
  if(g>=L-1)return ['Горячо! Одна буква осталась.','Ой, совсем рядом! Ещё чуть-чуть.'][n%2];
  if(y>=2&&g===0)return ['Буквы есть, да сидят не там — как внуки за столом.','Ять, не подсказывай! Пусть сам переставит.'][n%2];
  if(g>=2)return ['Тепло! Подчеркнула зелёным — держи их на месте.','Уже вырисовывается! Две на месте.'][n%2];
  return ['Есть зацепка! Думай дальше.','Так-так… Кое-что есть. Ять, молчи!','Неплохо для начала.'][n%3];}
const ROWS=['йцукенгшщзхъ','фывапролджэ','ячсмитьбю'];
/* клавиши ПК по месту (латинская раскладка тоже работает) */
const CODE={KeyQ:'й',KeyW:'ц',KeyE:'у',KeyR:'к',KeyT:'е',KeyY:'н',KeyU:'г',KeyI:'ш',KeyO:'щ',KeyP:'з',BracketLeft:'х',BracketRight:'ъ',KeyA:'ф',KeyS:'ы',KeyD:'в',KeyF:'а',KeyG:'п',
  KeyH:'р',KeyJ:'о',KeyK:'л',KeyL:'д',Semicolon:'ж',Quote:'э',KeyZ:'я',KeyX:'ч',KeyC:'с',KeyV:'м',KeyB:'и',KeyN:'т',KeyM:'ь',Comma:'б',Period:'ю',Backquote:'е'};
function shareText(L,rows,won,day){const d=new Date(Date.UTC(Math.floor(day/1e4),Math.floor(day/100)%100-1,day%100));
  const dd=('0'+d.getUTCDate()).slice(-2)+'.'+('0'+(d.getUTCMonth()+1)).slice(-2);
  const r=(window.ZBWD&&ZBWD.cur)?ZBWD.cur(ID):0;
  return 'Баба Зина загадала слово · '+dd+' · '+(won?rows.length:'✕')+'/'+TRIES+'\n'+rows.map(x=>x.map(v=>v===2?'🟩':v===1?'🟨':'⬜').join('')).join('\n')+(r>1?'\nСерия 🔥'+r:'')+'\nА ты угадаешь?';}
/* карточка Дома: «Похвастаться» без открытия игры */
function shareToday(){if(!D())return false;/* fix2410: данных слова нет — пусть откроется игра */const m=S.zmg&&S.zmg.m&&S.zmg.m[ID];if(!m||+m.k!==tk()||!m.e)return false;const a=wordOf(dn(tk()));
  const rows=String(m.g||'').split(',').filter(Boolean).map(g=>score(g,a));if(window.ZBWD)ZBWD.share(shareText(a.length,rows,+m.e===1,tk()),ID);return true;}
let SIM5=null;
ZMG_REG({a:'Угадай слово дня за 6 попыток: зелёная — буква на месте, жёлтая — есть в слове',ns:'Загадала слово на весь подъезд. Шесть попыток — и ни одной подсказки от Гали!',/* zb2-MERGE: правило и «Новая затея!» (просьба MGR) */id:ID,finWho:'zina',deps:['js/zmg-zagadala-data.js','js/zb2-wordday-x.js'],src:'wd',shareToday,
  open:()=>true,
  want(r){const E=window.ZBECO,w=E&&E.wd&&E.wd.win||[0,10,10,8,6,5,4],n=TRIES+1-(r.score|0);return r.score>0?(w[n]|0):0;},
  lines:{good:'Вот это голова! Завтра загадаю потруднее.',ok:'Угадал! Пусть и не сразу — главное, что угадал.',bad:'Ничего, завтра новое загадаю. Ять, не хихикай.'},
  /* бот баланса: каждый ход — слово, согласное со всеми подсказками (с вероятностью k), иначе — случайное */
  sim(o,k){const Z=window.ZMG_ZAGADALA;if(!Z)return {sc:0,st:0};if(!SIM5)SIM5=Z.a5.split(' ');const L=SIM5,a=L[Math.floor(o.rnd()*L.length)];let C=L.slice();
    for(let n=1;n<=TRIES;n++){const g=o.rnd()<k?C[Math.floor(o.rnd()*C.length)]:L[Math.floor(o.rnd()*L.length)];if(g===a)return {sc:TRIES+1-n,st:tierOf(true,n)};
      const r=score(g,a).join('');C=C.filter(w=>score(g,w).join('')===r);if(!C.length)C=[a];}
    return {sc:0,st:0};},
  run(host,o){const Z=D();if(!Z){host.quit();return;}
    const mem=host.mem(),today=tk(),dToday=dn(today);
    if(+mem.k!==today){mem.k=today;mem.g='';mem.e=0;}
    const todayDone=!!+mem.e;
    /* тренировка, а сегодняшнее не разгадано — играем сегодняшнее с наградой */
    if(o.train&&!todayDone&&!o.ctx.arch){host.quit();setTimeout(()=>{try{ZMG.open(ID,{mode:'home',back:()=>{try{ZB.refresh();}catch(e){}}});}catch(e){}},30);return;}
    const arch=todayDone&&(o.train||o.mode!=='home')||!!o.ctx.arch;
    let day=dToday;if(arch){day=dToday-1-Math.floor(o.rnd()*Math.min(120,Math.max(1,dToday)));}
    const ans=wordOf(day),L=ans.length;
    const showOnly=todayDone&&!arch;   // сегодня уже всё — показать итог дня и «Похвастаться»
    const G=arch?[]:String(mem.g||'').split(',').filter(Boolean).filter(w=>w.length===L).slice(0,TRIES+1);
    let MT=G.length>TRIES||+mem.x===today?TRIES+1:TRIES;   /* Z3-PAPER 25.10: 7-я попытка за рекламу (починка по PUZ) */
    let cur='',fin=false,busy=false;const kst={};
    host.el.innerHTML='<div class="zmw-wrap"><div class="zmw-sheet"><div class="zmw-grid" style="--n:'+L+'"></div></div><div class="zmw-say"></div><div class="zmw-kb"></div></div>';
    const $=s=>host.el.querySelector(s),grid=$('.zmw-grid'),sayEl=$('.zmw-say'),kb=$('.zmw-kb');
    let h='';for(let r=0;r<MT;r++){h+='<div class="zmw-row">';for(let i=0;i<L;i++)h+='<span class="zmw-c"><b></b></span>';h+='</div>';}grid.innerHTML=h;
    let kh='';ROWS.forEach((row,ri)=>{kh+='<div class="zmw-kr">';if(ri===2)kh+='<button class="zmw-k zmw-kx" data-k="⌫" aria-label="Стереть">⌫</button>';
      for(const c of row)kh+='<button class="zmw-k" data-k="'+c+'">'+c+'</button>';if(ri===2)kh+='<button class="zmw-k zmw-ko" data-k="ok">'+(host.pc?'Enter':'✔')+'</button>';kh+='</div>';});
    kb.innerHTML=kh;
    const cells=r=>grid.children[r].children;
    function fit(){const w=host.w,hh=host.h,kbH=kb.offsetHeight||150,sh=sayEl.offsetHeight||48;
      const cs=Math.max(30,Math.min(58,Math.floor((Math.min(w,460)-28-(L-1)*6)/L),Math.floor((hh-kbH-sh-34-(MT-1)*6)/MT)));
      grid.style.setProperty('--cs',cs+'px');}
    host.onResize(fit);
    function say(t,m){sayEl.innerHTML=host.say('zina',t,m||'norm');}
    function paintRow(r,g,res,anim){const c=cells(r);for(let i=0;i<L;i++){c[i].firstChild.textContent=g[i]||'';c[i].className='zmw-c'+(g[i]?' f':'')+(res?' s'+res[i]:'');
        if(res&&anim)c[i].style.animationDelay=(i*.12)+'s';}}
    function paintCur(){const r=G.length;if(r>=MT)return;paintRow(r,cur,null);const c=cells(r);for(let i=0;i<L;i++)c[i].classList.toggle('cur',i===cur.length);}
    function paintKeys(){[].forEach.call(kb.querySelectorAll('.zmw-k[data-k]'),b=>{const v=kst[b.dataset.k];b.classList.remove('s0','s1','s2');if(v!=null)b.classList.add('s'+v);});}
    function mark(g,res){for(let i=0;i<L;i++){const c=g[i],v=res[i];kst[c]=Math.max(kst[c]==null?-1:kst[c],v);}}
    const rows=[];
    G.forEach((g,r)=>{const res=score(g,ans);rows.push(res);paintRow(r,g,res,false);mark(g,res);});paintKeys();
    function shake(){const row=grid.children[G.length];if(!row)return;row.classList.remove('bad');void row.offsetWidth;row.classList.add('bad');}
    function key(k){if(fin||busy||showOnly)return;
      if(k==='⌫'){cur=cur.slice(0,-1);paintCur();return;}
      if(k==='ok'){submit();return;}
      if(cur.length<L&&/^[а-я]$/.test(k)){cur+=k;try{host.snd.tap();}catch(e){}paintCur();}}
    function submit(){if(cur.length<L){shake();say('Нужно '+L+' букв — в клеточку, по одной.');return;}
      const g=cur;if(!okWord(g)){shake();let why='';try{why=typeof whyNot==='function'?whyNot(g):'';}catch(e){}
        say(WHY[why]||'Такого слова у меня в тетради нет. Попробуй другое — попытка не сгорела.','sad');try{host.snd.bad();}catch(e){}return;}
      if(G.indexOf(g)>=0){shake();say('Это слово уже было — я помню!');return;}
      const res=score(g,ans),r=G.length;G.push(g);rows.push(res);cur='';mark(g,res);
      if(!arch){mem.g=G.join(',');try{if(typeof save==='function')save();}catch(e){}}
      busy=true;paintRow(r,g,res,true);setTimeout(()=>{busy=false;paintKeys();},L*120+350);
      const won=g===ans;
      if(won){try{host.snd.win();}catch(e){}say(WIN[G.length],'happy');end(true);return;}
      try{host.snd.word&&host.snd.word(3,res.filter(x=>x===2).length);}catch(e){}
      if(G.length>=MT){if(MT===TRIES&&!arch&&host.adOk()){offer();return;}say('Слово было «'+ans.toUpperCase()+'». Не беда — завтра новое загадаю!','sad');end(false);return;}
      say(sayFor(res,G.length,L),res.some(x=>x===2)?'happy':'norm');paintCur();}
    /* шесть мимо — седьмая попытка за рекламу (одна; кнопка — zbad zmg-ad, поздний досмотр — host.adNeed) */
    function offer(){const kh0=kb.innerHTML;say('Шесть мимо! Седьмую попытку дам — за рекламу. Или сдаёшься?','norm');
      kb.innerHTML='<div class="zmw-done"><button class="btn green zbad zmg-ad zmw-7">🎬 Ещё попытка за рекламу</button><button class="btn sec zmw-gv">Сдаюсь</button></div>';
      const giveUp=()=>{say('Слово было «'+ans.toUpperCase()+'». Не беда — завтра новое загадаю!','sad');end(false);};
      kb.querySelector('.zmw-gv').onclick=e=>{e.stopPropagation();try{host.snd.tap();}catch(x){}giveUp();};
      kb.querySelector('.zmw-7').onclick=e=>{e.stopPropagation();const b=e.currentTarget;b.disabled=true;
        host.adNeed('try7').then(ok=>{if(fin)return;if(!ok){giveUp();return;}MT=TRIES+1;mem.x=today;try{if(typeof save==='function')save();}catch(x){}
          let r='<div class="zmw-row">';for(let i=0;i<L;i++)r+='<span class="zmw-c"><b></b></span>';grid.insertAdjacentHTML('beforeend',r+'</div>');
          kb.innerHTML=kh0;paintKeys();fit();paintCur();upTop();say('Последняя попытка! Думай, как Галя: она всегда знает заранее.','happy');});};}
    /* «отгадали соседи»: сервер дома (вид 'wd', просьба к SRV) — только живые числа, от 100 человек; без сервера строки нет */
    function hood(won,n){try{if(!window.Z3||!Z3.srv)return;Z3.srv.send('wd',{n:won?n:0});
      Z3.srv.get('wd').then(o=>{if(!o||o._sim||!(+o.all>=100)||!o.n)return;const put=t=>{const p=host.root.querySelector('.zmw-res');if(!p){if(t<20)setTimeout(()=>put(t+1),250);return;}
        const k=won?(+o.n[n-1]||0):0,pc=Math.round(100*k/o.all),d=document.createElement('div');d.className='zmw-sm';
        d.textContent='Сегодня угадали '+(+o.win||0)+' из '+o.all+(won?' · с '+n+'-й попытки — как '+pc+'%':'');p.insertBefore(d,p.firstChild);};put(0);},()=>{});}catch(e){}}
    function end(won){if(fin)return;fin=true;const n=G.length;let sr=null;if(!arch)hood(won,n);
      if(!arch){mem.e=won?1:2;try{if(typeof save==='function')save();}catch(e){}
        if(window.ZBWD)sr=won?ZBWD.win(ID,n):(ZBWD.lose(ID),null);}
      setTimeout(()=>{host.finish({sc:won?Math.max(1,TRIES+1-n):0,st:tierOf(won,n),label:won?'Угадано с '+n+'-й попытки: «'+ans.toUpperCase()+'»':'Слово было: «'+ans.toUpperCase()+'»'});
        if(!arch)setTimeout(()=>extra(won,sr),30);},L*120+900);}
    /* дорисовать окно итога: серия, значок, 💡, «Похвастаться», «новое через N ч» */
    function extra(won,sr){const p=host.root.querySelector('.zmg-res .zmg-panel');if(!p)return;const bt=p.querySelector('.zmg-btns');
      const d=document.createElement('div');d.className='zmw-res';let t='';
      if(sr&&sr.r)t+='<div class="zmw-sr">Серия 🔥'+sr.r+(sr.r===sr.b&&sr.r>1?' — рекорд!':'')+'</div>';
      if(sr&&sr.sh)t+='<div class="zmw-sm">📋 Справка от врача: вчерашний пропуск прощён (раз в неделю)</div>';
      if(sr&&sr.bg&&sr.bg.length)t+='<div class="zmw-sm">🏅 Значок «'+sr.bg[sr.bg.length-1]+' '+(typeof plural==='function'?plural(sr.bg[sr.bg.length-1],'день','дня','дней'):'дней')+' подряд»</div>';
      if(sr&&sr.hb)t+='<div class="zmw-sm">💡 Неделя подряд — подсказка в запас!</div>';
      t+='<div class="zmw-sm">Новое слово через '+(window.ZBWD?ZBWD.hoursLeft():8)+' ч</div>';
      t+='<button class="btn zmw-sh">'+(isVK()?'📣 Похвастаться':'📋 Похвастаться')+'</button>';
      d.innerHTML=t;p.insertBefore(d,bt);d.querySelector('.zmw-sh').onclick=()=>{try{host.snd.tap();}catch(e){}doShare();};}
    const isVK=()=>typeof PLAT!=='undefined'&&PLAT==='vk'&&!(typeof OK!=='undefined'&&OK);
    function doShare(){if(window.ZBWD)ZBWD.share(shareText(L,rows,G[G.length-1]===ans,today),ID);}
    /* сегодня уже разгадано: показать сетку и «Похвастаться» */
    if(showOnly){const won=+mem.e===1;say(won?'Сегодняшнее уже разгадано! Новое — через '+(window.ZBWD?ZBWD.hoursLeft():8)+' ч.':'Сегодня было «'+ans.toUpperCase()+'». Завтра — новое!',won?'happy':'norm');
      kb.innerHTML='<div class="zmw-done"><button class="btn green zmw-sh">'+(isVK()?'📣 Похвастаться':'📋 Похвастаться')+'</button><button class="btn sec zmw-ar">Слово из архива</button><button class="btn sec zmw-q">Готово</button></div>';
      kb.querySelector('.zmw-sh').onclick=()=>{try{host.snd.tap();}catch(e){}doShare();};
      kb.querySelector('.zmw-ar').onclick=()=>{try{host.snd.tap();}catch(e){}host.quit();setTimeout(()=>{try{ZMG.open(ID,{mode:'cab',train:true,ctx:{arch:1}});}catch(e){}},30);};
      kb.querySelector('.zmw-q').onclick=()=>{try{host.snd.tap();}catch(e){}host.quit();};
      host.keys(k=>{if(k==='Enter'){doShare();return true;}return false;});fit();host.top(won?'угадано':'');return;}
    kb.addEventListener('click',e=>{const b=e.target.closest('.zmw-k');if(!b)return;key(b.dataset.k);});
    host.keys((k,e)=>{if(k==='Enter'){key('ok');return true;}if(k==='Backspace'){key('⌫');return true;}
      let c=nrm(k);if(!/^[а-я]$/.test(c))c=e&&CODE[e.code]||'';if(c){key(c==='ё'?'е':c);return true;}return false;});
    const upTop=()=>host.top(arch?'архив':(MT-G.length)+' из '+MT);
    const kOrig=key;
    /* бот стенда: набирает слово, согласное с подсказками (k — доля «умных» ходов) */
    host.bot=k=>{if(fin||busy)return;if(cur.length){cur='';paintCur();}const P=D().a5.split(' ').concat(D().a6.split(' ')).filter(w=>w.length===L);
      let C=P.filter(w=>G.every((g,i)=>score(g,w).join('')===rows[i].join('')));if(!C.length)C=[ans];
      const w=Math.random()<k?C[Math.floor(Math.random()*C.length)]:P[Math.floor(Math.random()*P.length)];for(const c of w)kOrig(c);kOrig('ok');upTop();};
    kb.addEventListener('click',upTop);host.keys(()=>{setTimeout(upTop,0);return false;});
    const intro=arch?'Слово из архива — '+L+' букв. Тренировка: без серии и наград, зато для ума полезно!':
      G.length?'Продолжаем! Осталось '+(MT-G.length)+' '+(typeof plural==='function'?plural(MT-G.length,'попытка','попытки','попыток'):'попыток')+'.':
      'Я загадала слово из <b>'+L+' букв</b> — одно на весь подъезд! У тебя <b>6 попыток</b>. Подчеркну зелёным — буква на месте, жёлтым — есть, но не тут, зачеркну — нет совсем.';
    host.intro({who:'zina',text:intro,btn:G.length?'Дальше':'Угадывать!',hint:(L===6?'сегодня воскресенье — слово длиннее · ':'')+'несуществующее слово попыткой не считается'+(host.pc?' · печатай с клавиатуры':'')}).then(()=>{
      say(G.length?sayFor(rows[rows.length-1],G.length,L):'Ну-ка, первое слово — любое из '+L+' букв.');paintCur();upTop();fit();setTimeout(fit,50);});}});
(function(){if(document.getElementById('zmw-kb-css'))return;const st=document.createElement('style');st.id='zmw-kb-css';st.textContent=
'.zmw-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;padding:6px 8px 8px;min-height:0;box-sizing:border-box;gap:6px}'+
'.zmw-kb{width:100%;max-width:520px;display:flex;flex-direction:column;gap:5px;margin-top:auto}.zmw-kr{display:flex;gap:4px;justify-content:center}'+
'.zmw-k{flex:1 1 0;min-width:0;height:46px;padding:0;border:0;border-radius:7px;background:#e7e2d6;color:#2b2b2b;font:700 17px/1 var(--font,Arial);text-transform:uppercase;cursor:pointer;box-shadow:0 2px 0 rgba(0,0,0,.15)}'+
'.zmw-k:active{transform:translateY(1px)}.zmw-k.s2{background:#5fae5d;color:#fff}.zmw-k.s1{background:#e7c23a;color:#2b2b2b}.zmw-k.s0{background:#b9b2a5;color:#6f685c}'+
'@keyframes zmwIn{0%{transform:scale(.85)}60%{transform:scale(1.08)}100%{transform:none}}@keyframes zmwSh{0%,100%{transform:none}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}'+
'.zmw-res{margin:6px 0 4px}.zmw-sr{font:800 20px/1.3 var(--font,Arial);color:#c2410c}.zmw-sm{font-size:14px;color:#6b5a3e;margin:3px 0}.zmw-res .btn{margin:8px auto 0;min-height:46px}';
document.head.appendChild(st);})();   // общие стили MGW (одинаковые в zagadala/muha — грузится любая первой)
(function(){if(document.getElementById('zmw-z-css'))return;const st=document.createElement('style');st.id='zmw-z-css';st.textContent=
'.zmw-sheet{background:#fff linear-gradient(#e3edf7 1px,transparent 1px) 0 0/14px 14px,linear-gradient(90deg,#e3edf7 1px,transparent 1px) 0 0/14px 14px;background-color:#fff;'+
'border-radius:10px;padding:8px 10px;box-shadow:0 2px 8px rgba(40,40,60,.15);border-left:3px solid #e9a3a3}'+
'.zmw-grid{--cs:48px;display:flex;flex-direction:column;gap:6px}.zmw-row{display:flex;gap:6px;justify-content:center}.zmw-row.bad{animation:zmwSh .35s}'+
'.zmw-c{position:relative;width:var(--cs);height:var(--cs);border:2px solid #b7c8da;border-radius:6px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;'+
'font:700 calc(var(--cs)*.56)/1 "Comic Sans MS","Segoe Print","Trebuchet MS",cursive;color:#22324a;text-transform:uppercase;background:rgba(255,255,255,.7)}'+
'.zmw-c.f{border-color:#7f97b2}.zmw-c.cur{border-color:#2563c9;box-shadow:0 0 0 2px rgba(37,99,201,.25)}'+
'.zmw-c.s0,.zmw-c.s1,.zmw-c.s2{animation:zmwIn .35s both}'+
'.zmw-c.s2{background:#d9f2d6;border-color:#4c9a4b}.zmw-c.s2:after{content:"";position:absolute;left:10%;right:10%;bottom:8%;height:4px;border-radius:2px;background:#2f8a2d}'+
'.zmw-c.s1{background:#fff3c4;border-color:#d6a700}.zmw-c.s1:after{content:"";position:absolute;left:10%;right:10%;bottom:8%;height:4px;border-radius:2px;background:#d6a700}'+
'.zmw-c.s0{background:#efebe4;border-color:#c9c0b0;color:#8b8172}.zmw-c.s0:after{content:"";position:absolute;left:8%;right:8%;top:48%;height:3px;border-radius:2px;background:#d23b2a;transform:rotate(-12deg)}'+
'.zmw-say{width:100%;max-width:520px;min-height:46px}.zmw-say .zmg-say{margin:0}'+
'.zmw-kx,.zmw-ko{flex:1.5 1 0;font-size:15px;text-transform:none}.zmw-ko{background:#4f9a4d;color:#fff}'+
'.zmw-done{display:flex;flex-direction:column;gap:8px;width:100%;max-width:360px;margin:0 auto}.zmw-done .btn{margin:0;min-height:50px}'+
'@media (prefers-reduced-motion:reduce){.zmw-c.s0,.zmw-c.s1,.zmw-c.s2,.zmw-row.bad{animation:none}}'+
'@media (max-height:600px){.zmw-k{height:40px}.zmw-say{min-height:40px}}';
document.head.appendChild(st);})();
})();
