(function(){'use strict';
if(!window.UI)return;
var Q=(location.search.match(/[?&]night=([01])/)||[])[1];
function hour(){try{return new Date(nowMs()).getHours();}catch(e){return new Date().getHours();}}
function on(){if(Q)return Q==='1';if(/[?&]demo=/.test(location.search))return false;var h=hour();return h>=20||h<6;}
var was=null;
function check(){var n=on();if(n!==was){was=n;UI.emit('night',n);if(UI.cur==='home')UI.refresh();}return n;}
UI.night={on:on};
homeSlots.push({id:'night',order:5,render:function(){if(!on())return null;var h=hour(),left=h>=20?(24-h)+6:h<6?6-h:0;
return UI.tile({ic:'🌙',t:VY.L('Ночная смена Михалыча','Mikhalych’s night shift'),s:VY.L('дворы ночью, свет в окнах'+(left?' · ещё '+left+' ч':''),'yards at night, lights on'+(left?' · '+left+' h left':'')),cls:'night',go:'game-next'});}});
UI.screen('game-next',function(){var S=VY.S;UI.go('game',{idx:Math.max(0,(S.unlocked||1)-1)});});
function setTod(){try{if(/[?&](demo|tod)=/.test(location.search))return;todForce=check()?'night':null;}catch(e){}}
UI.on('screen',setTod);setTod();setInterval(setTod,60000);
var go0=UI.go;UI.go=function(n,o){if(n==='game'&&o&&o.daily){try{todForce=null;}catch(e){}}else if(n==='game')setTod();return go0.apply(UI,arguments);};
})();