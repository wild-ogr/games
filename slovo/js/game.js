'use strict';
/* ================= игра: кроссворд + круг букв ================= */
let G=null;
/* экономика (26.09, v1.3): «голодный паёк» — без рекламы ~1 подсказка на 4–5 уровней, реклама за награду заметно выгодна.
   Модель трёх типов игроков — tools/econ.py (поменял числа — поправь и там). Стартовые 50 — freshSave в core.js. Уровень: ECO.lvl, серия дня — ECO.daily, реклама за монеты — ECO.adCoins */
const PRICE={letter:35,word:90};
const JAR_SIZE=15,JAR_PRIZE=10;
const ECO={replay:1,x2min:10,adCoins:20,adCoinsDay:3,test:2, // test — множитель награды за «испытание» (каждый 10-й уровень с 30-го)
  chap:20,                // аудит 14: подарок за пройденную главу (20 уровней), один раз — окно «Глава пройдена!» (openChapFinale)
  freeLetter:1,gift:25,   // отчёт 12: бесплатная буква в день («Ять нашёл», не копится) и подарок дня в меню +25 за рекламу (раз в день)
  lvl:i=>2+Math.min(6,Math.floor((i+20)/40)),          // 2 (ур.1–20), 3 (21–60), 4 (61–100) … до 8
  daily:s=>10+Math.min(Math.max(s-1,0),5)*2};          // задание дня: 10, серия +2 в день, до 20
// «Тетрадь недели» (аудит 14): 5 заданий дня из 7 за неделю — подарок (раз в неделю, S.wk); модель — tools/econ.py
const WEEK={need:5,gift:20};
// «Гостинцы» (boost 02.10): подарок за каждый день захода, без рекламы — повод вернуться завтра. Считаются дни захода (подряд не обязательно),
// круг из 7; на 7-й в первом круге — ещё и блюдце «С голубой каёмочкой» (SKINS, gift:'lg'). S.lg={d:день последнего гостинца,n:сколько всего взято}
const LOGIN=[5,10,10,15,15,20,40],LOGIN_FROM=3; // с 3-го пройденного уровня (первая сессия): сначала игра, потом подарки
const lgN=()=>S.lg&&+S.lg.n||0;
const lgDue=()=>!SHOT&&S.lv>=LOGIN_FROM&&!(S.lg&&+S.lg.d>=todayKey());
const lgTaken=()=>!!(S.lg&&+S.lg.d===todayKey());
const lgAmt=n=>LOGIN[n%LOGIN.length];
const lgItem=n=>n===LOGIN.length-1; // 7-й гостинец первого круга — блюдце
const cellKey=(x,y)=>x+','+y;
// настройки с сервера Яндекса (флаги в консоли разработчика, значения — строки; нет флага — действуют числа выше).
// Рамки жёсткие: флагом нельзя сделать рекламу чаще раза в 150 с, раньше 8-го уровня или сразу после ролика
function applyFlags(f){if(!f||typeof f!=='object')return;const num=(k,a,b)=>{const n=parseInt(f[k],10);return isFinite(n)&&n>=a&&n<=b?n:null;};let n;
  if((n=num('ad_gap',150,600))!==null)AD.gap=n;          // секунд между межэкранными (180)
  if((n=num('ad_after_rew',60,300))!==null)AD.afterRew=n; // секунд без межэкранной после ролика за награду (90)
  if((n=num('ad_min_lv',8,40))!==null)AD.minLv=n;         // с какого уровня межэкранная (8)
  if((n=num('price_letter',20,50))!==null)PRICE.letter=n; // 35
  if((n=num('price_word',60,150))!==null)PRICE.word=n;    // 90
  if((n=num('ad_coins',10,40))!==null)ECO.adCoins=n;      // монеты за ролик в «Обликах» (20)
  if((n=num('x2_min',5,30))!==null)ECO.x2min=n;           // «Ещё +N за рекламу» после уровня — не меньше (10)
  if((n=num('gift',10,50))!==null)ECO.gift=n;             // подарок дня (25)
  if((n=num('free_letter',0,2))!==null)ECO.freeLetter=n;  // бесплатных букв в день (1)
  if(G&&!G.won)updPrices();if(typeof updGift==='function')updGift();}
// бесплатная буква дня: сколько осталось сегодня (день — по часам сервера, nowMs)
function freeLeft(){const d=todayKey();return Math.max(0,ECO.freeLetter-(S.fl&&S.fl.d===d?+S.fl.n||0:0));}
function useFree(){const d=todayKey();if(!S.fl||S.fl.d!==d)S.fl={d,n:0};S.fl.n++;save();}

function levelData(idx,daily){return daily?DAILY[idx%DAILY.length]:LEVELS[idx%LEVELS.length];}
function levelKey(idx,daily){return daily?'D'+todayKey():'L'+idx;}
// ритм (tools/build.py, rhythm/gifts): 5-й в десятке — «передышка» (одно слово открыто), 10-й с 30-го — «испытание» (награда ×2)
const isTest=(idx,daily)=>!daily&&idx>=29&&idx%10===9;
const isRest=(idx,daily)=>!daily&&idx%10===4;
function todayKey(){const d=new Date(nowMs());return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function dayNum(){const t=nowMs();return Math.floor((t-new Date(t).getTimezoneOffset()*60000)/86400000);}

function startLevel(idx,daily){
  const lv=levelData(idx,daily),key=levelKey(idx,daily);
  G={idx,daily:!!daily,lv,key,words:lv.w.map(([w,x,y,d])=>({w,x,y,d,found:false})),cells:new Map(),bonus:new Set(),
     letters:lv.l.split(''),sel:[],newDefs:[],combo:0,miss:0,won:false,idleT:0,idleN:0,hintMode:false,hinted:false,tut:!daily&&idx===0&&!S.tip.tut,
     rank0:typeof rankName==='function'?rankName(wordsTotal()):''};
  for(const wd of G.words)for(let i=0;i<wd.w.length;i++){const x=wd.x+(wd.d?0:i),y=wd.y+(wd.d?i:0),k=cellKey(x,y);
    if(!G.cells.has(k))G.cells.set(k,{x,y,ch:wd.w[i],open:false,el:null});}
  // восстановить незаконченный уровень
  const cur=S.curs[key];
  if(cur){
    (cur.open||[]).forEach(k=>{const c=G.cells.get(k);if(c)c.open=true;});
    (cur.bonus||[]).forEach(w=>G.bonus.add(w));
    if(cur.order&&cur.order.length===G.letters.length)G.letters=cur.order.split('');
    G.words.forEach(wd=>{if(wordCells(wd).every(c=>c.open))wd.found=true;});
    G.hinted=!!cur.hinted;cur.t=Date.now();
  }else{
    // новый заход: клетки-подарки из сборки (передышка, редкое слово, трудная основа) открыты сразу — это не подсказка
    (lv.o||[]).forEach(k=>{const c=G.cells.get(k);if(c){c.open=true;c.gift=true;}});
    G.words.forEach(wd=>{if(wordCells(wd).every(c=>c.open))wd.found=true;});G.giftN=(lv.o||[]).length;
    S.curs[key]={open:[...G.cells].filter(([k,c])=>c.open).map(([k])=>k),bonus:[],t:Date.now()};trimCurs();save();}
  show('game');STAT.once('ready',{ms:Math.round(performance.now())});STAT.lvl(idx+1,daily?'daily':'');
  if(G.tut)STAT.ev('tut',{s:2}); // обучение: первый уровень начат
  const ch=chapOf(idx);
  $('gTitle').textContent=daily?'Задание дня':'Уровень '+(idx+1);
  const sd=daily?['🔥','Серия: '+(S.streak||0)+' '+plural(S.streak||0,'день','дня','дней'),' '+(S.streak||0)]:isTest(idx)?['⚡',' Испытание ×2',' ×2']:[ch.e,' '+ch.n,''];
  const gs=$('gSub');gs.textContent='';gs.dataset.full=daily?sd[1]:sd[0]+sd[1];gs.dataset.short=sd[0]+sd[2];fitSub();
  G.half=G.words.filter(w=>w.found).length*2>=G.words.length;updCount();
  G.rid=riddleOf(G);
  zinaFace('norm');
  drawLine();stopTutorial();
  buildGrid();buildWheel();updJar();updPrices();updCoins();
  if(G.rid)wordCells(G.rid).forEach(c=>c.el.classList.add('rid'));
  const first=!daily&&idx%CH_LEN===0&&!S.curs[key].greeted;
  if(G.tut)zina((TOUCH?'Проведи пальцем по буквам':'Нажми на букву и веди мышкой по буквам')+', чтобы составить слово. Попробуй: «'+shortestWord().toUpperCase()+'»!','happy',99);
  else if(daily)zina(say('daily'),'happy');
  else if(first){zina('Глава «'+ch.n+'». '+ch.s,'happy',6);S.curs[key].greeted=1;save();}
  else if(!daily&&idx===1&&!S.tip.btns)explainButtons();
  else if(isTest(idx,daily)&&!cur)zina('Испытание! Уровень потруднее, зато монет — вдвое больше.','wow',5);
  else if(isRest(idx,daily)&&!cur&&G.giftN)zina('Передышка! Одно слово я уже открыла — отдохни немножко.','happy',5);
  else if(G.giftN&&!cur)zina('Слово тут хитрое — одну букву я открыла. Не благодари.','happy',4.5);
  else if(G.rid)riddleSay(8);
  else if(!daily&&idx>=2&&!S.tip.fl&&freeLeft()){S.tip.fl=1;save();glowHint();zina('Ять опять под диваном букву нашёл! Одна подсказка 💡 в день — даром.','happy',6);}
  else if(!daily&&idx>=3&&!S.tip.def){S.tip.def=1;save();zina('Незнакомое слово? Разгадаешь — нажми на него в кроссворде, расскажу, что это такое.','happy',7);}
  else zina(say('start'),'norm',3);
  if(G.tut)startTutorial();
  YG.start();
}
function shortestWord(){return G.words.slice().sort((a,b)=>a.w.length-b.w.length)[0].w;}
function wordCells(wd){const r=[];for(let i=0;i<wd.w.length;i++)r.push(G.cells.get(cellKey(wd.x+(wd.d?0:i),wd.y+(wd.d?i:0))));return r;}
function saveCur(){if(!G||G.won||SHOT)return;const o=S.curs[G.key]||{};
  S.curs[G.key]={open:[...G.cells].filter(([k,c])=>c.open).map(([k])=>k),bonus:[...G.bonus],order:G.letters.join(''),greeted:o.greeted,hinted:G.hinted?1:0,t:Date.now()};trimCurs();save();}
// незаконченные уровни храним по ключу: 5 последних обычных + сегодняшнее задание дня (старые дневные — не нужны)
function trimCurs(){const tk='D'+todayKey(),ks=Object.keys(S.curs);
  ks.forEach(k=>{if(k[0]==='D'&&k!==tk&&!(G&&G.key===k))delete S.curs[k];}); // задание, начатое до полуночи, не стираем, пока его решают (аудит 18)
  ks.filter(k=>k[0]==='L'&&S.curs[k]).sort((a,b)=>(S.curs[b].t||0)-(S.curs[a].t||0)).slice(5).forEach(k=>delete S.curs[k]);}
// шапка уровня на узком экране (360): не обрезаем главу многоточием («💰 …»), а оставляем только значок (аудит 18, UX п. 8)
function fitSub(){const e=$('gSub');if(!e||!e.dataset.full)return;e.textContent=e.dataset.full;e.title=e.dataset.full;
  if(e.scrollWidth>e.clientWidth+1)e.textContent=e.dataset.short;}
// «Слов: 2 из 5» в шапке уровня
function updCount(){if(!G)return;const n=G.words.filter(w=>w.found).length;$('gCnt').textContent='Слов: '+n+' из '+G.words.length;fitSub();}

/* ---------- кроссворд ---------- */
function buildGrid(){
  const grid=$('grid');grid.innerHTML='';
  for(const c of G.cells.values()){const e=document.createElement('div');e.className='cell'+(c.open?' open':'')+(c.gift?' gift':'');e.textContent=c.open?c.ch:'';c.el=e;grid.appendChild(e);}
  layoutGrid();
}
function layoutGrid(){
  if(!G)return;const b=$('board'),[gw,gh]=G.lv.g;
  const bw=b.clientWidth-20,bh=b.clientHeight-12,big=!!S.big;
  const csOf=h=>Math.max(Math.min(26,Math.floor(bw/gw)),Math.min(Math.floor(bw/gw),Math.floor(h/gh),($('app').clientHeight>=780?74:62)*(big?1.15:1)|0));
  // низкий экран (≤700): реплика бабы Зины лежит поверх верха поля — оставляем под неё место сверху (аудит 14: закрывала верхний ряд).
  // Клетки ради этого уменьшаем, только если они останутся не мельче 30 px; иначе отдаём сверху сколько есть свободного
  let cs=csOf(bh),pad=0;
  if(isSmallH()){const R=clamp(Math.round($('zSay').getBoundingClientRect().top+52-b.getBoundingClientRect().top),0,90);
    const c2=csOf(bh-R);if(c2>=Math.min(cs,30))cs=c2;pad=clamp(bh-gh*cs,0,R);}
  b.style.paddingTop=6+pad+'px';
  const gap=Math.max(2,Math.round(cs*.08));
  const grid=$('grid');grid.style.width=gw*cs+'px';grid.style.height=gh*cs+'px';
  for(const c of G.cells.values()){const s=c.el.style;s.left=c.x*cs+'px';s.top=c.y*cs+'px';s.width=s.height=(cs-gap)+'px';s.fontSize=Math.round(cs*(big?.64:.56))+'px';s.borderRadius=Math.round(cs*.2)+'px';}
}
function openCell(c,delay,cls){
  if(c.open)return;c.open=true;
  setTimeout(()=>{c.el.textContent=c.ch;c.el.classList.add('open','pop');if(cls)c.el.classList.add(cls);setTimeout(()=>c.el.classList.remove('pop'),400);},delay||0);
}

/* ---------- круг букв ---------- */
let WH={D:260,R:90,ls:60,pts:[]};
function buildWheel(){
  const wh=$('wheel');wh.querySelectorAll('.let').forEach(e=>e.remove());
  applySkin(wh,S.skin);
  G.letters.forEach((ch,i)=>{const e=document.createElement('div');e.className='let';e.textContent=ch;e.dataset.i=i;wh.appendChild(e);});
  layoutWheel();
}
function layoutWheel(){
  if(!G)return;const wide=WIDE(),W=Math.min($('board').clientWidth||$('app').clientWidth,wide?640:9999),H=$('app').clientHeight,[gw,gh]=G.lv.g;
  // круг букв уступает место кроссворду: клетки хотим не мельче ~36 px (на низком экране — сначала уменьшаем круг)
  // «Крупные буквы» (S.big): клетки хотим ~на 15 % крупнее, круг чуть меньше, но буквы в нём крупнее
  // круг уменьшаем, только если кроссворд упирается в высоту: если в ширину — клетки всё равно не вырастут (тогда крупнее только буквы)
  const small=H<=700||wide,fixed=(small?52:120)+Math.round(clamp(H*.06,38,50))+34,cell=Math.min(36,Math.floor((W-20)/gw));
  const room=H-fixed-gh*cell-18;
  const n=G.letters.length,dmin0=n>=7&&H>=680?190:small?172:180;
  const D0=Math.round(clamp(Math.min(W-150,H*.33,room),dmin0,wide&&H>=900?350:300));
  const big=!!S.big&&(H-fixed-60-D0)/gh<(W-20)/gw;
  const D=big?Math.round(clamp(D0*.92,dmin0-10,280)):D0;
  const bigL=!!S.big&&(n<=6||D>=210),ls=Math.round(D*(n<=5?.27:n<=6?.25:n<=7?.225:.205)*(bigL?1.08:1)),R=D/2-ls*.62-8;
  const wh=$('wheel');wh.style.width=wh.style.height=D+'px';
  WH={D,R,ls,pts:[],els:[...wh.querySelectorAll('.let')],rect:null};
  wh.querySelectorAll('.let').forEach((e,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;const x=D/2+Math.cos(a)*R,y=D/2+Math.sin(a)*R;WH.pts[i]=[x,y];
    e.style.width=e.style.height=ls+'px';e.style.left=(x-ls/2)+'px';e.style.top=(y-ls/2)+'px';e.style.fontSize=Math.round(ls*(S.big?.68:.62))+'px';});
  $('wline').setAttribute('viewBox','0 0 '+D+' '+D);
  $('preview').style.height=Math.round(clamp(H*.06,38,50))+'px';
  layoutGrid();
}
function wheelRect(){return WH.rect||(WH.rect=$('wheel').getBoundingClientRect());}
function letterAt(px,py){const r=wheelRect(),x=px-r.left,y=py-r.top;
  for(let i=0;i<WH.pts.length;i++){const [lx,ly]=WH.pts[i];if(Math.hypot(lx-x,ly-y)<WH.ls*.62)return i;}return -1;}
let wPoly=null;
function drawLine(px,py){
  const sv=$('wline');if(!wPoly||wPoly.parentNode!==sv){sv.textContent='';wPoly=document.createElementNS('http://www.w3.org/2000/svg','polyline');
    wPoly.setAttribute('fill','none');wPoly.setAttribute('stroke-linecap','round');wPoly.setAttribute('stroke-linejoin','round');wPoly.setAttribute('opacity','.85');sv.appendChild(wPoly);}
  const pts=G?G.sel.map(i=>WH.pts[i]):[];
  if(px!=null&&pts.length){const r=wheelRect();pts.push([px-r.left,py-r.top]);}
  if(pts.length>1){wPoly.setAttribute('points',pts.map(p=>p.join(',')).join(' '));wPoly.setAttribute('stroke',skinOf(S.skin).line);wPoly.setAttribute('stroke-width',Math.round(WH.ls*.22));wPoly.style.display='';}
  else wPoly.style.display='none';
}
function updSel(){
  (WH.els||[]).forEach((e,i)=>e.classList.toggle('on',G.sel.includes(i)));
  const w=$('preview').firstElementChild;w.className='w';w.textContent=G.sel.map(i=>G.letters[i]).join('');
  if(!G.sel.length)G.tap=false;
  $('preview').classList.toggle('tap',!!G.tap&&G.sel.length>0); // ✔ и ✕ рядом со словом — только при вводе нажатиями
}
function selAdd(i){
  if(i<0)return;const s=G.sel;
  if(s.length>1&&s[s.length-2]===i){s.pop();SND.letter(s.length-1);updSel();return;}
  if(s.includes(i))return;s.push(i);SND.letter(s.length-1);updSel();
}
let dragging=false;
// ввод нажатиями (аудит 14: 45+ часто тыкают в буквы по одной): одно нажатие без протягивания — буква остаётся выбранной,
// следующие нажатия добавляют буквы (нажатие на последнюю — убрать её), ✔ или нажатие на слово — проверить, ✕ — стереть
function wheelDown(e){if(!G||G.won||G.hintMode)return;const i=letterAt(e.clientX,e.clientY);if(i<0)return;
  ac();WH.rect=null;poke();e.preventDefault();
  if(G.tap&&G.sel.length){const s=G.sel;
    if(s[s.length-1]===i){s.pop();SND.letter(Math.max(0,s.length-1));}else if(!s.includes(i)){s.push(i);SND.letter(s.length-1);}
    updSel();drawLine();return;}
  if(isSmallH())zinaHide(true); // низкий экран: реплика поверх кроссворда — убираем, как только палец коснулся круга
  dragging=true;G.sel=[];selAdd(i);drawLine(e.clientX,e.clientY);try{$('wheel').setPointerCapture(e.pointerId);}catch(_){}}
// движение пальца: событий бывает до 120 в секунду — обрабатываем последнее, раз в кадр
let wmE=null,wmRaf=0;
function wheelMove(e){if(!dragging)return;wmE={x:e.clientX,y:e.clientY};if(!wmRaf)wmRaf=requestAnimationFrame(wheelMoveNow);}
function wheelMoveNow(){wmRaf=0;if(!dragging||!wmE)return;selAdd(letterAt(wmE.x,wmE.y));drawLine(wmE.x,wmE.y);}
function wheelUp(e){if(!dragging)return;if(e&&e.clientX!=null){wmE={x:e.clientX,y:e.clientY};wheelMoveNow();}dragging=false;
  if(G.sel.length===1){G.tap=true;updSel();drawLine();tapTip();return;} // одна буква — это нажатие: ждём следующие
  const w=G.sel.map(i=>G.letters[i]).join('');G.sel=[];G.tap=false;drawLine();
  (WH.els||[]).forEach(e=>e.classList.remove('on'));updSel();$('preview').firstElementChild.textContent=w;submit(w);}
function tapSubmit(){if(!G||G.won||!G.sel.length)return;poke();const w=G.sel.map(i=>G.letters[i]).join('');G.sel=[];G.tap=false;drawLine();updSel();
  $('preview').firstElementChild.textContent=w;submit(w);}
function tapClear(){if(!G)return;SND.tap();G.sel=[];G.tap=false;drawLine();updSel();}
// первый раз: объяснить оба способа (раз за игру; на 1-м уровне — вместе с обучением)
function tapTip(){if(S.tip.tap)return;S.tip.tap=1;save();
  zina('Можно и нажимать: буквы по очереди, потом ✔. А можно вести пальцем по буквам, как ручкой по тетради, — так быстрее!','happy',7);}
// компьютер (boost 02.10): окно шире 860 — две колонки, слева крупная баба Зина с репликой, справа кроссворд и круг (стили — index.html)
const WIDE=()=>$('app').clientWidth>=860;
const isSmallH=()=>$('app').clientHeight<=700&&!WIDE();

/* ---------- проверка слова ---------- */
function flashPreview(w,cls){const el=$('preview').firstElementChild;el.textContent=w;el.className='w '+cls;
  clearTimeout(flashPreview._t);flashPreview._t=setTimeout(()=>{el.className='w';el.textContent='';},cls==='bad'||cls==='old'?1200:900);}
function submit(w){
  if(!w)return;if(w.length<2){$('preview').firstElementChild.textContent='';return;}
  if(w.length<3){flashPreview(w,'bad');SND.bad();zina(say('short'),'stern');return;}
  const wd=G.words.find(x=>x.w===w);
  if(wd){
    if(wd.found){flashPreview(w,'old');SND.old();zina(say('old'),'stern');highlightWord(wd);return;}
    foundWord(wd,false);return;
  }
  // словарь не догрузился (плохая сеть) — не «не знаю», а просим повторить; в промахи не считаем (аудит 18)
  if(!dictReady()){ensureDict();flashPreview(w,'old');zina('Погоди, тетрадку со словами ищу… Скажи это слово ещё раз чуть позже.','norm');return;}
  if(isWord(w)){
    if(G.bonus.has(w)){flashPreview(w,'old');SND.old();zina(say('old'),'stern');return;}
    G.bonus.add(w);const nd=collectDef(w);S.bonusAll=(S.bonusAll||0)+1;S.jar=(S.jar||0)+1;flashPreview(w+(nd?' 📖':''),'bonus');SND.bonus();buzz('word');
    flyTo(w,$('hJar'));
    if(S.jar>=JAR_SIZE){S.jar=0;setTimeout(()=>{addCoins(JAR_PRIZE);SND.coin();zina(say('jar')+' +'+JAR_PRIZE,'happy');const hj=$('hJar');hj.classList.remove('glow');void hj.offsetWidth;hj.classList.add('glow');
      if(adsOk()&&G&&!G.won&&!$('modal').classList.contains('on'))jarFull(hj);},500);}
    else zina(say('bonus')+defNote(nd),'happy',nd?4.5:3.2);
    updJar();saveCur();return;
  }
  flashPreview(w,'bad');SND.bad();buzz('bad');G.combo=0;G.miss++;
  // «почти»: игрок назвал форму слова из кроссворда («рога» вместо «рог») или те же буквы в другом порядке — не отказ, а подсказка, куда идти
  const nr=nearWord(w);
  if(nr){if(novice()&&G.miss>=3&&catHelp(true))return;
    zina(nr.an?pick(['Буквы те самые, внучок! Только переставь их по-другому.','Почти! Из этих же букв — другое слово. Переставь!','Тепло! Те же буквы, но в другом порядке.'])
      :novice()?pick(['Почти! Не «'+w+'», а «'+nr.w+'» — попробуй!','Тепло-тепло! Мне нужна начальная форма: не «'+w+'», а «'+nr.w+'».'])
      :pick(['Почти! Это то же слово, только в другой форме. Нужна начальная: «кто? что?» — одно.','Тепло! Слово верное, форма не та. Одну штуку, пожалуйста!']),'happy',novice()?99:5);return;}
  // новичок трижды подряд мимо — кот Ять сам ставит букву (даром, «Отличник» не снимает)
  if(novice()&&G.miss>=3&&catHelp(true))return;
  // «честная учительница»: настоящее слово — объясняем, почему не подходит (js/zina.js), иначе догадка по окончанию; «не знаю» — только для незнакомых
  let why=whyNot(w)||(looksPlural(w)?'plural':looksVerb(w)?'verb':'bad');
  if(why==='bad'&&gibberish(w))why='gib';
  if(G.miss===3){glowHint();if(why==='bad'||why==='gib'){zina(say('badx3'),'norm',4);return;}}
  // первые 5 уровней объяснение висит до следующего слова — чтобы успели прочитать
  zina(say(why),why==='gib'||why==='verb'||why==='rude'?'stern':'norm',why!=='bad'&&why!=='gib'&&!G.daily&&G.idx<5?99:0);
}
// ненайденное слово кроссворда, «почти» названное игроком: форма («рога»→«рог», «окна»→«окно») или перестановка тех же букв (an)
function nearWord(w){const sorted=s=>s.split('').sort().join(''),sw=sorted(w);let an=null;
  for(const g of G.words){if(g.found||g.w===w)continue;const a=g.w,st=a.length>4?a.slice(0,-1):a.length>3&&/[аяоеьй]$/.test(a)?a.slice(0,-1):a;
    if(Math.abs(a.length-w.length)<=2&&w.length>=3&&st.length>=3&&w.startsWith(st)&&w!==a)return {w:a};
    if(!an&&a.length===w.length&&sorted(a)===sw)an={w:a,an:1};}
  return an;}
// «розы», «розу», «розой», «роз» — есть ли в словаре начальная форма
function looksPlural(w){
  const ends=['ами','ями','ов','ев','ей','ой','ей','ом','ем','ам','ям','ах','ях','ую','ы','и','а','я','у','ю','е'];
  const tails=['','а','я','о','е','ь','й','ия','ие'];
  for(const e of ends)if(w.endsWith(e)){const st=w.slice(0,-e.length);
    if(st.length>=3&&(tails.some(t=>isWord(st+t))||isWord(st.slice(0,-1)+'ок')||isWord(st.slice(0,-1)+'ец')))return true;}
  return w.length>=3&&['а','я'].some(t=>isWord(w+t));}
// явная бессмыслица: нет гласных, 4 согласные подряд, одна буква трижды подряд, «ь/ъ/ы» в начале — тут можно и пошутить
function gibberish(w){return !/[аеёиоуыэюя]/.test(w)||/[бвгджзйклмнпрстфхцчшщ]{4}/.test(w)||/(.)\1\1/.test(w)||/^[ьъы]/.test(w)||/[ьъ]{2}/.test(w);}
function looksVerb(w){return /(ть|ти|ться|тся|чь|ешь|ишь|ет|ит|ут|ют|ат|ят|ал|ил|ел|ул|ла|ли)$/.test(w)&&w.length>=4;}
function collectDef(w){if(DEFS[w]&&!S.dict[w]){S.dict[w]=1;G.newDefs.push(w);return true;}return false;}
const DEF_NOTE=' 📖 Про это слово у меня есть запись в словаре!';
// приписку про словарь говорим один раз за уровень, дальше хватает значка 📖 во вспышке
function defNote(nd){if(!nd||G.defNoted)return '';G.defNoted=true;return DEF_NOTE;}
// спорные ответы кроссворда (аудит 18: «старуха», «косяк», «чёрт», «баба») — Зина сама объясняет по-доброму, какое значение имела в виду
const SOFTW={'старуха':'Старуха — это я, что ли? Не обижаюсь: зато опыта у меня — целый сундук!','косяк':'Косяк — это у двери, внучок! И рыба в море косяком ходит.',
  'черт':'Чёрт — из сказки: его кузнец Вакула перехитрил!','баба':'Баба — это я! Баба Зина, прошу любить и жаловать.'};
function foundWord(wd,byHint){
  wd.found=true;const nd=collectDef(wd.w);const cs=wordCells(wd);
  // своё слово: буквы «прыгают» из строки в клетки; подсказка и «меньше движения» — клетки открываются по очереди, как раньше
  if(!byHint)flashPreview(wd.w+(nd?' 📖':''),'ok');
  const land=!byHint&&flyLetters(cs,nd?1.6:0);
  cs.forEach((c,i)=>{const t=land?land[i]:i*70;if(!c.open)openCell(c,t,byHint?'hint':null);else{setTimeout(()=>{c.el.classList.add('flash');setTimeout(()=>c.el.classList.remove('flash'),600);},t);}});
  const left=G.words.filter(w=>!w.found).length,half=!G.half&&(G.words.length-left)*2>=G.words.length&&left>1;if(half)G.half=true;
  if(!byHint){SND.word(wd.w.length,G.combo);S.found=(S.found||0)+1;G.combo++;G.miss=0;
    const long=wd.w.length>=7;buzz(long?'long':'word');if(long)boardStamp(pick(['Молодец!','Пять с плюсом!','Вот это слово!']));
    const note=defNote(nd);
    if(G.tut){STAT.ev('tut',{s:3}); // обучение: первое слово
      zina('Молодец! Засчитываю только предметы — «кто? что?», и по одной штуке: «нос», а не «носы».','happy',7);
      const g=G;setTimeout(()=>{if(G===g&&!g.won)zina('Ищи остальные слова! Сколько осталось — написано сверху.','happy',6);},7000);}
    else if(!left)zina(pick(['Всё! Все слова на месте!','Готово! Кроссворд сдан!','Последнее! Ура!']),'happy',6);
    else if(G.rid===wd)zina(pick(['Загадку отгадал! Ну голова!','Отгадал! Я эту загадку на соседке Гале проверяла — она не смогла.','Правильно! Вот что значит начитанный.']),'wow',4.5);
    else if(SOFTW[wd.w]&&left)zina(SOFTW[wd.w],'happy',5);
    else if(note)zina(say(wd.w.length>=6?'wordLong':'word')+note,'happy',4.5);
    else if(left===1)zina(say('oneLeft'),'wow',3.5);
    else if(half)zina(say('half'),'happy',3.5);
    else if(G.combo===3)zina(say('streak'),'wow');
    else zina(say(wd.w.length>=6?'wordLong':'word'),'happy',3.2);}
  updCount();
  if(G.rid===wd){wordCells(wd).forEach(c=>c.el.classList.remove('rid'));G.rid=null;}
  if(G.tut){G.tut=false;S.tip.tut=1;stopTutorial();}
  saveCur();checkWin();
}
function highlightWord(wd){wordCells(wd).forEach((c,i)=>setTimeout(()=>{c.el.classList.add('flash');setTimeout(()=>c.el.classList.remove('flash'),600);},i*50));}
function checkAutoFound(){for(const wd of G.words)if(!wd.found&&wordCells(wd).every(c=>c.open)){wd.found=true;}updCount();}
function checkWin(){
  checkAutoFound();
  if(G.won||!G.words.every(w=>w.found))return;
  G.won=true;YG.stop();const g=G,res=finishLevel(g);lbSubmit();
  STAT.end('win',{f:res.first?1:0,ex:g.hinted?0:1,bw:g.bonus.size});
  if(res.first&&!g.daily&&(g.idx===0||g.idx===2||g.idx===9))STAT.ev('tut',{s:g.idx===0?4:g.idx===2?5:6}); // первые 10 минут: прошёл 1-й, 3-й, 10-й
  setTimeout(()=>{if(G!==g)return;SND.win();buzz('win');confetti();zinaFace('happy');},450);
  setTimeout(()=>{if(G===g)winModal(g,res);},1300);
}

/* ---------- значение слова по нажатию (boost 02.10) ----------
   Нажал на разгаданное слово в кроссворде — баба Зина говорит, что это: шутку из «Толкового словаря» (DEFS), если она есть,
   иначе короткое настоящее толкование (GLOSS, js/gloss.js ← data/gloss.txt). Клетка на пересечении — слова по очереди. */
function wordInfo(w){const W=((typeof DEFS_YO!=='undefined'&&DEFS_YO[w])||(typeof GLOSS_YO!=='undefined'&&GLOSS_YO[w])||w);
  const nm=W[0].toUpperCase()+W.slice(1);
  if(typeof DEFS!=='undefined'&&DEFS[w])return '📖 '+nm+'. '+DEFS[w];
  if(typeof GLOSS!=='undefined'&&GLOSS[w])return nm+' — '+GLOSS[w]+'.';
  return '';}
function cellTap(e){if(!G||G.hintMode)return;const el=e.target&&e.target.closest?e.target.closest('.cell'):null;if(!el)return;
  let cell=null;for(const c of G.cells.values())if(c.el===el){cell=c;break;}if(!cell||!cell.open)return;
  const ws=G.words.filter(w=>w.found&&wordCells(w).includes(cell));if(!ws.length)return;
  poke();G.defI=G.defC===cell?(G.defI||0)+1:0;G.defC=cell;const wd=ws[G.defI%ws.length],t=wordInfo(wd.w);
  SND.tap();highlightWord(wd);
  zina(t||'«'+wd.w+'» — слово настоящее, а записи про него у меня пока нет.','happy',Math.max(5,2+(t.length||30)*.07));$('zSay').classList.add('pin');clearTimeout(zina._t);
  zina._t=setTimeout(zinaHide,Math.max(6,2+(t.length||30)*.08)*1000);
  if(!S.tip.def){S.tip.def=1;save();}}

/* ---------- подсказки ---------- */
// уровни 1–2 (обучение): буква-подсказка даром и не в счёт «буквы дня» (аудит 14: подарок сгорал до объяснения)
const learnFree=()=>!!G&&!G.daily&&G.idx<2;
// новичок: первые 10 уровней — отказы с подсказкой «что попробовать», кот помогает раньше (boost 02.10: чтобы в первой сессии не застревали)
const NOVICE=10,novice=()=>!!G&&!G.daily&&G.idx<NOVICE&&S.lv<NOVICE;
function updPrices(){const f=learnFree()||freeLeft();$('prLet').textContent=f?'даром':PRICE.letter;$('hLet').title=f?'Открыть букву — сегодня даром':'Открыть букву';$('prWord').textContent=PRICE.word;}
// окно подсказки: всегда два способа — за монеты и за рекламу (ролик; награда только за досмотренный). В VK без моста — только монеты
function pay(kind,then){
  const pr=PRICE[kind],g=G,ad=adsOk(),enough=S.coins>=pr,ic=kind==='letter'?'💡':'📜';
  const doPay=()=>{addCoins(-pr);STAT.ev('spend',{k:kind,c:pr});S.hintsUsed=(S.hintsUsed||0)+1;updPrices();then();};
  if(enough&&S.tip.noAsk){doPay();return;}
  modal(`<h2>${kind==='letter'?'💡 Открыть букву?':'📜 Открыть слово?'}</h2><div style="width:96px;height:96px;margin:4px auto">${zinaSVG('norm')}</div>
    <p>${kind==='letter'?'Одну букву':'Самое длинное слово'} — за <b>${pr}</b> ${COIN_I}${ad?' или за рекламу':''}. У тебя ${S.coins}.</p>
    ${enough?'':`<p style="font-size:14.5px">Монеток пока маловато${ad?' — посмотри рекламу, и подсказка бесплатно!':'. Проходи уровни — накопим!'}</p>`}
    ${enough?'<label class="chk"><input type="checkbox" id="mNoAsk"> за монеты — больше не спрашивать</label>':''}
    <div class="btns"><button class="btn ${enough?'green':'ghost'}" id="mYes"${enough?'':' disabled'}>${ic} за ${pr} ${COIN_I}</button>
      ${ad?`<button class="btn ${enough?'blue':'green'}" id="mAd">🎬 ${kind==='letter'?'Буква':'Слово'} за рекламу</button>`:''}
      <button class="btn ghost" id="mNo">Сам справлюсь</button></div>`);
  $('mYes').onclick=()=>{if(S.coins<pr)return;const na=$('mNoAsk');if(na&&na.checked){S.tip.noAsk=1;save();}hideModal();doPay();};
  $('mNo').onclick=()=>{hideModal();SND.tap();};
  const b=$('mAd');if(b)STAT.offer(kind);if(b)b.onclick=()=>{if(b.disabled)return;b.disabled=true;STAT.place(kind);
    showRewarded(()=>{hideModal();if(G===g&&!g.won){S.hintsUsed=(S.hintsUsed||0)+1;then();}},()=>{b.disabled=false;});};
}
function hintLetter(){
  if(!G||G.won)return;poke();
  const closed=[...G.cells.values()].filter(c=>!c.open);if(!closed.length)return;
  const open=msg=>{
    // первая закрытая буква самого «пустого» слова — полезнее, чем случайная
    const ws=G.words.filter(w=>!w.found).sort((a,b)=>wordCells(a).filter(c=>c.open).length/a.w.length-wordCells(b).filter(c=>c.open).length/b.w.length);
    const c=wordCells(ws[0]).find(c=>!c.open)||closed[0];
    G.hinted=true;STAT.use('hint');openCell(c,0,'hint');SND.open();zina(msg||say('hint'),'norm',msg?4.5:0);checkAutoFoundAndWin();saveCur();
  };
  if(learnFree()){S.hintsUsed=(S.hintsUsed||0)+1;open('На первых уровнях подсказываю даром — учись! Дальше — за монетки, но раз в день кот букву принесёт.');return;}
  // бесплатная буква дня — сразу, без окна и без монет
  if(freeLeft()){useFree();S.hintsUsed=(S.hintsUsed||0)+1;updPrices();
    open(pick(['Ять под диваном букву нашёл — держи, даром! Завтра ещё поищет.','Кот принёс букву. Бесплатно — раз в день. Завтра ещё принесёт.']));return;}
  pay('letter',()=>open());
}
function hintWord(){
  if(!G||G.won)return;poke();
  const ws=G.words.filter(w=>!w.found);if(!ws.length)return;
  pay('word',()=>{G.hinted=true;STAT.use('hint');const wd=ws.sort((a,b)=>b.w.length-a.w.length)[0];SND.open();const t=wordInfo(wd.w);
    zina(t&&!DEFS[wd.w]?'Держи слово! '+t:say('hintWord'),'happy',t&&!DEFS[wd.w]?7:0);foundWord(wd,true);});
}
function checkAutoFoundAndWin(){checkAutoFound();checkWin();}
function shuffleLetters(){
  if(!G||G.won)return;poke();const old=G.letters.join('');G.sel=[];G.tap=false;updSel();drawLine();
  for(let k=0;k<10;k++){shuffle(G.letters);if(G.letters.join('')!==old)break;}
  const wh=$('wheel');wh.querySelectorAll('.let').forEach((e,i)=>{e.textContent=G.letters[i];e.animate([{transform:'scale(.3) rotate(-90deg)'},{transform:'scale(1)'}],{duration:280,easing:'ease-out'});});
  SND.shuffle();zina(say('shuffle'),'norm',2.5);saveCur();
}
// банка наполнилась: плашка «Банка полна! +10» и золотая кнопка ×2 за рекламу (награда — только после досмотра)
function jarFull(hj){let got=0;
  modal(`<h2>🍯 Банка полна!</h2><div class="reward big">+${JAR_PRIZE} <span class="coin"></span></div><p class="money">${JAR_SIZE} бонусных слов собрано</p>
    <div class="btns"><button class="btn green" id="jfOk">Продолжить</button>
    <button class="btn gold" id="jfX2">🎬 ×2 за рекламу: <span class="nw">+${JAR_PRIZE} → +${JAR_PRIZE*2} ${COIN_I}</span></button></div>`);
  coinBurst($('mcard').querySelector('.reward'),JAR_PRIZE);
  $('jfOk').onclick=()=>{hideModal();SND.tap();};
  const x=$('jfX2');STAT.offer('jar');x.onclick=()=>{if(got||x.disabled)return;x.disabled=true;STAT.place('jar');
    showRewarded(()=>{if(got)return;got=1;addCoins(JAR_PRIZE);SND.coin();x.textContent='✅ Получено: +'+JAR_PRIZE*2;coinBurst($('jfX2'),JAR_PRIZE);},()=>{if(!got)x.disabled=false;});};}
function updJar(){const n=Math.max(0,Math.min(JAR_SIZE,S.jar||0)),c=$('jarCnt'),p=$('jarPg');c.textContent=n;c.classList.toggle('z',!n);
  if(p)p.setAttribute('stroke-dasharray',(n/JAR_SIZE*113.1).toFixed(1)+' 200');$('hJar').title='Банка бонусных слов: '+n+' из '+JAR_SIZE;}
function showJar(){
  poke();const n=S.jar||0;
  modal(`<h2>🍯 Банка бонусов</h2><p>Слова, которых нет в кроссворде, но они настоящие. Собери ${JAR_SIZE} — получишь <b>${coinsTxt(JAR_PRIZE)}</b>.</p>
   <div class="bar" style="height:14px;margin:12px 0"><i style="width:${n/JAR_SIZE*100}%"></i></div><p><b>${n} из ${JAR_SIZE}</b></p>
   <div class="words">${G.bonus.size?[...G.bonus].map(w=>'<span>'+w+'</span>').join(''):'<p>На этом уровне пока ни одного. Ищи слова покороче!</p>'}</div>
   <div class="btns"><button class="btn blue" id="mOk">Понятно</button></div>`);
  $('mOk').onclick=hideModal;
}

/* ---------- баба Зина говорит ---------- */
function zina(t,mood,sec){const e=$('zSay');e.textContent=t;(zina.h=zina.h||[]).push(t);if(zina.h.length>3)zina.h.shift();e.classList.add('on');e.classList.remove('pin');if(mood)zinaFace(mood);
  clearTimeout(zina._t);if(sec!==99)zina._t=setTimeout(zinaHide,Math.max(sec||3.2,1.5+t.length*.06)*1000);}
function zinaHide(soft){const e=$('zSay');if(soft&&(e.classList.contains('pin')||!e.classList.contains('on')||G&&G.tut))return;clearTimeout(zina._t);e.classList.remove('on','pin');zinaFace('norm');}
$('zSay').addEventListener('click',()=>{const e=$('zSay');if(!e.classList.contains('on'))return;clearTimeout(zina._t);
  if(e.classList.contains('pin'))zinaHide();else e.classList.add('pin');});
const MOODS=['norm','happy','wow','stern'];
function zinaFace(m){const av=$('zAv');if(av.dataset.o!==S.outfit){av.dataset.o=S.outfit;av.innerHTML=MOODS.map(x=>`<i class="face" data-m="${x}">${zinaSVG(x)}</i>`).join('');}
  av.querySelectorAll('.face').forEach(f=>f.classList.toggle('on',f.dataset.m===m));}
function glowHint(){const e=$('hLet');e.classList.remove('glow');void e.offsetWidth;e.classList.add('glow');}
function poke(){if(G){G.idleT=0;}}
setInterval(()=>{if(!G||G.won||paused||!$('game').classList.contains('on')||$('modal').classList.contains('on')||document.hidden)return;G.idleT++;
  if(G.idleT===30&&G.idleN<2){G.idleN++;G.idleT=0;
    // вторые 30 с без слова (≈ минута) — иногда кот Ять сам ставит букву (catHelp); иначе баба Зина подсказывает, как раньше
    if((G.idleN===2||novice())&&catHelp())return;
    zina(say('idle'),'norm',5);glowHint();}},1000);

/* ---------- «Зина загадала слово» (аудит 14: разнообразие подачи, уровни и раскладки не меняются) ----------
   Уровни 12, 14, 16, 18, 20 и дальше каждый 3-й в десятке: одно слово кроссворда — загадка. Шутка из «Толкового словаря»
   вместо буквы, клетки слова обведены пунктиром. Нажатие на бабу Зину — повторить загадку. Монет за это нет. */
function riddleOf(g){if(g.daily||g.tut)return null;const i=g.idx,on=i>=10&&i<20?i%2===1:i>=20&&i%10===2;if(!on)return null;
  const c=g.words.filter(w=>!w.found&&DEFS[w.w]);if(!c.length)return null;
  return c.find(w=>w.w===g.lv.d)||c.sort((a,b)=>b.w.length-a.w.length)[0];}
function riddleSay(sec){if(!G||!G.rid)return;zina('Загадка! '+DEFS[G.rid.w]+' Что это? Слово я обвела пунктиром.','wow',sec||6);}

/* ---------- кот Ять помогает (аудит 14) ----------
   Минуту без нового слова — кот сам ставит одну букву (с 3-го уровня, не чаще раза в 7 побед; S.catW — на какой победе помог; модель — tools/econ.py).
   Это подарок, а не подсказка: «Отличник» не снимается, монеты не тратятся. */
function catHelp(force){if(!G||G.won||G.tut||G.catD||(!G.daily&&G.idx<1))return false;
  const w=S.wins||0;if(!novice()&&S.catW!=null&&w-S.catW<7)return false;
  const ws=G.words.filter(x=>!x.found).sort((a,b)=>wordCells(a).filter(c=>c.open).length/a.w.length-wordCells(b).filter(c=>c.open).length/b.w.length);
  const c=ws.length&&wordCells(ws[0]).find(c=>!c.open);if(!c)return false;
  if(!novice())S.catW=w;G.catD=1;G.miss=0;save();SND.meow();buzz('word');const g=G;
  const put=()=>{if(G!==g||g.won||c.open)return;openCell(c,0,'cat');SND.open();checkAutoFoundAndWin();saveCur();};
  const from=$('zAv').getBoundingClientRect(),to=c.el.getBoundingClientRect();
  if(CALM()||!document.body.animate)put();
  else{const e=document.createElement('div');e.className='catfly';e.textContent='🐈';e.style.left=(from.left+from.width/2-20)+'px';e.style.top=(from.top+from.height/2-20)+'px';
    document.body.appendChild(e);const dx=to.left+to.width/2-(from.left+from.width/2),dy=to.top+to.height/2-(from.top+from.height/2);
    e.animate([{transform:'translate(0,0) scale(.6)'},{transform:`translate(${dx*.5}px,${dy*.5-60}px) scale(1.2)`,offset:.5},{transform:`translate(${dx}px,${dy}px) scale(.8)`}],{duration:900,easing:'ease-in-out',fill:'both'});
    setTimeout(()=>{e.remove();put();},880);}
  zina(force?pick(['Три раза мимо — кот Ять не выдержал и сам букву принёс. Даром!','Ять посмотрел-посмотрел — и поставил букву. Мяу, говорит, не мучайся.'])
    :pick(['Кот Ять не выдержал — сам букву принёс! Мяу.','Ять заскучал и поставил букву. Даром, он у нас добрый.','Мяу! Это Ять подсказал. Я его не учила, честно.']),'wow',5);
  return true;}

/* ---------- обучение ---------- */
// уровень 2: баба Зина объясняет кнопки и подсвечивает их
function explainButtons(){S.tip.btns=1;save();
  zina('Справа — подсказки: 💡 буква и 📜 целое слово. Слева — 🍯 банка для лишних слов и 🔀 перемешать буквы.','happy',10);
  ['hLet','hWord','hJar','hShuf'].forEach((id,i)=>setTimeout(()=>{const e=$(id);e.classList.remove('glow');void e.offsetWidth;e.classList.add('glow');},i*300));}
let tutAnim=null;
function startTutorial(){
  stopTutorial();const w=shortestWord();const idx=[],used=new Set();
  for(const ch of w){const i=G.letters.findIndex((c,j)=>c===ch&&!used.has(j));used.add(i);idx.push(i);}
  const dot=document.createElement('div');dot.id='tutDot';
  dot.style.cssText='position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(255,138,61,.85);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.25);z-index:5;pointer-events:none;transition:left .45s ease-in-out,top .45s ease-in-out,opacity .3s';
  $('wheel').appendChild(dot);let k=0;
  const step=()=>{if(!document.getElementById('tutDot'))return;const i=idx[k%idx.length],p=WH.pts[i];
    dot.style.left=(p[0]-17)+'px';dot.style.top=(p[1]-17)+'px';dot.style.opacity=k%(idx.length+1)===idx.length?0:1;
    if(k%(idx.length+1)===idx.length){k++;tutAnim=setTimeout(step,500);return;}k++;tutAnim=setTimeout(step,600);};
  step();
}
function stopTutorial(){clearTimeout(tutAnim);const d=document.getElementById('tutDot');if(d)d.remove();}

/* ---------- эффекты ---------- */
function flyTo(text,target){
  const from=$('preview').getBoundingClientRect(),to=target.getBoundingClientRect();
  const e=document.createElement('div');e.className='fly';e.textContent=text.toUpperCase();e.style.fontSize='22px';
  const x0=from.left+from.width/2-30,y0=from.top;e.style.left=x0+'px';e.style.top=y0+'px';document.body.appendChild(e);
  // только transform/opacity — без пересчёта раскладки на каждом кадре
  requestAnimationFrame(()=>{e.style.transform=`translate(${to.left+4-x0}px,${to.top+10-y0}px) scale(.36)`;e.style.opacity='.2';});
  setTimeout(()=>e.remove(),560);
}
// сочная награда: n монет летят из from к видимому счётчику, счётчик «тикает» по одной; «уже начислено» — S.coins уже с наградой.
// В спокойном режиме / без анимации — просто число. Возвращает true, если полёт запущен.
function coinBurst(from,amount){
  const cs=[].filter.call(document.querySelectorAll('.coins'),e=>e.offsetParent!==null),tg=cs[0];
  const cc=[].slice.call(document.querySelectorAll('.cc')),fin=S.coins;
  if(!from||!tg||CALM()||amount<1||typeof from.getBoundingClientRect!=='function'){updCoins();return false;}
  const a=from.getBoundingClientRect(),b=tg.getBoundingClientRect(),n=Math.min(8,Math.max(5,Math.round(amount/2))),base=fin-amount;
  let got=0;const show=v=>cc.forEach(e=>{e.textContent=v;});show(base);
  for(let i=0;i<n;i++)setTimeout(()=>{
    const e=document.createElement('div');e.className='fly coinfly';const x0=a.left+a.width/2-11+(i%3-1)*14,y0=a.top+a.height/2-11;
    e.style.left=x0+'px';e.style.top=y0+'px';document.body.appendChild(e);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{e.style.transform='translate('+(b.left+b.width/2-11-x0)+'px,'+(b.top+b.height/2-11-y0)+'px) scale(.7)';}));
    setTimeout(()=>{e.remove();got++;show(got>=n?fin:base+Math.round(amount*got/n));},560);
  },400+i*90);
  setTimeout(()=>updCoins(),400+n*90+900); // страховка: счётчик всегда честный
  return true;
}
// буквы слова летят дугой из строки над кругом в свои клетки. Возвращает, через сколько мс каждая буква «сядет» (или null — без полёта)
function flyLetters(cs,extra){
  const pv=$('preview').firstElementChild;if(CALM()||!pv||typeof pv.animate!=='function')return null;
  const r=pv.getBoundingClientRect();if(!r.width||!cs.length||!cs[0].el)return null;
  const n=cs.length,step=(r.width-24)/(n+(extra||0)),y0=r.top+r.height/2,fs=parseFloat(getComputedStyle(pv).fontSize)||24,out=[];
  cs.forEach((c,i)=>{const t=c.el.getBoundingClientRect(),x0=r.left+12+step*(i+.5),dx=t.left+t.width/2-x0,dy=t.top+t.height/2-y0,delay=i*55;
    const e=document.createElement('div');e.className='flyl';e.textContent=c.ch;e.style.fontSize=fs+'px';e.style.left=(x0-20)+'px';e.style.top=(y0-20)+'px';
    document.body.appendChild(e);const k=Math.max(.5,Math.min(1.6,t.height*.56/fs));
    e.animate([{transform:'translate(0,0) scale(1)',opacity:.95},{transform:`translate(${dx*.45}px,${dy*.45-46}px) scale(1.2)`,opacity:1,offset:.45},
      {transform:`translate(${dx}px,${dy}px) scale(${k})`,opacity:.9}],{duration:380,delay,easing:'cubic-bezier(.35,.1,.45,1)',fill:'both'});
    setTimeout(()=>e.remove(),delay+400);out.push(delay+360);});
  return out;
}
// печать красной ручкой посреди кроссворда — за длинное слово (7–8 букв)
function boardStamp(t){const b=$('board'),e=document.createElement('div');e.className='bstamp'+(CALM()?' still':'');e.textContent=t;b.appendChild(e);setTimeout(()=>e.remove(),1700);}
function confetti(){
  const cols=['#ff8a3d','#f5b72d','#2f6fd6','#34a853','#e2463b','#9a64b8'];
  for(let i=0;i<60;i++){const e=document.createElement('div');e.className='confetti';e.style.background=pick(cols);
    const x=Math.random()*innerWidth;e.style.left=x+'px';e.style.top='-20px';document.body.appendChild(e);
    const dx=(Math.random()-.5)*200,rot=Math.random()*720;
    e.animate([{transform:'translate(0,0) rotate(0)'},{transform:`translate(${dx}px,${innerHeight+40}px) rotate(${rot}deg)`}],{duration:1500+Math.random()*1300,easing:'cubic-bezier(.3,.6,.6,1)',delay:Math.random()*300}).onfinish=()=>e.remove();}
}

/* ---------- ввод с клавиатуры (компьютер) ---------- */
document.addEventListener('keydown',e=>{
  if($('modal').classList.contains('on')){if(e.key==='Escape'&&!(G&&G.won&&$('game').classList.contains('on')))hideModal();
    // Enter — только главная зелёная кнопка окна («Дальше», «Давай играть», «Спасибо»); кнопки трат и рекламы клавишей не нажимаются
    else if(e.key==='Enter'&&!e.repeat){const b=$('mNext')||$('mGo');if(b&&!b.disabled&&b.offsetParent!==null&&!(typeof adBusy!=='undefined'&&adBusy)){e.preventDefault();b.click();}}
    return;}
  if(!G||G.won||!$('game').classList.contains('on'))return;
  const k=e.key.toLowerCase().replace('ё','е');
  if(k==='1'){hintLetter();return;}if(k==='2'){hintWord();return;}
  if(k==='enter'){const w=G.sel.map(i=>G.letters[i]).join('');G.sel=[];G.tap=false;updSel();submit(w);return;}
  if(k==='backspace'){G.sel.pop();updSel();return;}
  if(k==='escape'){G.sel=[];updSel();return;}
  if(k===' '){shuffleLetters();e.preventDefault();return;}
  if(/^[а-я]$/.test(k)){const i=G.letters.findIndex((c,j)=>c===k&&!G.sel.includes(j));if(i>=0){ac();poke();G.sel.push(i);SND.letter(G.sel.length-1);updSel();}}
});
