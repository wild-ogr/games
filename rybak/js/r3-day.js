(function(){'use strict';if(typeof R3!=='object'||!R3.on)return;if(!R3.reg('day',{s:'R3-DAY',t:'день у Петровича: донки на ночь, утренний звонок, почта к утру, Петрович помнит'}))return;var $=function(id){return document.getElementById(id);};function esc_(s){try{return esc(s);}catch(e){return String(s).replace(/[&<>"]/g,'');}}
function qp(k){try{var m=new RegExp('[?&]'+k+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):null;}catch(e){return null;}}
function pnow(){try{return performance.now();}catch(e){return Date.now();}}
var vkTs=parseInt(qp('vk_ts'),10),dev0=Date.now(),p0=pnow(),hidT=0,hidAll=0;if(!(vkTs>1.6e9&&vkTs<4e9))vkTs=0;try{document.addEventListener('visibilitychange',function(){if(document.hidden)hidT=Date.now();else if(hidT){hidAll+=Math.max(0,Math.min(2592e5,Date.now()-hidT));hidT=0;}});}catch(e){}
function now(){var t;try{if(typeof ysdk!=='undefined'&&ysdk&&ysdk.serverTime){var y=ysdk.serverTime();if(typeof y==='number'&&y>1.6e12)return y+shift();}}catch(e){}
if(vkTs){var de=Date.now()-dev0,pe=pnow()-p0;var lim=pe+hidAll+(hidT?Math.max(0,Date.now()-hidT):0),el=de<pe-6e4?pe:(de>lim+12e4?lim:de);t=vkTs*1000+el;}
else t=Date.now();return t+shift();}
function shift(){var s=0;try{s=+window.__r3dShift||0;}catch(e){}return isFinite(s)?s:0;}
function dt(t){return new Date(t==null?now():t);}
function hour(t){return dt(t).getHours();}
function dkOf(t){var d=dt(t);return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);}
function dk(){return dkOf(now());}
function fnm(id){try{var f=FISH[id]||(typeof LEG==='object'&&LEG[id]);return f?nm(f):id;}catch(e){return id;}}
function pnm(pi){try{return nm(PLACES[pi]);}catch(e){return'';}}
function pid(pi){try{return PLACES[pi].id||'';}catch(e){return'';}}
function kg(g){try{return kgTxt(g/1000);}catch(e){return Math.round(g)+' г';}}
function tap(){try{SND.tap();}catch(e){}}
function name(){try{return S.r3p.nm||'';}catch(e){return'';}}
var NUMW=['','одну','две','три','четыре','пять','шесть','семь','восемь','девять','десять'];function giftTxt(c){var a=String(c||'').split(':');if(a[0]==='b'){var b=BAIT[a[1]];if(!b)return'';return'банку '+b.acc+' ('+(+a[2]||0)+' шт.)';}
if(a[0]==='c'){var n=+a[1]||0;try{return coinsTxt(n);}catch(e){return n+' монет';}}
if(a[0]==='h'||a[0]==='z')return fnm(a[1]).toLowerCase()+' — '+pnm(+a[2]);return'';}
function giftIc(c){var a=String(c||'').split(':');if(a[0]==='b'&&BAIT[a[1]])return BAIT[a[1]].ic;if(a[0]==='c')return'💰';if(a[0]==='h'||a[0]==='z')return'🗺';return'🎁';}
function give(c,src){var a=String(c||'').split(':'),n=0;try{if(a[0]==='b'&&BAIT[a[1]]&&BAIT[a[1]].pack){n=Math.max(0,Math.min(50,+a[2]||0));S.bait[a[1]]=(S.bait[a[1]]||0)+n;}
else if(a[0]==='c'){n=Math.max(0,Math.min(300,+a[1]||0));S.coins+=ern('gift',n);try{updCoins();}catch(e){}}
else return false;save();}catch(e){return false;}
R3.ev('gift',{k:a[0],id:(a[1]||'').slice(0,8),n:n,src:String(src||'').slice(0,8)});return true;}
function giftBait(n,pi){var b='maggot';try{b=a3BestBait(pi==null?topPlace():pi);}catch(e){}if(!BAIT[b]||!BAIT[b].pack)b='maggot';return'b:'+b+':'+(n||5);}
function giftHint(seed){try{var R=rng(seed||dk()),L=[];for(var pi=0;pi<PLACES.length;pi++){if(!S.open[pi])continue;var fs=PLACES[pi].fish||[];for(var i=0;i<fs.length;i++){var f=FISH[fs[i]];if(f&&!f.leg&&!f.fest&&f.rar!=='rb'&&f.rar!=='tsar')L.push([fs[i],pi]);}}
if(!L.length)return'';var x=L[Math.floor(R()*L.length)];return'h:'+x[0]+':'+x[1];}catch(e){return'';}}
function giftZhor(d){try{var o=a3Fore(d==null?dk():d);if(o&&o.f&&FISH[o.f])return'z:'+o.f+':'+o.pi;}catch(e){}return'';}
function giftCtx(c,ctx){ctx=ctx||{};var a=String(c||'').split(':');ctx.gift=giftTxt(c);if(a[0]==='h'||a[0]==='z'){ctx.fish=a[1];ctx.place=pid(+a[2]);}if(!ctx.name&&name())ctx.name=name();return ctx;}
function tx(key,ctx,fb){try{if(window.R3T){var t=R3T.pick(key,ctx||{});if(t)return t;}}catch(e){}return fb==null?null:fb;}
function txAny(keys,ctx,fb){try{if(window.R3T){var t=R3T.any(keys,ctx||{});if(t)return t;}}catch(e){}return fb==null?null:fb;}
function txAt(key,i,ctx){try{var D=window.R3T_DATA,a=D&&D.k&&D.k[key];if(!a||!a[i])return null;return R3T.fill(a[i],ctx||{});}catch(e){return null;}}
function lastId(){try{return R3T.last?R3T.last.key+'#'+R3T.last.i:'';}catch(e){return'';}}
var WHO={p:'Петрович',w:'Жена',m:'Дед Митяй',k:'Кум',s:''};function av(k){try{if(window.LOOK&&LOOK.av)return LOOK.av(k==='p'?'petr':k==='w'?'wife':k==='m'?'mit':'petr')||'';}catch(e){}return'';}
function dlg(o){var h='<div class="r3dd">'+(o.hd?'<div class="r3dd-hd">'+o.hd+'</div>':'');var prev='';(o.lines||[]).forEach(function(l){if(!l||!l[1])return;var k=l[0],same=k===prev;prev=k;h+='<div class="r3dd-l r3dd-'+k+(same?' r3dd-same':'')+'">'+(k!=='s'&&k!=='g'&&!same?'<b>'+esc_(WHO[k]||'')+'</b>':'')+'<span>'+(l[2]?l[1]:esc_(l[1]))+'</span></div>';});h+=(o.html||'')+'<div class="r3dd-bt">'+(o.btns||[]).map(function(b){return'<button class="btn noenter '+(b[2]||'')+'" id="'+b[0]+'">'+b[1]+'</button>';}).join('')+'</div></div>';modal(h);(o.btns||[]).forEach(function(b){var e=$(b[0]);if(e)e.onclick=function(){tap();try{b[3]&&b[3]();}catch(x){try{console.warn('r3 day dlg',x);}catch(z){}}};});try{if(window.LOOK&&LOOK.walk)LOOK.walk($('mcard'));}catch(e){}}
function busy(){try{return!!(modalOn||G||(window.MG&&MG.on));}catch(e){return false;}}
function onHome(){try{var m=$('r3m');return!!(m&&m.style.display!=='none'&&$('scr-map').classList.contains('on'));}catch(e){return false;}}
function rebuild(){try{if(window.R3H&&onHome())R3H.build();}catch(e){}}
function whenFree(fn,lim,id){var t0=Date.now();(function tick(){if(id&&R3.off(id))return;if(!busy()&&onHome()){try{fn();}catch(e){}return;}
if(Date.now()-t0<(lim||9e4))setTimeout(tick,800);})();}
window.R3D={now:now,hour:hour,dk:dk,dkOf:dkOf,fnm:fnm,pnm:pnm,pid:pid,kg:kg,tap:tap,name:name,esc:esc_,give:give,giftTxt:giftTxt,giftIc:giftIc,giftBait:giftBait,giftHint:giftHint,giftZhor:giftZhor,giftCtx:giftCtx,NUMW:NUMW,tx:tx,txAny:txAny,txAt:txAt,lastId:lastId,dlg:dlg,busy:busy,onHome:onHome,rebuild:rebuild,whenFree:whenFree,_t:function(){return{vkTs:vkTs,dev0:dev0,now:now(),dk:dk(),h:hour()};}};})();