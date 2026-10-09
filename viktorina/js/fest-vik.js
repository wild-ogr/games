/* Праздники во дворе — обвязка «Дворовой викторины» (поток FEST, буст 09.10.2026). Грузится ПОСЛЕ основного скрипта и js/fest.js.
   Наборы и окна дат — js/topics-fest.js (VTOP.festNow/festTop/festDay/festPeak/festLeft/festTill/festId). Модуль праздников — js/fest.js (общий).
   Здесь:
   1) пулы вопросов праздничных наборов (TN/BYT/QI) — если UX ещё не завёл общий список тем из VTOP (своё не трогает: TN[k] уже есть → пропуск);
   2) плитка «Праздник во дворе» на главном (гнездо UX homeSlots, id 'fest') — главный праздник/сезон, «до 02.11», сколько пройдено;
   3) приветствие Михалыча на старте праздничной лестницы (HOST.start на время старта), строка в окне итога (resultSlots, id 'fest');
   4) модуль FEST: init (оформление body.fest-*, STAT fest show/use), FEST.use(<id>,'q') на ответах праздничного набора (answerHook);
   5) облако: «уже видел» по праздничным наборам и S.fest (FEST.merge) — обёртка mergeSave (старые темы не трогает).
   Сохранение: S.fest (модуль FEST), S.seen/S.cyc[<ключ набора>] — как у обычных тем. Новых полей нет.
   Проверка без ожидания даты: ?date=2026-10-31 (сдвиг часов игры — VTOP и FEST вместе), ?fest=hw26 (только оформление FEST). Только мак/LAN. */
(function(){
'use strict';
if(!window.VTOP||!VTOP.festNow||typeof TN==='undefined')return;
var D=document;
var HELLO={
  hw:['Страшилки у подъезда! Фонарь горит, лавочка свободна — садись, начнём. Только не оглядывайся.','В подъезде лампочка мигает — самое время для страшилок. Первый вопрос — не страшный.','Баба Зина говорит, в такие вечера леший по двору ходит. А мы — вопросы задаём!'],
  nar:['4 ноября — праздник большой страны. Вопросы про народы России — кухня, сказания, песни.','Сколько у нас народов — столько и обычаев! Поехали знакомиться.'],
  mama:['Мамин день во дворе! Вопросы тёплые, как мамины пирожки.','Сегодня — про мам. Отвечай не спеша, мама бы так и сказала.'],
  ny:['С наступающим! Ёлка во дворе стоит, мандарины пахнут — начинаем новогодние вопросы.','Дед Мороз уже в пути, а у нас — новогодняя викторина. Первый вопрос — лёгкий, как снежинка.','Новогодний двор! Тётя Валя режет оливье, а ты отвечай на вопросы.'],
  sny:['Старый Новый год — праздник для тех, кто не наотмечался! Поехали.','Новый год у нас два раза — и вопросы про это тоже есть.'],
  lub:['Про любовь, про кино и книги — вопросы для романтиков двора.','Сегодня вопросы про любовь. Дядя Коля краснеет, а ты отвечай!'],
  feb:['Мастера и богатыри — ваш день! Дядя Коля уже наточил рубанок.','Богатырская викторина! Илья Муромец бы ответил — и ты ответишь.'],
  msl:['Масленица во дворе! Блины пекутся, зиму провожаем — начинаем.','Блинная неделя! Отвечай — и пусть первый блин не будет комом.'],
  mar:['С праздником весны! Вопросы про знаменитых женщин, цветы и рукоделие.','8 Марта во дворе — мимоза на лавочке. Поехали!'],
  smeh:['День смеха! Вопросы весёлые, но ответы — честные, без розыгрышей.','Первое апреля — никому не верю! Кроме правильных ответов.'],
  kos:['Ключ на старт! Космическая викторина ко Дню космонавтики.','Поехали! Как Гагарин — с улыбкой и по порядку.'],
  may:['Майские во дворе! Рассада на окне, дача ждёт — а пока вопросы.','Весна и труд! Отвечай, как грядки копаешь, — с толком.'],
  pob:['Девятое мая. Помним. Вопросы — о памяти, фильмах и песнях тех лет.','В эти дни весь двор вспоминает. Отвечай не спеша.'],
  shk:['Первое сентября! Портфель собран, гладиолусы куплены — к доске!','Снова в школу! Валерка уже за партой, а ты?'],
  uch:['День учителя! Вопросы — как на хорошем уроке: по делу и с улыбкой.','Сегодня поздравляем учителей. Отвечай на «пятёрку»!'],
  leto:['Лето во дворе! Квас из бочки, велосипеды и вопросы про каникулы.'],
  osen:['Осень во дворе! Листья шуршат, банки закатаны — вопросы про осень.'],
  zima:['Зима во дворе! Горка залита, валенки сушатся — поехали.'],
  vesna:['Весна во дворе! Капель, грачи, кораблики в ручьях — начинаем.']};
function name(k){return VTOP.festName(k);}
function isF(k){return !!(TN[k]&&TN[k].fest);}

/* ---- 1. пулы вопросов наборов ---- */
function ok4(q){return q&&typeof q.q==='string'&&q.q&&Array.isArray(q.a)&&q.a.length===4&&q.a.every(function(x){return typeof x==='string'&&x;})&&new Set(q.a).size===4&&q.d>=1&&q.d<=3&&/^[a-z]+-\d+$/.test(q.i);}
var seenQ=0;
function pools(){var Q=Array.isArray(window.QDB)?window.QDB:[];if(Q.length===seenQ)return;
  VTOP.festList.forEach(function(t){if(!TN[t.k]){TN[t.k]={k:t.k,ic:t.ic,n:name(t.k),fest:1};}if(isF(t.k)&&!BYT[t.k])BYT[t.k]=[];});
  for(var i=seenQ;i<Q.length;i++){var q=Q[i];if(q&&isF(q.t)&&!QI[q.i]&&ok4(q)){q.n=+q.i.split('-')[1];QI[q.i]=q;BYT[q.t].push(q);}}
  seenQ=Q.length;}
pools();
// части js/q/<ключ>.js (договор CONTENT) — догружаются позже: дополняем пулы
var oq=window.onQDB;window.onQDB=function(t,a){try{if(typeof oq==='function')oq(t,a);}catch(e){}try{pools();}catch(e){}};

/* ---- 2. плитка на главном ---- */
function stat(k){var all=BYT[k]||[],s=0;for(var i=0;i<all.length;i++)if(seen(all[i]))s++;return{n:all.length,s:s};}
function tiles(){pools();var a=VTOP.festNow(),out=[],hol=a.filter(function(t){return t.kind==='hol';})[0],sea=a.filter(function(t){return t.kind==='sea';})[0];
  if(hol&&(BYT[hol.k]||[]).length>=10)out.push(hol);if(sea&&(BYT[sea.k]||[]).length>=10)out.push(sea);return out;}
function tile(t){var st=stat(t.k),pk=VTOP.festPeak(t.k),hol=t.kind==='hol',w=st.n?Math.round(100*st.s/st.n):0;
  return '<button class="festB'+(hol?'':' sea')+(pk?' pk':'')+'" data-k="'+t.k+'"><span class="fbI">'+t.ic+'</span><span class="fbT"><b>'+esc(name(t.k))+'</b>'+
    '<small class="fbX">'+esc(t.txt||'')+'</small>'+
    '<small>'+(pk?'Сегодня праздник! · ':hol?'':'Вопросы сезона · ')+esc(VTOP.festTill(t.k))+' · '+st.s+' из '+st.n+'</small><span class="fbBar"><i style="width:'+w+'%"></i></span></span>'+
    '<span class="fbTag">'+(hol?'праздник':'сезон')+'</span></button>';}
function go(k){try{SND.tap();}catch(e){}if(!VTOP.isOpen(k)){toast('Этот набор уже закрыт — вернётся в свои даты');return;}
  try{FEST.use(VTOP.festId(k),'open');}catch(e){}uiPreTopic(k);}
[0,1].forEach(function(i){homeSlots.push({id:'fest'+i,order:4+i,render:function(){var t=tiles()[i];return t?tile(t):null;},
  mount:function(el){var t=tiles()[i],b=el.querySelector('button');if(t&&b)b.onclick=function(){go(t.k);};}});});

/* ---- 3. приветствие и итог ---- */
if(typeof startLadder==='function'){var sl=startLadder;startLadder=function(topic){
  if(!isF(topic))return sl.apply(this,arguments);
  if(!VTOP.isOpen(topic)){toast('Этот набор уже закрыт — вернётся в свои даты');return;}
  var keep=HOST.start;HOST.start=HELLO[topic]||keep;try{return sl.apply(this,arguments);}finally{HOST.start=keep;}};}
resultSlots.push({id:'fest',order:30,render:function(c){if(!c||!isF(c.topic))return null;var st=stat(c.topic);
  return '<p class="goal">'+TN[c.topic].ic+' «'+esc(name(c.topic))+'»: '+st.s+' из '+st.n+' · '+esc(VTOP.festTill(c.topic))+'</p>';}});

/* ---- 4. модуль FEST ---- */
if(typeof FEST!=='undefined'){
  // решение владельца 09.10: «Страшилки у подъезда» в Викторине — с 24.10 (как набор hw и двор YARD); общий модуль даёт hw26 с 26.10 —
  // поправляем только в этой игре (строки таблицы FEST.get — по ссылке), общий fest.js не трогаем. Имя — как у набора.
  try{[['hw26','2026-10-24','2026-11-02'],['hw27','2027-10-24','2027-11-02']].forEach(function(p){var r=FEST.get(p[0]);if(r){r.from=p[1];r.to=p[2];r.ng=r.ng||{};r.ng.viktorina='Страшилки у подъезда';}});}catch(e){}
  try{FEST.init(S,{g:'viktorina',plat:PLAT,lang:LANG,save:function(){save();},now:function(){return nowMs();},cls:'btn noenter',
    modal:function(h){modal(h);return D.getElementById('mcard');},close:function(){hideModal();},
    low:function(){try{return typeof calm==='function'&&calm();}catch(e){return false;}},
    change:function(){try{if(!G&&D.getElementById('scr-menu').classList.contains('on'))uiHome();}catch(e){}}});}catch(e){}
  answerHook.push({id:'fest',fn:function(i){try{if(i&&i.fin&&isF(i.t)){var id=VTOP.festId(i.t);if(id)FEST.use(id,'q');}}catch(e){}}});
  // на экране вопроса частицы (снег) не мешают тексту
  try{UI.on('screen',function(n){try{FEST.fx(n!=='game');}catch(e){}});}catch(e){}
}

/* ---- 5. облако: «уже видел» праздничных наборов и S.fest ---- */
if(typeof mergeSave==='function'){var ms=mergeSave;mergeSave=function(d,ref){ms.apply(this,arguments);if(!isObj(d))return;
  try{var dc=isObj(d.cyc)?d.cyc:{},ds=isObj(d.seen)?d.seen:{};
    VTOP.festList.forEach(function(t){var k=t.k;if(TK.indexOf(k)>=0)return;var a=S.cyc[k]||0,b=+dc[k]||0;
      if(b>a){S.cyc[k]=b;S.seen[k]=typeof ds[k]==='string'?ds[k]:'';}else if(b===a&&typeof ds[k]==='string')S.seen[k]=bOr(S.seen[k],ds[k]);});
    if(typeof FEST!=='undefined')FEST.merge(d.fest);}catch(e){}};}

try{if(D.getElementById('scr-menu').classList.contains('on'))uiHome();}catch(e){}
window.FESTV={pools:pools,tiles:tiles,stat:stat,go:go,HELLO:HELLO};
})();
