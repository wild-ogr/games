(function(root){
'use strict';
var DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function ri(R,n){return Math.floor(R()*n);}
function field(w,h,cars,occ0){
var occ=new Int16Array(w*h).fill(-1),i,k;
if(occ0)for(i=0;i<w*h;i++)if(occ0[i]<=-2)occ[i]=-2;
var F={w:w,h:h,occ:occ,cars:cars,n:cars.length,alive:new Uint8Array(cars.length)};
for(i=0;i<cars.length;i++){F.alive[i]=1;for(k=0;k<cars[i].c.length;k++){var p=cars[i].c[k];occ[p[1]*w+p[0]]=i;}}
return F;}
function fcopy(F){return{w:F.w,h:F.h,occ:F.occ.slice(),cars:F.cars,n:F.n,alive:F.alive.slice()};}
function free(F,i){var v=F.cars[i],D=DIRS[v.d],x=v.c[0][0]+D[0],y=v.c[0][1]+D[1],w=F.w,h=F.h;
while(x>=0&&y>=0&&x<w&&y<h){var o=F.occ[y*w+x];if(o!==-1&&o!==i)return false;x+=D[0];y+=D[1];}return true;}
function rm(F,i){var c=F.cars[i].c;for(var k=0;k<c.length;k++)F.occ[c[k][1]*F.w+c[k][0]]=-1;F.alive[i]=0;}
function frees(F){var f=[];for(var i=0;i<F.n;i++)if(F.alive[i]&&free(F,i))f.push(i);return f;}
function left(F){var s=0;for(var i=0;i<F.n;i++)s+=F.alive[i];return s;}
function closure(F,i){var seen={},st=[i],out=[];while(st.length){var j=st.pop();if(seen[j])continue;seen[j]=1;out.push(j);var v=F.cars[j],D=DIRS[v.d];
for(var x=v.c[0][0]+D[0],y=v.c[0][1]+D[1];x>=0&&y>=0&&x<F.w&&y<F.h;x+=D[0],y+=D[1]){var o=F.occ[y*F.w+x];if(o>=0&&o!==j&&!seen[o])st.push(o);}}return out;}
function certOrder(F0,R){var F=fcopy(F0),out=[];for(;;){var f=frees(F);if(!f.length)break;var i=f[ri(R,f.length)];rm(F,i);out.push(i);}
return left(F)?null:out;}
function pocketMove(L,st,i){var c=L.col[i],q=L.q;
if(c<0)return{ok:true,kind:'go',out:[]};
if(st.qi<q.length&&q[st.qi]===c){st.qi++;var out=pocketCascade(L,st);return{ok:true,kind:'board',out:out};}
if(st.pk.length>=L.K)return{ok:false,kind:'full'};
st.pk.push(c);st.mx=Math.max(st.mx||0,st.pk.length);return{ok:true,kind:'wait',out:[]};}
function pocketCascade(L,st){var out=[],q=L.q;for(;;){if(st.qi>=q.length)break;var j=st.pk.indexOf(q[st.qi]);if(j<0)break;out.push(j);st.pk.splice(j,1);st.qi++;}return out;}
function pocketOk(L,st,i){var c=L.col[i];return c<0||(st.qi<L.q.length&&L.q[st.qi]===c)||st.pk.length<L.K;}
function shopMove(L,st,i){var c=L.col[i];if(c<0)return{ok:true,kind:'go',out:[]};
var n=0,k;for(k=0;k<st.tr.length;k++)if(st.tr[k]===c)n++;
if(n>=2){var out=[];for(k=st.tr.length-1;k>=0;k--)if(st.tr[k]===c){out.push(k);st.tr.splice(k,1);}return{ok:true,kind:'triple',out:out};}
if(st.tr.length>=L.cap)return{ok:false,kind:'full'};
st.tr.push(c);st.mx=Math.max(st.mx||0,st.tr.length);return{ok:true,kind:'park',out:[]};}
function shopOk(L,st,i){var c=L.col[i];if(c<0||st.tr.length<L.cap)return true;var n=0;for(var k=0;k<st.tr.length;k++)if(st.tr[k]===c)n++;return n>=2;}
function columnChain(F,col,i){var c=col[i],out=[];if(c<0)return out;
for(;;){var f=[];for(var j=0;j<F.n;j++)if(F.alive[j]&&col[j]===c&&free(F,j))f.push(j);if(!f.length)return out;
for(var k=0;k<f.length;k++)if(F.alive[f[k]]&&free(F,f[k])){rm(F,f[k]);out.push(f[k]);}}}
function playPlace(kind,F0,L,bot,R){var F=fcopy(F0),st=kind==='pocket'?{qi:0,pk:[],mx:0}:{tr:[],mx:0},mv=kind==='pocket'?pocketMove:shopMove,ok=kind==='pocket'?pocketOk:shopOk;
for(;;){var f=frees(F);if(!f.length)return{win:!left(F),mx:st.mx};
var g=f.filter(function(i){return ok(L,st,i);});if(!g.length)return{win:false,mx:st.mx,dead:1};
var i;
if(bot==='cas'){var good=g.filter(function(i){var c=L.col[i];if(c<0)return true;if(kind==='pocket')return st.qi<L.q.length&&L.q[st.qi]===c;var n=0;for(var k=0;k<st.tr.length;k++)if(st.tr[k]===c)n++;return n>=2;});
i=good.length?good[ri(R,good.length)]:g[ri(R,g.length)];}
else if(bot==='smart')i=smartPick(kind,F,L,st,g,R);
else i=g[ri(R,g.length)];
mv(L,st,i);rm(F,i);}}
function smartPick(kind,F,L,st,g,R){var best=null,bs=-1e9;
for(var k=0;k<g.length;k++){var i=g[k],c=L.col[i],s;
if(c<0)s=1000;
else if(kind==='pocket'){if(st.qi<L.q.length&&L.q[st.qi]===c)s=900;else{var p=L.q.indexOf(c,st.qi);s=p<0?-500:-p;}}
else{var n=0;for(var t=0;t<st.tr.length;t++)if(st.tr[t]===c)n++;s=n*100-st.tr.length;}
s+=R()*.5;if(s>bs){bs=s;best=i;}}
return best;}
function playColumn(F0,col,bot,R){var F=fcopy(F0),taps=0,mx=0;
for(;;){var f=frees(F);if(!f.length)return{win:!left(F),taps:taps,mx:mx};var i;
if(bot==='greedy'){var bi=f[0],bn=-1;for(var k=0;k<f.length;k++){var T=fcopy(F);rm(T,f[k]);var n=columnChain(T,col,f[k]).length+R()*.5;if(n>bn){bn=n;bi=f[k];}}i=bi;}
else if(bot==='mix'){if(R()<.6){var bi2=f[0],bn2=-1;for(var k2=0;k2<f.length;k2++){var T2=fcopy(F);rm(T2,f[k2]);var n2=columnChain(T2,col,f[k2]).length+R()*.9;if(n2>bn2){bn2=n2;bi2=f[k2];}}i=bi2;}else i=f[ri(R,f.length)];}
else i=f[ri(R,f.length)];
rm(F,i);var ch=columnChain(F,col,i);taps++;mx=Math.max(mx,ch.length+1);}}
function key(F){var s='',a=0,b=0;for(var i=0;i<F.n;i++){if(F.alive[i])a|=1<<(i%30);if(i%30===29||i===F.n-1){s+=a.toString(36)+',';a=0;}}return s;}
function dropNeutral(F,col){var moved=true,any=false;while(moved){moved=false;for(var i=0;i<F.n;i++)if(F.alive[i]&&col[i]<0&&free(F,i)){rm(F,i);moved=any=true;}}return any;}
function solvePocket(F0,L,K,limit){var seen={},nodes=0,LL={col:L.col,q:L.q,K:K};
function rec(F,qi,pk){dropNeutral(F,L.col);if(!left(F))return true;
var kk=key(F)+'|'+qi+'|'+pk.slice().sort().join('');if(seen[kk])return false;seen[kk]=1;if(++nodes>limit)throw 0;
var f=frees(F);f.sort(function(a,b){return(L.q[qi]===L.col[b]?1:0)-(L.q[qi]===L.col[a]?1:0);});
for(var k=0;k<f.length;k++){var st={qi:qi,pk:pk.slice()};if(!pocketMove(LL,st,f[k]).ok)continue;var T=fcopy(F);rm(T,f[k]);if(rec(T,st.qi,st.pk))return true;}
return false;}
try{return rec(fcopy(F0),0,[]);}catch(e){return null;}}
function solveShop(F0,L,cap,limit){var seen={},nodes=0,LL={col:L.col,cap:cap};
function rec(F,tr){dropNeutral(F,L.col);if(!left(F))return true;
var kk=key(F)+'|'+tr.slice().sort().join('');if(seen[kk])return false;seen[kk]=1;if(++nodes>limit)throw 0;
var f=frees(F),cnt={};tr.forEach(function(c){cnt[c]=(cnt[c]||0)+1;});f.sort(function(a,b){return(cnt[L.col[b]]||0)-(cnt[L.col[a]]||0);});
for(var k=0;k<f.length;k++){var st={tr:tr.slice()};if(!shopMove(LL,st,f[k]).ok)continue;var T=fcopy(F);rm(T,f[k]);if(rec(T,st.tr))return true;}
return false;}
try{return rec(fcopy(F0),[]);}catch(e){return null;}}
function minPlace(kind,F,L,hi,limit,R){var best=hi,exact=true;
for(var k=0;k<hi;k++){var r=kind==='pocket'?solvePocket(F,L,k,limit):solveShop(F,L,k,limit);if(r===true){best=k;break;}if(r===null){exact=false;break;}}
if(!exact){var LL=Object.assign({},L);if(kind==='pocket')LL.K=hi;else LL.cap=hi;for(var s=0;s<40;s++){var p=playPlace(kind,F,LL,s%2?'smart':'cas',R);if(p.win)best=Math.min(best,p.mx);}}
return{k:best,exact:exact};}
var CFG={
slots:{3:'place',9:'place',5:'story',7:'chars',10:'tight'},
fromIdx:10,
softUntil:15,
columnFrom:60,
columnSlots:{2:1,4:1,6:1,8:1},
pocketPass:30,
trainN:3,
shopCap:7,shopC:4,shopMess:.3,
colC:3,
pal:['#e74c3c','#2e86de','#f1c40f','#27ae60','#8e44ad'],
palNames:[['красный','red'],['синий','blue'],['жёлтый','yellow'],['зелёный','green'],['фиолетовый','purple']],
neutral:'#a4b0be'
};
function kindOf(idx){if(idx<CFG.fromIdx)return'';var r=Math.floor(idx/10),s=idx%10+1,k=CFG.slots[s]||'';
if(k==='place')return r%2===1?'pocket':'shop';
if(!k&&idx>=CFG.columnFrom&&CFG.columnSlots[s])return'column';
return k;}
function pocketNo(idx){var n=0;for(var i=CFG.fromIdx;i<=idx;i++)if(kindOf(i)==='pocket')n++;return n;}
function shopNo(idx){var n=0;for(var i=CFG.fromIdx;i<=idx;i++)if(kindOf(i)==='shop')n++;return n;}
function buildPocket(F,idx,seed,skip,budget){var R=rng(seed*31+idx*7+1),no=pocketNo(idx),train=no<=CFG.trainN,ids=[],i;
for(i=0;i<F.n;i++)if(!skip[i])ids.push(i);
var nP=Math.min(ids.length,CFG.pocketPass),C=train?2:nP<=18?3:4,soft=idx<CFG.softUntil;
var t0=Date.now(),best=null;
for(var t=0;t<8;t++){var order=certOrder(F,R);if(!order)return null;
var pas=ids.slice();for(i=pas.length-1;i>0;i--){var j=ri(R,i+1),x=pas[i];pas[i]=pas[j];pas[j]=x;}pas=pas.slice(0,nP);
var col=new Array(F.n).fill(-1);pas.forEach(function(p,k){col[p]=k<C?k:ri(R,C);});
var q=[];order.forEach(function(p){if(col[p]>=0)q.push(col[p]);});
var sw=Math.round(q.length*(train?.25:[.5,.7,.9,.35][t%4])),dist=train?2:4;
for(var s=0;s<sw;s++){var a=ri(R,q.length),b=Math.min(q.length-1,a+1+ri(R,dist)),y=q[a];q[a]=q[b];q[b]=y;}
var L={col:col,q:q,K:9},need=needAlong(F,L,order);if(need>(train?3:5))continue;
var km=minPlace('pocket',F,L,need,budget||3000,R);
var Ks=train?[5]:[],kk;if(!train)for(kk=Math.max(km.k+2,need,3);kk<=5;kk++)Ks.push(kk);if(!Ks.length)continue;
for(var ki=0;ki<Ks.length;ki++){var KK=Ks[ki],cas=0;for(s=0;s<16;s++)cas+=playPlace('pocket',F,{col:col,q:q,K:KK},'cas',R).win?1:0;cas/=16;
var sc=Math.abs(cas-(train?.9:.7));
if(!best||sc<best.sc)best={sc:sc,col:col,q:q,K:KK,kmin:km.k,exact:km.exact,need:need,order:order,C:C,cas:cas,train:train};}
}
if(!best)return null;
best.kind='pocket';best.soft=soft;if(soft)best.K++;return best;}
function needAlong(F,L,order){var st={qi:0,pk:[],mx:0},LL={col:L.col,q:L.q,K:99};order.forEach(function(i){pocketMove(LL,st,i);});return st.mx;}
function buildShop(F,idx,seed,skip,budget){var R=rng(seed*37+idx*11+3),no=shopNo(idx),train=no<=1,ids=[],i;
for(i=0;i<F.n;i++)if(!skip[i])ids.push(i);
var C=train?3:ids.length<=36?4:5,t0=Date.now(),best=null;
for(var t=0;t<6;t++){var order=certOrder(F,R);if(!order)return null;var mess=train?.15:[.3,.5,.7][t%3];
var part=order.filter(function(p){return ids.indexOf(p)>=0;}),n=part.length-part.length%3;
var drop={};for(var d=0;d<part.length-n;d++){var z=ri(R,part.length);while(drop[part[z]])z=(z+1)%part.length;drop[part[z]]=1;}
part=part.filter(function(p){return!drop[p];});
var tr=[];for(i=0;i<n/3;i++){var c=(i%C+ri(R,C))%C;tr.push(c,c,c);}
for(var s=0;s<Math.round(mess*n);s++){var a=ri(R,n),b=Math.min(n-1,a+1+ri(R,4)),y=tr[a];tr[a]=tr[b];tr[b]=y;}
var col=new Array(F.n).fill(-1);part.forEach(function(p,k){col[p]=tr[k];});
var stt={tr:[],mx:0};order.forEach(function(p){shopMove({col:col,cap:99},stt,p);});
if(stt.mx>(train?5:6))continue;
var km=minPlace('shop',F,{col:col,cap:9},stt.mx,budget||1200,R);
var caps=train?[7]:[];if(!train)for(var cc=Math.max(km.k+2,stt.mx,4);cc<=CFG.shopCap;cc++)caps.push(cc);
for(var ci=0;ci<caps.length;ci++){var L={col:col,cap:caps[ci]},rn=0,cs=0;for(s=0;s<12;s++){rn+=playPlace('shop',F,L,'rnd',R).win?1:0;cs+=playPlace('shop',F,L,'cas',R).win?1:0;}rn/=12;cs/=12;
var sc=train?Math.abs(cs-.95):Math.abs(rn-.45)+Math.abs(cs-.75);
if(!best||sc<best.sc)best={sc:sc,col:col,cap:caps[ci],kmin:km.k,exact:km.exact,need:stt.mx,order:order,C:C,rnd:rn,cas:cs,train:train};}
if(best&&best.sc<.15)break;}
if(!best)return null;best.kind='shop';return best;}
function buildColumn(F,idx,seed,skip){var R=rng(seed*41+idx*13+5),C=CFG.colC,col=new Array(F.n).fill(-1),i;
for(i=0;i<F.n;i++)if(!skip[i])col[i]=ri(R,C);
var best=1e9,rs=0,t0=Date.now(),runs=0;
for(var s=0;s<60;s++){var r=playColumn(F,col,s%3===0?'greedy':'mix',R);runs++;if(r.win&&r.taps<best)best=r.taps;}
for(s=0;s<12;s++)rs+=playColumn(F,col,'rnd',R).taps;
return{kind:'column',col:col,C:C,norm:best,rnd:rs/12,runs:runs};}
function build(kind,F,idx,seed,skip,budget){skip=skip||{};
if(kind==='pocket')return buildPocket(F,idx,seed,skip,budget);
if(kind==='shop')return buildShop(F,idx,seed,skip,budget);
if(kind==='column')return buildColumn(F,idx,seed,skip);
return null;}
function starsOf(L,st){if(!L)return 3;
if(L.kind==='column'){var t=st.taps||0;return t<=L.norm+1?3:t<=L.norm+3?2:1;}
var mx=st.mx||0,lim=L.kind==='pocket'?L.K:L.cap;return mx<=L.kmin+1?3:mx<lim?2:1;}
function firstMove(kind,F0,L,st0,limit){var seen={},nodes=0,mv=kind==='pocket'?pocketMove:shopMove;
function sk(st){return kind==='pocket'?st.qi+'|'+st.pk.slice().sort().join(''):st.tr.slice().sort().join('');}
function cl(st){return kind==='pocket'?{qi:st.qi,pk:st.pk.slice(),mx:0}:{tr:st.tr.slice(),mx:0};}
function pr(st,i){var c=L.col[i];if(kind==='pocket')return st.qi<L.q.length&&L.q[st.qi]===c?1:0;var n=0;for(var k=0;k<st.tr.length;k++)if(st.tr[k]===c)n++;return n;}
function rec(F,st,top){if(!top)dropNeutral(F,L.col);if(!left(F))return top?-1:true;var kk=key(F)+'|'+sk(st);if(seen[kk])return false;seen[kk]=1;if(++nodes>limit)throw 0;
var f=frees(F);if(top){var nf=f.filter(function(i){return L.col[i]<0;});var Fd=fcopy(F);dropNeutral(Fd,L.col);f=frees(Fd);F=Fd;
f.sort(function(a,b){return pr(st,b)-pr(st,a);});
for(var k=0;k<f.length;k++){var s2=cl(st);if(!mv(L,s2,f[k]).ok)continue;var T=fcopy(F);rm(T,f[k]);if(rec(T,s2,false))return free(fcopy(F0),f[k])?f[k]:(nf[0]!=null?nf[0]:f[k]);}
return nf.length?nf[0]:null;}
f.sort(function(a,b){return pr(st,b)-pr(st,a);});
for(var j=0;j<f.length;j++){var s3=cl(st);if(!mv(L,s3,f[j]).ok)continue;var T2=fcopy(F);rm(T2,f[j]);if(rec(T2,s3,false))return true;}
return false;}
try{var r=rec(fcopy(F0),st0,true);return r===-1||r===false?null:r;}catch(e){return null;}}
var V3K={rng:rng,field:field,fcopy:fcopy,free:free,rm:rm,frees:frees,left:left,closure:closure,certOrder:certOrder,
pocketMove:pocketMove,pocketOk:pocketOk,shopMove:shopMove,shopOk:shopOk,columnChain:columnChain,
playPlace:playPlace,playColumn:playColumn,solvePocket:solvePocket,solveShop:solveShop,minPlace:minPlace,
kindOf:kindOf,pocketNo:pocketNo,firstMove:firstMove,build:build,starsOf:starsOf,CFG:CFG,DIRS:DIRS};
if(typeof module!=='undefined'&&module.exports)module.exports=V3K;
else root.V3K=V3K;
if(typeof window!=='undefined')(function(){
function curG(){try{return G;}catch(e){return null;}}
function Lg(ru,en){try{return L(ru,en);}catch(e){return ru;}}
function Sv(){try{return S;}catch(e){return null;}}
var REG={};
function flagOn(k){try{if(window.V3&&typeof V3.reg==='function'){
if(!REG[k]){REG[k]=1;V3.reg(k,{s:'CARMAN',t:({pocket:'Карман у арки',shop:'Стоянка у магазина',column:'Колонна'})[k]||k});}
return V3.is(k);}}catch(e){}
try{var m=/[?&]off=([^&#]*)/.exec(location.search||'');if(m){var a=decodeURIComponent(m[1]).split(',');if(a.indexOf('v3')>=0||a.indexOf('all')>=0||a.indexOf('v3.'+k)>=0||a.indexOf(k)>=0)return false;}}catch(e){}
return true;}
try{if(window.V3&&V3.reg)['pocket','shop','column'].forEach(function(k){flagOn(k);});}catch(e){}
function fieldOfG(g){var cars=g.vs.map(function(v){return{c:v.cells,d:v.dir};}),F=field(g.p.w,g.p.h,cars,g.occ);
g.vs.forEach(function(v,i){if(!(v.state==='idle'||v.state==='bump'))rm(F,i);});return F;}
function now(){return(typeof performance!=='undefined'?performance.now():Date.now())/1000;}
var PEOPLE=['tolik','mihalych','valerka','valya','sansan','zina','mityai','ded'];
function begin(g,lv,idx,seed,daily,o){g.v3k=null;if(daily||o||window.__demo)return;var kind=kindOf(idx);
if(['pocket','shop','column'].indexOf(kind)<0||!flagOn(kind))return;
var skip={};g.vs.forEach(function(v){if(v.kind||v.own)skip[v.id]=1;});
var F=fieldOfG(g),Ly=build(kind,F,idx,seed,skip);if(!Ly)return;
if(g.amb)g.amb.done=true;
var st=kind==='pocket'?{qi:0,pk:[],mx:0}:kind==='shop'?{tr:[],mx:0}:{taps:0};
g.v3k={kind:kind,L:Ly,st:st,born:[],fx:[],t0:now(),bought:0};
g.vs.forEach(function(v,i){var c=Ly.col[i];if(c>=0)tint(v,CFG.pal[c]);else if(kind!=='column'&&!v.kind&&!v.own)tint(v,CFG.neutral);});
try{STAT.ev('v3k',{k:kind,i:idx+1,K:Ly.K||Ly.cap||Ly.norm,m:Ly.kmin});}catch(e){}}
function tipText(kind){return kind==='pocket'?Lg('🧺 Карман у арки: машина забирает первого в очереди жильца СВОЕГО цвета. Чужой — ждёт в кармане. Карман полон — двор встанет!','🧺 The arch pocket: a car picks up the first neighbour in line of ITS colour. Otherwise it waits in the pocket. Pocket full — the yard is stuck!')
:kind==='shop'?Lg('🛒 Стоянка у магазина: уехавшая машина ждёт на стоянке, три одного цвета уезжают вместе. Стоянка полна — двор встанет!','🛒 Shop parking: each car that leaves waits in the lot; three of a colour drive off together. Lot full — the yard is stuck!')
:Lg('🚗 Колонна: нажми — и следом сами поедут все освободившиеся того же цвета. ★★★ — уложись в норму касаний.','🚗 Convoy: tap a car and every freed car of the same colour follows it. ★★★ — stay within the tap target.');}
function shuraLine(kind){return kind==='pocket'?Lg('Жильцы по цвету стоят — сажай по очереди!','Neighbours are lined up by colour — take them in turn!')
:kind==='shop'?Lg('В магазин по трое ездят — ищи пару!','They go shopping in threes — find a match!'):Lg('Красные — за мной! Одним пальцем полдвора!','Reds, follow me! Half the yard with one finger!');}
function intro(){var g=curG(),Sx=Sv();if(!g||!g.v3k||!Sx)return;var k='v3'+g.v3k.kind;if(!Sx.tipSeen)return;
var tip=document.getElementById('tip');
if(!Sx.tipSeen[k]){Sx.tipSeen[k]=1;try{save();}catch(e){}
if(tip&&tip.style.display!=='block'){tip.textContent=tipText(g.v3k.kind);tip.style.display='block';try{TIPM={k:k,z:0,t0:Date.now()};tipAutoHide();}catch(e){}}
setTimeout(function(){if(curG()===g&&!g.over)try{say(shuraLine(g.v3k.kind),'bench');}catch(e){}},900);}}
function okNow(K,i){return K.kind==='pocket'?pocketOk(K.L,K.st,i):shopOk(K.L,K.st,i);}
function apply(K,i){var r=(K.kind==='pocket'?pocketMove:shopMove)(K.L,K.st,i),t=now();
if(r.kind==='wait'||r.kind==='park')K.born.push(t);
(r.out||[]).forEach(function(j){K.born.splice(j,1);});
if(r.kind==='board'){K.boardT=t;K.boarded=(K.boarded||0)+1;try{SND.click();}catch(e){}}
if(r.out&&r.out.length){K.leaveT=t;try{SND.coin();}catch(e){}}
if(r.kind==='triple'){K.tripT=t;}
return r;}
function pre(v){var g=curG(),K=g&&g.v3k;if(!K)return false;
if(K.kind==='column'){K.st.taps++;return false;}
if(okNow(K,v.id)){apply(K,v.id);return false;}
v.state='bump';v.t=0;v.k=0;v.block=-1;v.hit=false;try{SND.horn();}catch(e){}K.fullT=now();
try{say(K.kind==='pocket'?Lg('Карман полный! Сначала своих посади.','The pocket is full! Pick up your own first.'):Lg('Стоянка полная! Ищи третью к паре.','The lot is full! Find a third to make a set.'),'bench');}catch(e){}
return true;}
function freeIdle(g){var w=g.p.w,h=g.p.h;return g.vs.filter(function(u){return u.state==='idle'&&canExit(u,g.occ,w,h,u.id).free;});}
function post(v){var g=curG(),K=g&&g.v3k;if(!K)return;
if(K.kind==='column'){var c=K.L.col[v.id];if(c<0)return;var n=0,more=true;
while(more){more=false;var f=freeIdle(g).filter(function(u){return K.L.col[u.id]===c;});
for(var k=0;k<f.length;k++){var r=canExit(f[k],g.occ,g.p.w,g.p.h,f[k].id);if(f[k].state==='idle'&&r.free){startExit(f[k],r,.16*(++n));more=true;}}}
if(n>=1){g.comboFx={n:n+1,t:0};}
try{updHud();}catch(e){}return;}
deadCheck(g);}
function deadCheck(g){var K=g.v3k;if(!K||g.over)return;var idle=g.vs.filter(function(u){return u.state==='idle'||u.state==='bump';});if(!idle.length)return;
var occ=g.occ.slice();for(var i=0;i<occ.length;i++)if(occ[i]===-4)occ[i]=-1;
var f=g.vs.filter(function(u){return u.state==='idle'&&canExit(u,occ,g.p.w,g.p.h,u.id).free;});if(!f.length)return;if(f.some(function(u){return okNow(K,u.id);}))return;
g.v3dead=1;g.over=true;try{say(loseLine(),'bench');}catch(e){}try{STAT.ev('v3dead',{k:K.kind,i:g.idx+1,l:idle.length});}catch(e){}try{loseLater(1100);}catch(e){}}
function towOk(v){var g=curG(),K=g&&g.v3k;if(!K||K.kind==='column')return true;return okNow(K,v.id);}
function onTow(v){var g=curG(),K=g&&g.v3k;if(!K)return;if(K.kind==='column'){K.st.taps++;post(v);return;}apply(K,v.id);deadCheck(g);}
function revive(g){var K=g&&g.v3k;if(!K||!g.v3dead)return;g.v3dead=0;K.bought=1;if(K.kind==='pocket')K.L.K++;else if(K.kind==='shop')K.L.cap++;
try{toast(K.kind==='pocket'?Lg('🧺 +1 место в кармане','🧺 +1 pocket space'):Lg('🛒 +1 место на стоянке','🛒 +1 parking space'));}catch(e){}}
function loseLine(){var g=curG(),k=g&&g.v3k&&g.v3k.kind;return k==='pocket'?Lg('Карман забит — двор встал. Давай заново: сначала своих сажай, чужих — в карман пореже.','The pocket is jammed — the yard is stuck. Again: pick up your own first, park strangers less.')
:k==='shop'?Lg('Стоянка забита — двор встал. Ставь к паре третью, а не новых!','The lot is jammed — the yard is stuck. Add a third to a pair, not new colours!'):pick('lose');}
function stars(g){var K=g&&g.v3k;if(!K)return 3;var s=starsOf(K.L,K.st);return K.bought?Math.min(2,s):s;}
function noWave(){var g=curG();return!!(g&&g.v3k);}
function hintPick(cand){var g=curG(),K=g&&g.v3k;if(!K||!cand||!cand.length)return null;
if(K.kind==='column'){var best=null,bn=-1,F=fieldOfG(g);cand.forEach(function(v){var T=fcopy(F);rm(T,v.id);var n=columnChain(T,K.L.col,v.id).length;if(n>bn){bn=n;best=v;}});return best;}
var F2=fieldOfG(g),st=K.kind==='pocket'?{qi:K.st.qi,pk:K.st.pk.slice()}:{tr:K.st.tr.slice()};
var lim=Math.max(K.L.kmin+1,(K.st.pk||K.st.tr).length),LL=K.kind==='pocket'?{col:K.L.col,q:K.L.q,K:Math.min(K.L.K,lim)}:{col:K.L.col,cap:Math.min(K.L.cap,lim)};
var id=(K.st.mx||0)<=K.L.kmin+1?firstMove(K.kind,F2,LL,st,15000):null;if(id==null)id=firstMove(K.kind,F2,K.L,st,25000);
if(id!=null){var v=g.vs[id];if(v&&cand.indexOf(v)>=0)return v;}
var ok=cand.filter(function(v){return okNow(K,v.id);});
var good=ok.filter(function(v){var c=K.L.col[v.id];if(c<0)return true;if(K.kind==='pocket')return K.L.q[K.st.qi]===c;return K.st.tr.filter(function(x){return x===c;}).length>=2;});
return good[0]||ok[0]||null;}
function botPick(){var g=curG();if(!g||g.over)return null;var c=freeIdle(g);if(!c.length)return null;if(!g.v3k)return c[0];return hintPick(c)||c[0];}
function res(g){var K=g&&g.v3k;if(!K)return 0;return K.kind==='column'?34:70;}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function miniCar(c,x,y,w,h,col){rr(c,x,y,w,h,h*.3);c.fillStyle=col;c.fill();c.lineWidth=1.5;c.strokeStyle='rgba(0,0,0,.35)';c.stroke();
c.fillStyle='rgba(30,50,80,.55)';rr(c,x+w*.62,y+h*.18,w*.2,h*.64,h*.12);c.fill();c.fillStyle='rgba(255,255,255,.35)';rr(c,x+w*.12,y+h*.2,w*.4,h*.22,h*.1);c.fill();}
function person(c,x,y,r,col,id,front,t){c.save();c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=col;c.fill();c.lineWidth=front?3:2;c.strokeStyle=front?'#fff':'rgba(255,255,255,.8)';c.stroke();
c.beginPath();c.arc(x,y,r-2.5,0,7);c.clip();var im=null;try{im=window.VYPEOPLE&&VYPEOPLE.img(id);}catch(e){}
if(im&&im.complete&&im.naturalWidth){var s=r*2.3;c.drawImage(im,x-s/2,y-s*.42,s,s*1.1);}c.restore();
c.beginPath();c.arc(x,y,r,.15*Math.PI,.85*Math.PI);c.lineWidth=front?5:4;c.strokeStyle=col;c.stroke();}
function label(c,x,y,txt,sz,al){c.font='800 '+sz+'px Rubik,-apple-system,sans-serif';c.textAlign=al||'left';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.45)';c.strokeText(txt,x,y);c.fillStyle='#fff';c.fillText(txt,x,y);}
function draw(c,W,H,t){var g=curG(),K=g&&g.v3k;if(!K)return;var tn=now(),hh=res(g),y0=H-hh;
c.save();c.fillStyle='rgba(20,30,48,.62)';rr(c,6,y0+2,W-12,hh-6,12);c.fill();
if(K.kind==='column'){var s3=starsOf(K.L,K.st);label(c,16,y0+hh/2-1,'🚗 '+Lg('Колонна · касаний ','Convoy · taps ')+K.st.taps+Lg(' · ★★★ до ',' · ★★★ ≤ ')+(K.L.norm+1),Math.min(15,W/28));
label(c,W-16,y0+hh/2-1,'★★★'.slice(0,s3)+'☆☆☆'.slice(0,3-s3),14,'right');c.restore();return;}
var cap=K.kind==='pocket'?K.L.K:K.L.cap,arr=K.kind==='pocket'?K.st.pk:K.st.tr;
var sw=Math.min(30,(W*.5-16)/cap),sh=sw*.62,sx0=W-12-cap*(sw+4),sy=y0+hh*.58;
label(c,sx0,y0+13,K.kind==='pocket'?Lg('🧺 Карман ','🧺 Pocket ')+arr.length+'/'+cap:Lg('🛒 Стоянка ','🛒 Lot ')+arr.length+'/'+cap,12);
var full=K.fullT&&tn-K.fullT<.6;
for(var k=0;k<cap;k++){var x=sx0+k*(sw+4);rr(c,x,sy-sh/2-3,sw,sh+6,6);c.fillStyle=full?'rgba(255,80,80,.45)':'rgba(255,255,255,.18)';c.fill();
if(k<arr.length){var b=K.born[k]||0,q=Math.min(1,(tn-b)/.25),sc=.6+.4*q;c.save();c.translate(x+sw/2,sy);c.scale(sc,sc);miniCar(c,-sw*.42,-sh*.4,sw*.84,sh*.8,CFG.pal[arr[k]]);c.restore();}}
if(K.kind==='pocket'){var q2=K.L.q,qi=K.st.qi,r=Math.min(17,hh*.26),x0=16+r,maxX=sx0-14;
label(c,12,y0+13,Lg('Очередь у арки','Line at the arch')+(q2.length-qi>0?' · '+(q2.length-qi):''),12);
var x2=x0,yy=y0+hh*.6,pb=K.boardT?Math.max(0,1-(tn-K.boardT)/.3):0;
for(var j=qi;j<q2.length;j++){var fr=j===qi,rr2=fr?r*1.12*(1+.15*pb):r*.86;if(x2+rr2>maxX){label(c,x2-4,yy,'…',14);break;}
person(c,x2,yy,rr2,CFG.pal[q2[j]],PEOPLE[j%PEOPLE.length],fr,t);x2+=rr2+(j===qi?r*.95:r*.8);}
if(qi>=q2.length)label(c,16,yy,Lg('Все уехали ✓','Everyone’s gone ✓'),13);}
else{var tp=K.tripT?Math.max(0,1-(tn-K.tripT)/.5):0;label(c,12,y0+13,Lg('Три одного цвета — уезжают вместе','Three of a colour leave together'),11);
if(tp>0){c.globalAlpha=tp;label(c,16,y0+hh*.62,'×3 ✓',18);}}
c.restore();}
Object.assign(V3K,{begin:begin,intro:intro,pre:pre,post:post,towOk:towOk,onTow:onTow,revive:revive,loseLine:loseLine,stars:stars,noWave:noWave,
hintPick:hintPick,botPick:botPick,res:res,draw:draw,flagOn:flagOn,fieldOfG:fieldOfG});
})();
})(typeof window!=='undefined'?window:this);