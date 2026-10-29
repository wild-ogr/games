(function(){'use strict';
var W=window,D=document;
if(!W.V3||!W.UI||!W.VY||!V3.is||!V3.is('quarter'))return;
if(!V3.reg('quarter.srv',{s:'QUARTER',t:'Квартал с сервером'}))return;
var Q_URL='https://functions.yandexcloud.net/d4e5nfg9u466prmmiooj?op=v3';
var DEV=false;try{var m=/[?&]v3q=(\d{2,5})/.exec(location.search);if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){Q_URL=m?'http://127.0.0.1:'+m[1]+'/?op=v3':'';DEV=!!m;}}catch(e){}
if(!Q_URL||!W.fetch)return;
function L(a,b){return VY.L(a,b);}
function ok(f,d){try{return f();}catch(e){return d;}}
function esc(s){return UI.esc(s);}
function ev(k,o){ok(function(){var x={k:k};for(var j in o)x[j]=o[j];V3.ev('qs',x);});}
var ST={tok:null,q:[],busy:false,last:0,data:null,fail:0,down:0};
var LSK='vyezd-v3qs';
try{var o0=JSON.parse(localStorage.getItem(LSK)||'null');if(o0&&o0.tok&&o0.t>Date.now()-20*3600e3)ST.tok=o0.tok;if(o0&&o0.q&&o0.q.length)ST.q=o0.q.slice(-30);}catch(e){}
function keep(){try{localStorage.setItem(LSK,JSON.stringify({tok:ST.tok,t:Date.now(),q:ST.q.slice(-30)}));}catch(e){}}
var PLAT_=ok(function(){return PLAT;},'ya'),OK_=ok(function(){return!!OK;},false);
function authA(cb){
if(DEV)return cb({p:'dev',u:ok(function(){return localStorage.getItem('vyezd-v3qu');},'')||'1',cl:OK_?'ok':PLAT_==='vk'?'vk':'ya'});
if(PLAT_==='vk'){var q=location.search;if(!/vk_user_id=/.test(q))return cb(null);return cb({p:'vk',q:q,sh:0});}
try{ysdk.getPlayer({signed:true,scopes:false}).then(function(p){cb(p&&p.signature?{p:'ya',sig:p.signature}:null);},function(){cb(null);});}catch(e){cb(null);}}
function call(g,cb){if(ST.busy||Date.now()<ST.down){if(cb)cb(null);return;}ST.busy=true;var q=ST.q.splice(0,40);
function go(a){var b={q:q,g:g||[]};if(ST.tok)b.tok=ST.tok;else if(a)b.a=a;else{ST.q=q.concat(ST.q);ST.busy=false;if(cb)cb(null);return;}
var done=false,tm=setTimeout(function(){fin(null);},12000);
function fin(r){if(done)return;done=true;clearTimeout(tm);ST.busy=false;
if(!r||!r.ok){if(r&&r.why==='tok'){ST.tok=null;}ST.q=q.concat(ST.q).slice(-60);ST.fail++;if(ST.fail>=2||(r&&(r.why==='off'||r.why==='rest')))ST.down=Date.now()+Math.min(30,5*ST.fail)*60e3;keep();if(cb)cb(null);return;}
ST.fail=0;if(r.tok)ST.tok=r.tok;keep();if(cb)cb(r);}
try{fetch(Q_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(b),cache:'no-store'}).then(function(x){return x.ok?x.json():null;}).then(fin,function(){fin(null);});}catch(e){fin(null);}}
if(ST.tok)go(null);else authA(go);}
function pull(force){if(!force&&Date.now()-ST.last<120e3)return;ST.last=Date.now();var g=[['q',{}]],wp=!ST.prevAt||Date.now()-ST.prevAt>6*3600e3;if(wp)g.push(['prev',{}]);
call(g,function(r){if(r&&r.r&&r.r.q&&r.r.q.n){ST.data=r.r.q;ST.data.at=Date.now();if(wp&&r.r.prev){ST.prevAt=Date.now();onPrev(r.r.prev);}ok(function(){if(UI.cur&&UI.cur()==='home')UI.refresh();});}});}
function live(){return!!(ST.data&&Date.now()-ST.data.at<30*60e3&&Date.now()>=ST.down);}
function push(k,o){ST.q.push([k,o]);if(ST.q.length>60)ST.q=ST.q.slice(-60);keep();}
var QIDX=-1,QI=-1;
function regNo(){return ok(function(){return Math.floor(Math.max(0,(VY.S.unlocked||1)-2)/10);},0);}
function startQ(i){var d=ST.data;if(!d)return;var S=VY.S,idx=Math.max(0,(S.unlocked||1)-2);QI=i;QIDX=idx;ev('yard',{i:i});
ok(function(){VY.hide();});ok(function(){startLevel(idx,false,{mode:'fest',p:levelParams(Math.min(idx,90)),seed:(d.wk%10000)*1000+i+7});G.v3qy=i;});}
V3.sub('yard',function(info){if(!info)return;var g=VY.G,qy=g&&g.v3qy!=null?g.v3qy:-1;
if(info.ok&&!info.daily)push('yd',{n:1});
if(qy>=0){var n=ok(function(){return g.vs.filter(function(v){return v.state==='gone'||v.state==='exit';}).length;},0),t=ok(function(){return g.vs.length;},1);
push('qy',{i:qy,n:info.ok?t:Math.min(n,t),t:t,ok:info.ok?1:0,c:regNo()});}
if(info.ok&&info.moves&&qy<0&&!g.v3mu&&!g.v3gh&&!info.daily&&(!info.mode||info.mode==='n'))push('yr',{y:info.idx+1,mv:info.moves});
if(ST.q.length>=3||qy>=0)call([['q',{}]],function(r){if(r&&r.r&&r.r.q&&r.r.q.n){ST.data=r.r.q;ST.data.at=Date.now();}});},'quarter.srv');
V3.sub('home',function(){pull(false);},'quarter.srv');
V3.sub('boot',function(){setTimeout(function(){pull(true);},1500);},'quarter.srv');
function muOpen(d){return!!(d&&d.wd>=2);}
function muStep(){var u=ok(function(){return+VY.S.unlocked||1;},1);return u<12?9:u<20?14:u<40?16:20;}
function startMu(){var d=ST.data;if(!d||!muOpen(d))return;var S=VY.S,idx=Math.max(0,(S.unlocked||1)-2),k=Math.min(95,idx+muStep());ev('mu',{s:muStep()});
ok(function(){VY.hide();});ok(function(){startLevel(idx,false,{mode:'fest',p:levelParams(k),seed:(d.wk%10000)*1000+997+muStep()});G.v3mu=1;});}
V3.sub('yard',function(info){var g=VY.G;if(!info||!g||!g.v3mu)return;if(info.ok)push('mu',{ok:1,cl:info.crashes||info.hint?0:1});},'quarter.srv');
function dayNo(){return ok(function(){var t=nowMs();return Math.floor((t+3*3600e3)/864e5);},Math.floor(Date.now()/864e5));}
function startDu(){var d=ST.data;if(!d)return;var S=VY.S,idx=Math.max(0,(S.unlocked||1)-2);ev('du',{});ok(function(){VY.hide();});
ok(function(){startLevel(idx,false,{mode:'fest',p:levelParams(Math.min(idx,40)),seed:(dayNo()%100000)*10+3});G.v3du=1;});}
V3.sub('yard',function(info){var g=VY.G;if(!info||!g||!g.v3du||!info.ok)return;push('du',{v:info.moves});
setTimeout(function(){call([['duel',{}]],function(r){var u=r&&r.r&&r.r.duel;if(!u||!u.op)return;var me=u.me,op=u.op[1],nm=u.bot?L(u.op[0].split(' (')[0],'Grandpa Mityai'):L('Сосед','A neighbour');
var t=me<op?L('Ты победил: ','You win: '):me===op?L('Ничья: ','Draw: '):L('Победил '+nm+': ','Won by '+nm+': ');VY.toast('🔥 '+t+me+' : '+op+L(' ходов',' moves'),3200);ev('duel',{me:me,op:op,bot:u.bot});});},1200);},'quarter.srv');
function relTxt(e){var reg=ok(function(){return W.VYREG&&VYREG[e[2]]?L(VYREG[e[2]].name,VYREG[e[2]].en||VYREG[e[2]].name):'';},'');
return L('Начал водитель'+(reg?' из региона «'+reg+'»':'')+', вывел '+e[0]+' из '+e[1]+'. Дожмёшь?','A driver'+(reg?' from '+reg:'')+' got '+e[0]+' of '+e[1]+' out. Finish it?');}
function openMap(){var d=ST.data;if(!live()){VY.toast(L('Квартал сейчас отдыхает — загляни позже.','The quarter is resting — check back later.'),2600);return;}ev('map',{done:d.done});
var h='<h2>🏘 '+L('Наш квартал','Our quarter')+'</h2><p class="v3qS"><b>'+L('Шура: ','Shura: ')+'</b>'+esc(L('Квартал недели: 120 дворов на всю страну. Где окно горит — двор выведен. Тёмное — твоё.','Quarter of the week: 120 yards for the whole country. Lit window — yard cleared. Dark — yours to take.'))+'</p>';
var tl=things();if(tl.length)h+='<p class="v3qHint v3qTh">'+L('На твоём дворе: ','In your yard: ')+tl.slice(-6).map(function(e){return e.ic+' '+esc(e.t);}).join(' · ')+'</p>';
h+='<div class="v3qBar"><i style="width:'+Math.round(100*d.done/d.n)+'%"></i><span>'+L('Выведено ','Cleared ')+d.done+'/'+d.n+'</span></div><div class="v3qMap">';
for(var b=0;b<12;b++){h+='<div class="v3qH">';for(var k=0;k<10;k++){var i=b*10+k,on=d.b.charAt(i)==='1',rel=d.rel&&d.rel[i];h+='<button class="v3qWin noenter'+(on?' on':'')+(rel?' rel':'')+'" data-i="'+i+'"'+(on?' disabled':'')+' aria-label="'+(i+1)+'"></button>';}h+='</div>';}
h+='</div><p class="v3qHint" id="v3qRel">'+L('Нажми тёмное окно — поедешь в этот двор.','Tap a dark window to drive that yard.')+'</p>';
h+='<p class="v3qS v3qDu">🔥 <b>'+L('Дуэль дня на ходы','Moves duel of the day')+'</b> — '+esc(L('один двор на всех сегодня. Кто меньше ходов — тот и прав.','one yard for everyone today. Fewer moves wins.'))+' <button class="btn sec sm noenter" id="v3qDu">'+L('Сразиться','Duel')+'</button>'+
(W.V3POD&&V3POD.sp?' <button class="btn sec sm noenter" id="v3qSp">'+L('«Спички» с Митяем','Matchsticks')+'</button>':'')+'</p>';
if(muOpen(d)){var mu=d.mu||[0,0];h+='<p class="v3qS v3qMu">😈 <b>'+L('Двор-мучитель недели','Torment yard of the week')+'</b> — '+esc(L('самый трудный двор недели, на '+muStep()+' дворов впереди тебя.','the hardest yard of the week, '+muStep()+' yards ahead of you.'))+
(mu[0]?'<br><small>'+L('Вытащили ','Escaped: ')+mu[0]+L(' жильцов, чисто — ',' residents, clean — ')+mu[1]+'</small>':'')+' <button class="btn sec sm noenter" id="v3qMu">'+L('Поехали','Go')+'</button></p>';}
h+='<div class="mBtns"><button class="btn sec noenter" id="v3qBd">📋 '+L('Доска недели','Weekly board')+'</button><button class="btn sec" id="v3qMx">'+L('Закрыть','Close')+'</button></div>';
var m=VY.modal(h);if(!m)return;var bs=m.querySelectorAll('.v3qWin');
for(var j=0;j<bs.length;j++)bs[j].onclick=(function(i){return function(){var rel=d.rel&&d.rel[i];if(rel&&!this.__t){this.__t=1;var p=m.querySelector('#v3qRel');if(p)p.textContent=relTxt(rel);return;}startQ(i);};})(+bs[j].getAttribute('data-i'));
var x=m.querySelector('#v3qMx');if(x)x.onclick=function(){VY.hide();};var bd=m.querySelector('#v3qBd');if(bd)bd.onclick=openBoard;var mb=m.querySelector('#v3qMu');if(mb)mb.onclick=startMu;var db=m.querySelector('#v3qDu');if(db)db.onclick=startDu;var sb=m.querySelector('#v3qSp');if(sb)sb.onclick=function(){ok(function(){V3POD.sp();});};}
var TK=['sob','gal','sud','par','miss','cen'];
function QB(){return ok(function(){var b=V3T.quarter;return b&&b.themes&&b.sud&&b.sud.length?b:null;},null);}
function qbReady(fn){if(QB())return fn();ok(function(){V3T.ready(function(){if(QB())fn();});});}
function sudId(d){var b=QB();return Math.floor((d.wk||0)/TK.length)%(b?b.sud.length:12);}
function themeOf(d){var b=QB(),k=TK[(d.wk||0)%TK.length];if(!b)return null;
if(k!=='sud'){var x=b.themes[k];return x?{k:k,key:k,t:x.t,s:x.s,o:x.o}:null;}
var id=sudId(d),c=b.sud[id];return c?{k:'sud',key:'sud'+id,id:id,t:b.sud_t[0],s:c.s,o:c.o}:null;}
function theme(d){return themeOf(d);}
function openBoard(){if(!live())return;if(!QB())return qbReady(openBoard);ev('board',{});call([['votes',{}],['land',{}]],function(r){if(!r||!r.r){VY.toast(L('Доска сейчас отдыхает.','The board is resting.'),2200);return;}drawBoard(r.r.votes||{},r.r.land||{l:[]});});}
function drawBoard(vt,land){var d=ST.data,T=theme(d);if(!T)return;var my=vt._my||{},res=vt[T.key],voted=T.key in my;
var h='<h2>📋 '+L('Доска объявлений','Notice board')+'</h2><p class="v3qS"><b>'+esc(L(T.t[0],T.t[1]))+'.</b> '+esc(L(T.s[0],T.s[1]))+'</p><div class="v3qVt">';
for(var i=0;i<T.o.length;i++){var pc=res&&res.p?(res.p[i]||0):0;h+='<button class="btn sec noenter v3qV'+(voted&&my[T.key]===i?' my':'')+'" data-o="'+i+'"'+(voted?' disabled':'')+'>'+esc(L(T.o[i][0],T.o[i][1]))+(voted?' — '+pc+'%':'')+'</button>';}
h+='</div>'+(ST.prev&&ST.prev.wk?'<p class="v3qHint">📣 '+esc(prevTxt(ST.prev))+'</p>':'')+(voted&&res&&res.sosed?'<p class="v3qHint">'+L('Пока ответов мало — соседи тоже отвечали.','Few votes yet — the neighbours voted too.')+'</p>':'');
var chip=(vt.chip&&vt.chip.n)||0;h+='<p class="v3qS">🚧 '+L('Скинулись на шлагбаум: ','Barrier fund: ')+chip+L(' дворов вложено. Вклад — своим пройденным двором.',' yards chipped in. Chip in with a yard you cleared.')+' <button class="btn sec sm noenter" id="v3qChip">'+L('Вложить двор','Chip in a yard')+'</button></p>';
if(land.l&&land.l.length){var nm=function(r){return ok(function(){return W.VYREG&&VYREG[r]?L(VYREG[r].name,VYREG[r].en||VYREG[r].name):'';},'');},a=[];
for(var j=0;j<land.l.length&&a.length<3;j++){var n=nm(land.l[j][0]);if(n)a.push(n+' '+land.l[j][1]+'%');}if(a.length)h+='<p class="v3qHint">🧭 '+L('Земляки: ','Neighbours by region: ')+esc(a.join(' · '))+'</p>';}
h+='<div class="mBtns"><button class="btn sec" id="v3qBx">'+L('Закрыть','Close')+'</button></div>';
var m=VY.modal(h);if(!m)return;var bs=m.querySelectorAll('.v3qV');
for(var k=0;k<bs.length;k++)bs[k].onclick=(function(o){return function(){var vq={k:T.k,o:o};if(T.id!=null)vq.id=T.id;push('v',vq);ev('vote',{k:T.key,o:o});call([['votes',{}],['land',{}]],function(r){if(r&&r.r)drawBoard(r.r.votes||{},r.r.land||{l:[]});});};})(+bs[k].getAttribute('data-o'));
var c=m.querySelector('#v3qChip');if(c)c.onclick=function(){push('v',{k:'chip',o:0});ok(function(){V3.emit('quarter:chip',{by:'yard'});});call([['votes',{}],['land',{}]],function(r){if(r&&r.r){if(r.acc)VY.toast(L('Вложил двор. Шура записала.','Yard chipped in. Shura noted it.'),2000);else VY.toast(L('Сначала пройди свой двор — вклад только дворами.','Clear a yard first — you chip in with yards.'),2400);drawBoard(r.r.votes||{},r.r.land||{l:[]});}});};
var x=m.querySelector('#v3qBx');if(x)x.onclick=function(){VY.hide();};}
function thName(id){var x=W.QZ&&QZ.THINGS[id];return x?L(x[1],x[2]):'';}
function things(){var q=ok(function(){return V3Q.q();},null);if(!q||!q.th)return[];return q.th.map(function(e){var x=QZ.THINGS[e[1]]||['',''];return{id:e[1],ic:x[0],t:thName(e[1]),wk:e[0]};});}
function onPrev(p){ST.prev=p;if(!p||!p.wk||!W.QZ)return;if(!QB())return qbReady(function(){onPrev(p);});var T=theme({wk:p.wk}),id=QZ.thingFor(T.k,p.win,T.key);ST.prevTh=id;
if(!(p.ok&&p.my>0))return;var q=ok(function(){return V3Q.q();},null);if(!q||!QZ.addTh(q,p.wk,id))return;
ok(function(){VY.save();});ev('thing',{id:id,wk:p.wk});ok(function(){V3.emit('quarter:thing',{id:id,wk:p.wk});});
ok(function(){if(W.V3UX&&V3UX.note)V3UX.note('sub',thName(id).slice(0,24));});ST.showTh=id;thSoon();}
function prevTxt(p){if(!p||!p.wk)return'';var T=theme({wk:p.wk}),id=ST.prevTh;if(!T)return'';
return L('Итоги прошлой недели: страна вывела ','Last week: the country cleared ')+p.s+L(' из ',' of ')+p.goal+(p.ok?' ✅':'')+(id?' · '+L(T.t[0],T.t[1])+' → '+QZ.THINGS[id][0]+' '+thName(id):'');}
function showThing(){var id=ST.showTh;if(!id||!live())return;ST.showTh=null;var p=ST.prev||{},x=QZ.THINGS[id];
var h='<h2>'+x[0]+' '+L('Итоги воскресенья','Sunday results')+'</h2><p class="v3qS"><b>'+L('Шура: ','Shura: ')+'</b>'+esc(L('Субботник удался: страна вывела '+p.s+' дворов из '+p.goal+'. Твоих там — '+p.my+'. Держи на свой двор: ','Clean-up done: the country cleared '+p.s+' of '+p.goal+' yards, '+p.my+' of them yours. For your yard: '))+'<b>'+esc(thName(id))+'</b>.</p>'+
'<p class="v3qHint">'+L('Вещь недели — навсегда на «Моём дворе».','The thing of the week stays in “My yard” for good.')+'</p><div class="mBtns"><button class="btn" id="v3qThOk">'+L('Красота!','Lovely!')+'</button></div>';
var m=VY.modal(h);if(!m)return;var b=m.querySelector('#v3qThOk');if(b)b.onclick=function(){VY.hide();};}
function thSoon(){if(ST.showTh)setTimeout(function(){ok(function(){if(UI.cur&&UI.cur()==='home'&&!(D.getElementById('modal')&&D.getElementById('modal').classList.contains('on')))showThing();});},400);}
V3.sub('home',thSoon,'quarter.srv');
function subTxt(d){return L('Субботник: страна вывела ','Clean-up day: the country cleared ')+d.s+L(' из ',' of ')+d.goal;}
homeSlots.push({id:'v3q-srv',zone:'feed',order:26,render:function(){if(!live())return null;var d=ST.data;
return UI.tile({ic:'🏘',t:L('Наш квартал: ','Our quarter: ')+d.done+'/'+d.n,s:subTxt(d),prog:[d.s,d.goal],cls:'v3qQ'});},
mount:function(el){var b=el&&el.querySelector('.v3qQ');if(b)b.onclick=openMap;}});
winSlots.push({id:'v3q-sub',zone:'goal',order:61,fit:3,render:function(ctx){if(!live()||!ctx||ctx.daily)return null;var g=VY.G;
if(g&&g.v3du)return'<div class="v3qW">🔥 '+L('Дуэль дня: ','Duel of the day: ')+g.moves+L(' ходов. Ждём соперника…',' moves. Waiting for a rival…')+'</div>';
if(g&&g.v3mu)return'<div class="v3qW">😈 '+L('Двор-мучитель недели повержен!','Torment yard beaten!')+'</div>';
if(g&&g.v3qy!=null)return'<div class="v3qW">🏘 '+L('Двор квартала выведен! Окно загорелось.','Quarter yard cleared! The window lights up.')+'</div>';
return null;}});
W.V3QS={open:openMap,board:openBoard,pull:pull,st:function(){return ST;},live:live,start:startQ,things:things,prev:onPrev,showThing:showThing,call:call,push:push,url:function(){return Q_URL;}};
})();