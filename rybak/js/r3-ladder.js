var LAD=(function(){'use strict';var VER=1;var Z={force:null};function qs(){try{return typeof location!=='undefined'?location.search||'':'';}catch(e){return'';}}
function on(){if(Z.force!=null)return!!Z.force;try{var q=qs();if(/[?&]off=([^&#]*,)?r3(\.ladder)?(,|&|#|$)/.test(q))return false;if(typeof R3!=='undefined'&&R3&&typeof R3.off==='function')return!R3.off('ladder');if(/[?&]r3l=1/.test(q))return true;}catch(e){}
return false;}
var DEF={lad:{baitMax:.35,perZor:1,perDay:2,fromSes:2,e:[0,2,1.5,1.1],slip:[0,.06,.09,.12],prem:.1,wait:.45,extra:3},flock:{n:2,t:[20,40],ext:8,max:40,wait:.45,tries:3},heat:{fast:.3,calm:.6,slow:.7,max:5,hot:25,hotWait:.25},mult:{k:.1,h:.06,cap:.6,dayR:[.6,40]},fz:{p:.12,fromSes:5,day:2,t:180,wait:.18,free:5}};function N(){var E=typeof window!=='undefined'&&window.R3E;return E&&E.lad?E.lad:DEF;}
function c5(k,mn){try{var E=window.R3E;if(E&&typeof E.c==='function')return E.c(k,mn);}catch(e){}return Math.max(mn||0,Math.round(k*30/5)*5);}
var LADS={prud:[['rotan','karas','plotva'],['okun']],rechka:[['peskar','ukleyka','ersh','plotva'],['nalim'],['shuka']],volga:[['gustera','vobla','chehon'],['sudak','zhereh'],['som']],seliger:[['snetok','ryapushka'],['okun'],['shuka','sudak']],ladoga:[['koryushka','ryapushka'],['okun'],['sudak','paliya'],['losos']],baikal:[['omul','harius','okun'],['lenok'],['shuka'],['taimen']],amur:[['skripun'],['zmeegolov','verhoglyad'],['kaluga']],kamchatka:[['golets'],['kundzha'],['kizhuch'],['chavycha']],oka:[['plotva','podust'],['zhereh'],['sudak']],chud:[['snetok','ersh_nos','sinets'],['sudak'],['shuka']],onego:[['koryushka','kilets'],['okun'],['paliya','forel'],['losos_on']],varzuga:[['harius'],['shuka'],['kumzha'],['semga']],beloe:[['koryushka','seld_bel','navaga'],['treska'],['zubatka']],barents:[['piksha','kambala'],['okun_mor'],['treska'],['paltus']]};function ladOf(pi){var P=typeof PLACES!=='undefined'&&PLACES[pi];if(!P)return null;var l=LADS[P.id];if(!l)return null;var out=[];for(var i=0;i<l.length;i++){var s=l[i].filter(function(id){return P.fish.indexOf(id)>=0&&FISH[id];});if(!s.length)break;out.push(s);}
return out.length>=2?out:null;}
function rungOf(pi,id){var l=ladOf(pi);if(!l)return-1;for(var i=0;i<l.length;i++)if(l[i].indexOf(id)>=0)return i;return-1;}
function top(pi){var l=ladOf(pi);return l?l.length:0;}
function baitOk(pi,f,w){if(!f||f.leg)return false;if(rungOf(pi,f.id)!==0)return false;var mx=Math.max(N().lad.baitMax,f.w[0]*1.5);return w<=mx+1e-9;}
function pick(pi,k,tod,R){var l=ladOf(pi);if(!l||k<1||k>=l.length)return null;var ids=l[k],ws=[],tot=0,i;for(i=0;i<ids.length;i++){var f=FISH[ids[i]],x=(f.r||1)*((f.b&&f.b.live)||.5)*(f.t&&f.t[tod]!=null?f.t[tod]:1);x=Math.max(x,.05);ws.push(x);tot+=x;}
var u=R()*tot;for(i=0;i<ids.length-1;i++){u-=ws[i];if(u<0)break;}
var F=FISH[ids[i]],E=N().lad.e,e=E[k===l.length-1?E.length-1:Math.min(k,E.length-2)]||1,w=F.w[0]+(F.w[1]-F.w[0])*Math.pow(R(),e);return{f:F,w:Math.max(.005,Math.round(w*1000)/1000),lad:k+1};}
function signOk(sign,n){return!n||sign==='gull'||sign==='boil';}
function slip(k){var s=N().lad.slip;return s[Math.min(k,s.length-1)]||0;}
function nu(pi,f,w){return{v:VER,pi:pi,st:[{id:f.id,w:w}],arm:1,cur:0,got:0,ask:0,ex:0,ix:[],pot:0,top:top(pi)};}
function potOf(L){var s=0;for(var i=1;i<L.st.length;i++)s+=L.st[i].p||0;return Math.round(s*(1+N().lad.prem*(L.st.length-1)));}
function canUp(L){return L.st.length<L.top;}
function dayOk(st,dn){return st.ld!==dn||st.ln<(N().lad.perDay||99);}
function dayAdd(st,dn){if(st.ld!==dn){st.ld=dn;st.ln=0;}st.ln++;}
function flNew(){return{id:'',n:0,t:0,on:0,heat:0,hot:0,run:0,best:0};}
function flCast(s,id,R){var F=N().flock;if(!id){var was=s.on;s.on=0;s.n=0;s.id='';s.t=0;return was?'end':'';}
if(id===s.id){s.n++;if(s.on){s.t=Math.min(F.max,s.t+F.ext);s.best=Math.max(s.best,s.n);return'more';}
if(s.n>=F.n){s.on=1;s.run++;s.t=F.t[0]+(F.t[1]-F.t[0])*R();s.best=Math.max(s.best,s.n);return'start';}return'';}
var w=s.on;s.id=id;s.n=1;s.on=0;s.t=0;return w?'end':'';}
function flTick(s,dt){if(s.hot>0){s.hot=Math.max(0,s.hot-dt);if(!s.hot)s.heat=Math.min(s.heat,2);}if(!s.on)return'';s.t-=dt;if(s.t<=0){s.on=0;s.n=0;s.id='';s.t=0;return'end';}return'';}
function heatHook(s,dt,cm){var H=N().heat,fast=cm?H.calm:H.fast;if(dt<=fast){s.heat=Math.min(H.max,s.heat+1);if(s.heat>=H.max&&!s.hot){s.hot=H.hot;return'hot';}return'clean';}
if(dt>H.slow+(cm?.4:0)){s.heat=Math.max(0,s.heat-1);return s.heat?'cool':'cool';}return'';}
function heatMiss(s){s.heat=Math.max(0,s.heat-2);}
function mult(s){if(!s.on)return 1;var M=N().mult;return 1+Math.min(M.cap,M.k*Math.max(0,s.n-1)+M.h*s.heat);}
function waitK(s,fz){var k=1;if(fz)k*=N().fz.wait;else{if(s.hot>0)k*=N().heat.hotWait;else if(s.on)k*=N().flock.wait;}return k;}
function dayCap(){var M=N().mult;return c5(M.dayR[0],M.dayR[1]);}
function fzRoll(st,ses,d3,dn,R){var F=N().fz;if(st.fd===dn)return false;if((ses||0)<F.fromSes||(d3||0)<F.day)return false;return R()<F.p;}
function fzNew(R,legs){return{on:0,t:N().fz.t,free:N().fz.free,n:0,at:Math.min(Math.max(1,legs-2),1+Math.floor(R()*Math.max(1,legs-2)))};}
var JK={fd:1,n:1,top:1,k:1,bd:1,bs:1,fl:1,hx:1,fz:1,b:1,ld:1,ln:1};function fixJ(o){o=o&&typeof o==='object'&&!Array.isArray(o)?o:{};for(var x in o)if(!JK[x])delete o[x];function n(v){v=+v;return isFinite(v)&&v>0?Math.floor(v):0;}
o.fd=n(o.fd);o.ld=n(o.ld);o.ln=n(o.ln);o.n=n(o.n);o.top=n(o.top);o.k=n(o.k);o.bd=n(o.bd);o.bs=n(o.bs);o.fl=n(o.fl);o.hx=n(o.hx);o.fz=n(o.fz);var b=o.b;o.b=Array.isArray(b)&&typeof b[0]==='string'&&typeof b[1]==='string'?[b[0].slice(0,24),b[1].slice(0,24),Math.round(+b[2]||0),n(b[3]),n(b[4])]:null;return o;}
function mergeJ(a,b){a=fixJ(a);b=fixJ(b);['fd','n','top','k','fl','hx','fz'].forEach(function(k){a[k]=Math.max(a[k],b[k]);});if(b.bd>a.bd){a.bd=b.bd;a.bs=b.bs;}else if(b.bd===a.bd)a.bs=Math.max(a.bs,b.bs);if(b.ld>a.ld){a.ld=b.ld;a.ln=b.ln;}else if(b.ld===a.ld)a.ln=Math.max(a.ln,b.ln);if(b.b&&(!a.b||b.b[3]>a.b[3]||b.b[3]===a.b[3]&&b.b[2]>a.b[2]))a.b=b.b;return a;}
return{VER:VER,Z:Z,on:on,DEF:DEF,N:N,LADS:LADS,ladOf:ladOf,rungOf:rungOf,top:top,baitOk:baitOk,signOk:signOk,pick:pick,slip:slip,nu:nu,potOf:potOf,canUp:canUp,dayOk:dayOk,dayAdd:dayAdd,flNew:flNew,flCast:flCast,flTick:flTick,heatHook:heatHook,heatMiss:heatMiss,mult:mult,waitK:waitK,dayCap:dayCap,fzRoll:fzRoll,fzNew:fzNew,fixJ:fixJ,mergeJ:mergeJ};})();try{if(typeof window!=='undefined'&&window.R3E&&!window.R3E.lad)window.R3E.lad=LAD.DEF;}catch(e){}