(function(root){
'use strict';
var CFG={N:40,TH:[5,18,30],WD:[0,2,4],MINU:10,MIND:3};
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function days(dk){dk=+dk||0;var y=Math.floor(dk/1e4),m=Math.floor(dk/100)%100,d=dk%100;if(y<1970||m<1||m>12||d<1)return Math.floor(Date.now()/864e5);return Math.floor(Date.UTC(y,m-1,d)/864e5);}
function week(dk){return Math.floor((days(dk)+3)/7);}
function wday(dk){return(days(dk)+3)%7;}
var WHO=[
{id:'tolik',n:['Толик','Tolik'],car:'kopeyka',al:['Весь вечер был в гараже — Михалыч видел через щель.','In his garage all evening — Mikhalych saw him through the gap.'],
conf:['«Не угонял, а обкатывал после ремонта! Глушитель поменял — скажите спасибо.»','“Not stolen — test-driven after a repair! New muffler. You’re welcome.”']},
{id:'mihalych',n:['Михалыч','Mikhalych'],car:'zapor',al:['Подметал двор. Метла подтверждает.','Was sweeping the yard. The broom confirms it.'],
conf:['«Я его с дороги убрал, чтобы подмести. Ну и проехал до рынка. Раз уж убрал.»','“Moved it to sweep. Then drove to the market. Since it was moved anyway.”']},
{id:'valerka',n:['Валерка','Valerka'],car:'shesterka',al:['Был на рыбалке. Рыбы нет, но комары подтверждают.','Out fishing. No fish, but the mosquitoes confirm.'],
conf:['«Девушку на свидание! На «Москвиче» — это же классика. Она сказала — винтаж.»','“Took a girl on a date! A Moskvich is a classic. She said — vintage.”']},
{id:'mityai',n:['Митяй','Mityai'],car:'niva',al:['Играл в домино. Проиграл — значит, точно был.','Playing dominoes. Lost — so he was definitely there.'],
conf:['«Поспорил с мужиками, что заведу с первого раза. Завёл! Ну и поехал, раз завёлся.»','“Bet the lads I’d start it first try. I did! Well, once it’s running…”']},
{id:'klava',n:['Клава с третьего','Klava from the 3rd'],car:'oka',al:['Смотрела сериал. Пересказала все серии. Все.','Watching her series. Retold every episode. Every one.'],
conf:['«Рассаду на дачу. В мою «Оку» помидоры не влезают, а у деда багажник.»','“Seedlings for the dacha. My Oka won’t fit tomatoes; your grandad’s has a boot.”']},
{id:'galya',n:['Галя из 12-й','Galya from No. 12'],car:'volga',al:['Галя сказала, что была дома. Галя всегда так говорит.','Galya says she was home. Galya always says that.'],
conf:['«Я его не угоняла. Я его ВЗЯЛА. Он загораживал мою «Волгу» с девяносто восьмого года.»','“I didn’t steal it. I TOOK it. It’s been blocking my Volga since ’98.”']},
{id:'tolya5',n:['Сосед с пятого','The neighbour from the 5th'],car:'gazel',al:['Переезжал. Опять. Грузчики подтверждают.','Moving house. Again. The movers confirm.'],
conf:['«Шкаф перевезти! Шкаф старый, «Москвич» старый — подумал, они договорятся.»','“To move a wardrobe! Old wardrobe, old Moskvich — thought they’d get along.”']},
{id:'zyatj',n:['Зять деда','Grandad’s son-in-law'],car:'devyatka',al:['Был у тёщи. Тёща подтверждает. С выражением.','At his mother-in-law’s. She confirms. With feeling.'],
conf:['«Я ж свой! Тесть сам ключи под коврик кладёт. Двадцать лет под один и тот же.»','“I’m family! He’s kept the keys under the same mat for twenty years.”']}];
var TIRE=[['«ёлочкой»','herringbone'],['с шипами','studded'],['лысые, гладкие','bald'],['в клеточку','checkered'],['широкие, как у трактора','tractor-wide']];
var PAINT=[['красная','red','#c8372d'],['синяя','blue','#2f5fb3'],['зелёная','green','#2e8b57'],['жёлтая','yellow','#e0b323'],['белая','white','#e8e8e8'],['бежевая','beige','#d8c39a']];
var HOBBY=[['рыбалка','fishing','рыбья чешуя','fish scales'],['дача','the dacha','комок земли с рассадой','a clump of soil with seedlings'],['домино','dominoes','костяшка «пусто-пусто»','a blank domino'],
['семечки','sunflower seeds','горка шелухи от семечек','a pile of seed husks'],['кроссворды','crosswords','огрызок карандаша','a pencil stub'],['голуби','pigeons','пёрышко','a feather'],['баня','the banya','берёзовый листок от веника','a birch leaf from a banya broom'],['гармонь','the accordion','пуговка от гармони','an accordion button']];
function pick(R,a,n){var b=a.slice(),o=[];while(o.length<n&&b.length)o.push(b.splice(Math.floor(R()*b.length),1)[0]);return o;}
function caseOf(wk){var R=rng(wk*2654435761+77),who=pick(R,WHO,3),tr=pick(R,[0,1,2,3,4],2),pa=pick(R,[0,1,2,3,4,5],2),hb=pick(R,[0,1,2,3,4,5,6,7],3);
var base=[{w:who[0],t:tr[0],p:pa[0],h:hb[0]},{w:who[1],t:tr[0],p:pa[1],h:hb[1]},{w:who[2],t:tr[1],p:pa[0],h:hb[2]}],ord=pick(R,[0,1,2],3),s=[],thief=0;
for(var i=0;i<3;i++){s.push(base[ord[i]]);if(ord[i]===0)thief=i;}
return{wk:wk,s:s,thief:thief,clue:[{k:'t',v:base[0].t},{k:'p',v:base[0].p},{k:'h',v:base[0].h}]};}
function fits(C,n){var o=[];for(var i=0;i<3;i++){var x=C.s[i],ok=true;for(var j=0;j<n;j++){var c=C.clue[j];if(c.k==='t'&&x.t!==c.v||c.k==='p'&&x.p!==c.v||c.k==='h'&&x.h!==c.v)ok=false;}if(ok)o.push(i);}return o;}
function fresh(wk){return{v:1,wk:wk,p:0,c:0,g:0,r:0,a:-1,n:0,w:0,lw:null,th:[]};}
function roll(q,wk){if(q.wk===wk)return false;var lw=q.wk&&(q.p>0||q.g>0)?{wk:q.wk,t:caseOf(q.wk).thief,r:q.r}:q.lw;var n=q.n,w=q.w;
var th=q.th||[];var f=fresh(wk);f.n=n;f.w=w;f.lw=lw;f.th=th;for(var k in f)q[k]=f[k];return true;}
function due(q,wd){var c=0;for(var i=0;i<3;i++)if(q.p>=CFG.TH[i]&&wd>=CFG.WD[i])c=i+1;return c;}
function onYard(q,wd){if(q.p>=CFG.N&&q.c>=due(q,wd))return{clue:0,full:0};var p0=q.p;if(q.p<CFG.N)q.p++;if(p0===0)q.w++;
var d=due(q,wd),r={clue:0,full:q.p===CFG.N&&p0<CFG.N?1:0};if(d>q.c&&q.r===0){q.c++;r.clue=q.c;}return r;}
function catchUp(q,wd){var d=due(q,wd);if(q.r===0&&d>q.c){q.c=d;return d;}return 0;}
function canGuess(q){return q.r===0&&q.c>=1&&q.g<3;}
function guess(q,i){if(!canGuess(q))return null;var C=caseOf(q.wk);q.g++;q.a=i;if(i===C.thief){q.r=1;q.n++;return'ok';}if(q.g>=3){q.r=2;return'over';}return'no';}
function card(q){var s='';for(var i=0;i<3;i++)s+=i<q.c?'🔍':'⬜';return s;}
var THINGS={bench:['🪑','Лавочка от собрания','Meeting’s bench'],lamp:['🏮','Фонарь у арки','Arch lamp'],sand:['🏖','Песочница','Sandpit'],gate:['🚧','Шлагбаум квартала','Quarter barrier'],
shura:['📜','Табличка «Старшая — Шура»','“Shura in charge” sign'],galya:['🌼','Галина клумба','Galya’s flowerbed'],tape:['📏','Рулетка товарищеского суда','Court tape measure'],
cup:['🏆','Кубок пари','Bet cup'],ribbon:['🎀','Лента «Мисс двора»','“Miss Yard” ribbon'],census:['📋','Табличка «Двор переписан»','“Yard counted” sign']};
function thingFor(k,win,key){win=win||{};var o=+win[key||k]||0;
if(k==='sob')return['bench','lamp','sand','gate'][o]||'bench';if(k==='gal')return o===1?'galya':'shura';
return{sud:'tape',par:'cup',miss:'ribbon',cen:'census'}[k]||'bench';}
function fixTh(a){var r=[],seen={};if(!Array.isArray(a))return r;for(var i=0;i<a.length&&r.length<60;i++){var e=a[i];if(!Array.isArray(e))continue;var w=+e[0]||0,id=String(e[1]||'');
if(w>0&&THINGS[id]&&!seen[w]){seen[w]=1;r.push([w,id]);}}return r;}
function unionTh(a,b){return fixTh((a||[]).concat(b||[])).sort(function(x,y){return x[0]-y[0];});}
function addTh(q,wk,id){q.th=fixTh(q.th);if(!THINGS[id]||!(wk>0))return false;for(var i=0;i<q.th.length;i++)if(q.th[i][0]===wk)return false;q.th.push([wk,id]);q.th=q.th.slice(-60);return true;}
function fixQ(v,wk){if(!v||typeof v!=='object'||Array.isArray(v))v=fresh(wk||0);var f=fresh(0);for(var k in f)if(!(k in v))v[k]=f[k];
['wk','p','c','g','r','n','w'].forEach(function(k){v[k]=+v[k]||0;if(v[k]<0)v[k]=0;});if(v.p>CFG.N)v.p=CFG.N;if(v.c>3)v.c=3;if(v.g>3)v.g=3;if(v.r>2)v.r=0;
if(typeof v.a!=='number')v.a=-1;if(v.lw&&typeof v.lw!=='object')v.lw=null;v.th=fixTh(v.th);return v;}
function mergeQ(a,b){a=fixQ(a);b=fixQ(b);if(a.wk!==b.wk){var x=a.wk>b.wk?a:b,y=x===a?b:a;x.n=Math.max(x.n,y.n);x.w=Math.max(x.w,y.w);x.th=unionTh(x.th,y.th);return x;}
var r=fixQ(JSON.parse(JSON.stringify(a)));r.p=Math.max(a.p,b.p);r.c=Math.max(a.c,b.c);r.n=Math.max(a.n,b.n);r.w=Math.max(a.w,b.w);
var m=b.r&&!a.r||(b.r&&a.r&&b.g>a.g)?b:a;r.r=m.r;r.g=Math.max(a.g,b.g);r.a=m.a;r.lw=a.lw||b.lw;r.th=unionTh(a.th,b.th);return r;}
var QZ={CFG:CFG,week:week,wday:wday,caseOf:caseOf,fits:fits,fresh:fresh,roll:roll,due:due,onYard:onYard,catchUp:catchUp,canGuess:canGuess,guess:guess,card:card,fix:fixQ,merge:mergeQ,THINGS:THINGS,thingFor:thingFor,addTh:addTh,WHO:WHO,TIRE:TIRE,PAINT:PAINT,HOBBY:HOBBY};
root.QZ=QZ;
if(typeof document==='undefined'||!root.V3||!root.UI||!root.VY)return;
var W=root,D=document;
if(!V3.reg||!V3.reg('quarter',{s:'QUARTER',t:'Наш квартал'}))return;
var MOSK=V3.reg('quarter.mosk',{s:'QUARTER',t:'Пилот «Кто угнал Москвич деда?»'});
function L(a,b){return VY.L(a,b);}
function Lp(p){return VY.L(p[0],p[1]);}
function ok(f,d){try{return f();}catch(e){return d;}}
function esc(s){return UI.esc(s);}
function ev(k,o){ok(function(){var x={k:k};for(var j in o)x[j]=o[j];V3.ev('qz',x);});}
function dk(){return ok(function(){return V3.dk();},0);}
V3.field('v3q',{s:'QUARTER',def:function(){return fresh(week(dk()));},fix:function(v){return fixQ(v,week(dk()));},
merge:function(loc,cl){return mergeQ(loc,cl);}});
function Q(){var S=VY.S;if(!S)return null;S.v3q=fixQ(S.v3q,week(dk()));return S.v3q;}
function done(){return Math.max(0,(+(VY.S||{}).unlocked||1)-1);}
function allowed(){if(!MOSK||!V3.is('quarter.mosk'))return false;return done()>=CFG.MINU&&(ok(function(){return V3.vet();},false)||ok(function(){return V3.day();},1)>=CFG.MIND);}
function tick(){var q=Q();if(!q)return null;var wk=week(dk()),ch=false;if(roll(q,wk))ch=true;var c=catchUp(q,wday(dk()));if(c){ch=true;ev('clue',{n:c,u:q.p,w:1});}if(ch)ok(function(){VY.save();});return q;}
var last=null;
V3.sub('yard',function(info){last=null;if(!info||!info.ok||info.daily||!allowed())return;if(info.mode&&info.mode!=='n')return;
var q=tick();if(!q)return;var st=q.p===0;var r=onYard(q,wday(dk()));if(st)ev('start',{wk:q.wk%100,u:done()});
if(r.clue){ev('clue',{n:r.clue,u:q.p});}if(r.full)ev('full',{c:q.c,g:q.g});
last={idx:info.idx,clue:r.clue,full:r.full,p:q.p};W.__qlast=last;
ok(function(){VY.save();});},'quarter.mosk');
function carNm(id){return ok(function(){return VYCARS.nm(id);},id);}
function clueTxt(C,j){var c=C.clue[j];if(c.k==='t')return L('Следы шин '+TIRE[c.v][0],'Tyre tracks: '+TIRE[c.v][1]);
if(c.k==='p')return L('На столбе у арки — краска: '+PAINT[c.v][0],'Paint on the arch post: '+PAINT[c.v][1]);return L('Под машиной нашлось: '+HOBBY[c.v][2],'Found under a car: '+HOBBY[c.v][3]);}
function clueIc(c){return c.k==='t'?'🛞':c.k==='p'?'🎨':'🔎';}
var UNDER=['paz','gazel','buhanka','kabluk','raf','hleb','moloko','gazon'];
function underCar(q){var id=UNDER[(q.wk*7+q.c*3)%UNDER.length];return ok(function(){return VYCARS.get(id)?carNm(id):'';},'')||L('«Пазиком»','the bus');}
function shura(t){return'<p class="v3qS"><b>'+L('Шура: ','Shura: ')+'</b>'+esc(t)+'</p>';}
var INTRO=[['У деда «Москвич» увели. Он говорит — инопланетяне. Я говорю — Галя. Проверим по дворам.','Grandad’s Moskvich is gone. He says aliens. I say Galya. Let’s check the yards.'],
['Дед вышел — а «Москвича» нет. Место тёплое. Значит, недалеко уехал. Ищем.','Grandad came out — no Moskvich. The spot’s still warm. Not far, then. Let’s look.'],
['Опять «Москвич» пропал. Дед уже не волнуется, дед ведёт протокол. Я — следствие.','The Moskvich is missing again. Grandad isn’t worried — he’s taking notes. I’m the investigation.']];
function sideSvg(x){var col=PAINT[x.p][2];return ok(function(){return VYCARS.svg(x.w.car,{view:'side',color:col,w:120,h:52});},'')||'🚗';}
function openCase(){var q=tick();if(!q)return;var C=caseOf(q.wk),nf=fits(C,q.c);ev('open',{c:q.c,p:q.p,g:q.g});
var h='<h2>🔍 '+L('Кто угнал «Москвич» деда?','Who took Grandad’s Moskvich?')+'</h2>';
if(q.lw&&q.lw.wk===q.wk-1&&q.p<1){var P=caseOf(q.lw.wk).s[q.lw.t];h+=shura(L('На прошлой неделе это был ','Last week it was ')+Lp(P.w.n)+'. '+Lp(P.w.conf));}
h+=shura(Lp(INTRO[q.wk%INTRO.length]));
h+='<div class="v3qBar"><i style="width:'+Math.round(100*q.p/CFG.N)+'%"></i><span>'+L('Дворов квартала: ','Quarter yards: ')+q.p+'/'+CFG.N+' · '+card(q)+'</span></div>';
h+='<div class="v3qCl">';for(var j=0;j<3;j++){if(j<q.c)h+='<div>'+clueIc(C.clue[j])+' '+esc(clueTxt(C,j))+'</div>';
else h+='<div class="dim">⬜ '+L('Улика '+(j+1)+' — с '+CFG.TH[j]+'-го двора, ','Clue '+(j+1)+' — from yard '+CFG.TH[j]+', ')+[L('с понедельника','from Monday'),L('со среды','from Wednesday'),L('с пятницы','from Friday')][j]+'</div>';}
h+='</div><div class="v3qSus">';
for(var i=0;i<3;i++){var x=C.s[i],out=q.c>0&&nf.indexOf(i)<0,tag=q.r&&i===C.thief?' thief':'',miss=q.r!==1&&q.g>0&&q.a===i&&i!==C.thief;
h+='<button class="v3qC noenter'+(out?' out':'')+tag+'" data-i="'+i+'"'+(canGuess(q)?'':' disabled')+'>'+sideSvg(x)+'<b>'+esc(Lp(x.w.n))+'</b><small>'+esc(carNm(x.w.car))+'</small>'+
'<small>🛞 '+esc(L(TIRE[x.t][0],TIRE[x.t][1]))+'</small><small>🎨 '+esc(L(PAINT[x.p][0],PAINT[x.p][1]))+'</small><small>❤ '+esc(L(HOBBY[x.h][0],HOBBY[x.h][1]))+'</small>'+(miss?'<em>✗</em>':'')+'</button>';}
h+='</div>';
if(q.r===1){var T=C.s[C.thief];h+=shura(L('Раскрыто! ','Solved! ')+Lp(T.w.n)+'. '+Lp(T.w.conf))+'<p class="v3qCard">'+card(q)+' · '+L('с '+q.g+'-й попытки','attempt '+q.g)+'</p>';}
else if(q.r===2){var T2=C.s[C.thief];h+=shura(L('Не угадали. А это был ','Missed. It was ')+Lp(T2.w.n)+'. '+Lp(T2.w.conf))+'<p class="v3qCard">'+card(q)+' · ✗✗✗</p>';}
else if(q.c>0)h+='<p class="v3qHint">'+L('Нажми на машину, если думаешь, что это она. Попыток: ','Tap the car you suspect. Tries left: ')+(3-q.g)+'</p>';
else h+='<p class="v3qHint">'+L('Проходи дворы маршрута — под машинами найдутся улики.','Clear route yards — clues turn up under the cars.')+'</p>';
h+='<div class="mBtns"><button class="btn" id="v3qGo">'+L('Ехать по дворам','Drive on')+'</button><button class="btn sec" id="v3qX">'+L('Закрыть','Close')+'</button></div>';
var m=VY.modal(h);if(!m)return;
var bs=m.querySelectorAll('.v3qC');for(var k=0;k<bs.length;k++)bs[k].onclick=(function(i){return function(){doGuess(i);};})(+bs[k].getAttribute('data-i'));
var g=m.querySelector('#v3qGo');if(g)g.onclick=function(){VY.hide();ok(function(){UI.go('game',{idx:done()});});};
var x2=m.querySelector('#v3qX');if(x2)x2.onclick=function(){VY.hide();};}
function doGuess(i){var q=Q();if(!q||!canGuess(q))return;var C=caseOf(q.wk),r=guess(q,i);ok(function(){VY.save();});ev('guess',{r:r,g:q.g,c:q.c});
if(r==='ok'){ok(function(){SND.coin();});ev('end',{r:1,g:q.g,c:q.c});}
else if(r==='over')ev('end',{r:2,g:q.g,c:q.c});
else ok(function(){VY.toast(L('Не он. ','Not them. ')+Lp(C.s[i].w.al),3200);});
openCase();}
function stripTxt(q){return L('Москвич деда: ','Grandad’s car: ')+q.p+'/'+CFG.N+' · '+card(q);}
function hot(q){return q.r===0&&q.c>q.g&&q.c>0;}
homeSlots.push({id:'th-street',zone:'thing',order:30,render:function(){if(!allowed()||W.RSS&&RSS.on)return null;var q=tick();if(!q)return null;
return{at:'street',t:L('Кто угнал «Москвич»?','Who took the Moskvich?'),short:L('Москвич','Moskvich'),go:openCase,badge:q.r?'':(q.c?'🔍':'!'),hot:hot(q)};}});
homeSlots.push({id:'v3q-feed',zone:'feed',order:25,render:function(){if(!allowed()||V3.is('skin.home'))return null;var q=tick();if(!q)return null;
return UI.tile({ic:'🔍',t:L('Кто угнал «Москвич» деда?','Who took Grandad’s Moskvich?'),s:stripTxt(q),prog:[q.p,CFG.N],tag:q.r===1?'✓':'',cls:'v3qT'});},
mount:function(el){var b=el&&el.querySelector('.v3qT');if(b)b.onclick=openCase;}});
winSlots.push({id:'v3q-win',zone:'goal',order:60,fit:3,render:function(ctx){if(!last||!ctx||last.idx!==ctx.idx||!allowed())return null;if(ok(function(){return VY.G&&VY.G.v3qy!=null&&W.V3QS&&V3QS.live();},false))return null;var q=Q();if(!q)return null;
if(last.clue){var C=caseOf(q.wk);return'<div class="v3qW clue">🔍 '+L('Под '+underCar(q)+' нашлась улика '+last.clue+'/3: ','Clue '+last.clue+'/3 under a car: ')+'<b>'+esc(clueTxt(C,last.clue-1))+'</b> <button class="btn sec sm noenter" id="v3qOpen">'+L('Дело','Case')+'</button></div>';}
if(last.full)return'<div class="v3qW">🔍 '+L('Квартал пройден: 40/40! Дед благодарит.','Quarter done: 40/40! Grandad says thanks.')+'</div>';
if(q.p>=CFG.N)return null;return'<div class="v3qW">🔍 '+esc(stripTxt(q))+'</div>';},
mount:function(el){var b=el&&el.querySelector('#v3qOpen');if(b)b.onclick=function(){VY.hide();setTimeout(openCase,60);};}});
W.V3Q={open:openCase,q:Q,allowed:allowed,tick:tick};
})(typeof window!=='undefined'?window:this);