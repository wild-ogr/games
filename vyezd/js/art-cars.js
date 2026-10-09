/* vy-art: «Автоальбом» — 40 советских машин 60–90-х (справочник VYCARS + рисунки SVG). Поток ART.
   ДОГОВОР (другие потоки берут только это):
   VYCARS.list            — массив 40 машин по порядку альбома: {id, name, full, yr, ser, rar, reg, len, col, mdl}
                              id   — строка-ключ (храните в сохранении её, а не номер)
                              name — короткое имя («Копейка»), full — полное («ВАЗ-2101 «Жигули»»), yr — год выпуска модели
                              en, fullEn — то же по-английски (для ?lang=en); VYCARS.nm(id|car,full) — имя на языке игры (LANG); SER/RAR тоже с полем en
                              ser  — серия альбома: leg|trud|bus|spec|stroy|lgnd (VYCARS.SER — названия)
                              rar  — редкость: 'common' | 'rare' | 'legend' (VYCARS.RAR — подписи и цвета рамок)
                              reg  — регион 1–16 по VYREG (LVL, порядок регионов 51–210), 0 — не машина региона; главный справочник — VYREG
                              len  — длина в клетках двора (2 легковая, 3 фургон/грузовик, 4 автобус/фура, 5 гармошка)
                              col  — «родной» цвет эпохи, mdl — номер в старом MODELS гаража (index.html), иначе -1
   VYCARS.get(id)         — машина по id (или null; понимает и старые имена из VYREG: moskvich412, zil_trash, uaz, zil_dump, izh, ambulance — VYCARS.ALIAS); VYCARS.byMdl(i) — по номеру старой модели гаража
   VYCARS.svg(id,opts)    — строка <svg>. opts: view 'top' (вид сверху, морда ВПРАВО, viewBox len*100 × 100 — 1 клетка = 100)
                              | 'side' (вид сбоку для альбома, морда вправо, viewBox 300 × 130, земля y=122);
                              state 'new' (обычная) | 'rust' (ржавая, пришла в альбом) | 'shine' (отреставрирована, блестит);
                              color '#rrggbb' (покраска игрока), ghost true (пустая клетка альбома — серый силуэт),
                              w, h (размер в px, по умолчанию как viewBox), cls (класс для <svg>),
                              lang 'ru'|'en' (надписи ХЛЕБ/МОЛОКО/МИЛИЦИЯ/МОРОЖЕНОЕ; по умолчанию — язык игры LANG)
   VYCARS.img(id,opts)    — HTMLImageElement с этим svg (кэш по ключу) — для canvas: ctx.drawImage(img,…), когда img.complete
   VYCARS.draw(ctx,id,x,y,w,h,opts) — нарисовать на canvas (вернёт false, если картинка ещё грузится; VYCARS.onload(fn) — позвать при загрузке)
   Ничего не пишет в сохранение и не трогает игру. Не загрузился — игра работает как раньше (проверяйте window.VYCARS). */
(function(){
'use strict';
const SER=[{id:'leg',name:'Легковушки',en:'Cars'},{id:'trud',name:'Трудяги',en:'Workhorses'},{id:'bus',name:'Автобусы',en:'Buses'},{id:'spec',name:'Спецмашины',en:'Service vehicles'},{id:'stroy',name:'Стройка и село',en:'Building & farm'},{id:'lgnd',name:'Легенды',en:'Legends'}];
const RAR={common:{name:'Обычная',en:'Common',col:'#8a96a3'},rare:{name:'Редкая',en:'Rare',col:'#3d7bd9'},legend:{name:'Легенда',en:'Legend',col:'#d9a521'}};
// t — вид сверху, s — вид сбоку (семейство рисунка), lamp — фары: r2 круглые, r4 четыре круглые, q2 прямоугольные, q4 четыре в рамках
const L=[
 // Легковушки
 {id:'kopeyka',name:'Копейка',en:'Kopeyka',fullEn:'Zhiguli VAZ-2101 “Kopeyka”',full:'ВАЗ-2101 «Жигули»',yr:1970,ser:'leg',rar:'common',reg:0,len:2,col:'#c8372d',mdl:0,t:'sedan',s:'sedan',lamp:'r4'},
 {id:'shesterka',name:'Шестёрка',en:'Shesterka',fullEn:'Zhiguli VAZ-2106 “Shesterka”',full:'ВАЗ-2106 «Жигули»',yr:1976,ser:'leg',rar:'common',reg:0,len:2,col:'#7d1d2e',mdl:-1,t:'sedan',s:'sedan',lamp:'q4'},
 {id:'devyatka',name:'Девятка',en:'Devyatka',fullEn:'Lada Samara VAZ-2109 “Devyatka”',full:'ВАЗ-2109 «Спутник»',yr:1987,ser:'leg',rar:'common',reg:0,len:2,col:'#2f5f9e',mdl:1,t:'hatch',s:'hatch',lamp:'q2'},
 {id:'moskvich',name:'Москвич-412',en:'Moskvich-412',fullEn:'Moskvich-412',full:'Москвич-412',yr:1967,ser:'leg',rar:'common',reg:1,len:2,col:'#d7c45a',mdl:-1,t:'sedan',s:'sedan',lamp:'q2'},
 {id:'zapor',name:'Запорожец',en:'Zaporozhets',fullEn:'ZAZ-968 Zaporozhets “Big Ears”',full:'ЗАЗ-968 «Ушастый»',yr:1971,ser:'leg',rar:'common',reg:0,len:2,col:'#e07a9a',mdl:10,t:'zap',s:'zap',lamp:'r2'},
 {id:'gorbaty',name:'Горбатый',en:'Humpback Zaporozhets',fullEn:'ZAZ-965 “Humpback” Zaporozhets',full:'ЗАЗ-965 «Горбатый Запорожец»',yr:1960,ser:'leg',rar:'rare',reg:0,len:2,col:'#7fb8a4',mdl:-1,t:'bug',s:'bug',lamp:'r2'},
 {id:'oka',name:'Ока',en:'Oka',fullEn:'Lada Oka VAZ-1111',full:'ВАЗ-1111 «Ока»',yr:1988,ser:'leg',rar:'common',reg:12,len:2,col:'#e8b64a',mdl:-1,t:'oka',s:'oka',lamp:'q2'},
 {id:'niva',name:'Нива',en:'Niva',fullEn:'Lada Niva VAZ-2121',full:'ВАЗ-2121 «Нива»',yr:1977,ser:'leg',rar:'common',reg:0,len:2,col:'#4f8a3c',mdl:2,t:'suv',s:'niva',lamp:'r2'},
 {id:'volga',name:'Волга',en:'Volga',fullEn:'Volga GAZ-24',full:'ГАЗ-24 «Волга»',yr:1970,ser:'leg',rar:'common',reg:0,len:2,col:'#2b2f36',mdl:3,t:'sedan',s:'sedan24',lamp:'r4'},
 {id:'taxi',name:'Такси',en:'Taxi',fullEn:'Volga GAZ-24 taxi',full:'ГАЗ-24 «Волга» — такси',yr:1970,ser:'leg',rar:'common',reg:0,len:2,col:'#f2c230',mdl:4,t:'sedan',s:'sedan24',lamp:'r4'},
 // Трудяги
 {id:'buhanka',name:'Буханка',en:'Bukhanka',fullEn:'UAZ-452 “Bukhanka” (the Loaf)',full:'УАЗ-452 «Буханка»',yr:1965,ser:'trud',rar:'common',reg:0,len:3,col:'#6f8f45',mdl:5,t:'van',s:'buhanka',lamp:'r2'},
 {id:'raf',name:'РАФик',en:'RAF van',fullEn:'RAF-2203 Latvija minibus',full:'РАФ-2203 «Латвия»',yr:1976,ser:'trud',rar:'common',reg:2,len:3,col:'#d9d2bf',mdl:-1,t:'van',s:'raf',lamp:'r2'},
 {id:'gazel',name:'Газель',en:'Gazelle',fullEn:'GAZelle GAZ-3221 minibus',full:'ГАЗ-3221 «Газель» — маршрутка',yr:1994,ser:'trud',rar:'common',reg:0,len:3,col:'#eef0f2',mdl:6,t:'gazel',s:'gazel',lamp:'q2'},
 {id:'kabluk',name:'Каблук',en:'Kabluk',fullEn:'IZh-2715 “Kabluchok” van',full:'ИЖ-2715 «Каблучок»',yr:1972,ser:'trud',rar:'rare',reg:14,len:2,col:'#5b86b8',mdl:-1,t:'kabluk',s:'kabluk',lamp:'q2'},
 {id:'gazon',name:'Газон',en:'Gazon truck',fullEn:'GAZ-53 flatbed truck',full:'ГАЗ-53 бортовой',yr:1965,ser:'trud',rar:'common',reg:0,len:3,col:'#4f7fa8',mdl:-1,t:'truck',s:'truck',lamp:'r2',cargo:'bort',cab:'gaz'},
 {id:'hleb',name:'Хлебный',en:'Bread van',fullEn:'GAZ-53 bread van',full:'ГАЗ-53 «Хлеб»',yr:1966,ser:'trud',rar:'rare',reg:0,len:3,col:'#8a5a3b',mdl:-1,t:'truck',s:'truck',lamp:'r2',cargo:'box',cab:'gaz',box:'#e9d7a8',txt:'ХЛЕБ'},
 {id:'moloko',name:'Молоковоз',en:'Milk tanker',fullEn:'GAZ-53 milk tanker',full:'ГАЗ-53 «Молоко»',yr:1967,ser:'trud',rar:'rare',reg:0,len:3,col:'#3d6fb0',mdl:-1,t:'truck',s:'truck',lamp:'r2',cargo:'tank',cab:'gaz',box:'#f2f2ee',txt:'МОЛОКО'},
 // Автобусы
 {id:'paz',name:'ПАЗик',en:'PAZik',fullEn:'PAZ-672 bus',full:'ПАЗ-672',yr:1968,ser:'bus',rar:'common',reg:0,len:4,col:'#e9b63c',mdl:8,t:'bus',s:'paz',lamp:'r2'},
 {id:'laz',name:'ЛАЗ',en:'LAZ',fullEn:'LAZ-695 “Lviv” bus',full:'ЛАЗ-695 «Львов»',yr:1961,ser:'bus',rar:'rare',reg:0,len:4,col:'#d2483a',mdl:-1,t:'bus',s:'laz',lamp:'r2'},
 {id:'liaz',name:'ЛиАЗ',en:'LiAZ',fullEn:'LiAZ-677 “Moonwalker” bus',full:'ЛиАЗ-677 «Луноход»',yr:1967,ser:'bus',rar:'common',reg:4,len:4,col:'#e5c04a',mdl:-1,t:'bus',s:'liaz',lamp:'r2'},
 {id:'ikarus',name:'Икарус',en:'Ikarus',fullEn:'Ikarus 280 bendy bus',full:'Икарус-280 «гармошка»',yr:1973,ser:'bus',rar:'common',reg:0,len:5,col:'#ef7d3c',mdl:9,t:'bus',s:'ikarus',lamp:'q2'},
 {id:'trolley',name:'Троллейбус',en:'Trolleybus',fullEn:'ZiU-9 trolleybus',full:'ЗиУ-9 троллейбус',yr:1972,ser:'bus',rar:'rare',reg:13,len:4,col:'#3f7fc0',mdl:-1,t:'bus',s:'trolley',lamp:'r2'},
 // Спецмашины
 {id:'skoraya',name:'Скорая',en:'Ambulance',fullEn:'RAF-22031 ambulance',full:'РАФ-22031 «Скорая помощь»',yr:1976,ser:'spec',rar:'common',reg:0,len:3,col:'#f4f4ef',mdl:7,t:'van',s:'raf',lamp:'r2'},
 {id:'tabletka',name:'Таблетка',en:'Tabletka',fullEn:'UAZ-452A ambulance “Tabletka” (the Pill)',full:'УАЗ-452А санитарный «Таблетка»',yr:1966,ser:'spec',rar:'common',reg:6,len:3,col:'#e9e4d0',mdl:-1,t:'van',s:'buhanka',lamp:'r2'},
 {id:'bobik',name:'Бобик',en:'Bobik',fullEn:'UAZ-469 police jeep “Bobik”',full:'УАЗ-469 милиция',yr:1972,ser:'spec',rar:'common',reg:0,len:2,col:'#e8cf3c',mdl:-1,t:'suv',s:'uaz',lamp:'r2'},
 {id:'pozhar',name:'Пожарная',en:'Fire engine',fullEn:'ZIL-130 fire engine with ladder',full:'ЗИЛ-130 пожарная с лестницей',yr:1970,ser:'spec',rar:'rare',reg:0,len:4,col:'#d32f2f',mdl:-1,t:'truck',s:'truck',lamp:'r2',cargo:'fire',cab:'zil'},
 {id:'polivalka',name:'Поливалка',en:'Street washer',fullEn:'ZIL-130 street washer',full:'ЗИЛ-130 поливомоечная',yr:1968,ser:'spec',rar:'rare',reg:0,len:3,col:'#ef8a2c',mdl:-1,t:'truck',s:'truck',lamp:'r2',cargo:'tank',cab:'zil',box:'#ef8a2c'},
 {id:'musorovoz',name:'Мусоровоз',en:'Garbage truck',fullEn:'ZIL-130 garbage truck',full:'ЗИЛ-130 мусоровоз',yr:1970,ser:'spec',rar:'common',reg:3,len:3,col:'#3f86c6',mdl:-1,t:'truck',s:'truck',lamp:'r2',cargo:'musor',cab:'zil',box:'#f0a030'},
 {id:'morozh',name:'Мороженое',en:'Ice-cream van',fullEn:'RAF ice-cream van',full:'РАФ «Мороженое»',yr:1978,ser:'spec',rar:'common',reg:0,len:3,col:'#8ee0e0',mdl:11,t:'van',s:'raf',lamp:'r2'},
 // Стройка и село
 {id:'samosval',name:'Самосвал',en:'Dump truck',fullEn:'ZIL-MMZ-555 dump truck',full:'ЗИЛ-ММЗ-555 самосвал',yr:1966,ser:'stroy',rar:'common',reg:11,len:3,col:'#4a78b5',mdl:-1,t:'truck',s:'truck',lamp:'r2',cargo:'dump',cab:'zil',box:'#e07b2c'},
 {id:'kamaz',name:'КамАЗ',en:'KamAZ',fullEn:'KamAZ-5320 truck',full:'КамАЗ-5320',yr:1976,ser:'stroy',rar:'common',reg:9,len:4,col:'#ef7f1a',mdl:-1,t:'truck',s:'truck',lamp:'r2',cargo:'bort',cab:'kamaz'},
 {id:'gaz66',name:'Шишига',en:'Shishiga',fullEn:'GAZ-66 “Shishiga” army truck',full:'ГАЗ-66 «Шишига»',yr:1964,ser:'stroy',rar:'common',reg:8,len:3,col:'#5f6b3a',mdl:-1,t:'truck',s:'truck',lamp:'r2',cargo:'tent',cab:'g66'},
 {id:'kran',name:'Автокран',en:'Truck crane',fullEn:'KS-2561 crane on ZIL-130',full:'Автокран КС-2561 на ЗИЛ-130',yr:1970,ser:'stroy',rar:'rare',reg:15,len:4,col:'#f0c020',mdl:-1,t:'truck',s:'truck',lamp:'r2',cargo:'crane',cab:'zil'},
 {id:'belarus',name:'Беларус',en:'Belarus tractor',fullEn:'MTZ-80 “Belarus” tractor',full:'Трактор МТЗ-80 «Беларус»',yr:1974,ser:'stroy',rar:'rare',reg:10,len:2,col:'#c8302b',mdl:-1,t:'tractor',s:'tractor',lamp:'q2'},
 {id:'trekol',name:'Вездеход',en:'Trekol',fullEn:'Trekol all-terrain vehicle on balloon tyres',full:'Вездеход «Трэкол» на шинах-пузырях',yr:1993,ser:'stroy',rar:'rare',reg:5,len:3,col:'#d8d2c0',mdl:-1,t:'trekol',s:'trekol',lamp:'r2'},
 // Легенды
 {id:'pobeda',name:'Победа',en:'Pobeda',fullEn:'GAZ-M20 Pobeda (Victory)',full:'ГАЗ-М-20 «Победа»',yr:1946,ser:'lgnd',rar:'legend',reg:7,len:2,col:'#5d6b52',mdl:-1,t:'fast',s:'pobeda',lamp:'r2'},
 {id:'volga21',name:'Волга с оленем',en:'Volga with the deer',fullEn:'Volga GAZ-21 with the deer',full:'ГАЗ-21 «Волга»',yr:1956,ser:'lgnd',rar:'legend',reg:0,len:2,col:'#8fb7c9',mdl:-1,t:'fast',s:'volga21',lamp:'r2'},
 {id:'zim',name:'ЗИМ',en:'ZIM',fullEn:'GAZ-12 ZIM limousine',full:'ГАЗ-12 «ЗИМ»',yr:1950,ser:'lgnd',rar:'legend',reg:0,len:3,col:'#3a2a2a',mdl:-1,t:'fast',s:'zim',lamp:'r2'},
 {id:'chaika',name:'Чайка',en:'Chaika',fullEn:'GAZ-13 Chaika (Seagull) limousine',full:'ГАЗ-13 «Чайка»',yr:1959,ser:'lgnd',rar:'legend',reg:16,len:3,col:'#1d1f24',mdl:-1,t:'fast',s:'chaika',lamp:'r4'},
 {id:'zil',name:'ЗИЛ',en:'ZIL',fullEn:'ZIL-114 state limousine',full:'ЗИЛ-114 «правительственный»',yr:1967,ser:'lgnd',rar:'legend',reg:0,len:3,col:'#15171b',mdl:-1,t:'sedan',s:'zil',lamp:'q4'}
];
const BY={};L.forEach(c=>BY[c.id]=c);
// другие имена тех же машин (VYREG у LVL писал раньше, чем вышел справочник) — get/svg/img их понимают
const ALIAS={moskvich412:'moskvich',zil_trash:'musorovoz',uaz:'tabletka',zil_dump:'samosval',izh:'kabluk',ambulance:'skoraya',zaporozhets:'zapor',bukhanka:'buhanka',icecream:'morozh',volga24:'volga'};
Object.keys(ALIAS).forEach(k=>{if(!BY[k])BY[k]=BY[ALIAS[k]];});

/* ---------- цвета ---------- */
const hx=c=>{c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);return[n>>16,n>>8&255,n&255];};
const toHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,p)=>{const A=hx(a),B=hx(b);return toHex(A.map((v,i)=>v+(B[i]-v)*p));};
const shade=(c,p)=>p<0?mix(c,'#000000',-p):mix(c,'#ffffff',p);
const lum=c=>{const a=hx(c);return .299*a[0]+.587*a[1]+.114*a[2];};
// палитра одного рисунка: через неё идут ВСЕ цвета (ржавчина и «призрак» перекрашивают разом)
function pal(st,ghost){
  if(ghost)return c=>{if(c==='none')return c;const l=lum(c);return mix('#9aa4ae','#dfe4e9',Math.min(1,l/255));};
  if(st==='rust')return c=>{if(c==='none')return c;const l=lum(c);return mix(mix(c,toHex([l,l,l]),.55),'#7a5a3e',.28);};
  return c=>c;
}
// простое зерно по id — пятна ржавчины всегда на одних местах
function seed(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return()=>{h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return(h>>>0)/4294967296;};}
const f1=n=>Math.round(n*10)/10;

let CLN=0;
/* ---------- примитивы ---------- */
// надписи на кузовах: в английском режиме игры (LANG==='en') или opts.lang:'en' — по-английски
const TXT_EN={'ХЛЕБ':'BREAD','МОЛОКО':'MILK','МИЛИЦИЯ':'POLICE','МОРОЖЕНОЕ':'ICE CREAM'};
function isEn(o){if(o&&o.lang)return o.lang==='en';try{return typeof LANG!=='undefined'&&LANG==='en';}catch(e){return false;}}
function mk(P,en){
  const o=[];
  const A={o,clip:[],
    rect(x,y,w,h,r,fill,st,sw){if(w<0){x+=w;w=-w;}if(h<0){y+=h;h=-h;}o.push(`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}"${r?` rx="${f1(Math.min(r,w/2,h/2))}"`:''} fill="${P(fill)}"${st?` stroke="${P(st)}" stroke-width="${sw||2}"`:''}/>`);},
    circ(x,y,r,fill,st,sw){o.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${P(fill)}"${st?` stroke="${P(st)}" stroke-width="${sw||2}"`:''}/>`);},
    ell(x,y,rx,ry,fill,op){o.push(`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${P(fill)}"${op!=null?` opacity="${op}"`:''}/>`);},
    poly(pts,fill,st,sw){o.push(`<polygon points="${pts.map(p=>f1(p[0])+','+f1(p[1])).join(' ')}" fill="${P(fill)}"${st?` stroke="${P(st)}" stroke-width="${sw||2}" stroke-linejoin="round"`:''}/>`);},
    path(d,fill,st,sw,extra){o.push(`<path d="${d}" fill="${fill==='none'?'none':P(fill)}"${st?` stroke="${P(st)}" stroke-width="${sw||2}" stroke-linejoin="round" stroke-linecap="round"`:''}${extra||''}/>`);},
    line(x1,y1,x2,y2,st,sw,op){o.push(`<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${P(st)}" stroke-width="${sw||2}" stroke-linecap="round"${op!=null?` opacity="${op}"`:''}/>`);},
    text(x,y,s,size,fill,w){if(en&&TXT_EN[s])s=TXT_EN[s];o.push(`<text x="${f1(x)}" y="${f1(y)}" font-family="Arial,Helvetica,sans-serif" font-weight="${w||700}" font-size="${size}" text-anchor="middle" fill="${P(fill)}">${s}</text>`);},
    raw(s){o.push(s);}
  };return A;
}
// многоугольник со скруглёнными углами (r — радиус, можно массивом по вершинам)
function roundPath(pts,r){const n=pts.length;let d='';
  for(let i=0;i<n;i++){const p=pts[i],a=pts[(i-1+n)%n],b=pts[(i+1)%n],R=Array.isArray(r)?(r[i]!=null?r[i]:r[r.length-1]):r;
    const da=Math.hypot(a[0]-p[0],a[1]-p[1]),db=Math.hypot(b[0]-p[0],b[1]-p[1]),k=Math.min(R,da/2,db/2);
    const p1=[p[0]+(a[0]-p[0])/da*k,p[1]+(a[1]-p[1])/da*k],p2=[p[0]+(b[0]-p[0])/db*k,p[1]+(b[1]-p[1])/db*k];
    d+=(i?'L':'M')+f1(p1[0])+' '+f1(p1[1])+'Q'+f1(p[0])+' '+f1(p[1])+' '+f1(p2[0])+' '+f1(p2[1]);}
  return d+'Z';}

/* ================= ВИД СВЕРХУ (морда вправо, 1 клетка = 100) =================
   Кузов занимает поперёк y 12…88 (как в игре 0.76–0.8 клетки), вдоль — от 7 до len*100-7. */
const GL='#2f4a63',GL2='#7fa3c0',CH='#dfe4ea',TYRE='#22252b',LAMP='#fff6c8',TAIL='#e0323f';
function top(c,o,A,P){
  const LN=o.len||c.len,D=DIM[c.id]||{};
  // длина и ширина по настоящим габаритам: Ока короче и уже, Волга длиннее и шире (в пределах клеток)
  const lf=D.L?Math.max(.66,Math.min(1,.5+.5*D.L/(REFL[LN]||D.L))):1,wf=D.W?Math.max(.84,Math.min(1.05,.55+.45*D.W/1.8)):1;
  const W=LN*100,LpF=W-14,x0=7+LpF*(1-lf)/2,x1=W-7-LpF*(1-lf)/2,Lp=x1-x0,col=o.color||c.col,dk=shade(col,-.38),lt=shade(col,.22),ed=shade(col,-.2);
  const t=f=>x0+f*Lp,y0=50-38*wf,y1=50+38*wf;
  const tyres=(fs,ext)=>{for(const f of fs){A.rect(t(f)-12,y0-4-(ext||0),24,10,3,TYRE);A.rect(t(f)-12,y1-6+(ext||0),24,10,3,TYRE);}};
  const lamps=(x,kind)=>{ // фары у правого края x
    if(kind==='r4'){for(const y of[22,34,66,78])A.circ(x-5,y,5,LAMP,CH,1.5);}
    else if(kind==='q4'){A.rect(x-9,17,8,30,2,CH);A.rect(x-9,53,8,30,2,CH);for(const y of[24,38,62,76])A.circ(x-5,y,4.2,LAMP);}
    else if(kind==='q2'){A.rect(x-7,17,6,20,2,LAMP,CH,1.2);A.rect(x-7,63,6,20,2,LAMP,CH,1.2);}
    else{A.circ(x-6,26,6,LAMP,CH,1.5);A.circ(x-6,74,6,LAMP,CH,1.5);}};
  const tails=(x,w)=>{A.rect(x+1,y0+4,w||5,14,2,TAIL);A.rect(x+1,y1-18,w||5,14,2,TAIL);};
  const glassBand=(f0,f1_,inset,r)=>A.rect(t(f0),y0+inset,t(f1_)-t(f0),y1-y0-inset*2,r||8,GL);
  const roof=(f0,f1_,inset,r,cc)=>A.rect(t(f0),y0+inset,t(f1_)-t(f0),y1-y0-inset*2,r||8,cc||lt);
  const shine=(f0,f1_)=>A.rect(t(f0),y0+4,t(f1_)-t(f0),6,3,'#ffffff');
  const body=(r,f0,f1_,inset,cc)=>{A.rect(t(f0||0),y0+(inset||0),t(f1_==null?1:f1_)-t(f0||0),y1-y0-(inset||0)*2,r,cc||col,dk,2.5);};
  const T=c.t,id=c.id;
  A.clip.push(roundPath([[x0,y0-4],[x1,y0-4],[x1,y1+4],[x0,y1+4]],14));
  if(o.shadow!==false&&!PLAN[c.id])A.rect(x0+3,y0+5,Lp,y1-y0,16,'#000000" fill-opacity=".16');

  if(T==='sedan'||T==='fast'||T==='oka'||T==='hatch'||T==='zap'||T==='bug'){
    let g=[.2,.73],r=[.3,.6],rad=16;
    if(T==='fast'){g=[.16,.7];r=[.25,.6];rad=LN>2?20:26;}
    if(T==='hatch'){g=[.05,.66];r=[.12,.55];}
    if(T==='oka'){g=[.06,.7];r=[.13,.58];rad=18;}
    if(T==='zap'){g=[.16,.7];r=[.26,.6];rad=20;}
    if(T==='bug'){g=[.2,.72];r=[.3,.6];rad=32;}
    if(D.tg){g=[D.tg[0]/D.L,D.tg[3]/D.L];r=[D.tg[1]/D.L,D.tg[2]/D.L];}if(D.tr)rad=D.tr;
    const shortB=0; // длина — по габаритам (lf)
    const tt=f=>shortB/2+f*(1-shortB);const g0=tt(g[0]),g1=tt(g[1]),r0=tt(r[0]),r1=tt(r[1]);
    tyres([tt(.18),tt(.82)]);
    if(T==='zap')for(const sy of[y0-6,y1-2]){A.rect(t(.2),sy,t(.36)-t(.2),8,4,dk);} // «уши»
    const pl=PLAN[id];if(pl){const hw=(y1-y0)/2,up=pl[1].map(q=>[t(q[0]),50-hw*q[1]]),dn=pl[1].slice(1,-1).reverse().map(q=>[t(q[0]),50+hw*q[1]]);const pd=roundPath(up.concat(dn),pl[0]);if(o.shadow!==false)A.path(pd,'#000000',null,0,' fill-opacity=".16" transform="translate(3 5)"');A.path(pd,col,dk,2.5);}
    else body(rad,shortB/2,1-shortB/2);
    // капот/багажник чуть темнее у краёв + кант
    if(T==='hatch'&&id==='devyatka'){A.poly([[t(.86),y0],[t(1),y0+8],[t(1),y1-8],[t(.86),y1]],col);A.rect(t(.02),y0+3,8,y1-y0-6,3,'#1d2128');}
    glassBand(g0,g1,7,12);roof(r0,r1,9,10);
    A.line(t(g1)-4,y0+14,t(g1)-12,y0+30,GL2,3,.8);
    if(T!=='zap'&&T!=='bug')A.line(t(tt(.86)),y0+10,t(tt(.86)),y1-10,ed,1.5,.6);
    if(T==='zap'||T==='bug'){for(let i=0;i<4;i++)A.line(t(tt(.04))+i*5,y0+24,t(tt(.04))+i*5,y1-24,dk,2);} // решётка мотора сзади
    // бамперы
    const chrome=['kopeyka','shesterka','volga','taxi','moskvich','volga21','pobeda','zim','chaika','zil','gorbaty'].includes(id);
    if(chrome){A.rect(t(1-shortB/2)-2,y0+4,4,y1-y0-8,2,CH);A.rect(t(shortB/2)-2,y0+4,4,y1-y0-8,2,CH);}
    else if(T!=='zap'&&T!=='bug'){A.rect(t(1-shortB/2)-2,y0+6,4,y1-y0-12,2,'#2a2d33');A.rect(t(shortB/2)-2,y0+6,4,y1-y0-12,2,'#2a2d33');}
    lamps(t(1-shortB/2),c.lamp);tails(t(shortB/2));
    if(id==='volga'||id==='taxi'||id==='volga21'){A.line(t(.8),50,t(.97),50,CH,2.5);A.circ(t(.9),50,4,CH);} // олень и молдинг капота
    if(id==='taxi'){for(let i=0;i<6;i++){A.rect(t(.33)+i*6,y0+12,6,6,0,i%2?'#1d2128':'#ffffff');A.rect(t(.33)+i*6,y1-18,6,6,0,i%2?'#ffffff':'#1d2128');}A.circ(t(.56),50,5,'#2ecc71','#ffffff',1.5);}
    if(id==='chaika'||id==='zil'||id==='zim'){A.line(t(.06),y0+3,t(.94),y0+3,CH,2);A.line(t(.06),y1-3,t(.94),y1-3,CH,2);A.rect(t(.94),40,6,20,2,CH);}
    if(id==='zil')A.circ(t(.62),50,1,'#ffffff');
    if(id==='devyatka'){A.rect(t(.03),y0+2,6,y1-y0-4,2,'#1d2128');}
    if(id==='oka'){A.rect(t(.08),y0+6,4,y1-y0-12,2,'#2a2d33');}
    if(id==='pobeda'||id==='volga21'){A.rect(t(.92),44,10,12,3,CH);}
  }
  else if(T==='suv'){ // Нива, бобик
    tyres([.2,.8]);body(12);glassBand(.12,.72,7,8);roof(.18,.63,9,6,id==='bobik'?'#e6e2cc':lt);
    A.line(t(.72)-3,y0+14,t(.72)-10,y0+30,GL2,3,.8);
    for(const y of [y0+10,y1-10])A.line(t(.76),y,t(.98),y,ed,1.5,.7);
    A.rect(t(1)-3,y0+3,5,y1-y0-6,2,'#2a2d33');A.rect(t(0)-2,y0+3,5,y1-y0-6,2,'#2a2d33');
    lamps(t(1),'r2');tails(t(0));
    if(id==='niva'){A.circ(t(.08),50,1,'#000');for(const f of[.3,.4,.5])A.line(t(f),y0+16,t(f),y1-16,shade(col,-.1),2.5);}
    if(id==='bobik'){A.circ(t(0)-2,50,11,TYRE);A.circ(t(0)-2,50,5,'#555a62');A.rect(t(.5),y0+9,7,y1-y0-18,2,'#2d63c8');A.rect(t(.58),38,9,24,3,'#1d2430');A.rect(t(.585),40,7,10,2,'#3f7bff');A.rect(t(.585),50,7,10,2,'#ff3b4e');}
  }
  else if(T==='van'||T==='gazel'||T==='kabluk'){
    const two=id==='buhanka'||id==='tabletka';
    tyres([.2,.82]);
    if(T==='gazel'){body(12,0,.86);A.rect(t(.83),y0+8,t(1)-t(.83),y1-y0-16,14,col,dk,2.5);glassBand(.72,.86,7,6);roof(.03,.72,9,6);lamps(t(1),'q2');tails(t(0));
      A.rect(t(.5),y0+12,22,y1-y0-24,3,'#ffc233');A.text(t(.5)+11,56,'7',14,'#1d2128');}
    else if(T==='kabluk'){body(14,.42,1);A.rect(t(0),y0-1,t(.47)-t(0),y1-y0+2,6,shade(col,.35),dk,2.5);glassBand(.44,.7,7,10);roof(.47,.6,9,8);lamps(t(1),'q2');tails(t(0));
      A.line(t(.06),y0+8,t(.44),y0+8,shade(col,.1),2);A.line(t(.06),y1-8,t(.44),y1-8,shade(col,.1),2);}
    else{
      body(id==='raf'||id==='skoraya'||id==='morozh'?18:two?30:12);glassBand(.8,.94,7,8);roof(.04,.8,9,two?22:8,id==='tabletka'?'#f6f3e6':lt);
      if(id==='buhanka')for(let i=1;i<4;i++)A.line(t(.05+i*.18),y0+12,t(.05+i*.18),y1-12,shade(col,.08),2);
      A.line(t(.94)-3,y0+14,t(.94)-8,y0+28,GL2,3,.8);
      for(const y of[y0+3,y1-7])for(let i=0;i<4;i++)A.rect(t(.12+i*.16),y,t(.12+i*.16+.12)-t(.12+i*.16),4,2,GL);
      lamps(t(1),'r2');tails(t(0));
    }
    if(id==='skoraya'||id==='tabletka'){A.rect(t(.4)-3,38,6,24,1,'#e33a3a');A.rect(t(.4)-12,47,24,6,1,'#e33a3a');A.rect(t(.74),40,8,20,3,'#3f7bff');
      if(id==='skoraya')for(const y of[y0+1,y1-5])A.rect(t(.03),y,t(.78)-t(.03),4,0,'#e33a3a');}
    if(id==='morozh'){A.circ(t(.42),50,15,'#ffffff');A.circ(t(.42),48,10,'#ff8fc0');A.circ(t(.46),53,6,'#ffc233');}
    if(id==='raf'){A.line(t(.05),50,t(.75),50,shade(col,-.12),2);}
  }
  else if(T==='bus'){
    const art=id==='ikarus';
    tyres(LN>=5?[.12,.5,.88]:[.17,.84]);
    if(art){body(12,0,.44);body(12,.52,1);A.rect(t(.43),y0+5,t(.53)-t(.43),y1-y0-10,3,'#3a3f48');for(let i=0;i<5;i++)A.line(t(.445)+i*4,y0+8,t(.445)+i*4,y1-8,'#7a8494',1.5);}
    else body(12);
    const roofC=id==='paz'?'#f3efe4':id==='laz'?'#f1ebdc':id==='liaz'?'#f3eccf':id==='trolley'?'#f2f2f2':shade(col,.15);
    if(art){roof(.02,.42,9,6,roofC);roof(.54,.95,9,6,roofC);}else roof(.02,.95,9,6,roofC);
    glassBand(.95,.99,6,4);
    for(const y of[y0+2,y1-6]){const n=LN*3;for(let i=0;i<n;i++){const a=.04+i*(.9/n);if(art&&a>.41&&a<.54)continue;A.rect(t(a),y,t(a+.9/n*.8)-t(a),4,1.5,GL);}}
    // люки на крыше
    for(const a of art?[.15,.3,.7,.85]:[.25,.6])A.rect(t(a),38,t(a)+16>t(.97)?8:16,24,3,shade(roofC,-.12));
    if(id==='laz')for(let i=0;i<5;i++)A.line(t(.03)+i*4,y0+16,t(.03)+i*4,y1-16,shade(col,-.3),2);
    if(id==='trolley'){A.line(t(.55),40,t(-.08),36,'#2a2d33',2.5);A.line(t(.55),60,t(-.08),64,'#2a2d33',2.5);A.rect(t(.5),34,22,32,3,'#7f8790');}
    if(id==='paz'){A.rect(t(.85),y0+8,8,y1-y0-16,2,'#1d2128');}
    lamps(t(1),'r2');tails(t(0));
  }
  else if(T==='truck'){
    const cab=c.cab,cg=c.cargo,rc=o.color&&o.color!==c.col,box=rc?mix(col,c.box||col,.3):(c.box||col),tent=rc?mix(col,'#7b8150',.4):'#7b8150';
    const over=cab==='kamaz';const cab0=over?.76:.62,cab1=over?1:.84;
    tyres(LN>=4?[.14,.3,.86]:[.16,.84],2);
    // груз
    const c0=.01,c1=cab0-.02;
    if(cg==='bort'){const wd=mix(col,'#b88a4a',.45);A.rect(t(c0),y0-2,t(c1)-t(c0),y1-y0+4,3,wd,shade(wd,-.45),2.5);A.rect(t(c0)+5,y0+3,t(c1)-t(c0)-10,y1-y0-6,2,shade(wd,.12));for(let i=1;i<6;i++)A.line(t(c0)+5,y0-2+i*(y1-y0+4)/6,t(c1)-5,y0-2+i*(y1-y0+4)/6,shade(wd,-.22),2);}
    else if(cg==='box'||cg==='musor'){A.rect(t(c0),y0-2,t(c1)-t(c0),y1-y0+4,cg==='musor'?14:4,box,shade(box,-.35),2.5);A.rect(t(c0)+6,y0+8,t(c1)-t(c0)-12,y1-y0-16,3,shade(box,.12));
      if(cg==='musor')for(let i=1;i<4;i++)A.line(t(c0)+i*(t(c1)-t(c0))/4,y0,t(c0)+i*(t(c1)-t(c0))/4,y1,shade(box,-.25),2);}
    else if(cg==='tank'){A.rect(t(c0),y0+2,t(c1)-t(c0),y1-y0-4,30,box,shade(box,-.35),2.5);A.rect(t(c0)+6,y0+10,t(c1)-t(c0)-12,10,5,shade(box,.35));A.circ(t((c0+c1)/2),50,9,shade(box,-.15),shade(box,-.4),2);
      if(c.id==='polivalka')A.rect(t(1)-2,y0+4,7,y1-y0-8,2,'#3a3f48');}
    else if(cg==='dump'){A.rect(t(c0),y0-2,t(c1)-t(c0),y1-y0+4,3,box,shade(box,-.4),2.5);A.rect(t(c0)+6,y0+6,t(c1)-t(c0)-6,y1-y0-12,2,shade(box,-.2));A.rect(t(c1)-8,y0-2,14,y1-y0+4,3,box,shade(box,-.4),2);}
    else if(cg==='tent'){A.rect(t(c0),y0-2,t(c1)-t(c0),y1-y0+4,10,tent,shade(tent,-.35),2.5);for(let i=1;i<4;i++)A.line(t(c0)+i*(t(c1)-t(c0))/4,y0,t(c0)+i*(t(c1)-t(c0))/4,y1,shade(tent,-.22),3);}
    else if(cg==='fire'){A.rect(t(c0),y0,t(c1)-t(c0),y1-y0,4,col,dk,2.5);A.rect(t(c0)+4,y0+6,t(c1)-t(c0)-8,6,1,'#ffffff');A.rect(t(c0)+4,y1-12,t(c1)-t(c0)-8,6,1,'#ffffff');
      // лестница на крыше — до кабины
      A.rect(t(c0)+2,36,t(cab1)-t(c0)-14,28,2,'none','#c9ced6',3);for(let x=t(c0)+8;x<t(cab1)-14;x+=10)A.line(x,36,x,64,'#c9ced6',2.5);}
    else if(cg==='crane'){A.rect(t(c0),y0,t(c1)-t(c0),y1-y0,4,'#4a4f58',null);A.circ(t(.3),50,20,col,shade(col,-.4),2.5);
      A.rect(t(.18),40,t(cab1)-t(.18),20,4,col,shade(col,-.45),2.5);for(let x=t(.24);x<t(cab1)-8;x+=14)A.line(x,41,x+7,59,shade(col,-.4),2);A.circ(t(cab1)-6,50,4,'#2a2d33');}
    // кабина
    if(over){A.rect(t(cab0),y0,t(cab1)-t(cab0),y1-y0,10,col,dk,2.5);A.rect(t(.93),y0+6,t(.985)-t(.93),y1-y0-12,4,GL);A.rect(t(.79),y0+9,t(.9)-t(.79),y1-y0-18,6,lt);lamps(t(1),'q2');A.rect(t(.79),y0+2,t(.9)-t(.79),4,1,'#ffffff');}
    else{
      const hood=cab==='g66'?.08:.13;
      A.rect(t(cab1)-2,y0+10,t(1)-t(cab1)+2,y1-y0-20,8,col,dk,2.5); // капот
      if(cab==='zil')for(let i=0;i<4;i++)A.line(t(1)-3,y0+18+i*6,t(1)-3,y0+18+i*6,'#fff',0);
      A.rect(t(cab0),y0+2,t(cab1)-t(cab0),y1-y0-4,10,col,dk,2.5);A.rect(t(cab1-.06),y0+8,t(cab1)-t(cab1-.06)-2,y1-y0-16,4,GL);A.rect(t(cab0+.02),y0+9,t(cab1-.07)-t(cab0+.02),y1-y0-18,5,lt);
      A.line(t(1)-12,y0+16,t(1)-12,y1-16,shade(col,-.2),1.5);
      // крылья с фарами
      for(const y of[y0+2,y1-14])A.rect(t(cab1)+2,y,t(1)-t(cab1)-4,12,6,shade(col,-.08),dk,1.5);
      A.circ(t(1)-7,y0+8,5,LAMP,CH,1.2);A.circ(t(1)-7,y1-8,5,LAMP,CH,1.2);A.rect(t(1)-2,y0+12,4,y1-y0-24,2,cab==='zil'?CH:'#2a2d33');
      if(c.id==='pozhar'||c.id==='musorovoz'){A.rect(t(cab0)+8,40,10,20,2,c.id==='pozhar'?'#3f7bff':'#ffb020');}
      void hood;
    }
    tails(t(c0));
  }
  else if(T==='tractor'){ // МТЗ-80: большие задние колёса, капот впереди, кабина сзади
    A.rect(t(.05),y0-8,30,14,4,TYRE);A.rect(t(.05),y1-6,30,14,4,TYRE);A.rect(t(.68),y0+2,20,10,3,TYRE);A.rect(t(.68),y1-12,20,10,3,TYRE);
    for(let i=0;i<5;i++){A.line(t(.05)+3+i*6,y0-8,t(.05)+3+i*6,y0+6,'#3b3f46',2);A.line(t(.05)+3+i*6,y1-6,t(.05)+3+i*6,y1+8,'#3b3f46',2);}
    A.rect(t(.42),y0+18,t(1)-t(.42),y1-y0-36,8,col,dk,2.5); // капот
    A.rect(t(.02),y0+6,t(.44)-t(.02),y1-y0-12,6,'#e8e8e4','#5f646c',2.5);A.rect(t(.06),y0+10,t(.4)-t(.06),y1-y0-20,4,GL);A.rect(t(.1),y0+14,t(.36)-t(.1),y1-y0-28,3,'#f4f4f0');
    A.rect(t(.62),y0+28,8,8,4,'#3a3f48');A.rect(t(1)-6,y0+20,6,y1-y0-40,2,'#e8e8e4');
    A.circ(t(1)-4,y0+22,4,LAMP);A.circ(t(1)-4,y1-22,4,LAMP);
  }
  else if(T==='trekol'){
    for(const f of[.16,.5,.84]){A.rect(t(f)-16,y0-10,32,16,8,TYRE);A.rect(t(f)-16,y1-6,32,16,8,TYRE);}
    body(16,0,1,4);glassBand(.62,.88,10,8);roof(.08,.62,12,8,shade(col,.12));A.rect(t(.02),y0+14,10,y1-y0-28,3,'#4a4f58');
    A.rect(t(.25),38,30,24,3,'#3a3f48');lamps(t(1),'r2');tails(t(0));
    A.rect(t(.1),y0+5,t(.9)-t(.1),5,2,'#e05a2b');
  }
  // объём: светлый кант сверху (свет слева-сверху экрана при морде вправо), тень снизу — по силуэту кузова
  if(!o.ghost){const cid='vat'+(++CLN);A.raw(`<clipPath id="${cid}"><path d="${roundPath([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],14)}"/></clipPath><g clip-path="url(#${cid})">`);
    A.rect(x0,y0,Lp,7,0,'#ffffff" fill-opacity=".22');A.rect(x0,y1-8,Lp,8,0,'#000000" fill-opacity=".14');A.raw('</g>');}
  return {W,H:100};
}

/* ================= ВИД СБОКУ (для альбома: морда вправо, 300×130, земля y=122) ================= */
// профиль в «условных метрах»: x — от зада к морде, y — от земли вверх
function side(c,o,A,P){
  const col=o.color||c.col,dk=shade(col,-.38),lt=shade(col,.25),ed=shade(col,-.25),id=c.id,S=c.s;
  const PR=PX[id]||PROF[S]||PROF.sedan,p=PR(c,col);
  // общий масштаб (ART2): 46 ед. на метр — Ока заметно меньше Волги; длинные (грузовики, автобусы) вписываются в ширину; opts.fit — растянуть как раньше
  const k=Math.min(280/p.L,92/p.H,o.fit?1e9:46),ox=(300-p.L*k)/2,G=122;
  const X=x=>ox+x*k,Y=y=>G-y*k,XY=a=>a.map(q=>[X(q[0]),Y(q[1])]);
  // тень
  if(o.shadow!==false)A.ell(150,G+1,p.L*k/2+6,4,'#000000',.18);
  // доп. фигуры позади кузова
  (p.back||[]).forEach(f=>f(A,X,Y,k,col));
  // кузов
  const RK=v=>Array.isArray(v)?v.map(q=>q*k):v*k,rk=RK(p.r);const bd=typeof p.body==='string'?dP(p.body,X,Y):roundPath(XY(p.body),rk);A.clip.push(bd);A.path(bd,col,dk,2.4);
  if(p.parts)p.parts.forEach(q=>A.clip.push(roundPath(XY(q.pts),RK(q.r||.06))));
  if(p.parts)p.parts.forEach(q=>A.path(roundPath(XY(q.pts),RK(q.r||.06)),q.c==null?col:(typeof q.c==='function'?q.c(col):q.c),q.st===false?null:dk,2.2));
  // объём: блик по верху кузова, тень по низу (по силуэту)
  if(!o.ghost){const cid='vas'+(++CLN);A.raw(`<clipPath id="${cid}">${A.clip.map(d=>`<path d="${d}"/>`).join('')}</clipPath><g clip-path="url(#${cid})">`);
    const yb=p.belt?p.belt[2]:p.H*.45;A.rect(0,Y(p.H+.2),300,(p.H+.2-yb)*k*.42,0,'#ffffff" fill-opacity=".16');A.rect(0,Y(.5),300,.5*k,0,'#000000" fill-opacity=".16');
    A.line(X(.1),Y(yb+.05),X(p.L-.1),Y(yb+.05),'#ffffff',1.6,.35);A.raw('</g>');}
  // поясная линия / молдинг
  if(p.belt)A.line(X(p.belt[0]),Y(p.belt[2]),X(p.belt[1]),Y(p.belt[2]),p.beltC||ed,p.beltW||2,p.beltC?1:.9);
  // стёкла
  (p.win||[]).forEach(w=>{A.path(typeof w==='string'?dP(w,X,Y):roundPath(XY(w),.05*k),GL,p.winC||shade(GL,-.3),p.winC?2:1.2);});
  if(p.win&&p.win[0]){const w0=p.win[0],q=typeof w0==='string'?w0.match(/-?[\d.]+/g).slice(0,2).map(Number):w0[0],x=X(q[0]),y=Y(q[1]);A.line(x+6,y-4,x+16,y-16,GL2,3,.6);}
  // двери
  (p.doors||[]).forEach(d=>A.line(X(d[0]),Y(d[1]),X(d[0]),Y(d[2]),dk,1.6,.8));
  // ручки
  (p.handles||[]).forEach(h=>A.rect(X(h[0]),Y(h[1]),.18*k,.04*k,1,CH));
  // фары и фонари
  if(p.lamp)p.lamp.forEach(q=>{if(q[3]==='r')A.circ(X(q[0]),Y(q[1]),q[2]*k,LAMP,CH,1.6);else A.rect(X(q[0])-q[2]*k*.35,Y(q[1])-q[2]*k*.6,q[2]*k*.7,q[2]*k*1.2,2,LAMP,CH,1.4);});
  if(p.tail)A.rect(X(p.tail[0]),Y(p.tail[1])-p.tail[2]*k/2,.07*k,p.tail[2]*k,1.5,TAIL);
  // бамперы
  (p.bump||[]).forEach(b=>A.rect(X(b[0]),Y(b[1])-.05*k,(b[2]-b[0])*k,.1*k,.05*k,b[3]||CH));
  // детали
  (p.det||[]).forEach(f=>f(A,X,Y,k,col));
  if(o._mid)o._mid();
  // колёса
  const tr=o.state==='rust';
  for(const w of p.wh){const cx=X(w[0]),cy=Y(w[1]),r=w[1]*k;A.circ(cx,cy,r+2.5,'#1b1d22');
    if(tr&&w===p.wh[0])A.ell(cx,cy+r*.15,r,r*.82,'#26292f');else A.circ(cx,cy,r,TYRE);
    if(w[4]==='ww')A.circ(cx,cy,r*.8,'#f4f2ea');
    A.circ(cx,cy,r*(w[2]||.48),w[3]||'#c9ced6');A.circ(cx,cy,r*.16,'#7d848d');}
  (p.front||[]).forEach(f=>f(A,X,Y,k,col));
  return {W:300,H:130,X,Y,k,p};
}
// --- профили по семействам ---
const W=(x,r,hub,hc)=>[x,r,hub,hc];
const PROF={
  sedan:c=>{const L=4.1,H=1.42,b=.85;const r={L,H:H+.05,r:.1,
    body:[[0,.3],[0,.78],[.05,b],[.85,b+.02],[1.25,H],[2.55,H],[3.05,b+.04],[4.02,b-.04],[L,.7],[L,.3],[3.9,.24],[.2,.24]],
    win:[[[1.05,b+.06],[1.32,H-.07],[1.95,H-.07],[1.95,b+.06]],[[2.03,b+.06],[2.03,H-.07],[2.5,H-.07],[2.9,b+.06]]],
    belt:[.05,4,b-.06],doors:[[1.99,.3,H-.03],[1.05,.32,b]],handles:[[1.55,b-.12],[2.4,b-.12]],
    lamp:c.lamp==='r4'?[[4.03,.68,.07,'r'],[3.97,.68,.07,'r']]:[[4.03,.67,.1,'q']],tail:[0,.66,.18],bump:[[3.85,.38,4.15],[-.05,.4,.3]],
    wh:[W(.82,.3),W(3.3,.3)],det:c.id==='shesterka'?[(A,X,Y,k)=>{A.rect(X(3.9),Y(.8),.14*k,.22*k,2,CH);A.rect(X(.05),Y(.62),3.9*k,.05*k,1,CH);A.rect(X(.0),Y(.82),.08*k,.22*k,1,TAIL);}]
      :c.id==='moskvich'?[(A,X,Y,k)=>{A.path(`M${X(.02)} ${Y(.86)}l${.35*k} ${-.02*k}`,'none',CH,2);A.rect(X(3.85),Y(.75),.22*k,.1*k,1,'#2a2d33');}]:[]};
    if(c.id==='moskvich'){r.body=[[0,.3],[0,.84],[.05,.9],[.8,.9],[1.15,1.48],[2.6,1.48],[3.0,.92],[3.98,.86],[L,.74],[L,.3],[3.9,.24],[.2,.24]];r.H=1.53;
      r.win=[[[1.0,.96],[1.22,1.41],[1.92,1.41],[1.92,.96]],[[2.0,.96],[2.0,1.41],[2.55,1.41],[2.85,.96]]];}
    if(c.id==='kopeyka')r.det=[(A,X,Y,k)=>{A.rect(X(.0),Y(.74),.07*k,.14*k,1,TAIL);A.rect(X(1.1),Y(.5),2.0*k,.04*k,1,CH);}];
    return r;},
  sedan24:c=>{const r=PROF.sedan(c);r.L=4.6;r.body=[[0,.3],[0,.8],[.05,.86],[1.0,.88],[1.45,1.42],[2.9,1.42],[3.4,.9],[4.52,.84],[4.6,.72],[4.6,.3],[4.4,.24],[.2,.24]];
    r.win=[[[1.25,.94],[1.5,1.35],[2.2,1.35],[2.2,.94]],[[2.28,.94],[2.28,1.35],[2.85,1.35],[3.25,.94]]];r.doors=[[2.24,.3,1.4],[1.2,.32,.88]];r.handles=[[1.75,.76],[2.75,.76]];
    r.belt=[.05,4.5,.62];r.beltC=CH;r.lamp=[[4.55,.68,.08,'r'],[4.48,.68,.08,'r']];r.bump=[[4.35,.38,4.66],[-.06,.4,.32]];r.wh=[W(.95,.32),W(3.7,.32)];
    r.det=[(A,X,Y,k)=>{A.path(`M${X(4.25)} ${Y(.87)}l${.12*k} ${-.1*k}l${.06*k} ${.05*k}`,'none',CH,2);}];
    if(c.id==='taxi')r.det.push((A,X,Y,k)=>{for(let i=0;i<10;i++)A.rect(X(1.3+i*.17),Y(.56),.17*k,.09*k,0,i%2?'#1d2128':'#ffffff');for(let i=0;i<10;i++)A.rect(X(1.3+i*.17),Y(.47),.17*k,.09*k,0,i%2?'#ffffff':'#1d2128');A.rect(X(1.95),Y(1.55),.25*k,.13*k,2,'#2ecc71','#ffffff',1.2);});
    return r;},
  hatch:c=>{const L=4.0,H=1.4;return{L,H:H+.05,r:.1,
    body:[[0,.3],[0,.82],[.1,.95],[.35,H-.02],[2.25,H],[2.85,.88],[3.95,.76],[L,.62],[L,.3],[3.9,.24],[.15,.24]],
    win:[[[.32,.98],[.55,H-.08],[1.35,H-.08],[1.35,.98]],[[1.43,.98],[1.43,H-.08],[2.2,H-.08],[2.7,.98]]],
    belt:[.05,3.9,.62],beltC:'#1d2128',doors:[[1.39,.3,1.36]],handles:[[1.15,.84]],
    lamp:[[3.97,.66,.12,'q']],tail:[0,.72,.2],bump:[[3.8,.36,4.06,'#2a2d33'],[-.06,.38,.35,'#2a2d33']],wh:[W(.72,.3),W(3.15,.3,.55,'#9aa1aa')],
    det:[(A,X,Y,k)=>A.rect(X(.0),Y(1.42),.45*k,.07*k,2,'#1d2128')]};},
  oka:c=>{const L=3.2,H=1.42;return{L,H:H+.05,r:.12,
    body:[[0,.3],[0,1.0],[.12,H],[1.75,H],[2.35,.9],[3.15,.8],[L,.62],[L,.3],[3.1,.24],[.1,.24]],
    win:[[[.18,1.02],[.3,H-.08],[1.0,H-.08],[1.0,1.02]],[[1.08,1.02],[1.08,H-.08],[1.7,H-.08],[2.2,1.02]]],
    belt:[.05,3.1,.62],beltC:'#2a2d33',doors:[[1.04,.3,1.38]],handles:[[.85,.88]],lamp:[[3.16,.68,.12,'q']],tail:[0,.75,.22],
    bump:[[3.05,.36,3.25,'#2a2d33'],[-.05,.38,.25,'#2a2d33']],wh:[W(.58,.27),W(2.62,.27)],det:[]};},
  zap:c=>{const L=3.75,H=1.38;return{L,H:H+.05,r:.16,
    body:[[0,.3],[0,.8],[.35,.92],[.85,H],[2.05,H],[2.7,.86],[3.65,.72],[L,.58],[L,.3],[3.6,.24],[.1,.24]],
    win:[[[.9,.95],[1.05,H-.07],[1.48,H-.07],[1.48,.95]],[[1.55,.95],[1.55,H-.07],[2.0,H-.07],[2.5,.95]]],
    belt:[.05,3.65,.66],doors:[[1.52,.3,1.34]],handles:[[1.25,.83]],lamp:[[3.68,.62,.08,'r']],tail:[0,.66,.16],bump:[[3.55,.36,3.8],[-.05,.38,.25]],
    wh:[W(.72,.3),W(2.95,.3)],
    det:[(A,X,Y,k,col)=>{A.path(roundPath([[X(.45),Y(.74)],[X(.55),Y(.98)],[X(1.0),Y(.98)],[X(1.05),Y(.74)]],.06*k),shade(col,-.22),shade(col,-.45),1.8);for(let i=0;i<3;i++)A.line(X(.6),Y(.8+i*.06),X(.95),Y(.8+i*.06),shade(col,-.55),1.5);}]};},
  bug:c=>{const L=3.35,H=1.4;return{L,H:H+.05,r:.4,
    body:[[0,.3],[0,.75],[.7,H],[1.85,H],[3.0,.92],[L,.62],[L,.3],[3.2,.24],[.1,.24]],r2:0,
    win:[[[.85,.95],[1.0,H-.1],[1.45,H-.08],[1.45,.95]],[[1.53,.95],[1.53,H-.08],[1.85,H-.1],[2.35,.95]]],
    belt:[.1,3.2,.62],beltC:CH,doors:[[1.49,.32,1.36]],handles:[[1.25,.85]],lamp:[[3.24,.72,.08,'r']],tail:[.03,.62,.14],bump:[[3.1,.36,3.42],[-.07,.38,.28]],
    wh:[W(.62,.29,.6),W(2.72,.29,.6)],det:[(A,X,Y,k)=>{for(let i=0;i<4;i++)A.line(X(.18+i*.08),Y(.6+i*.08),X(.32+i*.08),Y(.58+i*.08),'#2a2d33',1.4);}]};},
  niva:c=>{const L=3.75,H=1.62;return{L,H:H+.05,r:.08,
    body:[[0,.38],[0,1.0],[.08,H],[2.35,H],[2.75,1.05],[3.7,.98],[L,.86],[L,.38],[3.6,.3],[.1,.3]],
    win:[[[.12,1.1],[.18,H-.08],[.85,H-.08],[.85,1.1]],[[.93,1.1],[.93,H-.08],[2.25,H-.08],[2.6,1.1]]],
    belt:[.05,3.7,.62],beltC:'#2a2d33',beltW:3,doors:[[1.55,.36,1.58],[.89,.4,1.6]],handles:[[1.35,1.0]],lamp:[[3.72,.8,.1,'r']],tail:[0,.85,.2],
    bump:[[3.6,.45,3.82,'#2a2d33'],[-.06,.46,.25,'#2a2d33']],wh:[W(.68,.35,.5),W(3.0,.35,.5)],
    det:[(A,X,Y,k)=>{A.rect(X(.4),Y(.33),2.6*k,.06*k,1,'#2a2d33');}]};},
  uaz:c=>{const L=4.0,H=2.0;return{L,H:H+.05,r:.06,
    body:[[0,.45],[0,1.15],[.05,1.25],[2.85,1.25],[3.0,1.15],[3.95,1.05],[L,.95],[L,.45],[3.8,.38],[.1,.38]],
    parts:[{pts:[[.04,1.22],[.04,H],[2.55,H],[2.75,1.22]],r:.06,c:'#e7e3cf'}],
    win:[[[.1,1.32],[.1,H-.1],[.9,H-.1],[.9,1.32]],[[1.0,1.32],[1.0,H-.1],[1.75,H-.1],[1.75,1.32]],[[1.85,1.32],[1.85,H-.1],[2.5,H-.1],[2.65,1.32]]],
    doors:[[.95,.42,1.22],[1.8,.42,1.22]],handles:[[1.5,1.12],[2.3,1.12]],lamp:[[3.92,.92,.12,'r']],tail:[0,.95,.2],bump:[[3.85,.55,4.1,'#2a2d33'],[-.08,.55,.15,'#2a2d33']],
    wh:[W(.95,.39,.4),W(3.33,.39,.4)],
    det:[(A,X,Y,k)=>{A.rect(X(0),Y(.86),3.95*k,.22*k,0,'#2d63c8');A.text(X(1.6),Y(.86)-.04*k,'МИЛИЦИЯ',.19*k,'#ffffff');A.rect(X(1.2),Y(H+.14),.5*k,.14*k,2,'#1d2430');A.rect(X(1.22),Y(H+.13),.22*k,.1*k,2,'#3f7bff');A.rect(X(1.46),Y(H+.13),.22*k,.1*k,2,'#ff3b4e');
      A.circ(X(-.05),Y(1.0),.32*k,TYRE);A.circ(X(-.05),Y(1.0),.14*k,'#6a7079');}]};},
  buhanka:c=>{const L=4.4,H=2.05,amb=c.id==='tabletka';return{L,H:H+.05,r:.32,
    body:[[0,.42],[0,H-.15],[.15,H],[3.85,H],[4.3,1.55],[L,1.15],[L,.42],[4.2,.36],[.2,.36]],
    parts:amb?[]:[{pts:[[.04,1.25],[.04,H-.12],[.18,H-.03],[3.82,H-.03],[4.12,1.52],[4.2,1.25]],r:.24,c:'#f1eedf',st:false}],
    win:[[[3.3,1.3],[3.3,1.82],[3.85,1.85],[4.2,1.3]],[[2.45,1.3],[2.45,1.82],[3.1,1.82],[3.1,1.3]],[[1.35,1.3],[1.35,1.8],[2.25,1.8],[2.25,1.3]],[[.25,1.3],[.25,1.8],[1.15,1.8],[1.15,1.3]]],
    belt:[.05,4.3,1.22],beltC:amb?'#e33a3a':null,beltW:amb?5:2,doors:[[3.2,.4,1.95],[2.35,.4,1.95]],handles:[[2.95,1.15]],lamp:[[4.36,1.02,.12,'r']],tail:[0,1.0,.2],
    bump:[[4.25,.55,4.5,'#2a2d33'],[-.08,.55,.15,'#2a2d33']],wh:[W(.95,.4,.42),W(3.45,.4,.42)],
    det:amb?[(A,X,Y,k)=>{A.rect(X(1.6)-.06*k,Y(1.0)-.22*k,.12*k,.44*k,0,'#e33a3a');A.rect(X(1.6)-.22*k,Y(1.0)-.06*k,.44*k,.12*k,0,'#e33a3a');A.rect(X(3.3),Y(H+.13),.35*k,.13*k,3,'#3f7bff');}]:
      [(A,X,Y,k)=>{A.rect(X(4.28),Y(1.0),.12*k,.32*k,2,'#2a2d33');}]};},
  raf:c=>{const L=4.9,H=1.98,amb=c.id==='skoraya',ice=c.id==='morozh';return{L,H:H+.05,r:.3,
    body:[[0,.38],[0,H-.15],[.2,H],[3.7,H],[4.55,1.35],[4.85,1.05],[L,.85],[L,.38],[4.7,.32],[.2,.32]],
    win:ice?[[[3.75,1.32],[3.72,1.86],[3.95,1.86],[4.45,1.32]]]:[[[3.75,1.32],[3.72,1.86],[3.95,1.86],[4.45,1.32]],[[2.75,1.32],[2.75,1.84],[3.55,1.84],[3.55,1.32]],[[1.7,1.32],[1.7,1.84],[2.55,1.84],[2.55,1.32]],[[.3,1.32],[.3,1.84],[1.5,1.84],[1.5,1.32]]],
    belt:[.05,4.8,1.2],beltC:amb?'#e33a3a':ice?'#ff7aa8':shade(c.col,-.25),beltW:amb||ice?6:2,doors:[[3.65,.36,1.95],[2.65,.36,1.95]],handles:[[3.35,1.12]],lamp:[[4.86,.86,.1,'r']],tail:[0,.9,.25],
    bump:[[4.7,.48,4.98],[-.06,.48,.25]],wh:[W(1.05,.36),W(3.85,.36)],
    det:amb?[(A,X,Y,k)=>{A.text(X(1.15),Y(.68),'03',.32*k,'#e33a3a',900);A.rect(X(2.15)-.06*k,Y(.82)-.22*k,.12*k,.44*k,0,'#e33a3a');A.rect(X(2.15)-.22*k,Y(.82)-.06*k,.44*k,.12*k,0,'#e33a3a');A.rect(X(3.3),Y(H+.15),.45*k,.15*k,3,'#3f7bff');}]
      :ice?[(A,X,Y,k)=>{A.text(X(1.95),Y(1.45),'МОРОЖЕНОЕ',.3*k,'#d23c6e',900);A.path(`M${X(1.85)} ${Y(.6)}l${.15*k} ${.5*k}l${.15*k} ${-.5*k}z`,'#e0a050','#a8682a',1.5);A.circ(X(2.0),Y(1.12),.15*k,'#ff8fc0');A.circ(X(2.0),Y(1.32),.12*k,'#ffffff');}]:[]};},
  gazel:c=>{const L=5.5,H=2.2;return{L,H:H+.05,r:.2,
    body:[[0,.4],[0,H-.1],[.1,H],[4.2,H],[4.55,1.35],[5.4,1.12],[L,.9],[L,.4],[5.3,.35],[.2,.35]],
    win:[[[4.15,1.38],[4.15,2.05],[4.25,2.05],[4.5,1.38]],[[3.2,1.38],[3.2,2.0],[4.0,2.0],[4.0,1.38]],[[2.2,1.38],[2.2,2.0],[3.05,2.0],[3.05,1.38]],[[1.2,1.38],[1.2,2.0],[2.05,2.0],[2.05,1.38]],[[.2,1.38],[.2,2.0],[1.05,2.0],[1.05,1.38]]],
    belt:[.05,5.4,1.25],beltC:'#2a6fd6',beltW:5,doors:[[4.1,.38,2.15],[3.1,.4,2.1]],handles:[[3.85,1.15]],lamp:[[5.45,.95,.14,'q']],tail:[0,.9,.3],
    bump:[[5.3,.5,5.56,'#2a2d33'],[-.06,.5,.25,'#2a2d33']],wh:[W(1.1,.36,.5),W(4.45,.36,.5)],
    det:[(A,X,Y,k)=>{A.rect(X(3.25),Y(2.0)-.3*k,.75*k,.28*k,2,'#ffc233','#2a2d33',1);A.text(X(3.62),Y(1.78),'7',.22*k,'#1d2128',900);}]};},
  kabluk:c=>{const L=4.2,H=1.75;return{L,H:H+.05,r:.08,
    body:[[0,.3],[0,.82],[2.4,.82],[2.6,.85],[3.1,.85],[4.12,.8],[L,.68],[L,.3],[4.0,.24],[.15,.24]],
    parts:[{pts:[[2.55,.84],[2.62,1.4],[3.05,1.4],[3.25,.86]],r:.08},{pts:[[-.02,.8],[-.02,H],[2.5,H],[2.5,.8]],r:.06,c:col=>shade(col,.35)}],
    win:[[[2.62,.92],[2.68,1.33],[2.98,1.33],[3.15,.92]]],belt:[2.5,4.1,.62],doors:[[2.55,.3,.84]],handles:[[2.62,.74]],lamp:[[4.12,.67,.1,'q']],tail:[0,.6,.18],
    bump:[[3.95,.36,4.25,'#2a2d33'],[-.06,.38,.3,'#2a2d33']],wh:[W(.82,.3),W(3.3,.3)],det:[(A,X,Y,k)=>{A.line(X(.05),Y(1.25),X(2.45),Y(1.25),'#ffffff',2,.5);}]};},
  paz:c=>{const L=7.2,H=2.95;return{L,H:H+.05,r:.32,
    body:[[0,.5],[0,H-.2],[.25,H],[6.8,H],[L,H-.35],[L,.5],[6.95,.42],[.2,.42]],
    parts:[{pts:[[.02,1.3],[.02,H-.22],[.25,H-.02],[6.8,H-.02],[7.18,H-.35],[7.18,1.3]],r:.25,c:'#f3efe4',st:false}],
    win:[[[6.3,1.55],[6.3,2.65],[7.1,2.6],[7.1,1.55]],...[0,1,2,3,4].map(i=>[[.35+i*1.15,1.6],[.35+i*1.15,2.55],[1.35+i*1.15,2.55],[1.35+i*1.15,1.6]])],
    belt:[.05,7.15,1.38],beltC:shade(c.col,-.3),beltW:3,doors:[[6.25,.48,2.8],[5.85,.48,2.8]],lamp:[[7.15,.92,.15,'r']],tail:[0,.95,.3],bump:[[7.0,.6,7.32,'#2a2d33'],[-.08,.6,.3,'#2a2d33']],
    wh:[W(1.95,.47,.45),W(5.55,.47,.45)],det:[(A,X,Y,k)=>{A.rect(X(5.9),Y(2.5),.4*k,1.95*k,2,GL);}]};},
  laz:c=>{const L=9.2,H=3.0;return{L,H:H+.05,r:.45,
    body:[[0,.5],[0,H-.5],[.6,H],[8.6,H],[L,H-.6],[L,.5],[9.0,.42],[.2,.42]],
    parts:[{pts:[[.02,1.2],[.02,H-.5],[.6,H-.02],[8.6,H-.02],[9.18,H-.6],[9.18,1.2]],r:.4,c:'#f1ebdc',st:false}],
    win:[[[8.3,1.5],[8.3,2.6],[9.0,2.4],[9.12,1.5]],...[0,1,2,3,4,5].map(i=>[[.5+i*1.3,1.6],[.5+i*1.3,2.55],[1.65+i*1.3,2.55],[1.65+i*1.3,1.6]])],
    belt:[.05,9.15,1.3],beltC:'#c9ced6',beltW:3,doors:[[8.2,.48,2.8],[7.9,.48,2.8]],lamp:[[9.12,.9,.15,'r']],tail:[0,.95,.3],bump:[[8.95,.6,9.32],[-.08,.6,.3]],
    wh:[W(3.0,.5,.5),W(7.19,.5,.5)],det:[(A,X,Y,k)=>{for(let i=0;i<6;i++)A.line(X(.6+i*.25),Y(H+.08),X(.75+i*.25),Y(H+.08),'#7f8790',3);A.rect(X(7.95),Y(2.55),.35*k,2*k,2,GL);}]};},
  liaz:c=>{const L=10.5,H=3.05;return{L,H:H+.05,r:.4,
    body:[[0,.5],[0,H-.4],[.5,H],[10.0,H],[L,H-.5],[L,.5],[10.3,.42],[.2,.42]],
    parts:[{pts:[[.02,1.9],[.02,H-.4],[.5,H-.02],[10,H-.02],[10.48,H-.5],[10.48,1.9]],r:.35,c:'#f3eccf',st:false}],
    win:[[[9.6,1.5],[9.6,2.7],[10.35,2.55],[10.42,1.5]],...[0,1,2,3,4,5,6].map(i=>[[.5+i*1.25,1.6],[.5+i*1.25,2.6],[1.6+i*1.25,2.6],[1.6+i*1.25,1.6]])],
    belt:[.05,10.45,1.4],beltC:'#c0392b',beltW:4,doors:[[9.4,.48,2.85],[4.5,.48,2.85]],lamp:[[10.42,.95,.16,'r']],tail:[0,1.0,.3],bump:[[10.25,.6,10.6,'#2a2d33'],[-.08,.6,.3,'#2a2d33']],
    wh:[W(3.08,.52,.45),W(8.23,.52,.45)],det:[(A,X,Y,k)=>{A.rect(X(9.2),Y(2.55),.38*k,2*k,2,GL);A.rect(X(4.3),Y(2.55),.4*k,2*k,2,GL);}]};},
  ikarus:c=>{const L=16.5,H=3.1,j=7.2;return{L,H:H+.05,r:.35,
    body:[[0,.5],[0,H-.3],[.3,H],[16.2,H],[L,H-.4],[L,.5],[16.3,.42],[.2,.42]],
    parts:[{pts:[[0,.95],[0,1.1],[L,1.1],[L,.95]],r:0,c:'#ffffff',st:false}],
    win:[[[15.7,1.5],[15.7,2.75],[16.4,2.6],[16.45,1.5]],...[0,1,2,3,4,5,6,7,8,9,10].map(i=>{const x=.4+i*1.38+(i>=5?1.0:0);return[[x,1.55],[x,2.65],[x+1.15,2.65],[x+1.15,1.55]];})],
    doors:[[15.5,.48,2.9]],lamp:[[16.42,.85,.14,'q']],tail:[0,.95,.3],bump:[[16.3,.6,16.6,'#2a2d33'],[-.08,.6,.3,'#2a2d33']],
    wh:[W(2.0,.5,.4),W(9.5,.5,.4),W(14.6,.5,.4)],
    det:[(A,X,Y,k)=>{A.rect(X(j),Y(H-.05),.9*k,(H-.55)*k,2,'#3a3f48');for(let i=0;i<5;i++)A.line(X(j+.1+i*.17),Y(H-.15),X(j+.1+i*.17),Y(.65),'#7a8494',2);}]};},
  trolley:c=>{const L=11.0,H=3.2;return{L,H:H+.9,r:.35,
    body:[[0,.5],[0,H-.3],[.4,H],[10.6,H],[L,H-.5],[L,.5],[10.8,.42],[.2,.42]],
    parts:[{pts:[[.02,.5],[.02,1.45],[10.98,1.45],[10.98,.5]],r:.1,c:'#ffffff',st:false}],
    win:[[[10.2,1.6],[10.2,2.85],[10.85,2.7],[10.9,1.6]],...[0,1,2,3,4,5,6].map(i=>[[.4+i*1.4,1.65],[.4+i*1.4,2.75],[1.6+i*1.4,2.75],[1.6+i*1.4,1.65]])],
    doors:[[10.0,.48,2.95],[5.2,.48,2.95]],lamp:[[10.9,.95,.15,'r']],tail:[0,1.0,.3],bump:[[10.75,.6,11.1,'#2a2d33'],[-.08,.6,.3,'#2a2d33']],
    wh:[W(2.4,.5,.45),W(8.4,.5,.45)],
    det:[(A,X,Y,k)=>{A.rect(X(6.4),Y(H+.22),2.2*k,.22*k,3,'#7f8790');A.line(X(7.2),Y(H+.2),X(1.5),Y(H+.85),'#2a2d33',2.5);A.line(X(7.5),Y(H+.2),X(1.8),Y(H+.78),'#2a2d33',2.5);A.rect(X(10.05),Y(2.85),.45*k,1.9*k,2,GL);}]};},
  truck:(c,col)=>{ // кабина-капотная (ГАЗ-53/ЗИЛ-130/ГАЗ-66) или КамАЗ; груз по c.cargo
    const over=c.cab==='kamaz',g66=c.cab==='g66',zil=c.cab==='zil',D=DIM[c.id]||{};
    // габариты и база — по справочнику; передняя ось у капотных под капотом, у КамАЗа и ГАЗ-66 — под кабиной
    const L=D.L||6.4,WB=D.WB||3.7,H=c.cargo==='fire'?2.75:c.cargo==='crane'?2.95:2.4,wr=g66?.56:over?.54:.47,
      fx=L-(over?1.32:g66?1.05:zil?1.2:1.06),cab0=over?L-2.1:g66?L-1.95:zil?L-2.75:L-2.85,cabTop=over?2.95:g66?2.42:zil?2.3:2.2;
    const axl=c.id==='kamaz'?[fx-WB,fx-WB+1.32,fx]:[fx-WB,fx];
    const r={L,H:Math.max(H,cabTop)+.05,r:.15,body:[],parts:[],win:[],doors:[],handles:[],det:[],back:[],front:[],
      wh:axl.map(x=>W(x,wr,.42,g66?'#5f6b3a':'#b8bec6')),lamp:[],tail:[0,.85,.18]};
    // рама
    r.body=[[0,.72],[0,.95],[L-.1,.95],[L,.85],[L,.62],[L-.2,.55],[.1,.55]];
    if(over){ // КамАЗ: высокая кабина над мотором, спальник
      r.parts.push({pts:[[cab0,.62],[cab0,cabTop],[L-.22,cabTop],[L-.02,cabTop-.55],[L,.62]],r:[.04,.1,.12,.1,.04]});
      r.win.push([[L-.82,1.85],[L-.82,cabTop-.14],[L-.3,cabTop-.14],[L-.06,cabTop-.62],[L-.06,1.85]]);r.win.push(WQ(cab0+.15,cab0+.15,cab0+.5,cab0+.5,2.2,2.6));
      r.doors.push([L-.9,.8,cabTop-.08]);r.lamp=[[L-.02,.82,.13,'q']];
      r.det.push((A,X,Y,k)=>{A.rect(X(cab0+.08),Y(1.05),1.95*k,.1*k,1,'#ffffff');A.rect(X(L-.05),Y(.7),.07*k,.32*k,1,'#2a2d33');A.rect(X(L-.6),Y(.95),.3*k,.25*k,1,'#2a2d33');
        for(const x of axl.slice(0,2))A.path(`M${X(x-.6)} ${Y(.95)}Q${X(x)} ${Y(1.25)} ${X(x+.6)} ${Y(.95)}`,'none','#2a2d33',3);});}
    else if(g66){ // ГАЗ-66 «Шишига»: тупоносая кабина над мотором, огромные колёса, высоко
      r.parts.push({pts:[[cab0,1.0],[cab0,cabTop],[cab0+.1,cabTop+.02],[L-.6,cabTop],[L-.38,1.72],[L-.05,1.55],[L,1.05],[L,.95]],r:[.04,.08,.06,.08,.1,.1,.06,.04]});
      r.parts.push({pts:[[fx-.75,1.0],[fx-.6,1.35],[fx+.55,1.35],[fx+.95,1.0]],r:[.04,.18,.18,.04],c:col=>shade(col,-.1)});
      r.win.push([[L-1.2,1.78],[L-1.2,cabTop-.12],[L-.66,cabTop-.12],[L-.45,1.78]]);r.doors.push([L-1.28,1.0,cabTop-.05]);r.lamp=[[L-.08,1.18,.1,'r']];
      r.det.push((A,X,Y,k)=>{A.rect(X(L-.04),Y(1.4),.06*k,.35*k,1,'#2a2d33');for(let i=0;i<5;i++)A.line(X(L-.04),Y(1.36-i*.06),X(L),Y(1.36-i*.06),'#9aa1aa',1);
        A.circ(X(cab0+.3),Y(1.75),.38*k,'#2a2d33');A.circ(X(cab0+.3),Y(1.75),.18*k,'#5f6b3a');});}
    else if(zil){ // ЗИЛ-130: широкое плоское «лицо», крылья заодно с капотом, гнутое лобовое стекло
      const hood0=cab0+1.25;
      r.parts.push({pts:[[cab0,.9],[cab0,cabTop],[cab0+.08,cabTop+.02],[cab0+.95,cabTop],[hood0-.05,1.55],[hood0,1.48],[L-.12,1.42],[L,1.32],[L,.75],[cab0+1.0,.75]],r:[.04,.12,.1,.12,.06,.06,.08,.06,.04,.04]});
      r.win.push([[cab0+.55,1.58],[cab0+.55,cabTop-.12],[cab0+.92,cabTop-.12],[hood0-.12,1.58]]);r.win.push(WQ(cab0+.1,cab0+.1,cab0+.45,cab0+.45,1.58,cabTop-.12));
      r.doors.push([hood0-.02,.85,1.5],[cab0+.02,.9,cabTop]);r.lamp=[[L-.2,1.18,.1,'r']];
      r.det.push((A,X,Y,k)=>{A.path(`M${X(fx-.62)} ${Y(.76)}Q${X(fx)} ${Y(1.32)} ${X(fx+.62)} ${Y(.76)}`,'#22252b');A.rect(X(L-.07),Y(1.32),.08*k,.5*k,1,CH);
        for(let i=0;i<5;i++)A.line(X(L-.07),Y(1.26-i*.08),X(L+.01),Y(1.26-i*.08),'#7f8790',1.3);A.rect(X(L-.16),Y(.82),.22*k,.1*k,1,CH);});}
    else{ // ГАЗ-53: круглая кабина, длинный узкий капот, отдельные круглые крылья
      const hood0=cab0+1.25;
      r.parts.push({pts:[[cab0,.9],[cab0,cabTop-.1],[cab0+.2,cabTop],[cab0+.9,cabTop],[hood0-.05,1.55],[hood0,1.45],[L-.15,1.38],[L-.05,1.25],[L-.05,.95],[hood0,.95]],r:[.04,.2,.15,.2,.06,.06,.12,.06,.04,.04]});
      r.parts.push({pts:[[fx-.7,.78],[fx-.62,1.05],[fx-.3,1.22],[fx+.35,1.22],[fx+.7,1.02],[fx+.85,.8]],r:[.02,.15,.2,.2,.15,.02],c:col=>shade(col,-.06)});
      r.parts.push({pts:[[cab0+.95,.78],[cab0+.95,.86],[fx-.68,.86],[fx-.68,.78]],r:.02,c:'#2a2d33',st:false});
      r.win.push([[cab0+.5,1.58],[cab0+.5,cabTop-.12],[cab0+.86,cabTop-.12],[hood0-.12,1.58]]);r.win.push(WQ(cab0+.12,cab0+.15,cab0+.42,cab0+.42,1.58,cabTop-.14));
      r.doors.push([hood0-.02,.9,1.5]);r.lamp=[[fx+.55,1.15,.1,'r']];
      r.det.push((A,X,Y,k)=>{A.rect(X(L-.08),Y(1.3),.06*k,.38*k,1,'#2a2d33');for(let i=0;i<6;i++)A.line(X(L-.07),Y(1.27-i*.055),X(L-.02),Y(1.27-i*.055),'#9aa1aa',1.1);
        for(let i=0;i<3;i++)A.line(X(hood0+.4+i*.12),Y(1.2),X(hood0+.4+i*.12),Y(1.34),shade(col,-.35),1.4);});}
    const cg=c.cargo,box=c.box||col,c1=cab0-.08;
    if(cg==='bort')r.parts.push({pts:[[0,.9],[0,1.65],[c1,1.65],[c1,.9]],r:.04,c:over?'#7f8a4a':'#b88a4a'}),r.det.push((A,X,Y,k)=>{for(let i=1;i<6;i++)A.line(X(i*c1/6),Y(.95),X(i*c1/6),Y(1.6),'#7a5a30',1.4);A.line(X(.05),Y(1.28),X(c1-.05),Y(1.28),'#7a5a30',1.4);});
    if(cg==='box')r.parts.push({pts:[[0,.9],[0,2.4],[c1,2.4],[c1,.9]],r:.06,c:box}),r.det.push((A,X,Y,k)=>{A.text(X(c1/2),Y(1.48),c.txt,.42*k,'#8a3b1e',900);});
    if(cg==='tank'){r.parts.push({pts:[[.05,.95],[.05,2.2],[c1-.05,2.2],[c1-.05,.95]],r:.55,c:box});r.det.push((A,X,Y,k)=>{A.rect(X(c1/2-.2),Y(2.35),.4*k,.18*k,2,shade(box,-.25));if(c.txt)A.text(X(c1/2),Y(1.45),c.txt,.38*k,'#2d5fa8',900);else A.rect(X(.05),Y(1.5),(c1-.1)*k,.08*k,0,'#ffffff');});
      if(c.id==='polivalka')r.front.push((A,X,Y,k)=>{A.rect(X(L-.05),Y(.6),.25*k,.12*k,2,'#3a3f48');for(let i=0;i<4;i++)A.line(X(L+.25),Y(.55),X(L+.6+i*.05),Y(.3-i*.05),'#7fc8f0',2,.7);});}
    if(cg==='dump')r.parts.push({pts:[[0,.95],[-.05,2.1],[c1,2.2],[c1,.95]],r:.06,c:box}),r.det.push((A,X,Y,k)=>{for(let i=1;i<4;i++)A.line(X(i*c1/4),Y(1.0),X(i*c1/4),Y(2.15),shade(box,-.3),1.6);A.rect(X(c1-.2),Y(2.45),.5*k,.3*k,2,box,shade(box,-.4),1.5);});
    if(cg==='musor')r.parts.push({pts:[[0,.95],[0,2.15],[.4,2.4],[c1,2.4],[c1,.95]],r:.25,c:box}),r.det.push((A,X,Y,k)=>{A.line(X(.35),Y(1.0),X(.35),Y(2.3),shade(box,-.35),2);A.rect(X(1.2),Y(1.9),2.1*k,.5*k,3,shade(box,.15));});
    if(cg==='tent')r.parts.push({pts:[[0,.95],[0,2.15],[.2,2.35],[c1-.2,2.35],[c1,2.15],[c1,.95]],r:.12,c:'#7b8150'}),r.det.push((A,X,Y,k)=>{for(let i=1;i<4;i++)A.line(X(i*c1/4),Y(1.0),X(i*c1/4),Y(2.3),'#5f6540',1.6);});
    if(cg==='fire'){r.parts.push({pts:[[0,.9],[0,2.1],[c1,2.1],[c1,.9]],r:.08});r.det.push((A,X,Y,k)=>{A.rect(X(0),Y(1.55),c1*k,.12*k,0,'#ffffff');for(let i=0;i<3;i++)A.rect(X(.3+i*1.1),Y(1.95),.85*k,.3*k,2,shade(col,-.2));
      A.rect(X(.1),Y(2.45),(L-.4)*k,.18*k,2,'#c9ced6');for(let x=.25;x<L-.4;x+=.3)A.line(X(x),Y(2.45),X(x),Y(2.27),'#9aa1aa',1.5);A.text(X(c1/2),Y(1.2),'01',.3*k,'#ffffff',900);A.rect(X(cab0+.4),Y(cabTop+.15),.4*k,.15*k,3,'#3f7bff');});}
    if(cg==='crane'){r.parts.push({pts:[[0,.9],[0,1.35],[c1,1.35],[c1,.9]],r:.05,c:'#4a4f58'});r.det.push((A,X,Y,k)=>{A.path(roundPath([[X(.6),Y(1.35)],[X(.6),Y(2.0)],[X(1.8),Y(2.0)],[X(2.0),Y(1.35)]],.08*k),col,shade(col,-.45),2);
      A.path(`M${X(1.2)} ${Y(1.9)}L${X(L-.3)} ${Y(2.75)}L${X(L-.3)} ${Y(2.55)}L${X(1.3)} ${Y(1.7)}Z`,col,shade(col,-.45),2);A.line(X(L-.3),Y(2.6),X(L-.3),Y(1.6),'#2a2d33',1.5);A.rect(X(L-.4),Y(1.6),.2*k,.15*k,1,'#2a2d33');});}
    if(c.id==='musorovoz')r.det.push((A,X,Y,k)=>{A.rect(X(cab0+.35),Y(cabTop+.12),.35*k,.12*k,3,'#ffb020');});
    return r;},
  tractor:c=>{const L=3.9,H=2.75;return{L,H:H+.05,r:.1,
    body:[[1.3,.85],[1.3,1.55],[L-.1,1.5],[L,1.35],[L,.85]],
    parts:[{pts:[[.05,1.1],[.05,H],[1.55,H],[1.55,1.1]],r:.08,c:'#e8e8e4'},{pts:[[0,.95],[0,1.25],[1.7,1.25],[1.7,.95]],r:.05,c:'#3a3f48'}],
    win:[[[.18,1.45],[.18,H-.12],[.75,H-.12],[.75,1.45]],[[.85,1.45],[.85,H-.12],[1.42,H-.12],[1.42,1.45]]],
    lamp:[[L-.05,1.3,.1,'q']],tail:[0,1.3,.15],
    wh:[W(.75,.82,.48,'#c8302b'),W(3.2,.48,.45,'#c8302b')],
    det:[(A,X,Y,k)=>{A.rect(X(2.3),Y(2.15),.1*k,.65*k,1,'#2a2d33');for(let i=0;i<4;i++)A.line(X(L-.06),Y(1.45-i*.12),X(L-.4),Y(1.45-i*.12),'#2a2d33',1.2);}],
    front:[(A,X,Y,k)=>{for(let i=0;i<10;i++){const a=i/10*Math.PI*2;A.line(X(.75)+Math.cos(a)*.7*k,Y(.82)+Math.sin(a)*.7*k,X(.75)+Math.cos(a)*.84*k,Y(.82)+Math.sin(a)*.84*k,'#3b3f46',3);}}]};},
  trekol:c=>{const L=5.5,H=2.6;return{L,H:H+.05,r:.35,
    body:[[0,.95],[0,1.75],[.15,1.85],[L-.2,1.75],[L,1.45],[L,.95],[L-.3,.85],[.3,.85]],
    parts:[{pts:[[.3,1.8],[.3,H],[3.7,H],[4.4,1.8]],r:.25,c:col=>shade(col,.08)}],
    win:[[[3.7,1.9],[3.6,H-.12],[3.85,H-.12],[4.25,1.9]],[[2.4,1.95],[2.4,H-.15],[3.4,H-.15],[3.4,1.95]],[[.5,1.95],[.5,H-.15],[2.1,H-.15],[2.1,1.95]]],
    belt:[0,5.4,1.35],beltC:'#e05a2b',beltW:5,lamp:[[5.45,1.5,.12,'r']],tail:[0,1.45,.2],
    wh:[W(.9,.68,.35,'#d0d4da'),W(2.75,.68,.35,'#d0d4da'),W(4.6,.68,.35,'#d0d4da')]};},
  pobeda:c=>{const L=4.65,H=1.62;return{L,H:H+.05,r:.5,
    body:[[0,.35],[0,.8],[.3,1.15],[1.4,H],[2.65,H],[3.25,1.05],[4.45,.98],[L,.75],[L,.35],[4.4,.28],[.2,.28]],
    win:[[[1.35,1.12],[1.55,H-.1],[2.15,H-.08],[2.15,1.12]],[[2.23,1.12],[2.23,H-.08],[2.6,H-.1],[3.05,1.12]]],
    belt:[.1,4.5,.72],beltC:CH,doors:[[2.19,.34,1.58],[1.25,.4,1.15]],handles:[[1.85,1.0],[2.7,1.0]],lamp:[[4.55,.82,.1,'r']],tail:[.05,.75,.16],bump:[[4.35,.42,4.75],[-.1,.44,.35]],
    wh:[W(.95,.34,.62,'#e8e1cf'),W(3.65,.34,.62,'#e8e1cf')],
    det:[(A,X,Y,k)=>{for(let i=0;i<3;i++)A.line(X(4.25),Y(.55+i*.08),X(4.6),Y(.55+i*.08),CH,2);}]};},
  volga21:c=>{const L=4.8,H=1.62;return{L,H:H+.05,r:.32,
    body:[[0,.33],[0,.85],[.5,.98],[1.35,1.05],[1.65,H],[2.9,H],[3.45,1.02],[4.65,.98],[L,.75],[L,.33],[4.6,.26],[.2,.26]],
    win:[[[1.6,1.1],[1.8,H-.08],[2.35,H-.08],[2.35,1.1]],[[2.43,1.1],[2.43,H-.08],[2.85,H-.08],[3.25,1.1]]],
    belt:[.1,4.7,.75],beltC:CH,doors:[[2.39,.32,1.58],[1.45,.36,1.05]],handles:[[2.05,.95],[2.95,.95]],lamp:[[4.72,.82,.1,'r']],tail:[0,.82,.2],bump:[[4.5,.42,4.88],[-.08,.42,.35]],
    wh:[W(1.0,.34,.6,'#e8e1cf'),W(3.75,.34,.6,'#e8e1cf')],
    det:[(A,X,Y,k)=>{for(let i=0;i<5;i++)A.line(X(4.55),Y(.5+i*.07),X(4.82),Y(.5+i*.07),CH,1.8);A.path(`M${X(4.3)} ${Y(1.0)}l${.2*k} ${-.04*k}l${.05*k} ${.12*k}l${.06*k} ${-.02*k}`,'none',CH,2.2);}]};},
  zim:c=>{const L=5.5,H=1.66;return{L,H:H+.05,r:.4,
    body:[[0,.33],[0,.85],[.5,1.0],[1.4,1.05],[1.7,H],[3.45,H],[3.95,1.05],[5.35,.98],[L,.75],[L,.33],[5.3,.26],[.2,.26]],
    win:[[[1.65,1.12],[1.85,H-.08],[2.5,H-.08],[2.5,1.12]],[[2.58,1.12],[2.58,H-.08],[3.4,H-.08],[3.75,1.12]]],
    belt:[.1,5.4,.78],beltC:CH,doors:[[2.54,.32,1.62],[3.45,.32,1.08],[1.5,.36,1.08]],handles:[[2.2,.98],[3.1,.98]],lamp:[[5.42,.85,.1,'r']],tail:[0,.82,.2],bump:[[5.2,.42,5.58],[-.08,.42,.35]],
    wh:[W(1.1,.35,.6,'#e8e1cf'),W(4.35,.35,.6,'#e8e1cf')],det:[(A,X,Y,k)=>{for(let i=0;i<5;i++)A.line(X(5.25),Y(.5+i*.07),X(5.5),Y(.5+i*.07),CH,1.8);}]};},
  chaika:c=>{const L=5.6,H=1.62;return{L,H:H+.05,r:.15,
    body:[[0,.33],[0,.88],[.2,.95],[1.5,1.0],[1.85,H],[3.55,H],[4.05,1.0],[5.5,.94],[L,.8],[L,.33],[5.4,.26],[.2,.26]],
    win:[[[1.8,1.07],[2.0,H-.08],[2.65,H-.08],[2.65,1.07]],[[2.73,1.07],[2.73,H-.08],[3.5,H-.08],[3.85,1.07]]],
    belt:[.05,5.55,.72],beltC:CH,doors:[[2.69,.3,1.58],[1.6,.32,1.0]],handles:[[2.35,.9],[3.3,.9]],lamp:[[5.55,.75,.07,'r'],[5.47,.75,.07,'r']],tail:[0,.8,.24],bump:[[5.35,.42,5.7],[-.1,.42,.4]],
    wh:[W(1.15,.35,.62,'#d6dae0'),W(4.4,.35,.62,'#d6dae0')],det:[(A,X,Y,k)=>{A.line(X(.4),Y(.95),X(1.2),Y(1.08),CH,2);for(let i=0;i<4;i++)A.line(X(5.45),Y(.48+i*.08),X(5.62),Y(.48+i*.08),CH,1.6);}]};},
  zil:c=>{const L=6.3,H=1.55;return{L,H:H+.05,r:.08,
    body:[[0,.33],[0,.88],[.1,.93],[1.6,.95],[1.95,H],[4.25,H],[4.6,.95],[6.25,.9],[L,.78],[L,.33],[6.1,.26],[.2,.26]],
    win:[[[1.95,1.02],[2.1,H-.07],[2.85,H-.07],[2.85,1.02]],[[2.93,1.02],[2.93,H-.07],[3.6,H-.07],[3.6,1.02]],[[3.68,1.02],[3.68,H-.07],[4.2,H-.07],[4.45,1.02]]],
    belt:[.05,6.25,.7],beltC:CH,doors:[[2.89,.3,1.52],[3.64,.3,1.52],[1.8,.32,.95]],handles:[[2.5,.86],[3.3,.86]],lamp:[[6.22,.74,.1,'q']],tail:[0,.8,.24],bump:[[6.1,.42,6.4],[-.1,.42,.35]],
    wh:[W(1.2,.36,.6,'#d6dae0'),W(5.0,.36,.6,'#d6dae0')],det:[(A,X,Y,k)=>{A.line(X(.05),Y(.58),X(6.2),Y(.58),CH,1.6);A.rect(X(5.85),Y(1.02),.12*k,.12*k,1,'#c0392b');}]};}
};

/* ---------- настоящие пропорции (замечание владельца 10.10: «не похожи на настоящие») ----------
   DIM[id] — габариты в метрах по справочникам (длина L, ширина W, база WB) и место стёкол для вида сверху tg = [низ заднего стекла, крыша сзади, крыша спереди, низ лобового] (м от заднего края).
   PX[id] — свой профиль сбоку у каждой легковой/фургона: точки кузова (x от зада, y от земли, м) с радиусом скругления у КАЖДОЙ точки, окна, двери, фары, приметы. */
const DIM={
 kopeyka:{L:4.07,W:1.61,WB:2.424,tg:[1.12,1.42,2.6,2.98],tr:14},shesterka:{L:4.17,W:1.61,WB:2.424,tg:[1.15,1.45,2.63,3.02],tr:12},
 devyatka:{L:4.0,W:1.65,WB:2.46,tg:[.25,.45,2.2,2.75],tr:14},moskvich:{L:4.17,W:1.55,WB:2.4,tg:[1.05,1.25,2.55,2.88],tr:8},
 zapor:{L:3.73,W:1.49,WB:2.16,tg:[.95,1.25,2.25,2.65],tr:20},gorbaty:{L:3.33,W:1.4,WB:2.02,tg:[.55,1.15,2.0,2.45],tr:34},
 oka:{L:3.2,W:1.42,WB:2.18,tg:[.08,.2,1.75,2.3],tr:12},niva:{L:3.74,W:1.68,WB:2.2,tg:[.06,.15,2.35,2.72],tr:9},
 volga:{L:4.74,W:1.8,WB:2.8,tg:[1.35,1.68,3.0,3.42],tr:10},taxi:{L:4.74,W:1.8,WB:2.8,tg:[1.35,1.68,3.0,3.42],tr:10},
 pobeda:{L:4.67,W:1.69,WB:2.7,tg:[.45,1.25,2.75,3.2],tr:30},volga21:{L:4.83,W:1.8,WB:2.7,tg:[1.55,1.9,3.0,3.45],tr:22},
 zim:{L:5.53,W:1.9,WB:3.2,tg:[1.75,2.1,3.6,4.05],tr:22},chaika:{L:5.6,W:2.0,WB:3.25,tg:[1.8,2.05,3.65,3.98],tr:8},zil:{L:6.3,W:2.07,WB:3.76,tg:[1.7,2.0,4.4,4.75],tr:6},
 buhanka:{L:4.46,W:1.94,WB:2.3,tr:30},tabletka:{L:4.46,W:1.94,WB:2.3,tr:30},raf:{L:4.98,W:1.95,WB:2.62,tr:18},skoraya:{L:4.98,W:1.95,WB:2.62,tr:18},morozh:{L:4.98,W:1.95,WB:2.62,tr:18},
 gazel:{L:5.5,W:2.07,WB:2.9,tr:12},kabluk:{L:4.16,W:1.55,WB:2.4,tr:8},bobik:{L:4.03,W:1.78,WB:2.38,tr:8},
 gazon:{L:6.4,W:2.38,WB:3.7},hleb:{L:6.4,W:2.38,WB:3.7},moloko:{L:6.4,W:2.38,WB:3.7},samosval:{L:5.48,W:2.42,WB:3.3},polivalka:{L:6.68,W:2.5,WB:3.8},musorovoz:{L:6.68,W:2.5,WB:3.8},
 pozhar:{L:7.4,W:2.5,WB:3.8},kran:{L:9.1,W:2.5,WB:3.8},kamaz:{L:7.44,W:2.5,WB:4.51},gaz66:{L:5.66,W:2.32,WB:3.3},belarus:{L:3.82,W:1.97,WB:2.37},trekol:{L:5.45,W:2.5,WB:2.9},
 paz:{L:7.15,W:2.44,WB:3.6},laz:{L:9.19,W:2.5,WB:4.19},liaz:{L:10.53,W:2.5,WB:5.15},trolley:{L:11.8,W:2.5,WB:6.0},ikarus:{L:16.5,W:2.5,WB:5.4}};
const REFL={2:4.83,3:6.7,4:10.5,5:16.5};
// ART2: форма кузова сверху (половина контура от зада к морде: [доля длины, доля полуширины]) и радиус скругления — Горбатый яйцом, Чайка с плавниками, Девятка клином
const PLAN={gorbaty:[12,[[0,0],[0,.35],[.03,.65],[.1,.86],[.25,.97],[.5,1],[.75,.98],[.9,.9],[.97,.72],[1,.4],[1,0]]],
 zapor:[8,[[0,0],[0,.8],[.05,.95],[.5,1],[.9,.98],[.98,.85],[1,.5],[1,0]]],oka:[6,[[0,0],[0,.92],[.04,1],[.94,1],[1,.88],[1,0]]],
 devyatka:[6,[[0,0],[0,.92],[.03,1],[.8,1],[.96,.9],[1,.7],[1,0]]],pobeda:[10,[[0,0],[0,.45],[.04,.72],[.15,.9],[.35,.99],[.75,1],[.92,.9],[1,.55],[1,0]]],
 volga21:[8,[[0,0],[0,.75],[.04,.94],[.3,1],[.8,1],[.95,.92],[1,.66],[1,0]]],zim:[10,[[0,0],[0,.6],[.06,.85],[.25,.97],[.75,1],[.93,.93],[1,.62],[1,0]]],
 chaika:[3,[[.03,0],[.03,.55],[0,.98],[.05,1],[.94,1],[1,.9],[1,0]]]};
// колесо: x, радиус, доля колпака, цвет колпака, 'ww' — белая боковина
const WW=(x,r,hub,hc,ww)=>[x,r,hub,hc,ww];
const HUBC='#d8dde3';
// окно-четырёхугольник: x низа сзади, x верха сзади, x верха спереди, x низа спереди, y низа, y верха
const WQ=(a,b,c2,d,yb,yt)=>[[a,yb],[b,yt],[c2,yt],[d,yb]];
const PX={
 kopeyka:c=>({L:4.07,H:1.49,r:[.05,.06,.12,.04,.06,.2,.16,.05,.1,.05,.03,.05,.05],
   body:[[0,.34],[0,.78],[.05,.87],[.9,.89],[1.12,.9],[1.42,1.43],[2.6,1.44],[2.98,.93],[3.96,.86],[4.07,.79],[4.07,.38],[3.97,.29],[.1,.29]],
   win:[WQ(1.27,1.5,1.98,1.98,.97,1.36),WQ(2.06,2.06,2.56,2.86,.97,1.37)],winC:CH,belt:[.06,4.0,.6],beltC:CH,beltW:1.4,
   doors:[[2.02,.31,1.41],[2.95,.33,.93],[1.22,.34,.9]],handles:[[1.78,.84],[2.62,.84]],
   lamp:[[4.03,.69,.085,'r']],tail:[0,.7,.14],bump:[[3.95,.42,4.13],[-.06,.44,.2]],
   wh:[WW(.92,.3,.56,HUBC),WW(3.34,.3,.56,HUBC)],
   det:[(A,X,Y,k)=>{A.rect(X(3.92),Y(.53),.1*k,.06*k,1,'#f0a020');A.rect(X(4.02),Y(.5),.05*k,.14*k,1,CH);A.rect(X(-.02),Y(.52),.05*k,.14*k,1,CH);}]}),
 shesterka:c=>({L:4.17,H:1.49,r:[.05,.06,.1,.04,.06,.2,.16,.05,.08,.04,.03,.05,.05],
   body:[[0,.34],[0,.8],[.05,.88],[.92,.9],[1.15,.91],[1.45,1.43],[2.63,1.44],[3.02,.93],[4.06,.86],[4.17,.8],[4.17,.38],[4.07,.29],[.1,.29]],
   win:[WQ(1.3,1.53,2.01,2.01,.98,1.36),WQ(2.09,2.09,2.59,2.9,.98,1.37)],winC:CH,belt:[.06,4.1,.62],beltC:'#1d2128',beltW:3.4,
   doors:[[2.05,.31,1.41],[2.99,.33,.93],[1.25,.34,.91]],handles:[[1.8,.84],[2.65,.84]],
   lamp:[[4.1,.7,.08,'r'],[4.0,.7,.06,'r']],bump:[[4.0,.42,4.23],[-.06,.44,.24]],
   wh:[WW(.97,.3,.6,'#2a2d33'),WW(3.39,.3,.6,'#2a2d33')],
   det:[(A,X,Y,k)=>{A.line(X(.08),Y(.62),X(4.08),Y(.62),CH,1.2,.9);A.rect(X(3.94),Y(.8),.24*k,.2*k,2,'#1d2128',CH,1.4);A.circ(X(4.1),Y(.7),.075*k,LAMP,CH,1.2);
     A.rect(X(-.02),Y(.86),.09*k,.28*k,2,TAIL);A.rect(X(-.02),Y(.6),.09*k,.06*k,1,'#f0a020');A.rect(X(3.98),Y(.47),.24*k,.06*k,1,'#1d2128');}]}),
 moskvich:c=>({L:4.17,H:1.53,r:[.04,.04,.04,.03,.04,.06,.06,.03,.04,.03,.02,.03,.03],
   body:[[0,.36],[0,.84],[.02,.91],[.86,.9],[1.05,.93],[1.25,1.47],[2.55,1.48],[2.88,.95],[4.06,.88],[4.17,.82],[4.17,.4],[4.08,.3],[.1,.3]],
   win:[WQ(1.36,1.42,1.98,1.98,1.0,1.41),WQ(2.06,2.06,2.5,2.77,1.0,1.42)],winC:CH,belt:[.04,4.1,.66],beltC:CH,beltW:1.6,
   doors:[[2.02,.32,1.45],[2.86,.32,.95],[1.2,.34,.92]],handles:[[1.78,.86],[2.6,.86]],
   lamp:[],bump:[[4.0,.43,4.24],[-.07,.45,.22]],wh:[WW(.93,.3,.56,HUBC),WW(3.33,.3,.56,HUBC)],
   det:[(A,X,Y,k)=>{A.rect(X(4.06),Y(.8),.12*k,.13*k,1,LAMP,CH,1.4);A.rect(X(-.02),Y(.86),.4*k,.08*k,1,TAIL);A.rect(X(-.02),Y(.78),.25*k,.05*k,1,'#f0a020');
     A.rect(X(3.98),Y(.58),.18*k,.05*k,1,'#f0a020');}]}),
 devyatka:c=>({L:4.0,H:1.45,r:[.04,.04,.1,.06,.06,.04,.08,.04,.04,.04],
   body:[[0,.32],[0,.9],[.06,1.02],[.25,1.37],[.48,1.4],[2.2,1.4],[2.75,.92],[3.97,.7],[4.0,.62],[4.0,.32],[3.9,.28],[.1,.28]],
   win:[WQ(.32,.5,.82,.82,1.02,1.34),WQ(.9,.9,1.62,1.62,1.0,1.35),WQ(1.7,1.7,2.15,2.6,.99,1.35)],
   belt:[.04,3.98,.56],beltC:'#1d2128',beltW:6,doors:[[.86,.32,1.37],[1.66,.3,1.39],[2.66,.3,.9]],handles:[[1.42,.85],[2.35,.84]],
   bump:[[3.86,.38,4.06,'#2a2d33'],[-.06,.4,.3,'#2a2d33']],wh:[WW(.77,.3,.62,'#9aa1aa'),WW(3.23,.3,.62,'#9aa1aa')],
   det:[(A,X,Y,k)=>{A.rect(X(3.9),Y(.73),.1*k,.08*k,1,LAMP,CH,1);A.rect(X(-.02),Y(.95),.07*k,.22*k,1,TAIL);A.rect(X(.02),Y(1.44),.5*k,.06*k,2,'#1d2128');}]}),
 oka:c=>({L:3.2,H:1.45,r:[.04,.04,.06,.16,.08,.04,.08,.05,.04,.04],
   body:[[0,.34],[0,1.05],[.04,1.3],[.2,1.4],[1.75,1.4],[2.3,.93],[3.14,.8],[3.2,.7],[3.2,.34],[3.1,.28],[.08,.28]],
   win:[WQ(.12,.14,.72,.72,1.02,1.33),WQ(.8,.8,1.7,2.14,1.0,1.34)],belt:[.04,3.16,.56],beltC:'#1d2128',beltW:5,
   doors:[[.76,.3,1.37],[2.22,.3,.92]],handles:[[.98,.86]],bump:[[3.08,.36,3.25,'#2a2d33'],[-.05,.38,.24,'#2a2d33']],
   wh:[WW(.47,.27,.5,'#8b939c'),WW(2.65,.27,.5,'#8b939c')],
   det:[(A,X,Y,k)=>{A.rect(X(3.12),Y(.76),.08*k,.1*k,1,LAMP,CH,1);A.rect(X(-.02),Y(.98),.06*k,.26*k,1,TAIL);}]}),
 zapor:c=>({L:3.73,H:1.42,r:[.05,.08,.16,.1,.1,.22,.2,.08,.12,.08,.04,.05,.05],
   body:[[0,.36],[0,.72],[.12,.86],[.55,.93],[.98,1.0],[1.25,1.34],[2.25,1.37],[2.65,.93],[3.55,.84],[3.73,.7],[3.73,.38],[3.6,.3],[.1,.3]],
   win:[WQ(1.16,1.3,1.62,1.62,1.02,1.3),WQ(1.7,1.7,2.2,2.52,1.02,1.32)],winC:CH,belt:[.08,3.65,.64],beltC:CH,beltW:1.4,
   doors:[[1.66,.32,1.34],[2.6,.32,.93]],handles:[[1.85,.86]],lamp:[[3.68,.66,.075,'r']],tail:[.01,.62,.14],bump:[[3.58,.4,3.79],[-.06,.42,.2]],
   wh:[WW(.82,.3,.56,HUBC),WW(2.98,.3,.56,HUBC)],
   det:[(A,X,Y,k,col)=>{A.path(roundPath([[X(1.0),Y(.74)],[X(1.08),Y(1.04)],[X(1.58),Y(1.06)],[X(1.6),Y(.72)]],.1*k),shade(col,-.08),shade(col,-.45),2);
     A.path(roundPath([[X(1.12),Y(.8)],[X(1.17),Y(.99)],[X(1.52),Y(1.0)],[X(1.53),Y(.78)]],.06*k),'#2a2d33');for(let i=0;i<3;i++)A.line(X(1.16),Y(.84+i*.055),X(1.5),Y(.84+i*.055),'#6b7079',1.4);
     for(let i=0;i<5;i++)A.line(X(.12+i*.07),Y(.7),X(.2+i*.07),Y(.86),shade(col,-.4),1.4);}]}),
 gorbaty:c=>({L:3.33,H:1.5,r:[.05,.1,.3,.35,.3,.3,.3,.2,.12,.05,.05,.05],
   body:[[0,.34],[0,.6],[.25,.95],[.75,1.36],[1.25,1.46],[1.95,1.45],[2.45,1.1],[3.1,.88],[3.33,.66],[3.33,.36],[3.2,.29],[.12,.29]],
   win:[[[.95,1.0],[1.18,1.3],[1.58,1.38],[1.6,1.0]],[[1.68,1.0],[1.68,1.38],[1.95,1.37],[2.3,1.0]]],winC:CH,belt:[.15,3.25,.66],beltC:CH,beltW:1.4,
   doors:[[1.64,.32,1.4],[2.48,.32,1.06]],handles:[[1.82,.88]],lamp:[[3.1,.86,.075,'r']],tail:[.03,.58,.12],bump:[[3.18,.38,3.39],[-.06,.4,.24]],
   wh:[WW(.71,.29,.62,HUBC),WW(2.73,.29,.62,HUBC)],
   det:[(A,X,Y,k)=>{for(let i=0;i<5;i++)A.line(X(.1+i*.08),Y(.62+i*.08),X(.24+i*.08),Y(.56+i*.08),'#2a2d33',1.5);A.path(`M${X(3.22)} ${Y(.6)}q${.1*k} ${-.02*k} ${.1*k} ${.08*k}`,'none',CH,2);}]}),
 niva:c=>({L:3.74,H:1.69,r:[.04,.04,.06,.06,.04,.08,.04,.04,.04,.04,.04],
   body:[[0,.44],[0,1.1],[.03,1.58],[.12,1.64],[2.35,1.64],[2.72,1.12],[3.66,1.05],[3.74,.96],[3.74,.46],[3.62,.4],[.1,.4]],
   win:[WQ(.12,.14,.94,.94,1.17,1.57),WQ(1.04,1.04,2.28,2.6,1.16,1.57)],belt:[.04,3.7,.62],beltC:'#1d2128',beltW:7,
   doors:[[.99,.42,1.62],[2.66,.42,1.1]],handles:[[1.25,1.06]],bump:[[3.6,.5,3.82,'#2a2d33'],[-.08,.52,.24,'#2a2d33']],
   wh:[WW(.8,.36,.52,'#c9ced6'),WW(3.0,.36,.52,'#c9ced6')],
   back:[(A,X,Y,k)=>{for(const x of[.8,3.0])A.circ(X(x),Y(.36),.47*k,'#2a2d33');}],
   det:[(A,X,Y,k)=>{A.circ(X(3.68),Y(.86),.09*k,LAMP,CH,1.4);A.rect(X(-.02),Y(1.0),.06*k,.3*k,1,TAIL);A.rect(X(3.68),Y(1.03),.08*k,.05*k,1,'#2a2d33');}]}),
 volga:c=>PX.volga24(c),taxi:c=>{const r=PX.volga24(c);r.det.push((A,X,Y,k)=>{for(let i=0;i<12;i++){A.rect(X(1.25+i*.17),Y(.54),.17*k,.08*k,0,i%2?'#1d2128':'#ffffff');A.rect(X(1.25+i*.17),Y(.46),.17*k,.08*k,0,i%2?'#ffffff':'#1d2128');}
   A.rect(X(1.98),Y(1.63),.3*k,.14*k,2,'#2ecc71','#ffffff',1.2);});return r;},
 volga24:c=>({L:4.74,H:1.54,r:[.04,.04,.04,.03,.04,.08,.08,.03,.05,.03,.02,.04,.04],
   body:[[0,.38],[0,.82],[.03,.89],[1.1,.9],[1.35,.92],[1.68,1.47],[3.0,1.49],[3.42,.95],[4.62,.88],[4.74,.82],[4.74,.4],[4.62,.3],[.15,.3]],
   win:[WQ(1.55,1.78,2.34,2.34,.99,1.42),WQ(2.42,2.42,2.95,3.3,.99,1.43)],winC:CH,belt:[.05,4.68,.66],beltC:CH,beltW:2,
   doors:[[2.38,.32,1.47],[3.38,.32,.95],[1.45,.34,.92]],handles:[[2.15,.84],[3.0,.84]],bump:[[4.6,.44,4.82],[-.08,.46,.3]],
   wh:[WW(1.04,.32,.6,HUBC),WW(3.84,.32,.6,HUBC)],
   det:[(A,X,Y,k)=>{A.rect(X(4.66),Y(.86),.08*k,.36*k,1,CH);A.circ(X(4.68),Y(.72),.07*k,LAMP,CH,1.2);A.rect(X(-.02),Y(.86),.07*k,.24*k,1,TAIL);A.rect(X(-.02),Y(.62),.07*k,.06*k,1,'#f0a020');
     A.rect(X(4.64),Y(.5),.05*k,.16*k,1,CH);A.rect(X(.0),Y(.52),.05*k,.16*k,1,CH);}]}),
 pobeda:c=>({L:4.67,H:1.69,r:[.06,.1,.5,.4,.4,.35,.15,.12,.25,.15,.05,.05,.05],
   body:[[0,.36],[0,.62],[.3,.94],[1.25,1.5],[1.75,1.64],[2.75,1.62],[3.2,1.1],[3.4,1.05],[4.45,1.0],[4.67,.78],[4.67,.38],[4.5,.3],[.15,.3]],
   win:[[[1.42,1.13],[1.7,1.5],[2.2,1.57],[2.2,1.13]],[[2.28,1.13],[2.28,1.57],[2.7,1.56],[3.05,1.13]]],winC:CH,belt:[.3,4.55,.78],beltC:CH,beltW:1.6,
   doors:[[2.24,.32,1.6],[1.35,.34,1.3],[3.12,.34,1.08]],handles:[[1.55,1.0],[2.4,1.0]],bump:[[4.42,.42,4.75],[-.1,.44,.36]],
   wh:[WW(1.12,.33,.62,'#e8e1cf'),WW(3.82,.33,.62,'#e8e1cf')],
   det:[(A,X,Y,k)=>{for(let i=0;i<4;i++)A.line(X(4.42),Y(.55+i*.08),X(4.68),Y(.55+i*.08),CH,2);A.circ(X(4.5),Y(.9),.09*k,LAMP,CH,1.6);A.rect(X(.05),Y(.66),.06*k,.14*k,1,TAIL);
     A.path(`M${X(3.4)} ${Y(1.04)}Q${X(3.9)} ${Y(1.12)} ${X(4.45)} ${Y(.99)}`,'none',CH,1.4);}]}),
 volga21:c=>({L:4.83,H:1.67,r:[.06,.08,.2,.1,.1,.22,.2,.1,.25,.15,.05,.05,.05],
   body:[[0,.36],[0,.78],[.15,.92],[1.2,1.0],[1.55,1.04],[1.9,1.58],[3.0,1.62],[3.45,1.06],[4.6,1.0],[4.83,.8],[4.83,.38],[4.7,.3],[.15,.3]],
   win:[[[1.75,1.1],[1.98,1.54],[2.5,1.56],[2.5,1.1]],[[2.58,1.1],[2.58,1.56],[2.98,1.55],[3.3,1.1]]],winC:CH,
   doors:[[2.54,.32,1.6],[3.4,.32,1.05],[1.62,.34,1.03]],handles:[[2.3,.96],[3.1,.96]],bump:[[4.6,.42,4.92],[-.1,.44,.34]],
   wh:[WW(1.23,.33,.6,'#e8e1cf','ww'),WW(3.93,.33,.6,'#e8e1cf','ww')],
   det:[(A,X,Y,k)=>{A.path(`M${X(.25)} ${Y(.82)}L${X(3.6)} ${Y(.82)}L${X(4.5)} ${Y(.74)}L${X(3.6)} ${Y(.76)}L${X(.25)} ${Y(.76)}Z`,CH,CH,1);
     for(let i=0;i<5;i++)A.line(X(4.68+i*.03),Y(.5),X(4.68+i*.03),Y(.8),CH,1.8);A.circ(X(4.7),Y(.9),.09*k,LAMP,CH,1.6);A.rect(X(.0),Y(.8),.06*k,.2*k,1,TAIL);
     A.path(`M${X(4.25)} ${Y(1.02)}l${.16*k} ${-.04*k}l${.06*k} ${.14*k}l${.06*k} ${-.03*k}M${X(4.33)} ${Y(1.12)}l${-.04*k} ${.06*k}`,'none',CH,2.2);}]}),
 zim:c=>({L:5.53,H:1.71,r:[.06,.1,.25,.1,.1,.25,.25,.12,.28,.15,.05,.05,.05],
   body:[[0,.36],[0,.72],[.3,.98],[1.4,1.08],[1.75,1.08],[2.1,1.62],[3.6,1.66],[4.05,1.1],[5.3,1.02],[5.53,.8],[5.53,.38],[5.4,.3],[.15,.3]],
   win:[[[1.95,1.14],[2.2,1.58],[2.75,1.6],[2.75,1.14]],WQ(2.83,2.83,3.35,3.35,1.14,1.6),[[3.43,1.14],[3.43,1.6],[3.62,1.6],[3.9,1.14]]],winC:CH,
   belt:[.3,5.4,.82],beltC:CH,beltW:2,doors:[[2.79,.32,1.64],[3.39,.32,1.62],[4.0,.32,1.08],[1.85,.34,1.08]],handles:[[2.5,1.0],[3.2,1.0]],bump:[[5.3,.42,5.62],[-.1,.44,.38]],
   wh:[WW(1.38,.35,.6,'#d6dae0','ww'),WW(4.58,.35,.6,'#d6dae0','ww')],
   det:[(A,X,Y,k)=>{for(let i=0;i<6;i++)A.line(X(5.36),Y(.52+i*.06),X(5.53),Y(.52+i*.06),CH,1.8);A.circ(X(5.4),Y(.92),.09*k,LAMP,CH,1.6);A.rect(X(.04),Y(.74),.06*k,.16*k,1,TAIL);}]}),
 chaika:c=>({L:5.6,H:1.66,r:[.04,.04,.03,.06,.06,.12,.12,.04,.08,.04,.03,.04,.04],
   body:[[0,.36],[0,.9],[.08,1.0],[.6,.97],[1.5,.96],[1.85,1.0],[2.08,1.56],[3.62,1.58],[3.98,1.0],[5.45,.94],[5.6,.82],[5.6,.38],[5.45,.3],[.15,.3]],
   win:[WQ(2.0,2.15,2.85,2.85,1.06,1.5),WQ(2.93,2.93,3.56,3.82,1.06,1.51)],winC:CH,
   doors:[[2.89,.3,1.56],[1.92,.32,.99],[3.9,.32,1.0]],handles:[[2.6,.92],[3.4,.92]],bump:[[5.42,.42,5.7],[-.1,.44,.42]],
   wh:[WW(1.35,.35,.62,'#d6dae0','ww'),WW(4.6,.35,.62,'#d6dae0','ww')],
   det:[(A,X,Y,k)=>{A.path(`M${X(.15)} ${Y(.86)}L${X(5.3)} ${Y(.8)}L${X(5.3)} ${Y(.72)}L${X(.15)} ${Y(.76)}Z`,'#e8e6de',CH,1.4);
     for(let i=0;i<5;i++)A.line(X(5.47),Y(.5+i*.08),X(5.6),Y(.5+i*.08),CH,1.6);A.circ(X(5.52),Y(.86),.07*k,LAMP,CH,1.2);A.circ(X(5.42),Y(.86),.07*k,LAMP,CH,1.2);
     A.rect(X(0),Y(.98),.12*k,.2*k,1,TAIL);}]}),
 zil:c=>({L:6.3,H:1.59,r:[.04,.04,.03,.04,.06,.08,.08,.03,.04,.03,.02,.04,.04],
   body:[[0,.36],[0,.86],[.05,.92],[1.7,.94],[2.0,1.5],[4.4,1.54],[4.75,.96],[6.2,.9],[6.3,.82],[6.3,.38],[6.15,.3],[.15,.3]],
   win:[WQ(2.05,2.2,2.95,2.95,1.0,1.46),WQ(3.03,3.03,3.75,3.75,1.0,1.47),WQ(3.83,3.83,4.35,4.62,1.0,1.47)],winC:CH,belt:[.05,6.25,.68],beltC:CH,beltW:2,
   doors:[[2.99,.3,1.52],[3.79,.3,1.52],[4.7,.32,.95],[1.95,.32,.95]],handles:[[2.75,.86],[3.55,.86]],bump:[[6.12,.42,6.42],[-.1,.44,.38]],
   wh:[WW(1.44,.36,.6,'#d6dae0'),WW(5.2,.36,.6,'#d6dae0')],
   det:[(A,X,Y,k)=>{A.rect(X(6.2),Y(.84),.12*k,.3*k,1,CH);A.rect(X(6.22),Y(.8),.08*k,.1*k,1,LAMP);A.rect(X(-.02),Y(.86),.08*k,.2*k,1,TAIL);A.line(X(.1),Y(.5),X(6.2),Y(.5),CH,1.4);}]}),
 buhanka:c=>{const amb=c.id==='tabletka';return{L:4.46,H:2.12,r:[.05,.05,.3,.32,.32,.3,.2,.1,.1,.05,.05,.05],
   body:[[0,.46],[0,1.85],[.12,2.04],[.4,2.07],[3.75,2.07],[4.08,1.94],[4.3,1.42],[4.42,1.32],[4.46,1.1],[4.46,.5],[4.35,.44],[.1,.44]],
   parts:amb?[]:[{pts:[[.02,1.3],[.02,1.86],[.14,2.03],[.4,2.05],[3.74,2.05],[4.06,1.93],[4.27,1.4],[4.38,1.3]],r:.25,c:'#ece8d6',st:false}],
   win:[[[3.6,1.4],[3.6,1.88],[3.95,1.9],[4.22,1.4]],WQ(2.6,2.6,3.3,3.3,1.4,1.86),WQ(1.6,1.6,2.4,2.4,1.4,1.86),[[.3,1.4],[.3,1.84],[1.4,1.86],[1.4,1.4]]],
   belt:[.04,4.4,1.3],beltC:amb?'#e33a3a':shade(c.col,-.2),beltW:amb?6:2,doors:[[3.52,.46,1.98],[2.5,.46,1.98],[1.5,.46,1.95]],handles:[[3.3,1.2],[2.3,1.2]],
   bump:[[4.36,.58,4.56,'#2a2d33'],[-.08,.58,.15,'#2a2d33']],wh:[WW(1.21,.37,.42,'#5b6a3c'),WW(3.51,.37,.42,'#5b6a3c')],
   det:[(A,X,Y,k)=>{A.circ(X(4.42),Y(1.06),.1*k,LAMP,CH,1.4);A.circ(X(4.42),Y(1.26),.04*k,'#f0a020');A.rect(X(-.02),Y(1.0),.06*k,.14*k,1,TAIL);
     A.rect(X(3.98),Y(1.42),.04*k,.12*k,1,'#2a2d33');
     if(amb){A.rect(X(2.0)-.07*k,Y(1.0)-.24*k,.14*k,.48*k,0,'#e33a3a');A.rect(X(2.0)-.24*k,Y(1.0)-.07*k,.48*k,.14*k,0,'#e33a3a');A.rect(X(3.3),Y(2.22),.36*k,.15*k,3,'#3f7bff');}}]};},
 tabletka:c=>PX.buhanka(c),
 raf:c=>{const amb=c.id==='skoraya',ice=c.id==='morozh';return{L:4.98,H:2.02,r:[.05,.05,.2,.2,.3,.22,.1,.05,.05,.05],
   body:[[0,.36],[0,1.85],[.15,1.97],[3.85,1.97],[4.55,1.45],[4.85,1.12],[4.98,.95],[4.98,.4],[4.85,.32],[.12,.32]],
   win:ice?[[[3.8,1.32],[3.78,1.88],[3.95,1.88],[4.47,1.32]]]:[[[3.8,1.32],[3.78,1.88],[3.95,1.88],[4.47,1.32]],WQ(2.85,2.85,3.62,3.62,1.32,1.86),WQ(1.85,1.85,2.7,2.7,1.32,1.86),[[.3,1.32],[.3,1.84],[1.7,1.86],[1.7,1.32]]],
   belt:[.04,4.9,1.2],beltC:amb?'#e33a3a':ice?'#ff7aa8':'#f4f1e8',beltW:amb||ice?6:5,doors:[[3.72,.34,1.95],[2.78,.34,1.95]],handles:[[3.45,1.12]],
   bump:[[4.76,.48,5.06,'#b9bec5'],[-.07,.48,.24,'#b9bec5']],wh:[WW(1.41,.33,.55,HUBC),WW(4.03,.33,.55,HUBC)],
   det:[(A,X,Y,k)=>{A.circ(X(4.9),Y(.86),.09*k,LAMP,'#9aa1aa',2.4);A.rect(X(-.02),Y(.95),.06*k,.24*k,1,TAIL);
     if(amb){A.text(X(1.15),Y(.68),'03',.32*k,'#e33a3a',900);A.rect(X(2.25)-.06*k,Y(.82)-.22*k,.12*k,.44*k,0,'#e33a3a');A.rect(X(2.25)-.22*k,Y(.82)-.06*k,.44*k,.12*k,0,'#e33a3a');A.rect(X(3.3),Y(2.12),.45*k,.15*k,3,'#3f7bff');}
     if(ice){A.text(X(1.95),Y(1.45),'МОРОЖЕНОЕ',.3*k,'#d23c6e',900);A.path(`M${X(1.85)} ${Y(.6)}l${.15*k} ${.5*k}l${.15*k} ${-.5*k}z`,'#e0a050','#a8682a',1.5);A.circ(X(2.0),Y(1.12),.15*k,'#ff8fc0');A.circ(X(2.0),Y(1.32),.12*k,'#ffffff');}}]};},
 skoraya:c=>PX.raf(c),morozh:c=>PX.raf(c),
 kabluk:c=>({L:4.16,H:1.87,r:[.04,.04,.04,.06,.06,.03,.04,.03,.02,.03,.03],
   body:[[2.1,.3],[2.1,.9],[2.3,.92],[2.48,1.42],[2.76,1.43],[3.06,.95],[4.05,.88],[4.16,.82],[4.16,.4],[4.08,.3]],
   parts:[{pts:[[0,.32],[0,1.82],[2.36,1.82],[2.36,.32]],r:.05,c:col=>shade(col,.35)}],
   win:[WQ(2.44,2.5,2.73,2.98,1.0,1.36)],winC:CH,belt:[2.36,4.1,.66],beltC:CH,beltW:1.6,doors:[[2.42,.32,1.4],[3.02,.32,.95]],handles:[[2.6,.86]],
   bump:[[4.0,.43,4.22],[-.06,.45,.24]],wh:[WW(.96,.3,.56,HUBC),WW(3.36,.3,.56,HUBC)],
   det:[(A,X,Y,k)=>{A.rect(X(4.06),Y(.8),.11*k,.13*k,1,LAMP,CH,1.4);A.rect(X(-.02),Y(.86),.08*k,.2*k,1,TAIL);A.line(X(.06),Y(1.25),X(2.3),Y(1.25),'#ffffff',2,.5);A.line(X(1.2),Y(.36),X(1.2),Y(1.78),'#000000',1,.25);}]})
};

/* ---------- ART2 (замечание владельца «машины не похожи», 2-й заход): легковые обведены по фото сбоку (../ART2-ref).
   Кузов/окна можно задать строкой пути в метрах ('M x y C … L … Z', пары x y) — для круглых машин (Горбатый, Победа, ГАЗ-21, ЗИМ). */
const dP=(s,X,Y)=>s.replace(/(-?[\d.]+)[ ,]+(-?[\d.]+)/g,(m,a,b)=>f1(X(+a))+' '+f1(Y(+b)));
const pth=(A,X,Y,s,fill,st,sw)=>A.path(dP(s,X,Y),fill,st,sw);
const BLK='#23262c',RUB='#2a2d33';
// хромированный бампер с «клыками» (x0..x1 по длине, y — высота, fang — x клыков)
const bumpF=(A,X,Y,k,x0,x1,y,fang,rub)=>{A.rect(X(x0),Y(y+.06),(x1-x0)*k,.12*k,.05*k,CH,'#9aa3ad',1);if(rub)A.rect(X(x0),Y(y+.015),(x1-x0)*k,.03*k,0,RUB);
  (fang||[]).forEach(x=>A.rect(X(x)-.035*k,Y(y+.2),.07*k,.3*k,.03*k,rub?RUB:CH,'#9aa3ad',1));};
// чёрный пластик (бамперы, молдинги Оки/Девятки)
const blk=(A,X,Y,k,x0,x1,y0,y1,r)=>A.rect(X(x0),Y(y1),(x1-x0)*k,(y1-y0)*k,(r==null?.05:r)*k,BLK);
const deer=(A,X,Y,k,x,y)=>{const s=k/46;A.path(`M${X(x)} ${Y(y)}l${-4*s} ${-3*s}l${3*s} ${-2*s}l${6*s} ${1*s}l${3*s} ${-5*s}l${1.5*s} ${1*s}l${-2*s} ${5*s}l${3*s} ${2*s}z`,CH,'#8d96a0',1);};
Object.assign(PX,{
 // ВАЗ-2101: строгий трёхобъёмник, тонкие стойки, хром: бамперы с клыками, рамки окон, круглые фары, форточка
 kopeyka:c=>({L:4.07,H:1.44,r:[.04,.04,.03,.03,.04,.07,.06,.05,.03,.03,.04,.04],
   body:[[.12,.3],[0,.38],[0,.8],[.05,.86],[.82,.96],[1.13,1.4],[2.6,1.42],[3.06,.96],[3.98,.86],[4.07,.8],[4.07,.38],[3.96,.3]],
   win:[WQ(1.22,1.4,1.98,1.98,.99,1.36),WQ(2.06,2.06,2.57,2.92,.99,1.37)],winC:CH,belt:[.04,4.03,.8],beltW:1.2,
   doors:[[2.02,.32,1.4],[1.18,.33,.96],[3.0,.33,.93]],handles:[[1.72,.9],[2.6,.9]],tail:[0,.66,.16],
   wh:[WW(.95,.3,.58,HUBC),WW(3.37,.3,.58,HUBC)],
   det:[(A,X,Y,k)=>{A.line(X(2.72),Y(1.0),X(2.66),Y(1.36),CH,1.8);A.circ(X(4.03),Y(.66),.09*k,LAMP,CH,1.8);A.rect(X(3.94),Y(.55),.1*k,.05*k,1,'#f0a020');
     bumpF(A,X,Y,k,3.9,4.13,.44,[4.0]);bumpF(A,X,Y,k,-.06,.26,.44,[.06]);A.line(X(.3),Y(.6),X(3.8),Y(.6),CH,1.1,.8);}]}),
 // ВАЗ-2106: тот же кузов, но длиннее, чёрный молдинг с хромом по боку, решётки вентиляции на задней стойке, большие фонари «уголком», бамперы с резиной
 shesterka:c=>({L:4.17,H:1.44,r:[.04,.04,.03,.03,.04,.07,.06,.05,.03,.03,.04,.04],
   body:[[.12,.3],[0,.38],[0,.82],[.05,.88],[.86,.97],[1.17,1.4],[2.64,1.42],[3.1,.96],[4.08,.87],[4.17,.8],[4.17,.38],[4.06,.3]],
   win:[WQ(1.26,1.44,2.02,2.02,.99,1.36),WQ(2.1,2.1,2.61,2.96,.99,1.37)],winC:CH,belt:[.04,4.13,.82],beltW:1.2,
   doors:[[2.06,.32,1.4],[1.22,.33,.97],[3.04,.33,.94]],handles:[[1.76,.9],[2.64,.9]],
   wh:[WW(.99,.3,.6,'#c9ced6'),WW(3.41,.3,.6,'#c9ced6')],
   det:[(A,X,Y,k)=>{A.rect(X(.04),Y(.67),4.1*k,.08*k,1,BLK);A.line(X(.04),Y(.67),X(4.14),Y(.67),CH,1.4);
     A.poly([[X(.98),Y(1.0)],[X(1.13),Y(1.26)],[X(1.25),Y(1.26)],[X(1.13),Y(1.0)]],BLK,CH,1.2);for(let i=1;i<4;i++)A.line(X(1.0+i*.035),Y(1.0+i*.065),X(1.12+i*.035),Y(1.0+i*.065),CH,1);
     A.rect(X(-.02),Y(.9),.16*k,.26*k,.03*k,TAIL);A.rect(X(-.02),Y(.68),.16*k,.06*k,0,'#f0a020');
     A.rect(X(3.98),Y(.86),.21*k,.3*k,.03*k,BLK,CH,1.2);A.circ(X(4.12),Y(.71),.08*k,LAMP,CH,1.2);
     bumpF(A,X,Y,k,4.0,4.24,.44,[4.12],true);bumpF(A,X,Y,k,-.07,.3,.44,[.08],true);}]}),
 // Москвич-412: высокий пояс (окна высоко), плоские борта с рёбром, короткий багажник «ступенькой», прямоугольные фары, фонари полосой
 moskvich:c=>({L:4.17,H:1.5,r:[.03,.03,.02,.03,.04,.06,.06,.04,.03,.03,.03,.03],
   body:[[.1,.3],[0,.38],[0,.9],[.06,.96],[.78,1.0],[1.15,1.46],[2.72,1.49],[3.14,1.06],[4.08,.98],[4.17,.92],[4.17,.38],[4.06,.3]],
   win:[[[1.22,1.03],[1.4,1.41],[1.96,1.42],[1.96,1.03]],[[2.04,1.03],[2.04,1.42],[2.5,1.42],[2.84,1.03]]],winC:CH,belt:[.04,4.12,.76],beltW:1.6,
   doors:[[2.0,.32,1.45],[1.2,.33,1.0],[3.08,.33,1.04]],handles:[[1.75,.94],[2.66,.94]],
   wh:[WW(.95,.31,.5,HUBC),WW(3.35,.31,.5,HUBC)],
   det:[(A,X,Y,k,col)=>{A.line(X(.3),Y(.36),X(3.9),Y(.36),CH,1.6);A.line(X(.04),Y(.98),X(.7),Y(1.02),CH,1.4);
     /* багажник на крыше — примета «Москвича» */A.line(X(1.3),Y(1.62),X(2.66),Y(1.62),'#3a3f47',2.6);[1.42,1.86,2.3,2.58].forEach(x=>A.line(X(x),Y(1.49),X(x),Y(1.62),'#3a3f47',2.2));for(let i=0;i<5;i++)A.line(X(1.4+i*.3),Y(1.6),X(1.4+i*.3),Y(1.66),'#3a3f47',1.6);
     A.rect(X(.06),Y(.8),4.06*k,.07*k,.02*k,shade(col,-.22));A.line(X(2.84),Y(1.03),X(3.08),Y(1.03),CH,1.4);
     A.rect(X(4.02),Y(.92),.16*k,.26*k,.02*k,CH);A.rect(X(4.06),Y(.88),.12*k,.17*k,.02*k,LAMP);
     A.rect(X(-.02),Y(.92),.16*k,.1*k,.02*k,TAIL);A.rect(X(-.02),Y(.82),.1*k,.06*k,0,'#f0a020');A.line(X(.04),Y(.96),X(4.1),Y(.96),shade(col,-.3),1.2);
     bumpF(A,X,Y,k,4.0,4.24,.44,[4.12]);bumpF(A,X,Y,k,-.07,.3,.44,[.08]);}]}),
 // ВАЗ-2109: клин — низкий нос, длинный капот, окна поднимаются к заду, наклонная пятая дверь; чёрные пластиковые бамперы и молдинг
 devyatka:c=>({L:4.0,H:1.45,r:[.03,.03,.03,.04,.05,.1,.08,.06,.08,.04,.03,.03],
   body:[[.08,.28],[0,.36],[0,.64],[.06,.98],[.14,1.03],[.84,1.44],[2.3,1.45],[2.9,1.05],[3.9,.8],[4.0,.7],[4.0,.38],[3.92,.28]],
   win:[[[.36,1.05],[.86,1.39],[.98,1.39],[.98,1.0]],[[1.06,.99],[1.06,1.4],[1.74,1.41],[1.74,.96]],[[1.82,.96],[1.82,1.41],[2.28,1.41],[2.8,.93]]],winC:BLK,
   doors:[[1.02,.42,1.42],[1.78,.42,1.43],[2.86,.42,1.0]],handles:[[1.5,.86],[2.4,.84]],
   wh:[WW(.73,.29,.6,'#9aa1aa'),WW(3.19,.29,.6,'#9aa1aa')],
   det:[(A,X,Y,k)=>{blk(A,X,Y,k,-.03,.44,.3,.58);blk(A,X,Y,k,3.6,4.04,.3,.56);blk(A,X,Y,k,.44,3.6,.45,.53,.02);
     A.rect(X(3.86),Y(.77),.15*k,.08*k,.02*k,LAMP,CH,1);A.rect(X(-.02),Y(.95),.08*k,.3*k,.02*k,TAIL);A.line(X(.1),Y(1.02),X(.82),Y(1.42),BLK,2.4);}]}),
 // ВАЗ-1111 «Ока»: крошечная коробочка — короткий нос, крутое лобовое, почти вертикальная задняя дверь, колёса по углам, чёрный пластик
 oka:c=>({L:3.2,H:1.42,r:[.03,.03,.04,.04,.06,.06,.05,.08,.06,.03,.03],
   body:[[.06,.3],[0,.36],[0,.96],[.1,1.38],[.22,1.42],[1.82,1.42],[2.44,.98],[3.06,.82],[3.18,.74],[3.2,.38],[3.12,.3]],
   win:[[[.14,1.0],[.24,1.34],[.84,1.35],[.84,1.0]],[[.92,.99],[.92,1.35],[1.78,1.35],[2.3,.99]]],winC:BLK,
   doors:[[.88,.4,1.4],[2.38,.42,.96]],handles:[[1.05,.9]],
   wh:[WW(.5,.27,.5,'#8b939c'),WW(2.68,.27,.5,'#8b939c')],
   det:[(A,X,Y,k)=>{blk(A,X,Y,k,-.03,.32,.3,.58);blk(A,X,Y,k,2.9,3.23,.3,.56);blk(A,X,Y,k,.32,2.9,.3,.42,.02);
     A.rect(X(3.08),Y(.79),.12*k,.12*k,.02*k,LAMP,CH,1);A.rect(X(-.02),Y(.96),.08*k,.32*k,.02*k,TAIL);}]}),
 // ЗАЗ-968 «Ушастый»: мотор сзади — короткий покатый нос, высокая кабина с большими окнами, ступенька моторного отсека, «уши»-воздухозаборники за дверью
 zapor:c=>({L:3.73,H:1.4,r:[.04,.04,.06,.08,.06,.08,.1,.08,.15,.12,.04,.04,.04],
   body:[[.1,.3],[0,.38],[0,.8],[.1,.9],[.74,.99],[1.02,1.36],[2.3,1.38],[2.68,.94],[3.45,.87],[3.66,.78],[3.73,.6],[3.73,.38],[3.62,.3]],
   win:[[[1.0,.88],[1.22,1.31],[1.62,1.32],[1.62,.88]],[[1.7,.88],[1.7,1.32],[2.27,1.32],[2.62,.88]]],winC:CH,belt:[.04,3.68,.66],beltC:CH,beltW:1.4,
   doors:[[1.66,.32,1.36],[2.64,.33,.93]],handles:[[1.84,.8]],tail:[.01,.66,.14],
   wh:[WW(.86,.29,.56,HUBC),WW(3.02,.29,.56,HUBC)],
   det:[(A,X,Y,k,col)=>{const e=shade(col,-.06),eo=shade(col,-.45);
     pth(A,X,Y,'M 1.56 .52 C 1.66 .62 1.68 .76 1.6 .86 L .96 .84 C .88 .76 .9 .62 1.0 .56 Z',e,eo,2.2);
     pth(A,X,Y,'M 1.52 .58 C 1.6 .66 1.6 .76 1.54 .82 L 1.36 .81 C 1.32 .74 1.32 .64 1.36 .58 Z','#1e2126');for(let i=0;i<3;i++)A.line(X(1.37),Y(.64+i*.06),X(1.53),Y(.64+i*.06),'#6b7079',1.2);
     A.circ(X(3.67),Y(.68),.08*k,LAMP,CH,1.6);A.line(X(3.4),Y(.74),X(3.72),Y(.72),CH,2);
     for(let i=0;i<4;i++)A.line(X(.18+i*.1),Y(.92),X(.26+i*.1),Y(.94),shade(col,-.35),1.4);
     bumpF(A,X,Y,k,3.58,3.79,.42,[3.68]);bumpF(A,X,Y,k,-.06,.22,.42,[.06]);}]}),
 // ЗАЗ-965 «Горбатый»: маленький круглый «жук» — горб от бампера до крыши одной дугой, круглый нос, круглые фары на крыльях, 2 двери, жабры на заднем крыле
 gorbaty:c=>({L:3.33,H:1.55,
   body:'M .1 .3 L 0 .4 C -.02 .62 .04 .8 .18 .92 C .42 1.22 .72 1.5 1.3 1.53 C 1.8 1.55 2.14 1.53 2.3 1.46 C 2.42 1.3 2.5 1.15 2.62 1.06 C 2.86 1.02 3.1 1.0 3.24 .9 C 3.34 .82 3.35 .62 3.3 .42 L 3.22 .3 Z',
   win:['M .64 1.0 C .72 1.2 .88 1.36 1.1 1.42 L 1.42 1.43 L 1.42 1.0 Z','M 1.5 1.0 L 1.5 1.43 L 2.16 1.43 C 2.24 1.38 2.36 1.18 2.46 1.0 Z'],winC:CH,belt:[.12,3.26,.7],beltC:CH,beltW:1.4,
   doors:[[1.46,.32,1.48],[2.58,.33,1.05]],handles:[[1.62,.92]],tail:[.02,.62,.14],
   wh:[WW(.72,.3,.62,HUBC),WW(2.8,.3,.62,HUBC)],
   det:[(A,X,Y,k)=>{A.rect(X(.32),Y(.92),.62*k,.16*k,.04*k,'#2a2d33',CH,1.4);for(let i=1;i<5;i++)A.line(X(.32+i*.124),Y(.91),X(.32+i*.124),Y(.77),'#8a929b',1.2);
     A.circ(X(3.2),Y(.86),.1*k,LAMP,CH,2);pth(A,X,Y,'M 2.95 .66 C 3.1 .66 3.25 .64 3.33 .58','none',CH,2.4);
     bumpF(A,X,Y,k,3.2,3.39,.38,[]);bumpF(A,X,Y,k,-.06,.2,.4,[]);}]}),
 volga24:c=>({L:4.74,H:1.49,r:[.03,.03,.02,.03,.04,.07,.06,.05,.03,.03,.03,.03],
   body:[[.12,.3],[0,.38],[0,.85],[.05,.9],[1.32,.95],[1.68,1.43],[3.0,1.47],[3.44,.97],[4.64,.9],[4.74,.84],[4.74,.38],[4.62,.3]],
   win:[[[1.5,.99],[1.78,1.39],[2.36,1.41],[2.36,.99]],[[2.44,.99],[2.44,1.41],[2.96,1.41],[3.32,.99]]],winC:CH,belt:[.05,4.68,.66],beltW:1.4,
   doors:[[2.4,.32,1.45],[1.46,.33,.95],[3.38,.33,.96]],handles:[[2.15,.88],[3.05,.88]],
   wh:[WW(1.03,.33,.6,HUBC),WW(3.83,.33,.6,HUBC)],
   det:[(A,X,Y,k)=>{A.line(X(.45),Y(.35),X(4.3),Y(.35),CH,1.6);A.line(X(1.4),Y(.97),X(3.4),Y(.97),CH,1.4);
     A.rect(X(4.62),Y(.86),.13*k,.32*k,.02*k,CH);for(let i=0;i<4;i++)A.line(X(4.66+i*.025),Y(.84),X(4.66+i*.025),Y(.56),'#8d96a0',1);A.circ(X(4.7),Y(.72),.075*k,LAMP,CH,1.2);
     A.rect(X(-.02),Y(.88),.08*k,.32*k,.02*k,TAIL);A.rect(X(-.02),Y(.6),.08*k,.05*k,0,'#f0a020');
     bumpF(A,X,Y,k,4.58,4.82,.44,[4.66],true);bumpF(A,X,Y,k,-.08,.32,.46,[.06],true);}]}),
 // ГАЗ-М-20 «Победа»: фастбэк — крыша одной дугой стекает к бамперу, «понтонный» кузов, линия переднего крыла уходит к заднему колесу, хромовые «усы» на крыльях
 pobeda:c=>({L:4.67,H:1.64,
   body:'M .2 .3 L .04 .36 C -.03 .5 -.02 .66 .08 .78 C .35 1.12 .9 1.5 1.6 1.6 C 2.1 1.66 2.6 1.64 2.78 1.58 C 2.95 1.42 3.02 1.25 3.12 1.12 C 3.6 1.1 4.2 1.08 4.45 .98 C 4.66 .9 4.71 .7 4.66 .5 L 4.55 .3 Z',
   win:['M 1.18 1.12 C 1.32 1.32 1.52 1.46 1.76 1.5 L 1.76 1.12 Z','M 1.84 1.12 L 1.84 1.53 C 2.0 1.56 2.15 1.56 2.26 1.55 L 2.26 1.12 Z','M 2.34 1.12 L 2.34 1.55 L 2.72 1.54 C 2.85 1.4 2.92 1.25 2.98 1.12 Z'],winC:CH,
   doors:[[1.8,.4,1.52],[2.3,.34,1.58],[3.04,.36,1.1]],handles:[[1.98,1.02],[2.48,1.02]],tail:[.05,.66,.14],
   wh:[WW(1.05,.35,.64,'#e8e1cf'),WW(3.75,.35,.64,'#e8e1cf')],
   det:[(A,X,Y,k,col)=>{const dk=shade(col,-.35);pth(A,X,Y,'M 4.4 .98 C 3.6 .98 2.7 .9 1.95 .52','none',dk,1.8);pth(A,X,Y,'M .14 .72 C .4 1.0 1.4 1.02 1.82 .6','none',dk,1.8);
     for(let i=0;i<3;i++)A.line(X(4.22),Y(.56+i*.09),X(4.66),Y(.56+i*.09),CH,2.2);A.circ(X(4.55),Y(.88),.09*k,LAMP,CH,1.8);
     bumpF(A,X,Y,k,4.5,4.77,.42,[4.6]);bumpF(A,X,Y,k,-.09,.4,.44,[.1]);}]}),
 // ГАЗ-21: покатая, округлая — круглый багажник, «китовый ус» решётки, олень на капоте, хром снизу, белые боковины шин
 volga21:c=>({L:4.83,H:1.62,
   body:'M .15 .3 L .02 .42 C -.02 .7 0 .88 .12 .94 C .5 1.0 1.0 1.08 1.42 1.13 C 1.6 1.4 1.75 1.58 1.95 1.6 L 2.95 1.62 C 3.15 1.6 3.3 1.3 3.48 1.12 C 4.0 1.1 4.5 1.06 4.7 .98 C 4.85 .9 4.86 .7 4.83 .5 L 4.7 .3 Z',
   win:['M 1.6 1.13 C 1.7 1.33 1.82 1.5 1.98 1.54 L 2.38 1.55 L 2.38 1.13 Z','M 2.46 1.13 L 2.46 1.55 L 2.92 1.55 C 3.05 1.5 3.18 1.3 3.3 1.13 Z'],winC:CH,
   doors:[[2.42,.32,1.58],[1.56,.34,1.12],[3.4,.34,1.1]],handles:[[2.2,1.02],[3.05,1.02]],tail:[.02,.74,.16],
   wh:[WW(1.22,.34,.6,'#e8e1cf','ww'),WW(3.92,.34,.6,'#e8e1cf','ww')],
   det:[(A,X,Y,k,col)=>{const dk=shade(col,-.3);A.line(X(.5),Y(.36),X(4.4),Y(.36),CH,2);pth(A,X,Y,'M 4.5 1.0 C 4.3 .96 4.15 .82 4.12 .7','none',dk,1.6);pth(A,X,Y,'M .12 .9 C .5 .9 1.2 .86 1.5 .72','none',CH,1.6);
     A.rect(X(4.62),Y(.9),.26*k,.4*k,.05*k,'#2a2d33',CH,2);for(let i=0;i<7;i++)A.line(X(4.65+i*.032),Y(.88),X(4.65+i*.032),Y(.52),CH,1.8);A.line(X(1.5),Y(.8),X(4.55),Y(.82),CH,1.6);
     A.circ(X(4.74),Y(.9),.09*k,LAMP,CH,1.8);deer(A,X,Y,k,4.38,1.07);
     bumpF(A,X,Y,k,4.6,4.92,.42,[4.72]);bumpF(A,X,Y,k,-.1,.36,.44,[.08]);}]}),
 // ГАЗ-12 ЗИМ: длинный, полуфастбэк, 3 окна, «понтонная» линия крыла, хром-полоса по борту, белые боковины
 zim:c=>({L:5.53,H:1.6,
   body:'M .15 .3 L 0 .38 C -.02 .55 .05 .72 .2 .82 C .6 1.02 1.2 1.12 1.6 1.18 C 1.75 1.38 1.85 1.5 2.05 1.55 L 3.4 1.58 C 3.6 1.52 3.75 1.28 3.92 1.1 C 4.5 1.08 5.1 1.08 5.3 1.0 C 5.5 .92 5.55 .7 5.52 .48 L 5.4 .3 Z',
   win:['M 1.78 1.18 C 1.85 1.36 1.98 1.48 2.15 1.5 L 2.42 1.51 L 2.42 1.18 Z','M 2.5 1.18 L 2.5 1.52 L 3.0 1.53 L 3.0 1.18 Z','M 3.08 1.18 L 3.08 1.53 L 3.38 1.53 C 3.5 1.45 3.62 1.3 3.72 1.18 Z'],winC:CH,
   doors:[[2.46,.32,1.55],[3.04,.32,1.56],[1.74,.34,1.16],[3.86,.34,1.1]],handles:[[2.3,1.05],[2.88,1.05]],tail:[.05,.62,.16],
   wh:[WW(1.35,.36,.6,'#d6dae0','ww'),WW(4.55,.36,.6,'#d6dae0','ww')],
   det:[(A,X,Y,k,col)=>{const dk=shade(col,-.4);A.line(X(.2),Y(.64),X(5.3),Y(.64),CH,2);pth(A,X,Y,'M 5.1 1.02 C 4.3 1.0 3.4 .92 2.9 .66','none',dk,1.6);
     A.rect(X(5.36),Y(.84),.17*k,.34*k,.03*k,'#2a2d33',CH,1.4);for(let i=0;i<4;i++)A.line(X(5.36),Y(.56+i*.08),X(5.53),Y(.56+i*.08),CH,1.6);A.circ(X(5.42),Y(.92),.09*k,LAMP,CH,1.8);
     bumpF(A,X,Y,k,5.3,5.62,.42,[5.42]);bumpF(A,X,Y,k,-.1,.4,.44,[.1]);}]}),
 // ГАЗ-13 «Чайка»: очень длинная и низкая, плавники сзади, панорамное лобовое, 3 окна, хром-«копьё» на задней двери, много хрома
 chaika:c=>({L:5.6,H:1.62,r:[.03,.03,.02,.02,.03,.04,.12,.1,.04,.05,.04,.03,.03,.03],
   body:[[.15,.3],[0,.42],[0,.98],[.02,1.14],[.2,1.1],[.98,1.1],[1.38,1.58],[3.4,1.62],[3.52,1.6],[3.84,1.1],[5.5,1.06],[5.6,.98],[5.6,.42],[5.5,.3]],
   win:[[[1.44,1.13],[1.6,1.5],[2.2,1.53],[2.2,1.13]],[[2.28,1.13],[2.28,1.54],[3.06,1.55],[3.06,1.13]],[[3.14,1.13],[3.14,1.55],[3.44,1.55],[3.66,1.22],[3.66,1.13]]],winC:CH,
   doors:[[2.24,.32,1.56],[3.1,.32,1.58],[1.4,.33,1.1],[3.72,.33,1.08]],handles:[[2.05,1.02],[2.9,1.02]],
   wh:[WW(1.22,.35,.62,'#d6dae0','ww'),WW(4.47,.35,.62,'#d6dae0','ww')],
   det:[(A,X,Y,k)=>{A.line(X(.05),Y(1.08),X(5.5),Y(1.04),CH,1.6);A.line(X(.3),Y(.36),X(5.3),Y(.36),CH,1.8);
     A.poly([[X(2.85),Y(.84)],[X(1.72),Y(1.0)],[X(1.72),Y(.66)]],'#e8e6de',CH,1.6);for(let i=1;i<5;i++)A.line(X(1.72+i*.2),Y(1.0-i*.032),X(1.72+i*.2),Y(.66+i*.036),'#a9b0b8',1);
     A.line(X(1.72),Y(.84),X(.04),Y(.98),CH,1.6);
     A.rect(X(5.44),Y(.98),.17*k,.46*k,.03*k,'#2a2d33',CH,1.4);for(let i=0;i<6;i++)A.line(X(5.46+i*.025),Y(.96),X(5.46+i*.025),Y(.54),CH,1);
     A.circ(X(5.5),Y(.9),.075*k,LAMP,CH,1.4);A.rect(X(-.02),Y(1.12),.1*k,.3*k,.02*k,TAIL);
     bumpF(A,X,Y,k,5.4,5.7,.44,[5.52]);bumpF(A,X,Y,k,-.1,.5,.46,[.12]);}]})
});

/* ---------- состояния: ржавчина и блеск ---------- */
function rustMarks(A,id,W,H,top){const R=seed(id+(top?'t':'s')),P='#6e3512',Q='#b0602a',cid='vac'+(++CLN)+Math.floor(R()*1e6);
  A.raw(`<clipPath id="${cid}">${A.clip.map(d=>`<path d="${d}"/>`).join('')}</clipPath><g clip-path="url(#${cid})">`);
  const n=top?5+W/100*2:9;for(let i=0;i<n;i++){const x=W*(.06+R()*.88),y=top?H*(.12+R()*.76):H*(.3+R()*.55),r=(top?6:6)+R()*(top?8:9);
    // пятно неровное: несколько кругов
    for(let j=0;j<4;j++)A.ell(x+(R()-.5)*r,y+(R()-.5)*r*.7,r*(.4+R()*.4),r*(.3+R()*.3),j%2?Q:P,.75);
    for(let j=0;j<3;j++)A.circ(x+(R()-.5)*r*2.6,y+(R()-.5)*r*1.8,1+R()*1.8,P);}
  // грязь снизу
  if(!top)A.rect(0,H*.8,W,H*.15,0,'#5b4532" fill-opacity=".1');
  A.raw('</g>');
  if(!top){A.path(`M${W*.45} ${H*.36}l5 6l-3 4l6 7`,'none','#ffffff',1.3);}}
function shineMarks(A,W,H,top){const st=(x,y,s)=>A.path(`M${x} ${y-s}Q${x} ${y} ${x+s} ${y}Q${x} ${y} ${x} ${y+s}Q${x} ${y} ${x-s} ${y}Q${x} ${y} ${x} ${y-s}Z`,'#fff3a0','#e0a820',1.2);
  if(top){A.rect(W*.1,20,W*.8,5,2.5,'#ffffff" fill-opacity=".45');st(W*.78,22,9);st(W*.24,72,6);}
  else{st(W*.82,26,10);st(W*.22,40,7);st(W*.6,14,5);}}

/* ---------- сборка svg ---------- */
function svg(id,opts){const c=BY[id];if(c)id=c.id;if(!c)return '';const o=Object.assign({view:'top',state:'new'},opts||{});
  const P=pal(o.state,o.ghost),A=mk(P,isEn(o));let W,H;
  if(o.view==='side'){if(!o.ghost&&o.state==='rust')o._mid=()=>rustMarks(A,id,300,130,false);const r=side(c,o,A,P);W=r.W;H=r.H;}else{const r=top(c,o,A,P);W=r.W;H=r.H;}
  if(!o.ghost&&o.state==='rust'&&o.view!=='side')rustMarks(A,id,W,H,true);
  if(!o.ghost&&o.state==='shine')shineMarks(A,W,H,o.view!=='side');
  const w=o.w||W,h=o.h||H;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${w}" height="${h}"${o.cls?` class="${o.cls}"`:''}>${A.o.join('')}</svg>`;}

const CACHE={},WAIT=[];
function img(id,opts){const k=id+'|'+JSON.stringify(opts||{})+(isEn(opts)?'|en':'');if(CACHE[k])return CACHE[k];const s=svg(id,opts);if(!s)return null;
  const im=new Image();im.onload=()=>{WAIT.forEach(f=>{try{f(id);}catch(e){}});};im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);CACHE[k]=im;return im;}
function draw(ctx,id,x,y,w,h,opts){const im=img(id,opts);if(!im||!im.complete||!im.naturalWidth)return false;ctx.drawImage(im,x,y,w,h);return true;}

/* ---------- машины во дворе (игра зовёт из drawVehicle; гнутые «червяки» и длинные — по-старому) ----------
   Какая модель: v.vy (могут ставить LVL/YARD) → своя машина игрока v.mdl → скорая/милиция → по длине из POOL (только обычные машины альбома; без случайных чисел: от номера двора, подряд разные).
   Цвет — v.dc (краска темы/игрока), раскладку, цвета генератора и R() не трогаем. Выключить: ?cars=old или VYCARS.yard.on=false. */
const POOL={2:['kopeyka','moskvich','zapor','niva','volga','shesterka','devyatka','oka'],3:['buhanka','raf','gazel','gazon','samosval','gaz66'],4:['paz','liaz','kamaz'],5:['ikarus']};
let qOld=false;try{qOld=/[?&]cars=old/.test(location.search);}catch(e){}
const YARD={on:!qOld,pool:POOL};
function hashN(a,b){let h=(a*2654435761^b*40503)>>>0;h=Math.imul(h^h>>>13,1274126177)>>>0;return h;}
function pickFor(v){if(v._vyK===v.L+'|'+(v.mdl==null?'':v.mdl)+'|'+(v.vy||''))return v._vy;let id=null;
  if(v.vy&&BY[v.vy])id=BY[v.vy].id;
  else if(v.mdl!=null){const c=L.find(q=>q.mdl===v.mdl);id=c?c.id:null;}
  else if(v.kind==='amb')id=v.L===2?'tabletka':'skoraya';
  else if(v.kind==='pol')id='bobik';
  else if(v.deco==='taxi')id='taxi';
  else{const p=POOL[v.L];if(p){let gi=0,k=v.id||0;
    // по порядку машин той же длины во дворе — подряд разные модели (с какой начать — от номера двора)
    try{if(typeof G!=='undefined'&&G&&G.vs&&G.vs.indexOf(v)>=0){gi=(G.idx||0)+(G.daily?777:0);k=0;for(const q of G.vs){if(q===v)break;if(q.L===v.L&&!q.kind&&q.mdl==null&&!q.vy)k++;}}}catch(e){}
    id=p[(hashN(gi+1,v.L)+k)%p.length];}}
  v._vyK=v.L+'|'+(v.mdl==null?'':v.mdl)+'|'+(v.vy||'');v._vy=id;return id;}
const topImg=(id,len,col)=>img(id,{view:'top',len,color:col,shadow:false,w:len*100,h:100});
// гараж рисует машины на своих холстах один раз — запоминаем последние и перерисовываем, когда картинка догрузилась
const LIVE=[];let DM=null;
try{if(typeof drawModel==='function'){DM=drawModel;window.drawModel=function(cv,m,col){DM(cv,m,col);if(!cv)return;const i=LIVE.findIndex(q=>q[0]===cv);if(i>=0)LIVE.splice(i,1);LIVE.push([cv,m,col]);if(LIVE.length>80)LIVE.shift();};}}catch(e){}
let bump=0;
WAIT.push(()=>{if(bump)return;bump=1;setTimeout(()=>{bump=0;try{groundV++;}catch(e){}try{if(typeof kick==='function')kick();}catch(e){}
  for(let i=LIVE.length-1;i>=0;i--){const q=LIVE[i];if(!q[0].isConnected){LIVE.splice(i,1);continue;}try{DM(q[0],q[1],q[2]);}catch(e){}}},40);});
// заранее — машины гаража в родных цветах и краске игрока
setTimeout(()=>{try{MODELS.forEach((m,i)=>{const c=L.find(q=>q.mdl===i);if(!c)return;topImg(c.id,m.len,m.color);try{const k=S.paint&&S.paint[i];if(k&&PAINT[k])topImg(c.id,m.len,PAINT[k][0]);}catch(e){}});}catch(e){}},0);
function yardVeh(ctx,v,s,toPx,cs,fx){
  if(!YARD.on||!v||!v.track||s<v.bend||v.L>5)return false;
  const id=pickFor(v);if(!id)return false;
  const col=v.dc||v.color||BY[id].col,im=topImg(id,v.L,col);
  if(!im.complete||!im.naturalWidth)return false;
  const tr=v.track,he=s+v.L-1,hp=toPx(trackPt(tr,he)),tp=toPx(trackPt(tr,s)),D=DIRS[v.dir],cx=(hp[0]+tp[0])/2,cy=(hp[1]+tp[1])/2,
    an=Math.atan2(D[1],D[0]),w=v.L*cs,h=cs,hl=((v.L-1)/2+.42)*cs;
  ctx.save();ctx.translate(cx,cy);ctx.rotate(an);
  if(fx&&fx.glow){ctx.fillStyle=`rgba(255,214,40,${fx.glow})`;rr(ctx,-hl-.16*cs,-.56*cs,2*hl+.32*cs,1.12*cs,.3*cs);ctx.fill();}
  // тень — со сдвигом вниз-вправо экрана (поворачиваем сдвиг обратно)
  let shc='rgba(0,0,0,.18)';try{shc=LOOK.tod[G&&G.tod||'day'].sh||shc;}catch(e){}
  const sx=cs*.05,sy=cs*.1,c0=Math.cos(-an),s0=Math.sin(-an);
  ctx.fillStyle=shc;rr(ctx,-hl+sx*c0-sy*s0,-.4*cs+sx*s0+sy*c0,2*hl,.8*cs,.2*cs);ctx.fill();
  ctx.drawImage(raster(im,id+'|'+v.L+'|'+col,w,h,ctx),-w/2,-h/2,w,h);
  if(v.kind==='amb'||v.kind==='pol'){let on=1;try{on=calm()?1:(performance.now()/380|0)%2;}catch(e){}
    const bx=v.kind==='pol'?(.08)*cs:hl-.62*cs;ctx.fillStyle=on?'#ff3b4e':'#8b1d2a';rr(ctx,bx,-.2*cs,.12*cs,.19*cs,.03*cs);ctx.fill();ctx.fillStyle=on?'#3f7bff':'#1e2a6b';rr(ctx,bx,.01*cs,.12*cs,.19*cs,.03*cs);ctx.fill();}
  if(fx&&fx.flash){ctx.fillStyle=`rgba(255,40,60,${fx.flash})`;rr(ctx,-hl,-.4*cs,2*hl,.8*cs,.2*cs);ctx.fill();}
  ctx.restore();
  if(!(fx&&fx.noArrow)&&!v.noArrow){try{arrowAt(ctx,v,s,toPx,cs);}catch(e){}}
  return true;}
// SVG в canvas растрируется при каждом drawImage — держим готовые растры под текущий размер клетки (≤ 120 штук)
const RAS=new Map();
function raster(im,key,w,h,ctx){let sc=1;try{const m=ctx.getTransform();sc=Math.hypot(m.a,m.b)||1;}catch(e){}
  const pw=Math.max(8,Math.round(w*sc)),ph=Math.max(4,Math.round(h*sc)),k=key+'|'+pw;let c=RAS.get(k);if(c)return c;
  try{c=document.createElement('canvas');c.width=pw;c.height=ph;c.getContext('2d').drawImage(im,0,0,pw,ph);}catch(e){return im;}
  RAS.set(k,c);if(RAS.size>120)RAS.delete(RAS.keys().next().value);return c;}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

function nm(x,full){const c=typeof x==='string'?BY[x]:x;if(!c)return '';const en=isEn();return full?(en?c.fullEn:c.full):(en?c.en:c.name);}
window.VYCARS={nm,list:L,SER,RAR,ALIAS,get:id=>BY[id]||null,byMdl:i=>L.find(c=>c.mdl===i)||null,svg,img,draw,onload:f=>WAIT.push(f),yard:YARD,pick:pickFor,yardVeh,_shade:shade};
})();
