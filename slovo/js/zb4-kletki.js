'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4c',{t:'Зина 4.0: клетки и виды кроссворда',who:'KLETKI'});
var F={bag:'«Кот в мешке» — клетка-сюрприз',pie:'«Горячий пирожок» — ×2 за минуту',flip:'«Кроссворд-перевёртыш» — ошибки Валерки',
dark:'«Тёмный кроссворд» — свет отключили',theme:'«Что общего?» — тетрадка Зины',key:'«Ключевое слово» в серых клетках'};
var O={};for(var k in F)O[k]=Z.reg('z4c.'+k,{t:'Клетки: '+F[k],who:'KLETKI'});
Z.field('z4c',{def:{s:'',d:0,n:0,c:[0,0]},
merge:function(m,c){var s=String(m.s||''),t=String(c.s||'');for(var i=0;i<t.length;i++)if(s.indexOf(t[i])<0)s+=t[i];m.s=s;
m.d=Math.max(+m.d||0,+c.d||0);m.n=Math.max(+m.n||0,+c.n||0);
var a=m.c instanceof Array?m.c:[0,0],b=c.c instanceof Array?c.c:[0,0];m.c=(+b[0]||0)>(+a[0]||0)?b:(+b[0]===+a[0]?[+a[0]||0,Math.max(+a[1]||0,+b[1]||0)]:a);},
fix:function(z){z.s=String(z.s||'').replace(/[^a-z]/g,'').slice(0,12);z.d=Math.max(0,Math.floor(+z.d||0));z.n=Math.max(0,Math.floor(+z.n||0));
if(!(z.c instanceof Array)||z.c.length!==2)z.c=[0,0];}});
if(!ON)return;
Z.KLETKI={on:O};
Z.OPEN.z4c=4;Z.OPEN['z4c.flip']=8;Z.OPEN['z4c.dark']=8;
Z3.late('js/zb4-kletki-s.js',{day:4});
})();
