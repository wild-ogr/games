'use strict';
/* ================= zb-season — четверти и каникулы: дорожка из 30 ступеней + «Абонемент в библиотеку» (поток SCHOOL) =================
   Сезоны по датам (весь год без дыр, каждый — до начала следующего): «Снова в школу» с 01.09 · «Осенние каникулы» с 26.10 · «Новогодний утренник»
   с 15.12 · «Зимние каникулы» с 15.01 · «8 Марта» с 01.03 · «Последний звонок» с 16.05 · «Летние каникулы» с 16.06.
   Начала праздничных сезонов берём у FEST (FESTZB.quarters: осенние каникулы osk*, утренник zk*, 8 Марта mar*, звонок zv* − 9 дней).
   Очки четверти: уровень впервые +2, повтор/задание дня +1, «5» в дневник +10. Ступень — каждые CFG.step очков (ZBECO.school.season.step главнее).
   Бесплатная дорожка полная (монеты, 💡, открытки сезона, медаль). «Абонемент в библиотеку» (товар abon, 15 гол., 30 дней) — только красота
   сверху: наклейки в дневник, золотая рамка открыток, табличка на парту, цветы на окне класса, ленточка на портфель, медаль сезона;
   купил в любой день — прошлые ступени сразу. Наружу ZBSEA: cur(), has(id) (id: stickers|frame|plate|flowers|ribbon|medal — у текущего
   сезона или навсегда полученное «<сезон>:<id>»), open(), buy(). Выключить: CFG.on=false.
   Поле S.qt {k (сезон+год), p (очки), s (выдано бесплатных ступеней), pa (выдано платных), a (день покупки абонемента), own {id:1}, h {k: ступеней}}. */
(function(){
var CFG={on:true,step:15,steps:30,abonDays:30,pts:{first:2,lvl:1,five:10}};
// сезон идёт от своего начала до начала следующего; начала праздничных сезонов — из таблицы FEST (FESTZB.quarters), если она есть
var SEAS=[
  {id:'zima',n:'Зимние каникулы',ic:'⛄',a:115,c:'#6aa7d8'},
  {id:'mart',n:'8 Марта',ic:'🌷',a:301,c:'#d65a8c',fq:'mar'},
  {id:'zvon',n:'Последний звонок',ic:'🔔',a:516,c:'#34a853',fq:'zv',lead:9},
  {id:'leto',n:'Летние каникулы',ic:'☀️',a:616,c:'#f5b72d'},
  {id:'sent',n:'Снова в школу',ic:'📚',a:901,c:'#e9a23b'},
  {id:'osen',n:'Осенние каникулы',ic:'🍂',a:1026,c:'#d9792b',fq:'osk'},
  {id:'ny',n:'Новогодний утренник',ic:'🎄',a:1215,c:'#2f6fd6',fq:'zk'}];
var PAID=[{s:5,id:'stickers',n:'Наклейки в дневник'},{s:10,id:'frame',n:'Золотая рамка открыток'},{s:15,id:'plate',n:'Табличка «Отличник четверти» на парту'},
  {s:20,id:'flowers',n:'Цветы на окне класса'},{s:25,id:'ribbon',n:'Ленточка на портфель'},{s:30,id:'medal',n:'Медаль четверти'}];
window.ZBSEA_CFG=CFG;
if(window.ZB_OFF&&ZB_OFF.school)CFG.on=false; // общий выключатель школы: window.ZB_OFF={school:1} до загрузки
if(!CFG.on||typeof ZB==='undefined')return;
function E(){var z=window.ZBECO,e=z&&(z.school||z.sc);return e&&e.season||{};}
function give(src,n,why){n=Math.floor(+n||0);if(n<=0)return 0;try{if(window.ZBECO&&typeof ZBECO.give==='function')return ZBECO.give(src,n,why);}catch(e){}try{addCoins(n,why||'quest');}catch(e){}return n;}
function stepPts(){return num(E().step)||CFG.step;}
function num(x){x=+x;return isFinite(x)&&x>0?x:0;}
function isO(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function dk(){try{return todayKey();}catch(e){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}}
function dnum(k){return Math.round(Date.UTC(Math.floor(k/10000),Math.floor(k/100)%100-1,k%100)/864e5);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function coin(){try{return COIN_I;}catch(e){return '💰';}}
function pl(n,a,b,c){try{return plural(n,a,b,c);}catch(e){return c;}}
function ymd(t){var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(t||''));return m?+m[1]*10000+ +m[2]*100+ +m[3]:0;}
// начало сезона s в году Y: FEST (FESTZB.quarters: id с префиксом s.fq и годом) − s.lead дней; иначе s.a
function startOf(s,Y){try{if(s.fq&&window.FESTZB&&Array.isArray(FESTZB.quarters))for(var i=0;i<FESTZB.quarters.length;i++){var q=FESTZB.quarters[i],f=ymd(q.from);
    if(String(q.id).indexOf(s.fq)===0&&Math.floor(f/10000)===Y){if(s.lead){var d=new Date(Y,Math.floor(f/100)%100-1,f%100-s.lead,12);f=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}return f;}}}catch(e){}
  return Y*10000+s.a;}
// текущий сезон: {s, key, from, to (ключи дней), left (дней до конца)}
function cur(k){k=k||dk();var y=Math.floor(k/10000),L=[];
  for(var Y=y-1;Y<=y+1;Y++)SEAS.forEach(function(s){L.push({s:s,from:startOf(s,Y),Y:Y});});
  L.sort(function(a,b){return a.from-b.from;});var i=0;while(i+1<L.length&&L[i+1].from<=k)i++;
  var x=L[i],nx=L[i+1],e=new Date(Math.floor(nx.from/10000),Math.floor(nx.from/100)%100-1,nx.from%100-1,12),to=e.getFullYear()*10000+(e.getMonth()+1)*100+e.getDate();
  return {s:x.s,key:x.s.id+Math.floor(x.from/10000),from:x.from,to:to,left:Math.max(0,dnum(to)-dnum(k))};}
// бесплатная дорожка: всего монет/💡 — ZBECO.school.season.free {c, hb} (запас 300/3): ступени 10/20/30 — открытка и 20 💰, 💡 — на 5/15/25…, остальное поровну
function freeTot(){var f=E().free||{};return {c:num(f.c)||300,hb:f.hb!=null?num(f.hb):3};}
function free(i){var T=freeTot(),big=20;if(i%10===0)return {c:big,hb:0,card:i/10};
  if(i%5===0){var k=(i+5)/10;return {c:0,hb:k<=T.hb?1:0};}return {c:Math.max(0,Math.floor((T.c-3*big)/24)),hb:0};}
function freeTxt(r){var a=[];if(r.c)a.push('+'+r.c+' '+coin());if(r.hb)a.push('💡 +'+r.hb);if(r.card)a.push('🖼 открытка');return a.join(' ');}

/* ---------- сохранение ---------- */
function fix(s){s=s||S;var c=cur();if(!isO(s.qt))s.qt={k:c.key,p:0,s:0,pa:0,a:0,own:{},h:{}};var q=s.qt;
  if(!isO(q.own))q.own={};if(!isO(q.h))q.h={};q.p=num(q.p);q.s=Math.floor(num(q.s));q.pa=Math.floor(num(q.pa));q.a=num(q.a);
  if(q.k!==c.key){if(q.k)q.h[q.k]=q.s;q.k=c.key;q.p=0;q.s=0;q.pa=0;}}
function merge(s,d){fix(s);if(!d||!isO(d.qt))return;var a=s.qt,b=d.qt;a.a=Math.max(a.a,num(b.a));
  if(isO(b.own))for(var k in b.own)if(b.own[k])a.own[k]=1;
  if(isO(b.h))for(var j in b.h)a.h[j]=Math.max(num(a.h[j]),num(b.h[j]));
  if(b.k===a.k){a.p=Math.max(a.p,num(b.p));a.s=Math.max(a.s,Math.floor(num(b.s)));a.pa=Math.max(a.pa,Math.floor(num(b.pa)));}
  else if(b.k)a.h[b.k]=Math.max(num(a.h[b.k]),Math.floor(num(b.s)));}
ZB.onSave({id:'season',keys:['qt'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});
function q(){fix();return S.qt;}
function steps(){return Math.min(CFG.steps,Math.floor(q().p/stepPts()));}
// Абонемент ведёт ECO (ZBECO.abonOn/abonTo, S.ecAb); без ECO — своя дата S.qt.a (запас)
function eco(){return window.ZBECO&&typeof ZBECO.abonOn==='function';}
function abon(){if(eco())return !!ZB.safe('abonOn',function(){return ZBECO.abonOn();});var a=q().a;return !!a&&dnum(dk())-dnum(a)<CFG.abonDays;}
function abonLeft(){if(eco()){var to=+ZB.safe('abonTo',function(){return ZBECO.abonTo();})||0,n=0;try{n=nowMs();}catch(e){n=Date.now();}return Math.max(0,Math.ceil((to-n)/864e5));}
  var a=q().a;return a?Math.max(0,CFG.abonDays-(dnum(dk())-dnum(a))):0;}
function has(id){var Q=q();if(Q.own[Q.k+':'+id])return true;if(id.indexOf(':')>0)return !!Q.own[id];return false;}

/* ---------- очки и выдача ---------- */
var news=[];
function addPts(n,why){if(!(n>0))return;var Q=q();if(lv()<3)return;Q.p+=n;grant();}
function lv(){try{return num(S.lv);}catch(e){return 0;}}
function grant(){var Q=q(),st=steps(),got=[];
  while(Q.s<st){Q.s++;var r=free(Q.s);if(r.c)give('season',r.c,'quest');if(r.hb)try{hbAdd(r.hb,'ss');}catch(e){}
    if(r.card)Q.own[Q.k+':card'+r.card]=1;got.push({i:Q.s,t:freeTxt(r)});try{STAT.ev('ss',{s:Q.s,a:abon()?1:0});}catch(e){}}
  if(abon())while(Q.pa<st){Q.pa++;PAID.forEach(function(x){if(x.s===Q.pa){Q.own[Q.k+':'+x.id]=1;got.push({i:Q.pa,t:'🎟 '+x.n,paid:1});}});}
  if(got.length){news.push.apply(news,got);try{save();}catch(e){}}
  return got;}
ZB.levelHook.push(function(o){if(!o||!o.ok)return;var P=CFG.pts;addPts(o.first&&!o.daily?P.first:P.lvl,'lvl');});
ZB.on('five',function(){addPts(CFG.pts.five,'five');});
// покупка абонемента (PAY_ITEMS.abon от ECO: give → сюда; прошлые ступени — сразу)
function bought(){var Q=q();if(!eco())Q.a=dk();try{STAT.ev('ss',{a:'buy',s:steps()});}catch(e){}var g=grant();try{save();cloudSoon();}catch(e){}
  try{toast('🎟 Абонемент в библиотеку на '+CFG.abonDays+' дней!'+(g.length?' Получено: '+g.filter(function(x){return x.paid;}).length:''));}catch(e){}
  refresh();}
function canBuy(){try{return !OK&&PAY.on&&!!PAY_ITEMS.abon&&!!PAY.item('abon');}catch(e){return false;}}
function buy(){if(!canBuy())return false;try{PAY.re=function(){open();};PAY.buy('abon');}catch(e){return false;}return true;}
ZB.on('ready',function(){try{if(!eco()&&typeof PAY_ITEMS!=='undefined'&&PAY_ITEMS.abon&&!PAY_ITEMS.abon.give)PAY_ITEMS.abon.give=bought;}catch(e){}fix();grant();});
ZB.on('abon',function(){bought();});

/* ---------- экран четверти ---------- */
function dm(k){var M=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];return (k%100)+' '+M[Math.floor(k/100)%100-1];}
function render(el){var c=cur(),Q=q(),st=steps(),sp=stepPts(),into=Q.p-st*sp,h='';
  for(var i=1;i<=CFG.steps;i++){var r=free(i),pd=PAID.filter(function(x){return x.s===i;})[0],done=st>=i;
    h+='<div class="sq-st'+(done?' done':'')+(i===st+1?' now':'')+'"><span class="sq-n">'+i+'</span><span class="sq-f">'+freeTxt(r)+'</span>'+
      (pd?'<span class="sq-p'+(has(pd.id)?' got':'')+'">🎟 '+esc(pd.n)+'</span>':'<span class="sq-p empty"></span>')+'</div>';}
  var ab=abon();
  el.innerHTML='<div class="sc-scr"><div class="sq-head" style="--sq:'+c.s.c+'"><span class="sq-ic">'+c.s.ic+'</span><span><small>ЧЕТВЕРТЬ · '+dm(c.from)+' — '+dm(c.to)+'</small><b>'+esc(c.s.n)+'</b>'+
    '<em>ступень '+st+' из '+CFG.steps+' · ещё '+c.left+' '+pl(c.left,'день','дня','дней')+'</em></span></div>'+
    (st<CFG.steps?'<div class="sq-bar"><i style="width:'+Math.round(100*into/sp)+'%"></i><span>до ступени '+(st+1)+': '+(sp-into)+' '+pl(sp-into,'очко','очка','очков')+'</span></div>':'<p class="sc-mut">Вся дорожка пройдена — медаль твоя!</p>')+
    '<p class="sc-mut">Очки: уровень +'+CFG.pts.first+', повтор и урок дня +'+CFG.pts.lvl+', «5» в дневник +'+CFG.pts.five+'.</p>'+
    '<div class="sq-ab'+(ab?' on':'')+'"><b>🎟 Абонемент в библиотеку</b><small>'+(ab?'действует ещё '+abonLeft()+' '+pl(abonLeft(),'день','дня','дней')+' — красота сверху твоя':'только красота сверху: наклейки, рамка открыток, табличка, цветы, ленточка, медаль. Прошлые ступени — сразу')+'</small>'+
    (!ab&&canBuy()?'<div class="sq-buy">'+ZB.safe('abon-html',function(){return PAY.html(['abon']);})+'</div>':'')+'</div>'+
    '<div class="sq-cols"><span>Всем</span><span>С абонементом</span></div><div class="sq-list">'+h+'</div>'+
    '<div class="btns"><button type="button" class="btn blue" id="sqBack">← Назад</button></div></div>';
  try{if(!ab&&canBuy())PAY.bind(el);}catch(e){}
  el.querySelector('#sqBack').onclick=function(){try{SND.tap();}catch(e){}if(ZB._scr.home)ZB.go('home');else try{openMenu();}catch(e){}};
  var now=el.querySelector('.sq-st.now');if(now&&now.scrollIntoView)try{now.scrollIntoView({block:'center'});}catch(e){}}
ZB.screen('season',{title:'Четверть',render:render});
function open(){fix();grant();try{STAT.screen('season');}catch(e){}ZB.go('season');}
function refresh(){try{var on=document.querySelector('.screen.on');if(on&&on.id==='zb-season')render(on);}catch(e){}}

/* ---------- главный: полоса четверти (зона top) и окно победы (зона extra) ---------- */
ZB.add(ZB.homeSlots,{id:'sc-season',order:30,zone:'top',render:function(){if(lv()<3)return '';var c=cur(),st=steps(),sp=stepPts(),into=q().p-st*sp;
  return '<button type="button" class="sq-strip" style="--sq:'+c.s.c+'"><span class="sq-ic">'+c.s.ic+'</span><span class="sq-sb"><b>'+esc(c.s.n)+'</b>'+
    '<i class="sc-pb"><b style="width:'+(st>=CFG.steps?100:Math.round(100*into/sp))+'%"></b></i></span><span class="sq-sn">'+st+'<small>/'+CFG.steps+'</small></span></button>';},
  mount:function(el){var b=el.querySelector('.sq-strip');if(b)b.onclick=function(){try{SND.tap();}catch(e){}open();};}});
ZB.add(ZB.winSlots,{id:'sc-season',order:40,zone:'extra',fit:1,render:function(){var nn=news.splice(0);if(!nn.length)return '';var c=cur(),last=nn[nn.length-1];
  return '<p class="goal sq-win">'+c.s.ic+' Ступень '+last.i+' четверти: '+nn.map(function(x){return x.t;}).join(' · ')+'</p>';}});

window.ZBSEA={CFG:CFG,SEAS:SEAS,PAID:PAID,cur:cur,steps:steps,has:has,abon:abon,open:open,buy:buy,bought:bought,addPts:addPts,free:free,
  fix:function(){fix();},prg:function(){return {ss:steps(),ab:abon()?1:0};}};
})();
