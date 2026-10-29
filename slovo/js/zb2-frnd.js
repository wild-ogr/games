'use strict';
(function(){if(typeof ZB=='undefined'||typeof ZB2=='undefined'||typeof S=='undefined'||['gift','word','brag'].every(ZB2.off))return;
var D='gs gr ty ws wv'.split(' '),T='G T N W R V'.split(' '),L={sx:8,rx:16,wx:6},Q={me:8,nm:14,pg:120};
function n(x){x=+x;return x>0&&x<1e9?Math.floor(x):0}function s(x,k){return typeof x=='string'?x.slice(0,k):''}
function u(a,b,k){var r=[];(s(a,999)+','+s(b,999)).split(',').forEach(function(y){if(y&&r.indexOf(y)<0)r.push(y)});return r.slice(-k).join(',')}
ZB2.field('z2f',{def:{},fix:function(z){var k;z.d=n(z.d);D.concat(T).forEach(function(k){z[k]=n(z[k])});for(k in L)z[k]=u(z[k],'',L[k]);for(k in Q)z[k]=s(z[k],Q[k]);
for(k in z)if(k!='d'&&D.concat(T).indexOf(k)<0&&!L[k]&&!Q[k])delete z[k]},
merge:function(m,c){var k,a=n(m.d),b=n(c.d);if(b>=a){m.d=b;D.forEach(function(k){m[k]=b>a?n(c[k]):Math.max(n(m[k]),n(c[k]))})}
T.forEach(function(k){m[k]=Math.max(n(m[k]),n(c[k]))});for(k in L)m[k]=u(m[k],c[k],L[k]);for(k in Q)if(!m[k])m[k]=s(c[k],Q[k])}});
ZB.on('ready',function(){setTimeout(function(){ZB.load('js/zb2-frnd-x.js').then(function(){ZB.safe('frnd',ZB.refresh)},function(){})},/#zf|hash=zf/.test(location.href)?300:1500)})})();
