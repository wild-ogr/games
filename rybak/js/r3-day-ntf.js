(function(){'use strict';if(typeof R3!=='object'||!R3.on||!window.R3D)return;if(!R3.reg('day.ntf',{s:'R3-DAY',t:'план уведомлений VK (донки, письмо, «байка», давно не был) — шлёт сервер'}))return;var D=R3D,R3_NTF_URL='',LS='rybak-r3ntf',H=36e5;var NTF_BAD=/подар|монет|бесплат|приз|награ|скидк|голос|акци|\bvk\b|вконтакт/i;function vkOk(){try{return PLAT==='vk'&&!(typeof OK!=='undefined'&&OK)&&!window.__demo;}catch(e){return false;}}
function allowed(){try{return!!(window.SOC&&SOC.ntfOn&&SOC.ntfOn());}catch(e){return false;}}
function txt(k,c){for(var i=0;i<6;i++){var t=D.tx('ntf.'+k,c||{},null);if(!t)return null;if(!NTF_BAD.test(t))return t;}return null;}
function at(dayOff,h){var d=new Date(D.now());d.setDate(d.getDate()+dayOff);d.setHours(h,0,0,0);return d.getTime();}
function plan(){var L=[],now=D.now(),c={};if(D.name())c.name=D.name();try{if(window.R3DK&&R3DK.st()==='wait'){var r=Math.max(R3DK.readyAt(S.r3d.t),at(0,8));if(r<now)r=at(1,8);L.push({k:'morning',at:r});}}catch(e){}
try{if(S.r3m&&S.r3m.q&&S.r3m.q.length)L.push({k:'mail',at:at(1,9)});}catch(e){}
try{var tb=S.r3p.tb;if(tb&&tb.d===R3.dk()&&FISH[tb.i])L.push({k:'bayka',at:at(1,10),c:{fish:tb.i,w:tb.g/1000,k:1}});}catch(e){}
L.push({k:'gone3',at:at(3,18)});L.push({k:'gone7',at:at(7,18)});try{if(window.R3U&&R3U.ntf)R3U.ntf(L,at);}catch(e){}
var out=[],seen={},seenD={};L.sort(function(a,b){return a.at-b.at;});L.forEach(function(x){if(out.length>=3||seen[x.k]||x.at<now+6*H)return;var dd=new Date(x.at).toDateString();if(seenD[dd])return;var cc=x.c||{};if(c.name)cc.name=c.name;var t=txt(x.k,cc);if(!t)return;seen[x.k]=1;seenD[dd]=1;out.push({k:x.k,at:Math.round(x.at),t:t});});return out;}
function put(why){var p=plan(),on=allowed();try{localStorage.setItem(LS,JSON.stringify({t:Math.round(D.now()),on:on?1:0,why:why||'',p:p}));}catch(e){}
if(!vkOk()||!on||!p.length)return p;R3.ev('ntfp',{n:p.length,k:p[0].k,on:1});if(R3_NTF_URL&&typeof fetch==='function')try{fetch(R3_NTF_URL,{method:'POST',mode:'cors',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({app:'rybak',q:location.search,plan:p})}).then(function(){},function(){});}catch(e){}
return p;}
var lastPut=0;R3.sub('leave',function(w){if(Date.now()-lastPut<6e4)return;lastPut=Date.now();put(w);},'day.ntf');window.R3DN={plan:plan,put:put,BAD:NTF_BAD};})();