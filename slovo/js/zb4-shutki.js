'use strict';
(function(){
if(!window.Z4||typeof window.zina!=='function'||typeof window.zinaHide!=='function')return;
if(!Z4.reg('z4z.joke',{t:'Шутки Зины дольше на экране',who:'SHUTKI'}))return;
var JK={a:8,b:.2,max:30,lock:12,after:2,short:40},PL={a:5,b:.12,max:20},UA=1200;
var cur=null,FORCE=0,UACT=0;
var K=window.Z4SH={JK:JK,PL:PL,cur:function(){return cur;}};
function el(){return document.getElementById('zSay');}
function gl(){try{return typeof G!=='undefined'&&G?G:null;}catch(e){return null;}}
function inGame(){var g=document.getElementById('game');return!!(g&&g.classList.contains('on'));}
function isOn(e){return!!(e&&e.classList.contains('on'));}
function txtOf(e){var c=e.cloneNode(true);[].forEach.call(c.querySelectorAll('.znr'),function(x){x.parentNode.removeChild(x);});return c.textContent.replace(/\s+/g,' ').trim();}
function same(e){return!!(cur&&isOn(e)&&e.textContent.indexOf(cur.t)===0);}
function sched(ms){clearTimeout(zina._t);zina._t=setTimeout(function(){window.zinaHide();},Math.max(50,ms));}
K.dur=function(n,j,sec){var P=j?JK:PL,d=Math.min(P.max,P.a+P.b*n);if(!j&&sec&&sec!==99)d=Math.max(d,+sec||0);return d;};
function apply(t,sec,g){var e=el();if(!isOn(e)||e.textContent.indexOf(t)!==0)return;
if(!g||g.tut||sec===99){cur=null;return;}
var b=e.querySelector('.znr button'),id=b&&b.parentNode.getAttribute('data-id')||'',n=txtOf(e).length;
var j=!!b&&(!/^z[0-9a-z]+$/.test(id)||n>=JK.short),now=Date.now(),d=K.dur(n,j,sec);
cur={t:t,j:j,g:g,t0:now,end:now+d*1000,hov:0,rated:0,pend:0};
if(!e.classList.contains('pin')||j)sched(d*1000);}
function pass(t,sec,g){
if(!g||g.tut||g.won||!inGame()||cur.g!==g||sec===99||g.mdLim)return true;
if(Date.now()-UACT<UA)return true;
try{if(!g.words.some(function(x){return!x.found;}))return true;}catch(e){}
try{if(typeof JAR_PRIZE!=='undefined'&&String(t).slice(-(String(JAR_PRIZE).length+2))===' +'+JAR_PRIZE)return true;}catch(e){}
return false;}
function wrapZina(){var f=window.zina;if(typeof f!=='function'||f.__z4j)return;
var w=function(t,mood,sec){var g=gl(),e=el();
try{if(cur&&cur.j&&!cur.rated&&same(e)&&Date.now()<cur.t0+JK.lock*1000&&!pass(t,sec,g))return false;}catch(x){}
var r=f.apply(this,arguments);if(t){var s=String(t);setTimeout(function(){ZB.safe('z4j-say',function(){apply(s,sec,g);});},0);}return r;};
for(var k in f)if(/^__z/.test(k))w[k]=f[k];w.__z4j=1;window.zina=w;}
function wrapHide(){var f=window.zinaHide;if(f.__z4j)return;
var w=function(soft){var e=el();
if(cur&&!FORCE&&same(e)){var now=Date.now(),live=cur.j&&!cur.rated;
if(soft){if(live&&now<cur.end)return;}
else if(cur.hov&&!cur.rated){cur.pend=1;clearTimeout(zina._t);return;}
else if(now<cur.end-40){sched(cur.end-now);return;}}
var r=f.apply(this,arguments);if(!isOn(el()))cur=null;return r;};
w.__z4j=1;window.zinaHide=w;}
function hover(on){var e=el();if(!cur||!same(e)||cur.rated)return;var now=Date.now();
if(on){if(!cur.hov){cur.hov=1;cur.rem=Math.max(0,cur.end-now);}return;}
if(!cur.hov)return;cur.hov=0;cur.end=now+Math.max(cur.rem||0,2000);if(cur.pend){cur.pend=0;sched(cur.end-now);}}
function bind(){var e=el();if(!e||e.__z4j)return;e.__z4j=1;
e.addEventListener('pointerenter',function(){ZB.safe('z4j-in',function(){hover(1);});});
['pointerleave','pointercancel'].forEach(function(n){e.addEventListener(n,function(){ZB.safe('z4j-out',function(){hover(0);});});});
window.addEventListener('click',function(ev){var t=ev.target;if(!t||!t.closest)return;
if(t.closest('#zSay')){
if(t.closest('.znr button')){setTimeout(function(){ZB.safe('z4j-rate',function(){var s=el();if(!cur||!same(s)||!cur.j)return;
cur.rated=1;cur.hov=0;cur.pend=0;s.classList.remove('pin');cur.end=Date.now()+JK.after*1000;sched(JK.after*1000);});},0);}
else{FORCE=1;setTimeout(function(){FORCE=0;},0);}
return;}
if(!t.closest('#wheel')&&!t.closest('#pvOk'))UACT=Date.now();},true);}
wrapZina();wrapHide();bind();
})();
