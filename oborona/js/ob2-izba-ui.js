'use strict';
/* ================= ob2:IZBA — оболочка новых мини-игр «Дозорной избы» и починка старых 14 (буст_в2.0, 12.10.2026; журнал hobby-analytics/release-i/oborona-boost2/logs/IZBA.md) =================
   ЛЕНИВЫЙ файл: грузит js/ob2-izba.js (IZ.load) — при входе в избу, тихо через 4 с после меню (изба открыта), по окну итога старой игры.

   ======================== ДОГОВОР ДЛЯ ИГР (LOVA, LOVB — ловкостные 15–24; TIHO — спокойные 25–29) ========================
   1) Каталог CAT ниже — номера, id, название, ведущий, значок, открытие (u: 0 — с избой, k — k-й босс по CH_ORDER), единица, mid, медали md, low (меньше — лучше).
      Своя строка — только СВОЯ: можно править любые поля своей строки (не трогая чужие строки). На полке «Удаль» игра есть, когда её флаг включён
      ('lov-<id>' / 'tiho-<id>') И она уже зарегистрирована MG_REG (заглушка в index.html) ИЛИ стоит r:1 (тогда полка сама грузит файлы kit по порядку и ждёт MG_REG).
   2) Подключить игру можно тремя способами — все дают полку, «Удаль дня», игрища, вызов соседа, доску рекордов и медали:
      А) как у Зины: файл игры (лениво, kit:['js/ob2-izba-lk.js','js/<игра>.js']) зовёт IZ.reg({num, run(host,o), sim?}) — host ниже (п. 3); итог — оболочка.
      Б) свой набор + MG_REG({id,num,kind:'lov',…}); в конце партии host.done({score, tier, extra:{label, why}}) → окно итога ОБОЛОЧКИ (рекорд, соседи, «Ещё разок», награда) — так LOVB.
      В) свой набор со СВОИМ итогом (рекорд сам пишет в S.dzr.b/n[num], награда 1 трофей в день — сам; так LOVA): после партии OB2.emit('mg',{id, sc, rec}) БЕЗ поля num —
         оболочка досчитает «Удаль дня», игрища, медали и Ратибора. Соседей для своего итога берите из IZR.rows(num) (если IZR загружен) — числа совпадут с доской.
         «Меньше — лучше» (Ступа): в S.dzr.b хранится 99999 − десятые секунды, в каталоге low:1, md — секунды (по убыванию).
   3) host способа А — КАК У ЗИНЫ (zmg-core.js, slovo-zb2-lov) — её движки переносятся почти без правок (проба — IZBA-tools/t_shim.py: «Компот» Зины как «Зелье»):
        host.el, w, h, dpr, o, id, root, paused, pc (мышь), calm (спокойный режим), fest ({id:'night'} в «Ночь нечисти» или null), snd (tap coin bad win open bonus meow → звуки Обороны);
        host.intro({text, hint, btn, who}) → Promise — карточка «одно нажатие до начала» (при «Ещё разок» — сразу, без карточки);
        host.cv() → {cv,x,w,h,dpr}; host.loop(fn(dt,t)) — кадры (на паузе стоят); host.ptr(el,{down,move,up}); host.keys(fn(key,e)) — клавиши ПК (true — съедена; Esc — оболочка);
        host.kc('Enter') — значок клавиши (только ПК); host.top(text) — строка в шапке; host.say(who,text,mood) → HTML; host.face(who,mood) → HTML-портрет; host.whoName(who);
          who: voevoda yaga mikula bayun pahom ratibor marfa vasilisa leshiy rusalka karachun ivan kikimora gorynych (рисунки — из art.js, новых не рисуем);
        host.adOk() / host.adNeed(kind) → Promise<bool> — ролик «по нужде», ОДИН за партию (кнопку — только при adOk(), класс «btn ad»);
        host.finish({sc, st:0..3, label?, why?}) — конец партии (host.done — то же). why — ПОЧЕМУ сбился («Рано отпустил — зелье не дошло до черты»), строкой в итоге.
        host.quit() — выйти без итога; host.mem() — свой склад игры (≤ 300 знаков, числа/короткие строки; лежит в S.dzr.q.g[num]); host.onResize(fn), host.onQuit(fn).
      o = {id, num, mode:'lov'|'train', train, seed, rnd, day, calm, lvl, ctx, rw:[0,0,0,0], fest,
           first — ни разу не играл (ПОКАЗ с пальцем 👆 — ZLK.demo/ZLK.hand), plays, best, warm — сколько первых действий разминки без проигрыша (3, если партий < 3; иначе 0), fast — «Ещё разок»}.
   4) Набор ZLK (js/ob2-izba-lk.js) — тот же, что у Зины: ZLK.frame/canvas/loop/keys/tap/cont/pop/btn/kc/rr/buzz/pick/tier/snd/calm
      + ZLK.hand(ctx,x,y,press,px) — нарисованный палец 👆, ZLK.demo(host,box,{text,sec}) → Promise — «Смотри, как надо» (игра сама играет ботом), «Понятно!» — пропустить.
   5) Рекорды — IZR (вместо ZMGREC; те же имена): IZR.cfg(num,{u:[ед.1,ед.2,ед.5,en1,en2], mid, md:[бронза,серебро,золото], max, low}), IZR.best(num), IZR.rival(num) (= galya),
      IZR.finish(host,{sc,st,label,why}) (= host.finish), IZR.table(num), IZR.gap(num), IZR.medal(num), IZR.unit(num,n), IZR.rows(num) → [{i, n:имя, f:лицо, v}] — 4 соседа.
      Соседи — Ратибор, Марфа, Василиса, Пахом (TOUR_NB 0,1,3,2); Ратибор раз в день отыгрывается (как Галя у Зины). Награда — 1 трофей в день за первую партию
      + очки дозора (рекорд +5); «Удаль дня» — ещё 10 Славы; игрища — до 3×10 Славы за рекорд недели, 1–3 место — знамя; медали → знамёна (5, 15 очков, всё золото — «Удалой молодец»). Золота и звёзд нет.
   6) Спокойные (TIHO) живут на MG_REG/MG_FIN (num 25–29, своя полка «Тихие игры»); каталог даёт им ленивый запуск IZU.play(num) (kit:['js/tiho.js'], r:1).
   Сейв: рекорды и партии — S.dzr.b/n[num] (как у 14 старых); «Удаль» — S.dzr.q {d:день, p:{num:1} награда сегодня, u:«Удаль дня» сыграна, rg/rd:{num} рекорд и день Ратибора,
     m:{num:медаль}, nw/nd — новость «Ратибор побил», w:{w,b,s,n,c,pl} — игрища недели, g:{num:{}} — склады игр}; TIHO — S.dzr.tb. Облако — js/ob2-izba.js (dzr2), чужие ключи S.dzr не теряются.
   События для других потоков: OB2.emit('mg',{id,num,sc,tier,m,rec}) — после ЛЮБОЙ мини-игры (оболочка; у способа В — сама игра, без num), OB2.emit('rec',{id,num,sc,pl}) — новый рекорд.
   STAT: mg {a:'again',id,n} · rec {id,sc,pl} · cont {id} · mg {a:'call',id,r:show|go|skip} · вход src: udal|day|call|board|week|auto · mod {m:'udal',a:'shelf'|'board'} · udal {a:'week',pl,b}. Шина: igr {a:'go'|'win'|'end',pl} (договор VKT).
   Старые WebView: без ?. ?? .at( :has structuredClone. */
(function(){if(window.IZU)return;
var LK='js/ob2-izba-lk.js';
/* ---------- каталог: 10 ловкостных (LOVA 15–18, LOVB 19–24) и 5 спокойных (TIHO 25–29). Своя строка — только своя (см. договор п. 1) ---------- */
var CAT=[
/* ob2-LOVA — набор js/lov-kit.js (свой итог, рекорд в S.dzr.b; у Ступы «меньше — лучше»: хранится 99999−десятые) */
{n:15,id:'srub',r:1,u:0,k:'lov',who:'mikula',ic:'tour_nb4',kit:['js/lov-kit.js'],t:['Сруб заставы','Log Fort'],a:['Роняй брёвна ровно — сруб растёт','Drop the logs straight — the fort grows'],un:['венец','венца','венцов','log','logs'],mid:14,md:[10,20,32]},
{n:16,id:'zelie',r:1,u:0,k:'lov',who:'yaga',ic:'flask',kit:['js/lov-kit.js'],t:['Зелье до черты','Potion to the Line'],a:['Держи — Яга наливает; отпусти ровно на черте','Hold — Yaga pours; let go right at the line'],un:['склянка','склянки','склянок','flask','flasks'],mid:9,md:[6,12,20]},
{n:17,id:'cep',r:1,u:1,k:'lov',who:'bayun',ic:'kot',kit:['js/lov-kit.js'],t:['Златая цепь','The Golden Chain'],a:['Баюн прыгает через цепь — жми, когда цепь у земли','Bayun jumps the chain — tap when it touches the ground'],un:['прыжок','прыжка','прыжков','jump','jumps'],mid:18,md:[10,25,45]},
{n:18,id:'stupa',r:1,u:2,k:'lov',low:1,who:'yaga',ic:'tetka',kit:['js/lov-kit.js'],t:['Ступа тётушки Яги','Auntie Yaga’s Mortar'],a:['Поставь ступу задом в сарайчик — не задень кур!','Back the mortar into the shed — mind the hens!'],mid:44,md:[75,52,36]},
/* ob2-LOVB — набор js/lovb-kit.js + js/lovb-a|b|c.js по требованию (r:1); игра → host.done → итог оболочки IZBA */
{n:19,id:'zmey',r:1,kit:['js/lovb-kit.js','js/lovb-c.js'],u:5,k:'lov',who:'gorynych',ic:'gory',t:['Змеёныш','Little Gorynych'],a:['Собирай молодильные яблоки, не врежься в хвост','Collect the apples, don’t bite your tail'],un:['яблоко','яблока','яблок','apple','apples'],mid:14,md:[8,16,26]},
{n:20,id:'yabl',r:1,kit:['js/lovb-kit.js','js/lovb-c.js'],u:7,k:'lov',who:'vasilisa',ic:'lesh',t:['Яблочко','The Apple Shot'],a:['Отпусти тетиву в зелёной зоне — яблоко на шапке Лешего','Release in the green zone — the apple on the Leshy’s hat'],un:['яблоко','яблока','яблок','apple','apples'],mid:10,md:[5,10,16]},
{n:21,id:'kover',r:1,kit:['js/lovb-kit.js','js/lovb-a.js'],u:3,k:'lov',who:'ivan',ic:'hp_iva',t:['Ковёр-самолёт','The Flying Carpet'],a:['Держишь — ковёр взмывает, отпустил — снижается','Hold — the carpet rises, let go — it glides down'],un:['вёрста','вёрсты','вёрст','verst','versts'],mid:14,md:[5,12,20]},
{n:22,id:'kuzn',r:1,kit:['js/lovb-kit.js','js/lovb-a.js'],u:4,k:'lov',who:'mikula',ic:'hp_mik',t:['Кузня Микулы','Mikula’s Forge'],a:['Хватай с жёлоба только то, что заказали','Grab only what was ordered off the chute'],un:['вещь','вещи','вещей','item','items'],mid:12,md:[6,13,21]},
{n:23,id:'otogrey',r:1,kit:['js/lovb-kit.js','js/lovb-b.js'],u:6,k:'lov',who:'ratibor',ic:'karach',t:['Отогрей заставы','Thaw the Outposts'],a:['Карачун морозит заставы — держи палец, отогревай','Karachun freezes the outposts — hold to thaw them'],un:['застава','заставы','застав','outpost','outposts'],mid:11,md:[7,13,19]},
{n:24,id:'zaris',r:1,kit:['js/lovb-kit.js','js/lovb-b.js'],u:0,k:'lov',who:'pahom',ic:'kik',t:['Зарисуй нечисть','Sketch the Monsters'],a:['Жми «Готово!», когда все замерли','Press “Done!” when everyone holds still'],un:['портрет','портрета','портретов','portrait','portraits'],mid:6,md:[3,7,12]},
/* ob2-TIHO — набор js/tiho.js, своя полка «Тихие игры» (здесь — для ленивого запуска IZU.play и сводки) */
{n:25,id:'bort',r:0,u:0,k:'calm',who:'pahom',ic:'mg_i25',kit:['js/tiho.js'],t:['Борть','The Wild Hive'],a:['Поставь сегодня — мёд завтра','Set it today — honey tomorrow']},
{n:26,id:'podm',r:0,u:0,k:'calm',who:'kikimora',ic:'mg_i26',kit:['js/tiho.js'],t:['Подменыш','The Changeling'],a:['Кикимора подменила пять вещей — найди','Kikimora swapped five things — find them']},
{n:27,id:'byl',r:0,u:0,k:'calm',who:'pahom',ic:'mg_i27',kit:['js/tiho.js'],t:['Былина или небылица','Tale or Tall Tale'],a:['Правда по былине или Дед Пахом выдумал?','True to the legend or did Grandpa Pakhom make it up?']},
{n:28,id:'oboz',r:0,u:0,k:'calm',who:'voevoda',ic:'mg_i28',kit:['js/tiho.js'],t:['Обоз','The Wagon Train'],a:['Уложи припасы в телегу','Pack the supplies into the cart']},
{n:29,id:'kosti',r:0,u:0,k:'calm',who:'pahom',ic:'mg_i29',kit:['js/tiho.js'],t:['Кости у костра','Dominoes by the Fire'],a:['Партия в кости с Дедом Пахомом','A game of dominoes with Grandpa Pakhom']}
/* /каталог */];
var CN={},CI={};CAT.forEach(function(c){CN[c.n]=c;CI[c.id]=c;OB2.reg((c.k==='lov'?'lov-':'tiho-')+c.id,{s:c.n<19?'LOVA':c.n<25?'LOVB':'TIHO',t:'Мини-игра «'+c.t[0]+'»'});});
function fl(c){return (c.k==='lov'?'lov-':'tiho-')+c.id;}
/* знамёна «Удали» (медали, игрища) */
if(typeof xbnAdd==='function')[['udal1','Знамя удальца','Daredevil Banner','#6a3a1a','#ffd84a',[5,.45]],['udal2','Знамя ловкача','Nimble Hand Banner','#1e5a6a','#ffe7a0',[6,.5]],
  ['udal3','Знамя Удалого молодца','Bold Fellow Banner','#8a1616','#ffd84a',[12,.7]],['igr','Знамя богатырских игрищ','Bogatyr Games Banner','#2f6a3a','#ffffff',[8,.5]]]
  .forEach(function(b){xbnAdd({id:b[0],n:b[1],en:b[2],c1:b[3],c2:b[4],em:b[5]});});
[['udal','Полка «Удаль»: ловкостные на рекорд, соседи, медали, доска рекордов'],['izba2','Починка 14 игр избы: большая «Ещё разок» и соседи в итогах'],['udal-day','«Удаль дня» — одна ловкостная на всех'],
 ['udal-call','Вызов соседа в окне победы вместо «Передышки»'],['igrisha','«Богатырские игрища» раз в неделю в турнире']].forEach(function(x){OB2.reg(x[0],{s:'IZBA',t:x[1]});});
var OLD=[1,3,4,5,6,9,11,12];   // старые «на очки» — «Ещё разок» и соседи
var ob=function(v){return v&&typeof v==='object'&&!Array.isArray(v);};
function ev(n,p){try{STAT.ev(n,p);}catch(e){}}
function sn(k){try{SND[k]();}catch(e){}}
function esc(t){return String(t==null?'':t).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];});}
function rn(s){s=String(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}h=Math.imul(h^h>>>15,1|h);h^=h+Math.imul(h^h>>>7,61|h);return ((h^h>>>14)>>>0)/4294967296;}
function dnum(k){var p=String(k||dayKey()).split('-');return Math.round(Date.UTC(+p[0],+p[1]-1,+p[2])/864e5);}
function today(){return dnum(dayKey());}
/* ---------- сейв S.dzr.q ---------- */
function Q(){var z=DZ();if(!ob(z.q))z.q={};var q=z.q,k=dayKey();['p','rg','rd','m','g'].forEach(function(x){if(!ob(q[x]))q[x]={};});
  if(q.d!==k){q.d=k;q.p={};q.u=0;}if(!ob(q.w))q.w={w:0,b:0,s:0,n:0};return q;}
/* ---------- открытие и готовность: флаг игры включён и игра есть (MG_REG уже был) или отмечена r:1 (грузится набором kit) ---------- */
function ready(c){return !!c&&!OB2.off(fl(c))&&!(c.k==='lov'&&OB2.off('udal'))&&(!!c.r||!!(typeof mgG==='function'&&mgG(c.n)));}
function open(c){if(!c||!mgIzbaOpen())return false;var g=typeof mgG==='function'&&mgG(c.n);try{if(g&&typeof g.open==='function')return !!g.open();}catch(e){}return !c.u||mgBoss(c.u);}
function lockTxt(c){var o=typeof CH_ORDER!=='undefined'?CH_ORDER:[],ch=CH[o[c.u-1]];return Lg('после босса '+c.u+'-й земли'+(ch?' «'+ch.name+'»':''),'after the boss of land '+c.u+(ch?' “'+ch.name+'”':''));}
function lovs(all){return CAT.filter(function(c){return c.k==='lov'&&ready(c)&&(all||open(c));});}
function nm(n){var c=CN[n];if(c)return Lg(c.t[0],c.t[1]);return typeof mgNameN==='function'?mgNameN(n):String(n);}
function icon(n,px){var c=CN[n],g=typeof mgG==='function'&&mgG(n),k=g&&g.icon&&ART[g.icon]?g.icon:c&&ART[c.ic]?c.ic:'mg_i'+n;return ic(ART[k]?k:'mg_book',px||96);}
/* ---------- числа игр: единица, средний результат «хорошей руки», медали; low — «меньше — лучше» (секунды) ---------- */
var CFG={};
function cf(n){var c=CN[n]||{},x=CFG[n]||{};return {u:x.u||c.un||['очко','очка','очков','point','points'],mid:x.mid||c.mid||Math.max(10,DZ().b[n]|0),md:x.md||c.md||[0,0,0],max:x.max||c.max||0,low:!!(x.low||c.low)};}
function low(n){return cf(n).low;}
function r1(n,v){return low(n)?Math.round(v*10)/10:Math.round(v);}
function val(n){var b=DZ().b[n]|0;return low(n)?(b>0?Math.round(99999-b)/10:0):b;}   // рекорд в единицах игры (у «меньше — лучше» хранится 99999−десятые)
function better(n,a,b){return low(n)?a>0&&(!(b>0)||a<b):a>b;}
function fmtV(n,v){return low(n)?(v>0?(typeof dnum==='function'?String(v.toFixed(1)).replace('.',LANG==='en'?'.':','):v.toFixed(1))+Lg(' с',' s'):'—'):fmtNum(v);}
function unit(n,v){if(low(n))return fmtV(n,v);var u=cf(n).u;return fmtNum(v)+' '+(typeof plw==='function'?plw(v,u[0],u[1],u[2],u[3]||u[0],u[4]||u[2]):u[2]);}
function best(n){return val(n);}
/* ---------- соседи: Ратибор отыгрывается (как Галя у Зины), Марфа, Василиса, Пахом — от рекорда игрока ±15 % ---------- */
var NB=[{i:0,k:1,g:['Ратибора','Ratibor']},{i:1,k:.95,g:['Марфы','Marfa']},{i:3,k:.85,g:['Василисы','Vasilisa']},{i:2,k:.72,g:['Пахома','Pakhom']}];
function nbName(i){return typeof tourNbName==='function'?tourNbName(i):['Ратибор','Марфа','Пахом','Василиса'][i]||'';}
function nbFace(i){return typeof tourFace==='function'?tourFace(i):ic('voevoda',64);}
function rBase(n,v){var c=cf(n),r=rn(n+'|g|'+today());if(c.low)return v>0?r1(n,v*(.86+.08*r)):c.mid;
  var g=Math.max(Math.round(c.mid*.9),Math.ceil(v*(1.05+.1*r))+1);return c.max?Math.min(c.max,g):g;}
function rival(n){var q=Q();return q.rg[n]||rBase(n,best(n));}
/* раз в день: если игрок впереди Ратибора — с вероятностью 0,65 он ставит новый рекорд на 5–15 % лучше; новость — по самой играемой игре */
function tick(){var q=Q(),z=DZ(),d=today(),top=null;
  for(var k in q.rg){var n=+k,b=best(n);if(!b||(q.rd[k]|0)>=d)continue;
    if(!better(n,q.rg[k],b)&&rn(n+'|bk|'+d)<.65){q.rg[k]=rBase(n,b);if(better(n,q.rg[k],b)&&(!top||(z.n[n]|0)>(z.n[top]|0)))top=n;}q.rd[k]=d;}
  if(top){q.nw=top;q.nd=d;}}
function news(){var q=Q();if(!q.nw||today()-(q.nd|0)>3)return null;var n=q.nw;if(CN[n]&&!(ready(CN[n])&&open(CN[n])))return null;if(!CN[n]&&OLD.indexOf(n)<0)return null;
  return better(n,q.rg[n],best(n))?{n:n,g:q.rg[n]}:null;}
function table(n,base){var b=best(n),c=cf(n),w=weekNo(),bs=b||base||c.mid,out=[{i:0,sc:rival(n)}];if(!c.low)bs=Math.max(bs,Math.round(c.mid*.8));
  NB.slice(1).forEach(function(x){var k=x.k*(.85+.3*rn(n+'|'+x.i+'|'+w)),s=c.low?bs/k:bs*k;s=r1(n,s);if(c.max)s=Math.min(c.max,s);out.push({i:x.i,sc:c.low?s:Math.max(1,s)});});
  out.push({i:-1,sc:b,me:1});out.sort(function(a,b2){return better(n,a.sc,b2.sc)?-1:better(n,b2.sc,a.sc)?1:(a.me?-1:b2.me?1:0);});return out;}
function gap(n,base){var L=table(n,base),i=0;for(;i<L.length;i++)if(L[i].me)break;if(!i)return null;var u=L[i-1],x=NB.filter(function(y){return y.i===u.i;})[0],me=L[i].sc;
  var d=low(n)?(me>0?Math.max(.1,r1(n,me-u.sc)):0):u.sc-me+1;return {i:u.i,g:x?Lg(x.g[0],x.g[1]):nbName(u.i),n:d};}
function mdOf(n,v){var c=cf(n),m=c.md,k=0;for(var i=0;i<3;i++)if(m[i]&&(c.low?v>0&&v<=m[i]:v>=m[i]))k=i+1;return k;}
function medal(n){return Math.max(Q().m[n]|0,mdOf(n,best(n)));}
var MDE=['','🥉','🥈','🥇'];function mdName(k){return [null,Lg('Бронза','Bronze'),Lg('Серебро','Silver'),Lg('Золото','Gold')][k]||'';}
/* записать партию ловкостной, идущей через итог оболочки (host.done → MG_FIN): рекорд, партии, Ратибор, медаль */
function put(n,sc){sc=Math.max(0,Math.round(+sc||0));var z=DZ(),q=Q(),prev=z.b[n]|0;z.n[n]=(z.n[n]|0)+1;if(!q.rg[n])q.rg[n]=rBase(n,prev);if(!q.rd[n])q.rd[n]=today();
  var g0=q.rg[n];if(sc>prev)z.b[n]=sc;var m0=Q().m[n]|0,m1=mdOf(n,Math.max(prev,sc));if(m1>m0)q.m[n]=m1;
  var L=table(n),p=1;for(var j=0;j<L.length;j++)if(L[j].me){p=j+1;break;}
  var r={rec:sc>prev&&sc>0,first:!prev&&sc>0,best:z.b[n],prev:prev,place:p,of:L.length,gap:gap(n),medal:m1>m0?m1:0,beat:prev<=g0&&sc>g0,sc:sc};
  if(q.nw===n&&r.beat)q.nw=0;if(r.rec){ev('rec',{id:(CN[n]||{}).id||n,sc:sc,pl:p});try{OB2.emit('rec',{id:(CN[n]||{}).id||n,num:n,sc:sc,pl:p});}catch(e){}}return r;}
/* сводка после партии, где рекорд записал не я (старые 14 — MG_FIN; наборы со своим итогом — LOVK): Ратибор, медаль, место */
function seen(n,sc,prevBest){var q=Q();if(!q.rg[n])q.rg[n]=rBase(n,prevBest||0);if(!q.rd[n])q.rd[n]=today();var g0=q.rg[n],L=table(n,sc),p=1;for(var j=0;j<L.length;j++)if(L[j].me){p=j+1;break;}
  var m1=mdOf(n,best(n));if(m1>(q.m[n]|0))q.m[n]=m1;
  var r={place:p,of:L.length,gap:gap(n,sc),beat:better(n,sc,g0)&&!better(n,prevBest,g0)};if(q.nw===n&&better(n,best(n),g0))q.nw=0;return r;}
function putOld(n,sc,rec){return seen(n,sc,rec?0:best(n));}
function tblHtml(n,rows,base){var L=table(n,base),m=0;for(var i=0;i<L.length;i++)if(L[i].me)m=i;var a=0,b=L.length;if(rows&&rows<L.length){a=Math.max(0,Math.min(L.length-rows,m-1));b=a+rows;}
  return '<ol class="izTb">'+L.slice(a,b).map(function(x,i){return '<li'+(x.me?' class="me"':'')+'><span>'+(a+i+1)+'</span><img src="'+(x.me?ic('voevoda',64):nbFace(x.i))+'" alt=""><b>'+(x.me?Lg('Ты','You'):esc(nbName(x.i)))+'</b><i>'+fmtV(n,x.sc)+'</i></li>';}).join('')+'</ol>';}
function gapHtml(n,r,old){var g=r.gap;if(r.beat)return '<p class="izGap ok">'+Lg('Ратибор позади! Посмотрим, что он ответит завтра…','Ratibor is behind you! Let’s see his answer tomorrow…')+'</p>';
  if(!g)return '<p class="izGap ok">'+Lg('Первое место среди соседей!','First place among the neighbours!')+'</p>';
  var t=old?fmtNum(g.n):unit(n,g.n);return '<p class="izGap">'+Lg('До '+g.g+' — '+t+'. Ещё разок?',g.g+' is '+t+' ahead. One more go?')+'</p>';}
/* партия набора со своим итогом (LOVK): событие 'mg' {id, score|sc, rec} без num → Удаль дня, игрища, медали, Ратибор */
OB2.on('mg',function(e){try{if(!e||e.num!=null)return;var c=CI[e.id];if(!c||c.k!=='lov')return;var v=+(e.sc!=null?e.sc:e.score)||0,q=Q(),out={items:[],sl:0};
  seen(c.n,v,e.rec?0:best(c.n));if(on('udal-day')&&c.n===dayGame()&&!q.u){q.u=1;q.p[c.n]=1;out.sl=mgSl(10);}wkPut(c.n,v,out);mdClaim(out.items);dzTouch();save();
  if(out.sl||out.items.length)toast((out.sl?'+'+out.sl+Lg(' Славы',' Fame'):'')+(out.items.length?(out.sl?' · ':'')+out.items.map(function(x){return x.t;}).join(' · '):''));}catch(x){console.warn('iz mg',x);}},'udal');
/* ---------- стиль ---------- */
function css(){if($('izCss'))return;if(typeof dzCss==='function')dzCss();var s=document.createElement('style');s.id='izCss';s.textContent=
 '.izTb{list-style:none;margin:6px auto 4px;padding:0;max-width:360px;font:600 15px/1.25 var(--f);text-align:left}.izTb li{display:flex;gap:8px;align-items:center;padding:2px 8px;border-radius:10px}'+
 '.izTb li span{width:16px;opacity:.6;text-align:right}.izTb li img{width:26px;height:26px;flex:none}.izTb li b{flex:1;min-width:0;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.izTb li i{font-style:normal;font-weight:900;color:var(--cGold,#a85c00)}.izTb li.me{background:var(--goldBg,#fff0bf);box-shadow:inset 0 0 0 2px var(--goldB,#e0a92e)}'+
 '.izGap{margin:4px 0;text-align:center;font-weight:800;color:var(--cBad,#9a3a1a)}.izGap.ok{color:var(--cOk,#2f7a1c)}.izWhy{margin:2px 0 4px;text-align:center;font-weight:700;color:var(--ink2,#6a4a2a)}'+
 '.izRw{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 12px;margin:6px 0 2px;font:800 15px/1.2 var(--f);color:var(--cGold,#a85c00)}.izRw span{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}.izRw img{width:24px;height:24px}'+
 '.izMd{margin:2px auto 6px;display:table;max-width:100%;text-align:center;padding:4px 14px;border-radius:12px;background:var(--paper,#fffaf0);border:2px solid var(--goldB,#e0a92e);font-weight:900}'+
 '.mgRes .btns .izAg{font-size:21px;min-height:58px}.mgRes .btns .izNo{min-height:44px}'+
 '.izKc{display:inline-block;font:700 11px/1 var(--f);border:1px solid currentColor;border-radius:5px;padding:2px 4px;margin-left:6px;opacity:.65;vertical-align:middle}'+
 '#izUdal h2 small{font:700 13px/1.2 var(--f);color:var(--ink2);display:block;margin-top:2px}'+
 '#izUdal .izNw{display:flex;align-items:center;gap:10px;cursor:pointer;background:var(--goldBg,#fff0bf);border-color:var(--goldB,#e0a92e)}#izUdal .izNw img{width:48px;height:48px;flex:none}'+
 '#izUdal .izNw .t{flex:1;min-width:0}#izUdal .izNw .btn{flex:none;width:auto;min-width:0;padding:8px 14px;margin:0}'+
 '#izUdal .izDay{position:relative;padding-top:26px;margin-top:14px}#izUdal .izDay .dzRib{background:#2f6a3a;border-color:#1a4022;text-shadow:0 1px 0 #1a4022}'+
 '#izUdal .izTl .md{position:absolute;top:4px;right:6px;font-size:18px}#izUdal .izTl{position:relative}#izUdal .izTl.new:after{content:"";position:absolute;top:6px;left:6px;width:12px;height:12px;border-radius:50%;background:#e8433a;border:2px solid #fff}'+
 '.izHd{position:absolute;left:0;right:0;top:0;height:calc(var(--st,0px) + 58px);padding:calc(var(--st,0px) + 8px) 68px 0 10px;box-sizing:border-box;display:flex;align-items:center;gap:8px;background:linear-gradient(#5a3a1e,#3e2812);color:#fff6dc;font:800 17px/1.1 var(--f);z-index:2;box-shadow:0 3px 0 rgba(0,0,0,.25)}'+
 '.izHd img{width:36px;height:36px;flex:none}.izHd b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.izHd span{flex:none;font-weight:900;color:#ffd84a}'+
 '.izEl{position:absolute;left:0;right:0;bottom:0;top:calc(var(--st,0px) + 58px);overflow:hidden;background:var(--menuBg,#ecd9a8)}'+
 '.izIn{position:absolute;top:0;right:0;bottom:0;left:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(40,24,10,.35)}'+
 '.izIn>.panel{max-width:420px;width:100%;margin:auto}.izIn .izHint{text-align:center;font-weight:700;color:var(--ink2);margin:6px 0 2px}'+
 '.izSay{display:flex;gap:10px;align-items:flex-start;text-align:left}.izSay img{width:60px;height:60px;flex:none;border-radius:50%;background:#fffaf0;box-shadow:0 0 0 3px #fff,0 3px 6px rgba(0,0,0,.2)}'+
 '.izSay div{flex:1;min-width:0;font:600 16px/1.35 var(--f);color:var(--ink)}.izSay b{display:block;font:800 12px/1.2 var(--f);text-transform:uppercase;letter-spacing:.04em;color:var(--rib,#c9361d)}'+
 '.izCall{display:flex;align-items:center;gap:8px;text-align:left}.izCall img{width:36px;height:36px;flex:none}.izCall span{flex:1;min-width:0}'+
 '@media (max-height:700px){.mgRes .mgStars img{width:42px;height:42px}.mgRes .mgStars{margin:2px 0}.mgRes .mgScore{font-size:46px}.mgRes h3{margin-bottom:4px}}'+
 '@media (max-height:620px){.izTb{font-size:13px}.izTb li{padding:0 8px}.izTb li img{width:20px;height:20px}.izGap,.izWhy{font-size:14px;margin:2px 0}.mgRes .mgScore{font-size:44px}}';
 document.head.appendChild(s);}

/* ---------- запуск игры каталога (лениво: набор ZLK → файл игры) ---------- */
var busy=false;
function play(n,src,ex){var c=CN[n];if(!c){if(typeof dzPlay==='function')dzPlay(n,'train',{},Object.assign({src:src},ex||{}));return;}
  if(busy)return;if(!ready(c)||!open(c)){toast(open(c)?Lg('Эта игра ещё в пути — скоро будет!','This game is on its way — coming soon!'):lockTxt(c));return;}
  var go=function(){busy=false;var g=typeof mgG==='function'&&mgG(n);if(!g){toast(Lg('Игра не загрузилась — проверь связь','The game failed to load — check your connection'));return;}
    var mode=c.k==='lov'?'lov':(ex&&ex.mode)||'train';dzPlay(n,mode,(ex&&ex.ctx)||{},Object.assign({src:src||'udal'},ex||{}));};
  if(typeof mgG==='function'&&mgG(n)){go();return;}busy=true;var t=setTimeout(function(){toast(Lg('Загружаем игру…','Loading the game…'));},350);
  (c.kit||[]).reduce(function(pr,f){return pr.then(function(){return OB2.need(f);});},Promise.resolve()).then(function(){clearTimeout(t);go();},function(){clearTimeout(t);busy=false;toast(Lg('Игра не загрузилась — проверь связь','The game failed to load — check your connection'));});}

/* ---------- переходник: host избы (MG_OPEN) → host как у Зины ---------- */
var WHO={voevoda:['voevoda','Воевода Потап','Commander Potap'],yaga:['tetka','Тётушка Яга','Auntie Yaga'],mikula:['tour_nb4','Кузнец Микула','Mikula the Smith'],bayun:['kot','Кот Баюн','Bayun the Cat'],
  pahom:['tour_nb2','Дед Пахом','Grandpa Pakhom'],ratibor:['tour_nb0','Воевода Ратибор','Commander Ratibor'],marfa:['tour_nb1','Боярыня Марфа','Boyarynya Marfa'],vasilisa:['tour_nb3','Атаманша Василиса','Atamansha Vasilisa'],
  leshiy:['lesh','Леший','Leshy'],rusalka:['rusalka','Русалка','Rusalka'],karachun:['karach','Карачун','Karachun'],ivan:['hp_iva','Иван','Ivan'],kikimora:['kik','Кикимора','Kikimora'],gorynych:['gory','Змей Горыныч','Zmey Gorynych']};
function whoName(w){var x=WHO[w];return x?Lg(x[1],x[2]):'';}
function face(w){var x=WHO[w]||WHO.voevoda;return '<img src="'+ic(ART[x[0]]?x[0]:'voevoda',128)+'" alt="">';}
var SNDM={tap:'click',coin:'coin',bad:'leak',win:'win',old:'up',open:'up',letter:'click',word:'coin',bonus:'star',meow:'purr',up:'up',click:'click',star:'star',lose:'lose',boom:'boom',splash:'splash',whistle:'whistle',frog:'frog',build:'build',arrow:'arrow',cannon:'cannon'};
var ZSND={};Object.keys(SNDM).forEach(function(k){ZSND[k]=function(a){try{var f=SND[SNDM[k]];if(typeof f==='function')f(a|0);}catch(e){}};});
function kc(l){return mgPC()?'<span class="izKc">'+esc(l)+'</span>':'';}
function sayH(w,t){return '<div class="izSay">'+face(w)+'<div><b>'+esc(whoName(w))+'</b>'+t+'</div></div>';}
function adapt(G,H,o){css();var c=CN[G.num],cur=MG.cur,op=cur&&cur.opt||{},z=DZ(),q=Q();
  var hd=document.createElement('div');hd.className='izHd';hd.innerHTML='<img src="'+icon(G.num,72)+'" alt=""><b>'+esc(nm(G.num))+'</b><span></span>';
  var el=document.createElement('div');el.className='izEl';H.el.appendChild(hd);H.el.appendChild(el);var top=hd.querySelector('span');
  var loops=[],keys=[],offs=[],fin=false,adUsed=false,raf=0,last=0,dead=false;
  var paused=function(){return H.paused||!!H.root.querySelector('.mgVeil')||document.hidden;};
  function tick(t){raf=0;if(dead)return;var dt=Math.min(.05,last?(t-last)/1000:0);last=t;if(!paused())for(var i=0;i<loops.length;i++)try{loops[i](dt,t/1000);}catch(e){console.error(e);}
    if(loops.length)raf=requestAnimationFrame(tick);}
  function stop(){dead=true;loops.length=0;if(raf)cancelAnimationFrame(raf);raf=0;offs.splice(0).forEach(function(f){try{f();}catch(e){}});keys.length=0;}
  var kd=function(e){if(!MG.cur||MG.cur.host!==H)return;if(H.root.querySelector('.mgVeil'))return;
    if(e.key==='Escape'){if(!fin){e.preventDefault();MG_QUIT_ASK(H);}return;}if(paused())return;
    for(var i=0;i<keys.length;i++){try{if(keys[i](e.key,e)){e.preventDefault();return;}}catch(x){console.error(x);}}};
  window.addEventListener('keydown',kd);H.onQuit(function(){stop();window.removeEventListener('keydown',kd);});
  var plays=z.n[G.num]|0,mem=ob(q.g[G.num])?q.g[G.num]:(q.g[G.num]={});
  var o2=Object.assign({},o,{id:G.id,num:G.num,rw:[0,0,0,0],fest:typeof mgFestNow==='function'&&mgFestNow()?{id:'night',t:Lg('Ночь нечисти','Night of Monsters')}:null,
    first:!plays,plays:plays,best:z.b[G.num]|0,warm:plays<3?3:0,fast:!!op.fast});
  var host={el:el,id:G.id,num:G.num,root:H.root,dpr:Math.min(2,H.dpr),o:o2,get w(){return el.clientWidth;},get h(){return el.clientHeight;},get paused(){return paused();},
    set hold(v){H.hold=v;},snd:ZSND,pc:mgPC(),calm:o.calm,fest:o2.fest,bot:null,
    onResize:function(f){H.onResize(f);},onQuit:function(f){H.onQuit(f);},keys:function(f){keys.push(f);},kc:kc,top:function(t){top.textContent=t==null?'':String(t);},
    say:sayH,face:face,whoName:whoName,esc:esc,
    intro:function(t){t=t||{};return new Promise(function(res){if(o2.fast){res();return;}var d=document.createElement('div');d.className='izIn';
      d.innerHTML='<div class="panel">'+sayH(t.who||c&&c.who||'voevoda',esc(t.text||(c?Lg(c.a[0],c.a[1]):'')))+(t.html||'')+(t.hint?'<p class="izHint">'+t.hint+'</p>':'')+
        '<div class="btns"><button class="btn big">'+esc(t.btn||Lg('Начать','Start'))+kc('Enter')+'</button></div></div>';
      el.appendChild(d);var done=false,kf=function(k){if(k==='Enter'||k===' '){go();return true;}return false;};
      var go=function(){if(done)return;done=true;sn('click');d.remove();var j=keys.indexOf(kf);if(j>=0)keys.splice(j,1);res();};keys.unshift(kf);d.querySelector('button').onclick=go;});},
    cv:function(){var cv=document.createElement('canvas');cv.style.cssText='position:absolute;left:0;top:0;touch-action:none';el.appendChild(cv);var r={cv:cv,x:cv.getContext('2d'),w:0,h:0,dpr:host.dpr};
      var fit=function(){r.w=Math.max(1,el.clientWidth);r.h=Math.max(1,el.clientHeight);cv.width=Math.round(r.w*r.dpr);cv.height=Math.round(r.h*r.dpr);cv.style.width=r.w+'px';cv.style.height=r.h+'px';r.x.setTransform(r.dpr,0,0,r.dpr,0,0);};
      fit();H.onResize(fit);return r;},
    loop:function(f){loops.push(f);last=0;if(!raf&&!dead)raf=requestAnimationFrame(tick);},
    ptr:function(e,h){var pos=function(v){var b=e.getBoundingClientRect();return [v.clientX-b.left,v.clientY-b.top];},act=null;
      var dn=function(v){if(fin||paused())return;act=v.pointerId;try{e.setPointerCapture(v.pointerId);}catch(x){}v.preventDefault();var p=pos(v);if(h.down)h.down(p[0],p[1],v);},
        mv=function(v){if(fin||paused())return;var p=pos(v);if(h.move)h.move(p[0],p[1],v);},
        up=function(v){if(act!==v.pointerId)return;act=null;if(fin)return;var p=pos(v);if(h.up)h.up(p[0],p[1],v);};
      e.addEventListener('pointerdown',dn);e.addEventListener('pointermove',mv);e.addEventListener('pointerup',up);e.addEventListener('pointercancel',up);e.style.touchAction='none';
      offs.push(function(){e.removeEventListener('pointerdown',dn);e.removeEventListener('pointermove',mv);e.removeEventListener('pointerup',up);e.removeEventListener('pointercancel',up);});},
    mem:function(){return mem;},
    adOk:function(){return !adUsed&&H.adOk();},
    adNeed:function(kind){if(adUsed)return Promise.resolve(false);adUsed=true;return H.ad(kind||'cont').then(function(ok){if(!ok)adUsed=false;return ok;});},
    finish:function(r){if(fin)return;fin=true;stop();r=r||{};H.done({score:r.sc!=null?r.sc:r.score,tier:r.st!=null?r.st:r.tier,extra:{label:r.label,why:r.why,h:r.h|0}});},
    quit:function(){fin=true;stop();H.quit();}};
  host.done=host.finish;
  return host;}
/* регистрация игры каталога (договор п. 2) */
function reg(g){var c=g&&(CN[g.num]||CI[g.id]);if(!c||typeof g.run!=='function'){console.warn('izba: нет в каталоге',g&&(g.num||g.id));return;}
  if(typeof mgG==='function'&&mgG(c.n))return;if(g.cfg)CFG[c.n]=g.cfg;var run=g.run;
  var G={id:c.id,num:c.n,n:{ru:c.t[0],en:c.t[1]},icon:g.icon||c.ic,kind:c.k,iz:g,sim:g.sim,run:function(H,o){var host=adapt(G,H,o);run.call(g,host,host.o);}};
  MG_REG(G);}

/* ---------- награды ловкостных: 1 трофей в день за первую партию + очки дозора; «Удаль дня» — ещё Слава; медали → знамёна ---------- */
var MDB=[{id:'udal1',p:5},{id:'udal2',p:15},{id:'udal3',all:1}];
function mdPts(){var s=0,g=0,L=CAT.filter(function(c){return c.k==='lov';});L.forEach(function(c){var m=medal(c.n);s+=m;if(m===3)g++;});return {s:s,g:g,of:L.length};}
function mdClaim(out){if(typeof xbnGive!=='function')return;var P=mdPts();MDB.forEach(function(b){if(typeof xbnOwn==='function'&&xbnOwn(b.id))return;
  if(b.all?P.g>=P.of:P.s>=b.p){xbnGive(b.id);out.push({img:typeof dzBnURL==='function'?dzBnURL(b.id,96):ic('star',96),t:Lg('Новое знамя: ','New banner: ')+(typeof dzBnName==='function'?dzBnName(b.id):b.id)+(b.all?Lg(' · ты — Удалой молодец!',' · you are a Bold Fellow!'):''),big:1});}});}
function dayGame(){var L=lovs();if(!L.length)return 0;return L[mgSeed('udal',dayKey())%L.length].n;}
function weekGame(){var L=lovs();if(!L.length)return 0;return L[mgSeed('igr',String(weekNo()))%L.length].n;}
function reward(n,sc,rec,out){var q=Q(),z=DZ();if(q.p[n])return;q.p[n]=1;
  var t=mgTrf(1);if(t)out.trf=t;var xp=10+(rec?MG_RW.xpRec:0);z.x+=xp;out.xp=xp;
  if(on('udal-day')&&n===dayGame()&&!q.u){q.u=1;out.sl=mgSl(10);out.day=1;}
  out.items=out.items.concat(dzClaim());}
/* игрища недели: лучший результат недели; новая неделя — итог прошлой (место среди соседей) */
function wkRoll(){var q=Q(),w=weekNo(),W=q.w;if((W.w|0)===w){if(!W.n)W.n=weekGame();return null;}var res=null;
  if(W.w&&W.n&&W.b>0&&(W.c|0)<W.w){var pl=wkPlace(W.n,W.b,W.w);res={pl:pl,n:W.n,b:W.b};W.c=W.w;
    if(pl<=3){if(typeof xbnOwn==='function'&&!xbnOwn('igr')&&typeof xbnGive==='function'){xbnGive('igr');res.bn=1;}else{var t=mgTrf(4-pl);if(t)res.trf=t;}}ev('udal',{a:'week',pl:pl,b:W.b});try{OB2.emit('igr',{a:pl<=3?'win':'end',pl:pl});}catch(e){}}
  q.w={w:w,b:0,s:0,n:weekGame(),c:W.c|0,pl:res?res.pl:0,pn:res?res.n:0,pb:res?(res.bn?1:0):0};return res;}
function wkTable(n,b,w){var c=cf(n),bs=best(n)||c.mid;if(!c.low)bs=Math.max(bs,Math.round(c.mid*.9));
  var out=NB.map(function(x){var k=x.k*(.8+.35*rn(n+'|w'+x.i+'|'+w)),s=r1(n,c.low?bs/k:bs*k);return {i:x.i,sc:c.low?s:Math.max(1,c.max?Math.min(c.max,s):s)};});
  out.push({i:-1,sc:b||0,me:1});out.sort(function(a,b2){return better(n,a.sc,b2.sc)?-1:better(n,b2.sc,a.sc)?1:(a.me?-1:b2.me?1:0);});return out;}
function wkPlace(n,b,w){var L=wkTable(n,b,w);for(var i=0;i<L.length;i++)if(L[i].me)return i+1;return L.length;}
function wkPut(n,sc,out){if(!on('igrisha'))return;wkRoll();var q=Q();if(n===q.w.n)try{var bb=better(n,sc,q.w.b)?sc:q.w.b;OB2.emit('igr',{a:'go',pl:bb?wkPlace(n,bb,q.w.w):0});}catch(e){}if(n!==q.w.n||!better(n,sc,q.w.b))return;q.w.b=sc;out.wk=1;if((q.w.s|0)<3){q.w.s=(q.w.s|0)+1;var s=mgSl(10);if(s)out.sl=(out.sl|0)+s;}}
function on(id){return !OB2.off(id)&&!OB2.off('udal');}

/* ---------- окно итога ловкостной ---------- */
var agN=0,agId='';
function fin(g,o,r,opt){var c=MG.cur,H=c&&c.host;if(!H){MG_CLOSE();return;}H.hold=true;css();var n=g.num,ex=r.extra||{},train=o.mode==='train',calm=mgCalm();
  r.score=Math.max(0,Math.round(+r.score||0));r.tier=Math.max(0,Math.min(3,r.tier|0));
  var R=put(n,r.score),out={items:[],xp:0,sl:0};if(!train){reward(n,r.score,R.rec,out);wkPut(n,r.score,out);mdClaim(out.items);}
  if(R.medal&&!train)DZ().x+=5;dzTouch();save();
  try{STAT.ev('mg',{id:g.id,score:r.score,tier:r.tier,ad:c.ad?1:0,train:train?1:0,m:o.mode,rec:R.rec?1:0,src:c.src||'',ag:agId===g.id?agN:0});}catch(e){}
  var v=document.createElement('div');v.className='mgVeil';var low=(window.innerHeight||800)<700;
  var h='<div class="panel mgRes"><h3>'+esc(nm(n))+'</h3><div class="mgScore" id="mgSc">'+(calm?fmtNum(r.score):'0')+'</div><div class="mgSub">'+esc(ex.label||unit(n,r.score).replace(/^\S+\s/,''))+
    (!R.rec&&R.best?Lg(' · рекорд ',' · best ')+fmtNum(R.best):'')+'</div>';
  if(R.rec&&!R.first)h+='<span class="mgRec">'+Lg('Новый рекорд!','New record!')+'</span>';
  if(R.medal)h+='<span class="izMd">'+MDE[R.medal]+' '+mdName(R.medal)+Lg(' в игре «'+nm(n)+'»!',' in “'+nm(n)+'”!')+'</span>';
  if(ex.why&&!(R.rec&&!R.first))h+='<p class="izWhy">'+esc(ex.why)+'</p>';
  h+=gapHtml(n,R)+tblHtml(n,low?3:0);
  var rw=[];if(out.trf)rw.push('<span><img src="'+ic(trfIc(out.trf.id),64)+'" alt="">+'+out.trf.n+' '+trfName(out.trf.id)+'</span>');
  if(out.sl)rw.push('<span><img src="'+ic('sl_fame',64)+'" alt="">+'+out.sl+Lg(' Славы',' Fame')+'</span>');
  if(out.xp)rw.push('<span><img src="'+ic('mg_book',64)+'" alt="">+'+out.xp+Lg(' дозора',' watch')+'</span>');
  if(rw.length)h+='<div class="izRw">'+rw.join('')+'</div>';
  if(out.items.length)h+='<div class="mgRw">'+out.items.map(function(it){return '<div class="'+(it.big?'big':'')+'"><img src="'+it.img+'" alt="">'+it.t+'</div>';}).join('')+'</div>';
  if(!rw.length&&!out.items.length&&!train)h+='<p class="sub" style="text-align:center;margin:2px 0">'+Lg('Награда за сегодня уже получена — играем на рекорд!','Today’s reward is already yours — now it’s for the record!')+'</p>';
  h+='<div class="btns"><button class="btn big izAg" data-k="again">↻ '+Lg('Ещё разок','One more go')+kc('Enter')+'</button><button class="btn ghost izNo" data-k="ok">'+Lg('Хватит','Enough')+kc('Esc')+'</button></div></div>';
  v.innerHTML=h;H.root.appendChild(v);
  try{if(R.rec||r.tier>=2)SND.win();else SND.up();}catch(e){}
  if(!calm){var se=$('mgSc'),t0=performance.now(),D=Math.min(900,300+r.score*20);var st=function(now){var k=Math.min(1,(now-t0)/D);if(se)se.textContent=fmtNum(Math.round(r.score*MGK.ease.out(k)));if(k<1)requestAnimationFrame(st);};requestAnimationFrame(st);}
  var done=false,kd=function(e){if(!$('mgHost')||!v.parentNode){window.removeEventListener('keydown',kd);return;}if(e.key==='Enter'||e.key===' '){e.preventDefault();again();}else if(e.key==='Escape'){e.preventDefault();ok();}};
  window.addEventListener('keydown',kd);
  function again(){if(done)return;done=true;window.removeEventListener('keydown',kd);sn('click');agN=agId===g.id?agN+1:1;agId=g.id;ev('mg',{a:'again',id:g.id,n:agN});
    MG_CLOSE();MG_OPEN(g.id,{mode:o.mode,train:train,from:opt.from,src:opt.src,ctx:opt.ctx,fast:true,back:opt.back});}
  function ok(){if(done)return;done=true;window.removeEventListener('keydown',kd);sn('click');agN=0;MG_CLOSE();if(opt.back){opt.back();return;}
    if(opt.from==='izba'||$('dzIzba'))MG_IZBA();else{try{setPills();if(curTab==='Map'&&typeof renderQuests==='function')renderQuests();}catch(e){}}}
  v.querySelector('[data-k=again]').onclick=again;v.querySelector('[data-k=ok]').onclick=ok;}

/* ---------- починка старых 14: «Ещё разок» большой, «Готово» → «Хватит», соседи и «до Марфы — 4» ---------- */
function old(g,o,r,opt){var n=g.num|0;if(OLD.indexOf(n)<0)return;var H=MG.cur&&MG.cur.host;if(!H)return;var v=H.root.querySelector('.mgVeil .mgRes');if(!v||v.querySelector('.izTb'))return;css();
  var R=putOld(n,r.score|0,!!r.rec);dzTouch();save();
  var sb=v.querySelector('.mgStars')||v.querySelector('.mgRec')||v.querySelector('.mgSub'),low=(window.innerHeight||800)<700;
  var box=document.createElement('div');box.innerHTML=gapHtml(n,R,1)+tblHtml(n,low?3:0,r.score|0);if(sb&&sb.nextSibling)v.insertBefore(box,sb.nextSibling);else v.appendChild(box);
  if(opt.again&&r.train){var p=v.querySelector('p.sub');if(p)p.textContent=Lg('Партия на рекорд — без наград.','A game for the record — no rewards.');}
  var bs=v.querySelector('.btns');if(!bs||opt.battle)return;var a0=bs.querySelector('[data-k=again]');if(a0)a0.remove();
  var ag=document.createElement('button');ag.className='btn big izAg';ag.innerHTML='↻ '+Lg('Ещё разок','One more go')+kc('Enter');bs.insertBefore(ag,bs.firstChild);
  var okb=bs.querySelector('[data-k=ok]');if(okb){okb.className='btn ghost izNo';okb.innerHTML=Lg('Хватит','Enough')+kc('Esc');}
  var kd=function(e){if(!v.isConnected){window.removeEventListener('keydown',kd);return;}if(e.key==='Enter'){e.preventDefault();ag.click();}else if(e.key==='Escape'&&okb){e.preventDefault();okb.click();}};window.addEventListener('keydown',kd);
  ag.onclick=function(){window.removeEventListener('keydown',kd);sn('click');agN=agId===g.id?agN+1:1;agId=g.id;ev('mg',{a:'again',id:g.id,n:agN});MG_CLOSE();MG_OPEN(g.id,{train:true,again:1,from:opt.from,src:opt.src});};}

/* ---------- полка «Удаль» в избе ---------- */
function shelf(d,fresh){css();tick();var r0=on('igrisha')?wkRoll():null,L=lovs(true),q=Q(),z=DZ();if(!L.length||!on('udal')){d.remove();return;}
  if(fresh)ev('mod',{m:'udal',a:'shelf'});
  var h='<h2>'+Lg('🏅 Удаль — игры на рекорд','🏅 Daring — games for the record')+'<small>'+Lg('Соседние воеводы тоже играют. Обгони!','The neighbouring commanders play too. Beat them!')+'</small></h2>';
  var nw=news();if(nw&&on('udal-call'))h+='<div class="card izNw" data-pl="'+nw.n+'" data-src="call"><img src="'+nbFace(0)+'" alt=""><div class="t"><b>'+Lg('Ратибор побил твой рекорд!','Ratibor beat your record!')+'</b><span>«'+esc(nm(nw.n))+'»: '+fmtV(nw.n,nw.g)+'</span></div><button class="btn gold">'+Lg('Отыграться','Hit back')+'</button></div>';
  var dg=on('udal-day')?dayGame():0;if(dg){var dd=!!q.p[dg]&&q.u;h+='<div class="card izDay">'+(dd?'':'<i class="dzDot"></i>')+'<div class="dzRib">'+Lg('Удаль дня','Daring of the day')+'</div><div class="row"><img class="dzIs" src="'+icon(dg,112)+'" alt=""><div class="t"><b>'+esc(nm(dg))+'</b><span>'+
    (dd?Lg('✓ Награда получена — играй на рекорд','✓ Reward taken — play for the record'):Lg('Первая партия: трофей и Слава','First game: a trophy and Fame'))+'</span></div><button class="btn gold" data-pl="'+dg+'" data-src="day">'+Lg('Играть','Play')+'</button></div></div>';}
  if(on('igrisha')){var W=q.w,wn=W.n&&CN[W.n]&&ready(CN[W.n])&&open(CN[W.n])?W.n:0;
    if(r0||W.pl)h+='<div class="card"><b>'+Lg('Итоги игрищ прошлой недели: ','Last week’s Games: ')+(W.pl||'—')+Lg('-е место','th place')+'</b>'+(W.pb?'<span class="note">'+Lg(' · Знамя богатырских игрищ — твоё!',' · The Bogatyr Games Banner is yours!')+'</span>':'')+'</div>';
    if(wn){var pl=W.b?wkPlace(wn,W.b,W.w):0;h+='<div class="card"><div class="row"><img class="dzIs" src="'+icon(wn,112)+'" alt=""><div class="t"><b>'+Lg('Игрища недели: ','Games of the week: ')+esc(nm(wn))+'</b><span>'+
      (W.b?Lg('лучший ','best ')+fmtV(wn,W.b)+Lg(' · место ',' · place ')+pl+Lg(' из 5',' of 5'):Lg('1–3 место — знамя игрищ','places 1–3 — the Games banner'))+'</span></div><button class="btn gold" data-pl="'+wn+'" data-src="week">'+Lg('Играть','Play')+'</button></div></div>';}}
  h+='<div class="dzGrid">'+L.map(function(c){var op=open(c),b=val(c.n),m=medal(c.n);return '<div class="dzTr izTl'+(op?'':' lock')+(op&&!z.s[c.n]?' new':'')+'"'+(op?' data-pl="'+c.n+'" data-src="udal"':'')+'>'+(m?'<span class="md">'+MDE[m]+'</span>':'')+
    '<img src="'+(op?icon(c.n,112):ic('mg_lock',112))+'" alt="">'+esc(Lg(c.t[0],c.t[1]))+'<small>'+(op?(b?Lg('рекорд ','best ')+fmtV(c.n,b):Lg('новая!','new!')):lockTxt(c))+'</small></div>';}).join('')+'</div>';
  h+='<div class="btns"><button class="btn ghost" id="izBoard">'+Lg('📜 Доска рекордов и медали','📜 Record board and medals')+'</button></div>';
  d.innerHTML=h;
  Array.prototype.forEach.call(d.querySelectorAll('[data-pl]'),function(b){b.onclick=function(e){e.stopPropagation();var src=b.getAttribute('data-src');if(src==='call')ev('mg',{a:'call',id:(CN[+b.getAttribute('data-pl')]||{}).id,r:'go',w:'izba'});play(+b.getAttribute('data-pl'),src,{from:'izba'});};});
  var bb=$('izBoard');if(bb)bb.onclick=function(){sn('click');board();};}

/* ---------- Доска рекордов и медали (окно поверх избы) ---------- */
function board(){var el=$('dzIzba');if(!el)return;css();tick();ev('mod',{m:'udal',a:'board'});var L=lovs(true).filter(function(c){return open(c);}),P=mdPts(),z=DZ();
  var h='<div class="panel"><h3>'+Lg('Доска рекордов','Record board')+'</h3><p class="sub">'+Lg('Бронза, серебро и золото в каждой игре. Медали копятся — за 5 и 15 очков медалей знамёна, а золото во всех играх — знамя «Удалого молодца».','Bronze, silver and gold in every game. Medal points add up — banners at 5 and 15, and gold in every game earns the “Bold Fellow” banner.')+'</p>'+
    '<div class="card" style="text-align:center"><b>'+Lg('Медали: ','Medals: ')+P.s+'</b> · '+Lg('золото ','gold ')+P.g+' / '+P.of+'<div class="dzTrack">'+MDB.map(function(b){var own=typeof xbnOwn==='function'&&xbnOwn(b.id);
      return '<div class="dzTk'+(own?' got':' no')+'"><img src="'+(typeof dzBnURL==='function'?dzBnURL(b.id,112):ic('star',112))+'" alt="">'+(own?'✓ ':'')+(b.all?Lg('всё золото','all gold'):b.p)+'</div>';}).join('')+'</div></div>';
  if(!L.length)h+='<p class="sub">'+Lg('Здесь будут рекорды игр на ловкость — они открываются вместе с избой и за боссов.','Records of the skill games will be here — they open with the hut and for bosses.')+'</p>';
  L.forEach(function(c){var b=val(c.n),g=b?gap(c.n):null,m=medal(c.n),md=cf(c.n).md;
    h+='<div class="card"><div class="row"><img class="dzIs" src="'+icon(c.n,112)+'" alt=""><div class="t"><b>'+esc(Lg(c.t[0],c.t[1]))+(m?' '+MDE[m]:'')+'</b><span>'+
      (b?Lg('Рекорд: ','Best: ')+unit(c.n,b)+(g?Lg(' · до '+g.g+' '+fmtV(c.n,g.n),' · '+g.g+' +'+fmtV(c.n,g.n)):Lg(' · первое место!',' · first place!')):Lg('ещё не играл','not played yet'))+'</span>'+
      '<em>'+MDE[1]+' '+fmtV(c.n,md[0])+' · '+MDE[2]+' '+fmtV(c.n,md[1])+' · '+MDE[3]+' '+fmtV(c.n,md[2])+'</em></div><button class="btn gold" data-pl="'+c.n+'">'+Lg('Играть','Play')+'</button></div>'+(b?tblHtml(c.n,3):'')+'</div>';});
  h+='<div class="btns"><button class="btn big" id="izBdX">'+Lg('Закрыть','Close')+'</button></div></div>';
  var v=document.createElement('div');v.className='mgVeil';v.style.position='fixed';v.style.zIndex='29';v.innerHTML=h;el.appendChild(v);
  $('izBdX').onclick=function(){sn('click');v.remove();};
  Array.prototype.forEach.call(v.querySelectorAll('[data-pl]'),function(b){b.onclick=function(){v.remove();play(+b.getAttribute('data-pl'),'board',{from:'izba'});};});}

/* ---------- «Удаль дня» в карточке заданий (рядом с «Делом дня») ---------- */
function quest(){var box=$('dqBox');if(!box||!S.wins||!mgIzbaOpen()||$('dqUd'))return;var n=dayGame();if(!n||!open(CN[n]))return;var card=box.querySelector('.card');if(!card)return;css();var q=Q(),dd=!!(q.p[n]&&q.u);
  var r=document.createElement('div');r.className='qrow';r.id='dqUd';
  r.innerHTML='<img src="'+icon(n,72)+'" style="width:36px;height:36px;flex:none" alt=""><div class="t"><b>'+Lg('Удаль дня: ','Daring of the day: ')+esc(nm(n))+'</b><span>'+Lg('по желанию · трофей и Слава','optional · a trophy and Fame')+'</span></div>'+
    (dd?'<span class="tag ok">✓</span>':'<button class="btn gold" id="dqUdGo">'+Lg('Играть','Play')+'</button>');
  var dz=$('dqDz'),row=dz&&dz.closest?dz.closest('.qrow'):null,hd=card.querySelector('b');
  if(row&&row.parentNode===card)card.insertBefore(r,row.nextSibling);else if(hd&&hd.nextSibling)card.insertBefore(r,hd.nextSibling);else card.appendChild(r);
  var b=$('dqUdGo');if(b)b.onclick=function(){play(n,'day');};}

/* ---------- вызов соседа в окне победы (вместо «Передышки»; правила показа — mg-izba.js dzPv) ---------- */
function call(){if(!on('udal-call'))return null;tick();var nw=news();if(!nw)return null;var n=nw.n;
  return {n:n,id:(CN[n]||mgG(n)||{}).id||n,g:nw.g,img:nbFace(0),t:Lg('<b>Ратибор</b> побил твой рекорд в «'+esc(nm(n))+'»: '+fmtV(n,nw.g),'<b>Ratibor</b> beat your record in “'+esc(nm(n))+'”: '+fmtV(n,nw.g)),
    btn:Lg('Отыграться','Hit back'),go:function(){if(CN[n])play(n,'call');else{var D=dzDayState();dzPlay(n,D.n===n&&!D.played?'day':'train',{},{src:'call'});}}};}

/* «Ратибор побил твой рекорд в «…»: N. Отыграться?» — одна строка с лицом соседа; не влезло — не засчитано. STAT mg {a:'call',id,r:show|go|skip} */
function callRow(m,cl){const bx=m.querySelector('.btns.stick')||m.querySelector('.btns');if(!bx)return;
  const d=document.createElement('div');d.className='goal dzpv';d.id='dzPv';d.setAttribute('data-fit','6');
  d.innerHTML='<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;text-align:left"><img src="'+cl.img+'" style="width:36px;height:36px;flex:none" alt=""><span style="flex:1 1 150px;min-width:0">'+cl.t+'</span>'+
    '<span style="display:flex;gap:6px;margin-left:auto"><button class="btn gold" id="dzPvGo" style="flex:none;width:auto;min-width:0;padding:6px 12px;margin:0">'+cl.btn+'</button>'+
    '<button class="btn ghost" id="dzPvX" aria-label="'+Lg('Не сейчас','Not now')+'" style="flex:none;width:auto;min-width:0;padding:6px 10px;margin:0">✕</button></span></div>';
  bx.parentNode.insertBefore(d,bx);if(typeof fitModal==='function')fitModal();
  if(d.style.display==='none'||!d.offsetHeight){d.remove();return;}
  dzPvN(0);try{STAT.ev('mg',{a:'call',id:cl.id,r:'show'});}catch(e){}
  $('dzPvGo').onclick=()=>{try{STAT.ev('mg',{a:'call',id:cl.id,r:'go'});}catch(e){}hideModal();if(typeof toMenu==='function')toMenu('Map');cl.go();};
  $('dzPvX').onclick=()=>{try{SND.click();STAT.ev('mg',{a:'call',id:cl.id,r:'skip'});}catch(e){}d.remove();if(typeof fitModal==='function')fitModal();};}

/* ---------- «Богатырские игрища» в окне «Соседние заставы» ---------- */
function tourRow(){if(!on('igrisha'))return;var m=$('mBody');if(!m||$('izTour')||!$('tourOk'))return;wkRoll();var q=Q(),n=q.w.n;if(!n||!CN[n]||!ready(CN[n])||!open(CN[n]))return;css();
  var pl=q.w.b?wkPlace(n,q.w.b,q.w.w):0,d=document.createElement('div');d.className='row';d.id='izTour';d.style.cssText='margin-top:8px;padding-top:8px;border-top:2px dashed rgba(110,67,31,.25)';
  d.innerHTML='<img class="ic" src="'+icon(n,96)+'" alt=""><div class="t"><b>'+Lg('🏅 Игрища: ','🏅 Games: ')+esc(nm(n))+'</b><span>'+(q.w.b?Lg('лучший ','best ')+fmtV(n,q.w.b)+Lg(' · место ',' · place ')+pl+Lg(' из 5',' of 5'):Lg('рекорд недели — Слава в турнир','the week’s best adds Fame'))+'</span></div><button class="btn" id="izTourGo">'+Lg('Играть','Play')+'</button>';
  var lv=$('tourLive'),cd=lv&&lv.parentNode;if(cd)cd.insertBefore(d,lv);else{var bt=m.querySelector('.btns');if(bt)m.insertBefore(d,bt);else m.appendChild(d);}if(typeof fitModal==='function')fitModal();
  $('izTourGo').onclick=function(){hideModal();play(n,'week');};}
if(typeof openTour==='function'){var ot0=openTour;openTour=function(){var x=ot0.apply(this,arguments);try{tourRow();}catch(e){console.warn('iz tour',e);}return x;};}

/* ---------- Дозорная книга: раздел медалей ---------- */
if(typeof dzBook==='function'){var bk0=dzBook;dzBook=function(){var x=bk0.apply(this,arguments);try{if(!on('udal')||!lovs(true).length)return x;var v=document.querySelector('#dzIzba .mgVeil:last-child .panel'),bt=v&&v.querySelector('#dzBkX');if(!bt)return x;
  var P=mdPts(),d=document.createElement('div');d.innerHTML='<h2 style="margin:12px 4px 6px">'+Lg('Удаль: медали','Daring: medals')+'</h2><div class="card"><div class="row"><img class="ic" style="width:64px;height:64px" src="'+(typeof dzBnURL==='function'?dzBnURL('udal3',128):ic('star',128))+'" alt=""><div class="t"><b>'+
    Lg('Медалей: ','Medals: ')+P.s+'</b><span>'+Lg('золото ','gold ')+P.g+' / '+P.of+'</span><span>'+Lg('Всё золото — «Удалой молодец»','All gold — a “Bold Fellow”')+'</span></div><button class="btn" id="izBkB">'+Lg('Доска','Board')+'</button></div></div>';
  bt.parentNode.parentNode.insertBefore(d,bt.parentNode);var b=$('izBkB');if(b)b.onclick=function(){sn('click');v.parentNode.remove();board();};}catch(e){console.warn('iz book',e);}return x;};}

/* облики «Удаль» за голоса — ЗАЛОЖЕНЫ, ВЫКЛЮЧЕНЫ (решение 12.10: выпускать после починки оплат; включает LAVKA через свой каталог). Только вид, не сила. */
var SKINS_UDAL={on:false,items:[{id:'udal_stupa',n:['Ступа в росписи','Painted Mortar'],vk:0},{id:'udal_cep',n:['Златая цепь на ворота','Golden Chain for the Gate'],vk:0}]};

window.IZU={v:1,callRow:callRow,CAT:CAT,cat:CN,play:play,fin:fin,old:old,shelf:shelf,board:board,quest:quest,call:call,tick:tick,news:news,dayGame:dayGame,weekGame:weekGame,wkRoll:wkRoll,skins:SKINS_UDAL,
  _t:{Q:Q,put:put,wkPut:wkPut,wkRoll:wkRoll,table:table,gap:gap,medal:medal,mdPts:mdPts,rival:rival,ready:ready,open:open}};
IZ.reg=reg;IZ.play=play;
window.IZR={cfg:function(n,o){var c=CN[n]||CI[n];if(c)CFG[c.n]=o;},best:function(n){var c=CN[n]||CI[n];return c?best(c.n):0;},rival:function(n){var c=CN[n]||CI[n];return c?rival(c.n):0;},
  galya:function(n){var c=CN[n]||CI[n];return c?rival(c.n):0;},table:function(n){return table((CN[n]||CI[n]||{}).n);},gap:function(n){return gap((CN[n]||CI[n]||{}).n);},
  medal:function(n){return medal((CN[n]||CI[n]||{}).n);},unit:function(n,v){return unit((CN[n]||CI[n]||{}).n,v);},
  rows:function(n){var c=CN[n]||CI[n];if(!c)return [];return table(c.n).filter(function(x){return !x.me;}).map(function(x){return {i:x.i,n:nbName(x.i),f:nbFace(x.i),v:x.sc};});},
  finish:function(host,x){x=x||{};host.finish({sc:x.sc,st:x.st,label:x.label,why:x.why});},load:function(){return Promise.resolve(window.IZR);}};
try{tick();}catch(e){}
})();
