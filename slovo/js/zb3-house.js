'use strict';
(function(){
var Z=window.Z3;if(!Z||typeof window.ZB==='undefined')return;
var ON=Z.reg('z3srv',{t:'Сервер дома: жильцы, стройка, загадки, почта ИИ (без него — расчёт на месте)',who:'SRV'});
var X='js/zb3-house-s.js',T;
function lsG(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function L(f){return Z.need(X).then(function(){if(!T._full)throw new Error('no srv');return f();});}
T=Z.srv={v:1,ON:ON,_sim:{},
send:function(k,d){if(Z.q.length<200)Z.q.push({k:k,d:d,t:Date.now()});},
get:function(k,q){return L(function(){return T.get(k,q);});},
flush:function(){return L(function(){return T.flush();});},
okFriends:function(){return L(function(){return T.okFriends();}).then(null,function(){return{ids:[],in:[]};});},
peek:function(k,q){var c=lsG('z3-c-'+k+(k==='vote'&&q&&q.f?'-'+q.f:''),null);return c&&c.d||null;},
me:function(){return lsG('z3-me',null);},on:function(){return false;},mailNet:function(){return false;}};
Z.late(X,{day:1});
if(Z.soff&&!Z.on)setTimeout(function(){ZB.load(X).catch(function(){});},6000);
})();
