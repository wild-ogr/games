'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var N=['td','tn','sc','sn','bd','bn','kb','kn','kd','kc'];
function n(x){x=Math.floor(+x||0);return x>0?x:0;}
function fx(z){N.forEach(function(k){z[k]=n(z[k]);});for(var k in z)if(N.indexOf(k)<0)delete z[k];}
Z.field('z4i',{def:{},
merge:function(m,c){fx(m);c=c||{};fx(c);
if(c.kd>m.kd){m.kd=c.kd;m.kc=c.kc;}else if(c.kd===m.kd)m.kc=Math.max(m.kc,c.kc);
['td','tn','sc','sn','bd','bn','kb','kn'].forEach(function(k){m[k]=Math.max(m[k],c[k]);});},
fix:fx});
if(!Z.reg('z4i',{t:'Зина 4.0: новые виды уровня (две тетради, мешок букв, половинки, чашка чая)',who:'IGRY'}))return;
var F={two:'«Две тетради»: два кроссворда на одном круге',bag:'«Мешок букв»: живое колесо без кроссворда',
slog:'«Слово-половинки»: круг из слогов (раз в главу)',big:'«Чашка чая»: крупный короткий уровень'},O={};
for(var k in F)O[k]=Z.reg('z4i.'+k,{t:'Виды уровня: '+F[k],who:'IGRY'});
Z.IGR={on:O};
Z.OPEN['z4i.two']=8;Z.OPEN['z4i.bag']=8;Z.OPEN['z4i.big']=8;Z.OPEN['z4i.slog']=8;
Z3.late('js/zb4-igry-s.js',{day:4});
})();
