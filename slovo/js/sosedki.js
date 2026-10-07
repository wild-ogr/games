'use strict';
/* ================= «Соседки по подъезду» (z-sosed, 07.10) — соревнование недели с персонажами =================
   Офлайн, без сервера, на всех площадках. Соседки — ПЕРСОНАЖИ (так и пишем), их очки — по своему расписанию недели.
   Очки игрока (решение владельца 07.10): каждая буква найденного слова = 1 очко (кроссворд без подсказки + бонусные; обёртка submit ниже),
   задание дня этой недели = +SOS.daily. Все «словные» числа SOS — ×4,5 к первой версии (средняя длина найденного слова ≈4,4).
   Блюдце «Соседское» (SKINS id 'sosed', gift:'sos') — за SOS.plate недель в призёрах (1–3 место). Живая таблица Яндекса «week» — блок «Грамотеи недели» внизу.
   Неделя — пн–вс по местному времени (ключ — понедельник, weekDays/todayKey из ui.js/game.js; на Яндексе часы сервера через nowMs).
   Сохранение S.sos={w:неделя, s:начало участия (мс), p:очки-буквы, P:темп, c:последняя забранная неделя,
     g:{1,2,3}:грамоты, r:{w,pl,pts,c}:итог, ещё не забранный}. Облако — sosMerge (из mergeSave, core.js).
   Подключения в общих файлах: index.html (скрипт), core.js mergeSave → sosMerge, ui.js openMenu → sosMenu, winModal → sosWinHtml/sosWinBind, fitWin → '.sosw'.
   Статистика: STAT.ev('sos',{a:'on'|'open'|'res'|'claim', …}) — см. hobby-analytics/stat/README.md. Монеты — STAT.earn 'quest'. */
const SOS={from:10,daily:45,min:90,prize:[50,30,20],part:10,P0:900,Pmin:270,Pmax:13500,plate:3};
// соседки: m — доля «темпа» игрока, d — веса дней пн…вс (характер), e — значок
const SOSN=[
  {n:'Валентина Петровна',k:'кв. 12',e:'👵',m:1.08,d:[1,1,1,1,1,.8,.6],t:'Бывший завуч. Пишет ответы ручкой, без помарок.'},
  {n:'Галя с третьего',k:'кв. 9',e:'👒',m:.98,d:[1.6,1.3,1,.8,.7,.5,.5],t:'Знает всё про всех. С понедельника — на всех парах.'},
  {n:'Дед Семён',g:'m',k:'кв. 3',e:'👴',m:.9,d:[.5,.6,.8,1,1.2,1.4,1.5],t:'Разгадывает сканворды с 1974 года. Раскачивается к выходным.'},
  {n:'Тамара из 15-й',k:'кв. 15',e:'💐',m:.8,d:[.2,.2,.2,.3,.6,2.2,2.3],t:'Всю неделю на даче, зато в выходные — держись!'},
  {n:'Люся-почтальонка',k:'кв. 1',e:'📮',m:.65,d:[1.2,1.2,1.2,1.2,1.2,.3,.2],t:'Разгадывает между газетами и пенсиями. В выходные отдыхает.'},
  {n:'Нина Аркадьевна',k:'кв. 20',e:'🎵',m:.45,d:[.8,1.4,.6,1.4,.6,1,.6],t:'Поёт в хоре. Слова знает, но больше песенные.'},
  {n:'Барсик с пятого',g:'m',k:'кв. 18',e:'🐈',m:.25,d:[1,1,1,1,1,1,1],t:'Кот. Ходит по газете с кроссвордом — иногда выходит слово.'}];
let sosLast=null; // что видели в прошлый раз (для строки в окне победы: +очки, кого обошёл) — только в памяти

// случайное число 0…1 из строки (одинаковое у всех и при каждом запуске)
function sosRnd(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return (h>>>0)/4294967296;}
const sosWeek=()=>weekDays(todayKey())[0];
// начало недели (пн 00:00 местного) по ключу понедельника
function sosStart(w){return new Date(Math.floor(w/10000),Math.floor(w/100)%100-1,w%100,0,0,0).getTime();}
// веса дней соседки i в неделю w: характер × разброс; иногда день пропускает
function sosDays(w,i){const b=SOSN[i].d;return b.map((x,j)=>{const r=sosRnd(w+':'+i+':'+j);return r<.1?0:x*(.6+.8*r);});}
// доля недели соседки i, прошедшая к моменту t (внутри дня — с 8:00 до 23:00)
function sosCum(w,i,t){const st=sosStart(w),en=sosStart(+dayKeyOf(w,-7));if(t<=st)return 0;if(t>=en)return 1;
  const ds=sosDays(w,i),sum=ds.reduce((a,b)=>a+b,0)||1,d=new Date(t),j=(d.getDay()+6)%7,h=d.getHours()+d.getMinutes()/60;
  let c=0;for(let k=0;k<j;k++)c+=ds[k];c+=ds[j]*Math.min(1,Math.max(0,(h-8)/15));return Math.min(1,c/sum);}
// цель соседки на неделю
const sosGoal=(o,i)=>Math.max(3,Math.round(o.P*SOSN[i].m*(.85+.3*sosRnd(o.w+':T'+i))));
// очки соседки к моменту t (только с начала участия игрока — чужой форы нет)
function sosNb(o,i,t){return Math.max(0,Math.floor(sosGoal(o,i)*(sosCum(o.w,i,t)-sosCum(o.w,i,o.s))));}
// очки игрока: слова + задания дня этой недели
function sosPts(o){const dd=weekDays(o.w).filter(k=>S.daily&&S.daily[k]).length;return (+o.p||0)+dd*SOS.daily;}
// таблица: [{i (-1 — игрок), n, pts}], по убыванию; при равенстве игрок выше
function sosTable(o,t){const rows=SOSN.map((x,i)=>({i:i,pts:sosNb(o,i,t)}));rows.push({i:-1,pts:sosPts(o)});
  return rows.sort((a,b)=>b.pts-a.pts||(a.i<0?-1:b.i<0?1:a.i-b.i));}
const sosPlace=tb=>tb.findIndex(r=>r.i<0)+1;
const sosOn=()=>(S.lv||0)>=SOS.from&&!SHOT;
const isO=o=>!!o&&typeof o==='object'&&!Array.isArray(o);

// проверка: создать неделю, подвести итог прошлой, добавить новые слова. Возвращает S.sos или null (ещё рано)
function sosTick(){if(!sosOn())return null;const w=sosWeek(),now=nowMs();let o=S.sos,ch=false;
  if(!isO(o)){o=S.sos={w:w,s:now,p:0,P:SOS.P0,c:0,g:{}};ch=true;try{STAT.ev('sos',{a:'on',lv:S.lv});}catch(e){}}
  if(+o.w<w){sosRoll(o,w,now);ch=true;}
  if('t' in o){delete o.t;ch=true;}
  if(sosPlateDue(o)&&!sosPend(o)){sosPlateGive();ch=true;} // призёр набран (например, из облака), а итог уже забран — блюдце молча
  if(ch)save();return o;}
// очки за слово: обёртка submit (game.js) — засчитано своё слово (кроссворд или бонусное) → +число букв
(function(){if(typeof submit!=='function')return;const sub0=submit;
  submit=function(w){const n0=(S.found||0)+(S.bonusAll||0);const r=sub0.apply(this,arguments);
    try{if((S.found||0)+(S.bonusAll||0)>n0&&typeof w==='string'){const o=sosTick();if(o)o.p=(+o.p||0)+w.length;}}catch(e){}
    return r;};})();
// неделя закончилась: итог (место среди 8), награда — в ожидании (r), новый темп P
function sosRoll(o,w,now){const end=sosStart(+dayKeyOf(o.w,-7)),pts=sosPts(o),tb=sosTable(o,end),pl=sosPlace(tb);
  const prev=+dayKeyOf(w,7); // понедельник прошлой недели
  if(o.r&&+o.r.w>(+o.c||0)&&o.r.c>0){addCoins(o.r.c,'quest');o.c=o.r.w;try{STAT.ev('sos',{a:'claim',pl:o.r.pl,c:o.r.c,auto:1});}catch(e){}} // старый итог так и не открыли — монеты всё равно твои
  if(pts>=SOS.min){const c=pl<=3?SOS.prize[pl-1]:SOS.part;o.r={w:+o.w,pl:pl,pts:pts,c:c,lead:tb[0].i};o.g=isO(o.g)?o.g:{};if(pl<=3)o.g[pl]=(+o.g[pl]||0)+1;}
  else if(o.r&&+o.r.w<=(+o.c||0))delete o.r;
  try{STAT.ev('sos',{a:'res',pl:pl,pts:pts,P:o.P,gap:+o.w===prev?0:1});}catch(e){}
  // темп: прошлая неделя целиком (неполная — пересчитываем на полную); пропустил недели — соседки «сбавили» (вернувшемуся легче)
  const f=Math.max(.25,Math.min(1,(end-Math.max(+o.s||0,sosStart(o.w)))/(7*864e5)));
  let P=+o.P||SOS.P0;P=+o.w===prev?.6*pts/f+.4*P:.6*P;
  o.P=Math.round(Math.min(SOS.Pmax,Math.max(SOS.Pmin,P)));o.w=w;o.s=now;o.p=0;sosLast=null;}
// облако: та же неделя — очки максимум, начало — раньше; новее неделя — главнее; забранное, грамоты — максимум
function sosMerge(d){const b=d&&d.sos;if(!isO(b))return;let a=S.sos;
  if(!isO(a)||a===b){S.sos=a=Object.assign({},b);}
  else{const c=Math.max(+a.c||0,+b.c||0),g={};for(const k of['1','2','3'])g[k]=Math.max(+(a.g||{})[k]||0,+(b.g||{})[k]||0);
    if(+b.w>+a.w)S.sos=a=Object.assign({},b);
    else if(+b.w===+a.w){a.p=Math.max(+a.p||0,+b.p||0);a.s=Math.min(+a.s||now0(),+b.s||now0());a.P=Math.max(+a.P||0,+b.P||0)||SOS.P0;}
    a.c=c;a.g=g;const r=[a.r,b.r].filter(x=>isO(x)&&+x.w>c).sort((x,y)=>y.w-x.w)[0];if(r)a.r=r;else delete a.r;}
  delete a.t;}
const now0=()=>nowMs();
const sosPend=o=>!!(o&&isO(o.r)&&+o.r.w>(+o.c||0));
const plTxt=n=>n+'-е место',plOn=n=>n+'-м месте';
// имя в таблице и в репликах
const sosName=i=>i<0?'Ты и баба Зина':SOSN[i].n;

/* ---------- меню: кнопка ---------- */
function sosMenu(){let b=$('btnSos');const o=sosTick();
  if(!o){if(b)b.style.display='none';return;}
  if(!b){b=document.createElement('button');b.id='btnSos';b.className='btn ghost';const g=$('btnGift');g.parentNode.insertBefore(b,g);
    b.onclick=()=>{SND.tap();openSosedki('menu');};}
  const pend=sosPend(o),tb=sosTable(o,nowMs()),pl=sosPlace(tb);
  b.style.display='';b.classList.toggle('gold',pend);b.classList.toggle('ghost',!pend);
  b.innerHTML=pend?'🏆 Итоги недели — <span class="nw">забрать!</span>':`🏠 Соседки: <b class="nw">${sosPts(o)?plTxt(pl):'новая неделя'}</b>`;
  sosLast={w:o.w,pts:sosPts(o),tb:tb};swPush();}

/* ---------- окно победы: строка ---------- */
function sosWinHtml(g,r,light){if(light)return '';const o=sosTick();if(!o)return '';
  if(!r.sos){const tb=sosTable(o,nowMs()),pl=sosPlace(tb),pts=sosPts(o),L=sosLast&&sosLast.w===o.w?sosLast:null,d=L?pts-L.pts:0;let pass='';
    if(L){const was=L.tb.slice(0,L.tb.findIndex(x=>x.i<0)).map(x=>x.i),now=tb.slice(sosPlace(tb)).map(x=>x.i);const k=was.find(i=>now.indexOf(i)>=0);if(k!=null)pass=SOSN[k].n;}
    r.sos={pl:pl,d:d,pass:pass,pend:sosPend(o)};sosLast={w:o.w,pts:pts,tb:tb};}
  const s=r.sos,t=s.pend?'🏆 Итоги недели в подъезде готовы — посмотреть':!S.tip.sosv?'🏠 <b>Соседки по подъезду</b>: соревнуемся, кто больше слов за неделю — посмотри':s.pass?`🏠 ${s.pass} — позади! Ты на <b>${plOn(s.pl)}</b>`:
    `🏠 Соседки: ${s.d>0?`<b>+${s.d}</b> ${plural(s.d,'очко','очка','очков')} · `:''}ты на <b>${plOn(s.pl)}</b>`;
  swPush();return `<p class="sosw" id="mSos">${t} ›</p>`;}
function sosWinBind(g,r){const e=$('mSos');if(e)e.onclick=()=>{SND.tap();openSosedki('win',()=>winModal(g,r,true));};}

/* ---------- окно «Соседки по подъезду» ---------- */
function openSosedki(from,back){const o=sosTick();if(!o)return;if(!S.tip.sosv){S.tip.sosv=1;save();} // r2: заглядывал — в окне победы дальше «место», а не объяснение
  try{STAT.screen('sos');STAT.ev('sos',{a:'open',f:from||'',pl:sosPlace(sosTable(o,nowMs())),pts:sosPts(o)});}catch(e){}
  if(sosPend(o)){sosResult(o,back);return;}
  const tb=sosTable(o,nowMs()),pl=sosPlace(tb),pts=sosPts(o),zero=tb.every(x=>x.i<0||!x.pts),lead=tb[0].i<0?tb[1]:tb[0];
  const zs=zero?'Новая неделя! Соседки ещё чай пьют — самое время начать.':pl===1?pick([`Ты впереди всего подъезда! ${SOSN[tb[1].i].n} уже очки протирает.`,'Первое место! Пойду в окно помашу — пусть видят.'])
    :pl<=3?`Почти! ${SOSN[lead.i].n} впереди — догоним, неделя длинная.`:pick(['Не спеши, неделя длинная. Соседки тоже не каждый день разгадывают.','Каждая буква — очко, длинные слова дороже. Отгадаем пару уровней — и подвинем соседок.']);
  const g=o.g||{},gr=['1','2','3'].filter(k=>+g[k]).map(k=>['🥇','🥈','🥉'][k-1]+'×'+g[k]).join(' ');
  const rows=tb.map((x,j)=>{const me=x.i<0,nb=SOSN[x.i];
    return `<div class="sosr${me?' me':''}"><span class="sp">${j+1}</span><span class="se">${me?'🏠':typeof sosFace==='function'?sosFace(x.i):nb.e}</span><span class="sn"><b>${me?'Ты и баба Зина':nb.n}</b><small>${me?'кв. 7 · это ты'+(gr?' · '+gr:''):nb.k+' · '+nb.t}</small></span><span class="ss">${!me&&!x.pts?'💤':x.pts}</span></div>`;}).join('');
  modal(`<div class="sosm"><h2>🏠 Соседки по подъезду</h2>
    <div class="sosz"><div class="av">${zinaSVG(pl===1&&!zero?'wow':'happy')}</div><p>${zs}</p></div>
    <div class="sost">${rows}<div id="sosLive"></div></div>
    <p class="sosh">Буква — <b>очко</b>, задание дня — <b>+${SOS.daily}</b>. Итоги в понедельник: за 1–3 место <b>${SOS.prize.map(x=>'+'+x).join('/')}</b> ${COIN_I}, остальным +${SOS.part}. <span class="sosp">Соседки — придуманные персонажи бабы Зины.</span></p>
    <div class="btns"><button class="btn green" id="mSosOk">${back?'Назад':'Хорошо'}</button></div></div>`);
  $('mSosOk').onclick=()=>{SND.tap();if(back)back();else hideModal();};
  swFill(from,back);}
// итог недели: место, грамота, монеты (выдаются при открытии этого окна)
function sosResult(o,back){const r=o.r,c=+r.c||0,top=r.pl<=3,lead=r.lead!=null&&r.lead>=0?SOSN[r.lead].n:'';
  const plate=sosPlateDue(o);if(plate)sosPlateGive();
  o.c=r.w;addCoins(c,'quest');save();cloudSoon();try{STAT.ev('sos',{a:'claim',pl:r.pl,c:c,pts:r.pts});}catch(e){}
  const h=r.pl===1?'🏆 Первое место в подъезде!':r.pl===2?'🥈 Второе место в подъезде!':r.pl===3?'🥉 Третье место в подъезде!':'🏠 Итоги недели в подъезде';
  const t=r.pl===1?pick(['Вывесила твою грамоту на доску объявлений. Галя с третьего ходит вокруг и вздыхает.','Весь подъезд обошли! Валентина Петровна сказала: «Достойно». От неё это — орден.'])
    :r.pl<=3?`${lead?lead+' '+(SOSN[r.lead].g==='m'?'обошёл':'обошла')+' совсем чуть-чуть':'До первого места — совсем чуть-чуть'}. Ничего, на этой неделе покажем!`
    :`У тебя ${r.pts} ${plural(r.pts,'очко','очка','очков')} за неделю — я всё посчитала! Соседки старались, а мне главное — что мы вместе разгадывали. Держи к чаю.`;
  modal(`<div class="sosm"><h2>${h}</h2><div style="width:100px;height:100px;margin:4px auto">${zinaSVG(top?'wow':'happy')}</div>
    <p>${t}</p>${top?`<div class="sosg">${['🥇','🥈','🥉'][r.pl-1]} Грамота за ${plTxt(r.pl)} · ${r.pts} ${plural(r.pts,'очко','очка','очков')}</div>`:''}
    ${c?`<div class="reward big" id="mRew">+${c} <span class="coin"></span></div>`:''}
    ${plate?`<div class="sosplate"><div class="mini" id="sosPv" style="width:64px;height:64px"><div class="plate"></div></div><p>И блюдце <b>«${SOS_PLATE.n}»</b> — за ${SOS.plate} недели в призёрах! Оно уже в «Обликах».</p></div>`:''}
    <p class="sosh">Новая неделя уже началась — соседки снова за кроссвордами.</p>
    <div class="btns"><button class="btn green" id="mSosGo">Посмотреть новую неделю</button>${back?'<button class="btn ghost small" id="mSosB">Назад</button>':''}</div></div>`);
  if(c){SND.coin();coinBurst($('mRew'),c);}if(top){try{confetti();}catch(e){}}
  const pv=$('sosPv');if(pv)try{applySkin(pv,SOS_PLATE.id);}catch(e){}
  $('mSosGo').onclick=()=>{SND.tap();openSosedki('res',back);};const bb=$('mSosB');if(bb)bb.onclick=()=>{SND.tap();back();};
  if($('btnSos'))sosMenu();}

/* ---------- блюдце «Соседское»: за SOS.plate недель в призёрах (1–3 место, не обязательно подряд) ---------- */
// за монеты не продаётся (gift); в «Обликах» — строка прогресса (sosShopTxt, точечная вставка в openShop, extras.js)
const SOS_PLATE={id:'sosed',n:'Соседское',gift:'sos',d:'Тарелка с вишнями — соседки передают её по кругу. Достаётся тем, кто три недели в призёрах подъезда.',
  lc:'#6e1420',lb:'rgba(255,250,240,.86)',on:'#b3202f',onc:'#fff',line:'#b3202f',sh:'#dcc6b2'};
if(typeof SKINS!=='undefined'&&!SKINS.some(k=>k.id===SOS_PLATE.id))SKINS.push(SOS_PLATE);
const sosPrizes=o=>['1','2','3'].reduce((a,k)=>a+(+((o&&o.g)||{})[k]||0),0);
const sosPlateDue=o=>sosPrizes(o)>=SOS.plate&&!(S.own||{})['s:'+SOS_PLATE.id];
function sosPlateGive(){S.own=S.own||{};S.own['s:'+SOS_PLATE.id]=1;try{STAT.ev('sos',{a:'plate',g:sosPrizes(S.sos)});}catch(e){}}
function sosShopTxt(){return `<div class="ok" style="color:var(--ink2)">🏆 Призёр подъезда<br>(${Math.min(sosPrizes(S.sos),SOS.plate)} из ${SOS.plate} недель)</div>`;}
(function(){if(typeof plateSVG!=='function')return;const p0=plateSVG;let q=0;
  plateSVG=function(id){if(id!==SOS_PLATE.id)return p0.apply(this,arguments);const k='ss'+(++q);let ch='';
    for(let i=0;i<10;i++){const a=i*Math.PI/5,x=50+Math.cos(a)*42.5,y=50+Math.sin(a)*42.5,r=a*180/Math.PI;
      ch+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(r+90).toFixed(0)})"><path d="M0 -4.5 q1.6 -2.6 3.6 -3.2 M0 -4.5 q-1.4 -2.4 -3.4 -3" stroke="#3f7a2a" stroke-width=".7" fill="none"/><path d="M0 -4.6 q2.6 -1 3.4 -3.6 q-2.8 .2 -3.4 3.6z" fill="#5d9b3a"/>
        <circle cx="-2" cy="-.6" r="2.6" fill="#c41e2e"/><circle cx="2.2" cy="-.2" r="2.6" fill="#a8172a"/><circle cx="-2.7" cy="-1.4" r=".8" fill="#fff" opacity=".7"/></g>`;}
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%">
      <defs><radialGradient id="${k}" cx=".45" cy=".4"><stop offset="0" stop-color="#fffdf7"/><stop offset=".7" stop-color="#fbf1e2"/><stop offset="1" stop-color="#ecd9c2"/></radialGradient></defs>
      <circle cx="50" cy="50" r="49.5" fill="url(#${k})"/><circle cx="50" cy="50" r="47.6" fill="none" stroke="#b3202f" stroke-width="1.6"/><circle cx="50" cy="50" r="36.5" fill="none" stroke="#e7cdb4" stroke-width=".8"/>${ch}
      <g transform="translate(50 50)"><path d="M-6 -1 L0 -6.5 L6 -1" fill="none" stroke="#b3202f" stroke-width="1.3" stroke-linejoin="round"/><rect x="-4.6" y="-1.5" width="9.2" height="7" fill="#fff6e8" stroke="#b3202f" stroke-width="1"/><rect x="-1.3" y=".6" width="2.6" height="2.6" fill="#f5b72d"/></g></svg>`;};})();

/* ---------- «Грамотеи недели»: живая таблица Яндекса (лидерборд «week», создаёт владелец в консоли) ----------
   Только Яндекс и только у вошедших (ypAuth, extras.js). Очки: номер недели × 10⁵ + очки недели (≤99 999) — текущая неделя всегда выше прошлых,
   таблица «обнуляется» сама. Нет таблицы / нет входа / ошибка SDK — молча, окно соседок без строки (две ошибки подряд — выключено до перезапуска).
   Запись — не раньше 2,5 с после победы (words пишет lbSubmit сразу; Яндекс — не чаще раза в секунду) и не чаще раза в 30 с. */
const SW={name:'week',top:5,gap:30000,ep:20260105};
let swOff=false,swSent=0,swLast=0,swT=0,swData=null,swBusy=false,swErr=0;
const swNo=w=>Math.round((sosStart(w)-sosStart(SW.ep))/(7*864e5))+1; // неделя 1 — с 05.01.2026
function swApi(){if(swOff||typeof ysdk==='undefined'||!ysdk||typeof ypAuth!=='function'||!ypAuth())return null;
  try{const L=ysdk.leaderboards||ysdk.leaderboard;
    if(L&&typeof L.setScore==='function'&&typeof L.getEntries==='function')return {set:v=>L.setScore(SW.name,v),get:o=>L.getEntries(SW.name,o)};
    if(typeof ysdk.getLeaderboards==='function')return {set:v=>ysdk.getLeaderboards().then(b=>b.setLeaderboardScore(SW.name,v)),get:o=>ysdk.getLeaderboards().then(b=>b.getLeaderboardEntries(SW.name,o))};
  }catch(e){}return null;}
const swCall=f=>new Promise((res,rej)=>{try{Promise.resolve(f()).then(res,rej);}catch(e){rej(e);}});
function swFail(a,e){swErr++;if(swErr>=2)swOff=true;try{STAT.ev('sos',{a:'lb',r:a,n:swErr,e:String(e&&(e.code||e.message)||e).slice(0,30)});}catch(x){}}
function swPush(){if(!swApi())return;clearTimeout(swT);swT=setTimeout(swSend,Math.max(2500,swLast+SW.gap-Date.now()));}
function swSend(){const a=swApi(),o=S.sos;if(!a||!isO(o)||+o.w!==sosWeek())return;const pts=Math.min(99999,sosPts(o));if(pts<=0)return;
  const v=swNo(o.w)*1e5+pts;if(v<=swSent)return;swLast=Date.now();
  swCall(()=>a.set(v)).then(()=>{swSent=v;swErr=0;if(swData)swData.ts=0;},e=>swFail('set',e));}
const swEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
function swLoad(){const a=swApi(),wn=sosOn()?swNo(sosWeek()):0;if(!a||!wn)return Promise.resolve(null);
  if(swData&&swData.wn===wn&&Date.now()-swData.ts<60000)return Promise.resolve(swData);if(swBusy)return Promise.resolve(null);swBusy=true;
  return swCall(()=>a.get({quantityTop:SW.top,includeUser:true,quantityAround:1})).then(r=>{swErr=0;let me='';try{me=YP.getUniqueID();}catch(e){}
    const ur=+(r&&r.userRank)||0,seen={},rows=[];
    for(const x of (r&&Array.isArray(r.entries)?r.entries:[])){const sc=+(x&&x.score)||0,rk=+(x&&x.rank)||0;if(Math.floor(sc/1e5)!==wn||!rk||seen[rk])continue;seen[rk]=1;
      const pl=x.player||{};rows.push({rk:rk,n:String(pl.publicName||'').slice(0,40),pts:sc%1e5,me:!!(me&&pl.uniqueID===me)||ur>0&&rk===ur});}
    rows.sort((a,b)=>a.rk-b.rk);swData={wn:wn,ts:Date.now(),rows:rows};return swData;},e=>{swFail('get',e);return null;}).then(d=>{swBusy=false;return d;});}
// строка в окне соседок — только когда таблица ответила и в ней есть кто-то, кроме тебя
function swFill(from,back){swLoad().then(d=>{const el=$('sosLive');if(!el||!d||!d.rows.some(x=>!x.me))return;const me=d.rows.find(x=>x.me);
  el.innerHTML=`<div class="sosr live" id="mSosLive"><span class="se">👥</span><span class="sn"><b>Живые игроки Яндекса</b><small>${me?'ты на '+plOn(me.rk):'грамотеи недели'}</small></span><span class="ss">›</span></div>`;
  const sm=document.querySelector('#mcard .sosm');if(sm)sm.classList.add('swon');
  $('mSosLive').onclick=()=>{SND.tap();openSwLive(from,back);};}).catch(()=>{});}
function openSwLive(from,back){const d=swData;if(!d){openSosedki(from,back);return;}const me=d.rows.find(x=>x.me);
  try{STAT.ev('sos',{a:'live',n:d.rows.length,rk:me?me.rk:0});}catch(e){}
  let prev=0;const rows=d.rows.map(x=>{const gap=prev&&x.rk>prev+1?'<div class="sosr gap">…</div>':'';prev=x.rk;
    return gap+`<div class="sosr${x.me?' me':''}"><span class="sp">${x.rk}</span><span class="sn"><b>${x.me?'Ты':swEsc(x.n||'Грамотей без имени')}</b></span><span class="ss">${x.pts}</span></div>`;}).join('');
  modal(`<div class="sosm"><h2>👥 Грамотеи недели</h2>
    <p class="sosh">Живые игроки Яндекса. Очки те же, что в подъезде: буквы найденных слов и задания дня. Каждый понедельник — новая таблица.</p>
    <div class="sost">${rows}</div>
    <div class="btns"><button class="btn green" id="mSwB">Назад к соседкам</button></div></div>`);
  $('mSwB').onclick=()=>{SND.tap();openSosedki('live',back);};}

/* ---------- портреты соседок (художник w-art, 07.10; исходник — hobby-analytics/release-i/zina/art/sosedki/sos-faces.js) ----------
   Портреты соседок для «Соседок по подъезду» (w-art, 07.10). Предложение вместо эмодзи 👵👒👴💐📮🎵🐈 в таблице.
   Стиль — как Зина в игре (плоские цвета, круглые лица, румянец), но без градиентов и id → можно вставлять сколько угодно раз.
   Порядок = SOSN в js/sosedki.js (z-sosed). Подключение (главному): sosFace(i) вместо nb.e; размер в таблице 32–36 px.
   Пример: <span class="se">${sosFace(i)}</span>, .se svg{width:34px;height:34px;display:block} */
var SOS_FACE_RAW=(function(){
  var SK='#f6c9a8',SK2='#eab28f',BL='#f58f8f',EY='#3a2a22',MO='#b83b44';
  function base(bg){return '<circle cx="50" cy="50" r="50" fill="'+bg+'"/>';}
  function face(o){o=o||{};var sk=o.sk||SK;
    return '<ellipse cx="50" cy="56" rx="25" ry="27" fill="'+sk+'"/>'+
      '<circle cx="25" cy="58" r="5" fill="'+sk+'"/><circle cx="75" cy="58" r="5" fill="'+sk+'"/>'+
      '<ellipse cx="37" cy="66" rx="5.5" ry="3.5" fill="'+BL+'" opacity=".5"/><ellipse cx="63" cy="66" rx="5.5" ry="3.5" fill="'+BL+'" opacity=".5"/>';}
  function eyes(t){return t==='happy'
    ?'<path d="M37 56 q4 -4 8 0 M55 56 q4 -4 8 0" stroke="'+EY+'" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
    :'<circle cx="41" cy="56" r="2.8" fill="'+EY+'"/><circle cx="59" cy="56" r="2.8" fill="'+EY+'"/><circle cx="41.8" cy="55.2" r=".9" fill="#fff"/><circle cx="59.8" cy="55.2" r=".9" fill="#fff"/>';}
  function mouth(t){return t==='strict'?'<path d="M44 72 q6 -1.5 12 0" stroke="'+MO+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
    :t==='open'?'<path d="M42 70 q8 10 16 0 q-8 3 -16 0z" fill="'+MO+'"/>'
    :t==='red'?'<path d="M43 71 q7 6 14 0 q-7 -2 -14 0z" fill="#d7263d"/>'
    :'<path d="M43 70 q7 7 14 0" stroke="'+MO+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>';}
  function body(c,c2){return '<path d="M14 100 q2 -20 22 -24 h28 q20 4 22 24z" fill="'+c+'"/>'+(c2?'<path d="M43 76 l7 9 l7 -9z" fill="'+c2+'"/>':'');}
  function wrap(s){return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><clipPath id="CLIPID"><circle cx="50" cy="50" r="50"/></clipPath><g clip-path="url(#CLIPID)">'+s+'</g></svg>';}
  return [
    // 0 Валентина Петровна — бывший завуч: тёмно-серый тугой пучок, узкие очки, строгий рот, тёмно-синий жакет
    wrap(base('#dfe6f3')+'<g>'+body('#2f3f6b','#fff')+
      '<circle cx="50" cy="20" r="10" fill="#6c7280"/>'+face()+
      '<path d="M25 56 q-2 -28 25 -30 q27 2 25 30 q-4 -16 -14 -19 q-8 7 -26 4 q-8 4 -10 15z" fill="#6c7280"/>'+
      eyes()+'<path d="M33 52 h14 v7 h-14z M53 52 h14 v7 h-14z" fill="rgba(200,225,255,.25)" stroke="#2b2b2b" stroke-width="2"/><path d="M47 55 h6" stroke="#2b2b2b" stroke-width="2"/>'+
      '<path d="M36 47 l9 2 M64 47 l-9 2" stroke="#4b505c" stroke-width="2.6" stroke-linecap="round"/>'+mouth('strict')+'</g>'),
    // 1 Галя с третьего — сплетница: рыжая (хна), бигуди, большие серьги, розовая кофта
    wrap(base('#ffe3ea')+body('#e86a9a')+face()+
      '<path d="M24 58 q-4 -32 26 -34 q30 2 26 34 q-3 -14 -12 -16 q-10 6 -28 2 q-9 4 -12 14z" fill="#d9662b"/>'+
      '<g fill="#7ec3f0" stroke="#3d8cc4" stroke-width="1.5"><rect x="30" y="20" width="10" height="16" rx="5"/><rect x="45" y="17" width="10" height="16" rx="5"/><rect x="60" y="20" width="10" height="16" rx="5"/></g>'+
      '<circle cx="24" cy="66" r="4.5" fill="#f5b72d"/><circle cx="76" cy="66" r="4.5" fill="#f5b72d"/>'+
      eyes('happy')+'<path d="M35 49 q6 -3 11 0 M54 49 q6 -3 11 0" stroke="#a24a1c" stroke-width="2.4" fill="none" stroke-linecap="round"/>'+mouth('open')),
    // 2 Дед Семён — сканворды с 1974: кепка, седые усы, карандаш за ухом
    wrap(base('#e4efe0')+body('#6b7b5a','#e9e2cf')+face({sk:'#efbf9c'})+
      '<path d="M25 50 q0 -8 5 -12 M75 50 q0 -8 -5 -12" stroke="#d6d8de" stroke-width="7" stroke-linecap="round"/>'+
      '<path d="M22 44 q4 -22 28 -22 q24 0 28 22z" fill="#5b5f6b"/><path d="M20 44 h44 q16 0 18 6 h-62z" fill="#474b56"/>'+
      '<path d="M78 40 l10 -16" stroke="#f5b72d" stroke-width="4" stroke-linecap="round"/><path d="M88 24 l2 -4" stroke="#3a2a22" stroke-width="3" stroke-linecap="round"/>'+
      eyes()+'<path d="M36 50 l9 1 M64 50 l-9 1" stroke="#c9ccd4" stroke-width="3" stroke-linecap="round"/>'+
      '<path d="M36 69 q7 -6 14 -2 q7 -4 14 2 q-7 4 -14 0 q-7 4 -14 0z" fill="#e3e5ea"/>'+'<circle cx="50" cy="62" r="4" fill="#e09a7a"/>'),
    // 3 Тамара из 15-й — дачница: соломенная шляпа с цветком, загар, зелёная кофта
    wrap(base('#fff3cf')+body('#5aa04a')+face({sk:'#e9ae84'})+
      '<path d="M26 60 q-3 -18 6 -26 h36 q9 8 6 26 q-4 -10 -10 -12 h-28 q-6 2 -10 12z" fill="#8a5a3c"/>'+
      '<ellipse cx="50" cy="38" rx="40" ry="9" fill="#e8c46a"/><path d="M30 38 q2 -22 20 -22 q18 0 20 22z" fill="#f0d27e"/><path d="M30 34 h40" stroke="#d7263d" stroke-width="5"/>'+
      '<g transform="translate(68 30)"><circle r="3.4" fill="#fff" cx="0" cy="-4"/><circle r="3.4" fill="#fff" cx="4" cy="0"/><circle r="3.4" fill="#fff" cx="0" cy="4"/><circle r="3.4" fill="#fff" cx="-4" cy="0"/><circle r="2.6" fill="#f5b72d"/></g>'+
      eyes('happy')+mouth('open')),
    // 4 Люся-почтальонка — помоложе: синяя форменная кепи, каре, ремень сумки
    wrap(base('#dcecff')+body('#2f6fd6')+'<path d="M30 78 l40 22" stroke="#7a4b2a" stroke-width="6"/>'+face()+
      '<path d="M24 66 q-4 -36 26 -38 q30 2 26 38 q-2 -12 -6 -18 h-40 q-4 6 -6 18z" fill="#6b3f26"/>'+
      '<path d="M28 38 q4 -16 22 -16 q18 0 22 16z" fill="#1d4fa3"/><path d="M26 38 h48 v5 h-48z" fill="#163d7f"/><circle cx="50" cy="30" r="4" fill="#f5b72d"/>'+
      eyes()+'<path d="M36 50 q5 -3 9 0 M55 50 q5 -3 9 0" stroke="#5a3520" stroke-width="2.4" fill="none" stroke-linecap="round"/>'+mouth()),
    // 5 Нина Аркадьевна — хор: высокий платиновый начёс, красная помада, брошь-нотка
    wrap(base('#f1e4ff')+body('#7b3fa0')+'<g transform="translate(64 88)"><circle r="5" fill="#f5b72d"/><path d="M2 0 v-10 l6 2" stroke="#b9860f" stroke-width="2" fill="none"/></g>'+face()+
      '<path d="M24 58 q-6 -44 26 -46 q32 2 26 46 q-2 -16 -10 -20 q-10 6 -32 0 q-8 4 -10 20z" fill="#efe4c4"/><path d="M34 18 q16 -10 32 0" stroke="#d8c9a0" stroke-width="2.5" fill="none"/>'+
      eyes()+'<path d="M36 50 q5 -4 9 -1 M55 49 q5 -3 9 1" stroke="#b7a57a" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
      '<path d="M37 52 l-3 -2 M63 52 l3 -2" stroke="'+EY+'" stroke-width="1.6"/>'+mouth('red')),
    // 6 Барсик с пятого — серый полосатый кот (не путать с рыжим Ятем)
    wrap(base('#e9eef2')+'<path d="M20 100 q0 -24 30 -26 q30 2 30 26z" fill="#9aa3ad"/>'+
      '<path d="M24 40 l-2 -24 l18 12z M76 40 l2 -24 l-18 12z" fill="#9aa3ad"/><path d="M27 34 l-1 -12 l9 7z M73 34 l1 -12 l-9 7z" fill="#f2c4cf"/>'+
      '<ellipse cx="50" cy="54" rx="28" ry="25" fill="#a9b2bc"/>'+
      '<path d="M42 32 l3 8 M50 30 v10 M58 32 l-3 8" stroke="#6f7984" stroke-width="3" stroke-linecap="round"/>'+
      '<path d="M24 52 l8 2 M76 52 l-8 2" stroke="#6f7984" stroke-width="3" stroke-linecap="round"/>'+
      '<ellipse cx="50" cy="64" rx="11" ry="8" fill="#eef1f4"/>'+
      '<ellipse cx="40" cy="52" rx="3.6" ry="4.6" fill="#3d5a2a"/><ellipse cx="60" cy="52" rx="3.6" ry="4.6" fill="#3d5a2a"/><circle cx="41" cy="50.5" r="1.2" fill="#fff"/><circle cx="61" cy="50.5" r="1.2" fill="#fff"/>'+
      '<path d="M47 60 h6 l-3 3.5z" fill="#e0707a"/><path d="M50 63.5 q-3 4 -6 2 M50 63.5 q3 4 6 2" stroke="#3a2a22" stroke-width="1.5" fill="none"/>'+
      '<path d="M30 62 l-14 -2 M30 66 l-13 3 M70 62 l14 -2 M70 66 l13 3" stroke="#fff" stroke-width="1.3"/>')
  ];
})();

// id обрезки — свой у каждой вставки (как zinaN у Зины: иначе со скрытого экрана рисунок пропадает)
var sosFaceN=0;function sosFace(i){return SOS_FACE_RAW[i].replace(/CLIPID/g,'sf'+(++sosFaceN));}

/* ---------- стили (здесь, чтобы не трогать общий index.html) ---------- */
(function(){const st=document.createElement('style');st.textContent=
  '.sosw{font-size:14.5px!important;margin:6px 0 0!important;padding:6px 10px;background:var(--card);border-radius:12px;box-shadow:0 2px 0 var(--edge2);cursor:pointer;color:var(--ink)!important}'+
  '.sosw b{color:var(--blue)}'+
  '.sosz{display:flex;align-items:center;gap:8px;text-align:left;margin:2px 0 6px}.sosz .av{width:58px;height:58px;flex:none}.sosz p{margin:0!important;font-size:15px!important}'+
  '.sost{background:var(--card);border-radius:14px;box-shadow:0 2px 0 var(--edge2);padding:4px 6px;text-align:left}'+
  '.sosr{display:flex;align-items:center;gap:6px;padding:5px 2px;border-bottom:1px solid var(--edge2)}.sosr:last-child{border-bottom:0}'+
  '.sosr.me{background:var(--hl);border-radius:10px;margin:2px -2px;padding:6px 4px}'+
  '.sosr .sp{width:20px;text-align:center;font-weight:800;color:var(--ink2);font-size:14px;flex:none}.sosr .se{font-size:20px;width:32px;text-align:center;flex:none}.sosr .se svg{width:32px;height:32px;display:block;margin:0 auto}'+
  '.sosr .sn{flex:1;min-width:0;line-height:1.15}.sosr .sn b{display:block;font-size:15px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '.sosr .sn small{display:block;font-size:12px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '.sosr .ss{font-weight:900;font-size:17px;color:var(--ink);min-width:36px;text-align:right;flex:none}.sosr.me .ss{color:var(--blue)}'+
  '.mcard .sosh{font-size:13.5px;margin:8px 0 0;line-height:1.35}'+
  '.sosg{display:inline-block;margin:6px 0;padding:6px 14px;border-radius:12px;background:var(--hl);font-weight:800;color:var(--ink);box-shadow:0 2px 0 var(--edge2)}'+
  '.sosr.live{cursor:pointer;border-top:1px dashed var(--edge);border-bottom:0;margin-top:2px}.sosr.live b{color:var(--blue)}.sosr.gap{justify-content:center;color:var(--ink2);padding:0}'+
  '.sosplate{display:flex;align-items:center;gap:10px;text-align:left;margin:6px 0}.sosplate .mini{position:relative;flex:none}.sosplate .mini .plate{position:absolute;top:0;left:0;width:100%;height:100%;border-radius:50%}.sosplate p{margin:0!important;font-size:15px!important}'+
  '#btnSos{font-size:16px;padding:10px 8px;line-height:1.3}#btnSos.gold{min-height:48px}'+
  '@media (max-height:700px){.sosr{padding:2px}.sosr.me{padding:3px 4px}.sosr .sn small{display:none}.sosr.me .sn small{display:block}.sosr .sn b{font-size:14.5px}.sosr .se{font-size:18px;width:28px}.sosr .se svg{width:28px;height:28px}.sosz .av{width:44px;height:44px}.sosz p{font-size:14px!important}.mcard .sosh{font-size:12.5px;margin-top:4px}.mcard .sosm.swon .sosz{display:none}#btnSos{padding:8px}}'+
  '@media (max-height:600px){.sosz .av{display:none}.mcard .sosm h2{font-size:20px}}';
  document.head.appendChild(st);})();
