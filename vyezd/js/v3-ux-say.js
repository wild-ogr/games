(function(){'use strict';
var W=window;
if(!W.V3UX||!V3UX.on('say'))return;
function ok(f,d){try{return f();}catch(e){return d;}}
function txt(s){return String(s==null?'':s).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();}
var MS={j:function(n){return Math.min(30000,8000+200*n);},o:function(n){return Math.min(20000,5000+120*n);}};
W.VYSAY={ms:function(t,j){return(j?MS.j:MS.o)(txt(t).length);},JOKE_MIN:12000};
function tut(){return ok(function(){var g=G;return!!(g&&!g.daily&&g.idx===0&&!(S.levelsDone>0));},false);}
var held=null;
function wrapSay(){if(typeof W.say!=='function'||W.say.__v3u)return;var f=W.say;
W.say=function(text,where){if(tut())return f.apply(this,arguments);
var g=ok(function(){return G;},null);
if(g&&held&&held.g===g&&g.bubbles.length&&g.bubbles[0]===held.b&&held.b.t<12){return;}
var r=f.apply(this,arguments);
ok(function(){var b=G.bubbles[0];if(!b)return;var n=txt(b.text).length,j=isJoke(b.text);b.life=j?MS.j(n)/1000:MS.o(n)/1000;held=j?{g:G,b:b}:null;});
return r;};W.say.__v3u=1;}
function isJoke(t){return ok(function(){if(!W.V3T||!V3T.dbg)return false;var l=V3T.dbg().last;return!!(l&&l.t===t);},false);}
function keep(el){if(!el||el.__v3uk)return;el.__v3uk=1;var until=0,paused=0,left=0,tm=0;
function arm(){var j=!!el.querySelector('.v3jk'),n=txt(el.innerText||el.textContent).length,ms=j?Math.max(MS.j(n),VYSAY.JOKE_MIN):MS.o(n);until=Date.now()+ms;clearTimeout(tm);tm=setTimeout(off,ms);}
function off(){if(paused){tm=setTimeout(off,500);return;}if(Date.now()<until-50){tm=setTimeout(off,until-Date.now());return;}until=0;el.__v3uOff=1;el.classList.remove('on');el.__v3uOff=0;}
new MutationObserver(function(){var on=el.classList.contains('on');
if(on&&!until)arm();
else if(!on&&until&&!el.__v3uOff&&Date.now()<until)el.classList.add('on');
}).observe(el,{attributes:true,attributeFilter:['class']});
new MutationObserver(function(){if(el.classList.contains('on'))arm();}).observe(el,{childList:true,subtree:false});
el.addEventListener('pointerdown',function(){if(!until)return;paused=1;left=Math.max(0,until-Date.now());});
var up=function(){if(!paused)return;paused=0;until=Date.now()+Math.max(left,1500);};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('pointerleave',up);
el.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('.v3jkb')&&until)until+=2000;},true);
if(el.classList.contains('on'))arm();}
function scan(){keep(document.getElementById('hBub'));keep(document.getElementById('v3bub'));}
function wrapSkin(){if(!W.V3SKIN||!V3SKIN.say||V3SKIN.say.__v3u)return;var f=V3SKIN.say;V3SKIN.say=function(){var r=f.apply(this,arguments);scan();return r;};V3SKIN.say.__v3u=1;}
function boot(){wrapSay();wrapSkin();scan();}
V3.sub('boot',boot,'ux.say');V3.sub('home',function(){setTimeout(scan,0);},'ux.say');setTimeout(boot,0);
var hhObs=null;function watchHouse(){var hh=document.getElementById('hHouse');if(!hh||hh.__v3uw)return;hh.__v3uw=1;hhObs=new MutationObserver(scan);hhObs.observe(hh,{childList:true});}
V3.sub('home',function(){setTimeout(watchHouse,0);},'ux.say');setTimeout(watchHouse,0);
})();