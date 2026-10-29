'use strict';
(function(){
if(typeof ZB==='undefined'||typeof ZB2==='undefined'||typeof S==='undefined')return;
var ON=ZB2.reg('wordday',{t:'Слово дня: карточка на Доме и дело дня',who:'MGW'});
if(['zagadala','muha','minutka'].every(function(id){return ZB2.off(id);}))return;
var E0=Date.UTC(2026,0,5);
function ev(p,n){n=n||'wd';try{if(window.STATZB&&STATZB.z2)STATZB.z2(n,p);else STAT.ev(n,p);}catch(e){}}
function tk(){return typeof todayKey==='function'?+todayKey():20261012;}
function dn(k){k=k||tk();return Math.round((Date.UTC(Math.floor(k/1e4),Math.floor(k/100)%100-1,k%100)-E0)/864e5);}
function num(x){x=+x;return isFinite(x)&&x>0?Math.floor(x):0;}
var K=['d','r','b','l','md','mr','mb','ml','bg','hd','sh','n','ss'];
ZB2.field('z2w',{def:{d:0,r:0,b:0,l:0,md:0,mr:0,mb:0,ml:0,bg:0,hd:0,sh:0,n:0,ss:0},
fix:function(z){K.forEach(function(k){z[k]=num(z[k]);});for(var k in z)if(K.indexOf(k)<0)delete z[k];},
merge:function(m,c){if(!c||typeof c!=='object')return;
[['d','r','l'],['md','mr','ml']].forEach(function(p){var a=Math.max(num(m[p[0]]),num(m[p[2]])),b=Math.max(num(c[p[0]]),num(c[p[2]]));
if(b>a||(b===a&&num(c[p[1]])>num(m[p[1]]))){m[p[0]]=num(c[p[0]]);m[p[1]]=num(c[p[1]]);m[p[2]]=num(c[p[2]]);}});
['b','mb','hd','sh','n','ss'].forEach(function(k){m[k]=Math.max(num(m[k]),num(c[k]));});m.bg=num(m.bg)|num(c.bg);}});
function Z(){return S.z2w||(S.z2w={d:0,r:0,b:0,l:0,md:0,mr:0,mb:0,ml:0,bg:0,hd:0,sh:0,n:0,ss:0});}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
var P={zagadala:['d','r','b','l'],muha:['md','mr','mb','ml']};
function cur(id){var z=Z(),p=P[id]||P.zagadala,d=z[p[0]],r=z[p[1]],l=z[p[3]];if(!d||!r)return 0;var t=dn(),g=t-dn(d);
if(l&&dn(l)>dn(d))return 0;if(g<=1)return r;if(g===2&&z.sh!==Math.floor(t/7))return r;return 0;}
function st(){var m=S.zmg&&S.zmg.m&&S.zmg.m.zagadala,t=tk(),sun=new Date(typeof nowMs==='function'?nowMs():Date.now()).getDay()===0;
var o={k:t,g:[],e:0,L:sun?6:5};if(m&&+m.k===t){o.g=String(m.g||'').split(',').filter(Boolean);o.e=+m.e||0;}return o;}
function muhaDone(){var z=Z();return z.md===tk()||z.ml===tk();}
function hoursLeft(){var n=new Date(typeof nowMs==='function'?nowMs():Date.now());return Math.max(1,24-n.getHours()-(n.getMinutes()>30?1:0));}
var W=window.ZBWD=window.ZB2WD={wins:function(){return Z().n;},day:dn,tk:tk,st:st,cur:cur,hoursLeft:hoursLeft,muhaDone:muhaDone,Z:Z,P:P,ev:ev,sv:sv,
x:function(){return W.win?Promise.resolve(W):ZB.load('js/zb2-wordday-x.js').then(function(){return W;});}};
function open(id,m){if(!window.ZMG||!ZMG.open)return;ZMG.open(id,{mode:m||'home',back:function(){ZB.safe('wd-ref',function(){ZB.refresh();});}});}
W.open=open;
W.on=ON;
if(ON)ZB.on('ready',function(){setTimeout(function(){W.x().then(function(){ZB.safe('wd-ref',function(){ZB.refresh();});},function(){});},1200);});
})();
