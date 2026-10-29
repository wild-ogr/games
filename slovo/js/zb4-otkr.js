'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4o',{t:'Зина 4.0: открытки и табели «переслать»',who:'OTKR'});
var F={utro:'Открытка «С добрым утром» (Дом, до 13:00)',hol:'Праздничная открытка (без голоса)',perl:'«Перл дня» в «Вечёрке»',
dnev:'Дневник за неделю (воскресенье)',den:'«История дня» (сторис VK)',tab:'Табель уровня (строка окна победы)'};
var O={};for(var k in F)O[k]=Z.reg('z4o.'+k,{t:'Открытки: '+F[k],who:'OTKR'});
var D=['u','dv','st'],W=['n','w','h','b','c'],T=['tn','tw'];
function fx(z){D.concat(W,T,['k','d','td']).forEach(function(x){z[x]=Math.max(0,Math.floor(+z[x]||0));});z.d&=127;}
Z.field('z4o',{def:{u:0,dv:0,st:0,k:0,n:0,w:0,h:0,b:0,c:0,d:0,td:0,tn:0,tw:0},
merge:function(m,c){fx(c);D.forEach(function(x){m[x]=Math.max(+m[x]||0,c[x]);});
if(c.k>(+m.k||0)){m.k=c.k;m.d=c.d;W.forEach(function(x){m[x]=c[x];});}
else if(c.k===+m.k){m.d=(+m.d|0)|c.d;W.forEach(function(x){m[x]=Math.max(+m[x]||0,c[x]);});}
if(c.td>(+m.td||0)){m.td=c.td;T.forEach(function(x){m[x]=c[x];});}
else if(c.td===+m.td)T.forEach(function(x){m[x]=Math.max(+m[x]||0,c[x]);});},
fix:fx});
if(!ON)return;
Z.OTKR={on:O};
Z.OPEN.z4o=4;
Z3.late('js/zb4-otkr-s.js',{day:4});
})();
