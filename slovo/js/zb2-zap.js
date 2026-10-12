'use strict';
/* zb2-zap — «Записки на холодильнике» (ZAP), стартовая часть: флаги zap/zapchain, поле S.z2z, ловля событий, ZB2ZAP.hook.
Логика — лениво: zb2-zap-data.js + zb2-zap-ui.js. ДОГОВОР (hook, list, open, total, поле, STAT) — шапка js/zb2-zap-ui.js. */
(function(){
if(typeof window.ZB==='undefined'||!window.ZB2)return;
var ZB=window.ZB,ON=ZB2.reg('zap',{t:'Записки на холодильнике',who:'ZAP',on:true});
ZB2.reg('zapchain',{t:'Записки: связки героев и магнитики',who:'ZAP',on:true});
var Z=window.ZB2ZAP={on:ON,v:1,_q:[],hook:function(){},list:function(){return [];},open:function(){},
total:function(){try{return S.z2z&&+S.z2z.n||0;}catch(e){return 0;}}};  // TECH: миссии VK zp1/zp25/zp100
if(!ON)return;
function num(v){v=+v;return isFinite(v)?v:0;}
var DEF={n:0,k:[],h:'',sd:0,sw:0,m:0,tu:0,d0:0,nb:0,cn:0,c:null,mg:''};
ZB2.field('z2z',{def:DEF,
fix:function(z,S){['n','sd','sw','m','tu','d0','nb','cn'].forEach(function(k){z[k]=Math.max(0,Math.floor(num(z[k])));});
if(!Array.isArray(z.k))z.k=[];z.k=z.k.filter(function(o){return o&&typeof o==='object'&&typeof o.i==='string';}).slice(0,3);
z.k.forEach(function(o){o.g=Math.max(1,Math.floor(num(o.g)));o.p=Math.max(0,Math.min(o.g,Math.floor(num(o.p))));o.s=Math.max(1,Math.min(3,Math.floor(num(o.s))||1));
o.t=num(o.t);o.f=o.f?1:0;if(o.p>=o.g)o.f=1;});
if(typeof z.h!=='string')z.h='';if(typeof z.mg!=='string')z.mg='';
if(z.c&&typeof z.c!=='object')z.c=null;},
merge:function(a,b,newer){var take=num(b.n)>num(a.n)||(num(b.n)===num(a.n)&&newer);
if(take){a.k=JSON.parse(JSON.stringify(b.k||[]));a.h=typeof b.h==='string'?b.h:a.h;a.c=b.c&&typeof b.c==='object'?JSON.parse(JSON.stringify(b.c)):a.c;}
['n','m','cn','nb'].forEach(function(k){a[k]=Math.max(num(a[k]),num(b[k]));});
a.tu=num(a.tu)|num(b.tu);
a.sd=Math.max(num(a.sd),num(b.sd));a.sw=Math.max(num(a.sw),num(b.sw));
a.d0=a.d0&&b.d0?Math.min(num(a.d0),num(b.d0)):num(a.d0)||num(b.d0);
var x=String(a.mg||''),y=String(b.mg||''),r='';for(var i=0;i<Math.max(x.length,y.length);i++)r+=(x[i]==='1'||y[i]==='1')?'1':'0';a.mg=r;}});
function ev(type,d){if(Z._on)ZB.safe('zap:'+type,function(){Z._on(type,d||{});});else if(Z._q.length<60)Z._q.push([type,d||{}]);}
Z._ev=ev;
Z.hook=function(type,n,o){if(typeof type!=='string')return;ev('act',{t:type,n:Math.max(1,Math.floor(+n||1)),o:o||{}});};
function wrap(name,fn){var f=window[name];if(typeof f!=='function'||f.__zz)return;var w=fn(f);w.__zz=1;window[name]=w;}
function hookGame(){
wrap('foundWord',function(f){return function(wd,byHint){var r=f.apply(this,arguments);if(!byHint&&wd&&wd.w)ev('word',{w:wd.w,c:typeof G!=='undefined'&&G?G.combo:0});return r;};});
wrap('submit',function(f){return function(w){var g=typeof G!=='undefined'?G:null,b0=g?g.bonus.size:0,m0=g?g.miss:0,j0=+S.jar||0;
var r=f.apply(this,arguments);if(g&&g===G){if(g.bonus.size>b0){ev('bonus',{w:w});if((+S.jar||0)<j0)ev('jar',{});}
else if(g.miss>m0)ev('miss',{});}return r;};});
wrap('collectDef',function(f){return function(){var r=f.apply(this,arguments);if(r)ev('def',{});return r;};});
wrap('shuffleLetters',function(f){return function(){var g=typeof G!=='undefined'?G:null,ok=g&&!g.won;var r=f.apply(this,arguments);if(ok)ev('shuf',{});return r;};});
wrap('openCell',function(f){return function(c,t,how){var r=f.apply(this,arguments);if(how==='hint')ev('hintc',{});return r;};});
wrap('openSosedki',function(f){return function(){var r=f.apply(this,arguments);ev('act',{t:'sos',n:1,o:{}});return r;};});
}
ZB.safe('zap:wrap',hookGame);
ZB.startHook.push(function(info){ev('start',info);});
ZB.levelHook.push(function(info){ev('level',info);});
ZB.on('zmg',function(d){if(d&&d.a==='end')ev('act',{t:'mg',n:1,o:{id:d.id,tier:d.tier}});});
ZB.on('cab',function(d){ev('act',{t:'cab',n:1,o:d||{}});});
ZB.on('cabbuf',function(){ev('act',{t:'buf',n:1,o:{}});});
ZB.on('five',function(){ev('act',{t:'five',n:1,o:{}});});
ZB.on('screen',function(id){var m={'zb-diary':'diary',dictS:'dict','zb-cab':'cabv','zb-mg':'mgv',shopS:'shopv'}[id];if(m)ev('act',{t:m,n:1,o:{}});ev('screen',{id:id});});
ZB.on('ready',function(){ZB.safe('zap:hook2',hookGame);
ZB.load('js/zb2-zap-data.js').then(function(){return ZB.load('js/zb2-zap-ui.js');}).then(function(){
if(Z._init)ZB.safe('zap:init',Z._init);},function(){});});
})();
