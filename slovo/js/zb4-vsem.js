'use strict';
(function(){
if(!window.Z4||!window.Z3||typeof ZB==='undefined')return;
var L={y:6,h:4,c:4,e:4,t:4,q:2};
function A(a,n){var r=[];for(var i=0;i<n;i++){var x=a&&+a[i];r.push(isFinite(x)&&x>0?Math.floor(x):0);}return r;}
Z4.field('z4v',{def:{},
merge:function(m,c){for(var k in L){var a=A(m[k],L[k]),b=A(c&&c[k],L[k]);if(b[0]>a[0])a=b;else if(b[0]===a[0])for(var i=1;i<a.length;i++)a[i]=Math.max(a[i],b[i]);m[k]=a;}},
fix:function(z){for(var k in L)z[k]=A(z[k],L[k]);for(var j in z)if(!L[j])delete z[j];}});
var ON=Z4.reg('z4v',{t:'Зина 4.0: события дома для всех (буква пропала, Час Зины, цвет подъезда, выборы, мужья и жёны)',who:'VSEM'});
if(ON)Z3.late('js/zb4-vsem-x.js',{day:4});
})();
