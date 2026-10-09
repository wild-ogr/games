/* Праздничные и сезонные наборы вопросов «Дворовой викторины» — ДАННЫЕ (хозяин — поток FEST, буст 09.10.2026).
   Грузится сразу ПОСЛЕ js/topics.js (договор CONTENT: VTOP.addSeason). Вопросы — data/raw/<ключ>.jsonl → build.py → js/questions.js и js/q/<ключ>.js.
   Каждый набор виден КАЖДЫЙ год в своё окно дат (включительно, по местному времени игрока; окно может переходить через Новый год).
   Вне окна набор скрыт, его вопросы нигде не берутся. Номера id не меняются никогда («уже видел»).

   ДОГОВОР FEST (для UX, CAR, BOARD, YARD) — дополняет window.VTOP:
     VTOP.festNow(ms)    → [набор…] открытые сейчас наборы по важности: сначала праздники (kind 'hol', по prio), потом сезон ('sea').
                           набор = {k, ic, n, sh, from, to, kind, prio, peak:['ММ-ДД',…], fest:'hw', txt, plat?}
     VTOP.festTop(ms)    → главный открытый набор (первый из festNow) или null — для полки/баннера «Праздник».
     VTOP.festDay(ms)    → ключ ПРАЗДНИЧНОГО набора (kind 'hol'), который сейчас открыт, или null — «тема дня/недели = праздничная» (03 §3.3).
     VTOP.festPeak(k,ms) → сегодня главный день праздника (peak) — «табло дня» в праздник целиком из этого набора.
     VTOP.festLeft(k,ms) → сколько дней набор ещё виден, включая сегодня (последний день → 1; закрыт → 0).
     VTOP.festTill(k,ms) → 'до 02.11' — подпись плитки.
     VTOP.festId(k,ms)   → id праздника в общем модуле FEST ('hw26', 'ny27'…) для FEST.use/STAT, или ''.
     VTOP.isOpen / seasonNow — те же, но учитывают площадку (pob — только VK/ОК) и «плавающее» окно Масленицы.
   Подмена даты для проверки: ?date=ГГГГ-ММ-ДД (только localhost/LAN/file:) — сдвигает nowMs() игры (window.DATE_SHIFT), а с ним VTOP и FEST.
*/
(function(){
  // ---- ?date=ГГГГ-ММ-ДД: только на маке/в домашней сети (как ?paytest) ----
  try{const h=location.hostname||'',m=/[?&]date=(\d{4})-(\d\d)-(\d\d)/.exec(location.search);
    if(m&&(/^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|)$|\.local$|^(192\.168\.|10\.)/.test(h)||location.protocol==='file:')){
      const n=new Date(),t=new Date(+m[1],+m[2]-1,+m[3],n.getHours(),n.getMinutes(),n.getSeconds());window.DATE_SHIFT=t.getTime()-n.getTime();}}catch(e){}
  const V=window.VTOP;if(!V||!V.addSeason)return;
  // kind: 'hol' — праздник (тема дня/недели, баннер), 'sea' — сезон (только полка). prio — чем меньше, тем главнее при пересечении.
  // peak — главные дни (табло дня целиком из набора). fest — база id праздника в модуле FEST (+ две цифры года), '' — нет такого.
  // ya — название на Яндексе, если другое; plat — 'vk,ok' — только эти площадки.
  const F=[
    {k:'hw',ic:'🎃',n:'Страшилки у подъезда',sh:'Страшилки',from:'10-24',to:'11-02',kind:'hol',prio:1,peak:['10-31'],fest:'hw',ya:'Осенний вечер у подъезда',yash:'Осенний вечер',txt:'Сказочная нечисть, совы и страшилки после отбоя'},
    {k:'nar',ic:'🤝',n:'4 ноября: народы России',sh:'Народы России',from:'11-03',to:'11-08',kind:'hol',prio:2,peak:['11-04'],fest:'vyh',txt:'Кухня, костюмы, сказания и песни народов страны'},
    {k:'mama',ic:'💐',n:'Мамин день',sh:'Мамин день',from:'11-26',to:'11-29',kind:'hol',prio:2,peak:['11-29'],fest:'mam',txt:'Мамы в книгах и мультфильмах, мамины пироги'},
    {k:'ny',ic:'🎄',n:'Новогодний двор',sh:'Новый год',from:'12-15',to:'01-12',kind:'hol',prio:1,peak:['12-31','01-01','01-07'],fest:'ny',txt:'Ёлка, оливье, куранты, фильмы под Новый год и Рождество'},
    {k:'sny',ic:'❄️',n:'Старый Новый год',sh:'Старый Новый год',from:'01-12',to:'01-19',kind:'hol',prio:1,peak:['01-13','01-14'],fest:'sng',txt:'Почему Новый год два раза, святки и трескучие морозы'},
    {k:'lub',ic:'💌',n:'Про любовь',sh:'Про любовь',from:'02-12',to:'02-14',kind:'hol',prio:2,peak:['02-14'],fest:'lub',txt:'Любовь в кино и книгах, свадебные обычаи'},
    {k:'feb',ic:'🛡️',n:'23 февраля: мастера и богатыри',sh:'23 февраля',from:'02-16',to:'02-24',kind:'hol',prio:1,peak:['02-23'],fest:'bog',ya:'День богатырей',yash:'Богатыри',txt:'Богатыри, мастера, гараж и рыбалка'},
    {k:'msl',ic:'🥞',n:'Масленица',sh:'Масленица',from:'02-15',to:'03-15',kind:'hol',prio:1,peak:[],fest:'mas',move:'msl',txt:'Блины, проводы зимы, ярмарки и катания'},
    {k:'mar',ic:'🌷',n:'8 Марта',sh:'8 Марта',from:'03-02',to:'03-09',kind:'hol',prio:1,peak:['03-08'],fest:'mar',txt:'Знаменитые женщины, весенние цветы и рукоделие'},
    {k:'smeh',ic:'😄',n:'День смеха',sh:'День смеха',from:'03-30',to:'04-02',kind:'hol',prio:1,peak:['04-01'],fest:'sm',txt:'Весёлые вопросы, юмористы, клоуны и комедии'},
    {k:'kos',ic:'🚀',n:'День космонавтики',sh:'Космос',from:'04-09',to:'04-13',kind:'hol',prio:1,peak:['04-12'],fest:'kos',txt:'Гагарин, «Восток», ракеты и космос в кино'},
    {k:'may',ic:'🌿',n:'Майские: весна и труд',sh:'Майские',from:'04-29',to:'05-05',kind:'hol',prio:2,peak:['05-01'],fest:'may',txt:'Дача, рассада, первомай и весенние птицы'},
    {k:'pob',ic:'🕯️',n:'9 Мая: помним',sh:'9 Мая',from:'05-06',to:'05-10',kind:'hol',prio:1,peak:['05-09'],fest:'',plat:'vk,ok',txt:'Память: даты, памятники, фильмы и песни'},
    {k:'shk',ic:'🔔',n:'1 сентября: снова в школу',sh:'1 сентября',from:'08-25',to:'09-05',kind:'hol',prio:1,peak:['09-01'],fest:'shk',txt:'Линейка, портфель, промокашка и школьная форма'},
    {k:'uch',ic:'🍎',n:'День учителя',sh:'День учителя',from:'10-01',to:'10-06',kind:'hol',prio:1,peak:['10-05'],fest:'uch',txt:'Учителя в кино и книгах, знаменитые педагоги'},
    {k:'leto',ic:'☀️',n:'Лето во дворе',sh:'Лето',from:'06-01',to:'08-31',kind:'sea',prio:5,peak:[],fest:'let',txt:'Каникулы, пионерлагерь, квас из бочки и белые ночи'},
    {k:'osen',ic:'🍂',n:'Осень во дворе',sh:'Осень',from:'09-01',to:'11-30',kind:'sea',prio:5,peak:[],fest:'osen',txt:'Листопад, грибы, заготовки и «на картошку»'},
    {k:'zima',ic:'⛄',n:'Зима во дворе',sh:'Зима',from:'12-01',to:'02-29',kind:'sea',prio:5,peak:[],fest:'zima',fy:'from',txt:'Горки, валенки, снегири и хоккей во дворе'},
    {k:'vesna',ic:'🌱',n:'Весна во дворе',sh:'Весна',from:'03-01',to:'05-31',kind:'sea',prio:5,peak:[],fest:'ves',txt:'Капель, грачи, ледоход и кораблики в ручьях'}];
  const BY={};F.forEach(t=>{BY[t.k]=t;V.addSeason(t);});
  const now=ms=>ms!=null?ms:(typeof window.nowMs==='function'?window.nowMs():Date.now()+(window.DATE_SHIFT||0));
  const md=d=>(d.getMonth()+1)*100+d.getDate(),mdOf=s=>{const p=s.split('-');return +p[0]*100+ +p[1];};
  const pad=n=>String(n).padStart(2,'0');
  // Пасха (православная): Меёс по юлианскому календарю + 13 дней (1900–2099). Масленица: пн = Пасха − 55 дн., вс = Пасха − 49; виден с субботы перед ней.
  function easter(y){const a=y%4,b=y%7,c=y%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7,m=Math.floor((d+e+114)/31),dd=(d+e+114)%31+1;return new Date(y,m-1,dd+13);}
  function mslWin(y){const e=easter(y);return[new Date(y,e.getMonth(),e.getDate()-57),new Date(y,e.getMonth(),e.getDate()-49)];}
  function day0(ms){const d=new Date(now(ms));return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
  function plat(){try{const ok=/vk_client=ok|[?&]ok=1/.test(location.search);if(ok)return 'ok';return typeof PLAT!=='undefined'?PLAT:'';}catch(e){return '';}}
  function platOk(t){if(!t.plat)return true;const p=plat();return !p||(','+t.plat+',').indexOf(','+p+',')>=0;}
  // [начало, конец] текущего/ближайшего окна набора на дату ms (Date, полночь)
  function win(t,ms){const d=day0(ms),y=d.getFullYear();
    if(t.move==='msl'){const w=mslWin(y);return w;}
    const a=mdOf(t.from),b=mdOf(t.to),mk=(yy,s)=>{const p=s.split('-');let m=+p[0],dd=+p[1];if(m===2&&dd===29&&new Date(yy,1,29).getMonth()!==1)dd=28;return new Date(yy,m-1,dd);};
    if(a<=b)return[mk(y,t.from),mk(y,t.to)];
    return md(d)>=a?[mk(y,t.from),mk(y+1,t.to)]:[mk(y-1,t.from),mk(y,t.to)];}
  function open(t,ms){const d=day0(ms),w=win(t,ms);return d>=w[0]&&d<=w[1]&&platOk(t);}
  const oOpen=V.isOpen;
  V.isOpen=function(k,ms){const t=BY[k];return t?open(t,ms):oOpen(k,ms);};
  // порядок: праздник раньше сезона; в главный день праздника — он первый; дальше prio; дальше тот, что раньше закончится
  V.festNow=ms=>F.filter(t=>open(t,ms)).sort((a,b)=>(a.kind===b.kind?0:a.kind==='hol'?-1:1)||(V.festPeak(b.k,ms)-V.festPeak(a.k,ms))||a.prio-b.prio||V.festLeft(a.k,ms)-V.festLeft(b.k,ms));
  V.festTop=ms=>V.festNow(ms)[0]||null;
  V.seasonNow=V.festTop;
  V.festDay=ms=>{const t=V.festNow(ms).find(x=>x.kind==='hol');return t?t.k:null;};
  V.festPeak=(k,ms)=>{const t=BY[k];if(!t||!open(t,ms))return false;const d=day0(ms);
    if(t.move==='msl'){const w=mslWin(d.getFullYear());return d.getTime()===w[1].getTime();} // Проводы — воскресенье
    return t.peak.indexOf(pad(d.getMonth()+1)+'-'+pad(d.getDate()))>=0;};
  V.festLeft=(k,ms)=>{const t=BY[k];if(!t||!open(t,ms))return 0;return Math.round((win(t,ms)[1]-day0(ms))/864e5)+1;};
  V.festTill=(k,ms)=>{const t=BY[k];if(!t)return '';const e=win(t,ms)[1];return 'до '+pad(e.getDate())+'.'+pad(e.getMonth()+1);};
  V.festId=(k,ms)=>{const t=BY[k];if(!t||!t.fest)return '';const w=win(t,ms);return t.fest+String(w[t.fy==='from'?0:1].getFullYear()%100).padStart(2,'0');};
  V.festName=k=>{const t=BY[k];if(!t)return '';return plat()==='yandex'&&t.ya?t.ya:t.n;};
  V.festSh=k=>{const t=BY[k];if(!t)return '';return plat()==='yandex'&&t.yash?t.yash:t.sh;};
  V.festList=F;
})();
