(function(){'use strict';
var W=window,D=document;
if(!W.V3UX||!V3UX.on('bub'))return;
var LIFE=4.5,QUIET=7000,quiet=0,lastIn=-1e9;
function ok(f,d){try{return f();}catch(e){return d;}}
function now(){return Date.now();}
function g(){return ok(function(){return G;},null);}
function tut(){return ok(function(){var q=G;return!!(q&&!q.daily&&q.idx===0&&!(S.levelsDone>0));},false);}
function wrapSay(){if(typeof W.say!=='function'||W.say.__v3b)return;var f=W.say;
W.say=function(text,where){var q=g();if(!q||tut())return f.apply(this,arguments);
var bench=where!=='win'||!(q.anc&&q.anc.wins&&q.anc.wins.length);
if(bench&&now()<quiet&&now()-lastIn>1200&&!/📺|рекламу|for an ad/.test(text))return;
var b0=q.bubbles[0],r=f.apply(this,arguments),b=q.bubbles[0];
if(b&&b!==b0&&!b.win)b.life=Math.min(b.life,LIFE);
return r;};
W.say.__v3b=1;if(f.__v3u)W.say.__v3u=1;}
function hit(e){var q=g();if(!q||!q.bubbles||!q.bubbles.length)return;var cv=D.getElementById('cv');if(!cv||e.target!==cv)return;
var b=q.bubbles[0],r=b.r;if(!r||b.t<.15)return;
var c=cv.getBoundingClientRect(),x=e.clientX-c.left,y=e.clientY-c.top;
if(x<r[0]-4||x>r[0]+r[2]+4||y<r[1]-4||y>r[1]+r[3]+4)return;
q.bubbles=[];quiet=now()+QUIET;
e.stopImmediatePropagation();if(e.cancelable)e.preventDefault();
ok(function(){V3.ev('ux',{k:'bubX',w:b.win?1:0});});}
D.addEventListener('pointerdown',hit,true);
D.addEventListener('pointerdown',function(){lastIn=now();},false);D.addEventListener('keydown',function(){lastIn=now();},true);
function homeBub(el){if(!el||el.__v3bx)return;el.__v3bx=1;
el.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('button,a,.v3jkb'))return;if(!el.classList.contains('on'))return;
el.__v3uOff=1;el.classList.remove('on');setTimeout(function(){el.__v3uOff=0;},0);e.stopPropagation();});}
function scan(){homeBub(D.getElementById('v3bub'));homeBub(D.getElementById('hBub'));}
function wrapSkin(){if(!W.V3SKIN||!V3SKIN.say||V3SKIN.say.__v3b)return;var f=V3SKIN.say;V3SKIN.say=function(){var r=f.apply(this,arguments);scan();return r;};V3SKIN.say.__v3b=1;if(f.__v3u)V3SKIN.say.__v3u=1;}
function css(){if(D.getElementById('v3bubCss'))return;var st=D.createElement('style');st.id='v3bubCss';st.textContent='#v3bub.on{pointer-events:auto;cursor:pointer}';(D.head||D.documentElement).appendChild(st);}
function boot(){css();wrapSay();wrapSkin();scan();}
V3.sub('boot',boot,'ux.bub');V3.sub('home',function(){setTimeout(scan,0);},'ux.bub');setTimeout(boot,0);
})();