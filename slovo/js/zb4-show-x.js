'use strict';
(function(){
var W=window.Z4W;if(!W||window.Z4WX)return;
var esc=W.esc,cur=null;
function pc(){try{return!!(window.ZMG&&ZMG.pc&&ZMG.pc());}catch(e){return false;}}
function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
function scene(id){if(cur)cur.close();var s=W.SH[id],root=document.createElement('div');root.id='z4wHost';root.className='z4w z4w-'+id+(calm()?' z4w-calm':'');
root.innerHTML='<div class="z4w-head"><span class="z4w-ic">'+s.ic+'</span><b class="z4w-nm">'+esc(s.t)+'</b><span class="z4w-top"></span>'+
'<button class="z4w-xb" aria-label="Закрыть">✕</button></div><div class="z4w-el"></div>';
document.body.appendChild(root);var qs=[],ks=[],dead=0;
var sc={id:id,root:root,el:root.querySelector('.z4w-el'),pc:pc(),calm:calm(),
top:function(t){root.querySelector('.z4w-top').textContent=t==null?'':String(t);},
onClose:function(f){qs.push(f);},keys:function(f){ks.unshift(f);},
close:function(){if(dead)return;dead=1;if(cur===sc)cur=null;document.removeEventListener('keydown',kd,true);root.remove();
qs.forEach(function(f){try{f();}catch(e){console.error(e);}});try{ZB.refresh&&ZB.refresh();}catch(e){}},
say:function(who,t){return'<div class="z4w-say"><span class="z4w-sf">'+W.face(who)+'</span><p class="z4w-sb">'+esc(t)+'</p></div>';},
panel:function(who,t,btns,extra){var d=document.createElement('div');d.className='z4w-panel';
d.innerHTML=sc.say(who,t)+(extra||'')+'<div class="z4w-btns">'+btns.map(function(b,i){return'<button class="btn '+(b.cls||'green')+'" data-i="'+i+'">'+esc(b.t)+
(sc.pc&&i<9?' <kbd class="z4w-kc">'+(btns.length>1?i+1:'Enter')+'</kbd>':'')+'</button>';}).join('')+'</div>';
sc.el.innerHTML='';sc.el.appendChild(d);var used=0;
function hit(i){if(used||!btns[i])return;used=1;try{SND.tap();}catch(e){}btns[i].f();}
d.querySelectorAll('[data-i]').forEach(function(b){b.onclick=function(){hit(+b.getAttribute('data-i'));};});
sc.keys(function(k){if(used||!d.parentNode)return false;if(k==='Enter'&&btns.length===1){hit(0);return true;}if(/^[1-9]$/.test(k)){hit(+k-1);return true;}return false;});
return d;}};
function kd(e){if(dead)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();sc.close();return;}
for(var i=0;i<ks.length;i++){var r=false;try{r=ks[i](e.key,e);}catch(x){console.error(x);}if(r){e.preventDefault();e.stopPropagation();return;}}}
document.addEventListener('keydown',kd,true);
root.querySelector('.z4w-xb').onclick=function(){try{SND.tap();}catch(e){}sc.close();};
cur=sc;return sc;}
function opts(sc,list,f){var d=document.createElement('div');d.className='z4w-opts';
d.innerHTML=list.map(function(t,i){return'<button class="z4w-opt" data-i="'+i+'">'+(sc.pc?'<kbd class="z4w-kc">'+(i+1)+'</kbd> ':'')+esc(t)+'</button>';}).join('');
var used=0;function hit(i){if(used||!list[i]||d.querySelector('.z4w-opt[data-i="'+i+'"]').disabled)return;used=1;f(i,d);}
d.querySelectorAll('.z4w-opt').forEach(function(b){b.onclick=function(){hit(+b.getAttribute('data-i'));};});
sc.keys(function(k){if(used||!d.parentNode)return false;if(/^[1-4]$/.test(k)){hit(+k-1);return true;}return false;});return d;}
function shuffle(a,r){r=r||Math.random;for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function rng(seed){var a=seed>>>0||1;return function(){a=(a*1664525+1013904223)>>>0;return a/4294967296;};}
function finish(sc,id,score,coins,who,text,more){W.fin(id,score);var c=coins>0?W.pay(coins,id):0;
try{if(window.SND)(c?SND.coin:SND.win)();}catch(e){}
sc.top('');sc.panel(who,text,[{t:'Закрыть',f:function(){sc.close();}}],'<p class="z4w-res">'+(score?'<b>'+score+'</b> '+(typeof plural==='function'?plural(score,'очко','очка','очков'):'очков'):'')+
(c?' · +'+c+' '+(typeof COIN_I!=='undefined'?COIN_I:'монет'):'')+'</p>'+(more||''));}
window.Z4WX={shows:{},scene:scene,opts:opts,shuffle:shuffle,rng:rng,finish:finish,
run:function(id,ctx){var f=window.Z4WX.shows[id];if(!f)return null;var sc=scene(id);try{f(sc,ctx||{});}catch(e){console.error(e);sc.close();}return sc;}};
})();
