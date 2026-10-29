(function(root){
'use strict';
var DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function ri(R,n){return Math.floor(R()*n);}
function cellsOf(c,x,y){var D=DIRS[c.d],o=[];for(var k=0;k<c.L;k++)o.push([x-D[0]*k,y-D[1]*k]);return o;}
function occOf(B,P){var o=new Int8Array(B.w*B.h);for(var i=0;i<o.length;i++)o[i]=-1;
for(var j=0;j<B.cars.length;j++){if(!P[j])continue;var cc=cellsOf(B.cars[j],P[j][0],P[j][1]);for(var k=0;k<cc.length;k++)o[cc[k][1]*B.w+cc[k][0]]=j;}return o;}
function canGo(B,P,o,i){var c=B.cars[i],D=DIRS[c.d],x=P[i][0]+D[0],y=P[i][1]+D[1];
while(x>=0&&y>=0&&x<B.w&&y<B.h){if(o[y*B.w+x]!==-1)return false;x+=D[0];y+=D[1];}return true;}
function slide(B,P){var o=occOf(B,P),ord=[],i,moved=0;for(i=0;i<P.length;i++)if(P[i])ord.push(i);
ord.sort(function(a,b){return maxY(B,P,b)-maxY(B,P,a);});
for(var t=0;t<ord.length;t++){i=ord[t];var cc=cellsOf(B.cars[i],P[i][0],P[i][1]),ok=true;
for(var k=0;k<cc.length;k++){var x=cc[k][0],y=cc[k][1]+1;if(y>=B.h){ok=false;break;}var q=o[y*B.w+x];if(q!==-1&&q!==i){ok=false;break;}}
if(!ok)continue;for(k=0;k<cc.length;k++)o[cc[k][1]*B.w+cc[k][0]]=-1;for(k=0;k<cc.length;k++)o[(cc[k][1]+1)*B.w+cc[k][0]]=i;P[i]=[P[i][0],P[i][1]+1];moved++;}
return moved;}
function maxY(B,P,i){var cc=cellsOf(B.cars[i],P[i][0],P[i][1]),m=0;for(var k=0;k<cc.length;k++)if(cc[k][1]>m)m=cc[k][1];return m;}
function gMove(B,P,i,n){var o=occOf(B,P);if(!P[i]||!canGo(B,P,o,i))return null;var Q=P.slice();Q[i]=null;if(!B.moon||(n+1)%2===0)slide(B,Q);return Q;}
function gKey(P,n,moon){var s=moon?(n&1)+':':'';for(var i=0;i<P.length;i++)s+=P[i]?P[i][0]+','+P[i][1]+';':'-;';return s;}
function gSolve(B,P0,n0,limit){var seen={},nodes=0;limit=limit||200000;
function rec(P,n){var any=false;for(var i=0;i<P.length;i++)if(P[i]){any=true;break;}if(!any)return true;
var k=gKey(P,n,B.moon);if(seen[k])return false;seen[k]=1;if(++nodes>limit)throw 0;
for(i=0;i<P.length;i++){if(!P[i])continue;var Q=gMove(B,P,i,n);if(Q&&rec(Q,n+1))return true;}return false;}
try{return rec(P0,n0||0);}catch(e){return null;}}
function gFirst(B,P,n){for(var i=0;i<P.length;i++){if(!P[i])continue;var Q=gMove(B,P,i,n);if(Q&&gSolve(B,Q,n+1,60000)===true)return i;}return-1;}
function gRandom(B,P0,R,runs){var dead=0;for(var r=0;r<runs;r++){var P=P0.slice(),n=0;for(;;){var f=[];for(var i=0;i<P.length;i++)if(P[i]&&gMove(B,P,i,n))f.push(i);
var al=P.some(function(p){return!!p;});if(!al)break;if(!f.length){dead++;break;}P=gMove(B,P,f[ri(R,f.length)],n);n++;}}return dead/runs;}
function gGen(o,seed){var R=rng(seed),best=null;
for(var t=0;t<(o.tries||60);t++){var B={w:o.w,h:o.h,cars:[],moon:!!o.moon},P=[],occ=new Int8Array(o.w*o.h);for(var i=0;i<occ.length;i++)occ[i]=-1;
for(var a=0;a<400&&B.cars.length<o.n;a++){var L=R()<.75?2:3,d=ri(R,4),D=DIRS[d],x=ri(R,o.w),y=o.h-1-Math.min(o.h-1,Math.floor(Math.pow(R(),1.6)*o.h)),cc=[],ok=true;
for(var k=0;k<L;k++){var cx=x-D[0]*k,cy=y-D[1]*k;if(cx<0||cy<0||cx>=o.w||cy>=o.h||occ[cy*o.w+cx]!==-1){ok=false;break;}cc.push([cx,cy]);}
if(!ok)continue;var c={d:d,L:L};B.cars.push(c);P.push([x,y]);cc.forEach(function(p){occ[p[1]*o.w+p[0]]=B.cars.length-1;});}
if(B.cars.length<o.n-1)continue;
for(var g=0;g<o.h;g++)if(!slide(B,P))break;
var ok2=gSolve(B,P,0,80000);if(ok2!==true)continue;var dd=gRandom(B,P,R,12),sc=(dd>.85?-1:dd)+R()*.01;
if(!best||sc>best.sc)best={B:B,P:P,dead:dd,sc:sc};if(dd>=.25&&dd<=.8)break;}
return best;}
function lOcc(B,P,fl){var o=new Int8Array(B.w*B.h);for(var i=0;i<o.length;i++)o[i]=-1;for(var j=0;j<B.cars.length;j++){if(!P[j]||P[j][2]!==fl)continue;
var cc=cellsOf(B.cars[j],P[j][0],P[j][1]);for(var k=0;k<cc.length;k++)o[cc[k][1]*B.w+cc[k][0]]=j;}return o;}
function lDrop(B,P){var moved=0;for(var fl=1;fl<3;fl++){var below=lOcc(B,P,fl-1);for(var j=0;j<P.length;j++){if(!P[j]||P[j][2]!==fl)continue;
var cc=cellsOf(B.cars[j],P[j][0],P[j][1]),ok=true;for(var k=0;k<cc.length;k++)if(below[cc[k][1]*B.w+cc[k][0]]!==-1){ok=false;break;}
if(ok){P[j]=[P[j][0],P[j][1],fl-1];moved++;for(k=0;k<cc.length;k++)below[cc[k][1]*B.w+cc[k][0]]=j;}}}return moved;}
function lMove(B,P,i){if(!P[i]||P[i][2]!==0)return null;var o=lOcc(B,P,0);var c=B.cars[i],D=DIRS[c.d],x=P[i][0]+D[0],y=P[i][1]+D[1];
while(x>=0&&y>=0&&x<B.w&&y<B.h){if(o[y*B.w+x]!==-1)return null;x+=D[0];y+=D[1];}var Q=P.slice();Q[i]=null;lDrop(B,Q);return Q;}
function lKey(P){var s='';for(var i=0;i<P.length;i++)s+=P[i]?P[i][2]:'-';return s;}
function lSolve(B,P0,limit){var seen={},nodes=0;limit=limit||200000;
function rec(P){if(!P.some(function(p){return!!p;}))return true;var k=lKey(P);if(seen[k])return false;seen[k]=1;if(++nodes>limit)throw 0;
for(var i=0;i<P.length;i++){var Q=lMove(B,P,i);if(Q&&rec(Q))return true;}return false;}
try{return rec(P0);}catch(e){return null;}}
function lFirst(B,P){for(var i=0;i<P.length;i++){var Q=lMove(B,P,i);if(Q&&lSolve(B,Q,60000)===true)return i;}return-1;}
function lRandom(B,P0,R,runs){var dead=0;for(var r=0;r<runs;r++){var P=P0.slice();for(;;){if(!P.some(function(p){return!!p;}))break;var f=[];
for(var i=0;i<P.length;i++)if(lMove(B,P,i))f.push(i);if(!f.length){dead++;break;}P=lMove(B,P,f[ri(R,f.length)]);}}return dead/runs;}
function lGen(o,seed){var R=rng(seed),best=null;
for(var t=0;t<(o.tries||60);t++){var B={w:o.w,h:o.h,cars:[]},P=[];
for(var fl=0;fl<3;fl++){var occ=new Int8Array(o.w*o.h);for(var i=0;i<occ.length;i++)occ[i]=-1;var want=fl===0?o.n0:o.nUp;
for(var a=0;a<300&&want>0;a++){var L=R()<.8?2:3,d=ri(R,4),D=DIRS[d],x=ri(R,o.w),y=ri(R,o.h),cc=[],ok=true;
for(var k=0;k<L;k++){var cx=x-D[0]*k,cy=y-D[1]*k;if(cx<0||cy<0||cx>=o.w||cy>=o.h||occ[cy*o.w+cx]!==-1){ok=false;break;}cc.push([cx,cy]);}
if(!ok)continue;B.cars.push({d:d,L:L});P.push([x,y,fl]);cc.forEach(function(p){occ[p[1]*o.w+p[0]]=1;});want--;}}
lDrop(B,P);lDrop(B,P);
var ok2=lSolve(B,P,80000);if(ok2!==true)continue;var dd=lRandom(B,P,R,12),sc=(dd>.85?-1:dd)+R()*.01;
if(!best||sc>best.sc)best={B:B,P:P,dead:dd,sc:sc};if(dd>=.2&&dd<=.8)break;}
return best;}
var SHIFT={from:20,len0:5,lenMax:10,hearts:3};
function shiftLen(done){return Math.min(SHIFT.lenMax,SHIFT.len0+(done|0));}
function shiftYards(unl,len,seed){var R=rng(seed),hi=Math.max(11,unl-1),out=[],s=10+ri(R,Math.max(1,hi-10));
for(var k=0;out.length<len&&k<len*3;k++){var i=10+((s-10+k)%Math.max(1,hi-10));if(i%10===9)continue;out.push(i);}return out;}
var RULES=[{id:'',ic:'🚚',ru:'Разминка: обычный двор',en:'Warm-up: an ordinary yard'},
{id:'column',ic:'🚗',ru:'Колонна: следом едут свободные того же цвета',en:'Convoy: freed cars of the same colour follow'},
{id:'shop',ic:'🛒',ru:'Стоянка у магазина: трое одного цвета уезжают вместе',en:'Shop parking: three of a colour leave together'},
{id:'gran',ic:'👵',ru:'Бабушка на переходе: жди, пока перейдёт',en:'Granny on the crossing: wait till she’s across'},
{id:'polar',ic:'🌙',ru:'Ночь: у некоторых машин нет стрелок — смотри на фары',en:'Night: some cars have no arrows — check their lights'},
{id:'amb',ic:'🚑',ru:'Скорая: выпусти её, пока не кончились ходы',en:'Ambulance: let it out before the moves run out'},
{id:'pocket',ic:'🧺',ru:'Карман у арки: машина берёт жильца своего цвета',en:'Arch pocket: a car takes a neighbour of its colour'},
{id:'bar',ic:'🚧',ru:'Шлагбаум: откроется, когда уедет машина с брелоком',en:'Barrier: opens when the car with the fob leaves'},
{id:'hatch',ic:'🕳',ru:'Люки: проезд откроют через несколько выездов',en:'Manholes: the way opens after a few cars leave'},
{id:'trash',ic:'🚛',ru:'Мусоровоз у края: уедет, когда выедут несколько машин',en:'Bin lorry at the edge: leaves after a few cars go'}];
function shiftRule(i){return RULES[Math.max(0,Math.min(RULES.length-1,i|0))];}
var HELP=[{id:'ded',ic:'👴',ru:'Дед: один эвакуатор бесплатно',en:'Grandad: one free tow'},
{id:'shura',ic:'👵',ru:'Шура: одна подсказка бесплатно',en:'Shura: one free hint'},
{id:'tolik',ic:'🔧',ru:'Толик: первая авария не считается',en:'Tolik: your first crash doesn’t count'}];
function nameSeed(s){var h=2166136261;s=String(s||'').toLowerCase();for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0)%900000+1000;}
var YEARS=[[1970,'Копейка','Lada 2101'],[1975,'Москвич-412','Moskvich 412'],[1980,'Запорожец','Zaporozhets'],[1985,'Волга','Volga'],[1990,'Девятка','Lada Samara'],[1995,'Иномарка из Германии','A used German car'],[2000,'Десятка','Lada 110']];
function yearOf(y){var b=YEARS[0];for(var i=0;i<YEARS.length;i++)if(y>=YEARS[i][0])b=YEARS[i];return b;}
var RETRO={1970:['#c0392b','#f1c40f','#ecf0f1','#2e86de'],1975:['#16a085','#e67e22','#bdc3c7','#8e44ad'],1980:['#d35400','#27ae60','#f39c12','#7f8c8d'],
1985:['#2c3e50','#ecf0f1','#c0392b','#27ae60'],1990:['#8e44ad','#e74c3c','#ecf0f1','#34495e'],1995:['#2980b9','#95a5a6','#2c3e50','#c0392b'],2000:['#f1c40f','#16a085','#bdc3c7','#e74c3c']};
function lineLife(t,joke){var n=String(t||'').length;return joke?Math.min(30,8+.2*n):Math.min(20,5+.12*n);}
var V3DA={rng:rng,DIRS:DIRS,cellsOf:cellsOf,occOf:occOf,slide:slide,gMove:gMove,gSolve:gSolve,gFirst:gFirst,gRandom:gRandom,gGen:gGen,
lOcc:lOcc,lDrop:lDrop,lMove:lMove,lSolve:lSolve,lFirst:lFirst,lRandom:lRandom,lGen:lGen,
SHIFT:SHIFT,shiftLen:shiftLen,shiftYards:shiftYards,RULES:RULES,shiftRule:shiftRule,HELP:HELP,nameSeed:nameSeed,YEARS:YEARS,yearOf:yearOf,RETRO:RETRO,lineLife:lineLife,
HILL:function(k){return{w:5,h:7,n:Math.min(10,6+(k>>1)),tries:80};},MOON:function(k){return{w:5,h:7,n:Math.min(10,6+(k>>1)),moon:1,tries:80};},
LIFT:function(k){return{w:5,h:6,n0:Math.min(8,5+(k>>1)),nUp:Math.min(5,3+(k>>2)),tries:80};}};
if(typeof module!=='undefined'&&module.exports)module.exports=V3DA;
root.V3DA=V3DA;
})(typeof window!=='undefined'?window:this);
if(typeof window!=='undefined')(function(){
var W=window,D=document,A=W.V3DA;
function ok(f,d){try{return f();}catch(e){return d;}}
function Lg(ru,en){return ok(function(){return L(ru,en);},ru);}
function S_(){return ok(function(){return S;},null);}
function G_(){return ok(function(){return G;},null);}
function sv(){ok(function(){save();});}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function el(id){return D.getElementById(id);}
var REG={};
function is(k){var id=k?'deep.'+k:'deep';try{if(W.V3&&V3.reg){if(!REG[id]){REG[id]=1;V3.reg(id,{s:'DEEP',t:k||'Чердак'});}return V3.is(id)&&V3.is('deep');}}catch(e){}
try{var m=/[?&]off=([^&#]*)/.exec(location.search||'');if(m){var a=decodeURIComponent(m[1]).split(',');if(a.indexOf('v3')>=0||a.indexOf('v3.deep')>=0||a.indexOf('v3.'+id)>=0||a.indexOf(id)>=0)return false;}}catch(e){}return true;}
['attic','shift','rules','hill','lift','moon','time','name','legend'].forEach(function(k){is(k);});
function ev(o){ok(function(){V3.ev('attic',o);});}
function def(){return{st:{},lv:{},sh:{d:0,b:0,last:null},nm:'',lg:0,tm:0};}
function fix(v){if(!v||typeof v!=='object')v=def();var d=def();for(var k in d)if(v[k]===undefined)v[k]=d[k];
if(typeof v.st!=='object'||!v.st)v.st={};if(typeof v.lv!=='object'||!v.lv)v.lv={};if(typeof v.sh!=='object'||!v.sh)v.sh={d:0,b:0,last:null};
v.sh.d=+v.sh.d||0;v.sh.b=+v.sh.b||0;v.nm=String(v.nm||'').slice(0,20);v.lg=v.lg?1:0;return v;}
function mx(a,b){var o={};[a||{},b||{}].forEach(function(x){for(var k in x)o[k]=Math.max(+o[k]||0,+x[k]||0);});return o;}
ok(function(){V3.field('v3d2',{s:'DEEP',def:def,fix:fix,merge:function(a,b,newer){a=fix(a);b=fix(b);var r=fix(newer?b:a);
r.st=mx(a.st,b.st);r.lv=mx(a.lv,b.lv);r.sh.d=Math.max(a.sh.d,b.sh.d);r.sh.b=Math.max(a.sh.b,b.sh.b);r.lg=a.lg||b.lg?1:0;return r;}});});
function P(){var s=S_();if(!s)return def();s.v3d2=fix(s.v3d2);return s.v3d2;}
function done(){var s=S_();return s?+s.levelsDone||0:0;}
var VET=210;
function sayL(t,joke){ok(function(){say(t,'bench');var g=G_();if(g&&g.bubbles&&g.bubbles[0])g.bubbles[0].life=A.lineLife(t,joke);});}
function shuraH(t,m){return ok(function(){return shura(t,m||'happy');},'<p>'+esc(t)+'</p>');}
ok(function(){(W.homeSlots=W.homeSlots||[]).push({id:'th-attic',zone:'thing',order:70,render:function(){
if(!is('attic')&&!is('shift'))return null;var n=done();if(n<A.SHIFT.from)return null;
return{at:'attic',t:Lg('Чердак','Attic'),s:n>=VET?Lg('горка, лифт, Луна, смена','hill, lift, Moon, shifts'):Lg('смена: дворы подряд','shift: yards in a row'),badge:'',go:openAttic};}});});
function openAttic(){var n=done(),p=P(),h='<h2>🏚 '+Lg('Чердак','Attic')+'</h2>';
h+=shuraH(n>=VET?Lg('Тут дед всё хранит: и горку, и лифт, и даже Луну. Выбирай, водитель.','Grandad keeps everything up here: the hill, the lift, even the Moon. Take your pick, driver.')
:Lg('Чердак откроется ветеранам — после 210 дворов. А смену можно хоть сейчас.','The attic opens to veterans — after 210 yards. But you can take a shift right now.'));
h+='<div class="v3aL">';
if(is('shift'))h+='<button class="btn green noenter" data-at="shift">🚚 '+Lg('Смена: ','Shift: ')+A.shiftLen(p.sh.d)+' '+Lg('дворов подряд','yards in a row')+(p.sh.d?' · ✔ '+p.sh.d:'')+'</button>';
if(n>=VET&&is('attic')){
[['hill','⛰',Lg('Двор на горке','Hillside yard')],['moon','🌙',Lg('Двор на Луне','Yard on the Moon')],['lift','🛗',Lg('Лифт-парковка','Lift car park')],
['time','🕰',Lg('Машина времени','Time machine')],['name','🏷',Lg('Двор имени тебя','A yard named after you')],['legend','🏆',Lg('Двор-легенда №1000','Legend yard No. 1000')]].forEach(function(r){
if(!is(r[0]))return;var st=p.st[r[0]]?' '+'★★★'.slice(0,Math.min(3,p.st[r[0]])):'',lv=p.lv[r[0]]?' · '+p.lv[r[0]]:'';
h+='<button class="btn sec noenter" data-at="'+r[0]+'">'+r[1]+' '+esc(r[2])+(r[0]==='legend'&&p.lg?' 🏅':lv+st)+'</button>';});}
else if(n<VET)h+='<p class="v3aS">🔒 '+Lg('До Чердака: ','To the attic: ')+(VET-n)+' '+Lg('дв.','yards')+'</p>';
if(p.sh.last)h+='<button class="btn sec noenter" data-at="sheet">📋 '+Lg('Путевой лист последней смены','Last shift’s logbook')+'</button>';
h+='</div><div class="row"><button class="btn" id="mCancel">'+Lg('Закрыть','Close')+'</button></div>';
VY.modal(h);ev({a:'open',n:n});
var q=D.querySelectorAll('[data-at]');for(var i=0;i<q.length;i++)q[i].onclick=function(){go(this.getAttribute('data-at'));};
el('mCancel').onclick=function(){VY.hide();};}
function go(k){if(k==='shift')return deal();if(k==='sheet')return sheet(P().sh.last,true);if(k==='hill'||k==='moon'||k==='lift')return puzzle(k);
if(k==='time')return timeMachine();if(k==='name')return nameYard();if(k==='legend')return single('legend',219,1000);}
var SH=null;
function deal(){var h='<h2>🤝 '+Lg('Сделка с дедом','A deal with Grandad')+'</h2>'+shuraH(Lg('Смена — дворы подряд, три ❤️ на всю смену, и в каждом дворе — новое правило. Бери помощника — одного.','A shift is yards in a row, three ❤️ for the whole shift, and every yard brings a new rule. Take one helper.'),'happy')+'<div class="v3aL">';
A.HELP.forEach(function(x){h+='<button class="btn sec noenter" data-hp="'+x.id+'">'+x.ic+' '+esc(Lg(x.ru,x.en))+'</button>';});
VY.modal(h+'</div><div class="row"><button class="btn" id="mCancel">'+Lg('Назад','Back')+'</button></div>');
var q=D.querySelectorAll('[data-hp]');for(var i=0;i<q.length;i++)q[i].onclick=function(){shiftStart(this.getAttribute('data-hp'));};el('mCancel').onclick=openAttic;}
function dayN(){return ok(function(){return V3.dk();},0)||Math.floor(Date.now()/864e5);}
function shiftStart(hp){var p=P(),len=A.shiftLen(p.sh.d),s=S_(),ys=A.shiftYards((s&&s.unlocked)||21,len,dayN()*7+p.sh.d);
SH={ys:ys,i:0,hp:hp,hearts:A.SHIFT.hearts+(hp==='tolik'?1:0),cr:0,t0:Date.now(),len:len,used:0,rl:[],rule:''};ev({a:'shift',r:'start',l:len,h:hp});shiftNext();}
function shiftNext(){var idx=SH.ys[SH.i],r=is('rules')?A.shiftRule(SH.i).id:'',H=W.LVLH;ok(function(){hideModal();});SH.rule=r;
if(H)H.force=HZR[r]?[r]:[];SH.pol=0;
try{startLevel(idx,false,{mode:'attic',sub:'shift',seed:idx*7919+SH.i*31+dayN()});}finally{if(H)H.force=null;}}
var HZR={gran:1,polar:1,bar:1,hatch:1,trash:1},KR={column:1,shop:1,pocket:1};
ok(function(){var LD=W.LVLD;if(!LD||!LD.apply)return;var a0=LD.apply;LD.apply=function(lv,p,idx,seed,mode){var r=a0.apply(this,arguments);
try{if(mode==='attic'&&curSub==='shift'&&SH&&lv){if(SH.rule==='amb'){if(!lv.amb){var occ=baseOcc(lv),c=[],c2=[];
for(var i=0;i<lv.vehicles.length;i++){if(lv.police===i||(lv.noArrow||[]).indexOf(i)>=0)continue;var n=closureOf(lv.vehicles,occ,lv.w,lv.h,i).size;if(n>=3&&n<=9)c.push([i,n]);else if(n>=2)c2.push([i,n]);}
var pk=(c.length?c:c2)[(seed>>>0)%Math.max(1,(c.length?c:c2).length)];if(pk)lv.amb={id:pk[0],limit:pk[1]+2};}}
else delete lv.amb;}}catch(e){}
return r;};});
ok(function(){var H=W.LVLH;if(!H||!H.make)return;var m0=H.make;H.make=function(lv){var r=m0.apply(this,arguments);try{if(H.force&&SH)SH.pol=lv&&lv.polar?1:0;}catch(e){}return r;};});
function kindOn(g,kind){var K=W.V3K;if(!K||!K.build||!K.fieldOfG||!K.CFG||(K.flagOn&&!K.flagOn(kind)))return false;
var skip={};g.vs.forEach(function(v){if(v.kind||v.own)skip[v.id]=1;});
var Ly=K.build(kind,K.fieldOfG(g),g.idx,(g.idx*7919+SH.i*31)|0,skip);if(!Ly)return false;
if(g.amb)g.amb.done=true;
g.v3k={kind:kind,L:Ly,st:kind==='pocket'?{qi:0,pk:[],mx:0}:kind==='shop'?{tr:[],mx:0}:{taps:0},born:[],fx:[],t0:(W.performance?performance.now():Date.now())/1000,bought:0,sh:1};
g.vs.forEach(function(v,i){var c=Ly.col[i];ok(function(){if(c>=0)tint(v,K.CFG.pal[c]);else if(kind!=='column'&&!v.kind&&!v.own)tint(v,K.CFG.neutral);});});
ok(function(){carsKey='';});return true;}
function ruleOn(g,r){if(!r)return false;if(KR[r])return kindOn(g,r);if(r==='amb')return!!(g.amb&&!g.amb.done);if(r==='polar')return!!SH.pol&&g.vs.some(function(v){return v.noArrow;});
var hz=g.hz;if(!hz)return false;if(r==='gran')return hz.gran>=0;return(hz.cells||[]).some(function(c){return c[3]===r;});}
function ruleIntro(g){var r=SH.rule,got=ruleOn(g,r),R0=got?A.RULES.filter(function(x){return x.id===r;})[0]:A.RULES[0];SH.rl.push(got?r:'');g.v3sr=got?r:'';
ev({a:'shift',r:'rule',k:got?r:'-',w:r,i:SH.i+1});
ok(function(){var t=el('tip');if(!t)return;t.textContent='🚚 '+(SH.i+1)+'/'+SH.len+' · '+R0.ic+' '+Lg(R0.ru,R0.en);t.style.display='block';TIPM={k:'v3shift',z:0,t0:Date.now()};tipAutoHide();});
if(got&&SH.i>0)setTimeout(function(){if(G_()===g&&!g.over)sayL(Lg(SL[SH.i%SL.length][0],SL[SH.i%SL.length][1]),true);},1300);}
var SL=[['Новый двор — новое правило. Дед говорит: смена растёт, а водитель — с ней.','New yard, new rule. Grandad says the shift grows, and the driver grows with it.'],
['Ещё правило сверху! Ничего, ты справишься — я ж тебя учила.','One more rule on top! You’ll manage — I taught you, didn’t I.'],
['Тут по-другому. Присмотрись сначала, потом жми.','It’s different here. Look first, then tap.'],
['Смена длинная, двор хитрый. Как в девяностые!','A long shift and a tricky yard. Just like the nineties!']];
function onStart(){var g=G_();if(!g||g.mode!=='attic')return;
if(g===onStart.g)return;onStart.g=g;
if(SH&&curSub==='shift'){g.hearts=SH.hearts;ok(function(){renderHearts();});
if(SH.i===0&&SH.hp==='ded'&&!SH.used){g.towFree=1;SH.used=1;ok(function(){updCoins();});}
if(SH.i===0&&SH.hp==='shura'&&!SH.used){var s=S_();if(s&&!s.freeHint){s.freeHint=1;sv();}SH.used=1;}
ruleIntro(g);}
if(curSub==='time')retro(g);
if(curSub==='legend')setTimeout(function(){sayL(Lg('Двор-легенда! Тысячный! Тут, говорят, сам председатель парковался.','The legendary yard! Number one thousand! They say the chairman himself parked here.'),1);},900);
if(curSub==='name')setTimeout(function(){sayL(Lg('Двор имени '+P().nm+'! Табличку повешу — сама напишу.','A yard named after '+P().nm+'! I’ll paint the sign myself.'),1);},900);}
var curSub='';
ok(function(){var s0=startLevel;W.startLevel=function(idx,daily,o){curSub=o&&o.mode==='attic'?o.sub||'':'';if(!(o&&o.mode==="attic"))SH=null;return s0.apply(this,arguments);};});
ok(function(){V3.sub('yard-start',function(){onStart();},'deep.attic');});
ok(function(){UI.on&&UI.on('yard-start',function(){onStart();});});
function sheet(L0,back){if(!L0)return;var h='<h2>📋 '+Lg('Путевой лист','Logbook')+'</h2><div class="v3aSh">'+
'<p>'+Lg('Смена №','Shift No. ')+L0.n+' · '+esc(L0.dt)+'</p><p>'+Lg('Дворов: ','Yards: ')+L0.y+'/'+L0.len+'</p><p>'+Lg('Аварий: ','Crashes: ')+L0.cr+'</p>'+
(L0.rl&&L0.rl.length?'<p>'+Lg('Правила: ','Rules: ')+L0.rl.map(function(r){var x=A.RULES.filter(function(z){return z.id===r;})[0]||A.RULES[0];return x.ic;}).join(' ')+'</p>':'')+'<p>'+Lg('Время: ','Time: ')+Math.round(L0.s/60)+' '+Lg('мин','min')+'</p><p>'+Lg('Помощник: ','Helper: ')+esc(ok(function(){var x=A.HELP.filter(function(z){return z.id===L0.hp;})[0];return x.ic+' '+Lg(x.ru,x.en);},''))+'</p>'+
'<p><b>'+(L0.ok?Lg('Смена закрыта ✔','Shift closed ✔'):Lg('Смена не дотянута','Shift not finished'))+'</b></p><p class="v3aS">'+Lg('Подпись: баба Шура, диспетчер двора','Signed: Granny Shura, yard dispatcher')+'</p></div>'+
'<div class="row"><button class="btn green" id="mOk">'+(back?Lg('Назад','Back'):Lg('На Чердак','To the attic'))+'</button><button class="btn" id="mCancel">'+Lg('Закрыть','Close')+'</button></div>';
VY.modal(h);el('mOk').onclick=openAttic;el('mCancel').onclick=function(){VY.hide();};}
function shiftEnd(okk){var p=P(),L0={n:p.sh.d+(okk?1:0),y:SH.i+(okk?0:0),len:SH.len,cr:SH.cr,rl:(SH.rl||[]).slice(0,10),s:Math.round((Date.now()-SH.t0)/1000),hp:SH.hp,ok:okk?1:0,
dt:ok(function(){var d=new Date(nowMs());return d.getDate()+'.'+(d.getMonth()+1);},'')};
if(okk){p.sh.d++;p.sh.b=Math.max(p.sh.b,SH.len);}p.sh.last=L0;sv();ev({a:'shift',r:okk?'ok':'fail',y:L0.y,l:SH.len,c:SH.cr});SH=null;
ok(function(){leaveYard();});sheet(L0);
if(okk)setTimeout(function(){ok(function(){toast(Lg('Смена растёт: следующая — ','The shift grows: next one is ')+A.shiftLen(p.sh.d)+' '+Lg('дворов','yards'),3500);});},600);}
function stop(){var g=G_();if(g)g.over=true;ok(function(){YG.stop();});}
ok(function(){var w0=win;W.win=function(){var g=G_();if(!g||g.mode!=='attic')return w0.apply(this,arguments);if(g.v3aw)return;g.v3aw=1;stop();ok(function(){SND.win();});
var st=Math.max(1,Math.min(3,g.hearts));
if(curSub==='shift'&&SH){SH.hearts=g.hearts;SH.cr+=g.crashes||0;SH.i++;if(SH.i>=SH.len){SH.i=SH.len;return shiftEnd(true);}
VY.modal('<h2>✔ '+Lg('Двор ','Yard ')+SH.i+'/'+SH.len+'</h2>'+shuraH(Lg('Дальше, дальше — смена сама себя не закроет!','Keep going — the shift won’t close itself!'),'happy')+
'<p>❤️ × '+SH.hearts+'</p><div class="row"><button class="btn green" id="mOk">'+Lg('Следующий двор','Next yard')+'</button><button class="btn" id="mCancel">'+Lg('Сдать смену','End shift')+'</button></div>');
el('mOk').onclick=shiftNext;el('mCancel').onclick=function(){shiftEnd(false);};return;}
var p=P();p.st[curSub]=Math.max(+p.st[curSub]||0,st);p.lv[curSub]=(+p.lv[curSub]||0)+1;if(curSub==='legend')p.lg=1;sv();ev({a:'win',k:curSub,s:st});
VY.modal('<h2>'+(curSub==='legend'?'🏅 '+Lg('Легенда пройдена!','Legend cleared!'):'★'.repeat(st)+' '+Lg('Чердак','Attic'))+'</h2>'+
shuraH(curSub==='legend'?Lg('Тысячный двор! Медаль — навсегда. Председатель бы прослезился.','The thousandth yard! The medal is yours forever. The chairman would have shed a tear.'):Lg('Вот это водитель! Дед доволен.','Now that’s a driver! Grandad is pleased.'),'happy')+
'<div class="row"><button class="btn green" id="mOk">'+Lg('На Чердак','To the attic')+'</button><button class="btn" id="mCancel">'+Lg('Домой','Home')+'</button></div>');
el('mOk').onclick=function(){ok(function(){leaveYard();});openAttic();};el('mCancel').onclick=function(){VY.hide();ok(function(){leaveYard();});ok(function(){if(!(W.UI&&UI.go('home')))openMap();});};};});
ok(function(){var l0=lose;W.lose=function(){var g=G_();if(!g||g.mode!=='attic')return l0.apply(this,arguments);if(g.v3al)return;g.v3al=1;stop();
if(curSub==='shift'&&SH){SH.cr+=g.crashes||0;return shiftEnd(false);}
var sub=curSub,idx=g.idx,seed=g.v3as;
VY.modal('<h2>'+Lg('Машины помяты 💥','Cars dented 💥')+'</h2>'+shuraH(Lg('Ничего, чердак никуда не денется. Ещё разок?','Never mind, the attic isn’t going anywhere. Once more?'),'sad')+
'<div class="row"><button class="btn green" id="mOk">'+Lg('Ещё раз','Again')+'</button><button class="btn" id="mCancel">'+Lg('На Чердак','To the attic')+'</button></div>');
el('mOk').onclick=function(){single(sub,idx,seed);};el('mCancel').onclick=function(){ok(function(){leaveYard();});openAttic();};};});
function single(sub,idx,seed){ok(function(){hideModal();});SH=null;startLevel(idx,false,{mode:'attic',sub:sub,seed:seed});var g=G_();if(g)g.v3as=seed;ev({a:'start',k:sub,i:idx+1});}
var YR=0;
function timeMachine(){var h='<h2>🕰 '+Lg('Машина времени','Time machine')+'</h2>'+shuraH(Lg('Какой год крутим? Двор будет как тогда — и машины те же.','Which year shall we dial? The yard will be just like back then — same cars too.'),'happy')+'<div class="v3aL">';
A.YEARS.forEach(function(y){h+='<button class="btn sec noenter" data-yr="'+y[0]+'">'+y[0]+' · '+esc(Lg(y[1],y[2]))+'</button>';});
VY.modal(h+'</div><div class="row"><button class="btn" id="mCancel">'+Lg('Назад','Back')+'</button></div>');
var q=D.querySelectorAll('[data-yr]');for(var i=0;i<q.length;i++)q[i].onclick=function(){YR=+this.getAttribute('data-yr');P().tm=YR;sv();single('time',200+(YR-1970)/5,YR*7);};el('mCancel').onclick=openAttic;}
function retro(g){var pal=A.RETRO[YR]||A.RETRO[1970],y=A.yearOf(YR);g.vs.forEach(function(v,i){if(v.kind||v.own)return;ok(function(){tint(v,pal[i%pal.length]);});});ok(function(){carsKey='';});
setTimeout(function(){sayL(Lg(YR+'-й год! У всего двора '+y[1]+' — и все на одном месте норовят встать.','It’s '+YR+'! The whole yard drives a '+y[2]+' — and they all want the same spot.'),1);},900);}
function nameYard(){var p=P(),h='<h2>🏷 '+Lg('Двор имени тебя','A yard named after you')+'</h2>'+shuraH(Lg('Как двор назовём? По имени и раскладка будет — только твоя.','What shall we call the yard? The layout comes from the name — yours alone.'),'happy')+
'<p><input id="v3aNm" maxlength="20" value="'+esc(p.nm)+'" style="font-size:18px;padding:8px;width:80%"></p><div class="row"><button class="btn green noenter" id="mOk">'+Lg('Во двор','To the yard')+'</button><button class="btn noenter" id="mCancel">'+Lg('Назад','Back')+'</button></div>';
VY.modal(h);el('mCancel').onclick=openAttic;el('mOk').onclick=function(){var v=String(el('v3aNm').value||'').replace(/[<>"&\/\\@:.]/g,'').trim().slice(0,20);if(!v)return;p.nm=v;sv();single('name',214,A.nameSeed(v));};}
var PZ=null;
function puzzle(kind){var p=P(),k=+p.lv[kind]||0,seed=(dayN()%997)*13+k*131+(kind==='moon'?7:kind==='lift'?3:0),r;
r=kind==='lift'?A.lGen(A.LIFT(k),seed):A.gGen(kind==='moon'?A.MOON(k):A.HILL(k),seed);if(!r){ok(function(){toast(Lg('Не собрался двор — попробуй ещё','The yard didn’t assemble — try again'));});return;}
PZ={kind:kind,B:r.B,P0:r.P.slice(),P:r.P.slice(),n:0,mis:0,hint:-1,anim:null,k:k,seed:seed};
var tip=kind==='hill'?Lg('Горка! Уехала машина — все, под кем пусто, скатываются на клетку вниз. Ручник не держит.','A hill! When a car leaves, everyone with nothing below rolls down a cell. The handbrake doesn’t hold.')
:kind==='moon'?Lg('Луна! Тяжесть слабая — машины скатываются только после каждого второго выезда.','The Moon! Gravity is weak — cars roll down only after every second departure.')
:Lg('Лифт-парковка: уехала снизу — сверху опустится следующая. Верхние этажи видны прозрачными.','Lift car park: when a car leaves the ground floor, the one above comes down. Upper floors are see-through.');
VY.modal('<h2>'+(kind==='hill'?'⛰ ':kind==='moon'?'🌙 ':'🛗 ')+esc(kind==='hill'?Lg('Двор на горке','Hillside yard'):kind==='moon'?Lg('Двор на Луне','Yard on the Moon'):Lg('Лифт-парковка','Lift car park'))+'</h2>'+
'<p class="v3aS">'+esc(tip)+'</p><canvas id="v3aCv" style="width:100%;max-width:340px;touch-action:none;display:block;margin:0 auto"></canvas>'+
'<p id="v3aMsg" class="v3aS"></p><div class="row"><button class="btn sec noenter" id="v3aHint">💡 '+Lg('Подсказка','Hint')+'</button><button class="btn sec noenter" id="v3aRe">↺ '+Lg('Заново','Restart')+'</button><button class="btn noenter" id="mCancel">'+Lg('На Чердак','To the attic')+'</button></div>');
var cv=el('v3aCv');cv.onclick=function(e){tap(e,cv);};el('mCancel').onclick=function(){PZ=null;openAttic();};
el('v3aRe').onclick=function(){PZ.P=PZ.P0.slice();PZ.n=0;PZ.mis++;PZ.hint=-1;draw();};
el('v3aHint').onclick=function(){PZ.hint=kind==='lift'?A.lFirst(PZ.B,PZ.P):A.gFirst(PZ.B,PZ.P,PZ.n);if(PZ.hint<0)msg(Lg('Тут уже не выйдет — жми «Заново».','No way out now — press Restart.'));draw();};
ev({a:'start',k:kind,l:k});draw();}
function msg(t){var m=el('v3aMsg');if(m)m.textContent=t;}
var COLS=['#e74c3c','#2e86de','#f1c40f','#27ae60','#8e44ad','#e67e22','#16a085','#c0392b','#2980b9','#d35400','#7f8c8d','#ff6b9a'];
function geo(cv){var B=PZ.B,r=cv.getBoundingClientRect(),Wd=r.width||300,cs=Math.floor(Wd/B.w),dpr=Math.min(2,W.devicePixelRatio||1);cv.style.height=(cs*B.h)+'px';
if(cv.width!==Math.round(Wd*dpr)){cv.width=Math.round(Wd*dpr);cv.height=Math.round(cs*B.h*dpr);}return{cs:cs,dpr:dpr,ox:(Wd-cs*B.w)/2};}
function draw(){var cv=el('v3aCv');if(!cv||!PZ)return;var g=geo(cv),c=cv.getContext('2d'),B=PZ.B,cs=g.cs,lift=PZ.kind==='lift';c.setTransform(g.dpr,0,0,g.dpr,0,0);
c.fillStyle=PZ.kind==='moon'?'#3b3f4a':'#8d939c';c.fillRect(0,0,cv.width,cv.height);
if(PZ.kind==='moon'){c.fillStyle='rgba(255,255,255,.08)';for(var k=0;k<9;k++){c.beginPath();c.arc(g.ox+((k*53)%(B.w*cs)),(k*37)%(B.h*cs),cs*.35,0,7);c.fill();}}
if(PZ.kind==='hill'){c.fillStyle='rgba(0,0,0,.08)';for(var y=0;y<B.h;y++){c.fillRect(g.ox,y*cs+cs*.92,B.w*cs,2);}}
c.strokeStyle='rgba(255,255,255,.18)';for(var x=0;x<=B.w;x++){c.beginPath();c.moveTo(g.ox+x*cs,0);c.lineTo(g.ox+x*cs,B.h*cs);c.stroke();}
var fls=lift?[2,1,0]:[0];
fls.forEach(function(fl){for(var i=0;i<B.cars.length;i++){var p=PZ.P[i];if(!p||(lift&&p[2]!==fl))continue;var car=B.cars[i],cc=A.cellsOf(car,p[0],p[1]);
var xs=cc.map(function(q){return q[0];}),ys=cc.map(function(q){return q[1];}),x0=Math.min.apply(0,xs),y0=Math.min.apply(0,ys),x1=Math.max.apply(0,xs),y1=Math.max.apply(0,ys);
var off=lift?fl*cs*.12:0;c.globalAlpha=lift&&fl>0?(fl===1?.45:.25):1;
var X=g.ox+x0*cs+cs*.1-off,Y=y0*cs+cs*.1-off,Wc=(x1-x0+1)*cs-cs*.2,Hc=(y1-y0+1)*cs-cs*.2;
c.fillStyle=COLS[i%COLS.length];rr(c,X,Y,Wc,Hc,cs*.18);c.fill();c.lineWidth=PZ.hint===i?4:1.5;c.strokeStyle=PZ.hint===i?'#ffd23f':'rgba(0,0,0,.35)';c.stroke();
if(!lift||fl===0){var D0=A.DIRS[car.d],hx=g.ox+p[0]*cs+cs/2,hy=p[1]*cs+cs/2;c.fillStyle='#fff';c.beginPath();
c.moveTo(hx+D0[0]*cs*.3,hy+D0[1]*cs*.3);c.lineTo(hx-D0[1]*cs*.18-D0[0]*cs*.05,hy+D0[0]*cs*.18-D0[1]*cs*.05);c.lineTo(hx+D0[1]*cs*.18-D0[0]*cs*.05,hy-D0[0]*cs*.18-D0[1]*cs*.05);c.fill();}
c.globalAlpha=1;}});}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function tap(e,cv){if(!PZ)return;var g=geo(cv),r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left-g.ox)/g.cs),y=Math.floor((e.clientY-r.top)/g.cs),B=PZ.B;
if(x<0||y<0||x>=B.w||y>=B.h)return;var o=PZ.kind==='lift'?A.lOcc(B,PZ.P,0):A.occOf(B,PZ.P),i=o[y*B.w+x];if(i<0)return;
var Q=PZ.kind==='lift'?A.lMove(B,PZ.P,i):A.gMove(B,PZ.P,i,PZ.n);
if(!Q){PZ.mis++;ok(function(){SND.horn();});msg(Lg('Упёрлась! Сначала освободи дорогу.','Blocked! Clear the way first.'));return;}
PZ.P=Q;PZ.n++;PZ.hint=-1;ok(function(){SND.go();});msg('');draw();
if(!PZ.P.some(function(p){return!!p;}))return pzWin();
var any=false;for(var j=0;j<PZ.P.length&&!any;j++)if(PZ.P[j]&&(PZ.kind==='lift'?A.lMove(B,PZ.P,j):A.gMove(B,PZ.P,j,PZ.n)))any=true;
if(!any){msg(Lg('Тупик: никто не уедет. Жми «Заново».','Dead end: nobody can leave. Press Restart.'));ev({a:'dead',k:PZ.kind});}}
function pzWin(){var p=P(),k=PZ.kind,st=PZ.mis===0?3:PZ.mis<=2?2:1;p.st[k]=Math.max(+p.st[k]||0,st);p.lv[k]=(+p.lv[k]||0)+1;sv();ev({a:'win',k:k,s:st,l:PZ.k});ok(function(){SND.win();});
var t=k==='hill'?Lg('Говорила — подкладывай кирпич! А ты и без кирпича справился.','I told you to put a brick under the wheel! But you managed without one.'):k==='moon'?Lg('Маленький шаг для водителя — большой выезд для двора!','One small step for a driver, one giant exit for the yard!'):Lg('Три этажа — и ни одной царапины. Лифтёр бы позавидовал.','Three floors and not a scratch. The lift man would be jealous.');
VY.modal('<h2>'+'★'.repeat(st)+' '+Lg('Чисто!','All clear!')+'</h2>'+shuraH(t,'happy')+'<div class="row"><button class="btn green noenter" id="mOk">'+Lg('Следующий','Next')+'</button><button class="btn" id="mCancel">'+Lg('На Чердак','To the attic')+'</button></div>');
el('mOk').onclick=function(){puzzle(k);};el('mCancel').onclick=openAttic;PZ=null;}
ok(function(){var s=D.createElement('style');s.textContent='.v3aL{display:flex;flex-direction:column;gap:8px;margin:8px 0}.v3aS{font-size:14px;opacity:.85}.v3aSh{text-align:left;background:#fffbe9;color:#3a2f1a;border-radius:10px;padding:8px 12px;font-family:Georgia,serif}.v3aSh p{margin:4px 0}';D.head.appendChild(s);});
W.V3DA.open=openAttic;W.V3DA.go=go;W.V3DA.state=function(){return P();};
})();