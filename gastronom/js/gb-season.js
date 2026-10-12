/* ================= gb-season — «Квартальный план» (сезон) и «Премия за квартал» (поток LEAGUE, 10.10.2026) =================
   Журнал: hobby-analytics/release-i/gastronom-boost/logs/LEAGUE.md. Образец — Выезд js/season.js.
   Сезон — по календарю (включается и кончается сам, дата — GBLG.now(): nowMs() + ?date= на маке / FESTGB.now()):
     окт–ноя «Ночная смена» (на Яндексе — «Осенний завоз», без Хэллоуина), дек «Новогодний стол заказов», мар «8 Марта»,
     май «Первомай», остальные месяцы — свои (таблица SEAS). Дорожка 30 ступеней по 100 очков.
   Очки (GBECO.qp или DEF): уровень 10 (+5 за ★★★, +10 Ревизия, +10 задание дня), дело «Плана на сегодня» 10 (событие 'plan'),
     печать «План выполнен» 30 ('seal'), мини-игра 15 ('mg'), тройка в соцсоревновании 50; не больше 300 в день.
   Бесплатная дорожка — полная (монеты на каждой ступени). «Премия за квартал» (товар PAY_ITEMS 'prem' — ECO; 15 голосов/сезон)
     — ТОЛЬКО КРАСОТА + 500 💰: сезонная вывеска (ступень 1), наряд Вали (10), золотые рамки грамот (20), украшение зала (30)
     и монеты на каждой ступени; можно купить в любой день — прошлые ступени выдаются сразу. ОК и Яндекс — без Премии.
   Сохранение: S.qp {s: сезон ГГГГММ, p: очки, g: выдано бесплатных, q: выдано платных, t: 1 — Премия, n: 1 — оплачена на следующий сезон («Продлить»), d: день, dp: очки дня},
     S.qpH {сезон: ступеней} (последние 6). Облако — свой merge: сезон — тот, что позже; в том же — максимум.
   Красота для VIEW/ART/META: GBQP.look() → {sign, outfit, frame, deco} (id темы сезона или ''), пока сезон идёт.
   STAT: ss {s, st, prem}. Флаг выключения — GB.flag('season'). Экран — GB.screen('season'), гнездо — homeSlots zone 'plan'. */
(function(){
'use strict';
var GB=window.GB;if(!GB)return;
function Lx(r,e){try{return LANG==='en'?e:r;}catch(x){return r;}}
function plx(n,a,b,c,e1,e2){try{return pl(n,a,b,c,e1,e2);}catch(x){var m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function S_(){return typeof S!=='undefined'?S:null;}
function num(x){x=+x;return isFinite(x)&&x>0?x:0;}
function isObj(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
var YA=function(){try{return PLAT!=='vk';}catch(e){return false;}};
var OKP=function(){try{return !!OK;}catch(e){return false;}};

/* ---------- сезоны (тексты — отдельными данными для вычитки; ya — имя на Яндексе) ---------- */
// m — месяцы сезона; th — тема (рисунок вывески и украшений), c — цвета [вывеска, буквы], ic — значок
var SEAS=[
  {m:[10,11],th:'night',n:'Ночная смена',en:'Night Shift',ya:'Осенний завоз',yen:'Autumn Delivery',ic:'🎃',yic:'🍂',c:['#2a1f3d','#ff9a3a'],
   d:'Ночь на переучёте: фонарик, тыквы и призрак завмага.',de:'Stocktaking night: a torch, pumpkins and the ghost of the manager.',
   yd:'Осень: картошка, капуста и яблоки — завоз за завозом.',yde:'Autumn: potatoes, cabbage and apples — delivery after delivery.'},
  {m:[12],th:'ny',n:'Новогодний стол заказов',en:'New Year Orders Desk',ic:'🎄',c:['#1f5a3a','#ffd23f'],d:'Мандарины, горошек и ёлка в зале.',de:'Tangerines, peas and a tree in the hall.'},
  {m:[1],th:'winter',n:'Зимний завоз',en:'Winter Delivery',ic:'❄️',c:['#2f6fd0','#fff'],d:'Снег за окном, а в зале тепло и очередь.',de:'Snow outside, warm hall and a queue inside.'},
  {m:[2],th:'maslen',n:'Масленица у прилавка',en:'Pancake Week at the Counter',ic:'🥞',c:['#c8401c','#ffe08a'],d:'Блины, сметана и сгущёнка — на каждом прилавке.',de:'Pancakes, sour cream and condensed milk on every counter.'},
  {m:[3],th:'mar8',n:'8 Марта',en:'March 8th',ic:'🌷',c:['#d64a8a','#fff'],d:'Мимоза, торты и открытки — для всех покупательниц.',de:'Mimosa, cakes and cards for every lady customer.'},
  {m:[4],th:'spring',n:'Весенний субботник',en:'Spring Clean-up',ic:'🌱',c:['#2b8a3e','#fff'],d:'Моем витрины до блеска и красим прилавки.',de:'Polishing the windows and painting the counters.'},
  {m:[5],th:'may',n:'Первомай',en:'May Day',ic:'🎈',c:['#c8102e','#ffd23f'],d:'Флажки, шары и праздничный завоз.',de:'Bunting, balloons and a holiday delivery.'},
  {m:[6],th:'summer',n:'Летний завоз',en:'Summer Delivery',ic:'🍓',c:['#e5484d','#fff'],d:'Клубника, квас и мороженое.',de:'Strawberries, kvass and ice cream.'},
  {m:[7],th:'torg',n:'День торговли',en:'Trade Day',ic:'🏅',c:['#d4a017','#3b2a1a'],d:'Праздник всех продавцов — грамоты и премии.',de:'Every shop worker’s holiday — certificates and bonuses.'},
  {m:[8],th:'harvest',n:'Урожайный август',en:'Harvest August',ic:'🍉',c:['#3f8a2a','#ffe08a'],d:'Арбузы, яблоки и банки для закаток.',de:'Watermelons, apples and jars for preserves.'},
  {m:[9],th:'school',n:'Школьный базар',en:'Back-to-School Fair',ic:'📚',c:['#2f4a8a','#fff'],d:'Тетради, пеналы и пирожки на перемене.',de:'Notebooks, pencil cases and pies at break time.'}];
var LOOKS=[['sign','🏪','Вывеска','Sign',1],['outfit','👗','Наряд Вали','Valya’s outfit',10],['frame','🖼','Золотые рамки','Gold frames',20],['deco','✨','Украшение зала','Hall decoration',30]];
var DEF={steps:30,per:100,cap:300,lvl:10,star3:5,boss:10,daily:10,plan:10,seal:30,mg:15,lg:50,open:6,
  free:function(k){return k===30?80:k%5===0?30:10;},paid:function(k){return k===30?65:15;}};
function E(){var e=window.GBECO&&GBECO.qp;return isObj(e)?e:{};}
function cfg(k){var v=E()[k];return v!==undefined?v:DEF[k];}
function rw(kind,k){var f=cfg(kind);try{return typeof f==='function'?+f(k)||0:Array.isArray(f)?+f[k-1]||0:0;}catch(e){return 0;}}
var PREM='prem';

/* ---------- время ---------- */
function now(){try{if(window.GBLG&&GBLG.now)return GBLG.now();}catch(e){}return typeof nowMs==='function'?nowMs():Date.now();}
function seasonAt(ms){var d=new Date(ms),y=d.getFullYear(),m=d.getMonth()+1;for(var i=0;i<SEAS.length;i++){var x=SEAS[i],k=x.m.indexOf(m);
  if(k>=0){var m0=x.m[0];return {id:y*100+m0,x:x,end:new Date(y,m0-1+x.m.length,1).getTime(),start:new Date(y,m0-1,1).getTime()};}}
  return {id:y*100+m,x:SEAS[0],end:new Date(y,m,1).getTime(),start:new Date(y,m-1,1).getTime()};}
function cur(){return seasonAt(now());}
function nameOf(x){return YA()&&x.ya?Lx(x.ya,x.yen):Lx(x.n,x.en);}
function descOf(x){return YA()&&x.yd?Lx(x.yd,x.yde):Lx(x.d,x.de);}
function icOf(x){return YA()&&x.yic?x.yic:x.ic;}
function dayNo(){var d=new Date(now());return Math.round(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);}

/* ---------- сохранение ---------- */
function fresh(id){return {s:id,p:0,g:0,q:0,t:0,d:0,dp:0};}
function fix(s){var x=s.qp;if(!isObj(x)||!(num(x.s)>0))s.qp=x=fresh(cur().id);['s','p','g','q','t','d','dp','n'].forEach(function(k){x[k]=Math.floor(num(x[k]));});
  if(x.t>1)x.t=1;if(x.n>1)x.n=1;var N=cfg('steps');if(x.g>N)x.g=N;if(x.q>N)x.q=N;
  if(!isObj(s.qpH))s.qpH={};var hk=Object.keys(s.qpH).sort();for(var k in s.qpH)s.qpH[k]=Math.floor(num(s.qpH[k]));if(hk.length>6)hk.slice(0,hk.length-6).forEach(function(k){delete s.qpH[k];});}
function merge(s,d){if(!isObj(d))return;var a=isObj(s.qp)?s.qp:fresh(0),b=d.qp;
  if(isObj(b)&&num(b.s)>0){if(num(b.s)>num(a.s))s.qp=b;else if(num(b.s)===num(a.s)){['p','g','q','t','n'].forEach(function(k){a[k]=Math.max(num(a[k]),num(b[k]));});
      if(num(b.d)>num(a.d)){a.d=num(b.d);a.dp=num(b.dp);}else if(num(b.d)===num(a.d))a.dp=Math.max(num(a.dp),num(b.dp));s.qp=a;}}
  if(isObj(d.qpH)){if(!isObj(s.qpH))s.qpH={};for(var k in d.qpH)s.qpH[k]=Math.max(num(s.qpH[k]),num(d.qpH[k]));}}
GB.onSave({id:'season',keys:['qp','qpH'],fix:fix,merge:merge});
function sv(){try{save();}catch(e){}}

/* ---------- ступени и награды ---------- */
function isOn(){var s=S_();return !!s&&GB.flag('season')&&(+s.unlocked||0)>=cfg('open');}
function premOk(){if(OKP()||YA())return false;try{return !!(PAY.on&&PAY.item(PREM)&&PAY_ITEMS[PREM]);}catch(e){return false;}}
function roll(){var s=S_();if(!s)return;if(!isObj(s.qp))fix(s);var c=cur();if(s.qp.s===c.id)return;
  if(s.qp.s&&s.qp.s<c.id){if(s.qp.g)s.qpH[s.qp.s]=s.qp.g;ev({s:s.qp.s%10000,st:steps(),prem:s.qp.t,a:'end'});}
  if(s.qp.s>c.id)return; // часы ушли назад (облако с другого устройства) — сезон не откатываем
  var nx=s.qp.n?1:0;s.qp=fresh(c.id);s.qp.t=nx;fix(s);sv();}
function steps(){var s=S_();return Math.min(cfg('steps'),Math.floor(num(s.qp.p)/cfg('per')));}
function ev(o){try{if(window.STAT&&STAT.ev)STAT.ev('ss',o);}catch(e){}}
function coins(n){if(!(n>0))return;try{if(window.GBECO&&typeof GBECO.give==='function'){GBECO.give('qp',n);return;}}catch(e){}
  var s=S_();s.coins=(+s.coins||0)+(typeof ern==='function'?ern('qp',n):n);try{updCoins();}catch(e){}}
function grant(){var s=S_(),x=s.qp,n=steps(),got=0;while(x.g<n){x.g++;var c=rw('free',x.g);coins(c);got+=c;}
  if(x.t)while(x.q<n){x.q++;var c2=rw('paid',x.q);coins(c2);got+=c2;}
  if(got){sv();ev({s:x.s%10000,st:n,prem:x.t});}return got;}
function add(n,why){n=Math.floor(num(n));if(!n||!isOn())return 0;roll();var x=S_().qp,dn=dayNo();if(x.d!==dn){x.d=dn;x.dp=0;}
  n=Math.min(n,cfg('cap')-x.dp);if(!(n>0))return 0;var b=steps();x.dp+=n;x.p+=n;var g=grant(),a=steps();
  if(a>b)GB.safe('qp:toast',function(){toast('📋 '+Lx('Квартальный план: ступень ','Quarterly plan: step ')+a+'/'+cfg('steps')+(g?' · +'+g+' 💰':''),2400);});
  sv();lastAdd={n:n,t:Date.now(),why:why||''};return n;}
var lastAdd={n:0,t:0};
// Премия куплена (зовёт PAY_ITEMS.prem.give): платная дорожка — с прошлыми ступенями сразу
function pass(){var s=S_();if(!s)return;roll();var x=s.qp;
  if(x.t){x.n=1;sv();ev({s:x.s%10000,st:steps(),prem:1,a:'next'}); // «Продлить» (ECO): Премия этого сезона уже есть — оплачен следующий
    GB.safe('qp:next',function(){toast('⭐ '+Lx('Премия на следующий сезон оплачена!','Next season’s bonus is paid!'),3000);});return;}
  x.t=1;var g=grant();sv();
  ev({s:x.s%10000,st:steps(),prem:1,a:'buy'});
  GB.safe('qp:pass',function(){toast('⭐ '+Lx('Премия за квартал — ваша!','Quarterly bonus is yours!')+(g?' +'+g+' 💰':''),3000);});
  GB.safe('qp:re',function(){if(GB.cur==='season')GB.go('season');else GB.refresh();});}
function look(){var s=S_(),o={sign:'',outfit:'',frame:'',deco:''};if(!s||!isOn()||!isObj(s.qp))return o;roll();var x=s.qp,th=cur().x.th;if(!x.t)return o;var n=steps();
  LOOKS.forEach(function(l){if(n>=l[4]||(l[4]===1&&x.t))o[l[0]]=th;});return o;}

/* ---------- очки ---------- */
GB.levelHook.push(function(i){if(!i||i.r!=='win')return;var st=+i.st||0;
  add(cfg('lvl')+(st>=3?cfg('star3'):0)+(i.boss?cfg('boss'):0)+(i.daily?cfg('daily'):0),'lvl');});
GB.on('plan',function(){add(cfg('plan'),'plan');});
GB.on('seal',function(){add(cfg('seal'),'seal');});
GB.on('mg',function(){add(cfg('mg'),'mg');});
GB.on('ready',function(){roll();if(isOn())grant();});
GB.on('home',function(){roll();});

/* ---------- вид ---------- */
// сезонная вывеска (SVG): табличка цвета сезона с названием и значком
function signSvg(x,w){var c=x.c||['#c8401c','#fff'];w=w||120;var nm=nameOf(x);var fs=nm.length>18?9:nm.length>12?11:13;
  return '<svg class="qpsign" width="'+w+'" height="'+Math.round(w*.42)+'" viewBox="0 0 120 50" aria-hidden="true"><rect x="3" y="6" width="114" height="38" rx="7" fill="'+c[0]+'" stroke="#3b2a1a" stroke-width="2.5"/>'+
    '<rect x="8" y="11" width="104" height="28" rx="4" fill="none" stroke="'+c[1]+'" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="3 2"/>'+
    '<text x="60" y="'+(29+fs/3)+'" text-anchor="middle" font-size="'+fs+'" font-weight="800" fill="'+c[1]+'" font-family="Georgia,serif">'+esc(nm)+'</text>'+
    '<circle cx="14" cy="6" r="2.4" fill="#8a6a4a"/><circle cx="106" cy="6" r="2.4" fill="#8a6a4a"/></svg>';}
function daysLeft(){var c=cur();return Math.max(1,Math.ceil((c.end-now())/864e5));}
function ico(c,lk){return (c?'<b>'+c+'</b> 💰':'')+(lk?' '+lk:'');}
function lookAt(k){for(var i=0;i<LOOKS.length;i++)if(LOOKS[i][4]===k)return LOOKS[i];return null;}
function render(el){roll();if(isOn())grant();var s=S_(),x=s.qp,c=cur(),N=cfg('steps'),P=cfg('per'),n=steps(),left=daysLeft(),pr=premOk()||x.t,h='';
  h+='<header class="gh"><button class="icon" id="qpBack" aria-label="'+Lx('Назад','Back')+'">←</button><div class="gt"><div>'+Lx('Квартальный план','Quarterly plan')+'</div><div class="sub">'+icOf(c.x)+' '+esc(nameOf(c.x))+' · '+Lx('ещё ','')+left+' '+plx(left,'день','дня','дней','day left','days left')+'</div></div></header><div class="qpwrap">';
  h+='<div class="qphead">'+signSvg(c.x,96)+'<div><b>'+Lx('Ступень ','Step ')+n+' / '+N+'</b><small>'+esc(descOf(c.x))+'</small><span class="qpbar"><i style="width:'+Math.round(Math.min(1,x.p/(N*P))*100)+'%"></i></span><small>'+
    x.p+' / '+N*P+Lx(' очков · сегодня ',' points · today ')+(x.d===dayNo()?x.dp:0)+' / '+cfg('cap')+'</small></div></div>';
  if(pr){h+='<div class="qpprem'+(x.t?' on':'')+'"><b>⭐ '+Lx('Премия за квартал','Quarterly bonus')+(x.t?' — '+Lx('ваша','yours'):'')+'</b><small>'+
      (x.t?Lx('Награды Премии приходят сами вместе со ступенями.','Bonus rewards arrive with every step.'):Lx('Только красота: сезонная вывеска, наряд тёти Вали, золотые рамки грамот, украшение зала — и ещё 500 💰. Можно купить в любой день: пройденные ступени — сразу.','Just for looks: a seasonal sign, Aunt Valya’s outfit, gold certificate frames, a hall decoration — plus 500 💰. Buy any day: steps already reached pay out at once.'))+'</small>'+
      '<div class="qplooks">'+LOOKS.map(function(l){var own=x.t&&n>=l[4]||l[4]===1&&x.t;return '<span class="'+(own?'own':'')+'"><b>'+l[1]+'</b>'+Lx(l[2],l[3])+'<br>'+(own?'✓':Lx('ступень ','step ')+l[4])+'</span>';}).join('')+'</div>';
    if(!x.t){var ph='';try{ph=typeof payHtml==='function'?payHtml([PREM]):'';}catch(e){}if(ph)h+='<div id="qpPay">'+ph+'</div>';}
    h+='</div>';}
  h+='<div class="qptrack">';for(var k=1;k<=N;k++){var f=rw('free',k),p=rw('paid',k),lk=lookAt(k);
    h+='<div class="qpst'+(k<=n?' done':'')+(k===n+1?' nx':'')+'"><i>'+k+'</i><span class="qpf">'+ico(f)+'</span>'+(pr?'<span class="qpp'+(x.t?'':' lock')+'">'+(x.t?'':'🔒 ')+ico(p,lk?lk[1]:'')+'</span>':'')+'</div>';}
  h+='</div><p class="qpnote">'+Lx('Очки плана: уровень '+cfg('lvl')+' (+'+cfg('star3')+' за ★★★, Ревизия +'+cfg('boss')+', задание дня +'+cfg('daily')+'), дело «Плана на сегодня» '+cfg('plan')+', печать «План выполнен» '+cfg('seal')+', мини-игра '+cfg('mg')+', тройка в соцсоревновании '+cfg('lg')+' — до '+cfg('cap')+' в день. Награды приходят сами. Сезон кончается — начинается новый.',
    'Plan points: level '+cfg('lvl')+' (+'+cfg('star3')+' for ★★★, Inspection +'+cfg('boss')+', daily task +'+cfg('daily')+'), a “Today’s plan” task '+cfg('plan')+', the “Plan done” stamp '+cfg('seal')+', a mini-game '+cfg('mg')+', top 3 in the competition '+cfg('lg')+' — up to '+cfg('cap')+' a day. Rewards arrive automatically. When a season ends, a new one begins.')+'</p></div>';
  el.innerHTML=h;var bk=el.querySelector('#qpBack');if(bk)bk.onclick=function(){try{SND.tap();}catch(e){}if(GB.goHome)GB.goHome();else if(typeof openMap==='function')openMap();};
  var pp=el.querySelector('#qpPay');if(pp)try{PAY.bind(pp);PAY.re=null;}catch(e){}}
GB.screen('season',{render:render});
GB.add(GB.homeSlots,{id:'season',order:70,zone:'plan',on:function(){return isOn();},
  render:function(){roll();var c=cur(),n=steps(),N=cfg('steps');return '<div class="qphall" role="button" tabindex="0"><span class="qpic">'+icOf(c.x)+'</span><span><b>'+Lx('Квартальный план: ','Quarterly plan: ')+esc(nameOf(c.x))+'</b><small>'+Lx('ступень ','step ')+n+' / '+N+' · '+Lx('ещё ','')+daysLeft()+' '+plx(daysLeft(),'день','дня','дней','day left','days left')+'</small><span class="qpbar"><i style="width:'+Math.round(n/N*100)+'%"></i></span></span></div>';},
  mount:function(el){var b=el.querySelector('.qphall');if(b)b.onclick=b.onkeydown=function(e){if(e&&e.type==='keydown'&&e.key!=='Enter')return;try{SND.tap();}catch(x){}GB.go('season');};}});
// «Касса»: «+15 к плану» — одной строкой рядом с лигой (не кнопка)
GB.add(GB.winSlots,{id:'season',order:41,zone:'extra',fit:1,on:function(){return isOn();},
  render:function(){if(!lastAdd.n||Date.now()-lastAdd.t>15000||lastAdd.why!=='lvl')return '';return '<div class="qpwin">📋 +'+lastAdd.n+Lx(' к квартальному плану',' to the quarterly plan')+'</div>';}});

// товар «Премия за квартал» (PAY_ITEMS.prem — ECO): выдача — pass(). Если у ECO свой give — оборачиваем, не заменяя.
function hookPay(){try{var it=PAY_ITEMS[PREM];if(!it||it.__qp)return;var g0=it.give;it.give=function(){if(g0)try{g0.apply(this,arguments);}catch(e){}pass();};it.__qp=1;}catch(e){}}
GB.on('ready',hookPay);

window.GBQP={on:isOn,cur:function(){roll();var c=cur(),s=S_();return {id:c.id,th:c.x.th,name:nameOf(c.x),ic:icOf(c.x),end:c.end,p:s.qp.p,step:steps(),steps:cfg('steps'),pass:!!s.qp.t};},
  add:add,pass:pass,look:look,canBuy:function(){var s=S_();return premOk()&&!!s&&isObj(s.qp)&&!(s.qp.t&&s.qp.n);},prolong:function(){var s=S_();return !!s&&isObj(s.qp)&&!!s.qp.t;},signSvg:function(w){return signSvg(cur().x,w);},
  seasonAt:seasonAt,SEAS:SEAS,PREM:PREM,_hook:hookPay};
})();
