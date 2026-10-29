(function(){'use strict';
var W=window;
if(!W.V3UX||!W.V3UXL||!W.UI||!W.VY)return;
var X=V3UXL,on=V3UX.on;
function ok(f,d){try{return f();}catch(e){return d;}}
function L(a,b){return VY.L(a,b);}
function g(){return ok(function(){return G;},null);}
function calmLow(){return ok(function(){return calm()||LOW;},false);}
function en(){return ok(function(){return LANG==='en';},false);}
function T(){return W.V3T&&V3T.on&&V3T.on()?V3T:null;}
function bank(){var t=T();return t&&t.isReady&&t.isReady()&&t.ux?t.ux:null;}
function two(p){if(!p)return'';if(typeof p==='string')return en()?'':p;return en()?(p[1]||''):p[0];}
function pick(a){return a&&a.length?a[Math.floor(Math.random()*a.length)]:null;}
function sayY(t){if(!t)return;ok(function(){say(t,'bench');});ok(function(){V3UX.voice&&V3UX.voice(t);});}
function ev(k,o){o=o||{};o.k=k;ok(function(){V3.ev('ux',o);});}
function hsh(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function glassDay(){var d=new Date(ok(function(){return nowMs();},Date.now()));return d.getDate()===1+hsh('gl'+d.getFullYear()+'-'+d.getMonth())%28;}
function gone(G0){var n=0;for(var i=0;i<G0.vs.length;i++){var s=G0.vs[i].state;if(s!=='idle'&&s!=='bump')n++;}return n;}
function freeCars(G0){var r=[];ok(function(){for(var i=0;i<G0.vs.length;i++){var v=G0.vs[i];if(v.state==='idle'&&canExit(v,G0.occ,G0.p.w,G0.p.h,v.id).free)r.push(v);}});return r;}
V3.sub('yard-start',function(o){var G0=g();if(!G0)return;G0.v3u={tod0:G0.tod,sky:G0.tod,last:0,ah:0};AH.length=0;
if(on('glass')&&glassDay())G0.v3u.gl=1;
setTimeout(function(){barsik(G0);},700);ambStart(G0);},'ux');
function wrapExit(){if(typeof W.startExit!=='function'||W.startExit.__v3u)return;var f=W.startExit;
W.startExit=function(v,r,delay){var res=f.apply(this,arguments);ok(function(){afterExit(v);});return res;};W.startExit.__v3u=1;}
function afterExit(v){var G0=g();if(!G0||!G0.v3u||!V3.is('ux'))return;var U=G0.v3u,tot=G0.vs.length||1,fr=gone(G0)/tot;
if(on('sky')&&!G0.daily&&G0.idx>=3){var nt=X.skyAt(U.tod0,fr);if(nt&&nt!==U.sky&&ok(function(){return!!TOD[nt];},false)){U.sky=nt;G0.tod=nt;ok(function(){layout();var tb=lookBg(nt),sg=document.getElementById('scr-game');sg.style.background=tb;document.body.style.background=tb;sg.classList.toggle('dark',!!TOD[nt].dark);});ev('sky',{t:nt});}}
if(on('dust')&&!calmLow())dust(v);
if(on('ah')&&(G0.combo|0)>=3&&(G0.combo-3)%2===0)ah(G0);
if(on('last')&&v.last&&!U.last){U.last=1;var t=T(),c=ok(function(){return VYCARS.pick(v);},null),id=c&&(c.id||c.k);
var ln=t&&id?ok(function(){return t.line('car.'+id);},null):null;if(ln&&ln.t)setTimeout(function(){if(g()===G0)sayY(ln.t);},250);}
if(on('parts'))setTimeout(function(){parts(G0);},750);
if(U.amb===1&&v.kind==='amb'){U.amb=2;var b=bank();sayY(two(pick(b&&b.ambOk)));}}
function dust(v){var G0=g();ok(function(){var c=cs,p=toPx(v.cells[0]),n=LOW?0:7;for(var i=0;i<n;i++){var a=Math.random()*6.28,sp=10+Math.random()*25;
G0.parts.push({x:p[0]+(Math.random()-.5)*c*.6,y:p[1]+(Math.random()-.5)*c*.3,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-12,r:c*(.1+Math.random()*.08),life:.7,max:.7,c:'rgba(205,190,160,'});}});}
var AH=[],AHk=0;function ah(G0){var w=ok(function(){return G0.anc.wins;},null);if(!w||!w.length)return;var t=Date.now();
AH=AH.filter(function(a){return t-a.t<1200;});for(var i=0;i<2;i++){var p=w[Math.floor(Math.random()*w.length)];AH.push({x:p[0],y:p[1],t:t});}if(AH.length>6)AH=AH.slice(-6);ok(function(){kick();});}
function wrapRender(){if(typeof W.render!=='function'||W.render.__v3u)return;var f=W.render;
W.render=function(){var r=f.apply(this,arguments);if(AH.length)ok(drawAh);return r;};W.render.__v3u=1;}
function drawAh(){var now=Date.now(),c=ctx,k=cs;AH=AH.filter(function(a){return now-a.t<1200;});c.save();ok(function(){c.translate(cam.x,cam.y);c.scale(cam.z,cam.z);});
for(var i=0;i<AH.length;i++){var a=AH[i],q=1-(now-a.t)/1200;c.globalAlpha=Math.max(0,q);c.fillStyle='#ffe58a';c.fillRect(a.x-k*.18,a.y-k*.32,k*.36,k*.3);
c.fillStyle='#c0392b';c.font='bold '+Math.round(k*.42)+'px sans-serif';c.textAlign='center';c.fillText('!',a.x,a.y-k*.4);}
c.restore();if(AH.length&&!AHk){AHk=1;setTimeout(function(){AHk=0;ok(function(){kick();});},60);}}
function parts(G0){if(g()!==G0||G0.over)return;ok(function(){if(cam.z<=1.02||cam.tw)return;var fr=freeCars(G0);if(!fr.length)return;var c=cs,WW=W_(),HH=H_(),inView=0,sx=0,sy=0;
for(var i=0;i<fr.length;i++){var q=fr[i].cells[0],px=ox+(q[0]+.5)*c,py=oy+(q[1]+.5)*c,X0=px*cam.z+cam.x,Y0=py*cam.z+cam.y;sx+=px;sy+=py;if(X0>0&&X0<WW&&Y0>0&&Y0<HH)inView++;}
if(inView)return;var z=cam.z,cx=sx/fr.length,cy=sy/fr.length,x=Math.min(0,Math.max(WW-WW*z,WW/2-cx*z)),y=Math.min(0,Math.max(HH-HH*z,HH/2-cy*z));camTo(z,x,y);ev('parts');});}
function W_(){return ok(function(){return(0,eval)('W');},0);}
function H_(){return ok(function(){return H;},0);}
function wrapGlass(){if(typeof W.arrowAt==='function'&&!W.arrowAt.__v3u){var a0=W.arrowAt;W.arrowAt=function(c,v,s,tp,k){var G0=g();if(G0&&G0.v3u&&G0.v3u.gl&&on('glass'))k=k*1.2;return a0.call(this,c,v,s,tp,k);};W.arrowAt.__v3u=1;}
if(typeof W.buildGround==='function'&&!W.buildGround.__v3u){var b0=W.buildGround;W.buildGround=function(){var r=b0.apply(this,arguments);var G0=g();
if(G0&&G0.v3u&&G0.v3u.gl&&on('glass'))ok(function(){var c=ground.getContext('2d');c.fillStyle='rgba(255,250,235,.16)';c.fillRect(0,0,ground.width,ground.height);});return r;};W.buildGround.__v3u=1;}}
V3.sub('yard-start',function(){var G0=g();if(G0&&G0.v3u&&G0.v3u.gl&&!G0.v3u.glT){G0.v3u.glT=1;var b=bank(),t=two(pick(b&&b.glass));if(t)setTimeout(function(){if(g()===G0)sayY(t);},2200);ok(function(){groundV++;});}},'ux.glass');
function barsik(G0){if(!on('barsik')||g()!==G0||G0.daily||G0.over||G0.moves>0||VY.modalOn)return;var u=V3UX.u(),d=V3UX.dk();if(!X.barsikOk(G0.idx,u.bd,d,Math.random()))return;
var b=bank();if(!b)return;var cars=G0.vs.filter(function(v){return v.state==='idle'&&v.kind!=='amb'&&v.kind!=='pol';});if(cars.length<3)return;
var pick3=[],used={};for(var i0=0;i0<cars.length&&pick3.length<3;i0++){var v=cars[(i0*7+Math.floor(Math.random()*cars.length))%cars.length],c=v.dc||v.color;if(used[c])continue;used[c]=1;pick3.push(v);}
if(pick3.length<3)return;u.bd=d;V3UX.sv();var win=Math.floor(Math.random()*3),q=two(pick(b.barsik));
VY.modal('<div class="v3ux"><h2>🐈 '+L('Где Барсик?','Where’s Barsik?')+'</h2>'+ok(function(){return shura(q);},'<p>'+UI.esc(q)+'</p>')+
'<div class="row v3uRow">'+pick3.map(function(v,i){return'<button class="btn sec noenter v3uBs" data-i="'+i+'"><b style="display:inline-block;width:1.4em;height:.9em;border-radius:4px;vertical-align:middle;background:'+UI.esc(v.dc||v.color)+'"></b> '+L('под этой','under this one')+'</button>';}).join('')+'</div>'+
'<div class="row"><button class="btn green noenter" id="v3uBsX">'+L('Потом найдётся','He’ll turn up')+'</button></div></div>');
var bs=document.querySelectorAll('#mcard .v3uBs');for(var i=0;i<bs.length;i++)bs[i].onclick=function(){var k=+this.getAttribute('data-i'),hit=k===win;VY.hide();
if(hit){u.bn++;V3UX.note('bars','');V3UX.sv();}sayY(two(pick(hit?b.barsikOk:b.barsikNo)));ev('barsik',{h:hit?1:0});};
var x=document.getElementById('v3uBsX');if(x)x.onclick=function(){VY.hide();ev('barsik',{h:-1});};}
function ambAB(){if(!on('amb'))return false;if(/[?&]ab=amb\b/.test(location.search))return true;if(ok(function(){return localStorage.getItem('vyezd-v3u-amb')==='1';},false))return true;
var c=ok(function(){return JSON.parse(localStorage.getItem('vyezd-v3cfg')||'{}');},{});return!!(c&&c.amb&&ok(function(){return V3.bucket<c.amb;},false));}
function ambStart(G0){if(!ambAB()||G0.idx!==0||G0.daily||ok(function(){return S.levelsDone>0;},true))return;var hasAmb=G0.vs.some(function(v){return v.kind==='amb';});
G0.v3u.amb=hasAmb?1:3;var b=bank()||{};var t=two(pick(b.amb))||L('Скорая к бабе Шуре! Выпусти её первой.','Ambulance for Granny Shura! Let it out first.');
setTimeout(function(){if(g()===G0&&!G0.moves)sayY(t);},2600);ev('amb',{a:hasAmb?1:0});}
function boot(){wrapExit();wrapRender();wrapGlass();}
V3.sub('boot',boot,'ux');setTimeout(boot,0);
})();