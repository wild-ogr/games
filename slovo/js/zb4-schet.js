'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4s',{t:'Зина 4.0: счёт уровня (медали, фишки счёта)',who:'SCHET'});
var F={medal:'Буквы-медали (основа счёта уровня)',bank:'Фишка «Банк!»: кон удваивается, промах сжигает кон',last:'Фишка: каждое слово дороже, последнее — золотое',
ladder:'Фишка «Лесенка»: слова по возрастанию длины',chalk:'Фишка «Мел-множитель» ×1–×5',chain:'Фишка «Цепочка слов» (на последнюю букву)',twin:'Фишка «Близнецы» (КОТ—ТОК)'};
var O={};for(var k in F)O[k]=Z.reg('z4s.'+k,{t:'Счёт: '+F[k],who:'SCHET'});
Z.field('z4s',{def:{b:0,n:0,cd:0,cn:0},merge:function(m,c){m.b=Math.max(+m.b||0,+c.b||0);m.n=Math.max(+m.n||0,+c.n||0);
if((+c.cd||0)>(+m.cd||0)){m.cd=+c.cd;m.cn=+c.cn||0;}else if(+c.cd===+m.cd)m.cn=Math.max(+m.cn||0,+c.cn||0);},
fix:function(z){['b','n','cd','cn'].forEach(function(x){z[x]=Math.max(0,Math.floor(+z[x]||0));});}});
if(!ON)return;
Z.SCHET={on:O};
Z.OPEN.z4s=4;
Z3.late('js/zb4-schet-s.js',{day:4});
})();
