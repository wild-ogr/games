'use strict';
(function(){
var MAIL_ON=true;
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||!ZB2.reg('mail',{t:'Написать бабе Зине',who:'TECH',on:MAIL_ON}))return;
var K=['w','n','d'];
ZB2.field('z2t',{def:{w:0,n:0,d:0},fix:function(v){K.forEach(function(k){v[k]=Math.max(0,Math.floor(+v[k]||0));});},
merge:function(v,c){K.forEach(function(k){v[k]=Math.max(+v[k]||0,+c[k]||0);});}});
function z(){if(!S.z2t||typeof S.z2t!=='object')S.z2t={w:0,n:0,d:0};return S.z2t;}
function day(){var t=Date.now();return Math.floor((t-new Date(t).getTimezoneOffset()*6e4)/864e5);}
function st(a,f){try{STATZB.z2('mail',{a:a,f:f,l:+S.lv||0});}catch(e){}}
function tap(){try{SND.tap();}catch(e){}}
var M=window.ZB2MAIL={_z:z,_day:day,_st:st,
go:function(f,back){ZB.load('js/zb2-mail-ui.js').then(function(){M.open(f,back);},function(){try{toast('Письмо не открылось — проверь интернет',3000);}catch(e){}});}};
function hook(){var oc=window.openCredits;if(typeof oc!=='function'||oc.__zt)return;
var w=window.openCredits=function(){oc.apply(this,arguments);var mc=document.getElementById('mcard'),bt=mc&&mc.querySelector('.btns');
if(!bt||document.getElementById('ztRow'))return;var b=document.createElement('button');b.className='setrow';b.id='ztRow';
b.innerHTML='<span>✉️ Написать бабе Зине<br><small>похвалить, поругать, подсказать</small></span><b>›</b>';
bt.parentNode.insertBefore(b,bt);b.onclick=function(){tap();M.go('about',function(){window.openCredits();});};};w.__zt=1;}
hook();ZB.on('ready',hook);
function want(c){if(c.daily||c.light||!c.first||c.busy||c.g.hinted||(+S.lv||0)<15)return false;
if(window.ZBNB&&ZBNB.turn&&ZB.safe('ZBNB.turn',function(){return ZBNB.turn('mail');})===false)return false;
var v=z(),d=day();return d-v.w>=7&&d-v.d>=7;}
ZB.add(ZB.winSlots,{id:'ztm-mail',order:90,zone:'extra',
render:function(c){var r=c&&c.r;if(!r||!c.g)return'';
if(r.ztMail===undefined){r.ztMail=want(c)?1:0;if(r.ztMail){z().w=day();try{save();}catch(e){}st('show','win');}}
return r.ztMail?'<p class="ztm-win"><button class="wmenu ztm-link" id="ztWin" style="min-height:44px;margin:0">✉️ Напиши бабе Зине пару слов</button></p>':'';},
mount:function(root,c){var b=root&&root.querySelector('#ztWin');if(b)b.onclick=function(){tap();var g=c.g,r=c.r;
M.go('win',function(){try{winModal(g,r,true);}catch(e){hideModal();}});};}});
})();
