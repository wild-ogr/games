'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4w',{t:'Зина 4.0: телешоу у Зины (табло, барабан, лото, квартирник)',who:'SHOW'});if(!ON)return;
var N=['m','p','pl','k','d','ls','n','bs','bp','bl','bk','pz','pt','vl','vol'];
function num(v){v=Math.floor(+v||0);return v>0?v:0;}
Z.field('z4w',{def:{m:0,p:0,pl:0,k:0,d:0,ls:0,n:0,bs:0,bp:0,bl:0,bk:0,pz:0,pt:0,vl:0,vol:2,lw:null},
merge:function(a,c){
if(num(c.m)>num(a.m)){a.m=num(c.m);a.p=num(c.p);a.pl=num(c.pl);}else if(num(c.m)===num(a.m)){a.p=Math.max(num(a.p),num(c.p));a.pl=Math.max(num(a.pl),num(c.pl));}
if(num(c.k)>num(a.k)){a.k=num(c.k);a.d=num(c.d);a.ls=num(c.ls);}else if(num(c.k)===num(a.k)){a.d=num(a.d)|num(c.d);a.ls=Math.max(num(a.ls),num(c.ls));}
['n','bs','bp','bl','bk','vl','pz','pt'].forEach(function(k){a[k]=Math.max(num(a[k]),num(c[k]));});
if(c.lw&&typeof c.lw==='object'&&(!a.lw||num(c.lw.k)>num(a.lw.k)))a.lw={i:num(c.lw.i),w:String(c.lw.w||'').slice(0,12),k:num(c.lw.k)};},
fix:function(z){N.forEach(function(k){z[k]=num(z[k]);});if(z.vol>2)z.vol=2;z.d&=63;
if(z.lw&&(typeof z.lw!=='object'||typeof z.lw.w!=='string'))z.lw=null;else if(z.lw)z.lw={i:num(z.lw.i),w:z.lw.w.slice(0,12),k:num(z.lw.k)};}});
Z.OPEN.z4w=8;
Z3.late('js/zb4-show-s.js',{day:4});
})();
