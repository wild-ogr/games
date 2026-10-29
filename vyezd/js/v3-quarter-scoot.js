(function(root){
'use strict';
var DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
var CFG={EVERY:5,MAXON:2,MAXN:4,MINLEFT:2,TOP:10,TRY:10};
function rng(seed){var a=seed>>>0;return function(){a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function pass(o,self){return o===-1||o===-4||o===self;}
function freeOf(c,occ,w,h,self){var d=DIRS[c.d],x=c.c[0][0]+d[0],y=c.c[0][1]+d[1];
while(x>=0&&y>=0&&x<w&&y<h){if(!pass(occ[y*w+x],self))return false;x+=d[0];y+=d[1];}return true;}
function clear(c,occ,w,id){for(var k=0;k<c.c.length;k++){var q=c.c[k][1]*w+c.c[k][0];if(occ[q]===id)occ[q]=-1;}}
function solvable(m){var occ=m.occ.slice(),al=m.cars.slice(),g=0;
while(al.length&&g++<500){var rm=[];for(var i=0;i<al.length;i++)if(freeOf(al[i],occ,m.w,m.h,al[i].id))rm.push(i);
if(!rm.length)return false;for(var j=rm.length-1;j>=0;j--){clear(al[rm[j]],occ,m.w,al[rm[j]].id);al.splice(rm[j],1);}}
return!al.length;}
function rays(m){var r=[],i;for(i=0;i<m.w*m.h;i++)r.push(0);
m.cars.forEach(function(c){var d=DIRS[c.d];for(var x=c.c[0][0]+d[0],y=c.c[0][1]+d[1];x>=0&&y>=0&&x<m.w&&y<m.h;x+=d[0],y+=d[1])r[y*m.w+x]++;});return r;}
function pick(m,o){o=o||{};var w=m.w,h=m.h,ry=rays(m),busy={},on=o.on||[],R=rng(o.seed||1),c=[],sc={},i,k;
for(k in(o.busy||{}))busy[k]=1;
if(m.cars.length<CFG.MINLEFT)return-1;
var fr=m.cars.filter(function(q){return freeOf(q,m.occ,w,h,q.id);}),hot={};
m.cars.forEach(function(q){var d=DIRS[q.d],f=fr.indexOf(q)>=0;for(var x=q.c[0][0]+d[0],y=q.c[0][1]+d[1];x>=0&&y>=0&&x<w&&y<h;x+=d[0],y+=d[1]){
if(q.id===o.amb)busy[y*w+x]=1;else if(f)hot[y*w+x]=1;}});
for(i=0;i<w*h;i++){if(m.occ[i]!==-1||ry[i]<1||busy[i])continue;var x=i%w,y=Math.floor(i/w),near=false;
for(k=0;k<on.length;k++)if(Math.abs(on[k]%w-x)+Math.abs(Math.floor(on[k]/w)-y)<2)near=true;if(!near){c.push(i);sc[i]=ry[i]+(hot[i]?10:0);}}
if(!c.length)return-1;
c.sort(function(a,b){return sc[b]-sc[a]||a-b;});c=c.slice(0,CFG.TOP);
for(var t=0;t<CFG.TRY&&c.length;t++){var x0=c.splice(Math.floor(R()*Math.min(c.length,4)),1)[0],occ=m.occ.slice();occ[x0]=-5;
if(m.cars.some(function(q){return freeOf(q,occ,w,h,q.id);}))return x0;}
return-1;}
var SC={CFG:CFG,DIRS:DIRS,rng:rng,solvable:solvable,rays:rays,pick:pick,freeOf:freeOf};
root.V3SCM=SC;
if(!root.document)return;
var W=root;
if(!W.V3||!W.UI||!W.VY||!V3.is||!V3.is('quarter'))return;
if(!V3.reg('quarter.scoot',{s:'V3F-QSCOOT',t:'Нашествие самокатов'}))return;
var WEEK_ON=false;
var DEV=false;try{DEV=/[?&]scoot=1/.test(location.search)||W.localStorage.getItem('vyezd-v3sc')==='1';}catch(e){}
function ok(f,d){try{return f();}catch(e){return d;}}
function L(a,b){return ok(function(){return VY.L(a,b);},a);}
function curG(){try{return G;}catch(e){return null;}}
function isMu(g){return!!(g&&g.v3mu);}
function weekOn(g){return(DEV||WEEK_ON)&&g&&!g.daily&&(g.idx||0)>=10;}
function roles(H){if(!H)return false;if(H.kind)return true;var r=H.M&&H.M.role;if(!r)return false;for(var i=0;i<r.length;i++)if(r[i])return true;return false;}
function fits(g){if(!g||g.daily||g.over)return false;var md=g.mode||'n';
if(!(isMu(g)&&md==='fest')&&!(md==='n'&&weekOn(g)))return false;
if(g.v3k||roles(g.v3h)||(g.v3t&&g.v3t.wake)||g.v3n||ok(function(){return W.__demo;},false))return false;return true;}
function st(g){if(!g)return null;if(g.v3sc===undefined)g.v3sc=fits(g)?{n:0,on:[],all:0,tap:0,bump:0,fx:[],said:0}:null;return g.v3sc;}
function model(g){var w=g.p.w,h=g.p.h,cars=[],busy={};
g.vs.forEach(function(v){if(v.state==='idle'||v.state==='bump')cars.push({id:v.id,c:v.cells,d:v.dir});
if(v.state==='exit'||v.state==='bump'){var d=DIRS[v.dir];for(var x=v.cells[0][0]+d[0],y=v.cells[0][1]+d[1];x>=0&&y>=0&&x<w&&y<h;x+=d[0],y+=d[1])busy[y*w+x]=1;}});
return{m:{w:w,h:h,occ:g.occ.slice(),cars:cars},busy:busy};}
function ambId(g){var a=g.amb;if(!a||a.done)return-1;var v=g.vs[a.id];return v&&(v.state==='idle'||v.state==='bump')?a.id:-1;}
function drop(g,force){var s=st(g);if(!s||g!==curG()||g.over)return-1;if(!force&&(s.on.length>=CFG.MAXON||s.all>=CFG.MAXN))return-1;
var M=model(g),c=pick(M.m,{busy:M.busy,on:s.on,amb:ambId(g),seed:(g.idx+1)*7919+s.all*131+s.n});if(c<0)return-1;
g.occ[c]=-5;s.on.push(c);s.all++;s.fx.push({c:c,t0:now(),up:0});
ok(function(){SND.tap();});
if(!s.said){s.said=1;ok(function(){say(L('Опять самокат бросили на проезде! Тапни — поставь.','Someone dumped a scooter on the road again! Tap it to stand it up.'),'bench');});}
ok(function(){V3.emit('quarter:scoot',{k:'drop',y:g.idx+1});});return c;}
function lift(g,c){var s=g.v3sc,i=s.on.indexOf(c);if(i<0)return false;s.on.splice(i,1);if(g.occ[c]===-5)g.occ[c]=-1;s.tap++;
s.fx.forEach(function(f){if(f.c===c&&!f.up)f.up=now();});
ok(function(){SND.tap();});ok(function(){if(navigator.vibrate&&VY.S.vib!==false)navigator.vibrate(15);});
if(s.tap===1)ok(function(){say(L('Поставила. Сфотографировала. Отправила. Куда — не скажу.','Stood it up. Took a photo. Sent it. Where to — I won’t say.'),'bench');});
ok(function(){V3.emit('quarter:scoot',{k:'tap',y:g.idx+1});});return true;}
function now(){return ok(function(){return performance.now()/1000;},Date.now()/1000);}
function onExit(){var g=curG(),s=st(g);if(!s)return;s.n++;if(s.n%CFG.EVERY)return;drop(g,false);}
function wrap(name,fn){var f=W[name];if(typeof f!=='function'||f.__v3sc)return;var w=fn(f);w.__v3sc=1;W[name]=w;}
wrap('startExit',function(f){return function(){var r=f.apply(this,arguments);ok(onExit);return r;};});
wrap('tow',function(f){return function(){var r=f.apply(this,arguments);ok(onExit);return r;};});
wrap('tapAt',function(f){return function(px,py){var g=curG(),s=g&&g.v3sc;
if(s&&s.on.length&&!g.over){var hit=ok(function(){var fx=(px-ox)/cs,fy=(py-oy)/cs,w=g.p.w,x=Math.floor(fx),y=Math.floor(fy),c=x>=0&&y>=0&&x<w&&y<g.p.h?y*w+x:-1;
if(c>=0&&g.occ[c]===-5)return c;if(c>=0&&g.occ[c]>=0)return-1;
for(var k=0;k<s.on.length;k++){var q=s.on[k],qx=q%w+.5,qy=Math.floor(q/w)+.5;if(Math.abs(fx-qx)<.85&&Math.abs(fy-qy)<.85)return q;}return-1;},-1);
if(hit>=0){lift(g,hit);return;}}
return f.apply(this,arguments);};});
wrap('crash',function(f){return function(v){var g=curG(),s=g&&g.v3sc;
if(s&&v&&v.block===-5){g.combo=0;s.bump++;ok(function(){SND.horn();});
var d=DIRS[v.dir],c=-1;ok(function(){var w=g.p.w,x=v.cells[0][0]+d[0]*(v.k+1),y=v.cells[0][1]+d[1]*(v.k+1);c=y*w+x;});
var i=s.on.indexOf(c);if(i>=0){s.on.splice(i,1);if(g.occ[c]===-5)g.occ[c]=-1;s.fx.forEach(function(q){if(q.c===c&&!q.up){q.up=now();q.kick=1;}});}
if(s.bump===1)ok(function(){say(L('Самокат отлетел! В другой раз просто тапни по нему — поставлю аккуратно.','The scooter went flying! Next time just tap it — I’ll stand it up properly.'),'bench');});
ok(function(){V3.emit('quarter:scoot',{k:'bump',y:g.idx+1});});return;}
return f.apply(this,arguments);};});
wrap('hint',function(f){return function(){var g=curG(),s=g&&g.v3sc;
if(s&&s.on.length&&!g.over&&ok(function(){var w=g.p.w,h=g.p.h;return!g.vs.some(function(v){return v.state==='idle'&&canExit(v,g.occ,w,h,v.id).free;});},false)){
var t=now();s.fx.forEach(function(q){if(!q.up)q.sh=t;});ok(function(){say(L('Самокат мешает! Тапни по нему — поставь.','A scooter is in the way! Tap it to stand it up.'),'bench');});return;}
return f.apply(this,arguments);};});
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function drawOne(c,f,t,g){var w=g.p.w,p=toPx([f.c%w,Math.floor(f.c/w)]),s=cs,x=p[0],y=p[1],k,al=1,sc=1,ang=-.55;
if(f.up){k=Math.min(1,(t-f.up)/.45);if(k>=1)return false;al=1-k;sc=1+.25*k;y-=s*.3*k;ang+=f.kick?k*2.5:-k*.6;}
else{k=Math.min(1,(t-f.t0)/.35);al=Math.min(1,.2+k);sc=1.5-.5*k*k;ang+=(1-k)*1.2;}
if(f.sh&&t-f.sh<.5)x+=Math.sin((t-f.sh)*50)*s*.05;
c.save();c.globalAlpha=al;
if(!f.up){var pu=.5+.5*Math.sin(t*4.5);c.fillStyle='rgba(255,214,40,'+(.22+.18*pu)+')';c.beginPath();c.arc(x,y,s*.47,0,7);c.fill();
c.strokeStyle='rgba(255,194,51,'+(.7+.3*pu)+')';c.lineWidth=Math.max(2,s*.07);c.setLineDash([s*.14,s*.1]);c.beginPath();c.arc(x,y,s*.43,0,7);c.stroke();c.setLineDash([]);}
c.translate(x,y);c.rotate(ang);c.scale(sc,sc);
c.fillStyle='rgba(0,0,0,.25)';rr(c,-s*.36,-s*.07,s*.78,s*.2,s*.08);c.fill();
c.fillStyle='#1e272e';rr(c,-s*.38,-s*.1,s*.13,s*.2,s*.04);c.fill();rr(c,s*.1,-s*.1,s*.13,s*.2,s*.04);c.fill();
c.fillStyle='#fff';rr(c,-s*.33,-s*.11,s*.5,s*.22,s*.08);c.fill();
c.fillStyle='#20bf6b';rr(c,-s*.31,-s*.085,s*.46,s*.17,s*.06);c.fill();
c.strokeStyle='#fff';c.lineCap='round';c.lineWidth=Math.max(3,s*.11);c.beginPath();c.moveTo(s*.14,0);c.lineTo(s*.38,0);c.stroke();
c.strokeStyle='#2d3436';c.lineWidth=Math.max(2,s*.06);c.beginPath();c.moveTo(s*.14,0);c.lineTo(s*.38,0);c.stroke();
c.strokeStyle='#fff';c.lineWidth=Math.max(3,s*.1);c.beginPath();c.moveTo(s*.38,-s*.2);c.lineTo(s*.38,s*.2);c.stroke();
c.strokeStyle='#2d3436';c.lineWidth=Math.max(2,s*.055);c.beginPath();c.moveTo(s*.38,-s*.2);c.lineTo(s*.38,s*.2);c.stroke();
c.fillStyle='#e84118';c.beginPath();c.arc(s*.38,-s*.2,s*.045,0,7);c.arc(s*.38,s*.2,s*.045,0,7);c.fill();
c.restore();return true;}
if(W.LVLH&&typeof LVLH.draw==='function'){var LD0=LVLH.draw;LVLH.draw=function(c,layer,t){var r=LD0.apply(this,arguments);
if(layer==='under')ok(function(){var g=curG(),s=g&&g.v3sc;if(!s||!s.fx.length)return;var tt=now();s.fx=s.fx.filter(function(f){return drawOne(c,f,tt,g);});});return r;};}
V3.sub('yard',function(info){var g=curG(),s=g&&g.v3sc;if(!s||!s.all)return;V3.ev('sc',{k:'end',d:s.all,t:s.tap,b:s.bump,ok:info&&info.ok?1:0,mu:isMu(g)?1:0});},'quarter.scoot');
W.V3SC={st:function(){return st(curG());},drop:function(force){return drop(curG(),force);},lift:function(c){var g=curG();return!!(g&&g.v3sc&&lift(g,c));},fits:fits,weekOn:function(){return weekOn(curG());}};
})(this);