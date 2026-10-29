'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on)return;
var ON=Z.reg('z4t',{t:'Зина 4.0: темп и доступность',who:'TEMP'});
var F={cloud:'облако VK после победы',mix7:'смешанные уровни 1 из 7, без долгих рубрик',cell:'рубрика — клетка уровня',urok:'«Урок окончен» и домашка',
pace:'Зина подстраивается под темп',mic:'«Скажи слово вслух» (🎤, выкл. по умолчанию)'};
var O={};for(var k in F)O[k]=Z.reg('z4t.'+k,{t:'Темп: '+F[k],who:'TEMP'});
function n(x){x=Math.floor(+x||0);return x>0?x:0;}
Z.field('z4t',{def:{p:0,h:[],c:[0,''],d:0,n:0,u:0,k:0},
merge:function(m,c,cn){var h=(m.h||[]).slice();(c.h||[]).forEach(function(x){if(!h.some(function(y){return y[0]===x[0];}))h.push(x);});
m.h=h.sort(function(a,b){return b[0]-a[0];}).slice(0,3);if(cn&&c.p)m.p=n(c.p);
if(n(c.c&&c.c[0])>n(m.c&&m.c[0]))m.c=c.c;if(n(c.d)>n(m.d)){m.d=n(c.d);m.n=n(c.n);}else if(n(c.d)===n(m.d))m.n=Math.max(n(m.n),n(c.n));
m.u=Math.max(n(m.u),n(c.u));m.k=Math.max(n(m.k),n(c.k));},
fix:function(z){['p','d','n','u','k'].forEach(function(k){z[k]=n(z[k]);});z.p=Math.min(z.p,3000);
z.h=(z.h instanceof Array?z.h:[]).filter(function(x){return x instanceof Array&&x.length===3&&n(x[0])&&typeof x[1]==='string'&&typeof x[2]==='string';})
.map(function(x){return[n(x[0]),x[1].slice(0,80),x[2].slice(0,12)];}).slice(0,3);
if(!(z.c instanceof Array)||z.c.length!==2)z.c=[0,''];z.c=[n(z.c[0]),String(z.c[1]||'').slice(0,4)];}});
if(!ON)return;
Z.TEMP={on:O};
Z.OPEN['z4t.mic']=4;
if(O.cloud)Z.onWin(function(){if(typeof PLAT!=='undefined'&&PLAT==='vk'&&typeof cloudSoon==='function')cloudSoon(3000);});
Z3.late('js/zb4-temp-s.js',{day:4});
})();
