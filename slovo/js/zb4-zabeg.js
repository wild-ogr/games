'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var N=['pb','pn','tp','tc','kd','ki','kp'];
function fx(z){N.forEach(function(k){var v=Math.floor(+z[k]||0);z[k]=v>0?v:0;});z.ki=Math.min(5,z.ki);z.ks=String(z.ks||'').replace(/[^gy]/g,'').slice(0,z.ki);
for(var k in z)if(k!=='ks'&&N.indexOf(k)<0)delete z[k];}
Z.field('z4q',{def:{ks:''},fix:fx,
merge:function(m,c){fx(m);c=c||{};fx(c);['pb','pn','tp','tc'].forEach(function(k){m[k]=Math.max(m[k],c[k]);});
if(c.kd>m.kd||(c.kd===m.kd&&c.ki>m.ki)){m.kd=c.kd;m.ki=c.ki;m.ks=c.ks;m.kp=c.kp;}}});
if(!Z.reg('z4q',{t:'Зина 4.0: забеги на пройденных',who:'ZABEG'}))return;
var F={port:'Портфель четверти',tetr:'Бесконечная тетрадь',kontr:'Контрольная дня'},O={};
for(var k in F){O[k]=Z.reg('z4q.'+k,{t:'Забеги: '+F[k],who:'ZABEG'});Z.OPEN['z4q.'+k]=8;}
Z.ZAB={on:O,LV:30};
Z3.late('js/zb4-zabeg-s.js',{day:8});
})();
