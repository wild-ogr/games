/* Темы «Дворовой викторины» — ДАННЫЕ (хозяин — поток CONTENT, буст 09.10). Логики игры здесь нет, только данные и простые функции-справочники.
   ДОГОВОР (UX показывает полки, BOARD берёт темы для табло, CAR/YARD — тему недели/новинку):
   window.VTOP = {
     list:    [{k, ic, n, sh, shelf, from, qn}]   — все 29 обычных тем в порядке показа внутри полки.
              k — ключ (= префикс id вопроса и q.t), ic — эмодзи, n — полное имя, sh — короткое (плитка 320–360 px),
              shelf — ключ полки, from — дата открытия 'ГГГГ-ММ-ДД' (null — открыта всегда), qn — файл вопросов темы (js/q/<k>.js).
     shelves: [{k, n, ic}]                        — 4 полки по порядку.
     seasons: [{k, ic, n, sh, from:'ММ-ДД', to:'ММ-ДД', qn, season:1}] — сезонные/праздничные наборы (данные — поток FEST, js/topics-fest.js,
              через addSeason): видны КАЖДЫЙ год только в окне дат (включительно; окно может переходить через Новый год).
              Вне окна тема скрыта, её вопросы в «Всё подряд»/табло/день не берутся. Номера id сохраняются.
     addSeason(t)    → добавить/заменить сезонный набор (false — битые данные или ключ занят обычной темой)
     T(k)            → объект темы (обычной или сезонной) или null
     isOpen(k, ms)   → открыта ли тема на момент ms (по умолчанию Date.now()); для сезонной — попадает ли дата в окно
     openList(ms)    → ключи открытых обычных тем
     seasonNow(ms)   → сезонная тема, открытая сейчас, или null
     isNew(k, ms)    → тема открылась ≤ 7 дней назад (метка «новое»)
     nextLocked(ms)  → [{k, from}] — закрытые темы по дате открытия (для замка «в пн 26.10»)
     dateTxt(from)   → 'пн 26.10'
   }
   Дата — по местному времени игрока (полночь). Время игры можно подменить: если есть window.nowMs (функция игры) — берём её.
   Вопросы новых и сезонных тем лежат в базе заранее; видимость — только по isOpen (решение владельца 09.10: выпуск по одной теме в понедельник).
*/
(function(){
  const SH=[
    {k:'nost',n:'Ностальгия',ic:'📻'},
    {k:'home',n:'Дом и двор',ic:'🏠'},
    {k:'know',n:'Знания',ic:'📚'},
    {k:'world',n:'Мир и природа',ic:'🌍'}];
  // from: новые темы — по одной в понедельник, начиная с первого понедельника после заливки (~19–20.10) = 26.10.2026; порядок — приоритет 03 §3.1
  const L=[
    // Ностальгия
    {k:'ussr',ic:'📻',n:'СССР и быт',sh:'СССР и быт',shelf:'nost',from:null},
    {k:'vhs',ic:'📼',n:'90-е и нулевые',sh:'90-е',shelf:'nost',from:'2026-10-26'},
    {k:'school',ic:'🎒',n:'Школа и двор',sh:'Школа',shelf:'nost',from:'2026-11-02'},
    {k:'muz',ic:'🎤',n:'Эстрада и песни',sh:'Эстрада',shelf:'nost',from:'2026-11-09'},
    {k:'trad',ic:'🎉',n:'Праздники и традиции',sh:'Праздники',shelf:'nost',from:'2026-11-16'},
    {k:'toys',ic:'🎲',n:'Игры и игрушки',sh:'Игрушки',shelf:'nost',from:'2026-12-07'},
    {k:'kino',ic:'🎬',n:'Кино и мультфильмы',sh:'Кино',shelf:'nost',from:null},
    // Дом и двор
    {k:'kitchen',ic:'🥟',n:'Кухня',sh:'Кухня',shelf:'home',from:null},
    {k:'dacha',ic:'🥕',n:'Дача и огород',sh:'Дача',shelf:'home',from:null},
    {k:'dom',ic:'🔨',n:'Дом и ремонт',sh:'Ремонт',shelf:'home',from:'2026-11-30'},
    {k:'pets',ic:'🐈',n:'Питомцы',sh:'Питомцы',shelf:'home',from:'2026-12-14',off:1},
    {k:'auto',ic:'🚘',n:'Гараж и дорога',sh:'Гараж',shelf:'home',from:'2026-12-21',off:1},
    {k:'moda',ic:'🧵',n:'Мода и шитьё',sh:'Мода',shelf:'home',from:'2027-01-25',off:1},
    {k:'tech',ic:'🚗',n:'Техника',sh:'Техника',shelf:'home',from:null},
    // Знания
    {k:'lang',ic:'📖',n:'Язык и поговорки',sh:'Язык',shelf:'know',from:null},
    {k:'lit',ic:'📚',n:'Книги и сказки',sh:'Книги',shelf:'know',from:null},
    {k:'history',ic:'🏰',n:'История',sh:'История',shelf:'know',from:null},
    {k:'riddle',ic:'🧩',n:'Загадки Михалыча',sh:'Загадки',shelf:'know',from:'2027-01-18',off:1},
    {k:'job',ic:'👷',n:'Профессии',sh:'Профессии',shelf:'know',from:'2027-01-04',off:1},
    {k:'net',ic:'📱',n:'Телефоны и компьютеры',sh:'Компьютеры',shelf:'know',from:'2027-01-11',off:1},
    {k:'art',ic:'🎻',n:'Музыка и искусство',sh:'Искусство',shelf:'know',from:null},
    {k:'sci',ic:'🔬',n:'Наука и человек',sh:'Наука',shelf:'know',from:null},
    {k:'space',ic:'🚀',n:'Космос',sh:'Космос',shelf:'know',from:null},
    // Мир и природа
    {k:'geo',ic:'🗺️',n:'География России',sh:'Россия',shelf:'world',from:null},
    {k:'world',ic:'🌍',n:'Страны мира',sh:'Страны мира',shelf:'world',from:null},
    {k:'nature',ic:'🌲',n:'Природа',sh:'Природа',shelf:'world',from:null},
    {k:'les',ic:'🍄',n:'Лес, грибы, рыбалка',sh:'Лес',shelf:'world',from:'2026-11-23'},
    {k:'trip',ic:'🚆',n:'Отпуск и поезда',sh:'Поезда',shelf:'world',from:'2026-12-28',off:1},
    {k:'sport',ic:'⚽',n:'Спорт',sh:'Спорт',shelf:'world',from:null}];
  // Сезонные/праздничные наборы ведёт поток FEST: файл js/topics-fest.js (грузится ПОСЛЕ topics.js) зовёт VTOP.addSeason({...}).
  // Ключ — только строчные латинские буквы (id вопроса должен подходить под /^[a-z]+-\d+$/), не совпадает с обычными темами.
  // Окно from/to 'ММ-ДД' включительно, каждый год (может переходить через Новый год).
  const SE=[];
  // off:1 — тема скрыта целиком (нет на полках, в «Скоро», в табло): вопросы ещё не готовы (сведение 09.10). Вернуть — убрать off:1, дату from оставить.
  for(let i=L.length-1;i>=0;i--)if(L[i].off)L.splice(i,1);
  L.forEach(t=>t.qn='js/q/'+t.k+'.js');
  const BY={};L.forEach(t=>BY[t.k]=t);
  function addSeason(t){if(!t||!/^[a-z]+$/.test(t.k)||BY[t.k]&&!BY[t.k].season||!/^\d\d-\d\d$/.test(t.from)||!/^\d\d-\d\d$/.test(t.to))return false;
    t.season=1;if(!t.qn)t.qn='js/q/'+t.k+'.js';if(!t.sh)t.sh=t.n;const i=SE.findIndex(x=>x.k===t.k);if(i>=0)SE[i]=t;else SE.push(t);BY[t.k]=t;return true;}
  const now=ms=>ms!=null?ms:(typeof window.nowMs==='function'?window.nowMs():Date.now());
  const day0=s=>{const p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]).getTime();}; // местная полночь
  const md=d=>(d.getMonth()+1)*100+d.getDate();
  const mdOf=s=>{const p=s.split('-');return +p[0]*100+ +p[1];};
  function inWin(t,ms){const x=md(new Date(now(ms))),a=mdOf(t.from),b=mdOf(t.to);return a<=b?x>=a&&x<=b:x>=a||x<=b;}
  function isOpen(k,ms){const t=BY[k];if(!t)return false;if(t.season)return inWin(t,ms);return !t.from||now(ms)>=day0(t.from);}
  const DN=['вс','пн','вт','ср','чт','пт','сб'];
  window.VTOP={
    list:L,shelves:SH,seasons:SE,addSeason,
    T:k=>BY[k]||null,
    isOpen,
    openList:ms=>L.filter(t=>isOpen(t.k,ms)).map(t=>t.k),
    seasonNow:ms=>SE.find(t=>inWin(t,ms))||null,
    isNew:(k,ms)=>{const t=BY[k];if(!t||!t.from||t.season)return false;const d=now(ms)-day0(t.from);return d>=0&&d<7*864e5;},
    nextLocked:ms=>L.filter(t=>t.from&&!isOpen(t.k,ms)).sort((a,b)=>a.from<b.from?-1:1).map(t=>({k:t.k,from:t.from})),
    dateTxt:s=>{const d=new Date(day0(s));return DN[d.getDay()]+' '+String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0');}
  };
})();
