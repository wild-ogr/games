(function(root){
'use strict';
var DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function ri(R,n){return Math.floor(R()*n);}
function field(w,h,cars,occ0){var occ=new Int16Array(w*h),i,k;for(i=0;i<w*h;i++)occ[i]=-1;
if(occ0)for(i=0;i<w*h;i++)if(occ0[i]<=-2)occ[i]=-2;
var F={w:w,h:h,occ:occ,cars:cars,n:cars.length,alive:new Uint8Array(cars.length)};
for(i=0;i<cars.length;i++){F.alive[i]=1;for(k=0;k<cars[i].c.length;k++){var p=cars[i].c[k];occ[p[1]*w+p[0]]=i;}}return F;}
function fcopy(F){return{w:F.w,h:F.h,occ:F.occ.slice(),cars:F.cars,n:F.n,alive:F.alive.slice()};}
function free(F,i){var v=F.cars[i],D=DIRS[v.d],x=v.c[0][0]+D[0],y=v.c[0][1]+D[1];
while(x>=0&&y>=0&&x<F.w&&y<F.h){var o=F.occ[y*F.w+x];if(o!==-1&&o!==i)return false;x+=D[0];y+=D[1];}return true;}
function rm(F,i){var c=F.cars[i].c;for(var k=0;k<c.length;k++)F.occ[c[k][1]*F.w+c[k][0]]=-1;F.alive[i]=0;}
function frees(F){var f=[];for(var i=0;i<F.n;i++)if(F.alive[i]&&free(F,i))f.push(i);return f;}
function left(F){var s=0;for(var i=0;i<F.n;i++)s+=F.alive[i];return s;}
function key(F){var s='',a=0;for(var i=0;i<F.n;i++){if(F.alive[i])a|=1<<(i%30);if(i%30===29||i===F.n-1){s+=a.toString(36)+',';a=0;}}return s;}
var ARCH={C:3,soft:4,from:30,maxCars:75,minArch:4};
function archMove(L,st,i,tow){var n=st.n+1,q=st.q,rel=0;if(n%2===0&&q>0){q--;rel=1;}
if(!tow&&L.a[i]){if(q>=L.C)return{ok:false};q++;}
st.n=n;st.q=q;if(q>(st.mx||0))st.mx=q;return{ok:true,rel:rel,arch:!tow&&!!L.a[i]};}
function archOk(L,st,i){if(!L.a[i])return true;var q=st.q;if((st.n+1)%2===0&&q>0)q--;return q<L.C;}
function archSolve(F0,L,st0,limit,wantFirst){var seen={},nodes=0;
function rec(F,st){if(!left(F))return true;var kk=key(F)+'|'+st.q+'|'+(st.n&1);if(seen[kk])return false;seen[kk]=1;if(++nodes>limit)throw 0;
var f=frees(F);f.sort(function(a,b){return L.a[a]-L.a[b];});
for(var k=0;k<f.length;k++){var s2={q:st.q,n:st.n,mx:st.mx};if(!archMove(L,s2,f[k]).ok)continue;var T=fcopy(F);rm(T,f[k]);if(rec(T,s2))return wantFirst&&F===F00?f[k]+1:true;}
return false;}
var F00=fcopy(F0);
try{var r=rec(F00,{q:st0.q,n:st0.n,mx:0});if(wantFirst)return typeof r==='number'?r-1:-1;return r;}catch(e){return wantFirst?-2:null;}}
function archPlay(F0,L,R,bot){var F=fcopy(F0),st={q:0,n:0,mx:0},taps=0;
for(;;){var f=frees(F);if(!f.length)return{win:!left(F),mx:st.mx,taps:taps};
var g=f.filter(function(i){return archOk(L,st,i);});if(!g.length)return{win:false,dead:1,mx:st.mx,taps:taps};
var i;if(bot==='rnd'){i=f[ri(R,f.length)];if(!archOk(L,st,i)){taps++;continue;}}
else i=g[ri(R,g.length)];
archMove(L,st,i);rm(F,i);taps++;}}
function archBuild(F,idx,seed,skip){if(F.n>ARCH.maxCars)return null;var R=rng(seed*43+idx*17+7),cand=[];
var soft=archNo(idx)<=1,C=soft?ARCH.soft:ARCH.C;
for(var m=0;m<10;m++){var E=m<4?m:m<8?m-4:m-8,E2=m<4?(m+1)%4:m<8?-1:(m-8)+2;
var a=new Uint8Array(F.n),na=0;for(var i=0;i<F.n;i++)if((F.cars[i].d===E||F.cars[i].d===E2)&&!skip[i]){a[i]=1;na++;}
if(na<ARCH.minArch)continue;var L={kind:'arch',E:E,E2:E2,C:C,a:a,na:na};
var dead=0,runs=16;for(var s=0;s<runs;s++)if(!archPlay(F,L,R,'any').win)dead++;
L.dead=dead/runs;L.sc=(L.dead>.8?-5:L.dead)*10+na/F.n+R()*.01;
cand.push(L);}
cand.sort(function(x,y){return y.sc-x.sc;});
for(var k=0;k<cand.length;k++)if(archSolve(F,cand[k],{q:0,n:0},40000)===true)return cand[k];
return null;}
function archNo(idx){var n=0;for(var i=ARCH.from;i<=idx;i++)if(archSlot(i))n++;return n;}
function archSlot(idx){if(idx<ARCH.from)return false;var r=Math.floor(idx/10),s=idx%10+1;if(s!==6)return false;return idx<60||r%2===1;}
function drawOk(F,i,path){var v=F.cars[i],h=v.c[0],px=h[0],py=h[1],seen={};
if(!path.length)return false;
for(var k=0;k<path.length;k++){var x=path[k][0],y=path[k][1];if(Math.abs(x-px)+Math.abs(y-py)!==1)return false;
if(x<0||y<0||x>=F.w||y>=F.h)return k===path.length-1;
var o=F.occ[y*F.w+x];if(o!==-1&&o!==i)return false;if(seen[x+','+y])return false;seen[x+','+y]=1;px=x;py=y;}
return false;}
function drawPath(F,i){var v=F.cars[i],h=v.c[0],w=F.w,H=F.h,prev={},q=[[h[0],h[1]]],st=h[0]+','+h[1];prev[st]=null;
var tail={};v.c.forEach(function(p){tail[p[0]+','+p[1]]=1;});
while(q.length){var c=q.shift();for(var d=0;d<4;d++){var x=c[0]+DIRS[d][0],y=c[1]+DIRS[d][1],k=x+','+y;if(prev[k]!==undefined)continue;
if(x<0||y<0||x>=w||y>=H){var out=[[x,y]],b=c[0]+','+c[1];while(b!==st){var p=b.split(',').map(Number);out.unshift(p);b=prev[b];}return out;}
var o=F.occ[y*w+x];if(o!==-1||tail[k])continue;prev[k]=c[0]+','+c[1];q.push([x,y]);}}
return null;}
function drawPick(F,idx,seed,skip){var R=rng(seed*47+idx*19+9),c=[];
for(var i=0;i<F.n;i++){var v=F.cars[i];if(skip[i]||v.c.length!==2)continue;var pp=drawPath(F,i),pl=pp?pp.length:0,sc=(free(F,i)?0:5)+(pl>=3&&pl<=7?4:pl?1:0)+R();c.push([sc,i]);}
if(!c.length)return-1;c.sort(function(a,b){return b[0]-a[0];});return c[0][1];}
function drawSlot(idx){if(idx<40)return false;var s=idx%10+1;return s===8&&!(idx>=60&&Math.floor(idx/10)%2===0);}
function straight(c,d){var D=DIRS[d];for(var k=1;k<c.length;k++)if(c[k][0]!==c[0][0]-D[0]*k||c[k][1]!==c[0][1]-D[1]*k)return false;return true;}
function inF(F,x,y){return x>=0&&y>=0&&x<F.w&&y<F.h;}
function emptyFor(F,i,x,y){if(!inF(F,x,y))return false;var o=F.occ[y*F.w+x];return o===-1||o===i;}
function solvable(F){var T=fcopy(F);for(;;){var f=frees(T);if(!f.length)break;f.forEach(function(i){rm(T,i);});}return!left(T);}
function turnOpts(F,i){var v=F.cars[i],c=v.c,d=v.d,L=c.length,out=[];if(!straight(c,d))return out;
var rev=c.slice().reverse().map(function(p){return[p[0],p[1]];});out.push({d:(d+2)%4,c:rev,k:'rev'});
if(L<=3){var tail=c[L-1];[1,3].forEach(function(t){var nd=(d+t)%4,D=DIRS[nd],cc=[],ok=true;
for(var k=L-1;k>=0;k--){var x=tail[0]+D[0]*k,y=tail[1]+D[1]*k;if(!emptyFor(F,i,x,y)){ok=false;break;}cc.push([x,y]);}
if(ok)out.push({d:nd,c:cc,k:'turn'});});}
return out.filter(function(o){var T=applyCells(F,i,o.c,o.d);return solvable(T);});}
function pushOpts(F,i){var v=F.cars[i],c=v.c,d=v.d,out=[];if(!straight(c,d))return out;
[0,2].forEach(function(t){var D=DIRS[(d+t)%4],cc=c.map(function(p){return[p[0]+D[0],p[1]+D[1]];});
if(cc.every(function(p){return emptyFor(F,i,p[0],p[1]);}))out.push({d:d,c:cc,k:t?'back':'fwd'});});
return out.filter(function(o){return solvable(applyCells(F,i,o.c,o.d));});}
function applyCells(F,i,cells,d){var T=fcopy(F),cars=F.cars.slice();T.cars=cars;var c=F.cars[i].c,k;
for(k=0;k<c.length;k++)T.occ[c[k][1]*F.w+c[k][0]]=-1;cars[i]={c:cells,d:d};for(k=0;k<cells.length;k++)T.occ[cells[k][1]*F.w+cells[k][0]]=i;return T;}
var REST={lo:5,hi:8,tries:48};
function restFit(norm){return norm>=REST.lo&&norm<=REST.hi;}
function replayTimes(ev,gap){gap=gap||1.2;var out=[],t=0,prev=null;for(var k=0;k<ev.length;k++){var e=ev[k];if(prev===null)t=.6;else t+=Math.min(gap,Math.max(.25,e.t-prev));prev=e.t;out.push(t);}return out;}
function crashWindow(ev){var last=-1;for(var k=ev.length-1;k>=0;k--)if(ev[k].k==='bump'){last=k;break;}if(last<0)return null;return{a:Math.max(0,last-5),b:Math.min(ev.length-1,last+1),crash:last};}
function waveTimes(ev,T){T=T||5;var go=[];ev.forEach(function(e,k){if(e.k==='go'||e.k==='tow')go.push(k);});var n=go.length,out={};go.forEach(function(k,j){out[k]=n<=1?0:j*(T-1.2)/(n-1);});return out;}
var V3D={rng:rng,field:field,fcopy:fcopy,free:free,rm:rm,frees:frees,left:left,key:key,DIRS:DIRS,
ARCH:ARCH,archMove:archMove,archOk:archOk,archSolve:archSolve,archPlay:archPlay,archBuild:archBuild,archSlot:archSlot,archNo:archNo,
drawOk:drawOk,drawPath:drawPath,drawPick:drawPick,drawSlot:drawSlot,
straight:straight,turnOpts:turnOpts,pushOpts:pushOpts,applyCells:applyCells,solvable:solvable,
REST:REST,restFit:restFit,replayTimes:replayTimes,crashWindow:crashWindow,waveTimes:waveTimes};
if(typeof module!=='undefined'&&module.exports)module.exports=V3D;
root.V3D=V3D;
})(typeof window!=='undefined'?window:this);
if(typeof window!=='undefined')(function(){
var WN=window,D=document,V=WN.V3D;
function curG(){try{return G;}catch(e){return null;}}
function Sv(){try{return S;}catch(e){return null;}}
function Lg(ru,en){try{return L(ru,en);}catch(e){return ru;}}
function ok(f,d){try{return f();}catch(e){warn('ok',e);return d;}}
function warn(w,e){try{if(WN.console&&console.warn)console.warn('v3-deep '+w,e);}catch(x){}}
function now(){return(typeof performance!=='undefined'?performance.now():Date.now())/1000;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function el(id){return D.getElementById(id);}
function isCalm(){try{return calm();}catch(e){return false;}}
function isLow(){try{return!!LOW;}catch(e){return false;}}
function sv(){try{save();}catch(e){}}
function ev(a,o){try{if(WN.V3&&V3.ev)V3.ev('dp',Object.assign({k:a},o||{}));}catch(e){}}
var PARTS={arch:'Узкая арка (M9)',draw:'Нарисуй объезд (M37)',rest:'Режим «Отдых» (M55)',replay:'Повтор аварии с комментатором (B30)',clip:'5 секунд счастья (B29)',zhezl:'Жезл регулировщика (M29)',push:'3 толчка (M39)'};
var REGD={};
function is(k){try{if(WN.V3&&V3.reg){if(!REGD[k]){REGD[k]=1;V3.reg(k==='deep'?'deep':'deep.'+k,{s:'DEEP',t:PARTS[k]||'Глубина ядра'});}return V3.is(k==='deep'?'deep':'deep.'+k);}}catch(e){}
try{var m=/[?&]off=([^&#]*)/.exec(location.search||'');if(m){var a=decodeURIComponent(m[1]).split(',');if(a.indexOf('v3')>=0||a.indexOf('v3.deep')>=0||a.indexOf('v3.deep.'+k)>=0)return false;}}catch(e){}
return true;}
is('deep');for(var pk in PARTS)is(pk);
function P(){var s=Sv();if(!s)return{};if(!s.v3d||typeof s.v3d!=='object')s.v3d=fixD({});return s.v3d;}
function num(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
function fixD(v){if(!v||typeof v!=='object')v={};return{v:1,zh:Math.min(99,num(v.zh)),pu:Math.min(99,num(v.pu)),g:num(v.g)?1:0,rn:num(v.rn),rd:num(v.rd),cl:num(v.cl),rp:num(v.rp)};}
try{if(WN.V3&&V3.field)V3.field('v3d',{s:'DEEP',def:function(){return fixD({});},fix:function(v){return fixD(v);},
merge:function(a,b,newer){a=fixD(a);b=fixD(b);var o=newer?b:a,x=newer?a:b;return fixD({zh:o.zh,pu:o.pu,g:a.g||b.g,rn:Math.max(a.rn,b.rn),rd:Math.max(a.rd,b.rd),cl:Math.max(a.cl,b.cl),rp:Math.max(a.rp,b.rp)});}});}catch(e){warn('field',e);}
function bank(path,ru,en,ctx){var t=ok(function(){if(!WN.V3T||!V3T.on||!V3T.on())return null;var x=V3T.line('deep.'+path,ctx||{});return x&&x.t?x.t:null;},null);return t||Lg(ru,en);}
function life(t,joke){var n=String(t||'').length;return joke?Math.min(30,8+.2*n):Math.min(20,5+.12*n);}
function sayL(t,where,joke){try{say(t,where||'bench');var g=curG();if(g&&g.bubbles&&g.bubbles.length){var b=g.bubbles[g.bubbles.length-1];if(b.text===t)b.life=life(t,joke);}}catch(e){}}
var K=WN.V3K;if(!K){warn('нет V3K',0);return;}
var K0={};['begin','intro','pre','post','towOk','onTow','revive','loseLine','stars','noWave','hintPick','botPick','botStep','res','draw','kindOf'].forEach(function(n){K0[n]=K[n];});
function mine(g){return!!(g&&g.v3k&&g.v3k.d);}
function fieldOf(g){return K.fieldOfG(g);}
function freeIdle(g){var w=g.p.w,h=g.p.h;return g.vs.filter(function(u){return u.state==='idle'&&canExit(u,g.occ,w,h,u.id).free;});}
function skipOf(g){var s={};g.vs.forEach(function(v){if(v.kind||v.noArrow)s[v.id]=1;});return s;}
K.kindOf=function(idx){if(V.archSlot(idx)&&is('arch'))return'arch';if(V.drawSlot(idx)&&is('draw'))return'draw';return K0.kindOf?K0.kindOf(idx):'';};
K.begin=function(g,lv,idx,seed,daily,o){g.v3k=null;var done=false;
try{if(o&&o.mode==='rest'){done=beginRest(g,idx,seed);}
else if(!daily&&!o&&!WN.__demo&&V.archSlot(idx)&&is('arch'))done=beginArch(g,idx,seed);
else if(!daily&&!o&&!WN.__demo&&V.drawSlot(idx)&&is('draw'))done=beginDraw(g,idx,seed);}catch(e){warn('begin',e);g.v3k=null;done=false;}
if(!done&&K0.begin)K0.begin.apply(this,arguments);
try{recBegin(g);}catch(e){warn('rec',e);}
try{boostUi();}catch(e){}};
K.intro=function(){var g=curG();if(g&&g.mode==='rest')return;if(mine(g))return introD(g);return K0.intro&&K0.intro.apply(this,arguments);};
K.pre=function(v){var g=curG();if(mine(g))return preD(g,v);return K0.pre.apply(this,arguments);};
K.post=function(v){var g=curG();if(mine(g))return postD(g,v);return K0.post.apply(this,arguments);};
K.towOk=function(v){var g=curG();if(mine(g))return true;return K0.towOk.apply(this,arguments);};
K.onTow=function(v){var g=curG();if(mine(g)){if(g.v3k.kind==='arch'){archApply(g,v,true);deadCheck(g);}return;}return K0.onTow.apply(this,arguments);};
K.revive=function(g){if(mine(g)){var Q=g.v3k;if(g.v3dead&&Q.kind==='arch'){g.v3dead=0;Q.bought=1;Q.L.C++;try{toast(Lg('🧱 В арке стало просторнее: +1 место','🧱 More room in the arch: +1 space'));}catch(e){}}return;}return K0.revive.apply(this,arguments);};
K.loseLine=function(){var g=curG();if(mine(g)&&g.v3dead)return bank('arch.lose','Арка забита — двор встал. Не гони всех к арке подряд: пусти сначала тех, кто едет в переулок.','The arch is jammed — the yard is stuck. Don’t send everyone to the arch in a row: let the side-street cars go in between.');return K0.loseLine.apply(this,arguments);};
K.stars=function(g){if(mine(g))return g.v3k.bought?2:3;if(g&&g.mode==='rest')return 3;return K0.stars.apply(this,arguments);};
K.noWave=function(){var g=curG();if(mine(g))return true;return K0.noWave.apply(this,arguments);};
K.hintPick=function(cand){var g=curG();if(mine(g))return pickD(g,cand);return K0.hintPick.apply(this,arguments);};
K.botPick=function(){var g=curG();if(mine(g)){if(!g||g.over)return null;var c=freeIdle(g);return pickD(g,c)||null;}return K0.botPick.apply(this,arguments);};
K.botStep=function(g){g=g||curG();if(mine(g)){if(!g||g.over)return false;return botD(g);}return K0.botStep?K0.botStep.apply(this,arguments):false;};
K.res=function(g){if(mine(g))return g.v3k.kind==='arch'?58:0;return K0.res.apply(this,arguments);};
K.draw=function(c,Wd,Hd,t){var g=curG();if(g&&g.mode==='rest'&&g.v3k&&g.v3k.rest){try{drawRest(c,Wd,Hd,g);}catch(e){warn('rest',e);}return;}if(mine(g)){try{drawD(c,Wd,Hd,t,g);}catch(e){warn('draw',e);}return;}return K0.draw.apply(this,arguments);};
function beginArch(g,idx,seed){var F=fieldOf(g);if(!V.solvable(F))return false;var Ly=V.archBuild(F,idx,seed,skipOf(g));if(!Ly)return false;
if(g.amb)g.amb.done=true;
g.v3k={kind:'arch',d:1,L:Ly,st:{q:0,n:0,mx:0},qc:[],relT:0,fullT:0,bought:0,t0:now()};
try{STAT.ev('v3k',{k:'arch',i:idx+1,K:Ly.C,m:Ly.na});}catch(e){}ev('arch',{i:idx+1,n:Ly.na,c:Ly.C});return true;}
function archApply(g,v,tow){var Q=g.v3k,r=V.archMove(Q.L,Q.st,v.id,tow);if(!r.ok)return r;var t=now();
if(r.rel){Q.qc.shift();Q.relT=t;try{SND.coin();}catch(e){}}
if(r.arch)Q.qc.push({c:v.dc||v.color||'#888',t:t});return r;}
function preD(g,v){var Q=g.v3k;if(Q.kind!=='arch')return false;
if(V.archOk(Q.L,Q.st,v.id)){archApply(g,v,false);return false;}
v.state='bump';v.t=0;v.k=0;v.block=-1;v.hit=false;try{SND.horn();}catch(e){}Q.fullT=now();
sayL(bank('arch.full','Арка забита! Пусти сначала тех, кто в переулок.','The arch is jammed! Let the side-street cars go first.'),'bench');return true;}
function postD(g,v){if(g.v3k.kind==='arch')deadCheck(g);}
function deadCheck(g){var Q=g.v3k;if(!Q||g.over||Q.kind!=='arch')return;var idle=g.vs.filter(function(u){return u.state==='idle'||u.state==='bump';});if(!idle.length)return;
var occ=g.occ.slice();for(var i=0;i<occ.length;i++)if(occ[i]===-4)occ[i]=-1;
var f=g.vs.filter(function(u){return u.state==='idle'&&canExit(u,occ,g.p.w,g.p.h,u.id).free;});if(!f.length)return;
if(f.some(function(u){return V.archOk(Q.L,Q.st,u.id);}))return;
g.v3dead=1;g.over=true;sayL(K.loseLine(),'bench');try{STAT.ev('v3dead',{k:'arch',i:g.idx+1,l:idle.length});}catch(e){}try{loseLater(1100);}catch(e){}}
function introD(g){var Q=g.v3k,s=Sv();if(!s||!s.tipSeen)return;var k='v3'+Q.kind;
var first=!s.tipSeen[k];if(first){s.tipSeen[k]=1;sv();var tip=el('tip');
var tt=Q.kind==='arch'?Lg('🧱 Узкая арка: кто едет к арке (сторона с кирпичами) — встаёт в очередь на '+Q.L.C+' машины, арка пропускает одну раз в 2 касания. Остальные уезжают в переулок и дают арке время.','🧱 Narrow arch: cars heading to the arch (the brick side) queue up — room for '+Q.L.C+', and it lets one through every 2 taps. Others take the side street and buy the arch time.')
:Lg('🚕 Такси едет не по стрелке — нажми на такси или ✏️ и проведи путь по клеткам до края двора.','🚕 The taxi ignores arrows — tap the taxi or ✏️ and mark its route cell by cell to the edge of the yard.');
if(tip&&tip.style.display!=='block'){tip.textContent=tt;tip.style.display='block';try{TIPM={k:k,z:0,t0:Date.now()};tipAutoHide();}catch(e){}}}
setTimeout(function(){if(curG()===g&&!g.over)sayL(Q.kind==='arch'?bank('arch.hi','Арка у нас узкая, по одной проезжают. Не толпитесь!','Our arch is narrow — one at a time. No crowding!',{}):bank('draw.hi','Такси у нас с характером: куда покажешь, туда и поедет.','Our taxi has a mind of its own: it goes where you point.',{}),'bench',first?false:true);},900);}
function pickD(g,cand){var Q=g.v3k;if(!cand||!cand.length)return null;
if(Q.kind==='arch'){var F=fieldOf(g),k=V.archSolve(F,Q.L,Q.st,30000,true);if(k>=0){var v=g.vs[k];if(cand.indexOf(v)>=0)return v;}
var c2=cand.filter(function(u){return V.archOk(Q.L,Q.st,u.id);});c2.sort(function(a,b){return Q.L.a[a.id]-Q.L.a[b.id];});return c2[0]||null;}
if(Q.kind==='draw'){var nt=cand.filter(function(u){return u.id!==Q.k;});return nt[0]||null;}
return null;}
function botD(g){var Q=g.v3k,c=freeIdle(g),v;
if(Q.kind==='draw'){var tx=g.vs[Q.k];v=c.filter(function(u){return u.id!==Q.k;})[0];
if(!v&&tx&&tx.state==='idle'){var F=fieldOf(g),p=V.drawPath(F,Q.k);if(p){drawGo(g,p);return true;}if(c.indexOf(tx)>=0)v=tx;}
if(!v)return false;}
else{v=pickD(g,c);if(!v){var bump=g.vs.some(function(u){return u.state==='bump'||u.state==='exit';});return bump;}}
var q=toPx(v.cells[0]);WN.tapAt(q[0],q[1]);return true;}
function beginDraw(g,idx,seed){var F=fieldOf(g),k=V.drawPick(F,idx,seed,skipOf(g));if(k<0)return false;var v=g.vs[k];if(!v||v.own)return false;
v.noArrow=true;v.v3taxi=1;try{tint(v,'#f9ca24');}catch(e){}
g.v3k={kind:'draw',d:1,k:k,path:null,on:false,t0:now()};
try{STAT.ev('v3k',{k:'draw',i:idx+1});}catch(e){}ev('draw',{i:idx+1});return true;}
function drawCell(px,py){var c=Math.floor((px-ox)/cs),r=Math.floor((py-oy)/cs);return[c,r];}
function drawStart(g){var Q=g.v3k,tx=g.vs[Q.k];if(!tx||tx.state!=='idle')return;Q.on=true;Q.path=[];Q.pt=now();
try{toast(Lg('✏️ Нажимай клетки от носа такси до края двора. Ещё раз по последней — шаг назад.','✏️ Tap the cells from the taxi’s nose to the edge. Tap the last one again to undo.'),3500);}catch(e){}btnUpd();}
function drawStop(g){var Q=g.v3k;Q.on=false;Q.path=null;btnUpd();}
function drawTap(g,px,py){var Q=g.v3k,tx=g.vs[Q.k],w=g.p.w,h=g.p.h,c=drawCell(px,py),x=c[0],y=c[1];
var last=Q.path.length?Q.path[Q.path.length-1]:tx.cells[0];
if(Q.path.length&&x===last[0]&&y===last[1]){Q.path.pop();return;}
if(x===tx.cells[0][0]&&y===tx.cells[0][1]&&!Q.path.length){
var hx=x,hy=y,o2=hx===0?[-1,0]:hx===w-1?[1,0]:hy===0?[0,-1]:hy===h-1?[0,1]:null;if(o2)drawGo(g,[[hx+o2[0],hy+o2[1]]]);return;}
if(x<0||y<0||x>=w||y>=h)return;
if(Math.abs(x-last[0])+Math.abs(y-last[1])!==1){try{SND.tap();}catch(e){}return;}
var o=g.occ[y*w+x];if(o!==-1){try{SND.horn();toast(Lg('Тут занято — объезжай','Taken — go around'));}catch(e){}return;}
for(var i=0;i<Q.path.length;i++)if(Q.path[i][0]===x&&Q.path[i][1]===y)return;
Q.path.push([x,y]);try{SND.click();}catch(e){}
if(x===0||y===0||x===w-1||y===h-1){var D2=x===0?[-1,0]:x===w-1?[1,0]:y===0?[0,-1]:[0,1];var path=Q.path.concat([[x+D2[0],y+D2[1]]]);drawGo(g,path);}}
function drawGo(g,path){var Q=g.v3k,v=g.vs[Q.k];if(!v||v.state!=='idle')return;var w=g.p.w,h=g.p.h;
var inF=path.filter(function(p){return p[0]>=0&&p[1]>=0&&p[0]<w&&p[1]<h;});
var lp=path[path.length-1],pp=inF.length?inF[inF.length-1]:v.cells[0],dx=lp[0]-pp[0],dy=lp[1]-pp[1];
var tr=v.cells.slice().reverse().map(function(c){return[c[0],c[1]];});inF.forEach(function(p){tr.push([p[0],p[1]]);});
var ext=Math.max(w,h)+v.L+3;for(var k=1;k<=ext;k++)tr.push([pp[0]+dx*k,pp[1]+dy*k]);
v.track=tr;v.bend=tr.length;v.v3path=1;Q.on=false;Q.path=null;btnUpd();
G.moves++;G.idle=0;try{startExit(v,{free:true,k:inF.length});}catch(e){warn('drawGo',e);}
try{if(typeof ambTick==='function')ambTick();}catch(e){}
sayL(bank('draw.go','Ишь, таксист! Дворами поехал.','Look at that cabbie — cutting through the yards!'),'bench',true);ev('dgo',{n:inF.length});}
function taxiDir(v){if(!v.v3path||v.state!=='exit')return;var tr=v.track,he=Math.max(0,v.s+v.L-1),i=Math.min(tr.length-2,Math.floor(he)),dx=tr[i+1][0]-tr[i][0],dy=tr[i+1][1]-tr[i][1];
for(var d=0;d<4;d++)if(V.DIRS[d][0]===dx&&V.DIRS[d][1]===dy){v.dir=d;break;}}
var tap0=WN.tapAt,se0=WN.startExit,tow0=WN.tow,upd0=WN.update,win0=WN.win;
if(typeof tap0==='function')WN.tapAt=function(px,py){var g=curG();
if(g&&!g.over&&mine(g)&&g.v3k.kind==='draw'){var Q=g.v3k;if(Q.on){drawTap(g,px,py);return;}
var c=drawCell(px,py),o=c[0]>=0&&c[1]>=0&&c[0]<g.p.w&&c[1]<g.p.h?g.occ[c[1]*g.p.w+c[0]]:-1;
if(o===Q.k&&!g.towMode&&g.vs[Q.k].state==='idle'){drawStart(g);return;}}
if(g&&!g.over&&g.v3boost&&!g.towMode){boostTap(g,px,py);return;}
var pre=g?g.vs.map(function(v){return v.state;}):null;var r=tap0.apply(this,arguments);
try{if(g&&pre&&g===curG())g.vs.forEach(function(v,i){if(v.state==='bump'&&pre[i]!=='bump')recEv(g,{k:'bump',i:i,x:v.k||0});});}catch(e){}
return r;};
if(typeof se0==='function')WN.startExit=function(v,r,delay){var g=curG();try{if(g)recEv(g,{k:'go',i:v.id,dl:delay||0,tr:v.v3path?v.track.map(function(p){return[p[0],p[1]];}):null,ex:r&&r.k});}catch(e){}return se0.apply(this,arguments);};
if(typeof tow0==='function')WN.tow=function(v){var g=curG();try{if(g)recEv(g,{k:'tow',i:v.id});}catch(e){}return tow0.apply(this,arguments);};
if(typeof upd0==='function')WN.update=function(dt){var g=curG();var r=upd0.apply(this,arguments);
try{if(g){if(mine(g)&&g.v3k.kind==='draw'){var v=g.vs[g.v3k.k];if(v)taxiDir(v);}if(g.mode==='rest')restTick(g,dt);}}catch(e){warn('upd',e);}return r;};
if(typeof win0==='function')WN.win=function(){var g=curG();if(g&&g.mode==='rest'&&!g.restWon)return restWin(g);try{if(g)lastWin=snapRec(g);}catch(e){}return win0.apply(this,arguments);};
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function label(c,x,y,txt,sz,al){c.font='800 '+sz+'px Rubik,-apple-system,sans-serif';c.textAlign=al||'left';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.45)';c.strokeText(txt,x,y);c.fillStyle='#fff';c.fillText(txt,x,y);}
function bricks(c,g,E,t){var w=g.p.w,h=g.p.h,a=toPx([-.5,-.5]),b=toPx([w-.5,h-.5]),th=Math.max(6,cs*.22),x,y,len,hor=E===0||E===2;
if(E===0){x=a[0];y=a[1]-th;len=b[0]-a[0];}else if(E===2){x=a[0];y=b[1];len=b[0]-a[0];}else if(E===3){x=a[0]-th;y=a[1];len=b[1]-a[1];}else{x=b[0];y=a[1];len=b[1]-a[1];}
c.save();c.fillStyle='#b5523b';if(hor)c.fillRect(x,y,len,th);else c.fillRect(x,y,th,len);
c.strokeStyle='rgba(255,230,210,.55)';c.lineWidth=1;var bw=th*1.8;
for(var k=0;k<len;k+=bw){c.beginPath();if(hor){c.moveTo(x+k,y);c.lineTo(x+k,y+th);}else{c.moveTo(x,y+k);c.lineTo(x+th,y+k);}c.stroke();}
c.beginPath();if(hor){c.moveTo(x,y+th/2);c.lineTo(x+len,y+th/2);}else{c.moveTo(x+th/2,y);c.lineTo(x+th/2,y+len);}c.stroke();c.restore();}
function drawD(c,Wd,Hd,t,g){var Q=g.v3k,tn=now();
if(Q.kind==='arch'){[Q.L.E,Q.L.E2].forEach(function(E){if(E>=0)bricks(c,g,E,t);});
var hh=K.res(g),y0=Hd-hh,C=Q.L.C,sw=Math.min(54,(Wd-150)/Math.max(3,C)),sh=hh*.5;
c.save();c.fillStyle='rgba(60,35,25,.82)';c.fillRect(0,y0,Wd,hh);
label(c,10,y0+13,'🧱 '+Lg('Узкая арка','Narrow arch'),12);
var fl=Q.fullT?Math.max(0,1-(tn-Q.fullT)/.6):0;
for(var k=0;k<C;k++){var x=10+k*(sw+6),y=y0+hh*.36;rr(c,x,y,sw,sh,6);c.fillStyle=fl>0?'rgba(231,76,60,'+(.35+.4*fl)+')':'rgba(255,255,255,.14)';c.fill();
var q=Q.qc[k];if(q){var a=Math.min(1,(tn-q.t)/.25),s2=.6+.4*a;c.save();c.translate(x+sw/2,y+sh/2);c.scale(s2,s2);rr(c,-sw*.38,-sh*.32,sw*.76,sh*.64,sh*.2);c.fillStyle=q.c;c.fill();c.lineWidth=1.5;c.strokeStyle='rgba(0,0,0,.35)';c.stroke();c.restore();}}
var nx=(Q.st.n%2===0)?2:1,tx=10+C*(sw+6)+8;
label(c,tx,y0+hh*.5,Q.st.q?(nx===1?Lg('выпустит на след. касании','lets one out next tap'):Lg('выпустит через 2 касания','lets one out in 2 taps')):Lg('арка свободна','arch is clear'),11);
var rp=Q.relT?Math.max(0,1-(tn-Q.relT)/.5):0;if(rp>0){c.globalAlpha=rp;label(c,tx,y0+hh*.82,'→ '+Lg('проехал!','through!'),12);}
c.restore();}
if(Q.kind==='draw'){var tx2=g.vs[Q.k];if(tx2&&tx2.state==='idle'&&tx2.ap>=1){var p=toPx(tx2.cells[0]),bob=isCalm()?0:Math.abs(Math.sin(t*2.6))*cs*.12;
c.save();c.font=(cs*.42|0)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('✏️',p[0],p[1]-cs*.55-bob);c.restore();}
if(Q.on&&Q.path){c.save();c.strokeStyle='rgba(249,202,36,.95)';c.lineWidth=Math.max(4,cs*.18);c.lineCap='round';c.lineJoin='round';c.setLineDash([cs*.25,cs*.18]);
c.beginPath();var h0=toPx(tx2.cells[0]);c.moveTo(h0[0],h0[1]);Q.path.forEach(function(q){var pp=toPx(q);c.lineTo(pp[0],pp[1]);});c.stroke();c.setLineDash([]);
var last=Q.path.length?Q.path[Q.path.length-1]:tx2.cells[0];for(var d=0;d<4;d++){var nx2=last[0]+V.DIRS[d][0],ny2=last[1]+V.DIRS[d][1];
if(nx2<0||ny2<0||nx2>=g.p.w||ny2>=g.p.h||g.occ[ny2*g.p.w+nx2]!==-1)continue;var q2=toPx([nx2,ny2]);c.beginPath();c.arc(q2[0],q2[1],cs*.18,0,7);c.fillStyle='rgba(249,202,36,.35)';c.fill();}
c.restore();}}}
var BOX=null;
function boostUi(){var g=curG(),sg=el('scr-game');if(!sg)return;if(!BOX){BOX=D.createElement('div');BOX.id='v3dB';sg.appendChild(BOX);
var st=D.createElement('style');st.textContent='#v3dB{position:absolute;left:8px;bottom:84px;display:flex;flex-direction:column;z-index:6}#v3dB button{width:52px;height:52px;margin-top:8px;border-radius:50%;border:3px solid #fff;background:#2d3436;color:#fff;font:800 20px Rubik,-apple-system,sans-serif;box-shadow:0 3px 0 rgba(0,0,0,.25);position:relative}#v3dB button.on{background:#f39c12}#v3dB button small{position:absolute;right:-4px;top:-4px;background:#e74c3c;border-radius:10px;font-size:12px;padding:1px 5px;line-height:15px}';D.head.appendChild(st);}
btnUpd();}
function boostOk(g){if(!g||g.over||g.daily||g.v3k||g.mode==='rest'||(g.mode&&g.mode!=='n'))return false;if(g.v3h&&g.v3h.M&&g.v3h.M.role&&g.v3h.M.role.some(function(r){return r;}))return false;return true;}
function btnUpd(){if(!BOX)return;var g=curG(),p=P(),h='';
if(g&&!g.over&&mine(g)&&g.v3k.kind==='draw'&&g.vs[g.v3k.k]&&g.vs[g.v3k.k].state==='idle')h+='<button class="noenter'+(g.v3k.on?' on':'')+'" id="v3dDr" aria-label="'+Lg('Объезд','Detour')+'">'+(g.v3k.on?'✕':'✏️')+'</button>';
if(boostOk(g)&&is('zhezl')&&p.zh)h+='<button class="noenter'+(g.v3boost==='zh'?' on':'')+'" id="v3dZh" aria-label="'+Lg('Жезл','Baton')+'">🚦<small>'+p.zh+'</small></button>';
if(boostOk(g)&&is('push')&&p.pu)h+='<button class="noenter'+(g.v3boost==='pu'?' on':'')+'" id="v3dPu" aria-label="'+Lg('Толчок','Push')+'">🤚<small>'+p.pu+'</small></button>';
BOX.innerHTML=h;var b=el('v3dDr');if(b)b.onclick=function(e){e.stopPropagation();var g2=curG();if(!g2||!mine(g2))return;if(g2.v3k.on)drawStop(g2);else drawStart(g2);};
b=el('v3dZh');if(b)b.onclick=function(e){e.stopPropagation();boostMode('zh');};b=el('v3dPu');if(b)b.onclick=function(e){e.stopPropagation();boostMode('pu');};}
function boostMode(k){var g=curG();if(!boostOk(g))return;g.v3boost=g.v3boost===k?null:k;if(g.v3boost){g.towMode=false;try{el('gTow').classList.remove('on');}catch(e){}
toast(k==='zh'?Lg('🚦 Жезл: нажми на машину — повернём ей нос','🚦 Baton: tap a car to turn its nose'):Lg('🤚 Толчок: нажми на машину — сдвинем на клетку','🤚 Push: tap a car to nudge it one cell'),3000);}btnUpd();}
function boostTap(g,px,py){var c=drawCell(px,py),w=g.p.w,h=g.p.h;if(c[0]<0||c[1]<0||c[0]>=w||c[1]>=h){g.v3boost=null;btnUpd();return;}
var id=g.occ[c[1]*w+c[0]];if(id<0){try{id=nearCar(px,py);}catch(e){}}if(id<0){g.v3boost=null;btnUpd();return;}
var v=g.vs[id];if(!v||v.state!=='idle'||v.kind){toast(Lg('Эту не трогаем','Not this one'));return;}
var F=fieldOf(g),k=g.v3boost,o=k==='zh'?V.turnOpts(F,id):V.pushOpts(F,id);
if(!o.length){toast(k==='zh'?Lg('Этой развернуться негде','No room to turn this one'):Lg('Этой некуда сдвинуться','No room to nudge this one'));return;}
var AR=['⬆️','➡️','⬇️','⬅️'],hh='<h2>'+(k==='zh'?'🚦 '+Lg('Куда повернуть?','Which way?'):'🤚 '+Lg('Куда толкнуть?','Which way?'))+'</h2><div class="row">';
o.forEach(function(x,j){var lbl=k==='zh'?AR[x.d]+' '+(x.k==='rev'?Lg('развернуть','turn around'):Lg('повернуть','turn')):(x.k==='fwd'?Lg('⏩ вперёд','⏩ forward'):Lg('⏪ назад','⏪ back'));hh+='<button class="btn green noenter" data-bo="'+j+'">'+lbl+'</button>';});
hh+='<button class="btn" id="mCancel">'+Lg('Отмена','Cancel')+'</button></div>';
try{modal(hh);}catch(e){return;}
var q=D.querySelectorAll('[data-bo]');for(var i=0;i<q.length;i++)q[i].onclick=function(){var x=o[+this.getAttribute('data-bo')];try{hideModal();}catch(e){}boostApply(g,v,x,k);};
el('mCancel').onclick=function(){try{hideModal();}catch(e){}};}
function boostApply(g,v,x,k){if(curG()!==g||g.over||v.state!=='idle')return;var w=g.p.w,p=P();
v.cells.forEach(function(c){if(g.occ[c[1]*w+c[0]]===v.id)g.occ[c[1]*w+c[0]]=-1;});
v.cells=x.c.map(function(c){return[c[0],c[1]];});v.dir=x.d;v.cells.forEach(function(c){g.occ[c[1]*w+c[0]]=v.id;});
try{v.track=buildTrack(v,w,g.p.h);v.bend=0;for(var j=1;j<v.L;j++){var t=v.track;if(t[j][0]-t[j-1][0]!==t[j+1][0]-t[j][0]||t[j][1]-t[j-1][1]!==t[j+1][1]-t[j][1])v.bend=j;}}catch(e){warn('track',e);}
if(g.v3h&&g.v3h.M&&g.v3h.M.cars&&g.v3h.M.cars[v.id])try{g.v3h.M.cars[v.id]={c:v.cells,d:v.dir};}catch(e){}
try{carsKey='';}catch(e){}v.flash=1;try{SND.click();}catch(e){}
if(k==='zh')p.zh=Math.max(0,p.zh-1);else p.pu=Math.max(0,p.pu-1);sv();g.v3boost=null;btnUpd();
recEv(g,{k:'turn',i:v.id,c:v.cells.map(function(c){return[c[0],c[1]];}),d:v.dir});
sayL(k==='zh'?bank('zhezl.use','Регулировщик из тебя что надо! Палочкой — и поехал.','You’d make a fine traffic cop! One wave and off it goes.'):bank('push.use','Толкнули дружно — и пошла родимая!','One good shove — and off she rolls!'),'bench',true);
ev(k==='zh'?'zh':'pu',{i:g.idx+1});}
function hooks(){if(WN.V3P&&typeof V3P.boost==='function'){
if(is('zhezl'))V3P.boost('zhezl',{ic:'🚦',name:'Жезл регулировщика',en:'Traffic baton',c:60,ad:true,have:function(){return P().zh;},give:function(how){P().zh=Math.min(99,P().zh+1);sv();ev('buy',{b:'zh',h:how||''});btnUpd();}});
if(is('push'))V3P.boost('push',{ic:'🤚',name:'3 толчка',en:'3 pushes',c:50,ad:true,have:function(){return P().pu;},give:function(how){P().pu=Math.min(99,P().pu+3);sv();ev('buy',{b:'pu',h:how||''});btnUpd();}});}
if(WN.V3P&&is('clip'))V3P.clip=clipCard;}
function gift(){var s=Sv(),p=P();if(!s||p.g||!((s.levelsDone|0)>=25))return;p.g=1;if(is('zhezl'))p.zh+=1;if(is('push'))p.pu+=3;sv();
setTimeout(function(){try{toast(Lg('🎁 Шура подарила: 🚦 жезл и 🤚 3 толчка — кнопки слева во дворе','🎁 A gift from Shura: 🚦 a baton and 🤚 3 pushes — buttons on the left in the yard'),4500);}catch(e){}},1500);}
var REST_IDX=7;
function restStart(){var s=Sv();if(!s)return;var p0=ok(function(){return levelParams(5);},null);if(!p0)return;var base=(Date.now()/1000|0)%100000,pick=null,best=null,bd=99;
for(var k=0;k<V.REST.tries&&pick==null;k++){var seed=base*7+k*131,lv=ok(function(){return genLevel(p0,seed);},null);if(!lv)continue;
var F=V.field(p0.w,p0.h,lv.vehicles.map(function(v){return{c:v.cells,d:v.dir};}),null),Ly=ok(function(){return K.build('column',F,REST_IDX,seed,{});},null);
if(!Ly)continue;if(V.restFit(Ly.norm))pick=seed;else{var dd=Ly.norm<V.REST.lo?V.REST.lo-Ly.norm:Ly.norm-V.REST.hi;if(dd<bd){bd=dd;best=seed;}}}
if(pick==null)pick=best!=null?best:base;ev('rest',{a:'go'});try{hideModal();}catch(e){}
try{startLevel(REST_IDX,false,{mode:'rest',p:p0,seed:pick});}catch(e){warn('rest',e);}}
function beginRest(g,idx,seed){var F=fieldOf(g),Ly=K.build('column',F,idx,seed,skipOf(g));if(!Ly)return false;
if(g.amb)g.amb.done=true;g.police=-1;g.soft=true;g.hearts=3;g.restWon=0;g.wh=0;
g.v3k={kind:'column',L:Ly,st:{taps:0},born:[],fx:[],t0:now(),bought:0,rest:1};
g.vs.forEach(function(v,i){var c=Ly.col[i];if(c>=0)try{tint(v,K.CFG.pal[c]);}catch(e){}});
setTimeout(function(){if(curG()!==g)return;try{var e=el('gLevel');if(e)e.textContent='☕ '+Lg('Отдых','Rest');var hh=el('gHearts');if(hh)hh.style.visibility='hidden';}catch(e){}
sayL(bank('rest.hi','Отдохни, милок. Тут одной кнопкой: нажал — и вся колонна поехала. Задумаешься — свистну.','Have a rest, dear. One tap here: press — and the whole column goes. If you dawdle, I’ll whistle.'),'bench');},500);
return true;}
function restTick(g,dt){if(g.over||g.restWon)return;var Q=g.v3k;if(!Q||!Q.rest)return;g.wh=(g.wh||0)+dt;if(g.wh<5||(typeof modalOn!=='undefined'&&modalOn))return;g.wh=0;
var f=freeIdle(g);if(!f.length)return;var best=f[0],bn=-1;f.forEach(function(v){var c=Q.L.col[v.id],n=f.filter(function(u){return Q.L.col[u.id]===c;}).length;if(n>bn){bn=n;best=v;}});
try{SND.siren&&!isCalm()?SND.click():0;}catch(e){}sayL(bank('rest.wh','Фьють! Разъезжайтесь, голубчики!','Wheet! Off you go, my dears!'),'bench',true);
var r=canExit(best,g.occ,g.p.w,g.p.h,best.id);if(r.free){WN.startExit(best,r);try{K0.post(best);}catch(e){}}}
function drawRest(c,Wd,Hd,g){var hh=K.res(g),y0=Hd-hh,taps=g.v3k.st.taps||0,left=Math.max(0,Math.ceil(5-(g.wh||0)));c.save();c.fillStyle='rgba(40,60,50,.82)';c.fillRect(0,y0,Wd,hh);
label(c,12,y0+hh/2,'☕ '+Lg('Отдых · касаний: ','Rest · taps: ')+taps+'   🎵 '+Lg('свисток через ','whistle in ')+left+Lg(' с',' s'),12);c.restore();}
function restWin(g){g.restWon=1;g.over=true;try{YG.stop();}catch(e){}try{SND.win();}catch(e){}var p=P(),dk=ok(function(){return V3.dk();},0);p.rn++;p.rd=dk;sv();
ev('rest',{a:'win',t:g.v3k&&g.v3k.st?g.v3k.st.taps:0,n:p.rn});try{STAT.end('win',{mv:g.moves});}catch(e){}
var h='<h2>☕ '+Lg('Отдохнули','Nice rest')+'</h2>'+ok(function(){return shura(bank('rest.win','Вот и славно. Чайку бы теперь — и снова во двор.','Lovely. A cup of tea now — and back to the yard.'),'happy');},'')+
'<p>'+Lg('Двор отдыха: звёзд и монет не даёт, зато чашек ☕ — ','A rest yard: no stars or coins, but cups ☕ — ')+'<b>'+p.rn+'</b></p>'+
'<div class="row"><button class="btn green" id="v3dRa">☕ '+Lg('Ещё разок','Once more')+'</button><button class="btn" id="v3dRh">'+Lg('На главный','Home')+'</button></div>';
try{modal(h);}catch(e){return;}
el('v3dRa').onclick=function(){restStart();};
el('v3dRh').onclick=function(){try{hideModal();}catch(e){}if(!(WN.UI&&UI.winTop&&UI.go('home')))try{openMap();}catch(e){}};}
function restTile(){if(!is('rest'))return null;var s=Sv();if(!s||(s.levelsDone|0)<12)return null;var p=P();
var o={ic:'☕',t:Lg('Отдохнуть','Take a rest'),s:Lg('двор одной кнопкой, без аварий','a one-tap yard, no crashes')+(p.rn?' · ☕ '+p.rn:''),tag:Lg('устал?','tired?'),cls:''};
return ok(function(){return UI.tile(o);},'<button class="hsT"><span class="hsI">☕</span><span class="hsB"><b>'+esc(o.t)+'</b><small>'+esc(o.s)+'</small></span></button>');}
try{(WN.homeSlots=WN.homeSlots||[]).push({id:'deep-rest',order:70,zone:'feed',render:function(){return restTile();},
mount:function(e){var b=e.querySelector('button')||e;b.onclick=function(){restStart();};}});}catch(e){}
var lastWin=null;
function recBegin(g){var w=g.p.w,h=g.p.h;g.v3rec={t0:now(),p:{w:w,h:h},obst:(g.obst||[]).map(function(o){return[o[0],o[1]];}),occ0:g.occ.slice(),
vs:g.vs.map(function(v){var c={};for(var k in v){var x=v[k];if(typeof x!=='function'&&k!=='track'&&k!=='cells'&&(x===null||typeof x!=='object'))c[k]=x;}
c.cells=v.cells.map(function(p){return[p[0],p[1]];});c.track=v.track.map(function(p){return[p[0],p[1]];});c.state='idle';c.s=0;c.t=0;c.ap=1;c.flash=0;
['mdl','vy','look'].forEach(function(k){if(v[k]!=null)c[k]=v[k];});return c;}),ev:[]};}
function recEv(g,e){var R=g.v3rec;if(!R||R.ev.length>400)return;e.t=now()-R.t0;R.ev.push(e);}
function snapRec(g){var R=g.v3rec;if(!R)return null;return{R:R,idx:g.idx,daily:g.daily,tod:g.tod,crashes:g.crashes||0,sec:Math.round(now()-R.t0),n:g.vs.length};}
var PL=null;
function play(mode,snap){if(!snap||!snap.R)return;stopPlay();var R=snap.R,ev0=R.ev,box=D.createElement('div');box.id='v3dPl';
box.innerHTML='<div class="v3dPw"><canvas id="v3dCv"></canvas><div class="v3dSay" id="v3dSay"></div><div class="row"><button class="btn noenter" id="v3dAg">↻ '+Lg('Ещё раз','Again')+'</button>'+
(mode==='wave'&&WN.V3P&&is('clip')?'<button class="btn green noenter" id="v3dCm">📷 '+Lg('В фотоаппарат','To the camera')+'</button>':'')+'<button class="btn noenter" id="v3dX">'+Lg('Закрыть','Close')+'</button></div></div>';
D.body.appendChild(box);if(!el('v3dCss')){var st=D.createElement('style');st.id='v3dCss';st.textContent='#v3dPl{position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(20,24,30,.92);z-index:9990;display:flex;align-items:center;justify-content:center}'+
'.v3dPw{width:94vw;max-width:520px;max-height:96vh;display:flex;flex-direction:column;align-items:center}#v3dCv{width:100%;border-radius:14px;background:#5d6470}.v3dSay{color:#fff;font:600 17px/1.35 Rubik,-apple-system,sans-serif;margin:10px 4px;min-height:48px;text-align:center}'+
'.v3dSay b{color:#ffd23f}#v3dPl .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}';D.head.appendChild(st);}
var cv=el('v3dCv'),cw=Math.min(D.documentElement.clientWidth*.94,520),gw=R.p.w,gh=R.p.h,cell=Math.floor(Math.min(cw/(gw+1),(D.documentElement.clientHeight*.6)/(gh+1))),dpr=isLow()?1:Math.min(2,WN.devicePixelRatio||1);
var Wc=cell*(gw+1),Hc=cell*(gh+1);cv.width=Wc*dpr;cv.height=Hc*dpr;cv.style.width=Wc+'px';cv.style.height=Hc+'px';cv.style.maxWidth='100%';var c=cv.getContext('2d');c.scale(dpr,dpr);
var o0=cell/2,tp=function(p){return[o0+(p[0]+.5)*cell,o0+(p[1]+.5)*cell];};
var a=0,b=ev0.length-1,times,crash=-1,T;
if(mode==='crash'){var wdw=V.crashWindow(ev0);if(!wdw)return;a=wdw.a;b=wdw.b;crash=wdw.crash;times=V.replayTimes(ev0.slice(a,b+1),1.2);}
else{var wt=V.waveTimes(ev0,5);times=[];for(var k=0;k<ev0.length;k++)times.push(wt[k]!=null?wt[k]+.4:-1);}
var vs=R.vs.map(function(v){var c2={};for(var k in v)c2[k]=v[k];c2.cells=v.cells.map(function(p){return p.slice();});c2.track=v.track.map(function(p){return p.slice();});return c2;});
for(var j=0;j<a;j++)applyInstant(vs,ev0[j]);
var list=[];for(j=a;j<=b;j++){var tt=mode==='crash'?times[j-a]:times[j];if(tt<0)continue;if(mode==='wave'&&ev0[j].k==='bump')continue;list.push({e:ev0[j],t:tt,j:j});}
T=list.length?list[list.length-1].t+(mode==='wave'?1.8:2.2):2;
var sayEl=el('v3dSay'),lines=mode==='crash'?commentary(snap):[bank('clip.a','Смотри, как двор пустеет…','Watch the yard empty out…'),bank('clip.b','Пусто! Хоть бельё развешивай.','Empty! You could hang out the washing.')];
var parts=[],t0=now(),last=t0,slow=1,done=false,shown=-1;
function step(){if(!PL||PL.box!==box)return;var tn=now(),dt=Math.min(.05,tn-last);last=tn;
var tt=PL.t;var nearCrash=crash>=0&&list.some(function(x){return x.j===crash&&tt>x.t-.25&&tt<x.t+.9;});slow=nearCrash&&!isCalm()?.4:1;PL.t+=dt*slow;tt=PL.t;
list.forEach(function(x){if(!x.on&&tt>=x.t){x.on=1;x.t0=tt;var v=vs[x.e.i];if(!v)return;
if(x.e.k==='go'){if(x.e.tr)v.track=x.e.tr.map(function(p){return p.slice();}),v.bend=v.track.length;v.state='exit';v.exitS=(x.e.ex||0)+v.L+.9;v.t=0;}
else if(x.e.k==='tow'){v.state='tow';v.t=0;}
else if(x.e.k==='turn'){v.cells=x.e.c.map(function(p){return p.slice();});v.dir=x.e.d;v.track=ok(function(){return buildTrack(v,gw,gh);},v.track);v.flash=1;}
else if(x.e.k==='bump'){v.state='bump';v.t=0;v.k=x.e.x||0;v.hit=0;}}});
vs.forEach(function(v){if(v.state==='exit'){v.t+=dt*slow;v.s=7*v.t+17*v.t*v.t;if(v.s>=v.exitS)v.state='gone';}
else if(v.state==='tow'){v.t+=dt*slow;if(v.t>.9)v.state='gone';}
else if(v.state==='bump'){v.t+=dt*slow;var peak=v.k+.32,t1=Math.max(.06,peak/9);if(v.t<t1)v.s=peak*(v.t/t1);else{if(!v.hit){v.hit=1;boom(v);}var q=Math.min(1,(v.t-t1)/.28);v.s=peak*(1-(1-(1-q)*(1-q)));if(q>=1){v.s=0;v.state='idle';}}}
if(v.flash>0)v.flash=Math.max(0,v.flash-dt*2.5);});
parts=parts.filter(function(p){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;return p.life>0;});
var ph=mode==='crash'?(crash>=0&&list.some(function(x){return x.j===crash&&x.on;})?(tt>((list.filter(function(x){return x.j===crash;})[0]||{}).t+1.2)?2:1):0):(tt<T-1.6?0:1);
if(ph!==shown){shown=ph;var ln=lines[Math.min(ph,lines.length-1)];if(ln)sayEl.innerHTML='<b>'+esc(Lg('Шура:','Shura:'))+'</b> '+esc(ln);}
render();if(tt<T)PL.raf=requestAnimationFrame(step);else{done=true;PL.end=1;if(mode==='wave')PL.img=ok(function(){return cv.toDataURL('image/jpeg',.82);},null);}}
function boom(v){var D2=V.DIRS[v.dir],hp=tp([v.cells[0][0]+D2[0]*(v.k+.5),v.cells[0][1]+D2[1]*(v.k+.5)]);PL.shake=isCalm()?0:6;
if(isLow()||isCalm())return;for(var i=0;i<12;i++){var an=Math.random()*6.28,sp=40+Math.random()*90;parts.push({x:hp[0],y:hp[1],vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,life:.5});}}
function render(){c.save();c.clearRect(0,0,Wc,Hc);var sh=PL.shake||0;if(sh>0){c.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);PL.shake=Math.max(0,sh-1);}
c.fillStyle='#5d6470';c.fillRect(0,0,Wc,Hc);c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=1;
for(var x=0;x<=gw;x++){c.beginPath();c.moveTo(o0+x*cell,o0);c.lineTo(o0+x*cell,o0+gh*cell);c.stroke();}for(var y=0;y<=gh;y++){c.beginPath();c.moveTo(o0,o0+y*cell);c.lineTo(o0+gw*cell,o0+y*cell);c.stroke();}
R.obst.forEach(function(o){var p=tp(o);c.fillStyle='#3c9a4a';c.beginPath();c.arc(p[0],p[1],cell*.36,0,7);c.fill();});
vs.forEach(function(v){if(v.state==='gone')return;c.save();if(v.state==='tow')c.globalAlpha=Math.max(0,1-v.t/.9);
try{drawVehicle(c,v,v.s||0,tp,cell,v.flash>0?{glow:v.flash*.8}:null);}catch(e){rr(c,tp(v.cells[0])[0]-cell*.4,tp(v.cells[0])[1]-cell*.4,cell*.8,cell*.8,cell*.2);c.fillStyle=v.dc||v.color||'#888';c.fill();}
c.restore();});
parts.forEach(function(p){c.fillStyle='rgba(255,170,40,'+Math.max(0,p.life*2)+')';c.beginPath();c.arc(p.x,p.y,cell*.07,0,7);c.fill();});
if(mode==='wave'){c.font='800 '+Math.max(14,cell*.5|0)+'px Rubik,-apple-system,sans-serif';c.textAlign='left';c.textBaseline='top';c.fillStyle='rgba(255,255,255,.85)';
c.fillText((snap.daily?Lg('Задание дня','Daily'):Lg('Двор ','Yard ')+(snap.idx+1))+' · '+snap.n+' 🚗',o0,o0*.2);}
c.restore();}
PL={box:box,t:0,raf:0,shake:0};render();PL.raf=requestAnimationFrame(step);
el('v3dX').onclick=stopPlay;el('v3dAg').onclick=function(){play(mode,snap);};
var cm=el('v3dCm');if(cm)cm.onclick=function(){var im=PL&&PL.img;if(!im){im=ok(function(){return cv.toDataURL('image/jpeg',.82);},null);}
CLIP={img:im,idx:snap.idx,n:snap.n,sec:snap.sec,daily:snap.daily};P().cl++;sv();ev('clip',{i:snap.idx+1});try{V3.emit('deep:clip',CLIP);}catch(e){}stopPlay();try{V3P.cam();}catch(e){toast(Lg('📷 Клип в фотоаппарате','📷 Clip saved to the camera'));}};
ev(mode==='crash'?'rp':'wave',{i:snap.idx+1});if(mode==='crash'){P().rp++;sv();}}
function applyInstant(vs,e){var v=vs[e.i];if(!v)return;if(e.k==='go'||e.k==='tow')v.state='gone';else if(e.k==='turn'){v.cells=e.c.map(function(p){return p.slice();});v.dir=e.d;try{v.track=buildTrack(v,G.p.w,G.p.h);}catch(x){}}}
function stopPlay(){if(PL){try{cancelAnimationFrame(PL.raf);}catch(e){}if(PL.box&&PL.box.parentNode)PL.box.parentNode.removeChild(PL.box);PL=null;}}
function commentary(snap){var ctx={lv:snap.idx+1,n:snap.crashes};
return[bank('replay.pre','Так, смотрим повтор. Вот он едет, ни о чём не думает…','Right, let’s watch the replay. Here he goes, not a care in the world…',ctx),
bank('replay.crash','Бабах! Вот тут-то голубчик и не посмотрел.','Bang! That’s where the dear forgot to look.',ctx),
bank('replay.after','Ничего, железо выправят. А ты теперь знаешь, кого пускать первым.','No harm, the metal will straighten out. And now you know who goes first.',ctx)];}
try{(WN.loseSlots=WN.loseSlots||[]).push({id:'deep-replay',order:60,fit:2,render:function(){var g=curG();if(!is('replay')||!g||!g.v3rec||!V.crashWindow(g.v3rec.ev))return null;
return'<div class="v3dRw"><button class="btn sec noenter" id="v3dRp">🎬 '+Lg('Повтор аварии','Crash replay')+'</button></div>';},
mount:function(e){var b=e.querySelector('#v3dRp');if(b)b.onclick=function(){var g=curG();play('crash',snapRec(g));};}});}catch(e){}
try{(WN.winSlots=WN.winSlots||[]).push({id:'deep-clip',order:80,zone:'extra',fit:4,render:function(){var g=curG();if(!is('clip')||!lastWin||!g||g.mode==='rest'||lastWin.n<5)return null;
return'<div class="v3dRw"><button class="btn sec noenter" id="v3dCl">🎬 '+Lg('5 секунд счастья','5 seconds of joy')+'</button></div>';},
mount:function(e){try{var u=e.closest?e.closest('.uslot'):null;(u||e).setAttribute('data-keep','1');}catch(x){}var b=e.querySelector('#v3dCl');if(b)b.onclick=function(){play('wave',lastWin);};}});}catch(e){}
var CLIP=null;
function clipCard(){if(!CLIP)return{head:Lg('5 секунд счастья','5 seconds of joy'),big:'🎬',lines:[Lg('Пройди двор и нажми «🎬 5 секунд счастья» в окне победы.','Clear a yard and tap “🎬 5 seconds of joy” in the win window.')]};
return{head:Lg('5 секунд счастья','5 seconds of joy'),img:CLIP.img,lines:[(CLIP.daily?Lg('Задание дня','Daily'):Lg('Двор ','Yard ')+(CLIP.idx+1))+' · '+CLIP.n+' 🚗 · '+CLIP.sec+Lg(' с',' s')]};}
try{if(WN.V3&&V3.sub){V3.sub('boot',function(){hooks();gift();},'deep');V3.sub('win',function(){gift();},'deep');}}catch(e){}
setTimeout(function(){try{hooks();}catch(e){}},0);
WN.V3D.ui={last:function(){return lastWin;},play:play,stop:stopPlay,rest:restStart,clip:function(){return CLIP;},boost:boostMode,P:P,is:is};
})();