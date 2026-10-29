(function(){'use strict';
var W=window,D=document;
if(!W.V3||!V3.reg||!W.UI||!W.homeSlots)return;
if(!V3.reg('night',{s:'NIGHT',t:'Вечер и утро'}))return;
var PARTS={yard:'Двор на ночь и утренний разъезд',door:'Домофон Шуры — дверь первого захода дня',mosk:'«Москвич» деда утром',tolik:'Толик: машина готова',
board:'Двор дня по видам, квадратики, ссылка #y',omen:'Примета дня',brand:'Марочный день',serial:'Сериал подъезда',ntf:'Напоминание после двора на ночь',nb:'Двор соседа на ночь (сервер квартала V3QS)'};
var p;for(p in PARTS){try{V3.reg('night.'+p,{s:'NIGHT',t:PARTS[p]});}catch(e){}}
function on(k){try{return V3.is('night.'+k);}catch(e){return false;}}
function ok(f,d){try{return f();}catch(e){return d;}}
function $(id){return D.getElementById(id);}
function T(a,b){return ok(function(){return L(a,b);},a);}
function en(){return ok(function(){return LANG==='en';},false);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function Sv(){return ok(function(){return S;},null);}
function Gv(){return ok(function(){return G;},null);}
function ev(a,o){ok(function(){V3.ev(a,o);});}
function sv(){ok(function(){save();});}
var Q=location.search||'';
function qv(k){var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(Q);return m?decodeURIComponent(m[1]):null;}
function now(){return ok(function(){return nowMs();},Date.now());}
function hour(){var f=qv('v3nh');if(f!=null&&/^\d+$/.test(f))return(+f)%24;return new Date(now()).getHours();}
function ymd(d){return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function sday(){var f=qv('v3n'),d=new Date(now()-5*3600e3),k=ymd(d);if(f==='morn'){var e=nv().e;if(e&&e.s===1&&k<=e.d)return e.d+1;}return k;}
function today(){return ok(function(){return dayKey(0);},ymd(new Date(now())));}
function wday(){return new Date(now()).getDay();}
function isEve(){var f=qv('v3n');if(f==='eve')return true;if(f==='morn'||f==='day')return false;var h=hour();return h>=17||h<5;}
function isMorn(){var f=qv('v3n');if(f==='morn')return true;if(f==='eve'||f==='day')return false;var h=hour();return h>=5&&h<12;}
function hsh(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function rnd(seed){return ok(function(){return rng(seed);},function(){seed=(seed*1103515245+12345)>>>0;return seed/4294967296;});}
function isO(x){return!!x&&typeof x==='object'&&!Array.isArray(x);}
function int(v,a,b){v=+v;return isFinite(v)&&v===Math.floor(v)&&v>=a&&v<=b;}
function fixE(e){if(!isO(e))return null;if(!int(e.w,4,12)||!int(e.h,4,14)||!int(e.d,20000101,30001231))return null;
if(!Array.isArray(e.q)||!e.q.length||e.q.length>30)return null;if(!Array.isArray(e.c))e.c=[];if(!Array.isArray(e.ob))e.ob=[];
var i,q,ok2=true;for(i=0;i<e.q.length;i++){q=e.q[i];if(!Array.isArray(q)||!int(q[0],2,4)||!int(q[1],0,40)||q.length>5)ok2=false;}
for(i=0;i<e.ob.length;i++){q=e.ob[i];if(!Array.isArray(q)||!int(q[0],0,e.w-1)||!int(q[1],0,e.h-1))ok2=false;}
if(e.c.length>e.q.length)ok2=false;for(i=0;i<e.c.length&&ok2;i++){q=e.c[i];if(!Array.isArray(q)||!int(q[0],0,e.w-1)||!int(q[1],0,e.h-1)||!int(q[2],0,3))ok2=false;}
if(!ok2)return null;e.s=e.s===1?1:0;if(!int(e.st,0,3))e.st=0;return e;}
var NUMS=['k','md','dr','dp','ms','mn','om','yy','ed','kc','nb'];
V3.field('v3n',{s:'NIGHT',def:{v:1},
fix:function(o){if(!isO(o))o={v:1};o.v=1;for(var i=0;i<NUMS.length;i++){var k=NUMS[i];if(typeof o[k]!=='number'||!isFinite(o[k])||o[k]<0)o[k]=0;}
o.e=fixE(o.e);if(!isO(o.se))o.se={i:0,e:0,d:0};['i','e','d','h'].forEach(function(k){if(typeof o.se[k]!=='number'||!isFinite(o.se[k])||o.se[k]<0)o.se[k]=0;});
if(!Array.isArray(o.yd)||o.yd.length!==2)o.yd=[0,0];return o;},
merge:function(a,b,newer){if(!isO(b))return a;if(!isO(a))return b;var r={v:1},i,k;
for(i=0;i<NUMS.length;i++){k=NUMS[i];r[k]=Math.max(+a[k]||0,+b[k]||0);}r.dp=newer?(+b.dp||0):(+a.dp||0);
var sa=isO(a.se)?a.se:{e:0},sb=isO(b.se)?b.se:{e:0};r.se=((sb.i||0)*100+(sb.e||0))>((sa.i||0)*100+(sa.e||0))?sb:sa;
r.yd=(a.yd&&b.yd&&b.yd[0]>a.yd[0])?b.yd:(a.yd||b.yd||[0,0]);
var ea=a.e,eb=b.e,pick=null;if(ea&&eb)pick=(eb.d>ea.d||eb.d===ea.d&&(eb.s>ea.s||eb.s===ea.s&&eb.c.length>ea.c.length))?eb:ea;else pick=ea||eb||null;
if(pick&&pick.d<r.md)pick=null;
r.e=pick;return r;}});
function nv(){var s=Sv();if(!s)return{v:1,se:{},yd:[0,0]};if(!isO(s.v3n))s.v3n={v:1,se:{i:0,e:0,d:0},yd:[0,0]};return s.v3n;}
function done(){return Math.max(0,(+ok(function(){return S.unlocked;},1)||1)-1);}
function tl(path,ctx){return ok(function(){if(W.V3T&&V3T.on&&V3T.on()){var x=V3T.line(path,ctx||{});if(x&&x.t)return V3T.fill?V3T.fill(x.t,ctx||{}):x.t;}return'';},'');}
function pickA(a,seed){return a[(seed>>>0)%a.length];}
var TX={
eveIn:[['Вечер. Сейчас с работы поедут — а ставить им некуда. Ты молодой, расставь.','Evening. Everyone’s coming home from work and there’s nowhere to park. You’re young — sort them out.'],
['Соседи с работы едут. Ставь так, чтобы утром все выехали. Я проверю — из окна.','Neighbours are driving home. Park them so they can all get out in the morning. I’ll check — from my window.']],
eveDone:[['Ну смотри. Утром им всем в восемь на работу. Тебе разгребать.','Well then. They all leave for work at eight. You’ll be the one sorting it out.'],
['Все на месте. Спят. Машины тоже. Утром разбудим — по одной.','Everyone’s parked. Asleep. The cars too. We’ll wake them in the morning — one at a time.']],
stuck:[['Некуда ставить! Кто ж так ставит — утром сам плакать будешь.','Nowhere to park! Who parks like that — you’ll cry about it in the morning.'],
['Валерке места нет. Он, конечно, привык, но всё-таки.','No room for Valerka. He’s used to it, of course, but still.']],
mornIn:[['Утро! Всем в восемь на работу. Ты их вчера ставил — тебе и выпускать.','Morning! Everyone has to be at work by eight. You parked them last night — you let them out.']],
mornWin:[['Ты их вчера так поставил, что Галя до сих пор не вышла. Я — довольна.','You parked them so well last night that Galya still hasn’t got out. I’m pleased.'],
['Все на работе. Двор пустой — красота. До вечера.','Everyone’s off to work. The yard is empty — lovely. See you tonight.']],
mornLose:[['Утро не задалось. Ничего, двор подождёт — начни заново.','The morning went wrong. Never mind, the yard will wait — start again.']],
wait:[['Спят до утра. Утром разгребёшь — я разбужу.','They’re asleep till morning. You’ll sort them out then — I’ll wake you.']],
early:[['Вечером приходи — с пяти часов соседи с работы поедут.','Come back in the evening — from five o’clock the neighbours drive home.']],
offer:[['Вечереет. Соседи с работы едут — расставишь на ночь? Утром сам их и выпустишь.','It’s getting dark. Neighbours are driving home — will you park them for the night? In the morning you’ll let them out.']],
moskNo:[['«Москвич» утром заводят. Вечером он отдыхает — как я.','The Moskvich gets started in the mornings. In the evening it rests — like me.']],
moskOk:[['Завёлся! С третьего раза — это он тебя уважает.','It started! On the third go — that means it respects you.'],['Завёлся. Мой говорит, ты к нему подход знаешь.','It started. My old man says you’ve got the knack.']],
moskFail:[['Чих-пых…','Splutter…'],['Ещё разок!','Once more!'],['Почти!','Almost!']],
doorHi:[['Алло! Это Шура. Слушай, что у нас во дворе.','Hello! It’s Shura. Listen to what’s going on in the yard.']],
doorNight:[['Твои соседи всю ночь проспали, как ты их поставил. Утром разгребать.','Your neighbours slept all night exactly where you parked them. Time to sort them out.']],
doorRumor:[['Говорят, ты вчера {n} машин вывел. Галя говорит — {m}.','They say you got {n} cars out yesterday. Galya says {m}.']],
tolik:[['Толик: «Машина готова — забирай, пока Михалыч не сел».','Tolik: “Your car’s ready — take it before Mikhalych sits in it.”']],
tolikEve:[['Толик сказал: к утру машина будет готова.','Tolik says the car will be ready by morning.']]
};
function tx(k,seed){var a=TX[k]||[['','']],x=pickA(a,seed==null?Math.floor(Math.random()*1e6):seed);return en()?x[1]:x[0];}
function fill(t,o){return String(t).replace(/\{(\w+)\}/g,function(m,k){return o&&o[k]!=null?o[k]:m;});}
var DIRS_=[[0,-1],[1,0],[0,1],[-1,0]],ARR=['↑','→','↓','←'];
function cellsOf(x,y,d,L){var D0=DIRS_[d],c=[];for(var k=0;k<L;k++)c.push([x-D0[0]*k,y-D0[1]*k]);return c;}
function fits(occ,w,h,x,y,d,L){var c=cellsOf(x,y,d,L),i;for(i=0;i<c.length;i++){var a=c[i];if(a[0]<0||a[1]<0||a[0]>=w||a[1]>=h||occ[a[1]*w+a[0]]!==-1)return null;}
var D0=DIRS_[d];for(var X=x+D0[0],Y=y+D0[1];X>=0&&Y>=0&&X<w&&Y<h;X+=D0[0],Y+=D0[1])if(occ[Y*w+X]!==-1)return null;return c;}
function allFits(occ,w,h,L,d){var o=[],x,y,dd;for(dd=0;dd<4;dd++){if(d!=null&&dd!==d)continue;for(y=0;y<h;y++)for(x=0;x<w;x++)if(fits(occ,w,h,x,y,dd,L))o.push([x,y,dd]);}return o;}
function occOf(e,upto){var w=e.w,h=e.h,occ=[],i,k;for(i=0;i<w*h;i++)occ.push(-1);for(i=0;i<e.ob.length;i++)occ[e.ob[i][1]*w+e.ob[i][0]]=-2;
var n=upto==null?e.c.length:upto;for(i=0;i<n;i++){var c=e.c[i],cl=cellsOf(c[0],c[1],c[2],e.q[i][0]);for(k=0;k<cl.length;k++)occ[cl[k][1]*w+cl[k][0]]=i;}return occ;}
function greedy(e){var w=e.w,h=e.h,occ=occOf(e,0),n=0;
for(var i=0;i<e.q.length;i++){var P=allFits(occ,w,h,e.q[i][0]),best=null,bs=-1e9;if(!P.length)break;
for(var j=0;j<P.length;j++){var c=cellsOf(P[j][0],P[j][1],P[j][2],e.q[i][0]),s=0;
for(var k=0;k<c.length;k++)for(var t=0;t<4;t++){var X=c[k][0]+DIRS_[t][0],Y=c[k][1]+DIRS_[t][1];if(X<0||Y<0||X>=w||Y>=h||occ[Y*w+X]!==-1)s++;}
var D0=DIRS_[P[j][2]],r=0,X2=P[j][0],Y2=P[j][1];while(X2+D0[0]>=0&&Y2+D0[1]>=0&&X2+D0[0]<w&&Y2+D0[1]<h){X2+=D0[0];Y2+=D0[1];r++;}
s=s*3-r+((j*7919)%13)*.01;if(s>bs){bs=s;best=c;}}
for(k=0;k<best.length;k++)occ[best[k][1]*w+best[k][0]]=i;n++;}
return n;}
function mkNight(day){var u=done(),k=+nv().k||0,R=rnd(hsh('v3n'+day+':'+u));
var w=u<15?5:u<30?6:u<60?7:8,h=u<15?7:u<30?8:u<60?9:10;if(k===0&&w>6){w=6;h=8;}
var ob=[],nob=k===0?1:w*h>=56?3:2,t;for(t=0;t<200&&ob.length<nob;t++){var x=1+Math.floor(R()*(w-2)),y=1+Math.floor(R()*(h-2)),bad=false;
for(var i=0;i<ob.length;i++)if(Math.abs(ob[i][0]-x)+Math.abs(ob[i][1]-y)<3)bad=true;if(!bad)ob.push([x,y,Math.floor(R()*3)]);}
var wd=wday(),f=k===0?.55:Math.min(.86,.62+.03*k),N=Math.max(5,Math.min(24,Math.round((w*h-ob.length)*f/2.4)*(k>0&&wd===5?.75:1)+(k>0&&wd===0?2:0))),pal=ok(function(){return LOOK.pal;},null),np=pal&&pal.length?pal.length:8,q=[],pc=-1;
var early=k>=2?1+Math.floor(R()*Math.max(1,N-2)):-1;
for(i=0;i<N;i++){var L=i===0?2:(u>=15&&R()<.3?3:2),c=Math.floor(R()*np);if(c===pc)c=(c+1)%np;pc=c;var x0=i===0?[2,c,'shesterka']:[L,c];
if(i===early){x0[2]=x0[2]||0;x0[3]=1;}
if(k>0&&wd===0&&i>=N-2&&L===2){x0[2]=x0[2]||0;x0[3]=x0[3]||0;x0[4]=1;}
q.push(x0);}
var e={d:day,w:w,h:h,ob:ob,q:q,c:[],s:0,st:0},g=greedy(e);if(g<q.length)e.q=q.slice(0,Math.max(4,g));
return e;}
function nightOpen(){return on('yard')&&done()>=8;}
function pending(){var e=nv().e;return e&&e.s===1?e:null;}
function mornReady(){var e=pending();return!!(e&&sday()>e.d);}
function eveOpen(){if(!nightOpen())return false;var n=nv(),e=n.e;if(e&&e.s===0)return true;if(e)return false;
if(!(n.k>0)&&!(n.ed>0))return true;
return isEve()&&n.ed!==sday();}
function stars(e){var miss=e.q.length-e.c.length,s=miss<=0?3:miss<=2?2:1;if(earlyIdx(e)>=0&&!earlyOk(e))s=Math.max(1,s-1);return s;}
function earlyIdx(e){for(var i=0;i<e.q.length;i++)if(e.q[i][3])return i;return-1;}
function earlyOk(e){var i=earlyIdx(e);if(i<0||i>=e.c.length)return false;var occ=occOf(e),c=e.c[i],D0=DIRS_[c[2]];
for(var X=c[0]+D0[0],Y=c[1]+D0[1];X>=0&&Y>=0&&X<e.w&&Y<e.h;X+=D0[0],Y+=D0[1]){var o=occ[Y*e.w+X];if(o!==-1&&o!==i)return false;}return true;}
function worst(e){var occ=occOf(e),cnt=[],i;for(i=0;i<e.c.length;i++)cnt.push(0);
for(i=0;i<e.c.length;i++){var c=e.c[i],D0=DIRS_[c[2]],seen={};for(var X=c[0]+D0[0],Y=c[1]+D0[1];X>=0&&Y>=0&&X<e.w&&Y<e.h;X+=D0[0],Y+=D0[1]){var o=occ[Y*e.w+X];if(o>=0&&o!==i&&!seen[o]){seen[o]=1;cnt[o]++;}}}
var b=-1,bn=0;for(i=0;i<cnt.length;i++)if(cnt[i]>bn){bn=cnt[i];b=i;}return{i:b,n:bn};}
var NG=null;
function color(e,i){var pal=ok(function(){return LOOK.pal;},null)||['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22','#1abc9c','#ecf0f1'];return pal[e.q[i][1]%pal.length];}
function mkVeh(e,i,w,h){var c=e.c[i],q=e.q[i],v=makeVehicle(cellsOf(c[0],c[1],c[2],q[0]),c[2],color(e,i),w,h,'');
v.id=i;v.s=0;v.state='idle';v.t=0;v.ap=1;v.apT=9;v.apD=0;if(q[2])v.vy=q[2];brandVeh(v);return v;}
function begin(m,e){var idx0=Math.max(0,Math.min(done(),209)),p0=ok(function(){return levelParams(idx0);},{}),pp={},k;for(k in p0)pp[k]=p0[k];
pp.w=e.w;pp.h=e.h;pp.boss=false;pp.amb=false;pp.police=false;var w=e.w,h=e.h;
var vs=[];for(var i=0;i<e.c.length;i++){var v=mkVeh(e,i,w,h);if(m==='morn'){v.ap=0;v.apT=0;v.apD=.1+i*.05;}vs.push(v);}
var tod=m==='morn'?'morning':(hour()>=22||hour()<5?'night':'evening');
try{if(G&&!G.over)leaveYard();}catch(x){}
G={p:pp,idx:idx0,daily:false,vs:vs,obst:e.ob.slice(),occ:[],hearts:3,parts:[],shake:0,over:false,hint:-1,hintT:0,winT:m==='eve'?-1e9:0,usedRevive:true,moves:0,
amb:null,police:-1,policeT:0,bubbles:[],towMode:false,bonus:0,anc:{wins:[],bench:[],lit:[],lamps:[]},tod:tod,birds:[],birdT:6,cat:{st:'wait',t:6},soft:false,tutorId:-1,pinchT:0,exited:false,
combo:0,crashes:0,helps:0,slowT:0,fz:0,focus:-1,fx:0,fy:0,x2:true,yardCar:-1,t0:Date.now(),mode:'night',uiEnd:1,v3n:{m:m},sosDone:true};
for(i=0;i<w*h;i++)G.occ.push(-1);vs.forEach(function(v){v.cells.forEach(function(c){G.occ[c[1]*w+c[0]]=v.id;});});e.ob.forEach(function(o){G.occ[o[1]*w+o[0]]=-2;});
NG={m:m,e:e,d:NG&&NG.e===e?NG.d:1,g:G};
ok(function(){resetGest();});
var sg=$('scr-game'),tb=ok(function(){return lookBg(tod);},'');sg.style.background=tb;D.body.style.background=tb;sg.classList.toggle('dark',!!(TOD[tod]&&TOD[tod].dark));
sg.classList.toggle('v3ne',m==='eve');sg.classList.toggle('v3nm',m==='morn');
cam.z=1;cam.x=cam.y=0;cam.tw=null;ok(function(){updZoomBtn();});$('gTow').classList.remove('on');$('gTow').style.display=m==='morn'?'':'none';ok(function(){updCoins();});
$('gLevel').textContent=m==='eve'?T('🌙 Двор на ночь','🌙 Night parking'):T('🌅 Утренний разъезд','🌅 Morning rush');
var gc=$('gCity');if(gc)gc.textContent=m==='eve'?T('Соседи с работы','Neighbours home from work'):T('Всем в восемь на работу','Everyone off to work by eight');
ok(function(){sideUpd();});ok(function(){updHud();});ok(function(){tipDone('x');});var tip=$('tip');if(tip)tip.style.display='none';
ok(function(){renderHearts();});show('scr-game');ok(function(){hideModal();});panel();
requestAnimationFrame(function(){ok(function(){layout();});ok(function(){birdsInit();});
var wd=wday(),dl=m==='eve'&&(+nv().k||0)>0&&(wd===5||wd===0)?(wd===5?T('Пятница — половина двора на дачах. Места больше, не расслабляйся.','Friday — half the yard is off to the dachas. More room, don’t relax.'):T('Воскресенье — все с дач вернулись. С рассадой. Ставь бережно.','Sunday — everyone’s back from the dachas. With seedlings. Park gently.')):'';
setTimeout(function(){if(G&&G.v3n&&!G.over)ok(function(){say(dl||(m==='eve'?(tl('time.night')||tx('eveIn')):tx('mornIn')),'bench');});},700);});
ok(function(){YG.start();});ok(function(){kick();});
ev('nt',{k:m==='eve'?'eve0':'morn0',n:e.c.length,q:e.q.length,w:e.w,h:e.h});}
function startEve(){if(!nightOpen())return;var n=nv();if(!n.e){n.e=mkNight(sday());n.ed=0;sv();}
if(n.e.s===1){ok(function(){toast(tx('wait'));});return;}begin('eve',n.e);fixDir();}
function startMorn(){var e=pending();if(!e)return;if(!mornReady()){ok(function(){toast(tx('wait'));});return;}
if(!solvable(e))ev('nt',{k:'bad',n:e.c.length});begin('morn',e);nbFetch();}
function solvable(e){var w=e.w,h=e.h,occ=occOf(e),alive=[],i;for(i=0;i<e.c.length;i++)alive.push(i);var guard=0;
while(alive.length&&guard++<200){var rm=-1;for(i=alive.length-1;i>=0;i--){var j=alive[i],c=e.c[j],D0=DIRS_[c[2]],X=c[0]+D0[0],Y=c[1]+D0[1],free=true;
for(;X>=0&&Y>=0&&X<w&&Y<h;X+=D0[0],Y+=D0[1]){var o=occ[Y*w+X];if(o!==-1&&o!==j){free=false;break;}}if(free){rm=i;break;}}
if(rm<0)return false;var jj=alive[rm];alive.splice(rm,1);for(i=0;i<occ.length;i++)if(occ[i]===jj)occ[i]=-1;}
return!alive.length;}
function b36(n){return(n>>>0).toString(36).slice(-1);}
function layEnc(e){if(!e||!e.c||!e.c.length)return'';var o=[],c=[],i;for(i=0;i<e.ob.length;i++)o.push(b36(e.ob[i][0])+b36(e.ob[i][1])+b36(e.ob[i][2]||0));
for(i=0;i<e.c.length;i++){var q=e.q[i],p=e.c[i];c.push(b36(q[0])+b36((q[1]||0)%36)+b36(p[0])+b36(p[1])+b36(p[2]));}
var l=b36(e.w)+b36(e.h)+';'+o.join(',')+';'+c.join(',');return l.length<=400?l:'';}
function layDec(l){if(typeof l!=='string'||l.length>400||!/^[0-9a-z]{2};[0-9a-z,]*;[0-9a-z,]+$/.test(l))return null;var a=l.split(';'),P=function(ch){return parseInt(ch,36);};
var e={d:sday(),w:P(a[0][0]),h:P(a[0][1]),ob:[],q:[],c:[],s:1,st:3},i,t;
if(a[1])for(t=a[1].split(','),i=0;i<t.length;i++){if(t[i].length!==3)return null;e.ob.push([P(t[i][0]),P(t[i][1]),P(t[i][2])%3]);}
for(t=a[2].split(','),i=0;i<t.length;i++){if(t[i].length!==5)return null;e.q.push([P(t[i][0]),P(t[i][1])]);e.c.push([P(t[i][2]),P(t[i][3]),P(t[i][4])]);}
if(e.c.length<3||!fixE(e))return null;e.s=1;e.st=3;
var occ=[],k;for(i=0;i<e.w*e.h;i++)occ.push(-1);for(i=0;i<e.ob.length;i++){k=e.ob[i][1]*e.w+e.ob[i][0];if(occ[k]!==-1)return null;occ[k]=-2;}
for(i=0;i<e.c.length;i++){var cc=cellsOf(e.c[i][0],e.c[i][1],e.c[i][2],e.q[i][0]);for(var j=0;j<cc.length;j++){var X=cc[j][0],Y=cc[j][1];if(X<0||Y<0||X>=e.w||Y>=e.h||occ[Y*e.w+X]!==-1)return null;occ[Y*e.w+X]=i;}}
return solvable(e)?e:null;}
var NB=null,NBc=-1,NBask=0;
function qs(){return on('nb')&&W.V3QS&&typeof V3QS.call==='function'&&!W.__demo?V3QS:null;}
function nbPush(e){var Q=qs(),l=layEnc(e);if(!Q||!l||e.c.length<4)return;ok(function(){Q.push('nt',{l:l,c:Math.min(399,Math.floor(done()/10))});ev('nt',{k:'nbput',n:e.c.length});});}
function nbDue(){return!!NB&&nv().nb!==today();}
function nbFetch(){var Q=qs();if(!Q||NB||nv().nb===today()||Date.now()-NBask<10*60e3)return;NBask=Date.now();
ok(function(){Q.call([['night',{}]],function(r){var x=r&&r.r&&r.r.night;if(!x||!x.l)return;var e=layDec(x.l);if(e){NB=e;NBc=+x.c;ev('nt',{k:'nbget',n:e.c.length});}});});}
function startNb(){if(!nbDue())return;var e=NB;begin('morn',e);NG.nb=1;var gl=$('gLevel');if(gl)gl.textContent=T('🏘 Двор соседа','🏘 Neighbour’s yard');
var gc=$('gCity');if(gc)gc.textContent=T('Сосед ставил вечером — выпусти','A neighbour parked it last night — clear it');ev('nt',{k:'nb0',n:e.c.length});}
function nbWin(){var g=G,n=nv();g.over=true;ok(function(){YG.stop();});ok(function(){SND.win();});n.nb=today();NB=null;sv();
var st=Math.max(1,Math.min(3,g.hearts));ev('nt',{k:'nbwin',st:st,mv:g.moves,n:NG.e.c.length});
modal('<h2>'+T('Двор соседа свободен! 🏘','Neighbour’s yard is clear! 🏘')+'</h2><div class="big-stars pop">'+ok(function(){return starsHtml(st);},'★')+'</div>'+
shura(T('Это сосед с того конца города вчера ставил. Ты бы аккуратнее поставил, правда?','A neighbour across town parked that last night. You’d have done it neater, right?'),'happy')+
'<div class="row"><button class="btn green" id="v3nH">'+T('🏠 Во двор','🏠 To my yard')+'</button><div class="row2"><button class="btn sec" id="v3nN">'+T('Следующий двор →','Next yard →')+'</button></div></div>');
$('v3nH').onclick=function(){hideModal();leave();};$('v3nN').onclick=function(){hideModal();leave(true);};}
function cur(){return NG&&NG.e?NG.e.c.length:0;}
function curL(){var e=NG.e;return e.q[cur()]?e.q[cur()][0]:2;}
function fixDir(){if(!NG||NG.m!=='eve')return;var e=NG.e;if(cur()>=e.q.length)return;var occ=G.occ,L=curL();
if(!allFits(occ,e.w,e.h,L,NG.d).length){var a=allFits(occ,e.w,e.h,L);if(a.length)NG.d=a[0][2];}panelUpd();}
function eveTap(px,py){var e=NG.e,g=G;if(!g||g.over||cur()>=e.q.length)return;ok(function(){ac();});
var fx=(px-ox)/cs,fy=(py-oy)/cs,cx=Math.floor(fx),cy=Math.floor(fy),L=curL(),best=null,bd=1e9,auto=false;
if(cx<-1||cy<-1||cx>e.w||cy>e.h)return;
for(var pass=0;pass<2&&!best;pass++)for(var d=0;d<4;d++){if(pass===0&&d!==NG.d||pass===1&&d===NG.d)continue;
for(var k=0;k<L;k++){var D0=DIRS_[d],hx=cx+D0[0]*k,hy=cy+D0[1]*k,c=fits(g.occ,e.w,e.h,hx,hy,d,L);if(!c)continue;
var mx=0,my=0;c.forEach(function(a){mx+=a[0]+.5;my+=a[1]+.5;});mx/=L;my/=L;var dd=Math.hypot(mx-fx,my-fy)+(pass?.5:0);
if(dd<bd&&dd<L*.75+.6){bd=dd;best=[hx,hy,d];auto=pass===1;}}}
if(!best){ok(function(){SND.horn();});ok(function(){scare(px,py,cs,true);});
if(!g.v3n.miss){g.v3n.miss=1;ok(function(){toast(T('Так не встанет: перед носом нужен проезд до края двора','It won’t fit there: it needs a clear way out in front'));});}return;}
if(auto){NG.d=best[2];}
e.c.push(best);var i=e.c.length-1,v=mkVeh(e,i,e.w,e.h);v.ap=0;v.apT=0;v.apD=0;g.vs.push(v);v.cells.forEach(function(a){g.occ[a[1]*e.w+a[0]]=i;});g.moves++;
ok(function(){SND.tap();});ok(function(){buzz(8);});sv();
if(cur()>=e.q.length){setTimeout(function(){if(G===g)eveEnd(true);},650);panelUpd();return;}
fixDir();if(!allFits(g.occ,e.w,e.h,curL()).length)setTimeout(function(){if(G===g&&!g.over)stuck();},500);}
function undo(){var e=NG&&NG.e,g=G;if(!e||!g||g.over||NG.m!=='eve'||!e.c.length)return;var i=e.c.length-1;e.c.pop();
g.vs=g.vs.filter(function(v){return v.id!==i;});for(var k=0;k<g.occ.length;k++)if(g.occ[k]===i)g.occ[k]=-1;sv();fixDir();ok(function(){SND.tap();});}
function rot(){if(!NG||NG.m!=='eve')return;var e=NG.e,L=curL();for(var t=1;t<=4;t++){var d=(NG.d+t)%4;if(allFits(G.occ,e.w,e.h,L,d).length||t===4){NG.d=d;break;}}panelUpd();ok(function(){SND.tap();});}
function stuck(){var g=G,e=NG.e;ev('nt',{k:'stuck',n:e.c.length,q:e.q.length});
modal('<h2>'+T('Некуда поставить 😬','Nowhere to park 😬')+'</h2>'+shura(tx('stuck'),'sad')+
'<p>'+T('Поставлено ','Parked ')+e.c.length+T(' из ',' of ')+e.q.length+'. '+T('Переставь последних — или оставь так: остальные встанут на улице (меньше ★).','Move the last ones — or leave it: the rest will park on the street (fewer ★).')+'</p>'+
'<div class="row"><button class="btn green" id="v3nU">'+T('↶ Переставить','↶ Move cars')+'</button><div class="row2"><button class="btn sec" id="v3nK">'+T('Оставить так','Leave it')+'</button></div></div>');
$('v3nU').onclick=function(){hideModal();if(G===g){undo();}};$('v3nK').onclick=function(){hideModal();if(G===g)eveEnd(false);};}
function eveEnd(full){var g=G,e=NG.e,n=nv();if(!g)return;g.over=true;ok(function(){YG.stop();});e.s=1;e.st=stars(e);e.d=sday();n.ed=e.d;sv();nbPush(e);
ev('nt',{k:'eve',n:e.c.length,q:e.q.length,st:e.st,d1:ok(function(){return V3.day();},0)});
if(full)ok(function(){SND.win();});var tol=tolikLine(true),nt=ntfBtn();
modal('<h2>'+T('Все соседи на ночь! 🌙','Everyone parked for the night! 🌙')+'</h2><div class="big-stars">'+ok(function(){return starsHtml(e.st);},'★')+'</div>'+
shura(tx('eveDone')+' '+critique(e),'norm')+(earlyIdx(e)>=0?'<p class="goal">⏰ '+(earlyOk(e)?T('Валерке на смену первым — проезд свободен. Молодец.','Valerka’s first out for his shift — his way is clear. Well done.'):T('Валерке на смену первым, а ты его заставил. Минус звезда.','Valerka has to leave first, and you’ve blocked him in. Minus a star.'))+'</p>':'')+
'<p class="goal">🌅 '+T('Утром — «Утренний разъезд»: твой двор, ','In the morning — the “Morning rush”: your yard, ')+e.c.length+' '+ok(function(){return pl(e.c.length,'сосед','соседа','соседей','neighbour','neighbours');},'')+T(', Москвич деда опять не заводится.',' and grandad’s Moskvich won’t start again.')+'</p>'+
(tol?'<p class="goal">🔧 '+esc(tol)+'</p>':'')+nt+
'<div class="row"><button class="btn green" id="v3nH">'+T('🏠 Во двор','🏠 To my yard')+'</button>'+(done()<220?'<div class="row2"><button class="btn sec" id="v3nN">'+T('Следующий двор →','Next yard →')+'</button></div>':'')+'</div>');
$('v3nH').onclick=function(){hideModal();leave();};var b=$('v3nN');if(b)b.onclick=function(){hideModal();leave(true);};ntfWire();}
function critique(e){var w=worst(e);if(w.n>=3)return fill(T('Вот эта всех заперла: {n} соседей из-за неё утром ждать будут.','That one has boxed everyone in: {n} neighbours will be waiting for it in the morning.'),{n:w.n});
return T('Аккуратно поставил — утром как по маслу.','Neatly parked — the morning will go like clockwork.');}
function leave(next){var g=G;if(g)g.over=true;clsOff();NG=null;if(next){ok(function(){startLevel(Math.max(0,(S.unlocked||1)-1));});return;}if(!(W.UI&&UI.go('home')))ok(function(){openMap();});}
function clsOff(){var sg=$('scr-game');if(sg){sg.classList.remove('v3ne');sg.classList.remove('v3nm');}var t=$('gTow');if(t)t.style.display='';}
function mornWin(){if(NG.nb)return nbWin();var g=G,e=NG.e,n=nv();g.over=true;ok(function(){YG.stop();});ok(function(){SND.win();});
var st=Math.max(1,Math.min(e.st||3,Math.max(1,g.hearts))),reward=4+2*st;ok(function(){S.coins+=reward;ern('lvl',reward);});
n.k=(+n.k||0)+1;n.md=sday();n.e=null;sv();ok(function(){updCoins();});
ev('nt',{k:'morn',st:st,es:e.st,mv:g.moves,cr:g.crashes,n:e.c.length,dk:n.k});
var mk=moskDue();
modal('<h2>'+T('Все на работе! 🌅','Everyone’s off to work! 🌅')+'</h2><div class="big-stars pop">'+ok(function(){return starsHtml(st);},'★')+'</div>'+
'<p data-fit="1">'+T('Вечером поставил — утром выехал: ','Parked at night, cleared by morning: ')+g.moves+' '+ok(function(){return pl(g.moves,'ход','хода','ходов','move','moves');},'')+'</p>'+
'<div class="rew"><p class="coins-won" id="mWon">+'+reward+' 💰</p></div>'+shura(tx('mornWin'),'happy')+
(nbDue()?'<p class="goal">🏘 '+T('Сосед тоже ставил на ночь — разъедешь? Без монет, для интереса.','A neighbour parked overnight too — clear it? No coins, just for fun.')+'</p><div class="row2"><button class="btn sec sm noenter" id="v3nNb">🏘 '+T('Двор соседа','Neighbour’s yard')+'</button></div>':'')+
(mk?'<p class="goal">🚗 '+T('Дед ждёт у подъезда: «Москвич» опять не заводится.','Grandad’s waiting by the door: the Moskvich won’t start again.')+'</p>':'')+
'<div class="row"><button class="btn green" id="v3nH">'+(mk?T('🚗 Завести «Москвич»','🚗 Start the Moskvich'):T('🏠 Во двор','🏠 To my yard'))+'</button><div class="row2"><button class="btn sec" id="v3nN">'+T('Следующий двор →','Next yard →')+'</button></div></div>');
ok(function(){coinFx(reward,$('mWon'));});
$('v3nH').onclick=function(){hideModal();leave();if(mk)setTimeout(openMosk,350);};var nbB=$('v3nNb');if(nbB)nbB.onclick=function(){hideModal();startNb();};$('v3nN').onclick=function(){hideModal();leave(true);};}
function mornLose(){var g=G,e=NG.e;ok(function(){YG.stop();});ev('nt',{k:'mlose',mv:g.moves,n:e.c.length});
modal('<h2>'+T('Машины помяты 💥','Cars dented 💥')+'</h2>'+shura(tx('mornLose'),'sad')+
'<div class="row"><button class="btn green" id="v3nR">'+T('↻ Заново','↻ Try again')+'</button><div class="row2"><button class="btn sec" id="v3nH">'+T('🏠 Во двор','🏠 To my yard')+'</button></div></div>');
$('v3nR').onclick=function(){var nb=NG&&NG.nb;hideModal();begin('morn',e);if(nb){NG.nb=1;var gl=$('gLevel');if(gl)gl.textContent=T('🏘 Двор соседа','🏘 Neighbour’s yard');}};$('v3nH').onclick=function(){hideModal();leave();};}
function panel(){var f=D.querySelector('#scr-game .gf');if(!f||$('v3nP'))return panelUpd();var d=D.createElement('div');d.id='v3nP';d.className='v3nP';
d.innerHTML='<div class="v3nQ" aria-hidden="true"><canvas id="v3nC"></canvas><span id="v3nN"></span></div>'+
'<button class="btn bst noenter" id="v3nRot"><b>'+T('↻ Повернуть','↻ Turn')+'</b><small id="v3nDir"></small></button>'+
'<button class="btn sq noenter" id="v3nUndo" aria-label="'+T('Переставить','Undo')+'">↶<small>'+T('Назад','Undo')+'</small></button>';
f.appendChild(d);$('v3nRot').onclick=rot;$('v3nUndo').onclick=undo;panelUpd();}
function panelUpd(){var e=NG&&NG.e,c=$('v3nC'),n=$('v3nN'),dr=$('v3nDir'),u=$('v3nUndo');if(!e||!c)return;var i=cur();
if(n)n.textContent=(e.q[i]&&e.q[i][3]?'⏰ ':'')+Math.min(i+1,e.q.length)+'/'+e.q.length;
if(e.q[i]&&e.q[i][3]&&NG.tip!==i){NG.tip=i;ok(function(){toast(T('⏰ Валерке на смену в 6:00 — поставь так, чтобы утром уехал первым','⏰ Valerka starts his shift at 6:00 — park him so he can leave first'),3200);});}if(dr)dr.textContent=T('носом ','nose ')+ARR[NG.d];if(u)u.disabled=!e.c.length;
var r=c.getBoundingClientRect(),dp=Math.min(2,W.devicePixelRatio||1),cw=r.width||120,ch=r.height||48;c.width=cw*dp;c.height=ch*dp;var x=c.getContext('2d');x.setTransform(dp,0,0,dp,0,0);x.clearRect(0,0,cw,ch);
var cs0=Math.min(ch*.62,cw/7.2),X=6;for(var k=0;k<3;k++){var j=i+k;if(j>=e.q.length)break;var L=e.q[j][0],s=k?cs0*.62:cs0,cells=[];for(var a=L-1;a>=0;a--)cells.push([a,0]);
var v=ok(function(){var vv=makeVehicle(cells,1,color(e,j),L,1,'');if(e.q[j][2])vv.vy=e.q[j][2];return vv;},null);if(!v)break;x.globalAlpha=k?.55:1;
var oy0=(ch-s)/2,ox0=X;ok(function(){drawVehicle(x,v,0,function(pt){return[ox0+(pt[0]+.5)*s,oy0+(pt[1]+.5)*s];},s,{noArrow:true});});X+=L*s+8;}x.globalAlpha=1;}
function drawEve(){var g=G,e=NG&&NG.e;if(!g||!e||g.over||NG.m!=='eve'||cur()>=e.q.length)return;var L=curL(),P=allFits(g.occ,e.w,e.h,L,NG.d),t=performance.now()/1000;
ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.translate(cam.x,cam.y);ctx.scale(cam.z,cam.z);var seen={};
for(var i=0;i<P.length;i++){var c=cellsOf(P[i][0],P[i][1],P[i][2],L);for(var k=0;k<c.length;k++){var key=c[k][0]+'_'+c[k][1];if(seen[key])continue;seen[key]=1;
var px=ox+(c[k][0]+.5)*cs,py=oy+(c[k][1]+.5)*cs;ctx.fillStyle='rgba(255,236,120,'+(.28+.12*Math.sin(t*3+k))+')';ctx.beginPath();ctx.arc(px,py,cs*.14,0,7);ctx.fill();}}
var D0=DIRS_[NG.d],ax=ox+e.w*cs-cs*.4,ay=oy-cs*.35;ctx.translate(ax,ay);ctx.rotate(Math.atan2(D0[1],D0[0]));ctx.fillStyle='#ffd628';ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(cs*.32,0);ctx.lineTo(-cs*.12,-cs*.24);ctx.lineTo(-cs*.12,cs*.24);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
var tap0=W.tapAt,win0=W.win,lose0=W.lose,ren0=W.render,lay0=W.layout;
if(typeof tap0==='function')tapAt=function(px,py){var g=Gv();if(g&&g.v3n&&NG&&NG.g===g&&NG.m==='eve')return eveTap(px,py);
var before=g?sqState(g):null,r=tap0.apply(this,arguments);if(g&&before)sqAfter(g,before);return r;};
if(typeof win0==='function')win=function(){var g=Gv();if(g&&g.v3n&&NG&&NG.g===g){if(NG.m==='morn')return mornWin();g.winT=-1e9;return;}omenCheck(g);return win0.apply(this,arguments);};
if(typeof lose0==='function')lose=function(){var g=Gv();if(g&&g.v3n&&NG&&NG.g===g)return mornLose();return lose0.apply(this,arguments);};
if(typeof ren0==='function')render=function(){var r=ren0.apply(this,arguments);var g=Gv();if(g&&g.v3n&&NG&&NG.g===g){ok(drawTags);if(NG.m==='eve')ok(drawEve);}return r;};
function drawTags(){var g=G,e=NG.e;ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.translate(cam.x,cam.y);ctx.scale(cam.z,cam.z);
for(var i=0;i<g.vs.length;i++){var v=g.vs[i],q=e.q[v.id];if(!q||!(q[3]||q[4])||v.state==='gone')continue;var a=toPx(trackPt(v.track,v.s+(v.L-1)/2));
if(q[4]){ctx.fillStyle='#8a5a2b';ctx.fillRect(a[0]-cs*.2,a[1]-cs*.13,cs*.4,cs*.26);ctx.fillStyle='#4fc24a';for(var k=0;k<3;k++){ctx.beginPath();ctx.arc(a[0]-cs*.12+k*cs*.12,a[1]-cs*.12,cs*.07,0,7);ctx.fill();}}
if(q[3]){var r=Math.max(7,cs*.2);ctx.fillStyle='#ffd628';ctx.strokeStyle='#17324a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(a[0],a[1]-cs*.42,r,0,7);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(a[0],a[1]-cs*.42);ctx.lineTo(a[0],a[1]-cs*.42-r*.6);ctx.moveTo(a[0],a[1]-cs*.42);ctx.lineTo(a[0]+r*.45,a[1]-cs*.42);ctx.stroke();}}
ctx.restore();}
var hint0=W.hint;if(typeof hint0==='function')hint=function(){var g=Gv();if(g&&g.v3n&&NG&&NG.g===g&&NG.m==='eve')return;return hint0.apply(this,arguments);};
if(typeof lay0==='function')layout=function(){var r=lay0.apply(this,arguments);if(NG&&NG.m==='eve')setTimeout(panelUpd,0);return r;};
(function(){var b=$('gRestart'),k=$('gBack');if(b&&b.onclick){var o=b.onclick;b.onclick=function(ev2){var g=Gv();if(g&&g.v3n&&NG&&NG.g===g){if(NG.m==='morn')begin('morn',NG.e);return;}return o.call(this,ev2);};}
if(k&&k.onclick){var o2=k.onclick;k.onclick=function(ev2){var g=Gv();if(g&&g.v3n){g.over=true;clsOff();NG=null;}return o2.call(this,ev2);};}})();
V3.sub('screen',function(n){if(n!=='game'&&NG){clsOff();}},'night');
function giftDue(){return ok(function(){var st=streakState();return!st.claimed&&(S.levelsDone||0)>=1;},false);}
function dailyDue(){return ok(function(){return!dailyLocked()&&!(S.daily||{})[todayKey()];},false);}
function doorDue(){var n=nv();return on('door')&&ok(function(){return V3.day();},1)>=2&&(+ok(function(){return S.levelsDone;},0)||0)>=1&&n.dr!==today()&&!W.__demo;}
function yday(){var n=nv(),t=today();if(n.yd[0]!==t){if(n.yd[0])n.yy=n.yd[1];n.yd=[t,0];}return n;}
V3.sub('yard',function(i){if(i&&i.ok){var n=yday();n.yd[1]++;}},'night');
function serialEp(adv){if(!on('serial'))return null;var n=nv(),se=n.se,t=today();
if(adv&&se.d!==t){se.e=(se.e||0)+1;se.d=t;var mx=serialLen(se.i);if(se.e>mx){se.i=(se.i||0)+1;se.e=1;}sv();}
return serialGet(se.i,se.e);}
var SER0=[{id:'v3n',t:['Кузьмич продаёт «Москвич»','Kuzmich is selling his Moskvich'],ep:[
['Кузьмич повесил на «Москвич» табличку «Продаётся». Мой сразу пошёл смотреть. Боюсь, вернётся с «Москвичом».','Kuzmich hung a “For sale” sign on his Moskvich. My old man went to look straight away. I’m afraid he’ll come back with it.'],
['Мой осматривал «Москвич» два часа. Сказал: «Хорошая машина, но мой лучше». Завтра пойдёт сравнивать снова.','My old man inspected the Moskvich for two hours. Said: “Good car, but mine’s better.” Tomorrow he’ll go and compare again.'],
['Пришёл покупатель. Спросил: «А он ездит?» Кузьмич задумался. Думает до сих пор.','A buyer came. Asked: “Does it run?” Kuzmich is still thinking about it.']]}];
function serialLen(i){var a=ok(function(){return W.V3T&&V3T.on()?V3T.all('serial'):[];},[]);if(a.length)return(a[i%a.length].ep||[]).length||1;return SER0[0].ep.length;}
function serialGet(i,e){if(!(e>0))return null;var a=ok(function(){return W.V3T&&V3T.on()?V3T.all('serial'):[];},[]);
if(a.length&&!en()){var s=a[i%a.length],x=ok(function(){return V3T.serialEp(s.id,e);},null);if(x&&x.ep)return{t:x.t,ep:x.ep,n:e,id:s.id};}
var s0=SER0[0],k=Math.min(e,s0.ep.length)-1;return{t:en()?s0.t[1]:s0.t[0],ep:en()?s0.ep[k][1]:s0.ep[k][0],n:e,id:s0.id};}
function doorRows(){var r=[];
if(on('yard')&&mornReady())r.push(['morn','🌅',T('Утренний разъезд','Morning rush'),pending().c.length+' '+ok(function(){return pl(pending().c.length,'сосед ждёт','соседа ждут','соседей ждут','neighbour waiting','neighbours waiting');},'')]);
if(giftDue())r.push(['gift','🎁',T('Гостинец дня','Today’s gift'),T('лежит в фартуке','in my apron')]);
if(moskDue())r.push(['mosk','🚗',T('Заведи «Москвич» деда','Start grandad’s Moskvich'),T('опять не заводится','won’t start again')]);
var tl0=tolikLine();if(tl0)r.push(['tolik','🔧',T('Гаражи Толика','Tolik’s garages'),tl0]);
if(dailyDue())r.push(['daily','📅',T('Задание дня','Daily challenge'),dayKindName()]);
return r;}
function doorLines(){var n=yday(),ctx={night:mornReady()?1:0,n:n.yy||0,m:Math.round((n.yy||0)*1.8)+1,today:giftDue()?'gift':dailyDue()?'daily':''},a=[];
var v=ok(function(){return W.V3T&&V3T.on()&&V3T.intercomCall?V3T.intercomCall(ctx):null;},null);
if(v&&v.length){for(var i=0;i<v.length&&i<3;i++)if(v[i]&&v[i].t)a.push(ok(function(){return V3T.fill(v[i].t,ctx);},v[i].t));}
if(!a.length){a.push(tx('doorHi',0));if(ctx.night)a.push(tx('doorNight'));if(ctx.n>0)a.push(fill(tx('doorRumor',0),ctx));}
var fc=ok(function(){if(en()||!W.V3T||!V3T.on()||!V3T.forecast)return'';var ks=Object.keys(V3T.forecast),k=ks[hsh('fc'+today())%ks.length],x=V3T.forecast[k];return x&&x.length?x[hsh('fx'+today())%x.length]:'';},'');
var cy=ok(function(){return W.V3QX&&V3QX.country?V3QX.country():'';},'');if(cy)a.push(cy);
if(fc)a.push('🔭 '+T('Прогноз: ','Forecast: ')+fc);if(glasses())a.push(T('Я сегодня очки забыла. Если «Волгу» «Копейкой» назову — не обижайтесь.','I forgot my glasses today. If I call a Volga a Kopeyka — don’t take offence.'));
return a;}
function glasses(){var d=new Date(now());return on('door')&&d.getDate()===1+hsh('gl'+d.getFullYear()+'-'+d.getMonth())%28;}
function showDoor(how){var n=nv(),rows=doorRows(),lines=doorLines(),se=serialEp(true),t=today(),first=n.dr!==t;n.dr=t;sv();
ev('door',{a:'show',r:rows.length,s:se?se.n:0,h:how||'auto'});
var h='<h2>'+T('🔔 Домофон','🔔 Intercom')+'</h2>'+shura(lines.map(esc).join('<br>'),'happy');
if(se)h+='<div class="v3nSer"><b>📺 «'+esc(se.t)+'», '+T('серия ','episode ')+se.n+'</b><p>'+esc(se.ep)+'</p>'+ok(function(){return W.V3T&&V3T.jk?V3T.jk(se.id+'-'+se.n,'serial'):'';},'')+'</div>';
if(rows.length){h+='<div class="v3nRows">';rows.forEach(function(x){h+='<button class="v3nRow noenter" data-k="'+x[0]+'"><span class="ic">'+x[1]+'</span><span><b>'+esc(x[2])+'</b><small>'+esc(x[3])+'</small></span><span class="go">›</span></button>';});h+='</div>';}
else h+='<p class="goal">'+T('Дел на сегодня нет — просто дворы. Это тоже хорошо.','Nothing special today — just yards. That’s fine too.')+'</p>';
h+='<div class="row"><button class="btn green" id="v3nDok">'+T('Спасибо, Шура!','Thanks, Shura!')+'</button></div>';
modal(h);
[].forEach.call(D.querySelectorAll('#mcard .v3nRow'),function(b){b.onclick=function(){var k=b.getAttribute('data-k');n.dp=0;sv();ev('door',{a:'go',k:k});hideModal();doorGo(k);};});
$('v3nDok').onclick=function(){if(first)n.dp=(+n.dp||0)+1;sv();ev('door',{a:'close',r:rows.length});hideModal();};}
function doorGo(k){if(k==='morn')startMorn();else if(k==='gift')ok(function(){showStreak();});else if(k==='mosk')openMosk();
else if(k==='tolik')ok(function(){UI.go(UI.has&&UI.has('my')?'my':'garage');});else if(k==='daily')ok(function(){UI.go('daily');});}
function tryDoor(){if(doorDue()&&W.V3T&&V3T.ready&&V3T.isReady&&!V3T.isReady()&&!tryDoor.w){tryDoor.w=1;V3T.ready(function(){setTimeout(tryDoor,200);});setTimeout(tryDoor,5000);return false;}
if(!doorDue()||Gv()||ok(function(){return modalOn;},true)||$('ad')&&$('ad').classList.contains('on'))return false;if(ok(function(){return UI.cur;},'')!=='home')return false;
var n=nv();if((+n.dp||0)>=3){n.dr=today();sv();ok(function(){if(W.V3SKIN&&V3SKIN.say)V3SKIN.say(doorLines()[0],'shura');});ev('door',{a:'line'});return true;}
showDoor('auto');return true;}
var ms0=W.maybeStreak;if(typeof ms0==='function')maybeStreak=function(){if(on('door')&&(doorDue()||nv().dr===today())){if(doorDue())setTimeout(tryDoor,300);return;}return ms0.apply(this,arguments);};
V3.sub('home',function(){setTimeout(tryDoor,900);},'night.door');
function moskDue(){var n=nv();return on('mosk')&&isMorn()&&n.ms!==today()&&done()>=8&&!W.__demo;}
function openMosk(){var n=nv(),need=2+hsh('mk'+today())%2,tap=0;
if(!moskDue()){ok(function(){if(W.V3SKIN&&V3SKIN.say)V3SKIN.say(tx('moskNo'),'ded');else toast(tx('moskNo'));});return;}
var car=ok(function(){return W.VYCARS?VYCARS.svg('moskvich',{view:'side',w:260,h:113}):'';},'');
modal('<h2>🚗 '+T('Заведи «Москвич»','Start the Moskvich')+'</h2><div class="v3nMk" id="v3nMk">'+car+'</div><p class="goal" id="v3nMt">'+T('Дед держит дверцу. Крути ключ!','Grandad’s holding the door. Turn the key!')+'</p>'+
'<div class="row"><button class="btn green noenter" id="v3nKey">🔑 '+T('Завести','Start it')+'</button><div class="row2"><button class="btn sec" id="v3nMx">'+T('Потом','Later')+'</button></div></div>');
$('v3nMx').onclick=function(){hideModal();};
$('v3nKey').onclick=function(){tap++;var mk=$('v3nMk'),mt=$('v3nMt');if(mk){mk.classList.remove('shk');void mk.offsetWidth;mk.classList.add('shk');}
if(tap<need){ok(function(){tone('sawtooth',90,60,.18,.05);});if(mt)mt.textContent=tx('moskFail',tap);return;}
n.ms=today();n.mn=(+n.mn||0)+1;sv();ok(function(){SND.go();});ok(function(){buzz(20);});ev('nt',{k:'mosk',t:tap,n:n.mn});
if(mk)mk.classList.add('go');if(mt)mt.innerHTML='<b>'+T('Врррум!','Vroom!')+'</b> '+esc(tl('car.moskvich')||tx('moskOk'));
var b=$('v3nKey');if(b){b.textContent=T('Спасибо, дед!','Thanks, grandad!');b.onclick=function(){hideModal();ok(function(){UI.refresh();});};}};}
function tolikLine(eve){if(!on('tolik'))return'';return ok(function(){if(!W.TOLIK||!TOLIK.jobs)return'';if(TOLIK.ready&&TOLIK.ready()>0)return tx('tolik',0);
if(eve){var js=TOLIK.jobs(),t=new Date(now());t.setDate(t.getDate()+1);t.setHours(8,0,0,0);for(var i=0;i<js.length;i++)if(js[i]&&js[i].e<=t.getTime())return tx('tolikEve',0);}return'';},'');}
var DAYK=['column','pocket','chars','tight','story','night','shop'],DAYFB={chars:'shop',tight:'column',story:''};
var KN={pocket:['🧺 Карман у арки','🧺 Arch pocket'],shop:['🛒 Стоянка у магазина','🛒 Shop parking'],column:['🚗 Колонна','🚗 Convoy'],n:['🚨 Происшествие','🚨 Incident'],night:['🌙 Ночной двор','🌙 Night yard'],
chars:['🚕 Машины с характером','🚕 Cars with character'],tight:['🔒 Тесный двор','🔒 Tight yard'],story:['🚨 Происшествие','🚨 Incident']};
function hOk(k){return ok(function(){return!!(W.V3H&&V3.is(k));},false);}
function dayKind(){if(!on('board'))return'';if(done()<14)return'';
var k=DAYK[wday()];if(DAYFB[k]!=null&&!hOk(k))k=DAYFB[k];return k;}
function dayKindName(){var g=Gv(),k=g&&g.daily&&g.v3dk!=null?g.v3dk:dayKind();return k&&KN[k]?T(KN[k][0],KN[k][1]):T('двор дня','yard of the day');}
function dayJ(k){var b=Math.max(13,done());for(var i=b;i<b+60;i++)if(V3K.kindOf(i)===k&&(k!=='tight'||i>=19))return i;return-1;}
if(W.V3K&&typeof V3K.begin==='function'&&V3K.kindOf){var kb0=V3K.begin;V3K.begin=function(g,lv,idx,seed,daily,o){var k=daily&&!o?dayKind():'';
if(k==='pocket'||k==='shop'||k==='column'||DAYFB[k]!=null){var j=dayJ(k),r;
if(j>=0){r=kb0.call(this,g,lv,j,seed,false,undefined);
if(DAYFB[k]!=null&&!g.v3h){k=DAYFB[k];j=k?dayJ(k):-1;r=kb0.call(this,g,lv,j>=0?j:idx,seed,!(j>=0),o);}
g.v3dk=k;if(g.v3k){g.v3k.day=1;ev('nt',{k:'dayk',v:k});}return r;}}
return kb0.apply(this,arguments);};}
V3.sub('yard-start',function(o){var g=Gv();if(!g)return;g.v3q=[];g.v3o={f:0,l:0};
if(o&&o.daily&&dayKind()==='night'){g.tod='night';ok(function(){var sg=$('scr-game'),tb=lookBg('night');sg.style.background=tb;D.body.style.background=tb;sg.classList.add('dark');});}
if(on('tolik'))ok(function(){tolikCars(g,o);});
if(on('brand')&&brandId())g.vs.forEach(brandVeh);
omenToast(g);},'night');
function sqState(g){var a=0,b=0;for(var i=0;i<g.vs.length;i++){var s=g.vs[i].state;if(s==='exit'||s==='gone')a++;else if(s==='bump')b++;}return[a,b,g.moves];}
function sqAfter(g,b){if(g.moves===b[2])return;var s=sqState(g);if(!g.v3q)g.v3q=[];
if(s[0]>b[0]){g.v3q.push('🚗');if(g.v3o&&!g.v3o.f){var ex=g.vs.filter(function(v){return v.state==='exit';});if(ex.length)g.v3o.f=ex[ex.length-1].L;}
var last=g.vs.filter(function(v){return v.state==='exit'&&v.last;});if(last.length&&g.v3o)g.v3o.l=last[0].L;}
else if(s[1]>b[1])g.v3q.push('💥');}
function sqText(g,st){var q=g.v3q||[],s=q.slice(0,24).join('')+(q.length>24?'…':''),d=new Date(now()),dd=('0'+d.getDate()).slice(-2)+'.'+('0'+(d.getMonth()+1)).slice(-2);
return T('Двор дня ','Yard of the day ')+dd+' · '+dayKindName()+'\n'+s+'\n'+'★★★'.slice(0,st)+'☆☆☆'.slice(0,3-st)+' · '+g.moves+' '+ok(function(){return pl(g.moves,'ход','хода','ходов','move','moves');},'')+'\n'+T('«Выезд со двора» — сможешь лучше?','“Yard Escape” — can you beat it?');}
function link(hash){return ok(function(){if(PLAT==='vk'&&!OK){var id=qv('vk_app_id');return id?'https://vk.com/app'+id+'#'+hash:'';}if(OK)return OK_LINK?OK_LINK+'#'+hash:'';return'';},'');}
function share(text){var u=link('y=d'+today()),full=text+(u?'\n'+u:'');ev('nt',{k:'share',p:ok(function(){return OK?'ok':PLAT;},'')});
ok(function(){if(PLAT==='vk'&&!OK&&u&&VK){vkSend('VKWebAppShare',{link:u});return;}
if(VK){vkSend('VKWebAppCopyText',{text:full}).then(function(){toast(T('Итог скопирован — отправь соседям','Copied — send it to your neighbours'));},function(){});return;}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(full).then(function(){toast(T('Итог скопирован — отправь соседям','Copied — send it to your neighbours'));},function(){});}});}
winSlots.push({id:'v3n-sq',order:6,zone:'goal',fit:5,render:function(c){var g=Gv();if(g&&c&&c.daily&&g.v3h&&g.v3h.tight&&(!g.v3q||g.v3q.length<2))g.v3q=['🔒','🚗'];if(!on('board')||!c||!c.daily||!g||!g.v3q||!g.v3q.length)return null;
return'<p class="goal v3nSq">'+esc(g.v3q.slice(0,24).join(''))+'</p><button class="btn sec sm noenter" id="v3nShare">'+T('📤 Поделиться итогом','📤 Share the result')+'</button>';},
mount:function(el,c){var g=Gv(),b=el&&el.querySelector('#v3nShare');if(el&&el.setAttribute)el.setAttribute('data-keep','1');if(b&&g)b.onclick=function(){share(sqText(g,c.stars||1));};}});
function inHash(){var h='';try{h=String(location.hash||'').replace(/^#/,'');}catch(e){}if(!h){var m=qv('hash');if(m)h=m.replace(/^#/,'');}
var y=/(?:^|&)y=([^&]+)/.exec(h);if(!y)return null;var o={y:y[1]},mm=/(?:^|&)m=(\d+)/.exec(h),cc=/(?:^|&)c=(\d+)/.exec(h);if(mm)o.m=+mm[1];if(cc)o.c=+cc[1];return o;}
var HY=inHash(),hyDone=false,hyT=0;
function goHash(){if(!HY||hyDone)return;if(!on('board')){hyDone=true;HY=null;return;}if(Gv()||ok(function(){return modalOn;},true)||ok(function(){return UI.cur;},'')!=='home'){if(hyT++<80)setTimeout(goHash,1500);return;}hyDone=true;
var lvd=+ok(function(){return S.levelsDone;},0)||0;if(lvd<1){ev('nt',{k:'hash',r:'new'});return;}
var tail=HY.m?T(' Сосед прошёл за ',' Your neighbour did it in ')+HY.m+' '+ok(function(){return pl(HY.m,'ход','хода','ходов','move','moves');},'')+(HY.c===0?T(', без аварий.',', no crashes.'):'.'):'';
if(/^d/.test(HY.y)){if(ok(function(){return dailyLocked();},true)){ok(function(){toast(T('Двор дня откроется после 7-го двора.','The yard of the day opens after yard 7.'));});return;}
ev('nt',{k:'hash',r:'d'});ok(function(){startLevel(0,true);});if(tail)setTimeout(function(){ok(function(){toast(T('Двор дня от соседа!','Your neighbour’s yard of the day!')+tail,3500);});},900);return;}
var n=parseInt(HY.y,10);if(!(n>=1&&n<=5000))return;if(n-1<(+S.unlocked||1)){ev('nt',{k:'hash',r:'y'});ok(function(){startLevel(n-1);});
setTimeout(function(){ok(function(){toast(T('Двор ','Yard ')+n+T(' — сосед позвал.',' — your neighbour invited you.')+tail,3500);});},900);}
else ok(function(){toast(T('Сосед зовёт во двор ','Your neighbour invites you to yard ')+n+T(' — дойди до него!',' — get there first!'),3500);});}
if(HY){V3.sub('home',function(){hyT=0;setTimeout(goHash,1600);},'night.board');setTimeout(goHash,1600);}
var OMENS=[['clean','Без аварий — к гостям','No crashes — guests are coming'],['long','Первой уедет большая — к деньгам','A big one leaves first — money’s coming'],
['short','Последней уедет легковая — к дороге','A car leaves last — a trip’s coming'],['combo','Три подряд без остановки — к удаче','Three in a row — good luck'],
['exact','Ни одного лишнего касания — к порядку','Not one wasted tap — order in the house']];
var OMEN_C=5;
function omen(){if(!on('omen')||done()<5)return null;return OMENS[hsh('om'+today())%OMENS.length];}
function omenToast(g){var o=omen(),n=nv();if(!o||n.om===today()||!g||g.v3n)return;if(g.v3omT===today())return;g.v3omT=today();
if(!omenToast.d||omenToast.d!==today()){omenToast.d=today();setTimeout(function(){if(G===g&&!g.over)ok(function(){toast('🔮 '+T('Примета дня: ','Today’s omen: ')+(en()?o[2]:o[1]),3200);});},2200);}}
function omenCheck(g){var o=omen(),n=nv();if(!o||!g||n.om===today()||g.v3n)return;var hit=false,cnt=g.vs.length;
if(o[0]==='clean')hit=!g.crashes&&!g.helps;else if(o[0]==='long')hit=!!(g.v3o&&g.v3o.f>=3);else if(o[0]==='short')hit=!!(g.v3o&&g.v3o.l===2);
else if(o[0]==='combo')hit=(g.comboMax||0)>=3||(g.v3q&&/🚗🚗🚗/.test(g.v3q.join('')));else if(o[0]==='exact')hit=g.moves<=cnt&&!g.crashes;
if(!hit)return;n.om=today();g.v3om=o;ok(function(){S.coins+=OMEN_C;ern('gift',OMEN_C);});sv();ev('nt',{k:'omen',v:o[0]});}
winSlots.push({id:'v3n-omen',order:7,zone:'goal',fit:4,render:function(){var g=Gv();if(!g||!g.v3om)return null;var o=g.v3om;return'<p class="goal gift">🔮 '+T('Примета сбылась: «','The omen came true: “')+esc(en()?o[2]:o[1])+T('» +',' ” +')+OMEN_C+' 💰</p>';},
mount:function(el){if(el&&el.setAttribute)el.setAttribute('data-keep','1');}});
var BRANDS=[['zapor','«Запорожцы»','Zaporozhets'],['kopeyka','«Копейки»','Kopeykas'],['moskvich','«Москвичи»','Moskviches'],['volga','«Волги»','Volgas'],['niva','«Нивы»','Nivas']];
function brandDay(){if(!on('brand')||done()<10)return null;if(wday()!==3&&qv('v3brand')!=='1')return null;var wk=Math.floor((now()/864e5+3)/7);return BRANDS[wk%BRANDS.length];}
function brandId(){var b=brandDay();return b?b[0]:'';}
var tlShown=0;
function tolikCars(g,o){if(W.__demo||!g||!g.vs||(g.v3h&&g.v3h.tight)||!W.ALB||!ALB.yardCars||!ALB.byId)return;
var have={},i,v;for(i=0;i<g.vs.length;i++)if(g.vs[i].vy)have[g.vs[i].vy]=1;
var ids=ALB.yardCars().filter(function(id){return!have[id]&&!(W.V3H&&V3H.TOLR&&V3H.TOLR[id]&&ok(function(){return V3.is('sprinkle');},false));});if(!ids.length)return;
var key=(o&&o.daily?777:0)+(+g.idx||0),id=ids[key%ids.length],c=ALB.byId(id);if(!c)return;
var cand=g.vs.filter(function(u){return u.L===c.len&&!u.kind&&!u.own&&!u.vy&&u.mdl==null&&!u.noArrow&&!charOf(u);});if(!cand.length)return;
v=cand[(key*7)%cand.length];v.vy=id;v.v3tl=1;g.v3tl=id;ev('nt',{k:'tolcar',v:id});
if(!tlShown){tlShown=1;setTimeout(function(){if(Gv()===g&&!g.over)ok(function(){toast('🏠 '+ALB.nm(id)+T(' из гаража Толика — во дворе!',' from Tolik’s garage — in the yard!'),2600);});},1800);}}
function brandVeh(v){var id=brandId();if(!id||!v||v.L!==2||v.kind||v.own||v.vy||v.mdl!=null||charOf(v))return;v.vy=id;}
function charOf(v){return ok(function(){var g=Gv(),H=g&&g.v3h,M=H&&H.M;if(v.v3back||v.v3buh||v.noArrow)return true;if(!M||!M.role)return false;var i=g.vs.indexOf(v);return i>=0&&!!M.role[i];},false);}
function bench(t,who){ok(function(){if(W.V3SKIN&&V3SKIN.say)V3SKIN.say(t,who||'shura');else toast(t);});}
homeSlots.push({id:'th-night',zone:'thing',order:20,render:function(){if(!nightOpen())return null;var e=nv().e;
if(mornReady())return{at:'night',t:T('Утренний разъезд','Morning rush'),badge:'!',hot:true,go:startMorn};
if(e&&e.s===1)return{at:'night',t:T('Спят до утра','Asleep till morning'),go:function(){bench(tx('wait'));}};
if(e&&e.s===0)return{at:'night',t:T('Двор на ночь','Night parking'),badge:'!',hot:true,go:startEve};
if(eveOpen())return{at:'night',t:T('Двор на ночь','Night parking'),badge:'🌙',hot:true,go:startEve};
return{at:'night',t:T('Ночная стоянка','Night parking'),go:function(){bench(tx('early'));}};}});
homeSlots.push({id:'th-moskvich',zone:'thing',order:20,render:function(){if(!on('mosk')||done()<8)return null;var d=moskDue();
return{at:'moskvich',t:d?T('Заведи «Москвич»','Start the Moskvich'):T('«Москвич» деда','Grandad’s Moskvich'),badge:d?'!':'',hot:d,go:openMosk};}});
homeSlots.push({id:'th-board',zone:'thing',order:20,render:function(){var nn=ok(function(){return W.NEWS&&NEWS.count?NEWS.count():0;},0),lk=ok(function(){return dailyLocked();},true),d=!lk&&ok(function(){return(S.daily||{})[todayKey()];},0);
if(nn)return{at:'board',t:T('Вести со двора','Yard news'),go:function(){ok(function(){NEWS.open();});},badge:'!'};
if(lk)return{at:'board',t:T('Доска объявлений','Notice board'),go:function(){bench(T('Задание дня повесят на доску после 7-го двора.','The daily challenge goes up on the board after yard 7.'));}};
var o=omen(),b=brandDay();return{at:'board',t:T('Двор дня','Yard of the day')+(dayKind()?': '+dayKindName():''),badge:d?'':'!',
go:function(){if(o||b)bench((o?'🔮 '+(en()?o[2]:o[1])+'. ':'')+(b?T('Сегодня марочный день: во дворах одни ','Brand day: every yard is full of ')+(en()?b[2]:b[1])+'!':''));setTimeout(function(){ok(function(){UI.go('daily');});},o||b?900:0);}};}});
homeSlots.push({id:'th-intercom',zone:'thing',order:20,render:function(){var due=doorDue();
if(due)return{at:'intercom',t:T('Домофон: Шура','Intercom: Shura'),badge:'🔔',hot:true,go:function(){showDoor('tap');}};
if(ok(function(){return PLAT==='vk'&&W.SOC&&typeof openSocial==='function'&&!W.__demo;},false))return{at:'intercom',t:T('Позвать соседа','Call a neighbour'),go:function(){openSocial();}};
if(!on('door')||ok(function(){return V3.day();},1)<2)return null;return{at:'intercom',t:T('Домофон','Intercom'),go:function(){showDoor('tap');}};}});
winSlots.push({id:'v3n-eve',order:8,zone:'extra',fit:0,render:function(c){if(!c||c.daily||c.mode&&c.mode!=='n'||c.regionDone||c.newCar||!nightOpen())return null;
var n=nv();if(n.e&&n.e.s===1)return null;if(!eveOpen())return null;if(n.k>0&&winSlots.v3d===sday())return null;if(!(n.k>0)&&c.lv<8)return null;
return'<p class="goal v3nOff">🌙 <b>'+T('Баба Шура: ','Granny Shura: ')+'</b>'+esc(tx('offer',0))+'</p><button class="btn sec sm noenter" id="v3nGo">🌙 '+T('Двор на ночь','Night parking')+'</button>';},
mount:function(el){if(el&&el.setAttribute)el.setAttribute('data-keep','1');winSlots.v3d=sday();var b=el&&el.querySelector('#v3nGo');if(b)b.onclick=function(){ev('nt',{k:'offer'});ok(function(){hideModal();});startEve();};}});
winSlots.push({id:'v3n-hook',order:9,zone:'tmr',fit:0,render:function(c){if(!on('serial')||!c||c.daily||c.newCar)return null;var n=nv(),se=n.se;
if(se.h||ok(function(){return V3.day();},1)>1||c.lv<5)return null;var x=serialGet(se.i||0,1);if(!x)return null;
return'<p class="goal v3nHook">📺 <b>'+esc(x.t)+'.</b> '+esc(x.ep)+' <i>'+T('Завтра расскажу, что дальше.','I’ll tell you what happens next tomorrow.')+'</i></p>';},
mount:function(el){var n=nv();if(el&&el.setAttribute)el.setAttribute('data-keep','1');n.se.h=1;n.se.e=Math.max(1,n.se.e||0);n.se.d=today();sv();ev('nt',{k:'hook'});}});
UI.on('win',function(){ok(function(){var card=D.getElementById('mcard'),mo=D.getElementById('modal');if(!card||!mo)return;
var over=function(){var r=card.querySelector('.row'),b=r&&r.getBoundingClientRect();return mo.scrollHeight>mo.clientHeight+1||!!(b&&b.bottom>(W.innerHeight||0)+1);};
if(!over())return;var p=card.querySelector('.v3nOff');if(p){var bt=card.querySelector('#v3nGo');if(bt)bt.title=p.textContent;p.parentNode.removeChild(p);ev('nt',{k:'fit',s:'off'});}
if(!over())return;var h=card.querySelector('.v3nHook'),sl=h&&h.closest?h.closest('[data-slot]'):null,d=card.querySelector('details.v3more');
if(sl&&d){sl.removeAttribute('data-keep');d.appendChild(sl);var n=nv();n.se.h=0;sv();ev('nt',{k:'fit',s:'hook'});}});});
function ntfBtn(){if(!on('ntf'))return'';var okk=ok(function(){return PLAT==='vk'&&!OK&&ses2()&&W.SOC&&SOC.can&&SOC.can('ntf')&&!(S.soc&&S.soc.ntf);},false);
return okk?'<p class="goal">'+T('Разбудить тебя утром, когда соседям на работу?','Shall I wake you in the morning when the neighbours leave?')+'</p><div class="row2"><button class="btn sec sm noenter" id="v3nNtf">🔔 '+T('Напомнить утром','Remind me in the morning')+'</button></div>':'';}
function ntfWire(){var b=$('v3nNtf');if(!b)return;b.onclick=function(){if(b.disabled)return;b.disabled=true;ev('nt',{k:'ntf'});ok(function(){SOC.ntf(1).then(function(y){if(y){ev('nt',{k:'ntf_ok'});toast(T('Договорились! Утром напомню.','Deal! I’ll remind you in the morning.'));}if(b.parentNode)b.parentNode.removeChild(b);});});};}
W.V3N={nv:nv,mkNight:mkNight,greedy:greedy,solvable:solvable,fits:fits,allFits:allFits,cellsOf:cellsOf,startEve:startEve,startMorn:startMorn,eveTap:eveTap,undo:undo,rot:rot,
showDoor:showDoor,doorDue:doorDue,charOf:charOf,layEnc:layEnc,layDec:layDec,nbFetch:nbFetch,nbDue:nbDue,startNb:startNb,nbSt:function(){return{nb:NB,c:NBc};},doorRows:doorRows,openMosk:openMosk,moskDue:moskDue,dayKind:dayKind,omen:omen,brandDay:brandDay,sday:sday,eveOpen:eveOpen,mornReady:mornReady,
ng:function(){return NG;},inHash:function(){return on('board')?HY:null;},sqText:sqText,
place:function(x,y,d){if(!NG||NG.m!=='eve')return false;NG.d=d;var n0=cur();eveTap(ox+(x+.5)*cs,oy+(y+.5)*cs);return cur()>n0;}};
})();