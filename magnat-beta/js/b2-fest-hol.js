/* b2-fest-hol.js — содержимое праздников «Магната» (поток FEST, грузится по требованию из b2-fest.js). Без DOM на верхнем уровне (грузится и в jsc-симуляторах).
   Праздник = окно при входе (одно за вход, prio 60) + карточка на «Сегодня» + палатка на Улице (гнездо 'street') + цепочка из 5 заданий.
   Праздничная точка (kind 'qty'): решение одно — СКОЛЬКО ЗАКУПИТЬ (мало / по прогнозу / с запасом). Товар «под реализацию»: поставщику платим за
   проданное, остаток после конца продаж уходит по уценке (30 % закупочной цены). Спрос — свой у каждого игрока (зерно S.t0), ±25 % от прогноза.
   Прибыль при «по прогнозу» ≈ месячная выручка одной средней точки игрока (В10) × B2.eco.k('fest.point_k',1) — масштаб и в «Сети», и в «Недрах».
   «Распродажа у Бориса» (kind 'pct'): выбор скидки 10/20/30 % — больше покупателей, меньше наценка (30 % — риск). «Корпоратив» (kind 'korp'):
   премия команде → недостача управляющих ×0,5 на 90 игровых дней (обёртка ECON.ownTh, поле мира W.b2.fest.kt). Подарки (kind 'gift').
   Деньги — обычным учётом: выручка recv/pl 'rev', поставщику pay 'supp'/pl 'cogs', премия — 'adm' (баланс сходится, ECON.check).
   💎 — только через договор чисел: 'fest.task' (задание), 'fest.done' (вся цепочка), 'fest.gift' (подарок). Даты — FEST.today() (по Москве; ?festday= на маке). */
(function(){'use strict';
if(typeof B2==='undefined'||!B2.fest)return;
const F=B2.fest,HAS=typeof document!=='undefined',DAY=864e5;
const sv=()=>B2.s('v');
const T=(ru,en)=>typeof L==='function'?L(ru,en):ru;
const PL=(n,a,b,c,e1,e2)=>typeof pl==='function'?pl(n,a,b,c,e1,e2):c;
const MN=x=>typeof FMT!=='undefined'?FMT.money(x):Math.round(x)+' ₽';
const NM_=x=>typeof FMT!=='undefined'?FMT.num(x):String(Math.round(x));
const E_=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const key=s=>{const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(String(s||''));return m?(+m[1])*1e4+(+m[2])*100+(+m[3]):0;};
const kms=k=>Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100);
const dd=(a,b)=>Math.round((kms(b)-kms(a))/DAY);
const FE=()=>typeof FEST!=='undefined'?FEST:null;
const today=()=>{const f=FE();return f?key(f.today()):0;};
const pre=id=>String(id).replace(/\d+$/,'');
const W_=()=>typeof GAME!=='undefined'&&GAME.W?GAME.W:null;
const eco=(k,d)=>B2.eco?B2.eco.k(k,d):d;
const cr=k=>B2.eco&&B2.eco.give?B2.eco.give(k):0;
const tick=(k,n)=>{try{if(typeof B2.flowTick==='function')B2.flowTick(k,n||1);}catch(e){}};

/* ---------- праздники Магната (ключ — id строки FEST без года: bf26/bf27 → bf) ---------- */
const WHO={beav:['Борис','Boris'],lud:['Людмила Санна','Lyudmila'],vit:['Витя','Vitya'],owl:['Соня','Sonya'],bars:['Пётр','Pyotr']};
const HOL={
  bf:{lab:['Скидки','Sale','#c62828'],who:'vit',kind:'pct',ico:'🏷️',ru:'Распродажа у Бориса',en:'Boris’s big sale',it:['покупатель','покупателя','покупателей','buyer','buyers'],p:1000,c:600,
    say:['У Бориса на витрине «−90 %*». Звёздочка мелко: «на вторую коробку спичек». Давай сделаем свою распродажу — честную. Три дня: скидка больше — покупателей больше, но с каждого меньше.',
      'Boris has “−90%*” in his window. The small print: “on the second box of matches”. Let’s run our own sale — an honest one. Three days: bigger discount, more buyers, less from each.'],
    o:[{v:10,m:.75,s:.1,ru:'Осторожно',en:'Careful'},{v:20,m:1,s:.15,ru:'Как у людей',en:'Normal'},{v:30,m:.95,s:.45,ru:'Толпа у дверей',en:'Crowd at the door'}]},
  mam:{who:'lud',kind:'gift',ico:'💐',ru:'Букет для мамы',en:'Flowers for mum',
    say:['День матери. Дела делами, а маме — букет и звонок. Я уже нашла цветочный рядом с её домом.','Mother’s Day. Business can wait — flowers and a call for mum. I’ve found a flower shop near her place.'],
    btn:['💐 Отправить маме букет','💐 Send mum flowers'],done:['Мама звонила: «Сынок, ну зачем тратился!» — и полчаса рассказывала соседкам.','Mum called: “Why did you spend so much!” — then told the neighbours for half an hour.']},
  ny:{lab:['Ёлки','Trees','#2e7d32'],who:'lud',help:'vit',kind:'qty',ico:'🎄',ru:'Ёлочный базар',en:'Christmas tree market',it:['ёлка','ёлки','ёлок','tree','trees'],p:2200,c:1000,to:'12-31',
    say:['Новый год! Открываем ёлочный базар: Витя подвезёт ёлки из питомника. Продаём до 31 декабря — после ёлки никому не нужны, остаток уйдёт за бесценок. Сколько завозим?',
      'New Year! Let’s open a Christmas tree market: Vitya will bring trees from the nursery. We sell until 31 December — after that nobody needs a tree, leftovers go for pennies. How many do we bring?']},
  kan:{who:'owl',kind:'korp',ico:'🥂',ru:'Корпоратив',en:'Office party',
    say:['Каникулы — пора корпоратива. Можно скромно, чай с тортом. А можно выдать команде премию: довольные управляющие меньше «ошибаются» в кассе — целый квартал.',
      'Holidays — time for the office party. Modest: tea and cake. Or pay the team a bonus: happy managers make fewer “mistakes” at the till — for a whole quarter.']},
  sng:{who:'beav',kind:'gift',ico:'🎁',ru:'Старый Новый год',en:'Old New Year',
    say:['Старый Новый год! Борис пришёл мириться — с мандаринами. Говорит, ёлки у него тоже остались.','Old New Year! Boris came to make peace — with tangerines. Says he has leftover trees too.'],
    btn:['🍊 Взять мандарины','🍊 Take the tangerines'],done:['Борис: «Только в следующем году ёлки не вози, договорились?» Не договорились.','Boris: “Don’t sell trees next year, deal?” No deal.']},
  stu:{lab:['Кофе','Coffee','#6d4c41'],who:'owl',kind:'qty',ico:'☕',ru:'Кофейня у института',en:'Coffee by the campus',it:['стакан','стакана','стаканов','cup','cups'],p:180,c:60,
    say:['День студента! Сессия, все не спят. Поставим кофейную стойку у входа в институт на три дня? Сколько стаканчиков закупаем?','Students’ Day! Exams, nobody sleeps. A coffee stand at the campus entrance for three days? How many cups do we stock?']},
  lub:{lab:['Цветы','Flowers','#d81b60'],who:'vit',kind:'qty',ico:'🌹',ru:'Конфеты и цветы',en:'Sweets and flowers',it:['букет','букета','букетов','bouquet','bouquets'],p:900,c:400,
    say:['14 февраля! Возьмём палатку у метро: букеты и конфеты. Три дня. Главное — не перебрать: 15-го цветы никому не нужны.','Valentine’s Day! Let’s rent a stall by the metro: bouquets and sweets. Three days. Don’t overstock — nobody wants flowers on the 15th.']},
  bog:{lab:['Сервис','Service','#1f5f99'],who:'bars',kind:'qty',ico:'🔩',ru:'Гаражный сервис',en:'Garage service',it:['машина','машины','машин','car','cars'],p:1500,c:650,
    say:['День мужчин двора! Мужики у гаражей: кому масло, кому мойка. Борис уверен, что его сервис лучше. Покажем ему? Сколько записей берём на три дня?','Yard Men’s Day! Guys at the garages: oil change, car wash. Boris swears his service is better. Shall we show him? How many bookings for three days?']},
  mar:{lab:['Мимоза','Mimosa','#f9a825'],who:'vit',kind:'qty',ico:'🌼',ru:'Мимоза у метро',en:'Mimosa by the metro',it:['букет мимозы','букета мимозы','букетов мимозы','mimosa bunch','mimosa bunches'],p:350,c:140,
    say:['8 Марта! Мимоза у метро — классика. Я договорился с оптовиком. Сколько берём? Девятого она уже никому не нужна.','8 March! Mimosa by the metro — a classic. I’ve got a wholesaler. How much do we take? On the 9th nobody wants it.']},
  mas:{lab:['Блины','Pancakes','#ef6c00'],who:'beav',kind:'qty',ico:'🥞',ru:'Блинная',en:'Pancake stand',it:['блин','блина','блинов','pancake','pancakes'],p:90,c:30,
    say:['Масленица! Борис печёт блины в своей шаурмичной. А мы чем хуже? Неделя блинов — сколько теста заводим?','Pancake week! Boris is frying pancakes in his shawarma place. Are we worse? A week of pancakes — how much batter?']},
  trg:{who:'lud',kind:'gift',ico:'🛒',ru:'Передовик торговли',en:'Trade champion',
    say:['День торговли! Профсоюз двора вручает грамоты. Вас записали в передовики.','Trade Day! The yard union hands out certificates. You’re on the list of champions.'],
    btn:['🏅 Получить грамоту','🏅 Get the certificate'],done:['Грамота висит в кабинете. Борис сказал, что у него таких три. Врёт.','The certificate hangs in the office. Boris says he has three. He’s lying.']}
};
const ORD=['ny','bf','kan','mar','lub','stu','bog','mas','mam','sng','trg'];
const holOf=id=>HOL[pre(id)]||null;
function live(){const f=FE();if(!f)return [];return f.list().map(r=>r.id).filter(id=>holOf(id)).sort((a,b)=>ORD.indexOf(pre(a))-ORD.indexOf(pre(b)));}
function name(id){const h=holOf(id);return h?T(h.ru,h.en):'';}
function fname(id){const f=FE();return f?f.name(id):'';}
function left(id){const f=FE();return f?f.left(id):0;}

/* ---------- числа точки ---------- */
// месячная выручка одной средней точки: выручка последнего закрытого месяца / число работающих точек и объектов
function base(W){if(!W)return 15e3;const r=W.reps&&W.reps.length?W.reps[W.reps.length-1]:null,rev=r&&r.pl?+r.pl.rev||0:0;
  let n=0;if(Array.isArray(W.biz))n+=W.biz.filter(b=>b&&b.st==='w'&&!b.at).length;if(Array.isArray(W.obj))n+=W.obj.filter(o=>o&&o.st==='w').length;
  // не больше 10 % выручки месяца (одно большое дело в «Недрах»), не меньше 0,1 % денег (новый холдинг после IPO — выручки ещё нет)
  return Math.round(Math.max(15e3,1e-3*Math.max(0,+W.cash||0),Math.min(rev/Math.max(1,n),Math.max(15e3,.1*rev))));}
function rnd(id){let h=2166136261;const s=id+':'+((typeof S!=='undefined'&&S&&S.t0)||1);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  h>>>=0;h=Math.imul(h^(h>>>15),h|1);h^=h+Math.imul(h^(h>>>7),h|61);return ((h^(h>>>14))>>>0)/4294967296;}
const nice=x=>{if(x<10)return Math.max(1,Math.round(x));const p=Math.pow(10,Math.floor(Math.log10(x))-1);return Math.round(x/p)*p;};
// окно продаж: [from, to] — для ёлок до 31.12, остальные — весь праздник
function win(id){const f=FE(),r=f&&f.get(id);if(!r)return null;const h=holOf(id),a=key(r.from);let b=key(r.to);if(h&&h.to)b=Math.min(b,Math.floor(a/1e4)*1e4+(+h.to.slice(0,2))*100+(+h.to.slice(3)));return [a,b];}
function frac(id){const w=win(id);if(!w)return 0;const t=Math.max(w[0],today());return Math.max(0,Math.min(1,(dd(t,w[1])+1)/(dd(w[0],w[1])+1)));}
function plan(id,W){const h=holOf(id);if(!h)return null;const fr=frac(id),Tg=base(W)*eco('fest.point_k',1)*fr;
  if(h.kind==='pct')return {T:Tg,o:h.o.map((o,i)=>{const p=Math.round(h.p*(1-o.v/100)),mg=p-h.c;return {i,v:o.v,p,c:h.c,n:nice(Tg*o.m/mg),ru:o.ru,en:o.en};})};
  const s=Math.round(h.c*.3),Db=Tg/(.9375*h.p-h.c+.0625*s);
  return {T:Tg,Db:nice(Db),s,o:[.6,1,1.4].map((k,i)=>({i,q:nice(Db*k),ru:[T('Мало','A few'),T('По прогнозу','As forecast'),T('С запасом','Extra')][i]}))};}
function buy(id,i){const s=sv(),h=holOf(id),W=W_();if(!h||!W||(s.p&&!s.p.z)||(s.r&&s.r[id]))return false;const P=plan(id,W),o=P&&P.o[i],w=win(id);if(!o||!w||today()>w[1])return false;
  const x=rnd(id);let p;
  if(h.kind==='pct'){const hv=h.o[i];const D=Math.max(1,Math.round(o.n*(1-hv.s+2*hv.s*x)));p={h:id,o:i,q:D,D,p:o.p,c:o.c,s:0,a:Math.max(w[0],today()),b:w[1],sc:0,pf:0};}
  else{const D=Math.max(1,Math.round(P.Db*(.75+.5*x)));p={h:id,o:i,q:o.q,D,p:h.p,c:h.c,s:P.s,a:Math.max(w[0],today()),b:w[1],sc:0,pf:0};}
  s.p=p;mark(id);use(id,'stall');tick('fopen');B2.ev('fest','buy',{h:id,o:i});persist();B2.emit('fest',{a:'stall',h:id});return true;}
function sold(p){if(!p)return 0;if(p.z)return p.sc;const t=today(),tot=dd(p.a,p.b)+1,el=Math.max(0,Math.min(tot,dd(p.a,t)+1));return Math.max(p.sc,Math.min(p.q,Math.floor(p.D*el/tot)));}
function due(p){return p&&!p.z?(sold(p)-p.sc)*(p.p-p.c):0;}
function ended(p){return !!p&&!p.z&&today()>p.b;}
// забрать выручку (и закрыть точку, если продажи кончились): деньги — обычным учётом
function collect(quiet){const s=sv(),p=s.p,W=W_();if(!p||p.z||!W||typeof ECON==='undefined'||!ECON._)return 0;const E=ECON._,t0=ECON.ts?ECON.ts('ev'):null;let g=0,n=sold(p)-p.sc;
  try{if(n>0){const r=n*p.p,c=n*p.c;E.recv(W,r,'sales');E.pl(W,'rev',r);E.pay(W,c,'supp');E.pl(W,'cogs',c);p.sc+=n;g+=r-c;}
    if(today()>p.b){const lf=p.q-p.sc;if(lf>0){const r=lf*p.s,c=lf*p.c;if(r){E.recv(W,r,'sales');E.pl(W,'rev',r);}E.pay(W,c,'supp');E.pl(W,'cogs',c);g+=r-c;p.lf=lf;}
      p.z=1;(s.r=s.r||{})[p.h]=[p.q,Math.min(p.q,p.D),Math.round((p.pf||0)+g)];}}
  finally{if(ECON.ts)ECON.ts(t0);}
  p.pf=Math.round((p.pf||0)+g);if(n>0)tick('fcash');if(today()===p.b&&n>0){setT(p.h,5);tick('flast');}if(g||p.z){use(p.h,'cash');B2.ev('fest','cash',{h:p.h,g:Math.round(g/1e3),z:p.z?1:0});}
  persist();if(!quiet&&g&&HAS){try{UI.fly(null,g);}catch(e){}}B2.emit('fest',{a:'stall',h:p.h});return g;}

/* ---------- задания (цепочка из 5; у подарков и корпоратива — одно) ---------- */
const TK={
  qty:[['Открыть точку: закупить товар','Open the stall: buy stock'],['Забрать первую выручку','Collect the first takings'],['Продать половину товара','Sell half the stock'],
    ['Заглянуть в два разных дня праздника','Drop in on two different days'],['Забрать выручку в последний день продаж','Collect on the last sales day']],
  pct:[['Выбрать скидку','Pick the discount'],['Забрать первую выручку','Collect the first takings'],['Обслужить половину покупателей','Serve half the buyers'],
    ['Заглянуть в два разных дня праздника','Drop in on two different days'],['Забрать выручку в последний день продаж','Collect on the last sales day']]};
function tst(id){const s=sv();s.t=s.t||{};return s.t[id]||(s.t[id]={o:0,g:0});}
function setT(id,i){const t=tst(id),b=1<<(i-1);if(!(t.o&b)){t.o|=b;B2.emit('fest',{a:'task',h:id,i});}}
function sync(id){const h=holOf(id);if(!h)return;const s=sv(),p=s.p&&s.p.h===id?s.p:null,t=today();
  if(h.kind==='qty'||h.kind==='pct'){if(p){setT(id,1);if(p.pf>0||p.sc>0)setT(id,2);if(p.sc*2>=p.q)setT(id,3);}
    const v=(s.v=s.v||{})[id]||[0,0];if(F.on(id)&&v[0]!==t){v[0]=t;v[1]++;s.v[id]=v;}if(v[1]>=2)setT(id,4);}
  else if(s.x&&s.x[id])setT(id,1);}
function tasks(){const out=[];for(const id of live()){const h=holOf(id);sync(id);const tt=TK[h.kind]||[[h.btn?h.btn[0]:'Решить',h.btn?h.btn[1]:'Decide']],t=tst(id);
  tt.forEach((x,j)=>out.push({id:id+'.'+(j+1),h:id,i:j+1,n:tt.length,who:h.who,ico:h.ico,ru:x[0],en:x[1],ok:!!(t.o&(1<<j)),got:!!(t.g&(1<<j))}));}return out;}
function claim(tid){const m=/^([a-z]+\d\d)\.(\d)$/.exec(String(tid));if(!m)return 0;const id=m[1],i=+m[2],h=holOf(id);if(!h)return 0;sync(id);const t=tst(id),b=1<<(i-1);
  if(!(t.o&b)||(t.g&b))return 0;t.g|=b;let n=cr('fest.task');const all=(TK[h.kind]||[0]).length,full=(1<<all)-1;
  if((t.g&full)===full){n+=cr(h.kind==='gift'||h.kind==='korp'?'fest.gift':'fest.done');const f=FE();if(f)f.give(id,'main');B2.ev('fest','chain',{h:id});
    if(HAS)tst2(T('🎉 Праздник пройден: значок «'+name(id)+'» — навсегда','🎉 Holiday done: “'+name(id)+'” badge — forever')+(n?' · +'+n+' 💎':''));}
  else if(HAS&&n)tst2('+'+n+' 💎');persist();B2.emit('fest',{a:'task',h:id,i});return n||1;}
function F_(id){return !!FE()&&FE().on(id);}
F.on=F_;

/* ---------- корпоратив и подарки ---------- */
function korp(id,i){const s=sv(),W=W_();if(!W||(s.x&&s.x[id]))return false;const P=base(W)*eco('fest.point_k',1),a=Math.round(P*(i?.4:.05)/1e3)*1e3||1e3;
  const E=ECON._,t0=ECON.ts?ECON.ts('ev'):null;try{E.pay(W,a,'adm');E.pl(W,'adm',a);}finally{if(ECON.ts)ECON.ts(t0);}
  if(i){const o=B2.w(W,'fest');o.kt=(W.t|0)+90;}(s.x=s.x||{})[id]=i?2:1;setT(id,1);use(id,'korp');B2.ev('fest','korp',{h:id,o:i});persist();return true;}
function gift(id){const s=sv();if(s.x&&s.x[id])return false;(s.x=s.x||{})[id]=1;setT(id,1);use(id,'gift');persist();return true;}
// премия команде: недостача управляющих ×0,5 до W.b2.fest.kt (90 игровых дней)
if(typeof ECON!=='undefined'&&typeof ECON.ownTh==='function'&&!ECON.ownTh.b2f){const o0=ECON.ownTh;
  ECON.ownTh=function(W,b){const x=o0(W,b),f=W&&W.b2&&W.b2.fest;return f&&f.kt>(W.t|0)&&!B2.off('fest')?x*eco('fest.korp_th',.5):x;};ECON.ownTh.b2f=1;}
B2.mig('fest',(W,o)=>{if(o.kt!=null&&!(o.kt>0))delete o.kt;});

/* ---------- служебное ---------- */
function persist(){try{if(typeof save==='function')save();}catch(e){}try{if(typeof GAME!=='undefined'&&GAME.emit)GAME.emit('change');}catch(e){}}
function use(id,k){const f=FE();if(f)try{f.use(id,k);}catch(e){}}
function mark(id){(sv().w=sv().w||{})[id]=1;}
function tst2(t){try{toast(t);}catch(e){}}
function face(who){try{return typeof friendSvg==='function'?friendSvg(who,'happy'):'';}catch(e){return '';}}
function css(){if(!HAS||document.getElementById('b2fCss'))return;const st=document.createElement('style');st.id='b2fCss';st.textContent=
  '.b2f-hero{display:flex;align-items:flex-start;margin:4px 0 12px}.b2f-hero .b2f-av{flex:0 0 56px;width:56px;height:56px;margin-right:12px}.b2f-hero .b2f-av svg{width:56px;height:56px}'+
  '.b2f-say{flex:1;font-size:17px;line-height:1.4}.b2f-say b{display:block;font-size:15px;color:var(--muted)}'+
  '.b2f-o{display:block;width:100%;text-align:left;min-height:56px;margin:0 0 8px;padding:10px 14px}.b2f-o b{font-size:18px}.b2f-o small{display:block;font-size:15px;color:var(--muted);margin-top:2px}'+
  '.b2f-o.rec{border:2px solid var(--good)}.b2f-bar{height:12px;border-radius:6px;background:var(--line);overflow:hidden;margin:8px 0}.b2f-bar i{display:block;height:100%;background:var(--good)}'+
  '.b2f-box{border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:0 0 12px;font-size:17px}.b2f-box p{margin:4px 0}'+
  '.b2f-tk{display:flex;align-items:center;min-height:48px;border-top:1px solid var(--line);font-size:16px}.b2f-tk:first-child{border-top:0}.b2f-tk span{flex:1}.b2f-tk i{font-style:normal;width:28px}'+
  '.b2f-tk .btn{min-height:44px;padding:6px 12px;margin:0}.b2f-st{display:block;width:100%;text-align:left;min-height:56px;padding:8px 12px}.b2f-st small{display:block;color:var(--muted)}'+
  '.b2f-yr{font-size:17px;line-height:1.5}.b2f-yr li{margin:4px 0}';
  document.head.appendChild(st);}

/* ---------- вид ---------- */
function stallTxt(p){const h=holOf(p.h);if(!h)return '';const n=sold(p),it=h.it;
  return NM_(n)+' '+T('из','of')+' '+NM_(p.q)+' '+PL(p.q,it[0],it[1],it[2],it[3],it[4]);}
function today_(){const ids=live();if(!ids.length&&!(sv().p&&ended(sv().p)))return '';css();let h='';
  const p=sv().p;if(p&&ended(p)&&!ids.includes(p.h))return card(p.h,T('Праздник кончился — забрать итог','Holiday over — collect the result'));
  for(const id of ids.slice(0,2)){const x=holOf(id),q=p&&p.h===id&&!p.z?p:null,l=left(id);let sub=(fname(id)!==name(id)?fname(id)+' · ':'')+(l<=1?T('последний день','last day'):T('ещё ','')+l+' '+PL(l,'день','дня','дней','day left','days left'));
    if(q){const g=due(q);sub+=' · '+stallTxt(q)+(g>0?' · '+T('к сбору ','to collect ')+MN(g):'');}
    else if((x.kind==='qty'||x.kind==='pct')&&!(sv().r&&sv().r[id]))sub+=' · '+T('решите, сколько закупить','decide how much to stock');
    if(!F.flow){const tk=tasks().filter(t=>t.h===id);if(tk.length>1)sub+=' · '+T('задания ','tasks ')+tk.filter(t=>t.got).length+'/'+tk.length;}
    h+=card(id,sub);}
  return h;}
function card(id,sub){const x=holOf(id);return '<button class="card tap bz-li b2f-card noenter" data-b2="fest:open:'+id+'" style="padding:14px 18px"><span class="bz-ic">'+x.ico+'</span><span class="f1"><b>'+E_(name(id))+
  '</b><small>'+E_(sub)+'</small></span><span class="chev">›</span></button>';}
function street(){const s=sv(),p=s.p&&!s.p.z?s.p:null,id=p?p.h:live().find(i=>{const k=holOf(i).kind;return (k==='qty'||k==='pct')&&!(s.r&&s.r[i]);});if(!id)return '';css();
  const x=holOf(id),g=p?due(p):0;return '<button class="btn b2f-st noenter" data-b2="fest:open:'+id+'"><b>'+x.ico+' '+E_(name(id))+'</b><small>'+
    (p?stallTxt(p)+(g>0?' · +'+MN(g):''):T('палатка ждёт товара','the stall needs stock'))+'</small></button>';}
function stall(){const s=sv(),p=s.p&&!s.p.z?s.p:null;const id=p?p.h:null;if(!id)return null;const x=holOf(id);return {h:id,ico:x.ico,ru:x.ru,en:x.en,n:sold(p),q:p.q,cash:due(p),end:ended(p)};}
function hero(id,txt){const x=holOf(id),w=WHO[x.who]||['',''];return '<div class="b2f-hero"><span class="b2f-av">'+face(x.who)+'</span><span class="b2f-say"><b>'+E_(T(w[0],w[1]))+'</b>'+E_(txt)+'</span></div>';}
function open(id){if(!HAS||typeof modal!=='function')return false;id=id||live()[0]||(sv().p&&sv().p.h);const x=holOf(id);if(!x)return false;css();sync(id);mark(id);
  const s=sv(),W=W_(),p=s.p&&s.p.h===id?s.p:null,res=s.r&&s.r[id];
  if(p&&!p.z){const t=today();if(t!==p.a)tick('fday');if(t===p.b)tick('flast');}let h='<h2>'+x.ico+' '+E_(name(id))+'</h2>',l=left(id);
  if(l)h+='<p style="margin:0 0 8px;color:var(--muted)">'+(fname(id)!==name(id)?E_(fname(id))+' · ':'')+(l<=1?T('последний день','last day'):T('ещё ','')+l+' '+PL(l,'день','дня','дней','day left','days left'))+'</p>';
  const busy=(x.kind==='qty'||x.kind==='pct')&&(p||res);
  h+=hero(id,busy?(res?T('Праздник закрыли. Записала итог в тетрадку.','The holiday is closed. I’ve written the result down.'):ended(p)?T('Продажи кончились. Закрываем точку: остаток — по уценке, остальное — в кассу.','Sales are over. Closing the stall: leftovers go cheap, the rest to the till.'):T('Торговля идёт! Заходите забирать выручку — особенно в последний день продаж.','Trading is on! Drop in to collect — especially on the last sales day.')):T(x.say[0],x.say[1]));
  if(x.kind==='qty'||x.kind==='pct'){
    if(res){const pr=res[2];h+='<div class="b2f-box"><p><b>'+T('Итог','Result')+':</b> '+T('продано ','sold ')+NM_(res[1])+' '+T('из ','of ')+NM_(res[0])+'.</p><p>'+T('Прибыль ','Profit ')+'<b>'+MN(pr)+'</b>'+
      (res[0]>res[1]&&x.kind==='qty'?' · '+T('остаток ','leftover ')+NM_(res[0]-res[1])+T(' ушёл по уценке',' sold off cheap'):'')+'</p></div>';}
    else if(!p){const P=plan(id,W);if(s.p&&!s.p.z){h+='<div class="b2f-box"><p>'+T('Сначала закройте прошлую точку: ','Close the previous stall first: ')+E_(name(s.p.h))+'.</p></div>';}
      else if(P&&x.kind==='qty'){const it=x.it;h+='<p style="font-size:17px">'+E_(T('Прогноз спроса: ≈ ','Demand forecast: ≈ ')+NM_(P.Db)+' '+PL(P.Db,it[0],it[1],it[2],it[3],it[4])+T(' (может быть на четверть больше или меньше). Товар под реализацию: платим поставщику за проданное, остаток в конце — по уценке.',' (could be a quarter more or less). Stock on consignment: we pay for what sells, leftovers go cheap at the end.'))+'</p>';
        for(const o of P.o)h+='<button class="btn b2f-o noenter'+(o.i===1?' rec':'')+'" data-b2="fest:buy:'+id+':'+o.i+'"><b>'+NM_(o.q)+' '+E_(PL(o.q,it[0],it[1],it[2],it[3],it[4]))+'</b><small>'+E_(o.ru)+' · '+T('закупка ','cost ')+MN(o.q*x.c)+' · '+T('продаём по ','price ')+MN(x.p)+'</small></button>';}
      else if(P){h+='<p style="font-size:17px">'+T('Средний чек ','Average ticket ')+MN(x.p)+T(', закупка ',', cost ')+MN(x.c)+'.</p>';
        for(const o of P.o)h+='<button class="btn b2f-o noenter'+(o.i===1?' rec':'')+'" data-b2="fest:buy:'+id+':'+o.i+'"><b>−'+o.v+' % · '+E_(T(o.ru,o.en))+'</b><small>'+T('≈ ','≈ ')+NM_(o.n)+' '+E_(PL(o.n,'покупатель','покупателя','покупателей','buyer','buyers'))+' · '+T('с каждого ','per buyer ')+MN(o.p-o.c)+'</small></button>';}}
    else{const n=sold(p),g=due(p),it=x.it,pc=Math.round(100*n/Math.max(1,p.q));
      h+='<div class="b2f-box"><p><b>'+T('Продано ','Sold ')+NM_(n)+' '+T('из ','of ')+NM_(p.q)+'</b> '+E_(PL(p.q,it[0],it[1],it[2],it[3],it[4]))+'</p><div class="b2f-bar"><i style="width:'+pc+'%"></i></div>'+
        '<p>'+T('Уже забрали: ','Collected: ')+MN(p.pf||0)+'</p>'+(ended(p)?'<p>'+T('Продажи кончились — остаток уйдёт по уценке.','Sales are over — leftovers go cheap.')+'</p>':'<p>'+T('Продаём до ','Selling until ')+String(p.b%100)+'.'+String(Math.floor(p.b/100)%100).padStart(2,'0')+'</p>')+'</div>';
      if(g>0||ended(p))h+='<button class="btn green w noenter" data-b2="fest:cash:'+id+'" style="min-height:56px;margin-bottom:12px">💰 '+(ended(p)?T('Закрыть точку и забрать итог','Close the stall and collect'):T('Забрать выручку +','Collect +')+MN(g))+'</button>';}
  }else if(x.kind==='korp'){if(s.x&&s.x[id])h+='<div class="b2f-box"><p>'+(s.x[id]===2?T('Премия выдана. Управляющие довольны — квартал без «ошибок» в кассе (недостача вдвое меньше).','Bonus paid. Managers are happy — a quarter with half the till “mistakes”.'):T('Чай с тортом удался. Соня испекла «Наполеон».','Tea and cake went well. Sonya baked a Napoleon.'))+'</p></div>';
    else{const P=base(W)*eco('fest.point_k',1),a0=Math.round(P*.05/1e3)*1e3||1e3,a1=Math.round(P*.4/1e3)*1e3||1e3,nm=W&&Array.isArray(W.biz)?W.biz.filter(b=>b&&b.mgr).length:0;
      h+='<button class="btn b2f-o noenter" data-b2="fest:korp:'+id+':0"><b>🍰 '+T('Чай с тортом','Tea and cake')+' · '+MN(a0)+'</b><small>'+T('скромно и по-домашнему','modest and cosy')+'</small></button>'+
        '<button class="btn b2f-o noenter rec" data-b2="fest:korp:'+id+':1"><b>💰 '+T('Премия команде','Team bonus')+' · '+MN(a1)+'</b><small>'+(nm?T('управляющих: ','managers: ')+nm+T(' — недостача вдвое меньше 3 месяца',' — half the shortage for 3 months'):T('управляющих пока нет — премия просто порадует','no managers yet — just a nice gesture'))+'</small></button>';}}
  else if(x.kind==='gift'){if(s.x&&s.x[id])h+='<div class="b2f-box"><p>'+E_(T(x.done[0],x.done[1]))+'</p></div>';else h+='<button class="btn green w noenter" data-b2="fest:gift:'+id+'" style="min-height:56px;margin-bottom:12px">'+E_(T(x.btn[0],x.btn[1]))+'</button>';}
  if(F.flow&&(x.kind==='qty'||x.kind==='pct'))h+='<p style="color:var(--muted)">📋 '+T('Праздничные задания — в «Потоке заданий» на «Сегодня»','Holiday tasks are in the task flow on “Today”')+'</p>';
  if(!F.flow||(x.kind!=='qty'&&x.kind!=='pct')){const tk=tasks().filter(t=>t.h===id);if(tk.length){h+='<div class="b2f-box"><p><b>'+T('Праздничные задания','Holiday tasks')+'</b>'+(tk.length>1?' · '+T('за все — значок навсегда','all done — a badge forever'):'')+'</p>';
    for(const t of tk)h+='<div class="b2f-tk"><i>'+(t.got?'✅':t.ok?'🎁':'▫️')+'</i><span>'+E_(T(t.ru,t.en))+'</span>'+(t.ok&&!t.got?'<button class="btn green noenter" data-b2="fest:claim:'+t.id+'">'+T('Забрать','Claim')+'</button>':'')+'</div>';h+='</div>';}}
  const f=FE();if(f&&f.got(id,'main'))h+='<p style="color:var(--good)">🏅 '+T('Значок праздника — у вас навсегда','Holiday badge — yours forever')+'</p>';
  h+='<div class="row"><button class="btn noenter" data-b2="fest:close" data-esc>'+T('Закрыть','Close')+'</button></div>';
  modal(h);persist();return true;}
// «Итоги года» — 30.12…10.01, раз в год
function yrKey(){const t=today(),m=Math.floor(t/100)%100,d=t%100;if(m===12&&d>=30)return 'itg'+Math.floor(t/1e4);if(m===1&&d<=10)return 'itg'+(Math.floor(t/1e4)-1);return '';}
function yrOpen(k){const W=W_();if(!W||!HAS)return false;css();(sv().w=sv().w||{})[k]=1;const y=k.slice(3),s=sv(),r=s.r||{};let el=0,pr=0;for(const id in r){if(/^ny/.test(id)&&String(2000+ +id.slice(2)-1)===y)el+=r[id][1];if(String(2000+ +id.slice(-2))===y||(/^ny/.test(id)&&String(2000+ +id.slice(2)-1)===y))pr+=r[id][2];}
  const pts=Array.isArray(W.biz)?W.biz.filter(b=>b&&b.st==='w'&&!b.at):[],sh=pts.filter(b=>b.t==='shaw').length,v=typeof GAME!=='undefined'&&GAME.value?GAME.value():0,env=3+pts.length*7+el%11;
  const li=[];li.push(T('Точек и дел работает: ','Outlets and businesses running: ')+'<b>'+NM_(pts.length+(Array.isArray(W.obj)?W.obj.filter(o=>o&&o.st==='w').length:0))+'</b>');
  if(sh)li.push(T('Шаурмичных: ','Shawarma places: ')+'<b>'+sh+'</b> · '+T('шаурмы продано — «много, Людмила устала считать»','shawarma sold — “a lot, Lyudmila gave up counting”'));
  if(el)li.push(T('Ёлок продано на базаре: ','Trees sold at the market: ')+'<b>'+NM_(el)+'</b>');if(pr)li.push(T('Праздничные точки принесли: ','Holiday stalls brought in: ')+'<b>'+MN(pr)+'</b>');
  li.push(T('Стоимость компании: ','Company value: ')+'<b>'+MN(v)+'</b>');li.push(T('Борис завидовал: ','Boris got jealous: ')+'<b>'+env+'</b> '+T('раз (мы считали)','times (we counted)'));
  modal('<h2>🎆 '+T('Итоги года','Year in review')+' '+y+'</h2><div class="b2f-hero"><span class="b2f-av">'+face('lud')+'</span><span class="b2f-say"><b>'+T('Людмила Санна','Lyudmila')+'</b>'+
    T('Подвела итоги года. Шуточный отчёт, но цифры честные.','I’ve summed up the year. A joke report, but the numbers are honest.')+'</span></div><ul class="b2f-yr">'+li.map(x=>'<li>'+x+'</li>').join('')+
    '</ul><p>'+T('С наступающим! Пусть следующий год будет прибыльнее.','Happy New Year! May the next one be more profitable.')+'</p><div class="row"><button class="btn green noenter" data-b2="fest:close" data-esc>'+T('С Новым годом! 🎄','Happy New Year! 🎄')+'</button></div>');
  B2.ev('fest','year',{y:+y});persist();return true;}

/* ---------- окно при входе: праздник начался (раз на праздник), закрыть прошедшую точку, итоги года ---------- */
function early(){return HAS&&document.body&&document.body.classList.contains('early1');}
function winPick(){const s=sv(),w=s.w||{};if(!W_()||early())return null;if(s.p&&ended(s.p))return {k:'end'};const y=yrKey();if(y&&!w[y]&&W_().reps&&W_().reps.length)return {k:'yr',y};
  const id=live().find(i=>!w[i]);return id?{k:'h',id}:null;}
function winOk(){return !!winPick();}
function winShow(){const x=winPick();if(!x)return;if(x.k==='end'){const id=sv().p.h,g=collect(true);open(id);if(g)tst2(T('Точка «','Stall “')+name(id)+T('» закрыта: ','” closed: ')+(g>=0?'+':'')+MN(g));}
  else if(x.k==='yr')yrOpen(x.y);else{open(x.id);B2.ev('fest','win',{h:x.id});}}
function day(){for(const id of live())sync(id);const p=sv().p;if(p&&ended(p)&&!HAS)collect(true);B2.emit('fest',{a:'day'});try{if(HAS&&typeof UI!=='undefined'&&UI.refresh)UI.refresh();}catch(e){}}
function click(a,arg){const q=String(arg||'').split(':'),id=q[0];
  if(a==='open')open(id);else if(a==='close'){try{hideModal();}catch(e){}}
  else if(a==='buy'){if(buy(id,+q[1]||0)){tst2(T('Точка открыта — продаём!','Stall open — selling!'));open(id);}}
  else if(a==='cash'){const g=collect(false);if(g||sv().p.z)tst2((g>=0?'+':'')+MN(g));open(id);}
  else if(a==='korp'){if(korp(id,+q[1]||0))open(id);}
  else if(a==='gift'){if(gift(id))open(id);}
  else if(a==='claim'){claim(arg);open(String(arg).split('.')[0]);}}
// Кабинет: значки праздников навсегда
B2.slot('cab','fest',()=>{const f=FE();if(!f)return '';const s=sv().fest||{},a=[];for(const id in s){const x=holOf(id);if(x&&s[id].g&&s[id].g.main)a.push(x.ico+' '+E_(name(id))+' '+(2000+ +id.slice(-2)-(pre(id)==='ny'?1:0)));}
  return a.length?'<div class="b2f-box" style="margin:8px 0"><b>🏅 '+T('Праздники','Holidays')+'</b><br>'+a.join(' · ')+'</div>':'';},20);
// Поток EVENT (договор 785afba): у праздничных точек цепочка из 5 заданий живёт в Потоке; без EVENT — в окне праздника (claim)
const WHO_EV={beav:'bor',lud:'lud',vit:'vit',owl:'son',bars:'pet'};
function flowOn(){return typeof B2.flowAdd==='function'&&!B2.off('event');}
function flowReg(){if(!flowOn())return;F.flow=true;const f=FE();if(!f)return;
  for(const r of f.table()){const x=holOf(r.id);if(!x||(x.kind!=='qty'&&x.kind!=='pct')||(r.games!=='*'&&(','+r.games+',').indexOf(',magnat,')<0))continue;const id=r.id,e=key(r.to);
    try{B2.flowAdd({id,o:'fest',who:WHO_EV[x.who]||'lud',ru:x.ru,en:x.en,ico:x.ico,on:()=>F_(id),to:kms(e)+DAY-108e5,
      t:[{k:'x:fopen',need:1,ru:x.kind==='pct'?'Выбрать скидку':'Открыть точку: закупить товар',en:x.kind==='pct'?'Pick the discount':'Open the stall: buy stock'},
         {k:'x:fcash',need:1,ru:'Забрать выручку',en:'Collect the takings'},{k:'x:fcash',need:1,ru:'Забрать выручку ещё раз (в другой день)',en:'Collect again (another day)'},
         {k:'x:fday',need:1,ru:'Заглянуть к палатке не в день открытия',en:'Visit the stall on another day'},{k:'x:flast',need:1,ru:'Заглянуть к палатке в последний день продаж',en:'Visit the stall on the last sales day'}],
      prize:{cr:'fest.done',ru:'Значок праздника навсегда и 💎',en:'A holiday badge forever and 💎'}});}catch(e){}}}
B2.on('flow:chain',e=>{if(!e||e.o!=='fest'||!holOf(e.c))return;const f=FE();if(f&&f.give(e.c,'main')){B2.ev('fest','chain',{h:e.c});if(HAS)tst2(T('🎉 Праздник пройден: значок «'+name(e.c)+'» — навсегда','🎉 Holiday done: “'+name(e.c)+'” badge — forever'));}});
flowReg();
// Улица HOME (договор 107010e): палатка праздника на тротуаре — B2.street.add, нажатие fest:open:<id>
function tentSvg(x,col,full){const ico=E_(x.ico);return '<g><rect x="6" y="34" width="60" height="44" rx="4" fill="#fff8ec" stroke="#8d6e63" stroke-width="2"/>'+
  '<path d="M2 36 L14 14 H58 L70 36 Z" fill="'+col+'"/><path d="M14 14 L20 36 M26 14 L30 36 M38 14 L40 36 M50 14 L50 36 M62 14 L60 36" stroke="#fff" stroke-width="4" opacity=".55"/>'+
  '<rect x="6" y="58" width="60" height="6" fill="#a1887f"/><text x="36" y="56" text-anchor="middle" font-size="'+(full?22:18)+'">'+ico+'</text></g>';}
function streetItem(){const s=sv(),p=s.p&&!s.p.z?s.p:null,id=p?p.h:live().find(i=>{const k=holOf(i).kind;return (k==='qty'||k==='pct')&&!(s.r&&s.r[i]);});if(!id)return null;
  const x=holOf(id);if(!x||!x.lab)return null;const g=p?due(p):0,full=!!p;
  return {k:'tent',key:'fest:'+id+':'+(p?1:0)+':'+(g>0?1:0),lab:T(x.lab[0],x.lab[1]).slice(0,9),col:x.lab[2],svg:tentSvg(x,x.lab[2],full),tap:'fest:open:'+id};}
try{if(B2.street&&typeof B2.street.add==='function')B2.street.add('fest',()=>streetItem(),60);}catch(e){}
F.H={now:live,tasks,claim,open,stall,today:today_,street,winOk,win:winShow,day,click,boot(){for(const id of live())sync(id);const p=sv().p;if(p&&ended(p)&&!live().length&&!HAS)collect(true);B2.emit('fest',{a:'start'});try{if(HAS&&typeof UI!=='undefined'&&UI.refresh)UI.refresh();}catch(e){}},
  _:{plan,buy,sold,due,collect,base,win,korp,gift,yrOpen,yrKey,HOL}};
})();
