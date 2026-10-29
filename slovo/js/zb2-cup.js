'use strict';
(function(){
if(!window.ZB2||!ZB2.reg)return;
var ON=!!ZB2.reg('cup',{t:'Живая лига в Соседках (hobby-cup)',who:'UP-ZN'});
ZB2.field('z2u',{def:{on:0,jw:0,lgw:0,sv:0,svw:0,tr:0,sw:0},
merge:function(m,c){['on','jw','lgw','svw','sw'].forEach(function(k){m[k]=Math.max(+m[k]||0,+c[k]||0);});
if((+c.svw||0)>(+m.svw||0)||(+c.svw||0)===(+m.svw||0)&&(+c.sv||0)>(+m.sv||0))m.sv=+c.sv||0;
if((+c.jw||0)>=(+m.jw||0))m.tr=+c.tr||0;}});
var ZC=window.ZBCUP={on:ON,x:null};
ZB2.reg('okcup',{t:'Живая лига (подъезд) в Одноклассниках',who:'SRV'});
function plat(){try{if(typeof PLAT==='undefined'||typeof SHOT!=='undefined'&&SHOT)return false;if(PLAT==='vk')return typeof OK==='undefined'||!OK||!ZB2.off('okcup');return PLAT==='yandex';}catch(e){return false;}}
ZC.want=function(){return ON&&!ZB2.off('cup')&&plat()&&typeof sosOn==='function'&&sosOn();};
var xp=null;
ZC.load=function(){if(!xp)xp=ZB.load('js/zb2-cup-x.js').then(function(){return ZC.x;},function(e){xp=null;throw e;});return xp;};
var started=false;
function home(){if(started||!ZC.want())return;started=true;setTimeout(function(){ZC.load().then(function(x){if(x&&x.boot)ZB.safe('cup:boot',x.boot);},function(){});},3000);}
ZB.on('home',home);
ZB.on('ready',function(){var m=document.querySelector('.screen.on');if(m&&(m.id==='menu'||m.id==='zb-home'))home();});
})();
