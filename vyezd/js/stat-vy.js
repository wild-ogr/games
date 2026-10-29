(function(){
'use strict';
function S_(){return typeof STAT!=='undefined'&&STAT&&STAT.ev?STAT:null;}
function ev(n,p){var s=S_();if(!s)return;var o={},k;for(k in p)if(p.hasOwnProperty(k)&&p[k]!==undefined&&p[k]!==null&&p[k]!=='')o[k]=p[k];try{s.ev(n,o);}catch(e){}}
function g(){try{return typeof G!=='undefined'?G:null;}catch(e){return null;}}
function sv(){try{return typeof S!=='undefined'?S:null;}catch(e){return null;}}
function now(){return Date.now();}
function $(id){return document.getElementById(id);}
function modalOn(){var m=$('modal');return!!(m&&m.classList.contains('on'));}
function skNow(){try{var d=STAT._dbg();return d&&d.hdr&&d.hdr.sk||'';}catch(e){return'';}}
function wrapFn(name,after,before){var f=window[name];if(typeof f!=='function'||f.__vy)return false;
var w=function(){var x;try{if(before)x=before.apply(this,arguments);}catch(e){}var r=f.apply(this,arguments);try{if(after)after.apply(this,[x].concat([].slice.call(arguments)));}catch(e){}return r;};
w.__vy=1;w.__orig=f;window[name]=w;return true;}
var cur={l:0,m:'',t0:0},forceMode='',fails={},loseN={},yardHooked=false,lastYard={k:'',t:0};
function sec(){return cur.t0?Math.round((now()-cur.t0)/1000):0;}
function key(){return cur.l+'|'+cur.m;}
(function(){var s=S_();if(!s||s.lvl.__vy)return;var l0=s.lvl;
s.lvl=function(l,m,x){var G_=g();if(!m){m=forceMode||(G_&&(G_.mode||G_.lvMode))||'';forceMode='';}
cur={l:l,m:m?String(m).slice(0,12):'',t0:now()};return l0.call(s,l,m,x);};s.lvl.__vy=1;})();
function yard(o){if(!o)return false;
var m=String(o.mode!=null?o.mode:o.m!=null?o.m:cur.m||'');if(m==='n')m='';m=m.slice(0,12);
var l=o.daily||m==='daily'||!(o.lv||o.l)?cur.l:(o.lv!=null?o.lv:o.l),ok=o.ok?1:0,e=o.end==='quit'||o.end==='restart'?o.end:'',k=l+'|'+m+'|'+ok+e,t=now();
if(lastYard.k===k&&t-lastYard.t<700)return false;lastYard={k:k,t:t};
var fk=l+'|'+m,fl=o.fails!=null?+o.fails||0:fails[fk]||0;
ev('yard',{l:l,ok:ok,e:e,f:ok&&o.first?1:undefined,m:m,st:ok?(o.stars!=null?o.stars:o.st):undefined,fl:fl||undefined,s:o.sec!=null?Math.round(o.sec):o.s,
mv:o.moves!=null?o.moves:o.mv,h:(o.hint!=null?+o.hint:o.h)||undefined,tw:+o.tow||undefined,u:(o.undo!=null?+o.undo:o.u)||undefined,rg:o.region!=null?o.region:o.rg});
if(ok)delete fails[fk];else if(!e)fails[fk]=fl+1;return true;}
function yardOwn(ok){if(yardHooked)return;var G_=g();if(!G_)return;
yard({l:cur.l,m:cur.m,ok:ok,st:ok?Math.max(1,G_.hearts|0):undefined,s:sec(),mv:G_.moves,h:G_.helps});}
function hook(){if(yardHooked)return true;var h=window.yardHook;if(!h)return false;
try{if(typeof h.push==='function')h.push(yard);else if(typeof h.on==='function')h.on(yard);else if(typeof h.add==='function')h.add(yard);else return false;}catch(e){return false;}
yardHooked=true;return true;}
var wName='',wEl=null;
function wnd(n){wName=String(n||'?').slice(0,12);var c=$('mcard');wEl=c&&c.firstElementChild;}
function curWnd(){if(!modalOn())return'';var c=$('mcard');return c&&wEl&&c.firstElementChild===wEl?wName:'?';}
var wClick=null,lClick=null;
function bName(b){var x=b.getAttribute('data-st')||b.id||'';x=x.replace(/^m(?=[A-Z])/,'').toLowerCase();if(x==='map2')x='map';return(x||'btn').slice(0,12);}
wrapFn('win',function(){var G_=g();wnd('win');wClick=G_;yardOwn(1);try{if(G_&&!G_.daily&&typeof S!=='undefined')delete loseN[key()];}catch(e){}shuraIn('win');});
wrapFn('lose',function(){var G_=g();if(!G_||!modalOn())return;wnd('lose');if(lClick===G_&&G_.__vyL)return;lClick=G_;G_.__vyL=1;var k=key();loseN[k]=(loseN[k]||0)+1;
ev('lose',{l:cur.l,cr:G_.crashes,hp:G_.helps||undefined,rv:G_.stRv||undefined,n:loseN[k],m:cur.m});shuraIn('lose');});
wrapFn('renderHearts',function(){var G_=g();if(G_&&!G_.over&&G_.__vyL)G_.__vyL=0;});
document.addEventListener('click',function(e){var t=e.target;if(!t||!t.closest)return;
var b=t.closest('#mcard button');
if(b){var w=curWnd(),G_=g();
if(w==='win'&&wClick){ev('wbtn',{l:cur.l,b:bName(b),m:cur.m});wClick=null;}
else if(w==='lose'&&lClick){var n=bName(b);ev('lbtn',{l:cur.l,b:n,m:cur.m});if(n==='re'||n==='map'){yardOwn(0);lClick=null;}}}
var sh=t.closest('.shura');if(sh&&now()-npcT>3000){npcT=now();ev('npc',{w:'shura',k:curWnd()||lastScr||'?',c:1});}
},true);
var npcT=0,shSeen=typeof WeakSet==='function'?new WeakSet():null;
function shuraIn(k){var c=$('mcard');if(!c||!modalOn())return;var e=c.querySelector('.shura');if(!e||(shSeen&&shSeen.has(e)))return;if(shSeen)shSeen.add(e);ev('npc',{w:'shura',k:k});}
function carKind(v){if(!v)return'?';return String(v.car||v.model||v.kind||('c'+(v.L||(v.cells&&v.cells.length)||0))).slice(0,10);}
wrapFn('crash',function(x,v){var G_=g();if(!G_)return;ev('crash',{l:cur.l,k:carKind(v),a:G_.moves,t:sec(),lf:G_.hearts,m:cur.m});});
wrapFn('tow',function(){ev('yd',{a:'tow',l:cur.l,t:sec(),m:cur.m});});
(function(){var s=S_();if(!s||s.use.__vy)return;var u0=s.use;s.use=function(k){try{if(k==='hint')ev('yd',{a:'hint',l:cur.l,t:sec(),m:cur.m});}catch(e){}return u0.apply(s,arguments);};s.use.__vy=1;})();
var sk0='',cnt={},lastScr='',lastT=now(),closed=true;
(function(){var s=S_();if(!s||s.screen.__vy)return;var s0=s.screen;
s.screen=function(n){var r=s0.apply(s,arguments);try{
n=String(n).slice(0,16);var sk=skNow();if(sk!==sk0){sk0=sk;cnt={};}
if(!(n===lastScr&&!closed)){var d=Math.round((now()-lastT)/1000);cnt[n]=(cnt[n]||0)+1;
if(cnt[n]>=2&&n!=='game')ev('scr',{n:n,k:cnt[n],d:d});lastScr=n;lastT=now();}
closed=false;
setTimeout(function(){if(modalOn()){wnd(n);shuraIn(n);}else if(n==='map')chestWatch();},0);
}catch(e){}return r;};s.screen.__vy=1;})();
(function(){var m=$('modal');if(!m||typeof MutationObserver!=='function')return;var was=modalOn();
new MutationObserver(function(){var on=modalOn();if(was&&!on)closed=true;was=on;}).observe(m,{attributes:true,attributeFilter:['class']});})();
window.addEventListener('visibilitychange',function(){if(document.visibilityState!=='hidden')return;var w=curWnd();if(!w)return;var G_=g();
ev('md',{w:w,l:G_&&cur.l?cur.l:undefined});},true);
var SEL={life:'#mRev',x2:'#mX2',gift:'#sX2',hint:'#mHintAd',coins:'#mAdCoins',chest:'.chest [data-m="2"]'},ofSeen=typeof WeakSet==='function'?new WeakSet():null;
var IO=typeof IntersectionObserver==='function'?IntersectionObserver:null;
function visNow(el){if(!el||!el.isConnected||!el.offsetParent)return false;var r=el.getBoundingClientRect(),h=window.innerHeight||0,w=window.innerWidth||0;
return r.width>0&&r.height>0&&r.bottom>r.height*.5&&r.top<h-r.height*.5&&r.right>0&&r.left<w;}
function seeOnce(el,fn){if(!ofSeen)return fn();if(ofSeen.has(el))return;ofSeen.add(el);
if(visNow(el))return fn();if(!IO)return;
var io=new IO(function(es){for(var i=0;i<es.length;i++)if(es[i].isIntersecting&&es[i].intersectionRatio>=.5){io.disconnect();fn();return;}},{threshold:[.5]});io.observe(el);
setTimeout(function(){try{io.disconnect();}catch(e){}},10*60e3);}
(function(){var s=S_();if(!s||s.offer.__vy||!ofSeen)return;var o0=s.offer;
s.offer=function(p){var sel=SEL[p]||(/^nc_/.test(p)?'#mAdFree':'');if(!sel)return o0.apply(s,arguments);var a=arguments;
setTimeout(function(){try{var es=document.querySelectorAll(sel),i;for(i=0;i<es.length;i++)seeOnce(es[i],function(){o0.apply(s,a);});}catch(e){o0.apply(s,a);}},0);};s.offer.__vy=1;})();
var chSeen={};
function chestWatch(){setTimeout(function(){try{var bs=document.querySelectorAll('.chest [data-m="1"]'),i;
for(i=0;i<bs.length;i++)(function(b){var row=b.closest('.chest'),m=/(\d+)\s*[–-]/.exec(row&&row.textContent||''),k=m?Math.floor((+m[1]-1)/10):-1;
if(k<0)return;var id=skNow()+'|'+k;if(chSeen[id])return;
seeOnce(b,function(){if(chSeen[id])return;chSeen[id]=1;ev('chest',{a:'see',k:k+1});});})(bs[i]);}catch(e){}},250);}
function chest(a,k,m,gr){ev('chest',{a:a,k:(+k||0)+1,m:m,g:gr});}
var prgK='',prgOn=0,musK='';
function part(o){try{var x=o&&typeof o.prg==='function'?o.prg():null;return x&&typeof x==='object'?x:{};}catch(e){return{};}}
function num(v){return typeof v==='number'&&isFinite(v);}
function prg(){var s=sv();if(!S_()||!s)return;prgOn=1;var st=0,k,gr=s.garage&&s.garage.length||0;
try{for(k in s.stars||{})st+=+s.stars[k]||0;}catch(e){}
var c=part(window.CAR),y=part(window.YARD),l=part(window.LVL),p={gr:gr,st:st},a=[['rk',c.rk],['ds',c.ds],['yd',y.yd],['al',y.al],['lg',y.lg],['md',l.md]],i;
for(i=0;i<a.length;i++)if(num(a[i][1]))p[a[i][0]]=Math.round(a[i][1]);
var mk=skNow();if(mk!==musK){musK=mk;ev('mus',{on:s.music===true?1:0});}
var j=JSON.stringify(p);if(j===prgK)return;prgK=j;ev('prg',p);}
var hidT=0;
document.addEventListener('visibilitychange',function(){if(document.hidden){hidT=now();return;}if(prgOn&&hidT&&now()-hidT>30*60e3)setTimeout(prg,500);});
window.STATVY={yard:yard,chest:chest,prg:prg,wnd:wnd,mode:function(m){forceMode=String(m||'');},hook:hook,
_dbg:function(){return{cur:cur,fails:fails,hooked:yardHooked,wnd:curWnd(),cnt:cnt,prg:prgK};}};
if(!hook())window.addEventListener('load',hook);
try{if(typeof statPr!=='undefined'&&statPr)prg();}catch(e){}
})();