'use strict';
/* ob2-LAVKA (буст_в2.0, 12.10) — «Лавка у ворот». Заглушка на старте — js/lavka.js (товары для довыдачи, подарок, обёртки), здесь — всё остальное.
   Товары за голоса — только вид, ускорение и удобство; золото и силу НЕ продаём. id как в hobby-pay: kvas 4, starter 5 («Узелок новичка», первые 7 дней от S.o2k.d0),
   speed_box 7, night_kit 10 (только в праздник hw26), skins_firebird 11 (было 14). LAV_CAT=1 (js/lavka.js, с 13.10) — vk-pay их знает; при 0 в VK новых нет, Жар-птица 14.
   Облако оплат: POST {} на EV_URL (?op=vkev отвечает JSON с CORS) — ответ есть = живо, нет за 8 с = «Закрыто на переучёт» (кнопки серые, PAY.buy молчит). На маке ?lavka=down.
   Купленное ускорение — сверх потолка 2 ч (boostAdd выше потолка не срезает). Украшения: DECO[i] открывается после главы CH_ORDER[LAV.dch[i]], колодец — подарок за 1-ю.
   Праздничная лавка за золото (hw26): фонари 2000, пугало 3000, знамя «Лунное» 2500 — остаются навсегда. Событие OB2 'deco' {id,n} — для миссий VK.
   S.o2k: d0 — первый день, kv — кружек кваса, gw — подарок (1 выдан, 2 показан), sf — выбрать род для Жар-птицы, sv — какие товары видел (метка «новое»). */
function lkMap(el){let b=$('lkBox');const gl=$('glBox');if(!gl)return;
  if(!lkShow()){if(b)b.remove();if(lkK().gw===1&&!G)setTimeout(()=>{if(lkK().gw===1&&!G&&!$('modal').classList.contains('on'))lkX().then(x=>x.gift()).catch(lkE);},900);return;}
  if(!b){const w=document.createElement('div');w.className='lkrow';gl.parentNode.insertBefore(w,gl);w.appendChild(gl);b=document.createElement('button');b.id='lkBox';b.className='lkbtn';w.appendChild(b);
    if(!$('lkCss')){const s=document.createElement('style');s.id='lkCss';s.textContent='.lkrow{display:flex;gap:8px;align-items:stretch}.lkrow #glBox{flex:1;min-width:0}.lkrow #glBox:empty{display:none}.lkrow .glbar .t b{white-space:normal;overflow:visible;text-overflow:clip;line-height:1.15;font-size:15px}.lkrow .glbar.hot em{padding:7px 8px;font-size:15px}@media (max-width:380px){.lkrow .glbar img{display:none}.lkrow .glbar{padding-left:10px}}.lkbtn{flex:0 0 auto;min-height:56px;margin:0 0 10px;padding:4px 7px;border-radius:16px;border:2.5px solid #a8762e;background:#fff3d6;box-shadow:0 3px 0 #d8b67a;font-weight:800;font-size:15px;color:#4a2e12;line-height:1.1;position:relative}.lkrow #glBox:empty+.lkbtn{flex:1}.lkbtn i{position:absolute;top:-7px;right:-4px;background:#e0452b;color:#fff;font-style:normal;font-size:11px;border-radius:9px;padding:1px 6px}';document.head.appendChild(s);}}
  const nw=lkIds().some(id=>(','+(lkK().sv||'')+',').indexOf(','+id+',')<0);
  b.innerHTML='🧺<br>'+Lg('Лавка','Shop')+(nw?'<i>'+Lg('новое','new')+'</i>':'');b.onclick=()=>{SND.click();lkX().then(x=>x.open()).catch(lkE);};
  if(lkK().gw===1&&!G)setTimeout(()=>{if(lkK().gw===1&&!G&&!$('modal').classList.contains('on'))lkX().then(x=>x.gift()).catch(lkE);},900);}
// что сейчас на прилавке (для «новое»)
function lkIds(){const a=[];if(PAY.on&&!LAV.ios)for(const x of PAY.list){const id=x.id,o=PAY_ITEMS[id];if(o.perm&&PAY.own(id))continue;
    if(id==='starter'&&(Date.parse(dayKey())-Date.parse(lkK().d0))/864e5>=7)continue;if(id==='night_kit'&&!lkFest())continue;a.push(id);}
  if(lkFest())a.push('hw');return a;}
// облако оплат: ответ функции vk-pay (?op=vkev отвечает JSON и с CORS) — значит, живо. На маке: ?lavka=down
function lkProbe(force){if(!PAY.v||(!force&&Date.now()-LAV.t<60000))return Promise.resolve(LAV.up);LAV.t=Date.now();
  if(PAY.test&&!VK_REAL){LAV.up=/[?&]lavka=down/.test(location.search)?0:1;return Promise.resolve(LAV.up);}
  return withTimeout(fetch(EV_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(r=>r.json()),8000)
    .then(j=>{LAV.up=j&&typeof j==='object'&&'ok' in j?1:0;},()=>{LAV.up=0;}).then(()=>{if(LAV.x)LAV.x.re();return LAV.up;});}
(function(){
const T=(r,e)=>Lg(r,e),P=PAY_ITEMS,K=lkK;
// ---------- тексты товаров ----------
const TX={
  kvas:[T('Квас воеводе Потапу','Kvass for Commander Potap'),T('+20 мин ускорения и «спасибо» в Книге благодарностей','+20 min of speed-up and a “thank you” in the Book of Thanks'),T('Потап: «Ух, ядрёный! Спасибо, воевода!» +20 мин ⏩','Potap: “Now that’s kvass! Thank you!” +20 min ⏩')],
  starter:[T('Узелок новичка','Beginner’s bundle'),T('Жар-птица на один род застав (на выбор), знамя «Воеводское» и 60 мин ускорения. Один раз','Firebird look for one kind of outpost (your choice), the “Commander’s” banner and 60 min of speed-up. Once'),T('Узелок развязан! Выбери, кому достанется Жар-птица','Bundle opened! Choose who gets the Firebird')],
  speed_box:[T('Ящик ускорения','Speed-up crate'),T('+3 часа запаса ⏩ — сверх обычного потолка в 2 часа','+3 hours of ⏩ reserve — above the usual 2-hour cap'),T('+3 часа ускорения — ящик уже в амбаре!','+3 hours of speed-up — the crate is in the barn!')],
  night_kit:[T('Набор «Ночи нечисти»','“Night of Monsters” kit'),T('Облик «Полуночный» на все заставы сразу, тыквенные фонари в деревню и знамя «Лунное». Навсегда','The “Midnight” look for all outposts at once, pumpkin lanterns for the village and the “Moon” banner. Forever'),T('Полночь пришла в деревню: фонари горят, знамя реет!','Midnight has come to the village: lanterns lit, banner flying!')],
  skins_firebird:[T('Облик «Жар-птица»','“Firebird” look'),T('Огненные перья на всех 5 родах застав. Только вид — сила та же','Fiery feathers on all 5 kinds of outposts. Looks only — same strength')]};
for(const id in TX)if(P[id]){P[id].name=TX[id][0];P[id].desc=TX[id][1];if(TX[id][2])P[id].done=TX[id][2];}
const SHELF=[[T('Угощение','Treats'),['kvas']],[T('Наборы','Kits'),['starter','speed_box','night_kit']],[T('Красота и удобство','Looks and comfort'),['skins_firebird','no_ads','speed_x2']]];
// праздничная лавка «Ночи нечисти» за золото: вещи остаются навсегда, купить — только в праздник
const FD=[{id:'lantern',n:T('Тыквенные фонари','Pumpkin lanterns'),cost:2000},{id:'scare',n:T('Пугало у ворот','Scarecrow at the gate'),cost:3000}],FB={id:'luna',n:T('Знамя «Лунное»','“Moon” banner'),cost:2500};
const FPOS={lantern:[.3,.9],scare:[.82,.88]};
function fdSync(){for(const d of FD)if(S.deco[d.id]&&!DECO.some(x=>x.id===d.id)){DECO.push({id:d.id,n:d.n,cost:d.cost,fest:1});DECO_POS[d.id]=FPOS[d.id];}}
// ---------- рисунки ----------
art('dc_lantern',48,g=>{ln(g,[-20,-14,20,-14],'#5a3a22',1.4);ln(g,[-20,-14,-20,17],'#6a4222',2.2);ln(g,[20,-14,20,17],'#6a4222',2.2);
  for(const [x,y,r] of[[-9,-2,7],[8,1,8]]){ln(g,[x,-14,x,y-r],'#5a3a22',.8);glow(g,x,y,r*2,'#ff9a2a','#fff2b0');ell(g,x,y,r*1.15,r,'#f08a1e',{lw:.8});
    ln(g,[x,y-r,x,y+r],'#c05a10',.7);ell(g,x,y-r-1,1.6,2,'#3a7a2a',{lw:.5});poly(g,[x-r*.5,y-r*.15,x-r*.2,y-r*.45,x+.1-r*.05,y-r*.1],'#ffe27a',{ol:false,flat:true});
    poly(g,[x+r*.5,y-r*.15,x+r*.2,y-r*.45,x+r*.05,y-r*.1],'#ffe27a',{ol:false,flat:true});poly(g,[x-r*.5,y+r*.25,x+r*.5,y+r*.25,x+r*.25,y+r*.55,x-r*.25,y+r*.55],'#ffe27a',{ol:false,flat:true});}
  ell(g,0,18,22,3.5,'rgba(0,0,0,.2)',{ol:false,flat:true});});
art('dc_scare',48,g=>{ell(g,0,19,12,3,'rgba(0,0,0,.2)',{ol:false,flat:true});ln(g,[0,19,0,-12],'#6a4222',2.4);ln(g,[-17,-3,17,-3],'#6a4222',2.2);
  poly(g,[-9,-4,9,-4,11,13,-11,13],'#7a5aa8',{});ln(g,[-11,13,-12,16],'#d8b048',1.2);ln(g,[0,13,0,17],'#d8b048',1.2);ln(g,[11,13,12,16],'#d8b048',1.2);
  for(const s of[-1,1]){ln(g,[s*17,-3,s*21,0],'#d8b048',1.2);ln(g,[s*17,-3,s*21,-5],'#d8b048',1.2);}
  ell(g,0,-12,7,7,'#efd9a8',{lw:.8});ell(g,-2.5,-13,1.1,1.1,'#2a1a10',{ol:false,flat:true});ell(g,2.5,-13,1.1,1.1,'#2a1a10',{ol:false,flat:true});ln(g,[-3,-9,0,-8,3,-9],'#2a1a10',.8);
  poly(g,[-11,-16,11,-16,4,-19,0,-27,-4,-19],'#3a2a1a',{});ell(g,0,-17,11,2,'#3a2a1a',{lw:.6});
  for(const [x,y] of[[-6,4],[5,8]])poly(g,[x-2,y-2,x+2,y-2,x+2,y+2,x-2,y+2],'#c0392b',{lw:.4});});
// ---------- окно «Лавка» ----------
let busyRe=0;
function ios(){return typeof PAY_IOS!=='undefined'&&!!PAY_IOS;} // rules2510: только VK на iPhone/iPad по vk_platform (не по браузеру — на Яндексе/ОК с iPhone заметки про «голоса» нет)
function days(){return Math.max(0,7-Math.floor((Date.parse(dayKey())-Date.parse(K().d0))/864e5));}
function shown(id){if(!PAY.on||LAV.ios||!PAY.item(id))return false;if(id==='starter')return days()>0||PAY.own(id);if(id==='night_kit')return lkFest()||PAY.own(id);return true;}
function gold(c,attr){return '<button class="btn gold" '+attr+' '+(S.gold<c?'disabled':'')+'><img src="'+ic('ingot',40)+'">'+fmtNum(c)+'</button>';}
function festShelf(){if(!lkFest())return '';const left=typeof FEST!=='undefined'?FEST.left('hw26'):0;
  let h='<h4>🎃 '+T('Праздничная лавка','Holiday stall')+' · '+festName()+'</h4><p class="sub">'+T('За золото. Купленное останется навсегда, а продают только в праздник','For gold. What you buy stays forever, but it’s sold only during the holiday')+(left?T(' — ещё '+left+' '+plural(left,'день','дня','дней'),' — '+left+' more day'+(left>1?'s':'')):'')+'.</p><div class="blds">';
  for(const d of FD)h+='<div class="card bld'+(S.deco[d.id]?' has':'')+'"><img src="'+ic('dc_'+d.id,112)+'" alt=""><b>'+d.n+'</b>'+(S.deco[d.id]?'<span class="tag ok">'+T('Стоит','Built')+'</span>':gold(d.cost,'data-lf="'+d.id+'"'))+'</div>';
  const b=XBN.find(x=>x.id==='luna'),own=S.bns&&S.bns.luna;
  h+='<div class="card bld'+(own?' has':'')+'"><img src="'+(b?xbnURL(b,112):'')+'" alt=""><b>'+FB.n+'</b>'+(own?'<span class="tag ok">'+T('Есть','Owned')+'</span>':gold(FB.cost,'data-lf="luna"'))+'</div>';
  return h+'</div>';}
function open(){STAT.screen('lavka');lkProbe();const closed=PAY.v&&LAV.up===0;let h='<h3>🧺 '+T('Лавка у ворот','Shop at the gate')+'</h3><p class="sub">'+T('Только вид, ускорение и удобство — сила у всех одинаковая.','Only looks, speed-up and comfort — everyone’s strength is the same.')+'</p>';
  if(closed)h+='<div class="card lkshut">🔒 <b>'+T('Лавка закрыта на переучёт — загляни позже','Closed for stocktaking — come back later')+'</b><br><span class="note">'+T('Купленное раньше никуда не денется.','Everything you bought stays with you.')+'</span></div>';
  let any=0;
  for(const [nm,ids] of SHELF){const L=ids.filter(shown);if(!L.length)continue;any=1;
    h+='<h4>'+nm+'</h4><div class="pay">'+L.map(id=>{let r=PAY.row({id});if(id==='starter'&&!PAY.own(id))r=r.replace('</small>',' · '+T('ещё '+days()+' '+plural(days(),'день','дня','дней'),days()+' more day'+(days()>1?'s':''))+'</small>');
      if(closed)r=r.replace('class="'+PAY_ROW+' pbuy"','class="'+PAY_ROW+' pbuy lkoff" disabled');return r;}).join('')+'</div>';
    if(ids[0]==='kvas'&&K().kv)h+='<p class="note">📖 '+T('Книга благодарностей: воевода Потап выпил '+K().kv+' '+plural(K().kv,'кружку','кружки','кружек')+' кваса. Спасибо!','Book of Thanks: Commander Potap has had '+K().kv+' mug'+(K().kv>1?'s':'')+' of kvass. Thank you!')+'</p>';}
  h+=festShelf();
  if(any&&ios())h+='<p class="note">'+T('На iPhone пополнить голоса в приложении бывает нельзя — пополни их на сайте vk.com, голоса общие.','On iPhone top-up may be unavailable in the app — top up on vk.com, votes are shared.')+'</p>';
  if(!any&&!lkFest())h+='<p class="note">'+T('Сегодня прилавок пуст — загляни позже.','The stall is empty today — come back later.')+'</p>';
  showModal('<div class="lkw">'+h+'</div><div class="btns"><button class="btn ghost" id="lkClose">'+T('Закрыть','Close')+'</button></div>','lavka');
  css();K().sv=lkIds().join(',');save();
  on('lkClose',()=>{hideModal();if(curTab==='Map')renderMap();});
  bindFest($('mBody'));if(PAY.on){payPl='lk';PAY.bind($('mBody'));PAY.re=open;}}
function re(){if(busyRe)return;const m=$('mBody');if($('modal').classList.contains('on')&&m&&m.getAttribute('data-w')==='lavka'){busyRe=1;try{open();}finally{busyRe=0;}}}
function bindFest(el){for(const b of el.querySelectorAll('[data-lf]'))b.onclick=()=>{const id=b.dataset.lf,isB=id==='luna',c=isB?FB.cost:FD.find(x=>x.id===id).cost;
  if(!lkFest()||S.gold<c||(isB?S.bns&&S.bns.luna:S.deco[id]))return;S.gold-=c;STAT.ev('spend',{k:(isB?'bn:':'d:')+id,c:c});
  if(isB){xbnGive('luna');S.bn='luna';}else{lkDeco(id);fdSync();}save();SND.build();toast((isB?FB.n:FD.find(x=>x.id===id).n)+T(' — красота!',' — lovely!'));setPills();
  if(el.id==='mBody'&&$('modal').classList.contains('on'))open();else renderVillage();};}
// ---------- подарок за 1-ю главу ----------
function strip(){return '<div class="lkstrip">'+DECO.slice(0,6).map((d,i)=>{const own=S.deco[d.id],op=lkDOpen(i);
  return '<span class="'+(own?'on':'')+'"><img src="'+ic('dc_'+d.id,64)+'" alt=""'+(op||own?'':' style="filter:grayscale(1) opacity(.5)"')+'><small>'+(own?(d.id==='well'&&K().gw?T('подарок','gift'):T('стоит','built')):op?fmtNum(d.cost):T('глава ','ch. ')+chNum(CH_ORDER[LAV.dch[i]]))+'</small></span>';}).join('')+'</div>';}
function gift(){if(G||K().gw!==1)return;K().gw=2;save();STAT.ev('mod',{m:'lavka',a:'gift'});
  showModal('<h3>'+T('Подарок деревни','A gift from the village')+'</h3><div class="card"><div class="row"><img class="ic" src="'+ic('voevoda',112)+'" alt=""><div class="t"><b>'+T('Воевода Потап','Commander Potap')+'</b><span>'+
    T('Отстояли заставу! Вся деревня скинулась — держи колодец-журавль. Вода свежая, нечисти не наливать.','We held the outpost! The whole village chipped in — here’s a sweep well. Fresh water, none for the monsters.')+'</span></div></div></div>'+
    '<div class="lkgw"><img src="'+ic('dc_well',112)+'" alt=""><b>'+T('Колодец-журавль уже стоит в твоей деревне','The sweep well already stands in your village')+'</b></div>'+
    '<p class="sub" data-fit="2">'+T('Каждая освобождённая земля открывает новое украшение — за золото, только для красоты.','Each freed land unlocks another decoration — for gold, just for beauty.')+'</p>'+strip()+
    '<div class="btns"><button class="btn" id="lkVil">'+T('Посмотреть деревню','See the village')+'</button><button class="btn ghost" id="lkOk">'+T('Хорошо','OK')+'</button></div>','lkgift');
  css();on('lkVil',()=>{hideModal();openTab('Village');});on('lkOk',()=>hideModal());}
// ---------- узелок: Жар-птица на один род ----------
function pick(){if(G||!K().sf||$('modal').classList.contains('on')&&$('mBody').getAttribute('data-w')==='lkpick')return;
  showModal('<h3>🔥 '+T('Кому Жар-птицу?','Who gets the Firebird?')+'</h3><p class="sub">'+T('Огненные перья достанутся всем заставам одного рода. Только вид — сила та же.','All outposts of one kind get the fiery feathers. Looks only — same strength.')+'</p><div class="blds">'+
    TW_ORDER.map(t=>'<button class="card bld pv" data-lp="'+t+'"><img src="'+ic('ti_'+t+'_3~firebird',112)+'" alt=""><b>'+TW[t].n+'</b></button>').join('')+'</div>','lkpick');
  for(const b of $('mBody').querySelectorAll('[data-lp]'))b.onclick=()=>{const t=b.dataset.lp;SND.up();S.skins[t+'.firebird']=1;S.skin[t]='firebird';K().sf=0;save();hideModal();toast(TW[t].n+T(': облик «Жар-птица»!',': “Firebird” look!'));if(curTab==='Village')renderVillage();};}
// ---------- украшения в деревне: по главам ----------
function cos(){fdSync();let h=fbCard()+'<h2>'+T('Украшения деревни','Village decorations')+'</h2><p class="sub">'+T('Только для красоты — видно на картинке деревни. Каждая освобождённая земля открывает новое.','Just for beauty — you’ll see them in the village picture. Each freed land unlocks a new one.')+'</p><div class="blds">';
  DECO.slice(0,6).forEach((d,i)=>{const has=S.deco[d.id],op=lkDOpen(i),c=CH_ORDER[LAV.dch[i]];
    h+='<div class="card bld'+(has?' has':'')+'" data-lkd="'+d.id+'"><img src="'+ic('dc_'+d.id,112)+'" alt=""'+(has||op?'':' style="filter:grayscale(1) opacity(.5)"')+'><b>'+d.n+'</b>'+
      (has?'<span class="tag ok">'+T('Стоит','Built')+'</span>':op?gold(d.cost,'data-lk="'+d.id+'"'):'<span class="note">'+T('🔒 Освободи «'+CH[c].name+'»','🔒 Free “'+CH[c].name+'”')+'</span>')+'</div>';});
  for(const d of FD)if(S.deco[d.id])h+='<div class="card bld has"><img src="'+ic('dc_'+d.id,112)+'" alt=""><b>'+d.n+'</b><span class="tag ok">'+T('Стоит','Built')+'</span></div>';
  h+='</div>';
  if(lkFest())h+=festShelf();
  if(!vilDone())h+='<p class="note">'+T('Облик «Золочёный» за золото откроется, когда деревня будет отстроена.','The “Gilded” look for gold unlocks once the village is fully built.')+'</p>';
  return h+skinsHTML();}
function vil(el){for(const b of el.querySelectorAll('[data-lk]'))b.onclick=()=>{const i=DECO.findIndex(x=>x.id===b.dataset.lk),d=DECO[i];if(!d||S.deco[d.id]||!lkDOpen(i)||S.gold<d.cost)return;
    S.gold-=d.cost;STAT.ev('spend',{k:'d:'+d.id,c:d.cost});lkDeco(d.id);if(S.goal==='d:'+d.id)S.goal='';save();SND.build();toast(d.n+T(' — красота!',' — lovely!'));renderVillage();setPills();};
  bindFest(el);}
function css(){if($('lkCss2'))return;const s=document.createElement('style');s.id='lkCss2';
  s.textContent='.lkw h4{margin:12px 0 4px;font-size:17px;color:var(--ink,#3a2a1a)}.lkw .pay{margin:0}.lkw .prow{width:100%;margin:0 0 6px}.prow.lkoff{opacity:.55;filter:grayscale(.6)}.lkshut{text-align:center;border-color:#a82c17}'+
  '.lkstrip{display:flex;flex-wrap:wrap;justify-content:center;margin:2px 0 6px}.lkstrip span{width:46px;margin:0 1px;text-align:center;font-size:12px;line-height:1.1}.lkstrip img{width:40px;height:40px;display:block;margin:0 auto}.lkgw{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:16px}.lkgw img{width:64px;height:64px;flex:0 0 64px}.lkstrip span.on small{color:var(--cOk,#2f7a2a);font-weight:700}';
  document.head.appendChild(s);}
// iPhone: VK не дал заплатить (не отказ игрока) — прячем лавку до конца захода
if(PAY.v&&PAY.v.order&&ios()){const o0=PAY.v.order;PAY.v.order=function(){return Promise.resolve(o0.apply(PAY.v,arguments)).catch(e=>{if(typeof payWhy==='function'&&payWhy(e)==='fail'){LAV.ios=1;setTimeout(()=>{hideModal();if(curTab==='Map'&&!G)renderMap();},50);}throw e;});};}
// со старта (заглушка лёгкая): знамёна-награды, украшения в «Цели», переучёт при покупке из любых мест
if(typeof xbnAdd==='function'){xbnAdd({id:'voev',n:'Знамя «Воеводское»',en:'“Commander’s” banner',c1:'#8a1616',c2:'#ffd84a',em:[7,.5]});xbnAdd({id:'luna',n:'Знамя «Лунное»',en:'“Moon” banner',c1:'#1f2a5c',c2:'#ffe9a0',em:[0,1]});}
{const g0=goalList;goalList=function(){const a=g0();DECO.forEach((d,i)=>{if(i<6&&lkDOpen(i)&&!S.deco[d.id])a.push({id:'d:'+d.id,n:d.n,c:d.cost,img:ic('dc_'+d.id,64)});});return a;};}
{const r0=renderGoal;renderGoal=function(){r0();const t=S.wins?goalNow():null;if(t&&t.id[0]==='d')on('glGo',()=>{openTab('Village');const e=document.querySelector('[data-lkd="'+t.id.slice(2)+'"]');if(e)e.scrollIntoView({block:'center'});});};}
{const b0=PAY.buy;PAY.buy=function(){if(PAY.v&&LAV.up===0){toast(Lg('Лавка закрыта на переучёт — загляни позже','Closed for stocktaking — come back later'));if(LAV.x)lkProbe(1);return Promise.resolve();}return b0.apply(PAY,arguments);};}
if(PAY.v)lkProbe();if(curTab==='Map'&&!G)renderGoal();
OB2.slot('vil','lavka',vil);
fdSync();
LAV.x={map:lkMap,open:open,re:re,gift:gift,pick:pick,cos:cos,fd:FD};
})();
