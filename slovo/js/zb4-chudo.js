'use strict';
(function(){
if(!window.Z4||!Z4.on||typeof ZB==='undefined'||typeof S==='undefined')return;
if(!Z4.reg('z4u',{t:'Зина 4.0: «Зина чудит» — особые дни и атмосфера',who:'CHUDO'}))return;
var F={},L=[['apr','1 апреля: двор вверх ногами, «Утренняя», письмо от Ятя'],['night','Ночная смена 0–5: торшер, шёпот, буквы-мотыльки'],
['kuz','Домовой Кузьма: записки и блюдце'],['det','Кто съел пирожки: улики в главе и дело дня в газете'],['hor','Бабушкин гороскоп по букве дня'],
['utro','Утро с Зиной 7–10: зарядка, погода, совет'],['tv','Телевизор соседей: бегущая строка с ошибками']];
L.forEach(function(x){F[x[0]]=Z4.reg('z4u.'+x[0],{t:x[1],who:'CHUDO'});});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var NK=['k','af','kv','kn','kp','kd','kg','kc','dc','dl','dp','dv','dr','dm','ds','um','ub','tn','td','tc','hd'];
var DEF={};NK.forEach(function(k){DEF[k]=0;});DEF.ks='';
Z4.field('z4u',{def:JSON.parse(JSON.stringify(DEF)),
fix:function(z){NK.forEach(function(k){z[k]=n(z[k]);});z.ks=typeof z.ks==='string'?z.ks.slice(0,12):'';for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
['k','af','kv','kn','kg','kc','dv','dr','dm','ds','um','tn','td','hd'].forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]));});
if(n(c.dc)>n(m.dc)){m.dc=n(c.dc);m.dl=n(c.dl);}else if(n(c.dc)===n(m.dc))m.dl=n(m.dl)|n(c.dl);
m.dp=Math.max(n(m.dp),n(c.dp));if(m.dp&&m.dv>=m.dp)m.dp=0;
if(n(c.kd)>n(m.kd)){m.kd=n(c.kd);m.ks=typeof c.ks==='string'?c.ks.slice(0,12):'';}
if(n(c.td)>=n(m.td))m.tc=Math.max(n(m.tc),n(c.tc));
if(n(c.um)>n(m.um))m.ub=n(c.ub);else if(n(c.um)===n(m.um)&&n(c.ub))m.ub=m.ub?Math.min(n(m.ub),n(c.ub)):n(c.ub);
m.kp=0;}});
window.Z4U={F:F,DEF:DEF,n:n};
Z3.late('js/zb4-chudo-s.js',{day:4});
})();
