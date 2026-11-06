'use strict';
(function(){
var X=window.FXZN;if(!X)return;
(function(){var C=window.ZBCELL,L=window.RS&&RS.lvl;if(!C||!C.start||C.start.__calm||!L||!L.calm)return;var s0=C.start;
C.start=function(){var g=typeof G!=='undefined'&&G;if(g&&!g.daily&&g.lv&&g.lv.z&&!L.next&&L.calm()&&(g.lv.z.m!=null||g.lv.z.b)){var z=Object.assign({},g.lv.z);delete z.m;delete z.b;g.lv=Object.assign({},g.lv,{z:z});}
return s0.apply(this,arguments);};C.start.__calm=1;})();
if(!X.ok('dvor'))return;var F={dvor:1};
function $(id){return document.getElementById(id);}
function ev(o){try{if(window.STAT&&STAT.ev)STAT.ev('fxz',o);}catch(e){}}
var due=null;
function yardOk(){return!!(window.RSH&&RSH.yard&&window.Z3Y0&&window.Z3&&Z3.on&&document.documentElement.classList.contains('rs-home-on')&&Z3.YARD&&Z3.YARD.length>0);}
ZB.levelHook.push(function(i){due=null;
if(!F.dvor||!i.ok||i.daily||!i.first||i.idx<5||!S.tip||S.tip.fxDv||!yardOk())return;
due={idx:i.idx,l:i.l};});
function show(g,r){if(!due||!g||g.daily||g.idx!==due.idx||S.tip.fxDv)return;
var mc=$('mcard'),w=mc&&mc.querySelector('.rsw');if(!w||w.querySelector('.rsw-urg')||r&&r.chap)return;
var c=w.querySelector('.rsw-card,.rsw-z');if(!c)return;
var NB=window.ZBNB,rl=NB&&NB.cur&&NB.RES&&NB.RES[NB.cur];if(rl&&rl.indexOf('home')<0)return;
var d=document.createElement('div');d.className='rsw-urg fx-dv';
d.innerHTML='<p>Загляни во Двор — там соседи и новости дома. Я тебя там жду!</p><button class="btn blue rsw-ub" id="fxDvor">🏡 Во двор</button>';
c.parentNode.replaceChild(d,c);S.tip.fxDv=1;save();ev({a:'dv',s:'show',l:due.l});var l=due.l;due=null;
$('fxDvor').onclick=function(){S.tip.fxDv=2;save();ev({a:'dv',s:'go',l:l});try{SND.tap();}catch(e){}hideModal();
var go=function(){ZB.safe('fx:yard',function(){RSH.yard();});};
if(typeof maybeInterstitial==='function')maybeInterstitial(go);else go();};}
function wrap(){var wm=window.winModal;if(typeof wm!=='function'||wm.__fx)return;
var w=function(g,r,again){var x=wm.apply(this,arguments);if(!again)ZB.safe('fx:dvor',function(){show(g,r);});return x;};w.__fx=1;window.winModal=w;}
wrap();
})();
