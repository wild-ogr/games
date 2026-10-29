(function(root){
'use strict';
var DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function ri(R,n){return Math.floor(R()*n);}
function fill(a,v){for(var i=0;i<a.length;i++)a[i]=v;return a;}
var SMART={taxi:1,imp:1,quar:1,wed:1};
function straight(c,d){var D=DIRS[d];for(var k=1;k<c.length;k++)if(c[k][0]!==c[0][0]-D[0]*k||c[k][1]!==c[0][1]-D[1]*k)return false;return true;}
function mk(w,h,cars,occ0,skip,hz){var n=cars.length,ob=new Int8Array(w*h),i;
for(i=0;i<w*h;i++){var q=occ0?occ0[i]:-1;if(q===-2)ob[i]=2;else if(q<=-3)ob[i]=1;}
var M={w:w,h:h,n:n,cars:cars,ob:ob,role:fill(new Array(n),''),wn:{},N:0,qa:-1,qb:-1,tow:{},bins:[],mu:-1,first:-1,fcl:null,zi:-1,skip:skip||{},note:null,hz:[]};
if(hz)hz.forEach(function(c){if(c.k>=0&&c.k<w*h){M.hz.push(c);ob[c.k]=0;}});
M.own=new Int16Array(w*h);fill(M.own,-1);for(i=0;i<n;i++)cars[i].c.forEach(function(p){M.own[p[1]*w+p[0]]=i;});
M.nb=[];for(i=0;i<n;i++){var s={};cars[i].c.forEach(function(p){[[0,-1],[1,0],[0,1],[-1,0]].forEach(function(D){var x=p[0]+D[0],y=p[1]+D[1];if(x<0||y<0||x>=w||y>=h)return;var j=M.own[y*w+x];if(j>=0&&j!==i)s[j]=1;});});
M.nb.push(Object.keys(s).map(Number).sort(function(a,b){return a-b;}));}
return M;}
function st0(M){return{al:fill(new Uint8Array(M.n),1),z:0,mv:0};}
function gone(S){for(var i=0;i<S.al.length;i++)if(S.al[i])return false;return true;}
function revOf(M,S,i){var r=false,ro=M.role[i];
if(ro==='taxi'){var g=0;for(var j=0;j<M.n;j++)if(j!==i&&!S.al[j]&&M.role[j]!=='taxi')g++;if(g&1)r=!r;}
else if(ro==='imp'){if(Math.floor(S.mv/M.N)&1)r=!r;}
if(i===M.qa&&!S.al[M.qb])r=!r;if(i===M.qb&&!S.al[M.qa])r=!r;
return r;}
function hd(M,S,i){var v=M.cars[i];if(!revOf(M,S,i))return[v.c[0],v.d];return[v.c[v.c.length-1],(v.d+2)%4];}
function occOf(M,S){var w=M.w,o=new Int16Array(w*M.h),i,k;
for(k=0;k<o.length;k++)o[k]=M.ob[k]===1?-2:M.ob[k]===2?-5:-1;
if(M.hz.length){var gn=0;for(i=0;i<M.n;i++)if(!S.al[i])gn++;for(k=0;k<M.hz.length;k++){var z=M.hz[k];if(z.n>=0?gn<z.n:(z.key>=0&&S.al[z.key]))o[z.k]=-2;}}
if(M.mu>=0&&S.al[M.mu])for(k=0;k<M.bins.length;k++)if(o[M.bins[k]]===-1)o[M.bins[k]]=-6;
for(i=0;i<M.n;i++)if(S.al[i]){var c=M.cars[i].c;for(k=0;k<c.length;k++)o[c[k][1]*w+c[k][0]]=i;}
return o;}
function freeQ(M,S,o,i){var h=hd(M,S,i),D=DIRS[h[1]],x=h[0][0]+D[0],y=h[0][1]+D[1],w=M.w;
while(x>=0&&y>=0&&x<w&&y<M.h){var q=o[y*w+x];if(q!==-1&&q!==i&&!(q===-5&&M.role[i]==='buh'))return false;x+=D[0];y+=D[1];}return true;}
function legal(M,S,o,i){if(!S.al[i])return false;var ro=M.role[i],j;
if(ro==='zap'&&!S.z)return true;
if(!freeQ(M,S,o,i))return false;
if(ro==='wed')for(j=0;j<M.n;j++)if(S.al[j]&&M.role[j]==='wed'&&M.wn[j]<M.wn[i])return false;
if(ro==='volga')for(j=0;j<M.n;j++)if(j!==i&&S.al[j])return false;
if(M.first>=0&&S.al[M.first]&&i!==M.first&&!M.fcl[i])return false;
return true;}
function apply(M,S,i){var T={al:S.al.slice(),z:S.z,mv:S.mv+1};
if(M.role[i]==='zap'&&!S.z){T.z=1;return T;}
T.al[i]=0;var t=M.tow[i];if(t!=null&&T.al[t])T.al[t]=0;
if(M.role[i]==='mag'){var nb=M.nb[i];for(var k=0;k<nb.length;k++){var j=nb[k];if(T.al[j]&&!M.role[j]&&freeQ(M,T,occOf(M,T),j))T.al[j]=0;}}
return T;}
function key(M,S){var s='',a=0;for(var i=0;i<M.n;i++){if(S.al[i])a|=1<<(i%30);if(i%30===29||i===M.n-1){s+=a.toString(36)+',';a=0;}}return s+S.z+(M.N?'|'+S.mv%(2*M.N):'');}
function pri(M,i){var r=M.role[i];return SMART[r]&&r!=='wed'?0:r==='zap'?3:r?1:2;}
function search(M,S0,limit){var seen={},nodes=0,first=-1;
function rec(S,top){if(gone(S))return true;var k=key(M,S);if(seen[k])return false;seen[k]=1;if(++nodes>limit)throw 0;
var o=occOf(M,S),Lg=[],i;for(i=0;i<M.n;i++)if(S.al[i]&&legal(M,S,o,i))Lg.push(i);
Lg.sort(function(a,b){return pri(M,a)-pri(M,b)||a-b;});
for(var j=0;j<Lg.length;j++)if(rec(apply(M,S,Lg[j]),false)){if(top)first=Lg[j];return true;}
return false;}
try{var r=rec(S0,true);return{ok:r,first:first,nodes:nodes};}catch(e){return{ok:null,first:-1,nodes:nodes};}}
function botRun(M,R){var S=st0(M);for(var s=0;s<500;s++){if(gone(S))return 1;var o=occOf(M,S),Lg=[];for(var i=0;i<M.n;i++)if(S.al[i]&&legal(M,S,o,i))Lg.push(i);if(!Lg.length)return 0;S=apply(M,S,Lg[ri(R,Lg.length)]);}return 0;}
function closureM(M,i){var seen={},st=[i];seen[i]=1;var out={};while(st.length){var j=st.pop(),v=M.cars[j],D=DIRS[v.d];
for(var x=v.c[0][0]+D[0],y=v.c[0][1]+D[1];x>=0&&y>=0&&x<M.w&&y<M.h;x+=D[0],y+=D[1]){var o=M.own[y*M.w+x];if(o>=0&&!seen[o]){seen[o]=1;out[o]=1;st.push(o);}}}
return out;}
function rayCells(M,i){var v=M.cars[i],D=DIRS[v.d],o=[];for(var x=v.c[0][0]+D[0],y=v.c[0][1]+D[1];x>=0&&y>=0&&x<M.w&&y<M.h;x+=D[0],y+=D[1])o.push(y*M.w+x);return o;}
function cand(M,ok){var c=[];for(var i=0;i<M.n;i++)if(!M.role[i]&&!M.skip[i]&&ok(i))c.push(i);return c;}
function L2s(M){return function(i){return M.cars[i].c.length===2&&straight(M.cars[i].c,M.cars[i].d);};}
function assign(M,role,R){var c,i,k,w=M.w;
switch(role){
case'taxi':case'imp':case'mosk':c=cand(M,L2s(M));if(!c.length)return false;i=c[ri(R,c.length)];M.role[i]=role;if(role==='imp')M.N=4+ri(R,3);return true;
case'oka':case'zap':c=cand(M,function(i){return M.cars[i].c.length===2;});if(!c.length)return false;i=c[ri(R,c.length)];M.role[i]=role;if(role==='zap')M.zi=i;return true;
case'volga':c=cand(M,function(i){if(M.cars[i].c.length!==2)return false;for(var j=0;j<M.n;j++)if(j!==i&&closureM(M,j)[i])return false;return true;});if(!c.length)return false;M.role[c[ri(R,c.length)]]='volga';return true;
case'quar':c=cand(M,function(i){return L2s(M)(i)&&M.nb[i].some(function(j){return!M.role[j]&&!M.skip[j]&&L2s(M)(j);});});if(!c.length)return false;
i=c[ri(R,c.length)];var bs=M.nb[i].filter(function(j){return!M.role[j]&&!M.skip[j]&&L2s(M)(j);});k=bs[ri(R,bs.length)];M.role[i]=M.role[k]='quar';M.qa=i;M.qb=k;return true;
case'wed':c=cand(M,function(i){return M.cars[i].c.length===2;});var nW=M.n>=12?3:2;if(c.length<nW)return false;
for(var t=c.length-1;t>0;t--){var r=ri(R,t+1),x=c[t];c[t]=c[r];c[r]=x;}c=c.slice(0,nW);c.forEach(function(j,q){M.role[j]='wed';M.wn[j]=q+1;});return true;
case'mag':c=cand(M,function(i){return M.cars[i].c.length===2&&M.nb[i].some(function(j){return!M.role[j];});});if(!c.length)return false;M.role[c[ri(R,c.length)]]='mag';return true;
case'kamaz':c=cand(M,function(i){var v=M.cars[i];if(v.c.length<3||!straight(v.c,v.d))return false;var t=v.c[v.c.length-1],D=DIRS[v.d],x=t[0]-D[0],y=t[1]-D[1];
if(x<0||y<0||x>=w||y>=M.h)return false;var j=M.own[y*w+x];return j>=0&&!M.role[j]&&!M.skip[j];});
if(!c.length)return false;i=c[ri(R,c.length)];var v2=M.cars[i],t2=v2.c[v2.c.length-1],D2=DIRS[v2.d];M.role[i]='kamaz';M.tow[i]=M.own[(t2[1]-D2[1])*w+t2[0]-D2[0]];M.role[M.tow[i]]='tw';return true;
case'buh':c=cand(M,function(i){if(M.cars[i].c.length!==3)return false;return rayCells(M,i).some(function(k){return M.ob[k]===2;});});if(!c.length)return false;M.role[c[ri(R,c.length)]]='buh';return true;
case'dark':c=cand(M,function(i){return M.cars[i].c.length<=3;});if(!c.length)return false;M.role[c[ri(R,c.length)]]='dark';return true;
case'musor':case'mfirst':c=cand(M,function(i){var v=M.cars[i];return v.c.length===3&&straight(v.c,v.d);});if(!c.length)return false;i=c[ri(R,c.length)];
var mine={};rayCells(M,i).forEach(function(k){mine[k]=1;});var cnt={};
for(var j=0;j<M.n;j++)if(j!==i)rayCells(M,j).forEach(function(k){if(M.own[k]<0&&!M.ob[k]&&!mine[k])cnt[k]=(cnt[k]||0)+1;});
var ks=Object.keys(cnt).map(Number).sort(function(a,b){return cnt[b]-cnt[a]||a-b;}).slice(0,5);if(!ks.length)return false;
for(var s=ks.length-1;s>0;s--){var r2=ri(R,s+1),y2=ks[s];ks[s]=ks[r2];ks[r2]=y2;}
M.bins=ks.slice(0,Math.min(2,ks.length));M.mu=i;M.role[i]='musor';
if(role==='mfirst'){M.first=i;M.fcl=closureM(M,i);}return true;
case'gaz':c=cand(M,function(i){var v=M.cars[i];if(v.c.length!==3)return false;var n=Object.keys(closureM(M,i)).length;return n>=2&&n<=7;});
if(!c.length)c=cand(M,function(i){var n=Object.keys(closureM(M,i)).length;return M.cars[i].c.length>=2&&n>=2&&n<=8;});
if(!c.length)return false;i=c[ri(R,c.length)];M.role[i]='gaz';M.first=i;M.fcl=closureM(M,i);return true;
case'note':
var S=st0(M),ord=[];for(var q=0;q<M.n*2&&!gone(S);q++){var o=occOf(M,S),f=[];for(var u=0;u<M.n;u++)if(S.al[u]&&legal(M,S,o,u))f.push(u);if(!f.length)return false;var p=f[ri(R,f.length)];ord.push(p);S=apply(M,S,p);}
M.note={};ord.forEach(function(p,q){M.note[p]=q;});return true;
}
return false;}
function build(base,idx,seed,plan,opt){opt=opt||{};var best=null,tries=opt.tries||8,lim=opt.limit||16000;
for(var t=0;t<tries;t++){var R=rng(seed*53+idx*17+7+t*101),M=mk(base.w,base.h,base.cars,base.occ0,base.skip,base.hz),ok=true,k;
for(k=0;k<plan.sm.length;k++)if(!assign(M,plan.sm[k],R)){ok=false;break;}
if(!ok)continue;
for(k=0;k<plan.fl.length;k++)assign(M,plan.fl[k],R);
var r=search(M,st0(M),lim);if(r.ok!==true)continue;
var dead=0,sm=plan.sm.filter(function(x){return x!=='wed';}).length;
if(sm){var R2=rng(seed*7+t+idx);for(var s=0;s<12;s++)dead+=1-botRun(M,R2);dead/=12;}
var sc=sm?Math.abs(dead-.35):0;
if(!best||sc<best.sc)best={M:M,sc:sc,dead:dead,t:t,nodes:r.nodes};
if(sc<.2)break;}
return best;}
function buildSafe(base,idx,seed,plan,opt){var b=build(base,idx,seed,plan,opt);if(b)return b;
var sm=plan.sm.slice();while(sm.length){sm.pop();b=build(base,idx,seed,{sm:sm,fl:plan.fl},opt);if(b){b.cut=1;return b;}}
var fl=plan.fl.filter(function(x){return x!=='volga'&&x!=='musor'&&x!=='mfirst'&&x!=='gaz';});b=build(base,idx,seed,{sm:[],fl:fl},opt);if(b)b.cut=2;return b;}
var PAIRS=[['taxi','wed'],['imp','quar'],['taxi','quar'],['wed','imp'],['taxi','imp'],['quar','wed']];
var FLAV=[['zap','mosk'],['mag','dark'],['kamaz','zap'],['buh','mosk'],['volga','mag'],['musor','dark'],['kamaz','buh'],['zap','volga']];
function planChars(idx,n){var r=Math.floor(idx/10),p=PAIRS[r%PAIRS.length].slice();if(n>44)p=p.slice(0,1);if(r<=1)p=['taxi'];return{sm:p,fl:['oka'].concat(FLAV[r%FLAV.length])};}
function storyOf(idx){var r=Math.floor(idx/10);if(idx>=60&&r%2===0)return'rep';return['wed','move','dacha','sub','orch'][(r-1+5)%5];}
function planStory(k){return k==='wed'?{sm:['wed'],fl:['oka']}:k==='move'?{sm:[],fl:['gaz','zap']}:k==='dacha'?{sm:['imp'],fl:['zap','oka']}:k==='sub'?{sm:[],fl:['mfirst']}:k==='orch'?{sm:[],fl:['note']}:null;}
var SPR=['zap','mosk','oka','mag','kamaz','dark','buh'];
var TOLR={moskvich:'mosk',oka:'oka',kamaz:'kamaz',musorovoz:'musor'};
function planTolik(pl,idx,tr){if(!tr||!tr.length||idx<13)return pl;var r=tr[Math.floor(idx/3)%tr.length];
if(pl){if(pl.fl.indexOf(r)>=0)return pl;var fl=pl.fl.slice(),k=fl[0]==='oka'&&fl.length>1?1:fl[0]==='oka'?-1:0;if(k<0)fl.push(r);else fl[k]=r;return{sm:pl.sm||[],fl:fl.slice(0,2),tl:r};}
if(((idx*2654435761>>>0)%7)%2===1)return{sm:[],fl:[r],tl:r};return null;}
function planSprinkle(idx){var h=(idx*2654435761>>>0)%7;if(idx<13||h>2)return null;return{sm:[],fl:[SPR[idx%SPR.length]].concat(h===0?[SPR[(idx+3)%SPR.length]]:[])};}
var TN=6,EXR=2;
function tgrid(cars,pos){var o=new Int8Array(TN*TN);fill(o,-1);for(var i=0;i<cars.length;i++){var c=cars[i],p=pos[i];for(var k=0;k<c.len;k++){var x=c.h?p+k:c.x,y=c.h?c.y:p+k;o[y*TN+x]=i;}}return o;}
function tmoves(cars,pos){var o=tgrid(cars,pos),out=[];for(var i=0;i<cars.length;i++){var c=cars[i],p=pos[i],s,x,y;
for(s=p-1;s>=0;s--){x=c.h?s:c.x;y=c.h?c.y:s;if(o[y*TN+x]!==-1)break;out.push([i,s]);}
for(s=p+1;s+c.len<=TN;s++){var e=s+c.len-1;x=c.h?e:c.x;y=c.h?c.y:e;if(o[y*TN+x]!==-1)break;out.push([i,s]);}}return out;}
function tsolved(pos){return pos[0]===TN-2;}
function MapS(){if(typeof Map==='function')return new Map();var o={};return{get:function(k){return o[k];},set:function(k,v){o[k]=v;},has:function(k){return k in o;}};}
function tanalyze(cars,start){var n=cars.length,P5=[],i,j;for(i=0,j=1;i<n;i++,j*=5)P5.push(j);
function enc(p){var c=0;for(var q=0;q<n;q++)c+=p[q]*P5[q];return c;}
var seen=MapS(),list=[start],Q=[start],qh=0;seen.set(enc(start),1);
while(qh<Q.length&&list.length<40000){var p=Q[qh++],mv=tmoves(cars,p),c0=enc(p);for(var m=0;m<mv.length;m++){var a=mv[m][0],k=c0+(mv[m][1]-p[a])*P5[a];if(!seen.has(k)){seen.set(k,1);var q=p.slice();q[a]=mv[m][1];list.push(q);Q.push(q);}}}
var dc=MapS(),Q2=[];list.forEach(function(p){if(tsolved(p)){dc.set(enc(p),0);Q2.push(p);}});
for(i=0;i<Q2.length;i++){var p2=Q2[i],c2=enc(p2),d=dc.get(c2),mv2=tmoves(cars,p2);for(var m2=0;m2<mv2.length;m2++){var a2=mv2[m2][0],k2=c2+(mv2[m2][1]-p2[a2])*P5[a2];if(seen.has(k2)&&!dc.has(k2)){dc.set(k2,d+1);var q2=p2.slice();q2[a2]=mv2[m2][1];Q2.push(q2);}}}
var A={n:list.length,list:list,Q2:Q2,dc:dc,enc:enc,_d:null};
A.mk=function(){if(!A._d){var o={};for(var t=0;t<Q2.length;t++)o[Q2[t].join(',')]=dc.get(enc(Q2[t]));A._d=o;}return A._d;};return A;}
function tightP(idx){var r=Math.floor(idx/10);var T=[{lo:3,hi:5,cars:6},{lo:3,hi:5,cars:6},{lo:5,hi:8,cars:8},{lo:7,hi:10,cars:9},{lo:8,hi:12,cars:10},{lo:10,hi:14,cars:11},{lo:11,hi:15,cars:11},{lo:12,hi:17,cars:12}];
return r>=8?{lo:14,hi:22,cars:12}:T[r];}
function tgen(P,seed){for(var t=0;t<400;t++){var R=rng(seed+t*7919),cars=[{x:0,y:EXR,len:2,h:true}],occ=new Int8Array(TN*TN);fill(occ,-1);occ[EXR*TN]=0;occ[EXR*TN+1]=0;
for(var a=0;a<200&&cars.length<P.cars;a++){var h=R()<.5,len=R()<.3?3:2,x=Math.floor(R()*(h?TN-len+1:TN)),y=Math.floor(R()*(h?TN:TN-len+1));if(h&&y===EXR)continue;
var ok=true,k;for(k=0;k<len;k++){var xx=h?x+k:x,yy=h?y:y+k;if(occ[yy*TN+xx]!==-1)ok=false;}if(!ok)continue;cars.push({x:x,y:y,len:len,h:h});for(k=0;k<len;k++)occ[(h?y:y+k)*TN+(h?x+k:x)]=cars.length-1;}
var start=cars.map(function(c){return c.h?c.x:c.y;}),A=tanalyze(cars,start),best=null,bd=-1,cand=[],qi,dd=[];
for(qi=0;qi<A.Q2.length;qi++){var d=A.dc.get(A.enc(A.Q2[qi]));dd.push(d);if(d>=P.lo&&d<=P.hi)cand.push(qi);if(d>bd){bd=d;best=qi;}}
var pick=null;if(P.hi>30){if(bd>=P.lo)pick=best;}else if(cand.length){var ck={};cand.forEach(function(x){ck[x]=A.Q2[x].join(',');});
cand.sort(function(a,b){return dd[b]-dd[a]||(ck[a]<ck[b]?-1:1);});pick=cand[Math.floor(R()*Math.min(cand.length,20))];}
if(pick==null)continue;
var pos=A.Q2[pick].slice();A.dist=A.mk();delete A.list;delete A.Q2;delete A.dc;delete A.mk;delete A.enc;
return{cars:cars,pos:pos,min:A.dist[pos.join(',')],A:A,t:t};}
return null;}
function tbest(cars,pos,A){var mv=tmoves(cars,pos),best=null,bd=1e9;for(var m=0;m<mv.length;m++){var q=pos.slice();q[mv[m][0]]=mv[m][1];var d=A.dist[q.join(',')];if(d!=null&&d<bd){bd=d;best=mv[m];}}return best?{i:best[0],to:best[1],d:bd}:null;}
var V3H={rng:rng,DIRS:DIRS,straight:straight,mk:mk,st0:st0,gone:gone,revOf:revOf,hd:hd,occOf:occOf,freeQ:freeQ,legal:legal,apply:apply,search:search,botRun:botRun,
closureM:closureM,assign:assign,build:build,buildSafe:buildSafe,planChars:planChars,planStory:planStory,planSprinkle:planSprinkle,planTolik:planTolik,TOLR:TOLR,storyOf:storyOf,SMART:SMART,
tightP:tightP,tgen:tgen,tmoves:tmoves,tsolved:tsolved,tbest:tbest,tgrid:tgrid,TN:TN,EXR:EXR};
if(typeof module!=='undefined'&&module.exports)module.exports=V3H;
else root.V3H=V3H;
})(typeof window!=='undefined'?window:this);
if(typeof window!=='undefined')(function(){
'use strict';
var WN=window,V=WN.V3H;
if(!WN.V3||!V3.on||!V||!WN.V3K)return;
function curG(){try{return G;}catch(e){return null;}}
function Lg(r,e){try{return L(r,e);}catch(x){return r;}}
function Sv(){try{return S;}catch(e){return null;}}
function is(k){try{return V3.is(k);}catch(e){return false;}}
function ev(o){try{STAT.ev('v3h',o);}catch(e){}}
function now(){return(WN.performance?performance.now():Date.now())/1000;}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function warn(w,e){try{console.warn('v3-carhar '+w,e);}catch(x){}}
function sayB(t,w){try{say(t,w||'bench');}catch(e){}}
function dayK(){try{return todayKey();}catch(e){return'';}}
function aliveV(v){return v.state==='idle'||v.state==='bump';}
var PARTS={chars:'Машины с характером',tight:'Тесный двор (босс)',story:'Происшествия',sprinkle:'Машины альбома в обычных дворах',goals:'Цели посреди двора',
finds:'Что под машиной?',whistle:'Свисток Шуры',pigeon:'Голубь-подсказка',bet:'Спорим с Шурой?',nb:'Пустить соседа?',ice:'Лужи',gai:'Гаишник в кустах',juice:'Сочность выезда',skip:'Пропустить двор'};
Object.keys(PARTS).forEach(function(k){try{V3.reg(k,{s:'CARHAR',t:PARTS[k]});}catch(e){}});
try{V3.field('v3h',{s:'CARHAR',def:function(){return{f:[],th:0,bd:'',nd:'',md:'',sk:{},tw:0};},
fix:function(v){if(!Array.isArray(v.f))v.f=[];v.f=v.f.filter(function(n){return typeof n==='number'&&n>=0&&n<200;}).slice(0,120);
v.th=+v.th||0;v.tw=+v.tw||0;['bd','nd','md'].forEach(function(k){if(typeof v[k]!=='string')v[k]='';});if(!v.sk||typeof v.sk!=='object'||Array.isArray(v.sk))v.sk={};return v;},
merge:function(a,b,newer){a=a||{};b=b||{};var o=newer?Object.assign({},a,b):Object.assign({},b,a),u={};(a.f||[]).concat(b.f||[]).forEach(function(n){u[n]=1;});
o.f=Object.keys(u).map(Number).slice(0,120);o.th=Math.max(+a.th||0,+b.th||0);o.tw=Math.max(+a.tw||0,+b.tw||0);o.sk=Object.assign({},b.sk||{},a.sk||{});return o;}});}catch(e){warn('field',e);}
function tolikRoles(){var o=[];try{if(WN.ALB&&ALB.yardCars)ALB.yardCars().forEach(function(id){var r=V.TOLR[id];if(r&&o.indexOf(r)<0)o.push(r);});}catch(e){}return o;}
function SH(){var s=Sv();if(s&&(!s.v3h||typeof s.v3h!=='object'))s.v3h={f:[],th:0,bd:'',nd:'',md:'',sk:{},tw:0};return s&&s.v3h;}
var RT={
taxi:{ic:'↺',bg:'#f6c431',fg:'#2d3436',vy:'taxi',c:'#f6c431',t:['🚕 Такси передумывает: после каждой уехавшей машины разворачивается. Лови, пока смотрит на свободную дорогу!','🚕 The taxi keeps changing its mind: it turns round after every car that leaves. Catch it while it faces a clear road!']},
wed:{bg:'#ff5a8a',fg:'#fff',vy:'pobeda',c:'#f6f8fc',t:['💍 Свадебный кортеж выезжает строго по номерам: 1, 2, 3.','💍 The wedding convoy leaves strictly in order: 1, 2, 3.']},
imp:{bg:'#ff8a3d',fg:'#fff',vy:'devyatka',t:['⏳ Нетерпеливый считает твои ходы и на нуле разворачивается.','⏳ The impatient one counts your moves and turns round at zero.']},
quar:{ic:'!',bg:'#d63031',fg:'#fff',vy:'niva',t:['💢 Поссорились: уехала одна — вторая обиделась и отвернулась.','💢 They’ve quarrelled: when one leaves, the other turns its back.']},
zap:{ic:'2',bg:'#fd79a8',fg:'#fff',vy:'zapor',t:['🔑 Запорожец заводится со второго касания.','🔑 The Zaporozhets starts on the second tap.']},
volga:{ic:'★',bg:'#2d3a5a',fg:'#ffd23f',vy:'volga',t:['⭐ Волга начальника выезжает последней.','⭐ The boss’s Volga leaves last.']},
musor:{ic:'М',bg:'#e67e22',fg:'#fff',vy:'musorovoz',t:['🗑 Мусоровоз уедет — и баки увезёт.','🗑 When the bin lorry leaves, the bins go too.']},
buh:{ic:'Б',bg:'#6ab04c',fg:'#fff',vy:'buhanka',t:['🌼 Буханке клумбы не помеха.','🌼 The Bukhanka drives right over flowerbeds.']},
mosk:{ic:'R',bg:'#7f8c8d',fg:'#fff',vy:'moskvich',t:['🔙 Москвич выезжает задом: смотри на стрелку, а не на фары.','🔙 The Moskvich reverses out: follow the arrow, not the headlights.']},
kamaz:{ic:'+1',bg:'#2e86de',fg:'#fff',vy:'kamaz',t:['🔗 КамАЗ-буксир утягивает того, кто стоит впритык сзади.','🔗 The KamAZ tows away whoever is parked right behind it.']},
oka:{ic:'Ш',bg:'#a29bfe',fg:'#fff',vy:'oka',t:['💜 «Ока» бабы Шуры не врезается: глохнет и ждёт чистой дороги.','💜 Granny Shura’s Oka never crashes: it stalls and waits for a clear road.']},
mag:{ic:'U',bg:'#c0392b',fg:'#fff',vy:'kopeyka',t:['🧲 Магнит на крыше: уезжая, тянет за собой свободных соседей.','🧲 A magnet on the roof: it pulls free neighbours along when it leaves.']},
dark:{ic:'?',bg:'#4b5320',fg:'#fff',c:'#6b705c',t:['❓ Тёмная лошадка под брезентом: куда смотрит — узнаешь, когда тронешь. Авария с ней — без ❤️.','❓ A dark horse under a tarp: you’ll see where it faces when you touch it. No ❤️ lost if it bumps.']},
gaz:{ic:'1',bg:'#27ae60',fg:'#fff',vy:'gazel',t:['📦 Переезд: сначала Газель с вещами! Убирай только тех, кто ей мешает.','📦 Moving day: the Gazelle with the furniture goes first! Move only the cars in its way.']}
};
function T2(a){return Lg(a[0],a[1]);}
var TX={
tolik:['Гляди-ка: из гаража Толика к нам во двор приехала машина — {car}! Как новенькая.','Look: the {car} from Tolik’s garage has pulled into our yard! Good as new.'],
zap:[['Чих-пых… Запорожец с первого раза не заводится. Как мой по утрам.','Cough, splutter… the Zaporozhets never starts first time. Just like mine in the mornings.'],['Заводится! Ещё разок — и поедет.','It’s catching! One more tap and off it goes.']],
wed:['Куда вперёд невесты?! Сначала номер ','Not ahead of the bride! Number '],wed2:[' ',' first!'],
volga:['Начальство выезжает последним! Порядок есть порядок.','The boss leaves last! Order is order.'],
gaz:['Сначала Газель! Остальные — только кто ей мешает.','The Gazelle first! Only move the cars in its way.'],
mus1:['Сначала мусоровоз! Остальные — только кто ему мешает.','The bin lorry first! Only move the cars in its way.'],
oka:['«Ока» заглохла. Ждёт чистой дороги — вся в меня.','The Oka has stalled. Waiting for a clear road — takes after me.'],
darkR:['Сняли брезент — теперь видно, куда смотрит.','Tarp off — now you can see which way it faces.'],
darkC:['Тёмная лошадка — она и есть тёмная. Не считается!','A dark horse is a dark horse. That one doesn’t count!'],
taxi:[['Такси развернулось — пассажир передумал.','The taxi turned round — the passenger changed his mind.'],['Опять развернулся. Ему бы в депутаты.','Turned again. He should go into politics.']],
imp:['Надоело ждать — развернулся! Нетерпеливый.','Fed up with waiting — turned round! Impatient.'],
quar:['Обиделась и отвернулась. Мириться будут вечером.','She’s offended and turned away. They’ll make up tonight.'],
musor:['Мусоровоз уехал — баков нет. Красота, хоть фотографируй.','The bin lorry’s gone — and the bins with it. Picture-perfect.'],
kamaz:['КамАЗ и соседа прихватил. Буксир!','The KamAZ took the neighbour along. A tow truck!'],
mag:['Магнит! Соседей за собой утянул.','The magnet! It pulled the neighbours along.'],
buh:['Буханка по клумбам… Я эти бархатцы с весны растила!','The Bukhanka over the flowerbeds… I grew those marigolds since spring!'],
mosk:['Москвич задом выехал — по-нашему!','The Moskvich reversed out — our way!'],
dead:['Тупик: так уже не разъехаться. Давай заново — теперь знаешь, где ловушка.','Dead end: nobody can get out now. Try again — now you know where the trap is.'],
chars:['Сегодня во дворе машины с характером. Присмотрись к значкам!','Cars with character in the yard today. Watch the badges!']
};
var STORY={
wed:{a:['Сегодня свадьба у Ивановых! Кортеж — строго по номерам, а то тёща обидится.','The Ivanovs’ wedding today! The convoy goes strictly by number, or the mother-in-law will sulk.'],b:['Горько! Кортеж уехал, Ивановы счастливы, я прослезилась.','Kiss the bride! The convoy’s off, the Ivanovs are happy, I shed a tear.']},
move:{a:['Петровы переезжают! Газель с вещами — первой. Остальные подождут, не баре.','The Petrovs are moving! The Gazelle with their things goes first. The rest can wait.'],b:['Газель уехала, шкаф цел. Петровы, пишите!','The Gazelle’s gone and the wardrobe survived. Petrovs, do write!']},
dacha:{a:['Мне на дачу к девяти, электричка ждать не будет! Каждое касание — минута. Не тяни.','I must be at the dacha by nine — the train won’t wait! Every tap is a minute. Hurry.'],b:['Успела! Рассада спасена.','Made it! The seedlings are saved.'],c:['Электричка ушла… Ничего, на следующей.','Missed the train… Never mind, there’s another.']},
sub:{a:['Субботник! Сначала мусоровоз — пусть баки увезёт. Освободи ему дорогу.','Clean-up day! The bin lorry goes first to take the bins. Clear its way.'],b:['Чистота! Хоть сейчас комиссию зови.','Spotless! Call the inspectors right now.']},
orch:{a:['Сегодня двор — оркестр. Каждый гудок — нота. Выпустишь по порядку номеров — заиграет «Во поле берёза стояла».','Today the yard is an orchestra. Every horn is a note. Let them out by number and a folk tune will play.'],b:['Вот это концерт! Михалыч аж прослезился.','What a concert! Mikhalych even shed a tear.'],c:['Ну, джаз тоже музыка.','Well, jazz is music too.']},
rep:{a:['Шура рулит хаосом: каждые три касания машины перекрашиваются! Колонна — того цвета, что сейчас.','Shura stirs things up: every three taps the cars change colour! The convoy follows the current colour.'],b:['Вот такая у нас палитра.','That’s our palette for you.']},
tight:{a:['Деду на рыбалку, а его Москвич заперли! Машины ездят только вперёд-назад — выпусти красный Москвич в арку справа.','Grandad’s off fishing, but his Moskvich is boxed in! Cars only move back and forth — get the red Moskvich out through the arch on the right.'],
r:[['Опять встали как попало. Профессионально встали: со всех сторон сразу.','Parked any old how again. Professionally: from every side at once.'],['Тут думать надо. Я так в шестьдесят третьем шкаф в хрущёвку заносила.','This needs thought. That’s how I got a wardrobe into a Khrushchev flat in ’63.'],['Ни одна машина не виновата, а выехать никто не может. Как на собрании жильцов.','No car is to blame, yet nobody can get out. Like a residents’ meeting.']],
b:['Ни одного лишнего движения! Тебе бы в ГАИ, пробки разводить.','Not one wasted move! You should direct traffic for a living.'],c:['Выпустили деда! Ходов многовато, зато рыба подождёт.','Grandad’s out! A few too many moves, but the fish will wait.'],
tip:['🔒 Тесный двор: машины ездят только вперёд-назад. Тяни пальцем или нажми у края машины. Выпусти красный Москвич деда в арку справа!','🔒 Tight yard: cars only slide back and forth. Drag them, or tap near a car’s end. Get Grandad’s red Moskvich out through the arch on the right!']}
};
var FINDS=[
['Ключи деда','Grandad’s keys','Дед их с весны ищет! Отнесу ему.','He’s been hunting for them since spring!'],
['Варежка','A mitten','Синяя, с оленем. Повешу на забор — хозяйка найдёт.','Blue, with a reindeer. I’ll hang it on the fence.'],
['Котёнок','A kitten','Пригрелся у мотора. На лавочку его, к Мурке.','Warming up by the engine. Off to the bench with Murka.'],
['Копейка 1961 года','A 1961 kopeck','Михалыч такие собирает — вот обрадуется.','Mikhalych collects these — he’ll be thrilled.'],
['Ключ на 13','A 13 mm spanner','Толика ключ. Он его третий год ищет.','Tolik’s spanner. He’s been looking for three years.'],
['Мячик','A ball','Митяев. Опять через забор зарядил.','Mityai’s. Kicked over the fence again.'],
['Очки','Glasses','Мои! А я думала, на лбу.','Mine! I thought they were on my forehead.'],
['Записка «Люблю»','A note: “I love you”','Без подписи. Весь подъезд гадать будет.','Unsigned. The whole block will be guessing.'],
['Пробка от лимонада','A lemonade cap','«Буратино». Детство прямо под колёсами.','“Buratino”. Childhood, right under the wheels.'],
['Шпилька','A hairpin','С бабочкой. Галина, узнаю.','With a butterfly. Galina’s, I’d know it anywhere.'],
['Солдатик','A toy soldier','Оловянный. Стоял на посту всю ночь.','Tin. Stood guard all night.'],
['Ракушка','A seashell','Кто-то с юга привёз. Приложишь — шумит морем.','Someone brought it from the south. Hold it up — you hear the sea.'],
['Билет в кино','A cinema ticket','«Бриллиантовая рука», ряд семь. Хорошее было кино.','“The Diamond Arm”, row seven. A fine film.'],
['Значок ГТО','A sports badge','Значит, кто-то во дворе бегал.','So someone in this yard used to run.'],
['Пуговица','A button','С пальто Михалыча. Пришью, пока не заметил.','Off Mikhalych’s coat. I’ll sew it back before he notices.'],
['Кассета','A cassette','Перемотаю карандашом — и на лавочку, слушать.','I’ll rewind it with a pencil and play it on the bench.'],
['Ёлочная игрушка','A Christmas bauble','В октябре! Значит, с прошлого года стоит.','In October! So that car’s been here since last year.'],
['Алюминиевая ложка','An aluminium spoon','Из столовой, видать, уехала.','Escaped from a canteen, by the look of it.'],
['Голубиное перо','A pigeon feather','Наш, сизый. Ему ещё летать и летать.','Our grey one’s. He’s plenty of flying left.'],
['Квитанция за свет','An electricity bill','Оплаченная. Хоть кто-то платит вовремя.','Paid. At least someone pays on time.'],
['Расчёска','A comb','Без двух зубьев. Как у всех приличных людей.','Missing two teeth. Like any respectable comb.'],
['Свисток','A whistle','Пригодится. Теперь я главная по двору со свистком.','Handy. Now I’m in charge — with a whistle.'],
['Ириска','A toffee','Не ешь с земли! Отдам Митяю.','Don’t eat it off the ground! I’ll give it to Mityai.'],
['Марка с космонавтом','A cosmonaut stamp','Дед обрадуется — у него такой нет.','Grandad will be pleased — he hasn’t got this one.'],
['Напёрсток','A thimble','Валентины Петровны. Она шьёт всему подъезду.','Valentina Petrovna’s. She sews for the whole block.'],
['Гайка','A nut','Толик скажет: «Это от чего-то важного».','Tolik will say: “That’s off something important.”'],
['Каштан','A conker','Блестящий. Осень пришла под машину.','Shiny. Autumn crept under the car.'],
['Фантик «Мишка на Севере»','A sweet wrapper','Значит, кто-то был счастлив.','So someone was happy here.'],
['Огрызок карандаша','A pencil stub','Им кроссворд и дорешаем.','We’ll finish the crossword with it.'],
['Колечко от банки','A ring pull','Не обручальное. А жаль.','Not a wedding ring. Pity.'],
['Пульт от телевизора','A TV remote','Вот почему у Петровых тишина третий день!','So that’s why the Petrovs have been so quiet!'],
['Брошка','A brooch','Чья-то мамина. Повешу объявление.','Somebody’s mum’s. I’ll put up a notice.'],
['Шахматная пешка','A chess pawn','Белая. Михалыч скажет, что проиграл не из-за неё.','White. Mikhalych will say he didn’t lose because of it.'],
['Ключ от почтового ящика','A mailbox key','Номер 47. Это же мой! Нет, мой 48.','Number 47. That’s mine! No, mine is 48.'],
['Перчатка','A glove','Правая. Левую найдём под соседней.','The right one. We’ll find the left under the next car.'],
['Свадебная фотография','A wedding photo','Тысяча девятьсот семьдесят девятый. Какие все молодые!','Nineteen seventy-nine. How young everyone looks!'],
['Клубок ниток','A ball of yarn','Мурка укатила. Будет шарф.','Murka rolled it away. It’ll be a scarf.'],
['Резинка с клубничкой','A strawberry hair tie','Внучка Петровны обрадуется.','Petrovna’s granddaughter will be delighted.'],
['Открытка «С 8 Марта»','A Women’s Day card','Опоздала на полгода, но всё равно приятно.','Six months late, but still lovely.'],
['Хоккейная шайба','A hockey puck','Зимой зальём каток — пригодится.','We’ll flood a rink this winter — just the thing.']
];
var GOALS={
win:{a:['Из окна кричат: «Сначала мою, с флажком! У меня торт в багажнике!»','Someone shouts from a window: “Mine first — the one with the flag! There’s a cake in the boot!”'],b:['«Спасибо, сынок!» — и торт цел.','“Thank you, dear!” — and the cake’s fine.'],c:['«Ну вот, торт растаял…» Ничего, в другой раз.','“Oh, the cake’s melted…” Never mind, next time.']},
kit:{a:['Под машиной с флажком котёнок! Выпусти её раньше соседок — а то спугнёшь.','There’s a kitten under the car with the flag! Get it out before its neighbours, or you’ll scare it.'],b:['Котёнок вылез — и прямо на лавочку. Мурка, принимай.','The kitten crawled out and onto the bench. Murka, he’s yours.'],c:['Котёнок испугался и убежал. Ничего, к обеду вернётся.','The kitten got scared and ran off. He’ll be back by lunch.']},
amb:{a:['Скорая едет к третьему подъезду! Выпусти машину с флажком поскорее.','An ambulance is coming to entrance three! Get the car with the flag out quickly.'],b:['Успели! Скорая проехала. Вот это двор.','Just in time! The ambulance got through. What a yard.'],c:['Скорая объехала через соседний двор. Ну хоть так.','The ambulance went round through the next yard. Well, at least that.']}
};
var MIH=['Михалыч метлой показывает: «Вот эта свободна!»','Mikhalych points with his broom: “That one’s free!”'];
var PIG=[[['Женщина из телефона: «Через двадцать метров поверните направо».','The phone lady: “In twenty metres, turn right.”'],['Какое направо, там клумба! Голубь лучше знает.','Right? There’s a flowerbed! The pigeon knows better.']],
[['Женщина из телефона: «Маршрут перестроен».','The phone lady: “Recalculating route.”'],['Перестроен… Я этот двор сорок лет без маршрута вожу.','Recalculating… I’ve run this yard for forty years without a route.']],
[['Женщина из телефона: «Вы прибыли».','The phone lady: “You have arrived.”'],['Прибыли — так уезжайте! Голубь вон куда сел.','Arrived? Then leave! Look where the pigeon landed.']]];
function baseOf(g){var w=g.p.w,cars=g.vs.map(function(v){return{c:v.cells.map(function(p){return p.slice();}),d:v.dir};}),o=g.occ.slice(),hz=[],i;
for(i=0;i<o.length;i++)if(o[i]>=0||o[i]===-4)o[i]=-1;
try{var s0=WN.LVLH&&LVLH.state();if(s0&&s0.hz&&s0.g===g)hz=s0.hz.cells.map(function(c){return{k:c[0],n:c[1],key:s0.hz.key};});}catch(e){}
var skip={};g.vs.forEach(function(v){if(v.kind||v.own||v.noArrow)skip[v.id]=1;});return{w:w,h:g.p.h,cars:cars,occ0:o,skip:skip,hz:hz};}
function mkH(g,idx,kind){return{kind:kind,idx:idx,M:null,S:null,rv:{},dk:{},al:null,t0:now(),wh:{on:0,used:0},j:{lc:'',ln:0,tt:[],gai:0,m5:0,m50:0},cr:0};}
function rules(H){var M=H.M,o={};if(!M)return o;M.role.forEach(function(r){if(r)o[r]=1;});return o;}
function hasDeadRule(H){var M=H.M;if(!M)return false;for(var i=0;i<M.n;i++){var r=M.role[i];if((r==='taxi'||r==='imp'||r==='quar')&&H.S.al[i])return true;}return false;}
function lockVy(v,r,keep){v.v3hr=r;try{delete v.vy;Object.defineProperty(v,'vy',{get:function(){return keep;},set:function(){},configurable:true,enumerable:true});}catch(e){}}
function look(g,H){var M=H.M;if(!M)return;for(var i=0;i<M.n;i++){var r=M.role[i],v=g.vs[i],t=RT[r];if(!t||!v)continue;
var vy0=t.vy&&(v.L===2||(r==='musor'||r==='buh'||r==='gaz')&&v.L===3||r==='kamaz'&&v.L>=3)?t.vy:undefined;
lockVy(v,r,vy0);
if(t.c)try{tint(v,t.c);}catch(e){}
if(r==='dark')v.noArrow=true;if(r==='mosk')v.v3back=1;if(r==='buh')v.v3buh=1;}
if(M.mu>=0)M.bins.forEach(function(k){if(g.occ[k]===-1)g.occ[k]=-6;});
try{carsKey='';}catch(e){}}
function begin(g,lv,idx,seed,daily,o){g.v3h=null;g.v3pg=null;if(daily||o||WN.__demo)return;
var k=V3K.kindOf?V3K.kindOf(idx):'',H=null;
if(k==='tight'){if(idx>=19&&is('tight'))H=beginTight(g,idx,seed);}
else if(k==='chars'){if(is('chars'))H=beginRoles(g,idx,seed,'chars',V.planChars(idx,g.vs.length));}
else if(k==='story'){if(is('story')){var s=V.storyOf(idx);H=s==='rep'?beginRep(g,idx,seed):beginRoles(g,idx,seed,'story',V.planStory(s));if(H)H.story=s;}}
else if(!k&&idx>=5&&!g.soft){H=mkH(g,idx,'');var pl=is('sprinkle')?V.planSprinkle(idx):null;if(is('sprinkle'))try{pl=V.planTolik(pl,idx,tolikRoles());}catch(e){warn('tolik',e);}
if(pl){var b=V.buildSafe(baseOf(g),idx,seed,pl,{tries:3});if(b){H.M=b.M;H.S=V.st0(b.M);if(pl.tl&&b.M.role.indexOf(pl.tl)>=0)H.tl=pl.tl;}}}
if(!H)return;
if(!H.M){H.M=V.mk(g.p.w,g.p.h,g.vs.map(function(v){return{c:v.cells,d:v.dir};}),null,{});H.S=V.st0(H.M);}
g.v3h=H;H.al=new Uint8Array(g.vs.length);for(var i=0;i<g.vs.length;i++)H.al[i]=1;
if(H.kind){g.v3k=g.v3k||{kind:H.kind,h:1};if(g.amb)g.amb.done=true;}
look(g,H);
if(!H.tight){extras(g,H,idx,seed);}
if(whOk(g,H)&&!H.wh.on&&WN.V3P&&V3P.take&&V3P.take('wc'))H.wh.on=1;
if(H.story==='dacha')H.norm=g.vs.length+(H.M.zi>=0?1:0);
ev({a:'start',k:H.kind||'n',s:H.story||'',i:idx+1,r:Object.keys(rules(H)).join(','),n:g.vs.length,tl:H.tl||''});
setTimeout(function(){try{intro(g,H);}catch(e){warn('intro',e);}},0);}
function beginRoles(g,idx,seed,kind,plan){if(!plan)return null;var t0=Date.now(),b=V.buildSafe(baseOf(g),idx,seed,plan);if(!b)return null;
var H=mkH(g,idx,kind);H.M=b.M;H.S=V.st0(b.M);H.ms=Date.now()-t0;H.cut=b.cut||0;return H;}
function beginRep(g,idx,seed){try{var F=V3K.fieldOfG(g),skip={};g.vs.forEach(function(v){if(v.kind||v.own)skip[v.id]=1;});var Ly=V3K.build('column',F,idx,seed,skip);if(!Ly)return null;
if(g.amb)g.amb.done=true;g.v3k={kind:'column',L:Ly,st:{taps:0},born:[],fx:[],t0:now(),bought:0,rep:1};
g.vs.forEach(function(v,i){var c=Ly.col[i];if(c>=0)tint(v,V3K.CFG.pal[c]);});var H=mkH(g,idx,'');H.rep=1;return H;}catch(e){warn('rep',e);return null;}}
function beginTight(g,idx,seed){var P=V.tightP(idx),t0=Date.now(),r=V.tgen(P,seed*61+idx*19+11);if(!r)return null;
var H=mkH(g,idx,'tight');H.tight={cars:r.cars,pos:r.pos,min:r.min,A:r.A,mv:0,hist:[],drag:null,anim:null,out:0,done:0,vh:{},ms:Date.now()-t0};
try{var b=document.getElementById('gTow');if(b)b.style.display='none';}catch(e){}
try{cam.z=1;cam.x=cam.y=0;cam.tw=null;}catch(e){}
return H;}
function extras(g,H,idx,seed){var R=V.rng(seed*29+idx*13+5),M=H.M,w=g.p.w,i;
var plain=[];for(i=0;i<g.vs.length;i++){var v=g.vs[i];if(!v.kind&&!v.own&&!(M&&M.role[i]))plain.push(i);}
if(is('finds')&&idx>=6&&plain.length&&(((idx*2246822519)>>>0)%3!==1||idx<12)){H.find={car:plain[Math.floor(R()*plain.length)],cell:-1,got:0,it:pickFind(idx)};}
if(is('goals')&&!H.kind&&!H.rep&&idx>=13&&((idx*3266489917)>>>0)%3===0){var cl=[];
for(i=0;i<plain.length;i++){var n=Object.keys(V.closureM(M,plain[i])).length;if(n>=2&&n<=6)cl.push([plain[i],n]);}
if(cl.length){var pk=cl[Math.floor(R()*cl.length)],ty=['win','kit','amb'][Math.floor(idx/3)%3];H.goal={ty:ty,t:pk[0],left:pk[1]+3,st:0,nb:M.nb[pk[0]].slice()};}}
if(is('ice')&&!H.kind&&idx>=30&&idx%9===2){var cells={};g.vs.forEach(function(v){var D=V.DIRS[v.dir];for(var x=v.cells[0][0]+D[0],y=v.cells[0][1]+D[1];x>=0&&y>=0&&x<w&&y<g.p.h;x+=D[0],y+=D[1])if(g.occ[y*w+x]===-1)cells[y*w+x]=1;});
var ks=Object.keys(cells).map(Number);H.ice=[];for(i=0;i<2&&ks.length;i++){var j=Math.floor(R()*ks.length);H.ice.push(ks[j]);ks.splice(j,1);}}
var s=SH(),dk=dayK();
if(!H.kind&&!H.rep&&idx>=20&&s&&dk){var odd=(+dk)%2;
if(odd===0&&is('bet')&&s.bd!==dk&&(S.coins||0)>=20)H.offer='bet';else if(odd===1&&is('nb')&&s.nd!==dk&&idx>=25)H.offer='nb';}}
function pickFind(idx){var s=SH(),have={};(s&&s.f||[]).forEach(function(n){have[n]=1;});
if(idx>=20&&!have[0])return 0;var free=[];for(var i=1;i<FINDS.length;i++)if(!have[i])free.push(i);
if(!free.length)return 1+(idx*7)%(FINDS.length-1);return free[(idx*7)%free.length];}
function showTip(txt,key){var s=Sv(),tip=document.getElementById('tip');if(!tip||!s)return false;if(tip.style.display==='block')return false;
tip.textContent=txt;tip.style.display='block';try{TIPM={k:key,z:0,t0:Date.now()};tipAutoHide();}catch(e){}return true;}
var tlSaid=0;function tlName(r){var id='';for(var k in V.TOLR)if(V.TOLR[k]===r)id=k;try{if(WN.ALB&&ALB.nm)return ALB.nm(id);}catch(e){}return id;}
function intro(g,H){if(curG()!==g||g.over)return;var s=Sv();if(!s)return;if(!s.tipSeen)s.tipSeen={};
if(H.tight){var first=!s.tipSeen.v3tight;if(first){s.tipSeen.v3tight=1;try{save();}catch(e){}showTip(T2(STORY.tight.tip),'v3tight');}
setTimeout(function(){if(curG()===g&&!g.over)sayB(first?T2(STORY.tight.a):T2(rnd(STORY.tight.r)));},900);return;}
var M=H.M,nw=[],seen={};if(M)M.role.forEach(function(r){if(r&&RT[r]&&!seen[r]){seen[r]=1;if(!s.tipSeen['v3c_'+r])nw.push(r);}});
if(nw.length){var txt=nw.slice(0,3).map(function(r){return T2(RT[r].t);}).join(' ');if(showTip(txt,'v3c_'+nw[0]))nw.slice(0,3).forEach(function(r){s.tipSeen['v3c_'+r]=1;});try{save();}catch(e){}}
var line=H.story&&STORY[H.story]?T2(STORY[H.story].a):H.kind==='chars'?T2(TX.chars):H.goal?T2(GOALS[H.goal.ty].a):'';
if(!line&&H.tl&&!tlSaid){tlSaid=1;line=T2(TX.tolik).replace('{car}',tlName(H.tl));}
if(line)setTimeout(function(){if(curG()===g&&!g.over)sayB(line,H.goal&&!H.story&&!H.kind?'win':'bench');},nw.length?1400:700);
if(H.offer)setTimeout(function(){offer(g,H);},line?2600:900);}
function offer(g,H){if(curG()!==g||g.over||g.moves||(typeof modalOn!=='undefined'&&modalOn))return;var s=SH(),dk=dayK();if(!s)return;
if(H.offer==='bet'){s.bd=dk;try{save();}catch(e){}
modal(shura(Lg('Спорим, пройдёшь этот двор без единой аварии? Ставлю 10 💰 против твоих 10.','Bet you can’t clear this yard without a single crash? My 10 💰 against your 10.'),'')+
'<div class="row"><button class="btn green noenter" id="v3bY">🤝 '+Lg('Спорим!','You’re on!')+'</button><button class="btn" id="v3bN">'+Lg('Не сейчас','Not now')+'</button></div>');
document.getElementById('v3bY').onclick=function(){if((S.coins||0)>=10){S.coins-=10;H.bet=1;try{save();updCoins();}catch(e){}ev({a:'bet',r:'on',i:g.idx+1});}hideModal();};
document.getElementById('v3bN').onclick=function(){ev({a:'bet',r:'no',i:g.idx+1});hideModal();};}
else if(H.offer==='nb'){s.nd=dk;try{save();}catch(e){}
modal(shura(Lg('Сосед с пятого просится заехать на минутку. Пустить? Выпустишь и его — угостит.','The neighbour from flat five wants to pop in for a minute. Let him? Get him out too and he’ll treat you.'),'')+
'<div class="row"><button class="btn green noenter" id="v3nY">🚗 '+Lg('Пустить','Let him in')+'</button><button class="btn" id="v3nN">'+Lg('Не сейчас','Not now')+'</button></div>');
document.getElementById('v3nY').onclick=function(){H.nb={after:3,in:0};ev({a:'nb',r:'on',i:g.idx+1});hideModal();};
document.getElementById('v3nN').onclick=function(){ev({a:'nb',r:'no',i:g.idx+1});hideModal();};}}
function nbArrive(g,H){var w=g.p.w,h=g.p.h,occ=g.occ,rays={};
g.vs.forEach(function(v){if(v.state!=='idle')return;var D=V.DIRS[v.dir];for(var x=v.cells[0][0]+D[0],y=v.cells[0][1]+D[1];x>=0&&y>=0&&x<w&&y<h;x+=D[0],y+=D[1])rays[y*w+x]=1;});
var opts=[];for(var y=0;y<h;y++)for(var x=0;x<w;x++)for(var d=0;d<4;d++){var D=V.DIRS[d],hx=x,hy=y,tx=x-D[0],ty=y-D[1];if(tx<0||ty<0||tx>=w||ty>=h)continue;
var a=hy*w+hx,b=ty*w+tx;if(occ[a]!==-1||occ[b]!==-1||rays[a]||rays[b])continue;var ok=true;for(var qx=hx+D[0],qy=hy+D[1];qx>=0&&qy>=0&&qx<w&&qy<h;qx+=D[0],qy+=D[1])if(occ[qy*w+qx]!==-1){ok=false;break;}
if(ok)opts.push([[[hx,hy],[tx,ty]],d]);}
if(!opts.length)return;var o=opts[Math.floor(Math.random()*opts.length)],id=g.vs.length;
try{var v=makeVehicle(o[0],o[1],'#8e7cc3',w,h,'');Object.assign(v,{id:id,s:0,state:'idle',t:0,ap:0,apT:0,apD:.05,v3nb:1});tint(v,'#8e7cc3');g.vs.push(v);
o[0].forEach(function(c){occ[c[1]*w+c[0]]=id;});H.nb.in=1;var a2=new Uint8Array(g.vs.length);a2.set(H.al);a2[id]=1;H.al=a2;carsKey='';updHud();
sayB(Lg('Сосед заехал «на минутку». Выпусти и его!','The neighbour popped in “for a minute”. Get him out too!'),'win');}catch(e){warn('nb',e);}}
function carAt(g,px,py){var cx=Math.floor((px-ox)/cs),cy=Math.floor((py-oy)/cs),w=g.p.w,h=g.p.h,id=cx<0||cy<0||cx>=w||cy>=h?-1:g.occ[cy*w+cx];if(id===-1)try{id=nearCar(px,py);}catch(e){}return id;}
function pop(g,v,txt){try{var p=toPx(trackPt(v.track,v.s+(v.L-1)/2));g.parts.push({txt:txt,x:p[0],y:p[1]-cs*.4,vx:0,vy:-cs*.9,life:.9,max:.9});}catch(e){}}
function bumpV(v){v.state='bump';v.t=0;v.k=0;v.block=-1;v.hit=false;try{SND.horn();}catch(e){}}
function preRole(g,H,v){var M=H.M,id=v.id,ro=id<M.n?M.role[id]:'',Sx=H.S,j;
if(M.first>=0&&Sx.al[M.first]&&id!==M.first&&!M.fcl[id]&&ro!=='zap'){sayB(T2(M.role[M.first]==='musor'?TX.mus1:TX.gaz));try{SND.tap();}catch(e){}v.flash=.6;return true;}
if(!ro)return false;
if(ro==='zap'&&!Sx.z){g.moves++;g.idle=0;Sx.z=1;Sx.mv++;H.dirty=1;pop(g,v,Lg('чих-пых','splutter'));g.shake=2;try{tone('sawtooth',70,110,.25,.04);}catch(e){}sayB(T2(TX.zap[0]));v.flash=.4;sync(g,H);return true;}
if(ro==='wed'){var need=99;for(j=0;j<M.n;j++)if(Sx.al[j]&&M.role[j]==='wed')need=Math.min(need,M.wn[j]);
if(M.wn[id]!==need){g.moves++;g.idle=0;bumpV(v);sayB(T2(TX.wed)+need+T2(TX.wed2));return true;}}
if(ro==='volga'){for(j=0;j<g.vs.length;j++)if(j!==id&&aliveV(g.vs[j])){sayB(T2(TX.volga));try{SND.tap();}catch(e){}v.flash=.6;return true;}}
if(ro==='oka'&&!canExit(v,g.occ,g.p.w,g.p.h,id).free){g.moves++;g.idle=0;pop(g,v,'…');try{tone('sine',300,180,.2,.03);}catch(e){}sayB(T2(TX.oka));return true;}
if(ro==='dark'&&!H.dk[id]){H.dk[id]=1;v.noArrow=false;v.v3soft=1;try{carsKey='';}catch(e){}pop(g,v,'!');sayB(T2(TX.darkR));}
return false;}
function hornFor(v){var L0=v.L||2,id=v.vy||'';return function(){try{if(id==='oka'){tone('square',640,640,.06,.035);setTimeout(function(){tone('square',640,640,.06,.035);},90);return;}
if(id==='zapor'){tone('square',380,360,.08,.04);setTimeout(function(){tone('square',380,360,.08,.04);},120);setTimeout(function(){tone('square',380,360,.08,.03);},240);return;}
var f=L0>=4?150:L0===3?260:420;tone('square',f,f,.09,.04);setTimeout(function(){tone('square',f,f,.12,.04);},130);}catch(e){}};}
var T0=WN.tapAt;
WN.tapAt=function(px,py){var g=curG(),H=g&&g.v3h;if(!H||g.over)return T0.apply(this,arguments);
if(H.tight)return;
try{if(whHit(g,H,px,py))return;if(findHit(g,H,px,py))return;}catch(e){warn('hit',e);}
if(g.towMode)return T0.apply(this,arguments);
var id=carAt(g,px,py);if(id<0||id>=g.vs.length)return T0.apply(this,arguments);
var v=g.vs[id];if(v.state!=='idle')return T0.apply(this,arguments);
try{if(preRole(g,H,v))return;}catch(e){warn('role',e);}
var h0=null;try{if(is('juice')&&WN.SND){h0=SND.horn;SND.horn=hornFor(v);}}catch(e){}
try{T0.apply(this,arguments);}finally{if(h0)SND.horn=h0;}
if(v.state==='exit'){H.S.mv++;H.dirty=1;H.j.tt.push(now());}
try{sync(g,H);}catch(e){warn('sync',e);}};
var C0=WN.crash;
WN.crash=function(v){var g=curG(),H=g&&g.v3h;if(H&&v&&v.v3soft){v.v3soft=0;g.shake=3;try{SND.tap();}catch(e){}sayB(T2(TX.darkC));return;}
if(H&&v){var r0=C0.apply(this,arguments);if(g.crashes>(H.cr||0)){H.cr=g.crashes;H.wh.on=0;}return r0;}
return C0.apply(this,arguments);};
if(typeof WN.tow==='function'){var TW0=WN.tow;WN.tow=function(v){var r=TW0.apply(this,arguments),g=curG(),H=g&&g.v3h;if(H)try{sync(g,H);}catch(e){}return r;};}
function sync(g,H){var n=g.vs.length,i,ch=false;
if(!H.al||H.al.length!==n){var a=new Uint8Array(n);for(i=0;i<n;i++)a[i]=H.al&&i<H.al.length?H.al[i]:1;H.al=a;}
for(i=0;i<n;i++){var v=g.vs[i],a1=aliveV(v)?1:0;if(a1!==H.al[i]){H.al[i]=a1;if(!a1){ch=true;if(H.M&&i<H.M.n)H.S.al[i]=0;try{onGone(g,H,v);}catch(e){warn('gone',e);}}}}
if(ch||H.dirty){H.dirty=0;afterChange(g,H);}else if(H.flipPend)flips(g,H);}
function towAway(g,u){var w=g.p.w;u.cells.forEach(function(c){if(g.occ[c[1]*w+c[0]]===u.id)g.occ[c[1]*w+c[0]]=-1;});try{if(g.hz&&WN.LVLH)LVLH.onExit(u);}catch(e){}u.state='tow';u.t=0;}
function onGone(g,H,v){var M=H.M,id=v.id,ro=M&&id<M.n?M.role[id]:'',w=g.p.w;
if(ro==='kamaz'){var j=M.tow[id],u=g.vs[j];if(u&&u.state==='idle'){towAway(g,u);H.al[j]=0;H.S.al[j]=0;sayB(T2(TX.kamaz),'win');}}
if(ro==='mag'){var k=0;M.nb[id].forEach(function(j2){var u2=g.vs[j2];if(!u2||u2.state!=='idle'||M.role[j2])return;var r=canExit(u2,g.occ,w,g.p.h,j2);if(r.free){startExit(u2,r,.14*(++k));}});if(k)sayB(T2(TX.mag),'win');}
if(ro==='musor'){for(var q=0;q<g.occ.length;q++)if(g.occ[q]===-6)g.occ[q]=-1;sayB(T2(TX.musor),'win');}
if(ro==='mosk'&&Math.random()<.4)sayB(T2(TX.mosk));
if(ro==='buh'&&Math.random()<.6)sayB(T2(TX.buh));
if(H.find&&H.find.car===id&&H.find.cell<0){var c=v.cells[Math.floor((v.L-1)/2)];H.find.cell=c[1]*w+c[0];H.find.t=now();
var s=Sv();if(s&&s.tipSeen&&!s.tipSeen.v3find){s.tipSeen.v3find=1;try{save();}catch(e){}try{toast(Lg('🔎 Под машиной что-то лежит — тронь!','🔎 Something was under that car — tap it!'),3000);}catch(e){}}}
if(H.goal&&!H.goal.st){var G2=H.goal;if(id===G2.t){G2.st=1;goalEnd(g,H,true);}else if(G2.ty==='kit'&&G2.nb.indexOf(id)>=0){G2.st=-1;goalEnd(g,H,false);}}
if(H.ice&&v.track){for(var t=0;t<H.ice.length;t++){var ic=H.ice[t],cx=ic%w,cy=Math.floor(ic/w),D=V.DIRS[v.dir],hx=v.cells[0][0],hy=v.cells[0][1];
if((D[0]&&cy===hy&&(cx-hx)*D[0]>0)||(D[1]&&cx===hx&&(cy-hy)*D[1]>0)){splash(g,ic);if(Math.random()<.3)sayB(Lg('Ой, по луже! Брызги до второго этажа.','Splash! Right up to the first floor.'));break;}}}
if(whOk(g,H)&&!H.wh.on&&(g.combo||0)>=6){H.wh.on=1;var s2=Sv();if(s2&&s2.tipSeen&&!s2.tipSeen.v3wh){s2.tipSeen.v3wh=1;try{save();toast(Lg('📣 Свисток Шуры заряжен — нажми его, и все свободные разъедутся!','📣 Shura’s whistle is charged — tap it and every free car drives off!'),3500);}catch(e){}}}
juice(g,H,v);
if(H.nb&&!H.nb.in&&!v.v3nb){H.nb.after--;if(H.nb.after<=0)nbArrive(g,H);}}
function afterChange(g,H){flips(g,H);if(!g.over&&hasDeadRule(H)){var r=V.search(H.M,H.S,12000);if(r.ok===false&&!g.over){g.v3dead=2;g.over=true;sayB(T2(TX.dead));ev({a:'dead',i:g.idx+1,k:H.kind||'n'});try{loseLater(1300);}catch(e){}}}
if(H.goal&&!H.goal.st&&H.goal.ty!=='kit'){H.goal.left=Math.max(0,H.goal.left);}
if(H.goal&&!H.goal.st&&H.dirtyMv!==H.S.mv){H.dirtyMv=H.S.mv;if(H.goal.ty!=='kit'){H.goal.left--;if(H.goal.left<=0){H.goal.st=-1;goalEnd(g,H,false);}}}}
function goalEnd(g,H,ok){var G2=H.goal,T=GOALS[G2.ty];setTimeout(function(){if(curG()===g)sayB(T2(ok?T.b:T.c),'win');},300);
if(ok){var s=SH();if(s){s.th=(s.th||0)+1;try{save();}catch(e){}}if(G2.ty==='amb')try{SND.siren();toast(Lg('🚑 Скорая проехала!','🚑 The ambulance got through!'));}catch(e){}}
ev({a:'goal',k:G2.ty,ok:ok?1:0,i:g.idx+1});}
function flipVeh(g,v){v.cells=v.cells.slice().reverse();v.dir=(v.dir+2)%4;v.track=buildTrack(v,g.p.w,g.p.h);v.bend=0;v.s=0;v.flash=.5;try{carsKey='';}catch(e){}pop(g,v,'↺');try{SND.tap();}catch(e){}}
function flips(g,H){var M=H.M,pend=0;if(!M)return;for(var i=0;i<M.n;i++){var ro=M.role[i];if(ro!=='taxi'&&ro!=='imp'&&ro!=='quar')continue;var v=g.vs[i];if(!aliveV(v))continue;
var want=V.revOf(M,H.S,i);if(want!==!!H.rv[i]){if(v.state!=='idle'){pend=1;continue;}flipVeh(g,v);H.rv[i]=want;
if(Math.random()<.4)sayB(T2(ro==='taxi'?rnd(TX.taxi):ro==='imp'?TX.imp:TX.quar));}}
H.flipPend=pend;}
function splash(g,ic){var w=g.p.w;try{var p=toPx([ic%w,Math.floor(ic/w)]);for(var i=0;i<12;i++){var a=Math.random()*6.28,sp=30+Math.random()*60;g.parts.push({x:p[0],y:p[1],vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-30,r:cs*.06,life:.5,max:.5,c:'rgba(120,190,255,',star:true});}}catch(e){}}
function juice(g,H,v){if(!is('juice')&&!is('gai'))return;var J=H.j,t=now();
if(is('juice')){if(g.combo>=8&&!J.m5){J.m5=1;try{[523,659,784,1047,1319].forEach(function(f,i){setTimeout(function(){tone('triangle',f,f,.16,.05);},i*90);});}catch(e){}sayB(Lg('Восемь подряд — как по нотам!','Eight in a row — like clockwork!'),'win');}
var c=v.dc||v.color||'';if(c&&c===J.lc)J.ln++;else{J.lc=c;J.ln=1;}
if(J.ln>=5&&!J.m50){J.m50=1;try{toast(Lg('💍 Свадебный кортеж!','💍 A wedding convoy!'));var p=toPx(trackPt(v.track,v.s));for(var i=0;i<40;i++){var a=-Math.PI/2+(Math.random()-.5)*2;g.parts.push({x:p[0],y:p[1],vx:Math.cos(a)*200,vy:Math.sin(a)*200,r:cs*.07,life:1.2,max:1.2,c:i%2?'#ffffff':'#ff9ff3',conf:true,rot:0,vr:6});}}catch(e){}
sayB(Lg('Пять одного цвета подряд — прямо свадьба! Рис кидать?','Five of one colour in a row — a proper wedding! Shall I throw rice?'),'bench');}}
if(is('gai')&&g.idx>=15&&!J.gai){J.tt=J.tt.filter(function(x){return t-x<1.6;});if(J.tt.length>=3){J.gai=1;try{tone('sine',2600,2400,.25,.05);setTimeout(function(){tone('sine',2600,2400,.35,.05);},300);toast(Lg('🚔 Гаишник в кустах: «Превышаете!»','🚔 A traffic cop in the bushes: “Speeding!”'));}catch(e){}
setTimeout(function(){if(curG()===g)sayB(Lg('Это внук Петровны, практикуется. Езжай, сынок, езжай.','That’s Petrovna’s grandson, practising. Drive on, dear.'));},900);ev({a:'gai',i:g.idx+1});}}}
function whPos(g){var y=Math.min(H_()-34,oy+g.p.h*cs+36);return[Math.max(30,ox+cs*.6),Math.max(60,y)];}
function H_(){try{return H;}catch(e){return 600;}}
function whOk(g,H){return is('whistle')&&!H.kind&&!H.rep&&g.idx>=13&&!g.over&&!H.wh.used&&!(g.v3k);}
function whHit(g,H,px,py){if(!H.wh.on||!whOk(g,H))return false;var p=whPos(g),X=px*cam.z+cam.x,Y=py*cam.z+cam.y;if(Math.hypot(X-p[0],Y-p[1])>30)return false;
H.wh.on=0;H.wh.used=1;g.moves++;var w=g.p.w,k=0;g.vs.forEach(function(u){if(u.state!=='idle'||u.kind)return;var r=canExit(u,g.occ,w,g.p.h,u.id);if(r.free)startExit(u,r,.12*(++k));});
try{for(var i=0;i<3;i++)setTimeout(function(){tone('sine',2300,2100,.12,.05);},i*140);}catch(e){}sayB(Lg('Разъезжайтесь! Все, кому свободно, — марш!','Off you go! Everyone with a clear road — move!'));
ev({a:'wh',i:g.idx+1,n:k});sync(g,H);return true;}
function findHit(g,H,px,py){var F=H.find;if(!F||F.got||F.cell<0)return false;var w=g.p.w,x=(F.cell%w+.5)*cs+ox,y=(Math.floor(F.cell/w)+.5)*cs+oy;if(Math.hypot(px-x,py-y)>cs*.7)return false;
if(g.occ[F.cell]>=0)return false;collect(g,H,1);return true;}
function collect(g,H,tap){var F=H.find;if(!F||F.got)return;F.got=1;var s=SH();if(s&&s.f.indexOf(F.it)<0)s.f.push(F.it);try{save();}catch(e){}
var it=FINDS[F.it];if(tap){try{SND.coin();toast('🔎 '+Lg('Под машиной: ','Under the car: ')+Lg(it[0],it[1]),2600);}catch(e){}setTimeout(function(){if(curG()===g&&!g.over)sayB(Lg(it[2],it[3]));},500);}
ev({a:'find',f:F.it,t:tap?1:0,i:g.idx+1});}
var U0=WN.update;
WN.update=function(dt){var r=U0.apply(this,arguments);var g=curG();if(!g)return r;var H=g.v3h;
try{if(H){if(H.tight)tTick(g,H,dt);else{sync(g,H);mihTick(g,H);}if(g.winT>0&&!H.fin){H.fin=1;finish(g,H);}}if(!(H&&H.tight))pgTick(g,dt);}catch(e){warn('tick',e);}return r;};
function finish(g,H){if(H.find&&!H.find.got&&H.find.cell>=0){collect(g,H,0);var it=FINDS[H.find.it];try{toast('🔎 '+Lg('Под машиной нашлось: ','Found under a car: ')+Lg(it[0],it[1]),2600);}catch(e){}}
if(H.bet){H.bet=0;if(!g.crashes){try{VY.coins(20);ern('bet',20);}catch(e){}H.betW=1;}else H.betW=-1;ev({a:'bet',r:H.betW>0?'win':'lose',i:g.idx+1});}
if(H.nb&&H.nb.in){try{VY.coins(5);ern('bet',5);}catch(e){}H.nbW=1;}}
function mihTick(g,H){if(!is('goals')||g.over||H.mihDone||g.idx<13||g.idx>120||(g.idle||0)<15||(typeof modalOn!=='undefined'&&modalOn)||g.hint>=0&&g.hintT>0)return;
var s=SH(),dk=dayK();H.mihDone=1;if(!s||s.md===dk)return;var w=g.p.w,c=g.vs.filter(function(u){return u.state==='idle'&&canExit(u,g.occ,w,g.p.h,u.id).free&&!(H.M&&u.id<H.M.n&&H.M.role[u.id]);});
if(!c.length)return;s.md=dk;try{save();}catch(e){}var u=c[Math.floor(Math.random()*c.length)];g.hint=u.id;g.hintT=3;g.hintQ=[];sayB(T2(MIH));ev({a:'mih',i:g.idx+1});}
function pgTick(g,dt){if(!is('pigeon'))return;if(g.hint>=0&&g.hintT>3.85&&(!g.v3pg||g.v3pg.id!==g.hint||g.v3pg.t>1.2)){var v=g.vs[g.hint];if(!v)return;
g.v3pg={id:g.hint,t:0,x0:-20,y0:30+Math.random()*40};if(!g.v3pgSaid){g.v3pgSaid=1;var P=rnd(PIG);sayB(T2(P[0]),'win');setTimeout(function(){if(curG()===g&&!g.over)sayB(T2(P[1]));},1700);}}
if(g.v3pg)g.v3pg.t+=dt;}
function rr(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function badge(c,x,y,r,txt,bg,fg){c.save();c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=bg;c.fill();c.lineWidth=Math.max(1.5,r*.2);c.strokeStyle='#fff';c.stroke();
c.fillStyle=fg||'#fff';c.font='900 '+Math.round(r*(String(txt).length>1?1.0:1.3))+'px Rubik,-apple-system,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(txt),x,y+r*.08);c.restore();}
function carTop(v){var p=null;for(var k=0;k<v.L;k++){var q=toPx(trackPt(v.track,k+v.s));if(!p||q[1]<p[1])p=q;}return p;}
function drawUnder(c,t){var g=curG(),H=g&&g.v3h;if(!H||H.tight)return;var w=g.p.w;
if(H.ice)H.ice.forEach(function(k){var p=toPx([k%w,Math.floor(k/w)]);c.save();c.fillStyle='rgba(150,205,255,.55)';c.beginPath();c.ellipse(p[0],p[1]+cs*.08,cs*.38,cs*.22,0,0,7);c.fill();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=cs*.04;c.beginPath();c.ellipse(p[0]-cs*.08,p[1],cs*.15,cs*.06,0,0,7);c.stroke();c.restore();});
for(var k=0;k<g.occ.length;k++)if(g.occ[k]===-6){var p=toPx([k%w,Math.floor(k/w)]),s=cs*.5;c.save();c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(p[0]+s*.08,p[1]+s*.5,s*.5,s*.16,0,0,7);c.fill();
c.fillStyle='#4a8f3c';rr(c,p[0]-s*.38,p[1]-s*.3,s*.76,s*.8,s*.1);c.fill();c.fillStyle='#3b7230';rr(c,p[0]-s*.46,p[1]-s*.44,s*.92,s*.2,s*.08);c.fill();
c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1.5;for(var q=-1;q<=1;q++){c.beginPath();c.moveTo(p[0]+q*s*.18,p[1]-s*.16);c.lineTo(p[0]+q*s*.18,p[1]+s*.38);c.stroke();}c.restore();}
var F=H.find;if(F&&!F.got&&F.cell>=0&&g.occ[F.cell]<0){var p2=toPx([F.cell%w,Math.floor(F.cell/w)]),b=calm()?0:Math.sin(t*4)*cs*.04,r=cs*.22;c.save();
c.fillStyle='rgba(255,236,120,'+(.35+.25*Math.sin(t*5))+')';c.beginPath();c.arc(p2[0],p2[1],r*1.8,0,7);c.fill();
c.fillStyle='#fff6d6';c.strokeStyle='#8a6d1f';c.lineWidth=2;rr(c,p2[0]-r,p2[1]-r+b,r*2,r*2,r*.4);c.fill();c.stroke();
c.fillStyle='#8a6d1f';c.font='900 '+Math.round(r*1.5)+'px Rubik,-apple-system,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('?',p2[0],p2[1]+b+1);c.restore();}}
function drawOver(c,t){var g=curG(),H=g&&g.v3h;if(!H||H.tight||!H.M)return;var M=H.M,r=Math.max(7,cs*.21);
for(var i=0;i<M.n;i++){var v=g.vs[i],ro=M.role[i];if(!v||!aliveV(v)||v.ap<1)continue;
if(ro==='dark'&&!H.dk[i]){c.save();var a=toPx(trackPt(v.track,v.s)),b=toPx(trackPt(v.track,v.s+v.L-1)),x0=Math.min(a[0],b[0])-cs*.44,y0=Math.min(a[1],b[1])-cs*.44,ww=Math.abs(a[0]-b[0])+cs*.88,hh=Math.abs(a[1]-b[1])+cs*.88;
c.fillStyle='#6b705c';rr(c,x0,y0,ww,hh,cs*.22);c.fill();c.strokeStyle='rgba(255,255,255,.35)';c.setLineDash([cs*.1,cs*.08]);c.lineWidth=cs*.04;rr(c,x0+cs*.08,y0+cs*.08,ww-cs*.16,hh-cs*.16,cs*.16);c.stroke();c.setLineDash([]);c.restore();}
var tx=null;if(ro&&RT[ro]){tx=RT[ro].ic||'';if(ro==='wed')tx=M.wn[i];if(ro==='imp')tx=M.N-H.S.mv%M.N;}
if(M.note&&M.note[i]!=null&&H.story==='orch'){tx='♪'+(M.note[i]+1);}
var p=carTop(v);if(tx!=null&&tx!==''){var bg=RT[ro]?RT[ro].bg:'#8e44ad',fg=RT[ro]?RT[ro].fg:'#fff';if(ro==='imp'&&tx===1&&!calm())bg=(t*4|0)%2?'#e74c3c':'#ff8a3d';badge(c,p[0],p[1]-cs*.3,tx.length>2||String(tx).length>2?r*1.25:r,tx,bg,fg);}}
var G2=H.goal;if(G2&&!G2.st){var v2=g.vs[G2.t];if(v2&&aliveV(v2)){var p3=carTop(v2),x=p3[0]+cs*.3,y=p3[1]-cs*.55;c.save();c.strokeStyle='#2d3436';c.lineWidth=cs*.05;c.beginPath();c.moveTo(x,y+cs*.45);c.lineTo(x,y-cs*.1);c.stroke();
c.fillStyle=G2.ty==='amb'?'#e74c3c':G2.ty==='kit'?'#f0a04b':'#2e86de';c.beginPath();c.moveTo(x,y-cs*.1);c.lineTo(x+cs*.42,y+cs*.04);c.lineTo(x,y+cs*.2);c.closePath();c.fill();c.restore();
if(G2.ty!=='kit')badge(c,x-cs*.05,y+cs*.55,r*.9,G2.left,'#2d3436','#fff');}}}
if(WN.LVLH&&typeof LVLH.draw==='function'){var LD0=LVLH.draw;LVLH.draw=function(c,layer,t){var r=LD0.apply(this,arguments);try{if(layer==='under')drawUnder(c,t);else if(layer==='over')drawOver(c,t);}catch(e){warn('draw',e);}return r;};}
var R0=WN.render;
WN.render=function(){var r=R0.apply(this,arguments),g=curG();if(!g)return r;try{screen(g);}catch(e){warn('screen',e);}return r;};
function screen(g){var H=g.v3h;ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
if(H&&!H.tight&&H.wh.on&&whOk(g,H)){var p=whPos(g),t=now(),pl=calm()?1:1+.08*Math.sin(t*6);ctx.save();ctx.translate(p[0],p[1]);ctx.scale(pl,pl);ctx.fillStyle='#ffd23f';ctx.strokeStyle='#2d3436';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,24,0,7);ctx.fill();ctx.stroke();
ctx.fillStyle='#2d3436';rr(ctx,-11,-5,16,10,4);ctx.fill();ctx.beginPath();ctx.arc(7,1,6,0,7);ctx.fill();ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.arc(7,1,2.5,0,7);ctx.fill();ctx.restore();
lbl(ctx,p[0],p[1]+34,Lg('Свисток','Whistle'),12,'center');}
if(H&&H.story==='dacha'&&!g.over){var left=H.norm-g.moves,m=60-Math.max(0,left),late=left<0,txt=late?Lg('⏰ опаздываем на ','⏰ late by ')+(-left)+Lg(' мин',' min'):'⏰ 8:'+(m<10?'0':'')+Math.min(59,m)+Lg(' · электричка в 9:00',' · train at 9:00');
ctx.font='800 13px Rubik,-apple-system,sans-serif';var tw=ctx.measureText(txt).width+20;ctx.fillStyle=late?'rgba(214,48,49,.85)':'rgba(20,30,48,.7)';rr(ctx,W/2-tw/2,6,tw,24,12);ctx.fill();lbl(ctx,W/2,18,txt,13,'center');}
var P=g.v3pg;if(P&&P.t<1.6){var v=g.vs[P.id];if(v){var q=carTop(v),X=q[0]*cam.z+cam.x,Y=(q[1]-cs*.7)*cam.z+cam.y,k=Math.min(1,P.t/.9),e=1-Math.pow(1-k,3),x=P.x0+(X-P.x0)*e,y=P.y0+(Y-P.y0)*e-Math.sin(k*Math.PI)*40,fl=k<1&&!calm()?Math.sin(P.t*30):0;
ctx.save();ctx.globalAlpha=Math.min(1,(1.6-P.t)*3);ctx.fillStyle='#8e949c';ctx.beginPath();ctx.ellipse(x,y,11,7,0,0,7);ctx.fill();ctx.fillStyle='#6d737b';ctx.beginPath();ctx.ellipse(x-2,y-2-fl*5,9,4,-.4-fl*.5,0,7);ctx.fill();
ctx.fillStyle='#9aa1a9';ctx.beginPath();ctx.arc(x+10,y-4,5,0,7);ctx.fill();ctx.fillStyle='#e17055';ctx.beginPath();ctx.moveTo(x+14,y-4);ctx.lineTo(x+18,y-3);ctx.lineTo(x+14,y-2);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(x+11,y-5,1.2,0,7);ctx.fill();ctx.restore();}}
ctx.restore();}
function lbl(c,x,y,txt,sz,al){c.font='800 '+sz+'px Rubik,-apple-system,sans-serif';c.textAlign=al||'left';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.5)';c.strokeText(txt,x,y);c.fillStyle='#fff';c.fillText(txt,x,y);}
if(WN.VYCARS&&VYCARS.yardVeh){var YV0=VYCARS.yardVeh;VYCARS.yardVeh=function(c,v,s,tp,cs2,fx){if(!v||!v.v3back||s<v.bend)return YV0.apply(this,arguments);
var a=tp(trackPt(v.track,s)),b=tp(trackPt(v.track,s+v.L-1)),cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2;c.save();c.translate(cx,cy);c.rotate(Math.PI);c.translate(-cx,-cy);
var f2=Object.assign({},fx||{},{noArrow:true}),ok=YV0.call(this,c,v,s,tp,cs2,f2);c.restore();if(ok&&!(fx&&fx.noArrow)&&!v.noArrow)try{arrowAt(c,v,s,tp,cs2);}catch(e){}return ok;};}
var CE0=WN.canExit;
WN.canExit=function(v,occ,w,h,self){if(!v||!v.v3buh)return CE0.apply(this,arguments);var D=DIRS[v.dir],x=v.cells[0][0]+D[0],y=v.cells[0][1]+D[1],k=0;
while(x>=0&&y>=0&&x<w&&y<h){var o=occ[y*w+x];if(o!==-1&&o!==self&&o!==-2)return{free:false,k:k,block:o};k++;x+=D[0];y+=D[1];}return{free:true,k:k};};
var TCOL=['#3f86ff','#4fc24a','#ffc233','#9a6bff','#ff9340','#19c2b8','#5b74b8','#ff8fc0','#f6f8fc','#8fd0f2','#b8e986','#ffd27a'];
function tGeo(g){var fw=g.p.w*cs,fh=g.p.h*cs,N=V.TN,bs=Math.floor(Math.min(fw/(N+1.3),(fh-40)/(N+.6),64)),bw=N*bs,bx=ox+(fw-bw-bs*.7)/2,by=oy+Math.max(36,(fh-bw)/2);return{bx:bx,by:by,bs:bs,fx:ox-cs*.2,fy:oy-cs*.2,fw:fw+cs*.4,fh:fh+cs*.4};}
function tVeh(T,i){var c=T.cars[i],k=i+'';if(T.vh[k])return T.vh[k];var cells=[],j;
for(j=c.len-1;j>=0;j--)cells.push(c.h?[j,c.y]:[c.x,j]);
var col=i===0?'#d63031':TCOL[i%TCOL.length],v=makeVehicle(cells,c.h?1:2,col,V.TN,V.TN,'');v.id=50+i;v.s=0;v.state='idle';v.ap=1;if(i===0)v.vy='moskvich';try{tint(v,col);}catch(e){}T.vh[k]=v;return v;}
function tRange(T,i){var c=T.cars[i],o=V.tgrid(T.cars,T.pos),p=T.pos[i],lo=p,hi=p,s,N=V.TN;
for(s=p-1;s>=0;s--){if(o[(c.h?c.y:s)*N+(c.h?s:c.x)]!==-1)break;lo=s;}
for(s=p+1;s+c.len<=N;s++){var e=s+c.len-1;if(o[(c.h?c.y:e)*N+(c.h?e:c.x)]!==-1)break;hi=s;}return[lo,hi];}
function tDraw(c,g,H,t){var T=H.tight,Gm=tGeo(g),N=V.TN,bs=Gm.bs,bx=Gm.bx,by=Gm.by;T.geo=Gm;try{if(cam.z!==1||cam.x||cam.y){cam.z=1;cam.x=cam.y=0;cam.tw=null;}}catch(e){}
var night=g.tod==='night'||g.tod==='evening';c.save();
c.fillStyle=night?'#3d5a3a':'#b9e79a';rr(c,Gm.fx,Gm.fy,Gm.fw,Gm.fh,16);c.fill();
c.fillStyle=night?'#5a6474':'#f4efe4';rr(c,bx-bs*.25,by-bs*.25,bs*N+bs*.5,bs*N+bs*.5,bs*.3);c.fill();
c.fillStyle=night?'#454d5a':'#c3ced9';rr(c,bx-bs*.05,by-bs*.05,bs*N+bs*.1,bs*N+bs*.1,bs*.18);c.fill();
c.fillStyle=night?'#454d5a':'#c3ced9';c.fillRect(bx+bs*N,by+V.EXR*bs+bs*.06,bs*.75,bs*.88);c.fillStyle='#e2795a';c.fillRect(bx+bs*N+bs*.05,by+V.EXR*bs-bs*.12,bs*.65,bs*.12);c.fillRect(bx+bs*N+bs*.05,by+V.EXR*bs+bs,bs*.65,bs*.12);
c.fillStyle='#fff';c.font='900 '+Math.round(bs*.5)+'px Rubik,-apple-system,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('›',bx+bs*N+bs*.38,by+V.EXR*bs+bs*.5);
c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1;for(var k=1;k<N;k++){c.beginPath();c.moveTo(bx+k*bs,by);c.lineTo(bx+k*bs,by+N*bs);c.moveTo(bx,by+k*bs);c.lineTo(bx+N*bs,by+k*bs);c.stroke();}
var hb=g.hint>=0&&g.hintT>0?V.tbest(T.cars,T.pos,T.A):null;
if(hb&&!T.hs){T.hs=1;var cc=T.cars[hb.i],dir=hb.to>T.pos[hb.i]?(cc.h?Lg('вправо','right'):Lg('вниз','down')):(cc.h?Lg('влево','left'):Lg('вверх','up'));
sayB(Lg('Двинь подсвеченную ','Move the glowing one ')+dir+Lg('. До выезда ',' — ')+hb.d+Lg(' '+(hb.d%10===1&&hb.d!==11?'ход':hb.d%10>=2&&hb.d%10<=4&&(hb.d<12||hb.d>14)?'хода':'ходов')+'.',' moves to go.'));}
if(!hb)T.hs=0;
for(var i=0;i<T.cars.length;i++){var cr=T.cars[i],p=T.pos[i];if(T.drag&&T.drag.i===i)p=T.drag.f;if(T.anim&&T.anim.i===i){var a=T.anim,e2=1-Math.pow(1-a.t,3);p=a.from+(a.to-a.from)*e2;}
if(i===0&&T.out)p+=T.out;var off=p,v=tVeh(T,i),fx={noArrow:true};if(hb&&hb.i===i)fx.glow=.5+.35*Math.sin(t*8);
var tp=(function(off,h){return function(q){return[bx+(q[0]+.5+(h?off:0))*bs,by+(q[1]+.5+(h?0:off))*bs];};})(off,cr.h);
if(i===0&&T.out>.4){c.save();c.beginPath();c.rect(bx-bs,by-bs,bs*N+bs*1.75,bs*N+bs*2);c.clip();}
try{drawVehicle(c,v,0,tp,bs,fx);}catch(e2){}
if(i===0&&T.out>.4)c.restore();
if(hb&&hb.i===i){var q0=tp([cr.h?cr.len/2-.5:cr.x,cr.h?cr.y:cr.len/2-.5]),d=(hb.to-T.pos[i])>0?1:-1;c.save();c.fillStyle='#ffd628';c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=2;c.translate(q0[0],q0[1]);if(!cr.h)c.rotate(Math.PI/2);if(d<0)c.rotate(Math.PI);
c.beginPath();c.moveTo(bs*.25,-bs*.22);c.lineTo(bs*.55,0);c.lineTo(bs*.25,bs*.22);c.closePath();c.fill();c.stroke();c.restore();}
if(i===0&&!T.out){try{var dq=tp([cr.len-1,cr.y]);c.save();c.fillStyle='#fff';c.font='800 '+Math.round(bs*.22)+'px Rubik,-apple-system,sans-serif';c.textAlign='center';c.fillText(Lg('ДЕД','GRANDAD'),(tp([0,cr.y])[0]+dq[0])/2,dq[1]+bs*.36);c.restore();}catch(e3){}}}
var s3=tStars(T),txt=Lg('Ходов ','Moves ')+T.mv+Lg(' · ★★★ до ',' · ★★★ ≤ ')+(T.min+2);lbl(c,bx,by-bs*.25-14,txt,Math.max(12,Math.min(15,bs*.3)),'left');
var ux=bx+bs*N-bs*1.2,uy=by-bs*.25-28;T.undo=[ux,uy,bs*1.4,26];c.fillStyle=T.hist.length?'rgba(20,30,48,.7)':'rgba(20,30,48,.3)';rr(c,ux,uy,bs*1.4,26,13);c.fill();lbl(c,ux+bs*.7,uy+13,'↶ '+Lg('Назад','Undo'),12,'center');
c.restore();}
function tStars(T){return T.mv<=T.min+2?3:T.mv<=T.min+6?2:1;}
function tZoomOff(){try{if(cam.z>1.001||cam.tw){cam.z=1;cam.x=cam.y=0;cam.tw=null;}['zReset','zIn'].forEach(function(id){var b=document.getElementById(id);if(b&&b.classList.contains('on'))b.classList.remove('on');});}catch(e){}}
function tTick(g,H,dt){var T=H.tight;tZoomOff();if(T.anim){T.anim.t=Math.min(1,T.anim.t+dt*7);if(T.anim.t>=1){T.pos[T.anim.i]=T.anim.to;T.anim=null;if(V.tsolved(T.pos)&&!T.done){T.done=1;T.out=.001;try{SND.whoosh();}catch(e){}}}}
if(T.out){T.out+=dt*8;if(T.out>4.5&&!T.fin){T.fin=1;var w=g.p.w;g.vs.forEach(function(v){v.state='gone';});for(var k=0;k<g.occ.length;k++)if(g.occ[k]>=0)g.occ[k]=-1;
var s=SH();if(s){s.tw=(s.tw||0)+1;}ev({a:'tight',i:g.idx+1,mv:T.mv,m:T.min});}}}
function tMove(g,T,i,to,from){if(to===T.pos[i])return;T.hist.push(T.pos.slice());T.anim={i:i,from:from!=null?from:T.pos[i],to:to,t:0};T.mv++;g.moves++;g.idle=0;try{tone('triangle',330+i*20,360+i*20,.08,.03);}catch(e){}}
var cvEl=null;function cvE(){if(!cvEl)cvEl=document.getElementById('cv');return cvEl;}
function tAct(){var g=curG(),H=g&&g.v3h;if(!H||!H.tight||g.over||(typeof modalOn!=='undefined'&&modalOn))return null;return g;}
function tPt(e){var r=cvE().getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];}
function tIn(e){var g=tAct();if(!g||e.target!==cvE())return;e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();var T=g.v3h.tight,Gm=T.geo;if(!Gm)return;var p=tPt(e),N=V.TN;
if(e.type==='wheel')return;
if(e.type==='pointerdown'){try{tipHide('p');}catch(x){}try{ac();}catch(x){}if(T.anim||T.done)return;
var u=T.undo;if(u&&p[0]>=u[0]&&p[0]<=u[0]+u[2]&&p[1]>=u[1]-6&&p[1]<=u[1]+u[3]+6){if(T.hist.length){T.pos=T.hist.pop();T.mv++;g.moves++;}return;}
var fx=(p[0]-Gm.bx)/Gm.bs,fy=(p[1]-Gm.by)/Gm.bs,cx=Math.floor(fx),cy=Math.floor(fy);if(cx<0||cy<0||cx>=N||cy>=N)return;var i=V.tgrid(T.cars,T.pos)[cy*N+cx];if(i<0)return;
try{cvE().setPointerCapture(e.pointerId);}catch(x){}var c=T.cars[i];T.drag={i:i,x0:c.h?fx:fy,p0:T.pos[i],r:tRange(T,i),moved:false,f:T.pos[i],at:(c.h?fx:fy)-T.pos[i],pid:e.pointerId};return;}
var d=T.drag;if(!d||d.pid!==e.pointerId)return;var c2=T.cars[d.i];
if(e.type==='pointermove'){var q=((c2.h?p[0]:p[1])-(c2.h?Gm.bx:Gm.by))/Gm.bs-d.x0;if(Math.abs(q)>.15)d.moved=true;d.f=Math.max(d.r[0],Math.min(d.r[1],d.p0+q));return;}
T.drag=null;var to;if(!d.moved)to=d.at<c2.len/2?d.r[0]:d.r[1];else to=Math.round(d.f);
if(to!==d.p0)tMove(g,T,d.i,to,d.moved?d.f:d.p0);else if(d.moved)T.anim={i:d.i,from:d.f,to:to,t:0};}
['pointerdown','pointermove','pointerup','pointercancel','wheel'].forEach(function(t){WN.addEventListener(t,tIn,{capture:true,passive:false});});
function tBot(g){var T=g.v3h.tight;if(T.anim||T.done){tTick(g,g.v3h,.2);return true;}var b=V.tbest(T.cars,T.pos,T.A);if(!b)return false;tMove(g,T,b.i,b.to);tTick(g,g.v3h,.2);return true;}
var K0={};['begin','intro','pre','post','towOk','onTow','revive','loseLine','stars','noWave','hintPick','botPick','res','draw'].forEach(function(n){K0[n]=V3K[n];});
function mine(g){return!!(g&&g.v3k&&g.v3k.h);}
function hStars(g){var H=g.v3h;if(!H)return 3;if(H.tight)return tStars(H.tight);if(H.story==='dacha'){var d=g.moves-H.norm;return d<=0?3:d<=3?2:1;}return 3;}
function hPick(g,cand){var H=g.v3h;if(!H||!H.M)return null;if(H.tight)return cand[0]||null;sync(g,H);var r=V.search(H.M,H.S,15000);if(r.first<0)return null;var v=g.vs[r.first];return cand.indexOf(v)>=0?v:null;}
V3K.begin=function(g,lv,idx,seed,daily,o){if(K0.begin)K0.begin.apply(this,arguments);if(!g.v3k||g.v3k.kind==='column')try{if(!g.v3k)begin(g,lv,idx,seed,daily,o);}catch(e){warn('begin',e);g.v3h=null;if(g.v3k&&g.v3k.h)g.v3k=null;}};
V3K.intro=function(){var g=curG();if(mine(g))return;var r=K0.intro&&K0.intro.apply(this,arguments);return r;};
V3K.pre=function(v){var g=curG();if(mine(g))return false;return K0.pre.apply(this,arguments);};
V3K.post=function(v){var g=curG();if(mine(g)){var H=g.v3h;if(H)sync(g,H);return;}var r=K0.post.apply(this,arguments);try{postColumn(g,v);}catch(e){}return r;};
V3K.towOk=function(v){var g=curG();if(mine(g))return!(g.v3h&&g.v3h.tight);return K0.towOk.apply(this,arguments);};
V3K.onTow=function(v){var g=curG();if(mine(g)){if(g.v3h)sync(g,g.v3h);return;}return K0.onTow.apply(this,arguments);};
V3K.revive=function(g){if(g&&g.v3dead===2){g.v3dead=0;g.towFree=1;try{toast(Lg('🎁 Эвакуатор бесплатно — увези, кто мешает','🎁 A free tow — take away whoever is in the way'),3500);updCoins();$('gTow').style.display='';}catch(e){}return;}if(mine(g))return;return K0.revive.apply(this,arguments);};
V3K.loseLine=function(){var g=curG();if(g&&g.v3dead===2)return T2(TX.dead);return K0.loseLine.apply(this,arguments);};
V3K.stars=function(g){if(mine(g))return hStars(g);var K=g&&g.v3k;if(K&&K.rep){var t=K.st.taps||0,n=K.L.norm;var s=t<=n+3?3:t<=n+6?2:1;return K.bought?Math.min(2,s):s;}return K0.stars.apply(this,arguments);};
V3K.noWave=function(){var g=curG();if(mine(g))return true;return K0.noWave.apply(this,arguments);};
V3K.hintPick=function(cand){var g=curG();if(mine(g)){var H=g.v3h;if(H&&H.tight)H.tight.hs=0;return hPick(g,cand);}return K0.hintPick.apply(this,arguments);};
V3K.botPick=function(){var g=curG();if(mine(g)){if(!g||g.over)return null;var w=g.p.w,c=g.vs.filter(function(u){return u.state==='idle'&&canExit(u,g.occ,w,g.p.h,u.id).free;});return hPick(g,c)||c[0]||null;}return K0.botPick.apply(this,arguments);};
V3K.res=function(g){if(mine(g))return 0;return K0.res.apply(this,arguments);};
V3K.draw=function(c,Wd,Hd,t){var g=curG();if(mine(g)){var H=g.v3h;if(H&&H.tight)try{tDraw(c,g,H,t);}catch(e){warn('tdraw',e);}return;}return K0.draw.apply(this,arguments);};
V3K.botStep=function(g){g=g||curG();if(!g||g.over)return false;var H=g.v3h;
if(!H&&g.v3k&&K0.botPick){var b=K0.botPick();if(!b)return false;var q=toPx(b.cells[0]);WN.tapAt(q[0],q[1]);return true;}
if(!H)return false;if(H.tight)return tBot(g);
var M=H.M;if(!H.kind||!M||!M.role.some(function(r){return r;})&&M.first<0)return false;sync(g,H);var r=V.search(M,H.S,20000);if(r.first<0)return false;var v=g.vs[r.first];if(v&&v.state==='bump')return true;if(!v||v.state!=='idle')return false;
var p=toPx(v.cells[0]);WN.tapAt(p[0],p[1]);return true;};
function postColumn(g,v){var K=g&&g.v3k;if(!K||K.kind!=='column')return;
if(is('juice')&&g.comboFx&&g.comboFx.t===0){var n=g.comboFx.n;try{g.vs.forEach(function(u){if(u.state==='exit'&&K.L.col[u.id]===K.L.col[v.id]){var p=toPx(u.cells[0]);g.parts.push({x:p[0],y:p[1],vx:(Math.random()-.5)*40,vy:-80,r:cs*(n>=7?.16:.1),life:.9,max:.9,c:n>=7?'rgba(255,200,40,':'rgba(255,225,120,',star:true});}});}catch(e){}}
if(K.rep&&K.st.taps>0&&K.st.taps%3===0&&K.repT!==K.st.taps){K.repT=K.st.taps;var C=K.L.C||3;g.vs.forEach(function(u){if(u.state!=='idle')return;var c=K.L.col[u.id];if(c<0)return;K.L.col[u.id]=(c+1)%C;try{tint(u,V3K.CFG.pal[K.L.col[u.id]]);}catch(e){}});
try{carsKey='';toast(Lg('🎨 Перекраска!','🎨 Repaint!'));}catch(e){}}}
var WL0=WN.winLine;
if(typeof WL0==='function')WN.winLine=function(){var g=curG(),H=g&&g.v3h;try{if(H){var k=H.tight?'tight':H.story;if(k&&STORY[k]){var st=STORY[k];
if(k==='tight')return T2(tStars(H.tight)===3?st.b:st.c);if(k==='dacha')return T2(g.moves<=H.norm?st.b:st.c);
if(k==='orch'){var ok=H.M&&H.M.note?orchOk(g,H):0;return T2(ok?st.b:st.c);}return T2(st.b);}}}catch(e){}return WL0.apply(this,arguments);};
function orchOk(g,H){return(H.orch||0)>=Math.min(6,H.M.n);}
try{V3.sub('lose',function(){var g=curG(),H=g&&g.v3h;if(H&&H.bet){H.bet=0;H.betW=-1;ev({a:'bet',r:'lose',i:g.idx+1});}},'bet');}catch(e){warn('sub',e);}
var MEL=[440,440,440,440,392,349,349,330,294,330,349,392,349,330,294,262,294,330,349,330,294,262,247,262];
(function(){var SE=WN.startExit;if(typeof SE!=='function')return;WN.startExit=function(v){var g=curG(),H=g&&g.v3h,r=SE.apply(this,arguments);
try{if(H&&H.story==='orch'&&H.M&&H.M.note&&H.M.note[v.id]!=null){var n=H.M.note[v.id],exp=H.orchN||0;if(n===exp){H.orch=(H.orch||0)+1;H.orchN=exp+1;}else H.orchN=n+1;var f=MEL[n%MEL.length];setTimeout(function(){tone('triangle',f,f,.22,.06);},60);}}catch(e){}
return r;};})();
function esc(s){try{return UI.esc(s);}catch(e){return String(s);}}
WN.winSlots=WN.winSlots||[];
winSlots.push({id:'v3h-res',order:24,zone:'goal',fit:7,render:function(ctx){var g=curG(),H=g&&g.v3h;if(!H)return null;var out=[];
if(H.tight)out.push('🔒 '+Lg('Тесный двор: ходов ','Tight yard: moves ')+H.tight.mv+Lg(' (минимум ',' (fewest ')+H.tight.min+')');
if(H.find&&H.find.got){var it=FINDS[H.find.it],s=SH();out.push('🔎 '+Lg('Под машиной: ','Under a car: ')+'<b>'+esc(Lg(it[0],it[1]))+'</b> <button class="btn sec sm noenter" id="v3fBox">'+Lg('Находки ','Finds ')+(s?s.f.length:0)+'/'+FINDS.length+'</button>');}
if(H.goal&&H.goal.st===1)out.push('🙏 '+Lg('Жильцы говорят спасибо','The neighbours say thank you')+' ('+((SH()||{}).th||0)+')');
if(H.betW)out.push(H.betW>0?'🤝 '+Lg('Шура проспорила: +20 💰','Shura lost the bet: +20 💰'):'🤝 '+Lg('Спор проигран — монетки Шуре на рассаду','Bet lost — Shura’s coins go on seedlings'));
if(H.nbW)out.push('🚗 '+Lg('Сосед угостил: +5 💰','The neighbour treated you: +5 💰'));
return out.length?'<div class="v3hW" style="font-size:14px;line-height:1.35;margin:6px 0">'+out.join('<br>')+'</div>':null;},
mount:function(el){var b=el&&el.querySelector('#v3fBox');if(b)b.onclick=function(e){e.stopPropagation();openFinds();};}});
function openFinds(){var s=SH()||{f:[]},rows=FINDS.map(function(it,i){var h=s.f.indexOf(i)>=0;return'<div style="padding:4px 0;border-bottom:1px solid rgba(0,0,0,.08);opacity:'+(h?1:.45)+'">'+(h?'<b>'+esc(Lg(it[0],it[1]))+'</b> — '+esc(Lg(it[2],it[3])):'❔ '+Lg('ещё не нашлось','not found yet'))+'</div>';}).join('');
var re=null;try{re=modalRe;}catch(e){}
modal('<h2>🔎 '+Lg('Коробка находок','The finds box')+' '+s.f.length+'/'+FINDS.length+'</h2>'+shura(Lg('Всё, что нашлось под машинами, — тут. Хозяевам отдам, не волнуйся.','Everything found under the cars is here. I’ll return it to the owners, don’t worry.'),'')+
'<div style="max-height:46vh;overflow:auto;text-align:left;font-size:14px">'+rows+'</div><div class="row"><button class="btn" id="v3fX">'+Lg('Закрыть','Close')+'</button></div>');
document.getElementById('v3fX').onclick=function(){try{hideModal();if(G&&G.over&&typeof win==='function'){}}catch(e){}};}
WN.loseSlots=WN.loseSlots||[];
loseSlots.push({id:'v3h-skip',order:60,render:function(ctx){if(!is('skip')||ctx.daily||(ctx.mode&&ctx.mode!=='n')||(ctx.fails||0)<2)return null;var s=Sv();if(!s||ctx.idx!==(s.unlocked||1)-1||ctx.idx%10===9||ctx.idx>=219)return null;
return'<div style="margin:6px 0;font-size:13px">'+Lg('Не идёт? Можно вернуться позже — звёзд за пропущенный двор не будет.','Stuck? You can come back later — no stars for a skipped yard.')+'<br><button class="btn sec sm noenter" id="v3skip">⏭ '+Lg('Пропустить — вернусь позже','Skip — I’ll come back')+'</button></div>';},
mount:function(el,ctx){var b=el&&el.querySelector('#v3skip');if(!b)return;b.onclick=function(){var s=Sv();if(!s)return;s.unlocked=Math.max(s.unlocked||1,ctx.idx+2);var h=SH();if(h)h.sk[ctx.idx]=1;try{save();}catch(e){}ev({a:'skip',i:ctx.idx+1,f:ctx.fails});
try{hideModal();startLevel(ctx.idx+1);}catch(e){}};}});
WN.__v3h={V:V,find:FINDS,box:function(){openFinds();},state:function(){var g=curG();return g&&g.v3h;},collect:collect};
})();