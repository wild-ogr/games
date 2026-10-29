'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||typeof ZB==='undefined'||typeof S==='undefined')return;
if(!Z.reg('z4r',{t:'Зина 4.0: «Сто к одному» — слова соседей',who:'STO'}))return;
var F={},L=[['sto','M35 «Сто к одному»: у слова — сколько соседей его нашли'],['yat','M31 Ять-слова: редкость бонусных слов, гербарий в комоде'],
['pod','M30 Подсказка от подъезда (застрял — буква слова, с которого начинали соседи)'],['mut','B47 Слово-мутант (золотое, в валенках, в кокошнике)'],
['spor','B19 Великий спор: как правильно? (вопрос дня, дом голосует)'],['err','B38 Зина ошиблась! Красная ручка на Зину']];
L.forEach(function(x){F[x[0]]=Z.reg('z4r.'+x[0],{t:x[1],who:'STO'});});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
function arr(a,k){var o=[];for(var i=0;i<k;i++)o.push(n(a&&a[i]));return o;}
var NK=['sd','sr','sn','zd','zn','hu'];
Z.field('z4r',{def:{h:[0,0,0,0],m:[0,0,0,0],sd:0,so:-1,sr:0,sn:0,zd:0,zn:0,hu:0},
fix:function(z){z.h=arr(z.h,4);z.m=arr(z.m,4);NK.forEach(function(k){z[k]=n(z[k]);});z.so=(+z.so>=0&&+z.so<=3)?Math.floor(+z.so):-1;
for(var k in z)if(!/^(h|m|so|sd|sr|sn|zd|zn|hu)$/.test(k))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
['h','m'].forEach(function(k){var a=arr(m[k],4),b=arr(c[k],4);m[k]=a.map(function(x,i){return Math.max(x,b[i]);});});
['sr','sn','zd','zn','hu'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});
if(n(c.sd)>n(m.sd)){m.sd=n(c.sd);m.so=(+c.so>=0&&+c.so<=3)?Math.floor(+c.so):-1;}}});
Z.OPEN.z4r=4;
window.Z4R={F:F,n:n};
Z3.late('js/zb4-sto-s.js',{day:4});
})();
