'use strict';
(function(){
if(!window.Z4||!Z4.on||typeof S==='undefined')return;
var R={vn:'Внук Тёма: бабушкин переводчик (сленг → русское слово из букв)',mem:'Мемуары Зины из твоих редких слов',so:'Сочинение и «чепуха» из слов уровня',
nm:'Как Зине тебя звать (одно имя на всю игру)',fut:'Письмо себе в будущее (вручит через 30 дней)'};
if(!Z4.reg('z4m',{t:'SOCH: твои слова — в текст',who:'SOCH'}))return;
for(var k in R)Z4.reg('z4m.'+k,{t:R[k],who:'SOCH'});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
function s(x,m){return typeof x==='string'?x.slice(0,m):'';}
var NK=['nq','nn','vd','vk','vn','mc','md','mv','sn','fs','ft','fg','fl','fw','cd','cc'],DEF={mw:'',fp:''};NK.forEach(function(k){DEF[k]=0;});
function uni(a,b,m){var u=[];(s(a,400)+','+s(b,400)).split(',').forEach(function(x){if(x&&u.indexOf(x)<0)u.push(x);});return u.slice(0,m).join(',');}
Z4.field('z4m',{def:DEF,
fix:function(z){NK.forEach(function(k){z[k]=n(z[k]);});z.mw=s(z.mw,400);z.fp=s(z.fp,20);for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
['nq','nn','vd','vk','vn','md','mv','sn','fw'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});
if(n(c.nq)===1||n(m.nq)===1)m.nq=1;
m.mw=uni(m.mw,c.mw,30);m.mc=Math.max(n(m.mc),n(c.mc),m.mw?m.mw.split(',').length:0);
if(n(c.ft)>n(m.ft)){['fs','ft','fg','fl','fw'].forEach(function(k){m[k]=n(c[k]);});m.fp=s(c.fp,20);}
else if(n(c.ft)===n(m.ft))m.fs=Math.max(n(m.fs),n(c.fs));
if(n(c.cd)>n(m.cd)){m.cd=n(c.cd);m.cc=n(c.cc);}else if(n(c.cd)===n(m.cd))m.cc=Math.max(n(m.cc),n(c.cc));}});
Z4.OPEN['z4m']=4;
Z3.late('js/zb4-soch-s.js',{day:4});
})();
