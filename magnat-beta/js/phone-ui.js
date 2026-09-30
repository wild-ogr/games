/* ================= «Из ларька в магнаты: бизнес» — телефон (зона «Phone») =================
   Договорённость — tools/phone-api.md. Грузится последним. Глобально — PHONE.
   Значок в шапке (#phBtn) с бейджем; экраны: главный (приложения + чаты), чаты/контакты, переписка, карточка контакта, звонок;
   приложения: Заказы, Банк, Календарь, Новости; «служебные» сообщения Людмилы Санны, Эльвиры Маратовны, Михалыча; пуши-баннеры.
   Своё состояние — S.ph (не в мире W, на экономику не влияет). Сюжет читаю из STORY (js/story.js), тексты — из STORYUI (если есть), иначе запасные.
   Стиль Г «Лёгкость»: только переменные css/theme.css; свой CSS — ниже (вставляется <style>). Без inset:, без flex gap. */
(function(){
'use strict';
if(window.PHONE)return;
const E=window.ECON;
const $e=id=>document.getElementById(id);
const W=()=>window.GAME&&GAME.W;
const en=()=>typeof LANG!=='undefined'&&LANG==='en';
// род героя (пролог): HERO.g('выручил','выручила'); без сюжета — мужской
const hg=(m,f)=>{try{return window.HERO&&HERO.g?HERO.g(m,f):m;}catch(e){return m;}};
const T=(ru,e)=>typeof L==='function'?L(ru,e):ru;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=x=>window.FMT?FMT.money(x):Math.round(x)+' ₽';
const snd=k=>{try{if(typeof SND!=='undefined'&&SND[k])SND[k]();}catch(e){}};
const tst=(t,ms)=>{try{if(t)toast(t,ms);}catch(e){}};
const isCalm=()=>{try{return typeof calm==='function'&&calm();}catch(e){return false;}};
const wide=()=>window.innerWidth>=900;
const mOn=()=>typeof modalOn!=='undefined'&&modalOn;
const pln=(n,a,b,c,d,e2)=>n+' '+(typeof pl==='function'?pl(n,a,b,c,d,e2):(en()?(n===1?d:e2):c));
const st=()=>{const w=W();return w?(w.ned?'nedra':(w.st||'nedra')):'nedra';};
const early=()=>{const w=W();return !!(w&&!w.ned&&w.me);};
const SY=()=>window.STORY&&W()?window.STORY:null;
const SU=()=>window.STORYUI||{};
function su(fn,...a){const f=SU()[fn];if(typeof f!=='function')return undefined;try{return f(...a);}catch(e){console.error(e);return undefined;}}

/* ---------------- контакты ---------------- */
const FRS=['owl','beav','bars','vit'];
const CT={
  lud:{n:['Людмила Санна','Lyudmila Sanna'],s:['главбух, ведёт ваши деньги','chief accountant, keeps your books']},
  elv:{n:['Эльвира Маратовна','Elvira Maratovna'],s:['ваш менеджер в банке','your bank manager']},
  mih:{n:['Михалыч','Mikhalych'],s:['мастер и прораб, всё починит','handyman and foreman, fixes anything']},
  owl:{n:['Соня Совина','Sonya Sovina'],s:['одноклассница, работает в банке','classmate, works at a bank']},
  beav:{n:['Борис Бобров','Boris Bobrov'],s:['одноклассник, свой бизнес','classmate, runs his own business']},
  bars:{n:['Пётр Барсуков','Pyotr Barsukov'],s:['одноклассник, горный инженер','classmate, mining engineer']},
  vit:{n:['Витя Козлов','Vitya Kozlov'],s:['одноклассник, перевозки','classmate, runs deliveries']},
  bear:{n:['Михаил Топтыгин','Mikhail Toptygin'],s:['чужой, крупный игрок','an outsider, a big player']}};
function who(id){const r=isFr(id)?su('who',id):null;const c=CT[id]||{n:[id,id],s:['','']};
  if(id==='lud'&&ludRet())return {n:T(c.n[0],c.n[1]),sub:T('на пенсии, на связи','retired, still in touch')};
  return {n:(r&&r.n)||T(c.n[0],c.n[1]),sub:(r&&r.sub!=null)?r.sub:T(c.s[0],c.s[1])};}
function ludRet(){const w=W();return !!(w&&w.fr&&w.fr.lud&&w.fr.lud.ret);}
// у кого переписка из сюжета: друзья, Топтыгин и Людмила (её сцены — кнопкой «Открыть»)
const stChat=id=>isFr(id)||id==='lud';
function bearSeen(){const w=W();return !!(w&&w.fr&&w.fr.bear&&w.fr.bear.seen);}
function contacts(){const a=['lud','elv','mih'];if(SY())for(const f of FRS)a.push(f);if(SY()&&bearSeen())a.push('bear');return a;}
function isFr(id){return FRS.indexOf(id)>=0||id==='bear';}
function face(id,mood,sz){sz=sz||48;let s='';
  try{if(window.UI&&UI.friend)s=UI.friend(id,mood||'calm');else if(window.friendSvg)s=friendSvg(id,mood||'calm');else if(id==='lud'&&window.UI&&UI.face)s=UI.face(mood||'calm');}catch(e){s='';}
  if(!s){const col=(window.FRIEND_COL&&FRIEND_COL[id])||'#667085',nm=who(id).n.split(' ').map(x=>x[0]||'').join('').slice(0,2);
    s=`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="${col}"/><text x="32" y="40" text-anchor="middle" font-size="22" font-weight="600" fill="#fff">${esc(nm)}</text></svg>`;}
  return `<span class="ph-av" style="width:${sz}px;height:${sz}px">${s}</span>`;}

/* ---------------- состояние S.ph ---------------- */
function wkey(){const w=W();return (w&&w.hold||1)+'/'+((typeof S!=='undefined'&&S.rst)||0);}
function P(){if(typeof S==='undefined')return null;const w=W();let p=S.ph;
  if(!p||typeof p!=='object'||p.v!==1||p.wk!==wkey()||(w&&typeof p.lt==='number'&&w.t<p.lt-2))p=S.ph=fresh();
  for(const k of ['rd','rdk','rdn','loc','rem','bz'])if(!p[k]||typeof p[k]!=='object')p[k]={};
  if(!Array.isArray(p.qs))p.qs=[];if(!Array.isArray(p.ln))p.ln=[];if(typeof p.n!=='number')p.n=0;
  return p;}
function fresh(){const w=W(),p={v:1,wk:wkey(),n:0,rd:{},rdk:{},rdn:{},loc:{},rem:{},bz:{},qs:[],ln:[],mh:-99,hi:0};
  if(w){p.nt=w.t>0?w.t:-1;p.lt=w.t;p.lm=w.reps&&w.reps.length?w.reps[w.reps.length-1].m:-1;p.ln=(w.loans||[]).filter(l=>l.k!=='fr').map(l=>l.id);p.od=w.odM||0;
    for(const b of w.biz||[])p.bz[b.id]=b.st;
    const F=w.fr;if(F&&Array.isArray(F.q))p.qs=F.q.map(q=>q.id);}
  return p;}
function persist(){try{if(typeof save==='function')save();}catch(e){}}

/* ---------------- сообщения ---------------- */
// сообщение от контакта (или «я» при me:1): ru/en хранятся оба — смена языка на лету
function say(id,ru,e2,acts,o){const p=P(),w=W();if(!p||!w||!CT[id])return null;o=o||{};
  const m={n:++p.n,t:w.t,ru:String(ru||''),en:String(e2||ru||'')};if(acts&&acts.length)m.a=acts;if(o.g)m.g=o.g;if(o.imp)m.i=1;if(o.me)m.me=1;if(o.mood)m.mo=o.mood;
  const a=p.loc[id]||(p.loc[id]=[]);a.push(m);if(a.length>14)a.splice(0,a.length-14);
  if(!o.me&&o.push!==false)push(id,T(m.ru,m.en),{imp:!!o.imp,go:['chat',id]});
  badge();return m;}
function gigLive(id){const w=W();return !!(w&&w.me&&Array.isArray(w.me.board)&&w.me.board.some(g=>g.id===id));}
function dayOf(t){const w=W();if(!w)return 0;return w.m*30+w.d-(w.t-t);}
function dLbl(D){const m=Math.floor(D/30),d=((D%30)+30)%30+1;return d+' '+(window.FMT?FMT.mon(m):'');}
function when(t){const w=W();if(!w)return '';const dt=w.t-t;if(dt<=0)return T('сегодня','today');if(dt===1)return T('вчера','yesterday');
  if(dt<7)return en()?dt+' d ago':dt+' дн. назад';return dLbl(dayOf(t));}

/* запасные тексты сюжета (пока нет js/story-ui.js) */
const FEED={gazel:['Купил «Газель»! Теперь я сам себе таксопарк.','Bought a van! Now I’m my own delivery fleet.'],
  best:['Меня назвали лучшим инспектором квартала!','I was named the best loan officer of the quarter!'],
  shift:['Смена 12 часов, зато премия. Горное дело — это вам не офис.','A 12-hour shift, but with a bonus. Mining is no office job.'],
  kiosk2:['Открыл вторую точку. А у тебя сколько?','Opened my second kiosk. How many do you have?'],
  son1:['У нас родился сын!','We had a baby boy!'],head:['Повысили до начальника отдела.','I’ve been promoted to head of department.'],
  cars5:['У меня уже пять машин!','I’ve got five trucks now!'],project:['Защитил проект разреза!','My open-pit project got approved!'],
  plant:['Топтыгин купил завод в Новокузнецке.','Toptygin bought a plant in Novokuznetsk.'],back:['Я снова на ногах. Спасибо за поддержку — это многое значит.','I’m back on my feet. Thanks for standing by me — it means a lot.'],
  leave:['Ухожу из банка — открываю свой фонд.','I’m leaving the bank to start my own fund.'],son2:['Второй сын! «Барсуков и сыновья» — звучит?','A second son! “Barsukov & Sons” — sounds good?'],
  vitlook:['Топтыгин присматривается к моей компании. Неспокойно мне.','Toptygin is eyeing my company. I’m uneasy.'],wagons:['Взял вагоны — теперь вожу и по железке.','Got some railcars — now I haul by rail too.'],
  fund:['Фонд «Сова Инвест» открыт!','The “Owl Invest” fund is open!'],gg:['Участок мой — без обид! Честная игра.','That plot is mine — no hard feelings! Fair play.'],
  self:['Справился сам, не переживай.','I managed on my own, don’t worry.'],thanks:[()=>'Вернул долг — спасибо, '+hg('выручил','выручила')+'!','Paid you back — thanks for the help!'],
  back2:[()=>'Возвращаю долг. Спасибо, что '+hg('выручил','выручила')+'!','Paying back the loan. Thanks for helping out!'],gpay:['Прости — платёж по ипотеке в этом месяце лёг на тебя.','Sorry — this month my mortgage payment fell on you.']};
const LIFE=[['Был на рыбалке — поймал щуку!','Went fishing — caught a pike!'],['Сходили всей семьёй в кино.','Went to the cinema with the whole family.'],['Записался в спортзал. Держите меня семеро.','Signed up for the gym. Wish me luck.'],
  ['Съездил к родителям в деревню.','Visited my parents in the village.'],['Починил машину сам — горжусь!','Fixed my car myself — proud of it!'],['Читаю книгу про бизнес — советую.','Reading a business book — recommend it.']];
const BEARN=[['Топтыгин снова скупает участки.','Toptygin is buying up plots again.'],['Про Топтыгина пишут в деловых новостях.','Toptygin is all over the business news.'],['Топтыгин открыл новый офис.','Toptygin opened a new office.']];
function feedTx(f){const r=su('feed',W(),f);if(typeof r==='string'&&r)return r;
  if(f.k==='life'){const x=LIFE[((f.a&&f.a.v)||0)%LIFE.length];return T(x[0],x[1]);}
  if(f.k==='bearnews'){const x=BEARN[((f.a&&f.a.v)||0)%BEARN.length];return T(x[0],x[1]);}
  const x=FEED[f.k];let s=x?T(typeof x[0]==='function'?x[0]():x[0],x[1]):T('Есть новости!','Got some news!');if(f.k==='back2'&&f.a&&f.a.a)s+=' '+money(f.a.a);if(f.k==='gpay'&&f.a&&f.a.a)s+=' ('+money(f.a.a)+')';return s;}
const GIFT=[['У меня день рождения в субботу! Заглянешь?','It’s my birthday on Saturday! Will you drop by?'],['Женюсь! Придёшь на свадьбу?','I’m getting married! Coming to the wedding?'],['У нас новоселье — ждём!','We’re having a housewarming — come over!']];
const SCN={pro:['Встреча выпускников — 10 лет! Приходи, все будут.','Class reunion — 10 years! Come, everyone will be there.'],
  vit1:['Есть подработка на вечер — помочь с переездом, {a}. Возьмёшь?','Got a gig for tonight — help with a move, {a}. In?'],
  owl1:['Могу оформить тебе кредитку с лимитом {a}. Без процентов, если гасить вовремя.','I can get you a credit card with a {a} limit. No interest if you repay on time.'],
  beav1:['Привет, сосед! Поставил ларёк напротив тебя. Конкуренция — двигатель торговли!','Hi, neighbour! Set up a kiosk right across from you. Competition drives trade!'],
  beav2:['Давай закупаться вместе? Оптом на 5 % дешевле — на целый год.','Shall we buy stock together? 5% cheaper wholesale — for a whole year.'],
  bars1:['Беру ипотеку. Нужен поручитель — поможешь?','I’m taking a mortgage. Need a guarantor — will you help?'],
  beav3:['Всё, прогорел. Нужно {a}, чтобы закрыть долги…','That’s it, I’m broke. I need {a} to cover my debts…'],
  vit3:['Откроем транспортную компанию на двоих? Нужно {a}.','Shall we open a transport company together? It takes {a}.'],
  bars2:['«Сосновый лог» на торгах. Зайдём вместе? Нужно {a}.','“Pine Hollow” is up for auction. Go in together? It takes {a}.'],
  ned1:['В большую лигу! Теперь ты горняк.','Welcome to the big league! You’re a miner now.'],
  bear1:['Топтыгин хочет купить мою долю. Помоги выкупить — нужно {a}.','Toptygin wants to buy my stake. Help me buy it out — it takes {a}.'],
  help:['Слышал, у тебя овердрафт. Держи {a} на {n} мес. без процентов.','Heard you’re in overdraft. Here’s {a} for {n} months, interest-free.'],
  reu:['Встреча выпускников! Все собираются — приходи.','Class reunion! Everyone’s coming — join us.']};
const OPT={vit1:{a:['Возьму','I’m in'],b:['Не сейчас','Not now']},owl1:{a:['Оформить карту','Get the card'],b:['Пока не нужно','Not needed yet']},
  beav1:{a:['Удачи, сосед!','Good luck, neighbour!'],b:['Ну, посмотрим','We’ll see']},beav2:{a:['Закупаемся вместе','Let’s buy together'],b:[()=>hg('Нет, я сам','Нет, я сама'),'No, I’ll manage']},
  bars1:{a:['Поручусь','I’ll vouch for you'],b:['Не могу','I can’t']},beav3:{a:['Дать в долг {a}','Lend {a}'],b:['Войти в долю за {a}','Buy in for {a}'],c:['Отказать','Refuse']},
  vit3:{a:['Вложить {a}','Invest {a}'],b:['Не сейчас','Not now']},bars2:{a:['Вложить {a}','Invest {a}'],b:['Подумаю','I’ll think'],c:['Нет','No']},
  ned1:{a:['Поехали!','Let’s go!']},pro:{a:['Приду!','I’ll be there!']},reu:{a:['Приду!','I’ll be there!']},
  bear1:{a:['Дать {a}','Give {a}'],b:['Не сейчас','Not now']},help:{a:['Взять {a}','Take {a}'],b:[()=>hg('Справлюсь сам','Справлюсь сама'),'I’ll manage']},
  rq_loan:{a:['Дать {a}','Lend {a}'],b:['Не сейчас','Not now']},rq_gift:{a:['Подарок на {a}','A gift for {a}'],b:['Поздравлю словами','Just my best wishes']},
  rq_watch:{a:['Присмотрю','I’ll keep an eye'],b:['Не смогу','I can’t']},rq_advice:{a:['Помогу советом','I’ll give advice'],b:['Расскажу, как было у меня','I’ll share my story']}};
const WHY={cash:['не хватает денег','not enough money'],trust:['нужно больше доверия','needs more trust'],quarter:['уже просили в этом квартале','already asked this quarter'],
  owe:['сначала верните прошлый займ','repay the previous loan first'],bank:['банк пока не даёт кредит','the bank isn’t lending yet'],nobuild:['сейчас нет строек','no construction right now'],
  noauc:['сейчас нет торгов','no auctions right now'],card:['карта уже есть','you already have the card'],no:['пока недоступно','not available yet']};
function why(c){const r=su('why',c);if(typeof r==='string'&&r)return r;const x=WHY[c]||WHY.no;return T(x[0],x[1]);}
function fill(s,a){a=a||{};return s.replace('{a}',a.a!=null?money(a.a):'').replace('{n}',a.n!=null?a.n:'');}
function askTx(q){const a=q.a||{};
  if(q.k==='rq'){if(q.r==='loan')return T(`Слушай, выручишь? Нужно ${money(a.a)} на ${pln(a.n,'месяц','месяца','месяцев','month','months')}. Верну обязательно.`,`Hey, can you help me out? I need ${money(a.a)} for ${pln(a.n,'месяц','месяца','месяцев','month','months')}. I’ll pay you back.`);
    if(q.r==='gift'){const x=GIFT[(a.v||0)%GIFT.length];return T(x[0],x[1]);}
    if(q.r==='watch')return T('Уезжаю на пару дней — присмотришь за моей точкой?','I’m away for a couple of days — can you keep an eye on my shop?');
    return T('Нужен твой совет по делу. Найдёшь минутку?','I need your advice on a business matter. Got a minute?');}
  const x=SCN[q.k];return x?fill(T(x[0],x[1]),a):T('Есть разговор — нужно твоё решение.','We need to talk — I need your decision.');}
function optTx(q,o){const k=q.k==='rq'?'rq_'+q.r:q.k,x=OPT[k]&&OPT[k][o];if(x)return fill(T(typeof x[0]==='function'?x[0]():x[0],x[1]),q.a);return o==='a'?T('Да','Yes'):o==='b'?T('Нет','No'):T('Отказаться','Decline');}
const LOGT={congr:['Вы поздравили','You sent congratulations'],repaid:['Вы вернули долг','You repaid the loan'],lendback:['Вам вернули долг','Your loan was repaid'],
  jv:['Открыли совместное дело','Started a joint venture'],jvbuy:['Выкупили долю в совместном деле','Bought out the joint venture'],jvsell:['Вышли из совместного дела','Left the joint venture'],
  jvyear:['Год совместного дела','A year of the joint venture'],gulate:['Просрочка по кредиту под поручительство','Late payment on a guaranteed loan']};
const CALLT={loan:['Занять до {a} без процентов','Borrow up to {a} interest-free'],truck:['Попросить машины: доставка −25 % в этом месяце','Ask for trucks: −25% delivery this month'],
  guar:['Поручиться за мой кредит в банке','Guarantee my bank loan'],check:['Проверить мои дела','Check my numbers'],expert:['Оценить участки на торгах','Assess plots at auction'],build:['Помочь со стройкой: −10 % срока','Help with construction: −10% time']};
function callLbl(k,op){const r=su('callLabel',k,op);if(typeof r==='string'&&r)return r;const x=CALLT[k];return x?fill(T(x[0],x[1]),{a:op&&op.a}):k;}
function logTx(x){const d=x.d?` · ❤ ${x.d>0?'+':''}${x.d}`:'';
  if(x.k.indexOf('call_')===0)return '📞 '+callLbl(x.k.slice(5),{a:x.a&&x.a.a})+d;
  if(x.k.indexOf('rq_')===0)return (x.o==='a'?T('Вы помогли','You helped'):T('Вы ответили','You replied'))+d;
  const l=LOGT[x.k];return (l?T(l[0],l[1]):T('Вы ответили','You replied'))+d;}

/* переписка: сюжет (STORY.thread) + служебные сообщения телефона (S.ph.loc) — по времени */
function thread(id){const p=P(),w=W(),out=[];if(!w)return out;
  if(stChat(id)&&SY()){let th=[];try{th=STORY.thread(w,id);}catch(e){th=[];}
    for(const it of th){if(it.x&&it.x.w==='all'&&id!=='owl')continue;   // встречи выпускников и общие сцены — только в чате Сони
      const r=su('msg',w,it);if(r&&r.tx==='')continue;out.push({t:it.t,s:it,r:r||null,o:0});}}
  const loc=p&&p.loc[id]||[];for(const m of loc)out.push({t:m.t,m,o:1});
  out.sort((a,b)=>a.t-b.t||a.o-b.o);return out;}
function unread(id){const p=P(),w=W();if(!p||!w)return 0;let n=0;
  // старше 30 игровых дней (кроме важных) — точку не держим неделями (аудит M3)
  for(const m of p.loc[id]||[])if(!m.me&&m.n>(p.rdn[id]||0)&&(m.i||!(m.t<w.t-30)))n++;
  if(stChat(id)&&SY()&&w.fr){const rd=p.rd[id]==null?-1:p.rd[id];let same=0;
    for(const f of w.fr.fd)if(f.w===id){if(f.t>rd){if(f.t>=w.t-30)n++;}else if(f.t===rd)same++;}
    n+=Math.max(0,same-(p.rdk[id]||0));
    for(const q of w.fr.q)if(q.w===id||(q.w==='all'&&id==='owl'))n++;}
  return n;}
function markRead(id){const p=P(),w=W();if(!p||!w)return;p.rd[id]=w.t;let same=0;if(w.fr)for(const f of w.fr.fd)if(f.w===id&&f.t===w.t)same++;p.rdk[id]=same;
  const loc=p.loc[id];p.rdn[id]=loc&&loc.length?loc[loc.length-1].n:p.n;persist();badge();}
// сколько ждёт ответа: вопросы друзей и важные (банк: овердрафт и т. п.) — число на значке; остальное непрочитанное — просто точка
function needAll(){const p=P(),w=W();if(!p||!w)return 0;let n=0;if(SY()&&w.fr)n+=w.fr.q.length;for(const id of contacts())for(const m of p.loc[id]||[])if(m.i&&!m.me&&m.n>(p.rdn[id]||0))n++;return n;}
function unreadAll(){let n=0;for(const id of contacts())n+=unread(id);return n;}
function lastOf(id){const th=thread(id);for(let i=th.length-1;i>=0;i--){const x=th[i],tx=itemTx(x);if(tx)return {t:x.t,tx};}return null;}
function itemTx(x){if(x.m)return T(x.m.ru,x.m.en);const it=x.s,r=x.r;if(r&&r.tx)return r.tx;if(r&&(r.ans||r.q))return r.ans||r.q;
  if(it.type==='feed')return feedTx(it.x);if(it.type==='ask')return askTx(it.x);if(it.type==='log')return logTx(it.x);return '';}

/* ---------------- служебные сообщения (из состояния мира) ---------------- */
const MR=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],MRP=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'],
  MEN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const STG={gig:['Карьера','Side jobs'],small:['Своё дело','My own business'],mid:['Сеть','The chain'],quarry:['Карьер','The quarry'],nedra:['Недра','Mining']};
const bizN=t=>{const B=E&&E.BIZ&&E.BIZ[t];return B?(en()?B.en:B.n):'';};
const bizNR=t=>{const B=E&&E.BIZ&&E.BIZ[t];return B?[B.n,B.en]:['точка','business'];};
function objNR(t){const o=E&&E.OBJ&&E.OBJ[t];return o?[o.n,o.en]:['объект','asset'];}
function regNR(r){const g=E&&E.REGS&&E.REGS[r];return g?[g.n,g.en]:['',''];}
function bankLoans(w){return (w.loans||[]).filter(l=>l.k!=='fr');}
function loanKind(l){return l.k==='od'?['овердрафт','overdraft']:l.card?['кредитная карта','credit card']:l.k==='mort'?['ипотека','mortgage']:['кредит','loan'];}
function monthPay(w){let s=0;for(const l of bankLoans(w)){try{s+=Math.min(l.a,E.loanPay(l))+l.a*l.r/12;}catch(e){}}return Math.round(s);}
const inL=(l,f)=>{if(typeof LANG==='undefined')return f();const o=LANG;try{LANG=l;return f();}finally{LANG=o;}};
const mR=x=>inL('ru',()=>money(x)),mE=x=>inL('en',()=>money(x)),pR=x=>inL('ru',()=>window.FMT?FMT.pct(x,1):x),pE=x=>inL('en',()=>window.FMT?FMT.pct(x,1):x),plR=(n,a,b,c)=>inL('ru',()=>pln(n,a,b,c,'',''));
function service(){const w=W(),p=P();if(!w||!p)return;
  // Людмила: приветствие в «Карьере»
  if(!p.hi){p.hi=1;if(early()&&st()==='gig'&&w.t<40)say('lud','Я на связи! Писать буду коротко: итоги месяца и что важно. Звоните, если что — я всё равно не сплю 🙂 А пока — заказы: на доске есть листовки у метро, берите первый.',
    'I’m here! I’ll keep it short: monthly results and anything important. Call anytime — I don’t sleep much anyway 🙂 For now — jobs: there are flyers at the metro on the board, take the first one.',[['gigs']],{push:false});}
  // новости мира
  for(const n of w.news||[]){if(n.t<=p.nt)continue;const a=n.a||{};
    if(n.k==='built'){const o=objNR(a.t),r=regNR(a.r);say('mih',`Пустили: ${o[0].toLowerCase()}, ${r[0]}. Работает как часы!`,`It’s running: ${o[1].toLowerCase()}, ${r[1]}. Works like clockwork!`,[['obj']],{push:false});}
    else if(n.k==='loan'){say('elv',`Кредит ${mR(a.a)} выдан под ${pR(a.r)} на ${plR(a.n,'месяц','месяца','месяцев','month','months')}. Платёж спишем в конце месяца.`,
      `Your ${mE(a.a)} loan is issued at ${pE(a.r)} for ${a.n} ${a.n===1?'month':'months'}. The payment is taken at month end.`,[['bank']],{push:false});}
    else if(n.k==='od'){say('elv',`На счёте минус — банк дал овердрафт ${mR(a.a)}. Он дорогой, лучше погасить в следующем месяце.`,`Your account went negative — the bank gave an overdraft of ${mE(a.a)}. It’s expensive, better repay it next month.`,[['bank']],{imp:true,mood:'worry'});}
    else if(n.k==='penalty'){say('lud',`Штраф по контракту: ${mR(a.pen)}. Недопоставили — в следующий раз берите объём по силам.`,`Contract penalty: ${mE(a.pen)}. We under-delivered — next time take a volume we can handle.`,[['con']]);}
    else if(n.k==='biz'){if(a.k==='built'){const b=bizNR(a.bt);say('mih',`Готово, открыли: ${b[0].toLowerCase()}. Можно работать!`,`Done: the ${b[1].toLowerCase()} is open for business!`,[['biz']],{push:false});}
      else if(a.k==='stage'&&STG[a.st]){say('lud',`Новая глава — «${STG[a.st][0]}». Поздравляю! Дальше — больше.`,`A new chapter — “${STG[a.st][1]}”. Congratulations! Bigger things ahead.`,null,{mood:'happy'});}}}
  if(w.news&&w.news.length)p.nt=Math.max(p.nt||0,w.news[w.news.length-1].t);
  // кредиты: погашен полностью
  const ids=bankLoans(w).map(l=>l.id);
  const gone=p.ln.filter(id=>ids.indexOf(id)<0);
  if(gone.length&&!w.odM&&!bankLoans(w).some(l=>l.k==='od')){const was=p.lk||{};const real=gone.filter(id=>was[id]!=='od');
    if(real.length)say('elv',real.length>1?'Кредиты погашены полностью. Спасибо за аккуратность!':'Кредит погашен полностью. Спасибо за аккуратность!',real.length>1?'Your loans are fully repaid. Thank you for being so reliable!':'Your loan is fully repaid. Thank you for being so reliable!',[['bank']],{push:false,mood:'happy'});}
  p.ln=ids;p.lk={};for(const l of bankLoans(w))p.lk[l.id]=l.k==='od'?'od':'';
  // итоги месяца (после офлайна — одно сообщение за все месяцы)
  const reps=w.reps||[],last=reps[reps.length-1];
  if(last&&last.m>(p.lm==null?-1:p.lm)){const k=reps.filter(r=>r.m>(p.lm==null?-1:p.lm)).length;p.lm=last.m;
    let np=0;try{np=E.netOf(last.pl);}catch(e){}const c1=last.c1!=null?last.c1:w.cash;
    const mnR=MR[last.m%12]+' '+(2027+Math.floor(last.m/12)),mn=MEN[last.m%12]+' '+(2027+Math.floor(last.m/12));
    const ru=(k>1?`Пока вас не было, закрыли ${plR(k,'месяц','месяца','месяцев','month','months')}. `:'')+`Итоги — ${mnR.toLowerCase()}: ${np>=0?'прибыль':'убыток'} ${mR(Math.abs(np))}, на счёте ${mR(c1)}.`;
    const e2=(k>1?`While you were away, ${k} months were closed. `:'')+`${mn} results: ${np>=0?'profit':'loss'} ${mE(Math.abs(np))}, cash ${mE(c1)}.`;
    say('lud',ru,e2,[['report',last.m]],{push:false,mood:np>=0?'happy':'worry'});
    const cf=last.cf||{},rp=Math.abs(cf.repay||0),it=Math.abs(cf.int||0);
    if(rp+it>0){let d=0;for(const l of bankLoans(w))d+=l.a;
      say('elv',`Списали платёж за ${MRP[last.m%12]} ${2027+Math.floor(last.m/12)}: ${mR(rp+it)} (долг ${mR(rp)}, проценты ${mR(it)}). Остаток долга — ${mR(d)}.`,
        `Payment for ${mn} taken: ${mE(rp+it)} (principal ${mE(rp)}, interest ${mE(it)}). Debt left — ${mE(d)}.`,[['bank']],{push:false});}}
  // Михалыч: вызов «мастер на час» на доске (не чаще раза в 10 дней)
  // не чаще раза в 15 игровых дней и только если заказ провисит ещё хотя бы 2 дня; исчез с доски — сообщение помечается «уже неактуально»
  if(early()&&w.me&&Array.isArray(w.me.board)&&w.t-(p.mh==null?-99:p.mh)>=15){const g=w.me.board.find(x=>x.t==='handy'&&x.id!==p.mg&&x.exp-w.t>=2);
    if(g&&(!E.gigOk||E.gigOk(w,'handy'))){p.mg=g.id;p.mh=w.t;
      say('mih',`Есть вызов — мастер на час, ${mR(g.pay)} на руки. Возьмёшь, пока не увели?`,`There’s a call-out — handyman for an hour, ${mE(g.pay)} in hand. Take it before someone else does?`,[['gigs']],{g:g.id});}}
  // сюжет: новые просьбы и сцены — пуш «нужен ответ»
  if(SY()&&w.fr&&Array.isArray(w.fr.q)){for(const q of w.fr.q){if(p.qs.indexOf(q.id)>=0)continue;p.qs.push(q.id);
      const id=q.w==='all'?'owl':q.w;let tx=q.ph||'';if(!tx){const r=su('msg',w,{t:q.t,type:'ask',x:q});tx=(r&&r.tx)||askTx(q);}
      push(id,tx,{imp:true,go:['chat',id]});}
    if(p.qs.length>40)p.qs=p.qs.filter(id=>w.fr.q.some(q=>q.id===id));}
  p.lt=w.t;}

/* ---------------- календарь ---------------- */
function cal(){const w=W();if(!w)return [];const now=w.m*30+w.d,a=[];
  const add=(D,ru,e2,wh,imp,key,go)=>a.push({D,ru,en:e2,w:wh,imp:!!imp,key,go});
  const mEnd=w.m*30+29,pay=monthPay(w);
  add(mEnd,'Закрытие месяца: итоги'+(pay>0?` и платёж банку ~${money(pay)}`:''),'Month closes: results'+(pay>0?` and bank payment ~${money(pay)}`:''),pay>0?'elv':'lud',false,null,pay>0?['bank']:null);
  for(const o of w.obj||[]){const on=objNR(o.t),rn=regNR(o.r);
    if(o.st==='b')add(now+(o.left||0),`Пуск: ${on[0].toLowerCase()}, ${rn[0]}`,`Start-up: ${on[1].toLowerCase()}, ${rn[1]}`,'mih',true,'b'+o.id,['obj']);
    if(o.up)add(now+(o.up.left||0),`Модернизация готова: ${on[0].toLowerCase()}`,`Upgrade done: ${on[1].toLowerCase()}`,'mih',false,'u'+o.id,['obj']);}
  for(const b of w.biz||[])if(b.st==='b'){const n=bizNR(b.t);add(now+(b.left||0),`Открытие: ${n[0].toLowerCase()}`,`Opening: ${n[1].toLowerCase()}`,'mih',true,'z'+b.id,['biz',b.id]);}
  if(w.me&&Array.isArray(w.me.gigs))for(const g of w.me.gigs){const G=E.GIGS&&E.GIGS[g.t];if(!G)continue;add(now+(g.left||0),`Заказ готов: ${G.n.toLowerCase()}`,`Job done: ${G.en.toLowerCase()}`,'lud',false,null,['gigs']);}
  for(const x of w.auc||[]){const gn=E.GOODS&&E.GOODS[x.g],rn=regNR(x.r);add(now+Math.max(0,x.end-w.t),`Конец торгов: ${gn?gn.n.toLowerCase():''}, ${rn[0]}`,`Auction ends: ${gn?gn.en.toLowerCase():''}, ${rn[1]}`,'lud',x.you||x.finder==='you','a'+x.id,['map']);}
  for(const x of w.opi||[])if(x.st==='auc'&&x.end!=null)add(now+Math.max(0,x.end-w.t),'Конец торгов за карьер','Quarry auction ends','bars',true,'o'+x.id,['biz']);
  for(const c of w.cons||[]){const gn=E.GOODS&&E.GOODS[c.g];if(c.done>=c.q)continue;add(now+Math.max(0,c.end-w.t),`Срок контракта: ${gn?gn.n.toLowerCase():''}`,`Contract due: ${gn?gn.en.toLowerCase():''}`,'lud',true,'c'+c.id,['con']);}
  for(const l of bankLoans(w))if(l.k!=='od'&&l.n>0){const k=loanKind(l);add((w.m+l.n-1)*30+29,`Последний платёж: ${k[0]} ${money(l.a0||l.a)}`,`Final payment: ${k[1]} ${money(l.a0||l.a)}`,'elv',l.n<=2,'l'+l.id,['bank']);}
  if(SY()){let ds=[];try{ds=STORY.dates(w)||[];}catch(e){ds=[];}
    for(const d of ds){let tx=su('date',w,d);const wh=d.w||'owl';
      if(typeof tx!=='string'||!tx){const nm=d.w?who(d.w).n:'';
        tx=d.k==='reu'?T(`Встреча выпускников «${Math.round(d.y||0)} лет»`,`Class reunion “${Math.round(d.y||0)} years”`)
          :d.k==='lendback'?T(`${nm} возвращает долг ${money(d.a)}`,`${nm} repays ${money(d.a)}`)
          :d.k==='owe'?T(`Вернуть долг: ${nm}, ${money(d.a)}`,`Repay ${nm}: ${money(d.a)}`)
          :d.k==='jvdiv'?T(`Совместное дело с ${nm}: решение по дивидендам`,`Joint venture with ${nm}: dividend decision`)
          :d.k==='guar'?T('Поручительство Сони заканчивается','Sonya’s guarantee ends'):T('Дата','Date');}
      a.push({D:d.m*30,tx,w:wh,imp:d.k!=='jvdiv',key:'s'+d.k+(d.w||'')+d.m,go:d.w?['chat',d.w]:null});}}
  return a.filter(x=>x.D>=now).sort((p,q)=>p.D-q.D);}
function remind(){const w=W(),p=P();if(!w||!p)return;const now=w.m*30+w.d;
  for(const x of cal()){if(!x.imp||!x.key||x.D-now!==1||p.rem[x.key])continue;p.rem[x.key]=w.t;
    push(x.w,T('Завтра: ','Tomorrow: ')+(x.tx||T(x.ru,x.en)),{imp:true,go:['app','cal']});}
  const ks=Object.keys(p.rem);if(ks.length>60)for(const k of ks)if(w.t-p.rem[k]>60)delete p.rem[k];}

/* ---------------- пуши-баннеры ---------------- */
const PQ=[];let pushT=0,pushHideT=0;const T0=Date.now();
function push(id,text,o){o=o||{};if(!text)return;text=String(text);if(text.length>90)text=text.slice(0,88)+'…';
  const i=PQ.findIndex(x=>x.id===id);const it={id,text,imp:!!o.imp,go:o.go||['chat',id]};
  if(i>=0){it.imp=it.imp||PQ[i].imp;PQ[i]=it;}else PQ.push(it);
  while(PQ.length>3){const j=PQ.findIndex(x=>!x.imp);PQ.splice(j>=0?j:0,1);}}
function tutOn(){try{if(window.UI&&UI.tutStep&&UI.tutStep())return true;}catch(e){}
  // «Карьера»: первые шаги обучения (взять заказ, дождаться, второй заказ) — без баннеров; дальше обучение длинное, баннеры можно
  try{if(window.BIZUI&&typeof BIZUI.tutStep==='function'&&['hi','take1','wait1','take2'].indexOf(BIZUI.tutStep())>=0)return true;}catch(e){}
  try{if(GAME.hold&&GAME.hold.has('tut'))return true;}catch(e){}return false;}
function pushTick(){if(!PQ.length)return;const now=Date.now(),cm=isCalm();
  if(now-T0<10000||mOn()||isOpen()||document.hidden||tutOn())return;
  if((typeof paused!=='undefined'&&paused))return;
  const ad=$e('ad');if(ad&&ad.classList.contains('on'))return;
  // не чаще раза в 30 с (в спокойном режиме — 45 с) и не поверх пузыря главбуха
  if(now-pushT<(cm?45000:30000))return;
  const av=$e('adv');if(av&&av.classList.contains('on'))return;
  let i=cm?PQ.findIndex(x=>x.imp):0;if(i<0){PQ.length=0;return;}
  const it=PQ.splice(i,1)[0];
  pushT=now;showPush(it);}
function showPush(it){const b=$e('phPush');if(!b)return;const c=who(it.id);
  // ниже шапки — сумма денег всегда видна
  try{const hd=$e('hdr');b.style.top=hd&&hd.offsetHeight?(hd.offsetTop+hd.offsetHeight+6)+'px':'';}catch(e){}
  b.innerHTML=`<button class="ph-pm noenter" data-pg="1">${face(it.id,'calm',44)}<span class="ph-pt"><b>${esc(c.n)}</b><span>${esc(it.text)}</span></span></button><button class="ph-px noenter" data-px="1" aria-label="${T('Закрыть','Close')}">×</button>`;
  b.classList.add('on');b.onclick=e=>{const g=e.target.closest('[data-pg]'),x=e.target.closest('[data-px]');if(!g&&!x)return;hidePush();if(g){snd('tap');open(it.go[0],it.go[1]);}};
  clearTimeout(pushHideT);pushHideT=setTimeout(hidePush,isCalm()?8000:5500);}
function hidePush(){const b=$e('phPush');if(b)b.classList.remove('on');clearTimeout(pushHideT);}

/* ---------------- приложения ---------------- */
const ICO={
  orders:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/></svg>',
  bank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><circle cx="12" cy="15" r="1.2"/></svg>',
  news:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="15" height="15" rx="2"/><path d="M18 9h3v9a2 2 0 01-2 2M7 9h7M7 13h7M7 16h4"/></svg>',
  chats:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  call:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>'};
function bankOn(){const w=W();if(!w)return false;if(bankLoans(w).length)return true;try{return E.loanOffer(w).max>0;}catch(e){return false;}}
function newsUnread(){const w=W();if(!w||!w.fr||!SY())return 0;let n=0;for(const f of w.fr.fd)if(f.t>w.fr.rd)n++;return n;}
function apps(){const w=W(),a=[['orders',T('Заказы','Jobs'),early()&&w.me?(w.me.board||[]).length:(w&&w.offers||[]).length,0]];
  if(bankOn())a.push(['bank',T('Банк','Bank'),w&&w.odM>0?1:0,w&&w.odM>0]);
  a.push(['cal',T('Календарь','Calendar'),0,0],['news',T('Новости','News'),newsUnread(),1]);return a;}
function appsHtml(){return '<div class="ph-apps">'+apps().map(x=>`<button class="ph-app noenter" data-p="app" data-a="${x[0]}"><span class="ph-ai">${ICO[x[0]]}${x[2]&&x[3]?`<i class="ph-b">${x[2]>9?'9+':x[2]}</i>`:''}</span><span class="ph-al">${x[1]}</span></button>`).join('')+'</div>';}
function rowHtml(id,full){const c=who(id),l=lastOf(id),u=unread(id);
  const sub=full?esc(c.sub):l?esc(l.tx):esc(c.sub);
  const hr=full&&isFr(id)&&id!=='bear'&&SY()?(()=>{try{const f=STORY.friend(W(),id);return `<span class="ph-hr" aria-label="${T('доверие','trust')} ${f.tr}">${'❤'.repeat(f.h)}</span>`;}catch(e){return '';}})():'';
  return `<button class="ph-row noenter" data-p="go" data-v="${full?'contact':'chat'}" data-a="${id}">${face(id,'calm',48)}<span class="ph-rt"><b>${esc(c.n)}${hr}</b><span>${sub}</span></span><span class="ph-rr">${l&&!full?`<small>${esc(when(l.t))}</small>`:''}${u?`<i class="ph-b">${u>9?'9+':u}</i>`:''}</span></button>`;}
function chatList(n){const ids=contacts().map(id=>({id,l:lastOf(id),u:unread(id)})).filter(x=>x.l||x.u);ids.sort((a,b)=>(b.u?1:0)-(a.u?1:0)||(b.l?b.l.t:-1)-(a.l?a.l.t:-1));
  const sh=n?ids.slice(0,n):ids;if(!sh.length)return `<div class="ph-empty">${T('Пока тихо. Сообщения появятся, когда что-то случится.','All quiet. Messages will appear when something happens.')}</div>`;
  return '<div class="ph-list">'+sh.map(x=>rowHtml(x.id)).join('')+'</div>';}

/* ---------------- экраны ---------------- */
let nav=[{v:'home'}],isOn=false,embedEl=null;
function isOpen(){return isOn;}
function vHome(){return {t:T('Телефон','Phone'),h:appsHtml()+`<div class="ph-sec"><span>${T('Сообщения','Messages')}</span><button class="ph-lnk noenter" data-p="go" data-v="contacts">${T('Контакты','Contacts')}</button></div>`+chatList(6)
  +`<button class="btn w noenter ph-mt" data-p="go" data-v="chats">${ICO.chats}<span>${T('Все чаты','All chats')}</span></button>`};}
function tabs(on){return `<div class="ph-tabs"><button class="noenter${on==='chats'?' on':''}" data-p="go" data-v="chats" data-r="1">${T('Чаты','Chats')}</button><button class="noenter${on==='contacts'?' on':''}" data-p="go" data-v="contacts" data-r="1">${T('Контакты','Contacts')}</button></div>`;}
function vChats(){return {t:T('Чаты','Chats'),h:tabs('chats')+chatList(0)};}
function vContacts(){return {t:T('Контакты','Contacts'),h:tabs('contacts')+'<div class="ph-list">'+contacts().map(id=>rowHtml(id,true)).join('')+'</div>'};}
function actBtn(a){const k=a[0];const L2={bank:['🏦 Открыть банк','🏦 Open the bank'],gigs:['Посмотреть заказы','See the jobs'],report:['📊 Отчёт','📊 Report'],obj:['Открыть объекты','Open assets'],
    market:['Открыть рынок','Open the market'],con:['Контракты','Contracts'],biz:['Открыть бизнес','Open business'],map:['Открыть карту','Open the map'],cal:['Календарь','Calendar']}[k];
  if(!L2)return '';return `<button class="btn sm noenter" data-p="act" data-k="${k}" data-m="${a[1]!=null?esc(a[1]):''}">${T(L2[0],L2[1])}</button>`;}
function bubble(x,id){const w=W();
  if(x.m){const m=x.m,old=m.g&&!gigLive(m.g);return `<div class="ph-m${m.me?' me':''}${old?' old':''}"><div>${esc(T(m.ru,m.en))}</div>${old?`<div class="ph-ok">${T('Уже неактуально — заказ ушёл','No longer relevant — the job is gone')}</div>`:m.a?'<div class="ph-ma">'+m.a.map(actBtn).join('')+'</div>':''}<small>${esc(when(m.t))}</small></div>`;}
  const it=x.s,r=x.r||{};
  if(it.type==='log'&&!r.tx&&(r.q||r.ans)){const d=r.d!=null?r.d:it.x.d;
    return (r.q?`<div class="ph-m"><div>${esc(r.q)}</div></div>`:'')+(r.ans?`<div class="ph-m me"><div>${esc(r.ans)}</div><small>${esc(when(it.t))}${d?' · ❤ '+(d>0?'+':'')+d:''}</small></div>`:'');}
  if(it.type==='log'&&!r.tx&&it.x.o&&(SCN[it.x.k]||it.x.k.indexOf('rq_')===0)){const x=it.x,q=x.k.indexOf('rq_')===0?{k:'rq',r:x.k.slice(3),a:x.a||{}}:{k:x.k,a:x.a||{}};
    return `<div class="ph-m"><div>${esc(askTx(q))}</div></div><div class="ph-m me"><div>${esc(optTx(q,x.o))}</div><small>${esc(when(it.t))}${x.d?' · ❤ '+(x.d>0?'+':'')+x.d:''}</small></div>`;}
  if(it.type==='log'){const tx=r.tx||logTx(it.x);return r.me===false?`<div class="ph-m"><div>${esc(tx)}</div><small>${esc(when(it.t))}</small></div>`:`<div class="ph-sys">${esc(tx)}</div>`;}
  if(it.type==='feed'){const f=it.x,tx=r.tx||feedTx(f);
    const cg=f.c&&!f.g&&FRS.indexOf(f.w)>=0?`<div class="ph-ma"><button class="btn sm noenter" data-p="cg" data-i="${it.i}">🎉 ${T('Поздравить','Congratulate')}</button></div>`:f.c&&f.g?`<div class="ph-ok">✓ ${T('Вы поздравили','You congratulated')}</div>`:'';
    return `<div class="ph-m"><div>${esc(tx)}</div>${cg}<small>${esc(when(it.t))}</small></div>`;}
  if(it.type==='ask'){const q=it.x,tx=r.tx||askTx(q);let ops=[];try{ops=STORY.optsOf(w,q);}catch(e){ops=[];}
    let bt='';
    if((q.big||q.w==='lud')&&typeof SU().big==='function')bt=`<button class="btn sm blue noenter" data-p="big" data-q="${esc(q.id)}">${T('Открыть','Open')}</button>`;
    else bt=ops.map(op=>{const o2=(r.opts||[]).find(y=>y.o===op.o);const lb=(o2&&o2.tx)||optTx(q,op.o),ok=op.ok===true;
      return `<button class="btn sm${op.o==='a'&&ok?' blue':''} noenter" data-p="ans" data-q="${esc(q.id)}" data-o="${op.o}"${ok?'':' disabled'}>${esc(lb)}${ok?'':`<small class="ph-why">${esc(why(op.ok))}</small>`}</button>`+(o2&&o2.hint?`<div class="ph-hint">${esc(o2.hint)}</div>`:'');}).join('');
    return `<div class="ph-m ask"><div>${esc(tx)}</div><div class="ph-ma col">${bt}</div><small>${esc(when(it.t))}</small></div>`;}
  return '';}
function vChat(id){const c=who(id),th=thread(id);
  const head=`<div class="ph-ch"><button class="ph-chn noenter" data-p="go" data-v="contact" data-a="${id}">${face(id,'calm',44)}<span><b>${esc(c.n)}</b><small>${esc(c.sub)}</small></span></button>${id!=='bear'?`<button class="ph-cb noenter" data-p="call" data-a="${id}" aria-label="${T('Позвонить','Call')}">${ICO.call}</button>`:''}</div>`;
  const body=th.length?th.map(x=>bubble(x,id)).join(''):`<div class="ph-empty">${T('Сообщений пока нет.','No messages yet.')}</div>`;
  return {t:c.n,h:head+`<div class="ph-msgs">${body}</div>`,chat:1};}
function vContact(id){const c=who(id),w=W();let info='';
  if(isFr(id)&&SY()&&id!=='bear'){try{const f=STORY.friend(w,id);
    info=`<div class="ph-facts"><div><span>${T('Доверие','Trust')}</span><b>${'❤'.repeat(f.h)} ${f.tr}</b></div><div><span>${T('Капитал','Net worth')}</span><b>${money(f.cap)}</b></div>`
      +(f.owe?`<div><span>${T('Вы должны','You owe')}</span><b class="bad">${money(f.owe)}</b></div>`:'')+(f.lent?`<div><span>${T('Должен вам','Owes you')}</span><b>${money(f.lent)}</b></div>`:'')
      +(f.jv&&f.jv.length?`<div><span>${T('Совместные дела','Joint ventures')}</span><b>${f.jv.length}</b></div>`:'')+'</div>';}catch(e){info='';}}
  else if(id==='bear'&&SY()){try{info=`<div class="ph-facts"><div><span>${T('Капитал','Net worth')}</span><b>${money(STORY.capOf(w,'bear'))}</b></div></div>`;}catch(e){}}
  else if(id==='elv'&&w){let d=0;for(const l of bankLoans(w))d+=l.a;info=`<div class="ph-facts"><div><span>${T('Ваш долг банку','Your bank debt')}</span><b>${money(d)}</b></div></div>`;}
  const callL=id==='lud'?T('Спросить совета','Ask for advice'):id==='elv'?T('Позвонить в банк','Call the bank'):id==='mih'?T('Позвонить','Call'):T('Позвонить','Call');
  return {t:c.n,h:`<div class="ph-card">${face(id,'happy',96)}<h3>${esc(c.n)}</h3><p class="ph-sub">${esc(c.sub)}</p>${info}
    <div class="ph-btns">${FRS.indexOf(id)>=0&&typeof SU().openFriend==='function'?`<button class="btn noenter" data-p="fr" data-a="${id}">👥 <span>${T('Совместные дела','Joint ventures')}</span></button>`:''}<button class="btn noenter" data-p="go" data-v="chat" data-a="${id}">${ICO.chats}<span>${T('Переписка','Messages')}</span></button>${id!=='bear'?`<button class="btn blue noenter" data-p="call" data-a="${id}">${ICO.call}<span>${callL}</span></button>`:''}</div></div>`};}
let callRes=null;
function vCall(id){const c=who(id),w=W();let h=`<div class="ph-call">${face(id,callRes&&callRes.mood||'happy',120)}<h3>${esc(c.n)}</h3>`;
  const hi=su('hello',w,id);h+=`<div class="ph-m"><div>${esc((hi&&hi.tx)||T('Привет, председатель! Чем помочь?','Hi, chairman! How can I help?'))}</div></div>`;
  if(callRes)h+=`<div class="ph-m"><div>${esc(callRes.tx)}</div></div>`;
  let ops=[];if(SY()&&FRS.indexOf(id)>=0){try{ops=STORY.callOpts(w,id);}catch(e){ops=[];}}
  if(!ops.length)h+=`<div class="ph-empty">${T('Сейчас просить не о чем — просто поболтали.','Nothing to ask for now — just a friendly chat.')}</div>`;
  h+='<div class="ph-ma col">'+ops.map(op=>{const ok=op.ok===true,lb=callLbl(op.k,op);
    const rs=ok?'':`<small class="ph-why">${esc(op.ok==='trust'?T(`нужно доверие ${op.need}`,`needs trust ${op.need}`):why(op.ok))}</small>`;
    if(op.k==='loan'&&ok&&typeof SU().call!=='function')return `<div class="ph-hint">${esc(lb)}</div><div class="ph-two"><button class="btn sm blue noenter" data-p="ck" data-a="${id}" data-k="loan" data-n="6">${T('на 6 мес.','for 6 months')}</button><button class="btn sm noenter" data-p="ck" data-a="${id}" data-k="loan" data-n="12">${T('на 12 мес.','for 12 months')}</button></div>`;
    return `<button class="btn sm noenter" data-p="ck" data-a="${id}" data-k="${op.k}"${ok?'':' disabled'}>${esc(lb)}${rs}</button>`;}).join('')+'</div>';
  h+=`<button class="btn w noenter ph-hang" data-p="back">${T('Положить трубку','Hang up')}</button></div>`;
  return {t:T('Звонок','Call'),h};}
function vApp(a){const w=W();if(!w)return {t:'',h:''};
  if(a==='orders')return {t:T('Заказы','Jobs'),h:appOrders(w)};
  if(a==='bank')return {t:T('Банк','Bank'),h:appBank(w)};
  if(a==='cal')return {t:T('Календарь','Calendar'),h:appCal(w)};
  return {t:T('Новости','News'),h:appNews(w)};}
function appOrders(w){let h='';
  if(early()&&w.me){const G=E.GIGS||{},bd=(w.me.board||[]).slice().sort((a,b)=>(b.pay||0)-(a.pay||0)).slice(0,3);let fr=null;try{fr=E.hands(w);}catch(e){}
    h+=`<p class="ph-note">${T('Лучшие заказы с доски','Top jobs on the board')}${fr?` · ✋ ${T('свободно','free')} ${fr.free} ${T('из','of')} ${fr.tot}`:''} · ⚡ ${Math.round(w.me.en)}</p>`;
    if(!bd.length)h+=`<div class="ph-empty">${T('Заказов пока нет — новые появятся завтра.','No jobs yet — new ones appear tomorrow.')}</div>`;
    for(const g of bd){const d=G[g.t]||{ico:'•',n:g.t,en:g.t,who:['','']};
      const pay=g.t==='resale'?T(`вложить ${money(g.inv)}`,`invest ${money(g.inv)}`):'+'+money(g.pay);
      h+=`<div class="ph-job"><div class="ph-jt"><span class="ph-ji">${d.ico}</span><span><b>${esc(en()?d.en:d.n)}</b><small>${esc(d.who?(en()?d.who[1]:d.who[0]):'')}</small></span><b class="good">${pay}</b></div>
        <div class="ph-pills"><span>⏱ ${pln(g.days,'день','дня','дней','day','days')}</span><span>⚡ ${g.e}</span>${g.prem?`<span>★ ${T('премия','bonus')}</span>`:''}</div>
        <button class="btn w blue noenter" data-p="take" data-g="${esc(g.id)}">${T('Взять','Take')}</button></div>`;}
    h+=`<button class="btn w noenter ph-mt" data-p="act" data-k="gigs" data-m="all">${T('Все заказы','All jobs')}</button>`;}
  else{const of=(w.offers||[]).slice(0,3);h+=`<p class="ph-note">${T('Предложения контрактов','Contract offers')}</p>`;
    if(!of.length)h+=`<div class="ph-empty">${T('Новых предложений нет. Покупатели пишут, когда есть своя продукция.','No new offers. Buyers get in touch once you have your own output.')}</div>`;
    for(const o of of){const gn=E.GOODS[o.g];h+=`<div class="ph-job"><div class="ph-jt"><span><b>${esc(en()?gn.en:gn.n)}</b><small>${esc((en()?o.be:o.b)||'')}</small></span><b>${window.FMT?FMT.qty(o.q,o.g):o.q}</b></div>
      <div class="ph-pills"><span>${window.FMT?FMT.num(o.p):o.p} ₽/${esc(window.NM?NM.unit(o.g):'')}</span><span>⏱ ${pln(o.days,'день','дня','дней','day','days')}</span></div></div>`;}
    h+=`<button class="btn w blue noenter ph-mt" data-p="act" data-k="con">${T('Открыть контракты','Open contracts')}</button>`;}
  return h;}
function appBank(w){const ls=bankLoans(w);let d=0;for(const l of ls)d+=l.a;let of=null;try{of=E.loanOffer(w);}catch(e){}
  let h=`<div class="ph-facts big"><div><span>${T('Долг банку','Bank debt')}</span><b${w.odM>0?' class="bad"':''}>${money(d)}</b></div><div><span>${T('Платёж в конце месяца','Payment at month end')}</span><b>${money(monthPay(w))}</b></div>`
    +(of?`<div><span>${T('Банк готов дать','The bank can lend')}</span><b>${money(of.max)}</b></div><div><span>${T('Ставка','Rate')}</span><b>${window.FMT?FMT.pct(of.rate,1):of.rate}</b></div>`:'')+'</div>';
  if(ls.length)h+='<div class="ph-list">'+ls.map(l=>{const k=loanKind(l);return `<div class="ph-li"><span><b>${T(k[0].replace(/^./,c=>c.toUpperCase()),k[1].replace(/^./,c=>c.toUpperCase()))}</b><small>${window.FMT?FMT.pct(l.r,1):''} · ${l.k==='od'?T('до конца месяца','until month end'):T('осталось','left')+' '+pln(Math.max(1,l.n),'месяц','месяца','месяцев','month','months')}</small></span><b>${money(l.a)}</b></div>`;}).join('')+'</div>';
  const fl=(w.loans||[]).filter(l=>l.k==='fr');if(fl.length)h+=`<p class="ph-note">${T('Долги друзьям (без процентов)','Owed to friends (interest-free)')}</p><div class="ph-list">`+fl.map(l=>`<div class="ph-li"><span><b>${esc(who(l.fr).n)}</b><small>${T('вернуть через','repay in')} ${pln(Math.max(1,l.n),'месяц','месяца','месяцев','month','months')}</small></span><b>${money(l.a)}</b></div>`).join('')+'</div>';
  h+=`<button class="btn w blue noenter ph-mt" data-p="act" data-k="bank">🏦 ${T('Открыть банк','Open the bank')}</button>`;return h;}
function appCal(w){const now=w.m*30+w.d,a=cal().slice(0,14);if(!a.length)return `<div class="ph-empty">${T('Ближайших дат нет.','No upcoming dates.')}</div>`;
  return '<div class="ph-list">'+a.map(x=>{const dd=x.D-now,wl=dd<=0?T('сегодня','today'):dd===1?T('завтра','tomorrow'):dd<30?(en()?`in ${dd} days`:`через ${dd} ${pln(dd,'день','дня','дней','day','days').replace(/^\d+\s/,'')}`):dLbl(x.D);
    const tx=x.tx||T(x.ru,x.en);const go=x.go?` data-p="act" data-k="${x.go[0]==='chat'?'chat':x.go[0]}" data-m="${esc(x.go[1]!=null?x.go[1]:'')}"`:'';
    return `<${x.go?'button':'div'} class="ph-li${x.go?' noenter':''}"${go}>${face(x.w,'calm',36)}<span><b>${esc(tx)}</b><small>${esc(wl)}${dd<30?' · '+esc(dLbl(x.D)):''}</small></span>${x.imp&&dd<=3?'<i class="ph-dot"></i>':''}</${x.go?'button':'div'}>`;}).join('')+'</div>';}
const BIZT={open:['Открываем: {b}','Opening: {b}'],built:['Открылась точка: {b}','Now open: {b}'],sold:['Продана точка: {b}','Sold: {b}'],demol:['Закрыта точка: {b}','Closed: {b}'],
  ip:['Оформлено ИП','Registered as a sole trader'],gig1:['Взят первый заказ','First job taken'],quit:['Ушли с основной работы','Quit the day job'],opi:['Карьер наш — торги выиграны','The quarry is ours — auction won'],
  opilost:['Торги за карьер проиграны','Quarry auction lost'],bobr:['Бобров открыл стройбазу по соседству','Bobrov opened a builders’ yard next door']};
function newsTx(n){let s='';try{s=window.ADV&&ADV.news?ADV.news(n):'';}catch(e){s='';}if(s)return s;
  const a=n.a||{};if(n.k==='biz'){if(a.k==='stage'&&STG[a.st])return (window.FMT?FMT.mon(n.m)+' · ':'')+T('Новая глава: ','New chapter: ')+T(STG[a.st][0],STG[a.st][1]);
    const x=BIZT[a.k];if(x)return (window.FMT?FMT.mon(n.m)+' · ':'')+T(x[0],x[1]).replace('{b}',bizN(a.bt).toLowerCase());}
  return '';}
function appNews(w){let h='';
  if(SY()&&w.fr){const fd=w.fr.fd.map((f,i)=>({f,i})).reverse().slice(0,12);
    h+=`<p class="ph-note">${T('Друзья','Friends')}</p>`;
    if(!fd.length)h+=`<div class="ph-empty">${T('Друзья пока ничего не писали.','Your friends haven’t posted yet.')}</div>`;
    else h+='<div class="ph-list">'+fd.map(({f,i})=>{const nw=f.t>w.fr.rd;
      const cg=f.c&&!f.g&&FRS.indexOf(f.w)>=0?`<button class="btn sm noenter" data-p="cg" data-i="${i}">🎉 ${T('Поздравить','Congratulate')}</button>`:'';
      return `<div class="ph-li top">${face(f.w,'calm',40)}<span><b>${esc(who(f.w).n)}${nw?' <i class="ph-new">'+T('новое','new')+'</i>':''}</b><span class="ph-tx">${esc(feedTx(f))}</span><small>${esc(when(f.t))}</small>${cg}</span></div>`;}).join('')+'</div>';}
  const ns=(w.news||[]).slice().reverse().map(newsTx).filter(Boolean).slice(0,12);
  h+=`<p class="ph-note">${T('Компания и рынок','Company and market')}</p>`+(ns.length?'<div class="ph-list">'+ns.map(s=>`<div class="ph-li"><span><span class="ph-tx">${esc(s)}</span></span></div>`).join('')+'</div>':`<div class="ph-empty">${T('Новостей пока нет.','No news yet.')}</div>`);
  return h;}

/* ---------------- переходы в экраны игры ---------------- */
function tabOn(id){try{return !!(window.UI&&UI.TAB_DEF&&UI.TAB_DEF.some(t=>t.id===id&&(!t.show||t.show())));}catch(e){return false;}}
function openGigs(){const B=window.BIZUI;
  try{if(B){if(typeof B.openGigs==='function'){B.openGigs();return true;}if(typeof B.gigs==='function'){B.gigs();return true;}if(typeof B.open==='function'){B.open('gigs');return true;}}}catch(e){console.error(e);}
  for(const t of ['gigs','orders','zak'])if(tabOn(t)){UI.go(t);return true;}return false;}
function openBiz(id){const B=window.BIZUI;try{if(B){if(typeof B.openBiz==='function'){B.openBiz(id);return true;}if(typeof B.open==='function'){B.open('biz',id);return true;}}}catch(e){console.error(e);}
  for(const t of ['biz','business'])if(tabOn(t)){UI.go(t);return true;}if(tabOn('obj')){UI.go('obj');return true;}return false;}
function goFin(tab){try{UI.go('fin');const el=$e('scr-fin');if(el&&window.FIN)FIN.renderFin(el,tab);}catch(e){console.error(e);}}
function doAct(k,m){const leave=()=>{if(!wide()&&isOn)close();};
  if(k==='bank'){leave();goFin('bank');}
  else if(k==='gigs'){if(openGigs())leave();else if(m!=='all')go('app','orders');else tst(T('Доска заказов откроется в следующем обновлении','The job board opens in the next update'));}
  else if(k==='report'){try{if(window.FIN&&FIN.openReport)FIN.openReport(+m);}catch(e){console.error(e);}}
  else if(k==='obj'){leave();try{UI.go('obj');}catch(e){}}
  else if(k==='map'){leave();try{UI.go('map');}catch(e){}}
  else if(k==='market'||k==='con'){leave();try{UI.go('market');const el=$e('scr-market');if(el&&window.FIN)FIN.renderMarket(el,k==='con'?'con':undefined);}catch(e){console.error(e);}}
  else if(k==='biz'){if(openBiz(m))leave();}
  else if(k==='chat'){go('chat',m);}
  else if(k==='cal'){go('app','cal');}
  else if(k==='adv'){leave();try{UI.advOpen();}catch(e){}}}

/* ---------------- действия в телефоне ---------------- */
const TAKE={hand:['Все руки заняты','All hands are busy'],en:['Не хватает сил — отдохните','Not enough energy — take a rest'],rest:['Сегодня выходной','It’s your day off'],out:['Вы пока на больничном','You’re on sick leave'],
  req:['Нужен инструмент или рейтинг повыше','Needs tools or a higher rating'],cash:['Не хватает денег на товар','Not enough money for the goods'],no:['Заказ уже ушёл','The job is gone']};
function answer(qid,o){const w=W();const q=w&&w.fr&&w.fr.q.find(x=>x.id===qid);const wh=q?(su('speaker',q)||(q.w==='all'?'owl':q.w)):'owl';
  let r;try{r=GAME.act('friendAnswer',qid,o);}catch(e){console.error(e);r={res:'no'};}
  if(!r||r.res!=='ok'){snd('no');tst(why(r&&r.res||'no'));rerender();return;}
  snd('tap');const af=su('after',W(),r);
  if(af&&af.tx)say(wh,af.tx,af.tx,null,{push:false,mood:af.mood});
  tst(af&&af.toast?af.toast:r.d?(r.d>0?'❤ +'+r.d:'❤ '+r.d):'');rerender();}
function callKind(id,k,n){const w=W();if(SU().call&&su('call',id,k)===true){rerender();return;}
  const arg=k==='loan'?{n:+n===12?12:6}:undefined;let r;try{r=GAME.act('friendCall',id,k,arg);}catch(e){console.error(e);r={res:'no'};}
  if(!r||r.res!=='ok'){snd('no');tst(why(r&&r.res||'no'));rerender();return;}
  snd(k==='loan'?'coin':'tap');const af=su('after',W(),r);let tx=af&&af.tx;
  if(!tx){if(k==='loan')tx=T(`Держи ${money(r.a)}. Вернёшь через ${pln(r.n,'месяц','месяца','месяцев','month','months')}, без процентов.`,`Here’s ${money(r.a)}. Pay me back in ${r.n} months, no interest.`);
    else if(k==='guar')tx=T('Поручусь. Иди в банк в ближайшие 3 месяца — лимит будет выше, ставка ниже.','I’ll vouch for you. Go to the bank within 3 months — higher limit, lower rate.');
    else if(k==='check'){const c=r.c||{};tx=T(`Смотрю твои цифры: денег хватит на ${c.cashM>=99?'много':Math.round(c.cashM*10)/10} мес., долг к EBITDA — ${c.lev>=99?'—':Math.round(c.lev*10)/10}.`,`Looking at your numbers: cash lasts ${c.cashM>=99?'a long time':Math.round(c.cashM*10)/10+' months'}, debt to EBITDA — ${c.lev>=99?'—':Math.round(c.lev*10)/10}.`)+(c.od?T(' Есть овердрафт — закрой его первым.',' You’re in overdraft — close it first.'):'');}
    else if(k==='expert'){const n2=(r.list||[]).length;tx=T(`Посмотрел участки на торгах: ${n2}. Бери, если лицензия не дороже 60 % оценки.`,`I looked at the plots on auction: ${n2}. Take one if the licence costs under 60% of its value.`);}
    else if(k==='build')tx=T(`Подгоню своих ребят — строек ускорили: ${r.n||0}.`,`I’ll send my crew — constructions sped up: ${r.n||0}.`);
    else if(k==='truck')tx=T('Машины твои! В этом месяце доставка на 25 % дешевле.','The trucks are yours! Delivery is 25% cheaper this month.');
    else tx=T('Договорились!','Deal!');}
  callRes={tx,mood:(af&&af.mood)||'happy'};say(id,tx,tx,null,{push:false});if(af&&af.toast)tst(af.toast);rerender();}
function congr(i){let r;try{r=GAME.act('congrats',+i);}catch(e){r='no';}
  if(r==='ok'){snd('coin');tst(T('Поздравили! ❤ +2','Congratulated! ❤ +2'));}else if(r==='quarter')tst(T('Уже поздравляли в этом квартале','Already congratulated this quarter'));rerender();}
function take(gid){let r;try{r=GAME.act('gigTake',gid);}catch(e){r='no';}
  if(r==='ok'){snd('tap');tst(T('Заказ взят','Job taken'));}else{snd('no');const x=TAKE[r]||TAKE.no;tst(T(x[0],x[1]));}rerender();}
function doCall(id){callRes=null;
  if(id==='lud'){if(!wide()&&isOn)close();try{UI.advOpen();}catch(e){}return;}
  if(id==='elv'){doAct('bank');return;}
  if(id==='mih'){doAct(early()?'gigs':'obj');return;}
  go('call',id);}

/* ---------------- отрисовка ---------------- */
function viewOf(n){const v=n.v,a=n.a;return v==='chats'?vChats():v==='contacts'?vContacts():v==='chat'?vChat(a):v==='contact'?vContact(a):v==='call'?vCall(a):v==='app'?vApp(a):vHome();}
function render(keep){const ph=$e('phone');if(!ph||!isOn)return;const n=nav[nav.length-1];let r;try{r=viewOf(n);}catch(e){console.error(e);r={t:T('Телефон','Phone'),h:''};}
  const bd=ph.querySelector('.ph-body'),top=keep?bd.scrollTop:0,atBot=bd.scrollHeight-bd.scrollTop-bd.clientHeight<40;
  ph.querySelector('.ph-t').textContent=r.t;ph.querySelector('.ph-bk').style.visibility=nav.length>1?'visible':'hidden';
  bd.innerHTML=r.h;if(r.chat&&(!keep||atBot))bd.scrollTop=bd.scrollHeight;else bd.scrollTop=top;
  if(n.v==='chat')markRead(n.a);if(n.v==='app'&&n.a==='news'&&SY()&&W()&&W().fr&&W().fr.rd<W().t){try{GAME.act('storyRead');}catch(e){}}}
function rerender(){if(isOn)render(true);renderEmbed();badge();}
function go(v,a){if(v==='chats'||v==='contacts'){const t=nav[nav.length-1];if(t.v==='chats'||t.v==='contacts')nav.pop();}if(v!=='call')callRes=null;
  if(!isOn){open(v,a);return;}nav.push({v,a});render();}
function open(v,a){ensure();hidePush();nav=[{v:'home'}];if(v&&v!=='home')nav.push({v,a});callRes=null;
  const ph=$e('phone');isOn=true;ph.classList.add('on');document.body.classList.add('phon');place();render();navHL();snd('tap');}
function close(){const ph=$e('phone');isOn=false;if(ph)ph.classList.remove('on');document.body.classList.remove('phon');callRes=null;badge();navHL();}
// нижнее меню: пока телефон открыт на узком экране (закрывает всё), подсвечена вкладка «Телефон»; закрыли — снова вкладка текущего экрана
function navHL(){const n=$e('nav');if(!n)return;const on=isOn&&!wide(),s=document.querySelector('#main .screen.on');let t=s?s.id.replace('scr-',''):'';if(t==='reg')t='map';
  n.querySelectorAll('button[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab==='phone'?on:!on&&b.dataset.tab===t));}
function back(){if(!isOn)return false;if(nav.length>1){nav.pop();callRes=null;render(true);}else close();return true;}
function place(){const ph=$e('phone'),h=$e('hdr');if(!ph)return;if(wide()&&h){ph.style.top=(h.offsetHeight+12)+'px';}else ph.style.top='';
  // вкладка «Телефон» на телефоне: нижнее меню остаётся видно (раньше телефон ложился поверх меню)
  const nv=$e('nav');ph.style.bottom=!wide()&&document.body.classList.contains('phtab')&&nv&&nv.offsetHeight&&nv.offsetWidth>nv.offsetHeight?nv.offsetHeight+'px':'';}

/* главный экран телефона внутри чужого элемента (вкладка «Телефон» в «Карьере») */
function renderEmbed(el){if(el)embedEl=el;el=embedEl;if(!el||!el.isConnected||(el.classList.contains('screen')&&!el.classList.contains('on')))return;
  el.innerHTML=`<div class="ph-emb"><h2 class="ph-h2">${T('Телефон','Phone')}</h2>${vHome().h}</div>`;}
function onClick(e){const b=e.target.closest('[data-p]');if(!b||b.disabled)return;const p=b.dataset.p,a=b.dataset.a;
  const inPh=!!b.closest('#phone');
  if(!inPh&&p!=='cg'&&p!=='take'){snd('tap');if(p==='go')open(b.dataset.v,a);else if(p==='app')open('app',a);else if(p==='act')doAct(b.dataset.k,b.dataset.m);else if(p==='call')open('call',a);return;}
  if(p==='go'){snd('tap');go(b.dataset.v,a);}else if(p==='app'){snd('tap');go('app',a);}else if(p==='back'){snd('tap');back();}
  else if(p==='act')doAct(b.dataset.k,b.dataset.m);else if(p==='call')doCall(a);else if(p==='ck')callKind(a,b.dataset.k,b.dataset.n);
  else if(p==='ans')answer(b.dataset.q,b.dataset.o);else if(p==='big'){snd('tap');su('big',b.dataset.q);setTimeout(rerender,300);}
  else if(p==='fr'){snd('tap');su('openFriend',a);}
  else if(p==='cg')congr(b.dataset.i);else if(p==='take')take(b.dataset.g);}

/* ---------------- бейдж в шапке ---------------- */
function badge(){const b=$e('phBtn');if(!b)return;const n=unreadAll(),q=needAll();let i=b.querySelector('.ph-hb');
  if(n>0){if(!i){i=document.createElement('i');i.className='ph-hb';b.appendChild(i);}i.textContent=q>0?(q>9?'9+':q):'';i.classList.toggle('dot',!q);}else if(i)i.remove();
  b.setAttribute('aria-label',T('Телефон','Phone')+(n?' · '+n:''));b.classList.toggle('on',isOn);
  document.body.classList.toggle('phtab',!!document.querySelector('#nav [data-tab="phone"]'));
  const t=document.querySelector('#nav [data-tab="phone"]');if(t){let d=t.querySelector('.dot');if(n&&!d){d=document.createElement('i');d.className='dot';t.appendChild(d);}else if(!n&&d)d.remove();}}

/* ---------------- DOM и CSS ---------------- */
const CSS=`
#phBtn{position:relative}@media (max-width:699px){body.phtab #phBtn{display:none}}#phBtn svg{width:26px;height:26px}#phBtn.on{background:var(--accent-t);color:var(--accent)}
.ph-hb.dot{min-width:14px;width:14px;height:14px;padding:0;top:0;right:0}.ph-hb{position:absolute;top:-3px;right:-3px;min-width:22px;height:22px;border-radius:11px;background:var(--bad);color:#fff;font-size:13px;font-weight:700;font-style:normal;line-height:22px;padding:0 5px;text-align:center;border:2px solid var(--hd-bg)}
#phone{position:absolute;top:0;left:0;right:0;bottom:0;z-index:8;background:var(--bg);display:none;flex-direction:column;font-size:17px}
#phone.on{display:flex}
.ph-top{flex:none;display:flex;align-items:center;background:var(--hd-bg);border-bottom:1px solid var(--hd-line);padding:6px 6px;padding-top:max(6px,env(safe-area-inset-top))}
.ph-top button{width:52px;height:52px;border-radius:14px;font-size:28px;line-height:1;color:var(--ink);flex:none}
.ph-top button:active{background:var(--soft)}
.ph-t{flex:1;min-width:0;text-align:center;font-size:18px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ph-body{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:14px 14px calc(24px + env(safe-area-inset-bottom))}
.ph-av{display:inline-block;flex:none;border-radius:50%;overflow:hidden;background:var(--icbg)}.ph-av svg{width:100%;height:100%;display:block}
.ph-apps{display:flex;flex-wrap:wrap;background:var(--card);border-radius:var(--r);box-shadow:var(--sh);padding:12px 4px;margin-bottom:16px}
.ph-app{width:25%;display:flex;flex-direction:column;align-items:center;padding:6px 2px;min-height:96px}
.ph-ai{position:relative;width:60px;height:60px;border-radius:18px;background:var(--icbg);color:var(--icln);display:flex;align-items:center;justify-content:center}
.ph-ai svg{width:30px;height:30px}.ph-app:active .ph-ai{background:var(--accent-t)}
.ph-al{font-size:15px;margin-top:6px;color:var(--ink2);text-align:center;line-height:1.15}
.ph-b{display:inline-block;min-width:24px;height:24px;border-radius:12px;background:var(--bad);color:#fff;font-size:14px;font-weight:700;font-style:normal;line-height:24px;padding:0 6px;text-align:center}
.ph-ai .ph-b{position:absolute;top:-6px;right:-6px;border:2px solid var(--card)}
.ph-sec{display:flex;align-items:center;justify-content:space-between;margin:4px 4px 8px;font-size:15px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.02em}
.ph-lnk{color:var(--accent);font-weight:600;font-size:16px;text-transform:none;min-height:48px;padding:0 6px}
.ph-list{background:var(--card);border-radius:var(--r);box-shadow:var(--sh);overflow:hidden;margin-bottom:14px}
.ph-row,.ph-li{display:flex;align-items:center;width:100%;text-align:left;min-height:72px;padding:10px 14px;border-bottom:1px solid var(--line)}
.ph-row:last-child,.ph-li:last-child{border-bottom:0}.ph-row:active,button.ph-li:active{background:var(--soft2)}
.ph-li.top{align-items:flex-start}
.ph-rt,.ph-li>span:not(.ph-av){flex:1;min-width:0;margin-left:12px;display:block}.ph-li>span:first-child{margin-left:0}
.ph-rt b,.ph-li b{display:block;font-size:17px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ph-li b{white-space:normal}
.ph-rt>span{display:block;font-size:16px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ph-li small,.ph-rt small{display:block;font-size:15px;color:var(--muted)}
.ph-li>b{flex:none;margin-left:10px;font-size:17px}
.ph-tx{display:block;font-size:17px;line-height:1.35}
.ph-li .btn{margin-top:8px}
.ph-hr{color:var(--bad);font-size:13px;margin-left:6px;letter-spacing:1px;font-weight:400}
.ph-rr{flex:none;margin-left:8px;text-align:right;display:flex;flex-direction:column;align-items:flex-end}.ph-rr small{font-size:14px;color:var(--muted);margin-bottom:4px}
.ph-new{font-style:normal;font-size:15px;color:var(--accent);font-weight:600;margin-left:4px}
.ph-dot{width:10px;height:10px;border-radius:50%;background:var(--bad);flex:none;margin-left:8px}
.ph-empty{background:var(--card);border-radius:var(--r);box-shadow:var(--sh);padding:18px;color:var(--muted);margin-bottom:14px;font-size:17px}
.ph-mt{margin-top:4px;display:flex;align-items:center;justify-content:center}.btn svg{width:22px;height:22px;flex:none;margin-right:8px}
.ph-tabs{display:flex;background:var(--soft);border-radius:16px;padding:4px;margin-bottom:14px}
.ph-tabs button{flex:1;min-height:48px;border-radius:12px;font-weight:600;color:var(--muted)}.ph-tabs button.on{background:var(--card);color:var(--ink);box-shadow:var(--sh)}
.ph-ch{display:flex;align-items:center;background:var(--card);border-radius:var(--r);box-shadow:var(--sh);padding:8px 8px 8px 12px;margin-bottom:12px}
.ph-chn{flex:1;min-width:0;display:flex;align-items:center;text-align:left;min-height:56px}.ph-chn>span:last-child{margin-left:12px;min-width:0}
.ph-chn b{display:block;font-size:17px;font-weight:600}.ph-chn small{display:block;font-size:15px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ph-cb{width:52px;height:52px;border-radius:50%;background:var(--accent);color:var(--on-accent);flex:none;display:flex;align-items:center;justify-content:center;box-shadow:var(--btnsh)}.ph-cb svg{width:26px;height:26px}
.ph-msgs{display:flex;flex-direction:column}
.ph-m{align-self:flex-start;max-width:88%;background:var(--card);box-shadow:var(--sh);border-radius:20px 20px 20px 6px;padding:12px 14px 8px;margin:6px 0;font-size:17px;line-height:1.4}
.ph-m.me{align-self:flex-end;background:var(--accent);color:var(--on-accent);border-radius:20px 20px 6px 20px}.ph-m.me small{color:inherit;opacity:.8}
.ph-m.ask{border:2px solid var(--accent)}
.ph-m>small{display:block;font-size:14px;color:var(--muted);margin-top:4px;text-align:right}
.ph-ma{display:flex;flex-wrap:wrap;margin:8px -4px 0}.ph-ma .btn{margin:4px}.ph-ma.col{flex-direction:column;flex-wrap:nowrap}.ph-ma.col .btn{width:auto}
.ph-ma .btn[disabled]{opacity:.55}.ph-why{display:block;font-size:14px;font-weight:500;margin-top:2px}
.ph-hint{font-size:15px;color:var(--muted);margin:2px 4px 4px}.ph-ok{font-size:15px;color:var(--good);margin-top:6px}
.ph-m.old{opacity:.75}.ph-m.old .ph-ok{color:var(--muted);font-size:16px}
.ph-two{display:flex}.ph-two .btn{flex:1}
.ph-sys{align-self:center;text-align:center;color:var(--muted);font-size:15px;margin:8px 0;padding:4px 12px;background:var(--soft);border-radius:12px}
.ph-card,.ph-call{background:var(--card);border-radius:var(--r);box-shadow:var(--sh);padding:22px 18px;text-align:center;margin-bottom:14px;display:flex;flex-direction:column;align-items:center}
.ph-card h3,.ph-call h3{margin:12px 0 2px;font-size:22px;font-weight:600;color:var(--ink)}.ph-sub{margin:0 0 12px;color:var(--muted)}
.ph-call .ph-m{align-self:stretch;max-width:none;text-align:left}.ph-call .ph-ma{align-self:stretch}.ph-hang{margin-top:12px;background:var(--bad-t);color:var(--bad)}
.ph-call .ph-empty{box-shadow:none;background:var(--soft2);align-self:stretch;margin:6px 0 0}
.ph-facts{align-self:stretch;text-align:left;border-top:1px solid var(--line);margin:4px 0 12px}
.ph-facts>div{display:flex;justify-content:space-between;align-items:baseline;padding:10px 2px;border-bottom:1px solid var(--line)}
.ph-facts span{color:var(--muted)}.ph-facts b{font-size:18px;text-align:right;margin-left:10px;white-space:nowrap}.ph-facts .bad,.ph-li .bad{color:var(--bad)}
.ph-facts.big{background:var(--card);border-radius:var(--r);box-shadow:var(--sh);padding:4px 16px;border-top:0}.ph-facts.big>div:last-child{border-bottom:0}
.ph-btns{display:flex;flex-wrap:wrap;justify-content:center;align-self:stretch;margin:0 -4px}.ph-btns .btn{flex:1 1 40%;margin:4px;display:flex;align-items:center;justify-content:center}
.ph-note{margin:4px 4px 8px;color:var(--muted);font-size:15px}
.ph-job{background:var(--card);border-radius:var(--r);box-shadow:var(--sh);padding:14px;margin-bottom:12px}
.ph-jt{display:flex;align-items:center}.ph-jt>span:not(.ph-ji){flex:1;min-width:0}.ph-jt b{display:block;font-size:17px;font-weight:600}.ph-jt small{display:block;color:var(--muted);font-size:15px}
.ph-jt>b{flex:none;margin-left:10px;font-size:18px}.good{color:var(--good)}
.ph-ji{width:44px;height:44px;border-radius:50%;background:var(--icbg);display:flex;align-items:center;justify-content:center;font-size:22px;flex:none;margin-right:12px}
.ph-pills{display:flex;flex-wrap:wrap;margin:10px -3px}.ph-pills span{background:var(--soft);border-radius:12px;padding:6px 10px;margin:3px;font-size:15px}
.ph-emb{padding:0 0 16px}.ph-h2{font-size:26px;font-weight:600;margin:6px 4px 12px}
#phPush{position:absolute;top:8px;left:8px;right:8px;z-index:9;display:none;align-items:center;background:var(--card);border-radius:20px;box-shadow:var(--sh2);border:1px solid var(--line);padding:6px;margin-top:env(safe-area-inset-top)}
#phPush.on{display:flex;animation:phIn .25s ease-out}
@keyframes phIn{from{transform:translateY(-24px);opacity:0}to{transform:none;opacity:1}}
body.calm #phPush.on{animation:none}
.ph-pm{flex:1;min-width:0;display:flex;align-items:center;text-align:left;min-height:56px;padding:4px 6px}
.ph-pt{flex:1;min-width:0;margin-left:10px}.ph-pt b{display:block;font-size:16px;font-weight:600}.ph-pt span{display:block;font-size:16px;color:var(--ink2);line-height:1.3;max-height:2.6em;overflow:hidden}
.ph-px{width:48px;height:48px;border-radius:50%;font-size:26px;color:var(--muted);flex:none}
@media (min-width:900px){
  #phone{left:auto;right:16px;bottom:16px;width:392px;border-radius:28px;box-shadow:var(--sh2);border:1px solid var(--line);overflow:hidden}
  .ph-top{border-radius:28px 28px 0 0;padding-top:6px}
  body.phon #main{padding-right:412px}
  body.phon #adv{right:424px;left:auto;width:auto;max-width:560px}
  #phPush{left:auto;right:16px;width:392px;top:12px}}
@media (max-height:600px) and (min-width:900px){#phone{bottom:8px}.ph-app{min-height:84px}.ph-ai{width:52px;height:52px}}
`;
function ensure(){if($e('phone'))return;const app=$e('app')||document.body;
  if(!$e('phCss')){const s=document.createElement('style');s.id='phCss';s.textContent=CSS;document.head.appendChild(s);}
  const ph=document.createElement('div');ph.id='phone';ph.setAttribute('role','dialog');
  ph.innerHTML=`<div class="ph-top"><button class="ph-bk noenter" data-p="back" aria-label="">‹</button><div class="ph-t"></div><button class="ph-x noenter" aria-label="">×</button></div><div class="ph-body"></div>`;
  app.appendChild(ph);ph.addEventListener('click',onClick);ph.querySelector('.ph-x').onclick=()=>{snd('tap');close();};
  const pp=document.createElement('div');pp.id='phPush';app.appendChild(pp);labels();}
function labels(){const ph=$e('phone');if(ph){ph.setAttribute('aria-label',T('Телефон','Phone'));ph.querySelector('.ph-bk').setAttribute('aria-label',T('Назад','Back'));ph.querySelector('.ph-x').setAttribute('aria-label',T('Закрыть телефон','Close the phone'));}}
function btn(){if($e('phBtn'))return;const cr=$e('crBtn')||$e('btnSet');if(!cr||!cr.parentNode)return;
  const b=document.createElement('button');b.className='hbtn noenter';b.id='phBtn';b.innerHTML=ICO.phone;cr.parentNode.insertBefore(b,cr);
  b.onclick=()=>{if(isOn&&nav.length===1)close();else open();};}

/* вкладка «Телефон» в «Карьере» (PHONE.autoTab=false — выключить) */
function tabSetup(){if(!window.UI||!Array.isArray(UI.TAB_DEF)||UI.TAB_DEF.some(t=>t.id==='phone'))return;
  // вторая после «Сегодня» (Biz-UI), иначе первая
  UI.TAB_DEF.splice(UI.TAB_DEF.findIndex(t=>t.id==='today')+1,0,{id:'phone',ico:ICO.phone,ru:'Телефон',en:'Phone',show:()=>{if(!PHONE.autoTab||st()!=='gig')return false;
    let n=0;for(const t of UI.TAB_DEF)if(t.id!=='phone'){try{if(!t.show||t.show())n++;}catch(e){n++;}}return n<=4;}});
  try{UI.buildNav();}catch(e){}
  // кнопка вкладки открывает телефон поверх экрана (Biz-UI в ранних главах возвращает чужие экраны на «Сегодня»)
  const nv=$e('nav');const hook=()=>{const t=nv&&nv.querySelector('[data-tab="phone"]');if(t&&!t.__ph){t.__ph=1;t.onclick=()=>{if(isOn){snd('tap');close();}else open();};}navHL();};
  hook();if(nv)try{new MutationObserver(hook).observe(nv,{childList:true});}catch(e){}}

/* ---------------- «Назад» и Esc ---------------- */
document.addEventListener('backbutton',e=>{if(!mOn()&&isOn){back();e.stopImmediatePropagation();e.preventDefault&&e.preventDefault();}},true);
document.addEventListener('keydown',e=>{if(e.key!=='Escape'||mOn()||!isOn)return;back();e.stopImmediatePropagation();e.preventDefault();},true);
function wrapBack(){const ob=window.__back;if(ob&&ob.__ph)return;const f=function(){if(!mOn()&&isOn){back();return true;}return typeof ob==='function'?ob.apply(this,arguments):false;};f.__ph=1;window.__back=f;}

/* ---------------- опрос ---------------- */
let lastT=-1;
function poll(){const w=W();if(!w)return;try{P();if(w.t!==lastT){lastT=w.t;service();remind();}}catch(e){console.error(e);}
  badge();if(isOn){const n=nav[nav.length-1];if(n.v!=='call')render(true);}renderEmbed();}
function start(){ensure();btn();tabSetup();wrapBack();
  if(window.GAME&&GAME.on){GAME.on('day',poll);GAME.on('change',poll);GAME.on('close',poll);GAME.on('offline',poll);GAME.on('ipo',()=>{lastT=-1;poll();});GAME.on('reset',()=>{lastT=-1;close();poll();});}
  const ur=window.uiRefresh;window.uiRefresh=function(){if(typeof ur==='function')try{ur.apply(this,arguments);}catch(e){console.error(e);}labels();try{UI.buildNav();}catch(e){}rerender();};
  const oc=window.onCloud;window.onCloud=function(){if(typeof oc==='function')try{oc.apply(this,arguments);}catch(e){console.error(e);}lastT=-1;setTimeout(poll,50);};
  window.addEventListener('resize',()=>{place();});
  setInterval(()=>{try{pushTick();}catch(e){console.error(e);}wrapBack();},1000);
  poll();}

window.PHONE={open:(v,a)=>open(v,a),close,back,render:el=>renderEmbed(el),unread:unreadAll,
  say:(id,ru,e2,acts,o)=>say(id,ru,e2,acts,o),push:(id,text,o)=>push(id,text,o||{imp:true}),poll,autoTab:true,
  get isOpen(){return isOn;},_cal:cal,_state:()=>S.ph};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
