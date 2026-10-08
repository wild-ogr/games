/* Рыбалка с Петровичем — ГЛАВЫ: Царь-рыба, письма Севера, заголовки глав на карте (NORTH, 08.10.2026).
   Журнал: hobby-analytics/release-i/rybak-boost/logs/NORTH.md. Грузится ПОСЛЕ основного скрипта (как js/themes.js): оборачивает
   a2Start, pickFish, a3MailNext, fixSave, mergeSave, openMap. Данные — js/places.js (CHAPTERS, PLACES, LEG).
   Поле сохранения: S.chTs = {<глава>: день последнего выхода Царь-рыбы, 'h<глава>': день подсказки} — объединение по максимуму.
   Старые WebView: без ?. и ??. */
(function(){
'use strict';
if(typeof S==='undefined'||typeof PLACES==='undefined')return;
function chOf(id){for(const c of CHAPTERS)if(c.id===id)return c;return null;}
// все легенды главы пойманы?
function chLegsDone(ch){const C=chOf(ch);if(!C)return false;for(const id of C.pl){const P=PLACES[placeIdx(id)];if(!P||P.leg&&!(S.legs&&S.legs[P.leg]))return false;}return true;}
function chTs(){if(!isObj(S.chTs))S.chTs={};return S.chTs;}
// Царь-рыба места pi может выйти сегодня
function tsarReady(pi){const P=PLACES[pi];if(!P||!P.tsar)return false;const T=LEG[P.tsar];return !!T&&chLegsDone(T.ch)&&(chTs()[T.ch]||0)!==dayNum();}
window.chLegsDone=chLegsDone;window.tsarReady=tsarReady;

// --- Царь-рыба: в условия заброса (G.o) — флаг tsar; подсказка Петровича раз в день ---
{const a2s=a2Start;a2Start=function(){a2s.apply(this,arguments);try{if(G&&G.o&&!G.tourn&&!G.guest&&tsarReady(G.pi)){G.o.tsar=1;const T=LEG[PLACES[G.pi].tsar],t=chTs(),k='h'+T.ch;
    if(t[k]!==dayNum()){t[k]=dayNum();save();later(()=>say('mit',L('Чую, сегодня на зорьке выйдет '+T.n+'! Блесну — и подальше от берега. Попытка одна — до завтра её не жди.',''),9000),4000);}}}catch(e){}};}
// вышла Царь-рыба (поклёвка) — попытка на сегодня истрачена, чем бы ни кончилось
{const pf=pickFish;pickFish=function(pi,bait,tod,wx,df,R,o){const r=pf.apply(this,arguments);
  try{if(r&&r.f&&r.f.rar==='tsar'&&o&&o.tsar){chTs()[r.f.ch]=dayNum();if(G&&G.o)G.o.tsar=0;save();try{STAT.ev('mod',{m:'tsar',a:'bite',k:r.f.id});}catch(e){}}}catch(e){}return r;};}

// --- Красная книга: в карточке улова — «📷 Сфотографировать и отпустить» (сцену рисует MGC: mgcFoto). Награда уже полная (обычный путь),
//     рыба помечается отпущенной (в итогах — не «в садок»: G.catch[...].rel=1) ---
{const sc=showCatch;showCatch=function(){sc.apply(this,arguments);try{const pk=G&&G.pk,f=pk&&pk.f;if(!f||f.rar!=='rb')return;
  const last=G.catch&&G.catch[G.catch.length-1];if(last&&last.id===f.id)last.rel=1;
  if(typeof mgcFoto!=='function')return;const nx=document.getElementById('cNext');if(!nx||document.getElementById('cRb'))return;
  const b=document.createElement('button');b.className='btn accent noenter';b.id='cRb';b.style.cssText='width:100%;margin-bottom:8px';b.textContent='📷 '+L('Сфотографировать и отпустить','Take a photo and release');
  b.onclick=()=>{b.remove();try{mgcFoto({id:f.id,w:pk.w,pi:G.pi,k:'rb'});}catch(e){}};nx.parentNode.insertBefore(b,nx);}catch(e){}};}

// --- лодка — ключ к морям (украшение «Лодка» с берега; купившим раньше — засчитано само) ---
function hasBoat(){return !!(S.dec&&S.dec.boat);}window.hasBoat=hasBoat;
{const bp=buyPlace;buyPlace=function(i){const P=PLACES[i];if(P&&P.boat&&!hasBoat()&&!S.open[i]){const B=DEC.boat;
  modal(`<h2>🚣 ${L('Нужна лодка','You need a boat')}</h2><p>${L('«'+P.n+'» — это море: с берега до рыбы не докинешь. Купи лодку в «Снасти → Берег» — она и на берегу будет стоять, и в море возить.','«'+nm(P)+'» is the sea — you need a boat. Buy one in Tackle → Shore.')}</p><p>🚣 ${esc(nm(B))}: <b>${coinsTxt(B.p)}</b></p>
    <div class="row"><button class="btn green" id="nbBoat">🚣 ${L('К лодке','To the boat')}</button><button class="btn" id="mCancel">${L('Позже','Later')}</button></div>`);
  $('nbBoat').onclick=()=>{hideModal();openShop('d','boat');};$('mCancel').onclick=hideModal;return;}
  return bp.apply(this,arguments);};}

// --- ОТВЕС (моря): подписи, магазин, рисунок. Числа — js/places.js (OTV_P, OTV_W) и ветка o.otv в LOGIC ---
function otvOn(){return !!(G&&G.o&&G.o.otv&&G.o.way==='led');}
{const bh=a2BaitHtml;a2BaitHtml=function(){let h=bh.apply(this,arguments);if(!G||!G.o||!G.o.otv)return h;
  return h.replace('🔔 '+L('Донка','Ledger'),'⚓ '+L('Отвес','Jig line')).replace(L('дальше, у дна','far, on the bottom'),L('с лодки, у дна','from the boat'))
   .replace(L('Донка всегда лежит на дне: лещ, сом, налим, сазан, карп. Блесну на донку не ставят.','The ledger lies on the bottom. No spoon on a ledger.'),L('Отвес — леска прямо под лодку, наживка у самого дна: треска, палтус, зубатка, морской окунь. Клюёт — кивает кончик удилища.','A jig line straight down from the boat: cod, halibut, wolffish. Watch the rod tip.'));};}
{const hu=a2HudTxt;a2HudTxt=function(){const t=hu.apply(this,arguments);return otvOn()?t.replace('🔔 '+L('донка','ledger'),'⚓ '+L('отвес','jig line')):t;};}
{const sh=a2ShopHtml;a2ShopHtml=function(){let h=sh.apply(this,arguments);try{const sea=PLACES.some((p,i)=>p.boat&&p.led&&S.open[i]);if(!sea&&!hasBoat())return h;const own=!!S.own.otv,where=PLACES.filter(p=>p.boat&&p.led).map(p=>LANG==='en'?nm(p):p.sh).join(', ');
  h+=`<div class="ti lktk lkdk"><span class="ic">⚓</span><div class="tx"><b>${L('Морской отвес','Sea jig line')}</b></div>${own?'<span class="have">✓</span>':`<button class="btn ${S.coins>=OTV_P?'green':''} buy" data-a2otv="1">${coinsTxt(OTV_P)}</button>`}<small class="ds">${L('Для моря, с лодки: леска уходит отвесно под лодку, грузило у самого дна. Треска, палтус, зубатка, морской окунь — крупнее и чаще. Клюёт — кивает кончик. Где: ','For the sea, from a boat: the line goes straight down. Bigger cod, halibut and wolffish. Where: ')}${where}. ${L('Выбирается в окне наживки.','Choose it in the bait window.')}</small></div>`;}catch(e){}return h;};}
{const sb=a2ShopBind;a2ShopBind=function(list){sb.apply(this,arguments);list.querySelectorAll('[data-a2otv]').forEach(b=>b.onclick=()=>{if(S.own.otv)return;if(S.coins<OTV_P){notEnough(OTV_P);return;}S.coins-=OTV_P;S.own.otv=1;S.way='led';try{STAT.ev('spend',{k:'otves',c:OTV_P});}catch(e){}save();openShop('t');
  newItem(L('ОТВЕС!','JIG LINE!'),L('Морской отвес','Sea jig line'),'⚓',L('На море в окне наживки выбери «Отвес»: леска уйдёт прямо под лодку, к самому дну. Кивнул кончик — подсекай!','Pick «Jig line» in the bait window at sea. When the tip nods — strike!'),LANG==='en'?null:['Помор дядя Фёдор','Треску на отвес ловят, не на поплавок. Дед мой так ловил, и я так ловлю.']);});};}
// рисунок: вместо кольца донки — леска уходит отвесно в глубину, внизу блестит пилькер; на кончике удилища вместо колокольчика — кивок
{const le=a2LedEnd;a2LedEnd=function(g,f,t){if(!otvOn())return le.apply(this,arguments);const u=GEO.u,ps=GEO.ps(f.d),k=ps*2,ph=G.phase,bob=ph==='bite'?Math.sin(t*18)*u*.8*k:(f.dip||0)*Math.sin(t*14)*u*.5*k;
  g.save();for(let i=0;i<2;i++){const r=((t*.6+i*.5)%1);g.strokeStyle='rgba(255,255,255,'+(.5*(1-r)).toFixed(3)+')';g.lineWidth=1;g.beginPath();g.ellipse(f.x,f.y,u*(.6+r*1.6)*k,u*(.18+r*.45)*k,0,0,7);g.stroke();}
  const dep=Math.min(GEO.H-f.y-u*2,u*14*k),y2=f.y+dep+bob;const gr=g.createLinearGradient(0,f.y,0,y2);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,.08)');
  g.strokeStyle=gr;g.lineWidth=Math.max(.8,u*.12);g.beginPath();g.moveTo(f.x,f.y);g.lineTo(f.x,y2);g.stroke();
  g.globalAlpha=.55;g.fillStyle='#d8e0e6';g.beginPath();g.moveTo(f.x,y2);g.lineTo(f.x+u*.45*k,y2+u*1.1*k);g.lineTo(f.x,y2+u*2.2*k);g.lineTo(f.x-u*.45*k,y2+u*1.1*k);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(f.x-u*.12*k,y2+u*.8*k,u*.18*k,0,7);g.fill();g.restore();return {x:f.x,y:f.y};};}
{const bl=a2Bell;a2Bell=function(g,tip,t){if(!otvOn())return bl.apply(this,arguments);if(!G.fl)return;const ph=G.phase,u=GEO.u,nod=ph==='bite'?.55+Math.sin(t*30)*.25:(G.fl.dip||0)*Math.sin(t*28)*.35;
  g.save();g.translate(tip.x,tip.y);g.rotate(nod);g.lineWidth=Math.max(1.2,u*.3);for(let i=0;i<4;i++){g.strokeStyle=i%2?'#ffffff':'#e8402a';g.beginPath();g.moveTo(i*u*.55,0);g.lineTo((i+1)*u*.55,u*.12*(i+1));g.stroke();}g.restore();};}

// --- сохранение: S.chTs ---
{const fs=fixSave;fixSave=function(){fs.apply(this,arguments);if(!isObj(S.chTs))S.chTs={};for(const k in S.chTs)if(typeof S.chTs[k]!=='number')delete S.chTs[k];};
 const ms=mergeSave;mergeSave=function(d,ref){const a=isObj(S.chTs)?Object.assign({},S.chTs):{};ms.apply(this,arguments);
  const r=a;if(isObj(d)&&isObj(d.chTs))for(const k in d.chTs)if(typeof d.chTs[k]==='number')r[k]=Math.max(r[k]||0,d.chTs[k]);S.chTs=r;};}

// --- письма глав (сюжет Петровича): приходят раньше обычных, одно в день; when — когда письмо может прийти ---
FROM.pomor=['🧔','Помор дядя Фёдор','Uncle Fyodor the Pomor'];
const pi=id=>placeIdx(id),op=id=>!!S.open[pi(id)];
const LET_N=[
  {id:'n_oka',fr:'petr',when:()=>op('oka'),ru:'Был на Оке? Рязанские места: луга заливные, стога, церковь на круче. Подуст там стаями ходит, жерех бьёт малька. Порыбачь пару раз — не пожалеешь.',en:'Been to the Oka yet? Water meadows, haystacks and a church on the high bank. Fish there a couple of times.',rq:{ty:'pl',pi:pi('oka'),n:2},rw:{c:.6}},
  {id:'n1',fr:'petr',when:()=>op('kamchatka'),ru:'Сосед! Жена отпустила меня в отпуск «до первого снега». Родные места мы с тобой прошли, до самой Камчатки. Айда на Север! Первым делом — Чудское озеро под Псковом: ерши-носари, судак, а ночью, говорят, выходит Судак Ледовый. Путёвка — на карте, в «Главе II».',en:'Neighbour! My wife let me go «until the first snow». We have fished all the home waters — let\'s go North! First, Lake Peipus. The trip is on the map, in Chapter II.',rw:{c:1}},
  {id:'n2',fr:'sem',when:()=>op('chud'),ru:'Семёныч на связи. На Чудском у меня кум инспектором. Говорит, сиг чудской стал редким — попадётся, сфотографируй и отпусти. Награду получишь сполна, это по-честному. А пока порыбачь там пару раз, осмотрись.',en:'Semyonych here. The Peipsi whitefish is rare now — if you catch one, take a photo and let it go. You still get the full reward.',rq:{ty:'pl',pi:pi('chud'),n:2},rw:{c:.7}},
  {id:'n3',fr:'vnuk',when:()=>op('chud'),ru:'Деда! Мы в школе проходили Ледовое побоище! Это правда на твоём Чудском было? Поймай мне ерша-носаря — покажу классу, какой он носатый!',en:'Grandpa! We learned about the Battle on the Ice! Catch me a long-nosed ruffe — I\'ll show the class!',rq:{ty:'sp',f:'ersh_nos',n:1},rw:{c:.8}},
  {id:'n4',fr:'nyura',when:()=>op('chud'),ru:'Милок, псковский снеток сушёный — лучше семечек! Налови снетка штук пять, я насушу к чаю. А тебе — мотыля баночку.',en:'Dear, dried smelt from Pskov is better than sunflower seeds! Catch five and I\'ll dry them.',rq:{ty:'sp',f:'snetok',n:5},rw:{c:.7,b:['blood',10]}},
  {id:'n5',fr:'petr',when:()=>op('onego'),ru:'Добрались до Онего! Остров Кижи — церковь без единого гвоздя, двадцать два купола. Летом тут белые ночи, клюёт до утра. Порыбачь на зорьке — рыба здесь ранняя.',en:'We made it to Lake Onega! Kizhi island — a church with 22 domes and not a single nail. Fish at dawn.',rq:{ty:'tod',tod:'morning',n:2},rw:{c:.8}},
  {id:'n6',fr:'wife',when:()=>op('onego'),ru:'Петрович звонил — хвалит тебя. Привези сига-лудогу, заливное к празднику сделаю. Только смотри, чтоб крупный был!',en:'Petrovich called — he praises you. Bring me a Ludoga whitefish for aspic!',rq:{ty:'sp',f:'sig_lud',n:1},rw:{c:.9}},
  {id:'n7',fr:'mit',when:()=>op('onego'),ru:'Палия на Онего живёт глубоко, у самого дна. А у Кижей, говорят, есть Палия Кижская — брюхо как закат. Вечером, на живца, подальше от берега. Держи живцов на дорожку.',en:'Char live deep in Lake Onega. They say the Kizhi Char comes out in the evening — live bait, cast far. Here is some live bait.',rw:{c:.5,b:['live',10]}},
  {id:'n8',fr:'pomor',when:()=>op('varzuga'),ru:'Здравствуй, рыбак. Я Фёдор, помор с Варзуги. Сёмга у нас — царица реки, а тинда — её дочка, первый раз из моря пришла. Поймаешь пару тинд — значит, река тебя приняла.',en:'Hello, angler. I\'m Fyodor from the Varzuga. Catch a couple of grilse — then the river has accepted you.',rq:{ty:'sp',f:'tinda',n:2},rw:{c:.9}},
  {id:'n9',fr:'petr',when:()=>op('varzuga'),ru:'Поставил палатку у самого порога. Ночью небо зелёным горело — северное сияние! Поймай кумжу, сварим уху по-поморски, с хлебом ржаным.',en:'I pitched the tent by the rapids. The sky glowed green at night! Catch a sea trout and we\'ll make Pomor fish soup.',rq:{ty:'sp',f:'kumzha',n:1},rw:{c:1}},
  {id:'n_sea0',fr:'pomor',when:()=>op('varzuga')&&(S.visit[pi('varzuga')]||0)>=3,ru:'Река наша кончается в Белом море. А в море без лодки не ходят — с берега до трески не докинешь. Лодку Петрович на берегу продаёт, крепкую. Купишь — сходим на Соловки.',en:'Our river flows into the White Sea. You need a boat for the sea — Petrovich sells one on the shore.',rw:{c:.5}},
  {id:'n_sea1',fr:'petr',when:()=>op('beloe'),ru:'Соловки! Кремль из валунов, каждый с избу, чайки орут, на горизонте паруса. Наваги наловим — поморы её с луком жарят, пальчики оближешь.',en:'Solovki! A kremlin of giant boulders and gulls everywhere. Let\'s catch some navaga.',rq:{ty:'sp',f:'navaga',n:3},rw:{c:.8}},
  {id:'n_sea2',fr:'pomor',when:()=>op('barents'),ru:'Териберка — край земли. Киты у самого берега фонтанят, старые шхуны на камнях ржавеют. Треску лови — пару штук, на уху. А Палтуса Адмирала увидишь — держи крепче, он с лодку.',en:'Teriberka, the edge of the world. Whales spout by the shore. Catch a couple of cod for the soup.',rq:{ty:'sp',f:'treska',n:2},rw:{c:.9}},
  {id:'n10',fr:'pomor',when:()=>chLegsDone(2),ru:'Слыхал, ты всех северных легенд изловил — и речных, и морских. Тогда слушай. Раз в сутки, на зорьке, к порогу Варзуги выходит Сёмга — Царица Севера. Блесна, заброс подальше. Не упусти: в другой раз — только завтра.',en:'You have caught every legend of the North. Once a day, at dawn, the Queen of the North comes to the rapids. Spoon lure, cast far.',rw:{c:1}},
  {id:'n11',fr:'petr',when:()=>!!(S.legs&&S.legs.tsar_semga),ru:'Царица Севера! Вся Варзуга гудит, Фёдор шапку снял. Север наш, сосед. А весной — на Юг: Петрович уже карту чертит. Жди писем!',en:'The Queen of the North! The whole Varzuga is talking. The North is ours. In spring — to the South!',rw:{c:3}}
];
LET_N.forEach(x=>{LETTERS[x.id]=x;});window.LET_N=LET_N;
// после дорожки новичка (LET_PATH), чтобы не перебивать первые письма
{const mn=a3MailNext;a3MailNext=function(){const M=S.mail;try{if(LET_PATH.every(x=>M.dl[x.id]))for(const x of LET_N)if(!M.dl[x.id]&&x.when())return x;}catch(e){}return mn.apply(this,arguments);};}

})();
