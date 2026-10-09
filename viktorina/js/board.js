/* board.js — «Табло Михалыча» (поток BOARD, буст 09.10.2026). Журнал: hobby-analytics/release-i/viktorina-boost/logs/BOARD.md.
   Источники: 03-content.md §2 (2.2 вариант А, 2.5), 04-meta-economy.md §2.3, макеты 06-mock/board-a-setka.html и board-b-stroki.html.

   ПРАВИЛА
   - Открывается с 5-го уровня (S.lvl ≥ 4). Табло: темы × цены 100–500, игрок сам выбирает клетку, таймера нет.
   - Цена клетки — по месту (100…500); вопрос в клетку подбирается по priceOf (js/price.js) — ближайший по цене; внутри темы
     клетки упорядочены по ожидаемой доле верных (PRICE.pOf): 500 — самый трудный из пятёрки.
   - Соседи-соперники отвечают на те же вопросы честно: верно с вероятностью p = PRICE.pOf(q) + сила соседа (+ своя тема).
     С минусом сосед, который не уверен (p < 0,5), молчит — как и игрок может сказать «Пас».
   - Минус за неверный — с района «Улица» (3-й район карьеры: CAR.district() ≥ 3; до слияния с CAR — по уровню, ≈ «Профессор лавочки»).
     До этого неверный — без минуса. Ставки («Торг у гаражей», «Финал у подъезда») сгорают всегда — на то и ставка.
   - «Посылка от бабы Зины» — спрятана в одной клетке: вопрос ДРУГОЙ темы (из трудных), цену 100–500 назначаешь сам.
   - «Торг у гаражей» — спрятан в одной клетке: ставка от 100 до max(счёт, 500).
   - «Финал у подъезда» — после всех клеток: тема известна, вопрос трудный, ставка — любая часть счёта.
   - Подсказки: «50 на 50» — одна на табло даром; «Сосед» и «Баба Зина» — только в свободной игре, за монеты (COST.nb / COST.zi).
     В табло дня, кубке и финале района — только бесплатная «50 на 50» (условия у всех одинаковые).
   - «Уже видел»: свободная игра и финал района берут вопросы, которых игрок не видел (S.seen, по кругу S.cyc — как pickQ);
     табло дня — одно на всех по дате (как викторина дня, зерно даты), кубок — по зерну, которое даёт YARD. Открытый вопрос
     отмечается увиденным (markSeen), номера id не трогаем.
   - Каждый ответ → UI.answered({id, ok, hint, mode, step, price, t, d, n:1, fin:1, sp, pass}) (answerHook — STAT/CAR/YARD).
     mode: 'board' свободная, 'bday' табло дня, 'bcup' кубок, 'bfin' финал района. price — ценность клетки/ставка.

   ДОГОВОР ДЛЯ ДРУГИХ ПОТОКОВ (window.BOARD)
     BOARD.open()                 — экран «Табло Михалыча» (выбор: табло дня / свободная игра); то же — UI.go('board')
     BOARD.openDay()              — табло дня; то же — UI.go('bday')
     BOARD.start(opts)            — матч на табло для кубка/финала района:
        opts = {mode:'cup'|'champ', title, sub, seed (число — одинаково у всех; нет — по «уже видел»), cols (тем, 3–5), mult (1|2 — двойные цены),
                rivals:['zina'] | [{id,n,sk,top}], topics:[ключи], noGift, noBet, noFinal, onEnd:res=>{} }
        res  = {mode, score, place, win, rivals:[{id,n,sc}], k}
        Соперники-чемпионы: valerka, mityai, valya, kolya, zina, sansan (рисунок Сан Саныча — CAR, js/look-sansan.js; нет — портрет Коли).
     BOARD.day()                  — {k, done, score, place} табло дня сегодня (для «Сегодня» CAR)
     BOARD.days()                 — {ГГГГММДД: очки} табло дня за последние 35 дней (для лиги YARD: «5 лучших за неделю»)
     BOARD.minus()                — действует ли минус за неверный (true/false)
     Событие UI.emit('board', res) — после каждого доигранного табло (res.mode 'free'|'day'|'cup'|'champ').
   СОХРАНЕНИЕ (только S.bd*): bdN — доиграно табло, bdW — первых мест, bdBest — лучший счёт свободной игры, bdCur — недоигранная
     свободная игра, bdDay — табло дня {k, s:снимок}, bdDays — {день: очки}, bdTip — объяснение показано. Слияние облака — BOARD.merge(d)
     (одна строка в mergeSave). */
(function(){'use strict';
var W=window,PR=[100,200,300,400,500],OPEN_LVL=4,DAYS_KEEP=35;
var B=null,Q=null,lay='',busy=false,inited=false;
// соперники: сила — поправка к средней доле верных (PRICE.pOf), top — свои темы (+0,08)
var RIV={
  valerka:{n:'Валерка',sk:-.10,top:['world','nature','sci','sport']},
  mityai:{n:'Дед Митяй',sk:-.05,top:['sport','ussr','history','kino']},
  valya:{n:'Тётя Валя',f:1,sk:-.03,top:['kitchen','dacha','kino','ussr']},
  kolya:{n:'Дядя Коля',sk:-.01,top:['tech','space','geo','world']},
  zina:{n:'Баба Зина',f:1,sk:.07,top:['lang','lit','art','history']},
  sansan:{n:'Сан Саныч',sk:.11,top:['geo','history','sci','space','world']}};
var MODE={free:{m:'board',t:'Табло Михалыча'},day:{m:'bday',t:'Табло дня'},cup:{m:'bcup',t:'Кубок выходного дня'},champ:{m:'bfin',t:'Финал района'}};

/* ---------- мелочи ---------- */
function $b(id){return document.getElementById(id);}
function E(s){return esc(s);}
function fmt(n){n=Math.round(n)||0;var s=String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');return (n<0?'−':'')+s;}
function spd(){try{return speed();}catch(e){return 1;}}
function quiet(){try{return calm();}catch(e){return false;}}
function snd(k){try{SND[k]();}catch(e){}}
function stat(f){try{f();}catch(e){}}
function lk(){return !!(W.LK&&LK.on&&LK.on());}
function scan(el){if(lk()&&LK.scan&&el)try{LK.scan(el);}catch(e){}}
function av(id,m){if(id==='sansan'&&!(W.LK&&LK.who&&LK.who.sansan)&&!(W.LOOK_SANSAN))id='kolya';try{return portrait(id,m||'norm');}catch(e){return '';}}
function tName(t){var v=W.VTOP&&VTOP.T&&VTOP.T(t);return (TN[t]&&TN[t].n)||(v&&v.n)||t;}
function tShort(t){var v=W.VTOP&&VTOP.T&&VTOP.T(t);return (v&&v.sh)||(typeof TSH!=='undefined'&&TSH[t])||tName(t);}
function tIc(t){var v=W.VTOP&&VTOP.T&&VTOP.T(t);return (TN[t]&&TN[t].ic)||(v&&v.ic)||'❓';}
function tNew(t){try{return !!(W.VTOP&&VTOP.isNew&&VTOP.isNew(t,nowMs()));}catch(e){return false;}}
function pOf(q){return W.PRICE?PRICE.pOf(q):.75;}
function prOf(q,mode){try{return priceOf(q,{mode:mode});}catch(e){return 300;}}
function rivTop(id){var h=typeof HELP!=='undefined'&&HELP[id];return (RIV[id]&&RIV[id].top)||(h&&h.top)||[];}
function rivP(r,q){var p=pOf(q)+(r.sk||0)+((r.top||[]).indexOf(q.t)>=0?.08:0);return Math.max(.08,Math.min(.97,p));}
function norm(s){return String(s||'').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]/g,'');}
function open(){return (S.lvl||0)>=OPEN_LVL;}
// район карьеры (1 Лавочка … 6 Город): от CAR, пока его нет — по уровню (старые звания: 10 Эрудит двора, 20 Профессор лавочки …)
function distNo(){try{var C=W.CAR;if(C){var v=typeof C.district==='function'?C.district():typeof C.dist==='function'?C.dist():C.district;
    var n=+(v&&typeof v==='object'?(v.n||v.i||v.no):v);if(n>=1&&n<=6)return n;}}catch(e){}
  var l=S.lvl||0;return l>=100?6:l>=60?5:l>=35?4:l>=20?3:l>=10?2:1;}
function minusOn(){return distNo()>=3;}
// открытые темы (данные тем — CONTENT, js/topics.js), в которых есть вопросы
function topicList(ms){var l=null;try{if(W.VTOP&&VTOP.openList){l=VTOP.openList(ms);var s=VTOP.seasonNow&&VTOP.seasonNow(ms);if(s&&l.indexOf(s.k)<0)l=l.concat([s.k]);}}catch(e){l=null;}
  if(!l||!l.length)l=TK.slice();return l.filter(function(t){return BYT[t]&&BYT[t].length>=12;});}

/* ---------- подбор вопросов ---------- */
function poolOf(t,used,ans,seeded){return BYT[t].filter(function(q){return !used.has(q.i)&&!ans.has(norm(q.a[0]))&&(seeded||(!seen(q)&&!isBad(q)));});}
// вопрос темы t на цену v: ближайший по priceOf; у «дорогих» при равной разнице — потруднее
function pickV(t,v,used,ans,R,seeded,mode){
  var c=poolOf(t,used,ans,seeded);
  if(!c.length&&!seeded){ // тема исчерпана — новый круг (как pickQ)
    if(BYT[t].every(function(q){return used.has(q.i)||seen(q)||isBad(q);})){S.seen[t]='';S.cyc[t]=(S.cyc[t]||0)+1;}
    c=poolOf(t,used,ans,false);if(!c.length)c=BYT[t].filter(function(q){return !used.has(q.i);});}
  if(!c.length)return null;
  var best=1e9,g=[];for(var i=0;i<c.length;i++){var d=Math.abs(prOf(c[i],mode)-v);if(d<best){best=d;g=[c[i]];}else if(d===best)g.push(c[i]);}
  if(v>=400&&g.length>3){g.sort(function(a,b){return pOf(a)-pOf(b)||(a.i<b.i?-1:1);});g=g.slice(0,Math.max(3,Math.ceil(g.length/2)));}
  if(v<=100&&g.length>3){g.sort(function(a,b){return pOf(b)-pOf(a)||(a.i<b.i?-1:1);});g=g.slice(0,Math.max(3,Math.ceil(g.length/2)));}
  var q=g[Math.floor(R()*g.length)];used.add(q.i);ans.add(norm(q.a[0]));return q;}
function pick5(t,used,ans,R,seeded,mode){var a=[];for(var i=0;i<5;i++){var q=pickV(t,PR[i],used,ans,R,seeded,mode);if(!q)return null;a.push(q);}
  // внутри темы: 100 — самый лёгкий из пятёрки, 500 — самый трудный
  a.sort(function(x,y){return prOf(x,mode)-prOf(y,mode)||pOf(y)-pOf(x)||(x.i<y.i?-1:1);});return a;}
function chooseTopics(n,R,seeded,ms){var l=topicList(ms);
  if(seeded){ // табло дня: в праздник/сезон один столбец — из праздничного набора (просьба FEST 03 §3.3; при сведении 09.10)
    var f=null;try{f=W.VTOP&&VTOP.festTop&&VTOP.festTop(ms);}catch(e){f=null;}
    if(f&&l.indexOf(f.k)>=0)return [f.k].concat(shuffle(l.filter(function(x){return x!==f.k;}),R).slice(0,n-1));
    return shuffle(l.slice(),R).slice(0,n);}
  var out=[],add=function(t){if(t&&l.indexOf(t)>=0&&out.indexOf(t)<0&&out.length<n)out.push(t);};
  l.filter(tNew).forEach(add);if(out.length>1)out=out.slice(0,1);
  try{if(Math.random()<.5)add(weekTopic());}catch(e){}
  shuffle(l.slice()).forEach(add);return out;}

/* ---------- новое табло ---------- */
function build(o){
  var mode=o.mode||'free',seeded=o.seed!=null,R=seeded?rng(o.seed>>>0):Math.random,mult=o.mult||1,cols=Math.max(2,Math.min(5,o.cols||(mode==='day'?3:5)));
  var ms=mode==='day'&&o.k?dayMs(o.k):undefined;
  var tl=(o.topics||chooseTopics(cols,R,seeded,ms)).filter(function(t){return BYT[t]&&BYT[t].length>=12;}).slice(0,cols);
  if(tl.length<2)return null;cols=tl.length;
  var used=new Set(),ans=new Set(),cells=[],mm=MODE[mode].m;
  for(var c=0;c<cols;c++){var qs=pick5(tl[c],used,ans,R,seeded,mm);if(!qs)return null;
    for(var r=0;r<5;r++)cells[r*cols+c]={t:tl[c],v:PR[r]*mult,q:qs[r].i,r:null};}
  var rv=(o.rivals||(mode==='day'?shuffle(['mityai','valya','kolya','valerka'],R).slice(0,2):shuffle(['mityai','valya','kolya','valerka']).slice(0,2))).map(function(x){
    var id=typeof x==='string'?x:x.id,b=RIV[id]||{};return {id:id,n:(x&&x.n)||b.n||id,sk:x&&x.sk!=null?x.sk:(b.sk||0),top:(x&&x.top)||rivTop(id),sc:0};});
  // случайности соседей — заранее (табло дня одинаково у всех; после перезапуска — те же)
  cells.forEach(function(x){x.u=rv.map(function(){return Math.round(R()*1000)/1000;});});
  var others=topicList(ms).filter(function(t){return tl.indexOf(t)<0;});if(!others.length)others=tl.slice();
  var sp=function(lo){var k=0;do{k=Math.floor(R()*cells.length);}while((k/cols|0)<lo||cells[k].sp);return k;};
  if(!o.noGift){var gi=sp(1),gt=others[Math.floor(R()*others.length)],gq=pickV(gt,500,used,ans,R,seeded,mm)||pickV(tl[0],500,used,ans,R,seeded,mm);
    if(gq){cells[gi].sp='gift';cells[gi].g=gq.i;}}
  if(!o.noBet){cells[sp(2)].sp='bet';}
  var fin=null;if(!o.noFinal){var ft=others.filter(function(t){return !cells.some(function(x){return x.g&&QI[x.g]&&QI[x.g].t===t;});});ft=ft.length?ft:others;
    var t=ft[Math.floor(R()*ft.length)],fq=pickV(t,500,used,ans,R,seeded,mm);if(fq)fin={t:t,q:fq.i,u:rv.map(function(){return Math.round(R()*1000)/1000;}),st:0};}
  return {mode:mode,k:o.k||0,seed:seeded?o.seed:null,cols:cols,topics:tl,cells:cells,rv:rv,fin:fin,sc:0,h:{},sel:-1,mult:mult,
    title:o.title||MODE[mode].t,sub:o.sub||'',onEnd:o.onEnd||null,minus:minusOn(),done:0};}
function dayMs(k){return new Date(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100,12).getTime();}

/* ---------- снимок (продолжение после перезапуска) ---------- */
function snap(){if(!B||B.mode==='cup'||B.mode==='champ')return null;
  return {m:B.mode,k:B.k,c:B.cols,tl:B.topics,x:B.cells.map(function(x){var o={t:x.t,v:x.v,q:x.q,r:x.r,u:x.u};if(x.sp)o.sp=x.sp;if(x.g)o.g=x.g;if(x.gv)o.gv=x.gv;if(x.bv)o.bv=x.bv;return o;}),
    rv:B.rv.map(function(r){return {id:r.id,sc:r.sc};}),f:B.fin,sc:B.sc,h:B.h,mn:B.minus?1:0,d:B.done,o:B.cur||null};}
function unsnap(s){try{if(!s||!Array.isArray(s.x)||!s.x.length||!s.x.every(function(x){return QI[x.q]&&(!x.g||QI[x.g]);}))return null;
  var rv=(s.rv||[]).map(function(r){var b=RIV[r.id]||{};return {id:r.id,n:b.n||r.id,sk:b.sk||0,top:rivTop(r.id),sc:+r.sc||0};});
  if(s.f&&!QI[s.f.q])s.f=null;
  return {mode:s.m,k:s.k||0,cols:s.c,topics:s.tl,cells:s.x,rv:rv,fin:s.f||null,sc:+s.sc||0,h:s.h||{},sel:-1,mult:1,title:MODE[s.m]?MODE[s.m].t:'Табло',sub:'',onEnd:null,minus:!!s.mn,done:s.d||0,cur:s.o&&s.x[s.o.i]&&s.x[s.o.i].r==null?s.o:null};}catch(e){return null;}}
function keep(){if(!B)return;var s=snap();
  if(B.mode==='free'){if(s&&!B.done)S.bdCur=s;else delete S.bdCur;}
  else if(B.mode==='day'){S.bdDay={k:B.k,s:s};dayScore(B.k,B.sc,B.done);}
  try{save();}catch(e){}}
function dayScore(k,sc,done){if(!S.bdDays||typeof S.bdDays!=='object')S.bdDays={};if(done||S.bdDays[k]==null||sc>S.bdDays[k])S.bdDays[k]=sc;
  var ks=Object.keys(S.bdDays).sort();while(ks.length>DAYS_KEEP)delete S.bdDays[ks.shift()];}

/* ---------- экран ---------- */
function ensure(){if(inited)return;inited=true;
  var s=document.createElement('section');s.id='scr-board';s.className='screen bdS';
  s.innerHTML='<header class="gh"><button class="icon" id="bdBack" aria-label="Назад">←</button><div class="gt"><div id="bdTitle">Табло Михалыча</div><div id="bdSub" class="sub"></div></div><button class="pill sm" id="bdCoins">💰 0</button></header>'
    +'<div class="bdBody" id="bdBody"><div class="bdL"><div class="bdSay"><div class="av" id="bdAv"></div><div class="sb" id="bdSayT"></div></div><div class="bdCrowd" id="bdCrowd"></div></div>'
    +'<div class="bdC"><div class="bdGrid" id="bdGrid" role="grid"></div><div class="bdLeg" id="bdLeg"></div></div>'
    +'<div class="bdR"><div class="bdScore" id="bdScore"></div><div class="bdInfo" id="bdInfo"></div></div></div>'
    +'<div class="bdQ" id="bdQ"><div class="bdQc" id="bdQc"></div></div>';
  var app=$b('app'),ref=$b('modal');app.insertBefore(s,ref);
  $b('bdBack').onclick=function(){snd('tap');back();};
  $b('bdCoins').onclick=function(){try{openCoins(function(){show('scr-board');render();});}catch(e){}};
  $b('bdGrid').addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('[data-i]');if(c&&!c.disabled)openCell(+c.dataset.i);});
  W.addEventListener('resize',function(){if(onBoard()){layout();}});
  document.addEventListener('keydown',key,true);}
function onBoard(){var s=$b('scr-board');return !!(s&&s.classList.contains('on'));}
function layout(){var app=$b('app'),w=app?app.clientWidth:W.innerWidth,big=document.body.classList.contains('big'),s=$b('scr-board');
  var l=w>=860?'wide':(w<375||big)?'rows':'grid';if(B&&B.cols<=3&&w<860&&!big)l='grid';
  if(l!==lay||!s.classList.contains('bd-'+l)){lay=l;s.classList.remove('bd-wide','bd-rows','bd-grid');s.classList.add('bd-'+l);if(B)renderGrid();}}
function enter(){ensure();busy=false;if(Q){var o=$b('bdQ');o.classList.remove('on','fin','rs');Q=null;}try{G=null;}catch(e){}hideModal();show('scr-board');layout();render();stat(function(){STAT.screen('board');});try{UI.cur='board';}catch(e){}}
function say(t,who,m){B.say={t:t,who:who||'mihalych',m:m||'norm'};var a=$b('bdAv'),b=$b('bdSayT');if(!a)return;a.innerHTML=av(B.say.who,B.say.m);
  b.innerHTML='<b class="lk-o">'+E(B.say.who==='mihalych'?'Михалыч':RIV[B.say.who]?RIV[B.say.who].n:'')+':</b> '+E(t);scan(b);}
function left(){return B.cells.filter(function(x){return x.r==null;}).length;}
function render(){if(!B)return;$b('bdTitle').textContent=B.title;
  $b('bdSub').textContent=B.sub||(B.mode==='day'?'одно на всех · '+dTxt(B.k):B.minus?'ошибка — минус цена':'ошибка — без минуса');
  $b('bdCoins').textContent='💰 '+S.coins;scan($b('bdCoins'));
  if(!B.say)say(hello());else say(B.say.t,B.say.who,B.say.m);
  renderGrid();renderScore();
  var cr='';if(lay==='wide')B.rv.forEach(function(r){cr+='<span class="bdFan">'+av(r.id,'happy')+'</span>';});$b('bdCrowd').innerHTML=cr;}
function dTxt(k){return String(k%100).padStart(2,'0')+'.'+String(Math.floor(k/100)%100).padStart(2,'0');}
function hello(){if(B.mode==='day')return 'Табло дня — одно на весь двор. Соседи уже сыграли — посмотрим, кто кого!';
  if(B.mode==='champ')return 'Финал района! Против тебя — '+B.rv.map(function(r){return r.n;}).join(', ')+'. Выбирай клетку.';
  if(B.mode==='cup')return 'Кубок выходного дня. Выбирай тему и цену!';
  return pick(['Выбирай тему и цену. Дороже — труднее! Где-то спрятана посылка от бабы Зины.','Двадцать пять клеток, а в конце — финал у подъезда. Начинай с любой!','Где-то на табло — торг у гаражей. Найдёшь — ставь смело!']);}
function renderGrid(){var g=$b('bdGrid');if(!g||!B)return;var h='',n=B.cols;
  g.style.setProperty('--bdc',n);
  if(lay==='rows'){for(var c=0;c<n;c++){var t=B.topics[c],dn=0;for(var r=0;r<5;r++)if(B.cells[r*n+c].r!=null)dn++;
      h+='<div class="bdRow"><div class="bdRn"><span class="ti">'+tIc(t)+'</span><span class="tn">'+E(tName(t))+'</span>'+(tNew(t)?'<em class="tag">новое</em>':'<span class="st">'+dn+' из 5</span>')+'</div><div class="bdPs">';
      for(r=0;r<5;r++)h+=cellH(r*n+c);h+='</div></div>';}}
  else{for(c=0;c<n;c++){t=B.topics[c];h+='<div class="bdTh'+(tNew(t)?' new':'')+'"><span class="ti">'+tIc(t)+'</span><span class="tn">'+E(tShort(t))+'</span></div>';}
    for(r=0;r<5;r++)for(c=0;c<n;c++)h+=cellH(r*n+c);}
  g.className='bdGrid '+(lay==='rows'?'rows':'grid');g.innerHTML=h;scan(g);
  $b('bdLeg').innerHTML='<span>🎁 посылка от бабы Зины — цену назначаешь сам</span><span>💰 торг у гаражей — ставка</span>'+(isPC()?'<span class="pc">⌨ стрелки + Enter, 1–4 — ответ</span>':'');scan($b('bdLeg'));}
function cellH(i){var x=B.cells[i],d=x.r!=null,cls='bdCell'+(d?' done '+(x.r===1?'ok':x.r===0?'no':'ps'):'')+(i===B.sel?' sel':'');
  var lab=tName(x.t)+' за '+x.v+(d?(x.r===1?', верно':x.r===0?', неверно':', пас'):'');
  return '<button class="'+cls+'" data-i="'+i+'" aria-label="'+E(lab)+'"'+(d?' disabled':'')+'><span class="v">'+(d?(x.r===1?'✓':x.r===0?'✗':'—'):fmt(x.v))+'</span></button>';}
function isPC(){try{return !!(W.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);}catch(e){return false;}}
function standing(){var a=[{id:'me',n:'Ты',sc:B.sc}].concat(B.rv.map(function(r){return {id:r.id,n:r.n,sc:r.sc};}));return a;}
function placeOf(){var p=1;B.rv.forEach(function(r){if(r.sc>B.sc)p++;});return p;}
function renderScore(){var a=standing(),mx=Math.max.apply(null,a.map(function(x){return x.sc;})),h='';
  a.forEach(function(x){var me=x.id==='me';h+='<div class="bdSc'+(me?' me':'')+(x.sc===mx&&mx>0?' lead':'')+'" data-who="'+x.id+'">'+(me?'':'<span class="av">'+av(x.id,'norm')+'</span>')
    +'<span class="lb">'+E(me?'Твой счёт':x.n)+'</span><span class="v" id="'+(me?'bdMe':'bdR_'+x.id)+'">'+fmt(x.sc)+'</span></div>';});
  $b('bdScore').innerHTML=h;
  var l=left(),tot=B.cells.length,ih='<span>Осталось клеток: <b>'+l+' из '+tot+'</b></span>';
  if(B.fin)ih+='<span>Дальше — <b>Финал у подъезда</b></span>';
  if(B.mode==='free'&&l===tot)ih+='<button class="btn sm" id="bdRe">🎲 Другие темы</button>';
  $b('bdInfo').innerHTML=ih;scan($b('bdInfo'));
  var re=$b('bdRe');if(re)re.onclick=function(){snd('tap');reroll();};}
function reroll(){if(!B||B.mode!=='free'||left()!==B.cells.length)return;var nb=build({mode:'free'});if(!nb)return;nb.say=null;B=nb;keep();render();say('Новые темы на табло. Выбирай!');}

/* ---------- клетка ---------- */
function openCell(i){if(!B||busy||Q)return;var x=B.cells[i];if(!x||x.r!=null)return;B.sel=i;snd('tap');
  var el=document.querySelector('#bdGrid [data-i="'+i+'"]');busy=true;
  var go=function(){busy=false;if(x.sp==='gift')return giftStart(i);if(x.sp==='bet')return betStart(i);ask({i:i,kind:'cell',q:QI[x.q],v:x.v});};
  if(el&&!quiet()&&spd()){el.classList.add(x.sp?'flipSp':'flip');if(x.sp){el.innerHTML='<span class="v">'+(x.sp==='gift'?'🎁':'💰')+'</span>';scan(el);snd(x.sp==='gift'?'safe':'coin');}
    setTimeout(go,x.sp?650:280);}else go();}
// «Посылка от бабы Зины»: тема — другая, цену назначаешь сам
function giftStart(i){var x=B.cells[i],q=QI[x.g]||QI[x.q];showQ();
  var h='<div class="bdPlate gift">🎁</div><h2>Посылка от бабы Зины!</h2><div class="bdWho"><span class="av">'+av('zina','happy')+'</span><p><b>Баба Зина:</b> Голубчик, тебе посылка! Вопрос про <b>'+E(tIc(q.t)+' '+tName(q.t))+'</b>. Сколько он стоит — решай сам.</p></div>'
    +'<div class="bdPick">'+PR.map(function(v){return '<button class="btn gold" data-v="'+v*(B.mult||1)+'">'+fmt(v*(B.mult||1))+'</button>';}).join('')+'</div>'
    +'<p class="bdNote">'+(B.minus?'Неверно — минус эта цена.':'Неверно — без минуса.')+'</p>';
  qc(h);$b('bdQc').querySelectorAll('[data-v]').forEach(function(b){b.onclick=function(){snd('coin');x.gv=+b.dataset.v;ask({i:i,kind:'gift',q:q,v:x.gv});};});
  Q={phase:'gift',i:i,keys:PR.map(function(v){return v*(B.mult||1);})};}
// «Торг у гаражей»: ставка от 100 до max(счёт, 500)
function betMax(){return Math.max(B.sc,500*(B.mult||1));}
function betStart(i){var x=B.cells[i],mx=betMax(),v=Math.min(mx,Math.max(x.v,100));showQ();
  Q={phase:'bet',i:i,v:v,mx:mx,mn:100};
  qc('<div class="bdPlate bet">💰</div><h2>Торг у гаражей!</h2><div class="bdWho"><span class="av">'+av('mihalych','wow')+'</span><p><b>Михалыч:</b> Тема — <b>'+E(tIc(x.t)+' '+tName(x.t))+'</b>. Сколько ставишь? Угадаешь — прибавлю, ошибёшься — ставка сгорит.</p></div>'
    +'<div class="bdBet"><button class="icon" id="bdBm" aria-label="Меньше">−</button><div class="bdBv" id="bdBv"></div><button class="icon" id="bdBp" aria-label="Больше">+</button></div>'
    +'<input type="range" class="bdRange" id="bdBr" min="100" max="'+mx+'" step="100" value="'+v+'" aria-label="Ставка">'
    +'<div class="bdPick sm"><button class="btn" data-q="100">100</button><button class="btn" data-q="'+x.v+'">'+fmt(x.v)+'</button><button class="btn" data-q="'+Math.max(100,Math.round(mx/200)*100)+'">половина</button><button class="btn" data-q="'+mx+'">всё · '+fmt(mx)+'</button></div>'
    +'<div class="row"><button class="btn accent big" id="bdBgo">Ставлю</button></div>'+(isPC()?'<p class="bdKb">← → — ставка, Enter — ставлю</p>':''));
  var set=function(n){Q.v=Math.max(Q.mn,Math.min(Q.mx,Math.round(n/100)*100));$b('bdBv').textContent=fmt(Q.v);$b('bdBr').value=Q.v;};
  Q.set=set;set(v);
  $b('bdBm').onclick=function(){snd('tap');set(Q.v-100);};$b('bdBp').onclick=function(){snd('tap');set(Q.v+100);};
  $b('bdBr').oninput=function(){set(+this.value);};
  $b('bdQc').querySelectorAll('[data-q]').forEach(function(b){b.onclick=function(){snd('tap');set(+b.dataset.q);};});
  $b('bdBgo').onclick=function(){snd('coin');x.bv=Q.v;ask({i:i,kind:'bet',q:QI[x.q],v:Q.v});};}
// «Финал у подъезда»
function finStart(){var f=B.fin,q=QI[f.q],mx=Math.max(0,B.sc);showQ(true);
  // ставки соседей — честное правило: уверенный ставит половину, неуверенный — четверть
  f.rs=B.rv.map(function(r){var p=rivP(r,q);return r.sc>0?Math.max(0,Math.round(r.sc*(p>=.6?.5:.25)/100)*100):0;});
  if(mx<=0){Q={phase:'fin0'};qc('<div class="bdPlate fin">🏆</div><h2>Финал у подъезда</h2><p>Тема: <b>'+E(tIc(q.t)+' '+tName(q.t))+'</b>.</p><p>Ставить нечего — счёт '+fmt(B.sc)+'. Ответь для чести, без ставки!</p><div class="row"><button class="btn accent big" id="bdFgo">К вопросу</button></div>');
    $b('bdFgo').onclick=function(){f.v=0;ask({kind:'fin',q:q,v:0});};return;}
  var v=Math.max(100,Math.round(mx/200)*100);if(v>mx)v=mx;Q={phase:'bet',fin:1,v:v,mx:mx,mn:0};
  qc('<div class="bdPlate fin">🏆</div><h2>Финал у подъезда</h2><div class="bdWho"><span class="av">'+av('mihalych','wow')+'</span><p><b>Михалыч:</b> Последний вопрос — про <b>'+E(tIc(q.t)+' '+tName(q.t))+'</b>. Ставь любую часть счёта: верно — прибавлю, неверно — сгорит.</p></div>'
    +'<div class="bdBet"><button class="icon" id="bdBm" aria-label="Меньше">−</button><div class="bdBv" id="bdBv"></div><button class="icon" id="bdBp" aria-label="Больше">+</button></div>'
    +'<input type="range" class="bdRange" id="bdBr" min="0" max="'+mx+'" step="100" value="'+v+'" aria-label="Ставка">'
    +'<div class="bdPick sm"><button class="btn" data-q="0">0</button><button class="btn" data-q="'+Math.round(mx/400)*100+'">четверть</button><button class="btn" data-q="'+Math.round(mx/200)*100+'">половина</button><button class="btn" data-q="'+mx+'">всё · '+fmt(mx)+'</button></div>'
    +'<div class="row"><button class="btn accent big" id="bdBgo">Ставлю</button></div>');
  var set=function(n){Q.v=Math.max(0,Math.min(Q.mx,n>=Q.mx?Q.mx:Math.round(n/100)*100));$b('bdBv').textContent=fmt(Q.v);$b('bdBr').value=Q.v;};Q.set=set;set(v);
  $b('bdBm').onclick=function(){snd('tap');set(Q.v-100);};$b('bdBp').onclick=function(){snd('tap');set(Q.v+100);};$b('bdBr').oninput=function(){set(+this.value);};
  $b('bdQc').querySelectorAll('[data-q]').forEach(function(b){b.onclick=function(){snd('tap');set(+b.dataset.q);};});
  $b('bdBgo').onclick=function(){snd('coin');f.v=Q.v;ask({kind:'fin',q:q,v:Q.v});};}

/* ---------- вопрос ---------- */
function showQ(fin){var o=$b('bdQ');o.classList.add('on');o.classList.toggle('fin',!!fin);}
function hideQ(){var o=$b('bdQ');o.classList.remove('on','fin');Q=null;}
function qc(h){var c=$b('bdQc');c.innerHTML=h;c.scrollTop=0;scan(c);if(!quiet()){c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');}}
function ask(o){var q=o.q;if(!q){hideQ();return;}showQ(o.kind==='fin');
  if(!seen(q)){markSeen(q);}
  Q={phase:'ask',i:o.i,kind:o.kind,q:q,v:o.v,perm:shuffle([0,1,2,3]),gone:new Set(),st:'ask',sel:-1,hint:-1,hs:[],res:null};
  if(o.kind==='fin')B.fin.st=1;else B.cur={i:o.i,k:o.kind,v:o.v};keep();renderQ();}
var KN={cell:'',gift:'Посылка от бабы Зины',bet:'Торг у гаражей',fin:'Финал у подъезда'};
function renderQ(){if(!Q||Q.phase!=='ask')return;var q=Q.q,done=Q.st==='done',right=Q.perm.indexOf(0),h='';
  h+='<div class="bdPrice'+(Q.kind!=='cell'?' sp':'')+'"><span>💰</span><b>'+fmt(Q.v)+'</b></div>';
  h+='<div class="bdQm">'+E(tIc(q.t)+' '+tName(q.t))+(KN[Q.kind]?' · '+E(KN[Q.kind]):'')+'</div><div class="bdQt">'+E(q.q)+'</div><div class="bdAns">';
  for(var k=0;k<4;k++){var c='';if(Q.gone.has(k))c='gone';if(done&&k===right)c='ok';else if(done&&k===Q.sel)c='no';else if(Q.st==='wait'&&k===Q.sel)c='sel';else if(done)c+=' dim';
    if(Q.hint===k&&!done)c+=' tip';
    h+='<button class="bdA '+c+'" data-k="'+k+'"'+(Q.st!=='ask'||Q.gone.has(k)?' disabled':'')+'><i>'+LET[k]+'</i><span>'+E(q.a[Q.perm[k]])+'</span>'+(isPC()?'<u class="kb">'+(k+1)+'</u>':'')+'</button>';}
  h+='</div>';
  if(Q.say)h+='<div class="bdHs"><span class="av">'+av(Q.say.who,Q.say.m)+'</span><span class="t">'+Q.say.h+'</span></div>';
  if(done){h+=resH();if(q.x)h+='<div class="bdX">💡 '+E(q.x)+'</div>';
    h+='<div class="bdFoot"><button class="btn green big" id="bdNext">'+(nextIsEnd()?'Итоги':'Дальше →')+'</button><button class="lnk noenter" id="bdRep">⚑ Ошибка в вопросе?</button></div>';}
  else{var free=B.mode==='free',hf=B.h.ff;
    h+='<div class="bdFoot lifes"><button class="life" id="bdFF"'+(hf||Q.st!=='ask'?' disabled':'')+'>½<small>50 на 50<br>'+(hf?'уже было':'даром')+'</small></button>';
    h+='<button class="life" id="bdNb"'+(!free||Q.hs.indexOf('nb')>=0||Q.st!=='ask'?' disabled':'')+'>🙋<small>Сосед<br>'+(free?COST.nb+' 💰':'нельзя')+'</small></button>';
    h+='<button class="life" id="bdZi"'+(!free||Q.hs.indexOf('zi')>=0||Q.st!=='ask'?' disabled':'')+'>👵<small>Баба Зина<br>'+(free?COST.zi+' 💰':'нельзя')+'</small></button>';
    if(B.minus&&Q.kind==='cell')h+='<button class="life pass" id="bdPass"'+(Q.st!=='ask'?' disabled':'')+'>🏳<small>Пас<br>без минуса</small></button>';
    h+='</div>';if(isPC())h+='<p class="bdKb">1–4 или А–Г / A–D — ответ'+(B.minus&&Q.kind==='cell'?', 0 — пас':'')+', Esc — к табло</p>';}
  var c=$b('bdQc');c.innerHTML=h;scan(c);
  c.querySelectorAll('.bdA').forEach(function(b){b.onclick=function(){answer(+b.dataset.k);};});
  var f=function(id,fn){var b=$b(id);if(b)b.onclick=fn;};
  f('bdFF',fifty);f('bdNb',function(){paidHint('nb');});f('bdZi',function(){paidHint('zi');});f('bdPass',pass);f('bdNext',nextQ);f('bdRep',report);
  if(done){var nb=$b('bdNext');if(nb&&c.scrollHeight>c.clientHeight)setTimeout(function(){try{nb.scrollIntoView({block:'end',behavior:quiet()?'auto':'smooth'});}catch(e){}},30);}}
function resH(){var r=Q.res;if(!r)return '';var h='<div class="bdRes">';
  h+='<span class="me '+(r.ok?'ok':r.pass?'ps':'no')+'">Ты '+(r.pass?'— пас':r.d>0?'+'+fmt(r.d):r.d<0?fmt(r.d):(r.ok?'✓':'✗'))+'</span>';
  (r.rv||[]).forEach(function(x,j){var rr=B.rv[j];h+='<span class="rv '+(x.a==null?'ps':x.a?'ok':'no')+'" style="animation-delay:'+(.25+j*.25)+'s"><i class="av">'+av(rr.id,x.a?'happy':x.a==null?'norm':'sad')+'</i>'+E(rr.n)+' '+(x.a==null?'молчит':x.d>0?'+'+fmt(x.d):x.d<0?fmt(x.d):(x.a?'✓':'✗'))+'</span>';});
  return h+'</div>';}
function nextIsEnd(){return left()===0&&(!B.fin||B.fin.st>=2||Q&&Q.kind==='fin');}
function answer(k){if(!Q||Q.phase!=='ask'||Q.st!=='ask'||Q.gone.has(k))return;stat(function(){STAT.move();});
  Q.st='wait';Q.sel=k;snd('pick');renderQ();var t=Math.round(700*spd());if(t)setTimeout(function(){snd('wait');},60);setTimeout(function(){reveal(k);},t);}
function minusFor(kind){return kind==='bet'||kind==='fin'?true:B.minus;}
function reveal(k){if(!Q||Q.st!=='wait')return;var q=Q.q,ok=k>=0&&Q.perm[k]===0,pass=k<0,v=Q.v,d=ok?v:(!pass&&minusFor(Q.kind)?-v:0);
  Q.st='done';Q.res={ok:ok,pass:pass,d:d,rv:[]};B.sc+=d;B.cur=null;
  var x=Q.i!=null?B.cells[Q.i]:null;if(x)x.r=pass?-1:ok?1:0;
  // соседи-соперники: тот же вопрос, честная вероятность
  if(Q.kind==='cell'&&x){B.rv.forEach(function(r,j){var p=rivP(r,q),u=x.u&&x.u[j]!=null?x.u[j]:Math.random();
      if(B.minus&&p<.5){Q.res.rv.push({a:null,d:0});return;}var a=u<p,dd=a?x.v:(B.minus?-x.v:0);r.sc+=dd;Q.res.rv.push({a:a,d:dd});});}
  if(Q.kind==='fin'){var f=B.fin;f.st=2;B.rv.forEach(function(r,j){var p=rivP(r,q),a=(f.u&&f.u[j]!=null?f.u[j]:Math.random())<p,s=f.rs?f.rs[j]:0,dd=a?s:-s;r.sc+=dd;Q.res.rv.push({a:a,d:dd});});}
  if(ok){try{S.correct=(S.correct||0)+1;if(!S.tc||typeof S.tc!=='object')S.tc={};var tc0=S.tc[q.t]||0;S.tc[q.t]=tc0+1;
      if(typeof TCM!=='undefined'&&TCM.indexOf(tc0+1)>=0&&TN[q.t])setTimeout(function(){toast(TMEDAL(tc0+1)+' '+TMNAME(tc0+1)+': «'+TN[q.t].n+'»!');},900);}catch(e){}
    snd('right');try{buzz(25);}catch(e){}}
  else if(!pass){snd('wrong');try{buzz([60,40,60]);}catch(e){}}
  var rvOk=Q.res.rv.map(function(z,j){return z.a?B.rv[j]:null;}).filter(Boolean),knew=rvOk.length?' А '+rvOk.map(function(r){return r.n;}).join(' и ')+(rvOk.length>1?' знали!':(RIV[rvOk[0].id]&&RIV[rvOk[0].id].f?' знала!':' знал!')):'';
  Q.say={who:'mihalych',m:ok?'happy':'sad',h:'<b>Михалыч:</b> '+E(ok?pick(['Верно!','В точку!','Правильно! Чисто, как у меня во дворе.','Вот это голова!'])+(Q.kind==='bet'?' Торг удался!':Q.kind==='gift'?' Посылка твоя!':'')
      :(pass?'Пас — тоже решение. ':pick(['Эх, мимо… ','Не угадал… ']))+'Верный ответ — «'+q.a[0]+'».'+(ok?'':knew))};
  hook(q,ok,pass);keep();renderQ();renderScore();
  if(d>0)fly();else if(d<0)shake();}
function hook(q,ok,pass){var cell=Q.i!=null?Q.i+1:B.cells.length+1;
  var info={id:q.i,ok:ok?1:0,hint:Q.hs.join(','),mode:MODE[B.mode].m,step:cell,price:Q.v,t:q.t,d:q.d,n:1,fin:1,sp:Q.kind==='cell'?'':Q.kind,pass:pass?1:0};
  try{if(W.UI&&UI.answered)UI.answered(info);}catch(e){}}
function pass(){if(!Q||Q.st!=='ask'||Q.kind!=='cell'||!B.minus)return;snd('tap');Q.st='wait';reveal(-1);}
function fifty(){if(!Q||Q.st!=='ask'||B.h.ff)return;B.h.ff=1;Q.hs.push('ff');var right=Q.perm.indexOf(0),w=shuffle([0,1,2,3].filter(function(k){return k!==right&&!Q.gone.has(k);}));
  for(var j=0;j<w.length-1&&j<2;j++)Q.gone.add(w[j]);if(Q.gone.has(Q.hint))Q.hint=-1;stat(function(){STAT.use('hint');});snd('hint');
  Q.say={who:'mihalych',m:'norm',h:'<b>Михалыч:</b> Убрал два неверных. Выбирай!'};keep();renderQ();}
// «Сосед» / «Баба Зина» — свободная игра, за монеты; честная подсказка, как на лестнице (HELP/ZINA)
function paidHint(k){if(!Q||Q.st!=='ask'||B.mode!=='free'||Q.hs.indexOf(k)>=0)return;var c=COST[k];
  if(S.coins<c){toast('Не хватает монет: нужно '+c+' 💰');return;}
  setCoins(S.coins-c);stat(function(){STAT.ev('spend',{k:'b'+k,c:c});STAT.use('hint');});Q.hs.push(k);
  var q=Q.q,id='zina',h=ZINA;
  if(k==='nb'){var ids=Object.keys(HELP),bestI=ids.filter(function(x){return HELP[x].top.indexOf(q.t)>=0;});id=pick(bestI.length?bestI:ids);h=HELP[id];}
  var p=h.base[q.d-1];if(h.top.indexOf(q.t)>=0)p=Math.min(.96,p+h.bonus);
  var right=Q.perm.indexOf(0),av4=[0,1,2,3].filter(function(x){return x!==right&&!Q.gone.has(x);}),a=Math.random()<p||!av4.length?right:pick(av4);
  var conf=p>=.8?'sure':p>=.55?'think':'guess';Q.hint=a;snd('hint');
  Q.say={who:id,m:conf==='sure'?'happy':conf==='guess'?'wow':'norm',h:'<b>'+E(h.n)+':</b> '+fill(E(pick(HL[id][conf])),{a:'<b>'+LET[a]+' — «'+E(q.a[Q.perm[a]])+'»</b>'})};
  renderQ();$b('bdCoins').textContent='💰 '+S.coins;scan($b('bdCoins'));}
function report(){if(!Q)return;var q=Q.q;if(S.bad.indexOf(q.i)<0)S.bad.push(q.i);try{save();}catch(e){}toast('Спасибо! Вопрос больше не попадётся.');var b=$b('bdRep');if(b)b.remove();}
function nextQ(){if(!Q||Q.st!=='done')return;snd('tap');var kind=Q.kind;hideQ();
  if(kind==='fin')return finish();
  if(left()===0){if(B.fin&&B.fin.st<2)return finIntro();return finish();}
  var l=left();say(l===1?'Последняя клетка — и финал!':B.sc>=Math.max.apply(null,B.rv.map(function(r){return r.sc;}).concat([0]))&&B.sc>0?pick(['Ты впереди! Не сбавляй.','Ведёшь! Соседи завидуют.']):pick(['Выбирай следующую клетку.','Дальше! Какая тема?','Соседи не дремлют — выбирай!']),'mihalych',B.sc>0?'happy':'norm');
  renderGrid();renderScore();}
function finIntro(){say('Все клетки сыграны! Финал у подъезда!','mihalych','wow');renderGrid();renderScore();
  var s=$b('scr-board');if(!quiet())s.classList.add('bulbs');snd('safe');setTimeout(function(){finStart();},Math.round(900*spd()));}
/* ---------- итог ---------- */
function finish(){if(!B||B.done)return;B.done=1;var s=$b('scr-board');s.classList.remove('bulbs');
  var place=placeOf(),win=place===1,sc=B.sc,coins=(B.mode==='free'||B.mode==='day')?Math.max(0,Math.floor(sc/50))+(win&&sc>0?20:0):0;
  S.bdN=(S.bdN||0)+1;if(win)S.bdW=(S.bdW||0)+1;if(B.mode==='free')S.bdBest=Math.max(S.bdBest||0,sc);
  if(coins){S.coins+=coins;stat(function(){STAT.earn('lvl',coins);});}
  var res={mode:B.mode,score:sc,place:place,win:win,rivals:B.rv.map(function(r){return {id:r.id,n:r.n,sc:r.sc};}),k:B.k,coins:coins};
  stat(function(){STAT.end(win?'win':'lose',{s:sc,pl:place,k:B.mode});});
  keep();try{updCoins();}catch(e){}
  if(win){snd('win');try{confetti();}catch(e){}}else snd(place===2?'safe':'lose');
  var a=standing().sort(function(x,y){return y.sc-x.sc;}),rows='';
  a.forEach(function(x,j){rows+='<div class="bdPl'+(x.id==='me'?' me':'')+'"><b>'+(j+1)+'</b>'+(x.id==='me'?'<span class="av meI">🏅</span>':'<span class="av">'+av(x.id,j===0?'happy':'norm')+'</span>')+'<span>'+E(x.id==='me'?'Ты':x.n)+'</span><em>'+fmt(x.sc)+'</em></div>';});
  var head=win?'Победа на табло!':place===2?'Второе место':'Соседи сегодня сильнее',
    line=win?pick(['Весь двор аплодирует! Вот это знаток!','Табло твоё! Хоть в телевизор!']):pick(['Ничего, в другой раз отыграешься!','Достойно! Соседи ещё попотеют.']);
  showQ();Q={phase:'end'};
  qc('<div class="bdPlate end">'+(win?'🏆':'⭐')+'</div><h2>'+head+'</h2><p>'+E(line)+'</p><div class="bdPls">'+rows+'</div>'
    +(coins?'<p class="goal">+'+coins+' 💰 за табло</p>':'')+(B.mode==='free'&&sc>=(S.bdBest||0)&&sc>0?'<p class="goal">⭐ Твой рекорд табло: '+fmt(sc)+'</p>':'')
    +(B.mode==='day'?'<p class="bdNote">Табло дня — одно на весь двор. Завтра — новое!</p>':'')
    +'<div class="row">'+(B.mode==='free'?'<button class="btn accent big" id="bdAgain">↻ Ещё табло</button>':'')+'<button class="btn" id="bdMenu">'+(B.onEnd?'Дальше':'В меню')+'</button></div>');
  if(win&&!quiet())$b('bdQ').classList.add('rs');
  var cb=B.onEnd;B.onEnd=null;
  var out=function(){$b('bdQ').classList.remove('rs');hideQ();if(cb){try{cb(res);}catch(e){}}else try{openMenu();}catch(e){}};
  var ag=$b('bdAgain');if(ag)ag.onclick=function(){$b('bdQ').classList.remove('rs');hideQ();startFree(true);};
  $b('bdMenu').onclick=function(){snd('tap');out();};
  try{UI.emit('board',res);}catch(e){}}
/* ---------- эффекты ---------- */
function fly(){if(quiet()||!document.body.animate&&!Element.prototype.animate)return bump();var a=document.querySelector('#bdQc .bdA.ok'),t=$b('bdMe');if(!a||!t)return bump();
  var r=a.getBoundingClientRect(),s=t.getBoundingClientRect(),coin=lk()&&LK.ic?LK.ic('coin'):'💰';
  for(var n=0;n<5;n++)(function(n){var c=document.createElement('span');c.className='bdFly';c.innerHTML=coin;c.style.left=(r.right-60+n*8)+'px';c.style.top=(r.top+r.height/2-14)+'px';document.body.appendChild(c);
    try{c.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:'translate('+(s.left+s.width/2-r.right+60-n*8)+'px,'+(s.top-r.top)+'px) scale(.5)',opacity:.3}],{duration:750,delay:n*60,easing:'cubic-bezier(.5,-.3,.7,1)',fill:'forwards'});}catch(e){}
    setTimeout(function(){c.remove();},900+n*60);})(n);
  setTimeout(bump,700);setTimeout(function(){snd('coin');},650);}
function bump(){var v=$b('bdMe');if(!v)return;v.classList.remove('bump');void v.offsetWidth;v.classList.add('bump');}
function shake(){var c=document.querySelector('#bdQc .bdA.no');if(c&&!quiet()){c.classList.remove('shk');void c.offsetWidth;c.classList.add('shk');}}

/* ---------- вход, выход, клавиши ---------- */
function back(){if(Q&&Q.phase==='end'){$b('bdMenu')&&$b('bdMenu').click();return;}
  if(Q&&(Q.phase==='ask'&&Q.st!=='ask'))return;
  var t=B.mode==='free'?'Табло подождёт: продолжишь с этого места.':B.mode==='day'?'Табло дня подождёт до конца дня — продолжишь с этого места.':'Матч закончится поражением.';
  modal('<h2>Выйти?</h2><p>'+E(t)+'</p><div class="row"><button class="btn green" id="qStay">Остаться</button><button class="btn noenter" id="qLeave">Выйти</button></div>');
  $b('qStay').onclick=hideModal;$b('qLeave').onclick=function(){hideModal();
    if(B.mode==='cup'||B.mode==='champ'){B.done=1;var res={mode:B.mode,score:B.sc,place:B.rv.length+1,win:false,quit:1,rivals:B.rv.map(function(r){return {id:r.id,n:r.n,sc:r.sc};}),k:B.k};
      stat(function(){STAT.end('quit',{s:B.sc,k:B.mode});});var cb=B.onEnd;hideQ();B=null;if(cb)try{cb(res);}catch(e){}else openMenu();try{UI.emit('board',res);}catch(e){}return;}
    // свободная/дневная: открытый вопрос остаётся «в клетке» — после возврата он откроется снова (переиграть подсказками нельзя: 50 на 50 уже потрачена)
    stat(function(){STAT.end('quit',{s:B.sc,k:B.mode});});keep();hideQ();try{openMenu();}catch(e){}};}
function key(e){if(!onBoard()||e.ctrlKey||e.metaKey||e.altKey)return;var ad=$b('ad');if(ad&&ad.classList.contains('on'))return;
  if(typeof modalOn!=='undefined'&&modalOn)return; // окна игры — общий обработчик
  var k=e.key,stop=function(){e.preventDefault();e.stopPropagation();};
  if(k==='Escape'){stop();back();return;}
  if(Q){if(Q.phase==='ask'){if(Q.st==='done'&&(k==='Enter'||k===' ')){stop();nextQ();return;}
      var m={'1':0,'2':1,'3':2,'4':3,'a':0,'b':1,'c':2,'d':3,'а':0,'б':1,'в':2,'г':3}[String(k).toLowerCase()];
      if(m!=null&&Q.st==='ask'){stop();answer(m);return;}
      if(k==='0'&&Q.st==='ask'&&B.minus&&Q.kind==='cell'){stop();pass();return;}return;}
    if(Q.phase==='bet'&&Q.set){if(k==='ArrowLeft'||k==='ArrowDown'){stop();Q.set(Q.v-100);return;}if(k==='ArrowRight'||k==='ArrowUp'){stop();Q.set(Q.v+100);return;}
      if(k==='Enter'){stop();var g=$b('bdBgo');if(g)g.click();return;}return;}
    if(Q.phase==='gift'){var n={'1':0,'2':1,'3':2,'4':3,'5':4}[k];if(n!=null){stop();var bs=document.querySelectorAll('#bdQc [data-v]');if(bs[n])bs[n].click();}return;}
    if(Q.phase==='fin0'&&k==='Enter'){stop();$b('bdFgo').click();return;}
    if(Q.phase==='end'&&k==='Enter'){stop();($b('bdAgain')||$b('bdMenu')).click();return;}
    return;}
  if(!B)return;var n2=B.cols,i=B.sel<0?firstFree():B.sel,c=i%n2,r=i/n2|0,rows=lay==='rows';
  var mv={ArrowLeft:rows?[0,-1]:[-1,0],ArrowRight:rows?[0,1]:[1,0],ArrowUp:rows?[-1,0]:[0,-1],ArrowDown:rows?[1,0]:[0,1]}[k];
  if(mv){stop();if(B.sel<0){B.sel=i;}else{c=Math.max(0,Math.min(n2-1,c+mv[0]));r=Math.max(0,Math.min(4,r+mv[1]));B.sel=r*n2+c;}renderGrid();
    var el=document.querySelector('#bdGrid [data-i="'+B.sel+'"]');if(el)try{el.focus({preventScroll:false});}catch(_){}return;}
  if((k==='Enter'||k===' ')&&B.sel>=0){stop();openCell(B.sel);}}
function firstFree(){for(var i=0;i<B.cells.length;i++)if(B.cells[i].r==null)return i;return 0;}

/* ---------- режимы ---------- */
function lockToast(){toast('Табло Михалыча откроется на 5-м уровне. Проходи лестницы!');}
function resumeOpen(){if(!B)return;enter();
  // открытый вопрос (вышли посреди) — открываем снова: это та же клетка, ответ не переигрывается подсказками
  if(B.fin&&B.fin.st===1&&left()===0){ask({kind:'fin',q:QI[B.fin.q],v:B.fin.v||0});return;}
  var c=B.cur;if(c&&B.cells[c.i]&&B.cells[c.i].r==null){var x=B.cells[c.i];B.sel=c.i;renderGrid();ask({i:c.i,kind:c.k,q:QI[c.k==='gift'?(x.g||x.q):x.q],v:c.v});return;}
  if(left()===0&&!B.done){if(B.fin&&B.fin.st<2)finIntro();else finish();}}
function startFree(again){if(!open())return lockToast();var nb=build({mode:'free'});if(!nb){toast('Не хватает вопросов для табло');return;}
  B=nb;B.say=null;keep();stat(function(){STAT.lvl(0,'bd');});enter();
  if(!S.bdTip){S.bdTip=1;try{save();}catch(e){}howTo();}}
function openDay(){if(!open())return lockToast();var k=dayKey(0),d=S.bdDay;
  if(d&&d.k===k&&d.s){var b=unsnap(d.s);if(b){B=b;B.sub='';if(B.done){enter();showDone();return;}stat(function(){STAT.lvl(0,'bdd');});resumeOpen();return;}}
  var nb=build({mode:'day',k:k,seed:k*7919+4243});if(!nb){toast('Табло дня не собралось');return;}
  B=nb;keep();stat(function(){STAT.lvl(0,'bdd');});enter();if(!S.bdTip){S.bdTip=1;howTo();}}
function showDone(){var sc=B.sc,pl=placeOf();say('Табло дня уже сыграно: '+fmt(sc)+' очков, '+pl+'-е место. Завтра — новое табло!','mihalych','happy');}
function startMatch(o){o=o||{};var nb=build({mode:o.mode==='cup'?'cup':'champ',seed:o.seed,cols:o.cols,mult:o.mult,rivals:o.rivals||['zina'],topics:o.topics,noGift:o.noGift,noBet:o.noBet,noFinal:o.noFinal,title:o.title,sub:o.sub,onEnd:o.onEnd});
  if(!nb){toast('Не хватает вопросов для табло');return false;}B=nb;stat(function(){STAT.lvl(0,o.mode==='cup'?'bdc':'bdf');});enter();return true;}
function hub(){if(!open())return lockToast();var k=dayKey(0),d=S.bdDay,dd=d&&d.k===k&&d.s,dn=dd&&d.s.d,cur=S.bdCur&&unsnap(S.bdCur);
  var ds=dn?'сыграно: '+fmt(d.s.sc)+' · завтра новое':dd?'начато — продолжить':'одно на весь двор · 3 темы',fs=cur?'продолжить: счёт '+fmt(cur.sc)+', осталось '+cur.cells.filter(function(x){return x.r==null;}).length+' клеток':'5 тем × 100–500 · соседи-соперники';
  modal('<div class="av">'+av('mihalych','happy')+'</div><h2>Табло Михалыча</h2><p>Выбираешь тему и цену: дороже — труднее. Соседи отвечают на те же вопросы — кто больше наберёт?</p>'
    +'<div class="row"><button class="btn blue big" id="bdGoDay">📅 Табло дня<small>'+E(ds)+'</small></button>'
    +'<button class="btn accent big" id="bdGoFree">▶ '+(cur?'Продолжить табло':'Свободная игра')+'<small>'+E(fs)+'</small></button>'
    +(cur?'<button class="btn" id="bdGoNew">🎲 Новое табло</button>':'')
    +'<button class="lnk noenter" id="bdHow">Как играть?</button><button class="btn" id="mCancel">Закрыть</button></div>');
  $b('bdGoDay').onclick=function(){snd('tap');hideModal();openDay();};
  $b('bdGoFree').onclick=function(){snd('tap');hideModal();if(cur){B=cur;stat(function(){STAT.lvl(0,'bd');});resumeOpen();}else startFree();};
  if($b('bdGoNew'))$b('bdGoNew').onclick=function(){snd('tap');hideModal();delete S.bdCur;startFree();};
  $b('bdHow').onclick=function(){snd('tap');howTo(hub);};$b('mCancel').onclick=hideModal;}
function howTo(after){modal('<h2>Как играть на табло</h2><div class="how"><p>🎯 Выбери клетку: тема и цена. 100 — легко, 500 — трудно. Верно — цена в счёт.</p>'
    +'<p>'+(minusOn()?'➖ Неверно — минус цена. Не уверен — жми «Пас».':'➖ Пока ты не дошёл до района «Улица», неверный ответ без минуса.')+'</p>'
    +'<p>🎁 Посылка от бабы Зины — вопрос другой темы, цену назначаешь сам.</p><p>💰 Торг у гаражей — ставка: угадал — прибавка, ошибся — сгорает.</p>'
    +'<p>🏆 В конце — Финал у подъезда: ставишь часть счёта на последний вопрос.</p><p>½ «50 на 50» — одна на табло даром. Таймера нет.</p></div>'
    +'<div class="row"><button class="btn accent" id="bdHowOk">Понятно</button></div>');
  $b('bdHowOk').onclick=function(){hideModal();if(typeof after==='function')after();};}

/* ---------- слияние облака (зовётся из mergeSave ДО общего правила «настройки из более нового») ---------- */
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function merge(d){if(!isO(d))return;try{
  ['bdN','bdW','bdBest'].forEach(function(f){var a=+S[f]||0,b=+d[f]||0,m=Math.max(a,b);if(m){S[f]=m;d[f]=m;}});
  if(isO(d.bdDays)||isO(S.bdDays)){var u={},a=isO(S.bdDays)?S.bdDays:{},b=isO(d.bdDays)?d.bdDays:{},k;for(k in a)if(typeof a[k]==='number')u[k]=a[k];for(k in b)if(typeof b[k]==='number')u[k]=Math.max(u[k]==null?-1e9:u[k],b[k]);
    var ks=Object.keys(u).sort();while(ks.length>DAYS_KEEP)delete u[ks.shift()];S.bdDays=u;d.bdDays=u;}
  if(isO(d.bdDay)||isO(S.bdDay)){var x=isO(S.bdDay)?S.bdDay:null,y=isO(d.bdDay)?d.bdDay:null,cnt=function(z){return z&&z.s&&Array.isArray(z.s.x)?z.s.x.filter(function(c){return c.r!=null;}).length+(z.s.d?100:0)+(z.s.f&&z.s.f.st?(z.s.f.st*10):0):0;};
    var w=!x?y:!y?x:(y.k>x.k||y.k===x.k&&cnt(y)>cnt(x))?y:x;S.bdDay=w;d.bdDay=w;}
  if(d.bdTip||S.bdTip){S.bdTip=1;d.bdTip=1;}}catch(e){}}

/* ---------- гнёзда UX: плитка на главном, экраны роутера ---------- */
function tile(){var k=dayKey(0),d=S.bdDay,dn=d&&d.k===k&&d.s&&d.s.d;
  if(!open())return UI.tile({ic:'🔒',t:'Табло Михалыча',s:'откроется на 5-м уровне',cls:'lock',go:'board'});
  return UI.tile({ic:'🏆',t:'Табло Михалыча',s:dn?'табло дня: '+fmt(d.s.sc)+' · сыграть ещё':S.bdCur?'продолжить табло':'табло дня ждёт · 5 тем × 100–500',tag:!S.bdN?'новое':dn?'':'сегодня',cls:'gold',go:'board'});}
function reg(){var W2=W;if(!Array.isArray(W2.homeSlots))W2.homeSlots=[];W2.homeSlots.push({id:'board',order:30,render:function(){try{return tile();}catch(e){return null;}}});
  if(W2.UI){UI.screen('board',function(o){if(o&&o.mode==='free')return startFree();if(o&&o.mode==='day')return openDay();hub();});UI.screen('bday',function(){openDay();});}}
reg();

/* ---------- снимки для витрины: ?demo=board | bday | bq | bbet | bgift | bfin | bend | brows ---------- */
function demo(){var p=new URLSearchParams(location.search),d=p.get('demo');if(!d||!/^b/.test(d))return;
  try{S.lvl=Math.max(S.lvl||0,24);}catch(e){}
  var mode=d==='bday'?'day':'free';
  if(mode==='day'){var k=dayKey(0);B=build({mode:'day',k:k,seed:k*7919+4243});}else B=build({mode:'free',topics:['ussr','kino','geo','kitchen','space'].filter(function(t){return BYT[t];})});
  if(!B)return;B.minus=d!=='bq0';var n=B.cells.length,pl=[0,1,2,B.cols,B.cols+1,3,2*B.cols,4];
  pl.forEach(function(i,j){var x=B.cells[i];if(!x||x.sp)return;x.r=j===3||j===6?0:1;B.sc+=x.r?x.v:(B.minus?-x.v:0);B.rv.forEach(function(r,jj){var a=x.u[jj]<rivP(r,QI[x.q]);r.sc+=a?x.v:(B.minus?-x.v:0);});});
  B.say=null;enter();var free=B.cells.map(function(x,i){return i;}).filter(function(i){return B.cells[i].r==null&&!B.cells[i].sp;});
  if(d==='bq'||d==='bq0'){var i=free.find(function(i){return (i/B.cols|0)===2;});if(i==null)i=free[0];B.sel=i;renderGrid();ask({i:i,kind:'cell',q:QI[B.cells[i].q],v:B.cells[i].v});}
  else if(d==='bok'){i=free[3];ask({i:i,kind:'cell',q:QI[B.cells[i].q],v:B.cells[i].v});setTimeout(function(){answer(Q.perm.indexOf(0));},50);}
  else if(d==='bbet'){i=B.cells.findIndex(function(x){return x.sp==='bet';});betStart(i);}
  else if(d==='bgift'){i=B.cells.findIndex(function(x){return x.sp==='gift';});giftStart(i);}
  else if(d==='bfin'){B.cells.forEach(function(x){if(x.r==null)x.r=1;});B.sc=Math.max(B.sc,2400);finIntro();}
  else if(d==='bend'){B.cells.forEach(function(x){if(x.r==null)x.r=1;});B.sc=4200;B.fin.st=2;finish();}
  else if(d==='bhub'){hub();}}
W.addEventListener('load',function(){setTimeout(demo,50);});

W.BOARD={open:hub,openDay:openDay,startFree:startFree,start:startMatch,minus:minusOn,district:distNo,merge:merge,
  day:function(){var k=dayKey(0),d=S.bdDay,s=d&&d.k===k&&d.s;return {k:k,done:!!(s&&s.d),score:s?+s.sc||0:0,place:s?(1+(s.rv||[]).filter(function(r){return r.sc>s.sc;}).length):0};},
  days:function(){return Object.assign({},S.bdDays||{});},
  // для автотестов
  _st:function(){return {B:B,Q:Q,lay:lay};},_answer:function(k){answer(k);},_next:function(){nextQ();},_open:function(i){openCell(i);},_pass:function(){pass();},_build:build,_pick5:pick5,RIV:RIV};
})();
