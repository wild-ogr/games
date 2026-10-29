'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.reg('z4l',{t:'Зина 4.0: за одним столом (внук, банка, скрэббл с Галей)',who:'STOL'}))return;
var K=['k','d','n','vb','vv','vd','bb','sw','sl','sb','gs'];
function n(v){v=Math.floor(+v||0);return v>0?v:0;}
Z.field('z4l',{def:{k:0,d:0,n:0,vb:0,vv:0,vd:0,bb:0,sw:0,sl:0,sb:0,gs:0},
merge:function(a,c){if(n(c.k)>n(a.k)){a.k=n(c.k);a.d=n(c.d);}else if(n(c.k)===n(a.k))a.d=n(a.d)|n(c.d);
K.forEach(function(k){if(k!=='k'&&k!=='d'&&k!=='gs')a[k]=Math.max(n(a[k]),n(c[k]));});},
fix:function(z){K.forEach(function(k){z[k]=n(z[k]);});z.d&=7;z.gs=z.gs?1:0;}});
Z.OPEN.z4l=8;
Z3.late('js/zb4-stol-s.js',{day:4});
})();
