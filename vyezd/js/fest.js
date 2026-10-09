/* FEST — праздники (общий модуль ~/Projects/hobby-analytics/fest; править только там, сюда — fest-sync.sh js/fest.js). Поток FEST буста Выезда 09.10 */
/*FEST*/
/* ===== FEST v2 (07.10.2026; v2 — use, show d/b, post, метка #f_): праздники во дворе — общий модуль всех игр. Праздники заранее лежат в игре и сами включаются/выключаются по дате =====
   Источник — ~/Projects/hobby-analytics/fest/fest.js (+ fest.css). Правки — только тут, в игры — fest-sync.sh (он же вклеивает CSS). Как встраивать — fest/README.md.
   Даты — по МОСКВЕ (UTC+3, как bd в STAT), часы и пояс телефона не важны (только сами часы: игра может дать now — время сервера).
   Включение: from…to включительно, с 00:00 МСК дня from до 23:59:59 МСК дня to.
   Проверка без ожидания даты (только localhost/LAN/file:// или init({test:true})): ?fest=hw26 (или hw26,ny27; off — всё выкл.), ?festday=2026-12-31.
   Старый синтаксис: только var/function, без стрелок, без ?. и ??, без CSS inset. Без STAT/SOC работает молча. */
var FEST=(function(){
  var VER=2,MSK=108e5,DAY=864e5;
  /* ---------- ТАБЛИЦА ПРАЗДНИКОВ (одна на все игры). Поля:
     id — короткий код (в сохранении и STAT); from/to — 'ГГГГ-ММ-ДД' по Москве, включительно;
     name/en — название (ru/en); ya — название на Яндексе, если другое; ng — своё название для игры {bogatyr:'…'};
     games — '*' или 'slovo,rybak,…' (id как в STAT.init: bogatyr durak gastronom holdem kirpichiki kozel magnat oborona rybak slovo solitaire viktorina vyezd);
     plat — '*' или 'vk,ok,yandex' (ok — VK-игра в Одноклассниках); deco — классы оформления через пробел: night snow garland leaves spring summer;
     kind — 'ev' событие (плашка в меню), 'day' однодневка (плашка), 'deco' только оформление сезона (без плашки и STAT);
     icon, txt — для плашки/окна; pack — будущие ПЛАТНЫЕ наборы/акции {rybak:{…}} (пока null: покупок модуль не делает, только отдаёт поле FEST.pack). ---------- */
  var T=[
    // ---- 2026 ----
    {id:'osen26',from:'2026-09-01',to:'2026-11-14',name:'Осень во дворе',en:'Autumn',games:'slovo,rybak,kirpichiki,vyezd',plat:'*',deco:'leaves',kind:'deco'},
    {id:'hw26',from:'2026-10-26',to:'2026-11-02',name:'Неделя страшилок',ya:'Осенний вечер',ng:{bogatyr:'Кощеева неделя'},en:'Spooky week',games:'slovo,rybak,bogatyr,kirpichiki,viktorina,oborona',plat:'*',deco:'night',kind:'ev',icon:'🌙',txt:'Сказочная нечисть во дворе — особые награды',pack:null},
    {id:'bab26',from:'2026-10-28',to:'2026-10-28',name:'День бабушек и дедушек',en:'Grandparents day',games:'slovo,vyezd,rybak,viktorina',plat:'*',deco:'',kind:'day',icon:'👵',txt:'Подарок от стариков двора',pack:null},
    {id:'vyh26',from:'2026-11-04',to:'2026-11-04',name:'Выходной во дворе',en:'Day off',games:'slovo,vyezd,bogatyr,oborona,rybak',plat:'*',deco:'',kind:'day',icon:'🎁',txt:'Двойной гостинец за вход',pack:null},
    {id:'sin26',from:'2026-11-12',to:'2026-11-12',name:'Синичкин день',en:'Tit day',games:'rybak,viktorina',plat:'*',deco:'',kind:'day',icon:'🐦',txt:'Покорми синиц — получи монетки',pack:null},
    {id:'zima26',from:'2026-11-15',to:'2027-02-28',name:'Зима во дворе',en:'Winter',games:'slovo,rybak,kirpichiki,vyezd',plat:'*',deco:'snow',kind:'deco'},
    {id:'mam26',from:'2026-11-27',to:'2026-11-29',name:'День матери',en:'Mother\'s day',games:'slovo,kirpichiki,viktorina,gastronom',plat:'*',deco:'',kind:'ev',icon:'💐',txt:'Открытка маме — тёплые слова и подарок',pack:null},
    {id:'ny27',from:'2026-12-15',to:'2027-01-14',name:'Новый год во дворе',en:'New Year in the yard',games:'*',plat:'*',deco:'snow garland',kind:'ev',icon:'🎄',txt:'Ёлка, снег и подарки каждый день',pack:null},
    {id:'kan27',from:'2026-12-25',to:'2027-01-10',name:'Каникулы во дворе',en:'Winter holidays',games:'*',plat:'*',deco:'',kind:'ev',icon:'⛄',txt:'Главные подарки года',pack:null},
    // ---- 2027 ----
    {id:'sng27',from:'2027-01-13',to:'2027-01-14',name:'Старый Новый год',en:'Old New Year',games:'*',plat:'*',deco:'',kind:'day',icon:'🎁',txt:'Последний большой подарок',pack:null},
    {id:'mor27',from:'2027-01-17',to:'2027-01-19',name:'Трескучие морозы',en:'Deep frost',games:'rybak,kirpichiki',plat:'*',deco:'snow',kind:'ev',icon:'❄️',txt:'Мороз крепчает — клёв и награды ×2',pack:null},
    {id:'stu27',from:'2027-01-23',to:'2027-01-25',name:'День студента',en:'Students day',games:'viktorina,slovo,kirpichiki',plat:'*',deco:'',kind:'ev',icon:'🎓',txt:'Сдай экзамен — получи значок',pack:null},
    {id:'lub27',from:'2027-02-12',to:'2027-02-14',name:'День всех влюблённых',en:'Valentine\'s day',games:'slovo,kirpichiki,solitaire,viktorina,gastronom',plat:'*',deco:'',kind:'ev',icon:'💌',txt:'Сердечки и тёплые слова',pack:null},
    {id:'bog27',from:'2027-02-21',to:'2027-02-23',name:'День богатырей',en:'Heroes day',games:'bogatyr,oborona,durak,kozel,rybak,viktorina',plat:'*',deco:'',kind:'ev',icon:'🛡️',txt:'Богатырская застава — тройная награда',pack:null},
    {id:'ves27',from:'2027-03-01',to:'2027-05-31',name:'Весна во дворе',en:'Spring',games:'slovo,rybak,kirpichiki,vyezd',plat:'*',deco:'spring',kind:'deco'},
    {id:'mar27',from:'2027-03-06',to:'2027-03-08',name:'8 Марта',en:'Women\'s day',games:'slovo,kirpichiki,viktorina,gastronom,vyezd,solitaire',plat:'*',deco:'',kind:'ev',icon:'🌼',txt:'Цветы для бабы Зины и всех-всех',pack:null},
    {id:'mas27',from:'2027-03-08',to:'2027-03-14',name:'Масленица',en:'Pancake week',games:'bogatyr,oborona,rybak,gastronom,viktorina',plat:'*',deco:'',kind:'ev',icon:'🥞',txt:'Блины и проводы зимы',pack:null},
    {id:'sm27',from:'2027-04-01',to:'2027-04-01',name:'День смеха',en:'April fools',games:'*',plat:'*',deco:'',kind:'day',icon:'😄',txt:'Весь двор шутит',pack:null},
    {id:'kos27',from:'2027-04-10',to:'2027-04-12',name:'День космонавтики',en:'Cosmonautics day',games:'viktorina,kirpichiki,vyezd,gastronom,slovo',plat:'*',deco:'',kind:'ev',icon:'🚀',txt:'Космический день',pack:null},
    {id:'may27',from:'2027-05-01',to:'2027-05-10',name:'Майские во дворе',en:'May holidays',games:'rybak,kirpichiki,gastronom,viktorina,vyezd,slovo',plat:'*',deco:'',kind:'ev',icon:'🌷',txt:'Дача, рассада, весенний клёв',pack:null},
    {id:'let27',from:'2027-06-01',to:'2027-08-31',name:'Лето во дворе',en:'Summer',games:'slovo,rybak,kirpichiki,vyezd',plat:'*',deco:'summer',kind:'deco'},
    {id:'det27',from:'2027-06-01',to:'2027-06-03',name:'Начало лета',en:'Summer begins',games:'viktorina,kirpichiki,rybak',plat:'*',deco:'',kind:'ev',icon:'☀️',txt:'Детство во дворе',pack:null},
    {id:'ryb27',from:'2027-07-05',to:'2027-07-11',name:'Рыбацкая неделя',en:'Fishing week',games:'rybak,viktorina,slovo',plat:'*',deco:'',kind:'ev',icon:'🎣',txt:'Неделя с Петровичем, Царь-сом',pack:null},
    {id:'kup27',from:'2027-07-05',to:'2027-07-07',name:'Купальская ночь',en:'Midsummer night',games:'bogatyr,oborona,rybak,slovo,viktorina',plat:'*',deco:'',kind:'ev',icon:'🔥',txt:'Светлячки и летняя ночь',pack:null},
    {id:'sem27',from:'2027-07-08',to:'2027-07-08',name:'День семьи',en:'Family day',games:'slovo,kirpichiki,gastronom,viktorina',plat:'*',deco:'',kind:'day',icon:'🌼',txt:'Ромашки для всей семьи',pack:null},
    {id:'trg27',from:'2027-07-23',to:'2027-07-25',name:'День торговли',en:'Trade day',games:'gastronom,magnat',plat:'*',deco:'',kind:'ev',icon:'🛒',txt:'Передовик торговли',pack:null},
    {id:'str27',from:'2027-08-07',to:'2027-08-08',name:'День строителя',en:'Builders day',games:'kirpichiki,vyezd',plat:'*',deco:'',kind:'ev',icon:'🧱',txt:'Стройка во дворе',pack:null},
    {id:'urj27',from:'2027-08-15',to:'2027-09-15',name:'Сбор урожая',en:'Harvest',games:'gastronom,rybak,kirpichiki,viktorina',plat:'*',deco:'',kind:'ev',icon:'🍎',txt:'Яблоки, варенье, осенний клёв',pack:null},
    {id:'shk27',from:'2027-08-30',to:'2027-09-01',name:'День знаний',en:'Back to school',games:'viktorina,slovo,kirpichiki',plat:'*',deco:'',kind:'ev',icon:'📚',txt:'Школа нашего детства',pack:null},
    {id:'osen27',from:'2027-09-01',to:'2027-11-14',name:'Осень во дворе',en:'Autumn',games:'slovo,rybak,kirpichiki,vyezd',plat:'*',deco:'leaves',kind:'deco'},
    {id:'poz27',from:'2027-10-01',to:'2027-10-03',name:'День пожилых людей',en:'Elders day',games:'slovo,vyezd,rybak,gastronom,viktorina',plat:'*',deco:'',kind:'ev',icon:'🎂',txt:'Баба Зина — именинница двора',pack:null},
    {id:'uch27',from:'2027-10-04',to:'2027-10-05',name:'День учителя',en:'Teachers day',games:'viktorina,slovo',plat:'*',deco:'',kind:'ev',icon:'🍎',txt:'Экзамен у Марьи Ивановны',pack:null},
    {id:'hw27',from:'2027-10-25',to:'2027-11-01',name:'Неделя страшилок',ya:'Осенний вечер',ng:{bogatyr:'Кощеева неделя'},en:'Spooky week',games:'slovo,rybak,bogatyr,kirpichiki,viktorina,oborona',plat:'*',deco:'night',kind:'ev',icon:'🌙',txt:'Сказочная нечисть во дворе — особые награды',pack:null},
    {id:'bab27',from:'2027-10-28',to:'2027-10-28',name:'День бабушек и дедушек',en:'Grandparents day',games:'slovo,vyezd,rybak,viktorina',plat:'*',deco:'',kind:'day',icon:'👵',txt:'Подарок от стариков двора',pack:null},
    {id:'vyh27',from:'2027-11-04',to:'2027-11-07',name:'Длинные выходные',en:'Long weekend',games:'slovo,vyezd,bogatyr,oborona,rybak',plat:'*',deco:'',kind:'ev',icon:'🎁',txt:'Двойной гостинец все четыре дня',pack:null},
    {id:'sin27',from:'2027-11-12',to:'2027-11-12',name:'Синичкин день',en:'Tit day',games:'rybak,viktorina',plat:'*',deco:'',kind:'day',icon:'🐦',txt:'Покорми синиц — получи монетки',pack:null},
    {id:'zima27',from:'2027-11-15',to:'2028-02-29',name:'Зима во дворе',en:'Winter',games:'slovo,rybak,kirpichiki,vyezd',plat:'*',deco:'snow',kind:'deco'},
    {id:'mam27',from:'2027-11-26',to:'2027-11-28',name:'День матери',en:'Mother\'s day',games:'slovo,kirpichiki,viktorina,gastronom',plat:'*',deco:'',kind:'ev',icon:'💐',txt:'Открытка маме — тёплые слова и подарок',pack:null},
    {id:'ny28',from:'2027-12-15',to:'2028-01-14',name:'Новый год во дворе',en:'New Year in the yard',games:'*',plat:'*',deco:'snow garland',kind:'ev',icon:'🎄',txt:'Ёлка, снег и подарки каждый день',pack:null},
    {id:'kan28',from:'2027-12-25',to:'2028-01-09',/* каникулы 2028 — сверить с производственным календарём */name:'Каникулы во дворе',en:'Winter holidays',games:'*',plat:'*',deco:'',kind:'ev',icon:'⛄',txt:'Главные подарки года',pack:null},
    {id:'sng28',from:'2028-01-13',to:'2028-01-14',name:'Старый Новый год',en:'Old New Year',games:'*',plat:'*',deco:'',kind:'day',icon:'🎁',txt:'Последний большой подарок',pack:null}
  ];
  var CSS="#festFx{position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:9000;overflow:hidden}#festFx canvas{position:absolute;left:0;top:0;width:100%;height:100%;opacity:.85}#festFx .fest-nv{position:absolute;left:0;top:0;right:0;bottom:0;display:none;background:radial-gradient(ellipse at 50% 45%,rgba(20,14,40,0) 55%,rgba(20,14,40,.38) 100%)}body.fest-night #festFx .fest-nv{display:block}body.fest-night{--fest-bg:#2a2340;--fest-ink:#f3e9d2;--fest-acc:#f0a64a}body.fest-snow{--fest-bg:#e9f2fa;--fest-ink:#1d3550;--fest-acc:#3d8fd6}body.fest-leaves{--fest-bg:#f6ead6;--fest-ink:#4a2c12;--fest-acc:#d9772b}#festFx .fest-gl{position:absolute;left:0;right:0;top:0;top:env(safe-area-inset-top,0px);height:16px;display:none;background:radial-gradient(circle at 12px 9px,#ff5a5a 0,#ff5a5a 3px,rgba(255,90,90,.35) 4px,rgba(0,0,0,0) 6px),radial-gradient(circle at 36px 9px,#ffd23f 0,#ffd23f 3px,rgba(255,210,63,.35) 4px,rgba(0,0,0,0) 6px),radial-gradient(circle at 60px 9px,#4cd97b 0,#4cd97b 3px,rgba(76,217,123,.35) 4px,rgba(0,0,0,0) 6px),radial-gradient(circle at 84px 9px,#5aaaff 0,#5aaaff 3px,rgba(90,170,255,.35) 4px,rgba(0,0,0,0) 6px),linear-gradient(rgba(0,0,0,0) 3px,rgba(60,60,60,.45) 3px,rgba(60,60,60,.45) 4px,rgba(0,0,0,0) 4px);background-size:96px 16px;background-repeat:repeat-x}#festFx .fest-gl:after{content:'';position:absolute;left:0;right:0;top:0;bottom:0;opacity:0;animation:festBlink 2.4s steps(2,end) infinite;background:radial-gradient(circle at 12px 9px,rgba(255,240,200,.95) 0,rgba(255,240,200,.95) 2px,rgba(255,240,200,0) 7px),radial-gradient(circle at 60px 9px,rgba(255,240,200,.95) 0,rgba(255,240,200,.95) 2px,rgba(255,240,200,0) 7px);background-size:96px 16px;background-repeat:repeat-x}body.fest-garland #festFx .fest-gl{display:block}@keyframes festBlink{0%{opacity:0}50%{opacity:.9}100%{opacity:0}}body.fest-fxoff #festFx canvas{display:none}body.fest-fxoff #festFx .fest-gl:after,body.lite #festFx .fest-gl:after{animation:none;display:none}@media (prefers-reduced-motion:reduce){#festFx .fest-gl:after{animation:none;display:none}#festFx canvas{display:none}}.fest-card{display:flex;align-items:center;width:100%;box-sizing:border-box;margin:8px 0;padding:10px 12px;border:0;border-radius:14px;background:linear-gradient(135deg,#ffe7b3,#ffc66b);color:#4a2c12;font:inherit;font-size:15px;text-align:left;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.15)}.fest-card .fest-i{font-size:26px;margin-right:10px;line-height:1}.fest-card .fest-t{flex:1;min-width:0}.fest-card b{display:block;font-size:16px}.fest-card small{display:block;opacity:.8;font-size:13px}.fest-card .fest-a{font-size:20px;margin-left:8px;opacity:.6}body.fest-night .fest-card{background:linear-gradient(135deg,#4b3b78,#2a2340);color:#f3e9d2}body.fest-snow .fest-card{background:linear-gradient(135deg,#e3f1ff,#b8dbff);color:#1d3550}body.lite .fest-card{box-shadow:none;background:#ffd68a}body.lite.fest-night .fest-card{background:#3a2f5e}body.lite.fest-snow .fest-card{background:#cfe6ff}.fest-box{position:fixed;left:0;top:0;right:0;bottom:0;z-index:9500;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}.fest-win{background:#fff8ec;color:#3a2a18;border-radius:16px;max-width:360px;width:100%;max-height:90%;overflow:auto;padding:16px;box-sizing:border-box;font-size:15px}.fest-win h2{margin:0 0 10px;font-size:20px}.fest-row{padding:8px 0;border-top:1px solid rgba(0,0,0,.08)}.fest-row:first-of-type{border-top:0}.fest-row b{display:block}.fest-row small{opacity:.75}.fest-win .fest-x{display:block;width:100%;margin-top:12px;padding:10px;border:0;border-radius:12px;background:#ffc66b;color:#3a2a18;font:inherit;cursor:pointer}"; // сюда fest-sync.sh вклеивает fest.css строкой
  var O={},S0=null,st={},G='',P='',LANGx='ru',forced=null,fday=0,test=false,shown={},hsV='',hsDone=0,lastDay=0,timer=0,fxOn=true,cv=null,cx=null,parts=[],raf=0,fr=0,curDeco='';

  function qp(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);try{return m?decodeURIComponent(m[1]):'';}catch(e){return '';}}
  function locH(h){return /^(localhost|127\.\d+\.\d+\.\d+|\[::1\]|0\.0\.0\.0|)$|\.localhost$|\.local$|\.test$|^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(String(h||''));}
  function nowMs(){var t=0;try{t=O.now?O.now():0;}catch(e){}return typeof t==='number'&&t>1.6e12?t:Date.now();}
  function key(s){var m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(String(s||''));return m?(+m[1])*1e4+(+m[2])*100+(+m[3]):0;}
  function kms(k){return Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100);}
  function today(){if(fday)return fday;var d=new Date(nowMs()+MSK);return d.getUTCFullYear()*1e4+(d.getUTCMonth()+1)*100+d.getUTCDate();} // день по Москве
  function ks(k){var s=String(k);return s.slice(0,4)+'-'+s.slice(4,6)+'-'+s.slice(6,8);}
  function has(list,x){return list==='*'||(','+list+',').indexOf(','+x+',')>=0;}
  function get(id){for(var i=0;i<T.length;i++)if(T[i].id===id)return T[i];return null;}
  function mine(r){return has(r.games,G)&&has(r.plat,P);}
  function live(r,d){return key(r.from)<=d&&d<=key(r.to);}
  function isF(id){return !!forced&&forced[id]===1;}
  // идёт ли праздник в этой игре и на этой площадке (или включён ?fest=)
  function on(id){var r=get(id);if(!r)return false;if(forced)return isF(id);return mine(r)&&live(r,today());}
  function list(all){var a=[],i,r;for(i=0;i<T.length;i++){r=T[i];if(on(r.id)&&(all||r.kind!=='deco'))a.push(r);}return a;}
  // сколько дней осталось, включая сегодня (последний день → 1); не идёт → 0
  function left(id){var r=get(id);if(!r||!on(id))return 0;return Math.max(1,Math.round((kms(key(r.to))-kms(today()))/DAY)+1);}
  function dayN(id){var r=get(id);if(!r||!on(id))return 0;return Math.max(1,Math.round((kms(today())-kms(key(r.from)))/DAY)+1);} // какой по счёту день (адвент)
  function name(id){var r=typeof id==='object'?id:get(id);if(!r)return '';if(LANGx==='en')return r.en||r.name;
    if(r.ng&&r.ng[G])return r.ng[G];if(P==='yandex'&&r.ya)return r.ya;return r.name;}
  function deco(){var a=list(true),c={},i,j,w,o=[];for(i=0;i<a.length;i++){w=String(a[i].deco||'').split(' ');for(j=0;j<w.length;j++)if(w[j]&&!c[w[j]]){c[w[j]]=1;o.push('fest-'+w[j]);}}return o.join(' ');}
  function vis(x){return !x||!x.fest||on(x.fest);}                      // контент с пометкой fest:'hw26' виден только в праздник
  function ever(id){return !!(st[id]&&st[id].s)||on(id);}               // праздник хоть раз застали (для «остаётся навсегда»)
  function pack(id){var r=get(id);return r&&r.pack?(r.pack[G]||r.pack['*']||null):null;}
  function sx(a,id,k,x){try{if(typeof STAT!=='undefined'&&STAT&&STAT.ev){var p={e:id,a:a},j;if(k)p.k=k;if(x)for(j in x)if(x.hasOwnProperty(j))p[j]=x[j];STAT.ev('fest',p);}}catch(e){}}
  function save(){try{if(O.save)O.save();}catch(e){}}
  // награда события: got — уже выдана? give — выдать один раз (true — выдали сейчас; false — уже была/нет такого праздника)
  function got(id,k){var x=st[id];return !!(x&&x.g&&x.g[k||'main']);}
  function give(id,k){k=String(k||'main');if(!get(id)||got(id,k))return false;var x=st[id]||(st[id]={});if(!x.g)x.g={};x.g[k]=1;x.s=1;save();sx('give',id,k);return true;}
  // С1: игрок дошёл до праздничного контента (сыграл особый уровень, поймал праздничную рыбу) — FEST.use('hw26','som').
  // В STAT fest {a:'use',k} не чаще раза в МСК-день на пару (id,k); праздник не идёт — молчит. true — событие ушло сейчас.
  function use(id,k){if(!on(id))return false;k=String(k||'main').replace(/[^\w-]/g,'').slice(0,24)||'main';var x=st[id]||(st[id]={}),d=today();
    if(!x.u||typeof x.u!=='object')x.u={};if(x.u[k]===d)return false;x.u[k]=d;x.s=1;save();sx('use',id,k);return true;}
  // С2b: 14 дней после конца праздника — раз в МСК-день fest {a:'post',g:1/0,d:<день после конца>} у тех, кто его застал (g:1 — получил main)
  function post(){if(forced)return;var d=today(),i,r,n,x;for(i=0;i<T.length;i++){r=T[i];if(r.kind==='deco'||!mine(r))continue;x=st[r.id];
      if(!x||!x.s||d<=key(r.to))continue;n=Math.round((kms(d)-kms(key(r.to)))/DAY);if(n<1||n>14||x.p===d)continue;
      x.p=d;save();sx('post',r.id,'',{g:x.g&&x.g.main?1:0,d:n});}}
  // С3: метка захода из нашего поста/уведомления — хвост ссылки vk.com/app<ID>#f_<id>_<канал> (VK кладёт его в location.hash, иные клиенты — в ?hash=).
  // Раз за сеанс fest {e:id,a:'in',k:канал}; FEST.hs() — сама метка ('f_hw26_post') или ''. Только латиница/цифры, ≤24 знаков — без личных данных.
  function hs(){var h='',m,w,i;try{h=String(location.hash||'').replace(/^#/,'');if(!/(^|[&?])f_/.test(h)){m=/[?&]hash=([^&]*)/.exec(location.search);h=m?decodeURIComponent(m[1]):'';}}catch(e){h='';}
    w=h.replace(/^#/,'').split(/[&?#]/);for(i=0;i<w.length;i++)if(/^f_[a-z0-9]{2,8}_[a-z0-9_]{1,13}$/.test(w[i])&&w[i].length<=24)return w[i];return '';}
  function hsIn(){if(hsDone)return;hsDone=1;hsV=hs();if(!hsV)return;var m=/^f_([a-z0-9]+)_(.+)$/.exec(hsV);if(m&&get(m[1]))sx('in',m[1],m[2]);}
  // облако: из слияния сохранений игры — FEST.merge(d.fest): «застали» и выданные награды — навсегда (объединение)
  function merge(d){if(!d||typeof d!=='object')return;var id,k,a,b;
    for(id in d){if(!d.hasOwnProperty(id))continue;b=d[id];if(!b||typeof b!=='object')continue;a=st[id]||(st[id]={});
      if(b.s)a.s=1;if(b.g&&typeof b.g==='object'){if(!a.g)a.g={};for(k in b.g)if(b.g.hasOwnProperty(k)&&b.g[k])a.g[k]=1;}
      if(b.u&&typeof b.u==='object'){if(!a.u||typeof a.u!=='object')a.u={};for(k in b.u)if(b.u.hasOwnProperty(k)&&+b.u[k]>(+a.u[k]||0))a.u[k]=+b.u[k];}
      if(+b.p>(+a.p||0))a.p=+b.p;}}

  /* ---------- оформление на <body> + лёгкие частицы (снег/листья) ---------- */
  function low(){var b=document.body;try{if(O.low&&O.low())return true;}catch(e){}
    if(b&&b.classList.contains('lite'))return true;if(/[?&]lite=1/.test(location.search))return true;
    try{if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return true;}catch(e){}
    var n=navigator||{};if((n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2))return true;return false;}
  function css(){if(!CSS||document.getElementById('festCss'))return;var s=document.createElement('style');s.id='festCss';s.textContent=CSS;(document.head||document.body).appendChild(s);}
  function layer(){var f=document.getElementById('festFx');if(f)return f;f=document.createElement('div');f.id='festFx';f.setAttribute('aria-hidden','true');
    f.innerHTML='<div class="fest-nv"></div><div class="fest-gl"></div>';document.body.appendChild(f);return f;}
  function apply(){var b=document.body;if(!b)return '';css();var d=O.deco===false?'':deco(),a=list(true),want={},i,c,cl=[];
    if(a.length&&O.deco!==false){want['fest-on']=1;for(i=0;i<a.length;i++)want['fest-'+a[i].id]=1;}
    if(d){c=d.split(' ');for(i=0;i<c.length;i++)want[c[i]]=1;if(low())want['fest-fxoff']=1;}
    for(i=0;i<b.classList.length;i++)cl.push(b.classList[i]);          // классы игры не трогаем — только свои fest-*
    for(i=0;i<cl.length;i++)if(cl[i].indexOf('fest-')===0&&!want[cl[i]])b.classList.remove(cl[i]);
    for(c in want)if(want.hasOwnProperty(c)&&!b.classList.contains(c))b.classList.add(c);curDeco=d;
    if(d)layer();parts_(d);
    // С2: в show — d (какой день праздника) и b:1, если праздник застали ДО этого сеанса (флаг s стоял раньше)
    var x,was;for(i=0;i<a.length;i++){x=st[a[i].id]||(st[a[i].id]={});was=!!x.s;if(!was){x.s=1;save();}
      if(a[i].kind!=='deco'&&!shown[a[i].id]){shown[a[i].id]=was?2:1;sx('show',a[i].id,'',was?{d:dayN(a[i].id),b:1}:{d:dayN(a[i].id)});}}
    post();return d;}
  function parts_(d){var want=fxOn&&/fest-(snow|leaves)/.test(d)&&!low();
    if(!want){if(cv){cancelAnimationFrame(raf);raf=0;if(cv.parentNode)cv.parentNode.removeChild(cv);cv=null;cx=null;}return;}
    var lv=d.indexOf('fest-leaves')>=0&&d.indexOf('fest-snow')<0;
    if(!cv){cv=document.createElement('canvas');cx=cv.getContext&&cv.getContext('2d');if(!cx){cv=null;return;}layer().appendChild(cv);size();parts=[];}
    var w=cv.width,h=cv.height,n=Math.round(Math.min(lv?10:26,w*h/(lv?60000:22000)))||4,i;
    if(parts.length!==n||parts.lv!==lv){parts=[];parts.lv=lv;for(i=0;i<n;i++)parts.push(mk(lv,w,h,true));}
    if(!raf)raf=requestAnimationFrame(step);}
  function mk(lv,w,h,any){return {x:Math.random()*w,y:any?Math.random()*h:-10,r:lv?4+Math.random()*3:1.2+Math.random()*2.2,
    v:lv?.5+Math.random()*.5:.35+Math.random()*.6,s:Math.random()*6.28,c:lv?['#d9772b','#e8a33d','#b5532a'][Math.floor(Math.random()*3)]:'rgba(255,255,255,.9)'};}
  function size(){if(!cv)return;var r=Math.min(window.devicePixelRatio||1,1.5);cv.width=Math.round((window.innerWidth||300)*r);cv.height=Math.round((window.innerHeight||300)*r);}
  function step(){raf=0;if(!cv)return;fr++;
    if(fr%120===0&&low()){apply();return;}                              // включили «мало эффектов» — гасим
    if(!document.hidden&&fr%2===0){var w=cv.width,h=cv.height,i,p,lv=parts.lv,k=w/(window.innerWidth||w);cx.clearRect(0,0,w,h);
      for(i=0;i<parts.length;i++){p=parts[i];p.y+=p.v*2*k;p.s+=.03;p.x+=Math.sin(p.s)*.6*k;if(p.y>h+10){parts[i]=mk(lv,w,h,false);continue;}
        cx.fillStyle=p.c;cx.beginPath();if(lv&&cx.ellipse)cx.ellipse(p.x,p.y,p.r*k,p.r*.55*k,p.s,0,6.28);else cx.arc(p.x,p.y,p.r*k,0,6.28);cx.fill();}}
    raf=requestAnimationFrame(step);}
  // игра может спрятать частицы на время боя/уровня: FEST.fx(false) — и вернуть FEST.fx(true)
  function fx(v){fxOn=v!==false;parts_(curDeco);return fxOn;}
  function tick(){var d=today();if(d!==lastDay){lastDay=d;apply();try{if(O.change)O.change(list());}catch(e){}}}

  /* ---------- плашка «Праздник во дворе» и окно ---------- */
  function tx(ru,en){return LANGx==='en'?en:ru;}
  function dn(n){var a=n%10,b=n%100;return n+' '+(a===1&&b!==11?'день':a>=2&&a<=4&&(b<12||b>14)?'дня':'дней');}
  function lt(id){var n=left(id);return n<=1?tx('последний день','last day'):tx('ещё '+dn(n),n+' days left');}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function card(){var a=list();if(!a.length)return '';css();var r=a[0],i;for(i=1;i<a.length;i++)if(left(a[i].id)<left(r.id))r=a[i]; // самое «горящее»
    return '<button class="fest-card" data-fest="'+r.id+'" type="button"><span class="fest-i">'+(r.icon||'🎉')+'</span><span class="fest-t"><b>'+esc(name(r))+'</b><small>'+
      tx('Праздник во дворе','Holiday in the yard')+' · '+lt(r.id)+(a.length>1?' · +'+(a.length-1):'')+'</small></span><span class="fest-a">›</span></button>';}
  // вставить плашку в контейнер меню (пустой — если праздника нет); по нажатию — окно
  function mount(el){if(!el)return false;var h=card();el.innerHTML=h;var b=el.querySelector('.fest-card');if(b)b.onclick=function(){open();};return !!h;}
  function open(){var a=list(),h='',i,root,box=null;if(!a.length)return false;css();
    for(i=0;i<a.length;i++)h+='<div class="fest-row"><b>'+(a[i].icon||'🎉')+' '+esc(name(a[i]))+'</b><small>'+esc(LANGx==='en'?'':a[i].txt||'')+(LANGx==='en'?'':' · ')+lt(a[i].id)+'</small></div>';
    var head='<h2>'+tx('Праздник во дворе','Holiday in the yard')+'</h2>',foot='<button class="'+(O.cls||'fest-x')+'" id="festClose" type="button">'+tx('Закрыть','Close')+'</button>';
    if(O.modal)root=O.modal(head+'<div class="fest-list">'+h+'</div>'+foot);
    else{box=document.createElement('div');box.className='fest-box';box.id='festBox';box.innerHTML='<div class="fest-win">'+head+'<div class="fest-list">'+h+'</div>'+foot+'</div>';
      document.body.appendChild(box);root=box;box.onclick=function(e){if(e.target===box)close();};}
    function close(){if(box){if(box.parentNode)box.parentNode.removeChild(box);}else if(O.close)O.close();}
    var c=root&&root.querySelector('#festClose');if(c)c.onclick=close;
    for(i=0;i<a.length;i++)sx('open',a[i].id);return true;}

  /* FEST.init(S, {g:'rybak', plat:PLAT, lang:LANG, save, now, low, modal, close, cls, deco, change, test}) — один раз после загрузки сохранения.
     g — id игры как в STAT; plat — 'vk'|'yandex'|… (ОК модуль узнаёт сам по vk_client=ok); save() — сохранить S; now() — часы игры (мс);
     low() — «мало эффектов»; modal(html)/close() — окно игры (как в SOC); deco:false — классы на body не ставить; change(list) — смена дня;
     test:true — разрешить ?fest=/?festday= не на localhost (только тестовые копии!). */
  function init(S,opt){O=opt||{};S0=S||{};if(!S0.fest||typeof S0.fest!=='object')S0.fest={};st=S0.fest;G=String(O.g||'');LANGx=O.lang==='en'?'en':'ru';
    var okp=/[?&](vk_client=ok|vk_platform=[a-z_]*_ok|ok=1)(&|$)/.test(location.search);P=String(O.plat||'');if(P==='vk'&&okp)P='ok';
    test=O.test===true||location.protocol==='file:'||locH(location.hostname);forced=null;fday=0;
    if(test){var f=qp('fest'),d=key(qp('festday')),i,w;if(f){forced={};w=f.split(',');for(i=0;i<w.length;i++)if(w[i]!=='off')forced[w[i]]=1;}if(d)fday=d;}
    hsIn();lastDay=today();apply();clearInterval(timer);timer=setInterval(tick,60000);
    if(!init.h){init.h=1;document.addEventListener('visibilitychange',function(){if(!document.hidden)tick();});window.addEventListener('resize',function(){size();});}
    return list();}
  return {v:VER,init:init,on:on,list:list,left:left,day:dayN,name:name,deco:deco,apply:apply,got:got,give:give,use:use,hs:function(){return hsDone?hsV:hs();},merge:merge,ever:ever,vis:vis,pack:pack,get:get,
    today:function(){return ks(today());},card:card,mount:mount,open:open,fx:fx,table:function(){return T.slice();},
    _dbg:function(){return {G:G,P:P,forced:forced,fday:fday,test:test,st:st,deco:curDeco,cv:!!cv,parts:parts.length,low:low(),shown:shown,hs:hsV};}};
})();
/*/FEST*/
