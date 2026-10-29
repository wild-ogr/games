'use strict';
(function(){
if(!window.Z4||!window.Z3||typeof ZB==='undefined')return;
var N=['d','nt','ng','gr','gw','gl','cwk','cwn'];
function I(v){v=Math.floor(+v||0);return isFinite(v)&&v>0?v:0;}
Z4.field('z4d',{def:{},
merge:function(m,c){c=c||{};var dm=I(m.d),dc=I(c.d),wm=I(m.cwk),wc=I(c.cwk);
m.nt=dm===dc?Math.max(I(m.nt),I(c.nt)):dc>dm?I(c.nt):I(m.nt);m.cwn=wm===wc?Math.max(I(m.cwn),I(c.cwn)):wc>wm?I(c.cwn):I(m.cwn);
['d','ng','gr','gw','gl','cwk'].forEach(function(k){m[k]=Math.max(I(m[k]),I(c[k]));});},
fix:function(z){N.forEach(function(k){z[k]=I(z[k]);});for(var j in z)if(N.indexOf(j)<0)delete z[j];}});
if(Z4.reg('z4d',{t:'Зина 4.0: подъезд играет вместе (наперегонки с соседкой, записки на полях, окна дома, общий кроссворд)',who:'PODEZD'}))
Z3.late('js/zb4-podezd-x.js',{day:4});
})();
