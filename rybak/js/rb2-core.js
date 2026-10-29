'use strict';var R2=(function(){var OFF_FILE=[];var off={},onq={},all=false,feats={},evs={},fields={},errN=0,loaded={},enters=[],entered=false,wired=false,slotQ=[];function add(x,to){if(!x)return;var a=typeof x==='string'?x.split(','):x;for(var i=0;i<a.length;i++){var k=String(a[i]).trim();if(!k)continue;if(to===off&&(k==='all'||k==='r2'))all=true;else to[k]=1;}}
add(OFF_FILE,off);try{add(window.R2_OFF,off);}catch(e){}
try{var q=location.search,m=/[?&]off=([^&#]*)/.exec(q);if(m)add(decodeURIComponent(m[1]),off);m=/[?&]on=([^&#]*)/.exec(q);if(m)add(decodeURIComponent(m[1]),onq);}catch(e){}
function isOff(id){return!!id&&!onq[id]&&(all||!!off[id]);}
function err(w,x){errN++;if(errN<=5)try{console.warn('r2 '+w+': '+(x&&x.message||x));}catch(e){}}
function reg(id,o){o=o||{};feats[id]={id:id,s:o.s||'',t:o.t||''};return!isOff(id);}
function flags(){var r=[];for(var k in feats)r.push({id:k,s:feats[k].s,t:feats[k].t,off:isOff(k)});for(var j in off)if(!feats[j])r.push({id:j,s:'?',t:'',off:true});return r;}
function on(ev,fn,id){(evs[ev]=evs[ev]||[]).push({fn:fn,id:id});}
function emit(ev){var a=Array.prototype.slice.call(arguments,1),L=evs[ev],r;if(!L)return;for(var i=0;i<L.length;i++){if(isOff(L[i].id))continue;try{var x=L[i].fn.apply(null,a);if(r===undefined)r=x;}catch(e){err(ev+(L[i].id?'/'+L[i].id:''),e);}}return r;}
function mx(a,b){for(var k in b){var x=b[k],y=a[k];if(typeof x==='number'){if(!(typeof y==='number')||x>y)a[k]=x;}
else if(typeof x==='string'){if(!(typeof y==='string')||x>y)a[k]=x;}
else if(x&&typeof x==='object'&&!Array.isArray(x)){if(!y||typeof y!=='object'||Array.isArray(y))a[k]=y={};mx(y,x);}
else if(y===undefined)a[k]=x;}
return a;}
function isO(v){return!!v&&typeof v==='object'&&!Array.isArray(v);}
function cp(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
function fixOne(f){try{var v=S[f.key];if(v==null&&isOff(f.id))return;if(!isO(v))v=S[f.key]=f.o.def?f.o.def():{};if(f.o.fix)f.o.fix(v,S);}catch(e){err('fix/'+f.key,e);}}
function field(l,o){o=o||{};var key='r2'+l,f={key:key,id:o.id||key,o:o};fields[key]=f;try{if(typeof S!=='undefined')fixOne(f);}catch(e){}return key;}
function fixAll(){for(var k in fields)fixOne(fields[k]);}
function size(){var r={};try{for(var k in S)if(/^r2/.test(k))r[k]=JSON.stringify(S[k]).length;}catch(e){}return r;}
function mergeWrap(ms){return function(d){var snap={},k;try{for(k in fields)snap[k]=isO(S[k])?cp(S[k]):null;}catch(e){}
var r=ms.apply(this,arguments);try{if(isO(d))for(k in fields){var f=fields[k],b=d[k],a=snap[k];if(!isO(b)){if(a)S[k]=a;continue;}
if(!a)a=f.o.def?f.o.def():{};try{if(f.o.merge)f.o.merge(a,cp(b));else mx(a,b);}catch(e){err('merge/'+k,e);}S[k]=a;fixOne(f);}}catch(e){err('merge',e);}
return r;};}
var SL={home:'mapSlots',res:'resultSlots',daily:'dailySlots'};function slotPut(w,id,o){var list;try{list=window[SL[w]]||(w==='home'?mapSlots:w==='res'?resultSlots:dailySlots);}catch(e){}
if(!list||typeof slotAdd!=='function')return false;var wh=o.when,x={};for(var k in o)x[k]=o[k];x.id='r2_'+id;x.when=function(c){if(isOff(id))return false;return wh?wh(c):true;};slotAdd(list,x);return true;}
function slot(w,id,o){if(!SL[w]){err('slot','нет гнезда '+w);return;}if(!slotPut(w,id,o||{}))slotQ.push([w,id,o||{}]);}
function enter(id,prio,fn){enters.push({id:id,p:+prio||0,fn:fn});enters.sort(function(a,b){return b.p-a.p;});}
function mOn(){try{var m=document.getElementById('modal');return!!(m&&m.classList.contains('on'));}catch(e){return false;}}
function runEnter(hi){for(var i=0;i<enters.length;i++){var e=enters[i];if(isOff(e.id)||(e.p>=100)!==hi)continue;try{if(e.fn()===true){entered=true;try{STAT.ev('mod',{m:'r2enter',a:String(e.id).slice(0,30)});}catch(x){}return true;}}catch(x){err('enter/'+e.id,x);}if(mOn()){entered=true;return true;}}
return false;}
function ready(){try{return!G&&!window.__demo&&!mOn();}catch(e){return false;}}
function fetchTxt(src,ms){return new Promise(function(ok,no){var done=false,t=setTimeout(function(){if(!done){done=true;no(new Error('timeout '+src));}},ms||20000);fetch(src,{cache:'default'}).then(function(r){if(!r.ok)throw new Error(r.status+' '+src);return r.text();}).then(function(x){if(!done){done=true;clearTimeout(t);ok(x);}},function(e){if(!done){done=true;clearTimeout(t);no(e);}});});}
function fetchRetry(src,ms){var n=0;function go(){return fetchTxt(src,ms).catch(function(e){if(++n>2)throw e;return new Promise(function(r){setTimeout(r,n===1?600:2000);}).then(go);});}return go();}
function ld(src,ms){return fetchRetry(src,ms).then(function(code){var s=document.createElement('script');s.text=code+'\n//# sourceURL='+src;document.head.appendChild(s);});}
function need(src,ms){if(!loaded[src])loaded[src]=ld(src,ms).catch(function(e){delete loaded[src];err('need',e);throw e;});return loaded[src];}
function needAll(a,ms){var p=Promise.resolve();(a||[]).forEach(function(s){p=p.then(function(){return need(s,ms);});});return p;}
function css(href){if(!loaded[href])loaded[href]=fetchRetry(href).then(function(t){var st=document.createElement('style');st.textContent=t;document.head.appendChild(st);}).catch(function(e){delete loaded[href];err('css',e);});return loaded[href];}
var mgL=[],mgP=null,mgDone=false,mgSync=false,mgT0=0;function mgLazy(a){if(isOff('lazyMg')||/[?&]mg=/.test(location.search)){mgSync=true;for(var i=0;i<a.length;i++)document.write('<script src="'+a[i]+'"><\/script>');return;}
mgL=mgL.concat(a);}
function mgReady(){return mgSync||mgDone||!mgL.length;}
function mgLoad(why){if(mgReady())return Promise.resolve();if(!mgP){mgT0=now();mgP=needAll(mgL,30000).then(function(){mgDone=true;var ms=Math.round(now()-mgT0);try{STAT.ev('mod',{m:'mglazy',a:String(why||'').slice(0,12),ms:ms});}catch(e){}
try{if(window.MG_DVOR&&MG_DVOR.refresh)MG_DVOR.refresh();}catch(e){}
try{var mp=document.getElementById('scr-map');if(mp&&mp.classList.contains('on')&&!G&&!mOn()){if(typeof updDots==='function')updDots();if(typeof window.uiHomeBuild==='function')uiHomeBuild();}}catch(e){}
emit('mgready');},function(e){mgP=null;try{STAT.ev('mod',{m:'mglazy',a:'fail',k:String(e&&e.message||e).slice(0,30)});}catch(x){}throw e;});}
return mgP;}
function mgWait(why,fn){if(mgReady()){fn();return;}var t=null;try{t=setTimeout(function(){try{toast(L('Петрович достаёт снасти…','Petrovich is getting his gear…'),2500);}catch(e){}},250);}catch(e){}
mgLoad(why).then(function(){clearTimeout(t);fn();},function(){clearTimeout(t);try{toast(L('Не получилось загрузить — проверьте интернет','Failed to load — check your connection'),3000);}catch(e){}});}
function mgWire(){if(mgSync||!mgL.length)return;try{if(window.MG&&MG.play){var mp1=MG.play;MG.play=function(id,o){var self=this,a=arguments;if(mgReady()||(MG.reg&&MG.reg[id]))return mp1.apply(self,a);mgWait('play',function(){mp1.apply(self,a);});return true;};}}catch(e){err('mg/play',e);}
try{if(window.MG_DVOR&&MG_DVOR.open){var dv1=MG_DVOR.open;MG_DVOR.open=function(){var self=this,a=arguments;if(mgReady())return dv1.apply(self,a);mgWait('dvor',function(){dv1.apply(self,a);});};}}catch(e){err('mg/dvor',e);}
try{if(typeof window.openDaily==='function'){var od=window.openDaily;window.openDaily=function(){var r=od.apply(this,arguments);if(!mgReady())mgLoad('daily').then(function(){try{if(mOn()&&document.getElementById('dSlots')&&!G)window.openDaily();}catch(e){}},function(){});return r;};}}catch(e){err('mg/daily',e);}
try{if(typeof window.uiDvor==='function'){var ud=window.uiDvor;window.uiDvor=function(){var r=ud.apply(this,arguments);if(r&&window.MG_DVOR)r.open=function(){MG_DVOR.open();};return r;};}}catch(e){err('mg/ui',e);}
function bg(){var nb=false;try{nb=!(S.sessions>0)&&!(S.casts>0);}catch(e){}
if(nb){on('end',function(){setTimeout(function(){mgLoad('first').catch(function(){});},1500);});setTimeout(function(){mgLoad('nb120').catch(function(){});},120000);}
else setTimeout(function(){mgLoad('bg').catch(function(){});},1500);}
if(document.readyState==='complete')bg();else window.addEventListener('load',bg);}
function albWarm(){if(isOff('albFast'))return;try{if(!(S.sessions>0)||typeof fishCanvas!=='function')return;}catch(e){return;}
var ids=[];try{ids=Object.keys(FISH).concat(Object.keys(LEG));}catch(e){return;}var i=0;var idle=window.requestIdleCallback?function(f){requestIdleCallback(f,{timeout:3000});}:function(f){setTimeout(f,120);};function step(){try{if(G&&!G.over){setTimeout(function(){idle(step);},3000);return;}}catch(e){}
for(var k=0;k<2&&i<ids.length;k++,i++){var id=ids[i];try{var sil=!(S.alb[id]||(LEG[id]&&S.legs[id]));fishCanvas(id,120,sil);}catch(e){}}
if(i<ids.length)idle(step);}
idle(step);}
try{var st0=document.createElement('style');st0.textContent='body.r2af .ua-c{content-visibility:auto;contain-intrinsic-size:auto 210px}';(document.head||document.documentElement).appendChild(st0);document.addEventListener('DOMContentLoaded',function(){if(!isOff('albFast'))document.body.classList.add('r2af');});window.addEventListener('load',function(){setTimeout(albWarm,4000);});}catch(e){}
var mk={t:'',at:0},hM=[],hP=0,hX=0,hN=0,hRaf=0,hUntil=0;function now(){try{return performance.now();}catch(e){return Date.now();}}
function mark(t){t=String(t||'').slice(0,24);var n=now();mk.t=t;mk.at=n;hM.push([n,t]);if(hM.length>6)hM.shift();arm(3000);}
function busyNow(){try{if(G&&!G.over)return true;}catch(e){}try{if(window.MG&&MG.busy&&MG.busy())return true;}catch(e){}try{if(window.MG_DVOR&&MG_DVOR.on)return true;}catch(e){}return false;}
function hSc(){var sc='';try{if(window.MG&&MG.busy&&MG.busy()){for(var i=hM.length-1;i>=0;i--)if(/^mg:/.test(hM[i][1])){sc=hM[i][1].replace('mg:','mg_');break;}if(!sc)sc=(window.MG_DVOR&&MG_DVOR.on)?'dvor':'mg';}
else if(G)sc='fish'+(G.over?'_end':':'+(G.phase||''));else{var a=document.querySelector('.screen.on');sc=a?a.id.replace('scr-',''):'?';}
if(mOn()){var h=document.querySelector('#mcard h2');sc+=':m'+(h?':'+String(h.textContent||'').replace(/[^\wА-Яа-яЁё]+/g,'').slice(0,10):'');}}catch(e){}return sc.slice(0,30);}
function hBrk(){hX=now()+1500;hP=0;}
function hTick(t){hRaf=0;var p=hP;hP=t;var adOn=false;try{adOn=!!adW;}catch(e){}
if(p&&!document.hidden&&t>=hX&&p>=hX&&!adOn){var d=t-p;if(d>=300&&d<1000){try{var ms=[];for(var i=0;i<hM.length;i++)if(hM[i][0]>=p-50&&/^(t:|m:|w:|mg:)/.test(hM[i][1]))ms.push(hM[i][1]);if(ms.length&&STAT.slow)STAT.slow(ms[ms.length-1],d,{s2:hSc(),mk:ms.join(',').slice(0,40),bt:Math.round(p/1000)});}catch(e){}}
if(d>=1000&&d<60000&&hN<5){hN++;try{var m2=[];for(var j=0;j<hM.length;j++)if(hM[j][0]>=p-50)m2.push(hM[j][1]);var o={ms:Math.round(d),sc:hSc(),mk:(m2.join(',')||(hM.length?'~'+hM[hM.length-1][1]:'')).slice(0,40),bt:Math.round(t/1000)};try{if(typeof LOW!=='undefined'&&LOW)o.lw=1;}catch(e){}
STAT.ev('hang',o);}catch(e){}}}
if(t<hUntil||busyNow())hRaf=requestAnimationFrame(hTick);else hP=0;}
function arm(ms){if(isOff('hang'))return;try{hUntil=Math.max(hUntil,now()+(ms||3000));if(!hRaf){hP=0;hRaf=requestAnimationFrame(hTick);}}catch(e){}}
try{document.addEventListener('visibilitychange',hBrk);window.addEventListener('blur',hBrk);window.addEventListener('focus',hBrk);['pointerdown','keydown'].forEach(function(e){window.addEventListener(e,function(){arm(3000);},true);});}catch(e){}
function enterHi(){if(entered||!ready())return false;var r=runEnter(true);if(r)entered=true;return r;}
function enterLo(shown){if(entered)return false;if(shown||mOn()){entered=true;return false;}entered=true;return ready()&&runEnter(false);}
function wire1(){if(wired)return;wired=true;try{mergeSave=mergeWrap(mergeSave);}catch(e){err('wire/merge',e);}
try{var fs=fixSave;fixSave=function(){var r=fs.apply(this,arguments);fixAll();return r;};}catch(e){err('wire/fix',e);}
try{var sf=startFish;startFish=function(){mark('t:fish');var r=sf.apply(this,arguments);try{if(G)emit('run',G);}catch(e){}return r;};}catch(e){err('wire/run',e);}
try{var fi=finish;finish=function(){var g=G,was=g&&g.over;mark('w:res');var r=fi.apply(this,arguments);try{if(g&&!was&&g.over)emit('end',g);}catch(e){}return r;};}catch(e){err('wire/end',e);}
try{fixAll();}catch(e){}}
function wire2(){if(!wired)wire1();try{var om=openMap;openMap=function(){mark('t:map');var r=om.apply(this,arguments);emit('home');return r;};}catch(e){err('wire/home',e);}
try{if(window.MG_DVOR&&MG_DVOR.open){var dvo=MG_DVOR.open;MG_DVOR.open=function(){mark('t:dvor');var r=dvo.apply(this,arguments);emit('dvor');return r;};}}catch(e){err('wire/dvor',e);}
var MK={openAlb:'t:alb',openShop:'t:shop',openMail:'m:mail',openDaily:'m:daily',openWeek:'m:week',openRank:'m:rank',openSettings:'m:set',openOrders:'m:ord',openBook:'m:book'};for(var fn in MK)(function(fn,t){try{var f=window[fn];if(typeof f!=='function')return;window[fn]=function(){mark(t);return f.apply(this,arguments);};}catch(e){}})(fn,MK[fn]);try{if(window.MG&&MG.play){var mp0=MG.play;MG.play=function(id){mark('mg:'+id);return mp0.apply(this,arguments);};}}catch(e){err('wire/mg',e);}
mgWire();var q=slotQ;slotQ=[];for(var i=0;i<q.length;i++)if(!slotPut(q[i][0],q[i][1],q[i][2]))err('slot','нет slotAdd');try{fixAll();}catch(e){}
try{var mp=document.getElementById('scr-map');if(mp&&mp.classList.contains('on')&&!G){if(q.length&&typeof window.uiHomeBuild==='function')uiHomeBuild();emit('home');}}catch(e){}}
try{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire2);else setTimeout(wire2,0);}catch(e){}
return{off:isOff,reg:reg,flags:flags,on:on,emit:emit,field:field,size:size,slot:slot,enter:enter,need:need,needAll:needAll,css:css,mgLazy:mgLazy,mgLoad:mgLoad,mgReady:mgReady,merge:mx,mark:mark,wire1:wire1,enterHi:enterHi,enterLo:enterLo,get mk(){return mk;},_st:function(){return{off:off,on:onq,all:all,feats:feats,enters:enters.length,entered:entered,fields:Object.keys(fields),wired:wired};}};})();