(function(){'use strict';
var W=window,D=document;
function ok(f,d){try{return f();}catch(e){return d;}}
function isO(x){return!!x&&typeof x==='object'&&!Array.isArray(x);}
var ON=false;
if(W.V3&&V3.reg){ok(function(){V3.reg('rs',{s:'RS',t:'реструктуризация 30.10'});});ON=V3.reg('rs.today',{s:'RS-П2',t:'«На сегодня», сундучок, новости, плашка «Событие»'});}
function S_(){return ok(function(){return typeof S!=='undefined'&&isO(S)?S:null;},null);}
function T(ru,en){return ok(function(){return L(ru,en);},ru);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function num(x){return typeof x==='number'&&isFinite(x)&&x>=0?x:0;}
function done(){return ok(function(){return+S.levelsDone||0;},0);}
function yards(){return ok(function(){return Math.max(0,(+S.unlocked||1)-1);},0);}
function dkey(){return ok(function(){return dayKey(0);},0);}
function sv(){ok(function(){save();});}
function tap(){ok(function(){SND.tap();});}
function RO(k){return!W.RSD||RSD.open(k);}
function ct(n){return ok(function(){return coinsTxt(n);},n+' 💰');}
function slot(id){var a=W.homeSlots||[],i;for(i=a.length-1;i>=0;i--)if(a[i]&&a[i].id===id)return a[i];return null;}
function slotR(id){var s=slot(id);if(!s||!s.render)return null;return ok(function(){var r=s.render({});return r&&typeof r==='object'?r:null;},null);}
function goTo(g){if(typeof g==='function')return ok(g);if(typeof g==='string')ok(function(){UI.go(g);});}
function hide(){ok(function(){hideModal();});}
function wd(){return ok(function(){return new Date(nowMs()).getDay();},new Date().getDay());}
function fixT(o){if(!isO(o))o={v:1};o.v=1;o.d=num(o.d);o.mn=num(o.mn);if(!Array.isArray(o.l))o.l=[];o.l=o.l.filter(function(k){return typeof k==='string'&&k.length<6;}).slice(0,3);return o;}
if(ON)V3.field('v3rt',{s:'RS-П2',def:{v:1},fix:function(o){return fixT(o);},
merge:function(a,b,newer){a=fixT(a);b=fixT(b);if(a.d!==b.d)return a.d>b.d?a:b;var r=newer?b:a;r.mn=Math.max(a.mn,b.mn);if(!r.l.length)r.l=(newer?a:b).l;return r;}});
function RT(){var s=S_();if(!s)return fixT({});if(!isO(s.v3rt))s.v3rt=fixT({});var r=s.v3rt,t=dkey();if(r.d!==t){r.d=t;r.l=[];}return r;}
function td(){return ok(function(){TD.fix();if(!S.td.ask)S.td.ask=1;return S.td;},null);}
function dailyOpen(){return ok(function(){return!dailyLocked();},false);}
function dailyDone(){return ok(function(){return(S.daily[todayKey()]||0)>0;},false);}
function nW(){var d=td();return d&&d.n?num(d.n.w):0;}
function mgInfo(){return ok(function(){if(!W.VYMG)return null;if(VYMG.today)return VYMG.today();if(!VYMG.dayId||done()<4)return null;var id=VYMG.dayId();if(!id)return null;
var inf=VYMG.INFO[VYMG.IDS[id]]||{},z=S.vymg&&S.vymg.d,dn=!!(z&&z.z&&z.k===dkey());
return{id:id,n:inf.n||id,ic:inf.ic||'🧩',done:dn,play:function(){VYMG.open(id,{mode:'day'});}};},null);}
function ordInfo(){return ok(function(){return W.ORD&&ORD.today?ORD.today():null;},null);}
function mornOn(){return ok(function(){return!!(W.V3N&&V3N.mornReady&&V3N.mornReady());},false);}
function moskOn(){return ok(function(){return!!(W.V3N&&V3N.moskDue&&V3N.moskDue());},false);}
var NAMES={dy:['Двор дня','Yard of the day'],y3:['Пройди 3 двора','Clear 3 yards'],or:['Заказ жильца','Resident’s request'],mg:['Игра дня','Game of the day'],
mn:['Утро: разъезд','Morning: drive-off'],mk:['«Москвич» деда','Grandad’s Moskvich'],cl:['Двор без аварий','A yard with no crashes'],s3:['Двор на три звезды','A three-star yard']};
function deal(k){var d=td(),n=d&&d.n?d.n:{},m=d&&d.m?d.m:{},x={k:k,t:T(NAMES[k][0],NAMES[k][1])};
if(k==='dy'){x.ic='📅';x.ok=dailyDone()||!!m.dy;x.s=x.ok?T('пройден','cleared'):T('один на весь двор','the same for everyone');x.go=function(){if(ok(function(){return UI.has('daily');},false))ok(function(){UI.go('daily');});else ok(function(){openDaily();});};}
else if(k==='y3'){var w=Math.min(3,nW());x.ic='🚗';x.ok=w>=3;x.s=x.ok?T('сделано','done'):w+T(' из 3',' of 3');x.go=playNext;}
else if(k==='or'){var o=ordInfo();x.ic='📮';x.ok=!!(o&&o.ok)||!!m.or;x.s=o?(x.ok?T('выполнен','done'):(o.who?o.who+': ':'')+o.t):'';x.go=function(){ok(function(){ORD.open();});};}
else if(k==='mg'){var g=mgInfo();x.ic=g&&g.ic||'🧩';x.ok=!!m.mg||!!(g&&g.done);x.s=g?(x.ok?T('сыграно','played')+': '+g.n:g.n):'';x.go=function(){var q=mgInfo();if(q)ok(function(){if(q.play)q.play();else VYMG.open(q.id,{src:'day'});});};}
else if(k==='mn'){var r=RT();x.ic='🌅';x.ok=!mornOn()&&r.mn===dkey();x.s=x.ok?T('все соседи разъехались','everyone has left'):T('соседям пора на работу','the neighbours need to leave');x.go=function(){ok(function(){V3N.startMorn();});};}
else if(k==='mk'){var mk=ok(function(){return S.v3n.ms===dkey();},false);x.ic='🔑';x.ok=mk;x.s=mk?T('завёлся!','it started!'):T('утром — завести мотор','start the engine in the morning');x.go=function(){ok(function(){V3N.openMosk();});};}
else if(k==='cl'){x.ic='✨';x.ok=num(n.cl)>0;x.s=x.ok?T('сделано','done'):T('пройди двор без единой аварии','clear a yard with no crashes');x.go=playNext;}
else if(k==='s3'){x.ic='⭐';x.ok=num(n.s3)>0;x.s=x.ok?T('сделано','done'):T('любой двор на ★★★','any yard with ★★★');x.go=playNext;}
return x;}
function playNext(){ok(function(){startLevel(Math.max(0,(S.unlocked||1)-1));});}
function avail(k){if(k==='dy')return dailyOpen();if(k==='y3'||k==='cl'||k==='s3')return true;
if(k==='or')return RO('orders')&&!!ordInfo();if(k==='mg')return RO('rest')&&!!mgInfo();
if(k==='mn')return RO('night')&&(mornOn()||RT().mn===dkey());if(k==='mk')return weekKind()==='mosk'&&RO('event')&&(moskOn()||ok(function(){return S.v3n.ms===dkey();},false));return false;}
var BASE=['dy','or','mg','y3'];
function pick(){var r=RT();if(mornOn()&&r.mn!==dkey()){r.mn=dkey();}
var l=r.l.filter(function(k){return!!NAMES[k];}),out=[];
if(l.length===3)return l;
var want=[];if(avail('mn'))want.push('mn');if(avail('mk'))want.push('mk');
var s=wd();for(var i=0;i<BASE.length;i++)want.push(BASE[(i+s)%BASE.length]);want.push('y3','cl','s3');
for(var j=0;j<want.length&&out.length<3;j++){var k=want[j];if(out.indexOf(k)<0&&avail(k))out.push(k);}
if(r.l.length===0&&done()>=1){r.l=out.slice();sv();}
return out;}
function deals(){return pick().map(deal);}
function giftItem(){var st=ok(function(){return streakState();},null);if(!st||done()<1)return null;
var dd=st.claimed?st.day:st.day;return{k:'gf',ic:'🎁',t:T('Гостинец','Gift')+' · '+T('день ','day ')+dd+T(' из 7',' of 7'),s:st.claimed?T('забран','collected'):T('ждёт тебя','waiting for you'),ok:!!st.claimed,
go:function(){ok(function(){if(W.TD&&TD.retState&&TD.retState()&&TD.openReturn())return;showStreak();});}};}
function items(){var a=[],g=giftItem();if(g)a.push(g);return a.concat(deals());}
function allDeals(){var d=deals();return d.length>0&&d.every(function(x){return x.ok;});}
function chestTaken(){var d=td();return!!(d&&d.ch);}
function chestReady(){return allDeals()&&!chestTaken();}
function chestTxt(){return ok(function(){var c=CAR.CFG.chest,x=wd()===0?c.sun:c.c;return'+'+ct(x)+(c.p?' · +'+c.p+' '+T('запчасти','parts'):'');},'');}
function takeChest(el){if(!chestReady())return 0;var d=td();if(d&&!d.l){d.l=1;ok(function(){CAR.list();});}var c=ok(function(){return TD.takeChest(el);},0);ok(function(){V3.ev('rs',{k:'chest',c:c});});changed();return c;}
function state(){var a=items(),n=a.filter(function(x){return x.ok;}).length,nx=null;for(var i=0;i<a.length;i++)if(!a[i].ok){nx=a[i];break;}
return{n:n,of:a.length,next:nx?{k:nx.k,t:nx.t,s:nx.s,ic:nx.ic}:null,chest:chestReady(),chestTaken:chestTaken(),gift:!!(a[0]&&a[0].k==='gf'&&!a[0].ok),items:a};}
function shown(){return ON&&RO('today')&&done()>=1;}
function cardHtml(){if(!shown())return'';var st=state(),h='<div class="rst-card" role="group"><div class="rst-head"><b>'+esc(T('На сегодня','Today'))+'</b><span class="rst-cnt">'+st.n+T(' из ',' of ')+st.of+'</span></div>';
if(st.next)h+='<div class="rst-row"><span class="rst-ic">'+st.next.ic+'</span><span class="rst-tx"><b>'+esc(st.next.t)+'</b>'+(st.next.s?'<small>'+esc(st.next.s)+'</small>':'')+'</span>'+
'<button class="btn green rst-do noenter" type="button" data-rst="do">'+esc(st.next.k==='gf'?T('Забрать','Collect'):T('Сделать','Do it'))+'</button></div>';
else if(st.chest)h+='<div class="rst-row"><span class="rst-ic">🧰</span><span class="rst-tx"><b>'+esc(T('Сундучок дня готов','The daily chest is ready'))+'</b><small>'+esc(chestTxt())+'</small></span>'+
'<button class="btn green rst-do noenter" type="button" data-rst="chest">'+esc(T('Забрать','Collect'))+'</button></div>';
else h+='<div class="rst-row"><span class="rst-ic">✅</span><span class="rst-tx"><b>'+esc(T('Всё сделано!','All done!'))+'</b><small>'+esc(T('Завтра — новые дела','New jobs tomorrow'))+'</small></span></div>';
return h+'</div>';}
function cardBind(el){el.onclick=function(e){var b=e.target&&e.target.closest?e.target.closest('[data-rst]'):null;tap();
if(b&&b.getAttribute('data-rst')==='do'){var st=state();ok(function(){V3.ev('rs',{k:'do',w:st.next&&st.next.k});});var it=items().filter(function(x){return!x.ok;})[0];if(it)it.go();return;}
if(b&&b.getAttribute('data-rst')==='chest'){openChest();return;}
open();};}
var WEEK=['mosk','avto','game','season','shift'];
var A0=20261026;
function weekNo(){return ok(function(){var k=dayKey(0),t=function(x){return Date.UTC(Math.floor(x/10000),Math.floor(x/100)%100-1,x%100)/864e5;};return Math.floor((t(k)-t(A0))/7);},0);}
var RARE=['domino','bayki','regul','nomera','otlich','polomka','zapravka','ugaday','sneg'];
function rareGame(){var w=weekNo(),i,id;for(i=0;i<RARE.length;i++){id=RARE[((w%RARE.length)+RARE.length+i)%RARE.length];
if(ok(function(){return VYMG.isOpen(VYMG.IDS[id]);},false))return id;}return'';}
function weekOk(k){if(k==='mosk')return!!slotR('th-moskvich');if(k==='avto')return RO('avtodrom')&&ok(function(){var r=slotR('w-mityai');return!!(r&&r.go==='avtodrom');},false);
if(k==='game')return RO('rest')&&!!rareGame();if(k==='season')return!!(W.V3C&&V3C.open);if(k==='shift')return yards()>=30&&!!(W.V3DA&&V3DA.go);return false;}
function weekKind(){var w=weekNo(),i;for(i=0;i<WEEK.length;i++){var k=WEEK[((w%WEEK.length)+WEEK.length+i)%WEEK.length];if(weekOk(k))return k;}return'';}
function event(){if(!ON||done()<1)return null;
var c=ok(function(){return W.FESTVY&&FESTVY.cur?FESTVY.cur():null;},null);
if(c&&c.e){var nm=ok(function(){return L(c.e.title||'Праздник',c.e.titleEn||c.e.title||'Holiday');},c.e.title||'Праздник');
return{k:'fest',ic:c.e.ic||'🎉',t:T('Вечерний двор','Evening yard')+' · '+nm,s:T('праздник во дворе','a holiday in the yard'),hot:true,go:function(){ok(function(){FESTVY.open();});}};}
if(RO('night')){var n=slotR('th-night');if(n&&n.hot)return{k:'night',ic:mornOn()?'🌅':'🌙',t:mornOn()?T('Утро: разъезд','Morning: drive-off'):T('Вечерний двор','Evening yard'),
s:mornOn()?T('соседям пора на работу','the neighbours need to leave'):T('соседи вернулись с работы — расставь машины','the neighbours are back — park their cars'),hot:true,go:n.go};}
if(!RO('event'))return null;var k=weekKind();if(!k)return null;
if(k==='mosk'){var m=slotR('th-moskvich');return{k:k,ic:'🔑',t:T('Неделя «Москвича» деда','Grandad’s Moskvich week'),s:m&&m.hot?T('утром — завести мотор','start the engine this morning'):T('заходи утром — заведём мотор','come in the morning to start it'),hot:!!(m&&m.hot),go:m&&m.go};}
if(k==='avto')return{k:k,ic:'🅿',t:T('Неделя Автодрома','Driving ground week'),s:T('дед Митяй ждёт: парковка дня','Grandpa Mityai: parking of the day'),go:'avtodrom'};
if(k==='game'){var id=rareGame(),inf=ok(function(){return VYMG.INFO[VYMG.IDS[id]];},{})||{};return{k:k,ic:inf.ic||'🎲',t:T('Игра недели','Game of the week')+': '+(inf.n||id),s:T('у Толика в гараже','in Tolik’s garage'),go:function(){ok(function(){VYMG.open(id,{src:'week'});});}};}
if(k==='season')return{k:k,ic:'🗓',t:T('Сезон во дворе','Season in the yard'),s:T('календарь подъезда: что на этой неделе','the stairwell calendar: this week'),go:function(){ok(function(){V3C.open();});}};
if(k==='shift')return{k:k,ic:'🤝',t:T('Пять дворов подряд','Five yards in a row'),s:T('три сердечка на всю смену','three hearts for the whole shift'),go:function(){ok(function(){V3DA.go('shift');});}};
return null;}
function eventHtml(){var e=event();if(!e)return'';return'<button type="button" class="rst-ev noenter'+(e.hot?' hot':'')+'" data-rst="ev"><span class="rst-ic">'+e.ic+'</span><span class="rst-tx"><b>'+esc(e.t)+'</b>'+(e.s?'<small>'+esc(e.s)+'</small>':'')+'</span><em>›</em></button>';}
function eventBind(el){el.onclick=function(){var e=event();if(!e)return;tap();ok(function(){V3.ev('rs',{k:'ev',w:e.k});});goTo(e.go);};}
var boxes={today:[],event:[]},last={};
function fill(kind,el){if(!el||!boxes[kind])return false;if(boxes[kind].indexOf(el)<0){boxes[kind].push(el);if(boxes[kind].length>4)boxes[kind].shift();}
var h=ON?(kind==='today'?cardHtml():eventHtml()):'';
if(el.__rsh!==h){el.innerHTML=h;el.__rsh=h;if(kind==='today')cardBind(el);else eventBind(el);}
el.hidden=!h;return!!h;}
function refill(){for(var k in boxes){boxes[k]=boxes[k].filter(function(el){return el&&el.isConnected!==false&&D.documentElement.contains(el);});boxes[k].forEach(function(el){fill(k,el);});}}
function changed(){refill();ok(function(){V3.emit('rs:today');});ok(function(){if(W.RSH&&RSH.on&&RSH.refresh)RSH.refresh();});}
function wireRSH(){if(!W.RSH||!RSH.on||wireRSH.d)return;wireRSH.d=1;
ok(function(){RSH.today(function(){if(!shown())return null;var st=state(),it=items().filter(function(x){return!x.ok;})[0],h=T('На сегодня','Today')+' · '+st.n+T(' из ',' of ')+st.of;
if(it)return{h:h,t:it.t,s:it.s,b:it.k==='gf'?T('Забрать','Collect'):T('Сделать','Do it'),go:function(){ok(function(){V3.ev('rs',{k:'do',w:it.k});});it.go();},open:open,next:nextTxt()};
if(st.chest)return{h:h,t:T('Сундучок дня готов','The daily chest is ready'),s:chestTxt(),b:T('Забрать','Collect'),go:openChest,open:open};
return{h:h,t:T('Всё сделано!','All done!'),s:T('Завтра — новые дела','New jobs tomorrow'),go:open,open:open};});});
ok(function(){RSH.event(function(){var e=event();if(!e)return false;return{ic:e.ic,t:e.t,s:e.s,go:function(){ok(function(){V3.ev('rs',{k:'ev',w:e.k});});goTo(e.go);},cls:e.hot?'hot':''};},5);});}
function nextTxt(){var a=items().filter(function(x){return!x.ok;});return a[1]?T('Следом: ','Next: ')+a[1].t:'';}
function rowHtml(x,i){return'<button type="button" class="rst-it'+(x.ok?' ok':'')+' noenter" data-i="'+i+'"><span class="rst-ic">'+x.ic+'</span><span class="rst-tx"><b>'+esc(x.t)+'</b>'+(x.s?'<small>'+esc(x.s)+'</small>':'')+'</span><span class="rst-ck">'+(x.ok?'✓':(x.k==='gf'?esc(T('Забрать','Collect')):'›'))+'</span></button>';}
function newsRows(){var r=[];if(!RO('news'))return r;
var nn=ok(function(){return W.NEWS&&NEWS.count?NEWS.count():0;},0);if(nn)r.push({ic:'📰',t:T('Вести со двора','Yard news'),s:ok(function(){return NEWS.titles()[0];},''),hot:ok(function(){return NEWS.fresh()>0;},false),go:function(){ok(function(){NEWS.open();});}});
var c=slotR('th-calendar');if(c)r.push({ic:'🗓',t:T('Календарь подъезда','Stairwell calendar'),s:T('сезон, праздники и сериал «Шура сдаёт на права»','season, holidays and the serial'),hot:!!c.badge&&c.badge!=='🎁',go:c.go});
var b=slotR('th-board');if(b&&dailyOpen())r.push({ic:'📋',t:T('Доска объявлений','Notice board'),s:b.t,hot:false,go:b.go});
var m=slotR('th-mail');if(m&&RO('mail'))r.push({ic:'✉️',t:m.t||T('Почта','Mail'),s:'',hot:!!m.badge,go:m.go});
var wn=ok(function(){return W.RSW&&Array.isArray(RSW.news)?RSW.news.filter(function(x){return x&&x.t;}):[];},[]);
if(wn.length)r.push({ic:'🧾',t:T('С последнего двора','From the last yard'),s:String(wn[0].t).slice(0,70),hot:false,go:function(){ok(function(){
modal('<h2>🧾 '+esc(T('С последнего двора','From the last yard'))+'</h2><div class="rst-wn" style="max-height:60vh;overflow-y:auto;text-align:left;font-size:16px;line-height:1.35">'+
wn.slice(0,20).map(function(x){return'<p style="margin:0 0 10px">'+esc(String(x.t))+'</p>';}).join('')+'</div><div class="row"><button class="btn green" id="rstWnX">'+esc(T('Понятно','Got it'))+'</button></div>');
var b=D.getElementById('rstWnX');if(b)b.onclick=function(){hideModal();};});}});
return r;}
function newsHot(){return newsRows().filter(function(x){return x.hot;}).length;}
function body(){var st=state(),h='<div class="rst-scr"><h2>'+esc(T('На сегодня','Today'))+' · '+st.n+T(' из ',' of ')+st.of+'</h2><div class="rst-list">';
st.items.forEach(function(x,i){h+=rowHtml(x,i);});h+='</div>';
if(st.chest)h+='<button type="button" class="btn green rst-chest noenter" id="rstChest">🧰 '+esc(T('Забрать сундучок дня','Collect the daily chest'))+' '+esc(chestTxt())+'</button>';
else if(st.chestTaken)h+='<p class="rst-note">🧰 '+esc(T('Сундучок дня забран. Завтра — новые дела.','Daily chest collected. New jobs tomorrow.'))+'</p>';
else h+='<p class="rst-note">🧰 '+esc(T('Сделай три дела — получишь сундучок дня: ','Do all three jobs for the daily chest: '))+esc(chestTxt())+'</p>';
var nr=newsRows();if(nr.length){var hot=newsHot();h+='<button type="button" class="rst-news noenter" id="rstNews"><b>'+esc(T('Новости двора','Yard news'))+(hot?' ('+hot+')':'')+'</b><em>›</em></button>';}
return h+'<div class="row"><button class="btn" id="mCancel" type="button">'+esc(T('Закрыть','Close'))+'</button></div></div>';}
function open(){if(!ON)return ok(function(){TD.openToday();});ok(function(){STAT.screen('rs-today');});ok(function(){modal(body());});var c=D.getElementById('mcard');if(!c)return;
var its=items();[].forEach.call(c.querySelectorAll('.rst-it'),function(b){b.onclick=function(){tap();var x=its[+b.getAttribute('data-i')];if(!x||x.ok)return;hide();setTimeout(function(){x.go();},80);};});
var ch=D.getElementById('rstChest');if(ch)ch.onclick=function(){tap();openChest();};
var nw=D.getElementById('rstNews');if(nw)nw.onclick=function(){tap();news();};
var x=D.getElementById('mCancel');if(x)x.onclick=function(){hide();changed();};}
function openChest(){if(!chestReady())return;ok(function(){modal('<div class="rst-scr"><h2>🧰 '+esc(T('Сундучок дня','Daily chest'))+'</h2>'+ok(function(){return shura(T('Все дела сделал — молодец! Держи, заслужил.','All jobs done — well done! Here, you’ve earned it.'));},'')+
'<p class="coins-won" id="rstChW">'+esc(chestTxt())+'</p><div class="row"><button class="btn green rst-chest" id="rstChOk" type="button">'+esc(T('Забрать','Collect'))+'</button></div></div>');});
var b=D.getElementById('rstChOk');if(b)b.onclick=function(){takeChest(D.getElementById('rstChW'));hide();changed();};}
function news(){var r=newsRows(),h='<div class="rst-scr"><h2>'+esc(T('Новости двора','Yard news'))+'</h2><div class="rst-list">';
if(!r.length)h+='<p class="rst-note">'+esc(T('Пока тихо. Загляни завтра.','All quiet. Come back tomorrow.'))+'</p>';
r.forEach(function(x,i){h+='<button type="button" class="rst-it noenter'+(x.hot?' hot':'')+'" data-n="'+i+'"><span class="rst-ic">'+x.ic+'</span><span class="rst-tx"><b>'+esc(x.t)+'</b>'+(x.s?'<small>'+esc(x.s)+'</small>':'')+'</span><span class="rst-ck">›</span></button>';});
h+='</div><div class="row"><button class="btn" id="rstBack" type="button">‹ '+esc(T('Назад','Back'))+'</button></div></div>';ok(function(){STAT.screen('rs-news');});ok(function(){modal(h);});
var c=D.getElementById('mcard');if(!c)return;[].forEach.call(c.querySelectorAll('[data-n]'),function(b){b.onclick=function(){tap();var x=r[+b.getAttribute('data-n')];hide();setTimeout(function(){goTo(x.go);},80);};});
var bk=D.getElementById('rstBack');if(bk)bk.onclick=function(){tap();open();};}
function css(){if(D.getElementById('rstCss'))return;var s=D.createElement('style');s.id='rstCss';
var F='font-family:Rubik,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#17324a;';
s.textContent='.rst-card{'+F+'box-sizing:border-box;background:#fff;border-radius:18px;padding:12px 14px;box-shadow:0 2px 8px rgba(23,50,74,.12);text-align:left}'+
'.rst-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:8px}.rst-head b{font-size:18px}.rst-cnt{font-size:16px;color:#4d6a80;font-weight:600}'+
'.rst-row{display:flex;align-items:center;gap:10px;min-height:52px}.rst-ic{flex:none;font-size:26px;width:34px;text-align:center}'+
'.rst-tx{flex:1;min-width:0;display:flex;flex-direction:column}.rst-tx b{font-size:17px;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.rst-tx small{font-size:15px;line-height:1.25;color:#4d6a80;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.rst-do{flex:none;min-width:104px;min-height:48px;margin:0;font-size:17px;padding:0 14px}'+
'.rst-ev{'+F+'display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;min-height:56px;padding:8px 14px;border:0;border-radius:16px;background:#fff4d6;text-align:left;cursor:pointer}'+
'.rst-ev.hot{background:#ffe7a8}.rst-ev em{font-style:normal;font-size:24px;color:#8a5a00;flex:none}'+
'.rst-scr{'+F+'text-align:left}.rst-scr h2{text-align:center;font-size:22px;margin:0 0 10px}.rst-list{display:flex;flex-direction:column;gap:8px}'+
'.rst-it{'+F+'display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;min-height:60px;padding:8px 12px;border:1px solid #e2edf2;border-radius:16px;background:#fff;text-align:left;cursor:pointer}'+
'.rst-it.ok{background:#f1f8ef;border-color:#cfe8c9}.rst-it.ok .rst-tx b{color:#2f7a2f}.rst-it.hot{border-color:#f5a300}'+
'.rst-ck{flex:none;font-size:16px;font-weight:600;color:#2f9e3f}.rst-it:not(.ok) .rst-ck{color:#17324a}'+
'.rst-note{font-size:16px;line-height:1.35;color:#4d6a80;margin:12px 2px}.rst-chest{width:100%;min-height:56px;margin:12px 0 0;font-size:18px}'+
'.rst-news{'+F+'display:flex;align-items:center;justify-content:space-between;width:100%;box-sizing:border-box;min-height:52px;margin:8px 0 4px;padding:8px 14px;border:0;border-radius:14px;background:#eef5f9;font-size:17px;cursor:pointer}'+
'.rst-news em{font-style:normal;font-size:22px}';
D.head.appendChild(s);}
function wireTD(){var ws=W.winSlots||[],o=null,i;for(i=ws.length-1;i>=0;i--)if(ws[i]&&ws[i].id==='td'){o=ws[i];break;}
if(o&&!o.__rs){ws.push({id:'td',order:o.order,zone:o.zone,fit:o.fit,__rs:1,mount:o.mount,render:function(c){var d=td(),mine=chestReady(),l0=d?d.l:0;
if(d&&mine&&!d.l){d.l=1;ok(function(){CAR.list();});}
if(d&&!mine&&d.l&&!d.ch)d.l=0;
var h=null;try{h=o.render(c);}finally{if(d&&!mine&&l0&&!d.ch)d.l=l0;}
if(h)h=String(h).replace(/Сундук дня/g,T('Сундучок дня','Daily chest')).replace(/📄 [^<]*?(Путевой лист!? ?)/g,'');return h||null;}});}
(W.homeSlots||[]).push({id:'td-chest',zone:'feed',order:1,render:function(){return null;}});
var d=td();if(d&&!d.ask){d.ask=1;}}
function init(){if(!ON)return;css();wireTD();wireRSH();V3.sub('day',function(){var d=td();if(d)d.ask=1;},'rs.today');
['yard','home','cloud','day','back'].forEach(function(e){V3.sub(e,function(){setTimeout(changed,50);},'rs.today');});
setInterval(function(){if(D.hidden)return;ok(function(){if(mornOn()){var r=RT();if(r.mn!==dkey()){r.mn=dkey();sv();}}});refill();},3000);}
if(ON){if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init);else setTimeout(init,0);}
W.RST={on:ON,fill:fill,open:open,news:news,state:state,event:event,chestReady:chestReady,takeChest:takeChest,openChest:openChest,deals:deals,items:items,refresh:changed,_wk:weekKind,_rt:RT};
})();