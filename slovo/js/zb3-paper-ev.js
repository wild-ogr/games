'use strict';
/* ================= zb3-PAPER П.16 — «Живые события двора» (1–2 недели), старт. 25.10.2026, ветка z3-paper3 =================
   Журнал: hobby-analytics/release-i/zina-boost3/Z3-PAPER.md. Флаг 'z3p-ev' (?off=z3p-ev — событий нет, газета как была).
   КАЛЕНДАРЬ: 12 своих событий двора, каждое 10–14 дней, по датам каждого года, БЕЗ пересечения с праздниками Z3.fest()
     (ny 15.12–14.01, feb23 21–23.02, mar/mas 6–14.03, may 1–10.05, sep1 30.08–1.09, uch 4–5.10, hw 25.10–2.11). День — Z3.tk() (как номер газеты).
   ЗАДАНИЕ: «собери N очков»: слово в уровне — 1, слово темы события — 3 (уровень или бонус), рубрика номера газеты (первый раз за день) — 5.
     N = 10 × дней события. Награды: половина — +15 монет, всё — +40 монет и 💡. Итог — строка в газете 10 дней после конца + письмо (MAIL).
   ПОЛЕ (в S.z3p): e — начало текущего события (ГГГГММДД), ec — очки, eg — биты (1 половина, 2 всё, 4 письмо-итог отдано),
     pe/pc/pg — то же для прошлого события (итог и письмо, когда уже началось следующее).
   СЕРВЕР (по желанию): Z3.srv.send('ev',{e:'<id>-<ГГГГММДД>', n:+очки}); Z3.srv.get('ev',{e}) → {n — весь дом, p — участников}.
     Ответ расчётом (_sim) или пусто — общий счётчик не показываем (без выдуманных чисел).
   API (window.Z3PAPER): evNow() → {id,t,sh,ic,w,from,to,days,left,c,goal,half,done} | null; evRes() → итог последнего (≤10 дней) | null;
     evAdd(n, why) — очки (газета зовёт за рубрику); evMail() → Promise({i,k:'ev',h,t}|null) — письмо-итог для MAIL; evMailDone(i) — отдано.
   STAT: z3p {a:'evp', e, c, g, n, why} — очки (на половине/конце и раз в день первое); {a:'evr', e, g, c} — награда.
   Старые WebView (Chrome 92): без ?. ?? .at :has. */
(function(){
if(typeof ZB==='undefined'||typeof S==='undefined'||!window.Z3||!Z3.on||!window.Z3PAPER)return;
var P=window.Z3PAPER;
var ON=Z3.reg('z3p-ev',{t:'Газета: живые события двора на 1–2 недели (задание, награда, итог в номере и письме)',who:'PAPER'});
if(!ON)return;
/* [id, с ММДД, по ММДД, заголовок, коротко (двор), значок, слова темы (словарь игры)] */
var EV=[
 ['chess',116,129,'Шахматный турнир деда Семёна','Шахматный турнир','♟️','ферзь ладья пешка слон конь король шах мат доска ход партия ничья клетка турнир часы'],
 ['vote',202,215,'Выборы старшей по дому','Выборы старшей','🗳️','голос урна список кандидат речь дом подъезд собрание старшая протокол лавка'],
 ['remont',224,305,'Ремонт в подъезде','Ремонт в подъезде','🔨','краска кисть валик ремонт стена потолок обои клей ведро лестница шпатель плитка лак гвоздь молоток дрель'],
 ['bird',316,329,'Конкурс скворечников','Скворечники','🐦','скворец гнездо птица доска гвоздь ветка весна синица крыша пила корм ветер дерево'],
 ['sub',405,418,'Субботник во дворе','Субботник','🧹','метла грабли лопата мусор ведро урна двор клумба мешок куст побелка'],
 ['balk',605,618,'Конкурс балконов','Конкурс балконов','🌸','балкон цветок герань горшок петуния бельё перила ящик лейка вид'],
 ['ogor',705,718,'Конкурс огородов','Конкурс огородов','🥕','грядка морковь огород лук редис укроп тыква капуста свекла репа лейка забор огурец кабачок'],
 ['jam',805,818,'Неделя варенья','Неделя варенья','🍓','варенье банка сахар вишня малина ягода крышка таз пенка слива яблоко ложка чай'],
 ['grib',905,918,'Грибная неделя','Грибная неделя','🍄','гриб корзина лес лисичка груздь боровик мох нож сосна ель тропа рыжик'],
 ['book',1008,1021,'Книжный обмен у подъезда','Книжный обмен','📚','книга полка роман том обложка сказка стих лист закладка автор глава очки'],
 ['cat',1105,1118,'Кошачья выставка двора','Кошачья выставка','🐈','кот кошка хвост усы лапа бант миска молоко мышь корм'],
 ['snow',1125,1208,'Снежная крепость','Снежная крепость','⛄','снег крепость лопата санки горка шарф комок морковь мороз варежка лыжи']];
var HALF=15,FULL=40,PERDAY=10,KEEP=10;
function num(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
function tk(){return Z3.tk();}
function ymd(t){return [Math.floor(t/1e4),Math.floor(t/100)%100,t%100];}
function info(x,y){var from=y*1e4+x[1],to=y*1e4+x[2],days=Z3.days(from,to)+1;
  return {id:x[0],t:x[3],sh:x[4],ic:x[5],w:x[6].split(' '),from:from,to:to,days:days,goal:days*PERDAY,key:x[0]+'-'+from};}
function find(t){if(!t)return null;var y=ymd(t)[0],md=t%10000;for(var i=0;i<EV.length;i++)if(md>=EV[i][1]&&md<=EV[i][2])return info(EV[i],y);return null;}
function byStart(s){if(!s)return null;var y=ymd(s)[0],md=s%10000;for(var i=0;i<EV.length;i++)if(EV[i][1]===md)return info(EV[i],y);return null;}
/* последнее закончившееся событие (по календарю) и сколько дней назад */
function lastEnded(t){var best=null,y=ymd(t)[0];for(var dy=0;dy<2;dy++)EV.forEach(function(x){var o=info(x,y-dy);if(o.to<t&&(!best||o.to>best.to))best=o;});
  return best?{o:best,ago:Z3.days(best.to,t)}:null;}
function Z(){var z=P.Z(),t=tk(),c=find(t);['e','ec','eg','pe','pc','pg'].forEach(function(k){z[k]=num(z[k]);});
  if(c&&z.e!==c.from){if(z.e){z.pe=z.e;z.pc=z.ec;z.pg=z.eg;}z.e=c.from;z.ec=0;z.eg=0;}return z;}
function sv(){try{save();}catch(e){}}
function give(n){var k=0;try{if(window.ZBECO&&ZBECO.give)k=ZBECO.give('z3p',n,'mg');else if(typeof addCoins==='function'){addCoins(n,'mg');k=n;}}catch(e){}
  try{if(typeof updCoins==='function')updCoins();}catch(e){}return k;}
function bulb(n){try{var mx=typeof HB_MAX!=='undefined'?HB_MAX:9,a=+S.hb||0,b=Math.min(mx,a+n);S.hb=b;return b-a;}catch(e){return 0;}}
function toastL(s){try{if(typeof toast==='function')toast(s,3200);}catch(e){}}
function pl(n){try{return plural(n,'монета','монеты','монет');}catch(e){return 'монет';}}
var sendQ=0,sendT=0,lastDay=0;
function flush(){var c=find(tk());if(sendQ&&c){try{Z3.srv.send('ev',{e:c.key,n:sendQ});}catch(e){}}sendQ=0;}
function add(n,why){n=num(n);var c=find(tk());if(!n||!c||!P.on())return 0;var z=Z(),was=z.ec;z.ec=Math.min(99999,z.ec+n);
  var half=Math.ceil(c.goal/2),rw=[];
  if(was<half&&z.ec>=half&&!(z.eg&1)){z.eg|=1;var a=give(HALF);rw.push('+'+a+' '+pl(a));P.ev('evr',{e:c.id,g:1,c:a});}
  if(was<c.goal&&z.ec>=c.goal&&!(z.eg&2)){z.eg|=2;var b=give(FULL),h=bulb(1);rw.push('+'+b+' '+pl(b)+(h?' и 💡':''));P.ev('evr',{e:c.id,g:2,c:b,h:h});}
  sv();sendQ+=n;clearTimeout(sendT);sendT=setTimeout(flush,4000);
  if(rw.length||lastDay!==tk()){lastDay=tk();P.ev('evp',{e:c.id,c:z.ec,g:z.eg,n:n,why:why||''});}
  if(rw.length)toastL(c.ic+' '+c.sh+': '+(z.eg&2?'задание выполнено! ':'половина пути! ')+rw.join(', '));
  return n;}
/* уровень пройден: слова уровня и бонусные; слова темы — втрое */
ZB.levelHook.push(function(i){if(!i||!i.ok||!find(tk()))return;ZB.safe('z3p-ev',function(){var c=find(tk()),W={},n=num(i.words),th=0;
  c.w.forEach(function(w){W[w]=1;});
  try{if(typeof G!=='undefined'&&G){(G.words||[]).forEach(function(w){if(w&&w.found&&W[String(w.w).toLowerCase()])th++;});
    if(G.bonus&&G.bonus.forEach)G.bonus.forEach(function(w){n++;if(W[String(w).toLowerCase()])th++;});}}catch(e){}
  add(n+th*2,'lv');});});
P.evAdd=add;
P.evNow=function(){var c=find(tk());if(!c||!ON)return null;var z=Z();c.c=z.ec;c.half=!!(z.eg&1);c.done=!!(z.eg&2);c.left=Z3.days(tk(),c.to)+1;return c;};
P.evRes=function(){var t=tk();if(find(t))return null;var L=lastEnded(t);if(!L||L.ago>KEEP)return null;var z=Z(),o=L.o;
  if(z.e===o.from){o.c=z.ec;o.g=z.eg;}else if(z.pe===o.from){o.c=z.pc;o.g=z.pg;}else{o.c=0;o.g=0;}o.done=!!(o.g&2);o.ago=L.ago;return o;};
/* письмо-итог для MAIL: только участникам (очки > 0), 14 дней после конца; текст — из js/zb3-paper-data.js (Z3PD.ev[id].mail, заглушка — тоже там) */
P.evMail=function(){var t=tk(),L=lastEnded(t);if(!L||L.ago>14||find(t))return Promise.resolve(null);var z=Z(),o=L.o,c=0,g=0,which='';
  if(z.e===o.from){c=z.ec;g=z.eg;which='e';}else if(z.pe===o.from){c=z.pc;g=z.pg;which='p';}
  if(!c||(g&4))return Promise.resolve(null);
  return ZB.load('js/zb3-paper-data.js').then(function(){var d=window.Z3PD&&Z3PD.ev&&Z3PD.ev[o.id]||{},L2=d.mail||[],tx=L2.length?L2[(o.from+c)%L2.length]:'';
    if(!tx)return null;tx=tx.replace(/\{n\}/g,Math.min(c,o.goal)).replace(/\{goal\}/g,o.goal).replace(/\{t\}/g,o.t);
    return {i:'ev-'+o.key,k:'ev',h:'Итог: '+o.sh,t:tx,ok:g&2?1:0};},function(){return null;});};
P.evMailDone=function(i){var z=Z();if(!i)return;var s=+String(i).replace(/^.*-/,'');if(z.e===s)z.eg|=4;else if(z.pe===s)z.pg|=4;sv();};
P.evCal=function(){return EV.map(function(x){return [x[0],x[1],x[2],x[3]];});}; /* для проверок стенда и ALBUM */
window.addEventListener('pagehide',function(){try{flush();}catch(e){}});
})();
