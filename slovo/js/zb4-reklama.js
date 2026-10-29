'use strict';
(function(){
if(typeof maybeInterstitial!=='function'||typeof interDue!=='function')return;
var O={t:'Межэкранная на переходах вне уровня',who:'REKLAMA'};
var ON=window.Z4&&Z4.reg?Z4.reg('z4ad',O):!!(window.ZB2&&ZB2.reg('z4ad',O));
if(!ON)return;
var CFG={on:1,gap:180,retry:30,day:4,hold:8,delay:450};
try{var c=window.Z4AD_CFG;if(c&&typeof c==='object')for(var k in c)if(k in CFG&&isFinite(+c[k]))CFG[k]=+c[k];}catch(e){}
if(typeof applyFlags==='function'&&!applyFlags.__z4ad){var af=applyFlags;applyFlags=function(f){af.apply(this,arguments);try{if(f&&typeof f==='object'){
var a=parseInt(f.scr_ad,10),g=parseInt(f.scr_gap,10);if(a===0||a===1)CFG.on=a;if(g>=120&&g<=600)CFG.gap=g;}}catch(e){}};applyFlags.__z4ad=1;}
var T=0,tryT=0,MINE=0,tapT=0,tapBad=0,mT=0,cur='';
function day(){try{return window.Z4?Z4.day():window.Z3?Z3.day():99;}catch(e){return 1;}}
function scrOn(){var e=document.querySelector('.screen.on');return e?e.id:'';}
function play(id){return!id||id==='game'||id.indexOf('mg_')===0||id==='zb-z3kiosk-sk';}
function busy(){return document.documentElement.classList.contains('zmg-open')||$('modal').classList.contains('on')||document.hidden||
(typeof interOn!=='undefined'&&interOn)||(typeof adBusy!=='undefined'&&adBusy)||(typeof PAY!=='undefined'&&PAY.busy)||
(typeof introOn!=='undefined'&&introOn)||(typeof inPlay==='function'&&inPlay());}
function nb(){return typeof nbNoInt!=='undefined'&&nbNoInt&&Date.now()-nbNoInt<300000;}
document.addEventListener('click',function(e){try{var t=e.target;tapT=Date.now();
tapBad=!!(t&&t.closest&&(t.closest(typeof AD_BTN_SEL!=='undefined'?AD_BTN_SEL:'.zbad')||t.closest('[data-pay],.pay,.zbpay,.adbtn')));}catch(x){tapBad=0;}},true);
function ok(){var now=Date.now();
return CFG.on&&!SHOT&&day()>=CFG.day&&now-lastInter>=CFG.gap*1000&&now-tryT>=CFG.retry*1000&&
!(tapBad&&now-tapT<3000)&&!nb()&&!busy()&&interDue();}
function want(k,sid){if(!ok())return;setTimeout(function(){go(k,sid);},CFG.delay);}
function go(k,sid){if(scrOn()!==sid||play(sid)||!ok())return;
var p=S.plays,li=lastInter;try{if(window.Z4)Z4.ev('z4ad',{a:'try',k:k,s:String(sid).slice(0,16)});}catch(e){}
MINE=1;maybeInterstitial(function(){MINE=0;if(lastInter!==li){T=lastInter;tryT=0;}else tryT=Date.now();});S.plays=p;}
if(typeof STAT!=='undefined'&&STAT.ad&&!STAT.ad.__z4ad){var sa=STAT.ad;STAT.ad=function(f,r,c,x){if(MINE&&f==='int'){x=x||{};x.w='scr';}return sa.call(this,f,r,c,x);};STAT.ad.__z4ad=1;}
ZB.on('screen',function(id){var prev=scrOn();cur=id;if(!prev||prev===id||play(prev)||play(id))return;want('s',id);});
if(typeof modal==='function'&&typeof hideModal==='function'){
var m0=modal;modal=function(){if(!$('modal').classList.contains('on'))mT=Date.now();return m0.apply(this,arguments);};
var h0=hideModal;hideModal=function(){var was=$('modal').classList.contains('on'),t=mT,r=h0.apply(this,arguments);
try{if(was&&t&&Date.now()-t>=CFG.hold*1000){var sid=scrOn();if(!play(sid))want('m',sid);}}catch(e){}return r;};}
window.Z4AD={cfg:CFG,ok:ok,last:function(){return T;},mine:function(){return MINE;}};
})();
