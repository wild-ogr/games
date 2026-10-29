'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4e',{t:'Зина 4.0: происшествия в уровне (сверлят, лифт, звонок Гали, сквозняк, чайник, развилка)',who:'SOBYT'});
var F={drill:'Сосед сверлит: буквы дрожат 30 с, слова ×2 «за терпение»',lift:'Застряли в лифте с соседом: 3 минуты, сосед подсказывает',
galya:'Звонок Гали: собери слово из 5 букв за 15 с (ОК 25 с)',draft:'Сквозняк: две буквы круга другие на 30 с, новые слова ×2',
kettle:'Чайник засвистел: следующее слово за 20 с — чай с пирожком',fork:'Развилка: выбор события следующего уровня (Тёмный ×2 / Галя / Спокойный)'};
var O={};for(var k in F)O[k]=Z.reg('z4e.'+k,{t:'Происшествие: '+F[k],who:'SOBYT'});
function n(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
Z.field('z4e',{def:{l:{},ld:0,f:{lv:0,id:''},n:0},
merge:function(m,c){if(!c||typeof c!=='object')return;m.l=m.l||{};var L=c.l||{};for(var k in L)m.l[k]=Math.max(n(m.l[k]),n(L[k]));
m.ld=Math.max(n(m.ld),n(c.ld));m.n=Math.max(n(m.n),n(c.n));if(c.f&&n(c.f.lv)>n(m.f&&m.f.lv))m.f={lv:n(c.f.lv),id:String(c.f.id||'').slice(0,8)};},
fix:function(z){var L=z.l&&typeof z.l==='object'?z.l:{},o={};for(var k in F)if(L[k])o[k]=n(L[k]);if(L.dark)o.dark=n(L.dark);z.l=o;
z.ld=n(z.ld);z.n=n(z.n);var f=z.f&&typeof z.f==='object'?z.f:{};z.f={lv:n(f.lv),id:/^(dark|galya|-)$/.test(f.id)?f.id:''};
for(var x in z)if(!/^(l|ld|f|n)$/.test(x))delete z[x];}});
if(!ON)return;
Z.SOBYT={on:O};
Z.OPEN.z4e=4;
Z3.late('js/zb4-sobyt-s.js',{day:4});
})();
