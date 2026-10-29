var V3=(function(){
var V3_PCT=100;
var V3_CFG_URL='https://functions.yandexcloud.net/d4e5nfg9u466prmmiooj?op=v3cfg';
var V3_OFF0='quarter';
var LS_ON='vyezd-v3',LS_B='vyezd-v3b',LS_CFG='vyezd-v3cfg';
var W=window;
function ls(k,v){try{if(v===undefined)return W.localStorage.getItem(k);if(v===null)W.localStorage.removeItem(k);else W.localStorage.setItem(k,v);}catch(e){}return null;}
function jp(s){try{return s?JSON.parse(s):null;}catch(e){return null;}}
function qp(k){try{var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):null;}catch(e){return null;}}
function isO(v){return!!v&&typeof v==='object'&&!Array.isArray(v);}
function list(s){var o={},a=String(s||'').split(',');for(var i=0;i<a.length;i++){var k=a[i].replace(/^\s+|\s+$/g,'');if(k)o[k]=1;}return o;}
var errN=0;function err(w,x){errN++;if(errN<=8)try{console.warn('v3 '+w+': '+(x&&x.message||x));}catch(e){}}
var cfg=jp(ls(LS_CFG))||{},soff=list(typeof cfg.off==='string'?cfg.off:(cfgUrl()?V3_OFF0:'')),qoff=list(qp('off')),qon=list(qp('on'));
var pct=V3_PCT,fromSrv=false;if(typeof cfg.p==='number'&&cfg.p>=0&&cfg.p<=100){pct=cfg.p;fromSrv=true;}
var bucket=parseInt(ls(LS_B),10);if(!(bucket>=0&&bucket<100)){bucket=Math.floor(Math.random()*100);ls(LS_B,String(bucket));}
var on,why,man=ls(LS_ON);
if(qoff.v3||qoff.all){on=false;why='off';}
else if(qon.v3){on=true;why='q';}
else if(man==='0'||man==='1'){on=man==='1';why='ls';}
else{on=bucket<pct;why=fromSrv?'srv':'pct';}
function saveCfg(p,off,amb){var c=jp(ls(LS_CFG))||{},ch=false;
if(typeof p==='number'&&p>=0&&p<=100&&c.p!==p){c.p=p;ch=true;}
if(typeof amb==='number'&&amb>=0&&amb<=100&&c.amb!==amb){c.amb=amb;ch=true;}
if(typeof off==='string'&&c.off!==off){c.off=off.slice(0,300);ch=true;}
if(ch){c.t=Date.now();ls(LS_CFG,JSON.stringify(c));}return ch;}
function cfgUrl(){try{var m=/[?&]v3srv=(\d+)/.exec(location.search);
if(/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname))return m?'http://127.0.0.1:'+m[1]+'/?op=v3cfg':'';}catch(e){}return V3_CFG_URL||'';}
function cfgFetch(){var u=cfgUrl();if(!u||!W.fetch)return;try{fetch(u,{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){
if(!isO(j))return;var p=parseInt(j.v3,10),am=parseInt(j.amb,10);if(saveCfg(isFinite(p)?p:undefined,typeof j.off==='string'?j.off:undefined,isFinite(am)?am:undefined))ev('cfg',{p:isFinite(p)?p:-1,o:String(j.off||'').slice(0,40),s:'url'});},function(){});}catch(e){}}
var feats={};
function isOff(id){if(!on)return true;if(!id||id==='v3')return false;id=String(id);
var parts=id.split('.'),p='';
for(var i=0;i<parts.length;i++){p=p?p+'.'+parts[i]:parts[i];
if(qon['v3.'+p])continue;
if(qoff['v3.'+p]||qoff[p]||soff[p]||soff['v3.'+p])return true;}
return false;}
function reg(id,o){o=o||{};feats[id]={id:id,s:o.s||'',t:o.t||''};return!isOff(id);}
function flags(){var r=[{id:'v3',s:'V3-CORE',t:'главный',off:!on,why:why,pct:pct,b:bucket}];for(var k in feats)r.push({id:k,s:feats[k].s,t:feats[k].t,off:isOff(k)});return r;}
var subs={};
function sub(ev,fn,id){if(typeof fn!=='function')return;(subs[ev]=subs[ev]||[]).push({fn:fn,id:id||''});}
function emit(ev,a,b,c){var l=subs[ev];if(!l||!on)return;for(var i=0;i<l.length;i++){var x=l[i];if(x.id&&isOff(x.id))continue;try{x.fn(a,b,c);}catch(e){err(ev+(x.id?' '+x.id:''),e);}}}
var fields={};
function field(name,o){o=o||{};if(!/^v3/.test(name)){err('field','имя не с v3: '+name);return;}
if(fields[name])err('field','поле уже занято: '+name+' ('+fields[name].s+')');
fields[name]={s:o.s||'',o:o};
var def=o.def;
function mk(){return typeof def==='function'?def():def?JSON.parse(JSON.stringify(def)):{};}
if(!W.UI)return;
UI.onSave({id:'v3f-'+name,keys:[name],
fix:function(S){try{if(!isO(S[name])&&def!==null)S[name]=mk();if(o.fix){var r=o.fix(S[name],S);if(r!==undefined)S[name]=r;}}catch(e){err('fix '+name,e);}},
merge:function(S,d,newer){try{if(!d||d[name]===undefined)return;var a=S[name],b=d[name];
if(o.merge){var r=o.merge(a,b,newer);if(r!==undefined)S[name]=r;}else if(newer||a===undefined)S[name]=b;
if(o.fix){var r2=o.fix(S[name],S);if(r2!==undefined)S[name]=r2;}}catch(e){err('merge '+name,e);}}});}
function owner(name){return fields[name]?fields[name].s:'';}
function fieldList(){var r=[];for(var k in fields)r.push({k:k,s:fields[k].s});return r;}
var evQ=[],evN={},wired=false;
function ev(a,o){if(!on&&a!=='boot'&&a!=='cfg')return;var p={a:a},n=0,k;for(k in o||{}){if(n>=7)break;var v=o[k];if(v===undefined||v===null||v==='')continue;p[k]=v;n++;}
evN[a]=(evN[a]||0)+1;if(evN[a]>40)return;
if(!wired||typeof STAT!=='object'||!STAT){if(evQ.length<30)evQ.push(p);return;}try{STAT.ev('v3',p);}catch(e){}}
function dk(){try{if(typeof todayKey==='function')return+todayKey()||0;}catch(e){}return Math.floor(Date.now()/864e5);}
function sv(){try{return typeof S!=='undefined'&&isO(S)?S:null;}catch(e){return null;}}
function my(){var s=sv();return s&&isO(s.v3)?s.v3:null;}
function day(){var m=my();return m&&m.n>0?m.n:1;}
function vet(){var m=my();return!!(m&&m.vet);}
field('v3',{s:'V3-CORE',def:{v:1},
fix:function(o,S){if(!isO(o))o={v:1};o.v=1;
['d0','dk','n','u0'].forEach(function(k){if(typeof o[k]!=='number'||!isFinite(o[k])||o[k]<0)o[k]=0;});
if(o.vet!==1)delete o.vet;if(typeof o.src!=='string')o.src='';o.src=o.src.slice(0,12);return o;},
merge:function(a,b,newer){if(!isO(b))return a;if(!isO(a))return b;var r={v:1};
r.d0=a.d0&&b.d0?Math.min(a.d0,b.d0):(a.d0||b.d0||0);r.dk=Math.max(a.dk||0,b.dk||0);r.n=Math.max(a.n||0,b.n||0);
r.u0=Math.max(a.u0||0,b.u0||0);if(a.vet||b.vet)r.vet=1;r.src=a.src||b.src||'';return r;}});
function stamp(){var s=sv(),m=my();if(!s||!m)return;var d=dk(),ch=false;
if(!m.d0){m.d0=d;m.u0=Math.max(0,(+s.unlocked||1)-1);if(m.u0>=3||(+s.levelsDone||0)>=3)m.vet=1;ch=true;ev('first',{u:m.u0,v:m.vet?1:0,src:m.src||''});}
if(m.dk!==d){m.dk=d;m.n=(m.n||0)+1;ch=true;emit('day',m.n,d);ev('day',{n:m.n,u:Math.max(0,(+s.unlocked||1)-1)});}
if(ch)try{if(typeof save==='function')save();}catch(e){}}
function wire1(){if(wired)return;wired=true;
try{if(typeof applyFlags==='function'&&!applyFlags.__v3){var f0=applyFlags;var f1=function(f){try{if(isO(f)){var p=parseInt(f.v3,10),o=typeof f.v3off==='string'?f.v3off:undefined,am=parseInt(f.v3amb,10);
if(saveCfg(isFinite(p)&&p>=0&&p<=100?p:undefined,o,isFinite(am)?am:undefined))ev('cfg',{p:isFinite(p)?p:-1,o:String(o||'').slice(0,40),s:'ya'});}}catch(e){}return f0.apply(this,arguments);};
f1.__v3=1;applyFlags=f1;}}catch(e){err('flags',e);}
try{if(typeof onCloud==='function'&&!onCloud.__v3){var c0=onCloud;var c1=function(){var r=c0.apply(this,arguments);try{cloud();}catch(e){}return r;};c1.__v3=1;onCloud=c1;}}catch(e){err('cloud',e);}
for(var i=0;i<evQ.length;i++)try{STAT.ev('v3',evQ[i]);}catch(e){}evQ=[];
ev('boot',{on:on?1:0,w:why,p:pct,b:bucket});
if(!on)return;
try{if(STAT.ab){ls('stat-ab-vyezd-v3',on?'A':'B');}}catch(e){}
if(W.UI){UI.on('yard-start',function(o){emit('yard-start',o);});UI.on('yard',function(i){emit('yard',i);});
UI.on('win',function(c){emit('win',c);});UI.on('lose',function(c){emit('lose',c);});
UI.on('screen',function(n){emit('screen',n);if(n==='home'||n==='map')emit(n);});}
var hid=false;function vis(h){if(h===hid)return;hid=h;emit(h?'leave':'back');if(!h)stamp();}
document.addEventListener('visibilitychange',function(){vis(document.visibilityState==='hidden');});
W.addEventListener('pagehide',function(){vis(true);});
setTimeout(cfgFetch,4000);
function boot(){stamp();emit('boot');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);}
function cloud(){if(!on)return;stamp();emit('cloud');}
var api={pct:pct,bucket:bucket,reg:reg,off:isOff,is:function(id){return!isOff(id);},fix:function(k){return!isOff('fix.'+k);},
flags:flags,sub:sub,emit:emit,ev:ev,field:field,owner:owner,fields:fieldList,day:day,dk:dk,vet:vet,wire1:wire1,cloud:cloud,
_st:function(){return{on:on,why:why,pct:pct,b:bucket,cfg:jp(ls(LS_CFG)),soff:soff,qoff:qoff,fields:fieldList(),feats:Object.keys(feats),wired:wired,evN:evN};}};
try{Object.defineProperty(api,'on',{get:function(){return on;}});Object.defineProperty(api,'why',{get:function(){return why;}});}catch(e){api.on=on;api.why=why;}
reg('fix',{s:'V3-CORE',t:'мелкие баги v23.9 (этаж 0)'});
try{document.documentElement.classList.toggle('v3',on);}catch(e){}
return api;
})();