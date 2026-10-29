(function(){'use strict';
var W=window,D=document;
if(!W.V3||!W.UI||!W.VY||!V3.is||!V3.is('quarter')||!W.V3QS)return;
if(!V3.reg('quarter.chalk',{s:'QUARTER',t:'Асфальт: мел соседей'}))return;
function L(a,b){return VY.L(a,b);}
function ok(f,d){try{return f();}catch(e){return d;}}
function esc(s){return UI.esc(s);}
function ev(k,o){ok(function(){var x={k:k};for(var j in o)x[j]=o[j];V3.ev('qc',x);});}
function live(){return ok(function(){return V3QS.live();},false);}
var CH=[];function chLoad(){if(!CH.length)ok(function(){var a=V3T.quarter&&V3T.quarter.chalk;if(a&&a.length)CH=a;});return CH.length>0;}
var CELLW=30;
var ST={y:0,cr:{},mv:{},lose:{},hint:{}};
function call(g,cb){if(W.V3QS&&V3QS.call)return V3QS.call(g,cb);cb(null);}
function push(k,o){ok(function(){V3QS.push(k,o);});}
function cellOf(v){return ok(function(){var d=DIRS[v.dir],c=v.cells[0],x=Math.round(c[0]+d[0]*v.k),y=Math.round(c[1]+d[1]*v.k);if(x<0||y<0||x>=CELLW||y>=CELLW)return-1;return y*CELLW+x;},-1);}
function wrap(name,after,before){var f=W[name];if(typeof f!=='function'||f.__v3qc)return;var w=function(){var x;try{if(before)x=before.apply(this,arguments);}catch(e){}var r=f.apply(this,arguments);try{if(after)after.apply(this,[x].concat([].slice.call(arguments)));}catch(e){}return r;};
w.__v3qc=1;for(var k in f)if(Object.prototype.hasOwnProperty.call(f,k)&&!(k in w))w[k]=f[k];W[name]=w;}
function hook(){
wrap('crash',function(x,v){if(!live())return;var g=VY.G;if(!g||g.daily||g.v3qy!=null||g.v3mu)return;var c=cellOf(v);if(c>=0)push('cx',{y:g.idx+1,c:c});});
wrap('tapAt',function(b){var g=VY.G;if(!g||!b||g.moves<=b.m)return;var id=-1;for(var i=0;i<g.vs.length;i++)if(b.st[i]==='idle'&&g.vs[i].state!=='idle'){id=i;break;}
if(b.m===0&&id>=0&&g.v3h1==null)g.v3h1=id;if(!g.v3log)g.v3log=[];if(id<0)g.v3bad=1;else{g.v3log.push(id);var tn=Date.now();if(!g.v3tm)g.v3tm=[];g.v3tm.push(Math.max(0,Math.min(600,Math.round((tn-(g.v3tl||g.t0||tn))/100))));g.v3tl=tn;}ghostNext(g);},
function(){var g=VY.G;if(!g||!live())return null;return{m:g.moves,st:g.vs.map(function(v){return v.state;})};});}
function ghostNext(g){var gh=g&&g.v3gh;if(!gh)return;var i=gh.log[g.moves];var v=i!=null&&g.vs[i];if(v&&v.state==='idle')ok(function(){v.flash=1;});}
V3.sub('boot',function(){setTimeout(hook,0);},'quarter.chalk');
V3.sub('yard',function(info){if(!info)return;var g=VY.G;if(info.daily||!g||g.v3qy!=null||g.v3mu||(info.mode&&info.mode!=='n'))return;var y=info.idx+1;ST.y=y;
if(info.ok&&!g.v3gh){ST.mv[y]=info.moves;if(live()&&g.v3h1!=null)push('h1',{y:y,car:g.v3h1});
if(live()&&!g.v3bad&&g.v3log&&g.v3log.length===info.moves&&info.moves<=120)push('gh',{y:y,mv:info.moves,log:g.v3log,tm:g.v3tm&&g.v3tm.length===g.v3log.length?g.v3tm:undefined,c:ok(function(){return Math.floor(Math.max(0,(VY.S.unlocked||1)-2)/10);},0)});}
else if(info.end==='lose')ST.lose[y]=(ST.lose[y]||0)+1;},'quarter.chalk');
V3.sub('yard-start',function(o){if(!o||o.daily||!live())return;var y=o.idx+1;if(!ST.lose[y]||ST.hint[y])return;ST.hint[y]=1;
call([['help',{y:y}]],function(r){var h=r&&r.r&&r.r.help;if(!h||h.car==null||h.p<30)return;var g=VY.G;if(!g||g.idx!==o.idx||g.moves>0)return;var v=g.vs[h.car];if(!v||v.state!=='idle')return;
ok(function(){v.flash=1;});ok(function(){VY.toast('👥 '+L('Помощь зала: '+h.p+' % соседей начали с этой машины.','Ask the audience: '+h.p+'% of neighbours started with this car.'),2600);});ev('help',{y:y,p:h.p});});},'quarter.chalk');
function lastY(){if(ST.y)return ST.y;return ok(function(){return Math.max(1,(+VY.S.unlocked||1)-1);},1);}
function pickOpts(y){var o=[],s=(y*7919)%CH.length;for(var i=0;i<4;i++)o.push((s+i*7)%CH.length);return o;}
function openChalk(){if(!chLoad()&&W.V3T&&V3T.ready&&!V3T.isReady()){V3T.ready(function(){if(chLoad())openChalk();});return;}if(!live()||!CH.length){VY.toast(L('Асфальт сейчас мокрый — загляни позже.','The asphalt is wet — check back later.'),2400);return;}var y=lastY();ev('open',{y:y});
var mv=ST.mv[y]||0;var g=[['chalk',{y:y}],['ghost',{y:y}]];if(mv>0)g.push(['better',{y:y,mv:mv}]);
call(g,function(r){if(!r||!r.r||!r.r.chalk){VY.toast(L('Асфальт сейчас мокрый — загляни позже.','The asphalt is wet — check back later.'),2400);return;}ST.gh=r.r.ghost&&r.r.ghost.mv?r.r.ghost:null;draw(y,r.r.chalk,r.r.better||null);});}
function startGhost(y){var gh=ST.gh;if(!gh)return;ev('ghost',{y:y,mv:gh.mv});ok(function(){VY.hide();});ok(function(){startLevel(y-1);G.v3gh={log:gh.log.slice(0,120),mv:gh.mv,tm:gh.tm&&gh.tm.length===gh.log.length?gh.tm.slice(0,120):null};setTimeout(function(){ok(function(){ghostNext(G);});},600);});}
function draw(y,c,b){var l=c.l||[],x=c.x||[],mine=false;
var h='<h2>🖍 '+L('Асфальт у двора ','Asphalt by yard ')+y+'</h2><p class="v3qS"><b>'+L('Шура: ','Shura: ')+'</b>'+esc(L('Соседи пишут мелом. Ругаться нельзя, только по заготовкам — я слежу.','Neighbours write in chalk. Only from the list — I’m watching.'))+'</p>';
if(b&&b.p!=null)h+='<p class="v3qHint">🏅 '+L('Ты прошёл этот двор лучше, чем ','You did this yard better than ')+b.p+L(' % соседей.','% of neighbours.')+'</p>';
if(ST.gh)h+='<p class="v3qHint">👻 '+L('Лучший сосед прошёл этот двор за ','The best neighbour did this yard in ')+ST.gh.mv+L(' ходов',' moves')+(ST.mv[y]?L(' (ты — ',' (you: ')+ST.mv[y]+')':'')+'. <button class="btn sec sm noenter" id="v3qGh">'+L('С призраком','With the ghost')+'</button></p>';
h+='<div class="v3qCh">';if(!l.length)h+='<p class="v3qHint">'+L('Пока чисто. Будь первым.','Clean so far. Be the first.')+'</p>';
for(var i=0;i<l.length;i++){var e=l[i],t=CH[e[1]];if(!t)continue;if(e[5])mine=true;var my=ST.cr[y+':'+e[0]];
h+='<div class="v3qChR"><span class="v3qChT">«'+esc(L(t[0],t[1]))+'»'+(e[5]?' <i>'+L('(твоя)','(yours)')+'</i>':'')+'</span>'+
'<button class="btn sec sm noenter v3qCr" data-id="'+esc(e[0])+'" data-r="0"'+(my!=null||e[5]?' disabled':'')+'>👍 '+(e[3]+(my===0?1:0))+'</button>'+
'<button class="btn sec sm noenter v3qCr" data-id="'+esc(e[0])+'" data-r="1"'+(my!=null||e[5]?' disabled':'')+'>😂 '+(e[4]+(my===1?1:0))+'</button></div>';}
h+='</div>';
if(x.length)h+='<p class="v3qHint">❌ '+L('Крестики: ','Crash marks: ')+x.slice(0,3).map(function(e){return L('тут разбились ','crashed here ')+e[1]+L(' раз',' times')+' ('+String.fromCharCode(65+(e[0]%CELLW)%26)+(Math.floor(e[0]/CELLW)+1)+')';}).join(' · ')+'</p>';
if(!mine){h+='<p class="v3qS">'+L('Написать мелом:','Write in chalk:')+'</p><div class="v3qVt">';var o=pickOpts(y);
for(var j=0;j<o.length;j++)h+='<button class="btn sec noenter v3qChW" data-t="'+o[j]+'">«'+esc(L(CH[o[j]][0],CH[o[j]][1]))+'»</button>';h+='</div>';}
h+='<div class="mBtns"><button class="btn sec" id="v3qChX">'+L('Закрыть','Close')+'</button></div>';
var m=VY.modal(h);if(!m)return;
var cr=m.querySelectorAll('.v3qCr');for(var k=0;k<cr.length;k++)cr[k].onclick=(function(bt){return function(){var id=bt.getAttribute('data-id'),r=+bt.getAttribute('data-r');if(ST.cr[y+':'+id]!=null)return;ST.cr[y+':'+id]=r;
push('cr',{y:y,id:id,r:r});ev('cr',{y:y,r:r});var p=bt.parentNode.querySelectorAll('.v3qCr');for(var q=0;q<p.length;q++)p[q].disabled=true;bt.textContent=bt.textContent.replace(/\d+$/,function(n){return+n+1;});};})(cr[k]);
var wr=m.querySelectorAll('.v3qChW');for(k=0;k<wr.length;k++)wr[k].onclick=(function(bt){return function(){var t=+bt.getAttribute('data-t'),c=(y*37+t*11)%(CELLW*CELLW);push('ch',{y:y,t:t,c:c});ev('ch',{y:y,t:t});
call([['chalk',{y:y}]],function(r){if(r&&r.r&&r.r.chalk)draw(y,r.r.chalk,b);else VY.toast(L('Написал. Шура одобрила.','Written. Shura approves.'),2000);});};})(wr[k]);
var bx=m.querySelector('#v3qChX');if(bx)bx.onclick=function(){VY.hide();};var gb=m.querySelector('#v3qGh');if(gb)gb.onclick=function(){startGhost(y);};}
homeSlots.push({id:'th-chalk',zone:'thing',order:30,render:function(){if(!live())return null;return{at:'chalk',t:L('Асфальт','Chalk'),go:openChalk};}});
W.V3QC={open:openChalk,get CH(){chLoad();return CH;},st:function(){return ST;},ghost:startGhost};
})();