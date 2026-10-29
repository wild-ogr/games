(function(){'use strict';
var W=window;if(!W.V3||!V3.reg('first8',{s:'V3-CORE',t:'первые 8 секунд двора 1'}))return;
function g(){try{return typeof G!=='undefined'?G:null;}catch(e){return null;}}
function L2(r,e){try{return L(r,e);}catch(x){return r;}}
function act(){var G0=g();try{return!!(G0&&!G0.over&&!G0.daily&&G0.idx===0&&G0.moves===0&&G0.tutorId>=0&&!(S.levelsDone>0)&&!W.__demo);}catch(e){return false;}}
var t0=0,g0=null,tm=[],t1=0,mi=0,n=0,sent=false,tipT=0;
function clr(){for(var i=0;i<tm.length;i++)clearTimeout(tm[i]);tm=[];clearInterval(tipT);tipT=0;}
function at(ms,f){tm.push(setTimeout(function(){if(act()&&g()===g0)try{f();}catch(e){}},ms));}
function call(){var G0=g();n++;try{G0.hint=G0.tutorId;G0.hintT=2.2;G0.hintQ=[];}catch(e){}try{if(SND.horn)SND.horn();}catch(e){}try{if(typeof kick==='function')kick();}catch(e){}}
function tipHide(on){var t=document.getElementById('tip');if(!t)return;if(on){t.setAttribute('data-v3f8','1');t.style.visibility='hidden';}else{t.removeAttribute('data-v3f8');t.style.visibility='';}}
function out(w,ok,m1){if(sent)return;sent=true;try{if(V3.statY)mi=V3.statY().mi;}catch(e){}V3.ev('f8',{t1:t1?Math.min(99000,t1-t0):'',m1:m1?Math.min(99000,m1-t0):'',mi:mi,n:n,ok:ok,w:w});}
function start(){clr();if(!act()||sent)return;g0=g();t0=Date.now();t1=0;mi=0;n=0;
tipHide(true);
at(500,function(){var G0=g();try{G0.hint=G0.tutorId;G0.hintT=2.2;G0.hintQ=[];if(typeof kick==='function')kick();}catch(e){}});
at(1000,function(){n++;try{if(SND.horn)SND.horn();}catch(e){}});
at(1800,function(){try{if(typeof say==='function')say(L2('Тук-тук!','Knock-knock!'),'win');if(SND.tap){SND.tap();setTimeout(function(){try{SND.tap();}catch(e){}},160);}}catch(e){}});
at(5000,call);at(8000,function(){tipHide(false);});at(9000,call);at(13000,call);at(17000,call);}
function stop(){clr();tipHide(false);}
document.addEventListener('pointerdown',function(e){if(!g0||sent||!e.target||e.target.id!=='cv')return;if(!t1)t1=Date.now();
},{passive:true,capture:true});
function wrapExit(){if(typeof startExit!=='function'||startExit.__v3)return;var f=startExit;
var w=function(v){var G0=g(),first=G0&&G0===g0&&!sent&&G0.idx===0&&!G0.daily&&G0.moves<=1;var r=f.apply(this,arguments);
if(first){stop();out('e',1,Date.now());
try{var calm=S.calm===true;if(SND.whoosh)SND.whoosh();
if(!calm&&typeof toPx==='function'&&typeof trackPt==='function'){var p=toPx(trackPt(v.track,v.s+(v.L-1)/2)),cols=['#ff6b6b','#feca57','#48dbfb','#1dd1a1','#ff9ff3'];
for(var i=0;i<26;i++){var a=-Math.PI/2+(Math.random()-.5)*2.2,sp=160+Math.random()*220;G0.parts.push({x:p[0],y:p[1],vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:cs*.08,life:.9+Math.random()*.4,max:1.3,c:cols[i%cols.length],conf:true,rot:Math.random()*6,vr:(Math.random()-.5)*12});}}
setTimeout(function(){try{if(g()===G0&&typeof say==='function')say(L2('Вжух! Вот так и живём.','Whoosh! That’s the way.'),'win');}catch(e){}},350);}catch(e){}}
return r;};
w.__v3=1;w.__orig=f;startExit=w;}
V3.sub('yard',function(){if(g0&&!sent){out('x',0,0);}stop();g0=null;},'first8');
V3.sub('leave',function(){if(g0&&!sent&&act())out('x',0,0);},'first8');
UI.on('yard-start',function(o){stop();if(o&&!o.daily&&o.idx===0)setTimeout(start,80);});
UI.on('screen',function(s){if(s!=='game')stop();});
function boot(){wrapExit();if(act())setTimeout(start,80);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
setInterval(function(){var G0=g();if(g0&&G0===g0&&!sent&&G0.moves>0){stop();out('e',0,Date.now());}},500);
V3.first8={st:function(){return{t0:t0,t1:t1,mi:mi,n:n,sent:sent,act:act()};}};
})();