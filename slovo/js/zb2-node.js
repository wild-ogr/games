'use strict';
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined')return;
var ON_NODE=ZB2.reg('node',{t:'5-й уровень десятки = мини-игра',who:'MGR',on:true}),ON_AUTO=ZB2.reg('autonajdi',{t:'«Найди Ять» сама после главы',who:'MGR',on:true});
var DEF={r:0,k:0,ni:-1,ng:'',sk:-1,a:0,ad:0,nq:0,nn:0,nf:0};
ZB2.field('z2g',{def:DEF,
fix:function(o){['r','k','a','ad','nq','nn','nf'].forEach(function(k){o[k]=Math.max(0,(+o[k]|0)||0);});o.k=o.k?1:0;
['ni','sk'].forEach(function(k){o[k]=(+o[k]|0)||0;if(o[k]<-1)o[k]=-1;});o.ng=typeof o.ng==='string'?o.ng.slice(0,16):'';
Object.keys(o).forEach(function(k){if(!(k in DEF))delete o[k];});},
merge:function(a,b,newer){['r','a','ad','nq','nn','nf'].forEach(function(k){a[k]=Math.max(+a[k]||0,+b[k]||0);});
if(newer){a.k=b.k?1:0;a.ni=+b.ni|0;a.ng=typeof b.ng==='string'?b.ng:'';a.sk=+b.sk|0;}}});
function Z(){if(!S.z2g||typeof S.z2g!=='object')S.z2g=JSON.parse(JSON.stringify(DEF));return S.z2g;}
ZB.on('ready',function(){if(ON_NODE||ON_AUTO)ZB.load('js/zb2-node-x.js').catch(function(){});});
})();
