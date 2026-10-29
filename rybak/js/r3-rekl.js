(function(){'use strict';var W=window;if(typeof R3!=='object'||!R3||!R3.on||typeof intGo!=='function'||typeof showInterstitial!=='function')return;try{if(typeof LANG!=='undefined'&&LANG==='en')return;}catch(e){return;}
if(!R3.reg('rekl',{s:'R3-REKLAMA',t:'межэкранная вне рыбалки: выход из раздела на Мостки/Двор, ≥ 3 мин после любой рекламы'}))return;var $=function(id){return document.getElementById(id);};var DEF={on:1,gap:180,from:5,dwell:8,ses2:1,skip:['coins','shop','look','settings','about','how','credits','photo']};function C(){var c=null;try{c=W.R3E&&R3E.rekl;}catch(e){}c=c||{};var o={};for(var k in DEF)o[k]=c[k]!==undefined?c[k]:DEF[k];return o;}
function ev(k,o){try{var p={k:k};for(var x in o||{})p[x]=o[x];R3.ev('rekl',p);}catch(e){}}
function now(){return Date.now();}
var sec='',secT=0,tapT=0,tapAd=false,buyT=0,tryT=0,fly=false,tm=0;var HOME_SCR={map:1,game:1};if(typeof STAT==='object'&&STAT&&typeof STAT.screen==='function'){var sc0=STAT.screen;STAT.screen=function(n){try{n=String(n||'');if(n==='game'){sec='';}else if(!HOME_SCR[n]){if(!sec){sec=n;secT=now();}else sec=n;}else if(n==='map')soon();}catch(e){}
return sc0.apply(this,arguments);};}
function adBtn(t){try{var b=t&&t.closest&&t.closest('button,[role=button],.btn,a');if(!b)return false;if(typeof AD_BTN_SEL==='string'&&b.matches&&b.matches(AD_BTN_SEL))return true;if(/\bbuy\b|\bx2\b|pay/i.test(b.className||'')||/buy|pay|Ad$|Ad\d/i.test(b.id||''))return true;var t2=b.textContent||'';return t2.indexOf('📺')>=0||t2.indexOf('⭐')>=0;}catch(e){return false;}}
try{document.addEventListener('pointerdown',function(e){tapT=now();tapAd=adBtn(e.target);},true);document.addEventListener('click',function(e){if(adBtn(e.target)){tapT=now();tapAd=true;}},true);}catch(e){}
try{if(typeof PAY==='object'&&PAY&&typeof PAY.buy==='function'){var pb=PAY.buy;PAY.buy=function(){buyT=now();return pb.apply(this,arguments);};}}catch(e){}
if(typeof hideModal==='function'){var hm=hideModal;hideModal=function(){var r=hm.apply(this,arguments);soon();return r;};}
if(typeof show==='function'){var sh=show;show=function(id){var r=sh.apply(this,arguments);if(id!=='scr-fish')soon();else sec='';return r;};}
try{var app=$('app')||document.body;new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var rn=ms[i].removedNodes;for(var j=0;j<rn.length;j++){var c=rn[j].className;if(typeof c==='string'&&/\bmg-(lay|dv)\b/.test(c)){soon();return;}}}}).observe(app,{childList:true});}catch(e){}
function soon(){if(!sec||fly)return;clearTimeout(tm);tm=setTimeout(check,450);}
function calm(){try{if(typeof G!=='undefined'&&G&&!G.over)return false;}catch(e){}
try{if(typeof modalOn!=='undefined'&&modalOn)return false;}catch(e){}
try{if(document.hidden)return false;if(typeof paused!=='undefined'&&paused)return false;}catch(e){}
var f=$('scr-fish');if(f&&f.classList.contains('on'))return false;var ad=$('ad');if(ad&&ad.classList.contains('on'))return false;if(document.querySelector('.mg-lay'))return false;var x=document.elementFromPoint((W.innerWidth||360)/2,(W.innerHeight||640)/2);return!!(x&&x.closest&&(x.closest('#scr-map')||x.closest('.mg-dv')));}
function noAds(){try{if(PAY.own('no_ads'))return true;}catch(e){}
try{if(typeof clubOn==='function'&&clubOn())return true;}catch(e){}
try{if(S.r3k&&+S.r3k.to>now())return true;}catch(e){}return false;}
function newbie(c){try{if((+S.sessions||0)<c.from)return true;if(c.ses2&&typeof ses2==='function'&&!ses2())return true;}catch(e){return true;}return false;}
function gapMs(c){var g=Math.max(30,+c.gap||180)*1000;try{g=Math.max(g,AD_GAP);}catch(e){}return g;}
function why(c){if(!c.on)return'off';if(R3.off('rekl'))return'off';if(!calm())return'busy';try{if(!adOk())return'noad';}catch(e){return'noad';}
if(noAds())return'noads';if(newbie(c))return'new';for(var i=0;i<c.skip.length;i++)if(c.skip[i]===sec||(c.skip[i]==='mg'&&sec.indexOf('mg_')===0))return'skip';if(now()-secT<(+c.dwell||0)*1000)return'short';if(tapAd&&now()-tapT<2000)return'tap';if(buyT&&now()-buyT<60000)return'buy';try{if(adBusy)return'busy';}catch(e){}
var g=gapMs(c);try{if(now()-lastAdT<g)return'gap';}catch(e){return'gap';}
if(tryT&&now()-tryT<g)return'gap';return'';}
function fishing(){try{if(typeof G!=='undefined'&&G&&!G.over)return true;}catch(e){}var f=$('scr-fish');return!!(f&&f.classList.contains('on'));}
function check(){if(!sec||fly)return;var c=C(),s=sec,w='';if(fishing()){sec='';return;}
try{w=why(c);}catch(e){w='err';}
if(w==='busy')return;sec='';if(w){if(w!=='off'&&w!=='gap'&&w!=='new'&&w!=='short'&&w!=='noads')ev('skip',{s:s,y:w});return;}
try{if(typeof VK!=='undefined'&&VK&&typeof vkIntOk!=='undefined'&&vkIntOk!==true){if(typeof vkIntLoad==='function')vkIntLoad();ev('skip',{s:s,y:'load'});return;}}catch(e){}
go(s);}
function go(s){var w=0;try{w=Math.round((now()-lastAdT)/1000);}catch(e){}
tryT=now();fly=true;ev('go',{s:s,w:w});var sa=STAT.ad,res='';STAT.ad=function(f,r,cd,x){if(f==='int'&&fly){res=r;var y={};for(var k in x||{})y[k]=x[k];y.rk=1;x=y;}return sa.call(this,f,r,cd,x);};var done=function(){if(!fly)return;fly=false;STAT.ad=sa;ev(res==='show'?'show':res||'none',{s:s});};try{intGo(done);}catch(e){done();}
setTimeout(function(){if(fly&&!(typeof adBusy!=='undefined'&&adBusy)){var a=$('ad');if(!(a&&a.classList.contains('on')))done();}},70000);}
W.R3REKL={why:function(){return why(C());},check:check,_st:function(){return{sec:sec,secT:secT,tryT:tryT,fly:fly};},_ago:function(ms){if(tryT)tryT-=ms;}};})();