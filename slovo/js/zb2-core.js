'use strict';
(function(){
if(typeof window.ZB==='undefined')return;
var ZB=window.ZB,Z=window.ZB2={v:1,_reg:{},_fld:{}},OFF={},MAXF=1500,warned={};
var m=/[?&]off=([^&#]*)/.exec(location.search);
if(m)decodeURIComponent(m[1]).split(',').forEach(function(x){x=x.trim();if(x)OFF[x]=1;});
[].concat(window.ZB2_OFF||[]).forEach(function(x){OFF[x]=1;});
Z.off=function(id){if(OFF.all||OFF[id])return true;var r=Z._reg[id];return!!(r&&r.on===false);};
Z.reg=function(id,o){o=o||{};Z._reg[id]={id:id,t:o.t||id,who:o.who||'',on:o.on!==false};return!Z.off(id);};
Z.flags=function(){return Object.keys(Z._reg).map(function(k){var r=Z._reg[k];return{id:k,t:r.t,who:r.who,on:!Z.off(k)};});};
function copy(v){return v&&typeof v==='object'?JSON.parse(JSON.stringify(v)):v;}
Z.mergeMax=function(a,b,newer){if(!b||typeof b!=='object'||!a||typeof a!=='object')return a;
Object.keys(b).forEach(function(k){var x=a[k],y=b[k];
if(x===undefined)a[k]=copy(y);
else if(typeof x==='number'&&typeof y==='number')a[k]=Math.max(x,y);
else if(x&&y&&typeof x==='object'&&typeof y==='object'&&!Array.isArray(x)&&!Array.isArray(y))Z.mergeMax(x,y,newer);
else if(newer)a[k]=copy(y);});
return a;};
Z.field=function(key,o){o=o||{};
if(!/^z[234][a-z]$/.test(key)){console.error('[zb2] поле должно быть z2<буква>: '+key);return;}
Z._fld[key]=o;
ZB.onSave({id:'zb2-'+key,keys:[key],
fix:function(S){var v=S[key];if(!v||typeof v!=='object'||Array.isArray(v))S[key]=copy(o.def||{});
else if(o.def)Object.keys(o.def).forEach(function(k){if(v[k]===undefined)v[k]=copy(o.def[k]);});
if(o.fix)o.fix(S[key],S);},
merge:function(S,d,newer){var c=d&&d[key];if(!c||typeof c!=='object'||Array.isArray(c))return;
if(!S[key]||typeof S[key]!=='object'){S[key]=copy(c);return;}
if(o.merge)o.merge(S[key],c,!!newer,S);else Z.mergeMax(S[key],c,!!newer);}});};
Z.size=function(){var r={};if(typeof S==='undefined')return r;
Object.keys(Z._fld).forEach(function(k){try{r[k]=S[k]?JSON.stringify(S[k]).length:0;}catch(e){r[k]=-1;}});return r;};
Z._last=0;
function chk(){var t=Date.now();if(t-Z._last<1e4)return;Z._last=t;var r=Z.size();Object.keys(r).forEach(function(k){if(r[k]>MAXF&&!warned[k]){warned[k]=1;
console.warn('[zb2] поле '+k+' — '+r[k]+' знаков (предел '+MAXF+')');
try{if(window.STAT&&STAT.ev)STAT.ev('zberr',{m:'size:'+k,e:String(r[k])});}catch(e){}}});}
ZB.on('ready',function(){var f=window.save;if(typeof f!=='function'||f.__zb2)return;
var w=function(){var r=f.apply(this,arguments);ZB.safe('zb2.size',chk);return r;};w.__zb2=1;window.save=w;Z._wrapped=1;});
})();
