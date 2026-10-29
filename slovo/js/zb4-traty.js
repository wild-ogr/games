'use strict';
(function(){
if(!window.Z4||!Z4.on||typeof ZB==='undefined'||typeof S==='undefined')return;
if(!Z4.reg('z4y',{t:'Зина 4.0: траты для красоты — квартира Зины и вещи Ятя',who:'TRATY'}))return;
var F={kv:Z4.reg('z4y.kv',{t:'Квартира Зины: вещи за монеты (герань, самовар, сервант…)',who:'TRATY'}),
yat:Z4.reg('z4y.yat',{t:'Приданое Ятя: вещи коту за монеты (миска, лежанка, домик…)',who:'TRATY'})};
var IDS=['ger','sal','slon','chas','tor','sam','rad','kov','tv','serv','mis','klu','bant','pod','kog','lez','dom'];
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var K=['o','pd','ld','rv'],DEF={o:0,pd:0,ld:0,rv:0};
Z4.field('z4y',{def:{o:0,pd:0,ld:0,rv:0},
fix:function(z){K.forEach(function(k){z[k]=n(z[k]);});z.o&=(1<<IDS.length)-1;for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;m.o=(n(m.o)|n(c.o))&((1<<IDS.length)-1);['pd','ld','rv'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});}});
window.Z4Y={F:F,IDS:IDS,n:n};
Z3.late('js/zb4-traty-s.js',{day:4});
})();
