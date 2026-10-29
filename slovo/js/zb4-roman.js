'use strict';
(function(){
if(!window.Z4||!Z4.on||typeof S==='undefined')return;
var R={sem:'Дед Семён влюбился: записки с ошибками, финал — голос двора',gal:'Галя хвастается внучкой Леночкой (строка победы)',call:'Зина звонит раз в неделю (рисованный звонок, карточка Дома)',
cur:'Курьер перепутал посылку Валентины Петровны',blog:'Зина-блогер: пост Валерки и комментарии соседей',wed:'Свадьба Ятя — финал сезона 2',pet:'Петрович заходил (встречные строки гостя из Рыбалки)'};
if(!Z4.reg('z4n',{t:'ROMAN: сериал двора, герои живут',who:'ROMAN'}))return;
for(var k in R)Z4.reg('z4n.'+k,{t:R[k],who:'ROMAN'});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var NK=['d','lt','gb','gx','sc','sn','sd','vc','vo','rs','cw','pd','ps','bd','bl','bn','gw','ww','pt','cd','cc'],DEF={pw:'',wg:''};NK.forEach(function(k){DEF[k]=0;});
var G=[['d','lt','gb','gx'],['sc','sn','sd'],['vc','vo'],['pd','ps','pw'],['gw','wg'],['cd','cc']];
Z4.field('z4n',{def:DEF,
fix:function(z){NK.forEach(function(k){z[k]=n(z[k]);});z.pw=typeof z.pw==='string'?z.pw.slice(0,16):'';z.wg=typeof z.wg==='string'?z.wg.slice(0,160):'';for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
G.forEach(function(g){var a=n(m[g[0]]),b=n(c[g[0]]);if(b>a)g.forEach(function(k){m[k]=c[k];});
else if(a===b)g.slice(1).forEach(function(k){if(k==='wg'){var u=[];(String(m.wg||'')+','+String(c.wg||'')).split(',').forEach(function(x){if(x&&u.indexOf(x)<0)u.push(x);});m.wg=u.slice(0,10).join(',');}
else if(k==='pw'){if(!m.pw)m.pw=c.pw||'';}else m[k]=Math.max(n(m[k]),n(c[k]));});});
['rs','cw','bd','bl','bn','ww','pt'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});}});
Z3.late('js/zb4-roman-s.js',{day:4});
})();
