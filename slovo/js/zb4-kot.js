'use strict';
(function(){
if(!window.Z4||!Z4.on||typeof ZB==='undefined'||typeof S==='undefined')return;
if(!Z4.reg('z4k',{t:'Зина 4.0: «Ять — главный» — кот в уровне, тетрадка, побег, санаторий',who:'KOT'}))return;
var F={};[['vor','Ять ворует буквы из круга (событие в уровне)'],['kr','Ять садится на клетку кроссворда (событие в уровне)'],
['tet','Тетрадка Ятя: проверь красной ручкой (карточка Дома)'],['beg','Ять в бегах: «видели…», молоко по возвращении'],
['san','Зина в санатории — неделю ведёт кот (раз в сезон, с 8-го дня)']].forEach(function(x){F[x[0]]=Z4.reg('z4k.'+x[0],{t:x[1],who:'KOT'});});
Z4.OPEN['z4k.san']=8;
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var K=['vl','kl','vn','kn','lp','tq','td','tn','tg','bm'],DEF={};K.forEach(function(k){DEF[k]=0;});
Z4.field('z4k',{def:JSON.parse(JSON.stringify(DEF)),
fix:function(z){K.forEach(function(k){z[k]=n(z[k]);});for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;K.forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});}});
window.Z4K={F:F,DEF:DEF,n:n};
Z3.late('js/zb4-kot-s.js',{day:4});
})();
