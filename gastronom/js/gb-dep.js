'use strict';
/* ================= gb-dep — 10 отделов работают: что даёт каждый, стеклотара, газировка, экран «Отделы» (поток META) =================
   Данные и покупка — GBM (gb-meta.js): GBM.dep(id), GBM.depList(), GBM.depBuy(id). Рисунки отделов — ART (GBART.dep), зал — VIEW.
   Выключатель: GB.flag('dep') — отделы не работают и не показываются (данные не трогаем).
   ЧТО ДАЮТ (числа — GBECO.dep/glass, здесь запасные; 04-meta-economy §2 А):
     bakaleya ур.3 — «Смешать» даром раз в день; moloko ур.2 — «Столик» даром раз в 2 дня, ур.3 — каждый день (обёртка useBoost);
     hleb — утренний завоз: первый пройденный уровень дня +30/40/50 % монет; steklo — копит 2/3/4 💰 в час, потолок 12 ч («Бутылки сдали!»);
     gastro — дефицит дня (дело плана) +20/35/50 💰; konditer — торт к авоське +15/30 (gb-plan) и сезонные карточки (альбом);
     ovoshi — затеи с картошкой (MG0 читает GBM.dep('ovoshi')); soki — автомат газировки 10/15/20 💰 раз в день; ryba — «Рыбный четверг» (MODE);
     zakaz — заказ соседа (дело плана) +10/20/30 💰.
   API: GBDEP.open(id?) — экран «Отделы» (из зала VIEW: нажатие на отдел); GBDEP.glass() → {c монет накопилось, h часов, cap}; GBDEP.takeGlass();
        GBDEP.soda() → монет газировки сегодня (0 — нет/взято); GBDEP.takeSoda(); GBDEP.goal() → ближайший ремонт {id, n, lv, price, have}.
   Поля: S.mtG (время последней сдачи стеклотары, мс), в S.dp.n: fm (смешать даром взято), ft (столик), hb (утренний завоз), gd (бонус дефицита),
        zk (бонус заказа), sd (газировка) — день сбрасывает gb-plan. S.mtTb — день последнего даром-столика (раз в 2 дня). */
(function(){
if(typeof GB==='undefined'||!window.GBM||!window.GBPL)return;
var ON=GB.flag('dep')&&GBM.on;
var M=GBM,num=M.num,isO=M.isO,R=M.R,esc=M.esc,pl=M.pl,E=M.E,dk=M.dk,stat=M.stat;
function S_(){return typeof S!=='undefined'?S:null;}
function sv(){try{save();}catch(e){}}
function tap(){try{SND.tap();}catch(e){}}
function now(){try{return nowMs();}catch(e){return Date.now();}}
function dp(){var s=S_();GBPL.fix();return s.dp;}
function dn(k){return num(dp().n[k]);}
function setN(k,v){dp().n[k]=v;sv();}
function arr(path,def){var a=E(path,null);return Array.isArray(a)&&a.length>=3?a:def;}
function give(src,n,why){n=Math.floor(+n||0);if(n<=0)return 0;try{if(window.GBECO&&typeof GBECO.give==='function')return GBECO.give(src,n)||n;}catch(e){}
  try{setCoins(S.coins+ern(src,n));}catch(e){}return n;}

/* ---------- сохранение (стеклотара) ---------- */
function fix(s){s=s||S_();if(!s)return;s.mtG=num(s.mtG);s.mtTb=num(s.mtTb);}
function merge(s,d){fix(s);if(!d)return;s.mtG=Math.max(s.mtG,num(d.mtG));s.mtTb=Math.max(s.mtTb,num(d.mtTb));}
GB.onSave({id:'dep',keys:['mtG','mtTb'],fix:function(s){fix(s);},merge:function(s,d){merge(s,d);}});

/* ---------- стеклотара ---------- */
function glassRate(){var lv=M.dep('steklo');if(!lv)return 0;var h=E('glass.h',null);return Array.isArray(h)?num(h[lv-1]):[2,3,4][lv-1];}
function glassCap(){return num(E('glass.cap',0))||12;}
function glass(){var s=S_(),r=glassRate();if(!ON||!r||!s)return {c:0,h:0,cap:glassCap(),r:0};if(!s.mtG){s.mtG=now();sv();}
  var h=Math.max(0,Math.min(glassCap(),(now()-s.mtG)/36e5));return {c:Math.floor(h*r),h:h,cap:glassCap(),r:r};}
function takeGlass(el){var g=glass(),s=S_();if(g.c<1)return 0;s.mtG=now();var c=give('glass',g.c);stat('glass',{h:Math.round(g.h),c:c,lv:M.dep('steklo')});
  try{SND.coin();}catch(e){}sv();try{cloudSoon();}catch(e){}GB.emit('glass',c);return c;}
// куплен отдел стеклотары — отсчёт с этой минуты
GB.on('dep',function(x){if(x&&x.id==='steklo'&&x.lv===1){var s=S_();s.mtG=now();sv();}});

/* ---------- газировка ---------- */
function soda(){if(!ON)return 0;var lv=M.dep('soki');if(!lv||dn('sd'))return 0;return num(arr('dep.soki',[10,15,20])[lv-1]);}
function takeSoda(){var c=soda();if(!c)return 0;setN('sd',1);c=give('dep',c);stat('dep',{id:'soki',a:'take',c:c});try{SND.coin();}catch(e){}return c;}

/* ---------- бустеры даром: Бакалея — «Смешать», Молочный — «Столик» ---------- */
function freeOf(k){if(!ON)return false;var g=null;try{g=G;}catch(e){}if(!g||g.over)return false;
  if(k==='mix')return M.dep('bakaleya')>=3&&!dn('fm');
  if(k==='table'){var lv=M.dep('moloko');if(lv<2||dn('ft'))return false;if(lv>=3)return true;var s=S_(),t=M.dnum(dk());return !s.mtTb||t-M.dnum(s.mtTb)>=2;}
  return false;}
function useFree(k){if(k==='mix')setN('fm',1);if(k==='table'){setN('ft',1);var s=S_();s.mtTb=dk();sv();}stat('dep',{id:k==='mix'?'bakaleya':'moloko',a:'free'});}
GB.on('ready',function(){if(!ON)return;
  if(typeof window.useBoost==='function'&&!window.useBoost.gbDep){var ub=window.useBoost;window.useBoost=function(k){
    if((k==='mix'||k==='table')&&freeOf(k)){var ok=k==='mix'?canMix():!G.table;
      if(ok){try{STAT.use(k);}catch(e){}if(k==='mix'){G.nMix=(G.nMix||0)+1;doMix();}else{G.nTable=(G.nTable||0)+1;doTable();}useFree(k);
        try{toast(R(k==='mix'?'Бакалея угощает: «Смешать» даром!':'Молочный отдел: «Столик» даром!'));}catch(e){}try{updCoins();}catch(e){}return;}}
    return ub.apply(this,arguments);};window.useBoost.gbDep=1;}
  if(typeof window.updCoins==='function'&&!window.updCoins.gbDep){var uc=window.updCoins;window.updCoins=function(){var r=uc.apply(this,arguments);
    GB.safe('dep-lbl',function(){[['pMix','mix'],['pTable','table']].forEach(function(x){if(freeOf(x[1])){var e=document.getElementById(x[0]);if(e)e.textContent=FREE();}});});return r;};window.updCoins.gbDep=1;}});

/* ---------- утренний завоз, бонусы дефицита и заказа ---------- */
var winNews=[];
GB.levelHook.push(function(o){if(!ON||!o||o.r!=='win')return;
  var lv=M.dep('hleb');if(lv&&!o.daily&&!o.mode&&!dn('hb')){var k=num(arr('dep.hlebK',[.3,.4,.5])[lv-1]);
    var base=(2*(o.st||1)+Math.ceil((o.served||0)/2))*(o.boss?2:1),c=Math.max(1,Math.round(base*k));setN('hb',1);c=give('dep',c);
    winNews.push({ic:'🍞',t:R('Утренний завоз')+': +'+c+' 💰'});stat('dep',{id:'hleb',a:'bonus',c:c});}});
GB.on('plan',function(x){if(!ON||!x)return;var id=x.id,lv;
  if(id==='deficit'&&(lv=M.dep('gastro'))&&!dn('gd')){setN('gd',1);var c=give('dep',num(arr('dep.gastroB',[20,35,50])[lv-1]));winNews.push({ic:'🧀',t:R('Гастрономия: дефицит дня')+' +'+c+' 💰'});}
  if(id==='order'&&(lv=M.dep('zakaz'))&&!dn('zk')){setN('zk',1);var z=give('dep',num(arr('dep.zakazB',[10,20,30])[lv-1]));winNews.push({ic:'📦',t:R('Стол заказов: заказ соседа')+' +'+z+' 💰'});
    stat('ord',{c:z,lv:lv});}});
GB.add(GB.winSlots,{id:'mt-depnews',order:30,zone:'extra',fit:2,render:function(){var L=winNews.splice(0).filter(function(x){return x.t;});if(!L.length)return '';
  return L.map(function(x){return '<p class="mt-wl">'+x.ic+' '+esc(x.t)+'</p>';}).join('');}});

/* ---------- ближайший ремонт (цель в «Кассе» и на главном) ---------- */
function goal(){if(!ON)return null;var s=S_(),L=M.depList().filter(function(d){return d.open&&d.lv<3;});if(!L.length)return null;
  L.sort(function(a,b){return a.price-b.price;});var d=L[0];return {id:d.id,n:d.n,ic:d.ic,lv:d.lv,price:d.price,have:+s.coins||0,next:d.next};}
function stars(lv){var h='';for(var i=1;i<=3;i++)h+=i<=lv?'★':'☆';return h;}
GB.add(GB.winSlots,{id:'mt-dep',order:20,zone:'goal',fit:4,render:function(ctx){if(ctx&&ctx.daily)return '';var g=goal();if(!g||!R('Ремонт'))return '';
  var pc=Math.min(100,Math.round(100*g.have/Math.max(1,g.price))),ok=g.have>=g.price;
  return '<div class="mt-wgoal'+(ok?' ok':'')+'"><span class="mt-wgi">'+g.ic+'</span><span class="mt-wgb"><b>'+esc(g.lv?(ok?R('Хватает на ремонт'):R('До ремонта')):(ok?R('Хватает на открытие'):R('До открытия')))+' «'+esc(g.n)+'» '+stars(g.lv+1)+'</b>'+
    '<i class="mt-pb"><b style="width:'+pc+'%"></b></i><small>'+Math.min(g.have,g.price)+' / '+g.price+' 💰</small></span></div>';}});

/* ---------- главный: зона hall — стеклотара, газировка, ремонт ---------- */
GB.add(GB.homeSlots,{id:'mt-dep',order:20,zone:'hall',render:function(){if(!ON||M.rank()<1&&!M.depList().some(function(d){return d.lv>0;}))return '';
  var h='',g=glass(),sd=soda(),gl=goal();
  if(g.c>=1)h+='<button type="button" class="mt-pill hot" data-a="glass">🍾 '+esc(R('Бутылки сдали — заберите'))+' +'+g.c+' 💰</button>';
  else if(g.r)h+='<span class="mt-pill off">🍾 '+esc(R('Стеклотара копится'))+'</span>';
  if(sd)h+='<button type="button" class="mt-pill hot" data-a="soda">🧃 '+esc(R('Газировка'))+' +'+sd+' 💰</button>';
  if(gl)h+='<button type="button" class="mt-pill'+(gl.have>=gl.price?' hot':'')+'" data-a="dep">🔨 '+esc(gl.lv?R('Ремонт'):R('Открыть'))+' «'+esc(gl.n)+'» · '+gl.price+' 💰</button>';
  else h+='<button type="button" class="mt-pill" data-a="dep">🏬 '+esc(R('Отделы'))+'</button>';
  return h?'<div class="mt-hall">'+h+'</div>':'';},
  mount:function(el){var b=el.querySelectorAll('[data-a]');for(var i=0;i<b.length;i++)b[i].onclick=function(){tap();var a=this.getAttribute('data-a');
    if(a==='glass'){var c=takeGlass(this);if(c)try{toast(R('Михалыч помог сдать бутылки:')+' +'+c+' 💰');}catch(e){}GB.refresh();}
    else if(a==='soda'){var s=takeSoda();if(s)try{toast(R('Стакан газировки — за счёт заведения:')+' +'+s+' 💰');}catch(e){}GB.refresh();}
    else open();};}});

/* ---------- «Ремонт отдела» (покупка «Торга» 7 голосов, ECO: жетон GBECO.remontLeft()/remontTake()) ----------
   Ремонт «как в столичном гастрономе» — вид отдела как у образцового (GBM.look(id) → 3), отдача — по уровню. Поле S.mtRm — биты отделов (облако: ИЛИ).
   Не сгорает при открытии филиала (куплено за голоса). */
function rmBits(){var s=S_();return s?Math.floor(num(s.mtRm)):0;}
function remonted(id){var i=M.DEPS.map(function(d){return d.id;}).indexOf(id);return i>=0&&!!(rmBits()&(1<<i));}
function canRemont(){return ON&&M.depList().some(function(d){return d.lv>=1&&!remonted(d.id);});}
function remontLeft(){try{return window.GBECO&&GBECO.remontLeft?num(GBECO.remontLeft()):0;}catch(e){return 0;}}
function remont(id){var s=S_(),i=M.DEPS.map(function(d){return d.id;}).indexOf(id);if(!ON||!s||i<0||M.dep(id)<1||remonted(id)||remontLeft()<1)return false;
  var ok=false;try{ok=GBECO.remontTake()!==false;}catch(e){}if(!ok)return false;s.mtRm=rmBits()|(1<<i);sv();try{cloudSoon();}catch(e){}
  M.stat('dep',{id:id,a:'remont'});GB.emit('dep',{id:id,lv:M.dep(id),a:'remont'});return true;}
function look(id){var lv=M.dep(id);return lv>=1&&remonted(id)?3:lv;}
GB.onSave({id:'remont',keys:['mtRm'],fix:function(s){s.mtRm=Math.floor(num(s.mtRm));},merge:function(s,d){s.mtRm=Math.floor(num(s.mtRm))|Math.floor(num(d&&d.mtRm));}});
// купили «Ремонт» в «Торге» — сразу на экран отделов
GB.on('remont',function(){if(ON&&canRemont())open();});

/* ---------- экран «Отделы» ---------- */
function rankName(r){return M.info(r).short;}
function render(el,o){var L=M.depList(),s=S_(),hi=o&&o.id,rl=remontLeft();
  el.innerHTML='<div class="mt-scr"><div class="mt-dh mt-deph"><span><small>'+esc(R('ОТДЕЛЫ МАГАЗИНА'))+'</small><b>'+esc(M.info().name)+'</b></span><span class="mt-date">💰 '+(+s.coins||0)+'</span></div>'+
    L.map(function(d){var lock=!d.open,max=d.lv>=3,can=!lock&&!max&&(+s.coins||0)>=d.price;
      return '<div class="mt-dep'+(lock?' lock':'')+(max?' max':'')+(hi===d.id?' hi':'')+'" data-id="'+d.id+'"><span class="mt-dic">'+d.ic+'</span><span class="mt-b"><b>'+esc(d.n)+' <em>'+stars(d.lv)+'</em></b>'+
        (d.gives?'<small>✓ '+esc(d.gives)+'</small>':'')+(lock?'<small>🔒 '+esc(R('откроется: «'+rankName(d.r)+'»'))+'</small>':max?'<small>'+esc(R('Образцовый отдел!'))+'</small>':'<small>→ '+esc(d.next)+'</small>')+'</span>'+
        (lock||max?'':'<button type="button" class="btn small buy'+(can?' green':'')+'" data-buy="'+d.id+'"'+(can?'':' aria-disabled="true"')+'>'+(d.lv?R('Ремонт'):R('Открыть'))+' · '+d.price+' 💰</button>')+
        (rl&&d.lv>=1&&!remonted(d.id)&&R('Ремонт как в столичном гастрономе')?'<button type="button" class="btn small gold mt-rmb" data-rm="'+d.id+'">✨ '+esc(R('Ремонт как в столичном гастрономе'))+'</button>':'')+
        (remonted(d.id)?'<small class="mt-rmd">✨ '+esc(R('отремонтирован как в столичном гастрономе'))+'</small>':'')+'</div>';}).join('')+
    branchHtml()+'<p class="mt-mut">'+esc(R('Отделы открываются с ростом разряда. Улучшения работают каждый день.'))+'</p>'+
    '<div class="row"><button type="button" class="btn" id="mtDBack">'+esc(R('← В магазин'))+'</button></div></div>';
  var bs=el.querySelectorAll('[data-buy]');for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var id=this.getAttribute('data-buy'),d=M.depList().filter(function(x){return x.id===id;})[0];
    if(!d)return;if((+S.coins||0)<d.price){var buy=function(){if(M.depBuy(id)){try{SND.win();}catch(e){}celebrate(id);render(el,{id:id});}};
      var tu=false;try{if(window.GBECO&&GBECO.topUpOpen)tu=GBECO.topUpOpen(d.price,d.n,buy);}catch(e){} // ECO: ролик «добить» (нехватка ≤30 %, ≤2 в день)
      if(!tu)try{toast(R('Не хватает монет: нужно ещё')+' '+(d.price-S.coins)+' 💰');}catch(e){}return;}
    if(M.depBuy(id)){try{SND.win();}catch(e){}celebrate(id);render(el,{id:id});}};
  var rm=el.querySelectorAll('[data-rm]');for(var j=0;j<rm.length;j++)rm[j].onclick=function(){var id=this.getAttribute('data-rm');
    if(remont(id)){try{SND.win();}catch(e){}try{toast('✨ '+R('Отдел отремонтирован как в столичном гастрономе!'));}catch(e){}render(el,{id:id});}};
  var bb=el.querySelector('#mtBrOpen');if(bb)bb.onclick=function(){if(M.openBranch()){try{SND.win();}catch(e){}render(el,{});}};
  el.querySelector('#mtDBack').onclick=function(){tap();home();};
  if(hi){var x=el.querySelector('.mt-dep.hi');if(x&&x.scrollIntoView)x.scrollIntoView({block:'center'});}}
function branchHtml(){if(M.rank()<9)return '';var b=M.branch();
  if(M.depAll())return '<div class="mt-seal"><span>🏬 '+esc(R('Все отделы образцовые! Торг предлагает открыть филиал — отделы заново, дороже в полтора раза.'))+'</span><button type="button" class="btn small green" id="mtBrOpen">'+esc(R('Открыть филиал'))+'</button></div>';
  return b?'<p class="mt-mut">🏬 '+esc(R('Филиалов открыто:'))+' '+b+'</p>':'';}
function celebrate(id){var d=M.depList().filter(function(x){return x.id===id;})[0];if(!d)return;
  try{toast(d.ic+' '+d.n+' '+stars(d.lv)+(d.gives?' — '+d.gives:''));}catch(e){}}
function home(){try{if(GB.homeGo)return GB.homeGo();}catch(e){}try{openMap();}catch(e){}}
GB.screen('dep',{render:render});
function open(id){GB.go('dep',{id:id});try{STAT.screen('dep');}catch(e){}}

window.GBDEP={on:ON,open:open,glass:glass,takeGlass:takeGlass,soda:soda,takeSoda:takeSoda,goal:goal,freeOf:freeOf,remont:remont,remonted:remonted,canRemont:canRemont,look:look,fix:function(){fix();}};
})();
