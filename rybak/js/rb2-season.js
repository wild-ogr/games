'use strict';
/* ================= rb2-season — сезоны, зимняя «Лунка», зимние праздники, «Сезонная книжка» (поток SEASON буста «буст_в2.0», 13.10.2026;
   журнал hobby-analytics/release-i/rybak-boost2/logs/SEASON.md). Грузится на старте под меткой <!-- rb2:SEASON --> (после основного скрипта).
   Тут — только то, что нужно сразу: календарь, поле S.r2s, очки, полоска на главном, рыбы-сезонники, поплавки и вещи сезона.
   Окно сезона — лениво js/rb2-season-ui.js + css/rb2-season.css; лёд на рыбалке — лениво js/rb2-season-ice.js.
   ФЛАГИ: sez (сезоны, полоска, окно, очки, План месяца внутри), sezFish (рыбы-сезонники), lunka (лёд с 1.12), sezFest (зимние праздники),
          sezPay («Сезонная книжка» — ВЫКЛЮЧЕНА: только ?on=sezPay или window.R2_SEZPAY=true, и только при PAY.on), water (водоём месяца).
   ДАТЫ: по Москве, как FEST (nowMs()+3 ч); на маке ?a3d=N сдвигает «сегодня» для всего (A3), ?sezday=ГГГГ-ММ-ДД — только сезонам.
   API для других потоков: window.RSEZ — add(k,n) очки сезона (EVENT «Записки»: RSEZ.add('zap',1..5)), cur() текущий сезон {id,n,ic,from,to},
          mul(k) множитель праздника (Морозы: RSEZ.mul('zap')=2 для наград записок), ice(pi) — на месте лёд?, open() — окно сезона.
   Синтаксис — как у каркаса (старые WebView: без новых операторов и методов, см. rb2-core.js). */
(function(){
if(!window.R2||typeof S==='undefined')return;
var D=document;
function T(r,e){return typeof LANG!=='undefined'&&LANG==='en'?e:r;}
function E(t){return esc(t==null?'':String(t));}
R2.reg('sez',{s:'SEASON',t:'сезоны «Осенний жор → Перволёдка → Глухозимье»: полоска на главном, 30 ступеней, План месяца внутри'});
R2.reg('sezFish',{s:'SEASON',t:'рыбы-сезонники на старых водоёмах'});
R2.reg('lunka',{s:'SEASON',t:'зимняя рыбалка «Лунка» со льда с 1.12'});
R2.reg('sezFest',{s:'SEASON',t:'зимние праздники: адвент, Каникулы, Старый Новый год, Трескучие морозы, Синичкин день, рыбка-ёлочка'});
R2.reg('sezPay',{s:'SEASON',t:'платная «Сезонная книжка» (выключено, включается вместе с оплатой)'});
R2.reg('water',{s:'SEASON',t:'новый водоём раз в месяц'});
var off=function(id){return R2.off(id);};
function payOn(){try{return !off('sezPay')&&(/[?&]on=[^&#]*sezPay/.test(location.search)||window.R2_SEZPAY===true)&&!!(PAY&&PAY.on);}catch(e){return false;}}

/* ---------- календарь ---------- */
var SDAY=null;try{var mq=/[?&]sezday=(\d{4}-\d\d-\d\d)/.exec(location.search);if(mq&&typeof IS_LOCAL!=='undefined'&&IS_LOCAL)SDAY=mq[1];}catch(e){}
var DKM=-1,DKV='';function dk(){if(SDAY)return SDAY;var t=(typeof nowMs==='function'?nowMs():Date.now())+108e5,m=Math.floor(t/6e4);if(m===DKM)return DKV;DKM=m;return DKV=new Date(t).toISOString().slice(0,10);} // rb2-MERGE: кэш на минуту (dk/cur зовутся на каждую рыбу в pickFish — «слабый Android»)
function dnum(s){var p=s.split('-');return Math.floor(Date.UTC(+p[0],+p[1]-1,+p[2])/864e5);}
function z2(n){return (n<10?'0':'')+n;}
function dTxt(s){var p=s.split('-'),m=+p[1]-1;return (+p[2])+' '+(typeof MON_G!=='undefined'?MON_G[m]:p[1]);}
// сезоны года Y (осень Y → зима Y/Y+1): даты 2026 — из 03-events §3; дальше — те же числа каждый год
var SZ={aut:{n:'Осенний жор',en:'Autumn feast',ic:'🍂',c:'#e8590c'},ice:{n:'Перволёдка',en:'First ice',ic:'⛸',c:'#3b9edb'},zim:{n:'Глухозимье',en:'Deep winter',ic:'❄️',c:'#6a7fdb'}};
function seasonsOf(Y){var y1=Y+1,feb=(y1%4===0&&(y1%100!==0||y1%400===0))?29:28;
  return [{k:'aut',id:'aut'+(Y%100),from:Y+'-10-19',to:Y+'-11-29'},{k:'ice',id:'ice'+(Y%100),from:Y+'-11-30',to:y1+'-01-10'},{k:'zim',id:'zim'+(y1%100),from:y1+'-01-11',to:y1+'-02-'+feb}];}
function sezAt(day){var y=+day.slice(0,4),L2=seasonsOf(y-1).concat(seasonsOf(y));for(var i=0;i<L2.length;i++){var s=L2[i];if(day>=s.from&&day<=s.to)return mk(s);}return null;}
function mk(s){var z=SZ[s.k];return {k:s.k,id:s.id,from:s.from,to:s.to,n:T(z.n,z.en),ic:z.ic,c:z.c};}
var CRK='',CRV=null;function cur(){var d=dk();if(d===CRK)return CRV;CRK=d;return CRV=sezAt(d);}
function next(){var d=dk(),y=+d.slice(0,4),L2=seasonsOf(y-1).concat(seasonsOf(y),seasonsOf(y+1));for(var i=0;i<L2.length;i++)if(L2[i].from>d)return mk(L2[i]);return null;}
function left(s){return s?dnum(s.to)-dnum(dk())+1:0;}

/* ---------- поле S.r2s ---------- */
// s — id сезона, p — очки, c — взято бесплатных ступеней, b — взято платных, d/dp — день и очки за день, gd/gn — учтённые задания дня,
// mk/mn — учтённые цели плана месяца, mg — мини-игр с очками за день, it — вещи сезонов {id:1}, xf — надетый поплавок сезона, bd — значки {id сезона:1|2},
// h — праздники {ad: день адвента, sn: Старый Новый год, sin: синицы, mo: морозы-подсказка}, i — лёд {t: подсказка показана, n: лунок пробурено}
var STEPS=30,PER=10,DAYCAP=15;
function def(){return {s:'',p:0,c:0,b:0,d:'',dp:0,gd:'',gn:0,mk:0,mn:0,mg:0,it:{},xf:'',bd:{},h:{},i:{}};}
function isO(v){return !!v&&typeof v==='object'&&!Array.isArray(v);}
R2.field('s',{id:'sez',def:def,
  fix:function(o){var d0=def();for(var k in d0){if(typeof d0[k]==='number'){if(typeof o[k]!=='number'||!isFinite(o[k]))o[k]=0;}else if(typeof d0[k]==='string'){if(typeof o[k]!=='string')o[k]='';}else if(!isO(o[k]))o[k]={};}
    o.c=Math.min(o.c,STEPS);o.b=Math.min(o.b,STEPS);},
  merge:function(a,b){var k;
    if(String(b.s||'')>String(a.s||'')){['s','p','c','b','d','dp','gd','gn','mk','mn','mg'].forEach(function(x){if(b[x]!==undefined)a[x]=b[x];});}
    else if(b.s===a.s){['p','c','b','dp','gn','mk','mn','mg'].forEach(function(x){if(typeof b[x]==='number'&&b[x]>(+a[x]||0))a[x]=b[x];});['d','gd'].forEach(function(x){if(String(b[x]||'')>String(a[x]||''))a[x]=b[x];});}
    ['it','bd','h','i'].forEach(function(x){if(!isO(a[x]))a[x]={};if(isO(b[x]))for(k in b[x]){var v=b[x][k],w=a[x][k];if(typeof v==='number'){if(!(typeof w==='number')||v>w)a[x][k]=v;}else if(typeof v==='string'){if(!(typeof w==='string')||v>w)a[x][k]=v;}}});
    if(!a.xf&&b.xf)a.xf=b.xf;}});
var TMP=null;function st(){var o=S.r2s;if(!isO(o)){if(off('sez'))return TMP||(TMP=def());o=S.r2s=def();}return o;}

/* ---------- награды ступеней ---------- */
// вещи сезонов: k — f поплавок / s вещь на берег; src 'sez'; sz — сезон (k), st — ступень, pay — платная дорожка; p — цена в лавке, когда сезон прошёл (бесплатные)
var IT={
  zacorn:{k:'f',sz:'aut',st:5,p:3000,n:'Жёлудь',en:'Acorn',d:'Поплавок сезона «Осенний жор»',de:'«Autumn feast» season float'},
  zpump:{k:'s',sz:'aut',st:10,p:5000,ic:'🎃',n:'Тыква с огорода',en:'Garden pumpkin',d:'Вещь на берег: урожай Петровича',de:'Shore item: Petrovich\'s harvest'},
  zcone:{k:'f',sz:'aut',st:20,p:3000,n:'Шишка',en:'Pine cone',d:'Поплавок сезона «Осенний жор»',de:'«Autumn feast» season float'},
  zgleaf:{k:'f',sz:'aut',st:3,pay:1,n:'Золотой лист',en:'Golden leaf',d:'«Сезонная книжка» осени',de:'Autumn season book'},
  zhay:{k:'s',sz:'aut',st:15,pay:1,ic:'🌾',n:'Стожок сена',en:'Haystack',d:'«Сезонная книжка» осени',de:'Autumn season book'},
  zsnow:{k:'f',sz:'ice',st:5,p:3000,n:'Снежинка',en:'Snowflake',d:'Поплавок сезона «Перволёдка»',de:'«First ice» season float'},
  zsman:{k:'s',sz:'ice',st:10,p:5000,ic:'⛄',n:'Снеговик-рыбак',en:'Snowman angler',d:'Вещь на берег: с удочкой и в ушанке',de:'Shore item: with a rod and a fur hat'},
  zball:{k:'f',sz:'ice',st:20,p:3000,n:'Ёлочный шар',en:'Bauble',d:'Поплавок сезона «Перволёдка»',de:'«First ice» season float'},
  zicic:{k:'f',sz:'ice',st:3,pay:1,n:'Хрустальная сосулька',en:'Crystal icicle',d:'«Сезонная книжка» Перволёдки',de:'First ice season book'},
  zshat:{k:'s',sz:'ice',st:15,pay:1,ic:'⛺',n:'Зимний шатёр',en:'Ice tent',d:'«Сезонная книжка» Перволёдки',de:'First ice season book'},
  zbull:{k:'f',sz:'zim',st:5,p:3000,n:'Снегирь',en:'Bullfinch',d:'Поплавок сезона «Глухозимье»',de:'«Deep winter» season float'},
  zsled:{k:'s',sz:'zim',st:10,p:5000,ic:'🛷',n:'Санки с ящиком',en:'Sled with a box',d:'Вещь на берег: возить снасти по льду',de:'Shore item: to carry gear on the ice'},
  zmit:{k:'f',sz:'zim',st:20,p:3000,n:'Варежка',en:'Mitten',d:'Поплавок сезона «Глухозимье»',de:'«Deep winter» season float'},
  zfrost:{k:'f',sz:'zim',st:3,pay:1,n:'Морозный узор',en:'Frost pattern',d:'«Сезонная книжка» Глухозимья',de:'Deep winter season book'},
  zfeed:{k:'s',sz:'zim',st:15,pay:1,ic:'🐦',n:'Кормушка с синицами',en:'Bird feeder',d:'«Сезонная книжка» Глухозимья',de:'Deep winter season book'}
};
var COIN_ST=[2,3,6,7,9,11,13,14,17,18,21,22,24,26,27,29],BIG_ST=[15,25,30],BAIT_ST=[1,4,8,12,16,19,23,28];
function RE(){return window.RECO||null;}
function lvlC(){var e=RE();if(e&&e.season)return e.c(e.season.lvl[0],e.season.lvl[1]);var t=30;try{t=TRIP_C[topPlace()];}catch(x){}return Math.max(30,Math.round(.25*t/5)*5);}
function bigC(){var e=RE();if(e)return e.c(1,100);var t=30;try{t=TRIP_C[topPlace()];}catch(x){}return Math.max(100,Math.round(t/5)*5);}
function bestBait(){try{return a3BestBait(topPlace());}catch(e){return 'maggot';}}
// награда ступени n (1…30) сезона k: {t:'c'|'b'|'it'|'bd', n, id}
function freeRw(k,n){for(var id in IT){var x=IT[id];if(x.sz===k&&!x.pay&&x.st===n)return {t:'it',id:id};}
  if(n===STEPS)return {t:'bd',c:1};if(COIN_ST.indexOf(n)>=0)return {t:'c'};if(BIG_ST.indexOf(n)>=0)return {t:'c',big:1};if(BAIT_ST.indexOf(n)>=0)return {t:'b'};return {t:'c'};}
function payRw(k,n){for(var id in IT){var x=IT[id];if(x.sz===k&&x.pay&&x.st===n)return {t:'it',id:id};}if(n===STEPS)return {t:'bd',g:1};return null;}
function rwTxt(r){if(!r)return '';if(r.t==='c')return '+'+coinsTxt(r.big?bigC():lvlC());if(r.t==='b'){var b=BAIT[bestBait()];return (b?b.ic:'🐛')+' +10';}
  if(r.t==='it')return (IT[r.id].k==='f'?'🎣 ':'')+nm(IT[r.id]);if(r.t==='bd')return r.g?T('Золотой значок','Gold badge'):T('Значок сезона','Season badge')+(r.c?' +'+coinsTxt(bigC()):'');return '';}
// выдать награду; false — не влезло в потолок дня (ступень остаётся «забрать»)
function give(r,s,quiet){var o=st();if(!r)return true;
  if(r.t==='c'){var n=r.big?bigC():lvlC(),e=RE(),got=0;if(e&&e.give){got=e.give('season',n,T('Сезон','Season'));if(got<=0)return false;}else{S.coins+=ern('season',n);got=n;}if(!quiet)try{SND.coin();}catch(x){}return true;}
  if(r.t==='b'){var b=bestBait();S.bait[b]=(S.bait[b]||0)+10;return true;}
  if(r.t==='it'){o.it[r.id]=1;if(IT[r.id].k==='f'&&!o.xf){o.xf=r.id;S.xf=r.id;}return true;}
  if(r.t==='bd'){o.bd[s.id]=Math.max(o.bd[s.id]||0,r.g?2:1);if(r.c){var e2=RE();if(e2&&e2.give){if(e2.give('season',bigC(),T('Сезон','Season'))<=0){/*монеты значка — не держим ступень: значок важнее*/}}else S.coins+=ern('season',bigC());}return true;}
  return true;}
function lv(){var o=st();return Math.min(STEPS,Math.floor(o.p/PER));}
function canTake(){var o=st(),s=cur();if(!s||o.s!==s.id)return 0;var n=lv()-o.c;if(payOwn(s))n+=lv()-o.b;return Math.max(0,n);}
// забрать всё доступное; вернёт {n, cap:true — монеты упёрлись в потолок дня}
function take(){var o=st(),s=cur(),n=0,cap=false;if(!s||o.s!==s.id)return {n:0};
  while(o.c<lv()){var r=freeRw(s.k,o.c+1);if(!give(r,s,true)){cap=true;break;}o.c++;n++;statEv('take',{l:o.c});}
  if(payOwn(s))while(o.b<lv()){give(payRw(s.k,o.b+1),s,true);o.b++;n++;}
  if(n){save();try{updCoins();SND.coin();}catch(e){}}return {n:n,cap:cap};}
function payId(s){return 'sez_'+s.id;}
function payOwn(s){try{return !!s&&payOn()&&PAY.own(payId(s));}catch(e){return false;}}

/* ---------- очки ---------- */
function statEv(a,o){try{var x={a:a,s:(cur()||{}).id||''};for(var k in o)x[k]=o[k];STAT.ev('sez',x);}catch(e){}}
function roll(){var o=st(),s=cur();if(!s)return null;
  if(o.s!==s.id){var was=o.s;if(was)closeOld(was);o.s=s.id;o.p=0;o.c=0;o.b=0;o.dp=0;o.d='';
    // начало сезона: сделанное раньше (задания сегодня, цели месяца) очков не даёт
    try{o.gd=dk();o.gn=a3DoneN();}catch(e){}try{if(S.mp&&S.mp.k){o.mk=S.mp.k;o.mn=Object.keys(S.mp.g||{}).length;}}catch(e){}}
  var d=dk();if(o.d!==d){o.d=d;o.dp=0;o.mg=0;}return s;}
// прошлый сезон закрыт: невзятое — забираем за игрока (вещи и наживка; монеты — без потолка, их немного)
function closeOld(id){var o=st(),k=id.slice(0,3),n=0,lvl=Math.min(STEPS,Math.floor(o.p/PER)),s={id:id,k:k};
  while(o.c<lvl){var r=freeRw(k,o.c+1);if(r.t==='c'){S.coins+=ern('season',r.big?bigC():lvlC());}else give(r,s,true);o.c++;n++;}
  if(n)setTimeout(function(){try{toast(SZ[k].ic+' '+T('Сезон «'+SZ[k].n+'» закрыт — Петрович отдал невзятые награды ('+n+')','The season is over — unclaimed rewards were added ('+n+')'),4200,true);}catch(e){}},2500);}
function hol(){var m=1;try{if(!off('sezFest')&&FEST.on('kan27'))m=1.5;}catch(e){}return m;}
// k: run tourn task month mg zap fest; n — очков (до множителя праздника). Вернёт добавленное
function add(k,n){if(off('sez'))return 0;var s=roll();if(!s)return 0;var o=st(),cap=Math.round(DAYCAP*hol());n=Math.round((+n||0)*hol());
  n=Math.max(0,Math.min(n,cap-o.dp));if(!n)return 0;var was=lv();o.p+=n;o.dp+=n;save();statEv('pt',{k:String(k).slice(0,8),n:n,p:o.p});
  if(lv()>was){statEv('lv',{l:lv()});if(lv()<=STEPS)setTimeout(function(){try{if(!G||G.over)toast(s.ic+' '+T('Сезон «'+s.n+'»: ступень '+lv()+'! Награда ждёт','Season «'+s.n+'»: step '+lv()+'! A reward is waiting'),3200,true);}catch(e){}},1200);
    try{if(typeof mapRefresh==='function')mapRefresh();}catch(e){}}
  return n;}
// задания дня и цели Плана месяца — опросом (свои функции A3 не трогаем)
function poll(){if(off('sez')||!roll())return;var o=st(),d=dk();
  try{var n=a3DoneN();if(o.gd!==d){o.gd=d;o.gn=0;}if(n>o.gn){var k=n-o.gn;o.gn=n;add('task',2*k);}}catch(e){}
  try{var m=S.mp;if(m&&m.k){var c=Object.keys(m.g||{}).length;if(o.mk!==m.k){o.mk=m.k;o.mn=0;}if(c>o.mn){var j=c-o.mn;o.mn=c;add('month',3*j);}}}catch(e){}}
R2.on('end',function(g){if(!g||g.guest)return;poll();add(g.tourn?'tourn':'run',g.tourn?3:1);},'sez');
R2.on('mg',function(x){var o=st();if(!roll())return;if(o.mg>=3)return;o.mg++;add('mg',1);},'sez');
R2.on('home',function(){poll();},'sez');

/* ---------- полоска на главном (гнездо HOME 'home' id sez) ---------- */
var css=D.createElement('style');css.textContent=
 '.sz-strip{display:flex;align-items:center;gap:8px;width:100%;height:40px;padding:0 12px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(16,32,46,.62);color:#fff;font:inherit;font-size:17px;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;box-sizing:border-box;margin:0}'+
 '.sz-strip .sz-ic{font-size:20px;line-height:1;flex:none}.sz-strip b{flex:none;white-space:nowrap;max-width:44%;overflow:hidden;text-overflow:ellipsis}'+
 '.sz-bar{flex:1;min-width:30px;height:8px;border-radius:4px;background:rgba(255,255,255,.16);overflow:hidden}.sz-bar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,#ffcf7a,var(--szc,#ff8f4f))}'+
 '.sz-strip em{flex:none;font-style:normal;opacity:.85;white-space:nowrap}.sz-strip .sz-go{flex:none;font-weight:700;padding:3px 9px;border-radius:10px;background:linear-gradient(140deg,#ffcf7a,#ff8f4f);color:#3b1c00;white-space:nowrap}.sz-strip .sz-ar{flex:none;opacity:.6;font-size:20px}';
D.head.appendChild(css);
function stripHtml(){var s=cur(),o=st(),l=lv(),k=canTake(),pr=Math.min(1,(o.p%PER)/PER),full=l>=STEPS;
  return '<button class="sz-strip noenter" style="--szc:'+s.c+'"><span class="sz-ic">'+s.ic+'</span><b>'+E(s.n)+'</b><span class="sz-bar"><i style="width:'+Math.round((full?1:(l+pr)/STEPS)*100)+'%"></i></span>'+
    '<em>'+(full?'✓ ':'')+l+'/'+STEPS+'</em>'+(k?'<span class="sz-go">🎁 '+k+'</span>':'<span class="sz-ar">›</span>')+'</button>';}
R2.slot('home','sez',{pri:110,when:function(){return (S.sessions||0)>=1&&(S.caught||0)>=1&&(!window.R2H||R2H.open('season'))&&!!roll();},html:function(){return stripHtml();},
  bind:function(el){var b=el.querySelector('button');if(b)b.onclick=function(){try{SND.tap();}catch(e){}open('home');};}});

/* ---------- окно сезона — лениво ---------- */
var uiP=null;
function ui(){if(!uiP){R2.css('css/rb2-season.css');uiP=R2.need('js/rb2-season-ui.js');}return uiP;}
// магазин «Берег»: вещи сезонов — строки дорисовывает окно (лениво)
{var osh=openShop;openShop=function(tab){var r=osh.apply(this,arguments);try{if(typeof shopTab!=='undefined'&&shopTab==='d'&&!off('sez')){var o=st(),any=false;for(var id in IT)if(o.it[id]||a3Late(id))any=true;
  if(any)ui().then(function(){if(window.RSEZW&&shopTab==='d')RSEZW.shop();});}}catch(e){}return r;};}
function open(from){if(off('sez')||!roll())return;poll();R2.mark('w:sez');statEv('open',{k:from||''});ui().then(function(){if(window.RSEZW)RSEZW.open(from);},function(){try{toast(T('Нет связи — попробуй ещё раз','No connection — try again'),2400);}catch(e){}});}

/* ---------- рыбы-сезонники (механизм праздничной рыбы NORTH: evPick, fest-ключ 'sez:<сезон>') ---------- */
var SFISH=[
 {id:'bersh',n:'Берш',en:'Volga zander',sz:'aut',pl:['volga','oka'],rar:'uncommon',evp:.07,w:[.2,1.4],r:2,pb:4,pk:10,s:1,st:'dart',b:{live:2,spoon:1.2,worm:.6},t:{evening:1.4,night:1.2,day:.6},hab:'1465 135 665466667887 2043 14245 2152 drag',
   lk:['perch2','#55604a','#b0b090','#ecead8','#7a7a60','bars'],f:'Младший брат судака, только без клыков. Осенью жирует на перекатах — успевай живца менять.'},
 {id:'beloglaz',n:'Белоглазка',en:'Zope',sz:'aut',pl:['volga','oka'],rar:'common',evp:.08,w:[.1,.6],r:4,pb:2,pk:12,s:.75,st:'calm',b:{worm:1,blood:1.4,maggot:1.2},hab:'1524 015 445667777644 2134 24353 3423 lay',
   lk:['deep2','#40505a','#c0c8cc','#eef0f2','#8a9aa0','scale'],f:'Родня леща, а глаза белые, будто удивляется. Осенью ходит стаей — где одна, там и ведро.'},
 {id:'gorbach',n:'Окунь-горбач',en:'Humpback perch',sz:'ice',pl:['prud','seliger','ladoga','chud','onego','baikal','ilmen'],rar:'rare',evp:.07,w:[.8,2.2],r:1,pb:4,pk:12,s:1.15,st:'dart',b:{spoon:2,live:1.6,blood:1,worm:1},t:{day:1.3,night:.3},hab:'4245 253 776556677767 3431 34433 3352 dip',
   lk:['perch','#2e4a22','#7f9648','#e6dcae','#e0582a','stripes'],f:'Старый окунь с горбом, как у Петровича после огорода. На первом льду — самый жадный.'},
 {id:'elets',n:'Елец',en:'Dace',sz:'ice',pl:['rechka','oka'],rar:'common',evp:.09,w:[.05,.35],r:4,pb:1,pk:25,s:.6,st:'dart',b:{blood:1.6,maggot:1.4,worm:1},hab:'2224 351 776555556677 4331 34433 3433 shake',
   lk:['slim','#3e5260','#c8d4dc','#f0f4f6','#c8a87a','scale'],f:'Шустрый и серебристый. Зимой на течении клюёт, когда все спят.'},
 {id:'pyzhyan',n:'Сиг-пыжьян',en:'Siberian whitefish',sz:'zim',pl:['baikal','ladoga','onego'],rar:'uncommon',evp:.07,w:[.4,2.5],r:2,pb:4,pk:12,s:.95,st:'dart',b:{blood:1.6,maggot:1.2,worm:.7},hab:'1524 135 887654456788 4232 24334 3433 lift',
   lk:['salmon','#34505c','#cad6dc','#f2f6f8','#8aa4b0','none'],f:'Сиг из сибирских рек. В глухозимье подходит к лункам стайкой — успевай мормышку опускать.'},
 {id:'zheltokr',n:'Бычок-желтокрылка',en:'Yellowfin sculpin',sz:'zim',pl:['baikal'],rar:'common',evp:.09,w:[.03,.2],r:4,pb:2,pk:30,s:.6,st:'calm',b:{worm:1.5,blood:1.6},hab:'1532 115 776554445677 3334 23343 3342 dance',
   lk:['bull','#4a4430','#a89a5a','#e8d890','#e8c020','mottle'],f:'Байкальский бычок с жёлтыми плавниками-крылышками. Омуль его обожает, а ты — на уху.'},
 {id:'yolochka',n:'Золотая рыбка-ёлочка',en:'Golden fir-tree fish',fest:'ny27',pl:['prud','rechka'],rar:'trophy',evp:.05,w:[.1,.4],r:.5,pb:40,pk:60,s:.6,st:'calm',b:{worm:1,dough:1.2,blood:1},hab:'4224 253 556765556765 4332 34343 4332 dip',
   lk:['std','#2f7a3a','#e8b830','#fff2b0','#d8322a','dots'],f:'Перед Новым годом в пруду плавает рыбка в зелёной чешуе с золотыми огоньками. Поймал — загадывай желание.'}
];
function fishOn(k){if(off('sezFish'))return false;var s=cur();return !!s&&s.k===k;}
(function(){if(typeof FISH==='undefined'||typeof PLACES==='undefined')return;var pid={};PLACES.forEach(function(p,i){pid[p.id]=i;});
  SFISH.forEach(function(r){if(FISH[r.id]||LEG[r.id])return;var f={};for(var k in r)if(k!=='sz')f[k]=r[k];f.id=r.id;if(r.sz)f.fest='sez:'+r.sz;f.sez=r.sz||'';
    if(r.fest&&off('sezFest')){f.fest='off:'+r.fest;}
    try{var p=f.hab.split(' '),dg=function(s,i){return A2SC[+s[i]];},o4=function(s,ks){var o={};ks.forEach(function(kk,i){o[kk]=dg(s,i);});return o;};
      f.a2={z:o4(p[0],ZK),d:o4(p[1],DEPTHS),m:p[2].split('').map(function(c){return A2MS[+c];}),t:o4(p[3],['morning','day','evening','night']),w:o4(p[4],['sun','cloud','rain','wind','fog']),p:o4(p[5],['rise','high','fall','low'])};f.bite=p[6];}catch(e){}
    FISH[r.id]=f;(r.pl||[]).forEach(function(id){var P=PLACES[pid[id]];if(P&&P.evf.indexOf(r.id)<0)P.evf.push(r.id);});});
  // праздничная рыба NORTH спрашивает evOn(ключ) — сезонные ключи 'sez:<k>' отвечаем сами
  if(typeof evOn==='function'){var e0=evOn;evOn=function(k){if(typeof k==='string'){if(k.indexOf('sez:')===0)return fishOn(k.slice(4));if(k.indexOf('off:')===0)return false;}return e0(k);};}})();
function sezFish(k){return SFISH.filter(function(r){return r.sz===k;}).map(function(r){return r.id;});}

/* ---------- поплавки и вещи сезонов (реестр A3 XIT; владение — S.r2s.it, надетый — S.r2s.xf) ---------- */
(function(){if(typeof XIT==='undefined')return;
  for(var id in IT){var x=IT[id];XIT[id]={k:x.k,src:'sez',p:x.pay?0:x.p,ic:x.ic,n:x.n,en:x.en,d:x.d,de:x.de};}
  Object.assign(FLT,{zacorn:['#c08a3e','#8a5a22','#5a3a14'],zcone:['#a0703a','#7a4e22','#3a6a2a'],zgleaf:['#f7d774','#e8b030','#fff3b0'],zsnow:['#f4f8ff','#cfe4ff','#3b9edb'],zball:['#f4f1ea','#d8322a','#f7c948'],zicic:['#eef8ff','#bfe2f6','#ffffff'],
    zbull:['#f4f1ea','#e8553a','#2a2a2a'],zmit:['#f4f1ea','#d8322a','#ffffff'],zfrost:['#eaf4ff','#9cc8ec','#ffffff']});
  var a0=a3Own;a3Own=function(id){var x=XIT[id];if(x&&x.src==='sez')return !!st().it[id];return a0(id);};
  var l0=a3Late;a3Late=function(id){var x=IT[id];if(x&&XIT[id]&&XIT[id].src==='sez'){if(x.pay||!x.p||st().it[id])return false;var s=cur();return !(s&&s.k===x.sz)&&wasSeason(x.sz);}return l0(id);};
  var f0=fltSel;fltSel=function(){var o=st();if(o.xf&&IT[o.xf]&&o.it[o.xf]&&(S.xf===o.xf||!S.xf))return o.xf;return f0();};
  var fb=floatBody;floatBody=function(g,w,h,id,night){fb(g,w,h,id,night);if(!IT[id]||IT[id].k!=='f')return;fltArt(g,w,h,id);};
  var sd=drawShoreDec;drawShoreDec=function(g,t){sd(g,t);try{shoreArt(g,t);}catch(e){}};
  // a3Prev рисует вещь берега через A3_DRAW[id]
  for(var j in IT)if(IT[j].k==='s')(function(id){A3_DRAW[id]=function(g,x,y,u,tn,t){decArt(id,g,x,y,u*.95,tn||function(c){return c;},t||0);};})(j);
  // S.xf, надетый на поплавок сезона, A3 при загрузке стирает (XIT ещё не знал вещь) — возвращаем
  var o=st();if(o.xf&&o.it[o.xf]&&!S.xf)S.xf=o.xf;})();
function wasSeason(k){var d=dk(),y=+d.slice(0,4),L2=seasonsOf(y-1).concat(seasonsOf(y));for(var i=0;i<L2.length;i++)if(L2[i].k===k&&L2[i].from<=d)return true;return false;}
// рисунок на «шапке» поплавка: (0,0) — ватерлиния, вверх — минус; bw — полуширина, bh — высота шапки
function fltArt(g,w,h,id){var bw=w,bh=h*.32;g.save();
  if(id==='zacorn'){g.fillStyle='#6b4a1e';g.beginPath();g.ellipse(0,-bh*.78,bw*.92,bh*.3,0,0,7);g.fill();g.strokeStyle='#4a3010';g.lineWidth=Math.max(1,bw*.06);for(var i=-2;i<=2;i++){g.beginPath();g.moveTo(i*bw*.3-bw*.12,-bh*.92);g.lineTo(i*bw*.3+bw*.12,-bh*.64);g.stroke();}}
  else if(id==='zcone'){g.fillStyle='#5a3a16';for(var r=0;r<3;r++)for(var c=-1;c<=1;c++){g.beginPath();g.ellipse(c*bw*.42+(r%2)*bw*.2,-bh*(.25+r*.24),bw*.2,bh*.11,0,0,Math.PI);g.fill();}}
  else if(id==='zgleaf'){g.fillStyle='#e8a010';g.beginPath();g.moveTo(-bw*.7,-bh*.3);g.quadraticCurveTo(0,-bh*1.1,bw*.7,-bh*.3);g.quadraticCurveTo(0,-bh*.5,-bw*.7,-bh*.3);g.fill();g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(-bw*.35,-bh*.55,bw*.18,bh*.14,-.5,0,7);g.fill();}
  else if(id==='zsnow'||id==='zfrost'){g.strokeStyle=id==='zsnow'?'#ffffff':'#f4fbff';g.lineWidth=Math.max(1,bw*.1);var cx0=0,cy0=-bh*.5,R=bh*.36;for(var a=0;a<6;a++){var an=a*Math.PI/3;g.beginPath();g.moveTo(cx0,cy0);g.lineTo(cx0+Math.cos(an)*R*1.4,cy0+Math.sin(an)*R);g.stroke();}
    if(id==='zfrost'){g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1;for(var q=0;q<4;q++){g.beginPath();g.arc(-bw*.6+q*bw*.4,-bh*.15,bw*.18,Math.PI,0);g.stroke();}}}
  else if(id==='zball'){g.strokeStyle='#f7c948';g.lineWidth=Math.max(1,bw*.12);g.beginPath();g.moveTo(-bw,-bh*.45);g.quadraticCurveTo(0,-bh*.75,bw,-bh*.45);g.stroke();g.fillStyle='#fff';for(var z=-1;z<=1;z++){g.beginPath();g.arc(z*bw*.45,-bh*.2,bh*.07,0,7);g.fill();}g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(-bw*.4,-bh*.65,bw*.14,bh*.1,-.5,0,7);g.fill();}
  else if(id==='zicic'){g.fillStyle='rgba(255,255,255,.9)';for(var ii=-1;ii<=1;ii++){g.beginPath();g.moveTo(ii*bw*.5-bw*.15,-bh*.95);g.lineTo(ii*bw*.5+bw*.15,-bh*.95);g.lineTo(ii*bw*.5,-bh*.25);g.fill();}}
  else if(id==='zbull'){g.fillStyle='#2a2a2a';g.beginPath();g.ellipse(0,-bh*.84,bw*.98,bh*.22,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(bw*.5,-bh*.82,bh*.06,0,7);g.fill();}
  else if(id==='zmit'){g.fillStyle='#fff';g.fillRect(-bw,-bh*.42,bw*2,bh*.14);for(var m=-2;m<=2;m++){g.beginPath();g.arc(m*bw*.38,-bh*.7,bh*.05,0,7);g.fill();}}
  g.restore();}
// вещи берега сезонов: x,y — низ вещи на берегу, u — шаг
function decArt(id,g,x,y,u,tn,t){g.save();
  if(id==='zpump'){g.fillStyle=tn('#e8761a');for(var i=-1;i<=1;i++){g.beginPath();g.ellipse(x+i*u*1.5,y-u*2.2,u*1.9,u*2.2,0,0,7);g.fill();}g.strokeStyle=tn('#b8560e');g.lineWidth=Math.max(1,u*.25);for(var j=-1;j<=1;j++){g.beginPath();g.ellipse(x+j*u*1.5,y-u*2.2,u*.7,u*2.1,0,0,7);g.stroke();}
    g.fillStyle=tn('#4a6a22');g.fillRect(x-u*.3,y-u*5.2,u*.6,u*1.2);g.beginPath();g.ellipse(x+u*1.2,y-u*4.8,u*1.2,u*.5,-.4,0,7);g.fill();}
  else if(id==='zhay'){g.fillStyle=tn('#d8b45a');g.beginPath();g.moveTo(x-u*4,y);g.quadraticCurveTo(x-u*3.6,y-u*6,x,y-u*7.2);g.quadraticCurveTo(x+u*3.6,y-u*6,x+u*4,y);g.fill();g.strokeStyle=tn('#b08a36');g.lineWidth=Math.max(1,u*.2);
    for(var h=0;h<7;h++){g.beginPath();g.moveTo(x-u*3+h*u,y-u*.4);g.lineTo(x-u*2+h*u*.66,y-u*(3+h%3));g.stroke();}g.strokeStyle=tn('#6a4a22');g.lineWidth=Math.max(1,u*.35);g.beginPath();g.moveTo(x,y-u*7.2);g.lineTo(x,y-u*9);g.stroke();}
  else if(id==='zsman'){g.fillStyle=tn('#f6fbff');g.beginPath();g.arc(x,y-u*2.4,u*2.6,0,7);g.fill();g.beginPath();g.arc(x,y-u*6.2,u*1.9,0,7);g.fill();g.beginPath();g.arc(x,y-u*9,u*1.4,0,7);g.fill();
    g.strokeStyle=tn('#cfe0ec');g.lineWidth=Math.max(1,u*.2);g.beginPath();g.arc(x,y-u*2.4,u*2.6,0,7);g.stroke();
    g.fillStyle=tn('#6a4a2a');g.beginPath();g.ellipse(x,y-u*10.2,u*1.6,u*.7,0,Math.PI,0);g.fill();g.fillRect(x-u*1.7,y-u*10.3,u*3.4,u*.5);
    g.fillStyle='#222';g.beginPath();g.arc(x-u*.5,y-u*9.2,u*.18,0,7);g.arc(x+u*.5,y-u*9.2,u*.18,0,7);g.fill();g.fillStyle=tn('#f08c00');g.beginPath();g.moveTo(x,y-u*8.9);g.lineTo(x+u*1.3,y-u*8.6);g.lineTo(x,y-u*8.4);g.fill();
    g.fillStyle=tn('#d8322a');g.fillRect(x-u*1.5,y-u*7.8,u*3,u*.55);g.strokeStyle=tn('#5a3a1a');g.lineWidth=Math.max(1,u*.3);g.beginPath();g.moveTo(x+u*1.6,y-u*6);g.lineTo(x+u*4.8,y-u*11);g.stroke();
    g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1;g.beginPath();g.moveTo(x+u*4.8,y-u*11);g.lineTo(x+u*5.2,y-u*5);g.stroke();}
  else if(id==='zshat'){g.fillStyle=tn('#3b6fb0');g.beginPath();g.moveTo(x-u*5,y);g.lineTo(x,y-u*7.5);g.lineTo(x+u*5,y);g.fill();g.fillStyle=tn('#e8f0f8');g.beginPath();g.moveTo(x-u*1.4,y);g.lineTo(x,y-u*4);g.lineTo(x+u*1.4,y);g.fill();
    g.strokeStyle=tn('#f7c948');g.lineWidth=Math.max(1,u*.25);g.beginPath();g.moveTo(x-u*5,y);g.lineTo(x,y-u*7.5);g.lineTo(x+u*5,y);g.stroke();g.fillStyle=tn('#ffffff');g.beginPath();g.ellipse(x,y-u*.1,u*5.6,u*.5,0,0,7);g.fill();}
  else if(id==='zsled'){g.strokeStyle=tn('#8a5a2a');g.lineWidth=Math.max(1,u*.4);g.beginPath();g.moveTo(x-u*4,y-u*.4);g.lineTo(x+u*3.4,y-u*.4);g.quadraticCurveTo(x+u*4.6,y-u*.4,x+u*4.4,y-u*1.6);g.stroke();
    g.fillStyle=tn('#b8763a');g.fillRect(x-u*3.6,y-u*1.8,u*6.6,u*.6);g.fillStyle=tn('#2f6f9e');g.fillRect(x-u*3,y-u*4.4,u*5,u*2.6);g.fillStyle=tn('#f7c948');g.fillRect(x-u*3,y-u*3.4,u*5,u*.35);
    g.strokeStyle=tn('#5a3a1a');g.lineWidth=Math.max(1,u*.25);g.beginPath();g.moveTo(x+u*4.4,y-u*1.6);g.lineTo(x+u*6,y-u*2.8);g.stroke();}
  else if(id==='zfeed'){g.strokeStyle=tn('#6a4a2a');g.lineWidth=Math.max(1,u*.45);g.beginPath();g.moveTo(x,y);g.lineTo(x,y-u*7);g.stroke();g.fillStyle=tn('#a8743a');g.fillRect(x-u*2.6,y-u*7.2,u*5.2,u*.6);
    g.fillStyle=tn('#8a5a2a');g.beginPath();g.moveTo(x-u*3,y-u*9.6);g.lineTo(x,y-u*11);g.lineTo(x+u*3,y-u*9.6);g.fill();g.fillStyle='#fff';g.fillRect(x-u*3,y-u*9.9,u*6,u*.4);
    var bob=Math.sin((t||0)*3)*u*.2;[[-1.4,'#f2c53d'],[1.4,'#e8553a']].forEach(function(b){var bx=x+b[0]*u,by=y-u*7.8+bob;g.fillStyle=tn(b[1]);g.beginPath();g.ellipse(bx,by,u*.8,u*.6,0,0,7);g.fill();g.fillStyle=tn('#2a2a2a');g.beginPath();g.arc(bx+u*.5*Math.sign(b[0]),by-u*.5,u*.4,0,7);g.fill();});}
  g.restore();}
// где стоит вещь сезона: левый берег у Петровича, дальний берег, лёд (зимние вещи на льду, когда лёд); на ПК/горизонтально — как прочие вещи
function petrY(){var y0=GEO.yOf(9);return y0+(GEO.shY-y0)*.2;}
var DEC_AT={zpump:function(){return [GEO.W*.21,petrY()+GEO.u*6,1];},zfeed:function(){return [GEO.W*.035,petrY()+GEO.u*5,.9];},zhay:function(){return [GEO.W*.9,GEO.hz+GEO.u*1.6,.45];},
  zsman:function(){return G.ice?[GEO.W*.9,GEO.yOf(10),1.15*GEO.ps(10)*2.2]:[GEO.W*.1,petrY()+GEO.u*8,.85];},
  zshat:function(){return G.ice?[GEO.W*.2,GEO.yOf(20),1.2*GEO.ps(20)*2.2]:[GEO.W*.8,GEO.hz+GEO.u*1.6,.45];},
  zsled:function(){return G.ice?[GEO.W*.72,GEO.yOf(24),1.1*GEO.ps(24)*2.2]:[GEO.W*.2,petrY()+GEO.u*10,.8];}};
function shoreArt(g,t){var o=st(),u=GEO.u,tn=G.P.tint||function(c){return c;};
  for(var id in DEC_AT){if(!o.it[id]||(S.decOff&&S.decOff[id]))continue;var p=DEC_AT[id]();decArt(id,g,p[0],p[1],u*p[2],tn,t);}}

/* ---------- «Лунка»: лёд на месте (логика — тут, рисунок и лунки — лениво rb2-season-ice.js) ---------- */
var ICE_PL=['prud','rechka','seliger','ladoga','baikal','amur','oka','chud','onego','ilmen'];
function iceDay(){var d=dk(),md=d.slice(5);return md>='12-01'||md<='03-15';}
function ice(pi){if(off('lunka'))return false;var P=PLACES[pi];return !!P&&ICE_PL.indexOf(P.id)>=0&&iceDay();}
var iceP=null;function iceNeed(){if(!iceP)iceP=R2.need('js/rb2-season-ice.js');return iceP;}
{var cf=condFor;condFor=function(pi,tod){var c=cf(pi,tod);try{if(c&&c.wx==='rain'&&ice(pi))c.wx='cloud';}catch(e){}return c;};}
{var sf=startFish;startFish=function(pi){var r=sf.apply(this,arguments);try{if(G&&ice(G.pi)){G.ice=1;iceNeed().then(function(){if(window.RSI&&G&&G.ice)RSI.start();});}}catch(e){}return r;};}
R2.on('home',function(){if(iceDay()&&!off('lunka')&&(S.caught||0)>=1)setTimeout(iceNeed,1500);},'lunka');

/* ---------- «Водоём месяца» (места — js/rb2-water.js в <head>): свой раздел на главном, путёвка — после Волги ---------- */
(function(){if(!window.RB2_WATER||typeof PLACES==='undefined')return;
  function idx(){return RB2_WATER.idx();}
  function needOk(i){var a=PLACES[i]&&PLACES[i].after,j=a?placeIdx(a):-1;return j<0||!!S.open[j];}
  if(typeof window.uiChapters==='function'){var uc=window.uiChapters;window.uiChapters=function(){var c=uc.apply(this,arguments);try{var w=idx();if(w.length&&!off('water')){var a=PLACES[w[0]].after,j=a?placeIdx(a):-1;
    c=[{id:'water',n:'⭐ Водоём месяца',nE:'⭐ Water of the month',places:w,lock:needOk(w[0])?'':T('Путёвка — после «'+nm(PLACES[j])+'»','Trip after «'+nm(PLACES[j])+'»'),dE:'',d:''}].concat(c);}}catch(e){}return c;};}
  var bp=buyPlace;buyPlace=function(i){try{if(PLACES[i]&&PLACES[i].wat){if(off('water'))return;if(!needOk(i)){var j=placeIdx(PLACES[i].after);toast(T('Сначала открой «'+nm(PLACES[j])+'»','Unlock «'+nm(PLACES[j])+'» first'));return;}}}catch(e){}return bp.apply(this,arguments);};})();

/* ---------- праздники SEASON (адвент, Каникулы, Старый Новый год, Морозы, Синичкин день) — строки в «Утре у Петровича» / «Почте» ---------- */
function fon(id){try{return !off('sezFest')&&FEST.on(id);}catch(e){return false;}}
function advDay(){var d=dk();if(d.slice(5,7)!=='12')return 0;var n=+d.slice(8,10);return n>=15&&n<=31?n-14:0;} // 15–31.12 → окошки 1…17
function advC(n){var e=RE(),k=n===17?1:n%5===0?.6:.3;return e?e.c(k,k>=1?100:30):Math.max(30,Math.round(k*30/5)*5);}
function hd(){return st().h;}
// одна выдача на день, где бы ни показали (Утро или Почта)
var FROWS=[
 {id:'adv',ok:function(){return fon('ny27')&&advDay()>0&&hd().ad!==dk();},row:function(){var n=advDay();return {ic:'🎄',t:T('Адвент: окошко ','Advent: window ')+n+(n===17?T(' — большой подарок!',' — the big one!'):''),sub:T('до Нового года ','days to New Year: ')+(18-n),right:'+'+coinsTxt(advC(n))};},
   take:function(){var n=advDay(),c=advC(n),e=RE();hd().ad=dk();if(e&&e.give)c=e.give('season',c,T('Адвент','Advent'))||0;else S.coins+=ern('season',c);if(n===17)add('fest',5);else add('fest',1);save();return c;}},
 {id:'sng',ok:function(){return fon('sng27')&&!hd().sn;},row:function(){return {ic:'🎁',t:T('Старый Новый год: последний большой подарок','Old New Year: the last big gift'),sub:T('и 20 лучшей наживки','and 20 best bait'),right:'+'+coinsTxt(bigC())};},
   take:function(){var c=bigC(),e=RE(),b=bestBait();hd().sn=1;if(e&&e.give)c=e.give('season',c,T('Старый Новый год','Old New Year'))||0;else S.coins+=ern('season',c);S.bait[b]=(S.bait[b]||0)+20;add('fest',5);save();return c;}},
 {id:'mor',ok:function(){return fon('mor27')&&hd().mo!==dk();},row:function(){return {ic:'❄️',t:T('Трескучие морозы: налим и навага клюют вдвое','Deep frost: burbot and navaga bite twice as often'),sub:T('иней на удочке, очки сезона ×2','frost on the rod, season points ×2'),right:'🎣'};},
   take:function(){hd().mo=dk();save();return 0;}}
];
function frow(x){var r=x.row();r.pri=60;r.id='sez_'+x.id;return r;}
R2.on('morning',function(rows){FROWS.forEach(function(x){try{if(x.ok()){var r=frow(x),c=x.take();if(c)r.right='+'+coinsTxt(c);rows.push(r);}}catch(e){}});},'sezFest');
if(window.MAILX)FROWS.forEach(function(x){MAILX.push({id:'sez_'+x.id,ok:function(){try{return !off('sezFest')&&(S.caught||0)>=1&&x.ok();}catch(e){return false;}},ic:'🎄',part:T('праздник','holiday'),
  c:function(){try{return x.id==='adv'?advC(advDay()):x.id==='sng'?bigC():0;}catch(e){return 0;}},get t(){try{return x.row().t;}catch(e){return '';}},get sub(){try{return x.row().sub;}catch(e){return '';}},
  take:function(){if(!this.ok())return;var c=x.take();try{updCoins();if(c)toast('🎄 +'+coinsTxt(c),2600,true);}catch(e){}}});});
// Трескучие морозы: налим и навага клюют чаще (×2 к весу вида в составе улова; бот и проверки без FEST — как прежде)
var FROST=['nalim','navaga'];
{var a2m=a2Mul;a2Mul=function(f,o,tod,wx){var x=a2m(f,o,tod,wx);try{if(f&&FROST.indexOf(f.id)>=0&&fon('mor27'))x*=2;}catch(e){}return x;};}
// Синичкин день (12.11): две синицы на берегу у ведра; Трескучие морозы: иней по краям экрана на рыбалке
function tit(g,x,y,u,t,ph,tn){var hop=Math.max(0,Math.sin(t*2.2+ph))*u*.9,yy=y-hop,d=Math.sin(t*.7+ph)>0?1:-1;g.save();g.translate(x,yy);g.scale(d,1);
  g.fillStyle=tn('#5a7a9a');g.beginPath();g.ellipse(-u*.9,-u*1.1,u*1.3,u*.8,-.2,0,7);g.fill();                     // крыло и хвост
  g.fillStyle=tn('#f2c53d');g.beginPath();g.ellipse(0,-u*1.2,u*1.25,u*1.05,0,0,7);g.fill();                      // жёлтая грудка
  g.fillStyle='#1f1f1f';g.fillRect(-u*.12,-u*1.9,u*.24,u*1.5);g.beginPath();g.arc(u*.55,-u*2.4,u*.8,0,7);g.fill(); // галстук и шапочка
  g.fillStyle='#fff';g.beginPath();g.ellipse(u*.75,-u*2.25,u*.42,u*.32,0,0,7);g.fill();g.fillStyle='#222';g.beginPath();g.moveTo(u*1.3,-u*2.45);g.lineTo(u*1.8,-u*2.35);g.lineTo(u*1.3,-u*2.2);g.fill();
  g.strokeStyle='#5a4a3a';g.lineWidth=Math.max(1,u*.15);g.beginPath();g.moveTo(-u*.2,-u*.3);g.lineTo(-u*.3,0);g.moveTo(u*.3,-u*.3);g.lineTo(u*.3,0);g.stroke();g.restore();}
{var sd2=drawShoreDec;drawShoreDec=function(g,t){sd2(g,t);try{if(fon('sin26')||fon('sin27')){var u=GEO.u,W=GEO.W,H=GEO.H,yb=GEO.shY+(H-GEO.shY)*.52,tn=G.P.tint||function(c){return c;},tt=calm()?0:t;
  g.fillStyle=tn('#e8d8a0');for(var i=0;i<7;i++){g.beginPath();g.arc(W*.09+i*u*1.3,petrY()+u*8+(i%2)*u*.4,u*.3,0,7);g.fill();} // семечки
  tit(g,W*.06,petrY()+u*7,u*1.25,tt,0,tn);tit(g,W*.2,petrY()+u*9,u*1.15,tt,2.1,tn);}}catch(e){}};}
var FROSTC=null;
function frostCv(W,H){if(FROSTC&&FROSTC.w===W&&FROSTC.h===H)return FROSTC.c;var c=D.createElement('canvas'),dp=Math.min(1.5,window.devicePixelRatio||1);c.width=W*dp;c.height=H*dp;var g=c.getContext('2d');g.scale(dp,dp);
  var gr=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);gr.addColorStop(0,'rgba(230,245,255,0)');gr.addColorStop(1,'rgba(230,245,255,.55)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  var R=rng(77);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1;for(var i=0;i<26;i++){var corner=i%4,x=corner%2?W:0,y=corner>1?H:0,a=Math.atan2(H/2-y,W/2-x)+(R()-.5)*1.2,L0=Math.min(W,H)*(.08+R()*.14);
    g.beginPath();g.moveTo(x,y);var ex=x+Math.cos(a)*L0,ey=y+Math.sin(a)*L0;g.lineTo(ex,ey);for(var k=1;k<4;k++){var bx=x+Math.cos(a)*L0*k/4,by=y+Math.sin(a)*L0*k/4;g.moveTo(bx,by);g.lineTo(bx+Math.cos(a+.7)*L0*.25,by+Math.sin(a+.7)*L0*.25);g.moveTo(bx,by);g.lineTo(bx+Math.cos(a-.7)*L0*.25,by+Math.sin(a-.7)*L0*.25);}g.stroke();}
  FROSTC={w:W,h:H,c:c};return c;}
{var rn0=render;render=function(){rn0.apply(this,arguments);try{if(G&&GEO&&fon('mor27')&&!(typeof LOW!=='undefined'&&LOW))cx.drawImage(frostCv(GEO.W,GEO.H),0,0,GEO.W,GEO.H);}catch(e){}};}
function mul(k){if(fon('mor27'))return 2;if(k==='sez'&&fon('kan27'))return 1.5;return 1;}

window.RSEZ={winter:function(){return !off("lunka")&&iceDay();},add:add,cur:cur,next:next,left:left,lv:lv,open:open,take:take,ice:ice,mul:mul,dk:dk,sezAt:sezAt,seasonsOf:seasonsOf,canTake:canTake,poll:poll,
  _:{lvlC:lvlC,bigC:bigC,IT:IT,SZ:SZ,SFISH:SFISH,sezFish:sezFish,freeRw:freeRw,payRw:payRw,rwTxt:rwTxt,st:st,STEPS:STEPS,PER:PER,DAYCAP:DAYCAP,payOn:payOn,payOwn:payOwn,payId:payId,hol:hol,fon:fon,FROWS:FROWS,advDay:advDay,iceDay:iceDay,ICE_PL:ICE_PL,wasSeason:wasSeason,decArt:decArt,dTxt:dTxt,statEv:statEv,give:give,roll:roll}};
})();
