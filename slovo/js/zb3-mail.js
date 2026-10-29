'use strict';
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined'||!window.Z3||!Z3.on)return;
var ON=Z3.reg('z3m',{t:'Почта бабы Зины: письма Зины, ответы, кроссворд в подарок',who:'MAIL'});
if(!ON)return;
function num(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var NK=['v','d','m','c','f','k','sb','w','wn','n','p','g','fr','nb','nn'],DEF={v:0,d:0,m:0,c:0,h:'',f:0,k:0,sb:0,w:0,wn:0,n:0,nm:'',p:0,g:0,gr:'',fr:0,nb:0,nn:0};
function str(x,n){return typeof x==='string'?x.slice(0,n):'';}
Z3.field('z3m',{def:JSON.parse(JSON.stringify(DEF)),
fix:function(z){NK.forEach(function(k){z[k]=num(z[k]);});z.h=str(z.h,40);z.nm=str(z.nm,20);z.gr=str(z.gr,80);for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
['v','d','m','c','f','sb','n','p','g','fr','nb','nn'].forEach(function(k){m[k]=Math.max(num(m[k]),num(c[k]));});
if(num(c.w)>num(m.w)){m.w=num(c.w);m.wn=num(c.wn);}else if(num(c.w)===num(m.w))m.wn=Math.max(num(m.wn),num(c.wn));
if(num(c.v)>=num(m.v))m.k=num(c.k);
var hh=(str(m.h,40)+','+str(c.h,40)).split(','),hu=[];hh.forEach(function(x){if(x&&hu.indexOf(x)<0)hu.push(x);});m.h=hu.slice(-3).join(',');if(!m.nm&&c.nm)m.nm=str(c.nm,20);
var a=(str(m.gr,80)+','+str(c.gr,80)).split(','),u=[];a.forEach(function(x){if(x&&u.indexOf(x)<0)u.push(x);});m.gr=u.slice(-6).join(',');}});
var X='js/zb3-mail-s.js',M=window.Z3MAIL={ON:ON,DEF:DEF,num:num,str:str};
function L(k,d){return typeof M[k]==='function'?M[k]():d;}
Z3.yardAdd({id:'mail',order:40,t:'Почта',ic:'✉️',stub:function(){return false;},
note:function(){return L('ynote','письма Зины');},badge:function(){return L('ybadge','');},hot:function(){return L('yhot',false);},
go:function(){Z3.need(X).then(function(){if(M.ygo)M.ygo();},function(){});}});
Z3.late(X,{day:1});
})();
