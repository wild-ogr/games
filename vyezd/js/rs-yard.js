(function(){'use strict';
var W=window,D=document;
if(!W.V3||!V3.reg)return;
V3.reg('rs',{s:'RS',t:'реструктуризация 30.10 (выкл — как v24.2)'});
var ON=V3.reg('rs.yard',{s:'RS-П3',t:'спокойный двор: тосты в итоги, одна надпись, «Помощь», без окон до хода'});
if(!ON)return;
try{D.documentElement.classList.add('rsy');}catch(e){}
var R=W.RSW=W.RSW||{};R.news=R.news||[];R.yq=R.yq||[];
var Y=W.RSY={};
function ok(f,d){try{return f();}catch(e){return d;}}
function $(id){return D.getElementById(id);}
function L(a,b){return ok(function(){return W.VY.L(a,b);},a);}
function g(){return ok(function(){return G;},null);}
function now(){return Date.now();}
function inYard(){return ok(function(){return W.inYard();},false);}
function ev(o){ok(function(){V3.ev('rsy',o);});}
var lastIn=-1e9,t0=0;
D.addEventListener('pointerdown',function(){lastIn=now();},true);D.addEventListener('keydown',function(){lastIn=now();},true);
function resp(){return now()-lastIn<1200;}
function tut(){var q=g();return ok(function(){return!!(q&&!q.daily&&q.idx===0&&!(S.levelsDone>0));},false);}
ok(function(){V3.field('v3rsw',{s:'RS-П3',def:null,fix:function(v){if(v===undefined||v===null)return;if(typeof v!=='object'||Array.isArray(v))return{cy:0};v.cy=v.cy?1:0;return v;}});});
function calm(){return ok(function(){return!!(S.v3rsw&&S.v3rsw.cy);},false);}
Y.calm=calm;
var PASS=/покуп|оплат|ошибк|интернет|сеть|не удалось|не загрузил|реклам|Ролик|purchase|error|network|☔|🚑|[Сс]корая|нельзя|Некуда|Не хватает|not enough/;
var force=0;
function news(s){R.news.unshift({k:'toast',t:String(s).slice(0,200)});R.news=R.news.slice(0,20);ev({k:'tn'});ok(function(){V3.emit('rs:news',R.news);});}
function short(t){t=String(t||'').replace(/^[^\wА-Яа-яЁё«+]+/,'').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');var w=t.split(' ');return w.length>8?w.slice(0,8).join(' ').replace(/[\s.,:;!—-]+$/,'')+'…':t;}
function wrapToast(){if(typeof W.toast!=='function'||W.toast.__rs)return;var f=W.toast;
var w=function(t,ms){if(!V3.is('rs.yard'))return f.apply(this,arguments);var s=String(t||''),q=g(),mo=ok(function(){return modalOn;},false);
if(/приблизили|zoomed/.test(s)){if(inYard()&&q&&!q.moves)return f.apply(this,arguments);return;}
if(resp()||PASS.test(s))return f.apply(this,arguments);
if(/сериал|serial/i.test(s)){news(s);return;}
if(inYard()){if(/тронь|нажми|жми|коснись|\btap\b|press/i.test(s)){force=1;ok(function(){W.say(s.replace(/^[^\wА-Яа-яЁё«]+/,''),'bench');});force=0;ev({k:'t2s'});return;}
if(R.yq.length<8)R.yq.push(short(s));ev({k:'tq'});return;}
var cur=ok(function(){return UI.cur;},'');
if(/💰|удвоен|doubled|жизн|life/.test(s))return f.apply(this,arguments);
if(cur==='home'||cur==='map'||mo){news(s);return;}
return f.apply(this,arguments);};
for(var k in f)if(f.hasOwnProperty(k))w[k]=f[k];w.__rs=1;w.__v3=f.__v3;W.toast=w;}
V3.sub('yard-start',function(){R.yq.length=0;t0=now();},'rs.yard');
var lastMv=-99,pend=null,pendT=0;
function trim12(t){var s=String(t),parts=s.match(/[^.!?…]+[.!?…]*\s*/g);if(!parts||s.split(/\s+/).length<=12)return s;
var out='',n=0;for(var i=0;i<parts.length;i++){var k=parts[i].trim().split(/\s+/).length;if(n&&n+k>12)break;out+=parts[i];n+=k;}return out.trim()||s;}
function tipOn(){var t=$('tip');return!!(t&&t.style.display==='block');}
function wrapSay(){if(typeof W.say!=='function'||W.say.__rs)return;var f=W.say;
var w=function(text,where){var q=g();if(!V3.is('rs.yard')||!q||tut())return f.apply(this,arguments);
var s=String(text||'').replace(/\s*поскорее(?=[.!]|$)/,''),ad=/📺|рекламу|for an ad/.test(s),r=resp()||force;
if(!ad&&!r){
if(now()-t0<5000){pend={t:s,w:where,q:q};if(!pendT)pendT=setTimeout(flush,Math.max(200,5000-(now()-t0)));return;}
if(tipOn())return;
if(q.moves-lastMv<3&&lastMv>=0&&q.moves>=lastMv)return;}
var b0=q.bubbles&&q.bubbles[0],res=f.call(this,ad?s:trim12(s),where),b=q.bubbles&&q.bubbles[0];
if(b&&b!==b0){b.life=Math.max(b.life||0,6);if(!r&&!ad)lastMv=q.moves;}
return res;};
w.__rs=1;w.__v3b=f.__v3b;w.__v3u=f.__v3u;W.say=w;}
function flush(){pendT=0;var p=pend;pend=null;var q=g();if(!p||q!==p.q||!q||q.over||tipOn())return;lastIn=-1e9;t0=0;ok(function(){W.say(p.t,p.w);});}
V3.sub('yard-start',function(){lastMv=-99;pend=null;if(pendT){clearTimeout(pendT);pendT=0;}},'rs.yard');
function boosts(){var a=[],z=$('v3dZh'),p=$('v3dPu');
if(z)a.push({b:z,t:'🚦 '+L('Жезл — повернуть машину','Baton — turn a car'),n:(z.querySelector('small')||{}).textContent||''});
if(p)a.push({b:p,t:'🤚 '+L('Толчок — сдвинуть машину','Push — nudge a car'),n:(p.querySelector('small')||{}).textContent||''});return a;}
function helpMenu(f0){var bs=boosts();if(!bs.length)return f0();var pr=($('hintPr')||{}).textContent||'';
var h='<h2>💡 '+L('Помощь','Help')+'</h2><div class="row rsy-help"><button class="btn green noenter" id="rsyH">💡 '+L('Подсказка','Hint')+(pr?' <small>'+pr+'</small>':'')+'</button>';
bs.forEach(function(x,i){h+='<button class="btn sec noenter" data-rsy="'+i+'">'+x.t+(x.n?' <small>· '+x.n+'</small>':'')+'</button>';});
h+='<button class="btn" id="rsyX">'+L('Отмена','Cancel')+'</button></div>';
modal(h);ev({k:'help',n:bs.length});
$('rsyH').onclick=function(){hideModal();f0();};$('rsyX').onclick=function(){hideModal();};
[].slice.call(D.querySelectorAll('[data-rsy]')).forEach(function(b){b.onclick=function(){var x=bs[+b.getAttribute('data-rsy')];hideModal();lastIn=now();if(x&&x.b)x.b.click();};});}
function wireHelp(){var b=$('gHint');if(!b||b.__rs)return;b.__rs=1;var f=b.onclick;
b.onclick=function(e){if(!V3.is('rs.yard')||!f)return f&&f.call(this,e);var self=this;helpMenu(function(){f.call(self,e);});};
var lb=b.querySelector('b');if(lb){lb.setAttribute('data-was',lb.textContent);lb.textContent='💡 '+L('Помощь','Help');}}
var NO={v3bN:'bet',v3nN:'nb',v3uBsX:'barsik'};
function preMove(){var q=g();if(!q||q.over||q.moves>0||!inYard())return;
for(var id in NO){var b=$(id);if(b){ev({k:'skip',w:NO[id]});ok(function(){V3.emit('rs:skipped',{k:NO[id],idx:q.idx});});b.click();return;}}}
function watchModal(){var c=$('mcard');if(!c||c.__rsy||!W.MutationObserver)return;c.__rsy=1;new MutationObserver(function(){if(V3.is('rs.yard'))preMove();}).observe(c,{childList:true});}
V3.sub('yard-start',function(o){var q=g();if(!q)return;var idx=q.idx|0;
if(q.v3t&&q.v3t.rain&&q.v3t.rain.st===0&&(calm()||idx<39||((idx*2246822519)>>>0)%2)){delete q.v3t.rain;ev({k:'rain0',i:idx+1});}
if(calm()&&q.v3mu){q.v3mu=null;}},'rs.yard');
function setRow(){var c=$('stCalm');if(!c||$('rsyCalm'))return;var b=D.createElement('button');b.className='set';b.id='rsyCalm';
var on=calm();b.innerHTML='<span>🍃 '+L('Спокойные дворы','Calm yards')+'<br><small>'+L('без дождя и самокатов','no rain, no scooters')+'</small></span>'+(on?'<i>'+L('вкл','on')+'</i>':'<i class="off">'+L('выкл','off')+'</i>');
c.parentNode.insertBefore(b,c.nextSibling);
b.onclick=function(){ok(function(){if(!S.v3rsw||typeof S.v3rsw!=='object')S.v3rsw={cy:0};S.v3rsw.cy=S.v3rsw.cy?0:1;save();});ev({k:'calm',v:calm()?1:0});var r=$('rsyCalm');if(r)r.parentNode.removeChild(r);setRow();};}
function watchSet(){var c=$('mcard');if(!c||c.__rsys||!W.MutationObserver)return;c.__rsys=1;new MutationObserver(function(){if(V3.is('rs.yard'))setRow();}).observe(c,{childList:true});}
function boot(){wireHelp();watchModal();watchSet();setTimeout(function(){wrapToast();wrapSay();},30);}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
V3.sub('boot',boot,'rs.yard');
Y.q=R.yq;
})();