'use strict';
(function(){
if(!window.Z4||!window.Z3||typeof ZB==='undefined')return;
var N=['cd','cs','cn','fd','fn','ft','td','tn','rg','gd','gn','gw'];
function I(v){v=Math.floor(+v||0);return isFinite(v)&&v>0?v:0;}
Z4.field('z4h',{def:{},
merge:function(m,c){c=c||{};N.forEach(function(k){if(k==='rg'){m.rg=I(m.rg)||I(c.rg);return;}m[k]=Math.max(I(m[k]),I(c[k]));});
var a=m.ra&&typeof m.ra==='object'?m.ra:{},b=c.ra&&typeof c.ra==='object'?c.ra:{};for(var q in b)if(!a[q])a[q]=b[q];m.ra=a;},
fix:function(z){N.forEach(function(k){z[k]=I(z[k]);});var r=z.ra&&typeof z.ra==='object'?z.ra:{},o={},n=0;
for(var q in r)if(/^[a-z0-9]{1,8}$/.test(q)&&(r[q]===1||r[q]===2)&&n++<40)o[q]=r[q];z.ra=o;
for(var j in z)if(N.indexOf(j)<0&&j!=='ra')delete z[j];}});
var ON=Z4.reg('z4h',{t:'Зина 4.0: двор на связи (чат дома, холодильник, испорченный телефон, как у вас называют, свёрток под дверью)',who:'CHAT'});
if(ON)Z3.late('js/zb4-chat-x.js',{day:4});
})();
