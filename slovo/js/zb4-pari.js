'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||typeof ZB==='undefined')return;
var ON=Z.reg('z4p',{t:'Зина 4.0: пари, ставки, пятёрки, контрольная завуча, правило недели',who:'PARI'});
var F={moy:'Пари с моим: 3 маленькие цели по ходу уровня',st:'Ставка на уровень (монеты игры, ×3)',s5:'Пятёрки подряд: уровни без подсказок',
ctl:'Контрольная завуча (каждый 20-й уровень с 40-го)',wk:'Правило недели (очки ✦, в «Вечёрке»)'};
var O={};for(var k in F)O[k]=Z.reg('z4p.'+k,{t:'Пари: '+F[k],who:'PARI'});
var MX=['sb','gp','pn','pw','pa','sw','kl','km','kf','wa'],NW=['s','op','kr'],ALL=MX.concat(NW,['sd','sn']);
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var DEF={};ALL.forEach(function(x){DEF[x]=0;});
Z.field('z4p',{def:JSON.parse(JSON.stringify(DEF)),
merge:function(m,c,newer){if(!c||typeof c!=='object')return;MX.forEach(function(x){m[x]=Math.max(n(m[x]),n(c[x]));});
if(newer)NW.forEach(function(x){m[x]=n(c[x]);});
if(n(c.sd)>n(m.sd)){m.sd=n(c.sd);m.sn=n(c.sn);}else if(n(c.sd)===n(m.sd))m.sn=Math.max(n(m.sn),n(c.sn));
m.sb=Math.max(n(m.sb),n(m.s));},
fix:function(z){ALL.forEach(function(x){z[x]=n(z[x]);});for(var k in z)if(!(k in DEF))delete z[k];if(z.op>1)z.op=1;if(z.kr>1)z.kr=1;}});
if(!ON)return;
Z.PARI={on:O,DEF:DEF,n:n};
Z.OPEN.z4p=4;
Z3.late('js/zb4-pari-s.js',{day:4});
})();
