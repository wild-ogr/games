'use strict';
(function(){
var Z=window.Z3;if(!Z||!Z.on||typeof ZB==='undefined'||Z.skinS)return;Z.skinS=1;
var DE=document.documentElement;
Z.reg('z3season',{t:'Двор: слои сезонов (снег, капель, клумбы); выкл — только палитра сезона',who:'SKIN'});
Z.reg('z3fest',{t:'Двор: праздничные слои по FEST (НГ, День учителя…); по одному — ?off=z3f-<ny|hw|feb23|mar|mas|may|sep1|uch>',who:'SKIN'});
if(Z.reg('z3ev',{t:'Двор: украшение к живому событию газеты (шахматы, выборы, субботник…)',who:'SKIN'})){
var AE=window.Z3ART=window.Z3ART||{};AE.yardFx=AE.yardFx||[];
AE.evId=function(){try{var m=/[?&]z3ev=([a-z]+)/.exec(location.search);if(m&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname))return m[1];
var e=window.Z3PAPER&&Z3PAPER.evNow&&Z3PAPER.evNow();return e&&e.id||'';}catch(e){return'';}};
AE.yardFx.push(function(c){if(!AE.evOn&&!(c.fk&&c.fk.length)&&AE.evId())Z.artLoad('ev').then(function(){if(AE.yardRedraw)AE.yardRedraw();},function(){});return'';});
if(AE.yardRedraw&&AE.evId())AE.yardRedraw();}
function css(id,txt){if(!txt||document.getElementById(id))return;var s=document.createElement('style');s.id=id;s.textContent=txt;document.head.appendChild(s);}
var IC=Z.reg('z3ic',{t:'Значки MIX вместо эмодзи (бирки двора, экраны zb3: шапки, рубрики)',who:'SKIN'}),HD='.z3m-hd,.z3p-hd,.z3h-hd,.z3a-hd,.z3k-hd,.vc-hd,.z3y-tag b';
function icDo(){if(DE.classList.contains('th-x'))return;Z.artLoad('icons').then(function(){var A=window.Z3ART;if(!A.icDecor)return;css('z3icCss',A.icCss);
[].forEach.call(document.querySelectorAll('.screen.on'),function(sc){if(/^zb-(z3|vech)/.test(sc.id))ZB.safe('z3ic',function(){A.icDecor(sc);});else[].forEach.call(sc.querySelectorAll(HD),function(h){ZB.safe('z3ic',function(){A.icDecor(h);});});});},function(){});}
if(IC){ZB.on('screen',function(){setTimeout(icDo,60);setTimeout(icDo,700);});Z.whenReady(function(){setTimeout(icDo,0);});}
var KIT=Z.reg('z3kit',{t:'Уровень: фон «кухня Зины», за окном — место главы',who:'SKIN'});
function kitPaint(){var b=document.getElementById('zbLvBg'),A=window.Z3ART;if(!b||!A||!A.kitchen||/\bday\b/.test(b.className))return;
css('z3kitCss',A.kitchenCss);var w=b.clientWidth,h=b.clientHeight;if(!w||!h)return;
var pc=window.innerWidth>=860,t=Z.scene().time,key=w+'x'+h+t+pc,el=b.querySelector('.z3kit');
if(!el){el=document.createElement('div');el.className='z3kit';b.insertBefore(el,b.querySelector('.veil'));}
if(el.getAttribute('data-k')!==key){el.setAttribute('data-k',key);el.innerHTML=Z.art('kitchen',{w:w,h:h,pc:pc,time:t});}
b.classList.add('z3k');}
if(KIT){var kt=0;
ZB.on('start',function(info){if(info&&info.daily)return;Z.artLoad('kitchen').then(function(){ZB.safe('z3kit',kitPaint);},function(){});});
window.addEventListener('resize',function(){clearTimeout(kt);kt=setTimeout(function(){ZB.safe('z3kit',kitPaint);},250);});
var st=ZB._st,gm=document.getElementById('game');if(st&&!st.daily&&gm&&gm.classList.contains('on'))Z.artLoad('kitchen').then(function(){ZB.safe('z3kit',kitPaint);},function(){});}
var HOOP=Z.reg('z3hoop',{t:'Финал главы: место главы в пяльцах',who:'SKIN'});
if(HOOP)ZB.add(ZB.chapSlots,{id:'z3hoop',order:95,render:function(){return'<span hidden></span>';},mount:function(el,ctx){
if(!ZB.vw||DE.classList.contains('th-x')||!ZB.placeInto)return;var m=document.getElementById('mcard'),e=m&&m.querySelector('.chfin .em:not(.nx)');if(!e||e.getAttribute('data-h'))return;
css('z3hoopCss','.chfin .em.z3hoop{position:relative;overflow:hidden;border-radius:50%;border:5px solid #b97a48;box-shadow:0 0 0 2px #8a5530,inset 0 0 0 2px #e3b27c,0 6px 12px rgba(60,30,10,.3)}'+
'.chfin .em.z3hoop .z3hp{position:absolute;top:0;left:0;right:0;bottom:0}.chfin .em.z3hoop .z3hp svg{width:100%;height:100%;display:block}'+
'.chfin .em.z3hoop::after{content:"";position:absolute;left:50%;top:-1px;width:10px;height:7px;margin-left:-5px;border-radius:2px;background:#c9a25a}');
e.setAttribute('data-h',1);var c=ctx&&ctx.c!=null?ctx.c:0,d=document.createElement('div');d.className='z3hp';e.appendChild(d);e.classList.add('z3hoop');
ZB.safe('z3hoop',function(){ZB.placeInto(d,c,'xMidYMid slice');});}});
})();
