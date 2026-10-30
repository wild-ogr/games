(function(W,D){'use strict';
if(!W.V3||!W.UI)return;
V3.reg('rs',{s:'RS',t:'реструктуризация 30.10'});
var ON=V3.reg('rs.sect',{s:'RS-П4',t:'разделы: Мой двор 3 вкладки, Отдых, одна Лавка'});
var HINT=V3.reg('rs.hint',{s:'RS-П4',t:'подсказка за монеты — первый раз спросить'});
var RSS=W.RSS={on:ON,dot:function(){return false;},open:function(id){return UI.go(id);},games:function(){return[];},rest:function(){}};
function L(r,e){try{return VY.L(r,e);}catch(x){return r;}}
function ok(f,d){try{return f();}catch(e){warn(e);return d;}}
var wn=0;function warn(e){if(++wn<=6)try{console.warn('rs-sect',e);}catch(x){}}
function $(id){return D.getElementById(id);}
function esc(s){return UI.esc(s);}
function S_(){return VY.S;}
function tap(){ok(function(){SND.tap();});}
function dOpen(k){try{return!W.RSD||!RSD.open||RSD.open(k)!==false;}catch(e){return true;}}
function seen(k){try{if(W.RSD&&RSD.seen)RSD.seen(k);}catch(e){}}
function fresh(k){try{return!!(W.RSD&&RSD.fresh&&RSD.fresh(k));}catch(e){return false;}}
function ev(a,o){try{V3.ev('rs4',(function(){var p={a2:a};for(var k in o||{})p[k]=o[k];return p;})());}catch(e){}}
function isO(v){return!!v&&typeof v==='object'&&!Array.isArray(v);}
V3.field('v3sect',{s:'RS-П4',def:null,
fix:function(v){if(v===undefined||v===null)return undefined;if(!isO(v))return{};['ha','xl'].forEach(function(k){if(v[k])v[k]=1;else delete v[k];});return v;},
merge:function(a,b,newer){if(!isO(b))return a;if(!isO(a))return b;var r={};if(a.ha||b.ha)r.ha=1;var x=newer?b.xl:a.xl;if(x)r.xl=1;return r;}});
function my(){var S=S_();if(!isO(S.v3sect))S.v3sect={};return S.v3sect;}
if(HINT&&typeof W.hint==='function'){(function(){var h0=W.hint;
function silent(){var S=S_(),G=VY.G;if(!G||G.over||G.mode==='rush')return false;
if(S.freeHint&&!G.daily)return false;if(isO(S.v3sect)&&S.v3sect.ha)return false;
var pr=ok(function(){return PRICE.hint;},40);if(S.coins<pr)return false;
var hp=$('hintPr');if(hp&&hp.textContent.indexOf(String(pr))<0)return false;
return!ok(function(){return adHintOk();},false);}
W.hint=function(mode){if(mode!==undefined||!silent())return h0.apply(this,arguments);
var pr=ok(function(){return PRICE.hint;},40),G=VY.G;
var m=VY.modal('<h2>💡 '+L('Подсказка','Hint')+'</h2><p>'+L('Подсказка стоит '+pr+' монет. Взять?','A hint costs '+pr+' coins. Take it?')+'</p>'+
'<div class="row"><button class="btn green noenter" id="rsHY">💡 '+L('Взять за ','Take for ')+pr+' 💰</button><button class="btn" id="rsHN">'+L('Не надо','No thanks')+'</button></div>');
ev('hask',{c:pr});
var y=$('rsHY'),n=$('rsHN');
if(y)y.onclick=function(){my().ha=1;ok(function(){save();});VY.hide();ev('hans',{r:1});if(VY.G===G)h0();};
if(n)n.onclick=function(){my().ha=1;ok(function(){save();});VY.hide();ev('hans',{r:0});};};})();}
if(!ON)return;
var GRP={yard:'yard',season:'yard',album:'album',garage:'album',v3cards:'album',league:'league'};
var GT={yard:['Постройки','Buildings'],album:['Машины','Cars'],league:['Соседи','Neighbours']};
var GIC={yard:'🏡',album:'🚗',league:'🏘'};
var GKEY={yard:'myyard',album:'cars',league:'league'};
var MAPT={build:'yard',buildings:'yard',cars:'album',nb:'league',sosedi:'league',neighbours:'league'};
function line(ic,t,s,id,cls){return'<button class="rpLine'+(cls?' '+cls:'')+'" data-rs="'+id+'"><span class="rpLi">'+ic+'</span><span class="rpLt"><b>'+t+'</b>'+(s?'<small>'+s+'</small>':'')+'</span><i class="rpLg">›</i></button>';}
function back(to){return'<button class="rpSub" data-rs="back:'+to+'">‹ '+esc(L(GT[to][0],GT[to][1]))+'</button>';}
function myNav(){var sc=$('scr-my');if(!sc)return;var n=$('rsMyNav');if(!n){n=D.createElement('nav');n.id='rsMyNav';n.className='unav rsNav';sc.appendChild(n);}
ok(function(){if(UI.navFill)UI.navFill(n,'my');});}
function myPost(){var sc=$('scr-my'),tb=$('myTabs'),pane=$('myPane');if(!sc||!tb||!pane)return;sc.classList.add('rs-sect');
var cur=ok(function(){return MY.cur();},'yard'),g=GRP[cur]||'yard',dots={},ids={};
[].forEach.call(tb.querySelectorAll('[data-t]'),function(b){var t=b.getAttribute('data-t');ids[t]=1;if(b.querySelector('.mydot'))dots[GRP[t]||t]=1;});
var gs=['yard','album','league'].filter(function(k){return k===g||ids[k]&&dOpen(GKEY[k]);});
tb.innerHTML=gs.map(function(k){return'<button class="mytab rpTab'+(k===g?' on':'')+'" role="tab" data-g="'+k+'" aria-selected="'+(k===g)+'" data-keys-num'+(k===g?' data-keys-default':'')+'>'+
'<span>'+GIC[k]+'</span>'+esc(L(GT[k][0],GT[k][1]))+(dots[k]&&k!==g?'<i class="mydot"></i>':'')+'</button>';}).join('');
[].forEach.call(tb.querySelectorAll('[data-g]'),function(b){b.onclick=function(){var k=b.getAttribute('data-g');if(k===cur)return;tap();MY.open(k);};});
var t=$('myTitle'),s=$('mySub');if(t)t.textContent=L('Мой двор','My yard');if(s)s.textContent=L(GT[g][0],GT[g][1]);
var bk=$('myBack');if(bk&&!bk.__rs){bk.__rs=1;bk.classList.add('rpBk');bk.innerHTML='‹ '+L('Назад','Back');}
seen(GKEY[g]);
var top=D.createElement('div');top.className='rpTop';var h='';
if(cur!==g)h+=back(g);
if(cur==='yard')h+=yardTop();else if(cur==='album')h+=carsTop();else if(cur==='league')h+=nbTop();
top.innerHTML=h;if(h)pane.insertBefore(top,pane.firstChild);bind(top);
if(cur==='yard')yardPost(pane);
if(cur==='album')carsDraw(top);
if(cur==='yard'){var u=D.createElement('div');u.className='rpBot';u.innerHTML=yardBot();pane.appendChild(u);bind(u);decoDraw(u);}
myNav();}
function bind(el){[].forEach.call(el.querySelectorAll('[data-rs]'),function(b){b.onclick=function(e){e.stopPropagation();tap();act(b.getAttribute('data-rs'),b);};});}
function act(a,b){var m=/^back:(\w+)/.exec(a);if(m){MY.open(m[1]);return;}
if(a==='season')MY.open('season');else if(a==='garage')MY.open('garage');else if(a==='cards')MY.open('v3cards');
else if(a==='photo')ok(function(){V3P.cam();});
else if(a==='work')UI.go('tolik');
else if(a==='case')ok(function(){V3Q.open();});else if(a==='qmap')ok(function(){V3QS.open();});else if(a==='chalk')ok(function(){V3QC.open();});
else if(a==='rights')ok(function(){CAR.openCareer();});
else if(/^car:/.test(a)){var i=+a.slice(4);ok(function(){if(S_().garage.indexOf(i)>=0)openCar(i);else toast(lockCar(i),2600);});}
else if(/^dec:/.test(a))ok(function(){openDecor(a.slice(4));});
else if(/^set:/.test(a)){b.disabled=true;ok(function(){claimSet(a.slice(4),b);});setTimeout(function(){if(MY.isOpen())MY.render();},1300);}}
function yardTop(){return'';}
function yardPost(pane){
var sel=pane.querySelector('.myysel');if(!sel)return;var lk=sel.querySelectorAll('.myyb.lock');if(!lk.length)return;
[].forEach.call(lk,function(b){if(!b.classList.contains('on'))b.parentNode.removeChild(b);});
if(sel.querySelectorAll('.myyb').length<2)sel.style.display='none';
var d=ok(function(){return MY.dist();},0);if(d>=5)return;
var p=D.createElement('p');p.className='rpDist';p.innerHTML='🔒 '+L('Следующий район: «','Next district: “')+esc(MY.distName(d+1))+L('» — откроется, когда подрастут права (Маршрут)','” — opens as your licence grows (Route)');
sel.parentNode.insertBefore(p,sel.nextSibling);}
function yardBot(){var h='',S=S_();
var dec=ok(function(){return DECOR;},[]);
if(dec.length){var n=dec.filter(function(x){return S.dec&&S.dec[x.id];}).length;
h+='<h3 class="rpH">🌷 '+L('Уют','Cosy yard')+' <small>'+n+' '+L('из','of')+' '+dec.length+'</small></h3><p class="rpNote">'+L('Что купишь — встанет в каждом дворе игры.','Whatever you buy will stand in every yard of the game.')+'</p><div class="rpDec">';
dec.forEach(function(x){var has=!!(S.dec&&S.dec[x.id]),nm=ok(function(){return LANG==='en'&&x.en?x.en.name:x.name;},x.name);
h+='<button class="rpDecI'+(has?' own':'')+'" data-rs="dec:'+x.id+'"><canvas data-dic="'+x.id+'"></canvas><b>'+esc(nm)+'</b><small>'+(has?'✓ '+L('во дворе','in the yard'):x.price+' 💰')+'</small></button>';});
h+='</div>'+sets('yard');}
var se=ok(function(){return VYSEASON.cur();},null);
if(se)h+=line('🎟',L('Сезон «','Season “')+esc(se.name)+L('»: ','”: ')+se.step+' '+L('из','of')+' '+se.steps,L('задания месяца и талон','monthly tasks and the pass'),'season');
if(W.V3P&&V3P.cam&&dOpen('photo'))h+=line('📷',L('Фото двора','Yard photos'),L('карточки на память','keepsake cards'),'photo');
return h;}
function sets(tab){var a=ok(function(){return SETS.filter(function(s){return s.tab===tab;});},[]);if(!a.length)return'';
var h='<div class="gsets rpSets">';a.forEach(function(s){h+=ok(function(){return setRow(s);},'');});h+='</div>';
return h.replace(/data-set="/g,'data-rs="set:');}
function decoDraw(el){[].forEach.call(el.querySelectorAll('[data-dic]'),function(c){requestAnimationFrame(function(){ok(function(){decorIcon(c,c.getAttribute('data-dic'));});});});}
function lockCar(i){var m=VY.MODELS[i];return ok(function(){return m.streak?L('«'+m.name+'» — гостинец бабы Шуры на 7-й день','The '+m.name+' is Granny Shura’s day-7 gift'):L('«'+m.name+'» приедет после двора '+CAR_AT[i],'The '+m.name+' arrives after yard '+CAR_AT[i]);},'');}
function carsTop(){var h='',S=S_();
if(W.VYMG&&VYMG.carInfo&&dOpen('workshop'))ok(function(){var c=VYMG.carInfo();
h+=line('🔧',L('Мастерская Толика','Tolik’s workshop'),c.done?L('всё собрано','all built'):L('собираем ','building ')+esc(c.n)+': '+c.have+' '+L('из','of')+' '+c.need,'work','rsWork');});
ok(function(){var r=ALB.rusty().length;if(r)h+=line('🛠',L('Ржавых машин: ','Rusty cars: ')+r,L('отдать Толику на ремонт','give them to Tolik to restore'),'garage','hot');
else h+=line('🛠',L('Ремонт у Толика','Tolik’s repairs'),L('ржавые машины из альбома','rusty cars from the album'),'garage');});
var M=VY.MODELS||[],own=S.garage||[];
if(M.length){h+='<h3 class="rpH">🚗 '+L('Мои машины','My cars')+' <small>'+own.length+' '+L('из','of')+' '+M.length+'</small></h3><p class="rpNote">'+L('Нажми на машину: покрасить, поставить во дворы.','Tap a car: paint it or park it in the yards.')+'</p><div class="rpCars">';
M.forEach(function(m,i){var has=own.indexOf(i)>=0;
h+='<button class="rpCar'+(has?' own':' lock')+'" data-rs="car:'+i+'"><canvas data-ci="'+i+'"></canvas><b>'+(has?'':'🔒 ')+esc(m.name)+'</b>'+
(has?(S.yard&&S.yard[i]?'<small>🏠 '+L('во дворах','in the yards')+'</small>':''):'<small>'+esc(ok(function(){return m.streak?L('гостинец 7-го дня','day-7 gift'):L('двор ','yard ')+CAR_AT[i];},''))+'</small>')+'</button>';});
h+='</div>'+sets('cars');}
if(W.V3C)h+=line('✨',L('Открытки','Postcards'),L('города и праздничные машины','cities and holiday cars'),'cards');
h+='<h3 class="rpH">📒 '+L('Автоальбом','Car album')+'</h3>';
return h;}
function carsDraw(el){[].forEach.call(el.querySelectorAll('[data-ci]'),function(c){var i=+c.getAttribute('data-ci'),has=S_().garage.indexOf(i)>=0;
requestAnimationFrame(function(){ok(function(){drawModel(c,VY.MODELS[i],has?carColor(i):null);});});});}
function nbTop(){var h='';
ok(function(){if(W.V3Q&&V3Q.allowed()){var q=V3Q.tick();if(q)h+=line('🔍',L('Расследование во дворе','Yard investigation'),L('кто угнал «Москвич» деда: улики ','who took Grandad’s car: clues ')+q.p,'case');}});
ok(function(){if(W.V3QS&&V3QS.live()){var d=V3QS.st().data;h+=line('🏘',L('Наш квартал: ','Our quarter: ')+d.done+' '+L('из','of')+' '+d.n,L('субботник: ','clean-up: ')+d.s+' '+L('из','of')+' '+d.goal,'qmap');
if(W.V3QC)h+=line('🖍',L('Мел на асфальте','Chalk on the asphalt'),L('написать соседям','write to the neighbours'),'chalk');}});
return h;}
function myOpen(o){var t=o&&o.tab||(typeof o==='string'?o:'');t=MAPT[t]||t;ok(function(){MY.open(t);});}
function myWire(){if(!W.MY||!MY.render)return;if(!MY.render.__rs){var r0=MY.render;MY.render=function(){var r=r0.apply(this,arguments);ok(myPost);return r;};MY.render.__rs=1;}
UI.screen('my',myOpen);UI.screen('my-album',function(){myOpen('album');});UI.screen('my-garage',function(){myOpen('garage');});UI.screen('my-league',function(){myOpen('league');});
UI.screen('garage',function(o){ok(function(){leaveYard();});myOpen(o&&o.tab==='yard'?'yard':'album');});
var og=W.openGarage;if(typeof og==='function'&&!og.__rs){W.openGarage=function(tab){if(!V3.is('rs.sect'))return og.apply(this,arguments);
ok(function(){STAT.screen('garage');});myOpen(tab==='yard'?'yard':'album');};W.openGarage.__rs=1;}}
var SHELF=['parkovka','foto','zavedi','doroga','moyka','bagazh'];
var rest=null,view='';
function mem(){var m=VYMG.Z().m;if(!isO(m._g))m._g={};var g=m._g;if(!isO(g.st))g.st={};if(!isO(g.sn))g.sn={};return g;}
function mgOk(){return!!(W.VYMG&&VYMG.INFO&&VYMG.REG);}
function nm(i){return ok(function(){return LANG==='en'&&i.en?i.en:i.n;},i.n);}
function rule(i){return ok(function(){return LANG==='en'&&i.ae?i.ae:i.a;},i.a);}
function isNewG(){if(!mgOk())return false;var m=mem();return VYMG.openList().some(function(g){return!m.sn[g.num];});}
function dayLeft(){if(!mgOk())return false;var t=ok(function(){return VYMG.today&&VYMG.today();},null);return!!(t&&!t.done);}
function gameCard(id,big){var n=VYMG.IDS[id],i=VYMG.INFO[n];if(!i)return'';var op=VYMG.isOpen(n),m=mem(),st=m.st[n]|0,t=ok(function(){return VYMG.today&&VYMG.today();},null),day=op&&t&&t.id===id,nw=op&&!m.sn[n];
var stars='';if(op)for(var k=1;k<=3;k++)stars+='<span class="'+(k<=st?'on':'')+'">★</span>';
return'<div class="rpG'+(big?' big':' row')+(op?'':' lock')+(day?' day':'')+'" data-g="'+id+'">'+
'<span class="rpGi">'+i.ic+'</span><span class="rpGf">'+ok(function(){return VYMG.face(i.who,op?'happy':'norm');},'')+'</span>'+
'<span class="rpGb"><b>'+esc(nm(i))+(nw?' <em class="rpNew">'+L('новое','new')+'</em>':'')+'</b>'+(op?'<small>'+esc(rule(i))+'</small>'+(stars?'<span class="rpSt">'+stars+'</span>':''):'<small>🔒 '+esc(ok(function(){return VYMG.lockTxt(n);},''))+'</small>')+'</span>'+
(op?'<span class="rpGbtn">'+(day?'<button class="btn green noenter" data-a="day">☀ '+L('Игра дня','Game of the day')+'</button>':'')+'<button class="btn '+(day?'sec':'green')+' noenter" data-a="play">▶ '+L('Играть','Play')+'</button></span>':'')+'</div>';}
function restHtml(){var h='',z=VYMG.Z(),ns=Object.keys(VYMG.INFO).map(Number).sort(function(a,b){return a-b;}),more=ns.map(function(n){return VYMG.INFO[n].id;}).filter(function(id){return SHELF.indexOf(id)<0;});
if(view==='more'){h+='<button class="rpSub" data-r="main">‹ '+L('Игры Толика','Tolik’s games')+'</button><h2 class="rpH2">'+L('Ещё игры','More games')+'</h2>';
more.forEach(function(id){h+=gameCard(id,false);});return h;}
var op=VYMG.openList().length;
h+='<div class="rpSay">'+ok(function(){return VYMG.say('tolik',op?L('Заходи — тут можно просто поиграть, сколько хочешь. Награда — в «Игре дня».','Come in — play as much as you like. The reward is in the game of the day.'):L('Пройди 4 двора — открою первую игру!','Clear 4 yards and I’ll open the first game!'),'happy');},'')+'</div>';
if(z.ob>1)h+='<p class="rpBulk">🎉 '+L('У Толика открылось игр: '+z.ob+'. Играй любую!','Tolik has '+z.ob+' games open for you. Play any!')+'</p>';
if(W.VYPARK&&dOpen('avtodrom'))ok(function(){var gate=VYPARK.groups[0].gate,y=VYMG.yards(),o=y>=gate;
h+='<button class="rpLine rpAvto'+(o?'':' lock')+'" data-r="avto"><span class="rpLi">🅿</span><span class="rpLt"><b>'+L('Автодром деда Митяя','Grandpa Mityai’s driving ground')+'</b><small>'+
(o?(VYPARK.dayDone()?L('парковки задним ходом · ★ ','reverse parking · ★ ')+VYPARK.total():L('парковка дня ждёт','parking of the day is waiting')):'🔒 '+L('откроется после '+gate+'-го двора','opens after yard '+gate))+'</small></span><i class="rpLg">›</i></button>';});
h+='<div class="rpShelf">';SHELF.forEach(function(id){h+=gameCard(id,true);});h+='</div>';
var mo=more.filter(function(id){return VYMG.isOpen(VYMG.IDS[id]);}).length;
h+='<button class="rpLine rpMore" data-r="more"><span class="rpLi">🎲</span><span class="rpLt"><b>'+L('Ещё игры','More games')+' ('+more.length+')</b><small>'+(mo?L('открыто '+mo+' из '+more.length,mo+' of '+more.length+' open'):L('откроются по ходу игры','open as you play'))+'</small></span><i class="rpLg">›</i></button>';
if(W.XPZ&&XPZ.on)h+='<h3 class="rpH">'+L('Другие игры','Other games')+'</h3><div class="rpXpz"></div>';
return h;}
function restBuild(){if(rest)return rest;rest=D.createElement('section');rest.id='scr-rest';rest.className='screen rs-sect rpRest';
rest.innerHTML='<header class="gh"><button class="icon rpBk" id="rsRBack">‹ '+L('Назад','Back')+'</button><div class="gt"><div>'+L('Отдых','Leisure')+'</div><div class="sub">'+L('Игры Толика','Tolik’s games')+'</div></div><button class="pill" id="rsRCoins">💰 0</button></header>'+
'<div class="rpBody" id="rsRBody"></div><nav class="unav rsNav" id="rsRNav"></nav>';
($('app')||D.body).insertBefore(rest,$('modal'));
$('rsRBack').onclick=function(){tap();if(view){view='';restRender();return;}if(!UI.go('home'))UI.go('map');};
$('rsRCoins').onclick=function(){UI.go('lavka');};
return rest;}
function restRender(){restBuild();var b=$('rsRBody');$('rsRCoins').textContent='💰 '+(S_().coins||0);
if(!mgOk()){b.innerHTML='<p class="rpNote">'+L('Игры Толика ещё загружаются…','Tolik’s games are still loading…')+'</p>';return;}
b.innerHTML=restHtml();b.scrollTop=0;
var z=VYMG.Z();if(z.ob&&view!=='more'){delete z.ob;VYMG.touch();ok(function(){save();});}
[].forEach.call(b.querySelectorAll('[data-r]'),function(x){x.onclick=function(){tap();var r=x.getAttribute('data-r');
if(r==='more'){view='more';restRender();}else if(r==='main'){view='';restRender();}
else if(r==='avto'){if(x.classList.contains('lock'))return;ok(function(){VYPARK.open();var bb=D.querySelector('#scr-avtodrom .vyp-back');if(bb)bb.onclick=function(){tap();UI.go('rest');};});}};});
[].forEach.call(b.querySelectorAll('.rpG'),function(c){c.onclick=function(e){if(c.classList.contains('lock'))return;var a=e.target.closest&&e.target.closest('[data-a]');play(c.getAttribute('data-g'),a?a.getAttribute('data-a'):'play');};});
var xz=b.querySelector('.rpXpz');if(xz)ok(function(){var d=XPZ.el('xpm');if(d)xz.appendChild(d);});
ok(function(){if(UI.navFill)UI.navFill($('rsRNav'),'rest');});}
function play(id,a){var n=VYMG.IDS[id],i=VYMG.INFO[n];if(!i||!VYMG.isOpen(n))return;tap();var m=mem();m.sn[n]=1;VYMG.touch();ok(function(){save();});
if(a==='day'){VYMG.openDay(function(){openRest();});return;}
VYMG.ev({a:'show',id:id,m:'cab'});VYMG_OPEN(id,{mode:'cab',back:function(){openRest();}});}
function openRest(o){ok(function(){if(typeof leaveYard==='function')leaveYard();});ok(function(){if(VY.modalOn)hideModal();});
if(o&&o.more)view='more';else if(!(o&&o.keep))view='';
restRender();UI.show('scr-rest');ok(function(){STAT.screen('rest');});seen('rest');}
RSS.rest=openRest;
RSS.games=function(){return mgOk()?VYMG.openList().map(function(g){return g.id;}):[];};
function restDot(){return fresh('rest')||isNewG()||dayLeft();}
function myDot(){return fresh('myyard')||(W.MY&&MY.dot?ok(function(){return MY.dot();},false):false);}
RSS.dot=function(id){return id==='rest'?ok(restDot,false):id==='my'?ok(myDot,false):false;};
function restWire(){UI.screen('rest',openRest);UI.screen('garazhi',openRest);if(W.VYMG)VYMG.openGarazhi=openRest;}
restWire();
function navRest(){if(Array.isArray(W.navSlots))navSlots.push({id:'garazhi',order:25,ic:'🛋',t:function(){return L('Отдых','Leisure');},go:'rest',dot:function(){return RSS.dot('rest');}});}
navRest();
UI.on('coins',function(n){var e=$('rsRCoins');if(e)e.textContent='💰 '+n;});
D.addEventListener('keydown',function(e){if(UI.cur!=='rest'||VY.modalOn||e.defaultPrevented)return;if(e.key==='Escape'||e.key==='Backspace'){e.preventDefault();$('rsRBack').click();}});
if(Array.isArray(W.shopSlots))shopSlots.push({id:'rs-shura',order:5,render:function(){if(!W.V3P||!V3P.open)return null;
var ab=ok(function(){return V3P.abLeft();},0);
return'<h3>🏪 '+L('От бабы Шуры','From Granny Shura')+'</h3><p class="lvNote">'+L('Вид двора, жезл, толчки, пирожки, абонемент','Yard looks, baton, nudges, pies, a pass')+(ab?' · 🎫 '+L('абонемент ещё ','pass: ')+ab+' '+L('дн.','days'):'')+'</p><button class="btn accent noenter" id="rsShura">'+L('Посмотреть','Have a look')+'</button>';},
mount:function(el){ok(function(){$('scr-lavka').classList.add('rs-sect');});var b=el.querySelector('#rsShura');if(b)b.onclick=function(){tap();ok(function(){V3P.open();});};}});
if(Array.isArray(W.shopSlots))shopSlots.push({id:'rs-parcel',order:6,render:function(){if(!W.V3P||!V3P.parcel||!ok(function(){return adOk();},false))return null;
return'<h3>📦 '+L('Посылка деда','Grandad’s parcel')+'</h3><p class="lvNote">'+L('Бесплатно за ролик — подарок от деда','Free for a video — a gift from Grandad')+'</p><button class="btn accent noenter" id="rsParcel">📺 '+L('Открыть посылку','Open the parcel')+'</button>';},
mount:function(el){var b=el.querySelector('#rsParcel');if(b)b.onclick=function(){tap();ok(function(){V3P.parcel();});};}});
function rsh(){if(!W.RSH||rsh.on)return;rsh.on=1;
ok(function(){if(RSH.target){RSH.target('my','my');RSH.target('rest','rest');}});
ok(function(){if(RSH.dot){RSH.dot('rest',function(){return RSS.dot('rest');});RSH.dot('my',function(){return RSS.dot('my');});}});}
function wire(){ok(myWire);restWire();ok(rsh);}
wire();
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',wire);
W.addEventListener('load',function(){setTimeout(wire,0);});
W.addEventListener('vy-late',function(){restWire();navRest();if(UI.cur==='rest')ok(restRender);});
UI.on('screen',function(n){if(n==='garazhi')openRest();});
})(window,document);