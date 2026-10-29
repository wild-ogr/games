(function(){'use strict';if(typeof R3!=='object'||!R3.on)return;if(!R3.reg('dm',{s:'R3-LICHKA',t:'письмо Петровича в личку сообщества после 3 дней тишины (по согласию «Сообщать о новом»)'}))return;var LSK='rybak-r3dm',H=36e5,MSK=3*H,D=24*H;var $=function(id){return document.getElementById(id);};function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}return null;}
function jp(s){try{return s?JSON.parse(s):null;}catch(e){return null;}}
function ev(k,o){var p={k:k};for(var x in o||{})p[x]=o[x];try{R3.ev('dm',p);}catch(e){}}
function vk(){try{return PLAT==='vk'&&!OK&&(typeof LANG==='undefined'||LANG!=='en');}catch(e){return false;}}
function srv(){return!!(window.R3S&&R3S.url&&R3S.url()&&R3S.send);}
function agreed(){try{return!!(S.soc&&S.soc.msg&&S.soc.msg.d);}catch(e){return false;}}
function C(){try{return S.r3c;}catch(e){return null;}}
function optOut(){var c=C();return!!(c&&c.dm&&c.dm.o);}
function want(){return agreed()&&!optOut();}
function now(){try{return nowMs();}catch(e){return Date.now();}}
function mskDk(t){var d=new Date(t+MSK);return d.getUTCFullYear()*10000+(d.getUTCMonth()+1)*100+d.getUTCDate();}
function mskH(t){return new Date(t+MSK).getUTCHours();}
function sendDay(t){var x=t+3*D;return mskH(x)<12?mskDk(x):mskDk(x+D);}
try{R3.fieldExt('c',{fix:function(o){var m=o.dm;if(m&&typeof m==='object'&&!Array.isArray(m))o.dm={o:m.o?1:0,t:Math.max(0,+m.t||0)};else delete o.dm;},merge:function(a,b){if(b.dm&&(!a.dm||(+b.dm.t||0)>(+a.dm.t||0)))a.dm={o:b.dm.o?1:0,t:+b.dm.t||0};}});}catch(e){}
var st=jp(ls(LSK))||{};function lastPi(){var pi=+st.pi;try{if(PLACES[pi])return pi;}catch(e){}try{return typeof topPlace==='function'?topPlace():0;}catch(e){return 0;}}
function pid(pi){try{return PLACES[pi].id;}catch(e){return'';}}
function pick(k,c){try{return window.R3T?R3T.pick(k,c):null;}catch(e){return null;}}
function texts(t){var pi=lastPi(),pl=pid(pi),d=sendDay(t),fish='';try{fish=R3S.zhor(pi,d*10+2);}catch(e){}
var z=fish?pick('dm.zhor',{place:pl,fish:fish}):null,p=pick('dm.plain',{place:pl}),b=null;try{var bp=S.r3p&&S.r3p.bp;if(bp&&bp.i&&bp.g>0)b=pick('dm.rec',{fish:bp.i,w:bp.g/1000,place:pid(+bp.p||0)});}catch(e){}
if(!b)b=pick('dm.again',{});return{d:d,z:z||'',p:p||'',b:b||'',pi:pi};}
function sync(why){if(!vk()||!srv())return;var on=want();if(!on&&!agreed()&&!st.on)return;var t=now(),x=on?texts(t):null,key=on?('1:'+x.d+':'+x.pi):'0';if(on&&!x.p&&!x.b)return;if(key===st.key)return;try{R3S.send('dm',on?{on:1,a:{d:x.d,z:x.z,p:x.p},b:x.b}:{on:0});}catch(e){return;}
if(!!on!==!!st.on)ev(on?'on':'off',{w:why||''});st.key=key;st.on=on?1:0;ls(LSK,JSON.stringify(st));}
function setOpt(o){var c=C();if(!c)return;c.dm={o:o?1:0,t:now()};try{save();}catch(e){}st.key='';sync('set');}
R3.sub('end',function(g){try{if(g&&PLACES[g.pi]){st.pi=g.pi;ls(LSK,JSON.stringify(st));}}catch(e){}setTimeout(function(){sync('end');},400);},'dm');R3.sub('boot',function(){try{if(/(^|[#&])r3dm\b/.test(location.hash||''))ev('back',{});}catch(e){}
setTimeout(function(){sync('boot');},6000);},'dm');function rowHtml(){var off=optOut();return'<button class="set" id="stDm"><span>✉ Письма Петровича<br><small>в личку «Игры во дворе», если пропадёшь на 3 дня; не чаще раза в неделю</small></span>'+
(off?'<i class="off uw-sw" aria-label="выкл">выкл</i>':'<i class="uw-sw" aria-label="вкл">вкл</i>')+'</button>';}
function addRow(){if(!vk()||!srv()||!agreed())return;var m=$('mcard');if(!m||$('stDm'))return;var w=document.createElement('div');w.innerHTML=rowHtml();var b=w.firstChild,soc=$('stSoc'),rows=m.querySelectorAll('.row'),row=rows[rows.length-1];if(soc&&soc.parentNode)soc.parentNode.insertBefore(b,soc.nextSibling);else if(row&&row.parentNode)row.parentNode.insertBefore(b,row);else m.appendChild(b);b.onclick=function(){setOpt(!optOut());try{SND.tap();}catch(e){}try{openSettings();}catch(e){}};}
function addNote(){if(!vk()||!srv())return;var m=$('mcard');if(!m)return;var b=m.querySelector('[data-soc="msg"]');if(!b||b.getAttribute('data-dm'))return;b.setAttribute('data-dm','1');b.innerHTML+='<br><small style="font-weight:normal;opacity:.8">Петрович напишет в личку, если пропадёшь на 3 дня</small>';}
try{if(typeof openSettings==='function'){var oS=openSettings;window.openSettings=openSettings=function(){var r=oS.apply(this,arguments);try{addRow();}catch(e){}return r;};}}catch(e){}
try{if(typeof openSocial==='function'){var oC=openSocial;window.openSocial=openSocial=function(){var r=oC.apply(this,arguments);try{addNote();}catch(e){}return r;};}}catch(e){}
window.R3DMS={sync:sync,texts:texts,sendDay:sendDay,want:want,opt:setOpt,_note:addNote,_st:function(){return st;}};})();