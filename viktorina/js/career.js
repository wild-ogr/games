/* «Карьера знатока» — 6 районов × 5 званий, очки знатока, печати двора, финалы районов (поток CAR буста 09.10.2026).
   Журнал: hobby-analytics/release-i/viktorina-boost/logs/CAR.md, замысел — 04-meta-economy.md §2.2, модель — tools/econ_car.py (читает блок CFG ниже).
   Грузится ПОСЛЕ основного скрипта index.html (нужны S, QI, QS, save, modal, portrait…; всё берётся в момент вызова).
   Наружу — только window.CAR. Поле сохранения — S.car (+ слияние облака CAR.merge, починка CAR.fix).
   - Очки знатока (ОЗ) = цена вопроса ÷ 10 (priceOf, js/price.js — BOARD) за каждый ВЕРНЫЙ ответ в любом режиме (через answerHook):
     викторина дня ×2, повторный круг темы ×0,5, вторник — ×2 за вопросы 100–200 (TD.mul). Неверный ответ очков не снимает.
   - Звание — по очкам (CFG.need), 5-е звание района — только победой в ФИНАЛЕ против чемпиона района (матч на табло BOARD; без BOARD — свой мини-матч),
     для финала нужны печати двора (CFG.finSeal; 1 печать в день за 3 из 5 дел «Сегодня» — js/today.js). После «Чемпиона города» — ★2, ★3… каждые CFG.star очков.
   - Старые игроки: очки = верных ответов × 20, печати = дни викторины дня; звание не ниже прежнего (RANKS по S.lvl), пройденные районы засчитаны. */
(function(){
'use strict';
var CFG=/*CFG*/{"need":[0,100,300,600,1000,2140,3400,4780,6280,7900,9640,11500,13480,15580,17800,20140,22600,25180,27880,30700,33640,36700,39880,43180,46600,50140,53800,57580,61480,65500],
 "finSeal":[1,4,10,18,36,48],
 "fin":["valerka","mityai","valya","kolya","zina","sansan"],
 "champ":{"valerka":{"acc":[0.70,0.48,0.28]},"mityai":{"acc":[0.75,0.55,0.33]},"valya":{"acc":[0.78,0.58,0.36]},"kolya":{"acc":[0.80,0.62,0.40]},"zina":{"acc":[0.84,0.66,0.44]},"sansan":{"acc":[0.87,0.70,0.48]}},
 "finCoins":[50,100,150,200,300,500],"finRetry":100,"minusFrom":2,
 "qday":60,"dayMul":2,"repMul":0.5,"star":5000,
 "task":{"oz":50,"c":5,"all":10},"chest":20,"chestSun":35,
 "series":[{"c":10},{"c":10},{"c":15},{"c":15},{"c":20},{"c":20},{"c":40,"x":"stamp"},{"c":10},{"c":15},{"c":15},{"c":20},{"c":20},{"c":25},{"c":45,"x":"frame:zav"},{"c":15},{"c":15},{"c":20},{"c":20},{"c":25},{"c":25},{"c":50,"x":"stamp"},{"c":15},{"c":20},{"c":20},{"c":25},{"c":25},{"c":30},{"c":30},{"c":35},{"c":60,"x":"deco"}],
 "stash":{"per":3,"max":30},
 "short":["Лавочка","Двор","Улица","Квартал","Район","Город"]}/*CFG*/;

/* ---------- районы, звания, чемпионы, рамки ---------- */
var DIST=[
 {id:'lav',n:'Лавочка',ic:'🪑',frame:'wood',opp:'valerka',open:'Табло и «Сегодня»'},
 {id:'dvor',n:'Двор',ic:'🏡',frame:'bronze',opp:'mityai',open:'Мой двор (1-й уровень построек), лига'},
 {id:'ul',n:'Улица',ic:'🛣',frame:'silver',opp:'valya',open:'Кубок выходного дня, альбом марок целиком; минус за неверный на табло'},
 {id:'kv',n:'Квартал',ic:'🏘',frame:'gold',opp:'kolya',open:'2-й уровень построек'},
 {id:'rn',n:'Район',ic:'🏙',frame:'board',opp:'zina',open:'3-й уровень построек, рамка «Чемпион»'},
 {id:'gor',n:'Город',ic:'🌆',frame:'city',opp:'sansan',open:'«Чемпион города ★2, ★3…» — без потолка'}];
var NAMES=[
 'Новичок','Слушатель лавочки','Любознательный сосед','Знаток подъезда','Голос лавочки',
 'Эрудит двора','Советчик двора','Умник двора','Звезда двора','Гроза двора',
 'Профессор лавочки','Книгочей улицы','Мастер кроссвордов','Почётный знаток','Знаток улицы',
 'Академик квартала','Энциклопедист','Светлая голова','Ходячая библиотека','Гордость квартала',
 'Мудрец района','Академик района','Голова района','Легенда района','Чемпион района',
 'Мудрец всего города','Живая энциклопедия','Гроссмейстер вопросов','Легенда города','Чемпион города'];
// прежние звания (RANKS по S.lvl, main до буста) → номер нового звания (старые названия сохранены внутри новой лестницы)
var OLD=[[0,0],[2,2],[5,3],[10,5],[20,10],[35,21],[60,25],[100,26]];
// рамки званий — данные для UX (портрет игрока в рамке звания; В6 из 06-visual-ux; классы fr-<id> в css/ui-home.css): дерево → медь → серебро → золото → «табло» → «город»;
// за серию входа — «Завсегдатай» (14-й день), «Месяц во дворе» (30-й, если нет YARD); «Чемпион района» — за победу над бабой Зиной
var FRAMES={
 wood:{n:'Деревянная',c1:'#b98a55',c2:'#7a5530',glow:''},
 bronze:{n:'Медная',c1:'#d98a4e',c2:'#8f4a1f',glow:''},
 silver:{n:'Серебряная',c1:'#e4e8ee',c2:'#7f8a99',glow:''},
 gold:{n:'Золотая',c1:'#ffd23f',c2:'#b8860b',glow:'#ffe58a'},
 board:{n:'«Табло»',c1:'#1c3f8f',c2:'#ffd23f',glow:'#ffd23f',lamps:1},
 city:{n:'«Город»',c1:'#7b4fb8',c2:'#ffd23f',glow:'#ffcf40',lamps:1,star:1},
 champ:{n:'«Чемпион района»',c1:'#c0392b',c2:'#ffd23f',glow:'#ffd23f',lamps:1},
 zav:{n:'«Завсегдатай»',c1:'#2f9e44',c2:'#1d6b2d',glow:''},
 month:{n:'«Месяц во дворе»',c1:'#ff8a1f',c2:'#b85a0c',glow:'#ffd9a8'}};
// чемпионы районов: кто, характер, реплики перед финалом / после победы игрока / после его поражения
var CH={
 valerka:{n:'Валерка',who:'школьник-отличник',hi:['Я тут чемпион лавочки! Ну, пока что. Сыграем?','Чур, я первый выбираю! Ой… по очереди? Ладно.'],win:['Нечестно! То есть… честно. Ты сильнее. Пойду учить уроки.'],lose:['Ура! Я опять чемпион лавочки! Приходи завтра — отыграешься.']},
 mityai:{n:'Дед Митяй',who:'гроза двора, домино и спорт',hi:['Двор — это тебе не лавочка, внучок. Посмотрим, каков ты в деле!','Я в этом дворе с шестьдесят второго года. Слыхал, говорят, ты умный? Удиви старика!'],win:['Ну, внучок… Уважил. Двор теперь твой — сам видел, никому не скажу, что не байка.'],lose:['Рано тебе ещё, внучок! Подучись и приходи — дед подождёт, хоть до ледохода.']},
 valya:{n:'Тётя Валя',who:'знает всё про всех на улице',hi:['Не толпитесь, граждане! На нашей улице я всех переспорила — подходите по одному.','Двадцать лет за прилавком — меня вопросами не удивишь!'],win:['Ну надо же! Вся улица теперь про тебя говорить будет. Вот что значит опыт!'],lose:['Не серчайте, заходите ещё! Завтра свежий завоз вопросов.']},
 kolya:{n:'Дядя Коля',who:'мастер на все руки',hi:['Квартал — дело серьёзное. Тут на глазок не выйдет — как по чертежу.','Очки протёр, кляссер отложил. Поехали!'],win:['Железно сыграл! Квартал — твой. Марку бы в честь тебя выпустить.'],lose:['Не сошлось сегодня. Подучи, где слабо, и приходи завтра — я пока марки разложу.']},
 zina:{n:'Баба Зина',who:'учительница, чемпион района',hi:['Здравствуй, внучок! Я сорок лет экзамены принимала. Садись, начнём.','Чемпионом района так просто не становятся. Тетрадку открыла — посмотрим, чему ты научился.'],win:['Садись, пять! Горжусь тобой, внучок. Иду соседке Гале хвастаться — ты чемпион района.'],lose:['Неплохо, внучок, но на четвёрку. Повтори слабые темы — и приходи завтра, пирожки будут.']},
 sansan:{n:'Сан Саныч',who:'из соседнего района, чемпион города',hi:['Здоро́во, сосед! Я Сан Саныч из соседнего района. Говорят, вы тут чемпиона вырастили? Ну-ну.','У нас в районе, знаешь, вопросы покруче. Сыграем по-соседски — честно!'],win:['Вот это да! Признаю — чемпион города ваш. Приезжай к нам в гости, чаю налью.'],lose:['Не обижайся, сосед. У нас в районе и не такие уходили. Завтра — реванш?']}};
var TOPN=function(t){try{return TN[t]?TN[t].n:t;}catch(e){return t;}};

/* ---------- сохранение: S.car = {v, oz, sl, sd, fw, ft:{d,n}, ls:{t:ошибок}, hi} ---------- */
function dk(){try{return dayKey(0);}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function num(x){return typeof x==='number'&&isFinite(x)&&x>=0?x:0;}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function oldRank(lv){var r=0;for(var i=0;i<OLD.length;i++)if(lv>=OLD[i][0])r=OLD[i][1];return r;}
function migrate(){
  // перенос старого игрока: честное звание без потерь (прежнее звание по уровням — нижняя граница), печати — дни викторины дня
  var days=0;try{for(var k in S.daily)days++;}catch(e){}
  var r=oldRank(num(S.lvl)),oz=Math.round(num(S.correct)*20);
  var fw=Math.floor((r+1)/5); // районы, чьё 5-е звание уже было у игрока (или ниже прежнего) — финал засчитан
  oz=Math.max(oz,CFG.need[r]);
  S.car={v:1,oz:oz,sl:days,sd:0,fw:fw,ft:{d:0,n:0},ls:{},hi:r,old:r};
}
function fix(){
  if(!isO(S.car)){migrate();return;}
  var c=S.car;c.v=1;c.oz=num(c.oz);c.sl=Math.floor(num(c.sl));c.sd=num(c.sd);c.fw=Math.min(6,Math.floor(num(c.fw)));
  if(!isO(c.ft))c.ft={d:0,n:0};c.ft.d=num(c.ft.d);c.ft.n=num(c.ft.n);if(!isO(c.ls))c.ls={};c.hi=Math.min(29,Math.floor(num(c.hi)));
}
// облако: очки, печати, финалы — максимум; попытки финала за день — по дню и максимуму
function merge(d){
  if(!d||!isO(d.car))return;fix();var a=S.car,b=d.car;
  a.oz=Math.max(a.oz,num(b.oz));a.sl=Math.max(a.sl,Math.floor(num(b.sl)));a.sd=Math.max(a.sd,num(b.sd));a.fw=Math.max(a.fw,Math.min(6,Math.floor(num(b.fw))));
  a.hi=Math.max(a.hi,Math.min(29,Math.floor(num(b.hi))));
  if(isO(b.ft)){if(num(b.ft.d)>a.ft.d)a.ft={d:num(b.ft.d),n:num(b.ft.n)};else if(num(b.ft.d)===a.ft.d)a.ft.n=Math.max(a.ft.n,num(b.ft.n));}
  if(isO(b.ls))for(var t in b.ls)if(typeof b.ls[t]==='number')a.ls[t]=Math.max(a.ls[t]||0,b.ls[t]);
}
function st(){if(!isO(S.car))fix();return S.car;}

/* ---------- звание ---------- */
function byOz(oz){var r=0;for(var k=1;k<30;k++)if(oz>=CFG.need[k])r=k;return r;}
function rank(){var c=st(),bo=byOz(c.oz),cap=c.fw>=6?29:c.fw*5+3,i=Math.min(bo,cap);
  // финалы: c.fw районов пройдено → звания до 5·fw+3 (5-е звание района fw — только финалом); пройденный финал даёт и само 5-е звание
  if(c.fw>=1)i=Math.max(i,Math.min(29,c.fw*5-1));
  var d=Math.min(5,Math.max(Math.floor(i/5),c.fw)),stars=0; // выиграл финал — уже в следующем районе (звание растёт очками)
  if(c.fw>=6)stars=Math.max(0,Math.floor((c.oz-CFG.need[29])/CFG.star));
  var nx=i<29?i+1:-1,fin=nx>=0&&nx%5===4;
  var lo=CFG.need[i],hi=nx>=0?CFG.need[nx]:CFG.need[29]+CFG.star*(stars+1),base=nx>=0?lo:CFG.need[29]+CFG.star*stars;
  var frac=Math.max(0,Math.min(1,(c.oz-base)/Math.max(1,hi-base)));
  return{i:i,name:NAMES[i]+(stars?' ★'+(stars+1):''),base:NAMES[i],d:d,dist:DIST[d],stars:stars,oz:Math.round(c.oz),
    next:nx>=0?{i:nx,name:NAMES[nx],need:CFG.need[nx],left:Math.max(0,Math.ceil(CFG.need[nx]-c.oz)),fin:fin}:null,frac:frac,
    frame:FRAMES[DIST[d].frame],frameId:DIST[d].frame,seals:c.sl};}
// рамки, которые у игрока есть (UX даёт выбрать): рамки районов до текущего, «Чемпион района», рамки серии входа (js/today.js — S.tdS.fr)
function myFrames(){var c=st(),r=rank(),a=[];for(var d=0;d<=r.d;d++)a.push(DIST[d].frame);if(c.fw>=5)a.push('champ');
  try{var x=S.tdS&&S.tdS.fr;if(Array.isArray(x))for(var i=0;i<x.length;i++)if(FRAMES[x[i]]&&a.indexOf(x[i])<0)a.push(x[i]);}catch(e){}return a;}
function finState(){var c=st(),r=rank();if(c.fw>=6)return null;var d=c.fw,need=CFG.need[d*5+4],seal=CFG.finSeal[d];
  return{d:d,opp:CFG.fin[d],ch:CH[CFG.fin[d]],ozOk:c.oz>=need,ozLeft:Math.max(0,Math.ceil(need-c.oz)),sealOk:c.sl>=seal,seal:seal,seals:c.sl,
    ready:c.oz>=need&&c.sl>=seal&&r.i>=d*5+3,free:c.ft.d!==dk()||c.ft.n<1,minus:d>=CFG.minusFrom};}

/* ---------- очки знатока ---------- */
var news=[]; // новости для окна итога / тоста: {k:'rank'|'fin'|'seal', t}
var gain=0;  // очки за текущую лестницу (для окна итога)
function priceQ(q,o){var p=o&&+o.price;if(!(p>=100))try{p=window.priceOf?priceOf(q,{mode:o&&o.mode}):0;}catch(e){p=0;}
  if(!(p>=100))p=q&&q.d?100*(q.d+1):300;return p;}
function add(pts,why){if(!(pts>0))return 0;var c=st(),r0=rank().i;c.oz+=pts;var t=dk();if(!isO(c.od)||c.od.d!==t)c.od={d:t,n:0};c.od.n+=pts;var r1=rank();
  if(r1.i>r0){c.hi=Math.max(c.hi,r1.i);news.push({k:'rank',t:'🏅 Новое звание: '+r1.name+'!'});try{STAT.ev('rank',{r:r1.i,d:r1.d,oz:Math.round(c.oz)});}catch(e){}}
  var f=finState();if(f&&f.ready&&!c.fn){c.fn=1;news.push({k:'fin',t:'🏆 Открыт финал района: '+CH[f.opp].n+' ждёт!'});}
  return pts;}
function onAnswer(o){try{
  if(!o||!o.ok||o.mode==='qday'||o.mode==='mg'||o.mode==='train')return;
  var q=null;try{q=QI[o.id];}catch(e){}
  var p=priceQ(q,o),m=1;
  if(o.mode==='day')m*=CFG.dayMul;
  else if(q&&(o.mode==='lad'||o.mode==='ladder')&&S.cyc&&(S.cyc[q.t]||0)>0)m*=CFG.repMul;
  if(window.TD&&TD.mul)m*=TD.mul(q,p,o.mode)||1;
  var n=Math.round(p/10*m);gain+=n;add(n,o.mode);
}catch(e){}}

/* ---------- печать двора (1 в день; ставит js/today.js за 3 из 5 дел) ---------- */
function seal(){var c=st(),t=dk();if(c.sd===t)return false;c.sd=t;c.sl++;news.push({k:'seal',t:'🔖 Печать двора! Всего: '+c.sl});
  var f=finState();if(f&&f.ready&&!c.fn){c.fn=1;news.push({k:'fin',t:'🏆 Открыт финал района: '+CH[f.opp].n+' ждёт!'});}
  try{STAT.ev('seal',{n:c.sl});}catch(e){}return true;}

/* ---------- финал района ---------- */
function finWin(f){var c=st();c.fw=Math.max(c.fw,f.d+1);delete c.fn;c.hi=Math.max(c.hi,f.d*5+4);var n=CFG.finCoins[f.d]||100;
  try{S.coins+=n;STAT.earn('quest',n);}catch(e){}save();try{updCoins();}catch(e){}
  try{STAT.ev('fin',{d:f.d,r:'win'});}catch(e){}return n;}
function finLose(f,weak){var c=st();if(weak)c.ls[weak]=(c.ls[weak]||0)+1;save();try{STAT.ev('fin',{d:f.d,r:'lose'});}catch(e){}}
function useTry(){var c=st(),t=dk();if(c.ft.d!==t)c.ft={d:t,n:0};c.ft.n++;save();}
function openFinal(){var f=finState();if(!f)return;var ch=f.ch;
  if(!f.ready){toast(!f.ozOk?'До финала — ещё '+f.ozLeft+' очков знатока':'Для финала нужны печати двора: '+f.seals+' из '+f.seal);return;}
  var retry=!f.free,canPay=S.coins>=CFG.finRetry,adOkNow=false;try{adOkNow=adBtnOk();}catch(e){}
  modal('<div class="av">'+portrait(f.opp,'happy')+'</div><h2>🏆 Финал района «'+DIST[f.d].n+'»</h2>'+
    '<p class="car-who"><b>'+esc(ch.n)+'</b> — '+esc(ch.who)+'</p><p class="quote">'+esc(pick(ch.hi))+'</p>'+
    '<p class="goal">Матч на табло: кто наберёт больше. Без таймера.'+(f.minus?' Ошибся — минус половина цены.':' Ошибка без минуса.')+' Победа — звание «'+esc(NAMES[f.d*5+4])+'» и +'+coinsTxt(CFG.finCoins[f.d])+'.</p>'+
    '<div class="row">'+(retry?
      (canPay?'<button class="btn accent" id="cfPay">▶ Ещё попытка за '+coinsTxt(CFG.finRetry)+'</button>':'')+
      (adOkNow?'<button class="btn" id="cfAd">📺 Ещё попытка за рекламу</button>':'')+
      '<p class="goal">Бесплатная попытка — одна в день. Завтра — снова даром.</p>'
      :'<button class="btn accent big" id="cfGo">▶ Начать финал</button>')+
    '<button class="btn" id="cfNo">Позже</button></div>');
  var go=function(){hideModal();useTry();play(f);};
  if($('cfGo'))$('cfGo').onclick=function(){SND.tap();go();};
  if($('cfPay'))$('cfPay').onclick=function(){SND.tap();if(S.coins<CFG.finRetry)return;S.coins-=CFG.finRetry;try{STAT.ev('spend',{k:'fin',c:CFG.finRetry});}catch(e){}save();updCoins();go();};
  if($('cfAd')){try{STAT.offer('fin');}catch(e){}$('cfAd').onclick=function(){if(adHold('fin'))return;hideModal();STAT.place('fin');
    var done=false;showRewarded(function(){if(done)return;done=true;go();},function(w){if(w==='wait')openFinal();},
      function(){if(done)return '';done=true;var c=st();c.ft.n=Math.max(0,c.ft.n-1);save();return 'попытка финала вернётся — жми «Финал района»';});};}
  $('cfNo').onclick=function(){hideModal();};}
function play(f){
  // матч на табло BOARD (если есть), иначе — свой короткий матч (8 вопросов, по очереди с чемпионом)
  var o={kind:'final',d:f.d,opp:f.opp,oppName:f.ch.n,acc:CFG.champ[f.opp].acc,minus:f.minus,size:5,title:'Финал района «'+DIST[f.d].n+'»',
    onEnd:function(res){fin(f,res||{});}};
  // табло BOARD: BOARD.start({mode:'champ', rivals:[чемпион], title, onEnd}) — монет табло не даёт, награда здесь (finWin)
  if(window.BOARD&&typeof BOARD.start==='function'){try{BOARD.start({mode:'champ',rivals:[f.opp],title:o.title,sub:f.ch.n+' — '+f.ch.who,
      onEnd:function(res){res=res||{};var op=0;try{op=res.rivals&&res.rivals[0]?res.rivals[0].sc:0;}catch(e){}fin(f,{win:!!res.win,me:res.score||0,op:op,weak:res.weak||null});}});return;}catch(e){}}
  mini(f,o);}
function fin(f,res){var win=!!res.win,ch=f.ch;
  if(win){var n=finWin(f);try{SND.win();confetti();}catch(e){}
    modal('<div class="av">'+portrait(f.opp,'sad')+'</div><h2>🏆 Победа в финале!</h2><p class="score">'+(res.me||0)+' : '+(res.op||0)+'</p><p class="quote">'+esc(ch.n)+': «'+esc(pick(ch.win))+'»</p>'+
      '<p class="goal tipl">🏅 Звание: '+esc(NAMES[f.d*5+4])+'!</p><p class="goal tipl">💰 +'+coinsTxt(n)+'</p>'+(f.d<5?'<p class="goal">Открыт район «'+esc(DIST[f.d+1].n)+'»: '+esc(DIST[f.d+1].open)+'</p>':'<p class="goal">Дальше — «Чемпион города ★2» каждые '+CFG.star+' очков.</p>')+
      '<div class="row"><button class="btn accent" id="cfOk">Ура!</button></div>');party();
  }else{var weak=res.weak||null;finLose(f,weak);try{SND.lose();}catch(e){}
    modal('<div class="av">'+portrait(f.opp,'happy')+'</div><h2>Финал проигран</h2><p class="score">'+(res.me||0)+' : '+(res.op||0)+'</p><p class="quote">'+esc(ch.n)+': «'+esc(pick(ch.lose))+'»</p>'+
      (weak?'<p class="goal">👴 Михалыч: подтяни тему «'+esc(TOPN(weak))+'» — там были ошибки.</p>':'')+'<p class="goal">Очки знатока за верные ответы — твои. Бесплатная попытка — завтра.</p>'+
      '<div class="row"><button class="btn accent" id="cfOk">Хорошо</button></div>');}
  try{fitCard();}catch(e){}
  $('cfOk').onclick=function(){hideModal();try{openMenu();}catch(e){}};}
// свой короткий матч (запасной, пока нет BOARD.match): 8 вопросов по цене 100…500, ты отвечаешь, чемпион отвечает на свой вопрос честно по своей точности
function mini(f,o){
  var R=rng(dk()*31+f.d*977+st().ft.n*13),pool={},prices=[200,200,300,300,400,400,500,500],qs=[],used={};
  for(var i=0;i<QS.length;i++){var q=QS[i];if(isBad(q))continue;var p=priceQ(q,{mode:'final'});(pool[p]=pool[p]||[]).push(q);}
  for(var j=0;j<prices.length;j++){var pp=prices[j],c=pool[pp]||pool[400]||QS,k=0,q2;do{q2=c[Math.floor(R()*c.length)];k++;}while(used[q2.i]&&k<50);used[q2.i]=1;qs.push(q2);}
  var M={i:0,me:0,op:0,qs:qs,R:R,miss:{}};
  function oppTurn(q,p){var a=o.acc[Math.min(2,Math.max(0,(q.d||2)-1))],ok=M.R()<a;if(ok)M.op+=p;else if(o.minus)M.op=Math.max(0,M.op-p/2);return ok;}
  function board(){return '<div class="cf-sc"><span>Ты <b>'+M.me+'</b></span><span>'+esc(o.oppName)+' <b>'+M.op+'</b></span></div>';}
  function ask(){if(M.i>=M.qs.length){var w=M.me>M.op;if(M.me===M.op&&!M.tb){M.tb=1;var e=QS.filter(function(x){return x.d===3&&!used[x.i];});M.qs.push(e[Math.floor(M.R()*e.length)]);ask();return;}
      var weak=null,mx=0;for(var t in M.miss)if(M.miss[t]>mx){mx=M.miss[t];weak=t;}o.onEnd({win:w,me:M.me,op:M.op,weak:weak});return;}
    var q=M.qs[M.i],p=Math.min(500,Math.max(100,priceQ(q,{mode:'final'}))),perm=shuffle([0,1,2,3],M.R),h='';
    for(var a=0;a<4;a++)h+='<button class="btn cf-a" data-k="'+a+'">'+esc(q.a[perm[a]])+'</button>';
    modal('<h2 class="cf-h">'+esc(o.title)+'</h2>'+board()+'<p class="cf-p">Вопрос '+(M.i+1)+' из '+M.qs.length+' · '+esc(TOPN(q.t))+' · <b>'+p+'</b></p><p class="cf-q">'+esc(q.q)+'</p><div class="cf-as">'+h+'</div>');
    var bs=document.querySelectorAll('#mcard .cf-a');for(var b=0;b<bs.length;b++)bs[b].onclick=function(){var k=+this.dataset.k,ok=perm[k]===0;
      if(ok){M.me+=p;SND.right();}else{SND.wrong();if(o.minus)M.me=Math.max(0,M.me-p/2);M.miss[q.t]=(M.miss[q.t]||0)+1;}
      fire({id:q.i,ok:ok,hint:0,mode:'final',step:M.i+1,price:p});
      var oq=M.qs[M.i],oOk=oppTurn(oq,p);
      for(var z=0;z<bs.length;z++){bs[z].disabled=true;if(perm[+bs[z].dataset.k]===0)bs[z].classList.add('cf-ok');else if(+bs[z].dataset.k===k)bs[z].classList.add('cf-no');}
      var tail=document.createElement('div');tail.className='cf-tail';
      tail.innerHTML='<p>'+(ok?'✅ Верно! +'+p:'❌ Мимо. Верно: «'+esc(q.a[0])+'»'+(o.minus?' (−'+p/2+')':''))+'</p><p>'+esc(o.oppName)+': '+(oOk?'тоже верно (+'+p+')':'промах')+'</p>'+board()+'<div class="row"><button class="btn accent" id="cfNext">Дальше</button></div>';
      $('mcard').appendChild(tail);$('cfNext').onclick=function(){M.i++;ask();};};}
  ask();}

/* ---------- ответ → всем подписчикам (STAT/CAR/YARD) — через answerHook UX, если он есть ---------- */
function fire(o){try{var h=window.answerHook;if(typeof h==='function'){h(o);return;}if(h&&typeof h.fire==='function'){h.fire(o);return;}}catch(e){}onAnswer(o);}

/* ---------- вид: полоска карьеры (главный, «Сегодня»), окно «Карьера знатока», строки для окна итога ---------- */
function frameSvg(fr,inner){fr=fr||FRAMES.wood;return '<span class="car-fr" style="--f1:'+fr.c1+';--f2:'+fr.c2+(fr.glow?';--fg:'+fr.glow:'')+'">'+(inner||'')+(fr.lamps?'<i class="car-lamps"></i>':'')+'</span>';}
function av(){try{return S.uiAv&&HELP[S.uiAv]?S.uiAv:'valerka';}catch(e){return 'valerka';}}
function strip(){var r=rank(),f=finState(),c=st(),h='<button class="car-strip" id="carStrip" type="button">'+frameSvg(r.frame,portrait(av(),'happy'))+
  '<span class="car-t"><b>'+esc(r.name)+'</b><small>'+esc(r.dist.ic+' '+r.dist.n)+' · 🔖 '+c.sl+'</small>';
  if(f&&f.ready)h+='<em class="car-fin">🏆 Финал: '+esc(f.ch.n)+(f.free?'':' (завтра)')+'</em>';
  else if(r.next)h+='<span class="car-bar"><i style="width:'+Math.round(100*r.frac)+'%"></i></span><small>'+(r.next.fin&&f&&!f.sealOk&&f.ozOk?'финал: печатей '+c.sl+' из '+f.seal:'до «'+esc(r.next.name)+'» — '+r.next.left+' очк.')+'</small>';
  else h+='<span class="car-bar"><i style="width:'+Math.round(100*r.frac)+'%"></i></span>';
  return h+'</span></button>';}
function bindStrip(root){var b=(root||document).querySelector('#carStrip');if(b)b.onclick=function(){try{SND.tap();}catch(e){}var f=finState();if(f&&f.ready)openFinal();else openCareer();};}
function openCareer(){try{STAT.screen('career');}catch(e){}var r=rank(),c=st(),f=finState(),h='';
  for(var d=0;d<6;d++){var D=DIST[d],done=c.fw>d,cur=r.d===d&&!done,lock=d>r.d,ch=CH[D.opp];
    var fc='';try{fc=window.LK&&LK.on()?'<span class="car-of">'+LK.face(D.opp)+'</span>':'';}catch(e){}
    h+='<div class="car-d'+(done?' done':cur?' cur':lock?' lock':'')+'"><span class="car-di">'+D.ic+'</span>'+fc+'<span class="car-dn"><b>'+(d+1)+'. '+esc(D.n)+'</b>'+
      '<small>'+(done?'✓ пройден · чемпион '+esc(ch.n)+' побеждён':cur?esc(NAMES[d*5])+' → '+esc(NAMES[d*5+4]):'финал: '+esc(ch.n))+'</small>'+
      (cur?'<small class="car-ranks">'+[0,1,2,3,4].map(function(k){var i=d*5+k;return '<i class="'+(i<=r.i?'on':'')+'">'+esc(NAMES[i])+'</i>';}).join('')+'</small>':'')+
      (lock?'<small>🔖 печатей для финала: '+CFG.finSeal[d]+'</small>':'')+'</span></div>';}
  modal('<h2>🏅 Карьера знатока</h2>'+strip().replace('id="carStrip"','id="carStrip2"')+
    '<p class="car-help">⭐ <b>Очки знатока</b> — за каждый верный ответ: вопрос за 300 — 30 очков. Викторина дня — вдвое, ошибка очков не отнимает.</p>'+
    '<p class="car-help">🔖 <b>Печать двора</b> — раз в день за 3 дела из 5 в «Сегодня». Нужны для финала района. У тебя: <b>'+c.sl+'</b>.</p>'+
    (f?'<p class="goal car-help">🏆 Финал «'+esc(DIST[f.d].n)+'» — '+esc(f.ch.n)+': '+(f.ready?'<b>открыт!</b>':(f.ozOk?'':'ещё '+f.ozLeft+' очков; ')+(f.sealOk?'':'печатей '+f.seals+' из '+f.seal))+'</p>':'')+
    '<div class="car-map">'+h+'</div><div class="row">'+(f&&f.ready?'<button class="btn accent" id="cfOpen">🏆 Финал района</button>':'')+'<button class="btn" id="mCancel">Закрыть</button></div>');
  if($('cfOpen'))$('cfOpen').onclick=function(){hideModal();openFinal();};$('mCancel').onclick=hideModal;}
// окно итога лестницы (resultSlots): «+N очков знатока», новое звание/печать/финал. Сбрасывает счётчик лестницы
function resultHtml(){var r=rank(),h='';if(gain>0)h+='<p class="goal tipl car-gain">⭐ +'+gain+' очков знатока'+(r.next?' · до «'+esc(r.next.name)+'» '+r.next.left:'')+'</p>';
  for(var i=0;i<news.length;i++)h+='<p class="goal tipl">'+esc(news[i].t)+'</p>';gain=0;news=[];return h;}
function takeNews(){var n=news;news=[];return n;}

/* ---------- гнёзда UX (js/ui-core.js): answerHook — очки за ответ; resultSlots — строка в окне итога лестницы ---------- */
function fire(o){try{if(window.UI&&UI.answered){UI.answered(o);return;}}catch(e){}onAnswer(o);}
if(!Array.isArray(window.answerHook))window.answerHook=[];
answerHook.push({id:'car',fn:onAnswer});
if(!Array.isArray(window.resultSlots))window.resultSlots=[];
resultSlots.push({id:'car-pts',order:8,render:function(){return resultHtml()||null;}});
// шапка «кто я» на главном (js/ui-home.js): {t звание, s подпись, f доля до следующего, fr рамка, ic значок района}
function look(){var r=rank(),f=finState(),s;
  if(f&&f.ready)s='🏆 Финал района: '+f.ch.n+(f.free?' ждёт!':' — завтра');
  else if(r.next&&r.next.fin&&f&&f.ozOk&&!f.sealOk)s='до финала — печати двора: '+f.seals+' из '+f.seal;
  else if(r.next)s='до «'+r.next.name+'» — '+r.next.left+' '+plo(r.next.left);
  else s='до ★'+(r.stars+2)+' — '+Math.max(0,Math.ceil(CFG.need[29]+CFG.star*(r.stars+1)-st().oz))+' очков';
  return{t:r.name,s:s,f:r.frac,fr:r.frameId,ic:r.dist.ic,d:r.d,dist:r.dist.n,seals:r.seals,oz:r.oz,fin:!!(f&&f.ready),go:function(){if(f&&f.ready)openFinal();else openCareer();}};}
function plo(n){try{return pl(n,'очко','очка','очков');}catch(e){return 'очк.';}}
window.CAR={CFG:CFG,DIST:DIST,NAMES:NAMES,FRAMES:FRAMES,CH:CH,fix:fix,merge:merge,migrate:migrate,rank:rank,finState:finState,add:add,onAnswer:onAnswer,seal:seal,
  openFinal:openFinal,openCareer:openCareer,strip:strip,bindStrip:bindStrip,resultHtml:resultHtml,takeNews:takeNews,fire:fire,frameSvg:frameSvg,
  rankName:function(){return rank().name;},
  district:function(){return rank().d+1;}, // 1 Лавочка … 6 Город (BOARD: минус с 3 — «Улица»)
  ozDay:function(){var c=st();return isO(c.od)&&c.od.d===dk()?Math.round(c.od.n):0;},
  prg:function(){var r=rank();return{ds:r.d+1,rk:r.i-r.d*5+1>0?Math.min(5,r.i-r.d*5+1):1,cp:Math.round(st().oz)};},look:look,hasNews:function(){return news.some(function(x){return x.k==='rank'||x.k==='fin';});},myFrames:myFrames,dist:function(){return rank().d;}, // 0 Лавочка … 5 Город
opened:function(d){return rank().d>=d||st().fw>=d;},_gain:function(){return gain;}};
try{fix();}catch(e){}
})();
