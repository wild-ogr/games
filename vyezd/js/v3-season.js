(function(){
'use strict';
var W=window,D=document;
if(!W.V3||!W.V3CAL)return;
var C=W.V3CAL;
function S_(){try{return S;}catch(e){return null;}}
function G_(){try{return G;}catch(e){return null;}}
function Lg(r,e){try{return LANG==='en'?e:r;}catch(x){return r;}}
function sv(){try{save();}catch(e){}}
function mx(a,b){return Math.max(+a||0,+b||0);}
function uni(a,b){var o={},r=[];(a||[]).concat(b||[]).forEach(function(x){if(!o[x]){o[x]=1;r.push(x);}});return r;}
var DEF={v:1,s:0,ep:0,epk:0,epn:0,oc:0,ex:0,exn:0,ek:0,ed:0,pt:{},chw:0,nw:0,nwk:0,nwc:0,sy:0,bdy:0,bw:0,nvs:0,cd:[],rk:0,rr:0,tree:0,seen:0};
V3.field('v3c',{s:'V3-SEASON',def:function(){return JSON.parse(JSON.stringify(DEF));},
fix:function(v){if(!v||typeof v!=='object')v={};for(var k in DEF){if(k==='pt'){if(!v.pt||typeof v.pt!=='object'||Array.isArray(v.pt))v.pt={};}
else if(k==='cd'){if(!Array.isArray(v.cd))v.cd=[];v.cd=v.cd.filter(function(x){return typeof x==='number'&&x>=0&&x<100;}).slice(0,40);}
else if(typeof v[k]!=='number'||!isFinite(v[k])||v[k]<0)v[k]=DEF[k];}return v;},
merge:function(a,b){a=a||{};b=b||{};var r={};for(var k in DEF){if(k==='pt'){r.pt={};var x;for(x in a.pt||{})r.pt[x]=1;for(x in b.pt||{})r.pt[x]=1;}else if(k==='cd')r.cd=uni(a.cd,b.cd);else r[k]=mx(a[k],b[k]);}
if((+a.s||0)!==(+b.s||0)){var n=(+a.s||0)>(+b.s||0)?a:b;['ep','epk','epn','oc','ex','exn'].forEach(function(k){r[k]=+n[k]||0;});}
if((+a.ek||0)!==(+b.ek||0)){var m=(+a.ek||0)>(+b.ek||0)?a:b;r.ed=+m.ed||0;}
return r;}});
var ON=V3.reg('season',{s:'V3-SEASON',t:'Календарь на стене: сезоны, сериал, праздники, события на всех'});
var PARTS={cal:'Календарь на стене (th-calendar)',ser:'Сериал сезона: Ока Шуры, уроки, экзамен',evt:'Событие на 2 недели с краской',chaika:'Чайка по четвергам 19–20',
snow:'Первый снег у всех',rule:'Праздник меняет правило двора',bday:'День рождения бабы Шуры',novosel:'Новосёл в 34-й',number:'Номер недели',
card:'Открытки городов и праздничные машины',bazar:'Ёлка во дворе (базар)',deco:'Сезонный декор главного'};
for(var pk in PARTS)V3.reg('season.'+pk,{s:'V3-SEASON',t:PARTS[pk]});
if(!ON||!V3.on)return;
function is(k){return V3.is('season.'+k);}
function st(){var s=S_();return s&&s.v3c?s.v3c:null;}
function ev(a,o){try{o=o||{};o.a=a;V3.ev('season',o);}catch(e){}}
function warn(w,e){try{if(W.console)console.warn('v3-season '+w,e);}catch(x){}}
function qp(k){try{if(!/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname)&&location.protocol!=='file:')return null;var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):null;}catch(e){return null;}}
function dk(){return+V3.dk()||C.keyOf(Math.floor(Date.now()/864e5));}
function hour(){var q=qp('v3ch');if(q!=null&&q!=='')return+q;try{return new Date(nowMs()).getHours();}catch(e){return 12;}}
function snowSrv(){if(W.V3C_SNOW)return+W.V3C_SNOW;
try{if(W.FEST&&FEST.table){var y=Math.floor(dk()/1e4),t=FEST.table();for(var i=0;i<t.length;i++){var f=t[i];if(/^zima/.test(f.id)&&String(f.from).slice(0,4)===String(y))return+String(f.from).replace(/-/g,'');}}}catch(e){}return 0;}
function today(){return C.day(dk(),{snow:snowSrv()});}
function dur(t,joke){var n=String(t||'').length;return Math.round(1000*(joke?Math.min(30,8+.2*n):Math.min(20,5+.12*n)));}
function pickT(path,i){var a=[];try{a=W.V3T?V3T.all(path):[];}catch(e){}if(!a.length)return'';var x=a[i==null?Math.floor(Math.random()*a.length):Math.min(i,a.length-1)];
if(typeof x==='string')return Lg(x,'');return Lg(x[0],x[1]||x[0]);}
function fill(t,o){return String(t||'').replace(/\{(\w+)\}/g,function(m,k){return o&&o[k]!=null?o[k]:m;});}
function sayYard(t,joke){var g=G_();if(!g||!t)return;try{say(t);var b=g.bubbles&&g.bubbles[0];if(b)b.life=dur(t,joke)/1000;}catch(e){warn('say',e);}}
function sayHome(t){if(!t)return;try{if(W.V3SKIN&&V3SKIN.say)V3SKIN.say(t,'shura');else toast(t,dur(t));}catch(e){}}
function toastL(t){if(!t)return;try{toast(t,dur(t));}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ds(k){var s=String(k);return s.slice(6,8)+'.'+s.slice(4,6);}
var EV={ny:['Новый год','New Year','#e5484d','Н'],mar8:['8 Марта','Women’s Day','#ff6fa5','8'],sep1:['1 Сентября','September 1st','#3f8fe0','1'],
bday:['День рождения бабы Шуры','Granny Shura’s birthday','#a29bfe','Ш'],snow:['Первый снег','First snow','#9fc6e8','❄'],season:['Новый сезон','New season','#2fa84f','С'],
evt:['Новое дело двора','New yard task','#ff8c2a','Д'],novosel:['Новосёл в 34-й','New neighbour in flat 34','#c98d5a','34'],chaika:['«Чайка» в 19:00','The Chaika at 7 pm','#1d1f24','Ч'],
number:['Номер недели','Number of the week','#2d3436','#'],ep:['Серия сериала','Today’s episode','#636e72','▶']};
var SER_T={};function serTitle(id){if(typeof LANG!=='undefined'&&LANG==='en')return SER_EN[id]||id;var a=[];try{a=W.V3T?V3T.all('serial'):[];}catch(e){}for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i].t;
return SER_RU[id]||id;}
var SER_RU={prava:'Шура сдаёт на права',inomarka:'Галя купила иномарку',novosel:'Новосёл в 34-й'},
SER_EN={prava:'Shura takes her driving test',inomarka:'Galya buys a foreign car',novosel:'The new neighbour in flat 34',volga:'The black Volga',pobeda:'The rusty Pobeda',domino:'The domino tournament',
barsik:'Barsik is missing',svadba:'Mikhalych’s granddaughter’s wedding',urok:'Valerka learns to drive',moskvich:'Kuzmich sells his Moskvich',ugon:'The missing Moskvich',vybory:'Galya runs for yard head'};
function evName(id){var e=EV[id];return e?Lg(e[0],e[1]):id;}
var CH_EN={ny:'NY',bday:'S',season:'S',evt:'T',chaika:'C',number:'#'};
function chip(id){var e=EV[id]||EV.ep,g=e[3];if(typeof LANG!=='undefined'&&LANG==='en'&&CH_EN[id])g=CH_EN[id];return'<b class="v3cI" style="background:'+e[2]+'">'+g+'</b>';}
function freshen(){var s=st(),d=today();if(!s)return d;var ch=false;
if(s.s!==d.s){s.s=d.s;s.ep=0;s.epk=0;s.epn=0;s.oc=0;s.ex=0;s.exn=0;ch=true;}
if(s.ek!==d.evt.key){s.ek=d.evt.key;s.ed=0;ch=true;}
if(s.epk!==d.k&&s.epn){s.epn=0;ch=true;}
var wk=C.weekKey(d.k);if(s.nwk!==wk){s.nwk=wk;s.nwc=0;ch=true;}
if(ch)sv();return d;}
function prava(d){return d.ser==='prava'||d.ser==='inomarka';}
function lessonDue(d){var s=st();return!!s&&is('ser')&&prava(d)&&s.oc>=4&&s.ep<13&&!(s.epk===d.k&&s.epn>=2);}
function examDue(d){var s=st();return!!s&&is('ser')&&prava(d)&&s.ep>=13&&!s.ex&&d.sday>=15;}
var PBASE=30;
function paintIdx(id){for(var i=0;i<C.EVT.length;i++)if(C.EVT[i].id===id)return PBASE+i;return 0;}
function regPaint(e){try{var k=paintIdx(e.id);if(!k||typeof PAINT==='undefined')return k;if(!PAINT[k]){PAINT[k]=[e.c,Lg(e.p[0],e.p[1]),'gift'];}
if(typeof PAINT_EN!=='undefined')PAINT_EN[k]=e.p[1];if(PAINT.ru)PAINT.ru[k]=e.p[0];return k;}catch(x){warn('paint',x);return 0;}}
function paints(){var s=st();if(!s)return;var d=today();if(is('evt'))regPaint(d.evt);C.EVT.forEach(function(e){if(s.pt[e.id])regPaint(e);});}
if(typeof W.paintHow==='function'||typeof paintHow==='function'){try{var PH0=paintHow;paintHow=function(k){if(k>=PBASE&&k<PBASE+C.EVT.length){var e=C.EVT[k-PBASE];
return Lg('Краска «'+e.p[0]+'» — награда за дело двора «'+e.t[0]+'» (календарь на стене подъезда). Не продаётся.','The “'+e.p[1]+'” paint is the reward for the yard task “'+e.t[1]+'” (the calendar on the stairwell wall). Not for sale.');}return PH0.apply(this,arguments);};}catch(e){}}
var TREE={id:'v3tree',name:'Ёлка во дворе',about:'С ёлочного базара Михалыча. Стоит во дворе всю зиму — и дольше, если не разбирать.',price:0,
en:{name:'Yard Christmas tree',about:'From Mikhalych’s tree market. Stands in the yard all winter — longer if nobody takes it down.'}};
function treeDraw(g,x,y,s){g.save();g.fillStyle='#8a5a3a';g.fillRect(x-s*.06,y-s*.14,s*.12,s*.14);var lv=[[.0,.42,.5],[.22,.34,.38],[.42,.26,.28]];
g.fillStyle='#2f8a3e';for(var i=0;i<lv.length;i++){var b=y-s*.12-s*lv[i][0],h=s*lv[i][1],w=s*lv[i][2];g.beginPath();g.moveTo(x-w,b);g.lineTo(x+w,b);g.lineTo(x,b-h);g.closePath();g.fill();}
var c=['#e5484d','#ffd23f','#3f8fe0','#fff'];for(i=0;i<6;i++){g.fillStyle=c[i%4];g.beginPath();g.arc(x+Math.sin(i*2.1)*s*.2*(1-i/8),y-s*.2-i*s*.09,Math.max(1.2,s*.035),0,7);g.fill();}
g.fillStyle='#ffd23f';g.beginPath();g.arc(x,y-s*.8,Math.max(1.5,s*.05),0,7);g.fill();g.restore();}
function treeReg(){try{var s=S_();if(!s||!s.dec||!s.dec.v3tree||!is('bazar'))return;if(typeof DECOR==='undefined'||typeof DECO==='undefined')return;
if(!DECOR.some(function(d){return d.id==='v3tree';})){var t=JSON.parse(JSON.stringify(TREE));if(typeof LANG!=='undefined'&&LANG==='en'){t.name=TREE.en.name;t.about=TREE.en.about;}DECOR.push(t);}
if(!DECO.v3tree)DECO.v3tree=treeDraw;}catch(e){warn('tree',e);}}
function bazarNow(d){try{if(W.FESTVY&&FESTVY.cur){var c=FESTVY.cur();if(c&&c.k==='ny')return true;}}catch(e){}return d.bazar;}
function treeGive(d){var s=S_(),c=st();if(!s||!c||!is('bazar')||!bazarNow(d))return;if(!s.dec)s.dec={};if(s.dec.v3tree)return;
s.dec.v3tree=1;c.tree=Math.floor(d.k/1e4);sv();treeReg();toastL('🎄 '+(pickT('season.bazar',1)||Lg('Ёлка теперь стоит во дворе.','The tree now stands in the yard.')));ev('tree',{});}
function chaikaChk(){var c=st(),d=today();if(!c||!is('chaika'))return;var wk=C.weekKey(d.k);if(c.chw===wk||!C.chaikaNow(d.k,hour()))return;
var A=W.ALB,s=S_();c.chw=wk;var got=false;try{if(A&&A.give)got=A.give('chaika','v3c',true);if(!got&&A&&s&&s.alb&&s.alb.chaika>0&&s.alb.chaika<4){s.alb.chaika++;got=true;}}catch(e){warn('chaika',e);}
sv();toastL(pickT('season.chaika',1)||Lg('«Чайка» приехала! Записала в твой альбом.','The Chaika is here! It’s in your album.'));ev('chaika',{g:got?1:0});}
function novoselCar(d){d=d||today();var A=W.ALB;var ids=A&&A.CARS?A.CARS.filter(function(c){return c.r!==2&&c.id!=='chaika';}).map(function(c){return c.id;}):['kopeyka','niva','volga','moskvich','gazel'];
return ids[C.hash(d.s*31+7)%ids.length];}
function novoselOpen(d){var c=st();if(!c)return;d=d||today();var id=novoselCar(d),A=W.ALB,nm=id;try{nm=A&&A.nm?A.nm(id):id;}catch(e){}
var first=c.nvs!==d.s;if(first){c.nvs=d.s;try{if(A&&A.give)A.give(id,'v3c',true);}catch(e){}sv();V3.emit('season:novosel',{car:id,s:d.s});ev('novosel',{c:id});}
var t=pickT('bl.newbie34')||pickT('season.novosel',0),pic='';try{pic=A&&A.svg?A.svg(id,{w:180}):'';}catch(e){}
modal('<h2>'+Lg('Новосёл в 34-й','New neighbour in flat 34')+'</h2><div class="newcar v3cPic">'+pic+'</div><p>'+esc(pickT('season.novosel',0))+'</p><p><i>'+esc(t)+'</i></p>'+
'<p><small>'+Lg('Его машина — «'+esc(nm)+'»: теперь в твоём Автоальбоме. Встретишь её во дворах.','Their car — “'+esc(nm)+'” — is now in your Car Album. You’ll meet it in the yards.')+'</small></p>'+
'<div class="row"><button class="btn" id="v3cBack">'+Lg('К календарю','Back to the calendar')+'</button></div>');
bindBack();}
function bdayOpen(){var c=st(),d=today();if(!c)return;var y=Math.floor(d.k/1e4),done=c.bdy===y,wl=[];try{wl=W.V3T?V3T.all('bl.bday.wish'):[];}catch(e){}
if(!wl.length||(typeof LANG!=='undefined'&&LANG==='en'))wl=[['Чтобы двор был тихий, а лавочка — полная.','A quiet yard and a full bench.'],['Чтобы все парковались ровно. Хотя бы сегодня.','Everyone parks straight — at least today.'],['Тетрадку потолще — чтобы всех записать.','A thicker notebook, to fit us all.'],['Здоровья, как у «Волги», и характера, как у «Нивы».','Health like a Volga, character like a Niva.']];
var pick=[],n=wl.length;for(var i=0;i<3&&n;i++)pick.push(wl[(C.hash(d.k+i*977)+i*7)%n]);
var tot=W.V3C_WISH_TOTAL?+W.V3C_WISH_TOTAL:0,open=pickT('bl.bday.open')||Lg('У бабы Шуры день рождения!','It’s Granny Shura’s birthday!');
var h='<h2>🎉 '+Lg('День рождения бабы Шуры','Granny Shura’s birthday')+'</h2><div class="v3cCake">'+cakeSvg()+'</div><p>'+esc(open)+'</p>';
if(done)h+='<p><b>'+Lg('Твоё пожелание записано в тетрадку.','Your wish is in the notebook.')+'</b></p>';
else if(pick.length){h+='<p>'+Lg('Выбери пожелание:','Pick a wish:')+'</p>';pick.forEach(function(w,i){h+='<button class="btn v3cW noenter" data-i="'+i+'">'+esc(typeof w==='string'?w:Lg(w[0],w[1]||w[0]))+'</button>';});}
if(tot)h+='<p><small>'+fill(Lg('Всего во дворах: {n} пожеланий.','Wishes from all yards: {n}.'),{n:tot})+'</small></p>';
h+='<div class="row"><button class="btn" id="v3cBack">'+Lg('К календарю','Back to the calendar')+'</button></div>';
modal(h);bindBack();var bs=D.querySelectorAll('.v3cW');for(i=0;i<bs.length;i++)bs[i].onclick=function(){c.bdy=y;c.bw++;sv();V3.emit('season:wish',{i:+this.getAttribute('data-i'),y:y});ev('wish',{n:c.bw});
toastL(pickT('season.bday',1)||Lg('Пожелание записала.','Wish noted.'));bdayOpen();};}
function cakeSvg(){return'<svg viewBox="0 0 120 70" width="120" height="70" aria-hidden="true"><rect x="22" y="34" width="76" height="28" rx="6" fill="#f7d6e0" stroke="#2d3436" stroke-width="2"/><rect x="30" y="20" width="60" height="16" rx="5" fill="#fff" stroke="#2d3436" stroke-width="2"/>'+
'<path d="M22 44 q10 6 19 0 q10 6 19 0 q10 6 19 0 q10 6 19 0" fill="none" stroke="#e5484d" stroke-width="3"/><g stroke="#2d3436" stroke-width="2"><line x1="45" y1="20" x2="45" y2="10"/><line x1="60" y1="20" x2="60" y2="8"/><line x1="75" y1="20" x2="75" y2="10"/></g>'+
'<circle cx="45" cy="7" r="3" fill="#ffd23f"/><circle cx="60" cy="5" r="3" fill="#ffd23f"/><circle cx="75" cy="7" r="3" fill="#ffd23f"/></svg>';}
var WD=[['Пн','Mo'],['Вт','Tu'],['Ср','We'],['Чт','Th'],['Пт','Fr'],['Сб','Sa'],['Вс','Su']];
function mainLine(d){var s=st()||DEF,id=d.main;
if(id==='ny')return Lg('С Новым годом! Во дворе ёлка, у гаражей — базар Михалыча.','Happy New Year! A tree in the yard, Mikhalych’s market by the garages.');
if(id==='mar8')return pickT('season.mar8',0)||evName(id);
if(id==='sep1')return pickT('season.sep1',0)||evName(id);
if(id==='bday')return pickT('bl.bday.open',0)||evName(id);
if(id==='snow')return pickT('season.snow',0)||evName(id);
if(id==='season')return fill(pickT('season.season',0)||Lg('Новый сезон! Сериал: «{t}».','New season! Story: “{t}”.'),{t:serTitle(d.ser)});
if(id==='evt')return fill(pickT('season.evt',0)||'{t}',{t:Lg(d.evt.t[0],d.evt.t[1])});
if(id==='novosel')return pickT('season.novosel',0)||evName(id);
if(id==='chaika')return pickT('season.chaika',0)||evName(id);
if(id==='number')return fill(pickT('bl.number',0)||Lg('Номер недели — {no}.','Number of the week: {no}.'),{no:Lg(d.no.ru,d.no.en)});
return Lg('Серия сезона «'+serTitle(d.ser)+'»: открывается уроками Шуры во дворах.','This season’s story “'+serTitle(d.ser)+'” unlocks with Shura’s lessons in the yards.');}
function bindBack(){var b=D.getElementById('v3cBack');if(b)b.onclick=function(){openCal();};}
function openCal(){try{STAT.screen('v3cal');}catch(e){}var d=freshen(),c=st()||DEF,S=S_()||{};c.seen=d.k;sv();ev('open',{m:d.main});
var h='<div class="v3cal"><h2>📅 '+Lg('Календарь на стене','The stairwell calendar')+'</h2><div class="v3cScroll">';
h+='<div class="v3cToday">'+chip(d.main)+'<div><b>'+ds(d.k)+' · '+evName(d.main)+'</b><p>'+esc(mainLine(d))+'</p>';
if(d.also.length)h+='<small>'+Lg('Ещё сегодня: ','Also today: ')+d.also.map(evName).join(', ')+'</small>';h+='</div></div>';
var act='';
if(d.main==='bday'&&is('bday'))act+='<button class="btn green" id="v3cBday">🎉 '+Lg('Поздравить','Congratulate')+'</button>';
if(c.nvs===d.s||d.main==='novosel'||d.sday>=10)if(is('novosel'))act+='<button class="btn" id="v3cNov">🏠 '+Lg('Новосёл в 34-й','Flat 34')+'</button>';
try{var gs=streakState();if(gs&&S.levelsDone>0)act+='<button class="btn'+(gs.claimed?'':' accent')+'" id="v3cGift">🎁 '+(gs.claimed?Lg('Гостинец взят','Gift collected'):Lg('Гостинец ждёт','Gift waiting'))+'</button>';}catch(e){}
if(act)h+='<div class="row v3cAct">'+act+'</div>';
h+='<div class="v3cWeek">';C.week(d.k,{snow:snowSrv()}).forEach(function(x){h+='<div class="v3cD'+(x.k===d.k?' on':'')+'"><small>'+Lg(WD[x.wd][0],WD[x.wd][1])+'</small>'+chip(x.main)+'<small>'+String(x.k).slice(6)+'</small></div>';});h+='</div>';
if(is('ser')){var left=Math.max(0,4-c.oc),ex=examDue(d);h+='<div class="v3cBox"><b>'+fill(Lg('Сезон {n} · неделя {w} из 4','Season {n} · week {w} of 4'),{n:d.s,w:d.week})+'</b><p>📺 '+Lg('Сериал','Story')+': «'+esc(serTitle(d.ser))+'» — '+fill(Lg('серий {a} из 14','{a} of 14 episodes'),{a:c.ep})+'</p>';
if(prava(d))h+='<p><small>'+(c.ex?Lg('Экзамен сдан! «Ока» Шуры — с правами.','Exam passed! Shura’s Oka is licensed.'):ex?Lg('Экзамен: в ближайшем дворе — «Ока» Шуры и иномарка Гали.','Exam: Shura’s Oka and Galya’s foreign car are in the next yard.'):c.ep>=13?Lg('Экзамен — с 3-й недели сезона.','Exam from week 3 of the season.'):fill(Lg('Урок Шуры — через {n}. Её сиреневая «Ока» встанет во дворе.','Shura’s next lesson is in {n}. Her lilac Oka will be parked there.'),{n:pln(left)}))+'</small></p>';
if(c.ep>0)h+='<button class="btn" id="v3cEp">▶ '+Lg('Смотреть серию','Watch the episode')+' '+c.ep+'</button>';h+='</div>';}
if(is('evt')){var e=d.evt,pi=regPaint(e),own=c.pt[e.id],pr=Math.min(e.n,c.ed);h+='<div class="v3cBox"><b>🎨 '+esc(Lg(e.t[0],e.t[1]))+'</b> <small>'+Lg('до ','till ')+ds(e.end)+'</small><p>'+goalT(e)+'</p>'+
'<div class="v3cBar"><i style="width:'+Math.round(100*pr/e.n)+'%"></i></div><p><b class="swd" style="background:'+e.c+'"></b> '+(own?Lg('Краска «'+e.p[0]+'» — твоя ✓','“'+e.p[1]+'” paint — yours ✓'):fill(Lg('{a} из {n} · награда — краска «'+e.p[0]+'», в Лавке её нет','{a} of {n} · reward: the “'+e.p[1]+'” paint, not sold anywhere'),{a:pr,n:e.n}))+'</p></div>';}
var nb='';if(is('number'))nb+='<p>№ '+Lg('Номер недели','Number of the week')+': <b class="v3cNo">'+esc(Lg(d.no.ru,d.no.en))+'</b> '+(c.nw===C.weekKey(d.k)?Lg('— найден ✓','— found ✓'):Lg('— ищи во дворах, приз у Шуры','— find it in the yards, Shura has a prize'))+'</p>';
if(is('chaika')){var nc=C.nextOf(d.k,'chaika',{},8);nb+='<p>🚗 '+(c.chw===C.weekKey(d.k)?Lg('«Чайка» на этой неделе — в альбоме ✓','The Chaika this week — in your album ✓'):fill(Lg('«Чайка» заедет {d} с 19:00 до 20:00 — зайди, и она в альбоме.','The Chaika comes {d}, 7–8 pm — drop in and it’s in your album.'),{d:nc===d.k?Lg('сегодня','today'):ds(nc)}))+'</p>';}
if(nb)h+='<div class="v3cBox">'+nb+'</div>';
try{if(W.FEST&&FEST.list){var fl=FEST.list()||[];if(fl.length)h+='<div class="v3cBox"><b>🎉 '+Lg('Праздники во дворе','Yard holidays')+'</b><p>'+fl.map(function(f){return esc(FEST.name?FEST.name(f.id||f):(f.name||f));}).join(' · ')+'</p></div>';}}catch(e){}
if(is('card'))h+='<div class="v3cBox"><b>✨ '+Lg('Открытки городов','City postcards')+'</b> <small>'+c.cd.length+'</small> <button class="btn" id="v3cCards">'+Lg('Смотреть','Look')+'</button></div>';
h+='</div><div class="row"><button class="btn green" id="v3cOk">'+Lg('Хорошо','OK')+'</button></div></div>';
modal(h);
var q=function(id){return D.getElementById(id);};
if(q('v3cOk'))q('v3cOk').onclick=function(){hideModal();};
if(q('v3cGift'))q('v3cGift').onclick=function(){hideModal();try{showStreak();}catch(e){}};
if(q('v3cBday'))q('v3cBday').onclick=bdayOpen;
if(q('v3cNov'))q('v3cNov').onclick=function(){novoselOpen(d);};
if(q('v3cEp'))q('v3cEp').onclick=function(){epOpen(d,c.ep);};
if(q('v3cCards'))q('v3cCards').onclick=cardsOpen;}
function pln(n){try{return n+' '+pl(n,'двор','двора','дворов','yard','yards');}catch(e){return n+Lg(' дв.',' yards');}}
function goalT(e){var n=e.n;return{clean:fill(Lg('Пройди {n} дворов без аварий','Clear {n} yards without a crash'),{n:n}),cars:fill(Lg('Выведи {n} машин','Drive out {n} cars'),{n:n}),
stars:fill(Lg('Собери {n} звёзд','Collect {n} stars'),{n:n}),yards:fill(Lg('Пройди {n} дворов','Clear {n} yards'),{n:n}),three:fill(Lg('{n} дворов на три звезды','{n} three-star yards'),{n:n}),
nohint:fill(Lg('{n} дворов без подсказок','{n} yards without hints'),{n:n})}[e.g]||'';}
function epOpen(d,n){var t='',ttl=serTitle(d.ser);try{var r=W.V3T&&V3T.serialEp?V3T.serialEp(d.ser,n):null;if(r)t=Lg(r.ep||'',r.ep||'');}catch(e){}
if(!t||(typeof LANG!=='undefined'&&LANG==='en'))t=n<=13?pickT('season.lesson',n-1):pickT('season.exam',1);
modal('<h2>📺 «'+esc(ttl)+'» — '+Lg('серия','episode')+' '+n+'</h2><p>'+esc(t)+'</p>'+(W.V3&&V3.jokeHtml?'':'')+'<div class="row"><button class="btn" id="v3cBack">'+Lg('К календарю','Back to the calendar')+'</button></div>');bindBack();ev('ep',{n:n,s:d.ser});}
function regName(r){try{for(var i=REGIONS.length-1;i>=0;i--)if(REGIONS[i].from<=r*10)return Lg(REGIONS[i].name,REGIONS[i].en&&REGIONS[i].en.name||REGIONS[i].name);}catch(e){}return'№'+(r+1);}
var PC=['#ffb4a2','#a0c4ff','#caffbf','#fdffb6','#ffc6ff','#bdb2ff','#9bf6ff','#ffd6a5'];
function cardSvg(r){var c=PC[r%PC.length];return'<svg viewBox="0 0 90 60" width="90" height="60" aria-hidden="true"><rect x="1" y="1" width="88" height="58" rx="5" fill="'+c+'" stroke="#2d3436" stroke-width="2"/>'+
'<path d="M8 46 h18 v-14 h8 v-8 h10 v22 h12 v-18 h12 v18 h14" fill="none" stroke="#2d3436" stroke-width="2"/><circle cx="72" cy="14" r="6" fill="#ffd23f"/><text x="45" y="56" font-size="8" text-anchor="middle" fill="#2d3436">'+(r+1)+'</text></svg>';}
function cardsBody(){var c=st()||DEF,h='';if(!c.cd.length)h+='<p>'+Lg('Пройди босса региона — придёт открытка из его города.','Beat a region’s boss and a postcard from there arrives.')+'</p>';
else{h+='<div class="v3cCards">';c.cd.slice().sort(function(a,b){return a-b;}).forEach(function(r){h+='<div>'+cardSvg(r)+'<small>'+esc(regName(r))+'</small></div>';});h+='</div>';}
try{if(W.FESTVY&&FESTVY.cars){var fc='';for(var k in FESTVY.cars){var car=FESTVY.cars[k];fc+='<p>'+(FESTVY.owned&&FESTVY.owned(k)?'✓ ':'🔒 ')+esc(Lg(car.name,car.en||car.name))+'</p>';}
if(fc)h+='<h3>'+Lg('Праздничные машины','Holiday cars')+'</h3>'+fc;}}catch(e){}return h;}
function cardsOpen(){modal('<h2>✨ '+Lg('Открытки городов','City postcards')+'</h2>'+cardsBody()+'<div class="row"><button class="btn" id="v3cBack">'+Lg('К календарю','Back to the calendar')+'</button></div>');bindBack();ev('cards',{n:(st()||DEF).cd.length});}
if(is('cal')){(W.homeSlots=W.homeSlots||[]).push({id:'th-calendar',zone:'thing',order:30,render:function(){var S=S_();if(!S||!(S.levelsDone>0))return null;var d=today(),c=st()||DEF,gs=null;
try{gs=streakState();}catch(e){}var hot=(gs&&!gs.claimed)||c.seen!==d.k;
return{at:'calendar',t:Lg('Календарь: ','Calendar: ')+evName(d.main),short:Lg('Календарь','Calendar'),go:openCal,badge:gs&&!gs.claimed?'🎁':c.seen!==d.k?'!':''};}});}
if(is('card')&&W.MY&&MY.tab){try{MY.tab({id:'v3cards',o:11,ic:'✨',n:function(){return(st()||DEF).cd.length;},title:function(){return Lg('Открытки','Postcards');},sub:function(){return Lg('города и праздничные машины','cities and holiday cars');},render:function(el){el.innerHTML=cardsBody();}});}catch(e){warn('tab',e);}}
function faList(f){var ks=[],k;for(k in FESTVY.cars){var o=!!(FESTVY.owned&&FESTVY.owned(k));if(f==='all'||f==='own'&&o||f==='lock'&&!o)ks.push(k);}return ks;}
function faHtml(ks){var own=0,tot=0,k;for(k in FESTVY.cars){tot++;if(FESTVY.owned&&FESTVY.owned(k))own++;}if(!ks.length)return'';
return'<h3 class="albser v3cFa">🎉 '+Lg('Праздничные','Holiday cars')+' <small>'+own+'/'+tot+'</small></h3><div class="albgrid v3cFaG">'+ks.map(function(k){var car=FESTVY.cars[k],o=!!(FESTVY.owned&&FESTVY.owned(k)),e=FESTVY.events&&FESTVY.events[car.ev];
var sub=o?Lg(car.about||'',car.aboutEn||car.about||''):e?(e.ic+' '+Lg(e.title,e.titleEn||e.title)+': '+e.need+Lg(' из ',' of ')+e.n):'';
return'<button class="albc r2'+(o?' own':' lock')+' noenter" data-fa="'+k+'"><i class="albrs"></i><span class="albpic'+(o?'':' ghost')+'"><canvas class="albcv" data-fa="'+k+'"></canvas></span><b>'+(o?'':'🔒 ')+esc(Lg(car.name,car.en||car.name))+'</b><small>'+esc(sub)+'</small></button>';}).join('')+'</div>';}
function faFlt(pane){var fb=pane.querySelector('.albflt .on');return fb?fb.getAttribute('data-f'):'all';}
function faBind(pane){if(!pane||!W.FESTVY||!FESTVY.cars)return;var keep={};faList(faFlt(pane)).forEach(function(k){keep[k]=1;});
[].forEach.call(pane.querySelectorAll('button[data-fa]'),function(b){var k=b.getAttribute('data-fa'),car=FESTVY.cars[k];if(!keep[k]){b.parentNode.removeChild(b);return;}
b.onclick=function(){var o=!!(FESTVY.owned&&FESTVY.owned(k));if(o)toast(Lg(car.name,car.en||car.name)+' — '+Lg(car.about||'',car.aboutEn||car.about||''),2400);else{var c=null;try{c=FESTVY.cur&&FESTVY.cur();}catch(e){}if(c&&FESTVY.open)FESTVY.open();else toast(Lg('Эту машину дарит праздник — придёт в свой срок, смотри календарь.','A holiday brings this car — check the calendar.'),2600);}ev('falb',{k:k,o:o?1:0});};});
var gr=pane.querySelector('.v3cFaG');if(gr&&!gr.children.length){var hh=pane.querySelector('h3.v3cFa');if(hh)hh.parentNode.removeChild(hh);gr.parentNode.removeChild(gr);}
setTimeout(function(){[].forEach.call(pane.querySelectorAll('canvas[data-fa]'),function(cv){try{FESTVY.draw(cv,cv.getAttribute('data-fa'));}catch(e){}});},0);}
function festAlb(pane){if(!pane||!W.FESTVY||!FESTVY.cars||!pane.querySelector||pane.querySelector('.v3cFa'))return;var h=faHtml(faList(faFlt(pane)));if(!h)return;
var note=pane.querySelector('.mynote'),box=D.createElement('div');box.innerHTML=h;
while(box.firstChild){if(note&&note.parentNode===pane)pane.insertBefore(box.firstChild,note);else pane.appendChild(box.firstChild);}faBind(pane);}
if(is('card')&&W.ALB){try{if(!ALB.more)ALB.more=[];ALB.more.push({id:'v3c-fest',html:function(){return W.FESTVY&&FESTVY.cars?faHtml(faList('all')):'';},bind:function(el){faBind(el);}});}catch(e){warn('falb',e);}}
if(is('card')&&W.MY&&MY.render&&!MY.__v3cFa){MY.__v3cFa=1;var MR0=MY.render;
MY.render=function(){var r=MR0.apply(this,arguments);try{if(MY.cur&&MY.cur()==='album')festAlb(D.getElementById('myPane'));}catch(e){warn('falb',e);}return r;};
D.addEventListener('click',function(e){var t=e.target;if(!t||!t.closest)return;var b=t.closest('#myPane .albflt [data-f]');if(b)setTimeout(function(){try{if(MY.cur&&MY.cur()==='album')festAlb(D.getElementById('myPane'));}catch(x){}},0);},true);}
function wrapV3H(){var V=W.V3H;if(!V||V.__v3c||!V.planSprinkle)return;V.__v3c=1;var P0=V.planSprinkle;
V.planSprinkle=function(idx){var r=P0.apply(this,arguments);try{var d=today();if(examDue(d)&&idx>=10)return{sm:[],fl:['oka','volga']};if(lessonDue(d)&&idx>=10){
var fl=r&&r.fl?r.fl.slice():[];if(fl.indexOf('oka')<0)fl.unshift('oka');return{sm:r&&r.sm?r.sm:[],fl:fl.slice(0,2)};}}catch(e){warn('plan',e);}return r;};}
function roleOf(g,role){var H=g&&g.v3h,M=H&&H.M;if(!M)return-1;for(var i=0;i<M.n;i++)if(M.role[i]===role)return i;return-1;}
function norm(g){return!!g&&(!g.mode||g.mode==='n');}
function plain(v){return v&&!v.kind&&!v.own&&!v.noArrow;}
function freeAt(g,v){try{return canExit(v,g.occ,g.p.w,g.p.h,v.id).free;}catch(e){return false;}}
function onStart(o){var g=G_();if(!g)return;freshen();var d=today(),c=st();if(!c)return;g.v3c={out:0};var daily=!!g.daily,idx=g.idx,X=g.v3c;
try{
if(!daily&&norm(g)){
var oka=roleOf(g,'oka');if(oka>=0&&is('ser')&&prava(d)){var gal=roleOf(g,'volga');if(examDue(d)&&gal>=0){X.exam=1;X.gal=gal;try{tint(g.vs[gal],'#c9d3dc');}catch(e){}c.exn++;sv();
setTimeout(function(){if(G_()===g&&!g.over)sayYard(pickT('season.exam',0),true);},1600);ev('exam',{i:idx+1});}
else if(c.oc>=4||g.v3k){X.lesson=1;setTimeout(function(){if(G_()===g&&!g.over)sayYard(pickT('season.oka'));},1600);}}
if(is('number')&&c.nw!==C.weekKey(d.k)){c.nwc++;sv();if(c.nwc>=C.numberYard(d.k)){var cand=g.vs.filter(function(v){return plain(v)&&v.L===2&&!(g.v3h&&g.v3h.M&&g.v3h.M.role[g.vs.indexOf(v)]);});
if(cand.length){X.no=cand[C.hash(d.k+idx)%cand.length].id;}}}
}
if(is('snow')&&(d.main==='snow'||d.also.indexOf('snow')>=0)&&c.sy!==Math.floor(d.k/1e4)&&idx>=1){X.snow=1;setTimeout(function(){if(G_()===g&&!g.over)sayYard(pickT('season.snow',0));},900);}
if(is('rule')&&d.rule&&c.rk!==d.k&&idx>=3&&!g.v3k){if(d.rule==='mar8'){var fr=g.vs.filter(function(v){return plain(v)&&freeAt(g,v);});if(fr.length){X.dame=fr[C.hash(d.k+idx*3)%fr.length].id;setTimeout(function(){if(G_()===g&&!g.over)sayYard(pickT('season.mar8',0));},900);}}
else if(d.rule==='sep1'){X.bell={t0:Date.now(),lim:(30+3*g.vs.length)*1000};setTimeout(function(){if(G_()===g&&!g.over)sayYard(pickT('season.sep1',0));},900);}}
}catch(e){warn('start',e);}}
function wrapExit(){if(typeof startExit!=='function'||startExit.__v3c)return;var E0=startExit;
startExit=function(v,r,delay){var g=G_(),X=g&&g.v3c;
if(X&&X.snow&&!X.dug&&!delay){X.dug=1;var c=st();if(c){c.sy=Math.floor(dk()/1e4);sv();}X.puff={id:v.id,t:Date.now()};try{SND.step&&SND.step(0);}catch(e){}sayYard(Lg('Откапываем… ещё разок!','Digging… once more!'));ev('snow',{});return;}
var res=E0.apply(this,arguments);
try{if(X){X.out++;
if(X.dame!=null&&!X.dr){X.dr=v.id===X.dame&&X.out===1?1:2;var c2=st();if(c2){c2.rk=dk();c2.rr=X.dr;sv();}sayYard(pickT('season.mar8',X.dr));ev('rule',{r:'mar8',ok:X.dr===1?1:0});}
if(X.no!=null&&v.id===X.no&&!X.nof){X.nof=1;numberPrize();}}}catch(e){warn('exit',e);}
return res;};startExit.__v3c=1;}
function numberPrize(){var c=st(),S=S_();if(!c)return;var d=today();c.nw=C.weekKey(d.k);try{if(S&&!S.freeHint){S.freeHint=true;}}catch(e){}sv();
toastL((pickT('season.number',0)||Lg('Номер недели найден!','Number found!'))+' '+Lg('Приз — бесплатная подсказка 💡','Prize: a free hint 💡'));ev('number',{});}
function onYard(info){if(!info||info.end!=='win')return;var g=G_(),X=g&&g.v3c,c=st();if(!c)return;var d=freshen();
try{
if(is('evt')){var e=d.evt,add={clean:info.crashes?0:1,cars:g&&g.vs?g.vs.length:0,stars:info.stars||0,yards:1,three:info.stars===3?1:0,nohint:info.hint?0:1}[e.g]||0;
if(add&&!c.pt[e.id]){c.ed+=add;if(c.ed>=e.n){c.pt[e.id]=1;var k=regPaint(e);var s=S_();if(s&&k){if(!s.gp)s.gp={};s.gp[k]=1;}toastL('🎨 '+(pickT('season.evt',1)||Lg('Краска твоя!','The paint is yours!'))+' «'+Lg(e.p[0],e.p[1])+'»');ev('evtdone',{e:e.id});}}}
if(X&&X.exam){if((info.crashes||0)<=1){c.ex=1;c.ep=14;try{if(W.ALB&&ALB.give)ALB.give('oka','v3c',true);}catch(x){}toastL(pickT('season.exam',1));ev('examok',{t:c.exn});}else toastL(pickT('season.exam',2));}
else if(X&&X.lesson&&c.ep<13&&!(c.epk===d.k&&c.epn>=2)){c.ep++;c.oc=0;if(c.epk!==d.k){c.epk=d.k;c.epn=0;}c.epn++;toastL('📺 '+Lg('Урок '+c.ep+'. ','Lesson '+c.ep+'. ')+pickT('season.lesson',c.ep-1));ev('lesson',{n:c.ep});}
else if(!info.daily&&norm(g))c.oc++;
if(X&&X.bell&&!X.br){X.br=Date.now()-X.bell.t0<=X.bell.lim?1:2;c.rk=d.k;c.rr=X.br;toastL(pickT('season.sep1',X.br));ev('rule',{r:'sep1',ok:X.br===1?1:0});}
if(is('card')&&!info.daily&&info.idx%10===9){var r=Math.floor(info.idx/10);if(c.cd.indexOf(r)<0&&c.cd.length<40){c.cd.push(r);setTimeout(function(){toastL('✨ '+fill(pickT('season.card',0)||Lg('Открытка из {city}!','A postcard from {city}!'),{city:regName(r)}));},2500);ev('card',{r:r});}}
sv();V3.emit('season:track',{n:d.s,ep:c.ep,ev:d.evt.id,ed:c.ed});
}catch(e){warn('yard',e);}}
function carTop(v){var p=null;for(var k=0;k<v.L;k++){var q=toPx(trackPt(v.track,k+v.s));if(!p||q[1]<p[1])p=q;}return p;}
function byId(g,id){for(var i=0;i<g.vs.length;i++)if(g.vs[i].id===id)return g.vs[i];return null;}
function drawOver(c,t){var g=G_(),X=g&&g.v3c;if(!X||!g.vs)return;var v,p;
if(X.no!=null&&!X.nof&&(v=byId(g,X.no))&&v.state==='idle'){p=carTop(v);var d=today(),tx=Lg(d.no.ru,d.no.en),fs=Math.max(8,cs*.2);c.save();c.font='700 '+fs+'px Rubik,-apple-system,sans-serif';
var w=c.measureText(tx).width+fs*.8,x=p[0]-w/2,y=p[1]-cs*.62;c.fillStyle='#fff';c.strokeStyle='#2d3436';c.lineWidth=Math.max(1.2,fs*.12);c.fillRect(x,y,w,fs*1.4);c.strokeRect(x,y,w,fs*1.4);
c.fillStyle='#2d3436';c.textAlign='center';c.textBaseline='middle';c.fillText(tx,p[0],y+fs*.75);c.restore();}
if(X.dame!=null&&!X.dr&&(v=byId(g,X.dame))&&v.state==='idle'){p=carTop(v);flower(c,p[0],p[1]-cs*.35,Math.max(6,cs*.18),t);}
if(X.gal!=null&&X.exam){v=g.vs[X.gal];if(v&&v.state==='idle'){p=carTop(v);label(c,p[0],p[1]-cs*.45,Lg('Галя','Galya'),'#c9d3dc');}}
if(X.snow&&!X.dug){c.save();c.fillStyle='rgba(255,255,255,.85)';g.vs.forEach(function(u){if(u.state!=='idle')return;var a=toPx(trackPt(u.track,u.s)),b=toPx(trackPt(u.track,u.s+u.L-1));
c.beginPath();c.ellipse((a[0]+b[0])/2,(a[1]+b[1])/2-cs*.12,Math.abs(a[0]-b[0])/2+cs*.3,Math.abs(a[1]-b[1])/2+cs*.22,0,0,7);c.fill();});c.restore();}
if(X.puff&&Date.now()-X.puff.t<600&&(v=byId(g,X.puff.id))){p=carTop(v);var q=(Date.now()-X.puff.t)/600;c.save();c.globalAlpha=1-q;c.fillStyle='#fff';for(var i=0;i<6;i++){c.beginPath();c.arc(p[0]+Math.cos(i)*cs*.5*q,p[1]+Math.sin(i)*cs*.4*q,cs*.12,0,7);c.fill();}c.restore();}
try{var S=S_();if(S&&S.dec&&S.dec.v3tree&&is('bazar')&&!W.__demo){var b0=toPx([-.15,g.p.h-.1]);treeDraw(c,b0[0],b0[1]+cs*.55,Math.max(18,cs*.9));}}catch(e){}}
function flower(c,x,y,r,t){c.save();var cl=['#ff6fa5','#ffd23f'];for(var i=0;i<5;i++){c.fillStyle=cl[0];c.beginPath();c.arc(x+Math.cos(i*1.2566)*r*.6,y+Math.sin(i*1.2566)*r*.6,r*.45,0,7);c.fill();}
c.fillStyle=cl[1];c.beginPath();c.arc(x,y,r*.4,0,7);c.fill();c.restore();}
function label(c,x,y,tx,bg){var fs=Math.max(8,cs*.2);c.save();c.font='700 '+fs+'px Rubik,-apple-system,sans-serif';var w=c.measureText(tx).width+fs;c.fillStyle=bg;c.strokeStyle='#2d3436';c.lineWidth=1.5;
c.beginPath();c.rect(x-w/2,y-fs*.75,w,fs*1.5);c.fill();c.stroke();c.fillStyle='#2d3436';c.textAlign='center';c.textBaseline='middle';c.fillText(tx,x,y);c.restore();}
function drawScreen(){var g=G_(),X=g&&g.v3c;if(!X||!X.bell||X.br||g.over)return;var left=Math.max(0,Math.ceil((X.bell.lim-(Date.now()-X.bell.t0))/1000));
try{var c=ctx;c.save();c.setTransform(dpr,0,0,dpr,0,0);var fs=Math.max(13,Math.min(20,W*.045)),tx='🔔 '+Lg('до звонка ','bell in ')+left+Lg(' с',' s');c.font='800 '+fs+'px Rubik,-apple-system,sans-serif';
var w=c.measureText(tx).width+fs*1.2,x=W-w-8,y=8;c.fillStyle=left?'rgba(63,143,224,.92)':'rgba(120,120,120,.9)';c.fillRect(x,y,w,fs*1.7);c.fillStyle='#fff';c.textBaseline='middle';c.fillText(tx,x+fs*.6,y+fs*.88);c.restore();}catch(e){}}
function homeDeco(){if(!is('deco'))return;var hh=D.getElementById('hHouse');if(!hh)return;var old=hh.querySelector('.v3cDeco');if(old)old.parentNode.removeChild(old);
var d=today(),c=st()||DEF,h='';
if(d.main==='bday')h+='<svg class="v3cB1" viewBox="0 0 40 70"><path d="M10 30 v40 M28 26 v44" stroke="#2d3436"/><ellipse cx="10" cy="18" rx="9" ry="12" fill="#e5484d"/><ellipse cx="28" cy="14" rx="9" ry="12" fill="#ffd23f"/></svg>';
if(c.nvs===d.s||d.main==='novosel')h+='<b class="v3c34" title="34">34</b>';
if(bazarNow(d)&&is('bazar'))h+='<svg class="v3cTr" viewBox="0 0 30 40"><path d="M15 2 l10 14 h-5 l8 12 h-26 l8 -12 h-5z" fill="#2f8a3e"/><rect x="13" y="28" width="4" height="8" fill="#8a5a3a"/><circle cx="12" cy="20" r="2" fill="#e5484d"/><circle cx="18" cy="14" r="2" fill="#ffd23f"/></svg>';
if(C.chaikaNow(d.k,hour())&&is('chaika'))h+='<svg class="v3cCh" viewBox="0 0 60 20"><rect x="2" y="6" width="56" height="10" rx="4" fill="#1d1f24"/><rect x="16" y="2" width="22" height="7" rx="3" fill="#1d1f24"/><circle cx="14" cy="17" r="3" fill="#555"/><circle cx="46" cy="17" r="3" fill="#555"/></svg>';
if(!h)return;var el=D.createElement('div');el.className='v3cDeco';el.setAttribute('aria-hidden','true');el.innerHTML=h;hh.appendChild(el);}
function css(){if(D.getElementById('v3cCss'))return;var s=D.createElement('style');s.id='v3cCss';s.textContent=
'.v3cI{display:inline-block;min-width:26px;height:26px;line-height:26px;border-radius:13px;color:#fff;font-weight:800;font-size:13px;text-align:center;padding:0 3px;box-sizing:border-box}'+
'.v3cToday{display:flex;gap:10px;align-items:flex-start;text-align:left;margin:6px 0}.v3cToday p{margin:4px 0}.v3cToday .v3cI{flex:0 0 auto;margin-top:2px}'+
'.v3cWeek{display:flex;justify-content:space-between;margin:8px 0}.v3cD{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:3px 0;border-radius:8px}.v3cD.on{background:rgba(255,210,63,.35)}.v3cD small{font-size:12px}'+
'.v3cScroll{max-height:62vh;overflow-y:auto;-webkit-overflow-scrolling:touch;margin:0 -4px;padding:0 4px}.v3cBox{background:rgba(0,0,0,.05);border-radius:10px;padding:8px 10px;margin:6px 0;text-align:left;font-size:15px}.v3cBox p{margin:4px 0}'+
'.v3cBar{height:10px;border-radius:5px;background:rgba(0,0,0,.12);overflow:hidden}.v3cBar i{display:block;height:100%;background:#2fa84f}'+
'.v3cNo{font-family:monospace;border:2px solid #2d3436;border-radius:4px;padding:0 4px;background:#fff;color:#2d3436}'+
'.v3cCards{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.v3cCards div{display:flex;flex-direction:column;align-items:center;width:96px}.v3cCards small{font-size:12px;text-align:center}'+
'.v3cW{display:block;width:100%;margin:5px 0;white-space:normal;font-size:15px}.v3cAct{flex-wrap:wrap}'+
'.v3cDeco{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}.v3cB1{position:absolute;left:6%;top:30%;width:28px}'+
'.v3c34{position:absolute;right:22%;top:24%;background:#ffe9a8;border:2px solid #2d3436;border-radius:4px;font-size:11px;padding:1px 4px;box-shadow:0 0 12px #ffd23f}'+
'.v3cTr{position:absolute;right:4%;bottom:14%;width:30px}.v3cCh{position:absolute;left:40%;bottom:6%;width:60px}';
D.head.appendChild(s);}
function boot(){try{css();freshen();paints();treeReg();wrapV3H();wrapExit();
if(W.LVLH&&typeof LVLH.draw==='function'&&!LVLH.draw.__v3c){var LD=LVLH.draw;LVLH.draw=function(c,layer,t){var r=LD.apply(this,arguments);if(layer==='over')try{drawOver(c,t);}catch(e){warn('draw',e);}return r;};LVLH.draw.__v3c=1;}
if(typeof render==='function'&&!render.__v3c){var R0=render;render=function(){var r=R0.apply(this,arguments);drawScreen();return r;};render.__v3c=1;}
}catch(e){warn('boot',e);}setTimeout(home,600);}
function home(){try{freshen();var d=today();paints();treeGive(d);treeReg();chaikaChk();homeDeco();var c=st();
if(c&&c.seen!==d.k&&is('cal')&&W.V3T&&V3T.ready)V3T.ready(function(){var t=mainLine(d);if(t&&c.seen!==d.k)sayHome(t);});}catch(e){warn('home',e);}}
V3.sub('boot',boot,'season');
V3.sub('home',home,'season');
V3.sub('back',function(){chaikaChk();},'season');
V3.sub('cloud',function(){paints();treeReg();},'season');
V3.sub('yard-start',function(o){chaikaChk();onStart(o);},'season');
V3.sub('yard',onYard,'season');
if(W.UI&&UI.on)UI.on('skin:scene',function(){try{if(V3.is('season'))homeDeco();}catch(e){}});
W.V3C={_t:{onYard:onYard,onStart:onStart,freshen:freshen,wrapV3H:wrapV3H},on:true,today:today,open:openCal,cards:cardsOpen,bday:bdayOpen,novosel:novoselOpen,novoselCar:novoselCar,dur:dur,paintIdx:paintIdx,lessonDue:lessonDue,examDue:examDue,st:st};
})();