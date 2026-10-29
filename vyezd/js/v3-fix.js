(function(){'use strict';
var W=window;if(!W.V3||!V3.on)return;
['bolt','news1','mih','yardn','bub','doroga','dup','leaves','toast'].forEach(function(k){V3.reg('fix.'+k,{s:'V3-CORE',t:'баг этажа 0: '+k});});
function dup(){if(!V3.fix('dup')||!Array.isArray(W.homeSlots))return;var td=null,vy=false;
for(var i=0;i<homeSlots.length;i++){var x=homeSlots[i];if(!x)continue;if(x.id==='td-mg')td=x;if(x.id==='vymg-day')vy=true;}
if(!td||!vy||td.__v3)return;var r0=td.render;td.render=function(){try{if(W.VYMG&&VYMG.today&&VYMG.today())return null;}catch(e){}return r0.apply(this,arguments);};td.__v3=1;}
if(V3.fix('leaves'))try{var cs=document.createElement('style');cs.textContent='html.v3 #festFx{z-index:9}';document.head.appendChild(cs);}catch(e){}
function tst(){if(!V3.fix('toast')||typeof toast!=='function'||toast.__v3)return;var f=toast;
var w=function(){var r=f.apply(this,arguments);try{var c=W.UI&&UI.cur,e=document.getElementById('toast');if(e&&(c==='home'||c==='map'))e.classList.add('mtop');}catch(x){}return r;};
w.__v3=1;w.__orig=f;for(var k in f)if(f.hasOwnProperty(k))w[k]=f[k];toast=w;}
function go(){dup();tst();try{if(W.UI)UI.refresh();}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
try{W.addEventListener('vy-late',function(){dup();try{if(W.UI)UI.refresh();}catch(e){}});}catch(e){}
})();