'use strict';
/* ================= gb-obst-rules — 12 помех «Командировки по Союзу» (поток OBST, ветка gb-obst) =================
   БЕЗ DOM: грузится в игре (строкой под <!-- gb:OBST -->) и в сторожах tools/freeze.sh / tools/check.sh (tools/freeze/files.txt).
   Правила зовёт блок LOGIC index.html из веток с меткой gb-OBST — ТОЛЬКО если у уровня есть lv.ob или у ячейки биты 17–24.
   Уровень без lv.ob и ячейки без новых битов ведут себя побайтно как раньше (сторож freeze v1 = 0).

   ДОГОВОР
   Номера помех (= 03-content §7, порядок по республикам — GBU.ob у LVL):
     1 obed    «Обед / Закрыто на учёт» — полка закрыта N ходов (ни взять, ни положить), потом открывается.
     2 mop     Уборщица «Куда по мытому!» — ходит по полкам по порядку; полку «по мытому» n ходов не трогать; потом перекур.
     3 lock    Замок «Для своих» — полка заперта, пока не соберёте тройку указанного товара (где угодно).
     4 bottle  Стеклотара — пустые бутылки (тип 199) занимают места; три бутылки = сдать (+монета); покупатели их не просят.
     5 sack    Мешок картошки — занимает 2 места переднего ряда, сдвинуть нельзя; грузчик уносит после N троек на этой/соседней полке.
     6 scale   Весы «на развес» — тройка развесного товара уходит только на полке-весах (на других полках не исчезает).
     7 conv    Подвоз — каждые N ходов без тройки «машина приходит»: до 3 товаров из запаса встают на свободные места.
     8 wrap    Тайный товар — в задних рядах видна только серая обёртка; выйдет вперёд — разворачивается.
     9 fridge  Холодильник — на полку можно ставить только молочку/мясное (GOODS cold:1; из старых — молоко, кефир, докторская, сыр,
               пломбир, яйца, масло).
    10 scold   Склочный покупатель — каждый e-й просит товар, которого нет впереди; терпение тает вдвое быстрее.
    11 mama    Мама с малышом «без очереди» (до 10.10 — ветеран, убран решением владельца) — встаёт первым, терпения меньше (×k).
    12 cat     Кот-воришка Пломбир — раз в N ходов утаскивает товар (сначала колбасу) прямо на полке: товар «у кота» не взять и
               тройкой не считается, пока рядом (эта/соседняя полка) не соберёте тройку — кот бросает и убегает; через h ходов бросает сам.
   Ячейка (число): биты 0–7 тип, 8–15 лёд, 16 BOXF (как было); 17–20 ВИД помехи на ячейке, 21–24 её счётчик:
     вид 1 WRAP (обёртка, тип настоящий), 2 SACK (мешок: тип 0, счётчик&7 = сколько троек рядом ещё нужно, +8 — правая половина), 3 CAT (товар у кота).
   lv.ob — массив помех уровня: {id, o (смещение в st.o), …параметры}; lv.obz — длина st.o; lv.gbx — отпечаток для сторожа.
     1 {s:[полки], n:[ходов], v:0|1 (вывеска «Обед»/«Учёт»)}        st.o: сколько ходов ещё закрыта (по полке)
     2 {S, n (ходов на полке), r (перекур, ходов), c0}             st.o: шаг цикла c; мокрая полка = c<S·n ? ⌊c/n⌋ : нет
     3 {s:[полки], t:[товар-ключ]}                                 st.o: 0 заперта / 1 открыта (по полке)
     4 {m (троек бутылок)}            5 {m (мешков), k (троек рядом)}            6 {s:[полка-весы], t:[развесные типы]}
     7 {s:[полка подвоза], n (ходов без тройки), q:[запас товаров]}  st.o: [ходы без тройки, сколько привезли]
     8 {p (доля обёрнутых)}           9 {s:[полки-холодильники]}               10 {e (каждый e-й покупатель), b (запас терпения: тает вдвое, но его ×b)}
    11 {v (номер покупателя q.nx), k (множитель терпения)}           12 {n (ходов), h (держит ходов), t:[любимые типы]}  st.o: [счётчик, указатель]; у ячейки «у кота» счётчик = ходов до броска
   Состояние: st.o (массив чисел, копирует cloneSt, входит в keyOf). st.x (Валя выручила) — все помехи выключены.

   API
   GBOB.place(lv, id, R, power) → true|false   поставить помеху на готовую раскладку (после buildLevel, ДО решателя).
        R — rng() генератора (детерминированно), power 1 вход / 2 микс / 3 трудно. Сама пишет lv.ob, биты ячеек, lv.gbx.
        false — на эту раскладку не ставится (нет холодных/развесных товаров и т.п.) — генератор берёт следующую попытку.
   GBOB.on(id)       — помеха не выключена флагом GB.flag('ob_<key>') (в сторожах всегда true). LVL ставит только включённые.
   GBOB.T[id]        — {id, key, n (имя), d (как работает), tip (подсказка Вали), hard (насколько труднее — для LVL)}.
   GBOB.has(lv,id)   — есть ли помеха на уровне;  GBOB.wet/closed/locked/… — для рисунков (gb-obst-draw.js).
   Остальное (init, after, end, clear, ok3, adv, fix, hasMove, doomed, cust, noAsk, tri, mv) зовёт только LOGIC.
   Старые WebView: ES5-совместимый стиль (без новых операторов).
*/
var GBOB=(function(){
  var NEW=131072,KMASK=15<<17,CMASK=15<<21,WRAP=1,SACK=2,CAT=3,BOTTLE=199,BOX=1<<16;
  var COLD0={5:1,6:1,9:1,10:1,11:1,16:1,19:1},LOOSE0={12:1,14:1,20:1,21:1},SAUS=[9,27,45];
  var T=[null,
    {id:1,key:'obed',n:'Обед',d:'Полка с табличкой закрыта несколько ходов — потом откроется сама.',tip:'Табличка «Обед» — эта полка пока закрыта. Подождите пару ходов, откроется!',hard:'+15% ходов, терпение +1'},
    {id:2,key:'mop',n:'Уборщица',d:'Уборщица моет полки по очереди: мокрую полку два хода не трогать.',tip:'Куда по мытому! Где уборщица — там два хода ничего не трогаем.',hard:'+10% ходов'},
    {id:3,key:'lock',n:'Замок «Для своих»',d:'Полка заперта, пока не соберёте тройку товара с таблички.',tip:'Полка «для своих»: соберите тройку товара с замка — откроется.',hard:'+15% ходов, терпение +1'},
    {id:4,key:'bottle',n:'Стеклотара',d:'Пустые бутылки занимают места. Три бутылки — сдать, за это монетка.',tip:'Пустые бутылки! Соберите три — сдадим, покупатели их не просят.',hard:'+1 тройка без покупателя'},
    {id:5,key:'sack',n:'Мешок картошки',d:'Мешок занимает два места. Соберите рядом тройку — грузчик его унесёт.',tip:'Мешок тяжёлый, не сдвинуть. Соберите тройку рядом — унесут.',hard:'−2 места, +10% ходов'},
    {id:6,key:'scale',n:'Весы',d:'Развесной товар уходит только с весов: тройку соберите на полке с весами.',tip:'Это на развес! Тройку соберите на полке с весами.',hard:'+20% ходов, терпение +2'},
    {id:7,key:'conv',n:'Подвоз',d:'Долго нет тройки — приходит машина и ставит товар на свободные места.',tip:'Машина пришла! Не тяните — будет тесно.',hard:'давление: меньше мест'},
    {id:8,key:'wrap',n:'Тайный товар',d:'Сзади товар в серой обёртке — что внутри, видно, когда выйдет вперёд.',tip:'Из-под прилавка! Что в обёртке — узнаем, когда выйдет вперёд.',hard:'≈ без изменений'},
    {id:9,key:'fridge',n:'Холодильник',d:'В холодильник ставим только молочку и мясное.',tip:'Не ставьте в холодильник шпроты! Только молочное и мясное.',hard:'+10% ходов'},
    {id:10,key:'scold',n:'Склочный покупатель',d:'Просит то, чего нет на переднем ряду, и сердится быстрее.',tip:'Я сорок лет в очереди стою! — этому быстрее, он ждать не любит.',hard:'1 из e покупателей ×2 быстрее'},
    {id:11,key:'mama',n:'Мама с малышом',d:'Мама с малышом встаёт без очереди и ждёт меньше обычного.',tip:'Маму с малышом — без очереди и побыстрее!',hard:'1 покупатель, терпение ×k'},
    {id:12,key:'cat',n:'Кот-воришка',d:'Пломбир утаскивает товар с полки. Соберите рядом тройку — бросит (или через пару ходов бросит сам).',tip:'Пломбир, брысь! Соберите рядом тройку — он отдаст.',hard:'+10% ходов'}];
  function kind(c){return (c>>>17)&15;}
  function cnt(c){return (c>>>21)&15;}
  function setCnt(c,n){return (c&~CMASK)|((n&15)<<21);}
  function iceN(c){return (c>>8)&255;}
  function isCold(t){if(COLD0[t])return true;if(typeof GBG!=='undefined'&&GBG.get){var g=GBG.get(t);return !!(g&&g.cold);}return false;}
  function isLoose(t){if(LOOSE0[t])return true;if(typeof GBG!=='undefined'&&GBG.get){var g=GBG.get(t);return !!(g&&g.loose);}return false;}
  function has(lv,id){var ob=lv&&lv.ob;if(!ob)return null;for(var i=0;i<ob.length;i++)if(ob[i].id===id)return ob[i];return null;}
  function on(id){try{if(typeof GB!=='undefined'&&GB.flag&&T[id])return GB.flag('ob_'+T[id].key);}catch(e){}return true;}

  /* ---- маски полок: nt — нельзя брать, np — нельзя класть, fr — холодильник, lk — заперта, sc — тип→полка-весы ---- */
  // кэш на объекте состояния: st._m сбрасывается при любой смене st.o (часы, замок) — см. dirty()
  function dirty(st){st._m=null;}
  function masks(lv,st){if(st._m&&st._m.o===st.o&&st._m.S===st.F.length&&st._m.x===st.x)return st._m;var m=masks0(lv,st);m.S=st.F.length;m.x=st.x;m.o=st.o;st._m=m;return m;}
  function masks0(lv,st){var S=st.F.length,nt=[],np=[],fr=[],lk=[],sc={},ob=lv.ob,i,k,e,s;
    for(i=0;i<S;i++){nt.push(0);np.push(0);fr.push(0);lk.push(0);}
    if(st.x)return {nt:nt,np:np,fr:fr,lk:lk,sc:sc};
    for(i=0;i<ob.length;i++){e=ob[i];
      if(e.id===1){for(k=0;k<e.s.length;k++)if(st.o[e.o+k]>0){s=e.s[k];if(s<S)nt[s]=np[s]=1;}}
      else if(e.id===2){s=wetOf(e,st);if(s>=0&&s<S)nt[s]=np[s]=1;}
      else if(e.id===3){for(k=0;k<e.s.length;k++)if(!st.o[e.o+k]){s=e.s[k];if(s<S)nt[s]=np[s]=lk[s]=1;}}
      else if(e.id===9){for(k=0;k<e.s.length;k++)if(e.s[k]<S)fr[e.s[k]]=1;}
      else if(e.id===6){for(k=0;k<e.t.length;k++)sc[e.t[k]]=e.s[0];}}
    return {nt:nt,np:np,fr:fr,lk:lk,sc:sc};}
  function wetOf(e,st){var c=st.o[e.o];return c<e.S*e.n?Math.floor(c/e.n):-1;}
  function movableC(st,c){return c!==0&&!(c&BOX)&&iceN(c)<=st.cl&&(c<NEW||mv(c));}
  function mv(c){var k=kind(c);return k!==SACK&&k!==CAT;}
  function tri(a,b,c){var ka=kind(a),kb=kind(b),kc=kind(c);return ka!==CAT&&kb!==CAT&&kc!==CAT&&ka!==SACK&&kb!==SACK&&kc!==SACK;}
  function fits(m,b,t){return !m.fr[b]||isCold(t);}
  // класс пустой полки для listMoves: равные пустые полки решатель не перебирает (холодильник, весы, подвоз, закрытая — отдельно)
  function ek(lv,st,b){if(st.x)return 'x';var m=masks(lv,st),k=(m.fr[b]?'f':'')+(m.np[b]?'n':''),ob=lv.ob;
    for(var i=0;i<ob.length;i++){var e=ob[i];if((e.id===6||e.id===7)&&e.s[0]===b)k+='s'+e.id;}return k;}

  /* ---- состояние ---- */
  function init(lv,st){var o=[],ob=lv.ob,i,k,e,n=0;for(i=0;i<(lv.obz||0);i++)o.push(0);
    for(i=0;i<ob.length;i++){e=ob[i];
      if(e.id===1)for(k=0;k<e.s.length;k++)o[e.o+k]=e.n[k];
      else if(e.id===2)o[e.o]=e.c0;
      else if(e.id===12)o[e.o+1]=e.p0||0;
      else if(e.id===7)n+=e.q.length;}
    st.o=o;st._m=null;
    for(i=0;i<lv.S;i++){var L=lv.sh[i];for(k=0;k<L.length;k++){var r=k===0?st.F[i]:L[k];for(var s=0;s<3;s++)if(r[s]&255)n++;}}
    st.n=n;}
  function resLeft(lv,st){var n=0,ob=lv.ob;for(var i=0;i<ob.length;i++){var e=ob[i];if(e.id===7)n+=e.q.length-st.o[e.o+1];}return n;}

  /* ---- после тройки на полке i (из settle) ---- */
  function clear(lv,st,i,t,ev,todo){if(st.x)return;var ob=lv.ob,k,e,j,s,c,S=st.F.length;
    for(k=0;k<ob.length;k++){e=ob[k];if(e.id===3)for(j=0;j<e.s.length;j++)if(!st.o[e.o+j]&&e.t[j]===t){st.o[e.o+j]=1;st._m=null;if(ev)ev.push({k:'ob',a:'unlock',id:3,i:e.s[j]});}}
    if(t===BOTTLE&&ev)ev.push({k:'ob',a:'bottle',id:4,i:i});
    for(j=i-1;j<=i+1;j++){if(j<0||j>=S)continue;var r=st.F[j],ch=false;
      for(s=0;s<3;s++){c=r[s];if(c<NEW)continue;var kd=kind(c);
        if(kd===SACK){var n=(cnt(c)&7)-1;if(n<=0){r[s]=0;ch=true;if(ev&&!(cnt(c)&8))ev.push({k:'ob',a:'sack',id:5,i:j,s:s});}else r[s]=setCnt(c,n|(cnt(c)&8));}
        else if(kd===CAT){r[s]=c&~(KMASK|CMASK);ch=true;if(ev)ev.push({k:'ob',a:'cat',id:12,i:j,s:s,t:c&255});}}
      if(ch&&j!==i)todo.push(j);}}
  // тройка на полке i засчитывается? (развесное — только на весах)
  function ok3(lv,st,i,t){if(st.x)return true;var ob=lv.ob;for(var k=0;k<ob.length;k++){var e=ob[k];if(e.id===6&&e.s[0]!==i)for(var j=0;j<e.t.length;j++)if(e.t[j]===t)return false;}return true;}
  // ряд выехал вперёд: обёртка снимается
  function adv(lv,st,i,row){for(var s=0;s<3;s++){var c=row[s];if(c>=NEW&&kind(c)===WRAP)row[s]=c&~(KMASK|CMASK);}}

  /* ---- после хода (из doMove): часы помех, кот, подвоз ---- */
  function after(lv,st,ev,cleared){if(st.x)return;var ob=lv.ob,todo=[],k,j,e;st._m=null;
    for(k=0;k<ob.length;k++){e=ob[k];
      if(e.id===1){for(j=0;j<e.s.length;j++)if(st.o[e.o+j]>0){st.o[e.o+j]--;if(!st.o[e.o+j]&&ev)ev.push({k:'ob',a:'open',id:1,i:e.s[j]});}}
      else if(e.id===2){var w0=wetOf(e,st);st.o[e.o]=(st.o[e.o]+1)%(e.S*e.n+e.r);var w1=wetOf(e,st);if(w1!==w0&&ev)ev.push({k:'ob',a:'mop',id:2,i:w1,f:w0});}
      else if(e.id===7){if(cleared)st.o[e.o]=0;else st.o[e.o]++;
        if(st.o[e.o]>=e.n&&st.o[e.o+1]<e.q.length){if(deliver(lv,st,e,todo,ev))st.o[e.o]=0;else st.o[e.o]=e.n;}}
      else if(e.id===12){if(catTick(st,ev))continue;st.o[e.o]++;if(st.o[e.o]>=e.n&&steal(lv,st,e,ev))st.o[e.o]=0;else if(st.o[e.o]>e.n)st.o[e.o]=e.n;}}
    st._m=null;settle(lv,st,todo,ev);}
  // кот держит товар не дольше h ходов (счётчик в битах 21–24): потом «наелся» и бросает сам — уровень не запирается
  function catTick(st,ev){for(var i=0;i<st.F.length;i++){var r=st.F[i];for(var s=0;s<3;s++){var c=r[s];if(c>=NEW&&kind(c)===CAT){var n=cnt(c)-1;
      if(n<=0){r[s]=c&~(KMASK|CMASK);if(ev)ev.push({k:'ob',a:'cat',id:12,i:i,s:s,t:c&255,self:1});}else r[s]=setCnt(c,n);return true;}}}return false;}
  function catOn(st){for(var i=0;i<st.F.length;i++){var r=st.F[i];for(var s=0;s<3;s++)if(r[s]>=NEW&&kind(r[s])===CAT)return true;}return false;}
  function steal(lv,st,e,ev){var S=st.F.length,m=masks(lv,st),p,i,s,c,best=null,bi=-1,bs=-1,bp=1e9;
    for(p=0;p<S;p++){i=(st.o[e.o+1]+p)%S;if(m.nt[i])continue;var r=st.F[i];
      for(s=0;s<3;s++){c=r[s];if(!c||(c&BOX)||iceN(c)>st.cl||(c>=NEW&&kind(c)!==WRAP))continue;var t=c&255,pr=e.t.indexOf(t);if(pr<0)pr=99;
        if(pr<bp){bp=pr;bi=i;bs=s;best=c;}}
      if(bp===0)break;}
    if(bi<0)return false;
    st.F[bi][bs]=(best&~(KMASK|CMASK))|(CAT<<17)|((e.h||4)<<21);st.o[e.o+1]=(bi+1)%S;if(ev)ev.push({k:'ob',a:'steal',id:12,i:bi,s:bs,t:best&255});return true;}
  function deliver(lv,st,e,todo,ev){var S=st.F.length,m=masks(lv,st),got=0,p,b,s;
    for(var n=0;n<3&&st.o[e.o+1]<e.q.length;n++){var c=e.q[st.o[e.o+1]],t=c&255,put=false;
      for(p=0;p<S&&!put;p++){b=(e.s[0]+p)%S;if(m.np[b]||!fits(m,b,t))continue;var r=st.F[b];
        for(s=0;s<3;s++)if(!r[s]){r[s]=c;put=true;st.o[e.o+1]++;got++;todo.push(b);if(ev)ev.push({k:'ob',a:'arrive',id:7,i:b,s:s,c:c});break;}}
      if(!put)break;}
    return got>0;}

  /* ---- конец settle: подвоз на пустую витрину, «не стоять зря» (обед/уборщица/подвоз, если ходов нет) ---- */
  function end(lv,st,todo,ev){if(st.x||!st.n||!lv.obT)return false;var ob=lv.ob,k,e,j,left=resLeft(lv,st);
    if(left&&st.n===left){for(k=0;k<ob.length;k++){e=ob[k];if(e.id===7&&st.o[e.o+1]<e.q.length&&deliver(lv,st,e,todo,ev)){st.o[e.o]=0;return true;}}}
    if(hasMove(lv,st))return false;var ch=false;st._m=null;
    for(k=0;k<ob.length;k++){e=ob[k];
      if(e.id===1){for(j=0;j<e.s.length;j++)if(st.o[e.o+j]>0){st.o[e.o+j]=0;ch=true;if(ev)ev.push({k:'ob',a:'open',id:1,i:e.s[j]});}}
      else if(e.id===2&&wetOf(e,st)>=0){var w0=wetOf(e,st);st.o[e.o]=e.S*e.n;ch=true;if(ev)ev.push({k:'ob',a:'mop',id:2,i:-1,f:w0});}}
    if(!ch&&left)for(k=0;k<ob.length;k++){e=ob[k];if(e.id===7&&st.o[e.o+1]<e.q.length&&deliver(lv,st,e,todo,ev)){st.o[e.o]=0;ch=true;break;}}
    return ch;}

  /* ---- ходы ---- */
  function hasMove(lv,st){var m=masks(lv,st),S=st.F.length,a,b,s;
    for(a=0;a<S;a++){if(m.nt[a])continue;var r=st.F[a];
      for(s=0;s<3;s++){var c=r[s];if(!movableC(st,c))continue;var t=c&255;
        for(b=0;b<S;b++){if(b===a||m.np[b]||!fits(m,b,t))continue;var q=st.F[b];if(!q[0]||!q[1]||!q[2])return true;}}}
    return false;}
  // listMoves: убрать запрещённые ходы и «ложные тройки» (товар у кота, развесное не на весах)
  function fix(lv,st,out){var m=masks(lv,st),w=0;
    for(var k=0;k<out.length;k++){var mv_=out[k],a=mv_[1],sa=mv_[2],b=mv_[3],sb=mv_[4];if(m.nt[a]||m.np[b])continue;
      var c=st.F[a][sa],t=c&255;if(!fits(m,b,t))continue;
      var q=st.F[b],cntB=0,emB=0,real=true;for(var s=0;s<3;s++){var x=q[s];if(!x)emB++;else if(!(x&BOX)&&(x&255)===t){cntB++;if(x>=NEW&&!mv(x))real=false;}}
      if(cntB===2&&emB===1){if(!st.x&&m.sc[t]!==undefined&&m.sc[t]!==b)real=false;if(!real)mv_[0]-=1100;}
      else if(!st.x&&m.sc[t]===b&&cntB>=1)mv_[0]+=80;
      out[w++]=mv_;}
    out.length=w;}

  /* ---- «вечный тупик» с помехами (только живая игра): осторожно — лишний раз выручить лучше, чем запереть навсегда ---- */
  function doomed(lv,st){var m=masks(lv,st),fr={},S=st.F.length,i,k,c,t,ob=lv.ob;
    for(i=0;i<S;i++){var L=lv.sh[i]||[[0,0,0]],P=st.p[i]||0;
      for(k=P;k<Math.max(L.length,P+1);k++){var r=k===P?st.F[i]:L[k],blk=!!m.lk[i];
        for(var s=0;s<3;s++){c=r[s];if(!c)continue;var kd=c>=NEW?kind(c):0;if((c&BOX)||kd===CAT||kd===SACK){blk=true;continue;}
          if(m.lk[i])continue;t=c&255;if(!t)continue;if(iceN(c)>st.cl)blk=true;else fr[t]=(fr[t]||0)+1;}
        if(blk)break;}}
    for(k=0;k<ob.length;k++){var e=ob[k];if(e.id===7)for(var j=st.o[e.o+1];j<e.q.length;j++){t=e.q[j]&255;fr[t]=(fr[t]||0)+1;}}
    for(t in fr)if(fr[t]>=3)return false;
    for(i=0;i<S;i++){if(m.lk[i])continue;var r2=st.F[i],ic={},oth=0,n=0;
      for(var s2=0;s2<3;s2++){c=r2[s2];if(!c)continue;var kd2=c>=NEW?kind(c):0;if((c&BOX)||kd2===CAT||kd2===SACK){oth++;continue;}if(iceN(c)>st.cl){ic[c&255]=(ic[c&255]||0)+1;n++;}}
      for(t in ic)if(n-ic[t]+oth===0&&ic[t]+(fr[t]||0)>=3)return false;}
    return true;}

  /* ---- очередь ---- */
  function noAsk(lv,t){return t===BOTTLE;}
  function costOf(lv,st,t){var ds=[];for(var i=0;i<lv.S;i++){var L=lv.sh[i];for(var k=st.p[i];k<L.length;k++){var r=k===st.p[i]?st.F[i]:L[k];
      for(var s=0;s<3;s++){var c=r[s];if(c&&(c&255)===t)ds.push(k-st.p[i]+(movableC(st,c)?0:1));}}}
    ds.sort(function(a,b){return a-b;});return (ds[0]||0)+(ds[1]||0)+(ds[2]||0);}
  // новый покупатель v (уже выбран обычным правилом): склочный — меняет товар на «не с переднего ряда», мама с малышом — терпение ×k
  function cust(lv,st,q,v,rem,res){var ob=lv.ob,e,k;
    for(k=0;k<ob.length;k++){e=ob[k];
      if(e.id===10&&v.id%e.e===e.e-1){var best=0,bs=1e9;
        for(var x in rem){var t=+x;if(t>=200||noAsk(lv,t)||Math.floor(rem[t]/3)-(res[t]||0)<=0||res[t])continue;var f=0;
          for(var i=0;i<lv.S;i++){var r=st.F[i];for(var s=0;s<3;s++)if(r[s]&&(r[s]&255)===t&&movableC(st,r[s]))f++;}
          var sc=f*10+q.R()*3;if(sc<bs){bs=sc;best=t;}}
        if(best){v.t=best;v.pat=v.max=lv.P+costOf(lv,st,best)*lv.pd+q.vis.length*2;}v.pat=v.max=Math.round(v.pat*(e.b||1));v.sk=1;}
      else if(e.id===11&&v.id===e.v){v.pat=v.max=Math.max(4,Math.round(v.pat*e.k));v.vet=1;}}}

  /* ---- постановка помехи на раскладку ---- */
  function cells(lv,f){var o=[];for(var s=0;s<lv.S;s++){var L=lv.sh[s];for(var k=0;k<L.length;k++)for(var j=0;j<3;j++)if(L[k][j]&&(!f||f(L[k][j],s,k,j)))o.push([s,k,j]);}return o;}
  function pickR(a,R){return a.length?a[Math.floor(R()*a.length)]:undefined;}
  function shuffleR(a,R){for(var i=a.length-1;i>0;i--){var j=Math.floor(R()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function used(lv){var u={};var ob=lv.ob||[];for(var i=0;i<ob.length;i++){var e=ob[i];if(e.s)for(var k=0;k<e.s.length;k++)u[e.s[k]]=1;}return u;}
  function freeShelves(lv,need){var u=used(lv),o=[];for(var s=0;s<lv.S;s++)if(!u[s]&&(!need||need(s)))o.push(s);return o;}
  function countT(lv){var m={};cells(lv).forEach(function(p){var t=lv.sh[p[0]][p[1]][p[2]]&255;if(t)m[t]=(m[t]||0)+1;});return m;}
  function rowTriple(r){var a=r[0],b=r[1],c=r[2];return a&&b&&c&&!((a|b|c)&BOX)&&(a&255)&&(a&255)===(b&255)&&(b&255)===(c&255);}
  // lv.gbx: отпечаток для сторожа = прежний lv.gbx (если был) + 'ob:'+JSON(lv.ob). LVL: свои поля дописывайте в gbx ДО place или через '|'.
  function add(lv,e,z){lv.ob=lv.ob||[];e.o=lv.obz||0;lv.obz=(lv.obz||0)+z;lv.ob.push(e);if(e.id===1||e.id===2||e.id===7)lv.obT=1;
    if(lv.gbx0===undefined)lv.gbx0=lv.gbx||'';lv.gbx=(lv.gbx0?lv.gbx0+'|':'')+'ob:'+JSON.stringify(lv.ob);return true;}
  function triIn(sh,rows){for(var i=0;i<rows.length;i++){var q=rows[i];if(rowTriple(sh[q[0]][q[1]]))return true;}return false;}
  function place(lv,id,R,p){p=Math.max(1,Math.min(3,p|0||1));if(!lv||!lv.sh||lv.tut||has(lv,id))return false;var S=lv.S,sh=lv.sh,i,k,s,c;
    switch(id){
    case 1:{var m=p>=3?2:1,cand=shuffleR(freeShelves(lv,function(s){return sh[s][0].some(Boolean);}),R);if(cand.length<2)return false;
      var ss=cand.slice(0,Math.min(m,cand.length-1)),nn=ss.map(function(){return [0,4,6,8][p]+Math.floor(R()*3);});
      return add(lv,{id:1,s:ss,n:nn,v:R()<.5?0:1},ss.length);}
    case 2:{if(S<3)return false;var n2=2,r2=[0,8,5,3][p];return add(lv,{id:2,S:S,n:n2,r:r2,c0:Math.floor(R()*S)*n2},1);}
    case 3:{var m3=p>=3?2:1,cand3=shuffleR(freeShelves(lv,function(s){return sh[s][0].some(Boolean);}),R),cnt3=countT(lv),ss3=[],tt3=[];
      for(i=0;i<cand3.length&&ss3.length<m3;i++){var sI=cand3[i],inS={};sh[sI].forEach(function(r){r.forEach(function(x){if(x)inS[x&255]=(inS[x&255]||0)+1;});});
        var keys=[];for(var t3 in cnt3){t3=+t3;if(t3>=200||t3===BOTTLE)continue;if(cnt3[t3]-(inS[t3]||0)>=3&&tt3.indexOf(t3)<0)keys.push(t3);}
        if(!keys.length)continue;keys.sort(function(a,b){return a-b;});ss3.push(sI);tt3.push(pickR(keys,R));}
      if(!ss3.length||ss3.length>=S)return false;return add(lv,{id:3,s:ss3,t:tt3},ss3.length);}
    case 4:{var cnt4=countT(lv),ts=[];for(var t4 in cnt4){t4=+t4;if(t4<200&&cnt4[t4]>=6)ts.push(t4);}ts.sort(function(a,b){return a-b;});shuffleR(ts,R);
      var m4=Math.min(p,ts.length),ch4=[];if(!m4)return false;
      for(k=0;k<m4;k++){var tk=ts[k],pos=shuffleR(cells(lv,function(c){return (c&255)===tk&&!(c&BOX);}),R).slice(0,3);if(pos.length<3)return false;
        pos.forEach(function(q){var c0=sh[q[0]][q[1]][q[2]];sh[q[0]][q[1]][q[2]]=(c0&~255)|BOTTLE;ch4.push(q);});}
      if(triIn(sh,ch4))return false;
      return add(lv,{id:4,m:m4},0);}
    case 5:{var m5=Math.min(p,Math.max(1,Math.floor(S/3))),c5=shuffleR(freeShelves(lv),R).slice(0,m5),k5=p>=3?2:1;if(!c5.length)return false;
      c5.forEach(function(s5){var row=[0,0,0],at=R()<.5?0:1,sk=(SACK<<17)|(k5<<21);row[at]=sk;row[at+1]=sk|(8<<21);sh[s5].splice(sh[s5][0].some(Boolean)&&R()<.35?1:0,0,row);});
      return add(lv,{id:5,m:c5.length,k:k5,s:c5},0);}
    case 6:{var cnt6=countT(lv),lo=[];for(var t6 in cnt6){t6=+t6;if(t6<200&&t6!==BOTTLE&&isLoose(t6))lo.push(t6);}
      if(!lo.length){var any=[];for(t6 in cnt6){t6=+t6;if(t6<200&&t6!==BOTTLE)any.push(t6);}any.sort(function(a,b){return a-b;});if(!any.length)return false;lo=[pickR(any,R)];}
      lo.sort(function(a,b){return a-b;});shuffleR(lo,R);lo=lo.slice(0,Math.min(lo.length,p>=2?2:1));
      var fs=freeShelves(lv);if(!fs.length)return false;fs.sort(function(a,b){return sh[a].length-sh[b].length||a-b;});var sc6=fs[Math.floor(R()*Math.min(2,fs.length))];
      return add(lv,{id:6,s:[sc6],t:lo},0);}
    case 7:{var want=3*p+3,q7=[],g=0;
      while(q7.length<want&&g++<60){var best=-1,bl=1;for(s=0;s<S;s++){var L=sh[s];if(L.length>bl&&!L[L.length-1].some(function(x){return (x&BOX)||(x&255)===BOTTLE||x>=NEW;})){bl=L.length;best=s;}}
        if(best<0)break;var rr=sh[best].pop();rr.forEach(function(x){if(x)q7.push(x&255);});}
      if(q7.length<3)return false;shuffleR(q7,R);return add(lv,{id:7,s:[Math.floor(R()*S)],n:[0,6,5,4][p],q:q7},2);}
    case 8:{var pr8=[0,.45,.7,1][p],c8=cells(lv,function(c,s,k){return k>=1&&c<NEW&&!(c&BOX)&&!iceN(c);}),n8=0;if(!c8.length)return false;
      c8.forEach(function(q){if(R()<pr8){sh[q[0]][q[1]][q[2]]|=WRAP<<17;n8++;}});if(!n8){var q0=c8[0];sh[q0[0]][q0[1]][q0[2]]|=WRAP<<17;}
      return add(lv,{id:8,p:pr8},0);}
    case 9:{var all9=cells(lv),cold=all9.filter(function(q){var c=sh[q[0]][q[1]][q[2]];return isCold(c&255)&&!(c&BOX)&&c<NEW;});if(cold.length<3)return false;
      var fs9=freeShelves(lv);fs9.sort(function(a,b){return cells1(sh[a])-cells1(sh[b])||a-b;});var cand9=fs9.slice(0,3),s9=-1;
      for(i=0;i<cand9.length;i++){var si=cand9[i],need=cells(lv,function(c,s){return s===si&&(!isCold(c&255)||(c&BOX)||c>=NEW);}).length,
          pool=cold.filter(function(q){return q[0]!==si;}).length;if(need<=pool&&cells1(sh[si])>0){s9=si;break;}}
      if(s9<0)return false;var pool9=shuffleR(cold.filter(function(q){return q[0]!==s9;}),R);
      var bad=cells(lv,function(c,s){return s===s9&&(!isCold(c&255)||(c&BOX)||c>=NEW);});
      for(i=0;i<bad.length;i++){var a9=bad[i],b9=pool9[i],x9=sh[a9[0]][a9[1]][a9[2]];sh[a9[0]][a9[1]][a9[2]]=sh[b9[0]][b9[1]][b9[2]];sh[b9[0]][b9[1]][b9[2]]=x9;}
      if(triIn(sh,bad.concat(pool9.slice(0,bad.length))))return false;
      return add(lv,{id:9,s:[s9]},0);}
    case 10:return add(lv,{id:10,e:[0,4,3,2][p],b:[0,1.6,1.5,1.4][p]},0);
    case 11:return lv.K>=2?add(lv,{id:11,v:lv.K>=6?3:1,k:[1,.8,.65,.5][p]},0):false;
    case 12:{var cnt12=countT(lv),pref=[];for(i=0;i<SAUS.length;i++)if(cnt12[SAUS[i]])pref.push(SAUS[i]);
      if(!pref.length){var mx=0,mt=0;for(var t12 in cnt12){t12=+t12;if(t12<200&&t12!==BOTTLE&&cnt12[t12]>mx){mx=cnt12[t12];mt=t12;}}if(!mt)return false;pref=[mt];}
      return add(lv,{id:12,n:[0,8,6,5][p],h:[0,4,5,6][p],t:pref,p0:Math.floor(R()*S)},2);}
    }
    return false;}
  function cells1(L){var n=0;for(var k=0;k<L.length;k++)for(var j=0;j<3;j++)if(L[k][j])n++;return n;}

  /* ---- для рисунков ---- */
  function shelfState(lv,st,i){if(!lv||!lv.ob||!st||!st.o)return null;var o={},ob=lv.ob,k,j,e;
    for(k=0;k<ob.length;k++){e=ob[k];
      if(e.id===1){j=e.s.indexOf(i);if(j>=0&&st.o[e.o+j]>0&&!st.x){o.obed=st.o[e.o+j];o.v=e.v;}}
      else if(e.id===2){if(wetOf(e,st)===i&&!st.x)o.wet=e.n-(st.o[e.o]%e.n);}
      else if(e.id===3){j=e.s.indexOf(i);if(j>=0&&!st.o[e.o+j]&&!st.x)o.lock=e.t[j];}
      else if(e.id===6){if(e.s[0]===i)o.scale=e.t;}
      else if(e.id===7){if(e.s[0]===i){o.conv=e.q.length-st.o[e.o+1];o.convT=e.n-st.o[e.o];}}
      else if(e.id===9){if(e.s.indexOf(i)>=0)o.fridge=1;}}
    return o;}

  /* ---- уровень с помехами для стенда (?ob=<id>&demo=N) и автотестов OBST: как genLevel из LOGIC + place. Генератор игры — у LVL ---- */
  function demo(i,seed,ids,p,rareId){var P=levelParams(i);if(P.tut)return null;var need=needFr(i),best=null;
    for(var k=0;k<120;k++){var R=rng(seed+k*1013),lv=buildLevel(P,R,i,rareId==null?-1:rareId);if(!lv)continue;var ok=true;
      for(var j=0;j<ids.length&&ok;j++)ok=place(lv,ids[j],R,p);if(!ok)continue;
      var st=mkState(lv);settle(lv,st,lv.sh.map(function(_,j){return j;}));var sol=solve(lv,st,30000);if(!sol)continue;
      lv.sol=sol.length;lv.try=k;lv.fr=friendly(lv,16,rng(seed+k));
      var mp=Math.max(2.2,Math.min(4.5,lv.mpt));lv.P=Math.round(10+4.5*mp)+(P.pt||0);lv.pd=1+Math.round(mp/2);if(P.pt>=30){lv.P=40;lv.pd=0;}
      if(lv.fr>=need)return lv;if(!best||lv.fr>best.fr)best=lv;
      if(k%30===29&&P.E<6)P.E++;}
    return best;}

  return {demo:demo,T:T,NEW:NEW,WRAP:WRAP,SACK:SACK,CAT:CAT,BOTTLE:BOTTLE,kind:kind,cnt:cnt,isCold:isCold,isLoose:isLoose,has:has,on:on,
    place:place,ek:ek,init:init,after:after,end:end,clear:clear,ok3:ok3,adv:adv,fix:fix,hasMove:hasMove,doomed:doomed,cust:cust,noAsk:noAsk,
    tri:tri,mv:mv,masks:masks,wetOf:wetOf,shelfState:shelfState,resLeft:resLeft,catOn:catOn};
})();
if(typeof window!=='undefined')window.GBOB=GBOB;
