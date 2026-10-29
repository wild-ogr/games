'use strict';
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined'||!window.Z3||!Z3.on)return;
var ON=Z3.reg('paper',{t:'Газета «Вечёрка у Зины»: доска у подъезда, номер, вечерний выпуск',who:'PAPER'});
var RON=Z3.reg('z3rub',{t:'Рубрики газеты в реестре Z3.rub (Филворд, Вышивка, Барабан, Сканворд, Зина загадала, Связи, Шифровка, Ручка)',who:'PAPER'});
if(!ON&&!RON)return;
function num(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var NK=['k','o','s','w','rc','q','n','d1','d','r','b','t','qn','vo','gp','gm','e','ec','eg','pe','pc','pg'];
var DEF={k:0,o:0,s:0,w:0,rc:0,q:0,n:0,d1:0,d:0,r:0,b:0,t:0,qn:0,vf:'',vo:0,gp:0,gm:0,e:0,ec:0,eg:0,pe:0,pc:0,pg:0,ar:{d:0,c:0}};
Z3.field('z3p',{def:JSON.parse(JSON.stringify(DEF)),
fix:function(z){NK.forEach(function(k){z[k]=num(z[k]);});z.vf=typeof z.vf==='string'?z.vf.slice(0,24):'';
if(!z.ar||typeof z.ar!=='object')z.ar={d:0,c:0};z.ar={d:num(z.ar.d),c:num(z.ar.c)};
for(var k in z)if(!(k in DEF))delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
if(num(c.k)>num(m.k)){['k','o','s','w','rc','q'].forEach(function(k){m[k]=num(c[k]);});}
else if(num(c.k)===num(m.k)){m.o|=num(c.o);m.s|=num(c.s);m.w|=num(c.w);m.rc=Math.max(num(m.rc),num(c.rc));m.q=Math.max(num(m.q),num(c.q));}
if(num(c.d)>num(m.d)||(num(c.d)===num(m.d)&&num(c.r)>num(m.r))){m.d=num(c.d);m.r=num(c.r);}
['n','b','t','qn','gp','gm'].forEach(function(k){m[k]=Math.max(num(m[k]),num(c[k]));});
if(num(c.d1)&&(!num(m.d1)||num(c.d1)<num(m.d1)))m.d1=num(c.d1);
if(c.vf&&typeof c.vf==='string'&&(!m.vf||c.vf>m.vf)){m.vf=c.vf;m.vo=num(c.vo);}
if(c.ar&&num(c.ar.d)>num(m.ar&&m.ar.d))m.ar={d:num(c.ar.d),c:num(c.ar.c)};
[['e','ec','eg'],['pe','pc','pg']].forEach(function(K){var a=num(c[K[0]]),b=num(m[K[0]]);
if(a&&a===b){m[K[1]]=Math.max(num(m[K[1]]),num(c[K[1]]));m[K[2]]=num(m[K[2]])|num(c[K[2]]);}
else if(a>b){if(K[0]==='e'&&b&&b>num(m.pe)){m.pe=b;m.pc=num(m.ec);m.pg=num(m.eg);}m[K[0]]=a;m[K[1]]=num(c[K[1]]);m[K[2]]=num(c[K[2]]);}});}});
var X='js/zb3-paper-s.js',P=window.Z3PAPER={ON:ON,RON:RON,DEF:DEF};
function L(k,d){return typeof P[k]==='function'?P[k]():d;}
if(ON)Z3.yardAdd({id:'paper',order:20,t:'Вечёрка',ic:'📰',stub:function(){return false;},
go:function(){Z3.need(X).then(function(){P.go();},function(){});},badge:function(){return L('badge','');},note:function(){return L('note','свежий номер');},hot:function(){return L('hot',false);}});
Z3.late(X,{day:2});
})();
