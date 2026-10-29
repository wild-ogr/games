'use strict';
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||!window.Z3||typeof S==='undefined')return;
var Z3=window.Z3,X='js/zb3-kitchen-s.js';
var MIX=Z3.reg('zmix',{t:'Смешанные уровни: рубрики газеты каждый 3–4-й уровень после 60-го',who:'CORE'});
var K=window.Z3K={MIX_FROM:60,PRE4:1940,mix:MIX,onHard:[],q:[],
x:function(){return K.ui?Promise.resolve(K):Z3.need(X).then(function(){return ZB.load('js/zb3-kitchen-x.js');}).then(function(){return K;});}};
K.on={hard:Z3.reg('zhard',{t:'Трудный уровень: место для кнопки KIOSK «Ять откроет слово»',who:'CORE'})};
if(!Z3.on)return;
var Z4_N=520,Z4_V="d15205cf";
K.Z4_N=Z4_N;K.Z4_V=Z4_V;
function num(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
Z3.field('z3k',{def:{m:0,r:{},c:0,s:0,f:0,t:0,q:0,n:0,z:0},
fix:function(z){['m','c','s','f','t','q','n','z'].forEach(function(k){z[k]=num(z[k]);});if(!z.r||typeof z.r!=='object'||Array.isArray(z.r))z.r={};
Object.keys(z.r).forEach(function(k){var a=z.r[k];if(!Array.isArray(a)||a.length!==3)delete z.r[k];else z.r[k]=a.map(num);});
var ks=Object.keys(z.r);if(ks.length>24)ks.slice(24).forEach(function(k){delete z.r[k];});},
merge:function(m,c){if(!c||typeof c!=='object')return;m.m=Math.max(num(m.m),num(c.m));m.n=Math.max(num(m.n),num(c.n));m.t=Math.max(num(m.t),num(c.t));
if(num(c.c)>num(m.c)){m.c=num(c.c);m.s=num(c.s);m.f=num(c.f);}else if(num(c.c)===num(m.c)){m.s=Math.max(num(m.s),num(c.s));m.f=Math.max(num(m.f),num(c.f));}
if(c.r&&typeof c.r==='object')Object.keys(c.r).forEach(function(k){var a=c.r[k],b=m.r[k];if(!Array.isArray(a))return;
m.r[k]=Array.isArray(b)?[0,1,2].map(function(i){return Math.max(num(a[i]),num(b[i]));}):a.map(num);});}});
ZB.levelHook.push(function(i){if(K.star)return K.star(i);if(i&&i.ok&&i.first&&K.q.length<50)K.q.push({ok:1,first:1,daily:i.daily,mode:i.mode,idx:i.idx,l:i.l,hinted:i.hinted,bonus:i.bonus});});
function wrap(){var f=window.startLevel;if(typeof f!=='function'||f.__z3k)return;
var w=function(idx,daily){var s=this,a=arguments;if(K.sl)return K.sl(w,s,a);
if(!daily&&(+S.lv||0)>=K.MIX_FROM){var g=function(){if(K.sl)K.sl(w,s,a);else f.apply(s,a);};Z3.need(X).then(g,g);return;}
return f.apply(s,a);};
w.__z3k=1;w.__orig=f;window.startLevel=w;}
if(window.ZBNUM)ZBNUM.ilOff=function(){return MIX;};
ZB.on('ready',function(){ZB.safe('z3k-wrap',wrap);if((+S.lv||0)>=K.PRE4)Z3.need(X).catch(function(){});});
Z3.late(X,{day:1});
})();
